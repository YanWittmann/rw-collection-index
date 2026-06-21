/**
 * Central routing module: the single source of truth for translating between
 * application state and URLs, in BOTH directions.
 *
 * This module is intentionally pure: no DOM, no `window`, no `process.env`. It
 * deals only in base-relative path strings (e.g. "/modded/CC/moon/"). The public
 * base ("/rw-collection-index") is injected at the edges:
 *   - the browser app via routing/browserRouting.ts (uses process.env.PUBLIC_URL),
 *   - the build via generate-routes.ts (reads homepage from package.json).
 *
 * It is consumed by:
 *   - the React app (URL <-> selection sync, legacy URL upgrades),
 *   - the build enumerator (HTML pages, sitemap, manifest).
 *
 * Route shape (see tmp/routing-refactor.md):
 *   [/<datasetPrefix>] / <entryId> [ / <transcriberSlug> ]   (+ optional ?source=...)
 *   - vanilla dataset has no prefix (served at root); modded -> /modded.
 *   - the transcriber segment is omitted when it is the default (last) transcriber.
 *   - `source` is a query param, never a path segment.
 */

import { PearlData, Dialogue } from '../types/types';
import { getEffectiveTranscriberName, findTranscriberIndex } from '../utils/transcriberUtils';
import { speakerByAlias } from '../utils/speakers';
import { cleanText, extractContent } from '../utils/dialogueParsing';
import { renderDialogueLine } from '../utils/renderDialogueLine';
import { isCompressedImgPath } from '../utils/assetUtils';
import {
    DEFAULT_DATASET_KEY,
    DATASET_PREFIXES,
    getDataset,
    getDatasetByPrefix,
} from './datasets';

/**
 * The canonical, app-internal description of "what is being viewed".
 * Values here are app identities, not URL-encoded: `entryId` is the item url id (a transcriber/pearl internalId or the pearl id);
 * `transcriberName` is the effective transcriber name (with the "-<index>" suffix for duplicates).
 */
export interface RouteParams {
    datasetKey: string;
    entryId: string | null;
    transcriberName: string | null;
    source: string | null;
}

export interface ResolvedRoute {
    pearl: PearlData;
    transcriberName: string | null;
    source: string | null;
}

export interface RouteDescriptor {
    /** Base-relative path with leading and trailing slash, e.g. "/modded/CC/moon/". */
    path: string;
    datasetKey: string;
    entryId: string;
    /** The id of the pearl this route belongs to, used by the build to assert correct resolution. */
    pearlId: string;
    /** null = entry-level (canonical) route; otherwise the transcriber this page shows. */
    transcriberName: string | null;
    title: string;
    description: string;
    /** Absolute or base-relative og:image; null = use the site default (filled in later). */
    ogImage: string | null;
    /** Whether this route is the canonical page for its content: each transcriber page is, the bare entry alias is not (unless the entry has no transcribers). */
    isCanonical: boolean;
    /** The canonical path for this route: its own path for canonical routes, the default transcriber's for the bare entry alias. */
    canonicalPath: string;
}

// --- segment encoding ------------------------------------------------------

function encodeSegment(value: string): string {
    return encodeURIComponent(value);
}

