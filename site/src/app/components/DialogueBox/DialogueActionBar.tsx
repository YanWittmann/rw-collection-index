import { RwIcon } from "../PearlGrid/RwIcon";
import { RwIconButton } from "../other/RwIconButton";
import { Dialogue, PearlData } from "../../types/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@shadcn/components/ui/tooltip";
import { regionNames } from "../../utils/speakers";
import { generateMapLinkTranscriber } from "./DialogueBox";

interface DialogueActionBarProps {
    pearl: PearlData
    transcriberData: Dialogue
    isUnlocked: boolean
    onSelectPearl: (pearl: PearlData | null) => void
}

export function DialogueActionBar({
                                      pearl,
                                      transcriberData,
                                      isUnlocked,
                                      onSelectPearl
                                  }: DialogueActionBarProps) {
    let segments = [];

    segments.push(
        <Tooltip key={"close-dialogue-box"}>
            <TooltipTrigger>
                <RwIconButton onClick={() => onSelectPearl(null)} padding="p-[.6rem]">
                    <RwIcon type="close"/>
                </RwIconButton>
            </TooltipTrigger>
            <TooltipContent>
                Return to the main view
            </TooltipContent>
        </Tooltip>
    );

    const mapLink = generateMapLinkTranscriber(transcriberData);

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
                    {regionNames[transcriberData.metadata.region ?? ''] ?? 'Unknown'} ({transcriberData.metadata.region})
                    / {transcriberData.metadata.room}
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