"use client"

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { PearlData } from "./types/types";
import { useIsMobile } from './hooks/useIsMobile';
import { orderPearls, PEARL_ORDER_CONFIGS } from './utils/pearlOrder';
import { LoadingSpinner } from './components/LoadingSpinner';
import { AppProvider, useAppContext } from './context/AppContext';
import { useUrlSync } from './hooks/useUrlSync';
import { cn } from '@shadcn/lib/utils';
import { SourceDecrypted } from './utils/speakers';

// Lazy load UI components
const PearlGrid = React.lazy(() => import('./components/PearlGrid/PearlGrid'));
const DialogueBox = React.lazy(() => import('./components/DialogueBox/DialogueBox').then(module => ({ default: module.DialogueBox })));

const Content: React.FC<{ orderer: (pearls: PearlData[]) => any }> = ({ orderer }) => {
    const isMobile = useIsMobile();
    const { selectedPearlId } = useAppContext();
    useUrlSync();

    const pearlGridComponent = (
        <Suspense fallback={<LoadingSpinner/>}>
            <PearlGrid order={orderer}/>
        </Suspense>
    );

    const dialogueBoxComponent = (
        <Suspense fallback={<LoadingSpinner/>}>
            <DialogueBox/>
        </Suspense>
    );

    if (isMobile) {
        return (
            <>
                <div className="w-full h-full" style={selectedPearlId ? { display: "none" } : {}}>
                    {pearlGridComponent}
                </div>
                {selectedPearlId && (
                    <div className="w-full h-full">
                        {dialogueBoxComponent}
                    </div>
                )}
            </>
        );
    }

    return (
        <div className="flex flex-row gap-5 h-full w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {pearlGridComponent}
            {dialogueBoxComponent}
        </div>
    );
};

export default function DialogueInterface() {
    const isMobile = useIsMobile();
    const [datasetKey, setDatasetKey] = useState<string>('vanilla');
    const [pearls, setPearls] = useState<PearlData[] | null>(null);
    const [sourceData, setSourceData] = useState<SourceDecrypted[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Data is preloaded in index.html and exposed via window.__RW_DATA__
        if (typeof window !== 'undefined' && window.__RW_DATA__) {
            const dataPromises = window.__RW_DATA__;

            // Set the key used by the preloader
            setDatasetKey(window.__RW_DATA_KEY__ || 'vanilla');

            // 1. Pearls (Critical)
            dataPromises.pearls
                .then((data: PearlData[]) => {
                    setPearls(data);
                })
                .catch((err: any) => {
                    console.error("Critical: Failed to load pearls", err);
                    setError("Failed to load application data.");
                });

            // 2. Source (Background)
            dataPromises.source
                .then((data: SourceDecrypted[]) => {
                    setSourceData(data);
                })
                .catch((err: any) => {
                    console.warn("Non-critical: Failed to load source", err);
                });
        } else {
            // Fallback if script didn't run (unlikely)
            setError("Data loader not initialized.");
        }
    }, []);

    const configuredOrderPearls = useMemo(() => {
        const activeOrderConfig = PEARL_ORDER_CONFIGS[datasetKey] || PEARL_ORDER_CONFIGS['vanilla'];
        return (pearls: PearlData[]) => orderPearls(pearls, activeOrderConfig);
    }, [datasetKey]);

    const isLoading = !pearls;

    return (
        <div
            className={cn(
                "min-h-screen w-full relative flex items-center justify-center overflow-y-hidden",
                isMobile ? "p-0" : "p-4 md:p-8"
            )}
            style={{
                backgroundImage: `url(img/Pc-main-menu.webp)`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundAttachment: "fixed",
                backgroundColor: "#101010",
            }}
        >
            <div className="absolute inset-0 backdrop-blur-sm bg-black/30"/>

            <div className={cn("relative z-10 w-full max-w-[1400px] h-full", isMobile ? "" : "h-auto")}>
                {error ? (
                    <div className="flex items-center justify-center h-full min-h-[50vh]">
                        <div className="text-center text-white p-6 bg-black/50 rounded-xl border border-white/20">
                            <h2 className="text-xl font-bold mb-2 text-red-400">Error Loading Data</h2>
                            <p>{error}</p>
                        </div>
                    </div>
                ) : isLoading ? (
                    <div className="flex items-center justify-center h-full min-h-[50vh]">
                        <LoadingSpinner/>
                    </div>
                ) : (
                    <AppProvider pearls={pearls} sourceData={sourceData} datasetKey={datasetKey} isMobile={isMobile}>
                        <Content orderer={configuredOrderPearls}/>
                    </AppProvider>
                )}
            </div>
        </div>
    );
}
