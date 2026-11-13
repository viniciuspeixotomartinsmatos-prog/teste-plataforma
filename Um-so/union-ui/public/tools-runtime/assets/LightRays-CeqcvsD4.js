import{a as L,j as ye}from"./index-DrbxZl7q.js";const Ye=24e5,Y=4,Se={"top-left":{anchor:[0,-.2],dir:[0,1]},"top-center":{anchor:[.5,-.2],dir:[0,1]},"top-right":{anchor:[1,-.2],dir:[0,1]},left:{anchor:[-.2,.5],dir:[1,0]},right:{anchor:[1.2,.5],dir:[-1,0]},"bottom-left":{anchor:[0,1.2],dir:[0,-1]},"bottom-center":{anchor:[.5,1.2],dir:[0,-1]},"bottom-right":{anchor:[1,1.2],dir:[0,-1]}},$e=`#version 300 es
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
void main() {
  gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);
}`,ke=`#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform float uScale;
uniform float uTime;
uniform vec2 uSource;
uniform vec2 uAim;
uniform float uReach;
uniform vec3 uColor;
uniform float uSpread;
uniform float uLength;
uniform float uFade;
uniform float uSaturation;
uniform float uPulsating;
uniform float uNoise;
uniform float uDistortion;
uniform float uDensity;
uniform float uSharpness;
uniform float uGlow;
uniform float uHaze;
uniform float uAtmosphere;
uniform float uIntensity;
uniform vec4 uShadow;
uniform vec4 uPulses[${Y}];
uniform vec2 uIntro;
uniform float uLight;
uniform float uOpacity;
out vec4 fragColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = p - i;
  vec2 w = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), w.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), w.x), w.y);
}

float shape(float strength, float width) {
  float edge = max(mix(0.5, 0.08, uSharpness), width);
  return mix(strength, smoothstep(0.62 - edge, 0.62 + edge, strength), uSharpness);
}

void main() {
  vec2 coord = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y) / uScale;
  vec2 delta = coord - uSource;
  float distance = length(delta);
  vec2 dir = delta / max(distance, 1e-4);
  float cosAngle = dot(dir, uAim);
  float angle = cosAngle + uDistortion * sin(uTime * 2.0 + distance * 0.02) * 0.2;
  float slope = fwidth(angle);
  float depth = distance / uReach;

  float source = exp(-depth * depth * 9.0) * 0.9 + exp(-depth * 3.2) * 0.25;
  float glowLight = uGlow * source * smoothstep(-0.2, 0.6, cosAngle);
  float spread = pow(max(angle, 0.0), 1.0 / uSpread);
  float lengthFalloff = clamp(1.0 - distance / (uReach * uLength), 0.0, 1.0);
  float fadeFalloff = clamp(1.0 - distance / (uReach * uFade), 0.5, 1.0);
  float envelope = spread * lengthFalloff * fadeFalloff;
  float reveal = uIntensity * uIntro.y * (1.0 - smoothstep(uIntro.x - 0.35, uIntro.x, depth));
  if ((envelope * 1.6 + glowLight) * reveal < 0.0015) {
    fragColor = vec4(0.0);
    return;
  }

  float phaseA = angle * 36.2214 * uDensity + uTime * 1.5;
  float phaseB = -angle * 21.11349 * uDensity + uTime * 1.5;
  float phaseC = angle * 22.3991 * uDensity + uTime * 1.1;
  float phaseD = -angle * 18.0234 * uDensity + uTime * 1.1;
  float strengthA = clamp(0.75 + 0.15 * sin(phaseA) + 0.2 * cos(phaseB), 0.0, 1.0);
  float strengthB = clamp(0.75 + 0.15 * sin(phaseC) + 0.2 * cos(phaseD), 0.0, 1.0);
  float widthA = abs(0.15 * 36.2214 * cos(phaseA) + 0.2 * 21.11349 * sin(phaseB)) * uDensity * slope;
  float widthB = abs(0.15 * 22.3991 * cos(phaseC) + 0.2 * 18.0234 * sin(phaseD)) * uDensity * slope;
  float pulseA = uPulsating > 0.5 ? 0.8 + 0.2 * sin(uTime * 4.5) : 1.0;
  float pulseB = uPulsating > 0.5 ? 0.8 + 0.2 * sin(uTime * 3.3) : 1.0;
  float rayLight = envelope * (0.5 * shape(strengthA, widthA) * pulseA + 0.4 * shape(strengthB, widthB) * pulseB);

  if (uHaze > 0.0) {
    float around = atan(uAim.x * dir.y - uAim.y * dir.x, cosAngle);
    vec2 drift = vec2(around * 2.2 + uTime * 0.035, depth * 2.6 - uTime * 0.11);
    float fog = 0.65 * valueNoise(drift * vec2(3.0, 1.0)) + 0.35 * valueNoise(drift * vec2(7.0, 2.3) + 4.1);
    rayLight *= mix(1.0, 0.25 + 1.2 * fog, uHaze);
  }

  if (uShadow.z > 0.0) {
    vec2 toCursor = uShadow.xy - uSource;
    float cursorDistance = length(toCursor);
    float along = dot(delta, toCursor) / max(cursorDistance * cursorDistance, 1e-4);
    float side = abs(delta.x * toCursor.y - delta.y * toCursor.x) / max(cursorDistance, 1e-4);
    float trail = max(along - 1.0, 0.0);
    float width = uShadow.w * along + 0.22 * trail * cursorDistance;
    float behind = smoothstep(0.97, 1.25, along) * exp(-trail * 1.1);
    float shade = (1.0 - smoothstep(width * 0.3, width * 1.6, side)) * behind;
    rayLight *= 1.0 - uShadow.z * 0.62 * shade;
  }

  float boost = 0.0;
  for (int i = 0; i < ${Y}; i++) {
    vec4 wave = uPulses[i];
    if (wave.z <= 0.0) continue;
    float x = (depth - wave.x) / wave.y;
    boost += wave.z * exp(-x * x);
  }
  float light = (rayLight * (1.0 + boost) + glowLight) * reveal;

  if (uNoise > 0.0) {
    float n = fract(sin(dot(coord * 0.02 + uTime * 0.1, vec2(12.9898, 78.233))) * 43758.5453123);
    light *= 1.0 - uNoise + uNoise * n;
  }

  float near = clamp(1.2 - distance / (uResolution.y / uScale), 0.0, 1.0);
  vec3 tint = mix(vec3(0.9), vec3(0.1, 0.3, 0.5) + near * vec3(0.8, 0.6, 0.5), uAtmosphere);
  float gray = dot(tint, vec3(0.299, 0.587, 0.114));
  vec3 hue = max(mix(vec3(gray), tint, uSaturation), 0.0) * uColor;

  float grain = (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;
  if (uLight > 0.5) {
    vec3 color = hue * light;
    float energy = max(color.r, max(color.g, color.b));
    vec3 tone = clamp(1.0 - (1.0 - hue / max(max(hue.r, max(hue.g, hue.b)), 1e-4)) * 1.8, 0.0, 1.0);
    float warm = clamp((min(tone.r, tone.g) - tone.b) * 2.0, 0.0, 1.0);
    vec3 ink = tone * (mix(0.66, 0.94, warm) - 0.1 * smoothstep(0.4, 1.2, energy));
    float density = clamp(0.82 * (1.0 - exp(-1.5 * energy * energy)) * uOpacity + grain, 0.0, 1.0);
    fragColor = vec4(ink * density, density);
    return;
  }
  float level = light < 0.75 ? light : 0.75 + 0.25 * (1.0 - exp(-(light - 0.75) / 0.25));
  float top = max(hue.r, max(hue.g, hue.b));
  hue = mix(hue, vec3(top), smoothstep(0.8, 1.0, level) * 0.45);
  vec3 shown = clamp(hue * level, 0.0, 1.0) * level;
  fragColor = vec4(clamp(shown + grain, 0.0, level) * uOpacity, level * uOpacity);
}`,f=(o,a,s)=>Math.min(s,Math.max(a,o)),je=o=>{const a=String(o||"").trim(),s=/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(a);if(s){const g=s[1].length===3?s[1].replace(/./g,m=>m+m):s[1];return[0,2,4].map(m=>parseInt(g.slice(m,m+2),16)/255)}const n=/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(a);return n?[n[1],n[2],n[3]].map(g=>f(parseFloat(g)/255,0,1)):null},be=(o,a,s)=>{const n=o.createShader(a);return n?(o.shaderSource(n,s),o.compileShader(n),o.getShaderParameter(n,o.COMPILE_STATUS)?n:(console.error(o.getShaderInfoLog(n)),o.deleteShader(n),null)):null},qe=o=>{const a=be(o,o.VERTEX_SHADER,$e),s=be(o,o.FRAGMENT_SHADER,ke),n=a&&s?o.createProgram():null;if(!a||!s||!n)return a&&o.deleteShader(a),s&&o.deleteShader(s),null;if(o.attachShader(n,a),o.attachShader(n,s),o.linkProgram(n),o.deleteShader(a),o.deleteShader(s),!o.getProgramParameter(n,o.LINK_STATUS))return console.error(o.getProgramInfoLog(n)),o.deleteProgram(n),null;const g={},m=o.getProgramParameter(n,o.ACTIVE_UNIFORMS);for(let C=0;C<m;C++){const D=o.getActiveUniform(n,C);D&&(g[D.name.replace(/\[0\]$/,"")]=o.getUniformLocation(n,D.name))}return{program:n,uniforms:g}},W=o=>{const a=f(o,0,1);return a*a*a*(a*(a*6-15)+10)},Je=({raysOrigin:o="top-center",raysColor:a="#ffffff",raysSpeed:s=1,lightSpread:n=.5,rayLength:g=3,rayDensity:m=1,tilt:C=0,raySharpness:D=.35,glow:Me=.6,haze:Le=.25,atmosphere:Ae=1,intensity:Ee=1,pulsating:Re=!1,fadeDistance:Pe=1,saturation:Ce=1,followMouse:De=!0,mouseInfluence:Te=.1,cursorShadow:Ie=!0,clickPulse:Fe=!0,noiseAmount:_e=0,distortion:Ne=0,intro:ze=!0,lightMode:Be=!1,opacity:Oe=1,maxDevicePixelRatio:Xe=2,className:J="",style:Ge})=>{const Q=L.useRef(null),Z=L.useRef(null),T=L.useRef(null),[ee,Ue]=L.useState(0),te={origin:Se[o]||Se["top-center"],color:je(a)||[1,1,1],speed:Math.max(0,s),spread:Math.max(.001,n),length:Math.max(.01,g),density:f(m,.1,6),tilt:f(C,-90,90)*Math.PI/180,sharpness:f(D,0,1),glow:Math.max(0,Me),haze:f(Le,0,1),atmosphere:f(Ae,0,1),intensity:Math.max(0,Ee),pulsating:Re,fade:Math.max(.01,Pe),saturation:Math.max(0,Ce),follow:De,influence:f(Te,0,1),cursorShadow:Ie,clickPulse:Fe,noise:f(_e,0,1),distortion:Ne,intro:ze,light:Be,opacity:f(Oe,0,1),maxRatio:f(Xe,.5,3)},I=L.useRef(te);return I.current=te,L.useEffect(()=>{var v;(v=T.current)==null||v.call(T)}),L.useEffect(()=>{const v=Q.current,u=Z.current;if(!v||!u)return;const t=u.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance"}),N=t?qe(t):null;if(!t||!N)return;const z=window.matchMedia("(prefers-reduced-motion: reduce)").matches,oe=t.createVertexArray(),A={width:1,height:1,ratio:1},c={x:.5,y:.5,inside:!1,seen:!1},x={x:.5,y:.5},l={x:.5,y:.5,presence:0},p=[],F=new Float32Array(Y*4);let ne=0,E=I.current.intro&&!z&&ee===0?0:1,y=0,B=0,$=!0,k=document.visibilityState!=="hidden",j=!1;const q=()=>{const r=I.current,e=v.getBoundingClientRect(),h=Math.max(1,e.width),R=Math.max(1,e.height),X=r.density*(.35+.65*r.sharpness),G=Math.max(f(.35+.3*X,.5,2),r.noise>0?1:0),_=Math.min(window.devicePixelRatio||1,r.maxRatio,G,Math.sqrt(Ye/(h*R))),S=Math.max(1,Math.round(h*_)),b=Math.max(1,Math.round(R*_));(u.width!==S||u.height!==b)&&(u.width=S,u.height=b),A.width=h,A.height=R,A.ratio=S/h},re=r=>{if(y=0,j)return;const e=I.current,h=f((r-B)/1e3||0,0,.05);B=Math.max(B,r),ne+=h*e.speed*(z?.35:1),E<1&&(E=Math.min(1,E+h/1.8));const R=1-Math.exp(-h/.2),X=e.follow&&c.seen?c.x:.5,G=e.follow&&c.seen?c.y:.5;x.x+=(X-x.x)*R,x.y+=(G-x.y)*R;const _=1-Math.exp(-h/.08);l.x+=(c.x-l.x)*_,l.y+=(c.y-l.y)*_;const S=c.inside&&e.cursorShadow&&!z;l.presence+=((S?1:0)-l.presence)*(1-Math.exp(-h/(S?.25:.5)));for(let d=p.length-1;d>=0;d--)p[d].age+=h,p[d].age>=2&&p.splice(d,1);F.fill(0),p.forEach((d,P)=>{const M=d.age;F[P*4]=.05+M*1.05,F[P*4+1]=.14+M*.14,F[P*4+2]=.9*W(M/.15)*(1-W(M/2))});const b=A.width,U=A.height,de=e.origin.anchor[0]*b,me=e.origin.anchor[1]*U,pe=Math.cos(e.tilt),ge=Math.sin(e.tilt);let V=e.origin.dir[0]*pe-e.origin.dir[1]*ge,H=e.origin.dir[0]*ge+e.origin.dir[1]*pe;if(e.follow&&e.influence>0){const d=x.x*b-de,P=x.y*U-me,M=Math.hypot(d,P)||1,ve=V+(d/M-V)*e.influence,xe=H+(P/M-H)*e.influence,we=Math.hypot(ve,xe)||1;V=ve/we,H=xe/we}const Ve=1-Math.pow(1-E,3);t.viewport(0,0,u.width,u.height),t.clearColor(0,0,0,0),t.clear(t.COLOR_BUFFER_BIT),t.useProgram(N.program),t.bindVertexArray(oe);const i=N.uniforms;t.uniform2f(i.uResolution,u.width,u.height),t.uniform1f(i.uScale,A.ratio),t.uniform1f(i.uTime,ne),t.uniform2f(i.uSource,de,me),t.uniform2f(i.uAim,V,H),t.uniform1f(i.uReach,Math.max(b,U)),t.uniform3f(i.uColor,e.color[0],e.color[1],e.color[2]),t.uniform1f(i.uSpread,e.spread),t.uniform1f(i.uLength,e.length),t.uniform1f(i.uFade,e.fade),t.uniform1f(i.uSaturation,e.saturation),t.uniform1f(i.uPulsating,e.pulsating?1:0),t.uniform1f(i.uNoise,e.noise),t.uniform1f(i.uDistortion,e.distortion),t.uniform1f(i.uDensity,e.density),t.uniform1f(i.uSharpness,e.sharpness),t.uniform1f(i.uGlow,e.glow),t.uniform1f(i.uHaze,e.haze),t.uniform1f(i.uAtmosphere,e.atmosphere),t.uniform1f(i.uIntensity,e.intensity),t.uniform4f(i.uShadow,l.x*b,l.y*U,l.presence,16),t.uniform4fv(i.uPulses,F),t.uniform2f(i.uIntro,Ve*2.6,W(E/.5)),t.uniform1f(i.uLight,e.light?1:0),t.uniform1f(i.uOpacity,e.opacity),t.drawArrays(t.TRIANGLES,0,3);const He=Math.abs(x.x-X)>1e-4||Math.abs(x.y-G)>1e-4||l.presence>.001&&Math.abs(l.x-c.x)+Math.abs(l.y-c.y)>1e-4||Math.abs((S?1:0)-l.presence)>.001||p.length>0;(e.speed>0||E<1||He)&&$&&k&&(y=requestAnimationFrame(re))},w=()=>{y||j||!$||!k||(B=performance.now(),y=requestAnimationFrame(re))};T.current=()=>{q(),w()};const ie=r=>{const e=v.getBoundingClientRect();return{x:(r.clientX-e.left)/Math.max(1,e.width),y:(r.clientY-e.top)/Math.max(1,e.height),inside:r.clientX>=e.left&&r.clientX<=e.right&&r.clientY>=e.top&&r.clientY<=e.bottom}},ae=r=>{const e=ie(r);!c.inside&&e.inside&&(l.x=e.x,l.y=e.y),c.x=e.x,c.y=e.y,c.inside=e.inside,c.seen=!0,w()},se=r=>{const e=I.current;!ie(r).inside||!e.clickPulse||z||(p.push({age:0}),p.length>Y&&p.shift(),w())},K=()=>{c.inside=!1,w()},O=r=>{r.pointerType!=="mouse"&&K()};window.addEventListener("pointermove",ae,{passive:!0}),window.addEventListener("pointerdown",se,{passive:!0}),window.addEventListener("pointerup",O,{passive:!0}),window.addEventListener("pointercancel",O,{passive:!0}),document.documentElement.addEventListener("pointerleave",K);const ce=r=>{r.preventDefault(),j=!0,cancelAnimationFrame(y),y=0},le=()=>Ue(r=>r+1);u.addEventListener("webglcontextlost",ce),u.addEventListener("webglcontextrestored",le);const ue=new ResizeObserver(()=>{q(),w()});ue.observe(v);const fe=new IntersectionObserver(r=>{$=r.some(e=>e.isIntersecting),w()});fe.observe(v);const he=()=>{k=document.visibilityState!=="hidden",w()};return document.addEventListener("visibilitychange",he),q(),w(),()=>{cancelAnimationFrame(y),T.current=null,ue.disconnect(),fe.disconnect(),window.removeEventListener("pointermove",ae),window.removeEventListener("pointerdown",se),window.removeEventListener("pointerup",O),window.removeEventListener("pointercancel",O),document.documentElement.removeEventListener("pointerleave",K),document.removeEventListener("visibilitychange",he),u.removeEventListener("webglcontextlost",ce),u.removeEventListener("webglcontextrestored",le),t.isContextLost()||(t.deleteVertexArray(oe),t.deleteProgram(N.program))}},[ee]),ye.jsx("div",{ref:Q,className:`light-rays${J?` ${J}`:""}`,style:Ge,children:ye.jsx("canvas",{ref:Z,className:"light-rays__canvas","aria-hidden":"true"})})};export{Je as default};
