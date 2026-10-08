import{_ as x,l as c,k as l,o as a,c as u,d as s,e,r as o,t as v,j as n}from"./index-451442ce.js";

const L={
  components:{
    "part-footer":c(()=>l(()=>import("./footer-66f11655.js"),["assets/footer-66f11655.js","assets/index-451442ce.js","assets/index-c1064074.css","assets/sample-1d761c07.js","assets/_baseRandom-7bfb07b8.js","assets/footer-5e023710.css"]))
  },
  computed:{
    post(){return this.$routing.post},
    title(){return n(this.post,"title","")}
  }
};

const R={class:"template-default --ui-px-lg --ui-py-lg"};
const T={class:"--ui-x --ui-space-lg"};
const H1={class:"--type-title --type-heavy --ui-mb-md"};

function Q(t,i,S,U,X,r){
  const D=o("part-footer");
  return a(),u("main",{class:"template-default"},[
    s("article",R,[
      s("div",T,[
        s("h1",H1,v(r.title))
      ])
    ]),
    e(D)
  ]);
}

const $=x(L,[["render",Q]]);
export{$ as default};
