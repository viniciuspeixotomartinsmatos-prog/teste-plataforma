;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="541ccd04-7f30-7528-2470-c4c3f617ecd6")}catch(e){}}();
(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,88653,e=>{"use strict";var t=e.i(843476),i=e.i(271645),n=e.i(231178),o=e.i(947414),r=e.i(674008),a=e.i(821476),l=e.i(772846),s=i,d=e.i(737806);function f(e,t){if("function"==typeof e)return e(t);null!=e&&(e.current=t)}class c extends s.Component{getSnapshotBeforeUpdate(e){let t=this.props.childRef.current;if((0,l.f)(t)&&e.isPresent&&!this.props.isPresent&&!1!==this.props.pop){let e=t.offsetParent,i=(0,l.f)(e)&&e.offsetWidth||0,n=(0,l.f)(e)&&e.offsetHeight||0,o=getComputedStyle(t),r=this.props.sizeRef.current;r.height=parseFloat(o.height),r.width=parseFloat(o.width),r.top=t.offsetTop,r.left=t.offsetLeft,r.right=i-r.width-r.left,r.bottom=n-r.height-r.top,r.direction=o.direction}return null}componentDidUpdate(){}render(){return this.props.children}}function u({children:e,isPresent:n,anchorX:o,anchorY:r,root:a,pop:l}){let p=(0,s.useId)(),h=(0,s.useRef)(null),m=(0,s.useRef)({width:0,height:0,top:0,left:0,right:0,bottom:0,direction:"ltr"}),{nonce:x}=(0,s.useContext)(d.f),g=function(...e){return i.useCallback(function(...e){return t=>{let i=!1,n=e.map(e=>{let n=f(e,t);return i||"function"!=typeof n||(i=!0),n});if(i)return()=>{for(let t=0;t<n.length;t++){let i=n[t];"function"==typeof i?i():f(e[t],null)}}}}(...e),e)}(h,!1!==l?e.props?.ref??e?.ref:void 0);return(0,s.useInsertionEffect)(()=>{let{width:e,height:t,top:i,left:s,right:d,bottom:f,direction:c}=m.current;if(n||!1===l||!h.current||!e||!t)return;let u="rtl"===c,g="left"===o?u?`right: ${d}`:`left: ${s}`:u?`left: ${s}`:`right: ${d}`,b="bottom"===r?`bottom: ${f}`:`top: ${i}`;h.current.dataset.motionPopId=p;let v=document.createElement("style");x&&(v.nonce=x);let y=a??document.head;return y.appendChild(v),v.sheet&&v.sheet.insertRule(`
          [data-motion-pop-id="${p}"] {
            position: absolute !important;
            width: ${e}px !important;
            height: ${t}px !important;
            ${g}px !important;
            ${b}px !important;
          }
        `),()=>{h.current?.removeAttribute("data-motion-pop-id"),y.contains(v)&&y.removeChild(v)}},[n]),(0,t.jsx)(c,{isPresent:n,childRef:h,sizeRef:m,pop:l,children:!1===l?e:s.cloneElement(e,{ref:g})})}let p=({children:e,initial:n,isPresent:l,onExitComplete:s,custom:d,presenceAffectsLayout:f,mode:c,anchorX:p,anchorY:m,root:x})=>{let g=(0,o.f)(h),b=(0,i.useId)(),v=(0,i.useRef)(l),y=(0,i.useRef)(s);(0,r.f)(()=>{v.current=l,y.current=s});let j=!0,k=(0,i.useMemo)(()=>(j=!1,{id:b,initial:n,isPresent:l,custom:d,onExitComplete:e=>{for(let t of(g.set(e,!0),g.values()))if(!t)return;s&&s()},register:e=>(g.set(e,!1),()=>{g.delete(e),v.current||g.size||y.current?.()})}),[l,g,s]);return f&&j&&(k={...k}),(0,i.useMemo)(()=>{g.forEach((e,t)=>g.set(t,!1))},[l]),i.useEffect(()=>{l||g.size||!s||s()},[l]),e=(0,t.jsx)(u,{pop:"popLayout"===c,isPresent:l,anchorX:p,anchorY:m,root:x,children:e}),(0,t.jsx)(a.f.Provider,{value:k,children:e})};function h(){return new Map}var m=e.i(464978);let x=e=>e.key||"";function g(e){let t=[];return i.Children.forEach(e,e=>{(0,i.isValidElement)(e)&&t.push(e)}),t}e.s(["f",0,({children:e,custom:a,initial:l=!0,onExitComplete:s,presenceAffectsLayout:d=!0,mode:f="sync",propagate:c=!1,anchorX:u="left",anchorY:h="top",root:b})=>{let[v,y]=(0,m.f)(c),j=(0,i.useMemo)(()=>g(e),[e]),k=c&&!v?[]:j.map(x),_=(0,i.useRef)(!0),w=(0,i.useRef)(j),M=(0,o.f)(()=>new Map),C=(0,i.useRef)(new Set),[S,E]=(0,i.useState)(j),[R,N]=(0,i.useState)(j);(0,r.f)(()=>{_.current=!1,w.current=j;for(let e=0;e<R.length;e++){let t=x(R[e]);k.includes(t)?(M.delete(t),C.current.delete(t)):!0!==M.get(t)&&M.set(t,!1)}},[R,k.length,k.join("-")]);let P=[];if(j!==S){let e=[...j];for(let t=0;t<R.length;t++){let i=R[t],n=x(i);k.includes(n)||(e.splice(t,0,i),P.push(i))}return"wait"===f&&P.length&&(e=P),N(g(e)),E(j),null}let{forceRender:A}=(0,i.useContext)(n.f);return(0,t.jsx)(t.Fragment,{children:R.map(e=>{let i=x(e),n=(!c||!!v)&&(j===R||k.includes(i));return(0,t.jsx)(p,{isPresent:n,initial:(!_.current||!!l)&&void 0,custom:a,presenceAffectsLayout:d,mode:f,root:b,onExitComplete:n?void 0:()=>{if(C.current.has(i)||!M.has(i))return;C.current.add(i),M.set(i,!0);let e=!0;M.forEach(t=>{t||(e=!1)}),e&&(A?.(),N(w.current),c&&y?.(),s&&s())},anchorX:u,anchorY:h,children:e},i)})})}],88653)},63209,532181,e=>{"use strict";var t=e.i(843476),i=e.i(271645),n=e.i(753034),o=e.i(737806),r=e.i(798125),a=e.i(947414);e.s(["f",0,function({children:e,isValidProp:l,...s}){l&&(0,r.P)(l);let d=(0,i.useContext)(o.f);(s={...d,...s}).transition=(0,n.f)(s.transition,d.transition),s.isStatic=(0,a.f)(()=>s.isStatic);let f=(0,i.useMemo)(()=>s,[JSON.stringify(s.transition),s.transformPagePoint,s.reducedMotion,s.skipAnimations]);return(0,t.jsx)(o.f.Provider,{value:f,children:e})}],63209);var l=e.i(846932);e.i(907051);let s=l.f;e.s(["f",0,s],532181)},887652,895420,591994,e=>{"use strict";var t=e.i(486427),i=e.i(271645),n=e.i(737806),o=e.i(947414);function r(e){let r=(0,o.f)(()=>(0,t.o)(e)),{isStatic:a}=(0,i.useContext)(n.f);if(a){let[,t]=(0,i.useState)(e);(0,i.useEffect)(()=>r.on("change",t),[])}return r}e.s(["f",0,r],887652);var a=e.i(83352),l=e.i(83411),s=e.i(287022);function d(e){return"number"==typeof e?e:parseFloat(e)}var f=e.i(344230),c=e.i(674008);function u(e,t){let i=r(t()),n=()=>i.set(t());return n(),(0,c.f)(()=>{let t=()=>s.y.preRender(n,!1,!0),i=e.map(e=>e.on("change",t));return()=>{i.forEach(e=>e()),(0,s.Y)(n)}}),i}function p(e,i,n,r){if("function"==typeof e){let i;return t.I.current=[],e(),i=u(t.I.current,e),t.I.current=void 0,i}if(void 0!==n&&!Array.isArray(n)&&"function"!=typeof i){var a=e,l=i,s=n,d=r;let t=(0,o.f)(()=>Object.keys(s)),f=(0,o.f)(()=>({}));for(let e of t)f[e]=p(a,l,s[e],d);return f}let c="function"==typeof i?i:function(...e){let t=!Array.isArray(e[0]),i=t?0:-1,n=e[0+i],o=e[1+i],r=e[2+i],a=e[3+i],l=(0,f.f)(o,r,a);return t?l(n):l}(i,n,r),m=Array.isArray(e)?h(e,c):h([e],([e])=>c(e)),x=Array.isArray(e)?void 0:e.accelerate;return x&&!x.isTransformed&&"function"!=typeof i&&Array.isArray(n)&&r?.clamp!==!1&&(m.accelerate={...x,times:i,keyframes:n,isTransformed:!0,...r?.ease?{ease:r.ease}:{}}),m}function h(e,t){let i=(0,o.f)(()=>[]);return u(e,()=>{i.length=0;let n=e.length;for(let t=0;t<n;t++)i[t]=e[t].get();return t(i)})}e.s(["f",0,p],895420),e.s(["f",0,function(e,t={}){return function(e,t={}){let{isStatic:o}=(0,i.useContext)(n.f),f=()=>(0,l.f)(e)?e.get():e;if(o)return p(f);let c=r(f());return(0,i.useInsertionEffect)(()=>(function(e,t,i={}){let n,o=e.get(),r=null,f=o,c="string"==typeof o?o.replace(/[\d.-]/g,""):void 0,u=()=>{r&&(r.stop(),r=null),e.animation=void 0},p=()=>{(()=>{let t=d(e.get()),o=d(f);if(t===o)return u();let l=r?r.getGeneratorVelocity():e.getVelocity();u(),r=new a.f({keyframes:[t,o],velocity:l,type:"spring",restDelta:.001,restSpeed:.01,...i,onUpdate:n})})(),e.animation=r??void 0,e.events.animationStart?.notify(),r?.then(()=>{e.animation=void 0,e.events.animationComplete?.notify()})};if(e.attach((e,t)=>{f=e,n=e=>{var i,n;return t((i=e,(n=c)?i+n:i))},s.y.postRender(p)},u),(0,l.f)(t)){let n=!0===i.skipInitialAnimation,o=t.on("change",t=>{var i,o,r,a;n?(n=!1,e.jump((i=t,(o=c)?i+o:i),!1)):e.set((r=t,(a=c)?r+a:r))}),r=e.on("destroy",o);return()=>{o(),r()}}return u})(c,e,t),[c,JSON.stringify(t)]),c}(e,{type:"spring",...t})}],591994)},674164,e=>{e.v({cursor:"T8ENeW_cursor",stage:"T8ENeW_stage",tile:"T8ENeW_tile"})},995336,e=>{"use strict";var t=e.i(843476),i=e.i(271645),n=e.i(88653),o=e.i(63209),r=e.i(532181),a=e.i(887652),l=e.i(591994),s=e.i(895420);let d=Number(i.version.split(".")[0])>=19;function f(){return d?(0,t.jsx)("style",{href:"floating-dock",precedence:"default",children:v}):(0,t.jsx)("style",{hidden:!0,dangerouslySetInnerHTML:{__html:v}})}function c({items:e,desktopClassName:i,mobileClassName:n,theme:r="light",label:a="Navegação"}){return(0,t.jsxs)(o.f,{reducedMotion:"user",children:[(0,t.jsx)(f,{}),(0,t.jsx)(m,{items:e,className:i,theme:r,label:a}),(0,t.jsx)(h,{items:e,className:n,theme:r,label:a})]})}function u(...e){return e.filter(Boolean).join(" ")}function p({item:e,className:i,children:n,onFocus:o,onBlur:r,onClick:a}){let l={className:i,"aria-label":e.title,"aria-current":e.active?"page":void 0,onFocus:o,onBlur:r,onClick:t=>{e.onClick?.(t),a?.(t)}};return null!=e.href?(0,t.jsx)("a",{href:e.href,...l,children:n}):(0,t.jsx)("button",{type:"button",...l,children:n})}function h({items:e,className:o,theme:a,label:l}){let[s,d]=i.useState(!1),f=i.useRef(null),c=i.useRef(null),m=i.useId();return i.useEffect(()=>{if(!s)return;let e=e=>{"Escape"!==e.key||e.defaultPrevented||(e.preventDefault(),d(!1),c.current?.focus())},t=e=>{f.current?.contains(e.target)||d(!1)};return document.addEventListener("keydown",e),document.addEventListener("pointerdown",t),()=>{document.removeEventListener("keydown",e),document.removeEventListener("pointerdown",t)}},[s]),(0,t.jsxs)("nav",{ref:f,className:u("fd-mobile",o),"data-fd-theme":a,"aria-label":l,children:[(0,t.jsx)(n.f,{children:s&&(0,t.jsx)(r.f.div,{id:m,className:"fd-mobile__list",children:e.map((i,n)=>(0,t.jsx)(r.f.div,{initial:{opacity:0,y:10},animate:{opacity:1,y:0},exit:{opacity:0,y:10,transition:{delay:.05*n}},transition:{delay:(e.length-1-n)*.05},children:(0,t.jsx)(p,{item:i,className:"fd-mobile__item",onClick:()=>d(!1),children:(0,t.jsx)("span",{className:"fd-icon fd-mobile__icon",children:i.icon})})},i.title))})}),(0,t.jsx)("button",{ref:c,type:"button",className:"fd-mobile__toggle",onClick:()=>d(e=>!e),"aria-expanded":s,"aria-controls":s?m:void 0,"aria-label":s?"Fechar o menu":"Abrir o menu",children:(0,t.jsx)(b,{})})]})}function m({items:e,className:i,theme:n,label:o}){let r=(0,a.f)(1/0);return(0,t.jsx)("nav",{className:u("fd-dock",i),"data-fd-theme":n,"aria-label":o,onPointerMove:e=>{"touch"!==e.pointerType&&r.set(e.clientX)},onPointerLeave:()=>r.set(1/0),children:e.map(e=>(0,t.jsx)(g,{mouseX:r,item:e},e.title))})}let x={mass:.1,stiffness:150,damping:12};function g({mouseX:e,item:o}){let a=i.useRef(null),d=(0,s.f)(e,e=>{let t=a.current;if(!t)return 1/0;let i=t.getBoundingClientRect(),n=t.offsetWidth>0?i.width/t.offsetWidth:1;return(e-i.left-i.width/2)/n}),f=(0,l.f)((0,s.f)(d,[-150,0,150],[40,80,40]),x),c=(0,l.f)((0,s.f)(d,[-150,0,150],[40,80,40]),x),u=(0,l.f)((0,s.f)(d,[-150,0,150],[20,40,20]),x),h=(0,l.f)((0,s.f)(d,[-150,0,150],[20,40,20]),x),[m,b]=i.useState(!1),[v,y]=i.useState(!1);return(0,t.jsx)(p,{item:o,className:"fd-dock__item",onFocus:e=>y(e.currentTarget.matches(":focus-visible")),onBlur:()=>y(!1),children:(0,t.jsxs)(r.f.div,{ref:a,style:{width:f,height:c},onPointerEnter:e=>"touch"!==e.pointerType&&b(!0),onPointerLeave:()=>b(!1),className:"fd-dock__tile",children:[(0,t.jsx)(n.f,{children:(m||v)&&(0,t.jsx)(r.f.div,{initial:{opacity:0,y:10,x:"-50%"},animate:{opacity:1,y:0,x:"-50%"},exit:{opacity:0,y:2,x:"-50%"},className:"fd-dock__tip","aria-hidden":"true",children:o.title})}),(0,t.jsx)(r.f.div,{style:{width:u,height:h},className:"fd-icon",children:o.icon})]})})}function b(){return(0,t.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",focusable:"false",children:[(0,t.jsx)("path",{d:"M4 18v-12a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2"}),(0,t.jsx)("path",{d:"M4 9h16"}),(0,t.jsx)("path",{d:"M10 16l2 -2l2 2"})]})}let v=`
/* o que o projeto pode trocar com uma classe (posi\xe7\xe3o, margem, largura, deslocamento): na camada base, que vem antes
   das classes de componente e dos utilit\xe1rios (Tailwind v4, Panda, Chakra) e perde para o CSS fora de camada (Tailwind
   v3, CSS Modules, CSS comum) */
@layer base {
  .fd-dock { position: relative; margin: 0 auto; }
  .fd-mobile { position: relative; margin: 0; }
}

/* as cores: claro de f\xe1brica, escuro com theme="dark". D\xe1 para trocar qualquer uma pelo tema do projeto */
.fd-dock, .fd-mobile {
  --fd-bg: #f9fafb;
  --fd-item: #e5e7eb;
  --fd-icon: #737373;
  --fd-toggle: #f9fafb;
  --fd-toggle-icon: #737373;
  --fd-tip-bg: #f3f4f6;
  --fd-tip-border: #e5e7eb;
  --fd-tip-text: #404040;
  --fd-ring: #737373;
}
.fd-dock[data-fd-theme="dark"], .fd-mobile[data-fd-theme="dark"] {
  --fd-bg: #171717;
  --fd-item: #262626;
  --fd-icon: #d4d4d4;
  --fd-toggle: #262626;
  --fd-toggle-icon: #a3a3a3;
  --fd-tip-bg: #262626;
  --fd-tip-border: #171717;
  --fd-tip-text: #fff;
  --fd-ring: #a3a3a3;
}

/* nada de texto herdado da p\xe1gina: a dock fica igual em qualquer projeto */
.fd-dock, .fd-mobile {
  box-sizing: border-box;
  font-family: ui-sans-serif, system-ui, -apple-system, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-style: normal;
  font-weight: 400;
  letter-spacing: normal;
  text-align: left;
  text-transform: none;
  text-shadow: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.fd-dock *, .fd-dock *::before, .fd-dock *::after,
.fd-mobile *, .fd-mobile *::before, .fd-mobile *::after { box-sizing: border-box; }

/* a dock na tela larga e o bot\xe3o na estreita */
.fd-dock { display: none; }
.fd-mobile { display: block; }
@media (min-width: 768px) {
  .fd-dock { display: flex; }
  .fd-mobile { display: none; }
}
.fd-dock[hidden], .fd-mobile[hidden] { display: none; }

/* o \xedcone ocupa o espa\xe7o inteiro, na cor do tema */
.fd-icon { display: flex; flex-shrink: 0; align-items: center; justify-content: center; margin: 0; color: var(--fd-icon); }
.fd-icon > svg, .fd-icon > img { display: block; width: 100%; height: 100%; max-width: none; margin: 0; object-fit: contain; }

/* os links e bot\xf5es, sem nada do navegador nem da p\xe1gina */
.fd-dock__item, .fd-mobile__item, .fd-mobile__toggle {
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  text-decoration: none;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
}
.fd-dock__item:focus-visible, .fd-mobile__item:focus-visible, .fd-mobile__toggle:focus-visible {
  outline: 2px solid var(--fd-ring);
  outline-offset: 2px;
}

/* a dock: 64 px de altura, com os \xedcones assentados embaixo, crescendo para cima */
.fd-dock {
  align-items: flex-end;
  gap: 16px;
  width: max-content;
  height: 64px;
  padding: 0 16px 12px;
  border-radius: 16px;
  background: var(--fd-bg);
}
.fd-dock__item { position: relative; display: block; border-radius: 999px; }
.fd-dock__item:focus-visible { outline-offset: 4px; }
.fd-dock__tile {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  background: var(--fd-item);
}
/* o ponto do item ativo, no v\xe3o embaixo do \xedcone */
.fd-dock__item[aria-current]::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: -7px;
  width: 4px;
  height: 4px;
  margin-left: -2px;
  border-radius: 999px;
  background: var(--fd-icon);
}
.fd-dock__tip {
  position: absolute;
  top: -32px;
  left: 50%;
  width: max-content;
  margin: 0;
  padding: 2px 8px;
  border: 1px solid var(--fd-tip-border);
  border-radius: 6px;
  background: var(--fd-tip-bg);
  color: var(--fd-tip-text);
  font-size: 12px;
  line-height: 16px;
  white-space: pre;
  pointer-events: none;
}

/* a tela estreita: o bot\xe3o, e a coluna que abre para cima dele */
.fd-mobile__list {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0 0 8px;
}
.fd-mobile__item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  background: var(--fd-bg);
}
.fd-mobile__icon { width: 16px; height: 16px; }
.fd-mobile__item[aria-current]::after {
  content: "";
  position: absolute;
  top: 50%;
  left: -8px;
  width: 4px;
  height: 4px;
  margin-top: -2px;
  border-radius: 999px;
  background: var(--fd-icon);
}
.fd-mobile__toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  background: var(--fd-toggle);
  color: var(--fd-toggle-icon);
}
.fd-mobile__toggle svg { display: block; width: 20px; height: 20px; }
`;function y(){let[e,n]=(0,i.useState)("Início"),o=[{title:"Início",icon:(0,t.jsx)(k,{})},{title:"Produtos",icon:(0,t.jsx)(_,{})},{title:"Componentes",icon:(0,t.jsx)(w,{})},{title:"Órbita",icon:(0,t.jsx)(E,{})},{title:"Novidades",icon:(0,t.jsx)(M,{})},{title:"X",icon:(0,t.jsx)(C,{})},{title:"GitHub",icon:(0,t.jsx)(S,{})}].map(t=>({...t,active:t.title===e,onClick:()=>n(t.title)}));return(0,t.jsxs)("div",{className:"fd-demo",children:[(0,t.jsx)("style",{dangerouslySetInnerHTML:{__html:R}}),(0,t.jsx)(c,{items:o,theme:"dark",mobileClassName:"fd-demo__mobile"})]})}function j({children:e}){return(0,t.jsx)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",focusable:"false",children:e})}function k(){return(0,t.jsxs)(j,{children:[(0,t.jsx)("path",{d:"M5 12l-2 0l9 -9l9 9l-2 0"}),(0,t.jsx)("path",{d:"M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7"}),(0,t.jsx)("path",{d:"M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6"})]})}function _(){return(0,t.jsxs)(j,{children:[(0,t.jsx)("path",{d:"M8 9l3 3l-3 3"}),(0,t.jsx)("path",{d:"M13 15l3 0"}),(0,t.jsx)("path",{d:"M3 6a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2l0 -12"})]})}function w(){return(0,t.jsxs)(j,{children:[(0,t.jsx)("path",{d:"M9 12l6 0"}),(0,t.jsx)("path",{d:"M12 9l0 6"}),(0,t.jsx)("path",{d:"M4 6v-1a1 1 0 0 1 1 -1h1m5 0h2m5 0h1a1 1 0 0 1 1 1v1m0 5v2m0 5v1a1 1 0 0 1 -1 1h-1m-5 0h-2m-5 0h-1a1 1 0 0 1 -1 -1v-1m0 -5v-2m0 -5"})]})}function M(){return(0,t.jsxs)(j,{children:[(0,t.jsx)("path",{d:"M3 18a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"}),(0,t.jsx)("path",{d:"M17 6a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"}),(0,t.jsx)("path",{d:"M19 8v5a5 5 0 0 1 -5 5h-3l3 -3m0 6l-3 -3"}),(0,t.jsx)("path",{d:"M5 16v-5a5 5 0 0 1 5 -5h3l-3 -3m0 6l3 -3"})]})}function C(){return(0,t.jsxs)(j,{children:[(0,t.jsx)("path",{d:"M4 4l11.733 16h4.267l-11.733 -16l-4.267 0"}),(0,t.jsx)("path",{d:"M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"})]})}function S(){return(0,t.jsx)(j,{children:(0,t.jsx)("path",{d:"M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5"})})}function E(){return(0,t.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none","aria-hidden":"true",focusable:"false",children:[(0,t.jsx)("circle",{cx:"12",cy:"12",r:"6.5",fill:"#8b5cf6"}),(0,t.jsx)("ellipse",{cx:"12",cy:"12",rx:"10.5",ry:"3.6",transform:"rotate(-24 12 12)",stroke:"#f0abfc",strokeWidth:"1.6"})]})}let R=`
.fd-demo {
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
.fd-demo__mobile { translate: 0 80px; }
`;var N=e.i(674164);let P={x:64,y:304},A={x:504,y:304},T=(()=>{let e=[{at:0,...P,o:0},{at:.3,...P,o:1}],t=1.1;for(let i=0;i<7;i++)e.push({at:t,item:i,o:1},{at:t+.55,item:i,o:1}),t+=.9;return e.push({at:(t-=.35)+.7,...A,o:1},{at:t+1,...A,o:0},{at:t+1.8,...A,o:0}),e})(),I=T[T.length-1].at,L=1.1+2.7+.275;e.s(["default",0,function({mode:e}){let n=(0,i.useRef)(null),o=(0,i.useRef)(null);return((0,i.useEffect)(()=>{if("tile"===e){var t,i;let e,r,a,l,s,d,f,c,u,p,h,m;return n.current?.querySelectorAll("button, a").forEach(e=>e.tabIndex=-1),t=n.current,i=o.current,e=matchMedia("(prefers-reduced-motion: reduce)").matches,r=t.closest(".preview"),a=t,l=0/0,s=0/0,d=0,f=0,c=0,u=(e,t,i,n,o=null)=>e.dispatchEvent(new PointerEvent(t,{bubbles:!0,cancelable:!0,composed:!0,clientX:i,clientY:n,pointerId:1,pointerType:"mouse",isPrimary:!0,relatedTarget:o})),p=n=>{d+=Math.min(100,n-f),f=n,(e=>{let n=t.getBoundingClientRect();if(!n.width||!t.offsetWidth)return;let o=n.width/t.offsetWidth,r=t.querySelectorAll(".fd-dock__tile"),d=function(e,t){let i,n=1;for(;n<T.length-1&&T[n].at<e;)n++;let o=T[n-1],r=T[n],a="item"in o?t(o.item):o,l="item"in r?t(r.item):r,s=(i=Math.min(1,Math.max(0,(e-o.at)/(r.at-o.at||1))))<.5?4*i*i*i:1-(-2*i+2)**3/2;return{x:a.x+(l.x-a.x)*s,y:a.y+(l.y-a.y)*s,o:o.o+(r.o-o.o)*s}}(e,e=>{let t=r[e]?.getBoundingClientRect();return t?.width?{x:(t.left+t.width/2-n.left)/o+2,y:(t.top+t.height/2-n.top)/o+8}:{x:114+56*e,y:218}});i.style.transform=`translate3d(${d.x}px, ${d.y}px, 0)`,i.style.opacity=String(d.o);let f=n.left+d.x*o,c=n.top+d.y*o,p=((e,i)=>{let n=t.querySelector(".fd-dock");if(!n)return t;for(let t of n.querySelectorAll(".fd-dock__tile")){let n=t.getBoundingClientRect(),o=e-(n.left+n.width/2),r=i-(n.top+n.height/2);if(o*o+r*r<=(n.width/2)**2)return t}let o=n.getBoundingClientRect();return e>=o.left&&e<=o.right&&i>=o.top&&i<=o.bottom?n:t})(f,c);p!==a&&(u(a,"pointerout",f,c,p),u(p,"pointerover",f,c,a),a=p),(f!==l||c!==s)&&a!==t&&u(a,"pointermove",f,c),l=f,s=c})(e?L:d/1e3%I),c=requestAnimationFrame(p)},m=new MutationObserver(h=()=>{let e=!r||r.classList.contains("is-playing");e&&!c?(f=performance.now(),c=requestAnimationFrame(p)):!e&&c&&(cancelAnimationFrame(c),c=0)}),r&&m.observe(r,{attributes:!0,attributeFilter:["class"]}),h(),()=>{m.disconnect(),cancelAnimationFrame(c)}}},[e]),"stage"===e)?(0,t.jsx)("div",{className:N.default.stage,children:(0,t.jsx)(y,{})}):(0,t.jsxs)("div",{ref:n,className:`${N.default.stage} ${N.default.tile}`,"aria-hidden":"true",onPointerMove:e=>e.stopPropagation(),children:[(0,t.jsx)(y,{}),(0,t.jsx)("div",{ref:o,className:N.default.cursor,children:(0,t.jsx)("svg",{viewBox:"0 0 14 21",width:"18",height:"27",children:(0,t.jsx)("path",{d:"M1 1v15.5l3.8-3.6 2.8 6.5 2.5-1.1-2.7-6.3h5.2z"})})})]})}],995336)},175477,function(e){e.n(e.i(995336))}]);

//# debugId=541ccd04-7f30-7528-2470-c4c3f617ecd6