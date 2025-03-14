import { PearlData } from "../../types/types";
import { UnlockMode } from "../../page";
import { RwTextInput } from "./RwTextInput";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PearlItem from "./PearlItem";
import UnlockManager from "../../utils/unlockManager";
import { cn } from "@shadcn/lib/utils";
import { RwIconButton } from "../other/RwIconButton";

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
const SearchBar = ({ isMobile, unlockMode, onTextInput, onToggleUnlockMode }: {
    isMobile: boolean
    unlockMode: UnlockMode
    onTextInput: (text: string) => void
    onToggleUnlockMode: () => void
}) => (
    <div className={"flex gap-2 mb-4"}>
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
            >
                <span className="text-white">
                    {unlockMode === "all" ? "Spoiler" : "Show All"}
                </span>
            </RwIconButton>
        )}
    </div>
);

const ChapterGrid = ({
                         chapter,
                         chapterIndex,
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
    currentGridPosition?: [number, number]
    selectedPearlRef: React.RefObject<HTMLDivElement | null>
    getHighlightStyle: (chapterIndex: number, itemIndex: number) => React.CSSProperties
    unlockMode: UnlockMode
    selectedPearl: string | null
    onSelectPearl: (id: string) => void
    isAlternateDisplayModeActive: boolean
    unlockVersion: number
}) => (
    <div key={`chapter-${chapterIndex}`} className="last:mb-4">
        {chapter.name && <h3 className="text-white text-sm mb-2">{chapter.name}</h3>}
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
    </div>
);

// memoized components
const MemoizedPearlItem = React.memo<MemoizedPearlItemProps>(({
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
    const [textFilter, setTextFilter] = useState<string | undefined>(undefined);
    const selectedPearlRef = useRef<HTMLDivElement>(null);

    const handleSelectPearl = useCallback((id: string) => {
        onSelectPearl(id);
    }, [onSelectPearl]);

    const isPearlIncluded = useCallback((pearl: PearlData) => {
        if (!textFilter) return true;
        if (unlockMode === "unlock" && !UnlockManager.isPearlUnlocked(pearl)) {
            return false;
        }

        const isValidRegionName = textFilter.length === 2 && textFilter.match(/^[A-Z]{2}$/);
        if (isValidRegionName && pearl.metadata.map?.find(m => m.region.toLowerCase() === textFilter.toLowerCase())) {
            return true;
        }

        if (pearl.id.toLowerCase().includes(textFilter.toLowerCase())) {
            return true;
        }
        if (pearl.metadata.internalId && pearl.metadata.internalId.toLowerCase().includes(textFilter.toLowerCase())) {
            return true;
        }

        const searchText = textFilter.toLowerCase();
        return pearl.metadata.name?.toLowerCase().includes(searchText) ||
            pearl.transcribers.some(t => t.lines.some(line =>
                (line.speaker + ": " + line.text).toLowerCase().includes(searchText)
            )) ||
            pearl.transcribers.some(t => t.transcriber.toLowerCase() === searchText);
    }, [textFilter, unlockMode]);

    const filteredPearls = useMemo(() => {
        const orderedPearls = order(pearls);
        return orderedPearls.map(chapter => ({
            name: chapter.name,
            items: chapter.items.filter(isPearlIncluded)
        }));
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
        setTextFilter(text === '' ? undefined : text);
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

    return (
        <div className={cn(
            "no-scrollbar overflow-y-auto box-border",
            isMobile ? "w-full max-h-[98svh] h-[98svh] p-4" : "w-auto max-h-[80svh] p-1"
        )}>
            <SearchBar
                isMobile={isMobile}
                unlockMode={unlockMode}
                onTextInput={handleTextInput}
                onToggleUnlockMode={toggleUnlockMode}
            />
            <div className={cn(
                "grid grid-cols-1 gap-4",
                isMobile ? "" : "px-1",
            )}>
                {filteredPearls
                    .filter(chapter => chapter.items.length > 0)
                    .map((chapter, chapterIndex) => (
                        <ChapterGrid
                            key={`chapter-${chapterIndex}`}
                            chapter={chapter}
                            chapterIndex={chapterIndex}
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
