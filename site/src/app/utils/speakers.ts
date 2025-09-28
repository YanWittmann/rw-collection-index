import sourceDecrypted from "../../generated/source-decrypted.json";

export interface SourceDecrypted {
    n: string;
    p: string;
    c?: string;
}

export const SOURCE_DECRYPTED: SourceDecrypted[] = sourceDecrypted;

export const speakersColors: { [key: string]: string } = {
    "FP": "#66d9bf",
    "Five Pebbles": "#66d9bf",
    "EP": "#66d9bf",
    "BSM": "#e5d999",
    "LttM": "#e5d999",
    "CW": "#bfbfe5",
    "GW": "#bfbfe5",
    "NSH": "#bfffbf",
    "SRS": "#ffbfbf",
    "NGI": "#b28ccc",
    "GS": "#e59966",
    "HR": "#8cb28c",
    "SI": "#bfbfbf",
    "UU": "#8ce58c",
    "HF": "#8c8ce5",
    "PI": "#ffbfff",
    "WO": "#bfbfff",
    "EOC": "#ffffe5",
    "Andrew": "#ffffff",
    "Will": "#ff4c59",
    "Norgad": "#ab8fd6",
    "Screams": "#4cff87",
    "Dakras": "#b854ed",
    "Slugitar": "#ffffff",
    "Cappin": "#0061d6",
    "Host": "#ffffff",
    "Gesture": "#ffffff",
};

export const transcribersColors: { [key: string]: string } = {
    "FP": "#66d9bf",
    "FP-artificer": "#66d9bf",
    "LttM-pre-collapse": "#FFEB04",
    "LttM-post-collapse": "#ffffff",
    "LttM-gourmand": "#ffffff",
    "LttM-rivulet": "#ffffff",
    "LttM-saint": "#4B7486",
    "LttM-FP-saint": "#4B7486",
    "broadcast-pre-FP": "#ffffff",
    "broadcast-post-FP": "#7f7f7f",
    "saint": "#aaf156",
    "base-slugcats": "#ffffff",
    "artificer": "#70233c",
};

export const regionColors: { [key: string]: string } = {
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
    // watcher
    "unknown": "#453321",
    "WARC": "#2F2B03",
    "WARF": "#C4DBEA",
    "WBLA": "#EDCD7B",
    "WHIR": "#362850",
    "WRFA": "#319AD6",
    "WRSA": "#2A3649",
    "WSKC": "#5F6266",
    "WSUR": "#201F40",
    "WVWA": "#78AA35",
    "WARA": "#A6A298",
    "WARD": "#4C3587",
    "WARG": "#576779",
    "WDSR": "#27131E",
    "WORA": "#2F176B",
    "WRFB": "#213E52",
    "WSKA": "#979AA1",
    "WSKD": "#5B4249",
    "WTDA": "#E89F6E",
    "WARB": "#0A1F32",
    "WARE": "#B70C09",
    "WAUA": "#A5A393",
    "WGWR": "#2B2536",
    "WPTA": "#FE84B2",
    "WRRA": "#8D9B8A",
    "WSKB": "#D56E7C",
    "WSSR": "#4A4A4A",
    "WTDB": "#69775E",
    "WMPA": "#2F176B",
};

export const transcriberIcons: { [key: string]: string } = {
    "base-slugcats": "survivor",
    "saint": "saint",
    "artificer": "artificer",
}

