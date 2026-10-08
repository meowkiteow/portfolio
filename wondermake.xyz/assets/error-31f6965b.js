import {
  _ as exportComponent,
  o as openBlock,
  c as createElementBlock,
  d as createElementVNode,
  e as createVNode,
  r as resolveComponent
} from "./index-451442ce.js";

const componentDef = {};

const B_MAIN = { class: "template-error" };
const B_BOX = { class: "template-error_box" };
const B_H1 = { class: "--type-heading --type-cms --type-center --type-balance" };
const B_ACTION = { class: "template-error_action" };

function render(ctx, cache, $props, $setup, $data, $options) {
  const extrude = resolveComponent("part-extrude");
  const btn = resolveComponent("ui-button");

  return openBlock(), createElementBlock("main", B_MAIN, [
    createElementVNode("div", B_BOX, [
      createElementVNode("h1", B_H1, [
        createVNode(extrude, { content: "Error <b>404</b>" })
      ]),
      createElementVNode("div", B_ACTION, [
        createVNode(btn, { link: "/", text: "Back to Home", "icon-right": "arrow-right", rive: "" })
      ])
    ])
  ]);
}

const exported = exportComponent(componentDef, [["render", render]]);
export { exported as default };
