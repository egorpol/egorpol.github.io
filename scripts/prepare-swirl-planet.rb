#!/usr/bin/env ruby
# frozen_string_literal: true

# Rebuild waveforms and ZX covers from the listening copies on the release page.
require 'fileutils'
require 'json'
require 'open3'

ROOT = File.expand_path('..', __dir__)
AUDIO = File.join(ROOT, 'assets/audio/swirl-planet')
IMAGES = File.join(ROOT, 'assets/images/releases')
WAVES = File.join(IMAGES, 'swirl-planet-waveforms')
TRACKS = [
  ['01-swirl-planet', 'Swirl Planet'],
  ['02-sand-movement', 'Sand Movement'],
  ['03-sand-movement-christoph-schindling-remix', 'Sand Movement (Christoph Schindling Remix)'],
  ['04-sand-movement-adverb-remix', 'Sand Movement (Adverb Remix)'],
  ['05-all-night-long', 'All Night Long'],
  ['06-cold-frog', 'Cold Frog'],
  ['07-love-diffuser', 'Love Diffuser'],
  ['08-medium-surf', 'Medium Surf']
].freeze

def run(*args)
  abort("Failed: #{args.first}") unless system(*args)
end

FileUtils.mkdir_p(WAVES)
TRACKS.each do |slug, _title|
  target = File.join(AUDIO, "#{slug}.mp3")
  abort("Missing #{target}") unless File.exist?(target)
  waveform = File.join(WAVES, "#{slug}.png")
  unless File.exist?(waveform)
    run('ffmpeg', '-v', 'error', '-n', '-i', target, '-filter_complex',
        'aformat=channel_layouts=mono,showwavespic=s=1600x240:colors=white:scale=lin:draw=full,format=rgba,colorkey=0x000000:0.01:0',
        '-frames:v', '1', waveform)
  end
  output, result = Open3.capture2('ffprobe', '-v', 'error', '-show_entries',
                                'format=duration:stream=sample_rate,channels,bit_rate', '-of', 'json', target)
  abort('ffprobe failed') unless result.success?
  puts "#{slug}: #{JSON.parse(output)}"
end

cover = File.join(IMAGES, 'two-unknown-guys-swirl-planet-original.jpg')
abort("Missing #{cover}") unless File.exist?(cover)
[['mono', 'zx'], ['mono-dark', 'zx-dark']].each do |mode, suffix|
  target = File.join(IMAGES, "two-unknown-guys-swirl-planet-#{suffix}.png")
  run('ruby', File.join(__dir__, 'generate-zx-portrait.rb'), mode, target, cover, '128', '128') unless File.exist?(target)
end
