/**
 * Phase: application bundle.
 * Delegates to craco (CRA) to build the React app into build/.
 * The image format is passed through the environment so the emitted bundle requests the same image extension the image phase will produce.
 *
 * in   src/, public/ (including the data and images produced earlier)
 * out  build/
 */

import { spawnSync } from 'child_process';

import { SITE_DIR } from '../lib/config';
import { phase } from '../lib/log';

export function runBundle(): void {
    const log = phase('bundle');
    log.reads('src/, public/');
    log.note(`craco build (REACT_APP_IMG_FORMAT=${process.env.REACT_APP_IMG_FORMAT || 'original'})`);

    const result = spawnSync('npx craco build', {
        cwd: SITE_DIR,
        stdio: 'inherit',
        env: process.env,
        shell: true,
    });

    if (result.status !== 0) {
        throw new Error(`craco build failed with exit code ${result.status}.`);
    }

    log.writes('build/');
    log.done();
}
