import { useMemo, useState } from "react"
import { cn } from "@shadcn/lib/utils"
import { Pearl } from "./pearl"
import { RwIconButton } from "./rw-icon-button";

interface DialogueLine {
    speaker?: string
    text: string
}

interface Dialogue {
    transcriber: string
    lines: DialogueLine[]
}

interface PearlData {
    id: number
    color: string,
    type: "pearl" | "broadcast"
    transcribers: Dialogue[]
}

const speakersColors: { [key: string]: string } = {
    "CW": "#40e0d0",
    "FP": "#98ff98",
    "NSH": "#40e0d0",
    "BSM": "#ffd700",
    "LttM": "#ff69b4",
}

const GRID_DATA: PearlData[] = [
    {
        id: 1,
        color: "#98ff98",
        type: "pearl",
        transcribers: [
            {
                transcriber: "LttM",
                lines: [
                    {
                        text: "It's an old conversation log. I seem to be in it, but I can't recall much. Let me read it to you:"
                    },
                    {
                        text: "1650.800 - PRIVATE\nFive Pebbles, Chasing Wind, Big Sis Moon, No Significant Harassment"
                    },
                    {
                        text: 'this is in confidence, but apparently a pseudonym "Erratic Pulse" has appeared on a nearby Silverist conversation with ideas about personal ascension. Someone here in our vicinity is trying to cross themselves out.',
                        speaker: "CW"
                    },
                ]
            },
            {
                transcriber: "FP",
                lines: [
                    {
                        text: "Where did you hear this?",
                        speaker: "FP"
                    },
                    {
                        text: "I wish them super good luck in that endeavor. How is it going to happen?\nHave the overseers gnaw through bedrock until their entire can crashes down in the void sea?",
                        speaker: "NSH"
                    },
                    {
                        text: "Please be respectful when speaking of the Void Sea. Grey Wind, where did you hear this?",
                        speaker: "BSM"
                    },
                    {
                        text: "I really shouldn't say. He's going to attempt some sort of breeding program. Thought you might want to know.",
                        speaker: "CW"
                    },
                    {
                        text: "Haha with the slimers, lizards and etceteras? Surely the answer was in a lizard skull all along!",
                        speaker: "NSH"
                    },
                    {
                        text: "Well, he's not looking for the same thing as we anymore, he's changed his task, so who knows really.",
                        speaker: "CW"
                    },
                    {
                        text: "I will try to find him and talk to him. Please don't spread this around!",
                        speaker: "BSM"
                    },
                    {
                        text: "Moon will go get them! Long live the inquisition!",
                        speaker: "NSH"
                    },
                ]
            }
        ]
    },
    {
        id: 2,
        color: "#40e0d0",
        type: "broadcast",
        transcribers: [
            {
                "transcriber": "CW",
                "lines": [
                    {
                        "text": "I'm going to read another one. This one is from a broadcast:"
                    }
                ]
            }
        ]
    }
]

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
                    <span style={{ color: speakersColors[line.speaker] }}>
                        {line.speaker}: {line.text}
                    </span>
                ) : (
                    <span className="text-white">{line.text}</span>
                )}
            </div>
        ))
    }, [selectedPearl, selectedTranscriber]);

    const transcribersIcons = useMemo(() => {
        if (selectedPearl === null) return <div></div>

        const pearl = GRID_DATA[selectedPearl]
        const transcribers = pearl.transcribers.map(t => t.transcriber);

        return transcribers.map((transcriber, index) => (
            <button
                key={transcriber}
                onClick={() => setSelectedTranscriber(index)}
                className={cn(
                    "w-12 h-12 bg-black transition-all p-2",
                    "border border-white/50",
                    selectedTranscriber === index
                        ? "shadow-[0_0_10px_2px_rgba(255,255,255,0.5)] border-white"
                        : "hover:border-white/75 hover:shadow-[0_0_5px_1px_rgba(255,255,255,0.25)]",
                )}
            >
                <Pearl color={speakersColors[transcriber]}/>
            </button>
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

            <div className="relative z-10 flex flex-col md:flex-row gap-12 w-full max-w-[1400px]">
                {/* Left Grid */}
                <div className="w-full md:w-auto">
                    <div className="grid grid-cols-5 gap-1 max-w-[600px] mx-auto">
                        {GRID_DATA.map((pearl, index) => (
                            <RwIconButton
                                key={pearl.id}
                                onClick={() => {
                                    setSelectedPearl(index);
                                    setSelectedTranscriber(0);
                                }}
                                selected={selectedPearl === index}
                            >
                                <Pearl color={pearl.color} type={pearl.type}/>
                            </RwIconButton>
                        ))}
                    </div>
                </div>

                {/* Right Dialogue Box */}
                <div className="flex-1">
                    <div
                        className="bg-black border border-white/50 p-8 text-white min-h-[600px] font-mono text-sm relative">
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

