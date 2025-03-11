import { RwIconButton } from "../other/RwIconButton";
import { UnlockMode } from "../../page";
import UnlockManager from "../../utils/unlockManager";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@shadcn/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@shadcn/components/ui/popover";

export interface WelcomeDialogueContentProps {
    toggleUnlockModeCallback: () => void,
    unlockMode: UnlockMode,
    triggerRender: () => void
}

interface ControlItem {
    key: string;
    icon?: string;
    description: string;
}

const controls: ControlItem[] = [
    { key: "WASD", description: "Navigate through the pearl grid" },
    { key: "Q/E", description: "Switch between transcribers" },
    { key: "SHIFT", description: "Show number of transcribers" },
];

export function WelcomeDialogueContent({
                                           toggleUnlockModeCallback,
                                           unlockMode,
                                           triggerRender
                                       }: WelcomeDialogueContentProps) {
    return (
        <>
            <div className="relative text-center mt-20 pb-6">
                <div className="absolute inset-0 flex items-center justify-center">
                    <img
                        src="img/The_Scholar.png"
                        alt="The Scholar"
                        className="w-1/2 max-w-[20rem] h-auto opacity-20 mb-36"
                        style={{ imageRendering: 'pixelated' }}
                    />
                </div>
                <h1 className="relative text-5xl rw-title-font">Rain World</h1>
                <h1 className="relative text-[2rem] rw-title-font mt-4 mb-8">Collection Index</h1>
                <div className="relative mb-12 text-xl">
                    Select any pearl or broadcast to view its content.
                </div>
                <div className="relative flex flex-col items-center justify-center h-full space-y-6">
                    <div>{unlockMode === "all" ? "Haven't found all of them yet?" : "You're a real archeologist beast?"}</div>
                    <div className="flex flex-row space-x-3">
                        {unlockMode === "all" ? (
                            <TooltipProvider delayDuration={200}>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <RwIconButton square={false} onClick={toggleUnlockModeCallback}>
                                            Try Unlock Mode
                                        </RwIconButton>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <div className="text-center">
                                            All contents will be hidden until you unlock them manually.<br/>
                                            A progressive hint system will help you find them by yourself.<br/>
                                            URL parameters will not be updated in this mode to prevent spoilers.
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ) : (
                            <RwIconButton square={false} onClick={toggleUnlockModeCallback}>
                                View all pearls
                            </RwIconButton>
                        )}
                        {unlockMode === "unlock" && (
                            <RwIconButton
                                square={false}
                                onClick={() => {
                                    if (window.confirm("Are you sure you want to reset all unlocks?")) {
                                        UnlockManager.reset();
                                        triggerRender();
                                    }
                                }}
                            >
                                Reset Unlocks
                            </RwIconButton>
                        )}
                    </div>
                </div>
            </div>

            <div className="absolute bottom-16 right-4">
                <Popover>
                    <PopoverTrigger>
                        <RwIconButton square={false}>
                            <span className="flex items-center gap-2 text-sm">
                                Controls
                            </span>
                        </RwIconButton>
                    </PopoverTrigger>
                    <PopoverContent
                        className="w-96 p-0 z-50 bg-black rounded-xl border-2 border-white/50 shadow-lg"
                        align="end"
                    >
                        <div className="relative rounded-xl overflow-hidden">
                            <div
                                className="absolute inset-[3px] rounded-lg border-2 border-white/60 pointer-events-none"/>
                            <div className="p-4 relative z-10">
                                <div className="space-y-3">
                                    {controls.map((control) => (
                                        <div key={control.key} className="flex items-center gap-4">
                                            <div
                                                className="font-mono bg-white/10 px-3 py-1 rounded-md text-sm text-white shrink-0 w-[5.5rem] text-center">
                                                {control.key}
                                            </div>
                                            <div className="text-sm text-white">
                                                {control.description}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </>
    );
}