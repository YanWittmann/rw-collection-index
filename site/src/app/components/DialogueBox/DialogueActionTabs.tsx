import { RwAsset } from "../other/RwAsset"
import { Tint } from "../../utils/assetUtils"
import type { Dialogue, DialogueLine, PearlData } from "../../types/types"
import { findSourceDialogue, getRegion, getSpeakerDef } from "../../utils/speakers"
import { renderDialogueLine } from "../../utils/renderDialogueLine"
import { hasTag } from "../../utils/pearlOrder"
import { RwScrollableList } from "../other/RwScrollableList"
import { generateMapLinkFromMapInfo, getMapLocations, hasMapLocations } from "../../utils/mapUtils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@shadcn/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@shadcn/components/ui/popover"
import { RwTabButton } from "../other/RwTabButton"
import { useState, useMemo } from "react";
import { MapLocationPopover } from "../map/MapLocationPopover";
import copy from 'copy-to-clipboard';
import RwShareTextEditor, { preProcessContent } from "../share/RwShareTextEditor";
import { renderMonoText } from "./DialogueContent";
import ReactDOMServer from 'react-dom/server';
import { getTranscriberIcon } from "../../utils/transcriberUtils";
import { useAppContext } from "../../context/AppContext";

interface DialogueActionTabsProps {
    pearl: PearlData,
    transcriberData: Dialogue,
    isUnlocked: boolean,
    onSelectPearl: (pearl: PearlData | null) => void,
    selectedTranscriberIndex: number,
    detailsMode: boolean,
    onToggleDetails: () => void,
}

