require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const zlib = require('zlib');
const { initDiscordCRM, sendLeadViaBot, handleInboundEmail } = require('./discord-crm');

const PORT = process.env.PORT || 3001;
const ROOT_DIR = path.join(__dirname, 'wondermake.xyz');
const UNPKG_DIR = path.join(__dirname, 'unpkg.com');
const FATHOM_DIR = path.join(__dirname, 'cdn.usefathom.com');

// Load index.html and extract $ssr data
const indexHtmlRaw = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');

// Ensure <base href="/"> exists for SPA client-side deep routing and sanitize domain
let indexHtml = indexHtmlRaw.replace(/https:\/\/wondermake\.xyz\//g, '/');
if (!indexHtml.includes('<base href="/">')) {
  indexHtml = indexHtml.replace('<head>', '<head><base href="/">');
}

// Extract SSR data from index.html
let ssrData = {};
try {
  const start = indexHtmlRaw.indexOf('window.$ssr');
  if (start !== -1) {
    let eq = indexHtmlRaw.indexOf("'", start);
    let end = indexHtmlRaw.lastIndexOf("';</script>");
    if (eq === -1 || end === -1) {
      eq = indexHtmlRaw.indexOf('"', start);
      end = indexHtmlRaw.lastIndexOf('";</script>');
    }
    if (eq !== -1 && end !== -1) {
      const ssrStr = indexHtmlRaw.substring(eq + 1, end);
      try {
        ssrData = JSON.parse(ssrStr);
      } catch (e1) {
        try {
          ssrData = JSON.parse(ssrStr.replace(/\\"/g, '"').replace(/\\\\/g, '\\'));
        } catch (e2) {
          console.error('Failed to parse SSR JSON:', e2.message);
        }
      }
      if (ssrData.options) {
        ssrData.options.site_title = 'Vellisto';
        ssrData.options.pwa_name = 'Vellisto';
        ssrData.options.footer_copy = 'All work © Vellisto 2025-2026. All rights reserved. <a href="/privacy">Privacy Policy</a> | <a href="/terms">Terms of Business</a>';
        ssrData.options.footer_company = 'Vellisto, Mumbai, India';
      }
      if (ssrData.menus) {
        const lowerMenu = [
          {
            link: {
              text: 'Discord',
              path: 'https://discord.gg/PQNbttaZm',
              id: false,
              external: true,
              post_type: false
            },
            locked: false,
            class: '',
            children: []
          },
          {
            link: {
              text: 'WhatsApp',
              path: 'https://wa.me/918679362637',
              id: false,
              external: true,
              post_type: false
            },
            locked: false,
            class: '',
            children: []
          }
        ];
        ssrData.menus.lower = lowerMenu;
        ssrData.menus.buttons = lowerMenu;
      }
      // FILTER_ABOUT_MENUS
      if (ssrData.menus) {
        for (const menuKey of ['main', 'footer', 'sitemap']) {
          if (Array.isArray(ssrData.menus[menuKey])) {
            ssrData.menus[menuKey] = ssrData.menus[menuKey].filter(item => {
              const p = item.link?.path || '';
              const t = (item.link?.text || '').toLowerCase();
              return p !== '/about' && !t.includes('about');
            });
          }
        }
      }
      console.log(`[SSR] Successfully loaded SSR metadata for "${ssrData.options?.site_title || 'Vellisto'}"`);
    }
  }
} catch (e) {
  console.error('Failed to parse SSR data:', e.message);
}

const ssrStartIdx = indexHtml.indexOf('window.$ssr = ');
let ssrEndIdx = indexHtml.lastIndexOf("';</script>");
if (ssrEndIdx === -1) {
  ssrEndIdx = indexHtml.lastIndexOf('";</script>');
}
let prefixHtml = indexHtml;
let suffixHtml = '';
if (ssrStartIdx !== -1 && ssrEndIdx !== -1) {
  prefixHtml = indexHtml.substring(0, ssrStartIdx);
  const scriptEnd = indexHtml.indexOf('</script>', ssrEndIdx);
  suffixHtml = indexHtml.substring(scriptEnd);
}


// Load API datasets
let apiProjects = { data: { posts: [] } };
try {
  apiProjects = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'api.html'), 'utf8'));
} catch (e) {
  console.error('Failed to load api.html:', e.message);
}

