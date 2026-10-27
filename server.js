const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3003;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
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
  '.mp4': 'video/mp4',
  '.webm': 'video/webm'
};

function serveFileWithRange(filePath, contentType, req, res) {
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize) {
      res.writeHead(416, {
        'Content-Range': `bytes */${fileSize}`,
        'Access-Control-Allow-Origin': '*'
      });
      return res.end();
    }

    const chunksize = end - start + 1;
    const fileStream = fs.createReadStream(filePath, { start, end });
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });
    fileStream.pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Access-Control-Allow-Origin': '*'
    });
    fs.createReadStream(filePath).pipe(res);
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const parsedUrl = url.parse(req.url, true);
    let pathname = decodeURIComponent(parsedUrl.pathname || '/');

    // CORS preflight
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': '*'
      });
      return res.end();
    }

    // Serve Homepage
    if (pathname === '/' || pathname === '/index.html') {
      const indexPath = path.join(ROOT_DIR, 'index.html');
      return serveFileWithRange(indexPath, 'text/html; charset=utf-8', req, res);
    }

    // Clean relative path
    const cleanRel = pathname.replace(/^\/+/, '');
    const localPath = path.join(ROOT_DIR, cleanRel);

    if (fs.existsSync(localPath) && fs.statSync(localPath).isFile()) {
      const ext = path.extname(localPath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      return serveFileWithRange(localPath, contentType, req, res);
    }

    // Safety live fallback & disk cacher for any external assets
    if (pathname.startsWith('/framerusercontent.com/') || pathname.startsWith('/fonts.gstatic.com/') || pathname.startsWith('/app.framerstatic.com/')) {
      const remoteUrl = 'https:/' + pathname;
      try {
        const fetchRes = await fetch(remoteUrl);
        if (fetchRes.ok) {
          const buf = Buffer.from(await fetchRes.arrayBuffer());
          const cType = fetchRes.headers.get('content-type') || 'application/octet-stream';
          
          // Save to local disk so it never has to fetch again
          try {
            fs.mkdirSync(path.dirname(localPath), { recursive: true });
            fs.writeFileSync(localPath, buf);
          } catch (e) {}

          res.writeHead(200, {
            'Content-Type': cType,
            'Content-Length': buf.length,
            'Access-Control-Allow-Origin': '*'
          });
          return res.end(buf);
        }
      } catch (err) {}
    }

    // SPA fallback
    const indexPath = path.join(ROOT_DIR, 'index.html');
    return serveFileWithRange(indexPath, 'text/html; charset=utf-8', req, res);

  } catch (err) {
    console.error('Request error:', err);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error: ' + err.message);
    }
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('====================================================');
  console.log(`  Krishna Portfolio is live!`);
  console.log(`  Local URL:    http://localhost:${PORT}`);
  console.log(`  Network URL:  http://127.0.0.1:${PORT}`);
  console.log('====================================================');
});
