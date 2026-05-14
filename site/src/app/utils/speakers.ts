export interface SourceDecrypted {
    n: string;
    p: string;
    c?: string;
}

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
    // namespace specific colors
    "NSCP-PS": "#a3d9c2",
    "NSCP-FPB": "#d4d1b8",
    "NSCP-UD": "#69b378",
    "NSCP-TSA": "#fadb99",
    "NSTM-GM": "#d9d9b3",
    "NSTM-DSS": "#408c66",
    "NSTM-WC": "#b38cff",
    "NSTM-AA": "#ffccb8",
    "NSTM-QR": "#80ccb8",
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
    "spearmaster": "#4f2e69",
    // modded
    "chasing-wind": "#66d9bf",
    "chasing-wind-spearmaster": "#66d9bf",
    "chasing-wind-gourmand": "#66d9bf",
    "seer": "#b8cfa6",
};

export const transcribersImages: { [key: string]: string } = {
    // modded
    "chasing-wind": "modded/chasing-wind",
    "chasing-wind-spearmaster": "modded/chasing-wind-spearmaster",
    "chasing-wind-gourmand": "modded/chasing-wind-gourmand",
    "seer": "modded/seer",
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
    // modded
    "GH": "#68a842",
    "PQ": "#34573a",
    "SD": "#bb6926",
    "FR": "#c4c79e",
    "MF": "#bb746c",
    "EU": "#1c3d4e",
    "CW": "#66d9bf",
    "GU": "#5f6065",
    "NP": "#b14309",
    "TM": "#44ef7b",
    "XM": "#41657a",
    "OA": "#04a7ef",
    "KF": "#cfa579",
    "QL": "#88b0a5",
    "IP": "#137253",
    "PV": "#91fb95",
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
    "spearmaster": "Spearmaster",
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
    // namespace specific names
    "NSCP-PS": "Pilgrimaged Summit",
    "NSCP-FPB": "Fourteen Polar Bones",
    "NSCP-UD": "Unstable Daydream",
    "NSCP-TSA": "Twelve Stars Above",
    "chasing-wind": "Chasing Wind",
    "chasing-wind-spearmaster": "Chasing Wind (Spearmaster)",
    "chasing-wind-gourmand": "Chasing Wind (Gourmand)",
    "seer": "Seer",
    "NSTM-GM": "GM",
    "NSTM-DSS": "DSS",
    "NSTM-WC": "Winding Current",
    "NSTM-AA": "AA",
    "NSTM-QR": "QR",
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
    // modded
    "GH": "Hanging Gardens",
    "PQ": "Corroded Passage",
    "SD": "Scorched District",
    "FR": "Far Shore",
    "MF": "Moss Fields",
    "EU": "Luminous Cove",
    "CW": "Chasing Wind",
    "GU": "Gray Urban",
    "NP": "Necropolis",
    "TM": "The Mast",
    "XM": "Ashen Monolith",
    "OA": "Aqueducts",
    "KF": "Archaic Facility",
    "QL": "Ashen Bow",
    "IP": "Auxiliary Intake",
    "PV": "Preservatory",
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

interface SourceIndex {
    byN: Map<string, SourceDecrypted>;
    byP: Map<string, SourceDecrypted>;
    byNormP: Map<string, SourceDecrypted>;
    normalized: Array<{ norm: string; entry: SourceDecrypted }>;
}

const sourceIndexCache = new WeakMap<SourceDecrypted[], SourceIndex>();

function getSourceIndex(sourceData: SourceDecrypted[]): SourceIndex {
    const cached = sourceIndexCache.get(sourceData);
    if (cached) return cached;
    const byN = new Map<string, SourceDecrypted>();
    const byP = new Map<string, SourceDecrypted>();
    const byNormP = new Map<string, SourceDecrypted>();
    const normalized: Array<{ norm: string; entry: SourceDecrypted }> = [];
    for (const entry of sourceData) {
        if (!byN.has(entry.n)) byN.set(entry.n, entry);
        if (!byP.has(entry.p)) byP.set(entry.p, entry);
        const norm = entry.p.replaceAll("\\\\", "/").replaceAll("\\", "/");
        if (!byNormP.has(norm)) byNormP.set(norm, entry);
        normalized.push({ norm, entry });
    }
    const index = { byN, byP, byNormP, normalized };
    sourceIndexCache.set(sourceData, index);
    return index;
}

export function findSourceDialogue(name: string, sourceData: SourceDecrypted[]) {
    const idx = getSourceIndex(sourceData);
    const entry = idx.byN.get(name)
        ?? idx.byP.get(name)
        ?? idx.normalized.find(e => e.entry.p.includes(name))?.entry
        ?? idx.byNormP.get(name)
        ?? idx.normalized.find(e => e.norm.includes(name))?.entry;
    if (!entry) {
        console.warn(name, 'not found');
    }
    return entry;
}

/**
 * Looks up the display name and color for a speaker, prioritizing namespace-specific data.
 * @param {string} rawSpeaker The full speaker part (e.g., "NSCP-FPB").
 * @param {string} actualSpeaker The speaker identifier (e.g., "FPB").
 * @param {string | undefined} namespace The namespace identifier (e.g., "NSCP").
 * @returns {{ displayName: string, color: string | undefined }}
 */
export function getSpeakerInfo(rawSpeaker: string, actualSpeaker: string, namespace?: string) {
    let displayName = actualSpeaker;
    let color = speakersColors[actualSpeaker] || undefined;

    // 1. Check if the full raw speaker (e.g., NSCP-FPB) is defined in speakerNames
    if (speakerNames[rawSpeaker]) {
        displayName = speakerNames[rawSpeaker];
    } else if (speakerNames[actualSpeaker]) {
        // 2. Fallback to the actual speaker name lookup
        displayName = speakerNames[actualSpeaker];
    }

    // 3. Check for color using raw speaker first
    if (speakersColors[rawSpeaker]) {
        color = speakersColors[rawSpeaker];
    }
    // 4. Fallback to actual speaker color
    else if (speakersColors[actualSpeaker]) {
        color = speakersColors[actualSpeaker];
    }

    return {
        displayName: displayName,
        color: color
    };
}

// dominant color per item image, keyed by "{subType}.png" (no img/ prefix), for locked "?" tinting.
// run: python site/build-scripts/dominant-color-extractor.py site/public/img/
export const itemIconColors: Record<string, string> = {
    "artificer.png": "#70233c", "broadcast.png": "#ffffff", "check.png": "#9d9ca7", "close.png": "#fcc546",
    "dlc-dp.png": "#99d9da", "dlc-watcher.png": "#99d9da", "echo.png": "#f3c159", "filter.png": "#ff9251",
    "FP-artificer.png": "#72e6c4", "FP.png": "#ffffff", "gourmand.png": "#f0c197", "hunter.png": "#ff7373",
    "info.png": "#ffffff", "inv.png": "#16224c", "item/Blue_Fruit_icon.png": "#0000ff",
    "item/Bubble_Fruit_icon.png": "#0d4db3", "item/Bubble_Weed_icon.png": "#0eb23c",
    "item/Cherrybomb_icon.png": "#ae281e", "item/Chieftain_Scavenger_icon.png": "#a9a4b2",
    "item/Cloak_icon.png": "#f2fff5", "item/Dandelion_Peach_icon.png": "#96c7f5",
    "item/Electric_Spear_icon.png": "#0000ff", "item/Elite_Scavenger_icon.png": "#a9a4b2",
    "item/Explosive_Spear_icon.png": "#e60e0e", "item/Fire_Egg_icon.png": "#ff7878",
    "item/Fire_Spear_icon.png": "#ff7878", "item/Flashbang_icon.png": "#bbaeff", "item/Glow_Weed_icon.png": "#f1ff44",
    "item/Gooieduck_icon.png": "#72e6c4", "item/Grenade_icon.png": "#e60e0e", "item/Inspector_Eye_icon.png": "#a9a4b2",
    "item/Jellyfish_icon.png": "#a9a4b2", "item/Karma_Flower_icon.png": "#e7df90",
    "item/King_Vulture_icon.png": "#d4ca6f", "item/Lantern_icon.png": "#724124", "item/Lilypuck_icon.png": "#2bf5ff",
    "item/Mushroom_icon.png": "#ffffff", "item/Neuron_Fly_Hunter_icon.png": "#00ff4c",
    "item/Neuron_Fly_icon.png": "#ffffff", "item/Noodlefly_Egg_icon.png": "#932940",
    "item/Overseer_Eye_icon.png": "#a9a4b2", "item/Rarefaction_Cell_icon.png": "#05a4d9", "item/Rock_icon.png": "#a9a4b2",
    "item/Rot_icon.png": "#d4d2d9", "item/Seed_icon.png": "#a9a4b2", "item/Singularity_Bomb_icon.png": "#05a4d9",
    "item/Slime_Mold_icon.png": "#ff9900", "item/Slugpup_icon.png": "#a9a4b2", "item/Spear_icon.png": "#a9a4b2",
    "item/Spore_Puff_icon.png": "#a9a4b2", "item/Vulture_Mask_icon.png": "#a9a4b2", "lock.png": "#ff9251",
    "LttM-FP-saint.png": "#ffffff", "LttM-gourmand.png": "#f0c197", "LttM-post-collapse.png": "#ffffff",
    "LttM-pre-collapse.png": "#ffeb04", "LttM-rivulet.png": "#ffffff", "LttM-saint.png": "#4b7486",
    "modded/Aqueducts/thumb.webp": "#98a4a9", "modded/ArchaicFacility/thumb.webp": "#3756bb",
    "modded/AshenBow/thumb.webp": "#283433", "modded/AuxiliaryIntake/thumb.webp": "#2a2a2b",
    "modded/chasing-wind-gourmand.png": "#f2b393", "modded/chasing-wind-spearmaster.png": "#ffeb04",
    "modded/chasing-wind.png": "#ffffff", "modded/ChasingWind/thumb.webp": "#162944",
    "modded/CorrodedPassage/thumb.webp": "#10141b", "modded/DrainageSystemPlus/thumb.webp": "#242317",
    "modded/FarShore/thumb.webp": "#442916", "modded/GrayUrban/thumb.webp": "#66676f",
    "modded/HangingGardens/thumb.webp": "#eef4f0", "modded/LuminousCove/thumb.webp": "#2d4d5d",
    "modded/MossFields/thumb.webp": "#44161d", "modded/Necropolis/thumb.webp": "#330f05", "modded/nsh.png": "#ffffff",
    "modded/Preservatory/thumb.webp": "#28864f", "modded/ScorchedDistrict/thumb.webp": "#35190f",
    "modded/seer.png": "#ffcf3f", "modded/TheMast/thumb.webp": "#20161b", "modded/vanilla-thumb.webp": "#5e131e",
    "monk.png": "#ffff73", "Pc-main-menu.png": "#18161f", "Pc-main-menu.webp": "#17161e", "pearl.png": "#ffffff",
    "PearlReader.png": "#3a2905", "PearlReader/ABSTRACT.png": "#303130", "PearlReader/CC_1.png": "#212926",
    "PearlReader/CC_2.png": "#173229", "PearlReader/CC_3.png": "#142e29", "PearlReader/CC_4.png": "#15332d",
    "PearlReader/DRONE_1.png": "#2c1f10", "PearlReader/DRONE_2.png": "#2d2011", "PearlReader/DRONE_3.png": "#2d2011",
    "PearlReader/DRONE_4.png": "#2c1f11", "PearlReader/DRONE_5.png": "#2d2110", "PearlReader/DRONE_6.png": "#2b1f11",
    "PearlReader/DRONE_7.png": "#2c1f12", "PearlReader/HI_1.png": "#331d19", "PearlReader/HI_2.png": "#311f1e",
    "PearlReader/HI_3.png": "#321c1a", "PearlReader/HI_4.png": "#30201f", "PearlReader/HI_5.png": "#2e2120",
    "PearlReader/HI_6.png": "#231b1f", "PearlReader/misc/img1/1.png": "#29272a", "PearlReader/misc/img1/2.png": "#2d2633",
    "PearlReader/misc/img1/3.png": "#262735", "PearlReader/misc/img1/4.png": "#2c2934",
    "PearlReader/misc/img1/5.png": "#311d22", "PearlReader/misc/img2/1.png": "#112a24",
    "PearlReader/misc/img2/2.png": "#1b182d", "PearlReader/misc/img2/3.png": "#1e2627",
    "PearlReader/misc/img2/4.png": "#242425", "PearlReader/misc/img2/5.png": "#1a2822",
    "PearlReader/misc/img2/6.png": "#162826", "PearlReader/misc/img2/7.png": "#132927",
    "PearlReader/misc/img2/8.png": "#212727", "PearlReader/misc/img2/9.png": "#201d2a",
    "PearlReader/misc/img3/1.png": "#2a1714", "PearlReader/misc/img3/2.png": "#2a1515",
    "PearlReader/misc/img3/3.png": "#281a11", "PearlReader/misc/img3/4.png": "#291d15",
    "PearlReader/misc/img3/5.png": "#2a1b15", "PearlReader/misc/img3/6.png": "#291a11",
    "PearlReader/misc/img3/7.png": "#2a1a15", "PearlReader/misc/img3/8.png": "#2b1816",
    "PearlReader/misc/img3/9.png": "#30191a", "PearlReader/misc/img4/1.png": "#011a2f",
    "PearlReader/misc/img4/2.png": "#01192e", "PearlReader/misc/img4/3.png": "#011a2d",
    "PearlReader/misc/img4/4.png": "#011a2d", "PearlReader/misc/img4/5.png": "#011a2e",
    "PearlReader/misc/img4/6.png": "#01182c", "PearlReader/misc/img4/7.png": "#01192d",
    "PearlReader/misc/img4/8.png": "#011930", "PearlReader/misc/img4/9.png": "#01192b",
    "PearlReader/misc/img4/10.png": "#011a2c", "PearlReader/misc/img5/1.png": "#001a2d",
    "PearlReader/misc/img5/2.png": "#001929", "PearlReader/misc/img6/1.png": "#001d2f",
    "PearlReader/misc/img6/2.png": "#002829", "PearlReader/misc/img7/1.png": "#2e1b0d",
    "PearlReader/misc/img7/2.png": "#2c1a0c", "PearlReader/misc/img8/1.png": "#2d1b0d",
    "PearlReader/misc/img8/2.png": "#2d1a0d", "PearlReader/misc/img8/3.png": "#2d1a0c",
    "PearlReader/misc/img8/4.png": "#2d1a0d", "PearlReader/misc/img9/1.png": "#29251e",
    "PearlReader/misc/img9/2.png": "#242724", "PearlReader/misc/img9/3.png": "#28261f",
    "PearlReader/misc/img9/4.png": "#29261f", "PearlReader/misc/img9/5.png": "#252622",
    "PearlReader/misc/img9/6.png": "#282622", "PearlReader/misc/misc1/1.png": "#292a21",
    "PearlReader/misc/misc1/2.png": "#2b2821", "PearlReader/misc/misc1/3.png": "#282524",
    "PearlReader/misc/misc1/4.png": "#2b2b1e", "PearlReader/misc/misc1/5.png": "#292920",
    "PearlReader/misc/misc1/6.png": "#2a2a20", "PearlReader/misc/misc1/7.png": "#292626",
    "PearlReader/misc/misc2/1.png": "#2c1a1c", "PearlReader/misc/misc2/2.png": "#2a191d",
    "PearlReader/misc/misc2/3.png": "#2d1a1a", "PearlReader/misc/misc2/4.png": "#2a191b",
    "PearlReader/misc/misc3/1.png": "#282421", "PearlReader/misc/misc3/2.png": "#28231f",
    "PearlReader/misc/misc3/3.png": "#282320", "PearlReader/misc/misc3/4.png": "#282421",
    "PearlReader/misc/misc3/5.png": "#282523", "PearlReader/misc/misc3/6.png": "#272524",
    "PearlReader/misc/misc3/7.png": "#282523", "PearlReader/misc/misc4/1.png": "#1e1e26",
    "PearlReader/misc/misc4/2.png": "#1e1e26", "PearlReader/misc/misc4/3.png": "#1e1e25",
    "PearlReader/misc/misc4/4.png": "#1d1d25", "PearlReader/misc/misc4/5.png": "#1e1e26",
    "PearlReader/misc/misc4/6.png": "#1e1e26", "PearlReader/misc/misc4/7.png": "#1e1e25",
    "PearlReader/misc/misc4/8.png": "#252329", "PearlReader/misc/misc4/9.png": "#22222b",
    "PearlReader/misc/misc4/10.png": "#23222b", "PearlReader/misc/misc4/11.png": "#22222b",
    "PearlReader/misc/misc4/12.png": "#23222b", "PearlReader/misc/misc4/13.png": "#22222a",
    "PearlReader/misc/misc5/1.png": "#221d1a", "PearlReader/misc/misc5/2.png": "#241f1b",
    "PearlReader/misc/misc5/3.png": "#231e19", "PearlReader/misc/misc5/4.png": "#27221d",
    "PearlReader/misc/misc5/5.png": "#26211b", "PearlReader/misc/text1/1.png": "#292626",
    "PearlReader/misc/text1/2.png": "#2a2424", "PearlReader/misc/text1/3.png": "#301a1a",
    "PearlReader/misc/text1/4.png": "#322222", "PearlReader/misc/text1/5.png": "#2e2727",
    "PearlReader/misc/text1/6.png": "#2f2b2b", "PearlReader/misc/text1/7.png": "#2e2828",
    "PearlReader/misc/text1/8.png": "#2e2020", "PearlReader/misc/text1/9.png": "#2b2626",
    "PearlReader/misc/text1/10.png": "#2a2626", "PearlReader/misc/text1/11.png": "#2a2222",
    "PearlReader/misc/text1/12.png": "#2a2525", "PearlReader/misc/text2/1.png": "#262626",
    "PearlReader/misc/text2/2.png": "#2c2c2c", "PearlReader/misc/text2/3.png": "#262626",
    "PearlReader/misc/text2/4.png": "#262626", "PearlReader/misc/text2/5.png": "#242424",
    "PearlReader/misc/text2/6.png": "#262626", "PearlReader/misc/text2/7.png": "#292727",
    "PearlReader/misc/text2/8.png": "#231e1d", "PearlReader/misc/text2/9.png": "#241919",
    "PearlReader/misc/text2/10.png": "#271414", "PearlReader/misc/text2/11.png": "#291010",
    "PearlReader/misc/text2/12.png": "#2f0c0c", "PearlReader/misc/text2/13.png": "#2e0404",
    "PearlReader/misc/text3/1.png": "#26222a", "PearlReader/misc/text3/2.png": "#271b22",
    "PearlReader/misc/text3/3.png": "#281c23", "PearlReader/misc/text3/4.png": "#2a2427",
    "PearlReader/misc/text3/5.png": "#2d2026", "PearlReader/misc/text3/6.png": "#282328",
    "PearlReader/misc/text3/7.png": "#2b1f24", "PearlReader/misc/text4/1.png": "#202028",
    "PearlReader/misc/text4/2.png": "#252525", "PearlReader/misc/text4/3.png": "#201f27",
    "PearlReader/misc/text4/4.png": "#242424", "PearlReader/misc/text4/5.png": "#202027",
    "PearlReader/misc/text4/6.png": "#242424", "PearlReader/misc/text4/7.png": "#212028",
    "PearlReader/misc/text4/8.png": "#010101", "PearlReader/misc/text4/9.png": "#201f27",
    "PearlReader/misc/text4/10.png": "#171717", "PearlReader/misc/text4/11.png": "#202027",
    "PearlReader/misc/text4/12.png": "#010101", "PearlReader/misc/text5/1.png": "#1f1e27",
    "PearlReader/misc/text5/2.png": "#1f1f27", "PearlReader/misc/text5/3.png": "#1f1e27",
    "PearlReader/misc/text5/4.png": "#1e1e25", "PearlReader/misc/text5/5.png": "#1f1f27",
    "PearlReader/misc/text5/6.png": "#29190d", "PearlReader/misc/text5/7.png": "#2a190c",
    "PearlReader/misc/text6/1.png": "#2d1b0d", "PearlReader/misc/text6/2.png": "#2e1d11",
    "PearlReader/misc/text6/3.png": "#2f1c0f", "PearlReader/misc/text6/4.png": "#2d1d12",
    "PearlReader/misc/text6/5.png": "#2b1b0f", "PearlReader/misc/text7/1.png": "#051f35",
    "PearlReader/misc/text7/2.png": "#041f35", "PearlReader/misc/text7/3.png": "#061f34",
    "PearlReader/Rivulet_stomach_1.png": "#2c2c23", "PearlReader/Rivulet_stomach_2.png": "#2c2c22",
    "PearlReader/Rivulet_stomach_3.png": "#2c2c22", "PearlReader/Rivulet_stomach_4.png": "#2e2a21",
    "PearlReader/SU.png": "#2d2725", "PearlReader/TEXT_CONTEMPT.png": "#272520",
    "PearlReader/TEXT_KITESDAY.png": "#25271b", "PearlReader/TEXT_NOTIONOFSELF.png": "#21281f",
    "PearlReader/TEXT_SECRET.png": "#1c2a21", "PearlReader/TEXT_STARDUST.png": "#1e2229",
    "PearlReader/WAUA_1.png": "#e3b5bc", "PearlReader/WAUA_2.png": "#697893", "PearlReader/WORA.png": "#132a14",
    "PearlReaderAudio.png": "#123609", "PearlReaderText.png": "#1c0936", "pin.png": "#ff6060",
    "questionmark.png": "#ffffff", "rivulet.png": "#91ccf0", "rot-prince-pre.png": "#5500c5",
    "rot-prince-weaver.png": "#220f30", "rot-prince.png": "#210d2f", "saint.png": "#aaf156", "share.png": "#fafaef",
    "source.png": "#474747", "spearmaster.png": "#4f2e69", "spinning-top.png": "#816271", "survivor.png": "#ffffff",
    "survivor_monk.png": "#ffff73", "The_Scholar.png": "#ffffff", "The_Scholar_Square.png": "#ffffff",
    "vanilla-rw.png": "#808080", "void-weaver.png": "#ad6c2f", "wa-region/cc.png": "#3d3b43",
    "wa-region/lf.png": "#5a635f", "wa-region/sh.png": "#1a1b1c", "wa-region/unknown.png": "#453321",
    "wa-region/wara.png": "#aba79e", "wa-region/warb.png": "#07121d", "wa-region/warc.png": "#1b1505",
    "wa-region/ward.png": "#1e1b3e", "wa-region/ware.png": "#260607", "wa-region/warf.png": "#4e5d70",
    "wa-region/warg.png": "#646c77", "wa-region/waua.png": "#9f9d90", "wa-region/wbla.png": "#edcc7a",
    "wa-region/wdsr.png": "#26111d", "wa-region/wgwr.png": "#2a2435", "wa-region/whir.png": "#362850",
    "wa-region/wmpa.png": "#263232", "wa-region/wora.png": "#46484d", "wa-region/wpta.png": "#fea7c4",
    "wa-region/wrfa.png": "#286e99", "wa-region/wrfb.png": "#263c4e", "wa-region/wrra.png": "#96a794",
    "wa-region/wrsa.png": "#1c212b", "wa-region/wska.png": "#8e9198", "wa-region/wskb.png": "#876164",
    "wa-region/wskc.png": "#413e46", "wa-region/wskd.png": "#535154", "wa-region/wssr.png": "#1b1a1a",
    "wa-region/wsur.png": "#232144", "wa-region/wtda.png": "#34271c", "wa-region/wtdb.png": "#313130",
    "wa-region/wvwa.png": "#71883b", "watcher-ripple.png": "#181f5d", "watcher.png": "#17234f"
};

itemIconColors["PearlReader.png"] = "#ffd84f";
itemIconColors["PearlReaderAudio.png"] = "#70eb7c";
itemIconColors["PearlReaderText.png"] = "#a15ded";