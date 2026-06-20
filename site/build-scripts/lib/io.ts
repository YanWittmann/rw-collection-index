/** Filesystem helpers shared by the build phases. */

import * as fs from 'fs';
import * as path from 'path';

export function readText(file: string): string {
    return fs.readFileSync(file, 'utf8');
}

export function readJson<T = unknown>(file: string): T {
    return JSON.parse(readText(file)) as T;
}

export function ensureDir(dir: string): void {
    fs.mkdirSync(dir, { recursive: true });
}

export function writeText(file: string, content: string): void {
    ensureDir(path.dirname(file));
    fs.writeFileSync(file, content);
}

export function writeJson(file: string, value: unknown, pretty = false): void {
    writeText(file, JSON.stringify(value, null, pretty ? 2 : 0));
}

/** Replace a directory with a fresh copy of another one. */
export function replaceDir(from: string, to: string): void {
    fs.rmSync(to, { recursive: true, force: true });
    fs.cpSync(from, to, { recursive: true });
}

/** Every file under dir matching one of the extensions (e.g. [".txt"]), recursively. */
export function filesByExtension(dir: string, extensions: string[]): string[] {
    const out: string[] = [];
    const walk = (current: string) => {
        for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
            const full = path.join(current, entry.name);
            if (entry.isDirectory()) walk(full);
            else if (extensions.some(ext => entry.name.endsWith(ext))) out.push(full);
        }
    };
    walk(dir);
    return out;
}

export function totalSize(files: string[]): number {
    return files.reduce((sum, file) => sum + fs.statSync(file).size, 0);
}
