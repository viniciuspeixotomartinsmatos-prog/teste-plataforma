import{a as R,j as re}from"./index-DrbxZl7q.js";const V=8,Ee=1.8,ie={up:[0,1],down:[0,-1],left:[-1,0],right:[1,0]},Ae=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,Le=`
float hash(vec3 p3) {
  p3 = fract(p3 * 0.1031);
  p3 += dot(p3, p3.zyx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float smin(float a, float b, float k) {
  float r = exp2(-a / k) + exp2(-b / k);
  return -k * log2(r);
}

float sinlerp(float a, float b, float w) {
  return mix(a, b, (sin(w * 3.14159265 - 3.14159265 / 2.0) + 1.0) / 2.0);
}

float vn(vec2 p, float s, float seed) {
  vec2 cellp = floor(p / s);
  vec2 relp = mod(p, s);
  float g1 = hash(vec3(cellp, seed));
  float g2 = hash(vec3(cellp.x + 1.0, cellp.y, seed));
  float g3 = hash(vec3(cellp.x + 1.0, cellp.y + 1.0, seed));
  float g4 = hash(vec3(cellp.x, cellp.y + 1.0, seed));
  float bx = sinlerp(g1, g2, relp.x / s);
  float tx = sinlerp(g4, g3, relp.x / s);
  return sinlerp(bx, tx, relp.y / s);
}

float dbn(vec2 p, float s, float seed) {
  float o = s / 2.0;
  float n0 = vn(p, s, seed);
  float n1 = vn(p + vec2(o, o), s, seed + 0.1);
  float n2 = vn(p + vec2(-o, o), s, seed + 0.2);
  float n3 = vn(p + vec2(o, -o), s, seed + 0.3);
  float n4 = vn(p + vec2(-o, -o), s, seed + 0.4);
  return (2.0 * n0 + 1.5 * n1 + 1.25 * n2 + 1.125 * n3 + n4) / 7.0;
}
`,Ce=`#version 300 es
precision highp float;
precision highp int;
uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uFlow;
uniform float uSpeed;
uniform float uScale;
uniform float uTurbulence;
uniform float uFluidity;
uniform float uRimWidth;
uniform float uSharpness;
uniform float uShimmer;
uniform float uGlow;
uniform float uLine;
uniform float uMaxHalf;
uniform vec3 uColors[${V}];
uniform int uColorCount;
uniform vec4 uMagnet;
uniform vec4 uSwirl;
uniform float uReveal;
uniform float uLight;
uniform float uOpaque;
uniform vec3 uBackground;
uniform float uOpacity;
out vec4 outColor;
${Le}

vec3 palette(float h) {
  float x = clamp(h, 0.0, 1.0) * float(uColorCount - 1);
  int i = int(floor(x));
  int j = min(i + 1, uColorCount - 1);
  return mix(uColors[i], uColors[j], smoothstep(0.0, 1.0, x - float(i)));
}

void main() {
  float ref = 700.0 / max(uScale, 0.05);
  vec2 frag = gl_FragCoord.xy;
  vec2 toMagnet = (frag - uMagnet.xy) / uResolution.y;
  float pull = uMagnet.z * exp(-dot(toMagnet, toMagnet) / (uMagnet.w * uMagnet.w));
  if (pull > 0.001) {
    float angle = pull * 0.55;
    float c = cos(angle);
    float s = sin(angle);
    frag = uMagnet.xy + mat2(c, s, -s, c) * (frag - uMagnet.xy);
  }
  if (uSwirl.w > 0.0) {
    vec2 d = frag - uSwirl.xy;
    float reach = uSwirl.z;
    float angle = uSwirl.w * exp(-dot(d, d) / (reach * reach));
    float c = cos(angle);
    float s = sin(angle);
    frag = uSwirl.xy + mat2(c, s, -s, c) * d;
  }
  vec2 p = frag / uResolution.y * ref;

  float spd = 200.0 * uSpeed;
  float t = uTime;
  vec2 dir = uFlow;
  vec2 perp = vec2(-dir.y, dir.x);
  float distort1 = vn(p + perp * (t * spd), 60.0, 10.0) * 50.0 * uTurbulence;
  float distort2 = vn(p - perp * (t * spd), 120.0, 15.0) * 100.0 * uTurbulence;
  float peaks = dbn(p + distort1 + dir * (t * spd * 0.5), 40.0, 1.0);
  float peaks2 = dbn(p + distort2 - dir * (t * spd * 0.5), 40.0, 0.0);
  float field = smin(peaks, peaks2, max(uFluidity, 0.001));

  float slope = length(vec2(dFdx(field), dFdy(field)));
  float gap = abs(field - 0.4);
  float pixels = gap / max(slope, 1e-6);
  float halfBand = max(uRimWidth, 0.001) * 0.5;
  float across = max(gap / halfBand, pixels / uMaxHalf);
  float band = 5.0 * uRimWidth * (1.0 - across);
  float reveal = smoothstep(0.2, 0.85, pull);
  float shimmer = vn(p + dir * (t * spd * 0.5), 60.0, 12.0) * uShimmer * (1.0 - reveal * 0.75);
  float lit = clamp(band - shimmer, 0.0, 1.0);
  float glow = pow(lit, uSharpness) * uGlow * (1.0 + reveal * 0.25);
  float core = uLine > 0.0 ? smoothstep(uLine + 0.75, uLine - 0.75, pixels) * max(smoothstep(0.08, 0.6, glow), reveal) : 0.0;
  float shine = clamp(glow, 0.0, 1.0);
  float energy = max(shine * shine, core * 0.85) * uReveal;

  float h = clamp(0.5 + (peaks - peaks2) * 0.8, 0.0, 1.0);
  vec3 tint = palette(h);

  if (uLight > 0.5) {
    float chroma = max(tint.r, max(tint.g, tint.b)) - min(tint.r, min(tint.g, tint.b));
    vec3 ink = mix(vec3(0.07, 0.07, 0.08), tint * 0.55, clamp(chroma * 1.6, 0.0, 1.0));
    float cover = energy * uOpacity;
    outColor = uOpaque > 0.5 ? vec4(mix(uBackground, ink, cover), 1.0) : vec4(ink * cover, cover);
    return;
  }

  vec3 light = tint * energy * uOpacity;
  outColor = uOpaque > 0.5 ? vec4(uBackground + light, 1.0) : vec4(light, max(light.r, max(light.g, light.b)));
}`,ae=(n,m,d)=>Math.min(d,Math.max(m,n)),se=(n,m,d)=>{const i=n.createShader(m);return i?(n.shaderSource(i,d),n.compileShader(i),n.getShaderParameter(i,n.COMPILE_STATUS)?i:(n.deleteShader(i),null)):null},Fe=n=>{const m=se(n,n.VERTEX_SHADER,Ae),d=se(n,n.FRAGMENT_SHADER,Ce),i=n.createProgram();if(!m||!d||!i)return null;if(n.attachShader(i,m),n.attachShader(i,d),n.bindAttribLocation(i,0,"aPosition"),n.linkProgram(i),n.deleteShader(m),n.deleteShader(d),!n.getProgramParameter(i,n.LINK_STATUS))return n.deleteProgram(i),null;const F={},O=n.getProgramParameter(i,n.ACTIVE_UNIFORMS);for(let E=0;E<O;E++){const A=n.getActiveUniform(i,E);A&&(F[A.name.replace("[0]","")]=n.getUniformLocation(i,A.name))}return{program:i,uniforms:F}},Pe=({colors:n=["#ffffff","#ffffff","#ffffff"],speed:m=.5,scale:d=1.6,turbulence:i=1,fluidity:F=.1,rimWidth:O=.2,sharpness:E=2.5,shimmer:A=1.5,glow:le=2,lineWidth:ue=1,flowDirection:fe="down",opacity:ce=1,mouseInteraction:me=!0,mouseStrength:de=1,mouseRadius:pe=.35,mouseDampening:he=.15,clickSwirl:ve=!0,intro:ge=!0,lightMode:xe=!1,transparent:we=!0,backgroundColor:ye,paused:Me=!1,dpr:be,mixBlendMode:N,className:U="",style:q,...Se})=>{const z=R.useRef(null),G=R.useRef(null),L=R.useRef(null),j={colors:Array.isArray(n)&&n.length?n.slice(0,V):["#ffffff"],speed:m,scale:Math.max(.05,d),turbulence:i,fluidity:Math.max(.001,F),rimWidth:Math.max(.001,O),sharpness:Math.max(.1,E),shimmer:Math.max(0,A),glow:Math.max(0,le),lineWidth:Math.max(0,ue),flow:ie[fe]??ie.down,opacity:ae(ce,0,1),mouseInteraction:me,mouseStrength:Math.max(0,de),mouseRadius:Math.max(.01,pe),mouseDampening:Math.max(0,he),clickSwirl:ve,intro:ge,lightMode:xe,transparent:we,backgroundColor:ye,paused:Me,dpr:be},h=R.useRef(j);return h.current=j,R.useEffect(()=>{var oe;const c=z.current,f=G.current,t=f==null?void 0:f.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!c||!f||!t)return;const T=Fe(t);if(!T)return;const r=T.uniforms,H=t.createBuffer(),_=t.createVertexArray();t.bindVertexArray(_),t.bindBuffer(t.ARRAY_BUFFER,H),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),t.STATIC_DRAW),t.enableVertexAttribArray(0),t.vertexAttribPointer(0,2,t.FLOAT,!1,0,0);const x=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),I=new Map,X=(e,o)=>{if(!e)return o;const a=String(e);if(I.has(a))return I.get(a);let s=o;if(x){x.clearRect(0,0,1,1),x.fillStyle="#000000",x.fillStyle=a,x.fillRect(0,0,1,1);const[p,S,g]=x.getImageData(0,0,1,1).data;s=[p/255,S/255,g/255]}return I.set(a,s),s},$=new Float32Array(V*3),C=((oe=window.matchMedia)==null?void 0:oe.call(window,"(prefers-reduced-motion: reduce)").matches)??!1,l={x:0,y:0,inside:!1},u={x:0,y:0,active:0},v={x:0,y:0,age:10};let Y=0,w=h.current.intro&&!C?0:1,y=0,M=0,k=!0;const W=()=>{const e=h.current,o=f.width/Math.max(1,c.clientWidth);e.colors.forEach((S,g)=>$.set(X(S,[1,1,1]),g*3));const a=Math.min(1,w);t.viewport(0,0,f.width,f.height),t.useProgram(T.program),t.bindVertexArray(_),t.uniform2f(r.uResolution,f.width,f.height),t.uniform1f(r.uTime,Y),t.uniform2f(r.uFlow,e.flow[0],e.flow[1]),t.uniform1f(r.uSpeed,e.speed),t.uniform1f(r.uScale,e.scale),t.uniform1f(r.uTurbulence,e.turbulence),t.uniform1f(r.uFluidity,e.fluidity),t.uniform1f(r.uRimWidth,e.rimWidth),t.uniform1f(r.uSharpness,e.sharpness),t.uniform1f(r.uShimmer,e.shimmer),t.uniform1f(r.uGlow,e.glow),t.uniform1f(r.uLine,e.lineWidth*o*.5),t.uniform1f(r.uMaxHalf,28*o),t.uniform3fv(r.uColors,$),t.uniform1i(r.uColorCount,e.colors.length),t.uniform4f(r.uMagnet,u.x,u.y,u.active*e.mouseStrength,e.mouseRadius);const s=v.age,p=1.9*Math.min(1,s/.23)*Math.exp(-Math.max(0,s-.23)*1.1);t.uniform4f(r.uSwirl,v.x,v.y,f.height*.22*(1+s*.5),s<6?p:0),t.uniform1f(r.uReveal,a*a*(3-2*a)),t.uniform1f(r.uLight,e.lightMode?1:0),t.uniform1f(r.uOpaque,e.transparent?0:1),t.uniform3fv(r.uBackground,X(e.backgroundColor,e.lightMode?[1,1,1]:[.0706,.0588,.0902])),t.uniform1f(r.uOpacity,e.opacity),t.drawArrays(t.TRIANGLES,0,3)},K=e=>{if(y=0,!k||document.hidden)return;const o=h.current,a=M?ae((e-M)/1e3,5e-4,.05):1/60;M=e;const s=o.paused||C?0:1;Y+=a*s,v.age+=a,o.intro&&!C&&w<1?w=Math.min(1,w+a/Ee):(!o.intro||C)&&(w=1);const p=o.mouseInteraction&&l.inside,S=o.mouseDampening>0?1-Math.exp(-a/o.mouseDampening):1;p&&(u.x+=(l.x-u.x)*S,u.y+=(l.y-u.y)*S);const g=p?1:0;u.active+=(g-u.active)*(1-Math.exp(-a/.3)),Math.abs(g-u.active)<.001&&(u.active=g),W(),s>0||u.active!==g||w<1||v.age<6?y=requestAnimationFrame(K):M=0},b=()=>{!y&&k&&!document.hidden&&(y=requestAnimationFrame(K))},B=()=>{const e=h.current,o=Math.max(1,c.clientWidth),a=Math.max(1,c.clientHeight),s=Math.min(e.dpr||window.devicePixelRatio||1,2);f.width=Math.max(1,Math.round(o*s)),f.height=Math.max(1,Math.round(a*s)),W(),b()},Re=e=>{const o=c.getBoundingClientRect(),a=e.clientX-o.left,s=e.clientY-o.top,p=f.width/Math.max(1,o.width);l.inside=a>=0&&s>=0&&a<=o.width&&s<=o.height,l.x=a*p,l.y=(o.height-s)*p},D=e=>{const o=l.inside;Re(e),l.inside&&!o&&u.active<.05&&(u.x=l.x,u.y=l.y),b()},J=e=>{D(e),!(!l.inside||!h.current.clickSwirl||C)&&(v.x=l.x,v.y=l.y,v.age=0,b())},P=e=>{e.pointerType!=="mouse"&&(l.inside=!1)},Q=()=>{l.inside=!1},Z=()=>{M=0,b()},ee=new ResizeObserver(B);ee.observe(c);const te=new IntersectionObserver(e=>{k=e.some(o=>o.isIntersecting),k&&(M=0,b())});te.observe(c),window.addEventListener("pointermove",D,{passive:!0}),window.addEventListener("pointerdown",J,{passive:!0}),window.addEventListener("pointerup",P,{passive:!0}),window.addEventListener("pointercancel",P,{passive:!0}),document.documentElement.addEventListener("pointerleave",Q),document.addEventListener("visibilitychange",Z),B();let ne=h.current.dpr;return L.current=()=>{const e=h.current;if(e.dpr!==ne){ne=e.dpr,B();return}y||W(),b()},()=>{var e;cancelAnimationFrame(y),L.current=null,ee.disconnect(),te.disconnect(),window.removeEventListener("pointermove",D),window.removeEventListener("pointerdown",J),window.removeEventListener("pointerup",P),window.removeEventListener("pointercancel",P),document.documentElement.removeEventListener("pointerleave",Q),document.removeEventListener("visibilitychange",Z),t.deleteProgram(T.program),t.deleteBuffer(H),t.deleteVertexArray(_),(e=t.getExtension("WEBGL_lose_context"))==null||e.loseContext()}},[]),R.useEffect(()=>{var c;(c=L.current)==null||c.call(L)}),re.jsx("div",{ref:z,className:`flux-lines-container${U?` ${U}`:""}`,style:N?{...q,mixBlendMode:N}:q,...Se,children:re.jsx("canvas",{ref:G,className:"flux-lines-canvas","aria-hidden":"true"})})};export{Pe as default};
