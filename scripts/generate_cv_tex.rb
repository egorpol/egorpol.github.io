#!/usr/bin/env ruby
# frozen_string_literal: true

# Generate the English or German moderncv TeX from _data/cv.yml and optionally
# build the PDF. German text lives in `<field>_de` keys next to the English
# ones; language-neutral fields (dates, names, titles of works, releases and
# projects, URLs) are shared, so facts stay single-source.
# Usage:
#   ruby scripts/generate_cv_tex.rb
#   ruby scripts/generate_cv_tex.rb --build
#   ruby scripts/generate_cv_tex.rb --check            # list missing German fields
#   ruby scripts/generate_cv_tex.rb --lang de --build

require "yaml"
require "fileutils"
require "optparse"

ROOT = File.expand_path("..", __dir__)
YAML_PATH = File.join(ROOT, "_data", "cv.yml")

OUTPUTS = {
  "en" => { tex: "cv.tex", pdf: "Egor_Polyakov_CV.pdf" },
  "de" => { tex: "cv.de.tex", pdf: "Egor_Polyakov_Lebenslauf.pdf" }
}.freeze

# German section titles; "Kompetenzen" follows cv/archive/cv.de.tex.
LABELS = {
  "en" => {
    babel: "english",
    pdflang: nil,
    pdftitle: "Curriculum Vitae - Egor Polyakov",
    pdfsubject: nil, # moderncv's own metadata stays
    pdfkeywords: nil,
    title_fallback: "Curriculum Vitae",
    profile: "Profile",
    trajectory: "Practice-to-Research Trajectory",
    competencies: "Integrated Competencies",
    languages: "Languages",
    experience: "Professional Experience",
    career_context: "Career Context",
    education: "Education",
    teaching: "Teaching",
    courses: "Selected courses",
    artistic_support: "Artistic and Technical Support (Selection)",
    role: "Role",
    mastering: "Mastering",
    mastering_link: "Full mastering discography and credits",
    artistic_works: "Artistic Works (Selection)",
    releases: "Releases (Electronic Music)",
    funding: "Externally Funded Projects",
    publications: "Publications",
    published: "Published",
    in_press: "In Press / Accepted",
    under_review: "Under Review",
    talks: "Talks and Conferences",
    talk: "Talk",
    materials: "Materials",
    memberships: "Professional Memberships",
    since: "since",
    note: "Note"
  },
  "de" => {
    babel: "ngerman",
    pdflang: "de-DE",
    pdftitle: "Lebenslauf - Egor Polyakov",
    pdfsubject: "Lebenslauf von Egor Polyakov",
    pdfkeywords: "Egor Polyakov, Lebenslauf",
    title_fallback: "Lebenslauf",
    profile: "Profil",
    trajectory: "Werdegang zwischen Praxis und Forschung",
    competencies: "Kompetenzen",
    languages: "Sprachen",
    experience: "Beruflicher Werdegang",
    career_context: nil, # not rendered in German, see generate_tex
    education: "Akademische Qualifikation und Ausbildung",
    teaching: "Lehrerfahrung",
    courses: "Lehrveranstaltungen (Auswahl)",
    artistic_support: "Künstlerisch-technische Realisation (Auswahl)",
    role: "Funktion",
    mastering: "Mastering",
    mastering_link: "Vollständige Mastering-Diskografie mit Credits",
    artistic_works: "Künstlerische Werke (Auswahl)",
    releases: "Veröffentlichungen (elektronische Musik)",
    funding: "Drittmittelprojekte",
    publications: "Publikationen",
    published: "Veröffentlicht",
    in_press: "Im Druck",
    under_review: "In Review",
    talks: "Vorträge und Konferenzbeiträge",
    talk: "Vortrag",
    materials: "Materialien",
    memberships: "Mitgliedschaften",
    since: "seit",
    note: "Persönliches"
  }
}.freeze

