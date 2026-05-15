import { SaveCollectibles } from './saveCollectibles';

export interface SaveUnlockEval {
    evaluate(expression: string, ctx: { collectibles: SaveCollectibles; verbose?: boolean }): boolean;
}

// Mirrors the pattern of wasmLoader.ts: one cached promise, loaded on demand.
// The dynamic import creates a webpack split chunk — antlr4 runtime stays out of the main bundle.
let loaderPromise: Promise<SaveUnlockEval> | null = null;

export function loadSaveUnlockEvaluator(): Promise<SaveUnlockEval> {
    if (!loaderPromise) {
        loaderPromise = import('./saveUnlockEvaluator').then(mod => ({
            evaluate: mod.evaluate,
        }));
    }
    return loaderPromise;
}
