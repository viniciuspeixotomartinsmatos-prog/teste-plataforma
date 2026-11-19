;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="1678ae8e-fea5-83e4-5710-dcfe29809cfb")}catch(e){}}();
(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,428339,e=>{e.v({stage:"WorksWheel-module__IzWrRq__stage",tile:"WorksWheel-module__IzWrRq__tile"})},852315,e=>{"use strict";var t=e.i(843476),r=e.i(271645);let a=(e,t,r)=>Math.min(r,Math.max(t,e)),n=(e,t,r)=>e+(t-e)*r,i=r.useLayoutEffect;function o({items:e,label:s="Obras '26",action:c="Ver",theme:d="dark",autoPlay:u=!1,interval:w=1800,className:h,...m}){let f=r.useId(),p=r.useRef(null),g=r.useRef(null),b=r.useRef([]),x=r.useRef(null),v=r.useRef(null),y=r.useRef(0),M=r.useRef(0),k=r.useRef(()=>{}),[j,R]=r.useState(0),[z,S]=r.useState({w:0,h:0}),T=r.useRef(null),C=r.useRef(!1),E=r.useRef(!1),I=e.length,N=Math.max(I-1,0),[P,$]=r.useState(!1);r.useEffect(()=>{let e=window.matchMedia("(prefers-reduced-motion: reduce)"),t=()=>$(e.matches);return t(),e.addEventListener("change",t),()=>e.removeEventListener("change",t)},[]),r.useEffect(()=>{let e=p.current;if(!e)return;let t=()=>S({w:e.clientWidth,h:e.clientHeight});t();let r=new ResizeObserver(t);return r.observe(e),()=>r.disconnect()},[]);let q=r.useMemo(()=>{let{w:e,h:t}=z,r=Math.min(.38*t*1.45,.34*e),n=r/1.45,i=1.14*n,o=I?a(2*Math.PI*i/I*.82/(r||1),.16,1):1;return{cardW:r,cardH:n,ringR:i,ringScale:o,drumR:2.22*n,bow:1.82*n,depth:2.7*n,title:Math.max(.124*n,16),index:Math.max(.04*n,11)}},[z,I]);i(()=>{if(!z.h)return;let{ringR:e,ringScale:t,drumR:r,bow:i}=q,o=0,l=0,s=()=>{let o=y.current,l=a(o,0,1),s=Math.max(0,o-1);g.current&&(g.current.style.transform=`translateZ(${-l*r}px)`);for(let a=0;a<I;a++){var c,d;let o=b.current[a];if(!o)continue;let u=a-s;o.style.transform=(c=360/I*u,d=40*u,`translateX(${-i*(1-Math.cos(d*Math.PI/180))*l}px) rotateZ(${(1-l)*c}deg) translateY(${-(1-l)*e}px) rotateX(${l*d}deg) translateZ(${l*r}px)`);let w=l>.5&&Math.abs(u)>1.6;o.style.opacity=w?"0":"1",o.style.visibility=w?"hidden":"",o.style.zIndex=String(Math.round(100-2*Math.abs(u)));let h=o.firstElementChild;h&&(h.style.transform=`scale(${n(t,1,l)})`)}return x.current&&(x.current.style.opacity=String(1-l)),v.current&&(v.current.style.opacity=String(l)),a(Math.round(s),0,N)},c=e=>{o=0;let t=l?Math.min((e-l)/1e3,.1):1/60;l=e;let r=M.current-y.current;5e-4>Math.abs(r)?y.current=M.current:y.current+=r*(P?1:1-Math.pow(.88,60*t));let a=s();R(e=>e===a?e:a),y.current!==M.current?o=requestAnimationFrame(c):l=0};return k.current=()=>{o||(o=requestAnimationFrame(c))},s(),k.current(),()=>{cancelAnimationFrame(o),k.current=()=>{}}},[q,z.h,I,N,P]);let Y=r.useCallback(e=>{M.current=a(e,0,N+1),k.current()},[N]);return r.useEffect(()=>{let e=p.current;if(!e)return;let t=0,r=null,a=a=>{let n=1===a.deltaMode?16*a.deltaY:2===a.deltaMode?a.deltaY*e.clientHeight:a.deltaY,i=M.current+n/900;i>0&&i<N+1&&a.preventDefault(),E.current=!0,null===r&&(r=Math.round(M.current)),Y(i),window.clearTimeout(t),t=window.setTimeout(()=>{let e=r??0,t=M.current-e,a=Math.round(M.current);r=null,t>.04?Y(Math.max(a,e+1)):t<-.04?Y(Math.min(a,e-1)):Y(a)},140)};return e.addEventListener("wheel",a,{passive:!1}),()=>{e.removeEventListener("wheel",a),window.clearTimeout(t)}},[Y,N]),r.useEffect(()=>{let e=p.current;if(!e||!u||P||!I)return;let t=0,r=e=>0===e?1.5*w:w,a=()=>{if(E.current)return;let e=Math.round(M.current),n=e>=N+1?0:e+1;Y(n),t=window.setTimeout(a,r(n))},n=new IntersectionObserver(e=>{window.clearTimeout(t),e[e.length-1].isIntersecting&&!E.current&&(t=window.setTimeout(a,r(Math.round(M.current))))});return n.observe(e),()=>{n.disconnect(),window.clearTimeout(t)}},[u,P,I,N,w,Y]),(0,t.jsxs)("section",{"aria-label":s,className:"ww-root"+(h?" "+h:""),"data-theme":d,...m,children:[(0,t.jsx)("style",{dangerouslySetInnerHTML:{__html:l}}),(0,t.jsx)("div",{ref:p,tabIndex:0,role:"listbox","aria-label":s,"aria-activedescendant":I?`${f}-${j}`:void 0,className:"ww-stage",style:{perspective:`${q.depth}px`},onPointerDown:e=>{if(0!==e.button)return;let t=Math.max(.45*e.currentTarget.getBoundingClientRect().height,1);T.current={id:e.pointerId,y:e.clientY,start:e.clientY,px:t,from:Math.round(M.current),moved:!1},C.current=!1},onPointerMove:e=>{let t=T.current;if(t&&t.id===e.pointerId){if(!t.moved){if(4>Math.abs(e.clientY-t.start))return;t.moved=!0,C.current=!0,E.current=!0,e.currentTarget.setPointerCapture(e.pointerId)}Y(M.current+(t.y-e.clientY)/t.px),t.y=e.clientY}},onPointerUp:e=>{let t=T.current;if(!t||t.id!==e.pointerId||(T.current=null,!t.moved))return;let r=M.current-t.from,a=Math.round(M.current);r>.1?Y(Math.max(a,t.from+1)):r<-.1?Y(Math.min(a,t.from-1)):Y(a),window.setTimeout(()=>C.current=!1,0)},onPointerCancel:()=>{T.current?.moved&&Y(Math.round(M.current)),T.current=null,C.current=!1},onClickCapture:e=>{C.current&&(C.current=!1,e.preventDefault(),e.stopPropagation())},onKeyDown:e=>{let t=Math.round(M.current);if("ArrowDown"===e.key)Y(t+1);else if("ArrowUp"===e.key)Y(t-1);else if("Home"===e.key)Y(0);else if("End"===e.key)Y(N+1);else{if("Enter"!==e.key||!(t>=1))return;b.current[t-1]?.click()}E.current=!0,e.preventDefault()},children:(0,t.jsx)("div",{ref:g,className:"ww-wheel",children:e.map((e,r)=>{let a={id:`${f}-${r}`,role:"option","aria-selected":r===j,className:"ww-card",style:{width:q.cardW,height:q.cardH,marginLeft:-q.cardW/2,marginTop:-q.cardH/2},ref:e=>{b.current[r]=e},onClick:e=>{Math.round(M.current)!==r+1&&(e.preventDefault(),E.current=!0,Y(r+1))}},n=(0,t.jsxs)("span",{className:"ww-face",children:[(0,t.jsx)("img",{src:e.image,alt:e.alt??e.title,draggable:!1,decoding:"async",className:"ww-img"}),c&&e.href?(0,t.jsxs)("span",{className:"ww-action","aria-hidden":"true",children:[(0,t.jsx)("svg",{viewBox:"0 0 12 12",focusable:"false",children:(0,t.jsx)("path",{d:"M3 9 9 3M4 3h5v5",fill:"none",stroke:"currentColor",strokeWidth:"1.4",strokeLinecap:"round",strokeLinejoin:"round"})}),c]}):null]});return e.href?(0,t.jsx)("a",{href:e.href,tabIndex:-1,draggable:!1,...a,children:n},r):(0,t.jsx)("div",{...a,children:n},r)})})}),(0,t.jsx)("div",{ref:x,className:"ww-label",style:{fontSize:q.title},children:s}),(0,t.jsx)("div",{ref:v,className:"ww-title",style:{fontSize:q.title},children:e[j]?.title}),(0,t.jsx)("ol",{className:"ww-index",style:{fontSize:q.index},children:e.map((e,r)=>(0,t.jsx)("li",{children:(0,t.jsx)("button",{type:"button","aria-current":r===j||void 0,onClick:()=>{E.current=!0,Y(r+1)},children:e.title})},r))})]})}let l=`
/* o que o projeto pode trocar com uma classe (altura, largura, margem): na camada base, que vem antes das classes de
   componente e dos utilit\xe1rios (Tailwind v4) e perde para o CSS fora de camada (Tailwind v3, CSS Modules, CSS comum) */
@layer base {
  .ww-root { position: relative; width: 100%; height: 100%; min-height: 24rem; margin: 0; }
}
.ww-root[hidden] { display: none; }
.ww-root {
  --ww-bg: #0a0a0a;
  --ww-fg: #fafafa;
  --ww-muted: #a1a1aa;
  --ww-card: #27272a;
  --ww-shadow: rgba(250, 250, 250, .12);
  --ww-chip: rgba(10, 10, 10, .85);
  box-sizing: border-box;
  overflow: hidden;
  isolation: isolate;
  background: var(--ww-bg);
  color: var(--ww-fg);
  /* nada de texto herdado da p\xe1gina: a roda fica igual em qualquer projeto */
  font-family: ui-sans-serif, system-ui, -apple-system, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  font-variant: normal;
  font-feature-settings: normal;
  font-variation-settings: normal;
  line-height: 1.5;
  letter-spacing: normal;
  word-spacing: normal;
  text-align: left;
  text-transform: none;
  text-indent: 0;
  text-shadow: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.ww-root[data-theme="light"] {
  --ww-bg: #ffffff;
  --ww-fg: #0a0a0a;
  --ww-muted: #71717a;
  --ww-card: #f4f4f5;
  --ww-shadow: rgba(10, 10, 10, .12);
  --ww-chip: rgba(255, 255, 255, .85);
}
.ww-root *, .ww-root *::before, .ww-root *::after { box-sizing: border-box; }

/* a roda: pega a rolagem, o arraste na vertical (o dedo na horizontal continua rolando a p\xe1gina para o lado) e o teclado */
.ww-stage {
  position: absolute;
  inset: 0;
  margin: 0;
  cursor: grab;
  touch-action: pan-x;
  outline: none;
}
.ww-stage:active { cursor: grabbing; }
.ww-stage:focus-visible { outline: 2px solid var(--ww-fg); outline-offset: -4px; }
.ww-wheel { position: absolute; top: 50%; left: 50%; margin: 0; transform-style: preserve-3d; }

.ww-card {
  position: absolute;
  top: 0;
  left: 0;
  display: block;
  margin: 0;
  padding: 0;
  color: inherit;
  text-decoration: none;
  outline: none;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  -webkit-user-drag: none;
}
.ww-face {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 8px;
  background: var(--ww-card);
  box-shadow: 0 18px 40px -18px var(--ww-shadow);
}
.ww-img {
  display: block;
  width: 100%;
  height: 100%;
  max-width: none;
  margin: 0;
  object-fit: cover;
  -webkit-user-drag: none;
}

/* o selo do hover, embaixo \xe0 direita do cart\xe3o com link */
.ww-action {
  position: absolute;
  right: 12px;
  bottom: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0;
  padding: 4px 10px;
  border-radius: 9999px;
  background: var(--ww-chip);
  color: var(--ww-fg);
  font-size: .7rem;
  line-height: 1.5;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transform: translateY(4px);
  transition: opacity .15s cubic-bezier(.4, 0, .2, 1), transform .15s cubic-bezier(.4, 0, .2, 1);
}
.ww-action svg { display: block; flex-shrink: 0; width: 10px; height: 10px; }
@media (hover: hover) {
  .ww-card:hover .ww-action { opacity: 1; transform: translateY(0); }
}

/* o t\xedtulo do anel, no centro, e o da pe\xe7a da frente, \xe0 esquerda dela */
.ww-label {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  margin: 0;
  letter-spacing: -.025em;
  white-space: nowrap;
  pointer-events: none;
}
.ww-title {
  position: absolute;
  top: 50%;
  left: 8%;
  margin: 0;
  letter-spacing: -.025em;
  white-space: nowrap;
  opacity: 0;
  transform: translateY(-50%);
  pointer-events: none;
}

/* a lista, no alto \xe0 direita */
.ww-index {
  position: absolute;
  top: 7.5%;
  right: 2.5%;
  margin: 0;
  padding: 0;
  list-style: none;
  text-align: right;
  line-height: 1.75;
  color: var(--ww-muted);
}
.ww-index li { margin: 0; padding: 0; }
.ww-index button {
  display: inline;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: none;
  color: inherit;
  font: inherit;
  letter-spacing: inherit;
  text-align: inherit;
  text-transform: none;
  cursor: pointer;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  transition: color .15s cubic-bezier(.4, 0, .2, 1);
}
.ww-index button[aria-current] { color: var(--ww-fg); font-weight: 500; }
.ww-index button:focus-visible { outline: 1px solid var(--ww-fg); }

@media (prefers-reduced-motion: reduce) {
  .ww-root, .ww-root * { transition-duration: .01ms !important; }
}
`,s=e=>`https://images.unsplash.com/photo-${e}?auto=format&fit=crop&w=1000&h=690&q=75`,c=[{title:"Prisma",image:s("1636955779321-819753cd1741"),alt:"Formas fluidas em degradê de arco-íris",href:"#prisma"},{title:"Brasa",image:s("1541701494587-cb58502866ab"),alt:"Tinta vermelha e azul se espalhando na água",href:"#brasa"},{title:"Nebulosa",image:s("1462331940025-496dfbfc7564"),alt:"Nebulosa em bolha entre as estrelas",href:"#nebulosa"},{title:"Espiral",image:s("1617791160505-6f00504e3519"),alt:"Espiral de lâminas em azul e violeta",href:"#espiral"},{title:"Órbita",image:s("1618005198919-d3d4b5a92ead"),alt:"Esfera clara sobre ondas em tons pastel",href:"#orbita"},{title:"Neon",image:s("1519608487953-e999c86e7455"),alt:"Rua da cidade à noite sob luz roxa",href:"#neon"},{title:"Mármore",image:s("1549490349-8643362247b5"),alt:"Mármore líquido em magenta e branco",href:"#marmore"},{title:"Decolagem",image:s("1614728263952-84ea256f9679"),alt:"Ônibus espacial subindo entre nuvens de fumaça",href:"#decolagem"},{title:"Maré",image:s("1634017839464-5c339ebe3cb4"),alt:"Ondas de linhas finas em azul",href:"#mare"}];function d(){return(0,t.jsx)("main",{style:{height:"100svh",margin:0,background:"#0a0a0a"},children:(0,t.jsx)(o,{items:c,label:"Obras '26",action:"Ver"})})}var u=e.i(428339);let w=c.map(e=>({...e,href:void 0}));e.s(["default",0,function({mode:e}){let a="tile"===e,n=(0,r.useRef)(null);return(0,r.useEffect)(()=>{a&&n.current?.querySelectorAll("[tabindex], a, button").forEach(e=>e.tabIndex=-1)},[a]),(0,t.jsx)("div",{ref:n,className:[u.default.stage,a&&u.default.tile].filter(Boolean).join(" "),"aria-hidden":a||void 0,onClickCapture:e=>{e.target.closest('a[href^="#"]')&&e.preventDefault()},children:a?(0,t.jsx)(o,{items:w,label:"Obras '26",autoPlay:!0}):(0,t.jsx)(d,{})})}],852315)},454168,function(e){e.n(e.i(852315))}]);

//# debugId=1678ae8e-fea5-83e4-5710-dcfe29809cfb