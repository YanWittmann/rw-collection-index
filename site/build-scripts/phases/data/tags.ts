/** Final tag pass: anything not flagged downpour or watcher counts as vanilla content. */

import { Entry } from './variables';

export function postProcessTags(entry: Entry): void {
    const modded = !!entry.metadata.mod;
    for (const transcriber of entry.transcribers) {
        const tags: string[] = transcriber.metadata.tags || (transcriber.metadata.tags = []);
        if (!tags.includes('downpour') && !tags.includes('watcher')) tags.push('vanilla');
        if (modded && !tags.includes('modded')) tags.push('modded');
    }
}
