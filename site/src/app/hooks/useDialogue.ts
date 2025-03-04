import { useEffect, useState } from "react";
import { urlAccess } from "../utils/urlAccess";
import { PearlData } from "../types/types";
import { UnlockMode } from "../page";

export function useDialogue(unlockMode: UnlockMode) {
    const [selectedPearl, setSelectedPearl] = useState<string | null>(null);
    const [selectedTranscriber, setSelectedTranscriber] = useState<string | null>(null);

    const handleSelectPearl = (pearl: PearlData | null) => {
        if (pearl === null) {
            setSelectedPearl(null);
            setSelectedTranscriber(null);
            return;
        }
        setSelectedPearl(pearl.id);
        setSelectedTranscriber(pearl.transcribers[pearl.transcribers.length - 1]?.transcriber ?? null);
    };


    useEffect(() => {
        if (unlockMode === "all" && selectedPearl) {
            urlAccess.setParam("pearl", selectedPearl);
        } else {
            urlAccess.clearParam("pearl");
        }
        if (unlockMode === "all" && selectedTranscriber) {
            urlAccess.setParam("transcriber", selectedTranscriber);
        } else {
            urlAccess.clearParam("transcriber");
        }
    }, [selectedPearl, selectedTranscriber]);

    return {
        selectedPearl,
        selectedTranscriber,
        handleSelectPearl,
        handleSelectTranscriber: setSelectedTranscriber
    };
}