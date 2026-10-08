const fs = require('fs');
const path = require('path');

const targetConvs = [
  '2b810a47-e5f6-4938-98a7-3b7ab603fd69',
  '5e9cf6fd-d8c9-4b7e-b85c-6fa9c446beb1',
  '240e5ab3-5584-42bf-87d3-44d957e81beb',
  '03788973-09e7-4ce7-baf9-4975b393ce85',
  'dd2d70b1-c6a2-49b6-8c84-0c4d196015b3'
];

const base = 'C:\\Users\\krish\\.gemini\\antigravity-ide\\brain';

for (const cid of targetConvs) {
  const p = path.join(base, cid, '.system_generated', 'logs', 'transcript.jsonl');
  if (fs.existsSync(p)) {
    const lines = fs.readFileSync(p, 'utf8').split('\n');
    for (const l of lines) {
      if (!l.trim()) continue;
      try {
        const obj = JSON.parse(l);
        const text = (obj.content || '').toLowerCase();
        if (text.includes('logo') || text.includes('vellisto') || text.includes('svg') || text.includes('icon')) {
          if (obj.type === 'USER_INPUT') {
            console.log(`\n[USER in ${cid}]: ${obj.content.substring(0, 300)}`);
          } else if (obj.type === 'PLANNER_RESPONSE' && (text.includes('wm-logo') || text.includes('rive_logo') || text.includes('replace') || text.includes('logo'))) {
            // Check tool calls
            if (obj.tool_calls) {
              for (const tc of obj.tool_calls) {
                if (JSON.stringify(tc).includes('logo')) {
                  console.log(`\n[TOOL CALL in ${cid}]:`, tc.name, JSON.stringify(tc.arguments).substring(0, 300));
                }
              }
            }
          }
        }
      } catch (e) {}
    }
  }
}
