import{a as F,j as ge}from"./index-DrbxZl7q.js";const Ue={bayer:0,bayer4:1,bayer2:2,halftone:3,lines:4,crosshatch:5,noise:6,none:7},Ie={erase:0,reveal:1,ripple:2},B=16,U=4,J=8,Ne=1.8,we=1.6,Xe=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,ze=`#version 300 es
precision highp float;
precision highp int;
uniform vec2 uResolution;
uniform float uCell;
uniform float uTime;
uniform float uWaveSpeed;
uniform float uWaveFrequency;
uniform float uWaveAmplitude;
uniform float uScale;
uniform float uContrast;
uniform float uBrightness;
uniform int uEffect;
uniform float uRadius;
uniform float uStrength;
uniform vec3 uTrail[${B}];
uniform int uTrailCount;
uniform vec4 uRipples[${U}];
uniform int uRippleCount;
uniform float uIntro;
uniform float uReach;
out vec4 outColor;

vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec2 fade(vec2 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }

float cnoise(vec2 P) {
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod289(Pi);
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;
  vec4 i = permute(permute(ix) + iy);
  vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0;
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;
  vec2 g00 = vec2(gx.x, gy.x);
  vec2 g10 = vec2(gx.y, gy.y);
  vec2 g01 = vec2(gx.z, gy.z);
  vec2 g11 = vec2(gx.w, gy.w);
  vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));
  g00 *= norm.x;
  g01 *= norm.y;
  g10 *= norm.z;
  g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 fadeXY = fade(Pf.xy);
  vec2 nx = mix(vec2(n00, n01), vec2(n10, n11), fadeXY.x);
  return 2.3 * mix(nx.x, nx.y, fadeXY.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amp = 1.0;
  for (int i = 0; i < 4; i++) {
    value += amp * abs(cnoise(p));
    p *= uWaveFrequency;
    amp *= uWaveAmplitude;
  }
  return value;
}

float pattern(vec2 p) {
  vec2 p2 = p - uTime * uWaveSpeed;
  return fbm(p + fbm(p2));
}

void main() {
  vec2 corner = (gl_FragCoord.xy - 0.5) * uCell;
  vec2 uv = corner / uResolution - 0.5;
  uv.x *= uResolution.x / uResolution.y;

  float touch = 0.0;
  for (int i = 0; i < ${B}; i++) {
    if (i >= uTrailCount) break;
    vec3 point = uTrail[i];
    float reach = uRadius * mix(0.55, 1.0, point.z);
    touch = max(touch, point.z * (1.0 - smoothstep(0.0, reach, length(uv - point.xy))));
  }

  vec2 warp = vec2(0.0);
  float ring = 0.0;
  for (int i = 0; i < ${U}; i++) {
    if (i >= uRippleCount) break;
    vec4 ripple = uRipples[i];
    vec2 delta = uv - ripple.xy;
    float dist = length(delta);
    float life = clamp(ripple.z / ${we.toFixed(2)}, 0.0, 1.0);
    float wave = exp(-pow((dist - ripple.z * 0.9) / 0.07, 2.0)) * (1.0 - life) * (1.0 - life) * ripple.w;
    warp += (dist > 0.0001 ? delta / dist : vec2(0.0)) * wave * 0.035;
    ring += wave;
  }

  if (uEffect == 2 && touch > 0.0) {
    vec3 head = uTrail[0];
    vec2 delta = uv - head.xy;
    float dist = length(delta);
    warp += (dist > 0.0001 ? delta / dist : vec2(0.0)) * sin(dist / max(uRadius, 0.001) * 16.0 - uTime * 7.0) * 0.04 * touch * uStrength;
  }

  float f = pattern((uv + warp) / uScale);
  if (uEffect == 0) f -= 0.5 * touch * uStrength;
  if (uEffect == 1) f += 0.5 * touch * uStrength;
  f += ring * 0.55;
  f = (f - 0.5) * uContrast + 0.5 + uBrightness;
  float show = clamp((uIntro * uReach - length(uv)) / 0.45, 0.0, 1.0);
  float v = clamp(f, 0.0, 1.0) * show * show * (3.0 - 2.0 * show);
  outColor = vec4(floor(v * 255.0) / 255.0, fract(v * 255.0), 0.0, 1.0);
}`,We=`#version 300 es
precision highp float;
precision highp int;
uniform sampler2D uField;
uniform ivec2 uFieldSize;
uniform float uCellDevice;
uniform int uMode;
uniform float uColorNum;
uniform vec3 uWave;
uniform vec3 uBackground;
uniform vec3 uPalette[${J}];
uniform int uPaletteCount;
uniform float uTransparent;
out vec4 outColor;

const float bayer8[64] = float[64](
  0.0 / 64.0, 48.0 / 64.0, 12.0 / 64.0, 60.0 / 64.0, 3.0 / 64.0, 51.0 / 64.0, 15.0 / 64.0, 63.0 / 64.0,
  32.0 / 64.0, 16.0 / 64.0, 44.0 / 64.0, 28.0 / 64.0, 35.0 / 64.0, 19.0 / 64.0, 47.0 / 64.0, 31.0 / 64.0,
  8.0 / 64.0, 56.0 / 64.0, 4.0 / 64.0, 52.0 / 64.0, 11.0 / 64.0, 59.0 / 64.0, 7.0 / 64.0, 55.0 / 64.0,
  40.0 / 64.0, 24.0 / 64.0, 36.0 / 64.0, 20.0 / 64.0, 43.0 / 64.0, 27.0 / 64.0, 39.0 / 64.0, 23.0 / 64.0,
  2.0 / 64.0, 50.0 / 64.0, 14.0 / 64.0, 62.0 / 64.0, 1.0 / 64.0, 49.0 / 64.0, 13.0 / 64.0, 61.0 / 64.0,
  34.0 / 64.0, 18.0 / 64.0, 46.0 / 64.0, 30.0 / 64.0, 33.0 / 64.0, 17.0 / 64.0, 45.0 / 64.0, 29.0 / 64.0,
  10.0 / 64.0, 58.0 / 64.0, 6.0 / 64.0, 54.0 / 64.0, 9.0 / 64.0, 57.0 / 64.0, 5.0 / 64.0, 53.0 / 64.0,
  42.0 / 64.0, 26.0 / 64.0, 38.0 / 64.0, 22.0 / 64.0, 41.0 / 64.0, 25.0 / 64.0, 37.0 / 64.0, 21.0 / 64.0
);

const float bayer4[16] = float[16](
  0.0 / 16.0, 8.0 / 16.0, 2.0 / 16.0, 10.0 / 16.0,
  12.0 / 16.0, 4.0 / 16.0, 14.0 / 16.0, 6.0 / 16.0,
  3.0 / 16.0, 11.0 / 16.0, 1.0 / 16.0, 9.0 / 16.0,
  15.0 / 16.0, 7.0 / 16.0, 13.0 / 16.0, 5.0 / 16.0
);

const float bayer2[4] = float[4](0.0 / 4.0, 2.0 / 4.0, 3.0 / 4.0, 1.0 / 4.0);

float threshold(vec2 cell) {
  if (uMode == 1) {
    ivec2 c = ivec2(mod(cell, 4.0));
    return bayer4[c.y * 4 + c.x];
  }
  if (uMode == 2) {
    ivec2 c = ivec2(mod(cell, 2.0));
    return bayer2[c.y * 2 + c.x];
  }
  if (uMode == 3) {
    vec2 r = vec2(cell.x + cell.y, cell.x - cell.y) * 0.70710678 / 4.0;
    return clamp(length(fract(r) - 0.5) * 1.41421356, 0.0, 0.999);
  }
  if (uMode == 4) {
    return abs(fract(cell.y / 4.0) - 0.5) * 2.0 * 0.999;
  }
  if (uMode == 5) {
    float a = abs(fract((cell.x + cell.y) / 6.0) - 0.5) * 2.0;
    float b = abs(fract((cell.x - cell.y) / 6.0) - 0.5) * 2.0;
    return min(a, b) * 0.999;
  }
  if (uMode == 6) {
    return fract(52.9829189 * fract(dot(cell, vec2(0.06711056, 0.00583715))));
  }
  if (uMode == 7) {
    return 0.25;
  }
  ivec2 c = ivec2(mod(cell, 8.0));
  return bayer8[c.y * 8 + c.x];
}

vec3 toSrgb(vec3 c) {
  c = clamp(c, 0.0, 1.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

void main() {
  vec2 cell = floor(gl_FragCoord.xy / uCellDevice);
  vec4 sampleValue = texelFetch(uField, clamp(ivec2(cell), ivec2(0), uFieldSize - 1), 0);
  float f = sampleValue.r + sampleValue.g / 255.0;
  float t = threshold(cell) - 0.25;

  if (uPaletteCount > 1) {
    float n = float(uPaletteCount);
    float v = f + t / (n - 1.0);
    v = clamp(v - mix(0.2, 0.0, smoothstep(0.45, 0.8, v)), 0.0, 1.0);
    int index = int(floor(v * (n - 1.0) + 0.5));
    outColor = vec4(toSrgb(uPalette[index]), 1.0);
    return;
  }

  float levels = max(uColorNum, 1.01) - 1.0;
  if (uTransparent > 0.5) {
    float v = f + t / levels;
    v = clamp(v - mix(0.2, 0.0, smoothstep(0.45, 0.8, v)), 0.0, 1.0);
    float a = floor(v * levels + 0.5) / levels;
    outColor = vec4(toSrgb(uWave) * a, a);
    return;
  }

  float base = dot(uBackground, vec3(0.2126, 0.7152, 0.0722));
  vec3 offset = (uWave - vec3(base)) * f + t / levels;
  float luminance = dot(uBackground + offset, vec3(0.2126, 0.7152, 0.0722));
  offset -= mix(0.2, 0.0, smoothstep(0.45, 0.8, luminance));
  bool rising = dot(uWave, vec3(0.2126, 0.7152, 0.0722)) >= base;
  float lower = rising ? 0.0 : -max(uBackground.r, max(uBackground.g, uBackground.b));
  float upper = rising ? 1.0 - min(uBackground.r, min(uBackground.g, uBackground.b)) : 0.0;
  offset = floor(clamp(offset, lower, upper) * levels + 0.5) / levels;
  outColor = vec4(toSrgb(uBackground + offset), 1.0);
}`,K=(r,w,x)=>Math.min(x,Math.max(w,r)),ye=(r,w,x)=>{const h=r.createShader(w);return h?(r.shaderSource(h,x),r.compileShader(h),r.getShaderParameter(h,r.COMPILE_STATUS)?h:(r.deleteShader(h),null)):null},Ee=(r,w)=>{const x=ye(r,r.VERTEX_SHADER,Xe),h=ye(r,r.FRAGMENT_SHADER,w),f=r.createProgram();if(!x||!h||!f)return null;if(r.attachShader(f,x),r.attachShader(f,h),r.bindAttribLocation(f,0,"aPosition"),r.linkProgram(f),r.deleteShader(x),r.deleteShader(h),!r.getProgramParameter(f,r.LINK_STATUS))return r.deleteProgram(f),null;const I={},O=r.getProgramParameter(f,r.ACTIVE_UNIFORMS);for(let P=0;P<O;P++){const C=r.getActiveUniform(f,P);C&&(I[C.name.replace("[0]","")]=r.getUniformLocation(f,C.name))}return{program:f,uniforms:I}},ke=r=>r<=.04045?r/12.92:Math.pow((r+.055)/1.055,2.4),Ve=({waveSpeed:r=.05,waveFrequency:w=3,waveAmplitude:x=.3,waveColor:h=[.5,.5,.5],backgroundColor:f=[0,0,0],colorNum:I=4,pixelSize:O=2,disableAnimation:P=!1,enableMouseInteraction:C=!0,mouseRadius:Re=1,ditherMode:Te="bayer",palette:Q,scale:be=1,contrast:Ae=1,brightness:Me=0,mouseEffect:Se="erase",mouseStrength:Fe=1,trail:Pe=.5,clickRipple:Ce=!0,intro:_e=!0,dpr:De,className:Z="",style:Le})=>{const ee=F.useRef(null),te=F.useRef(null),_=F.useRef(null),re={waveSpeed:r,waveFrequency:w,waveAmplitude:x,waveColor:h,backgroundColor:f,colorNum:Math.max(2,I),pixelSize:Math.max(1,O),disableAnimation:P,enableMouseInteraction:C,mouseRadius:Math.max(.001,Re),mode:Ue[Te]??0,palette:Array.isArray(Q)?Q.filter(Boolean).slice(0,J):[],scale:Math.max(.05,be),contrast:Ae,brightness:Me,effect:Ie[Se]??0,mouseStrength:Math.max(0,Fe),trail:K(Pe,0,1),clickRipple:Ce,intro:_e,dpr:De},g=F.useRef(re);return g.current=re,F.useEffect(()=>{var xe;const y=ee.current,m=te.current,e=m==null?void 0:m.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!y||!m||!e)return;const N=Ee(e,ze),X=Ee(e,We);if(!N||!X)return;const oe=e.createBuffer(),V=e.createVertexArray();e.bindVertexArray(V),e.bindBuffer(e.ARRAY_BUFFER,oe),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0);const D=e.createTexture();e.bindTexture(e.TEXTURE_2D,D),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);const G=e.createFramebuffer(),T=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),R=((xe=window.matchMedia)==null?void 0:xe.call(window,"(prefers-reduced-motion: reduce)").matches)??!1,q=new Map,$=t=>{if(Array.isArray(t))return[0,1,2].map(u=>K(Number(t[u])||0,0,1));const a=String(t);if(q.has(a))return q.get(a);let c=[0,0,0];if(T){T.clearRect(0,0,1,1),T.fillStyle="#000000",T.fillStyle=a,T.fillRect(0,0,1,1);const[u,k,o]=T.getImageData(0,0,1,1).data;c=[u,k,o].map(s=>ke(s/255))}return q.set(a,c),c},n={width:1,height:1,ratio:1,cell:1,cellCss:1,cols:1,rows:1},l={x:0,y:0,inside:!1,set:!1},d=[],p=[],ne=new Float32Array(B*3),ie=new Float32Array(U*4),ae=new Float32Array(J*3),i={time:0,hx:0,hy:0,presence:0,reveal:g.current.intro&&!R?0:1};let b=0,A=0,z=!0;const ce=()=>{const t=g.current;n.cell=Math.max(1,Math.round(t.pixelSize*n.ratio)),n.cellCss=n.cell/n.ratio,n.cols=Math.max(1,Math.ceil(m.width/n.cell)),n.rows=Math.max(1,Math.ceil(m.height/n.cell)),e.bindTexture(e.TEXTURE_2D,D),e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,n.cols,n.rows,0,e.RGBA,e.UNSIGNED_BYTE,null),e.bindFramebuffer(e.FRAMEBUFFER,G),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,D,0),e.bindFramebuffer(e.FRAMEBUFFER,null)},Y=(t,a)=>{const c=n.width/n.height;return[(t/n.width-.5)*c,-(a/n.height-.5)]},H=()=>{const t=g.current;Math.max(1,Math.round(t.pixelSize*n.ratio))!==n.cell&&ce();let c=0;for(let v=0;v<d.length&&c<B;v++){const E=d[v];E.weight<=.01||(ne.set([E.x,E.y,E.weight],c*3),c++)}let u=0;for(let v=p.length-1;v>=0&&u<U;v--)ie.set([p[v].x,p[v].y,p[v].age,1],u*4),u++;const k=t.intro&&!R?i.reveal*i.reveal*(3-2*i.reveal):1;e.bindVertexArray(V),e.bindFramebuffer(e.FRAMEBUFFER,G),e.viewport(0,0,n.cols,n.rows),e.useProgram(N.program);const o=N.uniforms;e.uniform2f(o.uResolution,m.width/n.ratio,m.height/n.ratio),e.uniform1f(o.uCell,n.cellCss),e.uniform1f(o.uTime,i.time),e.uniform1f(o.uWaveSpeed,t.waveSpeed),e.uniform1f(o.uWaveFrequency,t.waveFrequency),e.uniform1f(o.uWaveAmplitude,t.waveAmplitude),e.uniform1f(o.uScale,t.scale),e.uniform1f(o.uContrast,t.contrast),e.uniform1f(o.uBrightness,t.brightness),e.uniform1i(o.uEffect,t.effect),e.uniform1f(o.uRadius,t.mouseRadius),e.uniform1f(o.uStrength,t.mouseStrength),e.uniform3fv(o.uTrail,ne),e.uniform1i(o.uTrailCount,c),e.uniform4fv(o.uRipples,ie),e.uniform1i(o.uRippleCount,u),e.uniform1f(o.uIntro,k),e.uniform1f(o.uReach,.5*Math.hypot(n.width/n.height,1)+.45),e.drawArrays(e.TRIANGLES,0,3),e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,m.width,m.height),e.useProgram(X.program);const s=X.uniforms;e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,D),e.uniform1i(s.uField,0),e.uniform2i(s.uFieldSize,n.cols,n.rows),e.uniform1f(s.uCellDevice,n.cell),e.uniform1i(s.uMode,t.mode),e.uniform1f(s.uColorNum,t.colorNum),e.uniform3fv(s.uWave,$(t.waveColor));const L=t.backgroundColor==="transparent";e.uniform3fv(s.uBackground,L?[0,0,0]:$(t.backgroundColor)),e.uniform1f(s.uTransparent,L?1:0),t.palette.forEach((v,E)=>ae.set($(v),E*3)),e.uniform3fv(s.uPalette,ae),e.uniform1i(s.uPaletteCount,t.palette.length),e.drawArrays(e.TRIANGLES,0,3)},le=t=>{if(b=0,!z||document.hidden)return;const a=g.current,c=A?K((t-A)/1e3,5e-4,.05):1/60;A=t,!a.disableAnimation&&!R&&(i.time+=c);const u=a.enableMouseInteraction&&l.inside&&!R;if(i.presence+=((u?1:0)-i.presence)*(1-Math.exp(-c/(u?.12:.35))),l.set){const[o,s]=Y(l.x,l.y),L=1-Math.exp(-c/.06),v=Math.hypot(o-i.hx,s-i.hy);i.hx+=(o-i.hx)*L,i.hy+=(s-i.hy)*L;const E=Math.exp(-c/(.08+a.trail*.7));d.forEach(Be=>{Be.weight*=E});const S=d[0];for(!S||Math.hypot(S.x-i.hx,S.y-i.hy)>.012||v>.012?d.unshift({x:i.hx,y:i.hy,weight:i.presence}):(S.x=i.hx,S.y=i.hy,S.weight=i.presence),a.trail<=.001&&(d.length=Math.min(d.length,1));d.length>B||d.length>1&&d[d.length-1].weight<.01;)d.pop()}for(let o=p.length-1;o>=0;o--)p[o].age+=c,p[o].age>=we&&p.splice(o,1);!a.intro||R?i.reveal=1:i.reveal<1&&(i.reveal=Math.min(1,i.reveal+c/Ne)),H(),(!a.disableAnimation||i.reveal<1||p.length>0||i.presence>.002||d.some(o=>o.weight>.01))&&!R?b=requestAnimationFrame(le):A=0},M=()=>{!b&&z&&!document.hidden&&(b=requestAnimationFrame(le))},j=()=>{const t=g.current,a=Math.max(1,y.clientWidth),c=Math.max(1,y.clientHeight),u=Math.min(t.dpr||window.devicePixelRatio||1,2);n.width=a,n.height=c,m.width=Math.max(1,Math.round(a*u)),m.height=Math.max(1,Math.round(c*u)),n.ratio=m.width/a,ce(),H(),M()},ue=t=>{const a=y.getBoundingClientRect();if(l.x=t.clientX-a.left,l.y=t.clientY-a.top,l.inside=l.x>=0&&l.y>=0&&l.x<=a.width&&l.y<=a.height,l.inside&&!l.set){const[c,u]=Y(l.x,l.y);i.hx=c,i.hy=u,l.set=!0}},se=t=>{ue(t),M()},fe=t=>{const a=g.current;if(ue(t),!l.inside||!a.clickRipple||R)return;const[c,u]=Y(l.x,l.y);p.push({x:c,y:u,age:0}),p.length>U&&p.shift(),M()},W=t=>{t.pointerType!=="mouse"&&(l.inside=!1)},me=()=>{l.inside=!1},de=()=>{A=0,M()},ve=new ResizeObserver(j);ve.observe(y);const he=new IntersectionObserver(t=>{z=t.some(a=>a.isIntersecting),z&&(A=0,M())});he.observe(y),window.addEventListener("pointermove",se,{passive:!0}),window.addEventListener("pointerdown",fe,{passive:!0}),window.addEventListener("pointerup",W,{passive:!0}),window.addEventListener("pointercancel",W,{passive:!0}),document.documentElement.addEventListener("pointerleave",me),document.addEventListener("visibilitychange",de),j();let pe=g.current.dpr;return _.current=()=>{const t=g.current;if(t.dpr!==pe){pe=t.dpr,j();return}b||H(),M()},()=>{var t;cancelAnimationFrame(b),_.current=null,ve.disconnect(),he.disconnect(),window.removeEventListener("pointermove",se),window.removeEventListener("pointerdown",fe),window.removeEventListener("pointerup",W),window.removeEventListener("pointercancel",W),document.documentElement.removeEventListener("pointerleave",me),document.removeEventListener("visibilitychange",de),e.deleteProgram(N.program),e.deleteProgram(X.program),e.deleteBuffer(oe),e.deleteVertexArray(V),e.deleteTexture(D),e.deleteFramebuffer(G),(t=e.getExtension("WEBGL_lose_context"))==null||t.loseContext()}},[]),F.useEffect(()=>{var y;(y=_.current)==null||y.call(_)}),ge.jsx("div",{ref:ee,className:`dither-container${Z?` ${Z}`:""}`,style:Le,children:ge.jsx("canvas",{ref:te,className:"dither-canvas","aria-hidden":"true"})})};export{Ve as default};
