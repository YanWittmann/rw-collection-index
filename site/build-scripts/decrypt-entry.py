import os
import argparse
import sys
import math
import re
from collections import Counter
from enum import Enum
from pathlib import Path

# ==========================================
# 1. CONFIGURATION & DATA
# ==========================================

RAW_STRING_BLOCK = """
IA/AF57P16dUz+wU1A/9K00Py47ND+8VBk/GRwEPxPE4D78LMM+WLCkPpQTjT5dJWY+Nhg+PuYNEz6WVOo9DpOoPZ11fT3DuTU9WigSP9yeKT8U+EQ/EghqPxKqbj8AAIA/pihwPzuncT9L2XI/In50PzpJdj9D4nY/CVV3P8/Hdz+VOng/tp56PwAAgD90eHo/ZEZ5P53TeD+57FA/wxcxPyjWFz90awE/6cbdPj6xvj7LUrY+KNaXPnRrgT4kbk8+BvonPgBRAj65qMc91tuRPW7PVD2aeCk/0tFEP9DhaT8AAIA/AACAPwAAgD8AAIA/AACAPwAAgD8AAIA/AACAPwAAgD8AAIA/AACAPwAAgD8AAIA/AACAPwAAgD8AAIA/AACAPxmHeD81oFA/P8swP6SJFz/vHgE/ZXrdPtG30j5HBrY+rCKYPu8egT4sB1A+/WAnPgjqAj6pdsY95g2TPZxOEj9YUik/Vh5FP467aT91kmw/AACAP2QCcD/5gHE/CbNyP+BXdD/4InY/Abx2P8cudz+NoXc/UxR4P9dgeD/f+Xg/pmx5PyEgeT9brXg/d8ZQP4HxMD/mrxc/MUUBP/Ar+j7okvk+3/n4PlUE0z7DubU+MG+YPmvSgD41oFA+9ccmPhCDAz6YRMU9xNMnP7oGQz8zymc/AACAPwAAgD8AAIA/AACAPzsFbT9vi0s/f71MP5iITj+gIU8/ZpRPP+rgTz9uLVA/+xJRP/CJdT9/X1E/PTlRP/N5UD8FPjE/YmMXPzhmFD+sgBM/pOcSP950Ej8H0BA/W634PtpQ0z4/bbU+tLuYPueFgD49OVE+7S4mPhkcBD6DgxA/gq0nP/wsQz/xo2c/VC5qPwAAgD99K20/+85HPxbOLT8eZy4/s+UvP3lYMD+pGEs/Q0ByP88lcz+uY3U/AACAP2w9dT+HVk0/R2QxP8wOLT9Hwiw/BZwsP3m2Kz/t0Co/ohEqPxYsKT9J9hA/12D4Pl6d0z67ILU+OAiZPmM5gD5F0lE+5ZUlPvXHJj9fFUE/wA1kPwAAgD8AAIA/AACAP/k8aD+AeUM/ToVEPx2RRT9nUEY/Z/JKPwEacj8AAIA/AACAPwAAgD8AAIA/AACAP9i+cz93JEw/kE1JPwwBST+ItEg/d4JHP+MDRj+YREU/BMZDP9QFKT8PaRE/UxT4PuLp0z421LQ+vFSZPr7Zfz5Na1I+OcQPP7OhJj+hO0E/fudjP699Zz8AAIA/bVdnP7cWaD+GImk/2HpqP+msaz8tw0Y/6z5LP7/zcT+N/3I/U3JzPwAAgD8a5XM/KnVwPyLcbz8aQ28/0INuP0s3bj/53mw/bflrP1zHaj9MlWk/DF9EPw6TKD8YAhI/S3v3PvIb1T4uO7Q+zYaaPq6nfj5p4iU/TuM/P6/bYj8AAIA/AACAPwAAgD8AAIA/AACAPwAAgD8AAIA/AACAP2Rgaz8Umkk/lvZuPwAAgD8AAIA/AACAPwAAgD8AAIA/AACAPwAAgD8AAIA/AACAPwAAgD8
"""

class LanguageID(Enum):
    English = 0; French = 1; Italian = 2; German = 3; Spanish = 4;
    Portuguese = 5; Japanese = 6; Korean = 7; Russian = 8; Chinese = 9

LANG_MAP = {
    "eng": LanguageID.English, "fre": LanguageID.French, "ita": LanguageID.Italian,
    "ger": LanguageID.German, "spa": LanguageID.Spanish, "por": LanguageID.Portuguese,
    "jap": LanguageID.Japanese, "kor": LanguageID.Korean, "rus": LanguageID.Russian,
    "chi": LanguageID.Chinese
}

SUCCESS, COPIED, SKIPPED, FAILED = "SUCCESS", "COPIED", "SKIPPED", "FAILED"

# ==========================================
# 2. CORE DECRYPTION LOGIC
# ==========================================

