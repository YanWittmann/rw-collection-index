import sanitizeHtml from 'sanitize-html';

export function renderDialogueLine(line: string) {
    line = line.replace(/\\n/g, "<br>").replace(/\n/g, "<br>");
    return sanitizeHtmlSafe(line);
}

export function sanitizeHtmlSafe(line: string) {
    return sanitizeHtml(line, {
        allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'mark'],
        allowedAttributes: {
            'a': ['href'],
            'mark': ['class'],
            'span': ['class'],
        }
    });
}