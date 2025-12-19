export const hexToRgba = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b, a: 255 };
};

/**
 * Creates a Canvas element with the tinted icon drawn onto it.
 */
export const generateTintedCanvas = async (
    type: string,
    color: string | null,
    width: number,
    height: number
): Promise<HTMLCanvasElement> => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    if (!ctx) throw new Error("Could not get canvas context");

    ctx.imageSmoothingEnabled = false; // Keep pixel art sharp

    // Load the icon image
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.src = `img/${type}.png`;
        image.crossOrigin = "anonymous";
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Failed to load icon image"));
    });

    // Draw original image
    ctx.drawImage(img, 0, 0, width, height);

    // Apply Tint if color exists
    if (color) {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        const rgba = hexToRgba(color);

        const scaleFrom255To1 = (value: number) => value / 255;
        const scaleFrom1To255 = (value: number) => value * 255;

        for (let i = 0; i < data.length; i += 4) {
            // Standard Rain World coloring logic: multiply texture value by color value
            if (data[i + 3] > 0) { // If not transparent
                data[i] = scaleFrom1To255(scaleFrom255To1(rgba.r) * scaleFrom255To1(data[i]));
                data[i + 1] = scaleFrom1To255(scaleFrom255To1(rgba.g) * scaleFrom255To1(data[i + 1]));
                data[i + 2] = scaleFrom1To255(scaleFrom255To1(rgba.b) * scaleFrom255To1(data[i + 2]));
            }
        }
        ctx.putImageData(imageData, 0, 0);
    }

    return canvas;
};

/**
 * Wrapper that returns a Base64 Data URL string (useful for Favicons).
 */
export const generateTintedImage = async (
    type: string,
    color: string | null,
    size: number = 64
): Promise<string> => {
    const canvas = await generateTintedCanvas(type, color, size, size);
    return canvas.toDataURL('image/png');
};
