import {
  B as jsx,
  init_jsx_runtime,
  init_npm_react_18_2,
} from "/framerusercontent.com/sites/1TnLMRKXnoaeyMYClWUga/react.CIS0Sdlv.mjs";

init_npm_react_18_2();
init_jsx_runtime();

function icon(src, modifier) {
  return jsx("span", {
    className: "hero-inline-icon hero-inline-icon--" + modifier,
    "aria-hidden": true,
    children: jsx("img", { src, alt: "", width: 48, height: 48, decoding: "async" }),
  });
}

// Icons occupy real space in the sentence, so they wrap with the words.
export default function HeroHeadline() {
  return jsx("div", {
    className: "framer-5c24d5 hero-inline-headline",
    "data-framer-name": "Text",
    children: jsx("div", {
      className: "framer-5ivilb",
      children: jsx("h1", {
        className: "framer-text framer-styles-preset-18ubm3 hero-inline-title",
        children: [
          "Hello, I\u2019m ",
          jsx("span", {
            className: "hero-inline-name",
            children: ["Krishna ", icon("/framerusercontent.com/images/OoIOI1AKDjLjS9rSnJtIIr4HBw.jpg", "portrait")],
          }),
          " Delighted to have you explore my portfolio ",
          jsx("span", {
            className: "hero-inline-tools",
            children: [
              icon("/framerusercontent.com/images/hx1FRhuAzTI10UcNb2aa1CIMTY.png", "audio"),
              icon("/framerusercontent.com/images/7Z7GojiDdqjXlFPEZOIIh5OfqFk.png", "blue"),
              icon("/framerusercontent.com/images/5B59Wy4WvbxeDowOOhnBy2NhPs.png", "green"),
            ],
          }),
          " and my superpower is storytelling without speaking.",
        ],
      }),
    }),
  });
}
