/**
 * One logging shape for the whole pipeline.
 * A phase opens with a banner, reports what it reads and writes, and closes with its timing, so the build log reads as a sequence of self-describing steps rather than scattered prints.
 */

const t = () => new Date().toISOString().slice(11, 19);

function fmtDuration(ms: number): string {
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

export function fmtBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export class PhaseLog {
    private readonly start = Date.now();

    constructor(public readonly name: string) {
        console.log(`\n[${t()}] > ${name}`);
    }

    /** A source this phase consumes. */
    reads(what: string): void {
        console.log(`    in   ${what}`);
    }

    /** An artifact this phase produces. */
    writes(what: string): void {
        console.log(`    out  ${what}`);
    }

    /** A free-form progress or summary note. */
    note(message: string): void {
        console.log(`    -    ${message}`);
    }

    done(summary?: string): void {
        const elapsed = fmtDuration(Date.now() - this.start);
        console.log(`[${t()}] ✓ ${this.name}${summary ? ` - ${summary}` : ''} (${elapsed})`);
    }
}

export function phase(name: string): PhaseLog {
    return new PhaseLog(name);
}
