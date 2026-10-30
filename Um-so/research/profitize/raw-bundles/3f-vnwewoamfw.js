;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="a78a0cba-f431-0334-a502-3ff55dd2a601")}catch(e){}}();
(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,928917,e=>{e.v({compact:"InteractiveSelector-module__ZUCbiq__compact",stage:"InteractiveSelector-module__ZUCbiq__stage",tile:"InteractiveSelector-module__ZUCbiq__tile"})},799771,e=>{"use strict";var i=e.i(843476),t=e.i(271645);let a=Number(t.version.split(".")[0])>=19;function o(){return a?(0,i.jsx)("style",{href:"interactive-selector",precedence:"default",children:n}):(0,i.jsx)("style",{hidden:!0,dangerouslySetInnerHTML:{__html:n}})}let s=t.forwardRef(function({options:e,defaultIndex:a=0,index:s,onIndexChange:n,label:r="Opções",className:l,...d},c){let[p,x]=t.useState(a),[h,m]=t.useState(!1),u=t.useRef(null),f=t.useRef([]),b=Math.min(Math.max(s??p,0),e.length-1),g=t.useCallback(e=>{u.current=e,"function"==typeof c?c(e):c&&(c.current=e)},[c]);t.useEffect(()=>{let e=u.current;if(!e||"u"<typeof IntersectionObserver)return void m(!0);let i=new IntersectionObserver(e=>{e.some(e=>e.isIntersecting)&&(m(!0),i.disconnect())},{threshold:.15});return i.observe(e),()=>i.disconnect()},[]);let _=e=>{e!==b&&(void 0===s&&x(e),n?.(e))};return(0,i.jsxs)("div",{ref:g,className:"isel"+(l?" "+l:""),"data-shown":h||void 0,...d,children:[(0,i.jsx)(o,{}),(0,i.jsx)("div",{className:"isel__list",role:"radiogroup","aria-label":r,onKeyDown:i=>{let t,a=e.length;switch(i.key){case"ArrowRight":case"ArrowDown":t=(b+1)%a;break;case"ArrowLeft":case"ArrowUp":t=(b-1+a)%a;break;case"Home":t=0;break;case"End":t=a-1;break;default:return}i.preventDefault(),_(t),f.current[t]?.focus()},children:e.map((e,t)=>(0,i.jsxs)("button",{ref:e=>{f.current[t]=e},className:"isel__option",type:"button",role:"radio","aria-checked":t===b,tabIndex:t===b?0:-1,style:{"--isel-i":t},onClick:()=>_(t),children:[(0,i.jsx)("img",{className:"isel__img",src:e.image,alt:"",decoding:"async",draggable:!1}),(0,i.jsx)("span",{className:"isel__shade","aria-hidden":"true"}),(0,i.jsxs)("span",{className:"isel__label",children:[(0,i.jsx)("span",{className:"isel__icon","aria-hidden":"true",children:e.icon}),(0,i.jsxs)("span",{className:"isel__info",children:[(0,i.jsx)("span",{className:"isel__title",children:e.title}),null!=e.description&&(0,i.jsx)("span",{className:"isel__desc",children:e.description})]})]})]},t))})]})}),n=`
/* o que o projeto pode trocar com uma classe (posi\xe7\xe3o, margem, largura): na camada base, que vem antes das classes de
   componente e dos utilit\xe1rios (Tailwind v4, Panda, Chakra) e perde para o CSS fora de camada (Tailwind v3, CSS
   Modules, CSS comum) */
@layer base {
  .isel { position: relative; width: 100%; max-width: 900px; margin: 0; }
}
.isel[hidden] { display: none; }
.isel {
  box-sizing: border-box;
  display: block;
  /* as medidas de baixo s\xe3o da largura da faixa, n\xe3o da tela */
  container-type: inline-size;
  /* nada de texto herdado da p\xe1gina: a faixa fica igual em qualquer projeto */
  font-family: ui-sans-serif, system-ui, -apple-system, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-style: normal;
  font-variant: normal;
  font-feature-settings: normal;
  font-variation-settings: normal;
  letter-spacing: normal;
  word-spacing: normal;
  text-align: left;
  text-transform: none;
  text-indent: 0;
  text-shadow: none;
  color: #fff;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.isel *, .isel *::before, .isel *::after { box-sizing: border-box; }

.isel__list {
  position: relative;
  display: flex;
  align-items: stretch;
  width: 100%;
  height: 400px;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

/* cada foto: uma tira estreita (1 parte) ou aberta (7 partes), com moldura de 2 px */
.isel__option {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1 1 0%;
  flex-direction: column;
  justify-content: flex-end;
  min-width: 60px;
  min-height: 60px;
  margin: 0;
  padding: 0;
  overflow: hidden;
  border: 2px solid #292929;
  border-radius: 0;
  background: #18181b;
  box-shadow: 0 10px 30px rgba(0, 0, 0, .3);
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  backface-visibility: hidden;
  will-change: flex-grow;
  transition-property: flex-grow, border-color, box-shadow;
  transition-duration: .7s;
  transition-timing-function: cubic-bezier(.4, 0, .2, 1);
  /* a entrada: da esquerda, uma depois da outra, quando a faixa aparece */
  animation: isel-enter .7s cubic-bezier(.4, 0, .2, 1) both;
  animation-delay: calc(var(--isel-i, 0) * 180ms);
  animation-play-state: paused;
}
.isel[data-shown] .isel__option { animation-play-state: running; }
@keyframes isel-enter {
  from { opacity: 0; translate: -60px 0; }
  to { opacity: 1; translate: 0 0; }
}
.isel__option[aria-checked="true"] {
  z-index: 10;
  flex-grow: 7;
  border-color: #fff;
  box-shadow: 0 20px 60px rgba(0, 0, 0, .5);
  cursor: default;
}
/* o anel de foco do teclado, por dentro da moldura */
.isel__option:focus { outline: none; }
.isel__option:focus-visible { outline: 2px solid rgba(255, 255, 255, .9); outline-offset: -8px; }

/* a foto cobre a tira inteira; fechada, ela fica 20% mais perto */
.isel__img {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  max-width: none;
  margin: 0;
  object-fit: cover;
  object-position: center;
  scale: 1.2;
  user-select: none;
  pointer-events: none;
  transition: scale .7s cubic-bezier(.4, 0, .2, 1);
}
.isel__option[aria-checked="true"] .isel__img { scale: 1; }

/* a sombra que sobe do p\xe9 da aberta, atr\xe1s do texto. As sombras partem do p\xe9 da camada; os 240 px de altura s\xe3o a folga
   para o desfoque de 120 px sumir antes do topo dela (com menos, ele \xe9 cortado ali e fica uma linha na foto) */
.isel__shade {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -40px;
  display: block;
  height: 240px;
  margin: 0;
  pointer-events: none;
  box-shadow: inset 0 -120px 0 -120px #000, inset 0 -120px 0 -80px #000;
  transition-property: bottom, box-shadow;
  transition-duration: .7s;
  transition-timing-function: cubic-bezier(.4, 0, .2, 1);
}
.isel__option[aria-checked="true"] .isel__shade {
  bottom: 0;
  box-shadow: inset 0 -120px 120px -120px #000, inset 0 -120px 120px -80px #000;
}

/* o \xedcone e, ao lado, o t\xedtulo e a descri\xe7\xe3o */
.isel__label {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 20px;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  width: 100%;
  height: 48px;
  margin: 0;
  padding: 0 16px;
  pointer-events: none;
  transition: bottom .7s cubic-bezier(.4, 0, .2, 1);
}
.isel__icon {
  display: flex;
  flex: 0 0 44px;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  margin: 0;
  border: 2px solid #444;
  border-radius: 999px;
  background: rgba(32, 32, 32, .85);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  box-shadow: 0 1px 4px rgba(0, 0, 0, .18);
  color: #fff;
}
.isel__icon svg { display: block; flex-shrink: 0; width: 24px; height: 24px; }
.isel__info { position: relative; display: flex; flex-direction: column; min-width: 0; margin: 0; white-space: pre; color: #fff; }
.isel__title, .isel__desc {
  display: block;
  margin: 0;
  opacity: 0;
  translate: 25px 0;
  transition-property: opacity, translate;
  transition-duration: .7s;
  transition-timing-function: cubic-bezier(.4, 0, .2, 1);
}
.isel__title { font-size: 18px; font-weight: 700; line-height: 28px; color: #fff; }
.isel__desc { font-size: 16px; font-weight: 400; line-height: 24px; color: #d1d5db; }
.isel__option[aria-checked="true"] .isel__title,
.isel__option[aria-checked="true"] .isel__desc { opacity: 1; translate: 0 0; }

/* no mouse, a tira fechada acende a moldura */
@media (hover: hover) {
  .isel__option[aria-checked="false"]:hover { border-color: #52525b; }
}

/* estreita (abaixo de 560 px): as fotos se empilham e a escolhida abre para baixo; nas tiras fechadas o \xedcone desce
   para caber nos 60 px */
@container (max-width: 559.98px) {
  .isel__list { flex-direction: column; height: 560px; }
  .isel__option { min-width: 0; }
  .isel__option[aria-checked="false"] .isel__label { bottom: 4px; }
}

@media (prefers-reduced-motion: reduce) {
  .isel__option { animation: none; }
  .isel__option, .isel__option * { transition-duration: .01ms !important; }
}
`,r=e=>`https://images.unsplash.com/photo-${e}?auto=format&fit=crop&w=1200&h=800&q=75`;function l({children:e}){return(0,i.jsx)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",focusable:"false",children:e})}let d=[{title:"Tenda de Luxo",description:"Glamping sob as estrelas",image:r("1487730116645-74489c95b41b"),icon:(0,i.jsxs)(l,{children:[(0,i.jsx)("path",{d:"M3.5 21 14 3"}),(0,i.jsx)("path",{d:"M20.5 21 10 3"}),(0,i.jsx)("path",{d:"M15.5 21 12 15l-3.5 6"}),(0,i.jsx)("path",{d:"M2 21h20"})]})},{title:"Fogueira Gourmet",description:"Marshmallow e boas histórias",image:r("1475483768296-6163e08872a1"),icon:(0,i.jsx)(l,{children:(0,i.jsx)("path",{d:"M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"})})},{title:"Refúgio no Lago",description:"Píer privativo e passeios de canoa",image:r("1439066615861-d1af74d74000"),icon:(0,i.jsx)(l,{children:(0,i.jsx)("path",{d:"M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"})})},{title:"Spa na Montanha",description:"Sauna e ofurô ao ar livre",image:r("1708630283392-678476d547f8"),icon:(0,i.jsxs)(l,{children:[(0,i.jsx)("path",{d:"M10 4 8 6"}),(0,i.jsx)("path",{d:"M17 19v2"}),(0,i.jsx)("path",{d:"M2 12h20"}),(0,i.jsx)("path",{d:"M7 19v2"}),(0,i.jsx)("path",{d:"M9 5 7.621 3.621A2.121 2.121 0 0 0 4 5v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"})]})},{title:"Trilha Guiada",description:"Passeios com guias da região",image:r("1551632811-561732d1e306"),icon:(0,i.jsxs)(l,{children:[(0,i.jsx)("path",{d:"M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z"}),(0,i.jsx)("path",{d:"M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z"}),(0,i.jsx)("path",{d:"M16 17h4"}),(0,i.jsx)("path",{d:"M4 13h4"})]})}];function c(){return(0,i.jsxs)("div",{className:"isel-demo",children:[(0,i.jsx)("style",{dangerouslySetInnerHTML:{__html:p}}),(0,i.jsxs)("header",{className:"isel-demo__head",children:[(0,i.jsx)("h1",{className:"isel-demo__title",children:"Fuja com estilo"}),(0,i.jsx)("p",{className:"isel-demo__text",children:"Experiências de acampamento de luxo nos cantos mais bonitos da natureza."})]}),(0,i.jsx)(s,{options:d,label:"Experiências"})]})}let p=`
.isel-demo {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 56px;
  box-sizing: border-box;
  width: 100%;
  min-height: 100svh;
  padding: 64px 24px 32px;
  overflow: hidden;
  background: #222;
  color: #fff;
  font-family: ui-sans-serif, system-ui, -apple-system, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  container-type: inline-size;
}
.isel-demo__head { box-sizing: border-box; width: 100%; max-width: 672px; padding: 0 24px; text-align: center; }
.isel-demo__title {
  margin: 0 0 12px;
  font-size: 36px;
  font-weight: 800;
  line-height: 40px;
  letter-spacing: -.025em;
  color: #fff;
  filter: drop-shadow(0 10px 8px rgba(0, 0, 0, .04)) drop-shadow(0 4px 3px rgba(0, 0, 0, .1));
  animation: isel-demo-in .8s ease-in-out .3s both;
}
.isel-demo__text {
  max-width: 576px;
  margin: 0 auto;
  font-size: 18px;
  font-weight: 500;
  line-height: 28px;
  color: #d1d5db;
  animation: isel-demo-in .8s ease-in-out .6s both;
}
@container (min-width: 768px) {
  .isel-demo__title { font-size: 48px; line-height: 1; }
  .isel-demo__text { font-size: 20px; }
}
@keyframes isel-demo-in {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .isel-demo__title, .isel-demo__text { animation: none; }
}
`;var x=e.i(928917);function h(){let[e,a]=(0,t.useState)(0);return(0,t.useEffect)(()=>{let e=setInterval(()=>a(e=>(e+1)%d.length),2600);return()=>clearInterval(e)},[]),(0,i.jsx)("div",{className:`${x.default.stage} ${x.default.compact} ${x.default.tile}`,"aria-hidden":"true",inert:!0,children:(0,i.jsx)(s,{options:d,index:e,label:"Experiências"})})}e.s(["default",0,function({mode:e,compact:t}){return"tile"===e?(0,i.jsx)(h,{}):t?(0,i.jsx)("div",{className:`${x.default.stage} ${x.default.compact}`,children:(0,i.jsx)(s,{options:d,label:"Experiências"})}):(0,i.jsx)("div",{className:x.default.stage,children:(0,i.jsx)(c,{})})}],799771)},457805,function(e){e.n(e.i(799771))}]);

//# debugId=a78a0cba-f431-0334-a502-3ff55dd2a601