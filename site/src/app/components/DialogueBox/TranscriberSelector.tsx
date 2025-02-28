import { RwIcon, RwIconType } from "../PearlGrid/RwIcon";
import { RwIconButton } from "../other/RwIconButton";
import { PearlData } from "../../types/types";

interface TranscriberSelectorProps {
    transcribers: PearlData['transcribers'];
    selectedIndex: number;
    onSelect: (index: number) => void;
    onHover: (index: number | null) => void;
}

export function TranscriberSelector({ transcribers, selectedIndex, onSelect, onHover }: TranscriberSelectorProps) {
    return (
        <div className="absolute top-2 right-2 flex gap-2 p-2">
            {transcribers.map((transcriber, index) => (
                <RwIconButton
                    key={transcriber.transcriber}
                    onClick={() => onSelect(index)}
                    selected={selectedIndex === index}
                    onMouseEnter={() => onHover(index)}
                    onMouseLeave={() => onHover(null)}
                >
                    <RwIcon type={transcriber.transcriber as RwIconType}/>
                </RwIconButton>
            ))}
        </div>
    );
}