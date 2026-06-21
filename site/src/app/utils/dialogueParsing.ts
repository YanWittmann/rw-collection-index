/**
 * Pure parsing helpers for dialogue line markup.
 * Shared by the runtime renderer (DialogueContent) and the build-time static
 * renderer (routing/routes.ts), so both interpret the same syntax identically.
 * No React, DOM or process.env here.
 */

import type { Dialogue } from '../types/types';

export const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
export const AUDIO_EXTENSIONS = ['mp3', 'wav', 'ogg'];

export interface MediaDetails {
    path: string;
    alt: string;
    style?: string;
    type: 'image' | 'audio';
}

export const parseAttributes = (text: string): { [key: string]: string } => {
    const attributesRegex = /\[(.*?)=(.*?)]/g;
    const attributes: { [key: string]: string } = {};
    let attrMatch;
    while ((attrMatch = attributesRegex.exec(text)) !== null) {
        const [, key, value] = attrMatch;
        if (key && value) {
            attributes[key.trim().toUpperCase()] = value.trim();
        }
    }
    return attributes;
};

export const parseMediaDetails = (text?: string): MediaDetails | null | undefined => {
    if (!text) {
        return undefined;
    }
    const mediaPathRegex = /!\[(.*?)]/;
    const mediaMatch = text.match(mediaPathRegex);
    if (!mediaMatch) return null;

    const path = mediaMatch[1];
    const restOfString = text.substring(mediaMatch[0].length);
    const attributes = parseAttributes(restOfString);

    const alt = attributes.ALT?.toLowerCase() || '';
    const style = attributes.STYLE?.toLowerCase();

    const extension = path.split('.').pop()?.toLowerCase();

    let type: 'image' | 'audio' | null = null;
    if (extension && IMAGE_EXTENSIONS.includes(extension)) {
        type = 'image';
    } else if (extension && AUDIO_EXTENSIONS.includes(extension)) {
        type = 'audio';
    }

    if (!type) return null;

    return { path, alt, style, type };
};

/** Strip a mono-mode line's leading marker ("/", "|", "~") and the following space. */
export const stripMonoMarker = (text: string): string => text.replace(/^[|/~] /, "");

/** A dialogue value reduced to readable plain text (markup, escaped newlines and runs of whitespace removed). */
export const cleanText = (value: string | undefined): string =>
    (value || '')
        .replace(/\\n/g, ' ')
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim();

/** A media line's caption: its ALT text, else the file name. */
export const mediaLabel = (media: MediaDetails): string =>
    media.alt || (media.path.split('/').pop() || media.path);

/**
 * One unit of a transcriber's content, in document order.
 * `text` is the raw line (mono marker stripped) so consumers can either render its
 * inline markup (the HTML renderer) or flatten it to plain text (descriptions, OG cards).
 */
export type ContentBlock =
    | { kind: 'text'; speaker?: string; namespace?: string; text: string }
    | { kind: 'image'; path: string; label: string }
    | { kind: 'audio'; path: string; label: string };

/**
 * Walk a transcriber's lines into ordered content blocks.
 * This is the single interpreter of MONO, SEQUENCE, ![media] and spoken lines, shared by
 * the static HTML renderer, the page-description summary and the OG image generator, so they
 * can never disagree about what an entry contains.
 */
export const extractContent = (transcriber: Dialogue | null | undefined): ContentBlock[] => {
    const lines = transcriber?.lines || [];
    const mono = lines[0]?.text === 'MONO';
    const blocks: ContentBlock[] = [];
    for (const line of lines) {
        const text = line.text;
        if (text === 'MONO') continue;
        // The SEQUENCE marker carries no content of its own; its frames follow as ordinary ![..] lines.
        if (text.trim().startsWith('SEQUENCE')) continue;

        const media = parseMediaDetails(text);
        if (media) {
            blocks.push({ kind: media.type, path: media.path, label: mediaLabel(media) });
            continue;
        }

        const raw = mono ? stripMonoMarker(text) : text;
        if (!cleanText(raw)) continue;
        blocks.push(line.speaker ? { kind: 'text', speaker: line.speaker, namespace: line.namespace, text: raw } : { kind: 'text', text: raw });
    }
    return blocks;
};