function decodeSegment(value: string): string {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

// --- transcriber slug (effective name -> URL segment) ----------------------
// Effective names are either "raw" or "raw-<index>" (for duplicate transcribers).
// The slug comes from the speaker definition (resolved through aliases via
// speakerByAlias), so every spelling of a speaker collapses to one slug, and the
// duplicate "-<index>" suffix is preserved. The reverse direction is pearl-scoped:
// resolveTranscriberName matches a URL segment against this pearl's transcribers by
// comparing their computed slugs, so no global slug -> name map is needed.

/** The URL slug for a transcriber's base name (its SpeakerDef.urlSlug), or the name unchanged. */
function slugForName(name: string): string {
    return speakerByAlias.get(name)?.urlSlug ?? name;
}

function effectiveNameToSlug(effectiveName: string): string {
    const indexed = effectiveName.match(/^(.*)-(\d+)$/);
    if (indexed) return `${slugForName(indexed[1])}-${indexed[2]}`;
    return slugForName(effectiveName);
}

// --- entry id (unique, dataset-aware) --------------------------------------
//
// The entry id is the URL segment that identifies a pearl. We want pretty ids
// (the in-game internalId, e.g. "CC") but they MUST be unique: several distinct
// pearls can legitimately share an internalId (e.g. all 18 "PebblesPearl_*"
// readings share internalId "PebblesPearl"). So we keep the preferred id only
// when it is unique within the dataset, and otherwise fall back to pearl.id,
// which is unique by construction. Old ?item= links still resolve regardless,
// because findPearlByUrlId() matches id, internalId and transcriber internalId.

/** The preferred (pretty) id for a pearl, before uniqueness is enforced. */
function preferredEntryId(pearl: PearlData): string {
    const transcribers = pearl.transcribers;
    const last = transcribers.length ? transcribers[transcribers.length - 1] : null;
    return (last?.metadata?.internalId) || pearl.metadata.internalId || pearl.id;
}

/** Map each pearl to a unique entry id for its dataset (pretty where possible). */
function buildEntryIdMap(pearls: PearlData[]): Map<PearlData, string> {
    const counts = new Map<string, number>();
    for (const pearl of pearls) {
        const candidate = preferredEntryId(pearl);
        counts.set(candidate, (counts.get(candidate) || 0) + 1);
    }
    const map = new Map<PearlData, string>();
    for (const pearl of pearls) {
        const candidate = preferredEntryId(pearl);
        map.set(pearl, counts.get(candidate) === 1 ? candidate : pearl.id);
    }
    return map;
}

// Cache the per-dataset map by the pearls array identity, so repeated calls from
// the app (e.g. on every selection change) don't rebuild it.
const entryIdMapCache = new WeakMap<PearlData[], Map<PearlData, string>>();

function getEntryIdMap(pearls: PearlData[]): Map<PearlData, string> {
    let map = entryIdMapCache.get(pearls);
    if (!map) {
        map = buildEntryIdMap(pearls);
        entryIdMapCache.set(pearls, map);
    }
    return map;
}

/** The unique entry id for a pearl within its dataset. */
export function entryIdForPearl(pearl: PearlData, pearls: PearlData[]): string {
    return getEntryIdMap(pearls).get(pearl) ?? (pearl.metadata.internalId || pearl.id);
}

// --- transcriber helpers ---------------------------------------------------

function effectiveNames(pearl: PearlData): string[] {
    return pearl.transcribers.map((t, i) => getEffectiveTranscriberName(pearl.transcribers, t.transcriber, i));
}

// --- building paths --------------------------------------------------------

/** Base-relative path (no source). Always leading slash; trailing slash when non-root. */
export function buildRoutePath(params: RouteParams): string {
    const dataset = getDataset(params.datasetKey);
    const segments: string[] = [];

    if (dataset && dataset.routePrefix) segments.push(dataset.routePrefix);

    if (params.entryId) {
        segments.push(encodeSegment(params.entryId));
        if (params.transcriberName) {
            segments.push(encodeSegment(effectiveNameToSlug(params.transcriberName)));
        }
    }

    return '/' + (segments.length ? segments.join('/') + '/' : '');
}

export function buildRouteQuery(params: RouteParams): string {
    if (!params.source) return '';
    const search = new URLSearchParams();
    search.set('source', params.source);
    return '?' + search.toString();
}

/** Full base-relative route (path + ?source). Use for history.replaceState (after adding the base). */
export function buildRoute(params: RouteParams): string {
    return buildRoutePath(params) + buildRouteQuery(params);
}

/**
 * Build the canonical RouteParams from live application state.
 * This is the inverse used by the URL-sync hook.
 * It derives the unique entry id and omits the transcriber segment when it is the default one.
 * The full pearl list is needed so the entry id can be made unique within the dataset.
 */
export function paramsFromState(opts: {
    datasetKey: string;
    pearl: PearlData | null;
    transcriberName: string | null;
    source: string | null;
    pearls: PearlData[];
}): RouteParams {
    const { datasetKey, pearl, transcriberName, source, pearls } = opts;
    if (!pearl) {
        return { datasetKey, entryId: null, transcriberName: null, source: null };
    }
    return {
        datasetKey,
        entryId: entryIdForPearl(pearl, pearls),
        // Keep the transcriber in the URL even when it is the default (last) one.
        // Readers navigate by transcriber, so the address bar should always reflect which one is shown.
        transcriberName,
        // The source only makes sense with a selection, so it is dropped on the dataset root.
        source: source ?? null,
    };
}

// --- parsing paths ---------------------------------------------------------

/**
 * Parse a base-relative path (base already stripped) plus the query string into
 * RouteParams. Unknown leading segments fall back to the default dataset.
 */
export function parseRoutePath(routePath: string, search = ''): RouteParams {
    const parts = routePath.split('/').filter(Boolean).map(decodeSegment);

    let datasetKey = DEFAULT_DATASET_KEY;
    let offset = 0;
    if (parts.length && DATASET_PREFIXES.includes(parts[0])) {
        const dataset = getDatasetByPrefix(parts[0]);
        if (dataset) {
            datasetKey = dataset.key;
            offset = 1;
        }
    }

    const entryId = parts[offset] ?? null;
    // The transcriber segment may be a slug or a raw effective name; it is resolved
    // against the actual pearl in resolveTranscriberName (pearl-scoped), so it is passed through as-is.
    const transcriberName = parts[offset + 1] ?? null;
    const source = new URLSearchParams(search).get('source');

    return { datasetKey, entryId, transcriberName, source: source ?? null };
}

/**
 * Parse legacy query-param URLs (?d=&item=&transcriber=&source=, plus the dead
 * ?pearl=) into RouteParams, so they can be resolved and upgraded to the new
 * path scheme. Returns null when no legacy params are present.
 */
export function parseLegacyParams(search: string): RouteParams | null {
    const params = new URLSearchParams(search);
    const item = params.get('item') || params.get('pearl');
    const datasetParam = params.get('d');
    const transcriber = params.get('transcriber');
    const source = params.get('source');
    // Only an entry-defining param (?item= / ?pearl=) marks a URL as legacy.
    // `source` is also a query param in the NEW scheme (e.g. /CC/?source=7.txt), so it must
    // never on its own trigger the legacy path, or a reload would discard the path entry id.
    if (!item) return null;

    const datasetKey = datasetParam && getDataset(datasetParam) ? datasetParam : DEFAULT_DATASET_KEY;
    return {
        datasetKey,
        entryId: item,
        transcriberName: transcriber,
        source: source ?? null,
    };
}

// --- resolving against the dataset -----------------------------------------

function findPearlByUrlId(id: string, pearls: PearlData[]): PearlData | null {
    for (const pearl of pearls) {
        if (pearl.id === id || pearl.metadata.internalId === id) return pearl;
        for (const transcriber of pearl.transcribers) {
            if (transcriber.metadata.internalId === id) return pearl;
        }
    }
    return null;
}

/**
 * Resolve a requested transcriber name to a valid effective name for this pearl,
 * defaulting to the last transcriber when the request is missing or invalid.
 */
function resolveTranscriberName(pearl: PearlData, requested: string | null): string | null {
    const names = effectiveNames(pearl);
    if (!names.length) return null;
    if (requested) {
        // The requested segment may be a slug or a raw effective name.
        // Match it against this pearl's transcribers by name or by computed slug.
        const match = names.find(name => name === requested || effectiveNameToSlug(name) === requested);
        if (match) return match;
    }
    return names[names.length - 1];
}

/**
 * Turn parsed RouteParams into a concrete selection (pearl + transcriber + source),
 * or null when the entry cannot be found. Replaces the old findPearlByUrlId +
 * getActiveTranscriber logic that lived inside AppContext.
 */
export function resolveRoute(params: RouteParams, pearls: PearlData[]): ResolvedRoute | null {
    if (!params.entryId) return null;
    const pearl = findPearlByUrlId(params.entryId, pearls);
    if (!pearl) return null;
    return {
        pearl,
        transcriberName: resolveTranscriberName(pearl, params.transcriberName),
        source: params.source,
    };
}

// --- enumeration (used by the build) ---------------------------------------

export const SITE_NAME = 'Rain World Collection Index';

export interface RouteMeta {
    title: string;
    description: string;
    /** Absolute or base-relative og:image; null = use the site default. */
    ogImage: string | null;
}

function truncate(value: string, max = 200): string {
    if (value.length <= max) return value;
    return value.slice(0, max).trim();
}

// --- dialogue line interpretation (shared by description + static HTML) ----
// Media and mono-marker parsing is shared with the runtime DialogueContent via
// utils/dialogueParsing, so the build and the live app interpret markup identically.

/**
 * Build a short, human description from a transcriber's content blocks, mirroring
 * the summary the app shows. Describes media (image/audio) when there are no spoken
 * lines, so media-only entries get a real description instead of the generic fallback.
 */
function summarizeTranscriber(transcriber: Dialogue | null): string {
    const normalized: string[] = [];
    for (const block of extractContent(transcriber)) {
        if (block.kind === 'image') normalized.push(`Image: ${block.label}`);
        else if (block.kind === 'audio') normalized.push(`Audio: ${block.label}`);
        else normalized.push(block.speaker ? `${block.speaker}: ${cleanText(block.text)}` : cleanText(block.text));
    }
    return normalized.slice(0, 6).join(' ');
}

/**
 * The canonical page meta (title/description/og image) for viewing a pearl with a
 * given transcriber. Used by BOTH the runtime app (live <title>/meta updates) and
 * the build (pre-generated HTML), so embeds and the live page never disagree.
 * Pass the transcriber actually being shown (the default/last for entry routes).
 */
export function buildRouteMeta(pearl: PearlData, transcriber: Dialogue | null): RouteMeta {
    const name = pearl.metadata.name || pearl.id;
    const title = (pearl.metadata.name ? `${pearl.metadata.name} | ` : '') + SITE_NAME;
    const summary =
        summarizeTranscriber(transcriber) ||
        cleanText(transcriber?.metadata?.info) ||
        cleanText(pearl.metadata.info) ||
        `Dialogue content for ${name} from the ${SITE_NAME}.`;
    return { title, description: truncate(summary), ogImage: null };
}

/**
 * The OG image file generated for every route, written next to its index.html.
 * Lives here (not in the build) so the build that writes the file and the meta tag
 * that references it use one name, and the live app can derive the same URL.
 */
export const OG_IMAGE_BASENAME = 'og.png';

/** Base-relative OG image path for a route path (e.g. "/CC/moon/" -> "/CC/moon/og.png"). */
export function ogImageForRoutePath(routePath: string): string {
    return routePath.replace(/\/+$/, '') + '/' + OG_IMAGE_BASENAME;
}

/** The transcriber a route shows: the explicitly selected one, else the default (last). */
export function transcriberForRoute(pearl: PearlData, transcriberName: string | null): Dialogue | null {
    if (!pearl.transcribers.length) return null;
    if (transcriberName) {
        const index = findTranscriberIndex(pearl, transcriberName);
        if (index !== -1 && pearl.transcribers[index]) return pearl.transcribers[index];
    }
    return pearl.transcribers[pearl.transcribers.length - 1];
}

/** Convenience for the runtime app: meta for a pearl given the selected transcriber name. */
export function buildRouteMetaFor(pearl: PearlData, transcriberName: string | null): RouteMeta {
    return buildRouteMeta(pearl, transcriberForRoute(pearl, transcriberName));
}

// --- static (no-JS) content rendering --------------------------------------
// The build injects this HTML into #root for crawlers and link unfurlers that do
// not run JavaScript. The live app replaces #root on mount, so JS clients never
// see it (no flash, and nothing hidden lingers in the rendered DOM Google indexes).

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/** Deployed image format: "webp" means the build rewrote raster images to WebP. */
export type ImageFormat = 'webp' | 'original';

export function deployedImagePath(path: string, format: ImageFormat): string {
    if (format !== 'webp' || !isCompressedImgPath(path)) return path;
    return path.replace(/\.(png|jpe?g)$/i, '.webp');
}

/**
 * Render a transcriber's dialogue to static, crawlable HTML.
 * Mirrors the runtime DialogueContent markup rules (MONO, SEQUENCE, ![media], speakers),
 * reduced to clean semantic HTML. `assetBase` is the public base (e.g. "/rw-collection-index"),
 * injected by the build so this module stays free of process.env.
 */
export function renderEntryContentHtml(
    pearl: PearlData,
    transcriber: Dialogue | null,
    assetBase: string,
    imageFormat: ImageFormat = 'original',
): string {
    const base = assetBase.replace(/\/+$/, '');
    const parts: string[] = [];

    parts.push(`<h1>${escapeHtml(pearl.metadata.name || pearl.id)}</h1>`);

    const info = cleanText(pearl.metadata.info) || cleanText(transcriber?.metadata?.info);
    if (info) parts.push(`<p>${escapeHtml(info)}</p>`);

    for (const block of extractContent(transcriber)) {
        if (block.kind === 'image') {
            const imgPath = deployedImagePath(block.path, imageFormat);
            parts.push(
                `<figure><img src="${escapeHtml(`${base}/img/${imgPath}`)}" alt="${escapeHtml(block.label)}"/>` +
                `<figcaption>${escapeHtml(block.label)}</figcaption></figure>`
            );
        } else if (block.kind === 'audio') {
            parts.push(`<p><a href="${escapeHtml(`${base}/audio/${block.path}`)}">${escapeHtml(block.label)}</a></p>`);
        } else {
            // Reuse the runtime line sanitizer so inline markup (links, emphasis) is rendered identically.
            const inline = renderDialogueLine(block.text);
            parts.push(
                block.speaker
                    ? `<p><strong>${escapeHtml(block.speaker)}</strong>: ${inline}</p>`
                    : `<p>${inline}</p>`
            );
        }
    }

    return parts.join('');
}

/** Find a route's pearl and shown transcriber, and render its static content HTML. */
export function renderRouteContent(
    route: RouteDescriptor,
    pearls: PearlData[],
    assetBase: string,
    imageFormat: ImageFormat = 'original',
): string {
    const pearl = pearls.find(p => p.id === route.pearlId);
    if (!pearl) return '';
    return renderEntryContentHtml(pearl, transcriberForRoute(pearl, route.transcriberName), assetBase, imageFormat);
}

/**
 * Enumerate every route worth a pre-generated HTML page for one dataset:
 * the canonical entry-level route plus one route per transcriber. This is the
 * single producer the build uses for HTML files, the sitemap and the manifest,
 * so "missing an entry" cannot diverge between them.
 */
export function enumerateRoutes(datasetKey: string, pearls: PearlData[]): RouteDescriptor[] {
    const routes: RouteDescriptor[] = [];

    for (const pearl of pearls) {
        const names = effectiveNames(pearl);
        const defaultTranscriber = names.length ? pearl.transcribers[pearl.transcribers.length - 1] : null;

        // The entry id is per-pearl and stable across all of its routes.
        // The transcriber lives in its own segment, not in the entry id.
        const entryId = entryIdForPearl(pearl, pearls);

        const entryPath = buildRoutePath({ datasetKey, entryId, transcriberName: null, source: null });
        const entryMeta = buildRouteMeta(pearl, defaultTranscriber);

        // Each transcriber page owns distinct content and is its own canonical (below).
        // The bare entry renders the default (last) transcriber, so it is an alias that canonicalizes there rather than competing with it.
        // An entry with no transcribers has nothing to defer to, so it stays its own canonical.
        const defaultTranscriberName = names.length ? names[names.length - 1] : null;
        const defaultTranscriberPath = defaultTranscriberName
            ? buildRoutePath({ datasetKey, entryId, transcriberName: defaultTranscriberName, source: null })
            : entryPath;
        routes.push({
            path: entryPath,
            datasetKey,
            entryId,
            pearlId: pearl.id,
            transcriberName: null,
            title: entryMeta.title,
            description: entryMeta.description,
            ogImage: ogImageForRoutePath(defaultTranscriberPath),
            isCanonical: defaultTranscriberName === null,
            canonicalPath: defaultTranscriberPath,
        });

        // One explicit route per transcriber, so every transcriber URL has real meta.
        pearl.transcribers.forEach((transcriber, index) => {
            const effectiveName = names[index];
            const routePath = buildRoutePath({ datasetKey, entryId, transcriberName: effectiveName, source: null });
            const meta = buildRouteMeta(pearl, transcriber);
            routes.push({
                path: routePath,
                datasetKey,
                entryId,
                pearlId: pearl.id,
                transcriberName: effectiveName,
                title: meta.title,
                description: meta.description,
                ogImage: ogImageForRoutePath(routePath),
                isCanonical: true,
                canonicalPath: routePath,
            });
        });
    }

    return routes;
}

// --- validation guard ------------------------------------------------------

/**
 * Root-level path segments that must never be produced as an entry id for the
 * root (prefix-less) dataset, because GitHub Pages serves real files/folders at
 * those names. The build fails loudly if an entry ever collides.
 */
export const RESERVED_SEGMENTS = new Set<string>([
    'data', 'img', 'font', 'wasm', 'static', 'source',
    'sitemap.xml', 'robots.txt', 'index.html', '404.html',
    'favicon.ico', 'favicon.svg', 'manifest', 'asset-manifest.json',
    'web-app-manifest-32x32.png', 'web-app-manifest-64x64.png',
    'web-app-manifest-192x192.png', 'web-app-manifest-512x512.png',
    'apple-touch-icon.png', 'favicon-96x96.png', 'site.webmanifest', 'robots',
    ...DATASET_PREFIXES,
]);

/**
 * Validate the final, uniqueness-enforced entry ids for a set of datasets.
 * Returns a list of human-readable errors (empty when all good).
 * Checks that no entry id collides with a reserved root segment (root dataset only).
 * Checks that the final entry ids are unique within a dataset.
 * The build additionally verifies full round-trip resolution per route.
 */
export function validateDatasets(datasets: { datasetKey: string; pearls: PearlData[] }[]): string[] {
    const errors: string[] = [];

    for (const { datasetKey, pearls } of datasets) {
        const dataset = getDataset(datasetKey);
        const isRoot = !dataset || !dataset.routePrefix;
        const entryIds = buildEntryIdMap(pearls);
        const seen = new Map<string, string>();

        for (const pearl of pearls) {
            const id = entryIds.get(pearl) as string;

            const previous = seen.get(id);
            if (previous) {
                errors.push(`Duplicate entry id "${id}" in dataset "${datasetKey}" (pearls "${previous}" and "${pearl.id}")`);
            } else {
                seen.set(id, pearl.id);
            }

            if (isRoot && RESERVED_SEGMENTS.has(id)) {
                errors.push(`Entry id "${id}" (pearl "${pearl.id}") collides with a reserved root path segment`);
            }
        }
    }

    return errors;
}
