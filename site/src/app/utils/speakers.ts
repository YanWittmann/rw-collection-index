import type { GameAsset } from './assetUtils'
import { Tint } from './assetUtils'

export type { GameAsset }

export interface SourceDecrypted {
    n: string;
    p: string;
    c?: string;
}

export interface SpeakerDef {
    name?: string;
    aliases?: string[];
    color?: string;            // dialogue text color
    transcriberColor?: string; // transcriber header color, only when explicitly set
    asset?: GameAsset;         // icon/image with optional tint; absent = no visual icon
    /**
     * Optional pretty URL segment for this transcriber. When set, routes use this
     * instead of the raw transcriber name (e.g. urlSlug "moon" -> /CC/moon/).
     * Leave unset to keep using the raw transcriber name. Old URLs keep resolving
     * either way (see routing/routes.ts). No slugs are filled yet on purpose.
     */
    urlSlug?: string;
}

export interface RegionDef {
    name: string;
    color: string;             // accent color for UI labels/text
    image?: string;            // path relative to img/, no extension (PNG assumed), e.g. "region/HI"
}

// SECTION: speakers

export const speakers: Record<string, SpeakerDef> = {
    "unknown": { name: "Unknown", color: "#a855f7", asset: { src: "iterator-any", tint: Tint.mask("#a855f7") } },
    "FP": { name: "Five Pebbles", aliases: ["Five Pebbles", "FP-artificer"], color: "#66d9bf", transcriberColor: "#66d9bf", urlSlug: "FP" },
    "EP": { name: "Erratic Pulse / Five Pebbles", color: "#66d9bf" },
    "BSM": { name: "Big Sis Moon / Looks to the Moon", color: "#e5d999", asset: { src: "LttM-post-collapse", tint: Tint.mask("#e5d999") } },
    "LttM": { name: "Looks to the Moon", color: "#e5d999", urlSlug: "LttM" },
    "LttM-pre-collapse": { name: "Looks to the Moon (Pre-Collapse)", transcriberColor: "#FFEB04", urlSlug: "LttM-pre" },
    "LttM-rivulet": { name: "Looks to the Moon (Rivulet)", transcriberColor: "#ffffff", urlSlug: "LttM-riv" },
    "LttM-post-collapse": { name: "Looks to the Moon", transcriberColor: "#ffffff", urlSlug: "LttM" },
    "LttM-saint": { name: "Looks to the Moon (Future)", transcriberColor: "#4B7486", urlSlug: "LttM-future" },
    "LttM-FP-saint": { name: "Looks to the Moon / Five Pebbles (Future)", transcriberColor: "#4B7486" },
    "LttM-gourmand": { name: "Looks to the Moon (Gourmand)", transcriberColor: "#ffffff" },
    "NSH": { name: "No Significant Harassment", color: "#bfffbf", asset: { src: "modded/nsh", tint: Tint.mask("#bfffbf") } },
    "SRS": { name: "Seven Red Suns", color: "#ffbfbf", asset: { src: "iterator-any", tint: Tint.mask("#ffbfbf") } },
    "CW": { name: "Chasing Wind", color: "#bfbfe5", asset: { src: "modded/chasing-wind", tint: Tint.mask("#bfbfe5") } },
    "GW": { name: "Grey Wind / Chasing Wind", color: "#bfbfe5" },
    "NGI": { name: "(Unknown)", color: "#b28ccc", asset: { src: "iterator-any", tint: Tint.mask("#b28ccc") } },
    "GS": { name: "Gazing Stars", color: "#e59966", asset: { src: "iterator-any", tint: Tint.mask("#e59966") } },
    "HR": { name: "(Unknown)", color: "#8cb28c", asset: { src: "iterator-any", tint: Tint.mask("#8cb28c") } },
    "SI": { name: "Secluded Instinct", color: "#bfbfbf", asset: { src: "iterator-any", tint: Tint.mask("#bfbfbf") } },
    "UU": { name: "(Unknown)", color: "#8ce58c", asset: { src: "iterator-any", tint: Tint.mask("#8ce58c") } },
    "HF": { name: "(Unknown)", color: "#8c8ce5", asset: { src: "iterator-any", tint: Tint.mask("#8c8ce5") } },
    "PI": { name: "Pleading Intellect", color: "#ffbfff", asset: { src: "iterator-any", tint: Tint.mask("#ffbfff") } },
    "WO": { name: "Wandering Omen", color: "#bfbfff", asset: { src: "iterator-any", tint: Tint.mask("#bfbfff") } },
    "EOC": { name: "Epoch of Clouds", color: "#ffffe5", asset: { src: "iterator-any", tint: Tint.mask("#ffffe5") } },
    // watcher
    "ST": { name: "Spinning Top", aliases: ["Spinning Top", "spinning-top"] },
    "rot-prince": { name: "Rot Prince" },
    "rot-prince-pre": { name: "Rot Prince (Pre-Awakening)" },
    "rot-prince-weaver": { name: "Rot Prince" },
    "void-weaver": { name: "Void Weaver" },
    "PearlReader": { name: "Pearl Reader" },
    "Host": { name: "Host", color: "#ffffff", asset: { src: "Host", tint: Tint.mask("#ffffff") } },
    "Gesture": { name: "Bell of Gesture", color: "#ffffff", asset: { src: "bells-of-gesture" } },
    // dev / community
    "Andrew": { name: "Andrew Marrero", color: "#ffffff", asset: { src: "Andrew", tint: Tint.mask("#ffffff") } },
    "Will": { name: "Willburd", color: "#ff4c59", asset: { src: "Will", tint: Tint.mask("#ff4c59") } },
    "Norgad": { name: "Tom \"Norgad\" Starbuck", color: "#ab8fd6", asset: { src: "Norgad", tint: Tint.mask("#ab8fd6") } },
    "Screams": { name: "the one who screams i guess", color: "#4cff87", asset: { src: "Screams", tint: Tint.mask("#4cff87") } },
    "Dakras": { name: "Andy \"Dakras\" Dunn", color: "#b854ed", asset: { src: "Dakras", tint: Tint.mask("#b854ed") } },
    "Slugitar": { name: "Slugitar", color: "#ffffff", asset: { src: "Slugitar", tint: Tint.mask("#ffffff") } },
    "Cappin": { name: "Evan \"Cappin\" Muncy", color: "#0061d6", asset: { src: "Cappin", tint: Tint.mask("#0061d6") } },
    // namespace specific
    "NSCP-PS": { name: "Pilgrimaged Summit", color: "#a3d9c2", asset: { src: "NSCP-PS", tint: Tint.mask("#a3d9c2") } },
    "NSCP-FPB": { name: "Fourteen Polar Bones", color: "#d4d1b8", asset: { src: "NSCP-FPB", tint: Tint.mask("#d4d1b8") } },
    "NSCP-UD": { name: "Unstable Daydream", color: "#69b378", asset: { src: "NSCP-UD", tint: Tint.mask("#69b378") } },
    "NSCP-TSA": { name: "Twelve Stars Above", color: "#fadb99", asset: { src: "NSCP-TSA", tint: Tint.mask("#fadb99") } },
    "NSTM-GM": { name: "GM", color: "#d9d9b3", asset: { src: "NSTM-GM", tint: Tint.mask("#d9d9b3") } },
    "NSTM-DSS": { name: "DSS", color: "#408c66", asset: { src: "NSTM-DSS", tint: Tint.mask("#408c66") } },
    "NSTM-WC": { name: "Winding Current", color: "#b38cff", asset: { src: "NSTM-WC", tint: Tint.mask("#b38cff") } },
    "NSTM-AA": { name: "AA", color: "#ffccb8", asset: { src: "NSTM-AA", tint: Tint.mask("#ffccb8") } },
    "NSTM-QR": { name: "QR", color: "#80ccb8", asset: { src: "NSTM-QR", tint: Tint.mask("#80ccb8") } },
    // transcribers
    "broadcast": { name: "Broadcast" },
    "broadcast-pre-FP": { name: "Pre-Five Pebbles", transcriberColor: "#ffffff" },
    "broadcast-post-FP": { name: "Post-Five Pebbles", transcriberColor: "#7f7f7f" },
    "base-slugcats": { name: "Base Slugcats", transcriberColor: "#ffffff", asset: { src: "survivor" } },
    "saint": { name: "Saint", transcriberColor: "#aaf156", asset: { src: "saint" } },
    "artificer": { name: "Artificer", transcriberColor: "#70233c", asset: { src: "artificer" } },
    "spearmaster": { name: "Spearmaster", transcriberColor: "#4f2e69" },
    "FA": { asset: { src: "FA" } },
    "NSS": { asset: { src: "iterator-any" } },
    "UI": { asset: { src: "modded/unparalleled-innocence" } },
    // modded
    "chasing-wind": { name: "Chasing Wind", transcriberColor: "#66d9bf", asset: { src: "modded/chasing-wind" } },
    "chasing-wind-spearmaster": {
        name: "Chasing Wind (Spearmaster)",
        transcriberColor: "#66d9bf",
        asset: { src: "modded/chasing-wind-spearmaster" }
    },
    "chasing-wind-gourmand": {
        name: "Chasing Wind (Gourmand)",
        transcriberColor: "#66d9bf",
        asset: { src: "modded/chasing-wind-gourmand" }
    },
    "seer": { name: "Seer", transcriberColor: "#b8cfa6", asset: { src: "modded/seer" } },
};

