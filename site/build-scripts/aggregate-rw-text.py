import json
import os

def scan_directory(input_dir, path_filter=None):
    files_data = []
    for dirpath, dirnames, filenames in os.walk(input_dir):
        for filename in filenames:
            input_path = os.path.join(dirpath, filename)

            relative_path = os.path.relpath(input_path, input_dir)
            if path_filter and path_filter not in relative_path:
                continue

            with open(input_path, 'r', encoding='utf-8', newline=None) as file:
                content = file.read()

            files_data.append({
                "n": filename,
                "p": relative_path,
                "c": content
            })

    return files_data


def write_json(data, output_file):
    with open(output_file, 'w', encoding='utf-8') as json_file:
        json.dump(data, json_file, separators=(',', ':'))


decrypted_files = scan_directory(".", "text_eng")
dll_files = scan_directory(".", "dll")

combined_files = decrypted_files + dll_files
write_json(combined_files, "decrypted.json")
