#!/usr/bin/env python3
"""Bundle the prepared Dresden AIFF excerpts for upload as a GitHub Release asset."""

import hashlib
import json
from pathlib import Path
import subprocess
import tempfile
import zipfile

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "_data/dd_demo.json"
ARCHIVE = ROOT / "assets/audio/dd-demo/egor-polyakov-dresden-demo.zip"


def sha256(path):
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def verify_aiff(path):
    info = json.loads(subprocess.check_output([
        "ffprobe", "-v", "error", "-select_streams", "a:0",
        "-show_streams", "-of", "json", str(path)
    ]))["streams"][0]
    if int(info["sample_rate"]) != 44100 or info["channels"] != 2:
        raise ValueError(f"Expected stereo audio at 44.1 kHz: {path}")
    valid = info["codec_name"] == "pcm_s16be" and info["bits_per_sample"] == 16
    if not valid:
        raise ValueError(f"Unexpected AIFF format: {path}")


def main():
    data = json.loads(DATA.read_text())
    files = []
    readme = [
        "Egor Polyakov — Selected Productions",
        "HfM Dresden — Music Production application (2026)", "",
        f"Seven listening excerpts; total duration: {data['duration_label']}.",
        "AIFF/: stereo, 16-bit PCM, 44.1 kHz.",
        "Numbered filenames give the listening order.",
        "MP3 listening copies are available in the player on the application page.", "",
    ]
    for index, track in enumerate(data["tracks"], 1):
        name = f"{index:02d} - {track['artist']} - {track['title']}"
        # These titles contain no path separators or filename control characters.
        if any(char in name for char in '/\\\x00\r\n'):
            raise ValueError(f"Invalid archive filename: {name}")
        path = ROOT / track["aiff"].lstrip("/")
        verify_aiff(path)
        files.append((path, f"AIFF/{name}.aiff", sha256(path)))
        readme += [
            f"{index:02d}. {track['artist']} — {track['title']} ({track['year']})",
            f"Contribution: {track['role']}",
            f"Duration: {track['duration_label']}",
        ]
        if track.get("context"):
            readme.append(track["context"])
        readme.append("")
    readme += [
        "Download formats", "",
        "Every excerpt is available as a stereo AIFF at 16-bit / 44.1 kHz and an MP3 at 320 kbps.", "",
        "A note on the source quality", "", data["source_note"], "",
        "Integrity", "",
        "SHA256SUMS.txt contains checksums for the seven AIFF files.",
        "After extraction on Linux, verify with: sha256sum -c SHA256SUMS.txt",
    ]
    checksums = "".join(f"{digest}  {name}\n" for _, name, digest in files)
    ARCHIVE.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=ARCHIVE.parent, suffix=".zip", delete=False) as temp:
        temporary = Path(temp.name)
    try:
        with zipfile.ZipFile(temporary, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as bundle:
            for path, name, _ in files:
                bundle.write(path, name)
            bundle.writestr("README.txt", "\n".join(readme) + "\n")
            bundle.writestr("SHA256SUMS.txt", checksums)
        with zipfile.ZipFile(temporary) as bundle:
            if bundle.testzip() is not None:
                raise RuntimeError("Archive integrity check failed")
            for _, name, digest in files:
                if hashlib.sha256(bundle.read(name)).hexdigest() != digest:
                    raise RuntimeError(f"Archive checksum mismatch: {name}")
        temporary.replace(ARCHIVE)
    finally:
        temporary.unlink(missing_ok=True)
    print(f"Created {ARCHIVE}")
    print(f"{ARCHIVE.stat().st_size / 1_000_000:.1f} MB; seven AIFFs, credits and checksums")
    print(f"SHA-256: {sha256(ARCHIVE)}")


if __name__ == "__main__":
    main()
