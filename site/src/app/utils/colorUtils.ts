export function ensureMinLightness(color: string, minL = 55): string {
    if (!color) return color;

    if (color.startsWith('hsl')) {
        const m = color.match(/hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)/);
        if (!m) return color;
        const l = parseInt(m[3]);
        return l >= minL ? color : `hsl(${m[1]}, ${m[2]}%, ${minL}%)`;
    }

    if (color.startsWith('#')) {
        const hex = color.slice(1);
        const r = parseInt(hex.slice(0, 2), 16) / 255;
        const g = parseInt(hex.slice(2, 4), 16) / 255;
        const b = parseInt(hex.slice(4, 6), 16) / 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        const l = (max + min) / 2;
        if (l * 100 >= minL) return color;
        const d = max - min;
        const s = d === 0 ? 0 : (l > 0.5 ? d / (2 - max - min) : d / (max + min));
        let h = 0;
        if (d !== 0) {
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }
        return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${minL}%)`;
    }

    return color;
}

export const randomColor = () => {
    const h = Math.floor(Math.random() * 360);
    const s = 55 + Math.floor(Math.random() * 30);
    const l = 55 + Math.floor(Math.random() * 15);
    return `hsl(${h}, ${s}%, ${l}%)`;
};
