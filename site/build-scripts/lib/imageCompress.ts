/**
 * One image compressor for the whole pipeline, backed by sharp.
 * Both the image-optimization phase and the OG image generator call this with a named preset, so
 * format, quality and palette choices live in one place and can be retuned (or swapped to a different
 * format entirely) without touching the callers.
 */

import * as path from 'path';
import sharp from 'sharp';

import { ensureDir } from './io';

export type ImageFormatName = 'webp' | 'png' | 'jpeg' | 'avif';

export interface CompressOptions {
    format: ImageFormatName;
    /** Lossy quality for webp/jpeg/avif (0-100). */
    quality?: number;
    /** webp only: lossless mode (ignores quality). */
    lossless?: boolean;
    /** Encoder effort, where the format supports it (webp/png/avif). */
    effort?: number;
    /** png only: write an indexed (palette) PNG, which is tiny for flat, few-colour images. */
    palette?: boolean;
    /** png palette size when palette is on (<= 256). */
    colors?: number;
    /** Optional downscale applied before encoding. */
    resize?: { width?: number; height?: number; fit?: keyof sharp.FitEnum };
}

/**
 * Named strategies. Callers pick one by name; this is the only place the actual numbers live.
 * Swap a preset's format here and every caller follows.
 */
export const COMPRESS_PRESETS = {
    'webp-lossy': { format: 'webp', quality: 90, effort: 6 },
    'webp-lossless': { format: 'webp', lossless: true, effort: 6 },
    // Social cards are mostly flat colour plus a few pixel-art icons, so an indexed PNG is both tiny and unfurler-safe.
    // 256 (not 128) colours: the large antialiased title eats the budget, and at 128 the pale item-icon colours get
    // merged into the greys and the icon comes out monochrome. 256 keeps the icons in colour and is still far smaller than full-colour.
    'og-card': { format: 'png', palette: true, colors: 256, effort: 8 },
    // Cards that embed a content image can't share a 128-colour budget without wrecking both the photo and the
    // chrome, so those render as a full-colour PNG instead (larger, but the colours stay intact).
    'og-card-photo': { format: 'png', palette: false, effort: 8 },
} satisfies Record<string, CompressOptions>;

export type PresetName = keyof typeof COMPRESS_PRESETS;

/** File extension (with dot) for a format, e.g. "webp" -> ".webp", "jpeg" -> ".jpg". */
export function extensionFor(format: ImageFormatName): string {
    return format === 'jpeg' ? '.jpg' : `.${format}`;
}

function encode(input: Buffer | string, o: CompressOptions): sharp.Sharp {
    let s = sharp(input, { animated: false });
    if (o.resize) s = s.resize({ ...o.resize });
    switch (o.format) {
        case 'webp':
            return s.webp({ quality: o.quality ?? 90, lossless: o.lossless ?? false, effort: o.effort ?? 6 });
        case 'png':
            return s.png({ palette: o.palette ?? false, colors: o.colors, effort: o.effort ?? 7, compressionLevel: 9 });
        case 'jpeg':
            return s.jpeg({ quality: o.quality ?? 82, mozjpeg: true });
        case 'avif':
            return s.avif({ quality: o.quality ?? 50, effort: o.effort ?? 4 });
    }
}

/** Compress raw image bytes (or a source file) into an encoded buffer. */
export function compressToBuffer(input: Buffer | string, options: CompressOptions): Promise<Buffer> {
    return encode(input, options).toBuffer();
}

/** Compress a source file straight to a destination file, creating the directory as needed. */
export async function compressToFile(src: string, dest: string, options: CompressOptions): Promise<void> {
    ensureDir(path.dirname(dest));
    await encode(src, options).toFile(dest);
}
