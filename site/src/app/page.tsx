import parsedData from "../generated/parsed-dialogues.json";
import { PearlData } from "./types/types";
import { useDialogue } from "./hooks/useDialogue";
import { orderPearls } from "./utils/pearlOrder";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useUnlockState } from "./hooks/useUnlockState";
import { urlAccess } from "./utils/urlAccess";
import { useIsMobile } from "./hooks/useIsMobile";
import { cn } from "@shadcn/lib/utils";
import { LoadingSpinner } from "./components/LoadingSpinner";

// lazy load components with preloading
const PearlGrid = lazy(() => import("./components/PearlGrid/PearlGrid").then(module => ({ default: module.PearlGrid })));
const DialogueBox = lazy(() => import("./components/DialogueBox/DialogueBox").then(module => ({ default: module.DialogueBox })));

// preload critical components
const preloadComponents = async () => {
    const [pearlGridModule, dialogueBoxModule] = await Promise.all([
        import("./components/PearlGrid/PearlGrid"),
        import("./components/DialogueBox/DialogueBox")
    ]);
    return { pearlGridModule, dialogueBoxModule };
};

let GRID_DATA: PearlData[] = parsedData as PearlData[];

export type UnlockMode = "all" | "unlock";

export default function DialogueInterface() {
    const [unlockMode, setUnlockMode] = useState<UnlockMode>("all");
    const { selectedPearl, selectedTranscriber, handleSelectPearl, handleSelectTranscriber, handleKeyNavigation, currentGridPosition, sourceFileDisplay, setSourceFileDisplay } = useDialogue(unlockMode, GRID_DATA);
    const { refresh, unlockVersion } = useUnlockState();
    const [hintProgress, setHintProgress] = useState<number>(0);
    const [isAlternateDisplayModeActive, setIsAlternateDisplayModeActive] = useState(false);
    const [searchText, setSearchText] = useState<string | undefined>(undefined);
    const isMobile = useIsMobile();

    useEffect(() => {
        preloadComponents();
    }, []);

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
        function urlIdToPearlId(id: string) {
            for (let element of GRID_DATA) {
                if (element.metadata.internalId && element.metadata.internalId === id) {
                    return element.id;
                }
                const transcriberMatch = element.transcribers.find(transcriber => transcriber.metadata.internalId === id);
                if (transcriberMatch) {
                    return element.id;
                }
            }
            return id;
        }

        urlAccess.getParam("pearl") && handleSelectPearl(GRID_DATA.find(pearl => pearl.id === urlIdToPearlId(urlAccess.getParam("pearl")!)) ?? null);
        urlAccess.getParam("item") && handleSelectPearl(GRID_DATA.find(pearl => pearl.id === urlIdToPearlId(urlAccess.getParam("item")!)) ?? null);
        urlAccess.getParam("transcriber") && handleSelectTranscriber(urlAccess.getParam("transcriber")!);
        urlAccess.getParam("source") && setSourceFileDisplay(urlAccess.getParam("source")!);
    }, []);

    const handleSelectPearlWithReset = (pearl: string) => {
        handleSelectPearl(GRID_DATA.find(pearlData => pearlData.id === pearl) ?? null);
        setHintProgress(0);
    };

    const pearlGridComponent = useMemo(() => (
        <Suspense fallback={<LoadingSpinner />}>
            <PearlGrid
                pearls={GRID_DATA}
                order={orderPearls}
                selectedPearl={selectedPearl}
                onSelectPearl={handleSelectPearlWithReset}
                unlockMode={unlockMode}
                isAlternateDisplayModeActive={isAlternateDisplayModeActive}
                isMobile={isMobile}
                setUnlockMode={setUnlockMode}
                unlockVersion={unlockVersion}
                handleKeyNavigation={handleKeyNavigation}
                currentGridPosition={currentGridPosition}
                onSearchTextChange={setSearchText}
            />
        </Suspense>
    ), [GRID_DATA, selectedPearl, unlockMode, isAlternateDisplayModeActive, isMobile, handleSelectPearlWithReset, unlockVersion, handleKeyNavigation, currentGridPosition]);

    const dialogueBoxComponent = useMemo(() => (
        <Suspense fallback={<LoadingSpinner />}>
            <DialogueBox
                pearl={selectedPearl !== null ? GRID_DATA.find(pearl => pearl.id === selectedPearl) ?? null : null}
                selectedTranscriber={selectedTranscriber}
                onSelectTranscriber={handleSelectTranscriber}
                sourceFileDisplay={sourceFileDisplay}
                setSourceFileDisplay={setSourceFileDisplay}
                setUnlockMode={setUnlockMode}
                unlockMode={unlockMode}
                triggerRender={refresh}
                hintProgress={hintProgress}
                setHintProgress={setHintProgress}
                onSelectPearl={handleSelectPearl}
                isMobile={isMobile}
                searchText={searchText}
            />
        </Suspense>
    ), [selectedPearl, selectedTranscriber, unlockMode, hintProgress, refresh, handleSelectPearl, searchText]);

    return (
        <div
            className={cn(
                "min-h-screen w-full relative flex items-center justify-center overflow-y-hidden",
                isMobile ? "p-0" : "p-4 md:p-8"
            )}
            style={{
                backgroundImage: `url(img/Pc-main-menu.webp)`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundAttachment: "fixed",
                backgroundColor: "#101010",
            }}
        >
            <div className="absolute inset-0 backdrop-blur-sm bg-black/30"/>

            <div className={cn("relative z-10 w-full max-w-[1400px]")}>
                {isMobile ? (
                    <>
                        <div className="w-full pb-4" style={selectedPearl ? { display: "none" } : {}}>
                            {pearlGridComponent}
                        </div>
                        {selectedPearl && <div className={cn("w-full", isMobile ? " p-4" : "")}>
                            {dialogueBoxComponent}
                        </div>}
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