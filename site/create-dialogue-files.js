const fs = require('fs');
const path = require('path');

// CONFIGURATION
const DIALOGUE_DIR = path.join(__dirname, '../dialogue');
const OUTPUT_FILE = path.join(__dirname, 'src/generated/parsed-dialogues.json');
const MAX_SPEAKER_LENGTH = 12;
const PATTERN_REGEX = /\{([^}]+)\}/g;

const generalWhiteGrayBroadcasts = [
    { region: "SU", room: "A17", mapSlugcat: "spear" },
    { region: "HI", room: "B02", mapSlugcat: "spear" },
    { region: "DS", room: "A11", mapSlugcat: "spear" },
    { region: "SH", room: "B03", mapSlugcat: "spear" },
    { region: "VS", room: "A05", mapSlugcat: "spear" },
    { region: "VS", room: "B10", mapSlugcat: "spear" },
    { region: "UW", room: "J01", mapSlugcat: "spear" },
    { region: "SS", room: "D08", mapSlugcat: "spear" },
    { region: "LF", room: "D01", mapSlugcat: "spear" },
    { region: "SB", room: "C07", mapSlugcat: "spear" },
    { region: "LM", room: "EDGE02", mapSlugcat: "spear" },
]

const mapMetadataTemplates = {
    "MAP-WHITE-BROADCASTS": generalWhiteGrayBroadcasts,
    "MAP-GRAY-BROADCASTS": generalWhiteGrayBroadcasts,
    "MAP-BROADCAST-PEARLS": [
    ]
}

// Track selections for arrays of the same length
const randomPickCache = {};

function resolvePatterns(value, variables = {}) {
    if (typeof value !== 'string') return value;

    return value.replace(PATTERN_REGEX, (match, pattern) => {
        const [type, ...params] = pattern.split('--');
        switch(type) {
            case 'var':
                return variables[params[0]] || match;
            case 'randomPick': {
                const len = params.length;

                // Initialize cache for this length if it doesn't exist
                if (!randomPickCache[len]) {
                    randomPickCache[len] = {
                        indices: [...Array(len).keys()], // [0,1,2,...len-1]
                        position: len // Start at end to force initial shuffle
                    };
                }

                const cache = randomPickCache[len];

                // If we've used all indices, reshuffle
                if (cache.position >= cache.indices.length) {
                    // Fisher-Yates shuffle
                    for (let i = cache.indices.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [cache.indices[i], cache.indices[j]] = [cache.indices[j], cache.indices[i]];
                    }
                    cache.position = 0;
                }

                // Get next index and advance position
                const index = cache.indices[cache.position++];
                return params[index];
            }
            default:
                return match;
        }
    });
}

function hasVariableTranscriptions(parsedData) {
    return parsedData.transcribers.some(t =>
        Object.keys(t.metadata).some(k => k.startsWith('var-'))
    );
}

function createBaseEntry(baseId, parsedData) {
    return { id: baseId, ...parsedData };
}

function processVariableEntries(baseId, parsedData) {
    const variableGroups = groupTranscriptionsByVariables(parsedData.transcribers);
    return Array.from(variableGroups.values()).map(group =>
        createVariableGroupEntry(baseId, parsedData, group)
    );
}

function groupTranscriptionsByVariables(transcribers) {
    const groups = new Map();

    transcribers.forEach(transcriber => {
        const variables = resolveVariables(transcriber.metadata);
        const variableKey = createVariableKey(variables);

        if (!groups.has(variableKey)) {
            groups.set(variableKey, {
                variables,
                transcribers: [],
                randomValues: {}
            });
        }

        groups.get(variableKey).transcribers.push(transcriber);
    });

    return groups;
}

function createVariableKey(variables) {
    return JSON.stringify(Object.entries(variables).sort());
}

