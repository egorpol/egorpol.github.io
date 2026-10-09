# Changelog

Site versions follow [Semantic Versioning](https://semver.org/).
The format is based on [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Added

- Unlisted listening page `/works/production-selection/` for the HfM Dresden application, with MP3 and AIFF downloads and an AIFF archive as a GitHub Release asset
- Sraunus – *Variado* (Ornithopter Records, OR 009) in the mastering discography; releases without a Discogs credit are marked as such
- Institution for each course on Teaching, the CV page, and the PDF
- Production stage in the CV trajectory and a Production and mastering competency (Ableton Live, Logic Pro, Adobe Audition, Ambisonics with IRCAM Spat)
- Cumulative Habilitation (in progress) under Education
- Homepage section “Studio and stage” on production, mastering, and live electronics, after the current appointment

### Changed

- *Understanding and Emulating Time* (beat_it) moved from published to in press; in-press entries now show their links
- Homepage highlights rewritten; the cancelled GfM 2026 workshop removed from talks
- Course titles aligned with the originals (*Fundamentals of Electroacoustic Music I and II*; “style imitation” for *Stilkopie*) and teaching summary set to more than twelve years
- CV page and PDF follow the application order: education and teaching, then artistic and technical practice, then funding, publications, and talks; Practice is in the jump menu and no longer muted
- Leipzig role separates student-production support from studio coordination; Systems and interactive-systems entries name Max for Live, Pure Data, sensors, and controllers
- Mastering copy names the Ornithopter founding team; Works notes the interdisciplinary Fabian Russ productions
- Balanced positioning: “computational musicologist, producer, and research software developer” in the profile, homepage tagline, and site description; header reads “Research · production · code”; new Works intro
- Homepage story stage “Between worlds” rewritten around production and tool-building
- Homepage “Current appointment” condensed from four paragraphs to three

### Fixed

- RSS feed at `/notes/feed.xml` is generated on GitHub Pages (`jekyll-feed` listed under `plugins`) and linked from every page head
- `og:locale` emitted once, as `en_GB`
- Consistent typography: titles of published works in italics, track and talk titles and unpublished chapters in quotes, software and services in roman; full stops outside closing quotes (“Poliakov”.)
- *Denkmäler deutscher Tonkunst* spelled as published; DdT I/11 given by its title, *Dietrich Buxtehudes Instrumentalwerke*
- Homepage names the DFG project as on the CV: *Development of a Comprehensive Cloud-Based Toolbox for Music Score Analysis*
- Raw material for future Works pages (about 1.1 GB of recordings, videos, patches, and scores under `assets/audio/`) is ignored by Git and the build, and listed in `assets/audio/README.md`

### Removed

- `'unsafe-inline'` from the script Content Security Policy; the site has no inline scripts
- Unused `CATEGORIES.md`, a tracked Jupyter checkpoint of an old config, the starter comments in `_config.yml`, and the hard-coded `dateModified` on the CV page

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
