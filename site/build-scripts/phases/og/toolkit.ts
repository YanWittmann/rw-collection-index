/**
 * The OG drawing toolkit: everything around the drawing, so layout.ts can stay pure design.
 * It hands out three kinds of help and otherwise stays out of the way, letting layout.ts draw on
 * the real Skia 2D context directly:
 *   - sprites: ready-to-paste, recoloured, sized icons (the entry icon, the transcriber icon),
 *   - geometry: anchors, insets and grids that return plain rectangles you draw into yourself,
 *   - text: the one helper that draws, because wrapping and truncation must measure against the context.
 */

import * as fs from 'fs';
import * as path from 'path';
import { type Canvas, createCanvas, GlobalFonts, type Image, loadImage, type SKRSContext2D } from '@napi-rs/canvas';

import { PUBLIC_DIR, PUBLIC_IMG_DIR, SITE_DIR } from '../../lib/config';
import type { GameAsset } from '../../../src/app/utils/assetUtils';
import type { Dialogue, PearlData } from '../../../src/app/types/types';
import { getEntryIcon, getTranscriberIcon } from '../../../src/app/utils/transcriberUtils';

export type Ctx = SKRSContext2D;

// --- fonts ------------------------------------------------------------------
// The site display face (Rodondo) and body face (Segoe UI Semibold), registered once under short names.

export const FONT_DISPLAY = 'Rodondo';
export const FONT_BODY = 'Segoe';

let fontsRegistered = false;

export function registerFonts(): void {
    if (fontsRegistered) return;
    GlobalFonts.registerFromPath(path.join(PUBLIC_DIR, 'font', 'Rodondo.otf'), FONT_DISPLAY);
    GlobalFonts.registerFromPath(path.join(PUBLIC_DIR, 'font', 'Segoe-UI-Semibold.ttf'), FONT_BODY);
    fontsRegistered = true;
}

// --- geometry ---------------------------------------------------------------

export interface Rect {
    x: number;
    y: number;
    w: number;
    h: number
}

/** The column count that makes the largest square-ish cells for this area and item count (fills wide areas well). */
function bestCols(area: Rect, count: number, gap: number): number {
    let best = 1;
    let bestSize = -1;
    for (let cols = 1; cols <= count; cols++) {
        const rows = Math.ceil(count / cols);
        const cellW = (area.w - gap * (cols - 1)) / cols;
        const cellH = (area.h - gap * (rows - 1)) / rows;
        const size = Math.min(cellW, cellH);
        if (size > bestSize) {
            bestSize = size;
            best = cols;
        }
    }
    return best;
}

/**
 * Split an area into cells for `count` items, picking the column count that maximises cell size when not told.
 * Returns one rectangle per item; you draw whatever you like into each.
 */
export function grid(area: Rect, count: number, opts: { cols?: number; gap?: number } = {}): Rect[] {
    if (count <= 0) return [];
    const gap = opts.gap ?? 12;
    const cols = opts.cols ?? bestCols(area, count, gap);
    const rows = Math.ceil(count / cols);
    const cellW = (area.w - gap * (cols - 1)) / cols;
    const cellH = (area.h - gap * (rows - 1)) / rows;
    const cells: Rect[] = [];
    for (let i = 0; i < count; i++) {
        const c = i % cols;
        const r = Math.floor(i / cols);
        cells.push({ x: area.x + c * (cellW + gap), y: area.y + r * (cellH + gap), w: cellW, h: cellH });
    }
    return cells;
}

// --- sprites ----------------------------------------------------------------

const imageCache = new Map<string, Image | null>();

/** Mirror of resolveAssetUrl's path rule: keep directories, default to .png when the leaf has no extension. */
export function iconFilePath(src: string): string {
    const leaf = src.split('/').pop() ?? src;
    const rel = leaf.includes('.') ? src : `${src}.png`;
    return path.join(PUBLIC_IMG_DIR, rel);
}

async function loadIcon(src: string): Promise<Image | null> {
    const file = iconFilePath(src);
    if (imageCache.has(file)) return imageCache.get(file)!;
    const img = fs.existsSync(file) ? await loadImage(file) : null;
    imageCache.set(file, img);
    return img;
}

