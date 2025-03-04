import { speakerNames, speakersColors } from "../../utils/speakers";
import { DialogueLine } from "../../types/types";
import { renderDialogueLine } from "../../utils/renderDialogueLine";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@shadcn/components/ui/tooltip";

interface DialogueContentProps {
    lines: DialogueLine[];
}

export function DialogueContent({ lines }: DialogueContentProps) {
    return (
        <div className="space-y-3 pb-6">
            {lines.map((line, i) => (
                <div key={i} className="text-center">
                    {line.speaker ? (
                        <span style={{ color: speakersColors[line.speaker] }}>
                            <TooltipProvider
                                key={'tooltip-provider-' + line.speaker + '-' + i}
                                delayDuration={120}>
                                <Tooltip>
                                    <TooltipTrigger>
                                        {line.speaker}
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {speakerNames[line.speaker]} ({speakersColors[line.speaker]})
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>:&nbsp;
                            <span dangerouslySetInnerHTML={{ __html: renderDialogueLine(line.text) }}/>
                        </span>
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