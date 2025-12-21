import { Dialogue, PearlData } from '../types/types';
import { speakerNames, transcriberIcons, transcribersColors, transcribersImages } from './speakers';

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

export function getTranscriberIcon(transcriber: Dialogue, index?: number) {
    const effectiveTranscriberName = index !== undefined
        ? transcriber.transcriber + '-' + index
        : transcriber.transcriber;

    let iconType: string;
    let color: string;

    if (effectiveTranscriberName.includes("broadcast")) {
        color = transcribersColors[transcriber.transcriber] ??
            transcriber.metadata.color ??
            '#ffffff';
        iconType = "broadcast";
    } else if (transcriber.metadata.type === 'item' && transcriber.metadata.subType) {
        color = transcribersColors[transcriber.transcriber];
        iconType = transcriber.metadata.subType;
    } else if (transcribersImages[transcriber.transcriber] !== undefined) {
        color = transcribersColors[transcriber.transcriber];
        iconType = transcribersImages[transcriber.transcriber] ?? transcriber.transcriber;
    } else {
        color = transcribersColors[transcriber.transcriber];
        iconType = transcriberIcons[transcriber.transcriber] ?? transcriber.transcriber;
    }

    const overwriteColor = effectiveTranscriberName.includes("broadcast") ? color : undefined;

    let displayTranscriberName: string;
    if (transcriber.metadata.transcriberName) {
        displayTranscriberName = "plain=" + transcriber.metadata.transcriberName;
    } else {
        displayTranscriberName = speakerNames[transcriber.transcriber] ?? transcriber.transcriber;
    }

    return { iconType, color, effectiveTranscriberName, overwriteColor, displayTranscriberName };
}