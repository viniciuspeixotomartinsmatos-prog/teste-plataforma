;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="965e6cb2-0964-a702-c88d-18ba1cde97de")}catch(e){}}();
(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,63209,532181,e=>{"use strict";var t=e.i(843476),a=e.i(271645),r=e.i(753034),n=e.i(737806),i=e.i(798125),o=e.i(947414);e.s(["MotionConfig",0,function({children:e,isValidProp:s,...d}){s&&(0,i.loadExternalIsValidProp)(s);let l=(0,a.useContext)(n.MotionConfigContext);(d={...l,...d}).transition=(0,r.resolveTransition)(d.transition,l.transition),d.isStatic=(0,o.useConstant)(()=>d.isStatic);let c=(0,a.useMemo)(()=>d,[JSON.stringify(d.transition),d.transformPagePoint,d.reducedMotion,d.skipAnimations]);return(0,t.jsx)(n.MotionConfigContext.Provider,{value:c,children:e})}],63209);var s=e.i(846932);e.i(907051);let d=s.motion;e.s(["motion",0,d],532181)},910856,e=>{e.v({compact:"DraggableWidgetGrid-module__eEkwKq__compact",stage:"DraggableWidgetGrid-module__eEkwKq__stage",tile:"DraggableWidgetGrid-module__eEkwKq__tile"})},218277,e=>{"use strict";var t=e.i(843476),a=e.i(271645),r=e.i(63209),n=e.i(532181),i=e.i(947414);class o{constructor(){this.componentControls=new Set}subscribe(e){return this.componentControls.add(e),()=>this.componentControls.delete(e)}start(e,t){this.componentControls.forEach(a=>{a.start(e.nativeEvent||e,t)})}cancel(){this.componentControls.forEach(e=>{e.cancel()})}stop(){this.componentControls.forEach(e=>{e.stop()})}}let s=()=>new o,d={sm:{col:1,row:1},wide:{col:2,row:1},tall:{col:1,row:2},lg:{col:2,row:2}},l={sm:"pequeno",wide:"largo",tall:"alto",lg:"grande"},c=[{id:"widget-1",size:"wide"},{id:"widget-2",size:"sm"},{id:"widget-3",size:"sm"},{id:"widget-4",size:"sm"},{id:"widget-5",size:"wide"},{id:"widget-6",size:"sm"},{id:"widget-7",size:"sm"},{id:"widget-8",size:"wide"},{id:"widget-9",size:"sm"}],u=a.useLayoutEffect;function p(e){return e&&e.offsetWidth&&e.getBoundingClientRect().width/e.offsetWidth||1}let m=(e,t)=>e.col<t.col+t.w&&t.col<e.col+e.w&&e.row<t.row+t.h&&t.row<e.row+e.h,h=(e,t)=>t.col>=e.col&&t.row>=e.row&&t.col+t.w<=e.col+e.w&&t.row+t.h<=e.row+e.h;function w(e,t){return{w:Math.min(d[e.size].col,t),h:d[e.size].row}}function g(e,t){var a,r;let n,i,o,s,d,l,c,u,p;return t<1||0===e.length?[]:(a=e,r=t,o=Array((i=Math.ceil((n=a.map(e=>w(e,r))).reduce((e,t)=>e+t.w*t.h,0)/r))*r).fill(!1),s=Array(a.length).fill(!1),d=[],l=2e4,c=(e,t,a,n)=>{if(n+e>r||a+t>i)return!1;for(let i=a;i<a+t;i++)for(let t=n;t<n+e;t++)if(o[i*r+t])return!1;return!0},u=(e,t,a,n,i)=>{for(let s=a;s<a+t;s++)for(let t=n;t<n+e;t++)o[s*r+t]=i},((p=e=>{if(e===a.length)return!0;if(--l<0)return!1;let t=o.indexOf(!1);if(t<0)return!1;let i=Math.floor(t/r),m=t%r,h=new Set([]);for(let t=0;t<a.length;t++){if(s[t])continue;let{w:r,h:o}=n[t],l=`${r}x${o}`;if(!h.has(l)&&c(r,o,i,m)){if(h.add(l),s[t]=!0,u(r,o,i,m,!0),d.push({id:a[t].id,col:m,row:i,w:r,h:o}),p(e+1))return!0;d.pop(),u(r,o,i,m,!1),s[t]=!1}}return!1})(0)?d:null)??function(e,t){let a=[],r=0,n=e.map(e=>({id:e.id,...w(e,t)}));for(;n.length>0;){let e=Math.max(...n.slice(0,t).map(e=>e.h)),i=Array(e*t).fill(!1),o=[],s=[];for(let a of n){let r=-1;for(let n=0;n<i.length&&r<0;n++){let o=Math.floor(n/t),s=n%t;if(s+a.w>t||o+a.h>e)continue;let d=!0;for(let e=o;e<o+a.h&&d;e++)for(let r=s;r<s+a.w&&d;r++)i[e*t+r]&&(d=!1);d&&(r=n)}if(r<0||s.length>0){s.push(a);continue}let n=Math.floor(r/t),d=r%t;for(let e=n;e<n+a.h;e++)for(let r=d;r<d+a.w;r++)i[e*t+r]=!0;o.push({id:a.id,col:d,row:n,w:a.w,h:a.h})}for(let e=0;e<i.length;e++){if(i[e])continue;let a=Math.floor(e/t),r=e%t,n=o.find(e=>e.col+e.w===r&&e.row<=a&&e.row+e.h>a&&1===e.h),s=o.find(e=>e.row+e.h===a&&e.col===r&&1===e.w),d=n??s;d&&(d===n?d.w+=1:d.h+=1,i[e]=!0)}a.push(...o.map(e=>({...e,row:e.row+r}))),r+=e,n=s}return a}(e,t))}function x(e,t){let a=g(e,t);if(a.length!==e.length)return e;let r=new Map(e.map(e=>[e.id,e])),n=[...a].sort((e,t)=>e.row-t.row||e.col-t.col).map(e=>r.get(e.id));if(n.every((t,a)=>t===e[a]))return e;let i=new Map(a.map(e=>[e.id,e]));return g(n,t).every(e=>{let t=i.get(e.id);return t&&t.col===e.col&&t.row===e.row&&t.w===e.w&&t.h===e.h})?n:e}function f(e,t,a){let r=e.findIndex(e=>e.id===t);if(r<0||r===a||a<0||a>=e.length)return e;let n=[...e],[i]=n.splice(r,1);return n.splice(a,0,i),n}let b=(e,t)=>e.length===t.length&&e.every((e,a)=>e.id===t[a].id),v={type:"spring",visualDuration:.38,bounce:.16},j={type:"spring",visualDuration:.26,bounce:.32},y="0px 28px 60px -16px rgba(0,0,0,0.45), 0px 10px 24px -8px rgba(0,0,0,0.3)",_=(0,a.memo)(function({item:e,col:r,row:o,w:d,h:c,columns:u,rows:p,editable:m,held:h,raised:w,landed:g,handlers:x,hintId:f,position:b,count:_,renderItem:k}){let M=(0,i.useConstant)(s),N=(0,a.useRef)(null),z=(0,a.useRef)(null),C=(0,a.useRef)(!1),S=(0,a.useRef)(null),[$,E]=(0,a.useState)("idle"),R=(0,a.useCallback)(()=>{z.current&&window.clearTimeout(z.current.timer),z.current=null,C.current=!1,S.current?.(),S.current=null,E("idle")},[]);(0,a.useEffect)(()=>{let e=N.current;if(!e)return;let t=e=>{C.current&&e.preventDefault()};return e.addEventListener("touchmove",t,{passive:!1}),()=>{e.removeEventListener("touchmove",t),z.current&&window.clearTimeout(z.current.timer),S.current?.()}},[]);let A=e=>{z.current?.pointerId===e.pointerId&&R()},T=(r/Math.max(u,1)+o/Math.max(p,1))*.26;return(0,t.jsx)(n.motion.div,{ref:N,role:"listitem",className:"dwg-item","data-slot":"widget","data-widget-id":e.id,"data-editable":m||void 0,tabIndex:m?0:void 0,"aria-label":e.label??`Widget ${l[e.size]}`,"aria-describedby":m?f:void 0,"aria-posinset":b,"aria-setsize":_,layout:"position",drag:m,dragListener:!1,dragControls:M,dragSnapToOrigin:!0,dragMomentum:!1,onDragStart:()=>x.start(e.id),onDrag:x.drag,onDragEnd:()=>x.end(e.id),onPointerDown:e=>{if(!m||0!==e.button||!e.isPrimary)return;if("touch"!==e.pointerType)return void M.start(e);if(z.current||C.current)return;let t=e.nativeEvent,a=e.pointerId;E("holding"),z.current={pointerId:a,x:e.clientX,y:e.clientY,timer:window.setTimeout(()=>{z.current=null,C.current=!0,E("lifted"),navigator.vibrate?.(10),M.start(t);let e=e=>{e.pointerId===a&&(x.suppressClick(),R())};window.addEventListener("pointerup",e),window.addEventListener("pointercancel",e),S.current=()=>{window.removeEventListener("pointerup",e),window.removeEventListener("pointercancel",e)}},350)}},onPointerMove:e=>{let t=z.current;t&&e.pointerId===t.pointerId&&Math.hypot(e.clientX-t.x,e.clientY-t.y)>8&&R()},onPointerUp:A,onPointerCancel:A,onContextMenu:e=>{"idle"!==$&&e.preventDefault()},onKeyDown:t=>x.key(t,e.id),onClickCapture:e=>{(x.swallow()||m&&e.target.closest("a"))&&(e.preventDefault(),e.stopPropagation())},animate:{scale:"holding"===$?.97:"lifted"===$?1.06:1,boxShadow:"lifted"===$?y:"0px 1px 2px 0px rgba(0,0,0,0.12), 0px 0px 0px 0px rgba(0,0,0,0)"},whileDrag:{scale:1.06,boxShadow:y,transition:j},transition:v,style:{gridColumn:`${r+1} / span ${d}`,gridRow:`${o+1} / span ${c}`,zIndex:h?20:10*!!w},children:(0,t.jsx)(n.motion.div,{initial:{opacity:0,y:18,scale:.97},animate:{opacity:1,y:0,scale:1},transition:{type:"spring",visualDuration:.6,bounce:.12,delay:T},className:"dwg-card","data-landed":g||void 0,children:k?.(e,d>=2&&c>=2?"lg":d>=2?"wide":c>=2?"tall":"sm")})})}),k=function({items:e,onChange:n,renderItem:i,editable:o=!0,maxColumns:s=4,cellSize:d=215,gap:l=12,radius:w=24,className:v=""}){let[j,y]=(0,a.useState)(()=>e??c),k=(0,a.useRef)(null),N=(0,a.useId)(),z=Math.min(2,Math.max(1,s)),[C,S]=(0,a.useState)({unit:0,columns:0});u(()=>{let e=k.current;if(!e)return;let t=()=>{let t=e.clientWidth;if(t<1)return;let a=Math.max(z,Math.min(s,Math.round(t/d))),r=(t-l*(a-1))/a;S(e=>e.columns===a&&.5>Math.abs(e.unit-r)?e:{unit:r,columns:a})};t();let a=new ResizeObserver(t);return a.observe(e),()=>a.disconnect()},[s,z,d,l]);let $=C.columns||Math.max(z,s),E=(0,a.useMemo)(()=>g(j,$),[j,$]),R=E.reduce((e,t)=>Math.max(e,t.row+t.h),0),A=(0,a.useRef)({items:j,metrics:C,onChange:n});A.current.metrics=C,A.current.onChange=n,u(()=>{A.current.items=j},[j]);let T=(0,a.useCallback)(e=>{A.current.items=e,y(e)},[]),I=(0,a.useCallback)(e=>{let t=k.current,{unit:a}=A.current.metrics,r=t?.getBoundingClientRect(),n=p(t),i=(a+l)*n,o=(Math.round(a)+l)*n,s=(r?.left??0)+e.col*i,d=(r?.top??0)+e.row*o;return{left:s,top:d,right:s+e.w*i-l*n,bottom:d+e.h*o-l*n}},[l]),q=(0,a.useCallback)(e=>{let t=p(k.current);return 1===t?e:{x:e.x/t,y:e.y/t}},[]),[D,P]=(0,a.useState)(null),[L,U]=(0,a.useState)(null),[W,F]=(0,a.useState)(null),B=(0,a.useRef)(null),K=(0,a.useRef)(null),O=(0,a.useRef)(0),H=(0,a.useRef)(0),G=(0,a.useRef)(0),X=(0,a.useRef)(0),Y=(0,a.useRef)(null),J=(0,a.useCallback)((e=!1)=>{O.current=0;let t=B.current,{items:a,metrics:r}=A.current,n=t?k.current?.querySelector(`[data-widget-id="${CSS.escape(t)}"]`):null;if(!t||!n||!r.columns)return;let i=performance.now();if(!e&&i-H.current<40){O.current=requestAnimationFrame(()=>J());return}let o=g(a,r.columns).find(e=>e.id===t);if(!o)return;let s=n.getBoundingClientRect(),d=function(e,t,a,r){let n=(e,t)=>{let n=(e.right-e.left)*t,i=(e.bottom-e.top)*t;return Math.hypot(Math.max(e.left+n-a,0,a-(e.right-n)),Math.max(e.top+i-r,0,r-(e.bottom-i)))},i=e=>Math.hypot((e.left+e.right)/2-a,(e.top+e.bottom)/2-r),o=n(e,0);if(0===o)return null;let s=null,d=1/0;for(let{order:e,slot:a}of t){let t=n(a,.18),r=i(a);(t<o||t===o&&s&&r<d)&&(o=t,d=r,s=e)}return s}(I(o),function(e,t,a,r){let n=g(e,a),i=n.find(e=>e.id===t);if(!i)return[];let o=new Map(e.map(e=>[e.id,e])),s=Math.max(...n.map(e=>e.row+e.h)),d=[];for(let e=0;e+i.h<=s;e++)for(let s=0;s+i.w<=a;s++){let a={col:s,row:e,w:i.w,h:i.h};if(m(a,i))continue;let l=n.filter(e=>m(e,a));if(l.length<2||!l.every(e=>h(a,e)))continue;let c=n.map(a=>a.id===t?{...a,col:s,row:e}:l.includes(a)?{...a,col:a.col-s+i.col,row:a.row-e+i.row}:a);c.sort((e,t)=>e.row-t.row||e.col-t.col),d.push({order:c.map(e=>o.get(e.id)),slot:r(a)})}let l=e.findIndex(e=>e.id===t);for(let n=0;n<e.length;n++){if(n===l)continue;let i=f(e,t,n),o=g(i,a).find(e=>e.id===t);o&&d.push({order:i,slot:r(o)})}return d}(a,t,r.columns,I),s.left+s.width/2,s.top+s.height/2);d&&(H.current=i,T(x(d,r.columns)))},[I,T]);(0,a.useEffect)(()=>()=>{cancelAnimationFrame(O.current),window.clearTimeout(X.current)},[]),u(()=>{let e=Y.current;if(!e)return;Y.current=null;let t=k.current?.querySelector(`[data-widget-id="${CSS.escape(e)}"]`);t?.focus()},[j]);let V=(0,a.useMemo)(()=>({start:e=>{B.current=e,K.current=A.current.items,H.current=0,P(e),U(e),window.addEventListener("pointerup",()=>{G.current=performance.now()+300},{once:!0,capture:!0})},drag:()=>{O.current||(O.current=requestAnimationFrame(()=>J()))},end:e=>{cancelAnimationFrame(O.current),J(!0),O.current=0,B.current=null,P(null),F(e),window.clearTimeout(X.current),X.current=window.setTimeout(()=>{F(null),U(null)},620);let t=K.current;K.current=null;let a=A.current.items;t&&!b(t,a)&&A.current.onChange?.(a)},key:(e,t)=>{if(!o||!e.altKey||e.target.closest("input, textarea, select"))return;let a="ArrowRight"===e.key||"ArrowDown"===e.key?1:"ArrowLeft"===e.key||"ArrowUp"===e.key?-1:0;if(!a)return;e.preventDefault();let{items:r,metrics:n}=A.current,i=n.columns||s,d=r.findIndex(e=>e.id===t);for(let e=d+a;e>=0&&e<r.length;e+=a){let a=x(f(r,t,e),i);if(!b(a,r)){Y.current=t,T(a),A.current.onChange?.(a);return}}},swallow:()=>performance.now()<G.current,suppressClick:()=>{G.current=performance.now()+300}}),[J,T,o,s]),Q=(0,a.useMemo)(()=>new Map(j.map(e=>[e.id,e])),[j]),Z=(0,a.useRef)(j.map(e=>e.id));for(let e of j)Z.current.includes(e.id)||Z.current.push(e.id);let ee=new Map(E.map(e=>[e.id,e])),et=new Map([...E].sort((e,t)=>e.row-t.row||e.col-t.col).map((e,t)=>[e.id,t]));return(0,t.jsx)(r.MotionConfig,{reducedMotion:"user",transformPagePoint:q,children:(0,t.jsxs)("div",{className:"dwg-root"+(v?" "+v:""),style:{"--dwg-radius":`${w}px`},children:[(0,t.jsx)("style",{dangerouslySetInnerHTML:{__html:M}}),o&&(0,t.jsx)("p",{id:N,className:"dwg-sr",children:"Arraste para reorganizar. Na tela de toque, toque e segure antes de arrastar. Pelo teclado, segure Alt e use as setas."}),(0,t.jsx)("div",{ref:k,role:"list",className:"dwg-grid","data-slot":"widget-grid",style:{gap:l,gridTemplateColumns:`repeat(${$}, minmax(0, 1fr))`,gridAutoRows:C.unit?`${Math.round(C.unit)}px`:`minmax(${.75*d}px, auto)`},children:Z.current.map(e=>{let a=Q.get(e),r=ee.get(e);return a&&r?(0,t.jsx)(_,{position:(et.get(e)??0)+1,count:E.length,item:a,col:r.col,row:r.row,w:r.w,h:r.h,columns:$,rows:R,editable:o,held:D===r.id,raised:L===r.id,landed:W===r.id,handlers:V,hintId:N,renderItem:i},e):null})})]})})},M=`
/* o que o projeto pode trocar com uma classe (largura, margem): na camada base, que vem antes das classes de
   componente e dos utilit\xe1rios (Tailwind v4) e perde para o CSS fora de camada (Tailwind v3, CSS Modules, CSS comum) */
@layer base {
  .dwg-root { position: relative; width: 100%; }
}
.dwg-root { box-sizing: border-box; }
.dwg-grid { display: grid; box-sizing: border-box; width: 100%; }

/* o widget: quem se move e levanta. As cores saem das vari\xe1veis --dwg-*, com o tema escuro de f\xe1brica */
.dwg-item { position: relative; box-sizing: border-box; min-width: 0; border-radius: var(--dwg-radius); outline: none; }
.dwg-item:focus-visible { outline: 2px solid var(--dwg-ring, #d4d4d8); outline-offset: 2px; }
.dwg-item a, .dwg-item img { -webkit-user-drag: none; }
.dwg-item[data-editable] {
  cursor: grab;
  touch-action: pan-y pinch-zoom;
  -webkit-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
}
.dwg-item[data-editable]:active { cursor: grabbing; }

/* o cart\xe3o de dentro: o fundo, o contorno e o conte\xfado */
.dwg-card {
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: var(--dwg-radius);
  clip-path: inset(0 round var(--dwg-radius));
  background: var(--dwg-card, #141417);
  color: var(--dwg-card-foreground, #fafafa);
  box-shadow: inset 0 0 0 1px var(--dwg-border, #27272a);
  transition: box-shadow .3s cubic-bezier(.4, 0, .2, 1);
}
/* quem acabou de cair fica com o contorno aceso por um instante */
.dwg-card[data-landed] { box-shadow: inset 0 0 0 2px var(--dwg-landed, rgba(250, 250, 250, .4)); }

.dwg-sr {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
`,N=[{id:"runs",kind:"runs",size:"wide",label:"Execuções hoje"},{id:"health",kind:"health",size:"sm",label:"Status do sistema"},{id:"cost",kind:"cost",size:"sm",label:"Custo total"},{id:"failures",kind:"failures",size:"sm",label:"Erros"},{id:"traces",kind:"traces",size:"wide",label:"Traces recentes"},{id:"evals",kind:"evals",size:"sm",label:"Nota das evals"},{id:"tools",kind:"tools",size:"wide",label:"Chamadas de ferramentas"},{id:"models",kind:"models",size:"wide",label:"Tokens por modelo"}],z=(0,a.createContext)(!0);function C(e=2e3){let t=(0,a.useContext)(z),[r,n]=(0,a.useState)(0);return(0,a.useEffect)(()=>{if(!t)return;let a=window.setInterval(()=>{document.hidden||n(e=>e+1)},e);return()=>window.clearInterval(a)},[t,e]),r}function S(e){let t=43758.5453*Math.sin(127.1*e+311.7);return t-Math.floor(t)}let $=(e,t)=>e.toFixed(t).replace(".",","),E=e=>e>=1e3?`${$(e/1e3,2)}s`:`${Math.round(e)}ms`,R="#60a5fa",A=["rgba(250, 250, 250, .06)","rgba(59, 130, 246, .2)","rgba(59, 130, 246, .35)","rgba(59, 130, 246, .55)","rgba(96, 165, 250, .85)"];function T({title:e,meta:a,children:r}){return(0,t.jsxs)("section",{className:"wd-shell",children:[(0,t.jsxs)("header",{className:"wd-head",children:[(0,t.jsx)("h3",{className:"wd-title",children:e}),a&&(0,t.jsx)("span",{className:"wd-meta",children:a})]}),(0,t.jsx)("div",{className:"wd-body",children:r})]})}function I({children:e,unit:a,unitWide:r=!1}){return(0,t.jsxs)("p",{className:"wd-big",children:[e,a&&(0,t.jsxs)("span",{className:"wd-unit","data-wide":r||void 0,children:[" ",a]})]})}function q({value:e,against:a,suffix:r,good:n="up"}){let i=e>=0;return(0,t.jsxs)("span",{className:"wd-delta","data-tone":i===("up"===n)?"ok":"err",children:[(0,t.jsxs)("span",{"aria-hidden":"true",children:[i?"↑":"↓"," "]}),Math.abs(e),"%",r&&(0,t.jsxs)("span",{"aria-hidden":"true",className:"wd-muted",children:[" ",r]}),(0,t.jsxs)("span",{className:"wd-sr",children:[" ",a]})]})}function D({tone:e,pulse:a=!1}){return(0,t.jsxs)("span",{"aria-hidden":"true",className:"wd-dot","data-tone":e,children:[a&&(0,t.jsx)("span",{className:"wd-dot__ping"}),(0,t.jsx)("span",{className:"wd-dot__core"})]})}function P({children:e,value:a}){return(0,t.jsxs)("div",{className:"wd-row",children:[(0,t.jsx)("dt",{children:e}),(0,t.jsx)("dd",{children:a})]})}let L=["Sáb","Dom","Seg","Ter","Hoje"],U=["0h","6h","12h","18h"],W={8:"warn",21:"warn"},F=["research_agent","support_agent","code_agent","planner","reviewer"],B={ok:"sucesso",warn:"lento",err:"erro",idle:"pendente"},K=[{name:"Fidelidade",value:.94},{name:"Relevância",value:.89},{name:"Correção",value:.91}],O=[{name:"web_search",calls:412},{name:"code_interpreter",calls:268},{name:"sql_query",calls:197},{name:"retrieve_docs",calls:143}],H=[{name:"atlas-pro-3",share:.52,swatch:R},{name:"atlas-mini-3",share:.27,swatch:"rgba(96, 165, 250, .55)"},{name:"atlas-max-3",share:.13,swatch:"rgba(96, 165, 250, .3)"},{name:"embed-v3",share:.08,swatch:"rgba(250, 250, 250, .2)"}],G={runs:function(){let e=C(2500),r=L.length-1,n=L.map((t,a)=>Array.from({length:32},(t,n)=>{let i;return a===r&&n>28?null:Math.max(0,Math.round(3.3*(3.5+18*Math.exp(-(((i=45*n/60)-15)**2)/30)+11*Math.exp(-((i-10)**2)/10))*("Sáb"===L[a]||"Dom"===L[a]?.5:1)*(.5+S(97*a+n))))+(a===r&&28===n?e%12:0)})),i=Math.max(...n.flat().map(e=>e??0)),o=n[r].reduce((e,t)=>e+(t??0),0);return(0,t.jsxs)(T,{title:"Execuções hoje",meta:(0,t.jsx)(q,{value:12,against:"em relação a ontem",suffix:"vs ontem"}),children:[(0,t.jsx)(I,{children:o.toLocaleString("pt-BR")}),(0,t.jsx)("div",{className:"wd-foot",children:(0,t.jsxs)("div",{role:"img","aria-label":`Execu\xe7\xf5es a cada 45 minutos nos \xfaltimos 5 dias. ${o.toLocaleString("pt-BR")} execu\xe7\xf5es at\xe9 agora hoje, mais \xe0 tarde, menos no fim de semana.`,className:"wd-heat",children:[n.map((e,n)=>(0,t.jsxs)(a.Fragment,{children:[(0,t.jsx)("span",{"aria-hidden":"true",className:"wd-heat__day","data-today":n===r||void 0,children:L[n]}),(0,t.jsx)("span",{className:"wd-heat__row",children:e.map((e,a)=>{let o,s=null===e||0===e?0:Math.max(1,Math.ceil(e/i*4));return(0,t.jsx)("span",{title:null===e?void 0:`${L[n]} ${o=45*a,`${String(Math.floor(o/60)).padStart(2,"0")}:${String(o%60).padStart(2,"0")}`} \xb7 ${e} execu\xe7\xf5es`,className:"wd-heat__cell",style:{background:n===r&&28===a?"#93c5fd":A[s]}},a)})})]},L[n])),(0,t.jsx)("span",{"aria-hidden":"true",className:"wd-heat__corner"}),(0,t.jsx)("span",{"aria-hidden":"true",className:"wd-heat__hours",children:U.map(e=>(0,t.jsx)("span",{children:e},e))})]})})]})},health:function(){let e=C(5e3)%6==5;return(0,t.jsxs)(T,{title:"Status do sistema",meta:"30 dias",children:[(0,t.jsx)(I,{unit:"uptime",unitWide:!0,children:"99,98%"}),(0,t.jsxs)("p",{className:"wd-status","data-tone":e?"warn":void 0,children:[(0,t.jsx)(D,{tone:e?"warn":"ok",pulse:!0}),(0,t.jsx)("span",{className:"wd-truncate",children:e?"Desempenho degradado":"Tudo funcionando"})]}),(0,t.jsx)("div",{className:"wd-foot",children:(0,t.jsx)("div",{role:"img","aria-label":"Uptime nos últimos 30 dias: 28 dias funcionando normalmente e 2 dias com desempenho degradado.",className:"wd-uptime",children:Array.from({length:30},(e,a)=>(0,t.jsx)("span",{"data-incident":W[a]?"":void 0},a))})})]})},cost:function(){let e=C(3e3),a=Array.from({length:14},(e,t)=>Math.round(9+7*S(5*t)+.35*t));a[13]=Math.round(12+e%30*.2);let r=Math.max(...a);return(0,t.jsxs)(T,{title:"Custo total",meta:(0,t.jsx)(q,{value:8,against:"em relação ao mês passado",suffix:"vs mês",good:"down"}),children:[(0,t.jsxs)(I,{unit:"no mês",unitWide:!0,children:["US$ ",(184.2+e%30*.07).toFixed(0)]}),(0,t.jsx)("div",{role:"img","aria-label":`Custo por dia nos \xfaltimos 14 dias, entre US$ ${Math.min(...a)} e US$ ${r}. Hoje, US$ ${a[13]}.`,className:"wd-bars",children:a.map((e,n)=>(0,t.jsx)("span",{style:{height:`${e/r*100}%`,background:n===a.length-1?R:void 0}},n))})]})},failures:function(){let e=C(5e3),a=[{name:"timeout",count:9+Math.floor(e/3)%5},{name:"rate-limit",count:7},{name:"tool-error",count:5+Math.floor(e/5)%4}],r=a.reduce((e,t)=>e+t.count,0)+2;return(0,t.jsxs)(T,{title:"Erros",meta:"24h",children:[(0,t.jsx)(I,{unit:`${$(r/1262*100,1)}% das execu\xe7\xf5es`,unitWide:!0,children:r}),(0,t.jsx)("dl",{className:"wd-list",children:a.map((e,a)=>(0,t.jsxs)(P,{value:e.count,children:[(0,t.jsx)(D,{tone:0===a?"err":"idle"}),e.name]},e.name))})]})},traces:function(){let e,a,r=C(2200),n=Array.from({length:4},(e,t)=>{var a;let n;return n=S(3*(a=r+40-t)),{n:a,id:`tr_${Math.floor(0xffffff*S(a)).toString(16).padStart(6,"0")}`,agent:F[Math.floor(S(7*a)*F.length)],ms:400+3200*S(13*a),tone:n>.9?"err":n>.8?"warn":"ok"}});return(0,t.jsxs)(T,{title:"Traces recentes",meta:(0,t.jsxs)("span",{className:"wd-live",children:[(0,t.jsx)(D,{tone:"ok",pulse:!0}),"ao vivo"]}),children:[(0,t.jsx)(I,{unit:"p50",children:E((a=Math.floor((e=[...n.map(e=>e.ms)].sort((e,t)=>e-t)).length/2),e.length%2?e[a]:(e[a-1]+e[a])/2))}),(0,t.jsx)("ol",{"aria-label":"As execuções mais recentes dos agentes",className:"wd-traces",children:n.map((e,a)=>(0,t.jsxs)("li",{"data-first":0===a||void 0,"data-rank":a,children:[(0,t.jsx)(D,{tone:e.tone}),(0,t.jsxs)("span",{className:"wd-truncate",children:[e.id,(0,t.jsxs)("span",{className:"wd-sr",children:[", ",B[e.tone],", ",e.agent,","]})]}),(0,t.jsx)("span",{"aria-hidden":"true",className:"wd-traces__agent wd-truncate",children:e.agent}),(0,t.jsx)("span",{"aria-hidden":"true",className:"wd-traces__track",children:(0,t.jsx)("span",{style:{width:`${e.ms/3600*100}%`}})}),(0,t.jsx)("span",{className:"wd-num",children:E(e.ms)})]},e.n))})]})},evals:function(){let e=K.reduce((e,t)=>e+t.value,0)/K.length;return(0,t.jsxs)(T,{title:"Nota das evals",children:[(0,t.jsxs)("div",{className:"wd-score",children:[(0,t.jsx)(I,{children:$(e,2)}),(0,t.jsxs)("span",{className:"wd-delta","data-tone":"ok",children:[(0,t.jsx)("span",{"aria-hidden":"true",children:"↑ "}),"0,03",(0,t.jsx)("span",{className:"wd-sr",children:" desde o experimento anterior"})]})]}),(0,t.jsx)("dl",{className:"wd-list",children:K.map(e=>(0,t.jsx)(P,{value:$(e.value,2),children:e.name},e.name))})]})},tools:function(){let e=C(3e3),a=O.map((t,a)=>({...t,calls:t.calls+Math.floor(e%50*(4-a)*.6)})),r=Math.max(...a.map(e=>e.calls)),n=a.reduce((e,t)=>e+t.calls,0);return(0,t.jsxs)(T,{title:"Chamadas de ferramentas",meta:"24h",children:[(0,t.jsx)(I,{children:n.toLocaleString("pt-BR")}),(0,t.jsxs)("table",{className:"wd-tools",children:[(0,t.jsx)("caption",{className:"wd-sr",children:"Chamadas de ferramentas nas últimas 24 horas"}),(0,t.jsx)("thead",{className:"wd-sr",children:(0,t.jsxs)("tr",{children:[(0,t.jsx)("th",{scope:"col",children:"ferramenta"}),(0,t.jsx)("th",{scope:"col",children:"parcela"}),(0,t.jsx)("th",{scope:"col",children:"chamadas"})]})}),(0,t.jsx)("tbody",{children:a.map((e,a)=>(0,t.jsxs)("tr",{"data-first":0===a||void 0,"data-rank":a,children:[(0,t.jsx)("th",{scope:"row",className:"wd-truncate",children:e.name}),(0,t.jsx)("td",{children:(0,t.jsx)("span",{"aria-hidden":"true",className:"wd-tools__track",children:(0,t.jsx)("span",{style:{width:`${e.calls/r*100}%`}})})}),(0,t.jsx)("td",{className:"wd-num",children:e.calls})]},e.name))})]})]})},models:function(){return(0,t.jsxs)(T,{title:"Uso de tokens",meta:"por modelo · 24h",children:[(0,t.jsx)(I,{unit:"tokens",children:"12,3 mi"}),(0,t.jsx)("dl",{className:"wd-models",children:H.map(e=>(0,t.jsxs)(P,{value:`${Math.round(100*e.share)}%`,children:[(0,t.jsx)("span",{"aria-hidden":"true",className:"wd-swatch",style:{background:e.swatch}}),(0,t.jsx)("span",{className:"wd-truncate",children:e.name})]},e.name))}),(0,t.jsx)("div",{role:"img","aria-label":`Parcela dos tokens: ${H.map(e=>`${e.name} ${Math.round(100*e.share)}%`).join(", ")}.`,className:"wd-share",children:H.map(e=>(0,t.jsx)("span",{style:{width:`${100*e.share}%`,background:e.swatch}},e.name))})]})}};function X(){let[e,r]=(0,a.useState)(!0);return(0,a.useEffect)(()=>{window.matchMedia("(prefers-reduced-motion: reduce)").matches&&r(!1)},[]),(0,t.jsxs)("main",{className:"wd-root",children:[(0,t.jsx)("style",{dangerouslySetInnerHTML:{__html:Y}}),(0,t.jsxs)("div",{className:"wd-frame",children:[(0,t.jsxs)("p",{className:"wd-hint",children:[(0,t.jsx)("span",{className:"wd-hint__mouse",children:"Arraste os widgets para montar o seu painel."}),(0,t.jsx)("span",{className:"wd-hint__touch",children:"Toque e segure um widget, depois arraste para montar o seu painel."})]}),(0,t.jsxs)("section",{"aria-labelledby":"painel-agentes-titulo",children:[(0,t.jsx)("h2",{id:"painel-agentes-titulo",className:"wd-sr",children:"Observabilidade dos agentes"}),(0,t.jsx)(z.Provider,{value:e,children:(0,t.jsx)(k,{items:N,renderItem:e=>{let a;return a=G[e.kind],(0,t.jsx)(a,{})}})})]})]})]})}let Y=`
/* a p\xe1gina da demo: o fundo, a fonte monoespa\xe7ada do sistema e as cores dos widgets (as vari\xe1veis --dwg-* da grade) */
.wd-root {
  --wd-fg: #fafafa;
  --wd-muted: #a1a1aa;
  --dwg-card: #141417;
  --dwg-card-foreground: #fafafa;
  --dwg-border: #27272a;
  --dwg-ring: #d4d4d8;
  --dwg-landed: rgba(250, 250, 250, .4);
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 100%;
  min-height: 100svh;
  margin: 0;
  padding: 48px 16px;
  background: #0a0a0b;
  color: var(--wd-fg);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: normal;
  text-align: left;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.wd-root *, .wd-root *::before, .wd-root *::after { box-sizing: border-box; }
.wd-root :where(p, h2, h3, dl, dd, ol, li, table, caption, th, td) { margin: 0; padding: 0; }
.wd-frame { width: 100%; max-width: 1180px; }

.wd-hint { margin-bottom: 16px; font-size: 14px; color: var(--wd-muted); }
.wd-hint__touch { display: none; }
@media (pointer: coarse) {
  .wd-hint__mouse { display: none; }
  .wd-hint__touch { display: inline; }
}

.wd-sr {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
.wd-truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.wd-muted { color: var(--wd-muted); }
.wd-num { text-align: right; font-variant-numeric: tabular-nums; }

/* o miolo de cada widget: t\xedtulo, n\xfamero grande e o gr\xe1fico no p\xe9. As medidas internas seguem a largura do widget */
.wd-shell {
  container-type: inline-size;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  padding: 16px;
}
@media (min-width: 640px) {
  .wd-shell { padding: 22px; }
}
.wd-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 12px;
  font-size: 14px;
  line-height: 1;
}
.wd-title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  font-weight: inherit;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--wd-muted);
}
.wd-meta { flex-shrink: 0; color: var(--wd-muted); }
.wd-body { display: flex; flex: 1; flex-direction: column; min-height: 0; }
.wd-foot { margin-top: auto; }

.wd-big {
  font-size: 28px;
  font-weight: 400;
  line-height: 1;
  letter-spacing: -.025em;
  color: var(--wd-fg);
  font-variant-numeric: tabular-nums;
}
@container (min-width: 240px) {
  .wd-big { font-size: 30px; }
}
.wd-unit { font-size: 13px; letter-spacing: normal; color: var(--wd-muted); }
/* a unidade que s\xf3 cabe nos widgets largos: escondida da tela (o leitor de tela l\xea), e de volta a partir de 200 px */
.wd-unit[data-wide] { position: absolute; width: 1px; height: 1px; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; }
@container (min-width: 200px) {
  .wd-unit[data-wide] { position: static; width: auto; height: auto; margin: 0; overflow: visible; clip: auto; white-space: normal; }
}

.wd-delta { font-size: 14px; font-variant-numeric: tabular-nums; }
[data-tone="ok"].wd-delta { color: #34d399; }
[data-tone="err"].wd-delta { color: #fb7185; }

/* o ponto de status, com o pulso */
.wd-dot { position: relative; display: inline-flex; flex-shrink: 0; width: 8px; height: 8px; --wd-dot: rgba(161, 161, 170, .6); }
.wd-dot[data-tone="ok"] { --wd-dot: #10b981; }
.wd-dot[data-tone="warn"] { --wd-dot: #f59e0b; }
.wd-dot[data-tone="err"] { --wd-dot: #f43f5e; }
.wd-dot__core { position: relative; width: 8px; height: 8px; border-radius: 999px; background: var(--wd-dot); }
.wd-dot__ping { position: absolute; inset: 0; border-radius: 999px; background: var(--wd-dot); opacity: .5; animation: wd-ping 1s cubic-bezier(0, 0, .2, 1) infinite; }
@keyframes wd-ping {
  75%, 100% { transform: scale(2); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .wd-dot__ping { display: none; }
}

.wd-row { display: flex; align-items: center; gap: 8px; font-size: 13px; }
.wd-row dt { display: flex; align-items: center; gap: 8px; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--wd-fg); }
.wd-row dd { margin-left: auto; color: var(--wd-muted); font-variant-numeric: tabular-nums; }
.wd-list { display: flex; flex-direction: column; gap: 8px; margin-top: auto; }

/* execu\xe7\xf5es: o mapa de calor */
.wd-heat { display: grid; grid-template-columns: minmax(0, 1fr); align-items: center; gap: 3px 12px; }
.wd-heat__day { display: none; font-size: 12px; line-height: 1; color: var(--wd-muted); }
.wd-heat__day[data-today] { color: var(--wd-fg); }
.wd-heat__row { display: grid; grid-template-columns: repeat(32, minmax(0, 1fr)); gap: 3px; }
.wd-heat__cell { aspect-ratio: 1; border-radius: 2.5px; transition: background-color .7s cubic-bezier(.4, 0, .2, 1); }
.wd-heat__corner { display: none; }
.wd-heat__hours { display: none; grid-template-columns: repeat(4, minmax(0, 1fr)); margin-top: 8px; font-size: 12px; color: var(--wd-muted); }
@container (min-width: 480px) {
  .wd-heat { grid-template-columns: auto minmax(0, 1fr); }
  .wd-heat__day, .wd-heat__corner { display: block; }
  .wd-heat__hours { display: grid; }
}

/* status do sistema */
.wd-status { display: flex; align-items: center; gap: 8px; margin-top: 12px; font-size: 13px; color: var(--wd-fg); }
.wd-status[data-tone="warn"] { color: #fcd34d; }
.wd-uptime { display: flex; gap: 2px; height: 20px; }
.wd-uptime > span { flex: 1; border-radius: 1.5px; background: rgba(250, 250, 250, .15); }
.wd-uptime > span[data-incident] { background: rgba(251, 191, 36, .8); }
@container (min-width: 240px) {
  .wd-uptime { height: 24px; }
}

/* custo: as barras dos dias */
.wd-bars { display: flex; align-items: flex-end; gap: 3px; height: 40px; margin-top: auto; }
.wd-bars > span { flex: 1; border-radius: 999px; background: rgba(250, 250, 250, .15); transition: height .7s cubic-bezier(.4, 0, .2, 1); }

/* traces: as linhas que s\xf3 aparecem com espa\xe7o, das mais novas para as mais velhas */
.wd-live { display: flex; align-items: center; gap: 6px; }
.wd-traces { display: flex; flex-direction: column; gap: 8px; margin-top: auto; padding: 0; list-style: none; font-size: 13px; }
.wd-traces > li { display: grid; grid-template-columns: 6px minmax(0, 1fr) 60px; align-items: center; gap: 12px; color: var(--wd-muted); }
.wd-traces > li[data-first] { color: var(--wd-fg); }
.wd-traces > li[data-rank="2"], .wd-traces > li[data-rank="3"] { display: none; }
.wd-traces__agent, .wd-traces__track { display: none; }
.wd-traces__track { height: 3px; border-radius: 999px; background: rgba(250, 250, 250, .1); }
.wd-traces__track > span { display: block; height: 100%; border-radius: 999px; background: rgba(250, 250, 250, .25); }
li[data-first] .wd-traces__track > span { background: ${R}; }
@container (min-width: 360px) {
  .wd-traces > li[data-rank="2"] { display: grid; }
}
@container (min-width: 440px) {
  .wd-traces > li { grid-template-columns: 6px 84px minmax(0, 1fr) 26% 60px; }
  .wd-traces__agent, .wd-traces__track { display: block; }
}
@container (min-width: 520px) {
  .wd-traces > li[data-rank="3"] { display: grid; }
}

/* evals */
.wd-score { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 10px; }

/* ferramentas: a tabela com as barras */
.wd-tools { width: 100%; margin-top: auto; table-layout: fixed; border-collapse: collapse; border-spacing: 0; text-align: left; font-size: 13px; }
.wd-tools th, .wd-tools td { padding: 6px 0; }
.wd-tools tbody th { width: 140px; padding-right: 12px; font-weight: 400; color: var(--wd-muted); }
.wd-tools tr[data-first] th { color: var(--wd-fg); }
.wd-tools td.wd-num { width: 56px; color: var(--wd-muted); }
.wd-tools tr[data-rank="2"], .wd-tools tr[data-rank="3"] { display: none; }
.wd-tools__track { display: block; height: 3px; border-radius: 999px; background: rgba(250, 250, 250, .1); }
.wd-tools__track > span { display: block; height: 100%; border-radius: 999px; background: rgba(250, 250, 250, .25); transition: width .7s cubic-bezier(.4, 0, .2, 1); }
tr[data-first] .wd-tools__track > span { background: ${R}; }
@container (min-width: 360px) {
  .wd-tools tr[data-rank="2"] { display: table-row; }
}
@container (min-width: 520px) {
  .wd-tools tr[data-rank="3"] { display: table-row; }
}

/* tokens por modelo */
.wd-models { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 24px; margin-top: auto; }
.wd-swatch { flex-shrink: 0; width: 6px; height: 6px; border-radius: 999px; }
.wd-share { display: flex; gap: 3px; height: 3px; margin-top: 16px; }
.wd-share > span { height: 100%; border-radius: 999px; }

@media (prefers-reduced-motion: reduce) {
  .wd-heat__cell, .wd-bars > span, .wd-tools__track > span { transition: none; }
}
`;var J=e.i(910856);e.s(["default",0,function({mode:e,compact:r}){let n=(0,a.useRef)(null);return((0,a.useEffect)(()=>{n.current?.querySelectorAll("[tabindex]").forEach(e=>e.tabIndex=-1)},[]),"stage"===e)?(0,t.jsx)("div",{className:`${J.default.stage} ${r?J.default.compact:""}`,children:(0,t.jsx)(X,{})}):(0,t.jsx)("div",{ref:n,className:`${J.default.stage} ${J.default.compact} ${J.default.tile}`,"aria-hidden":"true",children:(0,t.jsx)(X,{})})}],218277)},765198,function(e){e.n(e.i(218277))}]);

//# debugId=965e6cb2-0964-a702-c88d-18ba1cde97de