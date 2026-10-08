# Egor Polyakov — professional website

Source for [egorpol.github.io](https://egorpol.github.io): research, software projects, and an academic CV in computational musicology.

Current site version: **0.0.1**. See [CHANGELOG.md](CHANGELOG.md).

## Local development

Requires Ruby, Bundler, and the versions pinned in `Gemfile.lock`.

```bash
bundle install
bundle exec jekyll serve
```

Output lands in `_site/`.

## Updating professional information

`_data/cv.yml` drives the homepage, web CV, projects, publications, teaching, works, and the English PDF. After editing it:

```bash
ruby scripts/generate_cv_tex.rb --build
```

TeX engines, Cyrillic fonts, and Tectonic notes are in [cv/README.md](cv/README.md).

### Key paths

| Path | Role |
| --- | --- |
| `_data/cv.yml` | Shared professional content |
| `_data/nav.yml` | Primary navigation |
| `index.md`, `cv.md`, `projects.md`, `publications.md`, `teaching.md`, `works.md` | Page structure |
| `_layouts/default.html` | Site shell, CSP, nav |
| `assets/css/main.scss` + `_sass/` | Design tokens and styles |
| `assets/fonts/` | Self-hosted type (SIL OFL 1.1) |
| `cv/cv.tex` | Generated LaTeX (rebuild artifacts under `cv/` are gitignored) |
| `assets/cv/Egor_Polyakov_CV.pdf` | Published PDF |

## Listening portfolio

`works/production-selection.md` serves `/works/production-selection/`, using
`_data/dd_demo.json` for the seven selected excerpts and their credits. This page
is dedicated to the HfM Dresden application: it is omitted from the sitemap and
has no incoming links from the public site.

```bash
python3 scripts/prepare-dd-demo.py
python3 scripts/package-dd-demo.py
bundle exec jekyll build
```

The preparation script creates seven stereo 16-bit / 44.1 kHz AIFF copies under
`assets/audio/dd-demo/aiff/`, individual 320 kbps MP3s, and waveform images.
Triangular (TPDF) dither is used for bit-depth reduction; the five sources already
at 16/44.1 retain their PCM samples without adding dither again. Both formats are
available for download on each track. The page and *Baby Blue* MP3 metadata include
the note about its lower-bitrate MP3 source.

All supplied originals remain unchanged in `assets/audio/dd-demo/` and are
excluded from Git and the site build. Only the prepared listening and download
copies are published. The script records source checksums in `_data/dd_demo.json`
and verifies that preparation has not changed them. There is no combined MP3.

The separate packaging script creates
`assets/audio/dd-demo/egor-polyakov-dresden-demo.zip`: seven numbered AIFFs,
track credits, the source-quality note, and SHA-256 checksums. The ZIP contains
only AIFF audio; MP3 listening copies remain available in the player.
It verifies every audio format and the completed archive. The ZIP is excluded
from Git and the site build; upload it as a GitHub Release asset.

The individual page downloads continue to use the prepared audio files in the
site. Release assets are uploaded separately and do not have to be committed to Git.

## Privacy and security

- The public CV omits family members’ names and ages, street address, telephone, and full birth date.
- Only `assets/cv/Egor_Polyakov_CV.pdf` is published; other LaTeX build outputs under `cv/` are gitignored.
- No analytics; fonts and scripts are self-hosted (no third-party requests).
- A Content Security Policy is set in the layout. `_headers` helps on hosts that honour it; GitHub Pages does not apply Netlify-style `_headers`.
- New-tab external links use `rel="noopener noreferrer"`.

## Deployment

GitHub Pages builds the **default branch** (`main`) on push or merge. A GitHub Release or git tag is **not** required for the site to deploy.

Before merging to `main`:

```bash
bundle exec jekyll build
ruby scripts/generate_cv_tex.rb --build
git diff --check
```

## License

Site source is available under the [MIT License](LICENSE).
