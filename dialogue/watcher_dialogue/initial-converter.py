from pathlib import Path
import re

def main():
    directory = Path(".")
    output_path = directory / "parsed_output.txt"
    files = sorted(f for f in directory.glob("*.txt") if f.name != "strings.txt")

    with output_path.open("w", encoding="utf-8") as out_file:
        out_file.write("type: item\nsubType: watcher\ntag: watcher\n\n")
        for file in files:
            lines = file.read_text(encoding="utf-8").splitlines()[1:]
            cleaned = []
            for line in lines:
                line = line.replace("<LINE>", "\\n").strip()
                match = re.match(r"^\d+\s*:\s*\d+\s*:\s*(.*)", line)
                if match:
                    cleaned.append(match.group(1).strip())
                elif line:
                    cleaned.append(line)
            content = "\n".join(cleaned)
            out_file.write(f"=== transcription: watcher\n")
            out_file.write(f"md-var-DialogueId: {file.name}\n")
            out_file.write(f"md-name: Unclassified {file.name}\n")
            out_file.write(f"md-sourceDialogue: {file.name}\n")
            out_file.write(f"{content}\n\n")

if __name__ == "__main__":
    main()
