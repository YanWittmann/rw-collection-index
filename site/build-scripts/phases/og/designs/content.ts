/**
 * Shared content primitives for designs.
 * Every design classifies the same blocks and draws the same three content kinds (image grid, audio, transcript);
 * only the placement and styling differ, so the drawing lives here and designs pass an area plus a style.
 */

import type { CardInput } from './index';
import { cleanText, type ContentBlock } from '../../../../src/app/utils/dialogueParsing';
import {
    containRect,
    coverRect,
    type Ctx,
    decodeEntities,
    drawParagraphs,
    drawSprite,
    drawText,
    entrySprite,
    FONT_BODY,
    grid,
    layoutParagraphs,
    loadAsset,
    type Rect,
    texture,
    transcriberSprite,
} from '../toolkit';

const MAX_GRID_FRAMES = 8;

export interface Split {
    images: Extract<ContentBlock, { kind: 'image' }>[];
    audios: Extract<ContentBlock, { kind: 'audio' }>[];
    texts: Extract<ContentBlock, { kind: 'text' }>[];
}

export function splitBlocks(blocks: ContentBlock[]): Split {
    return {
        images: blocks.filter((b): b is Split['images'][number] => b.kind === 'image'),
        audios: blocks.filter((b): b is Split['audios'][number] => b.kind === 'audio'),
        texts: blocks.filter((b): b is Split['texts'][number] => b.kind === 'text'),
    };
}

/** One block flattened to plain text for the canvas: speaker-prefixed where known, markup stripped, entities decoded. */
function blockText(b: Split['texts'][number]): string {
    const body = decodeEntities(cleanText(b.text));
    return b.speaker ? `${decodeEntities(b.speaker)}: ${body}` : body;
}

/** The transcript as one packed string: speaker-prefixed where known, newlines collapsed to spaces. */
export function transcriptText(texts: Split['texts']): string {
    return texts
        .map(blockText)
        .filter(Boolean)
        .join(' ')
        .replace(/\s*\n+\s*/g, ' ');
}

/** The transcript as separate paragraphs (one per block), each packed to a single line of spacing. */
export function transcriptParagraphs(texts: Split['texts']): string[] {
    return texts
        .map(blockText)
        .map(s => s.replace(/\s*\n+\s*/g, ' ').trim())
        .filter(Boolean);
}

/** Fill the card with the topographic map art (cover-cropped) over near-black, then a dimming veil for legibility. */
export async function drawBackdrop(ctx: Ctx, w: number, h: number, dim = 0.4): Promise<void> {
    ctx.fillStyle = '#070707';
    ctx.fillRect(0, 0, w, h);
    const img = await loadAsset('topographic.png');
    if (img) {
        const r = coverRect(img.width, img.height, { x: 0, y: 0, w, h });
        ctx.drawImage(img, r.x, r.y, r.w, r.h);
    }
    if (dim > 0) {
        ctx.fillStyle = `rgba(0,0,0,${dim})`;
        ctx.fillRect(0, 0, w, h);
    }
}

function roundRectPath(ctx: Ctx, r: Rect, radius: number): void {
    const rad = Math.min(radius, r.w / 2, r.h / 2);
    ctx.beginPath();
    ctx.moveTo(r.x + rad, r.y);
    ctx.arcTo(r.x + r.w, r.y, r.x + r.w, r.y + r.h, rad);
    ctx.arcTo(r.x + r.w, r.y + r.h, r.x, r.y + r.h, rad);
    ctx.arcTo(r.x, r.y + r.h, r.x, r.y, rad);
    ctx.arcTo(r.x, r.y, r.x + r.w, r.y, rad);
    ctx.closePath();
}

/** A translucent rounded panel for legibility over the backdrop art, optionally with a border. */
export function fillPanel(ctx: Ctx, r: Rect, color = 'rgba(8,9,12,0.66)', radius = 20, border?: string, borderWidth = 2): void {
    roundRectPath(ctx, r, radius);
    ctx.fillStyle = color;
    ctx.fill();
    if (border) {
        roundRectPath(ctx, r, radius);
        ctx.strokeStyle = border;
        ctx.lineWidth = borderWidth;
        ctx.stroke();
    }
}

