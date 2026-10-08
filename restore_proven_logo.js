const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, 'wondermake.xyz');

console.log('Restoring proven Vellisto logo, rotating asterisk, and footer animation...');

// 1. wm-logo-9dfdcdb0.js (Exact from Line 2175)
const wmLogoPath = path.join(ROOT, 'assets', 'wm-logo-9dfdcdb0.js');
const wmLogoCode = `import { _ as h, o as t, c as l, Q as a } from "./index-451442ce.js";
const e = {},
  o = {
    role: "img",
    class: "svg-wm-logo",
    viewBox: "0 0 725 190",
    preserveAspectRatio: "xMinYMin meet",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-label": "Vellisto"
  },
  c = a('<g fill="currentColor"><text x="20" y="145" font-family="\\'TTCPro\\', sans-serif" font-weight="900" font-size="140" letter-spacing="-0.01em">VELLIST</text><g transform="translate(645, 95)"><g class="vellisto-spin"><path fill-rule="evenodd" d="M -45.0 -28.7 L -14.9 -6.1 L -52.1 -11.5 L -52.1 11.5 L -14.6 6.1 L -44.9 28.8 L -28.7 45.0 L -6.2 14.9 L -11.5 52.1 L 11.5 52.1 L 6.1 14.9 L 28.7 45.0 L 44.9 28.8 L 14.7 6.1 L 52.1 11.5 L 52.1 -11.5 L 14.9 -6.1 L 44.9 -28.7 L 28.8 -44.9 L 6.2 -14.7 L 11.6 -52.1 L -11.5 -52.1 L -6.1 -14.7 L -28.7 -44.9 Z"></path></g></g></g>', 1),
  p = [c];
function s(r, n) { return t(), l("svg", o, p); }
const i = h(e, [["render", s]]);
export { i as default };
`;
fs.writeFileSync(wmLogoPath, wmLogoCode, 'utf8');
console.log('✓ Restored assets/wm-logo-9dfdcdb0.js');

// 2. header-acd7be07.css (Exact from Line 2177)
const headerCssPath = path.join(ROOT, 'assets', 'header-acd7be07.css');
const headerCssCode = `@layer components{.part-header{pointer-events:none;position:relative;z-index:3}.part-header a,.part-header button{pointer-events:auto}.part-header_logo{margin-left:var(--grid-size)}.part-header_logo a{padding-left:1.2em;padding-right:1.2em;animation-delay:.1s}@media (max-width: 767.9px){.part-header_logo a{width:100%;justify-content:center}}.part-header_logo a .svg-wm-logo{width:7.2em;height:auto;overflow:visible;transform:translate(var(--un-translate-x)) translateY(var(--un-translate-y)) translateZ(var(--un-translate-z)) rotate(var(--un-rotate)) rotateX(var(--un-rotate-x)) rotateY(var(--un-rotate-y)) rotate(var(--un-rotate-z)) skew(var(--un-skew-x)) skewY(var(--un-skew-y)) scaleX(var(--un-scale-x)) scaleY(var(--un-scale-y)) scaleZ(var(--un-scale-z));transition-property:color,background-color,border-color,outline-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s;transition-duration:.4s;transition-timing-function:cubic-bezier(.19,1,.22,1);will-change:transform}.part-header_logo a:active .svg-wm-logo{--un-scale-x:.92;--un-scale-y:.92;transform:translate(var(--un-translate-x)) translateY(var(--un-translate-y)) translateZ(var(--un-translate-z)) rotate(var(--un-rotate)) rotateX(var(--un-rotate-x)) rotateY(var(--un-rotate-y)) rotate(var(--un-rotate-z)) skew(var(--un-skew-x)) skewY(var(--un-skew-y)) scaleX(var(--un-scale-x)) scaleY(var(--un-scale-y)) scaleZ(var(--un-scale-z))}}
.part-header_logo a .vellisto-spin{transform-origin:0 0;animation:vellisto-spin 12s linear infinite;will-change:transform;transition:transform 0.4s ease}.part-header_logo a:hover .vellisto-spin{animation-duration:3.5s}@keyframes vellisto-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
`;
fs.writeFileSync(headerCssPath, headerCssCode, 'utf8');
console.log('✓ Restored assets/header-acd7be07.css');

// 3. footer-5e023710.css (Exact from Line 2187)
const footerCssPath = path.join(ROOT, 'assets', 'footer-5e023710.css');
let footerCss = fs.readFileSync(footerCssPath, 'utf8');
const oldFooterLogoRule = /\.part-footer_logo\{[^}]+\}/;
const newFooterLogoCss = `.part-footer_logo{margin:2.5rem auto 0;display:block;width:100%;max-width:1380px;overflow:visible;--un-text-opacity:1;color:rgba(15,15,15,var(--un-text-opacity));opacity:0;transform:translateY(36px);transition:opacity 1.2s cubic-bezier(.16,1,.3,1),transform 1.2s cubic-bezier(.16,1,.3,1);will-change:transform,opacity}.part-footer_logo.--is-visible{opacity:1;transform:translateY(0)}.part-footer_logo canvas{width:100%}.part-footer_logo svg{width:100%;height:auto;display:block;overflow:visible}.part-footer_logo .vellisto-spin{animation:vellisto-spin 12s linear infinite;transform-origin:0 0;will-change:transform}.part-footer_logo:hover .vellisto-spin{animation-duration:3.5s}@keyframes vellisto-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`;

if (oldFooterLogoRule.test(footerCss)) {
  footerCss = footerCss.replace(oldFooterLogoRule, newFooterLogoCss);
} else {
  footerCss += '\n' + newFooterLogoCss;
}
fs.writeFileSync(footerCssPath, footerCss, 'utf8');
console.log('✓ Restored assets/footer-5e023710.css');

// 4. footer-66f11655.js
const footerJsPath = path.join(ROOT, 'assets', 'footer-66f11655.js');
let footerJs = fs.readFileSync(footerJsPath, 'utf8');

const footerSvgString = '<svg role="img" viewBox="0 0 725 190" preserveAspectRatio="xMidYMid meet" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Vellisto"><g fill="currentColor"><text x="20" y="145" font-family="\'TTCPro\', sans-serif" font-weight="900" font-size="140" letter-spacing="-0.01em">VELLIST</text><g transform="translate(645, 95)"><g class="vellisto-spin"><path fill-rule="evenodd" d="M -45.0 -28.7 L -14.9 -6.1 L -52.1 -11.5 L -52.1 11.5 L -14.6 6.1 L -44.9 28.8 L -28.7 45.0 L -6.2 14.9 L -11.5 52.1 L 11.5 52.1 L 6.1 14.9 L 28.7 45.0 L 44.9 28.8 L 14.7 6.1 L 52.1 11.5 L 52.1 -11.5 L 14.9 -6.1 L 44.9 -28.7 L 28.8 -44.9 L 6.2 -14.7 L 11.6 -52.1 L -11.5 -52.1 L -6.1 -14.7 L -28.7 -44.9 Z"></path></g></g></g></svg>';

// Find part-footer_logo slot render in footerJs
// Replace innerHTML or static svg rendering
footerJs = footerJs.replace(/aria-label:"Vellisto",innerHTML:'[^']+'/g, `aria-label:"Vellisto",innerHTML:'${footerSvgString}'`);
footerJs = footerJs.replace(/class:"part-footer_logo --ui-center"/g, 'class:F(["part-footer_logo --ui-center",{"--is-visible":p.isVisible}])');

fs.writeFileSync(footerJsPath, footerJs, 'utf8');
console.log('✓ Restored assets/footer-66f11655.js');

console.log('All proven past assets restored successfully!');
