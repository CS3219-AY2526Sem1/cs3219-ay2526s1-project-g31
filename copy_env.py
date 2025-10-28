import os
import zipfile
from pathlib import Path

ROOT_DIR = Path(__file__).parent
OUTPUT_ZIP = ROOT_DIR / "env_files.zip"
TARGET_FILES = [".env", ".env.production.local"]

# Remove existing zip if you want a fresh one
if OUTPUT_ZIP.exists():
    OUTPUT_ZIP.unlink()

def add_env_files_to_zip(zipf: zipfile.ZipFile, src_dir: Path, rel_dir: Path):
    """Add .env files from src_dir into zip under rel_dir."""
    for filename in TARGET_FILES:
        file_path = src_dir / filename
        if file_path.exists():
            zipf.write(file_path, rel_dir / filename)
            print(f"Added: {rel_dir / filename}")

with zipfile.ZipFile(OUTPUT_ZIP, "w", zipfile.ZIP_DEFLATED) as zipf:
    # 1️⃣ Root directory
    add_env_files_to_zip(zipf, ROOT_DIR, Path())

    # 2️⃣ One level of subdirectories
    for item in ROOT_DIR.iterdir():
        if item.is_dir() and not item.name.startswith("."):
            add_env_files_to_zip(zipf, item, Path(item.name))

print(f"\n✅ Done! Created ZIP at: {OUTPUT_ZIP}")
