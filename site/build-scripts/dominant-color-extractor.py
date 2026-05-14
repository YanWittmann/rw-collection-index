import os
import sys
import re
import argparse
import numpy as np
from PIL import Image
from sklearn.cluster import KMeans

def natural_sort_key(s):
    return [int(text) if text.isdigit() else text.lower() for text in re.split('([0-9]+)', s)]

def get_dominant_color(image_path):
    try:
        img = Image.open(image_path).convert('RGBA')
        img.thumbnail((100, 100))

        arr = np.array(img)
        pixels = arr.reshape(-1, 4)

        opaque_pixels = pixels[pixels[:, 3] >= 128]

        if len(opaque_pixels) == 0:
            return "#000000"

        rgb_pixels = opaque_pixels[:, :3]

        non_black_mask = np.max(rgb_pixels, axis=1) > 20
        if np.any(non_black_mask):
            rgb_pixels = rgb_pixels[non_black_mask]

        n_clusters = min(3, len(np.unique(rgb_pixels, axis=0)))
        if n_clusters == 0:
            return "#000000"

        kmeans = KMeans(n_clusters=n_clusters, n_init='auto', random_state=0)
        kmeans.fit(rgb_pixels)

        counts = np.bincount(kmeans.labels_)
        dominant_index = np.argmax(counts)
        dominant_color = kmeans.cluster_centers_[dominant_index]

        return "#{:02x}{:02x}{:02x}".format(
            int(round(dominant_color[0])),
            int(round(dominant_color[1])),
            int(round(dominant_color[2]))
        )
    except Exception:
        return "#000000"

def process_directory(base_dir):
    results = {}
    valid_extensions = {'.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'}

    files_to_process = []
    for root, _, files in os.walk(base_dir):
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext in valid_extensions:
                files_to_process.append(os.path.join(root, file))

    total_files = len(files_to_process)

    for i, full_path in enumerate(files_to_process, 1):
        rel_path = os.path.relpath(full_path, start=os.path.dirname(base_dir) or '.')
        posix_rel_path = rel_path.replace(os.sep, '/')

        sys.stderr.write(f"\rProcessing {i}/{total_files}: {posix_rel_path}".ljust(80)[:80])
        sys.stderr.flush()

        color = get_dominant_color(full_path)
        results[posix_rel_path] = color

    sys.stderr.write("\r" + " " * 80 + "\r")
    sys.stderr.flush()

    return results

def format_custom_json(data, max_len):
    lines = ["{"]
    current_line = "  "

    keys = sorted(data.keys(), key=natural_sort_key)

    for i, k in enumerate(keys):
        v = data[k]
        entry = f'"{k}": "{v}"'
        if i < len(keys) - 1:
            entry += ","

        if current_line == "  ":
            current_line += entry
        elif len(current_line) + 1 + len(entry) <= max_len:
            current_line += " " + entry
        else:
            lines.append(current_line)
            current_line = "  " + entry

    if current_line != "  ":
        lines.append(current_line)

    lines.append("}")
    return "\n".join(lines)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("directory")
    parser.add_argument("--max-length", type=int, default=120)
    args = parser.parse_args()

    if not os.path.isdir(args.directory):
        sys.exit(1)

    color_data = process_directory(args.directory)
    output = format_custom_json(color_data, args.max_length)
    print(output)

if __name__ == "__main__":
    main()
