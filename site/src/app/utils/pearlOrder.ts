import { PearlData } from "../types/types";

export interface PearlChapter {
    name: string;
    ids: string[];
}

export const pearlOrder: PearlChapter[] = [
    {
        name: "Downpour",
        ids: [
            "SU_LIGHT_BLUE", "HI_LIGHT_GREEN"
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
    const coveredIds = new Set(pearlOrder.flatMap(chapter => chapter.ids));
    const uncoveredPearls = pearls.filter(pearl => !coveredIds.has(pearl.id));
    orderedPearls.push({ name: "Other", items: uncoveredPearls });
    return orderedPearls;
}