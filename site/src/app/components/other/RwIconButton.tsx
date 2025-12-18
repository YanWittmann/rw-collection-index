"use client"

import type * as React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@shadcn/lib/utils"

interface RwIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    selected?: boolean
    onClick?: () => void
    onMouseEnter?: () => void
    onMouseLeave?: () => void
    children?: React.ReactNode
    square?: boolean
    padding?: string
    expandedScaleFactor?: number
    'aria-label': string
}

export function RwIconButton({
                                 selected = false,
                                 square = true,
                                 padding = "p-3",
                                 onClick,
                                 onMouseEnter,
                                 onMouseLeave,
                                 className,
                                 children,
                                 expandedScaleFactor = 1,
                                 'aria-label': ariaLabel,
                             }: RwIconButtonProps) {
    const [isHovering, setIsHovering] = useState(false)

    return (
        <motion.button
            className={cn(
                "relative p-0 flex items-center justify-center",
                className,
                square ? "aspect-square h-12 w-12" : "h-12 min-w-[3rem]",
            )}
            initial="default"
            animate={selected ? "selected" : isHovering ? "hover" : "default"}
            onClick={onClick}
            onMouseEnter={(e) => {
                setIsHovering(true)
                onMouseEnter && onMouseEnter()
            }}
            onMouseLeave={(e) => {
                setIsHovering(false)
                onMouseLeave && onMouseLeave()
            }}
            aria-label={ariaLabel}
        >
            {/* Background Layer */}
            <motion.div
                className="absolute inset-0 rounded-xl bg-black"
                variants={{
                    default: { scale: 1 },
                    hover: { scale: 1 + 0.1 * expandedScaleFactor },
                    selected: { scale: 1 + 0.1 * expandedScaleFactor, backgroundColor: "rgb(64, 64, 64)" },
                }}
                style={{ originX: 0.5, originY: 0.5 }} // center the scale transformation
            />

            {/* Outer Border Layer */}
            <motion.div
                className="absolute inset-0 rounded-xl border-2 border-white/50"
                variants={{
                    default: { scale: 1 },
                    hover: {
                        scale: 1 + 0.12 * expandedScaleFactor,
                        borderColor: "rgba(255, 255, 255, 0.75)",
                    },
                    selected: {
                        scale: 1 + 0.12 * expandedScaleFactor,
                        borderColor: "rgba(255, 255, 255, 0.9)",
                    },
                }}
                transition={{
                    type: "spring",
                    stiffness: 2000,
                    damping: 26,
                }}
            />

            {/* Pulsating Inner Border */}
            <motion.div
                className="absolute inset-[3px] rounded-lg border-2 border-white/60"
                variants={{
                    default: { opacity: 0, scale: 0.9 },
                    hover: {
                        scale: 0.95,
                        opacity: [0, 1, 0],
                        transition: {
                            opacity: {
                                repeat: Number.POSITIVE_INFINITY,
                                duration: 0.35,
                            },
                        },
                    },
                    selected: {
                        scale: 0.95,
                        opacity: 0.8,
                        borderColor: "rgba(255, 255, 255, 1)",
                    },
                }}
            />

            {/* Content container */}
            <div
                className={cn(
                    "relative z-10 flex items-center justify-center",
                    square ? "w-full h-full " + padding : "px-4 py-3",
                )}
            >
                {children}
            </div>
        </motion.button>
    )
}