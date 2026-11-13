;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="559f58b9-ce0f-98da-5d17-9b4df43e10c1")}catch(e){}}();
(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,420170,e=>{e.v({cursor:"ProgressMetricCard-module__X91sCq__cursor",on:"ProgressMetricCard-module__X91sCq__on",ripple:"ProgressMetricCard-module__X91sCq__ripple",stage:"ProgressMetricCard-module__X91sCq__stage",tile:"ProgressMetricCard-module__X91sCq__tile"})},618742,e=>{"use strict";var t=e.i(843476),a=e.i(271645);let r={emerald:{stroke:"#10b981",text:"#059669"},rose:{stroke:"#ef4444",text:"#dc2626"},neutral:{stroke:"#64748b",text:"#475569"}},o=["#10b981","#6366f1","#f59e0b","#ef4444","#14b8a6"];function n(e){let t=Math.abs(e);return t>=1e6?i(e/1e6)+" mi":t>=1e3?i(e/1e3)+" mil":e.toLocaleString("pt-BR")}function i(e){return e.toFixed(2).replace(/\.?0+$/,"").replace(".",",")}let s=u(.42,0,.58,1),l=u(.25,.1,.25,1);function c({series:e,view:r,defaultIndex:o,valueFormatter:n,dateFormatter:i,padTop:u=36,label:f}){let v=(0,a.useId)().replace(/:/g,""),b=(0,a.useSyncExternalStore)(g,()=>window.matchMedia(x).matches,()=>!1),[y,j]=function(){let e=(0,a.useRef)(null),[t,r]=(0,a.useState)({w:0,h:0});return h(()=>{let t=e.current;if(!t)return;let a=(e,t)=>r(a=>a.w===Math.floor(e)&&a.h===Math.floor(t)?a:{w:Math.floor(e),h:Math.floor(t)});a(t.clientWidth,t.clientHeight);let o=new ResizeObserver(([e])=>a(e.contentRect.width,e.contentRect.height));return o.observe(t),()=>o.disconnect()},[]),[t,e]}(),{w,h:_}=y,k=e.length>1,M=e[0]?.data.length??0,N=(u+_)/2,$=(0,a.useMemo)(()=>(function(e,t,a,r,o){let n=e[0]?.data.length??0,i=e.flatMap(e=>e.data.map(e=>e.value)),s=i.length?Math.min(...i):0,l=i.length?Math.max(...i):0,[c,p]="bar"===t?[0,Math.ceil(l+.08*(l||1))]:[Math.floor(s-.14*(s||1)),Math.ceil(l+.02*(l||1))],d=p-c||1,m=e=>o+(p-e)/d*(r-o),u=(e,t)=>e.data[t]?.value??0;if("curve"===t)return{view:t,lines:e.map(e=>Array.from({length:n},(t,r)=>({x:n>1?r*a/(n-1):a/2,y:m(u(e,r))})))};let h=n?a/n:0,x=.1*h,g=e.length,f=h-2*x-(g-1)*4<=0?0:4,v=(h-2*x-(g-1)*f)/g;v>1&&(v=Math.floor(v));let b=Math.min(v,26);return{view:t,band:h,bars:e.map((e,t)=>Array.from({length:n},(a,o)=>{let n=m(u(e,o));return{x:o*h+x+(v+f)*t+(v-b)/2,y:n,w:b,h:r-n}}))}})(e,r,w,_,u),[e,r,w,_,u]),[z,C]=(0,a.useState)(null==o?null:{i:o}),[S,L]=(0,a.useState)(r);S!==r&&(L(r),C(null==o?null:{i:o}));let q=z&&M?Math.min(z.i,M-1):null,A=r+"|"+e.map(e=>e.color+":"+e.data.map(e=>e.value+"@"+e.date).join(",")).join("|"),P=(0,a.useRef)(null),[E,R]=(0,a.useState)(null),F=w>0&&_>0;h(()=>{if(!F)return;if(b)return void R(null);let e=P.current;R({key:A,from:e&&e.view===r?e:null,p:0});let t="curve"===r?900:700,a=0,o=requestAnimationFrame(function e(r){a||(a=r+32);let n=Math.max(0,Math.min(1,(r-a)/t));R(e=>e&&e.key===A?{...e,p:n}:e),n<1&&(o=requestAnimationFrame(e))});return()=>cancelAnimationFrame(o)},[A,F,b]);let T=E&&E.key===A&&E.p<1?E:null,B="curve"===r?s:l,O=T?B(T.p):1,I=T?function(e,t,a,r){if("curve"===t.view)return e&&"curve"===e.view?{view:"curve",lines:t.lines.map((t,r)=>{let o=e.lines[r];return o?.length?t.map((e,r)=>{let n=o[Math.floor(r*o.length/t.length)];return n?{x:d(n.x,e.x,a),y:d(n.y,e.y,a)}:e}):t})}:t;let o=e&&"bar"===e.view?e.bars:null;return{...t,bars:t.bars.map((e,t)=>{let n=o?.[t];return e.map((t,o)=>{let i=n?.length?n[Math.floor(o*n.length/e.length)]:null;if(i)return{x:d(i.x,t.x,a),y:d(i.y,t.y,a),w:d(i.w,t.w,a),h:d(i.h,t.h,a)};let s=t.h*a;return{...t,y:r-s,h:s}})})}}(T.from,$,O,_):$;h(()=>{F&&(P.current=I)});let D=e=>{if(!M)return;let t=e.currentTarget.getBoundingClientRect(),a=(e.clientX-t.left)*w/t.width,o=(e.clientY-t.top)*_/t.height;C({i:m("curve"===r?Math.round(M>1?a/w*(M-1):0):Math.floor(a/w*M),0,M-1),y:o})},W=null==q?0:"curve"===$.view?$.lines[0]?.[q]?.x??0:(q+.5)*$.band,U=z?.y??N;return(0,t.jsx)("div",{ref:j,className:"pmc-chart",children:F&&(0,t.jsxs)("div",{className:"pmc-chart__box",style:{width:w,height:_},children:[(0,t.jsx)("svg",{className:"pmc-chart__svg",width:w,height:_,viewBox:`0 0 ${w} ${_}`,role:"application","aria-label":f,tabIndex:0,onPointerMove:D,onPointerDown:D,onPointerLeave:()=>C(null),onKeyDown:e=>{if(!M)return;if("Escape"===e.key){if(null==q)return;e.preventDefault(),C(null);return}let t={ArrowLeft:(q??M)-1,ArrowRight:(q??M-2)+1,Home:0,End:M-1};e.key in t&&(e.preventDefault(),C({i:m(t[e.key],0,M-1)}))},children:"curve"===I.view?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)("defs",{children:[e.map((e,a)=>(0,t.jsxs)("linearGradient",{id:`fill-${v}-${a}`,x1:"0",y1:"0",x2:"0",y2:"1",children:[(0,t.jsx)("stop",{offset:"0%",stopColor:e.color,stopOpacity:.32}),(0,t.jsx)("stop",{offset:"55%",stopColor:e.color,stopOpacity:.08}),(0,t.jsx)("stop",{offset:"100%",stopColor:e.color,stopOpacity:0})]},a)),T&&!T.from&&(0,t.jsx)("clipPath",{id:`reveal-${v}`,children:(0,t.jsx)("rect",{x:0,y:0,width:w*O,height:_})})]}),(0,t.jsx)("g",{clipPath:T&&!T.from?`url(#reveal-${v})`:void 0,children:I.lines.map((a,r)=>{let o=function(e){let t=e.length;if(!t)return"";if(1===t)return`M${p(e[0].x)},${p(e[0].y)}`;if(2===t)return`M${p(e[0].x)},${p(e[0].y)}L${p(e[1].x)},${p(e[1].y)}`;let a=e=>e<0?-1:1,r=Array(t);for(let o=1;o<t-1;o++){let t=e[o].x-e[o-1].x,n=e[o+1].x-e[o].x,i=(e[o].y-e[o-1].y)/(t||(n<0?-0:0)),s=(e[o+1].y-e[o].y)/(n||(t<0?-0:0)),l=(i*n+s*t)/(t+n);r[o]=(a(i)+a(s))*Math.min(Math.abs(i),Math.abs(s),.5*Math.abs(l))||0}let o=(e,t,a)=>{let r=t.x-e.x;return r?(3*(t.y-e.y)/r-a)/2:a};r[0]=o(e[0],e[1],r[1]),r[t-1]=o(e[t-2],e[t-1],r[t-2]);let n=`M${p(e[0].x)},${p(e[0].y)}`;for(let a=0;a<t-1;a++){let t=e[a],o=e[a+1],i=(o.x-t.x)/3;n+=`C${p(t.x+i)},${p(t.y+i*r[a])},${p(o.x-i)},${p(o.y-i*r[a+1])},${p(o.x)},${p(o.y)}`}return n}(a);if(!o)return null;let n=`${o}L${p(a[a.length-1].x)},${_}L${p(a[0].x)},${_}Z`;return(0,t.jsxs)("g",{children:[!k&&(0,t.jsx)("path",{d:n,fill:`url(#fill-${v}-${r})`,fillOpacity:.6}),(0,t.jsx)("path",{d:o,fill:"none",stroke:e[r].color,strokeWidth:2})]},r)})}),null!=q&&"curve"===$.view&&$.lines.map((a,r)=>a[q]?(0,t.jsx)("circle",{cx:a[q].x,cy:a[q].y,r:6,fill:e[r].color,stroke:"var(--pmc-card)",strokeWidth:4},r):null)]}):(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("defs",{children:e.map((e,a)=>(0,t.jsxs)("linearGradient",{id:`bar-${v}-${a}`,x1:"0",y1:"0",x2:"0",y2:"1",children:[(0,t.jsx)("stop",{offset:"0%",stopColor:e.color,stopOpacity:.95}),(0,t.jsx)("stop",{offset:"100%",stopColor:e.color,stopOpacity:.35})]},a))}),I.bars.map((a,r)=>(0,t.jsx)("g",{children:a.map((a,o)=>(0,t.jsx)("path",{d:function(e){let[t,a,r,o]=[e.x,e.y,e.w,e.h].map(e=>Math.round(1e4*e)/1e4);if(o<=0||r<=0)return"";let n=Math.min(6,r/2,o);return`M${t},${a+n}A${n},${n},0,0,1,${t+n},${a}L${t+r-n},${a}A${n},${n},0,0,1,${t+r},${a+n}L${t+r},${a+o}L${t},${a+o}Z`}(a),fill:o===q?e[r].color:`url(#bar-${v}-${r})`},o))},r))]})}),null!=q&&(0,t.jsx)("div",{className:"pmc-tip-wrap",style:{transform:`translate(${W}px, ${U}px)`},children:(0,t.jsxs)("div",{className:"pmc-tip",children:[e.map((e,a)=>(0,t.jsxs)("div",{className:"pmc-tip__row",children:[k&&(0,t.jsx)("span",{className:"pmc-dot",style:{background:e.color}}),k&&(0,t.jsx)("span",{className:"pmc-tip__name",children:e.name}),(0,t.jsx)("span",{className:k?"pmc-tip__value":void 0,children:n(e.data[q]?.value??0)})]},a)),(0,t.jsx)("div",{className:"pmc-tip__date",children:i(e[0].data[q].date)})]})})]})})}let p=e=>Math.round(1e3*e)/1e3,d=(e,t,a)=>e+(t-e)*a,m=(e,t,a)=>Math.max(t,Math.min(a,e));function u(e,t,a,r){let o=3*e,n=3*(a-e)-o,i=1-o-n,s=3*t,l=3*(r-t)-s,c=1-s-l,p=e=>((i*e+n)*e+o)*e;return e=>{if(e<=0)return 0;if(e>=1)return 1;let t=0,a=1,r=e;for(let o=0;o<30;o++){let o=p(r);if(1e-7>Math.abs(o-e))break;o<e?t=r:a=r,r=(t+a)/2}return((c*r+l)*r+s)*r}}let h=a.useLayoutEffect,x="(prefers-reduced-motion: reduce)",g=e=>{let t=window.matchMedia(x);return t.addEventListener("change",e),()=>t.removeEventListener("change",e)};function f({size:e,strokeWidth:a=2,className:r,style:o,children:n}){return(0,t.jsx)("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:a,strokeLinecap:"round",strokeLinejoin:"round",className:r,style:o,"aria-hidden":"true",children:n})}let v=[{key:"curve",label:"Curva",icon:(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("path",{d:"M3 3v16a2 2 0 0 0 2 2h16"}),(0,t.jsx)("path",{d:"m19 9-5 5-4-4-3 3"})]})},{key:"bar",label:"Barras",icon:(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("path",{d:"M3 3v16a2 2 0 0 0 2 2h16"}),(0,t.jsx)("path",{d:"M18 17V9"}),(0,t.jsx)("path",{d:"M13 17V5"}),(0,t.jsx)("path",{d:"M8 17v-3"})]})}];function b({value:e,onChange:a}){return(0,t.jsx)("div",{className:"pmc-toggle",role:"group","aria-label":"Tipo de gráfico",children:v.map(({key:r,label:o,icon:n})=>(0,t.jsx)("button",{type:"button",className:"pmc-toggle__btn","aria-pressed":e===r,"aria-label":o,title:o,onClick:()=>a(r),children:(0,t.jsx)(f,{size:15,children:n})},r))})}function y({value:e,options:r,onChange:o,accentText:n}){let[i,s]=(0,a.useState)(!1),l=(0,a.useRef)(null),c=(0,a.useRef)(null),p=(0,a.useId)();return(0,a.useEffect)(()=>{if(!i)return;let e=e=>{l.current&&!l.current.contains(e.target)&&s(!1)},t=e=>{"Escape"===e.key&&(e.preventDefault(),s(!1),l.current?.contains(document.activeElement)&&c.current?.focus())};return document.addEventListener("pointerdown",e),document.addEventListener("keydown",t),()=>{document.removeEventListener("pointerdown",e),document.removeEventListener("keydown",t)}},[i]),(0,t.jsxs)("div",{ref:l,className:"pmc-period",onKeyDown:e=>{if("ArrowDown"!==e.key&&"ArrowUp"!==e.key)return;e.preventDefault();let t=[...l.current?.querySelectorAll("[role=option]")??[]];if(!i||!t.length){s(!0),requestAnimationFrame(()=>l.current?.querySelector("[aria-selected=true]")?.focus());return}let a=t.indexOf(document.activeElement),r=a<0?0:(a+("ArrowDown"===e.key?1:-1)+t.length)%t.length;t[r].focus()},onBlur:e=>{i&&!l.current?.contains(e.relatedTarget)&&e.relatedTarget&&s(!1)},children:[(0,t.jsxs)("button",{ref:c,type:"button",className:"pmc-period__btn","aria-haspopup":"listbox","aria-expanded":i,"aria-controls":i?p:void 0,onClick:()=>s(e=>!e),children:[e,(0,t.jsx)(f,{size:16,className:"pmc-period__chevron",children:(0,t.jsx)("path",{d:"m6 9 6 6 6-6"})})]}),i&&(0,t.jsx)("div",{id:p,role:"listbox","aria-label":"Período",className:"pmc-menu",children:r.map(a=>{let r=a.label===e;return(0,t.jsxs)("button",{type:"button",role:"option","aria-selected":r,className:"pmc-menu__option",onClick:()=>{o(a),s(!1),c.current?.focus()},children:[a.label,r&&(0,t.jsx)(f,{size:14,style:{color:n},children:(0,t.jsx)("path",{d:"M20 6 9 17l-5-5"})})]},a.label)})})]})}let j=[{label:"Últimos 7 dias",points:4},{label:"Últimos 14 dias",points:7},{label:"Últimos 30 dias"}];function w({title:e,total:i,delta:s,deltaLabel:l="hoje",percent:p,trend:d,unit:m,period:u="Últimos 30 dias",periodOptions:h,onPeriodChange:x,defaultView:g="curve",accent:v,data:_,series:M,defaultIndex:N,size:$="md",showStats:z=!0,valueFormatter:C,dateFormatter:S,loading:L=!1,theme:q,className:A}){let P,E,R=`grid-${(0,a.useId)().replace(/:/g,"")}`,F={className:["pmc-root",A].filter(Boolean).join(" "),"data-pmc-size":$,"data-pmc-theme":q},T=h??j,[B,O]=(0,a.useState)(u),[I,D]=(0,a.useState)(g),W=(0,a.useMemo)(()=>M?.length?M:[{name:e,data:_??[],accent:v}],[M,_,e,v]),U=T.find(e=>e.label===B)??T[T.length-1],X=(0,a.useMemo)(()=>W.map(e=>{let t,a;return{...e,data:(t=e.data,(a=U?.points)&&a<t.length?t.slice(-a):t)}}),[W,U]),H=X[0],K=X.length>1,V=(H?.data.length??0)>=2,G=(0,a.useMemo)(()=>{let e=H?.data.map(e=>e.value)??[],t=e.reduce((e,t)=>e+t,0),a=e[0]??0,r=e[e.length-1]??0,o=e[e.length-2]??a,n=r-a;return{sum:t,net:n,pct:a?n/a*100:0,step:r-o,peak:e.length?Math.max(...e):0,low:e.length?Math.min(...e):0,avg:e.length?t/e.length:0}},[H]),Y=d??(.5>Math.abs(G.pct)?"flat":G.net>=0?"up":"down"),Z=r[v??("up"===Y?"emerald":"down"===Y?"rose":"neutral")],J=C??n,Q=C??(e=>e.toLocaleString("pt-BR")+(m?` ${m}`:"")),ee=i??J(G.sum),et=s??((P=G.step)>=0?"+":"−")+J(Math.abs(P)),ea=p??(E=G.pct,`${Math.abs(E).toFixed(1).replace(".",",")}%`),er=X.map((e,t)=>({name:e.name,data:e.data,color:e.accent?r[e.accent].stroke:K?o[t%o.length]:Z.stroke})),eo=(H?.data.length??1)-1,en=Math.min(N??eo,eo);return L?(0,t.jsxs)("div",{...F,"aria-busy":"true",children:[(0,t.jsx)(k,{}),(0,t.jsxs)("div",{className:"pmc-content pmc-content--plain",children:[(0,t.jsxs)("div",{className:"pmc-skeleton__row",children:[(0,t.jsx)("div",{className:"pmc-skeleton",style:{width:128,height:20,borderRadius:4}}),(0,t.jsx)("div",{className:"pmc-skeleton",style:{width:96,height:20,borderRadius:4}})]}),(0,t.jsx)("div",{className:"pmc-skeleton",style:{marginTop:24,width:192,height:56}}),(0,t.jsx)("div",{className:"pmc-skeleton pmc-skeleton--soft",style:{marginTop:"auto",width:"100%",height:96}})]}),(0,t.jsx)("div",{className:"pmc-foot pmc-foot--plain",children:(0,t.jsx)("div",{className:"pmc-skeleton",style:{width:160,height:16,borderRadius:4}})})]}):V?(0,t.jsxs)("div",{...F,children:[(0,t.jsx)(k,{}),(0,t.jsxs)("div",{className:"pmc-region",style:{width:"62%"},children:[(0,t.jsx)("div",{className:"pmc-fill",style:{background:`linear-gradient(to left, ${Z.stroke}1f, transparent 75%)`}}),(0,t.jsx)("div",{className:"pmc-fill pmc-dots",children:(0,t.jsxs)("svg",{"aria-hidden":"true",children:[(0,t.jsx)("defs",{children:(0,t.jsx)("pattern",{id:R,width:"14",height:"14",patternUnits:"userSpaceOnUse",children:(0,t.jsx)("circle",{cx:"1",cy:"1",r:"1",fill:"currentColor"})})}),(0,t.jsx)("rect",{width:"100%",height:"100%",fill:`url(#${R})`})]})}),(0,t.jsx)(c,{series:er,view:I,defaultIndex:en,valueFormatter:Q,dateFormatter:S??(e=>e),label:`${e}: gr\xe1fico de ${"curve"===I?"curva":"barras"}, ${B.toLowerCase()}. Use as setas para percorrer os pontos.`})]}),(0,t.jsxs)("div",{className:"pmc-content",children:[(0,t.jsxs)("div",{className:"pmc-head",children:[(0,t.jsxs)("div",{className:"pmc-head__start",children:[(0,t.jsx)("h3",{className:"pmc-title",children:e}),(0,t.jsx)(b,{value:I,onChange:D})]}),(0,t.jsxs)("div",{className:"pmc-head__end",children:[(0,t.jsxs)("span",{className:"pmc-trend",style:{color:Z.text},children:[(0,t.jsx)(f,{size:16,strokeWidth:2.5,children:"flat"===Y?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("path",{d:"M5 12h14"}),(0,t.jsx)("path",{d:"m12 5 7 7-7 7"})]}):"down"===Y?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("path",{d:"M12 5v14"}),(0,t.jsx)("path",{d:"m19 12-7 7-7-7"})]}):(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("path",{d:"m5 12 7-7 7 7"}),(0,t.jsx)("path",{d:"M12 19V5"})]})}),ea]}),(0,t.jsx)(y,{value:B,options:T,onChange:e=>{O(e.label),x?.(e)},accentText:Z.text})]})]}),K&&(0,t.jsx)("div",{className:"pmc-legend",children:er.map(e=>(0,t.jsxs)("span",{className:"pmc-legend__item",children:[(0,t.jsx)("span",{className:"pmc-dot",style:{background:e.color}}),e.name]},e.name))}),(0,t.jsx)("div",{className:"pmc-total",children:ee})]}),(0,t.jsxs)("div",{className:"pmc-foot",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("span",{className:"pmc-strong",style:{color:Z.text},children:et})," ",(0,t.jsx)("span",{className:"pmc-muted",children:l})]}),z&&(0,t.jsxs)("div",{className:"pmc-stats",children:[(0,t.jsxs)("span",{children:[(0,t.jsx)("span",{className:"pmc-stats__value",children:J(G.peak)})," máx"]}),(0,t.jsx)("span",{className:"pmc-stats__sep",children:"·"}),(0,t.jsxs)("span",{children:[(0,t.jsx)("span",{className:"pmc-stats__value",children:J(G.low)})," mín"]}),(0,t.jsx)("span",{className:"pmc-stats__sep",children:"·"}),(0,t.jsxs)("span",{children:[(0,t.jsx)("span",{className:"pmc-stats__value",children:J(Math.round(G.avg))})," média"]})]})]})]}):(0,t.jsxs)("div",{...F,children:[(0,t.jsx)(k,{}),(0,t.jsxs)("div",{className:"pmc-content pmc-content--plain",children:[(0,t.jsx)("h3",{className:"pmc-title",children:e}),(0,t.jsxs)("div",{className:"pmc-empty",children:[(0,t.jsx)("p",{className:"pmc-empty__title",children:"Ainda sem dados"}),(0,t.jsx)("p",{className:"pmc-empty__text",children:"As métricas aparecem quando houver dados."})]})]})]})}let _=Number(a.version.split(".")[0])>=19;function k(){return _?(0,t.jsx)("style",{href:"progress-metric-card",precedence:"default",children:M}):(0,t.jsx)("style",{hidden:!0,dangerouslySetInnerHTML:{__html:M}})}let M=`
/* o que o projeto pode trocar com uma classe (largura, margem): na camada base, que vem antes das classes de
   componente e dos utilit\xe1rios (Tailwind v4) e perde para o CSS fora de camada (Tailwind v3, CSS Modules, CSS comum) */
@layer base {
  .pmc-root { width: 100%; margin: 0; }
}

/* as cores: claro de f\xe1brica; escuro com theme="dark" ou, sem theme, dentro da classe dark do projeto (a do shadcn e
   do next-themes). D\xe1 para trocar qualquer uma no CSS do projeto */
.pmc-root {
  --pmc-card: oklch(100% 0 0);
  --pmc-text: oklch(14.5% 0 0);
  --pmc-muted: oklch(97% 0 0);
  --pmc-muted-text: oklch(55.6% 0 0);
  --pmc-border: oklch(92.2% 0 0);
  --pmc-ring: oklch(70.8% 0 0);
}
.dark .pmc-root:not([data-pmc-theme="light"]), .pmc-root[data-pmc-theme="dark"] {
  --pmc-card: oklch(20.5% 0 0);
  --pmc-text: oklch(98.5% 0 0);
  --pmc-muted: oklch(26.9% 0 0);
  --pmc-muted-text: oklch(70.8% 0 0);
  --pmc-border: oklch(100% 0 0 / 0.1);
  --pmc-ring: oklch(55.6% 0 0);
}

/* os tamanhos: a altura m\xednima, as margens, o t\xedtulo e o n\xfamero grande */
.pmc-root, .pmc-root[data-pmc-size="md"] {
  --pmc-min-h: 380px; --pmc-pad-x: 32px; --pmc-pad-top: 28px; --pmc-foot-y: 16px; --pmc-title: 17px; --pmc-headline: 72px;
}
.pmc-root[data-pmc-size="sm"] {
  --pmc-min-h: 260px; --pmc-pad-x: 24px; --pmc-pad-top: 20px; --pmc-foot-y: 12px; --pmc-title: 15px; --pmc-headline: 46px;
}
.pmc-root[data-pmc-size="lg"] {
  --pmc-min-h: 460px; --pmc-pad-x: 40px; --pmc-pad-top: 36px; --pmc-foot-y: 20px; --pmc-title: 19px; --pmc-headline: 88px;
}

/* o card; nada de texto herdado da p\xe1gina: ele fica igual em qualquer projeto */
.pmc-root {
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: var(--pmc-min-h);
  overflow: hidden;
  border: 1px solid var(--pmc-border);
  border-radius: 28px;
  background: var(--pmc-card);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  color: var(--pmc-text);
  font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: normal;
  text-align: left;
  text-transform: none;
  text-shadow: none;
  -webkit-font-smoothing: auto;
  -moz-osx-font-smoothing: auto;
}
.pmc-root *, .pmc-root *::before, .pmc-root *::after { box-sizing: border-box; }
.pmc-root :where(h3, p) { margin: 0; font-size: inherit; font-weight: inherit; }
.pmc-root :where(svg) { display: block; flex-shrink: 0; }
.pmc-root :where(button) {
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: none;
  color: inherit;
  font: inherit;
  letter-spacing: inherit;
  text-align: inherit;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.pmc-root :where(button):focus { outline: none; }
.pmc-root :where(button):focus-visible { outline: 2px solid var(--pmc-ring); outline-offset: 2px; }

/* o gr\xe1fico, \xe0 direita: o brilho da cor, os pontos (que somem para a esquerda) e o <svg> */
.pmc-region { position: absolute; top: 0; right: 0; bottom: 0; z-index: 0; }
.pmc-fill { position: absolute; inset: 0; }
.pmc-dots {
  color: color-mix(in oklab, var(--pmc-text) 13%, transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, black 55%);
  mask-image: linear-gradient(to right, transparent, black 55%);
}
.pmc-dots svg { width: 100%; height: 100%; }
.pmc-chart { position: relative; width: 100%; height: 100%; min-width: 0; }
.pmc-chart__box { position: absolute; top: 0; left: 0; }
.pmc-chart__svg { width: 100%; height: 100%; touch-action: pan-y; user-select: none; -webkit-user-select: none; }
.pmc-chart__svg:focus { outline: none; }
.pmc-chart__svg:focus-visible { outline: 2px solid var(--pmc-ring); outline-offset: -2px; }

/* o bal\xe3o do ponto marcado: \xe0 esquerda do ponto, na altura do mouse */
.pmc-tip-wrap { position: absolute; top: 0; left: 0; z-index: 20; pointer-events: none; }
.pmc-tip {
  white-space: nowrap;
  border: 1px solid var(--pmc-border);
  border-radius: 10px;
  background: var(--pmc-card);
  padding: 8px 12px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
  transform: translate(calc(-100% - 16px), -50%);
}
.pmc-tip__row { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; line-height: 1.25; color: var(--pmc-text); }
.pmc-tip__name { font-weight: 400; color: var(--pmc-muted-text); }
.pmc-tip__value { margin-left: auto; }
.pmc-tip__date { margin-top: 2px; font-size: 11px; line-height: 1.25; color: var(--pmc-muted-text); }
.pmc-dot { width: 8px; height: 8px; flex-shrink: 0; border-radius: 9999px; }

/* o conte\xfado, por cima do gr\xe1fico: ele deixa o mouse passar, menos nos controles */
.pmc-content {
  pointer-events: none;
  position: relative;
  z-index: 10;
  display: flex;
  flex: 1 1 0%;
  flex-direction: column;
  padding: var(--pmc-pad-top) var(--pmc-pad-x) 0;
}
.pmc-content--plain { pointer-events: auto; }
.pmc-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 16px; }
.pmc-head__start { display: flex; align-items: center; gap: 12px; }
.pmc-head__end { display: flex; align-items: center; gap: 14px; font-size: 14px; }
.pmc-title { font-size: var(--pmc-title); font-weight: 600; letter-spacing: -0.025em; color: var(--pmc-text); }
.pmc-trend { display: flex; align-items: center; gap: 4px; font-weight: 500; }
.pmc-legend { margin-top: 10px; display: flex; flex-wrap: wrap; align-items: center; gap: 4px 16px; }
.pmc-legend__item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--pmc-muted-text); }
.pmc-total {
  margin-top: 20px;
  font-size: var(--pmc-headline);
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.025em;
  color: var(--pmc-text);
}

