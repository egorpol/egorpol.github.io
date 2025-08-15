---
layout: page
title: Blog
---

# Blog Posts

{% for post in site.posts %}
  <article class="blog-post">
    <header class="post-header">
      <h2><a href="{{ post.url }}">{{ post.title }}</a></h2>
      <time datetime="{{ post.date | date_to_xmlschema }}" class="post-date">
        Published on {{ post.date | date: "%B %d, %Y" }}
      </time>
      {% if post.categories %}
        <div class="post-categories">
          {% for category in post.categories %}
            <span class="category-tag">{{ category | replace: '-', ' ' | capitalize }}</span>
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