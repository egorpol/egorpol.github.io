---
layout: page
title: Categories
description: "Browse blog posts by categories and tags."
permalink: /categories/
breadcrumb:
  - title: Categories
    url: /categories/
---

# Categories and Tags

Use this page to browse posts by topic.

## Categories

{% assign sorted_categories = site.categories | sort %}
{% if sorted_categories and sorted_categories.size > 0 %}
{% for category_pair in sorted_categories %}
{% assign category_name = category_pair[0] %}
{% assign posts_in_category = category_pair[1] | sort: "date" | reverse %}
### {{ category_name | replace: '-', ' ' | capitalize }} {#{{ category_name | slugify }}}

{% for post in posts_in_category %}
- [{{ post.title }}]({{ post.url | relative_url }}) <small>({{ post.date | date: "%Y-%m-%d" }})</small>
{% endfor %}

{% endfor %}
{% else %}
No categories yet.
{% endif %}

## Tags

{% assign sorted_tags = site.tags | sort %}
{% if sorted_tags and sorted_tags.size > 0 %}
{% for tag_pair in sorted_tags %}
{% assign tag_name = tag_pair[0] %}
{% assign posts_with_tag = tag_pair[1] | sort: "date" | reverse %}
### {{ tag_name | replace: '-', ' ' | capitalize }} {#{{ tag_name | slugify }}}

{% for post in posts_with_tag %}
- [{{ post.title }}]({{ post.url | relative_url }}) <small>({{ post.date | date: "%Y-%m-%d" }})</small>
{% endfor %}

{% endfor %}
{% else %}
No tags yet.
{% endif %}
