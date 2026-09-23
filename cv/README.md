# CV TeX build

English CV PDF is generated from [`_data/cv.yml`](../_data/cv.yml). Edit the
YAML file for CV content; [`cv.tex`](cv.tex) is an intermediate generated file
and direct changes to it will be overwritten on the next regeneration.

```bash
# From repo root:
ruby scripts/generate_cv_tex.rb --build

# Or stepwise:
ruby scripts/generate_cv_tex.rb   # writes cv/cv.tex
make -C cv pdf                    # builds and copies to assets/cv/
```

Requires `latexmk` + a TeX Live install with `moderncv`, `lmodern`, `eurosym`,
`csquotes`, and Cyrillic fonts (`cm-super` / `texlive-lang-cyrillic`).

Alternatively, use [Tectonic](https://tectonic-typesetting.github.io/), which
downloads its TeX packages on demand, and install the DejaVu Sans font for the
Russian publication title:

```bash
ruby scripts/generate_cv_tex.rb --build --engine tectonic
```

Both engines generate the same source file and publish to the same PDF path.

The German moderncv source is archived in [`archive/`](archive/).
