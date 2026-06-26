import { RwAsset } from "../other/RwAsset";
import { Tint } from "../../utils/assetUtils";
import { RwIconButton } from "../other/RwIconButton";
import { Dialogue, PearlData } from "../../types/types";
import UnlockManager from "../../utils/unlockManager";
import { darken } from "../../utils/speakers";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@shadcn/components/ui/tooltip";
import React, { useMemo } from "react";
import { getEffectiveTranscriberName, getTranscriberIcon } from "../../utils/transcriberUtils";
import { useAppContext } from "../../context/AppContext";
import { routeHref } from "../../routing/browserRouting";
import { entryIdForPearl } from "../../routing/routes";

interface TranscriberSelectorProps {
    pearl: PearlData
    onHover: (name: string | null) => void
    ref?: React.Ref<any>
}

export function TranscriberSelector({ pearl, onHover, ref }: TranscriberSelectorProps) {
    const { unlockMode, selectedTranscriberName, handleSelectTranscriber, saveFound, pearls, datasetKey } = useAppContext();
    const multipleSameTranscribers = useMemo(
        () => new Set(pearl.transcribers.map(t => t.transcriber)).size !== pearl.transcribers.length,
        [pearl.transcribers]
    );

    const renderTranscriber = (transcriber: Dialogue, index: number) => {
        const { asset, color, displayTranscriberName } =
            getTranscriberIcon(transcriber, pearl, multipleSameTranscribers ? index : undefined);

        const effectiveName = getEffectiveTranscriberName(pearl.transcribers, transcriber.transcriber, index);
        const isUnlocked = unlockMode === 'all' || UnlockManager.isTranscriptionUnlocked(pearl, effectiveName);
        const isFoundInSave = saveFound.get(pearl.id)?.has(effectiveName) ?? false;
        const transcriberUrl = routeHref({ datasetKey, entryId: entryIdForPearl(pearl, pearls), transcriberName: effectiveName, source: null });

        if (!isUnlocked) {
            return (
                <RwIconButton
                    key={'select-' + pearl.id + '-' + index}
                    href={transcriberUrl}
                    onClick={() => handleSelectTranscriber(effectiveName)}
                    selected={effectiveName === selectedTranscriberName}
                    variant={isFoundInSave ? 'gold' : 'default'}
                    aria-label={"Locked transcriber"}
                >
                    <RwAsset src="questionmark" tint={Tint.mask(darken(color, 20))} />
                </RwIconButton>
            );
        } else {
            return (
                <Tooltip key={'select-' + pearl.id + '-' + index}>
                    <TooltipTrigger>
                        <RwIconButton
                            href={transcriberUrl}
                            onClick={() => handleSelectTranscriber(effectiveName)}
                            selected={effectiveName === selectedTranscriberName}
                            variant={isFoundInSave ? 'gold' : 'default'}
                            onMouseEnter={() => onHover(effectiveName)}
                            onMouseLeave={() => onHover(null)}
                            aria-label={displayTranscriberName}
                        >
                            <RwAsset {...asset} />
                        </RwIconButton>
                    </TooltipTrigger>
                    <TooltipContent>
                        {displayTranscriberName.startsWith("plain=")
                            ? displayTranscriberName.replace("plain=", "")
                            : displayTranscriberName
                        }
                    </TooltipContent>
                </Tooltip>
            );
        }
    };

    return (
        <TooltipProvider delayDuration={200}>
            <div className="absolute top-2 right-2 flex gap-2 p-2" ref={ref}>
                {pearl.transcribers.map((transcriber, index) => renderTranscriber(transcriber, index))}
            </div>
        </TooltipProvider>
    );
}