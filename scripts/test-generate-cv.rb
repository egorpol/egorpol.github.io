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

  def test_subsection_headings_stay_with_their_first_entry
    assert_includes @tex, '\\preto{\\subsection}{\\Needspace{5\\baselineskip}}'
  end
end

GenerateCVTest.instance_methods.grep(/^test_/).sort.each do |name|
  test = GenerateCVTest.new
  test.setup
  test.public_send(name)
  puts "PASS #{name}"
end