def get_encryption_key():
    clean_str = "".join(RAW_STRING_BLOCK.split())
    return clean_str[54 : 54 + 1447]

def calculate_checksum_salt(filename):
    clean_name = os.path.splitext(os.path.basename(filename))[0].lower()
    if "-" in clean_name: clean_name = clean_name.split("-")[0]
    if clean_name.isdigit(): return int(clean_name)
    return sum(ord(char) - ord('0') for char in clean_name)

def mix_displace(displace):
    val = (displace * 82) + (displace // 3) + (displace % 322) - (displace % 17) - ((displace * 7) % 811)
    return abs(val)

def xor_decrypt(text, displace):
    mixed_displace = mix_displace(displace)
    key = get_encryption_key()
    key_len = len(key)
    result = [chr(ord(char) ^ ord(key[(i + mixed_displace) % key_len])) for i, char in enumerate(text)]
    return "".join(result)

def score_text(text):
    if not text or len(text) < 20: return -1
    for char in text:
        if ord(char) < 32 and char not in '\r\n\t': return -1
    score = 0
    letters = [c.lower() for c in text if 'a' <= c.lower() <= 'z']
    if len(letters) > 20:
        counts = Counter(letters).values()
        mean = sum(counts) / len(counts)
        variance = sum([(c - mean) ** 2 for c in counts]) / len(counts)
        score += math.sqrt(variance) * 5
    words = text.split()
    if len(words) > 5:
        word_lengths = [len(w) for w in words]
        avg_len = sum(word_lengths) / len(word_lengths)
        score += max(0, 10 - abs(avg_len - 5.5))
        if max(word_lengths) > 25: score -= 10
    return score

def find_best_decryption(ciphertext, original_salt_num, lang_id, verbose=False):
    if verbose: print("\n[VERB] Standard decryption failed. Commencing smart search...")
    best_candidate, best_score, best_method = "", -1, "None"
    search_range = range(original_salt_num - 1000, original_salt_num + 1000)
    base_calc_standard = 54 + (lang_id * 7)

    for test_salt in search_range:
        for logic_type in ["Standard", "Strings.txt"]:
            displace = base_calc_standard + test_salt if logic_type == "Standard" else 12467 - test_salt
            candidate = xor_decrypt(ciphertext, displace)
            current_score = score_text(candidate)
            if current_score > best_score:
                best_score, best_candidate = current_score, candidate
                best_method = f"Smart Search ({logic_type} Logic, Salt: {test_salt})"
    if verbose and best_score > -1: print(f"[VERB] Scan complete. Found a match.")
    return best_candidate, best_method, best_score

def post_process_format(text):
    """Applies specific newline formatting based on the user's example."""
    if not text: return ""
    # First, normalize all line endings to \n
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    # Collapse any sequence of 3 or more newlines into a standard paragraph break (2 newlines)
    text = re.sub(r'\n{3,}', '\n\n', text)
    # Split the text into the header and the body
    parts = text.split('\n', 1)
    header = parts[0]
    if len(parts) > 1:
        # The body is the rest of the text, with its leading whitespace removed
        body = parts[1].lstrip()
        # Rejoin and strip any trailing whitespace from the whole block
        return f"{header}\n{body}".strip()
    else:
        # If there's only a header, just strip it
        return header.strip()

# ==========================================
# 3. FILE PROCESSING LOGIC
# ==========================================

def detect_language_from_path(file_path):
    try:
        parts = Path(file_path).resolve().parts
        for part in reversed(parts):
            if part.lower().startswith("text_"):
                lang_code = part.lower().replace("text_", "")[:3]
                if lang_code in LANG_MAP: return LANG_MAP[lang_code]
    except Exception: pass
    return None

def process_file(file_path, language, verbose=False):
    try:
        with open(file_path, 'rb') as f: raw_content = f.read()
        if raw_content.startswith(b'\xef\xbb\xbf'): raw_content = raw_content[3:]
        content = raw_content.decode('utf-8')
    except Exception as e: return FAILED, f"File read error: {e}", None

    if not content or content[0] != '1':
        return COPIED, "Not encrypted (copied as-is)", content

    ciphertext = content[1:]
    num_val = calculate_checksum_salt(file_path)
    lang_index = language.value
    displace = 54 + num_val + (lang_index * 7)
    result = xor_decrypt(ciphertext, displace)

    if score_text(result) > 10:
        return SUCCESS, f"Standard Logic (Salt: {num_val})", result
    else:
        final_result, method, score = find_best_decryption(ciphertext, num_val, lang_index, verbose)
        if score < 0: return FAILED, "No readable decryption found", None
        return SUCCESS, method, final_result

# ==========================================
# 4. MAIN EXECUTION & CLI
# ==========================================

def main():
    parser = argparse.ArgumentParser(
        description='A smart, versatile decryptor for Rain World text files.',
        formatter_class=argparse.RawTextHelpFormatter
    )
    parser.add_argument('path', help='Path to a single .txt file or a directory to scan recursively.')
    parser.add_argument('--lang', choices=[lang.name for lang in LanguageID], help='Manually specify language. Overrides auto-detection.')
    parser.add_argument('--output', metavar='<dir>', help="Custom output directory. \nDefault: A folder is created next to the input, named '<input>-decrypted'.")
    parser.add_argument('--stdout', action='store_true', help='Print decrypted content to the console instead of writing to files.')
    parser.add_argument('--format', action='store_true', help='Apply post-processing to normalize newlines and spacing for better readability.')
    parser.add_argument('-q', '--quiet', action='store_true', help='Suppress all informational output. Only returns exit codes.')
    parser.add_argument('-v', '--verbose', action='store_true', help='Print detailed, per-file information, such as the decryption method used.')
    args = parser.parse_args()

    input_path = Path(args.path)
    if not input_path.exists():
        if not args.quiet: print(f"[ERROR] Input path does not exist: {args.path}")
        sys.exit(1)

    # --- Determine Output Directory ---
    output_dir = None
    if not args.stdout:
        if args.output:
            output_dir = Path(args.output)
        else:
            output_dir = input_path.parent / (input_path.name + '-decrypted')

    # --- Find Files to Process ---
    files_to_process = []
    base_dir_for_relpath = input_path if input_path.is_dir() else input_path.parent
    if input_path.is_dir():
        for root, _, files in os.walk(input_path):
            if files: files_to_process.extend([Path(root) / f for f in files if f.lower().endswith('.txt')])
    else:
        files_to_process.append(input_path)

    if not files_to_process:
        if not args.quiet: print("[INFO] No .txt files found to process.")
        sys.exit(0)

    # --- Initialization Summary ---
    if not args.quiet:
        print("[INFO] Initializing Decryption Run...")
        print("="*60)
        print(f"  Mode:           {'Directory Scan' if input_path.is_dir() else 'Single File'}")
        print(f"  Input Path:     {input_path.resolve()}")
        output_mode = "Printing to Console" if args.stdout else f"Writing to directory {output_dir.resolve()}"
        print(f"  Output Mode:    {output_mode}")
        print(f"  Formatting:     {'Enabled' if args.format else 'Disabled'}")
        print(f"  Processing:     {len(files_to_process)} files")
        print("="*60)

    if output_dir: output_dir.mkdir(parents=True, exist_ok=True)

    stats = {SUCCESS: 0, COPIED: 0, SKIPPED: 0, FAILED: 0}
    failed_files = []

    # --- Main Processing Loop ---
    for i, file_path in enumerate(files_to_process):
        if not args.quiet and not args.verbose:
            progress = f"[{i+1}/{len(files_to_process)}]"
            stats_str = f"S:{stats[SUCCESS]}|C:{stats[COPIED]}|K:{stats[SKIPPED]}|F:{stats[FAILED]}"
            short_path = str(file_path.relative_to(base_dir_for_relpath))
            display_path = (short_path[:35] + '...') if len(short_path) > 38 else short_path
            print(f'\rProcessing: {progress} [{stats_str}] {display_path:<38}', end='')

        lang = LanguageID[args.lang] if args.lang else detect_language_from_path(file_path)
        if not lang:
            stats[SKIPPED] += 1
            if args.verbose: print(f"\n[VERB] Skipping {file_path}: Could not auto-detect language.")
            continue

        status, method, result = process_file(file_path, lang, args.verbose)
        stats[status] += 1

        if status == FAILED: failed_files.append((file_path, method))
        if status == SKIPPED and args.verbose: print(f"\n[VERB] Skipping: {method}")

        if status in (SUCCESS, COPIED):
            if args.format:
                result = post_process_format(result)

            if output_dir:
                relative_path = file_path.relative_to(base_dir_for_relpath)
                output_path = output_dir / relative_path
                output_path.parent.mkdir(parents=True, exist_ok=True)
                output_path.write_text(result, encoding='utf-8')
                if args.verbose: print(f"\n[VERB] {status}: Handled using method: {method}")
            elif not output_dir: # --stdout
                header = f"--- {file_path.name} ---"
                if args.verbose: header = f"--- {file_path.name} (Method: {method}) ---"
                print(f"\n{header}\n{result}\n")

    if not args.quiet:
        print('\r' + ' '*80 + '\r', end='')
        print("\n[INFO] Decryption run complete.")
        print("======================== RESULTS ========================")
        print(f"  Processed:      {len(files_to_process)} files")
        print(f"  Decrypted:      {stats[SUCCESS]}")
        print(f"  Copied:         {stats[COPIED]} (unencrypted)")
        print(f"  Skipped:        {stats[SKIPPED]}")
        print(f"  Failures:       {stats[FAILED]}")
        if failed_files:
            print("\n[FAIL] The following files could not be decrypted:")
            for f, reason in failed_files:
                print(f"  - {f.resolve()}\n    Reason: {reason}")
        print("="*55)

if __name__ == "__main__":
    main()
