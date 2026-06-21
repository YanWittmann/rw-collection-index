/**
 * Build pipeline entry point. One CLI that directs the individual phases.
 * See PIPELINE.txt (next to this file) for what each phase reads, writes and how they feed each other.
 *
 *   tsx build-scripts/build.ts data    [--profile vanilla|modded|all] [--sourceFiles] [--watch]
 *   tsx build-scripts/build.ts bundle
 *   tsx build-scripts/build.ts routes
 *   tsx build-scripts/build.ts og      [--entries "[<dataset>/]<id>[:<transcriber>], ..."] [--dataset vanilla] [--out DIR] [--no-cache]
 *   tsx build-scripts/build.ts images  [--mode lossy|lossless]
 *   tsx build-scripts/build.ts all     [--mode lossy|lossless] [--no-images] [--no-og]
 *
 * "all" is the deployable build: dialogue data -> app bundle -> static routes -> OG cards -> image optimization.
 */

import { Dataset, DATASETS, DEFAULT_DATASET_KEY } from './lib/config';
import { runData } from './phases/data';
import { runBundle } from './phases/bundle';
import { runRoutes } from './phases/routes';
import { OgEntrySpec, runOg } from './phases/og';
import { ImageMode, runImages } from './phases/images';

const [command, ...args] = process.argv.slice(2);

const has = (name: string) => args.includes(`--${name}`);
const value = (name: string, fallback: string): string => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

function selectProfiles(): Dataset[] {
    const profile = value('profile', 'all');
    if (profile === 'all') return DATASETS;
    const dataset = DATASETS.find(d => d.key === profile);
    if (!dataset) throw new Error(`Unknown profile "${profile}". Known: ${DATASETS.map(d => d.key).join(', ')}, all.`);
    return [dataset];
}

function imageMode(): ImageMode {
    const mode = value('mode', 'lossy');
    if (mode !== 'lossy' && mode !== 'lossless') throw new Error(`Unknown image mode "${mode}". Use lossy or lossless.`);
    return mode;
}

/**
 * Parse --entries "Pearl_X:LttM, modded/KF_Pearl_1" into specs for the OG test harness.
 * Each token is [dataset/]entryId[:transcriber]. The optional dataset prefix overrides --dataset
 * for that one entry, so vanilla and modded entries can be mixed in a single run.
 */
function parseOgEntries(): OgEntrySpec[] {
    const defaultKey = value('dataset', DEFAULT_DATASET_KEY);
    return value('entries', '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
        .map(token => {
            const slash = token.indexOf('/');
            const datasetKey = slash >= 0 ? token.slice(0, slash).trim() : defaultKey;
            const rest = slash >= 0 ? token.slice(slash + 1).trim() : token;
            const [entryId, transcriberName] = rest.split(':').map(p => p.trim());
            return { datasetKey, entryId, transcriberName: transcriberName || null };
        });
}

async function runAll(): Promise<void> {
    const optimize = !has('no-images');
    // Tell the bundle and the routes phase which image extension will actually ship.
    if (optimize) process.env.REACT_APP_IMG_FORMAT = 'webp';

    // Source matching runs for the root dataset only, and non-default datasets build first so the shared public/img/src ends up holding the root dataset's source images.
    const root = DATASETS.find(d => d.key === DEFAULT_DATASET_KEY)!;
    const others = DATASETS.filter(d => d !== root);

    if (others.length) runData({ profiles: others, sourceFiles: false, watch: false });
    runData({ profiles: [root], sourceFiles: true, watch: false });

    runBundle();
    runRoutes();
    if (!has('no-og')) await runOg();
    if (optimize) await runImages(imageMode());
}

async function main(): Promise<void> {
    switch (command) {
        case 'data':
            runData({ profiles: selectProfiles(), sourceFiles: has('sourceFiles'), watch: has('watch') });
            break;
        case 'bundle':
            runBundle();
            break;
        case 'routes':
            runRoutes();
            break;
        case 'og':
            await runOg({ entries: parseOgEntries(), out: value('out', ''), noCache: has('no-cache') });
            break;
        case 'images':
            await runImages(imageMode());
            break;
        case 'all':
        case undefined:
            await runAll();
            break;
        default:
            throw new Error(`Unknown command "${command}". Use data, bundle, routes, og, images or all.`);
    }
}

main().catch(error => {
    console.error(`\nBuild failed: ${(error as Error).message}`);
    process.exit(1);
});
