# Audio excerpts

Short excerpts for the Works page. Keep these to roughly 60–90 seconds and link
full works out to an external host — the repository should stay small and the
site's Content-Security-Policy blocks third-party embeds.

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
