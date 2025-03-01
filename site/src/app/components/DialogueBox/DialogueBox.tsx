import { TranscriberSelector } from "./TranscriberSelector";
import { DialogueContent } from "./DialogueContent";
import { PearlData } from "../../types/types";
import { speakerNames } from "../../utils/speakers";
import { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion"
import { DialogueActionBar } from "./DialogueActionBar";
import { WelcomeDialogueContent } from "./WelcomeDialogueContent";
import { UnlockMode } from "../../page";

interface DialogueBoxProps {
    pearl: PearlData | null;
    selectedTranscriber: number;
    onSelectTranscriber: (index: number) => void;
    setUnlockMode: (mode: UnlockMode) => void;
    unlockMode: UnlockMode;
}

function generateMapLink(pearl: PearlData) {
    // https://rain-world-map.github.io/map.html?slugcat=white&region=SU&room=SU_B05
    const region = pearl.metadata.region;
    const room = pearl.metadata.room;
    const slugcat = pearl.metadata.mapSlugcat;
    if (!region || !room || !slugcat) {
        return null;
    }
    return `https://rain-world-map.github.io/map.html?slugcat=${slugcat}&region=${region}&room=${region}_${room}`;
}

export function DialogueBox({
                                pearl,
                                selectedTranscriber,
                                onSelectTranscriber,
                                setUnlockMode,
                                unlockMode
                            }: DialogueBoxProps) {
    const [hoveredTranscriber, setHoveredTranscriber] = useState<number | null>(null)
    const [lastTranscriberName, setLastTranscriberName] = useState<string | null>(null)

    if (hoveredTranscriber !== null && pearl) {
        const transcriberName = speakerNames[pearl.transcribers[hoveredTranscriber].transcriber];
        if (transcriberName !== lastTranscriberName) {
            setLastTranscriberName(transcriberName);
        }
    }

    const pearlActiveContent = useMemo(() => {
        if (!pearl) {
            return null;
        }
        return <>
            <DialogueActionBar
                pearl={pearl}
                mapLink={generateMapLink(pearl)}
            />
            <TranscriberSelector
                transcribers={pearl.transcribers}
                selectedIndex={selectedTranscriber}
                onSelect={onSelectTranscriber}
                onHover={setHoveredTranscriber}
            />
            <div className="overflow-y-auto max-h-[80vh] no-scrollbar">
                <DialogueContent
                    lines={pearl.transcribers[selectedTranscriber].lines}
                />
            </div>
        </>
    }, [pearl, selectedTranscriber, onSelectTranscriber]);

    const toggleUnlockModeCallback = useCallback(() => {
        setUnlockMode(unlockMode === "all" ? "unlock" : "all");
    }, [pearl, onSelectTranscriber, unlockMode, setUnlockMode]);

    return (
        <div className="flex-1 relative">
            <div
                className="bg-black border-2 border-white/80 rounded-xl pl-8 pr-8 text-white max-h-[80vh] min-h-[80vh] text-sm relative shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                {pearl ? pearlActiveContent :
                    <WelcomeDialogueContent
                        toggleUnlockModeCallback={toggleUnlockModeCallback}
                        unlockMode={unlockMode}
                    />}
            </div>
            <motion.div
                key={lastTranscriberName}
                initial={{ opacity: 0 }}
                animate={{
                    opacity: hoveredTranscriber !== null ? [0.6, 0.95] : [0],
                    transition: {
                        ease: "easeInOut",
                        duration: 0.7,
                        repeat: hoveredTranscriber !== null ? Number.POSITIVE_INFINITY : 0,
                        repeatType: "reverse"
                    },
                }}
                className="absolute bottom-[-2rem] left-0 right-0 text-center text-white drop-shadow-md"
            >
                {lastTranscriberName}
            </motion.div>
        </div>
    )
}