/**
 * Build-time route enumerator. Runs after `craco build`, via tsx.
 *
 * This is the SINGLE producer of everything path-routing needs in the deploy:
 *   - a real <route>/index.html for every entry and transcriber (so GitHub Pages
 *     serves them statically, with correct per-page <title>/description/og/canonical),
 *   - dataset landing pages (/, /modded/, ...),
 *   - 404.html (a copy of the app shell that boots the main app; sets __RW_FROM_404__),
 *   - sitemap.xml (entry + transcriber routes), robots.txt,
 *   - routes.json manifest,
 *   - injects the dataset registry into the bootstrap of every generated page.
 *
 * It shares routes.ts with the app, so URLs cannot diverge between build and
 * runtime. It asserts that every route round-trips (parse -> resolve -> same
 * pearl/transcriber) and that the file count matches the manifest, so a missed
 * entry fails the build loudly instead of silently shipping a broken link.
 */

import * as fs from 'fs';
import * as path from 'path';

import { DATASETS } from './src/app/routing/datasets';
import {
    enumerateRoutes,
    validateDatasets,
    parseRoutePath,
    resolveRoute,
    renderRouteContent,
    SITE_NAME,
} from './src/app/routing/routes';
import type { RouteDescriptor } from './src/app/routing/routes';
import type { PearlData } from './src/app/types/types';

const SITE_ORIGIN = 'https://yanwittmann.github.io';
const DEFAULT_OG_IMAGE =
    'https://raw.githubusercontent.com/YanWittmann/rw-collection-index/refs/heads/main/doc/rw-collection-index-card-2x.png';

const SITE_DIR = __dirname;
const BUILD_DIR = path.join(SITE_DIR, 'build');
const DATA_DIR = path.join(SITE_DIR, 'public', 'data');

const pkg = JSON.parse(fs.readFileSync(path.join(SITE_DIR, 'package.json'), 'utf8'));
/** Public base path, e.g. "/rw-collection-index" (no trailing slash). */
const BASE = String(pkg.homepage || '/').replace(/\/+$/, '');

const DEFAULT_TITLE = `${SITE_NAME} | Pearls, Broadcasts, Downpour & The Watcher DLC`;
const DEFAULT_DESCRIPTION =
    'Explore and track all Pearls, Broadcasts, Downpour and The Watcher DLC content, Iterator dialogues, ' +
    'Echoes and more from the game Rain World in your browser. Full-text search, view interactive map ' +
    'locations and use the spoiler protection functionality.';

// The dataset registry mirror that the bootstrap script consumes.
const DATASET_BOOTSTRAP = DATASETS.map(d => ({ prefix: d.routePrefix, key: d.key, suffix: d.jsonSuffix }));

// helpers

