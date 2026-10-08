const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'wondermake.xyz', 'api', 'posts');

fs.readdirSync(dir).forEach(f => {
  if (f.startsWith('_work_') && f !== '_work_ai-branding-workflow.html') {
    const p = path.join(dir, f);
    let content = fs.readFileSync(p, 'utf8');
    if (content.includes('"Long Form"')) {
      content = content.replace(/"Long Form",?\s*/g, '');
      // Clean up any trailing comma in arrays like [ , "Motion" ]
      content = content.replace(/\[\s*,/g, '[').replace(/,\s*\]/g, ']');
      fs.writeFileSync(p, content, 'utf8');
      console.log('Cleaned Long Form from:', f);
    }
  }
});