export const speakerNames: { [key: string]: string } = {
    "FP": "Five Pebbles",
    "Five Pebbles": "Five Pebbles",
    "FP-artificer": "Five Pebbles",
    "EP": "Erratic Pulse / Five Pebbles",
    "BSM": "Big Sis Moon / Looks to the Moon",
    "LttM": "Looks to the Moon",
    "LttM-pre-collapse": "Looks to the Moon (Pre-Collapse)",
    "LttM-rivulet": "Looks to the Moon (Rivulet)",
    "LttM-post-collapse": "Looks to the Moon",
    "LttM-saint": "Looks to the Moon (Future)",
    "LttM-FP-saint": "Looks to the Moon / Five Pebbles (Future)",
    "LttM-gourmand": "Looks to the Moon (Gourmand)",
    "NSH": "No Significant Harassment",
    "SRS": "Seven Red Suns",
    "CW": "Chasing Wind",
    "GW": "Grey Wind / Chasing Wind",
    "NGI": "(Unknown)",
    "GS": "Gazing Stars",
    "HR": "(Unknown)",
    "SI": "Secluded Instinct",
    "UU": "(Unknown)",
    "HF": "(Unknown)",
    "PI": "Pleading Intellect",
    "WO": "Wandering Omen",
    "EOC": "Epoch of Clouds",
    "broadcast-pre-FP": "Pre-Five Pebbles",
    "broadcast-post-FP": "Post-Five Pebbles",
    "broadcast": "Broadcast",
    "Andrew": "Andrew Marrero",
    "Will": "Willburd",
    "Norgad": "Tom \"Norgad\" Starbuck",
    "Screams": "the one who screams i guess",
    "Dakras": "Andy \"Dakras\" Dunn",
    "Slugitar": "Slugitar",
    "Cappin": "Evan \"Cappin\" Muncy",
    "base-slugcats": "Base Slugcats",
    "saint": "Saint",
    "artificer": "Artificer",
    "ST": "Spinning Top",
    "Spinning Top": "Spinning Top",
    "spinning-top": "Spinning Top",
    "rot-prince": "Rot Prince",
    "rot-prince-pre": "Rot Prince (Pre-Awakening)",
    "rot-prince-weaver": "Rot Prince",
    "void-weaver": "Void Weaver",
    "PearlReader": "Pearl Reader",
    "Host": "Host",
    "Gesture": "Bell of Gesture",
}

export const regionNames: { [key: string]: string } = {
    "SU": "Outskirts",
    "HI": "Industrial Complex",
    "DS": "Drainage System",
    "GW": "Garbage Wastes",
    "SL": "Shoreline",
    "SH": "Shaded Citadel",
    "UW": "Exterior",
    "SS": "Five Pebbles",
    "CC": "Chimney Canopy",
    "SI": "Sky Islands",
    "LF": "Farm Arrays",
    "SB": "Subterranean",
    "VS": "Pipeyard",
    "OE": "Outer Expanse",
    "MS": "Submerged Superstructure",
    "LC": "Metropolis",
    "RM": "The Rot",
    "DM": "Looks to the Moon",
    "CL": "Silent Construct",
    "HR": "Rubicon",
    "UG": "Undergrowth",
    "LM": "Waterfront Facility",
    // watcher
    "unknown": "Unknown",
    "WARC": "Fetid Glen",
    "WARF": "Aether Ridge",
    "WBLA": "Badlands",
    "WHIR": "Corrupted Factories",
    "WRFA": "Coral Caves",
    "WRSA": "Deamon",
    "WSKC": "Stormy Coast",
    "WSUR": "Crumbling Fringes",
    "WVWA": "Verdant Waterways",
    "WARA": "Shattered Terrace",
    "WARD": "Cold Storage",
    "WARG": "The Surface",
    "WDSR": "Decaying Tunnels",
    "WORA": "Outer Rim",
    "WRFB": "Turbulent Pump",
    "WSKA": "Torrential Railways",
    "WSKD": "Shrouded Coast",
    "WTDA": "Torrid Desert",
    "WARB": "Salination",
    "WARE": "Heat Ducts",
    "WAUA": "Ancient Urban",
    "WGWR": "Infested Wastes",
    "WPTA": "Signal Spires",
    "WRRA": "Rusted Wrecks",
    "WSKB": "Sunlit Port",
    "WSSR": "Unfortunate Evolution",
    "WTDB": "Desolate Tract",
    "WMPA": "Migration Path",
}

export function darken(hex: string, amount: number) {
    if (!hex) {
        return '#7a7a7a';
    }
    return '#' + hex.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) - amount)).toString(16)).substr(-2));
}

