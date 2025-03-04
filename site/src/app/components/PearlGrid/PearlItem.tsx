import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@shadcn/components/ui/tooltip";
import { RwIcon } from "./RwIcon";
import { RwIconButton } from "../other/RwIconButton";
import UnlockManager from "../../utils/unlockManager";
import { regionNames } from "../../utils/speakers";
import { PearlData } from "../../types/types";
import { UnlockMode } from "../../page";
import React, { useMemo } from "react";

interface PearlItemProps {
    pearl: PearlData
    pearlIndex: number
    selectedPearl: string | null
    onSelectPearl: (id: string) => void
    unlockMode: UnlockMode
}

const PearlItem: React.FC<PearlItemProps> = ({ pearl, pearlIndex, selectedPearl, onSelectPearl, unlockMode }) => {
    const isUnlocked = unlockMode === 'all' || UnlockManager.isPearlUnlocked(pearl);

    const generateTooltipText = useMemo(() => {
        // collect all metadata from the dialogue transcriptions
        let tooltip = pearl.metadata.name ?? 'Unknown';
        const metadatas = pearl.transcribers.map(transcriber => transcriber.metadata);
        let knownRegions = new Set<string>();
        for (const metadata of metadatas) {
            if (metadata.region && metadata.room) {
                const checkKey = metadata.region + '_' + metadata.room;
                if (knownRegions.has(checkKey)) continue;
                knownRegions.add(checkKey);
                tooltip += ' / ' + regionNames[metadata.region] + ' (' + metadata.region + ')';
            }
        }
        return tooltip;
    }, [pearl]);

    if (!isUnlocked) {
        return <RwIconButton
            key={'select-' + pearl.id + '-' + pearlIndex}
            onClick={() => onSelectPearl(pearl.id)}
            selected={selectedPearl === pearl.id}
        >
            <RwIcon color={pearl.metadata.color} type={"questionmark"}/>
        </RwIconButton>
    }

    return (
        <TooltipProvider
            key={'tooltip-provider-' + pearl.id + '-' + pearlIndex}
            delayDuration={120}>
            <Tooltip>
                <TooltipTrigger>
                    <RwIconButton
                        key={'select-' + pearl.id + '-' + pearlIndex}
                        onClick={() => onSelectPearl(pearl.id)}
                        selected={selectedPearl === pearl.id}
                    >
                        <RwIcon color={pearl.metadata.color} type={pearl.metadata.type}/>
                    </RwIconButton>
                </TooltipTrigger>
                <TooltipContent>
                    {generateTooltipText}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

export default React.memo(PearlItem);