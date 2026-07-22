#!/usr/bin/env ruby
# frozen_string_literal: true

# Generate English moderncv TeX from _data/cv.yml and optionally build the PDF.
# Usage:
#   ruby scripts/generate_cv_tex.rb
#   ruby scripts/generate_cv_tex.rb --build

require "yaml"
require "fileutils"
require "optparse"

ROOT = File.expand_path("..", __dir__)
YAML_PATH = File.join(ROOT, "_data", "cv.yml")
TEX_PATH = File.join(ROOT, "cv", "cv.tex")
PDF_SRC = File.join(ROOT, "cv", "cv.pdf")
PDF_DEST = File.join(ROOT, "assets", "cv", "Egor_Polyakov_CV.pdf")

def escape_tex(text)
  text.to_s.chars.map do |ch|
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

def generate_tex(cv)
  c = cv.fetch("contact")
  name_parts = cv.fetch("name").split
  first = name_parts.first
  family = name_parts[1..].join(" ")

  out = +<<~TEX
    % AUTO-GENERATED from ../_data/cv.yml by ../scripts/generate_cv_tex.rb.
    % Edit the YAML source, then run: ruby scripts/generate_cv_tex.rb --build
    \\documentclass[11pt,a4paper,sans]{moderncv}
    \\moderncvstyle[nosymbols]{classic}
    \\moderncvcolor{blue}
    \\renewcommand*{\\emailsymbol}{}
    \\renewcommand*{\\homepagesymbol}{}
    \\setlength{\\hintscolumnwidth}{3.8cm}

    % ===== pdfLaTeX setup (no fontspec / fontawesome5 required) =====
    \\usepackage[T1]{fontenc}
    \\usepackage[utf8]{inputenc}
    \\usepackage{lmodern}
    \\usepackage[scale=0.92]{geometry}
    \\usepackage{eurosym}

    % Language & quotes
    \\usepackage[english]{babel}
    \\usepackage{csquotes}

    \\usepackage{needspace}
    \\usepackage{etoolbox}

    \\preto{\\section}{%
      \\Needspace{6\\baselineskip}%
      \\par\\vspace{0.6\\baselineskip}%
    }

    % ===== Personal data =====
    \\firstname{#{escape_tex(first)}}
    \\familyname{#{escape_tex(family)}}
    \\title{#{escape_tex(cv["job_title"] || "Curriculum Vitae")}}
  TEX

  if c["location"]
    out << "\\address{#{escape_tex(c['location'])}}{}\n"
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
    \\usepackage[pdfpagelabels=false]{hyperref}
    \\hypersetup{
        hidelinks,
        pdfauthor={Egor Polyakov},
        pdftitle={Curriculum Vitae - Egor Polyakov},
        pdfcreator={LaTeX with moderncv},
        pdfproducer={pdfLaTeX}
    }

    \\begin{document}
    \\makecvtitle
    \\pagenumbering{arabic}

  TEX

  out << "\\section{Profile}\n"
  out << "\\cvitem{}{#{md_to_tex(cv['profile'])}}\n\n"

  out << "\\section{Practice-to-Research Trajectory}\n"
  Array(cv["trajectory"]).each do |item|
    out << "\\cvitem{#{md_to_tex(item['stage'])}}{#{md_to_tex(item['text'])}}\n"
  end
  out << "\n"

  out << "\\section{Integrated Competencies}\n"
  Array(cv["competencies"]).each do |item|
    out << "\\cvitem{#{md_to_tex(item['label'])}}{#{md_to_tex(item['text'])}}\n"
  end
  out << "\n"

  out << "\\section{Languages}\n"
  Array(cv["languages"]).each do |lang|
    out << "\\cvitem{#{md_to_tex(lang['language'])}}{#{md_to_tex(lang['level'])}}\n"
  end
  out << "\n"

  out << "\\section{Professional Experience}\n"
  Array(cv["experience"]).each do |job|
    out << "\\cventry{#{escape_tex(job['dates'])}}" \
           "{#{md_to_tex(job['role'])}}" \
           "{#{md_to_tex(job['org'])}}" \
           "{#{md_to_tex(job['location'])}}" \
           "{}{%\n"
    out << "#{itemize(Array(job['bullets']))}\n}\n\n"
  end

  if cv["career_context"]
    out << "\\section{Career Context}\n"
    out << "\\cvitem{#{escape_tex(cv['career_context']['dates'])}}" \
           "{#{md_to_tex(cv['career_context']['text'])}}\n\n"
  end

  out << "\\section{Externally Funded Projects}\n"
  Array(cv["funding"]).each do |grant|
    out << "\\cventry{#{escape_tex(grant['dates'])}}" \
           "{\\emph{#{md_to_tex(grant['title'])}}}" \
           "{}{}{}{%\n"
    out << "#{itemize([grant['text']])}\n}\n\n"
  end

  out << "\\section{Teaching}\n"
  if cv.dig("teaching", "summary")
    out << "\\cvitem{}{#{md_to_tex(cv['teaching']['summary'])}}\n"
  end
  out << "\\subsection{Selected courses}\n"
  Array(cv.dig("teaching", "items")).each do |item|
    out << "\\cvitem{#{escape_tex(item['term'])}}" \
           "{#{q(item['title'])} -- #{md_to_tex(item['detail'])}}\n"
  end
  out << "\n"

  out << "\\section{Education}\n"
  Array(cv["education"]).each do |ed|
    out << "\\cventry{#{escape_tex(ed['dates'])}}" \
           "{#{md_to_tex(ed['degree'])}}" \
           "{#{md_to_tex(ed['org'])}}" \
           "{}{}{#{md_to_tex(ed['detail'])}}\n"
  end
  out << "\n"

  pubs = cv["publications"] || {}
  out << "\\section{Publications}\n"
  out << "\\subsection{Published}\n"
  Array(pubs["published"]).each do |pub|
    cite = md_to_tex(pub["citation"])
    if pub["doi"]
      cite += " \\href{#{escape_tex(pub['doi'])}}{DOI}"
    elsif pub["url"]
      cite += " \\href{#{escape_tex(pub['url'])}}{Link}"
    end
    out << "\\cventry{#{escape_tex(pub['year'].to_s)}}{}{}{}{}{#{cite}}\n"
  end
  out << "\n\\subsection{In Press / Accepted}\n"
  Array(pubs["in_press"]).each do |pub|
    out << "\\cventry{#{escape_tex(pub['year'].to_s)}}{}{}{}{}{#{md_to_tex(pub['citation'])}}\n"
  end
  out << "\n\\subsection{Under Review}\n"
  Array(pubs["under_review"]).each do |pub|
    out << "\\cventry{#{escape_tex(pub['year'].to_s)}}{}{}{}{}{#{md_to_tex(pub['citation'])}}\n"
  end
  out << "\n"

  out << "\\section{Talks and Conferences}\n"
  Array(cv["talks"]).each do |talk|
    year = escape_tex(talk["year"].to_s)
    year = "#{year} (#{escape_tex(talk['status'])})" if talk["status"]
    kind = md_to_tex(talk["kind"] || "Talk")
    venue = md_to_tex(talk["venue"])
    note = talk["note"] ? " (#{md_to_tex(talk['note'])})" : ""
    out << "\\cventry{#{year}}{#{kind}: #{q(talk['title'])}}{}{}{}{#{venue}#{note}}\n"
  end
  out << "\n"

  out << "\\section{Artistic and Technical Support (Selection)}\n"
  Array(cv["artistic_support"]).each do |item|
    head = "#{q(item['title'])} (#{md_to_tex(item['artists'])})"
    body = itemize(["**Role:** #{item['role']}.", item["venue"]])
    out << "\\cventry{#{escape_tex(item['year'])}}{#{head}}{}{}{}{%\n#{body}\n}\n"
  end
  out << "\n"

  out << "\\section{Artistic Works (Selection)}\n"
  Array(cv["artistic_works"]).each do |work|
    out << "\\cventry{#{escape_tex(work['year'])}}" \
           "{#{q(work['title'])}}{}{}{}{#{md_to_tex(work['detail'])}}\n"
  end
  out << "\n"

  out << "\\section{Releases (Electronic Music)}\n"
  Array(cv["releases"]).each do |rel|
    out << "\\cventry{#{escape_tex(rel['year'])}}" \
           "{#{md_to_tex(rel['artist'])} -- #{q(rel['title'])}}" \
           "{}{}{}{#{md_to_tex(rel['label'])}}\n"
  end
  out << "\n"

  out << "\\section{Professional Memberships}\n"
  Array(cv["memberships"]).each do |m|
    name = md_to_tex(m["name"])
    name = "\\href{#{escape_tex(m['url'])}}{#{name}}" if m["url"]
    out << "\\cvitem{since #{escape_tex(m['since'].to_s)}}{#{name}}\n"
  end
  out << "\n"

  if cv["note"]
    out << "\\cvitem{Note}{#{md_to_tex(cv['note'])}}\n\n"
  end

  out << "\\end{document}\n"
  out
end

def build_pdf!
  Dir.chdir(File.join(ROOT, "cv")) do
    env = ENV.to_h
    env.delete("TEXMFCNF")
    env.delete("TEXINPUTS")
    env["PATH"] = "/usr/bin:/bin:#{env['PATH']}"
    cmd = %w[latexmk -pdf -interaction=nonstopmode -halt-on-error cv.tex]
    warn "Running: #{cmd.join(' ')}"
    system(env, *cmd) or raise "latexmk failed"
  end
  FileUtils.mkdir_p(File.dirname(PDF_DEST))
  system("/usr/bin/cp", "--", PDF_SRC, PDF_DEST) or raise "PDF copy failed"
  warn "Copied PDF → assets/cv/Egor_Polyakov_CV.pdf"
end

build = false
OptionParser.new do |opts|
  opts.banner = "Usage: generate_cv_tex.rb [--build]"
  opts.on("--build", "Also run latexmk and copy PDF to assets/cv/") { build = true }
end.parse!

cv = YAML.safe_load_file(
  YAML_PATH,
  permitted_classes: [],
  permitted_symbols: [],
  aliases: false
)
raise "cv.yml must parse to a Hash" unless cv.is_a?(Hash)
FileUtils.mkdir_p(File.dirname(TEX_PATH))
File.write(TEX_PATH, generate_tex(cv))
warn "Wrote cv/cv.tex"

build_pdf! if build
