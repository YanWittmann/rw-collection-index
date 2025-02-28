import { speakersColors } from "../../utils/speakers";
import { DialogueLine } from "../../types/types";
import { renderDialogueLine } from "../../utils/renderDialogueLine";

interface DialogueContentProps {
    lines: DialogueLine[];
}

export function DialogueContent({ lines }: DialogueContentProps) {
    return (
        <div className="space-y-3 mt-20 pb-6">
            {lines.map((line, i) => (
                <div key={i} className="text-center">
                    {line.speaker ? (
                        <span
                            className=""
                            style={{ color: speakersColors[line.speaker] }}
                            dangerouslySetInnerHTML={{ __html: renderDialogueLine(`${line.speaker}: ${line.text}`) }}
                        />
                    ) : (
                        <span
                            className="text-white"
                            dangerouslySetInnerHTML={{ __html: renderDialogueLine(line.text) }}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}