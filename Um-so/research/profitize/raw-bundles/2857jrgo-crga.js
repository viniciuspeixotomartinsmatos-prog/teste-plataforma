;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="e38251f2-e113-643f-694d-211a9e6e35e0")}catch(e){}}();
(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,730799,e=>{e.v({cursor:"HoloTradingCard-module__nJenJG__cursor",on:"HoloTradingCard-module__nJenJG__on",ripple:"HoloTradingCard-module__nJenJG__ripple",stage:"HoloTradingCard-module__nJenJG__stage",tile:"HoloTradingCard-module__nJenJG__tile"})},962313,e=>{"use strict";var a=e.i(843476),t=e.i(271645),r=e.i(515470);let o=(e,a)=>e>a?a:e<-a?-a:e>0||e<0?e:0,i={pearl:0,silver:1,original:2,gold:3},n=`#version 300 es
void main() {
  // Um tri\xe2ngulo grande demais, n\xe3o um quad. O *2 importa: sem ele, os tr\xeas v\xe9rtices caem em (-1,-1) (1,-1) (-1,1)
  // e cobrem s\xf3 metade da tela, que aparece como uma carta cortada de canto a canto.
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2) * 2.0 - 1.0;
  gl_Position = vec4(p, 0.0, 1.0);
}
`,s=`#version 300 es
precision highp float;
out vec4 fragColor;

uniform vec2 uRes;
uniform vec3 uView;
uniform float uTime;
uniform float uFoil;
uniform float uFinish;
uniform float uDepth;
uniform float uBgDepth;
uniform float uHasArt;
uniform float uPattern;
uniform float uHasBg;
uniform sampler2D tArt;
uniform sampler2D tBg;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float inside(vec2 p) { return step(0.0, p.x) * step(0.0, p.y) * step(p.x, 1.0) * step(p.y, 1.0); }

// O vetor do olhar levado para o espa\xe7o da carta e dividido por uma componente normal com piso. Sem o piso, um
// \xe2ngulo rasante joga a camada para fora da carta.
vec2 parallax(vec2 uv, float depth) {
  return uv + uView.xy / max(abs(uView.z), 0.4) * depth * 0.10;
}

vec3 spectrum(float phase) {
  return 0.66 + 0.25 * cos(6.28318 * (phase + vec3(0.0, 0.33, 0.67)));
}

// O foil hologr\xe1fico de verdade \xe9 uma grade de difra\xe7\xe3o, ent\xe3o a cor se divide em faixas *ao longo* das ranhuras,
// em vez de passar lisa pela carta. Esta \xe9 a coordenada da grade: raios saindo do centro cruzados com an\xe9is.
float grating(vec2 uv) {
  vec2 p = (uv - vec2(0.5, 0.46)) * vec2(uRes.x / uRes.y, 1.0);
  // O coeficiente do \xe2ngulo tem de ser inteiro. O atan d\xe1 a volta de 2*pi no corte do ramo, ent\xe3o um multiplicador
  // fracion\xe1rio deixa ali uma fra\xe7\xe3o de volta de fase: uma emenda dura saindo do centro da carta.
  return atan(p.y, p.x) * 3.0 + length(p) * 6.0;
}

// A fase \xe9 fun\xe7\xe3o da dire\xe7\xe3o do olhar, n\xe3o do tempo. Com a carta parada, o arco-\xedris fica parado.
vec3 film(vec2 uv) {
  float phase = uv.x * 0.85 + uv.y * 0.55 + uView.x * 1.5 - uView.y * 0.9
    + grating(uv) * uPattern;
  if (uFinish > 2.5) {
    float hi = 0.5 + 0.5 * sin(phase * 6.28318);
    float glint = 0.5 + 0.5 * cos((phase + 0.25) * 6.28318);
    return mix(vec3(0.72, 0.50, 0.20), vec3(1.00, 0.90, 0.60), hi * 0.7 + glint * 0.3);
  }
  vec3 color = spectrum(phase);
  return mix(color, vec3(dot(color, vec3(0.2126, 0.7152, 0.0722))), step(0.5, uFinish));
}

// Uma faixa estreita que atravessa a carta conforme ela gira. A d\xe9cima pot\xeancia \xe9 o que a mant\xe9m uma faixa, e n\xe3o
// um v\xe9u.
float sweep(vec2 uv) {
  return pow(0.5 + 0.5 * sin((uv.x * 0.72 + uv.y * 0.45 + uView.x * 1.2 + uView.y * 0.6) * 6.283), 10.0);
}

// A frente gerada, para a carta sem arte pr\xf3pria: uma explos\xe3o de raios atr\xe1s de an\xe9is conc\xeantricos de guilhoch\xe9,
// que \xe9 o que vem impresso de fato embaixo da figura numa carta de foil.
vec3 generated(vec2 uv) {
  vec2 p = (uv - vec2(0.5, 0.46)) * vec2(uRes.x / uRes.y, 1.0) * 2.1;
  float r = length(p);
  float a = atan(p.y, p.x);

  // Escura e quase sem cor, de prop\xf3sito. Numa carta sem arte o foil tem de ser o espet\xe1culo inteiro, e n\xe3o d\xe1 se
  // a base j\xe1 for chamativa.
  vec3 col = mix(vec3(0.045, 0.035, 0.075), vec3(0.015, 0.012, 0.03), smoothstep(0.1, 1.4, r));

  // Raios finos saindo do centro: a grade, vis\xedvel. Finos e claros, para o espectro ter onde se apoiar n\xedtido.
  float rays = pow(0.5 + 0.5 * cos(a * 72.0), 8.0);
  col += vec3(0.55, 0.60, 0.80) * rays * smoothstep(1.45, 0.12, r) * 0.42;

  // An\xe9is conc\xeantricos num passo diferente, para os dois se cruzarem num moir\xe9.
  float rings = pow(0.5 + 0.5 * cos(r * 90.0), 8.0);
  col += vec3(0.45, 0.55, 0.85) * rings * smoothstep(1.5, 0.1, r) * 0.30;

  // Um halo claro onde a arte ficaria, para a composi\xe7\xe3o ter um centro.
  col += vec3(0.5, 0.42, 0.75) * smoothstep(0.60, 0.40, r) * 0.16;
  col += vec3(0.95, 0.90, 1.0) * (smoothstep(0.52, 0.49, r) - smoothstep(0.49, 0.46, r)) * 0.5;

  return col;
}

void main() {
  vec2 uv = vec2(gl_FragCoord.x / uRes.x, 1.0 - gl_FragCoord.y / uRes.y);

  vec2 bu = parallax(uv, uBgDepth);
  vec3 col = uHasBg > 0.5
    ? texture(tBg, clamp(bu, 0.0, 1.0)).rgb
    : generated(bu);

  if (uHasArt > 0.5) {
    // O assunto vem para a frente e um pouco maior, para parecer apoiado acima do fundo, e n\xe3o impresso nele.
    vec2 su = (parallax(uv, uDepth) - 0.5) / 1.06 + 0.5;
    vec4 art = texture(tArt, clamp(su, 0.0, 1.0));
    col = mix(col, art.rgb, art.a * inside(su));
  }

  if (uFinish > 2.5) col = col * vec3(1.02, 0.95, 0.78) + vec3(0.05, 0.012, 0.0);

  vec3 foil = film(uv);
  float amount = abs(uFinish - 2.0) < 0.05 ? 0.0 : uFoil;
  float luminance = dot(col, vec3(0.2126, 0.7152, 0.0722));
  float band = sweep(uv);
  float goldBoost = uFinish > 2.5 ? 1.7 : 1.0;

  // Sem imagem nenhuma, o foil carrega a carta, ent\xe3o pode ser bem mais forte; por cima de uma figura ou de um fundo,
  // ele fica no n\xedvel contido da refer\xeancia. Um fundo claro com o foil forte sai estourado, quase branco.
  float printed = max(uHasArt, uHasBg);
  float lift = mix(1.7, 1.0, printed);
  col *= 1.0 - amount * 0.21 * (1.0 - foil) * (0.2 + band * 0.8);
  col += foil * amount * band * goldBoost * (0.065 + 0.11 * (1.0 - luminance)) * lift;
  // Na frente gerada, o espectro fica pendurado nas pr\xf3prias ranhuras, na medida do quanto a base j\xe1 \xe9 clara, ent\xe3o
  // os v\xe3os entre os raios continuam pretos. Somado por igual, ele deixa a carta inteira leitosa.
  col += foil * amount * (1.0 - printed) * foil * (0.04 + 2.4 * luminance);

  // O laminado pega mais forte bem na borda da carta.
  float edge = 1.0 - smoothstep(0.015, 0.06, min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y)));
  col = mix(col, foil * 0.75 + 0.21, edge * amount * (uFinish > 2.5 ? 0.42 : 0.3));

  // Purpurina: um hash esparso de c\xe9lulas, cada uma piscando na pr\xf3pria fase conforme a carta gira. \xc9 o \xfanico lugar
  // em que o tempo entra, e mal entra.
  vec2 cell = floor(uv * vec2(480.0, 720.0));
  float flake = step(0.994, hash(cell)) *
    pow(0.5 + 0.5 * sin(hash(cell + 8.0) * 30.0 + uView.x * 20.0 + uTime * 0.6), 10.0);
  col += foil * flake * amount * 0.13;

  fragColor = vec4(pow(clamp(col, 0.0, 1.0), vec3(1.0 / 1.6)), 1.0);
}
`,c=(e,a,t)=>{let r=e.createShader(a);if(!r)throw Error("no shader");if(e.shaderSource(r,t),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS)){let a=e.getShaderInfoLog(r);throw e.deleteShader(r),Error("shader: "+a)}return r},l=Number(t.version.split(".")[0])>=19;function d(){return l?(0,a.jsx)("style",{href:"holo-trading-card",precedence:"default",children:m}):(0,a.jsx)("style",{hidden:!0,dangerouslySetInnerHTML:{__html:m}})}function u({name:e="Holo Trading Card",subtitle:r="Foil · Muda com o olhar",number:l="Nº 001",rarity:m="Rara",art:p,background:h,print:f=!0,finish:x="pearl",width:g="clamp(230px, 64vw, 340px)",foil:v=1,pattern:_=.22,depth:b=.28,bgDepth:w=-.2,tilt:y=16,idle:E=!0,flippable:T=!0,back:R,className:A=""}){let M=t.useRef(null),P=t.useRef(null),[S,j]=t.useState(!1),[N,k]=t.useState(!1),[C,D]=t.useState(0),[F,I]=t.useState(!1),[U,B]=t.useState({ax:0,ay:0});t.useEffect(()=>{let e=window.matchMedia("(prefers-reduced-motion: reduce)"),a=()=>I(e.matches);return a(),e.addEventListener("change",a),()=>e.removeEventListener("change",a)},[]);let L=t.useRef({foil:v,depth:b,bgDepth:w,finish:x,tilt:y,idle:E,reduced:F,pattern:_});t.useEffect(()=>{L.current={foil:v,depth:b,bgDepth:w,finish:x,tilt:y,idle:E,reduced:F,pattern:_}});let q=t.useRef({ax:0,ay:0,active:!1});t.useEffect(()=>{let e=P.current;if(!e)return;let a=e.getContext("webgl2",{alpha:!1,antialias:!1});if(!a)return void k(!0);let t=null,r=null,o=[],l=0,d=!1,u=0,m=0,f=performance.now(),x=!0,g=!1,v=()=>{g||d||!t||(g=!0,l=requestAnimationFrame(j))},_=e=>{e.preventDefault(),cancelAnimationFrame(l),g=!1},b=()=>D(e=>e+1);e.addEventListener("webglcontextlost",_),e.addEventListener("webglcontextrestored",b);let w=()=>{let t=Math.min(window.devicePixelRatio||1,2),r=Math.round(e.clientWidth*t),o=Math.round(e.clientHeight*t);0!==r&&0!==o&&(e.width!==r||e.height!==o)&&(e.width=r,e.height=o,a.viewport(0,0,r,o))},y=new ResizeObserver(w);y.observe(e);let E=new IntersectionObserver(([e])=>{(x=e.isIntersecting)&&v()},{rootMargin:"200px"});E.observe(e);let T={},R=0,A=0,M=e=>{let t=a.createTexture();return a.activeTexture(a.TEXTURE0+e),a.bindTexture(a.TEXTURE_2D,t),a.texImage2D(a.TEXTURE_2D,0,a.RGBA,1,1,0,a.RGBA,a.UNSIGNED_BYTE,new Uint8Array([0,0,0,0])),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_S,a.CLAMP_TO_EDGE),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_T,a.CLAMP_TO_EDGE),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MIN_FILTER,a.LINEAR),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MAG_FILTER,a.LINEAR),t&&o.push(t),t},S=(e,t,r,o)=>{if(!e||!r)return;let i=new Image;i.crossOrigin="anonymous",i.decoding="async",i.onload=()=>{d||(a.activeTexture(a.TEXTURE0+t),a.bindTexture(a.TEXTURE_2D,r),a.pixelStorei(a.UNPACK_FLIP_Y_WEBGL,!1),a.texImage2D(a.TEXTURE_2D,0,a.RGBA,a.RGBA,a.UNSIGNED_BYTE,i),o(1))},i.src=e},j=()=>{var o,n;let s,c,p,h,v,_;if(d)return;if(!x){g=!1;return}let b=L.current,w=q.current.active?q.current.ax:0,y=q.current.active?q.current.ay:0,E=(performance.now()-f)/1e3,M=0,P=0;!b.idle||b.reduced||q.current.active||(M=Math.sin(.41*E)*b.tilt*.34,P=Math.cos(.27*E)*b.tilt*.46);let S=b.reduced?1:.12;u+=(w+M-u)*S,m+=(y+P-m)*S;let N=(o=u,n=m,s=o*Math.PI/180,p=Math.sin(c=n*Math.PI/180)*Math.cos(s),_=Math.hypot(p,h=-Math.sin(s),v=Math.cos(c)*Math.cos(s))||1,[p/_,h/_,v/_]);a.useProgram(t),a.bindVertexArray(r),a.uniform2f(T.uRes,e.width,e.height),a.uniform3f(T.uView,N[0],N[1],N[2]),a.uniform1f(T.uTime,b.reduced?0:E),a.uniform1f(T.uFoil,b.foil),a.uniform1f(T.uFinish,i[b.finish]??0),a.uniform1f(T.uDepth,b.depth),a.uniform1f(T.uBgDepth,b.bgDepth),a.uniform1f(T.uHasArt,R),a.uniform1f(T.uHasBg,A),a.uniform1f(T.uPattern,b.pattern),a.uniform1i(T.tArt,0),a.uniform1i(T.tBg,1),a.drawArrays(a.TRIANGLES,0,3);let k=Math.round(10*u)/10,C=Math.round(10*m)/10;B(e=>e.ax===k&&e.ay===C?e:{ax:k,ay:C}),l=requestAnimationFrame(j)};try{let e=c(a,a.VERTEX_SHADER,n),o=c(a,a.FRAGMENT_SHADER,s);if(!(t=a.createProgram()))throw Error("no program");if(a.attachShader(t,e),a.attachShader(t,o),a.linkProgram(t),a.deleteShader(e),a.deleteShader(o),!a.getProgramParameter(t,a.LINK_STATUS))throw Error("link: "+a.getProgramInfoLog(t));for(let e of(r=a.createVertexArray(),a.bindVertexArray(r),["uRes","uView","uTime","uFoil","uFinish","uDepth","uBgDepth","uHasArt","uHasBg","uPattern","tArt","tBg"]))T[e]=a.getUniformLocation(t,e);let i=M(0),l=M(1);S(p,0,i,e=>R=e),S(h,1,l,e=>A=e),w(),v()}catch{d||k(!0)}return()=>{for(let t of(d=!0,cancelAnimationFrame(l),y.disconnect(),E.disconnect(),e.removeEventListener("webglcontextlost",_),e.removeEventListener("webglcontextrestored",b),o))a.deleteTexture(t);r&&a.deleteVertexArray(r),t&&a.deleteProgram(t)}},[C,p,h]);let H=()=>{q.current={ax:0,ay:0,active:!1}};return(0,a.jsxs)("div",{className:"htc"+(A?" "+A:""),style:{width:g},children:[(0,a.jsx)(d,{}),(0,a.jsxs)("div",{ref:M,role:T?"button":void 0,tabIndex:T?0:void 0,"aria-label":T?(S?"Mostrar a frente de ":"Mostrar o verso de ")+e:void 0,"aria-pressed":T?S:void 0,className:"htc__card",style:{transform:"rotateX("+U.ax+"deg) rotateY("+(U.ay+180*!!S)+"deg)"},onPointerMove:e=>{let a,t,r=M.current;if(!r)return;let i=r.getBoundingClientRect(),{ax:n,ay:s}=(a=(e.clientX-i.left)/Math.max(i.width,1),{ax:o((.5-(e.clientY-i.top)/Math.max(i.height,1))*2*(t=L.current.tilt),t),ay:o((a-.5)*2*t,t)});q.current={ax:n,ay:s,active:!0}},onPointerLeave:H,onPointerCancel:H,onClick:()=>T&&j(e=>!e),onKeyDown:e=>{T&&("Enter"===e.key||" "===e.key)&&(e.preventDefault(),j(e=>!e))},children:[(0,a.jsxs)("div",{className:"htc__face htc__front",children:[N?(0,a.jsx)("div",{className:"htc__fallback"}):(0,a.jsx)("canvas",{ref:P,className:"htc__canvas","aria-hidden":"true"}),f&&(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)("div",{"aria-hidden":"true",className:"htc__shade htc__shade--top"}),(0,a.jsx)("div",{"aria-hidden":"true",className:"htc__shade htc__shade--bottom"}),(0,a.jsx)("div",{"aria-hidden":"true",className:"htc__rule"}),(0,a.jsxs)("div",{className:"htc__print",children:[(0,a.jsxs)("div",{children:[(0,a.jsx)("p",{className:"htc__name",children:e}),r&&(0,a.jsx)("p",{className:"htc__subtitle",children:r})]}),(0,a.jsxs)("div",{className:"htc__foot",children:[(0,a.jsx)("span",{className:"htc__number",children:l}),m&&(0,a.jsx)("span",{className:"htc__rarity",children:m})]})]})]})]}),(0,a.jsx)("div",{className:"htc__face htc__back",children:R??(0,a.jsx)("div",{className:"htc__back-frame",children:(0,a.jsx)("div",{className:"htc__back-pattern"})})})]})]})}let m=`
/* o que o projeto pode trocar com uma classe (posi\xe7\xe3o e margem): na camada base, que vem antes das classes de
   componente e dos utilit\xe1rios (Tailwind v4, Panda, Chakra) e perde para o CSS fora de camada (Tailwind v3, CSS
   Modules, CSS comum) */
@layer base {
  .htc { position: relative; }
}
.htc {
  box-sizing: border-box;
  perspective: 1100px;
  -webkit-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.htc *, .htc *::before, .htc *::after { box-sizing: border-box; }
.htc__card {
  position: relative;
  width: 100%;
  aspect-ratio: 5 / 7;
  border-radius: 5%;
  transform-style: preserve-3d;
  transition: transform 120ms linear;
  cursor: pointer;
  outline: none;
}
.htc__card:focus-visible { box-shadow: 0 0 0 2px transparent, 0 0 0 4px rgba(255, 255, 255, .7); }
.htc__face {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: 5%;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}
/* a impress\xe3o mede pela carta, n\xe3o pela tela: uma carta de 200 px e uma de 400 px s\xe3o o mesmo desenho em dois
   tamanhos. Os tetos das letras v\xe3o em px, n\xe3o em rem, para n\xe3o dependerem do font-size da raiz da p\xe1gina */
.htc__front {
  container-type: inline-size;
  box-shadow: 0 24px 60px -20px rgba(0, 0, 0, .75), 0 0 0 1px rgba(255, 255, 255, .14) inset;
}
.htc__canvas { display: block; width: 100%; height: 100%; }
.htc__fallback {
  width: 100%;
  height: 100%;
  background: conic-gradient(from 210deg, #4b2a6b, #2b5f7a, #6b2a4f, #7a6a2b, #4b2a6b);
}
.htc__shade { position: absolute; left: 0; right: 0; pointer-events: none; }
.htc__shade--top { top: 0; height: 28%; background: linear-gradient(to bottom, rgba(4, 2, 10, .72), transparent); }
.htc__shade--bottom { bottom: 0; height: 22%; background: linear-gradient(to top, rgba(4, 2, 10, .72), transparent); }
.htc__rule {
  position: absolute;
  inset: 3.5%;
  border: 1px solid rgba(255, 255, 255, .22);
  border-radius: 3.5%;
  pointer-events: none;
}
.htc__print {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 7%;
  font-style: normal;
  line-height: 1.5;
  letter-spacing: normal;
  text-align: left;
  text-transform: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  pointer-events: none;
}
.htc__name {
  margin: 0;
  color: #fff;
  font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  font-size: min(6cqw, 21.6px);
  font-weight: 600;
  line-height: 1.25;
  text-shadow: 0 2px 10px rgba(0, 0, 0, .6);
}
.htc__subtitle, .htc__number, .htc__rarity {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-weight: 400;
}
.htc__subtitle {
  margin: 4px 0 0;
  color: rgba(255, 255, 255, .7);
  font-size: min(3cqw, 9.92px);
  letter-spacing: .2em;
  text-transform: uppercase;
}
.htc__foot { display: flex; align-items: flex-end; justify-content: space-between; gap: 8px; }
.htc__number { color: rgba(255, 255, 255, .7); font-size: min(3cqw, 9.6px); letter-spacing: .16em; }
.htc__rarity {
  padding: 2px 8px;
  border: 1px solid rgba(255, 255, 255, .3);
  border-radius: 9999px;
  background: rgba(0, 0, 0, .3);
  color: #fff;
  font-size: min(2.8cqw, 8.96px);
  letter-spacing: .18em;
  text-transform: uppercase;
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
}
.htc__back {
  transform: rotateY(180deg);
  background: radial-gradient(120% 90% at 50% 20%, #2a1745 0%, #150c24 55%, #090511 100%);
  box-shadow: 0 24px 60px -20px rgba(0, 0, 0, .75), 0 0 0 1px rgba(255, 255, 255, .12) inset;
}
.htc__back-frame {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  padding: 10%;
  text-align: center;
}
.htc__back-pattern {
  width: 100%;
  height: 100%;
  border: 1px solid rgba(255, 255, 255, .15);
  border-radius: 4%;
  background: repeating-conic-gradient(from 0deg at 50% 50%, rgba(255, 255, 255, .055) 0deg 6deg, transparent 6deg 12deg);
}
`;function p(e){return(0,a.jsxs)("div",{className:"htc-demo",children:[(0,a.jsx)("style",{dangerouslySetInnerHTML:{__html:h}}),(0,a.jsx)(u,{name:"Pikachu ex",background:"/holo-trading-card/pikachu-ex.webp",bgDepth:0,print:!1,...e})]})}let h=`
.htc-demo {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 100%;
  min-height: 100svh;
  padding: 80px 24px;
  background: #0a0812;
}
`;var f=e.i(730799);let x=r.LIVE_COMPONENTS["holo-trading-card"].images,g=e=>{e.preventDefault(),e.stopPropagation()},v=[{at:0,rest:!0,o:0},{at:.5,rest:!0,o:1},{at:1.4,card:[.74,.62],o:1},{at:2.7,card:[.2,.18],o:1,sweep:!0},{at:3.9,card:[.82,.26],o:1,sweep:!0},{at:5.1,card:[.28,.84],o:1,sweep:!0},{at:6,card:[.5,.5],o:1},{at:6.7,card:[.5,.5],o:1},{at:7.7,card:[.64,.38],o:1,sweep:!0},{at:8.5,card:[.4,.6],o:1,sweep:!0},{at:9,card:[.5,.5],o:1},{at:9.7,card:[.5,.5],o:1},{at:10.9,card:[.78,.2],o:1,sweep:!0},{at:11.8,rest:!0,o:0},{at:12.4,rest:!0,o:0}],_=[6.35,9.35],b=v[v.length-1].at,w=[.72,.3];e.s(["default",0,function({mode:e}){let r=(0,t.useRef)(null),o=(0,t.useRef)(null);return((0,t.useEffect)(()=>{if("tile"===e){var a,t;let e,i,n,s,c,l,d,u,m,p,h,x,g,y;return a=r.current,t=o.current,e=matchMedia("(prefers-reduced-motion: reduce)").matches,i=a.closest(".preview"),n=!1,s=NaN,c=NaN,l=0,d=0,u=0,m=(e,t,r,o)=>e.dispatchEvent(new PointerEvent(t,{bubbles:!0,cancelable:!0,composed:!0,clientX:r,clientY:o,pointerId:1,pointerType:"mouse",isPrimary:!0,relatedTarget:a})),p=e=>{e?a.dataset.press="":delete a.dataset.press},h=()=>{p(!1),a.querySelector(".htc__card")?.click();let e=t.firstElementChild;e.classList.remove(f.default.on),e.offsetWidth,e.classList.add(f.default.on)},x=r=>{let o=l/1e3;l+=Math.min(100,r-d),d=r;let i=l/1e3;if(!e){for(let e of _)o<e-.14&&i>=e-.14&&p(!0),o<e&&i>=e&&h();i>=b&&(l-=1e3*b,i-=b)}(r=>{let o,i=a.getBoundingClientRect();if(!i.width||!a.offsetWidth)return;let l=i.width/a.offsetWidth,d=a.querySelector(".htc__card"),u=d?.parentElement?.getBoundingClientRect(),p=(e,a)=>u?.width?{x:(u.left+u.width*e-i.left)/l,y:(u.top+u.height*a-i.top)/l}:null,h={x:a.offsetWidth-40,y:a.offsetHeight-24},f=e=>"card"in e?p(...e.card)??h:h;if(e)o={...p(...w)??h,o:1};else{let e=1;for(;e<v.length-1&&v[e].at<r;)e++;let a=v[e-1],t=v[e],i=f(a),n=f(t),s=Math.min(1,Math.max(0,(r-a.at)/(t.at-a.at||1))),c=t.sweep?-(Math.cos(Math.PI*s)-1)/2:s<.5?4*s*s*s:1-(-2*s+2)**3/2;o={x:i.x+(n.x-i.x)*c,y:i.y+(n.y-i.y)*c,o:a.o+(t.o-a.o)*c}}t.style.transform=`translate3d(${o.x}px, ${o.y}px, 0)`,t.style.opacity=String(o.o);let x=i.left+o.x*l,g=i.top+o.y*l,_=!!(d&&u&&x>=u.left&&x<=u.right&&g>=u.top&&g<=u.bottom);d&&_&&!n&&m(d,"pointerover",x,g),d&&!_&&n&&m(d,"pointerout",x,g),n=_,d&&_&&(x!==s||g!==c)&&m(d,"pointermove",x,g),s=x,c=g})(i),u=requestAnimationFrame(x)},y=new MutationObserver(g=()=>{let e=!i||i.classList.contains("is-playing");e&&!u?(d=performance.now(),u=requestAnimationFrame(x)):!e&&u&&(cancelAnimationFrame(u),u=0)}),i&&y.observe(i,{attributes:!0,attributeFilter:["class"]}),g(),()=>{y.disconnect(),cancelAnimationFrame(u)}}},[e]),"stage"===e)?(0,a.jsx)("div",{className:f.default.stage,children:(0,a.jsx)(p,{background:x.stage,width:"340px"})}):(0,a.jsxs)("div",{ref:r,className:`${f.default.stage} ${f.default.tile}`,"aria-hidden":"true",inert:!0,onPointerMove:e=>e.stopPropagation(),onPointerOver:e=>e.stopPropagation(),onPointerOut:e=>e.stopPropagation(),onClick:g,children:[(0,a.jsx)(p,{background:x.tile,width:"340px"}),(0,a.jsxs)("div",{ref:o,className:f.default.cursor,children:[(0,a.jsx)("span",{className:f.default.ripple}),(0,a.jsx)("svg",{viewBox:"0 0 14 21",width:"18",height:"27",children:(0,a.jsx)("path",{d:"M1 1v15.5l3.8-3.6 2.8 6.5 2.5-1.1-2.7-6.3h5.2z"})})]})]})}],962313)},125819,function(e){e.n(e.i(962313))}]);

//# debugId=e38251f2-e113-643f-694d-211a9e6e35e0