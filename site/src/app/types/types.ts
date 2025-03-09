export type PearlType = "pearl" | "broadcast" | "item";

export interface DialogueLine {
    speaker?: string;
    text: string;
}

export interface MapInfo {
    region: string;
    room: string;
    mapSlugcat: string;
}

export interface Dialogue {
    transcriber: string;
    metadata: {
        name: string;
        color: string;
        type?: string;
        subType?: string;
        transcriberName?: string;
        info?: string;
        mapInfo?: string;
        map?: MapInfo[];
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
        subType?: string;
        info?: string;
        mapInfo?: string;
        map?: MapInfo[];
    };
    transcribers: Dialogue[];
    hints: Hint[];
}