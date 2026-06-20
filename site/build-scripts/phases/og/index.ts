/**
 * Phase: OG image generation.
 * Renders one social card per route (entry + transcriber) next to its index.html as og.png, the URL the
 * routes phase already points og:image at. Cards are drawn with the Skia canvas (see designs/) and
 * compressed through the shared image compressor.
 *
 * A content-hashed cache under site/.og-cache speeds up local rebuilds (only changed cards re-render);
 * it is skipped on CI, where the checkout is fresh anyway.
 *
 * in   public/data/parsed-dialogues*.json, public/img/** (icons and frames)
 * out  build/<route>/og.png
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as crypto from 'crypto';
import { createCanvas } from '@napi-rs/canvas';

import { BUILD_DIR, type Dataset, DATASETS, parsedDialoguesFile, SITE_DIR } from '../../lib/config';
import { ensureDir } from '../../lib/io';
import { fmtBytes, phase } from '../../lib/log';
import { COMPRESS_PRESETS, type CompressOptions, compressToBuffer, extensionFor } from '../../lib/imageCompress';
import {
    enumerateRoutes,
    OG_IMAGE_BASENAME,
    resolveRoute,
    transcriberForRoute,
} from '../../../src/app/routing/routes';
import type { Dialogue, PearlData } from '../../../src/app/types/types';
import { getEntryIcon, getTranscriberIcon } from '../../../src/app/utils/transcriberUtils';
import { type ContentBlock, extractContent } from '../../../src/app/utils/dialogueParsing';
import { decodeEntities, iconFilePath, registerFonts } from './toolkit';
import { type CardInput, DEFAULT_DESIGN_NAME, type Design, getDesign } from './designs';

const PRESET_FLAT: CompressOptions = COMPRESS_PRESETS['og-card'];
const PRESET_PHOTO: CompressOptions = COMPRESS_PRESETS['og-card-photo'];
const CACHE_DIR = path.join(SITE_DIR, '.og-cache');

/** Image cards keep full colour; flat text/audio cards quantise to a tiny indexed palette. */
function presetForBlocks(blocks: ContentBlock[]): CompressOptions {
    return blocks.some(b => b.kind === 'image') ? PRESET_PHOTO : PRESET_FLAT;
}

export interface OgEntrySpec {
    datasetKey: string;
    entryId: string;
    transcriberName: string | null;
}

export interface OgOptions {
    /** Test mode: render just these entries instead of the whole site. */
    entries?: OgEntrySpec[];
    /** Test mode: output directory for the rendered cards plus a contact sheet. */
    out?: string;
    /** Force a fresh render even when a cached card exists. */
    noCache?: boolean;
}

// --- rendering --------------------------------------------------------------

async function renderToBuffer(design: Design, input: CardInput): Promise<Buffer> {
    const canvas = createCanvas(design.width, design.height);
    const ctx = canvas.getContext('2d');
    await design.render(ctx, input);
    const png = canvas.toBuffer('image/png');
    return compressToBuffer(png, presetForBlocks(input.blocks));
}

/**
 * Run worker over every item with at most `concurrency` in flight, so a card's encode (sharp, native threads)
 * overlaps the next card's render (synchronous JS) instead of the whole loop running strictly one at a time.
 */
async function forEachConcurrent<T>(items: T[], concurrency: number, worker: (item: T, index: number) => Promise<void>): Promise<void> {
    let next = 0;
    const run = async (): Promise<void> => {
        while (next < items.length) {
            const i = next++;
            await worker(items[i], i);
        }
    };
    await Promise.all(Array.from({ length: Math.max(1, Math.min(concurrency, items.length)) }, run));
}

// --- caching ----------------------------------------------------------------

function statSignature(file: string): string {
    try {
        const s = fs.statSync(file);
        return `${s.size}:${Math.round(s.mtimeMs)}`;
    } catch {
        return '0';
    }
}

/** Every image file a card draws, so the cache key changes when any of them is edited. */
function cardAssetFiles(pearl: PearlData, transcriber: Dialogue | null, blocks: ContentBlock[]): string[] {
    const srcs = [getEntryIcon(pearl).asset.src];
    if (transcriber) srcs.push(getTranscriberIcon(transcriber, pearl).asset.src);
    for (const block of blocks) if (block.kind === 'image') srcs.push(block.path);
    return srcs.map(iconFilePath);
}

