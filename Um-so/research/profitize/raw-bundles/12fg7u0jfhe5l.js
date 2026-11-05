;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="1f691934-b68b-ddfc-79ed-a9b54d29fca4")}catch(e){}}();
(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,856156,e=>{e.v({cursor:"Testimonials3D-module__jMFzrG__cursor",fill:"Testimonials3D-module__jMFzrG__fill",stage:"Testimonials3D-module__jMFzrG__stage",tile:"Testimonials3D-module__jMFzrG__tile"})},439911,e=>{"use strict";var t=e.i(843476),a=e.i(271645);let r=Number(a.version.split(".")[0])>=19;function o(){return r?(0,t.jsx)("style",{href:"3d-testimonials",precedence:"default",children:s}):(0,t.jsx)("style",{hidden:!0,dangerouslySetInnerHTML:{__html:s}})}function d({className:e,style:r,reverse:i=!1,pauseOnHover:n=!1,children:s,vertical:l=!1,repeat:c=4,duration:u=40,gap:m=16,ariaLabel:f,ariaLive:p="off",ariaRole:g="marquee",...h}){let x={"--t3d-duration":`${u}s`,"--t3d-gap":`${m}px`};return(0,t.jsxs)("div",{tabIndex:0,...h,"data-slot":"marquee","data-vertical":l||void 0,"data-reverse":i||void 0,"data-pause-on-hover":n||void 0,className:e?`t3d-marquee ${e}`:"t3d-marquee",style:{...x,...r},"aria-label":f,"aria-live":p,role:g,children:[(0,t.jsx)(o,{}),a.useMemo(()=>Array.from({length:c},(e,a)=>(0,t.jsx)("div",{className:"t3d-group","aria-hidden":a>0||void 0,children:s},a)),[c,s])]})}function i({img:e,name:r,username:o,body:d,country:n}){let[s,l]=a.useState(!1);return(0,t.jsxs)("figure",{className:"t3d-card",children:[(0,t.jsxs)("div",{className:"t3d-card__head",children:[(0,t.jsx)("span",{className:"t3d-avatar",children:e&&!s?(0,t.jsx)("img",{src:e,alt:"",loading:"lazy",decoding:"async",draggable:!1,onError:()=>l(!0)}):(0,t.jsx)("span",{"aria-hidden":"true",children:r.trim()[0]})}),(0,t.jsxs)("div",{className:"t3d-card__who",children:[(0,t.jsxs)("figcaption",{className:"t3d-card__name",children:[r," ",n&&(0,t.jsx)("span",{className:"t3d-card__country",children:n})]}),(0,t.jsx)("p",{className:"t3d-card__user",children:o})]})]}),(0,t.jsx)("blockquote",{className:"t3d-card__body",children:d})]})}function n({testimonials:e,columns:r=4,duration:s=40,repeat:l=3,pauseOnHover:c=!0,theme:u="dark",label:m="Depoimentos",className:f,style:p,...g}){let h=a.useMemo(()=>{let t=e.length;return Array.from({length:r},(a,o)=>{let d=t?Math.floor(o*t/r):0;return[...e.slice(d),...e.slice(0,d)]})},[e,r]);return(0,t.jsxs)("section",{tabIndex:0,...g,"data-theme":u,className:f?`t3d-root ${f}`:"t3d-root",style:p,"aria-label":m,children:[(0,t.jsx)(o,{}),(0,t.jsx)("div",{className:"t3d-scene",style:{perspective:"300px"},children:(0,t.jsx)("div",{className:"t3d-plane",style:{transform:"translateX(-100px) translateY(0px) translateZ(-100px) rotateX(20deg) rotateY(-10deg) rotateZ(20deg)"},children:h.map((e,a)=>(0,t.jsx)(d,{vertical:!0,reverse:a%2==1,pauseOnHover:c,repeat:l,duration:s,tabIndex:-1,"aria-hidden":a>0||void 0,children:e.map(e=>(0,t.jsx)(i,{...e},e.username))},a))})}),(0,t.jsx)("div",{className:"t3d-fade t3d-fade--top"}),(0,t.jsx)("div",{className:"t3d-fade t3d-fade--bottom"}),(0,t.jsx)("div",{className:"t3d-fade t3d-fade--left"}),(0,t.jsx)("div",{className:"t3d-fade t3d-fade--right"})]})}let s=`
.t3d-root {
  --t3d-bg: #0a0a0a;
  --t3d-card: #171717;
  --t3d-card-hover: #232323;
  --t3d-fg: #fafafa;
  --t3d-muted: #a1a1a1;
  --t3d-border: rgba(255, 255, 255, 0.1);
  --t3d-border-hover: rgba(255, 255, 255, 0.3);
  --t3d-avatar: #262626;
  --t3d-ring: rgba(255, 255, 255, 0.4);
  --t3d-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
}
.t3d-root[data-theme="light"] {
  --t3d-bg: #ffffff;
  --t3d-card: #ffffff;
  --t3d-card-hover: #f5f5f5;
  --t3d-fg: #0a0a0a;
  --t3d-muted: #737373;
  --t3d-border: #e5e5e5;
  --t3d-border-hover: #a3a3a3;
  --t3d-avatar: #f5f5f5;
  --t3d-ring: rgba(10, 10, 10, 0.35);
  --t3d-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* tamanho, posi\xe7\xe3o, margem, borda e fundo ficam numa camada, para as classes do projeto vencerem */
@layer base {
  .t3d-root {
    position: relative;
    width: 100%;
    height: 384px;
    margin: 0;
    border: 1px solid var(--t3d-border);
    border-radius: 8px;
    background: var(--t3d-bg);
  }
}
.t3d-root {
  overflow: hidden;
  isolation: isolate;
  box-sizing: border-box;
  color: var(--t3d-fg);
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji";
  font-size: 16px;
  line-height: 1.5;
  letter-spacing: normal;
  text-align: left;
  -webkit-font-smoothing: antialiased;
  outline: none;
}
.t3d-root *, .t3d-root *::before, .t3d-root *::after { box-sizing: border-box; }
.t3d-root:focus-visible { box-shadow: 0 0 0 2px var(--t3d-bg), 0 0 0 4px var(--t3d-ring); }

.t3d-scene { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
.t3d-plane { display: flex; flex-direction: row; align-items: center; gap: 16px; }

.t3d-fade { position: absolute; z-index: 1; pointer-events: none; }
.t3d-fade--top { inset: 0 0 auto; height: 25%; background: linear-gradient(to bottom, var(--t3d-bg), transparent); }
.t3d-fade--bottom { inset: auto 0 0; height: 25%; background: linear-gradient(to top, var(--t3d-bg), transparent); }
.t3d-fade--left { inset: 0 auto 0 0; width: 25%; background: linear-gradient(to right, var(--t3d-bg), transparent); }
.t3d-fade--right { inset: 0 0 0 auto; width: 25%; background: linear-gradient(to left, var(--t3d-bg), transparent); }

.t3d-marquee {
  display: flex;
  flex-direction: row;
  gap: var(--t3d-gap, 16px);
  overflow: hidden;
  padding: 8px;
  outline: none;
}
.t3d-marquee[data-vertical] { flex-direction: column; }
.t3d-group {
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  justify-content: space-around;
  gap: var(--t3d-gap, 16px);
  animation: t3d-marquee var(--t3d-duration, 40s) linear infinite;
}
.t3d-marquee[data-vertical] > .t3d-group { flex-direction: column; animation-name: t3d-marquee-vertical; }
.t3d-marquee[data-reverse] > .t3d-group { animation-direction: reverse; }
.t3d-marquee[data-pause-on-hover]:hover > .t3d-group,
.t3d-marquee:focus-visible > .t3d-group,
.t3d-marquee:has(:focus-visible) > .t3d-group,
.t3d-root:focus-visible .t3d-group { animation-play-state: paused; }

@keyframes t3d-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(calc(-100% - var(--t3d-gap, 16px))); }
}
@keyframes t3d-marquee-vertical {
  from { transform: translateY(0); }
  to { transform: translateY(calc(-100% - var(--t3d-gap, 16px))); }
}

.t3d-card {
  width: 200px;
  margin: 0;
  padding: 20px;
  border: 1px solid var(--t3d-border);
  border-radius: 12px;
  background: var(--t3d-card);
  color: var(--t3d-fg);
  box-shadow: var(--t3d-shadow);
  transition: border-color 0.2s ease, background-color 0.2s ease;
}
.t3d-card:hover { border-color: var(--t3d-border-hover); background: var(--t3d-card-hover); }
.t3d-card__head { display: flex; align-items: center; gap: 10px; }
.t3d-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  overflow: hidden;
  border-radius: 9999px;
  background: var(--t3d-avatar);
  font-size: 14px;
  font-weight: 500;
}
.t3d-avatar img { display: block; width: 100%; height: 100%; object-fit: cover; }
.t3d-card__who { display: flex; flex-direction: column; min-width: 0; }
.t3d-card__name {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  column-gap: 4px;
  margin: 0;
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
}
.t3d-card__country { font-size: 12px; line-height: 16px; font-weight: 400; color: var(--t3d-muted); white-space: nowrap; }
.t3d-card__user { margin: 0; font-size: 12px; line-height: 16px; font-weight: 500; color: var(--t3d-muted); }
.t3d-card__body { margin: 12px 0 0; padding: 0; border: 0; font-size: 14px; line-height: 20px; quotes: none; }

@media (prefers-reduced-motion: reduce) {
  .t3d-group { animation: none; }
}
`,l=e=>`https://images.unsplash.com/photo-${e}?w=96&h=96&q=80&auto=format&fit=crop&crop=faces`,c=[{name:"Ana Ribeiro",username:"@ana",body:"A Cascata deixou meu fluxo de trabalho 10x mais rápido!",img:l("1544005313-94ddf0286df2"),country:"🇧🇷 Brasil"},{name:"Lena Fischer",username:"@lena",body:"O letreiro vertical mudou o jogo por aqui!",img:l("1517841905240-472988babdf9"),country:"🇩🇪 Alemanha"},{name:"Mateo Rossi",username:"@mat",body:"As animações são lisas como seda!",img:l("1539571696357-5a69c17a67c6"),country:"🇮🇹 Itália"},{name:"Maya Patel",username:"@maya",body:"Configurei em cinco minutos.",img:l("1580489944761-15a19d654956"),country:"🇮🇳 Índia"},{name:"Noah Smith",username:"@noah",body:"O melhor letreiro que já usei.",img:l("1472099645785-5658abf4ff4e"),country:"🇺🇸 EUA"},{name:"Lucas Moreau",username:"@luc",body:"Fácil de personalizar e muito suave.",img:l("1500648767791-00dcc994a43e"),country:"🇫🇷 França"},{name:"Kenji Sato",username:"@kenji",body:"Desempenho impressionante no celular!",img:l("1507003211169-0a1dd7228f2d"),country:"🇯🇵 Japão"},{name:"Emma Lee",username:"@emma",body:"Adoro que ele para quando passo o mouse!",img:l("1438761681033-6461ffad8d80"),country:"🇨🇦 Canadá"},{name:"Carlos Ruiz",username:"@carl",body:"Ótimo para depoimentos e logos.",img:l("1506794778202-cad84cf45f1d"),country:"🇪🇸 Espanha"}];function u(){return(0,t.jsxs)("div",{className:"t3d-demo",children:[(0,t.jsx)("style",{dangerouslySetInnerHTML:{__html:m}}),(0,t.jsx)(n,{testimonials:c,className:"t3d-demo__wall"})]})}let m=`
.t3d-demo {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 100%;
  min-height: 100svh;
  padding: 32px;
  overflow: hidden;
  background: #0a0a0a;
}
.t3d-demo__wall { max-width: 800px; height: 560px; }
`;var f=e.i(856156);let p={x:100,y:400},g={x:165,y:150},h={x:290,y:265},x={x:500,y:410},b=[{at:0,...p,o:0},{at:.3,...p,o:1},{at:1.3,...g,o:1},{at:4.1,...g,o:1},{at:4.9,...h,o:1},{at:7.7,...h,o:1},{at:8.5,...x,o:1},{at:8.8,...x,o:0},{at:10.3,...x,o:0}],v=b[b.length-1].at,y={card:null,column:null};e.s(["default",0,function({mode:e,compact:r}){let o=(0,a.useRef)(null),d=(0,a.useRef)(null);return((0,a.useEffect)(()=>{if("tile"===e){var t,a;let e,r,i,n,s,l,c,u,m,f,p,g;return o.current?.querySelectorAll("[tabindex]").forEach(e=>e.tabIndex=-1),t=o.current,a=d.current,e=matchMedia("(prefers-reduced-motion: reduce)").matches,r=t.closest(".preview"),i=null,n=null,s=0,l=0,c=0,u=-1/0,m=e=>{e.card!==i&&(i?.removeAttribute("data-hover"),e.card?.setAttribute("data-hover",""),i=e.card),e.column!==n&&(n?.removeAttribute("data-hover"),e.column?.setAttribute("data-hover",""),n=e.column)},f=r=>{s+=Math.min(100,r-l),l=r,(e=>{let r=t.getBoundingClientRect();if(!r.width||!t.offsetWidth)return;let o=r.width/t.offsetWidth,d=function(e){let t,a=1;for(;a<b.length-1&&b[a].at<e;)a++;let r=b[a-1],o=b[a],d=(t=Math.min(1,Math.max(0,(e-r.at)/(o.at-r.at||1))))<.5?4*t*t*t:1-(-2*t+2)**3/2;return{x:r.x+(o.x-r.x)*d,y:r.y+(o.y-r.y)*d,o:r.o+(o.o-r.o)*d}}(e);if(a.style.transform=`translate3d(${d.x}px, ${d.y}px, 0)`,a.style.opacity=String(d.o),d.o<=.5){m(y),u=-1/0;return}let i=performance.now();i-u<100||(u=i,m(((e,a)=>{t.dataset.probe="";let r=document.elementsFromPoint(e,a);delete t.dataset.probe;let o=null;for(let e of r)if(o=t.contains(e)?e.closest(".t3d-card, .t3d-marquee"):null)break;return{card:o?.closest(".t3d-card")??null,column:o?.closest(".t3d-marquee")??null}})(r.left+d.x*o,r.top+d.y*o)))})(e?2.7:s/1e3%v),c=requestAnimationFrame(f)},g=new MutationObserver(p=()=>{let e=!r||r.classList.contains("is-playing");e&&!c?(l=performance.now(),c=requestAnimationFrame(f)):!e&&c&&(cancelAnimationFrame(c),c=0)}),r&&g.observe(r,{attributes:!0,attributeFilter:["class"]}),p(),()=>{g.disconnect(),cancelAnimationFrame(c),m(y)}}},[e]),"stage"===e)?(0,t.jsx)("div",{className:r?`${f.default.stage} ${f.default.fill}`:f.default.stage,children:(0,t.jsx)(u,{})}):(0,t.jsxs)("div",{ref:o,className:`${f.default.stage} ${f.default.fill} ${f.default.tile}`,"aria-hidden":"true",onPointerMove:e=>e.stopPropagation(),children:[(0,t.jsx)(u,{}),(0,t.jsx)("div",{ref:d,className:f.default.cursor,children:(0,t.jsx)("svg",{viewBox:"0 0 14 21",width:"30",height:"45",children:(0,t.jsx)("path",{d:"M1 1v15.5l3.8-3.6 2.8 6.5 2.5-1.1-2.7-6.3h5.2z"})})})]})}],439911)},533693,function(e){e.n(e.i(439911))}]);

//# debugId=1f691934-b68b-ddfc-79ed-a9b54d29fca4