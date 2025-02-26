"use client"

import type * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@shadcn/lib/utils";

interface RwIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    selected?: boolean
    onClick?: () => void
    children?: React.ReactNode
}

export function RwIconButton({ selected = false, onClick, className, children }: RwIconButtonProps) {
    return (
        <motion.button
            className={cn("relative aspect-square h-12 w-12 p-0", className)}
            initial="default"
            whileHover={selected ? "selected" : "hover"}
            animate={selected ? "selected" : "default"}
            onClick={onClick}
        >
            {/* Background */}
            <motion.div
                className="absolute inset-0 rounded-xl bg-black"
                variants={{
                    default: {
                        scale: 1,
                        backgroundColor: "rgb(0, 0, 0)",
                    },
                    hover: {
                        scale: 1.1,
                        backgroundColor: "rgb(0, 0, 0)",
                    },
                    selected: {
                        scale: 1.1,
                        backgroundColor: "rgb(64, 64, 64)",
                    },
                }}
            />

            {/* Outer border */}
            <motion.div
                className="absolute inset-0 rounded-xl border-2 border-white/50"
                variants={{
                    default: {
                        scale: 1,
                        borderColor: "rgba(255, 255, 255, 0.5)",
                    },
                    hover: {
                        scale: 1.12,
                        borderColor: "rgba(255, 255, 255, 0.75)",
                        transition: {
                            type: "spring",
                            stiffness: 2000,
                            damping: 26,
                        },
                    },
                    selected: {
                        scale: 1.12,
                        borderColor: "rgba(255, 255, 255, 0.9)",
                        transition: {
                            type: "spring",
                            stiffness: 2000,
                            damping: 26,
                        },
                    },
                }}
            />

            {/* Inner border that pulsates */}
            <motion.div
                className="absolute inset-[3px] rounded-lg border-2 border-white/60"
                variants={{
                    default: {
                        opacity: 0.0,
                        scale: 0.9,
                    },
                    hover: {
                        scale: 0.95,
                        opacity: [0, 1, 0],
                        transition: {
                            opacity: {
                                repeat: Number.POSITIVE_INFINITY,
                                duration: 0.35,
                                ease: "linear",
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
            <div className="absolute inset-0 flex items-center justify-center p-3">{children}</div>
        </motion.button>
    )
}