# Picks the text for one language. A missing German field is recorded rather
# than raised, so --check can list all of them in one run.
class Localizer
  attr_reader :lang, :missing

  def initialize(lang = "en")
    raise ArgumentError, "unknown language #{lang.inspect}" unless LABELS.key?(lang)

    @lang = lang
    @missing = []
  end

  def label(key)
    LABELS.fetch(lang).fetch(key)
  end

  # entry[key] in English, entry["<key>_de"] in German. `path` locates the entry
  # in cv.yml for the missing-field report.
  def t(entry, key, path)
    english = entry[key]
    return english if lang == "en" || english.nil?

    german = entry["#{key}_#{lang}"]
    return german unless german.nil? || (german.respond_to?(:empty?) && german.empty?)

    @missing << [[path, "#{key}_#{lang}"].reject(&:empty?).join("."), english]
    english
  end

  # "2025–present" → "seit 2025"; other ranges are the same in both languages.
  def dates(text)
    return text if lang == "en"

    text.to_s.sub(/\A(\d{4})–present\z/, 'seit \1')
  end
end

def missing_report(missing)
  lines = ["Missing German fields (#{missing.length}):"]
  missing.each do |path, english|
    preview = Array(english).join(" / ").gsub(/\s+/, " ")
    preview = "#{preview[0, 70]}…" if preview.length > 71
    lines << "  #{path.ljust(42)} #{preview}"
  end
  lines.join("\n")
end

def escape_tex(text)
  escaped = text.to_s.chars.map do |ch|
    case ch
    when "\\" then '\textbackslash{}'
    when "&" then '\&'
    when "%" then '\%'
    when "$" then '\$'
    when "#" then '\#'
    when "_" then '\_'
    when "{" then '\{'
    when "}" then '\}'
    when "~" then '\textasciitilde{}'
    when "^" then '\textasciicircum{}'
    when "–" then "--"
    when "—" then "---"
    when "€" then '\euro{}'
    else ch
    end
  end.join
  escaped.gsub(/[\p{Cyrillic}]+(?:[ \t]+[\p{Cyrillic}]+)*/) do |run|
    "\\textcyrillic{#{run}}"
  end
end

def md_to_tex(text)
  return "" if text.nil?

  s = text.to_s
  placeholders = {}

  stash = lambda do |tex|
    key = "XXCVPH#{placeholders.length}XX"
    placeholders[key] = tex
    key
  end

  s = s.gsub(/\*\*(.+?)\*\*/) { stash.call("\\textbf{#{escape_tex(Regexp.last_match(1))}}") }
  s = s.gsub(/\*(.+?)\*/) { stash.call("\\emph{#{escape_tex(Regexp.last_match(1))}}") }
  s = s.gsub(/`(.+?)`/) { stash.call("\\texttt{#{escape_tex(Regexp.last_match(1))}}") }
  s = escape_tex(s)
  placeholders.each { |key, val| s = s.gsub(key, val) }
  s
end

def q(text)
  "\\enquote{#{md_to_tex(text)}}"
end

def itemize(bullets)
  lines = ["  \\begin{itemize}\\itemsep0.2em"]
  bullets.each { |b| lines << "    \\item #{md_to_tex(b)}" }
  lines << "  \\end{itemize}"
  lines.join("\n")
end

