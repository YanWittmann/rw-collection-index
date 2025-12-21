import { TranscriberSelector } from "./TranscriberSelector";
import { DialogueContent } from "./DialogueContent";
import { Dialogue, DialogueLine, MapInfo } from "../../types/types";
import { findSourceDialogue, resolveVariables, speakerNames } from "../../utils/speakers";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion"
import { WelcomeDialogueContent } from "./WelcomeDialogueContent";
import UnlockManager from "../../utils/unlockManager";
import HintSystemContent from "./HintSystemContent";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@shadcn/components/ui/tooltip";
import { RwIcon } from "../PearlGrid/RwIcon";
import { renderDialogueLine } from "../../utils/renderDialogueLine";
import { cn } from "@shadcn/lib/utils";
import { DialogueActionTabs } from "./DialogueActionTabs";
import { useAppContext } from "../../context/AppContext";
import { findTranscriberIndex } from "../../utils/transcriberUtils";

const MAP_URL_PATTERNS: { [key: string]: string } = {
    "default": "https://rain-world-downpour-map.github.io/map.html",
    "alduris-mod-map": "https://alduris.github.io/mod-map/map.html",
    "watcher": "https://alduris.github.io/watcher-map/map.html",
};

const regionMaps: { [key: string]: string[] } = {
    "alduris-mod-map": [
        "SD", "GH", "FR", "MF"
    ],
}

