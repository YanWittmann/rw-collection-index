"use client"

import { useEffect, useState } from "react";
import { RwIconButton } from "../other/RwIconButton"
import UnlockManager from "../../utils/unlockManager"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@shadcn/components/ui/tooltip"
import { useAppContext } from "../../context/AppContext";
import { RwCheckbox } from "../other/RwCheckbox";
import { SaveFileUpload } from "../SaveFileUpload/SaveFileUpload";

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

async function buildIssueUrl(data: Map<string, Set<string>>): Promise<string> {
    const groupPrefixes = [
        'Watcher_Pearl_Misc_Projection_',
        'Misc_WHITE_PEARLS_',
        'PebblesPearl_',
        'BroadcastMisc_',
        'DevComm_'
    ];

    const normalEntries: string[] = [];
    const groupedMap = new Map<string, string[]>();

    const sortedData = Array.from(data.entries())
        .sort(([idA], [idB]) => idA.localeCompare(idB));

    for (const [id, transcribers] of sortedData) {
        const transcriberText = transcribers.size > 1
            ? ` [${Array.from(transcribers).join(', ')}]`
            : '';
        const matchingPrefix = groupPrefixes.find(prefix => id.startsWith(prefix));
        if (matchingPrefix) {
            if (!groupedMap.has(matchingPrefix)) groupedMap.set(matchingPrefix, []);
            groupedMap.get(matchingPrefix)!.push(id.slice(matchingPrefix.length) + transcriberText);
        } else {
            normalEntries.push(id + transcriberText);
        }
    }

    const finalLines = [...normalEntries];
    // Swapped to .forEach() to avoid TS2802
    groupedMap.forEach((suffixes, prefix) => {
        finalLines.push(`${prefix}* (${suffixes.length}): ${suffixes.join(', ')}`);
    });
    finalLines.sort((a, b) => a.localeCompare(b));
    const entriesText = finalLines.join('\n');

    const bodyParts = [
        '### Expected behavior', '', '',
        '### Actual behavior', '', '',
        '---', '',
        '### Save File', '',
        '_Please drag your `sav` file here._', '',
        '### Additional Details', '', '',
        '---', '',
    ];

    const plainDetails = [
        '<details>',
        `<summary><b>Parsed Entries (${data.size} total)</b></summary>`,
        '', '```text', entriesText, '```', '',
        '</details>'
    ].join('\n');

    let details: string;
    if ([...bodyParts, plainDetails].join('\n').length > 6000) {
        const encoded = new TextEncoder().encode(entriesText);
        const cs = new CompressionStream('gzip');
        const writer = cs.writable.getWriter();
        writer.write(encoded);
        writer.close();
        const chunks: Uint8Array[] = [];
        const reader = cs.readable.getReader();
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
        }
        const combined = new Uint8Array(chunks.reduce((n, c) => n + c.length, 0));
        let offset = 0;
        for (const chunk of chunks) { combined.set(chunk, offset); offset += chunk.length; }
        const binaryString = Array.from(combined, b => String.fromCharCode(b)).join('');
        // base64(gzip(text)) goes in CyberChef input box; btoa again for the input= URL param
        const inputParam = btoa(btoa(binaryString));
        const recipe = `From_Base64('A-Za-z0-9%2B/%3D',true,false)Gunzip()`;
        const cyberChefUrl = `https://gchq.github.io/CyberChef/#recipe=${recipe}&input=${inputParam}`;
        details = `_Parsed Entries (${data.size} total) compressed due to size. [View in CyberChef](${cyberChefUrl})_`;
    } else {
        details = plainDetails;
    }

    const params = new URLSearchParams({
        title: 'Save File Parsing: ',
        labels: 'bug,save-file',
        body: [...bodyParts, details].join('\n')
    });
    return `https://github.com/YanWittmann/rw-collection-index/issues/new?${params.toString()}`;
}

export function WelcomeDialogueContent() {
    const { unlockMode, setUnlockMode, datasetKey, saveFound } = useAppContext();
    const [issueUrl, setIssueUrl] = useState<string | null>(null);
    const [issueUrlFailed, setIssueUrlFailed] = useState(false);

    useEffect(() => {
        if (saveFound.size === 0) return;
        setIssueUrl(null);
        setIssueUrlFailed(false);
        let cancelled = false;
        buildIssueUrl(saveFound)
            .then(url => { if (!cancelled) setIssueUrl(url); })
            .catch(() => { if (!cancelled) setIssueUrlFailed(true); });
        return () => { cancelled = true; };
    }, [saveFound]);

    const isModded = datasetKey === 'modded';

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
        <div className="w-full h-full overflow-y-auto no-scrollbar pb-24">
            {/* header with title and description */}
            <div className="grid grid-cols-1 grid-rows-1 place-items-center text-center mt-10 pb-6">
                {/* Background Image Layer */}
                <div className="col-start-1 row-start-1 flex items-center justify-center w-full select-none pointer-events-none">
                    <img
                        src="img/The_Scholar.png"
                        alt="The Scholar"
                        className="w-1/2 max-w-[20rem] h-auto opacity-20 -mb-4"
                        style={{ imageRendering: "pixelated" }}
                    />
                </div>
                {/* Foreground Text Layer */}
                <div className="col-start-1 row-start-1 z-10 flex flex-col items-center">
                    <h1 className="text-5xl rw-title-font">Rain World</h1>
                    <div className="relative inline-block mt-4 mb-8">
                        <h1 className="text-[2rem] rw-title-font">Collection Index</h1>
                        {datasetKey === 'modded' && (
                            <div className="rw-title-font absolute -bottom-5 -right-10 transform -rotate-[0.25rad] text-yellow-500 font-bold text-xl shadow-lg animate-modded-pulse">
                                Modded!
                            </div>
                        )}
                    </div>
                    <div className="text-xl">Select any pearl or broadcast to view its content.</div>
                </div>
            </div>

            {/* column layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-8 mt-8">
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

                    {/* Buttons */}
                    <div className="flex flex-col gap-1.5 pt-2">
                        <div className="flex flex-row gap-3 justify-start">
                            {!isModded && <SaveFileUpload/>}
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
                        {!isModded && saveFound.size > 0 && (
                            <p className="text-yellow-400/80 text-xs">
                                Found {saveFound.size} unlocks,&nbsp;
                                {issueUrlFailed ? (
                                    <span className="opacity-50 cursor-not-allowed">report an issue (unavailable)</span>
                                ) : issueUrl === null ? (
                                    <span className="opacity-50">preparing report…</span>
                                ) : (
                                    <a
                                        href={issueUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline hover:text-yellow-400/60 transition-colors"
                                    >report an issue</a>
                                )}
                            </p>
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
        </div>
    )
}
