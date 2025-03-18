"use client"

import { RwIcon } from "../PearlGrid/RwIcon"
import { RwIconButton } from "../other/RwIconButton"
import type { Dialogue, MapInfo, PearlData } from "../../types/types"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@shadcn/components/ui/tooltip"
import { regionNames, resolveVariables, SOURCE_DECRYPTED } from "../../utils/speakers"
import { renderDialogueLine } from "../../utils/renderDialogueLine"
import { Popover, PopoverContent, PopoverTrigger } from "@shadcn/components/ui/popover";
import { generateMapLinkFromMapInfo, getMapLocations, hasMapLocations } from "./DialogueBox";
import { hasTag } from "../../utils/pearlOrder";
import { RwScrollableList } from "../other/RwScrollableList";

interface DialogueActionBarProps {
    pearl: PearlData,
    transcriberData: Dialogue,
    isUnlocked: boolean,
    onSelectPearl: (pearl: PearlData | null) => void,
    setSourceFileDisplay: (value: (((prevState: (string | null)) => (string | null)) | string | null)) => void,
    sourceFileDisplay: string | null
}

export function DialogueActionBar({
                                      pearl,
                                      transcriberData,
                                      isUnlocked,
                                      onSelectPearl,
                                      setSourceFileDisplay,
                                      sourceFileDisplay
                                  }: DialogueActionBarProps) {
    const mapLocations = getMapLocations(transcriberData)
    const hasMultipleLocations = mapLocations.length > 1

    const segments = []

    segments.push(
        <Tooltip key="close-dialogue-box">
            <TooltipTrigger>
                <RwIconButton onClick={() => onSelectPearl(null)} padding="p-[.6rem]" aria-label="Close Dialogue Box">
                    <RwIcon type="close"/>
                </RwIconButton>
            </TooltipTrigger>
            <TooltipContent>Return to the main view</TooltipContent>
        </Tooltip>,
    )

    if (sourceFileDisplay) {
        segments.push(
            <Tooltip key="source-dialogue">
                <TooltipTrigger>
                    <RwIconButton aria-label="Source Dialogue"
                                  onClick={() => setSourceFileDisplay(null)}>
                        <RwIcon type="source"/>
                    </RwIconButton>
                </TooltipTrigger>
                <TooltipContent className={"text-center"}>
                    View the default text for this transcriber.
                </TooltipContent>
            </Tooltip>
        )

    } else if (transcriberData.metadata.sourceDialogue) {
        const hasMultipleSourceFiles = transcriberData.metadata.sourceDialogue.length > 1

        if (hasMultipleSourceFiles) {
            // use scrollable list for multiple source files
            segments.push(
                <Popover key="source-dialogue-selector">
                    <Tooltip key="source-dialogue-files">
                        <PopoverTrigger>
                            <TooltipTrigger>
                                <RwIconButton aria-label="Source Dialogue Files">
                                    <RwIcon type="source"/>
                                    <span
                                        className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    {transcriberData.metadata.sourceDialogue.length}
                  </span>
                                </RwIconButton>
                            </TooltipTrigger>
                            <TooltipContent className="text-center">
                                Dialogue is stored in encrypted files inside the game's folders.<br/>
                                Click to view the source files for this transcription.
                            </TooltipContent>
                        </PopoverTrigger>
                        <PopoverContent
                            className="w-64 p-0 z-50 bg-black rounded-xl border-2 border-white/50 shadow-lg"
                            align="start"
                            sideOffset={5}
                        >
                            <RwScrollableList
                                items={transcriberData.metadata.sourceDialogue.map((sourcePath, index) => {
                                    const filename = sourcePath.split(/[/\\]/).pop() || `Source File ${index + 1}`
                                    const foundEntry = SOURCE_DECRYPTED.find((entry) => entry.n === filename)

                                    return {
                                        id: `source-file-${index}`,
                                        title: filename,
                                        subtitle: foundEntry ? foundEntry.p : "Entry unavailable. Likely an error.",
                                        onClick: () => setSourceFileDisplay(filename),
                                    }
                                })}
                            />
                        </PopoverContent>
                    </Tooltip>
                </Popover>,
            )
        } else {
            // single source file
            const sourceDialogueFilename = transcriberData.metadata.sourceDialogue[0].split(/[/\\]/).pop()
            if (sourceDialogueFilename) {
                segments.push(
                    <Tooltip key="source-dialogue">
                        <TooltipTrigger>
                            <RwIconButton aria-label="Source Dialogue"
                                          onClick={() => setSourceFileDisplay(sourceDialogueFilename)}>
                                <RwIcon type="source"/>
                            </RwIconButton>
                        </TooltipTrigger>
                        <TooltipContent className={"text-center"}>
                            Dialogue is stored in encrypted files inside the game's folders.<br/>
                            Click here to view this transcription's source file.
                        </TooltipContent>
                    </Tooltip>,
                )
            }
        }
    }

    if (isUnlocked && hasMapLocations(transcriberData)) {
        if (hasMultipleLocations) {
            segments.push(
                <Popover key="map-location-selector">
                    <Tooltip key="open-rain-world-map">
                        <PopoverTrigger>
                            <TooltipTrigger>
                                <RwIconButton aria-label="Open Rain World Map">
                                    <RwIcon type="pin"/>
                                    {hasMultipleLocations && (
                                        <span
                                            className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                                            {mapLocations.length}
                                        </span>
                                    )}
                                </RwIconButton>
                            </TooltipTrigger>
                            <TooltipContent className="text-center">
                                {transcriberData.metadata.mapInfo && (
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: renderDialogueLine(resolveVariables(transcriberData.metadata.mapInfo)),
                                        }}
                                    />
                                )}
                            </TooltipContent>
                        </PopoverTrigger>
                        <PopoverContent
                            className="w-64 p-0 z-50 bg-black rounded-xl border-2 border-white/50 shadow-lg"
                            align="start"
                            sideOffset={5}
                        >
                            <RwScrollableList
                                items={mapLocations.map((location: MapInfo, index: number) => ({
                                    id: `${location.region}_${location.room}_${index}`,
                                    title: `${regionNames[location.region] || "Unknown"} (${location.region})`,
                                    subtitle: `Room: ${location.room}`,
                                    onClick: () => {
                                        const link = generateMapLinkFromMapInfo(location)
                                        if (link) window.open(link, "_blank")
                                    },
                                }))}
                            />
                        </PopoverContent>
                    </Tooltip>
                </Popover>
            )
        } else if (transcriberData.metadata.map && transcriberData.metadata.map.length > 0) {
            const selectedMap = transcriberData.metadata.map[0];
            const mapLink = generateMapLinkFromMapInfo(selectedMap);
            if (mapLink) {
                segments.push(
                    <Tooltip key="open-rain-world-map">
                        <TooltipTrigger>
                            <RwIconButton onClick={() => window.open(mapLink, "_blank")}
                                          aria-label="Open Rain World Map">
                                <RwIcon type="pin"/>
                            </RwIconButton>
                        </TooltipTrigger>
                        <TooltipContent className="text-center">
                            {regionNames[selectedMap.region] || "Unknown"} ({selectedMap.region})
                            / {selectedMap.room}
                            {transcriberData.metadata.mapInfo && (
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html: renderDialogueLine(resolveVariables("\n" + transcriberData.metadata.mapInfo)),
                                    }}
                                />
                            )}
                        </TooltipContent>
                    </Tooltip>,
                );
            }
        }
    }

    if (hasTag(transcriberData.metadata.tags, "downpour")) {
        segments.push(
            <Tooltip key="open-downpour">
                <TooltipTrigger>
                    <RwIconButton aria-label="Downpour-Exclusive Content">
                        <RwIcon type="dlc-dp"/>
                    </RwIconButton>
                </TooltipTrigger>
                <TooltipContent>Downpour-Exclusive Content</TooltipContent>
            </Tooltip>,
        )
    }

    return (
        <div className="absolute top-2 left-2 flex gap-2 p-2">
            <TooltipProvider delayDuration={120} key="tooltip-provider">
                {segments}
            </TooltipProvider>
        </div>
    )
}