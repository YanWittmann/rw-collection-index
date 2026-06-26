import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@shadcn/components/ui/tooltip";
import { RwAsset } from "../other/RwAsset"
import { Tint } from "../../utils/assetUtils";
import { RwIconButton } from "../other/RwIconButton";
import UnlockManager from "../../utils/unlockManager";
import { getLockedColor, getEntryIcon } from "../../utils/transcriberUtils";
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
    renderReal: boolean
    entryUrl: string
}


const PearlItem: React.FC<PearlItemProps> = ({
    pearl, pearlIndex, showTranscriberCount, collectionVersion,
    isSelected, handleSelectPearl, isFoundInSave, unlockMode, renderReal, entryUrl
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

    if (!renderReal) {
        return (
            <RwIconButton href={entryUrl} onClick={handleClick} selected={isSelected} variant={isFoundInSave ? 'gold' : 'default'} aria-label={pearl.metadata.name || 'Unknown pearl'}/>
        );
    }

    if (!isUnlocked) {
        const lockedColor = getLockedColor(pearl);
        return (
            <RwIconButton href={entryUrl} onClick={handleClick} selected={isSelected} variant={isFoundInSave ? 'gold' : 'default'} aria-label="Locked pearl">
                <RwAsset src="questionmark" tint={Tint.mask(lockedColor)} />
            </RwIconButton>
        );
    }

    const entryIcon = getEntryIcon(pearl);

    return (
        <TooltipProvider delayDuration={120}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <RwIconButton
                        href={entryUrl}
                        onClick={handleClick}
                        selected={isSelected}
                        variant={isFoundInSave ? 'gold' : 'default'}
                        aria-label={`${pearl.metadata.name || 'Unknown pearl'} - ${pearl.transcribers.length} transcription${pearl.transcribers.length !== 1 ? 's' : ''}`}
                    >
                            <RwAsset src={entryIcon.asset.src} tint={entryIcon.asset.tint} />
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
        prevProps.unlockMode === nextProps.unlockMode &&
        prevProps.renderReal === nextProps.renderReal &&
        prevProps.entryUrl === nextProps.entryUrl
    );
};

export default React.memo(PearlItem, arePropsEqual);