let apiJournalOther = { data: { posts: [] } };
try {
  apiJournalOther = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'api (5).html'), 'utf8'));
} catch (e) {
  console.error('Failed to load api (5).html:', e.message);
}

let apiJournalPinned = { data: { posts: [] } };
try {
  apiJournalPinned = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'api (6).html'), 'utf8'));
} catch (e) {
  console.error('Failed to load api (6).html:', e.message);
}

// Folder showcase media maps
const folderMediaMap = {};
const folderFileMap = {
  '216212588_664b536c57edd': 'api (1).html', // Branding
  '216212594_664b53721d2b7': 'api (2).html', // Web Design & Build
  '216212600_664b537836c36': 'api (3).html', // Product Design
  '216212605_664b537d6ff2d': 'api (4).html', // Design Support
};

let allMediaItems = [];
for (const [folderId, fileName] of Object.entries(folderFileMap)) {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, fileName), 'utf8'));
    if (raw && raw.data && raw.data.items) {
      folderMediaMap[folderId] = raw.data.items;
      allMediaItems.push(...raw.data.items);
    }
  } catch (e) {
    console.error(`Failed to load ${fileName}:`, e.message);
  }
}

// Pre-index posts by slug and path for fast lookup
const allPosts = [
  ...(apiProjects.data?.posts || []),
  ...(apiJournalOther.data?.posts || []),
  ...(apiJournalPinned.data?.posts || [])
];

