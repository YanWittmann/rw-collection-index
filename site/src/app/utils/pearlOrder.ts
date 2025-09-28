import { PearlData } from "../types/types";

export interface PearlSelector {
    pattern: RegExp;
}

export interface PearlChapter {
    name: string;
    ids: (string | PearlSelector)[];
}

export const pearlOrder: PearlChapter[] = [
    {
        name: "Colored Pearls + Broadcasts",
        ids: [
            "SL_moon_PALE_YELLOW", "DS_BRIGHT_GREEN", "Red_stomach_AQUAMARINE", "LP_2_PEB_GRAY_3", "Chatlog_GW2_LIGHT_GREEN_3",
            "SL_bridge_BRIGHT_PURPLE", "SH_DEEP_MAGENTA", "DM_LIGHT_YELLOW", "LP_3_PEB_GRAY_4", "Chatlog_SH0_PURPLE",
            "SL_chimney_BRIGHT_MAGENTA", "CC_GOLD", "Spearmasterpearl_DARK_RED", "LP_4_PEB_GRAY_5", "Chatlog_LM0_CYAN_1",
            "SI_top_DARK_GREEN", "VS_DEEP_PURPLE", "Rivulet_stomach_CELADON", "LP_5_PEB_GRAY_6", "Chatlog_LM1_CYAN_2",
            "SI_west_DARK_BLUE", "UW_PALE_GREEN", "LP_0_WHITE_1", "LP_6_PEB_GRAY_7", "Chatlog_SI0_PINK_1",
            "SI_chat3_DARK_PURPLE", "LF_bottom_BRIGHT_RED", "LP_1_WHITE_2", "LP_7_PEB_GRAY_8", "Chatlog_SI1_PINK_2",
            "SI_chat4_OLIVE_GREEN", "LF_west_DEEP_PINK", "LP_2_WHITE_3", "LP_8_PEB_GRAY_9", "Chatlog_SI2_PINK_3",
            "SI_chat5_DARK_MAGENTA", "SB_filtration_TEAL", "LP_3_WHITE_4", "LP_9_PEB_GRAY_10", "Chatlog_SI3_PINK_4",
            "SB_ravine_DARK_MAGENTA", "SU_filt_LIGHT_PINK", "LP_4_WHITE_5", "Chatlog_HI0_LIGHT_BLUE", "Chatlog_SI4_PINK_5",
            "SU_LIGHT_BLUE", "OE_LIGHT_PURPLE", "LP_5_WHITE_6", "Chatlog_DS0_DARK_GREEN", "Chatlog_SI5_PINK_6",
            "HI_BRIGHT_BLUE", "LC_DEEP_GREEN", "LP_6_WHITE_7", "Chatlog_CC0_LIGHT_BROWN", "Chatlog_SB0_DARK_BROWN",
            "GW_VIRIDIAN", "LC_second_BRONZE", "LP_0_PEB_GRAY_1", "Chatlog_GW0_LIGHT_GREEN_1", "Chatlog_DM0_DARK_BLUE_1",
            "GW_DULL_YELLOW", "RM_MUSIC", "LP_1_PEB_GRAY_2", "Chatlog_GW1_LIGHT_GREEN_2", "Chatlog_DM1_DARK_BLUE_2",
        ]
    },
    {
        name: "Items",
        ids: [
            { pattern: /Iterator_Dialogue_Items_.+/ }
        ]
    },
    {
        name: "Echoes",
        ids: [
            { pattern: /Echo_Monologue_.+/ }
        ]
    },
    {
        name: "Looks to the Moon Dialogue",
        ids: [
            { pattern: /LttM_Dialogue_survivor_(?!monk).+/ },
            { pattern: /LttM_Dialogue_monk.+/ },
            { pattern: /LttM_Dialogue_survivor_monk.+/ },
            { pattern: /LttM_Dialogue_hunter.+/ },
            { pattern: /LttM_Dialogue_gourmand.+/ },
            { pattern: /LttM_Dialogue_spearmaster.+/ },
            { pattern: /LttM_Dialogue_rivulet.+/ },
            { pattern: /LttM_Dialogue_saint_.+/ },
            { pattern: /LttM_Dialogue_inv_.+/ },
            { pattern: /LttM_Dialogue_.+/ },
        ]
    },
    {
        name: "Looks to the Moon Various",
        ids: [
            { pattern: /LttM_short_Dialogue_.+/ },
        ]
    },
    {
        name: "Five Pebbles Dialogue",
        ids: [
            { pattern: /FP_Dialogue_survivor_(?!monk).+/ },
            { pattern: /FP_Dialogue_monk.+/ },
            { pattern: /FP_Dialogue_survivor_monk.+/ },
            { pattern: /FP_Dialogue_hunter.+/ },
            { pattern: /FP_Dialogue_gourmand.+/ },
            { pattern: /FP_Dialogue_artificer.+/ },
            { pattern: /FP_Dialogue_spearmaster.+/ },
            { pattern: /FP_Dialogue_rivulet.+/ },
            { pattern: /FP_Dialogue_saint_.+/ },
            { pattern: /FP_Dialogue_.+/ },
        ]
    },
    {
        name: "Downpour Addons",
        ids: [
            "LttM_SAINT_ANY_OTHER"
        ]
    },
    {
        name: "The Watcher: Spinning Top",
        ids: [
            { pattern: /Watcher_vanillaEncounter_.+/ },
            { pattern: /Watcher_ST_Echo.+/ },
            { pattern: /Watcher_ST_Other.+/ },
        ]
    },
    {
        name: "The Watcher: Rot Prince",
        ids: [
            { pattern: /Watcher_Prince_KarmaSigils.+/ },
            { pattern: /Watcher_Prince_Dialogue.+/ },
            { pattern: /Watcher_Prince_Events.+/ },
            { pattern: /Watcher_Prince_Weaver.+/ },
        ]
    },
    {
        name: "The Watcher: Void Weaver",
        ids: [
            { pattern: /Watcher_Weaver.+/ },
        ]
    },
    {
        name: "The Watcher: Projections",
        ids: [
            "WAUA", "WORA", "ABSTRACT", "DRONE",
            { pattern: /Watcher_Pearl_Text_Projection.+/ },
            { pattern: /Watcher_Pearl_Misc_Projection.+/ }
        ]
    },
    {
        name: "The Watcher: Logs",
        ids: [
            "WARB", "WARC", "WARD", "WMPA", "WVWA",
            "TEXT_AUDIO_TALKSHOW",
            { pattern: /Watcher_Text.+/ },
        ]
    },
    {
        name: "The Watcher: Recordings",
        ids: [
            "WARG_AUDIO_GROOVE", "WTDA_AUDIO_JAM1", "WSKD_AUDIO_JAM2", "WTDB_AUDIO_JAM3", "WRFB_AUDIO_JAM4", "WBLA_AUDIO_VOICEWIND1",
            "WARE_AUDIO_VOICEWIND2",
        ]
    },
    {
        name: "Five Pebble's Pearls",
        ids: [
            { pattern: /PebblesPearl_\d+/ }
        ]
    },
    {
        name: "White Pearls (Misc)",
        ids: [
            { pattern: /Misc_WHITE_PEARLS_\d+/ }
        ]
    },
    {
        name: "Broadcast Pearls",
        ids: [
            { pattern: /BroadcastMisc_\d+/ }
        ]
    },
    {
        name: "Developer Commentary",
        ids: [
            { pattern: /DevComm_.+/ }
        ]
    },
]

