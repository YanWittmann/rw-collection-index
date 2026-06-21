/**
 * Phase: static route generation.
 * Runs after the app bundle exists.
 * Produces a real index.html for every entry and transcriber (with per-page meta, canonical and crawlable content), the dataset landing pages, 404.html, sitemap.xml, robots.txt and routes.json.
 * It shares routes.ts with the app, so build and runtime URLs cannot diverge, and asserts every route round-trips so a missed entry fails loudly.
 *
 * in   build/index.html (shell), public/data/parsed-dialogues*.json
 * out  build/**\/index.html, build/404.html, build/{sitemap.xml,robots.txt,routes.json}
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import { BASE, BUILD_DIR, DATASETS, deployImageFormat, dialogueDirOf, parsedDialoguesFile, ROOT_DIR } from '../lib/config';
import { readText, writeJson, writeText } from '../lib/io';
import { phase } from '../lib/log';
import type { RouteDescriptor } from '../../src/app/routing/routes';
import {
    enumerateRoutes,
    entryIdForPearl,
    parseRoutePath,
    renderRouteContent,
    resolveRoute,
    SITE_NAME,
    validateDatasets,
} from '../../src/app/routing/routes';
import type { PearlData } from '../../src/app/types/types';

const SITE_ORIGIN = 'https://yanwittmann.github.io';
const DEFAULT_OG_IMAGE =
    'https://raw.githubusercontent.com/YanWittmann/rw-collection-index/refs/heads/main/doc/rw-collection-index-card-2x.png';

const DEFAULT_TITLE = `${SITE_NAME} | Pearls, Broadcasts, Downpour & The Watcher DLC`;
const DEFAULT_DESCRIPTION =
    'Explore and track all Pearls, Broadcasts, Downpour and The Watcher DLC content, Iterator dialogues, ' +
    'Echoes and more from the game Rain World in your browser. Full-text search, view interactive map ' +
    'locations and use the spoiler protection functionality.';

const DATASET_BOOTSTRAP = DATASETS.map(d => ({ prefix: d.routePrefix, key: d.key, suffix: d.jsonSuffix }));

function xmlEscape(value: string): string {
    return value
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function htmlAttrEscape(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function absoluteUrl(routePath: string): string {
    return SITE_ORIGIN + BASE + routePath;
}

function toAbsoluteOg(ogImage: string): string {
    if (/^https?:\/\//.test(ogImage)) return ogImage;
    return SITE_ORIGIN + BASE + (ogImage.startsWith('/') ? ogImage : '/' + ogImage);
}

/**
 * Provide the dataset registry to the pre-bundle bootstrap by injecting a fresh <script> that sets
 * window.__RW_DATASETS__ before the bootstrap runs (CRA mangles the inline script, so it cannot be rewritten in place).
 */
function injectDatasetRegistry(html: string): string {
    const script = `<script>window.__RW_DATASETS__=${JSON.stringify(DATASET_BOOTSTRAP)};</script>`;
    const charset = /<meta\s+charset="[^"]*"\s*\/?>/i;
    if (charset.test(html)) return html.replace(charset, match => match + script);
    const head = /<head[^>]*>/i;
    if (head.test(html)) return html.replace(head, match => match + script);
    throw new Error('Could not find <head> to inject the dataset registry into.');
}

interface PageMeta {
    title: string;
    description: string;
    canonicalUrl: string;
    ogUrl: string;
    ogImage: string;
}

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
    for (const [pattern, replacement] of replacements) result = result.replace(pattern, replacement);
    return result;
}

/**
 * Inject the static, crawlable content into #root as a hidden <article>.
 * The live app replaces #root on mount, so JS clients never render this, while no-JS agents read it from source.
 */
function injectRootContent(html: string, contentHtml: string): string {
    if (!contentHtml) return html;
    return html.replace(
        '<div id="root"></div>',
        `<div id="root"><article style="display:none">${contentHtml}</article></div>`,
    );
}