def generate_tex(cv, l = Localizer.new)
  c = cv.fetch("contact")
  name_parts = cv.fetch("name").split
  first = name_parts.first
  family = name_parts[1..].join(" ")
  job_title = cv["job_title"] ? l.t(cv, "job_title", "") : l.label(:title_fallback)
  lang_option = l.lang == "en" ? "" : "--lang #{l.lang} "
  pdflang = l.label(:pdflang) ? "\n    pdflang={#{l.label(:pdflang)}}," : ""
  # moderncv sets English title, subject and keywords at the end of the
  # preamble, overriding \hypersetup; a later hook overrides them in turn.
  metadata = if l.label(:pdfsubject)
               "\n\\AtEndPreamble{\\hypersetup{pdftitle={#{l.label(:pdftitle)}}, " \
                 "pdfsubject={#{l.label(:pdfsubject)}}, pdfkeywords={#{l.label(:pdfkeywords)}}}}"
             else
               ""
             end

  out = +<<~TEX
    % AUTO-GENERATED from ../_data/cv.yml by ../scripts/generate_cv_tex.rb.
    % Edit the YAML source, then run: ruby scripts/generate_cv_tex.rb #{lang_option}--build
    \\PassOptionsToPackage{unicode,pdfpagelabels=false}{hyperref}
    \\documentclass[11pt,a4paper,sans]{moderncv}
    \\moderncvstyle[nosymbols]{classic}
    \\moderncvcolor{blue}
    \\renewcommand*{\\emailsymbol}{}
    \\renewcommand*{\\homepagesymbol}{}
    \\setlength{\\hintscolumnwidth}{3.8cm}

    % Preserve the Latin Modern layout with either pdfLaTeX or Tectonic/XeTeX.
    % The Russian publication title needs a Cyrillic-capable font.
    \\usepackage{iftex}
    \\ifPDFTeX
      \\usepackage[T2A,T1]{fontenc}
      \\usepackage[utf8]{inputenc}
      \\usepackage{lmodern}
      \\DeclareTextFontCommand{\\textcyrillic}{\\fontencoding{T2A}\\fontfamily{cmss}\\selectfont}
    \\else
      \\usepackage{fontspec}
      \\setmainfont{lmroman10-regular.otf}[BoldFont=lmroman10-bold.otf, ItalicFont=lmroman10-italic.otf, BoldItalicFont=lmroman10-bolditalic.otf]
      \\setsansfont{lmsans10-regular.otf}[BoldFont=lmsans10-bold.otf, ItalicFont=lmsans10-oblique.otf, BoldItalicFont=lmsans10-boldoblique.otf]
      \\newfontfamily\\cyrillicfont{DejaVu Sans}[Scale=MatchLowercase]
      \\DeclareTextFontCommand{\\textcyrillic}{\\cyrillicfont}
    \\fi
    \\usepackage[scale=0.92]{geometry}
    \\usepackage{eurosym}

    % Language & quotes
    \\usepackage[#{l.label(:babel)}]{babel}
    \\usepackage{csquotes}

    \\usepackage{needspace}
    \\usepackage{etoolbox}

    \\preto{\\section}{%
      \\Needspace{6\\baselineskip}%
      \\par\\vspace{0.6\\baselineskip}%
    }
    \\preto{\\subsection}{\\Needspace{5\\baselineskip}}

    % ===== Personal data =====
    \\firstname{#{escape_tex(first)}}
    \\familyname{#{escape_tex(family)}}
    \\title{#{escape_tex(job_title)}}
  TEX

  if c["location"]
    out << "\\address{#{escape_tex(l.t(c, 'location', 'contact'))}}{}\n"
  end

  if c["mobile"]
    out << "\\mobile{#{escape_tex(c['mobile']).gsub(' ', '~')}}\n"
  end

  homepage = c["homepage"].to_s.sub(%r{\Ahttps?://}, "")
  out << "\\email{#{escape_tex(c['email'])}}\n"
  out << "\\homepage{#{escape_tex(homepage)}}\n"

  extras = []
  if c["orcid"]
    orcid_id = c["orcid"].to_s.sub(%r{\Ahttps?://orcid\.org/}, "")
    extras << "ORCID: #{escape_tex(orcid_id)}"
  end
  if c["linkedin"]
    linkedin = c["linkedin"].to_s.sub(%r{\Ahttps?://(www\.)?}, "")
    extras << "LinkedIn: #{escape_tex(linkedin)}"
  end
  out << "\\extrainfo{#{extras.join(' \\textbullet{} ')}}\n" unless extras.empty?

  out << <<~TEX

    % ===== Typography & Links =====
    \\usepackage{microtype}
    \\usepackage{hyperref}
    \\hypersetup{
        hidelinks,
        pdfauthor={Egor Polyakov},
        pdftitle={#{l.label(:pdftitle)}},#{pdflang}
        pdfcreator={LaTeX with moderncv}
    }#{metadata}

    \\begin{document}
    \\makecvtitle
    \\pagenumbering{arabic}

  TEX

  out << "\\section{#{l.label(:profile)}}\n"
  out << "\\cvitem{}{#{md_to_tex(l.t(cv, 'profile', ''))}}\n\n"

  out << "\\section{#{l.label(:trajectory)}}\n"
  Array(cv["trajectory"]).each_with_index do |item, i|
    path = "trajectory[#{i}]"
    out << "\\cvitem{#{md_to_tex(l.t(item, 'stage', path))}}{#{md_to_tex(l.t(item, 'text', path))}}\n"
  end
  out << "\n"

  out << "\\section{#{l.label(:competencies)}}\n"
  Array(cv["competencies"]).each_with_index do |item, i|
    path = "competencies[#{i}]"
    out << "\\cvitem{#{md_to_tex(l.t(item, 'label', path))}}{#{md_to_tex(l.t(item, 'text', path))}}\n"
  end
  out << "\n"

  out << "\\section{#{l.label(:languages)}}\n"
  Array(cv["languages"]).each_with_index do |lang, i|
    path = "languages[#{i}]"
    out << "\\cvitem{#{md_to_tex(l.t(lang, 'language', path))}}{#{md_to_tex(l.t(lang, 'level', path))}}\n"
  end
  out << "\n"

  out << "\\section{#{l.label(:experience)}}\n"
  Array(cv["experience"]).each_with_index do |job, i|
    path = "experience[#{i}]"
    out << "\\cventry{#{escape_tex(l.dates(job['dates']))}}" \
           "{#{md_to_tex(l.t(job, 'role', path))}}" \
           "{#{md_to_tex(l.t(job, 'org', path))}}" \
           "{#{md_to_tex(job['location'])}}" \
           "{}{%\n"
    out << "#{itemize(Array(l.t(job, 'bullets', path)))}\n}\n\n"
  end

  # The German CV gives family status only as one line in note_de, without
  # the 2018–2022 explanation (decided 14 October 2026).
  if cv["career_context"] && l.label(:career_context)
    out << "\\section{#{l.label(:career_context)}}\n"
    out << "\\cvitem{#{escape_tex(cv['career_context']['dates'])}}" \
           "{#{md_to_tex(cv['career_context']['text'])}}\n\n"
  end

  out << "\\section{#{l.label(:education)}}\n"
  Array(cv["education"]).each_with_index do |ed, i|
    path = "education[#{i}]"
    out << "\\cventry{#{escape_tex(l.dates(ed['dates']))}}" \
           "{#{md_to_tex(l.t(ed, 'degree', path))}}" \
           "{#{md_to_tex(l.t(ed, 'org', path))}}" \
           "{}{}{#{md_to_tex(l.t(ed, 'detail', path))}}\n"
  end
  out << "\n"

  out << "\\section{#{l.label(:teaching)}}\n"
  if cv.dig("teaching", "summary")
    out << "\\cvitem{}{#{md_to_tex(l.t(cv['teaching'], 'summary', 'teaching'))}}\n"
  end
  out << "\\subsection{#{l.label(:courses)}}\n"
  Array(cv.dig("teaching", "items")).each_with_index do |item, i|
    path = "teaching.items[#{i}]"
    institution = item["institution"] ? ", #{md_to_tex(item['institution'])}" : ""
    out << "\\cvitem{#{escape_tex(item['term'])}}" \
           "{#{q(l.t(item, 'title', path))}#{institution} -- #{md_to_tex(l.t(item, 'detail', path))}}\n"
  end
  out << "\n"

  out << "\\section{#{l.label(:artistic_support)}}\n"
  Array(cv["artistic_support"]).each_with_index do |item, i|
    path = "artistic_support[#{i}]"
    head = "#{q(item['title'])} (#{md_to_tex(item['artists'])})"
    body = itemize(["**#{l.label(:role)}:** #{l.t(item, 'role', path)}.", l.t(item, "venue", path)])
    out << "\\cventry{#{escape_tex(item['year'])}}{#{head}}{}{}{}{%\n#{body}\n}\n"
  end
  out << "\n"

  if cv["mastering"]
    out << "\\section{#{l.label(:mastering)}}\n"
    summary = md_to_tex(l.t(cv['mastering'], 'summary', 'mastering'))
    url = cv['mastering']['url'].to_s
    url = "#{c['homepage'].to_s.sub(%r{/\z}, '')}#{url}" if url.start_with?('/')
    summary += " \\href{#{escape_tex(url)}}{#{l.label(:mastering_link)}}." unless url.empty?
    out << "\\cvitem{}{#{summary}}\n\n"
  end

  out << "\\section{#{l.label(:artistic_works)}}\n"
  Array(cv["artistic_works"]).each_with_index do |work, i|
    out << "\\cventry{#{escape_tex(work['year'])}}" \
           "{#{q(work['title'])}}{}{}{}{#{md_to_tex(l.t(work, 'detail', "artistic_works[#{i}]"))}}\n"
  end
  out << "\n"

  out << "\\section{#{l.label(:releases)}}\n"
  Array(cv["releases"]).each do |rel|
    out << "\\cventry{#{escape_tex(rel['year'])}}" \
           "{#{md_to_tex(rel['artist'])} -- #{q(rel['title'])}}" \
           "{}{}{}{#{md_to_tex(rel['label'])}}\n"
  end
  out << "\n"

  out << "\\section{#{l.label(:funding)}}\n"
  Array(cv["funding"]).each_with_index do |grant, i|
    out << "\\cventry{#{escape_tex(grant['dates'])}}" \
           "{\\emph{#{md_to_tex(grant['title'])}}}" \
           "{}{}{}{%\n"
    out << "#{itemize([l.t(grant, 'text', "funding[#{i}]")])}\n}\n\n"
  end

  # Numeric years are shared; "in press" and "submitted" are translated.
  pub_year = lambda do |pub, path|
    year = pub["year"].to_s
    year.match?(/\A\d{4}\z/) ? year : l.t(pub, "year", path).to_s
  end
  materials = lambda do |item|
    item["materials"] ? "~\\textperiodcentered{} \\href{#{escape_tex(item['materials'])}}{#{l.label(:materials)}}" : ""
  end

  pubs = cv["publications"] || {}
  out << "\\section{#{l.label(:publications)}}\n"
  out << "\\subsection{#{l.label(:published)}}\n"
  Array(pubs["published"]).each_with_index do |pub, i|
    path = "publications.published[#{i}]"
    cite = md_to_tex(l.t(pub, "citation", path))
    if pub["doi"]
      cite += " \\href{#{escape_tex(pub['doi'])}}{DOI}"
    elsif pub["url"]
      cite += " \\href{#{escape_tex(pub['url'])}}{Link}"
    end
    out << "\\cventry{#{escape_tex(pub_year.call(pub, path))}}{}{}{}{}{#{cite}}\n"
  end
  out << "\n\\subsection{#{l.label(:in_press)}}\n"
  Array(pubs["in_press"]).each_with_index do |pub, i|
    path = "publications.in_press[#{i}]"
    cite = md_to_tex(l.t(pub, "citation", path))
    if pub["doi"]
      cite += " \\href{#{escape_tex(pub['doi'])}}{DOI}"
    elsif pub["url"]
      cite += " \\href{#{escape_tex(pub['url'])}}{Link}"
    end
    out << "\\cventry{#{escape_tex(pub_year.call(pub, path))}}{}{}{}{}{#{cite}}\n"
  end
  out << "\n\\subsection{#{l.label(:under_review)}}\n"
  Array(pubs["under_review"]).each_with_index do |pub, i|
    path = "publications.under_review[#{i}]"
    cite = md_to_tex(l.t(pub, "citation", path)) + materials.call(pub)
    out << "\\cventry{#{escape_tex(pub_year.call(pub, path))}}{}{}{}{}{#{cite}}\n"
  end
  out << "\n"

  out << "\\section{#{l.label(:talks)}}\n"
  Array(cv["talks"]).each_with_index do |talk, i|
    path = "talks[#{i}]"
    year = escape_tex(talk["year"].to_s)
    year = "#{year} (#{escape_tex(l.t(talk, 'status', path))})" if talk["status"]
    kind = md_to_tex(talk["kind"] ? l.t(talk, "kind", path) : l.label(:talk))
    venue = md_to_tex(l.t(talk, "venue", path))
    note = talk["note"] ? " (#{md_to_tex(l.t(talk, 'note', path))})" : ""
    out << "\\cventry{#{year}}{#{kind}: #{q(l.t(talk, 'title', path))}}{}{}{}{#{venue}#{note}#{materials.call(talk)}}\n"
  end
  out << "\n"

  out << "\\section{#{l.label(:memberships)}}\n"
  Array(cv["memberships"]).each do |m|
    name = md_to_tex(m["name"])
    name = "\\href{#{escape_tex(m['url'])}}{#{name}}" if m["url"]
    out << "\\cvitem{#{l.label(:since)} #{escape_tex(m['since'].to_s)}}{#{name}}\n"
  end
  out << "\n"

  if cv["note"]
    out << "\\cvitem{#{l.label(:note)}}{#{md_to_tex(l.t(cv, 'note', ''))}}\n\n"
  end

  out << "\\end{document}\n"
  out
end

def build_pdf!(engine, lang)
  tex = OUTPUTS.fetch(lang)[:tex]
  pdf = OUTPUTS.fetch(lang)[:pdf]
  Dir.chdir(File.join(ROOT, "cv")) do
    env = ENV.to_h
    env.delete("TEXMFCNF")
    env.delete("TEXINPUTS")
    env["PATH"] = "/usr/bin:/bin:#{env['PATH']}"
    cmd = if engine == 'tectonic'
            %W[tectonic --keep-logs --keep-intermediates #{tex}]
          else
            %W[latexmk -pdf -interaction=nonstopmode -halt-on-error #{tex}]
          end
    warn "Running: #{cmd.join(' ')}"
    system(env, *cmd) or raise "#{engine} failed"
  end
  src = File.join(ROOT, "cv", tex.sub(/\.tex\z/, ".pdf"))
  dest = File.join(ROOT, "assets", "cv", pdf)
  FileUtils.mkdir_p(File.dirname(dest))
  system("/usr/bin/cp", "--", src, dest) or raise "PDF copy failed"
  warn "Copied PDF → assets/cv/#{pdf}"
end

if $PROGRAM_NAME == __FILE__
  build = false
  check = false
  engine = 'latexmk'
  lang = 'en'
  OptionParser.new do |opts|
    opts.banner = "Usage: generate_cv_tex.rb [--lang en|de] [--check] [--build] [--engine latexmk|tectonic]"
    opts.on("--lang LANG", LABELS.keys, "CV language (default: en)") { |value| lang = value }
    opts.on("--check", "List the German (_de) fields still missing, write nothing") { check = true }
    opts.on("--build", "Also build and copy the PDF to assets/cv/") { build = true }
    opts.on("--engine ENGINE", %w[latexmk tectonic], "PDF compiler (default: latexmk)") { |value| engine = value }
  end.parse!

  cv = YAML.safe_load_file(
    YAML_PATH,
    permitted_classes: [],
    permitted_symbols: [],
    aliases: false
  )
  raise "cv.yml must parse to a Hash" unless cv.is_a?(Hash)

  if check
    l = Localizer.new("de")
    generate_tex(cv, l)
    if l.missing.empty?
      warn "All German fields present."
      exit 0
    end
    warn missing_report(l.missing)
    exit 1
  end

  l = Localizer.new(lang)
  tex = generate_tex(cv, l)
  abort missing_report(l.missing) unless l.missing.empty?
  tex_path = File.join(ROOT, "cv", OUTPUTS.fetch(lang)[:tex])
  FileUtils.mkdir_p(File.dirname(tex_path))
  File.write(tex_path, tex)
  warn "Wrote cv/#{OUTPUTS.fetch(lang)[:tex]}"

  build_pdf!(engine, lang) if build
end
