import os
import io
import re
import json
from enum import Enum


class LanguageID(Enum):
    English = 0
    French = 1
    Italian = 2
    German = 3
    Spanish = 4
    Portuguese = 5
    Japanese = 6
    Korean = 7
    Russian = 8
    Chinese = 9


encrptString = "IA/AF57P16dUz+wU1A/9K00Py47ND+8VBk/GRwEPxPE4D78LMM+WLCkPpQTjT5dJWY+Nhg+PuYNEz6WVOo9DpOoPZ11fT3DuTU9WigSP9yeKT8U+EQ/EghqPxKqbj8AAIA/pihwPzuncT9L2XI/In50PzpJdj9D4nY/CVV3P8/Hdz+VOng/tp56PwAAgD90eHo/ZEZ5P53TeD+57FA/wxcxPyjWFz90awE/6cbdPj6xvj7LUrY+KNaXPnRrgT4kbk8+BvonPgBRAj65qMc91tuRPW7PVD2aeCk/0tFEP9DhaT8AAIA/AACAPwAAgD8AAIA/AACAPwAAgD8AAIA/AACAPwAAgD8AAIA/AACAPwAAgD8AAIA/AACAPwAAgD8AAIA/AACAPxmHeD81oFA/P8swP6SJFz/vHgE/ZXrdPtG30j5HBrY+rCKYPu8egT4sB1A+/WAnPgjqAj6pdsY95g2TPZxOEj9YUik/Vh5FP467aT91kmw/AACAP2QCcD/5gHE/CbNyP+BXdD/4InY/Abx2P8cudz+NoXc/UxR4P9dgeD/f+Xg/pmx5PyEgeT9brXg/d8ZQP4HxMD/mrxc/MUUBP/Ar+j7okvk+3/n4PlUE0z7DubU+MG+YPmvSgD41oFA+9ccmPhCDAz6YRMU9xNMnP7oGQz8zymc/AACAPwAAgD8AAIA/AACAPzsFbT9vi0s/f71MP5iITj+gIU8/ZpRPP+rgTz9uLVA/+xJRP/CJdT9/X1E/PTlRP/N5UD8FPjE/YmMXPzhmFD+sgBM/pOcSP950Ej8H0BA/W634PtpQ0z4/bbU+tLuYPueFgD49OVE+7S4mPhkcBD6DgxA/gq0nP/wsQz/xo2c/VC5qPwAAgD99K20/+85HPxbOLT8eZy4/s+UvP3lYMD+pGEs/Q0ByP88lcz+uY3U/AACAP2w9dT+HVk0/R2QxP8wOLT9Hwiw/BZwsP3m2Kz/t0Co/ohEqPxYsKT9J9hA/12D4Pl6d0z67ILU+OAiZPmM5gD5F0lE+5ZUlPvXHJj9fFUE/wA1kPwAAgD8AAIA/AACAP/k8aD+AeUM/ToVEPx2RRT9nUEY/Z/JKPwEacj8AAIA/AACAPwAAgD8AAIA/AACAP9i+cz93JEw/kE1JPwwBST+ItEg/d4JHP+MDRj+YREU/BMZDP9QFKT8PaRE/UxT4PuLp0z421LQ+vFSZPr7Zfz5Na1I+OcQPP7OhJj+hO0E/fudjP699Zz8AAIA/bVdnP7cWaD+GImk/2HpqP+msaz8tw0Y/6z5LP7/zcT+N/3I/U3JzPwAAgD8a5XM/KnVwPyLcbz8aQ28/0INuP0s3bj/53mw/bflrP1zHaj9MlWk/DF9EPw6TKD8YAhI/S3v3PvIb1T4uO7Q+zYaaPq6nfj5p4iU/TuM/P6/bYj8AAIA/AACAPwAAgD8AAIA/AACAPwAAgD8AAIA/AACAP2Rgaz8Umkk/lvZuPwAAgD8AAIA/AACAPwAAgD8AAIA/AACAPwAAgD8AAIA/AACAPwAAgD8"


def EncryptionString():
    return encrptString[54:1501]


def CheckSumSalt():
    return encrptString[64:161]


