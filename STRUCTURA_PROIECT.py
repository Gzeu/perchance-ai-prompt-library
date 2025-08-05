import os

def tree(dir_path, output_file="structura_proiectului.txt"):
    with open(output_file, "w", encoding="utf-8") as f:
        for root, dirs, files in os.walk(dir_path):
            level = root.replace(dir_path, '').count(os.sep)
            indent = '    ' * level
            f.write(f"{indent}{os.path.basename(root)}/\n")
            sub_indent = '    ' * (level + 1)
            for file in files:
                f.write(f"{sub_indent}{file}\n")

if __name__ == "__main__":
    tree(".")  # sau înlocuiește "." cu altă cale dacă vrei să scanezi alt director
