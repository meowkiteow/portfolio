const fs = require('fs');

const logFile = 'C:\\Users\\krish\\.gemini\\antigravity-ide\\brain\\e9952017-de3f-4cf7-8dcd-f8241b935d31\\.system_generated\\logs\\transcript.jsonl';
const lines = fs.readFileSync(logFile, 'utf8').split('\n');

for (const idx of [2175, 2177, 2181, 2187]) {
  const o = JSON.parse(lines[idx]);
  console.log(`=== LINE ${idx} ===`);
  console.log(JSON.stringify(o.tool_calls, null, 2));
}
