import { PearlData } from "../types/types";

export interface PearlChapter {
    name: string;
    ids: string[];
}

export const pearlOrder: PearlChapter[] = [
    {
        name: "Vanilla / Downpour",
        ids: [
            "SU_LIGHT_BLUE", "HI_BRIGHT_BLUE", "DS_BRIGHT_GREEN", "SU_filt_LIGHT_PINK", "GW_VIRIDIAN", "SL_bridge_BRIGHT_PURPLE", "SL_chimney_BRIGHT_MAGENTA", "SL_moon_PALE_YELLOW",
            "SH_DEEP_MAGENTA", "UW_PALE_GREEN", "CC_GOLD", "SI_top_DARK_GREEN", "SI_west_DARK_BLUE", "SI_chat3_DARK_PURPLE", "SI_chat4_OLIVE_GREEN", "SI_chat5_DARK_MAGENTA"
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