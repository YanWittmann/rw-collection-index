export type RwIconType = "pearl" | "broadcast"
    | "LttM-post-collapse" | "LttM-pre-collapse" | "LttM-saint" | "FP"
    | "pin" | "questionmark"

interface RwIconProps {
    color?: string
    type?: RwIconType
}

export function RwIcon({ color, type = "pearl" }: RwIconProps) {
    const imageUrl = `/img/${type}.png`

    if (color) {
        return (
            <div className="relative w-full h-full">
                <div
                    className="absolute inset-0 w-full h-full"
                    style={{
                        backgroundColor: color,
                        maskImage: `url('${imageUrl}')`,
                        WebkitMaskImage: `url('${imageUrl}')`,
                        maskMode: "luminance",
                        maskComposite: "intersect",
                        WebkitMaskComposite: "source-in",
                        maskSize: "cover",
                        WebkitMaskSize: "cover",
                        maskRepeat: "no-repeat",
                        WebkitMaskRepeat: "no-repeat",
                        imageRendering: "pixelated",
                    }}
                />
                <img
                    src={imageUrl || "/placeholder.svg"}
                    alt=""
                    className="absolute inset-0 w-full h-full"
                    style={{
                        opacity: 0,
                        imageRendering: "pixelated",
                    }}
                />
            </div>
        )
    } else {
        return (
            <div className="relative w-full h-full">
                <div
                    className="absolute inset-0 w-full h-full"
                    style={{
                        maskSize: "cover",
                        WebkitMaskSize: "cover",
                        maskRepeat: "no-repeat",
                        WebkitMaskRepeat: "no-repeat",
                        imageRendering: "pixelated",
                    }}
                />
                <img
                    src={imageUrl || "/placeholder.svg"}
                    alt=""
                    className="absolute inset-0 w-full h-full"
                    style={{
                        imageRendering: "pixelated",
                    }}
                />
            </div>
        )
    }
}

