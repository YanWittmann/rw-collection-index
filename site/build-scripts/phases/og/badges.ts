/**
 * Builds the card's edge badges from its data: regions (left) and other tags (right).
 * Mappings mirror the app (region crests from speakers.ts, tag icons from PearlGrid's filter options)
 * so the card never drifts from what the site shows.
 */

import type { Dialogue, PearlData } from '../../../src/app/types/types';
import type { GameAsset } from '../../../src/app/utils/assetUtils';
import { getMapLocations } from '../../../src/app/utils/mapUtils';
import { getRegion } from '../../../src/app/utils/speakers';
import type { Badge, CardBadges } from './designs';

/** Tags worth flagging with an icon; vanilla is the default and carries no badge. */
const TAG_ICONS: Record<string, string> = {
    downpour: 'dlc-dp',
    watcher: 'dlc-watcher',
    modded: 'modded',
};

const MAX_REGION_BADGES = 3;

/** Region codes the transcriber appears in, deduped in first-seen order. */
function regionCodes(transcriber: Dialogue): string[] {
    const codes: string[] = [];
    for (const loc of getMapLocations(transcriber)) {
        if (loc.region && !codes.includes(loc.region)) codes.push(loc.region);
    }
    return codes;
}

function regionBadges(transcriber: Dialogue): Badge[] {
    const codes = regionCodes(transcriber);
    // a lone region gets its full name, several share the row so each shows only its short code
    const single = codes.length === 1;
    const shown = codes.slice(0, MAX_REGION_BADGES);
    const badges: Badge[] = shown.map(code => {
        const region = getRegion(code);
        const icon: GameAsset | undefined = region.image ? { src: region.image, fit: 'cover' } : undefined;
        return { icon, label: single ? region.name : code, labelColor: region.color };
    });
    const extra = codes.length - shown.length;
    if (extra > 0) badges.push({ label: `+${extra}` });
    return badges;
}

function tagBadges(transcriber: Dialogue): Badge[] {
    return (transcriber.metadata.tags ?? [])
        .filter(tag => TAG_ICONS[tag])
        .map(tag => ({ icon: { src: TAG_ICONS[tag] } }));
}

/** The badges for a route's own subject (its transcriber), with no aggregation across the entry's transcribers. */
export function buildBadges(_pearl: PearlData, transcriber: Dialogue | null): CardBadges {
    if (!transcriber) return { left: [], center: [], right: [] };
    return { left: regionBadges(transcriber), center: [], right: tagBadges(transcriber) };
}
