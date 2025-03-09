import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@shadcn/components/ui/tooltip";
import { RwIcon } from "./RwIcon";
import { RwIconButton } from "../other/RwIconButton";
import UnlockManager from "../../utils/unlockManager";
import { MapInfo, PearlData } from "../../types/types";
import { UnlockMode } from "../../page";
import React, { useCallback, useMemo } from "react";

interface PearlItemProps {
    pearl: PearlData
    pearlIndex: number
    selectedPearl: string | null
    onSelectPearl: (id: string) => void
    unlockMode: UnlockMode
    showTranscriberCount: boolean
}

const PearlItem: React.FC<PearlItemProps> = ({ pearl, pearlIndex, selectedPearl, onSelectPearl, unlockMode, showTranscriberCount }) => {
    const isSelected = pearl.id === selectedPearl;

    const isUnlocked = useMemo(() => {
        return unlockMode === 'all' || UnlockManager.isPearlUnlocked(pearl);
    }, [pearl, unlockMode]);

    const handleClick = useCallback(() => {
        onSelectPearl(pearl.id);
    }, [onSelectPearl, pearl.id]);

    const generateTooltipText = useMemo(() => {
        // collect all metadata from the dialogue transcriptions
        let tooltip = pearl.metadata.name ?? 'Unknown';
        const metadatas = pearl.transcribers.map(transcriber => transcriber.metadata);
        const mapInfos: MapInfo[] = metadatas.filter(metadata => metadata.map && metadata.map.length > 0).map(metadata => metadata.map as any as MapInfo).flat();

        let regionCollector = new Set<string>();
        for (const mapInfo of mapInfos) {
            const checkKey = mapInfo.region + ' (' + mapInfo.room + ')';
            if (regionCollector.has(checkKey)) continue;
            regionCollector.add(checkKey);
        }

        if (regionCollector.size > 3) {
            tooltip += ' / ' + mapInfos.length + ' locations';
        } else {
            regionCollector.forEach(region => tooltip += ' / ' + region);
        }
        return tooltip;
    }, [pearl]);

    return useMemo(() => {
        if (!isUnlocked) {
            return (
                <RwIconButton onClick={handleClick} selected={isSelected}>
                    <RwIcon color={pearl.metadata.color} type="questionmark" />
                </RwIconButton>
            );
        }

        return (
            <TooltipProvider delayDuration={120}>
                <Tooltip>
                    <TooltipTrigger>
                        <RwIconButton onClick={handleClick} selected={isSelected}>
                            <RwIcon color={pearl.metadata.color} type={pearl.metadata.type} />
                            {showTranscriberCount && (
                                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                            {pearl.transcribers.length}
                        </span>
                            )}
                        </RwIconButton>
                    </TooltipTrigger>
                    <TooltipContent>{generateTooltipText}</TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }, [
        isUnlocked,
        handleClick,
        isSelected,
        pearl.metadata.color,
        pearl.metadata.type,
        showTranscriberCount,
        pearl.transcribers.length,
        generateTooltipText
    ]);
};

const arePropsEqual = (prevProps: PearlItemProps, nextProps: PearlItemProps) => {
    // the most important check: has the selection state of THIS item changed?
    const wasSelected = prevProps.pearl.id === prevProps.selectedPearl;
    const isSelected = nextProps.pearl.id === nextProps.selectedPearl;

    if (wasSelected !== isSelected) {
        // if THIS item's selection state changed, we need to re-render
        return false;
    }

    // otherwise, only re-render if these specific props change
    return (
        prevProps.unlockMode === nextProps.unlockMode &&
        prevProps.showTranscriberCount === nextProps.showTranscriberCount &&
        prevProps.pearl.metadata.color === nextProps.pearl.metadata.color &&
        prevProps.pearl.metadata.type === nextProps.pearl.metadata.type &&
        prevProps.pearl.transcribers.length === nextProps.pearl.transcribers.length
    );
};

// custom comparison function to prevent re-renders
export default React.memo(PearlItem, arePropsEqual);
