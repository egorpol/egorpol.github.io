---
layout: page
title: Curriculum Vitae
description: "CV of Egor Polyakov — composition, electronic music practice, computational musicology, research software, teaching, and artistic-technical realisation."
permalink: /cv/
image: /assets/images/avatar.jpg
breadcrumb:
  - title: CV
structured_data:
  '@context': 'https://schema.org'
  '@type': 'CreativeWork'
  name: 'Curriculum Vitae — Egor Polyakov'
  description: 'Professional curriculum vitae of Egor Polyakov, computational musicologist and postdoctoral researcher.'
  creator:
    '@type': 'Person'
    name: 'Egor Polyakov'
    url: 'https://egorpol.github.io'
    sameAs:
      - 'https://orcid.org/0000-0003-0913-0429'
      - 'https://github.com/egorpol'
  url: 'https://egorpol.github.io/cv/'
  genre: 'CurriculumVitae'
  inLanguage: 'en'
  dateModified: '2026-07-22'
  about:
    '@type': 'Person'
    name: 'Egor Polyakov'
    jobTitle: 'Postdoctoral Researcher in Computational Musicology'
    worksFor:
      '@type': 'Organization'
      name: 'University of Music FRANZ LISZT Weimar'
---
{% assign cv = site.data.cv %}

