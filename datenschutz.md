---
layout: page
title: Datenschutz
description: "Datenschutzerklärung von egorpol.github.io."
permalink: /datenschutz/
lang: de
locale: de_DE
sitemap: false
breadcrumb:
  - title: Datenschutz
---
{% assign legal = site.data.legal %}

<header class="page-intro">
  <p class="eyebrow">Rechtliches</p>
  <h1>Datenschutzerklärung</h1>
  <p class="lead">Diese Website setzt keine Cookies, nutzt keine Analyse- oder Tracking-Dienste und lädt keine Inhalte von fremden Servern. Personenbezogene Daten fallen nur beim Hosting und beim Kontakt per E-Mail an.</p>
</header>

<section class="entry-group" aria-labelledby="controller-title">
  <h2 id="controller-title">Verantwortlicher</h2>
  <p>{{ site.author }}<br>
  {% for line in legal.address %}{{ line }}<br>{% endfor %}
  E-Mail: <a href="mailto:{{ site.email }}">{{ site.email }}</a></p>
</section>

<section class="entry-group" aria-labelledby="hosting-title">
  <h2 id="hosting-title">Hosting durch GitHub Pages</h2>
  <p>Diese Website wird über GitHub Pages bereitgestellt, einen Dienst der GitHub, Inc., 88 Colin P. Kelly Jr. St., San Francisco, CA 94107, USA. Beim Aufruf einer Seite protokolliert GitHub nach eigenen Angaben Ihre IP-Adresse und speichert sie zu Sicherheitszwecken. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO; mein berechtigtes Interesse liegt in einer sicheren und zuverlässigen Bereitstellung der Website.</p>
  <p>Für Übermittlungen in die USA stützt sich GitHub nach eigenen Angaben auf das EU-U.S. Data Privacy Framework und die Standardvertragsklauseln der Europäischen Kommission. Einzelheiten stehen in der <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener noreferrer">Datenschutzerklärung von GitHub</a>.</p>
</section>

<section class="entry-group" aria-labelledby="storage-title">
  <h2 id="storage-title">Einstellungen im Browser</h2>
  <p>Die Website speichert im lokalen Speicher (localStorage) Ihres Browsers, welches Farbschema Sie gewählt haben (<code>theme</code>), ob die Pixel-Ansicht an ist (<code>chrome</code>), ob der Hinweis zur Pixel-Ansicht schon geschlossen wurde (<code>chrome-hint-3</code>) und ob Sie den Hinweis auf der Startseite geschlossen haben (<code>site-notice-dismissed</code>). Diese Werte verlassen Ihren Browser nicht. Sie dienen nur dazu, die von Ihnen gewählte Darstellung beizubehalten (§ 25 Abs. 2 Nr. 2 TDDDG), und lassen sich jederzeit über die Browsereinstellungen löschen.</p>
</section>

<section class="entry-group" aria-labelledby="email-title">
  <h2 id="email-title">Kontakt per E-Mail</h2>
  <p>Wenn Sie mir schreiben, verarbeite ich Ihre E-Mail-Adresse und Ihre Nachricht, um sie zu beantworten (Art. 6 Abs. 1 lit. f DSGVO, bei Anfragen zu einer Zusammenarbeit Art. 6 Abs. 1 lit. b DSGVO). Ich lösche diese Daten, wenn sie dafür nicht mehr gebraucht werden und keine gesetzlichen Aufbewahrungspflichten bestehen.</p>
</section>

<section class="entry-group" aria-labelledby="links-title">
  <h2 id="links-title">Links zu anderen Websites</h2>
  <p>Links etwa zu ORCID, GitHub oder LinkedIn übertragen erst dann Daten an den jeweiligen Anbieter, wenn Sie ihnen folgen. Ab dann gilt dessen Datenschutzerklärung.</p>
</section>

<section class="entry-group" aria-labelledby="rights-title">
  <h2 id="rights-title">Ihre Rechte</h2>
  <p>Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch gegen Verarbeitungen nach Art. 6 Abs. 1 lit. f DSGVO (Art. 21). Schreiben Sie dazu an die oben genannte E-Mail-Adresse. Außerdem können Sie sich bei einer Datenschutz-Aufsichtsbehörde beschweren (Art. 77 DSGVO).</p>
  <p>Stand: 31. Oktober 2026</p>
</section>
