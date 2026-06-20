/** Final tag pass: anything not flagged downpour or watcher counts as vanilla content. */

import { Entry } from './variables';

export function postProcessTags(entry: Entry): void {
    for (const transcriber of entry.transcribers) {
        const tags: string[] = transcriber.metadata.tags || (transcriber.metadata.tags = []);
        if (!tags.includes('downpour') && !tags.includes('watcher')) tags.push('vanilla');
    }
}
