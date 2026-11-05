import{a as C,j as ue}from"./index-DrbxZl7q.js";const Ne=1.8,Ue=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,Ve=`#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform vec2 uCenter;
uniform float uScale;
uniform float uRatio;
uniform float uTime;
uniform float uDrift;
uniform vec2 uSteer;
uniform float uBend;
uniform float uCount;
uniform float uSwing;
uniform float uWave;
uniform float uWidth;
uniform float uPulseWidth;
uniform float uHead;
uniform float uTail;
uniform float uChance;
uniform float uSpacing;
uniform float uPulseSpeed;
uniform float uFlow;
uniform float uHalo;
uniform float uGlow;
uniform float uBrightness;
uniform float uVariance;
uniform float uBody;
uniform float uFadeNear;
uniform float uFadeFar;
uniform vec3 uCable;
uniform vec3 uPulse;
uniform vec3 uTunnel;
uniform vec3 uSurge;
uniform float uReveal;
uniform float uGrain;
uniform float uSeed;
uniform float uLight;
uniform float uOpacity;
out vec4 outColor;

const float TAU = 6.2831853;

vec3 inkOf(vec3 color, float depthOfInk) {
  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
  float peak = max(color.r, max(color.g, color.b));
  float chroma = (peak - min(color.r, min(color.g, color.b))) / max(peak, 0.001);
  return color * min(1.0, mix(depthOfInk, depthOfInk * 1.7, chroma) / max(luma, 0.001));
}

float hash(float n) {
  return fract(sin(n * 127.1 + uSeed * 311.7) * 43758.5453);
}

vec2 bendAt(float depth) {
  float reach = 1.0 - exp(-max(depth, 0.0) * 0.55);
  vec2 wobble = vec2(sin(uDrift * 0.37 + depth * 0.31), cos(uDrift * 0.29 + depth * 0.23)) * uBend;
  return (wobble + uSteer) * reach;
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution - uCenter) / uScale;
  float depth = -log(max(length(p), 1e-5));
  vec2 q = p;
  for (int i = 0; i < 4; i++) {
    q = p - bendAt(depth);
    depth = -log(max(length(q), 1e-5));
  }
  float r = length(q);
  float px = r * uScale;
  float turn = atan(q.y, q.x) / TAU;
  float s = turn - uSwing - uWave * sin(depth * 1.2 + uDrift * 0.5);
  float cell = floor(s * uCount);
  float spacing = TAU * px / uCount;
  float near = smoothstep(0.55, 1.25, r);
  float width = uWidth * (1.0 + near * 1.2);
  float soft = uRatio * (0.55 + near * 0.9);
  float tight = uRatio * uHalo * (1.0 + near);
  float wide = tight * 4.5;

  float lines = 0.0;
  float body = 0.0;
  vec3 glow = vec3(0.0);
  float strokes = 0.0;
  for (int k = -3; k <= 3; k++) {
    float i = cell + float(k);
    float id = mod(i, uCount);
    float h1 = hash(id);
    float h2 = hash(id + 17.0);
    float h3 = hash(id + 41.0);
    float h4 = hash(id + 73.0);
    float center = (i + 0.5 + (h1 - 0.5) * 0.55) / uCount;
    center += 0.12 * sin(depth * (0.8 + h2 * 0.9) + uDrift * (0.4 + h3 * 0.5) + h4 * TAU) / uCount;
    float d = abs(s - center) * TAU * px;
    float shade = 1.0 + uVariance * (h3 - 0.5) * 0.9;
    float reach = smoothstep(spacing * 2.4, spacing * 1.4, d);

    lines += smoothstep(width + soft, width - soft, d) * shade;
    body += exp(-d / max(spacing * 0.22, 0.001)) * shade * reach;

    float x = depth * uSpacing + uTime * uPulseSpeed * (0.55 + h2 * 0.6) * uFlow + h4 * 7.0;
    float lead = (fract(x) - 0.5) / uSpacing * uFlow;
    float lit = step(hash(id * 3.7 + floor(x) * 13.1), uChance);
    float limit = 0.5 / uSpacing;
    float head = exp(-pow(max(-lead, 0.0) / uHead, 2.0)) * smoothstep(-limit, -limit * 0.8, lead);
    float tail = exp(-max(lead, 0.0) / uTail) * smoothstep(limit, limit * 0.55, lead);
    float pulse = (lead < 0.0 ? head : tail) * lit;
    float ring = uSurge.y * exp(-pow((depth - uSurge.x) / uSurge.z, 2.0));
    pulse = max(pulse, ring);
    float hot = pulse * (lead < 0.0 ? 1.0 : exp(-max(lead, 0.0) / (uTail * 0.35)));

    float core = uPulseWidth * width + 0.35 * uRatio;
    float stroke = smoothstep(core + soft, core - soft, d);
    float bloom = (exp(-d / tight) * 0.7 + exp(-d / wide) * 0.18) * uGlow * reach;
    vec3 tint = mix(uPulse, vec3(1.0), hot * 0.55 * (1.0 - uLight));
    glow += tint * pulse * (stroke * 1.5 + bloom) * shade;
    strokes += pulse * stroke * shade;
  }

  float lod = smoothstep(4.0, 1.2, spacing);
  float average = min(2.0 * uWidth / max(spacing, 0.001), 1.0);
  lines = mix(lines, average, lod);
  glow = mix(glow, uPulse * average * 0.6 * uChance, lod);
  strokes = mix(strokes, average * 0.6 * uChance, lod);
  body = mix(body, 1.0, lod) * uBody;

  float rr = r * 0.25;
  float fade = smoothstep(0.0, uFadeNear, rr) * smoothstep(uFadeFar, uFadeFar * 0.55, rr);
  fade *= smoothstep(uReveal - 0.6, uReveal, depth);

  float grain = 1.0;
  if (uGrain > 0.0) {
    grain += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + uTime * 7.0) * 43758.5453) - 0.5) * uGrain * 4.0;
  }

  if (uLight > 0.5) {
    float hairline = clamp(lines * 0.26 + body * 0.2, 0.0, 1.0);
    float stroke = clamp(strokes * 1.6, 0.0, 1.0);
    float haze = clamp(length(glow) * 0.12, 0.0, 0.25);
    float ink = clamp(hairline + stroke + haze, 0.0, 1.0) * fade * uOpacity * grain;
    vec3 tone = mix(inkOf(uCable, 0.3), inkOf(uPulse, 0.16), clamp(stroke + haze * 2.0, 0.0, 1.0));
    tone = mix(tone, inkOf(uTunnel, 0.3), clamp(body * uBody, 0.0, 1.0) * 0.5);
    outColor = vec4(tone * ink, ink);
    return;
  }

  vec3 light = (uCable * lines * 0.12 + uTunnel * body * 0.35 + glow) * uBrightness * fade * grain;
  vec3 mapped = (1.0 - exp(-light * 1.4)) * uOpacity;
  outColor = vec4(mapped, max(mapped.r, max(mapped.g, mapped.b)));
}`,f=(n,c,d)=>Math.min(d,Math.max(c,n)),se=(n,c,d)=>{const r=n.createShader(c);return r?(n.shaderSource(r,d),n.compileShader(r),n.getShaderParameter(r,n.COMPILE_STATUS)?r:(n.deleteShader(r),null)):null},Ge=n=>{const c=se(n,n.VERTEX_SHADER,Ue),d=se(n,n.FRAGMENT_SHADER,Ve),r=n.createProgram();if(!c||!d||!r)return null;if(n.attachShader(r,c),n.attachShader(r,d),n.bindAttribLocation(r,0,"aPosition"),n.linkProgram(r),n.deleteShader(c),n.deleteShader(d),!n.getProgramParameter(r,n.LINK_STATUS))return n.deleteProgram(r),null;const F={},W=n.getProgramParameter(r,n.ACTIVE_UNIFORMS);for(let E=0;E<W;E++){const k=n.getActiveUniform(r,E);k&&(F[k.name]=n.getUniformLocation(r,k.name))}return{program:r,uniforms:F}},ze=({cableColor:n="#ffffff",pulseColor:c="#ffffff",tunnelColor:d="#ffffff",tunnelOpacity:r=0,speed:F=.1,flowDirection:W="inward",pulseSpeed:E=2,pulseLength:k=.28,pulseBlend:le=.6,pulseWidth:fe=1,pulseDensity:ce=.5,cableCount:de=56,thickness:me=.35,rimWidth:he=.15,waviness:pe=.3,sway:ge=.5,bend:ve=.4,size:xe=1,centerX:we=0,centerY:be=0,glow:ye=1,fadeNear:Se=.5,fadeFar:Me=2,brightness:Re=1,colorVariance:Ae=!0,grain:Ce=!1,grainIntensity:Ee=.05,opacity:ke=1,mouseInteraction:Pe=!0,mouseStrength:Te=.1,clickSurge:Fe=!0,intro:Le=!0,variation:Oe=0,lightMode:Be=!1,dpr:We,className:q="",style:De,...Ie})=>{const z=C.useRef(null),H=C.useRef(null),P=C.useRef(null),j={cableColor:n,pulseColor:c,tunnelColor:d,tunnelOpacity:f(r,0,1),speed:Math.max(0,F),flow:W==="outward"?1:-1,pulseSpeed:Math.max(0,E),pulseLength:f(k,.02,1),pulseBlend:f(le,0,1),pulseWidth:f(fe,.1,3),pulseDensity:f(ce,0,1),cableCount:f(Math.round(de),4,200),thickness:f(me,.05,2),rimWidth:f(he,0,1),waviness:Math.max(0,pe),sway:Math.max(0,ge),bend:Math.max(0,ve),size:Math.max(.05,xe),centerX:we,centerY:be,glow:Math.max(0,ye),fadeNear:Math.max(.001,Se),fadeFar:Math.max(.01,Me),brightness:Math.max(0,Re),colorVariance:Ae,grain:Ce,grainIntensity:Math.max(0,Ee),opacity:f(ke,0,1),mouseInteraction:Pe,mouseStrength:Math.max(0,Te),clickSurge:Fe,intro:Le,variation:Oe,lightMode:Be,dpr:We},h=C.useRef(j);return h.current=j,C.useEffect(()=>{var ae;const s=z.current,p=H.current,e=p==null?void 0:p.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!s||!p||!e)return;const L=Ge(e);if(!L)return;const o=L.uniforms,X=e.createBuffer(),D=e.createVertexArray();e.bindVertexArray(D),e.bindBuffer(e.ARRAY_BUFFER,X),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0);const y=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),I=new Map,_=(t,a)=>{if(!t)return a;const i=String(t);if(I.has(i))return I.get(i);let u=a;if(y){y.clearRect(0,0,1,1),y.fillStyle="#000000",y.fillStyle=i,y.fillRect(0,0,1,1);const[l,b,x]=y.getImageData(0,0,1,1).data;u=[l/255,b/255,x/255]}return I.set(i,u),u},S=((ae=window.matchMedia)==null?void 0:ae.call(window,"(prefers-reduced-motion: reduce)").matches)??!1,m={x:0,y:0,inside:!1},g={x:0,y:0},w={age:10};let Y=0,N=0,v=h.current.intro&&!S?0:1,M=0,R=0,O=!0;const U=()=>{const t=h.current,a=p.width,i=p.height,u=a/Math.max(1,s.clientWidth),l=Math.min(a,i),b=t.flow,x=3.4,T=w.age*2.6,G=b>0?x-T:-.6+T,re=w.age<2.4?Math.min(1,w.age/.12)*Math.exp(-w.age*1.1):0,_e=v*v*(3-2*v);e.viewport(0,0,a,i),e.useProgram(L.program),e.bindVertexArray(D),e.uniform2f(o.uResolution,a,i),e.uniform2f(o.uCenter,t.centerX*l,t.centerY*l),e.uniform1f(o.uScale,l*.5*t.size),e.uniform1f(o.uRatio,u),e.uniform1f(o.uTime,Y),e.uniform1f(o.uDrift,N),e.uniform2f(o.uSteer,g.x,g.y),e.uniform1f(o.uBend,t.bend*.45),e.uniform1f(o.uCount,t.cableCount),e.uniform1f(o.uSwing,Math.sin(N*.9)*t.sway*.5/(Math.PI*2)),e.uniform1f(o.uWave,t.waviness*.15),e.uniform1f(o.uWidth,(.25+t.thickness*1.5)*u),e.uniform1f(o.uPulseWidth,.6+t.pulseWidth*.9);const ie=t.pulseLength*1.2;e.uniform1f(o.uHead,ie*(.08+t.pulseBlend*.22)),e.uniform1f(o.uTail,ie*(.5+t.pulseBlend*.7)),e.uniform1f(o.uChance,t.pulseDensity),e.uniform1f(o.uSpacing,.4),e.uniform1f(o.uPulseSpeed,t.pulseSpeed*4),e.uniform1f(o.uFlow,b),e.uniform1f(o.uHalo,1.2+t.rimWidth*8),e.uniform1f(o.uGlow,t.glow),e.uniform1f(o.uBrightness,t.brightness),e.uniform1f(o.uVariance,t.colorVariance?1:0),e.uniform1f(o.uBody,t.tunnelOpacity),e.uniform1f(o.uFadeNear,t.fadeNear),e.uniform1f(o.uFadeFar,t.fadeFar),e.uniform3fv(o.uCable,_(t.cableColor,[1,1,1])),e.uniform3fv(o.uPulse,_(t.pulseColor,[1,1,1])),e.uniform3fv(o.uTunnel,_(t.tunnelColor,[1,1,1])),e.uniform3f(o.uSurge,G,re,.22),e.uniform1f(o.uReveal,1.7-_e*3.6),e.uniform1f(o.uGrain,t.grain?t.grainIntensity:0),e.uniform1f(o.uSeed,t.variation),e.uniform1f(o.uLight,t.lightMode?1:0),e.uniform1f(o.uOpacity,t.opacity),e.drawArrays(e.TRIANGLES,0,3)},$=t=>{if(M=0,!O||document.hidden)return;const a=h.current,i=R?f((t-R)/1e3,5e-4,.05):1/60;R=t;const u=S?0:1;Y+=i*a.speed*u,N+=i*(a.speed+.2)*u,w.age+=i,a.intro&&!S&&v<1?v=Math.min(1,v+i/Ne):(!a.intro||S)&&(v=1);const l=a.mouseInteraction&&m.inside&&!S,b=a.mouseStrength*2.5,x=l?[m.x*b,m.y*b]:[0,0],T=1-Math.exp(-i/.6);g.x+=(x[0]-g.x)*T,g.y+=(x[1]-g.y)*T,U();const G=Math.abs(x[0]-g.x)<5e-4&&Math.abs(x[1]-g.y)<5e-4;u>0||!G||v<1||w.age<2.4?M=requestAnimationFrame($):R=0},A=()=>{!M&&O&&!document.hidden&&(M=requestAnimationFrame($))},V=()=>{const t=h.current,a=Math.max(1,s.clientWidth),i=Math.max(1,s.clientHeight),u=Math.min(t.dpr||window.devicePixelRatio||1,2);p.width=Math.max(1,Math.round(a*u)),p.height=Math.max(1,Math.round(i*u)),U(),A()},K=t=>{const a=s.getBoundingClientRect(),i=t.clientX-a.left,u=t.clientY-a.top;m.inside=i>=0&&u>=0&&i<=a.width&&u<=a.height;const l=Math.min(a.width,a.height)*.5;m.x=(i-a.width/2)/Math.max(1,l),m.y=(a.height/2-u)/Math.max(1,l)},J=t=>{K(t),A()},Q=t=>{K(t),!(!m.inside||!h.current.clickSurge||S)&&(w.age=0,A())},B=t=>{t.pointerType!=="mouse"&&(m.inside=!1)},Z=()=>{m.inside=!1},ee=()=>{R=0,A()},te=new ResizeObserver(V);te.observe(s);const oe=new IntersectionObserver(t=>{O=t.some(a=>a.isIntersecting),O&&(R=0,A())});oe.observe(s),window.addEventListener("pointermove",J,{passive:!0}),window.addEventListener("pointerdown",Q,{passive:!0}),window.addEventListener("pointerup",B,{passive:!0}),window.addEventListener("pointercancel",B,{passive:!0}),document.documentElement.addEventListener("pointerleave",Z),document.addEventListener("visibilitychange",ee),V();let ne=h.current.dpr;return P.current=()=>{const t=h.current;if(t.dpr!==ne){ne=t.dpr,V();return}M||U(),A()},()=>{var t;cancelAnimationFrame(M),P.current=null,te.disconnect(),oe.disconnect(),window.removeEventListener("pointermove",J),window.removeEventListener("pointerdown",Q),window.removeEventListener("pointerup",B),window.removeEventListener("pointercancel",B),document.documentElement.removeEventListener("pointerleave",Z),document.removeEventListener("visibilitychange",ee),e.deleteProgram(L.program),e.deleteBuffer(X),e.deleteVertexArray(D),(t=e.getExtension("WEBGL_lose_context"))==null||t.loseContext()}},[]),C.useEffect(()=>{var s;(s=P.current)==null||s.call(P)}),ue.jsx("div",{ref:z,className:`light-tunnel-container${q?` ${q}`:""}`,style:De,...Ie,children:ue.jsx("canvas",{ref:H,className:"light-tunnel-canvas","aria-hidden":"true"})})};export{ze as default};
