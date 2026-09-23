# Site launch & pixel typography lab

Local-only comparisons; no production notice or typography is enabled. Jekyll
excludes this underscore-prefixed directory. Do not add it to `include`.

Serve the repository root (not `_site`):

```sh
python3 -m http.server 4011 --bind 127.0.0.1
```

Open http://127.0.0.1:4011/_prototypes/site-launch-lab/.

The lab reuses the site's existing font files and palette, with four additional
self-hosted fonts. Native font sizes are chosen for comparable perceived size;
the controls also offer a shared 22px test. The original headings stay Silkscreen.
No preferences or dismissals are stored. No analytics or remote font requests.

## Notice recommendation

A dismissible inline note on the homepage plus a quiet persistent footer note.
If adopted, remember dismissal by notice version (not every page load), use a
normal labelled aside rather than an urgent alert, and remove the banner when
it no longer helps. Keep unavailable entries clearly labelled individually.
The popup is deliberately opt-in in the lab, not the recommended implementation.

## Font provenance

Downloaded 2026-09-20, unmodified. Each added font is distributed under the SIL
Open Font License; the original license files are included in `fonts/`.

- Departure Mono 1.500: https://departuremono.com/ and
  https://github.com/rektdeckard/departure-mono/tree/main/public/assets
  (`DepartureMono-1.500.woff2`, `LICENSE`). Creator recommends sizes in multiples
  of 11px for pixel-perfect rendering. Browser zoom and display scaling still
  affect the apparent pixel grid.
- Pixelify Sans: https://github.com/eifetx/Pixelify-Sans;
  binary and OFL from https://github.com/google/fonts/tree/main/ofl/pixelifysans
  (`PixelifySans[wght].ttf`, renamed locally).
- VT323: https://github.com/phoikoi/VT323;
  binary and OFL from https://github.com/google/fonts/tree/main/ofl/vt323.
- Doto: https://github.com/google/fonts/tree/main/ofl/doto
  (`Doto[ROND,wght].ttf`, renamed locally; weight 600 used in the lab).

Existing baseline fonts and their licenses remain under `/assets/fonts/`.
