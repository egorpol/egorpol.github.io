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
    <h1 id="hero-title">Computational musicology grounded in creative practice</h1>
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

<section class="content-section current-work" aria-labelledby="current-work-title">
  <p class="section-label">Current appointment</p>
  <h2 id="current-work-title">Research at HfM Weimar</h2>
  <p>{{ cv.homepage.current_work | markdownify | remove: '<p>' | remove: '</p>' }}</p>
</section>

<section class="content-section trajectory-patch" aria-labelledby="practice-title">
  <div class="trajectory-copy" data-patch="head">
    <p class="section-label">An integrated practice</p>
    <h2 id="practice-title">Creative, technical, and analytical work</h2>
    <p class="section-intro">Each stage informs the next: composition led to electronic systems and production, which now shape how I design computational methods.</p>
    {% include patch-nubs.html %}
  </div>
  <ol class="trajectory-grid trajectory-compact">
    {% for item in cv.trajectory %}
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
  </div>
  <a class="project-all" data-patch="sink" href="{{ '/projects/' | relative_url }}">All projects{% include patch-nubs.html %}</a>
</section>

<section class="content-section" aria-labelledby="highlights-title">
  <div class="section-heading">
    <div>
      <p class="section-label">Selected activity</p>
      <h2 id="highlights-title">Recent highlights</h2>
    </div>
    <a class="text-link" href="{{ '/publications/' | relative_url }}">All publications <span aria-hidden="true">→</span></a>
  </div>
  <ul class="highlight-list">
    {% for item in cv.homepage.highlights %}
    <li>{{ item | markdownify | remove: '<p>' | remove: '</p>' }}</li>
    {% endfor %}
  </ul>
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
