import {
  B as jsx, ye as useState, init_jsx_runtime, init_npm_react_18_2,
} from "/framerusercontent.com/sites/1TnLMRKXnoaeyMYClWUga/react.CIS0Sdlv.mjs";
import { Testimonial2 } from "./testimonial-2.js";
import { collaborations } from "./testimonial-content.js";

init_npm_react_18_2();
init_jsx_runtime();

export default function ClientFeedback() {
  const [selected, setSelected] = useState(0);
  const client = collaborations[selected];
  return jsx("section", {
    id: "testimonials", className: "compact-testimonial", "aria-label": "Selected collaborations",
    children: [
      jsx("p", { className: "collaboration-heading", children: "Selected collaborations" }),
      jsx("div", {
        className: "collaboration-story", "aria-live": "polite", "aria-atomic": true,
        children: jsx(Testimonial2, {
          authorName: client.name, authorTagline: client.focus, quote: client.summary, isQuote: false,
        }),
      }),
      jsx("div", {
        className: "collaboration-selectors", role: "group", "aria-label": "Choose a collaboration",
        children: collaborations.map((item, index) => jsx("button", {
          key: item.name, type: "button", className: "collaboration-selector",
          "aria-pressed": selected === index, onClick: () => setSelected(index),
          children: [
            jsx("img", { src: item.image, alt: "", width: 44, height: 44, loading: "lazy", decoding: "async" }),
            jsx("span", { children: item.name }),
          ],
        })),
      }),
    ],
  });
}
