import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@shadcn/components/ui/tooltip";
import { RwIcon } from "./RwIcon";
import { RwIconButton } from "../other/RwIconButton";
import UnlockManager from "../../utils/unlockManager";
import { PearlData } from "../../types/types";
import React, { useCallback, useMemo } from "react";
import { UnlockMode } from "../../context/AppContext";

interface PearlItemProps {
    pearl: PearlData
    pearlIndex: number
    showTranscriberCount: boolean
    collectionVersion: number
    isSelected: boolean
    handleSelectPearl: (pearl: PearlData) => void
    isFoundInSave: boolean
    unlockMode: UnlockMode
}

const PearlItem: React.FC<PearlItemProps> = ({
    pearl, pearlIndex, showTranscriberCount, collectionVersion,
    isSelected, handleSelectPearl, isFoundInSave, unlockMode
}) => {
    const isUnlocked = useMemo(() => {
        return unlockMode === 'all' || UnlockManager.isPearlUnlocked(pearl);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pearl, unlockMode, collectionVersion]);

    const handleClick = useCallback(() => {
        handleSelectPearl(pearl);
    }, [handleSelectPearl, pearl]);

    const tooltipText = useMemo(() => {
        let mainText = pearl.metadata.name ?? 'Unknown';
        const internalId = pearl.metadata.internalId;
        const allMapInfos = pearl.transcribers.flatMap(t => t.metadata.map || []);

        const uniqueLocations = new Set<string>();
        allMapInfos.forEach(info => uniqueLocations.add(`${info.region} (${info.room})`));

        if (uniqueLocations.size > 3) {
            mainText += ` / ${allMapInfos.length} locations`;
        } else {
            uniqueLocations.forEach(loc => mainText += ` / ${loc}`);
        }
        return { mainText, internalId };
    }, [pearl]);

    if (!isUnlocked) {
        return (
            <RwIconButton onClick={handleClick} selected={isSelected} variant={isFoundInSave ? 'gold' : 'default'} aria-label="Locked pearl">
                <RwIcon color={pearl.metadata.color} type="questionmark"/>
            </RwIconButton>
        );
    }

    const iconType = pearl.metadata.type === 'item' ? (pearl.metadata.subType || 'pearl') : pearl.metadata.type;

    return (
        <TooltipProvider delayDuration={120}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <RwIconButton
                        onClick={handleClick}
                        selected={isSelected}
                        variant={isFoundInSave ? 'gold' : 'default'}
                        aria-label={`${pearl.metadata.name || 'Unknown pearl'} - ${pearl.transcribers.length} transcription${pearl.transcribers.length !== 1 ? 's' : ''}`}
                    >
                            <RwIcon color={pearl.metadata.color} type={iconType}/>
                            {showTranscriberCount && (
                                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-6 h-4 text-xs flex items-center justify-center">
                                    {pearl.transcribers.length}
                                </span>
                            )}
                    </RwIconButton>
                </TooltipTrigger>
                <TooltipContent>
                    <div className="text-center">
                        <div>{tooltipText.mainText}</div>
                        {tooltipText.internalId && (
                            <div className="text-xs text-muted-foreground">{tooltipText.internalId}</div>
                        )}
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

const arePropsEqual = (prevProps: PearlItemProps, nextProps: PearlItemProps) => {
    return (
        prevProps.pearl.id === nextProps.pearl.id &&
        prevProps.showTranscriberCount === nextProps.showTranscriberCount &&
        prevProps.pearl.metadata.color === nextProps.pearl.metadata.color &&
        prevProps.pearl.metadata.type === nextProps.pearl.metadata.type &&
        prevProps.pearl.transcribers.length === nextProps.pearl.transcribers.length &&
        prevProps.collectionVersion === nextProps.collectionVersion &&
        prevProps.isSelected === nextProps.isSelected &&
        prevProps.isFoundInSave === nextProps.isFoundInSave &&
        prevProps.unlockMode === nextProps.unlockMode
    );
};

export default React.memo(PearlItem, arePropsEqual);
