import { Dialogue } from '../types/types';
import { getEffectiveTranscriberName } from './transcriberUtils';

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
 * Gets the 'transcriber' param, ensuring it exists in the provided list of a pearl's transcribers.
 * This function understands the indexed naming scheme (e.g., 'transcriber-0').
 * If the URL param is missing or not found, it returns the effective name of the last available transcriber.
 */
export const getActiveTranscriber = (availableTranscribers: Dialogue[] = []): string | null => {
    if (!availableTranscribers.length) {
        return null;
    }

    const currentParam = getParam('transcriber');

    // Generate a list of all valid, effective names for this pearl
    const effectiveNames = availableTranscribers.map((t, i) =>
        getEffectiveTranscriberName(availableTranscribers, t.transcriber, i)
    );

    // If the param from the URL is a valid effective name, use it.
    if (currentParam && effectiveNames.includes(currentParam)) {
        return currentParam;
    }

    // Otherwise, default to the last transcriber in the list.
    return effectiveNames[effectiveNames.length - 1];
};

export const urlAccess = {
    getParam,
    setParam,
    clearParam,
    getActiveTranscriber
};
