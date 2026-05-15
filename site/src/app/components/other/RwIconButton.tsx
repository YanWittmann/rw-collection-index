"use client"

import React, { useState } from "react"
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

const BORDER_COLORS: Record<RwIconButtonVariant, Record<'default' | 'hover' | 'selected', string>> = {
    default: {
        default:  'rgba(255,255,255,0.5)',
        hover:    'rgba(255,255,255,0.75)',
        selected: 'rgba(255,255,255,0.9)',
    },
    gold: {
        default:  'rgba(255,200,0,0.9)',
        hover:    'rgba(255,215,0,1)',
        selected: 'rgba(255,215,0,1)',
    },
}

export const RwIconButton = React.forwardRef<HTMLButtonElement, RwIconButtonProps>(function RwIconButton({
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
    ...rest
}: RwIconButtonProps, ref) {
    const resolvedPadding = padding ?? (size === 'small' ? 'p-2' : 'p-3')
    const [isHovering, setIsHovering] = useState(false)

    const animState  = selected ? 'selected' : isHovering ? 'hover' : 'default'
    const isActive   = animState !== 'default'
    const bgScale    = isActive ? 1 + 0.10 * expandedScaleFactor : 1
    const borderScale = isActive ? 1 + 0.12 * expandedScaleFactor : 1
    const borderColor = BORDER_COLORS[variant][animState]
    const bgColor     = animState === 'selected' ? 'rgb(64,64,64)' : 'black'

    // Pulse layer: animated via CSS @keyframes rw-pulse (defined in index.css) when hovering.
    // opacity/transform use CSS transition when not hovering.
    const pulseOpacity   = animState === 'default' ? 0 : animState === 'selected' ? 0.8 : undefined
    const pulseScale     = animState === 'default' ? 0.9 : 0.95
    const pulseBorder    = animState === 'default' ? undefined
        : variant === 'gold'
            ? (animState === 'selected' ? 'rgba(255,215,0,1)' : 'rgba(255,200,0,0.6)')
            : (animState === 'selected' ? 'rgba(255,255,255,1)' : undefined)
    const pulseAnimation = animState === 'hover' ? 'rw-pulse 0.35s ease-in-out infinite' : 'none'
    const pulseTransition = animState !== 'hover' ? 'opacity 80ms ease, transform 80ms ease' : 'transform 80ms ease'

    return (
        <button
            ref={ref}
            {...rest}
            className={cn(
                "relative p-0 flex items-center justify-center",
                className,
                square
                    ? size === 'small' ? "aspect-square h-8 w-8" : "aspect-square h-12 w-12"
                    : size === 'small' ? "h-8 min-w-[2rem]" : "h-12 min-w-[3rem]",
            )}
            onClick={onClick}
            onMouseEnter={() => { setIsHovering(true); onMouseEnter?.() }}
            onMouseLeave={() => { setIsHovering(false); onMouseLeave?.() }}
            aria-label={ariaLabel}
        >
            {/* Background layer */}
            <div
                className="absolute inset-0 rounded-xl"
                style={{
                    transform: `scale(${bgScale})`,
                    backgroundColor: bgColor,
                    transformOrigin: 'center',
                    transition: 'transform 200ms ease, background-color 200ms ease',
                }}
            />

            {/* Outer border layer */}
            <div
                className={cn(
                    "absolute inset-0 rounded-xl border-2",
                    variant === 'gold' ? "border-rw-gold/90" : "border-white/50"
                )}
                style={{
                    transform: `scale(${borderScale})`,
                    borderColor,
                    transformOrigin: 'center',
                    transition: 'transform 80ms cubic-bezier(0.5,0,0.1,1.5), border-color 80ms ease',
                }}
            />

            {/* Pulsating inner border — pure CSS animation, no Framer Motion */}
            <div
                className="absolute inset-[3px] rounded-lg border-2 border-white/60"
                style={{
                    opacity: pulseOpacity,
                    transform: `scale(${pulseScale})`,
                    borderColor: pulseBorder,
                    animation: pulseAnimation,
                    transition: pulseTransition,
                }}
            />

            {/* Content */}
            <div
                className={cn(
                    "relative z-10 flex items-center justify-center",
                    square ? "w-full h-full " + resolvedPadding : cn(size === 'small' ? "px-3 py-0 h-8" : "px-4 py-0 h-12", "w-full"),
                )}
            >
                {children}
            </div>
        </button>
    )
})
