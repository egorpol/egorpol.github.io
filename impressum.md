---
layout: page
title: Impressum
description: "Impressum (Anbieterkennzeichnung) von egorpol.github.io."
permalink: /impressum/
lang: de
locale: de_DE
sitemap: false
breadcrumb:
  - title: Impressum
---
{% assign legal = site.data.legal %}

<header class="page-intro">
  <p class="eyebrow">Rechtliches</p>
  <h1>Impressum</h1>
  <p class="lead" lang="en">Legal notice required under German law.</p>
</header>

<section class="entry-group" aria-labelledby="provider-title">
  <h2 id="provider-title">Angaben gemäß § 5 DDG und § 18 Abs. 1 MStV</h2>
  <p>{{ site.author }}<br>
  {% for line in legal.address %}{{ line }}{% unless forloop.last %}<br>{% endunless %}{% endfor %}</p>
</section>

<section class="entry-group" aria-labelledby="contact-title">
  <h2 id="contact-title">Kontakt</h2>
  <p>E-Mail: <a href="mailto:{{ site.email }}">{{ site.email }}</a></p>
</section>

<section class="entry-group" aria-labelledby="editorial-title">
  <h2 id="editorial-title">Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
  <p>{{ site.author }}, Anschrift wie oben</p>
</section>
