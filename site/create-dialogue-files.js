const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const levenshtein = require('fast-levenshtein');

const PROFILES = {
    vanilla: {
        dialogueDir: path.join(__dirname, '../dialogue'),
        outputFile: path.join(__dirname, 'src/generated/parsed-dialogues.json'),
        sourceDecryptedOutputFile: path.join(__dirname, 'src/generated/source-decrypted.json'),
    },
    modded: {
        dialogueDir: path.join(__dirname, '../dialogue-modded'),
        outputFile: path.join(__dirname, 'src/generated/parsed-dialogues-modded.json'),
        sourceDecryptedOutputFile: path.join(__dirname, 'src/generated/source-decrypted-modded.json'),
    },
};

function getProfileName() {
    const argIndex = process.argv.indexOf('--profile');
    if (argIndex > -1 && process.argv[argIndex + 1]) {
        return process.argv[argIndex + 1];
    }
    return 'vanilla';
}

const profileName = getProfileName();
const activeProfile = PROFILES[profileName];

if (!activeProfile) {
    console.error(`Error: Profile "${profileName}" not found.`);
    console.error(`Available profiles: ${Object.keys(PROFILES).join(', ')}`);
    process.exit(1);
}

const { dialogueDir, outputFile, sourceDecryptedOutputFile } = activeProfile;

console.log(`Using profile: "${profileName}"`);
console.log(`Input Directory: ${dialogueDir}`);
console.log(`Output File: ${outputFile}`);
console.log(`Source Decrypted Output File: ${sourceDecryptedOutputFile}`);

const MAX_SPEAKER_LENGTH = 12;
const PATTERN_REGEX = /\{([^}]+)\}/g;

// ignore speakers
const excludeSpeakers = [
    "Water",
    "Hydrocarbons",
    "Sulfur",
    "Silicon",
    "Phosphates",
    "EM", // equipment manifest
    "Five Pebbsi",
    "Behold",
    "Imagine",
    "CONSIDER",
    "NOW",
    "TO",
]

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
    "MAP-BROADCAST-PEARLS": []
}

// SECTION: rain world game text source files

function parseSourceDecryptedJsonFile(filePath) {
    try {
        const fileData = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(fileData);
        // preprocess
        return jsonData.filter(entry => entry.c !== undefined).map(entry => ({
            ...entry,
            linesA: entry.c.split(/\n|<LINE>/).map(l => l.replace(/^((\d+|[A-Z]+) : )+/, '').trim()).filter(l => l),
            linesB: entry.c.split(/\n/).map(l => l.replace(/^((\d+|[A-Z]+) : )+/, '').trim()).filter(l => l)
        }));
    } catch (error) {
        console.error('Error reading or parsing the JSON file:', error);
        return null;
    }
}

const sourceDecryptedJsonFile = path.join(dialogueDir, 'source/decrypted.json');
const gameFiles = parseSourceDecryptedJsonFile(sourceDecryptedJsonFile);

// copy file to generated folder
fs.copyFileSync(sourceDecryptedJsonFile, sourceDecryptedOutputFile);

// SECTION: rain world game source images
const sourceImgDir = path.join(dialogueDir, 'source/img');
const publicImgDir = path.join(__dirname, 'public/img/src');

fs.rmSync(publicImgDir, { recursive: true, force: true });
fs.cpSync(sourceImgDir, publicImgDir, { recursive: true });

console.log(`Successfully copied image directory ${sourceImgDir} to ${publicImgDir}`);

function normalizedLevenshteinDistance(a, b) {
    const maxLength = Math.max(a.length, b.length);
    if (maxLength === 0) return 0;
    const distance = levenshtein.get(a, b);
    return 1 - (distance / maxLength);
}

/*console.log(findBestMatch(
    []
));*/

// if (true) process.exit(0);

