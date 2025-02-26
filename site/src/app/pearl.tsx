interface PearlProps {
    color: string
    type?: "pearl" | "broadcast"
}

export function Pearl({ color, type = "pearl" }: PearlProps) {
    const imageUrl = `/img/${type}.png`;

    return (
        <div className="relative w-full h-full">
            <div
                className="absolute inset-0 w-full h-full"
                style={{
                    backgroundColor: color,
                    maskImage: `url('${imageUrl}')`,
                    WebkitMaskImage: `url('${imageUrl}')`,
                    maskMode: 'luminance',
                    maskComposite: 'intersect',
                    WebkitMaskComposite: 'source-in',
                    maskSize: 'cover',
                    WebkitMaskSize: 'cover',
                    maskRepeat: 'no-repeat',
                    WebkitMaskRepeat: 'no-repeat',
                    imageRendering: 'pixelated',
                }}
            />
            <img
                src={imageUrl}
                alt=""
                className="absolute inset-0 w-full h-full"
                style={{
                    opacity: 0,
                    imageRendering: 'pixelated',
                }}
            />
        </div>
    )
}