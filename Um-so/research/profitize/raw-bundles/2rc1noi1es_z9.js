;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="53c4a062-ec99-b3e5-e3ba-a561fc93c575")}catch(e){}}();
(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,316034,e=>{e.v({cursor:"IndicatorChart-module__v4Bd6W__cursor",on:"IndicatorChart-module__v4Bd6W__on",ripple:"IndicatorChart-module__v4Bd6W__ripple",stage:"IndicatorChart-module__v4Bd6W__stage",tile:"IndicatorChart-module__v4Bd6W__tile"})},603201,e=>{"use strict";var t=e.i(843476),i=e.i(271645);let r="var(--ic-up)",a="var(--ic-down)",o="var(--ic-surface)",n="var(--ic-rsi)",s="var(--ic-macd)",l="cubic-bezier(0.22, 1, 0.36, 1)",c=[{label:"1S",bars:7},{label:"1M",bars:30},{label:"3M",bars:90},{label:"6M",bars:180},{label:"1A",bars:365},{label:"MÁX",bars:null}];function d(e){return Math.round(100*e)/100}function u({seed:e,count:t,start:i,drift:r,vol:a,startedAt:o}){let n,s=(n=e,()=>{n|=0;let e=Math.imul((n=n+0x6d2b79f5|0)^n>>>15,1|n);return(((e=e+Math.imul(e^e>>>7,61|e)^e)^e>>>14)>>>0)/0x100000000}),l=[],c=i,h=a;for(let e=0;e<t;e+=1){h+=(a-h)*.05+(s()-.5)*a*.35,h=Math.max(.35*a,Math.min(2.6*a,h));let t=c,i=(s()-.5)*2*h+r,n=Math.max(.01,t*(1+i)),u=.9*Math.abs(i)+.55*h,m=Math.max(t,n)*(1+s()*u),x=Math.min(t,n)*(1-s()*u),p=Math.abs(n-t)/Math.max(t,1e-6),f=Math.round((.55+.7*s()+26*p)*1e6);l.push({t:o+864e5*e,open:d(t),high:d(m),low:d(x),close:d(n),volume:f}),c=n}return l}let h=Date.UTC(2026,7,21)-362016e5,m=u({seed:0x13527d7,count:420,start:96.4,drift:.0021,vol:.031,startedAt:h});u({seed:7431902,count:420,start:189.2,drift:9e-4,vol:.013,startedAt:h});let x=new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL",minimumFractionDigits:2,maximumFractionDigits:2}),p=new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL",minimumFractionDigits:4,maximumFractionDigits:4}),f=new Intl.NumberFormat("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2}),g=new Intl.NumberFormat("pt-BR",{notation:"compact",maximumFractionDigits:1}),b=["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];function v(e){return(Math.abs(e)>=1||0===e?x:p).format(e)}function y(e){return(Math.abs(e)>=1e4?g:f).format(e)}function j(e){return`${e>0?"+":e<0?"−":""}${Math.abs(e).toFixed(2).replace(".",",")}%`}function k(e,t){let i=Math.abs(e).toFixed(t);return`${e<0&&0!==Number(i)?"−":""}${i.replace(".",",")}`}function M(e){let t=new Date(e);return`${t.getUTCDate()} ${b[t.getUTCMonth()]}`}function w(e){let t=e.length;if(0===t)return"";if(1===t)return`M${e[0].x},${e[0].y}`;let i=[],r=[];for(let a=0;a<t-1;a+=1)i[a]=e[a+1].x-e[a].x,r[a]=0===i[a]?0:(e[a+1].y-e[a].y)/i[a];let a=Array(t);a[0]=r[0],a[t-1]=r[t-2];for(let e=1;e<t-1;e+=1)if(r[e-1]*r[e]<=0)a[e]=0;else{let t=2*i[e]+i[e-1],o=i[e]+2*i[e-1];a[e]=(t+o)/(t/r[e-1]+o/r[e])}let o=`M${e[0].x},${e[0].y}`;for(let r=0;r<t-1;r+=1){let t=e[r].x+i[r]/3,n=e[r].y+a[r]*i[r]/3,s=e[r+1].x-i[r]/3,l=e[r+1].y-a[r+1]*i[r]/3;o+=`C${t.toFixed(2)},${n.toFixed(2)} ${s.toFixed(2)},${l.toFixed(2)} ${e[r+1].x.toFixed(2)},${e[r+1].y.toFixed(2)}`}return o}let _="(prefers-reduced-motion: reduce)",N=e=>{let t=window.matchMedia(_);return t.addEventListener("change",e),()=>t.removeEventListener("change",e)};function C(){return i.useSyncExternalStore(N,()=>window.matchMedia(_).matches,()=>!1)}let $=Number(i.version.split(".")[0])>=19;function A(){return $?(0,t.jsx)("style",{href:"indicator-chart",precedence:"default",children:W}):(0,t.jsx)("style",{hidden:!0,dangerouslySetInnerHTML:{__html:W}})}function S({ranges:e,value:r,onChange:a,reduce:o,label:n="Período"}){let s=Math.max(0,e.findIndex(e=>e.label===r)),c=100/e.length,d=i.useRef(null);return(0,t.jsxs)("div",{ref:d,role:"tablist","aria-label":n,className:"ic-range",onKeyDown:t=>{let i={ArrowLeft:s-1,ArrowRight:s+1,Home:0,End:e.length-1};if(!(t.key in i))return;t.preventDefault();let r=(i[t.key]+e.length)%e.length;a(e[r].label),d.current?.querySelectorAll("[role=tab]")[r]?.focus()},children:[(0,t.jsx)("span",{"aria-hidden":"true",className:"ic-range__thumb",style:{width:`calc(${c}% - 4px)`,transform:`translateX(calc(${100*s}% + ${4*s}px))`,transition:o?void 0:`transform 380ms ${l}`}}),e.map(e=>{let i=e.label===r;return(0,t.jsx)("button",{type:"button",role:"tab","aria-selected":i,tabIndex:i?0:-1,onClick:()=>a(e.label),className:"ic-range__tab",style:{flex:`0 0 ${c}%`},children:e.label},e.label)})]})}function R({status:e="ready",height:i=300,empty:r,error:a,onRetry:o,children:n}){let s=C();if("loading"===e)return(0,t.jsxs)("div",{"aria-busy":"true","aria-live":"polite",children:[(0,t.jsx)("div",{className:"ic-skeleton",style:{height:i},"aria-hidden":"true",children:(0,t.jsx)(F,{pulse:!s})}),(0,t.jsx)("span",{className:"ic-sr-only",children:"Carregando o gráfico"})]});if("empty"===e){let{title:e="Sem dados ainda",description:a="Assim que os dados chegarem, o gráfico se preenche sozinho.",action:o}=r??{};return(0,t.jsx)(D,{height:i,reduce:s,icon:(0,t.jsx)(z,{}),title:e,description:a,action:o})}if("error"===e){let{title:e="Não deu para carregar o gráfico",description:r="A requisição falhou. Confira a conexão e tente de novo.",retryLabel:n="Tentar de novo"}=a??{};return(0,t.jsx)(D,{height:i,reduce:s,tone:"error",icon:(0,t.jsx)(B,{}),title:e,description:r,action:o?(0,t.jsxs)("button",{type:"button",onClick:o,className:"ic-state__action",children:[(0,t.jsx)(L,{}),n]}):null})}return(0,t.jsx)(t.Fragment,{children:n})}function F({pulse:e}){return(0,t.jsxs)("div",{className:"ic-skeleton__line",children:[[0,1,2,3].map(e=>(0,t.jsx)("div",{className:"ic-skeleton__grid"},e)),(0,t.jsx)("svg",{className:"ic-skeleton__curve",preserveAspectRatio:"none",viewBox:"0 0 100 40","aria-hidden":"true",children:(0,t.jsx)("path",{d:"M0,30 C12,10 22,34 34,22 C46,10 54,28 66,16 C78,6 88,20 100,8",fill:"none",strokeWidth:2,vectorEffect:"non-scaling-stroke",style:e?{animation:"ic-pulse 1.5s ease-in-out 120ms infinite alternate"}:void 0})})]})}function D({height:e,reduce:i,tone:r,icon:a,title:o,description:n,action:s}){return(0,t.jsxs)("div",{className:"ic-state",style:{height:e},role:"status",children:[(0,t.jsx)("div",{"aria-hidden":"true",className:"ic-state__ghost",children:(0,t.jsx)(F,{pulse:!1})}),(0,t.jsxs)("div",{className:"ic-state__body",style:i?void 0:{animation:`ic-enter 480ms ${l} both`},children:[(0,t.jsx)("span",{className:"ic-state__icon","data-tone":r,children:a}),(0,t.jsx)("p",{className:"ic-state__title",children:o}),n?(0,t.jsx)("p",{className:"ic-state__text",children:n}):null,s?(0,t.jsx)("div",{className:"ic-state__actions",children:s}):null]})]})}function z(){return(0,t.jsx)("svg",{width:"17",height:"17",viewBox:"0 0 24 24",fill:"none","aria-hidden":"true",children:(0,t.jsx)("path",{d:"M4 19h16M7 16V9m5 7V5m5 11v-4",stroke:"currentColor",strokeWidth:"1.7",strokeLinecap:"round"})})}function B(){return(0,t.jsx)("svg",{width:"17",height:"17",viewBox:"0 0 24 24",fill:"none","aria-hidden":"true",children:(0,t.jsx)("path",{d:"M12 8v5m0 3.5v.5M10.3 3.9 2.6 17.3A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.7L13.7 3.9a2 2 0 0 0-3.4 0Z",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round",strokeLinejoin:"round"})})}function L(){return(0,t.jsx)("svg",{width:"13",height:"13",viewBox:"0 0 24 24",fill:"none","aria-hidden":"true",children:(0,t.jsx)("path",{d:"M20 11A8 8 0 1 0 18 16M20 5v6h-6",stroke:"currentColor",strokeWidth:"1.9",strokeLinecap:"round",strokeLinejoin:"round"})})}function I({caption:e,columns:i,rows:r}){return(0,t.jsx)("div",{className:"ic-sr-only",children:(0,t.jsxs)("table",{children:[(0,t.jsx)("caption",{children:e}),(0,t.jsx)("thead",{children:(0,t.jsx)("tr",{children:i.map(e=>(0,t.jsx)("th",{scope:"col",children:e},e))})}),(0,t.jsx)("tbody",{children:r.map((e,i)=>(0,t.jsx)("tr",{children:e.map((e,i)=>0===i?(0,t.jsx)("th",{scope:"row",children:e},i):(0,t.jsx)("td",{children:e},i))},i))})]})})}let W=`
/* o que o projeto pode trocar com uma classe (largura, margem): na camada base, que vem antes das classes de
   componente e dos utilit\xe1rios (Tailwind v4) e perde para o CSS fora de camada (Tailwind v3, CSS Modules, CSS comum) */
@layer base {
  .ic-root { width: 100%; margin: 0; }
}

/* as cores: claro de f\xe1brica; escuro com theme="dark" ou, sem theme, dentro da classe dark do projeto (a do shadcn e
   do next-themes). D\xe1 para trocar qualquer uma no CSS do projeto */
.ic-root {
  --ic-up: #059669;
  --ic-down: #e11d48;
  --ic-surface: #fff;
  --ic-rsi: #7c3aed;
  --ic-macd: #2563eb;
  --ic-signal: #f59e0b;
  --ic-axis: oklch(70.8% 0 0);
  --ic-muted: oklch(55.6% 0 0);
  --ic-strong: oklch(14.5% 0 0);
  --ic-pill: oklch(20.5% 0 0);
  --ic-pill-text: #fff;
  --ic-track: rgb(0 0 0 / 0.045);
  --ic-thumb: #fff;
  --ic-thumb-ring: rgb(0 0 0 / 0.06);
  --ic-tab: oklch(55.6% 0 0);
  --ic-tab-hover: oklch(26.9% 0 0);
  --ic-ring: rgb(0 0 0 / 0.2);
  --ic-faint: rgb(0 0 0 / 0.05);
  --ic-ghost: rgb(0 0 0 / 0.1);
  --ic-box: rgb(0 0 0 / 0.015);
  --ic-box-border: rgb(0 0 0 / 0.06);
  --ic-icon-bg: #fff;
  --ic-icon-border: rgb(0 0 0 / 0.07);
  --ic-error: color-mix(in oklab, oklch(64.5% 0.246 16.439) 90%, transparent);
  --ic-title: oklch(20.5% 0 0);
  --ic-button: #fff;
  --ic-button-text: oklch(20.5% 0 0);
  --ic-button-hover: rgb(0 0 0 / 0.03);
  --ic-button-border: rgb(0 0 0 / 0.1);
}
.dark .ic-root:not([data-ic-theme="light"]), .ic-root[data-ic-theme="dark"] {
  --ic-up: #34d399;
  --ic-down: #fb7185;
  --ic-surface: #0a0a0a;
  --ic-axis: oklch(55.6% 0 0);
  --ic-muted: oklch(70.8% 0 0);
  --ic-strong: #fff;
  --ic-pill: #fff;
  --ic-pill-text: oklch(14.5% 0 0);
  --ic-track: rgb(255 255 255 / 0.07);
  --ic-thumb: rgb(255 255 255 / 0.12);
  --ic-thumb-ring: rgb(255 255 255 / 0.1);
  --ic-tab: oklch(70.8% 0 0);
  --ic-tab-hover: oklch(92.2% 0 0);
  --ic-ring: rgb(255 255 255 / 0.25);
  --ic-faint: rgb(255 255 255 / 0.06);
  --ic-ghost: rgb(255 255 255 / 0.12);
  --ic-box: rgb(255 255 255 / 0.02);
  --ic-box-border: rgb(255 255 255 / 0.08);
  --ic-icon-bg: oklch(20.5% 0 0);
  --ic-icon-border: rgb(255 255 255 / 0.1);
  --ic-error: color-mix(in oklab, oklch(71.2% 0.194 13.428) 90%, transparent);
  --ic-title: oklch(97% 0 0);
  --ic-button: rgb(255 255 255 / 0.06);
  --ic-button-text: #fff;
  --ic-button-hover: rgb(255 255 255 / 0.1);
  --ic-button-border: rgb(255 255 255 / 0.12);
}

/* nada de texto herdado da p\xe1gina: o gr\xe1fico fica igual em qualquer projeto */
.ic-root {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  color: var(--ic-axis);
  font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: normal;
  text-align: left;
  text-transform: none;
  text-shadow: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.ic-root *, .ic-root *::before, .ic-root *::after { box-sizing: border-box; }
.ic-root p { margin: 0; }
.ic-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
.ic-num { font-variant-numeric: tabular-nums; }

/* o cabe\xe7alho: o ativo, o pre\xe7o com a varia\xe7\xe3o e a linha dos indicadores; o per\xedodo \xe0 direita */
.ic-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px 16px;
  margin-bottom: 12px;
}
.ic-title { display: flex; align-items: baseline; gap: 8px; }
.ic-symbol { color: var(--ic-strong); font-size: 12px; font-weight: 500; letter-spacing: 0.025em; }
.ic-name { color: var(--ic-muted); font-size: 12px; }
.ic-quote { display: flex; align-items: flex-end; gap: 10px; margin-top: 4px; }
.ic-price { color: var(--ic-strong); font-size: 24px; font-weight: 500; line-height: 1; }
.ic-change { margin-bottom: 2px; font-size: 12px; }
.ic-stats { display: flex; flex-wrap: wrap; align-items: center; column-gap: 12px; margin-top: 6px; font-size: 10.5px; }
.ic-stat { color: var(--ic-muted); }
.ic-stat__value { color: var(--ic-strong); }

/* o per\xedodo: a p\xedlula, o fundo que desliza e os bot\xf5es */
.ic-range {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: 2px;
  border-radius: 9999px;
  background: var(--ic-track);
}
.ic-range__thumb {
  position: absolute;
  top: 2px;
  bottom: 2px;
  left: 2px;
  border-radius: 9999px;
  background: var(--ic-thumb);
  box-shadow: 0 0 0 1px var(--ic-thumb-ring), 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
}
.ic-range__tab {
  position: relative;
  z-index: 10;
  margin: 0;
  padding: 4px 10px;
  border: 0;
  border-radius: 9999px;
  background: none;
  color: var(--ic-tab);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 11px;
  font-weight: 400;
  line-height: 1;
  letter-spacing: 0.025em;
  text-transform: none;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  transition: color 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
.ic-range__tab[aria-selected="true"] { color: var(--ic-strong); }
@media (hover: hover) {
  .ic-range__tab[aria-selected="false"]:hover { color: var(--ic-tab-hover); }
}
.ic-range__tab:focus-visible { outline: 2px solid transparent; box-shadow: 0 0 0 2px var(--ic-ring); }

/* o gr\xe1fico */
.ic-chart { position: relative; width: 100%; }
.ic-svg {
  display: block;
  width: 100%;
  overflow: visible;
  touch-action: pan-y;
  -webkit-user-select: none;
  user-select: none;
  border-radius: 6px;
}
.ic-svg:focus { outline: none; }
.ic-svg:focus-visible { outline: 2px solid var(--ic-ring); outline-offset: 4px; }
.ic-pane-label { text-transform: uppercase; letter-spacing: 0.05em; }
.ic-pill { fill: var(--ic-pill); }
.ic-pill__text { fill: var(--ic-pill-text); }

/* carregando, vazio e erro */
.ic-skeleton { position: relative; width: 100%; overflow: hidden; }
.ic-skeleton__line { position: relative; display: flex; flex-direction: column; justify-content: space-between; height: 100%; padding: 16px 0; }
.ic-skeleton__grid { width: 100%; height: 1px; background: var(--ic-faint); }
.ic-skeleton__curve { position: absolute; left: 0; right: 0; top: 25%; width: 100%; height: 50%; overflow: visible; }
.ic-skeleton__curve path { stroke: var(--ic-ghost); }
.ic-state {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  overflow: hidden;
  border: 1px solid var(--ic-box-border);
  border-radius: 12px;
  background: var(--ic-box);
}
.ic-state__ghost {
  position: absolute;
  inset: 16px 20px;
  opacity: 0.6;
  pointer-events: none;
  -webkit-mask-image: radial-gradient(ellipse 62% 58% at 50% 50%, transparent 34%, black 78%);
  mask-image: radial-gradient(ellipse 62% 58% at 50% 50%, transparent 34%, black 78%);
}
.dark .ic-root:not([data-ic-theme="light"]) .ic-state__ghost, .ic-root[data-ic-theme="dark"] .ic-state__ghost { opacity: 0.5; }
.ic-state__body {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  max-width: 38ch;
  padding: 0 24px;
  text-align: center;
}
.ic-state__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin-bottom: 8px;
  border: 1px solid var(--ic-icon-border);
  border-radius: 12px;
  background: var(--ic-icon-bg);
  color: var(--ic-muted);
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}
.ic-state__icon[data-tone="error"] { color: var(--ic-error); }
.ic-state__title { color: var(--ic-title); font-size: 13px; font-weight: 500; }
.ic-state__text { color: var(--ic-muted); font-size: 12px; line-height: 1.625; }
.ic-state__actions { margin-top: 12px; }
.ic-state__action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  padding: 6px 12px;
  border: 1px solid var(--ic-button-border);
  border-radius: 9999px;
  background: var(--ic-button);
  color: var(--ic-button-text);
  font: inherit;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
}
.ic-state__action:hover { background: var(--ic-button-hover); }
.ic-state__action:focus-visible { outline: 2px solid transparent; box-shadow: 0 0 0 2px var(--ic-ring); }

.ic-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

@keyframes ic-rise { from { transform: scaleY(0); opacity: 0; } to { transform: scaleY(1); opacity: 1; } }
@keyframes ic-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
@keyframes ic-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes ic-pulse { from { opacity: 1; } to { opacity: 0.4; } }
@keyframes ic-enter { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
`;function q(e,t){let i=2/(t+1),r=[],a=e[0]??0;for(let t=0;t<e.length;t+=1)r.push(a=0===t?e[0]:e[t]*i+a*(1-i));return r}function E({className:e,data:d=m,symbol:u="ORB",name:h="Órbita",ranges:x=c,defaultRange:p="3M",height:f=460,status:g="ready",onRetry:b,theme:_}){let N=C(),[$,F]=function(){let e=i.useRef(null),[t,r]=i.useState(0);return i.useEffect(()=>{let t=e.current;if(!t)return;let i=new ResizeObserver(([e])=>{r(e.contentRect.width)});return i.observe(t),r(t.clientWidth),()=>i.disconnect()},[]),[e,t]}(),D=i.useRef(null),[z,B]=i.useState(()=>x.find(e=>e.label===p)?.label??x[x.length-1].label),[L,W]=i.useState(null),P=x.find(e=>e.label===z)??x[x.length-1],O=i.useMemo(()=>d.map(e=>e.close),[d]),T=i.useMemo(()=>(function(e,t=14){let i=Array(e.length).fill(null);if(e.length<=t)return i;let r=0,a=0;for(let i=1;i<=t;i+=1){let t=e[i]-e[i-1];t>=0?r+=t:a-=t}r/=t,a/=t,i[t]=0===a?100:100-100/(1+r/a);for(let o=t+1;o<e.length;o+=1){let n=e[o]-e[o-1];r=(r*(t-1)+Math.max(0,n))/t,a=(a*(t-1)+Math.max(0,-n))/t,i[o]=0===a?100:100-100/(1+r/a)}return i})(O),[O]),U=i.useMemo(()=>(function(e,t=12,i=26,r=9){let a=q(e,t),o=q(e,i),n=e.map((e,t)=>a[t]-o[t]),s=q(n,r);return{line:n,signal:s,histogram:n.map((e,t)=>e-s[t])}})(O),[O]),H=i.useMemo(()=>{let e=P.bars;return null==e||e>=d.length?0:d.length-e},[d.length,P.bars]),X=i.useMemo(()=>d.slice(H),[d,H]),Y=i.useMemo(()=>T.slice(H),[T,H]),K=i.useMemo(()=>({line:U.line.slice(H),signal:U.signal.slice(H),histogram:U.histogram.slice(H)}),[U,H]),V=X.length,Z=Math.max(F,260),G=Z-58,J=Math.max(1,G-12),Q=f-22,ee=Q-12-28,et=12+.54*ee,ei=et+14,er=ei+.22*ee,ea=er+14,eo=ea+.24*ee,en=J/Math.max(V,1),es=i.useCallback(e=>12+en*(e+.5),[12,en]),el=Math.max(1,Math.min(.62*en,12)),ec=i.useMemo(()=>{if(!V)return[0,1];let e=1/0,t=-1/0;for(let i of X)i.low<e&&(e=i.low),i.high>t&&(t=i.high);let i=(t-e)*.1||1;return[e-i,t+i]},[X,V]),[ed,eu]=function(e,{duration:t=520,enabled:r=!0}={}){let[a,o]=i.useState(e),n=i.useRef(e),s=i.useRef(e),l=i.useRef(e),c=i.useRef(0),d=i.useRef(0);return(i.useEffect(()=>{if(!r)return;let i=l.current;if(!(i.length!==e.length||e.some((e,t)=>e!==i[t])))return;if(l.current=e,n.current.length!==e.length){n.current=e,s.current=e,cancelAnimationFrame(d.current),d.current=requestAnimationFrame(()=>o(e));return}s.current=n.current,c.current=performance.now(),cancelAnimationFrame(d.current);let a=e=>{let i=Math.min(1,(e-c.current)/t),r=1-Math.pow(1-i,3),u=s.current,h=l.current.map((e,t)=>u[t]+(e-u[t])*r);n.current=h,o(h),i<1&&(d.current=requestAnimationFrame(a))};d.current=requestAnimationFrame(a)}),i.useEffect(()=>()=>cancelAnimationFrame(d.current),[]),r&&a.length===e.length)?a:e}([ec[0],ec[1]],{duration:520,enabled:!N}),eh=i.useCallback(e=>et-(e-ed)/(eu-ed||1)*(et-12),[ed,eu,et,12]),em=i.useCallback(e=>er-e/100*(er-ei),[er,ei]),ex=i.useMemo(()=>{let e=1e-6;for(let t=0;t<K.line.length;t+=1)e=Math.max(e,Math.abs(K.line[t]),Math.abs(K.signal[t]),Math.abs(K.histogram[t]));return 1.15*e},[K]),ep=(ea+eo)/2,ef=i.useCallback(e=>ep-e/ex*((eo-ea)/2),[ep,ex,eo,ea]),eg=i.useMemo(()=>w(X.map((e,t)=>({x:es(t),y:eh(e.close)}))),[X,es,eh]),eb=i.useMemo(()=>w(Y.map((e,t)=>null==e?null:{x:es(t),y:em(e)}).filter(e=>null!=e)),[Y,es,em]),ev=i.useMemo(()=>w(K.line.map((e,t)=>({x:es(t),y:ef(e)}))),[K.line,es,ef]),ey=i.useMemo(()=>w(K.signal.map((e,t)=>({x:es(t),y:ef(e)}))),[K.signal,es,ef]),ej=i.useMemo(()=>(function(e,t,i=5){if(!Number.isFinite(e)||!Number.isFinite(t)||t<=e)return[e];let r=(t-e)/i,a=Math.pow(10,Math.floor(Math.log10(r))),o=r/a,n=(o>=7.5?10:o>=3.5?5:o>=2.25?2.5:o>=1.5?2:1)*a,s=Math.ceil(e/n)*n,l=[];for(let e=s;e<=t+.001*n;e+=n)l.push(Math.round(e/n)*n);return l})(ed,eu,4),[ed,eu]),ek=i.useMemo(()=>{if(!V)return[];let e=Math.max(1,Math.floor((V-1)/(Math.max(2,Math.min(6,Math.floor(J/96)))-1||1))),t=[];for(let i=0;i<V;i+=e)t.push(i);if(t[t.length-1]!==V-1){for(;t.length&&es(V-1)-es(t[t.length-1])<62;)t.pop();t.push(V-1)}return t},[V,J,es]),eM=e=>{let t=D.current;if(!t)return;let i=t.getBoundingClientRect();W(Math.max(0,Math.min(V-1,Math.floor(((e-i.left)/i.width*Z-12)/en))))},ew=X[V-1],e_=null!=L&&L<V?L:null,eN=e_??V-1,eC=X[eN],e$=Y[eN],eA=K.line[eN],eS=K.signal[eN],eR=X[0]?.close??0,eF=eR?((eC?.close??0)-eR)/eR*100:0,eD=eR?((ew?.close??0)-eR)/eR*100:0,ez=eF>=0?r:a,eB=eD>=0?r:a,eL=function({count:e,index:t,setIndex:r}){return i.useCallback(i=>{let{key:a}=i;if("Escape"===a){if(null==t)return;i.preventDefault(),r(null);return}if("Home"===a||"End"===a){i.preventDefault(),r("Home"===a?0:e-1);return}if("ArrowLeft"!==a&&"ArrowRight"!==a)return;i.preventDefault();let o="ArrowRight"===a?1:-1;r(t=>{let i=(t??e-1)+o;return Math.max(0,Math.min(e-1,i))})},[e,t,r])}({count:V,index:e_,setIndex:W}),eI=null==e_?null:Math.max(40,Math.min(G-27-1,es(e_))),eW=i.useId().replace(/:/g,""),eq=F>0,eE=(e,i)=>(0,t.jsx)("text",{x:14,y:i+10,fontSize:9.5,fontWeight:600,fill:"currentColor",opacity:.55,className:"ic-mono ic-pane-label",children:e});return(0,t.jsxs)("div",{ref:$,className:((...e)=>e.filter(Boolean).join(" "))("ic-root",e),"data-ic-theme":_,children:[(0,t.jsx)(A,{}),(0,t.jsxs)("div",{className:"ic-head",children:[(0,t.jsxs)("div",{children:[(0,t.jsxs)("div",{className:"ic-title",children:[(0,t.jsx)("span",{className:"ic-symbol ic-mono",children:u}),(0,t.jsx)("span",{className:"ic-name",children:h})]}),(0,t.jsxs)("div",{className:"ic-quote",children:[(0,t.jsx)("span",{className:"ic-price ic-mono ic-num",children:v(eC?.close??0)}),(0,t.jsx)("span",{className:"ic-change ic-mono ic-num",style:{color:ez},children:j(eF)})]}),(0,t.jsxs)("div",{className:"ic-stats ic-mono ic-num",children:[(0,t.jsx)("span",{children:eC?M(eC.t):""}),(0,t.jsxs)("span",{className:"ic-stat",children:["RSI"," ",(0,t.jsx)("span",{className:"ic-stat__value",style:{color:null==e$?void 0:e$>=70?a:e$<=30?r:void 0},children:null==e$?"—":k(e$,1)})]}),(0,t.jsxs)("span",{className:"ic-stat",children:["MACD ",(0,t.jsx)("span",{className:"ic-stat__value",children:null==eA?"—":k(eA,2)})]}),(0,t.jsxs)("span",{className:"ic-stat",children:["Sinal ",(0,t.jsx)("span",{className:"ic-stat__value",children:null==eS?"—":k(eS,2)})]})]})]}),(0,t.jsx)(S,{ranges:x,value:z,onChange:B,reduce:N})]}),(0,t.jsx)(R,{status:g,height:f,empty:{title:"Sem dados de preço",description:"Os indicadores precisam de pelo menos 26 candles para calcular o MACD."},onRetry:b,children:(0,t.jsx)("div",{className:"ic-chart",style:{height:f},children:eq?(0,t.jsxs)("svg",{ref:D,width:Z,height:f,viewBox:`0 0 ${Z} ${f}`,className:"ic-svg",role:"img","aria-label":`${u} ${h} com RSI e MACD, per\xedodo de ${z}. ${v(ew?.close??0)}, ${j(eD)}.`,tabIndex:0,onKeyDown:eL,onBlur:()=>W(null),onPointerMove:e=>eM(e.clientX),onPointerDown:e=>eM(e.clientX),onPointerLeave:()=>W(null),children:[(0,t.jsxs)("defs",{children:[(0,t.jsxs)("linearGradient",{id:`${eW}-price`,x1:"0",y1:"0",x2:"0",y2:"1",children:[(0,t.jsx)("stop",{offset:"0%",stopColor:eB,stopOpacity:.24}),(0,t.jsx)("stop",{offset:"100%",stopColor:eB,stopOpacity:0})]}),(0,t.jsx)("clipPath",{id:`${eW}-rsi`,children:(0,t.jsx)("rect",{x:12,y:ei,width:J,height:Math.max(0,er-ei)})})]}),(0,t.jsx)("g",{shapeRendering:"crispEdges",children:ej.map(e=>{let i=eh(e);return i<11||i>et+1||ew&&13>Math.abs(i-eh(ew.close))?null:(0,t.jsx)("line",{x1:12,x2:G,y1:i,y2:i,stroke:"currentColor",strokeOpacity:.12,strokeDasharray:"2 4"},e)})}),(0,t.jsx)("g",{className:"ic-mono",children:ej.map(e=>{let i=eh(e);return i<11||i>et+1||ew&&13>Math.abs(i-eh(ew.close))?null:(0,t.jsx)("text",{x:G+8,y:i,dominantBaseline:"middle",fontSize:10.5,fill:"currentColor",className:"ic-num",children:y(e)},e)})}),(0,t.jsxs)("g",{children:[(0,t.jsx)("path",{d:`${eg}L${es(V-1)},${et}L${es(0)},${et}Z`,fill:`url(#${eW}-price)`,style:N?void 0:{animation:"ic-fade 560ms ease-out both"}}),(0,t.jsx)("path",{d:eg,fill:"none",stroke:eB,strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round",pathLength:1,style:N?void 0:{strokeDasharray:1,animation:`ic-draw 880ms ${l} both`}})]},`${z}-price`),eE(`${u} \xb7 fechamento`,2),ew?(0,t.jsxs)("g",{children:[(0,t.jsx)("line",{x1:12,x2:G,y1:eh(ew.close),y2:eh(ew.close),stroke:eB,strokeOpacity:.5,strokeDasharray:"4 4"}),(0,t.jsx)("rect",{x:G+3,y:eh(ew.close)-9,width:50,height:18,rx:4,fill:eB}),(0,t.jsx)("text",{x:G+3+25,y:eh(ew.close),textAnchor:"middle",dominantBaseline:"middle",fontSize:10.5,fontWeight:600,fill:o,className:"ic-mono ic-num",children:y(ew.close)})]}):null,(0,t.jsxs)("g",{clipPath:`url(#${eW}-rsi)`,children:[(0,t.jsx)("rect",{x:12,y:em(70),width:J,height:Math.max(0,em(30)-em(70)),fill:"currentColor",opacity:.05}),[30,70].map(e=>(0,t.jsx)("line",{x1:12,x2:G,y1:em(e),y2:em(e),stroke:70===e?a:r,strokeOpacity:.45,strokeDasharray:"3 3"},e)),(0,t.jsx)("path",{d:eb,fill:"none",stroke:n,strokeWidth:1.6,strokeLinecap:"round",pathLength:1,style:N?void 0:{strokeDasharray:1,animation:`ic-draw 880ms ${l} 120ms both`}},`${z}-rsi`)]}),(0,t.jsx)("g",{className:"ic-mono",children:[30,70].map(e=>(0,t.jsx)("text",{x:G+8,y:em(e),dominantBaseline:"middle",fontSize:9.5,fill:"currentColor",className:"ic-num",children:e},e))}),eE("RSI 14",ei-10),(0,t.jsxs)("g",{children:[(0,t.jsx)("line",{x1:12,x2:G,y1:ep,y2:ep,stroke:"currentColor",strokeOpacity:.2,shapeRendering:"crispEdges"}),K.histogram.map((e,i)=>{let o=ef(e),n=e>=0;return(0,t.jsx)("rect",{x:es(i)-el/2,y:n?o:ep,width:el,height:Math.max(.75,Math.abs(ep-o)),rx:1,fill:n?r:a,opacity:null!=e_&&e_!==i?.22:.5,style:{transition:N?void 0:"opacity 160ms ease-out",transformBox:"fill-box",transformOrigin:n?"bottom center":"top center",animation:N?void 0:`ic-rise 420ms ${l} ${V<=1?0:i/(V-1)*300}ms both`}},i)}),(0,t.jsx)("path",{d:ev,fill:"none",stroke:s,strokeWidth:1.5}),(0,t.jsx)("path",{d:ey,fill:"none",stroke:"var(--ic-signal)",strokeWidth:1.5,strokeDasharray:"4 3"})]},`${z}-macd`),eE("MACD 12 · 26 · 9",ea-10),(0,t.jsx)("g",{className:"ic-mono",children:ek.map(e=>{let i=X[e];if(!i)return null;let r=Math.max(26,Math.min(G-14,es(e)));return null!=eI&&50>Math.abs(r-eI)?null:(0,t.jsx)("text",{x:r,y:Q+14,textAnchor:"middle",fontSize:10.5,fill:"currentColor",className:"ic-num",children:M(i.t)},e)})}),null!=e_&&null!=eI?(0,t.jsxs)("g",{children:[(0,t.jsx)("line",{x1:es(e_),x2:es(e_),y1:12,y2:eo,stroke:"currentColor",strokeOpacity:.42,strokeDasharray:"3 3"}),(0,t.jsx)("circle",{cx:es(e_),cy:eh(X[e_].close),r:4,fill:o,stroke:eB,strokeWidth:2}),null!=Y[e_]?(0,t.jsx)("circle",{cx:es(e_),cy:em(Y[e_]),r:3,fill:o,stroke:n,strokeWidth:1.75}):null,(0,t.jsx)("circle",{cx:es(e_),cy:ef(K.line[e_]),r:3,fill:o,stroke:s,strokeWidth:1.75}),(0,t.jsxs)("g",{transform:`translate(${eI}, ${Q+4})`,children:[(0,t.jsx)("rect",{x:-27,y:0,width:54,height:16,rx:4,className:"ic-pill"}),(0,t.jsx)("text",{x:0,y:8.5,textAnchor:"middle",dominantBaseline:"middle",fontSize:10,fontWeight:600,className:"ic-pill__text ic-mono ic-num",children:M(X[e_].t)})]})]}):null]}):null})}),(0,t.jsx)(I,{caption:`${u} ${h}: fechamento, RSI e MACD por dia`,columns:["Dia","Fechamento","RSI","MACD"],rows:X.map((e,t)=>[M(e.t),v(e.close),null==Y[t]?"—":k(Y[t],1),k(K.line[t],2)])})]})}function P(e){return(0,t.jsxs)("div",{className:"ic-demo",children:[(0,t.jsx)("style",{dangerouslySetInnerHTML:{__html:O}}),(0,t.jsx)("div",{className:"ic-demo__frame",children:(0,t.jsx)(E,{theme:"dark",...e})})]})}let O=`
.ic-demo {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 100%;
  min-height: 100svh;
  background: #0a0a0a;
}
.ic-demo__frame { box-sizing: border-box; width: 100%; max-width: 672px; padding: 24px; }
`;var T=e.i(316034);let U=e=>{e.preventDefault(),e.stopPropagation()},H=[{at:0,rest:!0,o:0},{at:.5,rest:!0,o:1},{at:1.3,chart:[.1,.24],o:1},{at:3.9,chart:[.9,.24],o:1,sweep:!0},{at:4.7,tab:"1A",o:1},{at:5.9,tab:"1A",o:1},{at:6.7,chart:[.88,.3],o:1},{at:8.9,chart:[.16,.3],o:1,sweep:!0},{at:9.8,tab:"1M",o:1},{at:10.9,tab:"1M",o:1},{at:11.7,chart:[.12,.27],o:1},{at:13.5,chart:[.86,.27],o:1,sweep:!0},{at:14.3,tab:"3M",o:1},{at:15.3,tab:"3M",o:1},{at:16.1,rest:!0,o:0},{at:16.6,rest:!0,o:0}],X=[{at:4.95,tab:"1A"},{at:10.05,tab:"1M"},{at:14.55,tab:"3M"}],Y=H[H.length-1].at,K=[.62,.3];e.s(["default",0,function({mode:e,compact:r}){let a=(0,i.useRef)(null),o=(0,i.useRef)(null);return((0,i.useEffect)(()=>{if("tile"===e){var t,i;let e,r,n,s,l,c,d,u,h,m,x,p,f,g;return t=a.current,i=o.current,e=matchMedia("(prefers-reduced-motion: reduce)").matches,r=t.closest(".preview"),n=!1,s=NaN,l=0,c=0,d=0,u=(e,i,r,a)=>e.dispatchEvent(new PointerEvent(i,{bubbles:!0,cancelable:!0,composed:!0,clientX:r,clientY:a,pointerId:1,pointerType:"mouse",isPrimary:!0,relatedTarget:t})),h=e=>[...t.querySelectorAll("[role=tab]")].find(t=>t.textContent===e),m=e=>{e?t.dataset.press="":delete t.dataset.press},x=e=>{m(!1),h(e)?.click();let t=i.firstElementChild;t.classList.remove(T.default.on),t.offsetWidth,t.classList.add(T.default.on)},p=r=>{let a=l/1e3;l+=Math.min(100,r-c),c=r;let o=l/1e3;if(!e){for(let e of X)a<e.at-.14&&o>=e.at-.14&&m(!0),a<e.at&&o>=e.at&&x(e.tab);o>=Y&&(l-=1e3*Y,o-=Y)}(r=>{let a,o=t.getBoundingClientRect();if(!o.width||!t.offsetWidth)return;let l=o.width/t.offsetWidth,c=t.querySelector("svg.ic-svg"),d=c?.getBoundingClientRect(),m=(e,t,i)=>({x:(e.left+e.width*t-o.left)/l,y:(e.top+e.height*i-o.top)/l}),x={x:t.offsetWidth-10,y:t.offsetHeight-6},p=e=>{if("chart"in e)return d?.width?m(d,...e.chart):x;if("tab"in e){let t=h(e.tab)?.getBoundingClientRect();return t?.width?m(t,.55,.62):x}return x};if(e)a={...d?.width?m(d,...K):x,o:1};else{let e=1;for(;e<H.length-1&&H[e].at<r;)e++;let t=H[e-1],i=H[e],o=p(t),n=p(i),s=Math.min(1,Math.max(0,(r-t.at)/(i.at-t.at||1))),l=i.sweep?-(Math.cos(Math.PI*s)-1)/2:s<.5?4*s*s*s:1-(-2*s+2)**3/2;a={x:o.x+(n.x-o.x)*l,y:o.y+(n.y-o.y)*l,o:t.o+(i.o-t.o)*l}}i.style.transform=`translate3d(${a.x}px, ${a.y}px, 0)`,i.style.opacity=String(a.o);let f=o.left+a.x*l,g=o.top+a.y*l,b=!!(c&&d&&f>=d.left&&f<=d.right&&g>=d.top&&g<=d.bottom);c&&b&&!n&&u(c,"pointerover",f,g),c&&!b&&n&&u(c,"pointerout",f,g),n=b,c&&b&&f!==s&&u(c,"pointermove",f,g),s=f})(o),d=requestAnimationFrame(p)},g=new MutationObserver(f=()=>{let e=!r||r.classList.contains("is-playing");e&&!d?(c=performance.now(),d=requestAnimationFrame(p)):!e&&d&&(cancelAnimationFrame(d),d=0)}),r&&g.observe(r,{attributes:!0,attributeFilter:["class"]}),f(),()=>{g.disconnect(),cancelAnimationFrame(d)}}},[e]),"stage"===e)?(0,t.jsx)("div",{className:T.default.stage,children:(0,t.jsx)(P,{height:r?280:void 0})}):(0,t.jsxs)("div",{ref:a,className:`${T.default.stage} ${T.default.tile}`,"aria-hidden":"true",inert:!0,onPointerMove:e=>e.stopPropagation(),onPointerOver:e=>e.stopPropagation(),onPointerOut:e=>e.stopPropagation(),onClick:U,children:[(0,t.jsx)(P,{height:248}),(0,t.jsxs)("div",{ref:o,className:T.default.cursor,children:[(0,t.jsx)("span",{className:T.default.ripple}),(0,t.jsx)("svg",{viewBox:"0 0 14 21",width:"18",height:"27",children:(0,t.jsx)("path",{d:"M1 1v15.5l3.8-3.6 2.8 6.5 2.5-1.1-2.7-6.3h5.2z"})})]})]})}],603201)},982499,function(e){e.n(e.i(603201))}]);

//# debugId=53c4a062-ec99-b3e5-e3ba-a561fc93c575