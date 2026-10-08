const fs = require('fs');
const path = require('path');

const base = 'C:\\Users\\krish\\.gemini\\antigravity-ide\\brain';
const convs = fs.readdirSync(base);

for (const cid of convs) {
  const p = path.join(base, cid, '.system_generated', 'logs', 'transcript.jsonl');
  if (fs.existsSync(p)) {
    const lines = fs.readFileSync(p, 'utf8').split('\n');
    for (const l of lines) {
      if (!l.trim()) continue;
      try {
        const obj = JSON.parse(l);
        if (obj.type === 'USER_INPUT') {
          const text = (obj.content || '').toLowerCase();
          if (text.includes('logo') || text.includes('vellisto') || text.includes('wondermake') || text.includes('brand')) {
            console.log(`\n=== USER INPUT in [${cid}] ===`);
            console.log(obj.content);
          }
        }
      } catch (e) {}
    }
  }
}
