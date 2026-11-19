;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="ab91d698-1904-3933-bd7e-b4303bef0bf7")}catch(e){}}();
(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,88653,e=>{"use strict";var t=e.i(843476),r=e.i(271645),a=e.i(231178),n=e.i(947414),i=e.i(674008),o=e.i(821476),s=e.i(772846),l=r,u=e.i(737806);function c(e,t){if("function"==typeof e)return e(t);null!=e&&(e.current=t)}class d extends l.Component{getSnapshotBeforeUpdate(e){let t=this.props.childRef.current;if((0,s.f)(t)&&e.isPresent&&!this.props.isPresent&&!1!==this.props.pop){let e=t.offsetParent,r=(0,s.f)(e)&&e.offsetWidth||0,a=(0,s.f)(e)&&e.offsetHeight||0,n=getComputedStyle(t),i=this.props.sizeRef.current;i.height=parseFloat(n.height),i.width=parseFloat(n.width),i.top=t.offsetTop,i.left=t.offsetLeft,i.right=r-i.width-i.left,i.bottom=a-i.height-i.top,i.direction=n.direction}return null}componentDidUpdate(){}render(){return this.props.children}}function f({children:e,isPresent:a,anchorX:n,anchorY:i,root:o,pop:s}){let p=(0,l.useId)(),h=(0,l.useRef)(null),g=(0,l.useRef)({width:0,height:0,top:0,left:0,right:0,bottom:0,direction:"ltr"}),{nonce:m}=(0,l.useContext)(u.f),x=function(...e){return r.useCallback(function(...e){return t=>{let r=!1,a=e.map(e=>{let a=c(e,t);return r||"function"!=typeof a||(r=!0),a});if(r)return()=>{for(let t=0;t<a.length;t++){let r=a[t];"function"==typeof r?r():c(e[t],null)}}}}(...e),e)}(h,!1!==s?e.props?.ref??e?.ref:void 0);return(0,l.useInsertionEffect)(()=>{let{width:e,height:t,top:r,left:l,right:u,bottom:c,direction:d}=g.current;if(a||!1===s||!h.current||!e||!t)return;let f="rtl"===d,x="left"===n?f?`right: ${u}`:`left: ${l}`:f?`left: ${l}`:`right: ${u}`,b="bottom"===i?`bottom: ${c}`:`top: ${r}`;h.current.dataset.motionPopId=p;let v=document.createElement("style");m&&(v.nonce=m);let y=o??document.head;return y.appendChild(v),v.sheet&&v.sheet.insertRule(`
          [data-motion-pop-id="${p}"] {
            position: absolute !important;
            width: ${e}px !important;
            height: ${t}px !important;
            ${x}px !important;
            ${b}px !important;
          }
        `),()=>{h.current?.removeAttribute("data-motion-pop-id"),y.contains(v)&&y.removeChild(v)}},[a]),(0,t.jsx)(d,{isPresent:a,childRef:h,sizeRef:g,pop:s,children:!1===s?e:l.cloneElement(e,{ref:x})})}let p=({children:e,initial:a,isPresent:s,onExitComplete:l,custom:u,presenceAffectsLayout:c,mode:d,anchorX:p,anchorY:g,root:m})=>{let x=(0,n.f)(h),b=(0,r.useId)(),v=(0,r.useRef)(s),y=(0,r.useRef)(l);(0,i.f)(()=>{v.current=s,y.current=l});let w=!0,j=(0,r.useMemo)(()=>(w=!1,{id:b,initial:a,isPresent:s,custom:u,onExitComplete:e=>{for(let t of(x.set(e,!0),x.values()))if(!t)return;l&&l()},register:e=>(x.set(e,!1),()=>{x.delete(e),v.current||x.size||y.current?.()})}),[s,x,l]);return c&&w&&(j={...j}),(0,r.useMemo)(()=>{x.forEach((e,t)=>x.set(t,!1))},[s]),r.useEffect(()=>{s||x.size||!l||l()},[s]),e=(0,t.jsx)(f,{pop:"popLayout"===d,isPresent:s,anchorX:p,anchorY:g,root:m,children:e}),(0,t.jsx)(o.f.Provider,{value:j,children:e})};function h(){return new Map}var g=e.i(464978);let m=e=>e.key||"";function x(e){let t=[];return r.Children.forEach(e,e=>{(0,r.isValidElement)(e)&&t.push(e)}),t}e.s(["f",0,({children:e,custom:o,initial:s=!0,onExitComplete:l,presenceAffectsLayout:u=!0,mode:c="sync",propagate:d=!1,anchorX:f="left",anchorY:h="top",root:b})=>{let[v,y]=(0,g.f)(d),w=(0,r.useMemo)(()=>x(e),[e]),j=d&&!v?[]:w.map(m),S=(0,r.useRef)(!0),P=(0,r.useRef)(w),C=(0,n.f)(()=>new Map),R=(0,r.useRef)(new Set),[E,M]=(0,r.useState)(w),[k,$]=(0,r.useState)(w);(0,i.f)(()=>{S.current=!1,P.current=w;for(let e=0;e<k.length;e++){let t=m(k[e]);j.includes(t)?(C.delete(t),R.current.delete(t)):!0!==C.get(t)&&C.set(t,!1)}},[k,j.length,j.join("-")]);let z=[];if(w!==E){let e=[...w];for(let t=0;t<k.length;t++){let r=k[t],a=m(r);j.includes(a)||(e.splice(t,0,r),z.push(r))}return"wait"===c&&z.length&&(e=z),$(x(e)),M(w),null}let{forceRender:T}=(0,r.useContext)(a.f);return(0,t.jsx)(t.Fragment,{children:k.map(e=>{let r=m(e),a=(!d||!!v)&&(w===k||j.includes(r));return(0,t.jsx)(p,{isPresent:a,initial:(!S.current||!!s)&&void 0,custom:o,presenceAffectsLayout:u,mode:c,root:b,onExitComplete:a?void 0:()=>{if(R.current.has(r)||!C.has(r))return;R.current.add(r),C.set(r,!0);let e=!0;C.forEach(t=>{t||(e=!1)}),e&&(T?.(),$(P.current),d&&y?.(),l&&l())},anchorX:f,anchorY:h,children:e},r)})})}],88653)},63209,532181,e=>{"use strict";var t=e.i(843476),r=e.i(271645),a=e.i(753034),n=e.i(737806),i=e.i(798125),o=e.i(947414);e.s(["f",0,function({children:e,isValidProp:s,...l}){s&&(0,i.P)(s);let u=(0,r.useContext)(n.f);(l={...u,...l}).transition=(0,a.f)(l.transition,u.transition),l.isStatic=(0,o.f)(()=>l.isStatic);let c=(0,r.useMemo)(()=>l,[JSON.stringify(l.transition),l.transformPagePoint,l.reducedMotion,l.skipAnimations]);return(0,t.jsx)(n.f.Provider,{value:c,children:e})}],63209);var s=e.i(846932);e.i(907051);let l=s.f;e.s(["f",0,l],532181)},681183,e=>{e.v({cursor:"VDSu2W_cursor",stage:"VDSu2W_stage",tile:"VDSu2W_tile"})},605999,e=>{"use strict";var t=e.i(843476),r=e.i(271645),a=e.i(88653),n=e.i(63209),i=e.i(532181);let o=Number(r.version.split(".")[0])>=19;function s(){return o?(0,t.jsx)("style",{href:"avatar-group",precedence:"default",children:u}):(0,t.jsx)("style",{hidden:!0,dangerouslySetInnerHTML:{__html:u}})}let l=({avatars:e,maxVisible:o=5,size:l=40,overlap:u=14,theme:c="light",className:d,label:f="Participantes"})=>{let[p,h]=r.useState(null),g=r.useRef(null),m=e.slice(0,o),x=e.length-o;return r.useEffect(()=>{if(null===p)return;let e=e=>{g.current?.contains(e.target)||h(null)};return document.addEventListener("pointerdown",e),()=>document.removeEventListener("pointerdown",e)},[p]),(0,t.jsxs)(n.f,{reducedMotion:"user",children:[(0,t.jsx)(s,{}),(0,t.jsxs)("ul",{ref:g,className:["ag-group",d].filter(Boolean).join(" "),"data-ag-theme":c,"aria-label":f,children:[m.map((e,r)=>{let n=p===r,o={className:"ag-avatar",tabIndex:(null!=e.label||null!=e.href)&&null==e.href?0:void 0,onFocus:e=>{e.currentTarget.matches(":focus-visible")&&h(r)},onBlur:()=>h(e=>e===r?null:e),onKeyDown:e=>{"Escape"===e.key&&n&&(e.preventDefault(),h(null))}},s=(0,t.jsx)("img",{src:e.src,alt:e.alt||e.label||`Avatar ${r+1}`,width:l,height:l,className:"ag-photo",draggable:!1});return(0,t.jsxs)("li",{className:"ag-item","data-active":n||void 0,style:{width:l,height:l,zIndex:n?100:m.length-r,marginLeft:0===r?0:-u},onPointerEnter:e=>"touch"!==e.pointerType&&h(r),onPointerLeave:e=>"touch"!==e.pointerType&&h(e=>e===r?null:e),onPointerDown:e=>"touch"===e.pointerType&&h(r),children:[null!=e.href?(0,t.jsx)("a",{href:e.href,...o,children:s}):(0,t.jsx)("span",{...o,children:s}),(0,t.jsx)(a.f,{children:n&&e.label&&(0,t.jsx)(i.f.span,{initial:{x:"-50%",y:10,opacity:0,scale:.7},animate:{x:"-50%",y:0,opacity:1,scale:1},exit:{x:"-50%",y:10,opacity:0,scale:.7},transition:{type:"spring",stiffness:400,damping:24},className:"ag-tip",style:{top:-(.7*l)},"aria-hidden":"true",children:e.label},"tooltip")})]},r)}),x>0&&(0,t.jsxs)("li",{className:"ag-item ag-extra",role:"img","aria-label":`Mais ${x}`,style:{width:l,height:l,marginLeft:-u,zIndex:0,fontSize:.32*l},children:["+",x]})]})]})},u=`
/* o que o projeto pode trocar com uma classe (posi\xe7\xe3o, margem): na camada base, que vem antes das classes de componente
   e dos utilit\xe1rios (Tailwind v4, Panda, Chakra) e perde para o CSS fora de camada (Tailwind v3, CSS Modules, CSS comum) */
@layer base {
  .ag-group { position: relative; margin: 0; }
}

/* as cores: claro de f\xe1brica, escuro com theme="dark". O anel \xe9 da cor do fundo da p\xe1gina, para separar as fotos */
.ag-group {
  --ag-ring: #ffffff;
  --ag-primary: #171717;
  --ag-primary-text: #fafafa;
  --ag-focus: #737373;
}
.ag-group[data-ag-theme="dark"] {
  --ag-ring: #0a0a0a;
  --ag-primary: #fafafa;
  --ag-primary-text: #171717;
  --ag-focus: #a3a3a3;
}

/* nada de texto nem de lista herdados da p\xe1gina: o grupo fica igual em qualquer projeto */
.ag-group {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  width: max-content;
  padding: 0;
  list-style: none;
  font-family: ui-sans-serif, system-ui, -apple-system, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-style: normal;
  font-weight: 400;
  letter-spacing: normal;
  line-height: 1;
  text-align: left;
  text-transform: none;
  text-shadow: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.ag-group *, .ag-group *::before, .ag-group *::after { box-sizing: border-box; }

/* cada avatar: o anel de 4 px em volta da foto. Ele sobe 10 px com o mouse, o foco ou o toque */
.ag-item {
  position: relative;
  flex-shrink: 0;
  margin: 0;
  padding: 0;
  border: 4px solid var(--ag-ring);
  border-radius: 999px;
  background: var(--ag-ring);
  transform: translateY(0);
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.ag-item[data-active] { transform: translateY(-10px); }
@media (prefers-reduced-motion: reduce) {
  .ag-item { transition: none; }
}

/* a foto, e o link ou o foco em volta dela, sem nada do navegador nem da p\xe1gina */
.ag-avatar {
  display: block;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  border-radius: 999px;
  color: inherit;
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
}
.ag-avatar:focus { outline: none; }
.ag-avatar:focus-visible { outline: 2px solid var(--ag-focus); outline-offset: 4px; }
.ag-photo {
  display: block;
  width: 100%;
  height: 100%;
  max-width: none;
  margin: 0;
  border-radius: 999px;
  object-fit: cover;
  user-select: none;
  -webkit-user-drag: none;
}

/* o bal\xe3o com o nome, centrado em cima do avatar */
.ag-tip {
  position: absolute;
  left: 50%;
  z-index: 50;
  margin: 0;
  padding: 4px 8px;
  border-radius: 4px;
  background: var(--ag-primary);
  color: var(--ag-primary-text);
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
}

/* o c\xedrculo com o "+N" dos que n\xe3o couberam */
.ag-extra {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ag-primary);
  color: var(--ag-primary-text);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  transform: none;
}
`,c=e=>`https://images.unsplash.com/photo-${e}?w=160&h=160&q=80&auto=format&fit=crop&crop=faces`;function d(){return(0,t.jsxs)("div",{className:"ag-demo",children:[(0,t.jsx)("style",{dangerouslySetInnerHTML:{__html:f}}),(0,t.jsx)(l,{avatars:[{src:c("1494790108377-be9c29b29330"),label:"Marina"},{src:c("1500648767791-00dcc994a43e"),label:"Rafael"},{src:c("1438761681033-6461ffad8d80"),label:"Júlia"},{src:c("1507003211169-0a1dd7228f2d"),label:"Pedro"},{src:c("1534528741775-53994a69daeb"),label:"Camila"},{src:c("1506794778202-cad84cf45f1d"),label:"Lucas"}],maxVisible:4,size:45})]})}let f=`
.ag-demo {
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
`;var p=e.i(681183);let h={x:70,y:196},g={x:250,y:196},m=(()=>{let e=[{at:0,...h,o:0},{at:.3,...h,o:1}],t=1.1;for(let r=0;r<4;r++)e.push({at:t,item:r,o:1},{at:t+.9,item:r,o:1}),t+=1.3;return e.push({at:(t-=.4)+.7,...g,o:1},{at:t+1,...g,o:0},{at:t+1.8,...g,o:0}),e})(),x=m[m.length-1].at,b=1.1+1.3+.45;e.s(["default",0,function({mode:e}){let a=(0,r.useRef)(null),n=(0,r.useRef)(null);return((0,r.useEffect)(()=>{if("tile"===e){var t,r;let e,i,o,s,l,u,c,d,f,p,h;return a.current?.querySelectorAll("[tabindex], a").forEach(e=>e.tabIndex=-1),t=a.current,r=n.current,e=matchMedia("(prefers-reduced-motion: reduce)").matches,i=t.closest(".preview"),o=t,s=0,l=0,u=0,c=(e,t,r,a,n=null)=>e.dispatchEvent(new PointerEvent(t,{bubbles:!0,cancelable:!0,composed:!0,clientX:r,clientY:a,pointerId:1,pointerType:"mouse",isPrimary:!0,relatedTarget:n})),d=(e,t,r)=>{let a=e.getBoundingClientRect(),n=t-(a.left+a.width/2),i=r-(a.top+a.height/2);return n*n+i*i<=(a.width/2)**2},f=a=>{s+=Math.min(100,a-l),l=a,(e=>{let a=t.getBoundingClientRect();if(!a.width||!t.offsetWidth)return;let n=a.width/t.offsetWidth,i=t.querySelectorAll(".ag-item:not(.ag-extra)"),s=function(e,t){let r,a=1;for(;a<m.length-1&&m[a].at<e;)a++;let n=m[a-1],i=m[a],o="item"in n?t(n.item):n,s="item"in i?t(i.item):i,l=(r=Math.min(1,Math.max(0,(e-n.at)/(i.at-n.at||1))))<.5?4*r*r*r:1-(-2*r+2)**3/2;return{x:o.x+(s.x-o.x)*l,y:o.y+(s.y-o.y)*l,o:n.o+(i.o-n.o)*l}}(e,e=>{let t=i[e]?.getBoundingClientRect();return t?.width?{x:(t.left+t.width/2-a.left)/n+3,y:(t.top+t.height/2-a.top)/n+8}:{x:98+31*e,y:128}});r.style.transform=`translate3d(${s.x}px, ${s.y}px, 0)`,r.style.opacity=String(s.o);let l=a.left+s.x*n,u=a.top+s.y*n,f=((e,r)=>{if(o!==t&&o.isConnected&&d(o,e,r))return o;for(let a of t.querySelectorAll(".ag-item:not(.ag-extra)"))if(d(a,e,r))return a;return t})(l,u);f!==o&&(c(o,"pointerout",l,u,f),c(f,"pointerover",l,u,o),o=f)})(e?b:s/1e3%x),u=requestAnimationFrame(f)},h=new MutationObserver(p=()=>{let e=!i||i.classList.contains("is-playing");e&&!u?(l=performance.now(),u=requestAnimationFrame(f)):!e&&u&&(cancelAnimationFrame(u),u=0)}),i&&h.observe(i,{attributes:!0,attributeFilter:["class"]}),p(),()=>{h.disconnect(),cancelAnimationFrame(u)}}},[e]),"stage"===e)?(0,t.jsx)("div",{className:p.default.stage,children:(0,t.jsx)(d,{})}):(0,t.jsxs)("div",{ref:a,className:`${p.default.stage} ${p.default.tile}`,"aria-hidden":"true",onPointerMove:e=>e.stopPropagation(),children:[(0,t.jsx)(d,{}),(0,t.jsx)("div",{ref:n,className:p.default.cursor,children:(0,t.jsx)("svg",{viewBox:"0 0 14 21",width:"18",height:"27",children:(0,t.jsx)("path",{d:"M1 1v15.5l3.8-3.6 2.8 6.5 2.5-1.1-2.7-6.3h5.2z"})})})]})}],605999)},596888,function(e){e.n(e.i(605999))}]);

//# debugId=ab91d698-1904-3933-bd7e-b4303bef0bf7