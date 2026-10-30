;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="48cbad73-6760-a2f8-644e-4898e3d200f4")}catch(e){}}();
(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,887652,895420,591994,e=>{"use strict";var t=e.i(486427),n=e.i(271645),i=e.i(737806),r=e.i(947414);function a(e){let a=(0,r.useConstant)(()=>(0,t.motionValue)(e)),{isStatic:o}=(0,n.useContext)(i.MotionConfigContext);if(o){let[,t]=(0,n.useState)(e);(0,n.useEffect)(()=>a.on("change",t),[])}return a}e.s(["useMotionValue",0,a],887652);var o=e.i(83352),s=e.i(83411),l=e.i(287022);function c(e){return"number"==typeof e?e:parseFloat(e)}var p=e.i(344230),d=e.i(674008);function u(e,t){let n=a(t()),i=()=>n.set(t());return i(),(0,d.useIsomorphicLayoutEffect)(()=>{let t=()=>l.frame.preRender(i,!1,!0),n=e.map(e=>e.on("change",t));return()=>{n.forEach(e=>e()),(0,l.cancelFrame)(i)}}),n}function m(e,n,i,a){if("function"==typeof e){let n;return t.collectMotionValues.current=[],e(),n=u(t.collectMotionValues.current,e),t.collectMotionValues.current=void 0,n}if(void 0!==i&&!Array.isArray(i)&&"function"!=typeof n){var o=e,s=n,l=i,c=a;let t=(0,r.useConstant)(()=>Object.keys(l)),p=(0,r.useConstant)(()=>({}));for(let e of t)p[e]=m(o,s,l[e],c);return p}let d="function"==typeof n?n:function(...e){let t=!Array.isArray(e[0]),n=t?0:-1,i=e[0+n],r=e[1+n],a=e[2+n],o=e[3+n],s=(0,p.interpolate)(r,a,o);return t?s(i):s}(n,i,a),g=Array.isArray(e)?f(e,d):f([e],([e])=>d(e)),h=Array.isArray(e)?void 0:e.accelerate;return h&&!h.isTransformed&&"function"!=typeof n&&Array.isArray(i)&&a?.clamp!==!1&&(g.accelerate={...h,times:n,keyframes:i,isTransformed:!0,...a?.ease?{ease:a.ease}:{}}),g}function f(e,t){let n=(0,r.useConstant)(()=>[]);return u(e,()=>{n.length=0;let i=e.length;for(let t=0;t<i;t++)n[t]=e[t].get();return t(n)})}e.s(["useTransform",0,m],895420),e.s(["useSpring",0,function(e,t={}){return function(e,t={}){let{isStatic:r}=(0,n.useContext)(i.MotionConfigContext),p=()=>(0,s.isMotionValue)(e)?e.get():e;if(r)return m(p);let d=a(p());return(0,n.useInsertionEffect)(()=>(function(e,t,n={}){let i,r=e.get(),a=null,p=r,d="string"==typeof r?r.replace(/[\d.-]/g,""):void 0,u=()=>{a&&(a.stop(),a=null),e.animation=void 0},m=()=>{(()=>{let t=c(e.get()),r=c(p);if(t===r)return u();let s=a?a.getGeneratorVelocity():e.getVelocity();u(),a=new o.JSAnimation({keyframes:[t,r],velocity:s,type:"spring",restDelta:.001,restSpeed:.01,...n,onUpdate:i})})(),e.animation=a??void 0,e.events.animationStart?.notify(),a?.then(()=>{e.animation=void 0,e.events.animationComplete?.notify()})};if(e.attach((e,t)=>{p=e,i=e=>{var n,i;return t((n=e,(i=d)?n+i:n))},l.frame.postRender(m)},u),(0,s.isMotionValue)(t)){let i=!0===n.skipInitialAnimation,r=t.on("change",t=>{var n,r,a,o;i?(i=!1,e.jump((n=t,(r=d)?n+r:n),!1)):e.set((a=t,(o=d)?a+o:a))}),a=e.on("destroy",r);return()=>{r(),a()}}return u})(d,e,t),[d,JSON.stringify(t)]),d}(e,{type:"spring",...t})}],591994)},602702,e=>{e.v({stage:"PerspectiveTunnel-module__pBH_AG__stage",tile:"PerspectiveTunnel-module__pBH_AG__tile"})},804706,e=>{"use strict";var t=e.i(843476),n=e.i(271645),i=e.i(846932),r=e.i(887652),a=e.i(571164),o=e.i(138544),s=e.i(591994),l=e.i(895420);let c={stiffness:60,damping:25,mass:.5},p={stiffness:80,damping:30,restDelta:1e-4};function d({card:e,progress:n,pointer:r,total:a,stage:o}){let s=e.index/a*.44999999999999996,c=(0,l.useTransform)(n,[s,s+.55],[0,1]),p=o.isMobile?-1200:-1700,u=o.isMobile?350:500,m=(0,l.useTransform)(c,[0,1],[p,u]),f=(0,l.useTransform)(c,[0,.18,.82,.98],[0,1,1,0]),g=o.isMobile?Math.max(130,Math.min(180,.38*o.width)):Math.max(180,Math.min(270,.18*o.width)),h=e.angleCos*(o.width*e.radiusFactorX),x=e.angleSin*(o.height*e.radiusFactorY),v=o.isMobile?20:45,b=(0,l.useTransform)([m,r.x,r.y],([t,n,i])=>`translate3d(calc(-50% + ${h-n*v}px), calc(-50% + ${x-i*v}px), ${t}px) rotateZ(${e.rotationZ}deg)`);return(0,t.jsx)(i.motion.div,{className:"pt-card",style:{width:g,transform:b,opacity:f,zIndex:e.index+1},children:(0,t.jsxs)("div",{className:"pt-card__frame",children:[(0,t.jsx)("img",{className:"pt-card__img",src:e.image.src,alt:e.image.title,draggable:!1,decoding:"async"}),(0,t.jsx)("div",{className:"pt-card__shade",children:(0,t.jsx)("span",{className:"pt-card__title",children:e.image.title})})]})})}function u({images:e,eyebrow:f,title:g,description:h,hint:x,autoPlay:v=!1,duration:b=14,className:y,style:w}){var M;let _,j,C,S,k=n.useRef(null),E=function(){a.hasReducedMotionListener.current||(0,o.initPrefersReducedMotion)();let[e]=(0,n.useState)(a.prefersReducedMotion.current);return e}(),A=n.useMemo(()=>e.map((e,t)=>{let n=137.5*t*(Math.PI/180);return{image:e,angleCos:Math.cos(n),angleSin:Math.sin(n),radiusFactorX:.28+t%3*.08,radiusFactorY:.26+t%2*.09,rotationZ:(t%2==0?1:-1)*(3+t%5*2),index:t}}),[e]),[N,I]=n.useState({width:1440,height:900,isMobile:!1});n.useEffect(()=>{let e=k.current,t=()=>{let t=e.clientWidth,n=e.clientHeight;I(e=>e.width===t&&e.height===n?e:{width:t,height:n,isMobile:t<768})};t();let n=new ResizeObserver(t);return n.observe(e),()=>n.disconnect()},[]);let z=(0,r.useMotionValue)(0),L=(0,s.useSpring)(z,p);n.useEffect(()=>{let e=k.current,t=e=>{let t=z.get(),n=Math.min(1,Math.max(0,t+e));return n!==t&&(z.set(n),!0)},n=n=>{if(n.ctrlKey)return;let i=1===n.deltaMode?16:2===n.deltaMode?e.clientHeight:1;t(n.deltaY*i*8e-4)&&n.preventDefault()},i=null,r=e=>{i=1===e.touches.length?e.touches[0].clientY:null},a=e=>{if(null===i||1!==e.touches.length)return;let n=e.touches[0].clientY,r=t((i-n)*.002);i=n,r&&e.cancelable&&e.preventDefault()},o=()=>{i=null};return e.addEventListener("wheel",n,{passive:!1}),e.addEventListener("touchstart",r,{passive:!0}),e.addEventListener("touchmove",a,{passive:!1}),e.addEventListener("touchend",o),e.addEventListener("touchcancel",o),()=>{e.removeEventListener("wheel",n),e.removeEventListener("touchstart",r),e.removeEventListener("touchmove",a),e.removeEventListener("touchend",o),e.removeEventListener("touchcancel",o)}},[z]),n.useEffect(()=>{if(!v||E)return;let e=k.current,t=!1,n=0,i=0,r=e=>{let t=i?Math.min(.1,(e-i)/1e3):0;i=e;let a=z.get()+t/b;a>=1?(z.jump(0),L.jump(0)):z.set(a),n=requestAnimationFrame(r)},a=()=>{cancelAnimationFrame(n),i=0,t&&!document.hidden&&(n=requestAnimationFrame(r))},o=new IntersectionObserver(([e])=>{t=e.isIntersecting,a()});return o.observe(e),document.addEventListener("visibilitychange",a),()=>{o.disconnect(),document.removeEventListener("visibilitychange",a),cancelAnimationFrame(n)}},[v,E,b,z,L]);let T=(M=!E,_=(0,r.useMotionValue)(0),j=(0,r.useMotionValue)(0),C=(0,s.useSpring)(_,c),S=(0,s.useSpring)(j,c),n.useEffect(()=>{if(!M)return;let e=e=>{_.set((e.clientX/window.innerWidth-.5)*2),j.set((e.clientY/window.innerHeight-.5)*2)};return window.addEventListener("pointermove",e,{passive:!0}),()=>window.removeEventListener("pointermove",e)},[M,_,j]),{x:C,y:S}),V=(0,l.useTransform)(L,[0,.5,1],[.7,1,1.35]),R=(0,l.useTransform)(L,[0,.12,.85,1],[.25,1,1,0]),F=(0,l.useTransform)(L,[0,.12],[1,0]),O=Math.min(N.width,N.height)/100,P={perspective:N.isMobile?"900px":"1200px","--pt-vmin":`${O}px`,...w};return(0,t.jsxs)("div",{ref:k,className:"pt-root"+(y?" "+y:""),style:P,children:[(0,t.jsx)("style",{dangerouslySetInnerHTML:{__html:m}}),(0,t.jsx)("div",{className:"pt-grid"}),(0,t.jsx)("div",{className:"pt-glow"}),(0,t.jsx)("div",{className:"pt-ring"}),(0,t.jsx)("div",{className:"pt-ring pt-ring--outer"}),(0,t.jsxs)(i.motion.div,{className:"pt-copy",style:{scale:V,opacity:R},children:[f&&(0,t.jsx)("p",{className:"pt-eyebrow",children:f}),g&&(0,t.jsx)("h1",{className:"pt-title",children:g}),h&&(0,t.jsx)("p",{className:"pt-description",children:h})]}),x&&(0,t.jsxs)(i.motion.div,{className:"pt-hint",style:{opacity:F},children:[(0,t.jsx)("span",{children:x}),(0,t.jsx)("div",{className:"pt-hint__line"})]}),(0,t.jsx)("div",{className:"pt-space",children:A.map(e=>(0,t.jsx)(d,{card:e,progress:L,pointer:T,total:A.length,stage:N},e.index))})]})}let m=`
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
`,f=e=>`https://images.unsplash.com/photo-${e}?auto=format&fit=crop&w=540&h=675&q=75`,g=[{src:f("1618005182384-a83a8bd57fbe"),title:"Croma I"},{src:f("1634017839464-5c339ebe3cb4"),title:"Prisma III"},{src:f("1617791160505-6f00504e3519"),title:"Éter IV"},{src:f("1618556450994-a6a128ef0d9d"),title:"Quantum V"},{src:f("1636955779321-819753cd1741"),title:"Nebulosa VI"},{src:f("1550859492-d5da9d8e45f3"),title:"Ciber VII"},{src:f("1541701494587-cb58502866ab"),title:"Fluxo VIII"},{src:f("1618005198919-d3d4b5a92ead"),title:"Aura IX"},{src:f("1620641788421-7a1c342ea42e"),title:"Croma X"}],h={eyebrow:"Sequência de dobra",title:(0,t.jsxs)(t.Fragment,{children:["RUMO AO",(0,t.jsx)("br",{}),"ÉTER."]}),description:"Role o mouse ou o trackpad para voar pelo corredor 3D.",hint:"Role para explorar"};function x(){return(0,t.jsx)(u,{images:g,...h})}var v=e.i(602702);e.s(["default",0,function({mode:e}){let n="tile"===e;return(0,t.jsx)("div",{className:[v.default.stage,n&&v.default.tile].filter(Boolean).join(" "),"aria-hidden":n||void 0,children:n?(0,t.jsx)(u,{images:g,...h,autoPlay:!0}):(0,t.jsx)(x,{})})}],804706)},876273,function(e){e.n(e.i(804706))}]);

//# debugId=48cbad73-6760-a2f8-644e-4898e3d200f4