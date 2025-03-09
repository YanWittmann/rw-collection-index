import { PearlData } from "../types/types";

const getKey = (...parts: string[]): string => {
    return `rw-unlock-${parts.join('-')}`;
};

const cache = new Map<string, string>();

const dispatchUnlockEvent = () => {
    window.dispatchEvent(new Event('unlock-state-changed'));
};

const syncLocalStorage = (() => {
    let timeout: NodeJS.Timeout | null = null;
    return () => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
            cache.forEach((value, key) => {
                localStorage.setItem(key, value);
            });
            dispatchUnlockEvent();
            timeout = null;
        }, 100);
    };
})();

const UnlockManager = {
    isPearlUnlocked(pearl: PearlData): boolean {
        const key = getKey('pearl', pearl.id);
        return cache.get(key) === 'true' || localStorage.getItem(key) === 'true';
    },

    unlockPearl(pearl: PearlData): void {
        const key = getKey('pearl', pearl.id);
        cache.set(key, 'true');
        syncLocalStorage();
    },

    isTranscriptionUnlocked(pearl: PearlData, name: string): boolean {
        const key = getKey('transcription', pearl.id, name);
        return cache.get(key) === 'true' || localStorage.getItem(key) === 'true';
    },

    unlockTranscription(pearl: PearlData, name: string): void {
        const key = getKey('transcription', pearl.id, name);
        cache.set(key, 'true');
        syncLocalStorage();
    },

    reset(): void {
        cache.clear();
        Object.keys(localStorage).forEach((key) => {
            if (key.startsWith('rw-unlock-')) {
                localStorage.removeItem(key);
            }
        });
        dispatchUnlockEvent();
    },
};

export default UnlockManager;