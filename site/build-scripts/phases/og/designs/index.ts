/**
 * The OG card design registry.
 * A design is a self-contained function that draws one card. The site currently ships a single design
 * (reader); the registry is kept so the full build and the preview harness select it by name and the
 * version-based cache invalidates cleanly when the look changes.
 */

import type { Ctx } from '../toolkit';
import type { Dialogue, PearlData } from '../../../../src/app/types/types';
import type { ContentBlock } from '../../../../src/app/utils/dialogueParsing';
import { reader } from './reader';

export interface CardInput {
    pearl: PearlData;
    transcriber: Dialogue | null;
    entryId: string;
    /** Resolved headline, matching the live app: per-transcription name, then pearl name, then id. */
    title: string;
    /** Resolved transcriber label as the app renders it; '' when the route has no transcriber. */
    transcriberName: string;
    /** False when there is no transcriber or its icon equals the entry icon (e.g. broadcasts), so designs can skip it. */
    showTranscriberIcon: boolean;
    blocks: ContentBlock[];
}

export interface Design {
    /** Stable id used in filenames, the cache key and the --designs flag. */
    name: string;
    /** Bump when you change this design's look, so the local cache regenerates its cards. */
    version: number;
    width: number;
    height: number;

    render(ctx: Ctx, input: CardInput): Promise<void>;
}

/** Every known design. The key must equal the design's own name. */
export const DESIGNS: Record<string, Design> = {
    [reader.name]: reader,
};

/** The design the full site build and the preview harness render. */
export const DEFAULT_DESIGN_NAME = 'reader';

export function getDesign(name: string): Design {
    const design = DESIGNS[name];
    if (!design) throw new Error(`Unknown design "${name}". Known: ${Object.keys(DESIGNS).join(', ')}.`);
    return design;
}
