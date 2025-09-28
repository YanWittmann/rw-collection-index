import { speakerNames, speakersColors } from "../../utils/speakers"
import type { DialogueLine } from "../../types/types"
import { renderDialogueLine, sanitizeHtmlSafe } from "../../utils/renderDialogueLine"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@shadcn/components/ui/tooltip"
import { useEffect, useState } from "react"

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

const parseAttributes = (text: string) => {
    const attributesRegex = /\[(.*?)=(.*?)]/g;
    const attributes: { [key: string]: string } = {};
    let attrMatch;
    while ((attrMatch = attributesRegex.exec(text)) !== null) {
        const [, key, value] = attrMatch;
        if (key && value) {
            attributes[key.trim().toUpperCase()] = value.trim();
        }
    }
    return attributes;
}

const parseMediaDetails = (text: string) => {
    const mediaPathRegex = /!\[(.*?)]/;
    const mediaMatch = text.match(mediaPathRegex);
    if (!mediaMatch) return null;

    const path = mediaMatch[1];
    const restOfString = text.substring(mediaMatch[0].length);
    const attributes = parseAttributes(restOfString);

    const alt = attributes.ALT?.toLowerCase() || '';
    const style = attributes.STYLE?.toLowerCase();

    const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
    const audioExtensions = ['mp3', 'wav', 'ogg'];
    const extension = path.split('.').pop()?.toLowerCase();

    let type: 'image' | 'audio' | null = null;
    if (extension && imageExtensions.includes(extension)) {
        type = 'image';
    } else if (extension && audioExtensions.includes(extension)) {
        type = 'audio';
    }

    if (!type) return null;

    return { path, alt, style, type };
};


const ImageRenderer = ({ frames, attributes }: { frames: DialogueLine[], attributes?: { [key: string]: string } }) => {
    let [currentIndex, setCurrentIndex] = useState(0);
    const [isHovering, setIsHovering] = useState(false);

    if (currentIndex !== 0 && currentIndex >= frames.length) {
        currentIndex = 0;
        setCurrentIndex(0);
    }

    useEffect(() => {
        if (frames.length <= 1 || isHovering) return;

        const speed = Number(attributes?.SPEED) || 1300;
        const interval = setInterval(() => {
            setCurrentIndex(prevIndex => (prevIndex + 1) % frames.length);
        }, speed);
        return () => clearInterval(interval);
    }, [frames.length, attributes, isHovering]);

    const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (frames.length <= 1) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        const percent = Math.max(0, Math.min(1, x / width));
        const frameIndex = Math.min(frames.length - 1, Math.floor(percent * frames.length));
        setCurrentIndex(frameIndex);
    };

    const details = parseMediaDetails(frames[currentIndex].text);
    if (!details || details.type !== 'image') return null;

    const { path, alt, style } = details;
    let imageElement;

    if (style === 'rounded') {
        const featherGradient = 'radial-gradient(circle, black 50%, transparent 70%)';
        const divStyles: React.CSSProperties = {
            width: '100%',
            height: 'auto',
            aspectRatio: '1 / 1',
            backgroundImage: `url(img/${path})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            maskImage: featherGradient,
            WebkitMaskImage: featherGradient,
        };
        imageElement = <div style={divStyles} role="img" aria-label={alt}></div>;
    } else {
        imageElement = <img src={`img/${path}`} alt={alt} className="w-full h-auto rounded-md"/>;
    }

    return (
        <div className="flex justify-center">
            <figure className="w-full max-w-xl">
                <a
                    href={`img/${path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-zoom-in"
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    onMouseMove={handleMouseMove}
                >
                    {imageElement}
                    {alt && <figcaption className="text-sm text-center text-gray-400 mt-2">{alt}</figcaption>}
                </a>
            </figure>
        </div>
    );
};

const AudioRenderer = ({ path, alt }: { path: string, alt: string }) => {
    return (
        <div className="flex justify-center">
            <figure className="w-full max-w-xl">
                <audio controls src={`audio/${path}`} className="w-full">
                    Your browser does not support the audio element.
                </audio>
                {alt && <figcaption className="text-sm text-center text-gray-400 mt-2">{alt}</figcaption>}
            </figure>
        </div>
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

    const processedContent: (DialogueLine | {
        type: 'sequence';
        frames: DialogueLine[];
        attributes: { [key: string]: string }
    })[] = [];
    const preloadImagePaths = new Set<string>();

    let i = 0;
    while (i < clonedLines.length) {
        const line = clonedLines[i];
        if (line.text.trim().startsWith('SEQUENCE')) {
            const attributes = parseAttributes(line.text);
            const sequenceFrames: DialogueLine[] = [];
            let j = i + 1;
            while (j < clonedLines.length) {
                const mediaDetails = parseMediaDetails(clonedLines[j].text);
                if (mediaDetails?.type !== 'image') break; // Sequences only support images

                preloadImagePaths.add(mediaDetails.path);
                sequenceFrames.push(clonedLines[j]);
                j++;
            }
            if (sequenceFrames.length > 0) {
                processedContent.push({ type: 'sequence', frames: sequenceFrames, attributes });
                i = j;
            } else {
                i++;
            }
        } else {
            const mediaDetails = parseMediaDetails(line.text);
            if (mediaDetails?.type === 'image') {
                preloadImagePaths.add(mediaDetails.path);
            }
            processedContent.push(line);
            i++;
        }
    }

    return (
        <div className="space-y-3 pb-6">
            {Array.from(preloadImagePaths).map(path => (
                <img key={path} src={`img/${path}`} alt="preload"
                     style={{ position: 'absolute', left: '10px', top: '1200px' }}/>
            ))}

            {processedContent.map((item, i) => {
                if ('type' in item && item.type === 'sequence') {
                    return <ImageRenderer key={i} frames={item.frames} attributes={item.attributes}/>;
                }

                const line = item as DialogueLine;
                const mediaDetails = parseMediaDetails(line.text);

                if (mediaDetails?.type === 'image') {
                    return <ImageRenderer key={i} frames={[line]}/>;
                }

                if (mediaDetails?.type === 'audio') {
                    return <AudioRenderer key={i} path={mediaDetails.path} alt={mediaDetails.alt}/>;
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