export function DialogueActionTabs({
                                       pearl,
                                       transcriberData,
                                       isUnlocked,
                                       onSelectPearl,
                                       selectedTranscriberIndex,
                                       detailsMode,
                                       onToggleDetails,
                                   }: DialogueActionTabsProps) {
    const { sourceFileDisplay, setSourceFileDisplay, sourceData } = useAppContext();
    const mapLocations = useMemo(() => getMapLocations(transcriberData), [transcriberData]);

    const shareDefaultText = useMemo(() => {
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
                const speakerColor = getSpeakerDef(d.speaker).color;
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
    }, [transcriberData]);

    const sourceDialogueItems = useMemo(() => {
        if (!transcriberData.metadata.sourceDialogue) return [];
        return transcriberData.metadata.sourceDialogue.map((sourcePath: string, index: number) => {
            const filename = sourcePath.split(/[/\\]/).pop() || `Source File ${index + 1}`;
            const foundEntry = findSourceDialogue(sourcePath, sourceData);
            return {
                id: `source-file-${index}`,
                title: filename,
                subtitle: foundEntry ? foundEntry.p.replaceAll("\\", "/") : "Entry unavailable. Likely an error.",
                onClick: () => setSourceFileDisplay(sourcePath),
            };
        });
    }, [transcriberData, sourceData, setSourceFileDisplay]);


    const tabs = []

    tabs.push(
        <Tooltip key="close-dialogue-box">
            <TooltipTrigger asChild><span>
                <RwTabButton
                    onClick={() => onSelectPearl(null)}
                    aria-label="Close Dialogue Box"
                >
                  <RwAsset src="close" />
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
        const multipleSameTranscribers = new Set(pearl.transcribers.map((transcriber: Dialogue) => transcriber.transcriber)).size !== pearl.transcribers.length;
        const { asset: rightAsset } = getTranscriberIcon(transcriberData, pearl, multipleSameTranscribers ? selectedTranscriberIndex : undefined);

        tabs.push(
            <Popover key="source-dialogue-selector" open={isSharePopoverOpen} onOpenChange={setIsSharePopoverOpen}>
                <Tooltip key="share-content">
                    <PopoverTrigger>
                        <TooltipTrigger asChild><span>
                        <RwTabButton
                            onClick={() => null}
                            aria-label="Share Content"
                        >
                          <RwAsset src="share" />
                        </RwTabButton>
                </span></TooltipTrigger>
                        <TooltipContent side="bottom" className={"text-center"}>Share entry via...</TooltipContent>
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
                                        defaultText={shareDefaultText}
                                        preProcessContent={preProcessContent}
                                        onExport={() => console.log("export")}
                                        onOpen={() => {
                                        }}
                                        leftIcon={<RwAsset src={leftIconType} tint={Tint.mask(pearl.metadata.color)} />}
                                        leftText={(transcriberData.metadata.internalId ? transcriberData.metadata.internalId + " - " : "") + (transcriberData.metadata.name || pearl.metadata.name)}
                                        rightIcon={<RwAsset {...rightAsset} />}
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
              <RwAsset src="source" />
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
                <Popover key="source-dialogue-selector-multiple">
                    <Tooltip key="source-dialogue-files">
                        <PopoverTrigger>
                            <TooltipTrigger asChild><span>
                                  <RwTabButton
                                      aria-label="Source Dialogue Files"
                                      badge={transcriberData.metadata.sourceDialogue.length}
                                  >
                                    <RwAsset src="source" />
                                  </RwTabButton>
                            </span></TooltipTrigger>
                            <TooltipContent className="text-center" side="bottom">
                                Dialogue is stored in encrypted files inside the game's folders.
                                <br/>
                                Click to view the source files for this transcription.
                            </TooltipContent>
                        </PopoverTrigger>
                        <PopoverContent
                            className="w-80 p-0 z-50 bg-black rounded-xl border-2 border-white/50 shadow-lg"
                            align="start"
                            sideOffset={5}
                        >
                            <RwScrollableList
                                items={sourceDialogueItems}
                            />
                        </PopoverContent>
                    </Tooltip>
                </Popover>,
            )
        } else {
            const sourceDialogueFilename = transcriberData.metadata.sourceDialogue[0]
            tabs.push(
                <Tooltip key="source-dialogue">
                    <TooltipTrigger asChild>
              <span>
                <RwTabButton
                    aria-label="Source Dialogue"
                    onClick={() => setSourceFileDisplay(sourceDialogueFilename)}
                >
                  <RwAsset src="source" />
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

    if (isUnlocked && hasMapLocations(transcriberData)) {
        tabs.push(
            <Tooltip key="open-rain-world-map">
                <MapLocationPopover locations={mapLocations}>
                    <TooltipTrigger asChild>
                        <span onContextMenu={mapLocations.length === 1 ? (e) => {
                            e.preventDefault();
                            const link = generateMapLinkFromMapInfo(mapLocations[0]);
                            if (link) window.open(link, "_blank");
                        } : undefined}>
                            <RwTabButton
                                aria-label="Open Rain World Map"
                                badge={mapLocations.length > 1 ? mapLocations.length : undefined}
                            >
                                <RwAsset src="pin" />
                            </RwTabButton>
                        </span>
                    </TooltipTrigger>
                </MapLocationPopover>
                <TooltipContent className="text-center" side="bottom">
                    {mapLocations.length === 1
                        ? <>{getRegion(mapLocations[0].region).name} ({mapLocations[0].region}) / {mapLocations[0].room}<br/><span className="text-xs opacity-60">Right-click to open directly</span></>
                        : <>View map locations</>
                    }
                </TooltipContent>
            </Tooltip>,
        )
    }

    if (isUnlocked && (transcriberData.metadata.info || transcriberData.metadata.mapInfo)) {
        tabs.push(
            <Tooltip key="entry-details">
                <TooltipTrigger asChild><span>
                    <RwTabButton
                        aria-label="Entry Details"
                        onClick={onToggleDetails}
                        selected={detailsMode}
                    >
                        <div className="w-5 h-5"><RwAsset src="info" /></div>
                    </RwTabButton>
                </span></TooltipTrigger>
                <TooltipContent side="bottom">Notes &amp; location context</TooltipContent>
            </Tooltip>,
        );
    }

    if (hasTag(transcriberData.metadata.tags, "downpour")) {
        tabs.push(
            <Tooltip key="open-downpour">
                <TooltipTrigger asChild>
          <span>
            <RwTabButton aria-label="Downpour-Exclusive Content">
              <RwAsset src="dlc-dp" />
            </RwTabButton>
          </span>
                </TooltipTrigger>
                <TooltipContent side="bottom">Downpour-Exclusive Content</TooltipContent>
            </Tooltip>,
        )
    }

    if (hasTag(transcriberData.metadata.tags, "watcher")) {
        tabs.push(
            <Tooltip key="open-watcher">
                <TooltipTrigger asChild>
          <span>
            <RwTabButton aria-label="The Watcher-Exclusive Content">
              <RwAsset src="dlc-watcher" />
            </RwTabButton>
          </span>
                </TooltipTrigger>
                <TooltipContent side="bottom">The Watcher-Exclusive Content</TooltipContent>
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
