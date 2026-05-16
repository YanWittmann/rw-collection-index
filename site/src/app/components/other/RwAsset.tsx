"use client"

import type { CSSProperties } from "react"
import { cn } from "@shadcn/lib/utils"
import type { GameAsset } from "../../utils/assetUtils"
import { resolveAssetUrl } from "../../utils/assetUtils"

export interface RwAssetProps extends GameAsset {
    alt?: string
    className?: string
    onError?: () => void
}

export function RwAsset({ src, tint, fit = "fill", alt = "", className, onError }: RwAssetProps) {
    const url = resolveAssetUrl(src)

    const maskSize = fit === "fill" ? "100% 100%" : fit === "contain" ? "contain" : "cover"
    const objectFit: CSSProperties["objectFit"] = fit === "fill" ? "fill" : fit === "contain" ? "contain" : "cover"

    if (tint?.mode === "mask") {
        return (
            <div
                className={cn("rw-icon-container relative overflow-hidden w-full h-full", className)}
                data-type={src}
                data-color={tint.color}
            >
                <div
                    className="absolute inset-0 w-full h-full"
                    style={{
                        backgroundColor: tint.color,
                        maskImage: `url('${url}')`,
                        WebkitMaskImage: `url('${url}')`,
                        maskMode: "luminance",
                        maskComposite: "intersect",
                        WebkitMaskComposite: "source-in",
                        maskSize,
                        WebkitMaskSize: maskSize,
                        maskPosition: "center",
                        WebkitMaskPosition: "center",
                        maskRepeat: "no-repeat",
                        WebkitMaskRepeat: "no-repeat",
                        imageRendering: "pixelated",
                    }}
                />
                <img
                    src={url}
                    alt={alt}
                    className="absolute inset-0 w-full h-full opacity-0"
                    style={{ imageRendering: "pixelated" }}
                    onError={onError}
                />
            </div>
        )
    }

    return (
        <div className={cn("relative overflow-hidden w-full h-full", className)}>
            <img
                src={url}
                alt={alt}
                className="absolute inset-0 w-full h-full"
                style={{ imageRendering: "pixelated", objectFit }}
                onError={onError}
            />
        </div>
    )
}
