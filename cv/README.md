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

Requires `latexmk` + a TeX Live install with `moderncv`, `lmodern`, `eurosym`, `csquotes`.

The German moderncv source is archived in [`archive/`](archive/).
