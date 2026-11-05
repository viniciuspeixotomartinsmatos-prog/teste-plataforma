import{a as b,j as le}from"./index-DrbxZl7q.js";const k=12,Ee={lines:0,dots:1,cross:2},be=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,Le=`#version 300 es
precision highp float;
uniform vec2 uView;
uniform float uRatio;
uniform float uCell;
uniform float uLineWidth;
uniform float uGlow;
uniform float uTilt;
uniform float uFocal;
uniform vec2 uTurn;
uniform vec4 uRipples[${k}];
uniform int uRippleCount;
uniform float uWaveLength;
uniform float uWaveSpeed;
uniform float uStrength;
uniform vec3 uPointer;
uniform vec3 uColor;
uniform vec3 uInk;
uniform float uPresence;
uniform float uReveal;
uniform float uFade;
uniform float uOpacity;
uniform float uLightMode;
uniform int uVariant;
out vec4 outColor;

float smootherstep(float edge, float x) {
  float t = clamp(x / max(edge, 0.0001), 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  vec2 css = gl_FragCoord.xy / uRatio;
  vec2 screen = vec2(css.x - uView.x * 0.5, uView.y * 0.5 - css.y);
  vec2 plane = screen;
  float horizon = 1.0;
  if (uTilt > 0.0001) {
    float depth = uFocal + screen.y * tan(uTilt);
    horizon = smoothstep(0.0, uFocal * 0.35, depth);
    float scale = uFocal / max(depth, 0.001);
    plane = vec2(screen.x * scale, screen.y * scale / cos(uTilt));
  }

  vec2 push = vec2(0.0);
  float lift = 0.0;
  for (int i = 0; i < ${k}; i++) {
    if (i >= uRippleCount) break;
    vec4 ripple = uRipples[i];
    vec2 delta = plane - ripple.xy;
    float dist = length(delta);
    float x = (dist - ripple.z * uWaveSpeed) / uWaveLength;
    float packet = exp(-x * x * 1.8);
    float spread = 1.0 / (1.0 + dist / (uWaveLength * 5.0));
    float calm = smoothstep(0.0, uWaveLength * 0.9, dist);
    float wave = sin(x * 6.28318) * packet * spread * calm * ripple.w;
    push += (dist > 0.001 ? delta / dist : vec2(0.0)) * wave;
    lift += wave;
  }

  vec2 bent = plane + push * uStrength * uCell * 0.22;
  vec2 grid = mat2(uTurn.x, uTurn.y, -uTurn.y, uTurn.x) * bent / uCell;
  vec2 fw = max(fwidth(grid), vec2(0.00001));
  vec2 offset = abs(fract(grid - 0.5) - 0.5);
  vec2 dist = offset / fw;
  float width = max(uLineWidth * uRatio, 1.0);
  float thin = min(uLineWidth * uRatio, 1.0);
  float shape = 0.0;
  float edge = min(dist.x, dist.y);
  if (uVariant == 1) {
    edge = length(dist);
    shape = (1.0 - smoothstep(width * 1.7 - 0.5, width * 1.7 + 0.5, edge)) * thin * 1.8;
  } else if (uVariant == 2) {
    float arm = 0.16;
    vec2 cover = (1.0 - smoothstep(width * 0.5 - 0.5, width * 0.5 + 0.5, dist)) * thin;
    vec2 reach = 1.0 - smoothstep(arm - fw * 0.5, arm + fw * 0.5, offset);
    shape = max(cover.x * reach.y, cover.y * reach.x);
    edge = max(min(dist.x, dist.y), length(max(offset - arm, 0.0) / fw));
  } else {
    vec2 cover = (1.0 - smoothstep(width * 0.5 - 0.5, width * 0.5 + 0.5, dist)) * thin;
    shape = max(cover.x, cover.y);
  }
  float halo = exp(-edge / (uRatio * 2.4)) * uGlow;
  float far = 1.0 - smoothstep(0.18, 0.5, max(fw.x, fw.y));

  vec2 toPointer = (plane - uPointer.xy) / (uCell * 3.2);
  float near = uPointer.z * exp(-dot(toPointer, toPointer));
  float shine = max(1.0 + lift * 3.4 * uStrength, 0.25) * (1.0 + near * 1.6);

  float radius = length(plane);
  float reveal = 1.0 - smoothstep(uReveal - uCell * 4.0, uReveal, radius);
  vec2 uv = gl_FragCoord.xy / (uView * uRatio);
  float edgeFade = uFade * 0.5;
  float mask = smootherstep(edgeFade, uv.x) * smootherstep(edgeFade, 1.0 - uv.x) * smootherstep(edgeFade, uv.y) * smootherstep(edgeFade, 1.0 - uv.y);
  mask *= horizon * far * reveal * uPresence * uOpacity;

  float level = (shape * 0.26 + halo * 0.1) * shine * mask;
  float dither = (hash(gl_FragCoord.xy) - 0.5) / 255.0;
  if (uLightMode > 0.5) {
    float alpha = clamp(level * 1.2 + dither, 0.0, 1.0);
    outColor = vec4(uInk * alpha, alpha);
  } else {
    float alpha = clamp(level + dither, 0.0, 1.0);
    vec3 color = mix(uColor, vec3(1.0), clamp(level - 0.7, 0.0, 1.0));
    outColor = vec4(color * alpha, alpha);
  }
}`,Fe=1.6,U=(n,v,g)=>Math.min(g,Math.max(v,n)),ce=(n,v,g)=>{const l=n.createShader(v);return l?(n.shaderSource(l,g),n.compileShader(l),n.getShaderParameter(l,n.COMPILE_STATUS)?l:(n.deleteShader(l),null)):null},Ce=n=>{const v=ce(n,n.VERTEX_SHADER,be),g=ce(n,n.FRAGMENT_SHADER,Le),l=n.createProgram();if(!v||!g||!l)return null;if(n.attachShader(l,v),n.attachShader(l,g),n.bindAttribLocation(l,0,"aPosition"),n.linkProgram(l),n.deleteShader(v),n.deleteShader(g),!n.getProgramParameter(l,n.LINK_STATUS))return n.deleteProgram(l),null;const V={},N=n.getProgramParameter(l,n.ACTIVE_UNIFORMS);for(let L=0;L<N;L++){const F=n.getActiveUniform(l,L);F&&(V[F.name.replace("[0]","")]=n.getUniformLocation(l,F.name))}return{program:l,uniforms:V}},Ie=({color:n="#ffffff",variant:v="lines",cellSize:g=48,lineWidth:l=1,glow:V=.6,rippleStrength:N=1,rippleSpeed:L=1,rippleSize:F=1,autoRipple:ue="center",rippleInterval:fe=2.6,tilt:he=0,rotation:de=0,mouseInteraction:pe=!0,clickRipple:me=!0,intro:ve=!0,fade:ge=.5,opacity:xe=1,lightMode:we=!1,paused:Re=!1,dpr:Me,className:j="",...ye})=>{const $=b.useRef(null),q=b.useRef(null),C=b.useRef(null),H={color:String(n),variant:Ee[v]??0,cellSize:Math.max(8,g),lineWidth:Math.max(.25,l),glow:Math.max(0,V),rippleStrength:Math.max(0,N),rippleSpeed:Math.max(.05,L),rippleSize:Math.max(.2,F),autoRipple:ue,rippleInterval:Math.max(.3,fe),tilt:U(he,0,80),rotation:de,mouseInteraction:pe,clickRipple:me,intro:ve,fade:U(ge,0,1),opacity:U(xe,0,1),lightMode:we,paused:Re,dpr:Me},p=b.useRef(H);return p.current=H,b.useEffect(()=>{var ae;const m=$.current,x=q.current,e=x==null?void 0:x.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!m||!x||!e)return;const W=Ce(e);if(!W)return;const a=W.uniforms,K=e.createBuffer(),X=e.createVertexArray();e.bindVertexArray(X),e.bindBuffer(e.ARRAY_BUFFER,K),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0);const P=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),w=((ae=window.matchMedia)==null?void 0:ae.call(window,"(prefers-reduced-motion: reduce)").matches)??!1,B=new Map,Se=t=>{if(B.has(t))return B.get(t);let o=[1,1,1];if(P){P.clearRect(0,0,1,1),P.fillStyle="#ffffff",P.fillStyle=t,P.fillRect(0,0,1,1);const[r,s,i]=P.getImageData(0,0,1,1).data;o=[r,s,i].map(u=>Math.pow(u/255,2.2))}return B.set(t,o),o},d={width:1,height:1,ratio:1},f={x:0,y:0,inside:!1,planeX:0,planeY:0,travel:0},c={clock:0,intro:p.current.intro&&!w?0:1,glow:0,nextAuto:.4},R=[],T=new Float32Array(k*4);let y=0,E=0,z=!0;const J=()=>d.height*1.15,D=(t,o)=>{const r=p.current,s=t-d.width/2,i=o-d.height/2,u=r.tilt*Math.PI/180;if(u<=1e-4)return[s,i];const h=J(),M=h+i*Math.tan(u);if(M<=h*.05)return null;const _=h/M;return[s*_,i*_/Math.cos(u)]},I=(t,o,r)=>{R.push({x:t,y:o,born:c.clock,strength:r}),R.length>k&&R.shift()},G=()=>{const t=p.current,o=c.intro*c.intro*(3-2*c.intro),r=t.cellSize*2.4*t.rippleSize,s=240*t.rippleSpeed;let i=0;for(let A=R.length-1;A>=0&&i<k;A--){const O=R[A],se=c.clock-O.born;T[i*4]=O.x,T[i*4+1]=O.y,T[i*4+2]=se,T[i*4+3]=O.strength*Math.exp(-se*.55),i++}const u=t.rotation*Math.PI/180,h=Se(t.color),M=.2126*h[0]+.7152*h[1]+.0722*h[2],_=Math.min(1,.12/Math.max(M,.001)),Ae=h.map(A=>Math.pow(Math.min(1,A*_),1/2.2)),Pe=Math.hypot(d.width,d.height);e.bindVertexArray(X),e.viewport(0,0,x.width,x.height),e.useProgram(W.program),e.uniform2f(a.uView,d.width,d.height),e.uniform1f(a.uRatio,d.ratio),e.uniform1f(a.uCell,t.cellSize),e.uniform1f(a.uLineWidth,t.lineWidth),e.uniform1f(a.uGlow,t.glow),e.uniform1f(a.uTilt,t.tilt*Math.PI/180),e.uniform1f(a.uFocal,J()),e.uniform2f(a.uTurn,Math.cos(u),Math.sin(u)),e.uniform4fv(a.uRipples,T),e.uniform1i(a.uRippleCount,i),e.uniform1f(a.uWaveLength,r),e.uniform1f(a.uWaveSpeed,s),e.uniform1f(a.uStrength,t.rippleStrength),e.uniform3f(a.uPointer,f.planeX,f.planeY,c.glow),e.uniform3fv(a.uColor,h.map(A=>Math.pow(A,1/2.2))),e.uniform3fv(a.uInk,Ae),e.uniform1f(a.uPresence,Math.min(1,o*1.6)),e.uniform1f(a.uReveal,t.intro&&!w?o*Pe*1.4+t.cellSize*4:1e6),e.uniform1f(a.uFade,t.fade),e.uniform1f(a.uOpacity,t.opacity),e.uniform1f(a.uLightMode,t.lightMode?1:0),e.uniform1i(a.uVariant,t.variant),e.drawArrays(e.TRIANGLES,0,3)},Q=t=>{if(y=0,!z||document.hidden)return;const o=p.current,r=E?Math.min(.05,(t-E)/1e3):1/60;E=t;const s=!o.paused&&!w;if(s&&(c.clock+=r),!o.intro||w?c.intro=1:c.intro<1&&(c.intro=Math.min(1,c.intro+r/Fe)),s&&o.autoRipple!=="none"&&c.clock>=c.nextAuto){if(o.autoRipple==="random"){const M=D(Math.random()*d.width,d.height*(.2+Math.random()*.7));M&&I(M[0],M[1],.75)}else I(0,0,1);c.nextAuto=c.clock+o.rippleInterval}const i=9/Math.max(.2,o.rippleSpeed);for(;R.length&&c.clock-R[0].born>i;)R.shift();const u=o.mouseInteraction&&f.inside&&!w;c.glow+=((u?1:0)-c.glow)*(1-Math.exp(-r*(u?6:2.5))),G();const h=c.intro<1||Math.abs((u?1:0)-c.glow)>.002;s||h?y=requestAnimationFrame(Q):E=0},S=()=>{!y&&z&&!document.hidden&&(y=requestAnimationFrame(Q))},Y=()=>{const t=p.current,o=Math.max(1,m.clientWidth),r=Math.max(1,m.clientHeight),s=Math.min(t.dpr||window.devicePixelRatio||1,2);d.width=o,d.height=r,x.width=Math.max(1,Math.round(o*s)),x.height=Math.max(1,Math.round(r*s)),d.ratio=x.width/o,y||G(),S()},Z=t=>{const o=m.getBoundingClientRect(),r=t.clientX-o.left,s=t.clientY-o.top;f.inside=r>=0&&s>=0&&r<=o.width&&s<=o.height;const i=f.inside?D(r,s):null;if(i){const u=p.current,h=Math.hypot(i[0]-f.planeX,i[1]-f.planeY);f.planeX=i[0],f.planeY=i[1],u.mouseInteraction&&!w&&h<u.cellSize*6&&(f.travel+=h,f.travel>u.cellSize*1.6&&(f.travel=0,I(i[0],i[1],.32)))}else f.inside=!1;f.x=r,f.y=s,S()},ee=t=>{if(!p.current.clickRipple||w)return;const r=m.getBoundingClientRect(),s=t.clientX-r.left,i=t.clientY-r.top;if(s<0||i<0||s>r.width||i>r.height)return;const u=D(s,i);u&&I(u[0],u[1],1.2),S()},te=()=>{f.inside=!1,S()},oe=()=>{E=0,S()},ne=new ResizeObserver(Y);ne.observe(m);const ie=new IntersectionObserver(t=>{z=t.some(o=>o.isIntersecting),z&&(E=0,S())});ie.observe(m),window.addEventListener("pointermove",Z,{passive:!0}),window.addEventListener("pointerdown",ee,{passive:!0}),document.documentElement.addEventListener("pointerleave",te),document.addEventListener("visibilitychange",oe),p.current.intro&&!w&&I(0,0,1.1),Y();let re=p.current.dpr;return C.current=()=>{const t=p.current;if(t.dpr!==re){re=t.dpr,Y();return}y||G(),S()},()=>{var t;cancelAnimationFrame(y),C.current=null,ne.disconnect(),ie.disconnect(),window.removeEventListener("pointermove",Z),window.removeEventListener("pointerdown",ee),document.documentElement.removeEventListener("pointerleave",te),document.removeEventListener("visibilitychange",oe),e.deleteProgram(W.program),e.deleteBuffer(K),e.deleteVertexArray(X),(t=e.getExtension("WEBGL_lose_context"))==null||t.loseContext()}},[]),b.useEffect(()=>{var m;(m=C.current)==null||m.call(C)}),le.jsx("div",{ref:$,className:`ripple-grid-container${j?` ${j}`:""}`,...ye,children:le.jsx("canvas",{ref:q,className:"ripple-grid-canvas","aria-hidden":"true"})})};export{Ie as RippleGrid,Ie as default};
