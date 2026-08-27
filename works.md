---
layout: page
title: Works
description: "Electroacoustic compositions, live-electronics realisations, and electronic music releases by Egor Polyakov."
permalink: /works/
breadcrumb:
  - title: Works
---
{% assign cv = site.data.cv %}

<header class="page-intro">
  <p class="eyebrow">Artistic practice</p>
  <h1>Works</h1>
  <p class="lead">Electroacoustic composition for instruments and live electronics, fixed media, and sound installation — alongside the artistic-technical realisation of works by other composers and artists.</p>
</header>

<section class="entry-group" aria-labelledby="compositions-title">
  <h2 id="compositions-title">Compositions</h2>
  <ul class="works-list">
    {% for work in cv.artistic_works %}
    <li>
      <span class="reference-year">{{ work.year }}</span>
      <div>
        <p class="work-title">{{ work.title }}</p>
        <p class="work-detail">{{ work.detail }}</p>
        {% if work.audio %}
        <audio class="work-audio" controls preload="none" src="{{ work.audio | relative_url }}"></audio>
        {% if work.audio_note %}<p class="reference-meta">{{ work.audio_note }}</p>{% endif %}
        {% endif %}
      </div>
    </li>
    {% endfor %}
  </ul>
</section>

<section class="entry-group" aria-labelledby="realisation-title">
  <h2 id="realisation-title">Realisation for other artists</h2>
  <p class="section-intro">Live electronics, spatial-audio system design, restoration, and stem mastering for concert and installation productions.</p>
  <ul class="works-list">
    {% for item in cv.artistic_support %}
    <li>
      <span class="reference-year">{{ item.year }}</span>
      <div>
        <p class="work-title">{{ item.title }}</p>
        <p class="work-detail">{{ item.artists }}</p>
        <p class="work-roles">{{ item.role | capitalize }} — {{ item.venue }}</p>
      </div>
    </li>
    {% endfor %}
  </ul>
</section>

<section class="entry-group" aria-labelledby="releases-title">
  <h2 id="releases-title">Releases</h2>
  <ul class="works-list">
    {% for rel in cv.releases %}
    <li>
      <span class="reference-year">{{ rel.year }}</span>
      <div>
        <p class="work-title">{{ rel.title }}</p>
        <p class="work-detail">{{ rel.artist }} · {{ rel.label }}</p>
      </div>
    </li>
    {% endfor %}
  </ul>
</section>
