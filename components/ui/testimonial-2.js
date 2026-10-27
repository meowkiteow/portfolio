import {
  B as jsx,
  init_jsx_runtime,
  init_npm_react_18_2,
} from "/framerusercontent.com/sites/1TnLMRKXnoaeyMYClWUga/react.CIS0Sdlv.mjs";

init_npm_react_18_2();
init_jsx_runtime();

// Browser-ready equivalent of testimonial-2.tsx for the existing Framer export.
export function Testimonial2({ authorName, authorTagline, url, quote, className }) {
  return jsx("figure", {
    className: ["testimonial-2", className].filter(Boolean).join(" "),
    children: [
      jsx("blockquote", {
        className: "testimonial-2-quote",
        children: [
          jsx("span", { className: "testimonial-2-opening", "aria-hidden": true, children: "\u201c" }),
          jsx("p", { children: quote }),
          jsx("span", { className: "testimonial-2-closing", "aria-hidden": true, children: "\u201d" }),
        ],
      }),
      jsx("figcaption", {
        className: "testimonial-2-caption",
        children: [
          jsx("div", { className: "testimonial-2-rule", "aria-hidden": true }),
          jsx("div", {
            className: "testimonial-2-author",
            children: jsx("span", {
              children: [
                url
                  ? jsx("a", { href: url, target: "_blank", rel: "noopener noreferrer", children: authorName })
                  : jsx("span", { className: "testimonial-2-name", children: authorName }),
                jsx("span", {
                  className: "testimonial-2-tagline",
                  children: [jsx("span", { className: "testimonial-2-comma", children: ", " }), authorTagline],
                }),
              ],
            }),
          }),
        ],
      }),
    ],
  });
}

export default Testimonial2;
