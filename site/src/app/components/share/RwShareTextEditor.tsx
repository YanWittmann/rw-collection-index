"use client"

import React, { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import RwShareTextSnippet from "./RwShareTextSnippet";
import { Button } from "@shadcn/components/ui/button";
import html2canvas from "html2canvas";

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

const renderIconToCanvas = async (
    type: string,
    color: string | null,
    width: number,
    height: number
): Promise<HTMLCanvasElement> => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    if (!ctx) throw new Error("Could not get canvas context");

    ctx.imageSmoothingEnabled = false;

    // Load the icon image
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.src = `img/${type}.png`;
        image.crossOrigin = "anonymous";
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Failed to load icon image"));
    });

    // Draw the original image onto the canvas
    ctx.drawImage(img, 0, 0, width, height);

    if (color) {
        // Get the image data (to manipulate pixels)
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // Convert color from hex to RGBA
        const rgba = hexToRgba(color);

        const scaleFrom255To1 = (value: number) => value / 255;
        const scaleFrom1To255 = (value: number) => value * 255;

        // Apply the color overlay by replacing non-transparent pixels with the color
        for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] > 0) { // Check if pixel is not fully transparent
                data[i] = scaleFrom1To255(scaleFrom255To1(rgba.r) * scaleFrom255To1(data[i]));
                data[i + 1] = scaleFrom1To255(scaleFrom255To1(rgba.g) * scaleFrom255To1(data[i + 1]));
                data[i + 2] = scaleFrom1To255(scaleFrom255To1(rgba.b) * scaleFrom255To1(data[i + 2]));
                // Maintain the alpha channel (transparency)
            }
        }

        // Put the modified pixel data back to the canvas
        ctx.putImageData(imageData, 0, 0);
    }

    return canvas;
};

// Helper function to convert hex to RGB
const hexToRgba = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b, a: 255 };
};

const replaceIconsWithCanvas = async (container: HTMLElement) => {
    const iconElements = container.querySelectorAll(".rw-icon-container");

    for (const iconElement of Array.from(iconElements)) {
        const type = iconElement.getAttribute("data-type");
        const color = iconElement.getAttribute("data-color");
        const width = iconElement.clientWidth;
        const height = iconElement.clientHeight;

        if (type && width && height) {
            const canvas = await renderIconToCanvas(type, color, width, height);
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
                    <div
                        className="bg-black border-2 border-white/80 rounded-xl shadow-[0_0_10px_rgba(255,255,255,0.1)] w-full max-w-2xl">
                        <div className="flex justify-between items-center py-2 px-4 border-b border-white/20">
                            <h2 className="text-white font-medium">{title}</h2>
                            <div
                                className="cursor-pointer text-white hover:bg-white/10 p-1 rounded"
                                onClick={() => setShowModal(false)}
                            >
                                {closeIcon || "✕"}
                            </div>
                        </div>

                        <div className="overflow-y-auto max-h-[calc(80svh-8rem)]">
                            <div className="p-4">
                                <h3 className="text-white mb-2">Preview:</h3>
                                <RwShareTextSnippet
                                    className="rw-share-text-snippet"
                                    defaultValue={content}
                                    htmlMode={true}
                                    preProcessContent={preProcessContent}
                                    fitContent={true}
                                    leftIcon={leftIcon}
                                    leftText={leftText}
                                    rightIcon={rightIcon}
                                />

                                <div className="mt-6 border-t border-white/20 pt-4">
                                    <h3 className="text-white mb-2">Edit export:</h3>
                                    <RwShareTextSnippet
                                        defaultValue={content}
                                        onChange={setContent}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-white/20 flex justify-end">
                            <Button
                                onClick={handleExport}
                                className="bg-black text-white border border-white/80 hover:bg-black/80"
                            >
                                {exportButtonText}
                            </Button>
                        </div>
                    </div>
                </div>,
                modalRoot
            )}
        </>
    );
}