function getPostForRoute(pathname) {
  let clean = (pathname || '').replace(/^\/+/, '').replace(/\/+$/, '');
  
  if (!clean || clean === '_' || clean === '__') {
    const homePost = JSON.parse(JSON.stringify(ssrData.post || {}));
    const vaultIds = [
      'insp-vault-01', 'insp-vault-02', 'insp-vault-03', 'insp-vault-04', 'insp-vault-05',
      'insp-vault-06', 'insp-vault-07', 'insp-vault-08', 'insp-vault-09', 'insp-vault-10'
    ];
    const shuffled = [...vaultIds].sort(() => 0.5 - Math.random());
    if (homePost.content && homePost.content.featured) {
      if (!homePost.content.featured.work) homePost.content.featured.work = { item: {} };
      if (!homePost.content.featured['work-1']) homePost.content.featured['work-1'] = { item: {} };
      if (!homePost.content.featured['work-2']) homePost.content.featured['work-2'] = { item: {} };
      homePost.content.featured.work.item = { field_type: 'select_post', value: shuffled[0] };
      homePost.content.featured['work-1'].item = { field_type: 'select_post', value: shuffled[1] };
      homePost.content.featured['work-2'].item = { field_type: 'select_post', value: shuffled[2] };
    }
    return homePost;
  }

  if (clean === 'search' || clean === '_search' || clean.includes('search')) {
    const workPath = path.join(ROOT_DIR, 'api', 'posts', '_work.html');
    if (fs.existsSync(workPath)) {
      try {
        const d = JSON.parse(fs.readFileSync(workPath, 'utf8'));
        return {
          ...(d.data || d),
          title: 'Search',
          permalink: { path: '/search', slug: 'search', base: '', parent: '', frontpage: false }
        };
      } catch (e) {}
    }
  }

  if (clean === 'ui' || clean === '_ui') {
    return getPostForRoute('/');
  }

  const cleanNoPrefix = clean.replace(/^_(work|journal|services)_/, '').replace(/^_/, '');
  const candidates = [
    path.join(ROOT_DIR, 'api', 'posts', clean + '.html'),
    path.join(ROOT_DIR, 'api', 'posts', '_' + clean.replace(/\//g, '_') + '.html'),
    path.join(ROOT_DIR, 'api', 'posts', clean.replace(/\//g, '_') + '.html'),
    path.join(ROOT_DIR, 'api', 'posts', '_' + cleanNoPrefix + '.html'),
    path.join(ROOT_DIR, 'api', 'posts', '_work_' + cleanNoPrefix + '.html'),
    path.join(ROOT_DIR, 'api', 'posts', '_journal_' + cleanNoPrefix + '.html'),
    path.join(ROOT_DIR, 'api', 'posts', '_services_' + cleanNoPrefix + '.html')
  ];

  for (const cPath of candidates) {
    if (fs.existsSync(cPath)) {
      try {
        const raw = JSON.parse(fs.readFileSync(cPath, 'utf8'));
        const post = raw.data || raw;
        if (!post.permalink) {
          post.permalink = { path: '/' + clean };
        }
        return post;
      } catch (e) {}
    }
  }

  const cleanSlug = cleanNoPrefix.split('/').pop();
  const matched = allPosts.find(p =>
    p.permalink?.slug === cleanSlug ||
    p.permalink?.path === '/' + clean ||
    p.permalink?.path === '/' + cleanNoPrefix ||
    p.permalink?.path?.endsWith('/' + cleanSlug) ||
    p.id === cleanSlug
  );

  if (matched) {
    const template = matched.template || (matched.permalink?.base === 'journal' || matched.permalink?.path?.includes('/journal') ? 'post' : 'project');
    return {
      ...matched,
      template,
      post_type: matched.post_type || (template === 'post' ? 'post' : 'project')
    };
  }

  // Not a real page in the website
  return null;
}

function serveSpaHtml(pathname, res) {
  try {
    const post = getPostForRoute(pathname);
    const is404 = !post;
    const finalPost = post || {
      id: 'error-404',
      title: 'Error 404',
      template: 'error',
      error: { message: 'Page not found', status: 404 },
      permalink: { path: pathname }
    };

    const routeSsr = {
      ...ssrData,
      post: finalPost
    };

    let html;
    if (prefixHtml && suffixHtml) {
      const ssrString = JSON.stringify(JSON.stringify(routeSsr));
      html = prefixHtml + 'window.$ssr = ' + ssrString + ';' + suffixHtml;
    } else {
      html = indexHtml;
    }

    const siteTitle = ssrData.options?.site_title || 'Vellisto';
    const pageTitle = finalPost.permalink?.frontpage ? siteTitle : `${finalPost.title} | ${siteTitle}`;
    html = html.replace(/<title>.*?<\/title>/, `<title>${pageTitle}</title>`);

    // Inject preload hints for critical assets to reduce first-load latency
    const preloadHints = [
      '<link rel="preload" href="/assets/index-c1064074.css" as="style">',
      '<link rel="preload" href="/assets/index-451442ce.js" as="script" crossorigin>',
    ].join('');
    html = html.replace('<link rel="stylesheet"', preloadHints + '<link rel="stylesheet"');

    res.writeHead(is404 ? 404 : 200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff'
    });
    res.end(html);

  } catch (err) {
    console.error('[SPA RENDER ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('500 Internal Server Error');
  }
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp4': 'video/mp4',
  '.riv': 'application/octet-stream',
  '.wasm': 'application/wasm'
};

// Determine cache policy by file path
function getCacheControl(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const base = path.basename(filePath);

  // Hashed Vite production bundles (e.g. index-451442ce.js, index-c1064074.css) are immutable
  if (/-[a-f0-9]{8}\.(js|css)$/.test(base)) {
    return 'public, max-age=31536000, immutable';
  }

  // HTML pages and dynamic API JSON - revalidate so routing stays fresh
  if (['.html', '.json'].includes(ext)) {
    return 'no-cache, must-revalidate';
  }

  // Videos, audio, Rive animations, images, and fonts - 7 days cache with stale-while-revalidate
  if (['.mp4', '.webm', '.riv', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.woff', '.woff2', '.ttf'].includes(ext)) {
    return 'public, max-age=604800, stale-while-revalidate=86400';
  }

  // General static assets
  return 'public, max-age=86400, stale-while-revalidate=86400';
}

const memoryGzipCache = new Map();

function serveGzipped(filePath, contentType, req, res) {
  const acceptEncoding = req.headers['accept-encoding'] || '';
  const supportsGzip = acceptEncoding.includes('gzip');
  try {
    const cacheControl = getCacheControl(filePath);
    const stat = fs.statSync(filePath);
    let cached = memoryGzipCache.get(filePath);
    if (!cached || cached.mtime !== stat.mtimeMs) {
      if (memoryGzipCache.size > 100) {
        memoryGzipCache.clear();
      }
      const content = fs.readFileSync(filePath);
      const compressed = zlib.gzipSync(content);
      cached = { content, compressed, mtime: stat.mtimeMs };
      memoryGzipCache.set(filePath, cached);
    }

    if (supportsGzip) {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Encoding': 'gzip',
        'Content-Length': cached.compressed.length,
        'Cache-Control': cacheControl,
        'Vary': 'Accept-Encoding'
      });
      return res.end(cached.compressed);
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': cached.content.length,
        'Cache-Control': cacheControl
      });
      return res.end(cached.content);
    }
  } catch (err) {
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error reading file: ' + err.message);
    }
  }
}

