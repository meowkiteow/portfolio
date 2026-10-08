/**
 * Automated Restore Script for Vellisto About Page & Sections
 * 
 * To restore the About page at any time in the future, simply run:
 *   node backups/about_page_and_section/restore_about.js
 */

const fs = require('fs');
const path = require('path');

const BACKUP_DIR = __dirname;
const PROJECT_DIR = path.join(__dirname, '..', '..');
const POSTS_DIR = path.join(PROJECT_DIR, 'wondermake.xyz', 'api', 'posts');
const ASSETS_DIR = path.join(PROJECT_DIR, 'wondermake.xyz', 'assets');
const INDEX_HTML_PATH = path.join(PROJECT_DIR, 'wondermake.xyz', 'index.html');
const UI_HTML_PATH = path.join(PROJECT_DIR, 'wondermake.xyz', 'ui.html');
const SERVER_JS_PATH = path.join(PROJECT_DIR, 'server.js');

console.log('--- Restoring About Page and Sections ---');

// 1. Restore post files
fs.copyFileSync(path.join(BACKUP_DIR, 'about.html'), path.join(POSTS_DIR, 'about.html'));
fs.copyFileSync(path.join(BACKUP_DIR, '_about.html'), path.join(POSTS_DIR, '_about.html'));
console.log('✅ Restored about.html and _about.html into api/posts/');

// 2. Ensure assets exist
if (fs.existsSync(path.join(BACKUP_DIR, 'about-08459e14.css')) && !fs.existsSync(path.join(ASSETS_DIR, 'about-08459e14.css'))) {
  fs.copyFileSync(path.join(BACKUP_DIR, 'about-08459e14.css'), path.join(ASSETS_DIR, 'about-08459e14.css'));
  console.log('✅ Restored about-08459e14.css');
}
if (fs.existsSync(path.join(BACKUP_DIR, 'about-8fe9c5b3.js')) && !fs.existsSync(path.join(ASSETS_DIR, 'about-8fe9c5b3.js'))) {
  fs.copyFileSync(path.join(BACKUP_DIR, 'about-8fe9c5b3.js'), path.join(ASSETS_DIR, 'about-8fe9c5b3.js'));
  console.log('✅ Restored about-8fe9c5b3.js');
}

// 3. Restore menu items in index.html SSR
try {
  let indexHtml = fs.readFileSync(INDEX_HTML_PATH, 'utf8');
  const menuItems = JSON.parse(fs.readFileSync(path.join(BACKUP_DIR, 'about_menu_items.json'), 'utf8'));

  const start = indexHtml.indexOf('window.$ssr');
  let eq = indexHtml.indexOf("'", start);
  let end = indexHtml.lastIndexOf("';</script>");
  if (eq === -1 || end === -1) {
    eq = indexHtml.indexOf('"', start);
    end = indexHtml.lastIndexOf('";</script>');
  }

  const ssrStr = indexHtml.substring(eq + 1, end);
  let d = JSON.parse(ssrStr.replace(/\\"/g, '"').replace(/\\\\/g, '\\'));

  if (d.menus) {
    if (d.menus.main && !d.menus.main.some(m => m.link?.path === '/about')) {
      d.menus.main.splice(1, 0, menuItems.main[0] || {
        link: { text: "About", path: "/about", id: false, external: false, post_type: "page" },
        locked: false, class: "", children: []
      });
    }
    if (d.menus.footer && !d.menus.footer.some(m => m.link?.path === '/about')) {
      d.menus.footer.splice(2, 0, menuItems.footer[0] || {
        link: { text: "About", path: "/about", id: false, external: false, post_type: "page" },
        locked: false, class: "", children: []
      });
    }
    if (d.menus.sitemap && !d.menus.sitemap.some(m => m.link?.path === '/about')) {
      d.menus.sitemap.splice(1, 0, menuItems.sitemap[0] || {
        link: { text: "About us", path: "/about", id: "214566646_663235f6acc66", external: false, post_type: "page" },
        locked: false, class: "", children: []
      });
    }
  }

  const newSsrStr = JSON.stringify(d).replace(/"/g, '\\"');
  indexHtml = indexHtml.substring(0, eq + 1) + newSsrStr + indexHtml.substring(end);
  
  // Also restore static HTML header/footer links if needed
  if (!indexHtml.includes('href="/about">About</a>') && !indexHtml.includes('href="about">About</a>')) {
    indexHtml = indexHtml.replace('<li><a href="work">Work</a></li>', '<li><a href="work">Work</a></li><li><a href="about">About</a></li>');
    indexHtml = indexHtml.replace('<li><a href="work">Our work</a></li>', '<li><a href="work">Our work</a></li><li><a href="about">About us</a></li>');
  }

  fs.writeFileSync(INDEX_HTML_PATH, indexHtml, 'utf8');
  console.log('✅ Restored About menu links in index.html');
} catch (e) {
  console.error('Error updating index.html:', e.message);
}

// 4. Update server.js if needed
try {
  let serverJs = fs.readFileSync(SERVER_JS_PATH, 'utf8');
  // If server had blocked /about, unblock it
  serverJs = serverJs.replace(/\/\/ BLOCK_ABOUT_START[\s\S]*?\/\/ BLOCK_ABOUT_END\n/g, '');
  fs.writeFileSync(SERVER_JS_PATH, serverJs, 'utf8');
  console.log('✅ Server configuration updated');
} catch (e) {
  console.error('Error updating server.js:', e.message);
}

console.log('🎉 About page successfully restored! Restart server or refresh browser.');
