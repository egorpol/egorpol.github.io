---
layout: page
title: Projects
description: "Selected open research software and computational musicology projects by Egor Polyakov."
permalink: /projects/
breadcrumb:
  - title: Projects
---
{% assign cv = site.data.cv %}

<header class="page-intro">
  <p class="eyebrow">Research software</p>
  <h1>Projects</h1>
  <p class="lead">Open tools for symbolic-score analysis, audio research, and reproducible, notebook-based work in musicology and teaching.</p>
</header>

<div class="project-list">
  {% for project in cv.projects %}
  <article class="project-feature" aria-labelledby="project-{{ forloop.index }}-title">
    {% unless forloop.first %}<span class="patch-cord project-entry-cord" aria-hidden="true"></span>{% endunless %}
    {% include patch-nubs.html %}
    <div class="project-feature-identity">
      <div class="project-feature-object">
        <p class="project-number">0{{ forloop.index }}</p>
        <h2 id="project-{{ forloop.index }}-title">{{ project.name }}</h2>
        {% include patch-nubs.html %}
      </div>
      {% unless forloop.last %}<span class="patch-cord project-label-cord" aria-hidden="true"></span>{% endunless %}
    </div>
    <div class="project-feature-copy">
      <p>{{ project.detail }}</p>
      {% if project.context %}<p>{{ project.context }}</p>{% endif %}
      <a class="text-link" href="{{ project.url }}" target="_blank" rel="noopener noreferrer">{% if project.url contains 'github.com' %}View on GitHub{% else %}Explore {{ project.name }}{% endif %} <span aria-hidden="true">↗</span></a>
    </div>
  </article>
  {% endfor %}
</div>
