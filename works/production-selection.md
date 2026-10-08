---
layout: page
title: Selected Productions
description: "Seven excerpts for Egor Polyakov’s HfM Dresden application, with individual MP3 and AIFF downloads."
permalink: /works/production-selection/
audio_player: true
sitemap: false
breadcrumb:
  - title: Works
    url: /works/
  - title: Selected Productions
scripts:
  - /assets/lib/wavesurfer-7.12.11.min.js
  - /assets/js/release-player.js?v=20261008-1
---
{% assign demo = site.data.dd_demo %}
{% assign first = demo.tracks | first %}

<article class="release-page demo-page" data-release-player data-playback="once">
  <header class="page-intro">
    <p class="eyebrow">HfM Dresden application · Egor Polyakov</p>
    <h1>{{ demo.title }}</h1>
    <p class="lead">Excerpts from my compositions, co-productions, and mastering work. My contribution is identified for each recording.</p>
    <p class="demo-summary">{{ demo.tracks.size }} excerpts <span aria-hidden="true">·</span> {{ demo.duration_label }} total <span aria-hidden="true">·</span> stereo</p>
  </header>

  <section class="content-section release-listen" aria-labelledby="listen-title">
    <h2 id="listen-title">Listen</h2>
    <p>Choose an excerpt, or press play to hear the selection in order.</p>
    <div class="release-player-shell">
      <audio class="release-audio" preload="none"></audio>
      <div class="release-player-meta">
        <span class="release-now-title">01 · {{ first.title | escape }}</span>
        <span>MP3 · 320 kbps · 44.1 kHz</span>
      </div>
      <div class="release-waveform" role="slider" tabindex="0" aria-label="Seek through {{ first.title | escape }}" aria-valuemin="0" aria-valuemax="{{ first.duration | round }}" aria-valuenow="0">
        <span class="release-wave-shape" aria-hidden="true"></span>
        <span class="release-wave-played" aria-hidden="true"></span>
        <span class="release-wave-playhead" aria-hidden="true"></span>
        <span class="release-wave-engine" aria-hidden="true"></span>
      </div>
      <div class="release-transport">
        <div class="release-patch" aria-label="Playback controls">
          <button class="release-play" type="button" aria-label="Play {{ first.title | escape }}" aria-pressed="false"><span aria-hidden="true">▶</span></button>
          <span class="release-cord" aria-hidden="true"></span>
          <span class="release-object">sfplay~<i aria-hidden="true"></i></span>
          <span class="release-cord release-signal-cord" aria-hidden="true"></span>
          <span class="release-object">dac~</span>
          <span class="release-status" aria-live="polite">READY</span>
        </div>
        <time class="release-time">00:00 / {{ first.duration_label }}</time>
      </div>
    </div>

    <ol class="release-tracks" id="tracks" aria-label="Selected productions">
      {% for track in demo.tracks %}
      <li>
        <button type="button" data-track data-title="{{ track.title | escape }}" data-duration="{{ track.duration }}" data-src="{{ track.audio | relative_url }}" data-waveform="{{ track.waveform | relative_url }}" aria-current="{% if forloop.first %}true{% else %}false{% endif %}"{% if track.id == 'mast_shandy_cut' %} aria-describedby="source-note"{% endif %}>
          <span>0{{ forloop.index }}</span>
          <strong>{{ track.title | escape }}<small>{{ track.artist | escape }} · {{ track.year }} · {{ track.role | escape }}</small>{% if track.context %}<small>{{ track.context | escape }}</small>{% endif %}</strong>
          <time>{{ track.duration_label }}</time>
        </button>
        <div class="demo-track-downloads">
          <div class="demo-track-links">
            <a href="{{ track.audio | relative_url }}" download aria-label="Download {{ track.artist | escape }} — {{ track.title | escape }} as MP3">Download MP3 · {{ track.mp3_size }}</a>
            <a href="{{ track.aiff | relative_url }}" download aria-label="Download {{ track.artist | escape }} — {{ track.title | escape }} as AIFF">Download AIFF · {{ track.aiff_size }}</a>
          </div>
          <span>MP3 · 320 kbps <span aria-hidden="true">/</span> AIFF · {{ track.aiff_format }}</span>
        </div>
      </li>
      {% endfor %}
    </ol>

    <noscript>
      <div class="demo-native-players">
        {% for track in demo.tracks %}
        <p><strong>{{ track.artist | escape }} — {{ track.title | escape }}</strong></p>
        <audio controls preload="none" aria-label="{{ track.artist | escape }} — {{ track.title | escape }}" src="{{ track.audio | relative_url }}"></audio>
        {% endfor %}
      </div>
    </noscript>
  </section>

  <aside class="demo-source-note" aria-labelledby="source-note-title">
    <h2 id="source-note-title">A note on the source quality</h2>
    <p id="source-note">{{ demo.source_note | escape }}</p>
  </aside>

  <section class="content-section demo-formats" aria-labelledby="formats-title">
    <h2 id="formats-title">Download formats</h2>
    <p>Every excerpt is available as a stereo AIFF at 16-bit / 44.1 kHz and an MP3 at 320 kbps.</p>
    <p><a class="text-link" href="{{ '/works/' | relative_url }}">Explore compositions, releases, and mastering credits <span aria-hidden="true">→</span></a></p>
  </section>
</article>
