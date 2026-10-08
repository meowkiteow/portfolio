import{_ as x,l as c,k as l,o as a,c as u,d as s,e,r as o,t as v,j as n,q as b}from"./index-451442ce.js";

const L={
  components:{
    "part-footer":c(()=>l(()=>import("./footer-66f11655.js"),["assets/footer-66f11655.js","assets/index-451442ce.js","assets/index-c1064074.css","assets/sample-1d761c07.js","assets/_baseRandom-7bfb07b8.js","assets/footer-5e023710.css"])),
    "part-post":c(()=>l(()=>import("./post-edfec7f4.js"),["assets/post-edfec7f4.js","assets/index-451442ce.js","assets/index-c1064074.css","assets/post-eeb532a9.css"]))
  },
  computed:{
    post(){return this.$routing.post},
    title(){return n(this.post,"title","")}
  }
};

const R={class:"template-post --ui-px-lg"};
const T={class:"--ui-x --ui-space-lg"};

function Q(t,i,S,U,X,r){
  const p=o("part-post");
  const D=o("part-footer");
  return a(),u("main",{class:"template-post"},[
    s("article",R,[
      s("div",T,[
        e(p,{post:r.post,rows:!0},null,8,["post"])
      ])
    ]),
    e(D)
  ]);
}

const $=x(L,[["render",Q]]);
export{$ as default};