export interface GridStyle {
    gap?: number;
    cols?: number;
    radius?: number;
    /** Soft glow colour drawn behind each frame; omit for none. */
    shadow?: string;
    /** Flat backing colour behind each frame (matte the cell so the art sits on a card). */
    bg?: string;
    /** Flat border colour stroked around each frame. */
    border?: string;
    borderWidth?: number;
}

/** A tidy grid of dialogue frames, each contained in its cell and kept pixel-sharp, optionally rounded and bordered. */
export async function drawImageGrid(ctx: Ctx, frames: Split['images'], area: Rect, style: GridStyle = {}): Promise<void> {
    const shown = frames.slice(0, MAX_GRID_FRAMES);
    const cells = grid(area, shown.length, { gap: style.gap ?? 16, cols: style.cols });
    const radius = style.radius ?? 0;
    for (let i = 0; i < shown.length; i++) {
        const img = await texture(shown[i].path);
        if (!img) continue;
        const r = containRect(img.width, img.height, cells[i]);
        if (style.shadow) {
            ctx.save();
            ctx.shadowColor = style.shadow;
            ctx.shadowBlur = 28;
            ctx.fillStyle = '#000';
            roundRectPath(ctx, r, radius);
            ctx.fill();
            ctx.restore();
        }
        if (style.bg) {
            roundRectPath(ctx, r, radius);
            ctx.fillStyle = style.bg;
            ctx.fill();
        }
        ctx.save();
        if (radius) roundRectPath(ctx, r, radius);
        else {
            ctx.beginPath();
            ctx.rect(r.x, r.y, r.w, r.h);
        }
        ctx.clip();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, r.x, r.y, r.w, r.h);
        ctx.restore();
        if (style.border) {
            roundRectPath(ctx, r, radius);
            ctx.strokeStyle = style.border;
            ctx.lineWidth = style.borderWidth ?? 2;
            ctx.stroke();
        }
    }
}

