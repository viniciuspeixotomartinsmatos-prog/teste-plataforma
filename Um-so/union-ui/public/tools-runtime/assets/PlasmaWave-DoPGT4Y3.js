import{a as M,j as de}from"./index-DrbxZl7q.js";const Ue=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,U=`#version 300 es
precision highp float;
const float PI = 3.14159265;
const float TAU = 6.28318531;
const float HALF_PI = 1.5707963;
`,ge=`
uniform vec2 uView;
uniform vec2 uOffset;
uniform float uRotation;
uniform float uFocalLength;
uniform float uTime;
uniform float uSpeed1;
uniform float uSpeed2;
uniform float uDir2;
uniform float uBend1;
uniform float uBend2;
uniform float uThickness;
uniform vec3 uHeat;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uCore;
uniform float uRange;

vec4 traceLight(vec2 pixel) {
  vec2 coord = pixel + uOffset - 0.5 * uView;
  float c = cos(uRotation);
  float sn = sin(uRotation);
  coord = mat2(c, -sn, sn, c) * coord;
  vec3 u = normalize(vec3(coord / uView.y, uFocalLength));
  vec3 o = vec3(0.0, 0.0, -7.0);
  float t = uTime * PI;
  float t1 = t * 0.7;
  float t2 = t * 0.9;
  float tSpeed1 = t * uSpeed1;
  float tSpeed2 = t * uSpeed2 * uDir2;
  float s = 1.0;
  float d = 0.0;
  vec2 k = vec2(0.0);
  for (int i = 0; i < 14; ++i) {
    vec3 p = o + u * d;
    p.x -= 15.0;
    float px = p.x;
    float swell = uHeat.y * exp(-pow((px - uHeat.x) / uHeat.z, 2.0));
    float wob1 = uBend1 + swell * (0.16 + 0.2 * uBend1) + sin(t1 + px * 0.8) * 0.1;
    float wob2 = uBend2 + swell * (0.16 + 0.2 * uBend2) + cos(t2 + px * 1.1) * 0.1;
    vec2 a = sin(vec2(px, px + HALF_PI) + tSpeed1) * wob1;
    vec2 b = cos(vec2(px, px + HALF_PI) + tSpeed2) * wob2;
    float cut = px + uThickness;
    k.x = max(cut, length(p.yz - a) - uThickness);
    k.y = max(cut, length(p.yz - b) - uThickness);
    s = min(s, min(k.x, k.y));
    if (s < 0.001 || d > 300.0) break;
    d += s * 0.7;
  }
  vec3 raw = max(cos(d * TAU) - s * sqrt(d) - vec3(k, 0.0), 0.0);
  float field = max(raw.r, max(raw.g, raw.b));
  raw.gb += 0.1;
  raw = raw * 0.4 + raw.brg * 0.6 + raw * raw;
  float lum = dot(raw, vec3(0.299, 0.587, 0.114));
  float w1 = max(0.0, 1.0 - k.x * 2.0) + 0.0001;
  float w2 = max(0.0, 1.0 - k.y * 2.0) + 0.0001;
  vec3 base = (uColor1 * w1 + uColor2 * w2) / (w1 + w2);
  float soft = smoothstep(0.03, 0.36, field);
  float hot = smoothstep(0.32, 0.8, field);
  vec3 light = base * lum * 2.6 * soft + mix(base, vec3(1.0), 0.55) * hot * uCore * 2.0;
  return vec4(light * uRange, field);
}
`,ke=`${U}
${ge}
uniform vec2 uScale;
out vec4 outColor;
void main() {
  outColor = traceLight(gl_FragCoord.xy * uScale);
}`,Xe=`${U}
${ge}
uniform vec2 uScale;
uniform sampler2D uCoarse;
uniform vec2 uCoarseSize;
uniform vec2 uFineSize;
out vec4 outColor;
void main() {
  vec2 uv = gl_FragCoord.xy / uFineSize;
  vec2 pos = uv * uCoarseSize - 0.5;
  ivec2 cell = ivec2(floor(pos));
  ivec2 last = ivec2(uCoarseSize) - 1;
  float a = texelFetch(uCoarse, clamp(cell, ivec2(0), last), 0).a;
  float b = texelFetch(uCoarse, clamp(cell + ivec2(1, 0), ivec2(0), last), 0).a;
  float c = texelFetch(uCoarse, clamp(cell + ivec2(0, 1), ivec2(0), last), 0).a;
  float d = texelFetch(uCoarse, clamp(cell + ivec2(1, 1), ivec2(0), last), 0).a;
  float high = max(max(a, b), max(c, d));
  float low = min(min(a, b), min(c, d));
  if (high > 0.02 && low < 0.4) outColor = traceLight(gl_FragCoord.xy * uScale);
  else outColor = texture(uCoarse, uv);
}`,He=`${U}
uniform sampler2D uSource;
uniform vec2 uTexel;
uniform vec2 uTarget;
out vec4 outColor;
void main() {
  vec2 uv = gl_FragCoord.xy / uTarget;
  vec4 sum = texture(uSource, uv) * 4.0;
  sum += texture(uSource, uv - uTexel);
  sum += texture(uSource, uv + uTexel);
  sum += texture(uSource, uv + vec2(uTexel.x, -uTexel.y));
  sum += texture(uSource, uv - vec2(uTexel.x, -uTexel.y));
  outColor = sum / 8.0;
}`,We=`${U}
uniform sampler2D uSource;
uniform sampler2D uBase;
uniform vec2 uTexel;
uniform vec2 uTarget;
out vec4 outColor;
void main() {
  vec2 uv = gl_FragCoord.xy / uTarget;
  vec2 h = uTexel * 0.5;
  vec4 sum = texture(uSource, uv + vec2(-h.x * 2.0, 0.0));
  sum += texture(uSource, uv + vec2(h.x * 2.0, 0.0));
  sum += texture(uSource, uv + vec2(0.0, -h.y * 2.0));
  sum += texture(uSource, uv + vec2(0.0, h.y * 2.0));
  sum += texture(uSource, uv + vec2(-h.x, h.y)) * 2.0;
  sum += texture(uSource, uv + h) * 2.0;
  sum += texture(uSource, uv + vec2(h.x, -h.y)) * 2.0;
  sum += texture(uSource, uv - h) * 2.0;
  outColor = sum / 12.0 + texture(uBase, uv);
}`,Ge=`${U}
uniform sampler2D uLight;
uniform sampler2D uBloom;
uniform vec2 uResolution;
uniform float uExposure;
uniform float uGlow;
uniform float uCore;
uniform float uPresence;
uniform float uGrain;
uniform float uFade;
uniform float uOpacity;
uniform float uTime;
uniform float uLightMode;
uniform vec3 uLens;
out vec4 outColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float smootherstep(float edge, float x) {
  float t = clamp(x / max(edge, 0.0001), 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 offset = gl_FragCoord.xy - uLens.xy;
  float lens = uLens.z * exp(-dot(offset, offset) / (uResolution.y * uResolution.y * 0.045));
  vec4 source = texture(uLight, uv);
  vec3 hdr = source.rgb * uExposure * uPresence * (1.0 + lens * 0.35);
  hdr += texture(uBloom, uv).rgb * uExposure * uPresence * uGlow * (0.18 + lens * 0.08);
  float edge = uFade * 0.5;
  float mask = smootherstep(edge, uv.x) * smootherstep(edge, 1.0 - uv.x) * smootherstep(edge, uv.y) * smootherstep(edge, 1.0 - uv.y);
  float grain = (hash(gl_FragCoord.xy + fract(uTime * 7.31) * 113.0) - 0.5) * uGrain;
  float peak = max(hdr.r, max(hdr.g, hdr.b));
  if (uLightMode > 0.5) {
    vec3 hue = hdr / max(peak, 0.0001);
    float tone = dot(hue, vec3(0.2126, 0.7152, 0.0722));
    vec3 ink = pow(clamp(hue * min(1.0, 0.6 / max(tone, 0.001)), 0.0, 1.0), vec3(1.0 / 2.2));
    float feather = max(fwidth(source.a) * 1.25, 0.02);
    float body = smoothstep(0.15 - feather, 0.15 + feather, source.a) * uPresence;
    vec3 color = mix(ink, vec3(1.0), smoothstep(12.0, 26.0, peak) * uCore);
    float halo = (1.0 - exp(-peak * 0.5)) * 0.3 * min(uGlow, 1.5);
    float alpha = clamp(body * 0.92 + (1.0 - body) * halo, 0.0, 1.0) * mask * uOpacity;
    color = mix(ink, color, body);
    outColor = vec4(clamp(color + grain, 0.0, 1.0) * alpha, alpha);
  } else {
    vec3 mapped = 1.0 - exp(-hdr);
    float level = max(mapped.r, max(mapped.g, mapped.b));
    mapped = clamp(mapped + grain * level, 0.0, 1.0) * mask * uOpacity;
    outColor = vec4(mapped, max(mapped.r, max(mapped.g, mapped.b)));
  }
}`,F=4,xe=3,Ve=1.8,pe=24e5,B=(a,E,v)=>Math.min(v,Math.max(E,a)),ve=(a,E,v)=>{const d=a.createShader(E);return d?(a.shaderSource(d,v),a.compileShader(d),a.getShaderParameter(d,a.COMPILE_STATUS)?d:(a.deleteShader(d),null)):null},I=(a,E)=>{const v=ve(a,a.VERTEX_SHADER,Ue),d=ve(a,a.FRAGMENT_SHADER,E),m=a.createProgram();if(!v||!d||!m)return null;if(a.attachShader(m,v),a.attachShader(m,d),a.bindAttribLocation(m,0,"aPosition"),a.linkProgram(m),a.deleteShader(v),a.deleteShader(d),!a.getProgramParameter(m,a.LINK_STATUS))return a.deleteProgram(m),null;const k={},N=a.getProgramParameter(m,a.ACTIVE_UNIFORMS);for(let _=0;_<N;_++){const L=a.getActiveUniform(m,_);L&&(k[L.name]=a.getUniformLocation(m,L.name))}return{program:m,uniforms:k}};function Ne({colors:a=["#A855F7","#06B6D4"],speed:E=1,speed1:v=.05,speed2:d=.05,dir2:m=1,bend1:k=1,bend2:N=.5,thickness:_=.3,focalLength:L=1.25,rotationDeg:Te=0,xOffset:we=0,yOffset:Ee=0,brightness:Re=1,glow:ye=1,core:Se=.6,grain:be=.03,quality:Ae=1,mouseInteraction:Ce=!0,intro:Me=!0,fade:Fe=0,opacity:_e=1,lightMode:Le=!1,paused:Pe=!1,dpr:Oe,className:Q="",...De}){const K=M.useRef(null),J=M.useRef(null),P=M.useRef(null),Z={color1:String((a==null?void 0:a[0])??"#A855F7"),color2:String((a==null?void 0:a[1])??(a==null?void 0:a[0])??"#06B6D4"),speed:E,speed1:v,speed2:d,dir2:m,bend1:k,bend2:N,thickness:Math.max(.02,_),focalLength:Math.max(.05,L),rotation:Te*Math.PI/180,xOffset:we,yOffset:Ee,brightness:Math.max(0,Re),glow:Math.max(0,ye),core:B(Se,0,1),grain:Math.max(0,be),quality:B(Ae,.25,1),mouseInteraction:Ce,intro:Me,fade:B(Fe,0,1),opacity:B(_e,0,1),lightMode:Le,paused:Pe,dpr:Oe},T=M.useRef(Z);return T.current=Z,M.useEffect(()=>{var he;const g=K.current,x=J.current,e=x==null?void 0:x.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance"});if(!g||!x||!e)return;const ee=!!e.getExtension("EXT_color_buffer_float"),te=ee?1:.25,s={coarse:I(e,ke),fine:I(e,Xe),down:I(e,He),up:I(e,We),composite:I(e,Ge)};if(Object.values(s).some(t=>!t))return;const oe=e.createBuffer(),q=e.createVertexArray();e.bindVertexArray(q),e.bindBuffer(e.ARRAY_BUFFER,oe),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0);const X=()=>({texture:e.createTexture(),framebuffer:e.createFramebuffer(),width:0,height:0}),H=(t,o,n)=>{t.width===o&&t.height===n||(t.width=o,t.height=n,e.bindTexture(e.TEXTURE_2D,t.texture),ee?e.texImage2D(e.TEXTURE_2D,0,e.RGBA16F,o,n,0,e.RGBA,e.HALF_FLOAT,null):e.texImage2D(e.TEXTURE_2D,0,e.RGBA,o,n,0,e.RGBA,e.UNSIGNED_BYTE,null),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.bindFramebuffer(e.FRAMEBUFFER,t.framebuffer),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t.texture,0))},W=X(),O=X(),y=Array.from({length:F+1},X),G=Array.from({length:F},X),S=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),V=((he=window.matchMedia)==null?void 0:he.call(window,"(prefers-reduced-motion: reduce)").matches)??!1,$=new Map,re=t=>{if($.has(t))return $.get(t);let o=[1,1,1];if(S){S.clearRect(0,0,1,1),S.fillStyle="#000000",S.fillStyle=t,S.fillRect(0,0,1,1);const[n,i,c]=S.getImageData(0,0,1,1).data;o=[n,i,c].map(f=>Math.pow(f/255,2.2))}return $.set(t,o),o},r={width:1,height:1,fineWidth:1,fineHeight:1,coarseWidth:1,coarseHeight:1},h={x:0,y:0,inside:!1},u={time:0,intro:T.current.intro&&!V?0:1,heat:0,heatVelocity:0,heatX:0,lensX:0,lensY:0};let R=0,b=0,z=!0;const D=(t,o,n,i)=>{e.bindFramebuffer(e.FRAMEBUFFER,o?o.framebuffer:null),e.viewport(0,0,n,i),e.useProgram(t.program),e.drawArrays(e.TRIANGLES,0,3)},A=(t,o,n,i)=>{e.activeTexture(e.TEXTURE0+n),e.bindTexture(e.TEXTURE_2D,i),e.uniform1i(t.uniforms[o],n)},ae=(t,o,n)=>{const i=t.uniforms;e.useProgram(t.program),e.uniform2f(i.uView,r.width,r.height),e.uniform2f(i.uOffset,o.xOffset,o.yOffset),e.uniform1f(i.uRotation,o.rotation),e.uniform1f(i.uFocalLength,o.focalLength),e.uniform1f(i.uTime,u.time),e.uniform1f(i.uSpeed1,o.speed1),e.uniform1f(i.uSpeed2,o.speed2),e.uniform1f(i.uDir2,o.dir2),e.uniform1f(i.uBend1,o.bend1*(.3+.7*n)),e.uniform1f(i.uBend2,o.bend2*(.3+.7*n)),e.uniform1f(i.uThickness,o.thickness),e.uniform3f(i.uHeat,u.heatX,u.heat,1.4),e.uniform3fv(i.uColor1,re(o.color1)),e.uniform3fv(i.uColor2,re(o.color2)),e.uniform1f(i.uCore,o.core),e.uniform1f(i.uRange,te)},Y=()=>{const t=T.current,o=u.intro*u.intro*(3-2*u.intro);e.bindVertexArray(q),H(W,r.coarseWidth,r.coarseHeight),H(O,r.fineWidth,r.fineHeight),ae(s.coarse,t,o),e.uniform2f(s.coarse.uniforms.uScale,r.width/r.coarseWidth,r.height/r.coarseHeight),D(s.coarse,W,r.coarseWidth,r.coarseHeight);const n=s.fine;ae(n,t,o),e.uniform2f(n.uniforms.uScale,r.width/r.fineWidth,r.height/r.fineHeight),e.uniform2f(n.uniforms.uCoarseSize,r.coarseWidth,r.coarseHeight),e.uniform2f(n.uniforms.uFineSize,r.fineWidth,r.fineHeight),A(n,"uCoarse",0,W.texture),D(n,O,r.fineWidth,r.fineHeight);let i=O;for(let l=0;l<=F;l++){const p=y[l],w=l===0?Math.round(r.width/2):i.width>>1,Ie=l===0?Math.round(r.height/2):i.height>>1;H(p,Math.max(1,w),Math.max(1,Ie)),e.useProgram(s.down.program),e.uniform2f(s.down.uniforms.uTexel,1/i.width,1/i.height),e.uniform2f(s.down.uniforms.uTarget,p.width,p.height),A(s.down,"uSource",0,i.texture),D(s.down,p,p.width,p.height),i=p}for(let l=F-1;l>=1;l--){const p=l===F-1?y[F]:G[l+1],w=G[l];H(w,y[l].width,y[l].height),e.useProgram(s.up.program),e.uniform2f(s.up.uniforms.uTexel,1/p.width,1/p.height),e.uniform2f(s.up.uniforms.uTarget,w.width,w.height),A(s.up,"uSource",0,p.texture),A(s.up,"uBase",1,y[l].texture),D(s.up,w,w.width,w.height)}const c=s.composite,f=c.uniforms;e.useProgram(c.program),e.uniform2f(f.uResolution,x.width,x.height),e.uniform1f(f.uExposure,2.4*t.brightness/te),e.uniform1f(f.uGlow,t.glow),e.uniform1f(f.uCore,t.core),e.uniform1f(f.uPresence,o*o),e.uniform1f(f.uGrain,t.grain),e.uniform1f(f.uFade,t.fade),e.uniform1f(f.uOpacity,t.opacity),e.uniform1f(f.uTime,u.time),e.uniform1f(f.uLightMode,t.lightMode?1:0),e.uniform3f(f.uLens,u.lensX*x.width/r.width,(r.height-u.lensY)*x.height/r.height,u.heat),A(c,"uLight",0,O.texture),A(c,"uBloom",1,G[1].texture),D(c,null,x.width,x.height)},Be=t=>{if(!(t.mouseInteraction&&h.inside)||V)return null;const o=h.x+t.xOffset-r.width/2,n=r.height-h.y+t.yOffset-r.height/2,i=Math.cos(t.rotation),c=Math.sin(t.rotation);return 7*(i*o+c*n)/r.height/t.focalLength-15},ne=t=>{if(R=0,!z||document.hidden)return;const o=T.current,n=b?Math.min(.05,(t-b)/1e3):1/60;b=t;const i=!o.paused&&!V;i&&(u.time+=n*o.speed),!o.intro||V?u.intro=1:u.intro<1&&(u.intro=Math.min(1,u.intro+n/Ve));const c=Be(o);c!==null&&(u.heatX+=(c-u.heatX)*(1-Math.exp(-n*6))),u.heatVelocity+=(120*((c===null?0:1)-u.heat)-19*u.heatVelocity)*n,u.heat=B(u.heat+u.heatVelocity*n,0,1.15),u.lensX+=(h.x-u.lensX)*(1-Math.exp(-n*8)),u.lensY+=(h.y-u.lensY)*(1-Math.exp(-n*8)),Y();const f=u.intro<1||u.heat>.001||Math.abs(u.heatVelocity)>.001;i||f?R=requestAnimationFrame(ne):b=0},C=()=>{!R&&z&&!document.hidden&&(R=requestAnimationFrame(ne))},j=()=>{const t=T.current,o=Math.max(1,g.clientWidth),n=Math.max(1,g.clientHeight),i=Math.min(t.dpr||window.devicePixelRatio||1,2);r.width=o,r.height=n,x.width=Math.max(1,Math.round(o*i)),x.height=Math.max(1,Math.round(n*i));let c=t.quality;o*n*c*c>pe&&(c=Math.sqrt(pe/(o*n))),r.fineWidth=Math.max(1,Math.round(o*c)),r.fineHeight=Math.max(1,Math.round(n*c)),r.coarseWidth=Math.max(1,Math.round(r.fineWidth/xe)),r.coarseHeight=Math.max(1,Math.round(r.fineHeight/xe)),R||Y(),C()},ie=t=>{const o=g.getBoundingClientRect();h.x=t.clientX-o.left,h.y=t.clientY-o.top,h.inside=h.x>=0&&h.y>=0&&h.x<=o.width&&h.y<=o.height,C()},ue=()=>{h.inside=!1,C()},ce=()=>{b=0,C()},se=new ResizeObserver(j);se.observe(g);const fe=new IntersectionObserver(t=>{z=t.some(o=>o.isIntersecting),z&&(b=0,C())});fe.observe(g),window.addEventListener("pointermove",ie,{passive:!0}),document.documentElement.addEventListener("pointerleave",ue),document.addEventListener("visibilitychange",ce),j();let le=T.current.quality,me=T.current.dpr;return P.current=()=>{const t=T.current;if(t.quality!==le||t.dpr!==me){le=t.quality,me=t.dpr,j();return}R||Y(),C()},()=>{var t;cancelAnimationFrame(R),P.current=null,se.disconnect(),fe.disconnect(),window.removeEventListener("pointermove",ie),document.documentElement.removeEventListener("pointerleave",ue),document.removeEventListener("visibilitychange",ce);for(const o of[W,O,...y,...G])e.deleteTexture(o.texture),e.deleteFramebuffer(o.framebuffer);for(const o of Object.values(s))e.deleteProgram(o.program);e.deleteBuffer(oe),e.deleteVertexArray(q),(t=e.getExtension("WEBGL_lose_context"))==null||t.loseContext()}},[]),M.useEffect(()=>{var g;(g=P.current)==null||g.call(P)}),de.jsx("div",{ref:K,className:`plasma-wave-container${Q?` ${Q}`:""}`,...De,children:de.jsx("canvas",{ref:J,className:"plasma-wave-canvas","aria-hidden":"true"})})}export{Ne as default};
