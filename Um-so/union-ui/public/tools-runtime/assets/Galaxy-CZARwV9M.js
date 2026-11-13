import{a as T,j as me}from"./index-DrbxZl7q.js";const de=8,V=4,Ge=2.2,ze=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,He=`#version 300 es
precision highp float;
precision highp int;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uFocal;
uniform vec2 uRotation;
uniform float uGloss;
uniform float uDepth;
uniform float uDensity;
uniform float uHueShift;
uniform float uSpeed;
uniform vec2 uMouse;
uniform float uStarGlow;
uniform float uFlareGain;
uniform float uSquash;
uniform float uSaturation;
uniform float uMouseRepulsion;
uniform float uTwinkleIntensity;
uniform float uRotationAngle;
uniform float uRepulsionStrength;
uniform float uMouseActiveFactor;
uniform float uAutoCenterRepulsion;
uniform int uLayers;
uniform vec3 uColors[${V}];
uniform int uColorCount;
uniform float uWarp;
uniform float uReveal;
uniform float uMode;
uniform vec3 uBackground;
uniform float uOpacity;
out vec4 outColor;

#define STAR_COLOR_CUTOFF 0.2
#define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)
#define PERIOD 3.0

float Hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float tri(float x) {
  return abs(fract(x) * 2.0 - 1.0);
}

float tris(float x) {
  float t = fract(x);
  return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0));
}

float trisn(float x) {
  float t = fract(x);
  return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0;
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float Star(vec2 uv, float flare, vec2 radial, float invReach) {
#ifdef WARP
  float along = dot(uv, radial);
  float d = sqrt(max(dot(uv, uv) - uSquash * along * along, 0.0));
#else
  float d = length(uv);
#endif
  float m = uStarGlow / d;
  float rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * flare * uFlareGain;
  uv *= MAT45;
  rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * 0.3 * flare * uFlareGain;
  m *= smoothstep(1.0, 0.2, d * invReach);
#ifdef WARP
  m *= mix(1.0, smoothstep(1.0, 0.55, length(uv) * invReach), min(uWarp * 4.0, 1.0));
#endif
  return m;
}

vec3 StarLayer(vec2 uv, vec2 radial, vec2 repelAt, float pushCells, float spread) {
  vec3 col = vec3(0.0);
  vec2 gv = fract(uv) - 0.5;
  vec2 id = floor(uv);
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offset = vec2(float(x), float(y));
      vec2 si = id + offset;
      float seed = Hash21(si);
      float size = fract(seed * 345.32);
      float glossLocal = tri(uGloss / (PERIOD * seed + 1.0));
      float flareSize = smoothstep(0.9, 1.0, size) * glossLocal;

#ifdef PALETTE
      float pick = Hash21(si + 7.0) * float(uColorCount);
      vec3 base = uColors[int(min(floor(pick), float(uColorCount - 1)))];
#else
      float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 1.0)) + STAR_COLOR_CUTOFF;
      float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 3.0)) + STAR_COLOR_CUTOFF;
      float grn = min(red, blu) * seed;
      vec3 base = vec3(red, grn, blu);
      float hue = atan(base.g - base.r, base.b - base.r) / (2.0 * 3.14159) + 0.5;
      hue = fract(hue + uHueShift / 360.0);
      float sat = length(base - vec3(dot(base, vec3(0.299, 0.587, 0.114)))) * uSaturation;
      float val = max(max(base.r, base.g), base.b);
      base = hsv2rgb(vec3(hue, sat, val));
#endif

      vec2 pad = vec2(tris(seed * 34.0 + uTime * uSpeed / 10.0), tris(seed * 38.0 + uTime * uSpeed / 30.0)) - 0.5;
      vec2 shift = vec2(0.0);
      float invReach = 1.0;
#ifdef REPEL
      vec2 away = si + 0.5 + pad - repelAt;
      float dist = length(away);
      float q = dist * spread;
      float cells = pushCells * exp(-q * q);
      float moved = cells * inversesqrt(1.0 + cells * cells * 2.78);
      shift = away * (moved / max(dist, 0.0001));
      invReach = 1.0 / (1.0 - moved);
#endif
      float star = Star(gv - offset - pad - shift, flareSize, radial, invReach);
      float twinkle = trisn(uTime * uSpeed + seed * 6.2831) * 0.5 + 1.0;
      twinkle = mix(1.0, twinkle, uTwinkleIntensity);
      col += star * twinkle * size * base;
    }
  }
  return col;
}

void main() {
  vec2 focalPx = uFocal * uResolution;
  vec2 uv = (gl_FragCoord.xy - focalPx) / uResolution.y;
  vec2 mouseNorm = uMouse - vec2(0.5);

  vec2 repelAt = vec2(0.0);
  float strength = 0.0;
  float push = 0.0;
  if (uAutoCenterRepulsion > 0.0) {
    strength = uAutoCenterRepulsion;
    push = strength * 0.05;
  } else if (uMouseRepulsion > 0.5) {
    repelAt = (uMouse * uResolution - focalPx) / uResolution.y;
    strength = max(uRepulsionStrength, 0.0);
    push = strength * 0.05 * uMouseActiveFactor;
  } else {
    uv += mouseNorm * 0.1 * uMouseActiveFactor;
  }
  float radius = 0.16 + 0.04 * strength;

  vec2 radial = length(uv) > 0.0001 ? normalize(uv) : vec2(1.0, 0.0);
  float angle = uRotationAngle;
  uv = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * uv;
  uv = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * uv;
  radial = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * radial;
  radial = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * radial;
  repelAt = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * repelAt;
  repelAt = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * repelAt;

  vec3 col = vec3(0.0);
  float layers = float(uLayers);
  for (int k = 0; k < ${de}; k++) {
    if (k >= uLayers) break;
    float i = float(k) / layers;
    float depth = fract(i + uDepth);
    float scale = mix(20.0 * uDensity, 0.5 * uDensity, depth);
    float fade = depth * smoothstep(1.0, 0.9, depth);
    vec2 offset = vec2(i * 453.32);
    col += StarLayer(uv * scale + offset, radial, repelAt * scale + offset, push * scale, 1.0 / (scale * radius)) * fade;
  }
  col *= uReveal;

  if (uMode > 1.5) {
    vec3 lit = col * smoothstep(0.0, 0.3, length(col));
    float energy = max(max(lit.r, lit.g), lit.b);
    vec3 tint = lit / max(energy, 0.0001);
    vec3 ink = tint * (0.16 / max(dot(tint, vec3(0.2126, 0.7152, 0.0722)), 0.16));
    float coverage = pow(min(energy * 1.3, 1.0), 1.3) * 0.92 * uOpacity;
    outColor = uMode > 2.5 ? vec4(ink * coverage, coverage) : vec4(mix(uBackground, ink, coverage), 1.0);
  } else if (uMode > 0.5) {
    float alpha = min(smoothstep(0.0, 0.3, length(col)), 1.0) * uOpacity;
    outColor = vec4(col * alpha, alpha);
  } else {
    outColor = vec4(mix(uBackground, col, uOpacity), 1.0);
  }
}`,I=(a,l,f)=>Math.min(f,Math.max(l,a)),Ue=(a,l,f)=>(a?4:0)+(l?2:0)+(f?1:0),Be=(a,l,f,L)=>{const y=`${l?`#define PALETTE
`:""}${f?`#define REPEL
`:""}${L?`#define WARP
`:""}`,c=a.createProgram(),R=a.createShader(a.VERTEX_SHADER),x=a.createShader(a.FRAGMENT_SHADER);return!c||!R||!x?null:(a.shaderSource(R,ze),a.shaderSource(x,He.replace(`
`,`
${y}`)),a.compileShader(R),a.compileShader(x),a.attachShader(c,R),a.attachShader(c,x),a.bindAttribLocation(c,0,"aPosition"),a.linkProgram(c),a.deleteShader(R),a.deleteShader(x),c)},We=(a,l)=>{if(!a.getProgramParameter(l,a.LINK_STATUS))return null;const f={},L=a.getProgramParameter(l,a.ACTIVE_UNIFORMS);for(let y=0;y<L;y++){const c=a.getActiveUniform(l,y);c&&(f[c.name.replace("[0]","")]=a.getUniformLocation(l,c.name))}return{program:l,uniforms:f}},Ne=({focal:a=[.5,.5],rotation:l=[1,0],starSpeed:f=.5,density:L=1,hueShift:y=140,disableAnimation:c=!1,speed:R=1,mouseInteraction:x=!0,glowIntensity:ve=.3,saturation:pe=0,mouseRepulsion:he=!0,repulsionStrength:ge=2,twinkleIntensity:ye=.3,rotationSpeed:Re=.1,autoCenterRepulsion:xe=0,transparent:Ae=!0,lightMode:be=!1,starColors:K,starSize:we=1,flareIntensity:Se=1,layers:Me=4,direction:Ee="forward",clickWarp:Ce=!0,intro:Te=!0,backgroundColor:Le,opacity:ke=1,dpr:Fe,className:$="",style:Oe,...Pe})=>{const X=T.useRef(null),j=T.useRef(null),k=T.useRef(null),_e=Array.isArray(K)?K.filter(Boolean).slice(0,V):[],Y={focal:Array.isArray(a)?a:[.5,.5],rotation:Array.isArray(l)?l:[1,0],starSpeed:f,density:Math.max(.01,L),hueShift:y,disableAnimation:c,speed:R,mouseInteraction:x,glowIntensity:Math.max(0,ve),saturation:Math.max(0,pe),mouseRepulsion:he,repulsionStrength:ge,twinkleIntensity:I(ye,0,1),rotationSpeed:Re,autoCenterRepulsion:Math.max(0,xe),transparent:Ae,lightMode:be,palette:_e,starSize:Math.max(0,we),flareIntensity:Math.max(0,Se),layers:I(Math.round(Me),2,de),reverse:Ee==="backward",clickWarp:Ce,intro:Te,backgroundColor:Le,opacity:I(ke,0,1),dpr:Fe},d=T.useRef(Y);return d.current=Y,T.useEffect(()=>{var fe;const v=X.current,m=j.current,t=m==null?void 0:m.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!v||!m||!t)return;const J=t.getExtension("KHR_parallel_shader_compile"),F=new Map,O=(e,n,i)=>{const s=Ue(e,n,i);let u=F.get(s);return u||(u={program:Be(t,e,n,i),linked:null,done:!1},F.set(s,u)),u},D=(e,n,i,s)=>{const u=O(e,n,i);if(!u.done&&u.program){if(!s&&J&&!t.getProgramParameter(u.program,J.COMPLETION_STATUS_KHR))return null;u.linked=We(t,u.program),u.done=!0}return u.linked},h=d.current;if(!D(h.palette.length>0,!1,!1,!0)){F.forEach(e=>e.program&&t.deleteProgram(e.program));return}const Q=t.createBuffer(),G=t.createVertexArray();t.bindVertexArray(G),t.bindBuffer(t.ARRAY_BUFFER,Q),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),t.STATIC_DRAW),t.enableVertexAttribArray(0),t.vertexAttribPointer(0,2,t.FLOAT,!1,0,0);const w=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),S=((fe=window.matchMedia)==null?void 0:fe.call(window,"(prefers-reduced-motion: reduce)").matches)??!1,z=new Map,Z=(e,n)=>{if(!e)return n;const i=String(e);if(z.has(i))return z.get(i);let s=n;if(w){w.clearRect(0,0,1,1),w.fillStyle="#000000",w.fillStyle=i,w.fillRect(0,0,1,1);const[u,g,A]=w.getImageData(0,0,1,1).data;s=[u/255,g/255,A/255]}return z.set(i,s),s},ee=new Float32Array(V*3),p={x:.5,y:.5,inside:!1},o={time:0,gloss:0,depth:0,angle:0,mx:.5,my:.5,active:0,boost:0,reveal:d.current.intro&&!S?0:1};let M=0,E=0,P=!0;const H=()=>{const e=d.current;e.palette.forEach((Ie,De)=>ee.set(Z(Ie,[1,1,1]),De*3));const n=e.lightMode?e.transparent?3:2:e.transparent?1:0,i=Z(e.backgroundColor,e.lightMode?[1,1,1]:[0,0,0]),s=o.reveal,u=e.palette.length>0,g=e.autoCenterRepulsion>0||e.mouseRepulsion&&e.repulsionStrength>0&&o.active>0,A=o.boost>0,b=D(u,!1,!1,!0);if(!b)return;const W=(g||A?D(u,g,A,!1):null)??b,r=W.uniforms;t.viewport(0,0,m.width,m.height),t.useProgram(W.program),t.bindVertexArray(G),t.uniform1f(r.uTime,o.time),t.uniform2f(r.uResolution,m.width,m.height),t.uniform2f(r.uFocal,e.focal[0],e.focal[1]),t.uniform2f(r.uRotation,e.rotation[0],e.rotation[1]),t.uniform1f(r.uGloss,o.gloss),t.uniform1f(r.uDepth,o.depth),t.uniform1f(r.uDensity,e.density),t.uniform1f(r.uHueShift,e.hueShift),t.uniform1f(r.uSpeed,e.speed),t.uniform2f(r.uMouse,o.mx,o.my);const q=1+o.boost*5;t.uniform1f(r.uStarGlow,.05*e.glowIntensity*e.starSize/Math.pow(q,.6)),t.uniform1f(r.uFlareGain,e.glowIntensity*e.flareIntensity),t.uniform1f(r.uSquash,1-1/(q*q)),t.uniform1f(r.uSaturation,e.saturation),t.uniform1f(r.uMouseRepulsion,e.mouseRepulsion?1:0),t.uniform1f(r.uTwinkleIntensity,e.twinkleIntensity),t.uniform1f(r.uRotationAngle,o.angle),t.uniform1f(r.uRepulsionStrength,e.repulsionStrength),t.uniform1f(r.uMouseActiveFactor,o.active),t.uniform1f(r.uAutoCenterRepulsion,e.autoCenterRepulsion),t.uniform1i(r.uLayers,e.layers),t.uniform3fv(r.uColors,ee),t.uniform1i(r.uColorCount,e.palette.length),t.uniform1f(r.uWarp,o.boost);const N=Math.min(1,s/.35);t.uniform1f(r.uReveal,N*N*(3-2*N)),t.uniform1f(r.uMode,n),t.uniform3fv(r.uBackground,i),t.uniform1f(r.uOpacity,e.opacity),t.drawArrays(t.TRIANGLES,0,3)},te=e=>{if(M=0,!P||document.hidden)return;const n=d.current,i=E?I((e-E)/1e3,5e-4,.05):1/60;E=e;const s=n.disableAnimation||S?0:1;n.intro&&!S&&o.reveal<1?(o.reveal=Math.min(1,o.reveal+i/Ge),o.boost=Math.max(o.boost,Math.pow(1-o.reveal,2)*1.4)):(!n.intro||S)&&(o.reveal=1);const u=n.starSpeed/10*(n.reverse?-1:1);o.time+=i*s,o.gloss+=i*u*s,o.depth+=i*u*n.speed*s*(1+o.boost*14),o.angle+=i*n.rotationSpeed*s,o.boost*=Math.exp(-i*1.3),o.boost<.001&&(o.boost=0);const g=1-Math.exp(-i/.325),A=n.mouseInteraction&&p.inside&&!S;A&&(o.mx+=(p.x-o.mx)*g,o.my+=(p.y-o.my)*g);const b=A?1:0;o.active+=(b-o.active)*g,Math.abs(b-o.active)<.001&&(o.active=b),H(),s>0||o.boost>0||o.active!==b||o.reveal<1?M=requestAnimationFrame(te):E=0},C=()=>{!M&&P&&!document.hidden&&(M=requestAnimationFrame(te))},U=()=>{const e=d.current,n=Math.max(1,v.clientWidth),i=Math.max(1,v.clientHeight),s=Math.min(e.dpr||window.devicePixelRatio||1,2);m.width=Math.max(1,Math.round(n*s)),m.height=Math.max(1,Math.round(i*s)),H(),C()},oe=e=>{const n=v.getBoundingClientRect(),i=e.clientX-n.left,s=e.clientY-n.top;p.inside=i>=0&&s>=0&&i<=n.width&&s<=n.height,p.x=i/Math.max(1,n.width),p.y=1-s/Math.max(1,n.height)},ne=e=>{oe(e),C()},ae=e=>{const n=d.current;oe(e),!(!p.inside||!n.clickWarp||S)&&(o.boost=Math.min(1.6,o.boost+1),C())},_=e=>{e.pointerType!=="mouse"&&(p.inside=!1)},re=()=>{p.inside=!1},ie=()=>{E=0,C()},se=new ResizeObserver(U);se.observe(v);const ue=new IntersectionObserver(e=>{P=e.some(n=>n.isIntersecting),P&&(E=0,C())});ue.observe(v),window.addEventListener("pointermove",ne,{passive:!0}),window.addEventListener("pointerdown",ae,{passive:!0}),window.addEventListener("pointerup",_,{passive:!0}),window.addEventListener("pointercancel",_,{passive:!0}),document.documentElement.addEventListener("pointerleave",re),document.addEventListener("visibilitychange",ie),U();const le=h.autoCenterRepulsion>0||h.mouseInteraction&&h.mouseRepulsion,B=h.palette.length>0;(h.clickWarp||h.intro)&&O(B,!1,!0),le&&O(B,!0,!1),le&&h.clickWarp&&O(B,!0,!0);let ce=d.current.dpr;return k.current=()=>{const e=d.current;if(e.dpr!==ce){ce=e.dpr,U();return}M||H(),C()},()=>{var e;cancelAnimationFrame(M),k.current=null,se.disconnect(),ue.disconnect(),window.removeEventListener("pointermove",ne),window.removeEventListener("pointerdown",ae),window.removeEventListener("pointerup",_),window.removeEventListener("pointercancel",_),document.documentElement.removeEventListener("pointerleave",re),document.removeEventListener("visibilitychange",ie),F.forEach(n=>n.program&&t.deleteProgram(n.program)),t.deleteBuffer(Q),t.deleteVertexArray(G),(e=t.getExtension("WEBGL_lose_context"))==null||e.loseContext()}},[]),T.useEffect(()=>{var v;(v=k.current)==null||v.call(k)}),me.jsx("div",{ref:X,className:`galaxy-container${$?` ${$}`:""}`,style:Oe,...Pe,children:me.jsx("canvas",{ref:j,className:"galaxy-canvas","aria-hidden":"true"})})};export{Ne as default};