function cacheKey(design: Design, input: CardInput): string {
    const payload = JSON.stringify({
        design: design.name,
        v: design.version,
        preset: presetForBlocks(input.blocks),
        id: input.pearl.id,
        entryId: input.entryId,
        title: input.title,
        color: input.pearl.metadata.color,
        transcriber: input.transcriber?.transcriber ?? null,
        transcriberName: input.transcriberName,
        blocks: input.blocks,
        assets: cardAssetFiles(input.pearl, input.transcriber, input.blocks).map(f => `${path.basename(f)}#${statSignature(f)}`),
    });
    return crypto.createHash('sha1').update(payload).digest('hex');
}

interface Producer {
    produce(design: Design, input: CardInput): Promise<Buffer>;

    hits: number;
    misses: number;
}

function makeProducer(useCache: boolean): Producer {
    const p: Producer = {
        hits: 0,
        misses: 0,
        async produce(design, input) {
            if (!useCache) {
                p.misses++;
                return renderToBuffer(design, input);
            }
            const file = path.join(CACHE_DIR, `${cacheKey(design, input)}.png`);
            if (fs.existsSync(file)) {
                p.hits++;
                return fs.readFileSync(file);
            }
            p.misses++;
            const buffer = await renderToBuffer(design, input);
            ensureDir(CACHE_DIR);
            fs.writeFileSync(file, buffer);
            return buffer;
        },
    };
    return p;
}

// --- card inputs ------------------------------------------------------------

function resolveTranscriberLabel(pearl: PearlData, transcriber: Dialogue | null): string {
    if (!transcriber) return '';
    const { displayTranscriberName } = getTranscriberIcon(transcriber, pearl);
    const name = displayTranscriberName.startsWith('plain=') ? displayTranscriberName.slice('plain='.length) : displayTranscriberName;
    return decodeEntities(name);
}

function cardInput(pearl: PearlData, transcriberName: string | null, entryId: string): CardInput {
    const transcriber = transcriberForRoute(pearl, transcriberName);
    const entryIconSrc = getEntryIcon(pearl).asset.src;
    const transcriberIconSrc = transcriber ? getTranscriberIcon(transcriber, pearl).asset.src : null;
    return {
        pearl,
        transcriber,
        entryId,
        title: decodeEntities(transcriber?.metadata.name || pearl.metadata.name || pearl.id),
        transcriberName: resolveTranscriberLabel(pearl, transcriber),
        showTranscriberIcon: !!transcriber && transcriberIconSrc !== entryIconSrc,
        blocks: extractContent(transcriber),
    };
}

function loadDatasetPearls(dataset: Dataset): PearlData[] {
    return JSON.parse(fs.readFileSync(parsedDialoguesFile(dataset), 'utf8')) as PearlData[];
}

/** Route path "/CC/moon/" -> build/CC/moon/og.png. Mirrors how the routes phase places index.html. */
function ogFileForRoute(routePath: string): string {
    const relative = routePath.replace(/^\/+/, '');
    return path.join(relative ? path.join(BUILD_DIR, relative) : BUILD_DIR, OG_IMAGE_BASENAME);
}

// --- full build -------------------------------------------------------------

async function runFullBuild(useCache: boolean): Promise<void> {
    const log = phase('og');
    for (const preset of [PRESET_FLAT, PRESET_PHOTO]) {
        if (extensionFor(preset.format) !== path.extname(OG_IMAGE_BASENAME)) {
            throw new Error(`OG preset format (${preset.format}) does not match ${OG_IMAGE_BASENAME}. Update OG_IMAGE_BASENAME in routes.ts.`);
        }
    }
    log.reads('public/data/parsed-dialogues*.json, public/img');
    log.note(useCache ? `cache ${path.relative(SITE_DIR, CACHE_DIR)}` : 'cache disabled');
    registerFonts();

    const design = getDesign(DEFAULT_DESIGN_NAME);
    const producer = makeProducer(useCache);

    // Flatten every route to a card task up front so we know the total for progress and can render the pool over it.
    interface CardTask {
        pearl: PearlData;
        transcriberName: string | null;
        entryId: string;
        routePath: string
    }

    const tasks: CardTask[] = [];
    for (const dataset of DATASETS) {
        const pearls = loadDatasetPearls(dataset);
        const byId = new Map(pearls.map(p => [p.id, p]));
        for (const route of enumerateRoutes(dataset.key, pearls)) {
            const pearl = byId.get(route.pearlId);
            if (!pearl) continue;
            tasks.push({
                pearl,
                transcriberName: route.transcriberName,
                entryId: route.entryId,
                routePath: route.path
            });
        }
    }

    const concurrency = Number(process.env.OG_CONCURRENCY) || Math.max(1, os.cpus().length);
    log.note(`${tasks.length} cards, ${design.name} design, concurrency ${concurrency}`);

    let count = 0;
    let bytes = 0;
    const step = Math.max(1, Math.round(tasks.length / 20));
    await forEachConcurrent(tasks, concurrency, async (task) => {
        const buffer = await producer.produce(design, cardInput(task.pearl, task.transcriberName, task.entryId));
        const file = ogFileForRoute(task.routePath);
        ensureDir(path.dirname(file));
        fs.writeFileSync(file, buffer);
        count++;
        bytes += buffer.length;
        if (count % step === 0 || count === tasks.length) {
            log.note(`${count}/${tasks.length} (${Math.round((count / tasks.length) * 100)}%, ${producer.hits} cached)`);
        }
    });

    log.writes(`${count} og.png cards (${fmtBytes(bytes)})`);
    log.done(`${producer.hits} cached, ${producer.misses} rendered, avg ${fmtBytes(count ? bytes / count : 0)}`);
}

