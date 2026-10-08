const fs = require('fs');

const logFile = 'C:\\Users\\krish\\.gemini\\antigravity-ide\\brain\\e9952017-de3f-4cf7-8dcd-f8241b935d31\\.system_generated\\logs\\transcript.jsonl';
const lines = fs.readFileSync(logFile, 'utf8').split('\n');

for (let i = 2027; i < 2080 && i < lines.length; i++) {
  try {
    const o = JSON.parse(lines[i]);
    console.log(`[Line ${i} - ${o.type}]:`);
    if (o.tool_calls) {
      for (const tc of o.tool_calls) {
        console.log(`  TOOL: ${tc.name}`, JSON.stringify(tc.arguments));
      }
    }
    if (o.content) {
      console.log(`  CONTENT: ${o.content.substring(0, 150)}`);
    }
  } catch (e) {
    console.log(`[Line ${i}] parse error:`, e.message);
  }
}
