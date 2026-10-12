const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const BASE_DIR = 'C:\\Users\\krish\\Desktop\\myportfolio';
const SITE_DIR = path.join(BASE_DIR, 'editorartem.com');
const INQUIRIES_FILE = path.join(BASE_DIR, 'inquiries.json');

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || (fs.existsSync(path.join(BASE_DIR, '.env')) ? (fs.readFileSync(path.join(BASE_DIR, '.env'), 'utf8').match(/DISCORD_BOT_TOKEN=([^\r\n]+)/) || [])[1] : '');
const DISCORD_LEADS_CHANNEL_ID = process.env.DISCORD_LEADS_CHANNEL_ID || (fs.existsSync(path.join(BASE_DIR, '.env')) ? (fs.readFileSync(path.join(BASE_DIR, '.env'), 'utf8').match(/DISCORD_LEADS_CHANNEL_ID=([^\r\n]+)/) || [])[1] : '');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
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
  '.otf': 'font/otf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.txt': 'text/plain; charset=utf-8'
};

function serveFile(req, res, filePath) {
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('404 Not Found');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Video Streaming with HTTP Range Requests
    if (ext === '.mp4' || ext === '.webm') {
      const range = req.headers.range;
      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(filePath, { start, end });
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${stats.size}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': contentType
        });
        file.pipe(res);
        return;
      }
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': 'no-cache'
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

