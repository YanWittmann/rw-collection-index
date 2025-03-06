import parsedData from "../generated/parsed-dialogues.json";
import { PearlData } from "./types/types";
import { useDialogue } from "./hooks/useDialogue";
import { PearlGrid } from "./components/PearlGrid/PearlGrid";
import { DialogueBox } from "./components/DialogueBox/DialogueBox";
import { orderPearls } from "./utils/pearlOrder";
import { useEffect, useState } from "react";
import { useUnlockState } from "./hooks/useUnlockState";
import { urlAccess } from "./utils/urlAccess";

let GRID_DATA: PearlData[] = parsedData as PearlData[];

export type UnlockMode = "all" | "unlock";

export default function DialogueInterface() {
    const [unlockMode, setUnlockMode] = useState<UnlockMode>("all");
    const { selectedPearl, selectedTranscriber, handleSelectPearl, handleSelectTranscriber } = useDialogue(unlockMode);
    const { refresh } = useUnlockState();
    const [hintProgress, setHintProgress] = useState<number>(0);
    const [isAlternateDisplayModeActive, setIsAlternateDisplayModeActive] = useState(false);

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

        // clean up listeners when component unmounts
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    useEffect(() => {
        urlAccess.getParam("pearl") && handleSelectPearl(GRID_DATA.find(pearl => pearl.id === urlAccess.getParam("pearl")!) ?? null);
        urlAccess.getParam("transcriber") && handleSelectTranscriber(urlAccess.getParam("transcriber")!);
    }, []);

    return (
        <div className="min-h-screen w-full relative flex items-center justify-center p-4 md:p-8"
             style={{
                 backgroundImage: `url(img/Pc-main-menu.png)`,
                 backgroundSize: "cover",
                 backgroundPosition: "center",
             }}
        >
            <div className="absolute inset-0 backdrop-blur-sm bg-black/30"/>

            <div className="relative z-10 flex flex-col md:flex-row gap-5 w-full max-w-[1400px]">
                <PearlGrid
                    pearls={GRID_DATA}
                    order={orderPearls}
                    selectedPearl={selectedPearl}
                    onSelectPearl={pearl => {
                        handleSelectPearl(GRID_DATA.find(pearlData => pearlData.id === pearl) ?? null);
                        setHintProgress(0);
                    }}
                    unlockMode={unlockMode}
                    isAlternateDisplayModeActive={isAlternateDisplayModeActive}
                />

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
                />
            </div>
        </div>
    );
}