import { speakerNames, speakersColors } from "../../utils/speakers"
import type { DialogueLine } from "../../types/types"
import { renderDialogueLine, sanitizeHtmlSafe } from "../../utils/renderDialogueLine"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@shadcn/components/ui/tooltip"

interface DialogueContentProps {
    lines: DialogueLine[]
    searchText?: string
}

const highlightText = (text: string, searchText?: string) => {
    if (!searchText) return text
    const escapedSearch = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${escapedSearch})`, "gi")
    return text.replace(regex, '<mark class="bg-yellow-500/50 text-yellow-200">$1</mark>')
}

const highlightCSharp = (code: string) => {
    const sanitized = sanitizeHtmlSafe(code);
    const keywords = [
        "abstract", "as", "base", "bool", "break", "byte", "case", "catch",
        "char", "checked", "class", "const", "continue", "decimal", "default",
        "delegate", "do", "double", "else", "enum", "event", "explicit", "extern",
        "false", "finally", "fixed", "float", "for", "foreach", "goto", "if",
        "implicit", "in", "int", "interface", "internal", "is", "lock", "long",
        "namespace", "new", "null", "object", "operator", "out", "override", "params",
        "private", "protected", "public", "readonly", "ref", "return", "sbyte", "sealed",
        "short", "sizeof", "stackalloc", "static", "string", "struct", "switch",
        "throw", "true", "try", "typeof", "uint", "ulong", "unchecked", "unsafe", "ushort",
        "using", "virtual", "void", "volatile", "while"
    ];

    const specialKeywords = ["new", "var", "typeof", "nameof", "this"];
    const keywordPattern = keywords.join('|');
    const specialPattern = specialKeywords.join('|');

    const syntaxRegex = new RegExp(
        `(\\/\\/.*|\\/\\*[\\s\\S]*?\\*\\/)|(".*?(?<!\\\\)")|(\\b\\d+\\.?\\d*\\b)|` +
        `\\b([A-Z]\\w*)(?=\\s*\\()|\\b(${specialPattern})\\b|(\\b(?:${keywordPattern})\\b)`,
        'g'
    );

    return sanitized.replace(syntaxRegex, (...matches) => {
        const [, comment, string, number, method, specialKeyword, keyword] = matches;
        if (comment) return `<span class="text-gray-400">${comment}</span>`;
        if (string) return `<span class="text-green-400">${string}</span>`;
        if (number) return `<span class="text-yellow-400">${number}</span>`;
        if (method) return `<span class="text-blue-400">${method}</span>`;
        if (specialKeyword) return `<span class="text-orange-400">${specialKeyword}</span>`;
        if (keyword) return `<span class="text-purple-400">${keyword}</span>`;
        return matches[0];
    });
};

export const renderMonoText = (text: string, searchText?: string) => {
    const textClass = [
        text.startsWith("/") ? "text-gray-400" : "",
        text.startsWith("~") ? "text-center" : ""
    ].join(" ");

    const processedText = text.replace(/^[|/~] /, "");
    const indentMatch = processedText.match(/^( +)/);

    if (!indentMatch) {
        return (
            <div
                dangerouslySetInnerHTML={{ __html: renderDialogueLine(highlightText(processedText, searchText)) }}
                className={textClass}
            />
        );
    }

    const indentLevel = indentMatch[1].length;
    const content = processedText.substring(indentLevel);
    let element = (
        <div
            dangerouslySetInnerHTML={{ __html: renderDialogueLine(highlightText(content, searchText)) }}
            className={textClass}
        />
    );

    for (let i = 0; i < indentLevel; i++) {
        element = <div className="pl-8 border-l-[1px] border-white/20" key={i}>{element}</div>;
    }
    return element;
};

export const renderSourceCode = (text: string, searchText?: string) => {
    const processedText = text.replace(/ /g, '\u00A0').replace(/\t/g, '\u00A0\u00A0\u00A0\u00A0');

    return (
        <div
            dangerouslySetInnerHTML={{ __html: highlightCSharp(processedText) }}
            className="font-mono text-sm whitespace-pre-wrap break-words leading-none"
            style={{ wordBreak: "break-all" }}
        />
    );
};

export function DialogueContent({ lines, searchText }: DialogueContentProps) {
    if (lines.length === 0) return null;

    const clonedLines = JSON.parse(JSON.stringify(lines)) as DialogueLine[];
    const firstLine = clonedLines[0];
    const isMonoMode = firstLine.text === "MONO";
    const isSourceCode = clonedLines.some(line =>
        line.text.includes("public void") || line.text.includes("if (") ||
        line.text.includes("class ") || line.text.includes("namespace ")
    );

    const displayType = isMonoMode ? "mono" : isSourceCode ? "source-code" : "centered";
    if (isMonoMode) clonedLines.shift();

    const imageRegex = /!\[(.*?)](?:\[(.*?)])?/;

    return (
        <div className="space-y-3 pb-6">
            {clonedLines.map((line, i) => {
                const imageMatch = line.text.match(imageRegex);

                if (imageMatch) {
                    const [, path, alt] = imageMatch;
                    return (
                        <div key={i} className="flex justify-center">
                            <figure className="w-full max-w-xl">
                                <img src={`img/${path}`} alt={alt ?? ''} className="w-full h-auto rounded-md"/>
                                {alt && <figcaption className="text-sm text-center text-gray-400 mt-2">
                                    {alt}
                                </figcaption>}
                            </figure>
                        </div>
                    );
                }

                return (
                    <div key={i} className={displayType === "centered" ? "text-center" : "mt-0"}>
                        {line.speaker ? (
                            <span style={{ color: speakersColors[line.speaker] }}>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger className="text-selectable">
                                            {line.speaker}
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            {speakerNames[line.speaker]} ({speakersColors[line.speaker]})
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                : {displayType === "mono" ? renderMonoText(line.text, searchText) :
                                displayType === "source-code" ? renderSourceCode(line.text, searchText) :
                                    <span
                                        dangerouslySetInnerHTML={{ __html: renderDialogueLine(highlightText(line.text, searchText)) }}/>}
                            </span>
                        ) : displayType === "mono" ? renderMonoText(line.text, searchText) :
                            displayType === "source-code" ? renderSourceCode(line.text, searchText) :
                                <span className="text-white"
                                      dangerouslySetInnerHTML={{ __html: renderDialogueLine(highlightText(line.text, searchText)) }}/>}
                    </div>
                );
            })}
        </div>
    );
}
