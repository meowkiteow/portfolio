const fs = require('fs');
const path = require('path');

const gContent = '<g fill="currentColor">' +
  '<path d="M0 1.4h38l22 100 22-100h38l-43 170h-34Z"></path>' +
  '<path d="M140 1.4h71v33.1h-36v34.2h26.2v31h-26.2v38.6h36v33.1h-71Z"></path>' +
  '<path d="M231 1.4h35v136.9h36v33.1h-71Z"></path>' +
  '<path d="M322 1.4h35v136.9h36v33.1h-71Z"></path>' +
  '<path d="M413 1.4h35v170h-35Z"></path>' +
  '<path d="M468 55c0-36 22-53.6 57-53.6 20 0 35 6 44 16l-21 27c-6-6-13-10-23-10-17 0-22 8-22 19 0 34 57 24 57 70 0 33-20 50-56 50-24 0-41-7-52-20l22-26c8 8 18 13 30 13 16 0 21-7 21-17 0-35-57-25-57-68.4Z"></path>' +
  '<path d="M564 1.4h80v33.1h-22.5v136.9h-35v-136.9h-22.5Z"></path>' +
  '<g transform="translate(496, 0)">' +
  '<path fill-rule="evenodd" d="m185 39 50.2 37.6-62-9V106l62.4-9-50.5 37.8 27 27 37.6-50.2-8.9 62h38.3l-8.9-62 37.6 50.2 27.1-27L284.5 97l62.3 9V67.7l-62 8.9L334.9 39 308 12l-37.7 50.3 9-62.3h-38.4l9 62.3L212.2 12Z"></path>' +
  '</g>' +
  '</g>';

console.log('G Content length:', gContent.length);

const testSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 174" width="860" height="174" style="background:#fff; color:#0f0f0f">${gContent}</svg>`;
fs.writeFileSync(path.join(__dirname, 'test_logo.svg'), testSvg, 'utf8');
console.log('Saved test_logo.svg');