function checkLinesMatch(lines, entryLines) {
    let matchCount = 0;
    let totalScore = 0;

    lines.forEach(line => {
        let maxLineScore = 0;

        entryLines.forEach(entryLine => {
            const score = normalizedLevenshteinDistance(line, entryLine);
            if (score > maxLineScore) {
                maxLineScore = score;
            }
            if (maxLineScore === 1) {
                return;
            }
        });

        if (maxLineScore >= 0.4) {
            matchCount++;
        }

        totalScore += maxLineScore;
    });

    const matchPercentage = (matchCount / lines.length) * 100;
    return { matchPercentage, totalScore };
}

function findBestMatch(lines) {
    lines = [...lines];

    lines = lines.filter(line => !line.includes("MONO"));
    lines = lines.filter(line => !line.startsWith("/") && !line.startsWith("~"));
    lines = lines.map(line => line.replace(/^\|/, "").trim());
    lines = lines.flatMap(line => line.split("\\n"));
    lines = lines.filter(line => line.trim().length > 0);

    let bestMatch = null;
    let bestScore = -1;

    gameFiles.forEach(entry => {
        let { matchPercentage, totalScore } = checkLinesMatch(lines, entry.linesA);
        if (matchPercentage < 80) {
            const resultB = checkLinesMatch(lines, entry.linesB);
            if (resultB.matchPercentage >= 80) {
                matchPercentage = resultB.matchPercentage;
                totalScore = resultB.totalScore;
            }
        }

        if (matchPercentage >= 80) {
            const averageScore = totalScore / lines.length;
            if (averageScore > bestScore) {
                bestScore = averageScore;
                bestMatch = entry;
            }
        }
    });

    if (bestMatch === null) {
        console.log('No match found for:', lines);
    }

    return bestMatch;
}

// SECTION: Patterns resolution
const randomPickCache = {};

