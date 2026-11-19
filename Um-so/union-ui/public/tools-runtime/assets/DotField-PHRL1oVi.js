import{a as D,j as Ee}from"./index-DrbxZl7q.js";const Ve=9e6,qe=12e4,G={grid:0,hex:1,spiral:2,scatter:3},He=Math.PI*(3-Math.sqrt(5)),Ue=`#version 300 es
precision highp float;
layout(location = 0) in vec4 aDot;
uniform vec2 uSize;
uniform float uPixel;
uniform float uRadius;
uniform float uCell;
uniform vec4 uLens;
uniform vec2 uWarp;
uniform vec3 uGlow;
uniform vec3 uFrom;
uniform vec3 uTo;
uniform vec4 uGlowColor;
uniform vec3 uGradient;
uniform float uTime;
uniform float uWave;
uniform float uSparkle;
uniform float uFocus;
uniform float uBase;
uniform float uLight;
out vec2 vLocal;
out float vRadius;
out float vBlur;
out float vHalo;
out float vHaloWidth;
out vec3 vColor;
out float vAlpha;

vec3 toRgb(vec3 lab) {
  float l = lab.x + 0.3963377774 * lab.y + 0.2158037573 * lab.z;
  float m = lab.x - 0.1055613458 * lab.y - 0.0638541728 * lab.z;
  float s = lab.x - 0.0894841775 * lab.y - 1.291485548 * lab.z;
  vec3 lms = vec3(l * l * l, m * m * m, s * s * s);
  vec3 lin = clamp(vec3(
    4.0767416621 * lms.x - 3.3077115913 * lms.y + 0.2309699292 * lms.z,
    -1.2684380046 * lms.x + 2.6097574011 * lms.y - 0.3413193965 * lms.z,
    -0.0041960863 * lms.x - 0.7034186147 * lms.y + 1.707614701 * lms.z
  ), 0.0, 1.0);
  return mix(lin * 12.92, 1.055 * pow(lin, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, lin));
}

vec3 blend(vec3 a, vec3 b, float t) {
  vec2 ab = mix(a.yz, b.yz, t);
  float chroma = mix(length(a.yz), length(b.yz), t);
  float len = length(ab);
  return vec3(mix(a.x, b.x, t), len > 1e-5 ? ab * (chroma / len) : ab);
}

vec3 wave(vec2 p, float t) {
  float ay = p.x * 0.018 + t + 1.1 * sin(p.y * 0.016 - t * 0.4);
  float ax = p.y * 0.021 + t * 0.7 + 1.3 * sin(p.x * 0.013 + t * 0.3);
  float spread = cos(ay) * 0.0176 * cos(p.y * 0.016 - t * 0.4) + 0.5 * cos(ax) * 0.0169 * cos(p.x * 0.013 + t * 0.3);
  return uWave * vec3(0.5 * sin(ax), sin(ay), spread);
}

void main() {
  vec2 corner = vec2(float(gl_VertexID & 1), float(gl_VertexID >> 1)) * 2.0 - 1.0;
  vec2 center = uSize * 0.5;
  vec3 swell = wave(aDot.xy, uTime);
  vec2 source = center + (aDot.xy - center) * mix(1.12, 1.0, uFocus) + swell.xy;

  vec2 rel = source - uLens.xy;
  float x = length(rel) / uLens.z;
  float y = clamp(1.0 - x * x, 0.0, 1.0);
  float w = y * y * y;
  float k = uWarp.x * uLens.w;
  float grow = 1.0 + k * w;
  float spread = 1.0 + k * (w - 6.0 * x * x * y * y);
  float theta = uWarp.y * uLens.w * w;
  vec2 turn = vec2(cos(theta), sin(theta));
  vec2 display = uLens.xy + vec2(turn.x * rel.x - turn.y * rel.y, turn.y * rel.x + turn.x * rel.y) * grow;
  float scale = sqrt(max(grow * spread, 0.02));

  float spark = 0.0;
  if (uSparkle > 0.0) {
    float phase = 0.5 + 0.5 * sin(uTime * (0.55 + aDot.w * 0.9) + aDot.z * 6.2831853);
    spark = pow(phase, 48.0) * step(0.72, fract(aDot.z * 7.31 + aDot.w * 3.17)) * uSparkle;
  }

  float pool = 0.0;
  if (uGlow.x > 0.0) {
    float g = length(display - uLens.xy) / uGlow.x;
    float q = clamp(1.0 - g * g, 0.0, 1.0);
    pool = q * q * uGlow.y * uLens.w;
  }

  float radius = uRadius * (1.0 + 0.7 * spark);
  float device = radius * scale * uPixel;
  float fade = 1.0;
  if (device < 0.75) {
    fade = device * device / 0.5625;
    radius = 0.75 / (scale * uPixel);
  }
  float blur = (1.0 - uFocus) * uCell * 0.42;
  float energy = pow(radius / (radius + blur), 1.15);
  float halo = pool * uGlow.z;
  float haloWidth = 2.0 + radius * 1.5;
  float pad = radius + blur * 1.2 + 1.5 / (scale * uPixel) + (halo > 0.0 ? haloWidth * 2.5 : 0.0);

  float t = clamp(dot(aDot.xy - center, uGradient.xy) / uGradient.z + 0.5, 0.0, 1.0);
  vec3 tone = blend(uFrom, uTo, t);
  vec3 deep = vec3(tone.x * 0.72, tone.yz * 1.3);
  vec3 base = toRgb(tone);
  vec3 lit = toRgb(mix(deep, uGlowColor.xyz, uGlowColor.w));
  vec3 color = mix(base, lit, clamp(pool, 0.0, 1.0) * 0.8);
  color = mix(color, uLight > 0.5 ? color * 0.6 : vec3(1.0), spark * 0.55);

  vLocal = corner * pad;
  vRadius = radius + blur;
  vBlur = blur * 0.7;
  vHalo = halo;
  vHaloWidth = haloWidth;
  vColor = color;
  float shade = clamp(1.0 - swell.z * 2.5, 0.4, 1.6);
  vAlpha = mix(min(uBase * shade, 1.0), 1.0, clamp(max(pool, spark), 0.0, 1.0)) * fade * energy * smoothstep(0.0, 0.25, uFocus + 0.08);
  vec2 point = display + corner * pad * scale;
  gl_Position = vec4(point.x / uSize.x * 2.0 - 1.0, 1.0 - point.y / uSize.y * 2.0, 0.0, 1.0);
}`,Xe=`#version 300 es
precision highp float;
uniform float uOpacity;
in vec2 vLocal;
in float vRadius;
in float vBlur;
in float vHalo;
in float vHaloWidth;
in vec3 vColor;
in float vAlpha;
out vec4 fragColor;

void main() {
  float dist = length(vLocal);
  float d = dist - vRadius;
  float edge = max(fwidth(dist), 1e-4) + vBlur;
  float cover = 1.0 - smoothstep(-0.5 * edge, 0.5 * edge, d);
  float glow = vHalo * exp(-max(d, 0.0) / vHaloWidth) * 0.5;
  float alpha = min(cover + glow, 1.0) * vAlpha * uOpacity;
  if (alpha < 0.002) discard;
  fragColor = vec4(vColor * alpha, alpha);
}`,v=(o,i,s)=>Math.min(s,Math.max(i,o)),Se=o=>{const i=String(o||"").trim(),s=/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(i);if(s){const c=s[1].length===3?s[1].replace(/./g,l=>l+l):s[1];return[0,2,4].map(l=>parseInt(c.slice(l,l+2),16)/255)}const t=/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(i);return t?[t[1],t[2],t[3]].map(c=>v(parseFloat(c)/255,0,1)):null},Ye=o=>o<=.04045?o/12.92:Math.pow((o+.055)/1.055,2.4),ze=o=>{const[i,s,t]=o.map(Ye),c=Math.cbrt(.4122214708*i+.5363325363*s+.0514459929*t),l=Math.cbrt(.2119034982*i+.6806995451*s+.1073969566*t),d=Math.cbrt(.0883024619*i+.2817188376*s+.6299787005*t);return[.2104542553*c+.793617785*l-.0040720468*d,1.9779984951*c-2.428592205*l+.4505937099*d,.0259040371*c+.7827717662*l-.808675766*d]},ae=(o,i,s)=>{const t=ze(Se(o)||i);if(!s)return t;const c=Math.atan2(t[2],t[1])*180/Math.PI,l=v(1-Math.abs(c-85)/40,0,1),d=.6+.16*l*l*(3-2*l);if(t[0]<=d)return t;const x=1+(t[0]-d)*1.6;return[d,t[1]*x,t[2]*x]},$e=o=>{const i=ze(Se(o)||[1,1,1]);return Math.hypot(i[1],i[2])},k=(o,i,s)=>{let t=Math.imul(o,374761393)+Math.imul(i,668265263)+Math.imul(s,1274126177)|0;return t=Math.imul(t^t>>>13,1274126177),t^=t>>>16,(t>>>0)/4294967296},je=(o,i,s)=>{let t=0;for(let c=1;c<48;c++){const l=c/48,d=(1-l*l)**3,x=l*o,_=1+i*d,P=s*d;t=Math.max(t,Math.hypot(x*(_*Math.cos(P)-1),x*_*Math.sin(P)))}return t},Ze=(o,i,s,t,c)=>{const l=o/2,d=i/2,x=-c,_=o+c,P=-c,X=i+c,O=[],N=(g,b,A,m)=>{g>=x&&g<=_&&b>=P&&b<=X&&O.push(g,b,A,m)};if(t===G.spiral){const g=s/Math.sqrt(Math.PI),b=Math.hypot(o/2+c,i/2+c),A=Math.ceil((b/g)**2);for(let m=0;m<A;m++){const w=g*Math.sqrt(m+.5),T=m*He;N(l+w*Math.cos(T),d+w*Math.sin(T),k(m,0,3),k(m,0,4))}}else{const g=t===G.hex?s*Math.sqrt(3)/2:s,b=Math.ceil((o/2+c)/s)+1,A=Math.ceil((i/2+c)/g)+1;for(let m=-A;m<=A;m++)for(let w=-b;w<=b;w++){let T=l+w*s+(t===G.hex&&m&1?s/2:0),S=d+m*g;t===G.scatter&&(T+=(k(w,m,1)-.5)*s*.8,S+=(k(w,m,2)-.5)*s*.8),N(T,S,k(w,m,3),k(w,m,4))}}return new Float32Array(O)},Ae=(o,i,s)=>{const t=o.createShader(i);return t?(o.shaderSource(t,s),o.compileShader(t),o.getShaderParameter(t,o.COMPILE_STATUS)?t:(console.error(o.getShaderInfoLog(t)),o.deleteShader(t),null)):null},Ke=o=>{const i=Ae(o,o.VERTEX_SHADER,Ue),s=Ae(o,o.FRAGMENT_SHADER,Xe),t=i&&s?o.createProgram():null;if(!i||!s||!t)return i&&o.deleteShader(i),s&&o.deleteShader(s),null;if(o.attachShader(t,i),o.attachShader(t,s),o.linkProgram(t),o.deleteShader(i),o.deleteShader(s),!o.getProgramParameter(t,o.LINK_STATUS))return console.error(o.getProgramInfoLog(t)),o.deleteProgram(t),null;const c={},l=o.getProgramParameter(t,o.ACTIVE_UNIFORMS);for(let d=0;d<l;d++){const x=o.getActiveUniform(t,d);x&&(c[x.name]=o.getUniformLocation(t,x.name))}return{program:t,uniforms:c}},ot=({dotRadius:o=1.5,dotSpacing:i=14,pattern:s="grid",gradientFrom:t="#5227FF",gradientTo:c="#FF9FFC",gradientAngle:l=135,cursorRadius:d=240,bulgeStrength:x=.6,twist:_=0,glowColor:P="#ffffff",glowRadius:X=160,glowIntensity:O=.8,baseOpacity:N=.55,waveAmplitude:g=0,sparkle:b=!1,speed:A=1,interactive:m=!0,holdToZoom:w=!0,intro:T=!0,lightMode:S=!1,opacity:Fe=1,maxDevicePixelRatio:Pe=2,className:re="",style:Te})=>{const se=D.useRef(null),ie=D.useRef(null),B=D.useRef(null),[ce,Ce]=D.useState(0),le=v(o,.25,12),Ie=le*2+v(i,1,200),ue=l*Math.PI/180,fe={radius:le,step:Ie,pattern:G[s]??G.grid,from:ae(t,[.32,.15,1],S),to:ae(c,[1,.62,.99],S),glowColor:ae(P,[1,1,1],S),glowWeight:S?v(($e(P)-.02)/.06,0,1):1,direction:[Math.sin(ue),-Math.cos(ue)],lensRadius:v(d,20,2e3),strength:v(x,-1,1),twist:v(_,-360,360)*Math.PI/180,glowRadius:Math.max(0,X),glowIntensity:v(O,0,2),base:v(N,0,1),wave:v(g,0,60),sparkle:b?1:0,speed:Math.max(0,A),interactive:m,holdToZoom:w,intro:T,light:S,opacity:v(Fe,0,1),maxRatio:v(Pe,.5,3)},W=D.useRef(fe);return W.current=fe,D.useEffect(()=>{var z;(z=B.current)==null||z.call(B)}),D.useEffect(()=>{const z=se.current,y=ie.current;if(!z||!y)return;const n=y.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance"}),V=n?Ke(n):null;if(!n||!V)return;const Y=window.matchMedia("(prefers-reduced-motion: reduce)").matches,$=n.createVertexArray(),j=n.createBuffer();n.bindVertexArray($),n.bindBuffer(n.ARRAY_BUFFER,j),n.enableVertexAttribArray(0),n.vertexAttribPointer(0,4,n.FLOAT,!1,16,0),n.vertexAttribDivisor(0,1),n.bindVertexArray(null);const p={width:1,height:1,ratio:1},u={x:0,y:0,inside:!1,down:!1},a={x:0,y:0,vx:0,vy:0,presence:0,zoom:0,ready:!1};let de="",Z=0,me=Math.random()*100,R=W.current.intro&&!Y&&ce===0?0:1,C=0,q=0,K=!0,J=document.visibilityState!=="hidden",Q=!1;const he=(r,e)=>{const f=r.strength>=0?r.strength*1.2:r.strength*.7;return v(f*(1+e*.6),-.85,1.45)},De=()=>{const r=W.current,e=je(r.lensRadius,he(r,r.holdToZoom?1:0),r.twist*(r.holdToZoom?1.6:1)),f=Math.ceil(e+r.wave+r.step*2),M=(p.width+f*2)*(p.height+f*2),F=Math.max(r.step,Math.sqrt(M/qe)),E=`${p.width}|${p.height}|${F}|${r.pattern}|${f}`;if(E===de)return;de=E;const I=Ze(p.width,p.height,F,r.pattern,f);Z=I.length/4,n.bindBuffer(n.ARRAY_BUFFER,j),n.bufferData(n.ARRAY_BUFFER,I,n.STATIC_DRAW)},ee=()=>{const r=W.current,e=z.getBoundingClientRect(),f=Math.max(1,e.width),M=Math.max(1,e.height),F=Math.min(window.devicePixelRatio||1,r.maxRatio,Math.sqrt(Ve/(f*M))),E=Math.max(1,Math.round(f*F)),I=Math.max(1,Math.round(M*F));(y.width!==E||y.height!==I)&&(y.width=E,y.height=I),p.width=f,p.height=M,p.ratio=E/f,De()},ve=r=>{if(C=0,Q)return;const e=W.current,f=v((r-q)/1e3||0,0,.05);q=Math.max(q,r),Y||(me+=f*e.speed),R<1&&(R=Math.min(1,R+f/1.8));const M=e.interactive&&u.inside;if(M&&(!a.ready||a.presence<.01)&&(a.x=u.x,a.y=u.y,a.vx=0,a.vy=0,a.ready=!0),a.ready){const te=1+2*f*18,oe=f*324,ne=f*oe,U=1/(te+ne),Oe=(te*a.x+f*a.vx+ne*u.x)*U,Ne=(te*a.y+f*a.vy+ne*u.y)*U;a.vx=(a.vx+oe*(u.x-a.x))*U,a.vy=(a.vy+oe*(u.y-a.y))*U,a.x=Oe,a.y=Ne}const F=M?1:0;a.presence+=(F-a.presence)*(1-Math.exp(-f/(M?.18:.4)));const E=M&&u.down&&e.holdToZoom?1:0;a.zoom+=(E-a.zoom)*(1-Math.exp(-f/.14));const I=R<.5?4*R*R*R:1-Math.pow(-2*R+2,3)/2,_e=a.presence*a.presence*(3-2*a.presence),ke=Math.abs(p.width*e.direction[0])+Math.abs(p.height*e.direction[1]);n.viewport(0,0,y.width,y.height),n.clearColor(0,0,0,0),n.clear(n.COLOR_BUFFER_BIT),n.enable(n.BLEND),n.blendFunc(n.ONE,n.ONE_MINUS_SRC_ALPHA),n.useProgram(V.program),n.bindVertexArray($);const h=V.uniforms;n.uniform2f(h.uSize,p.width,p.height),n.uniform1f(h.uPixel,p.ratio),n.uniform1f(h.uRadius,e.radius),n.uniform1f(h.uCell,e.step),n.uniform4f(h.uLens,a.x,a.y,e.lensRadius*(1+a.zoom*.12),_e),n.uniform2f(h.uWarp,he(e,a.zoom),e.twist*(1+a.zoom*.6)),n.uniform3f(h.uGlow,e.glowRadius*(1+a.zoom*.1),e.glowIntensity*(1+a.zoom*.25),e.light?0:1),n.uniform3f(h.uFrom,e.from[0],e.from[1],e.from[2]),n.uniform3f(h.uTo,e.to[0],e.to[1],e.to[2]),n.uniform4f(h.uGlowColor,e.glowColor[0],e.glowColor[1],e.glowColor[2],e.glowWeight),n.uniform3f(h.uGradient,e.direction[0],e.direction[1],Math.max(ke,1)),n.uniform1f(h.uTime,me),n.uniform1f(h.uWave,e.wave),n.uniform1f(h.uSparkle,e.sparkle),n.uniform1f(h.uFocus,I),n.uniform1f(h.uBase,e.light?Math.min(1,e.base*1.3):e.base),n.uniform1f(h.uLight,e.light?1:0),n.uniform1f(h.uOpacity,e.opacity),Z&&n.drawArraysInstanced(n.TRIANGLE_STRIP,0,4,Z);const Ge=Math.abs(u.x-a.x)+Math.abs(u.y-a.y)>.05||Math.hypot(a.vx,a.vy)>.5,Be=Math.abs(F-a.presence)>.002||Math.abs(E-a.zoom)>.002||a.presence>.002&&Ge,We=!Y&&e.speed>0&&(e.wave>0||e.sparkle>0);(R<1||Be||We)&&K&&J&&(C=requestAnimationFrame(ve))},L=()=>{C||Q||!K||!J||(q=performance.now(),C=requestAnimationFrame(ve))};B.current=()=>{ee(),L()};const pe=r=>{const e=z.getBoundingClientRect();return{x:r.clientX-e.left,y:r.clientY-e.top,inside:r.clientX>=e.left&&r.clientX<=e.right&&r.clientY>=e.top&&r.clientY<=e.bottom}},xe=r=>{const e=pe(r);u.x=e.x,u.y=e.y,u.inside=e.inside,L()},we=r=>{const e=pe(r);u.x=e.x,u.y=e.y,u.inside=e.inside,u.down=e.inside,L()},ye=()=>{u.inside=!1,u.down=!1,L()},H=r=>{u.down=!1,r.pointerType!=="mouse"&&(u.inside=!1),L()};window.addEventListener("pointermove",xe,{passive:!0}),window.addEventListener("pointerdown",we,{passive:!0}),window.addEventListener("pointerup",H,{passive:!0}),window.addEventListener("pointercancel",H,{passive:!0}),document.documentElement.addEventListener("pointerleave",ye);const ge=r=>{r.preventDefault(),Q=!0,cancelAnimationFrame(C),C=0},be=()=>Ce(r=>r+1);y.addEventListener("webglcontextlost",ge),y.addEventListener("webglcontextrestored",be);const Me=new ResizeObserver(()=>{ee(),L()});Me.observe(z);const Re=new IntersectionObserver(r=>{K=r.some(e=>e.isIntersecting),L()});Re.observe(z);const Le=()=>{J=document.visibilityState!=="hidden",L()};return document.addEventListener("visibilitychange",Le),ee(),L(),()=>{cancelAnimationFrame(C),B.current=null,Me.disconnect(),Re.disconnect(),window.removeEventListener("pointermove",xe),window.removeEventListener("pointerdown",we),window.removeEventListener("pointerup",H),window.removeEventListener("pointercancel",H),document.documentElement.removeEventListener("pointerleave",ye),document.removeEventListener("visibilitychange",Le),y.removeEventListener("webglcontextlost",ge),y.removeEventListener("webglcontextrestored",be),n.isContextLost()||(n.deleteBuffer(j),n.deleteVertexArray($),n.deleteProgram(V.program))}},[ce]),Ee.jsx("div",{ref:se,className:`dot-field${re?` ${re}`:""}`,style:Te,children:Ee.jsx("canvas",{ref:ie,className:"dot-field__canvas","aria-hidden":"true"})})};export{ot as default};
