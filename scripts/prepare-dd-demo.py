#!/usr/bin/env python3
"""Prepare individual 16/44.1 AIFF and 320 kbps MP3 copies; preserve the sources."""

import hashlib
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "_data/dd_demo.json"
AUDIO = ROOT / "assets/audio/dd-demo"
AIFF = AUDIO / "aiff"
WAVES = ROOT / "assets/images/dd-demo-waveforms"


def run(*args):
    subprocess.run(args, check=True)


def probe(path):
    return json.loads(subprocess.check_output([
        "ffprobe", "-v", "error", "-select_streams", "a:0",
        "-show_format", "-show_streams", "-of", "json", str(path)
    ]))


def sha256(path):
    with path.open("rb") as source:
        return hashlib.file_digest(source, "sha256").hexdigest()


def clock(seconds):
    seconds = int(seconds)
    return f"{seconds // 60:02d}:{seconds % 60:02d}"


def main():
    data = json.loads(DATA.read_text())
    sources = [AUDIO / track["source"] for track in data["tracks"]]
    for source in sources:
        if not source.is_file():
            raise FileNotFoundError(source)
    original_hashes = [sha256(source) for source in sources]
    AIFF.mkdir(parents=True, exist_ok=True)
    WAVES.mkdir(parents=True, exist_ok=True)
    total = 0.0
    for index, (track, source) in enumerate(zip(data["tracks"], sources), 1):
        source_info = probe(source)
        source_audio = source_info["streams"][0]
        if source_audio["channels"] != 2:
            raise ValueError(f"Expected a stereo source: {source}")
        bits = int(source_audio.get("bits_per_raw_sample") or source_audio["bits_per_sample"])
        # TPDF dither for bit-depth reduction. Keep existing 16/44.1 PCM samples
        # unchanged; adding dither again would only add noise to those five files.
        needs_dither = bits > 16 or source_audio["codec_name"].startswith("pcm_f")
        needs_dither |= int(source_audio["sample_rate"]) != 44100
        dither = "triangular" if needs_dither else "none"
        aiff = AIFF / f"{track['id']}.aiff"
        if aiff.resolve() == source.resolve():
            raise ValueError(f"Refusing to overwrite the source: {source}")
        metadata = [
            "-map_metadata", "-1", "-metadata", f"title={track['title']}",
            "-metadata", f"artist={track['artist']}",
            "-metadata", f"track={index}/{len(sources)}",
            "-metadata", "album=Egor Polyakov — Selected Productions",
        ]
        run("ffmpeg", "-v", "error", "-y", "-i", str(source), "-map", "0:a:0",
            "-af", f"aresample=44100:osf=s16:dither_method={dither}",
            "-c:a", "pcm_s16be", "-ar", "44100", "-ac", "2",
            *metadata, str(aiff))
        converted = probe(aiff)
        track["duration"] = float(converted["format"]["duration"])
        track["duration_label"] = clock(track["duration"])
        total += track["duration"]
        track["source_sha256"] = original_hashes[index - 1]
        track["aiff_dither"] = dither
        track["aiff"] = f"/assets/audio/dd-demo/aiff/{aiff.name}"
        track["aiff_size"] = f"{aiff.stat().st_size / 1_000_000:.1f} MB"
        track["aiff_format"] = "16-bit · 44.1 kHz · stereo"
        track["audio"] = f"/assets/audio/dd-demo/{track['id']}.mp3"
        track["waveform"] = f"/assets/images/dd-demo-waveforms/{track['id']}.png"
        mp3 = ROOT / track["audio"].lstrip("/")
        comment = f"{track['role']}; listening excerpt"
        if track["id"] == "mast_shandy_cut":
            comment += "; " + data["source_note"]
        run("ffmpeg", "-v", "error", "-y", "-i", str(aiff), "-map", "0:a:0",
            "-c:a", "libmp3lame", "-b:a", "320k", "-ar", "44100", "-ac", "2",
            *metadata, "-metadata", f"comment={comment}", str(mp3))
        track["mp3_size"] = f"{mp3.stat().st_size / 1_000_000:.1f} MB"
        run("ffmpeg", "-v", "error", "-y", "-i", str(aiff), "-filter_complex",
            "aformat=channel_layouts=mono,showwavespic=s=1600x240:colors=white:scale=lin:draw=full,format=rgba,colorkey=0x000000:0.01:0",
            "-frames:v", "1", str(ROOT / track["waveform"].lstrip("/")))
        print(f"{index:02d} {track['artist']} — {track['title']}: "
              f"{track['duration_label']}, 16/44.1 AIFF ({dither} dither), 320 kbps MP3", flush=True)

    for source, original in zip(sources, original_hashes):
        if sha256(source) != original:
            raise RuntimeError(f"Source changed during preparation: {source}")
    data["duration"] = total
    data["duration_label"] = clock(total)
    for key in ("compilation", "compilation_size", "archive", "archive_url",
                "archive_bytes", "archive_size"):
        data.pop(key, None)
    DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    (AUDIO / "egor-polyakov-demo.mp3").unlink(missing_ok=True)
    print(f"Total: {data['duration_label']}; seven individual AIFF/MP3 pairs; originals unchanged", flush=True)


if __name__ == "__main__":
    main()
