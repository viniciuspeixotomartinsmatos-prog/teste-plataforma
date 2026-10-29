import{a as b,j as Ot}from"./index-DrbxZl7q.js";const Lt="molten-metal-container",qt="molten-metal-canvas",P=6,v=16,A=8,K=.06,tt=.9,et=1.8,Pt=2.4,Dt=.4,_t={molten:.5,ember:.3,frost:.7},Nt=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,Ht=`#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform float uTime;
uniform float uClock;
uniform float uScale;
uniform float uDetail;
uniform float uGlow;
uniform float uThickness;
uniform float uSwirl;
uniform float uFold;
uniform float uBlackPoint;
uniform float uBrightness;
uniform float uBalance;
uniform float uGrain;
uniform float uOpacity;
uniform vec2 uOffset;
uniform vec2 uRotation;
uniform vec2 uDrift;
uniform vec3 uColors[${P}];
uniform int uColorCount;
uniform vec3 uBackground;
uniform float uOpaque;
uniform float uLight;
uniform vec3 uReveal;
uniform vec4 uTrail[${v}];
uniform float uTrailWeight[${v}];
uniform int uTrailCount;
uniform vec4 uFlares[${A}];
uniform int uFlareCount;
uniform vec4 uHeat;
out vec4 outColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

vec3 palette(float g) {
  if (uColorCount <= 1) return uColors[0];
  float t = g < uBalance ? 0.5 * g / uBalance : 0.5 + 0.5 * (g - uBalance) / (1.0 - uBalance);
  float scaled = t * float(uColorCount - 1);
  int index = int(min(floor(scaled), float(uColorCount - 2)));
  return mix(uColors[index], uColors[index + 1], smoothstep(0.0, 1.0, scaled - float(index)));
}

float warmth(float age, float weight, vec2 offset) {
  float life = clamp(age / ${tt.toFixed(2)}, 0.0, 1.0);
  vec2 spread = offset / (uHeat.z * (1.0 + 0.8 * life));
  return weight * (1.0 - life) * (1.0 - life) * exp(-dot(spread, spread));
}

float trailHeat(vec2 q) {
  float heat = 0.0;
  for (int k = 0; k < ${v}; k++) {
    if (k >= uTrailCount) break;
    vec4 a = uTrail[k];
    float weight = uTrailWeight[k];
    heat = max(heat, warmth(a.z, weight, q - a.xy));
    int next = min(k + 1, ${v-1});
    if (next == k || next >= uTrailCount) continue;
    vec4 b = uTrail[next];
    float older = uTrailWeight[next];
    vec2 ab = b.xy - a.xy;
    float span = dot(ab, ab);
    float t = span > 1e-10 ? clamp(dot(q - a.xy, ab) / span, 0.0, 1.0) : 0.0;
    float even = smoothstep(0.0, uHeat.z, sqrt(span));
    float age = mix(min(a.w, b.z), mix(a.w, b.z, t), even);
    float strength = mix(max(weight, older), mix(weight, older, t), even);
    heat = max(heat, warmth(age, strength, q - a.xy - ab * t));
  }
  return heat;
}

float flareHeat(vec2 q) {
  float heat = 0.0;
  for (int k = 0; k < ${A}; k++) {
    if (k >= uFlareCount) break;
    vec4 f = uFlares[k];
    float life = clamp(f.z / ${et.toFixed(2)}, 0.0, 1.0);
    float rise = 1.0 - exp(-f.z / 0.07);
    float fall = exp(-3.0 * life) * (1.0 - life) * (1.0 - life);
    vec2 offset = (q - f.xy) / (uHeat.z * (0.9 + 1.6 * sqrt(life)));
    heat += rise * fall * exp(-dot(offset, offset));
  }
  return heat;
}

void main() {
  float time = uTime;
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
  vec2 q = uv - uOffset;
  vec2 view = vec2(q.x * uRotation.x - q.y * uRotation.y, q.x * uRotation.y + q.y * uRotation.x);
  vec2 p = uScale * view - 0.5;
  p += uDrift;

  float heat = 0.0;
  float flare = 0.0;
  if (uHeat.w > 0.5) {
    heat = trailHeat(uv) * uHeat.x;
    flare = flareHeat(uv) * uHeat.y;
  }
  float power = uThickness * (1.0 + (heat + flare) * 0.45);

  vec2 i = p;
  float c = 0.0;
  float blurred = 0.0;
  float r = length(p + vec2(sin(time), sin(time * 0.3 + 5.0)) * 0.5);
  float d = length(p);
  float rot = d + time + p.x * uSwirl;
  float cosRot = cos(rot);
  mat2 warp = mat2(cos(rot - sin(time / 5.0)), sin(rot), -sin(cosRot - time), cosRot) * uFold;
  float layers = ceil(uDetail);

  for (float n = 0.0; n < 8.0; n++) {
    if (n >= layers) break;
    p *= warp;
    float t = r - time / (n + 3.0);
    i -= p + vec2(cos(t - i.x - r) + sin(t + i.y), sin(t - i.y) + cos(t + i.x) + r);
    float l = length(vec2(sin(i.x + t), cos(i.y + t)));
    float footprint = 0.5 * length(vec2(dFdx(l), dFdy(l)));
    l = sqrt(l * l + footprint * footprint);
    float weight = clamp(uDetail - n, 0.0, 1.0);
    c += weight * uGlow / (power == 1.0 ? l : pow(max(l, 1e-6), power));
    if (uReveal.y > 0.5) blurred += weight * uGlow / sqrt(l * l + 0.0025);
  }

  c /= 6.0;
  c *= 1.0 + heat * 0.25 + flare * 0.6;

  float reveal = 1.0;
  float front = 0.0;
  if (uReveal.y > 0.5) {
    float level = log(max(blurred / 6.0, 1e-5)) - uReveal.x;
    reveal = smoothstep(-1.0, 1.0, level) * smoothstep(0.0, 0.08, uReveal.z);
    front = 0.2 * exp(-level * level * 1.5) * smoothstep(-2.6, -0.6, uReveal.x);
  }

  float g = clamp(max(c - uBlackPoint, 0.0) * uBrightness + front, 0.0, 1.0);
  vec3 col = palette(g);
  float noise = hash(gl_FragCoord.xy + fract(uClock) * 97.0) - 0.5;
  float a;
  if (uLight < 0.5) {
    a = g + noise * uGrain;
  } else {
    float lift = max(g - 0.03, 0.0) / 0.97;
    a = (1.0 - exp(-6.0 * lift)) / (1.0 - exp(-6.0)) + noise * uGrain * g;
  }
  a = clamp(a + noise / 255.0, 0.0, 1.0) * reveal * uOpacity;

  if (uOpaque > 0.5) {
    outColor = vec4(mix(uBackground, col, a), 1.0);
  } else {
    outColor = vec4(col * a, a);
  }
}`,w=(l,h,c)=>Math.min(c,Math.max(h,l));let R=null;const J=(l,h)=>{if(l==="transparent")return null;if(typeof document>"u"||(R||(R=document.createElement("canvas").getContext("2d")),!R))return h;R.fillStyle="#000000",R.fillStyle=l;const c=R.fillStyle;if(c.startsWith("#")){const C=parseInt(c.slice(1),16);return[(C>>16&255)/255,(C>>8&255)/255,(C&255)/255]}const s=/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/.exec(c);return s?s[4]!==void 0&&Number(s[4])===0?null:[Number(s[1])/255,Number(s[2])/255,Number(s[3])/255]:h},Q=(l,h,c)=>{const s=l.createShader(h);return s?(l.shaderSource(s,c),l.compileShader(s),l.getShaderParameter(s,l.COMPILE_STATUS)?s:(l.deleteShader(s),null)):null},Z=()=>{var l;return typeof window<"u"&&(((l=window.matchMedia)==null?void 0:l.call(window,"(prefers-reduced-motion: reduce)").matches)??!1)};function Gt({colors:l=["#5227FF","#FF9FFC"],coreColor:h="#FFFFFF",backgroundColor:c="transparent",lightMode:s=!1,speed:C=.35,scale:ot=4,detail:it=3,glow:rt=1.6,thickness:at=1,swirl:nt=1,turbulence:lt=.2,haze:st=.75,brightness:ut=1.3,colorMode:ft="molten",rotation:ct=0,offsetX:mt=0,offsetY:ht=0,drift:dt=.3,grain:S=.05,opacity:pt=1,intro:gt=!0,mouseInteraction:vt=!0,mouseStrength:xt=.5,flareOnClick:wt=!0,paused:Rt=!1,dpr:Ct=2,className:kt="",style:yt}){const D=b.useRef(null),_=[...l.slice(0,P-1),h].join("|"),Ft=b.useMemo(()=>_.split("|").map(d=>J(d,[1,1,1])??[1,1,1]),[_]),bt=b.useMemo(()=>J(c,null),[c]),N={palette:Ft,paper:bt,lightMode:s,speed:C,scale:Math.max(.1,ot),detail:w(it,1,8),glow:Math.max(0,rt),thickness:w(at,.2,3),swirl:nt,fold:-lt,blackPoint:.2*(1-w(st,0,1)),brightness:Math.max(0,ut),balance:_t[ft]??.5,rotation:ct*Math.PI/180,offset:[mt,ht],drift:Math.max(0,dt),grain:typeof S=="number"?Math.max(0,S):S?.05:0,opacity:w(pt,0,1),intro:gt,mouseInteraction:vt,mouseStrength:w(xt,0,1),flareOnClick:wt,paused:Rt,dpr:Math.max(.5,Ct)},k=b.useRef(N);return k.current=N,b.useEffect(()=>{const d=D.current;if(!d)return;const p=document.createElement("canvas");p.className=qt,d.appendChild(p);const e=p.getContext("webgl2",{alpha:!0,antialias:!1,depth:!1,stencil:!1,premultipliedAlpha:!0,powerPreference:"high-performance"});if(!e){p.remove();return}const E=Q(e,e.VERTEX_SHADER,Nt),T=Q(e,e.FRAGMENT_SHADER,Ht),m=e.createProgram();if(!E||!T||!m){p.remove();return}if(e.attachShader(m,E),e.attachShader(m,T),e.bindAttribLocation(m,0,"aPosition"),e.linkProgram(m),e.deleteShader(E),e.deleteShader(T),!e.getProgramParameter(m,e.LINK_STATUS)){e.deleteProgram(m),p.remove();return}const At=["uResolution","uTime","uClock","uScale","uDetail","uGlow","uThickness","uSwirl","uFold","uBlackPoint","uBrightness","uBalance","uGrain","uOpacity","uOffset","uRotation","uDrift","uColors","uColorCount","uBackground","uOpaque","uLight","uReveal","uTrail","uTrailWeight","uTrailCount","uFlares","uFlareCount","uHeat"],r={};At.forEach(i=>{r[i]=e.getUniformLocation(m,i)});const H=e.createVertexArray();e.bindVertexArray(H);const I=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,I),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),e.useProgram(m);const M=new Float32Array(P*3),B=new Float32Array(v*4),O=new Float32Array(v),L=new Float32Array(A*4),t={width:1,height:1,time:Dt,clock:0,last:0,raf:0,visible:!1,introAt:-1,pointer:[.5,.5],inside:!1,presence:0,drift:[0,0],trail:[],flares:[],quiet:0,seen:null},q=()=>{const i=k.current,o=Math.min(window.devicePixelRatio||1,i.dpr),n=Math.max(1,Math.round(d.clientWidth*o)),a=Math.max(1,Math.round(d.clientHeight*o));n===t.width&&a===t.height||(t.quiet=0,t.width=n,t.height=a,p.width=n,p.height=a)},G=i=>[(i[0]-.5)*(t.width/Math.max(t.height,1)),.5-i[1]],z=(i,o)=>!i.intro||o||t.introAt<0?1:w((t.clock-t.introAt)/Pt,0,1),St=i=>{const o=k.current,n=z(o,i),a=t.width/Math.max(t.height,1);e.viewport(0,0,t.width,t.height),e.uniform2f(r.uResolution,t.width,t.height),e.uniform1f(r.uTime,t.time),e.uniform1f(r.uClock,t.clock),e.uniform1f(r.uScale,o.scale),e.uniform1f(r.uDetail,o.detail),e.uniform1f(r.uGlow,o.glow*.1),e.uniform1f(r.uThickness,o.thickness),e.uniform1f(r.uSwirl,o.swirl),e.uniform1f(r.uFold,o.fold),e.uniform1f(r.uBlackPoint,o.blackPoint),e.uniform1f(r.uBrightness,o.brightness),e.uniform1f(r.uBalance,o.balance),e.uniform1f(r.uGrain,o.grain),e.uniform1f(r.uOpacity,o.opacity),e.uniform2f(r.uOffset,o.offset[0]*a,-o.offset[1]),e.uniform2f(r.uRotation,Math.cos(o.rotation),Math.sin(o.rotation)),e.uniform2f(r.uDrift,t.drift[0],t.drift[1]),M.fill(0),o.palette.forEach((f,g)=>M.set(f,g*3)),e.uniform3fv(r.uColors,M),e.uniform1i(r.uColorCount,o.palette.length);const u=o.paper??[0,0,0];e.uniform3f(r.uBackground,u[0],u[1],u[2]),e.uniform1f(r.uOpaque,o.paper?1:0),e.uniform1f(r.uLight,o.lightMode?1:0),e.uniform3f(r.uReveal,Math.log(1.6)+Math.log(.01/1.6)*n,n<1?1:0,n),B.fill(0),O.fill(0),t.trail.forEach((f,g)=>{const[y,F]=G(f.at);B.set([y,F,t.clock-f.time,t.clock-f.arrive],g*4),O[g]=f.weight}),e.uniform4fv(r.uTrail,B),e.uniform1fv(r.uTrailWeight,O),e.uniform1i(r.uTrailCount,t.trail.length),L.fill(0),t.flares.forEach((f,g)=>{const[y,F]=G(f.at);L.set([y,F,t.clock-f.time,1],g*4)}),e.uniform4fv(r.uFlares,L),e.uniform1i(r.uFlareCount,t.flares.length);const x=t.trail.length>0||t.flares.length>0;e.uniform4f(r.uHeat,o.mouseStrength*2,3.2,.2,x?1:0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.drawArrays(e.TRIANGLES,0,3)},Et=(i,o)=>{const n=i.mouseInteraction&&t.inside&&i.mouseStrength>0;t.presence+=((n?1:0)-t.presence)*(1-Math.exp(-o/.25)),t.trail=t.trail.filter(u=>u.live||t.clock-u.time<tt);const a=t.trail[0];if(!n)return a!=null&&a.live&&(a.live=!1),t.trail.length>0;if(!(a!=null&&a.live))t.trail.unshift({at:[...t.pointer],time:t.clock,arrive:t.clock,weight:t.presence,live:!0});else{if(a.at[0]!==t.pointer[0]||a.at[1]!==t.pointer[1]){const u=t.trail[1],x=u?Math.hypot(u.at[0]-a.at[0],u.at[1]-a.at[1]):1/0,f=t.clock-a.arrive>K;x>.004&&(!u||f||t.clock-u.time>=K)&&t.trail.splice(1,0,{...a,at:[...a.at],time:t.clock,live:!1}),a.at=[...t.pointer],a.arrive=t.clock}a.time=t.clock,a.weight=t.presence}return t.trail.length>v&&(t.trail.length=v),t.trail.length>0},W=i=>{if(t.raf=requestAnimationFrame(W),!t.visible||document.hidden){t.last=i;return}const o=k.current,n=t.last?Math.min((i-t.last)/1e3,.1):0;t.last=i;const a=Z();t.clock+=n,t.introAt<0&&(t.introAt=t.clock),!o.paused&&!a&&(t.time+=n*o.speed);const u=o.mouseInteraction&&t.inside&&!a,x=u?(t.pointer[0]-.5)*o.drift*2:0,f=u?(.5-t.pointer[1])*o.drift*2:0,g=1-Math.exp(-n/.33);t.drift[0]+=(x-t.drift[0])*g,t.drift[1]+=(f-t.drift[1])*g;const y=Math.abs(x-t.drift[0])+Math.abs(f-t.drift[1])>5e-4,F=Et(o,n);t.flares=t.flares.filter(Bt=>t.clock-Bt.time<et);const Tt=o.paused||a,Mt=F||y||t.flares.length>0||z(o,a)<1;t.seen!==o||Mt||!Tt?t.quiet=0:t.quiet+=1,t.seen=o,!(t.quiet>3)&&(q(),St(a))},$=i=>{const o=d.getBoundingClientRect();return{x:(i.clientX-o.left)/Math.max(o.width,1),y:(i.clientY-o.top)/Math.max(o.height,1),inside:i.clientX>=o.left&&i.clientX<=o.right&&i.clientY>=o.top&&i.clientY<=o.bottom}},V=i=>{const o=$(i);t.inside=o.inside,o.inside&&(t.pointer=[o.x,o.y])},X=()=>{t.inside=!1},U=i=>{if(!k.current.flareOnClick||i.button!==0||Z()||i.target instanceof Element&&i.target.closest('a, button, input, textarea, select, label, [role="button"]'))return;const n=$(i);n.inside&&(t.flares.push({at:[n.x,n.y],time:t.clock}),t.flares.length>A&&t.flares.shift())},Y=new IntersectionObserver(i=>{t.visible=i.some(o=>o.isIntersecting)});Y.observe(d);const j=new ResizeObserver(q);return j.observe(d),q(),window.addEventListener("pointermove",V,{passive:!0}),window.addEventListener("pointerdown",U),document.documentElement.addEventListener("pointerleave",X),t.raf=requestAnimationFrame(W),()=>{var i;cancelAnimationFrame(t.raf),Y.disconnect(),j.disconnect(),window.removeEventListener("pointermove",V),window.removeEventListener("pointerdown",U),document.documentElement.removeEventListener("pointerleave",X),e.deleteProgram(m),e.deleteBuffer(I),e.deleteVertexArray(H),(i=e.getExtension("WEBGL_lose_context"))==null||i.loseContext(),p.remove()}},[]),Ot.jsx("div",{ref:D,className:[Lt,kt].filter(Boolean).join(" "),style:yt})}export{Gt as default};
