;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="537cbdf3-5195-23c0-fdb2-cdf333edd573")}catch(e){}}();
(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,909315,e=>{e.v({cursor:"HoloCard-module__KVXnAW__cursor",stage:"HoloCard-module__KVXnAW__stage",tile:"HoloCard-module__KVXnAW__tile"})},179572,e=>{"use strict";var t=e.i(843476),a=e.i(271645);let r="(prefers-reduced-motion: reduce)";function o(e){let t=window.matchMedia(r);return t.addEventListener("change",e),()=>t.removeEventListener("change",e)}class n{x;v=0;target;k;d;constructor(e,t,a){this.x=e,this.target=e,this.k=t,this.d=a}step(e){let t=this.k*(this.target-this.x)-this.d*this.v;return this.v+=t*e,this.x+=this.v*e,this.x}}let i=(e,t,a)=>Math.min(a,Math.max(t,e)),c=11/14,s=15/14,l=Number(a.version.split(".")[0])>=19;function d(){return l?(0,t.jsx)("style",{href:"holo-card",precedence:"default",children:m}):(0,t.jsx)("style",{hidden:!0,dangerouslySetInnerHTML:{__html:m}})}function h({children:e,maxTilt:l=14,spring:u,foil:f="spectral",glare:m=!0,shadow:p=!0,idleSway:x=!0,aspect:g=1.586,label:v="Cartão interativo",onTilt:b,pauseWhenHidden:y=!0,reducedMotion:_,className:w,style:M,...j}){let k="hc-hint-"+a.useId().replace(/[^a-zA-Z0-9_-]/g,""),N=a.useRef(null),S=a.useRef(null),P=a.useRef(null),C=a.useSyncExternalStore(o,()=>window.matchMedia(r).matches,()=>!1),F=!0===_||C,A=function(e,{threshold:t=.1}={}){let[r,o]=a.useState(!0),[n,i]=a.useState(!0);return a.useEffect(()=>{let a=e.current;if(!a||"u"<typeof IntersectionObserver)return;let r=new IntersectionObserver(e=>o(e.some(e=>e.isIntersecting)),{threshold:t});return r.observe(a),()=>r.disconnect()},[e,t]),a.useEffect(()=>{let e=()=>i("hidden"!==document.visibilityState);return e(),document.addEventListener("visibilitychange",e),()=>document.removeEventListener("visibilitychange",e)},[]),r&&n}(N,{threshold:.05}),R=y&&!A,z=!F&&!R,$=Math.abs(l)*s,E=Math.abs(l)*c,T=u?.stiffness??120,L=u?.damping??10,X=a.useRef({sx:new n(0,T,L),sy:new n(0,T,L)}),q=a.useRef({px:.5,py:.5,hovering:!1}),H=a.useRef({rx:0,ry:0}),I=a.useRef({maxX:E,maxY:$,idleSway:x,onTilt:b,staticMode:F});a.useEffect(()=>{I.current={maxX:E,maxY:$,idleSway:x,onTilt:b,staticMode:F}}),a.useEffect(()=>{X.current.sx.k=T,X.current.sy.k=T,X.current.sx.d=L,X.current.sy.d=L},[T,L]);let B=a.useCallback((e,t)=>{let a=S.current;if(!a)return;let{px:r,py:o}=q.current,{maxX:n,maxY:i,onTilt:c}=I.current;a.style.transform=`rotateX(${e.toFixed(3)}deg) rotateY(${t.toFixed(3)}deg)`,a.style.setProperty("--hc-px",r.toFixed(4)),a.style.setProperty("--hc-py",o.toFixed(4)),a.style.setProperty("--hc-hue",(4*t+(r-.5)*40).toFixed(2));let s=(Math.abs(e)+Math.abs(t))/Math.max(1,n+i);a.style.setProperty("--hc-glare-o",(.22+.4*s).toFixed(3));let l=P.current;l&&(l.style.transform=`translate3d(${(-(1.8*t)).toFixed(2)}px, ${(1.2*e).toFixed(2)}px, 0) scale(${(1+.08*s).toFixed(3)})`,l.style.opacity=(.75+.25*s).toFixed(3));let d=H.current;c&&(Math.abs(d.rx-e)>.05||Math.abs(d.ry-t)>.05)&&(H.current={rx:e,ry:t},c(e,t))},[]);a.useEffect(()=>{if(!z)return;let e=0,t=0,a=0,r=o=>{t||(t=o);let n=i((o-t)/1e3,0,.05);t=o,a+=n;let{sx:c,sy:s}=X.current,l=q.current,{maxX:d,maxY:h,idleSway:u}=I.current;if(!l.hovering){u?(s.target=i(4*Math.sin(.5*a),-h,h),c.target=i(3*Math.cos(.37*a),-d,d)):(s.target=0,c.target=0);let e=Math.min(1,2*n);l.px+=(.5-l.px)*e,l.py+=(.5-l.py)*e}B(c.step(n),s.step(n)),e=requestAnimationFrame(r)};return e=requestAnimationFrame(r),()=>cancelAnimationFrame(e)},[z,B]),a.useEffect(()=>{if(!F)return;let{sx:e,sy:t}=X.current;e.x=e.target=-6,t.x=t.target=8,e.v=0,t.v=0,q.current={px:.62,py:.3,hovering:!1},B(-6,8)},[F,B]);let O=a.useCallback(e=>{if(I.current.staticMode)return;let t=S.current;if(!t)return;let a=t.getBoundingClientRect();if(0===a.width||0===a.height)return;let r=i((e.clientX-a.left)/a.width,0,1),o=i((e.clientY-a.top)/a.height,0,1),n=q.current;n.px=r,n.py=o,n.hovering=!0;let{maxX:c,maxY:s}=I.current;X.current.sy.target=(r-.5)*2*s,X.current.sx.target=-(2*(o-.5))*c},[]),Y=a.useCallback(()=>{q.current.hovering=!1},[]),K=a.useCallback(e=>{if(I.current.staticMode)return;let{sx:t,sy:a}=X.current,{maxX:r,maxY:o}=I.current,n=!0;"ArrowLeft"===e.key?a.target=Math.max(-o,a.target-4):"ArrowRight"===e.key?a.target=Math.min(o,a.target+4):"ArrowUp"===e.key?t.target=Math.min(r,t.target+4):"ArrowDown"===e.key?t.target=Math.max(-r,t.target-4):"Escape"===e.key?(t.target=0,a.target=0):n=!1,n&&(q.current.hovering=!0,e.preventDefault())},[]),U=function(e){if("none"===e)return;let t="repeating-linear-gradient(115deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 5px)",a="at calc(var(--hc-px, 0.5) * 100%) calc(var(--hc-py, 0.5) * 100%)";return"azure"===e?`${t}, conic-gradient(from 210deg ${a}, var(--hc-accent) 0deg, var(--hc-accent-text) 120deg, var(--hc-accent) 240deg, var(--hc-accent-text) 360deg)`:`${t}, conic-gradient(from 210deg ${a}, var(--hc-accent) 0deg, var(--hc-cyan) 90deg, color-mix(in srgb, var(--hc-cyan) 52%, #ffffff) 160deg, var(--hc-accent) 230deg, color-mix(in srgb, var(--hc-accent) 78%, #000000) 300deg, var(--hc-accent) 360deg)`}(f);return(0,t.jsxs)("div",{ref:N,"data-motion":F?"static":"animated","data-paused":R?"true":"false",className:"hc"+(w?" "+w:""),style:{perspective:"1100px",...M},onPointerMove:O,onPointerDown:O,onPointerLeave:Y,onPointerCancel:Y,onPointerUp:e=>{"mouse"!==e.pointerType&&Y()},...j,children:[(0,t.jsx)(d,{}),p?(0,t.jsx)("div",{ref:P,"aria-hidden":"true",className:"hc__shadow"}):null,(0,t.jsxs)("div",{ref:S,role:"group","aria-label":v,"aria-describedby":k,tabIndex:0,onKeyDown:K,onBlur:Y,className:"hc__card",style:{aspectRatio:g>0?String(g):void 0},children:[U?(0,t.jsx)("div",{"aria-hidden":"true",className:"hc__foil",style:{background:U}}):null,(0,t.jsx)("div",{className:"hc__body",children:e}),m?(0,t.jsx)("div",{"aria-hidden":"true",className:"hc__glare"}):null]}),(0,t.jsx)("span",{id:k,className:"hc__hint",children:"Use as setas para inclinar o cartão e o Esc para deixá-lo reto."})]})}let u=`
    --hc-accent: #315fea; /* o azul da folha */
    --hc-accent-text: #244fd1; /* o segundo azul da folha (e o de textos de destaque) */
    --hc-cyan: #009fb3; /* o ciano da folha "spectral" */
    --hc-surface: #ffffff; /* o miolo do cart\xe3o */
    --hc-surface-2: #f8fafd; /* os cantos do cart\xe3o */
    --hc-border: #c5d1e1; /* a borda */
    --hc-fg: #101828; /* para o conte\xfado: o texto principal */
    --hc-muted: #667085; /* para o conte\xfado: o texto apagado */
    --hc-blend: soft-light; /* como a folha se mistura com o cart\xe3o */
    --hc-foil-o: 0.5; /* a for\xe7a da folha */
    --hc-glare: rgba(255, 255, 255, 0.75); /* a cor do brilho */
    --hc-shadow: rgba(16, 24, 40, 0.22); /* a sombra no ch\xe3o */
    --hc-stroke: rgba(255, 255, 255, 0.85); /* o fio de luz na borda de cima */`,f=`
    --hc-accent: #4f7cff;
    --hc-accent-text: #7f9fff;
    --hc-cyan: #22c7d9;
    --hc-surface: #111827;
    --hc-surface-2: #192337;
    --hc-border: #354863;
    --hc-fg: #f8fafc;
    --hc-muted: #9caabd;
    --hc-blend: color-dodge;
    --hc-foil-o: 0.32;
    --hc-glare: rgba(255, 255, 255, 0.5);
    --hc-shadow: rgba(2, 5, 12, 0.65);
    --hc-stroke: rgba(255, 255, 255, 0.16);`,m=`
/* o que o projeto pode trocar com uma classe (posi\xe7\xe3o, margem, largura e as vari\xe1veis): na camada base, que vem antes
   das classes de componente e dos utilit\xe1rios (Tailwind v4, Panda, Chakra) e perde para o CSS fora de camada
   (Tailwind v3, CSS Modules, CSS comum). O tema: claro, escuro com o sistema no escuro, e a classe ou o data-theme no
   cart\xe3o ou num pai decide */
@layer base {
  .hc {${u}
    position: relative;
    width: 100%;
  }
  @media (prefers-color-scheme: dark) {
    .hc {${f}
    }
  }
  :is(.dark, [data-theme="dark"]) .hc, .hc:is(.dark, [data-theme="dark"]) {${f}
  }
  :is(.light, [data-theme="light"]) .hc, .hc:is(.light, [data-theme="light"]) {${u}
  }
}
.hc__shadow {
  position: absolute;
  right: 8%;
  bottom: -26px;
  left: 8%;
  height: 44px;
  border-radius: 50%;
  background: radial-gradient(50% 50% at 50% 50%, var(--hc-shadow), transparent 70%);
  pointer-events: none;
  will-change: transform;
}
/* o cart\xe3o achata o 3D dele (overflow: hidden), ent\xe3o a folha e o brilho se misturam com o fundo do pr\xf3prio cart\xe3o */
.hc__card {
  box-sizing: border-box;
  position: relative;
  width: 100%;
  overflow: hidden;
  border: 1px solid var(--hc-border);
  border-radius: 16px;
  outline: none;
  background: linear-gradient(145deg, var(--hc-surface-2), var(--hc-surface) 55%, var(--hc-surface-2));
  box-shadow: inset 0 1px 0 var(--hc-stroke);
  transform-style: preserve-3d;
  will-change: transform;
  /* o dedo inclina o cart\xe3o em vez de rolar a p\xe1gina */
  touch-action: none;
  -webkit-user-select: none;
  user-select: none;
}
.hc__card:focus-visible {
  outline: 2px solid var(--hc-accent);
  outline-offset: 2px;
}
.hc__foil, .hc__glare {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  transform: translateZ(0);
}
.hc__foil {
  mix-blend-mode: var(--hc-blend);
  opacity: var(--hc-foil-o);
  filter: hue-rotate(calc(var(--hc-hue, 0) * 1deg)) saturate(1.25);
}
.hc__glare {
  background: radial-gradient(200px circle at calc(var(--hc-px, 0.5) * 100%) calc(var(--hc-py, 0.5) * 100%), var(--hc-glare), transparent 65%);
  mix-blend-mode: screen;
  opacity: var(--hc-glare-o, 0.35);
}
.hc__body {
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  height: 100%;
  padding: 20px;
  transform: translateZ(1px);
}
/* a dica das setas: s\xf3 para o leitor de tela */
.hc__hint {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
@media (forced-colors: active) {
  .hc__foil, .hc__glare, .hc__shadow { display: none; }
}
`;function p(){return(0,t.jsxs)("div",{className:"hc-demo",children:[(0,t.jsx)("style",{dangerouslySetInnerHTML:{__html:x}}),(0,t.jsx)("div",{"data-theme":"dark",className:"hc-demo__frame",children:(0,t.jsxs)(h,{maxTilt:16,aspect:1.586,label:"Passe de membro",children:[(0,t.jsxs)("div",{className:"hc-demo__row",children:[(0,t.jsx)("span",{className:"hc-demo__brand",children:"Órbita"}),(0,t.jsx)("span",{className:"hc-demo__chip",children:"Holo"})]}),(0,t.jsxs)("div",{children:[(0,t.jsx)("p",{className:"hc-demo__title",children:"Holo Card"}),(0,t.jsx)("p",{className:"hc-demo__text",children:"Passe o mouse ou o dedo pelo cartão."})]}),(0,t.jsxs)("div",{className:"hc-demo__foot",children:[(0,t.jsx)("span",{className:"hc-demo__serial",children:"0001 / 2026"}),(0,t.jsx)("span",{children:"Membro fundador"})]})]})})]})}let x=`
.hc-demo {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 100%;
  min-height: 100svh;
  padding: 40px;
  overflow: hidden;
  background: #080c14;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", Arial, sans-serif;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: normal;
  text-align: left;
  -webkit-font-smoothing: auto;
  -moz-osx-font-smoothing: auto;
}
.hc-demo__frame {
  width: 360px;
  max-width: 100%;
}
.hc-demo__row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}
.hc-demo__brand {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--hc-muted);
}
.hc-demo__chip {
  box-sizing: border-box;
  padding: 2px 8px;
  border: 1px solid var(--hc-border);
  border-radius: 999px;
  font-size: 10px;
  font-weight: 500;
  color: var(--hc-accent-text);
}
.hc-demo__title {
  margin: 0;
  font-size: 24px;
  line-height: calc(2 / 1.5);
  font-weight: 600;
  letter-spacing: -0.025em;
  color: var(--hc-fg);
}
.hc-demo__text {
  margin: 4px 0 0;
  font-size: 14px;
  line-height: calc(1.25 / 0.875);
  color: var(--hc-muted);
}
.hc-demo__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  color: var(--hc-muted);
}
.hc-demo__serial {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  letter-spacing: 0.1em;
}
`;var g=e.i(909315);let v=[{at:0,o:0},{at:.5,o:1},{at:1.4,card:[.78,.74],o:1},{at:2.6,card:[.16,.22],o:1},{at:3.7,card:[.86,.2],o:1},{at:4.9,card:[.24,.8],o:1},{at:5.9,card:[.56,.48],o:1},{at:6.7,card:[.56,.48],o:1},{at:7.6,o:0},{at:10,o:0}],b=v[v.length-1].at,y=[.62,.3];e.s(["default",0,function({mode:e}){let r=(0,a.useRef)(null),o=(0,a.useRef)(null);return((0,a.useEffect)(()=>{if("tile"===e){var t,a;let e,n,i,c,s,l,d,h,u,f,m,p;return t=r.current,a=o.current,e=matchMedia("(prefers-reduced-motion: reduce)").matches,n=t.closest(".preview"),i=!1,c=NaN,s=NaN,l=0,d=0,h=0,u=(e,a,r,o)=>e.dispatchEvent(new PointerEvent(a,{bubbles:!0,cancelable:!0,composed:!0,clientX:r,clientY:o,pointerId:1,pointerType:"mouse",isPrimary:!0,relatedTarget:t})),f=r=>{l+=Math.min(100,r-d),d=r;let o=l/1e3;!e&&o>=b&&(l-=1e3*b,o-=b),(r=>{let o,n=t.getBoundingClientRect();if(!n.width||!t.offsetWidth)return;let l=n.width/t.offsetWidth,d=t.querySelector(".hc"),h=t.querySelector(".hc__card"),f=d?.getBoundingClientRect(),m=(e,t,a)=>({x:(e.left+e.width*t-n.left)/l,y:(e.top+e.height*a-n.top)/l}),p={x:t.offsetWidth-14,y:t.offsetHeight-10},x=e=>e.card&&f?.width?m(f,...e.card):p;if(e)o={...f?.width?m(f,...y):p,o:1};else{let e,t=1;for(;t<v.length-1&&v[t].at<r;)t++;let a=v[t-1],n=v[t],i=x(a),c=x(n),s=(e=Math.min(1,Math.max(0,(r-a.at)/(n.at-a.at||1))))<.5?4*e*e*e:1-(-2*e+2)**3/2;o={x:i.x+(c.x-i.x)*s,y:i.y+(c.y-i.y)*s,o:a.o+(n.o-a.o)*s}}a.style.transform=`translate3d(${o.x}px, ${o.y}px, 0)`,a.style.opacity=String(o.o);let g=n.left+o.x*l,b=n.top+o.y*l,_=!!(h&&f&&g>=f.left&&g<=f.right&&b>=f.top&&b<=f.bottom);h&&_&&!i&&u(h,"pointerover",g,b),h&&!_&&i&&u(h,"pointerout",g,b),i=_,h&&_&&(g!==c||b!==s)&&u(h,"pointermove",g,b),c=g,s=b})(o),h=requestAnimationFrame(f)},p=new MutationObserver(m=()=>{let e=!n||n.classList.contains("is-playing");e&&!h?(d=performance.now(),h=requestAnimationFrame(f)):!e&&h&&(cancelAnimationFrame(h),h=0)}),n&&p.observe(n,{attributes:!0,attributeFilter:["class"]}),m(),()=>{p.disconnect(),cancelAnimationFrame(h)}}},[e]),"stage"===e)?(0,t.jsx)("div",{className:g.default.stage,children:(0,t.jsx)(p,{})}):(0,t.jsxs)("div",{ref:r,className:`${g.default.stage} ${g.default.tile}`,"aria-hidden":"true",inert:!0,onPointerMove:e=>e.stopPropagation(),onPointerOver:e=>e.stopPropagation(),onPointerOut:e=>e.stopPropagation(),children:[(0,t.jsx)(p,{}),(0,t.jsx)("div",{ref:o,className:g.default.cursor,children:(0,t.jsx)("svg",{viewBox:"0 0 14 21",width:"18",height:"27",children:(0,t.jsx)("path",{d:"M1 1v15.5l3.8-3.6 2.8 6.5 2.5-1.1-2.7-6.3h5.2z"})})})]})}],179572)},935435,function(e){e.n(e.i(179572))}]);

//# debugId=537cbdf3-5195-23c0-fdb2-cdf333edd573