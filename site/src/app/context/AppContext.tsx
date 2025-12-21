import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { PearlData } from '../types/types';
import { FilterState } from '../components/PearlGrid/PearlFilter';
import { useUnlockState } from '../hooks/useUnlockState';
import { getEffectiveTranscriberName } from "../utils/transcriberUtils";
import { urlAccess } from '../utils/urlAccess';
import { SourceDecrypted } from '../utils/speakers';

export type UnlockMode = "unlock" | "all";

interface AppContextState {
    pearls: PearlData[];
    sourceData: SourceDecrypted[];
    selectedPearlId: string | null;
    selectedPearlData: PearlData | null;
    selectedTranscriberName: string | null;
    sourceFileDisplay: string | null;
    unlockMode: UnlockMode;
    unlockVersion: number;
    filters: FilterState;
    datasetKey: string;
    isMobile: boolean;

    handleSelectPearl: (pearl: PearlData | null) => void;
    handleSelectTranscriber: (name: string | null) => void;
    setSourceFileDisplay: (value: string | null) => void;
    setUnlockMode: (mode: UnlockMode) => void;
    setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

const AppContext = createContext<AppContextState | undefined>(undefined);

export const AppProvider: React.FC<{
    children: React.ReactNode;
    pearls: PearlData[];
    sourceData: SourceDecrypted[];
    datasetKey: string;
    isMobile: boolean;
}> = ({ children, pearls, sourceData, datasetKey, isMobile }) => {
    const [selectedPearlId, setSelectedPearlId] = useState<string | null>(null);
    const [selectedTranscriberName, setSelectedTranscriberName] = useState<string | null>(null);
    const [sourceFileDisplay, setSourceFileDisplay] = useState<string | null>(null);
    const [unlockMode, setUnlockMode] = useState<UnlockMode>('all');
    const [filters, setFilters] = useState<FilterState>({
        text: undefined,
        tags: new Set(),
        types: new Set(),
        regions: new Set(),
        speakers: new Set()
    });
    const { unlockVersion } = useUnlockState();

    const selectedPearlData = useMemo(() => {
        if (!selectedPearlId) return null;
        return pearls.find(p => p.id === selectedPearlId) || null;
    }, [selectedPearlId, pearls]);

    const handleSelectPearl = useCallback((pearl: PearlData | null) => {
        setSourceFileDisplay(null);

        if (pearl === null) {
            setSelectedPearlId(null);
            setSelectedTranscriberName(null);
            return;
        }

        setSelectedPearlId(pearl.id);

        if (!pearl.transcribers.length) {
            setSelectedTranscriberName(null);
            return;
        }

        const lastTranscriber = pearl.transcribers[pearl.transcribers.length - 1];
        const lastIndex = pearl.transcribers.length - 1;
        const effectiveName = getEffectiveTranscriberName(pearl.transcribers, lastTranscriber.transcriber, lastIndex);
        setSelectedTranscriberName(effectiveName);
    }, []);

    const handleSelectTranscriber = useCallback((name: string | null) => {
        setSourceFileDisplay(null);
        setSelectedTranscriberName(name);
    }, []);

    useEffect(() => {
        if (unlockMode !== 'all' || !pearls.length) return;

        const findPearlByUrlId = (id: string) => {
            for (const pearl of pearls) {
                if (pearl.id === id || pearl.metadata.internalId === id) {
                    return pearl;
                }
                for (const transcriber of pearl.transcribers) {
                    if (transcriber.metadata.internalId === id) {
                        return pearl;
                    }
                }
            }
            return null;
        };

        const itemUrlId = urlAccess.getParam('item');
        if (itemUrlId) {
            const pearlToSelect = findPearlByUrlId(itemUrlId);
            if (pearlToSelect) {
                setSelectedPearlId(pearlToSelect.id);

                const transcriberToSelect = urlAccess.getActiveTranscriber(pearlToSelect.transcribers);
                setSelectedTranscriberName(transcriberToSelect);

                const sourceUrl = urlAccess.getParam('source');
                if (sourceUrl) {
                    setSourceFileDisplay(sourceUrl);
                }
            }
        }
    }, [unlockMode, pearls]);

    const value: AppContextState = {
        pearls,
        sourceData: sourceData || [],
        selectedPearlId,
        selectedPearlData,
        selectedTranscriberName,
        sourceFileDisplay,
        unlockMode,
        unlockVersion,
        filters,
        datasetKey,
        isMobile,
        handleSelectPearl,
        handleSelectTranscriber,
        setSourceFileDisplay,
        setUnlockMode,
        setFilters,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextState => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
