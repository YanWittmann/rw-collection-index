import { PearlData } from "../types/types";

const getKey = (...parts: string[]): string => {
    return `rw-unlock-${parts.join('-')}`;
};

const UnlockManager = {
    isPearlUnlocked(pearl: PearlData): boolean {
        const key = getKey('pearl', pearl.id);
        return localStorage.getItem(key) === 'true';
    },

    unlockPearl(pearl: PearlData): void {
        const key = getKey('pearl', pearl.id);
        localStorage.setItem(key, 'true');
    },

    isTranscriptionUnlocked(pearl: PearlData, name: string): boolean {
        const key = getKey('transcription', pearl.id, name);
        return localStorage.getItem(key) === 'true';
    },

    unlockTranscription(pearl: PearlData, name: string): void {
        const key = getKey('transcription', pearl.id, name);
        localStorage.setItem(key, 'true');
    },

    reset(): void {
        Object.keys(localStorage).forEach((key) => {
            if (key.startsWith('rw-unlock-')) {
                localStorage.removeItem(key);
            }
        });
    },
};

export default UnlockManager;