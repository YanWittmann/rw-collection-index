import parsedData from "../generated/parsed-dialogues.json";
import { PearlData } from "./types/types";
import { useDialogue } from "./hooks/useDialogue";
import { PearlGrid } from "./components/PearlGrid/PearlGrid";
import { DialogueBox } from "./components/DialogueBox/DialogueBox";
import { orderPearls } from "./utils/pearlOrder";
import { useEffect, useMemo, useState } from "react";
import { useUnlockState } from "./hooks/useUnlockState";
import { urlAccess } from "./utils/urlAccess";
import { useIsMobile } from "./hooks/useIsMobile";
import { cn } from "@shadcn/lib/utils";

let GRID_DATA: PearlData[] = parsedData as PearlData[];

export type UnlockMode = "all" | "unlock";

export default function DialogueInterface() {
    const [unlockMode, setUnlockMode] = useState<UnlockMode>("all");
    const { selectedPearl, selectedTranscriber, handleSelectPearl, handleSelectTranscriber } = useDialogue(unlockMode);
    const { refresh } = useUnlockState();
    const [hintProgress, setHintProgress] = useState<number>(0);
    const [isAlternateDisplayModeActive, setIsAlternateDisplayModeActive] = useState(false);
    const isMobile = useIsMobile();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Shift') {
                setIsAlternateDisplayModeActive(true);
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'Shift') {
                setIsAlternateDisplayModeActive(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    useEffect(() => {
        urlAccess.getParam("pearl") && handleSelectPearl(GRID_DATA.find(pearl => pearl.id === urlAccess.getParam("pearl")!) ?? null);
        urlAccess.getParam("transcriber") && handleSelectTranscriber(urlAccess.getParam("transcriber")!);
    }, []);

    const handleSelectPearlWithReset = (pearl: string) => {
        handleSelectPearl(GRID_DATA.find(pearlData => pearlData.id === pearl) ?? null);
        setHintProgress(0);
    };

    const pearlGridComponent = useMemo(() => (
        <PearlGrid
            pearls={GRID_DATA}
            order={orderPearls}
            selectedPearl={selectedPearl}
            onSelectPearl={handleSelectPearlWithReset}
            unlockMode={unlockMode}
            isAlternateDisplayModeActive={isAlternateDisplayModeActive}
            isMobile={isMobile}
            setUnlockMode={setUnlockMode}
        />
    ), [GRID_DATA, selectedPearl, unlockMode, isAlternateDisplayModeActive, isMobile, handleSelectPearlWithReset]);

    const dialogueBoxComponent = useMemo(() => (
        <DialogueBox
            pearl={selectedPearl !== null ? GRID_DATA.find(pearl => pearl.id === selectedPearl) ?? null : null}
            selectedTranscriber={selectedTranscriber}
            onSelectTranscriber={handleSelectTranscriber}
            setUnlockMode={setUnlockMode}
            unlockMode={unlockMode}
            triggerRender={refresh}
            hintProgress={hintProgress}
            setHintProgress={setHintProgress}
            onSelectPearl={handleSelectPearl}
            isMobile={isMobile}
        />
    ), [selectedPearl, selectedTranscriber, unlockMode, hintProgress, refresh, handleSelectPearl]);

    return (
        <div
            className={cn(
                "min-h-screen w-full relative flex items-center justify-center",
                isMobile ? "p-0" : "p-4 md:p-8"
            )}
            style={{
                backgroundImage: `url(img/Pc-main-menu.png)`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundAttachment: "fixed",
                backgroundColor: "#101010",
            }}
        >
            <div className="absolute inset-0 backdrop-blur-sm bg-black/30"/>

            <div
                className={cn("relative z-10 w-full max-w-[1400px]")}>
                {isMobile ? (
                    <>
                        {!selectedPearl ? (
                            <div className="w-full pb-4">
                                {pearlGridComponent}
                            </div>
                        ) : (
                            <div className={cn("w-full", isMobile ? " p-4" : "")}>
                                {dialogueBoxComponent}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-row gap-5">
                        {pearlGridComponent}
                        {dialogueBoxComponent}
                    </div>
                )}
            </div>
        </div>
    );
}