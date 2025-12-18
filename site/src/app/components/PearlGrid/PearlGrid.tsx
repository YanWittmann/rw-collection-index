import { PearlData } from "../../types/types";
import { UnlockMode } from "../../page";
import { RwTextInput } from "./RwTextInput";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PearlItem from "./PearlItem";
import { cn } from "@shadcn/lib/utils";
import { RwIconButton } from "../other/RwIconButton";
import { FilterSection, FilterState, PearlFilter } from "./PearlFilter";
import { regionColors, regionNames, speakerNames, speakersColors } from "../../utils/speakers";
import { OrderedChapter } from "../../utils/pearlOrder";

interface FlatChapterItem {
    id: string;
    name: string;
    items: PearlData[];
    depth: number;
    hasSubChapters: boolean;
    isExpanded: boolean;
    originalChapter: OrderedChapter;
}

interface PearlGridProps {
    pearls: PearlData[]
    selectedPearl: string | null
    onSelectPearl: (id: string) => void
    order: (pearls: PearlData[]) => OrderedChapter[]
    unlockMode: UnlockMode
    isAlternateDisplayModeActive: boolean
    isMobile: boolean
    setUnlockMode: (mode: UnlockMode) => void
    unlockVersion: number
    handleKeyNavigation?: (e: KeyboardEvent, pearls: PearlData[][], currentPearlId: string | null) => void
    currentGridPosition?: [number, number]
    onSearchTextChange?: (text: string | undefined) => void
    datasetKey?: string
}

interface MemoizedPearlItemProps {
    pearl: PearlData;
    pearlIndex: number;
    selectedPearl: string | null;
    onSelectPearl: (id: string) => void;
    unlockMode: UnlockMode;
    showTranscriberCount: boolean;
    unlockVersion: number;
}