/** A round disc in the entry colour bearing a musical note (audio is not clickable, so not a play button), label beneath. */
export function drawAudioBadge(ctx: Ctx, label: string, area: Rect, color: string, labelColor = '#8a8a8a'): void {
    const radius = 70;
    const cx = area.x + area.w / 2;
    const cy = area.y + area.h / 2 - 20;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // An eighth note: two note heads, their stems, and a beam joining the stems.
    const ink = '#0a0a0a';
    const headRx = 13;
    const headRy = 10;
    const stemH = 46;
    const leftX = cx - 20;
    const rightX = cx + 20;
    const baseY = cy + 22;
    ctx.fillStyle = ink;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(leftX + headRx, baseY - headRy);
    ctx.lineTo(leftX + headRx, baseY - headRy - stemH);
    ctx.lineTo(rightX + headRx, baseY - headRy - stemH + 6);
    ctx.lineTo(rightX + headRx, baseY - headRy);
    ctx.stroke();
    for (const hx of [leftX, rightX]) {
        ctx.save();
        ctx.translate(hx, baseY);
        ctx.rotate(-0.35);
        ctx.beginPath();
        ctx.ellipse(0, 0, headRx, headRy, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawText(ctx, label, { x: area.x, y: cy + radius + 24, w: area.w, h: 60 },
        { size: 34, color: labelColor, font: FONT_BODY, align: 'center', maxLines: 1 });
}

export interface ContentStyle {
    textColor: string;
    textSize?: number;
    lineHeight?: number;
    font?: string;
    align?: 'left' | 'center' | 'right';
    justify?: boolean;
    /** Render text blocks as separate paragraphs with spacing between, instead of one packed block. */
    paragraphs?: boolean;
    paragraphGap?: number;
    /** Centre the text/audio within the area's height (avoids empty space at the bottom of a fixed box). */
    valign?: 'top' | 'center';
    audioColor: string;
    audioLabelColor?: string;
    grid?: GridStyle;
}

/** Draw whichever content the card holds into one area: image grid, else audio badge, else the transcript. */
export async function drawContent(ctx: Ctx, blocks: ContentBlock[], area: Rect, style: ContentStyle): Promise<void> {
    const { images, audios, texts } = splitBlocks(blocks);
    if (images.length) {
        await drawImageGrid(ctx, images, area, style.grid);
    } else if (audios.length) {
        drawAudioBadge(ctx, audios[0].label, area, style.audioColor, style.audioLabelColor);
    } else {
        const size = style.textSize ?? 36;
        const lineHeight = style.lineHeight ?? 1.32;
        const font = style.font ?? FONT_BODY;
        if (style.paragraphs) {
            drawParagraphs(ctx, transcriptParagraphs(texts), area,
                {
                    size,
                    color: style.textColor,
                    font,
                    lineHeight,
                    align: style.align,
                    justify: style.justify,
                    valign: style.valign,
                    gap: style.paragraphGap
                });
        } else {
            drawText(ctx, transcriptText(texts), area,
                {
                    size,
                    color: style.textColor,
                    font,
                    lineHeight,
                    align: style.align,
                    justify: style.justify,
                    maxHeight: area.h
                });
        }
    }
}

export interface ContentMetrics {
    height: number;
    cols: number;
    rows: number;
    kind: 'image' | 'audio' | 'text';
}

export interface ContentMeasureOptions {
    textSize: number;
    lineHeight: number;
    font?: string;
    paragraphGap: number;
    gridGap?: number;
    maxCols?: number;
    audioHeight?: number;
    /** Cap the text height so the measurement matches what gets drawn (truncated) in a box this tall. */
    maxHeight?: number;
}

/**
 * The natural height the content wants at this width, so a design can fit its card to the content and centre it.
 * Images return square-cell rows (with the column count), audio a fixed badge height, text its wrapped height.
 */
export function measureContent(ctx: Ctx, blocks: ContentBlock[], width: number, o: ContentMeasureOptions): ContentMetrics {
    const { images, audios, texts } = splitBlocks(blocks);
    const gap = o.gridGap ?? 20;
    if (images.length) {
        const n = Math.min(images.length, MAX_GRID_FRAMES);
        const maxCols = o.maxCols ?? 4;
        const rows = Math.ceil(n / maxCols);
        const cols = Math.ceil(n / rows);
        const cellW = (width - gap * (cols - 1)) / cols;
        return { height: rows * cellW + gap * (rows - 1), cols, rows, kind: 'image' };
    }
    if (audios.length) {
        return { height: o.audioHeight ?? 240, cols: 1, rows: 1, kind: 'audio' };
    }
    const lh = o.textSize * o.lineHeight;
    ctx.font = `${o.textSize}px ${o.font ?? FONT_BODY}`;
    const { total } = layoutParagraphs(ctx, transcriptParagraphs(texts), width, lh, o.paragraphGap, o.maxHeight ?? Infinity);
    return { height: total, cols: 1, rows: 1, kind: 'text' };
}

export interface TileStyle {
    bg: string;
    border: string;
    radius: number;
    borderWidth?: number;
}

/** The entry icon inside a rounded-square tile that matches the container's box style. */
export async function drawEntryTile(ctx: Ctx, input: CardInput, x: number, y: number, size: number, style: TileStyle): Promise<void> {
    fillPanel(ctx, { x, y, w: size, h: size }, style.bg, style.radius, style.border, style.borderWidth ?? 2);
    const pad = Math.round(size * 0.2);
    drawSprite(ctx, await entrySprite(input.pearl, size - 2 * pad), x + pad, y + pad);
}

/** The transcriber icon in a matching tile, skipped when there is no transcriber or it shares the entry icon. */
export async function drawTranscriberTile(ctx: Ctx, input: CardInput, x: number, y: number, size: number, style: TileStyle): Promise<void> {
    if (!input.transcriber || !input.showTranscriberIcon) return;
    fillPanel(ctx, { x, y, w: size, h: size }, style.bg, style.radius, style.border, style.borderWidth ?? 2);
    const pad = Math.round(size * 0.2);
    drawSprite(ctx, await transcriberSprite(input.pearl, input.transcriber, size - 2 * pad), x + pad, y + pad);
}
