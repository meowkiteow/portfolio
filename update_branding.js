const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, 'wondermake.xyz');

console.log('=== Updating Brand Identity from Wondermake to Vellisto ===');

// 1. Update Header Logo Component (wm-logo-9dfdcdb0.js)
const logoJsPath = path.join(ROOT, 'assets', 'wm-logo-9dfdcdb0.js');
const vellistG = '<g fill="currentColor">' +
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

const updatedLogoCode = `import{_ as h,o as t,c as l,Q as a}from"./index-451442ce.js";const e={},o={role:"img",class:"svg-wm-logo",viewBox:"0 0 860 174",preserveAspectRatio:"xMinYMin meet",fill:"none",xmlns:"http://www.w3.org/2000/svg","aria-label":"Vellisto"},c=a('${vellistG}',1),p=[c];function s(r,n){return t(),l("svg",o,p)}const i=h(e,[["render",s]]);export{i as default};`;

fs.writeFileSync(logoJsPath, updatedLogoCode, 'utf8');
console.log('✓ Updated header logo in assets/wm-logo-9dfdcdb0.js to VELLIST✳');


// 2. Update Footer CSS to style SVG in .part-footer_logo
const footerCssPath = path.join(ROOT, 'assets', 'footer-5e023710.css');
let footerCss = fs.readFileSync(footerCssPath, 'utf8');
if (!footerCss.includes('.part-footer_logo svg')) {
  footerCss = footerCss.replace(
    '.part-footer_logo canvas{width:100%}',
    '.part-footer_logo canvas{width:100%}.part-footer_logo svg{width:100%;max-width:1400px;height:auto;max-height:220px;display:block;margin:0 auto;color:inherit}'
  );
  fs.writeFileSync(footerCssPath, footerCss, 'utf8');
  console.log('✓ Added .part-footer_logo svg style to footer-5e023710.css');
}


// 3. Update Footer Logo in footer-66f11655.js
const footerJsPath = path.join(ROOT, 'assets', 'footer-66f11655.js');
let footerJs = fs.readFileSync(footerJsPath, 'utf8');

// Replace Wondermake label with Vellisto
footerJs = footerJs.replace(/label:"Wondermake"/g, 'label:"Vellisto"');

// Replace Rive logo render in footer with the VELLIST✳ SVG render
// Original snippet in footer-66f11655.js:
// l.riveRuntime?(t(),a(T,{key:0,src:l.riveRuntime,active:p.isVisible,width:"1500",height:"240"},null,8,["src","active"])):r("",!0)
const oldRiveSnippet = 'l.riveRuntime?(t(),a(T,{key:0,src:l.riveRuntime,active:p.isVisible,width:"1500",height:"240"},null,8,["src","active"])):r("",!0)';
const newSvgSnippet = `(t(),s("svg",{role:"img",viewBox:"0 0 860 174",style:"width:100%;max-width:1400px;height:auto;max-height:220px;display:block;margin:0 auto;fill:currentColor","aria-label":"Vellisto",innerHTML:'${vellistG}'}))`;

if (footerJs.includes(oldRiveSnippet)) {
  footerJs = footerJs.replace(oldRiveSnippet, newSvgSnippet);
  fs.writeFileSync(footerJsPath, footerJs, 'utf8');
  console.log('✓ Replaced footer Rive logo with ultra-bold VELLIST✳ SVG in footer-66f11655.js');
} else {
  console.log('Note: Rive snippet not found verbatim, checking alternatives...');
}


// 4. Update manifest.webmanifest
const manifestPath = path.join(ROOT, 'manifest.webmanifest');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
manifest.name = 'Vellisto';
manifest.short_name = 'Vellisto';
manifest.description = 'An ultra-premium video editing agency and motion design studio crafting high-retention YouTube content, viral short form, and electrifying animations.';
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
console.log('✓ Updated manifest.webmanifest to Vellisto');


// 5. Update index.html
const indexPath = path.join(ROOT, 'index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');

// Replace any remaining "Wondermake" or old titles
indexHtml = indexHtml.replace(/Vellisto \| Creative studio for brands, web, apps &amp; games/g, 'Vellisto | Video Editing &amp; Motion Production Studio');
indexHtml = indexHtml.replace(/Vellisto \| Creative studio for brands, web, apps & games/g, 'Vellisto | Video Editing & Motion Production Studio');
indexHtml = indexHtml.replace(/https:\/\/wondermake\.xyz\//g, 'https://vellisto.com/');
indexHtml = indexHtml.replace(/https:\/\/wondermake\.xyz/g, 'https://vellisto.com');
indexHtml = indexHtml.replace(/https:\/\/wondermake\.gumroad\.com\//g, 'https://vellisto.com/#pricing');
indexHtml = indexHtml.replace(/https:\/\/www\.linkedin\.com\/company\/wondermake/g, 'https://linkedin.com/company/vellisto');
indexHtml = indexHtml.replace(/https:\/\/www\.instagram\.com\/wondermakestudio\//g, 'https://instagram.com/vellisto');
indexHtml = indexHtml.replace(/https:\/\/fonts\.wondermake\.xyz\//g, 'https://vellisto.com/');
indexHtml = indexHtml.replace(/https:\/\/creativemarket\.com\/wondermake/g, 'https://vellisto.com/');
indexHtml = indexHtml.replace(/https:\/\/www\.awwwards\.com\/Vellisto\//g, 'https://vellisto.com/');

// In window.$ssr:
const ssrStart = indexHtml.indexOf("window.$ssr = '");
const ssrEnd = indexHtml.lastIndexOf("';</script>");
if (ssrStart !== -1 && ssrEnd !== -1) {
  const rawSsr = indexHtml.substring(ssrStart + "window.$ssr = '".length, ssrEnd);
  const evalSsr = new Function("return '" + rawSsr + "'")();
  const ssr = JSON.parse(evalSsr);

  ssr.options.site_title = 'Vellisto';
  ssr.options.site_url = 'https://vellisto.com/';
  ssr.options.pwa_name = 'Vellisto';
  ssr.options.site_desc = 'An ultra-premium video editing agency and motion design studio crafting high-retention YouTube content, viral short form, and electrifying animations.';

  if (ssr.post) {
    ssr.post.seo_title = 'Vellisto | Video Editing & Motion Production Studio';
    if (ssr.post.title === 'Home') {
      ssr.post.seo_title = 'Vellisto | Video Editing & Motion Production Studio';
    }
  }

  // Update menus
  if (ssr.menus) {
    if (ssr.menus.buttons) {
      ssr.menus.buttons = ssr.menus.buttons.filter(b => b.link && !b.link.text.includes('Shop'));
    }
    if (ssr.menus.lower) {
      ssr.menus.lower = ssr.menus.lower.filter(b => b.link && !b.link.text.includes('Shop'));
    }
    if (ssr.menus.mobile) {
      ssr.menus.mobile = ssr.menus.mobile.filter(b => b.link && !b.link.text.includes('Shop'));
    }
  }

  const updatedSsrStr = JSON.stringify(ssr).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  indexHtml = indexHtml.substring(0, ssrStart + "window.$ssr = '".length) + updatedSsrStr + indexHtml.substring(ssrEnd);
  console.log('✓ Cleaned and updated window.$ssr in index.html');
}

fs.writeFileSync(indexPath, indexHtml, 'utf8');
console.log('✓ Saved index.html');

console.log('=== Complete! All Wondermake references replaced with Vellisto. ===');
