---
layout: page
title: Blog
permalink: /blog/
menu: exclude
---

# Blog

This page is organized into thematic tracks so research-focused readers can scan quickly while still leaving room for broader technical and reflective work.

## Tracks

- **Research Notes:** computational musicology, symbolic/audio analysis, digital humanities.
- **Engineering Notes:** Python, machine learning, data workflows, infrastructure prototypes.
- **General Notes:** art, listening notes, philosophy, and adjacent creative practice.

Browse taxonomy: [Categories]({{ '/categories/' | relative_url }}) · [Research]({{ '/categories/#research' | relative_url }}) · [Machine Learning]({{ '/categories/#machine-learning' | relative_url }}) · [Tools]({{ '/categories/#tools' | relative_url }})

## All Posts

{% for post in site.posts %}
  <article class="blog-post">
    <header class="post-header">
      <h2><a href="{{ post.url }}">{{ post.title }}</a></h2>
      <time datetime="{{ post.date | date_to_xmlschema }}" class="post-date">
        Published on {{ post.date | date: "%B %d, %Y" }}
      </time>
      {% assign lane = "General Notes" %}
      {% if post.categories contains "research" or post.categories contains "music-technology" or post.categories contains "music" %}
        {% assign lane = "Research Notes" %}
      {% elsif post.categories contains "machine-learning" or post.categories contains "deep-learning" or post.categories contains "tools" %}
        {% assign lane = "Engineering Notes" %}
      {% endif %}
      <p class="post-track"><strong>Track:</strong> {{ lane }}</p>
      {% if post.categories %}
        <div class="post-categories">
          {% for category in post.categories %}
            <span class="category-tag">{{ category | replace: '-', ' ' | capitalize }}</span>
          {% endfor %}
        </div>
      {% endif %}
      {% if post.tags %}
        <div class="post-tags">
          {% for tag in post.tags %}
            <span class="tag-pill">{{ tag | replace: '-', ' ' }}</span>
          {% endfor %}
        </div>
      {% endif %}
    </header>
    <div class="post-excerpt">
      {{ post.excerpt }}
    </div>
    <footer class="post-footer">
      <a href="{{ post.url }}" class="read-more">Read more →</a>
    </footer>
  </article>
{% endfor %}