/** Write an HTML page at a base-relative route path (e.g. "/CC/" -> build/CC/index.html). */
function writePage(routePath: string, html: string): string {
    const relative = routePath.replace(/^\/+/, '');
    const file = path.join(relative ? path.join(BUILD_DIR, relative) : BUILD_DIR, 'index.html');
    writeText(file, html);
    return file;
}

function loadPearls(dataset: (typeof DATASETS)[number]): PearlData[] {
    return JSON.parse(readText(parsedDialoguesFile(dataset))) as PearlData[];
}

/** Verify a route survives a full parse -> resolve trip back to the same content. */
function assertRoundTrip(route: RouteDescriptor, pearls: PearlData[]): void {
    const parsed = parseRoutePath(route.path);
    if (parsed.datasetKey !== route.datasetKey) {
        throw new Error(`Route "${route.path}" parsed to dataset "${parsed.datasetKey}", expected "${route.datasetKey}".`);
    }
    if (parsed.entryId !== route.entryId) {
        throw new Error(`Route "${route.path}" entryId did not round-trip: "${parsed.entryId}" != "${route.entryId}".`);
    }
    const resolved = resolveRoute(parsed, pearls);
    if (!resolved) throw new Error(`Route "${route.path}" does not resolve back to any pearl.`);
    if (resolved.pearl.id !== route.pearlId) {
        throw new Error(`Route "${route.path}" resolves to pearl "${resolved.pearl.id}", expected "${route.pearlId}".`);
    }
    if (route.transcriberName && resolved.transcriberName !== route.transcriberName) {
        throw new Error(`Route "${route.path}" round-trip mismatch: expected transcriber "${route.transcriberName}", got "${resolved.transcriberName}".`);
    }
}

/** HEAD commit time (ISO 8601), the sitemap fallback for routes with no tracked source file (landing pages, uncommitted .txt). */
function deployLastmod(): string {
    try {
        return execSync('git log -1 --format=%cI', { encoding: 'utf8', cwd: ROOT_DIR }).trim();
    } catch {
        return new Date().toISOString().replace(/\.\d+Z$/, 'Z');
    }
}

/**
 * Map each tracked file under the given dirs to its last-commit time (ISO 8601), in one git pass (newest commit wins).
 * This gives each entry the real edit time of its source .txt instead of the repo-wide deploy time.
 * mtime cannot be used: a CI checkout resets every file's mtime to "now".
 */
function fileLastmodMap(dirsRelToRoot: string[]): Map<string, string> {
    const map = new Map<string, string>();
    if (dirsRelToRoot.length === 0) return map;
    try {
        const args = dirsRelToRoot.map(d => `"${d}"`).join(' ');
        const out = execSync(`git -c core.quotePath=false log --format=%cI --name-only -- ${args}`, {
            encoding: 'utf8', cwd: ROOT_DIR, maxBuffer: 64 * 1024 * 1024,
        });
        let date = '';
        for (const line of out.split('\n')) {
            if (/^\d{4}-\d{2}-\d{2}T/.test(line)) date = line;
            else if (line && !map.has(line)) map.set(line, date);
        }
    } catch {
        // no git / not a repo: callers fall back to the deploy date
    }
    return map;
}

