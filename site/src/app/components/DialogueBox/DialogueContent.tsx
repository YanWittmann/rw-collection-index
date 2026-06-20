import { getSpeakerInfo } from "../../utils/speakers"
import { assetUrl } from "../../utils/assetUtils"
import type { DialogueLine } from "../../types/types"
import { renderDialogueLine, sanitizeHtmlSafe } from "../../utils/renderDialogueLine"
import { parseAttributes, parseMediaDetails, stripMonoMarker } from "../../utils/dialogueParsing"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@shadcn/components/ui/tooltip"
import { useEffect, useMemo, useRef, useState } from "react"

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

const CSHARP_KEYWORDS = [
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
const CSHARP_SPECIAL_KEYWORDS = ["new", "var", "typeof", "nameof", "this"];
const CSHARP_SYNTAX_REGEX = new RegExp(
    `(\\/\\/.*|\\/\\*[\\s\\S]*?\\*\\/)|(".*?(?<!\\\\)")|(\\b\\d+\\.?\\d*\\b)|` +
    `\\b([A-Z]\\w*)(?=\\s*\\()|\\b(${CSHARP_SPECIAL_KEYWORDS.join('|')})\\b|(\\b(?:${CSHARP_KEYWORDS.join('|')})\\b)`,
    'g'
);

const highlightCSharp = (code: string) => {
    const sanitized = sanitizeHtmlSafe(code);

    return sanitized.replace(CSHARP_SYNTAX_REGEX, (...matches) => {
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

    const processedText = stripMonoMarker(text);
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

const ImageRenderer = ({ frames, attributes }: { frames: DialogueLine[], attributes?: { [key: string]: string } }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovering, setIsHovering] = useState(false);
    const rafRef = useRef<number | null>(null);

    if (currentIndex !== 0 && currentIndex >= frames.length) {
        setCurrentIndex(0);
    }

    const currentFrameDetails = useMemo(
        () => parseMediaDetails(frames[currentIndex]?.text),
        [frames, currentIndex]
    );


    useEffect(() => {
        if (frames.length <= 1 || isHovering) return;

        const speed = Number(attributes?.SPEED) || 1300;
        const interval = setInterval(() => {
            setCurrentIndex(prevIndex => (prevIndex + 1) % frames.length);
        }, speed);
        return () => clearInterval(interval);
    }, [frames.length, attributes, isHovering]);

    useEffect(() => {
        setCurrentIndex(0);
    }, [frames]);

    const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (frames.length <= 1) return;
        if (rafRef.current !== null) return;
        const clientX = e.clientX;
        const rect = e.currentTarget.getBoundingClientRect();
        rafRef.current = requestAnimationFrame(() => {
            rafRef.current = null;
            const x = clientX - rect.left;
            const percent = Math.max(0, Math.min(1, x / rect.width));
            const frameIndex = Math.min(frames.length - 1, Math.floor(percent * frames.length));
            setCurrentIndex(frameIndex);
        });
    };

    if (!currentFrameDetails || currentFrameDetails.type !== 'image') return null;

    const { path, alt, style } = currentFrameDetails;
    let imageElement;
    let captionText = '';

    if (frames.length > 1 && isHovering) {
        const frameNumber = currentIndex + 1;
        const frameLabel = `${frameNumber} / ${frames.length}`;
        captionText = alt ? `${alt} (${frameLabel})` : frameLabel;
    } else {
        captionText = alt;
    }

    const imageStyles: React.CSSProperties = {
        imageRendering: 'pixelated',
    };

    if (style === 'rounded') {
        const featherGradient = 'radial-gradient(ellipse, black 50%, transparent 70%)';
        const imgStyles: React.CSSProperties = {
            ...imageStyles,
            width: '100%',
            height: 'auto',
            maskImage: featherGradient,
            WebkitMaskImage: featherGradient,
            willChange: 'mask-image',
        };
        imageElement = <img src={assetUrl(`img/${path}`)} alt={alt} style={imgStyles}/>;
    } else {
        imageElement = <img src={assetUrl(`img/${path}`)} alt={alt} style={imageStyles} className="w-full h-auto rounded-md"/>;
    }

    return (
        <div className="flex justify-center">
            <figure className="w-full max-w-xl">
                <a
                    href={assetUrl(`img/${path}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-zoom-in"
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    onMouseMove={handleMouseMove}
                >
                    {imageElement}
                    {captionText &&
                        <figcaption className="text-sm text-center text-gray-400 mt-2">{captionText}</figcaption>}
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
    const { processedContent, preloadImagePaths, displayType } = useMemo(() => {
        if (lines.length === 0) {
            return { processedContent: [], preloadImagePaths: new Set<string>(), displayType: "centered" as const };
        }

        const clonedLines = JSON.parse(JSON.stringify(lines)) as DialogueLine[];
        const firstLine = clonedLines[0];
        const isMonoMode = firstLine.text === "MONO";
        const isSourceCode = clonedLines.some(line =>
            line.text.includes("public void") || line.text.includes("if (") ||
            line.text.includes("namespace ")
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

        return { processedContent, preloadImagePaths, displayType };
    }, [lines, searchText]);

    if (lines.length === 0) return null;

    return (
        <main className="space-y-3 pb-6">
            {Array.from(preloadImagePaths).map(path => (
                <img key={path} src={assetUrl(`img/${path}`)} alt="preload"
                     style={{ position: 'absolute', left: '10px', top: '1200px', opacity: "0%" }}/>
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

                // Resolve speaker info with namespace support
                const rawSpeakerKey = line.namespace ? `${line.namespace}-${line.speaker}` : line.speaker;
                const speakerInfo = line.speaker
                    ? getSpeakerInfo(rawSpeakerKey || "", line.speaker, line.namespace)
                    : { displayName: undefined, color: undefined };

                return (
                    <div key={i} className={displayType === "centered" ? "text-center" : "mt-0"}>
                        {line.speaker ? (
                            <span style={{ color: speakerInfo.color }}>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger className="text-selectable">
                                            {line.speaker}
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            {speakerInfo.displayName} ({speakerInfo.color})
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
        </main>
    );
}