function createVariableGroupEntry(baseId, parsedData, group) {
    // Resolve base entry properties
    const resolvedId = resolvePatterns(baseId, group.variables);
    const resolvedMetadata = resolveMetadata(parsedData.metadata, group.variables);

    // Resolve all transcribers in the group
    const resolvedTranscribers = group.transcribers.map(transcriber =>
        resolveTranscriberMetadata(transcriber, group.variables, resolvedMetadata)
    );

    // check if the metadata does not contain a name. If so, check if any transcriber has a name and use that as the name
    if (!resolvedMetadata.name) {
        resolvedMetadata.name = resolvedTranscribers.find(t => t.metadata.name)?.metadata.name;
    }
    if (!resolvedMetadata.color) {
        resolvedMetadata.color = resolvedTranscribers.find(t => t.metadata.color)?.metadata.color;
    }

    return {
        id: resolvedId,
        metadata: resolvedMetadata,
        transcribers: resolvedTranscribers,
        hints: resolveHints(parsedData.hints, group.variables)
    };
}

function resolveMetadata(metadata, variables) {
    return Object.fromEntries(
        Object.entries(metadata).map(([k, v]) => [
            k,
            resolvePatterns(v, variables)
        ])
    );
}

function resolveTranscriberMetadata(transcriber, variables, baseMetadata) {
    const resolvedTransMetadata = Object.fromEntries(
        Object.entries(transcriber.metadata).map(([k, v]) => [
            k,
            typeof v === 'string' ? resolvePatterns(v, variables) : v
        ])
    );

    return {
        ...transcriber,
        metadata: {
            ...baseMetadata,
            ...resolvedTransMetadata,
            map: [
                ...new Set([
                    ...(baseMetadata.map || []),
                    ...(resolvedTransMetadata.map || [])
                ])
            ]
        }
    };
}

function resolveHints(hints, variables) {
    return hints.map(hint => ({
        ...hint,
        lines: hint.lines.map(line =>
            typeof line === 'string' ? resolvePatterns(line, variables) : line
        )
    }));
}

function resolveVariables(metadata) {
    return Object.entries(metadata)
        .filter(([k]) => k.startsWith('var-'))
        .reduce((acc, [k, v]) => ({
            ...acc,
            [k.slice(4)]: v
        }), {});
}

function parseMapEntries(value) {
    if (mapMetadataTemplates[value]) {
        return mapMetadataTemplates[value];
    }

    const entry = {};
    value.split(',')
        .map(part => part.trim())
        .forEach(pair => {
            const [key, value] = pair.split('=').map(s => s.trim());
            if (key && value) entry[key] = value;
        });
    return [entry];
}

function parseLine(line) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1 || colonIndex > MAX_SPEAKER_LENGTH) {
        return { text: line };
    }

    const speakerPart = line.slice(0, colonIndex).trim();
    // Only recognize as speaker if it's not metadata and within length limit
    if (!speakerPart.startsWith('md-') && speakerPart.length <= MAX_SPEAKER_LENGTH) {
        return {
            speaker: speakerPart,
            text: line.slice(colonIndex + 1).trim()
        };
    }

    return { text: line };
}


function parseSectionHeader(headerLine) {
    if (headerLine.startsWith('=== ')) {
        const legacyMatch = headerLine.match(/^=== (\w+)$/);
        if (legacyMatch) {
            return { namespace: 'transcription', value: legacyMatch[1] };
        }

        const namespacedMatch = headerLine.match(/^=== (\w+): (.+)$/);
        if (namespacedMatch) {
            return {
                namespace: namespacedMatch[1],
                value: namespacedMatch[2]
            };
        }
    }
    return null;
}

const sectionHandlers = {
    transcription: (sectionLines, value) => {
        // Extract metadata lines starting with md-
        const metadata = { map: [] };
        const lines = [];

        sectionLines.forEach(line => {
            if (line.startsWith('md-')) {
                const colonIndex = line.indexOf(':');
                if (colonIndex > -1) {
                    const key = line.slice(3, colonIndex).trim(); // remove 'md-' prefix
                    const val = line.slice(colonIndex + 1).trim();

                    if (key === 'map') {
                        parseMapEntries(val).forEach(entry => metadata.map.push(entry));
                    } else {
                        metadata[key] = val;
                    }
                }
            } else {
                lines.push(line);
            }
        });

        return {
            transcriber: value,
            metadata: {
                ...metadata,
                map: metadata.map.length > 0 ? metadata.map : undefined
            },
            lines: lines.map(parseLine)
        };
    },

    hint: (sectionLines, value) => ({
        name: value,
        lines: sectionLines
    })
};

