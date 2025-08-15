# Changelog

## [2025-08-15] - Navigation, SEO, and Layout Standardization

### ✨ Added
- Injected `{% seo %}` and `{% feed_meta %}` into `default.html` and `custom.html`.

### 🎨 Improved
- Reworked header title to a linked `.site-title` and added corresponding CSS.
- Modernized code highlighting initialization (`hljs.highlightAll`) and deferred script loading.
- Navigation now auto-lists `page` layout entries and excludes the Blog page via `menu: exclude`.
- Standardized blog usage to `layout: post`; adjusted README example accordingly.
- Demoted post-level H1 in `2023-07-03-blog1.md` to avoid duplicate H1s.
- `blog.md` now has `permalink: /blog/`.

### 🔧 Fixed
- Removed unused pagination settings from `_config.yml` (left commented for future use).

## [2025-08-15] - Major Site Refactoring

### ✨ Added
- **Interactive Image Viewer**: Click any image to view in full-screen with navigation
  - Keyboard shortcuts (arrow keys, Escape)
  - Navigation between images on the same page
  - Image counter and close button
  - Hover effects with magnifying glass icon
- **Enhanced Theme Toggle**: Visible sun/moon icons that change with theme
- **SEO Optimization**: 
  - Comprehensive meta tags (Open Graph, Twitter Cards)
  - Structured data (JSON-LD) for better search visibility
  - XML sitemap for search engines
  - robots.txt file
- **Accessibility Improvements**:
  - Skip links for keyboard navigation
  - Enhanced focus indicators
  - Semantic HTML elements
  - Reduced motion support
- **Blog System Enhancements**:
  - Proper category/tag system with YAML arrays
  - Improved blog post layout with better typography
  - Category tags display
  - Enhanced post metadata
- **Documentation**:
  - Comprehensive README.md
  - Categories usage guide (CATEGORIES.md)
  - Changelog (this file)

### 🔧 Fixed
- **Theme Toggle Button**: Now displays proper sun/moon icons
- **Categories System**: Fixed parsing of multi-word categories
- **Image Viewer**: All images now properly clickable including VAE architecture image
- **Layout Issues**: Removed duplicate CSS links and fixed navigation
- **File Management**: Enhanced .gitignore and cleaned up empty files

### 🎨 Improved
- **Visual Design**: Better theme toggle styling and hover effects
- **Blog Layout**: Enhanced post cards with hover effects and better spacing
- **Code Organization**: Better structured CSS and JavaScript
- **Performance**: Optimized image loading and theme switching
- **Print Styles**: Optimized for printing

### 📚 Documentation
- **README.md**: Complete setup and usage guide
- **CATEGORIES.md**: Guidelines for proper category usage
- **CHANGELOG.md**: This changelog documenting all changes

### 🗑️ Removed
- Debug test pages and temporary files
- Console logging statements
- Temporary debug styling
- Empty/unused files

---

## Technical Details

### Files Added
- `assets/js/image-viewer.js` - Interactive image viewer functionality
- `sitemap.xml` - XML sitemap for search engines
- `robots.txt` - Search engine directives
- `CATEGORIES.md` - Category usage guidelines
- `CHANGELOG.md` - This changelog

### Files Modified
- `_config.yml` - Enhanced SEO and plugin configuration
- `assets/css/main.css` - Accessibility and theme improvements
- `assets/js/theme.js` - Fixed theme toggle functionality
- `_layouts/default.html` & `_layouts/custom.html` - SEO and accessibility improvements
- `blog.md` - Enhanced blog layout and category display
- `_posts/*.md` - Fixed category definitions
- `README.md` - Comprehensive documentation
- `.gitignore` - Enhanced file exclusion patterns

### Files Removed
- `assets/js/syntax-highlight.js` - Empty file
- `debug-test.md` - Debug page
- `test-images.md` - Test page
