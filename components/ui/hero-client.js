import {
  B as createElement,
  init_jsx_runtime,
  init_npm_react_18_2,
} from "/framerusercontent.com/sites/1TnLMRKXnoaeyMYClWUga/react.CIS0Sdlv.mjs";

init_npm_react_18_2();
init_jsx_runtime();

function clientProfile(name, image) {
  return createElement("div", {
    className: "hero-client-profile",
    children: [
      createElement("img", {
        src: image,
        alt: name,
        width: 72,
        height: 72,
        decoding: "async",
      }),
      createElement("span", { children: name }),
    ],
  });
}

export default function HeroClient() {
  return createElement("div", {
    className: "hero-client",
    children: [
      createElement("p", { className: "hero-client-heading", children: "Trusted by the best" }),
      createElement("div", {
        className: "hero-client-profiles",
        children: [
          clientProfile("Umar Punjabi", "/assets/experience/umar-punjabi.jpg"),
          clientProfile("Royal Wharf Clinic", "/assets/experience/royal-wharf-clinic.jpg"),
          clientProfile("The Numbers Game", "/assets/experience/the-numbers-game.jpg"),
          clientProfile("Wiz of Ecom", "/assets/experience/wiz-of-ecom.jpg"),
        ],
      }),
    ],
  });
}
