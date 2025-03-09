import { RwIcon } from "../PearlGrid/RwIcon";
import { RwIconButton } from "../other/RwIconButton";
import { Dialogue, PearlData } from "../../types/types";
import { UnlockMode } from "../../page";
import UnlockManager from "../../utils/unlockManager";
import { darken, transcriberIcons, transcribersColors } from "../../utils/speakers";

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
            return <RwIconButton
                key={'select-' + pearl.id + '-' + index}
                onClick={() => onSelect(effectiveTranscriberName)}
                selected={effectiveTranscriberName === selectedName}
            >
                <RwIcon type={"questionmark"} color={darken(color, 20) ?? 'white'}/>
            </RwIconButton>;
        } else {
            return (
                <RwIconButton
                    key={'select-' + pearl.id + '-' + index}
                    onClick={() => onSelect(effectiveTranscriberName)}
                    selected={effectiveTranscriberName === selectedName}
                    onMouseEnter={() => onHover(displayTranscriberName)}
                    onMouseLeave={() => onHover(null)}
                >
                    {overwriteColor ?
                        <RwIcon type={(overwriteIcon ?? transcriber.transcriber)}
                                color={overwriteColor}/> :
                        <RwIcon type={(overwriteIcon ?? transcriber.transcriber)}/>
                    }
                </RwIconButton>
            );
        }
    }

    return (
        <div className="absolute top-2 right-2 flex gap-2 p-2">
            {pearl.transcribers.map((transcriber, index) => renderTranscriber(transcriber, index))}
        </div>
    );
}