import { RwIcon } from "../PearlGrid/RwIcon";
import { RwIconButton } from "../other/RwIconButton";
import { Dialogue, PearlData } from "../../types/types";
import { UnlockMode } from "../../page";
import UnlockManager from "../../utils/unlockManager";
import { darken, speakerNames, transcriberIcons, transcribersColors } from "../../utils/speakers";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@shadcn/components/ui/tooltip";

interface TranscriberSelectorProps {
    pearl: PearlData
    unlockMode: UnlockMode
    selectedName: string | null
    onSelect: (name: string) => void
    onHover: (name: string | null) => void
}

export function TranscriberSelector({
                                        pearl,
                                        unlockMode,
                                        selectedName,
                                        onSelect,
                                        onHover
                                    }: TranscriberSelectorProps) {

    const multipleSameTranscribers = new Set(pearl.transcribers.map(transcriber => transcriber.transcriber)).size !== pearl.transcribers.length;

    const renderTranscriber = (transcriber: Dialogue, index: number) => {
        const effectiveTranscriberName = multipleSameTranscribers ? transcriber.transcriber + '-' + index : transcriber.transcriber;
        const isUnlocked = unlockMode === 'all' || UnlockManager.isTranscriptionUnlocked(pearl, effectiveTranscriberName);

        let color = '';
        let overwriteIcon = undefined;
        let overwriteColor = undefined;
        if (effectiveTranscriberName.includes("broadcast")) {
            color = transcribersColors[transcriber.transcriber] ?? transcriber.metadata.color ?? '#ffffff';
            overwriteColor = color;
            overwriteIcon = "broadcast";
        } else if (transcriber.metadata.type === 'item' && transcriber.metadata.subType) {
            color = transcribersColors[transcriber.transcriber];
            overwriteIcon = transcriber.metadata.subType;
        } else {
            color = transcribersColors[transcriber.transcriber];
            overwriteIcon = transcriberIcons[transcriber.transcriber];
        }

        let displayTranscriberName: string | null;
        if (transcriber.metadata.transcriberName) {
            displayTranscriberName = "plain=" + transcriber.metadata.transcriberName;
        } else {
            displayTranscriberName = effectiveTranscriberName;
        }

        if (!isUnlocked) {
            if (!color) {
                console.warn(`No color found for transcriber ${transcriber.transcriber}`);
            }
            return <RwIconButton
                key={'select-' + pearl.id + '-' + index}
                onClick={() => onSelect(effectiveTranscriberName)}
                selected={effectiveTranscriberName === selectedName}
                aria-label={displayTranscriberName}
            >
                <RwIcon type={"questionmark"} color={darken(color, 20) ?? 'white'}/>
            </RwIconButton>;
        } else {
            return (
                <TooltipProvider delayDuration={200}
                                 key={'select-' + pearl.id + '-' + index}>
                    <Tooltip>
                        <TooltipTrigger>
                            <RwIconButton
                                onClick={() => onSelect(effectiveTranscriberName)}
                                selected={effectiveTranscriberName === selectedName}
                                onMouseEnter={() => onHover(displayTranscriberName)}
                                onMouseLeave={() => onHover(null)}
                                aria-label={displayTranscriberName}
                            >
                                {overwriteColor ?
                                    <RwIcon type={(overwriteIcon ?? transcriber.transcriber)}
                                            color={overwriteColor}/> :
                                    <RwIcon type={(overwriteIcon ?? transcriber.transcriber)}/>
                                }
                            </RwIconButton>
                        </TooltipTrigger>
                        <TooltipContent>
                            {speakerNames[displayTranscriberName] ?? displayTranscriberName.replace("plain=", "")}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        }
    }

    return (
        <div className="absolute top-2 right-2 flex gap-2 p-2">
            {pearl.transcribers.map((transcriber, index) => renderTranscriber(transcriber, index))}
        </div>
    );
}