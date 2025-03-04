import { PearlData } from "../types/types";

export interface PearlChapter {
    name: string;
    ids: string[];
}

export const pearlOrder: PearlChapter[] = [
    {
        name: "Vanilla / Downpour",
        ids: [
            "SL_moon_PALE_YELLOW", "DS_BRIGHT_GREEN", "Red_stomach_AQUAMARINE", "empty_broadcast", "empty_broadcast",
            "SL_bridge_BRIGHT_PURPLE", "SH_DEEP_MAGENTA", "DM_LIGHT_YELLOW", "empty_broadcast", "empty_broadcast",
            "SL_chimney_BRIGHT_MAGENTA", "CC_GOLD", "Spearmasterpearl_DARK_RED", "empty_broadcast", "empty_broadcast",
            "SI_top_DARK_GREEN", "VS_DEEP_PURPLE", "Rivulet_stomach_CELADON", "empty_broadcast", "empty_broadcast",
            "SI_west_DARK_BLUE", "UW_PALE_GREEN", "empty_broadcast", "empty_broadcast", "empty_broadcast",
            "SI_chat3_DARK_PURPLE", "LF_bottom_BRIGHT_RED", "empty_broadcast", "empty_broadcast", "empty_broadcast",
            "SI_chat4_OLIVE_GREEN", "LF_west_DEEP_PINK", "empty_broadcast", "empty_broadcast", "empty_broadcast",
            "SI_chat5_DARK_MAGENTA", "SB_filtration_TEAL", "empty_broadcast", "empty_broadcast", "empty_broadcast",
            "SB_ravine_DARK_MAGENTA", "SU_filt_LIGHT_PINK", "empty_broadcast", "empty_broadcast", "empty_broadcast",
            "SU_LIGHT_BLUE", "OE_LIGHT_PURPLE", "empty_broadcast", "empty_broadcast", "empty_broadcast",
            "HI_BRIGHT_BLUE", "LC_DEEP_GREEN", "empty_broadcast", "empty_broadcast", "empty_broadcast",
            "GW_VIRIDIAN", "LC_second_BRONZE", "empty_broadcast", "empty_broadcast", "empty_broadcast",
            "GW_DULL_YELLOW", "RM_MUSIC", "empty_broadcast", "empty_broadcast", "empty_broadcast",
        ]
    }
]

export const orderPearls = (pearls: PearlData[]): { name: string, items: PearlData[] }[] => {
    const pearlsById = pearls.reduce((acc, pearl) => {
        acc[pearl.id] = pearl;
        return acc;
    }, {} as Record<string, PearlData>);

    const orderedPearls = pearlOrder.map(chapter => ({
        name: chapter.name,
        items: chapter.ids.map(id => pearlsById[id])
    }));

    // check if any is undefined
    if (orderedPearls.some(chapter => chapter.items.some(item => !item))) {
        // find the exact pearls by id that are undefined
        for (const chapter of pearlOrder) {
            for (const id of chapter.ids) {
                if (!pearlsById[id]) {
                    console.error(`Pearl with id ${id} not found`);
                }
            }
        }
    }

    const coveredIds = new Set(pearlOrder.flatMap(chapter => chapter.ids));
    const uncoveredPearls = pearls.filter(pearl => !coveredIds.has(pearl.id));
    orderedPearls.push({ name: "Other", items: uncoveredPearls });
    return orderedPearls;
}