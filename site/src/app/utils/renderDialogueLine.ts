import sanitizeHtml from 'sanitize-html';

export function renderDialogueLine(line: string) {
    line = line.replace(/\\n/g, "<br>").replace(/\n/g, "<br>");
    return sanitizeHtml(line, {
        allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
        allowedAttributes: {
            'a': ['href']
        }
    });
}