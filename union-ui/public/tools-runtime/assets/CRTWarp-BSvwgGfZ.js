import{a as L,j as ze}from"./index-DrbxZl7q.js";const Ve="crt-warp-container",We="crt-warp-canvas",Ye={none:0,aperture:1,shadow:2,slot:3},je=.56,N=1.6,le=.8,ve=Math.PI*2,He=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,Ke=`#version 300 es
precision highp float;
uniform vec2 uGrid;
uniform float uTime;
uniform float uAmplitude;
uniform float uFrequency;
uniform float uLevels;
uniform float uDecay;
uniform float uReveal;
uniform float uRise;
uniform vec4 uSeed;
uniform sampler2D uPrevious;
out vec4 outColor;

float field(vec2 uv, float t) {
  uv = (uv - 0.5) * uFrequency + 0.5;
  float f = 0.0;
  f += 0.7 * sin(0.5 * uv.x + t / 5.0 + uSeed.x);
  f += 3.0 * sin(1.6 * uv.y + t / 5.0 + uSeed.y);
  f += sin(10.0 * (uv.y * sin(t / 2.0 + uSeed.z) + uv.x * cos(t / 5.0)) + t / 2.0);
  float cx = uv.x + 0.5 * sin(t / 2.0 + uSeed.w);
  float cy = uv.y + 0.5 * cos(t / 4.0 + uSeed.x * 0.7);
  f += 0.4 * sin(sqrt(100.0 * cx * cx + 100.0 * cy * cy + 1.0) + t);
  f += 0.9 * sin(sqrt(75.0 * cx * cx + 25.0 * cy * cy + 1.0) + t);
  f -= 1.4 * sin(sqrt(256.0 * cx * cx + 25.0 * cy * cy + 1.0) + t);
  f += 0.3 * sin(0.5 * uv.y + uv.x + sin(t));
  return f;
}

void main() {
  vec2 cell = floor(gl_FragCoord.xy);
  vec2 uv = (cell + 0.5) / uGrid;
  float s = (0.5 + 0.499 * sin(field(uv, uTime) * uAmplitude)) * mix(1.0 / uLevels, 1.0, uReveal);
  float level = floor(s * uLevels) / max(uLevels - 1.0, 1.0);
  float previous = texelFetch(uPrevious, ivec2(cell), 0).r;
  float lifted = min(level, previous + uRise);
  outColor = vec4(max(lifted, previous * uDecay - 0.004), level, 0.0, 1.0);
}`,Je=`#version 300 es
precision highp float;
uniform sampler2D uContent;
uniform vec2 uSize;
out vec4 outColor;

void main() {
  float v = texture(uContent, gl_FragCoord.xy / uSize).r;
  outColor = vec4(v * v, 0.0, 0.0, 1.0);
}`,Qe=`#version 300 es
precision highp float;
uniform sampler2D uSource;
uniform vec2 uSize;
uniform vec2 uDirection;
uniform float uSigma;
out vec4 outColor;

void main() {
  vec2 uv = gl_FragCoord.xy / uSize;
  float stride = max(uSigma * 0.55, 0.5);
  float total = 0.0;
  float sum = 0.0;
  for (int i = -7; i <= 7; i++) {
    float x = float(i) * stride;
    float w = exp(-0.5 * x * x / (uSigma * uSigma));
    sum += texture(uSource, uv + uDirection * x / uSize).r * w;
    total += w;
  }
  outColor = vec4(sum / total, 0.0, 0.0, 1.0);
}`,Ze=`#version 300 es
precision highp float;
uniform sampler2D uContent;
uniform sampler2D uGlow;
uniform vec2 uGrid;
uniform vec2 uResolution;
uniform float uPixel;
uniform float uTime;
uniform vec3 uColor;
uniform vec3 uBackground;
uniform float uOpaque;
uniform float uLight;
uniform float uLines;
uniform float uScanline;
uniform float uCurve;
uniform float uCorners;
uniform int uMaskType;
uniform float uMask;
uniform float uBloom;
uniform float uBrightness;
uniform float uNoise;
uniform float uFlicker;
uniform float uInterference;
uniform float uVignette;
uniform float uShift;
uniform float uWarm;
uniform float uFocus;
uniform float uStatic;
uniform float uRoll;
uniform float uTear;
uniform float uGain;
uniform vec4 uMagnet;
uniform float uPurity;
out vec4 outColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

vec2 curve(vec2 uv) {
  if (uCurve <= 0.0) return uv;
  vec2 p = (uv - 0.5) * 2.0;
  float corner = uCurve / sqrt(max(uCurve * uCurve - 2.0, 0.001));
  p = uCurve * p / sqrt(max(uCurve * uCurve - dot(p, p), 0.001));
  p /= corner;
  return p * 0.5 + 0.5;
}

float lineValue(float x, float y) {
  if (x < 0.0 || x > 1.0 || y < 0.0 || y > 1.0) return 0.0;
  float cx = x * uGrid.x - 0.5;
  float c0 = floor(cx);
  int row = int(clamp(floor(y * uGrid.y), 0.0, uGrid.y - 1.0));
  float a = texelFetch(uContent, ivec2(int(clamp(c0, 0.0, uGrid.x - 1.0)), row), 0).r;
  float b = texelFetch(uContent, ivec2(int(clamp(c0 + 1.0, 0.0, uGrid.x - 1.0)), row), 0).r;
  float soft = mix(0.5, 0.14, uFocus);
  return pow(mix(a, b, smoothstep(0.5 - soft, 0.5 + soft, cx - c0)), 1.25);
}

float beam(vec2 uv) {
  float ly = uv.y * uLines - 0.5;
  float r0 = floor(ly);
  float f = ly - r0;
  float a = lineValue(uv.x, (r0 + 0.5) / uLines);
  float b = lineValue(uv.x, (r0 + 1.5) / uLines);
  float nearest = f < 0.5 ? a : b;
  float sa = mix(0.16, 0.34, sqrt(a));
  float sb = mix(0.16, 0.34, sqrt(b));
  float lit = a * exp(-0.5 * f * f / (sa * sa)) + b * exp(-0.5 * (1.0 - f) * (1.0 - f) / (sb * sb));
  return mix(nearest, lit * 1.18, uScanline * mix(0.3, 1.0, uFocus));
}

vec3 maskAt(vec2 px) {
  if (uMaskType == 0 || uMask <= 0.0) return vec3(1.0);
  float size = max(1.0, floor(uPixel + 0.5));
  vec2 q = floor(px / size);
  float low = 1.0 - uMask;
  vec3 m = vec3(low);
  float column = q.x;
  if (uMaskType == 2) column += mod(floor(q.y / 2.0), 2.0) * 1.5;
  int stripe = int(mod(floor(column), 3.0));
  if (stripe == 0) m.r = 1.0;
  else if (stripe == 1) m.g = 1.0;
  else m.b = 1.0;
  if (uMaskType == 2 && mod(q.y, 2.0) > 0.5) m *= mix(1.0, 0.72, uMask);
  if (uMaskType == 3) {
    float slot = mod(q.y + mod(floor(q.x / 3.0), 2.0) * 2.0, 4.0);
    if (slot < 1.0) m *= mix(1.0, 0.45, uMask);
  }
  return m / sqrt((1.0 + 2.0 * low) / 3.0);
}

vec3 phosphor(vec3 cov) {
  float peak = max(max(uColor.r, uColor.g), max(uColor.b, 0.001));
  vec3 weight = 1.0 - uColor / peak;
  return uColor * cov * pow(max(cov, vec3(0.0001)), 0.7 * weight);
}

void main() {
  vec2 frag = gl_FragCoord.xy / uResolution;
  float aspect = uResolution.x / uResolution.y;
  vec2 uv = curve(frag);
  float shape = 1.0;
  if (uCorners > 0.0) {
    float margin = uCorners * 0.035;
    float radius = uCorners * 0.1;
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
    vec2 box = (0.5 - margin) * vec2(aspect, 1.0);
    vec2 q = abs(p) - box + radius;
    float sd = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
    float aa = max(fwidth(sd), 0.0005);
    shape = (1.0 - smoothstep(-aa, aa, sd)) * mix(1.0, smoothstep(0.0, 0.06, -sd), 0.35);
    uv = (uv - 0.5) / (1.0 - 2.0 * margin) + 0.5;
  }
  float rolling = step(0.0001, abs(uRoll));
  uv.y += uRoll;
  float wrapped = fract(uv.y);
  uv.y = mix(uv.y, wrapped, rolling);
  float offset = fract(uRoll);
  float reach = smoothstep(0.0, 0.08, min(offset, 1.0 - offset));
  float blank = mix(1.0, smoothstep(0.0, 0.05, wrapped) * smoothstep(1.0, 0.95, wrapped), rolling * reach);

  float line = floor(uv.y * uLines);
  float tick = floor(uTime * 30.0);
  uv.x += uTear * (sin(uv.y * 21.0 + uTime * 37.0) * 0.6 + hash(vec2(line, tick)) - 0.5) * 0.05;
  uv.x += uInterference * 0.003 * (hash(vec2(line * 0.37, floor(uTime * 24.0))) - 0.5);

  vec2 dp = (frag - uMagnet.xy) * vec2(aspect, 1.0);
  float fall = exp(-dot(dp, dp) / max(uMagnet.w * uMagnet.w, 0.0001));
  vec2 swirl = vec2(-dp.y, dp.x) / vec2(aspect, 1.0) * fall * uMagnet.z * 0.5;
  vec3 spread = mix(vec3(0.85), vec3(1.0, 0.6, 0.2), uPurity);

  vec3 level = vec3(
    beam(uv + swirl * spread.r + vec2(uShift, 0.0)),
    beam(uv + swirl * spread.g),
    beam(uv + swirl * spread.b - vec2(uShift, 0.0))
  );

  float turn = uTime * 0.35;
  vec2 axis = vec2(cos(turn), sin(turn));
  float lobe = dot(dp, axis) / max(uMagnet.w, 0.0001);
  float side = dot(dp, vec2(-axis.y, axis.x)) / max(uMagnet.w, 0.0001);
  vec3 purity = vec3(lobe, -0.35 * lobe + 0.6 * side, -lobe);
  level *= 1.0 + uPurity * fall * uMagnet.z * 0.9 * purity;

  float glow = texture(uGlow, uv).r * uBloom;
  float hum = 1.0 - uInterference * 0.24 * smoothstep(0.2, 1.0, 0.5 + 0.5 * sin((frag.y - uTime * 0.09) * 6.2831853));
  float flick = 1.0 + uFlicker * 0.1 * (hash(vec2(floor(uTime * 60.0), 7.3)) - 0.5);
  float grain = hash(gl_FragCoord.xy + fract(uTime) * 173.0) - 0.5;
  vec2 v = frag - 0.5;
  float vignette = mix(1.0, smoothstep(0.0, 1.0, clamp(1.0 - dot(v, v) * 2.0, 0.0, 1.0)), uVignette);
  float gain = uBrightness * hum * flick * vignette * blank * uGain * uWarm;

  float noise = hash(floor(gl_FragCoord.xy / (uPixel * 1.5)) + fract(uTime * 13.7) * 91.0);
  level = mix(level, vec3(noise * noise * 1.15), uStatic);
  level *= gain * (1.0 + grain * uNoise * 2.0);
  level *= maskAt(gl_FragCoord.xy);
  glow *= gain * shape * (1.0 + 0.6 * (1.0 - uFocus));
  level *= shape;

  vec3 color;
  float alpha;
  if (uLight < 0.5) {
    vec3 cov = clamp(level, 0.0, 1.0);
    vec3 light = phosphor(cov) + uColor * glow * 0.5 * (1.0 - cov);
    vec3 excess = max(level - 1.1, 0.0);
    light += (1.0 - light) * (1.0 - exp(-excess * 0.6));
    light = clamp(light, 0.0, 1.0);
    color = uBackground + light * (1.0 - uBackground);
    alpha = max(max(light.r, light.g), light.b);
    if (uOpaque < 0.5) color = light;
  } else {
    vec3 cov = clamp(level * 0.86, 0.0, 0.88);
    cov += clamp(glow * 0.12, 0.0, 0.2) * (1.0 - cov);
    color = mix(uBackground, uColor, cov);
    alpha = max(max(cov.r, cov.g), cov.b);
    if (uOpaque < 0.5) color = uColor * cov;
  }
  outColor = uOpaque > 0.5 ? vec4(color, 1.0) : vec4(color, alpha);
}`,d=(t,s,f)=>Math.min(f,Math.max(s,t)),V=t=>t*t*(3-2*t),$e=t=>t<.5?4*t*t*t:1-(-2*t+2)**3/2;let S=null;const fe=(t,s)=>{if(t==="transparent")return null;if(typeof document>"u"||(S||(S=document.createElement("canvas").getContext("2d")),!S))return s;S.fillStyle="#000000",S.fillStyle=t;const f=S.fillStyle;if(f.startsWith("#")){const p=parseInt(f.slice(1),16);return[(p>>16&255)/255,(p>>8&255)/255,(p&255)/255]}const a=/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/.exec(f);return a?a[4]!==void 0&&Number(a[4])===0?null:[Number(a[1])/255,Number(a[2])/255,Number(a[3])/255]:s},et=t=>{const s=Math.sin(t*12.9898+1.7)*43758.5453,f=Math.sin(t*78.233+4.1)*24634.6345,a=Math.sin(t*37.719+2.9)*17431.7731,p=Math.sin(t*91.113+.3)*31337.1337,m=y=>(y-Math.floor(y))*ve;return t===0?[0,0,0,0]:[m(s),m(f),m(a),m(p)]},tt=t=>{if(t>=N)return[1,1,1];const s=V(d(t/N,0,1)),f=V(d(t/.6,0,1)),a=V(d((t-.15)/(N-.15),0,1));return[s,f,a]},ce=(t,s,f)=>{const a=t.createShader(s);return a?(t.shaderSource(a,f),t.compileShader(a),t.getShaderParameter(a,t.COMPILE_STATUS)?a:(t.deleteShader(a),null)):null},G=(t,s,f)=>{const a=ce(t,t.VERTEX_SHADER,He),p=ce(t,t.FRAGMENT_SHADER,s);if(!a||!p)return null;const m=t.createProgram();if(!m)return null;if(t.attachShader(m,a),t.attachShader(m,p),t.bindAttribLocation(m,0,"aPosition"),t.linkProgram(m),t.deleteShader(a),t.deleteShader(p),!t.getProgramParameter(m,t.LINK_STATUS))return t.deleteProgram(m),null;const y={};return f.forEach(_=>{y[_]=t.getUniformLocation(m,_)}),{program:m,uniforms:y}},B=(t,s,f)=>{const a=t.createTexture();t.bindTexture(t.TEXTURE_2D,a),t.texImage2D(t.TEXTURE_2D,0,t.RGBA8,s,f,0,t.RGBA,t.UNSIGNED_BYTE,null),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE);const p=t.createFramebuffer();return t.bindFramebuffer(t.FRAMEBUFFER,p),t.framebufferTexture2D(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,a,0),t.clearColor(0,0,0,1),t.clear(t.COLOR_BUFFER_BIT),{texture:a,framebuffer:p,width:s,height:f}},I=(t,s)=>{s&&(t.deleteTexture(s.texture),t.deleteFramebuffer(s.framebuffer))},me=()=>{var t;return typeof window<"u"&&(((t=window.matchMedia)==null?void 0:t.call(window,"(prefers-reduced-motion: reduce)").matches)??!1)};function rt({color:t="#c755f7",backgroundColor:s="#120f17",lightMode:f=!1,speed:a=.5,variation:p=0,waveAmplitude:m=.3,waveFrequency:y=2.5,levels:_=3,columns:pe=80,persistence:de=.4,curvature:W=.25,corners:he=0,scanlineStrength:xe=.6,scanlineFrequency:ge=200,mask:we="aperture",maskStrength:Te=.3,bloom:Me=1.5,bloomRadius:ye=1,rgbShift:Ee=.003,noise:be=.1,flicker:Re=.15,interference:Se=.2,vignette:Ce=.3,brightness:Ae=1,intro:ke=!0,mouseReact:Fe=!0,mouseStrength:Pe=.5,changeOnClick:Le=!0,dpr:_e=2,fps:qe=60,paused:De=!1,className:Ge="",style:Be}){const Y=L.useRef(null),Ie=L.useMemo(()=>fe(t,[.78,.33,.97])??[.78,.33,.97],[t]),Ne=L.useMemo(()=>fe(s,[.07,.06,.09]),[s]),j={ink:Ie,paper:Ne,lightMode:f,speed:a,variation:p,amplitude:Math.max(0,m)/.28,frequency:Math.max(.01,y)/2.2,levels:d(Math.round(_),2,12),columns:d(Math.round(pe),8,400),persistence:d(de,0,.98),curve:W>.001?1.1+.42/W:0,corners:d(he,0,1),scanline:d(xe,0,1),lines:d(ge,20,1200),mask:Ye[we]??0,maskStrength:d(Te,0,1),bloom:Math.max(0,Me),bloomRadius:Math.max(.05,ye),rgbShift:Ee,noise:Math.max(0,be),flicker:Math.max(0,Re),interference:Math.max(0,Se),vignette:d(Ce,0,1),brightness:Math.max(0,Ae),intro:ke,mouseReact:Fe,mouseStrength:Math.max(0,Pe),changeOnClick:Le,dpr:Math.max(.5,_e),fps:Math.max(1,qe),paused:De},b=L.useRef(j);return b.current=j,L.useEffect(()=>{const E=Y.current;if(!E)return;const w=document.createElement("canvas");w.className=We,E.appendChild(w);const o=w.getContext("webgl2",{alpha:!0,antialias:!1,depth:!1,stencil:!1,premultipliedAlpha:!0,powerPreference:"high-performance"});if(!o){w.remove();return}const h=G(o,Ke,["uGrid","uTime","uAmplitude","uFrequency","uLevels","uDecay","uReveal","uRise","uSeed","uPrevious"]),C=G(o,Je,["uContent","uSize"]),T=G(o,Qe,["uSource","uSize","uDirection","uSigma"]),q=G(o,Ze,["uContent","uGlow","uGrid","uResolution","uPixel","uTime","uColor","uBackground","uOpaque","uLight","uLines","uScanline","uCurve","uCorners","uMaskType","uMask","uBloom","uBrightness","uNoise","uFlicker","uInterference","uVignette","uShift","uWarm","uFocus","uStatic","uRoll","uTear","uGain","uMagnet","uPurity"]);if(!h||!C||!T||!q){w.remove();return}const H=o.createVertexArray();o.bindVertexArray(H);const K=o.createBuffer();o.bindBuffer(o.ARRAY_BUFFER,K),o.bufferData(o.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),o.STATIC_DRAW),o.enableVertexAttribArray(0),o.vertexAttribPointer(0,2,o.FLOAT,!1,0,0);const e={width:1,height:1,pixel:1,grid:[0,0],cells:[null,null],glows:[null,null],flip:0,time:0,clock:0,last:0,raf:0,visible:!1,introAt:-1,flipAt:-1,flipped:!0,channel:0,pointer:[.5,.5],magnet:[.5,.5,0,0,0],magnetGoal:0,lost:!1,quiet:0,seen:null},Oe=()=>{const r=b.current.columns,i=d(Math.round(r*je*e.height/Math.max(e.width,1)),4,300);(r!==e.grid[0]||i!==e.grid[1])&&(e.cells.forEach(M=>I(o,M)),e.cells=[B(o,r,i),B(o,r,i)],e.grid=[r,i]);const c=Math.max(1,Math.round(e.width/4)),x=Math.max(1,Math.round(e.height/4)),l=e.glows[0];(!l||l.width!==c||l.height!==x)&&(e.glows.forEach(M=>I(o,M)),e.glows=[B(o,c,x),B(o,c,x)])},O=()=>{const n=b.current,r=Math.min(window.devicePixelRatio||1,n.dpr),i=Math.max(1,Math.round(E.clientWidth*r)),c=Math.max(1,Math.round(E.clientHeight*r));e.pixel=r,!(i===e.width&&c===e.height)&&(e.quiet=0,e.width=i,e.height=c,w.width=i,w.height=c)},A=(n,r,i)=>{o.bindFramebuffer(o.FRAMEBUFFER,n?n.framebuffer:null),o.viewport(0,0,r,i),o.drawArrays(o.TRIANGLES,0,3)},R=(n,r,i)=>{o.activeTexture(o.TEXTURE0+n),o.bindTexture(o.TEXTURE_2D,r),o.uniform1i(i,n)},Ue=(n,r)=>{const i=b.current;Oe();const[c,x]=e.grid,l=et(i.variation+e.channel),M=e.introAt<0?0:e.clock-e.introAt,[k,U,X]=i.intro&&!r?tt(M):[1,1,1],D=e.cells[e.flip],g=e.cells[1-e.flip],[v,F]=e.glows;if(!D||!g||!v||!F)return;o.useProgram(h.program),o.uniform2f(h.uniforms.uGrid,c,x),o.uniform1f(h.uniforms.uTime,e.time),o.uniform1f(h.uniforms.uAmplitude,i.amplitude),o.uniform1f(h.uniforms.uFrequency,i.frequency),o.uniform1f(h.uniforms.uLevels,i.levels),o.uniform1f(h.uniforms.uDecay,r?0:i.persistence**(n*60)),o.uniform1f(h.uniforms.uReveal,k),o.uniform1f(h.uniforms.uRise,k<1?n/.22:1),o.uniform4f(h.uniforms.uSeed,l[0],l[1],l[2],l[3]),R(0,D.texture,h.uniforms.uPrevious),A(g,c,x),e.flip=1-e.flip,o.useProgram(C.program),o.uniform2f(C.uniforms.uSize,v.width,v.height),R(0,g.texture,C.uniforms.uContent),A(v,v.width,v.height);const Xe=Math.max(.6,v.height/48*i.bloomRadius);o.useProgram(T.program),o.uniform2f(T.uniforms.uSize,v.width,v.height),o.uniform1f(T.uniforms.uSigma,Xe),o.uniform2f(T.uniforms.uDirection,1,0),R(0,v.texture,T.uniforms.uSource),A(F,F.width,F.height),o.uniform2f(T.uniforms.uDirection,0,1),R(0,F.texture,T.uniforms.uSource),A(v,v.width,v.height);let ie=0,ne=0,ue=0,ae=1;if(e.flipAt>=0){const P=e.clock-e.flipAt;if(!e.flipped&&P>=.22&&(e.flipped=!0,e.channel+=1),P>=le)e.flipAt=-1;else{const se=P/le;ie=$e(se),ne=Math.sin(Math.PI*d(P/.5,0,1))*.6,ue=Math.sin(Math.PI*d(P/.55,0,1))*.75,ae=1-.3*Math.sin(Math.PI*se)}}o.useProgram(q.program);const u=q.uniforms;R(0,g.texture,u.uContent),R(1,v.texture,u.uGlow),o.uniform2f(u.uGrid,c,x),o.uniform2f(u.uResolution,e.width,e.height),o.uniform1f(u.uPixel,e.pixel),o.uniform1f(u.uTime,r?0:e.clock),o.uniform3f(u.uColor,i.ink[0],i.ink[1],i.ink[2]);const z=i.paper??[0,0,0];o.uniform3f(u.uBackground,z[0],z[1],z[2]),o.uniform1f(u.uOpaque,i.paper?1:0),o.uniform1f(u.uLight,i.lightMode?1:0),o.uniform1f(u.uLines,i.lines),o.uniform1f(u.uScanline,i.scanline),o.uniform1f(u.uCurve,i.curve),o.uniform1f(u.uCorners,i.corners),o.uniform1i(u.uMaskType,i.mask),o.uniform1f(u.uMask,i.maskStrength),o.uniform1f(u.uBloom,i.bloom),o.uniform1f(u.uBrightness,i.brightness),o.uniform1f(u.uNoise,i.noise),o.uniform1f(u.uFlicker,r?0:i.flicker),o.uniform1f(u.uInterference,i.interference),o.uniform1f(u.uVignette,i.vignette),o.uniform1f(u.uShift,i.rgbShift),o.uniform1f(u.uWarm,U),o.uniform1f(u.uFocus,X),o.uniform1f(u.uStatic,ue),o.uniform1f(u.uRoll,ie),o.uniform1f(u.uTear,ne),o.uniform1f(u.uGain,ae),o.uniform4f(u.uMagnet,e.magnet[0],1-e.magnet[1],e.magnet[4]*i.mouseStrength*2,.24),o.uniform1f(u.uPurity,i.mask>0?1:0),A(null,e.width,e.height)},J=n=>{if(e.raf=requestAnimationFrame(J),!e.visible||document.hidden||e.lost){e.last=n;return}const r=b.current,i=1e3/r.fps;if(e.last&&n-e.last<i-1)return;const c=e.last?Math.min((n-e.last)/1e3,.1):1/60;e.last=n;const x=me();e.clock+=c,e.introAt<0&&(e.introAt=e.clock),!r.paused&&!x&&(e.time+=c*r.speed);const l=e.magnet,M=ve/.3;for(let g=0;g<2;g++){const v=-M*M*(l[g]-e.pointer[g])-2*M*l[2+g];l[2+g]+=v*c,l[g]+=l[2+g]*c}const k=r.mouseReact&&!x?e.magnetGoal:0;l[4]+=(k-l[4])*(1-Math.exp(-c/.18));const U=r.paused||x,X=Math.abs(l[4]-k)>.002||l[4]>.002&&(Math.abs(l[2])+Math.abs(l[3])>5e-4||Math.abs(l[0]-e.pointer[0])>5e-4),D=e.flipAt>=0||r.intro&&!x&&e.clock-e.introAt<N||X;e.seen!==r||D||!U?e.quiet=0:e.quiet+=1,e.seen=r,!(e.quiet>90)&&(O(),Ue(c,x))},Q=n=>{const r=E.getBoundingClientRect();return{x:(n.clientX-r.left)/Math.max(r.width,1),y:(n.clientY-r.top)/Math.max(r.height,1),inside:n.clientX>=r.left&&n.clientX<=r.right&&n.clientY>=r.top&&n.clientY<=r.bottom}},Z=n=>{const r=Q(n);r.inside&&(e.magnetGoal===0&&e.magnet[4]<.02&&(e.magnet[0]=r.x,e.magnet[1]=r.y,e.magnet[2]=0,e.magnet[3]=0),e.pointer=[r.x,r.y]),e.magnetGoal=r.inside?1:0},$=()=>{e.magnetGoal=0},ee=n=>{if(!(!b.current.changeOnClick||n.button!==0||n.target instanceof Element&&n.target.closest('a, button, input, textarea, select, label, [role="button"]')||!Q(n).inside)){if(me()){e.channel+=1;return}e.flipAt>=0||(e.flipAt=e.clock,e.flipped=!1)}},te=n=>{n.preventDefault(),e.lost=!0},oe=new IntersectionObserver(n=>{e.visible=n.some(r=>r.isIntersecting)});oe.observe(E);const re=new ResizeObserver(O);return re.observe(E),O(),window.addEventListener("pointermove",Z,{passive:!0}),window.addEventListener("pointerdown",ee),document.documentElement.addEventListener("pointerleave",$),w.addEventListener("webglcontextlost",te),e.raf=requestAnimationFrame(J),()=>{var n;cancelAnimationFrame(e.raf),oe.disconnect(),re.disconnect(),window.removeEventListener("pointermove",Z),window.removeEventListener("pointerdown",ee),document.documentElement.removeEventListener("pointerleave",$),w.removeEventListener("webglcontextlost",te),e.cells.forEach(r=>I(o,r)),e.glows.forEach(r=>I(o,r)),[h,C,T,q].forEach(r=>o.deleteProgram(r.program)),o.deleteBuffer(K),o.deleteVertexArray(H),(n=o.getExtension("WEBGL_lose_context"))==null||n.loseContext(),w.remove()}},[]),ze.jsx("div",{ref:Y,className:[Ve,Ge].filter(Boolean).join(" "),style:Be})}export{rt as default};
