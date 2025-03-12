export type PearlType = "pearl" | "broadcast" | "echo" | "item";

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
        internalId?: string;
        name: string;
        color: string;
        tags?: string[];
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
        internalId?: string;
        color: string;
        type: PearlType;
        name: string;
        tags?: string[];
        subType?: string;
        info?: string;
        mapInfo?: string;
        map?: MapInfo[];
    };
    transcribers: Dialogue[];
    hints: Hint[];
}