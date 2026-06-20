/**
 * Optional source matching (the --sourceFiles step).
 * Builds an inverted token index over the game's decrypted text dump, then matches a transcriber's lines to the original game file they were transcribed from via Levenshtein.
 */

import levenshtein from 'fast-levenshtein';

import { readJson } from '../../lib/io';
import { SourceMatcher } from './parse';

const STOP_WORDS = new Set([
    'the', 'and', 'for', 'that', 'this', 'with', 'you', 'not', 'are', 'but',
    'from', 'what', 'all', 'were', 'when', 'can', 'said', 'there', 'use',
    'each', 'which', 'she', 'how', 'their', 'if', 'will', 'up', 'other',
    'about', 'out', 'many', 'then', 'them', 'these', 'so', 'some', 'her',
    'would', 'make', 'like', 'him', 'into', 'time', 'has', 'look', 'two',
    'more', 'write', 'go', 'see', 'number', 'no', 'way', 'could', 'people',
    'my', 'than', 'first', 'water', 'been', 'call', 'who', 'oil', 'its', 'now',
    'find', 'long', 'down', 'day', 'did', 'get', 'come', 'made', 'may', 'part',
]);

function getTokens(text: string): Set<string> {
    if (!text) return new Set();
    const matches = text.toLowerCase().match(/\w{3,}/g) || [];
    const tokens = new Set<string>();
    for (const m of matches) {
        if (!STOP_WORDS.has(m)) tokens.add(m);
    }
    return tokens;
}

interface SourceEntry {
    p: string;
    c: string;
    linesA: string[];
    linesB: string[];
    tokens: Set<string>;
}

function loadSourceEntries(file: string): SourceEntry[] {
    const raw = readJson<any[]>(file);
    return raw.filter(entry => entry.c !== undefined).map(entry => ({
        ...entry,
        linesA: entry.c.split(/\n|<LINE>/).map((l: string) => l.replace(/^((\d+|[A-Z]+) : )+/, '').trim()).filter((l: string) => l),
        linesB: entry.c.split(/\n/).map((l: string) => l.replace(/^((\d+|[A-Z]+) : )+/, '').trim()).filter((l: string) => l),
        tokens: getTokens(entry.c),
    }));
}

function normalizedLevenshtein(a: string, b: string): number {
    const maxLength = Math.max(a.length, b.length);
    if (maxLength === 0) return 0;
    return 1 - levenshtein.get(a, b) / maxLength;
}

function checkLinesMatch(lines: string[], entryLines: string[]): { matchPercentage: number; totalScore: number } {
    let matchCount = 0;
    let totalScore = 0;

    lines.forEach(line => {
        let maxLineScore = 0;
        for (const entryLine of entryLines) {
            const score = normalizedLevenshtein(line, entryLine);
            if (score > maxLineScore) maxLineScore = score;
            if (maxLineScore === 1) break;
        }
        if (maxLineScore >= 0.4) matchCount++;
        totalScore += maxLineScore;
    });

    return { matchPercentage: (matchCount / lines.length) * 100, totalScore };
}

/**
 * Load the game text dump for a dialogue folder and return a matcher.
 * The matcher takes a transcriber's raw lines and returns the best-matching source file id, or null.
 */
export function createSourceMatcher(decryptedJsonFile: string): SourceMatcher {
    const entries = loadSourceEntries(decryptedJsonFile);

    const tokenIndex = new Map<string, SourceEntry[]>();
    entries.forEach(entry => {
        for (const token of entry.tokens) {
            let list = tokenIndex.get(token);
            if (!list) tokenIndex.set(token, (list = []));
            list.push(entry);
        }
    });

    return (rawLines: string[]): string | null => {
        let lines = [...rawLines];
        lines = lines.filter(line => !line.includes('MONO'));
        lines = lines.filter(line => !line.startsWith('/') && !line.startsWith('~'));
        lines = lines.map(line => line.replace(/^\|/, '').trim());
        lines = lines.flatMap(line => line.split('\\n'));
        lines = lines.filter(line => line.trim().length > 0);

        if (lines.length === 0) return null;

        const inputTokens = getTokens(lines.join(' '));
        let candidates = entries;

        if (inputTokens.size > 0) {
            const scores = new Map<SourceEntry, number>();
            for (const token of inputTokens) {
                const matches = tokenIndex.get(token);
                if (matches) {
                    for (const entry of matches) scores.set(entry, (scores.get(entry) || 0) + 1);
                }
            }
            if (scores.size > 0) {
                candidates = [...scores.entries()]
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 25)
                    .map(c => c[0]);
            }
        }

        let bestMatch: SourceEntry | null = null;
        let bestScore = -1;

        candidates.forEach(entry => {
            let { matchPercentage, totalScore } = checkLinesMatch(lines, entry.linesA);
            if (matchPercentage < 80) {
                const resultB = checkLinesMatch(lines, entry.linesB);
                if (resultB.matchPercentage >= 80) {
                    matchPercentage = resultB.matchPercentage;
                    totalScore = resultB.totalScore;
                }
            }
            if (matchPercentage >= 80) {
                const averageScore = totalScore / lines.length;
                if (averageScore > bestScore) {
                    bestScore = averageScore;
                    bestMatch = entry;
                }
            }
        });

        if (!bestMatch) {
            console.log('No match found for:', lines);
            return null;
        }
        return (bestMatch as SourceEntry).p;
    };
}
