# Blog Post Categories Guide

## How to Define Categories

Categories should be defined as YAML arrays in the front matter of your blog posts.

### ✅ Correct Format
```yaml
---
layout: post
title: "Your Post Title"
date: 2024-07-23
categories: [machine-learning, deep-learning, vae, mnist]
excerpt: "Your excerpt here"
---
```

### ❌ Incorrect Format
```yaml
---
layout: post
title: "Your Post Title"
date: 2024-07-23
categories: machine learning  # This creates separate categories "machine" and "learning"
excerpt: "Your excerpt here"
---
```

## Category Naming Conventions

- Use **kebab-case** for multi-word categories: `machine-learning`, `deep-learning`
- Use **single words** when possible: `research`, `music`, `tools`
- Be **specific** but not too granular
- Use **lowercase** letters

## Current Categories

- `machine-learning` - Machine learning topics
- `deep-learning` - Deep learning and neural networks
- `vae` - Variational Autoencoders
- `mnist` - MNIST dataset related
- `research` - Research projects and papers
- `music` - Music-related content
- `public-domain` - Public domain music and tools
- `tools` - Software tools and utilities

## Display

Categories are automatically displayed on the blog page with:
- Hyphens converted to spaces
- First letter capitalized
- Styled as tags

Example: `machine-learning` displays as "Machine Learning"
