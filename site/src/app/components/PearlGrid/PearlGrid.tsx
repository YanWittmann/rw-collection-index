import { RwIcon } from "./RwIcon";
import { RwIconButton } from "../other/RwIconButton";
import { PearlData } from "../../types/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@shadcn/components/ui/tooltip";
import { regionNames } from "../../utils/speakers";
import { UnlockMode } from "../../page";
import UnlockManager from "../../utils/unlockManager";

interface PearlGridProps {
    pearls: PearlData[],
    selectedPearl: number | null,
    onSelectPearl: (index: number) => void,
    order: (pearls: PearlData[]) => { name: string, items: PearlData[] }[],
    unlockMode: UnlockMode,
    unlockVersion: number
}

export function PearlGrid({ pearls, selectedPearl, onSelectPearl, order, unlockMode, unlockVersion }: PearlGridProps) {
    const orderedPearls = order(pearls);

    const renderPearl = (pearl: PearlData, pearlIndex: number) => {
        const isUnlocked = unlockMode === 'all' || UnlockManager.isPearlUnlocked(pearl);
        if (!isUnlocked) {
            return <RwIconButton
                key={'select-' + pearl.id + '-' + pearlIndex}
                onClick={() => onSelectPearl(pearls.findIndex((p) => p.id === pearl.id))}
                selected={selectedPearl === pearls.findIndex((p) => p.id === pearl.id)}
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
                            onClick={() => onSelectPearl(pearls.findIndex((p) => p.id === pearl.id))}
                            selected={selectedPearl === pearls.findIndex((p) => p.id === pearl.id)}
                        >
                            <RwIcon color={pearl.metadata.color} type={pearl.metadata.type}/>
                        </RwIconButton>
                    </TooltipTrigger>
                    <TooltipContent>
                        {pearl.metadata.name ?? 'Unknown'} / {regionNames[pearl.metadata.region ?? ''] ?? 'Unknown'} ({pearl.metadata.region ?? '??'})
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    }

    return (
        <div className="no-scrollbar w-full md:w-auto max-h-[80vh] overflow-y-auto p-2 box-border">
            {orderedPearls
                .filter(chapter => chapter.items.length > 0)
                .map((chapter, chapterIndex) => (
                    <div key={chapterIndex} className="mb-4 last:mb-0">
                        {chapter.name && <h3 className="text-white text-sm mb-2">{chapter.name}</h3>}
                        <div className="grid grid-cols-5 gap-2 max-w-[600px] mx-auto">
                            {chapter.items.map(
                                (pearl, pearlIndex) =>
                                    pearl.id && renderPearl(pearl, pearlIndex)
                            )}
                        </div>
                    </div>
                ))}
        </div>
    )
}