"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { cn } from "@shadcn/lib/utils";

interface RwShareTextSnippetProps {
    defaultValue?: string
    onChange?: (value: string) => void
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
    leftText?: string
    className?: string
    htmlMode?: boolean
    renderHtml?: (content: string) => string
    preProcessContent?: (rawText: string) => string
    fitContent?: boolean
    centered?: boolean
    customWidth?: number
}

export default function RwShareTextSnippet({
                                               defaultValue = "",
                                               onChange,
                                               leftIcon,
                                               rightIcon,
                                               leftText,
                                               className,
                                               htmlMode = false,
                                               renderHtml,
                                               preProcessContent,
                                               fitContent = false,
                                               centered = false,
                                               customWidth = 100,
                                           }: RwShareTextSnippetProps) {
    const [value, setValue] = useState(defaultValue);
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        setValue(defaultValue)
    }, [defaultValue])

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto"
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
        }
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value
        setValue(newValue)
        onChange?.(newValue)
    }

    return (
        <div className={cn(fitContent ? "inline-flex max-w-full" : "w-auto min-w-[300px] max-w-full", className)}
             style={{ width: customWidth !== 100 ? `${customWidth}%` : undefined }}>
            <div
                className={cn(
                    "bg-black border-2 border-white/80 rounded-xl px-3 text-white text-sm relative shadow-[0_0_10px_rgba(255,255,255,0.1)]",
                    "pb-4 pt-2",
                )}
            >
                <div className="flex flex-col gap-3">
                    {htmlMode ? (
                        <div
                            className={cn(
                                "rw-text-font px-1 min-h-[20px] whitespace-pre-wrap",
                                centered && "text-center"
                            )}
                            dangerouslySetInnerHTML={{
                                __html: renderHtml
                                    ? renderHtml(preProcessContent ? preProcessContent(value) : value)
                                    : (preProcessContent ? preProcessContent(value) : value)
                            }}
                        />
                    ) : (
                        <textarea
                            ref={textareaRef}
                            value={value}
                            onChange={handleChange}
                            className={cn(
                                "bg-transparent resize-none outline-none rw-text-font min-h-[20px] px-1 overflow-hidden",
                                centered && "text-center"
                            )}
                            style={{
                                width: fitContent ? "auto" : "100%",
                                minWidth: fitContent ? "0" : "300px",
                                maxWidth: "100%",
                            }}
                            placeholder="Enter text here..."
                        />
                    )}

                    {(leftIcon || rightIcon) && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 px-1">
                                {leftIcon && <div className="flex-shrink-0 h-4 w-4">{leftIcon}</div>}
                                {leftText && <span className="text-gray-400 text-xs">{leftText}</span>}
                            </div>
                            {rightIcon && <div className="flex-shrink-0 h-4 w-4">{rightIcon}</div>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
