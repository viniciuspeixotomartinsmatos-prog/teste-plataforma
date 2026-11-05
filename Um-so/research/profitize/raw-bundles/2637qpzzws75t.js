;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="37de5d94-8f0c-1b24-4bf2-be975ef9deae")}catch(e){}}();
(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,781028,e=>{e.v({cursor:"CircularNavigation-module__3NAg3q__cursor",ripple:"CircularNavigation-module__3NAg3q__ripple",stage:"CircularNavigation-module__3NAg3q__stage",tile:"CircularNavigation-module__3NAg3q__tile"})},618875,e=>{"use strict";var a=e.i(843476),n=e.i(271645);let t=Number(n.version.split(".")[0])>=19;function o(){return t?(0,a.jsx)("style",{href:"circular-navigation",precedence:"default",children:l}):(0,a.jsx)("style",{hidden:!0,dangerouslySetInnerHTML:{__html:l}})}function i({name:e,strokeWidth:n=2,className:t}){return(0,a.jsx)("svg",{className:t,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:n,strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",focusable:"false",dangerouslySetInnerHTML:{__html:c[e]}})}function r({icon:e}){return"string"==typeof e?(0,a.jsx)(i,{name:e,className:"cnav-icon"}):(0,a.jsx)(e,{className:"cnav-icon",strokeWidth:2,"aria-hidden":!0})}function s({navItems:e,isOpen:t,toggleMenu:c,activeHref:l,onNavigate:d,linkAs:u="a",label:p="Navegação",closeLabel:f="Fechar navegação",className:m}){let[h,v]=n.useState(t?"open":"closed"),[g,x]=n.useState(t);t!==g&&(x(t),v(t?"opening":"closing"));let b=n.useRef(null),y=n.useRef(null),w=n.useRef(null);if(n.useEffect(()=>{let e=b.current,a=document.activeElement;if("opening"===h&&(a&&a!==document.body&&!e?.contains(a)&&(w.current=a),y.current?.focus({preventScroll:!0})),"closing"===h&&(e?.contains(a)||a===document.body)&&(w.current?.focus({preventScroll:!0}),w.current=null),"opening"!==h&&"closing"!==h)return;let n=window.setTimeout(()=>v(e=>"opening"===e?"open":"closing"===e?"closed":e),1e3);return()=>window.clearTimeout(n)},[h]),"closed"===h)return(0,a.jsx)(o,{});let k="opening"===h?" is-opening":"closing"===h?" is-closing":"";return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(o,{}),(0,a.jsx)("div",{ref:b,className:"cnav-overlay"+k+(m?" "+m:""),role:"dialog","aria-modal":"true","aria-label":p,tabIndex:-1,onClick:e=>{e.target===e.currentTarget&&t&&c()},onKeyDown:e=>{if("Escape"===e.key){e.preventDefault(),t&&c();return}if("Tab"!==e.key||!b.current)return;let a=Array.from(b.current.querySelectorAll("a[href], button:not([disabled])")).filter(e=>e.tabIndex>=0);if(!a.length)return;let n=a[0],o=a[a.length-1],i=document.activeElement;e.shiftKey&&(i===n||i===b.current)?(e.preventDefault(),o.focus()):e.shiftKey||i!==o||(e.preventDefault(),n.focus())},children:(0,a.jsxs)("div",{className:"cnav-circle",onAnimationEnd:e=>{e.target===e.currentTarget&&v(e=>"opening"===e?"open":"closing"===e?"closed":e)},children:[(0,a.jsx)("button",{ref:y,type:"button",className:"cnav-close",onClick:()=>{t&&c()},"aria-label":f,children:(0,a.jsx)(i,{name:"x",className:"cnav-icon"})}),(0,a.jsx)("ul",{className:"cnav-list",children:e.map((n,o)=>{let i,s;return(0,a.jsx)("li",{className:"cnav-item",style:(i=2*Math.PI*o/e.length,s=150/420*100,{left:(50+150/420*100*Math.cos(i)).toFixed(3)+"%",top:(50+s*Math.sin(i)).toFixed(3)+"%"}),children:(0,a.jsxs)(u,{href:n.href,className:"cnav-link","aria-current":n.href===l?"page":void 0,onClick:e=>{d?.(n,e),t&&c()},children:[(0,a.jsx)(r,{icon:n.icon}),(0,a.jsx)("span",{className:"cnav-label",children:n.name})]})},n.href+n.name)})})]})})]})}let c={house:'<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',film:'<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M3 7.5h4"/><path d="M3 12h18"/><path d="M3 16.5h4"/><path d="M17 3v18"/><path d="M17 7.5h4"/><path d="M17 16.5h4"/>',music:'<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',trophy:'<path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"/><path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"/><path d="M18 9h1.5a1 1 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"/><path d="M6 9H4.5a1 1 0 0 1 0-5H6"/>',"file-text":'<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',settings:'<path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/>',search:'<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>',menu:'<path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/>',x:'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'},l=`
/* o fundo: a p\xe1gina inteira, escurecida e desfocada */
.cnav-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  margin: 0;
  padding: 16px;
  background: rgba(0, 0, 0, .8);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  outline: none;
  /* nada de texto herdado da p\xe1gina: o menu fica igual em qualquer projeto */
  font-family: ui-sans-serif, system-ui, -apple-system, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-style: normal;
  font-variant: normal;
  font-feature-settings: normal;
  font-variation-settings: normal;
  letter-spacing: normal;
  word-spacing: normal;
  text-align: center;
  text-transform: none;
  text-indent: 0;
  text-shadow: none;
  color: #fff;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-tap-highlight-color: transparent;
}
.cnav-overlay *, .cnav-overlay *::before, .cnav-overlay *::after { box-sizing: border-box; }

/* o c\xedrculo de vidro: 420 px, nunca maior que a tela menos o respiro */
.cnav-circle {
  position: relative;
  flex: none;
  width: min(var(--cnav-size, 420px), 100%, calc(100dvh - 32px));
  aspect-ratio: 1;
  margin: 0;
  border: 1px solid rgba(255, 255, 255, .1);
  border-radius: 50%;
  background: rgba(255, 255, 255, .05);
  box-shadow: inset 2px 2px 2px rgba(255, 255, 255, .5), inset -1px -1px 1px rgba(255, 255, 255, .3);
}

.cnav-icon { display: block; flex: none; width: 24px; height: 24px; }

/* o X, branco, no centro */
.cnav-close {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: #fff;
  color: #000;
  font: inherit;
  cursor: pointer;
  translate: -50% -50%;
  -webkit-appearance: none;
  appearance: none;
  transition: scale .2s cubic-bezier(.4, 0, .2, 1);
}
.cnav-close:active { scale: .94; }
.cnav-close:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }

/* os itens em volta: cada um centrado no seu ponto do c\xedrculo */
.cnav-list { position: absolute; inset: 0; margin: 0; padding: 0; list-style: none; }
.cnav-item { position: absolute; margin: 0; padding: 0; translate: -50% -50%; }
.cnav-item::marker { content: none; }
.cnav-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  margin: 0;
  padding: 0;
  border-radius: 50%;
  background: transparent;
  color: #fff;
  text-decoration: none;
  outline: none;
  transition: background-color .2s cubic-bezier(.4, 0, .2, 1), color .2s cubic-bezier(.4, 0, .2, 1);
}
.cnav-link .cnav-icon { margin-bottom: 4px; }
.cnav-label {
  display: block;
  max-width: 72px;
  overflow: hidden;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  white-space: nowrap;
  text-overflow: ellipsis;
  text-decoration: none;
}
/* a p\xe1gina atual */
.cnav-link[aria-current="page"] { background: rgba(255, 255, 255, .12); }
/* o hover (s\xf3 com mouse: no toque ele ficaria preso depois do toque) e o foco do teclado */
@media (hover: hover) {
  .cnav-link:hover { background: #fff; color: #000; }
}
.cnav-link:focus-visible { background: #fff; color: #000; box-shadow: 0 0 0 2px rgba(0, 0, 0, .8), 0 0 0 4px #fff; }

/* abrir e fechar: o c\xedrculo cresce do centro e o fundo acende, e o contr\xe1rio */
@keyframes cnav-grow { from { opacity: 0; scale: 0; } to { opacity: 1; scale: 1; } }
@keyframes cnav-shrink { from { opacity: 1; scale: 1; } to { opacity: 0; scale: 0; } }
@keyframes cnav-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes cnav-fade-out { from { opacity: 1; } to { opacity: 0; } }
.cnav-overlay.is-opening { animation: cnav-fade-in .4s cubic-bezier(.42, 0, .58, 1) both; }
.cnav-overlay.is-closing { animation: cnav-fade-out .4s cubic-bezier(.42, 0, .58, 1) both; pointer-events: none; }
.cnav-overlay.is-opening .cnav-circle { animation: cnav-grow .4s cubic-bezier(.42, 0, .58, 1) both; }
.cnav-overlay.is-closing .cnav-circle { animation: cnav-shrink .4s cubic-bezier(.42, 0, .58, 1) both; }

@media (prefers-reduced-motion: reduce) {
  .cnav-overlay, .cnav-overlay * { animation-duration: .01ms !important; transition-duration: .01ms !important; }
}
`,d=[{name:"Início",icon:"house",href:"#inicio"},{name:"Filmes",icon:"film",href:"#filmes"},{name:"Música",icon:"music",href:"#musica"},{name:"Esportes",icon:"trophy",href:"#esportes"},{name:"Notícias",icon:"file-text",href:"#noticias"},{name:"Ajustes",icon:"settings",href:"#ajustes"},{name:"Busca",icon:"search",href:"#busca"}];function u(){let[e,t]=n.useState(!1),[o,r]=n.useState(!1),[c,l]=n.useState(d[0]),u=()=>{t(e=>!e),r(!0)};return(0,a.jsxs)("div",{className:"cnav-demo",children:[(0,a.jsx)("style",{dangerouslySetInnerHTML:{__html:p}}),(0,a.jsx)("p",{className:"cnav-demo__eyebrow",children:"Você está em"}),(0,a.jsx)("h2",{className:"cnav-demo__title",children:c.name}),(0,a.jsxs)("button",{type:"button",className:"cnav-demo__open"+(o?"":" is-pulsing"),onClick:u,"aria-haspopup":"dialog","aria-expanded":e,children:[(0,a.jsx)(i,{name:"menu",className:"cnav-demo__icon"}),"Abrir navegação"]}),(0,a.jsx)(s,{navItems:d,isOpen:e,toggleMenu:u,activeHref:c.href,onNavigate:(e,a)=>{a.preventDefault(),l(e)}})]})}let p=`
.cnav-demo {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 100%;
  min-height: 100svh;
  margin: 0;
  padding: 32px;
  overflow: hidden;
  background:
    radial-gradient(32% 40% at 38% 44%, rgba(255, 94, 58, .32), transparent 70%),
    radial-gradient(30% 38% at 62% 56%, rgba(91, 91, 255, .34), transparent 70%),
    #0a0a0b;
  font-family: ui-sans-serif, system-ui, -apple-system, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: #fff;
  text-align: center;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.cnav-demo__eyebrow {
  margin: 0;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: rgba(255, 255, 255, .55);
}
.cnav-demo__title {
  margin: 4px 0 32px;
  font-family: inherit;
  font-size: 56px;
  font-weight: 600;
  line-height: 64px;
  letter-spacing: -.02em;
  color: #fff;
}
.cnav-demo__open {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  margin: 0;
  padding: 0 18px 0 16px;
  border: 0;
  border-radius: 999px;
  background: #fff;
  color: #0a0a0b;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  transition: background-color .2s, scale .2s;
}
.cnav-demo__open:hover { background: rgba(255, 255, 255, .88); }
.cnav-demo__open:active { scale: .97; }
.cnav-demo__open:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }
.cnav-demo__icon { display: block; width: 16px; height: 16px; }

/* o anel branco que se abre em volta do bot\xe3o e some, a cada 2 s, at\xe9 o menu abrir pela primeira vez */
@keyframes cnav-demo-pulse {
  0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, .5); }
  70% { box-shadow: 0 0 0 16px rgba(255, 255, 255, 0); }
  100% { box-shadow: 0 0 0 16px rgba(255, 255, 255, 0); }
}
.cnav-demo__open.is-pulsing { animation: cnav-demo-pulse 2s cubic-bezier(.4, 0, .6, 1) infinite; }
@media (prefers-reduced-motion: reduce) {
  .cnav-demo__open.is-pulsing { animation: none; }
}
`;var f=e.i(781028);let m=()=>{},h=[{name:"Início",icon:"house",href:"#inicio"},{name:"Filmes",icon:"film",href:"#filmes"},{name:"Música",icon:"music",href:"#musica"},{name:"Esportes",icon:"trophy",href:"#esportes"},{name:"Notícias",icon:"file-text",href:"#noticias"},{name:"Ajustes",icon:"settings",href:"#ajustes"},{name:"Busca",icon:"search",href:"#busca"}],v=[2,3,4,5];function g(){let e=(0,n.useRef)(null),[t,o]=(0,n.useState)({open:!1,over:null,hover:null,press:!1,cursor:{x:470,y:400},move:0,clicks:0});return(0,n.useEffect)(()=>{let a,n=e.current;n.querySelectorAll("button, [tabindex]").forEach(e=>e.tabIndex=-1);let t=e=>o(a=>({...a,...e})),i=e=>{let a=n.getBoundingClientRect(),t=n.querySelector(e).getBoundingClientRect(),o=a.width/n.offsetWidth||1;return{x:(t.left+t.width/2-a.left)/o,y:(t.top+t.height/2-a.top)/o}},r=e=>{let a=i(".cnav-circle"),t=n.querySelector(".cnav-circle").clientWidth,o=n.querySelector(`.cnav-item:nth-child(${e})`);return{x:a.x+(parseFloat(o.style.left)/100-.5)*t+18,y:a.y+(parseFloat(o.style.top)/100-.5)*t-2}},s=()=>({x:.74*n.offsetWidth,y:.84*n.offsetHeight});if(matchMedia("(prefers-reduced-motion: reduce)").matches){t({open:!0,hover:v[0]});let e=requestAnimationFrame(()=>t({cursor:r(v[0])}));return()=>cancelAnimationFrame(e)}let c=n.closest(".preview"),l=()=>!c||c.classList.contains("is-playing"),d=!0,u=new MutationObserver(()=>l()&&a?.());c&&u.observe(c,{attributes:!0,attributeFilter:["class"]});let p=async e=>{for(await new Promise(a=>setTimeout(a,e));d&&!l();)await new Promise(e=>a=e);return d},f=async()=>(o(e=>({...e,press:!0,clicks:e.clicks+1})),p(160));return(async()=>{for(t({cursor:s(),move:0});await p(1100);){let e=i(".cnav-demo__open");if(t({cursor:{x:e.x+48,y:e.y+2},move:750}),!await p(760)||(t({over:"button"}),!await p(380)||!await f())||(t({press:!1,over:null,open:!0}),!await p(650)))return;for(let e of v)if(t({cursor:r(e),move:460,hover:null}),!await p(470)||(t({hover:e}),!await p(480)))return;if(t({cursor:i(".cnav-circle"),move:560,hover:null}),!await p(570)||(t({over:"x"}),!await p(300)||!await f())||(t({press:!1,over:null,open:!1}),!await p(700)))return;t({cursor:s(),move:800})}})(),()=>{d=!1,u.disconnect()}},[]),(0,a.jsxs)("div",{ref:e,className:`${f.default.stage} ${f.default.tile}`,"data-open":t.open||void 0,"data-over":t.over??void 0,"data-hover":t.hover??void 0,"data-press":t.press||void 0,"aria-hidden":"true",children:[(0,a.jsx)(u,{}),(0,a.jsx)(s,{navItems:h,isOpen:!0,toggleMenu:m,activeHref:h[0].href,linkAs:"span"}),(0,a.jsxs)("div",{className:f.default.cursor,style:{"--x":`${t.cursor.x}px`,"--y":`${t.cursor.y}px`,"--move":`${t.move}ms`},children:[t.clicks>0&&(0,a.jsx)("span",{className:f.default.ripple},t.clicks),(0,a.jsx)("svg",{viewBox:"0 0 20 26","aria-hidden":"true",children:(0,a.jsx)("path",{d:"M2 2v19l5-4.5 3.5 7.5 3.1-1.4-3.4-7.3H17z"})})]})]})}e.s(["default",0,function({mode:e}){return"stage"===e?(0,a.jsx)("div",{className:f.default.stage,children:(0,a.jsx)(u,{})}):(0,a.jsx)(g,{})}],618875)},691601,function(e){e.n(e.i(618875))}]);

//# debugId=37de5d94-8f0c-1b24-4bf2-be975ef9deae