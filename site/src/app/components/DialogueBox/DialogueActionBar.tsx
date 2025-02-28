import { RwIcon } from "../PearlGrid/RwIcon";
import { RwIconButton } from "../other/RwIconButton";
import { PearlData } from "../../types/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@shadcn/components/ui/tooltip";

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
                            Show on the interactive Rain World map
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>}
        </div>
    );
}