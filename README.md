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
