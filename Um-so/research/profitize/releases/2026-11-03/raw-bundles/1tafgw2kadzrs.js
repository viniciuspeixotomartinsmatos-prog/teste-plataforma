;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="d7c9b79c-8529-1036-fc1b-85d3f932e040")}catch(e){}}();
(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,887652,895420,591994,e=>{"use strict";var t=e.i(486427),i=e.i(271645),n=e.i(737806),r=e.i(947414);function a(e){let a=(0,r.f)(()=>(0,t.o)(e)),{isStatic:o}=(0,i.useContext)(n.f);if(o){let[,t]=(0,i.useState)(e);(0,i.useEffect)(()=>a.on("change",t),[])}return a}e.s(["f",0,a],887652);var o=e.i(83352),s=e.i(83411),l=e.i(287022);function c(e){return"number"==typeof e?e:parseFloat(e)}var p=e.i(344230),d=e.i(674008);function u(e,t){let i=a(t()),n=()=>i.set(t());return n(),(0,d.f)(()=>{let t=()=>l.y.preRender(n,!1,!0),i=e.map(e=>e.on("change",t));return()=>{i.forEach(e=>e()),(0,l.Y)(n)}}),i}function f(e,i,n,a){if("function"==typeof e){let i;return t.I.current=[],e(),i=u(t.I.current,e),t.I.current=void 0,i}if(void 0!==n&&!Array.isArray(n)&&"function"!=typeof i){var o=e,s=i,l=n,c=a;let t=(0,r.f)(()=>Object.keys(l)),p=(0,r.f)(()=>({}));for(let e of t)p[e]=f(o,s,l[e],c);return p}let d="function"==typeof i?i:function(...e){let t=!Array.isArray(e[0]),i=t?0:-1,n=e[0+i],r=e[1+i],a=e[2+i],o=e[3+i],s=(0,p.f)(r,a,o);return t?s(n):s}(i,n,a),g=Array.isArray(e)?m(e,d):m([e],([e])=>d(e)),h=Array.isArray(e)?void 0:e.accelerate;return h&&!h.isTransformed&&"function"!=typeof i&&Array.isArray(n)&&a?.clamp!==!1&&(g.accelerate={...h,times:i,keyframes:n,isTransformed:!0,...a?.ease?{ease:a.ease}:{}}),g}function m(e,t){let i=(0,r.f)(()=>[]);return u(e,()=>{i.length=0;let n=e.length;for(let t=0;t<n;t++)i[t]=e[t].get();return t(i)})}e.s(["f",0,f],895420),e.s(["f",0,function(e,t={}){return function(e,t={}){let{isStatic:r}=(0,i.useContext)(n.f),p=()=>(0,s.f)(e)?e.get():e;if(r)return f(p);let d=a(p());return(0,i.useInsertionEffect)(()=>(function(e,t,i={}){let n,r=e.get(),a=null,p=r,d="string"==typeof r?r.replace(/[\d.-]/g,""):void 0,u=()=>{a&&(a.stop(),a=null),e.animation=void 0},f=()=>{(()=>{let t=c(e.get()),r=c(p);if(t===r)return u();let s=a?a.getGeneratorVelocity():e.getVelocity();u(),a=new o.f({keyframes:[t,r],velocity:s,type:"spring",restDelta:.001,restSpeed:.01,...i,onUpdate:n})})(),e.animation=a??void 0,e.events.animationStart?.notify(),a?.then(()=>{e.animation=void 0,e.events.animationComplete?.notify()})};if(e.attach((e,t)=>{p=e,n=e=>{var i,n;return t((i=e,(n=d)?i+n:i))},l.y.postRender(f)},u),(0,s.f)(t)){let n=!0===i.skipInitialAnimation,r=t.on("change",t=>{var i,r,a,o;n?(n=!1,e.jump((i=t,(r=d)?i+r:i),!1)):e.set((a=t,(o=d)?a+o:a))}),a=e.on("destroy",r);return()=>{r(),a()}}return u})(d,e,t),[d,JSON.stringify(t)]),d}(e,{type:"spring",...t})}],591994)},602702,e=>{e.v({stage:"pBH_AG_stage",tile:"pBH_AG_tile"})},804706,e=>{"use strict";var t=e.i(843476),i=e.i(271645),n=e.i(846932),r=e.i(887652),a=e.i(571164),o=e.i(138544),s=e.i(591994),l=e.i(895420);let c={stiffness:60,damping:25,mass:.5},p={stiffness:80,damping:30,restDelta:1e-4};function d({card:e,progress:i,pointer:r,total:a,stage:o}){let s=e.index/a*(1-.55),c=(0,l.f)(i,[s,s+.55],[0,1]),p=o.isMobile?-1200:-1700,u=o.isMobile?350:500,f=(0,l.f)(c,[0,1],[p,u]),m=(0,l.f)(c,[0,.18,.82,.98],[0,1,1,0]),g=o.isMobile?Math.max(130,Math.min(180,.38*o.width)):Math.max(180,Math.min(270,.18*o.width)),h=e.angleCos*(o.width*e.radiusFactorX),x=e.angleSin*(o.height*e.radiusFactorY),v=o.isMobile?20:45,b=(0,l.f)([f,r.x,r.y],([t,i,n])=>`translate3d(calc(-50% + ${h-i*v}px), calc(-50% + ${x-n*v}px), ${t}px) rotateZ(${e.rotationZ}deg)`);return(0,t.jsx)(n.f.div,{className:"pt-card",style:{width:g,transform:b,opacity:m,zIndex:e.index+1},children:(0,t.jsxs)("div",{className:"pt-card__frame",children:[(0,t.jsx)("img",{className:"pt-card__img",src:e.image.src,alt:e.image.title,draggable:!1,decoding:"async"}),(0,t.jsx)("div",{className:"pt-card__shade",children:(0,t.jsx)("span",{className:"pt-card__title",children:e.image.title})})]})})}function u({images:e,eyebrow:m,title:g,description:h,hint:x,autoPlay:v=!1,duration:b=14,className:y,style:w}){var j;let M,_,k,E,I=i.useRef(null),N=function(){a.E.current||(0,o.f)();let[e]=(0,i.useState)(a.d.current);return e}(),A=i.useMemo(()=>e.map((e,t)=>{let i=137.5*t*(Math.PI/180);return{image:e,angleCos:Math.cos(i),angleSin:Math.sin(i),radiusFactorX:.28+t%3*.08,radiusFactorY:.26+t%2*.09,rotationZ:(t%2==0?1:-1)*(3+t%5*2),index:t}}),[e]),[S,z]=i.useState({width:1440,height:900,isMobile:!1});i.useEffect(()=>{let e=I.current,t=()=>{let t=e.clientWidth,i=e.clientHeight;z(e=>e.width===t&&e.height===i?e:{width:t,height:i,isMobile:t<768})};t();let i=new ResizeObserver(t);return i.observe(e),()=>i.disconnect()},[]);let C=(0,r.f)(0),L=(0,s.f)(C,p);i.useEffect(()=>{let e=I.current,t=e=>{let t=C.get(),i=Math.min(1,Math.max(0,t+e));return i!==t&&(C.set(i),!0)},i=i=>{if(i.ctrlKey)return;let n=1===i.deltaMode?16:2===i.deltaMode?e.clientHeight:1;t(i.deltaY*n*8e-4)&&i.preventDefault()},n=null,r=e=>{n=1===e.touches.length?e.touches[0].clientY:null},a=e=>{if(null===n||1!==e.touches.length)return;let i=e.touches[0].clientY,r=t((n-i)*.002);n=i,r&&e.cancelable&&e.preventDefault()},o=()=>{n=null};return e.addEventListener("wheel",i,{passive:!1}),e.addEventListener("touchstart",r,{passive:!0}),e.addEventListener("touchmove",a,{passive:!1}),e.addEventListener("touchend",o),e.addEventListener("touchcancel",o),()=>{e.removeEventListener("wheel",i),e.removeEventListener("touchstart",r),e.removeEventListener("touchmove",a),e.removeEventListener("touchend",o),e.removeEventListener("touchcancel",o)}},[C]),i.useEffect(()=>{if(!v||N)return;let e=I.current,t=!1,i=0,n=0,r=e=>{let t=n?Math.min(.1,(e-n)/1e3):0;n=e;let a=C.get()+t/b;a>=1?(C.jump(0),L.jump(0)):C.set(a),i=requestAnimationFrame(r)},a=()=>{cancelAnimationFrame(i),n=0,t&&!document.hidden&&(i=requestAnimationFrame(r))},o=new IntersectionObserver(([e])=>{t=e.isIntersecting,a()});return o.observe(e),document.addEventListener("visibilitychange",a),()=>{o.disconnect(),document.removeEventListener("visibilitychange",a),cancelAnimationFrame(i)}},[v,N,b,C,L]);let F=(j=!N,M=(0,r.f)(0),_=(0,r.f)(0),k=(0,s.f)(M,c),E=(0,s.f)(_,c),i.useEffect(()=>{if(!j)return;let e=e=>{M.set((e.clientX/window.innerWidth-.5)*2),_.set((e.clientY/window.innerHeight-.5)*2)};return window.addEventListener("pointermove",e,{passive:!0}),()=>window.removeEventListener("pointermove",e)},[j,M,_]),{x:k,y:E}),R=(0,l.f)(L,[0,.5,1],[.7,1,1.35]),T=(0,l.f)(L,[0,.12,.85,1],[.25,1,1,0]),O=(0,l.f)(L,[0,.12],[1,0]),V=Math.min(S.width,S.height)/100,Y={perspective:S.isMobile?"900px":"1200px","--pt-vmin":`${V}px`,...w};return(0,t.jsxs)("div",{ref:I,className:"pt-root"+(y?" "+y:""),style:Y,children:[(0,t.jsx)("style",{dangerouslySetInnerHTML:{__html:f}}),(0,t.jsx)("div",{className:"pt-grid"}),(0,t.jsx)("div",{className:"pt-glow"}),(0,t.jsx)("div",{className:"pt-ring"}),(0,t.jsx)("div",{className:"pt-ring pt-ring--outer"}),(0,t.jsxs)(n.f.div,{className:"pt-copy",style:{scale:R,opacity:T},children:[m&&(0,t.jsx)("p",{className:"pt-eyebrow",children:m}),g&&(0,t.jsx)("h1",{className:"pt-title",children:g}),h&&(0,t.jsx)("p",{className:"pt-description",children:h})]}),x&&(0,t.jsxs)(n.f.div,{className:"pt-hint",style:{opacity:O},children:[(0,t.jsx)("span",{children:x}),(0,t.jsx)("div",{className:"pt-hint__line"})]}),(0,t.jsx)("div",{className:"pt-space",children:A.map(e=>(0,t.jsx)(d,{card:e,progress:L,pointer:F,total:A.length,stage:S},e.index))})]})}let f=`
/* o que o projeto pode trocar com uma classe (largura, altura, margem): na camada base, que vem antes das classes de
   componente e dos utilit\xe1rios (Tailwind v4) e perde para o CSS fora de camada (Tailwind v3, CSS Modules, CSS comum) */
@layer base {
  .pt-root { position: relative; width: 100%; height: 100svh; margin: 0; }
}
.pt-root {
  container-type: inline-size;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  overflow: hidden;
  transform-style: preserve-3d;
  background: #0a0a0a;
  color: #fff;
  font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
  font-style: normal;
  font-feature-settings: normal;
  letter-spacing: normal;
  text-align: center;
  -webkit-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.pt-root *, .pt-root *::before, .pt-root *::after { box-sizing: border-box; }

.pt-grid {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(#1e1b4b 1px, transparent 1px);
  background-size: 28px 28px;
  -webkit-mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, #000 60%, transparent 100%);
  mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, #000 60%, transparent 100%);
  opacity: .65;
  pointer-events: none;
}
.pt-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(99, 102, 241, .2) 0%, transparent 75%);
  pointer-events: none;
}
.pt-ring {
  position: absolute;
  width: calc(48 * var(--pt-vmin));
  height: calc(48 * var(--pt-vmin));
  border: 1px solid rgba(129, 140, 248, .1);
  border-radius: 50%;
  pointer-events: none;
}
.pt-ring--outer {
  width: calc(76 * var(--pt-vmin));
  height: calc(76 * var(--pt-vmin));
  border: 1px dashed rgba(255, 255, 255, .1);
}

.pt-copy {
  position: relative;
  z-index: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 36rem;
  padding: 0 24px;
  pointer-events: none;
}
.pt-eyebrow {
  margin: 0 0 16px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 12px;
  line-height: 16px;
  letter-spacing: .4em;
  text-transform: uppercase;
  color: #818cf8;
}
.pt-title {
  margin: 0;
  font-size: 48px;
  font-weight: 700;
  line-height: .9;
  letter-spacing: -.05em;
  background: linear-gradient(to bottom, #fff, #fff, rgba(255, 255, 255, .4));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}
.pt-description {
  max-width: 36ch;
  margin: 16px 0 0;
  font-size: 14px;
  font-weight: 300;
  line-height: 20px;
  color: #a3a3a3;
}

.pt-hint {
  position: absolute;
  bottom: 32px;
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 12px;
  line-height: 16px;
  letter-spacing: .3em;
  text-transform: uppercase;
  color: #a3a3a3;
  pointer-events: none;
}
.pt-hint__line { width: 1px; height: 24px; background: linear-gradient(to bottom, #6366f1, transparent); }

.pt-space { position: absolute; inset: 0; transform-style: preserve-3d; pointer-events: none; }
.pt-card {
  position: absolute;
  left: 50%;
  top: 50%;
  aspect-ratio: 4 / 5;
  will-change: transform;
  pointer-events: auto;
}
.pt-card__frame {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 16px;
  background: #171717;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, .15), 0 25px 50px -12px rgba(0, 0, 0, .9);
  transition: box-shadow .5s cubic-bezier(.4, 0, .2, 1);
}
.pt-card__frame:hover { box-shadow: 0 0 0 1px rgba(129, 140, 248, .7), 0 25px 50px -12px rgba(99, 102, 241, .25); }
.pt-card__img {
  display: block;
  width: 100%;
  height: 100%;
  max-width: none;
  object-fit: cover;
  transition: transform .7s cubic-bezier(0, 0, .2, 1);
  -webkit-user-drag: none;
}
.pt-card__frame:hover .pt-card__img { transform: scale(1.1); }
.pt-card__shade {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  padding: 16px;
  background: linear-gradient(to top, rgba(0, 0, 0, .8), rgba(0, 0, 0, .1), transparent);
}
.pt-card__title {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 12px;
  line-height: 16px;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, .95);
  filter: drop-shadow(0 4px 3px rgba(0, 0, 0, .07)) drop-shadow(0 2px 2px rgba(0, 0, 0, .06));
}

/* os tamanhos seguem a largura do hero, n\xe3o a da tela */
@container (min-width: 640px) {
  .pt-title { font-size: 72px; }
  .pt-description { font-size: 16px; line-height: 24px; }
  .pt-card__shade { padding: 20px; }
  .pt-card__title { font-size: 14px; line-height: 20px; }
}
@container (min-width: 768px) {
  .pt-title { font-size: 96px; }
}
`,m=e=>`https://images.unsplash.com/photo-${e}?auto=format&fit=crop&w=540&h=675&q=75`,g=[{src:m("1618005182384-a83a8bd57fbe"),title:"Croma I"},{src:m("1634017839464-5c339ebe3cb4"),title:"Prisma III"},{src:m("1617791160505-6f00504e3519"),title:"Éter IV"},{src:m("1618556450994-a6a128ef0d9d"),title:"Quantum V"},{src:m("1636955779321-819753cd1741"),title:"Nebulosa VI"},{src:m("1550859492-d5da9d8e45f3"),title:"Ciber VII"},{src:m("1541701494587-cb58502866ab"),title:"Fluxo VIII"},{src:m("1618005198919-d3d4b5a92ead"),title:"Aura IX"},{src:m("1620641788421-7a1c342ea42e"),title:"Croma X"}],h={eyebrow:"Sequência de dobra",title:(0,t.jsxs)(t.Fragment,{children:["RUMO AO",(0,t.jsx)("br",{}),"ÉTER."]}),description:"Role o mouse ou o trackpad para voar pelo corredor 3D.",hint:"Role para explorar"};function x(){return(0,t.jsx)(u,{images:g,...h})}var v=e.i(602702);e.s(["default",0,function({mode:e}){let i="tile"===e;return(0,t.jsx)("div",{className:[v.default.stage,i&&v.default.tile].filter(Boolean).join(" "),"aria-hidden":i||void 0,children:i?(0,t.jsx)(u,{images:g,...h,autoPlay:!0}):(0,t.jsx)(x,{})})}],804706)},876273,function(e){e.n(e.i(804706))}]);

//# debugId=d7c9b79c-8529-1036-fc1b-85d3f932e040