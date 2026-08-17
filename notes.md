---
layout: page
title: Notes
description: "Working notes on computational musicology, research software, audio analysis, and machine-learning experiments by Egor Polyakov."
permalink: /notes/
breadcrumb:
  - title: Notes
---

<header class="page-intro">
  <p class="eyebrow">Lab notebook</p>
  <h1>Notes</h1>
  <p class="lead">Working notes on research software, analysis workflows, and experiments — written as they happen rather than as finished results.</p>
</header>

<ul class="notes-list">
  {% for post in site.posts %}
  <li>
    <span class="reference-year"><time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%b %Y" }}</time></span>
    <div>
      <h2 class="note-title"><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
      {% if post.excerpt %}<p class="work-detail">{{ post.excerpt | strip_html | strip_newlines | truncate: 200 }}</p>{% endif %}
      {% if post.tags %}<p class="note-tags">{% for tag in post.tags %}<span>{{ tag }}</span>{% endfor %}</p>{% endif %}
    </div>
  </li>
  {% endfor %}
</ul>

<p><a class="text-link" href="{{ '/notes/feed.xml' | relative_url }}">RSS feed <span aria-hidden="true">↗</span></a></p>
