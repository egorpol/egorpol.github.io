# Build the English and German CV PDFs from generated TeX
# Usage: make pdf      (or: ruby ../scripts/generate_cv_tex.rb --build)
#        make pdf-de   (or: ruby ../scripts/generate_cv_tex.rb --lang de --build)

TEX = cv.tex
PDF = cv.pdf
DEST = ../assets/cv/Egor_Polyakov_CV.pdf
TEX_DE = cv.de.tex
PDF_DE = cv.de.pdf
DEST_DE = ../assets/cv/Egor_Polyakov_Lebenslauf.pdf

.PHONY: pdf pdf-de clean regenerate regenerate-de

regenerate:
	ruby ../scripts/generate_cv_tex.rb

regenerate-de:
	ruby ../scripts/generate_cv_tex.rb --lang de

pdf: $(PDF)
	mkdir -p ../assets/cv
	cp -f $(PDF) $(DEST)
	@echo "Installed $(DEST)"

pdf-de: $(PDF_DE)
	mkdir -p ../assets/cv
	cp -f $(PDF_DE) $(DEST_DE)
	@echo "Installed $(DEST_DE)"

$(PDF): $(TEX)
	env -u TEXMFCNF -u TEXINPUTS PATH="/usr/bin:/bin:$$PATH" \
		latexmk -pdf -interaction=nonstopmode -halt-on-error $(TEX)

$(PDF_DE): $(TEX_DE)
	env -u TEXMFCNF -u TEXINPUTS PATH="/usr/bin:/bin:$$PATH" \
		latexmk -pdf -interaction=nonstopmode -halt-on-error $(TEX_DE)

clean:
	latexmk -C $(TEX)
	latexmk -C $(TEX_DE)
	rm -f *.xdv *.synctex.gz
