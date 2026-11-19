;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="eedecd01-ae2f-8a65-a160-fc9bfcdee22c")}catch(e){}}();
(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,994961,e=>{"use strict";var o=e.i(843476),a=e.i(271645);let r={bgColor:"#1d0f0c",colorA:"#6d2e26",colorB:"#c33e38",colorC:"#d78c8f",colorD:"#f1dcde",scale:.2,speed:.33,flow:.02,roughness:.47,lacunarity:2.75,smokeScale:3.06,curl:.57,curlScale:1.46,rise:.05,slender:1.57,width:1.21,spread:1.89,lean:1.16,density:1.4,contrast:1.85,midpoint:.69,glow:.48,sink:.42,grain:0,grainAnim:0,dither:.43,vignette:.15,cursor:1,pointerRadius:.38,draft:4.5,pointerStrength:.73,parallax:.007,maxDpr:1},t=`#version 300 es
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`,n=`#version 300 es
precision highp float;
out vec4 fragColor;

uniform vec2  iResolution;
uniform float iTime;
uniform vec2  iMouse;          // em unidades corrigidas pela propor\xe7\xe3o, no mesmo espa\xe7o do uv: o n\xf3 do corpo
uniform vec2  iMouseVel;       // o n\xf3 da frente menos o do corpo: uma aproxima\xe7\xe3o da velocidade
uniform vec2  iMouseWake;      // um terceiro n\xf3, bem mais lento: a cauda do rastro

uniform vec3  uBgColor, uColorA, uColorB, uColorC, uColorD;
uniform float uScale, uSpeed, uFlow, uRoughness, uLacunarity;
uniform float uSmokeScale, uCurl, uCurlScale, uRise, uSlender;
uniform float uWidth, uSpread, uLean, uDensity;
uniform float uContrast, uMidpoint, uGlow, uSink;
uniform float uGrain, uDither, uVignette;
uniform float uPointerRadius, uDraft, uPointerStrength, uParallax;
#define OCTAVES 3
#define TRAIL_TAPS 6
vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

/* Um hash de c\xe9lula por mistura, n\xe3o o de fract(sin()). O hash por sin() \xe9
   correlacionado ao longo da diagonal, e uma grade com jitter semeada por ele
   alinha as c\xe9lulas em fileiras discretas que o olho acha na hora. */
float hash1(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float snoise(vec2 p) {
  const float K1 = 0.366025404, K2 = 0.211324865;
  vec2 i = floor(p + (p.x + p.y) * K1);
  vec2 a = p - i + (i.x + i.y) * K2;
  float m = step(a.y, a.x);
  vec2 o = vec2(m, 1.0 - m);
  vec2 b = a - o + K2;
  vec2 c = a - 1.0 + 2.0 * K2;
  vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);
  vec3 n = h * h * h * h * vec3(dot(a, hash2(i)), dot(b, hash2(i + o)), dot(c, hash2(i + 1.0)));
  return dot(n, vec3(70.0));
}

float fbm(vec2 p) {
  float v = 0.0, amp = 0.5;
  for (int i = 0; i < OCTAVES; i++) {
    v += amp * snoise(p);
    p *= uLacunarity;
    amp *= uRoughness;
  }
  return v;
}
/* O rastro. O shader n\xe3o tem mem\xf3ria, ent\xe3o a cauda \xe9 refeita a partir de tr\xeas
   n\xf3s do ponteiro: TRAIL_TAPS gaussianas enfileiradas no segmento entre o n\xf3
   lento do rastro e o n\xf3 do corpo, com mais peso na cabe\xe7a. Um cursor parado p\xf5e
   todas no mesmo lugar e o resultado \xe9 uma gaussiana limpa; um cursor andando as
   estica numa fita afilada que derrete de tr\xe1s para a frente enquanto o rastro
   alcan\xe7a. Sem if, sem salto, e a mesma queda em todo o comprimento. */
float trail(vec2 uv, float radius) {
  /* Antes, o ponto de amostra balan\xe7a num campo lento. Uma gaussiana \xe9 um
     c\xedrculo perfeito, e um c\xedrculo perfeito parado debaixo do cursor \xe9 a \xfanica
     coisa que parece desenhada em vez de sentida; deformar a coordenada em uma
     fra\xe7\xe3o do raio faz do toque uma mancha org\xe2nica que respira, por dois taps
     de ru\xeddo e mais nada. */
  vec2 wob = vec2(snoise(uv * 1.7 + vec2(0.0, iTime * 0.05)),
                  snoise(uv * 1.7 + vec2(4.3, -iTime * 0.04)));
  uv += wob * radius * 0.18;
  float a = 0.0, wsum = 0.0;
  float r2 = max(1e-4, radius * radius);
  for (int i = 0; i < TRAIL_TAPS; i++) {
    float k = float(i) / float(TRAIL_TAPS - 1);
    vec2 c = mix(iMouseWake, iMouse, k);
    vec2 dd = uv - c;
    float w = mix(0.30, 1.0, k);
    a += w * exp(-dot(dd, dd) / r2);
    wsum += w;
  }
  return a / wsum;
}
/* O curl de um potencial escalar: o fluxo sem diverg\xeancia mais barato que
   existe. Girar o gradiente de um campo de ru\xeddo em noventa graus d\xe1 um campo
   de velocidade que nunca se amontoa, que \xe9 exatamente onde um domain warp comum
   erra: o warp junta a fuma\xe7a em n\xf3s, o curl a dobra. Duas oitavas de potencial,
   quatro taps para as duas derivadas: oito avalia\xe7\xf5es de ru\xeddo para um fluxo
   que se comporta. */
float potential(vec2 p) {
  return snoise(p) + 0.5 * snoise(p * 2.03 + vec2(3.7, -1.9));
}

vec2 curl(vec2 p, float e) {
  float nx1 = potential(p + vec2(0.0, e));
  float nx2 = potential(p - vec2(0.0, e));
  float ny1 = potential(p + vec2(e, 0.0));
  float ny2 = potential(p - vec2(e, 0.0));
  return vec2(nx1 - nx2, ny2 - ny1) / (2.0 * e);
}

vec3 ramp4(float t) {
  vec3 c = mix(uColorA, uColorB, smoothstep(0.00, 0.36, t));
  c = mix(c, uColorC, smoothstep(0.32, 0.70, t));
  c = mix(c, uColorD, smoothstep(0.66, 1.00, t));
  return c;
}

// dither de distribui\xe7\xe3o triangular: a \xfanica cura confi\xe1vel para o banding de 8 bits num degrad\xea
float triDither(vec2 fc) {
  float a = fract(sin(dot(fc, vec2(12.9898, 78.233))) * 43758.5453);
  float b = fract(sin(dot(fc + 17.0, vec2(12.9898, 78.233))) * 43758.5453);
  return (a + b - 1.0) / 255.0;
}

// ---- o gr\xe3o da casa, o mesmo em toda a cole\xe7\xe3o: um hash inteiro (sem as estrias do sin()),
// triangular para ler como filme e n\xe3o como chiado, com mais peso nos meios-tons para nunca
// encrostar um preto ou um branco. Parado por padr\xe3o; uGrainAnim o ressemeia 24 vezes por segundo.
uniform float uGrainAnim;
float houseGrain(vec2 fc) {
  uvec2 q = uvec2(fc) * uvec2(1597334677u, 3812015801u)
          + uint(floor(iTime * 24.0 * uGrainAnim)) * 2654435769u;
  uint n = q.x ^ q.y; n = n * 1664525u + 1013904223u; n ^= n >> 16u; n *= 2246822519u; n ^= n >> 13u;
  float a = float(n & 0xffffu) / 65535.0;
  n *= 3266489917u; n ^= n >> 16u;
  float b = float(n & 0xffffu) / 65535.0;
  return a + b - 1.0;
}
void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution) / iResolution.y;
  float t = iTime * uSpeed;

  float tr = trail(uv, uPointerRadius);

  vec2 p = (uv - iMouse * uParallax) * uScale;

  // a coluna sobe: o campo inteiro \xe9 amostrado num referencial que desliza para
  // baixo, ent\xe3o a fuma\xe7a sobe sem o quadro se mexer
  vec2 sp = p + vec2(0.0, -t * uRise);

  // o fluxo que a carrega, mais a corrente de ar que a m\xe3o p\xf5e na sala. O
  // percurso da m\xe3o entra no campo de VELOCIDADE, n\xe3o na coordenada, ent\xe3o dobra
  // a fuma\xe7a como uma corrente de verdade em vez de arrastar um peda\xe7o dela de
  // lado; e continua soprando um instante depois que a m\xe3o para, porque o n\xf3 do
  // rastro ainda est\xe1 alcan\xe7ando
  vec2 c = curl(sp * uCurlScale + vec2(0.0, t * uFlow), 0.14) * uCurl;
  c += iMouseVel * uDraft * tr;

  // a fuma\xe7a em si, esticada na vertical: uma coluna \xe9 mais alta que larga
  vec2 mp = vec2(sp.x, sp.y * uSlender) * uSmokeScale + c;
  float dens = fbm(mp) * 0.5 + 0.5;

  // o corredor por onde a coluna sobe, inclinando para o ponteiro e alargando no
  // caminho. A inclina\xe7\xe3o pesa pela altura: a base fica e o topo balan\xe7a, que \xe9
  // como uma pluma responde a uma corrente
  float h = uv.y + 0.55;
  float lean = iMouse.x * uLean * clamp(h, 0.0, 1.6);
  float width = max(0.06, uWidth * (0.45 + uSpread * clamp(h, 0.0, 1.8)));
  float xr = (uv.x - lean) / width;
  float corridor = exp(-xr * xr);

  // e afina conforme esfria na subida
  float cool = smoothstep(-0.65, 0.85, uv.y);
  float smoke = dens * corridor * mix(1.0, 0.30, cool) * uDensity;

  // e o ar mexido carrega um pouco mais dela: um ganho de exposi\xe7\xe3o, n\xe3o uma
  // forma, ent\xe3o n\xe3o h\xe1 nada seguindo o cursor para apontar
  float f = clamp((smoke - uMidpoint) * uContrast + 0.5 + tr * uPointerStrength * 0.30, 0.0, 1.0);

  vec3 col = ramp4(f);
  col += uColorD * uGlow * pow(f, 4.0);
  col = mix(uBgColor, col, smoothstep(0.0, max(0.01, uSink), f) * 0.90 + 0.10);
  col *= 1.0 - uVignette * dot(uv, uv);
  { float hgL = clamp(dot(col, vec3(0.299, 0.587, 0.114)), 0.0, 1.0);
    col += houseGrain(gl_FragCoord.xy) * uGrain * mix(1.0, 4.0 * hgL * (1.0 - hgL), 0.6); }
  col += triDither(gl_FragCoord.xy) * uDither;

  fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;function i(e,o,a){let r=e.createShader(o);return e.shaderSource(r,a),e.compileShader(r),r}e.s(["Flue",0,function(e){let u=(0,a.useRef)(null);return(0,a.useEffect)(()=>{var e;let o,a,s,c,l,d,m,f,p,x,v,h,g,y,b,w,S,A,C,q,T,R,L,P,D,E;return"static"===getComputedStyle(e=u.current).position&&(e.style.position="relative"),e.style.isolation="isolate",e.style.backgroundColor=r.bgColor,o=matchMedia("(prefers-reduced-motion: reduce)").matches,a=null,s=null,c=null,l=!1,d=!1,m=!1,f=!1,p=0,x={},v=e=>e in x?x[e]:x[e]=s.getUniformLocation(c,e),h=(e,o)=>s.uniform1f(v(e),o),g=(e,o,a)=>s.uniform2f(v(e),o,a),y=(e,o)=>{let a=[1,3,5].map(e=>parseInt(o.slice(e,e+2),16)/255);s.uniform3f(v(e),a[0],a[1],a[2])},(w=new ResizeObserver(b=()=>{if(!s||!a||!l)return;let o=Math.min(window.devicePixelRatio||1,r.maxDpr),t=Math.max(1,Math.round(e.clientWidth*o)),n=Math.max(1,Math.round(e.clientHeight*o));(a.width!==t||a.height!==n)&&(a.width=t,a.height=n),s.viewport(0,0,t,n),g("iResolution",t,n),s.drawArrays(s.TRIANGLES,0,3)})).observe(e),S={x:0,y:0,ax:0,ay:0,wx:0,wy:0,tx:0,ty:0},A=null,C=o=>{let a=e.getBoundingClientRect();a.width&&a.height&&(S.tx=((o.clientX-a.left)/a.width-.5)*(a.width/a.height),S.ty=.5-(o.clientY-a.top)/a.height)},e.addEventListener("pointermove",C,{passive:!0}),e.addEventListener("pointerdown",C,{passive:!0}),q=0,T=0,R=e=>{p=requestAnimationFrame(R);let o=e-q;if(q=e,!f||document.hidden||!s||!l)return;let a=o>50?50:o<4.167?4.167:o,t=a>36.7?2.2:.06*a;T+=.001*a;let n=.105*t,i=.043*t,u=.017*t;S.ax+=(S.tx-S.ax)*n,S.ay+=(S.ty-S.ay)*n,S.x+=(S.ax-S.x)*i,S.y+=(S.ay-S.y)*i,S.wx+=(S.x-S.wx)*u,S.wy+=(S.y-S.wy)*u,h("iTime",T),null===A&&(A={x:S.tx,y:S.ty}),r.cursor||(S.tx=A.x,S.ty=A.y),g("iMouse",S.x,S.y),g("iMouseVel",S.ax-S.x,S.ay-S.y),g("iMouseWake",S.wx,S.wy),s.drawArrays(s.TRIANGLES,0,3)},L=()=>{let u=document.createElement("canvas");u.setAttribute("aria-hidden","true"),u.style.cssText="position:absolute;inset:0;z-index:-1;display:block;width:100%;height:100%",e.prepend(u),a=u;let v=u.getContext("webgl2",{alpha:!1,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance"});if(!v)return void e.classList.add("no-gl");s=v,u.addEventListener("webglcontextlost",e=>{e.preventDefault(),s=null,l=!1,d=!0,f&&setTimeout(()=>f&&d&&!m&&P(),100)},{once:!0});let g=v.createProgram(),w=[i(v,v.VERTEX_SHADER,t),i(v,v.FRAGMENT_SHADER,n)];for(let e of w)v.attachShader(g,e);v.linkProgram(g);let S=v.getExtension("KHR_parallel_shader_compile"),A=()=>{s!==v||m||(S&&!v.getProgramParameter(g,S.COMPLETION_STATUS_KHR)?requestAnimationFrame(A):((e,a,t)=>{if(!e.getProgramParameter(a,e.LINK_STATUS)){for(let o of t)e.getShaderParameter(o,e.COMPILE_STATUS)||console.error(e.getShaderInfoLog(o));console.error(e.getProgramInfoLog(a));return}for(let[o,t]of(e.useProgram(a),e.bindVertexArray(e.createVertexArray()),c=a,x={},Object.entries(r))){if("cursor"===o||"maxDpr"===o)continue;let e="u"+o[0].toUpperCase()+o.slice(1);"string"==typeof t?y(e,t):h(e,t)}l=!0,b(),p||o||(q=performance.now(),p=requestAnimationFrame(R))})(v,g,w))};S?requestAnimationFrame(A):A()},P=()=>{d=!1,a?.remove(),a=null,L()},(D=new IntersectionObserver(([e])=>{(f=e.isIntersecting)&&d&&P()})).observe(e),(E=new IntersectionObserver(([e])=>{e.isIntersecting&&(E.disconnect(),L())},{rootMargin:"400px"})).observe(e),()=>{m=!0,cancelAnimationFrame(p),p=0,D.disconnect(),E.disconnect(),w.disconnect(),e.removeEventListener("pointermove",C),e.removeEventListener("pointerdown",C),s?.getExtension("WEBGL_lose_context")?.loseContext(),a?.remove()}},[]),(0,o.jsx)("div",{ref:u,...e})}],994961)},515005,function(e){e.n(e.i(994961))}]);

//# debugId=eedecd01-ae2f-8a65-a160-fc9bfcdee22c