;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="cf9d5d86-4377-e780-95b9-10203d6d4323")}catch(e){}}();
(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,586421,e=>{e.v({stage:"LiquidGlass-module__d4XhlW__stage",tile:"LiquidGlass-module__d4XhlW__tile"})},867656,e=>{"use strict";var a=e.i(843476),t=e.i(271645);let i=Number(t.version.split(".")[0])>=19;function n(){return i?(0,a.jsx)("style",{href:"liquid-glass-button",precedence:"default",children:o}):(0,a.jsx)("style",{hidden:!0,dangerouslySetInnerHTML:{__html:o}})}let r=t.forwardRef(function({tone:e="dark",size:i="xxl",className:r,style:o,children:s,type:l="button",...d},p){let x="lg-glass-"+t.useId().replace(/[^a-zA-Z0-9_-]/g,"");return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(n,{}),(0,a.jsxs)("button",{ref:p,type:l,className:"lg-btn"+(r?" "+r:""),"data-tone":e,"data-size":i,style:{"--lg-filter":'url("#'+x+'")',...o},...d,children:[(0,a.jsx)("span",{className:"lg-btn__rim","aria-hidden":"true"}),(0,a.jsx)("span",{className:"lg-btn__glass","aria-hidden":"true"}),(0,a.jsx)("span",{className:"lg-btn__label",children:s}),(0,a.jsx)("svg",{className:"lg-btn__defs","aria-hidden":"true",focusable:"false",children:(0,a.jsx)("defs",{children:(0,a.jsxs)("filter",{id:x,x:"0%",y:"0%",width:"100%",height:"100%",colorInterpolationFilters:"sRGB",children:[(0,a.jsx)("feTurbulence",{type:"fractalNoise",baseFrequency:"0.05 0.05",numOctaves:"1",seed:"1",result:"turbulence"}),(0,a.jsx)("feGaussianBlur",{in:"turbulence",stdDeviation:"2",result:"blurredNoise"}),(0,a.jsx)("feDisplacementMap",{in:"SourceGraphic",in2:"blurredNoise",scale:"70",xChannelSelector:"R",yChannelSelector:"B",result:"displaced"}),(0,a.jsx)("feGaussianBlur",{in:"displaced",stdDeviation:"4",result:"finalBlur"}),(0,a.jsx)("feComposite",{in:"finalBlur",in2:"finalBlur",operator:"over"})]})})})]})]})}),o=`
/* o que o projeto pode trocar com uma classe (posi\xe7\xe3o, margem, encolher, o tamanho dos \xedcones): na camada base, que
   vem antes das classes de componente e dos utilit\xe1rios (Tailwind v4, Panda, Chakra) e perde para o CSS fora de camada
   (Tailwind v3, CSS Modules, CSS comum) */
@layer base {
  .lg-btn { position: relative; flex-shrink: 0; margin: 0; }
  :where(.lg-btn__label svg:not([class*="size-"])) { flex-shrink: 0; width: 16px; height: 16px; }
}
.lg-btn[hidden] { display: none; }
.lg-btn {
  box-sizing: border-box;
  display: inline-flex;
  isolation: isolate;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 56px;
  padding: 0 32px;
  border: 0;
  border-radius: 999px;
  background: none;
  -webkit-appearance: none;
  appearance: none;
  /* nada de texto herdado da p\xe1gina: o bot\xe3o fica igual em qualquer projeto */
  font-family: ui-sans-serif, system-ui, -apple-system, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 14px;
  font-weight: 500;
  font-style: normal;
  font-variant: normal;
  font-feature-settings: normal;
  font-variation-settings: normal;
  line-height: 20px;
  letter-spacing: normal;
  word-spacing: normal;
  text-align: center;
  text-transform: none;
  text-indent: 0;
  text-shadow: none;
  text-rendering: auto;
  white-space: nowrap;
  color: #e5e5e5;
  -webkit-text-fill-color: currentColor;
  cursor: pointer;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-tap-highlight-color: transparent;
  transition: color .3s, box-shadow .3s, scale .3s;
  transition-timing-function: cubic-bezier(.4, 0, .2, 1);
}
.lg-btn[data-tone="light"] { color: #171717; }
.lg-btn[data-size="sm"] { height: 32px; padding: 0 16px; gap: 6px; font-size: 12px; line-height: 16px; }
.lg-btn[data-size="default"] { height: 36px; padding: 0 12px; }
.lg-btn[data-size="lg"] { height: 40px; padding: 0 16px; }
.lg-btn[data-size="xl"] { height: 48px; padding: 0 24px; }
.lg-btn[data-size="icon"] { width: 36px; height: 36px; padding: 0; }
@media (hover: hover) { .lg-btn:hover { scale: 1.05; } }
/* o anel de foco: a sombra, e um contorno transparente que aparece no modo de alto contraste */
.lg-btn:focus-visible { outline: 2px solid transparent; outline-offset: 2px; box-shadow: 0 0 0 3px rgba(255, 255, 255, .55); }
.lg-btn[data-tone="light"]:focus-visible { box-shadow: 0 0 0 3px rgba(10, 10, 10, .5); }
/* desabilitado, o texto e a borda apagam; o vidro fica (com opacity no bot\xe3o inteiro, o fundo dele sumiria) */
.lg-btn:disabled { pointer-events: none; cursor: default; }
.lg-btn:disabled > .lg-btn__label, .lg-btn:disabled > .lg-btn__rim { opacity: .5; }

.lg-btn__rim, .lg-btn__glass {
  position: absolute;
  inset: 0;
  margin: 0;
  border-radius: inherit;
  pointer-events: none;
}
/* a borda do vidro: o fio de luz, a espessura e o brilho em volta */
.lg-btn__rim {
  z-index: 0;
  box-shadow:
    0 0 8px rgba(0, 0, 0, .03),
    0 2px 6px rgba(0, 0, 0, .08),
    inset 3px 3px .5px -3.5px rgba(255, 255, 255, .09),
    inset -3px -3px .5px -3.5px rgba(255, 255, 255, .85),
    inset 1px 1px 1px -.5px rgba(255, 255, 255, .6),
    inset -1px -1px 1px -.5px rgba(255, 255, 255, .6),
    inset 0 0 6px 6px rgba(255, 255, 255, .12),
    inset 0 0 2px 2px rgba(255, 255, 255, .06),
    0 0 12px rgba(0, 0, 0, .15);
  transition: box-shadow .15s cubic-bezier(.4, 0, .2, 1), opacity .3s cubic-bezier(.4, 0, .2, 1);
}
.lg-btn[data-tone="light"] .lg-btn__rim {
  box-shadow:
    0 0 6px rgba(0, 0, 0, .03),
    0 2px 6px rgba(0, 0, 0, .08),
    inset 3px 3px .5px -3px rgba(0, 0, 0, .9),
    inset -3px -3px .5px -3px rgba(0, 0, 0, .85),
    inset 1px 1px 1px -.5px rgba(0, 0, 0, .6),
    inset -1px -1px 1px -.5px rgba(0, 0, 0, .6),
    inset 0 0 6px 6px rgba(0, 0, 0, .12),
    inset 0 0 2px 2px rgba(0, 0, 0, .06),
    0 0 12px rgba(255, 255, 255, .15);
}
/* o fundo: o que est\xe1 atr\xe1s, desfocado. No Chromium, distorcido pelo filtro SVG (o url() vem na --lg-filter do
   bot\xe3o); o Safari aceita o url() no backdrop-filter mas n\xe3o o desenha, ent\xe3o l\xe1 e no Firefox fica o desfoque */
.lg-btn__glass { z-index: -1; overflow: hidden; -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); }
@supports (-webkit-app-region: drag) and (not (font: -apple-system-body)) {
  .lg-btn__glass { -webkit-backdrop-filter: var(--lg-filter); backdrop-filter: var(--lg-filter); }
}
.lg-btn__label {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: inherit;
  margin: 0;
  pointer-events: none;
  transition: opacity .3s cubic-bezier(.4, 0, .2, 1);
}
.lg-btn__defs { position: absolute; width: 0; height: 0; overflow: hidden; }
`;function s(){return(0,a.jsxs)("div",{className:"lg-stage",children:[(0,a.jsx)("style",{dangerouslySetInnerHTML:{__html:l}}),(0,a.jsx)("div",{className:"lg-stage__art","aria-hidden":"true"}),(0,a.jsx)(r,{children:"Vidro líquido"})]})}let l=`
.lg-stage {
  position: relative;
  display: grid;
  place-items: center;
  box-sizing: border-box;
  width: 100%;
  min-height: 100svh;
  padding: 48px 24px;
  overflow: hidden;
  background: #0a0a0c;
}
/* o que passa atr\xe1s do vidro: listras de 2 px a cada 24 e tr\xeas manchas de luz */
.lg-stage__art {
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(115deg, transparent 0 22px, rgba(255, 255, 255, .16) 22px 24px),
    radial-gradient(30% 42% at 38% 46%, #ff5e3a 0%, transparent 70%),
    radial-gradient(28% 40% at 62% 56%, #5b5bff 0%, transparent 70%),
    radial-gradient(22% 30% at 52% 36%, #18c6b4 0%, transparent 70%),
    #0a0a0c;
}
`;var d=e.i(586421);e.s(["default",0,function({mode:e}){let i=(0,t.useRef)(null);return((0,t.useEffect)(()=>{i.current?.querySelectorAll("button, a").forEach(e=>e.tabIndex=-1)},[]),"stage"===e)?(0,a.jsx)("div",{className:d.default.stage,children:(0,a.jsx)(s,{})}):(0,a.jsx)("div",{ref:i,className:`${d.default.stage} ${d.default.tile}`,"aria-hidden":"true",children:(0,a.jsx)(s,{})})}],867656)},839402,function(e){e.n(e.i(867656))}]);

//# debugId=cf9d5d86-4377-e780-95b9-10203d6d4323