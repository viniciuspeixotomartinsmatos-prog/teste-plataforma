import{a as M,j as Pe}from"./index-DrbxZl7q.js";const se=8,_e=4,tt=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,ot=`#version 300 es
precision highp float;
uniform vec2 uView;
uniform float uZoom;
uniform float uPhase;
uniform float uTwinkleClock;
uniform float uRings;
uniform vec3 uColors[8];
uniform int uColorCount;
uniform int uStreakCount;
uniform int uColumns;
uniform float uWidth;
uniform float uTail;
uniform float uTwinkle;
uniform float uHead;
uniform float uDepth;
uniform vec4 uMouse;
uniform vec3 uLens;
uniform float uLightMode;
uniform float uEncode;
out vec4 outColor;

const vec3 CAMERA = vec3(0.0, -0.8888889, -0.2222222);
const float TAU = 6.28318530718;
const float SPACING = 0.005;
const float REACH = 0.32;

uint scramble(uint x) {
  x ^= x >> 16;
  x *= 0x7feb352du;
  x ^= x >> 15;
  x *= 0x846ca68bu;
  x ^= x >> 16;
  return x;
}

float unit(uint x) {
  return float(x & 0xffffu) / 65535.0;
}

float stroke(float d, float w) {
  float s = max(0.75 * w, 0.55);
  return 0.75 * w / s * exp(-0.5 * d * d / (s * s));
}

float orb(float d, float r) {
  float s = max(0.6 * r, 0.7);
  float e = 0.6 * r / s;
  return e * e * exp(-0.5 * d * d / (s * s));
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 screen = (2.0 * frag - uView) / uView.x;
  vec2 p = screen;
  mat2 warp = mat2(1.0);
  if (uLens.z > 0.0) {
    vec2 o = p - uLens.xy;
    float e = uLens.z * exp(-dot(o, o) / (REACH * REACH));
    p -= o * e;
    warp = mat2(1.0 - e) + outerProduct(o, o) * (2.0 * e / (REACH * REACH));
  }

  vec3 dir = vec3(p, uZoom);
  vec3 exits = (1.0 - CAMERA * sign(dir)) / max(abs(dir), vec3(1e-6));
  float u = min(exits.x, min(exits.y, exits.z));
  for (int i = 0; i < 5; i++) {
    vec3 h = CAMERA + u * dir;
    vec3 h2 = h * h;
    u -= (dot(h2, h2) - 1.0) / (4.0 * dot(dir, h2 * h));
  }
  vec3 hit = CAMERA + u * dir;
  vec3 normal = hit * hit * hit;
  float facing = dot(normal, dir);
  vec3 stepX = u * (vec3(1.0, 0.0, 0.0) - dir * (normal.x / facing));
  vec3 stepY = u * (vec3(0.0, 1.0, 0.0) - dir * (normal.y / facing));
  float ring = hit.y * hit.y + hit.z * hit.z;
  float theta = atan(hit.z, hit.y);
  mat2 jacobian = mat2(
    stepX.x,
    (hit.y * stepX.z - hit.z * stepX.y) / ring,
    stepY.x,
    (hit.y * stepY.z - hit.z * stepY.y) / ring
  ) * warp * (2.0 / uView.x);

  vec2 gradX = vec2(jacobian[0][0], jacobian[1][0]);
  vec2 gradTheta = vec2(jacobian[0][1], jacobian[1][1]);
  float scale = max(length(gradX), 1e-8);
  float det = max(abs(gradX.x * gradTheta.y - gradX.y * gradTheta.x), 1e-12);
  float along = scale / det;
  float skew = dot(gradX, gradTheta) / det;
  float spacing = SPACING / scale;
  float detail = smoothstep(1.6, 3.2, spacing);
  if (detail <= 0.0) {
    outColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }
  float halfWidth = min(uWidth / scale, 0.2 * spacing);
  float headRadius = min(2.0 * uWidth / scale, 0.35 * spacing);
  float headReach = 4.0 * max(0.6 * headRadius, 0.7);
  float edge = uColumns > 1 ? 1.0 : 0.5;
  float period = TAU / uRings;
  float fog = exp(-max(u * length(dir) - 0.6, 0.0) * 1.6 * uDepth);

  float boost = 1.0;
  if (uMouse.z > 0.0) {
    vec2 m = screen - uMouse.xy;
    boost += 2.0 * uMouse.z * exp(-dot(m, m) / max(uMouse.w * uMouse.w, 1e-4));
  }

  int count = max(uColorCount, 1);
  vec3 total = vec3(0.0);
  for (int layer = 0; layer < 16; layer++) {
    if (layer >= uStreakCount) break;
    float x = hit.x + float(layer) * SPACING / 8.0;
    float nearest = floor(x / SPACING + 0.5);
    float side = x >= nearest * SPACING ? 1.0 : -1.0;
    for (int k = 0; k < 2; k++) {
      if (k >= uColumns) break;
      float column = nearest + side * float(k);
      float across = (x - column * SPACING) / scale;
      uint seed = scramble(uint(int(column) + 65536) + uint(layer) * 0x9e3779b9u);
      uint next = scramble(seed);
      float hue = unit(seed >> 16);
      float delta = theta - uPhase * (1.0 + floor(unit(seed) * 16.0) / 16.0) - unit(next) * period;
      delta -= period * floor(delta / period + 0.5);
      float ahead = delta * along - across * skew;
      if (abs(ahead) > headReach && (delta > 0.0 || -delta * uTail > 3.2)) continue;
      float behind = max(-delta, 0.0);
      float fall = exp(-uTail * behind) * (1.0 - smoothstep(0.5, 0.95, behind / (0.5 * period)));
      fall *= 1.0 - smoothstep(1.2, 3.2, uTail * behind);
      float reach = length(vec2(across, ahead));
      float trail = stroke(ahead > 0.0 ? reach : abs(across), halfWidth * mix(0.4, 1.0, fall)) * fall;
      float glint = orb(reach, headRadius) * mix(3.0, 1.8, uLightMode);
      float weight = mix(1.5, 1.0 + sin(uTwinkleClock + 7.0 * hue + 4.0), uTwinkle);
      weight *= 1.0 - smoothstep(0.72 * edge, edge, abs(across) / spacing);
      vec3 color = uColors[min(int(hue * float(count)), count - 1)];
      vec3 hot = mix(color, vec3(1.0), uHead * (1.0 - uLightMode));
      total += (trail * color + glint * hot) * weight;
    }
  }

  outColor = vec4(total * fog * boost * detail * uEncode, 1.0);
}`,rt=`#version 300 es
precision highp float;
uniform sampler2D uSource;
uniform vec2 uTarget;
uniform vec2 uTexel;
uniform float uLimit;
out vec4 outColor;

void main() {
  vec2 uv = gl_FragCoord.xy / uTarget;
  vec3 color = texture(uSource, uv - uTexel).rgb;
  color += texture(uSource, uv + uTexel).rgb;
  color += texture(uSource, uv + vec2(uTexel.x, -uTexel.y)).rgb;
  color += texture(uSource, uv + vec2(-uTexel.x, uTexel.y)).rgb;
  outColor = vec4(min(color * 0.25, vec3(uLimit)), 1.0);
}`,nt=`#version 300 es
precision highp float;
uniform sampler2D uSource;
uniform vec2 uTarget;
uniform vec2 uStep;
out vec4 outColor;

void main() {
  vec2 uv = gl_FragCoord.xy / uTarget;
  vec3 color = texture(uSource, uv).rgb * 0.181862;
  color += (texture(uSource, uv + uStep * 1.423135).rgb + texture(uSource, uv - uStep * 1.423135).rgb) * 0.284316;
  color += (texture(uSource, uv + uStep * 3.326702).rgb + texture(uSource, uv - uStep * 3.326702).rgb) * 0.106598;
  color += (texture(uSource, uv + uStep * 5.242989).rgb + texture(uSource, uv - uStep * 5.242989).rgb) * 0.018156;
  outColor = vec4(color, 1.0);
}`,at=`#version 300 es
precision highp float;
uniform sampler2D uScene;
uniform sampler2D uBloom0;
uniform sampler2D uBloom1;
uniform sampler2D uBloom2;
uniform sampler2D uBloom3;
uniform vec2 uView;
uniform float uDecode;
uniform float uGlow;
uniform float uBloom;
uniform float uPresence;
uniform float uOpacity;
uniform float uFade;
uniform float uLightMode;
uniform vec3 uTopColor;
uniform float uTopGlow;
out vec4 outColor;

float smootherstep01(float t) {
  t = clamp(t, 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uView;
  vec3 light = texelFetch(uScene, ivec2(gl_FragCoord.xy), 0).rgb;
  if (uBloom > 0.0) {
    vec3 halo = texture(uBloom0, uv).rgb * 0.42;
    halo += texture(uBloom1, uv).rgb * 0.3;
    halo += texture(uBloom2, uv).rgb * 0.18;
    halo += texture(uBloom3, uv).rgb * 0.1;
    light += halo * uBloom * (uLightMode > 0.5 ? 0.2 : 1.0);
  }
  light *= uDecode * uGlow * uPresence;

  if (uLightMode < 0.5 && uTopGlow > 0.0) {
    float aspect = uView.x / uView.y;
    vec2 q = vec2((uv.x - 0.5) * aspect, 1.04 - uv.y);
    float spread = 0.34 * max(aspect, 0.75);
    float core = exp(-q.x * q.x / (spread * spread) - q.y * q.y / 0.06);
    float halo = exp(-q.x * q.x / (3.6 * spread * spread) - q.y * q.y / 0.18);
    light += uTopColor * uTopGlow * (core * 0.85 + halo * 0.3) * uPresence;
  }

  vec3 lit = max(light, 0.0);
  vec3 mapped = sqrt(1.0 - exp(-1.3 * lit * lit / (lit + 0.025)));
  float peak = max(mapped.r, max(mapped.g, mapped.b));

  float mask = uOpacity;
  float edge = uFade * 0.5;
  if (edge > 0.0) {
    mask *= smootherstep01(uv.x / edge) * smootherstep01((1.0 - uv.x) / edge);
    mask *= smootherstep01(uv.y / edge) * smootherstep01((1.0 - uv.y) / edge);
  }
  float grain = (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;

  if (uLightMode > 0.5) {
    float coverage = clamp(smoothstep(0.0, 0.5, peak) * mask * 0.94 + grain, 0.0, 1.0);
    vec3 chroma = sqrt(clamp(lit / max(max(lit.r, max(lit.g, lit.b)), 1e-6), 0.0, 1.0));
    chroma = pow(chroma, vec3(1.35));
    chroma /= max(max(chroma.r, max(chroma.g, chroma.b)), 1e-4);
    float saturation = 1.0 - min(chroma.r, min(chroma.g, chroma.b));
    chroma = mix(vec3(0.3), chroma, smoothstep(0.08, 0.35, saturation));
    outColor = vec4(chroma * coverage, coverage);
  } else {
    vec3 color = clamp(mapped + grain, 0.0, 1.0) * mask;
    outColor = vec4(color, max(color.r, max(color.g, color.b)));
  }
}`,it=2.6,ut=9,le=Math.PI*2,k=(n,w,p)=>Math.min(p,Math.max(w,n)),ke=(n,w,p)=>{const h=n.createShader(w);return h?(n.shaderSource(h,p),n.compileShader(h),n.getShaderParameter(h,n.COMPILE_STATUS)?h:(n.deleteShader(h),null)):null},$=(n,w)=>{const p=ke(n,n.VERTEX_SHADER,tt),h=ke(n,n.FRAGMENT_SHADER,w),f=n.createProgram();if(!p||!h||!f)return null;if(n.attachShader(f,p),n.attachShader(f,h),n.bindAttribLocation(f,0,"aPosition"),n.linkProgram(f),n.deleteShader(p),n.deleteShader(h),!n.getProgramParameter(f,n.LINK_STATUS))return n.deleteProgram(f),null;const W={},Z=n.getProgramParameter(f,n.ACTIVE_UNIFORMS);for(let F=0;F<Z;F++){const D=n.getActiveUniform(f,F);D&&(W[D.name.replace(/\[0\]$/,"")]=n.getUniformLocation(f,D.name))}return{program:f,uniforms:W}},lt=({colors:n=["#ffffff"],backgroundColor:w="#94a3b8",speed:p=.3,streakCount:h=2,streakWidth:f=.8,streakLength:W=1,glow:Z=1,density:F=.6,twinkle:D=.3,zoom:Fe=3,backgroundGlow:De=.1,headGlow:Xe=.6,depth:Ge=.5,bloom:Ie=.35,opacity:Ue=1,mouseInteraction:Be=!0,mouseStrength:Ne=.4,mouseRadius:Oe=.45,mouseDampening:We=.15,lens:Ve=.5,holdToWarp:Ye=!0,intro:ze=!0,fade:He=0,lightMode:qe=!1,mixBlendMode:ce,paused:je=!1,dpr:$e,className:fe="",style:Ze})=>{const me=M.useRef(null),de=M.useRef(null),X=M.useRef(null),E=M.useRef(null),[Ke,Je]=M.useState(0);return E.current={colors:(Array.isArray(n)&&n.length?n:["#ffffff"]).slice(0,se).map(String),backgroundColor:String(w),speed:p,streakCount:Math.round(k(h,1,16)),streakWidth:Math.max(.05,f),streakLength:Math.max(.05,W),glow:Math.max(0,Z),density:F,twinkle:k(D,0,1),zoom:Math.max(.1,Fe),backgroundGlow:Math.max(0,De),headGlow:k(Xe,0,1),depth:Math.max(0,Ge),bloom:Math.max(0,Ie),opacity:k(Ue,0,1),mouseInteraction:Be,mouseStrength:Math.max(0,Ne),mouseRadius:Math.max(.01,Oe),mouseDampening:Math.max(0,We),lens:k(Ve,0,1),holdToWarp:Ye,intro:ze,fade:k(He,0,1),lightMode:qe,paused:je,dpr:$e},M.useEffect(()=>{var ye;const m=me.current,l=de.current,e=l==null?void 0:l.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance"});if(!m||!l||!e)return;const he=!!e.getExtension("EXT_color_buffer_float"),K=$(e,ot),J=$(e,rt),V=$(e,nt),Q=$(e,at);if(!K||!J||!V||!Q)return;const xe=t=>{t.preventDefault()},pe=()=>Je(t=>t+1);l.addEventListener("webglcontextlost",xe),l.addEventListener("webglcontextrestored",pe);const ge=e.createBuffer(),ee=e.createVertexArray();e.bindVertexArray(ee),e.bindBuffer(e.ARRAY_BUFFER,ge),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0);const Qe=he?e.RGBA16F:e.RGBA8,te=he?1:.25,oe=()=>({texture:null,framebuffer:e.createFramebuffer(),width:0,height:0}),G=oe(),Y=Array.from({length:_e},()=>[oe(),oe()]),re=(t,o,a)=>{t.texture&&t.width===o&&t.height===a||(t.texture&&e.deleteTexture(t.texture),t.texture=e.createTexture(),t.width=o,t.height=a,e.bindTexture(e.TEXTURE_2D,t.texture),e.texStorage2D(e.TEXTURE_2D,1,Qe,o,a),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.bindFramebuffer(e.FRAMEBUFFER,t.framebuffer),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t.texture,0))},I=(t,o)=>(e.bindFramebuffer(e.FRAMEBUFFER,t?t.framebuffer:null),e.viewport(0,0,t?t.width:l.width,t?t.height:l.height),e.useProgram(o.program),o.uniforms),S=(t,o)=>{e.activeTexture(e.TEXTURE0+t),e.bindTexture(e.TEXTURE_2D,o)},C=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),ne=new Map,et=t=>{if(ne.has(t))return ne.get(t);let o=[1,1,1];if(C){C.clearRect(0,0,1,1),C.fillStyle="#ffffff",C.fillStyle=t,C.fillRect(0,0,1,1);const[a,d,B]=C.getImageData(0,0,1,1).data;o=[a/255,d/255,B/255]}return ne.set(t,o),o},ve=t=>et(t).map(o=>o*o),U=((ye=window.matchMedia)==null?void 0:ye.call(window,"(prefers-reduced-motion: reduce)").matches)??!1,ae=new Float32Array(se*3),c={x:0,y:0,inside:!1,held:!1},r={travel:0,intro:E.current.intro&&!U?0:1,mouseX:0,mouseY:0,lensX:0,lensY:0,touch:0,warp:0};let T=0,y=0,z=!0;const ie=()=>{const t=E.current,o=l.width,a=l.height,d=Math.max(1,m.clientWidth),B=Math.max(1,m.clientHeight);e.bindVertexArray(ee),re(G,o,a),Y.forEach((i,s)=>{const v=Math.max(1,Math.round(d/2**(s+1))),R=Math.max(1,Math.round(B/2**(s+1)));re(i[0],v,R),re(i[1],v,R)});const N=r.intro,q=Math.min(1,N*2.2),L=1+5*Math.pow(1-N,2)+2.5*r.warp,b=Math.max(1,Math.floor(le*Math.max(t.density,.05)+.5)),P=le/b,O=9+r.travel,_=t.colors.map(ve);ae.fill(0);for(let i=0;i<se;i++)ae.set(_[Math.min(i,_.length-1)],i*3);const j=i=>(2*i-o)/o,Le=i=>(2*i-a)/o,u=I(G,K);if(e.uniform2f(u.uView,o,a),e.uniform1f(u.uZoom,t.zoom),e.uniform1f(u.uPhase,O%(16*P)),e.uniform1f(u.uTwinkleClock,O%le),e.uniform1f(u.uRings,b),e.uniform3fv(u.uColors,ae),e.uniform1i(u.uColorCount,_.length),e.uniform1i(u.uStreakCount,t.streakCount),e.uniform1i(u.uColumns,t.streakWidth>1?2:1),e.uniform1f(u.uWidth,5e-4*t.streakWidth),e.uniform1f(u.uTail,19/(t.streakLength*L)),e.uniform1f(u.uTwinkle,t.twinkle),e.uniform1f(u.uHead,t.headGlow),e.uniform1f(u.uDepth,t.depth),e.uniform4f(u.uMouse,j(r.mouseX),Le(r.mouseY),t.mouseInteraction?t.mouseStrength*r.touch:0,t.mouseRadius),e.uniform3f(u.uLens,j(r.lensX),Le(r.lensY),t.mouseInteraction?.5*t.lens*r.touch:0),e.uniform1f(u.uLightMode,t.lightMode?1:0),e.uniform1f(u.uEncode,te),e.drawArrays(e.TRIANGLES,0,3),t.bloom>0){let i=G;Y.forEach(([s,v])=>{const R=I(s,J);S(0,i.texture),e.uniform1i(R.uSource,0),e.uniform2f(R.uTarget,s.width,s.height),e.uniform2f(R.uTexel,1/i.width,1/i.height),e.uniform1f(R.uLimit,4*te),e.drawArrays(e.TRIANGLES,0,3);let A=I(v,V);S(0,s.texture),e.uniform1i(A.uSource,0),e.uniform2f(A.uTarget,v.width,v.height),e.uniform2f(A.uStep,1/s.width,0),e.drawArrays(e.TRIANGLES,0,3),A=I(s,V),S(0,v.texture),e.uniform1i(A.uSource,0),e.uniform2f(A.uTarget,s.width,s.height),e.uniform2f(A.uStep,0,1/v.height),e.drawArrays(e.TRIANGLES,0,3),i=s})}const x=I(null,Q);S(0,G.texture),e.uniform1i(x.uScene,0),Y.forEach(([i],s)=>{S(s+1,i.texture),e.uniform1i(x[`uBloom${s}`],s+1)}),e.uniform2f(x.uView,o,a),e.uniform1f(x.uDecode,1/te),e.uniform1f(x.uGlow,t.glow),e.uniform1f(x.uBloom,t.bloom),e.uniform1f(x.uPresence,q),e.uniform1f(x.uOpacity,t.opacity),e.uniform1f(x.uFade,t.fade),e.uniform1f(x.uLightMode,t.lightMode?1:0),e.uniform3fv(x.uTopColor,ve(t.backgroundColor)),e.uniform1f(x.uTopGlow,t.backgroundGlow),e.drawArrays(e.TRIANGLES,0,3);for(let i=_e;i>=0;i--)S(i,null)},we=t=>{if(T=0,!z||document.hidden)return;const o=E.current,a=y?Math.min(.05,(t-y)/1e3):1/60;y=t,!o.intro||U?r.intro=1:r.intro<1&&(r.intro=Math.min(1,r.intro+a/it));const d=o.holdToWarp&&c.held&&c.inside&&!U;r.warp+=((d?1:0)-r.warp)*(1-Math.exp(-a*(d?2.2:1.6)));const B=ut*Math.pow(1-r.intro,2)+6*r.warp,N=!o.paused&&!U;N&&(r.travel+=a*.1*o.speed*(1+B));const q=l.width/Math.max(1,m.clientWidth),L=c.x*q,b=(m.clientHeight-c.y)*q,P=o.mouseInteraction&&c.inside&&!U;P&&r.touch<.01&&(r.mouseX=L,r.mouseY=b,r.lensX=L,r.lensY=b);const O=o.mouseDampening>0?1-Math.exp(-a/o.mouseDampening):1;r.mouseX+=(L-r.mouseX)*O,r.mouseY+=(b-r.mouseY)*O;const _=1-Math.exp(-a*6);r.lensX+=(L-r.lensX)*_,r.lensY+=(b-r.lensY)*_,r.touch+=((P?1:0)-r.touch)*(1-Math.exp(-a*(P?4:2))),ie();const j=r.intro<1||r.warp>.001||Math.abs((P?1:0)-r.touch)>.002;N&&o.speed!==0||j?T=requestAnimationFrame(we):y=0},g=()=>{!T&&z&&!document.hidden&&(T=requestAnimationFrame(we))},ue=()=>{const t=E.current,o=Math.max(1,m.clientWidth),a=Math.max(1,m.clientHeight),d=Math.min(t.dpr||window.devicePixelRatio||1,2);l.width=Math.max(1,Math.round(o*d)),l.height=Math.max(1,Math.round(a*d)),T||ie(),g()},Ee=t=>{const o=m.getBoundingClientRect(),a=t.clientX-o.left,d=t.clientY-o.top;return{x:a,y:d,inside:a>=0&&d>=0&&a<=o.width&&d<=o.height}},Te=t=>{const o=Ee(t);c.x=o.x,c.y=o.y,c.inside=o.inside,g()},be=t=>{const o=Ee(t);o.inside&&(c.x=o.x,c.y=o.y,c.inside=!0,c.held=!0,g())},H=()=>{c.held=!1,g()},Re=()=>{c.inside=!1,c.held=!1,g()},Ae=()=>{y=0,g()},Me=new ResizeObserver(ue);Me.observe(m);const Se=new IntersectionObserver(t=>{z=t.some(o=>o.isIntersecting),z&&(y=0,g())});Se.observe(m),window.addEventListener("pointermove",Te,{passive:!0}),window.addEventListener("pointerdown",be,{passive:!0}),window.addEventListener("pointerup",H,{passive:!0}),window.addEventListener("pointercancel",H,{passive:!0}),document.documentElement.addEventListener("pointerleave",Re),document.addEventListener("visibilitychange",Ae),ue();let Ce=E.current.dpr;return X.current=()=>{const t=E.current;if(t.dpr!==Ce){Ce=t.dpr,ue();return}T||ie(),g()},()=>{var t;cancelAnimationFrame(T),X.current=null,l.removeEventListener("webglcontextlost",xe),l.removeEventListener("webglcontextrestored",pe),Me.disconnect(),Se.disconnect(),window.removeEventListener("pointermove",Te),window.removeEventListener("pointerdown",be),window.removeEventListener("pointerup",H),window.removeEventListener("pointercancel",H),document.documentElement.removeEventListener("pointerleave",Re),document.removeEventListener("visibilitychange",Ae),[G,...Y.flat()].forEach(o=>{o.texture&&e.deleteTexture(o.texture),e.deleteFramebuffer(o.framebuffer)}),[K,J,V,Q].forEach(o=>e.deleteProgram(o.program)),e.deleteBuffer(ge),e.deleteVertexArray(ee),e.isContextLost()||(t=e.getExtension("WEBGL_lose_context"))==null||t.loseContext()}},[Ke]),M.useEffect(()=>{var m;(m=X.current)==null||m.call(X)}),Pe.jsx("div",{ref:me,className:`lightfall-container${fe?` ${fe}`:""}`,style:{...ce?{mixBlendMode:ce}:null,...Ze},children:Pe.jsx("canvas",{ref:de,className:"lightfall-canvas","aria-hidden":"true"})})};export{lt as default};
