// run on https://rainworld.miraheze.org/wiki/Developer_Commentary
// make sure to move the paincat's entries to the bottom.

let result = Array.from(document.querySelectorAll('.broadcast')).map(broadcast => {
    const entries = [];
    let currentEntry = null;

    // Iterate through all child nodes of the broadcast element
    Array.from(broadcast.children).forEach(child => {
        if (child.tagName === 'H3') {
            // Extract region and name from the mw-headline span
            const headlineSpan = child.querySelector('.mw-headline');
            const [idPart, namePart] = headlineSpan.textContent.split(' (');
            const region = idPart.split(' ')[0];
            const name = namePart.slice(0, -1); // Remove closing parenthesis

            currentEntry = {
                region,
                name,
                lines: []
            };
        } else if (child.tagName === 'BLOCKQUOTE' && currentEntry) {
            // Process all paragraphs in the blockquote
            currentEntry.lines = Array.from(child.querySelectorAll('p')).map(p => {
                return p.textContent
                    .replace(/\n+/g, '\n')
                    .split('\n')
                    .map(line => line.trim())
                    .filter(line => line)
                    .join('\n');
            });

            entries.push(currentEntry);
            currentEntry = null;
        }
    });

    return entries;
}).flat();

console.log(result.map(entry => {
    // Split region code into components
    const [regionBase, suffix] = entry.region.split('_', 2);
    const [roomCode, mapSlugcat] = (suffix || '').split('-', 2);

    const explicitRoomMap = {
        'GW_PIPE06': { region: 'GW', room: 'PIPE06', mapSlugcat: 'artificer' },
        'LC_ELEVATORLOWER': { region: 'LC', room: 'elevatorlower', mapSlugcat: 'artificer' },
        'LC_ENTRANCEZONE': { region: 'LC', room: 'entrancezone', mapSlugcat: 'artificer' },
        'LC_FENCE': { region: 'LC', room: 'fence', mapSlugcat: 'artificer' },
        'LC_HIGHESTPOINT': { region: 'LC', room: 'highestpoint', mapSlugcat: 'artificer' },
        'LC_MALLENTRANCE': { region: 'LC', room: 'mallentrance', mapSlugcat: 'artificer' },
        'LC_ROOFTOPHOP': { region: 'LC', room: 'rooftophop', mapSlugcat: 'artificer' },
        'LC_STREETS': { region: 'LC', room: 'streets', mapSlugcat: 'artificer' },
        'LC_THECLIMB': { region: 'LC', room: 'theclimb', mapSlugcat: 'artificer' },
        'LC_TOPDOOR': { region: 'LC', room: 'topdoor', mapSlugcat: 'artificer' },
        'LM_LEGENTRANCEARTY': { region: 'LM', room: 'LEGENTRANCEARTY', mapSlugcat: 'artificer' },
        'MS_BITTERAERIEPIPEU': { region: 'MS', room: 'bitteraeriepipeu', mapSlugcat: 'rivulet' },
        'MS_BITTEREDGE': { region: 'MS', room: 'bitteredge', mapSlugcat: 'rivulet' },
        'MS_SEWERBRIDGE': { region: 'MS', room: 'sewerbridge', mapSlugcat: 'rivulet' },
        'SH_E04RIV': { region: 'SH', room: 'E04RIV', mapSlugcat: 'rivulet' },
        'VS_BASEMENT01': { region: 'VS', room: 'BASEMENT01', mapSlugcat: 'inv' },
        'VS_BASEMENT02': { region: 'VS', room: 'BASEMENT02', mapSlugcat: 'inv' },
    };

    const regionToSlugcatMap = {
        'LC': 'artificer',
        'LM': 'spear',
        'MS': 'rivulet',
        'RM': 'rivulet',
        'OE': 'gourmand',
        'DM': 'spear',
        'UG': 'saint',
        'CL': 'saint',
        'HR': 'saint'
    };

    const regionColors = {
        "HI": "#667ad1",
        "DS": "#247d45",
        "GW": "#cce370",
        "SH": "#593699",
        "CC": "#d48573",
        "SI": "#e8597f",
        "SB": "#9c5933",
        "DM": "#194fe7",
        "LM": "#38d3ca",
        "MS": "#097370",
        "UW": "#886b57",
        "SS": "#939393",
        "CL": "#47655f",
        "HR": "#590e00",
        "UG": "#8fb572",
        "VS": "#75405c",
        "OE": "#d8ae8a",
        "LC": "#7f3339",
        "RM": "#9c00ff",
        "LF": "#608c9e",
        "SL": "#ede5cc",
        "SU": "#38c79e",
    }

    const explicitMapping = explicitRoomMap[`${regionBase.toUpperCase()}_${roomCode.toUpperCase()}`];
    let regionPart, roomPart, slugcatPart;

    if (explicitMapping) {
        if (explicitMapping.region) {
            regionPart = explicitMapping.region;
            roomPart = explicitMapping.room;
            slugcatPart = explicitMapping.mapSlugcat;
        }
    } else {
        // Format components
        regionPart = regionBase.toUpperCase();
        roomPart = roomCode.toUpperCase();
        slugcatPart = (roomPart.toLowerCase().includes("past") ? "artificer" : undefined) || regionToSlugcatMap[regionPart] || mapSlugcat || 'white';
    }

    // Create metadata lines
    const lines = [
        "=== transcription: broadcast",
        regionPart ? `md-map: region=${regionPart}, room=${roomPart}, mapSlugcat=${slugcatPart}` : null,
        regionColors[regionPart] ? `md-color: ${regionColors[regionPart]}` : null,
        `md-var-DevCommId: ${entry.name.replace(/[ \/]+/g, '_')}`,
        `md-name: ${entry.name}`
    ].filter(line => line);

    // Add content lines
    for (const line of entry.lines) {
        lines.push(line.replace(/\n/g, '\\n'));
    }

    return lines.join('\n');
}).join('\n\n'))