const SearchBar = ({ isMobile, unlockMode, onTextInput, onToggleUnlockMode, filters, setFilters, filterSections }: {
    isMobile: boolean
    unlockMode: UnlockMode
    onTextInput: (text: string) => void
    onToggleUnlockMode: () => void
    filters: FilterState
    setFilters: React.Dispatch<React.SetStateAction<FilterState>>
    filterSections: FilterSection[]
}) => {
    return (
        <div className={"flex gap-2 items-center"}>
            <div className={cn("relative flex items-center", isMobile ? "flex-1" : "w-full")}>
                <RwTextInput
                    value={filters.text || ''}
                    className="w-full pr-8 bg-gray-950"
                    onTextInput={onTextInput}
                    placeholder="Search..."
                />
                {(filters.text || '').length > 0 && (
                    <button
                        type="button"
                        onClick={() => onTextInput('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-white/60 hover:text-white focus:outline-none transition-colors"
                        aria-label="Clear search">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                )}
            </div>
            <PearlFilter
                filters={filters}
                setFilters={setFilters}
                filterSections={filterSections}
            />
            {isMobile && (
                <RwIconButton
                    square={false}
                    onClick={onToggleUnlockMode}
                    className="shrink-0"
                    aria-label="Toggle Unlock Mode"
                >
                    <span className="text-white">
                        {unlockMode === "all" ? "Spoiler" : "Show All"}
                    </span>
                </RwIconButton>
            )}
        </div>
    );
};

// wrapper component for lazy loading
const LazyChapterGrid = (
    {
        flatChapter,
        chapterIndex,
        isVisible,
        setVisibleChapters,
        currentGridPosition,
        selectedPearlRef,
        getHighlightStyle,
        unlockMode,
        selectedPearl,
        onSelectPearl,
        isAlternateDisplayModeActive,
        unlockVersion,
        onToggle
    }: {
        flatChapter: FlatChapterItem
        chapterIndex: number
        isVisible: boolean
        setVisibleChapters: (callback: (prev: Set<number>) => Set<number>) => void
        currentGridPosition?: [number, number]
        selectedPearlRef: React.RefObject<HTMLDivElement | null>
        getHighlightStyle: (chapterId: string, itemIndex: number) => React.CSSProperties
        unlockMode: UnlockMode
        selectedPearl: string | null
        onSelectPearl: (id: string) => void
        isAlternateDisplayModeActive: boolean
        unlockVersion: number
        onToggle: () => void
    }) => {
    const observerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const currentRef = observerRef.current;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisibleChapters(prev => new Set([...Array.from(prev), chapterIndex]));
                }
            },
            { rootMargin: '200px' }
        );

        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [chapterIndex, setVisibleChapters]);

    return (
        <div ref={observerRef} className="last:mb-4">
            {/* Header / Toggle Button */}
            {flatChapter.name && (
                flatChapter.originalChapter.headerType === "banner" ? (
                    <RwIconButton
                        square={false}
                        className={cn("w-full", flatChapter.depth > 0 && "mt-2", !flatChapter.hasSubChapters && "mb-3")}
                        onClick={onToggle}
                        expandedScaleFactor={0.2}
                        aria-label={flatChapter.name}
                        style={{
                            marginLeft: `${flatChapter.depth * 16}px`,
                            width: `calc(100% - ${flatChapter.depth * 16}px)`
                        }}
                    >
                        <div className="flex w-full items-center justify-start gap-4">
                            {flatChapter.originalChapter.icon && (
                                <img
                                    src={flatChapter.originalChapter.icon}
                                    alt=""
                                    className="h-8 w-8 object-contain opacity-80"
                                />
                            )}
                            <span className={cn("font-medium text-md tracking-wide", flatChapter.isExpanded ? "text-white" : "text-gray-500")}>
                                {flatChapter.name}
                            </span>
                        </div>
                    </RwIconButton>
                ) : (
                    <button
                        onClick={onToggle}
                        className={cn("flex items-center gap-2 w-full text-left group focus:outline-none", flatChapter.isExpanded && flatChapter.items.length > 0 && "mb-2")}
                        style={{ paddingLeft: `${flatChapter.depth * 16}px` }}
                    >
                        <h3 className="text-white text-sm font-medium group-hover:text-white/90">
                            {flatChapter.name}
                        </h3>
                        <div className={cn(
                            "text-white/60 group-hover:text-white transition-transform duration-200",
                            flatChapter.isExpanded ? "rotate-90" : "rotate-0"
                        )}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="m9 18 6-6-6-6"/>
                            </svg>
                        </div>
                    </button>
                )
            )}

            {/* Content Body */}
            {flatChapter.isExpanded && flatChapter.items.length > 0 && (
                <>
                    {isVisible ? (
                        <div className="grid grid-cols-5 gap-2 w-fit pl-2">
                            {flatChapter.items.map((pearl, pearlIndex) => pearl && pearl.id && (
                                <div
                                    key={`pearl-${pearl.id}`}
                                    ref={currentGridPosition && getHighlightStyle(flatChapter.id, pearlIndex).outline ? selectedPearlRef : undefined}
                                    style={getHighlightStyle(flatChapter.id, pearlIndex)}
                                >
                                    <MemoizedPearlItem
                                        pearl={pearl}
                                        pearlIndex={pearlIndex}
                                        selectedPearl={selectedPearl}
                                        onSelectPearl={onSelectPearl}
                                        unlockMode={unlockMode}
                                        showTranscriberCount={isAlternateDisplayModeActive}
                                        unlockVersion={unlockVersion}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        // Placeholder for lazy loading
                        <div className="h-[50px] ml-2 bg-black/20 rounded-xl"/>
                    )}
                </>
            )}
        </div>
    );
};

// memoized components
const MemoizedPearlItem = React.memo<MemoizedPearlItemProps>((
    {
        pearl,
        pearlIndex,
        selectedPearl,
        onSelectPearl,
        unlockMode,
        showTranscriberCount,
        unlockVersion
    }) => (
    <PearlItem
        pearl={pearl}
        pearlIndex={pearlIndex}
        selectedPearl={selectedPearl}
        onSelectPearl={onSelectPearl}
        unlockMode={unlockMode}
        showTranscriberCount={showTranscriberCount}
        unlockVersion={unlockVersion}
    />
));

function randomHexColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

const useIsScrollable = (ref: React.RefObject<HTMLDivElement | null>) => {
    const [isScrollable, setIsScrollable] = useState(false);
    const [showGradient, setShowGradient] = useState(false);

    useEffect(() => {
        const checkScrollable = () => {
            if (ref.current) {
                const { scrollHeight, clientHeight, scrollTop } = ref.current;
                // only consider it scrollable if there's actually more content than fits
                const hasScrollableContent = scrollHeight > clientHeight;
                setIsScrollable(hasScrollableContent);

                if (hasScrollableContent) {
                    // show gradient if not at bottom
                    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
                    setShowGradient(!isAtBottom);
                } else {
                    // if not scrollable, always hide the gradient
                    setShowGradient(false);
                }
            }
        };

        const handleScroll = () => {
            if (ref.current) {
                const { scrollHeight, clientHeight, scrollTop } = ref.current;
                // only show gradient if we have scrollable content and aren't at bottom
                if (scrollHeight > clientHeight) {
                    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
                    setShowGradient(!isAtBottom);
                } else {
                    setShowGradient(false);
                }
            }
        };

        checkScrollable();
        window.addEventListener('resize', checkScrollable);
        ref.current?.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('resize', checkScrollable);
            ref.current?.removeEventListener('scroll', handleScroll);
        };
    }, [ref]);

    return { isScrollable, showGradient, setShowGradient };
};

export function PearlGrid({
                              pearls,
                              selectedPearl,
                              onSelectPearl,
                              order,
                              unlockMode,
                              isAlternateDisplayModeActive,
                              isMobile,
                              setUnlockMode,
                              unlockVersion,
                              handleKeyNavigation,
                              currentGridPosition,
                              onSearchTextChange,
                              datasetKey
                          }: PearlGridProps) {
    const [filters, setFilters] = useState<FilterState>({
        text: undefined,
        tags: new Set(),
        types: new Set(),
        regions: new Set(),
        speakers: new Set()
    });

    const filterSections: FilterSection[] = useMemo(() => {
        // Extract unique regions from all pearls
        const uniqueRegions = new Set<string>();
        pearls.forEach(pearl => {
            pearl.metadata.map?.forEach(mapInfo => {
                if (mapInfo.region) {
                    uniqueRegions.add(mapInfo.region);
                }
            });
            pearl.transcribers.forEach(transcriberData => {
                transcriberData.metadata.map?.forEach(mapInfo => {
                    if (mapInfo.region) {
                        uniqueRegions.add(mapInfo.region);
                    }
                });
            });
        });

        // Extract unique speakers from all pearls
        const uniqueSpeakers = new Set<string>();
        pearls.forEach(pearl => {
            pearl.transcribers.forEach(transcriber => {
                transcriber.lines.forEach(line => {
                    if (line.speaker) {
                        uniqueSpeakers.add(line.speaker);
                    }
                });
            });
        });
        // FP == Five Pebbles, use the acronym
        uniqueSpeakers.delete("Five Pebbles");

        // Convert to sorted arrays for consistent display
        const sortedRegions = Array.from(uniqueRegions).sort();
        const sortedSpeakers = Array.from(uniqueSpeakers).sort((a, b) => {
            const indexA = Object.keys(speakerNames).indexOf(a);
            const indexB = Object.keys(speakerNames).indexOf(b);

            // If both speakers are in speakerNames, sort by their order in the object
            if (indexA !== -1 && indexB !== -1) {
                return indexA - indexB;
            }

            // If only one is in speakerNames, prioritize that one
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;

            // If neither is in speakerNames, sort alphabetically
            return a.localeCompare(b);
        });

        return [
            {
                title: "Tags",
                options: [
                    { id: "vanilla", label: "Vanilla (No DLC)", icon: "vanilla-rw" },
                    { id: "downpour", label: "Downpour", icon: "dlc-dp" },
                    { id: "watcher", label: "Watcher", icon: "dlc-watcher" },
                ]
            },
            {
                title: "Types",
                options: [
                    { id: "pearl", label: "Pearl", icon: "pearl", iconColor: randomHexColor() },
                    { id: "broadcast", label: "Broadcast", icon: "broadcast", iconColor: randomHexColor() },
                    { id: "echo", label: "Echo", icon: "echo" },
                    { id: "item", label: "Other", icon: "item/Bubble_Weed_icon" }
                ]
            },
            {
                title: "Regions",
                options: sortedRegions.map(region => ({
                    id: region,
                    label: regionNames[region] ?? region,
                    content: region,
                    iconColor: regionColors[region]
                }))
            },
            {
                title: "Speakers",
                options: sortedSpeakers.map(speaker => ({
                    id: speaker,
                    label: speakerNames[speaker] ?? speaker,
                    content: speaker,
                    iconColor: speakersColors[speaker]
                }))
            }
        ] as FilterSection[];
    }, [pearls]);

    const selectedPearlRef = useRef<HTMLDivElement>(null);
    const [visibleChapters, setVisibleChapters] = useState(new Set([0]));
    const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
    const [hasInitializedExpansion, setHasInitializedExpansion] = useState(false);

    const handleSelectPearl = useCallback((id: string) => {
        onSelectPearl(id);
    }, [onSelectPearl]);

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
                t.lines.map(line => line.speaker).filter((s): s is string => !!s)
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
    }, [filters, unlockMode]);

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

    const filteredTree = useMemo(() => {
        const orderedPearls = order(pearls);
        return filterChapterTree(orderedPearls);
    }, [order, pearls, filterChapterTree]);

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

    const displayList = useMemo(() => {
        const list: FlatChapterItem[] = [];

        const flatten = (chapters: OrderedChapter[], depth: number, parentIdPrefix: string) => {
            chapters.forEach((chapter, index) => {
                const uniqueId = `${parentIdPrefix}-${chapter.name}`;
                const hasItems = (chapter.items && chapter.items.length > 0) || false;
                const hasSub = (chapter.subChapters && chapter.subChapters.length > 0) || false;
                const isExpanded = expandedChapters.has(chapter.name);

                list.push({
                    id: uniqueId,
                    name: chapter.name,
                    items: chapter.items || [],
                    depth: depth,
                    hasSubChapters: hasSub,
                    isExpanded: isExpanded,
                    originalChapter: chapter
                });

                if (isExpanded && hasSub) {
                    const nextDepth = chapter.headerType === 'banner' ? 0 : depth + 1;
                    flatten(chapter.subChapters!, nextDepth, uniqueId);
                }
            });
        };

        flatten(filteredTree, 0, 'root');
        return list;
    }, [filteredTree, expandedChapters]);

    useEffect(() => {
        if (!isMobile && totalItems === 1 && firstItem && (!selectedPearl || selectedPearl !== firstItem.id)) {
            const timer = setTimeout(() => {
                onSelectPearl(firstItem!.id);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [totalItems, firstItem, isMobile, onSelectPearl, selectedPearl]);

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
        const baseTree = order(pearls);
        traverse(baseTree);
        setExpandedChapters(defaultOpenNames);
    }, [order, pearls]);

    useEffect(() => {
        setHasInitializedExpansion(false);
    }, [datasetKey]);

    useEffect(() => {
        if (!hasInitializedExpansion && filteredTree.length > 0) {
            expandDefaults();
            setHasInitializedExpansion(true);
        }
    }, [filteredTree, hasInitializedExpansion, expandDefaults]);

    useEffect(() => {
        const hasActiveFilter =
            (filters.text && filters.text.length > 0) ||
            filters.tags.size > 0 ||
            filters.types.size > 0 ||
            filters.regions.size > 0 ||
            filters.speakers.size > 0;

        if (hasActiveFilter) {
            expandAll();
        }
    }, [filters, expandAll]);

    useEffect(() => {
        if (!selectedPearl) return;

        const path = new Set<string>();
        const findPath = (chapters: OrderedChapter[]): boolean => {
            for (const chapter of chapters) {
                if (chapter.items && chapter.items.some(p => p.id === selectedPearl)) {
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
    }, [selectedPearl, filteredTree]);

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

    const pearlGrid = useMemo(() => {
        const grid: PearlData[][] = [];
        displayList.forEach(chapter => {
            if (chapter.isExpanded && chapter.items.length > 0) {
                const items = chapter.items;
                for (let i = 0; i < items.length; i += 5) {
                    grid.push(items.slice(i, i + 5));
                }
            }
        });
        return grid;
    }, [displayList]);

    useEffect(() => {
        if (!handleKeyNavigation) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (!(e.target instanceof HTMLInputElement)) {
                handleKeyNavigation(e, pearlGrid, selectedPearl);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyNavigation, pearlGrid, selectedPearl]);

    const getHighlightStyle = useCallback((chapterId: string, itemIndex: number) => {
        if (!currentGridPosition) return {};

        const [targetRow, targetCol] = currentGridPosition;
        let currentRow = 0;
        let found = false;

        for (let i = 0; i < displayList.length && !found; i++) {
            const chapter = displayList[i];

            if (chapter.isExpanded && chapter.items.length > 0) {
                const numRows = Math.ceil(chapter.items.length / 5);

                if (chapter.id === chapterId) {
                    const itemRow = Math.floor(itemIndex / 5);
                    const itemCol = itemIndex % 5;
                    if (currentRow + itemRow === targetRow && itemCol === targetCol) {
                        return {
                            outline: '2px solid rgba(255, 255, 255, 0.5)',
                            borderRadius: '0.75rem'
                        };
                    }
                    found = true;
                }
                currentRow += numRows;
            }
        }

        return {};
    }, [currentGridPosition, displayList]);

    const toggleUnlockMode = useCallback(() => {
        setUnlockMode(unlockMode === "all" ? "unlock" : "all");
    }, [unlockMode, setUnlockMode]);

    const handleTextInput = useCallback((text: string) => {
        setFilters(prev => ({ ...prev, text: text === '' ? undefined : text }));
        onSearchTextChange?.(text === '' ? undefined : text);
    }, [onSearchTextChange]);

    useEffect(() => {
        if (!selectedPearlRef.current) return;

        const scrollContainer = selectedPearlRef.current.closest('.no-scrollbar');
        if (!scrollContainer) return;

        const itemRect = selectedPearlRef.current.getBoundingClientRect();
        const containerRect = scrollContainer.getBoundingClientRect();
        const padding = 120;

        if (itemRect.top < containerRect.top + padding ||
            itemRect.bottom > containerRect.bottom - padding) {
            selectedPearlRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }, [currentGridPosition]);

    const containerRef = useRef<HTMLDivElement>(null);
    const { isScrollable, showGradient, setShowGradient } = useIsScrollable(containerRef);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (containerRef.current) {
                const { scrollHeight, clientHeight, scrollTop } = containerRef.current;
                const hasScrollableContent = scrollHeight > clientHeight;

                if (hasScrollableContent) {
                    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
                    setShowGradient(!isAtBottom);
                } else {
                    setShowGradient(false);
                }
            }
        }, 0);

        return () => clearTimeout(timer);
    }, [filteredTree, expandedChapters]);

    return (
        <div className={cn(
            "relative",
            isMobile ? "w-full max-h-[98svh] h-[98svh]" : "w-[18rem] max-h-[80svh]"
        )}>
            <div className={cn(
                "no-scrollbar overflow-y-auto box-border h-full",
                isMobile ? "px-4" : "px-1"
            )} ref={containerRef}>
                {/* Sticky Header */}
                <div className={cn(
                    "sticky top-0 z-20 bg-gray-950/90 backdrop-blur-sm",
                    isMobile ? "pt-4" : "pt-1",
                    "mb-4"
                )}>
                    <SearchBar
                        isMobile={isMobile}
                        unlockMode={unlockMode}
                        onTextInput={handleTextInput}
                        onToggleUnlockMode={toggleUnlockMode}
                        filters={filters}
                        setFilters={setFilters}
                        filterSections={filterSections}
                    />
                </div>

                {/* Scrollable Content */}
                <div className={cn(
                    "grid grid-cols-1 gap-4",
                    isMobile ? "" : "px-1",
                    isMobile ? "pb-4" : "pb-1"
                )}>
                    {displayList.map((flatChapter, index) => (
                        <LazyChapterGrid
                            key={flatChapter.id}
                            flatChapter={flatChapter}
                            chapterIndex={index}
                            isVisible={visibleChapters.has(index)}
                            setVisibleChapters={setVisibleChapters}
                            currentGridPosition={currentGridPosition}
                            selectedPearlRef={selectedPearlRef}
                            getHighlightStyle={getHighlightStyle}
                            unlockMode={unlockMode}
                            selectedPearl={selectedPearl}
                            onSelectPearl={handleSelectPearl}
                            isAlternateDisplayModeActive={isAlternateDisplayModeActive}
                            unlockVersion={unlockVersion}
                            onToggle={() => toggleChapter(flatChapter.name)}
                        />
                    ))}
                </div>
            </div>
            <div
                className={cn(
                    "absolute bottom-0 left-0 right-0 h-8 pointer-events-none bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-white/20 to-transparent transition-opacity duration-300 border-b-2 border-white/50 z-10",
                    isScrollable && showGradient ? "opacity-100" : "opacity-0"
                )}
            />
        </div>
    );
}

export default React.memo(PearlGrid);