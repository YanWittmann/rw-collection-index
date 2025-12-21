"use client"

import { RwIconButton } from "../other/RwIconButton"
import UnlockManager from "../../utils/unlockManager"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@shadcn/components/ui/tooltip"
import { useAppContext } from "../../context/AppContext";
import { RwIcon } from "../PearlGrid/RwIcon";
import { RwCheckbox } from "../other/RwCheckbox";

interface ControlItem {
    key: string
    icon?: string
    description: string
}

const controls: ControlItem[] = [
    { key: "WASD or ← ↑ → ↓", description: "Navigate through the pearl grid" },
    { key: "Q/E", description: "Switch between transcribers" },
    { key: "SWIPE", description: "Mobile: Navigate through the pearl grid" },
]

export function WelcomeDialogueContent() {
    const { unlockMode, setUnlockMode, datasetKey } = useAppContext();

    const toggleUnlockModeCallback = () => {
        setUnlockMode(unlockMode === "all" ? "unlock" : "all");
    };

    const handleDatasetChange = (newDataset: 'vanilla' | 'modded') => {
        const currentPath = window.location.pathname;
        if (newDataset === 'vanilla') {
            window.location.href = currentPath;
        } else {
            window.location.href = `${currentPath}?d=${newDataset}`;
        }
    };

    return (
        <>
            {/* header with title and description */}
            <div className="relative text-center mt-20 pb-6">
                <div className="absolute inset-0 flex items-center justify-center">
                    <img
                        src="img/The_Scholar.png"
                        alt="The Scholar"
                        className="w-1/2 max-w-[20rem] h-auto opacity-20 mb-14"
                        style={{ imageRendering: "pixelated" }}
                    />
                </div>
                <h1 className="relative text-5xl rw-title-font">Rain World</h1>
                <div className="relative inline-block mt-4 mb-8">
                    <h1 className="text-[2rem] rw-title-font">Collection Index</h1>
                    {datasetKey === 'modded' && (
                        <div className="rw-title-font absolute -bottom-5 -right-10 transform -rotate-[0.25rad] text-yellow-500 font-bold text-xl shadow-lg animate-pulse">
                            Modded!
                        </div>
                    )}
                </div>
                <div className="relative mb-12 text-xl">Select any pearl or broadcast to view its content.</div>
            </div>

            {/* column layout */}
            <div className="grid grid-cols-2 gap-8 px-8 mb-16 mt-10">
                {/* Settings Column */}
                <div className="flex flex-col space-y-4">
                    <div className="text-lg font-medium">Configuration</div>

                    {/* Modded Content Toggle */}
                    <RwCheckbox
                        checked={datasetKey === 'modded'}
                        onCheckedChange={(checked) => handleDatasetChange(checked ? 'modded' : 'vanilla')}
                    >
                        Modded Content
                    </RwCheckbox>

                    {/* Spoiler Protection Toggle */}
                    <TooltipProvider delayDuration={120}>
                        <Tooltip>
                            {/* We wrap in a span/div because TooltipTrigger passes props to its child,
                                and we want to ensure the layout remains stable */}
                            <TooltipTrigger asChild>
                                <span>
                                    <RwCheckbox
                                        checked={unlockMode === 'unlock'}
                                        onCheckedChange={toggleUnlockModeCallback}
                                    >
                                        Spoiler Protection
                                    </RwCheckbox>
                                </span>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                                <div className="text-center">
                                    Hides all content until you unlock it manually.<br/>
                                    Uses a progressive hint system to help you find items.
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {/* Other Buttons */}
                    <div className="flex flex-row space-x-3 pt-2">
                        <RwIconButton square={false}
                                      onClick={() => window.open("https://github.com/YanWittmann/rw-collection-index/issues/new", "_blank")}
                                      aria-label="Open an Issue"
                        >
                            Open an Issue
                        </RwIconButton>
                        {unlockMode === "unlock" && (
                            <RwIconButton
                                square={false}
                                onClick={() => {
                                    if (window.confirm("Are you sure you want to reset all unlocks?")) {
                                        UnlockManager.reset()
                                    }
                                }}
                                aria-label="Reset Unlocks"
                            >
                                Reset Unlocks
                            </RwIconButton>
                        )}
                    </div>
                </div>

                {/* controls */}
                <div className="flex flex-col space-y-4">
                    <div className="text-lg font-medium">Page Controls</div>
                    {controls.map((control) => (
                        <div key={control.key} className="flex items-center gap-4">
                            <div
                                className="font-mono bg-white/10 px-3 py-1 rounded-md text-sm text-white shrink-0 w-[5.5rem] text-center">
                                {control.key}
                            </div>
                            <div className="text-sm text-white">{control.description}</div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}