// computed once at module load, O(1) lookups for all primary keys and aliases
export const speakerByAlias = new Map<string, SpeakerDef>();
for (const [id, def] of Object.entries(speakers)) {
    speakerByAlias.set(id, def);
    for (const alias of def.aliases ?? []) speakerByAlias.set(alias, def);
}

// SECTION: regions
// order here determines sort order in the filter view.

export const regions: Record<string, RegionDef> = {
    // vanilla
    "SU": { name: "Outskirts", color: "#38c79e", image: "region/SU" },
    "HI": { name: "Industrial Complex", color: "#667ad1", image: "region/HI" },
    "DS": { name: "Drainage System", color: "#247d45", image: "region/DS" },
    "GW": { name: "Garbage Wastes", color: "#cce370", image: "region/GW" },
    "SL": { name: "Shoreline", color: "#ede5cc", image: "region/SL" },
    "SH": { name: "Shaded Citadel", color: "#593699", image: "region/SH" },
    "UW": { name: "Exterior", color: "#886b57", image: "region/UW" },
    "SS": { name: "Five Pebbles", color: "#939393", image: "region/SS" },
    "CC": { name: "Chimney Canopy", color: "#d48573", image: "region/CC" },
    "SI": { name: "Sky Islands", color: "#e8597f", image: "region/SI" },
    "LF": { name: "Farm Arrays", color: "#608c9e", image: "region/LF" },
    "SB": { name: "Subterranean", color: "#9c5933", image: "region/SB" },
    "VS": { name: "Pipeyard", color: "#75405c", image: "region/VS" },
    "OE": { name: "Outer Expanse", color: "#d8ae8a", image: "region/OE" },
    "LM": { name: "Waterfront Facility", color: "#38d3ca", image: "region/LM" },
    "LC": { name: "Metropolis", color: "#7f3339", image: "region/LC" },
    "MS": { name: "Submerged Superstructure", color: "#097370", image: "region/MS" },
    "RM": { name: "The Rot", color: "#9c00ff", image: "region/RM" },
    "DM": { name: "Looks to the Moon", color: "#194fe7", image: "region/DM" },
    "CL": { name: "Silent Construct", color: "#47655f", image: "region/CL" },
    "UG": { name: "Undergrowth", color: "#8fb572", image: "region/UG" },
    "HR": { name: "Rubicon", color: "#590e00", image: "region/HR" },
    // watcher
    "unknown": { name: "Unknown", color: "#453321", image: "wa-region/unknown" },
    "WARC": { name: "Fetid Glen", color: "#2F2B03", image: "wa-region/warc" },
    "WARF": { name: "Aether Ridge", color: "#C4DBEA", image: "wa-region/warf" },
    "WBLA": { name: "Badlands", color: "#EDCD7B", image: "wa-region/wbla" },
    "WHIR": { name: "Corrupted Factories", color: "#362850", image: "wa-region/whir" },
    "WRFA": { name: "Coral Caves", color: "#319AD6", image: "wa-region/wrfa" },
    "WRSA": { name: "Deamon", color: "#2A3649", image: "wa-region/wrsa" },
    "WSKC": { name: "Stormy Coast", color: "#5F6266", image: "wa-region/wskc" },
    "WSUR": { name: "Crumbling Fringes", color: "#201F40", image: "wa-region/wsur" },
    "WVWA": { name: "Verdant Waterways", color: "#78AA35", image: "wa-region/wvwa" },
    "WVWB": { name: "Fractured Gateways", color: "#8d967d", image: "wa-region/wvwb" },
    "WARA": { name: "Shattered Terrace", color: "#A6A298", image: "wa-region/wara" },
    "WARD": { name: "Cold Storage", color: "#4C3587", image: "wa-region/ward" },
    "WARG": { name: "The Surface", color: "#576779", image: "wa-region/warg" },
    "WDSR": { name: "Decaying Tunnels", color: "#27131E", image: "wa-region/wdsr" },
    "WORA": { name: "Outer Rim", color: "#2F176B", image: "wa-region/wora" },
    "WRFB": { name: "Turbulent Pump", color: "#213E52", image: "wa-region/wrfb" },
    "WSKA": { name: "Torrential Railways", color: "#979AA1", image: "wa-region/wska" },
    "WSKD": { name: "Shrouded Stacks", color: "#5B4249", image: "wa-region/wskd" },
    "WTDA": { name: "Torrid Desert", color: "#E89F6E", image: "wa-region/wtda" },
    "WARB": { name: "Salination", color: "#0A1F32", image: "wa-region/warb" },
    "WARE": { name: "Heat Ducts", color: "#B70C09", image: "wa-region/ware" },
    "WAUA": { name: "Ancient Urban", color: "#A5A393", image: "wa-region/waua" },
    "WGWR": { name: "Infested Wastes", color: "#2B2536", image: "wa-region/wgwr" },
    "WPTA": { name: "Signal Spires", color: "#FE84B2", image: "wa-region/wpta" },
    "WPGA": { name: "Pillar Grove", color: "#6fb772", image: "wa-region/wpga" },
    "WRRA": { name: "Rusted Wrecks", color: "#8D9B8A", image: "wa-region/wrra" },
    "WSKB": { name: "Sunbaked Alley", color: "#D56E7C", image: "wa-region/wskb" },
    "WSSR": { name: "Unfortunate Evolution", color: "#4A4A4A", image: "wa-region/wssr" },
    "WTDB": { name: "Desolate Tract", color: "#69775E", image: "wa-region/wtdb" },
    "WMPA": { name: "Migration Path", color: "#2F176B", image: "wa-region/wmpa" },
    // modded
    "GH": { name: "Hanging Gardens", color: "#68a842", image: "modded/HangingGardens/thumb.webp" },
    "PQ": { name: "Corroded Passage", color: "#34573a", image: "modded/CorrodedPassage/thumb.webp" },
    "SD": { name: "Scorched District", color: "#bb6926", image: "modded/ScorchedDistrict/thumb.webp" },
    "FR": { name: "Far Shore", color: "#c4c79e", image: "modded/FarShore/thumb.webp" },
    "MF": { name: "Moss Fields", color: "#bb746c", image: "modded/MossFields/thumb.webp" },
    "EU": { name: "Luminous Cove", color: "#1c3d4e", image: "modded/LuminousCove/thumb.webp" },
    "CW": { name: "Chasing Wind", color: "#66d9bf", image: "modded/ChasingWind/thumb.webp" },
    "GU": { name: "Gray Urban", color: "#5f6065", image: "modded/GrayUrban/thumb.webp" },
    "NP": { name: "Necropolis", color: "#b14309", image: "modded/Necropolis/thumb.webp" },
    "TM": { name: "The Mast", color: "#44ef7b", image: "modded/TheMast/thumb.webp" },
    "XM": { name: "Ashen Monolith", color: "#41657a", image: "modded/TheMast/thumb.webp" },
    "OA": { name: "Aqueducts", color: "#04a7ef", image: "modded/Aqueducts/thumb.webp" },
    "KF": { name: "Archaic Facility", color: "#cfa579", image: "modded/ArchaicFacility/thumb.webp" },
    "QL": { name: "Ashen Bow", color: "#88b0a5", image: "modded/AshenBow/thumb.webp" },
    "IP": { name: "Auxiliary Intake", color: "#137253", image: "modded/AuxiliaryIntake/thumb.webp" },
    "PV": { name: "Preservatory", color: "#91fb95", image: "modded/Preservatory/thumb.webp" },
};

