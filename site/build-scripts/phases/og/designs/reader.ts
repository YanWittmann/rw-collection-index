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
    type BadgeStyle,
    drawBackdrop,
    drawBadgeCluster,
    drawContent,
    drawEntryTile,
    drawTranscriberTile,
    fillPanel,
    measureContent,
    type TileStyle
} from './content';
import { BOX_BG, BOX_BORDER, BOX_BORDER_WIDTH, DIM, INK, PAGE, RADIUS } from './theme';

const MARGIN = 36;
const PAD_X = 38;
const PAD_TOP = 38;
const PAD_BOTTOM = 58;
const TILE = 88;
const TITLE_GAP = 24;
const HEADER_GAP = 28;
const BODY_SIZE = 32;
const BODY_LINE = 1.42;
const PARA_GAP = 12;
const GRID_GAP = 20;

// edge badges riding the card's bottom border, constants tunable for iteration
const BADGE_STYLE: BadgeStyle = {
    height: 58,
    padX: 16,
    padY: 9,
    gap: 12,
    iconGap: 11,
    radius: 13,
    fontSize: 30,
    bg: '#000000',
    // dimmer than the card's white border so the chips read as secondary
    border: 'rgba(255,255,255,0.45)',
    borderWidth: BOX_BORDER_WIDTH,
    labelColor: DIM,
};
// how far the clusters sit in from the card corners, clearing the rounded edge
const BADGE_CORNER_PAD = 44;
// floor for speaker text lightness so dark accents stay legible over the dark card
const SPEAKER_MIN_LIGHTNESS = 60;

async function render(ctx: Ctx, input: CardInput): Promise<void> {
    const accent = input.pearl.metadata.color || '#e6e6e6';
    const titleColor = input.pearl.metadata.color || INK;
    await drawBackdrop(ctx, PAGE.w, PAGE.h, 0.5);

    const w = PAGE.w - 2 * MARGIN - 2 * PAD_X;

    // Header measurement (independent of where the card lands vertically).
    const titleW = w - 2 * (TILE + 24);
    const size = fitFontSize(ctx, input.title, titleW, { font: FONT_DISPLAY, min: 42, max: 70, maxLines: 1 });
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
    // show the in-game internal id (e.g. "CC"), not the route id (e.g. "CC_GOLD")
    const entryLabel = input.pearl.metadata.internalId || input.entryId;
    const subtitle = input.transcriberName ? `${entryLabel} / ${input.transcriberName}` : entryLabel;
    // keep the subtitle within the title column so a long id/name ellipsises instead of overrunning the icons
    const subLayout = measureText(ctx, subtitle, titleW, { size: 27, color: DIM, font: FONT_BODY, maxLines: 1 });
    const subH = tightLinesHeight(ctx, subLayout.lines, { size: 27, color: DIM, font: FONT_BODY, lineHeight: 1.2 });
    const groupH = titleH + TITLE_GAP + subH;
    const headerH = Math.max(TILE, groupH);

    // Fit the card height to the content, capped at the page, then center the whole card vertically.
    // The cap goes into the measurement so overflowing text reports its truncated (drawn) height, not its full height.
    const maxInnerH = PAGE.h - 2 * MARGIN - PAD_TOP - PAD_BOTTOM;
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
    const cardH = headerH + HEADER_GAP + contentH + PAD_TOP + PAD_BOTTOM;
    // badges spill half their height below the bottom border, so centre the card plus that spill as one block
    const hasBadges = !!(input.badges.left.length || input.badges.center.length || input.badges.right.length);
    const badgeOverflow = hasBadges ? BADGE_STYLE.height / 2 : 0;
    const cardY = Math.round((PAGE.h - cardH - badgeOverflow) / 2);
    const card: Rect = { x: MARGIN, y: cardY, w: PAGE.w - 2 * MARGIN, h: cardH };

    fillPanel(ctx, card, BOX_BG, RADIUS, BOX_BORDER, BOX_BORDER_WIDTH);
    const box: TileStyle = { bg: BOX_BG, border: BOX_BORDER, radius: RADIUS, borderWidth: BOX_BORDER_WIDTH };
    const x = card.x + PAD_X;
    const top = card.y + PAD_TOP;

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
    drawTightLines(ctx, subLayout.lines, titleX, groupTop + titleH + TITLE_GAP, titleW, {
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
        align: 'center',
        valign: 'top',
        speakerColors: true,
        minSpeakerLightness: SPEAKER_MIN_LIGHTNESS,
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

    // Badges ride the bottom border, centred on the line, so they overlay without moving any content.
    const borderY = card.y + card.h;
    await drawBadgeCluster(ctx, input.badges.left, { align: 'left', edgeX: card.x + BADGE_CORNER_PAD, centerY: borderY, style: BADGE_STYLE });
    await drawBadgeCluster(ctx, input.badges.center, { align: 'center', edgeX: card.x + card.w / 2, centerY: borderY, style: BADGE_STYLE });
    await drawBadgeCluster(ctx, input.badges.right, { align: 'right', edgeX: card.x + card.w - BADGE_CORNER_PAD, centerY: borderY, style: BADGE_STYLE });
}

export const reader: Design = { name: 'reader', version: 13, width: PAGE.w, height: PAGE.h, render };
