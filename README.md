# Egor Polyakov - Personal Website

This is the source code for my personal academic website hosted on GitHub Pages. The site showcases my work as a musicologist, composer, and researcher specializing in computational musicology.

## 🎵 About

I am a Ukrainian-born composer and researcher specializing in the application of computational methods to musicology. My work focuses on human-computer interaction in music, from performance and composition to advanced computational analysis.

## 🏗️ Site Structure

```
egorpol.github.io/
├── _layouts/          # Jekyll layout templates
├── _plugins/          # Custom plugins (currently empty)
├── _posts/           # Blog posts (Markdown)
├── assets/           # Static assets
│   ├── css/         # Stylesheets
│   ├── js/          # JavaScript files
│   └── images/      # Images
├── _site/            # Built site output (do not edit; generated)
├── _config.yml      # Jekyll configuration
├── index.md         # Homepage
├── blog.md          # Blog listing page
├── sitemap.xml      # XML sitemap
├── robots.txt       # Search engine directives
└── README.md        # This file
```

## 🚀 Features

- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Dark/Light Theme**: Persistent toggle with saved preference (light by default)
- **Interactive Image Viewer**: Click any image to view in full-screen with navigation
- **Accessibility**: WCAG compliant with skip links, focus indicators, and semantic HTML
- **SEO Optimized**: jekyll-seo-tag, JSON‑LD structured data (via page front matter), sitemap, and robots.txt
- **Blog System**: Jekyll-powered blog with categories and excerpts
- **Code Highlighting**: Syntax highlighting for code blocks
- **Print Styles**: Optimized for printing
 - **Rel=me Links**: Social verification links emitted from `_config.yml` social links

## 🛠️ Technology Stack

- **GitHub Pages (github-pages gem)**: Production runtime that pins Jekyll and plugins
- **Jekyll**: Static site generator (version pinned by GitHub Pages)
- **CSS3**: Custom styling with CSS variables for theming
- **JavaScript**: Vanilla JS for theme switching and interactions
- **Font Awesome**: Icons
- **Highlight.js**: Code syntax highlighting
 - **jekyll-seo-tag**: Open Graph/Twitter meta and SEO helpers

## 📦 Dependencies

### Jekyll Plugins
- `jekyll-feed`: RSS/Atom feed generation
- `jekyll-seo-tag`: SEO optimization
- `jekyll-paginate`: Blog pagination (optional; currently disabled)

### External Libraries
- Font Awesome 6.4.0 (CDN)
- Highlight.js 11.9.0 (CDN)

### Custom JavaScript
- `theme.js`: Theme switching functionality
- `image-viewer.js`: Interactive image viewer with navigation

## 🏃‍♂️ Local Development

### Prerequisites
- Ruby 2.7+ (matches GitHub Pages runtime)
- Bundler gem

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/egorpol/egorpol.github.io.git
   cd egorpol.github.io
   ```

2. Install dependencies:
   ```bash
   bundle install
   ```

3. Start the development server:
   ```bash
   bundle exec jekyll serve
   ```

4. Open your browser and navigate to `http://localhost:4000`

### Build for Production
```bash
bundle exec jekyll build
```

The built site is output to `_site/`. Do not edit files in that directory manually.

## 📝 Content Management

### Adding Blog Posts
1. Create a new Markdown file in `_posts/` directory
2. Use the following front matter format:
   ```yaml
   ---
   layout: post
   title: "Your Post Title"
   date: YYYY-MM-DD
   categories: [category1, category2]
   excerpt: "Brief description of the post"
   ---
   ```

**Important**: Categories must be defined as YAML arrays (with square brackets). See `CATEGORIES.md` for detailed guidelines.

### Updating Site Information
- Edit `_config.yml` for site-wide settings
- Modify `index.md` for homepage content
- Update `assets/css/main.css` for styling changes
 - Navigation and contact anchor are defined in `_layouts/default.html` (Contact links to `{{ '/' | relative_url }}#contact`)
 - Per‑page JSON‑LD can be added under `structured_data:` (and optional `local_business_schema:`) in front matter

## 🎨 Customization

### Themes
The site uses CSS custom properties for theming. Colors are defined in `assets/css/main.css`:

```css
:root {
    --bg-color: #ffffff;
    --text-color: #333333;
    --primary-color: #0066cc;
    /* ... more variables */
}
```

### Layouts
- `default.html`: Standard page layout
- `custom.html`: Enhanced layout with additional navigation
- `post.html`: Blog post layout
- `page.html`: Simple page layout

## 🔧 Configuration

Key settings in `_config.yml`:
- Site title, description, and author
- GitHub username for social links
- Jekyll plugins and settings
- SEO and analytics configuration (GA4 placeholders: `google_analytics` and `gtag`)
- Markdown engine (`kramdown`) and syntax highlighter (`rouge`)
- `social.name` and `social.links` (used for rel=me links in the layout)

## 📊 Performance

The site is optimized for performance with:
- Minimal external dependencies
- Optimized images
- Efficient CSS and JavaScript
- CDN-hosted libraries
- Static generation for fast loading

## 🔒 Security

- No client-side data collection by default
- HTTPS enforced by GitHub Pages
- Analytics are disabled unless GA4 IDs are provided
- Secure external dependencies

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

While this is a personal website, suggestions and improvements are welcome. Please feel free to open issues or submit pull requests.

## 📞 Contact

- **Email**: egor.polyakov@hfm-weimar.de
- **GitHub**: [@egorpol](https://github.com/egorpol)
- **Website**: [egorpol.github.io](https://egorpol.github.io)

---

*Last updated: October 20, 2025*
