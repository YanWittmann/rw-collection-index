import { PearlData } from "../../types/types";
import { UnlockMode } from "../../page";
import { RwTextInput } from "./RwTextInput";
import { useMemo, useState } from "react";
import PearlItem from "./PearlItem";
import UnlockManager from "../../utils/unlockManager";

interface PearlGridProps {
    pearls: PearlData[],
    selectedPearl: string | null,
    onSelectPearl: (id: string) => void,
    order: (pearls: PearlData[]) => { name: string, items: PearlData[] }[],
    unlockMode: UnlockMode,
}

export function PearlGrid({ pearls, selectedPearl, onSelectPearl, order, unlockMode }: PearlGridProps) {
    const [textFilter, setTextFilter] = useState<string | undefined>(undefined);

    const isPearlIncluded = (pearl: PearlData) => {
        if (!textFilter) return true;
        if (unlockMode === "unlock") {
            if (!UnlockManager.isPearlUnlocked(pearl)) {
                return false;
            }
        }

        const isValidRegionName = textFilter.length === 2 && textFilter.match(/^[A-Z]{2}$/);
        if (isValidRegionName && pearl.metadata.map?.find(m => m.region.toLowerCase() === textFilter.toLowerCase())) return true;

        if (pearl.metadata.name?.toLowerCase().includes(textFilter.toLowerCase())) return true;
        if (pearl.transcribers.some(transcriber => transcriber.lines.some(line => (line.speaker + ": " + line.text).toLowerCase().includes(textFilter.toLowerCase())))) return true;
        if (pearl.transcribers.some(transcriber => transcriber.transcriber.toLowerCase() === textFilter.toLowerCase())) return true;
        return false;
    };

    const filteredPearls = useMemo(() => {
        const orderedPearls = order(pearls);
        return orderedPearls.map(chapter => ({
            name: chapter.name,
            items: chapter.items.filter(isPearlIncluded)
        }));
    }, [textFilter, pearls])

    const renderPearl = (pearl: PearlData, pearlIndex: number) => (
        <PearlItem
            key={pearl.id + '-' + pearlIndex}
            pearl={pearl}
            pearlIndex={pearlIndex}
            selectedPearl={selectedPearl}
            onSelectPearl={onSelectPearl}
            unlockMode={unlockMode}
        />
    );

    return (
        <>
            <div className="no-scrollbar w-full md:w-auto max-h-[80vh] overflow-y-auto p-2 box-border">
                <RwTextInput className="w-full mb-4"
                             onTextInput={text => text === '' ? setTextFilter(undefined) : setTextFilter(text)}
                             placeholder="Search..."/>
                {filteredPearls
                    .filter(chapter => chapter.items.length > 0)
                    .map((chapter, chapterIndex) => (
                        <div key={chapterIndex} className="mb-4 last:mb-0">
                            {chapter.name && <h3 className="text-white text-sm mb-2">{chapter.name}</h3>}
                            <div className="grid grid-cols-5 gap-2 max-w-[600px] mx-auto">
                                {chapter.items.map(
                                    (pearl, pearlIndex) =>
                                        pearl && pearl.id && renderPearl(pearl, pearlIndex)
                                )}
                            </div>
                        </div>
                    ))}
            </div>
        </>
    )
}