import { useState } from "react";

export function useDialogue() {
    const [selectedPearl, setSelectedPearl] = useState<string | null>(null);
    const [selectedTranscriber, setSelectedTranscriber] = useState(0);

    const handleSelectPearl = (id: string | null) => {
        setSelectedPearl(id);
        setSelectedTranscriber(0);
    };

    return {
        selectedPearl,
        selectedTranscriber,
        handleSelectPearl,
        handleSelectTranscriber: setSelectedTranscriber
    };
}