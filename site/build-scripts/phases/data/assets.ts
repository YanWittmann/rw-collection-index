/**
 * Publishes a dataset's game-source assets into public/ so the app can serve them.
 * Copies the decrypted text dump and replaces the shared public/img/src image folder.
 */

import * as fs from 'fs';
import * as path from 'path';

import { Dataset, dialogueDirOf, PUBLIC_IMG_DIR, sourceDecryptedFile } from '../../lib/config';
import { ensureDir, replaceDir } from '../../lib/io';

export interface AssetResult {
    decryptedDest: string;
    imageCount: number;
}

export function publishSourceAssets(dataset: Dataset): AssetResult {
    const sourceDir = path.join(dialogueDirOf(dataset), 'source');

    const decryptedDest = sourceDecryptedFile(dataset);
    ensureDir(path.dirname(decryptedDest));
    fs.copyFileSync(path.join(sourceDir, 'decrypted.json'), decryptedDest);

    const imageSrc = path.join(sourceDir, 'img');
    const imageDest = path.join(PUBLIC_IMG_DIR, 'src');
    replaceDir(imageSrc, imageDest);
    const imageCount = fs.readdirSync(imageSrc, { recursive: true } as any)
        .filter((e: any) => typeof e === 'string').length;

    return { decryptedDest, imageCount };
}
