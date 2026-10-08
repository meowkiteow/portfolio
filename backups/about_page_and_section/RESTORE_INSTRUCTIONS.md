# Vellisto About Page & Section Backup

This directory contains a complete backup of the **About** page, sections, templates, styles, and navigation links.

## 📦 Backed-up Files
1. **`about.html`**: The complete CMS data definition for the About page (`post_type: "page"`, `template: "about"`).
   - Contains all section blocks:
     - `hero` (Vellisto headline & label)
     - `photo` (Studio photography block)
     - `intro` ("Daring visual storytelling...")
     - `portraits` (Team & role gallery)
     - `approach` (How We Work split section)
     - `recognition` (Selected Awards)
     - `references` (Awwwards, FWA showcase)
     - `expertise` (Motion & video capabilities)
     - `mood` (Moodboard showcase)
2. **`_about.html`**: The SSR/API route file matching the route `/about`.
3. **`about-08459e14.css`**: The complete stylesheet for the About page layout, typography, responsive grids, and animations.
4. **`about-8fe9c5b3.js`**: The compiled Vue 3 template component for rendering the About page.
5. **`about_menu_items.json`**: The navigation menu structures for `main`, `footer`, and `sitemap` menus.

---

## ⚡ How to Restore

You can restore everything with a single command:
```bash
node backups/about_page_and_section/restore_about.js
```
Then restart the local server:
```bash
npm start
```
This will:
- Re-copy `about.html` and `_about.html` back to `wondermake.xyz/api/posts/`
- Re-inject the About navigation links into the header (`main`), footer (`footer`), and sitemap menus
- Re-enable the `/about` route seamlessly
