require_relative 'generate_cv_tex'

class GenerateCVTest
  def assert_equal(expected, actual)
    raise "Expected #{expected.inspect}, got #{actual.inspect}" unless expected == actual
  end

  def assert_includes(text, expected)
    raise "Missing #{expected.inspect}" unless text.include?(expected)
  end

  def refute_includes(text, unwanted)
    raise "Unexpected #{unwanted.inspect}" if text.include?(unwanted)
  end

  def setup
    @cv = YAML.safe_load_file(YAML_PATH, aliases: false)
    @tex = generate_tex(@cv)
  end

  def test_current_role_and_publication_updates
    assert_includes @tex, 'research and development for the DFG-funded CAMAT project'
    refute_includes @tex, 'scientific co-lead'
    refute_includes @tex, 'supervise doctoral candidates'
    assert_includes @tex, '10.4324/9781003118817-21'
    assert_includes @tex, '[Dataset]. Zenodo. DOI: 10.5281/zenodo.23730119. \\href{https://doi.org/10.5281/zenodo.23730119}{DOI}'
    assert_includes @tex, 'https://laaber-verlag.de/detailview?no=00456'
    assert_includes @tex, 'https://nbn-resolving.org/urn:nbn:de:bsz:14-qucosa2-723858'
  end

  def test_cyrillic_is_wrapped_without_losing_latex_escaping
    assert_equal '\\textcyrillic{Крайне затруднительны} \\& A\\_B', escape_tex('Крайне затруднительны & A_B')
    assert_includes @tex, '\\textcyrillic{Римского}'
    assert_includes @tex, '\\ifPDFTeX'
    assert_includes @tex, '\\fontencoding{T2A}'
    assert_includes @tex, '\\cyrillicfont{DejaVu Sans}'
  end

  def test_mastering_summary_comes_from_shared_data
    assert_includes @tex, md_to_tex(@cv.fetch('mastering').fetch('summary'))
    assert_includes @tex, '\\href{https://egorpol.github.io/works/\\#mastering}{Full mastering discography and credits}'
  end

  def test_in_press_entries_keep_their_links
    assert_includes @tex, '\\href{https://www.routledge.com/Innovation-in-Music-Sound-and-Place/'
    refute_includes @tex, 'Polyakov, E. (2026). \\emph{Understanding and Emulating Time'
  end

  def test_talks_and_submissions_link_their_materials
    assert_includes @tex, 'P. Steuck)~\\textperiodcentered{} \\href{https://github.com/egorpol/fftimbre-llm-workflows}{Materials}}'
    assert_includes @tex, '(InMusic26).~\\textperiodcentered{} \\href{https://github.com/egorpol/fftimbre-llm-workflows}{Materials}}'
    assert_includes @tex, '2024~\\textperiodcentered{} \\href{https://github.com/egorpol/Electroacoustic-LLM-Analysis}{Materials}}'
    assert_includes generate_tex(@cv, Localizer.new('de')), '\\href{https://github.com/egorpol/Electroacoustic-LLM-Analysis}{Materialien}}'
  end

  def test_teaching_items_name_their_institution
    assert_includes @tex, '\\enquote{Hearing (and analyzing) in time}, HMT Leipzig --'
  end

  def test_subsection_headings_stay_with_their_first_entry
    assert_includes @tex, '\\preto{\\subsection}{\\Needspace{5\\baselineskip}}'
  end

  def test_tracked_tex_is_current
    assert_equal File.read(File.join(ROOT, 'cv', 'cv.tex')), @tex
    assert_equal File.read(File.join(ROOT, 'cv', 'cv.de.tex')), generate_tex(@cv, Localizer.new('de'))
  end

  def test_web_download_links_match_the_built_pdfs
    { 'pdf' => 'en', 'pdf_de' => 'de' }.each do |key, lang|
      assert_equal "/assets/cv/#{OUTPUTS[lang][:pdf]}", @cv[key]['path']
      assert_equal OUTPUTS[lang][:pdf], @cv[key]['filename']
    end
  end

  def test_english_keeps_english_labels_and_metadata
    assert_includes @tex, '\\usepackage[english]{babel}'
    assert_includes @tex, "pdftitle={Curriculum Vitae - Egor Polyakov},\n    pdfcreator="
    assert_includes @tex, '\\cventry{2025--present}{Postdoctoral Researcher}'
    refute_includes @tex, 'pdflang'
    refute_includes @tex, '\\AtEndPreamble'
  end

  def without_german(node)
    case node
    when Hash then node.reject { |key, _| key.end_with?('_de') }.transform_values { |v| without_german(v) }
    when Array then node.map { |v| without_german(v) }
    else node
    end
  end

  def test_german_uses_de_fields_and_reports_missing_ones_by_path
    cv = without_german(@cv)
    cv['profile_de'] = 'Deutsches Profil.'
    cv['experience'][0]['role_de'] = 'Wissenschaftlicher Mitarbeiter (Postdoc)'
    l = Localizer.new('de')
    tex = generate_tex(cv, l)
    paths = l.missing.map(&:first)

    assert_includes tex, "\\section{Profil}\n\\cvitem{}{Deutsches Profil.}"
    assert_includes tex, '\\cventry{seit 2025}{Wissenschaftlicher Mitarbeiter (Postdoc)}'
    assert_includes tex, '\\usepackage[ngerman]{babel}'
    assert_includes tex, '\\AtEndPreamble{\\hypersetup{pdftitle={Lebenslauf - Egor Polyakov}, pdfsubject='
    assert_includes tex, 'pdflang={de-DE},'
    refute_includes paths, 'profile_de'
    refute_includes paths, 'experience[0].role_de'
    assert_includes paths, 'experience[0].bullets_de'
    assert_includes paths, 'publications.in_press[0].year_de'
    refute_includes paths, 'publications.published[0].year_de'
    refute_includes paths, 'releases[0].title_de'
  end

  def test_real_data_has_every_german_field
    l = Localizer.new('de')
    tex = generate_tex(@cv, l)
    assert_equal [], l.missing
    assert_includes tex, '\\cvitem{}{Produzent, Mastering-Engineer und Komponist,'
    assert_includes tex, 'Verheiratet, zwei Kinder.'
    assert_includes tex, '\\cventry{seit 2025}{Kumulative Habilitation (laufend)}'
    refute_includes tex, '2018 und 2020'
  end

  def test_german_leaves_out_the_career_context_section
    l = Localizer.new('de')
    tex = generate_tex(@cv, l)
    refute_includes tex, 'Career Context'
    refute_includes tex, 'COVID-19'
    refute_includes l.missing.map(&:first).join(' '), 'career_context'
  end

  def test_german_dates_replace_present_only
    l = Localizer.new('de')
    assert_equal 'seit 2025', l.dates('2025–present')
    assert_equal '2013–2025', l.dates('2013–2025')
    assert_equal '2025–present', Localizer.new.dates('2025–present')
  end

  def test_unknown_language_is_rejected
    Localizer.new('fr')
    raise 'Expected ArgumentError'
  rescue ArgumentError
    nil
  end
end

GenerateCVTest.instance_methods.grep(/^test_/).sort.each do |name|
  test = GenerateCVTest.new
  test.setup
  test.public_send(name)
  puts "PASS #{name}"
end
