declare global {
    interface Window { __RW_COUNT__?: (key: string) => void; }
}

export function count(key: string): void {
    window.__RW_COUNT__?.(key);
}
