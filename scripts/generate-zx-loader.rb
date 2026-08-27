#!/usr/bin/env ruby
# frozen_string_literal: true

# Generates assets/images/zx-loader.svg — a vertical slice of a ZX Spectrum 48K
# tape-loading border.
#
# Band heights come from the real ROM loader timings rather than being chosen by
# eye: the leader is a steady 2168 T-state pulse in red/cyan, two sync pulses of
# 667 and 735 T mark the block start, and each data bit is two pulses in
# blue/yellow — 855 T for a 0 and 1710 T for a 1. Because a 1 is exactly twice
# the length of a 0, stripe thickness carries the data, so the pattern below is
# MESSAGE in ASCII rather than an arbitrary repeat.

MESSAGE = 'EGOR POLYAKOV'
WIDTH = 16

# 48K border colours are the BRIGHT set — the ULA has no separate BRIGHT bit
# for the border, so these are the primaries you actually saw while loading.
PALETTE = {
  red: '#ff0000',
  yellow: '#ffff00',
  cyan: '#00ffff',
  blue: '#0000ff'
}.freeze

# T-states scaled to pixels; keeps the 2:1 ratio between a 1 bit and a 0 bit.
SCALE = 0.0023
PILOT = 2168 * SCALE
SYNC1 = 667 * SCALE
SYNC2 = 735 * SCALE
ZERO  = 855 * SCALE
ONE   = 1710 * SCALE

def bands_for(palette)
  bands = []

  # Leader tone: thick red/cyan, the "waiting for a header" phase.
  36.times { |i| bands << [PILOT, i.even? ? palette[:red] : palette[:cyan]] }

  bands << [SYNC1, palette[:red]]
  bands << [SYNC2, palette[:cyan]]

  # Data block: two pulses per bit, the border flipping on every edge.
  pulse = 0
  MESSAGE.each_byte do |byte|
    7.downto(0) do |bit|
      height = byte[bit] == 1 ? ONE : ZERO
      2.times do
        bands << [height, pulse.even? ? palette[:blue] : palette[:yellow]]
        pulse += 1
      end
    end
  end

  bands
end

bands = bands_for(PALETTE)
total = bands.sum { |height, _| height }.round(2)

rects = []
y = 0.0
bands.each do |height, colour|
  rects << format('<rect y="%.2f" width="%d" height="%.2f" fill="%s"/>', y, WIDTH, height, colour)
  y += height
end

svg = <<~SVG
  <svg xmlns="http://www.w3.org/2000/svg" width="#{WIDTH}" height="#{total}" viewBox="0 0 #{WIDTH} #{total}" shape-rendering="crispEdges">
  #{rects.join("\n")}
  </svg>
SVG

%w[zx-loader.svg zx-loader-dark.svg].each do |name|
  path = File.expand_path("../assets/images/#{name}", __dir__)
  File.write(path, svg)
  puts "#{bands.length} bands, #{total.round}px tall, #{PALETTE.values.join(' ')} -> #{name}"
end

puts "encoded: #{MESSAGE} (#{MESSAGE.bytesize * 8} bits)"
