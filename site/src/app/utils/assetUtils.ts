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

// The public base path (e.g. "/rw-collection-index"), empty in dev where the app is served at the root.
// All asset URLs are made absolute-from-base so they resolve correctly at any route depth (e.g. on /CC/moon/), which relative paths would not.
const ASSET_BASE = (process.env.PUBLIC_URL || '').replace(/\/+$/, '')

/** Turn a public-folder relative path (e.g. "img/foo.png") into a base-absolute URL. */
export function assetUrl(relativePath: string): string {
    return `${ASSET_BASE}/${relativePath.replace(/^\/+/, '')}`
}

export function resolveAssetUrl(src: string): string {
    const filename = src.split('/').pop() ?? src
    return assetUrl(`img/${filename.includes('.') ? src : src + '.png'}`)
}
