import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { PearlData } from '../types/types';
import { FilterState } from '../components/PearlGrid/PearlFilter';
import { useUnlockState } from '../hooks/useUnlockState';
import { getEffectiveTranscriberName } from "../utils/transcriberUtils";
import { resolveRoute } from '../routing/routes';
import { currentRouteParams, currentLegacyParams } from '../routing/browserRouting';
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
    saveFound: Map<string, Set<string>>;
    saveFoundVersion: number;
    filters: FilterState;
    datasetKey: string;
    isMobile: boolean;

    handleSelectPearl: (pearl: PearlData | null) => void;
    handleSelectTranscriber: (name: string | null) => void;
    setSourceFileDisplay: (value: string | null) => void;
    setUnlockMode: (mode: UnlockMode) => void;
    setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
    setSaveFound: (data: Map<string, Set<string>>) => void;
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
        speakers: new Set(),
        saveFound: false,
    });
    const [saveFound, setSaveFoundRaw] = useState<Map<string, Set<string>>>(new Map());
    const [saveFoundVersion, setSaveFoundVersion] = useState(0);
    const { unlockVersion } = useUnlockState();

    const setSaveFound = useCallback((data: Map<string, Set<string>>) => {
        setSaveFoundRaw(data);
        setSaveFoundVersion(v => v + 1);
    }, []);

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

        // Read the selection from the URL. Legacy ?d/item/transcriber/source links
        // are upgraded transparently: we resolve them here, and useUrlSync then
        // rewrites the address bar to the new path scheme.
        const applyFromUrl = () => {
            const params = currentLegacyParams() ?? currentRouteParams();
            const resolved = resolveRoute(params, pearls);
            if (resolved) {
                setSelectedPearlId(resolved.pearl.id);
                setSelectedTranscriberName(resolved.transcriberName);
                setSourceFileDisplay(resolved.source);
            } else {
                setSelectedPearlId(null);
                setSelectedTranscriberName(null);
                setSourceFileDisplay(null);
            }
        };

        applyFromUrl();
        window.addEventListener('popstate', applyFromUrl);
        return () => window.removeEventListener('popstate', applyFromUrl);
    }, [unlockMode, pearls]);

    const value = useMemo<AppContextState>(() => ({
        pearls,
        sourceData: sourceData || [],
        selectedPearlId,
        selectedPearlData,
        selectedTranscriberName,
        sourceFileDisplay,
        unlockMode,
        unlockVersion,
        saveFound,
        saveFoundVersion,
        filters,
        datasetKey,
        isMobile,
        handleSelectPearl,
        handleSelectTranscriber,
        setSourceFileDisplay,
        setUnlockMode,
        setFilters,
        setSaveFound,
    }), [
        pearls, sourceData, selectedPearlId, selectedPearlData, selectedTranscriberName,
        sourceFileDisplay, unlockMode, unlockVersion, saveFound, saveFoundVersion,
        filters, datasetKey, isMobile, handleSelectPearl, handleSelectTranscriber,
        setSourceFileDisplay, setUnlockMode, setFilters, setSaveFound,
    ]);

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextState => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
