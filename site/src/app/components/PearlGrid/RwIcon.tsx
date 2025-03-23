interface RwIconProps {
    color?: string
    type?: string
}

export function RwIcon({ color, type = "pearl" }: RwIconProps) {
    const imageUrl = `img/${type}.png`

    if (color) {
        return (
            <div
                className="rw-icon-container"
                data-type={type}
                data-color={color}
                style={{ width: "100%", height: "100%" }}
            >
                <div className="relative w-full h-full">
                    <div
                        className="absolute inset-0 w-full h-full"
                        style={{
                            backgroundColor: color,
                            maskImage: `url('img/${type}.png')`,
                            WebkitMaskImage: `url('img/${type}.png')`,
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
                        src={`img/${type}.png` || "/placeholder.svg"}
                        alt=""
                        className="absolute inset-0 w-full h-full"
                        style={{
                            opacity: 0,
                            imageRendering: "pixelated",
                        }}
                    />
                </div>
            </div>
        );
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

