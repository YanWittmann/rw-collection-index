import { Dialogue, PearlData } from '../types/types';
import { itemIconColors, getSpeakerDef } from './speakers';

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
    let iconType: string;
    let color: string;

    if (effectiveTranscriberName.includes("broadcast")) {
        color = def.transcriberColor ?? transcriber.metadata.color ?? '#ffffff';
        iconType = "broadcast";
    } else if (transcriber.metadata.type === 'item' && transcriber.metadata.subType) {
        color = def.transcriberColor ?? getLockedColor(pearl, transcriber);
        iconType = transcriber.metadata.subType;
    } else if (def.image !== undefined) {
        color = def.transcriberColor ?? getLockedColor(pearl, transcriber);
        iconType = def.image;
    } else {
        color = def.transcriberColor ?? getLockedColor(pearl, transcriber);
        iconType = def.icon ?? transcriber.transcriber;
    }

    const overwriteColor = effectiveTranscriberName.includes("broadcast") ? color : undefined;

    let displayTranscriberName: string;
    if (transcriber.metadata.transcriberName) {
        displayTranscriberName = "plain=" + transcriber.metadata.transcriberName;
    } else {
        displayTranscriberName = def.name ?? transcriber.transcriber;
    }

    return { iconType, color, effectiveTranscriberName, overwriteColor, displayTranscriberName };
}