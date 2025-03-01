import { useEffect, useState } from "react";
import { urlAccess } from "../utils/urlAccess";
import { PearlData } from "../types/types";

export function useDialogue() {
    const [selectedPearl, setSelectedPearl] = useState<string | null>(null);
    const [selectedTranscriber, setSelectedTranscriber] = useState<string | null>(null);

    const handleSelectPearl = (pearl: PearlData | null) => {
        if (pearl === null) {
            setSelectedPearl(null);
            setSelectedTranscriber(null);
            return;
        }
        setSelectedPearl(pearl.id);
        setSelectedTranscriber(pearl.transcribers[0]?.transcriber ?? null);
    };


    useEffect(() => {
        if (selectedPearl) {
            urlAccess.setParam("pearl", selectedPearl);
        } else {
            urlAccess.clearParam("pearl");
        }
        if (selectedTranscriber) {
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