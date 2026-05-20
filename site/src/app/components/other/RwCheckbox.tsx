"use client"

import type * as React from "react"
import { RwIconButton } from "./RwIconButton"
import { RwAsset } from "./RwAsset"
import { cn } from "@shadcn/lib/utils"

interface RwCheckboxProps {
    checked: boolean
    onCheckedChange: (checked: boolean) => void
    children: React.ReactNode
    className?: string
    disabled?: boolean
    size?: 'default' | 'small' | 'xsmall'
}

export function RwCheckbox({
                               checked,
                               onCheckedChange,
                               children,
                               className,
                               disabled = false,
                               size = 'default',
                           }: RwCheckboxProps) {

    const handleToggle = () => {
        if (!disabled) {
            onCheckedChange(!checked)
        }
    }

    return (
        <div
            className={cn(
                "flex items-center group select-none",
                size === 'xsmall' ? "gap-2" : size === 'small' ? "gap-3" : "gap-4",
                disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                className
            )}
            onClick={handleToggle}
        >
            <div className={cn("transition-transform", !disabled && "group-hover:scale-105")} onClick={e => e.stopPropagation()}>
                <RwIconButton
                    square={true}
                    size={size}
                    selected={false}
                    onClick={() => {
                        handleToggle()
                    }}
                    disabled={disabled}
                    className={cn(disabled ? "pointer-events-none" : "")}
                    aria-label={typeof children === 'string' ? children : "Toggle"}
                >
                    {checked && <RwAsset src="check" className={size === 'xsmall' ? 'w-3 h-3' : undefined} />}
                </RwIconButton>
            </div>

            <span className={cn(
                "text-white/90 transition-colors",
                !disabled && "group-hover:text-white"
            )}>
                {children}
            </span>
        </div>
    )
}
