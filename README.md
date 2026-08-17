# Egor Polyakov — professional website

Source for [egorpol.github.io](https://egorpol.github.io), a Jekyll site presenting research, software projects, and an academic CV in computational musicology.

## Local development

Requires Ruby, Bundler, and the dependency versions pinned by `Gemfile.lock`.

```bash
bundle install
bundle exec jekyll serve
```

The generated site is written to `_site/`.

## Updating professional information

`_data/cv.yml` is the single source for homepage highlights, web CV content, projects, and the downloadable English CV. After editing it, regenerate the PDF:

```bash
ruby scripts/generate_cv_tex.rb --build
```

This requires `latexmk` and a TeX Live installation containing `moderncv`, `lmodern`, `eurosym`, and `csquotes`.

Key files:

- `index.md` — homepage structure
- `cv.md` — web CV structure
- `projects.md`, `publications.md`, `teaching.md`, `works.md` — section pages, all generated from `_data/cv.yml`
- `notes.md` — index for the `_posts` collection
- `_data/cv.yml` — shared professional content
- `_data/nav.yml` — primary navigation items
- `_layouts/default.html` — metadata, navigation, and site shell
- `_includes/site-nav.html` — primary navigation markup
- `assets/css/main.scss` + `_sass/` — design tokens, layout, components, and print styles
- `assets/fonts/` — self-hosted IBM Plex subset (SIL Open Font License 1.1)
- `assets/audio/` — excerpts for the Works page (see the README there)
- `cv/cv.tex` — generated LaTeX source (rebuild artifacts under `cv/` are gitignored)
- `cv/Makefile` / `cv/README.md` — local PDF build helpers
- `assets/cv/Egor_Polyakov_CV.pdf` — published PDF

## Privacy and security

- The public CV includes limited family context but omits family members’ names and ages, as well as a street address, telephone number, and full birth date.
- LaTeX build outputs under `cv/` (PDF/aux/log) are gitignored; Makefile, README, archive sources, and generated `cv.tex` stay in the repo. Only `assets/cv/Egor_Polyakov_CV.pdf` is published.
- The site has no analytics and makes no third-party font, icon, or script requests.
- A browser-enforced Content Security Policy is included in the shared layout. `_headers` provides stronger HTTP headers on compatible hosts; GitHub Pages itself does not apply Netlify-style `_headers` files.
- External links opened in a new tab use `rel="noopener noreferrer"`.
- Fonts are self-hosted, so the site still issues no third-party requests of any kind.

## Deployment

GitHub Pages builds the default branch. Before publishing, run:

```bash
bundle exec jekyll build
ruby scripts/generate_cv_tex.rb --build
git diff --check
```

## License

Site source is available under the [MIT License](LICENSE).