function sendDiscordLeadNotification(lead) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      embeds: [{
        title: '🎯 New Client Lead Received!',
        description: `A new inquiry was submitted on **Editor Krishna Portfolio**.`,
        color: 0xF59E0B, // Amber / Gold
        fields: [
          { name: '👤 Client Name', value: lead.name || 'Not provided', inline: true },
          { name: '📧 Email Address', value: lead.email || 'Not provided', inline: true },
          { name: '💰 Budget Per Video', value: lead.budget || 'Not specified', inline: true },
          { name: '📝 Project Details', value: lead.message || lead.details || 'No details provided', inline: false }
        ],
        footer: {
          text: `Editor Krishna Studio • ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })} IST`
        },
        timestamp: new Date().toISOString()
      }]
    });

    const req = https.request({
      hostname: 'discord.com',
      path: `/api/v10/channels/${DISCORD_LEADS_CHANNEL_ID}/messages`,
      method: 'POST',
      headers: {
        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`[Discord Notification] Status: ${res.statusCode}`);
        resolve(res.statusCode === 200);
      });
    });

    req.on('error', (err) => {
      console.error('[Discord Notification Error]', err.message);
      resolve(false);
    });

    req.write(payload);
    req.end();
  });
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const contentType = req.headers['content-type'] || '';
      if (contentType.includes('application/json')) {
        try {
          return resolve(JSON.parse(body));
        } catch {
          return resolve({});
        }
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        const params = new URLSearchParams(body);
        const obj = {};
        for (const [k, v] of params.entries()) {
          obj[k] = v;
        }
        return resolve(obj);
      } else {
        // Fallback or multipart basic extraction
        const result = {};
        const matches = body.matchAll(/name="([^"]+)"[\r\n]+(?:\r\n)?([^\r\n-]+)/g);
        for (const m of matches) {
          result[m[1]] = m[2].trim();
        }
        if (Object.keys(result).length > 0) return resolve(result);

        // Try urlencoded fallback
        try {
          const p = new URLSearchParams(body);
          const o = {};
          for (const [k, v] of p.entries()) o[k] = v;
          if (Object.keys(o).length > 0) return resolve(o);
        } catch {}

        resolve({ raw: body });
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Security check
  if (pathname.includes('..')) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('Forbidden');
  }

  // Handle Inquiry POST Route (/api/inquiry and Netlify fallback /__forms.html)
  if (req.method === 'POST' && (pathname === '/api/inquiry' || pathname === '/__forms.html')) {
    try {
      const data = await parseBody(req);
      const lead = {
        id: 'lead_' + Date.now(),
        name: data.Name || data.name || '',
        email: data.email || data.Email || '',
        budget: data['Budget per video'] || data.budget || data.Budget || '',
        message: data.Message || data.message || data.details || data.Details || '',
        submittedAt: new Date().toISOString(),
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
      };

      console.log('📬 [NEW LEAD RECEIVED]:', lead);

      // 1. Save to local JSON database
      let inquiries = [];
      try {
        if (fs.existsSync(INQUIRIES_FILE)) {
          inquiries = JSON.parse(fs.readFileSync(INQUIRIES_FILE, 'utf8'));
        }
      } catch (e) {
        inquiries = [];
      }
      inquiries.push(lead);
      fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(inquiries, null, 2), 'utf8');

      // 2. Send instant Discord Lead Alert
      sendDiscordLeadNotification(lead).catch(console.error);

      // 3. Return Success
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      return res.end(JSON.stringify({ success: true, message: 'Inquiry received successfully!' }));
    } catch (err) {
      console.error('[Inquiry Error]', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Internal Server Error' }));
    }
  }

  // Handle _next/image query (Serve local /pfps/ or pipe external without redirect)
  if (pathname === '/_next/image') {
    const q = new URLSearchParams(parsedUrl.query || '');
    const qUrl = q.get('url') || '';
    if (qUrl) {
      const cleanTarget = qUrl.replace(/^\/+/, '');
      const localInSite = path.join(SITE_DIR, cleanTarget);
      if (fs.existsSync(localInSite) && fs.statSync(localInSite).isFile()) {
        return serveFile(req, res, localInSite);
      }
      const localInBase = path.join(BASE_DIR, cleanTarget);
      if (fs.existsSync(localInBase) && fs.statSync(localInBase).isFile()) {
        return serveFile(req, res, localInBase);
      }

      if (qUrl.startsWith('http://') || qUrl.startsWith('https://')) {
        const client = qUrl.startsWith('https://') ? https : http;
        return client.get(qUrl, (proxyRes) => {
          res.writeHead(proxyRes.statusCode, {
            'Content-Type': proxyRes.headers['content-type'] || 'image/jpeg',
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Access-Control-Allow-Origin': '*'
          });
          proxyRes.pipe(res);
        }).on('error', () => {
          res.writeHead(404);
          res.end();
        });
      }
    }
    res.writeHead(204);
    return res.end();
  }

  // 1. Root route
  if (pathname === '/' || pathname === '') {
    return serveFile(req, res, path.join(SITE_DIR, 'index.html'));
  }

  // Strip leading slash for relative joins
  const cleanPath = pathname.replace(/^\/+/, '');

  // 2. Check in editorartem.com directly
  const inSite = path.join(SITE_DIR, cleanPath);
  if (fs.existsSync(inSite) && fs.statSync(inSite).isFile()) {
    return serveFile(req, res, inSite);
  }

  // 3. Check clean HTML routes in editorartem.com (e.g. /portfolio -> /portfolio.html)
  const inSiteHtml = path.join(SITE_DIR, cleanPath + '.html');
  if (fs.existsSync(inSiteHtml) && fs.statSync(inSiteHtml).isFile()) {
    return serveFile(req, res, inSiteHtml);
  }

  // 4. Check index.html inside a directory (e.g. /sub/ -> /sub/index.html)
  const inSiteIndex = path.join(SITE_DIR, cleanPath, 'index.html');
  if (fs.existsSync(inSiteIndex) && fs.statSync(inSiteIndex).isFile()) {
    return serveFile(req, res, inSiteIndex);
  }

  // 5. Check in BASE_DIR directly (for external asset folders like /videos.ctfassets.net/..., /www.youtube.com/...)
  const inBase = path.join(BASE_DIR, cleanPath);
  if (fs.existsSync(inBase) && fs.statSync(inBase).isFile()) {
    return serveFile(req, res, inBase);
  }

  const inBaseHtml = path.join(BASE_DIR, cleanPath + '.html');
  if (fs.existsSync(inBaseHtml) && fs.statSync(inBaseHtml).isFile()) {
    return serveFile(req, res, inBaseHtml);
  }

  // 6. 404 fallback
  console.log('[404 Not Found]', pathname);
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('404 Not Found: ' + pathname);
});

server.listen(PORT, () => {
  console.log('=======================================================');
  console.log(`  PORTFOLIO SERVER RUNNING AT: http://localhost:${PORT}`);
  console.log(`  Serving: ${SITE_DIR}`);
  console.log(`  Assets:  ${BASE_DIR}`);
  console.log('=======================================================');
});
