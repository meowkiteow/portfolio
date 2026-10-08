import{D as d}from"./image-effect-renderer-8dbfac7f.js";import{_ as p,C as u,o as f,c as y,d as l,g,w as m,a8 as v,n as h}from"./index-451442ce.js";const _=`// Ruofei Du\r
// Dot Screen / Halftone: https://www.shadertoy.com/view/4sBBDK\r
// Halftone: https://www.shadertoy.com/view/lsSfWV\r
float greyScale(in vec3 col){\r
    return dot(col, vec3(0.2126, 0.7152, 0.0722));\r
}\r
mat2 rotate2d(float angle){\r
    return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));\r
}\r
float dotScreen(in vec2 uv, in float angle, in float scale){\r
    float s = sin( angle ), c = cos( angle );\r
	vec2 p = (uv - vec2(0.5)) * iResolution.xy;\r
    vec2 q = rotate2d(angle) * p * scale; \r
	return (sin( q.x ) * sin( q.y )) * 3.0; // Contrast\r
}\r
void mainImage( out vec4 fragColor, in vec2 fragCoord){\r
	vec2 uv = fragCoord.xy / iResolution.xy;\r
    vec3 col = texture(iChannel0, uv).rgb; \r
    float grey = greyScale(col); \r
    float angle = iMouse.x / iMouse.y * 0.02;\r
    float scale = 0.72 + 0.02 * sin(iTime) * 1.5;\r
    col = vec3(grey * 10.0 - 5.0 + dotScreen(uv, angle, scale));\r
	fragColor = vec4(col, 0.95);\r
}`;const x={props:{size:{type:Number,default:10},destroy:{type:Number,default:1e3},pointer:{type:Object,default:()=>({})}},data(){return{loaded:!1,masked:!1,toggle:this._window.data("touch"),eased:{x:0,y:0}}},mounted(){this.init()},beforeUnmount(){const e=this;setTimeout(()=>{e.renderer&&d.releaseTemporary(e.renderer)},e.destroy)},methods:{async init(){const e=this,r=e.$refs.container,c=e.$refs.border,o=e.$refs.media,t=o.querySelector("img");if(!t)return;e.renderer=d.createTemporary(r,_,{pixelRatio:1.5,useSharedContext:!0});const n=new Image;n.src=t.src,await n.decode(),e.renderer.setImage(0,n,{flipY:!0}),e.renderer.play(),e._window.data("touch")||e.renderer.tick(()=>{if(e.pointer.x===e.pointer.y&&e.pointer.x===e.pointer.y&&e.pointer.x!==0&&e.pointer.y!==0)return;const s=r.getBoundingClientRect();e.eased.x=e.eased.x+(e.pointer.x-e.eased.x)*.1,e.eased.y=e.eased.y+(e.pointer.y-e.eased.y)*.1;const a=e.eased.x-s.left+"px",i=e.eased.y-s.top+"px";c.style.setProperty("clip-path","circle("+e.size+".25% at "+a+" "+i+")"),e.toggle?(o.style.setProperty("clip-path","circle("+e.size+"% at "+a+" "+i+")"),r.style.setProperty("clip-path","none")):(o.style.setProperty("clip-path","none"),r.style.setProperty("clip-path","circle("+e.size+"% at "+a+" "+i+")")),e.masked||(e.masked=!0,u(()=>{e.loaded=!0},24))})}}},w={ref:"media",class:"part-photo_media"},C={ref:"border",class:"part-photo_border --ui-dark"},b={ref:"container",class:"part-photo_container"};function S(e,r,c,o,t,n){return f(),y("button",{class:h(["part-photo",{"--toggle":t.toggle}]),onClick:r[0]||(r[0]=s=>t.toggle=!t.toggle)},[l("div",w,[g(e.$slots,"default")],512),m(l("div",C,null,512),[[v,t.masked&&t.loaded]]),l("div",b,null,512)],2)}const z=p(x,[["render",S]]);export{z as default};
