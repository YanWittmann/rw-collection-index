import parsedData from "../generated/parsed-dialogues.json";
import { PearlData } from "./types/types";
import { useDialogue } from "./hooks/useDialogue";
import { PearlGrid } from "./components/PearlGrid/PearlGrid";
import { DialogueBox } from "./components/DialogueBox/DialogueBox";
import { orderPearls } from "./utils/pearlOrder";
import { useState } from "react";

let GRID_DATA: PearlData[] = parsedData as PearlData[];

export type UnlockMode = "all" | "unlock";

export default function DialogueInterface() {
    const { selectedPearl, selectedTranscriber, handleSelectPearl, handleSelectTranscriber } = useDialogue();
    const [unlockMode, setUnlockMode] = useState<UnlockMode>("all");

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
                    onSelectPearl={handleSelectPearl}
                    unlockMode={unlockMode}
                />

                <DialogueBox
                    pearl={selectedPearl !== null ? GRID_DATA[selectedPearl] : null}
                    selectedTranscriber={selectedTranscriber}
                    onSelectTranscriber={handleSelectTranscriber}
                    setUnlockMode={setUnlockMode}
                    unlockMode={unlockMode}
                />
            </div>
        </div>
    );
}