"use client"

import { RwIcon } from "../PearlGrid/RwIcon"
import { RwIconButton } from "../other/RwIconButton"
import type { Dialogue, MapInfo, PearlData } from "../../types/types"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@shadcn/components/ui/tooltip"
import { regionNames, resolveVariables } from "../../utils/speakers"
import { renderDialogueLine } from "../../utils/renderDialogueLine"
import { Popover, PopoverContent, PopoverTrigger } from "@shadcn/components/ui/popover";
import { generateMapLinkFromMapInfo, getMapLocations, hasMapLocations } from "./DialogueBox";
import { hasTag } from "../../utils/pearlOrder";

interface DialogueActionBarProps {
    pearl: PearlData
    transcriberData: Dialogue
    isUnlocked: boolean
    onSelectPearl: (pearl: PearlData | null) => void
}

export function DialogueActionBar({ pearl, transcriberData, isUnlocked, onSelectPearl }: DialogueActionBarProps) {
    const mapLocations = getMapLocations(transcriberData)
    const hasMultipleLocations = mapLocations.length > 1

    const segments = []

    segments.push(
        <Tooltip key="close-dialogue-box">
            <TooltipTrigger>
                <RwIconButton onClick={() => onSelectPearl(null)} padding="p-[.6rem]">
                    <RwIcon type="close"/>
                </RwIconButton>
            </TooltipTrigger>
            <TooltipContent>Return to the main view</TooltipContent>
        </Tooltip>,
    )

    if (hasTag(transcriberData.metadata.tags, "downpour")) {
        segments.push(
            <Tooltip key="open-downpour">
                <TooltipTrigger>
                    <RwIconButton>
                        <RwIcon type="dlc-dp"/>
                    </RwIconButton>
                </TooltipTrigger>
                <TooltipContent>Downpour-Exclusive Content</TooltipContent>
            </Tooltip>,
        )
    }

    if (isUnlocked && hasMapLocations(transcriberData)) {
        if (hasMultipleLocations) {
            segments.push(
                <Popover key="map-location-selector">
                    <Tooltip key="open-rain-world-map">
                        <PopoverTrigger>
                            <TooltipTrigger>
                                <RwIconButton>
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
                            {/* Outer container with styling */}
                            <div className="relative rounded-xl overflow-hidden">
                                {/* Inner border */}
                                <div
                                    className="absolute inset-[3px] rounded-lg border-2 border-white/60 pointer-events-none"/>

                                {/* Content container */}
                                <div className="max-h-[340px] overflow-y-auto py-2 relative z-10 no-scrollbar">
                                    {mapLocations.map((location: MapInfo, index: number) => (
                                        <button
                                            key={`${location.region}_${location.room}_${index}`}
                                            className="w-full text-left px-4 py-1 relative group text-white/90 hover:underline"
                                            onClick={() => {
                                                const link = generateMapLinkFromMapInfo(location)
                                                if (link) window.open(link, "_blank")
                                            }}
                                        >
                                            <div className="font-medium">
                                                {regionNames[location.region] || "Unknown"} ({location.region})
                                            </div>
                                            <div className="text-sm opacity-80">Room: {location.room}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
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
                            <RwIconButton onClick={() => window.open(mapLink, "_blank")}>
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

    return (
        <div className="absolute top-2 left-2 flex gap-2 p-2">
            <TooltipProvider delayDuration={120} key="tooltip-provider">
                {segments}
            </TooltipProvider>
        </div>
    )
}