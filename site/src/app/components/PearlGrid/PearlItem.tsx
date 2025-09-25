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
    unlockVersion: number
}

const PearlItem: React.FC<PearlItemProps> = ({
                                                 pearl,
                                                 pearlIndex,
                                                 selectedPearl,
                                                 onSelectPearl,
                                                 unlockMode,
                                                 showTranscriberCount,
                                                 unlockVersion
                                             }) => {
    const isSelected = pearl.id === selectedPearl;

    const isUnlocked = useMemo(() => {
        return unlockMode === 'all' || UnlockManager.isPearlUnlocked(pearl);
    }, [pearl, unlockMode, unlockVersion]);

    const handleClick = useCallback(() => {
        onSelectPearl(pearl.id);
    }, [onSelectPearl, pearl.id]);

    const generateTooltipText = useMemo(() => {
        // collect all metadata from the dialogue transcriptions
        let mainText = pearl.metadata.name ?? 'Unknown';
        const internalId = pearl.metadata.internalId;

        const metadatas = pearl.transcribers.map(transcriber => transcriber.metadata);
        const mapInfos: MapInfo[] = metadatas.filter(metadata => metadata.map && metadata.map.length > 0).map(metadata => metadata.map as any as MapInfo).flat();

        let regionCollector = new Set<string>();
        for (const mapInfo of mapInfos) {
            const checkKey = mapInfo.region + ' (' + mapInfo.room + ')';
            if (regionCollector.has(checkKey)) continue;
            regionCollector.add(checkKey);
        }

        if (regionCollector.size > 3) {
            mainText += ' / ' + mapInfos.length + ' locations';
        } else {
            regionCollector.forEach(region => mainText += ' / ' + region);
        }
        return { mainText, internalId };
    }, [pearl]);

    return useMemo(() => {
        if (!isUnlocked) {
            return (
                <RwIconButton onClick={handleClick} selected={isSelected} aria-label="Locked pearl">
                    <RwIcon color={pearl.metadata.color} type="questionmark"/>
                </RwIconButton>
            );
        }

        const iconType = pearl.metadata.type === 'item' ? (pearl.metadata.subType || 'pearl') : pearl.metadata.type;
        // const sourceFileCount = max(pearl.transcribers.map(p => p.metadata.sourceDialogue?.length)) || 0;

        return (
            <TooltipProvider delayDuration={120}>
                <Tooltip>
                    <TooltipTrigger>
                        <RwIconButton
                            onClick={handleClick}
                            selected={isSelected}
                            aria-label={`${pearl.metadata.name || 'Unknown pearl'} - ${pearl.transcribers.length} transcription${pearl.transcribers.length !== 1 ? 's' : ''}`}
                        >
                            <RwIcon color={pearl.metadata.color} type={iconType}/>
                            {showTranscriberCount && (
                                <span
                                    className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-6 h-4 text-xs flex items-center justify-center">
                                    {pearl.transcribers.length}{/*sourceFileCount > 0 ? `~${sourceFileCount}` : ''*/}
                                </span>
                            )}
                        </RwIconButton>
                    </TooltipTrigger>
                    <TooltipContent>
                        <div className="text-center">
                            <div>{generateTooltipText.mainText}</div>
                            {generateTooltipText.internalId && (
                                <div className="text-xs text-muted-foreground">{generateTooltipText.internalId}</div>
                            )}
                        </div>
                    </TooltipContent>
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
    const selectionChanged = wasSelected !== isSelected;

    const wasUnlocked = UnlockManager.isPearlUnlocked(prevProps.pearl);
    const isUnlocked = UnlockManager.isPearlUnlocked(nextProps.pearl);
    const unlockChanged = wasUnlocked !== isUnlocked;

    if (selectionChanged || unlockChanged) {
        return false;
    }

    // otherwise, only re-render if these specific props change
    return (
        prevProps.unlockMode === nextProps.unlockMode &&
        prevProps.showTranscriberCount === nextProps.showTranscriberCount &&
        prevProps.pearl.metadata.color === nextProps.pearl.metadata.color &&
        prevProps.pearl.metadata.type === nextProps.pearl.metadata.type &&
        prevProps.pearl.transcribers.length === nextProps.pearl.transcribers.length &&
        prevProps.unlockVersion === nextProps.unlockVersion
    );
};

// custom comparison function to prevent re-renders
export default React.memo(PearlItem, arePropsEqual);