function serveFileWithRange(filePath, contentType, req, res) {
  const ext = path.extname(filePath).toLowerCase();
  // Use gzip for compressible text assets
  if (['.js', '.css', '.json', '.svg', '.html', '.webmanifest'].includes(ext)) {
    return serveGzipped(filePath, contentType, req, res);
  }
  try {
    const stat = fs.statSync(filePath);
    const total = stat.size;
    const range = req.headers.range;
    const cacheControl = getCacheControl(filePath);

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const isVideo = ['.mp4', '.webm'].includes(ext);
      // Bound chunk size to 2MB for open-ended range requests to avoid high memory spikes
      const MAX_CHUNK = 2 * 1024 * 1024;
      let requestedEnd = parts[1] ? parseInt(parts[1], 10) : total - 1;
      let end = (parts[1] || !isVideo) ? requestedEnd : Math.min(start + MAX_CHUNK - 1, total - 1);

      if (start >= total || end >= total || start > end) {
        res.writeHead(416, { 'Content-Range': `bytes */${total}` });
        return res.end();
      }

      const chunkSize = (end - start) + 1;
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${total}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType,
        'Cache-Control': cacheControl
      });
      const stream = fs.createReadStream(filePath, { start, end });
      stream.on('error', () => { try { res.end(); } catch (e) {} });
      req.on('close', () => { stream.destroy(); });
      stream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': total,
        'Accept-Ranges': 'bytes',
        'Content-Type': contentType,
        'Cache-Control': cacheControl
      });
      const stream = fs.createReadStream(filePath);
      stream.on('error', () => { try { res.end(); } catch (e) {} });
      req.on('close', () => { stream.destroy(); });
      stream.pipe(res);
    }
  } catch (err) {
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error reading file: ' + err.message);
    }
  }
}

function sendJson(res, data, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, hextail-cms'
  });
  res.end(JSON.stringify(data));
}

// Lead capture configuration
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || '';
const SUBMISSIONS_FILE = path.join(__dirname, 'submissions.json');

