;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="4a65555b-cc78-af06-8210-12895e6c6a4f")}catch(e){}}();
(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,353568,e=>{e.v({single:"GlassFolder-module__e-iwlq__single",stage:"GlassFolder-module__e-iwlq__stage",tile:"GlassFolder-module__e-iwlq__tile"})},376750,e=>{"use strict";var t=e.i(843476),a=e.i(271645);let r={aurora:{style:"streak",colors:["#f4efe9","#e9c2b8","#c2433f","#2a1e2a","#22395e","#6f97c2","#e5edf4"],scale:.7,warp:1.4,angle:-.62,gloss:.18,veins:0},ember:{style:"marble",colors:["#07090c","#16252c","#3d5f68","#1a1416","#a3201a","#ef4a2b","#ff8a5c"],scale:.62,warp:3.2,angle:-.5,gloss:.55,veins:.6},dusk:{style:"marble",colors:["#120c18","#3e2850","#8f6c9c","#2b1a24","#b3502f","#eab08a","#fbe7d2"],scale:.75,warp:3.6,angle:.8,gloss:.5,veins:.5},glacier:{style:"streak",colors:["#f7f8fa","#d9e2ea","#9fb4c7","#e8edf2","#bccbd8","#ffffff"],scale:.7,warp:1.6,angle:.35,gloss:.25,veins:0},verdant:{style:"marble",colors:["#070b08","#173024","#4f7a5a","#141812","#a7843a","#e9cf87","#fbf3d6"],scale:.7,warp:3.4,angle:2.1,gloss:.5,veins:.5}};function o(e){let t=e>>>0;return()=>{let e=t=t+0x6d2b79f5>>>0;return e=Math.imul(e^e>>>15,1|e),(((e^=e+Math.imul(e^e>>>7,61|e))^e>>>14)>>>0)/0x100000000}}function n(e){let t=0x811c9dc5;for(let a=0;a<e.length;a++)t=Math.imul(t^e.charCodeAt(a),0x1000193);return t>>>0}let i=new Map,s=[],l=!1;function f({art:e,seed:n,w:g,h:d,density:p,priority:c,className:m}){let u=a.useRef(null),x=JSON.stringify("string"==typeof e?r[e]:e),h=Math.round(g*p),b=Math.round(d*p),v=x+"|"+n+"|"+h+"|"+b,[y,k]=a.useState(null);return a.useEffect(()=>{var e;let t,a,r=!0;return(e=JSON.parse(x),t=JSON.stringify([e,n,h,b]),!(a=i.get(t))&&(a=new Promise(t=>{let a,r,i,f,g,d,p,m,u,x,v,y,k,w,j,M,N,A,q,C,z,F,S,E,L,R,P=s.length;for(;P>1&&s[P-1].priority>c;)P--;s.splice(P,0,{job:(a=Math.max(1,Math.round(h)),r=Math.max(1,Math.round(b)),f=(i=e.colors.length>=2?e.colors:["#111111","#eeeeee"]).map((e,t)=>{let a,r;return{t:t/(i.length-1),c:(3===(a=e.trim().replace(/^#/,"")).length&&(a=a[0]+a[0]+a[1]+a[1]+a[2]+a[2]),[(r=/^[0-9a-f]{6}$/i.test(a)?parseInt(a,16):8421504)>>16&255,r>>8&255,255&r])}}),g=e.scale??.7,d=e.warp??3,p=e.gloss??.4,m=e.veins??0,u="streak"===e.style,x=function(e){let t=o(e),a=new Uint8Array(512),r=new Float32Array(512),n=[];for(let e=0;e<256;e++)n.push(e);for(let e=255;e>0;e--){let a=Math.floor(t()*(e+1)),r=n[e];n[e]=n[a],n[a]=r}for(let e=0;e<512;e++)a[e]=n[255&e];for(let e=0;e<256;e++){let a=t()*Math.PI*2;r[2*e]=Math.cos(a),r[2*e+1]=Math.sin(a)}let i=(e,t)=>{let o=Math.floor(e),n=Math.floor(t),i=e-o,s=t-n,l=255&o,f=255&n,g=2*a[l+a[f]],d=2*a[l+1+a[f]],p=2*a[l+a[f+1]],c=2*a[l+1+a[f+1]],m=r[g]*i+r[g+1]*s,u=r[d]*(i-1)+r[d+1]*s,x=r[p]*i+r[p+1]*(s-1),h=r[c]*(i-1)+r[c+1]*(s-1),b=i*i*i*(i*(6*i-15)+10);return m+b*(u-m)+s*s*s*(s*(6*s-15)+10)*(x-m+b*(h-x-u+m))};return(e,t,a)=>{let r=0,o=.5;for(let n=0;n<a;n++){r+=o*i(e,t);let a=1.6*e+1.2*t+7.1;t=-1.2*e+1.6*t+3.3,e=a,o*=.5}return r}}(977*n+13),y=50*(v=o(n+1))(),k=50*v(),j=Math.cos(w=(e.angle??0)+(v()-.5)*.5),M=Math.sin(w),N=Math.min(a,r),C=new Float32Array((A=Math.ceil(a/2)+3)*(q=Math.ceil(r/2)+3)),z=new Float32Array(A*q),F=new Float32Array(a*r),S=new Float32Array(a*r),E=new Uint8ClampedArray(a*r*4),L=0,R=e=>{for(let t=0;t<A;t++){let o=((t-1)*2-a/2)/N,n=((e-1)*2-r/2)/N,i=(o*j-n*M)*g,s=(o*M+n*j)*g;u&&(i*=.14,s*=2.2);let l=x(i+=y,s+=k,3),f=x(i+5.2,s+1.3,3),p=x(i+d*l+1.7,s+d*f+9.2,3),c=x(i+d*l+8.3,s+d*f+2.8,3);C[e*A+t]=x(i+d*p,s+d*c,4),z[e*A+t]=Math.sqrt(l*l+f*f)}},{width:a,height:r,pixels:E,step:e=>{if(L>=q)return!0;let t=Math.min(q,L+Math.max(1,e));for(;L<t;)R(L++);return!(L<q)&&((()=>{let e=(e,t,a,r)=>(-e+9*t+9*a-r)/16,t=new Float32Array(a*q);for(let r=0;r<q;r++){let o=r*A;for(let n=0;n<a;n++){let i=(n>>1)+1;t[r*a+n]=1&n?e(C[o+i-1],C[o+i],C[o+i+1],C[o+i+2]):C[o+i]}}for(let o=0;o<r;o++){let r=(o>>1)+1;for(let n=0;n<a;n++){F[o*a+n]=1&o?e(t[(r-1)*a+n],t[r*a+n],t[(r+1)*a+n],t[(r+2)*a+n]):t[r*a+n];let i=(n>>1)+1,s=z[r*A+i],l=1&n?(s+z[r*A+i+1])/2:s,f=1&o?1&n?(z[(r+1)*A+i]+z[(r+1)*A+i+1])/2:z[(r+1)*A+i]:l;S[o*a+n]=(l+f)/2}}})(),(()=>{let e=[],t=Math.max(1,Math.floor(F.length/4096));for(let a=0;a<F.length;a+=t)e.push(F[a]);e.sort((e,t)=>e-t);let o=e[Math.floor(.02*e.length)],n=1/(e[Math.floor(.98*e.length)]-o||1),i=n*N*.012;for(let e=0;e<r;e++)for(let t=0;t<a;t++){let s=e*a+t,l=(F[s]-o)*n;l=l<0?0:l>1?1:l;let g=1;for(;g<f.length-1&&f[g].t<l;)g++;let d=f[g-1],c=f[g],u=(l-d.t)/(c.t-d.t||1);u=(u=u<0?0:u>1?1:u)*u*(3-2*u);let x=(F[t<a-1?s+1:s]-F[t>0?s-1:s])*i,h=(F[e<r-1?s+a:s]-F[e>0?s-a:s])*i,b=(-(-.55*x)- -.65*h+.52)/Math.sqrt(x*x+h*h+1),v=Math.pow(b>0?b:0,24)*p*255,y=(.82+.28*b)*(1+.035*Math.sin(150*l+24*S[s]))*(1-m*Math.max(0,1-14*Math.abs(S[s]-.42))*.6);E[4*s]=(d.c[0]+(c.c[0]-d.c[0])*u)*y+v,E[4*s+1]=(d.c[1]+(c.c[1]-d.c[1])*u)*y+v,E[4*s+2]=(d.c[2]+(c.c[2]-d.c[2])*u)*y+v,E[4*s+3]=255}})(),!0)}}),priority:c,done:t}),function(){if(l)return;l=!0;let e=()=>{let t=performance.now()+7;for(;s.length&&performance.now()<t;){let e=s[0];if(e.job.step(4)){s.shift();let t=document.createElement("canvas");t.width=e.job.width,t.height=e.job.height;let a=t.getContext("2d");if(a){let r=a.createImageData(t.width,t.height);r.data.set(e.job.pixels),a.putImageData(r,0,0)}e.done(t)}}s.length?requestAnimationFrame(e):l=!1};requestAnimationFrame(e)}()}),i.set(t,a)),a).then(e=>{let t=u.current;r&&t&&(t.width=e.width,t.height=e.height,t.getContext("2d")?.drawImage(e,0,0),k(x+"|"+n+"|"+h+"|"+b))}),()=>{r=!1}},[x,n,h,b,c]),(0,t.jsx)("canvas",{ref:u,"aria-hidden":"true",className:m,"data-ready":y===v||void 0,style:{width:g,height:d,maxWidth:"none"}})}let g="M0 56A22 22 0 0 1 22 34L146 34C170 34 172 0 198 0L318 0A22 22 0 0 1 340 22L340 250A22 22 0 0 1 318 272L22 272A22 22 0 0 1 0 250Z",d="M0 22A22 22 0 0 1 22 0L118 0C144 0 146 32 172 32L318 32A22 22 0 0 1 340 54L340 176A22 22 0 0 1 318 198L22 198A22 22 0 0 1 0 176Z",p=[{name:"Capa — final",meta:"PNG · 4,8 MB",art:"ember"},{name:"Moodboard",meta:"24 imagens",art:"dusk"},{name:"Briefing.pdf",meta:"PDF · 1,2 MB"}],c=e=>e+(1===e?" item":" itens");function m({label:e="Meus arquivos",meta:r,tone:i="light",art:s="aurora",seed:l=3,image:x,files:h=p,action:b="add",onAdd:v,onFilesChange:y,menu:k=[],labelPlacement:w="bottom-left",open:j,defaultOpen:M=!1,onOpenChange:N,onFileSelect:A,width:q=340,appear:C=!0,appearDelay:z=0,className:F,style:S}){let E=a.useId().replace(/:/g,""),L=a.useRef(null),R=a.useRef(null),P=a.useRef(null),D=a.useRef(null),_=a.useRef(null),[I,T]=a.useState(()=>h.map((e,t)=>({file:e,id:t}))),B=a.useRef(h.length),[O,U]=a.useState(null),[G,K]=a.useState(0),[X,Y]=a.useState(M),H=j??X,J=a.useCallback(e=>{void 0===j&&Y(e),N?.(e)},[j,N]),[$,W]=a.useState(!1),[Z,Q]=a.useState(!C),V=q/340,ee=Math.min(1.5,Math.max(1,window.devicePixelRatio||1))*V;a.useEffect(()=>{if(!C)return;let e=L.current,t=0;if(!e||"u"<typeof IntersectionObserver)return t=window.setTimeout(()=>Q(!0),z),()=>window.clearTimeout(t);let a=new IntersectionObserver(e=>{e.some(e=>e.isIntersecting)&&(a.disconnect(),t=window.setTimeout(()=>Q(!0),z))},{threshold:.25});return a.observe(e),()=>{a.disconnect(),window.clearTimeout(t)}},[C,z]),a.useEffect(()=>{let e=L.current;if(!e)return;let t=0,a=0,r=0,o=()=>{t=0,e.style.setProperty("--gf-px",a.toFixed(3)),e.style.setProperty("--gf-py",r.toFixed(3))},n=n=>{if("touch"===n.pointerType)return;let i=e.getBoundingClientRect();a=(n.clientX-i.left)/i.width*2-1,r=(n.clientY-i.top)/i.height*2-1,t||(t=requestAnimationFrame(o))},i=()=>{a=0,r=0,t||(t=requestAnimationFrame(o))};return e.addEventListener("pointermove",n),e.addEventListener("pointerleave",i),()=>{e.removeEventListener("pointermove",n),e.removeEventListener("pointerleave",i),cancelAnimationFrame(t)}},[]),a.useEffect(()=>{R.current?.toggleAttribute("inert",!H)},[H]),a.useEffect(()=>{if(!H&&!$)return;let e=e=>{if("Escape"!==e.key)return;let t=document.activeElement;(!t||L.current?.contains(t)||t.contains(L.current))&&(e.preventDefault(),$?(W(!1),D.current?.focus()):(J(!1),P.current?.focus()))},t=e=>{let t=e.target;!$||_.current?.contains(t)||D.current?.contains(t)||W(!1),!H||$||L.current?.contains(t)||J(!1)};return document.addEventListener("keydown",e),document.addEventListener("pointerdown",t),()=>{document.removeEventListener("keydown",e),document.removeEventListener("pointerdown",t)}},[H,$,J]),a.useEffect(()=>{$&&_.current?.querySelector("[role=menuitem]")?.focus()},[$]);let et=I.map(e=>e.file),ea=[{label:H?"Fechar pasta":"Abrir pasta",onSelect:()=>J(!H)},...k],er=Math.max(0,I.length-4),eo=I.slice(er),en=I.length,ei=r??c(en);return(0,t.jsxs)("div",{ref:L,className:"gf-root"+(F?" "+F:""),"data-tone":i,"data-open":H||void 0,"data-entered":Z||void 0,"data-place":w,style:{width:q,height:326*V,...S},children:[(0,t.jsx)("style",{dangerouslySetInnerHTML:{__html:u}}),(0,t.jsx)("div",{className:"gf-stage",style:{transform:"translateY("+54*V+"px) scale("+V+")"},children:(0,t.jsxs)("div",{className:"gf-body",children:[(0,t.jsx)("div",{className:"gf-shadow","aria-hidden":"true"}),(0,t.jsxs)("div",{className:"gf-back",style:{clipPath:"path('"+g+"')"},"aria-hidden":"true",children:[x?(0,t.jsx)("img",{className:"gf-art",src:x,alt:"",width:364,height:296,draggable:!1}):"none"!==s?(0,t.jsx)(f,{className:"gf-art",art:s,seed:l,w:364,h:296,density:ee,priority:0}):null,(0,t.jsx)("div",{className:"gf-back-sheen"})]}),(0,t.jsx)("svg",{className:"gf-rim gf-back-rim",viewBox:"0 0 340 272","aria-hidden":"true",children:(0,t.jsx)("path",{d:g})}),(0,t.jsxs)("div",{className:"gf-front"+(G?" gf-front--bump":""),style:{clipPath:"path('"+d+"')"},children:[(0,t.jsx)("div",{className:"gf-tint","aria-hidden":"true"}),(0,t.jsx)("div",{className:"gf-spec","aria-hidden":"true"}),(0,t.jsxs)("svg",{className:"gf-rim gf-front-rim",viewBox:"0 0 340 198","aria-hidden":"true",children:[(0,t.jsx)("defs",{children:(0,t.jsxs)("linearGradient",{id:"gf-rim-"+E,x1:"0",y1:"0",x2:"0",y2:"1",children:[(0,t.jsx)("stop",{offset:"0",stopColor:"#fff",stopOpacity:"0.95"}),(0,t.jsx)("stop",{offset:"0.35",stopColor:"#fff",stopOpacity:"0.35"}),(0,t.jsx)("stop",{offset:"1",stopColor:"#fff",stopOpacity:"0.12"})]})}),(0,t.jsx)("path",{d:d,stroke:"url(#gf-rim-"+E+")"})]}),(0,t.jsx)("button",{ref:P,type:"button",className:"gf-hit","aria-expanded":H,"aria-label":(H?"Fechar ":"Abrir ")+e+", "+c(en),onClick:()=>{W(!1),J(!H)}}),(0,t.jsxs)("div",{className:"gf-label",children:[(0,t.jsx)("span",{className:"gf-title",children:e}),(0,t.jsx)("span",{className:"gf-meta",children:ei},ei)]})]},G),(0,t.jsx)("div",{ref:R,className:"gf-files",role:"list","aria-label":"Conteúdo de "+e,children:eo.map(({file:e,id:a},r)=>{var i;let s=(i=eo.length)<=1?0:r/(i-1)*2-1,l=o(n(e.name)+a),g=!!(e.art||e.image),d=(0,t.jsxs)(t.Fragment,{children:[g?e.image?(0,t.jsx)("img",{className:"gf-sheet-art",src:e.image,alt:"",width:272,height:184,draggable:!1}):(0,t.jsx)(f,{className:"gf-sheet-art",art:e.art,seed:n(e.name)%997,w:272,h:184,density:Math.min(ee,1.25),priority:1}):(0,t.jsxs)("span",{className:"gf-lines","aria-hidden":"true",children:[(0,t.jsx)("i",{style:{width:"86%"}}),(0,t.jsx)("i",{style:{width:"92%"}}),(0,t.jsx)("i",{style:{width:"64%"}}),(0,t.jsx)("i",{style:{width:"88%"}}),(0,t.jsx)("i",{style:{width:"42%"}})]}),(0,t.jsxs)("span",{className:"gf-sheet-head",children:[(0,t.jsx)("span",{className:"gf-sheet-name",children:e.name}),e.meta?(0,t.jsx)("span",{className:"gf-sheet-meta",children:e.meta}):null]})]}),p={className:"gf-sheet"+(g?" gf-sheet--art":"")+(a===O?" gf-sheet--drop":""),style:{"--gf-slot":s,"--gf-depth":eo.length-1-r,"--gf-jx":((l()-.5)*10).toFixed(2)+"px","--gf-jr":((l()-.5)*3.2).toFixed(2)+"deg",zIndex:r+1},onAnimationEnd:a===O?()=>U(null):void 0};return(0,t.jsx)("div",{role:"listitem",className:"gf-sheet-slot",children:e.href?(0,t.jsx)("a",{...p,href:e.href,onClick:()=>A?.(e,er+r),children:d}):(0,t.jsx)("button",{...p,type:"button",onClick:()=>A?.(e,er+r),children:d})},a)})}),"none"!==b?(0,t.jsx)("button",{ref:D,type:"button",className:"gf-key gf-key--"+b,"aria-label":"add"===b?"Adicionar arquivo em "+e:"Mais opções de "+e,"aria-haspopup":"more"===b?"menu":void 0,"aria-expanded":"more"===b?$:void 0,"aria-controls":"more"===b?"gf-menu-"+E:void 0,onClick:()=>{let e,t;return"add"===b?(e=v?.(et)||{name:"Sem título "+(et.length+1),meta:"Agora"},void(T([...I,{file:e,id:t=B.current++}]),U(t),K(e=>e+1),y?.([...et,e]))):W(e=>!e)},children:"add"===b?(0,t.jsx)("svg",{className:"gf-glyph gf-glyph--plus",viewBox:"0 0 24 24","aria-hidden":"true",children:(0,t.jsx)("path",{d:"M12 4.5v15M4.5 12h15"})},G):(0,t.jsxs)("svg",{className:"gf-glyph gf-glyph--more",viewBox:"0 0 30 12","aria-hidden":"true",children:[(0,t.jsx)("rect",{x:"1",y:"1.5",width:"8",height:"9",rx:"3.4"}),(0,t.jsx)("rect",{x:"11",y:"1.5",width:"8",height:"9",rx:"3.4"}),(0,t.jsx)("rect",{x:"21",y:"1.5",width:"8",height:"9",rx:"3.4"})]})}):null,"more"===b?(0,t.jsx)("div",{ref:_,id:"gf-menu-"+E,role:"menu","aria-label":"Opções de "+e,className:"gf-menu","data-open":$||void 0,onKeyDown:e=>{let t=Array.from(_.current?.querySelectorAll("[role=menuitem]")??[]),a=t.indexOf(document.activeElement),r=a=>{e.preventDefault(),t[(a+t.length)%t.length]?.focus()};"ArrowDown"===e.key?r(a+1):"ArrowUp"===e.key?r(a-1):"Home"===e.key?r(0):"End"===e.key?r(t.length-1):"Tab"===e.key&&W(!1)},children:ea.map((e,a)=>(0,t.jsx)("button",{type:"button",role:"menuitem",tabIndex:$?-1:void 0,disabled:!$,className:"gf-menu-item"+(e.danger?" gf-menu-item--danger":""),onClick:()=>{W(!1),D.current?.focus(),e.onSelect?.()},children:e.label},e.label+a))}):null]})})]})}let u=`
.gf-root {
  --gf-px: 0;
  --gf-py: 0;
  --gf-ease: cubic-bezier(.2, .8, .2, 1);
  --gf-spring: cubic-bezier(.34, 1.36, .5, 1);
  --gf-hinge: 0deg;
  --gf-lift: 42px;
  --gf-spread: 0px;
  --gf-fan: 0deg;
  --gf-stack: 15px;
  --gf-ink: #141416;
  --gf-ink-soft: rgba(20, 20, 22, .55);
  position: relative;
  display: inline-block;
  flex: none;
  vertical-align: top;
  /* nada de texto herdado da p\xe1gina: a pasta fica igual em qualquer projeto */
  font-family: ui-sans-serif, system-ui, -apple-system, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-weight: 400;
  font-style: normal;
  font-variant: normal;
  font-feature-settings: normal;
  font-variation-settings: normal;
  line-height: 1.5;
  letter-spacing: normal;
  word-spacing: normal;
  text-align: left;
  text-transform: none;
  text-indent: 0;
  text-rendering: auto;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-tap-highlight-color: transparent;
  isolation: isolate;
}
/* dentro de um card ou modal com cantos arredondados e overflow: hidden, o Chrome (e os outros Chromium) desfoca o
   ret\xe2ngulo inteiro do vidro, por cima dos arquivos, em vez da forma da pasta. Um filtro neutro faz da pasta a raiz do
   desfoque, e o vidro volta a seguir a forma. S\xf3 no Chromium: o Safari e o Firefox ficam como est\xe3o */
@supports (-webkit-app-region: drag) and (not (font: -apple-system-body)) {
  .gf-root { filter: opacity(1); }
}
.gf-root, .gf-root *, .gf-root *::before, .gf-root *::after { box-sizing: border-box; }
.gf-root * { margin: 0; }
.gf-root[data-tone="dark"] { --gf-ink: #f5f5f7; --gf-ink-soft: rgba(245, 245, 247, .58); }
/* a inclina\xe7\xe3o vem com o mouse em cima ou com o foco do teclado; no toque o :hover ficaria preso depois do toque */
@media (hover: hover) { .gf-root:hover { --gf-hinge: -11deg; --gf-lift: -34px; --gf-spread: 8px; --gf-fan: 1.4deg; --gf-stack: 10px; } }
.gf-root:has(:focus-visible) { --gf-hinge: -11deg; --gf-lift: -34px; --gf-spread: 8px; --gf-fan: 1.4deg; --gf-stack: 10px; }
.gf-root[data-open] { --gf-hinge: -24deg; --gf-lift: -96px; --gf-spread: 40px; --gf-fan: 5deg; --gf-stack: 30px; }

.gf-stage {
  position: absolute;
  left: 0;
  top: 0;
  width: 340px;
  height: 272px;
  transform-origin: 0 0;
}
/* sem 3D aqui: o vidro da frente j\xe1 \xe9 3D (a dobradi\xe7a), e um segundo 3D em volta dele faz o Chrome desfocar o
   ret\xe2ngulo inteiro do vidro, por cima dos arquivos, em vez de s\xf3 a forma da pasta */
.gf-body {
  position: absolute;
  inset: 0;
}

.gf-shadow {
  position: absolute;
  left: 18px;
  right: 18px;
  bottom: -6px;
  height: 60px;
  border-radius: 40px;
  background: rgba(16, 18, 24, .34);
  filter: blur(22px);
  transform: translateX(calc(var(--gf-px) * -8px));
  transition: transform .9s var(--gf-ease), opacity .9s var(--gf-ease);
}
.gf-root[data-tone="dark"] .gf-shadow { background: rgba(0, 0, 0, .62); }

.gf-back {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: linear-gradient(180deg, #f3f3f4 0%, #e3e3e6 100%);
}
.gf-root[data-tone="dark"] .gf-back { background: linear-gradient(180deg, #2a2a2e 0%, #121214 100%); }
.gf-art {
  position: absolute;
  left: -12px;
  top: -12px;
  max-width: none;
  object-fit: cover;
  transform: translate(calc(var(--gf-px) * -7px), calc(var(--gf-py) * -6px)) scale(1.02);
  transition: transform 1.1s var(--gf-ease), opacity 1.2s var(--gf-ease), filter 1.2s var(--gf-ease);
}
canvas.gf-art { opacity: 0; filter: blur(14px) saturate(.6); }
canvas.gf-art[data-ready] { opacity: 1; filter: none; }
.gf-back-sheen {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, .22) 0%, rgba(255, 255, 255, 0) 22%),
    radial-gradient(120% 80% at 80% 0%, rgba(255, 255, 255, .16), rgba(255, 255, 255, 0) 60%);
  pointer-events: none;
}

.gf-rim {
  position: absolute;
  left: 0;
  top: 0;
  max-width: none;
  overflow: visible;
  pointer-events: none;
  fill: none;
}
.gf-back-rim { width: 340px; height: 272px; }
.gf-back-rim path { stroke: rgba(255, 255, 255, .45); stroke-width: 1; }
.gf-root[data-tone="dark"] .gf-back-rim path { stroke: rgba(255, 255, 255, .16); }

/* ---- arquivos --------------------------------------------------------------- */
.gf-files {
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none;
  /* nada pendura para fora do fundo do bolso, por mais alta que seja a pilha */
  clip-path: inset(-400px -400px 10px -400px);
}
.gf-sheet-slot { display: contents; }
.gf-sheet {
  all: unset;
  box-sizing: border-box;
  position: absolute;
  left: 34px;
  top: 96px;
  width: 272px;
  height: 184px;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  pointer-events: auto;
  background: linear-gradient(180deg, #ffffff 0%, #f2f2f0 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, .9),
    0 0 0 .5px rgba(0, 0, 0, .1),
    0 10px 26px -8px rgba(10, 12, 20, .28);
  transform-origin: 50% 100%;
  transform:
    translate(calc(var(--gf-jx) + var(--gf-slot) * var(--gf-spread)), calc(var(--gf-lift) + var(--gf-depth) * var(--gf-stack) * -1))
    rotate(calc(var(--gf-jr) + var(--gf-slot) * var(--gf-fan)));
  transition:
    transform .75s var(--gf-spring) calc(var(--gf-depth) * 40ms),
    box-shadow .4s var(--gf-ease),
    translate .9s var(--gf-ease),
    opacity .9s var(--gf-ease);
}
.gf-root[data-tone="dark"] .gf-sheet { background: linear-gradient(180deg, #2c2c30 0%, #1c1c1f 100%); box-shadow: inset 0 1px 0 rgba(255, 255, 255, .14), 0 0 0 .5px rgba(255, 255, 255, .08), 0 12px 28px -8px rgba(0, 0, 0, .7); }
.gf-sheet--art { background: #1a1a1d; }
.gf-root[data-open] .gf-sheet:hover,
.gf-root[data-open] .gf-sheet:focus-visible {
  transform:
    translate(calc(var(--gf-jx) + var(--gf-slot) * var(--gf-spread)), calc(var(--gf-lift) + var(--gf-depth) * var(--gf-stack) * -1 - 18px))
    rotate(calc(var(--gf-slot) * var(--gf-fan) * .6));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .9), 0 0 0 .5px rgba(0, 0, 0, .1), 0 22px 40px -12px rgba(10, 12, 20, .42);
  transition-delay: 0s;
}
.gf-sheet:focus-visible { outline: 2px solid #4c8dff; outline-offset: 2px; }
.gf-sheet-art {
  position: absolute;
  left: 0;
  top: 0;
  width: 272px;
  height: 184px;
  max-width: none;
  object-fit: cover;
  transition: opacity .9s var(--gf-ease), filter .9s var(--gf-ease);
}
canvas.gf-sheet-art { opacity: 0; filter: blur(10px); }
canvas.gf-sheet-art[data-ready] { opacity: 1; filter: none; }
.gf-sheet--art::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(180deg, rgba(0, 0, 0, .42) 0%, rgba(0, 0, 0, 0) 34%);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .2);
  pointer-events: none;
}
.gf-sheet-head {
  position: absolute;
  left: 14px;
  right: 14px;
  top: 11px;
  z-index: 1;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  white-space: nowrap;
}
.gf-sheet-name {
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12.5px;
  font-weight: 560;
  letter-spacing: -.005em;
  color: #18181b;
}
.gf-sheet-meta {
  flex: none;
  font-family: ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 10px;
  letter-spacing: .02em;
  color: rgba(24, 24, 27, .5);
}
.gf-root[data-tone="dark"] .gf-sheet-name, .gf-sheet--art .gf-sheet-name { color: #fafafa; }
.gf-root[data-tone="dark"] .gf-sheet-meta, .gf-sheet--art .gf-sheet-meta { color: rgba(250, 250, 250, .66); }
.gf-lines {
  position: absolute;
  left: 14px;
  right: 14px;
  top: 40px;
  display: flex;
  flex-direction: column;
  gap: 9px;
}
.gf-lines i {
  display: block;
  height: 5px;
  border-radius: 3px;
  background: rgba(24, 24, 27, .08);
}
.gf-lines i:first-child { height: 9px; margin-bottom: 4px; background: rgba(24, 24, 27, .14); }
.gf-root[data-tone="dark"] .gf-lines i { background: rgba(255, 255, 255, .08); }
.gf-root[data-tone="dark"] .gf-lines i:first-child { background: rgba(255, 255, 255, .16); }

.gf-sheet--drop { animation: gf-drop .85s var(--gf-ease) both; }
@keyframes gf-drop {
  0% { translate: 0 -190px; rotate: -9deg; opacity: 0; }
  35% { opacity: 1; }
  72% { translate: 0 10px; rotate: 1deg; }
  100% { translate: 0 0; rotate: 0deg; opacity: 1; }
}

/* ---- vidro da frente --------------------------------------------------------- */
.gf-front {
  position: absolute;
  left: 0;
  top: 74px;
  width: 340px;
  height: 198px;
  z-index: 10;
  -webkit-backdrop-filter: blur(22px) saturate(1.5);
  backdrop-filter: blur(22px) saturate(1.5);
  transform-origin: 50% 100%;
  transform: perspective(760px) rotateX(var(--gf-hinge));
  transition: transform .8s var(--gf-spring), translate 1s var(--gf-ease), opacity 1s var(--gf-ease);
}
.gf-front--bump { animation: gf-bump .7s var(--gf-ease) .38s both; }
@keyframes gf-bump {
  0% { scale: 1; }
  35% { scale: 1.018 .975; }
  70% { scale: .996 1.006; }
  100% { scale: 1; }
}
.gf-tint {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, .16) 0%, rgba(255, 255, 255, .5) 42%, rgba(252, 252, 252, .93) 100%);
}
.gf-root[data-tone="dark"] .gf-tint {
  background: linear-gradient(180deg, rgba(18, 18, 20, .18) 0%, rgba(14, 14, 16, .62) 46%, rgba(8, 8, 10, .94) 100%);
}
.gf-spec {
  position: absolute;
  inset: 0;
  background: radial-gradient(260px 200px at calc(50% + var(--gf-px) * 46%) calc(30% + var(--gf-py) * 40%), rgba(255, 255, 255, .5), rgba(255, 255, 255, 0) 70%);
  mix-blend-mode: soft-light;
  opacity: .9;
  transition: background-position .6s var(--gf-ease);
  pointer-events: none;
}
.gf-root[data-tone="dark"] .gf-spec { mix-blend-mode: screen; opacity: .16; }
.gf-front-rim { width: 340px; height: 198px; }
.gf-front-rim path { stroke-width: 2.4; transition: stroke-width .3s var(--gf-ease); }
.gf-root[data-tone="dark"] .gf-front-rim { opacity: .55; }

.gf-hit {
  all: unset;
  position: absolute;
  inset: 0;
  z-index: 1;
  cursor: pointer;
}
.gf-hit:focus-visible ~ .gf-label .gf-title { text-decoration: underline; text-decoration-thickness: 1.5px; text-underline-offset: 4px; }
.gf-front:has(.gf-hit:focus-visible) .gf-front-rim path { stroke-width: 5; }

.gf-label {
  position: absolute;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 200px;
  pointer-events: none;
  color: var(--gf-ink);
}
.gf-root[data-place="bottom-left"] .gf-label { left: 28px; bottom: 32px; }
.gf-root[data-place="top-left"] .gf-label { left: 28px; top: 34px; }
.gf-root[data-place="top-right"] .gf-label { right: 32px; top: 52px; align-items: flex-start; }
.gf-title {
  font-size: 18px;
  font-weight: 500;
  line-height: 1.15;
  letter-spacing: -.012em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.gf-meta {
  font-family: ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  letter-spacing: .03em;
  color: var(--gf-ink-soft);
  white-space: nowrap;
  animation: gf-roll .5s var(--gf-ease) both;
}
@keyframes gf-roll {
  from { opacity: 0; translate: 0 7px; filter: blur(3px); }
  to { opacity: 1; translate: 0 0; filter: blur(0); }
}

/* ---- a tecla: + ou \xb7\xb7\xb7 ------------------------------------------------------- */
.gf-key {
  all: unset;
  box-sizing: border-box;
  position: absolute;
  right: 22px;
  bottom: 22px;
  z-index: 12;
  width: 58px;
  height: 58px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: transform .35s var(--gf-spring), box-shadow .35s var(--gf-ease), background .35s var(--gf-ease);
}
.gf-key:hover { transform: translateY(-2px); }
.gf-key:active { transform: translateY(0) scale(.93); transition-duration: .12s; }
.gf-key:focus-visible { outline: 2px solid #4c8dff; outline-offset: 3px; }
.gf-key--add {
  color: #fff;
  background: radial-gradient(120% 90% at 50% 0%, #3a3a3f 0%, #121214 55%, #050506 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, .22),
    inset 0 -3px 8px rgba(0, 0, 0, .7),
    0 0 0 1px rgba(0, 0, 0, .75),
    0 14px 22px -8px rgba(0, 0, 0, .55),
    0 3px 6px -2px rgba(0, 0, 0, .35);
}
.gf-root[data-tone="dark"] .gf-key--add {
  color: #111113;
  background: radial-gradient(120% 90% at 50% 0%, #ffffff 0%, #ececee 55%, #d2d2d6 100%);
  box-shadow: inset 0 1px 0 #fff, inset 0 -3px 8px rgba(0, 0, 0, .14), 0 0 0 1px rgba(0, 0, 0, .4), 0 14px 22px -8px rgba(0, 0, 0, .7);
}
.gf-key--more {
  color: #111113;
  background: linear-gradient(180deg, rgba(255, 255, 255, .92) 0%, rgba(226, 226, 230, .82) 100%);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  box-shadow:
    inset 0 1px 0 #fff,
    inset 0 -2px 4px rgba(0, 0, 0, .06),
    0 0 0 1px rgba(0, 0, 0, .16),
    0 10px 18px -8px rgba(0, 0, 0, .3);
}
.gf-root[data-tone="dark"] .gf-key--more {
  color: #f5f5f7;
  background: linear-gradient(180deg, rgba(255, 255, 255, .16) 0%, rgba(255, 255, 255, .06) 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .22), 0 0 0 1px rgba(255, 255, 255, .1), 0 10px 18px -8px rgba(0, 0, 0, .6);
}
.gf-key--more[aria-expanded="true"] { transform: scale(.96); }
.gf-glyph { display: block; max-width: none; fill: none; stroke: currentColor; stroke-linecap: round; }
.gf-glyph--plus { width: 26px; height: 26px; stroke-width: 1.6; animation: gf-turn .6s var(--gf-spring); }
.gf-glyph--more { width: 30px; height: 12px; stroke-width: 1.7; }
@keyframes gf-turn { from { rotate: -90deg; } to { rotate: 0deg; } }

/* ---- menu ------------------------------------------------------------------- */
.gf-menu {
  position: absolute;
  right: 22px;
  bottom: 90px;
  z-index: 20;
  min-width: 176px;
  padding: 6px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  background: rgba(252, 252, 253, .72);
  -webkit-backdrop-filter: blur(24px) saturate(1.6);
  backdrop-filter: blur(24px) saturate(1.6);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .9), 0 0 0 .5px rgba(0, 0, 0, .14), 0 24px 48px -16px rgba(10, 12, 20, .4);
  transform-origin: 100% 100%;
  opacity: 0;
  visibility: hidden;
  transform: translateY(6px) scale(.94);
  transition: opacity .2s var(--gf-ease), transform .32s var(--gf-spring), visibility 0s .32s;
}
.gf-menu[data-open] { opacity: 1; visibility: visible; transform: none; transition-delay: 0s; }
.gf-root[data-tone="dark"] .gf-menu { background: rgba(30, 30, 34, .72); box-shadow: inset 0 1px 0 rgba(255, 255, 255, .1), 0 0 0 .5px rgba(255, 255, 255, .1), 0 24px 48px -16px rgba(0, 0, 0, .8); }
.gf-menu-item {
  all: unset;
  box-sizing: border-box;
  padding: 9px 12px;
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: 450;
  color: #18181b;
  cursor: pointer;
}
.gf-root[data-tone="dark"] .gf-menu-item { color: #f4f4f5; }
.gf-menu-item:hover, .gf-menu-item:focus-visible { background: rgba(24, 24, 27, .07); }
.gf-root[data-tone="dark"] .gf-menu-item:hover, .gf-root[data-tone="dark"] .gf-menu-item:focus-visible { background: rgba(255, 255, 255, .09); }
.gf-menu-item--danger { color: #d92d20; }
.gf-root[data-tone="dark"] .gf-menu-item--danger { color: #ff6b5e; }

/* ---- entrada: a pasta se monta sozinha --------------------------------------- */
.gf-root:not([data-entered]) .gf-back,
.gf-root:not([data-entered]) .gf-back-rim { translate: 0 22px; opacity: 0; }
.gf-root:not([data-entered]) .gf-sheet { translate: 0 -120px; opacity: 0; }
.gf-root:not([data-entered]) .gf-front { translate: 0 46px; opacity: 0; }
.gf-root:not([data-entered]) .gf-key { opacity: 0; scale: .6; }
.gf-root:not([data-entered]) .gf-shadow { opacity: 0; }
.gf-back, .gf-back-rim { transition: translate 1s var(--gf-ease), opacity .9s var(--gf-ease); }
.gf-root[data-entered] .gf-sheet { transition-delay: calc(var(--gf-depth) * 40ms), 0s, calc(.18s + var(--gf-depth) * 90ms), calc(.18s + var(--gf-depth) * 90ms); }
.gf-root[data-entered] .gf-front { transition-delay: 0s, .42s, .42s; }
.gf-key { transition: transform .35s var(--gf-spring), box-shadow .35s var(--gf-ease), opacity .6s var(--gf-ease) .7s, scale .7s var(--gf-spring) .7s; }

@media (prefers-reduced-motion: reduce) {
  .gf-root *, .gf-root *::before, .gf-root *::after {
    transition-duration: 0s !important;
    transition-delay: 0s !important;
    animation: none !important;
  }
}
`;function x(){return(0,t.jsxs)("div",{className:"gf-desk",children:[(0,t.jsx)("style",{dangerouslySetInnerHTML:{__html:h}}),(0,t.jsxs)("div",{className:"gf-desk-grid",children:[(0,t.jsx)(m,{label:"Meus arquivos",art:"aurora",seed:3,appearDelay:0}),(0,t.jsx)(m,{label:"Acervo",art:"none",action:"more",labelPlacement:"top-left",appearDelay:140,files:[{name:"Lookbook 2024",meta:"38 imagens",art:"dusk"},{name:"Notas fiscais",meta:"12 PDFs"},{name:"Ensaio — Lisboa",meta:"RAW · 2,1 GB",art:"ember"},{name:"Contrato.pdf",meta:"PDF · 320 KB"}],menu:[{label:"Renomear"},{label:"Compartilhar…"},{label:"Mover para o lixo",danger:!0}]}),(0,t.jsx)(m,{label:"Meus arquivos",meta:"Qua, 19 ago",tone:"dark",art:"ember",seed:11,action:"none",labelPlacement:"top-right",appearDelay:280,files:[{name:"Stills",meta:"64 imagens",art:"verdant"},{name:"Notas da edição",meta:"TXT · 4 KB"},{name:"Cor v3",meta:"DRX · 18 MB",art:"aurora"}]})]}),(0,t.jsx)("p",{className:"gf-desk-hint",children:"Passe o mouse para inclinar · Clique para abrir · + para adicionar"})]})}let h=`
.gf-desk {
  --gf-desk: #0d0d0f;
  --gf-desk-ink: #f4f4f5;
  --gf-desk-muted: rgba(244, 244, 245, .5);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 100%;
  min-height: 100svh;
  padding: 64px 24px;
  overflow: hidden;
  background: var(--gf-desk);
  color: var(--gf-desk-ink);
  /* nada de texto herdado da p\xe1gina: a mesa fica igual em qualquer projeto */
  font-weight: 400;
  font-style: normal;
  font-variant: normal;
  font-feature-settings: normal;
  font-variation-settings: normal;
  line-height: 1.5;
  letter-spacing: normal;
  word-spacing: normal;
  text-align: left;
  text-transform: none;
  text-indent: 0;
  text-rendering: auto;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  container-type: inline-size;
}
.gf-desk *, .gf-desk *::before, .gf-desk *::after { box-sizing: border-box; }
/* a mesa pontilhada */
.gf-desk::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: .13;
  background-image: radial-gradient(currentColor 1.1px, transparent 1.4px);
  background-size: 22px 22px;
}
/* uma coluna; duas quando cabem duas pastas lado a lado; tr\xeas quando cabem tr\xeas */
.gf-desk-grid {
  position: relative;
  display: grid;
  grid-template-columns: 1fr;
  align-items: end;
  justify-items: center;
  column-gap: 56px;
  row-gap: 40px;
  max-width: 1180px;
}
@container (min-width: 736px) { .gf-desk-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@container (min-width: 1180px) { .gf-desk-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.gf-desk-hint {
  position: relative;
  margin: 56px 0 0;
  text-align: center;
  font-family: ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11px;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: var(--gf-desk-muted);
}
`;var b=e.i(353568);e.s(["default",0,function({mode:e,compact:r}){let o=(0,a.useRef)(null);return((0,a.useEffect)(()=>{o.current?.querySelectorAll("button, a").forEach(e=>e.tabIndex=-1)},[]),"stage"!==e||r)?"stage"===e?(0,t.jsx)("div",{className:b.default.single,children:(0,t.jsx)(m,{label:"Meus arquivos",art:"aurora",seed:3})}):(0,t.jsx)("div",{ref:o,className:`${b.default.single} ${b.default.tile}`,"aria-hidden":"true",children:(0,t.jsx)(m,{label:"Meus arquivos",art:"aurora",seed:3})}):(0,t.jsx)("div",{className:b.default.stage,children:(0,t.jsx)(x,{})})}],376750)},531921,function(e){e.n(e.i(376750))}]);

//# debugId=4a65555b-cc78-af06-8210-12895e6c6a4f