function xmlEscape(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function htmlAttrEscape(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function absoluteUrl(routePath: string): string {
    return SITE_ORIGIN + BASE + routePath;
}

/**
 * Provide the dataset registry to the pre-bundle bootstrap by injecting a small
 * script that sets window.__RW_DATASETS__ BEFORE the bootstrap runs. This is done
 * by inserting a fresh <script> (rather than rewriting the existing inline script)
 * because CRA minifies/mangles inline JS, which would destroy any in-place marker.
 */
function injectDatasetRegistry(html: string): string {
    const script = `<script>window.__RW_DATASETS__=${JSON.stringify(DATASET_BOOTSTRAP)};</script>`;

    // Insert right after the charset meta if present, else right after <head>.
    const charset = /<meta\s+charset="[^"]*"\s*\/?>/i;
    if (charset.test(html)) {
        return html.replace(charset, match => match + script);
    }
    const head = /<head[^>]*>/i;
    if (head.test(html)) {
        return html.replace(head, match => match + script);
    }
    throw new Error('Could not find <head> to inject the dataset registry into.');
}

interface PageMeta {
    title: string;
    description: string;
    canonicalUrl: string;
    ogUrl: string;
    ogImage: string;
}

/** Rewrite the head meta tags of the shell to this page's values. */
function applyMeta(html: string, meta: PageMeta): string {
    const title = htmlAttrEscape(meta.title);
    const description = htmlAttrEscape(meta.description);

    const replacements: Array<[RegExp, string]> = [
        [/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`],
        [/<meta name="description"[^>]*>/, `<meta name="description" content="${description}"/>`],
        [/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${title}"/>`],
        [/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${description}"/>`],
        [/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${htmlAttrEscape(meta.ogUrl)}"/>`],
        [/<meta property="og:image"[^>]*>/, `<meta property="og:image" content="${htmlAttrEscape(meta.ogImage)}"/>`],
        [/<meta property="twitter:title"[^>]*>/, `<meta property="twitter:title" content="${title}"/>`],
        [/<meta property="twitter:description"[^>]*>/, `<meta property="twitter:description" content="${description}"/>`],
        [/<meta property="twitter:url"[^>]*>/, `<meta property="twitter:url" content="${htmlAttrEscape(meta.ogUrl)}"/>`],
        [/<meta property="twitter:image"[^>]*>/, `<meta property="twitter:image" content="${htmlAttrEscape(meta.ogImage)}"/>`],
        [/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${htmlAttrEscape(meta.canonicalUrl)}"/>`],
    ];

    let result = html;
    for (const [pattern, replacement] of replacements) {
        result = result.replace(pattern, replacement);
    }
    return result;
}

/**
 * Inject the static, crawlable content into #root as a hidden <article>.
 * The live app replaces #root on mount, so JS clients never render this (no flash),
 * while no-JS agents (link unfurlers, non-rendering crawlers) read it from the source.
 */
function injectRootContent(html: string, contentHtml: string): string {
    if (!contentHtml) return html;
    return html.replace(
        '<div id="root"></div>',
        `<div id="root"><article style="display:none">${contentHtml}</article></div>`
    );
}

/** Write an HTML page at a base-relative route path (e.g. "/CC/" -> build/CC/index.html). */
function writePage(routePath: string, html: string): string {
    const relative = routePath.replace(/^\/+/, '');
    const dir = relative ? path.join(BUILD_DIR, relative) : BUILD_DIR;
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, 'index.html');
    fs.writeFileSync(file, html);
    return file;
}

function loadPearls(jsonSuffix: string): PearlData[] {
    const file = path.join(DATA_DIR, `parsed-dialogues${jsonSuffix}.json`);
    return JSON.parse(fs.readFileSync(file, 'utf8')) as PearlData[];
}

// --- main ------------------------------------------------------------------

function main() {
    const indexPath = path.join(BUILD_DIR, 'index.html');
    if (!fs.existsSync(indexPath)) {
        throw new Error(`Build shell not found at ${indexPath}. Run craco build first.`);
    }

    // The built shell with the dataset registry injected; reused for every page.
    const shell = injectDatasetRegistry(fs.readFileSync(indexPath, 'utf8'));

    // Load every dataset's pearls up front and validate slugs before writing anything.
    const datasetPearls = DATASETS.map(d => ({ dataset: d, pearls: loadPearls(d.jsonSuffix) }));

    const validationErrors = validateDatasets(
        datasetPearls.map(({ dataset, pearls }) => ({ datasetKey: dataset.key, pearls }))
    );
    if (validationErrors.length) {
        throw new Error('Route validation failed:\n  - ' + validationErrors.join('\n  - '));
    }

    const writtenFiles = new Set<string>();
    const manifest: Array<{ path: string; datasetKey: string; entryId: string; transcriberName: string | null; canonical: boolean }> = [];
    const sitemapPaths: string[] = [];

    // 1. Dataset landing pages (/, /modded/, ...).
    for (const { dataset } of datasetPearls) {
        const routePath = '/' + (dataset.routePrefix ? dataset.routePrefix + '/' : '');
        const meta: PageMeta = {
            title: DEFAULT_TITLE,
            description: DEFAULT_DESCRIPTION,
            canonicalUrl: absoluteUrl(routePath),
            ogUrl: absoluteUrl(routePath),
            ogImage: DEFAULT_OG_IMAGE,
        };
        writtenFiles.add(writePage(routePath, applyMeta(shell, meta)));
        sitemapPaths.push(routePath);
    }

    // 2. Entry + transcriber pages, per dataset.
    for (const { dataset, pearls } of datasetPearls) {
        const routes = enumerateRoutes(dataset.key, pearls);

        for (const route of routes) {
            assertRoundTrip(route, pearls);

            const meta: PageMeta = {
                title: route.title,
                description: route.description,
                // canonical always points at the entry-level route
                canonicalUrl: absoluteUrl(route.canonicalPath),
                ogUrl: absoluteUrl(route.path),
                ogImage: route.ogImage ? toAbsoluteOg(route.ogImage) : DEFAULT_OG_IMAGE,
            };

            const contentHtml = renderRouteContent(route, pearls, BASE);
            const file = writePage(route.path, applyMeta(injectRootContent(shell, contentHtml), meta));
            if (writtenFiles.has(file)) {
                throw new Error(`Two routes resolved to the same file: ${file}`);
            }
            writtenFiles.add(file);

            manifest.push({
                path: route.path,
                datasetKey: route.datasetKey,
                entryId: route.entryId,
                transcriberName: route.transcriberName,
                canonical: route.isCanonical,
            });
            sitemapPaths.push(route.path);
        }
    }

    // 3. 404.html: app shell that boots the main app, flagged for later analytics.
    const notFound = shell.replace(
        '<div id="root"></div>',
        '<div id="root"></div>\n<script>window.__RW_FROM_404__ = true;</script>'
    );
    const notFoundFile = path.join(BUILD_DIR, '404.html');
    fs.writeFileSync(notFoundFile, applyMeta(notFound, {
        title: DEFAULT_TITLE,
        description: DEFAULT_DESCRIPTION,
        canonicalUrl: absoluteUrl('/'),
        ogUrl: absoluteUrl('/'),
        ogImage: DEFAULT_OG_IMAGE,
    }));

    // 4. sitemap.xml + robots.txt
    writeSitemap(sitemapPaths);
    writeRobots();

    // 5. routes.json manifest
    fs.writeFileSync(path.join(BUILD_DIR, 'routes.json'), JSON.stringify(manifest, null, 0));

    // 6. Count assertion: landing pages + every manifest entry == HTML files written.
    const expected = manifest.length + datasetPearls.length;
    if (writtenFiles.size !== expected) {
        throw new Error(`Route count mismatch: wrote ${writtenFiles.size} pages but expected ${expected}.`);
    }

    console.log(`generate-routes: wrote ${writtenFiles.size} HTML pages across ${DATASETS.length} datasets.`);
    console.log(`  manifest entries: ${manifest.length}, sitemap urls: ${sitemapPaths.length}`);
    console.log(`  404.html and routes.json written.`);
}

function toAbsoluteOg(ogImage: string): string {
    if (/^https?:\/\//.test(ogImage)) return ogImage;
    return SITE_ORIGIN + BASE + (ogImage.startsWith('/') ? ogImage : '/' + ogImage);
}

/**
 * Verify a route survives a full parse -> resolve trip back to the same content.
 * This is the concrete guard against slug ambiguity / missed entries.
 */
function assertRoundTrip(route: RouteDescriptor, pearls: PearlData[]): void {
    const parsed = parseRoutePath(route.path);

    if (parsed.datasetKey !== route.datasetKey) {
        throw new Error(`Route "${route.path}" parsed to dataset "${parsed.datasetKey}", expected "${route.datasetKey}".`);
    }
    if (parsed.entryId !== route.entryId) {
        throw new Error(`Route "${route.path}" entryId did not round-trip: "${parsed.entryId}" != "${route.entryId}".`);
    }

    const resolved = resolveRoute(parsed, pearls);
    if (!resolved) {
        throw new Error(`Route "${route.path}" does not resolve back to any pearl.`);
    }
    // The route must resolve to the exact pearl it was generated for.
    if (resolved.pearl.id !== route.pearlId) {
        throw new Error(
            `Route "${route.path}" resolves to pearl "${resolved.pearl.id}", expected "${route.pearlId}".`
        );
    }
    // For transcriber routes, the shown transcriber must match exactly.
    if (route.transcriberName && resolved.transcriberName !== route.transcriberName) {
        throw new Error(
            `Route "${route.path}" round-trip mismatch: expected transcriber "${route.transcriberName}", got "${resolved.transcriberName}".`
        );
    }
}

function writeSitemap(routePaths: string[]): void {
    const urls = routePaths
        .map(routePath => {
            const loc = xmlEscape(absoluteUrl(routePath));
            const priority = routePath === '/' ? '1.0' : '0.8';
            const changefreq = routePath === '/' ? 'daily' : 'weekly';
            return `  <url>\n    <loc>${loc}</loc>\n    <priority>${priority}</priority>\n    <changefreq>${changefreq}</changefreq>\n  </url>`;
        })
        .join('\n');

    const xml =
        `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
    fs.writeFileSync(path.join(BUILD_DIR, 'sitemap.xml'), xml);
}

function writeRobots(): void {
    const robots =
        `# https://www.robotstxt.org/robotstxt.html\n` +
        `User-agent: *\nDisallow:\n\n` +
        `Sitemap: ${SITE_ORIGIN}${BASE}/sitemap.xml\n`;
    fs.writeFileSync(path.join(BUILD_DIR, 'robots.txt'), robots);
}

main();
