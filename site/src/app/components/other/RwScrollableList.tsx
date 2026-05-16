"use client"

import type React from "react"
import { cn } from "@shadcn/lib/utils"
import { ensureMinLightness } from "../../utils/colorUtils"
import type { GameAsset } from "../../utils/assetUtils"
import { RwAsset } from "./RwAsset"

export interface RwScrollableListItem {
    id: string
    title?: string
    subtitle?: string
    asset?: GameAsset
    color?: string
    onClick?: () => void
    customElement?: React.ReactNode
}

interface RwScrollableListProps {
    items: RwScrollableListItem[]
    className?: string
    itemClassName?: string
    breakSubtitle?: boolean
}

const TAIL_LENGTH = 16;

const ItemSubtitle = ({ text, breakText, color }: { text: string; breakText: boolean; color?: string }) => {
    const style = color ? { color: `color-mix(in srgb, ${color} 30%, rgb(184, 184, 184) 70%)` } : undefined;

    if (breakText) {
        return <div className="text-sm opacity-80 break-words" style={style}>{text}</div>;
    }

    text = text.replace("https://", "")

    const shouldTruncateMiddle = text.length > TAIL_LENGTH + 5;
    const firstPart = shouldTruncateMiddle ? text.slice(0, -TAIL_LENGTH) : text;
    const secondPart = shouldTruncateMiddle ? text.slice(-TAIL_LENGTH) : "";

    return (
        <div className="flex text-sm opacity-80 min-w-0" title={text} style={style}>
            <span className="truncate">{firstPart}</span>
            {secondPart && (
                <span className="flex-shrink-0 whitespace-nowrap">{secondPart}</span>
            )}
        </div>
    );
};

export function RwScrollableList({ items, className, itemClassName, breakSubtitle = true }: RwScrollableListProps) {
    return (
        <div className={cn("relative rounded-xl overflow-hidden", className)}>
            {/* Inner border */}
            <div className="absolute inset-[3px] rounded-lg border-2 border-white/60 pointer-events-none"/>

            {/* Content container */}
            <div className={`overflow-y-auto py-2 relative z-10 no-scrollbar`} style={{ maxHeight: "80svh" }}>
                {items.map((item) => (
                    item.customElement ? (
                        <div key={item.id} className={cn("w-full", itemClassName)}>
                            {item.customElement}
                        </div>
                    ) : (
                        <button
                            key={item.id}
                            className={cn("w-full text-left px-4 py-1 relative group text-white/90 hover:underline flex items-center gap-3", itemClassName, !item.onClick && "cursor-not-allowed")}
                            onClick={item.onClick}
                        >
                            {item.asset && (
                                <RwAsset
                                    {...item.asset}
                                    className="w-10 h-10 rounded-sm flex-shrink-0"
                                />
                            )}
                            <div className="min-w-0">
                                <div className="font-medium" style={{ color: item.color ? ensureMinLightness(item.color) : undefined }}>{item.title}</div>
                                {item.subtitle && (
                                    <ItemSubtitle text={item.subtitle} breakText={breakSubtitle} color={item.color ? ensureMinLightness(item.color) : undefined} />
                                )}
                            </div>
                        </button>
                    )
                ))}
            </div>
        </div>
    )
}
