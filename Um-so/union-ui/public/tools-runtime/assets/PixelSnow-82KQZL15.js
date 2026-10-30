import{a as Y,j as Oe}from"./index-DrbxZl7q.js";const Ye={square:[["@"],["oo","oo"],["xox","o@o","xox"],["xoox","o@@o","o@@o","xoox"],["xooox","oo@oo","o@@@o","oo@oo","xooox"],["xox","o@o","xox"],["xoox","o@@o","o@@o","xoox"],["xooox","oo@oo","o@@@o","oo@oo","xooox"]],round:[["@"],[".x.","x@x",".x."],[".xx.","x@@x","x@@x",".xx."],[".xxx.","xo@ox","x@@@x","xo@ox",".xxx."],["..xxx..",".xooox.","xoo@oox","xo@@@ox","xoo@oox",".xooox.","..xxx.."],[".xx.","x@@x","x@@x",".xx."],[".xxx.","xo@ox","x@@@x","xo@ox",".xxx."],["..xxx..",".xooox.","xoo@oox","xo@@@ox","xoo@oox",".xooox.","..xxx.."]],snowflake:[["@"],[".x.","x@x",".x."],["..x..","x.o.x",".o@o.","x.o.x","..x.."],["...x...",".x.o.x.","..ooo..","xoo@oox","..ooo..",".x.o.x.","...x..."],["....x....",".x..o..x.","..o.o.o..","...ooo...","xooo@ooox","...ooo...","..o.o.o..",".x..o..x.","....x...."],["x...x",".o.o.","..@..",".o.o.","x...x"],["x..x..x",".o.o.o.","..ooo..","xoo@oox","..ooo..",".o.o.o.","x..x..x"],["x...x...x",".o..o..o.","..o.o.o..","...ooo...","xooo@ooox","...ooo...","..o.o.o..",".o..o..o.","x...x...x"]]},ue=["square","round","snowflake"],H=9,le=5,ce=8,Ve=4e3,it=[.46,.27,.15,.08,.04],ke=[16,24,34,48,66],nt=[.42,.58,.76,.92,1],at=1.4,se=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,st=`#version 300 es
in vec2 aCorner;
in vec4 aFlake;
uniform vec2 uGrid;
uniform vec4 uSizes;
uniform float uLargest;
flat out ivec2 vOrigin;
flat out ivec2 vCell;
flat out int vSize;
flat out float vLight;
void main() {
  int index = int(aFlake.z + 0.5);
  int slot = index % ${ce};
  int variant = index / ${ce};
  int level = slot < ${le} ? slot : slot - 3;
  float size = level == 0 ? 1.0 : (level == 1 ? uSizes.x : (level == 2 ? uSizes.y : (level == 3 ? uSizes.z : uLargest)));
  vec2 origin = floor(aFlake.xy) - floor(size * 0.5);
  origin.y = uGrid.y - origin.y - size;
  vec2 corner = origin + (aCorner * 0.5 + 0.5) * size;
  gl_Position = vec4(corner / uGrid * 2.0 - 1.0, 0.0, 1.0);
  vOrigin = ivec2(origin);
  vCell = ivec2(slot * ${H}, variant * ${H});
  vSize = int(size);
  vLight = aFlake.w;
}`,lt=`#version 300 es
precision highp float;
precision highp int;
uniform sampler2D uAtlas;
flat in ivec2 vOrigin;
flat in ivec2 vCell;
flat in int vSize;
flat in float vLight;
out vec4 outColor;
void main() {
  ivec2 local = ivec2(gl_FragCoord.xy) - vOrigin;
  if (local.x < 0 || local.y < 0 || local.x >= vSize || local.y >= vSize) discard;
  vec4 texel = texelFetch(uAtlas, vCell + local, 0);
  if (texel.r < 0.5) discard;
  outColor = vec4(vLight, texel.g * vLight, 0.0, 1.0);
}`,ut=`#version 300 es
precision highp float;
precision highp int;
uniform sampler2D uPile;
uniform float uTime;
uniform float uLight;
out vec4 outColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  ivec2 cell = ivec2(gl_FragCoord.xy);
  float height = texelFetch(uPile, ivec2(cell.x, 0), 0).r;
  float row = float(cell.y);
  if (row >= floor(height + 0.5)) discard;
  float below = floor(height + 0.5) - row;
  float crest = below <= 1.0 ? 1.0 : 0.0;
  ivec2 bayerCell = cell & 3;
  int bayerIndex = bayerCell.x + bayerCell.y * 4;
  float bayer[16] = float[16](0.0, 8.0, 2.0, 10.0, 12.0, 4.0, 14.0, 6.0, 3.0, 11.0, 1.0, 9.0, 15.0, 7.0, 13.0, 5.0);
  float threshold = (bayer[bayerIndex] + 0.5) / 16.0;
  float shade = clamp((below - 1.0) / 9.0, 0.0, 1.0) * 3.0;
  float step3 = floor(shade) + step(threshold, fract(shade));
  float body = 0.94 - step3 * 0.13;
  float glint = below <= 3.0 ? step(0.992, hash(vec2(cell) + floor(uTime * 1.1 + hash(vec2(cell.yx)) * 9.0))) : 0.0;
  float core = crest * 0.6 + glint;
  outColor = vec4(body, core, 0.0, 1.0) * uLight;
}`,ct=`#version 300 es
precision highp float;
uniform sampler2D uSource;
uniform vec2 uTexel;
uniform vec2 uTarget;
out vec4 outColor;
void main() {
  vec2 uv = gl_FragCoord.xy / uTarget;
  vec4 sum = texture(uSource, uv) * 4.0;
  sum += texture(uSource, uv - uTexel);
  sum += texture(uSource, uv + uTexel);
  sum += texture(uSource, uv + vec2(uTexel.x, -uTexel.y));
  sum += texture(uSource, uv - vec2(uTexel.x, -uTexel.y));
  outColor = sum / 8.0;
}`,xt=`#version 300 es
precision highp float;
uniform sampler2D uSource;
uniform sampler2D uBase;
uniform vec2 uTexel;
uniform vec2 uTarget;
out vec4 outColor;
void main() {
  vec2 uv = gl_FragCoord.xy / uTarget;
  vec2 h = uTexel * 0.5;
  vec4 sum = texture(uSource, uv + vec2(-h.x * 2.0, 0.0));
  sum += texture(uSource, uv + vec2(h.x * 2.0, 0.0));
  sum += texture(uSource, uv + vec2(0.0, -h.y * 2.0));
  sum += texture(uSource, uv + vec2(0.0, h.y * 2.0));
  sum += texture(uSource, uv + vec2(-h.x, h.y)) * 2.0;
  sum += texture(uSource, uv + h) * 2.0;
  sum += texture(uSource, uv + vec2(h.x, -h.y)) * 2.0;
  sum += texture(uSource, uv - h) * 2.0;
  outColor = (sum / 12.0 + texture(uBase, uv)) * 0.5;
}`,ft=`#version 300 es
precision highp float;
uniform sampler2D uSnow;
uniform sampler2D uGlowMap;
uniform vec2 uResolution;
uniform vec2 uGrid;
uniform float uPixel;
uniform vec3 uColor;
uniform float uBrightness;
uniform float uGlow;
uniform float uFade;
uniform float uOpacity;
uniform float uLightMode;
out vec4 outColor;

float smootherstep(float edge, float x) {
  float t = clamp(x / max(edge, 0.0001), 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  ivec2 cell = ivec2(floor(gl_FragCoord.xy / uPixel));
  vec4 snow = texelFetch(uSnow, clamp(cell, ivec2(0), ivec2(uGrid) - 1), 0);
  vec2 glow = texture(uGlowMap, gl_FragCoord.xy / (uGrid * uPixel)).rg;
  float edge = uFade * 0.5;
  float mask = smootherstep(edge, uv.x) * smootherstep(edge, 1.0 - uv.x) * smootherstep(edge, uv.y) * smootherstep(edge, 1.0 - uv.y);
  mask *= uOpacity;
  float body = clamp(snow.r * uBrightness, 0.0, 1.0);
  float core = clamp(snow.g * uBrightness, 0.0, 1.0);
  float halo = clamp(glow.r * uGlow * uBrightness, 0.0, 1.0);
  if (uLightMode > 0.5) {
    vec3 tint = mix(uColor, vec3(1.0), clamp(core / max(body, 0.001), 0.0, 1.0) * 0.45);
    float alpha = body * 0.95;
    vec4 color = vec4(tint * alpha, alpha);
    float soft = halo * 0.22 * (1.0 - alpha);
    color += vec4(uColor * soft, soft);
    outColor = color * mask;
  } else {
    vec3 color = uColor * (body * 0.82 + core * 0.18) + uColor * halo * 0.55;
    color = 1.0 - exp(-color * 1.6);
    color *= mask;
    outColor = vec4(color, max(color.r, max(color.g, color.b)));
  }
}`,w=(s,E,f)=>Math.min(f,Math.max(E,s)),ht=s=>{let E=s>>>0;return()=>{E=E+1831565813>>>0;let f=E;return f=Math.imul(f^f>>>15,f|1),f^=f+Math.imul(f^f>>>7,f|61),((f^f>>>14)>>>0)/4294967296}},We=(s,E,f)=>{const T=s.createShader(E);return T?(s.shaderSource(T,f),s.compileShader(T),s.getShaderParameter(T,s.COMPILE_STATUS)?T:(s.deleteShader(T),null)):null},Z=(s,E,f,T)=>{const U=We(s,s.VERTEX_SHADER,E),C=We(s,s.FRAGMENT_SHADER,f),g=s.createProgram();if(!U||!C||!g)return null;if(s.attachShader(g,U),s.attachShader(g,C),T.forEach((R,y)=>s.bindAttribLocation(g,y,R)),s.linkProgram(g),s.deleteShader(U),s.deleteShader(C),!s.getProgramParameter(g,s.LINK_STATUS))return s.deleteProgram(g),null;const I={},q=s.getProgramParameter(g,s.ACTIVE_UNIFORMS);for(let R=0;R<q;R++){const y=s.getActiveUniform(g,R);y&&(I[y.name]=s.getUniformLocation(g,y.name))}return{program:g,uniforms:I}},mt=()=>{const s=H*ce,E=H*ue.length,f=new Uint8Array(s*E*4);return ue.forEach((T,U)=>{Ye[T].forEach((C,g)=>{C.forEach((I,q)=>{for(let R=0;R<I.length;R++){const y=I[R];if(y===".")continue;const $=((U*H+q)*s+g*H+R)*4;f[$]=255,f[$+1]=y==="@"?255:y==="o"?128:0,f[$+3]=255}})})}),{data:f,width:s,height:E}};function vt({color:s="#ffffff",variant:E="snowflake",density:f=.5,speed:T=1,wind:U=.25,sway:C=.5,flakeSize:g=1,pixelSize:I=3,depth:q=.6,brightness:R=1,glow:y=.8,twinkle:$=.35,accumulate:He=!1,mouseInteraction:qe=!0,intro:$e=!0,fade:je=0,opacity:Ke=1,lightMode:Qe=!1,paused:Je=!1,dpr:Ze,className:we="",...et}){const ye=Y.useRef(null),be=Y.useRef(null),j=Y.useRef(null),_e={color:String(s),variant:Math.max(0,ue.indexOf(E)),density:w(f,0,1),speed:T,wind:w(U,-2,2),sway:Math.max(0,C),flakeSize:w(g,0,2),pixelSize:Math.round(w(I,1,12)),depth:w(q,0,1),brightness:Math.max(0,R),glow:Math.max(0,y),twinkle:w($,0,1),accumulate:He,mouseInteraction:qe,intro:$e,fade:w(je,0,1),opacity:w(Ke,0,1),lightMode:Qe,paused:Je,dpr:Ze},L=Y.useRef(_e);return L.current=_e,Y.useEffect(()=>{var ze;const M=ye.current,_=be.current,e=_==null?void 0:_.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!M||!_||!e)return;const d={flake:Z(e,st,lt,["aCorner","aFlake"]),pile:Z(e,se,ut,["aPosition"]),down:Z(e,se,ct,["aPosition"]),up:Z(e,se,xt,["aPosition"]),composite:Z(e,se,ft,["aPosition"])};if(Object.values(d).some(t=>!t))return;const xe=mt(),fe=e.createTexture();e.bindTexture(e.TEXTURE_2D,fe),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,xe.width,xe.height,0,e.RGBA,e.UNSIGNED_BYTE,xe.data),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST);const Se=e.createBuffer(),ee=e.createVertexArray();e.bindVertexArray(ee),e.bindBuffer(e.ARRAY_BUFFER,Se),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0);const Me=e.createBuffer(),he=e.createBuffer(),me=e.createVertexArray();e.bindVertexArray(me),e.bindBuffer(e.ARRAY_BUFFER,Me),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),e.bindBuffer(e.ARRAY_BUFFER,he),e.enableVertexAttribArray(1),e.vertexAttribPointer(1,4,e.FLOAT,!1,0,0),e.vertexAttribDivisor(1,1),e.bindVertexArray(null);const X=t=>{const o={texture:e.createTexture(),framebuffer:e.createFramebuffer(),width:0,height:0};return e.bindTexture(e.TEXTURE_2D,o.texture),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,t),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,t),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),o},de=(t,o,i)=>{t.width===o&&t.height===i||(t.width=o,t.height=i,e.bindTexture(e.TEXTURE_2D,t.texture),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,o,i,0,e.RGBA,e.UNSIGNED_BYTE,null),e.bindFramebuffer(e.FRAMEBUFFER,t.framebuffer),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t.texture,0))},b=X(e.NEAREST),te=e.createTexture();e.bindTexture(e.TEXTURE_2D,te),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);let x=new Float32Array(0),oe=0;const P=[X(e.LINEAR),X(e.LINEAR),X(e.LINEAR)],z=[X(e.LINEAR),X(e.LINEAR)],G=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),re=((ze=window.matchMedia)==null?void 0:ze.call(window,"(prefers-reduced-motion: reduce)").matches)??!1,ve=new Map,tt=t=>{if(ve.has(t))return ve.get(t);let o=[1,1,1];if(G){G.clearRect(0,0,1,1),G.fillStyle="#ffffff",G.fillStyle=t,G.fillRect(0,0,1,1);const[i,a,l]=G.getImageData(0,0,1,1).data;o=[i/255,a/255,l/255]}return ve.set(t,o),o},A=ht(4271),N=[],u={width:1,height:1,ratio:1,pixel:1,gridWidth:1,gridHeight:1},m={x:0,y:0,vx:0,vy:0,inside:!1,time:0},v={time:0,intro:L.current.intro&&!re?0:1,push:0},K=new Float32Array(Ve*4);let B=0,O=0,ie=!0;const Fe=(t,o)=>{const i=o.flakeSize-1;let a=0;const l=it.map((c,n)=>c*Math.pow(2.2,i*(n-1.5))),h=l.reduce((c,n)=>c+n,0);for(let c=0;c<le;c++)if(a+=l[c]/h,t<=a)return c;return le-1},ge=(t,o,i)=>{t.level=Fe(A(),o),t.x=A()*(u.width+40)-20,t.y=i?-10-A()*30:A()*u.height,t.vx=0,t.vy=ke[t.level],t.phase=A()*Math.PI*2,t.rate=.6+A()*.9,t.sparkle=A()*100,t.drift=.7+A()*.6,t.alt=A()<.5,t.reveal=A(),t.levelSize=o.flakeSize},Ee=t=>{const o=Math.round(w(u.width*u.height*t.density/1100,0,Ve));for(;N.length<o;){const i={};ge(i,t,!1),N.push(i)}N.length>o&&(N.length=o)},ot=(t,o)=>{const i=t.speed,a=t.wind*46,l=120,h=v.push>.001&&m.inside,c=24,n=t.accumulate&&i>0&&x.length>0;for(const r of N){r.levelSize!==t.flakeSize&&(r.level=Fe(A(),t),r.levelSize=t.flakeSize);const p=r.level,ne=1-t.depth*(1-(p+1)/le)*.75,J=Math.sin(v.time*r.rate+r.phase)*t.sway*(6+p*7),Ae=(a*ne+J)*r.drift,k=ke[p]*ne*i*r.drift,Ge=1-Math.exp(-o*2.2);if(r.vx+=(Ae-r.vx)*Ge,r.vy+=(k-r.vy)*Ge,h){const D=r.x-m.x,ae=r.y-m.y,F=Math.hypot(D,ae);if(F<l&&F>.001){const S=1-F/l,W=S*S*S*v.push*1500*o,Ne=S*S*v.push*o*5;r.vx+=D/F*W+m.vx*Ne,r.vy+=ae/F*W+m.vy*Ne}}if(r.x+=r.vx*o,r.y+=r.vy*o,n){const D=Math.floor(r.x/u.pixel);if(D>=0&&D<x.length){const ae=u.height-x[D]*u.pixel;if(r.y>=ae&&x[D]>.5){const F=p;for(let S=-F;S<=F;S++){const W=D+S;W>=0&&W<x.length&&(x[W]+=(.35+p*.15)*(1-Math.abs(S)/(F+1)))}ge(r,t,!0),r.reveal=-1;continue}}}(i>=0?r.y>u.height+c:r.y<-c)&&(ge(r,t,!0),r.reveal=-1,i<0&&(r.y=u.height+10+A()*30)),r.x<-c?r.x+=u.width+c*2:r.x>u.width+c&&(r.x-=u.width+c*2)}},rt=(t,o)=>{if(!x.length)return;const i=Math.max(4,u.gridHeight*.08);if(t.accumulate&&t.speed>0){const a=(.25+t.density*.9)*o*Math.min(1,t.speed);for(let l=0;l<x.length;l++){const h=.55+.45*Math.sin(l*.045+Math.sin(l*.013)*2.1)*Math.sin(l*.021+1.3);x[l]<i*h&&(x[l]+=a*(.6+.8*h))}}for(let a=0;a<2;a++){const l=a===0;for(let h=0;h<x.length-1;h++){const c=l?h:x.length-2-h,n=x[c]-x[c+1];if(Math.abs(n)>1.2){const r=(Math.abs(n)-1.2)*.5*Math.sign(n);x[c]-=r,x[c+1]+=r}}}for(let a=0;a<x.length;a++){const l=Math.max(0,x[a]-i),h=t.accumulate&&t.speed>0?l*.8:2+x[a]*.6;x[a]=Math.max(0,x[a]-h*o)}},pe=(t,o,i,a)=>{e.bindFramebuffer(e.FRAMEBUFFER,o?o.framebuffer:null),e.viewport(0,0,i,a),e.useProgram(t.program),e.drawArrays(e.TRIANGLES,0,3)},Q=(t,o,i,a)=>{e.activeTexture(e.TEXTURE0+i),e.bindTexture(e.TEXTURE_2D,a),e.uniform1i(t.uniforms[o],i)},Te=()=>{const t=L.current;de(b,u.gridWidth,u.gridHeight);let o=0;const i=Ye[ue[t.variant]].map(n=>n.length),a=v.intro*1.75;for(const n of N){const r=n.level,p=1-t.depth*(1-nt[r]),ne=Math.pow(Math.max(0,Math.sin(v.time*.9+n.sparkle)),60)*t.twinkle,J=n.reveal<0||v.intro>=1?1:w((a-n.y/u.height-n.reveal*.25)/.35,0,1);if(J<=0)continue;const Ae=r>=2&&n.alt?r+3:r,k=o*4;K[k]=n.x/u.pixel,K[k+1]=n.y/u.pixel,K[k+2]=t.variant*ce+Ae,K[k+3]=Math.min(1,p*(.85+ne*.6))*J*J,o++}if(e.bindFramebuffer(e.FRAMEBUFFER,b.framebuffer),e.viewport(0,0,b.width,b.height),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),x.length&&x.some(n=>n>.4)){e.bindTexture(e.TEXTURE_2D,te),oe!==x.length?(oe=x.length,e.texImage2D(e.TEXTURE_2D,0,e.R32F,oe,1,0,e.RED,e.FLOAT,x)):e.texSubImage2D(e.TEXTURE_2D,0,0,0,oe,1,e.RED,e.FLOAT,x);const n=d.pile;e.useProgram(n.program),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,te),e.uniform1i(n.uniforms.uPile,0),e.uniform1f(n.uniforms.uTime,v.time),e.uniform1f(n.uniforms.uLight,1-t.depth*.1),e.bindVertexArray(ee),e.drawArrays(e.TRIANGLES,0,3)}if(o>0){const n=d.flake;e.useProgram(n.program),e.uniform2f(n.uniforms.uGrid,b.width,b.height),e.uniform4f(n.uniforms.uSizes,i[1],i[2],i[3],0),e.uniform1f(n.uniforms.uLargest,i[4]),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,fe),e.uniform1i(n.uniforms.uAtlas,0),e.enable(e.BLEND),e.blendEquation(e.MAX),e.bindVertexArray(me),e.bindBuffer(e.ARRAY_BUFFER,he),e.bufferData(e.ARRAY_BUFFER,K.subarray(0,o*4),e.DYNAMIC_DRAW),e.drawArraysInstanced(e.TRIANGLE_STRIP,0,4,o),e.blendEquation(e.FUNC_ADD),e.disable(e.BLEND)}e.bindVertexArray(ee);let l=b;for(let n=0;n<P.length;n++){const r=P[n];de(r,Math.max(1,Math.ceil(l.width/2)),Math.max(1,Math.ceil(l.height/2))),e.useProgram(d.down.program),e.uniform2f(d.down.uniforms.uTexel,1/l.width,1/l.height),e.uniform2f(d.down.uniforms.uTarget,r.width,r.height),Q(d.down,"uSource",0,l.texture),pe(d.down,r,r.width,r.height),l=r}for(let n=z.length-1;n>=0;n--){const r=n===z.length-1?P[P.length-1]:z[n+1],p=z[n];de(p,P[n].width,P[n].height),e.useProgram(d.up.program),e.uniform2f(d.up.uniforms.uTexel,1/r.width,1/r.height),e.uniform2f(d.up.uniforms.uTarget,p.width,p.height),Q(d.up,"uSource",0,r.texture),Q(d.up,"uBase",1,P[n].texture),pe(d.up,p,p.width,p.height)}const h=d.composite,c=h.uniforms;e.useProgram(h.program),e.uniform2f(c.uResolution,_.width,_.height),e.uniform2f(c.uGrid,b.width,b.height),e.uniform1f(c.uPixel,u.pixel*u.ratio),e.uniform3fv(c.uColor,tt(t.color)),e.uniform1f(c.uBrightness,t.brightness),e.uniform1f(c.uGlow,t.glow),e.uniform1f(c.uFade,t.fade),e.uniform1f(c.uOpacity,t.opacity),e.uniform1f(c.uLightMode,t.lightMode?1:0),Q(h,"uSnow",0,b.texture),Q(h,"uGlowMap",1,z[0].texture),pe(h,null,_.width,_.height)},Le=t=>{if(B=0,!ie||document.hidden)return;const o=L.current,i=O?Math.min(.05,(t-O)/1e3):1/60;O=t;const a=!o.paused&&!re;!o.intro||re?v.intro=1:v.intro<1&&(v.intro=Math.min(1,v.intro+i/at));const l=o.mouseInteraction&&m.inside&&!re?1:0;v.push+=(l-v.push)*(1-Math.exp(-i*(l?6:3))),m.vx*=Math.exp(-i*6),m.vy*=Math.exp(-i*6),Ee(o),a&&(v.time+=i,ot(o,i),rt(o,i)),Te(),a||Math.abs(l-v.push)>.001?B=requestAnimationFrame(Le):O=0},V=()=>{!B&&ie&&!document.hidden&&(B=requestAnimationFrame(Le))},Re=()=>{const t=L.current,o=Math.max(1,M.clientWidth),i=Math.max(1,M.clientHeight),a=Math.min(t.dpr||window.devicePixelRatio||1,2);u.width=o,u.height=i,u.ratio=a,u.pixel=Math.max(1,Math.round(t.pixelSize*a))/a,_.width=Math.max(1,Math.round(o*a)),_.height=Math.max(1,Math.round(i*a)),u.gridWidth=Math.max(1,Math.ceil(o/u.pixel)),u.gridHeight=Math.max(1,Math.ceil(i/u.pixel)),x.length!==u.gridWidth&&(x=new Float32Array(u.gridWidth)),Ee(t),B||Te(),V()},Pe=t=>{const o=M.getBoundingClientRect(),i=t.clientX-o.left,a=t.clientY-o.top,l=performance.now();if(m.inside&&m.time){const h=Math.max(1,l-m.time)/1e3;m.vx=w((i-m.x)/h,-3e3,3e3),m.vy=w((a-m.y)/h,-3e3,3e3)}m.x=i,m.y=a,m.time=l,m.inside=i>=0&&a>=0&&i<=o.width&&a<=o.height,V()},De=()=>{m.inside=!1,V()},Ue=()=>{O=0,V()},Ce=new ResizeObserver(Re);Ce.observe(M);const Ie=new IntersectionObserver(t=>{ie=t.some(o=>o.isIntersecting),ie&&(O=0,V())});Ie.observe(M),window.addEventListener("pointermove",Pe,{passive:!0}),document.documentElement.addEventListener("pointerleave",De),document.addEventListener("visibilitychange",Ue),Re();let Be=L.current.pixelSize,Xe=L.current.dpr;return j.current=()=>{const t=L.current;if(t.pixelSize!==Be||t.dpr!==Xe){Be=t.pixelSize,Xe=t.dpr,Re();return}Ee(t),B||Te(),V()},()=>{var t;cancelAnimationFrame(B),j.current=null,Ce.disconnect(),Ie.disconnect(),window.removeEventListener("pointermove",Pe),document.documentElement.removeEventListener("pointerleave",De),document.removeEventListener("visibilitychange",Ue);for(const o of[b,...P,...z])e.deleteTexture(o.texture),e.deleteFramebuffer(o.framebuffer);for(const o of Object.values(d))e.deleteProgram(o.program);e.deleteTexture(fe),e.deleteTexture(te),e.deleteBuffer(Se),e.deleteBuffer(Me),e.deleteBuffer(he),e.deleteVertexArray(ee),e.deleteVertexArray(me),(t=e.getExtension("WEBGL_lose_context"))==null||t.loseContext()}},[]),Y.useEffect(()=>{var M;(M=j.current)==null||M.call(j)}),Oe.jsx("div",{ref:ye,className:`pixel-snow-container${we?` ${we}`:""}`,...et,children:Oe.jsx("canvas",{ref:be,className:"pixel-snow-canvas","aria-hidden":"true"})})}export{vt as default};
