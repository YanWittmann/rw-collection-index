let lastUpdate = 0;
let timeout: NodeJS.Timeout | null = null;
const pendingParams = new Map<string, string | null>(); // null means delete

const syncParams = () => {
    const currentParams = new URLSearchParams(window.location.search);

    // apply all pending changes
    pendingParams.forEach((value, key) => {
        if (value === null) {
            currentParams.delete(key);
        } else {
            currentParams.set(key, value);
        }
    });

    // update URL
    if (currentParams.toString()) {
        window.history.replaceState(null, '', `?${currentParams}`);
    } else {
        window.history.replaceState(null, '', window.location.pathname);
    }

    // reset state
    pendingParams.clear();
    lastUpdate = Date.now();
    timeout = null;
};

export const getParam = (key: string) => {
    return new URLSearchParams(window.location.search).get(key);
};

export const setParam = (key: string, value: string) => {
    pendingParams.set(key, value);
    scheduleUpdate();
};

export const clearParam = (key: string) => {
    pendingParams.set(key, null);
    scheduleUpdate();
};

const scheduleUpdate = () => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdate;

    if (timeSinceLastUpdate >= 500) {
        timeout = setTimeout(syncParams, 0);
    } else if (!timeout) {
        timeout = setTimeout(syncParams, 500 - timeSinceLastUpdate);
    }
};

/**
 * Gets the 'transcriber' param, ensuring it exists in the provided list.
 * If the URL param is missing or not found in the list, it returns the first available transcriber.
 */
export const getActiveTranscriber = (availableTranscribers: { transcriber: string }[] = []) => {
    const currentParam = getParam('transcriber');

    if (currentParam && availableTranscribers.some(t => t.transcriber === currentParam)) {
        return currentParam;
    }

    return availableTranscribers[availableTranscribers.length - 1]?.transcriber;
};

export const urlAccess = {
    getParam,
    setParam,
    clearParam,
    getActiveTranscriber
};
