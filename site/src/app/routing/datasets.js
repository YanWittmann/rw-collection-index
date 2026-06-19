/**
 * Single source of truth for the datasets the collection index serves
 * (vanilla, modded, and any future addition).
 *
 * This file is intentionally plain CommonJS with NO node builtins (no `path`,
 * no `fs`), so it can be safely:
 *   - bundled into the browser app (imported from .ts/.tsx),
 *   - imported by the tsx build scripts (generate-routes.ts),
 *   - require()'d by plain-node build scripts (create-dialogue-files.js).
 *
 * Adding a dataset is a one-line change here; nothing downstream hardcodes
 * "modded". The route prefix, json file suffix and dialogue source folder all
 * flow from this list.
 */

/**
 * @typedef {Object} DatasetDef
 * @property {string} key           Stable identifier used in code/state (e.g. "vanilla").
 * @property {string} routePrefix   First path segment for this dataset. "" = served at root.
 * @property {string} jsonSuffix    Suffix on the generated data files (e.g. "-modded"; "" for vanilla).
 * @property {string} dialogueDir   Source dialogue folder, relative to /site (used only by build scripts).
 * @property {string[]} inheritanceSources  Dataset keys this one inherits metadata from.
 */

/** @type {DatasetDef[]} */
const DATASETS = [
    {
        key: 'vanilla',
        routePrefix: '',
        jsonSuffix: '',
        dialogueDir: '../dialogue',
        inheritanceSources: [],
    },
    {
        key: 'modded',
        routePrefix: 'modded',
        jsonSuffix: '-modded',
        dialogueDir: '../dialogue-modded',
        inheritanceSources: ['vanilla'],
    },
];

/** The dataset served at the site root (the one with an empty routePrefix). */
const DEFAULT_DATASET_KEY = 'vanilla';

/** @param {string} key */
function getDataset(key) {
    return DATASETS.find(d => d.key === key) || null;
}

/**
 * Resolve a dataset from the first path segment.
 * An empty/unknown prefix maps to the default (root) dataset.
 * @param {string} prefix
 */
function getDatasetByPrefix(prefix) {
    if (!prefix) return getDataset(DEFAULT_DATASET_KEY);
    return DATASETS.find(d => d.routePrefix === prefix) || null;
}

/** Non-empty route prefixes, e.g. ["modded"]. Used to detect dataset segments. */
const DATASET_PREFIXES = DATASETS.map(d => d.routePrefix).filter(Boolean);

module.exports = {
    DATASETS,
    DEFAULT_DATASET_KEY,
    DATASET_PREFIXES,
    getDataset,
    getDatasetByPrefix,
};
