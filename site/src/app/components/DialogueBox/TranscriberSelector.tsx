import { RwIcon, RwIconType } from "../PearlGrid/RwIcon";
import { RwIconButton } from "../other/RwIconButton";
import { Dialogue, PearlData } from "../../types/types";
import { UnlockMode } from "../../page";
import UnlockManager from "../../utils/unlockManager";
import { darken, transcribersColors } from "../../utils/speakers";

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

    const renderTranscriber = (transcriber: Dialogue, index: number) => {
        const isUnlocked = unlockMode === 'all' || UnlockManager.isTranscriptionUnlocked(pearl, transcriber.transcriber);

        let color = '';
        let overwriteIcon = undefined;
        let overwriteColor = undefined;
        if (transcriber.transcriber.includes("broadcast")) {
            color = transcribersColors[transcriber.transcriber] ?? transcriber.metadata.color ?? '#ffffff';
            overwriteColor = color;
            overwriteIcon = "broadcast";
        } else {
            color = transcribersColors[transcriber.transcriber];
        }

        if (!isUnlocked) {
            return <RwIconButton
                key={'select-' + pearl.id + '-' + index}
                onClick={() => onSelect(transcriber.transcriber)}
                selected={transcriber.transcriber === selectedName}
            >
                <RwIcon type={"questionmark"} color={darken(color, 20) ?? 'white'}/>
            </RwIconButton>;
        } else {
            return (
                <RwIconButton
                    key={'select-' + pearl.id + '-' + index}
                    onClick={() => onSelect(transcriber.transcriber)}
                    selected={transcriber.transcriber === selectedName}
                    onMouseEnter={() => onHover(transcriber.transcriber)}
                    onMouseLeave={() => onHover(null)}
                >
                    {overwriteColor ?
                        <RwIcon type={(overwriteIcon ?? transcriber.transcriber) as RwIconType}
                                color={overwriteColor}/> :
                        <RwIcon type={(overwriteIcon ?? transcriber.transcriber) as RwIconType}/>
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