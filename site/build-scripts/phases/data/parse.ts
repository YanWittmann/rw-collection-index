/**
 * Dialogue file parser: turns a single .txt source file into a structured entry.
 * Pure string-to-object transformation with no filesystem or process access.
 * Source matching is injected as a callback so this module stays independent of it.
 */

export type Metadata = Record<string, any>;

export interface Transcriber {
    transcriber: string;
    metadata: Metadata;
    lines: DialogueLine[];
}

export interface DialogueLine {
    speaker?: string;
    namespace?: string;
    text: string;
}

export interface Hint {
    name: string;
    lines: string[];
}

export interface ParsedDialogue {
    metadata: Metadata;
    transcribers: Transcriber[];
    hints: Hint[];
}

/** Finds the best-matching game source file id for a transcriber's lines, or null. */
export type SourceMatcher = (lines: string[]) => string | null;

const MAX_SPEAKER_LENGTH = 12;

const excludeSpeakers = [
    'Water', 'Hydrocarbons', 'Sulfur', 'Silicon', 'Phosphates',
    'EM', 'Five Pebbsi', 'Behold', 'Imagine', 'CONSIDER', 'NOW', 'TO', 'SPECIAL',
];

const generalWhiteGrayBroadcasts = [
    { region: 'SU', room: 'A17', mapSlugcat: 'spear' },
    { region: 'HI', room: 'B02', mapSlugcat: 'spear' },
    { region: 'DS', room: 'A11', mapSlugcat: 'spear' },
    { region: 'SH', room: 'B03', mapSlugcat: 'spear' },
    { region: 'VS', room: 'A05', mapSlugcat: 'spear' },
    { region: 'VS', room: 'B10', mapSlugcat: 'spear' },
    { region: 'UW', room: 'J01', mapSlugcat: 'spear' },
    { region: 'SS', room: 'D08', mapSlugcat: 'spear' },
    { region: 'LF', room: 'D01', mapSlugcat: 'spear' },
    { region: 'SB', room: 'C07', mapSlugcat: 'spear' },
    { region: 'LM', room: 'EDGE02', mapSlugcat: 'spear' },
];

const mapMetadataTemplates: Record<string, any[]> = {
    'MAP-WHITE-BROADCASTS': generalWhiteGrayBroadcasts,
    'MAP-GRAY-BROADCASTS': generalWhiteGrayBroadcasts,
    'MAP-BROADCAST-PEARLS': [],
};

// Transcribers whose presence tags the whole entry with an extra tag.
const tagAddons: Record<string, string[]> = {
    downpour: [
        'LttM-saint', 'LttM-rivulet', 'LttM-pre-collapse', 'LttM-gourmand',
        'FP-artificer',
        'LttM-FP-saint',
        'broadcast-pre-FP', 'broadcast-post-FP',
        'saint', 'rivulet', 'artificer', 'spearmaster',
    ],
};

function parseMapEntries(value: string): any[] {
    if (mapMetadataTemplates[value]) {
        return mapMetadataTemplates[value];
    }
    const entry: Record<string, string> = {};
    value.split(',').map(part => part.trim()).forEach(pair => {
        const [key, val] = pair.split('=').map(s => s.trim());
        if (key && val) entry[key] = val;
    });
    return [entry];
}

function parseLine(line: string): DialogueLine {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1 || colonIndex > MAX_SPEAKER_LENGTH) {
        return { text: line };
    }

    const speakerPart = line.slice(0, colonIndex).trim();

    if (!speakerPart.startsWith('md-') &&
        !speakerPart.startsWith('|') &&
        !speakerPart.startsWith('/') &&
        !speakerPart.startsWith('~') &&
        speakerPart.length <= MAX_SPEAKER_LENGTH) {

        let actualSpeaker = speakerPart;
        let namespace: string | undefined;
        const hyphenIndex = speakerPart.indexOf('-');

        if (speakerPart.startsWith('NS') && hyphenIndex > 2 && hyphenIndex < speakerPart.length - 1) {
            namespace = speakerPart.slice(0, hyphenIndex);
            actualSpeaker = speakerPart.slice(hyphenIndex + 1);
        }

        if (!excludeSpeakers.includes(actualSpeaker)) {
            const result: DialogueLine = { speaker: actualSpeaker, text: line.slice(colonIndex + 1).trim() };
            if (namespace !== undefined) result.namespace = namespace;
            return result;
        }
    }

    return { text: line };
}

interface SectionHeader {
    namespace: string;
    value: string;
}

function parseSectionHeader(headerLine: string): SectionHeader | null {
    if (!headerLine.startsWith('=== ')) return null;

    const legacyMatch = headerLine.match(/^=== (\w+)$/);
    if (legacyMatch) return { namespace: 'transcription', value: legacyMatch[1] };

    const namespacedMatch = headerLine.match(/^=== (\w+): (.+)$/);
    if (namespacedMatch) return { namespace: namespacedMatch[1], value: namespacedMatch[2] };

    return null;
}

