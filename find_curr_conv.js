const fs = require('fs');
const path = require('path');

const logFile = 'C:\\Users\\krish\\.gemini\\antigravity-ide\\brain\\e9952017-de3f-4cf7-8dcd-f8241b935d31\\.system_generated\\logs\\transcript.jsonl';
const lines = fs.readFileSync(logFile, 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  if (!l.trim()) continue;
  try {
    const obj = JSON.parse(l);
    const content = (obj.content || '').toLowerCase();
    if (obj.type === 'USER_INPUT') {
      console.log(`[USER STEP ${obj.step_index || i}]: ${obj.content}\n`);
    } else if (content.includes('logo') && (content.includes('vellisto') || content.includes('brand') || content.includes('icon'))) {
      console.log(`[ASSISTANT STEP ${obj.step_index || i}]: ${obj.content.substring(0, 300)}\n`);
    }
  } catch(e) {}
}
