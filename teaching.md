---
layout: page
title: Teaching
description: "Courses and seminars taught by Egor Polyakov in electroacoustic composition, computational music analysis, and AI for musicology."
permalink: /teaching/
breadcrumb:
  - title: Teaching
---
{% assign cv = site.data.cv %}

<header class="page-intro">
  <p class="eyebrow">Courses and supervision</p>
  <h1>Teaching</h1>
  <p class="lead">{{ cv.teaching.summary }}</p>
</header>

<section class="entry-group" aria-labelledby="courses-title">
  <h2 id="courses-title">Courses and seminars</h2>
  <ol class="reference-list">
    {% for item in cv.teaching.items %}
    <li>
      <span class="reference-year">{{ item.term }}</span>
      <div class="reference-body">
        <p class="work-title">{{ item.title }}</p>
        <p class="work-detail">{{ item.detail }}</p>
      </div>
    </li>
    {% endfor %}
  </ol>
</section>

<section class="entry-group" aria-labelledby="supervision-title">
  <h2 id="supervision-title">Supervision and studio work</h2>
  {{ cv.teaching.supervision | markdownify }}
  <p><a class="text-link" href="{{ '/cv/' | relative_url }}">Full curriculum vitae <span aria-hidden="true">→</span></a></p>
</section>
