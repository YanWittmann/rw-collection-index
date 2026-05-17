import { useMemo, useState } from "react";
import { Dialogue, Hint, MapInfo, PearlData } from "../../types/types";
import { RwIconButton } from "../other/RwIconButton";
import { getRegion, getSpeakerDef } from "../../utils/speakers";
import { generateMapLinkFromMapInfo } from "../../utils/mapUtils";
import { MapLocationPopover } from "../map/MapLocationPopover";
import { findPearlCategory, PEARL_ORDER_CONFIGS } from "../../utils/pearlOrder";
import { useAppContext } from "../../context/AppContext";
import { RwAsset } from "../other/RwAsset";
import { Tint } from "../../utils/assetUtils";

interface HintSystemContentProps {
    pearl: PearlData;
    unlockTranscription: () => void;
    transcriberData: Dialogue;
}

type SelectedOption = 'name' | number | null;

export default function HintSystemContent({ pearl, unlockTranscription, transcriberData }: HintSystemContentProps) {
    const { datasetKey } = useAppContext();
    const activeOrderConfig = PEARL_ORDER_CONFIGS[datasetKey] || PEARL_ORDER_CONFIGS['vanilla'];

    const effectiveHints = useMemo<Hint[]>(() => {
        const hints: Hint[] = [];

        const map = transcriberData.metadata.map;
        if (map && map.length > 0) {
            const plural = map.length > 1;
            hints.push({
                name: plural ? "Regions" : "Region",
                lines: ["Found in " + map.map(m => getRegion(m.region).name + " (" + m.region + ")").join(" · ")]
            });
        }

        if (pearl.metadata.type === "broadcast" && pearl.metadata.name) {
            const pearlCategory = findPearlCategory(pearl, activeOrderConfig);
            if (pearlCategory === "Colored Pearls + Broadcasts") {
                hints.push({
                    name: "Slugcats",
                    lines: ["This Collection Entry only appears in Spearmaster's Campaign."]
                });
                if (pearl.metadata.name.includes("(White ")) {
                    hints.push({
                        name: "White Broadcast",
                        lines: [
                            "White Broadcasts unlock in a fixed sequence rather than being tied to specific locations.",
                            "For this reason, the locations cannot be listed in this hint. Feel free to check the unlocked version of this Broadcast for a list of all locations."
                        ]
                    });
                    hints.push({
                        name: "White Broadcast",
                        lines: ["White Broadcasts are only available before speaking to Five Pebbles."]
                    });
                } else if (pearl.metadata.name.includes("(Gray ")) {
                    hints.push({
                        name: "Gray Broadcast",
                        lines: [
                            "Gray Broadcasts unlock in a fixed sequence rather than being tied to specific locations.",
                            "For this reason, the locations cannot be listed in this hint. Feel free to check the unlocked version of this Broadcast for a list of all locations."
                        ]
                    });
                    hints.push({
                        name: "Gray Broadcast",
                        lines: ["Gray Broadcasts are only available after speaking to Five Pebbles."]
                    });
                }
            }
        }

        hints.push(...pearl.hints);
        return hints;
    }, [pearl, transcriberData, activeOrderConfig]);

    const mapHint = useMemo((): { label: string; locations: MapInfo[] } | null => {
        const map = transcriberData.metadata.map;
        if (!map || map.length === 0) return null;
        const hasAnyLink = map.some(m => generateMapLinkFromMapInfo(m) !== null);
        if (!hasAnyLink) return null;
        return { label: map.length > 1 ? "Map Locations" : "Map Location", locations: map };
    }, [transcriberData]);


    // Button labels: append (1), (2)... when hint names collide
    const hintLabels = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const hint of effectiveHints) counts[hint.name] = (counts[hint.name] ?? 0) + 1;
        const indices: Record<string, number> = {};
        return effectiveHints.map(hint => {
            if (counts[hint.name] > 1) {
                indices[hint.name] = (indices[hint.name] ?? 0) + 1;
                return `${hint.name} (${indices[hint.name]})`;
            }
            return hint.name;
        });
    }, [effectiveHints]);

    const [selected, setSelected] = useState<SelectedOption>(null);
    const toggle = (opt: SelectedOption) => setSelected(prev => prev === opt ? null : opt);

    const renderHintLine = (line: string) => {
        if (line.startsWith("http")) {
            return <a href={line} target="_blank" rel="noreferrer" className="text-blue-400 underline">{line}</a>;
        }
        return line;
    };

    const iconType = pearl.metadata.type === 'item' ? (pearl.metadata.subType || 'pearl') : pearl.metadata.type;
    const entryName = transcriberData.metadata.name || pearl.metadata.name;
    const superName = pearl.metadata.name !== entryName ? pearl.metadata.name : null;
    const rawSecondary = transcriberData.metadata.transcriberName ?? getSpeakerDef(transcriberData.transcriber).name ?? null;
    const secondaryName = rawSecondary !== entryName ? rawSecondary : null;
    const internalId = transcriberData.metadata.internalId ?? pearl.metadata.internalId ?? null;

    const renderContent = () => {
        if (selected === 'name') {
            return (
                <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10">
                        <RwAsset src={iconType} tint={Tint.mask(pearl.metadata.color)} />
                    </div>
                    <div className="text-base">
                        {superName && <span className="text-white/40">{superName} · </span>}
                        {entryName}
                    </div>
                    {(secondaryName || internalId) && (
                        <div className="text-sm text-white/40">
                            {[secondaryName, internalId].filter(Boolean).join(' · ')}
                        </div>
                    )}
                </div>
            );
        }
        if (typeof selected === 'number') {
            const hint = effectiveHints[selected];
            if (!hint) return null;
            return (
                <div className="text-sm leading-relaxed text-center">
                    {hint.lines.map((line, j) => (
                        <div key={j}>{renderHintLine(line)}</div>
                    ))}
                </div>
            );
        }
        return null;
    };

    const content = renderContent();

    return (
        <div className="text-center mt-20 pb-6 flex flex-col items-center gap-20">

            {/* Unlock button: lock icon + label as one unit */}
            <RwIconButton square={false} onClick={unlockTranscription} aria-label="Unlock transcription">
                <div className="flex items-center gap-2.5 px-1">
                    <RwAsset src="lock" className="w-5 h-5" />
                    <span className="text-lg">Transcription locked</span>
                </div>
            </RwIconButton>

            {/* Reveal section: stable button row + stable content area */}
            <div className="flex flex-col items-center gap-5 w-full">

                {/* All options as a single flex-wrap row, row never changes */}
                <div className="flex flex-row flex-wrap justify-center gap-3">
                    <RwIconButton
                        square={false}
                        size="small"
                        variant={selected === 'name' ? 'gold' : 'default'}
                        onClick={() => toggle('name')}
                        aria-label="Show name"
                    >
                        Name
                    </RwIconButton>
                    {effectiveHints.map((_, i) => (
                        <RwIconButton
                            key={i}
                            square={false}
                            size="small"
                            variant={selected === i ? 'gold' : 'default'}
                            onClick={() => toggle(i)}
                            aria-label={`Show hint: ${hintLabels[i]}`}
                        >
                            {hintLabels[i]}
                        </RwIconButton>
                    ))}
                    {mapHint && (
                        <MapLocationPopover locations={mapHint.locations}>
                            <RwIconButton
                                square={false}
                                size="small"
                                aria-label="View map location"
                            >
                                {mapHint.label}
                            </RwIconButton>
                        </MapLocationPopover>
                    )}
                </div>

                {/* Content area: always in the same place, only inner text changes */}
                {content && (
                    <div className="w-full flex flex-col items-center pt-8">
                        {content}
                    </div>
                )}
            </div>

        </div>
    );
}
