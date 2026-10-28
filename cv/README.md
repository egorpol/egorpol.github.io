# CV TeX build

The English and German CV PDFs are generated from [`_data/cv.yml`](../_data/cv.yml).
German text goes in `<field>_de` keys next to the English ones; dates, names,
and titles are shared. Edit the YAML file for CV content; [`cv.tex`](cv.tex)
and [`cv.de.tex`](cv.de.tex) are intermediate generated files and direct
changes to them will be overwritten on the next regeneration.

```bash
# From repo root:
ruby scripts/generate_cv_tex.rb --build             # English
ruby scripts/generate_cv_tex.rb --lang de --build   # German
ruby scripts/generate_cv_tex.rb --check             # lists missing German fields

# Or stepwise:
ruby scripts/generate_cv_tex.rb   # writes cv/cv.tex
make -C cv pdf                    # builds and copies to assets/cv/
make -C cv regenerate-de pdf-de   # the same for cv/cv.de.tex
```

The German build stops without writing while any `_de` field is missing.

Requires `latexmk` + a TeX Live install with `moderncv`, `lmodern`, `eurosym`,
`csquotes`, and Cyrillic fonts (`cm-super` / `texlive-lang-cyrillic`).

Alternatively, use [Tectonic](https://tectonic-typesetting.github.io/), which
downloads its TeX packages on demand, and install the DejaVu Sans font for the
Russian publication title:

```bash
ruby scripts/generate_cv_tex.rb --build --engine tectonic
ruby scripts/generate_cv_tex.rb --lang de --build --engine tectonic
```

Both engines generate the same source files and publish to the same PDF paths.

The earlier hand-written German moderncv source is archived in [`archive/`](archive/).
