# Changelog

Site versions follow [Semantic Versioning](https://semver.org/).
The format is based on [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

## [0.0.1] - 2026-09-23

First numbered release: pixel chrome overlay, release pages, CV/PDF updates, and related content from `phase-2-chrome`.

### Added

- Pixel “chrome” overlay (plain / pixel view): Silkscreen UI, Source Serif for editorial headings, IBM Plex Mono for long reading in pixel mode
- Release pages with in-page audio players for *Swirl Planet EP* and *The Rubber Duck Massacre EP*, including unreleased Swirl Planet tracks recovered from backup
- Mastering credits on Works and the downloadable CV (Ornithopter Records and related releases)
- Dismissible site notice for launch messaging
- Patcher-style chrome treatment on the CV trajectory and Projects page
- Publication links: Routledge DOI for *Analyse!* (2024), Laaber *Lexikon des Orchesters*, Qucosa dissertation URN, Academia.edu volume for the 2019 Russian Rimsky-Korsakov chapter
- Cyrillic-capable CV PDF generator (`latexmk` or Tectonic); regenerated `assets/cv/Egor_Polyakov_CV.pdf`

### Changed

- CV and homepage copy for CAMAT / DFG role wording, project blurbs, and current-work narrative
- ICCCM26 poster status updated from accepted to presented
- Homepage mastering section removed; full discography remains on Works and in the CV
- Pixel-view type sizes on the homepage and word-patch UI

### Earlier history (pre-0.0.1)

Compact notes from the previous dated log. Full detail lived in older commits on `main`.

- **2026-08-17** — Publications / Teaching / Works pages from `_data/cv.yml`; self-hosted IBM Plex; design-token Sass; Notes at `/notes/`; WebP blog images and lighter favicon
- **2025-08-15** — SEO tags, image viewer, theme toggle, accessibility, blog/category cleanup, and the first README / CATEGORIES / changelog docs
