"use client"

import React, { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import RwShareTextSnippet from "./RwShareTextSnippet";
import { Button } from "@shadcn/components/ui/button";
import { generateTintedCanvas } from "../../utils/iconUtils";

interface RwShareTextEditorProps {
    children: ReactNode;
    defaultText?: string;
    preProcessContent?: (rawText: string) => string;
    onExport?: (content: string) => void;
    closeIcon?: ReactNode;
    title?: string;
    exportButtonText?: string;
    onOpen?: () => void;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    leftText?: string;
    exportName?: string;
}

export const preProcessContent = (text: string) => {
    return "<span class=\"flex gap-1 flex-col\"><span>" + text.replaceAll("\n", "</span><span>") + "</span></span>";
};

const replaceIconsWithCanvas = async (container: HTMLElement) => {
    const iconElements = container.querySelectorAll(".rw-icon-container");

    for (const iconElement of Array.from(iconElements)) {
        const type = iconElement.getAttribute("data-type");
        const color = iconElement.getAttribute("data-color");
        const width = iconElement.clientWidth;
        const height = iconElement.clientHeight;

        if (type && width && height) {
            const canvas = await generateTintedCanvas(type, color, width, height);

            iconElement.innerHTML = ""; // Clear the icon content

            // Ensure the canvas matches the original icon's size and position
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            canvas.style.display = "block";
            canvas.style.verticalAlign = "bottom"; // Align to the bottom

            iconElement.appendChild(canvas); // Add the canvas
        }
    }
};

const Controls = ({
                      frameWidth,
                      setFrameWidth,
                      isCentered,
                      setIsCentered,
                      handleExport,
                      exportButtonText
                  }: {
    frameWidth: number;
    setFrameWidth: (width: number) => void;
    isCentered: boolean;
    setIsCentered: (centered: boolean) => void;
    handleExport: () => void;
    exportButtonText: string;
}) => (
    <>
        {/* Width control */}
        <div className="mb-4">
            <label className="text-white/80 text-sm block mb-2">Width: {frameWidth}%</label>
            <input
                type="range"
                min="20"
                max="200"
                value={frameWidth}
                onChange={(e) => setFrameWidth(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer"
            />
        </div>

        {/* Text alignment */}
        <div className="mb-4">
            <label className="text-white/80 text-sm block mb-2">Text Alignment</label>
            <button
                className="flex items-center justify-center p-2 w-full rounded border border-white/30 text-white/80 hover:bg-white/10"
                onClick={() => setIsCentered(!isCentered)}
            >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                    <rect x="2" y="3" width="12" height="1.5" fill="currentColor"/>
                    <rect x={isCentered ? "4" : "2"} y="7" width="8" height="1.5" fill="currentColor"/>
                    <rect x={isCentered ? "5" : "2"} y="11" width="6" height="1.5" fill="currentColor"/>
                </svg>
                {isCentered ? "Center Text" : "Left Align"}
            </button>
        </div>

        {/* Export button */}
        <Button
            onClick={handleExport}
            className="w-full bg-black text-white border border-white/80 hover:bg-black/80"
        >
            {exportButtonText}
        </Button>
    </>
);

export default function RwShareTextEditor({
                                              children,
                                              defaultText = "",
                                              preProcessContent,
                                              onExport,
                                              closeIcon,
                                              title = "Share Transcription",
                                              exportButtonText = "Export",
                                              onOpen,
                                              leftIcon,
                                              rightIcon,
                                              leftText,
                                              exportName,
                                          }: RwShareTextEditorProps) {
    const [showModal, setShowModal] = useState(false);
    const [content, setContent] = useState(defaultText);
    const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null);
    const [isCentered, setIsCentered] = useState<boolean>(false);
    const [frameWidth, setFrameWidth] = useState<number>(100);
    const [showFloatingControls, setShowFloatingControls] = useState<boolean>(false);

    exportName = exportName?.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    useEffect(() => {
        if (showModal) {
            const div = document.createElement("div");
            document.body.appendChild(div);
            setModalRoot(div);

            return () => {
                document.body.removeChild(div);
            };
        }
    }, [showModal]);

    const handleExport = async () => {
        const snippetElement = document.querySelector(".rw-share-text-snippet") as HTMLElement;

        if (snippetElement) {
            const html2canvas = (await import("html2canvas")).default;

            // Replace icons with canvas elements
            await replaceIconsWithCanvas(snippetElement);

            // Use html2canvas to capture the element
            html2canvas(snippetElement, {
                backgroundColor: null,
                scale: 2,
                logging: true,
                useCORS: true,
            }).then((canvas) => {
                const imgData = canvas.toDataURL("image/png");
                const link = document.createElement("a");
                link.href = imgData;
                link.download = exportName ?? "exported-transcription.png";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                setShowModal(false);
                onExport?.(content);

                try {
                    setTimeout(() => fetch("https://yanwittmann.de/projects/countapi/increment.php?namespace=rwci&key=use-export"), 0);
                } catch (error) {
                }
            }).catch((error: Error) => {
                console.error("Error capturing snippet:", error);
            });
        }
    };

    return (
        <>
            {/* Trigger element - render the children as the trigger */}
            <div onClick={() => {
                setShowModal(true);
                if (onOpen) onOpen();
            }}>
                {children}
            </div>

            {/* Modal */}
            {showModal && modalRoot && createPortal(
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-black border-2 border-white/80 rounded-xl shadow-[0_0_10px_rgba(255,255,255,0.1)] w-full max-w-[90vw] relative">
                        {/* Header */}
                        <div className="flex justify-between items-center py-2 px-4 border-b border-white/20">
                            <h2 className="text-white font-medium">{title}</h2>
                            <div
                                className="cursor-pointer text-white hover:bg-white/10 p-1 rounded"
                                onClick={() => setShowModal(false)}
                            >
                                {closeIcon || "✕"}
                            </div>
                        </div>

                        {/* Main content area with desktop sidebar */}
                        <div className="flex">
                            {/* Sidebar - visible only on desktop */}
                            <div className="hidden md:block md:w-64 p-4 border-r border-white/20 flex-shrink-0">
                                <h3 className="text-white mb-4">Controls</h3>
                                <Controls
                                    frameWidth={frameWidth}
                                    setFrameWidth={setFrameWidth}
                                    isCentered={isCentered}
                                    setIsCentered={setIsCentered}
                                    handleExport={handleExport}
                                    exportButtonText={exportButtonText}
                                />
                            </div>

                            {/* Content area */}
                            <div className="flex-1 overflow-y-auto max-h-[calc(80svh-8rem)]">
                                <div className="p-4">
                                    <h3 className="text-white mb-2">Preview:</h3>
                                    <div style={{
                                        width: `${frameWidth}%`,
                                        transition: 'width 0.2s'
                                    }}>
                                        <RwShareTextSnippet
                                            className="rw-share-text-snippet"
                                            defaultValue={content}
                                            htmlMode={true}
                                            preProcessContent={preProcessContent}
                                            fitContent={true}
                                            leftIcon={leftIcon}
                                            leftText={leftText}
                                            rightIcon={rightIcon}
                                            centered={isCentered}
                                        />
                                    </div>

                                    <div className="mt-6 border-t border-white/20 pt-4">
                                        <h3 className="text-white mb-2">Edit export:</h3>
                                        <RwShareTextSnippet
                                            defaultValue={content}
                                            onChange={setContent}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Full-width floating controls button (mobile only) */}
                        <div className="md:hidden fixed bottom-0 left-0 right-0 p-2 z-10 bg-gradient-to-t from-black to-transparent">
                            <button
                                className="w-full bg-black text-white border border-white/80 rounded-lg py-2 px-4 hover:bg-black/80 flex items-center justify-center gap-2"
                                onClick={() => setShowFloatingControls(!showFloatingControls)}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3 17h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V7H3v2z"/>
                                </svg>
                                {showFloatingControls ? "Hide Controls" : "Show Controls"}
                            </button>
                        </div>

                        {/* Floating controls panel (mobile only) */}
                        {showFloatingControls && (
                            <div className="md:hidden fixed bottom-16 left-4 right-4 bg-black border-2 border-white/80 rounded-xl p-4 shadow-lg">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-white text-sm">Controls</h3>
                                    <button
                                        className="text-white/80"
                                        onClick={() => setShowFloatingControls(false)}
                                    >
                                        ✕
                                    </button>
                                </div>
                                <Controls
                                    frameWidth={frameWidth}
                                    setFrameWidth={setFrameWidth}
                                    isCentered={isCentered}
                                    setIsCentered={setIsCentered}
                                    handleExport={handleExport}
                                    exportButtonText={exportButtonText}
                                />
                            </div>
                        )}
                    </div>
                </div>,
                modalRoot
            )}
        </>
    );
}