const fs = require('fs');
const path = require('path');
const https = require('https');

module.exports = function handler(req, res) {
  let url = req.query.url;
  if (!url) return res.status(404).end();

  if (url.startsWith('/pfps/')) {
    const filename = path.basename(url);
    const filePath = path.join(__dirname, '../pfps', filename);
    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', filename.endsWith('.png') ? 'image/png' : 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      return res.status(200).send(fs.readFileSync(filePath));
    }
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return https.get(url, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, {
        'Content-Type': proxyRes.headers['content-type'] || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*'
      });
      proxyRes.pipe(res);
    }).on('error', () => res.status(404).end());
  }

  res.status(404).end();
};
