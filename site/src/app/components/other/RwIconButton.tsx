"use client"

import type * as React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@shadcn/lib/utils"

type RwIconButtonVariant = 'default' | 'gold'

interface RwIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    selected?: boolean
    onClick?: () => void
    onMouseEnter?: () => void
    onMouseLeave?: () => void
    children?: React.ReactNode
    square?: boolean
    size?: 'default' | 'small'
    padding?: string
    expandedScaleFactor?: number
    variant?: RwIconButtonVariant
    'aria-label': string
}

export function RwIconButton({
                                 selected = false,
                                 square = true,
                                 size = 'default',
                                 padding,
                                 onClick,
                                 onMouseEnter,
                                 onMouseLeave,
                                 className,
                                 children,
                                 expandedScaleFactor = 1,
                                 variant = 'default',
                                 'aria-label': ariaLabel,
                             }: RwIconButtonProps) {
    const resolvedPadding = padding ?? (size === 'small' ? 'p-2' : 'p-3')
    const borderDefault  = variant === 'gold' ? 'rgba(255,200,0,0.9)'     : 'rgba(255,255,255,0.5)'
    const borderHover    = variant === 'gold' ? 'rgba(255,215,0,1)'       : 'rgba(255,255,255,0.75)'
    const borderSelected = variant === 'gold' ? 'rgba(255,215,0,1)'       : 'rgba(255,255,255,0.9)'
    const [isHovering, setIsHovering] = useState(false)

    return (
        <motion.button
            className={cn(
                "relative p-0 flex items-center justify-center",
                className,
                square
                    ? size === 'small' ? "aspect-square h-8 w-8" : "aspect-square h-12 w-12"
                    : size === 'small' ? "h-8 min-w-[2rem]" : "h-12 min-w-[3rem]",
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
                className={cn(
                    "absolute inset-0 rounded-xl border-2",
                    variant === 'gold' ? "border-rw-gold/90" : "border-white/50"
                )}
                variants={{
                    default: { scale: 1, borderColor: borderDefault },
                    hover: { scale: 1 + 0.12 * expandedScaleFactor, borderColor: borderHover },
                    selected: { scale: 1 + 0.12 * expandedScaleFactor, borderColor: borderSelected },
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
                    square ? "w-full h-full " + resolvedPadding : size === 'small' ? "px-3 py-1.5" : "px-4 py-3",
                )}
            >
                {children}
            </div>
        </motion.button>
    )
}