import{a as D,j as Le}from"./index-DrbxZl7q.js";const ht=`#version 300 es
in vec2 aCorner;
in vec4 aShape;
in vec4 aTop;
in vec4 aBottom;
uniform vec2 uView;
uniform float uAngle;
out vec2 vLocal;
out vec4 vShape;
out vec4 vTop;
out vec4 vBottom;
void main() {
  float halo = aShape.z + 5.0;
  float reachX = aShape.z + max(aTop.w * 2.5, halo * 2.0);
  float reachY = aShape.w + max(aTop.w * 2.5, halo * 2.0);
  vec2 local = aCorner * vec2(reachX, reachY);
  vLocal = local;
  vShape = aShape;
  vTop = aTop;
  vBottom = aBottom;
  float c = cos(uAngle);
  float s = sin(uAngle);
  vec2 p = aShape.xy + local - uView * 0.5;
  p = vec2(c * p.x - s * p.y, s * p.x + c * p.y) + uView * 0.5;
  gl_Position = vec4(p.x / uView.x * 2.0 - 1.0, 1.0 - p.y / uView.y * 2.0, 0.0, 1.0);
}`,mt=`#version 300 es
precision highp float;
in vec2 vLocal;
in vec4 vShape;
in vec4 vTop;
in vec4 vBottom;
uniform float uGlow;
uniform float uSlices;
uniform float uBase;
uniform float uHalfBar;
uniform float uScale;
out vec4 outColor;

float erfApprox(float x) {
  float a = x * x;
  float t = 1.0 - exp(-a * (1.2732395 + 0.147 * a) / (1.0 + 0.147 * a));
  return sign(x) * sqrt(max(t, 0.0));
}

float box(float d, float h, float s) {
  float k = 0.70710678 / max(s, 0.3);
  return 0.5 * (erfApprox((h - d) * k) + erfApprox((h + d) * k));
}

void main() {
  float blur = vTop.w;
  float body = box(vLocal.x, vShape.z, blur) * box(vLocal.y, vShape.w, blur * 1.15);
  float halo = vShape.z + 5.0;
  float glow = box(vLocal.x, vShape.z, halo) * box(vLocal.y, vShape.w, halo);
  float t = clamp(vLocal.y / max(vShape.w, 0.001) * 0.5 + 0.5, 0.0, 1.0);
  vec3 color = mix(vTop.rgb, vBottom.rgb, t);
  float v = clamp(vLocal.y / max(vShape.w, 0.001), -1.0, 1.0);
  float core = exp(-pow(vLocal.x / max(vShape.z + blur * 0.5, 0.5), 2.0) * 1.5);
  body *= (1.0 + 0.35 * core) * (1.0 - 0.35 * v * v * v * v);
  if (uSlices > 0.0) {
    float cell = vShape.z / max(uHalfBar, 0.00001) / uSlices;
    float y = (uBase - vShape.y - vLocal.y) / max(cell, 0.001);
    float f = 1.0 - abs(fract(y) - 0.5) * 2.0;
    float soft = clamp(blur / max(cell, 0.001) * 1.6, 0.04, 1.0);
    body *= smoothstep(0.28 - soft, 0.28 + soft, f);
  }
  vec3 tint = color * color / max(max(color.r, max(color.g, color.b)), 0.05);
  outColor = vec4((color * body + tint * uGlow * glow * 0.16) * vBottom.w * uScale, 1.0);
}`,dt=`#version 300 es
in vec2 aCorner;
void main() {
  gl_Position = vec4(aCorner, 0.0, 1.0);
}`,pt=`#version 300 es
precision highp float;
uniform sampler2D uLight;
uniform vec2 uResolution;
uniform float uScale;
uniform float uExposure;
uniform float uGrain;
uniform float uTime;
uniform float uFade;
uniform float uOpacity;
uniform float uLightMode;
out vec4 outColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float smootherstep(float edge, float x) {
  float t = clamp(x / max(edge, 0.0001), 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

void main() {
  vec3 hdr = texelFetch(uLight, ivec2(gl_FragCoord.xy), 0).rgb / uScale * uExposure;
  vec2 uv = gl_FragCoord.xy / uResolution;
  float edge = uFade * 0.5;
  float mask = smootherstep(edge, uv.x) * smootherstep(edge, 1.0 - uv.x) * smootherstep(edge, uv.y) * smootherstep(edge, 1.0 - uv.y);
  mask *= uOpacity;
  float grain = (hash(gl_FragCoord.xy + fract(uTime * 7.31) * 113.0) - 0.5) * uGrain;
  float peak = max(hdr.r, max(hdr.g, hdr.b));
  if (uLightMode > 0.5) {
    vec3 hue = hdr / max(peak, 0.0001);
    float tone = dot(hue, vec3(0.2126, 0.7152, 0.0722));
    vec3 color = pow(clamp(hue * min(1.0, 0.66 / max(tone, 0.001)), 0.0, 1.0), vec3(1.0 / 2.2));
    float alpha = clamp((1.0 - exp(-peak * 1.1)) * 0.85 * (1.0 + grain), 0.0, 1.0) * mask;
    outColor = vec4(color * alpha, alpha);
  } else {
    vec3 mapped = 1.0 - exp(-hdr);
    mapped = mix(mapped, vec3(1.0), smoothstep(1.1, 3.2, peak) * 0.75);
    float level = max(mapped.r, max(mapped.g, mapped.b));
    mapped = clamp(mapped + grain * (0.25 + level), 0.0, 1.0) * mask;
    outColor = vec4(mapped, max(mapped.r, max(mapped.g, mapped.b)));
  }
}`,ue=Math.PI*2,vt=6,xt=1.1,C=2.6,bt=1.5,Pe=2560,A=(r,u,d)=>Math.min(d,Math.max(u,r)),Ue=r=>{const u=Math.sin(r*127.1+311.7)*43758.5453;return u-Math.floor(u)},gt=r=>{const u=Math.floor(r),d=r-u,f=d*d*(3-2*d);return Ue(u)*(1-f)+Ue(u+1)*f},De=(r,u,d)=>{const f=r.createShader(u);return f?(r.shaderSource(f,d),r.compileShader(f),r.getShaderParameter(f,r.COMPILE_STATUS)?f:(r.deleteShader(f),null)):null},Ce=(r,u,d,f)=>{const w=De(r,r.VERTEX_SHADER,u),V=De(r,r.FRAGMENT_SHADER,d),g=r.createProgram();return!w||!V||!g?null:(r.attachShader(g,w),r.attachShader(g,V),f.forEach((Q,J)=>r.bindAttribLocation(g,J,Q)),r.linkProgram(g),r.deleteShader(w),r.deleteShader(V),r.getProgramParameter(g,r.LINK_STATUS)?g:(r.deleteProgram(g),null))},Ve=(r,u,d)=>{const f={};for(const w of d)f[w]=r.getUniformLocation(u,w);return f},Rt=({color1:r="#ffd9a8",color2:u="#ff5fa2",color3:d="#5b8cff",ribbons:f=3,spacing:w=28,barWidth:V=.5,ribbonHeight:g=.26,spread:Q=.1,amplitude:J=.1,frequency:Ie=1,speed:Xe=1,perspective:Oe=.45,curve:Ne=.5,blur:Ge=.6,glow:Ye=1,brightness:ke=1.25,position:He=.78,rotation:We=0,slices:ze=0,grain:qe=.08,mouseInteraction:je=!0,intro:$e=!0,fade:Ze=0,opacity:Ke=1,lightMode:Qe=!1,paused:Je=!1,dpr:et,className:fe="",...tt})=>{const he=D.useRef(null),me=D.useRef(null),I=D.useRef(null),de={color1:String(r),color2:String(u),color3:String(d),ribbons:Math.round(A(f,1,vt)),spacing:A(w,4,200),barWidth:A(V,.05,1),ribbonHeight:Math.max(0,g),spread:Math.max(0,Q),amplitude:Math.max(0,J),frequency:Math.max(0,Ie),speed:Xe,perspective:A(Oe,0,1),curve:A(Ne,0,1),blur:A(Ge,0,2),glow:Math.max(0,Ye),brightness:Math.max(0,ke),position:A(He,0,1),rotation:We,slices:Math.max(0,Math.round(ze)),grain:Math.max(0,qe),mouseInteraction:je,intro:$e,fade:A(Ze,0,1),opacity:A(Ke,0,1),lightMode:Qe,paused:Je,dpr:et},X=D.useRef(de);return X.current=de,D.useEffect(()=>{var Se;const R=he.current,c=me.current,e=c==null?void 0:c.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!R||!c||!e)return;const pe=!!e.getExtension("EXT_color_buffer_float"),ve=pe?1:.25,W=Ce(e,ht,mt,["aCorner","aShape","aTop","aBottom"]),z=Ce(e,dt,pt,["aCorner"]);if(!W||!z)return;const S=Ve(e,W,["uView","uAngle","uGlow","uSlices","uBase","uHalfBar","uScale"]),T=Ve(e,z,["uLight","uResolution","uScale","uExposure","uGrain","uTime","uFade","uOpacity","uLightMode"]),ee=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,ee),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),e.STATIC_DRAW);const te=e.createBuffer(),oe=e.createVertexArray();e.bindVertexArray(oe),e.bindBuffer(e.ARRAY_BUFFER,ee),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),e.bindBuffer(e.ARRAY_BUFFER,te);for(let t=1;t<=3;t++)e.enableVertexAttribArray(t),e.vertexAttribPointer(t,4,e.FLOAT,!1,48,(t-1)*16),e.vertexAttribDivisor(t,1);const xe=e.createBuffer(),ae=e.createVertexArray();e.bindVertexArray(ae),e.bindBuffer(e.ARRAY_BUFFER,xe),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),e.bindVertexArray(null);const O=e.createTexture();e.bindTexture(e.TEXTURE_2D,O),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);const re=e.createFramebuffer(),B=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),q=((Se=window.matchMedia)==null?void 0:Se.call(window,"(prefers-reduced-motion: reduce)").matches)??!1,ne=new Map;let E=new Float32Array(0);const x={x:0,y:0,inside:!1},o={width:1,height:1,targetWidth:0,targetHeight:0,time:0,intro:X.current.intro&&!q?0:1,focus:C,focusVelocity:0,lift:0,liftX:0};let F=0,_=0,j=!0,ie=!0;const ot=t=>{if(ne.has(t))return ne.get(t);let a=[1,1,1];if(B&&t){B.clearRect(0,0,1,1),B.fillStyle="#000000",B.fillStyle=/^[0-9a-f]{3,8}$/i.test(t)?`#${t}`:t,B.fillRect(0,0,1,1);const[n,i,s]=B.getImageData(0,0,1,1).data;a=[n,i,s].map(l=>Math.pow(l/255,2.2))}return ne.set(t,a),a},be=(t,a,n)=>{const i=t.length,s=(a%i+i)%i,l=Math.floor(s);let m=s-l;m=m*m*(3-2*m);const b=t[l],p=t[(l+1)%i];for(let v=0;v<3;v++)E[n+v]=b[v]+(p[v]-b[v])*m},at=()=>{o.targetWidth===c.width&&o.targetHeight===c.height||(o.targetWidth=c.width,o.targetHeight=c.height,e.bindTexture(e.TEXTURE_2D,O),pe?e.texImage2D(e.TEXTURE_2D,0,e.RGBA16F,c.width,c.height,0,e.RGBA,e.HALF_FLOAT,null):e.texImage2D(e.TEXTURE_2D,0,e.RGBA,c.width,c.height,0,e.RGBA,e.UNSIGNED_BYTE,null),e.bindFramebuffer(e.FRAMEBUFFER,re),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,O,0),e.bindFramebuffer(e.FRAMEBUFFER,null))},ge=t=>{const{width:a,height:n}=o,i=n*xt,s=i/C,l=t.spacing/s,m=l*t.barWidth*.5,b=t.perspective*.66,p=Math.cos(b),v=Math.sin(b),se=t.curve*.6,$=t.rotation*Math.PI/180,N=Math.abs(Math.cos($))*a*.5+Math.abs(Math.sin($))*n*.5,G=Math.ceil(Math.max(a,n)/i*C*2.4/l),Z=[];for(let P=-G;P<=G;P++){const U=P*l,Y=se*Math.sin(U*.9+.8),k=U*p-Y*v,h=U*v+Y*p+C;if(h<.45)continue;const H=i/h,K=a*.5+k*H;Math.abs(K-a*.5)>N+m*H+80||Z.push({i:P,x:U,Z:h,sx:K,scale:H})}return{bars:Z,halfBar:m,centerScale:s}},rt=(t,a)=>{const{width:n,height:i}=o,{bars:s,halfBar:l,centerScale:m}=a,b=[t.color1,t.color2,t.color3].map(ot),p=o.time,v=t.ribbonHeight*i*.5/m,se=t.spread*i/m,$=t.amplitude*i/m,N=.22*t.frequency,G=i*t.position,Z=o.focus,P=t.blur*16,U=1.6+.04*(t.ribbons-1),Y=s.length*t.ribbons*12;Y>E.length&&(E=new Float32Array(Y+1200));let k=0;for(const h of s){const H=l*h.scale,K=h.sx/Math.max(n,1),it=o.lift*Math.exp(-Math.pow((h.sx-o.liftX)/Math.max(n*.12,60),2)),ct=(.5+t.blur*.6+P*Math.abs(Z/h.Z-1))*(t.lightMode?.55:1);for(let M=0;M<t.ribbons;M++){const st=(M-(t.ribbons-1)/2)*se,lt=.62*Math.sin(ue*N*h.x-p*1.6+M*2.1)+.38*Math.sin(ue*N*1.9*h.x+p*2.25+M*1.3),ut=st+lt*$,ft=.5+.5*Math.sin(ue*N*.7*h.x+p*1.1+M*2.7),le=A((o.intro*U-K-M*.04)/.6,0,1),Fe=le*le*(3-2*le),Be=v*(.6+.4*ft)*Fe*h.scale;if(Be<.4)continue;const _e=M*1.15+h.x*.3+p*.12,y=k*12;E[y]=h.sx,E[y+1]=G-ut*h.scale,E[y+2]=H,E[y+3]=Be,be(b,_e-.22,y+4),E[y+7]=ct,be(b,_e+.22,y+8),E[y+11]=(.75+.25*gt(h.i*.9+M*7.7-p*1.2))*(1+it*.6)*(.4+.6*Fe),k++}}return{count:k,halfBar:l,base:G}},ce=(t,a=ge(t))=>{at();const{count:n,halfBar:i,base:s}=rt(t,a);e.bindFramebuffer(e.FRAMEBUFFER,re),e.viewport(0,0,c.width,c.height),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),n>0&&(e.enable(e.BLEND),e.blendFunc(e.ONE,e.ONE),e.useProgram(W),e.uniform2f(S.uView,o.width,o.height),e.uniform1f(S.uAngle,t.rotation*Math.PI/180),e.uniform1f(S.uGlow,t.lightMode?t.glow*.4:t.glow),e.uniform1f(S.uSlices,t.slices),e.uniform1f(S.uBase,s),e.uniform1f(S.uHalfBar,i),e.uniform1f(S.uScale,ve),e.bindVertexArray(oe),e.bindBuffer(e.ARRAY_BUFFER,te),e.bufferData(e.ARRAY_BUFFER,E.subarray(0,n*12),e.DYNAMIC_DRAW),e.drawArraysInstanced(e.TRIANGLE_STRIP,0,4,n),e.disable(e.BLEND)),e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,c.width,c.height),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.useProgram(z),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,O),e.uniform1i(T.uLight,0),e.uniform2f(T.uResolution,c.width,c.height),e.uniform1f(T.uScale,ve),e.uniform1f(T.uExposure,1.6*t.brightness),e.uniform1f(T.uGrain,t.grain),e.uniform1f(T.uTime,o.time%1e3),e.uniform1f(T.uFade,t.fade),e.uniform1f(T.uOpacity,t.opacity),e.uniform1f(T.uLightMode,t.lightMode?1:0),e.bindVertexArray(ae),e.drawArrays(e.TRIANGLES,0,3),e.bindVertexArray(null)},nt=(t,a)=>{let n=null;for(const i of t.bars)(!n||Math.abs(i.sx-a)<Math.abs(n.sx-a))&&(n=i);return n?n.Z:C},Ee=t=>{if(F=0,!ie||!j||document.hidden)return;const a=X.current,n=_?Math.min(.05,(t-_)/1e3):1/60;_=t;const i=!a.paused&&!q;i&&(o.time+=n*a.speed),!a.intro||q?o.intro=1:o.intro<1&&(o.intro=Math.min(1,o.intro+n/bt));const s=a.mouseInteraction&&x.inside&&!q,l=a.rotation*Math.PI/180,m=Math.cos(l)*(x.x-o.width*.5)+Math.sin(l)*(x.y-o.height*.5)+o.width*.5,b=ge(a),p=s?nt(b,m):C;o.focusVelocity+=(36*(p-o.focus)-11*o.focusVelocity)*n,o.focus+=o.focusVelocity*n,o.lift+=((s?1:0)-o.lift)*(1-Math.exp(-n/(s?.25:.6))),o.liftX+=(m-o.liftX)*(1-Math.exp(-n/.12)),ce(a,b);const v=o.intro<1||Math.abs(p-o.focus)>.001||Math.abs(o.focusVelocity)>.001||o.lift>.002||s;i||v?F=requestAnimationFrame(Ee):_=0},L=()=>{!F&&ie&&j&&!document.hidden&&(F=requestAnimationFrame(Ee))},Ae=()=>{const t=X.current,a=Math.max(1,R.clientWidth),n=Math.max(1,R.clientHeight),i=Math.min(t.dpr||window.devicePixelRatio||1,2),s=Math.max(a,n)*i,l=s>Pe?i*Pe/s:i;o.width=a,o.height=n,c.width=Math.max(1,Math.round(a*l)),c.height=Math.max(1,Math.round(n*l)),F||ce(t),L()},Re=t=>{const a=R.getBoundingClientRect();x.x=t.clientX-a.left,x.y=t.clientY-a.top,x.inside=x.x>=0&&x.y>=0&&x.x<=a.width&&x.y<=a.height,L()},Te=()=>{x.inside=!1,L()},Me=()=>{_=0,L()},we=new ResizeObserver(Ae);we.observe(R);const ye=new IntersectionObserver(t=>{j=t.some(a=>a.isIntersecting),j&&(_=0,L())});return ye.observe(R),window.addEventListener("pointermove",Re,{passive:!0}),document.documentElement.addEventListener("pointerleave",Te),document.addEventListener("visibilitychange",Me),Ae(),I.current=()=>{F||ce(X.current),L()},()=>{ie=!1,cancelAnimationFrame(F),I.current=null,we.disconnect(),ye.disconnect(),window.removeEventListener("pointermove",Re),document.documentElement.removeEventListener("pointerleave",Te),document.removeEventListener("visibilitychange",Me),e.deleteFramebuffer(re),e.deleteTexture(O),e.deleteBuffer(ee),e.deleteBuffer(te),e.deleteBuffer(xe),e.deleteVertexArray(oe),e.deleteVertexArray(ae),e.deleteProgram(W),e.deleteProgram(z)}},[]),D.useEffect(()=>{var R;(R=I.current)==null||R.call(I)}),Le.jsx("div",{ref:he,className:`sliced-waves-container${fe?` ${fe}`:""}`,...tt,children:Le.jsx("canvas",{ref:me,className:"sliced-waves-canvas","aria-hidden":"true"})})};export{Rt as default};
