import {
  B as jsx, init_jsx_runtime, init_npm_react_18_2,
} from "/framerusercontent.com/sites/1TnLMRKXnoaeyMYClWUga/react.CIS0Sdlv.mjs";

init_npm_react_18_2();
init_jsx_runtime();

export const contactEmail = "krishnarawatshri@gmail.com";
export const contactWhatsApp = "https://wa.me/917453062637?text=" +
  encodeURIComponent("Hi Krishna, I'm interested in your video editing services.");
export const contactMailto = "mailto:" + contactEmail + "?subject=Video%20editing%20project%20inquiry";

function contactIcon(kind) {
  return jsx("svg", {
    viewBox: "0 0 24 24", width: 20, height: 20, fill: "none",
    stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round",
    "aria-hidden": true, focusable: "false",
    children: kind === "email" ? [
      jsx("rect", { x: 3, y: 5, width: 18, height: 14, rx: 3 }),
      jsx("path", { d: "m4 7 8 6 8-6" }),
    ] : [
      jsx("path", { d: "M21 11.5a9 9 0 0 1-13.4 7.8L3 21l1.7-4.6A9 9 0 1 1 21 11.5Z" }),
      jsx("path", { d: "M8 7.5c0 4.5 4 8 7.5 8l1-2.2-2.5-1-1 1c-1.4-.7-2.5-1.8-3.1-3.1l1-1-1-2.4L8 7.5Z" }),
    ],
  });
}

export default function ContactActions({ placement = "hero" }) {
  return jsx("div", {
    className: "contact-actions contact-actions--" + placement,
    children: [
      jsx("div", { className: "contact-actions-buttons", children: [
        jsx("a", {
          className: "contact-button contact-button--whatsapp",
          href: contactWhatsApp, target: "_blank", rel: "noopener noreferrer",
          children: [contactIcon("whatsapp"), jsx("span", { children: "Discuss your project on WhatsApp" })],
        }),
        jsx("a", {
          className: "contact-button contact-button--email", href: contactMailto,
          children: [contactIcon("email"), jsx("span", { children: "Email me" })],
        }),
      ] }),
      jsx("a", { className: "contact-email-address", href: contactMailto, children: contactEmail }),
    ],
  });
}
