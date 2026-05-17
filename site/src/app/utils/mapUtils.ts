import { MapInfo } from "../types/types";

const MAP_URL_PATTERNS: { [key: string]: string } = {
    "default": "https://rain-world-downpour-map.github.io/map.html",
    "alduris-mod-map": "https://alduris.github.io/mod-map/map.html",
    "watcher": "https://alduris.github.io/watcher-map/map.html",
};

const regionMaps: { [key: string]: string[] } = {
    "alduris-mod-map": ["SD", "GH", "FR", "MF", "CW", "TM", "XM", "PV"],
};

export function generateMapLinkFromMapInfo(mapInfo: MapInfo | undefined): string | null {
    if (!mapInfo) return null;
    const { region, room, mapSlugcat, impl } = mapInfo;
    if (!region || !room || !mapSlugcat) return null;
    if (impl === "none") return null;

    let baseUrl = MAP_URL_PATTERNS["default"];

    if (impl && MAP_URL_PATTERNS[impl]) {
        baseUrl = MAP_URL_PATTERNS[impl];
    } else if (mapSlugcat === 'watcher') {
        baseUrl = MAP_URL_PATTERNS["watcher"];
    } else {
        for (const mapKey of Object.keys(regionMaps)) {
            if (regionMaps[mapKey].includes(region)) {
                baseUrl = MAP_URL_PATTERNS[mapKey];
                break;
            }
        }
    }

    return `${baseUrl}?slugcat=${mapSlugcat}&region=${region}&room=${region}_${room}`;
}

export function hasMapLocations(dialogue: { metadata: { map?: MapInfo[] } }): boolean {
    return !!(dialogue.metadata.map && dialogue.metadata.map.length > 0);
}

export function getMapLocations(dialogue: { metadata: { map?: MapInfo[] } }): MapInfo[] {
    return dialogue.metadata.map ?? [];
}