/* a troca entre a curva e as barras */
.pmc-toggle {
  pointer-events: auto;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  border: 1px solid var(--pmc-border);
  border-radius: 10px;
  background: var(--pmc-card);
  padding: 2px;
}
.pmc-root .pmc-toggle__btn {
  display: flex;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: var(--pmc-muted-text);
  transition: color 0.15s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}
.pmc-root .pmc-toggle__btn[aria-pressed="true"] { background: var(--pmc-muted); color: var(--pmc-text); }

/* o menu do per\xedodo */
.pmc-period { pointer-events: auto; position: relative; }
.pmc-root .pmc-period__btn {
  display: flex;
  align-items: center;
  gap: 4px;
  border-radius: 8px;
  color: var(--pmc-muted-text);
  user-select: none;
  -webkit-user-select: none;
  transition: color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}
.pmc-period__chevron { opacity: 0.7; transition: rotate 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
.pmc-period__btn[aria-expanded="true"] .pmc-period__chevron { rotate: 180deg; }
.pmc-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 30;
  display: flex;
  min-width: 170px;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
  border: 1px solid var(--pmc-border);
  border-radius: 14px;
  background: var(--pmc-card);
  padding: 6px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.18);
}
.pmc-root .pmc-menu__option {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 13px;
  text-align: left;
  color: color-mix(in oklab, var(--pmc-text) 75%, transparent);
  transition: color 0.15s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}
