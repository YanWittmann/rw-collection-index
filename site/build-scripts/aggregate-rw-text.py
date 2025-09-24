import json
import os

def scan_directory(input_dir, path_filter=None, read_content=True):
    files_data = []
    is_extension_filter = isinstance(path_filter, set)

    if not os.path.isdir(input_dir):
        return files_data

    for dirpath, dirnames, filenames in os.walk(input_dir):
        for filename in filenames:
            if path_filter:
                if is_extension_filter:
                    if not any(filename.lower().endswith(ext) for ext in path_filter):
                        continue
                elif path_filter not in os.path.join(dirpath, filename):
                    continue

            input_path = os.path.join(dirpath, filename)
            relative_path = os.path.relpath(input_path, ".")

            obj = {
                "n": filename,
                "p": relative_path.replace('\\', '/')
            }

            if input_dir == "img":
                obj["p"] = obj["p"].replace("img/", "src/")

            if read_content:
                content = ""
                try:
                    with open(input_path, 'r', encoding='utf-8') as file:
                        content = file.read()
                except UnicodeDecodeError:
                    pass
                obj["c"] = content

            files_data.append(obj)
    return files_data


def write_json(data, output_file):
    with open(output_file, 'w', encoding='utf-8') as json_file:
        json.dump(data, json_file, separators=(',', ':'))


image_extensions = {'.png', '.jpg', '.jpeg', '.gif', '.bmp'}

decrypted_files = scan_directory(".", path_filter="text_eng", read_content=True)
dll_files = scan_directory(".", path_filter="dll", read_content=True)
image_files = scan_directory("img", path_filter=image_extensions, read_content=False)

combined_files = decrypted_files + dll_files + image_files
write_json(combined_files, "decrypted.json")
