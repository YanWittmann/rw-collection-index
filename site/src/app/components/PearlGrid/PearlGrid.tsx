import { PearlData } from "../../types/types";
import { UnlockMode } from "../../page";
import { RwTextInput } from "./RwTextInput";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PearlItem from "./PearlItem";
import UnlockManager from "../../utils/unlockManager";
import { cn } from "@shadcn/lib/utils";
import { RwIconButton } from "../other/RwIconButton";
import { FilterSection, FilterState, PearlFilter } from "./PearlFilter";

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
            <PearlFilter
                filters={filters}
                setFilters={setFilters}
                filterSections={filterSections}
            />
            <RwTextInput
                className={cn("", isMobile ? "flex-1" : "w-full")}
                onTextInput={onTextInput}
                placeholder="Search..."
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
                              currentGridPosition
                          }: PearlGridProps) {
    const [filters, setFilters] = useState<FilterState>({
        text: undefined,
        tags: new Set(),
        types: new Set()
    });

    const filterSections: FilterSection[] = [
        {
            title: "Types",
            options: [
                { id: "pearl", label: "Pearl", icon: "pearl" },
                { id: "broadcast", label: "Broadcast", icon: "broadcast" },
                { id: "echo", label: "Echo", icon: "echo" },
                { id: "item", label: "Other", icon: "item/Karma_Flower_icon" }
            ]
        },
        {
            title: "Tags",
            options: [
                { id: "vanilla", label: "Vanilla (No DLC)", icon: "vanilla-rw" },
                { id: "downpour", label: "Downpour", icon: "dlc-dp" },
            ]
        }
    ];

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
    }, []);

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

    return (
        <div className={cn(
            "no-scrollbar overflow-y-auto box-border",
            isMobile ? "w-full max-h-[98svh] h-[98svh] p-4" : "w-[18rem] max-h-[80svh] p-1"
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
    );
}

export default React.memo(PearlGrid);
