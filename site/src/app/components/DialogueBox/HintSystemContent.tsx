import { Dialogue, Hint, PearlData } from "../../types/types";
import { RwIconButton } from "../other/RwIconButton";
import { regionNames } from "../../utils/speakers";
import { generateMapLinkPearl, generateMapLinkTranscriber } from "./DialogueBox";


interface HintSystemContentProps {
    pearl: PearlData,
    selectedTranscriber: string | null,
    unlockTranscription: () => void,
    hintProgress: number,
    setHintProgress: (value: (((prevState: number) => number) | number)) => void,
    transcriberData: Dialogue
}

export default function HintSystemContent({
                                              pearl,
                                              selectedTranscriber,
                                              unlockTranscription,
                                              hintProgress,
                                              setHintProgress,
                                              transcriberData
                                          }: HintSystemContentProps) {
    const effectiveHints: Hint[] = [];
    if (pearl.metadata.region) {
        effectiveHints.push({
            name: "Region",
            lines: ["Found in " + (regionNames[transcriberData.metadata.region ?? ''] ?? 'Unknown') + " (" + transcriberData.metadata.region + ")"]
        });
    }
    effectiveHints.push(...pearl.hints);
    const mapLink = generateMapLinkTranscriber(transcriberData);
    if (mapLink) {
        effectiveHints.push({
            name: "Map link",
            lines: [mapLink ?? "No map link available"]
        });
    }

    const renderHintLine = (line: string) => {
        if (line.startsWith("http")) {
            return (
                <a href={line} target="_blank" rel="noreferrer" className="text-blue-500 underline">
                    {line}
                </a>
            );
        } else {
            return line;
        }
    }

    const renderHints = () => {
        const effectiveIndex = Math.max(Math.min(hintProgress, effectiveHints.length), 0);
        if (effectiveIndex === 0) {
            return <div></div>;
        }

        return (
            <div className="text-center">
                <div className="text-lg font-bold mb-2">
                    {effectiveHints[effectiveIndex - 1].name}
                </div>
                {effectiveHints[effectiveIndex - 1].lines.map((line, index) => (
                    <div key={index} className="text-lg">
                        {renderHintLine(line)}
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="text-center mt-20 pb-6">
            <div className="relative mb-5 text-xl">
                <img src="/img/lock.png" alt="Lock" className="w-6 h-6 inline"/> Transcription not yet found
            </div>
            <div className="relative flex flex-col items-center justify-center h-full space-y-3">
                <div className="flex flex-row space-x-3 mb-8">
                    <RwIconButton square={false} onClick={unlockTranscription}>
                        Unlock Transcription
                    </RwIconButton>
                    <RwIconButton square={false} onClick={() => {
                        if (hintProgress === effectiveHints.length) return;
                        setHintProgress(hintProgress + 1);
                    }}>
                        {hintProgress === effectiveHints.length ? "No more hints available" : "Next Hint (" + effectiveHints[hintProgress].name + ")"}
                    </RwIconButton>
                </div>
                {renderHints()}
            </div>
        </div>
    );
}