# pip install fonttools brotli

with open("../src/generated/parsed-dialogues.json", "r", encoding="utf-8") as f:
    data = f.read()

unique_chars = "".join(sorted(set(data)))

print(unique_chars)
# !"#$%&'()*+,-./0123456789:;<=>?ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]_abcdefghijklmnopqrstuvwxyz{|}~’…

with open("glyphs.txt", "w", encoding="utf-8") as f:
    f.write(unique_chars)
