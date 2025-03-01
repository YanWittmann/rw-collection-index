"use client"

import * as React from "react"
import { cn } from "@shadcn/lib/utils"

interface RwTextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    onTextInput?: (value: string) => void
}

export function RwTextInput({ onTextInput, className, ...props }: RwTextInputProps) {
    return (
        <div className={cn("relative h-12 w-full rounded-xl", className)}>
            {/* Background Layer */}
            <div className="absolute inset-0 rounded-xl bg-black" />

            {/* Outer Border */}
            <div className="absolute inset-0 rounded-xl border-2 border-white/50" />

            {/* Inner Border */}
            <div className="absolute inset-[3px] rounded-lg border-2 border-white/60" />

            {/* Input element */}
            <input
                className="relative z-10 h-full w-full bg-transparent px-4 py-3 text-white placeholder:text-white/50 focus:outline-none"
                onChange={(e) => onTextInput?.(e.target.value)}
                {...props}
            />
        </div>
    )
}