.pmc-root .pmc-menu__option[aria-selected="true"] { background: var(--pmc-muted); font-weight: 500; color: var(--pmc-text); }
.pmc-root .pmc-menu__option:focus-visible { outline-offset: -2px; }
@media (hover: hover) {
  .pmc-root .pmc-toggle__btn:hover, .pmc-root .pmc-period__btn:hover { color: var(--pmc-text); }
  .pmc-root .pmc-menu__option:not([aria-selected="true"]):hover {
    background: color-mix(in oklab, var(--pmc-muted) 60%, transparent);
    color: var(--pmc-text);
  }
}

/* o rodap\xe9, opaco por cima do p\xe9 do gr\xe1fico */
.pmc-foot {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-top: 1px solid color-mix(in oklab, var(--pmc-text) 6%, transparent);
  background: var(--pmc-card);
  padding: var(--pmc-foot-y) var(--pmc-pad-x);
  font-size: 14px;
}
.pmc-strong { font-weight: 500; }
.pmc-muted { color: var(--pmc-muted-text); }
.pmc-stats { display: flex; align-items: center; gap: 10px; font-size: 12px; color: var(--pmc-muted-text); }
.pmc-stats__value { font-weight: 500; color: color-mix(in oklab, var(--pmc-text) 80%, transparent); }
.pmc-stats__sep { opacity: 0.4; }

