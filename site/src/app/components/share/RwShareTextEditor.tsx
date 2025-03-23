"use client"

import React, { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import RwShareTextSnippet from "./RwShareTextSnippet";
import { Button } from "@shadcn/components/ui/button";

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
}

export const preProcessContent = (text: string) => {
    return "<span class=\"flex gap-1 flex-col\"><span>" + text.replaceAll("\n", "</span><span>") + "</span></span>";
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
                                          }: RwShareTextEditorProps) {
    const [showModal, setShowModal] = useState(false);
    const [content, setContent] = useState(defaultText);
    const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null);

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

    const handleExport = () => {
        onExport?.(content);
        setShowModal(false);
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