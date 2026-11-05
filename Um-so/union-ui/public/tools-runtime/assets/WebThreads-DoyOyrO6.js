import{a as M,j as Ge}from"./index-DrbxZl7q.js";const De="web-threads-container",Ue="web-threads-canvas",k=24,S=6,P=3,le=1.6,fe=.05,ae=1.25,ze=Math.PI*2,Xe=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,Ve=`#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform float uPhase;
uniform float uClock;
uniform int uCount;
uniform float uFrequency;
uniform float uSpread;
uniform float uTaper;
uniform float uPosition;
uniform float uPinch;
uniform float uNodes;
uniform vec2 uAngle;
uniform float uGlow;
uniform float uFalloff;
uniform float uThickness;
uniform float uBrightness;
uniform float uOpacity;
uniform float uMirror;
uniform float uShimmer;
uniform float uDepth;
uniform float uPulses;
uniform float uFade;
uniform float uGrain;
uniform vec3 uColors[${S}];
uniform int uColorCount;
uniform vec3 uCore;
uniform vec3 uBackground;
uniform float uOpaque;
uniform float uLight;
uniform vec4 uIntro;
uniform float uFocus[${k}];
uniform vec2 uFocusState;
uniform vec4 uSurges[${P}];
out vec4 outColor;

const float PI = 3.14159265;
const float TAU = 6.28318530;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float easeInOut(float t) {
  return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) * 0.5;
}

vec3 palette(float t) {
  if (uColorCount <= 1) return uColors[0];
  float scaled = clamp(t, 0.0, 1.0) * float(uColorCount - 1);
  int index = int(min(floor(scaled), float(uColorCount - 2)));
  return mix(uColors[index], uColors[index + 1], scaled - float(index));
}

vec2 envelope(float x) {
  float dx = x - uPinch;
  if (uNodes <= 1.0) return vec2(uSpread * abs(dx), uSpread * sign(dx));
  float k = PI * uNodes;
  float c = cos(k * (dx + 0.5));
  return vec2(uSpread * 0.5 * abs(c), -uSpread * 0.5 * k * sin(k * (dx + 0.5)) * sign(c));
}

vec2 space(vec2 p, float aspect) {
  vec2 q = (p - 0.5) * vec2(aspect, 1.0);
  q = vec2(q.x * uAngle.x + q.y * uAngle.y, -q.x * uAngle.y + q.y * uAngle.x);
  return vec2(q.x / aspect + 0.5, q.y + 0.5);
}

float hubAt(float x) {
  if (uNodes <= 1.0) return uPinch;
  float spacing = 1.0 / uNodes;
  return uPinch - 0.5 + (floor((x - uPinch + 0.5) / spacing) + 0.5) * spacing;
}

vec3 thread(float x, float i, float n) {
  float lane = uNodes <= 1.0 ? x - uPinch : (x - uPinch + 0.5) * uNodes - 0.5;
  float side = uMirror > 0.5 ? (mod(floor(lane), 2.0) < 0.5 ? -1.0 : 1.0) : 1.0;
  vec2 env = envelope(x);
  float amp = 1.0 + i * uTaper;
  float shimmer = uShimmer > 0.5 ? sin(uClock * 1.7 + i * 1.3) * 0.35 : 0.0;
  float angle = x * uFrequency + (uPhase + i * TAU / max(n, 1.0)) * side + shimmer;
  float wave = sin(angle);
  float y = uPosition - env.x * amp * wave;
  float slope = -(env.y * amp * wave + env.x * amp * cos(angle) * uFrequency);
  return vec3(y, slope, angle);
}

void main() {
  vec2 p = gl_FragCoord.xy / uResolution;
  float aspect = uResolution.x / uResolution.y;
  vec2 s = space(p, aspect);
  float x = s.x;
  float y = s.y;
  float n = float(uCount);
  float pixel = 1.0 / uResolution.y;
  float hub = hubAt(x);
  float presence = uFocusState.x;
  float settle = uFocusState.y;

  vec3 color = vec3(0.0);
  float energy = 0.0;
  float ink = 0.0;
  vec3 inkColor = vec3(0.0);

  for (int idx = 0; idx < ${k}; idx++) {
    if (idx >= uCount) break;
    float i = float(idx);
    float ci = n > 1.0 ? i / (n - 1.0) : 0.0;

    float head = 2.0;
    float bead = 0.0;
    float born = 1.0;
    if (uIntro.w > 0.5) {
      float progress = clamp((uIntro.x - i * uIntro.y) / uIntro.z, 0.0, 1.0);
      head = mix(-0.06, 1.06, easeInOut(progress));
      bead = sin(PI * progress);
      born = progress > 0.0 ? smoothstep(-0.05, 0.03, head) : 0.0;
    }
    if (born <= 0.0) continue;

    bool tip = x > head;
    vec3 lead = bead > 0.0 || tip ? thread(head, i, n) : vec3(0.0);
    vec3 t = tip ? lead : thread(x, i, n);

    float focus = uFocus[idx];
    float spot = tip ? head : x;
    float twist = uDepth * smoothstep(0.0, 0.07, abs(spot - hubAt(spot)));
    float depth = 0.5 + 0.5 * cos(t.z);
    float front = mix(1.0, 0.3 + 0.7 * depth, twist);
    float width = uThickness * mix(1.0, 0.55 + 0.7 * depth, twist) * (1.0 + 0.3 * focus * presence);

    float d;
    if (tip) {
      float back = head - 0.02;
      vec2 a = vec2(back * aspect, thread(back, i, n).x);
      vec2 b = vec2(head * aspect, lead.x);
      vec2 pa = vec2(x * aspect, y) - a;
      vec2 ba = b - a;
      d = length(pa - ba * clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0));
    } else {
      float bend = t.y * smoothstep(0.0, 0.04, abs(x - hub));
      d = abs(y - t.x) / sqrt(1.0 + bend * bend / (aspect * aspect));
    }
    float g = uGlow / pow(max(d / width, pixel * 0.35), uFalloff) * front * born;
    float onLine = exp(-d / (width * 0.012));

    if (bead > 0.0) {
      vec2 near = vec2((x - head) * aspect, y - lead.x);
      g *= 1.0 + bead * 1.6 * exp(-dot(near, near) / 0.0025);
    }

    float light = 0.0;
    for (int k = 0; k < ${P}; k++) {
      vec4 surge = uSurges[k];
      if (surge.w <= 0.0) continue;
      float progress = clamp((surge.y - i * ${fe.toFixed(3)}) / ${le.toFixed(2)}, 0.0, 1.0);
      if (progress <= 0.0 || progress >= 1.0) continue;
      float lead = mix(surge.x, surge.z > 0.0 ? 1.12 : -0.12, easeInOut(progress));
      float along = (x - lead) * surge.z * aspect;
      float trail = along < 0.0 ? exp(along / 0.24) : exp(-along * along / 0.0009);
      light += trail * sin(PI * progress);
    }
    g *= 1.0 + light * (0.12 + 2.8 * onLine);

    if (uPulses > 0.0) {
      float travel = abs(x - hub);
      float pulse = pow(0.5 + 0.5 * sin(travel * 16.0 + uClock * 2.2 + i * 1.9), 24.0);
      g *= 1.0 + uPulses * 5.0 * pulse * onLine;
    }

    float sheen = pow(0.5 + 0.5 * sin(abs(x - hub) * 11.0 + uClock * 1.4), 10.0);
    float lift = focus * presence;
    g *= (1.0 - settle * (1.0 - focus)) * (1.0 + lift * (0.9 + 1.4 * sheen * onLine));

    vec3 tint = mix(palette(ci), uCore, 0.3 * lift);
    color += g * tint;
    energy += g;
    float stroke = smoothstep(0.45, 1.3, g);
    inkColor += tint * stroke;
    ink += stroke;
  }

  float fade = 1.0;
  if (uFade > 0.0) {
    float edge = min(x, 1.0 - x);
    float f = clamp(edge / max(uFade * 0.5, 0.001), 0.0, 1.0);
    fade = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  }
  float core = smoothstep(0.5, 2.2, energy);
  color = mix(color, uCore * energy, core * 0.5);
  color *= uBrightness * fade;
  float alpha = clamp(energy * fade, 0.0, 1.0) * uOpacity;
  float grain = (hash(gl_FragCoord.xy + fract(uClock) * 97.0) - 0.5) * uGrain;

  if (uLight < 0.5) {
    vec3 rgb = max(color * alpha * (1.0 + grain * 2.0), 0.0);
    if (uOpaque > 0.5) {
      outColor = vec4(min(uBackground * (1.0 - alpha) + rgb, 1.0), 1.0);
    } else {
      outColor = vec4(rgb, alpha);
    }
  } else {
    ink *= fade;
    vec3 hue = ink > 0.0001 ? inkColor / ink : palette(0.5);
    float body = clamp(ink, 0.0, 1.0);
    float haze = clamp(1.0 - exp(-energy * fade * 0.3), 0.0, 1.0) * 0.12;
    float focal = smoothstep(2.0, 9.0, energy * fade) * 0.25;
    float cover = clamp((body * 0.9 + (haze + focal) * (1.0 - body)) * (1.0 + grain * 2.0), 0.0, 0.95) * uOpacity;
    vec3 stroke = hue;
    if (uOpaque > 0.5) {
      outColor = vec4(mix(uBackground, stroke, cover), 1.0);
    } else {
      outColor = vec4(stroke * cover, cover);
    }
  }
}`,C=(r,i,u)=>Math.min(u,Math.max(i,r)),$e=(r,i)=>(r%i+i)%i;let F=null;const z=(r,i)=>{if(r==="transparent")return null;if(typeof document>"u"||(F||(F=document.createElement("canvas").getContext("2d")),!F))return i;F.fillStyle="#000000",F.fillStyle=r;const u=F.fillStyle;if(u.startsWith("#")){const d=parseInt(u.slice(1),16);return[(d>>16&255)/255,(d>>8&255)/255,(d&255)/255]}const s=/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/.exec(u);return s?s[4]!==void 0&&Number(s[4])===0?null:[Number(s[1])/255,Number(s[2])/255,Number(s[3])/255]:i},ie=r=>Math.min(.12,.9/Math.max(r-1,1)),se=(r,i,u)=>{const s=(r[0]-.5)*i,d=.5-r[1],b=Math.cos(u),y=Math.sin(u);return[(s*b+d*y)/i+.5,-s*y+d*b+.5]},Ye=(r,i,u,s,d)=>{const b=r.nodes<=1?i-r.pinch:(i-r.pinch+.5)*r.nodes-.5,y=r.mirror&&$e(Math.floor(b),2)<.5?-1:1,R=i-r.pinch,q=r.nodes<=1?r.spread*Math.abs(R):r.spread*.5*Math.abs(Math.cos(Math.PI*r.nodes*(R+.5))),T=r.shimmer?Math.sin(d*1.7+u*1.3)*.35:0,I=i*r.frequency+(s+u*ze/Math.max(r.count,1))*y+T;return r.position-q*(1+u*r.taper)*Math.sin(I)},ue=(r,i,u)=>{const s=r.createShader(i);return s?(r.shaderSource(s,u),r.compileShader(s),r.getShaderParameter(s,r.COMPILE_STATUS)?s:(r.deleteShader(s),null)):null},ce=()=>{var r;return typeof window<"u"&&(((r=window.matchMedia)==null?void 0:r.call(window,"(prefers-reduced-motion: reduce)").matches)??!1)};function We({colors:r=["#5227FF","#FF9FFC"],coreColor:i="#FFFFFF",backgroundColor:u="transparent",lightMode:s=!1,threadCount:d=6,speed:b=.2,frequency:y=5,spread:R=.18,taper:q=1,position:T=.5,pinch:I=.5,nodes:de=1,angle:he=0,glow:pe=.02,falloff:me=.6,thickness:ge=1.1,brightness:xe=.6,opacity:ve=1,depth:be=0,pulses:ye=0,mirror:Me=!0,shimmer:Ce=!1,fade:Fe=0,grain:O=.05,intro:we=!0,mouseInteraction:Ae=!0,mouseStrength:Se=.5,pulseOnClick:ke=!0,paused:Pe=!1,dpr:Re=2,className:Ee="",style:qe}){const X=M.useRef(null),V=r.join("|"),$=M.useMemo(()=>V.split("|").slice(0,S).map(g=>z(g,[1,1,1])??[1,1,1]),[V]),Te=M.useMemo(()=>z(i,[1,1,1])??[1,1,1],[i]),Ie=M.useMemo(()=>z(u,null),[u]),Y={palette:$.length?$:[[1,1,1]],core:Te,paper:Ie,lightMode:s,count:C(Math.round(d),1,k),speed:b,frequency:y,spread:R,taper:q,position:T,pinch:I,nodes:C(Math.round(de),1,6),angle:he*Math.PI/180,glow:Math.max(0,pe),falloff:Math.max(.05,me),thickness:Math.max(.05,ge),brightness:Math.max(0,xe),opacity:C(ve,0,1),depth:C(be,0,1),pulses:Math.max(0,ye),mirror:Me,shimmer:Ce,fade:C(Fe,0,1),grain:typeof O=="number"?Math.max(0,O):O?.05:0,intro:we,mouseInteraction:Ae,mouseStrength:C(Se,0,1),pulseOnClick:ke,paused:Pe,dpr:Math.max(.5,Re)},w=M.useRef(Y);return w.current=Y,M.useEffect(()=>{const g=X.current;if(!g)return;const x=document.createElement("canvas");x.className=Ue,g.appendChild(x);const e=x.getContext("webgl2",{alpha:!0,antialias:!1,depth:!1,stencil:!1,premultipliedAlpha:!0,powerPreference:"high-performance"});if(!e){x.remove();return}const L=ue(e,e.VERTEX_SHADER,Xe),N=ue(e,e.FRAGMENT_SHADER,Ve),h=e.createProgram();if(!L||!N||!h){x.remove();return}if(e.attachShader(h,L),e.attachShader(h,N),e.bindAttribLocation(h,0,"aPosition"),e.linkProgram(h),e.deleteShader(L),e.deleteShader(N),!e.getProgramParameter(h,e.LINK_STATUS)){e.deleteProgram(h),x.remove();return}const Oe=["uResolution","uPhase","uClock","uCount","uFrequency","uSpread","uTaper","uPosition","uPinch","uNodes","uAngle","uGlow","uFalloff","uThickness","uBrightness","uOpacity","uMirror","uShimmer","uDepth","uPulses","uFade","uGrain","uColors","uColorCount","uCore","uBackground","uOpaque","uLight","uIntro","uFocus","uFocusState","uSurges"],a={};Oe.forEach(n=>{a[n]=e.getUniformLocation(h,n)});const j=e.createVertexArray();e.bindVertexArray(j);const W=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,W),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),e.useProgram(h);const B=new Float32Array(S*3),_=new Float32Array(P*4),E=new Float32Array(k),o={width:1,height:1,phase:0,clock:0,last:0,raf:0,visible:!1,introAt:-1,pointer:[.5,.5],inside:!1,presence:0,settle:0,target:-1,surges:[],quiet:0,seen:null},G=()=>{const n=w.current,t=Math.min(window.devicePixelRatio||1,n.dpr),c=Math.max(1,Math.round(g.clientWidth*t)),l=Math.max(1,Math.round(g.clientHeight*t));c===o.width&&l===o.height||(o.quiet=0,o.width=c,o.height=l,x.width=c,x.height=l)},H=n=>(n.count-1)*ie(n.count)+ae,Le=(n,t,c)=>{const l=n.mouseInteraction&&o.inside;if(l){const m=o.width/Math.max(o.height,1),[D,Be]=se(o.pointer,m,n.angle);let ne=-1,re=1/0;for(let A=0;A<n.count;A++){const U=Math.abs(Ye(n,D,A,o.phase,c?0:o.clock)-Be),_e=A===o.target?.11:.085;U<_e&&U<re&&(ne=A,re=U)}o.target=ne}else o.target=-1;const p=1-Math.exp(-t/.22);let f=0;for(let m=0;m<k;m++){const D=m===o.target?1:0;E[m]+=(D-E[m])*p,f=Math.max(f,E[m])}o.presence+=((l?1:0)-o.presence)*(1-Math.exp(-t/.3));const v=n.mouseStrength*.65*f*o.presence;return o.settle+=(v-o.settle)*(1-Math.exp(-t/.3)),f>.002||o.presence>.002||o.settle>.002},Ne=n=>{const t=w.current,c=o.introAt<0?0:o.clock-o.introAt,l=t.intro&&!n&&c<H(t);e.viewport(0,0,o.width,o.height),e.uniform2f(a.uResolution,o.width,o.height),e.uniform1f(a.uPhase,o.phase),e.uniform1f(a.uClock,n?0:o.clock),e.uniform1i(a.uCount,t.count),e.uniform1f(a.uFrequency,t.frequency),e.uniform1f(a.uSpread,t.spread),e.uniform1f(a.uTaper,t.taper),e.uniform1f(a.uPosition,t.position),e.uniform1f(a.uPinch,t.pinch),e.uniform1f(a.uNodes,t.nodes),e.uniform2f(a.uAngle,Math.cos(t.angle),Math.sin(t.angle)),e.uniform1f(a.uGlow,t.glow*Math.sqrt(6/Math.max(t.count,6))),e.uniform1f(a.uFalloff,t.falloff),e.uniform1f(a.uThickness,t.thickness),e.uniform1f(a.uBrightness,t.brightness),e.uniform1f(a.uOpacity,t.opacity),e.uniform1f(a.uMirror,t.mirror?1:0),e.uniform1f(a.uShimmer,t.shimmer&&!n?1:0),e.uniform1f(a.uDepth,t.depth),e.uniform1f(a.uPulses,t.pulses),e.uniform1f(a.uFade,t.fade),e.uniform1f(a.uGrain,t.grain),B.fill(0),t.palette.slice(0,S).forEach((f,v)=>B.set(f,v*3)),e.uniform3fv(a.uColors,B),e.uniform1i(a.uColorCount,Math.min(t.palette.length,S)),e.uniform3f(a.uCore,t.core[0],t.core[1],t.core[2]);const p=t.paper??[0,0,0];e.uniform3f(a.uBackground,p[0],p[1],p[2]),e.uniform1f(a.uOpaque,t.paper?1:0),e.uniform1f(a.uLight,t.lightMode?1:0),e.uniform4f(a.uIntro,c,ie(t.count),ae,l?1:0),e.uniform1fv(a.uFocus,E),e.uniform2f(a.uFocusState,o.presence*(.4+.6*t.mouseStrength),o.settle),_.fill(0),o.surges.slice(-P).forEach((f,v)=>{_.set([f.x,o.clock-f.at,f.direction,1],v*4)}),e.uniform4fv(a.uSurges,_),e.bindFramebuffer(e.FRAMEBUFFER,null),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.drawArrays(e.TRIANGLES,0,3)},K=n=>{if(o.raf=requestAnimationFrame(K),!o.visible||document.hidden){o.last=n;return}const t=w.current,c=o.last?Math.min((n-o.last)/1e3,.1):1/60;o.last=n;const l=ce();o.clock+=c,o.introAt<0&&(o.introAt=o.clock),!t.paused&&!l&&(o.phase+=c*t.speed);const p=Le(t,c,l);o.surges=o.surges.filter(m=>o.clock-m.at<le+(t.count-1)*fe);const f=t.paused||l,v=o.surges.length>0||t.intro&&!l&&o.clock-o.introAt<H(t)||p;o.seen!==t||v||!f?o.quiet=0:o.quiet+=1,o.seen=t,!(o.quiet>3)&&(G(),Ne(l))},J=n=>{const t=g.getBoundingClientRect();return{x:(n.clientX-t.left)/Math.max(t.width,1),y:(n.clientY-t.top)/Math.max(t.height,1),inside:n.clientX>=t.left&&n.clientX<=t.right&&n.clientY>=t.top&&n.clientY<=t.bottom}},Q=n=>{const t=J(n);o.inside=t.inside,t.inside&&(o.pointer=[t.x,t.y])},Z=()=>{o.inside=!1},ee=n=>{const t=w.current;if(!t.pulseOnClick||n.button!==0||ce()||n.target instanceof Element&&n.target.closest('a, button, input, textarea, select, label, [role="button"]'))return;const c=J(n);if(!c.inside)return;const l=o.width/Math.max(o.height,1),[p]=se([c.x,c.y],l,t.angle),f=p<=t.pinch?1:-1;o.surges.push({x:p,direction:f,at:o.clock}),o.surges.length>P&&o.surges.shift()},te=new IntersectionObserver(n=>{o.visible=n.some(t=>t.isIntersecting)});te.observe(g);const oe=new ResizeObserver(G);return oe.observe(g),G(),window.addEventListener("pointermove",Q,{passive:!0}),window.addEventListener("pointerdown",ee),document.documentElement.addEventListener("pointerleave",Z),o.raf=requestAnimationFrame(K),()=>{var n;cancelAnimationFrame(o.raf),te.disconnect(),oe.disconnect(),window.removeEventListener("pointermove",Q),window.removeEventListener("pointerdown",ee),document.documentElement.removeEventListener("pointerleave",Z),e.deleteProgram(h),e.deleteBuffer(W),e.deleteVertexArray(j),(n=e.getExtension("WEBGL_lose_context"))==null||n.loseContext(),x.remove()}},[]),Ge.jsx("div",{ref:X,className:[De,Ee].filter(Boolean).join(" "),style:qe})}export{We as default};