/* o carregando e o sem dados */
.pmc-skeleton__row { display: flex; align-items: center; justify-content: space-between; }
.pmc-skeleton { border-radius: 10px; background: var(--pmc-muted); animation: pmc-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
.pmc-skeleton--soft { background: color-mix(in oklab, var(--pmc-muted) 50%, transparent); }
.pmc-foot--plain { display: block; }
@keyframes pmc-pulse { 50% { opacity: 0.5; } }
.pmc-empty {
  display: flex;
  flex: 1 1 0%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 40px 0;
  text-align: center;
}
.pmc-empty__title { font-size: 14px; font-weight: 500; line-height: 20px; color: var(--pmc-text); }
.pmc-empty__text { font-size: 12px; line-height: 16px; color: var(--pmc-muted-text); }

@media (prefers-reduced-motion: reduce) {
  .pmc-skeleton { animation: none; }
  .pmc-root .pmc-toggle__btn, .pmc-root .pmc-period__btn, .pmc-root .pmc-menu__option, .pmc-period__chevron { transition: none; }
}
`,N=[{value:100,date:"18 mar 2026"},{value:115,date:"21 mar 2026"},{value:120,date:"24 mar 2026"},{value:110,date:"27 mar 2026"},{value:178,date:"30 mar 2026"},{value:180,date:"02 abr 2026"},{value:205,date:"05 abr 2026"},{value:185,date:"08 abr 2026"},{value:180,date:"11 abr 2026"},{value:183,date:"14 abr 2026"},{value:185,date:"17 abr 2026"},{value:185,date:"20 abr 2026"},{value:166,date:"23 abr 2026"},{value:181,date:"26 abr 2026"},{value:168,date:"29 abr 2026"},{value:195,date:"02 mai 2026"},{value:188,date:"05 mai 2026"},{value:162,date:"08 mai 2026"},{value:166,date:"11 mai 2026"}];function $(e){return(0,t.jsxs)("div",{className:"pmc-demo",children:[(0,t.jsx)("style",{dangerouslySetInnerHTML:{__html:z}}),(0,t.jsx)("div",{className:"pmc-demo__frame",children:(0,t.jsx)(w,{title:"Total de pedidos",unit:"pedidos",data:N,defaultIndex:6,theme:"dark",...e})})]})}let z=`
.pmc-demo {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 100%;
  min-height: 100svh;
  background: oklch(14.5% 0 0);
}
.pmc-demo__frame { box-sizing: border-box; display: flex; flex-direction: column; gap: 16px; width: 100%; max-width: 760px; padding: 48px; }
@media (max-width: 640px) {
  .pmc-demo__frame { padding: 16px; }
}
`;var C=e.i(420170);let S=e=>{e.preventDefault(),e.stopPropagation()},L=[{at:0,rest:!0,o:0},{at:.5,rest:!0,o:1},{at:1.3,chart:[.06,.5],o:1},{at:3.9,chart:[.96,.45],o:1,sweep:!0},{at:4.7,view:"Barras",o:1},{at:5.7,view:"Barras",o:1},{at:6.5,chart:[.94,.5],o:1},{at:9,chart:[.06,.5],o:1,sweep:!0},{at:9.9,view:"Curva",o:1},{at:10.9,view:"Curva",o:1},{at:11.7,rest:!0,o:0},{at:12.2,rest:!0,o:0}],q=[{at:4.95,view:"Barras"},{at:10.15,view:"Curva"}],A=L[L.length-1].at,P=[.6,.45];e.s(["default",0,function({mode:e,compact:r}){let o=(0,a.useRef)(null),n=(0,a.useRef)(null);return((0,a.useEffect)(()=>{if("tile"===e){var t,a;let e,r,i,s,l,c,p,d,m,u,h,x,g,f;return t=o.current,a=n.current,e=matchMedia("(prefers-reduced-motion: reduce)").matches,r=t.closest(".preview"),i=!1,s=NaN,l=0,c=0,p=0,d=(e,a,r,o)=>e.dispatchEvent(new PointerEvent(a,{bubbles:!0,cancelable:!0,composed:!0,clientX:r,clientY:o,pointerId:1,pointerType:"mouse",isPrimary:!0,relatedTarget:t})),m=e=>t.querySelector(`.pmc-toggle__btn[aria-label="${e}"]`),u=e=>{e?t.dataset.press="":delete t.dataset.press},h=e=>{u(!1),m(e)?.click();let t=a.firstElementChild;t.classList.remove(C.default.on),t.offsetWidth,t.classList.add(C.default.on)},x=r=>{let o=l/1e3;l+=Math.min(100,r-c),c=r;let n=l/1e3;if(!e){for(let e of q)o<e.at-.14&&n>=e.at-.14&&u(!0),o<e.at&&n>=e.at&&h(e.view);n>=A&&(l-=1e3*A,n-=A)}(r=>{let o,n=t.getBoundingClientRect();if(!n.width||!t.offsetWidth)return;let l=n.width/t.offsetWidth,c=t.querySelector("svg.pmc-chart__svg"),p=c?.getBoundingClientRect(),u=(e,t,a)=>({x:(e.left+e.width*t-n.left)/l,y:(e.top+e.height*a-n.top)/l}),h={x:t.offsetWidth-10,y:t.offsetHeight-6},x=e=>{if("chart"in e)return p?.width?u(p,...e.chart):h;if("view"in e){let t=m(e.view)?.getBoundingClientRect();return t?.width?u(t,.55,.62):h}return h};if(e)o={...p?.width?u(p,...P):h,o:1};else{let e=1;for(;e<L.length-1&&L[e].at<r;)e++;let t=L[e-1],a=L[e],n=x(t),i=x(a),s=Math.min(1,Math.max(0,(r-t.at)/(a.at-t.at||1))),l=a.sweep?-(Math.cos(Math.PI*s)-1)/2:s<.5?4*s*s*s:1-(-2*s+2)**3/2;o={x:n.x+(i.x-n.x)*l,y:n.y+(i.y-n.y)*l,o:t.o+(a.o-t.o)*l}}a.style.transform=`translate3d(${o.x}px, ${o.y}px, 0)`,a.style.opacity=String(o.o);let g=n.left+o.x*l,f=n.top+o.y*l,v=!!(c&&p&&g>=p.left&&g<=p.right&&f>=p.top&&f<=p.bottom);c&&v&&!i&&d(c,"pointerover",g,f),c&&!v&&i&&d(c,"pointerout",g,f),i=v,c&&v&&g!==s&&d(c,"pointermove",g,f),s=g})(n),p=requestAnimationFrame(x)},f=new MutationObserver(g=()=>{let e=!r||r.classList.contains("is-playing");e&&!p?(c=performance.now(),p=requestAnimationFrame(x)):!e&&p&&(cancelAnimationFrame(p),p=0)}),r&&f.observe(r,{attributes:!0,attributeFilter:["class"]}),g(),()=>{f.disconnect(),cancelAnimationFrame(p)}}},[e]),"stage"===e)?(0,t.jsx)("div",{className:C.default.stage,children:(0,t.jsx)($,{size:r?"sm":"md"})}):(0,t.jsxs)("div",{ref:o,className:`${C.default.stage} ${C.default.tile}`,"aria-hidden":"true",inert:!0,onPointerMove:e=>e.stopPropagation(),onPointerOver:e=>e.stopPropagation(),onPointerOut:e=>e.stopPropagation(),onClick:S,children:[(0,t.jsx)($,{size:"sm"}),(0,t.jsxs)("div",{ref:n,className:C.default.cursor,children:[(0,t.jsx)("span",{className:C.default.ripple}),(0,t.jsx)("svg",{viewBox:"0 0 14 21",width:"18",height:"27",children:(0,t.jsx)("path",{d:"M1 1v15.5l3.8-3.6 2.8 6.5 2.5-1.1-2.7-6.3h5.2z"})})]})]})}],618742)},497671,function(e){e.n(e.i(618742))}]);

//# debugId=559f58b9-ce0f-98da-5d17-9b4df43e10c1