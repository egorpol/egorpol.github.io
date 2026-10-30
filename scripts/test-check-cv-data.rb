#!/usr/bin/env ruby
# frozen_string_literal: true

# Test CV data checks, date boundaries, real data, and CLI exit codes.
# Usage:
#   ruby scripts/test-check-cv-data.rb

require "open3"
require "rbconfig"
require "tempfile"
require_relative "check-cv-data"

class CheckCVDataTest
  def assert_equal(expected, actual)
    raise "Expected #{expected.inspect}, got #{actual.inspect}" unless expected == actual
  end

  def assert_includes(text, expected)
    raise "Missing #{expected.inspect} in #{text.inspect}" unless text.include?(expected)
  end

  def setup
    @cv = {
      "talks" => [{ "title" => "Synthetic talk", "year" => "2026", "venue" => "Conference, 21–23 September 2026" }],
      "homepage" => { "highlights" => %w[one two three four] }
    }
    @talk = @cv.fetch("talks").first
    @today = Date.new(2026, 10, 28)
    @real_cv = YAML.safe_load_file(YAML_PATH, aliases: false)
  end

  def assert_problem(reason)
    problems = check_cv_data(@cv, @today)
    assert_equal 1, problems.length
    assert_includes problems.first, @talk.fetch("title")
    assert_includes problems.first, reason
  end

  # Only the real talks a test is about, so adding or updating other talks in
  # cv.yml doesn't change the expected problems.
  def real_talks(*events)
    talks = @real_cv.fetch("talks").select { |talk| events.any? { |event| talk.fetch("venue").include?(event) } }
    assert_equal events.length, talks.length
    { "talks" => talks, "homepage" => { "highlights" => %w[one two three four] } }
  end

  def cli(*args)
    output, status = Open3.capture2e(RbConfig.ruby, File.join(ROOT, "scripts", "check-cv-data.rb"), *args)
    [output, status.exitstatus]
  end

  def test_date_forms_and_both_range_separators
    {
      "12 June 2026" => [Date.new(2026, 6, 12), Date.new(2026, 6, 12)],
      "21–23 September 2026" => [Date.new(2026, 9, 21), Date.new(2026, 9, 23)],
      "30 September–2 October 2022" => [Date.new(2022, 9, 30), Date.new(2022, 10, 2)],
      "30 December 2026–2 January 2027" => [Date.new(2026, 12, 30), Date.new(2027, 1, 2)]
    }.each do |text, expected|
      [text, text.tr("–", "-")].uniq.each do |dates|
        assert_equal expected, talk_dates("Conference, #{dates}")
      end
    end
  end

  def test_missing_or_invalid_dates
    [nil, "Conference, date TBA", "Conference, 31 June 2026", "Conference, 12 Smarch 2026",
     "Conference, 23–21 September 2026", "Conference, 31 September–2 October 2022",
     "Conference, 12 June 2026 (tentative)"].each do |venue|
      @talk["venue"] = venue
      assert_problem "venue has no parseable event date"
    end
  end

  def test_year_uses_the_end_of_a_cross_year_range
    @talk["venue"] = "Conference, 30 December 2026–2 January 2027"
    @talk["status"] = "accepted"
    assert_problem "differs from event end year 2027"
    @talk["year"] = "2027"
    assert_equal [], check_cv_data(@cv, @today)
  end

  def test_unknown_statuses_are_rejected_even_without_a_date
    ["submitted", "", false].each do |status|
      @talk["status"] = status
      assert_problem "unknown status #{status.inspect}"
    end
    @talk["venue"] = "Conference, date TBA"
    problems = check_cv_data(@cv, @today)
    assert_equal 2, problems.length
    assert_includes problems.first, "unknown status"
    assert_includes problems.last, "no parseable event date"
  end

  def test_accepted_becomes_stale_only_after_the_last_day
    @talk["status"] = "accepted"
    [Date.new(2026, 9, 20), Date.new(2026, 9, 21), Date.new(2026, 9, 23)].each do |today|
      assert_equal [], check_cv_data(@cv, today)
    end
    @today = Date.new(2026, 9, 24)
    assert_problem "stale accepted status; event ended 2026-09-23"
  end

  def test_presented_is_allowed_from_the_first_day
    @talk["status"] = "presented"
    @today = Date.new(2026, 9, 20)
    assert_problem "presented before event starts 2026-09-21"
    [Date.new(2026, 9, 21), Date.new(2026, 9, 22), Date.new(2026, 9, 24)].each do |today|
      assert_equal [], check_cv_data(@cv, today)
    end
  end

  def test_missing_status_is_allowed_from_the_first_day
    @today = Date.new(2026, 9, 20)
    assert_problem "future talk has no status; event starts 2026-09-21"
    [Date.new(2026, 9, 21), Date.new(2026, 9, 22), Date.new(2026, 9, 24)].each do |today|
      assert_equal [], check_cv_data(@cv, today)
    end
  end

  def test_status_de_is_ignored
    @talk["status"] = "presented"
    assert_equal [], check_cv_data(@cv, @today)
    @talk["status_de"] = "anything"
    assert_equal [], check_cv_data(@cv, @today)
  end

  def test_homepage_requires_exactly_four_highlights
    [[], %w[one two three], %w[one two three four five], nil, "four"].each do |highlights|
      @cv["homepage"]["highlights"] = highlights
      assert_equal ["homepage.highlights must have exactly 4 items"], check_cv_data(@cv, @today)
    end
    @cv.delete("homepage")
    assert_equal ["homepage.highlights must have exactly 4 items"], check_cv_data(@cv, @today)
  end

  def test_all_talks_are_checked_and_all_problems_are_returned
    @talk["status"] = "accepted"
    @talk["year"] = "2025"
    @cv["talks"] << { "title" => "Another talk", "year" => "2027", "venue" => "Conference, 12 June 2027" }
    problems = check_cv_data(@cv, @today)
    assert_equal 3, problems.length
    assert_includes problems[0], "Synthetic talk: year"
    assert_includes problems[1], "Synthetic talk: stale accepted"
    assert_includes problems[2], "Another talk: future talk has no status"
  end

  def test_real_data_at_requested_dates
    cv = real_talks("ICCCM26", "InMusic26")
    poster, in_music = cv.fetch("talks")
    {
      "2026-10-28" => [],
      "2026-09-22" => [],
      "2026-09-20" => [poster],
      "2026-06-13" => [poster],
      "2026-06-01" => [poster, in_music]
    }.each do |today, expected_talks|
      problems = check_cv_data(cv, Date.iso8601(today))
      assert_equal expected_talks.length, problems.length
      expected_talks.zip(problems).each do |talk, problem|
        assert_includes problem, talk.fetch("title")
        assert_includes problem, "presented before event starts"
      end
    end
  end

  def test_real_salzburg_dates
    salzburg = @real_cv.fetch("talks").find { |talk| talk.fetch("venue").include?("Salzburg") }
    assert_equal [Date.new(2022, 9, 30), Date.new(2022, 10, 2)], talk_dates(salzburg.fetch("venue"))
  end

  def test_real_icccm_accepted_status_would_be_stale
    cv = real_talks("ICCCM26")
    poster = cv.fetch("talks").first
    poster["status"] = "accepted"
    problems = check_cv_data(cv, @today)
    assert_equal 1, problems.length
    assert_includes problems.first, poster.fetch("title")
    assert_includes problems.first, "stale accepted status"
  end

  def test_cli_fails_and_names_a_planted_stale_talk
    @talk["status"] = "accepted"
    Tempfile.create(["check-cv-data-", ".yml"], ROOT) do |file|
      file.write(YAML.dump(@cv))
      file.flush
      output, status = cli("--today", "2026-10-28", "--data", file.path)
      assert_equal 1, status
      assert_includes output, "Synthetic talk: stale accepted status; event ended 2026-09-23"
    end
  end

  def test_cli_succeeds_on_clean_data
    @talk["status"] = "presented"
    Tempfile.create(["check-cv-data-", ".yml"], ROOT) do |file|
      file.write(YAML.dump(@cv))
      file.flush
      output, status = cli("--today", "2026-10-28", "--data", file.path)
      assert_equal 0, status
      assert_equal "Checked 1 talks: no problems.\n", output
    end
  end

  def test_cli_defaults_to_the_real_date
    output, status = cli
    problems = check_cv_data(@real_cv, Date.today)
    assert_equal problems.empty? ? 0 : 1, status
    expected = problems.empty? ? ["Checked 15 talks: no problems."] : problems
    assert_equal "#{expected.join("\n")}\n", output
  end

  def test_cli_rejects_invalid_today_values
    ["2026-02-30", "2026-6-1", "20261028"].each do |today|
      output, status = cli("--today", today)
      assert_equal 1, status
      assert_includes output, "invalid"
    end
  end
end

CheckCVDataTest.instance_methods.grep(/^test_/).sort.each do |name|
  test = CheckCVDataTest.new
  test.setup
  test.public_send(name)
  puts "PASS #{name}"
end