/** Paint a solid colour through the icon's luminance, matching RwAsset's mask mode. */
function maskFill(ctx: Ctx, w: number, h: number, hex: string): void {
    const id = ctx.getImageData(0, 0, w, h);
    const d = id.data;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    for (let i = 0; i < d.length; i += 4) {
        const lum = (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255;
        d[i] = r;
        d[i + 1] = g;
        d[i + 2] = b;
        d[i + 3] = Math.round(d[i + 3] * lum);
    }
    ctx.putImageData(id, 0, 0);
}

/**
 * Draw a GameAsset into a fresh square canvas of the given size, ready to ctx.drawImage anywhere.
 * Honours the asset's own tint (mask = recolour, otherwise natural), exactly as the app renders it.
 * Returns null when the icon file is missing, so the layout can simply skip it.
 */
export async function sprite(asset: GameAsset, size: number): Promise<Canvas | null> {
    const img = await loadIcon(asset.src);
    if (!img) return null;
    const c = createCanvas(size, size);
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    const scale = Math.min(size / img.width, size / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
    // Mask-recolour only when the entry has a real colour; entries with "None" (or any non-hex) keep the natural icon, as the app does.
    if (asset.tint?.mode === 'mask' && /^#[0-9a-fA-F]{6}$/.test(asset.tint.color)) maskFill(ctx, size, size, asset.tint.color);
    return c;
}

/** The entry's icon sprite, rendered exactly as the app does: getEntryIcon's tint masks white pearls/broadcasts, while items (null colour) carry no tint and keep their natural full-colour art. */
export function entrySprite(pearl: PearlData, size: number): Promise<Canvas | null> {
    return sprite(getEntryIcon(pearl).asset, size);
}

/** The transcriber's icon sprite, resolved exactly as the app's transcriber selector does. */
export function transcriberSprite(pearl: PearlData, transcriber: Dialogue, size: number): Promise<Canvas | null> {
    return sprite(getTranscriberIcon(transcriber, pearl).asset, size);
}

/** Draw a sprite (which may be null) so layouts can place icons without null checks. */
export function drawSprite(ctx: Ctx, spr: Canvas | null, x: number, y: number): void {
    if (!spr) return;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(spr, x, y);
}

/** Load a content image (e.g. a dialogue frame "PearlReader/ABSTRACT.png") as-is, or null if missing. */
export function texture(src: string): Promise<Image | null> {
    return loadIcon(src);
}

const OG_ASSET_DIR = path.join(SITE_DIR, 'build-scripts', 'phases', 'og', 'assets');

/** Load an OG-only build asset from designs' assets/ folder (background art etc.), cached, or null if missing. */
export async function loadAsset(rel: string): Promise<Image | null> {
    const file = path.join(OG_ASSET_DIR, rel);
    if (imageCache.has(file)) return imageCache.get(file)!;
    const img = fs.existsSync(file) ? await loadImage(file) : null;
    imageCache.set(file, img);
    return img;
}

/** The centered rectangle that fits a source of the given size inside a box without distortion. */
export function containRect(srcW: number, srcH: number, box: Rect): Rect {
    const scale = Math.min(box.w / srcW, box.h / srcH);
    const w = srcW * scale;
    const h = srcH * scale;
    return { x: box.x + (box.w - w) / 2, y: box.y + (box.h - h) / 2, w, h };
}

/** The centered rectangle that fills a box with a source, cropping the overflow (background art). */
export function coverRect(srcW: number, srcH: number, box: Rect): Rect {
    const scale = Math.max(box.w / srcW, box.h / srcH);
    const w = srcW * scale;
    const h = srcH * scale;
    return { x: box.x + (box.w - w) / 2, y: box.y + (box.h - h) / 2, w, h };
}

// --- text -------------------------------------------------------------------

const NAMED_ENTITIES: Record<string, string> = { lt: '<', gt: '>', amp: '&', quot: '"', apos: "'", nbsp: ' ' };

/**
 * Decode HTML entities to their characters for canvas text, which has no HTML parser to do it.
 * Run this after any markup stripping so a decoded "<x>" is not then mistaken for a tag and removed.
 */
export function decodeEntities(text: string): string {
    return text.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (m, code: string) => {
        if (code[0] === '#') {
            const cp = code[1] === 'x' || code[1] === 'X' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
            return Number.isFinite(cp) ? String.fromCodePoint(cp) : m;
        }
        return NAMED_ENTITIES[code] ?? m;
    });
}

export interface TextOptions {
    size: number;
    color: string;
    font?: string;
    align?: 'left' | 'center' | 'right';
    /** Line height as a multiple of size (default 1.25). */
    lineHeight?: number;
    /** Stop after this many lines; the last line is ellipsised if more text remains. */
    maxLines?: number;
    /** Clamp by height instead of a line count; turned into a line limit (maxLines wins if both are set). */
    maxHeight?: number;
    /** Stretch every line but the last to the full width by spacing words evenly (left align only). */
    justify?: boolean;
}

/** A wrapped, clamped block of text: ready to draw, and measured so callers can flow elements below it. */
export interface TextLayout {
    lines: string[];
    /** Pixels per line (size * lineHeight). */
    lineHeight: number;
    /** Total block height (lines * lineHeight). */
    height: number;
    /** Widest measured line. */
    width: number;
}

function wrap(ctx: Ctx, text: string, maxWidth: number): string[] {
    const lines: string[] = [];
    for (const paragraph of text.split('\n')) {
        const words = paragraph.split(/\s+/).filter(Boolean);
        let line = '';
        for (const word of words) {
            const candidate = line ? `${line} ${word}` : word;
            if (ctx.measureText(candidate).width <= maxWidth || !line) {
                line = candidate;
            } else {
                lines.push(line);
                line = word;
            }
        }
        lines.push(line);
    }
    return lines;
}

function ellipsize(ctx: Ctx, line: string, maxWidth: number): string {
    if (ctx.measureText(line).width <= maxWidth) return line;
    let text = line;
    while (text && ctx.measureText(`${text}…`).width > maxWidth) text = text.slice(0, -1).trimEnd();
    return `${text}…`;
}

function lineLimit(o: TextOptions, lineHeight: number): number | undefined {
    if (o.maxLines) return o.maxLines;
    if (o.maxHeight) return Math.max(1, Math.floor(o.maxHeight / lineHeight));
    return undefined;
}

/**
 * Wrap and clamp text to a width without drawing, returning the laid-out lines and their total height.
 * Use this when an element's position depends on how tall the text turns out (e.g. a subtitle under a wrapping title).
 */
export function measureText(ctx: Ctx, text: string, width: number, o: TextOptions): TextLayout {
    ctx.font = `${o.size}px ${o.font ?? FONT_BODY}`;
    const lineHeight = o.size * (o.lineHeight ?? 1.25);
    let lines = wrap(ctx, text, width);
    const limit = lineLimit(o, lineHeight);
    if (limit && lines.length > limit) {
        lines = lines.slice(0, limit);
        lines[lines.length - 1] = ellipsize(ctx, `${lines[lines.length - 1]} …`, width);
    }
    const w = lines.reduce((m, l) => Math.max(m, ctx.measureText(l).width), 0);
    return { lines, lineHeight, height: lines.length * lineHeight, width: w };
}

function drawJustifiedLine(ctx: Ctx, line: string, x: number, y: number, width: number, last: boolean): void {
    ctx.textAlign = 'left';
    const words = line.split(/\s+/).filter(Boolean);
    if (last || words.length < 2) {
        ctx.fillText(line, x, y);
        return;
    }
    const wordsWidth = words.reduce((s, w) => s + ctx.measureText(w).width, 0);
    const gap = (width - wordsWidth) / (words.length - 1);
    let cx = x;
    for (const word of words) {
        ctx.fillText(word, cx, y);
        cx += ctx.measureText(word).width + gap;
    }
}

/** Draw an already-measured layout, aligned within box.x..box.x+box.w, top at box.y. */
export function drawTextLayout(ctx: Ctx, layout: TextLayout, box: Rect, o: TextOptions): void {
    ctx.font = `${o.size}px ${o.font ?? FONT_BODY}`;
    ctx.fillStyle = o.color;
    ctx.textBaseline = 'top';
    const align = o.align ?? 'left';
    if (o.justify && align === 'left') {
        ctx.textAlign = 'left';
        layout.lines.forEach((line, i) =>
            drawJustifiedLine(ctx, line, box.x, box.y + i * layout.lineHeight, box.w, i === layout.lines.length - 1));
        return;
    }
    ctx.textAlign = align;
    const tx = align === 'center' ? box.x + box.w / 2 : align === 'right' ? box.x + box.w : box.x;
    layout.lines.forEach((line, i) => ctx.fillText(line, tx, box.y + i * layout.lineHeight));
}

/**
 * Draw a string into a box: wrap to its width, clamp to the box height (or maxLines/maxHeight), ellipsise when cut.
 * Returns the total height drawn, so layouts can flow content below it.
 */
export function drawText(ctx: Ctx, text: string, box: Rect, o: TextOptions): number {
    const clamp = o.maxLines || o.maxHeight ? o : { ...o, maxHeight: box.h };
    const layout = measureText(ctx, text, box.w, clamp);
    drawTextLayout(ctx, layout, box, o);
    return layout.height;
}

/**
 * The tight height of a block of lines, measured by real glyph extent (ascent of the first line, descent of the
 * last) rather than line-box leading. Use it to pack a title and subtitle close without the font's padding.
 */
export function tightLinesHeight(ctx: Ctx, lines: string[], o: TextOptions): number {
    ctx.font = `${o.size}px ${o.font ?? FONT_BODY}`;
    const lh = o.size * (o.lineHeight ?? 1.06);
    const ascent = ctx.measureText(lines[0] ?? '').actualBoundingBoxAscent;
    const descent = ctx.measureText(lines[lines.length - 1] ?? '').actualBoundingBoxDescent;
    return ascent + (lines.length - 1) * lh + descent;
}

/** Draw lines with their glyphs starting exactly at `top` (no leading above), returning the tight height drawn. */
export function drawTightLines(ctx: Ctx, lines: string[], x: number, top: number, width: number, o: TextOptions): number {
    ctx.font = `${o.size}px ${o.font ?? FONT_BODY}`;
    ctx.fillStyle = o.color;
    ctx.textBaseline = 'alphabetic';
    const align = o.align ?? 'left';
    ctx.textAlign = align;
    const lh = o.size * (o.lineHeight ?? 1.06);
    const ascent = ctx.measureText(lines[0] ?? '').actualBoundingBoxAscent;
    const tx = align === 'center' ? x + width / 2 : align === 'right' ? x + width : x;
    let baseline = top + ascent;
    for (const line of lines) {
        ctx.fillText(line, tx, baseline);
        baseline += lh;
    }
    const descent = ctx.measureText(lines[lines.length - 1] ?? '').actualBoundingBoxDescent;
    return ascent + (lines.length - 1) * lh + descent;
}

/** The largest font size in [min, max] (stepping by 2) at which the text wraps within maxLines, for headline auto-fit. */
export function fitFontSize(ctx: Ctx, text: string, width: number, o: {
    font?: string;
    min: number;
    max: number;
    maxLines: number
}): number {
    for (let size = o.max; size > o.min; size -= 2) {
        ctx.font = `${size}px ${o.font ?? FONT_BODY}`;
        if (wrap(ctx, text, width).length <= o.maxLines) return size;
    }
    return o.min;
}

export interface ParagraphOptions extends TextOptions {
    /** Blank space between paragraphs (default 0.55 of a line). */
    gap?: number;
    /** Centre the whole block within the box height instead of starting at the top. */
    valign?: 'top' | 'center';
}

/**
 * Wrap paragraphs to a width and clamp them to a height, ellipsising the last visible line when cut.
 * Shared by drawParagraphs and the content measurer so the measured height always equals what gets drawn.
 * Sets ctx.font as a side effect.
 */
export function layoutParagraphs(ctx: Ctx, paragraphs: string[], width: number, lh: number, gap: number, maxHeight: number): {
    shown: string[][];
    total: number
} {
    const shown: string[][] = [];
    let used = 0;
    for (let i = 0; i < paragraphs.length; i++) {
        const lines = wrap(ctx, paragraphs[i], width);
        const blockH = lines.length * lh;
        if (used + blockH <= maxHeight + 0.5) {
            shown.push(lines);
            used += blockH + (i < paragraphs.length - 1 ? gap : 0);
            continue;
        }
        const can = Math.floor((maxHeight - used) / lh);
        if (can > 0) {
            const cut = lines.slice(0, can);
            cut[can - 1] = ellipsize(ctx, `${cut[can - 1]} …`, width);
            shown.push(cut);
        } else if (shown.length) {
            const last = shown[shown.length - 1];
            last[last.length - 1] = ellipsize(ctx, `${last[last.length - 1]} …`, width);
        }
        break;
    }
    let total = 0;
    shown.forEach((lines, i) => {
        total += lines.length * lh + (i < shown.length - 1 ? gap : 0);
    });
    return { shown, total };
}

/**
 * Draw several paragraphs into a box with a gap between them, clamped to the box height (last visible line
 * ellipsised when cut). Each paragraph's last line is left ragged even when justified. Returns the height used.
 */
export function drawParagraphs(ctx: Ctx, paragraphs: string[], box: Rect, o: ParagraphOptions): number {
    ctx.font = `${o.size}px ${o.font ?? FONT_BODY}`;
    const lh = o.size * (o.lineHeight ?? 1.4);
    const gap = o.gap ?? lh * 0.55;
    const { shown, total } = layoutParagraphs(ctx, paragraphs, box.w, lh, gap, box.h);

    ctx.fillStyle = o.color;
    ctx.textBaseline = 'top';
    const align = o.align ?? 'left';
    const justify = !!o.justify && align === 'left';
    let y = o.valign === 'center' ? box.y + Math.max(0, (box.h - total) / 2) : box.y;
    for (let i = 0; i < shown.length; i++) {
        const lines = shown[i];
        for (let j = 0; j < lines.length; j++) {
            if (justify) {
                drawJustifiedLine(ctx, lines[j], box.x, y, box.w, j === lines.length - 1);
            } else {
                ctx.textAlign = align;
                const tx = align === 'center' ? box.x + box.w / 2 : align === 'right' ? box.x + box.w : box.x;
                ctx.fillText(lines[j], tx, y);
            }
            y += lh;
        }
        if (i < shown.length - 1) y += gap;
    }
    return total;
}