export const findPearlCategory = (pearl: PearlData): string => {
    for (const chapter of pearlOrder) {
        for (const idOrSelector of chapter.ids) {
            if (typeof idOrSelector === 'string') {
                if (idOrSelector === pearl.id) return chapter.name;
            } else {
                if (idOrSelector.pattern.test(pearl.id)) return chapter.name;
            }
        }
    }
    return "Other";
};

export const orderPearls = (pearls: PearlData[]): { name: string, items: PearlData[] }[] => {
    const pearlsById = pearls.reduce((acc, pearl) => {
        acc[pearl.id] = pearl;
        return acc;
    }, {} as Record<string, PearlData>);

    // Track processed pearls to avoid duplicates
    const processedPearlIds = new Set<string>();

    const orderedPearls = pearlOrder.map(chapter => {
        const chapterItems: PearlData[] = [];

        for (const idOrSelector of chapter.ids) {
            if (typeof idOrSelector === 'string') {
                const pearl = pearlsById[idOrSelector];
                if (pearl && !processedPearlIds.has(pearl.id)) {
                    chapterItems.push(pearl);
                    processedPearlIds.add(pearl.id);
                }
            } else {
                const matchingPearls = pearls.filter(pearl =>
                    !processedPearlIds.has(pearl.id) &&
                    idOrSelector.pattern.test(pearl.id)
                );

                matchingPearls.forEach(pearl => {
                    chapterItems.push(pearl);
                    processedPearlIds.add(pearl.id);
                });
            }
        }

        return {
            name: chapter.name,
            items: chapterItems
        };
    });

    // Check if any string IDs are not found
    for (const chapter of pearlOrder) {
        for (const idOrSelector of chapter.ids) {
            if (typeof idOrSelector === 'string' && !pearlsById[idOrSelector]) {
                console.error(`Pearl with id ${idOrSelector} not found`);
            }
        }
    }

    const uncoveredPearls = pearls.filter(pearl => !processedPearlIds.has(pearl.id));
    orderedPearls.push({ name: "Other", items: uncoveredPearls });
    return orderedPearls;
}

export function hasTag(tags: string[] | undefined, tag: string): boolean {
    return tags ? tags.includes(tag) : false;
}
