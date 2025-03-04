export type PearlType = "pearl" | "broadcast";

export interface DialogueLine {
    speaker?: string;
    text: string;
}

export interface Dialogue {
    transcriber: string;
    metadata: {
        color: string;
        info?: string;
        region?: string;
        room?: string;
        mapSlugcat?: string;
    }
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
        type: PearlType;
        name: string;
        info?: string;
        region: string;
        room: string;
        mapSlugcat: string;
    };
    transcribers: Dialogue[];
    hints: Hint[];
}