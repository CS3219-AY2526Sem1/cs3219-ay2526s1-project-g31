import os
import shutil
import zipfile
from pathlib import Path

ROOT_DIR = Path(__file__).parent
OUTPUT_ZIP = ROOT_DIR / "env_files.zip"
TEMP_DIR = ROOT_DIR / "_collected_envs"
TARGET_FILES = [".env", ".env.production.local"]

# Clean up and recreate temp folder
if TEMP_DIR.exists():
    shutil.rmtree(TEMP_DIR)
TEMP_DIR.mkdir(parents=True, exist_ok=True)

def copy_env_files(src_dir: Path, rel_dir: Path):
    """Copy .env files from src_dir into TEMP_DIR/rel_dir."""
    copied = False
    target_folder = TEMP_DIR / rel_dir
    for filename in TARGET_FILES:
        file_path = src_dir / filename
        if file_path.exists():
            target_folder.mkdir(parents=True, exist_ok=True)
            shutil.copy2(file_path, target_folder / filename)
            copied = True
    if copied:
        print(f"Copied env files from: {rel_dir or '.'}")

# 1️⃣ Root directory
copy_env_files(ROOT_DIR, Path())

# 2️⃣ One level of subdirectories
for item in ROOT_DIR.iterdir():
    if item.is_dir() and not item.name.startswith(".") and item != TEMP_DIR:
        copy_env_files(item, item.name)

# 3️⃣ Create zip
with zipfile.ZipFile(OUTPUT_ZIP, "w", zipfile.ZIP_DEFLATED) as zipf:
    for root, _, files in os.walk(TEMP_DIR):
        for file in files:
            file_path = Path(root) / file
            zipf.write(file_path, file_path.relative_to(TEMP_DIR))

print(f"\n✅ Done! Created ZIP at: {OUTPUT_ZIP}")