function resolvePatterns(value, variables = {}) {
    if (typeof value !== 'string') return value;

    return value.replace(PATTERN_REGEX, (match, pattern) => {
        const [type, ...params] = pattern.split('--');
        switch (type) {
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
    // Remove internal flags from transcribers before returning
    parsedData.transcribers.forEach(t => {
        if (t.metadata && t.metadata._clearGlobalMap !== undefined) {
            delete t.metadata._clearGlobalMap;
        }
    });
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

    // Fallback for missing metadata properties
    if (!resolvedMetadata.name) {
        resolvedMetadata.name = resolvedTranscribers.find(t => t.metadata.name)?.metadata.name;
    }
    if (!resolvedMetadata.color) {
        resolvedMetadata.color = resolvedTranscribers.find(t => t.metadata.color)?.metadata.color;
    }
    if (!resolvedMetadata.subType) {
        resolvedMetadata.subType = resolvedTranscribers.find(t => t.metadata.subType)?.metadata.subType;
    }

    // Ensure tags are included in the final metadata
    if (!resolvedMetadata.tags || resolvedMetadata.tags.length === 0) {
        resolvedMetadata.tags = resolvedTranscribers
            .flatMap(t => t.metadata.tags || [])
            .filter((v, i, a) => a.indexOf(v) === i);
    }

    // go through the transcribers and add the superValues to the metadata
    resolvedTranscribers.forEach(transcriber => {
        delete transcriber.metadata._clearGlobalMap; // Ensure internal flag is removed
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

    const shouldClearGlobal = resolvedTransMetadata._clearGlobalMap;

    // Clean up the internal flag
    if (resolvedTransMetadata._clearGlobalMap !== undefined) {
        delete resolvedTransMetadata._clearGlobalMap;
    }

    const mergedMap = shouldClearGlobal
        ? (resolvedTransMetadata.map || [])
        : [
            ...new Set([
                ...(baseMetadata.map || []),
                ...(resolvedTransMetadata.map || [])
            ])
        ];

    return {
        ...transcriber,
        metadata: {
            ...baseMetadata,
            ...resolvedTransMetadata,
            map: mergedMap,
            tags: [
                ...new Set([
                    ...(baseMetadata.tags || []),
                    ...(resolvedTransMetadata.tags || [])
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
    // Only recognize as speaker if it's not metadata, not in excludeSpeakers array, and within length limit
    if (!speakerPart.startsWith('md-') &&
        !speakerPart.startsWith('|') &&
        !speakerPart.startsWith('/') &&
        !speakerPart.startsWith('~') &&
        !excludeSpeakers.includes(speakerPart) &&
        speakerPart.length <= MAX_SPEAKER_LENGTH) {
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
        const metadata = {
            map: [],
            tags: [],
            sourceDialogue: [],
        };
        const lines = [];

        sectionLines.forEach(line => {
            if (line.startsWith('md-')) {
                const colonIndex = line.indexOf(':');
                if (colonIndex > -1) {
                    const key = line.slice(3, colonIndex).trim(); // remove 'md-' prefix
                    const val = line.slice(colonIndex + 1).trim();

                    if (key === 'map') {
                        if (val.toLowerCase() === 'none') {
                            metadata.map = [];
                            metadata._clearGlobalMap = true;
                        } else {
                            parseMapEntries(val).forEach(entry => metadata.map.push(entry));
                        }
                    } else if (key === 'tag') {
                        const tags = val.split(',').map(t => t.trim());
                        metadata.tags.push(...tags);
                    } else if (key === 'sourceDialogue') {
                        metadata.sourceDialogue.push(val);
                    } else if (key.startsWith('super-')) {
                        if (!metadata.superValues) metadata.superValues = {};
                        metadata.superValues[key.slice(6)] = val;
                    } else {
                        metadata[key] = val;
                    }
                }
            } else {
                lines.push(line);
            }
        });

        // add these tags if one of the transcribers is listed
        const tagAddons = {
            "downpour": [
                "LttM-saint", "LttM-rivulet", "LttM-pre-collapse", "LttM-gourmand",
                "FP-artificer",
                "LttM-FP-saint",
                "broadcast-pre-FP", "broadcast-post-FP", "broadcast",
                "saint", "rivulet", "artificer",
            ],
        }
        for (const [tag, transcribers] of Object.entries(tagAddons)) {
            if (transcribers.includes(value)) {
                metadata.tags.push(tag);
            }
        }

        // use the findBestMatch to determine the best match for the transcriber text
        if (metadata.sourceDialogue.length === 0 && process.argv.includes('--sourceFiles')) {
            const bestMatch = findBestMatch(lines);
            if (bestMatch) {
                metadata.sourceDialogue = [bestMatch.p];
            }
        }
        metadata.sourceDialogue = metadata.sourceDialogue.filter(s => s !== "none");

        return {
            transcriber: value,
            metadata: {
                ...metadata,
                map: metadata.map.length > 0 ? metadata.map : undefined,
                tags: metadata.tags.length > 0 ? metadata.tags : undefined,
                sourceDialogue: metadata.sourceDialogue.length > 0 ? metadata.sourceDialogue : undefined,
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
    const metadata = {
        map: [],
        tags: [] // Initialize tags array
    };
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
                // Split comma-separated tags and trim whitespace
                const tags = value.split(',').map(t => t.trim());
                metadata.tags.push(...tags);
            } else {
                metadata[key] = value;
            }
        }
        sectionStartIndex++;
    }

    // Clean up empty arrays
    if (metadata.map.length === 0) delete metadata.map;
    if (metadata.tags.length === 0) delete metadata.tags;

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
                        // Merge global metadata into transcription metadata
                        for (const key in metadata) {
                            if (metadata.hasOwnProperty(key) && !sectionData.metadata.hasOwnProperty(key)) {
                                sectionData.metadata[key] = metadata[key];
                            }
                        }

                        // Check for global map clearing flag
                        const clearGlobal = sectionData.metadata._clearGlobalMap;

                        // Merge map arrays using Set
                        if (clearGlobal) {
                            // If clearing global map, use only section map
                            // Ensure we handle the case where section map might be undefined/empty after clearing
                            sectionData.metadata.map = sectionData.metadata.map || [];
                        } else {
                            sectionData.metadata.map = [
                                ...new Set([
                                    ...(sectionData.metadata.map || []),
                                    ...(metadata.map || [])
                                ])
                            ];
                        }

                        // Clean up if empty
                        if (sectionData.metadata.map && sectionData.metadata.map.length === 0) {
                            delete sectionData.metadata.map;
                        }

                        // Merge tag arrays using Set
                        sectionData.metadata.tags = [
                            ...new Set([
                                ...(sectionData.metadata.tags || []),
                                ...(metadata.tags || [])
                            ])
                        ];

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
                // Merge global metadata into transcription metadata
                for (const key in metadata) {
                    if (metadata.hasOwnProperty(key) && !sectionData.metadata.hasOwnProperty(key)) {
                        sectionData.metadata[key] = metadata[key];
                    }
                }

                // Check for global map clearing flag
                const clearGlobal = sectionData.metadata._clearGlobalMap;

                // Merge map arrays using Set
                if (clearGlobal) {
                    sectionData.metadata.map = sectionData.metadata.map || [];
                } else {
                    sectionData.metadata.map = [
                        ...new Set([
                            ...(sectionData.metadata.map || []),
                            ...(metadata.map || [])
                        ])
                    ];
                }

                // Clean up if empty
                if (sectionData.metadata.map && sectionData.metadata.map.length === 0) {
                    delete sectionData.metadata.map;
                }

                // Merge tag arrays using Set
                sectionData.metadata.tags = [
                    ...new Set([
                        ...(sectionData.metadata.tags || []),
                        ...(metadata.tags || [])
                    ])
                ];

                result.transcribers.push(sectionData);
            } else if (currentHeader.namespace === 'hint') {
                result.hints.push(sectionData);
            }
        }
    }

    return {
        metadata: {
            ...metadata,
            map: metadata.map || undefined,
            tags: metadata.tags || undefined
        },
        ...result
    };
}

function postProcessTags(pearl) {
    for (let transcriber of pearl.transcribers) {
        if (!transcriber.metadata.tags.includes("downpour") && !transcriber.metadata.tags.includes("watcher")) {
            transcriber.metadata.tags.push("vanilla");
        }
    }
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
    fs.mkdirSync(path.dirname(outputFile), { recursive: true });
    fs.writeFileSync(outputFile, JSON.stringify(result));
    console.log(`Successfully parsed ${result.length} files to ${outputFile}`);
}

function handleProcessingError(error) {
    console.error('Error processing files:', error);
    process.exit(1);
}

function processDialogueFiles() {
    try {
        const files = getAllFiles(dialogueDir);
        console.log(`Found ${files.length} files in ${dialogueDir} to process`);

        const result = files.flatMap(file => {
            if (file.replaceAll("\\\\", "/").replaceAll("\\", "/").includes('source/')) {
                return []; // Skip the source decrypted file
            }

            const content = fs.readFileSync(file, 'utf-8');
            const baseId = path.basename(file, '.txt');
            const parsed = parseDialogueContent(content);

            if (!hasVariableTranscriptions(parsed)) {
                return [createBaseEntry(baseId, parsed)];
            }

            return processVariableEntries(baseId, parsed);
        });

        result.forEach(postProcessTags);

        writeOutput(result);
        return result;
    } catch (error) {
        handleProcessingError(error);
    }
}

function watchDialogueFiles() {
    const watcher = chokidar.watch(dialogueDir, {
        persistent: true,
        ignoreInitial: true, // ignore initial scan to avoid double-processing
        depth: 99, // watch all subdirectories
    });

    watcher.on('all', (event, filePath) => {
        if (filePath.endsWith('.txt')) {
            console.log(`Detected change in ${filePath}. Re-generating...`);
            processDialogueFiles();
        }
    });

    console.log(`Watching for changes in ${dialogueDir}...`);
}

if (process.argv.includes('--watch')) {
    console.log('Starting in watch mode...');
    watchDialogueFiles();
} else {
    console.log('Processing files once...');
    processDialogueFiles();
}
