import { cn } from "@shadcn/lib/utils";

interface RwIconButtonProps {
    key: any
    onClick: () => void
    selected: boolean
    children: React.ReactNode
}

export function RwIconButton({
                             key,
                             onClick,
                             selected,
                             children,
                         }: RwIconButtonProps) {
    return (
        <button
            key={key}
            onClick={onClick}
            className={cn(
                "aspect-square bg-black p-2 transition-all w-10 h-10",
                "border border-white/50",
                selected
                    ? "shadow-[0_0_10px_2px_rgba(255,255,255,0.5)] border-white"
                    : "hover:border-white/75 hover:shadow-[0_0_5px_1px_rgba(255,255,255,0.25)]",
            )}
        >
            {children}
        </button>
    )
}