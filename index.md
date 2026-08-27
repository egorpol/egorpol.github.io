---
layout: page
title: Egor Polyakov
description: "Postdoctoral researcher in computational musicology connecting research software, music analysis, electroacoustic practice, and teaching."
permalink: /
tags:
  - computational musicology
  - audio analysis
  - symbolic music
  - machine learning
  - python
  - electroacoustic music
  - composition
  - live electronics
structured_data:
  '@context': 'https://schema.org'
  '@type': 'Person'
  name: 'Egor Polyakov'
  alternateName: 'Egor Poliakov'
  description: 'Postdoctoral researcher in computational musicology connecting research software, music analysis, electroacoustic practice, and teaching.'
  image: 'https://egorpol.github.io/assets/images/avatar.jpg'
  url: 'https://egorpol.github.io'
  jobTitle: 'Postdoctoral Researcher in Computational Musicology'
  worksFor:
    '@type': 'Organization'
    name: 'University of Music FRANZ LISZT Weimar'
    url: 'https://www.hfm-weimar.de/'
  email: 'mailto:egor.polyakov@hfm-weimar.de'
  identifier: 'https://orcid.org/0000-0003-0913-0429'
  sameAs:
    - 'https://orcid.org/0000-0003-0913-0429'
    - 'https://github.com/egorpol'
    - 'https://www.linkedin.com/in/egor-polyakov-6a2114315/'
  alumniOf:
    - '@type': 'EducationalOrganization'
      name: 'University of Music and Theatre Leipzig'
    - '@type': 'EducationalOrganization'
      name: 'University of Music and Performing Arts Stuttgart'
---
{% assign cv = site.data.cv %}

<section class="hero" aria-labelledby="hero-title">
  <div class="hero-copy">
    <p class="eyebrow">Postdoctoral researcher · HfM Weimar</p>
    <h1 id="hero-title">I build tools to explore how music works</h1>
    <p class="lead">{{ cv.homepage.tagline }}</p>
    <div class="hero-actions">
      <a class="button button-primary" href="{{ '/cv/' | relative_url }}">View curriculum vitae</a>
      <a class="button button-secondary" href="{{ '/projects/' | relative_url }}">Explore projects</a>
    </div>
  </div>
  <div class="hero-portrait">
    <picture>
      <source srcset="{{ '/assets/images/avatar.webp' | relative_url }}" type="image/webp">
      <img src="{{ '/assets/images/avatar.jpg' | relative_url }}" alt="Portrait of Egor Polyakov" loading="eager" fetchpriority="high" width="320" height="480" data-no-viewer>
    </picture>
  </div>
</section>

<section class="content-section prose-patch" aria-labelledby="motivation-title">
  <p class="section-label">What keeps me curious</p>
  <h2 id="motivation-title">It started with a computer—and with having fun</h2>
  <div class="prose-copy">
    {% for paragraph in cv.homepage.motivation %}
    <p>{{ paragraph }}</p>
    {% endfor %}
  </div>
  {% include word-patch.html a="zx" b="piano" c="setup" d="try" sink="fun" %}
</section>

<section class="content-section current-work" aria-labelledby="current-work-title">
  <p class="section-label">Current appointment</p>
  <h2 id="current-work-title">Research at HfM Weimar</h2>
  <p>{{ cv.homepage.current_work | markdownify | remove: '<p>' | remove: '</p>' }}</p>
  {% include chain-patch.html a="hfm weimar" b="me" %}
</section>

<section class="content-section trajectory-patch" aria-labelledby="practice-title">
  <div class="trajectory-copy" data-patch="head">
    <p class="section-label">How I got here</p>
    <h2 id="practice-title">A path through different ideas of music</h2>
    <p class="section-intro">This was not a neat progression in which one discipline simply led to the next. Encounters with different kinds of music, years of working between them, and a difficult period of doubt all changed the direction of my work.</p>
    {% include patch-nubs.html %}
  </div>
  <ol class="trajectory-grid trajectory-compact">
    {% for item in cv.homepage.journey %}
    <li>
      {% include patch-cord.html %}
      <span class="trajectory-index">0{{ forloop.index }}</span>
      <strong>{{ item.stage }}</strong>
      <p>{{ item.text }}</p>
      {% include patch-nubs.html %}
    </li>
    {% endfor %}
  </ol>
</section>

