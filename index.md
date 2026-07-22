---
layout: page
title: Egor Polyakov
description: "Postdoctoral researcher in computational musicology connecting research software, music analysis, electroacoustic practice, and teaching."
permalink: /
image: /assets/images/avatar.jpg
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
  <picture class="hero-portrait">
    <source srcset="{{ '/assets/images/avatar.webp' | relative_url }}" type="image/webp">
    <img src="{{ '/assets/images/avatar.jpg' | relative_url }}" alt="Portrait of Egor Polyakov" loading="eager" fetchpriority="high" width="320" height="480" data-no-viewer>
  </picture>
</section>

<section class="content-section current-work" aria-labelledby="current-work-title">
  <p class="section-label">Current appointment</p>
  <h2 id="current-work-title">Research at HfM Weimar</h2>
  <p>{{ cv.homepage.current_work | markdownify | remove: '<p>' | remove: '</p>' }}</p>
</section>

<section class="content-section" aria-labelledby="practice-title">
  <p class="section-label">An integrated practice</p>
  <h2 id="practice-title">Creative, technical, and analytical work</h2>
  <p class="section-intro">Each stage informs the next: composition led to electronic systems and production, which now shape how I design computational methods.</p>
  <ol class="trajectory-grid trajectory-compact">
    {% for item in cv.trajectory %}
    <li>
      <span class="trajectory-index">0{{ forloop.index }}</span>
      <strong>{{ item.stage }}</strong>
      <p>{{ item.text }}</p>
    </li>
    {% endfor %}
  </ol>
</section>

<section class="content-section" aria-labelledby="projects-title">
  <div class="section-heading">
    <div>
      <p class="section-label">Open research software</p>
      <h2 id="projects-title">Selected projects</h2>
    </div>
    <a class="text-link" href="{{ '/projects/' | relative_url }}">All projects <span aria-hidden="true">→</span></a>
  </div>
  <div class="project-grid">
    {% for project in cv.projects %}
    <article class="project-card">
      <h3><a href="{{ project.url }}" target="_blank" rel="noopener noreferrer">{{ project.name }}</a></h3>
      <p>{{ project.blurb }}</p>
      <a class="card-link" href="{{ project.url }}" target="_blank" rel="noopener noreferrer">Visit project <span aria-hidden="true">↗</span></a>
    </article>
    {% endfor %}
  </div>
</section>

<section class="content-section" aria-labelledby="highlights-title">
  <p class="section-label">Selected activity</p>
  <h2 id="highlights-title">Recent highlights</h2>
  <ul class="highlight-list">
    {% for item in cv.homepage.highlights %}
    <li>{{ item | markdownify | remove: '<p>' | remove: '</p>' }}</li>
    {% endfor %}
  </ul>
</section>

<section class="contact-panel" id="contact" aria-labelledby="contact-title">
  <div>
    <p class="section-label">Contact</p>
    <h2 id="contact-title">Research, teaching, and collaboration</h2>
    <p>For professional enquiries, the most direct route is email.</p>
  </div>
  <div class="contact-links" aria-label="Professional profiles">
    <a class="button button-primary" href="mailto:{{ cv.contact.email }}">Email</a>
    <a class="button button-secondary" href="{{ cv.contact.orcid }}" target="_blank" rel="noopener noreferrer">ORCID</a>
    <a class="button button-secondary" href="{{ cv.contact.github }}" target="_blank" rel="noopener noreferrer">GitHub</a>
    <a class="button button-secondary" href="{{ cv.contact.linkedin }}" target="_blank" rel="noopener noreferrer">LinkedIn</a>
  </div>
</section>
