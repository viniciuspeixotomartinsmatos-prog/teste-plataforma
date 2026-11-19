;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="027c6c17-0288-c1c6-5d0f-907b8dbdbdef")}catch(e){}}();
(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,200391,e=>{e.v({cursor:"LiquidGlassDock-module__YNgEpq__cursor",stage:"LiquidGlassDock-module__YNgEpq__stage",tile:"LiquidGlassDock-module__YNgEpq__tile"})},78284,e=>{"use strict";var t=e.i(843476),a=e.i(271645);let i=Number(a.version.split(".")[0])>=19;function o(){return i?(0,t.jsx)("style",{href:"liquid-glass-dock",precedence:"default",children:l}):(0,t.jsx)("style",{hidden:!0,dangerouslySetInnerHTML:{__html:l}})}function r({items:e,label:i="Apps",className:l,style:n,...d}){let c="lgd-glass-"+a.useId().replace(/[^a-zA-Z0-9_-]/g,"");return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(o,{}),(0,t.jsxs)("nav",{"aria-label":i,...d,className:"lgd"+(l?" "+l:""),style:{"--lgd-filter":'url("#'+c+'")',...n},children:[(0,t.jsx)("span",{className:"lgd__glass","aria-hidden":"true"}),(0,t.jsx)("span",{className:"lgd__tint","aria-hidden":"true"}),(0,t.jsx)("span",{className:"lgd__rim","aria-hidden":"true"}),(0,t.jsx)("ul",{className:"lgd__icons",children:e.map((e,a)=>(0,t.jsx)("li",{className:"lgd__slot",children:(0,t.jsx)(s,{item:e})},a+e.title))}),(0,t.jsx)("svg",{className:"lgd__defs","aria-hidden":"true",focusable:"false",children:(0,t.jsxs)("filter",{id:c,x:"0%",y:"0%",width:"100%",height:"100%",filterUnits:"objectBoundingBox",children:[(0,t.jsx)("feTurbulence",{type:"fractalNoise",baseFrequency:"0.001 0.005",numOctaves:"1",seed:"17",result:"turbulence"}),(0,t.jsx)("feGaussianBlur",{in:"turbulence",stdDeviation:"3",result:"softMap"}),(0,t.jsx)("feDisplacementMap",{in:"SourceGraphic",in2:"softMap",scale:"200",xChannelSelector:"R",yChannelSelector:"G"})]})})]})]})}function s({item:e}){let{title:a,icon:i,href:o,external:r,onClick:l}=e;return o?(0,t.jsx)("a",{className:"lgd__item",href:o,"aria-label":a,title:a,onClick:l,...r?{target:"_blank",rel:"noopener noreferrer"}:{},children:i}):l?(0,t.jsx)("button",{type:"button",className:"lgd__item","aria-label":a,title:a,onClick:l,children:i}):(0,t.jsx)("span",{className:"lgd__item",role:"img","aria-label":a,title:a,children:i})}let l=`
/* o que o projeto pode trocar com uma classe (posi\xe7\xe3o, margem, largura e as vari\xe1veis): na camada base, que vem antes
   das classes de componente e dos utilit\xe1rios (Tailwind v4, Panda, Chakra) e perde para o CSS fora de camada
   (Tailwind v3, CSS Modules, CSS comum) */
@layer base {
  .lgd {
    --lgd-icon: 64px; /* o \xedcone */
    --lgd-gap: 8px; /* entre os \xedcones */
    --lgd-tint: rgba(255, 255, 255, .25); /* o v\xe9u por cima do vidro */
    --lgd-blur: 3px; /* o desfoque do fundo */
    position: relative;
    width: fit-content;
    max-width: 100%;
    margin: 0;
  }
}
.lgd[hidden] { display: none; }
.lgd {
  box-sizing: border-box;
  display: flex;
  overflow: hidden;
  padding: 12px;
  border: 0;
  border-radius: 24px;
  box-shadow: 0 6px 6px rgba(0, 0, 0, .2), 0 0 20px rgba(0, 0, 0, .1);
  -webkit-tap-highlight-color: transparent;
  /* a mola: a curva passa do ponto e volta */
  transition: padding .7s cubic-bezier(.175, .885, .32, 2.2), border-radius .7s cubic-bezier(.175, .885, .32, 2.2);
}
@media (hover: hover) {
  .lgd:hover { padding: 16px; border-radius: 32px; }
  .lgd__item:hover { scale: 1.1; }
}
.lgd:has(.lgd__item:focus-visible) { padding: 16px; border-radius: 32px; }

/* as tr\xeas camadas cobrem a dock inteira, e a dock as recorta no canto dela */
.lgd__glass, .lgd__tint, .lgd__rim {
  position: absolute;
  inset: 0;
  margin: 0;
  pointer-events: none;
}
/* o vidro: o que est\xe1 atr\xe1s, desfocado. No Chromium, entortado pelo filtro SVG (o url() vem na --lgd-filter da dock) */
.lgd__glass {
  z-index: 0;
  overflow: hidden;
  border-radius: inherit;
  isolation: isolate;
  -webkit-backdrop-filter: blur(var(--lgd-blur));
  backdrop-filter: blur(var(--lgd-blur));
}
@supports (-webkit-app-region: drag) and (not (font: -apple-system-body)) {
  .lgd__glass { filter: var(--lgd-filter); }
}
.lgd__tint { z-index: 1; background: var(--lgd-tint); }
/* o fio de luz por dentro da borda: forte em cima e \xe0 esquerda, mais fino embaixo e \xe0 direita */
.lgd__rim {
  z-index: 2;
  border-radius: inherit;
  box-shadow: inset 2px 2px 1px 0 rgba(255, 255, 255, .5), inset -1px -1px 1px 1px rgba(255, 255, 255, .5);
}

.lgd__icons {
  position: relative;
  z-index: 3;
  box-sizing: border-box;
  display: flex;
  flex: 0 1 auto;
  min-width: 0;
  align-items: center;
  justify-content: center;
  gap: var(--lgd-gap);
  margin: 0;
  padding: 0 2px;
  border-radius: 24px;
  overflow: hidden;
  list-style: none;
}
/* numa largura menor que a dock, os \xedcones encolhem juntos. A width \xe9 para o Safari, que sen\xe3o mede a dock pelo tamanho
   real das imagens */
.lgd__slot { flex: 0 1 var(--lgd-icon); width: var(--lgd-icon); min-width: 0; margin: 0; padding: 0; list-style: none; }
.lgd__item {
  box-sizing: border-box;
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 18px;
  background: none;
  color: inherit;
  font: inherit;
  line-height: 0;
  text-decoration: none;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  transform-origin: center;
  transition: scale .7s cubic-bezier(.175, .885, .32, 2.2);
}
span.lgd__item { cursor: default; }
/* o contorno do foco fica por dentro do \xedcone, colado no desenho: por fora (e mesmo por dentro, crescido), a fileira o
   cortaria */
.lgd__item:focus { outline: none; }
.lgd__item:focus-visible { outline: 2px solid #fff; outline-offset: -5px; scale: 1.1; }
.lgd__item > img, .lgd__item > svg {
  display: block;
  width: 100%;
  height: 100%;
  max-width: none;
  margin: 0;
  object-fit: contain;
  pointer-events: none;
  -webkit-user-select: none;
  user-select: none;
  -webkit-user-drag: none;
}
/* o filtro fica num <svg> que n\xe3o aparece: s\xf3 o Chromium usa, e ele l\xea filtros de um <svg> com display: none */
.lgd__defs { display: none; }

@media (prefers-reduced-motion: reduce) {
  .lgd, .lgd__item { transition: none; }
}
`,n=[{title:"Assistente",href:"#assistente",icon:(0,t.jsxs)(c,{from:"#ffb36b",to:"#f0582a",children:[(0,t.jsx)("path",{d:"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",fill:"#fff"}),(0,t.jsx)("path",{d:"M20 2v4"}),(0,t.jsx)("path",{d:"M22 4h-4"}),(0,t.jsx)("circle",{cx:"4",cy:"20",r:"2",fill:"#fff"})]})},{title:"Arquivos",href:"#arquivos",icon:(0,t.jsxs)(c,{from:"#ffffff",to:"#dfe5ee",ink:"#2f80f2",children:[(0,t.jsx)("path",{d:"M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z",fill:"#5aa2ff"}),(0,t.jsx)("path",{d:"M2 10h20",stroke:"#fff"})]})},{title:"Conversas",href:"#conversas",icon:(0,t.jsx)(c,{from:"#80f09c",to:"#1faa48",children:(0,t.jsx)("path",{d:"M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719",fill:"#fff"})})},{title:"Mapas",href:"#mapas",icon:(0,t.jsxs)(c,{from:"#5ee9d3",to:"#0b8f84",children:[(0,t.jsx)("path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",fill:"#fff"}),(0,t.jsx)("circle",{cx:"12",cy:"10",r:"3",fill:"#0e9a8d",stroke:"none"})]})},{title:"Navegador",href:"#navegador",icon:(0,t.jsxs)(c,{from:"#97a8ff",to:"#4c43e0",children:[(0,t.jsx)("circle",{cx:"12",cy:"12",r:"10"}),(0,t.jsx)("path",{d:"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"}),(0,t.jsx)("path",{d:"M2 12h20"})]})},{title:"Jogos",href:"#jogos",icon:(0,t.jsxs)(c,{from:"#4b5567",to:"#151a25",children:[(0,t.jsx)("line",{x1:"6",x2:"10",y1:"11",y2:"11"}),(0,t.jsx)("line",{x1:"8",x2:"8",y1:"9",y2:"13"}),(0,t.jsx)("line",{x1:"15",x2:"15.01",y1:"12",y2:"12"}),(0,t.jsx)("line",{x1:"18",x2:"18.01",y1:"10",y2:"10"}),(0,t.jsx)("path",{d:"M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"})]})}];function d({items:e=n}){return(0,t.jsxs)("div",{className:"lgd-demo",children:[(0,t.jsx)("style",{dangerouslySetInnerHTML:{__html:f}}),(0,t.jsx)("div",{className:"lgd-demo__flight","aria-hidden":"true",children:(0,t.jsxs)("div",{className:"lgd-demo__strip",children:[(0,t.jsx)("span",{}),(0,t.jsx)("span",{}),(0,t.jsx)("span",{}),(0,t.jsx)("span",{})]})}),(0,t.jsx)(r,{items:e})]})}function c({from:e,to:i,ink:o="#fff",children:r}){let s="lgd-app-"+(0,a.useId)().replace(/[^a-zA-Z0-9_-]/g,"");return(0,t.jsxs)("svg",{viewBox:"0 0 64 64","aria-hidden":"true",focusable:"false",children:[(0,t.jsxs)("defs",{children:[(0,t.jsxs)("linearGradient",{id:s+"-body",x1:"0",y1:"0",x2:"0",y2:"1",children:[(0,t.jsx)("stop",{offset:"0",stopColor:e}),(0,t.jsx)("stop",{offset:"1",stopColor:i})]}),(0,t.jsx)("filter",{id:s+"-shadow",x:"-20%",y:"-20%",width:"140%",height:"140%",children:(0,t.jsx)("feGaussianBlur",{stdDeviation:"0.9"})})]}),(0,t.jsx)("rect",{x:"6.25",y:"7.5",width:"51.5",height:"51.5",rx:"11.6",fill:"#000",opacity:"0.28",filter:`url(#${s}-shadow)`}),(0,t.jsx)("rect",{x:"6.25",y:"6.25",width:"51.5",height:"51.5",rx:"11.6",fill:`url(#${s}-body)`}),(0,t.jsx)("rect",{x:"6.75",y:"6.75",width:"50.5",height:"50.5",rx:"11.1",fill:"none",stroke:"#fff",strokeOpacity:"0.28"}),(0,t.jsx)("g",{transform:"translate(17 17) scale(1.25)",fill:"none",stroke:o,strokeWidth:"1.9",strokeLinecap:"round",strokeLinejoin:"round",children:r})]})}let f=`
.lgd-demo {
  position: relative;
  display: grid;
  place-items: center;
  box-sizing: border-box;
  width: 100%;
  min-height: 100svh;
  padding: 32px 16px;
  overflow: hidden;
  background: #10241a;
}
/* o voo: a mesma foto quatro vezes, uma embaixo da outra, e a faixa descendo uma foto por volta. Cada foto tem pelo
   menos a altura da tela (e a propor\xe7\xe3o dela, 4:3), e a de baixo entra por cima do \xfaltimo quarto da de cima, aparecendo
   aos poucos: a emenda \xe9 uma fus\xe3o, sem costura. A volta come\xe7a uma foto abaixo do topo, para a primeira tamb\xe9m ter uma
   antes dela */
.lgd-demo__flight { position: absolute; inset: 0; overflow: hidden; container-type: size; pointer-events: none; }
.lgd-demo__strip {
  --photo: max(100cqh, 75cqw);
  --step: calc(var(--photo) * .75);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  animation: lgd-demo-flight 16s linear infinite;
  will-change: transform;
}
.lgd-demo__strip > span {
  display: block;
  height: var(--photo);
  background: url("https://images.unsplash.com/photo-1473773508845-188df298d2d1?auto=format&fit=crop&w=1920&h=1440&q=70") center / cover no-repeat;
}
.lgd-demo__strip > span + span {
  margin-top: calc(var(--photo) * -.25);
  -webkit-mask-image: linear-gradient(transparent, #000 25%);
  mask-image: linear-gradient(transparent, #000 25%);
}
@keyframes lgd-demo-flight {
  from { transform: translateY(calc(var(--step) * -2)); }
  to { transform: translateY(calc(var(--step) * -1)); }
}
@media (prefers-reduced-motion: reduce) {
  .lgd-demo__strip { animation: none; }
}
`;var p=e.i(200391);let u=n.map(e=>({...e,href:void 0})),x={x:40,y:352},g={x:520,y:352},h=(()=>{let e=[{at:0,...x,o:0},{at:.35,...x,o:1}],t=1.05;for(let a=0;a<6;a++)e.push({at:t,item:a,o:1},{at:t+.72,item:a,o:1}),t+=1.12;return e.push({at:(t-=.4)+.65,...g,o:1},{at:t+.95,...g,o:0},{at:t+2.1,...g,o:0}),e})(),m=h[h.length-1].at;e.s(["default",0,function({mode:e}){let i=(0,a.useRef)(null),o=(0,a.useRef)(null);return((0,a.useEffect)(()=>{if("tile"===e){var t,a;let e,r,s,l,n,d,c,f;return t=i.current,a=o.current,e=matchMedia("(prefers-reduced-motion: reduce)").matches,r=t.closest(".preview"),s=0,l=0,n=0,d=i=>{s+=Math.min(100,i-l),l=i,(e=>{let i=t.getBoundingClientRect();if(!i.width||!t.offsetWidth)return;let o=i.width/t.offsetWidth,r=t.querySelectorAll(".lgd__item"),s=function(e,t){let a,i=1;for(;i<h.length-1&&h[i].at<e;)i++;let o=h[i-1],r=h[i],s="item"in o?t(o.item):o,l="item"in r?t(r.item):r,n=(a=Math.min(1,Math.max(0,(e-o.at)/(r.at-o.at||1))))<.5?4*a*a*a:1-(-2*a+2)**3/2;return{x:s.x+(l.x-s.x)*n,y:s.y+(l.y-s.y)*n,o:o.o+(r.o-o.o)*n}}(e,e=>{let t=r[e]?.getBoundingClientRect();return t?.width?{x:(t.left+t.width/2-i.left)/o+2,y:(t.top+t.height/2-i.top)/o+8}:{x:100+72*e,y:210}});a.style.transform=`translate3d(${s.x}px, ${s.y}px, 0)`,a.style.opacity=String(s.o);let l=i.left+s.x*o,n=i.top+s.y*o,d=-1,c=1/0;r.forEach((e,t)=>{let a=e.getBoundingClientRect();if(!a.width||l<a.left||l>a.right||n<a.top||n>a.bottom)return;let i=l-(a.left+a.width/2),o=n-(a.top+a.height/2),r=i*i+o*o;r<c&&(c=r,d=t)});let f=t.querySelector(".lgd"),p=f?.getBoundingClientRect(),u=!!(p&&p.width&&l>=p.left&&l<=p.right&&n>=p.top&&n<=p.bottom);if(f){let e=u?"16px":"",t=u?"32px":"";f.style.padding!==e&&(f.style.padding=e),f.style.borderRadius!==t&&(f.style.borderRadius=t)}r.forEach((e,t)=>{let a=t===d?"1.1":"";e.style.scale!==a&&(e.style.scale=a)})})(e?3.65:s/1e3%m),n=requestAnimationFrame(d)},f=new MutationObserver(c=()=>{let e=!r||r.classList.contains("is-playing");e&&!n?(l=performance.now(),n=requestAnimationFrame(d)):!e&&n&&(cancelAnimationFrame(n),n=0)}),r&&f.observe(r,{attributes:!0,attributeFilter:["class"]}),c(),()=>{f.disconnect(),cancelAnimationFrame(n);let e=t.querySelector(".lgd");e&&(e.style.padding="",e.style.borderRadius=""),t.querySelectorAll(".lgd__item").forEach(e=>{e.style.scale=""})}}},[e]),"stage"===e)?(0,t.jsx)("div",{className:p.default.stage,onClickCapture:e=>{e.target.closest('a[href^="#"]')&&e.preventDefault()},children:(0,t.jsx)(d,{})}):(0,t.jsxs)("div",{ref:i,className:`${p.default.stage} ${p.default.tile}`,"aria-hidden":"true",inert:!0,children:[(0,t.jsx)(d,{items:u}),(0,t.jsx)("div",{ref:o,className:p.default.cursor,children:(0,t.jsx)("svg",{viewBox:"0 0 14 21",width:"18",height:"27",children:(0,t.jsx)("path",{d:"M1 1v15.5l3.8-3.6 2.8 6.5 2.5-1.1-2.7-6.3h5.2z"})})})]})}],78284)},644062,function(e){e.n(e.i(78284))}]);

//# debugId=027c6c17-0288-c1c6-5d0f-907b8dbdbdef