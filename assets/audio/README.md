# Audio excerpts

Short excerpts for the Works page and full tracks for the release pages. Keep
excerpts to roughly 60–90 seconds and link other full works out to an external
host — the repository should stay small and the site's Content-Security-Policy
blocks third-party embeds.

To attach an excerpt, add `audio` (and optionally `audio_note`) to the relevant
entry under `artistic_works` in `_data/cv.yml`:

```yaml
artistic_works:
  - year: "2013"
    title: Core v2
    detail: for oboe, English horn, and 8-channel live electronics
    audio: /assets/audio/core-v2-excerpt.mp3
    audio_note: "Excerpt, 1:20 — stereo reduction of the 8-channel version."
```

The LaTeX CV generator (`scripts/generate_cv_tex.rb`) reads only `year`, `title`,
and `detail`, so these extra keys do not affect the PDF.

Suggested encoding, which keeps a 90-second excerpt near 1.5 MB:

```bash
ffmpeg -i source.wav -ac 2 -b:a 128k -movflags +faststart core-v2-excerpt.mp3
```

## Release pages

The players on `works/swirl-planet.md` and `works/rubber-duck-massacre.md` play
full tracks from `swirl-planet/*.mp3` and from the Rubber Duck Massacre folder
ending in `(SN056)/`; their waveform images are under
`assets/images/releases/*-waveforms/`. The archive.org sidecars in the SN056
folder (`SN056_*.xml`, `SN056_rules.conf`, the `*pxl.jpg` thumbnails) stay in
the repository but are excluded from the build, as they carry no licence.

## Raw material for future Works pages (local only)

These folders sit beside the published audio in the local working copy only.
`.gitignore` and the `exclude` list in `_config.yml` keep them out of Git and the
site build (any `assets/audio/<Title> (<year>)/` folder, plus the WAV/PKF masters
in `swirl-planet/`). Prepare excerpts from them; don't publish them directly, as
several files exceed GitHub's 100 MB limit.

| Folder | Contents |
| --- | --- |
| `Ausgleichsfläche (2007)/` | Video (`.mpg`, 198 MB) and text (PDF). Not yet in the works list. |
| `Schrittmacher (2008)/` | Demo video at HMT Leipzig main entrance (`.mpg`, 211 MB), three photos, patch (Windows XP, ZIP), text (PDF) |
| `Double Helix (2009)/` | Stereo mix (AIFF, 99 MB), score (PDF), patch (macOS, ZIP, 133 MB) |
| `Stereo-Type (2010)/` | Tape piece (AIFF, 35 MB), text (PDF) |
| `Stereo-Type II (2011)/` | Tape piece (AIFF, 47 MB), text (PDF) |
| `Manuals (2012)/` | Recording of 13 January 2012 (AIFF, 115 MB), score (PDF) |
| `Core v2 (2013)/` | Recording (AIFF, 230 MB), score (PDF) |
| `swirl-planet/` | Lossless masters of *Swirl Planet* and *Sand Movement* (WAV, OR 005) |

`.pkf` files next to the audio are peak files from the audio editor. *Core v1*
(2011) has no material here yet.
