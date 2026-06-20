/**
 * Inheritance database: lets a dataset inherit entry metadata from another (e.g. modded from vanilla).
 * Maps a base file id (filename without .txt) to the metadata parsed from the source dataset's file.
 */

import * as path from 'path';

import { Dataset, DATASETS, dialogueDirOf } from '../../lib/config';
import { filesByExtension, readText } from '../../lib/io';
import { Metadata, parseDialogueContent } from './parse';

const isSourceFile = (file: string) => file.replace(/\\/g, '/').includes('source/');

export function buildInheritanceDB(sourceKeys: string[]): Map<string, Metadata> {
    const db = new Map<string, Metadata>();
    for (const key of sourceKeys) {
        const dataset = DATASETS.find((d: Dataset) => d.key === key);
        if (!dataset) continue;
        for (const file of filesByExtension(dialogueDirOf(dataset), ['.txt'])) {
            if (isSourceFile(file)) continue;
            const { metadata } = parseDialogueContent(readText(file), { metadataOnly: true });
            db.set(path.basename(file, '.txt'), metadata);
        }
    }
    return db;
}
