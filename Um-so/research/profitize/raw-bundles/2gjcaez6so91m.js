;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="773973b9-90c7-0294-b85c-92cc20213f5f")}catch(e){}}();
(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,310007,e=>{e.v({stage:"ProgressiveBlurCard-module__Shv0-a__stage",tile:"ProgressiveBlurCard-module__Shv0-a__tile"})},177864,e=>{"use strict";var a=e.i(843476),o=e.i(271645);let r=Number(o.version.split(".")[0])>=19;function t(){return r?(0,a.jsx)("style",{href:"progressive-blur-card",precedence:"default",children:s}):(0,a.jsx)("style",{hidden:!0,dangerouslySetInnerHTML:{__html:s}})}function i({className:e,style:o,blurIntensity:r=10}){return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(t,{}),(0,a.jsx)("div",{className:"pbc-blur"+(e?" "+e:""),style:{"--pbc-blur":r+"px",...o},"aria-hidden":"true"})]})}function n(){return(0,a.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",focusable:"false",children:[(0,a.jsx)("path",{d:"M5 12h14"}),(0,a.jsx)("path",{d:"m12 5 7 7-7 7"})]})}let c=o.forwardRef(function({src:e,alt:o,title:r,subtitle:c,blurIntensity:s=8,loading:d,href:l,onAction:p,actionLabel:b="Ver mais",className:x,...u},f){return(0,a.jsxs)("div",{ref:f,className:"pbc-card"+(x?" "+x:""),...u,children:[(0,a.jsx)(t,{}),(0,a.jsxs)("div",{className:"pbc-card__photo",children:[(0,a.jsx)("img",{className:"pbc-card__img",src:e,alt:o,loading:d,decoding:"async",draggable:!1}),(0,a.jsx)(i,{className:"pbc-card__blur",blurIntensity:s}),(0,a.jsx)("div",{className:"pbc-card__shade",children:(0,a.jsxs)("div",{className:"pbc-card__body",children:[(0,a.jsxs)("div",{className:"pbc-card__text",children:[(0,a.jsx)("h3",{className:"pbc-card__title",children:r}),null!=c&&(0,a.jsx)("p",{className:"pbc-card__subtitle",children:c})]}),null!=l?(0,a.jsx)("a",{className:"pbc-card__action",href:l,onClick:p,"aria-label":b,children:(0,a.jsx)(n,{})}):(0,a.jsx)("button",{className:"pbc-card__action",type:"button",onClick:p,"aria-label":b,children:(0,a.jsx)(n,{})})]})})]})]})}),s=`
/* o que o projeto pode trocar com uma classe (posi\xe7\xe3o, margem, largura): na camada base, que vem antes das classes de
   componente e dos utilit\xe1rios (Tailwind v4, Panda, Chakra) e perde para o CSS fora de camada (Tailwind v3, CSS
   Modules, CSS comum) */
@layer base {
  .pbc-card { position: relative; flex-shrink: 0; width: 380px; max-width: 100%; margin: 0; }
}
.pbc-card[hidden] { display: none; }
.pbc-card {
  box-sizing: border-box;
  display: block;
  isolation: isolate;
  aspect-ratio: 1;
  /* a moldura: o branco do cart\xe3o, 8 px em volta da foto */
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 4px 24px rgba(0, 0, 0, .2);
  /* nada de texto herdado da p\xe1gina: o cart\xe3o fica igual em qualquer projeto */
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
  transition: box-shadow .5s cubic-bezier(.4, 0, .2, 1), scale .5s cubic-bezier(.4, 0, .2, 1);
}
.pbc-card *, .pbc-card *::before, .pbc-card *::after { box-sizing: border-box; }

/* a foto, o desfoque e o texto, 8 px para dentro da borda do cart\xe3o; o raio \xe9 o do cart\xe3o menos a moldura */
.pbc-card__photo {
  position: absolute;
  inset: 8px;
  margin: 0;
  overflow: hidden;
  isolation: isolate;
  border-radius: 16px;
  background: #e5e7eb;
}

/* a foto cobre o quadro inteiro, recortada no centro */
.pbc-card__img {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  max-width: none;
  margin: 0;
  object-fit: cover;
  object-position: center;
  user-select: none;
  transition: scale .7s cubic-bezier(.4, 0, .2, 1);
}

/* o desfoque, inteiro embaixo e sumindo para cima: a m\xe1scara \xe9 o degrad\xea */
.pbc-blur {
  pointer-events: none;
  -webkit-backdrop-filter: blur(var(--pbc-blur, 10px));
  backdrop-filter: blur(var(--pbc-blur, 10px));
  -webkit-mask-image: linear-gradient(to top, #000 0%, #000 60%, rgba(0, 0, 0, .95) 65%, rgba(0, 0, 0, .9) 70%, rgba(0, 0, 0, .8) 75%, rgba(0, 0, 0, .6) 80%, rgba(0, 0, 0, .4) 85%, rgba(0, 0, 0, .2) 90%, rgba(0, 0, 0, .1) 95%, transparent 100%);
  mask-image: linear-gradient(to top, #000 0%, #000 60%, rgba(0, 0, 0, .95) 65%, rgba(0, 0, 0, .9) 70%, rgba(0, 0, 0, .8) 75%, rgba(0, 0, 0, .6) 80%, rgba(0, 0, 0, .4) 85%, rgba(0, 0, 0, .2) 90%, rgba(0, 0, 0, .1) 95%, transparent 100%);
}
.pbc-card__blur { position: absolute; left: 0; bottom: 0; width: 100%; height: 40%; margin: 0; }
/* dentro de um card ou modal com cantos arredondados e overflow: hidden, o Chrome (e os outros Chromium) n\xe3o recorta o
   desfoque nos cantos da foto: ele sai em ret\xe2ngulo por cima da moldura, e na borda sobra um fio da foto n\xedtida. Um
   filtro neutro faz da foto a raiz do desfoque, e o recorte volta a valer; a camada passa 1 px das bordas da foto
   (cortado pelo recorte) para cobrir o fio. S\xf3 no Chromium: o Safari e o Firefox ficam como est\xe3o */
@supports (-webkit-app-region: drag) and (not (font: -apple-system-body)) {
  .pbc-card__photo { filter: opacity(1); }
  .pbc-card__blur { left: -1px; bottom: -1px; width: calc(100% + 2px); height: calc(40% + 1px); }
}

/* o degrad\xea escuro que d\xe1 contraste ao texto, da altura do texto */
.pbc-card__shade {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, .5), rgba(0, 0, 0, 0));
}
.pbc-card__body { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin: 0; padding: 24px; }
.pbc-card__text { display: flex; flex-direction: column; min-width: 0; margin: 0; transition: translate .3s cubic-bezier(.4, 0, .2, 1); }
.pbc-card__title {
  margin: 0;
  font-family: inherit;
  font-size: 18px;
  font-weight: 600;
  line-height: 28px;
  letter-spacing: normal;
  text-align: left;
  text-transform: none;
  color: #fff;
  transition: font-size .3s cubic-bezier(.4, 0, .2, 1);
}
.pbc-card__subtitle {
  margin: 0;
  font-family: inherit;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  letter-spacing: normal;
  text-align: left;
  text-transform: none;
  color: rgba(255, 255, 255, .9);
  transition: color .3s cubic-bezier(.4, 0, .2, 1);
}

/* o bot\xe3o de seta: branco, redondo, com um fio de 1 px em volta */
.pbc-card__action {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: #fff;
  color: #1f2937;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, .05), 0 10px 15px -3px rgba(0, 0, 0, .1), 0 4px 6px -4px rgba(0, 0, 0, .1);
  font: inherit;
  text-decoration: none;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  transition-property: background-color, color, box-shadow, scale, rotate;
  transition-duration: .3s;
  transition-timing-function: cubic-bezier(.4, 0, .2, 1);
}
.pbc-card__action svg { display: block; flex-shrink: 0; width: 20px; height: 20px; transition: translate .3s cubic-bezier(.4, 0, .2, 1); }
.pbc-card__action:active { scale: .95; }
/* o anel de foco: a sombra, e um contorno transparente que aparece no modo de alto contraste */
.pbc-card__action:focus-visible {
  outline: 2px solid transparent;
  outline-offset: 2px;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, .7), 0 10px 15px -3px rgba(0, 0, 0, .1), 0 4px 6px -4px rgba(0, 0, 0, .1);
}

/* o hover, s\xf3 com mouse (no toque ele ficaria preso depois do toque) */
@media (hover: hover) {
  .pbc-card:hover { scale: 1.02; box-shadow: 0 8px 40px rgba(0, 0, 0, .3); }
  .pbc-card:hover .pbc-card__img { scale: 1.05; }
  .pbc-card:hover .pbc-card__shade { background: linear-gradient(to top, rgba(0, 0, 0, .6), rgba(0, 0, 0, 0)); }
  .pbc-card:hover .pbc-card__text { translate: 0 -2px; }
  .pbc-card:hover .pbc-card__title { font-size: 20px; }
  .pbc-card:hover .pbc-card__subtitle { color: #fff; }
  .pbc-card__action:hover {
    scale: 1.1;
    rotate: 12deg;
    background: #f3f4f6;
    color: #2563eb;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, .05), 0 20px 25px -5px rgba(0, 0, 0, .1), 0 8px 10px -6px rgba(0, 0, 0, .1);
  }
  .pbc-card__action:hover svg { translate: 2px 0; }
  .pbc-card__action:hover:active { scale: .95; }
}

@media (prefers-reduced-motion: reduce) {
  .pbc-card, .pbc-card * { transition-duration: .01ms !important; }
}
`;function d(){return(0,a.jsxs)("div",{className:"pbc-demo",children:[(0,a.jsx)("style",{dangerouslySetInnerHTML:{__html:l}}),(0,a.jsx)(c,{src:"https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80&auto=format&fit=crop",alt:"O Pão de Açúcar e a enseada de Botafogo vistos de cima, no Rio de Janeiro",title:"Rio de Janeiro,",subtitle:"Brasil"})]})}let l=`
.pbc-demo {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 100%;
  min-height: 100svh;
  padding: 32px;
  overflow: hidden;
  background: #fff;
}
`;var p=e.i(310007);e.s(["default",0,function({mode:e}){let r=(0,o.useRef)(null);return((0,o.useEffect)(()=>{r.current?.querySelectorAll("button, a").forEach(e=>e.tabIndex=-1)},[]),"stage"===e)?(0,a.jsx)("div",{className:p.default.stage,children:(0,a.jsx)(d,{})}):(0,a.jsx)("div",{ref:r,className:`${p.default.stage} ${p.default.tile}`,"aria-hidden":"true",children:(0,a.jsx)(d,{})})}],177864)},976206,function(e){e.n(e.i(177864))}]);

//# debugId=773973b9-90c7-0294-b85c-92cc20213f5f