// --- test harness -----------------------------------------------------------

interface SheetCard {
    file: string;
    label: string
}

async function runTestSet(entries: OgEntrySpec[], out: string, useCache: boolean): Promise<void> {
    const log = phase('og:test');
    registerFonts();
    ensureDir(out);
    // Clear cards from a previous run so stale entries do not linger in the contact sheet folder.
    for (const f of fs.readdirSync(out)) if (f.endsWith('.png')) fs.rmSync(path.join(out, f));

    const design = getDesign(DEFAULT_DESIGN_NAME);
    const producer = makeProducer(useCache);
    const byDataset = new Map<string, PearlData[]>();
    const cards: SheetCard[] = [];

    for (const spec of entries) {
        const dataset = DATASETS.find(d => d.key === spec.datasetKey);
        if (!dataset) throw new Error(`Unknown dataset "${spec.datasetKey}".`);
        if (!byDataset.has(dataset.key)) byDataset.set(dataset.key, loadDatasetPearls(dataset));
        const pearls = byDataset.get(dataset.key)!;

        const resolved = resolveRoute({
            datasetKey: dataset.key,
            entryId: spec.entryId,
            transcriberName: spec.transcriberName,
            source: null
        }, pearls);
        if (!resolved) {
            log.note(`skipped ${spec.entryId} (not found in ${dataset.key})`);
            continue;
        }
        const input = cardInput(resolved.pearl, resolved.transcriberName, spec.entryId);
        const label = `${spec.entryId}${spec.transcriberName ? ' / ' + spec.transcriberName : ''}`;
        const buffer = await producer.produce(design, input);
        const file = `${label}.png`.replace(/[^\w.-]+/g, '_');
        fs.writeFileSync(path.join(out, file), buffer);
        cards.push({ file, label });
    }

    writeContactSheet(out, cards);
    log.writes(`${cards.length} cards + index.html in ${out}`);
    log.done();
}

/** A contact sheet: one labelled preview per requested entry, for a quick look at the shipped card. */
function writeContactSheet(out: string, cards: SheetCard[]): void {
    const figures = cards.map(c =>
        `<figure><img src="./${c.file}" alt="${c.label}"/><figcaption>${c.label}</figcaption></figure>`).join('\n');
    const html =
        `<!doctype html><meta charset="utf-8"><title>OG preview</title>` +
        `<style>body{background:#101010;color:#ccc;font-family:sans-serif;margin:24px}` +
        `h1{font-size:20px}` +
        `.row{display:flex;flex-wrap:wrap;gap:18px}` +
        `figure{margin:0}figcaption{margin-top:6px;font-size:13px;color:#888}` +
        `img{width:520px;max-width:100%;height:auto;border:1px solid #222;display:block}</style>` +
        `<h1>OG preview - ${cards.length} entries</h1><div class="row">${figures}</div>`;
    fs.writeFileSync(path.join(out, 'index.html'), html);
}

// --- entry point ------------------------------------------------------------

export async function runOg(options: OgOptions = {}): Promise<void> {
    const useCache = !options.noCache && !process.env.CI;
    if (options.entries && options.out) {
        await runTestSet(options.entries, options.out, useCache);
    } else {
        await runFullBuild(useCache);
    }
}
