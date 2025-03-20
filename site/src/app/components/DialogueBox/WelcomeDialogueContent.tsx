"use client"

import { RwIconButton } from "../other/RwIconButton"
import type { UnlockMode } from "../../page"
import UnlockManager from "../../utils/unlockManager"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@shadcn/components/ui/tooltip"

export interface WelcomeDialogueContentProps {
    toggleUnlockModeCallback: () => void
    unlockMode: UnlockMode
    triggerRender: () => void
}

interface ControlItem {
    key: string
    icon?: string
    description: string
}

const controls: ControlItem[] = [
    { key: "WASD or ← ↑ → ↓", description: "Navigate through the pearl grid" },
    { key: "Q/E", description: "Switch between transcribers" },
    { key: "SHIFT", description: "Show number of transcribers" },
    { key: "SWIPE", description: "Mobile: Navigate through the pearl grid" },
]

export function WelcomeDialogueContent({
                                           toggleUnlockModeCallback,
                                           unlockMode,
                                           triggerRender,
                                       }: WelcomeDialogueContentProps) {
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
                <h1 className="relative text-[2rem] rw-title-font mt-4 mb-8">Collection Index</h1>
                <div className="relative mb-12 text-xl">Select any pearl or broadcast to view its content.</div>
            </div>

            {/* column layout */}
            <div className="grid grid-cols-2 gap-8 px-8 mb-16 mt-10">
                {/* unlock mode */}
                <div className="flex flex-col space-y-4">
                    <div className="text-lg font-medium">
                        {unlockMode === "all" ? "Haven't found all of them yet?" : "You're a real archeologist beast?"}
                    </div>
                    <div className="flex flex-row space-x-3">
                        {unlockMode === "all" ? (
                            <TooltipProvider delayDuration={200}>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <RwIconButton square={false} onClick={toggleUnlockModeCallback}
                                                      aria-label="Unlock Mode">
                                            Try Unlock Mode
                                        </RwIconButton>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <div className="text-center">
                                            All contents will be hidden until you unlock them manually.
                                            <br/>A progressive hint system will help you find them by yourself.
                                            <br/>
                                            URL parameters will not be updated in this mode to prevent spoilers.
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ) : (
                            <RwIconButton square={false} onClick={toggleUnlockModeCallback} className="w-full"
                                          aria-label="Unlock Mode">
                                View all pearls
                            </RwIconButton>
                        )}
                        {unlockMode === "unlock" && (
                            <RwIconButton
                                square={false}
                                onClick={() => {
                                    if (window.confirm("Are you sure you want to reset all unlocks?")) {
                                        UnlockManager.reset()
                                        triggerRender()
                                    }
                                }}
                                className="w-full"
                                aria-label="Reset Unlocks"
                            >
                                Reset Unlocks
                            </RwIconButton>
                        )}
                    </div>
                    <div className="text-lg font-medium">
                        Got any feedback?
                    </div>
                    <div className="flex flex-row space-x-3">
                        <RwIconButton square={false}
                                      onClick={() => window.open("https://github.com/YanWittmann/rw-collection-index/issues/new", "_blank")}
                                      aria-label="Open an Issue"
                        >
                            Open an Issue
                        </RwIconButton>
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

