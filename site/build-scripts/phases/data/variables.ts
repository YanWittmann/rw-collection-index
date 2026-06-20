/**
 * Variable and pattern expansion for dialogue entries.
 * Files using {var--Name} / {randomPick--a--b} placeholders expand into one entry per distinct combination of variable values; files without them pass through unchanged.
 */

import { Hint, Metadata, ParsedDialogue, Transcriber } from './parse';

export interface Entry {
    id: string;
    metadata: Metadata;
    transcribers: Transcriber[];
    hints: Hint[];
}

const PATTERN_REGEX = /\{([^{}]+)\}/g;

// randomPick rotates through its options across the whole run, reshuffling once exhausted.
const randomPickCache: Record<number, { indices: number[]; position: number }> = {};

function resolvePatterns(value: unknown, variables: Record<string, string> = {}): any {
    if (typeof value !== 'string') return value;

    return value.replace(PATTERN_REGEX, (match, pattern) => {
        const [type, ...params] = pattern.split('--');
        switch (type) {
            case 'var':
                return variables[params[0]] || match;
            case 'randomPick': {
                const len = params.length;
                if (!randomPickCache[len]) {
                    randomPickCache[len] = { indices: [...Array(len).keys()], position: len };
                }
                const cache = randomPickCache[len];
                if (cache.position >= cache.indices.length) {
                    for (let i = cache.indices.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [cache.indices[i], cache.indices[j]] = [cache.indices[j], cache.indices[i]];
                    }
                    cache.position = 0;
                }
                return params[cache.indices[cache.position++]];
            }
            default:
                return match;
        }
    });
}

export function hasVariableTranscriptions(parsed: ParsedDialogue): boolean {
    return parsed.transcribers.some(t => Object.keys(t.metadata).some(k => k.startsWith('var-')));
}

export function createBaseEntry(baseId: string, parsed: ParsedDialogue): Entry {
    parsed.transcribers.forEach(t => {
        if (t.metadata && t.metadata._clearGlobalMap !== undefined) delete t.metadata._clearGlobalMap;
    });
    return { id: baseId, metadata: parsed.metadata, transcribers: parsed.transcribers, hints: parsed.hints };
}

function resolveVariables(metadata: Metadata): Record<string, string> {
    return Object.entries(metadata)
        .filter(([k]) => k.startsWith('var-'))
        .reduce((acc, [k, v]) => ({ ...acc, [k.slice(4)]: v }), {} as Record<string, string>);
}

function createVariableKey(variables: Record<string, string>): string {
    return JSON.stringify(Object.entries(variables).sort());
}

interface VariableGroup {
    variables: Record<string, string>;
    transcribers: Transcriber[];
}

function groupTranscriptionsByVariables(transcribers: Transcriber[]): Map<string, VariableGroup> {
    const groups = new Map<string, VariableGroup>();
    transcribers.forEach(transcriber => {
        const variables = resolveVariables(transcriber.metadata);
        const key = createVariableKey(variables);
        if (!groups.has(key)) groups.set(key, { variables, transcribers: [] });
        groups.get(key)!.transcribers.push(transcriber);
    });
    return groups;
}

function resolveMetadata(metadata: Metadata, variables: Record<string, string>): Metadata {
    return Object.fromEntries(
        Object.entries(metadata).map(([k, v]) => [
            k,
            Array.isArray(v) ? v.map(item => resolvePatterns(item, variables)) : resolvePatterns(v, variables),
        ]),
    );
}

function resolveTranscriberMetadata(transcriber: Transcriber, variables: Record<string, string>, baseMetadata: Metadata): Transcriber {
    const resolved: Metadata = Object.fromEntries(
        Object.entries(transcriber.metadata).map(([k, v]) => [
            k,
            typeof v === 'string' ? resolvePatterns(v, variables) : v,
        ]),
    );

    const shouldClearGlobal = resolved._clearGlobalMap;
    if (resolved._clearGlobalMap !== undefined) delete resolved._clearGlobalMap;

    const mergedMap = shouldClearGlobal
        ? (resolved.map || [])
        : [...new Set([...(baseMetadata.map || []), ...(resolved.map || [])])];

    return {
        ...transcriber,
        metadata: {
            ...baseMetadata,
            ...resolved,
            map: mergedMap,
            tags: [...new Set([...(baseMetadata.tags || []), ...(resolved.tags || [])])],
        },
    };
}

function resolveHints(hints: Hint[], variables: Record<string, string>): Hint[] {
    return hints.map(hint => ({
        ...hint,
        lines: hint.lines.map(line => (typeof line === 'string' ? resolvePatterns(line, variables) : line)),
    }));
}

function createVariableGroupEntry(baseId: string, parsed: ParsedDialogue, group: VariableGroup): Entry {
    const resolvedId = resolvePatterns(baseId, group.variables);
    const resolvedMetadata = resolveMetadata(parsed.metadata, group.variables);

    const resolvedTranscribers = group.transcribers.map(t =>
        resolveTranscriberMetadata(t, group.variables, resolvedMetadata),
    );

    if (!resolvedMetadata.name) resolvedMetadata.name = resolvedTranscribers.find(t => t.metadata.name)?.metadata.name;
    if (!resolvedMetadata.color) resolvedMetadata.color = resolvedTranscribers.find(t => t.metadata.color)?.metadata.color;
    if (!resolvedMetadata.subType) resolvedMetadata.subType = resolvedTranscribers.find(t => t.metadata.subType)?.metadata.subType;

    if (!resolvedMetadata.tags || resolvedMetadata.tags.length === 0) {
        resolvedMetadata.tags = resolvedTranscribers
            .flatMap(t => t.metadata.tags || [])
            .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i);
    }

    resolvedTranscribers.forEach(transcriber => {
        delete transcriber.metadata._clearGlobalMap;
        if (transcriber.metadata.superValues) {
            for (const [key, value] of Object.entries(transcriber.metadata.superValues)) {
                resolvedMetadata[key] = value;
            }
        }
    });

    return {
        id: resolvedId,
        metadata: resolvedMetadata,
        transcribers: resolvedTranscribers,
        hints: resolveHints(parsed.hints, group.variables),
    };
}

export function processVariableEntries(baseId: string, parsed: ParsedDialogue): Entry[] {
    const groups = groupTranscriptionsByVariables(parsed.transcribers);
    return Array.from(groups.values()).map(group => createVariableGroupEntry(baseId, parsed, group));
}

/** Expand a parsed file into one or more final entries, depending on variable usage. */
export function expandEntries(baseId: string, parsed: ParsedDialogue): Entry[] {
    if (!hasVariableTranscriptions(parsed)) return [createBaseEntry(baseId, parsed)];
    return processVariableEntries(baseId, parsed);
}
