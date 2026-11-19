import{a as V,j as Ae}from"./index-DrbxZl7q.js";const Q=8,Se={low:150,medium:210,high:280},U=[-42,-76,84,94],Ee=2400,N=3,ot=2.6,nt=19,z=[0,-3],rt={press:1,lift:-1,none:0},Me={split:[[7,4.2,-4,4,4],[-8,3.6,3,4,4]],backlit:[[6,1.6,-15,5,3],[-7,1.4,-13,5,3]],overhead:[[3,7.5,-4,3,3],[-3,7,-1,3,3]]},it=Math.PI/180,Ge=`
uniform vec4 uRipples[${Q}];
uniform vec4 uWave;
uniform float uSquare;
uniform float uClock;
uniform vec4 uSwell;
uniform vec4 uHover;
uniform vec4 uIntro;

float reachOf(vec2 delta, out vec2 grad) {
  vec2 a = abs(delta);
  vec2 dir = vec2(delta.x < 0.0 ? -1.0 : 1.0, delta.y < 0.0 ? -1.0 : 1.0);
  float round_ = length(delta);
  vec2 roundGrad = delta / max(round_, 1e-4);
  float m = max(max(a.x, a.y), 1e-4);
  vec2 k = a / m;
  vec2 k3 = k * k * k;
  float sum = dot(k3, k);
  float root = sqrt(sqrt(sum));
  float square = m * root;
  vec2 squareGrad = dir * k3 / (root * root * root);
  float d = mix(round_, square, uSquare);
  vec2 g = mix(roundGrad, squareGrad, uSquare);
  float soft = sqrt(d * d + 0.36);
  grad = g * d / soft;
  return soft - 0.6;
}

vec3 field(vec2 p) {
  float t = uSwell.w;
  float f = uSwell.y;
  vec2 k1 = vec2(0.19, 0.11) * f;
  vec2 k2 = vec2(-0.09, 0.23) * f;
  vec2 k3 = vec2(0.29, -0.17) * f;
  float a1 = dot(p, k1) + t * 0.55;
  float a2 = dot(p, k2) - t * 0.42 + 1.3;
  float a3 = dot(p, k3) + t * 0.74 + 2.1;
  float h = 0.55 * sin(a1) + 0.4 * sin(a2) + 0.22 * sin(a3);
  vec2 g = 0.55 * cos(a1) * k1 + 0.4 * cos(a2) * k2 + 0.22 * cos(a3) * k3;
  h *= uSwell.x;
  g *= uSwell.x;
  vec2 dg;
  for (int i = 0; i < ${Q}; i++) {
    vec4 r = uRipples[i];
    if (r.w <= 0.0) continue;
    float age = uClock - r.z;
    if (age <= 0.0) continue;
    float d = reachOf(p - r.xy, dg);
    float radius = age * uWave.y;
    float x = (d - radius) / uWave.z;
    float life = clamp(1.0 - radius / uWave.w, 0.0, 1.0);
    float strength = r.w * uWave.x * life * life * smoothstep(0.0, 1.5, radius);
    float bump = exp(-x * x);
    h += bump * strength;
    g += -2.0 * x * bump * strength / uWave.z * dg;
  }
  if (uIntro.w > 0.0) {
    float d = reachOf(p - uIntro.xy, dg);
    float x = (d - uIntro.z) / 2.2;
    float bump = exp(-x * x) * uIntro.w;
    h += bump;
    g += -2.0 * x * bump / 2.2 * dg;
  }
  vec2 hd = p - uHover.xy;
  float hr = max(uHover.z, 1e-3);
  float hover = exp(-dot(hd, hd) / (hr * hr)) * uHover.w;
  h -= hover;
  g += 2.0 * hd / (hr * hr) * hover;
  return vec3(h, g);
}
`,at=`#version 300 es
precision highp float;
${Ge}
layout(location = 0) in vec2 aGrid;
uniform mat4 uViewProj;
uniform vec4 uArea;
out vec2 vGround;
out vec3 vWorld;
void main() {
  vec2 ground = uArea.xy + aGrid * uArea.zw;
  vec3 f = field(ground);
  vWorld = vec3(ground.x, f.x, ground.y);
  vGround = ground;
  gl_Position = uViewProj * vec4(vWorld, 1.0);
}`,ct=`#version 300 es
precision highp float;
${Ge}
uniform vec3 uEye;
uniform vec3 uColor;
uniform vec3 uAccent;
uniform vec3 uSecond;
uniform vec3 uLightA;
uniform vec3 uLightB;
uniform float uTile;
uniform float uAngle;
uniform float uGap;
uniform float uRound;
uniform float uSoftness;
uniform float uBulge;
uniform float uGloss;
uniform vec2 uRange;
uniform float uBrightness;
uniform float uGrain;
uniform float uGrainScale;
uniform float uLightMode;
uniform float uOpacity;
uniform vec4 uReveal;
uniform vec2 uView;
uniform float uFade;
uniform float uFrame;
in vec2 vGround;
in vec3 vWorld;
out vec4 outColor;

float smoother(float x) {
  x = clamp(x, 0.0, 1.0);
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
}

float hash(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.zyx + 31.32);
  return fract((p.x + p.y) * p.z);
}

void main() {
  vec3 f = field(vGround);
  vec3 n0 = normalize(vec3(-f.y, 1.0, -f.z));
  vec3 tx = normalize(vec3(1.0, f.y, 0.0));
  vec3 tz = normalize(cross(tx, n0));
  tx = normalize(cross(n0, tz));

  float c = cos(uAngle);
  float s = sin(uAngle);
  mat2 toTile = mat2(c, -s, s, c);
  vec2 q = toTile * vGround / uTile;
  vec2 cell = floor(q);
  vec2 local = q - cell - 0.5;
  float footprint = max(length(fwidth(q)), 1e-5);

  float on = 1.0;
  if (uReveal.w < 1.0) {
    vec2 centre = transpose(toTile) * (cell + 0.5) * uTile;
    vec2 dg;
    float d = reachOf(centre - uReveal.xy, dg);
    float delay = hash(vec3(cell, 7.0)) * 1.1;
    on = max(smoother((uReveal.z - d - delay) / 1.6), uReveal.w);
  }

  float half_ = (0.5 - uGap * 0.5) * mix(0.62, 1.0, on);
  float radius = min(uRound * half_, half_);
  vec2 dd = abs(local) - (half_ - radius);
  float d = length(max(dd, 0.0)) + min(max(dd.x, dd.y), 0.0) - radius;
  vec2 outward = dd.x > 0.0 || dd.y > 0.0 ? normalize(max(dd, 0.0) * sign(local)) : (dd.x > dd.y ? vec2(sign(local.x), 0.0) : vec2(0.0, sign(local.y)));

  float bevelWidth = max(mix(0.04, 0.42, uSoftness) * half_, footprint * 1.5);
  float edge = clamp((d + bevelWidth) / bevelWidth, 0.0, 1.0);
  float dome = uBulge * 0.5 * length(local) / max(half_, 1e-3);
  float theta = edge * edge * mix(0.7, 1.35, uSoftness) + dome;
  vec2 outwardGround = transpose(toTile) * outward;
  vec2 domeGround = transpose(toTile) * (local / max(length(local), 1e-4));
  vec3 bend = normalize(tx * mix(domeGround.x, outwardGround.x, edge) + tz * mix(domeGround.y, outwardGround.y, edge));
  float crowd = smoothstep(0.08, 0.3, footprint);
  theta *= 1.0 - crowd;
  vec3 n = normalize(n0 * cos(theta) + bend * sin(theta));

  float inside = 1.0 - smoothstep(-footprint * 0.75, footprint * 0.75, d);
  float area = (2.0 * half_) * (2.0 * half_) - (4.0 - 3.14159) * radius * radius;
  inside = mix(inside, area, crowd) * on;

  vec3 toEye = uEye - vWorld;
  float dist = length(toEye);
  vec3 v = toEye / dist;
  vec3 la = uLightA - vWorld;
  vec3 lb = uLightB - vWorld;
  float da = length(la);
  float db = length(lb);
  la /= da;
  lb /= db;
  float fa = 1.0 / (1.0 + da * da * 0.02);
  float fb = 1.0 / (1.0 + db * db * 0.02);

  float ndv = clamp(dot(n, v), 0.0, 1.0);
  float fresnel = 0.04 + 0.96 * pow(1.0 - ndv, 5.0);
  vec3 ha = normalize(la + v);
  vec3 hb = normalize(lb + v);
  float shine = mix(10.0, 90.0, uGloss);
  float norm = (shine + 8.0) / 60.0;
  float specA = pow(max(dot(n, ha), 0.0), shine) * norm;
  float specB = pow(max(dot(n, hb), 0.0), shine) * norm;
  float sheenA = pow(max(dot(n, ha), 0.0), 8.0);
  float sheenB = pow(max(dot(n, hb), 0.0), 8.0);
  float diffA = max(dot(n, la), 0.0);
  float diffB = max(dot(n, lb), 0.0);
  vec3 r = reflect(-v, n);
  float rim = exp((dot(r, normalize(vec3(0.15, 0.55, -1.0))) - 1.0) * 6.0);
  float occlusion = mix(1.0, 0.35, edge * edge);
  float edgeLight = edge * edge;

  vec3 color;
  float alpha;
  if (uLightMode > 0.5) {
    float luma = dot(uColor, vec3(0.299, 0.587, 0.114));
    vec3 body = mix(vec3(luma), uColor, 0.5) * 0.96;
    vec3 keyDir = normalize(vec3(-0.35, 0.85, 0.45));
    float shade = clamp(dot(n, keyDir) * 0.6 + 0.5, 0.0, 1.0);
    float wa = clamp(diffA * fa * 9.0, 0.0, 1.0);
    float wb = clamp(diffB * fb * 9.0, 0.0, 1.0);
    vec3 hue = (uAccent * wa + uSecond * wb) / max(wa + wb, 1e-3);
    vec3 lit = body * mix(vec3(1.0), hue, clamp(wa + wb, 0.0, 1.0) * 0.42) * mix(0.7, 1.05, shade);
    lit += vec3(1.0) * (specA * fa + specB * fb) * 2.4 * uGloss;
    lit *= mix(1.0, 0.8, edgeLight * (1.0 - crowd));
    color = lit;
    alpha = inside;
  } else {
    float luma = dot(uColor, vec3(0.299, 0.587, 0.114));
    vec3 body = mix(vec3(luma), uColor, 0.35) + vec3(0.02);
    vec3 lit = body * 0.25;
    lit += body * (uAccent * diffA * fa + uSecond * diffB * fb) * 14.0;
    lit += uAccent * (specA * (0.55 + 1.6 * edgeLight) + sheenA * 0.3) * fa * 9.0 * uGloss;
    lit += uSecond * (specB * (0.55 + 1.6 * edgeLight) + sheenB * 0.3) * fb * 9.0 * uGloss;
    lit += mix(uSecond, vec3(1.0), 0.4) * rim * fresnel * 0.35 * uGloss;
    lit *= occlusion;
    color = lit * inside;
    alpha = inside;
  }

  float fade = 1.0 - smoother((dist - uRange.x) / max(uRange.y - uRange.x, 1e-3));
  alpha *= fade * uOpacity;
  color *= uBrightness;
  if (uLightMode < 0.5) color = 1.0 - exp(-color * 1.1);

  vec2 grainCell = floor(gl_FragCoord.xy / uGrainScale);
  float grain = hash(vec3(grainCell, uFrame)) + hash(vec3(grainCell + 17.0, uFrame + 3.0)) - 1.0;
  float lum = dot(color, vec3(0.299, 0.587, 0.114));
  color += grain * uGrain * (uLightMode > 0.5 ? 0.6 : 0.25 + 0.75 * sqrt(clamp(lum, 0.0, 1.0)));
  color = clamp(color, 0.0, 1.0);

  vec2 uv = gl_FragCoord.xy / uView;
  float edgeFade = max(uFade * 0.5, 1e-4);
  float mask = uFade > 0.0 ? smoother(uv.x / edgeFade) * smoother((1.0 - uv.x) / edgeFade) * smoother(uv.y / edgeFade) * smoother((1.0 - uv.y) / edgeFade) : 1.0;
  alpha *= mask;
  outColor = vec4(color * alpha, alpha);
}`,lt=["uRipples","uWave","uSquare","uClock","uSwell","uHover","uIntro","uViewProj","uArea","uEye","uColor","uAccent","uSecond","uLightA","uLightB","uTile","uAngle","uGap","uRound","uSoftness","uBulge","uGloss","uRange","uBrightness","uGrain","uGrainScale","uLightMode","uOpacity","uReveal","uView","uFade","uFrame"],x=(e,s,f)=>Math.min(f,Math.max(s,e)),st=e=>{const s=x(e,0,1);return 1-(1-s)*(1-s)*(1-s)},ut=e=>{const s=x(e,0,1);return s*s*s*(s*(s*6-15)+10)},ft=(e,s,f)=>{const c=x((f-e)/(s-e),0,1);return c*c*(3-2*c)},ke=(e,s,f)=>{const c=e.createShader(s);return c?(e.shaderSource(c,f),e.compileShader(c),e.getShaderParameter(c,e.COMPILE_STATUS)?c:(e.deleteShader(c),null)):null},dt=(e,s,f)=>{const c=ke(e,e.VERTEX_SHADER,s),d=ke(e,e.FRAGMENT_SHADER,f),h=e.createProgram();if(!c||!d||!h)return null;if(e.attachShader(h,c),e.attachShader(h,d),e.linkProgram(h),e.deleteShader(c),e.deleteShader(d),!e.getProgramParameter(h,e.LINK_STATUS))return e.deleteProgram(h),null;const w={};for(const y of lt)w[y]=e.getUniformLocation(h,y);return{program:h,uniforms:w}},mt=(e,s,f,c)=>{const d=1/Math.tan(e/2),h=1/(f-c);return[d/s,0,0,0,0,d,0,0,0,0,(c+f)*h,-1,0,0,2*c*f*h,0]},ht=(e,s)=>{let f=e[0]-s[0],c=e[1]-s[1],d=e[2]-s[2],h=Math.hypot(f,c,d)||1;f/=h,c/=h,d/=h;let w=d,y=-f;h=Math.hypot(w,y)||1,w/=h,y/=h;const S=c*y,E=d*w-f*y,M=-c*w;return[w,S,f,0,0,E,c,0,y,M,d,0,-(w*e[0]+y*e[2]),-(S*e[0]+E*e[1]+M*e[2]),-(f*e[0]+c*e[1]+d*e[2]),1]},vt=(e,s)=>{const f=new Array(16);for(let c=0;c<4;c+=1)for(let d=0;d<4;d+=1)f[c*4+d]=e[d]*s[c*4]+e[4+d]*s[c*4+1]+e[8+d]*s[c*4+2]+e[12+d]*s[c*4+3];return f},pt=e=>{const s=e[0]*e[5]-e[1]*e[4],f=e[0]*e[6]-e[2]*e[4],c=e[0]*e[7]-e[3]*e[4],d=e[1]*e[6]-e[2]*e[5],h=e[1]*e[7]-e[3]*e[5],w=e[2]*e[7]-e[3]*e[6],y=e[8]*e[13]-e[9]*e[12],S=e[8]*e[14]-e[10]*e[12],E=e[8]*e[15]-e[11]*e[12],M=e[9]*e[14]-e[10]*e[13],F=e[9]*e[15]-e[11]*e[13],L=e[10]*e[15]-e[11]*e[14],$=s*L-f*F+c*M+d*E-h*S+w*y,p=$?1/$:0;return[(e[5]*L-e[6]*F+e[7]*M)*p,(e[2]*F-e[1]*L-e[3]*M)*p,(e[13]*w-e[14]*h+e[15]*d)*p,(e[10]*h-e[9]*w-e[11]*d)*p,(e[6]*E-e[4]*L-e[7]*S)*p,(e[0]*L-e[2]*E+e[3]*S)*p,(e[14]*c-e[12]*w-e[15]*f)*p,(e[8]*w-e[10]*c+e[11]*f)*p,(e[4]*F-e[5]*E+e[7]*y)*p,(e[1]*E-e[0]*F-e[3]*y)*p,(e[12]*h-e[13]*c+e[15]*s)*p,(e[9]*c-e[8]*h-e[11]*s)*p,(e[5]*S-e[4]*M-e[6]*y)*p,(e[0]*M-e[1]*S+e[2]*y)*p,(e[13]*f-e[12]*d-e[14]*s)*p,(e[8]*d-e[9]*f+e[10]*s)*p]},xt=({color:e="#120f17",accentColor:s="#ff4fb8",secondaryColor:f="#3b6bff",tileSize:c=1,gap:d=.12,roundness:h=.25,softness:w=.5,bulge:y=.3,rotation:S=35,gloss:E=.6,waves:M=1,waveScale:F=1,speed:L=.6,shape:$="square",pulse:p=1,pulseSpeed:ze=.45,pulseSpacing:Fe=1,pulseWidth:Le=1,pulseOrigin:Ce="center",brightness:_e=1,lighting:Te="split",tilt:Be=.7,zoom:Ie=1,depth:Pe=10,grain:qe=.12,fade:Oe=0,opacity:We=1,intro:De=!0,mouseInteraction:Ve=!0,hoverEffect:Ne="press",mouseStrength:He=1,mouseRadius:je=.35,pulseOnClick:Ue=!0,detail:$e="medium",lightMode:Xe=!1,paused:Ye=!1,dpr:Ke,...Qe})=>{const ie=V.useRef(null),ae=V.useRef(null),H=V.useRef(null),ce={color:String(e),accentColor:String(s),secondaryColor:String(f),tileSize:x(c,.2,5),gap:x(d,0,.6),roundness:x(h,0,1),softness:x(w,0,1),bulge:x(y,0,1.5),rotation:S*it,gloss:x(E,0,1),waves:Math.max(0,M),waveScale:x(F,.1,5),speed:Math.max(0,L),square:$==="round"?0:1,pulse:Math.max(0,p),pulseSpeed:Math.max(0,ze),pulseSpacing:x(Fe,.2,6),pulseWidth:x(Le,.1,5),randomOrigin:Ce==="random",brightness:Math.max(0,_e),lights:Me[Te]||Me.split,tilt:x(Be,0,1),zoom:x(Ie,.3,4),depth:x(Pe,2,40),grain:Math.max(0,qe),fade:x(Oe,0,1),opacity:x(We,0,1),intro:De,mouseInteraction:Ve,hover:rt[Ne]??1,mouseStrength:Math.max(0,He),mouseRadius:x(je,.02,2),pulseOnClick:Ue,mesh:Se[$e]||Se.medium,lightMode:Xe,paused:Ye,dpr:Ke},T=V.useRef(ce);T.current=ce,V.useEffect(()=>{var Re;const k=ie.current,R=ae.current,n=R==null?void 0:R.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!0,depth:!0,stencil:!1});if(!k||!R||!n)return;const X=dt(n,at,ct);if(!X)return;const J=n.createVertexArray(),se=n.createBuffer(),ue=n.createBuffer();let fe=0,de=0;const Ze=o=>{if(o===fe)return;fe=o;const a=new Float32Array((o+1)*(o+1)*2);let t=0;for(let u=0;u<=o;u+=1)for(let r=0;r<=o;r+=1)a[t]=r/o,a[t+1]=u/o,t+=2;const l=new Uint32Array(o*o*6);t=0;for(let u=0;u<o;u+=1)for(let r=0;r<o;r+=1){const m=u*(o+1)+r,g=m+1,v=m+o+1,b=v+1;l[t]=m,l[t+1]=v,l[t+2]=g,l[t+3]=g,l[t+4]=v,l[t+5]=b,t+=6}de=l.length,n.bindVertexArray(J),n.bindBuffer(n.ARRAY_BUFFER,se),n.bufferData(n.ARRAY_BUFFER,a,n.STATIC_DRAW),n.enableVertexAttribArray(0),n.vertexAttribPointer(0,2,n.FLOAT,!1,0,0),n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,ue),n.bufferData(n.ELEMENT_ARRAY_BUFFER,l,n.STATIC_DRAW),n.bindVertexArray(null)},Z=document.createElement("canvas");Z.width=1,Z.height=1;const B=Z.getContext("2d",{willReadFrequently:!0}),Y=((Re=window.matchMedia)==null?void 0:Re.call(window,"(prefers-reduced-motion: reduce)").matches)??!1,i={clock:0,swell:0,lights:0,frame:0,nextRipple:1.2,ripples:[],intro:T.current.intro&&!Y?0:N,width:1,height:1,colorKey:"",color:[.07,.06,.09],accent:[1,.31,.72],second:[.23,.42,1],pointer:{x:0,y:0,inside:!1},hover:{x:0,z:0,vx:0,vz:0,presence:0,placed:!1},look:{x:0,y:0,vx:0,vy:0},seed:1,camera:null};let I=0,P=0,K=!0,ee=!0;const te=(o,a)=>{if(!B||!o)return a;const t=/^[0-9a-f]{3,8}$/i.test(o)?`#${o}`:o;B.clearRect(0,0,1,1),B.fillStyle="#000000",B.fillStyle=t,B.fillRect(0,0,1,1);const[l,u,r]=B.getImageData(0,0,1,1).data;return[l/255,u/255,r/255]},et=o=>{const a=`${o.color}|${o.accentColor}|${o.secondaryColor}`;a!==i.colorKey&&(i.colorKey=a,i.color=te(o.color,[.07,.06,.09]),i.accent=te(o.accentColor,[1,.31,.72]),i.second=te(o.secondaryColor,[.23,.42,1]))},me=()=>(i.seed=i.seed*16807%2147483647,(i.seed-1)/2147483646),tt=o=>{const a=i.width/Math.max(i.height,1),t=8/o.zoom,l=i.look.x*.16,u=1.5-o.tilt*1.26+i.look.y*.05,r=[z[0],0,z[1]],m=[r[0]+Math.sin(l)*Math.cos(u)*t,r[1]+Math.sin(u)*t,r[2]+Math.cos(l)*Math.cos(u)*t],g=mt(.8,a,.1,400),v=ht(m,r),b=vt(g,v);return{eye:m,target:r,viewProj:b,inverse:pt(b),distance:t}},q=new Float32Array(Q*4),oe=()=>{const o=T.current;Ze(o.mesh),et(o);const a=tt(o);i.camera=a,n.viewport(0,0,R.width,R.height),n.clearColor(0,0,0,0),n.clearDepth(1),n.clear(n.COLOR_BUFFER_BIT|n.DEPTH_BUFFER_BIT),n.enable(n.DEPTH_TEST),n.depthFunc(n.LEQUAL),n.useProgram(X.program);const t=X.uniforms;q.fill(0),i.ripples.forEach((W,D)=>{q[D*4]=W.x,q[D*4+1]=W.z,q[D*4+2]=W.start,q[D*4+3]=W.strength});const l=i.intro,u=l<N,r=ut(l/ot)*nt,m=st(l/N);n.uniform4fv(t.uRipples,q),n.uniform4f(t.uWave,.55*o.pulse,3*Math.max(o.pulseSpeed,.05)+1.2,1.6*o.pulseWidth,46),n.uniform1f(t.uSquare,o.square),n.uniform1f(t.uClock,i.clock),n.uniform4f(t.uSwell,1.3*o.waves*(.25+.75*m),1.9/o.waveScale,0,i.swell),n.uniform4f(t.uHover,i.hover.x,i.hover.z,3*o.mouseRadius/.35,.7*i.hover.presence*o.mouseStrength*o.hover),n.uniform4f(t.uIntro,z[0],z[1],r,u?.9*(1-ft(.55,1,l/N)):0),n.uniformMatrix4fv(t.uViewProj,!1,a.viewProj),n.uniform4f(t.uArea,U[0]+z[0],U[1]+z[1],U[2],U[3]),n.uniform3f(t.uEye,a.eye[0],a.eye[1],a.eye[2]),n.uniform3f(t.uColor,i.color[0],i.color[1],i.color[2]),n.uniform3f(t.uAccent,i.accent[0],i.accent[1],i.accent[2]),n.uniform3f(t.uSecond,i.second[0],i.second[1],i.second[2]);const g=i.lights,v=a.distance/8,b=.35+.65*m,[G,A]=o.lights;n.uniform3f(t.uLightA,a.target[0]+(G[0]+Math.sin(g*.7)*G[3])*v,G[1]*v*b+.6,a.target[2]+(G[2]+Math.cos(g*.5)*G[4])*v),n.uniform3f(t.uLightB,a.target[0]+(A[0]+Math.cos(g*.6)*A[3])*v,A[1]*v*b+.6,a.target[2]+(A[2]+Math.sin(g*.45)*A[4])*v),n.uniform1f(t.uTile,1.2*o.tileSize),n.uniform1f(t.uAngle,o.rotation),n.uniform1f(t.uGap,o.gap),n.uniform1f(t.uRound,o.roundness),n.uniform1f(t.uSoftness,o.softness),n.uniform1f(t.uBulge,o.bulge),n.uniform1f(t.uGloss,o.gloss);const O=Math.min(o.depth*3.2*v,U[3]*.62);n.uniform2f(t.uRange,O*.5,O),n.uniform1f(t.uBrightness,o.brightness);const _=R.height/Math.max(i.height,1);n.uniform1f(t.uGrain,o.grain),n.uniform1f(t.uGrainScale,Math.max(1,_)),n.uniform1f(t.uLightMode,o.lightMode?1:0),n.uniform1f(t.uOpacity,o.opacity),n.uniform4f(t.uReveal,z[0],z[1],r,u?0:1),n.uniform2f(t.uView,R.width,R.height),n.uniform1f(t.uFade,o.fade),n.uniform1f(t.uFrame,i.frame%977),n.bindVertexArray(J),n.drawElements(n.TRIANGLES,de,n.UNSIGNED_INT,0),n.bindVertexArray(null),n.disable(n.DEPTH_TEST)},he=()=>{const o=T.current,a=Math.max(1,k.clientWidth),t=Math.max(1,k.clientHeight),l=Math.min(o.dpr||window.devicePixelRatio||1,2),u=Math.max(a,t)*l,r=u>Ee?l*Ee/u:l,m=Math.max(1,Math.round(a*r)),g=Math.max(1,Math.round(t*r));(R.width!==m||R.height!==g)&&(R.width=m,R.height=g),i.width=a,i.height=t,oe()},ne=(o,a)=>{const t=i.camera;if(!t)return null;const l=o/i.width*2-1,u=1-a/i.height*2,r=t.inverse,m=r[0]*l+r[4]*u+r[8]+r[12],g=r[1]*l+r[5]*u+r[9]+r[13],v=r[2]*l+r[6]*u+r[10]+r[14],b=r[3]*l+r[7]*u+r[11]+r[15],G=m/b-t.eye[0],A=g/b-t.eye[1],O=v/b-t.eye[2];if(A>=-1e-4)return null;const _=-t.eye[1]/A;return{x:t.eye[0]+G*_,z:t.eye[2]+O*_}},re=(o,a,t)=>{for(i.ripples.push({x:o,z:a,start:i.clock,strength:t});i.ripples.length>Q;)i.ripples.shift()},ve=o=>{if(I=0,!ee||!K||document.hidden)return;const a=T.current,t=P?Math.min(.05,(o-P)/1e3):1/60;P=o;const l=!a.paused&&!Y;if(l){i.frame+=1,i.clock+=t,i.intro+=t,i.swell+=t*a.speed,i.lights+=t*a.speed*.6;const _=3*Math.max(a.pulseSpeed,.05)+1.2,W=10*a.pulseSpacing/_;if(a.pulse>0&&i.clock>=i.nextRipple){if(a.randomOrigin){const j=ne((.15+me()*.7)*i.width,(.25+me()*.6)*i.height);j&&re(j.x,j.z,1)}else re(z[0],z[1],1);i.nextRipple=i.clock+W*(a.randomOrigin?.6:1)}const D=46/_+1;i.ripples=i.ripples.filter(j=>i.clock-j.start<D)}else i.intro<N&&(i.intro=N);const{pointer:u,hover:r,look:m}=i,g=a.mouseInteraction&&u.inside&&!Y,v=g&&a.hover!==0?ne(u.x,u.y):null;v&&(r.placed||(r.x=v.x,r.z=v.z,r.vx=0,r.vz=0,r.placed=!0),r.vx+=(90*(v.x-r.x)-19*r.vx)*t,r.vz+=(90*(v.z-r.z)-19*r.vz)*t,r.x+=r.vx*t,r.z+=r.vz*t);const b=v?1:0;r.presence+=(b-r.presence)*(1-Math.exp(-t/(b>r.presence?.35:.6))),!v&&r.presence<.001&&(r.placed=!1);const G=g?(u.x/i.width-.5)*.5:0,A=g?(.5-u.y/i.height)*.5:0;m.vx+=(30*(G-m.x)-11*m.vx)*t,m.vy+=(30*(A-m.y)-11*m.vy)*t,m.x+=m.vx*t,m.y+=m.vy*t,oe();const O=Math.abs(b-r.presence)>.002||Math.hypot(r.vx,r.vz)>.01||Math.abs(G-m.x)>2e-4||Math.abs(A-m.y)>2e-4;l||O?I=requestAnimationFrame(ve):P=0},C=()=>{!I&&ee&&K&&!document.hidden&&(I=requestAnimationFrame(ve))},pe=o=>{const a=k.getBoundingClientRect(),t=o.clientX-a.left,l=o.clientY-a.top;i.pointer.x=t,i.pointer.y=l,i.pointer.inside=t>=0&&l>=0&&t<=a.width&&l<=a.height,C()},ge=o=>{const a=T.current;if(!a.mouseInteraction||!a.pulseOnClick||o.button!==0||Y||o.target instanceof Element&&o.target.closest('a, button, input, textarea, select, label, [role="button"]'))return;const t=k.getBoundingClientRect(),l=o.clientX-t.left,u=o.clientY-t.top;if(l<0||u<0||l>t.width||u>t.height)return;const r=ne(l,u);r&&re(r.x,r.z,1.15),C()},xe=()=>{i.pointer.inside=!1,C()},we=()=>{P=0,C()},ye=new ResizeObserver(he);ye.observe(k);const be=new IntersectionObserver(o=>{K=o.some(a=>a.isIntersecting),K&&(P=0,C())});return be.observe(k),window.addEventListener("pointermove",pe,{passive:!0}),window.addEventListener("pointerdown",ge),document.documentElement.addEventListener("pointerleave",xe),document.addEventListener("visibilitychange",we),he(),C(),H.current=()=>{I||oe(),C()},()=>{ee=!1,cancelAnimationFrame(I),H.current=null,ye.disconnect(),be.disconnect(),window.removeEventListener("pointermove",pe),window.removeEventListener("pointerdown",ge),document.documentElement.removeEventListener("pointerleave",xe),document.removeEventListener("visibilitychange",we),n.deleteBuffer(se),n.deleteBuffer(ue),n.deleteVertexArray(J),n.deleteProgram(X.program)}},[]),V.useEffect(()=>{var k;(k=H.current)==null||k.call(H)});const{className:le="",...Je}=Qe;return Ae.jsx("div",{ref:ie,className:`acid-squares-container${le?` ${le}`:""}`,...Je,children:Ae.jsx("canvas",{ref:ae,className:"acid-squares-canvas","aria-hidden":"true"})})};export{xt as default};
