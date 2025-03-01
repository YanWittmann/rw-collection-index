import { RwIcon } from "../PearlGrid/RwIcon";
import { RwIconButton } from "../other/RwIconButton";
import { PearlData } from "../../types/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@shadcn/components/ui/tooltip";
import { regionNames } from "../../utils/speakers";

interface DialogueActionBarProps {
    mapLink: string | null,
    pearl: PearlData,
    isUnlocked: boolean,
    onSelectPearl: (pearl: PearlData | null) => void
}

export function DialogueActionBar({
                                      mapLink,
                                      pearl,
                                      isUnlocked,
                                      onSelectPearl
                                  }: DialogueActionBarProps) {
    let segments = [];

    segments.push(
        <Tooltip key={"close-dialogue-box"}>
            <TooltipTrigger>
                <RwIconButton onClick={() => onSelectPearl(null)}>
                    <RwIcon type="close"/>
                </RwIconButton>
            </TooltipTrigger>
            <TooltipContent>
                Return to the main view
            </TooltipContent>
        </Tooltip>
    );

    if (isUnlocked && mapLink) {
        segments.push(
            <Tooltip key={"open-rain-world-map"}>
                <TooltipTrigger>
                    <RwIconButton
                        onClick={() => window.open(mapLink, "_blank")}
                    >
                        <RwIcon type="pin"/>
                    </RwIconButton>
                </TooltipTrigger>
                <TooltipContent>
                    {regionNames[pearl.metadata.region ?? ''] ?? 'Unknown'} ({pearl.metadata.region})
                    / {pearl.metadata.room}
                </TooltipContent>
            </Tooltip>
        )
    }

    return (
        <div className="absolute top-2 left-2 flex gap-2 p-2">
            <TooltipProvider delayDuration={120} key={"tooltip-provider"}>
                {segments}
            </TooltipProvider>
        </div>
    );
}