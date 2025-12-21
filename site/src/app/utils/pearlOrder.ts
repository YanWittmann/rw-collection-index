import { PearlData } from "../types/types";

export interface PearlSelector {
    pattern: RegExp;
}

export interface LinkItem {
    title: string;
    url: string;
    subtitle?: string;
}

export interface PearlChapter {
    name: string;
    ids?: (string | PearlSelector)[];
    items?: PearlChapter[];
    defaultOpen?: boolean;
    headerType?: "default" | "banner";
    icon?: string;
    link?: string | LinkItem[];
}

export interface OrderedChapter {
    name: string;
    items?: PearlData[];
    subChapters?: OrderedChapter[];
    defaultOpen?: boolean;
    headerType?: "default" | "banner";
    icon?: string;
    link?: string | LinkItem[];
}

const vanillaPearlOrder: PearlChapter[] = [
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
            "LttM_SAINT_ANY_OTHER"
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
        name: "The Watcher: Projections",
        ids: [
            "WAUA", "WORA", "ABSTRACT", "DRONE",
            { pattern: /Watcher_Pearl_Text_Projection.+/ },
            { pattern: /Watcher_Pearl_Misc_Projection.+/ }
        ]
    },
    {
        name: "The Watcher: Logs / Recordings",
        ids: [
            "WARB", "WARC", "WARD", "WMPA", "WVWA",
            "TEXT_AUDIO_TALKSHOW",
            { pattern: /Watcher_Text.+/ },
            "WARG_AUDIO_GROOVE", "WTDA_AUDIO_JAM1", "WSKD_AUDIO_JAM2", "WTDB_AUDIO_JAM3", "WRFB_AUDIO_JAM4", "WBLA_AUDIO_VOICEWIND1",
            "WARE_AUDIO_VOICEWIND2",
        ]
    },
    {
        name: "The Watcher: Spinning Top",
        ids: [
            "Watcher_ST_Decisiontree",
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

const moddedPearlOrder: PearlChapter[] = [
    {
        name: "Vanilla",
        headerType: "banner",
        icon: "img/modded/vanilla-thumb.webp",
        defaultOpen: false,
        items: [
            {
                name: "Colored Pearls",
                ids: [
                    "SL_moon_PALE_YELLOW", "DS_BRIGHT_GREEN", "Red_stomach_AQUAMARINE",
                    "SL_bridge_BRIGHT_PURPLE", "SH_DEEP_MAGENTA", "DM_LIGHT_YELLOW",
                    "SL_chimney_BRIGHT_MAGENTA", "CC_GOLD", "Spearmasterpearl_DARK_RED",
                    "SI_top_DARK_GREEN", "VS_DEEP_PURPLE", "Rivulet_stomach_CELADON",
                    "SI_west_DARK_BLUE", "UW_PALE_GREEN",
                    "SI_chat3_DARK_PURPLE", "LF_bottom_BRIGHT_RED",
                    "SI_chat4_OLIVE_GREEN", "LF_west_DEEP_PINK",
                    "SI_chat5_DARK_MAGENTA", "SB_filtration_TEAL",
                    "SB_ravine_DARK_MAGENTA", "SU_filt_LIGHT_PINK",
                    "SU_LIGHT_BLUE", "OE_LIGHT_PURPLE",
                    "HI_BRIGHT_BLUE", "LC_DEEP_GREEN",
                    "GW_VIRIDIAN", "LC_second_BRONZE",
                    "RM_MUSIC",
                ]
            },
        ]
    },
    {
        name: "Chasing Wind",
        headerType: "banner",
        icon: "img/modded/ChasingWind/thumb.webp",
        defaultOpen: false,
        link: [
            { title: "Mod Wiki", url: "https://rainworldmods.miraheze.org/wiki/Chasing_Wind_(region)" },
            { title: "Steam Workshop", url: "https://steamcommunity.com/sharedfiles/filedetails/?id=3232063592" },
            { title: "RainDB", url: "https://andrewfm.github.io/RainDB/#3232063592" },
        ],
        items: [
            {
                name: "Slugcat Interactions",
                ids: [
                    { pattern: /CW_Dialogue_survivor_.+/ },
                    { pattern: /CW_Dialogue_survivor_drone_.+/ },
                    { pattern: /CW_Dialogue_monk_.+/ },
                    { pattern: /CW_Dialogue_hunter_.+/ },
                    { pattern: /CW_Dialogue_spear_.+/ },
                    { pattern: /CW_Dialogue_gourmand_.+/ },
                    { pattern: /CW_Dialogue_artificer_.+/ },
                    { pattern: /CW_Dialogue_rivulet_.+/ },
                    { pattern: /CW_Dialogue_generic_.+/ },
                ]
            },
            {
                name: "Colored Pearls",
                ids: [
                    "CW_Moon_BigGoldenPearl",
                ]
            },
            {
                name: "Echos",
                ids: [
                    "ChasingWind_echo",
                ]
            },
            {
                name: "White Pearls (Misc)",
                ids: [
                    { pattern: /Misc_CW_WHITE_PEARLS_\d+/ },
                ]
            },
        ]
    },
    {
        name: "Corroded Passage",
        headerType: "banner",
        icon: "img/modded/CorrodedPassage/thumb.webp",
        defaultOpen: false,
        link: [
            { title: "Mod Wiki", url: "https://rainworldmods.miraheze.org/wiki/Corroded_Passage" },
            { title: "Steam Workshop", url: "https://steamcommunity.com/sharedfiles/filedetails/?id=3222863079" },
            { title: "RainDB", url: "https://andrewfm.github.io/RainDB/#3222863079" },
        ],
        ids: [
            "PQ_P1", "PQ_P2",
            "MARPQ", "PUPPQ", "PUPPQ1", "PUPPQ2", "PUPPQ3", "SEBPQ", "SMOLDPQ",
            "CorrodedPassage_echo"
        ]
    },
    {
        name: "Far Shore",
        headerType: "banner",
        icon: "img/modded/FarShore/thumb.webp",
        defaultOpen: false,
        link: [
            { title: "Mod Wiki", url: "https://rainworldmods.miraheze.org/wiki/Far_Shore" },
            { title: "Steam Workshop", url: "https://steamcommunity.com/sharedfiles/filedetails/?id=3026723782" },
            { title: "RainDB", url: "https://andrewfm.github.io/RainDB/#3026723782" },
        ],
        ids: [
            "FR_Pearl_1", "FR_Pearl_2", "FR_Pearl_3",
            "FarShore_echo"
        ]
    },
    {
        name: "Gray Urban",
        headerType: "banner",
        icon: "img/modded/GrayUrban/thumb.webp",
        defaultOpen: false,
        link: [
            { title: "Mod Wiki", url: "https://rainworldmods.miraheze.org/wiki/Gray_Urban" },
            { title: "Steam Workshop", url: "https://steamcommunity.com/sharedfiles/filedetails/?id=3393900034" },
            { title: "RainDB", url: "https://andrewfm.github.io/RainDB/#3393900034" },
        ],
        ids: [
            "GU_Pearl_1", "GU_Pearl_2",
            "GrayUrban_echo"
        ]
    },
    {
        name: "Scorched District",
        headerType: "banner",
        icon: "img/modded/ScorchedDistrict/thumb.webp",
        defaultOpen: false,
        link: [
            { title: "Mod Wiki", url: "https://rainworldmods.miraheze.org/wiki/Scorched_District" },
            { title: "Steam Workshop", url: "https://steamcommunity.com/sharedfiles/filedetails/?id=2987764922" },
            { title: "RainDB", url: "https://andrewfm.github.io/RainDB/#2987764922" },
        ],
        ids: [
            "SD_Pearl_1", "ScorchedDistrict_echo"
        ]
    },
    {
        name: "Luminous Cove",
        headerType: "banner",
        icon: "img/modded/LuminousCove/thumb.webp",
        defaultOpen: false,
        link: [
            { title: "Mod Wiki", url: "https://rainworldmods.miraheze.org/wiki/Luminous_Cove" },
            { title: "Steam Workshop", url: "https://steamcommunity.com/sharedfiles/filedetails/?id=3232063592" },
            { title: "RainDB", url: "https://andrewfm.github.io/RainDB/#3232063592" },
        ],
        ids: [
            "EU_Pearl_1", "LuminousCove_echo"
        ]
    },
    {
        name: "Hanging Gardens",
        headerType: "banner",
        icon: "img/modded/HangingGardens/thumb.webp",
        defaultOpen: false,
        link: [
            { title: "Mod Wiki", url: "https://rainworldmods.miraheze.org/wiki/Hanging_Gardens" },
            { title: "Steam Workshop", url: "https://steamcommunity.com/sharedfiles/filedetails/?id=3022284148" },
            { title: "RainDB", url: "https://andrewfm.github.io/RainDB/#3022284148" },
        ],
        ids: [
            "GH_Pearl"
        ]
    },
    {
        name: "Necropolis",
        headerType: "banner",
        icon: "img/modded/Necropolis/thumb.webp",
        defaultOpen: false,
        link: [
            { title: "Mod Wiki", url: "https://rainworldmods.miraheze.org/wiki/Necropolis" },
            { title: "Steam Workshop", url: "https://steamcommunity.com/sharedfiles/filedetails/?id=3393902748" },
            { title: "RainDB", url: "https://andrewfm.github.io/RainDB/#3393902748" },
        ],
        ids: [
            "NP_Pearl_1",
            "Necropolis_echo"
        ]
    },
    {
        name: "Moss Fields",
        headerType: "banner",
        icon: "img/modded/MossFields/thumb.webp",
        defaultOpen: false,
        link: [
            { title: "Mod Wiki", url: "https://rainworldmods.miraheze.org/wiki/Moss_Fields" },
            { title: "Steam Workshop", url: "https://steamcommunity.com/sharedfiles/filedetails/?id=3147907848" },
            { title: "RainDB", url: "https://andrewfm.github.io/RainDB/#3147907848" },
        ],
        ids: [
            "MF_Pearl_1"
        ]
    },
    {
        name: "Drainage System Plus",
        headerType: "banner",
        icon: "img/modded/DrainageSystemPlus/thumb.webp",
        defaultOpen: false,
        link: [
            { title: "Mod Wiki", url: "https://rainworldmods.miraheze.org/wiki/Drainage_System_Plus" },
            { title: "Steam Workshop", url: "https://steamcommunity.com/sharedfiles/filedetails/?id=2993225799" },
            { title: "RainDB", url: "https://andrewfm.github.io/RainDB/#2993225799" },
        ],
        ids: [
            "DrainageSystemPlus"
        ]
    },
];

export const PEARL_ORDER_CONFIGS: Record<string, PearlChapter[]> = {
    vanilla: vanillaPearlOrder,
    modded: moddedPearlOrder
};

export const findPearlCategory = (pearl: PearlData, chapters: PearlChapter[]): string => {
    const search = (currentChapters: PearlChapter[]): string | null => {
        for (const chapter of currentChapters) {
            // Check current chapter IDs
            if (chapter.ids) {
                for (const idOrSelector of chapter.ids) {
                    if (typeof idOrSelector === 'string') {
                        if (idOrSelector === pearl.id) return chapter.name;
                    } else {
                        if (idOrSelector.pattern.test(pearl.id)) return chapter.name;
                    }
                }
            }
            // Recursively check subchapters
            if (chapter.items) {
                const subResult = search(chapter.items);
                if (subResult) return chapter.name;
            }
        }
        return null;
    }
    return search(chapters) || "Other";
};

export const orderPearls = (pearls: PearlData[], chapters: PearlChapter[]): OrderedChapter[] => {
    const pearlsById = pearls.reduce((acc, pearl) => {
        acc[pearl.id] = pearl;
        return acc;
    }, {} as Record<string, PearlData>);

    // Track processed pearls to avoid duplicates globally
    const processedPearlIds = new Set<string>();

    const processChapter = (chapter: PearlChapter): OrderedChapter => {
        const chapterItems: PearlData[] = [];

        if (chapter.ids) {
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
        }

        const subChapters = chapter.items ? chapter.items.map(sub => processChapter(sub)) : undefined;

        return {
            name: chapter.name,
            items: chapterItems,
            subChapters: subChapters,
            defaultOpen: chapter.defaultOpen ?? true,
            headerType: chapter.headerType,
            icon: chapter.icon,
            link: chapter.link
        };
    };

    const orderedPearls = chapters.map(processChapter);

    // Error checking for missing IDs
    const checkMissing = (currentChapters: PearlChapter[]) => {
        for (const chapter of currentChapters) {
            if (chapter.ids) {
                for (const idOrSelector of chapter.ids) {
                    if (typeof idOrSelector === 'string' && !pearlsById[idOrSelector]) {
                        console.error(`Pearl with id ${idOrSelector} not found`);
                    }
                }
            }
            if (chapter.items) checkMissing(chapter.items);
        }
    }
    checkMissing(chapters);

    const uncoveredPearls = pearls.filter(pearl => !processedPearlIds.has(pearl.id));
    if (uncoveredPearls.length > 0) {
        console.log(uncoveredPearls.map(p => p.id))
        orderedPearls.push({ name: "Other", items: uncoveredPearls, defaultOpen: true });
    }

    return orderedPearls;
}

export function hasTag(tags: string[] | undefined, tag: string): boolean {
    return tags ? tags.includes(tag) : false;
}
