import{a as y,j as ae}from"./index-DrbxZl7q.js";const Ue=`#version 300 es
precision highp float;
in vec2 aPoint;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uFrame;
uniform float uAmplitude;
uniform float uDistance;
uniform vec2 uMouse;
uniform float uCount;
uniform float uThickness;
uniform float uSoftness;
uniform float uWaves;
uniform float uSplit;
uniform float uFray;
uniform float uSeed;
uniform vec2 uTurn;
uniform vec4 uPart;
uniform float uTaper;
out float vEdge;
out float vBand;
out float vDraw;
out float vAlpha;
out float vIndex;

float Perlin2D(vec2 P) {
  vec2 Pi = floor(P);
  vec4 Pf_Pfmin1 = P.xyxy - vec4(Pi, Pi + 1.0);
  vec4 Pt = vec4(Pi.xy, Pi.xy + 1.0);
  Pt = Pt - floor(Pt * (1.0 / 71.0)) * 71.0;
  Pt += vec2(26.0, 161.0).xyxy;
  Pt *= Pt;
  Pt = Pt.xzxz * Pt.yyww;
  vec4 hash_x = fract(Pt * (1.0 / 951.135664));
  vec4 hash_y = fract(Pt * (1.0 / 642.949883));
  vec4 grad_x = hash_x - 0.49999;
  vec4 grad_y = hash_y - 0.49999;
  vec4 grad_results = inversesqrt(grad_x * grad_x + grad_y * grad_y) * (grad_x * Pf_Pfmin1.xzxz + grad_y * Pf_Pfmin1.yyww);
  grad_results *= 1.4142135623730950;
  vec2 blend = Pf_Pfmin1.xy * Pf_Pfmin1.xy * Pf_Pfmin1.xy * (Pf_Pfmin1.xy * (Pf_Pfmin1.xy * 6.0 - 15.0) + 10.0);
  vec4 blend2 = vec4(blend, vec2(1.0 - blend));
  return dot(grad_results, blend2.zxzx * blend2.wwyy);
}

void main() {
  float perc = float(gl_InstanceID) / uCount;
  float x = aPoint.x;
  float pixel = 1.0 / max(uResolution.x, uResolution.y);
  float splitPoint = uSplit + perc * uFray;
  float amplitudeNormal = smoothstep(splitPoint, max(0.7, splitPoint + 0.2), x);
  float finalAmplitude = amplitudeNormal * 0.5 * uAmplitude * (1.0 + (uMouse.y - 0.5) * 0.2);
  float timeScaled = uTime / 10.0 + (uMouse.x - 0.5);
  float blur = smoothstep(splitPoint, splitPoint + 0.05, x) * perc;
  float xnoise = mix(
    Perlin2D(vec2(timeScaled * 2.5 + uSeed, (x * uWaves + perc) * 2.5)),
    Perlin2D(vec2(timeScaled * 3.5 + uSeed, (x * uWaves + timeScaled) * 3.5)) / 1.5,
    x * 0.3
  );
  float y = 0.5 + (perc - 0.5) * uDistance + xnoise / 2.0 * finalAmplitude;
  vec2 local = vec2((x - 0.5) * uFrame.x, (y - 0.5) * uFrame.y);
  if (uPart.z > 0.0) {
    vec2 delta = local - uPart.xy;
    float reach = uPart.w;
    float pull = exp(-dot(delta, delta) / (reach * reach));
    local.y += delta.y * pull * uPart.z;
  }
  float width = 7.0 * uThickness * pixel * (1.0 - perc);
  float band = (width / 2.0 + 10.0 * uSoftness * pixel * blur) * uFrame.y;
  float draw = max(band, 1.0);
  local.y += aPoint.y * draw;
  vec2 turned = vec2(local.x * uTurn.x - local.y * uTurn.y, local.x * uTurn.y + local.y * uTurn.x);
  gl_Position = vec4(turned / (uResolution * 0.5), 0.0, 1.0);
  vEdge = aPoint.y * draw;
  vBand = band;
  vDraw = draw;
  vAlpha = 1.0 - smoothstep(0.0, 1.0, pow(perc, 0.3)) * uTaper;
  vIndex = perc;
}`,Ce=`#version 300 es
precision highp float;
in float vEdge;
in float vBand;
in float vDraw;
in float vAlpha;
in float vIndex;
uniform vec3 uColor;
uniform vec3 uAccent;
out vec4 outColor;
void main() {
  float coverage = (1.0 - smoothstep(0.0, vDraw, abs(vEdge))) * (vBand / vDraw) * vAlpha;
  outColor = vec4(mix(uColor, uAccent, vIndex) * coverage, coverage);
}`,Le=`#version 300 es
in vec2 aPosition;
out vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,Be=`#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uLines;
uniform vec2 uResolution;
uniform float uFade;
uniform float uOpacity;
uniform float uCurve;
out vec4 outColor;

