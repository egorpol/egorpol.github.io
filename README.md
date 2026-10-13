# Egor Polyakov — professional website

Source for [egorpol.github.io](https://egorpol.github.io): research, production and mastering work, software projects, notes, and an academic CV.

Current site version: **0.0.2**. See [CHANGELOG.md](CHANGELOG.md).

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
| `_posts/`, `POST_TEMPLATE.md` | Notes and the template for new ones |
| `works/swirl-planet.md`, `works/rubber-duck-massacre.md` | Release pages with audio players |
| `assets/js/release-player.js`, `assets/lib/wavesurfer-7.12.11.min.js` | Release player; bump the `?v=` in the release pages’ `scripts` when the player changes |
| `assets/audio/README.md` | Published audio and the raw material kept out of Git and the build |
| `_layouts/default.html` | Site shell, CSP, nav |
| `assets/css/main.scss` + `_sass/` | Design tokens and styles |
| `assets/fonts/` | Self-hosted type (SIL OFL 1.1) |
| `cv/cv.tex` | Generated LaTeX (rebuild artifacts under `cv/` are gitignored) |
| `assets/cv/Egor_Polyakov_CV.pdf` | Published PDF |

## Privacy and security

- The public CV omits family members’ names and ages, street address, telephone, and full birth date.
- Only `assets/cv/Egor_Polyakov_CV.pdf` is published; other LaTeX build outputs under `cv/` are gitignored.
- No analytics; fonts and scripts are self-hosted (no third-party requests).
- GitHub Pages can’t send response headers, so the Content Security Policy is a `<meta>` tag in the layout; header-only protections such as `frame-ancestors` aren’t available.
- Pages with `audio_player: true` add a `style-src` hash for the stylesheet WaveSurfer injects. Recompute it from the browser’s CSP error when WaveSurfer or the player height in `assets/js/release-player.js` changes (see the comment in `_layouts/default.html`).
- New-tab external links use `rel="noopener noreferrer"`.

## Deployment

GitHub Pages builds the **default branch** (`main`) on push or merge. A GitHub Release or git tag is **not** required for the site to deploy.

Before merging to `main`:

```bash
bundle exec jekyll build
ruby scripts/generate_cv_tex.rb --build
ruby scripts/test-generate-cv.rb
node --test scripts/test-release-player.cjs scripts/test-site-notice.cjs
git diff --check
```

## License

Site source is available under the [MIT License](LICENSE).
