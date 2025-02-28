import { useMemo, useState } from "react"
import { Pearl } from "./pearl"
import { RwIconButton } from "./rw-icon-button";
import sanitizeHtml from 'sanitize-html';

import parsedData from "../generated/parsed-dialogues.json";

interface DialogueLine {
    speaker?: string
    text: string
}

interface Dialogue {
    transcriber: string
    lines: DialogueLine[]
}

interface Hint {
    name: string,
    lines: string[]
}

interface PearlData {
    id: number | string
    metadata: {
        color: string
        type: "pearl" | "broadcast"
    }
    transcribers: Dialogue[],
    hints: Hint[]
}

const speakersColors: { [key: string]: string } = {
    "FP": "#66d9bf",
    "EP": "#66d9bf",
    "BSM": "#e5d999",
    "LttM": "#e5d999",
    "CW": "#bfbfe5",
    "NSH": "#bfffbf",
}

let GRID_DATA: PearlData[] = parsedData as PearlData[];

for (let i = 3; i <= 80; i++) {
    let randomColor = Math.floor(Math.random() * 16777215).toString(16);
    GRID_DATA.push({
        id: i,
        metadata: {
            color: `#${randomColor}`,
            type: "pearl",
        },
        transcribers: [
            {
                transcriber: "LttM",
                lines: [
                    {
                        text: "Entry number " + i
                    }
                ]
            }
        ],
        hints: []
    })
}

function renderDialogueLine(line: string) {
    line = line.replace(/\\n/g, "<br>").replace(/\n/g, "<br>");
    return sanitizeHtml(line, {
        allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
        allowedAttributes: {
            'a': ['href']
        }
    });
}

export default function DialogueInterface() {
    const [selectedPearl, setSelectedPearl] = useState<number | null>(null)
    const [selectedTranscriber, setSelectedTranscriber] = useState<number>(0)

    const dialogueContent = useMemo(() => {
        if (selectedPearl === null) return <div className="text-center">Select a pearl to view its dialogue</div>

        const pearl = GRID_DATA[selectedPearl]
        const transcriber = pearl.transcribers[selectedTranscriber]

        return transcriber.lines.map((line, i) => (
            <div key={i} className="text-center">
                {line.speaker ? (
                    <span style={{ color: speakersColors[line.speaker] }} dangerouslySetInnerHTML={{ __html: renderDialogueLine(line.speaker + ': ' + line.text) }}>
                    </span>
                ) : (
                    <span className="text-white" dangerouslySetInnerHTML={{ __html: renderDialogueLine(line.text) }}/>
                )}
            </div>
        ))
    }, [selectedPearl, selectedTranscriber]);

    const transcribersIcons = useMemo(() => {
        if (selectedPearl === null) return <div></div>

        const pearl = GRID_DATA[selectedPearl]
        const transcribers = pearl.transcribers.map(t => t.transcriber);

        return transcribers.map((transcriber, index) => (
            <RwIconButton
                key={transcriber}
                onClick={() => setSelectedTranscriber(index)}
                selected={selectedTranscriber === index}
            >
                <Pearl color={speakersColors[transcriber]}/>
            </RwIconButton>
        ))
    }, [selectedPearl, selectedTranscriber]);

    return (
        <div
            className="min-h-screen w-full relative flex items-center justify-center p-4 md:p-8"
            style={{
                backgroundImage: `url(img/Pc-main-menu.png)`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <div className="absolute inset-0 backdrop-blur-sm bg-black/30"/>

            <div className="relative z-10 flex flex-col md:flex-row gap-5 w-full max-w-[1400px]">
                {/* Left Grid */}
                <div className="no-scrollbar w-full md:w-auto max-h-[80vh] overflow-y-auto p-2 box-border">
                    <div className="grid grid-cols-5 gap-2 max-w-[600px] mx-auto">
                        {GRID_DATA.map((pearl, index) => (
                            pearl.id && <RwIconButton
                                key={pearl.id}
                                onClick={() => {
                                    setSelectedPearl(index);
                                    setSelectedTranscriber(0);
                                }}
                                selected={selectedPearl === index}
                            >
                                <Pearl color={pearl.metadata.color} type={pearl.metadata.type}/>
                            </RwIconButton>
                        ))}
                    </div>
                </div>

                {/* Right Dialogue Box */}
                <div className="flex-1">
                    <div
                        className="bg-black border border-white/50 p-8 text-white max-h-[80vh] min-h-[80vh] font-mono text-sm relative">
                        {/* Person Selectors */}
                        <div className="absolute top-2 right-2 flex gap-2">
                            {transcribersIcons}
                        </div>

                        <div className="space-y-1 mt-16">
                            {dialogueContent}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

