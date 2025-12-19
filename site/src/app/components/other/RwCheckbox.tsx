"use client"

import type * as React from "react"
import { RwIconButton } from "./RwIconButton"
import { RwIcon } from "../PearlGrid/RwIcon"
import { cn } from "@shadcn/lib/utils"

interface RwCheckboxProps {
    checked: boolean
    onCheckedChange: (checked: boolean) => void
    children: React.ReactNode
    className?: string
    disabled?: boolean
}

export function RwCheckbox({
                               checked,
                               onCheckedChange,
                               children,
                               className,
                               disabled = false
                           }: RwCheckboxProps) {

    const handleToggle = () => {
        if (!disabled) {
            onCheckedChange(!checked)
        }
    }

    return (
        <div
            className={cn(
                "flex gap-4 items-center group select-none",
                disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                className
            )}
            onClick={handleToggle}
        >
            <div className={cn("transition-transform", !disabled && "group-hover:scale-105")}>
                <RwIconButton
                    square={true}
                    selected={false}
                    onClick={() => {
                        handleToggle()
                    }}
                    disabled={disabled}
                    className={cn(disabled ? "pointer-events-none" : "")}
                    aria-label={typeof children === 'string' ? children : "Toggle"}
                >
                    {checked && <RwIcon type="check" />}
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
