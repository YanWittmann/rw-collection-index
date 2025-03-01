import { PearlData } from "../../types/types";
import { RwIconButton } from "../other/RwIconButton";
import { useState } from "react";
import { regionNames } from "../../utils/speakers";


interface HintSystemContentProps {
    pearl: PearlData,
    selectedTranscriber: number,
    unlockTranscription: () => void,
    hintProgress: number,
    setHintProgress: (value: (((prevState: number) => number) | number)) => void
}

export default function HintSystemContent({
                                              pearl,
                                              selectedTranscriber,
                                              unlockTranscription,
                                              hintProgress,
                                              setHintProgress
                                          }: HintSystemContentProps) {
    const availableHints = pearl.hints.length
        + 1 // region name
    ;

    const renderHints = () => {
        const effectiveIndex = Math.max(Math.min(hintProgress, availableHints), 0);
        if (effectiveIndex === 0) {
            return <div></div>;
        }

        if (effectiveIndex === 1) {
            return (
                <div className="text-center">
                    <div className="text-lg font-bold">
                        Found in {regionNames[pearl.metadata.region ?? ''] ?? 'Unknown'} ({pearl.metadata.region})
                    </div>
                </div>
            );
        }

        return (
            <div className="text-center">
                {pearl.hints[effectiveIndex - 2].lines.map((line, index) => (
                    <div key={index} className="text-lg font-bold">
                        {line}
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
                        setHintProgress(hintProgress + 1);
                    }}>
                        {hintProgress === availableHints ? "No more hints available" : "Next Hint"}
                    </RwIconButton>
                </div>
                {renderHints()}
            </div>
        </div>
    );
}