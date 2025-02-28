import { useState } from "react";

export function useDialogue() {
    const [selectedPearl, setSelectedPearl] = useState<number | null>(null);
    const [selectedTranscriber, setSelectedTranscriber] = useState(0);

    const handleSelectPearl = (index: number) => {
        setSelectedPearl(index);
        setSelectedTranscriber(0);
    };

    return {
        selectedPearl,
        selectedTranscriber,
        handleSelectPearl,
        handleSelectTranscriber: setSelectedTranscriber
    };
}