function writeSitemap(entries: Array<{ path: string; lastmod: string }>): void {
    const urls = entries.map(({ path: routePath, lastmod }) => {
        const loc = xmlEscape(absoluteUrl(routePath));
        return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
    }).join('\n');
    writeText(
        path.join(BUILD_DIR, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`,
    );
}

function writeRobots(): void {
    writeText(
        path.join(BUILD_DIR, 'robots.txt'),
        `# https://www.robotstxt.org/robotstxt.html\nUser-agent: *\nDisallow:\n\nSitemap: ${SITE_ORIGIN}${BASE}/sitemap.xml\n`,
    );
}

export function runRoutes(): void {
    const log = phase('routes');

    const indexPath = path.join(BUILD_DIR, 'index.html');
    if (!fs.existsSync(indexPath)) {
        throw new Error(`Build shell not found at ${indexPath}. Run the bundle phase first.`);
    }
    log.reads('build/index.html (shell), public/data/parsed-dialogues*.json');

    const imageFormat = deployImageFormat();
    const shell = injectDatasetRegistry(readText(indexPath));
    const datasetPearls = DATASETS.map(d => ({ dataset: d, pearls: loadPearls(d) }));

    const validationErrors = validateDatasets(
        datasetPearls.map(({ dataset, pearls }) => ({ datasetKey: dataset.key, pearls })),
    );
    if (validationErrors.length) {
        throw new Error('Route validation failed:\n  - ' + validationErrors.join('\n  - '));
    }

    const writtenFiles = new Set<string>();
    const manifest: Array<{
        path: string;
        datasetKey: string;
        entryId: string;
        transcriberName: string | null;
        canonical: boolean
    }> = [];
    const sitemapEntries: Array<{ path: string; lastmod: string }> = [];

    const headDate = deployLastmod();
    const gitDates = fileLastmodMap(DATASETS.map(d => path.relative(ROOT_DIR, dialogueDirOf(d)).replace(/\\/g, '/')));
    const lastmodFor = (sourceFile?: string) => (sourceFile && gitDates.get(sourceFile)) || headDate;

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
        sitemapEntries.push({ path: routePath, lastmod: headDate });
    }

    for (const { dataset, pearls } of datasetPearls) {
        // Key by the same url id the routes use (internalId-preferring), not pearl.id, or lookups silently miss.
        const sourceByEntryId = new Map(pearls.map(p => [entryIdForPearl(p, pearls), p.sourceFile]));
        for (const route of enumerateRoutes(dataset.key, pearls)) {
            assertRoundTrip(route, pearls);

            const meta: PageMeta = {
                title: route.title,
                description: route.description,
                canonicalUrl: absoluteUrl(route.canonicalPath),
                ogUrl: absoluteUrl(route.path),
                ogImage: route.ogImage ? toAbsoluteOg(route.ogImage) : DEFAULT_OG_IMAGE,
            };

            const contentHtml = renderRouteContent(route, pearls, BASE, imageFormat);
            const file = writePage(route.path, applyMeta(injectRootContent(shell, contentHtml), meta));
            if (writtenFiles.has(file)) throw new Error(`Two routes resolved to the same file: ${file}`);
            writtenFiles.add(file);

            manifest.push({
                path: route.path,
                datasetKey: route.datasetKey,
                entryId: route.entryId,
                transcriberName: route.transcriberName,
                canonical: route.isCanonical,
            });
            // Only canonical pages belong in the sitemap; the bare entry alias points its rel=canonical at the default transcriber.
            if (route.isCanonical) {
                sitemapEntries.push({ path: route.path, lastmod: lastmodFor(sourceByEntryId.get(route.entryId)) });
            }
        }
    }

    const notFound = shell.replace(
        '<div id="root"></div>',
        '<div id="root"></div>\n<script>window.__RW_FROM_404__ = true;</script>',
    );
    writeText(path.join(BUILD_DIR, '404.html'), applyMeta(notFound, {
        title: DEFAULT_TITLE,
        description: DEFAULT_DESCRIPTION,
        canonicalUrl: absoluteUrl('/'),
        ogUrl: absoluteUrl('/'),
        ogImage: DEFAULT_OG_IMAGE,
    }));

    writeSitemap(sitemapEntries);
    writeRobots();
    writeJson(path.join(BUILD_DIR, 'routes.json'), manifest);

    const expected = manifest.length + datasetPearls.length;
    if (writtenFiles.size !== expected) {
        throw new Error(`Route count mismatch: wrote ${writtenFiles.size} pages but expected ${expected}.`);
    }

    log.writes(`${writtenFiles.size} HTML pages, 404.html, sitemap.xml, robots.txt, routes.json`);
    log.done(`${manifest.length} routes across ${DATASETS.length} datasets, images=${imageFormat}`);
}
