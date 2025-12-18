"use client"

import React, { useEffect, useMemo, useState } from 'react';
import VANILLA_PEARLS from '../generated/parsed-dialogues.json';
import MODDED_PEARLS from '../generated/parsed-dialogues-modded.json';
import { PearlData } from "./types/types";
import PearlGrid from './components/PearlGrid/PearlGrid';
import { DialogueBox } from './components/DialogueBox/DialogueBox';
import { motion } from "framer-motion"
import { useIsMobile } from './hooks/useIsMobile';
import { orderPearls, PEARL_ORDER_CONFIGS } from './utils/pearlOrder';
import { LoadingSpinner } from './components/LoadingSpinner';
import { AppProvider, useAppContext } from './context/AppContext';
import { useUrlSync } from './hooks/useUrlSync';
import { urlAccess } from './utils/urlAccess';
import { cn } from '@shadcn/lib/utils';

const ALL_DATASETS: Record<string, PearlData[]> = {
    vanilla: VANILLA_PEARLS as PearlData[],
    modded: MODDED_PEARLS as PearlData[],
};

const Content: React.FC<{ orderer: (pearls: PearlData[]) => any }> = ({ orderer }) => {
    const isMobile = useIsMobile();
    const { selectedPearlId } = useAppContext();
    useUrlSync();

    const pearlGridComponent = <PearlGrid order={orderer}/>;
    const dialogueBoxComponent = <DialogueBox/>;

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
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-row gap-5 h-full w-full"
        >
            {pearlGridComponent}
            {dialogueBoxComponent}
        </motion.div>
    );
};


export default function DialogueInterface() {
    const isMobile = useIsMobile();
    const [datasetKey, setDatasetKey] = useState('vanilla');

    useEffect(() => {
        const urlDataset = urlAccess.getParam('d');
        if (urlDataset && ALL_DATASETS[urlDataset]) {
            setDatasetKey(urlDataset);
        }
    }, []);

    const activePearls = ALL_DATASETS[datasetKey];

    const configuredOrderPearls = useMemo(() => {
        const activeOrderConfig = PEARL_ORDER_CONFIGS[datasetKey] || PEARL_ORDER_CONFIGS['vanilla'];
        return (pearls: PearlData[]) => orderPearls(pearls, activeOrderConfig);
    }, [datasetKey]);

    if (!activePearls) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-[#101010]">
                <LoadingSpinner/>
            </div>
        );
    }

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
                <AppProvider pearls={activePearls} datasetKey={datasetKey} isMobile={isMobile}>
                    <Content orderer={configuredOrderPearls}/>
                </AppProvider>
            </div>
        </div>
    );
}
