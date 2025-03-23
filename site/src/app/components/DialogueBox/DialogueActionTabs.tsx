"use client"

import { RwIcon } from "../PearlGrid/RwIcon"
import type { Dialogue, MapInfo, PearlData } from "../../types/types"
import { regionNames, resolveVariables, SOURCE_DECRYPTED } from "../../utils/speakers"
import { renderDialogueLine } from "../../utils/renderDialogueLine"
import { hasTag } from "../../utils/pearlOrder"
import { RwScrollableList } from "../other/RwScrollableList"
import { generateMapLinkFromMapInfo, getMapLocations, hasMapLocations } from "./DialogueBox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@shadcn/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@shadcn/components/ui/popover"
import { RwTabButton } from "../other/RwTabButton"
import { useState } from "react";
import copy from 'copy-to-clipboard';

interface DialogueActionTabsProps {
    pearl: PearlData
    transcriberData: Dialogue
    isUnlocked: boolean
    onSelectPearl: (pearl: PearlData | null) => void
    setSourceFileDisplay: (value: ((prevState: string | null) => string | null) | string | null) => void
    sourceFileDisplay: string | null
}

export function DialogueActionTabs({
                                       pearl,
                                       transcriberData,
                                       isUnlocked,
                                       onSelectPearl,
                                       setSourceFileDisplay,
                                       sourceFileDisplay,
                                   }: DialogueActionTabsProps) {
    const mapLocations = getMapLocations(transcriberData)
    const hasMultipleLocations = mapLocations.length > 1

    const tabs = []

    tabs.push(
        <Tooltip key="close-dialogue-box">
            <TooltipTrigger asChild><span>
                <RwTabButton
                    onClick={() => onSelectPearl(null)}
                    aria-label="Close Dialogue Box"
                >
                  <RwIcon type="close"/>
                </RwTabButton>
            </span></TooltipTrigger>
            <TooltipContent side="bottom">Return to the main view</TooltipContent>
        </Tooltip>,
    )

    const [isSharePopoverOpen, setIsSharePopoverOpen] = useState<boolean>(false);
    const handleShareItemClick = () => {
        setIsSharePopoverOpen(false);
    };

    tabs.push(
        <Popover key="source-dialogue-selector" open={isSharePopoverOpen} onOpenChange={setIsSharePopoverOpen}>
            <Tooltip key="share-content">
                <PopoverTrigger>
                    <TooltipTrigger asChild><span>
                        <RwTabButton
                            onClick={() => null}
                            aria-label="Share Content"
                        >
                          <RwIcon type="share"/>
                        </RwTabButton>
                </span></TooltipTrigger>
                    <TooltipContent side="bottom">Share entry via</TooltipContent>
                </PopoverTrigger>
                <PopoverContent
                    className="w-64 p-0 z-50 bg-black rounded-xl border-2 border-white/50 shadow-lg text-white"
                    align="start"
                    sideOffset={5}
                >
                    <RwScrollableList
                        items={[
                            {
                                id: "copy",
                                title: "Copy Link",
                                subtitle: "Share this entry via a link",
                                onClick: () => {
                                    copy(window.location.toString());
                                    handleShareItemClick();
                                }
                            },
                        ]}
                    />
                </PopoverContent>
            </Tooltip>
        </Popover>,
    )

    if (sourceFileDisplay) {
        tabs.push(
            <Tooltip key="source-dialogue">
                <TooltipTrigger asChild>
          <span>
            <RwTabButton
                aria-label="Source Dialogue"
                onClick={() => setSourceFileDisplay(null)}
            >
              <RwIcon type="source"/>
            </RwTabButton>
          </span>
                </TooltipTrigger>
                <TooltipContent className="text-center" side="bottom">
                    View the default text for this transcriber.
                </TooltipContent>
            </Tooltip>,
        )
    } else if (transcriberData.metadata.sourceDialogue) {
        const hasMultipleSourceFiles = transcriberData.metadata.sourceDialogue.length > 1

        if (hasMultipleSourceFiles) {
            tabs.push(
                <Popover key="source-dialogue-selector">
                    <Tooltip key="source-dialogue-files">
                        <PopoverTrigger>
                            <TooltipTrigger asChild><span>
                                  <RwTabButton
                                      aria-label="Source Dialogue Files"
                                      badge={transcriberData.metadata.sourceDialogue.length}
                                  >
                                    <RwIcon type="source"/>
                                  </RwTabButton>
                            </span></TooltipTrigger>
                            <TooltipContent className="text-center" side="bottom">
                                Dialogue is stored in encrypted files inside the game's folders.
                                <br/>
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
            const sourceDialogueFilename = transcriberData.metadata.sourceDialogue[0].split(/[/\\]/).pop()
            if (sourceDialogueFilename) {
                tabs.push(
                    <Tooltip key="source-dialogue">
                        <TooltipTrigger asChild>
              <span>
                <RwTabButton
                    aria-label="Source Dialogue"
                    onClick={() => setSourceFileDisplay(sourceDialogueFilename)}
                >
                  <RwIcon type="source"/>
                </RwTabButton>
              </span>
                        </TooltipTrigger>
                        <TooltipContent className="text-center" side="bottom">
                            Dialogue is stored in encrypted files inside the game's folders.
                            <br/>
                            Click here to view this transcription's source file.
                        </TooltipContent>
                    </Tooltip>,
                )
            }
        }
    }

    if (isUnlocked && hasMapLocations(transcriberData)) {
        if (hasMultipleLocations) {
            tabs.push(
                <Popover key="map-location-selector">
                    <Tooltip key="open-rain-world-map">
                        <PopoverTrigger>
                            <TooltipTrigger asChild>
                <span>
                  <RwTabButton
                      aria-label="Open Rain World Map"
                      badge={mapLocations.length}
                  >
                    <RwIcon type="pin"/>
                  </RwTabButton>
                </span>
                            </TooltipTrigger>
                            <TooltipContent className="text-center" side="bottom">
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
                </Popover>,
            )
        } else if (transcriberData.metadata.map && transcriberData.metadata.map.length > 0) {
            const selectedMap = transcriberData.metadata.map[0]
            const mapLink = generateMapLinkFromMapInfo(selectedMap)
            if (mapLink) {
                tabs.push(
                    <Tooltip key="open-rain-world-map">
                        <TooltipTrigger asChild>
              <span>
                <RwTabButton
                    onClick={() => window.open(mapLink, "_blank")}
                    aria-label="Open Rain World Map"
                >
                  <RwIcon type="pin"/>
                </RwTabButton>
              </span>
                        </TooltipTrigger>
                        <TooltipContent className="text-center" side="bottom">
                            {regionNames[selectedMap.region] || "Unknown"} ({selectedMap.region}) / {selectedMap.room}
                            {transcriberData.metadata.mapInfo && (
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html: renderDialogueLine(resolveVariables("\n" + transcriberData.metadata.mapInfo)),
                                    }}
                                />
                            )}
                        </TooltipContent>
                    </Tooltip>,
                )
            }
        }
    }

    if (hasTag(transcriberData.metadata.tags, "downpour")) {
        tabs.push(
            <Tooltip key="open-downpour">
                <TooltipTrigger asChild>
          <span>
            <RwTabButton
                aria-label="Downpour-Exclusive Content"
            >
              <RwIcon type="dlc-dp"/>
            </RwTabButton>
          </span>
                </TooltipTrigger>
                <TooltipContent side="bottom">Downpour-Exclusive Content</TooltipContent>
            </Tooltip>,
        )
    }

    return (
        <div className="absolute top-[-2.7rem] left-8 flex flex-col gap-2">
            <TooltipProvider delayDuration={120} key="tooltip-provider">
                <div className="flex gap-2">{tabs}</div>
            </TooltipProvider>
        </div>
    )
}

