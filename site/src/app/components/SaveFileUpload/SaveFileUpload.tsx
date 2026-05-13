"use client"

import React, { useCallback, useState } from 'react';
import { RwIconButton } from '../other/RwIconButton';
import { useAppContext } from '../../context/AppContext';
import { loadWasm, parseSaveFile } from '../../utils/wasmLoader';
import { applyCollectibles, extractCollectibles } from '../../utils/saveCollectibles';
import { SaveFileInfoDialog } from './SaveFileInfoDialog';
import { count } from '../../utils/track';

type UploadState = 'idle' | 'loading-wasm' | 'reading' | 'parsing' | 'done' | 'error';

export function SaveFileUpload() {
    const { pearls, setSaveFound, saveFound, setFilters } = useAppContext();
    const [state, setState] = useState<UploadState>('idle');
    const [showDialog, setShowDialog] = useState(false);

    const hasSaveData = saveFound.size > 0;
    const isLoading = state === 'loading-wasm' || state === 'reading' || state === 'parsing';

    const loadingLabel =
        state === 'loading-wasm' ? 'Loading...' :
        state === 'reading' ? 'Reading...' : 'Parsing...';

    const processFile = useCallback(async (file: File, donate: boolean) => {
        setShowDialog(false);
        if (donate) {
            const formData = new FormData();
            formData.append('savefile', file);
            fetch('https://yanwittmann.de/projects/collection-index/api/submit_save.php', {
                method: 'POST',
                body: formData,
            }).catch(() => {});
        }
        setState('loading-wasm');
        try { await loadWasm(); } catch {
            alert('Failed to load save file parser');
            setState('error');
            return;
        }
        setState('reading');
        let xml: string;
        try {
            xml = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsText(file, 'latin1');
            });
        } catch {
            alert('Failed to read file');
            setState('error');
            return;
        }
        setState('parsing');
        try {
            const parsed = await parseSaveFile(xml);
            const collectibles = extractCollectibles(parsed);
            const { foundData } = applyCollectibles(pearls, collectibles, 'unlock');
            setSaveFound(foundData);
            setState('done');
            count('upload-save');
        } catch {
            alert('Invalid save file format');
            setState('error');
        }
    }, [pearls, setSaveFound]);

    const handleClear = useCallback(() => {
        setSaveFound(new Map());
        setFilters(prev => ({ ...prev, saveFound: false }));
        setState('idle');
    }, [setSaveFound, setFilters]);

    return (
        <>
            {showDialog && (
                <SaveFileInfoDialog
                    onFile={processFile}
                    onClose={() => setShowDialog(false)}
                />
            )}
            <RwIconButton
                square={false}
                className="w-32 leading-[1.2]"
                aria-label={hasSaveData ? 'Clear save data' : 'Upload Save'}
                onClick={() => {
                    if (isLoading) return;
                    if (hasSaveData) handleClear();
                    else setShowDialog(true);
                }}
            >
                {isLoading ? loadingLabel : hasSaveData ? 'Clear Save' : 'Sync from Save File'}
            </RwIconButton>
        </>
    );
}
