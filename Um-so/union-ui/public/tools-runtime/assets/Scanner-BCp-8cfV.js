import{a as S,j as re}from"./index-DrbxZl7q.js";const R=6,Te=2,_e={vertical:0,horizontal:1,diagonal:2},De=`#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`,Ne=`#version 300 es
precision highp float;

uniform vec2 uResolution;
uniform float uWave;
uniform float uSweep;
uniform float uSweepWidth;
uniform float uTrail;
uniform float uScale;
uniform float uFrequency;
uniform float uRipple;
uniform float uDensity;
uniform float uLineWidth;
uniform float uGlow;
uniform float uDirection;
uniform float uSpread;
uniform float uBrightness;
uniform float uVignette;
uniform float uOpacity;
uniform float uScanline;
uniform float uRatio;
uniform float uGrain;
uniform float uTime;
uniform vec2 uMouse;
uniform float uPresence;
uniform float uMouseRadius;
uniform float uMouseStrength;
uniform float uAttract;
uniform vec3 uPings[${R}];
uniform float uIntro;
uniform float uLightMode;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;

out vec4 fragColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float signal(vec2 p, float t) {
  float w = sin(p.x * 1.3 + t * 0.7);
  w += sin(p.y * 1.7 - t * 0.52) * 0.8;
  w += sin((p.x + p.y) * 0.9 + t * 0.91) * 0.6;
  w += sin((p.x - p.y) * 1.53 - t * 0.63) * 0.42;
  return w * 0.35;
}

float smoother(float x) {
  x = clamp(x, 0.0, 1.0);
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
}

vec2 axes(vec2 p) {
  if (uDirection < 0.5) return vec2(p.y, p.x);
  if (uDirection < 1.5) return vec2(p.x, -p.y);
  return vec2((p.x + p.y) * 0.70710678, (p.x - p.y) * 0.70710678);
}

float coverage(float lc, float width) {
  float fw = max(fwidth(lc), 1e-5);
  float dist = abs(fract(lc + 0.5) - 0.5) / fw;
  float crowd = smoothstep(0.2, 0.55, fw);
  float cover = clamp(width * 0.5 + 0.5 - dist, 0.0, 1.0) * min(width, 1.0);
  return mix(cover, min(width * fw, 1.0), crowd);
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution) / uResolution.y;
  vec2 p = uv / max(uScale, 0.001);
  vec2 ax = axes(p);

  float sig = signal(p * uFrequency, uWave);
  float coord = ax.x + sig * uRipple;

  vec2 mp = uMouse / max(uScale, 0.001);
  vec2 md = p - mp;
  float radius = max(uMouseRadius / max(uScale, 0.001), 0.01);
  float lens = exp(-dot(md, md) / (radius * radius)) * uPresence;
  float mouseAxis = axes(mp).x + signal(mp * uFrequency, uWave) * uRipple;
  coord -= (coord - mouseAxis) * lens * uMouseStrength * mix(0.55, -0.9, uAttract);

  float pingLight = 0.0;
  for (int i = 0; i < ${R}; i++) {
    vec3 ping = uPings[i];
    if (ping.z < 0.0) continue;
    float d = length(uv - ping.xy);
    float age = ping.z;
    float r = age * 1.1;
    float w = 0.12 + age * 0.1;
    float band = exp(-((d - r) * (d - r)) / (w * w));
    float fade = exp(-age * 0.9) * smoothstep(0.0, 0.12, age);
    coord += band * fade * 0.018 / max(uScale, 0.001);
    pingLight += band * fade;
  }

  float u = fract(uSweep - coord / max(uSweepWidth, 0.05));
  float tail = mix(11.0, 1.8, clamp(uTrail, 0.0, 1.0));
  float lead = smoothstep(0.84, 1.0, u);
  lead *= lead;
  float sweep = max(exp(-u * tail), lead);
  float head = max(exp(-u * 26.0), lead * lead * lead);

  float introFront = mix(-1.6, 1.6, smoother(uIntro)) / max(uScale, 0.001);
  float reveal = 1.0 - smoothstep(introFront - 0.05, introFront + 0.3, coord);
  float introHead = exp(-abs(coord - introFront) * 14.0) * (1.0 - uIntro) * step(0.0001, 1.0 - uIntro);
  reveal = mix(reveal, 1.0, step(0.9999, uIntro));

  float lit = clamp(sweep * 0.86 + lens * uMouseStrength * 0.7 + pingLight * 0.9 + introHead, 0.0, 1.6);
  float hot = clamp(head + introHead + pingLight * 0.35, 0.0, 1.0);

  float lc = coord * uDensity;
  float width = uLineWidth * (1.0 + lit * 1.4 + hot * 0.9);
  float thread = 0.62 + 0.38 * hash(vec2(floor(lc + 0.5), 3.7));
  float split = uSpread * (0.5 + lit * 1.3) * max(fwidth(lc), 1e-5);
  float cg = coverage(lc, width);
  float cr = coverage(lc + split, width);
  float cb = coverage(lc - split, width);

  float fw = max(fwidth(lc), 1e-5);
  float dist = abs(fract(lc + 0.5) - 0.5) / fw;
  float crowd = smoothstep(0.2, 0.55, fw);
  float halo = exp(-dist / (3.0 + uGlow * 9.0)) * (1.0 - crowd) * uGlow * lit * 1.15;

  float base = 0.11 * reveal;
  float level = (base + lit * (1.0 - base)) * thread * uBrightness;

  vec3 tone = mix(uColor1, uColor2, smoothstep(0.05, 0.75, lit));
  tone = mix(tone, uColor3, hot);
  vec3 haloTone = mix(uColor1, uColor2, 0.65);

  float vx = smoother((1.0 - abs(uv.x / (uResolution.x / uResolution.y))) / 0.6);
  float vy = smoother((1.0 - abs(uv.y)) / 0.6);
  float vignette = mix(1.0, vx * vy, uVignette);

  vec3 cover3 = vec3(cr, cg, cb);
  float alphaLine = max(max(cr, cg), cb) * level;
  vec3 colLine = tone * cover3 * level;

  float grain = (hash(gl_FragCoord.xy + fract(uTime) * 91.7) - 0.5) * uGrain;
  float scan = 1.0 - uScanline * 0.55 * (0.5 + 0.5 * cos(gl_FragCoord.y * 6.2831853 / (3.0 * uRatio)));

  if (uLightMode > 0.5) {
    float ink = clamp(alphaLine * vignette * scan, 0.0, 1.0);
    float wash = clamp(halo * 0.28 * vignette, 0.0, 1.0);
    float alpha = clamp(ink + wash * (1.0 - ink) + grain * 0.5 * ink, 0.0, 1.0) * uOpacity;
    vec3 col = (tone * ink + haloTone * wash * (1.0 - ink)) / max(ink + wash * (1.0 - ink), 1e-4);
    fragColor = vec4(col * alpha, alpha);
    return;
  }

  vec3 col = (colLine + haloTone * halo) * vignette * scan;
  float alpha = clamp(max(alphaLine, halo) * vignette * scan + grain * max(alphaLine, 0.04), 0.0, 1.0);
  col = clamp(col + grain * 0.6 * alpha, 0.0, 1.0);
  col = min(col, vec3(alpha));
  fragColor = vec4(col * uOpacity, alpha * uOpacity);
}`,M=(n,l,u)=>Math.min(u,Math.max(l,n)),ae=(n,l,u)=>{const i=n.createShader(l);return i?(n.shaderSource(i,u),n.compileShader(i),n.getShaderParameter(i,n.COMPILE_STATUS)?i:(n.deleteShader(i),null)):null},Oe=n=>{const l=ae(n,n.VERTEX_SHADER,De),u=ae(n,n.FRAGMENT_SHADER,Ne),i=n.createProgram();if(!l||!u||!i)return null;if(n.attachShader(i,l),n.attachShader(i,u),n.linkProgram(i),n.deleteShader(l),n.deleteShader(u),!n.getProgramParameter(i,n.LINK_STATUS))return n.deleteProgram(i),null;const b={},W=n.getProgramParameter(i,n.ACTIVE_UNIFORMS);for(let E=0;E<W;E++){const F=n.getActiveUniform(i,E);F&&(b[F.name.replace(/\[0\]$/,"")]=n.getUniformLocation(i,F.name))}return{program:i,uniforms:b}},V=n=>{let l=String(n||"#ffffff").replace("#","").trim();(l.length===3||l.length===4)&&(l=l.slice(0,3).split("").map(i=>i+i).join(""));const u=parseInt(l.slice(0,6),16);return Number.isNaN(u)?[1,1,1]:[(u>>16&255)/255,(u>>8&255)/255,(u&255)/255]},ke=({color1:n="#5227FF",color2:l="#FF9FFC",color3:u="#FFFFFF",speed:i=.5,sweepSpeed:b=.25,sweepWidth:W=1.6,trail:E=.5,reverse:F=!1,scale:le=1.5,frequency:ue=2,ripple:ce=.22,bandDensity:se=11,lineWidth:fe=1.2,glow:me=.6,scanDirection:de="vertical",colorSpread:he=.7,brightness:pe=1,vignette:ve=.3,scanline:xe=!0,scanlineIntensity:ge=.5,grain:we=!0,grainIntensity:ye=.04,opacity:Se=1,mouseInteraction:Me=!0,mouseRadius:Re=.5,mouseStrength:be=.7,mouseMode:Ee="repel",clickEffect:Fe="ping",intro:Le=!0,lightMode:Ce=!1,dpr:Ae,className:Ie="",style:Pe})=>{const q=S.useRef(null),B=S.useRef(null),L=S.useRef(null),U={color1:n,color2:l,color3:u,speed:i,sweepSpeed:F?-b:b,sweepWidth:Math.max(.05,W),trail:M(E,0,1),scale:Math.max(.05,le),frequency:ue,ripple:ce,bandDensity:Math.max(.5,se),lineWidth:Math.max(.2,fe),glow:Math.max(0,me),direction:_e[de]??0,colorSpread:M(he,0,1),brightness:Math.max(0,pe),vignette:M(ve,0,1),scanline:xe?M(ge,0,1):0,grain:we?Math.max(0,ye):0,opacity:M(Se,0,1),mouseInteraction:Me,mouseRadius:Math.max(.05,Re),mouseStrength:Math.max(0,be),attract:Ee==="attract",clickEffect:Fe,intro:Le,lightMode:Ce,dpr:Ae},x=S.useRef(U);return x.current=U,S.useEffect(()=>{var ie;const h=q.current,f=B.current,e=f==null?void 0:f.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!h||!f||!e)return;const P=Oe(e);if(!P)return;const o=P.uniforms,z=e.createVertexArray(),T=((ie=window.matchMedia)==null?void 0:ie.call(window,"(prefers-reduced-motion: reduce)").matches)??!1,c={width:1,height:1,ratio:1},v={x:0,y:0,inside:!1},m={x:0,y:0,ready:!1},p=new Float32Array(R*3);for(let t=0;t<R;t++)p[t*3+2]=-1;let C=0,_=0,H=0,j=-.39,X=0,A=x.current.intro&&!T?0:1,I=0,D=0,N=!0,O=0;const k=(t,r)=>[(t*2-c.width)/c.height,(c.height-r*2)/c.height],$=()=>{const t=x.current;e.viewport(0,0,f.width,f.height),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.useProgram(P.program),e.uniform2f(o.uResolution,f.width,f.height),e.uniform1f(o.uWave,H),e.uniform1f(o.uSweep,j),e.uniform1f(o.uSweepWidth,t.sweepWidth),e.uniform1f(o.uTrail,t.trail),e.uniform1f(o.uScale,t.scale),e.uniform1f(o.uFrequency,t.frequency),e.uniform1f(o.uRipple,t.ripple),e.uniform1f(o.uDensity,t.bandDensity),e.uniform1f(o.uLineWidth,t.lineWidth*c.ratio),e.uniform1f(o.uGlow,t.glow),e.uniform1f(o.uDirection,t.direction),e.uniform1f(o.uSpread,t.colorSpread),e.uniform1f(o.uBrightness,t.brightness),e.uniform1f(o.uVignette,t.vignette),e.uniform1f(o.uOpacity,t.opacity),e.uniform1f(o.uScanline,t.scanline),e.uniform1f(o.uRatio,c.ratio),e.uniform1f(o.uGrain,t.grain),e.uniform1f(o.uTime,X),e.uniform2f(o.uMouse,m.x,m.y),e.uniform1f(o.uPresence,t.mouseInteraction?_:0),e.uniform1f(o.uMouseRadius,t.mouseRadius),e.uniform1f(o.uMouseStrength,t.mouseStrength),e.uniform1f(o.uAttract,t.attract?1:0),e.uniform3fv(o.uPings,p),e.uniform1f(o.uIntro,A),e.uniform1f(o.uLightMode,t.lightMode?1:0),e.uniform3fv(o.uColor1,V(t.color1)),e.uniform3fv(o.uColor2,V(t.color2)),e.uniform3fv(o.uColor3,V(t.color3)),e.enable(e.BLEND),e.blendFunc(e.ONE,e.ONE_MINUS_SRC_ALPHA),e.bindVertexArray(z),e.drawArrays(e.TRIANGLES,0,3)};let K=x.current.dpr;const G=()=>{const t=x.current;K=t.dpr,c.width=Math.max(1,h.clientWidth),c.height=Math.max(1,h.clientHeight),c.ratio=Math.min(t.dpr||window.devicePixelRatio||1,2),f.width=Math.max(1,Math.round(c.width*c.ratio)),f.height=Math.max(1,Math.round(c.height*c.ratio)),$(),g()},Y=t=>{if(I=0,!N||document.hidden)return;const r=x.current;r.dpr!==K&&G();const a=D?M((t-D)/1e3,0,1/20):1/60;D=t,X+=a,T||(H+=a*r.speed,j+=a*r.sweepSpeed),A<1&&(A=Math.min(1,A+a/Te));const s=k(v.x,v.y),w=1-Math.exp(-a/.09);m.x+=(s[0]-m.x)*w,m.y+=(s[1]-m.y)*w,_+=((v.inside&&r.mouseInteraction?1:0)-_)*(1-Math.exp(-a/.3));let y=!T&&(r.speed!==0||r.sweepSpeed!==0)||A<1||_>.001;for(let d=0;d<R;d++)p[d*3+2]<0||(p[d*3+2]+=a,p[d*3+2]>4?p[d*3+2]=-1:y=!0);$(),O=y?0:O+a,O<.5&&(I=requestAnimationFrame(Y))};function g(){O=0,!I&&N&&!document.hidden&&(D=0,I=requestAnimationFrame(Y))}const J=t=>{const r=h.getBoundingClientRect(),a=t.clientX-r.left,s=t.clientY-r.top;return{x:a,y:s,inside:a>=0&&s>=0&&a<=r.width&&s<=r.height}},Q=t=>{const{x:r,y:a,inside:s}=J(t),w=v.inside;if(v.inside=s,s&&(v.x=r,v.y=a,!w||!m.ready)){const[y,d]=k(r,a);m.x=y,m.y=d,m.ready=!0}(s||w)&&g()},Z=t=>{if(x.current.clickEffect!=="ping"||T)return;const{x:a,y:s,inside:w}=J(t);if(!w)return;const[y,d]=k(a,s);p[C*3]=y,p[C*3+1]=d,p[C*3+2]=0,C=(C+1)%R,g()},ee=()=>{v.inside=!1,g()},te=()=>g(),oe=new ResizeObserver(G);oe.observe(h);const ne=new IntersectionObserver(t=>{N=t.some(r=>r.isIntersecting),N&&g()});return ne.observe(h),window.addEventListener("pointermove",Q,{passive:!0}),window.addEventListener("pointerdown",Z,{passive:!0}),document.documentElement.addEventListener("pointerleave",ee),document.addEventListener("visibilitychange",te),G(),L.current=g,()=>{var t;cancelAnimationFrame(I),L.current=null,oe.disconnect(),ne.disconnect(),window.removeEventListener("pointermove",Q),window.removeEventListener("pointerdown",Z),document.documentElement.removeEventListener("pointerleave",ee),document.removeEventListener("visibilitychange",te),e.deleteVertexArray(z),e.deleteProgram(P.program),(t=e.getExtension("WEBGL_lose_context"))==null||t.loseContext()}},[]),S.useEffect(()=>{var h;(h=L.current)==null||h.call(L)}),re.jsx("div",{ref:q,className:`scanner-container ${Ie}`.trim(),style:Pe,children:re.jsx("canvas",{ref:B,className:"scanner-canvas","aria-hidden":"true"})})};export{ke as default};
