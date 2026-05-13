import { ParseFileResult } from '../types/SaveModel';

let readyPromise: Promise<void> | null = null;

export function loadWasm(): Promise<void> {
    if (readyPromise) return readyPromise;
    readyPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('WASM load timeout')), 30000);
        document.addEventListener('rwReady', () => {
            clearTimeout(timeout);
            resolve();
        }, { once: true });
        const script = document.createElement('script');
        script.src = '/wasm/rw-save-file-editor.js';
        script.onerror = () => {
            clearTimeout(timeout);
            reject(new Error('Failed to load WASM script'));
        };
        document.head.appendChild(script);
    });
    return readyPromise;
}

export async function parseSaveFile(xml: string): Promise<ParseFileResult> {
    await loadWasm();
    const raw = (globalThis as any)['rw-save-file-editor'];
    const api = typeof raw?.then === 'function' ? await raw : raw;
    return JSON.parse(api.parseFile(xml)) as ParseFileResult;
}
