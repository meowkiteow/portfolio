const fs = require('fs');

const logFile = 'C:\\Users\\krish\\.gemini\\antigravity-ide\\brain\\e9952017-de3f-4cf7-8dcd-f8241b935d31\\.system_generated\\logs\\transcript.jsonl';
const lines = fs.readFileSync(logFile, 'utf8').split('\n');

for (const l of lines) {
  if (!l.trim()) continue;
  try {
    const obj = JSON.parse(l);
    if (obj.type === 'USER_INPUT' && (!obj.step_index || obj.step_index < 2400)) {
      console.log(`[USER STEP ${obj.step_index}]:`);
      console.log(obj.content);
      console.log('--------------------------------------------------');
    }
  } catch(e) {}
}