function parseDialogueContent(content) {
    const lines = content.split('\n').map(l => l.trim()).filter(l => l);

    // Parse global metadata
    const metadata = { map: [] };
    let sectionStartIndex = 0;

    while (sectionStartIndex < lines.length && !lines[sectionStartIndex].startsWith('===')) {
        const line = lines[sectionStartIndex];
        const colonIndex = line.indexOf(':');
        if (colonIndex > -1) {
            const key = line.slice(0, colonIndex).trim();
            const value = line.slice(colonIndex + 1).trim();

            if (key === 'map') {
                parseMapEntries(value).forEach(entry => metadata.map.push(entry));
            } else {
                metadata[key] = value;
            }
        }
        sectionStartIndex++;
    }

    // Clean up empty arrays
    if (metadata.map.length === 0) delete metadata.map;

    // Parse sections
    const result = {
        transcribers: [],
        hints: []
    };

    let currentHeader = null;
    let currentSectionLines = [];

    for (let i = sectionStartIndex; i < lines.length; i++) {
        const line = lines[i];

        if (line.startsWith('===')) {
            if (currentHeader) {
                const handler = sectionHandlers[currentHeader.namespace];
                if (handler) {
                    const sectionData = handler(currentSectionLines, currentHeader.value);
                    if (currentHeader.namespace === 'transcription') {
                        // iterate over the metadata of the transcriber and add all properties of the global metadata to it that are not already set
                        for (const key in metadata) {
                            if (metadata.hasOwnProperty(key) && !sectionData.metadata.hasOwnProperty(key)) {
                                sectionData.metadata[key] = metadata[key];
                            }
                        }
                        // check whether the transcriber has any map entries and if not, add those from the global metadata
                        if (!sectionData.metadata.map || sectionData.metadata.map.length === 0) {
                            sectionData.metadata.map = metadata.map;
                        }
                        result.transcribers.push(sectionData);
                    } else if (currentHeader.namespace === 'hint') {
                        result.hints.push(sectionData);
                    }
                }
            }

            currentHeader = parseSectionHeader(line);
            currentSectionLines = [];
        } else if (currentHeader) {
            currentSectionLines.push(line);
        }
    }

    // Process remaining section
    if (currentHeader && currentSectionLines.length > 0) {
        const handler = sectionHandlers[currentHeader.namespace];
        if (handler) {
            const sectionData = handler(currentSectionLines, currentHeader.value);
            if (currentHeader.namespace === 'transcription') {
                // iterate over the metadata of the transcriber and add all properties of the global metadata to it that are not already set
                for (const key in metadata) {
                    if (metadata.hasOwnProperty(key) && !sectionData.metadata.hasOwnProperty(key)) {
                        sectionData.metadata[key] = metadata[key];
                    }
                }
                // check whether the transcriber has any map entries and if not, add those from the global metadata
                if (!sectionData.metadata.map || sectionData.metadata.map.length === 0) {
                    sectionData.metadata.map = metadata.map;
                }
                result.transcribers.push(sectionData);
            } else if (currentHeader.namespace === 'hint') {
                result.hints.push(sectionData);
            }
        }
    }

    return {
        metadata: {
            ...metadata,
            map: metadata.map || undefined
        },
        ...result
    };
}

const getAllFiles = (dir, fileList = []) => {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getAllFiles(filePath, fileList);
        } else if (file.endsWith('.txt')) {
            fileList.push(filePath);
        }
    });
    return fileList;
};

function writeOutput(result) {
    fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result));
    console.log(`Successfully parsed ${result.length} files to ${OUTPUT_FILE}`);
}

function handleProcessingError(error) {
    console.error('Error processing files:', error);
    process.exit(1);
}

function processDialogueFiles() {
    try {
        const files = getAllFiles(DIALOGUE_DIR);
        console.log(`Found ${files.length} files in ${DIALOGUE_DIR} to process`);

        const result = files.flatMap(file => {
            const content = fs.readFileSync(file, 'utf-8');
            const baseId = path.basename(file, '.txt');
            const parsed = parseDialogueContent(content);

            if (!hasVariableTranscriptions(parsed)) {
                return [createBaseEntry(baseId, parsed)];
            }

            return processVariableEntries(baseId, parsed);
        });

        writeOutput(result);
        return result;
    } catch (error) {
        handleProcessingError(error);
    }
}

processDialogueFiles();