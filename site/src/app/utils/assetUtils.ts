export type AssetTint =
    | { mode: "mask"; color: string }
    | { mode: "natural" }

export interface GameAsset {
    src: string
    tint?: AssetTint
    fit?: "fill" | "cover" | "contain"
}

export const Tint = {
    mask: (color: string | undefined): AssetTint | undefined => color ? { mode: "mask", color } : undefined,
    natural: (): AssetTint => ({ mode: "natural" }),
} as const

export function resolveAssetUrl(src: string): string {
    const filename = src.split('/').pop() ?? src
    return `img/${filename.includes('.') ? src : src + '.png'}`
}
