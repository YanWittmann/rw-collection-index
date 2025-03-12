import { TranscriberSelector } from "./TranscriberSelector";
import { DialogueContent } from "./DialogueContent";
import { Dialogue, MapInfo, PearlData } from "../../types/types";
import { resolveVariables, speakerNames } from "../../utils/speakers";
import { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion"
import { DialogueActionBar } from "./DialogueActionBar";
import { WelcomeDialogueContent } from "./WelcomeDialogueContent";
import { UnlockMode } from "../../page";
import UnlockManager from "../../utils/unlockManager";
import HintSystemContent from "./HintSystemContent";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@shadcn/components/ui/tooltip";
import { RwIcon } from "../PearlGrid/RwIcon";
import { renderDialogueLine } from "../../utils/renderDialogueLine";
import { cn } from "@shadcn/lib/utils";

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
    isMobile: boolean
}

export function generateMapLinkFromMapInfo(mapInfo: MapInfo | undefined) {
    if (!mapInfo) {
        return null;
    }
    // https://rain-world-map.github.io/map.html?slugcat=white&region=SU&room=SU_B05
    // https://rain-world-downpour-map.github.io/map.html?slugcat=white&region=SU&room=SU_B05
    const { region, room, mapSlugcat } = mapInfo;
    if (!region || !room || !mapSlugcat) {
        return null;
    }
    return `https://rain-world-downpour-map.github.io/map.html?slugcat=${mapSlugcat}&region=${region}&room=${region}_${room}`;
}

export function hasMapLocations(dialogue: Dialogue): boolean {
    return !!(dialogue.metadata.map && dialogue.metadata.map.length > 0);
}

