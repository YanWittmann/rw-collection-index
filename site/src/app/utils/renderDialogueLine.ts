import sanitizeHtml from 'sanitize-html';

const sanitizeCache = new Map<string, string>();
const renderCache = new Map<string, string>();

export function renderDialogueLine(line: string) {
    const cached = renderCache.get(line);
    if (cached !== undefined) return cached;
    const result = sanitizeHtmlSafe(line.replace(/\\n/g, "<br>").replace(/\n/g, "<br>"));
    renderCache.set(line, result);
    return result;
}

export function sanitizeHtmlSafe(line: string) {
    const cached = sanitizeCache.get(line);
    if (cached !== undefined) return cached;
    const result = sanitizeHtml(line, {
        allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'mark'],
        allowedAttributes: {
            'a': ['href'],
            'mark': ['class'],
            'span': ['class'],
        }
    });
    sanitizeCache.set(line, result);
    return result;
}