function buildTranscription(sectionLines: string[], value: string, matchSource: SourceMatcher | null): Transcriber {
    const metadata: Metadata = { map: [], tags: [], sourceDialogue: [] };
    const lines: string[] = [];

    sectionLines.forEach(line => {
        if (!line.startsWith('md-')) {
            lines.push(line);
            return;
        }
        const colonIndex = line.indexOf(':');
        if (colonIndex === -1) return;

        const key = line.slice(3, colonIndex).trim();
        const val = line.slice(colonIndex + 1).trim();

        if (key === 'map') {
            if (val.toLowerCase() === 'none') {
                metadata.map = [];
                metadata._clearGlobalMap = true;
            } else {
                parseMapEntries(val).forEach(entry => metadata.map.push(entry));
            }
        } else if (key === 'tag') {
            metadata.tags.push(...val.split(',').map(t => t.trim()));
        } else if (key === 'sourceDialogue') {
            metadata.sourceDialogue.push(val);
        } else if (key.startsWith('super-')) {
            if (!metadata.superValues) metadata.superValues = {};
            metadata.superValues[key.slice(6)] = val;
        } else {
            metadata[key] = val;
        }
    });

    for (const [tag, transcribers] of Object.entries(tagAddons)) {
        if (transcribers.includes(value)) metadata.tags.push(tag);
    }

    if (metadata.sourceDialogue.length === 0 && matchSource) {
        const match = matchSource(lines);
        if (match) metadata.sourceDialogue = [match];
    }
    metadata.sourceDialogue = metadata.sourceDialogue.filter((s: string) => s !== 'none');

    return {
        transcriber: value,
        metadata: {
            ...metadata,
            map: metadata.map.length > 0 ? metadata.map : undefined,
            tags: metadata.tags.length > 0 ? metadata.tags : undefined,
            sourceDialogue: metadata.sourceDialogue.length > 0 ? metadata.sourceDialogue : undefined,
        },
        lines: lines.map(parseLine),
    };
}

/** Merge global entry metadata into a transcriber and resolve its map/tag inheritance. */
function finalizeTranscription(transcriber: Transcriber, globalMetadata: Metadata): void {
    // saveUnlock is entry-level only; transcribers carry their own via md-saveUnlock.
    for (const key in globalMetadata) {
        if (key === 'saveUnlock') continue;
        if (globalMetadata.hasOwnProperty(key) && !transcriber.metadata.hasOwnProperty(key)) {
            transcriber.metadata[key] = globalMetadata[key];
        }
    }

    if (transcriber.metadata._clearGlobalMap) {
        transcriber.metadata.map = transcriber.metadata.map || [];
    } else {
        transcriber.metadata.map = [...new Set([
            ...(transcriber.metadata.map || []),
            ...(globalMetadata.map || []),
        ])];
    }
    if (transcriber.metadata.map && transcriber.metadata.map.length === 0) {
        delete transcriber.metadata.map;
    }

    transcriber.metadata.tags = [...new Set([
        ...(transcriber.metadata.tags || []),
        ...(globalMetadata.tags || []),
    ])];
}

export interface ParseOptions {
    inheritanceDB?: Map<string, Metadata> | null;
    metadataOnly?: boolean;
    matchSource?: SourceMatcher | null;
}

export function parseDialogueContent(content: string, options: ParseOptions = {}): ParsedDialogue {
    const { inheritanceDB = null, metadataOnly = false, matchSource = null } = options;
    const lines = content.split('\n').map(l => l.trim()).filter(l => l);

    const metadata: Metadata = { map: [], tags: [] };
    let sectionStartIndex = 0;

    while (sectionStartIndex < lines.length && !lines[sectionStartIndex].startsWith('===')) {
        const line = lines[sectionStartIndex];
        const colonIndex = line.indexOf(':');
        if (colonIndex > -1) {
            const key = line.slice(0, colonIndex).trim();
            const value = line.slice(colonIndex + 1).trim();

            if (key === 'map') {
                parseMapEntries(value).forEach(entry => metadata.map.push(entry));
            } else if (key === 'tag') {
                metadata.tags.push(...value.split(',').map(t => t.trim()));
            } else if (key === 'saveUnlock') {
                if (!Array.isArray(metadata.saveUnlock)) metadata.saveUnlock = [];
                metadata.saveUnlock.push(value);
            } else {
                metadata[key] = value;
            }
        }
        sectionStartIndex++;
    }

    if (metadata.inherit && inheritanceDB) {
        const parent = inheritanceDB.get(metadata.inherit);
        if (parent) {
            for (const [key, value] of Object.entries(parent)) {
                if (key === 'map' || key === 'tags') continue;
                if (metadata[key] === undefined) metadata[key] = value;
            }
            if (parent.map) metadata.map = [...parent.map, ...metadata.map];
            if (parent.tags) metadata.tags = [...new Set([...(parent.tags || []), ...metadata.tags])];
        } else {
            console.warn(`Warning: Parent ${metadata.inherit} not found in inheritance sources.`);
        }
        delete metadata.inherit;
    }

    if (metadata.map.length === 0) delete metadata.map;
    if (metadata.tags.length === 0) delete metadata.tags;

    if (metadataOnly) {
        return { metadata, transcribers: [], hints: [] };
    }

    const transcribers: Transcriber[] = [];
    const hints: Hint[] = [];

    const flush = (header: SectionHeader, sectionLines: string[]) => {
        if (header.namespace === 'transcription') {
            const transcriber = buildTranscription(sectionLines, header.value, matchSource);
            finalizeTranscription(transcriber, metadata);
            transcribers.push(transcriber);
        } else if (header.namespace === 'hint') {
            hints.push({ name: header.value, lines: sectionLines });
        }
    };

    let currentHeader: SectionHeader | null = null;
    let currentSectionLines: string[] = [];

    for (let i = sectionStartIndex; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith('===')) {
            if (currentHeader) flush(currentHeader, currentSectionLines);
            currentHeader = parseSectionHeader(line);
            currentSectionLines = [];
        } else if (currentHeader) {
            currentSectionLines.push(line);
        }
    }
    if (currentHeader && currentSectionLines.length > 0) {
        flush(currentHeader, currentSectionLines);
    }

    return {
        metadata: { ...metadata, map: metadata.map || undefined, tags: metadata.tags || undefined },
        transcribers,
        hints,
    };
}