export function getMapLocations(dialogue: Dialogue): MapInfo[] {
    if (dialogue.metadata.map && dialogue.metadata.map.length > 0) {
        return dialogue.metadata.map;
    }

    return [];
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
                                onSelectPearl,
                                isMobile
                            }: DialogueBoxProps) {
    const [hoveredTranscriber, setHoveredTranscriber] = useState<string | null>(null);
    const [lastTranscriberName, setLastTranscriberName] = useState<string | null>(null);
    const [justCopiedInternalId, setJustCopiedInternalId] = useState<boolean>(false);

    const findTranscriberIndex = (transcriberName: string) => {
        if (!pearl) {
            return null;
        }
        const isMultipleTranscribers = /.+-\d+$/.test(transcriberName);
        if (isMultipleTranscribers) {
            return parseInt(transcriberName.replace(/^.+-/, ""));
        } else {
            return pearl.transcribers.findIndex(transcriber => transcriber.transcriber === transcriberName);
        }
    }

    // set up the subtitle with the transcriber's name
    if (hoveredTranscriber !== null && pearl) {
        if (hoveredTranscriber.startsWith("plain=")) {
            const transcriberName = hoveredTranscriber.replace("plain=", "");
            if (transcriberName !== lastTranscriberName) {
                setLastTranscriberName(transcriberName);
            }

        } else {
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

        const dialogue = pearl.transcribers[selectedTranscriberIndex];
        const multipleSameTranscribers = new Set(pearl.transcribers.map(transcriber => transcriber.transcriber)).size !== pearl.transcribers.length;
        const effectiveTranscriberName = multipleSameTranscribers ? dialogue.transcriber + '-' + selectedTranscriberIndex : dialogue.transcriber;
        const isUnlocked = unlockMode === 'all' || UnlockManager.isTranscriptionUnlocked(pearl, effectiveTranscriberName);

        const internalId = dialogue.metadata.internalId || pearl.metadata.internalId;
        let internalIdElement = null;
        if (internalId) {
            internalIdElement =
                <Tooltip key={"internal-id-tooltip"}>
                    <TooltipTrigger onClick={() => {
                        navigator.clipboard.writeText(internalId);
                        setJustCopiedInternalId(true);
                        setTimeout(() => setJustCopiedInternalId(false), 1000);
                    }}>
                        <div className="font-mono text-xs text-white/70 cursor-pointer">
                            {justCopiedInternalId ? "Copied!" : internalId}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent className="text-center">
                        The above-listed name is a community-given.<br/>
                        The game references this pearl using this internal ID.<br/>
                        Click to copy the internal ID to your clipboard.
                    </TooltipContent>
                </Tooltip>
        }

        let titleElement = null;
        const name = dialogue.metadata.name || pearl.metadata.name;
        if (dialogue.metadata.info) {
            titleElement = (
                <div className={cn(
                    "text-white text-lg mb-8 pb-0 flex items-center justify-center flex-col",
                    internalId ? "mt-5" : "mt-7"
                )}>
                    <TooltipProvider delayDuration={120} key={"tooltip-provider"}>
                        <Tooltip key={"pearl-info"}>
                            <TooltipTrigger>
                                <span className={"flex items-center"}>
                                    <div className="text-selectable">{name}</div>
                                    &nbsp;
                                    (<span className={"w-3 h-3"}><RwIcon type="info"/></span>)
                                </span>
                            </TooltipTrigger>
                            <TooltipContent className="text-center">
                                <span
                                    dangerouslySetInnerHTML={{ __html: renderDialogueLine(resolveVariables(dialogue.metadata.info)) }}/>
                            </TooltipContent>
                        </Tooltip>
                        <br/>
                        {internalIdElement}
                    </TooltipProvider>
                </div>
            )
        } else {
            titleElement =
                <div className={cn(
                    "text-white text-lg mb-8 pb-0 flex items-center justify-center flex-col",
                    internalId ? "mt-5" : "mt-7"
                )}>
                    <TooltipProvider delayDuration={120} key={"tooltip-provider"}>
                        <div className="text-selectable">{name}</div>
                        {internalIdElement}
                    </TooltipProvider>
                </div>
        }

        return <>
            <DialogueActionBar
                isUnlocked={isUnlocked}
                pearl={pearl}
                transcriberData={dialogue}
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
            <div
                className={cn("overflow-y-auto no-scrollbar", isMobile ? "max-h-[calc(85vh-2px)]" : "max-h-[calc(80vh-2px)]")}>
                {isUnlocked ? <>
                    {titleElement}
                    <DialogueContent
                        lines={dialogue.lines}
                    />
                </> : <HintSystemContent
                    pearl={pearl}
                    transcriberData={dialogue}
                    selectedTranscriber={selectedTranscriber}
                    unlockTranscription={unlockTranscription}
                    hintProgress={hintProgress}
                    setHintProgress={setHintProgress}
                />}
            </div>
        </>
    }, [pearl, selectedTranscriber, onSelectTranscriber, unlockMode, unlockTranscription, hintProgress, setHintProgress, justCopiedInternalId]);

    const toggleUnlockModeCallback = useCallback(() => {
        setUnlockMode(unlockMode === "all" ? "unlock" : "all");
    }, [pearl, onSelectTranscriber, unlockMode, setUnlockMode]);

    return (
        <div className="flex-1 relative">
            <div
                className={cn(
                    "bg-black border-2 border-white/80 rounded-xl px-12 lg:pl-24 lg:pr-24 text-white text-sm relative shadow-[0_0_10px_rgba(255,255,255,0.1)]",
                    isMobile ? "max-h-[85vh] min-h-[85vh]" : "max-h-[80vh] min-h-[80vh]"
                )}>
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
            {pearl === null ?
                <div className="absolute bottom-[1rem] left-0 right-0 px-2 text-center text-white text-sm">
                    Code on <a href="https://github.com/YanWittmann/rw-collection-index" target="_blank"
                               className="underline">GitHub</a> | Created by Yan Wittmann | <a
                    href="https://store.steampowered.com/app/312520/Rain_World" target="_blank" className="underline">Rain
                    World</a> is property of <a href="https://twitter.com/VideocultMedia" target="_blank"
                                                className="underline">Videocult</a> | <a
                    href="https://github.com/YanWittmann/rw-collection-index/blob/main/privacy.md" target="_blank"
                    className="underline">Privacy Policy</a>
                </div> : null}
        </div>
    )
}