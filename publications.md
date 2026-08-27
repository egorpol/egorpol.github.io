---
layout: page
title: Publications
description: "Peer-reviewed publications, book chapters, and conference contributions by Egor Polyakov in computational musicology and music technology."
permalink: /publications/
breadcrumb:
  - title: Publications
---
{% assign cv = site.data.cv %}

<header class="page-intro">
  <p class="eyebrow">Research output</p>
  <h1>Publications</h1>
  <p class="lead">Book chapters, conference papers, and talks on computational score analysis, timbre and rhythm research, music encoding, and machine learning for musicology.</p>
  <p><a class="text-link" href="{{ cv.contact.orcid }}" target="_blank" rel="noopener noreferrer">ORCID record <span aria-hidden="true">↗</span></a></p>
</header>

<section class="entry-group" aria-labelledby="published-title">
  <h2 id="published-title">Published</h2>
  <ol class="reference-list">
    {% for item in cv.publications.published %}
    <li>
      <span class="reference-year">{{ item.year }}</span>
      <div class="reference-body">
        <p>{{ item.citation | markdownify | remove: '<p>' | remove: '</p>' }}</p>
        {% if item.doi %}<a class="doi-link" href="{{ item.doi }}" target="_blank" rel="noopener noreferrer">DOI <span aria-hidden="true">↗</span></a>
        {% elsif item.url %}<a class="doi-link" href="{{ item.url }}" target="_blank" rel="noopener noreferrer">Publisher <span aria-hidden="true">↗</span></a>{% endif %}
      </div>
    </li>
    {% endfor %}
  </ol>
</section>

{% if cv.publications.in_press %}
<section class="entry-group" aria-labelledby="inpress-title">
  <h2 id="inpress-title">In press</h2>
  <ol class="reference-list">
    {% for item in cv.publications.in_press %}
    <li>
      <span class="reference-year">{{ item.year }}</span>
      <div class="reference-body">
        <p>{{ item.citation | markdownify | remove: '<p>' | remove: '</p>' }}</p>
      </div>
    </li>
    {% endfor %}
  </ol>
</section>
{% endif %}

{% if cv.publications.under_review %}
<section class="entry-group" aria-labelledby="review-title">
  <h2 id="review-title">Under review</h2>
  <ol class="reference-list">
    {% for item in cv.publications.under_review %}
    <li>
      <span class="reference-year">{{ item.year }}</span>
      <div class="reference-body">
        <p>{{ item.citation | markdownify | remove: '<p>' | remove: '</p>' }}</p>
      </div>
    </li>
    {% endfor %}
  </ol>
</section>
{% endif %}

<section class="entry-group" aria-labelledby="talks-title">
  <h2 id="talks-title">Talks and conference contributions</h2>
  <ol class="reference-list">
    {% for item in cv.talks %}
    <li>
      <span class="reference-year">{{ item.year }}</span>
      <div class="reference-body">
        <p>{{ item.title | markdownify | remove: '<p>' | remove: '</p>' }}</p>
        <p class="reference-meta">{{ item.venue }}{% if item.note %} — {{ item.note }}{% endif %}</p>
        <span class="reference-kind">{{ item.kind }}{% if item.status %} · {{ item.status }}{% endif %}</span>
      </div>
    </li>
    {% endfor %}
  </ol>
</section>