async function handleLeadSubmission(action, data) {
  const timestamp = new Date().toISOString();
  const id = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const entry = {
    id,
    timestamp,
    action,
    data
  };

  // 1. Local disk backup (submissions.json)
  try {
    let existing = [];
    if (fs.existsSync(SUBMISSIONS_FILE)) {
      try {
        existing = JSON.parse(fs.readFileSync(SUBMISSIONS_FILE, 'utf8'));
      } catch (e) {
        existing = [];
      }
    }
    existing.push(entry);
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(existing, null, 2), 'utf8');
    console.log(`[LEAD SAVED] Saved submission ${id} to submissions.json (${data.name || data.email || 'Anonymous'})`);
  } catch (err) {
    console.error('[LEAD SAVE ERROR] Failed to write local submission backup:', err.message);
  }

  // 2. Try Discord Interactive Bot (with [✉️ Reply to Lead] button)
  let botSent = false;
  try {
    botSent = await sendLeadViaBot(entry);
  } catch (botErr) {
    console.error('[DISCORD BOT ERROR] Failed to send via bot:', botErr.message);
  }

  // 3. Fallback to Discord Webhook if bot is not active
  if (!botSent && DISCORD_WEBHOOK_URL) {
    try {
      const isEnquiry = action === 'enquiry-form';
      const title = isEnquiry ? '🚀 New Project Enquiry' : '💬 New General Contact Message';
      const color = 16768561; // #FFDE31 signature yellow

      const fields = [
        { name: '👤 Name', value: data.name || 'Not provided', inline: true },
        { name: '✉️ Email', value: data.email || 'Not provided', inline: true }
      ];

      if (data.company) {
        fields.push({ name: '🏢 Company', value: data.company, inline: true });
      }

      if (data.project) {
        const services = Array.isArray(data.project) ? data.project.join(', ') : data.project;
        fields.push({ name: '🎨 Services Requested', value: services || 'None selected', inline: false });
      }

      if (data.budget) {
        fields.push({ name: '💰 Budget', value: data.budget, inline: true });
      }

      if (data.timeline) {
        fields.push({ name: '⏳ Timeline', value: data.timeline, inline: true });
      }

      if (data.origin) {
        fields.push({ name: '📍 Source Page', value: data.origin, inline: true });
      }

      if (data.message) {
        fields.push({ name: '📝 Message / Details', value: data.message, inline: false });
      }

      const payload = {
        username: 'Vellisto Studio Leads',
        avatar_url: 'https://wondermake.xyz/thumbs/wm-favicon-80308_favicon-192.png',
        embeds: [
          {
            title,
            color,
            description: `New lead received from **${data.name || 'A visitor'}** on **${data.origin || 'Vellisto Website'}**.`,
            fields,
            footer: {
              text: 'Vellisto Lead Capture'
            },
            timestamp
          }
        ]
      };

      const resp = await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (resp.ok || resp.status === 204) {
        console.log(`[DISCORD] Successfully sent lead notification to Discord for ${data.name || data.email}`);
      } else {
        const text = await resp.text();
        console.error(`[DISCORD ERROR] Discord returned ${resp.status}:`, text);
      }
    } catch (err) {
      console.error('[DISCORD ERROR] Failed to send webhook:', err.message);
    }
  }
}

process.on('uncaughtException', (err) => {
  console.error('[SERVER ERROR] Uncaught exception:', err.message, err.stack);
});
process.on('unhandledRejection', (reason) => {
  console.error('[SERVER ERROR] Unhandled rejection:', reason);
});

let appJsCache = null;

