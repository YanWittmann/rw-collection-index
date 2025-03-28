import { speakerNames, speakersColors } from "../../utils/speakers"
import type { DialogueLine } from "../../types/types"
import { renderDialogueLine } from "../../utils/renderDialogueLine"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@shadcn/components/ui/tooltip"

interface DialogueContentProps {
    lines: DialogueLine[]
    searchText?: string
}

const highlightText = (text: string, searchText: string | undefined) => {
    if (!searchText) return text;
    const regex = new RegExp(`(${searchText})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-500/50 text-yellow-200">$1</mark>');
};

export const renderMonoText = (text: string, searchText: string | undefined) => {
    const startsWithSlash = text.startsWith("/");
    const startsWithTilde = text.startsWith("~");
    const textClass = (startsWithSlash ? "text-gray-400" : "") + (startsWithTilde ? " text-center" : "");
    text = text.replace(/^[|/~] /, "");

    // count leading spaces to determine indentation level
    const match = text.match(/^( +)/)
    if (!match) {
        return <div dangerouslySetInnerHTML={{ __html: renderDialogueLine(highlightText(text, searchText)) }}
                    className={textClass}/>
    }

    const indentLevel = match[1].length
    const content = text.substring(indentLevel)

    // nested divs based on indentation level
    let element = <div dangerouslySetInnerHTML={{ __html: renderDialogueLine(highlightText(content, searchText)) }}
                       className={textClass}/>
    for (let i = 0; i < indentLevel; i++) {
        element = <div className="pl-8 border-l-[1px] border-white/20">{element}</div>
    }

    return element;
}

export function DialogueContent({ lines, searchText }: DialogueContentProps) {
    if (lines.length === 0) {
        return null
    }

    // deep clone the lines array
    lines = JSON.parse(JSON.stringify(lines))

    const firstLine = lines[0]
    const displayType = firstLine.text === "MONO" ? "mono" : "centered"

    if (displayType === "mono") {
        lines = lines.slice(1)
    }

    return (
        <div className="space-y-3 pb-6">
            {lines.map((line, i) => (
                <div key={i} className={displayType === "centered" ? "text-center" : "mt-0"}>
                    {line.speaker ? (
                        <span style={{ color: speakersColors[line.speaker] }}>
              <TooltipProvider key={"tooltip-provider-" + line.speaker + "-" + i} delayDuration={120}>
                <Tooltip>
                  <TooltipTrigger className="text-selectable">{line.speaker}</TooltipTrigger>
                  <TooltipContent>
                    {speakerNames[line.speaker]} ({speakersColors[line.speaker]})
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              :&nbsp;
                            {displayType === "mono" ? (
                                renderMonoText(line.text, searchText)
                            ) : (
                                <span
                                    dangerouslySetInnerHTML={{ __html: renderDialogueLine(highlightText(line.text, searchText)) }}/>
                            )}
            </span>
                    ) : displayType === "mono" ? (
                        renderMonoText(line.text, searchText)
                    ) : (
                        <span className="text-white"
                              dangerouslySetInnerHTML={{ __html: renderDialogueLine(highlightText(line.text, searchText)) }}/>
                    )}
                </div>
            ))}
        </div>
    )
}