// speakersColors and transcribersColors are internal only, used by variableDefinitions for string interpolation
const speakersColors: Record<string, string> = {};
const transcribersColors: Record<string, string> = {};
for (const [id, def] of Object.entries(speakers)) {
    const keys = [id, ...(def.aliases ?? [])];
    if (def.color)            keys.forEach(k => { speakersColors[k] = def.color!; });
    if (def.transcriberColor) keys.forEach(k => { transcribersColors[k] = def.transcriberColor!; });
}

// SECTION: utility

export function getRegion(id: string | undefined | null): RegionDef {
    if (!id) return regions["unknown"];
    const def = regions[id];
    if (!def) {
        console.error(`unknown region "${id}"`);
        return regions["unknown"];
    }
    return def;
}

export function getSpeakerDef(id: string | undefined | null): SpeakerDef {
    if (!id) return speakers["unknown"];
    const def = speakerByAlias.get(id);
    if (!def) {
        console.warn(`unknown speaker "${id}"`);
        return speakers["unknown"];
    }
    return def;
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

export function getSpeakerInfo(rawSpeaker: string, actualSpeaker: string, namespace?: string) {
    const def = speakerByAlias.get(rawSpeaker) ?? getSpeakerDef(actualSpeaker);

    const displayName = def.name ?? actualSpeaker;
    const color = def.color;
    const asset = def.asset;

    return { displayName, color, asset };
}

// dominant color per item image, keyed by "{subType}.png" (no img/ prefix), for locked "?" tinting.
// run: python scripts/dominant-color-extractor.py site/public/img/ --exclude PearlReader/*
export const itemIconColors: Record<string, string> = {
    "artificer.png": "#70233c", "bells-of-gesture.png": "#226f93", "broadcast.png": "#ffffff", "check.png": "#9d9ca7",
    "close.png": "#fcc546", "dlc-dp.png": "#99d9da", "dlc-watcher.png": "#99d9da", "echo.png": "#f3c159",
    "filter.png": "#ff9251", "FP-artificer.png": "#72e6c4", "FP.png": "#ffffff", "gourmand.png": "#f0c197",
    "Host.png": "#ffffff", "hunter.png": "#ff7373", "info.png": "#ffffff", "inv.png": "#16224c",
    "item/Blue_Fruit_icon.png": "#0000ff", "item/Bubble_Fruit_icon.png": "#0d4db3",
    "item/Bubble_Weed_icon.png": "#0eb23c", "item/Cherrybomb_icon.png": "#ae281e",
    "item/Chieftain_Scavenger_icon.png": "#a9a4b2", "item/Cloak_icon.png": "#f2fff5",
    "item/Dandelion_Peach_icon.png": "#96c7f5", "item/Electric_Spear_icon.png": "#0000ff",
    "item/Elite_Scavenger_icon.png": "#a9a4b2", "item/Explosive_Spear_icon.png": "#e60e0e",
    "item/Fire_Egg_icon.png": "#ff7878", "item/Fire_Spear_icon.png": "#ff7878", "item/Flashbang_icon.png": "#bbaeff",
    "item/Glow_Weed_icon.png": "#f1ff44", "item/Gooieduck_icon.png": "#72e6c4", "item/Grenade_icon.png": "#e60e0e",
    "item/Inspector_Eye_icon.png": "#a9a4b2", "item/Jellyfish_icon.png": "#a9a4b2",
    "item/Karma_Flower_icon.png": "#e7df90", "item/King_Vulture_icon.png": "#d4ca6f", "item/Lantern_icon.png": "#724124",
    "item/Lilypuck_icon.png": "#2bf5ff", "item/Mushroom_icon.png": "#ffffff",
    "item/Neuron_Fly_Hunter_icon.png": "#00ff4c", "item/Neuron_Fly_icon.png": "#ffffff",
    "item/Noodlefly_Egg_icon.png": "#932940", "item/Overseer_Eye_icon.png": "#a9a4b2",
    "item/Rarefaction_Cell_icon.png": "#05a4d9", "item/Rock_icon.png": "#a9a4b2", "item/Rot_icon.png": "#d4d2d9",
    "item/Seed_icon.png": "#a9a4b2", "item/Singularity_Bomb_icon.png": "#05a4d9", "item/Slime_Mold_icon.png": "#ff9900",
    "item/Slugpup_icon.png": "#a9a4b2", "item/Spear_icon.png": "#a9a4b2", "item/Spore_Puff_icon.png": "#a9a4b2",
    "item/Vulture_Mask_icon.png": "#a9a4b2", "iterator-any.png": "#ffffff", "lock.png": "#ff9251",
    "LttM-FP-saint.png": "#ffffff", "LttM-gourmand.png": "#f0c197", "LttM-post-collapse.png": "#ffffff",
    "LttM-pre-collapse.png": "#ffeb04", "LttM-rivulet.png": "#ffffff", "LttM-saint.png": "#4b7486",
    "modded/Aqueducts/thumb.webp": "#98a4a9", "modded/ArchaicFacility/thumb.webp": "#3756bb",
    "modded/AshenBow/thumb.webp": "#283433", "modded/AuxiliaryIntake/thumb.webp": "#2a2a2b",
    "modded/chasing-wind-gourmand.png": "#f2b393", "modded/chasing-wind-spearmaster.png": "#ffeb04",
    "modded/chasing-wind.png": "#ffffff", "modded/ChasingWind/thumb.webp": "#162944",
    "modded/CorrodedPassage/thumb.webp": "#10141b", "modded/cryobloom-mist.png": "#ffffff",
    "modded/DrainageSystemPlus/thumb.webp": "#242317", "modded/FarShore/thumb.webp": "#442916",
    "modded/GrayUrban/thumb.webp": "#66676f", "modded/HangingGardens/thumb.webp": "#eef4f0",
    "modded/LuminousCove/thumb.webp": "#2d4d5d", "modded/MossFields/thumb.webp": "#44161d",
    "modded/Necropolis/thumb.webp": "#330f05", "modded/nsh.png": "#ffffff", "modded/Preservatory/thumb.webp": "#28864f",
    "modded/ScorchedDistrict/thumb.webp": "#35190f", "modded/seer.png": "#ffcf3f", "modded/TheMast/thumb.webp": "#20161b",
    "modded/unparalleled-innocence.png": "#ffffff", "modded/vanilla-thumb.webp": "#5e131e", "monk.png": "#ffff73",
    "Pc-main-menu.png": "#18161f", "Pc-main-menu.webp": "#17161e", "pearl.png": "#ffffff", "PearlReader.png": "#3a2905",
    "PearlReaderAudio.png": "#123609", "PearlReaderText.png": "#1c0936", "pin.png": "#ff6060",
    "questionmark.png": "#ffffff", "region/CC.png": "#341e3d", "region/CL.png": "#261f29", "region/DM.png": "#180e31",
    "region/DS.png": "#313830", "region/GW.png": "#242113", "region/HI.png": "#10141c", "region/HR.png": "#2f0a01",
    "region/LC.png": "#2f5377", "region/LF.png": "#41372b", "region/LM.png": "#3c261f", "region/MS.png": "#3bd067",
    "region/OE.png": "#582921", "region/RM.png": "#17121d", "region/SB.png": "#1c1613", "region/SH.png": "#1e151d",
    "region/SI.png": "#fbcf90", "region/SL.png": "#d7dad5", "region/SS.png": "#160718", "region/SU.png": "#292631",
    "region/UG.png": "#251207", "region/UW.png": "#1c1417", "region/VS.png": "#a47465", "region/WARA.png": "#aba79e",
    "region/WARB.png": "#07121d", "region/WARC.png": "#1b1505", "region/WARD.png": "#1e1b3e",
    "region/WARE.png": "#260607", "region/WARF.png": "#4e5d70", "region/WARG.png": "#646c77",
    "region/WAUA.png": "#9f9d90", "region/WBLA.png": "#edcc7a", "region/WDSR.png": "#26111d",
    "region/WGWR.png": "#2a2435", "region/WHIR.png": "#362850", "region/WMPA.png": "#263232",
    "region/WORA.png": "#46484d", "region/WPTA.png": "#fea7c4", "region/WRFA.png": "#286e99",
    "region/WRFB.png": "#263c4e", "region/WRRA.png": "#96a794", "region/WRSA.png": "#1c212b",
    "region/WSKA.png": "#8e9198", "region/WSKB.png": "#876164", "region/WSKC.png": "#413e46",
    "region/WSKD.png": "#535154", "region/WSSR.png": "#1b1a1a", "region/WSUR.png": "#232144",
    "region/WTDA.png": "#34271c", "region/WTDB.png": "#313130", "region/WVWA.png": "#71883b", "rivulet.png": "#91ccf0",
    "rot-prince-pre.png": "#5500c5", "rot-prince-weaver.png": "#220f30", "rot-prince.png": "#210d2f",
    "saint.png": "#aaf156", "share.png": "#fafaef", "source.png": "#474747", "spearmaster.png": "#4f2e69",
    "spinning-top.png": "#816271", "survivor.png": "#ffffff", "survivor_monk.png": "#ffff73",
    "The_Scholar.png": "#ffffff", "The_Scholar_Square.png": "#ffffff", "vanilla-rw.png": "#808080",
    "void-weaver.png": "#ad6c2f", "wa-region/cc.png": "#3d3b43", "wa-region/lf.png": "#5a635f",
    "wa-region/sh.png": "#1a1b1c", "wa-region/unknown.png": "#453321", "wa-region/wara.png": "#aba79e",
    "wa-region/warb.png": "#07121d", "wa-region/warc.png": "#1b1505", "wa-region/ward.png": "#1e1b3e",
    "wa-region/ware.png": "#260607", "wa-region/warf.png": "#4e5d70", "wa-region/warg.png": "#646c77",
    "wa-region/waua.png": "#9f9d90", "wa-region/wbla.png": "#edcc7a", "wa-region/wdsr.png": "#26111d",
    "wa-region/wgwr.png": "#2a2435", "wa-region/whir.png": "#362850", "wa-region/wmpa.png": "#263232",
    "wa-region/wora.png": "#46484d", "wa-region/wpga.png": "#939a96", "wa-region/wpta.png": "#fea7c4",
    "wa-region/wrfa.png": "#286e99", "wa-region/wrfb.png": "#263c4e", "wa-region/wrra.png": "#96a794",
    "wa-region/wrsa.png": "#1c212b", "wa-region/wska.png": "#8e9198", "wa-region/wskb.png": "#876164",
    "wa-region/wskc.png": "#413e46", "wa-region/wskd.png": "#535154", "wa-region/wssr.png": "#1b1a1a",
    "wa-region/wsur.png": "#232144", "wa-region/wtda.png": "#34271c", "wa-region/wtdb.png": "#313130",
    "wa-region/wvwa.png": "#71883b", "wa-region/wvwb.png": "#8a937b", "watcher-ripple.png": "#181f5d",
    "watcher.png": "#17234f"
};

itemIconColors["PearlReader.png"] = "#ffd84f";
itemIconColors["PearlReaderAudio.png"] = "#70eb7c";
itemIconColors["PearlReaderText.png"] = "#a15ded";
