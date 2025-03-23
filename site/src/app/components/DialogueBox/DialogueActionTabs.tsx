import { RwIcon } from "../PearlGrid/RwIcon"
import type { Dialogue, DialogueLine, MapInfo, PearlData } from "../../types/types"
import { regionNames, resolveVariables, SOURCE_DECRYPTED, speakersColors } from "../../utils/speakers"
import { renderDialogueLine } from "../../utils/renderDialogueLine"
import { hasTag } from "../../utils/pearlOrder"
import { RwScrollableList } from "../other/RwScrollableList"
import { generateMapLinkFromMapInfo, getMapLocations, hasMapLocations } from "./DialogueBox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@shadcn/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@shadcn/components/ui/popover"
import { RwTabButton } from "../other/RwTabButton"
import { useState } from "react";
import copy from 'copy-to-clipboard';
import RwShareTextEditor, { preProcessContent } from "../share/RwShareTextEditor";
import { RwIconButton } from "../other/RwIconButton";
import { renderMonoText } from "./DialogueContent";
import ReactDOMServer from 'react-dom/server';
import { getTranscriberIcon } from "./TranscriberSelector";

interface DialogueActionTabsProps {
    pearl: PearlData,
    transcriberData: Dialogue,
    isUnlocked: boolean,
    onSelectPearl: (pearl: PearlData | null) => void,
    setSourceFileDisplay: (value: ((prevState: string | null) => string | null) | string | null) => void,
    sourceFileDisplay: string | null,
    selectedTranscriberIndex: number
}

export function DialogueActionTabs({
                                       pearl,
                                       transcriberData,
                                       isUnlocked,
                                       onSelectPearl,
                                       setSourceFileDisplay,
                                       sourceFileDisplay,
                                       selectedTranscriberIndex
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

    {
        const leftIconType = pearl.metadata.type === 'item' ? (pearl.metadata.subType || 'pearl') : pearl.metadata.type;
        const multipleSameTranscribers = new Set(pearl.transcribers.map(transcriber => transcriber.transcriber)).size !== pearl.transcribers.length;
        const {
            iconType: rightIconType,
            color: rightIconColor,
            overwriteColor: overwriteRightColor,
        } = getTranscriberIcon(transcriberData, multipleSameTranscribers ? selectedTranscriberIndex : undefined);

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
                        <TooltipContent side="bottom" className={"text-center"}>Share entry via...<br/>Icon is
                            WIP.</TooltipContent>
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
                                {
                                    id: "export-as-image",
                                    title: "Export as image",
                                    subtitle: "Share the transcription text",
                                    customElement: <RwShareTextEditor
                                        defaultText={(() => {
                                            if (transcriberData.lines.length === 0) return "";
                                            let lines: DialogueLine[] = JSON.parse(JSON.stringify(transcriberData.lines));
                                            const firstLine = lines[0];
                                            const displayType = firstLine.text === "MONO" ? "mono" : "centered"
                                            if (displayType === "mono") {
                                                lines = lines.slice(1);
                                                return lines.map(d => {
                                                    return ReactDOMServer.renderToStaticMarkup(renderMonoText(d.text.replace("\n\n", "\n"), undefined));
                                                }).join("\n");
                                            } else {
                                                return lines.map(d => {
                                                    let speakerPrefix = "";
                                                    let speakerSuffix = "";
                                                    const speakerColor = speakersColors[d.speaker ?? ""];
                                                    if (d.speaker) {
                                                        if (speakerColor) {
                                                            speakerPrefix = `<span style="color: ${speakerColor};">${d.speaker}: `;
                                                            speakerSuffix = "</span>";
                                                        } else {
                                                            speakerPrefix = `${d.speaker}: `;
                                                        }
                                                    }
                                                    return speakerPrefix + renderDialogueLine(d.text) + speakerSuffix;
                                                }).join("\n");
                                            }
                                        })()}
                                        preProcessContent={preProcessContent}
                                        onExport={() => console.log("export")}
                                        closeIcon={
                                            <RwIconButton aria-label="Close">
                                                <RwIcon type="close"/>
                                            </RwIconButton>
                                        }
                                        onOpen={() => {
                                        }}
                                        leftIcon={<RwIcon color={pearl.metadata.color} type={leftIconType}/>}
                                        leftText={(transcriberData.metadata.internalId ? transcriberData.metadata.internalId + " - " : "") + transcriberData.metadata.name || pearl.metadata.name}
                                        rightIcon={<RwIcon color={overwriteRightColor ? rightIconColor : undefined}
                                                           type={rightIconType}/>}
                                        exportName={`${transcriberData.metadata.name || pearl.metadata.name}_${transcriberData.transcriber}`}
                                    >
                                        <div
                                            className="w-full text-left px-4 py-1 relative group text-white/90 hover:underline cursor-pointer">
                                            <div>Export Transcription</div>
                                            <div className={"text-sm opacity-80"}>Download text as image</div>
                                        </div>
                                    </RwShareTextEditor>
                                }
                            ]}
                        />
                    </PopoverContent>
                </Tooltip>
            </Popover>,
        );
    }

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

