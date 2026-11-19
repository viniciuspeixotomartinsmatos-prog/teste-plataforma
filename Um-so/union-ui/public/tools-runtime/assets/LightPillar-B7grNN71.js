import{a as F,j as me}from"./index-DrbxZl7q.js";const Be=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,We=`#version 300 es
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uTarget;
uniform vec2 uRot;
uniform vec2 uPillarRot;
uniform vec2 uWave;
uniform float uShift;
uniform float uPillarWidth;
uniform float uPillarHeight;
uniform int uDetail;
uniform vec3 uTopColor;
uniform vec3 uBottomColor;
uniform float uGlowAmount;
uniform float uWidthNorm;
out vec4 outColor;

void main() {
  vec2 vUv = gl_FragCoord.xy / uTarget;
  vec2 uv = (vUv * 2.0 - 1.0) * vec2(uResolution.x / uResolution.y, 1.0);
  uv.x -= uShift;
  uv = vec2(uPillarRot.x * uv.x - uPillarRot.y * uv.y, uPillarRot.y * uv.x + uPillarRot.x * uv.y);

  vec3 ro = vec3(0.0, 0.0, -10.0);
  vec3 rd = normalize(vec3(uv, 1.0));
  vec3 origin = vec3(uRot.x * ro.x - uRot.y * ro.z, ro.y, uRot.y * ro.x + uRot.x * ro.z);
  vec3 dir = vec3(uRot.x * rd.x - uRot.y * rd.z, rd.y, uRot.y * rd.x + uRot.x * rd.z);

  float glow = 0.0;
  float lift = 0.0;
  float t = 0.1;
  for (int i = 0; i < 80; i++) {
    vec3 p = origin + dir * t;
    vec3 q = p;
    q.y = p.y * uPillarHeight + uTime;

    float freq = 1.0;
    float amp = 1.0;
    for (int j = 0; j < 6; j++) {
      if (j >= uDetail) break;
      q.xz = vec2(uWave.y * q.x - uWave.x * q.z, uWave.x * q.x + uWave.y * q.z);
      q += cos(q.zxy * freq - uTime * float(j) * 2.0) * amp;
      freq *= 2.0;
      amp *= 0.5;
    }

    float d = length(cos(q.xz)) - 0.2;
    float bound = length(p.xz) - uPillarWidth;
    float h = max(4.0 - abs(d - bound), 0.0);
    d = max(d, bound) + h * h * 0.015625;
    d = abs(d) * 0.15 + 0.01;

    float weight = 1.0 / d;
    glow += weight;
    lift += clamp((15.0 - p.y) / 30.0, 0.0, 1.0) * weight;

    t += d;
    if (t > 50.0) break;
  }

  vec3 col = tanh((uBottomColor * glow + (uTopColor - uBottomColor) * lift) * uGlowAmount / uWidthNorm);
  float peak = max(col.r, max(col.g, col.b));
  outColor = vec4(col, smoothstep(0.62, 1.0, peak));
}`,Xe=`#version 300 es
precision highp float;
uniform sampler2D uField;
uniform vec2 uFieldSize;
uniform vec2 uView;
uniform vec2 uAspect;
uniform vec2 uPillarRot;
uniform float uShift;
uniform float uIntensity;
uniform float uNoiseIntensity;
uniform float uLightMode;
uniform float uNeutral;
uniform float uBloom;
uniform float uFade;
uniform float uReveal;
uniform float uFlare;
uniform vec4 uPulses[3];
out vec4 outColor;

vec3 tap(vec2 uv) {
  return textureLod(uField, uv, 0.0).rgb;
}

vec3 bicubic(vec2 uv) {
  vec2 position = uv * uFieldSize;
  vec2 center = floor(position - 0.5) + 0.5;
  vec2 f = position - center;
  vec2 w0 = f * (-0.5 + f * (1.0 - 0.5 * f));
  vec2 w1 = 1.0 + f * f * (-2.5 + 1.5 * f);
  vec2 w2 = f * (0.5 + f * (2.0 - 1.5 * f));
  vec2 w3 = f * f * (-0.5 + 0.5 * f);
  vec2 w12 = w1 + w2;
  vec2 t0 = (center - 1.0) / uFieldSize;
  vec2 t3 = (center + 2.0) / uFieldSize;
  vec2 t12 = (center + w2 / w12) / uFieldSize;
  vec3 result = vec3(0.0);
  result += tap(vec2(t0.x, t0.y)) * w0.x * w0.y;
  result += tap(vec2(t12.x, t0.y)) * w12.x * w0.y;
  result += tap(vec2(t3.x, t0.y)) * w3.x * w0.y;
  result += tap(vec2(t0.x, t12.y)) * w0.x * w12.y;
  result += tap(vec2(t12.x, t12.y)) * w12.x * w12.y;
  result += tap(vec2(t3.x, t12.y)) * w3.x * w12.y;
  result += tap(vec2(t0.x, t3.y)) * w0.x * w3.y;
  result += tap(vec2(t12.x, t3.y)) * w12.x * w3.y;
  result += tap(vec2(t3.x, t3.y)) * w3.x * w3.y;
  return max(result, 0.0);
}

float smootherstep01(float t) {
  t = clamp(t, 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uView;
  vec3 col = bicubic(uv);

  if (uBloom > 0.0) {
    vec4 l3 = textureLod(uField, uv, 3.0);
    vec4 l4 = textureLod(uField, uv, 4.0);
    vec4 l5 = textureLod(uField, uv, 5.0);
    vec4 l6 = textureLod(uField, uv, 6.0);
    float halo = l3.a * 0.3 + l4.a * 0.3 + l5.a * 0.25 + l6.a * 0.15;
    vec3 tint = l4.rgb + l5.rgb;
    tint /= max(max(tint.r, max(tint.g, tint.b)), 0.001);
    vec3 glow = clamp(tint * halo * uBloom * 1.1, 0.0, 1.0);
    col = 1.0 - (1.0 - clamp(col, 0.0, 1.0)) * (1.0 - glow);
  }

  vec2 p = (uv * 2.0 - 1.0) * uAspect;
  p.x -= uShift;
  float axis = uPillarRot.y * p.x + uPillarRot.x * p.y;

  float boost = 0.0;
  for (int i = 0; i < 3; i++) {
    vec4 pulse = uPulses[i];
    if (pulse.y <= 0.0) continue;
    float offset = (axis - pulse.x) / 0.24;
    boost += exp(-offset * offset) * pulse.y;
  }
  float head = (axis - uReveal + 0.35) / 0.3;
  boost += exp(-head * head) * uFlare;
  float lum = max(col.r, max(col.g, col.b));
  col += mix(col, vec3(lum), 0.45) * boost * 1.8;

  col -= fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) / 15.0 * uNoiseIntensity;
  vec3 result = clamp(col * uIntensity, 0.0, 1.0);

  float mask = smoothstep(uReveal, uReveal - 0.9, axis);
  float edge = uFade * 0.5;
  if (edge > 0.0) {
    mask *= smootherstep01(uv.x / edge) * smootherstep01((1.0 - uv.x) / edge);
    mask *= smootherstep01(uv.y / edge) * smootherstep01((1.0 - uv.y) / edge);
  }

  if (uLightMode > 0.5) {
    float energy = max(result.r, max(result.g, result.b));
    vec3 hue = result / max(energy, 0.001);
    float coverage = smoothstep(0.025, 0.95, energy);
    hue = pow(clamp(hue, 0.0, 1.0), vec3(1.25));
    vec3 tinted = mix(vec3(1.0), hue, coverage * 0.94 * mask);
    vec3 ink = vec3(1.0) - pow(result, vec3(1.6)) * 0.85 * mask;
    result = mix(tinted, ink, uNeutral);
  } else {
    result *= mask;
  }
  outColor = vec4(result, 1.0);
}`,he={low:.35,medium:.5,high:.6},Oe=2.1,de=1.4,ve=.25,W=(i,T,v)=>Math.min(v,Math.max(T,i)),Ge=i=>1-Math.pow(1-i,3),Ve=i=>i*i*i*(i*(i*6-15)+10),xe=(i,T,v)=>{const m=i.createShader(T);return m?(i.shaderSource(m,v),i.compileShader(m),i.getShaderParameter(m,i.COMPILE_STATUS)?m:(i.deleteShader(m),null)):null},pe=(i,T)=>{const v=xe(i,i.VERTEX_SHADER,Be),m=xe(i,i.FRAGMENT_SHADER,T),f=i.createProgram();if(!v||!m||!f)return null;if(i.attachShader(f,v),i.attachShader(f,m),i.bindAttribLocation(f,0,"aPosition"),i.linkProgram(f),i.deleteShader(v),i.deleteShader(m),!i.getProgramParameter(f,i.LINK_STATUS))return i.deleteProgram(f),null;const D={},X=i.getProgramParameter(f,i.ACTIVE_UNIFORMS);for(let _=0;_<X;_++){const L=i.getActiveUniform(f,_);L&&(D[L.name.replace(/\[0\]$/,"")]=i.getUniformLocation(f,L.name))}return{program:f,uniforms:D}},je=({topColor:i="#5227FF",bottomColor:T="#FF9FFC",intensity:v=1,rotationSpeed:m=.3,flow:f=1,interactive:D=!0,clickPulse:X=!0,glowAmount:_=.002,bloom:L=.5,pillarWidth:ge=3,pillarHeight:we=.4,pillarRotation:Re=25,twist:Ee=.4,detail:ye=4,noiseIntensity:Te=.5,fade:Me=0,intro:be=!0,mixBlendMode:Fe="screen",quality:Ae="high",resolution:Pe,lightMode:Se=!1,paused:_e=!1,className:Y="",style:Le})=>{const $=F.useRef(null),K=F.useRef(null),C=F.useRef(null),I=F.useRef(null),[Ce,Ie]=F.useState(0);return I.current={topColor:String(i),bottomColor:String(T),intensity:Math.max(0,v),rotationSpeed:m,flow:f,interactive:D,clickPulse:X,glowAmount:Math.max(0,_),bloom:Math.max(0,L),pillarWidth:Math.max(.05,ge),pillarHeight:we,pillarRotation:Re,twist:Ee,detail:Math.round(W(ye,1,6)),noiseIntensity:Math.max(0,Te),fade:W(Me,0,1),intro:be,scale:W(Pe??he[Ae]??he.high,ve,2),lightMode:Se,paused:_e},F.useEffect(()=>{var le;const x=$.current,s=K.current,e=s==null?void 0:s.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance"});if(!x||!s||!e)return;const Ue=!!e.getExtension("EXT_color_buffer_float"),k=pe(e,We),N=pe(e,Xe);if(!k||!N)return;const Q=t=>{t.preventDefault()},J=()=>Ie(t=>t+1);s.addEventListener("webglcontextlost",Q),s.addEventListener("webglcontextrestored",J);const Z=e.createBuffer(),O=e.createVertexArray();e.bindVertexArray(O),e.bindBuffer(e.ARRAY_BUFFER,Z),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0);let p=null;const G=e.createFramebuffer(),h={width:0,height:0},De=(t,r)=>{if(h.width===t&&h.height===r)return;h.width=t,h.height=r,p&&e.deleteTexture(p),p=e.createTexture(),e.bindTexture(e.TEXTURE_2D,p);const n=Math.floor(Math.log2(Math.max(t,r)))+1;e.texStorage2D(e.TEXTURE_2D,n,Ue?e.RGBA16F:e.RGBA8,t,r),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR_MIPMAP_LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.bindFramebuffer(e.FRAMEBUFFER,G),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,p,0)},A=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),V=new Map,q=t=>{if(V.has(t))return V.get(t);let r=[1,1,1];if(A){A.clearRect(0,0,1,1),A.fillStyle="#ffffff",A.fillStyle=t,A.fillRect(0,0,1,1);const[n,l,w]=A.getImageData(0,0,1,1).data;r=[n/255,l/255,w/255]}return V.set(t,r),r},U=((le=window.matchMedia)==null?void 0:le.call(window,"(prefers-reduced-motion: reduce)").matches)??!1,a={width:1,height:1,ratio:1},P={x:0,y:0,inside:!1},g=[],H=new Float32Array(12),o={clock:0,intro:I.current.intro&&!U?0:1,touch:0,spin:0,lean:0,shift:0,governor:1,slow:0,quick:0};let M=0,R=0,z=!0;const ke=(t,r,n)=>{const l=a.width/a.height,w=(t/a.width*2-1)*l-o.shift,d=1-r/a.height*2;return Math.sin(n)*w+Math.cos(n)*d},j=()=>{const t=I.current,r=Math.max(ve,t.scale*o.governor),n=Math.max(1,Math.round(a.width*r)),l=Math.max(1,Math.round(a.height*r));De(n,l);const w=Ve(o.intro),d=Ge(o.intro),E=(t.pillarRotation+o.lean)*Math.PI/180,B=o.clock*.3+o.spin,y=t.pillarWidth*(.3+.7*w);e.bindVertexArray(O);const c=k.uniforms;e.bindFramebuffer(e.FRAMEBUFFER,G),e.viewport(0,0,h.width,h.height),e.useProgram(k.program),e.uniform1f(c.uTime,o.clock*t.flow),e.uniform2f(c.uResolution,a.width,a.height),e.uniform2f(c.uTarget,h.width,h.height),e.uniform2f(c.uRot,Math.cos(B),Math.sin(B)),e.uniform2f(c.uPillarRot,Math.cos(E),Math.sin(E)),e.uniform2f(c.uWave,Math.sin(t.twist),Math.cos(t.twist)),e.uniform1f(c.uShift,o.shift),e.uniform1f(c.uPillarWidth,y),e.uniform1f(c.uPillarHeight,t.pillarHeight),e.uniform1i(c.uDetail,t.detail),e.uniform3fv(c.uTopColor,q(t.topColor)),e.uniform3fv(c.uBottomColor,q(t.bottomColor)),e.uniform1f(c.uGlowAmount,t.glowAmount),e.uniform1f(c.uWidthNorm,y/3),e.drawArrays(e.TRIANGLES,0,3),e.bindTexture(e.TEXTURE_2D,p),t.bloom>0&&e.generateMipmap(e.TEXTURE_2D),H.fill(0),g.forEach((S,ze)=>{H.set([S.axis+S.age*1.7,Math.exp(-S.age/(de*.45)),0,0],ze*4)});const u=N.uniforms;e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,s.width,s.height),e.useProgram(N.program),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,p),e.uniform1i(u.uField,0),e.uniform2f(u.uFieldSize,h.width,h.height),e.uniform2f(u.uView,s.width,s.height),e.uniform2f(u.uAspect,a.width/a.height,1),e.uniform2f(u.uPillarRot,Math.cos(E),Math.sin(E)),e.uniform1f(u.uShift,o.shift),e.uniform1f(u.uIntensity,t.intensity*(.15+.85*d)*(1+.12*o.touch)),e.uniform1f(u.uNoiseIntensity,t.noiseIntensity),e.uniform1f(u.uLightMode,t.lightMode?1:0);const ce=S=>Math.max(...S)-Math.min(...S),qe=Math.max(ce(q(t.topColor)),ce(q(t.bottomColor)));e.uniform1f(u.uNeutral,1-W((qe-.08)/.12,0,1)),e.uniform1f(u.uBloom,t.bloom),e.uniform1f(u.uFade,t.fade);const fe=a.width/a.height+1.2;e.uniform1f(u.uReveal,o.intro>=1?1e4:-fe+d*(fe*2+1.2)),e.uniform1f(u.uFlare,o.intro>=1?0:(1-d)*1.3*Math.min(1,o.intro*8)),e.uniform4fv(u.uPulses,H),e.drawArrays(e.TRIANGLES,0,3)},Ne=t=>{t>1/40?(o.slow+=1,o.quick=0):t<1/55&&(o.quick+=1,o.slow=0),o.slow>20?(o.governor=Math.max(.5,o.governor*.85),o.slow=0):o.quick>180&&o.governor<1&&(o.governor=Math.min(1,o.governor*1.1),o.quick=0)},ee=t=>{if(M=0,!z||document.hidden)return;const r=I.current,n=R?Math.min(.05,(t-R)/1e3):1/60;R&&Ne((t-R)/1e3),R=t;const l=!r.paused&&!U&&r.rotationSpeed!==0;l&&(o.clock+=n*.96*r.rotationSpeed),!r.intro||U?o.intro=1:o.intro<1&&(o.intro=Math.min(1,o.intro+n/Oe));const w=r.interactive&&P.inside&&!U,d=w?P.x/a.width-.5:0,E=1-Math.exp(-n*2.4);o.spin+=(d*1.4-o.spin)*E,o.lean+=(d*9-o.lean)*E,o.shift+=(d*.35*(a.width/a.height)-o.shift)*E,o.touch+=((w?1:0)-o.touch)*(1-Math.exp(-n*3));for(let y=g.length-1;y>=0;y--)g[y].age+=n,g[y].age>de*2.2&&g.splice(y,1);j();const B=o.intro<1||g.length>0||Math.abs(d*1.4-o.spin)>5e-4||Math.abs((w?1:0)-o.touch)>.002;l||B?M=requestAnimationFrame(ee):R=0},b=()=>{!M&&z&&!document.hidden&&(M=requestAnimationFrame(ee))},te=()=>{const t=Math.max(1,x.clientWidth),r=Math.max(1,x.clientHeight),n=Math.min(window.devicePixelRatio||1,2);a.width=t,a.height=r,a.ratio=n,s.width=Math.max(1,Math.round(t*n)),s.height=Math.max(1,Math.round(r*n)),M||j(),b()},oe=t=>{const r=x.getBoundingClientRect(),n=t.clientX-r.left,l=t.clientY-r.top;return{x:n,y:l,inside:n>=0&&l>=0&&n<=r.width&&l<=r.height}},ie=t=>{const r=oe(t);P.x=r.x,P.y=r.y,P.inside=r.inside,b()},re=t=>{const r=I.current;if(!r.clickPulse||U)return;const n=oe(t);if(!n.inside)return;const l=(r.pillarRotation+o.lean)*Math.PI/180;g.push({axis:ke(n.x,n.y,l),age:0}),g.length>3&&g.shift(),b()},ne=()=>{P.inside=!1,b()},ae=()=>{R=0,b()},ue=new ResizeObserver(te);ue.observe(x);const se=new IntersectionObserver(t=>{z=t.some(r=>r.isIntersecting),z&&(R=0,b())});return se.observe(x),window.addEventListener("pointermove",ie,{passive:!0}),window.addEventListener("pointerdown",re,{passive:!0}),document.documentElement.addEventListener("pointerleave",ne),document.addEventListener("visibilitychange",ae),te(),C.current=()=>{M||j(),b()},()=>{var t;cancelAnimationFrame(M),C.current=null,s.removeEventListener("webglcontextlost",Q),s.removeEventListener("webglcontextrestored",J),ue.disconnect(),se.disconnect(),window.removeEventListener("pointermove",ie),window.removeEventListener("pointerdown",re),document.documentElement.removeEventListener("pointerleave",ne),document.removeEventListener("visibilitychange",ae),p&&e.deleteTexture(p),e.deleteFramebuffer(G),e.deleteProgram(k.program),e.deleteProgram(N.program),e.deleteBuffer(Z),e.deleteVertexArray(O),e.isContextLost()||(t=e.getExtension("WEBGL_lose_context"))==null||t.loseContext()}},[Ce]),F.useEffect(()=>{var x;(x=C.current)==null||x.call(C)}),me.jsx("div",{ref:$,className:`light-pillar-container${Y?` ${Y}`:""}`,style:{mixBlendMode:Fe,...Le},children:me.jsx("canvas",{ref:K,className:"light-pillar-canvas","aria-hidden":"true"})})};export{je as default};
