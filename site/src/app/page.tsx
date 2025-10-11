import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import parsedData from "../generated/parsed-dialogues.json";
import { PearlData } from "../app/types/types";
import { useDialogue } from "../app/hooks/useDialogue";
import { orderPearls } from "../app/utils/pearlOrder";
import { lazy, Suspense, useMemo, useState } from "react";
import { useUnlockState } from "../app/hooks/useUnlockState";
import { urlAccess } from "../app/utils/urlAccess";
import { useIsMobile } from "../app/hooks/useIsMobile";
import { cn } from "@shadcn/lib/utils";
import { LoadingSpinner } from "../app/components/LoadingSpinner";

// lazy load components with preloading
const PearlGrid = lazy(() => import("../app/components/PearlGrid/PearlGrid").then(module => ({ default: module.PearlGrid })));
const DialogueBox = lazy(() => import("../app/components/DialogueBox/DialogueBox").then(module => ({ default: module.DialogueBox })));

// preload critical components
const preloadComponents = async () => {
    const [pearlGridModule, dialogueBoxModule] = await Promise.all([
        import("../app/components/PearlGrid/PearlGrid"),
        import("../app/components/DialogueBox/DialogueBox")
    ]);
    return { pearlGridModule, dialogueBoxModule };
};

let GRID_DATA: PearlData[] = parsedData as PearlData[];

export type UnlockMode = "all" | "unlock";

export default function DialogueInterfaceWrapper() {
    const { pearlId } = useParams<{ pearlId: string }>();
    const navigate = useNavigate();
    
    return <DialogueInterface pearlId={pearlId || null} navigate={navigate} />;
}

export function DialogueInterface({ pearlId, navigate }: { pearlId: string | null, navigate: (path: string, options?: { replace?: boolean }) => void }) {
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

    const findTranscriberIndex = (pearl: PearlData, transcriberName: string) => {
        if (!pearl) {
            return null;
        }
        const isMultipleTranscribers = /.+-\\d+$/.test(transcriberName);
        if (isMultipleTranscribers) {
            return parseInt(transcriberName.replace(/^.+-/, ""));
        } else {
            return pearl.transcribers.findIndex(transcriber => transcriber.transcriber === transcriberName);
        }
    }

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

    // Handle pearl selection from URL route instead of query parameters
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

        // Set pearl from route parameter instead of query parameter
        if (pearlId) {
            const matchedPearl = GRID_DATA.find(pearl => 
                pearl.id === urlIdToPearlId(pearlId)
            );
            
            if (matchedPearl) {
                // First, select the pearl which will set the default transcriber
                handleSelectPearl(matchedPearl);
                
                // Then, handle transcriber from query parameter, but only if it's valid for the current pearl
                const transcriberParam = urlAccess.getParam("transcriber");
                if (transcriberParam) {
                    const transcriberExists = matchedPearl.transcribers.some(t => 
                        t.transcriber === transcriberParam || 
                        `${t.transcriber}-${matchedPearl.transcribers.findIndex(tr => tr.transcriber === t.transcriber)}` === transcriberParam
                    );
                    
                    if (transcriberExists) {
                        handleSelectTranscriber(transcriberParam);
                    } else {
                        // If transcriber doesn't exist for this pearl, remove it from URL and use default
                        urlAccess.clearParam("transcriber");
                    }
                }
            }
        } else {
            // If no pearlId in route, check query params for backward compatibility
            const pearlParam = urlAccess.getParam("pearl");
            const itemParam = urlAccess.getParam("item");
            
            if (pearlParam) {
                handleSelectPearl(GRID_DATA.find(pearl => pearl.id === urlIdToPearlId(pearlParam)) ?? null);
            } else if (itemParam) {
                handleSelectPearl(GRID_DATA.find(pearl => pearl.id === urlIdToPearlId(itemParam)) ?? null);
            } else {
                // If no pearl in URL, clear both pearl and transcriber
                handleSelectPearl(null);
                handleSelectTranscriber(null);
            }
        }
        
        const sourceParam = urlAccess.getParam("source");
        if (sourceParam) {
            setSourceFileDisplay(sourceParam);
        }
    }, [pearlId]);

    // Update URL with route-based navigation when pearl changes
    function pearlIdToUrlId(id: string, selectedTranscriber: string | null) {
        for (let element of GRID_DATA) {
            if (element.id === id) {
                if (selectedTranscriber) {
                    const transcriberIndex = findTranscriberIndex(element, selectedTranscriber);
                    if (transcriberIndex !== null && transcriberIndex >= 0 && element.transcribers[transcriberIndex]) {
                        const transcriberInternalId = element.transcribers[transcriberIndex].metadata.internalId;
                        if (transcriberInternalId) {
                            return transcriberInternalId;
                        }
                    }
                }
                if (element.metadata.internalId) {
                    return element.metadata.internalId;
                }
            }
        }
        return id;
    }
    
    useEffect(() => {
        if (unlockMode === "all") {
            if (selectedPearl) {
                // Use the pearlIdToUrlId function to get the proper URL ID
                const urlId = pearlIdToUrlId(selectedPearl, selectedTranscriber);
                const newPath = `/${urlId}`;
                
                // Update transcriber parameter through urlAccess (which manages query params)
                if (selectedTranscriber) {
                    urlAccess.setParam("transcriber", selectedTranscriber);
                } else {
                    urlAccess.clearParam("transcriber");
                }
                
                if (sourceFileDisplay) {
                    urlAccess.setParam("source", sourceFileDisplay);
                } else {
                    urlAccess.clearParam("source");
                }
                
                // Get the current search params
                const currentSearchParams = new URLSearchParams(window.location.search);
                
                // Navigate to the new path preserving query params
                const queryString = currentSearchParams.toString();
                const newUrl = queryString ? `${newPath}?${queryString}` : newPath;
                
                // Only navigate if the path is different
                const currentPath = window.location.pathname.split('/').pop() || '';
                if (currentPath !== urlId) {
                    navigate(newUrl);
                }
            } else {
                // If no pearl selected, go to root and clear params
                urlAccess.clearParam("item");
                urlAccess.clearParam("pearl");
                urlAccess.clearParam("transcriber");
                urlAccess.clearParam("source");
                
                const currentPath = window.location.pathname.split('/').pop() || '';
                if (currentPath !== '') {
                    navigate("/");
                }
            }
        } else {
            urlAccess.clearParam("item");
            urlAccess.clearParam("pearl");
            urlAccess.clearParam("transcriber");
            urlAccess.clearParam("source");
        }
        
        urlAccess.getParam("pearl") && urlAccess.clearParam("pearl");
    }, [selectedPearl, selectedTranscriber, sourceFileDisplay, unlockMode, navigate, GRID_DATA]);

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