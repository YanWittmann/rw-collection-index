const fs = require('fs');
const path = require('path');

// CONFIGURATION
const DIALOGUE_DIR = path.join(__dirname, '../dialogue');
const OUTPUT_FILE = path.join(__dirname, 'src/generated/parsed-dialogues.json');
const MAX_SPEAKER_LENGTH = 12;

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
            return { namespace: namespacedMatch[1], value: namespacedMatch[2] };
        }
    }
    return null;
}

const sectionHandlers = {
    transcription: (sectionLines, value) => {
        // Extract metadata lines starting with md-
        const metadata = {};
        const lines = [];

        for (const line of sectionLines) {
            if (line.startsWith('md-')) {
                const colonIndex = line.indexOf(':');
                if (colonIndex > -1) {
                    const key = line.slice(3, colonIndex).trim(); // Remove 'md-' prefix
                    metadata[key] = line.slice(colonIndex + 1).trim();
                }
            } else {
                lines.push(line);
            }
        }

        return {
            transcriber: value,
            metadata: metadata,
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

    // Parse metadata
    const metadata = {};
    let sectionStartIndex = 0;

    while (sectionStartIndex < lines.length && !lines[sectionStartIndex].startsWith('===')) {
        const line = lines[sectionStartIndex];
        const colonIndex = line.indexOf(':');
        if (colonIndex > -1) {
            metadata[line.slice(0, colonIndex).trim()] = line.slice(colonIndex + 1).trim();
        }
        sectionStartIndex++;
    }

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
                result.transcribers.push(sectionData);
            } else if (currentHeader.namespace === 'hint') {
                result.hints.push(sectionData);
            }
        }
    }

    return { metadata, ...result };
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

function processDialogueFiles() {
    try {
        const files = getAllFiles(DIALOGUE_DIR);
        console.log(`Found ${files.length} files in ${DIALOGUE_DIR} to process`);

        const result = files.map(file => {
            const content = fs.readFileSync(path.join(file), 'utf-8');
            const id = path.basename(file, '.txt');
            const parsed = parseDialogueContent(content);

            return {
                id,
                ...parsed
            };
        });

        fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));
        console.log(`Successfully parsed ${files.length} files to ${OUTPUT_FILE}`);
    } catch (error) {
        console.error('Error processing files:', error);
        process.exit(1);
    }
}

processDialogueFiles();