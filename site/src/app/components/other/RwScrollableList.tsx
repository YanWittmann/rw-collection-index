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
    activeId?: string
    /** Removes the decorative border and fills the parent container's height instead of capping at 80svh */
    noBorder?: boolean
    assetVariant?: 'default' | 'title-pre' | 'title-post'
    /** Rendered inside the styled container above the items, separated by a border */
    header?: React.ReactNode
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

interface RwScrollableListEntryProps {
    item: RwScrollableListItem
    className?: string
    active?: boolean
    breakSubtitle?: boolean
    assetVariant?: 'default' | 'title-pre' | 'title-post'
}

export function RwScrollableListEntry({ item, className, active, breakSubtitle = true, assetVariant = 'default' }: RwScrollableListEntryProps) {
    const titleColor = item.color ? ensureMinLightness(item.color) : undefined;
    const inlineTitleIcon = item.asset && (assetVariant === 'title-pre' || assetVariant === 'title-post') && (
        <RwAsset {...item.asset} className="w-4 h-4 rounded-sm flex-shrink-0" />
    );
    return (
        <button
            className={cn("w-full text-left px-4 py-1 relative group text-white/90 hover:underline flex items-center gap-3", className, !item.onClick && "cursor-default", active && "bg-white/10")}
            onClick={item.onClick}
        >
            {item.asset && assetVariant === 'default' && (
                <RwAsset
                    {...item.asset}
                    className="w-10 h-10 rounded-sm flex-shrink-0"
                />
            )}
            <div className="min-w-0">
                <div className="font-medium flex items-center gap-1.5" style={{ color: titleColor }}>
                    {assetVariant === 'title-pre' && inlineTitleIcon}
                    {item.title}
                    {assetVariant === 'title-post' && inlineTitleIcon}
                </div>
                {item.subtitle && (
                    <ItemSubtitle text={item.subtitle} breakText={breakSubtitle} color={item.color ? ensureMinLightness(item.color) : undefined} />
                )}
            </div>
        </button>
    );
}

export function RwScrollableList({ items, className, itemClassName, breakSubtitle = true, activeId, noBorder, assetVariant, header }: RwScrollableListProps) {
    const hasHeader = !!header;
    return (
        <div className={cn(
            noBorder
                ? cn("overflow-hidden", hasHeader ? "flex flex-col h-full" : "h-full")
                : "relative rounded-xl overflow-hidden",
            className
        )}>
            {!noBorder && (
                <div className="absolute inset-[3px] rounded-lg border-2 border-white/60 pointer-events-none"/>
            )}

            {hasHeader && (
                <div className="relative z-10 border-b-2 border-white/60 flex-shrink-0">
                    {header}
                </div>
            )}

            <div
                className={cn("overflow-y-auto pt-2 pb-3 relative z-10 no-scrollbar", noBorder ? (hasHeader ? "flex-1" : "h-full") : undefined)}
                style={noBorder ? undefined : { maxHeight: "80svh" }}
            >
                {items.map((item) => (
                    item.customElement ? (
                        <div key={item.id} className={cn("w-full", itemClassName)}>
                            {item.customElement}
                        </div>
                    ) : (
                        <RwScrollableListEntry
                            key={item.id}
                            item={item}
                            className={itemClassName}
                            active={item.id === activeId}
                            breakSubtitle={breakSubtitle}
                            assetVariant={assetVariant}
                        />
                    )
                ))}
            </div>
        </div>
    )
}