const variableDefinitions: { [key: string]: any } = {
    "speakersColors": speakersColors,
    "transcribersColors": transcribersColors,
    "SI-CHAT": "When the MSC DLC is disabled, there are only two Sky Island pearls per playthrough, each with one random one of five possible conversations.\nWith the MSC DLC, these have been split into five separate pearls. This is one of them.\nText color is only present in the Downpour version of the game.",
    "LC-PEARL-MOON": "This Pearl cannot be brought to Moon as Artificer, as the Shoreline has been replaced by the Waterfront Facility.\nThe only way to bring the Pearl to Moon is to be spawned into the Metropolis as Monk or Survivor in Expedition Mode and bringing the Pearl to Shoreline.",
    "MAP-LP-PRE-PEB": "White Broadcasts are unlocked in sequential order regardless of the location they are found in.\nThe locations listed here can therefore be visited in any order.",
    "LP-PRE-PEB": "The seven White Broadcasts are unlocked in sequential order regardless of the location they are found in.\nThey can only be found before meeting Five Pebbles.",
    "MAP-LP-POST-PEB": "Gray Broadcasts are unlocked in sequential order regardless of the location they are found in.\nThe locations listed here can therefore be visited in any order.",
    "LP-POST-PEB": "The ten Gray Broadcasts are unlocked in sequential order regardless of the location they are found in.\nThey can only be found after meeting Five Pebbles.",
    "PebblesPearl-INFO": "Pearls from Five Pebbles' chamber have a separate, smaller pool of dialogue to pick from.\nContained in Five Pebbles' Pearls are memories, processes, ciphers, and images he was likely using,\nusually preceded by Looks to the Moon explaining how they were recently used.",
    "PebblesPearl-RIV-INFO": "Five Pebbles' Pearls have a unique pool of dialogue when brought to Looks to the Moon as Rivulet.\nPearls from Five Pebbles' chamber have a separate, smaller pool of dialogue to pick from.\nContained in Five Pebbles' Pearls are memories, processes, ciphers, and images he was likely using,\nusually preceded by Looks to the Moon explaining how they were recently used.",
    "WhitePearl-MISC-INFO": "White Pearls are spawned in set locations throughout the world, but can also be found semi-randomly in Scavenger stashes and on Scavenger totems.\nWhite Pearls have a large dialogue pool to draw from, so repeat readings are extremely rare.\nThey contain minor tidbits of lore, but most are useless or humorous information.",
    "BroadcastPearl-INFO": "Slugcats that aren't Spearmaster can find cream-colored Pearls at locations where Spearmaster would find Satellite unlocks.",
}

/**
 * Replaces registered variables from the {@link variableDefinitions} object in the given string.
 * Format for variables is ${some.variable.name} where each part of the access is separated by a dot.
 * @param str The string to resolve variables in.
 * @returns The string with all variables resolved.
 */
export function resolveVariables(str: string): string {
    return str.replace(/\${([^}]+)}/g, (_, variable) => {
        const parts = variable.split(".");
        let value = variableDefinitions[parts[0]];
        if (value === undefined) {
            console.error(`Variable ${variable} not found`);
            return `\${${variable}}`;
        }
        for (let i = 1; i < parts.length; i++) {
            value = value[parts[i]];
            if (value === undefined) {
                console.error(`Variable ${variable} not found`);
                return `\${${variable}}`;
            }
        }
        if (typeof value === "string") {
            return value;
        }
        console.error(`Variable ${variable} is not a string`);
        return `\${${variable}}`;
    });
}

export function findSourceDialogue(name: string) {
    const entry = SOURCE_DECRYPTED.find(entry => entry.n === name)
        || SOURCE_DECRYPTED.find(entry => entry.p === name)
        || SOURCE_DECRYPTED.find(entry => entry.p.includes(name))
        || SOURCE_DECRYPTED.find(entry => entry.p.replaceAll("\\\\", "/").replaceAll("\\", "/") === name)
        || SOURCE_DECRYPTED.find(entry => entry.p.replaceAll("\\\\", "/").replaceAll("\\", "/").includes(name));
    if (!entry) {
        console.warn(name, 'not found');
    }
    return entry;
}
