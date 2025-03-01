import { RwIconButton } from "../other/RwIconButton";
import { UnlockMode } from "../../page";
import UnlockManager from "../../utils/unlockManager";

export interface WelcomeDialogueContentProps {
    toggleUnlockModeCallback: () => void,
    unlockMode: UnlockMode,
    triggerRender: () => void
}

export function WelcomeDialogueContent({
                                           toggleUnlockModeCallback,
                                           unlockMode,
                                           triggerRender
                                       }: WelcomeDialogueContentProps) {
    return (
        <div className="relative text-center mt-20 pb-6">
            <div className="absolute inset-0 flex items-center justify-center">
                <img
                    src="/img/The_Scholar.png"
                    alt="The Scholar"
                    className="w-1/2 max-w-[20rem] h-auto opacity-20 mb-36"
                    style={{ imageRendering: 'pixelated' }}
                />
            </div>
            <h1 className="relative text-5xl rw-title-font">Rain World</h1>
            <h1 className="relative text-[2rem] rw-title-font mt-4 mb-8">Collection Index</h1>
            <div className="relative mb-20 text-xl">
                Select any pearl or broadcast to view its content.
            </div>
            <div className="relative flex flex-col items-center justify-center h-full space-y-3">
                <div>{unlockMode === "all" ? "Haven't found all of them yet?" : "You're a real archeologist beast?"}</div>
                <div className="flex flex-row space-x-3">
                    <RwIconButton square={false} onClick={toggleUnlockModeCallback}>
                        {unlockMode === "all" ? "Try Unlock Mode" : "View all pearls"}
                    </RwIconButton>
                    <RwIconButton square={false} onClick={() => {
                        if (window.confirm("Are you sure you want to reset all unlocks?")) {
                            UnlockManager.reset();
                            triggerRender();
                        }
                    }}>
                        Reset Unlocks
                    </RwIconButton>
                </div>
            </div>
        </div>
    );
}