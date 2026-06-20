/**
 * Phase: dialogue data generation.
 * For each dataset it publishes source assets, then parses every dialogue .txt into the parsed-dialogues JSON the app and the routes phase consume.
 *
 * in   the dataset's dialogue folder: its .txt files plus source/decrypted.json and source/img
 * out  public/data/parsed-dialogues{suffix}.json, public/data/source-decrypted{suffix}.json, public/img/src
 */

import * as path from 'path';
import { watch } from 'chokidar';

import { Dataset, dialogueDirOf, parsedDialoguesFile } from '../../lib/config';
import { filesByExtension, readText, writeJson } from '../../lib/io';
import { phase } from '../../lib/log';
import { parseDialogueContent, SourceMatcher } from './parse';
import { Entry, expandEntries } from './variables';
import { buildInheritanceDB } from './inheritance';
import { createSourceMatcher } from './source-match';
import { publishSourceAssets } from './assets';
import { postProcessTags } from './tags';

const isSourceFile = (file: string) => file.replace(/\\/g, '/').includes('source/');

export interface DataOptions {
    profiles: Dataset[];
    sourceFiles: boolean;
    watch: boolean;
}

function generate(dataset: Dataset, inheritanceDB: Map<string, any>, matcher: SourceMatcher | null): Entry[] {
    const files = filesByExtension(dialogueDirOf(dataset), ['.txt']).filter(file => !isSourceFile(file));
    const entries = files.flatMap(file => {
        const parsed = parseDialogueContent(readText(file), { inheritanceDB, matchSource: matcher });
        return expandEntries(path.basename(file, '.txt'), parsed);
    });
    entries.forEach(postProcessTags);
    writeJson(parsedDialoguesFile(dataset), entries);
    return entries;
}

function processDataset(dataset: Dataset, sourceFiles: boolean): () => void {
    const log = phase(`data:${dataset.key}`);

    const dir = dialogueDirOf(dataset);
    const assets = publishSourceAssets(dataset);
    log.reads(`${path.relative(process.cwd(), dir)} (.txt + source/)`);
    log.writes(`public/img/src (${assets.imageCount} images), ${path.basename(assets.decryptedDest)}`);

    const inheritanceDB = buildInheritanceDB(dataset.inheritanceSources || []);
    if (inheritanceDB.size) log.note(`inheritance from [${(dataset.inheritanceSources || []).join(', ')}]: ${inheritanceDB.size} entries`);

    const matcher = sourceFiles ? createSourceMatcher(path.join(dir, 'source', 'decrypted.json')) : null;
    if (matcher) log.note('source matching enabled (--sourceFiles)');

    const run = () => generate(dataset, inheritanceDB, matcher);
    const entries = run();

    log.writes(`${path.basename(parsedDialoguesFile(dataset))}`);
    log.done(`${entries.length} entries`);

    return run;
}

export function runData(options: DataOptions): void {
    const runners = new Map<string, () => void>();
    for (const dataset of options.profiles) {
        runners.set(dataset.key, processDataset(dataset, options.sourceFiles));
    }

    if (!options.watch) return;

    for (const dataset of options.profiles) {
        const dir = dialogueDirOf(dataset);
        const log = phase(`data:watch:${dataset.key}`);
        log.note(`watching ${path.relative(process.cwd(), dir)} for .txt changes`);
        watch(dir, { persistent: true, ignoreInitial: true, depth: 99 }).on('all', (_event, file) => {
            if (!file.endsWith('.txt')) return;
            console.log(`Detected change in ${file}. Re-generating ${dataset.key}...`);
            runners.get(dataset.key)!();
        });
    }
}
