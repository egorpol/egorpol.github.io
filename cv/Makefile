# Build English CV PDF from generated TeX
# Usage: make pdf   (or: ruby ../scripts/generate_cv_tex.rb --build)

TEX = cv.tex
PDF = cv.pdf
DEST = ../assets/cv/Egor_Polyakov_CV.pdf

.PHONY: pdf clean regenerate

regenerate:
	ruby ../scripts/generate_cv_tex.rb

pdf: $(PDF)
	mkdir -p ../assets/cv
	cp -f $(PDF) $(DEST)
	@echo "Installed $(DEST)"

$(PDF): $(TEX)
	env -u TEXMFCNF -u TEXINPUTS PATH="/usr/bin:/bin:$$PATH" \
		latexmk -pdf -interaction=nonstopmode -halt-on-error $(TEX)

clean:
	latexmk -C $(TEX)
	rm -f *.xdv *.synctex.gz
