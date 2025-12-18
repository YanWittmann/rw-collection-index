import { useCallback, useEffect, useRef, useState } from 'react';
import { OrderedChapter } from '../utils/pearlOrder';
import { useAppContext } from '../context/AppContext';

export function useChapterExpansion(filteredTree: OrderedChapter[], baseTree: OrderedChapter[]) {
    const { selectedPearlId, filters, datasetKey } = useAppContext();
    const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
    const [hasInitializedExpansion, setHasInitializedExpansion] = useState(false);
    const preFilterExpansion = useRef<Set<string> | null>(null);

    const expandAll = useCallback(() => {
        const allNames = new Set<string>();
        const traverse = (chapters: OrderedChapter[]) => {
            chapters.forEach(c => {
                allNames.add(c.name);
                if (c.subChapters) traverse(c.subChapters);
            });
        };
        traverse(filteredTree);
        setExpandedChapters(allNames);
    }, [filteredTree]);

    const expandDefaults = useCallback(() => {
        const defaultOpenNames = new Set<string>();
        const traverse = (chapters: OrderedChapter[]) => {
            chapters.forEach(c => {
                if (c.defaultOpen !== false) defaultOpenNames.add(c.name);
                if (c.subChapters) traverse(c.subChapters);
            });
        };
        traverse(baseTree);
        setExpandedChapters(defaultOpenNames);
    }, [baseTree]);

    // Effect for initial default expansion
    useEffect(() => {
        if (!hasInitializedExpansion && filteredTree.length > 0) {
            expandDefaults();
            setHasInitializedExpansion(true);
        }
    }, [filteredTree, hasInitializedExpansion, expandDefaults]);

    // Reset initialization when the dataset changes
    useEffect(() => {
        setHasInitializedExpansion(false);
    }, [datasetKey]);

    // Effect to handle expansion state during filtering
    useEffect(() => {
        const hasActiveFilter =
            (filters.text && filters.text.length > 0) ||
            filters.tags.size > 0 ||
            filters.types.size > 0 ||
            filters.regions.size > 0 ||
            filters.speakers.size > 0;

        if (hasActiveFilter) {
            // We are entering or continuing filter mode.
            if (preFilterExpansion.current === null) {
                // This is the first filter application, so store the current state.
                preFilterExpansion.current = expandedChapters;
            }
            expandAll();
        } else {
            // We are leaving filter mode.
            if (preFilterExpansion.current !== null) {
                // We have a stored state, so restore it.
                setExpandedChapters(preFilterExpansion.current);
                preFilterExpansion.current = null; // Clear the stored state.
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, expandAll]);

    // Effect to expand the path to the selected pearl
    useEffect(() => {
        if (!selectedPearlId) return;

        const path = new Set<string>();
        const findPath = (chapters: OrderedChapter[]): boolean => {
            for (const chapter of chapters) {
                if (chapter.items && chapter.items.some(p => p.id === selectedPearlId)) {
                    path.add(chapter.name);
                    return true;
                }
                if (chapter.subChapters) {
                    if (findPath(chapter.subChapters)) {
                        path.add(chapter.name);
                        return true;
                    }
                }
            }
            return false;
        };

        if (findPath(filteredTree)) {
            setExpandedChapters(prev => {
                let needsUpdate = false;
                path.forEach(name => {
                    if (!prev.has(name)) needsUpdate = true;
                });

                if (!needsUpdate) return prev;

                const newSet = new Set(prev);
                path.forEach(name => newSet.add(name));
                return newSet;
            });
        }
    }, [selectedPearlId, filteredTree]);

    const toggleChapter = useCallback((chapterName: string) => {
        setExpandedChapters(prev => {
            const next = new Set(prev);
            if (next.has(chapterName)) {
                next.delete(chapterName);
            } else {
                next.add(chapterName);
            }
            return next;
        });
    }, []);

    return { expandedChapters, toggleChapter };
}