import { PearlData } from "../../types/types";
import { UnlockMode } from "../../page";
import { RwTextInput } from "./RwTextInput";
import { useMemo, useState, useCallback } from "react";
import PearlItem from "./PearlItem";
import UnlockManager from "../../utils/unlockManager";
import { cn } from "@shadcn/lib/utils";
import { RwIconButton } from "../other/RwIconButton";
import React from "react";

interface PearlGridProps {
    pearls: PearlData[]
    selectedPearl: string | null
    onSelectPearl: (id: string) => void
    order: (pearls: PearlData[]) => { name: string, items: PearlData[] }[]
    unlockMode: UnlockMode
    isAlternateDisplayModeActive: boolean
    isMobile: boolean
    setUnlockMode: (mode: UnlockMode) => void
}

interface MemoizedPearlItemProps {
    pearl: PearlData;
    pearlIndex: number;
    selectedPearl: string | null;
    onSelectPearl: (id: string) => void;
    unlockMode: UnlockMode;
    showTranscriberCount: boolean;
}

const MemoizedPearlItem = React.memo<MemoizedPearlItemProps>(({
                                                                  pearl,
                                                                  pearlIndex,
                                                                  selectedPearl,
                                                                  onSelectPearl,
                                                                  unlockMode,
                                                                  showTranscriberCount
                                                              }) => {
    return (
        <PearlItem
            pearl={pearl}
            pearlIndex={pearlIndex}
            selectedPearl={selectedPearl}
            onSelectPearl={onSelectPearl}
            unlockMode={unlockMode}
            showTranscriberCount={showTranscriberCount}
        />
    );
});

export function PearlGrid({
                              pearls,
                              selectedPearl,
                              onSelectPearl,
                              order,
                              unlockMode,
                              isAlternateDisplayModeActive,
                              isMobile,
                              setUnlockMode
                          }: PearlGridProps) {
    const [textFilter, setTextFilter] = useState<string | undefined>(undefined);

    const handleSelectPearl = useCallback((id: string) => {
        onSelectPearl(id);
    }, [onSelectPearl]);

    const isPearlIncluded = useCallback((pearl: PearlData) => {
        if (!textFilter) return true;
        if (unlockMode === "unlock") {
            if (!UnlockManager.isPearlUnlocked(pearl)) {
                return false;
            }
        }

        const isValidRegionName = textFilter.length === 2 && textFilter.match(/^[A-Z]{2}$/);
        if (isValidRegionName && pearl.metadata.map?.find(m => m.region.toLowerCase() === textFilter.toLowerCase())) return true;

        if (pearl.metadata.name?.toLowerCase().includes(textFilter.toLowerCase())) return true;
        if (pearl.transcribers.some(transcriber => transcriber.lines.some(line => (line.speaker + ": " + line.text).toLowerCase().includes(textFilter.toLowerCase())))) return true;
        if (pearl.transcribers.some(transcriber => transcriber.transcriber.toLowerCase() === textFilter.toLowerCase())) return true;
        return false;
    }, [textFilter, unlockMode]);

    const filteredPearls = useMemo(() => {
        const orderedPearls = order(pearls);
        return orderedPearls.map(chapter => ({
            name: chapter.name,
            items: chapter.items.filter(isPearlIncluded)
        }));
    }, [isPearlIncluded, order, pearls]);

    const toggleUnlockMode = useCallback(() => {
        setUnlockMode(unlockMode === "all" ? "unlock" : "all");
    }, [unlockMode, setUnlockMode]);

    const handleTextInput = useCallback((text: string) => {
        text === '' ? setTextFilter(undefined) : setTextFilter(text);
    }, []);

    return (
        <>
            <div className={cn(
                "no-scrollbar overflow-y-auto box-border",
                isMobile ? "w-full" : "w-auto",
                isMobile ? "max-h-[98svh] h-[98svh] p-4" : "max-h-[80svh] p-1"
            )}>
                <div className={"flex gap-2 mb-4"}>
                    <RwTextInput
                        className={cn("", isMobile ? "flex-1" : "w-full")}
                        onTextInput={handleTextInput}
                        placeholder="Search..."
                    />
                    {isMobile && (
                        <RwIconButton
                            square={false}
                            onClick={toggleUnlockMode}
                            className="shrink-0"
                        >
                            <span className="text-white">
                                {unlockMode === "all" ? "Spoiler" : "Show All"}
                            </span>
                        </RwIconButton>
                    )}
                </div>
                <div className={cn(
                    isMobile ? "" : "px-1",
                )}>
                    {filteredPearls
                        .filter(chapter => chapter.items.length > 0)
                        .map((chapter, chapterIndex) => (
                            <div key={`chapter-${chapterIndex}`} className="mb-4 last:mb-0">
                                {chapter.name && <h3 className="text-white text-sm mb-2">{chapter.name}</h3>}
                                <div className="grid grid-cols-5 gap-2 w-fit">
                                    {chapter.items.map(
                                        (pearl, pearlIndex) => pearl && pearl.id && (
                                            <MemoizedPearlItem
                                                key={`pearl-${pearl.id}`}
                                                pearl={pearl}
                                                pearlIndex={pearlIndex}
                                                selectedPearl={selectedPearl}
                                                onSelectPearl={handleSelectPearl}
                                                unlockMode={unlockMode}
                                                showTranscriberCount={isAlternateDisplayModeActive}
                                            />
                                        )
                                    )}
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </>
    );
}

export default React.memo(PearlGrid);
