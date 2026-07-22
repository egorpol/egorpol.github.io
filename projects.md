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
  <article class="project-feature">
    <div>
      <p class="project-number">0{{ forloop.index }}</p>
      <h2>{{ project.name }}</h2>
    </div>
    <div>
      <p>{{ project.detail }}</p>
      <a class="text-link" href="{{ project.url }}" target="_blank" rel="noopener noreferrer">{% if project.url contains 'github.com' %}View on GitHub{% else %}Explore {{ project.name }}{% endif %} <span aria-hidden="true">↗</span></a>
    </div>
  </article>
  {% endfor %}
</div>
