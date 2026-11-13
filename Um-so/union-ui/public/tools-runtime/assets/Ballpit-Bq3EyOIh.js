import{a as ut,j as xe}from"./index-DrbxZl7q.js";const ve=50,it=20,qt=1.5,lt=16,gt=12,pe=.01,we={satin:{roughness:.42,metalness:0,coat:.35,coatRoughness:.22,scatter:1,frost:0},matte:{roughness:.92,metalness:0,coat:0,coatRoughness:.5,scatter:.5,frost:0},gloss:{roughness:.2,metalness:0,coat:1,coatRoughness:.08,scatter:1,frost:0},frosted:{roughness:.55,metalness:0,coat:.6,coatRoughness:.18,scatter:1.5,frost:1},metal:{roughness:.3,metalness:1,coat:0,coatRoughness:.2,scatter:0,frost:0}},Ge=`#version 300 es
precision highp float;
layout(location = 0) in vec2 aCorner;
layout(location = 1) in vec4 aSphere;
layout(location = 2) in vec4 aColor;
layout(location = 3) in vec4 aShade;
uniform mat4 uProj;
uniform float uCameraZ;
uniform float uPixel;
out vec3 vPoint;
flat out vec3 vCenter;
flat out float vRadius;
flat out vec4 vColor;
flat out vec4 vShade;
void main() {
  vec3 c = vec3(aSphere.xy, aSphere.z - uCameraZ);
  float r = aSphere.w;
  float d = length(c);
  vec3 toCamera = -c / d;
  vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), toCamera));
  vec3 up = cross(toCamera, right);
  float reach = r * d / sqrt(max(d * d - r * r, 1e-4)) + uPixel * d * 2.0;
  vec3 p = c + (right * aCorner.x + up * aCorner.y) * reach;
  vPoint = p;
  vCenter = c;
  vRadius = r;
  vColor = aColor;
  vShade = aShade;
  gl_Position = uProj * vec4(p, 1.0);
}`,Ze=`#version 300 es
precision highp float;
in vec3 vPoint;
flat in vec3 vCenter;
flat in float vRadius;
flat in vec4 vColor;
flat in vec4 vShade;
uniform mat4 uProj;
uniform vec3 uLightPos;
uniform vec3 uLight;
uniform float uExposure;
uniform float uShadow;
uniform vec4 uSurface;
uniform vec2 uExtra;
out vec4 outColor;

const float PI = 3.14159265;

float lobe(vec3 d, vec3 axis, float sharp) {
  return pow(max(dot(d, axis), 0.0), sharp) * (sharp + 1.0) * 0.16;
}

vec3 studio(vec3 d, float rough) {
  float r = clamp(rough, 0.0, 1.0);
  float sharp = mix(60.0, 1.2, sqrt(r));
  vec3 col = mix(vec3(0.085, 0.085, 0.09), vec3(0.38, 0.38, 0.39), smoothstep(-0.7, 0.9, d.y));
  col += vec3(1.0, 0.99, 0.97) * 2.6 * lobe(d, normalize(vec3(-0.42, 0.78, 0.47)), sharp);
  col += vec3(0.97, 0.98, 1.0) * 1.1 * lobe(d, normalize(vec3(0.78, 0.22, 0.58)), sharp * 0.7);
  col += vec3(1.0) * 1.3 * lobe(d, normalize(vec3(0.15, 0.55, -0.82)), sharp * 0.8);
  return col;
}

vec2 envBRDF(float NoV, float rough) {
  vec4 c0 = vec4(-1.0, -0.0275, -0.572, 0.022);
  vec4 c1 = vec4(1.0, 0.0425, 1.04, -0.04);
  vec4 r = rough * c0 + c1;
  float a = min(r.x * r.x, exp2(-9.28 * NoV)) * r.x + r.y;
  return vec2(-1.04, 1.04) * a + r.zw;
}

float ggx(float NoH, float a) {
  float a2 = a * a;
  float d = NoH * NoH * (a2 - 1.0) + 1.0;
  return a2 / (PI * d * d);
}

float smith(float NoV, float NoL, float a) {
  float k = a * 0.5;
  return 0.25 / max((NoV * (1.0 - k) + k) * (NoL * (1.0 - k) + k), 1e-4);
}

vec3 aces(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}

void main() {
  vec3 rd = normalize(vPoint);
  float b = dot(vCenter, rd);
  float h = length(vCenter - rd * b);
  float r = vRadius;
  float aa = max(fwidth(h), 1e-5);
  float cover = clamp((r - h) / aa + 0.5, 0.0, 1.0);
  if (cover <= 0.002) discard;
  float hc = min(h, r * 0.9995);
  float t = b - sqrt(r * r - hc * hc);
  vec3 pos = rd * t;
  vec3 n = normalize(pos - vCenter);
  vec4 clip = uProj * vec4(pos, 1.0);
  gl_FragDepth = clamp(clip.z / clip.w * 0.5 + 0.5, 0.0, 1.0);

  vec3 v = -rd;
  vec3 albedo = vColor.rgb;
  bool lamp = vColor.a > 0.5;
  vec3 dn = fwidth(n);
  float rough = sqrt(min(uSurface.x * uSurface.x + dot(dn, dn) * 0.6, 1.0));
  float metal = uSurface.y;
  float coat = uSurface.z;
  float coatRough = sqrt(min(uSurface.w * uSurface.w + dot(dn, dn) * 0.6, 1.0));
  float NoV = clamp(dot(n, v), 1e-4, 1.0);
  vec3 R = reflect(-v, n);

  float occlusion = vShade.w * smoothstep(-0.15, 0.9, dot(n, vShade.xyz));
  float ao = 1.0 - uShadow * occlusion;
  float specAo = 1.0 - uShadow * occlusion * 0.7;

  vec3 L = uLightPos - pos;
  float dist2 = dot(L, L);
  L *= inversesqrt(dist2);
  vec3 radiance = lamp ? vec3(0.0) : uLight / (dist2 + 1.0);
  float NoL = clamp(dot(n, L), 0.0, 1.0);
  vec3 H = normalize(L + v);
  float NoH = clamp(dot(n, H), 0.0, 1.0);
  float VoH = clamp(dot(v, H), 0.0, 1.0);

  vec3 F0 = mix(vec3(0.04), albedo, metal);
  vec2 ab = envBRDF(NoV, rough);
  vec3 Fr = max(vec3(1.0 - rough), F0) - F0;
  vec3 kS = F0 + Fr * pow(1.0 - NoV, 5.0);
  vec3 diffuseColor = albedo * (1.0 - metal);
  vec3 irradiance = studio(n, 1.0) * 1.15;
  vec3 envSpec = studio(R, rough) * (F0 * ab.x + ab.y);
  vec3 col = diffuseColor * irradiance * (1.0 - kS) * ao + envSpec * specAo;
  vec3 F = F0 + (1.0 - F0) * pow(1.0 - VoH, 5.0);
  float a = max(rough * rough, 0.06);
  vec3 spec = ggx(NoH, a) * smith(NoV, NoL, a) * F;
  float wrap = clamp((dot(n, L) + 0.3) / 1.3, 0.0, 1.0);
  col += (diffuseColor * (1.0 - F) / PI * wrap + spec * NoL) * radiance;
  vec3 sh = normalize(L + n * 0.1);
  float scatter = pow(clamp(dot(v, -sh), 0.0, 1.0), 2.0) * 10.0 + 0.04;
  col += scatter * albedo * radiance * 0.03 * uExtra.x;
  float alpha = 1.0;
  if (uExtra.y > 0.5) {
    float rim = pow(1.0 - NoV, 2.5);
    col += albedo * (studio(-R, 1.0) * 0.35 + 0.06) * (1.0 - rim);
    col += radiance * albedo * pow(max(dot(-v, L), 0.0), 3.0) * 0.08;
    alpha = mix(0.5, 0.96, rim);
  }
  if (coat > 0.0) {
    float Fc = 0.04 + 0.96 * pow(1.0 - NoV, 5.0);
    float ca = max(coatRough * coatRough, 0.03);
    vec3 coatEnv = studio(R, coatRough) * Fc;
    float coatSpec = ggx(NoH, ca) * smith(NoV, NoL, ca) * (0.04 + 0.96 * pow(1.0 - VoH, 5.0)) * NoL;
    col = col * (1.0 - Fc * coat) + (coatEnv * specAo + radiance * coatSpec) * coat;
    alpha = mix(alpha, 1.0, Fc * coat);
  }
  if (lamp) col += uLight * 0.0025 * (0.4 + 0.6 * albedo);
  col = aces(col * uExposure);
  col = pow(col, vec3(1.0 / 2.2));
  col += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
  float a2 = alpha * cover;
  outColor = vec4(col * a2, a2);
}`,j=(w,k,V)=>Math.min(V,Math.max(k,w)),ye=(w,k,V)=>{const E=w.createShader(k);return E?(w.shaderSource(E,V),w.compileShader(E),w.getShaderParameter(E,w.COMPILE_STATUS)?E:(w.deleteShader(E),null)):null},$e=w=>{const k=ye(w,w.VERTEX_SHADER,Ge),V=ye(w,w.FRAGMENT_SHADER,Ze),E=w.createProgram();if(!k||!V||!E)return null;if(w.attachShader(E,k),w.attachShader(E,V),w.linkProgram(E),w.deleteShader(k),w.deleteShader(V),!w.getProgramParameter(E,w.LINK_STATUS))return w.deleteProgram(E),null;const tt={},_t=w.getProgramParameter(E,w.ACTIVE_UNIFORMS);for(let mt=0;mt<_t;mt++){const xt=w.getActiveUniform(E,mt);xt&&(tt[xt.name]=w.getUniformLocation(E,xt.name))}return{program:E,uniforms:tt}},Me=w=>{let k;if(typeof w=="number")k=[(w>>16&255)/255,(w>>8&255)/255,(w&255)/255];else{let V=String(w||"#ffffff").replace("#","").trim();(V.length===3||V.length===4)&&(V=V.slice(0,3).split("").map(tt=>tt+tt).join(""));const E=parseInt(V.slice(0,6),16);k=Number.isNaN(E)?[1,1,1]:[(E>>16&255)/255,(E>>8&255)/255,(E&255)/255]}return k.map(V=>Math.pow(V,2.2))},Qe=({count:w=200,colors:k=["#ffffff"],material:V="satin",minSize:E=.5,maxSize:tt=1,gravity:_t=.5,friction:mt=.9975,wallBounce:xt=.95,bounce:ge=.85,depth:Ae=2,drift:be=0,followCursor:ze=!0,cursorSize:Se=1,grab:Re=!0,clickEffect:Fe="burst",lightColor:Ee="#ffffff",lightIntensity:Tt=1,exposure:Le=1,shadows:Pe=.6,intro:Ce=!0,dpr:Ie,className:Ne="",style:Be})=>{const Wt=ut.useRef(null),Ot=ut.useRef(null),vt=ut.useRef(null),Xt={count:Math.round(j(w,1,4e3)),colors:Array.isArray(k)&&k.length?k:["#ffffff"],material:we[V]?V:"satin",minSize:Math.max(.05,Math.min(E,tt)),maxSize:Math.max(.05,Math.max(E,tt)),gravity:_t,friction:j(mt,.5,1),wallBounce:j(xt,0,1),bounce:j(ge,0,1),depth:Math.max(0,Ae),drift:Math.max(0,be),followCursor:ze,cursorSize:Math.max(0,Se),grab:Re,clickEffect:Fe,lightColor:Ee,lightIntensity:Tt>20?Tt/200:Math.max(0,Tt),exposure:Math.max(0,Le),shadows:j(Pe,0,1),intro:Ce,dpr:Ie},et=ut.useRef(Xt);return et.current=Xt,ut.useEffect(()=>{var de;const O=Wt.current,G=Ot.current,s=G==null?void 0:G.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!0,stencil:!1,powerPreference:"high-performance"});if(!O||!G||!s)return;const At=$e(s);if(!At)return;const Z=At.uniforms,bt=((de=window.matchMedia)==null?void 0:de.call(window,"(prefers-reduced-motion: reduce)").matches)??!1,f={width:1,height:1,ratio:1,halfW:9,halfH:9,fit:1,tan:Math.tan(ve*Math.PI/360)},st=new Float32Array(16),Vt=s.createVertexArray();s.bindVertexArray(Vt);const Gt=s.createBuffer();s.bindBuffer(s.ARRAY_BUFFER,Gt),s.bufferData(s.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),s.STATIC_DRAW),s.enableVertexAttribArray(0),s.vertexAttribPointer(0,2,s.FLOAT,!1,0,0);const zt=s.createBuffer();s.bindBuffer(s.ARRAY_BUFFER,zt);for(let t=0;t<3;t++)s.enableVertexAttribArray(1+t),s.vertexAttribPointer(1+t,4,s.FLOAT,!1,gt*4,t*16),s.vertexAttribDivisor(1+t,1);s.bindVertexArray(null);let Ut=0,L=0,b=new Float32Array(0),y=new Float32Array(0),g=new Float32Array(0),v=new Float32Array(0),p=new Float32Array(0),M=new Float32Array(0),C=new Float32Array(0),ot=new Float32Array(0),pt=new Float32Array(0),St=new Float32Array(0),H=new Float32Array(0),nt=new Float32Array(0),wt=new Uint16Array(0),$=new Uint8Array(0),Rt=new Int32Array(0),kt=new Int32Array(0),K=new Int32Array(1),z=new Float32Array(gt),Q=new Int32Array(2),Dt=new Int32Array(2),Ft=[],Zt="",$t="";const He=t=>{const n=(o,c=1)=>{const i=new Float32Array(t*c);return i.set(o.subarray(0,Math.min(o.length,i.length))),i},r=o=>{const c=new Uint8Array(t);return c.set(o.subarray(0,Math.min(o.length,c.length))),c};b=n(b),y=n(y),g=n(g),v=n(v),p=n(p),M=n(M),C=n(C),ot=n(ot),pt=n(pt),St=n(St),H=n(H,4),nt=n(nt,3);const a=new Uint16Array(t);a.set(wt.subarray(0,Math.min(wt.length,t))),wt=a,$=r($),Rt=new Int32Array(t),kt=new Int32Array(t),K=new Int32Array(t+1),z=new Float32Array((t+1)*gt),Ut=t,s.bindBuffer(s.ARRAY_BUFFER,zt),s.bufferData(s.ARRAY_BUFFER,z.byteLength,s.DYNAMIC_DRAW)},B={inside:!1,down:!1,downX:0,downY:0,downAt:0,moved:!1},d={x:0,y:0,z:0,r:0,tx:0,ty:0,vx:0,vy:0},_={x:0,y:5,z:6,flash:0},x={index:-1,ox:0,oy:0,tx:0,ty:0,vx:0,vy:0};let Et=0,yt=0,Mt=0,Lt=0,Pt=!0,Ct=0;const _e=(t,n,r)=>{const a=C[t],o=Math.max(n.depth-a,0);if($[t]=1,r&&n.gravity>.05)b[t]=(Math.random()*2-1)*Math.max(f.halfW-a,.01),y[t]=f.halfH+a+Math.random()*f.halfH*2.2,g[t]=(Math.random()*2-1)*o,v[t]=(Math.random()-.5)*2,p[t]=-(4+Math.random()*5),M[t]=0,$[t]=0;else if(r){const c=(Math.random()*2-1)*Math.max(f.halfW-a,.01),i=(Math.random()*2-1)*Math.max(f.halfH-a,.01),l=(Math.random()*2-1)*o;b[t]=(Math.random()*2-1)*.6,y[t]=(Math.random()*2-1)*.6,g[t]=(Math.random()*2-1)*Math.min(o,.3),v[t]=(c-b[t])*2.2,p[t]=(i-y[t])*2.2,M[t]=(l-g[t])*2.2,yt=1}else b[t]=(Math.random()*2-1)*Math.max(f.halfW-a,.01),y[t]=(Math.random()*2-1)*Math.max(f.halfH-a,.01),g[t]=(Math.random()*2-1)*o,v[t]=0,p[t]=0,M[t]=0},Te=t=>{for(let n=0;n<L;n++)C[n]=(t.minSize+pt[n]*(t.maxSize-t.minSize))*f.fit,ot[n]=1/(C[n]*C[n]*C[n])},Ve=t=>{Ft=t.colors.map(Me),Zt=t.colors.join("|")},Kt=(t,n)=>{const r=`${t.minSize}:${t.maxSize}:${f.fit}`;if(t.count!==L){t.count>Ut&&He(Math.max(t.count,Math.ceil(Ut*1.5)));const a=L;L=t.count;for(let o=a;o<L;o++)pt[o]=Math.random(),wt[o]=o,St[o]=Math.random()*Math.PI*2,C[o]=(t.minSize+pt[o]*(t.maxSize-t.minSize))*f.fit,ot[o]=1/(C[o]*C[o]*C[o]),_e(o,t,(n?t.intro:!0)&&!bt);for(let o=0;o<=L;o++)K[o]=o}r!==$t&&($t=r,Te(t)),t.colors.join("|")!==Zt&&Ve(t)};let u=new Float32Array(0),Y=0;const P={scale:1,x0:0,y0:0,z0:0,nx:1,ny:1,nz:1},Ue=(t,n)=>{P.scale=1/t,P.x0=-f.halfW-t,P.y0=-f.halfH-t,P.z0=-Math.max(n.depth,n.maxSize)-t,P.nx=Math.max(1,Math.ceil((f.halfW*2+t*2)*P.scale)+1),P.ny=Math.max(1,Math.ceil((f.halfH*2+t*2)*P.scale)+1),P.nz=Math.max(1,Math.ceil((Math.max(n.depth,n.maxSize)*2+t*2)*P.scale)+1);const r=P.nx*P.ny*P.nz;Q.length<r+1&&(Q=new Int32Array(r+1),Dt=new Int32Array(r+1)),Q.fill(0,0,r+1);for(let a=0;a<L;a++){const o=j(Math.floor((b[a]-P.x0)*P.scale),0,P.nx-1),c=j(Math.floor((y[a]-P.y0)*P.scale),0,P.ny-1),l=(j(Math.floor((g[a]-P.z0)*P.scale),0,P.nz-1)*P.ny+c)*P.nx+o;Rt[a]=l,Q[l+1]++}for(let a=1;a<=r;a++)Q[a]+=Q[a-1];Dt.set(Q.subarray(0,r+1));for(let a=0;a<L;a++)kt[Dt[Rt[a]]++]=a},ft=(t,n,r,a,o,c,i)=>{if(n>=i||Y*8>=u.length)return;const l=v[t]*r+p[t]*a+M[t]*o,e=Y*8;u[e]=t,u[e+1]=-2,u[e+2]=r,u[e+3]=a,u[e+4]=o,u[e+5]=n,u[e+6]=l<-1.5?-c*l:0,u[e+7]=0,Y++},ke=(t,n,r,a)=>{const o=x.index,{nx:c,ny:i,nz:l}=P;Y=0;for(let e=0;e<L;e++){const h=Rt[e],m=h%c,R=Math.floor(h/c)%i,U=Math.floor(h/(c*i));for(let I=U>0?-1:0;I<=(U<l-1?1:0);I++)for(let F=R>0?-1:0;F<=(R<i-1?1:0);F++){const A=((U+I)*i+R+F)*c;for(let N=m>0?-1:0;N<=(m<c-1?1:0);N++){const T=A+m+N;for(let D=Q[T];D<Q[T+1];D++){const S=kt[D];if(S<=e)continue;const q=b[S]-b[e],J=y[S]-y[e],X=g[S]-g[e],W=q*q+J*J+X*X,ht=C[e]+C[S],ue=Math.max(ht+a,r?ht*1.4:0);if(W>=ue*ue||W<1e-12)continue;const dt=Math.sqrt(W),Nt=q/dt,Bt=J/dt,Ht=X/dt;if(r){const ct=j(1-(dt-ht)/(ht*.4),0,1);H[e*4]+=Nt*ct,H[e*4+1]+=Bt*ct,H[e*4+2]+=Ht*ct,H[e*4+3]+=ct,H[S*4]-=Nt*ct,H[S*4+1]-=Bt*ct,H[S*4+2]-=Ht*ct,H[S*4+3]+=ct}if(dt>=ht+a||Y*8>=u.length||e===o&&S===o)continue;const me=(v[S]-v[e])*Nt+(p[S]-p[e])*Bt+(M[S]-M[e])*Ht,rt=Y*8;u[rt]=e,u[rt+1]=S,u[rt+2]=Nt,u[rt+3]=Bt,u[rt+4]=Ht,u[rt+5]=dt-ht,u[rt+6]=me<-1.5?-t.bounce*me:0,u[rt+7]=0,Y++}}}if(e!==o){const I=C[e],F=Math.max(t.depth-I,0);ft(e,b[e]+f.halfW-I,1,0,0,t.wallBounce,a),ft(e,f.halfW-I-b[e],-1,0,0,t.wallBounce,a),ft(e,y[e]+f.halfH-I,0,1,0,t.wallBounce,a),$[e]&&ft(e,f.halfH-I-y[e],0,-1,0,t.wallBounce,a),ft(e,g[e]+F,0,0,1,t.wallBounce,a),ft(e,F-g[e],0,0,-1,t.wallBounce,a)}if(d.r>.01&&e!==o&&Y*8<u.length){const I=b[e]-d.x,F=y[e]-d.y,A=g[e]-d.z,N=C[e]+d.r,T=I*I+F*F+A*A;if(T<(N+a)*(N+a)&&T>1e-12){const D=Math.sqrt(T),S=I/D,q=F/D,J=A/D,X=(v[e]-d.vx)*S+(p[e]-d.vy)*q+M[e]*J,W=Y*8;u[W]=e,u[W+1]=-1,u[W+2]=S,u[W+3]=q,u[W+4]=J,u[W+5]=D-N,u[W+6]=X<-1.5?-t.bounce*X:0,u[W+7]=0,Y++}}}},De=t=>{const n=x.index,r=L>800?5:8;for(let a=0;a<r;a++)for(let o=0;o<Y;o++){const c=o*8,i=u[c],l=u[c+1],e=u[c+2],h=u[c+3],m=u[c+4],R=u[c+5],U=R>0?-R/t:u[c+6],I=u[c+7];if(l<0){const q=l===-1?(v[i]-d.vx)*e+(p[i]-d.vy)*h+M[i]*m:v[i]*e+p[i]*h+M[i]*m,J=Math.max(I+U-q,0),X=J-I;u[c+7]=J,v[i]+=X*e,p[i]+=X*h,M[i]+=X*m;continue}const F=i===n?0:ot[i],A=l===n?0:ot[l],N=F+A;if(N<=0)continue;const T=(v[l]-v[i])*e+(p[l]-p[i])*h+(M[l]-M[i])*m,D=Math.max(I+(U-T)/N,0),S=D-I;u[c+7]=D,v[i]-=S*F*e,p[i]-=S*F*h,M[i]-=S*F*m,v[l]+=S*A*e,p[l]+=S*A*h,M[l]+=S*A*m}},je=()=>{const t=x.index;for(let n=0;n<2;n++)for(let r=0;r<Y;r++){const a=r*8,o=u[a],c=u[a+1];if(c===-2)continue;if(c<0){const A=b[o]-d.x,N=y[o]-d.y,T=g[o]-d.z,D=Math.sqrt(A*A+N*N+T*T),S=C[o]+d.r-D-pe;if(S<=0||D<1e-6)continue;const q=S*.5/D;b[o]+=A*q,y[o]+=N*q,g[o]+=T*q;continue}const i=b[c]-b[o],l=y[c]-y[o],e=g[c]-g[o],h=Math.sqrt(i*i+l*l+e*e),m=C[o]+C[c]-h-pe;if(m<=0||h<1e-6)continue;const R=o===t?0:ot[o],U=c===t?0:ot[c],I=R+U;if(I<=0)continue;const F=m*.3/(h*I);b[o]-=i*F*R,y[o]-=l*F*R,g[o]-=e*F*R,b[c]+=i*F*U,y[c]+=l*F*U,g[c]+=e*F*U}},Ye=t=>{const n=f.halfW,r=f.halfH,a=t.wallBounce;for(let o=0;o<L;o++){const c=C[o];b[o]<-n+c?(b[o]=-n+c,v[o]<0&&(v[o]=v[o]<-1.5?-v[o]*a:0)):b[o]>n-c&&(b[o]=n-c,v[o]>0&&(v[o]=v[o]>1.5?-v[o]*a:0)),y[o]<-r+c?(y[o]=-r+c,p[o]<0&&(p[o]=p[o]<-1.5?-p[o]*a:0),v[o]*=.995,M[o]*=.995):$[o]&&y[o]>r-c&&(y[o]=r-c,p[o]>0&&(p[o]=p[o]>1.5?-p[o]*a:0)),!$[o]&&y[o]<r-c&&($[o]=1);const i=Math.max(t.depth-c,0);g[o]<-i?(g[o]=-i,M[o]<0&&(M[o]=M[o]<-1.5?-M[o]*a:0)):g[o]>i&&(g[o]=i,M[o]>0&&(M[o]=M[o]>1.5?-M[o]*a:0))}},qe=(t,n,r)=>{const a=t.gravity*45,o=Math.pow(t.friction,n*60)*(yt>0?Math.exp(-2.2*n):1),c=bt?0:t.drift*2.2,i=t.maxSize*f.fit,l=i*.3;u.length<L*96&&(u=new Float32Array(L*96));for(let e=0;e<L;e++){if(e===x.index){const m=1-Math.exp(-n/.02);v[e]=(x.tx-b[e])*m/n,p[e]=(x.ty-y[e])*m/n,M[e]=0;continue}if(p[e]-=a*n,c){const m=St[e];v[e]+=Math.sin(Et*.63+m)*c*n,p[e]+=Math.cos(Et*.47+m*1.7)*c*n,M[e]+=Math.sin(Et*.41+m*2.3)*c*n*.5}v[e]*=o,p[e]*=o,M[e]*=o;const h=v[e]*v[e]+p[e]*p[e]+M[e]*M[e];if(h>lt*lt){const m=lt/Math.sqrt(h);v[e]*=m,p[e]*=m,M[e]*=m}}Ue(i*(r?2.8:2.3),t),r&&H.fill(0,0,L*4),ke(t,n,r,l),De(n);for(let e=0;e<L;e++)b[e]+=v[e]*n,y[e]+=p[e]*n,g[e]+=M[e]*n;if(je(),Ye(t),r)for(let e=0;e<L;e++){const h=y[e]-C[e]+f.halfH,m=C[e]*.5;if(h>=m)continue;const R=1-Math.max(h,0)/m;H[e*4+1]-=R,H[e*4+3]+=R}if(x.index>=0){const e=x.index;x.vx+=(v[e]-x.vx)*(1-Math.exp(-n/.05)),x.vy+=(p[e]-x.vy)*(1-Math.exp(-n/.05))}},Qt=(t,n)=>{const r=O.getBoundingClientRect(),a=(t-r.left)/Math.max(r.width,1)*2-1,o=1-(n-r.top)/Math.max(r.height,1)*2;return[a*f.tan*(f.width/f.height),o*f.tan,-1]},It=(t,n)=>{const r=(n-it)/t[2];return[t[0]*r,t[1]*r]},We=t=>{const n=Math.hypot(t[0],t[1],t[2]),r=t[0]/n,a=t[1]/n,o=t[2]/n;let c=-1,i=1/0;for(let l=0;l<L;l++){const e=-b[l],h=-y[l],m=it-g[l],R=e*r+h*a+m*o,U=C[l]*1.15,I=e*e+h*h+m*m-U*U,F=R*R-I;if(F<0)continue;const A=-R-Math.sqrt(F);A>0&&A<i&&(i=A,c=l)}return c},Oe=(t,n)=>{const r=et.current,a=f.halfH*.7;for(let o=0;o<L;o++){const c=b[o]-t,i=y[o]-n,l=g[o],e=Math.hypot(c,i,l);if(e>=a||e<1e-4)continue;const h=Math.pow(1-e/a,2)*26*(1+.6/(C[o]+.4));v[o]+=c/e*h,p[o]+=i/e*h+h*.25,M[o]+=l/e*h*.5}_.x=t,_.y=n,_.z=Math.max(r.depth,1)+1.5,_.flash=1};let Jt=et.current.dpr;const jt=()=>{const t=et.current;Jt=t.dpr,f.width=Math.max(1,O.clientWidth),f.height=Math.max(1,O.clientHeight),f.ratio=Math.min(t.dpr||window.devicePixelRatio||1,2),G.width=Math.max(1,Math.round(f.width*f.ratio)),G.height=Math.max(1,Math.round(f.height*f.ratio));const n=f.width/f.height,r=Math.tan(ve*Math.PI/360);f.tan=n>qt?r*qt/n:r,f.halfH=f.tan*it,f.halfW=f.halfH*n,f.fit=j(Math.sqrt(f.halfW*f.halfH/(r*r*it*it*qt)),.4,1);const a=1/f.tan,o=1,c=80;st.fill(0),st[0]=a/n,st[5]=a,st[10]=(c+o)/(o-c),st[11]=-1,st[14]=2*c*o/(o-c),L||Kt(t,!0),te(),at()},te=()=>{const t=et.current,n=we[t.material];let r=0;const a=L+1;for(let i=1;i<a;i++){const l=K[i],e=l===L?d.z:g[l];let h=i-1;for(;h>=0&&(K[h]===L?d.z:g[K[h]])>e;)K[h+1]=K[h],h--;K[h+1]=l}for(let i=0;i<a;i++){const l=K[i],e=r*gt;if(l===L){if(d.r<.01||!t.followCursor)continue;const h=Ft[0]||[1,1,1];z[e]=d.x,z[e+1]=d.y,z[e+2]=d.z,z[e+3]=d.r,z[e+4]=h[0],z[e+5]=h[1],z[e+6]=h[2],z[e+7]=1,z[e+8]=0,z[e+9]=0,z[e+10]=0,z[e+11]=0}else{const h=Ft[wt[l]%Ft.length];z[e]=b[l],z[e+1]=y[l],z[e+2]=g[l],z[e+3]=C[l],z[e+4]=h[0],z[e+5]=h[1],z[e+6]=h[2],z[e+7]=0;const m=H[l*4+3],R=Math.hypot(H[l*4],H[l*4+1],H[l*4+2])||1;z[e+8]=H[l*4]/R,z[e+9]=H[l*4+1]/R,z[e+10]=H[l*4+2]/R,z[e+11]=Math.min(m*.55,1)}r++}if(s.viewport(0,0,G.width,G.height),s.clearColor(0,0,0,0),s.clearDepth(1),s.clear(s.COLOR_BUFFER_BIT|s.DEPTH_BUFFER_BIT),!r)return;s.enable(s.DEPTH_TEST),s.depthFunc(s.LEQUAL),s.enable(s.BLEND),s.blendFunc(s.ONE,s.ONE_MINUS_SRC_ALPHA),s.useProgram(At.program),s.uniformMatrix4fv(Z.uProj,!1,st),s.uniform1f(Z.uCameraZ,it),s.uniform1f(Z.uPixel,2*f.tan/G.height);const o=Me(t.lightColor),c=t.lightIntensity*60*(1+_.flash*3);s.uniform3f(Z.uLight,o[0]*c,o[1]*c,o[2]*c),s.uniform3f(Z.uLightPos,_.x,_.y,_.z-it),s.uniform1f(Z.uExposure,t.exposure),s.uniform1f(Z.uShadow,t.shadows),s.uniform4f(Z.uSurface,n.roughness,n.metalness,n.coat,n.coatRoughness),s.uniform2f(Z.uExtra,n.scatter,n.frost),s.bindBuffer(s.ARRAY_BUFFER,zt),s.bufferSubData(s.ARRAY_BUFFER,0,z,0,r*gt),s.bindVertexArray(Vt),s.drawArraysInstanced(s.TRIANGLE_STRIP,0,4,r),s.bindVertexArray(null)},ee=t=>{if(Mt=0,!Pt||document.hidden)return;const n=et.current;n.dpr!==Jt&&jt();const r=Lt?j((t-Lt)/1e3,0,1/20):1/60;Lt=t,Et+=r,yt=Math.max(0,yt-r),Kt(n,!1);const a=n.followCursor&&B.inside&&x.index<0?n.cursorSize*f.fit:0;d.r+=(a-d.r)*(1-Math.exp(-r/.12));const o=1-Math.exp(-r/.06),c=d.x,i=d.y;d.x+=(d.tx-d.x)*o,d.y+=(d.ty-d.y)*o,d.vx=j((d.x-c)/Math.max(r,.001),-lt,lt),d.vy=j((d.y-i)/Math.max(r,.001),-lt,lt);const l=0,e=f.halfH*.75,h=n.depth+4,m=B.inside?[d.x,d.y,n.followCursor?d.z:1.5]:_.flash>.05?[_.x,_.y,_.z]:[l,e,h],R=1-Math.exp(-r/.08);if(_.x+=(m[0]-_.x)*R,_.y+=(m[1]-_.y)*R,_.z+=(m[2]-_.z)*R,_.flash*=Math.exp(-r/.3),r>1e-4){const A=Math.min(6,Math.max(1,Math.ceil(r/.005555555555555556))),N=r/A;for(let T=0;T<A;T++)qe(n,N,T===A-1)}te();let U=0;for(let A=0;A<L;A++){const N=A*3,T=Math.abs(b[A]-nt[N])+Math.abs(y[A]-nt[N+1])+Math.abs(g[A]-nt[N+2]);T>U&&(U=T),nt[N]=b[A],nt[N+1]=y[A],nt[N+2]=g[A]}Ct=U/Math.max(r,.001)>.6||B.inside||x.index>=0||_.flash>.01||yt>0||d.r>.01||n.drift>0&&!bt?0:Ct+r,Ct<.8&&(Mt=requestAnimationFrame(ee))};function at(){Ct=0,!Mt&&Pt&&!document.hidden&&(Lt=0,Mt=requestAnimationFrame(ee))}const Yt=t=>{const n=O.getBoundingClientRect(),r=t.clientX-n.left,a=t.clientY-n.top;return r>=0&&a>=0&&r<=n.width&&a<=n.height},oe=t=>{const n=Qt(t.clientX,t.clientY),[r,a]=It(n,d.z);if(d.tx=r,d.ty=a,x.index>=0){const[o,c]=It(n,g[x.index]);x.tx=o-x.ox,x.ty=c-x.oy}return n},ne=t=>{const n=B.inside;B.inside=Yt(t)||x.index>=0,B.inside&&(oe(t),n||(d.x=d.tx,d.y=d.ty),B.down&&Math.hypot(t.clientX-B.downX,t.clientY-B.downY)>6&&(B.moved=!0)),(B.inside||n)&&at()},Xe=t=>t instanceof Element&&t.closest('a, button, input, textarea, select, label, [role="button"]'),ae=t=>{if(t.button!==0||!Yt(t)||Xe(t.target))return;const n=et.current;B.down=!0,B.moved=!1,B.downX=t.clientX,B.downY=t.clientY,B.downAt=performance.now();const r=oe(t);if(n.grab){const a=We(r);if(a>=0){const[o,c]=It(r,g[a]);x.index=a,x.ox=o-b[a],x.oy=c-y[a],x.tx=b[a],x.ty=y[a],x.vx=0,x.vy=0,t.pointerType==="mouse"&&t.preventDefault()}}at()},re=t=>{const n=et.current;if(x.index>=0){const r=x.index,a=Math.hypot(x.vx,x.vy),o=a>22?22/a:1;v[r]=x.vx*o,p[r]=x.vy*o,x.index=-1,$[r]=1}else if(t&&B.down&&!B.moved&&performance.now()-B.downAt<400&&n.clickEffect==="burst"&&!bt&&Yt(t)){const[r,a]=It(Qt(t.clientX,t.clientY),0);Oe(r,a)}B.down=!1,at()},ce=t=>re(t),se=()=>re(null),ie=()=>{B.inside=x.index>=0,at()},le=()=>at(),fe=new ResizeObserver(jt);fe.observe(O);const he=new IntersectionObserver(t=>{Pt=t.some(n=>n.isIntersecting),Pt&&at()});return he.observe(O),window.addEventListener("pointermove",ne,{passive:!0}),window.addEventListener("pointerdown",ae),window.addEventListener("pointerup",ce,{passive:!0}),window.addEventListener("pointercancel",se,{passive:!0}),document.documentElement.addEventListener("pointerleave",ie),document.addEventListener("visibilitychange",le),jt(),vt.current=at,()=>{var t;cancelAnimationFrame(Mt),vt.current=null,fe.disconnect(),he.disconnect(),window.removeEventListener("pointermove",ne),window.removeEventListener("pointerdown",ae),window.removeEventListener("pointerup",ce),window.removeEventListener("pointercancel",se),document.documentElement.removeEventListener("pointerleave",ie),document.removeEventListener("visibilitychange",le),s.deleteBuffer(Gt),s.deleteBuffer(zt),s.deleteVertexArray(Vt),s.deleteProgram(At.program),(t=s.getExtension("WEBGL_lose_context"))==null||t.loseContext()}},[]),ut.useEffect(()=>{var O;(O=vt.current)==null||O.call(vt)}),xe.jsx("div",{ref:Wt,className:Ne,style:{position:"relative",width:"100%",height:"100%",overflow:"hidden",...Be},children:xe.jsx("canvas",{ref:Ot,style:{display:"block",width:"100%",height:"100%"},"aria-hidden":"true"})})};export{Qe as default};
