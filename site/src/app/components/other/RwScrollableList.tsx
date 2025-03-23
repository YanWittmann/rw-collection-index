"use client"
import { cn } from "@shadcn/lib/utils"

export interface RwScrollableListItem {
    id: string
    title?: string
    subtitle?: string
    onClick?: () => void
    customElement?: React.ReactNode
}

interface RwScrollableListProps {
    items: RwScrollableListItem[]
    maxHeight?: string
    className?: string
    itemClassName?: string
}

export function RwScrollableList({ items, maxHeight = "340px", className, itemClassName }: RwScrollableListProps) {
    return (
        <div className={cn("relative rounded-xl overflow-hidden", className)}>
            {/* Inner border */}
            <div className="absolute inset-[3px] rounded-lg border-2 border-white/60 pointer-events-none" />

            {/* Content container */}
            <div className={`max-h-[${maxHeight}] overflow-y-auto py-2 relative z-10 no-scrollbar`}>
                {items.map((item) => (
                    item.customElement ? (
                        <div key={item.id} className={cn("w-full", itemClassName)}>
                            {item.customElement}
                        </div>
                    ) : (
                        <button
                            key={item.id}
                            className={cn("w-full text-left px-4 py-1 relative group text-white/90 hover:underline", itemClassName)}
                            onClick={item.onClick}
                        >
                            <div className="font-medium">{item.title}</div>
                            {item.subtitle && <div className="text-sm opacity-80">{item.subtitle}</div>}
                        </button>
                    )
                ))}
            </div>
        </div>
    )
}