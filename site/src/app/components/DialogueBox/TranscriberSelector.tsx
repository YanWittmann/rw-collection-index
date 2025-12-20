import { RwIcon } from "../PearlGrid/RwIcon";
import { RwIconButton } from "../other/RwIconButton";
import { Dialogue, PearlData } from "../../types/types";
import UnlockManager from "../../utils/unlockManager";
import { darken } from "../../utils/speakers";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@shadcn/components/ui/tooltip";
import React from "react";
import { getEffectiveTranscriberName, getTranscriberIcon } from "../../utils/transcriberUtils";
import { useAppContext } from "../../context/AppContext";

interface TranscriberSelectorProps {
    pearl: PearlData
    onHover: (name: string | null) => void
    ref?: React.Ref<any>
}

export function TranscriberSelector({ pearl, onHover, ref }: TranscriberSelectorProps) {
    const { unlockMode, selectedTranscriberName, handleSelectTranscriber } = useAppContext();
    const multipleSameTranscribers = new Set(pearl.transcribers.map(t => t.transcriber)).size !== pearl.transcribers.length;

    const renderTranscriber = (transcriber: Dialogue, index: number) => {
        const { iconType, color, overwriteColor, displayTranscriberName } =
            getTranscriberIcon(transcriber, multipleSameTranscribers ? index : undefined);

        const effectiveName = getEffectiveTranscriberName(pearl.transcribers, transcriber.transcriber, index);
        const isUnlocked = unlockMode === 'all' || UnlockManager.isTranscriptionUnlocked(pearl, effectiveName);

        if (!isUnlocked) {
            if (!color) console.warn(`No color found for transcriber ${transcriber.transcriber}`);
            return (
                <RwIconButton
                    key={'select-' + pearl.id + '-' + index}
                    onClick={() => handleSelectTranscriber(effectiveName)}
                    selected={effectiveName === selectedTranscriberName}
                    aria-label={"Locked transcriber"}
                >
                    <RwIcon type={"questionmark"} color={darken(color, 20) ?? 'white'}/>
                </RwIconButton>
            );
        } else {
            return (
                <TooltipProvider delayDuration={200} key={'select-' + pearl.id + '-' + index}>
                    <Tooltip>
                        <TooltipTrigger>
                            <RwIconButton
                                onClick={() => handleSelectTranscriber(effectiveName)}
                                selected={effectiveName === selectedTranscriberName}
                                onMouseEnter={() => onHover(effectiveName)}
                                onMouseLeave={() => onHover(null)}
                                aria-label={displayTranscriberName}
                            >
                                {overwriteColor ?
                                    <RwIcon type={iconType} color={overwriteColor}/> :
                                    <RwIcon type={iconType}/>
                                }
                            </RwIconButton>
                        </TooltipTrigger>
                        <TooltipContent>
                            {displayTranscriberName.startsWith("plain=")
                                ? displayTranscriberName.replace("plain=", "")
                                : displayTranscriberName
                            }
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        }
    };

    return (
        <div className="absolute top-2 right-2 flex gap-2 p-2" ref={ref}>
            {pearl.transcribers.map((transcriber, index) => renderTranscriber(transcriber, index))}
        </div>
    );
}