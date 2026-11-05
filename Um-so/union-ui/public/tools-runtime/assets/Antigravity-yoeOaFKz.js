import{a as Y,j as st}from"./index-DrbxZl7q.js";const Tt=24e5,Pe=31.5,W=256,ct=["#5227FF","#FF9FFC","#B497CF"],lt={capsule:0,sphere:1,box:2,tetrahedron:3},ut={conic:0,radial:1,random:2},Pt=`#version 300 es
precision highp float;
layout(location = 0) in vec2 aCorner;
layout(location = 1) in vec4 aParticle;
layout(location = 2) in vec4 aSeed;
uniform vec2 uSize;
uniform float uPixel;
uniform vec2 uCursor;
uniform float uRing;
uniform float uBand;
uniform float uParticle;
uniform float uAmbient;
uniform float uTime;
uniform float uPulse;
uniform float uVariance;
uniform float uDepth;
uniform float uShape;
uniform float uColorMode;
uniform float uStops;
uniform float uHue;
uniform float uReveal;
uniform float uStreak;
uniform float uCharge;
out vec2 vLocal;
out vec2 vBounds;
out float vU;
out float vAlpha;
out float vSoft;

void main() {
  vec2 rel = aParticle.xy - uCursor;
  float dist = length(rel);
  vec2 radial = dist > 1e-3 ? rel / dist : vec2(1.0, 0.0);
  vec2 dir = radial;
  float speed = length(aParticle.zw);
  float streak = clamp(speed / uStreak, 0.0, 2.5);
  if (speed > 1e-3) {
    vec2 heading = aParticle.zw / speed * sign(dot(aParticle.zw, radial) + 1e-4);
    dir = normalize(mix(radial, heading, smoothstep(0.0, 1.0, streak)));
  }
  float ring = exp(-pow((dist - uRing) / uBand, 2.0));
  float z = aSeed.x;
  float depth = 1.0 + z * 0.32 * uDepth;
  float pulse = 1.0 + sin(uTime * uPulse + aSeed.y) * 0.22 * uVariance;
  float grow = uAmbient + (1.0 - uAmbient) * ring;
  float size = uParticle * depth * pulse * (0.85 + 0.3 * aSeed.w) * (1.0 + uCharge * 0.25 * ring);
  vec2 bounds;
  if (uShape < 0.5) {
    float width = size * 0.17 * mix(0.55, 1.0, ring);
    bounds = vec2(max(width, size * 0.5 * grow) * (1.0 + streak * 1.2), width);
  } else if (uShape < 1.5) {
    bounds = vec2(size * 0.22 * mix(0.45, 1.0, grow));
  } else {
    bounds = vec2(size * 0.26 * mix(0.45, 1.0, grow));
  }
  float soft = 1.0 + max(-z, 0.0) * 1.6 * uDepth;
  vec2 local = aCorner * (bounds + soft * 1.5 / uPixel);
  vec2 world = aParticle.xy + dir * local.x + vec2(-dir.y, dir.x) * local.y;
  gl_Position = vec4(world.x / uSize.x * 2.0 - 1.0, 1.0 - world.y / uSize.y * 2.0, 0.0, 1.0);
  vLocal = local * uPixel;
  vBounds = bounds * uPixel;
  vSoft = soft;
  if (uColorMode < 0.5) {
    vU = atan(radial.y, radial.x) / 6.28318530718 + uHue + (aSeed.z - 0.5) * 0.06;
  } else if (uColorMode < 1.5) {
    vU = clamp(dist / (uRing * 2.4), 0.0, 1.0) + (aSeed.z - 0.5) * 0.06;
  } else {
    vU = floor(aSeed.z * uStops) / max(uStops - 1.0, 1.0);
  }
  float fog = 1.0 - max(-z, 0.0) * 0.35 * uDepth;
  vAlpha = mix(uAmbient, 1.0, ring) * fog * uReveal;
}`,Ft=`#version 300 es
precision highp float;
uniform sampler2D uPalette;
uniform float uShape;
uniform float uColorMode;
uniform float uOpacity;
in vec2 vLocal;
in vec2 vBounds;
in float vU;
in float vAlpha;
in float vSoft;
out vec4 fragColor;

void main() {
  vec2 p = vLocal;
  float d;
  if (uShape < 0.5) {
    float r = vBounds.y;
    d = length(vec2(max(abs(p.x) - max(vBounds.x - r, 0.0), 0.0), p.y)) - r;
  } else if (uShape < 1.5) {
    d = length(p) - vBounds.x;
  } else if (uShape < 2.5) {
    float r = vBounds.x * 0.28;
    vec2 q = abs(p) - (vBounds - r);
    d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  } else {
    float r = vBounds.x * 1.15;
    vec2 q = vec2(r * 0.5774 - p.x, abs(p.y));
    d = max(dot(q, vec2(0.5, 0.8660254)) - r * 0.5, -q.x - r * 0.5) * 1.2;
  }
  float alpha = clamp(0.5 - d / vSoft, 0.0, 1.0) * vAlpha * uOpacity;
  if (alpha < 0.002) discard;
  vec3 color = texture(uPalette, vec2(uColorMode < 0.5 ? fract(vU) : vU, uColorMode < 0.5 ? 0.25 : 0.75)).rgb;
  fragColor = vec4(color * alpha, alpha);
}`,T=(n,c,s)=>Math.min(s,Math.max(c,n)),_t=n=>{const c=String(n||"").trim(),s=/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(c);if(s){const A=s[1].length===3?s[1].replace(/./g,h=>h+h):s[1];return[0,2,4].map(h=>parseInt(A.slice(h,h+2),16)/255)}const a=/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(c);return a?[a[1],a[2],a[3]].map(A=>T(parseFloat(A)/255,0,1)):null},Bt=n=>n<=.04045?n/12.92:Math.pow((n+.055)/1.055,2.4),Lt=n=>n<=.0031308?n*12.92:1.055*Math.pow(Math.max(n,0),1/2.4)-.055,ft=n=>{const[c,s,a]=n.map(Bt),A=Math.cbrt(.4122214708*c+.5363325363*s+.0514459929*a),h=Math.cbrt(.2119034982*c+.6806995451*s+.1073969566*a),y=Math.cbrt(.0883024619*c+.2817188376*s+.6299787005*a);return[.2104542553*A+.793617785*h-.0040720468*y,1.9779984951*A-2.428592205*h+.4505937099*y,.0259040371*A+.7827717662*h-.808675766*y]},Ut=([n,c,s])=>{const a=Math.pow(n+.3963377774*c+.2158037573*s,3),A=Math.pow(n-.1055613458*c-.0638541728*s,3),h=Math.pow(n-.0894841775*c-1.291485548*s,3);return[4.0767416621*a-3.3077115913*A+.2309699292*h,-1.2684380046*a+2.6097574011*A-.3413193965*h,-.0041960863*a-.7034186147*A+1.707614701*h].map(y=>T(Lt(y),0,1))},Ct=(n,c)=>{const s=[];n.forEach(h=>{const y=_t(h);if(!y)return;const x=ft(y),D=Math.atan2(x[2],x[1])*180/Math.PI,S=T(1-Math.abs(D-85)/40,0,1),_=.62+.14*S*S*(3-2*S);if(c&&x[0]>_){const P=1+(x[0]-_)*1.6;s.push([_,x[1]*P,x[2]*P])}else s.push(x)}),s.length||s.push(ft(c?[.1,.1,.12]:[1,1,1]));const a=new Uint8Array(W*2*4);return[[...s,s[0]],s.length>1?s:[s[0],s[0]]].forEach((h,y)=>{for(let x=0;x<W;x++){const D=x/(W-(y===0?0:1))*(h.length-1),S=Math.min(Math.floor(D),h.length-2),_=D-S,P=_*_*(3-2*_),F=h[S],I=h[S+1],me=Math.hypot(F[1],F[2])*(1-P)+Math.hypot(I[1],I[2])*P,Q=F[1]+(I[1]-F[1])*P,ee=F[2]+(I[2]-F[2])*P,te=Math.hypot(Q,ee),ne=te>1e-4?me/te:0,pe=Ut([F[0]+(I[0]-F[0])*P,Q*ne,ee*ne]);for(let N=0;N<3;N++)a[(y*W+x)*4+N]=Math.round(pe[N]*255);a[(y*W+x)*4+3]=255}}),a},Dt=n=>()=>{n|=0,n=n+1831565813|0;let c=Math.imul(n^n>>>15,1|n);return c=c+Math.imul(c^c>>>7,61|c)^c,((c^c>>>14)>>>0)/4294967296},dt=(n,c,s)=>{const a=n.createShader(c);return a?(n.shaderSource(a,s),n.compileShader(a),n.getShaderParameter(a,n.COMPILE_STATUS)?a:(console.error(n.getShaderInfoLog(a)),n.deleteShader(a),null)):null},It=n=>{const c=dt(n,n.VERTEX_SHADER,Pt),s=dt(n,n.FRAGMENT_SHADER,Ft),a=c&&s?n.createProgram():null;if(!c||!s||!a)return c&&n.deleteShader(c),s&&n.deleteShader(s),null;if(n.attachShader(a,c),n.attachShader(a,s),n.linkProgram(a),n.deleteShader(c),n.deleteShader(s),!n.getProgramParameter(a,n.LINK_STATUS))return console.error(n.getProgramInfoLog(a)),n.deleteProgram(a),null;const A={},h=n.getProgramParameter(a,n.ACTIVE_UNIFORMS);for(let y=0;y<h;y++){const x=n.getActiveUniform(a,y);x&&(A[x.name]=n.getUniformLocation(a,x.name))}return{program:a,uniforms:A}},Ot=({count:n=1500,magnetRadius:c=9,ringRadius:s=7,waveSpeed:a=.4,waveAmplitude:A=1,waveCount:h=3,particleSize:y=.9,lerpSpeed:x=.05,color:D,colors:S=ct,colorMode:_="conic",colorSpeed:P=.05,autoAnimate:F=!0,particleVariance:I=1,rotationSpeed:me=0,depthFactor:Q=1,pulseSpeed:ee=3,particleShape:te="capsule",fieldStrength:ne=10,ambient:pe=.25,interactive:N=!0,clickBurst:ht=!0,intro:mt=!0,lightMode:Fe=!1,opacity:pt=1,maxDevicePixelRatio:vt=2,className:_e="",style:xt})=>{const Be=Y.useRef(null),Le=Y.useRef(null),j=Y.useRef(null),[Ue,yt]=Y.useState(0),Ce=D?[D]:Array.isArray(S)&&S.length?S:ct,De={count:T(Math.round(n),1,2e4),magnet:Math.max(0,c),ring:Math.max(0,s),waveSpeed:a,waveAmplitude:Math.max(0,A),waveCount:Math.max(0,Math.round(h)),size:Math.max(0,y),follow:T(x,.001,1),palette:Ce,paletteKey:`${Ce.join(",")}|${Fe}`,colorMode:ut[_]??ut.conic,colorSpeed:P,autoAnimate:F,variance:Math.max(0,I),rotation:me,depth:Math.max(0,Q),pulse:ee,shape:lt[te]??lt.capsule,tightness:Math.max(0,ne),ambient:T(pe,0,1),interactive:N,clickBurst:ht,intro:mt,light:Fe,opacity:T(pt,0,1),maxRatio:T(vt,.5,3)},k=Y.useRef(De);return k.current=De,Y.useEffect(()=>{var L;(L=j.current)==null||L.call(j)}),Y.useEffect(()=>{const L=Be.current,b=Le.current;if(!L||!b)return;const e=b.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance"}),oe=e?It(e):null;if(!e||!oe)return;const K=window.matchMedia("(prefers-reduced-motion: reduce)").matches,ve=e.createVertexArray();e.bindVertexArray(ve);const Ie=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,Ie),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0);const re=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,re),e.enableVertexAttribArray(1),e.vertexAttribPointer(1,4,e.FLOAT,!1,0,0),e.vertexAttribDivisor(1,1);const xe=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,xe),e.enableVertexAttribArray(2),e.vertexAttribPointer(2,4,e.FLOAT,!1,0,0),e.vertexAttribDivisor(2,1);const ae=e.createTexture();e.bindTexture(e.TEXTURE_2D,ae),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.REPEAT),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);const M={width:1,height:1,ratio:1},f={x:0,y:0,vx:0,vy:0,tx:0,ty:0,ready:!1},p={x:0,y:0,inside:!1,down:!1,moved:-1/0};let R=null,ze="",z=0,Oe=0,U=0,V=k.current.intro&&!K&&Ue===0?0:1/0,O=0,ie=0,ye=!0,Ae=document.visibilityState!=="hidden",ge=!1;const At=t=>{t.paletteKey!==ze&&(ze=t.paletteKey,e.bindTexture(e.TEXTURE_2D,ae),e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,W,2,0,e.RGBA,e.UNSIGNED_BYTE,Ct(t.palette,t.light)))},gt=(t,o,i,m)=>{const v=Dt(1337),g=.06,l=o*(1+g*2),q=i*(1+g*2),B=Math.max(1,Math.ceil(Math.sqrt(t*l/q))),X=Math.max(1,Math.ceil(t/B)),w=Array.from({length:B*X},(r,E)=>E);for(let r=w.length-1;r>0;r--){const E=Math.floor(v()*(r+1));[w[r],w[E]]=[w[E],w[r]]}const C=Array.from({length:t},()=>v()*2-1).sort((r,E)=>r-E),d={total:t,width:o,height:i,homeX:new Float32Array(t),homeY:new Float32Array(t),band:new Float32Array(t),phase:new Float32Array(t),agility:new Float32Array(t),delay:new Float32Array(t),orbit:new Float32Array(t),x:new Float32Array(t),y:new Float32Array(t),vx:new Float32Array(t),vy:new Float32Array(t),particles:new Float32Array(t*4),seeds:new Float32Array(t*4)};for(let r=0;r<t;r++){const E=w[r],Z=-o*g+(E%B+.5+(v()-.5)*.85)/B*l,J=-i*g+(Math.floor(E/B)+.5+(v()-.5)*.85)/X*q;d.homeX[r]=Z,d.homeY[r]=J,d.band[r]=v()*2-1,d.phase[r]=v()*Math.PI*2,d.agility[r]=.75+v()*.5,d.delay[r]=v(),m&&r<m.total?(d.x[r]=m.x[r]/m.width*o,d.y[r]=m.y[r]/m.height*i,d.vx[r]=m.vx[r],d.vy[r]=m.vy[r],d.orbit[r]=m.orbit[r]):(d.x[r]=Z,d.y[r]=V===0?J+i*(.45+d.delay[r]*.4):J),d.seeds[r*4]=C[r],d.seeds[r*4+1]=d.phase[r],d.seeds[r*4+2]=v(),d.seeds[r*4+3]=v()}return e.bindBuffer(e.ARRAY_BUFFER,xe),e.bufferData(e.ARRAY_BUFFER,d.seeds,e.STATIC_DRAW),e.bindBuffer(e.ARRAY_BUFFER,re),e.bufferData(e.ARRAY_BUFFER,d.particles.byteLength,e.DYNAMIC_DRAW),d},we=()=>{const t=k.current,o=L.getBoundingClientRect(),i=Math.max(1,o.width),m=Math.max(1,o.height),v=Math.min(window.devicePixelRatio||1,t.maxRatio,Math.sqrt(Tt/(i*m))),g=Math.max(1,Math.round(i*v)),l=Math.max(1,Math.round(m*v));(b.width!==g||b.height!==l)&&(b.width=g,b.height=l),M.width=i,M.height=m,M.ratio=g/i,f.ready||(f.x=f.tx=i/2,f.y=f.ty=m/2,f.ready=!0),(!R||R.total!==t.count||Math.abs(R.width-i)>.5||Math.abs(R.height-m)>.5)&&(R=gt(t.count,i,m,R))},wt=(t,o)=>{if(!R)return;const i=M.height/Pe,m=t.ring*i*(1-.38*U),v=Math.max(t.magnet*i,1),g=5/(t.tightness+.1)*i,l=t.waveAmplitude*i*.5,q=2.2+t.follow*80,B=(t.rotation+U*3)*(K?.3:1),X=M.width/2,w=M.height/2,C=v*.18,{homeX:d,homeY:r,band:E,phase:Z,agility:J,delay:Et,orbit:Ke,x:Me,y:Ee,vx:ce,vy:le,particles:ue,seeds:Rt,total:bt}=R;for(let u=0;u<bt;u++){const $e=1-Rt[u*4]*.12*t.depth,Ze=X+(f.x-X)*$e,Je=w+(f.y-w)*$e,Qe=d[u],et=r[u]+Math.sin(z*.7+Z[u])*i*.12*t.waveAmplitude,Re=Qe-Ze,be=et-Je,Se=Math.sqrt(Re*Re+be*be),Te=1-T((Se-(v-C))/(C*2),0,1),fe=Te*Te*(3-2*Te);let G=Ke[u]+B*fe*o;G-=Math.atan2(Math.sin(G),Math.cos(G))*(1-fe)*Math.min(1,o*2.5),Ke[u]=G;let tt=Qe,nt=et;if(fe>0||Math.abs(G)>1e-4){const H=Math.atan2(be,Re)+G,St=l*(.6*Math.sin(H*t.waveCount-z*t.waveSpeed*2)+.4*Math.sin(Z[u]+z*t.waveSpeed*1.3)),it=Se+(m+St+E[u]*g-Se)*fe;tt=Ze+Math.cos(H)*it,nt=Je+Math.sin(H)*it}const de=V<Et[u]*.9?0:q*J[u],ot=1.64*de,rt=de*de,at=Math.min(4,Math.max(1,Math.ceil(de*o*2))),he=o/at;for(let H=0;H<at;H++)ce[u]+=((tt-Me[u])*rt-ce[u]*ot)*he,le[u]+=((nt-Ee[u])*rt-le[u]*ot)*he,Me[u]+=ce[u]*he,Ee[u]+=le[u]*he;ue[u*4]=Me[u],ue[u*4+1]=Ee[u],ue[u*4+2]=ce[u],ue[u*4+3]=le[u]}},Mt=(t,o)=>{if(!R)return;const i=M.height/Pe,m=Math.max(t.magnet,t.ring)*i*1.8,{x:v,y:g,vx:l,vy:q,agility:B,total:X}=R;for(let w=0;w<X;w++){const C=v[w]-f.x,d=g[w]-f.y,r=Math.sqrt(C*C+d*d)+.001,E=i*110*o*Math.exp(-Math.pow(r/m,2))*B[w];l[w]+=C/r*E,q[w]+=d/r*E}},Xe=t=>{if(O=0,ge||!R)return;const o=k.current;At(o);const i=T((t-ie)/1e3||0,0,1/30);ie=Math.max(ie,t);const m=K?.3:1;z+=i*m,Oe+=i*o.colorSpeed*m,V<3&&(V+=i),U=p.down?Math.min(1,U+i/.9):Math.max(0,U-i*4);const v=performance.now()-p.moved>2e3||!p.inside;o.autoAnimate&&!K&&(v||!o.interactive)?(f.tx=M.width/2+Math.sin(z*.5)*(M.width/4),f.ty=M.height/2+Math.cos(z)*(M.height/4)):o.interactive&&p.inside&&(f.tx=p.x,f.ty=p.y),f.vx+=((f.tx-f.x)*49-f.vx*14)*i,f.vy+=((f.ty-f.y)*49-f.vy*14)*i,f.x+=f.vx*i,f.y+=f.vy*i,wt(o,i);const g=M.height/Pe;e.viewport(0,0,b.width,b.height),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.enable(e.BLEND),e.blendFunc(e.ONE,e.ONE_MINUS_SRC_ALPHA),e.useProgram(oe.program),e.bindVertexArray(ve),e.bindBuffer(e.ARRAY_BUFFER,re),e.bufferSubData(e.ARRAY_BUFFER,0,R.particles);const l=oe.uniforms;e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,ae),e.uniform1i(l.uPalette,0),e.uniform2f(l.uSize,M.width,M.height),e.uniform1f(l.uPixel,M.ratio),e.uniform2f(l.uCursor,f.x,f.y),e.uniform1f(l.uRing,o.ring*g*(1-.38*U)),e.uniform1f(l.uBand,Math.max(g*6,1)),e.uniform1f(l.uParticle,o.size*g*.6),e.uniform1f(l.uAmbient,o.ambient),e.uniform1f(l.uTime,z),e.uniform1f(l.uPulse,o.pulse),e.uniform1f(l.uVariance,o.variance),e.uniform1f(l.uDepth,o.depth),e.uniform1f(l.uShape,o.shape),e.uniform1f(l.uColorMode,o.colorMode),e.uniform1f(l.uStops,o.palette.length),e.uniform1f(l.uHue,Oe),e.uniform1f(l.uReveal,V<3?T(V/.6,0,1):1),e.uniform1f(l.uStreak,g*30),e.uniform1f(l.uCharge,U),e.uniform1f(l.uOpacity,o.opacity),e.drawArraysInstanced(e.TRIANGLE_STRIP,0,4,R.total),ye&&Ae&&(O=requestAnimationFrame(Xe))},$=()=>{O||ge||!ye||!Ae||(ie=performance.now(),O=requestAnimationFrame(Xe))};j.current=()=>{we(),$()};const Ye=t=>{const o=L.getBoundingClientRect();return{x:t.clientX-o.left,y:t.clientY-o.top,inside:t.clientX>=o.left&&t.clientX<=o.right&&t.clientY>=o.top&&t.clientY<=o.bottom}},Ne=t=>{const o=Ye(t);p.inside=o.inside,o.inside&&(p.x=o.x,p.y=o.y,p.moved=performance.now())},ke=t=>{const o=k.current,i=Ye(t);!i.inside||!o.interactive||(p.x=i.x,p.y=i.y,p.inside=!0,p.moved=performance.now(),o.clickBurst&&!K&&(p.down=!0))},se=t=>{p.down&&Mt(k.current,.45+U),p.down=!1,t.pointerType!=="mouse"&&(p.inside=!1)},Ve=()=>{p.inside=!1,p.down=!1};window.addEventListener("pointermove",Ne,{passive:!0}),window.addEventListener("pointerdown",ke,{passive:!0}),window.addEventListener("pointerup",se,{passive:!0}),window.addEventListener("pointercancel",se,{passive:!0}),document.documentElement.addEventListener("pointerleave",Ve);const qe=t=>{t.preventDefault(),ge=!0,cancelAnimationFrame(O),O=0},Ge=()=>yt(t=>t+1);b.addEventListener("webglcontextlost",qe),b.addEventListener("webglcontextrestored",Ge);const He=new ResizeObserver(()=>{we(),$()});He.observe(L);const We=new IntersectionObserver(t=>{ye=t.some(o=>o.isIntersecting),$()});We.observe(L);const je=()=>{Ae=document.visibilityState!=="hidden",$()};return document.addEventListener("visibilitychange",je),we(),$(),()=>{cancelAnimationFrame(O),j.current=null,He.disconnect(),We.disconnect(),window.removeEventListener("pointermove",Ne),window.removeEventListener("pointerdown",ke),window.removeEventListener("pointerup",se),window.removeEventListener("pointercancel",se),document.documentElement.removeEventListener("pointerleave",Ve),document.removeEventListener("visibilitychange",je),b.removeEventListener("webglcontextlost",qe),b.removeEventListener("webglcontextrestored",Ge),e.isContextLost()||(e.deleteBuffer(Ie),e.deleteBuffer(re),e.deleteBuffer(xe),e.deleteTexture(ae),e.deleteVertexArray(ve),e.deleteProgram(oe.program))}},[Ue]),st.jsx("div",{ref:Be,className:`antigravity${_e?` ${_e}`:""}`,style:xt,children:st.jsx("canvas",{ref:Le,className:"antigravity__canvas","aria-hidden":"true"})})};export{Ot as default};
