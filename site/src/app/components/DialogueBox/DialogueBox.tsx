import { TranscriberSelector } from "./TranscriberSelector";
import { DialogueContent } from "./DialogueContent";
import { Dialogue, PearlData } from "../../types/types";
import { speakerNames } from "../../utils/speakers";
import { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion"
import { DialogueActionBar } from "./DialogueActionBar";
import { WelcomeDialogueContent } from "./WelcomeDialogueContent";
import { UnlockMode } from "../../page";
import UnlockManager from "../../utils/unlockManager";
import HintSystemContent from "./HintSystemContent";

interface DialogueBoxProps {
    pearl: PearlData | null
    selectedTranscriber: string | null
    onSelectTranscriber: (name: string | null) => void
    setUnlockMode: (mode: UnlockMode) => void
    unlockMode: UnlockMode
    triggerRender: () => void
    hintProgress: number
    setHintProgress: (value: (((prevState: number) => number) | number)) => void
    onSelectPearl: (pearl: PearlData | null) => void
}

export function generateMapLinkPearl(pearl: PearlData) {
    // https://rain-world-map.github.io/map.html?slugcat=white&region=SU&room=SU_B05
    const region = pearl.metadata.region;
    const room = pearl.metadata.room;
    const slugcat = pearl.metadata.mapSlugcat;
    if (!region || !room || !slugcat) {
        return null;
    }
    return `https://rain-world-map.github.io/map.html?slugcat=${slugcat}&region=${region}&room=${region}_${room}`;
}

export function generateMapLinkTranscriber(transcriberDialogue: Dialogue) {
    // https://rain-world-map.github.io/map.html?slugcat=white&region=SU&room=SU_B05
    const region = transcriberDialogue.metadata.region;
    const room = transcriberDialogue.metadata.room;
    const slugcat = transcriberDialogue.metadata.mapSlugcat;
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
                                unlockMode,
                                triggerRender,
                                hintProgress,
                                setHintProgress,
                                onSelectPearl
                            }: DialogueBoxProps) {
    const [hoveredTranscriber, setHoveredTranscriber] = useState<string | null>(null)
    const [lastTranscriberName, setLastTranscriberName] = useState<string | null>(null)

    const findTranscriberIndex = (transcriberName: string) => {
        if (!pearl) {
            return null;
        }
        return pearl.transcribers.findIndex(transcriber => transcriber.transcriber === transcriberName);
    }

    // set up the subtitle with the transcriber's name
    if (hoveredTranscriber !== null && pearl) {
        const transcriberIndex = findTranscriberIndex(hoveredTranscriber);
        if (transcriberIndex !== null && transcriberIndex !== -1) {
            let transcriberName = speakerNames[pearl.transcribers[transcriberIndex].transcriber];
            if (!transcriberName) {
                console.error("Unable to find transcriber name", pearl.transcribers[transcriberIndex].transcriber);
                transcriberName = "Unknown";
            }

            // extract parentheses from end of the name
            const parenthesisMatch = transcriberName.match(/(.*) \((.*)\)/);
            let parenthesis = "";
            if (parenthesisMatch) {
                transcriberName = parenthesisMatch[1];
                parenthesis = ` (${parenthesisMatch[2]})`;
            }

            // remove "s" from the end of the name
            if (transcriberName[transcriberName.length - 1] === 's') {
                transcriberName = transcriberName.replace(/s$/, "");
            }

            transcriberName += "'s Transcription" + parenthesis;

            if (transcriberName !== lastTranscriberName) {
                setLastTranscriberName(transcriberName);
            }
        }
    }

    const unlockTranscription = useCallback(() => {
        if (pearl) {
            UnlockManager.unlockPearl(pearl);
            if (selectedTranscriber) UnlockManager.unlockTranscription(pearl, selectedTranscriber);
            triggerRender();
        }
    }, [pearl, selectedTranscriber, triggerRender]);

    const pearlActiveContent = useMemo(() => {
        if (!pearl) {
            return null;
        }
        const selectedTranscriberIndex = findTranscriberIndex(selectedTranscriber ?? "");
        if (selectedTranscriberIndex === null || selectedTranscriberIndex === -1) {
            console.error("Unable to find transcriber index", selectedTranscriberIndex, selectedTranscriber, pearl)
            return null;
        }

        const isUnlocked = unlockMode === 'all' || UnlockManager.isTranscriptionUnlocked(pearl, pearl.transcribers[selectedTranscriberIndex].transcriber);

        return <>
            <DialogueActionBar
                isUnlocked={isUnlocked}
                pearl={pearl}
                transcriberData={pearl.transcribers[selectedTranscriberIndex]}
                onSelectPearl={onSelectPearl}
            />
            <TranscriberSelector
                pearl={pearl}
                unlockMode={unlockMode}
                selectedName={selectedTranscriber}
                onSelect={(transcriber) => {
                    onSelectTranscriber(transcriber);
                    setHintProgress(0);
                }}
                onHover={setHoveredTranscriber}
            />
            <div className="overflow-y-auto max-h-[80vh] no-scrollbar">
                {isUnlocked ? <>
                    <div className="text-center text-white text-lg mb-14 pb-0 mt-7">
                        {pearl.metadata.name}
                    </div>
                    <DialogueContent
                        lines={pearl.transcribers[selectedTranscriberIndex].lines}
                    />
                </> : <HintSystemContent
                    pearl={pearl}
                    transcriberData={pearl.transcribers[selectedTranscriberIndex]}
                    selectedTranscriber={selectedTranscriber}
                    unlockTranscription={unlockTranscription}
                    hintProgress={hintProgress}
                    setHintProgress={setHintProgress}
                />}
            </div>
        </>
    }, [pearl, selectedTranscriber, onSelectTranscriber, unlockMode, unlockTranscription, hintProgress, setHintProgress]);

    const toggleUnlockModeCallback = useCallback(() => {
        setUnlockMode(unlockMode === "all" ? "unlock" : "all");
    }, [pearl, onSelectTranscriber, unlockMode, setUnlockMode]);

    return (
        <div className="flex-1 relative">
            <div
                className="bg-black border-2 border-white/80 rounded-xl pl-12 pr-12 lg:pl-24 lg:pr-24 text-white max-h-[80vh] min-h-[80vh] text-sm relative shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                {pearl ? pearlActiveContent :
                    <WelcomeDialogueContent
                        toggleUnlockModeCallback={toggleUnlockModeCallback}
                        unlockMode={unlockMode}
                        triggerRender={triggerRender}
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
            {pearl === null ? <div className="absolute bottom-[1rem] left-0 right-0 text-center text-white text-sm">
                Code on <a href="" target="_blank" className="underline">GitHub</a> | Created by Yan Wittmann | <a
                href="https://store.steampowered.com/app/312520/Rain_World" target="_blank" className="underline">Rain
                World</a> is property of <a href="https://twitter.com/VideocultMedia" target="_blank"
                                            className="underline">Videocult</a>
            </div> : null}
        </div>
    )
}