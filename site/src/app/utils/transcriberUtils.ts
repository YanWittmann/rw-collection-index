import { Dialogue, PearlData } from '../types/types';
import { itemIconColors, getSpeakerDef } from './speakers';
import type { GameAsset } from './assetUtils';
import { Tint } from './assetUtils';

export function getLockedColor(pearl: PearlData, transcriber?: Dialogue): string {
    const type = transcriber?.metadata.type ?? pearl.metadata.type;
    const subType = transcriber?.metadata.subType ?? pearl.metadata.subType;
    const baseColor = transcriber?.metadata.color ?? pearl.metadata.color;

    switch (type) {
        case 'echo':
            return '#f3c159';
        case 'item':
            if (subType) return itemIconColors[`${subType}.png`] ?? itemIconColors[`${subType}.png`] ?? baseColor;
            return baseColor;
        default:
            return baseColor;
    }
}

/**
 * The icon shown for an unlocked entry: the type's asset (item entries use their subType),
 * mask-tinted with the entry color. Shared by the pearl grid and the OG image generator.
 */
export function getEntryIcon(pearl: PearlData): { asset: GameAsset; color: string } {
    const iconType = pearl.metadata.type === 'item' ? (pearl.metadata.subType || 'pearl') : pearl.metadata.type;
    return { asset: { src: iconType, tint: Tint.mask(pearl.metadata.color) }, color: pearl.metadata.color };
}

export function getEffectiveTranscriberName(transcribers: Dialogue[], transcriberName: string, index: number): string {
    const duplicateCount = transcribers.filter(t => t.transcriber === transcriberName).length;
    return duplicateCount > 1 ? `${transcriberName}-${index}` : transcriberName;
}

export function findTranscriberIndex(pearl: PearlData, transcriberName: string): number {
    if (!pearl) return -1;

    const isIndexed = /.+-\d+$/.test(transcriberName);
    if (isIndexed) {
        return parseInt(transcriberName.split('-').pop()!, 10);
    } else {
        return pearl.transcribers.findIndex(t => t.transcriber === transcriberName);
    }
}

export function getTranscriberIcon(transcriber: Dialogue, pearl: PearlData, index?: number) {
    const effectiveTranscriberName = index !== undefined
        ? transcriber.transcriber + '-' + index
        : transcriber.transcriber;

    const def = getSpeakerDef(transcriber.transcriber);
    let asset: GameAsset;
    let color: string;

    if (effectiveTranscriberName.includes("broadcast")) {
        color = def.transcriberColor ?? transcriber.metadata.color ?? '#ffffff';
        asset = { src: "broadcast", tint: Tint.mask(color) };
    } else if (transcriber.metadata.type === 'item' && transcriber.metadata.subType) {
        color = def.transcriberColor ?? getLockedColor(pearl, transcriber);
        asset = { src: transcriber.metadata.subType };
    } else if (def.asset !== undefined) {
        color = def.transcriberColor ?? getLockedColor(pearl, transcriber);
        asset = { src: def.asset.src };
    } else {
        color = def.transcriberColor ?? getLockedColor(pearl, transcriber);
        asset = { src: transcriber.transcriber };
    }

    let displayTranscriberName: string;
    if (transcriber.metadata.transcriberName) {
        displayTranscriberName = "plain=" + transcriber.metadata.transcriberName;
    } else {
        displayTranscriberName = def.name ?? transcriber.transcriber;
    }

    return { asset, color, effectiveTranscriberName, displayTranscriberName };
}
