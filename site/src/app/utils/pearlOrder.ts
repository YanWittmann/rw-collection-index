import { PearlData } from "../types/types";

export interface PearlChapter {
    ids: string[];
}

export const pearlOrder: PearlChapter[] = [
    {
        ids: [
            "SU_LIGHT_BLUE", "HI_LIGHT_GREEN"
        ]
    }
]

export const orderPearls = (pearls: PearlData[]) => {
    const pearlsById = pearls.reduce((acc, pearl) => {
        acc[pearl.id] = pearl;
        return acc;
    }, {} as Record<string, PearlData>);

    const orderedPearls = pearlOrder.map(chapter => chapter.ids.map(id => pearlsById[id]));
    const coveredIds = new Set(pearlOrder.flatMap(chapter => chapter.ids));
    const uncoveredPearls = pearls.filter(pearl => !coveredIds.has(pearl.id));
    orderedPearls.push(uncoveredPearls);
    return orderedPearls;
}