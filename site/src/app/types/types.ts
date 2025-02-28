export interface DialogueLine {
    speaker?: string;
    text: string;
}

export interface Dialogue {
    transcriber: string;
    lines: DialogueLine[];
}

export interface Hint {
    name: string;
    lines: string[];
}

export interface PearlData {
    id: string;
    metadata: {
        color: string;
        type: "pearl" | "broadcast";
        name: string;
        region: string;
        room: string;
        mapSlugcat: string;
    };
    transcribers: Dialogue[];
    hints: Hint[];
}