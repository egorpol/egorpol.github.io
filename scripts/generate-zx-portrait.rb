#!/usr/bin/env ruby
# frozen_string_literal: true

# Renders the portrait the way a ZX Spectrum 48K had to.
#
# The Spectrum stored the screen as a 1-bit bitmap plus a separate low-resolution
# attribute map: every 8x8 block gets exactly two colours, an ink and a paper,
# and both must share the same BRIGHT flag. That single constraint is what
# produces the machine's characteristic colour clash, and reproducing it
# properly is the difference between this and a generic pixelate filter.
#
# For each block we search every legal colour pair, assign each pixel to
# whichever of the two it is closer to, and keep the pair with the lowest total
# error. Output is written at 1:1 so the browser can scale it by an exact
# integer factor with image-rendering: pixelated.

require 'tempfile'

#
# Modes:
#   clash  full 15-colour attribute clash, both BRIGHT sets — loudest, most
#          obviously a Spectrum
#   muted  non-BRIGHT colours only over a desaturated source — same machine,
#          calmer against the site palette
#   mono   a single ink/paper pair in the site's own navy and cream — 1-bit
#          like a monochrome loading screen, quietest of the three
#   mono-dark  the same, inverted for the dark theme

SOURCE = File.expand_path('../assets/images/avatar.jpg', __dir__)
MODE = ARGV[0] || 'clash'
TARGET = ARGV[1] || File.expand_path('../assets/images/avatar-zx.png', __dir__)

# The hero caps the portrait at 16rem, so 128 wide displays at exactly 2x and
# the pixels stay square and even.
WIDTH = 128
HEIGHT = 192
BLOCK = 8

# Ink and paper may not mix BRIGHT within one block, so the two sets are
# searched separately. Black is common to both.
NORMAL = [
  [0, 0, 0], [0, 0, 215], [215, 0, 0], [215, 0, 215],
  [0, 215, 0], [0, 215, 215], [215, 215, 0], [215, 215, 215]
].freeze

BRIGHT = [
  [0, 0, 0], [0, 0, 255], [255, 0, 0], [255, 0, 255],
  [0, 255, 0], [0, 255, 255], [255, 255, 0], [255, 255, 255]
].freeze

SITE_INK = [20, 42, 58]
SITE_PAPER = [246, 240, 229]
SITE_INK_DARK = [244, 232, 213]
SITE_PAPER_DARK = [19, 44, 61]

PAIRS, SATURATION = case MODE
                    when 'mono'      then [[[SITE_INK, SITE_PAPER]], 0]
                    when 'mono-dark' then [[[SITE_INK_DARK, SITE_PAPER_DARK]], 0]
                    when 'muted'     then [NORMAL.combination(2).to_a, 55]
                    else [[NORMAL, BRIGHT].flat_map { |s| s.combination(2).to_a }, 100]
                    end

# Ordered dither. With only two colours per block, thresholding each pixel to
# the nearer one just posterises; dithering against a Bayer matrix mixes them
# spatially and recovers the midtones, which is what real Spectrum converters
# do and what makes a photograph legible at all.
BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5]
].freeze

# How far along the ink-to-paper axis a pixel sits, clamped to the segment.
def projection(pixel, from, to)
  vr = to[0] - from[0]
  vg = to[1] - from[1]
  vb = to[2] - from[2]
  length = (vr * vr) + (vg * vg) + (vb * vb)
  return 0.0 if length.zero?

  t = (((pixel[0] - from[0]) * vr) +
       ((pixel[1] - from[1]) * vg) +
       ((pixel[2] - from[2]) * vb)) / length.to_f
  t.clamp(0.0, 1.0)
end

# Because the output is dithered, any mix along the segment is reachable, so a
# pair is scored by distance to the whole segment rather than to its endpoints.
def segment_error(pixel, from, to)
  t = projection(pixel, from, to)
  dr = pixel[0] - (from[0] + ((to[0] - from[0]) * t))
  dg = pixel[1] - (from[1] + ((to[1] - from[1]) * t))
  db = pixel[2] - (from[2] + ((to[2] - from[2]) * t))
  (dr * dr) + (dg * dg) + (db * db)
end

raw = Tempfile.new(['zxsrc', '.rgb'])
begin
  # Only a gentle lift. Pushing contrast hard here collapses the pair search
  # onto a handful of garish combinations.
  system('magick', SOURCE,
         '-resize', "#{WIDTH}x#{HEIGHT}!",
         '-modulate', "100,#{SATURATION},100",
         '-sigmoidal-contrast', '1.5,50%',
         '-depth', '8', "RGB:#{raw.path}") || abort('magick failed reading source')

  bytes = File.binread(raw.path).bytes
  pixels = Array.new(HEIGHT) do |y|
    Array.new(WIDTH) do |x|
      i = ((y * WIDTH) + x) * 3
      [bytes[i], bytes[i + 1], bytes[i + 2]]
    end
  end

  out = Array.new(HEIGHT) { Array.new(WIDTH) }
  clash = Hash.new(0)

  (0...HEIGHT).step(BLOCK) do |by|
    (0...WIDTH).step(BLOCK) do |bx|
      block = []
      BLOCK.times { |dy| BLOCK.times { |dx| block << [bx + dx, by + dy] } }

      best_pair = nil
      best_error = nil

      PAIRS.each do |(ink, paper)|
        error = 0
        block.each do |(x, y)|
          error += segment_error(pixels[y][x], ink, paper)
        end
        if best_error.nil? || error < best_error
          best_error = error
          best_pair = [ink, paper]
        end
      end

      ink, paper = best_pair
      clash[best_pair] += 1
      block.each do |(x, y)|
        t = projection(pixels[y][x], paper, ink)
        threshold = (BAYER[y % 4][x % 4] + 0.5) / 16.0
        out[y][x] = t > threshold ? ink : paper
      end
    end
  end

  packed = out.flatten(1).flatten.pack('C*')
  dest = Tempfile.new(['zxout', '.rgb'])
  begin
    File.binwrite(dest.path, packed)
    system('magick', '-size', "#{WIDTH}x#{HEIGHT}", '-depth', '8',
           "RGB:#{dest.path}", '-define', 'png:color-type=3', TARGET) ||
      abort('magick failed writing target')
  ensure
    dest.close!
  end

  blocks = (WIDTH / BLOCK) * (HEIGHT / BLOCK)
  puts "#{MODE}: #{WIDTH}x#{HEIGHT}, #{blocks} attribute blocks, #{clash.keys.length} distinct pairs"
  puts "-> #{TARGET} (#{File.size(TARGET)} bytes)"
ensure
  raw.close!
end
