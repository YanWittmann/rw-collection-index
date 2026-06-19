/**
 * Pure parsing helpers for dialogue line markup.
 * Shared by the runtime renderer (DialogueContent) and the build-time static
 * renderer (routing/routes.ts), so both interpret the same syntax identically.
 * No React, DOM or process.env here.
 */

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
