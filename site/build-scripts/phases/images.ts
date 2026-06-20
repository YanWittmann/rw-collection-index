/**
 * Phase: image optimization.
 * Re-encodes the compressed image directories (BUILD_COMPRESS_IMG_DIRS) to WebP and removes the originals, so the
 * deploy ships the smaller files the runtime URLs and static HTML already point at (REACT_APP_IMG_FORMAT=webp).
 *
 * in   build/img/<COMPRESSED_IMG_DIRS>/**\/*.{png,jpg,jpeg}
 * out  the same files as .webp (originals removed)
 */

import * as fs from 'fs';

import { BUILD_COMPRESS_IMG_DIRS } from '../lib/config';
import { filesByExtension, totalSize } from '../lib/io';
import { fmtBytes, phase } from '../lib/log';
import { COMPRESS_PRESETS, compressToFile } from '../lib/imageCompress';

export type ImageMode = 'lossy' | 'lossless';

export async function runImages(mode: ImageMode = 'lossy'): Promise<void> {
    const log = phase('images');

    const dirs = BUILD_COMPRESS_IMG_DIRS.filter(fs.existsSync);
    if (!dirs.length) {
        log.note('no compressed image directories present, nothing to optimize');
        log.done();
        return;
    }

    const preset = COMPRESS_PRESETS[mode === 'lossless' ? 'webp-lossless' : 'webp-lossy'];
    const sources = dirs.flatMap(dir => filesByExtension(dir, ['.png', '.jpg', '.jpeg']));
    const sizeBefore = totalSize(sources);
    log.reads(`${dirs.length} image dir(s) (${sources.length} raster images, ${fmtBytes(sizeBefore)})`);
    log.note(`encoding WebP (${mode})`);

    const dests: string[] = [];
    const failures: string[] = [];
    for (const src of sources) {
        const dest = src.replace(/\.(png|jpe?g)$/i, '.webp');
        try {
            await compressToFile(src, dest, preset);
            fs.rmSync(src);
            dests.push(dest);
        } catch {
            failures.push(src);
        }
    }

    if (failures.length) {
        throw new Error(`Image optimization failed for ${failures.length} file(s):\n  - ${failures.slice(0, 5).join('\n  - ')}`);
    }

    const sizeAfter = totalSize(dests);
    log.writes(`${dests.length} WebP images`);
    log.done(`${fmtBytes(sizeBefore)} -> ${fmtBytes(sizeAfter)} (${(100 * (1 - sizeAfter / sizeBefore)).toFixed(0)}% smaller)`);
}
