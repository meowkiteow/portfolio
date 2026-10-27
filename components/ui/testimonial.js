import {
  B as jsx,
  init_jsx_runtime,
  init_npm_react_18_2,
} from "/framerusercontent.com/sites/1TnLMRKXnoaeyMYClWUga/react.CIS0Sdlv.mjs";
import { Testimonial2 } from "./testimonial-2.js";

init_npm_react_18_2();
init_jsx_runtime();

export default function ClientFeedback(props) {
  return jsx("section", {
    id: "testimonials",
    className: "compact-testimonial",
    "aria-label": "Client testimonial",
    children: jsx(Testimonial2, {
      authorName: props.BstFqk36X || "Gaurav Thakur",
      authorTagline: props.vz1mqxLMA || "Getsetfly Media",
      quote: props.RV433xUok || "Partnering with Krishna was a game-changer. Instead of drowning in an endless chain of emails, there is clear and easy accountability meaning tasks actually get done!",
      // No profile URL was supplied for this client; show plain attribution.
    }),
  });
}
