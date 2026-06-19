import { useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { paramsFromState } from '../routing/routes';
import { replaceRoute, updateCanonicalTag } from '../routing/browserRouting';

/**
 * Keeps the address bar in sync with the current selection, writing the new
 * path scheme (e.g. /modded/CC/moon/). Spoiler/unlock mode keeps the URL at the
 * dataset root, exactly as the old query-param version cleared item/transcriber.
 * Writes are debounced and use replaceState, so they never add history entries
 * or trigger reloads.
 */
export function useUrlSync() {
    const {
        pearls,
        unlockMode,
        datasetKey,
        selectedPearlData,
        selectedTranscriberName,
        sourceFileDisplay,
    } = useAppContext();

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const params = unlockMode === 'all'
            ? paramsFromState({
                datasetKey,
                pearl: selectedPearlData,
                transcriberName: selectedTranscriberName,
                source: sourceFileDisplay,
                pearls,
            })
            : paramsFromState({ datasetKey, pearl: null, transcriberName: null, source: null, pearls });

        updateCanonicalTag(params);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => replaceRoute(params), 300);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [datasetKey, selectedPearlData, selectedTranscriberName, sourceFileDisplay, unlockMode, pearls]);
}
