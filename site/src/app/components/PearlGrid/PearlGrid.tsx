import { PearlData } from "../../types/types";
import { UnlockMode } from "../../page";
import { RwTextInput } from "./RwTextInput";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PearlItem from "./PearlItem";
import UnlockManager from "../../utils/unlockManager";
import { cn } from "@shadcn/lib/utils";
import { RwIconButton } from "../other/RwIconButton";
import { FilterSection, FilterState, PearlFilter } from "./PearlFilter";
import { regionColors, regionNames, speakerNames, speakersColors } from "../../utils/speakers";

interface PearlGridProps {
    pearls: PearlData[]
    selectedPearl: string | null
    onSelectPearl: (id: string) => void
    order: (pearls: PearlData[]) => { name: string, items: PearlData[] }[]
    unlockMode: UnlockMode
    isAlternateDisplayModeActive: boolean
    isMobile: boolean
    setUnlockMode: (mode: UnlockMode) => void
    unlockVersion: number
    handleKeyNavigation?: (e: KeyboardEvent, pearls: PearlData[][], currentPearlId: string | null) => void
    currentGridPosition?: [number, number]
    onSearchTextChange?: (text: string | undefined) => void
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

// helper components
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
        <div className={"flex gap-2 mb-4"}>
            <RwTextInput
                className={cn("", isMobile ? "flex-1" : "w-full")}
                onTextInput={onTextInput}
                placeholder="Search..."
            />
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
        chapter,
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
        unlockVersion
    }: {
        chapter: { name: string, items: PearlData[] }
        chapterIndex: number
        isVisible: boolean
        setVisibleChapters: (callback: (prev: Set<number>) => Set<number>) => void
        currentGridPosition?: [number, number]
        selectedPearlRef: React.RefObject<HTMLDivElement | null>
        getHighlightStyle: (chapterIndex: number, itemIndex: number) => React.CSSProperties
        unlockMode: UnlockMode
        selectedPearl: string | null
        onSelectPearl: (id: string) => void
        isAlternateDisplayModeActive: boolean
        unlockVersion: number
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
            { rootMargin: '200px' } // Load when within 200px of viewport
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
            {chapter.name && <h3 className="text-white text-sm mb-2">{chapter.name}</h3>}
            {isVisible ? (
                <div className="grid grid-cols-5 gap-2 w-fit">
                    {chapter.items.map((pearl, pearlIndex) => pearl && pearl.id && (
                        <div
                            key={`pearl-${pearl.id}`}
                            ref={currentGridPosition && getHighlightStyle(chapterIndex, pearlIndex).outline ? selectedPearlRef : undefined}
                            style={getHighlightStyle(chapterIndex, pearlIndex)}
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
                <div className="h-[100px] bg-black/20 rounded-xl"/>
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
                              onSearchTextChange
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

    const handleSelectPearl = useCallback((id: string) => {
        onSelectPearl(id);
    }, [onSelectPearl]);

    const isPearlIncluded = useCallback((pearl: PearlData) => {
        if (unlockMode === "unlock" && !UnlockManager.isPearlUnlocked(pearl)) {
            return false;
        }

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
            if (!filters.types.has(pearl.metadata.type)) return false;
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
            const pearlSpeakers = new Set(pearl.transcribers.flatMap(t => 
                t.lines.map(line => line.speaker).filter((s): s is string => !!s)
            ));
            let found = false;
            for (let speaker of Array.from(filters.speakers)) {
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

    const filteredPearls = useMemo(() => {
        const orderedPearls = order(pearls);
        const result = orderedPearls.map(chapter => ({
            name: chapter.name,
            items: chapter.items.filter(isPearlIncluded)
        }));

        if (!isMobile) {
            const totalCount = result.reduce((acc, chapter) => acc + chapter.items.length, 0);
            if (totalCount === 1) {
                const first = result.find(chapter => chapter.items.length > 0);
                if (first && first.items.length === 1) {
                    setTimeout(() => {
                        onSelectPearl(first.items[0].id);
                    }, 0);
                }
            }
        }
        return result;
    }, [isPearlIncluded, order, pearls]);

    const pearlGrid = useMemo(() => {
        const grid: PearlData[][] = [];
        filteredPearls.forEach(chapter => {
            const items = chapter.items;
            for (let i = 0; i < items.length; i += 5) {
                grid.push(items.slice(i, i + 5));
            }
        });
        return grid;
    }, [filteredPearls]);

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

    const getHighlightStyle = useCallback((chapterIndex: number, itemIndex: number) => {
        if (!currentGridPosition) return {};

        const [targetRow, targetCol] = currentGridPosition;
        let currentRow = 0;
        let found = false;

        for (let i = 0; i < filteredPearls.length && !found; i++) {
            const chapter = filteredPearls[i];
            const numRows = Math.ceil(chapter.items.length / 5);

            if (i === chapterIndex) {
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

        return {};
    }, [currentGridPosition, filteredPearls]);

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

    // find which chapter contains the selected pearl (if any)
    useEffect(() => {
        if (!selectedPearl) return;

        for (let i = 0; i < filteredPearls.length; i++) {
            if (filteredPearls[i].items.some(pearl => pearl.id === selectedPearl)) {
                setVisibleChapters(prev => new Set([...Array.from(prev), i]));
                break;
            }
        }
    }, [selectedPearl, filteredPearls]);

    const containerRef = useRef<HTMLDivElement>(null);
    const { isScrollable, showGradient, setShowGradient } = useIsScrollable(containerRef);

    // add effect to check scrollable state when content changes
    useEffect(() => {
        // use a small delay to ensure the DOM has updated
        const timer = setTimeout(() => {
            if (containerRef.current) {
                const { scrollHeight, clientHeight, scrollTop } = containerRef.current;
                const hasScrollableContent = scrollHeight > clientHeight;
                
                if (hasScrollableContent) {
                    // show gradient if not at bottom
                    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
                    setShowGradient(!isAtBottom);
                } else {
                    setShowGradient(false);
                }
            }
        }, 0);

        return () => clearTimeout(timer);
    }, [filteredPearls]); // check when filtered content changes

    return (
        <div className={cn(
            "relative",
            isMobile ? "w-full max-h-[98svh] h-[98svh]" : "w-[18rem] max-h-[80svh]"
        )}>
            <div className={cn(
                "no-scrollbar overflow-y-auto box-border h-full",
                isMobile ? "p-4" : "p-1"
            )} ref={containerRef}>
                <SearchBar
                    isMobile={isMobile}
                    unlockMode={unlockMode}
                    onTextInput={handleTextInput}
                    onToggleUnlockMode={toggleUnlockMode}
                    filters={filters}
                    setFilters={setFilters}
                    filterSections={filterSections}
                />
                <div className={cn(
                    "grid grid-cols-1 gap-4",
                    isMobile ? "" : "px-1",
                )}>
                    {filteredPearls
                        .filter(chapter => chapter.items.length > 0)
                        .map((chapter, chapterIndex) => (
                            <LazyChapterGrid
                                key={`chapter-${chapterIndex}`}
                                chapter={chapter}
                                chapterIndex={chapterIndex}
                                isVisible={visibleChapters.has(chapterIndex)}
                                setVisibleChapters={setVisibleChapters}
                                currentGridPosition={currentGridPosition}
                                selectedPearlRef={selectedPearlRef}
                                getHighlightStyle={getHighlightStyle}
                                unlockMode={unlockMode}
                                selectedPearl={selectedPearl}
                                onSelectPearl={handleSelectPearl}
                                isAlternateDisplayModeActive={isAlternateDisplayModeActive}
                                unlockVersion={unlockVersion}
                            />
                        ))}
                </div>
            </div>
            <div 
                className={cn(
                    "absolute bottom-0 left-0 right-0 h-8 pointer-events-none bg-gradient-to-t from-white/15 via-white/7 to-transparent transition-opacity duration-300 border-b-2 border-white/50 z-10",
                    isScrollable && showGradient ? "opacity-100" : "opacity-0"
                )} 
            />
        </div>
    );
}

export default React.memo(PearlGrid);