// https://rain-world-map.github.io/map.html?slugcat=white&region=SU&room=SU_B05
// https://rain-world-downpour-map.github.io/map.html?slugcat=white&region=SU&room=SU_B05
// https://rw-watchermap.github.io/map.html?slugcat=white&region=SU&room=SU_B05
// https://alduris.github.io/watcher-map/map.html?slugcat=white&region=SU&room=SU_B05
// https://alduris.github.io/mod-map/map.html?slugcat=white&region=SD
export function generateMapLinkFromMapInfo(mapInfo: MapInfo | undefined) {
    if (!mapInfo) {
        return null;
    }
    const { region, room, mapSlugcat, impl } = mapInfo;
    if (!region || !room || !mapSlugcat) {
        return null;
    }
    if (impl === "none") {
        return null;
    }

    let baseUrl = MAP_URL_PATTERNS["default"];

    if (impl && MAP_URL_PATTERNS[impl]) {
        baseUrl = MAP_URL_PATTERNS[impl];
    } else if (mapSlugcat === 'watcher') {
        baseUrl = MAP_URL_PATTERNS["watcher"];
    } else {
        for (let mapKey in regionMaps) {
            if (regionMaps[mapKey].includes(region)) {
                baseUrl = MAP_URL_PATTERNS[mapKey];
            }
        }
    }

    return `${baseUrl}?slugcat=${mapSlugcat}&region=${region}&room=${region}_${room}`;
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

export function DialogueBox() {
    const {
        selectedPearlData: pearl,
        selectedTranscriberName,
        unlockMode,
        handleSelectPearl,
        sourceFileDisplay,
        setSourceFileDisplay,
        filters,
        isMobile,
        sourceData
    } = useAppContext();

    const [hoveredTranscriber, setHoveredTranscriber] = useState<string | null>(null);
    const [lastTranscriberName, setLastTranscriberName] = useState<string | null>(null);
    const [justCopiedInternalId, setJustCopiedInternalId] = useState<boolean>(false);
    const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
    const selfRef = useRef<HTMLDivElement>(null);

    const [unlockUpdateTrigger, setUnlockUpdateTrigger] = useState(0);

    useEffect(() => {
        // touch event handler for swipe gestures
        if (!isMobile) return;

        const handleTouchStart = (e: TouchEvent) => {
            // check if the target is an input field
            if (e.target instanceof HTMLElement && e.target.tagName === 'INPUT') return;
            setTouchStart({
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            });
        };

        const handleTouchEnd = (e: TouchEvent) => {
            if (!touchStart) return;

            const touchEnd = {
                x: e.changedTouches[0].clientX,
                y: e.changedTouches[0].clientY
            };

            const deltaX = touchEnd.x - touchStart.x;
            const deltaY = touchEnd.y - touchStart.y;

            // Only handle horizontal swipes that are longer than vertical movement
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Create and dispatch a synthetic keyboard event
                const syntheticEvent = new KeyboardEvent('keydown', {
                    key: deltaX > 0 ? 'ArrowLeft' : 'ArrowRight',
                    bubbles: true
                });
                window.dispatchEvent(syntheticEvent);
            }

            setTouchStart(null);
        };

        window.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('touchend', handleTouchEnd);

        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isMobile, touchStart]);

    // set up the subtitle with the transcriber's name
    useEffect(() => {
        if (hoveredTranscriber === null) {
            return;
        }
        if (pearl) {
            if (hoveredTranscriber.startsWith("plain=")) {
                const transcriberName = hoveredTranscriber.replace("plain=", "");
                setLastTranscriberName(transcriberName);
            } else {
                const transcriberIndex = findTranscriberIndex(pearl, hoveredTranscriber);
                if (transcriberIndex !== -1) {
                    let transcriberName = speakerNames[pearl.transcribers[transcriberIndex].transcriber] ?? "Unknown";

                    const parenthesisMatch = transcriberName.match(/(.*) \((.*)\)/);
                    let parenthesis = "";
                    if (parenthesisMatch) {
                        transcriberName = parenthesisMatch[1];
                        parenthesis = ` (${parenthesisMatch[2]})`;
                    }

                    if (transcriberName.endsWith('s')) {
                        transcriberName = transcriberName.slice(0, -1);
                    }

                    transcriberName += transcriberName.includes("Pearl Reader")
                        ? "'s Projection" + parenthesis
                        : "'s Transcription" + parenthesis;

                    setLastTranscriberName(transcriberName);
                }
            }
        }
    }, [hoveredTranscriber, pearl]);


    const [hintProgress, setHintProgress] = useState(0);
    // Reset hint progress when pearl changes
    useEffect(() => setHintProgress(0), [pearl]);

    const unlockTranscription = useCallback(() => {
        if (pearl) {
            UnlockManager.unlockPearl(pearl);
            if (selectedTranscriberName) UnlockManager.unlockTranscription(pearl, selectedTranscriberName);
            setUnlockUpdateTrigger(prev => prev + 1); // Trigger re-render to update isUnlocked status
        }
    }, [pearl, selectedTranscriberName]);

    const pearlActiveContent = useMemo(() => {
        if (!pearl) {
            return null;
        }
        const selectedTranscriberIndex = findTranscriberIndex(pearl, selectedTranscriberName ?? "");
        if (selectedTranscriberIndex === -1) {
            console.error("Unable to find transcriber index", selectedTranscriberIndex, selectedTranscriberName, pearl)
            return null;
        }

        const dialogue = pearl.transcribers[selectedTranscriberIndex];
        const isUnlocked = unlockMode === 'all' || UnlockManager.isTranscriptionUnlocked(pearl, selectedTranscriberName!);

        const internalId = dialogue.metadata.internalId || pearl.metadata.internalId;
        let sourceFileDisplayText: string | null;
        let sourceFileDisplayTextSelection: string | null;
        if (sourceFileDisplay) {
            sourceFileDisplayTextSelection = sourceFileDisplay;
            sourceFileDisplayText = sourceFileDisplay.split(/[/\\]/).pop() || "";
        } else if (dialogue.metadata.sourceDialogue) {
            if (dialogue.metadata.sourceDialogue.length === 1) {
                sourceFileDisplayTextSelection = dialogue.metadata.sourceDialogue[0];
                sourceFileDisplayText = sourceFileDisplayTextSelection.split(/[/\\]/).pop() || "";
            } else if (dialogue.metadata.sourceDialogue.filter(f => !f.includes("strings")).length) {
                sourceFileDisplayTextSelection = dialogue.metadata.sourceDialogue.filter(f => !f.includes("strings"))[0];
                sourceFileDisplayText = sourceFileDisplayTextSelection.split(/[/\\]/).pop() || "";
            } else {
                sourceFileDisplayText = null;
                sourceFileDisplayTextSelection = null;
            }
        } else {
            sourceFileDisplayText = null;
            sourceFileDisplayTextSelection = null;
        }
        const internalIdElement = internalId && <Tooltip key={"internal-id-tooltip"}>
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
                The above-listed name is likely community-given.<br/>
                The game references this data entry using this internal ID.<br/>
                Click to copy the internal ID to your clipboard.
            </TooltipContent>
        </Tooltip>;
        const sourceFileElement = sourceFileDisplayText && <Tooltip key={"source-file-tooltip"}>
            <TooltipTrigger
                onClick={() => setSourceFileDisplay(sourceFileDisplayTextSelection === sourceFileDisplay ? null : sourceFileDisplayTextSelection)}
            >
                <span className={"font-mono text-xs text-white/70"}>
                    {sourceFileDisplayText} {dialogue.metadata.sourceDialogue && dialogue.metadata.sourceDialogue.length > 1 && ("(+" + (dialogue.metadata.sourceDialogue.length - 1) + ")")}
                </span>
            </TooltipTrigger>
            <TooltipContent className="text-center">
                Dialogue is stored in encrypted files inside the game's folders.<br/>
                This is the filename that the current transcriber's dialogue is stored in.
            </TooltipContent>
        </Tooltip>;

        let bottomElement = null;
        if (internalIdElement) {
            bottomElement = internalIdElement;
        }
        if (sourceFileElement) {
            if (bottomElement) {
                bottomElement = <span className={"font-mono text-xs text-white/70 cursor-pointer"}>
                    {bottomElement} / {sourceFileElement}
                </span>
            } else {
                bottomElement =
                    <span className={"font-mono text-xs text-white/70 cursor-pointer"}>{sourceFileElement}</span>;
            }
        }

        let displayLines: DialogueLine[];
        if (sourceFileDisplay) {
            const foundEntry = findSourceDialogue(sourceFileDisplay, sourceData);
            if (foundEntry) {
                if (foundEntry.c) {
                    displayLines = foundEntry.c.replaceAll("\n\n", "\n").replaceAll("<", "&lt;").replaceAll(">", "&gt;").split("\n").map(line => ({ text: line }));
                } else if (foundEntry.n.includes("png")) {
                    displayLines = [{ text: "![" + foundEntry.p + "]" }];
                } else {
                    displayLines = [{ text: "Error: Source file does not provide content." }];
                }
            } else {
                displayLines = [{ text: "Error: Source file not found." }];
            }
        } else {
            displayLines = dialogue.lines;
        }


        const name = (sourceFileDisplay ? (sourceFileDisplay.split(/[/\\]/).pop() || "") : null) || dialogue.metadata.name || pearl.metadata.name;
        let moveTitleLeft: boolean = false;
        let textContainerClass;
        if (isMobile) {
            textContainerClass = "max-h-[calc(85vh-2px)] pt-16";
        } else {
            let moveDown: boolean;
            if (selfRef.current) {
                let remainingSpaceHalf = (selfRef.current!.clientWidth / 2)
                    - ((name.length + (dialogue.metadata.info ? 4 : 0)) * 9.5) / 2
                    - pearl.transcribers.length * 54;
                let remainingSpaceFull = selfRef.current!.clientWidth
                    - ((name.length + (dialogue.metadata.info ? 4 : 0)) * 9.5)
                    - pearl.transcribers.length * 54;

                moveDown = remainingSpaceFull < 110;
                moveTitleLeft = !moveDown && remainingSpaceHalf < 30;
            } else {
                // fallback in case of the first render
                const textFactor: number = window.innerWidth - (name.length + (dialogue.metadata.info ? 4 : 0)) * 5;
                moveDown = textFactor < 850;
            }
            if (moveDown) {
                textContainerClass = "max-h-[calc(80vh-2px)] pt-16";
            } else {
                textContainerClass = "max-h-[calc(80vh-2px)]";
            }
        }

        let titleElement = null;
        if (dialogue.metadata.info) {
            titleElement = (
                <div className={cn(
                    "text-white text-lg mb-8 pb-0 flex justify-center flex-col",
                    moveTitleLeft ? "items-start pl-10" : "items-center",
                    bottomElement ? "mt-5" : "mt-7"
                )}>
                    <TooltipProvider delayDuration={120} key={"tooltip-provider"}>
                        <Tooltip key={"pearl-info"}>
                            <TooltipTrigger>
                                <span className={"flex items-center"}>
                                    <div className="text-selectable text-center">{name}</div>
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
                        {bottomElement}
                    </TooltipProvider>
                </div>
            )
        } else {
            titleElement =
                <div className={cn(
                    "text-white text-lg mb-8 pb-0 flex justify-center flex-col",
                    moveTitleLeft ? "items-start pl-10" : "items-center",
                    bottomElement ? "mt-5" : "mt-7"
                )}>
                    <TooltipProvider delayDuration={120} key={"tooltip-provider"}>
                        <div className="text-selectable text-center">{name}</div>
                        {bottomElement}
                    </TooltipProvider>
                </div>
        }

        return <>
            <DialogueActionTabs
                pearl={pearl}
                transcriberData={dialogue}
                isUnlocked={isUnlocked}
                onSelectPearl={() => handleSelectPearl(null)}
                selectedTranscriberIndex={selectedTranscriberIndex}
            />
            <TranscriberSelector
                pearl={pearl}
                onHover={setHoveredTranscriber}
            />
            <div className={cn("overflow-y-auto no-scrollbar", textContainerClass)}>
                {isUnlocked ? <>
                    {titleElement}
                    <DialogueContent
                        lines={displayLines}
                        searchText={filters.text}
                    />
                </> : <HintSystemContent
                    pearl={pearl}
                    transcriberData={dialogue}
                    unlockTranscription={unlockTranscription}
                    hintProgress={hintProgress}
                    setHintProgress={setHintProgress}
                />}
            </div>
        </>;
    }, [pearl, selectedTranscriberName, unlockMode, unlockTranscription, hintProgress, justCopiedInternalId, sourceFileDisplay, filters.text, isMobile, handleSelectPearl, setSourceFileDisplay, sourceData, unlockUpdateTrigger]);

    return (
        <div className="flex-1 relative">
            <div ref={selfRef}
                 className={cn(
                     "bg-black border-2 border-white/80 rounded-xl px-12 lg:pl-24 lg:pr-24 text-white text-sm relative shadow-[0_0_10px_rgba(255,255,255,0.1)]",
                     isMobile ? "max-h-[85vh] min-h-[85vh]" : "max-h-[80vh] min-h-[80vh]"
                 )}>
                {pearl ? pearlActiveContent : <WelcomeDialogueContent/>}
            </div>
            <motion.div
                key={lastTranscriberName}
                initial={{ opacity: 0 }}
                animate={{
                    opacity: hoveredTranscriber !== null ? [0.5, 0.95] : [0],
                    transition: {
                        ease: "easeInOut",
                        duration: 0.4,
                        repeat: hoveredTranscriber !== null ? Number.POSITIVE_INFINITY : 0,
                        repeatType: "reverse"
                    },
                }}
                className="absolute bottom-[-2rem] left-0 right-0 text-center text-white drop-shadow-md pointer-events-none"
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