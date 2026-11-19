import{a as B,j as pe}from"./index-DrbxZl7q.js";const Oe=1.1,D=3.2,Fe=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,Ie=`#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform float uTime;
uniform float uRotation;
uniform vec2 uReach;
uniform float uNear;
uniform float uAwake;
uniform vec3 uBackground;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uScale;
uniform float uWobble;
uniform float uGlow;
uniform float uBleed;
uniform float uHighlight;
uniform float uSwirl;
uniform float uOrbit;
uniform vec2 uEcho;
uniform float uReveal;
uniform float uOpacity;
uniform float uTrail;
uniform vec2 uTilt;
out vec4 outColor;

vec3 hash33(vec3 p3) {
  p3 = fract(p3 * vec3(0.1031, 0.11369, 0.13787));
  p3 += dot(p3, p3.yxz + 19.19);
  return -1.0 + 2.0 * fract(vec3(p3.x + p3.y, p3.x + p3.z, p3.y + p3.z) * p3.zyx);
}

float snoise3(vec3 p) {
  const float K1 = 0.333333333;
  const float K2 = 0.166666667;
  vec3 i = floor(p + (p.x + p.y + p.z) * K1);
  vec3 d0 = p - (i - (i.x + i.y + i.z) * K2);
  vec3 e = step(vec3(0.0), d0 - d0.yzx);
  vec3 i1 = e * (1.0 - e.zxy);
  vec3 i2 = 1.0 - e.zxy * (1.0 - e);
  vec3 d1 = d0 - (i1 - K2);
  vec3 d2 = d0 - (i2 - K1);
  vec3 d3 = d0 - 0.5;
  vec4 h = max(0.6 - vec4(dot(d0, d0), dot(d1, d1), dot(d2, d2), dot(d3, d3)), 0.0);
  vec4 n = h * h * h * h * vec4(dot(d0, hash33(i)), dot(d1, hash33(i + i1)), dot(d2, hash33(i + i2)), dot(d3, hash33(i + 1.0)));
  return dot(vec4(31.316), n);
}

float light1(float intensity, float attenuation, float dist) {
  return intensity / (1.0 + dist * attenuation);
}

float light2(float intensity, float attenuation, float dist) {
  return intensity / (1.0 + dist * dist * attenuation);
}

vec4 draw(vec2 uv) {
  float rawLen = length(uv);
  vec2 dir = rawLen > 0.0001 ? uv / rawLen : vec2(1.0, 0.0);
  float reachAmount = length(uReach);
  vec2 reachDir = reachAmount > 0.00001 ? uReach / reachAmount : vec2(1.0, 0.0);
  float facing = exp((dot(dir, reachDir) - 1.0) * 3.2);
  float len = max(rawLen - reachAmount * facing * smoothstep(0.25, 0.65, rawLen), 0.0);
  uv = dir * len;
  float ang = atan(dir.y, dir.x);
  float invLen = len > 0.0 ? 1.0 / len : 0.0;
  float near = facing * uNear;
  float bgLuminance = dot(uBackground, vec3(0.299, 0.587, 0.114));

  float n0 = snoise3(vec3(uv * 0.65, uTime * 0.5)) * 0.5 + 0.5;
  float r0 = mix(0.8 - 0.04 * uWobble, 0.8 + 0.04 * uWobble, n0);
  float d0 = distance(uv, (r0 * invLen) * uv);
  float v0 = light1(1.0, 10.0 / uGlow, d0);
  v0 *= smoothstep(r0 * 1.05, r0, len);
  float reach = max(uBleed, 0.04);
  float innerFade = smoothstep(r0 * (1.0 - 0.2 * reach), r0 * (1.0 - 0.05 * reach), len);
  v0 *= mix(innerFade, 1.0, bgLuminance * 0.7 * min(uBleed, 1.0));
  float body = smoothstep(0.8 - 0.2 * reach, 0.8, len);
  float cl = cos(ang + uSwirl) * 0.5 + 0.5;

  vec2 pos = vec2(cos(uOrbit), sin(uOrbit)) * r0;
  float d = distance(uv, pos);
  vec2 head = vec2(cos(uOrbit), sin(uOrbit));
  float lag = atan(head.x * dir.y - head.y * dir.x, dot(dir, head));
  float trail = uTrail > 0.0 ? smoothstep(0.0, 0.35, lag) * exp(-max(lag, 0.0) * 2.6 / uTrail) : 0.0;
  float v1 = (light2(1.5, 5.0, d) + trail * 0.6) * uHighlight;
  v1 *= light1(1.0, 50.0, d0);
  float band = v0 * smoothstep(1.0, mix(0.6, 1.0, n0 * 0.5), len) * body;
  float heat = pow(clamp(band / 0.82, 0.0, 1.0), 3.0);
  float bloom = light2(1.0, 160.0 / uGlow, max(len - r0, 0.0)) * smoothstep(0.4, 0.0, len - r0) * step(r0, len);

  float v2 = smoothstep(1.0, mix(0.6, 1.0, n0 * 0.5), len);
  float v3 = body;

  vec3 colBase = mix(uColor1, uColor2, cl);
  float fadeAmount = mix(1.0, 0.1, bgLuminance);

  float echoD = abs(len - r0 - uEcho.x);
  float echo = light1(1.0, 60.0, echoD) * smoothstep(0.12, 0.0, echoD) * uEcho.y;

  vec3 darkCol = mix(uColor3, colBase, v0);
  darkCol = (darkCol + v1) * v2 * v3 * (1.0 + uAwake + near * 0.35) + mix(colBase, vec3(1.0), 0.25) * heat * (0.28 + near * 0.3);
  darkCol = clamp(darkCol + colBase * (bloom * 0.1 + echo), 0.0, 1.0);

  vec3 lightCol = (colBase + v1) * mix(1.0, v2 * v3, fadeAmount);
  lightCol = mix(uBackground, lightCol, clamp(v0 + echo, 0.0, 1.0));
  lightCol = mix(lightCol, colBase, clamp(v0, 0.0, 1.0) * clamp(near * 0.4 + uAwake, 0.0, 0.6));
  lightCol = clamp(mix(lightCol, vec3(1.0), clamp(v1 * 0.35, 0.0, 0.6)), 0.0, 1.0);

  vec3 finalCol = mix(darkCol, lightCol, bgLuminance);
  float alpha = max(max(finalCol.r, finalCol.g), finalCol.b);
  return vec4(finalCol / (alpha + 1e-5), alpha);
}

vec2 toPlane(vec2 p, out float hit) {
  float cx = cos(uTilt.x);
  float sx = sin(uTilt.x);
  float cy = cos(uTilt.y);
  float sy = sin(uTilt.y);
  vec3 ex = vec3(cy, 0.0, -sy);
  vec3 ey = vec3(sy * sx, cx, cy * sx);
  vec3 normal = vec3(sy * cx, -sx, cy * cx);
  vec3 origin = vec3(0.0, 0.0, ${D.toFixed(1)});
  vec3 ray = vec3(p, -${D.toFixed(1)});
  float denom = dot(normal, ray);
  float t = -dot(normal, origin) / (abs(denom) > 0.00001 ? denom : -0.00001);
  hit = t > 0.0 ? 1.0 : 0.0;
  vec3 q = origin + ray * t;
  return vec2(dot(q, ex), dot(q, ey));
}

void main() {
  vec2 uv = (gl_FragCoord.xy - uResolution * 0.5) / min(uResolution.x, uResolution.y) * 2.0;
  uv *= uScale;
  float hit = 1.0;
  if (abs(uTilt.x) + abs(uTilt.y) > 0.0001) uv = toPlane(uv, hit);

  float s = sin(uRotation);
  float c = cos(uRotation);
  uv = vec2(c * uv.x - s * uv.y, s * uv.x + c * uv.y);

  vec4 col = draw(uv);
  float dither = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
  float alpha = clamp(col.a * hit * uReveal * uOpacity + dither, 0.0, 1.0);
  outColor = vec4(col.rgb * alpha * alpha, alpha);
}`,R=(a,g,y)=>Math.min(y,Math.max(g,a)),xe=(a,g,y)=>{const c=a.createShader(g);return c?(a.shaderSource(c,y),a.compileShader(c),a.getShaderParameter(c,a.COMPILE_STATUS)?c:(a.deleteShader(c),null)):null},ze=a=>{const g=xe(a,a.VERTEX_SHADER,Fe),y=xe(a,a.FRAGMENT_SHADER,Ie),c=a.createProgram();if(!g||!y||!c)return null;if(a.attachShader(c,g),a.attachShader(c,y),a.bindAttribLocation(c,0,"aPosition"),a.linkProgram(c),a.deleteShader(g),a.deleteShader(y),!a.getProgramParameter(c,a.LINK_STATUS))return a.deleteProgram(c),null;const N={},j=a.getProgramParameter(c,a.ACTIVE_UNIFORMS);for(let O=0;O<j;O++){const F=a.getActiveUniform(c,O);F&&(N[F.name]=a.getUniformLocation(c,F.name))}return{program:c,uniforms:N}},Ye=({colors:a=["#9c43fe","#4cc2e9","#101499"],hue:g=0,backgroundColor:y="#000000",size:c=1,glow:N=1,bleed:j=1,wobble:O=1,highlight:F=1,trail:ge=1,tiltX:ye=0,tiltY:be=0,speed:we=1,hoverIntensity:Me=1,rotateOnHover:Re=!0,forceHoverState:Ce=!1,followCursor:Se=!0,clickPulse:Ae=!0,intro:Ee=!0,opacity:Le=1,paused:Te=!1,dpr:Pe,className:Z="",style:ke})=>{const ee=B.useRef(null),te=B.useRef(null),I=B.useRef(null),q=Array.isArray(a)?a:[],oe={colors:[q[0]??"#9c43fe",q[1]??q[0]??"#4cc2e9",q[2]??"#101499"].map(String),hue:g,backgroundColor:String(y),size:R(c,.1,3),glow:R(N,.1,5),bleed:R(j,0,4),wobble:Math.max(0,O),highlight:Math.max(0,F),trail:Math.max(0,ge),tiltX:R(ye,-70,70),tiltY:R(be,-70,70),speed:we,hoverIntensity:Math.max(0,Me),rotateOnHover:Re,forceHoverState:Ce,followCursor:Se,clickPulse:Ae,intro:Ee,opacity:R(Le,0,1),paused:Te,dpr:Pe},m=B.useRef(oe);return m.current=oe,B.useEffect(()=>{var ve;const b=ee.current,v=te.current,o=v==null?void 0:v.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!b||!v||!o)return;const H=ze(o);if(!H)return;const i=H.uniforms,ne=o.createBuffer(),$=o.createVertexArray();o.bindVertexArray($),o.bindBuffer(o.ARRAY_BUFFER,ne),o.bufferData(o.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),o.STATIC_DRAW),o.enableVertexAttribArray(0),o.vertexAttribPointer(0,2,o.FLOAT,!1,0,0);const E=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),z=((ve=window.matchMedia)==null?void 0:ve.call(window,"(prefers-reduced-motion: reduce)").matches)??!1,J=new Map,re=t=>{if(J.has(t))return J.get(t);let n=[0,0,0];if(E){E.clearRect(0,0,1,1),E.fillStyle="#000000",E.fillStyle=t,E.fillRect(0,0,1,1);const[r,l,h,s]=E.getImageData(0,0,1,1).data;n=s?[r/255,l/255,h/255]:[0,0,0]}return J.set(t,n),n},Be=(t,n)=>{if(!n)return t;const r=n*Math.PI/180,l=Math.cos(r),h=Math.sin(r),[s,u,f]=t,p=.299*s+.587*u+.114*f,C=.596*s-.274*u-.322*f,A=.211*s-.523*u+.312*f,w=C*l-A*h,x=C*h+A*l;return[p+.956*w+.621*x,p-.272*w-.647*x,p-1.106*w+1.703*x]},L={width:1,height:1},d={x:0,y:0,inside:!1},e={time:0,swirl:0,orbit:0,echo:1,rotation:0,hover:0,near:0,reachX:0,reachY:0,reachSpeedX:0,reachSpeedY:0,pulse:0,pulseSpeed:0,kick:m.current.intro&&!z?2.5:0,reveal:m.current.intro&&!z?0:1};let T=0,P=0,V=!0;const ae=(t,n)=>{const r=m.current,l=Math.min(L.width,L.height),h=1/(r.size*(1+e.pulse));let s=(t-L.width/2)/l*2*h,u=(L.height/2-n)/l*2*h;if(r.tiltX||r.tiltY){const C=-r.tiltX*Math.PI/180,A=r.tiltY*Math.PI/180,[w,x,X,Y]=[Math.cos(C),Math.sin(C),Math.cos(A),Math.sin(A)],S=[Y*w,-x,X*w],M=[s,u,-D],K=S[0]*M[0]+S[1]*M[1]+S[2]*M[2],W=-(S[2]*D)/(Math.abs(K)>1e-5?K:-1e-5);if(W<=0)return[99,99];const _=[M[0]*W,M[1]*W,D+M[2]*W];s=_[0]*X-_[2]*Y,u=_[0]*Y*x+_[1]*w+_[2]*X*x}const f=Math.sin(e.rotation),p=Math.cos(e.rotation);return[p*s-f*u,f*s+p*u]},G=()=>{const t=m.current,[n,r,l]=t.colors.map(f=>Be(re(f),t.hue)),h=e.reveal,s=h-1,u=1+2.2*s*s*s+1.2*s*s;o.viewport(0,0,v.width,v.height),o.useProgram(H.program),o.bindVertexArray($),o.uniform2f(i.uResolution,v.width,v.height),o.uniform1f(i.uTime,e.time),o.uniform2f(i.uReach,e.reachX,e.reachY),o.uniform1f(i.uNear,e.near),o.uniform1f(i.uAwake,e.hover*t.hoverIntensity*.18),o.uniform1f(i.uRotation,e.rotation),o.uniform3fv(i.uBackground,re(t.backgroundColor)),o.uniform3fv(i.uColor1,n),o.uniform3fv(i.uColor2,r),o.uniform3fv(i.uColor3,l),o.uniform1f(i.uScale,1/(t.size*(1+e.pulse)*(.62+.38*u))),o.uniform1f(i.uWobble,t.wobble),o.uniform1f(i.uGlow,t.glow),o.uniform1f(i.uBleed,t.bleed),o.uniform1f(i.uHighlight,t.highlight),o.uniform2f(i.uEcho,e.echo*.55,e.echo<1?(1-e.echo)*(1-e.echo):0),o.uniform1f(i.uSwirl,e.swirl),o.uniform1f(i.uOrbit,e.orbit),o.uniform1f(i.uReveal,Math.min(1,h/.55)*Math.min(1,h/.55)*(3-2*Math.min(1,h/.55))),o.uniform1f(i.uOpacity,t.opacity),o.uniform1f(i.uTrail,t.trail),o.uniform2f(i.uTilt,-t.tiltX*Math.PI/180,t.tiltY*Math.PI/180),o.drawArrays(o.TRIANGLES,0,3)},ie=t=>{if(T=0,!V||document.hidden)return;const n=m.current,r=P?R((t-P)/1e3,5e-4,.05):1/60;if(P=t,n.paused){e.reveal=1,G(),P=0;return}const l=z?0:1,[h,s]=ae(d.x,d.y),u=Math.hypot(h,s),f=d.inside&&l?R((1.45-u)/.4,0,1):0,p=f*f*(3-2*f),C=p*R((u-.15)/.45,0,1),A=p>.5,w=n.forceHoverState?1:p;e.hover+=(w-e.hover)*(1-Math.exp(-r/.16));const x=.075*n.hoverIntensity*C,X=u>1e-4?h/u*x:0,Y=u>1e-4?s/u*x:0;e.reachSpeedX+=(70*(X-e.reachX)-7*e.reachSpeedX)*r,e.reachSpeedY+=(70*(Y-e.reachY)-7*e.reachSpeedY)*r,e.reachX+=e.reachSpeedX*r,e.reachY+=e.reachSpeedY*r,e.near+=(C*n.hoverIntensity-e.near)*(1-Math.exp(-r/.12));const S=r*n.speed*l;e.time+=S,e.swirl+=S*2*(1+e.kick),e.echo=Math.min(1,e.echo+r/1.2),n.rotateOnHover&&(e.rotation+=r*.3*e.hover*l);const M=Math.atan2(s,h);if(n.followCursor&&A&&l){const K=Math.atan2(Math.sin(M-e.orbit),Math.cos(M-e.orbit));e.orbit+=K*(1-Math.exp(-r*6))}else e.orbit-=S;e.orbit=Math.atan2(Math.sin(e.orbit),Math.cos(e.orbit)),e.pulseSpeed+=(-170*e.pulse-11*e.pulseSpeed)*r,e.pulse+=e.pulseSpeed*r,e.kick*=Math.exp(-r*2.5),!n.intro||z?e.reveal=1:e.reveal<1&&(e.reveal=Math.min(1,e.reveal+r/Oe)),G(),T=requestAnimationFrame(ie)},k=()=>{!T&&V&&!document.hidden&&(T=requestAnimationFrame(ie))},Q=()=>{const t=m.current,n=Math.max(1,b.clientWidth),r=Math.max(1,b.clientHeight),l=Math.min(t.dpr||window.devicePixelRatio||1,2);L.width=n,L.height=r,v.width=Math.max(1,Math.round(n*l)),v.height=Math.max(1,Math.round(r*l)),G(),k()},ce=t=>{const n=b.getBoundingClientRect();d.x=t.clientX-n.left,d.y=t.clientY-n.top,d.inside=d.x>=0&&d.y>=0&&d.x<=n.width&&d.y<=n.height},se=t=>{ce(t),m.current.paused||k()},le=t=>{const n=m.current;if(ce(t),!d.inside||!n.clickPulse||n.paused||z)return;const[r,l]=ae(d.x,d.y);Math.hypot(r,l)>1||(e.pulseSpeed+=.9,e.kick=2.2,e.echo=0,k())},U=t=>{t.pointerType!=="mouse"&&(d.inside=!1)},ue=()=>{d.inside=!1},he=()=>{P=0,k()},de=new ResizeObserver(Q);de.observe(b);const fe=new IntersectionObserver(t=>{V=t.some(n=>n.isIntersecting),V&&(P=0,k())});fe.observe(b),window.addEventListener("pointermove",se,{passive:!0}),window.addEventListener("pointerdown",le,{passive:!0}),window.addEventListener("pointerup",U,{passive:!0}),window.addEventListener("pointercancel",U,{passive:!0}),document.documentElement.addEventListener("pointerleave",ue),document.addEventListener("visibilitychange",he),Q();let me=m.current.dpr;return I.current=()=>{const t=m.current;if(t.dpr!==me){me=t.dpr,Q();return}T||G(),k()},()=>{var t;cancelAnimationFrame(T),I.current=null,de.disconnect(),fe.disconnect(),window.removeEventListener("pointermove",se),window.removeEventListener("pointerdown",le),window.removeEventListener("pointerup",U),window.removeEventListener("pointercancel",U),document.documentElement.removeEventListener("pointerleave",ue),document.removeEventListener("visibilitychange",he),o.deleteProgram(H.program),o.deleteBuffer(ne),o.deleteVertexArray($),(t=o.getExtension("WEBGL_lose_context"))==null||t.loseContext()}},[]),B.useEffect(()=>{var b;(b=I.current)==null||b.call(I)}),pe.jsx("div",{ref:ee,className:`orb-container${Z?` ${Z}`:""}`,style:ke,children:pe.jsx("canvas",{ref:te,className:"orb-canvas","aria-hidden":"true"})})};export{Ye as default};
