import { RwIcon } from "../PearlGrid/RwIcon";
import { RwIconButton } from "../other/RwIconButton";
import { PearlData } from "../../types/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@shadcn/components/ui/tooltip";
import { regionNames } from "../../utils/speakers";

interface DialogueActionBarProps {
    mapLink: string | null;
    pearl: PearlData;
}

export function DialogueActionBar({
                                      mapLink, pearl
                                  }: DialogueActionBarProps) {
    return (
        <div className="absolute top-2 left-2 flex gap-2 p-2">
            {mapLink &&
                <TooltipProvider delayDuration={120}>
                    <Tooltip>
                        <TooltipTrigger>
                            <RwIconButton
                                key={"open-rain-world-map"}
                                onClick={() => window.open(mapLink, "_blank")}
                            >
                                <RwIcon type="pin"/>
                            </RwIconButton>
                        </TooltipTrigger>
                        <TooltipContent>
                            {regionNames[pearl.metadata.region ?? ''] ?? 'Unknown'} ({pearl.metadata.region}) / {pearl.metadata.room}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>}
        </div>
    );
}