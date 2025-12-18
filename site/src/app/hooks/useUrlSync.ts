import { useEffect } from 'react';
import { urlAccess } from '../utils/urlAccess';
import { useAppContext } from '../context/AppContext';
import { findTranscriberIndex } from '../utils/transcriberUtils';

function pearlIdToUrlId(id: string, transcriberName: string | null, pearls: any[]) {
    const pearl = pearls.find(p => p.id === id);
    if (!pearl) return id;

    if (transcriberName) {
        const index = findTranscriberIndex(pearl, transcriberName);
        if (index !== -1) {
            const transcriberInternalId = pearl.transcribers[index]?.metadata?.internalId;
            if (transcriberInternalId) return transcriberInternalId;
        }
    }
    return pearl.metadata.internalId || id;
}

export function useUrlSync() {
    const {
        pearls,
        unlockMode,
        selectedPearlId,
        selectedTranscriberName,
        sourceFileDisplay
    } = useAppContext();

    useEffect(() => {
        if (unlockMode === "all") {
            if (selectedPearlId) {
                urlAccess.setParam("item", pearlIdToUrlId(selectedPearlId, selectedTranscriberName, pearls));
            } else {
                urlAccess.clearParam("item");
            }
            if (selectedTranscriberName) {
                urlAccess.setParam("transcriber", selectedTranscriberName);
            } else {
                urlAccess.clearParam("transcriber");
            }
            if (sourceFileDisplay) {
                urlAccess.setParam("source", sourceFileDisplay);
            } else {
                urlAccess.clearParam("source");
            }
        } else {
            urlAccess.clearParam("item");
            urlAccess.clearParam("transcriber");
            urlAccess.clearParam("source");
        }
        // Legacy param cleanup
        if (urlAccess.getParam("pearl")) {
            urlAccess.clearParam("pearl");
        }
    }, [selectedPearlId, selectedTranscriberName, sourceFileDisplay, unlockMode, pearls]);
}