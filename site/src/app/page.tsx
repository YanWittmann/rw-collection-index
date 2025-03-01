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

/*function randomColor() {
    const r = Math.floor(Math.random() * 200 + 55);
    const g = Math.floor(Math.random() * 200 + 55);
    const b = Math.floor(Math.random() * 200 + 55);
    return `rgb(${r},${g},${b})`;
}
for (let i = 0; i < 100; i++) {
    GRID_DATA.push({
        id: `DUMMY_${i}`,
        metadata: {
            name: "DUMMY" + i,
            color: randomColor(),
            type: ["pearl", "broadcast"][Math.floor(Math.random() * 2)] as "pearl" | "broadcast",
            region: "UNKNOWN",
            room: "UNKNOWN",
            mapSlugcat: "UNKNOWN"
        },
        hints: [],
        transcribers: []
    });
}*/

export type UnlockMode = "all" | "unlock";

export default function DialogueInterface() {
    const { selectedPearl, selectedTranscriber, handleSelectPearl, handleSelectTranscriber } = useDialogue();
    const [unlockMode, setUnlockMode] = useState<UnlockMode>("all");
    const { unlockVersion, refresh } = useUnlockState();
    const [hintProgress, setHintProgress] = useState<number>(0);

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