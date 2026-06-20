/**
 * "reader": modeled on the app's pearl reader. A white-bordered dark card whose height fits its content and
 * sits centered in the image. The entry and transcriber are tiles sharing the card's exact box style; a large
 * auto-sized title with a tight subtitle sits above the content (paragraphs for text, a square grid for images).
 */

import type { CardInput, Design } from './index';
import {
    type Ctx,
    drawTightLines,
    fitFontSize,
    FONT_BODY,
    FONT_DISPLAY,
    measureText,
    type Rect,
    tightLinesHeight,
} from '../toolkit';
import {
    drawBackdrop,
    drawContent,
    drawEntryTile,
    drawTranscriberTile,
    fillPanel,
    measureContent,
    type TileStyle
} from './content';
import { BOX_BG, BOX_BORDER, BOX_BORDER_WIDTH, DIM, INK, PAGE, RADIUS } from './theme';

const MARGIN = 28;
const PADDING = 44;
const TILE = 88;
const TITLE_GAP = 24;
const HEADER_GAP = 28;
const BODY_SIZE = 32;
const BODY_LINE = 1.42;
const PARA_GAP = 12;
const GRID_GAP = 20;

async function render(ctx: Ctx, input: CardInput): Promise<void> {
    const accent = input.pearl.metadata.color || '#e6e6e6';
    const titleColor = input.pearl.metadata.color || INK;
    await drawBackdrop(ctx, PAGE.w, PAGE.h, 0.5);

    const w = PAGE.w - 2 * MARGIN - 2 * PADDING;

    // Header measurement (independent of where the card lands vertically).
    const titleW = w - 2 * (TILE + 24);
    const size = fitFontSize(ctx, input.title, titleW, { font: FONT_DISPLAY, min: 44, max: 76, maxLines: 1 });
    const titleLayout = measureText(ctx, input.title, titleW, {
        size,
        color: titleColor,
        font: FONT_DISPLAY,
        lineHeight: 1.06,
        maxLines: 1
    });
    const titleH = tightLinesHeight(ctx, titleLayout.lines, {
        size,
        color: titleColor,
        font: FONT_DISPLAY,
        lineHeight: 1.06
    });
    const subtitle = input.transcriberName ? `${input.entryId} / ${input.transcriberName}` : input.entryId;
    const subLayout = measureText(ctx, subtitle, w, { size: 27, color: DIM, font: FONT_BODY, maxLines: 1 });
    const subH = tightLinesHeight(ctx, subLayout.lines, { size: 27, color: DIM, font: FONT_BODY, lineHeight: 1.2 });
    const groupH = titleH + TITLE_GAP + subH;
    const headerH = Math.max(TILE, groupH);

    // Fit the card height to the content, capped at the page, then center the whole card vertically.
    // The cap goes into the measurement so overflowing text reports its truncated (drawn) height, not its full height.
    const maxInnerH = PAGE.h - 2 * MARGIN - 2 * PADDING;
    const maxContentH = maxInnerH - headerH - HEADER_GAP;
    const metrics = measureContent(ctx, input.blocks, w, {
        textSize: BODY_SIZE,
        lineHeight: BODY_LINE,
        paragraphGap: PARA_GAP,
        gridGap: GRID_GAP,
        maxCols: 4,
        audioHeight: 240,
        maxHeight: maxContentH
    });
    const contentH = Math.min(metrics.height, maxContentH);
    const cardH = headerH + HEADER_GAP + contentH + 2 * PADDING;
    const cardY = Math.round((PAGE.h - cardH) / 2);
    const card: Rect = { x: MARGIN, y: cardY, w: PAGE.w - 2 * MARGIN, h: cardH };

    fillPanel(ctx, card, BOX_BG, RADIUS, BOX_BORDER, BOX_BORDER_WIDTH);
    const box: TileStyle = { bg: BOX_BG, border: BOX_BORDER, radius: RADIUS, borderWidth: BOX_BORDER_WIDTH };
    const x = card.x + PADDING;
    const top = card.y + PADDING;

    await drawEntryTile(ctx, input, x, top, TILE, box);
    await drawTranscriberTile(ctx, input, x + w - TILE, top, TILE, box);

    const titleX = x + TILE + 24;
    const groupTop = top + Math.max(0, (TILE - groupH) / 2);
    drawTightLines(ctx, titleLayout.lines, titleX, groupTop, titleW, {
        size,
        color: titleColor,
        font: FONT_DISPLAY,
        align: 'center',
        lineHeight: 1.06
    });
    drawTightLines(ctx, subLayout.lines, x, groupTop + titleH + TITLE_GAP, w, {
        size: 27,
        color: DIM,
        font: FONT_BODY,
        align: 'center',
        lineHeight: 1.2
    });

    const contentTop = top + headerH + HEADER_GAP;
    await drawContent(ctx, input.blocks, { x, y: contentTop, w, h: contentH }, {
        textColor: INK,
        textSize: BODY_SIZE,
        lineHeight: BODY_LINE,
        paragraphs: true,
        paragraphGap: PARA_GAP,
        justify: true,
        valign: 'top',
        audioColor: accent,
        audioLabelColor: DIM,
        grid: {
            cols: metrics.cols,
            gap: GRID_GAP,
            radius: 12,
            bg: BOX_BG,
            border: BOX_BORDER,
            borderWidth: BOX_BORDER_WIDTH
        },
    });
}

export const reader: Design = { name: 'reader', version: 8, width: PAGE.w, height: PAGE.h, render };