float smootherstep(float edge, float x) {
  float t = clamp(x / edge, 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

void main() {
  vec4 lines = texture(uLines, vUv);
  float alpha = lines.a;
  vec3 color = alpha > 0.0001 ? lines.rgb / alpha : vec3(0.0);
  float mask = uOpacity;
  if (uFade > 0.0) {
    vec2 px = vUv * uResolution;
    float edge = uFade * min(uResolution.x, uResolution.y) * 0.5;
    mask *= smootherstep(edge, px.x) * smootherstep(edge, uResolution.x - px.x);
    mask *= smootherstep(edge, px.y) * smootherstep(edge, uResolution.y - px.y);
  }
  outColor = vec4(color * pow(alpha, uCurve), alpha) * mask;
}`,ie=1920,d=(n,l,m)=>Math.min(m,Math.max(l,n)),se=(n,l,m)=>{const c=n.createShader(l);return c?(n.shaderSource(c,m),n.compileShader(c),n.getShaderParameter(c,n.COMPILE_STATUS)?c:(n.deleteShader(c),null)):null},ue=(n,l,m)=>{const c=se(n,n.VERTEX_SHADER,l),v=se(n,n.FRAGMENT_SHADER,m),h=n.createProgram();return!c||!v||!h?null:(n.attachShader(h,c),n.attachShader(h,v),n.linkProgram(h),n.deleteShader(c),n.deleteShader(v),n.getProgramParameter(h,n.LINK_STATUS)?h:(n.deleteProgram(h),null))},ce=(n,l,m)=>{const c={};for(const v of m)c[v]=n.getUniformLocation(l,v);return c},Ne=({color:n=[1,1,1],accentColor:l,amplitude:m=1.7,distance:c=.4,enableMouseInteraction:v=!1,lineCount:h=90,thickness:le=.6,softness:fe=1.3,speed:de=.6,waves:me=1.05,split:he=.04,fray:pe=.5,angle:ve=25,seed:xe=0,parting:Ee=0,taper:Pe=.85,brightness:Re=1.4,fade:ye=0,opacity:ge=1,paused:Ae=!1,...Te})=>{const O=y.useRef(null),X=y.useRef(null),g=y.useRef(null),be=`${Array.isArray(n)?n.join(","):String(n)}|${Array.isArray(l)?l.join(","):String(l??"")}`,V={color:n,accentColor:l,colorKey:be,amplitude:m,distance:c,enableMouseInteraction:v,lineCount:d(Math.round(h),1,400),thickness:Math.max(0,le),softness:Math.max(0,fe),speed:de,waves:Math.max(0,me),split:d(he,0,1),fray:d(pe,0,1),angle:ve,seed:xe,parting:d(Ee,0,1),taper:d(Pe,0,1),brightness:d(Re,.25,2),fade:d(ye,0,1),opacity:d(ge,0,1),paused:Ae},w=y.useRef(V);w.current=V,y.useEffect(()=>{var Z;const p=O.current,f=X.current,e=f==null?void 0:f.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!p||!f||!e)return;const A=ue(e,Ue,Ce),T=ue(e,Le,Be);if(!A||!T)return;const i=ce(e,A,["uTime","uResolution","uFrame","uAmplitude","uDistance","uMouse","uCount","uThickness","uSoftness","uWaves","uSplit","uFray","uSeed","uTurn","uPart","uTaper","uColor","uAccent"]),b=ce(e,T,["uLines","uResolution","uFade","uOpacity","uCurve"]),S=e.createVertexArray(),D=e.createBuffer();e.bindVertexArray(S),e.bindBuffer(e.ARRAY_BUFFER,D);const z=e.getAttribLocation(A,"aPoint");e.enableVertexAttribArray(z),e.vertexAttribPointer(z,2,e.FLOAT,!1,0,0);const U=e.createVertexArray(),G=e.createBuffer();e.bindVertexArray(U),e.bindBuffer(e.ARRAY_BUFFER,G),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW);const W=e.getAttribLocation(T,"aPosition");e.enableVertexAttribArray(W),e.vertexAttribPointer(W,2,e.FLOAT,!1,0,0),e.bindVertexArray(null);const _=e.createTexture(),C=e.createFramebuffer();e.bindTexture(e.TEXTURE_2D,_),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);const L=document.createElement("canvas");L.width=1,L.height=1;const E=L.getContext("2d",{willReadFrequently:!0}),Me=((Z=window.matchMedia)==null?void 0:Z.call(window,"(prefers-reduced-motion: reduce)").matches)??!1,t={time:0,width:1,height:1,segments:0,colorKey:"",color:[1,1,1],accent:[1,1,1],mouse:[.5,.5],targetMouse:[.5,.5],pointer:[0,0],targetPointer:[0,0],presence:0,inside:!1};let P=0,R=0,F=!0,B=!0;const Y=r=>{if(Array.isArray(r))return[0,1,2].map(u=>d(Number(r[u]??1),0,1));if(!E)return[1,1,1];E.clearRect(0,0,1,1),E.fillStyle="#ffffff",E.fillStyle=String(r),E.fillRect(0,0,1,1);const[o,a,s]=E.getImageData(0,0,1,1).data;return[o/255,a/255,s/255]},Fe=r=>{r.colorKey!==t.colorKey&&(t.colorKey=r.colorKey,t.color=Y(r.color),t.accent=r.accentColor===void 0||r.accentColor===null?t.color:Y(r.accentColor))},we=r=>{if(r===t.segments)return;t.segments=r;const o=new Float32Array((r+1)*4);for(let a=0;a<=r;a++){const s=a/r;o.set([s,-1,s,1],a*4)}e.bindBuffer(e.ARRAY_BUFFER,D),e.bufferData(e.ARRAY_BUFFER,o,e.STATIC_DRAW)},K=()=>{const r=Math.max(1,p.clientWidth),o=Math.max(1,p.clientHeight),a=Math.min(window.devicePixelRatio||1,2),s=Math.max(r,o)*a,u=s>ie?a*ie/s:a;f.width=Math.max(1,Math.round(r*u)),f.height=Math.max(1,Math.round(o*u)),t.width=r,t.height=o,e.bindTexture(e.TEXTURE_2D,_),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,f.width,f.height,0,e.RGBA,e.UNSIGNED_BYTE,null),e.bindFramebuffer(e.FRAMEBUFFER,C),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,_,0),e.bindFramebuffer(e.FRAMEBUFFER,null),we(d(Math.round(r/3),96,640)),I()},I=()=>{const r=w.current;Fe(r);const o=f.width,a=f.height,s=r.angle*Math.PI/180,u=Math.cos(s),x=Math.sin(s),N=Math.abs(o*u)+Math.abs(a*x),Se=Math.abs(o*x)+Math.abs(a*u),ee=o/t.width,te=r.enableMouseInteraction?t.mouse:[.5,.5],De=r.parting*t.presence*2,re=t.pointer[0]*ee,oe=t.pointer[1]*ee,ne=[re*u+oe*x,-re*x+oe*u];e.bindFramebuffer(e.FRAMEBUFFER,C),e.viewport(0,0,o,a),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.enable(e.BLEND),e.blendFunc(e.ONE,e.ONE_MINUS_SRC_ALPHA),e.useProgram(A),e.uniform1f(i.uTime,t.time),e.uniform2f(i.uResolution,o,a),e.uniform2f(i.uFrame,N,Se),e.uniform1f(i.uAmplitude,r.amplitude),e.uniform1f(i.uDistance,r.distance),e.uniform2f(i.uMouse,te[0],te[1]),e.uniform1f(i.uCount,r.lineCount),e.uniform1f(i.uThickness,r.thickness),e.uniform1f(i.uSoftness,r.softness),e.uniform1f(i.uWaves,r.waves),e.uniform1f(i.uSplit,r.split),e.uniform1f(i.uFray,r.fray),e.uniform1f(i.uSeed,r.seed*13.37),e.uniform2f(i.uTurn,u,x),e.uniform4f(i.uPart,ne[0],ne[1],De,Math.min(o,a)*.16),e.uniform1f(i.uTaper,r.taper),e.uniform3f(i.uColor,t.color[0],t.color[1],t.color[2]),e.uniform3f(i.uAccent,t.accent[0],t.accent[1],t.accent[2]),e.bindVertexArray(S),e.drawArraysInstanced(e.TRIANGLE_STRIP,0,(t.segments+1)*2,r.lineCount),e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,o,a),e.disable(e.BLEND),e.clear(e.COLOR_BUFFER_BIT),e.useProgram(T),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,_),e.uniform1i(b.uLines,0),e.uniform2f(b.uResolution,o,a),e.uniform1f(b.uFade,r.fade),e.uniform1f(b.uOpacity,r.opacity),e.uniform1f(b.uCurve,2/r.brightness),e.bindVertexArray(U),e.drawArrays(e.TRIANGLES,0,3),e.bindVertexArray(null)},j=r=>{if(P=0,!B||!F||document.hidden)return;const o=w.current,a=R?Math.min(.05,(r-R)/1e3):1/60;R=r;const s=!o.paused&&!Me;s&&(t.time+=a*o.speed);const u=1-Math.exp(-a*3);t.mouse[0]+=(t.targetMouse[0]-t.mouse[0])*u,t.mouse[1]+=(t.targetMouse[1]-t.mouse[1])*u;const x=1-Math.exp(-a*10);t.pointer[0]+=(t.targetPointer[0]-t.pointer[0])*x,t.pointer[1]+=(t.targetPointer[1]-t.pointer[1])*x,t.presence+=((t.inside&&o.parting>0?1:0)-t.presence)*(1-Math.exp(-a*4)),I();const N=Math.abs(t.targetMouse[0]-t.mouse[0])>5e-4||Math.abs(t.targetMouse[1]-t.mouse[1])>5e-4||Math.abs(t.targetPointer[0]-t.pointer[0])>.05||Math.abs(t.targetPointer[1]-t.pointer[1])>.05||Math.abs((t.inside&&o.parting>0?1:0)-t.presence)>.002;s||N?P=requestAnimationFrame(j):R=0},M=()=>{!P&&B&&F&&!document.hidden&&(P=requestAnimationFrame(j))},H=r=>{const o=p.getBoundingClientRect(),a=(r.clientX-o.left)/Math.max(1,o.width),s=(r.clientY-o.top)/Math.max(1,o.height),u=a>=0&&a<=1&&s>=0&&s<=1;u?(t.targetMouse=[a,1-s],t.targetPointer=[r.clientX-o.left-o.width/2,o.height/2-(r.clientY-o.top)],!t.inside&&t.presence<.01&&(t.pointer=[...t.targetPointer])):t.inside&&(t.targetMouse=[.5,.5]),t.inside=u,M()},q=()=>{t.inside=!1,t.targetMouse=[.5,.5],M()},$=()=>{R=0,M()},J=new ResizeObserver(K);J.observe(p);const Q=new IntersectionObserver(r=>{F=r.some(o=>o.isIntersecting),F&&(R=0,M())});return Q.observe(p),window.addEventListener("pointermove",H,{passive:!0}),document.documentElement.addEventListener("pointerleave",q),document.addEventListener("visibilitychange",$),K(),g.current=()=>{P||I(),M()},()=>{B=!1,cancelAnimationFrame(P),g.current=null,J.disconnect(),Q.disconnect(),window.removeEventListener("pointermove",H),document.documentElement.removeEventListener("pointerleave",q),document.removeEventListener("visibilitychange",$),e.deleteFramebuffer(C),e.deleteTexture(_),e.deleteBuffer(D),e.deleteBuffer(G),e.deleteVertexArray(S),e.deleteVertexArray(U),e.deleteProgram(A),e.deleteProgram(T)}},[]),y.useEffect(()=>{var p;(p=g.current)==null||p.call(g)});const{className:k="",..._e}=Te;return ae.jsx("div",{ref:O,className:`threads-container${k?` ${k}`:""}`,..._e,children:ae.jsx("canvas",{ref:X,className:"threads-canvas","aria-hidden":"true"})})};export{Ne as default};
