import {
  B as jsx, init_jsx_runtime, init_npm_react_18_2,
} from "/framerusercontent.com/sites/1TnLMRKXnoaeyMYClWUga/react.CIS0Sdlv.mjs";

init_npm_react_18_2();
init_jsx_runtime();

export default function SoftwareCard({ mNIKSAj3F: title, dGE_WpKg5: category, Nimi83OIo: image, style }) {
  return jsx("div", {
    className: "software-card", style,
    children: [
      jsx("img", { className: "software-card-icon", src: typeof image === "string" ? image : image?.src, alt: "", width: 40, height: 40, decoding: "async" }),
      jsx("div", { className: "software-card-copy", children: [
        jsx("p", { className: "software-card-title", children: title }),
        jsx("p", { className: "software-card-category", children: category }),
      ] }),
    ],
  });
}
