import { ParseFileResult } from '../types/SaveModel';

let readyPromise: Promise<void> | null = null;

export function loadWasm(): Promise<void> {
    if (readyPromise) return readyPromise;
    const p: Promise<void> = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('WASM load timeout')), 30000);

        // The pre-built wasm JS uses webpack publicPath "/" which resolves .wasm fetches
        // to the origin root, breaking sub-path deployments (e.g. GitHub Pages).
        // Intercept any absolute-path .wasm fetch and prepend the CRA public base.
        const base = process.env.PUBLIC_URL || '';
        const originalFetch = window.fetch.bind(window);
        window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
            if (typeof input === 'string' && input.startsWith('/') && input.endsWith('.wasm')) {
                input = base + input;
            }
            return originalFetch(input, init);
        };
        const restoreFetch = () => { window.fetch = originalFetch; };

        document.addEventListener('rwReady', () => {
            restoreFetch();
            clearTimeout(timeout);
            resolve();
        }, { once: true });

        const script = document.createElement('script');
        script.src = process.env.PUBLIC_URL + '/wasm/rw-save-file-editor.js';
        script.onerror = () => {
            restoreFetch();
            clearTimeout(timeout);
            reject(new Error('Failed to load WASM script'));
        };
        document.head.appendChild(script);
    });
    p.catch(() => { readyPromise = null; });
    readyPromise = p;
    return p;
}

export async function parseSaveFile(xml: string): Promise<ParseFileResult> {
    await loadWasm();
    const raw = (globalThis as any)['rw-save-file-editor'];
    const api = typeof raw?.then === 'function' ? await raw : raw;
    return JSON.parse(api.parseFile(xml)) as ParseFileResult;
}
