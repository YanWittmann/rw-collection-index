import { useCallback, useMemo } from 'react';
import { PearlData } from '../types/types';
import { OrderedChapter } from '../utils/pearlOrder';
import { useAppContext } from '../context/AppContext';

export function useFilteredPearls(allPearls: PearlData[], order: (pearls: PearlData[]) => OrderedChapter[]) {
    const { filters } = useAppContext();

    const isPearlIncluded = useCallback((pearl: PearlData) => {
        // Apply tag filters
        if (filters.tags.size > 0) {
            const aggregatedTags = pearl.transcribers.flatMap(t => t.metadata.tags ? t.metadata.tags : []);
            let found = false;
            for (let tag of Array.from(filters.tags)) {
                if (aggregatedTags.includes(tag)) {
                    found = true;
                    break;
                }
            }
            if (!found) return false;
        }

        // Apply type filters
        if (filters.types.size > 0) {
            const typeMatches = filters.types.has(pearl.metadata.type);
            const watcherEcho = filters.types.has("echo") && pearl.transcribers.some(t => t.transcriber === "spinning-top")
            if (!typeMatches && !watcherEcho) {
                return false;
            }
        }

        // Apply region filters
        if (filters.regions.size > 0) {
            const pearlRegions = new Set(pearl.transcribers.flatMap(t => t.metadata.map?.map(m => m.region) || []));
            let found = false;
            for (let region of Array.from(filters.regions)) {
                if (pearlRegions.has(region)) {
                    found = true;
                    break;
                }
            }
            if (!found) return false;
        }

        // Apply speaker filters
        if (filters.speakers.size > 0) {
            const clonedSpeakers = new Set(filters.speakers);
            if (clonedSpeakers.has("FP")) {
                clonedSpeakers.add("Five Pebbles");
            }
            const pearlSpeakers = new Set(pearl.transcribers.flatMap(t =>
                t.lines.filter(line => line !== undefined && line.speaker !== undefined).map(line => (line.namespace ? line.namespace + "-" : "") + line.speaker)
            ));
            let found = false;
            for (let speaker of Array.from(clonedSpeakers)) {
                if (pearlSpeakers.has(speaker)) {
                    found = true;
                    break;
                }
            }
            if (!found) return false;
        }

        // Apply text filter
        if (!filters.text) return true;

        const text = filters.text;
        const isValidRegionName = text.length === 2 && text.match(/^[A-Z]{2}$/);
        if (isValidRegionName && pearl.metadata.map?.find(m => m.region.toLowerCase() === text.toLowerCase())) {
            return true;
        }

        if (pearl.id.toLowerCase().includes(text.toLowerCase())) {
            return true;
        }
        if (pearl.metadata.internalId && pearl.metadata.internalId.toLowerCase().includes(text.toLowerCase())) {
            return true;
        }

        const searchText = text.toLowerCase();
        return pearl.metadata.name?.toLowerCase().includes(searchText) ||
            pearl.transcribers.some(t => t.lines.some(line =>
                (line.speaker + ": " + line.text).toLowerCase().includes(searchText)
            )) ||
            pearl.transcribers.some(t => t.transcriber.toLowerCase() === searchText);
    }, [filters]);

    const filterChapterTree = useCallback((chapters: OrderedChapter[]): OrderedChapter[] => {
        return chapters.reduce<OrderedChapter[]>((acc, chapter) => {
            const filteredItems = chapter.items ? chapter.items.filter(isPearlIncluded) : [];
            const filteredSubChapters = chapter.subChapters ? filterChapterTree(chapter.subChapters) : [];

            if (filteredItems.length > 0 || filteredSubChapters.length > 0) {
                acc.push({
                    ...chapter,
                    items: filteredItems,
                    subChapters: filteredSubChapters
                });
            }
            return acc;
        }, []);
    }, [isPearlIncluded]);

    const baseTree = useMemo(() => order(allPearls), [order, allPearls]);

    const filteredTree = useMemo(() => {
        return filterChapterTree(baseTree);
    }, [baseTree, filterChapterTree]);

    const { totalItems, firstItem } = useMemo<{ totalItems: number; firstItem: PearlData | null }>(() => {
        let count = 0;
        let first: PearlData | null = null;

        const countItems = (chapters: OrderedChapter[]) => {
            chapters.forEach(c => {
                if (c.items) {
                    count += c.items.length;
                    if (!first && c.items.length > 0) first = c.items[0];
                }
                if (c.subChapters) countItems(c.subChapters);
            });
        };
        countItems(filteredTree);
        return { totalItems: count, firstItem: first };
    }, [filteredTree]);

    return { baseTree, filteredTree, totalItems, firstItem };
}