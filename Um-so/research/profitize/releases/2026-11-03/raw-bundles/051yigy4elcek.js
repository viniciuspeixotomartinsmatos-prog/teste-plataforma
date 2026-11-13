;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="2a7923f2-fc48-9ba9-59fb-9153c2d37375")}catch(e){}}();
(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,475545,e=>{e.v({compact:"msxs3a_compact",cursor:"msxs3a_cursor",stage:"msxs3a_stage",tile:"msxs3a_tile"})},372879,e=>{"use strict";var t=e.i(843476),a=e.i(271645),r=e.i(93209),i=e.i(174080);let n={add:"Adicionar ao pedido",close:"Fechar",previous:"Prato anterior",next:"Próximo prato",pause:"Pausar a esteira"};function s(e,t,a){return Math.max(t,Math.min(a,e))}function o(e){return s(Math.round(e??1),1,5)}function l(e,t){let{s:a,r}=e,i=(t%e.l+e.l)%e.l;if(i<a)return{x:a/2-i,z:r,nx:0,nz:1,tx:-1,tz:0};let n=Math.PI*r;if((i-=a)<n){let e=i/r,t=Math.sin(e),n=Math.cos(e);return{x:-a/2-r*t,z:r*n,nx:-t,nz:n,tx:-n,tz:-t}}if((i-=n)<a)return{x:-a/2+i,z:-r,nx:0,nz:-1,tx:1,tz:0};let s=Math.min(Math.PI,(i-=a)/r),o=Math.sin(s),l=Math.cos(s);return{x:a/2+r*o,z:-r*l,nx:o,nz:-l,tx:l,tz:o}}function c(e,t,a){let r=e.a+e.b*a;return{x:e.cx+t*r,y:e.ym+.8*(e.a*a+e.b*a*a/2),k:r}}function d(e,t,a,r){let i=1.35*Math.max(1,t)*a,n=Math.min(.95*a,i/(2*Math.PI)),s=Math.max(0,(i-2*Math.PI*n)/2),o={width:e,height:0,d:a,r:n,s,l:i,pitch:i/Math.max(1,t),n:Math.max(1,t),kb:r,cx:e/2,ym:0,a:(1+r)/2,b:(1-r)/(2*n),band:1.22*a,slats:Math.max(10,Math.round(i/(.34*a))),side:Math.max(3,.07*a),edgeTop:0},d=1/0,u=-1/0,m=1/0;for(let e=0;e<120;e++){let t=l(o,e/120*i),r=c(o,t.x+t.nx*o.band/2,t.z+t.nz*o.band/2),n=c(o,t.x,t.z),s=n.k*a*.8/2;m=Math.min(m,r.y),d=Math.min(d,r.y,n.y+-.06*s*2-1.08*s-34),u=Math.max(u,r.y+o.side+.06*a,n.y+s+.08*a)}return o.ym=Math.ceil(-d)+2,o.height=Math.ceil(u-d)+4,o.edgeTop=m+o.ym,o}function u(e,t){let a="";for(let r=0;r<168;r++){let i=l(e,r/168*e.l),n=c(e,i.x+i.nx*t,i.z+i.nz*t);a+=`${r?"L":"M"}${n.x.toFixed(1)} ${n.y.toFixed(1)}`}return`${a}Z`}function m(e,t,a){let r=.46*e.band,i=e.l/e.slats,n=.2*i,s="";for(let o=0;o<e.slats;o++){let d=l(e,t+a+o*i),u=c(e,d.x-d.nx*r,d.z-d.nz*r),m=c(e,d.x+d.nx*r,d.z+d.nz*r),p=c(e,d.x+d.tx*n,d.z+d.tz*n);s+=`M${u.x.toFixed(1)} ${u.y.toFixed(1)}Q${(2*p.x-(u.x+m.x)/2).toFixed(1)} ${(2*p.y-(u.y+m.y)/2).toFixed(1)} ${m.x.toFixed(1)} ${m.y.toFixed(1)}`}return s}function p(e,t,a){let r=l(e,t-a*e.pitch),i=c(e,r.x,r.z);return{x:i.x,y:i.y,k:i.k,depth:(r.z+e.r)/(2*e.r)}}function x(e,t){return(Math.round((t-e.s/2)/e.pitch)%e.n+e.n)%e.n}function h(e){return String(e).padStart(2,"0")}function f(e){return e&&e.offsetWidth&&e.getBoundingClientRect().width/e.offsetWidth||1}function g({uid:e,item:r,index:n,total:s,labels:l,reduced:c,theme:d,broken:u,host:m,source:p,onLift:x,onAdd:f,onClose:b}){let v=a.useRef(null),y=a.useRef(null),w=a.useRef(null),k=a.useRef(0),j=a.useRef(!1),[M]=a.useState(m),[$,z]=a.useState(!1),[C,N]=a.useState(!1),R=`${e}-dish-title`,S=o(r.tier);a.useLayoutEffect(()=>{let e=y.current,t=p();w.current?.focus({preventScroll:!0});let a=document.body.style.overflow;document.body.style.overflow="hidden",x(!0);let r=null;if(e&&t&&!c&&t.width>0){let a=e.getBoundingClientRect(),i=t.width/a.width,n=t.height/a.height,s=t.left+t.width/2-(a.left+a.width/2),o=t.top+t.height/2-(a.top+a.height/2),l=Math.min(120,.3*Math.abs(o)+40);r=e.animate([{transform:`translate(${s}px, ${o}px) scale(${i}, ${n})`},{transform:`translate(${.42*s}px, ${.42*o-l}px) scale(${(i+1)/2*1.05}, ${(n+1)/2*1.05}) rotate(${s>0?-6:6}deg)`,offset:.5},{transform:"none"}],{duration:680,easing:"cubic-bezier(.22,.85,.3,1)"})}let i=requestAnimationFrame(()=>z(!0));return()=>{cancelAnimationFrame(i),r?.cancel(),window.clearTimeout(k.current),document.body.style.overflow=a,x(!1)}},[p,c,x]);let F=a.useCallback(()=>{if(j.current)return;j.current=!0,z(!1);let e=y.current,t=p();if(!e||!t||c||0===t.width)return void b();let a=e.getBoundingClientRect(),r=t.width/a.width,i=t.height/a.height,n=t.left+t.width/2-(a.left+a.width/2),s=t.top+t.height/2-(a.top+a.height/2);e.animate([{transform:"none"},{transform:`translate(${.58*n}px, ${.58*s-36}px) scale(${(r+1)/2}, ${(i+1)/2})`,offset:.55},{transform:`translate(${n}px, ${s}px) scale(${r}, ${i})`}],{duration:540,easing:"cubic-bezier(.45,0,.55,1)",fill:"forwards"}).onfinish=()=>b()},[p,c,b]);return a.useEffect(()=>{let e=e=>{let t=v.current;if(!(!t||t.contains(e.target))){if("Escape"===e.key)e.preventDefault(),F();else if("Tab"===e.key){let a=t.querySelector("button");a&&(e.preventDefault(),a.focus())}}};return document.addEventListener("keydown",e),()=>document.removeEventListener("keydown",e)},[F]),(0,i.createPortal)((0,t.jsxs)("div",{ref:v,role:"dialog","aria-modal":"true","aria-labelledby":R,"data-dish-dialog":!0,"data-scm-theme":d,"data-shown":$||void 0,className:"scm-dialog",onKeyDown:e=>{if("Escape"===e.key){e.preventDefault(),F();return}if("Tab"!==e.key)return;let t=[...v.current?.querySelectorAll("button")??[]].filter(e=>!e.disabled),a=t[0],r=t.at(-1);a&&r&&(e.shiftKey&&document.activeElement===a?(e.preventDefault(),r.focus()):e.shiftKey||document.activeElement!==r||(e.preventDefault(),a.focus()))},children:[(0,t.jsx)("div",{"aria-hidden":"true",className:"scm-dialog-backdrop",onClick:F}),(0,t.jsxs)("div",{className:"scm-dialog-panel",children:[(0,t.jsx)("div",{"aria-hidden":"true",className:"scm-dialog-card"}),(0,t.jsxs)("button",{ref:w,type:"button",onClick:F,className:"scm-dialog-close",children:[l.close,(0,t.jsx)("svg",{"aria-hidden":"true",viewBox:"0 0 16 16",fill:"none",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round",children:(0,t.jsx)("path",{d:"M3.5 3.5l9 9M12.5 3.5l-9 9"})})]}),(0,t.jsxs)("div",{ref:y,"data-dish-figure":!0,className:"scm-figure",children:[(0,t.jsx)("span",{"aria-hidden":"true",className:"scm-figure-shadow"}),u?(0,t.jsx)("span",{"aria-hidden":"true",className:"scm-figure-broken",children:(0,t.jsx)("span",{})}):(0,t.jsx)("img",{src:r.image,alt:r.name,draggable:!1,className:"scm-figure-img"}),(0,t.jsx)("span",{"aria-hidden":"true",className:"scm-figure-ring","data-tier":S})]}),(0,t.jsxs)("div",{className:"scm-info",children:[(0,t.jsxs)("p",{className:"scm-info-count",children:[(0,t.jsx)("span",{"aria-hidden":"true",className:"scm-dot","data-tier":S}),h(n+1)," / ",h(s)]}),(0,t.jsx)("h3",{id:R,className:"scm-info-title",children:r.name}),r.description&&(0,t.jsx)("p",{className:"scm-info-text",children:r.description}),r.details&&r.details.length>0&&(0,t.jsx)("ul",{className:"scm-info-details",children:r.details.map(e=>(0,t.jsx)("li",{children:e},e))}),(0,t.jsxs)("div",{className:"scm-info-buy",children:[(0,t.jsx)("p",{className:"scm-info-price",children:r.price}),(0,t.jsxs)("button",{type:"button","data-add":!0,onClick:()=>{C||j.current||(f(),N(!0),k.current=window.setTimeout(F,450*!c))},className:"scm-cta",children:[C?(0,t.jsx)("svg",{"aria-hidden":"true",viewBox:"0 0 16 16",fill:"none",stroke:"currentColor",strokeWidth:"1.9",strokeLinecap:"round",strokeLinejoin:"round",children:(0,t.jsx)("path",{d:"M3.5 8.5l3 3 6-7"})}):(0,t.jsx)("svg",{"aria-hidden":"true",viewBox:"0 0 16 16",fill:"none",stroke:"currentColor",strokeWidth:"1.8",strokeLinecap:"round",children:(0,t.jsx)("path",{d:"M8 3.5v9M3.5 8h9"})}),l.add]})]})]})]})]}),M)}let b=Number(a.version.split(".")[0])>=19;function v(){return b?(0,t.jsx)("style",{href:"sushi-conveyor-menu",precedence:"default",children:y}):(0,t.jsx)("style",{hidden:!0,dangerouslySetInnerHTML:{__html:y}})}let y=`
/* o que o projeto pode trocar com uma classe (posi\xe7\xe3o, margem, fundo): na camada base, que vem antes das classes de
   componente e dos utilit\xe1rios (Tailwind v4, Panda, Chakra) e perde para o CSS fora de camada (Tailwind v3, CSS Modules,
   CSS comum) */
@layer base {
  .scm-root { position: relative; width: 100%; margin: 0; background: var(--scm-bg); }
}

/* as cores: claro de f\xe1brica, escuro com theme="dark". O di\xe1logo aberto sai da esteira (ele vai para o body ou para o
   <dialog> em volta), ent\xe3o leva as mesmas vari\xe1veis; um elemento seu com data-scm-theme tamb\xe9m as recebe. As faixas de
   pre\xe7o s\xe3o as cores 1 a 5 dos gr\xe1ficos do shadcn */
[data-scm-theme] {
  --scm-bg: #ffffff;
  --scm-fg: #0a0a0a;
  --scm-muted: #737373;
  --scm-muted-bg: #f5f5f5;
  --scm-card: #ffffff;
  --scm-card-fg: #0a0a0a;
  --scm-border: #e5e5e5;
  --scm-ring: #a1a1a1;
  --scm-tier-1: oklch(0.646 0.222 41.116);
  --scm-tier-2: oklch(0.6 0.118 184.704);
  --scm-tier-3: oklch(0.398 0.07 227.392);
  --scm-tier-4: oklch(0.828 0.189 84.429);
  --scm-tier-5: oklch(0.769 0.188 70.08);
  --scm-belt: color-mix(in oklab, var(--scm-fg) 78%, var(--scm-bg));
  --scm-belt-side: color-mix(in oklab, var(--scm-fg) 92%, var(--scm-bg));
  --scm-rail: color-mix(in oklab, var(--scm-muted) 45%, white);
  --scm-island: color-mix(in oklab, var(--scm-muted) 16%, var(--scm-bg));
  --scm-island-low: color-mix(in oklab, var(--scm-muted) 27%, var(--scm-bg));
  --scm-island-wall: color-mix(in oklab, var(--scm-muted) 42%, var(--scm-bg));
  --scm-belt-shadow: 0.18;
  --scm-plate-shadow: 0.5;
  --scm-figure-shadow: 0.25;
  --scm-island-edge: 1;
}
[data-scm-theme="dark"] {
  --scm-bg: #0a0a0a;
  --scm-fg: #fafafa;
  --scm-muted: #a1a1a1;
  --scm-muted-bg: #262626;
  --scm-card: #171717;
  --scm-card-fg: #fafafa;
  --scm-border: rgba(255, 255, 255, 0.1);
  --scm-ring: #737373;
  --scm-tier-1: oklch(0.488 0.243 264.376);
  --scm-tier-2: oklch(0.696 0.17 162.48);
  --scm-tier-3: oklch(0.769 0.188 70.08);
  --scm-tier-4: oklch(0.627 0.265 303.9);
  --scm-tier-5: oklch(0.645 0.246 16.439);
  --scm-belt: color-mix(in oklab, var(--scm-fg) 16%, var(--scm-bg));
  --scm-belt-side: color-mix(in oklab, var(--scm-fg) 7%, var(--scm-bg));
  --scm-rail: color-mix(in oklab, var(--scm-muted) 72%, var(--scm-bg));
  --scm-island: color-mix(in oklab, var(--scm-fg) 13%, var(--scm-bg));
  --scm-island-low: color-mix(in oklab, var(--scm-fg) 8%, var(--scm-bg));
  --scm-island-wall: color-mix(in oklab, var(--scm-fg) 5%, var(--scm-bg));
  --scm-belt-shadow: 0.6;
  --scm-plate-shadow: 0.9;
  --scm-figure-shadow: 0.7;
  --scm-island-edge: 0.4;
}
:is(.scm-root, .scm-dialog) [data-tier="1"] { --scm-tier: var(--scm-tier-1); }
:is(.scm-root, .scm-dialog) [data-tier="2"] { --scm-tier: var(--scm-tier-2); }
:is(.scm-root, .scm-dialog) [data-tier="3"] { --scm-tier: var(--scm-tier-3); }
:is(.scm-root, .scm-dialog) [data-tier="4"] { --scm-tier: var(--scm-tier-4); }
:is(.scm-root, .scm-dialog) [data-tier="5"] { --scm-tier: var(--scm-tier-5); }

/* nada de texto herdado da p\xe1gina: a esteira fica igual em qualquer projeto */
.scm-root, .scm-dialog {
  box-sizing: border-box;
  color: var(--scm-fg);
  font-family: ui-sans-serif, system-ui, -apple-system, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  letter-spacing: normal;
  line-height: 1.5;
  text-align: left;
  text-transform: none;
  text-shadow: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.scm-root *, .scm-root *::before, .scm-root *::after,
.scm-dialog *, .scm-dialog *::before, .scm-dialog *::after { box-sizing: border-box; }
/* os resets valem zero de especificidade (:where), para as classes daqui e as do projeto vencerem */
:where(.scm-root, .scm-dialog) :where(p, h2, h3, ul) { margin: 0; }
:where(.scm-root, .scm-dialog) :where(ul) { padding: 0; list-style: none; }
:where(.scm-root, .scm-dialog) :where(button) {
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  letter-spacing: inherit;
  text-transform: none;
  -webkit-tap-highlight-color: transparent;
}
:where(.scm-root, .scm-dialog) :where(svg) { display: block; flex: none; }

/* o arranjo sai da largura da pr\xf3pria esteira, n\xe3o da tela */
.scm-root { isolation: isolate; overflow: hidden; container-type: inline-size; }
.scm-glow {
  position: absolute;
  inset: 0;
  z-index: -10;
  pointer-events: none;
  background: radial-gradient(64% 52% at 50% 56%, color-mix(in oklab, var(--scm-fg) 5%, transparent), transparent 72%);
}
.scm-wide {
  display: grid;
  grid-template-columns: minmax(0, 384px) minmax(0, 1fr);
  align-items: center;
  gap: 48px;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 56px 40px;
}
.scm-side { display: flex; flex-direction: column; align-items: flex-start; gap: 24px; }
.scm-stack { display: flex; flex-direction: column; align-items: center; width: 100%; padding: 24px 16px; }
.scm-main { width: 100%; min-width: 0; }
.scm-stack > .scm-main { margin-top: 8px; }
.scm-action { display: flex; justify-content: center; margin-top: 12px; }

.scm-header { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 0 8px; text-align: center; }
.scm-root[data-layout="wide"] .scm-header { align-items: flex-start; gap: 16px; padding: 0; text-align: left; }
.scm-eyebrow { font-size: 11px; line-height: 16px; font-weight: 500; letter-spacing: 0.28em; text-transform: uppercase; color: var(--scm-muted); }
.scm-heading { font-size: 24px; line-height: 32px; font-weight: 500; letter-spacing: -0.025em; text-wrap: balance; }
@container (min-width: 768px) { .scm-heading { font-size: 30px; line-height: 36px; } }
.scm-root[data-layout="wide"] .scm-heading { font-size: 36px; line-height: 1.1; }
@container (min-width: 1280px) { .scm-root[data-layout="wide"] .scm-heading { font-size: 44px; } }
.scm-legend {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 6px 14px;
  margin-top: 4px;
  font-size: 11px;
  line-height: 16px;
  font-variant-numeric: tabular-nums;
  color: var(--scm-muted);
}
.scm-root[data-layout="wide"] .scm-legend { justify-content: flex-start; }
.scm-root[data-narrow] .scm-legend { max-width: 240px; }
.scm-legend li { display: inline-flex; align-items: center; gap: 6px; }
.scm-legend-ring { width: 10px; height: 10px; border: 2px solid var(--scm-tier); border-radius: 9999px; }

.scm-caption { width: 100%; max-width: 448px; min-height: 44px; margin: 8px auto 0; padding: 0 8px; text-align: center; }
.scm-root[data-narrow] .scm-caption { min-height: 60px; }
.scm-root[data-layout="wide"] .scm-caption { max-width: none; min-height: 52px; margin: 0; padding: 0; text-align: left; }
.scm-caption-line { font-size: 14px; line-height: 20px; color: var(--scm-muted); }
.scm-caption-line[data-current] { font-weight: 500; color: var(--scm-fg); }
.scm-caption-price { font-weight: 400; font-variant-numeric: tabular-nums; color: var(--scm-muted); }
.scm-caption-text { margin-top: 2px; font-size: 13px; line-height: 1.375; color: var(--scm-muted); }

.scm-controls { position: relative; z-index: 10; display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 4px; }
.scm-control {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--scm-border);
  border-radius: 9999px;
  background: var(--scm-card);
  color: var(--scm-muted);
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  cursor: pointer;
  outline: none;
  transition: color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}
.scm-control:hover { color: var(--scm-fg); }
.scm-control:focus-visible { box-shadow: 0 0 0 2px var(--scm-ring); }
.scm-control svg { width: 14px; height: 14px; }

/* a esteira: o arraste \xe9 de lado, a rolagem da p\xe1gina para cima e para baixo continua */
.scm-stage { position: relative; width: 100%; overflow-x: clip; touch-action: pan-y; user-select: none; -webkit-user-select: none; }
.scm-counter {
  position: absolute;
  left: 0;
  right: 0;
  pointer-events: none;
  background: linear-gradient(to bottom, color-mix(in oklab, var(--scm-fg) 9%, transparent) 0 1px, transparent 1px, color-mix(in oklab, var(--scm-fg) 5%, transparent) 40%, transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, black 18%, black 82%, transparent);
  mask-image: linear-gradient(to right, transparent, black 18%, black 82%, transparent);
}
.scm-belt { position: absolute; inset: 0; pointer-events: none; }
.scm-belt svg { position: absolute; left: 0; top: 0; overflow: visible; }
.scm-belt-shadow { opacity: var(--scm-belt-shadow); }
.scm-island-edge { opacity: var(--scm-island-edge); }

.scm-plate { position: absolute; left: 0; top: 0; border-radius: 50%; cursor: pointer; outline: none; }
.scm-plate:focus-visible { outline: 2px solid var(--scm-ring); outline-offset: 4px; }
.scm-plate > span, .scm-lift > span, .scm-plate-img { position: absolute; pointer-events: none; }
.scm-plate-shadow { inset: 0; opacity: var(--scm-plate-shadow); }
.scm-plate-shadow > span { position: absolute; left: 5%; right: 5%; top: 16%; bottom: -9%; border-radius: 50%; background: #000; }
.scm-lift { inset: 0; }
.scm-placeholder { inset: 6%; border: 1px solid var(--scm-border); border-radius: 50%; background: var(--scm-card); }
.scm-placeholder[data-broken] { inset: 3%; box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1); }
.scm-placeholder > span { position: absolute; inset: 30%; border-radius: 50%; background: color-mix(in oklab, var(--scm-muted) 20%, transparent); }
.scm-plate-img { inset: 0; display: block; width: 100%; height: 100%; max-width: none; object-fit: fill; user-select: none; -webkit-user-select: none; }
.scm-shade { inset: 0; background: #000; }
.scm-ring { inset: -2%; border: 2px solid var(--scm-tier); border-radius: 50%; }
.scm-anchor { left: 50%; top: 0; width: 0; height: 0; }
.scm-chip {
  position: absolute;
  bottom: 7px;
  left: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px 4px 8px;
  border: 1px solid var(--scm-border);
  border-radius: 9999px;
  background: var(--scm-card);
  color: var(--scm-card-fg);
  box-shadow: 0 6px 16px -6px color-mix(in oklab, var(--scm-fg) 40%, transparent);
  font-size: 11px;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  opacity: 0;
  translate: -50% 4px;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), translate 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.scm-chip[data-shown] { opacity: 1; translate: -50% 0; }
.scm-dot { width: 6px; height: 6px; flex: none; border-radius: 9999px; background: var(--scm-tier); }
.scm-chip-price { font-variant-numeric: tabular-nums; color: var(--scm-muted); }

/* o di\xe1logo do prato */
.scm-dialog {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  padding: 16px;
}
.scm-dialog-backdrop {
  position: absolute;
  inset: 0;
  background: color-mix(in oklab, var(--scm-bg) 80%, transparent);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  opacity: 0;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.scm-dialog-panel { position: relative; display: grid; align-items: center; gap: 24px; width: 100%; max-width: 832px; padding: 20px; }
.scm-dialog-card {
  position: absolute;
  inset: 0;
  border: 1px solid var(--scm-border);
  border-radius: 32px;
  background: var(--scm-card);
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  opacity: 0;
  scale: 0.97;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), scale 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.scm-dialog-close {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 9999px;
  color: var(--scm-muted);
  font-size: 12px;
  line-height: 16px;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  opacity: 0;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.scm-dialog-close:hover { color: var(--scm-fg); }
.scm-dialog-close:focus-visible { box-shadow: 0 0 0 2px var(--scm-ring); }
.scm-dialog-close svg { width: 14px; height: 14px; }
.scm-dialog[data-shown] :is(.scm-dialog-backdrop, .scm-dialog-card, .scm-dialog-close) { opacity: 1; scale: 1; }

.scm-figure { position: relative; width: 100%; max-width: min(42vh, 352px); aspect-ratio: 1; margin: 0 auto; }
.scm-figure > * { position: absolute; }
.scm-figure-shadow { left: 8%; right: 8%; top: 14%; bottom: -4%; border-radius: 9999px; background: #000; opacity: var(--scm-figure-shadow); filter: blur(40px); }
.scm-figure-broken { inset: 3%; border: 1px solid var(--scm-border); border-radius: 9999px; background: var(--scm-muted-bg); }
.scm-figure-broken > span { position: absolute; inset: 30%; border-radius: 9999px; background: color-mix(in oklab, var(--scm-muted) 25%, transparent); }
.scm-figure-img { position: relative; display: block; width: 100%; height: 100%; max-width: none; object-fit: contain; user-select: none; -webkit-user-select: none; }
.scm-figure-ring { inset: -1.5%; border: 3px solid var(--scm-tier); border-radius: 9999px; }

.scm-info {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: center;
  opacity: 0;
  translate: 0 8px;
  transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.15s, translate 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.15s;
}
.scm-dialog[data-shown] .scm-info { opacity: 1; translate: 0 0; }
.scm-info-count {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 11px;
  line-height: 16px;
  letter-spacing: 0.2em;
  color: var(--scm-muted);
}
.scm-info-count .scm-dot { width: 8px; height: 8px; }
.scm-info-title { font-size: 24px; line-height: 32px; font-weight: 500; letter-spacing: -0.025em; }
.scm-info-text { font-size: 14px; line-height: 1.625; color: var(--scm-muted); }
.scm-info-details { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
.scm-info-details li { padding: 4px 12px; border: 1px solid var(--scm-border); border-radius: 9999px; font-size: 12px; line-height: 16px; color: var(--scm-muted); }
.scm-info-buy { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 16px; margin-top: 8px; }
.scm-info-price { font-size: 24px; line-height: 32px; font-weight: 600; font-variant-numeric: tabular-nums; letter-spacing: -0.025em; }

/* o bot\xe3o cheio do di\xe1logo; serve tamb\xe9m para a chamada para a\xe7\xe3o da esteira (className="scm-cta") */
.scm-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 9999px;
  background: var(--scm-fg);
  color: var(--scm-bg);
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  cursor: pointer;
  outline: none;
  transition: translate 0.15s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}
.scm-cta:hover { translate: 0 -1px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); }
.scm-cta:focus-visible { box-shadow: 0 0 0 2px var(--scm-bg), 0 0 0 4px var(--scm-ring); }
.scm-cta svg { width: 16px; height: 16px; }

@media (min-width: 640px) {
  .scm-dialog { padding: 32px; }
  .scm-dialog-panel { grid-template-columns: minmax(0, 1fr) minmax(0, 304px); gap: 40px; padding: 32px; }
  .scm-info { text-align: left; }
  .scm-info-count, .scm-info-details, .scm-info-buy { justify-content: flex-start; }
  .scm-info-title { font-size: 30px; line-height: 36px; }
}

@media (prefers-reduced-motion: reduce) {
  .scm-control, .scm-chip, .scm-dialog-backdrop, .scm-dialog-card, .scm-dialog-close, .scm-info, .scm-cta { transition: none; }
}
`,w=function({items:e,eyebrow:r,heading:i,caption:h,action:b,speed:y=26,paused:w,onPausedChange:k,autoplay:j=!1,interval:M=3e3,active:$,onActiveChange:z,onOpenChange:C,onAdd:N,legend:R,labels:S=n,theme:F="light",className:T,ref:A,...E}){let L=a.useId().replace(/[^a-zA-Z0-9_-]/g,""),P=e.length,B=a.useRef(null),I=a.useRef(null),q=a.useRef(null),W=a.useRef(null),O=a.useRef(null),X=a.useRef([]),D=a.useRef([]),U=a.useRef([]),H=a.useRef([]),K=a.useRef([]),Y=a.useRef({offset:0,v:0,mode:0,target:0,lift:[],vlift:[],z:[],lane:[],raf:0,last:0,visible:!0,init:!1,touched:!1,l:0,center:-1,published:"",px:0,py:0,inside:!1,lock:!1,lockX:0,lockY:0}),_=a.useRef({id:-1,index:-1,x:0,y:0,moved:!1,start:0,lane:1,lastX:0,lastT:0,v:0,k:1}),V=a.useRef(-1),Z=a.useRef(null),G=a.useRef(null),Q=a.useRef(null),[J,ee]=a.useState({section:0,stage:0}),[et,ea]=a.useState(null),[er,ei]=a.useState(!1),[en,es]=a.useState(null),[eo,el]=a.useState(null),[ec,ed]=a.useState(()=>"function"==typeof window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches),[eu,em]=a.useState(j),[ep,ex]=a.useState(j);j!==ep&&(ex(j),em(j));let[eh,ef]=a.useState(0),[eg,eb]=a.useState({}),ev=void 0!==$?$:et,ey=null!==ev&&ev>=0&&ev<P?ev:null,ew=w??er,ek=J.section>=1024,ej=J.section>0&&J.section<480,eM=ej?.6:.68,e$=a.useMemo(()=>{if(!J.stage||0===P)return null;let e=function(e){let t=0;for(let a=0;a<120;a++){let r=l(e,a/120*e.l),i=c(e,r.x+r.nx*e.band/2,r.z+r.nz*e.band/2),n=c(e,r.x,r.z);t=Math.max(t,Math.abs(i.x-e.cx)+3,Math.abs(n.x-e.cx)+n.k*e.d*1.08/2)}return t}(d(1e3,P,100,eM))/100,t=ek?150:s(.143*J.section,96,150),a=(J.stage-8)/(2*e);return d(J.stage,P,Math.round(s(a,Math.min(96,t),t)),eM)},[J.stage,J.section,P,eM,ek]),ez=a.useRef({geo:null,active:null,paused:!1,reduced:!1,open:!1,count:0,speed:26,activeControlled:!1,pausedControlled:!1,onActiveChange:void 0,onPausedChange:void 0,onOpenChange:void 0,onAdd:void 0});a.useLayoutEffect(()=>{ez.current={geo:e$,active:ey,paused:ew,reduced:ec,open:null!==en,count:P,speed:Math.max(0,y),activeControlled:void 0!==$,pausedControlled:void 0!==w,onActiveChange:z,onPausedChange:k,onOpenChange:C,onAdd:N}});let eC=a.useCallback(e=>{B.current=e,"function"==typeof A?A(e):A&&(A.current=e)},[A]),eN=a.useCallback(e=>{let t=ez.current,a=t.geo,r=Y.current,i=X.current[e];if(!a||!i)return;let n=p(a,r.offset,e),o=r.lift[e]??0;i.style.transform=`translate3d(${(n.x-a.d/2).toFixed(2)}px,${(n.y-.8*a.d/2).toFixed(2)}px,0) scale(${n.k.toFixed(4)})`;let l=e===t.active?2e3:100+Math.round(n.y);r.z[e]!==l&&(r.z[e]=l,i.style.zIndex=String(l));let c=n.depth>=.5?"front":"back";r.lane[e]!==c&&(r.lane[e]=c,i.dataset.lane=c);let d=D.current[e];d&&(d.style.transform=`translateY(${(-6*o).toFixed(3)}%) scale(${(1+.08*o).toFixed(4)})`);let u=U.current[e];u&&(u.style.opacity=(.15*s(1-n.depth,0,1)*(1-.7*s(o,0,1))).toFixed(3));let m=H.current[e];m&&(m.style.transform=`translate3d(0,${(.8*a.d*.05*o).toFixed(2)}px,0) scale(${(1+.14*o).toFixed(3)})`,m.style.opacity=(1-.5*s(o,0,1)).toFixed(3));let x=K.current[e];x&&(x.style.transform=`scale(${(1/(n.k*(1+.08*o))).toFixed(4)})`)},[]),eR=a.useCallback(()=>{let e=ez.current.geo,t=Y.current;if(!e)return;W.current?.setAttribute("d",m(e,t.offset,0)),O.current?.setAttribute("d",m(e,t.offset,-Math.max(1.4,.024*e.d)));let a=(.005>Math.abs(t.v)?0:t.v).toFixed(2);a!==t.published&&(t.published=a,q.current?.style.setProperty("--scm-belt-v",a));let r=x(e,t.offset);r!==t.center&&(t.center=r,ef(r))},[]),eS=a.useCallback(()=>{for(let e=0;e<ez.current.count;e++)eN(e);eR()},[eN,eR]),eF=a.useCallback((e,t)=>{let a=ez.current,r=a.geo,i=Y.current;if(!r)return null;let n=null,o=-1/0;for(let l=0;l<a.count;l++){let c=p(r,i.offset,l),d=s(i.lift[l]??0,0,1.2),u=(1+.08*d)*(l===a.active?1.1:1),m=r.d*c.k*u/2,x=.8*r.d*c.k*u/2,h=(e-c.x)/m,f=(t-(c.y+-.06*r.d*.8*c.k*d))/x;if(!(h*h+f*f>1)){if(l===a.active)return l;c.y>o&&(n=l,o=c.y)}}return n},[]),eT=a.useRef(e=>{}),eA=a.useRef(e=>{}),eE=a.useCallback(e=>{let t=Y.current,a=ez.current,r=a.geo;if(t.raf=0,!r||!t.visible){t.last=0;return}let i=t.last?s((e-t.last)/1e3,0,.25):1/60;t.last=e;let n=Math.max(1,Math.ceil(i/.017)),o=i/n,l=a.paused||null!==a.active||a.open,c=a.reduced?0:a.speed;for(let e=0;e<n;e++){if(1===t.mode)t.v+=(5.6*5.6*(t.target-t.offset)-11.2*t.v)*o,t.offset+=t.v*o,.3>Math.abs(t.target-t.offset)&&4>Math.abs(t.v)&&(t.offset=t.target,t.v=0,t.mode=0);else if(0===t.mode){if(l)t.v*=Math.exp(-7.2*o),.02>Math.abs(t.v)&&(t.v=0);else{let e=t.v-c;Math.abs(e)>Math.max(6,.5*c)?e=Math.sign(e)*Math.max(0,Math.abs(e)*Math.exp(-2.4*o)-90*o):e*=Math.exp(-3.4*o),t.v=c+(.01>Math.abs(e)?0:e)}t.offset+=t.v*o}for(let e=0;e<a.count;e++){let r=+(e===a.active);if(a.reduced){t.lift[e]=r,t.vlift[e]=0;continue}let i=t.lift[e]??0,n=(t.vlift[e]??0)+(330*(r-i)-23*(t.vlift[e]??0))*o;t.lift[e]=i+n*o,t.vlift[e]=n}}let d=0!==t.mode||0!==t.v||!l&&c>0;for(let e=0;e<a.count;e++){let r=+(e===a.active);.002>Math.abs(r-(t.lift[e]??0))&&.02>Math.abs(t.vlift[e]??0)?(t.lift[e]=r,t.vlift[e]=0):d=!0}if(t.inside&&!t.lock&&0===t.mode&&!a.open&&_.current.id<0&&Math.abs(t.v)>.3){let e=eF(t.px,t.py);null!==e&&e!==a.active&&eT.current(e)}eS(),d?t.raf=requestAnimationFrame(eA.current):t.last=0},[eF,eS]);a.useLayoutEffect(()=>{eA.current=eE},[eE]);let eL=a.useCallback(()=>{let e=Y.current;!e.raf&&e.visible&&(e.last=0,e.raf=requestAnimationFrame(eE))},[eE]),eP=a.useCallback(e=>{let t=ez.current;t.active!==e&&(t.activeControlled||(t.active=e,ea(e)),t.onActiveChange?.(e),eL())},[eL]),eB=a.useCallback(()=>{em(!1);let e=Y.current;e.touched=!0,1===e.mode&&(e.mode=0);let t=G.current;null!==t&&(G.current=null,ez.current.active===t&&eP(null))},[eP]),eI=a.useCallback(e=>{let t=Y.current,a=ez.current.geo;if(!a)return;let r=a.s/2+e*a.pitch;if(t.target=r+Math.round((t.offset-r)/a.l)*a.l,ez.current.reduced){t.offset=t.target,t.v=0,t.mode=0,eS();return}t.mode=1,eL()},[eL,eS]),eq=()=>!!I.current?.querySelector("[data-dish]:focus-visible");a.useLayoutEffect(()=>{eT.current=e=>{let t=ez.current.active;if(e===t){null!==e&&G.current===e&&(G.current=null,em(!1));return}if(null!==e){eB(),eP(e);return}null===t||t===G.current||eq()||eP(null)}});let eW=a.useCallback(e=>{eB(),eP(e);let t=Y.current;t.v=0,t.mode=0,ez.current.open=!0,eR(),es(e),ez.current.onOpenChange?.(e)},[eB,eP,eR]),eO=a.useCallback(()=>{ez.current.open=!1,es(null),ez.current.onOpenChange?.(null),eL()},[eL]),eX=(e,t)=>{if(0===P)return;let a=(e%P+P)%P;eB(),t&&X.current[a]?.focus({preventScroll:!0}),eP(a),eI(a)};a.useEffect(()=>{let e=window.matchMedia("(prefers-reduced-motion: reduce)"),t=()=>ed(e.matches);return t(),e.addEventListener("change",t),()=>e.removeEventListener("change",t)},[]);let eD=P>0;a.useLayoutEffect(()=>{let e=B.current,t=I.current;if(!e||!t)return;let a=()=>{let a={section:Math.round(e.clientWidth),stage:Math.round(t.clientWidth)};ee(e=>e.section===a.section&&e.stage===a.stage?e:a)};a();let r=new ResizeObserver(a);return r.observe(e),r.observe(t),()=>r.disconnect()},[eD]),a.useLayoutEffect(()=>{let e=Y.current;if(e$){if(e.init){if(e.l>0&&e.l!==e$.l){let t=e$.l/e.l;e.offset*=t,e.target*=t}}else e.init=!0,e.offset=e$.s/2-Math.min(1.62*ez.current.speed,.45*e$.pitch),e.v=ez.current.reduced||ez.current.paused?0:ez.current.speed;ez.current.reduced&&(e.v=0,2!==e.mode&&(e.mode=0),e.touched||(e.offset=e$.s/2)),e.l=e$.l,e.z=[],e.lane=[],eS(),eL()}},[e$,e,ec,eS,eL]),a.useEffect(()=>{eL()},[ey,ew,en,ec,y,eL]),a.useEffect(()=>{let e=B.current,t=Y.current,a=!0,r=()=>{let e=a&&!document.hidden;e!==t.visible&&(t.visible=e,e?eL():t.raf&&(cancelAnimationFrame(t.raf),t.raf=0,t.last=0))},i=e&&"function"==typeof IntersectionObserver?new IntersectionObserver(e=>{a=e.some(e=>e.isIntersecting),r()}):null;return e&&i&&i.observe(e),document.addEventListener("visibilitychange",r),r(),()=>{i?.disconnect(),document.removeEventListener("visibilitychange",r)}},[eL]),a.useEffect(()=>()=>{let e=Y.current;e.raf&&cancelAnimationFrame(e.raf),e.raf=0,e.last=0},[]);let eU=null!==e$;a.useEffect(()=>{if(!eu||ec||ew||null!==en||0===P||!eU)return;let e=0,t=()=>{let a=ez.current.geo;if(!a)return;let r=Q.current,i=null===r?x(a,Y.current.offset+.25*ez.current.speed):(r+1)%P;Q.current=i,G.current=i,eP(i),eI(i),e=window.setTimeout(()=>{G.current===i&&(G.current=null,ez.current.active===i&&eP(null)),e=window.setTimeout(t,Math.max(300,M-1400))},1400)};return e=window.setTimeout(t,null===Q.current?1600:Math.max(300,M-1400)),()=>window.clearTimeout(e)},[eu,ec,ew,en,P,M,eU,eP,eI]),a.useLayoutEffect(()=>{if(null!==en||null!==eo||null===Z.current)return;let e=Z.current;Z.current=null,X.current[e]?.focus({preventScroll:!0})},[en,eo]);let eH=e=>{let t=I.current,a=t?.getBoundingClientRect(),r=f(t);return{x:(e.clientX-(a?.left??0))/r,y:(e.clientY-(a?.top??0))/r}},eK=(e,t)=>{let a=_.current;if(a.id!==e.pointerId)return;let r=Y.current,i=I.current;if(i?.hasPointerCapture(e.pointerId)&&i.releasePointerCapture(e.pointerId),_.current={...a,id:-1},2===r.mode){r.mode=0;let t=Math.exp(-Math.max(0,e.timeStamp-a.lastT)/70);if(r.v=ez.current.reduced?0:s(r.v*t,-1400,1400),"mouse"===e.pointerType){let t=eH(e);r.lock=!0,r.lockX=t.x,r.lockY=t.y}eL();return}if(t||a.moved)return;let n="mouse"!==e.pointerType;if(a.index<0){n&&null!==ez.current.active&&(eB(),eP(null));return}eB(),n&&ez.current.active!==a.index?eP(a.index):V.current=a.index},eY=a.useCallback(()=>null===en?null:D.current[en]?.getBoundingClientRect()??null,[en]),e_=a.useCallback(e=>el(e?en:null),[en]),eV=a.useCallback(()=>{Z.current=en,eO()},[en,eO]),eZ=a.useCallback(()=>{let t=null===en?void 0:e[en];t&&ez.current.onAdd?.(t)},[en,e]),eG=a.useCallback(()=>I.current?.closest("dialog")??document.body,[]),eQ=a.useMemo(()=>e$?{outer:u(e$,e$.band/2),inner:u(e$,-e$.band/2),island:u(e$,-e$.band/2-.035*e$.d)}:null,[e$]),eJ=null===ey?null:e[ey]??null,e0=ey??eh,e1=function(e,t){let a=[];for(let r=1;r<=5;r++){let i=t?t[r]:e.find(e=>(e.tier??1)===r)?.price;i&&a.push({tier:r,label:i})}return a}(e,R),e2=(r||i||e1.length>0)&&(0,t.jsxs)("div",{className:"scm-header",children:[r&&(0,t.jsx)("p",{className:"scm-eyebrow",children:r}),i&&(0,t.jsx)("h2",{className:"scm-heading",children:i}),e1.length>0&&(0,t.jsx)("ul",{"aria-hidden":"true","data-legend":!0,className:"scm-legend",children:e1.map(e=>(0,t.jsxs)("li",{children:[(0,t.jsx)("span",{className:"scm-legend-ring","data-tier":e.tier}),e.label]},e.tier))})]}),e4=(0,t.jsxs)("div",{id:`${L}-caption`,"aria-live":"polite","data-caption":!0,className:"scm-caption",children:[(0,t.jsx)("p",{className:"scm-caption-line","data-current":eJ?"":void 0,children:eJ?(0,t.jsxs)(t.Fragment,{children:[eJ.name," ",(0,t.jsxs)("span",{className:"scm-caption-price",children:["· ",eJ.price]})]}):h}),eJ?.description&&(0,t.jsx)("p",{className:"scm-caption-text",children:eJ.description})]}),e5=P>1&&(0,t.jsxs)("div",{className:"scm-controls",children:[(0,t.jsx)("button",{type:"button","data-control":"previous","aria-label":S.previous,onClick:()=>eX((ez.current.active??Y.current.center)-1,!1),className:"scm-control",children:(0,t.jsx)("svg",{"aria-hidden":"true",viewBox:"0 0 16 16",fill:"none",stroke:"currentColor",strokeWidth:"1.7",strokeLinecap:"round",strokeLinejoin:"round",children:(0,t.jsx)("path",{d:"M10 3.5 5.5 8l4.5 4.5"})})}),(0,t.jsx)("button",{type:"button","data-control":"pause","aria-label":S.pause??n.pause,"aria-pressed":ew,onClick:()=>{eB();let e=ez.current,t=!e.paused;e.pausedControlled||(e.paused=t,ei(t)),e.onPausedChange?.(t),t||null===e.active||eq()||Y.current.inside||eP(null),eL()},className:"scm-control",children:ew?(0,t.jsx)("svg",{"aria-hidden":"true",viewBox:"0 0 16 16",fill:"currentColor",children:(0,t.jsx)("path",{d:"M5 3.4v9.2a.6.6 0 0 0 .9.5l7.4-4.6a.6.6 0 0 0 0-1L5.9 2.9a.6.6 0 0 0-.9.5Z"})}):(0,t.jsxs)("svg",{"aria-hidden":"true",viewBox:"0 0 16 16",fill:"currentColor",children:[(0,t.jsx)("rect",{x:"4",y:"3",width:"2.6",height:"10",rx:"0.8"}),(0,t.jsx)("rect",{x:"9.4",y:"3",width:"2.6",height:"10",rx:"0.8"})]})}),(0,t.jsx)("button",{type:"button","data-control":"next","aria-label":S.next,onClick:()=>eX((ez.current.active??Y.current.center)+1,!1),className:"scm-control",children:(0,t.jsx)("svg",{"aria-hidden":"true",viewBox:"0 0 16 16",fill:"none",stroke:"currentColor",strokeWidth:"1.7",strokeLinecap:"round",strokeLinejoin:"round",children:(0,t.jsx)("path",{d:"M6 3.5 10.5 8 6 12.5"})})})]}),e6=P>0&&(0,t.jsxs)("div",{ref:I,"data-stage":!0,role:"group","aria-label":i??"Esteira de sushi","aria-roledescription":"esteira",className:"scm-stage",style:{height:e$?e$.height:260},onPointerDown:e=>{let t=ez.current.geo;if(0!==e.button||!t)return;let a=eH(e),r=eF(a.x,a.y);V.current=-1,_.current={id:e.pointerId,index:r??-1,x:e.clientX,y:e.clientY,moved:!1,start:Y.current.offset,lane:a.y>=t.ym?1:-1,lastX:e.clientX,lastT:e.timeStamp,v:0,k:f(I.current)}},onPointerMove:e=>{let t=Y.current,a=_.current,r=I.current,i=ez.current.geo;if(!r||!i)return;let n=eH(e);if("mouse"===e.pointerType&&(t.px=n.x,t.py=n.y,t.inside=!0),a.id===e.pointerId){let n=(e.clientX-a.x)/a.k,s=e.timeStamp;if(!a.moved&&Math.abs(n)>6&&Math.abs(n)>Math.abs(e.clientY-a.y)/a.k){a.moved=!0,eB(),eP(null),t.mode=2;try{r.setPointerCapture(e.pointerId)}catch{}}if(a.moved){let r=(e.clientX-a.lastX)/a.k/Math.max(1,s-a.lastT);a.v=.6*a.v+.4*r,a.lastX=e.clientX,a.lastT=s;let o=a.lane>0?1:1/i.kb;t.offset=a.start-a.lane*n*o,t.v=ez.current.reduced?0:-a.lane*a.v*1e3*o,eL()}return}if("mouse"===e.pointerType&&!ez.current.open){if(t.lock){if(4>Math.hypot(n.x-t.lockX,n.y-t.lockY))return;t.lock=!1}eT.current(eF(n.x,n.y))}},onPointerUp:e=>eK(e,!1),onPointerCancel:e=>eK(e,!0),onPointerLeave:e=>{if("mouse"!==e.pointerType)return;let t=Y.current;t.inside=!1,t.lock=!1;let a=ez.current.active;!(_.current.id<0)||ez.current.open||null===a||a===G.current||eq()||eP(null)},onBlur:e=>{let t=e.relatedTarget;if(t&&I.current?.contains(t)||ez.current.open||Y.current.inside)return;let a=ez.current.active;null!==a&&a!==G.current&&eP(null)},onKeyDown:e=>{if(!["ArrowRight","ArrowLeft","Home","End"].includes(e.key)||0===P)return;e.preventDefault();let t=e.target.closest("[data-dish]")?.getAttribute("data-dish"),a=null!=t?Number(t):ey??eh;eX("Home"===e.key?0:"End"===e.key?P-1:a+("ArrowRight"===e.key?1:-1),!0)},children:[e$&&(0,t.jsx)("div",{"aria-hidden":"true","data-counter":!0,className:"scm-counter",style:{top:Math.max(0,e$.edgeTop-.34*e$.d),height:e$.ym-Math.max(0,e$.edgeTop-.34*e$.d)}}),(0,t.jsx)("div",{ref:q,"data-belt":!0,"aria-hidden":"true",className:"scm-belt",children:e$&&eQ&&(0,t.jsxs)("svg",{width:e$.width,height:e$.height,viewBox:`0 0 ${e$.width} ${e$.height}`,focusable:"false",children:[(0,t.jsxs)("defs",{children:[(0,t.jsx)("filter",{id:`${L}-soft`,x:"-10%",y:"-30%",width:"120%",height:"160%",children:(0,t.jsx)("feGaussianBlur",{stdDeviation:(.06*e$.d).toFixed(1)})}),(0,t.jsxs)("linearGradient",{id:`${L}-island`,x1:"0",x2:"0",y1:"0",y2:"1",children:[(0,t.jsx)("stop",{offset:"0",style:{stopColor:"var(--scm-island)"}}),(0,t.jsx)("stop",{offset:"1",style:{stopColor:"var(--scm-island-low)"}})]})]}),(0,t.jsx)("path",{d:eQ.outer,transform:`translate(0 ${(e$.side+.07*e$.d).toFixed(1)})`,fill:"black",className:"scm-belt-shadow",filter:`url(#${L}-soft)`}),(0,t.jsx)("path",{d:`${eQ.outer}${eQ.inner}`,fillRule:"evenodd",transform:`translate(0 ${e$.side.toFixed(1)})`,style:{fill:"var(--scm-belt-side)"}}),(0,t.jsx)("path",{d:`${eQ.outer}${eQ.inner}`,fillRule:"evenodd",style:{fill:"var(--scm-belt)"}}),(0,t.jsx)("path",{ref:W,fill:"none",stroke:"black",strokeOpacity:.42,strokeWidth:Math.max(1,.013*e$.d),strokeLinecap:"round"}),(0,t.jsx)("path",{ref:O,fill:"none",stroke:"white",strokeOpacity:.14,strokeWidth:Math.max(.8,.009*e$.d),strokeLinecap:"round"}),(0,t.jsx)("path",{d:eQ.outer,fill:"none",style:{stroke:"var(--scm-rail)"},strokeWidth:Math.max(2,.026*e$.d)}),(0,t.jsx)("path",{d:eQ.outer,fill:"none",stroke:"white",strokeOpacity:.55,strokeWidth:Math.max(.8,.008*e$.d),transform:"translate(0 -0.8)"}),(0,t.jsx)("path",{d:eQ.inner,fill:"none",style:{stroke:"var(--scm-rail)"},strokeWidth:Math.max(1.6,.02*e$.d)}),(0,t.jsx)("path",{d:eQ.inner,fill:"none",stroke:"white",strokeOpacity:.4,strokeWidth:Math.max(.8,.008*e$.d),transform:"translate(0 -0.7)"}),(0,t.jsx)("path",{d:eQ.island,style:{fill:"var(--scm-island-wall)"}}),(0,t.jsx)("path",{d:eQ.island,transform:`translate(0 ${(-(.6*e$.side)).toFixed(1)})`,style:{fill:`url(#${L}-island)`}}),(0,t.jsx)("path",{d:eQ.island,transform:`translate(0 ${(-(.6*e$.side)-.6).toFixed(1)})`,fill:"none",stroke:"white",strokeOpacity:.55,strokeWidth:Math.max(.8,.008*e$.d),className:"scm-island-edge"})]})}),e$&&e.map((e,a)=>{let r=o(e.tier),i=ey===a,n=!!eg[e.id],s=`url("${e.image}") 0 0 / 100% 100% no-repeat`;return(0,t.jsxs)("button",{ref:e=>{X.current[a]=e},type:"button","data-dish":a,"data-active":i||void 0,tabIndex:a===e0?0:-1,"aria-label":`${e.name}, ${e.price}`,"aria-describedby":`${L}-caption`,"aria-haspopup":"dialog","aria-current":i||void 0,className:"scm-plate",style:{width:e$.d,height:.8*e$.d,visibility:eo===a?"hidden":void 0},onFocus:()=>{_.current.id<0&&(eB(),eP(a))},onClick:e=>{let t=V.current;V.current=-1,(0===e.detail||t===a)&&eW(a)},children:[(0,t.jsx)("span",{"aria-hidden":"true",className:"scm-plate-shadow",children:(0,t.jsx)("span",{ref:e=>{H.current[a]=e},style:{filter:`blur(${Math.max(2,.045*e$.d).toFixed(1)}px)`}})}),(0,t.jsxs)("span",{ref:e=>{D.current[a]=e},"data-lift":!0,className:"scm-lift",children:[(0,t.jsx)("span",{"aria-hidden":"true","data-placeholder":!0,className:"scm-placeholder","data-broken":n||void 0,children:(0,t.jsx)("span",{})}),!n&&(0,t.jsx)("img",{src:e.image,alt:"",draggable:!1,onError:()=>eb(t=>t[e.id]?t:{...t,[e.id]:!0}),className:"scm-plate-img"}),!n&&(0,t.jsx)("span",{ref:e=>{U.current[a]=e},"aria-hidden":"true",className:"scm-shade",style:{opacity:0,WebkitMask:s,mask:s}}),(0,t.jsx)("span",{"aria-hidden":"true","data-ring":!0,"data-tier":r,className:"scm-ring"}),(0,t.jsx)("span",{ref:e=>{K.current[a]=e},"aria-hidden":"true",className:"scm-anchor",children:(0,t.jsxs)("span",{"data-chip":!0,"data-shown":i&&eo!==a||void 0,className:"scm-chip",children:[(0,t.jsx)("span",{className:"scm-dot","data-tier":r}),e.name,(0,t.jsx)("span",{className:"scm-chip-price",children:e.price})]})})]})]},e.id)})]});return(0,t.jsxs)("section",{...E,ref:eC,"data-slot":"sushi-conveyor-menu","data-layout":ek?"wide":"stack","data-narrow":ej||void 0,"data-active":ey??"","data-open":en??"","data-paused":ew||void 0,"data-center":eh,"data-scm-theme":F,className:`scm-root ${T??""}`,children:[(0,t.jsx)(v,{}),(0,t.jsx)("div",{"aria-hidden":"true",className:"scm-glow"}),ek?(0,t.jsxs)("div",{className:"scm-wide",children:[(0,t.jsxs)("div",{className:"scm-side",children:[e2,e4,b]}),(0,t.jsxs)("div",{className:"scm-main",children:[e6,e5]})]}):(0,t.jsxs)("div",{className:"scm-stack",children:[e2,(0,t.jsx)("div",{className:"scm-main",children:e6}),e5,e4,b&&(0,t.jsx)("div",{className:"scm-action",children:b})]}),null!==en&&e[en]&&(0,t.jsx)(g,{uid:L,item:e[en],index:en,total:P,labels:S,reduced:ec,theme:F,broken:!!eg[e[en].id],host:eG,source:eY,onLift:e_,onAdd:eZ,onClose:eV})]})},k={1:"R$ 9,90",2:"R$ 12,90",3:"R$ 15,90",4:"R$ 19,90",5:"R$ 24,90"};function j({images:e="/sushi-conveyor-menu",autoplay:r=!0,theme:i="dark",minHeight:n="100svh"}){let s=a.useMemo(()=>(function(e="/sushi-conveyor-menu"){return[{id:"salmon-nigiri",name:"Niguiri de salmão",price:"R$ 12,90",tier:2,description:"Duas fatias de salmão fresco sobre arroz temperado, com gengibre em conserva.",details:["2 peças","Peixe","Escolha do chef"],image:`${e}/salmon-nigiri.webp`},{id:"tuna-nigiri",name:"Niguiri de atum",price:"R$ 19,90",tier:4,description:"Atum vermelho magro sobre arroz morno, num prato de laca preta.",details:["2 peças","Peixe"],image:`${e}/tuna-nigiri.webp`},{id:"ebi-nigiri",name:"Niguiri de camarão",price:"R$ 12,90",tier:2,description:"Camarão cozido e aberto sobre o arroz, com a cauda.",details:["2 peças","Crustáceo"],image:`${e}/ebi-nigiri.webp`},{id:"california-roll",name:"Uramaki califórnia",price:"R$ 15,90",tier:3,description:"Kani, abacate e pepino, enrolados com o arroz por fora e cobertos de ovas.",details:["4 peças","Crustáceo","Ovas"],image:`${e}/california-roll.webp`},{id:"dragon-roll",name:"Dragon roll",price:"R$ 24,90",tier:5,description:"Uramaki de camarão empanado coberto de abacate, com molho tarê por cima.",details:["4 peças","Crustáceo","Trigo","Escolha do chef"],image:`${e}/dragon-roll.webp`},{id:"tamago",name:"Niguiri de tamago",price:"R$ 9,90",tier:1,description:"Omelete doce enrolada, presa ao arroz por uma fita de nori.",details:["2 peças","Ovo"],image:`${e}/tamago.webp`},{id:"edamame",name:"Edamame",price:"R$ 9,90",tier:1,description:"Uma tigela de vagens de soja no vapor, com flor de sal.",details:["1 tigela","Soja","Vegano"],image:`${e}/edamame.webp`},{id:"mochi",name:"Mochi de sorvete",price:"R$ 15,90",tier:3,description:"Um de matchá e um de morango, recheados de sorvete.",details:["2 peças","Leite","Sobremesa"],image:`${e}/mochi.webp`}]})(e),[e]),[o,l]=a.useState(0),[c,d]=a.useState(!1),u=a.useRef(0);return a.useEffect(()=>()=>window.clearTimeout(u.current),[]),(0,t.jsxs)("div",{"data-sushi-demo":!0,"data-scm-theme":i,style:{position:"relative",display:"flex",alignItems:"center",justifyContent:"center",width:"100%",minHeight:n,background:"var(--scm-bg)",color:"var(--scm-fg)"},children:[(0,t.jsxs)("div",{style:{position:"absolute",top:16,right:16,zIndex:20,display:"flex",alignItems:"center",gap:8,font:"500 14px/20px ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"},children:[(0,t.jsx)("span",{"aria-live":"polite",style:{padding:"4px 10px",borderRadius:9999,background:"var(--scm-fg)",color:"var(--scm-bg)",fontSize:11,lineHeight:"16px",opacity:+!!c,translate:c?"0 0":"4px 0",transition:"opacity .3s cubic-bezier(.4,0,.2,1), translate .3s cubic-bezier(.4,0,.2,1)"},children:c?"Adicionado":""}),(0,t.jsxs)("button",{type:"button","data-order-count":!0,"aria-label":`Seu pedido: ${o} ${1===o?"prato":"pratos"}`,style:{display:"inline-flex",alignItems:"center",gap:8,height:36,margin:0,padding:"0 12px",border:"1px solid var(--scm-border)",borderRadius:9999,background:"var(--scm-card)",color:"var(--scm-card-fg)",font:"inherit",boxShadow:"0 1px 3px 0 rgb(0 0 0 / .1), 0 1px 2px -1px rgb(0 0 0 / .1)",cursor:"pointer"},children:[(0,t.jsxs)("svg",{"aria-hidden":"true",viewBox:"0 0 24 24",width:"16",height:"16",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[(0,t.jsx)("path",{d:"M16 10a4 4 0 0 1-8 0"}),(0,t.jsx)("path",{d:"M3.103 6.034h17.794"}),(0,t.jsx)("path",{d:"M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z"})]}),(0,t.jsx)("span",{"data-order-total":!0,style:{fontVariantNumeric:"tabular-nums"},children:o})]})]}),(0,t.jsx)(w,{items:s,legend:k,theme:i,eyebrow:"Kaiten · Almoço na esteira",heading:"Uma esteira de sushi que não para de girar, direto na página.",caption:"Passe o mouse para parar a esteira, arraste para girar, escolha um prato para pedir.",autoplay:r,onAdd:()=>{l(e=>e+1),d(!0),window.clearTimeout(u.current),u.current=window.setTimeout(()=>d(!1),2400)},action:(0,t.jsx)("button",{type:"button",className:"scm-cta",children:"Ver o cardápio completo"})})]})}var M=e.i(475545);let $=(0,r.x)("/componentes/sushi-conveyor-menu"),z=e=>{e.preventDefault(),e.stopPropagation()},C=[{dur:.4,to:{x:640,y:560},o:0},{dur:.35,to:{x:640,y:560},o:1},{dur:.9,to:{plate:470}},{dur:1.5,to:{same:!0}},{dur:.75,to:{plate:300}},{dur:1.2,to:{same:!0}},{dur:.12,to:{same:!0},down:!0},{dur:.3,to:{by:-300},down:!0},{dur:.6,to:{x:600,y:425}},{dur:1.6,to:{x:600,y:425}},{dur:.7,to:{control:"next"},click:!0},{dur:.7,to:{control:"next"},click:!0},{dur:.7,to:{control:"next"}},{dur:.8,to:{plate:400}},{dur:1.6,to:{same:!0}},{dur:.8,to:{x:700,y:580}},{dur:.3,to:{x:700,y:580},o:0},{dur:.8,to:{x:700,y:580},o:0}],N=C.reduce((e,t,a)=>[...e,a?e[a-1]+C[a-1].dur:0],[]),R=N[N.length-1]+C[C.length-1].dur;e.s(["default",0,function({mode:e,compact:r}){let i=(0,a.useRef)(null),n=(0,a.useRef)(null);return((0,a.useEffect)(()=>{if("tile"===e)return function(e,t){if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;let a=e.closest(".preview"),r=-1,i={x:0,y:0,o:0},n={x:0,y:0,o:0},s=null,o=!1,l=!1,c=0,d=0,u=0,m=()=>e.getBoundingClientRect().width/(e.offsetWidth||1)||1,p=(t,a=0)=>{let r=e.getBoundingClientRect(),i=t.getBoundingClientRect(),n=m();return{x:(i.left+i.width/2-r.left)/n,y:(i.top+i.height/2-r.top)/n-a*i.height}},x=(e,t,a,r,i,n)=>e.dispatchEvent(new PointerEvent(t,{bubbles:!0,cancelable:!0,composed:!0,clientX:a,clientY:r,button:0,buttons:i,pointerId:77,pointerType:"mouse",isPrimary:!0,relatedTarget:n?null:void 0})),h=a=>{var r;let l,c,d=C[a];i={...n},"plate"in d.to&&(r=d.to.plate,l=null,c=1/0,e.querySelectorAll('[data-dish][data-lane="front"]').forEach(e=>{let t=Math.abs(p(e).x-r);t<c&&(c=t,l=e)}),s=l);let u=e.querySelector("[data-stage]"),h=e.getBoundingClientRect(),f=m(),g=h.left+n.x*f,b=h.top+n.y*f;d.down&&!o&&u?(o=!0,x(u,"pointerdown",g,b,1)):!d.down&&o&&u&&(o=!1,x(u,"pointerup",g,b,0)),t.toggleAttribute("data-down",o)},f=a=>{c+=Math.min(50,a-d),d=a,(a=>{let c,d=0;for(;d<C.length-1&&N[d+1]<=a;)d++;for(d<r&&(o&&h(C.length-1),r=-1);r<d;){if(r>=0&&C[r].click){let a=C[r].to;"control"in a&&(e.querySelector(`[data-control="${a.control}"]`)?.click(),t.setAttribute("data-down",""),setTimeout(()=>t.toggleAttribute("data-down",o),140))}h(++r)}let u=C[d],f=(c=Math.min(1,(a-N[d])/u.dur))<.5?4*c*c*c:1-(-2*c+2)**3/2,g=(t=>{if("plate"in t||"same"in t)return s?p(s,.08):i;if("control"in t){let a=e.querySelector(`[data-control="${t.control}"]`);return a?p(a):i}return"by"in t?{x:i.x+t.by,y:i.y}:t})(u.to),b=u.o??i.o,v={x:i.x+(g.x-i.x)*f,y:i.y+(g.y-i.y)*f,o:i.o+(b-i.o)*f},y=Math.abs(v.x-n.x)>.01||Math.abs(v.y-n.y)>.01;n=v,t.style.transform=`translate3d(${n.x}px, ${n.y}px, 0)`,t.style.opacity=String(n.o),(t=>{let a=e.querySelector("[data-stage]");if(!a)return;let r=e.getBoundingClientRect(),i=m(),s=r.left+n.x*i,c=r.top+n.y*i,d=a.getBoundingClientRect(),u=n.o>.5&&s>=d.left&&s<=d.right&&c>=d.top&&c<=d.bottom;if(o){t&&x(a,"pointermove",s,c,1);return}u&&t&&x(a,"pointermove",s,c,0),!u&&l&&x(a,"pointerout",s,c,0,!0),l=u})(y)})(c/1e3%R),u=requestAnimationFrame(f)},g=()=>{let e=!a||a.classList.contains("is-playing");e&&!u?(d=performance.now(),u=requestAnimationFrame(f)):!e&&u&&(cancelAnimationFrame(u),u=0)},b=new MutationObserver(g);return a&&b.observe(a,{attributes:!0,attributeFilter:["class"]}),g(),()=>{b.disconnect(),cancelAnimationFrame(u)}}(i.current,n.current)},[e]),"stage"===e)?(0,t.jsx)("div",{className:`${M.default.stage} ${r?M.default.compact:""}`,children:(0,t.jsx)(j,{images:$,minHeight:"100%"})}):(0,t.jsxs)("div",{ref:i,className:`${M.default.stage} ${M.default.tile}`,"aria-hidden":"true",inert:!0,onClick:z,onPointerMove:e=>e.stopPropagation(),children:[(0,t.jsx)(j,{images:`${$}/240w`,autoplay:!1,minHeight:"100%"}),(0,t.jsx)("div",{ref:n,className:M.default.cursor,children:(0,t.jsx)("svg",{viewBox:"0 0 14 21",width:"40",height:"60",children:(0,t.jsx)("path",{d:"M1 1v15.5l3.8-3.6 2.8 6.5 2.5-1.1-2.7-6.3h5.2z"})})})]})}],372879)},614827,function(e){e.n(e.i(372879))}]);

//# debugId=2a7923f2-fc48-9ba9-59fb-9153c2d37375