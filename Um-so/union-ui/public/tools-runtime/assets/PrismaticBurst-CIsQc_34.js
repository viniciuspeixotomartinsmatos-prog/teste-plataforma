import{a as D,j as Ue}from"./index-DrbxZl7q.js";const Ne=4,ke=4,vt=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,gt=`#version 300 es
precision highp float;
precision highp int;

uniform vec2 uResolution;
uniform float uTime;
uniform float uPhase;
uniform float uIntensity;
uniform mat3 uOrient;
uniform int uColorCount;
uniform float uDistort;
uniform vec2 uOffset;
uniform sampler2D uGradient;
uniform float uNoiseAmount;
uniform int uRayCount;
uniform float uZoom;
uniform float uRayWidth;
uniform float uTwist;
uniform float uFlow;
uniform float uCenterFade;
uniform vec4 uPointer;
uniform vec4 uPulses[4];
uniform vec3 uIntro;
uniform float uEncode;
out vec4 outColor;

float hash21(vec2 p) {
  p = floor(p);
  float f = 52.9829189 * fract(dot(p, vec2(0.065, 0.005)));
  return fract(f);
}

mat2 rot30() {
  return mat2(0.8, -0.5, 0.5, 0.8);
}

float layeredNoise(vec2 fragPx) {
  vec2 p = mod(fragPx + vec2(uTime * 30.0, -uTime * 21.0), 1024.0);
  vec2 q = rot30() * p;
  float n = 0.0;
  n += 0.40 * hash21(q);
  n += 0.25 * hash21(q * 2.0 + 17.0);
  n += 0.20 * hash21(q * 4.0 + 47.0);
  n += 0.10 * hash21(q * 8.0 + 113.0);
  n += 0.05 * hash21(q * 16.0 + 191.0);
  return n;
}

float edgeFade(vec2 frag, vec2 res, vec2 offset) {
  vec2 toC = frag - 0.5 * res - offset;
  float r = length(toC) / (0.5 * min(res.x, res.y) * uCenterFade);
  float x = clamp(r, 0.0, 1.0);
  float q = x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
  float s = q * 0.5;
  s = pow(s, 1.5);
  float tail = 1.0 - pow(1.0 - s, 2.0);
  s = mix(s, tail, 0.2);
  float dn = (layeredNoise(frag * 0.15) - 0.5) * 0.0015 * s;
  return clamp(s + dn, 0.0, 1.0);
}

vec2 rot2(vec2 v, float a) {
  float s = sin(a);
  float c = cos(a);
  return mat2(c, -s, s, c) * v;
}

float bendAngle(vec3 q, float t) {
  return 0.8 * sin(q.x * 0.55 + t * 0.6) + 0.7 * sin(q.y * 0.50 - t * 0.5) + 0.6 * sin(q.z * 0.60 + t * 0.7);
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  float t = uPhase;
  float jitterAmp = 0.1 * clamp(uNoiseAmount, 0.0, 1.0);
  vec2 centered = 2.0 * (frag - uOffset) - uResolution;
  vec3 dir = normalize(vec3(centered, uResolution.y * max(uZoom, 1e-3)));
  float marchT = 0.0;
  vec3 col = vec3(0.0);
  float n = layeredNoise(frag);
  float amp = clamp(uDistort, 0.0, 50.0) * 0.15;
  float edge = 0.5 - 0.35 * (uRayWidth - 1.0);
  mat2 twist = mat2(1.0);
  if (uTwist != 0.0) {
    float a = uTwist * length(centered) / uResolution.y;
    float c = cos(a);
    float s = sin(a);
    twist = mat2(c, s, -s, c);
  }

  for (int i = 0; i < 44; ++i) {
    vec3 P = marchT * dir;
    P.z -= 2.0;
    float rad = length(P);
    vec3 Pl = P * (10.0 / max(rad, 1e-6));
    if (uTwist != 0.0) Pl.xy = twist * Pl.xy;
    Pl = uOrient * Pl;

    float stepLen = min(rad - 0.3, n * jitterAmp) + 0.1;

    vec3 Pb = Pl;
    if (amp > 0.0) {
      float grow = smoothstep(0.35, 3.0, marchT);
      float a1 = amp * grow * bendAngle(Pl * 0.6, t);
      float a2 = 0.5 * amp * grow * bendAngle(Pl.zyx * 0.5 + 3.1, t * 0.9);
      Pb.xz = rot2(Pb.xz, a1);
      Pb.xy = rot2(Pb.xy, a2);
    }

    float rayPattern = smoothstep(
      edge,
      edge + 0.2,
      sin(Pb.x + cos(Pb.y) * cos(Pb.z)) * sin(Pb.z + sin(Pb.y) * cos(Pb.x + t))
    );

    if (uRayCount > 0) {
      float ang = atan(Pb.y, Pb.x);
      float comb = 0.5 + 0.5 * cos(float(uRayCount) * ang);
      comb = pow(comb, 3.0);
      rayPattern *= smoothstep(0.15, 0.95, comb);
    }

    float depth = marchT - uFlow;
    vec3 spectral;
    if (uColorCount > 0) {
      float saw = fract(depth * 0.25);
      float tRay = saw * saw * (3.0 - 2.0 * saw);
      spectral = 2.0 * texture(uGradient, vec2(clamp(tRay, 0.0, 1.0), 0.5)).rgb;
    } else {
      spectral = 1.0 + cos(depth * 3.0 + vec3(0.0, 1.0, 2.0));
    }

    col += (0.05 / (0.4 + stepLen)) * smoothstep(5.0, 0.0, rad) * spectral * rayPattern;
    marchT += stepLen;
  }

  col *= edgeFade(frag, uResolution, uOffset);
  col *= uIntensity;

  float unit = 0.5 * min(uResolution.x, uResolution.y);
  float radius = length(frag - 0.5 * uResolution - uOffset) / unit;
  float lift = 1.0;
  for (int k = 0; k < 4; k++) {
    vec4 pulse = uPulses[k];
    if (pulse.y <= 0.0) continue;
    float d = (radius - pulse.x) / pulse.z;
    lift += pulse.y * exp(-d * d) + pulse.w;
  }
  if (uPointer.z > 0.0) {
    vec2 m = (frag - uPointer.xy) / unit;
    lift += uPointer.z * exp(-dot(m, m) / max(uPointer.w * uPointer.w, 1e-4));
  }
  if (uIntro.z > 0.0) {
    vec2 toC = frag - 0.5 * uResolution - uOffset;
    float ang = atan(toC.y, toC.x);
    float streak = 0.5 + 0.22 * sin(ang * 5.0 + 1.3) + 0.16 * sin(ang * 13.0 + 4.1) + 0.12 * sin(ang * 29.0 + 2.2);
    float front = uIntro.x * (0.7 + 0.3 * streak);
    float d = (radius - front) / 0.2;
    lift += uIntro.y * exp(-d * d);
    lift *= smoothstep(front, front - 0.5, radius);
  }

  outColor = vec4(col * lift * uEncode, 1.0);
}`,pt=`#version 300 es
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
}`,Et=`#version 300 es
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
}`,Tt=`#version 300 es
precision highp float;
uniform sampler2D uScene;
uniform vec2 uSceneSize;
uniform sampler2D uBloom0;
uniform sampler2D uBloom1;
uniform sampler2D uBloom2;
uniform sampler2D uBloom3;
uniform vec2 uView;
uniform float uExact;
uniform float uDecode;
uniform float uBloom;
uniform float uFade;
uniform float uLightMode;
out vec4 outColor;

vec3 tap(vec2 uv) {
  return textureLod(uScene, uv, 0.0).rgb;
}

vec3 bicubic(vec2 uv) {
  vec2 position = uv * uSceneSize;
  vec2 center = floor(position - 0.5) + 0.5;
  vec2 f = position - center;
  vec2 w0 = f * (-0.5 + f * (1.0 - 0.5 * f));
  vec2 w1 = 1.0 + f * f * (-2.5 + 1.5 * f);
  vec2 w2 = f * (0.5 + f * (2.0 - 1.5 * f));
  vec2 w3 = f * f * (-0.5 + 0.5 * f);
  vec2 w12 = w1 + w2;
  vec2 t0 = (center - 1.0) / uSceneSize;
  vec2 t3 = (center + 2.0) / uSceneSize;
  vec2 t12 = (center + w2 / w12) / uSceneSize;
  vec3 result = tap(vec2(t0.x, t0.y)) * w0.x * w0.y;
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
  vec3 col = uExact > 0.5 ? texelFetch(uScene, ivec2(gl_FragCoord.xy), 0).rgb : bicubic(uv);
  if (uBloom > 0.0) {
    vec3 halo = texture(uBloom0, uv).rgb * 0.42;
    halo += texture(uBloom1, uv).rgb * 0.3;
    halo += texture(uBloom2, uv).rgb * 0.18;
    halo += texture(uBloom3, uv).rgb * 0.1;
    col += halo * uBloom * (uLightMode > 0.5 ? 0.25 : 1.0);
  }
  col = clamp(col * uDecode, 0.0, 1.0);

  float mask = 1.0;
  float edge = uFade * 0.5;
  if (edge > 0.0) {
    mask *= smootherstep01(uv.x / edge) * smootherstep01((1.0 - uv.x) / edge);
    mask *= smootherstep01(uv.y / edge) * smootherstep01((1.0 - uv.y) / edge);
  }

  if (uLightMode > 0.5) {
    float energy = max(max(col.r, col.g), col.b);
    vec3 hue = col / max(energy, 0.0001);
    float neutral = min(hue.r, min(hue.g, hue.b));
    hue = max(hue - vec3(neutral * 0.68), vec3(0.0));
    hue /= max(max(hue.r, max(hue.g, hue.b)), 0.0001);
    vec3 pigment = mix(hue, hue * hue, 0.24) * 0.64;
    float coverage = smoothstep(0.001, 0.32, energy);
    coverage = pow(coverage, 0.72) * 0.92 * mask;
    outColor = vec4(pigment * coverage, coverage);
  } else {
    col *= mask;
    outColor = vec4(col, max(col.r, max(col.g, col.b)));
  }
}`,Be={low:.35,medium:.5,high:.7},Oe=.2,wt=2.4,ze=1.5,Ge={rotate:0,rotate3d:1,hover:2},S=(n,u,c)=>Math.min(c,Math.max(u,n)),qe=n=>{if(n==null)return 0;if(typeof n=="number")return n;const u=parseFloat(String(n).trim().replace("px",""));return Number.isNaN(u)?0:u},fe=n=>{const u=Math.cos(n),c=Math.sin(n);return[1,0,0,0,u,-c,0,c,u]},me=n=>{const u=Math.cos(n),c=Math.sin(n);return[u,0,c,0,1,0,-c,0,u]},yt=n=>{const u=Math.cos(n),c=Math.sin(n);return[u,-c,0,c,u,0,0,0,1]},W=(n,u)=>{const c=new Float32Array(9);for(let m=0;m<3;m++)for(let l=0;l<3;l++)c[m*3+l]=n[l]*u[m*3]+n[3+l]*u[m*3+1]+n[6+l]*u[m*3+2];return c},Ye=(n,u,c)=>{const m=n.createShader(u);return m?(n.shaderSource(m,c),n.compileShader(m),n.getShaderParameter(m,n.COMPILE_STATUS)?m:(n.deleteShader(m),null)):null},$=(n,u)=>{const c=Ye(n,n.VERTEX_SHADER,vt),m=Ye(n,n.FRAGMENT_SHADER,u),l=n.createProgram();if(!c||!m||!l)return null;if(n.attachShader(l,c),n.attachShader(l,m),n.bindAttribLocation(l,0,"aPosition"),n.linkProgram(l),n.deleteShader(c),n.deleteShader(m),!n.getProgramParameter(l,n.LINK_STATUS))return n.deleteProgram(l),null;const V={},K=n.getProgramParameter(l,n.ACTIVE_UNIFORMS);for(let k=0;k<K;k++){const B=n.getActiveUniform(l,k);B&&(V[B.name.replace(/\[0\]$/,"")]=n.getUniformLocation(l,B.name))}return{program:l,uniforms:V}},bt=({colors:n,intensity:u=2,speed:c=.5,animationType:m="rotate3d",distort:l=0,rayCount:V=0,rayWidth:K=1,zoom:k=1,twist:B=0,flow:We=0,centerFade:Ve=1,grain:He=.8,glow:je=0,offset:I,mouseInteraction:Ze=!0,mouseStrength:$e=.5,hoverDampness:Ke=.25,clickBurst:Qe=!0,intro:Je=!0,fade:et=0,quality:tt="high",resolution:ot,lightMode:rt=!1,mixBlendMode:Q,paused:nt=!1,dpr:it,className:he="",style:at})=>{const de=D.useRef(null),xe=D.useRef(null),O=D.useRef(null),P=D.useRef(null),[ut,st]=D.useState(0);return P.current={colors:Array.isArray(n)?n.slice(0,64).map(String):[],intensity:Math.max(0,u),speed:c,animation:Ge[m]??Ge.rotate3d,distort:Math.max(0,l),rayCount:Math.max(0,Math.floor(V??0)),rayWidth:S(K,.2,2.5),zoom:Math.max(.05,k),twist:B,flow:We,centerFade:S(Ve,.5,3),grain:S(He,.3,1),glow:Math.max(0,je),offsetX:qe(I==null?void 0:I.x),offsetY:qe(I==null?void 0:I.y),mouseInteraction:Ze,mouseStrength:Math.max(0,$e),hoverDampness:S(Ke,0,1),clickBurst:Qe,intro:Je,fade:S(et,0,1),scale:S(ot??Be[tt]??Be.high,Oe,1),lightMode:rt,paused:nt,dpr:it},D.useEffect(()=>{var Le;const v=de.current,x=xe.current,e=x==null?void 0:x.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance"});if(!v||!x||!e)return;const ve=!!e.getExtension("EXT_color_buffer_float"),J=$(e,gt),ee=$(e,pt),H=$(e,Et),te=$(e,Tt);if(!J||!ee||!H||!te)return;const ge=t=>{t.preventDefault()},pe=()=>st(t=>t+1);x.addEventListener("webglcontextlost",ge),x.addEventListener("webglcontextrestored",pe);const Ee=e.createBuffer(),oe=e.createVertexArray();e.bindVertexArray(oe),e.bindBuffer(e.ARRAY_BUFFER,Ee),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0);const ct=ve?e.RGBA16F:e.RGBA8,re=ve?1:.25,ne=()=>({texture:null,framebuffer:e.createFramebuffer(),width:0,height:0}),z=ne(),j=Array.from({length:Ne},()=>[ne(),ne()]),ie=(t,r,i)=>{t.texture&&t.width===r&&t.height===i||(t.texture&&e.deleteTexture(t.texture),t.texture=e.createTexture(),t.width=r,t.height=i,e.bindTexture(e.TEXTURE_2D,t.texture),e.texStorage2D(e.TEXTURE_2D,1,ct,r,i),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.bindFramebuffer(e.FRAMEBUFFER,t.framebuffer),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t.texture,0))},G=(t,r)=>(e.bindFramebuffer(e.FRAMEBUFFER,t?t.framebuffer:null),e.viewport(0,0,t?t.width:x.width,t?t.height:x.height),e.useProgram(r.program),r.uniforms),A=(t,r)=>{e.activeTexture(e.TEXTURE0+t),e.bindTexture(e.TEXTURE_2D,r)},ae=e.createTexture();let Te=null;const X=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),lt=t=>{if(!X)return[255,255,255];X.clearRect(0,0,1,1),X.fillStyle="#ffffff",X.fillStyle=t,X.fillRect(0,0,1,1);const[r,i,h]=X.getImageData(0,0,1,1).data;return[r,i,h]},ft=t=>{const r=t.join("|");if(r===Te)return;Te=r;const i=Math.max(1,t.length),h=new Uint8Array(i*4).fill(255);t.forEach((y,R)=>h.set(lt(y),R*4)),e.bindTexture(e.TEXTURE_2D,ae),e.pixelStorei(e.UNPACK_ALIGNMENT,1),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,i,1,0,e.RGBA,e.UNSIGNED_BYTE,h),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE)},q=((Le=window.matchMedia)==null?void 0:Le.call(window,"(prefers-reduced-motion: reduce)").matches)??!1,d={x:0,y:0,inside:!1},o={time:0,phase:0,flow:0,kick:0,intro:P.current.intro&&!q?0:1,hoverX:.5,hoverY:.5,smoothX:0,smoothY:0,touch:0,governor:1,slow:0,quick:0},w=[],ue=new Float32Array(ke*4);let _=0,M=0,Z=!0;const se=()=>{const t=P.current,r=x.width,i=x.height,h=Math.max(1,v.clientWidth),y=Math.max(1,v.clientHeight),R=Math.max(Oe,t.scale*o.governor),E=Math.max(1,Math.round(r*R)),g=Math.max(1,Math.round(i*R)),le=E===r&&g===i;e.bindVertexArray(oe),ie(z,E,g),j.forEach((a,s)=>{const T=Math.max(1,Math.round(h/2**(s+1))),C=Math.max(1,Math.round(y/2**(s+1)));ie(a[0],T,C),ie(a[1],T,C)}),ft(t.colors);const p=E/h,U=t.mouseInteraction?o.touch:0,Ce=h>0?o.smoothX/h*2-1:0,Fe=y>0?o.smoothY/y*2-1:0,De=.06*t.mouseStrength*U*Math.min(E,g)*.5,Ie=t.offsetX*p+Ce*De,Xe=t.offsetY*p-Fe*De,Y=o.phase;let N;if(t.animation===0){const a=Y*.2,s=Math.cos(a);N=[s,0,Math.cos(a+11),0,1,0,Math.cos(a+33),0,s]}else if(t.animation===1)N=W(W(yt(Y*.17),me(Y*.21)),fe(Y*.31));else{const a=o.hoverX*2-1,s=o.hoverY*2-1;N=W(me(a*.6),fe(s*.6))}if(t.animation!==2&&U>0){const a=.3*t.mouseStrength*U;N=W(N,W(me(Ce*a),fe(Fe*a)))}ue.fill(0),w.forEach((a,s)=>{const T=a.age/ze;ue.set([a.age*1.7,1.6*Math.pow(1-T,1.6),.2+a.age*.16,.35*Math.exp(-a.age*7)],s*4)});const ht=.5*Math.min(E,g),dt=Math.hypot(E*.5+Math.abs(Ie),g*.5+Math.abs(Xe))/Math.max(ht,1),xt=1-Math.pow(1-o.intro,3),f=G(z,J);if(A(0,ae),e.uniform1i(f.uGradient,0),e.uniform2f(f.uResolution,E,g),e.uniform1f(f.uTime,o.time),e.uniform1f(f.uPhase,Y),e.uniform1f(f.uIntensity,t.intensity),e.uniformMatrix3fv(f.uOrient,!1,N),e.uniform1i(f.uColorCount,t.colors.length),e.uniform1f(f.uDistort,t.distort),e.uniform2f(f.uOffset,Ie,Xe),e.uniform1f(f.uNoiseAmount,t.grain),e.uniform1i(f.uRayCount,t.rayCount),e.uniform1f(f.uZoom,t.zoom),e.uniform1f(f.uRayWidth,t.rayWidth),e.uniform1f(f.uTwist,t.twist),e.uniform1f(f.uFlow,o.flow),e.uniform1f(f.uCenterFade,t.centerFade*Math.max(1,t.zoom)),e.uniform4f(f.uPointer,o.smoothX*p,(y-o.smoothY)*p,t.mouseInteraction?.7*t.mouseStrength*U:0,.45),e.uniform4fv(f.uPulses,ue),e.uniform3f(f.uIntro,xt*(dt+.6)/.7,1.6*(1-o.intro),o.intro<1?1:0),e.uniform1f(f.uEncode,re),e.drawArrays(e.TRIANGLES,0,3),t.glow>0){let a=z;j.forEach(([s,T])=>{const C=G(s,ee);A(0,a.texture),e.uniform1i(C.uSource,0),e.uniform2f(C.uTarget,s.width,s.height),e.uniform2f(C.uTexel,1/a.width,1/a.height),e.uniform1f(C.uLimit,3*re),e.drawArrays(e.TRIANGLES,0,3);let F=G(T,H);A(0,s.texture),e.uniform1i(F.uSource,0),e.uniform2f(F.uTarget,T.width,T.height),e.uniform2f(F.uStep,1/s.width,0),e.drawArrays(e.TRIANGLES,0,3),F=G(s,H),A(0,T.texture),e.uniform1i(F.uSource,0),e.uniform2f(F.uTarget,s.width,s.height),e.uniform2f(F.uStep,0,1/T.height),e.drawArrays(e.TRIANGLES,0,3),a=s})}const b=G(null,te);A(0,z.texture),e.uniform1i(b.uScene,0),j.forEach(([a],s)=>{A(s+1,a.texture),e.uniform1i(b[`uBloom${s}`],s+1)}),e.uniform2f(b.uSceneSize,E,g),e.uniform2f(b.uView,r,i),e.uniform1f(b.uExact,le?1:0),e.uniform1f(b.uDecode,1/re),e.uniform1f(b.uBloom,t.glow),e.uniform1f(b.uFade,t.fade),e.uniform1f(b.uLightMode,t.lightMode?1:0),e.drawArrays(e.TRIANGLES,0,3);for(let a=Ne;a>=0;a--)A(a,null)},mt=t=>{t>1/40?(o.slow+=1,o.quick=0):t<1/55&&(o.quick+=1,o.slow=0),o.slow>20?(o.governor=Math.max(.5,o.governor*.85),o.slow=0):o.quick>180&&o.governor<1&&(o.governor=Math.min(1,o.governor*1.1),o.quick=0)},we=t=>{if(_=0,!Z||document.hidden)return;const r=P.current,i=M?Math.min(.05,(t-M)/1e3):1/60;M&&mt((t-M)/1e3),M=t,!r.intro||q?o.intro=1:o.intro<1&&(o.intro=Math.min(1,o.intro+i/wt));const h=3*Math.pow(1-o.intro,2),y=!r.paused&&!q;y&&(o.time+=i,o.phase+=i*r.speed*(1+h)+o.kick*i,o.flow+=i*r.flow*1.2),o.kick*=Math.exp(-i*3.5),o.kick<.001&&(o.kick=0);const R=r.mouseInteraction&&d.inside&&!q,E=.02+r.hoverDampness*.5,g=1-Math.exp(-i/E);if(R&&o.touch<.01&&(o.smoothX=d.x,o.smoothY=d.y),o.smoothX+=(d.x-o.smoothX)*g,o.smoothY+=(d.y-o.smoothY)*g,o.touch+=((R?1:0)-o.touch)*(1-Math.exp(-i*(R?5:2.5))),r.animation===2&&d.inside){const p=Math.max(1,v.clientWidth),U=Math.max(1,v.clientHeight);o.hoverX+=(S(d.x/p,0,1)-o.hoverX)*g,o.hoverY+=(S(d.y/U,0,1)-o.hoverY)*g}for(let p=w.length-1;p>=0;p--)w[p].age+=i,w[p].age>ze&&w.splice(p,1);se();const le=o.intro<1||w.length>0||o.kick>0||Math.abs((R?1:0)-o.touch)>.002||Math.abs(d.x-o.smoothX)+Math.abs(d.y-o.smoothY)>.2;y&&(r.speed!==0||r.grain>0||r.flow!==0)||le?_=requestAnimationFrame(we):M=0},L=()=>{!_&&Z&&!document.hidden&&(_=requestAnimationFrame(we))},ce=()=>{const t=P.current,r=Math.max(1,v.clientWidth),i=Math.max(1,v.clientHeight),h=Math.min(t.dpr||window.devicePixelRatio||1,2);x.width=Math.max(1,Math.round(r*h)),x.height=Math.max(1,Math.round(i*h)),_||se(),L()},ye=t=>{const r=v.getBoundingClientRect(),i=t.clientX-r.left,h=t.clientY-r.top;return{x:i,y:h,inside:i>=0&&h>=0&&i<=r.width&&h<=r.height}},Re=t=>{const r=ye(t);d.x=r.x,d.y=r.y,d.inside=r.inside,L()},be=t=>{const r=ye(t);if(!r.inside)return;d.x=r.x,d.y=r.y,d.inside=!0;const i=P.current;i.mouseInteraction&&i.clickBurst&&!q&&(w.length>=ke&&w.shift(),w.push({age:0}),o.kick=Math.min(5,o.kick+2.4)),L()},Pe=()=>{d.inside=!1,L()},Me=()=>{M=0,L()},Se=new ResizeObserver(ce);Se.observe(v);const Ae=new IntersectionObserver(t=>{Z=t.some(r=>r.isIntersecting),Z&&(M=0,L())});Ae.observe(v),window.addEventListener("pointermove",Re,{passive:!0}),window.addEventListener("pointerdown",be,{passive:!0}),document.documentElement.addEventListener("pointerleave",Pe),document.addEventListener("visibilitychange",Me),ce();let _e=P.current.dpr;return O.current=()=>{const t=P.current;if(t.dpr!==_e){_e=t.dpr,ce();return}_||se(),L()},()=>{var t;cancelAnimationFrame(_),O.current=null,x.removeEventListener("webglcontextlost",ge),x.removeEventListener("webglcontextrestored",pe),Se.disconnect(),Ae.disconnect(),window.removeEventListener("pointermove",Re),window.removeEventListener("pointerdown",be),document.documentElement.removeEventListener("pointerleave",Pe),document.removeEventListener("visibilitychange",Me),[z,...j.flat()].forEach(r=>{r.texture&&e.deleteTexture(r.texture),e.deleteFramebuffer(r.framebuffer)}),e.deleteTexture(ae),[J,ee,H,te].forEach(r=>e.deleteProgram(r.program)),e.deleteBuffer(Ee),e.deleteVertexArray(oe),e.isContextLost()||(t=e.getExtension("WEBGL_lose_context"))==null||t.loseContext()}},[ut]),D.useEffect(()=>{var v;(v=O.current)==null||v.call(O)}),Ue.jsx("div",{ref:de,className:`prismatic-burst-container${he?` ${he}`:""}`,style:at,children:Ue.jsx("canvas",{ref:xe,className:"prismatic-burst-canvas",style:Q&&Q!=="none"?{mixBlendMode:Q}:void 0,"aria-hidden":"true"})})};export{bt as default};
