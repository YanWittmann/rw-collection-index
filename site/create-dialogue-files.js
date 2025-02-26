const fs = require('fs');
const path = require('path');

// CONFIGURATION - Update these paths as needed
const DIALOGUE_DIR = path.join(__dirname, '../dialogue'); // Directory containing text files
const OUTPUT_FILE = path.join(__dirname, 'src/generated/parsed-dialogues.json');

function parseLine(line) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) {
        return { text: line };
    }

    return {
        speaker: line.slice(0, colonIndex).trim(),
        text: line.slice(colonIndex + 1).trim()
    };
}

function parseTranscriberSection(sectionLines) {
    if (sectionLines.length === 0) return null;

    const transcriber = sectionLines[0].replace('=== ', '').trim();
    const lines = sectionLines.slice(1).map(parseLine);

    return {
        transcriber,
        lines
    };
}

function parseDialogueContent(content) {
    const lines = content.split('\n').map(l => l.trim()).filter(l => l);

    // Extract color and type from first two lines
    const color = lines[0].split(':')[1].trim();
    const type = lines[1].split(':')[1].trim();

    // Split into sections
    const sections = [];
    let currentSection = [];

    for (const line of lines.slice(2)) {
        if (line.startsWith('===')) {
            if (currentSection.length > 0) {
                sections.push(currentSection);
                currentSection = [];
            }
        }
        currentSection.push(line);
    }

    if (currentSection.length > 0) {
        sections.push(currentSection);
    }

    return {
        color,
        type,
        transcribers: sections.map(parseTranscriberSection).filter(Boolean)
    };
}

function processDialogueFiles() {
    try {
        const files = fs.readdirSync(DIALOGUE_DIR)
            .filter(f => f.endsWith('.txt'));

        const result = files.map(file => {
            const content = fs.readFileSync(path.join(DIALOGUE_DIR, file), 'utf-8');
            const id = path.basename(file, '.txt');
            const parsed = parseDialogueContent(content);

            return {
                id,
                ...parsed
            };
        });

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));
        console.log(`Successfully parsed ${files.length} files to ${OUTPUT_FILE}`);
    } catch (error) {
        console.error('Error processing files:', error);
        process.exit(1);
    }
}

processDialogueFiles();