function getPreparedAppJs(filePath) {
  const stat = fs.statSync(filePath);
  if (appJsCache && appJsCache.mtime === stat.mtimeMs) {
    return appJsCache;
  }
  let jsContent = fs.readFileSync(filePath, 'utf8');
  jsContent = jsContent.replace(/https:\/\/unpkg\.com\//g, '/unpkg.com/');
  jsContent = jsContent.replace(/https:\/\/cdn\.jsdelivr\.net\/npm\//g, '/unpkg.com/');
  jsContent = jsContent.replace(/https:\/\/cdn\.usefathom\.com\//g, '/cdn.usefathom.com/');
  jsContent = jsContent.replace(/https:\/\/wondermake\.xyz\//g, '/');
  const compressed = zlib.gzipSync(Buffer.from(jsContent, 'utf8'));
  appJsCache = {
    mtime: stat.mtimeMs,
    content: jsContent,
    compressed: compressed
  };
  return appJsCache;
}

const server = http.createServer((req, res) => {
  try {
    const parsedUrl = url.parse(req.url, true);
    let pathname = parsedUrl.pathname || '/';
    try {
      pathname = decodeURIComponent(pathname);
    } catch (e) {
      // Keep raw if invalid URI sequence
    }

    // CORS preflight
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, hextail-cms'
      });
      return res.end();
    }

    // Rewrite /assets/, /thumbs/, /uploads/ if prefixed by route subpaths
    if (pathname.includes('/assets/')) {
      pathname = '/assets/' + pathname.split('/assets/')[1];
    } else if (pathname.includes('/thumbs/')) {
    pathname = '/thumbs/' + pathname.split('/thumbs/')[1];
  } else if (pathname.includes('/uploads/')) {
    pathname = '/uploads/' + pathname.split('/uploads/')[1];
  }

  // Fathom analytics beacons - respond with 204 No Content
  if (parsedUrl.query && (parsedUrl.query.cid || parsedUrl.query.sid)) {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*' });
    return res.end();
  }

  // Lightweight Health & Keep-Alive Ping (used by UptimeRobot / Cron-Job / Monitoring)
  if ((pathname === '/api/health' || pathname === '/health' || pathname === '/ping') && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*'
    });
    return res.end(JSON.stringify({ status: 'ok', uptime: Math.floor(process.uptime()), timestamp: Date.now() }));
  }

  // Redirect legacy /hosting route to /terms
  if (pathname === '/hosting' || pathname === '/hosting/') {
    res.writeHead(301, { 'Location': '/terms' });
    return res.end();
  }

  // Redirect disconnected /ui route to /
  if (pathname === '/ui' || pathname === '/ui/') {
    res.writeHead(301, { 'Location': '/' });
    return res.end();
  }

  // 1. API: /api/menus
  if (pathname === '/api/menus' && req.method === 'GET') {
    return sendJson(res, { data: ssrData.menus || {} });
  }

  // 2. API: /api/options
  if (pathname === '/api/options' && req.method === 'GET') {
    return sendJson(res, { data: ssrData.options || {} });
  }

  // 3. API: /api/posts/_ (Home)
  if ((pathname === '/api/posts/_' || pathname === '/api/posts/__') && req.method === 'GET') {
    return sendJson(res, { data: getPostForRoute('/') });
  }

  // 4. API: /api/posts/:slug
  if (pathname.startsWith('/api/posts/')) {
    const slug = pathname.replace('/api/posts/', '').replace(/\/+$/, '');
    if (slug === '_ui' || slug === 'ui') {
      return sendJson(res, { data: getPostForRoute('/') });
    }
    const post = getPostForRoute(slug);
    if (!post) {
      return sendJson(res, {
        data: {
          id: 'error-404',
          title: 'Error 404',
          template: 'error',
          error: { message: 'Page not found', status: 404 },
          permalink: { path: '/' + slug.replace(/^_/, '').replace(/_/g, '/') }
        }
      });
    }
    return sendJson(res, { data: post });
  }

  // 5. API: /api/media-stream/:file/
  if (pathname.startsWith('/api/media-stream/')) {
    const cleanMedia = pathname.replace('/api/media-stream/', '').replace(/\/+$/, '');
    const mediaIndexPath = path.join(ROOT_DIR, 'api', 'media-stream', cleanMedia, 'index.html');

    if (fs.existsSync(mediaIndexPath)) {
      const stat = fs.statSync(mediaIndexPath);
      if (stat.size > 200) {
        return serveFileWithRange(mediaIndexPath, 'video/mp4', req, res);
      }
    }

    const uploadsPath = path.join(ROOT_DIR, 'uploads', cleanMedia);
    if (fs.existsSync(uploadsPath) && fs.statSync(uploadsPath).isFile()) {
      return serveFileWithRange(uploadsPath, 'video/mp4', req, res);
    }

    res.writeHead(204, { 'Access-Control-Allow-Origin': '*' });
    return res.end();
  }

  // 6. API: POST /api
  if ((pathname === '/api' || pathname === '/api/') && req.method === 'POST') {
    let bodyData = '';
    req.on('data', chunk => { bodyData += chunk; });
    req.on('end', () => {
      try {
        const payload = bodyData ? JSON.parse(bodyData) : {};
        const { action, data = {} } = payload;

        if (action === 'load-media') {
          const requestedFolders = Array.isArray(data.folders) ? data.folders : [data.folders].filter(Boolean);
          let items = [];
          if (requestedFolders.length === 0) {
            items = allMediaItems;
          } else {
            for (const fId of requestedFolders) {
              if (folderMediaMap[fId]) {
                items.push(...folderMediaMap[fId]);
              }
            }
            if (items.length === 0) {
              items = allMediaItems;
            }
          }
          return sendJson(res, {
            data: {
              items,
              total: items.length,
              end: true
            }
          });
        }

        if (action === 'query') {
          const postType = Array.isArray(data.post_type) ? data.post_type : [data.post_type];
          if (postType.includes('project')) {
            try {
              apiProjects = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'api.html'), 'utf8'));
            } catch (e) {}

            const posts = (apiProjects.data?.posts || apiProjects.posts || []).map(p => {
              const cd = p['content.details'] || p.content?.details || {};
              const proj = cd.project || {};
              const alias = (proj.alias && proj.alias.value) || cd.alias || p.title || 'Project';
              let categories = (proj.categories && proj.categories.value) || cd.categories || [];
              if (!Array.isArray(categories)) categories = [categories].filter(Boolean);

              const cleanProject = {
                ...proj,
                alias: { field_type: 'text_small', value: alias },
                categories: { field_type: 'select', value: categories }
              };
              const cleanDetails = { project: cleanProject };

              return {
                ...p,
                title: typeof alias === 'string' ? alias : 'Project',
                'content.details': cleanDetails
              };
            });
            if (data.filter && data.filter.key === 'id') {
              const targetVal = typeof data.filter.value === 'object' && data.filter.value !== null
                ? (data.filter.value.value || data.filter.value.id || data.filter.value)
                : data.filter.value;
              if (targetVal) {
                const match = posts.find(p => p.id === targetVal || p.permalink?.slug === targetVal);
                if (match) {
                  return sendJson(res, { posts: [match], data: { posts: [match] } });
                }
              }
            }
            return sendJson(res, { ...apiProjects, posts, data: { ...apiProjects.data, posts } });
          }
          if (postType.includes('post')) {
            if (data.filter && data.filter.compare === '=') {
              return sendJson(res, apiJournalPinned);
            }
            return sendJson(res, apiJournalOther);
          }
          try {
            apiProjects = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'api.html'), 'utf8'));
          } catch (e) {}
          return sendJson(res, apiProjects);
        }

        if (action === 'enquiry-form' || action === 'general-form') {
          handleLeadSubmission(action, data).catch(e => console.error('[LEAD HANDLER ERROR]', e));
          return sendJson(res, { success: true, message: 'Form submitted successfully!' });
        }

        return sendJson(res, { data: {} });
      } catch (err) {
        return sendJson(res, { error: 'Invalid JSON payload: ' + err.message }, 400);
      }
    });
    return;
  }

  // 6.5 Webhook: POST /api/webhooks/resend (Inbound email sync)
  if (pathname === '/api/webhooks/resend' && req.method === 'POST') {
    let bodyData = '';
    req.on('data', chunk => { bodyData += chunk; });
    req.on('end', async () => {
      try {
        const payload = bodyData ? JSON.parse(bodyData) : {};
        console.log('[RESEND WEBHOOK] Received event:', payload.type || 'inbound');
        const emailData = payload.data || payload;
        await handleInboundEmail(emailData);
        return sendJson(res, { success: true });
      } catch (err) {
        console.error('[RESEND WEBHOOK ERROR]', err.message);
        return sendJson(res, { error: err.message }, 400);
      }
    });
    return;
  }

  // 7. GET /unpkg.com/*
  if (pathname.startsWith('/unpkg.com/')) {
    const relPath = pathname.replace('/unpkg.com/', '');
    const localPath = path.join(UNPKG_DIR, relPath);
    if (fs.existsSync(localPath) && fs.statSync(localPath).isFile()) {
      const ext = path.extname(localPath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      return serveFileWithRange(localPath, contentType, req, res);
    }
  }

  // 8. GET /cdn.usefathom.com/*
  if (pathname.startsWith('/cdn.usefathom.com/')) {
    const relPath = pathname.replace('/cdn.usefathom.com/', '');
    const localPath = path.join(FATHOM_DIR, relPath);
    if (fs.existsSync(localPath) && fs.statSync(localPath).isFile()) {
      const ext = path.extname(localPath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/javascript';
      return serveFileWithRange(localPath, contentType, req, res);
    }
  }

  // 9. Static files from wondermake.xyz
  let localFilePath = path.join(ROOT_DIR, pathname.replace(/^\/+/, ''));

  // Fallback for media files requested under /uploads/
  if (pathname.startsWith('/uploads/') && !fs.existsSync(localFilePath)) {
    const fileName = path.basename(pathname);
    const mediaStreamPath = path.join(ROOT_DIR, 'api', 'media-stream', fileName, 'index.html');
    if (fs.existsSync(mediaStreamPath) && fs.statSync(mediaStreamPath).size > 200) {
      localFilePath = mediaStreamPath;
    }
  }

  if (fs.existsSync(localFilePath) && fs.statSync(localFilePath).isFile()) {
    const ext = path.extname(localFilePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Intercept main app JS to route unpkg & fathom locally with high-performance memoization
    if (path.basename(localFilePath).startsWith('index-') && ext === '.js') {
      try {
        const prepared = getPreparedAppJs(localFilePath);
        const cacheControl = getCacheControl(localFilePath);
        const acceptEncoding = req.headers['accept-encoding'] || '';
        if (acceptEncoding.includes('gzip')) {
          res.writeHead(200, {
            'Content-Type': 'application/javascript; charset=utf-8',
            'Content-Encoding': 'gzip',
            'Content-Length': prepared.compressed.length,
            'Cache-Control': cacheControl,
            'Vary': 'Accept-Encoding'
          });
          return res.end(prepared.compressed);
        } else {
          res.writeHead(200, {
            'Content-Type': 'application/javascript; charset=utf-8',
            'Content-Length': Buffer.byteLength(prepared.content, 'utf8'),
            'Cache-Control': cacheControl
          });
          return res.end(prepared.content);
        }
      } catch (e) {
        // Fallback to normal stream
      }
    }

    return serveFileWithRange(localFilePath, contentType, req, res);
  }

  // 10. SPA fallback: serve dynamic SSR index.html for all page routes
  return serveSpaHtml(pathname, res);
  } catch (err) {
    console.error('[REQUEST ERROR]', err);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Server internal error: ' + err.message);
    }
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`  Vellisto Studio local server is live!`);
  console.log(`  Local URL:    http://localhost:${PORT}`);
  console.log(`  Network URL:  http://127.0.0.1:${PORT}`);
  console.log(`=======================================================`);
  
  // Initialize Discord Bot & CRM
  initDiscordCRM();
});
