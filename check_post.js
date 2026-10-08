const fs = require('fs');
const indexCode = fs.readFileSync('wondermake.xyz/assets/index-451442ce.js', 'utf8');
const lfIdx = indexCode.indexOf('listingFields');
console.log('listingFields:', indexCode.substring(lfIdx - 100, lfIdx + 300));