<section class="content-section prose-patch" aria-labelledby="accessibility-title">
  <p class="section-label">Working principles</p>
  <h2 id="accessibility-title">Open tools, reproducible music</h2>
  <div class="prose-copy">
    {% for paragraph in cv.homepage.accessibility %}
    <p>{{ paragraph }}</p>
    {% endfor %}
  </div>
  {% include word-patch.html a="open" b="sound" c="inspect" d="time" sink="adapt" %}
</section>

<section class="content-section project-patch" aria-labelledby="projects-title">
  <div class="section-heading project-copy">
    <div>
      <p class="section-label">Open research software</p>
      <h2 id="projects-title">Selected projects</h2>
    </div>
    <a class="text-link project-all-plain" href="{{ '/projects/' | relative_url }}">All projects <span aria-hidden="true">→</span></a>
  </div>
  <div class="project-grid">
    {% for project in cv.projects %}
    <article class="project-card" data-patch="proj" data-col="{{ forloop.index }}">
      <h3><a href="{{ project.url }}" target="_blank" rel="noopener noreferrer">{{ project.name }}</a></h3>
      <p>{{ project.blurb }}</p>
      <a class="card-link" href="{{ project.url }}" target="_blank" rel="noopener noreferrer">Visit project <span aria-hidden="true">↗</span></a>
      {% include patch-nubs.html %}
    </article>
    {% endfor %}
    {% for project in cv.projects %}
    <span class="patch-cord patch-cord-y" data-cord="p{{ forloop.index }}" aria-hidden="true"></span>
    {% endfor %}
    <a class="project-all" data-patch="sink" href="{{ '/projects/' | relative_url }}">All projects{% include patch-nubs.html %}</a>
  </div>
</section>

<section class="content-section highlight-patch" aria-labelledby="highlights-title">
  <div class="section-heading">
    <div>
      <p class="section-label">Selected activity</p>
      <h2 id="highlights-title">Recent highlights</h2>
    </div>
    <a class="text-link highlight-all-plain" href="{{ '/publications/' | relative_url }}">All publications <span aria-hidden="true">→</span></a>
  </div>
  <div class="highlight-stage">
    <ul class="highlight-list">
      {% for item in cv.homepage.highlights %}
      <li>
        <div class="highlight-obj" data-hl="{{ forloop.index }}">
          {{ item | markdownify | remove: '<p>' | remove: '</p>' }}
          {% include patch-nubs.html %}
        </div>
        <span class="patch-cord patch-cord-y" data-cord="d{{ forloop.index }}" aria-hidden="true"></span>
        <span class="patch-cord patch-cord-x" data-cord="r{{ forloop.index }}" aria-hidden="true"></span>
      </li>
      {% endfor %}
    </ul>
    <span class="patch-cord patch-cord-bus" aria-hidden="true"></span>
    <span class="patch-cord patch-cord-x" data-cord="to-sink" aria-hidden="true"></span>
    <a class="highlight-all" data-patch="hl-sink" href="{{ '/publications/' | relative_url }}">All publications<span aria-hidden="true">&nbsp;↗</span>{% include patch-nubs.html %}</a>
  </div>
</section>

<section class="contact-panel" id="contact" aria-labelledby="contact-title">
  <div class="contact-copy" data-patch="src">
    <p class="section-label">Contact</p>
    <h2 id="contact-title">Research, teaching, and collaboration</h2>
    <p>For professional enquiries, the most direct route is email.</p>
    {% include patch-nubs.html %}
  </div>
  <div class="contact-links" aria-label="Professional profiles">
    <span class="patch-cord patch-cord-y" data-cord="src-tl" aria-hidden="true"></span>
    <span class="patch-cord patch-cord-y" data-cord="src-tr" aria-hidden="true"></span>
    <a class="button button-primary patch-obj" data-patch="tl" href="mailto:{{ cv.contact.email }}">Email{% include patch-nubs.html %}</a>
    <a class="button button-secondary patch-obj" data-patch="tr" href="{{ cv.contact.orcid }}" target="_blank" rel="noopener noreferrer">ORCID{% include patch-nubs.html %}</a>
    <span class="patch-cord patch-cord-y" data-cord="tl-bl" aria-hidden="true"></span>
    <span class="patch-cord patch-cord-y" data-cord="tr-br" aria-hidden="true"></span>
    <a class="button button-secondary patch-obj" data-patch="bl" href="{{ cv.contact.github }}" target="_blank" rel="noopener noreferrer">GitHub{% include patch-nubs.html %}</a>
    <a class="button button-secondary patch-obj" data-patch="br" href="{{ cv.contact.linkedin }}" target="_blank" rel="noopener noreferrer">LinkedIn{% include patch-nubs.html %}</a>
  </div>
</section>