def xorEncrypt(sA, displace):
    displace = abs(displace * 82 + displace // 3 + displace % 322 - displace % 17 - displace * 7 % 811)
    text = ""
    encryptionString = EncryptionString()
    for i in range(len(sA)):
        text += chr(ord(sA[i]) ^ ord(encryptionString[(i + displace) % len(encryptionString)]))
    return text


def remove_bom(text):
    # Check if the text starts with a BOM and remove it
    if text[:3] == b'\xef\xbb\xbf':
        return text[3:]
    return text


def encrypt_decrypt_file(path, encrypt_mode, return_only=True):
    if "strings.txt" in path.lower():
        with open(path, 'rb', newline=None) as f:
            text = f.read()
            text = remove_bom(text)
            return text.decode('utf8')

    try:
        with open(path, 'rb', newline=None) as f:
            text = f.read()
            text = remove_bom(text)
            text = text.decode('utf8')
    except Exception as e:
        print(f"Error reading file: {e}")
        return None

    if not text:
        print("File is empty")
        return None

    expected_char = '0' if encrypt_mode else '1'
    if text[0] != expected_char:
        print(f"File is not in expected mode: '{text[0]}'")
        print(text)
        return None

    dir_name = os.path.dirname(path).lower()
    language_id = None

    if "text_" in dir_name:
        start_index = dir_name.rfind("text_") + 5
        value = dir_name[start_index:start_index + 3]
        for lang_entry in LanguageID:
            if lang_entry.name.lower().startswith(value):
                language_id = lang_entry
                break
        print("Language ID found", language_id, language_id.value)
    else:
        print("Language ID not found (0)", dir_name)

    file_base = os.path.splitext(os.path.basename(path))[0].lower()
    s = file_base.split('-')[0] if '-' in file_base else file_base

    try:
        num = int(s)
        if "strings.txt" in path.lower():
            encrypted_text = xorEncrypt(text, 12467 - num)
        else:
            if language_id is None:
                print("Language ID not found (1)")
                return None
            key = 54 + num + (language_id.value * 7)
            encrypted_text = xorEncrypt(text, key)

        new_text = ('1' if encrypt_mode else '0') + encrypted_text[1:]
        if not return_only:
            with open(path, 'w', encoding='utf8', newline=None) as f:
                f.write(new_text)
        return new_text

    except ValueError:
        pass

    if language_id is None:
        print("Language ID not found (2)")
        return None

    num_sum = sum(int(c) for c in s if c.isdigit())
    if "strings.txt" in path.lower():
        encrypted_text = xorEncrypt(text, 12467)
    else:
        key = 54 + num_sum + (language_id.value * 7)
        encrypted_text = xorEncrypt(text, key)

    new_text = ('1' if encrypt_mode else '0') + encrypted_text[1:]
    if not return_only:
        with open(path, 'w', encoding='utf8', newline=None) as f:
            f.write(new_text)
    return new_text


def remove_newlines(text):
    return text.replace("\r\n\r\n", "\r\n")


def decrypt_single_file(input_path, output_path):
    processed_content = encrypt_decrypt_file(input_path, False)
    if processed_content is None:
        print(f"Failed to process {input_path}")
        return

    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, 'w', encoding='utf-8', newline=None) as file:
        file.write(remove_newlines(processed_content))


def process_directory(input_dir, output_dir):
    for dirpath, dirnames, filenames in os.walk(input_dir):
        for filename in filenames:
            input_path = os.path.join(dirpath, filename)

            relative_path = os.path.relpath(input_path, input_dir)

            output_path = os.path.join(output_dir, relative_path)

            os.makedirs(os.path.dirname(output_path), exist_ok=True)

            decrypt_single_file(input_path, output_path)
            print(f"Processed {input_path} -> {output_path}")


process_directory(
    "RainWorld_Data/StreamingAssets/text",
    "decrypted/vanilla"
)
process_directory(
    "RainWorld_Data/StreamingAssets/mods/moreslugcats/text",
    "decrypted/dp"
)

### SECTION: write into a single file

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


decrypted_files = scan_directory("decrypted", "text_eng")
write_json(decrypted_files, "decrypted.json")
