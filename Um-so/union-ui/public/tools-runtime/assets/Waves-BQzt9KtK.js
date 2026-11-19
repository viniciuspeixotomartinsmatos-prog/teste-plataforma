import{a as B,j as je}from"./index-DrbxZl7q.js";const ht={solid:0,dashed:1},L=12,vt=4,dt=2.2,He=640,Ee=64,pt=Ee*Math.sqrt(Math.PI/2)/He,ze=16e5,xt=`#version 300 es
precision highp float;
precision highp int;
uniform vec2 uView;
uniform float uRatio;
uniform vec2 uAxis;
uniform float uSpacing;
uniform float uStep;
uniform vec2 uStart;
uniform float uAmplitude;
uniform vec2 uFrequency;
uniform vec2 uDrift;
uniform float uTwist;
uniform uint uSeed;
uniform sampler2D uField;
uniform ivec2 uFieldSize;
uniform float uCell;
uniform float uLimit;
uniform float uReach;
uniform float uReveal;
uniform float uBand;
out float vAcross;
out float vAlong;
out float vEnergy;
out float vShow;
out float vPhase;

const vec2 GRADIENTS[12] = vec2[12](
  vec2(1.0, 1.0), vec2(-1.0, 1.0), vec2(1.0, -1.0), vec2(-1.0, -1.0),
  vec2(1.0, 0.0), vec2(-1.0, 0.0), vec2(1.0, 0.0), vec2(-1.0, 0.0),
  vec2(0.0, 1.0), vec2(0.0, -1.0), vec2(0.0, 1.0), vec2(0.0, -1.0)
);

vec2 gradient(vec2 cell) {
  uvec2 q = uvec2(ivec2(cell) + 65536) + uvec2(uSeed * 7919u, uSeed * 104729u);
  q = 1103515245u * ((q >> 1u) ^ q.yx);
  uint n = 1103515245u * (q.x ^ (q.y >> 3u));
  return GRADIENTS[(n >> 16u) % 12u];
}

float ease(float t) {
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

float perlin(vec2 p) {
  vec2 i = floor(p);
  vec2 f = p - i;
  float n00 = dot(gradient(i), f);
  float n10 = dot(gradient(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
  float n01 = dot(gradient(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
  float n11 = dot(gradient(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));
  vec2 u = vec2(ease(f.x), ease(f.y));
  return mix(mix(n00, n10, u.x), mix(n01, n11, u.x), u.y);
}

vec2 node(ivec2 cell) {
  return texelFetch(uField, clamp(cell, ivec2(0), uFieldSize - 1), 0).xy;
}

void weights(float f, out vec4 w, out vec4 d) {
  float g = 1.0 - f;
  float f2 = f * f;
  float f3 = f2 * f;
  w = vec4(g * g * g, 3.0 * f3 - 6.0 * f2 + 4.0, -3.0 * f3 + 3.0 * f2 + 3.0 * f + 1.0, f3) / 6.0;
  d = vec4(-g * g, 3.0 * f2 - 4.0 * f, -3.0 * f2 + 2.0 * f + 1.0, f2) * 0.5;
}

vec2 field(vec2 point, out mat2 slope) {
  vec2 t = point / uCell;
  vec2 base = floor(t);
  vec2 f = t - base;
  vec4 wx;
  vec4 dx;
  vec4 wy;
  vec4 dy;
  weights(f.x, wx, dx);
  weights(f.y, wy, dy);
  ivec2 origin = ivec2(base) - 1;
  vec2 value = vec2(0.0);
  vec2 alongX = vec2(0.0);
  vec2 alongY = vec2(0.0);
  for (int j = 0; j < 4; j++) {
    vec2 row = vec2(0.0);
    vec2 rowSlope = vec2(0.0);
    for (int i = 0; i < 4; i++) {
      vec2 tap = node(origin + ivec2(i, j));
      row += tap * wx[i];
      rowSlope += tap * dx[i];
    }
    value += row * wy[j];
    alongX += rowSlope * wy[j];
    alongY += row * dy[j];
  }
  float size = length(value);
  float scale = size > 0.0001 ? uLimit * tanh(size / uLimit) / size : 1.0;
  slope = mat2(alongX, alongY) * (scale / uCell);
  return value * scale;
}

vec2 wave(vec2 rest) {
  float turn = perlin(rest * uFrequency + uDrift) * 12.0 * uTwist;
  vec2 local = rest + vec2(cos(turn), sin(turn) * 0.5) * uAmplitude;
  return uView * 0.5 + vec2(local.x * uAxis.x - local.y * uAxis.y, local.x * uAxis.y + local.y * uAxis.x);
}

void main() {
  int index = gl_VertexID >> 1;
  float side = float(gl_VertexID & 1) * 2.0 - 1.0;
  float u = uStart.x + float(gl_InstanceID) * uSpacing;
  float v = uStart.y + float(index) * uStep;
  vec2 flowing = wave(vec2(u, v));
  vec2 bend = wave(vec2(u, v + uStep)) - wave(vec2(u, v - uStep));
  mat2 slope;
  vec2 shift = field(flowing, slope);
  vec2 point = flowing + shift;
  float energy = length(shift);
  vec2 tangent = bend + slope * bend;
  float span = max(length(tangent), 0.0001);
  vec2 normal = vec2(-tangent.y, tangent.x) / span;
  vec2 corner = point + normal * side * uReach / uRatio;
  vAcross = side * uReach;
  vAlong = v;
  vEnergy = energy;
  vShow = clamp((uReveal - abs(u)) / uBand, 0.0, 1.0);
  uint line = uint(gl_InstanceID) * 747796405u + uSeed * 2891336453u + 1u;
  line = ((line >> ((line >> 28u) + 4u)) ^ line) * 277803737u;
  vPhase = float((line >> 22u) ^ line) / 4294967295.0;
  vec2 clip = corner / uView * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
}`,gt=`#version 300 es
precision highp float;
uniform vec2 uView;
uniform float uRatio;
uniform float uHalf;
uniform float uThin;
uniform int uStyle;
uniform float uPeriod;
uniform float uFlow;
uniform vec3 uColor;
uniform vec3 uAccent;
uniform float uBase;
uniform float uHeat;
uniform float uFade;
uniform float uOpacity;
in float vAcross;
in float vAlong;
in float vEnergy;
in float vShow;
in float vPhase;
out vec4 outColor;

float smootherstep(float edge, float x) {
  float t = clamp(x / max(edge, 0.0001), 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

void main() {
  float coverage = clamp(uHalf + 0.5 - abs(vAcross), 0.0, 1.0) * uThin;
  if (uStyle == 1) {
    float phase = (vAlong + uFlow) / uPeriod + vPhase;
    float blur = max(fwidth(phase), 0.0001);
    coverage *= clamp((0.25 - abs(fract(phase) - 0.5)) / blur + 0.5, 0.0, 1.0);
  }
  float heat = smoothstep(0.0, uHeat, vEnergy);
  vec2 uv = gl_FragCoord.xy / (uView * uRatio);
  float edge = uFade * 0.5;
  float mask = smootherstep(edge, uv.x) * smootherstep(edge, 1.0 - uv.x) * smootherstep(edge, uv.y) * smootherstep(edge, 1.0 - uv.y);
  float alpha = coverage * mix(uBase, 1.0, heat) * mask * vShow * uOpacity;
  outColor = vec4(mix(uColor, uAccent, heat) * alpha, alpha);
}`,T=(a,f,R)=>Math.min(R,Math.max(f,a)),ye=a=>{const f=T(a,0,1);return f*f*f*(f*(f*6-15)+10)},Be=(a,f,R)=>{const u=a.createShader(f);return u?(a.shaderSource(u,R),a.compileShader(u),a.getShaderParameter(u,a.COMPILE_STATUS)?u:(a.deleteShader(u),null)):null},wt=a=>{const f=Be(a,a.VERTEX_SHADER,xt),R=Be(a,a.FRAGMENT_SHADER,gt),u=a.createProgram();if(!f||!R||!u)return null;if(a.attachShader(u,f),a.attachShader(u,R),a.linkProgram(u),a.deleteShader(f),a.deleteShader(R),!a.getProgramParameter(u,a.LINK_STATUS))return a.deleteProgram(u),null;const te={},le=a.getProgramParameter(u,a.ACTIVE_UNIFORMS);for(let H=0;H<le;H++){const k=a.getActiveUniform(u,H);k&&(te[k.name]=a.getUniformLocation(u,k.name))}return{program:u,uniforms:te}},Et=({lineColor:a="#ffffff",accentColor:f,backgroundColor:R="transparent",lineStyle:u="solid",spacing:te=10,lineWidth:le=1,rotation:H=0,amplitude:k=32,scale:ke=1,twist:We=1,speed:Ye=1,variation:Ke=0,mouseInteraction:$e=!0,mouseRadius:Je=175,mouseStrength:Qe=1,bounce:Ze=.5,returnDuration:et=1.4,clickRipple:tt=!0,intro:ot=!0,fade:nt=0,opacity:it=1,lightMode:at=!1,paused:rt=!1,dpr:st,className:Me="",style:ct})=>{const Te=B.useRef(null),Re=B.useRef(null),W=B.useRef(null),Se={lineColor:String(a),accentColor:f?String(f):"",lineStyle:ht[u]??0,spacing:Math.max(2,te),lineWidth:Math.max(.25,le),rotation:H,amplitude:Math.max(0,k),scale:Math.max(.05,ke),twist:Math.max(0,We),speed:Ye,variation:Math.max(0,Math.round(Ke)),mouseInteraction:$e,mouseRadius:Math.max(20,Je),mouseStrength:Math.max(0,Qe),bounce:T(Ze,0,1),returnDuration:Math.max(.2,et),clickRipple:tt,intro:ot,fade:T(nt,0,1),opacity:T(it,0,1),lightMode:at,paused:rt,dpr:st},y=B.useRef(Se);return y.current=Se,B.useEffect(()=>{var Oe;const S=Te.current,b=Re.current,e=b==null?void 0:b.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!S||!b||!e)return;const oe=wt(e);if(!oe)return;const r=oe.uniforms,be=e.createVertexArray(),Y=e.createTexture();e.bindTexture(e.TEXTURE_2D,Y),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.pixelStorei(e.UNPACK_ALIGNMENT,1);const q=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),I=((Oe=window.matchMedia)==null?void 0:Oe.call(window,"(prefers-reduced-motion: reduce)").matches)??!1,ue=new Map,Ae=t=>{if(ue.has(t))return ue.get(t);let i=[1,1,1];if(q){q.clearRect(0,0,1,1),q.fillStyle="#ffffff",q.fillStyle=t,q.fillRect(0,0,1,1);const[s,l,c]=q.getImageData(0,0,1,1).data;i=[s/255,l/255,c/255]}return ue.set(t,i),i},lt=t=>{const i=t.map(c=>Math.pow(c,2.2)),s=.2126*i[0]+.7152*i[1]+.0722*i[2],l=Math.min(1,.045/Math.max(s,1e-4));return i.map(c=>Math.pow(c*l,1/2.2))},d={width:1,height:1,ratio:1},o={cols:0,rows:0,shift:new Float32Array(0),speed:new Float32Array(0),top:0,bottom:-1,left:0,right:-1},n={x:0,y:0,sx:0,sy:0,vx:0,vy:0,inside:!1},U=[],E={flow:0,intro:y.current.intro&&!I?0:1};let G=0,X=0,ne=!0;const ut=t=>Math.max(12,t.mouseRadius*.5),ft=()=>{o.cols=Math.ceil(d.width/L)+2,o.rows=Math.ceil(d.height/L)+2,o.shift=new Float32Array(o.cols*o.rows*2),o.speed=new Float32Array(o.cols*o.rows*2),o.top=0,o.bottom=-1,o.left=0,o.right=-1,e.bindTexture(e.TEXTURE_2D,Y),e.texImage2D(e.TEXTURE_2D,0,e.RG32F,o.cols,o.rows,0,e.RG,e.FLOAT,o.shift)},_e=(t,i,s,l)=>{const c=T(Math.floor(t/L),0,o.cols-1),h=T(Math.ceil(s/L),0,o.cols-1),A=T(Math.floor(i/L),0,o.rows-1),x=T(Math.ceil(l/L),0,o.rows-1),v=o.bottom<o.top;o.top=v?A:Math.min(o.top,A),o.bottom=v?x:Math.max(o.bottom,x),o.left=v?c:Math.min(o.left,c),o.right=v?h:Math.max(o.right,h)},mt=t=>{const i=y.current,s=1-Math.exp(-t/.045),l=n.sx+(n.x-n.sx)*s,c=n.sy+(n.y-n.sy)*s,h=1-Math.exp(-t/.06);n.vx+=((l-n.sx)/t-n.vx)*h,n.vy+=((c-n.sy)/t-n.vy)*h,n.sx=l,n.sy=c;const A=1-.85*i.bounce,x=4/(A*i.returnDuration),v=i.mouseRadius,_=Math.hypot(n.vx,n.vy),F=i.mouseInteraction&&n.inside&&!I?26e3*Math.tanh(_/1400)*i.mouseStrength:0;F>1&&_e(n.sx-v,n.sy-v,n.sx+v,n.sy+v);const D=[];for(let m=U.length-1;m>=0;m--){const g=U[m];g.age+=t;const C=g.age*He,z=1-C/g.range;if(z<=0){U.splice(m,1);continue}const p=C+Ee*3;_e(g.x-p,g.y-p,g.x+p,g.y+p),D.push({x:g.x,y:g.y,front:C,power:150*x*z*Math.sqrt(z)/pt})}if(o.bottom<o.top)return!1;const K=x*x,$=2*A*x,re=Math.min(16,Math.max(1,Math.ceil(t/Math.min(1/120,.6/x)))),O=t/re,me=_>.001?n.vx/_:0,he=_>.001?n.vy/_:0,{cols:w,shift:P,speed:V,left:j,right:ve}=o;let de=0;for(let m=o.top;m<=o.bottom;m++){const g=m*L;for(let C=j;C<=ve;C++){const z=C*L,p=(m*w+C)*2;let xe=0,ge=0;if(F>1){const M=Math.hypot(z-n.sx,g-n.sy);if(M<v){const Z=ye(1-M/v)*F;xe+=me*Z,ge+=he*Z}}for(const M of D){const Z=z-M.x,qe=g-M.y,ee=Math.hypot(Z,qe),we=(ee-M.front)/Ee;if(ee>.001&&Math.abs(we)<3){const Ge=M.power*Math.exp(-we*we*2)*ye(ee/56);xe+=Z/ee*Ge,ge+=qe/ee*Ge}}let se=P[p],ce=P[p+1],J=V[p],Q=V[p+1];for(let M=0;M<re;M++)J+=(xe-K*se-$*J)*O,Q+=(ge-K*ce-$*Q)*O,se+=J*O,ce+=Q*O;P[p]=se,P[p+1]=ce,V[p]=J,V[p+1]=Q,de=Math.max(de,Math.abs(se)+Math.abs(ce)+(Math.abs(J)+Math.abs(Q))*.05)}}const pe=o.top,Ve=o.bottom-o.top+1;if(de<.02&&F<=1&&!D.length){for(let m=o.top;m<=o.bottom;m++)P.fill(0,(m*w+j)*2,(m*w+ve+1)*2),V.fill(0,(m*w+j)*2,(m*w+ve+1)*2);o.top=0,o.bottom=-1}return e.bindTexture(e.TEXTURE_2D,Y),e.texSubImage2D(e.TEXTURE_2D,0,0,pe,w,Ve,e.RG,e.FLOAT,P.subarray(pe*w*2,(pe+Ve)*w*2)),o.bottom>=o.top},ie=()=>{const t=y.current,i=t.rotation*Math.PI/180,s=Math.cos(i),l=Math.sin(i),c=ut(t),h=t.amplitude*1.1+c+t.spacing*2+8,A=(d.width*Math.abs(s)+d.height*Math.abs(l))/2+h,x=(d.width*Math.abs(l)+d.height*Math.abs(s))/2+h,v=Math.ceil(A/t.spacing),_=v*2+1;let F=vt,D=Math.ceil(x*2/F)+1;_*D*2>ze&&(D=Math.max(16,Math.floor(ze/(_*2))),F=x*2/(D-1));const K=t.lineWidth*d.ratio,$=Math.max(.5,K/2),re=$+1,O=E.intro,me=t.intro&&!I?(1-Math.pow(1-T(O/.7,0,1),3))*A*1.3:1e6,he=t.intro&&!I?ye((O-.1)/.9):1,w=Ae(t.lineColor),P=t.lightMode?lt(w):w,V=t.accentColor?Ae(t.accentColor):P,j=E.flow+t.variation*37.1;e.viewport(0,0,b.width,b.height),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.enable(e.BLEND),e.blendFunc(e.ONE,e.ONE_MINUS_SRC_ALPHA),e.useProgram(oe.program),e.bindVertexArray(be),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,Y),e.uniform1i(r.uField,0),e.uniform2f(r.uView,d.width,d.height),e.uniform1f(r.uRatio,d.ratio),e.uniform2f(r.uAxis,s,l),e.uniform1f(r.uSpacing,t.spacing),e.uniform1f(r.uStep,F),e.uniform2f(r.uStart,-v*t.spacing,-x),e.uniform1f(r.uAmplitude,t.amplitude*he),e.uniform2f(r.uFrequency,.002/t.scale,.0015/t.scale),e.uniform2f(r.uDrift,j*.025,j*.0075),e.uniform1f(r.uTwist,t.twist),e.uniform1ui(r.uSeed,t.variation),e.uniform2i(r.uFieldSize,o.cols,o.rows),e.uniform1f(r.uCell,L),e.uniform1f(r.uLimit,c),e.uniform1f(r.uReach,re),e.uniform1f(r.uReveal,me),e.uniform1f(r.uBand,Math.max(1,A*.3)),e.uniform1f(r.uHalf,$),e.uniform1f(r.uThin,Math.min(1,K)),e.uniform1i(r.uStyle,t.lineStyle),e.uniform1f(r.uPeriod,t.spacing*2.6),e.uniform1f(r.uFlow,E.flow*16%(t.spacing*2.6)),e.uniform3fv(r.uColor,P),e.uniform3fv(r.uAccent,V),e.uniform1f(r.uBase,.62),e.uniform1f(r.uHeat,c*.55),e.uniform1f(r.uFade,t.fade),e.uniform1f(r.uOpacity,t.opacity),e.drawArraysInstanced(e.TRIANGLE_STRIP,0,D*2,_)},Pe=t=>{if(G=0,!ne||document.hidden)return;const i=y.current,s=X?T((t-X)/1e3,5e-4,.05):1/60;if(X=t,i.paused){E.intro=1,ie(),X=0;return}I||(E.flow+=s*i.speed),!i.intro||I?E.intro=1:E.intro<1&&(E.intro=Math.min(1,E.intro+s/dt));const l=mt(s);ie();const c=n.inside&&i.mouseInteraction&&Math.hypot(n.vx,n.vy)>1;!I||l||c||U.length||E.intro<1?G=requestAnimationFrame(Pe):X=0},N=()=>{!G&&ne&&!document.hidden&&(G=requestAnimationFrame(Pe))},fe=()=>{const t=y.current,i=Math.max(1,S.clientWidth),s=Math.max(1,S.clientHeight),l=Math.min(t.dpr||window.devicePixelRatio||1,2);d.width=i,d.height=s,b.width=Math.max(1,Math.round(i*l)),b.height=Math.max(1,Math.round(s*l)),d.ratio=b.width/i,ft(),ie(),N()},Le=(t,i)=>{const s=S.getBoundingClientRect(),l=t.clientX-s.left,c=t.clientY-s.top,h=l>=0&&c>=0&&l<=s.width&&c<=s.height;return(i||h&&!n.inside)&&(n.sx=l,n.sy=c,n.vx=0,n.vy=0),n.inside=h,n.x=l,n.y=c,{x:l,y:c,rect:s,inside:h}},Ie=t=>{Le(t,!1),y.current.paused||N()},Fe=t=>{const i=y.current,{x:s,y:l,rect:c,inside:h}=Le(t,t.pointerType!=="mouse");h&&i.clickRipple&&!i.paused&&!I&&(U.push({x:s,y:l,age:0,range:Math.max(360,Math.hypot(c.width,c.height)*.55)}),U.length>6&&U.shift()),N()},ae=t=>{t.pointerType!=="mouse"&&(n.inside=!1)},De=()=>{n.inside=!1,N()},Ce=()=>{X=0,N()},Ue=new ResizeObserver(fe);Ue.observe(S);const Xe=new IntersectionObserver(t=>{ne=t.some(i=>i.isIntersecting),ne&&(X=0,N())});Xe.observe(S),window.addEventListener("pointermove",Ie,{passive:!0}),window.addEventListener("pointerdown",Fe,{passive:!0}),window.addEventListener("pointerup",ae,{passive:!0}),window.addEventListener("pointercancel",ae,{passive:!0}),document.documentElement.addEventListener("pointerleave",De),document.addEventListener("visibilitychange",Ce),fe();let Ne=y.current.dpr;return W.current=()=>{const t=y.current;if(t.dpr!==Ne){Ne=t.dpr,fe();return}G||ie(),N()},()=>{var t;cancelAnimationFrame(G),W.current=null,Ue.disconnect(),Xe.disconnect(),window.removeEventListener("pointermove",Ie),window.removeEventListener("pointerdown",Fe),window.removeEventListener("pointerup",ae),window.removeEventListener("pointercancel",ae),document.documentElement.removeEventListener("pointerleave",De),document.removeEventListener("visibilitychange",Ce),e.deleteProgram(oe.program),e.deleteVertexArray(be),e.deleteTexture(Y),(t=e.getExtension("WEBGL_lose_context"))==null||t.loseContext()}},[]),B.useEffect(()=>{var S;(S=W.current)==null||S.call(W)}),je.jsx("div",{ref:Te,className:`waves${Me?` ${Me}`:""}`,style:{backgroundColor:R,...ct},children:je.jsx("canvas",{ref:Re,className:"waves__canvas","aria-hidden":"true"})})};export{Et as default};
