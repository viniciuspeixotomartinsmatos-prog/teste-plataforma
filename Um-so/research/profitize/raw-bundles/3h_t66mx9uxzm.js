;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="9dd74075-1f6c-76b9-f332-92e194fd3e13")}catch(e){}}();
(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,88653,e=>{"use strict";var a=e.i(843476),t=e.i(271645),o=e.i(231178),i=e.i(947414),r=e.i(674008),n=e.i(821476),s=e.i(772846),l=t,p=e.i(737806);function d(e,a){if("function"==typeof e)return e(a);null!=e&&(e.current=a)}class c extends l.Component{getSnapshotBeforeUpdate(e){let a=this.props.childRef.current;if((0,s.isHTMLElement)(a)&&e.isPresent&&!this.props.isPresent&&!1!==this.props.pop){let e=a.offsetParent,t=(0,s.isHTMLElement)(e)&&e.offsetWidth||0,o=(0,s.isHTMLElement)(e)&&e.offsetHeight||0,i=getComputedStyle(a),r=this.props.sizeRef.current;r.height=parseFloat(i.height),r.width=parseFloat(i.width),r.top=a.offsetTop,r.left=a.offsetLeft,r.right=t-r.width-r.left,r.bottom=o-r.height-r.top,r.direction=i.direction}return null}componentDidUpdate(){}render(){return this.props.children}}function b({children:e,isPresent:o,anchorX:i,anchorY:r,root:n,pop:s}){let u=(0,l.useId)(),h=(0,l.useRef)(null),x=(0,l.useRef)({width:0,height:0,top:0,left:0,right:0,bottom:0,direction:"ltr"}),{nonce:m}=(0,l.useContext)(p.MotionConfigContext),f=function(...e){return t.useCallback(function(...e){return a=>{let t=!1,o=e.map(e=>{let o=d(e,a);return t||"function"!=typeof o||(t=!0),o});if(t)return()=>{for(let a=0;a<o.length;a++){let t=o[a];"function"==typeof t?t():d(e[a],null)}}}}(...e),e)}(h,!1!==s?e.props?.ref??e?.ref:void 0);return(0,l.useInsertionEffect)(()=>{let{width:e,height:a,top:t,left:l,right:p,bottom:d,direction:c}=x.current;if(o||!1===s||!h.current||!e||!a)return;let b="rtl"===c,f="left"===i?b?`right: ${p}`:`left: ${l}`:b?`left: ${l}`:`right: ${p}`,g="bottom"===r?`bottom: ${d}`:`top: ${t}`;h.current.dataset.motionPopId=u;let v=document.createElement("style");m&&(v.nonce=m);let w=n??document.head;return w.appendChild(v),v.sheet&&v.sheet.insertRule(`
          [data-motion-pop-id="${u}"] {
            position: absolute !important;
            width: ${e}px !important;
            height: ${a}px !important;
            ${f}px !important;
            ${g}px !important;
          }
        `),()=>{h.current?.removeAttribute("data-motion-pop-id"),w.contains(v)&&w.removeChild(v)}},[o]),(0,a.jsx)(c,{isPresent:o,childRef:h,sizeRef:x,pop:s,children:!1===s?e:l.cloneElement(e,{ref:f})})}let u=({children:e,initial:o,isPresent:s,onExitComplete:l,custom:p,presenceAffectsLayout:d,mode:c,anchorX:u,anchorY:x,root:m})=>{let f=(0,i.useConstant)(h),g=(0,t.useId)(),v=(0,t.useRef)(s),w=(0,t.useRef)(l);(0,r.useIsomorphicLayoutEffect)(()=>{v.current=s,w.current=l});let y=!0,j=(0,t.useMemo)(()=>(y=!1,{id:g,initial:o,isPresent:s,custom:p,onExitComplete:e=>{for(let a of(f.set(e,!0),f.values()))if(!a)return;l&&l()},register:e=>(f.set(e,!1),()=>{f.delete(e),v.current||f.size||w.current?.()})}),[s,f,l]);return d&&y&&(j={...j}),(0,t.useMemo)(()=>{f.forEach((e,a)=>f.set(a,!1))},[s]),t.useEffect(()=>{s||f.size||!l||l()},[s]),e=(0,a.jsx)(b,{pop:"popLayout"===c,isPresent:s,anchorX:u,anchorY:x,root:m,children:e}),(0,a.jsx)(n.PresenceContext.Provider,{value:j,children:e})};function h(){return new Map}var x=e.i(464978);let m=e=>e.key||"";function f(e){let a=[];return t.Children.forEach(e,e=>{(0,t.isValidElement)(e)&&a.push(e)}),a}e.s(["AnimatePresence",0,({children:e,custom:n,initial:s=!0,onExitComplete:l,presenceAffectsLayout:p=!0,mode:d="sync",propagate:c=!1,anchorX:b="left",anchorY:h="top",root:g})=>{let[v,w]=(0,x.usePresence)(c),y=(0,t.useMemo)(()=>f(e),[e]),j=c&&!v?[]:y.map(m),_=(0,t.useRef)(!0),k=(0,t.useRef)(y),C=(0,i.useConstant)(()=>new Map),M=(0,t.useRef)(new Set),[S,P]=(0,t.useState)(y),[N,z]=(0,t.useState)(y);(0,r.useIsomorphicLayoutEffect)(()=>{_.current=!1,k.current=y;for(let e=0;e<N.length;e++){let a=m(N[e]);j.includes(a)?(C.delete(a),M.current.delete(a)):!0!==C.get(a)&&C.set(a,!1)}},[N,j.length,j.join("-")]);let E=[];if(y!==S){let e=[...y];for(let a=0;a<N.length;a++){let t=N[a],o=m(t);j.includes(o)||(e.splice(a,0,t),E.push(t))}return"wait"===d&&E.length&&(e=E),z(f(e)),P(y),null}let{forceRender:T}=(0,t.useContext)(o.LayoutGroupContext);return(0,a.jsx)(a.Fragment,{children:N.map(e=>{let t=m(e),o=(!c||!!v)&&(y===N||j.includes(t));return(0,a.jsx)(u,{isPresent:o,initial:(!_.current||!!s)&&void 0,custom:n,presenceAffectsLayout:p,mode:d,root:g,onExitComplete:o?void 0:()=>{if(M.current.has(t)||!C.has(t))return;M.current.add(t),C.set(t,!0);let e=!0;C.forEach(a=>{a||(e=!1)}),e&&(T?.(),z(k.current),c&&w?.(),l&&l())},anchorX:b,anchorY:h,children:e},t)})})}],88653)},63209,532181,e=>{"use strict";var a=e.i(843476),t=e.i(271645),o=e.i(753034),i=e.i(737806),r=e.i(798125),n=e.i(947414);e.s(["MotionConfig",0,function({children:e,isValidProp:s,...l}){s&&(0,r.loadExternalIsValidProp)(s);let p=(0,t.useContext)(i.MotionConfigContext);(l={...p,...l}).transition=(0,o.resolveTransition)(l.transition,p.transition),l.isStatic=(0,n.useConstant)(()=>l.isStatic);let d=(0,t.useMemo)(()=>l,[JSON.stringify(l.transition),l.transformPagePoint,l.reducedMotion,l.skipAnimations]);return(0,a.jsx)(i.MotionConfigContext.Provider,{value:d,children:e})}],63209);var s=e.i(846932);e.i(907051);let l=s.motion;e.s(["motion",0,l],532181)},735109,e=>{e.v({cursor:"AiPromptBox-module__5J1wcW__cursor",ripple:"AiPromptBox-module__5J1wcW__ripple",stage:"AiPromptBox-module__5J1wcW__stage",tile:"AiPromptBox-module__5J1wcW__tile"})},811870,e=>{"use strict";var a=e.i(843476),t=e.i(271645),o=e.i(88653),i=e.i(63209),r=e.i(532181);let n=Number(t.version.split(".")[0])>=19;function s(){return n?(0,a.jsx)("style",{href:"ai-prompt-box",precedence:"default",children:k}):(0,a.jsx)("style",{hidden:!0,dangerouslySetInnerHTML:{__html:k}})}let l={search:{label:"Pesquisar",prefix:"Pesquisar",placeholder:"Pesquisar na web...",icon:(0,a.jsx)(function(){return(0,a.jsxs)(f,{children:[(0,a.jsx)("circle",{cx:"12",cy:"12",r:"10"}),(0,a.jsx)("path",{d:"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"}),(0,a.jsx)("path",{d:"M2 12h20"})]})},{})},think:{label:"Pensar",prefix:"Pensar",placeholder:"Pensar a fundo...",icon:(0,a.jsx)(function(){return(0,a.jsxs)(f,{children:[(0,a.jsx)("path",{d:"m10.852 14.772-.383.923"}),(0,a.jsx)("path",{d:"m10.852 9.228-.383-.923"}),(0,a.jsx)("path",{d:"m13.148 14.772.382.924"}),(0,a.jsx)("path",{d:"m13.531 8.305-.383.923"}),(0,a.jsx)("path",{d:"m14.772 10.852.923-.383"}),(0,a.jsx)("path",{d:"m14.772 13.148.923.383"}),(0,a.jsx)("path",{d:"M17.598 6.5A3 3 0 1 0 12 5a3 3 0 0 0-5.63-1.446 3 3 0 0 0-.368 1.571 4 4 0 0 0-2.525 5.771"}),(0,a.jsx)("path",{d:"M17.998 5.125a4 4 0 0 1 2.525 5.771"}),(0,a.jsx)("path",{d:"M19.505 10.294a4 4 0 0 1-1.5 7.706"}),(0,a.jsx)("path",{d:"M4.032 17.483A4 4 0 0 0 11.464 20c.18-.311.892-.311 1.072 0a4 4 0 0 0 7.432-2.516"}),(0,a.jsx)("path",{d:"M4.5 10.291A4 4 0 0 0 6 18"}),(0,a.jsx)("path",{d:"M6.002 5.125a3 3 0 0 0 .4 1.375"}),(0,a.jsx)("path",{d:"m9.228 10.852-.923-.383"}),(0,a.jsx)("path",{d:"m9.228 13.148-.923.383"}),(0,a.jsx)("circle",{cx:"12",cy:"12",r:"3"})]})},{})},canvas:{label:"Canvas",prefix:"Canvas",placeholder:"Criar no canvas...",icon:(0,a.jsx)(function(){return(0,a.jsxs)(f,{children:[(0,a.jsx)("path",{d:"M10 10.5 8 13l2 2.5"}),(0,a.jsx)("path",{d:"m14 10.5 2 2.5-2 2.5"}),(0,a.jsx)("path",{d:"M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z"})]})},{})}},p=t.forwardRef(function({onSend:e,onStop:o,isLoading:r=!1,placeholder:n="Digite sua mensagem aqui...",className:p},u){let[h,f]=t.useState(""),[k,C]=t.useState([]),[M,S]=t.useState({}),[P,N]=t.useState(null),[z,E]=t.useState(null),[T,R]=t.useState({search:!1,think:!1,canvas:!1}),A=t.useRef(null),$=t.useRef(null),L=null!==z,D=r||L,I=""!==h.trim()||k.length>0;t.useEffect(()=>{let e=$.current;e&&(e.style.height="auto",e.style.height=`${Math.min(e.scrollHeight,240)}px`)},[h]);let q=e=>R(a=>"canvas"===e?{...a,canvas:!a.canvas}:{...a,search:!1,think:!1,[e]:!a[e]}),U=e=>{if(!e.type.startsWith("image/")||e.size>0xa00000)return;C([e]);let a=new FileReader;a.onload=a=>S({[e.name]:a.target?.result}),a.readAsDataURL(e)},B=()=>{C([]),S({})},F=e=>{e.preventDefault(),e.stopPropagation()},H=()=>{if(!I)return;let a=T.search?"search":T.think?"think":T.canvas?"canvas":null;e?.(a?`[${l[a].prefix}: ${h}]`:h,k),f(""),C([]),S({})},W=r?"Parar geração":L?"Parar gravação":I?"Enviar mensagem":"Mensagem de voz",O=T.search?l.search.placeholder:T.think?l.think.placeholder:T.canvas?l.canvas.placeholder:n;return(0,a.jsxs)(i.MotionConfig,{reducedMotion:"user",children:[(0,a.jsx)(s,{}),(0,a.jsxs)("div",{ref:u,className:function(...e){return e.filter(Boolean).join(" ")}("apb-root",p),"data-state":r?"loading":L?"recording":void 0,onPaste:e=>{if(!D)for(let a of Array.from(e.clipboardData.items)){if(!a.type.startsWith("image/"))continue;let t=a.getAsFile();if(t){e.preventDefault(),U(t);break}}},onDragOver:F,onDragLeave:F,onDrop:e=>{e.preventDefault(),e.stopPropagation();let a=Array.from(e.dataTransfer.files).find(e=>e.type.startsWith("image/"));a&&!D&&U(a)},children:[k.length>0&&!L&&(0,a.jsx)("div",{className:"apb-files",children:k.map(e=>M[e.name]?(0,a.jsxs)("div",{className:"apb-file",children:[(0,a.jsx)("button",{type:"button",className:"apb-file__thumb",onClick:()=>N(M[e.name]),"aria-label":`Ver ${e.name}`,children:(0,a.jsx)("img",{src:M[e.name],alt:""})}),(0,a.jsx)("button",{type:"button",className:"apb-file__remove",onClick:B,"aria-label":"Remover a imagem",children:(0,a.jsx)(_,{})})]},e.name):null)}),(0,a.jsx)("div",{className:"apb-input","data-hidden":L||void 0,children:(0,a.jsx)("textarea",{ref:$,className:"apb-textarea",rows:1,value:h,onChange:e=>f(e.target.value),onKeyDown:e=>{"Enter"!==e.key||e.shiftKey||e.nativeEvent.isComposing||(e.preventDefault(),H())},placeholder:O,"aria-label":"Mensagem",disabled:D})}),null!==z&&(0,a.jsx)(b,{startedAt:z}),(0,a.jsxs)("div",{className:"apb-actions",children:[(0,a.jsxs)("div",{className:"apb-tools","data-hidden":L||void 0,children:[(0,a.jsx)(x,{label:"Anexar imagem",children:(0,a.jsx)("button",{type:"button",className:"apb-icon-btn",onClick:()=>A.current?.click(),disabled:L,"aria-label":"Anexar imagem",children:(0,a.jsx)(g,{})})}),(0,a.jsx)("input",{ref:A,type:"file",accept:"image/*",hidden:!0,tabIndex:-1,onChange:e=>{e.target.files?.length&&U(e.target.files[0]),e.target.value=""}}),(0,a.jsxs)("div",{className:"apb-modes",children:[(0,a.jsx)(d,{mode:"search",active:T.search,onToggle:q}),(0,a.jsx)(c,{}),(0,a.jsx)(d,{mode:"think",active:T.think,onToggle:q}),(0,a.jsx)(c,{}),(0,a.jsx)(d,{mode:"canvas",active:T.canvas,onToggle:q})]})]}),(0,a.jsx)(x,{label:W,children:(0,a.jsx)("button",{type:"button",className:"apb-send","data-state":L?"recording":r?"loading":I?"send":"voice",onClick:()=>{if(L){let a;a=Math.floor((performance.now()-(z??performance.now()))/1e3),E(null),e?.(`[Mensagem de voz - ${a} ${1===a?"segundo":"segundos"}]`,[])}else r?o?.():I?H():E(performance.now())},disabled:r&&!L&&!o,"aria-label":W,children:r?(0,a.jsx)(y,{}):L?(0,a.jsx)(j,{}):I?(0,a.jsx)(w,{}):(0,a.jsx)(v,{})})})]})]}),(0,a.jsx)(m,{imageUrl:P,onClose:()=>N(null)})]})});function d({mode:e,active:t,onToggle:i}){let{label:n,icon:s}=l[e];return(0,a.jsxs)("button",{type:"button",className:"apb-mode","data-mode":e,"data-active":t||void 0,onClick:()=>i(e),"aria-pressed":t,"aria-label":n,children:[(0,a.jsx)("span",{className:"apb-mode__icon",children:(0,a.jsx)(r.motion.span,{className:"apb-mode__glyph",animate:{rotate:360*!!t,scale:t?1.1:1},whileHover:{rotate:t?360:15,scale:1.1,transition:{type:"spring",stiffness:300,damping:10}},transition:{type:"spring",stiffness:260,damping:25},children:s})}),(0,a.jsx)(o.AnimatePresence,{children:t&&(0,a.jsx)(r.motion.span,{className:"apb-mode__label",initial:{width:0,opacity:0},animate:{width:"auto",opacity:1},exit:{width:0,opacity:0},transition:{duration:.2},children:n})})]})}function c(){return(0,a.jsx)("span",{className:"apb-divider","aria-hidden":"true",children:(0,a.jsx)("span",{})})}function b({startedAt:e,bars:o=32}){let[i,r]=t.useState(0),[n,s]=t.useState(()=>u(o)),[l]=t.useState(()=>Array.from({length:o},()=>.5+.5*Math.random()));t.useEffect(()=>{let a=0,t=()=>1e3-(performance.now()-e)%1e3,i=()=>{r(Math.floor((performance.now()-e+1)/1e3)),s(u(o)),a=window.setTimeout(i,t())};return a=window.setTimeout(i,t()),()=>window.clearTimeout(a)},[e,o]);let p=String(Math.floor(i/60)).padStart(2,"0"),d=String(i%60).padStart(2,"0");return(0,a.jsxs)("div",{className:"apb-recorder",role:"timer","aria-label":"Gravando",children:[(0,a.jsxs)("div",{className:"apb-recorder__time",children:[(0,a.jsx)("span",{className:"apb-recorder__dot"}),(0,a.jsxs)("span",{className:"apb-recorder__clock",children:[p,":",d]})]}),(0,a.jsx)("div",{className:"apb-recorder__bars","aria-hidden":"true",children:n.map((e,t)=>(0,a.jsx)("span",{className:"apb-recorder__bar",style:{height:`${e}%`,animationDelay:`${.05*t}s`,animationDuration:`${l[t]}s`}},t))})]})}function u(e){return Array.from({length:e},()=>Math.max(15,100*Math.random()))}let h=-1/0;function x({label:e,children:i}){let[n,s]=t.useState(!1),l=t.useRef(void 0),p=t.useRef(!1),d=e=>{window.clearTimeout(l.current),p.current&&!e&&(h=performance.now()),p.current=e,s(e)},c=(e,a)=>{e.currentTarget.querySelector("button:disabled")||(window.clearTimeout(l.current),a||performance.now()-h<300?d(!0):l.current=window.setTimeout(()=>d(!0),700))},b=()=>d(!1);return t.useEffect(()=>()=>window.clearTimeout(l.current),[]),(0,a.jsxs)("span",{className:"apb-tip-anchor",onPointerEnter:e=>"touch"!==e.pointerType&&c(e,!1),onPointerLeave:b,onPointerDown:b,onFocus:e=>e.target.matches(":focus-visible")&&c(e,!0),onBlur:b,onKeyDown:e=>{"Escape"===e.key&&p.current&&(e.preventDefault(),b())},children:[i,(0,a.jsx)(o.AnimatePresence,{children:n&&(0,a.jsx)(r.motion.span,{ref:e=>{let a;return a=e?.parentElement,void(e&&a&&(e.style.left=`${Math.round((a.offsetWidth-parseFloat(getComputedStyle(e).width))/2)}px`))},className:"apb-tip","aria-hidden":"true",initial:{opacity:0,scale:.95,y:8},animate:{opacity:1,scale:1,y:0},exit:{opacity:0,scale:.95,y:0},transition:{duration:.15,ease:[.25,.1,.25,1]},children:e})})]})}function m({imageUrl:e,onClose:o}){let i=t.useRef(null);return(t.useEffect(()=>{let a=i.current;if(!a||!e)return;a.open||a.showModal();let t=document.documentElement,o=t.style.overflow;return t.style.overflow="hidden",()=>{t.style.overflow=o}},[e]),e)?(0,a.jsx)("dialog",{ref:i,className:"apb-dialog","aria-label":"Prévia da imagem",onClose:e=>{e.currentTarget.open||o()},onClick:e=>{e.target===e.currentTarget&&e.currentTarget.close()},children:(0,a.jsxs)("div",{className:"apb-dialog__content",children:[(0,a.jsx)("div",{className:"apb-dialog__frame",children:(0,a.jsx)("img",{className:"apb-dialog__img",src:e,alt:"Imagem anexada"})}),(0,a.jsx)("button",{type:"button",className:"apb-dialog__close",onClick:()=>i.current?.close(),"aria-label":"Fechar",children:(0,a.jsx)(_,{})})]})}):null}function f({children:e}){return(0,a.jsx)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",focusable:"false",children:e})}function g(){return(0,a.jsxs)(f,{children:[(0,a.jsx)("path",{d:"M13.234 20.252 21 12.3"}),(0,a.jsx)("path",{d:"m16 6-8.414 8.586a2 2 0 0 0 0 2.828 2 2 0 0 0 2.828 0l8.414-8.586a4 4 0 0 0 0-5.656 4 4 0 0 0-5.656 0l-8.415 8.585a6 6 0 1 0 8.486 8.486"})]})}function v(){return(0,a.jsxs)(f,{children:[(0,a.jsx)("path",{d:"M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"}),(0,a.jsx)("path",{d:"M19 10v2a7 7 0 0 1-14 0v-2"}),(0,a.jsx)("line",{x1:"12",x2:"12",y1:"19",y2:"22"})]})}function w(){return(0,a.jsxs)(f,{children:[(0,a.jsx)("path",{d:"m5 12 7-7 7 7"}),(0,a.jsx)("path",{d:"M12 19V5"})]})}function y(){return(0,a.jsx)(f,{children:(0,a.jsx)("rect",{width:"18",height:"18",x:"3",y:"3",rx:"2"})})}function j(){return(0,a.jsxs)(f,{children:[(0,a.jsx)("circle",{cx:"12",cy:"12",r:"10"}),(0,a.jsx)("rect",{x:"9",y:"9",width:"6",height:"6",rx:"1"})]})}function _(){return(0,a.jsxs)(f,{children:[(0,a.jsx)("path",{d:"M18 6 6 18"}),(0,a.jsx)("path",{d:"m6 6 12 12"})]})}let k=`
/* o que o projeto pode trocar com uma classe (largura, margem): na camada base, que vem antes das classes de
   componente e dos utilit\xe1rios (Tailwind v4, Panda, Chakra) e perde para o CSS fora de camada (Tailwind v3, CSS
   Modules, CSS comum) */
@layer base {
  .apb-root { width: 100%; margin: 0; }
}

/* as cores: d\xe1 para trocar qualquer uma pelo tema do projeto */
.apb-root, .apb-dialog {
  --apb-bg: #1f2023;
  --apb-border: #444444;
  --apb-text: oklch(96.7% 0.003 264.542);
  --apb-placeholder: oklch(70.7% 0.022 261.325);
  --apb-icon: #9ca3af;
  --apb-icon-hover: #d1d5db;
  --apb-hover-bg: oklch(44.6% 0.03 256.802 / 0.3);
  --apb-busy: oklch(63.7% 0.237 25.331);
  --apb-search: #1eaedb;
  --apb-think: #8b5cf6;
  --apb-canvas: #f97316;
  --apb-divider: #9b87f5;
  --apb-button: #ffffff;
  --apb-button-icon: #1f2023;
  --apb-tip-bg: #1f2023;
  --apb-tip-border: #333333;
  --apb-tip-text: #ffffff;
  --apb-ring: #9b87f5;
}

/* nada de texto herdado da p\xe1gina: a caixa fica igual em qualquer projeto */
.apb-root, .apb-dialog {
  box-sizing: border-box;
  font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 24px;
  letter-spacing: normal;
  text-align: left;
  text-transform: none;
  text-shadow: none;
  -webkit-font-smoothing: auto;
  -moz-osx-font-smoothing: auto;
}
.apb-root *, .apb-root *::before, .apb-root *::after,
.apb-dialog *, .apb-dialog *::before, .apb-dialog *::after { box-sizing: border-box; }
.apb-root svg, .apb-dialog svg { display: block; flex-shrink: 0; }

/* os bot\xf5es, sem nada do navegador nem da p\xe1gina */
.apb-root button, .apb-dialog button {
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  letter-spacing: inherit;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
}
.apb-root button:focus-visible, .apb-dialog button:focus-visible {
  outline: 2px solid var(--apb-ring);
  outline-offset: 2px;
}

/* a caixa */
.apb-root {
  padding: 8px;
  border: 1px solid var(--apb-border);
  border-radius: 24px;
  background: var(--apb-bg);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.24);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.apb-root[data-state] { border-color: color-mix(in oklab, var(--apb-busy) 70%, transparent); }

/* a imagem anexada */
.apb-files { display: flex; flex-wrap: wrap; gap: 8px; padding: 0 0 4px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.apb-file { position: relative; }
.apb-root .apb-file__thumb {
  display: block;
  width: 64px;
  height: 64px;
  overflow: hidden;
  border-radius: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.apb-file__thumb img { display: block; width: 100%; height: 100%; max-width: none; margin: 0; object-fit: cover; }
.apb-root .apb-file__remove {
  position: absolute;
  top: 4px;
  right: 4px;
  padding: 2px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.7);
  color: #ffffff;
}
.apb-file__remove svg { width: 12px; height: 12px; }

/* o texto: cresce com as linhas, at\xe9 240 px */
.apb-input { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.apb-input[data-hidden] { height: 0; overflow: hidden; opacity: 0; }
.apb-textarea {
  display: block;
  width: 100%;
  min-height: 44px;
  margin: 0;
  padding: 10px 12px;
  border: 0;
  border-radius: 8px;
  outline: none;
  background: transparent;
  box-shadow: none;
  color: var(--apb-text);
  font: inherit;
  letter-spacing: inherit;
  resize: none;
  -webkit-appearance: none;
  appearance: none;
}
.apb-textarea::placeholder { color: var(--apb-placeholder); opacity: 1; }
.apb-textarea:disabled { cursor: not-allowed; opacity: 0.5; }
.apb-textarea::-webkit-scrollbar { width: 6px; }
.apb-textarea::-webkit-scrollbar-track { background: transparent; }
.apb-textarea::-webkit-scrollbar-thumb { background-color: #444444; border-radius: 3px; }
.apb-textarea::-webkit-scrollbar-thumb:hover { background-color: #555555; }

/* a fileira de baixo: o clipe e os modos \xe0 esquerda, o bot\xe3o redondo \xe0 direita */
.apb-actions { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 8px 0 0; }
.apb-tools { display: flex; align-items: center; gap: 4px; transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.apb-tools[data-hidden] { height: 0; opacity: 0; visibility: hidden; }
.apb-root .apb-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  color: var(--apb-icon);
  transition: color 0.15s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}
.apb-root .apb-icon-btn:hover { background: var(--apb-hover-bg); color: var(--apb-icon-hover); }
.apb-icon-btn svg { width: 20px; height: 20px; }

/* os modos: s\xf3 o \xedcone desligados; ligados, na cor deles, com o nome ao lado */
.apb-modes { display: flex; align-items: center; }
.apb-mode[data-mode="search"] { --apb-mode: var(--apb-search); }
.apb-mode[data-mode="think"] { --apb-mode: var(--apb-think); }
.apb-mode[data-mode="canvas"] { --apb-mode: var(--apb-canvas); }
.apb-root .apb-mode {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 32px;
  padding: 4px 8px;
  border: 1px solid transparent;
  border-radius: 999px;
  color: var(--apb-icon);
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}
.apb-root .apb-mode:hover { color: var(--apb-icon-hover); }
.apb-root .apb-mode[data-active] {
  border-color: var(--apb-mode);
  background: color-mix(in srgb, var(--apb-mode) 15%, transparent);
  color: var(--apb-mode);
}
.apb-mode__icon { display: flex; flex-shrink: 0; align-items: center; justify-content: center; width: 20px; height: 20px; }
.apb-mode__glyph { display: block; }
.apb-mode__glyph svg { width: 16px; height: 16px; }
.apb-mode__label { display: block; flex-shrink: 0; overflow: hidden; font-size: 12px; line-height: 16px; white-space: nowrap; }
.apb-divider { position: relative; display: block; width: 1.5px; height: 24px; margin: 0 4px; }
.apb-divider > span {
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0) 0%, color-mix(in oklab, var(--apb-divider) 70%, transparent) 50%, rgba(0, 0, 0, 0) 100%);
  clip-path: polygon(0% 0%, 100% 0%, 100% 40%, 140% 50%, 100% 60%, 100% 100%, 0% 100%, 0% 60%, -40% 50%, 0% 40%);
}

/* o bot\xe3o redondo: microfone, enviar, parar a grava\xe7\xe3o ou parar a resposta */
.apb-root .apb-send {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: var(--apb-button);
  color: var(--apb-button-icon);
  transition: color 0.2s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.apb-root .apb-send:hover { background: color-mix(in oklab, var(--apb-button) 80%, transparent); }
.apb-root .apb-send:disabled { opacity: 0.5; pointer-events: none; }
.apb-send svg { width: 20px; height: 20px; }
.apb-send[data-state="send"] svg { width: 16px; height: 16px; }
.apb-send[data-state="recording"] { color: var(--apb-busy); }
.apb-send[data-state="loading"] svg {
  width: 16px;
  height: 16px;
  color: #000000;
  fill: var(--apb-button-icon);
  animation: apb-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* a grava\xe7\xe3o de mentira */
.apb-recorder { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; padding: 12px 0; }
.apb-recorder__time { display: flex; align-items: center; gap: 8px; margin: 0 0 12px; }
.apb-recorder__dot {
  display: block;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--apb-busy);
  animation: apb-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
.apb-recorder__clock {
  color: rgba(255, 255, 255, 0.8);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 14px;
  line-height: 20px;
}
.apb-recorder__bars { display: flex; align-items: center; justify-content: center; gap: 2px; width: 100%; height: 40px; padding: 0 16px; }
.apb-recorder__bar {
  display: block;
  width: 2px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.5);
  animation: apb-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes apb-pulse { 50% { opacity: 0.5; } }

/* os bal\xf5es, 4 px acima do bot\xe3o */
.apb-tip-anchor { position: relative; display: inline-flex; }
.apb-tip {
  position: absolute;
  bottom: calc(100% + 4px);
  left: 0;
  z-index: 50;
  width: max-content;
  padding: 6px 12px;
  border: 1px solid var(--apb-tip-border);
  border-radius: 8px;
  background: var(--apb-tip-bg);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  color: var(--apb-tip-text);
  font-size: 14px;
  line-height: 20px;
  white-space: nowrap;
  pointer-events: none;
}

/* a imagem em tela cheia */
.apb-dialog {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  max-width: none;
  max-height: none;
  margin: 0;
  padding: 0;
  border: 0;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.6);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  color: #ffffff;
  animation: apb-fade-in 0.15s ease;
}
.apb-dialog:not([open]) { display: none; }
.apb-dialog::backdrop { background: transparent; }
/* no centro da tela, pelo top e left em 50% e o translate */
.apb-dialog__content {
  position: fixed;
  top: 50%;
  left: 50%;
  translate: -50% -50%;
  width: 100%;
  max-width: 90vw;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  animation: apb-zoom-in 0.3s ease;
}
@media (min-width: 768px) {
  .apb-dialog__content { max-width: 800px; }
}
.apb-dialog__frame {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  background: var(--apb-bg);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
.apb-dialog__img { display: block; width: 100%; max-width: none; max-height: 80vh; margin: 0; border-radius: 16px; object-fit: contain; }
.apb-dialog .apb-dialog__close {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
  padding: 8px;
  border-radius: 999px;
  background: rgba(46, 48, 51, 0.8);
  color: oklch(92.8% 0.006 264.531);
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}
.apb-dialog .apb-dialog__close:hover { background: #2e3033; color: #ffffff; }
.apb-dialog__close svg { width: 20px; height: 20px; }
@keyframes apb-fade-in { from { opacity: 0; } }
@keyframes apb-zoom-in { from { opacity: 0; scale: 0.95; } }

@media (prefers-reduced-motion: reduce) {
  .apb-recorder__dot, .apb-recorder__bar, .apb-send[data-state="loading"] svg, .apb-dialog, .apb-dialog__content { animation: none; }
}
`;function C(){let[e,o]=(0,t.useState)(null),[i,r]=(0,t.useState)(!1),n=(0,t.useRef)(void 0);return(0,t.useEffect)(()=>{let a=e?.image;return()=>{a&&URL.revokeObjectURL(a)}},[e]),(0,t.useEffect)(()=>()=>window.clearTimeout(n.current),[]),(0,a.jsxs)("div",{className:"apb-demo",children:[(0,a.jsx)("style",{dangerouslySetInnerHTML:{__html:M}}),(0,a.jsxs)("div",{className:"apb-demo__chat",children:[e&&(0,a.jsxs)("div",{className:"apb-demo__bubble",children:[e.image&&(0,a.jsx)("img",{src:e.image,alt:"Imagem enviada"}),e.text&&(0,a.jsx)("p",{children:e.text})]},e.id),(0,a.jsx)(p,{onSend:(e,a)=>{let t=a?.[0];o(a=>({id:(a?.id??0)+1,text:e,image:t?URL.createObjectURL(t):void 0})),r(!0),window.clearTimeout(n.current),n.current=window.setTimeout(()=>r(!1),2e3)},onStop:()=>{window.clearTimeout(n.current),r(!1)},isLoading:i})]})]})}let M=`
.apb-demo {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 100%;
  min-height: 100svh;
  overflow: hidden;
  background: radial-gradient(125% 125% at 50% 101%, #ff5f45 10.5%, #ff7a5c 16%, #f98a86 17.5%, #ec9fb8 25%, #c59be6 40%, #7d68d8 65%, #241c52 100%);
}
.apb-demo__chat { position: relative; box-sizing: border-box; width: 100%; max-width: 500px; padding: 16px; }
.apb-demo__bubble {
  position: absolute;
  right: 16px;
  bottom: calc(100% - 4px);
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  box-sizing: border-box;
  max-width: calc(100% - 64px);
  padding: 10px 14px;
  border: 1px solid #444444;
  border-radius: 18px 18px 6px 18px;
  background: rgba(31, 32, 35, 0.88);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.18);
  color: #f3f4f6;
  font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  font-size: 14px;
  line-height: 20px;
  letter-spacing: normal;
  -webkit-font-smoothing: auto;
  -moz-osx-font-smoothing: auto;
  animation: apb-demo-in 0.25s cubic-bezier(0.23, 1, 0.32, 1);
}
.apb-demo__bubble img { display: block; width: 72px; height: 48px; border-radius: 10px; object-fit: cover; }
.apb-demo__bubble p {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}
@keyframes apb-demo-in { from { opacity: 0; translate: 0 8px; } }
@media (prefers-reduced-motion: reduce) {
  .apb-demo__bubble { animation: none; }
}
`;var S=e.i(735109);let P="Crie uma landing page para minha cafeteria",N='.apb-mode[data-mode="think"]',z=(e,a)=>{e&&(Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,"value")?.set?.call(e,a),e.dispatchEvent(new Event("input",{bubbles:!0})))},E=e=>{e.preventDefault(),e.stopPropagation()};function T(){let e=(0,t.useRef)(null),[o,i]=(0,t.useState)(0),[r,n]=(0,t.useState)({at:{x:352,y:280},move:0,press:!1,clicks:0});return(0,t.useEffect)(()=>{let a,t=e.current,o=e=>n(a=>({...a,...e})),r=e=>t.querySelector(e),s=(e,a=.5,o=.5)=>{let i=t.getBoundingClientRect(),n=r(e)?.getBoundingClientRect(),s=i.width/t.offsetWidth||1;return n?{x:(n.left+n.width*a-i.left)/s,y:(n.top+n.height*o-i.top)/s}:l()},l=()=>({x:.8*t.offsetWidth,y:.85*t.offsetHeight}),p=(e,a)=>r(e)?.dispatchEvent(new PointerEvent(a?"pointerenter":"pointerleave",{pointerType:"mouse",isPrimary:!0,pointerId:1}));if(matchMedia("(prefers-reduced-motion: reduce)").matches){r(N)?.click(),z(r("textarea"),P);let e=requestAnimationFrame(()=>o({at:s(".apb-send",.6,.7)}));return()=>cancelAnimationFrame(e)}let d=t.closest(".preview"),c=()=>!d||d.classList.contains("is-playing"),b=!0,u=new MutationObserver(()=>c()&&a?.());d&&u.observe(d,{attributes:!0,attributeFilter:["class"]});let h=async e=>{for(await new Promise(a=>setTimeout(a,e));b&&!c();)await new Promise(e=>a=e);return b},x=async e=>(n(e=>({...e,press:!0,clicks:e.clicks+1})),!!await h(140)&&(o({press:!1}),r(e)?.click(),!0));return(async()=>{for(o({at:l(),move:0});await h(900);){if(o({at:s(`${N} .apb-mode__icon`,.7,.8),move:700}),!await h(720)||(p(`${N} .apb-mode__glyph`,!0),!await h(380)||!await x(N)||!await h(520))||(p(`${N} .apb-mode__glyph`,!1),o({at:s(".apb-textarea",.16,.6),move:550}),!await h(570)||!await x(".apb-textarea")))return;o({at:s(".apb-actions",.66,.55),move:500});for(let e=1;e<=P.length;e++)if(z(r("textarea"),P.slice(0,e)),!await h(45))return;if(!await h(250)||(o({at:s(".apb-send",.6,.7),move:450}),!await h(470)||!await x(".apb-send")||!await h(900))||(o({at:l(),move:900}),!await h(2600)))return;i(e=>e+1)}})(),()=>{b=!1,u.disconnect()}},[]),(0,a.jsxs)("div",{ref:e,className:`${S.default.stage} ${S.default.tile}`,"data-press":r.press||void 0,"aria-hidden":"true",inert:!0,onClick:E,children:[(0,a.jsx)(C,{},o),(0,a.jsxs)("div",{className:S.default.cursor,style:{"--x":`${r.at.x}px`,"--y":`${r.at.y}px`,"--move":`${r.move}ms`},children:[r.clicks>0&&(0,a.jsx)("span",{className:S.default.ripple},r.clicks),(0,a.jsx)("svg",{viewBox:"0 0 20 26","aria-hidden":"true",children:(0,a.jsx)("path",{d:"M2 2v19l5-4.5 3.5 7.5 3.1-1.4-3.4-7.3H17z"})})]})]})}e.s(["default",0,function({mode:e}){return"tile"===e?(0,a.jsx)(T,{}):(0,a.jsx)("div",{className:S.default.stage,children:(0,a.jsx)(C,{})})}],811870)},672106,function(e){e.n(e.i(811870))}]);

//# debugId=9dd74075-1f6c-76b9-f332-92e194fd3e13