"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@shadcn/lib/utils";

interface RwTabButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    selected?: boolean;
    onClick?: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    children?: React.ReactNode;
    "aria-label": string;
    badge?: number;
    showText?: boolean;
}

export function RwTabButton({
                                selected = false,
                                onClick,
                                onMouseEnter,
                                onMouseLeave,
                                className,
                                children,
                                "aria-label": ariaLabel,
                                badge,
                                showText = false,
                            }: RwTabButtonProps) {
    const [isHovering, setIsHovering] = useState(false);

    const contentPadding = "p-2";

    return (
        <motion.button
            className={cn(
                "relative",
                showText ? "px-4 py-2 flex items-center justify-center gap-2 h-10" : "aspect-square h-[2.6rem] w-[2.6rem] p-0 flex items-center justify-center",
                className
            )}
            initial="default"
            animate={selected ? "selected" : isHovering ? "hover" : "default"}
            onClick={onClick}
            onMouseEnter={(e) => {
                setIsHovering(true);
                onMouseEnter && onMouseEnter();
            }}
            onMouseLeave={(e) => {
                setIsHovering(false);
                onMouseLeave && onMouseLeave();
            }}
            aria-label={ariaLabel}
        >
            {/* Background Layer */}
            <motion.div
                className="absolute inset-0 rounded-t-xl bg-black"
                variants={{
                    default: { scale: 1 },
                    hover: { scale: 1.05, y: -2 },
                    selected: { scale: 1.05, y: -2, backgroundColor: "rgb(64, 64, 64)" },
                }}
                style={{ originX: 0.5, originY: 1 }}
            />

            {/* Outer Border Layer */}
            <motion.div
                className="absolute inset-0 rounded-t-xl border-2 border-white/50 border-b-0"
                variants={{
                    default: { scale: 1 },
                    hover: {
                        scale: 1.05,
                        y: -2,
                        borderColor: "rgba(255, 255, 255, 0.75)",
                    },
                    selected: {
                        scale: 1.05,
                        y: -2,
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
                className="absolute inset-[3px] rounded-t-lg border-2 border-white/60 border-b-0"
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
            <div className={cn(
                "relative z-10 flex items-center justify-center",
                showText ? "gap-2" : ("w-full h-full " + contentPadding)
            )}>
                {children}
                {badge && (
                    <span
                        className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                        {badge}
                    </span>
                )}
            </div>
        </motion.button>
    );
}
