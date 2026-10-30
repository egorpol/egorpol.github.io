#!/usr/bin/env ruby
# frozen_string_literal: true

# Check talk dates and statuses and the four-item homepage highlight layout.
# Usage:
#   ruby scripts/check-cv-data.rb [--today YYYY-MM-DD] [--data PATH]

require "yaml"
require "date"
require "optparse"

ROOT = File.expand_path("..", __dir__)
YAML_PATH = File.join(ROOT, "_data", "cv.yml")

def talk_dates(venue)
  match = venue.to_s.match(/(?<![\w–-])
    (?:(?<start_day>\d{1,2})
       (?:\s+(?<start_month>[A-Za-z]+)(?:\s+(?<start_year>\d{4}))?)?
       \s*[–-]\s*)?
    (?<end_day>\d{1,2})\s+(?<end_month>[A-Za-z]+)\s+(?<end_year>\d{4})\s*\z
  /x)
  return unless match

  end_date = Date.new(match[:end_year].to_i, Date::MONTHNAMES.index(match[:end_month]) || 0,
                      match[:end_day].to_i)
  start_date = Date.new((match[:start_year] || match[:end_year]).to_i,
                       Date::MONTHNAMES.index(match[:start_month] || match[:end_month]) || 0,
                       (match[:start_day] || match[:end_day]).to_i)
  [start_date, end_date] if start_date <= end_date
rescue Date::Error
  nil
end

def check_cv_data(cv, today)
  problems = []
  cv.fetch("talks").each do |talk|
    title = talk.fetch("title")
    status = talk["status"]
    unless [nil, "accepted", "presented"].include?(status)
      problems << "#{title}: unknown status #{status.inspect} (expected accepted or presented)"
    end

    dates = talk_dates(talk["venue"])
    unless dates
      problems << "#{title}: venue has no parseable event date"
      next
    end
    start_date, end_date = dates
    if talk["year"].to_s != end_date.year.to_s
      problems << "#{title}: year #{talk['year'].inspect} differs from event end year #{end_date.year}"
    end
    if status == "accepted" && end_date < today
      problems << "#{title}: stale accepted status; event ended #{end_date} (today #{today})"
    elsif status == "presented" && start_date > today
      problems << "#{title}: presented before event starts #{start_date} (today #{today})"
    elsif status.nil? && start_date > today
      problems << "#{title}: future talk has no status; event starts #{start_date} (today #{today})"
    end
  end

  highlights = cv.dig("homepage", "highlights")
  unless highlights.is_a?(Array) && highlights.length == 4
    problems << "homepage.highlights must have exactly 4 items"
  end
  problems
end

if $PROGRAM_NAME == __FILE__
  today = Date.today
  data_path = YAML_PATH
  begin
    OptionParser.new do |opts|
      opts.banner = "Usage: ruby scripts/check-cv-data.rb [--today YYYY-MM-DD] [--data PATH]"
      opts.on("--today YYYY-MM-DD", "Date to check against (default: today)") do |value|
        unless value.match?(/\A\d{4}-\d{2}-\d{2}\z/)
          raise OptionParser::InvalidArgument, "--today must be YYYY-MM-DD"
        end
        today = Date.iso8601(value)
      end
      opts.on("--data PATH", "CV YAML file (default: _data/cv.yml)") { |value| data_path = value }
    end.parse!
    raise OptionParser::InvalidArgument, ARGV.join(" ") unless ARGV.empty?
  rescue OptionParser::ParseError, Date::Error => e
    abort e.message
  end

  cv = YAML.safe_load_file(data_path, aliases: false)
  problems = check_cv_data(cv, today)
  unless problems.empty?
    puts problems
    exit 1
  end
  puts "Checked #{cv.fetch('talks').length} talks: no problems."
end
