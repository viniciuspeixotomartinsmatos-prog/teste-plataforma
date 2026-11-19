import{a as P,j as Ue}from"./index-DrbxZl7q.js";const Oe=`#version 300 es
in vec2 aPosition;
out vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,ke=`#version 300 es
precision highp float;
uniform sampler2D uImage;
uniform sampler2D uField;
uniform vec2 uGrid;
uniform vec2 uCover;
uniform float uSoftness;
uniform float uChroma;
uniform float uReveal;
in vec2 vUv;
out vec4 outColor;

vec2 fieldAt(ivec2 cell) {
  return texelFetch(uField, clamp(cell, ivec2(0), ivec2(uGrid) - 1), 0).rg;
}

vec3 sampleImage(vec2 uv) {
  return texture(uImage, (uv - 0.5) * uCover + 0.5).rgb;
}

void main() {
  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
  vec2 g = uv * uGrid;
  vec2 blocky = fieldAt(ivec2(floor(g)));
  vec2 p = g - 0.5;
  ivec2 base = ivec2(floor(p));
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  vec2 soft = mix(
    mix(fieldAt(base), fieldAt(base + ivec2(1, 0)), f.x),
    mix(fieldAt(base + ivec2(0, 1)), fieldAt(base + ivec2(1, 1)), f.x),
    f.y
  );
  vec2 shift = mix(blocky, soft, uSoftness);
  float spread = uChroma * 0.35;
  vec3 color = vec3(
    sampleImage(uv - shift * (1.0 + spread)).r,
    sampleImage(uv - shift).g,
    sampleImage(uv - shift * (1.0 - spread)).b
  );
  outColor = vec4(color * uReveal, uReveal);
}`,We=["drag","push","swirl"],qe=18,ye=1.6,D=(m,w,_)=>Math.min(_,Math.max(w,m)),Ie=(m,w,_)=>{let c=Math.imul(m,668265261)^Math.imul(w,374761393)^Math.imul(_,739982445);return c=Math.imul(c^c>>>15,2246822507),c=Math.imul(c^c>>>13,3266489909),((c^c>>>16)>>>0)/2147483648-1},Pe=(m,w,_)=>{const c=m.createShader(w);return c?(m.shaderSource(c,_),m.compileShader(c),m.getShaderParameter(c,m.COMPILE_STATUS)?c:(m.deleteShader(c),null)):null},Ye=({imageSrc:m,grid:w=15,radius:_=.18,strength:c=.15,relaxation:De=.96,mode:Q="drag",softness:be=0,chroma:Xe=0,idle:Fe=.3,clickRipple:Se=!0,intro:Le=!0,className:Z="",style:Ge})=>{const ee=P.useRef(null),te=P.useRef(null),O=P.useRef(null),oe={grid:D(Math.round(w),2,120),radius:D(_,.01,1),strength:Math.max(0,c),relaxation:D(De,0,.995),mode:We.includes(Q)?Q:"drag",softness:D(be,0,1),chroma:D(Xe,0,2),idle:D(Fe,0,1),clickRipple:Se,intro:Le},U=P.useRef(oe);return U.current=oe,P.useEffect(()=>{var Te;const f=ee.current,x=te.current,e=x==null?void 0:x.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1});if(!f||!x||!e)return;const j=Pe(e,e.VERTEX_SHADER,Oe),z=Pe(e,e.FRAGMENT_SHADER,ke),p=e.createProgram();if(!j||!z||!p||(e.attachShader(p,j),e.attachShader(p,z),e.linkProgram(p),!e.getProgramParameter(p,e.LINK_STATUS)))return;e.useProgram(p);const re=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,re),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW);const ne=e.getAttribLocation(p,"aPosition");e.enableVertexAttribArray(ne),e.vertexAttribPointer(ne,2,e.FLOAT,!1,0,0);const M={};for(const o of["uImage","uField","uGrid","uCover","uSoftness","uChroma","uReveal"])M[o]=e.getUniformLocation(p,o);e.uniform1i(M.uImage,0),e.uniform1i(M.uField,1);const V=e.createTexture();e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,V),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,new Uint8Array([0,0,0,0])),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.MIRRORED_REPEAT),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.MIRRORED_REPEAT),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR);const ie=e.createTexture();e.activeTexture(e.TEXTURE1),e.bindTexture(e.TEXTURE_2D,ie),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);const C=((Te=window.matchMedia)==null?void 0:Te.call(window,"(prefers-reduced-motion: reduce)").matches)??!1,l={x:0,y:0,px:0,py:0,inside:!1},t={width:1,height:1,cols:0,rows:0,sim:new Float32Array(0),out:new Float32Array(0),ripples:[],time:0,reveal:0,loaded:!1,imageAspect:1,request:0,lastMove:-10,phantom:1};let b=0,N=0,k=!0,W=!0;const $=()=>{const o=U.current.grid,n=Math.max(1,Math.round(o*t.height/t.width));o===t.cols&&n===t.rows||(t.cols=o,t.rows=n,t.sim=new Float32Array(o*n*2),t.out=new Float32Array(o*n*2),e.activeTexture(e.TEXTURE1),e.texImage2D(e.TEXTURE_2D,0,e.RG32F,o,n,0,e.RG,e.FLOAT,t.out))},Ce=()=>{const{sim:o,cols:n,rows:r,width:i,height:s}=t,d=Math.min(i,s)*.12;for(let u=0;u<r;u++)for(let h=0;h<n;h++){const E=(u*n+h)*2;o[E]=Ie(h+1,u+1,11)*d/i,o[E+1]=Ie(h+1,u+1,23)*d/s}},se=(o,n,r,i,s,d)=>{const{sim:u,cols:h,rows:E,width:a,height:v}=t,T=Math.max(1,o.radius*a),A=a/h,R=v/E,y=Math.hypot(i,s),q=(.25+o.strength)*.4*a,K=Math.max(0,Math.floor((n-T)/A)),F=Math.min(h-1,Math.floor((n+T)/A)),S=Math.max(0,Math.floor((r-T)/R)),H=Math.min(E-1,Math.floor((r+T)/R));for(let I=S;I<=H;I++)for(let g=K;g<=F;g++){const L=(g+.5)*A-n,B=(I+.5)*R-r,G=Math.hypot(L,B);if(G>=T)continue;const pe=1-(G/T)**2,ve=o.strength*qe*d*pe*pe;let Re=i,ge=s;if(o.mode!=="drag"){const we=G>0?L/G:0,_e=G>0?B/G:0;Re=o.mode==="push"?we*y:-_e*y,ge=o.mode==="push"?_e*y:we*y}const Y=(I*h+g)*2,xe=u[Y]*a+Re*ve,Me=u[Y+1]*v+ge*ve,J=Math.hypot(xe,Me),Ae=J>0?q*Math.tanh(J/q)/J:0;u[Y]=xe*Ae/a,u[Y+1]=Me*Ae/v}},ae=o=>[t.width*(.5+.34*Math.sin(o*.43)+.08*Math.sin(o*1.21+1.7)),t.height*(.5+.3*Math.sin(o*.61+.9)+.08*Math.cos(o*1.03+.4))],Ne=(o,n)=>{const{sim:r}=t,i=Math.pow(o.relaxation,n*60);let s=0;for(let a=0;a<r.length;a++)r[a]*=i,Math.abs(r[a])<1e-5?r[a]=0:s=Math.max(s,Math.abs(r[a]));if(o.strength<=0)return s;const d=l.x-l.px,u=l.y-l.py;l.px=l.x,l.py=l.y,l.inside&&(d||u)&&(t.lastMove=t.time,se(o,l.x,l.y,d,u,1),s=Math.max(s,.001));const h=C?0:o.idle,E=t.time-t.lastMove>2.5;if(t.phantom=D(t.phantom+(E?n:-n*3),0,1),h>0&&t.phantom>0){const[a,v]=ae(t.time),[T,A]=ae(t.time-n);se(o,a,v,a-T,v-A,h*.6*t.phantom*t.phantom)}return s},ce=o=>{const{sim:n,out:r,cols:i,rows:s,width:d,height:u,time:h}=t;if(r.set(n),t.ripples.length){const E=d/i,a=u/s,v=Math.hypot(d,u),T=Math.max(E,a)*1.2+v*.03,A=d*(.03+o.strength*.3);t.ripples=t.ripples.filter(R=>h-R.start<ye);for(const R of t.ripples){const y=(h-R.start)/ye,q=y*v*.75,K=(1-y)**2;for(let F=0;F<s;F++)for(let S=0;S<i;S++){const H=(S+.5)*E-R.x,I=(F+.5)*a-R.y,g=Math.hypot(H,I),L=Math.exp(-(((g-q)/T)**2))*K;if(L<.002||g===0)continue;const B=(F*i+S)*2;r[B]+=H/g*(L*A/d),r[B+1]+=I/g*(L*A/u)}}}},le=()=>{const{width:o,height:n}=t,r=o/n,i=r>t.imageAspect?[1,t.imageAspect/r]:[r/t.imageAspect,1];e.viewport(0,0,x.width,x.height),e.activeTexture(e.TEXTURE1),e.texSubImage2D(e.TEXTURE_2D,0,0,0,t.cols,t.rows,e.RG,e.FLOAT,t.out);const s=U.current;e.uniform2f(M.uGrid,t.cols,t.rows),e.uniform2f(M.uCover,i[0],i[1]),e.uniform1f(M.uSoftness,s.softness),e.uniform1f(M.uChroma,s.chroma),e.uniform1f(M.uReveal,t.reveal),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.drawArrays(e.TRIANGLES,0,3)},ue=o=>{if(b=0,!W||!k)return;const n=U.current,r=N?Math.min(.05,(o-N)/1e3):1/60;N=o,t.time+=r,$(),t.loaded&&(t.reveal=C?1:Math.min(1,t.reveal+r/.6));const i=Ne(n,r);ce(n),le(),i>0||t.ripples.length>0||n.idle>0&&!C||t.reveal<1?b=requestAnimationFrame(ue):N=0},X=()=>{b||!W||!k||(b=requestAnimationFrame(ue))},Be=o=>{const n=++t.request;if(!o)return;const r=new Image;r.crossOrigin="anonymous",r.decoding="async",r.onload=()=>{!W||n!==t.request||(e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,V),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,r),e.generateMipmap(e.TEXTURE_2D),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR_MIPMAP_LINEAR),t.imageAspect=r.naturalWidth/Math.max(1,r.naturalHeight),$(),U.current.intro&&!C&&Ce(),t.loaded=!0,X())},r.src=o},he=o=>{const n=f.getBoundingClientRect(),r=o.clientX-n.left,i=o.clientY-n.top,s=r>=0&&i>=0&&r<=n.width&&i<=n.height;s&&!l.inside&&(l.px=r,l.py=i),l.x=r,l.y=i,l.inside=s,s&&X()},me=o=>{if(!U.current.clickRipple||C)return;const n=f.getBoundingClientRect(),r=o.clientX-n.left,i=o.clientY-n.top;r<0||i<0||r>n.width||i>n.height||(t.ripples.push({x:r,y:i,start:t.time}),t.ripples.length>4&&t.ripples.shift(),X())},fe=()=>{const o=Math.min(window.devicePixelRatio||1,2);t.width=Math.max(1,f.clientWidth),t.height=Math.max(1,f.clientHeight),x.width=Math.round(t.width*o),x.height=Math.round(t.height*o),$(),b||(ce(U.current),le()),X()};O.current={load:Be,wake:X};const de=new ResizeObserver(fe);de.observe(f);const Ee=new IntersectionObserver(o=>{k=o.some(n=>n.isIntersecting),k&&(N=0,X())});return Ee.observe(f),window.addEventListener("pointermove",he,{passive:!0}),window.addEventListener("pointerdown",me,{passive:!0}),fe(),()=>{W=!1,cancelAnimationFrame(b),O.current=null,de.disconnect(),Ee.disconnect(),window.removeEventListener("pointermove",he),window.removeEventListener("pointerdown",me),e.deleteTexture(V),e.deleteTexture(ie),e.deleteBuffer(re),e.deleteProgram(p),e.deleteShader(j),e.deleteShader(z)}},[]),P.useEffect(()=>{var f;(f=O.current)==null||f.load(m)},[m]),P.useEffect(()=>{var f;(f=O.current)==null||f.wake()}),Ue.jsx("div",{ref:ee,className:`distortion-container${Z?` ${Z}`:""}`,style:Ge,children:Ue.jsx("canvas",{ref:te,className:"distortion-container__canvas","aria-hidden":"true"})})};export{Ye as default};
