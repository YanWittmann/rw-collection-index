import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@shadcn/components/ui/tooltip";
import { RwIcon } from "./RwIcon";
import { RwIconButton } from "../other/RwIconButton";
import UnlockManager from "../../utils/unlockManager";
import { MapInfo, PearlData } from "../../types/types";
import { UnlockMode } from "../../page";
import React, { useMemo } from "react";

interface PearlItemProps {
    pearl: PearlData
    pearlIndex: number
    selectedPearl: string | null
    onSelectPearl: (id: string) => void
    unlockMode: UnlockMode
    showTranscriberCount: boolean
}

const PearlItem: React.FC<PearlItemProps> = ({ pearl, pearlIndex, selectedPearl, onSelectPearl, unlockMode, showTranscriberCount }) => {
    const isUnlocked = unlockMode === 'all' || UnlockManager.isPearlUnlocked(pearl);

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
                        {showTranscriberCount && <span
                            className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                            {pearl.transcribers.length}
                        </span>}
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