<div class="cv-page">
  <header class="cv-intro">
    <p class="eyebrow">Academic curriculum vitae</p>
    <h1>Egor Polyakov</h1>
    <p class="cv-role">{{ cv.job_title }} · {{ cv.affiliation }}</p>
    <p class="lead">{{ cv.profile }}</p>
    <div class="cv-actions">
      <a class="button button-primary" href="{{ cv.pdf.path | relative_url }}" download="{{ cv.pdf.filename }}">Download PDF</a>
      <a class="button button-secondary" href="mailto:{{ cv.contact.email }}">Email</a>
    </div>
  </header>

  <section class="trajectory-section" aria-labelledby="trajectory-title">
    <p class="section-label">Practice-to-research trajectory</p>
    <h2 id="trajectory-title">A map of my professional development</h2>
    <ol class="trajectory-grid">
      {% for item in cv.trajectory %}
      <li>
        <span class="trajectory-index">0{{ forloop.index }}</span>
        <strong>{{ item.stage }}</strong>
        <p>{{ item.text }}</p>
      </li>
      {% endfor %}
    </ol>
  </section>

  <nav class="cv-toc" aria-label="CV sections">
    <a href="#experience">Experience</a>
    <a href="#career-context">Context</a>
    <a href="#funding">Funding</a>
    <a href="#teaching">Teaching</a>
    <a href="#education">Education</a>
    <a href="#publications">Publications</a>
    <a href="#talks">Talks</a>
  </nav>

  <section class="cv-section" aria-labelledby="competencies-title">
    <h2 id="competencies-title">Integrated Competencies</h2>
    <dl class="competency-grid">
      {% for item in cv.competencies %}
      <div>
        <dt>{{ item.label }}</dt>
        <dd>{{ item.text }}</dd>
      </div>
      {% endfor %}
    </dl>
  </section>

  <section class="cv-section" id="experience" aria-labelledby="experience-title">
    <h2 id="experience-title">Professional Experience</h2>
    {% for job in cv.experience %}
    <article class="cv-entry">
      <div class="cv-entry-date">{{ job.dates }}</div>
      <div class="cv-entry-body">
        <h3>{{ job.role }}</h3>
        <p class="cv-organisation">{{ job.org }} · {{ job.location }}</p>
        <ul>
          {% for bullet in job.bullets %}
          <li>{{ bullet | markdownify | remove: '<p>' | remove: '</p>' }}</li>
          {% endfor %}
        </ul>
      </div>
    </article>
    {% endfor %}
  </section>

  <section class="cv-section" id="career-context" aria-labelledby="career-context-title">
    <h2 id="career-context-title">Career Context</h2>
    <article class="cv-entry cv-entry-compact">
      <div class="cv-entry-date">{{ cv.career_context.dates }}</div>
      <div class="cv-entry-body">
        <p>{{ cv.career_context.text }}</p>
      </div>
    </article>
  </section>

  <section class="cv-section" id="funding" aria-labelledby="funding-title">
    <h2 id="funding-title">Externally Funded Projects</h2>
    {% for grant in cv.funding %}
    <article class="cv-entry cv-entry-compact">
      <div class="cv-entry-date">{{ grant.dates }}</div>
      <div class="cv-entry-body">
        <h3>{{ grant.title }}</h3>
        <p>{{ grant.text }}</p>
      </div>
    </article>
    {% endfor %}
  </section>

  <section class="cv-section" id="teaching" aria-labelledby="teaching-title">
    <h2 id="teaching-title">Teaching</h2>
    <p>{{ cv.teaching.summary }}</p>
    <h3 class="cv-subheading">Selected courses</h3>
    <ul class="dated-list">
      {% for item in cv.teaching.items %}
      <li><span>{{ item.term }}</span><div><strong>{{ item.title }}</strong><br>{{ item.detail }}</div></li>
      {% endfor %}
    </ul>
  </section>

  <section class="cv-section" id="education" aria-labelledby="education-title">
    <h2 id="education-title">Education</h2>
    {% for ed in cv.education %}
    <article class="cv-entry cv-entry-compact">
      <div class="cv-entry-date">{{ ed.dates }}</div>
      <div class="cv-entry-body">
        <h3>{{ ed.degree }}</h3>
        <p class="cv-organisation">{{ ed.org }}</p>
        <p>{{ ed.detail }}</p>
      </div>
    </article>
    {% endfor %}
  </section>

  <section class="cv-section" id="publications" aria-labelledby="publications-title">
    <h2 id="publications-title">Publications</h2>
    <ol class="publication-list">
      {% for pub in cv.publications.published %}
      <li>{{ pub.citation | markdownify | remove: '<p>' | remove: '</p>' }}{% if pub.doi %} <a href="{{ pub.doi }}" target="_blank" rel="noopener noreferrer">DOI <span aria-hidden="true">↗</span></a>{% elsif pub.url %} <a href="{{ pub.url }}" target="_blank" rel="noopener noreferrer">Publisher <span aria-hidden="true">↗</span></a>{% endif %}</li>
      {% endfor %}
    </ol>

    {% if cv.publications.in_press.size > 0 %}
    <h3 class="cv-subheading">In Press / Accepted</h3>
    <ul class="publication-list">
      {% for pub in cv.publications.in_press %}
      <li>{{ pub.citation | markdownify | remove: '<p>' | remove: '</p>' }}</li>
      {% endfor %}
    </ul>
    {% endif %}

    {% if cv.publications.under_review.size > 0 %}
    <h3 class="cv-subheading">Under Review</h3>
    <ul class="publication-list">
      {% for pub in cv.publications.under_review %}
      <li>{{ pub.citation | markdownify | remove: '<p>' | remove: '</p>' }}</li>
      {% endfor %}
    </ul>
    {% endif %}
  </section>

  <section class="cv-section" id="talks" aria-labelledby="talks-title">
    <h2 id="talks-title">Selected Talks and Conferences</h2>
    <ul class="dated-list talks-list">
      {% for talk in cv.talks %}
      <li>
        <span>{{ talk.year }}{% if talk.status %}<small>{{ talk.status }}</small>{% endif %}</span>
        <div><strong>{{ talk.kind }}:</strong> “{{ talk.title }}”<br>{{ talk.venue }}{% if talk.note %} · {{ talk.note }}{% endif %}</div>
      </li>
      {% endfor %}
    </ul>
  </section>

  <section class="cv-section cv-secondary" aria-labelledby="practice-title">
    <h2 id="practice-title">Artistic and Technical Practice</h2>
    <h3 class="cv-subheading">Selected support and production</h3>
    <ul class="dated-list">
      {% for item in cv.artistic_support %}
      <li><span>{{ item.year }}</span><div><strong>{{ item.title }}</strong> ({{ item.artists }})<br>{{ item.role | capitalize }} · {{ item.venue }}</div></li>
      {% endfor %}
    </ul>

    <h3 class="cv-subheading">Selected artistic works</h3>
    <ul class="dated-list">
      {% for work in cv.artistic_works %}
      <li><span>{{ work.year }}</span><div><strong>{{ work.title }}</strong> · {{ work.detail }}</div></li>
      {% endfor %}
    </ul>

    <h3 class="cv-subheading">Electronic music releases</h3>
    <ul class="dated-list">
      {% for rel in cv.releases %}
      <li><span>{{ rel.year }}</span><div><strong>{{ rel.artist }} — {{ rel.title }}</strong><br>{{ rel.label }}</div></li>
      {% endfor %}
    </ul>
  </section>

  <section class="cv-section cv-footer-grid" aria-label="Additional information">
    <div>
      <h2>Memberships</h2>
      <ul>
        {% for m in cv.memberships %}
        <li><a href="{{ m.url }}" target="_blank" rel="noopener noreferrer">{{ m.name }}</a> · since {{ m.since }}</li>
        {% endfor %}
      </ul>
    </div>
    <div>
      <h2>Languages</h2>
      <ul>
        {% for lang in cv.languages %}
        <li>{{ lang.language }} · {{ lang.level }}</li>
        {% endfor %}
      </ul>
    </div>
  </section>

  <aside class="cv-note">
    <p>{{ cv.note }}</p>
  </aside>
</div>
