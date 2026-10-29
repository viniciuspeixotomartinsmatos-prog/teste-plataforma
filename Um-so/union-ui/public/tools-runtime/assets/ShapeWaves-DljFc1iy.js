import{a as x,j as pt}from"./index-DrbxZl7q.js";import{i as kt,s as _t,u as ze,a as At,b as xt,e as be,t as qe,f as Lt}from"./index-DGRdFj5X.js";const It={mixed:0,squares:1,circles:2,triangles:3},qt=2,Dt=1024,Ct=32,Ft=.1,De=1/60,Bt=.42,$t=.94,Ht=.972,Wt=.01,ht=.2,Fe=.3,yt=.16,ne=1+Fe+yt+ht,Ot=`
fn mod289v3(x: vec3f) -> vec3f { return x - floor(x * (1.0 / 289.0)) * 289.0; }
fn mod289v4(x: vec4f) -> vec4f { return x - floor(x * (1.0 / 289.0)) * 289.0; }
fn permute(x: vec4f) -> vec4f { return mod289v4(((x * 34.0) + 10.0) * x); }
fn taylorInvSqrt(r: vec4f) -> vec4f { return 1.79284291400159 - 0.85373472095314 * r; }
fn fadeCurve(t: vec3f) -> vec3f { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }

fn cnoise(P: vec3f) -> f32 {
  var Pi0 = floor(P);
  var Pi1 = Pi0 + vec3f(1.0);
  Pi0 = mod289v3(Pi0);
  Pi1 = mod289v3(Pi1);
  let Pf0 = fract(P);
  let Pf1 = Pf0 - vec3f(1.0);
  let ix = vec4f(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  let iy = vec4f(Pi0.yy, Pi1.yy);
  let iz0 = Pi0.zzzz;
  let iz1 = Pi1.zzzz;

  let ixy = permute(permute(ix) + iy);
  let ixy0 = permute(ixy + iz0);
  let ixy1 = permute(ixy + iz1);

  var gx0 = ixy0 * (1.0 / 7.0);
  var gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
  gx0 = fract(gx0);
  let gz0 = vec4f(0.5) - abs(gx0) - abs(gy0);
  let sz0 = step(gz0, vec4f(0.0));
  gx0 -= sz0 * (step(vec4f(0.0), gx0) - 0.5);
  gy0 -= sz0 * (step(vec4f(0.0), gy0) - 0.5);

  var gx1 = ixy1 * (1.0 / 7.0);
  var gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
  gx1 = fract(gx1);
  let gz1 = vec4f(0.5) - abs(gx1) - abs(gy1);
  let sz1 = step(gz1, vec4f(0.0));
  gx1 -= sz1 * (step(vec4f(0.0), gx1) - 0.5);
  gy1 -= sz1 * (step(vec4f(0.0), gy1) - 0.5);

  var g000 = vec3f(gx0.x, gy0.x, gz0.x);
  var g100 = vec3f(gx0.y, gy0.y, gz0.y);
  var g010 = vec3f(gx0.z, gy0.z, gz0.z);
  var g110 = vec3f(gx0.w, gy0.w, gz0.w);
  var g001 = vec3f(gx1.x, gy1.x, gz1.x);
  var g101 = vec3f(gx1.y, gy1.y, gz1.y);
  var g011 = vec3f(gx1.z, gy1.z, gz1.z);
  var g111 = vec3f(gx1.w, gy1.w, gz1.w);

  let norm0 = taylorInvSqrt(vec4f(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  let norm1 = taylorInvSqrt(vec4f(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  let n000 = dot(g000, Pf0);
  let n100 = dot(g100, vec3f(Pf1.x, Pf0.yz));
  let n010 = dot(g010, vec3f(Pf0.x, Pf1.y, Pf0.z));
  let n110 = dot(g110, vec3f(Pf1.xy, Pf0.z));
  let n001 = dot(g001, vec3f(Pf0.xy, Pf1.z));
  let n101 = dot(g101, vec3f(Pf1.x, Pf0.y, Pf1.z));
  let n011 = dot(g011, vec3f(Pf0.x, Pf1.yz));
  let n111 = dot(g111, Pf1);

  let f = fadeCurve(Pf0);
  let nz = mix(vec4f(n000, n100, n010, n110), vec4f(n001, n101, n011, n111), f.z);
  let ny = mix(nz.xy, nz.zw, f.y);
  return 2.2 * mix(ny.x, ny.y, f.x);
}

fn fbm(p: vec3f) -> f32 {
  var total = 0.0;
  var amplitude = 1.0;
  var weight = 0.0;
  var frequency = 1.0;
  for (var i = 0; i < 2; i++) {
    total += amplitude * cnoise(p * frequency);
    weight += amplitude;
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  return total / weight;
}
`,Nt=`
struct Params {
  resolution: vec4f,
  placement: vec4f,
  grid: vec4f,
  field: vec4f,
  motion: vec4f,
  color: vec4f,
  hover: vec4f,
  background: vec4f,
}
@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var maskTexture: texture_2d<f32>;
@group(0) @binding(2) var maskSampler: sampler;
@group(0) @binding(3) var<storage, read> charges: array<f32>;

const SEED = vec2f(12.9898, 78.233);
const GLOW_THRESHOLD = 0.6;
${Ot}

fn sdIsoscelesTriangle(point: vec2f, q: vec2f) -> f32 {
  let p = vec2f(abs(point.x), point.y);
  let a = p - q * clamp(dot(p, q) / dot(q, q), 0.0, 1.0);
  let b = p - q * vec2f(clamp(p.x / q.x, 0.0, 1.0), 1.0);
  let s = -sign(q.y);
  let d = min(vec2f(dot(a, a), s * (p.x * q.y - p.y * q.x)), vec2f(dot(b, b), s * (p.y - q.y)));
  return -sqrt(d.x) * sign(d.y);
}

fn shapeDistance(p: vec2f, shape: i32, c: f32) -> f32 {
  if (shape == 0) { return max(abs(p.x), abs(p.y)) - c; }
  if (shape == 1) { return length(p) - c; }
  return sdIsoscelesTriangle(vec2f(p.x, p.y + c), vec2f(c, 2.0 * c));
}

fn hash21(p: vec2f) -> f32 {
  return fract(sin(dot(p, vec2f(127.1, 311.7))) * 43758.5453);
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let resolution = params.resolution.xy;
  let cellPx = params.grid.x;
  let dotSize = params.grid.y;
  let mode = i32(params.grid.z + 0.5);
  let cols = i32(params.grid.w + 0.5);
  let background = params.background.rgb;
  let toSurface = params.hover.w < 0.5;

  let pixel = uv * resolution;
  let origin = params.placement.xy;
  let rows = i32(params.placement.z + 0.5);
  let cell = floor((pixel - origin) / cellPx);
  if (cell.y < 0.0 || i32(cell.y) >= rows || cell.x < 0.0 || i32(cell.x) >= cols) {
    return vec4f(background, select(0.0, 1.0, toSurface));
  }
  let center = origin + (cell + 0.5) * cellPx;
  let local = (pixel - center) / (cellPx * 0.5);
  let cellUv = center / resolution;

  if (params.motion.z > 0.5 && textureSampleLevel(maskTexture, maskSampler, cellUv, 0.0).r > 0.5) {
    return vec4f(background, select(0.0, 1.0, toSurface));
  }

  var level = 1.0;
  let fade = params.motion.w;
  if (fade > 0.0) {
    let q = abs(uv * 2.0 - 1.0);
    let radius = pow(pow(q.x, 2.5) + pow(q.y, 2.5), 1.0 / 2.5) / pow(2.0, 1.0 / 2.5);
    level = 1.0 - smoothstep(max(0.0, 1.0 - fade * 2.2), 1.0, radius);
  }
  let noise = fbm(vec3f((center + params.motion.xy) / params.field.x + SEED, params.field.w));
  let tone = clamp((noise * 0.5 + 0.5 - params.field.y) * params.field.z + 0.5, 0.0, 1.0);
  let band = i32(min(tone, 0.999999) * 3.0);

  var charge = 0.0;
  let index = i32(cell.y) * cols + i32(cell.x);
  if (index >= 0 && index < i32(arrayLength(&charges))) { charge = charges[index]; }
  let stepped = (band + i32(clamp(charge, 0.0, 0.999) * 3.0)) % 3;

  var shape = 2 - stepped;
  var size = dotSize;
  if (mode != 0) {
    shape = mode - 1;
    size = dotSize * mix(0.45, 1.0, f32(stepped) / 2.0);
  }
  let introProgress = params.placement.w;
  var front = 0.0;
  if (introProgress < ${ne.toFixed(2)}) {
    let radial = length((center - resolution * 0.5) / (resolution * 0.5)) * 0.70710678;
    let warp = cnoise(vec3f(cellUv * vec2f(3.2, 2.4) + SEED, 4.7)) * ${Fe.toFixed(2)};
    let jitter = hash21(cell) * ${yt.toFixed(2)};
    let spread = radial + warp + jitter + ${Fe.toFixed(2)};
    let band = ${ht.toFixed(2)} * (0.6 + 0.8 * hash21(cell + vec2f(17.0, 9.0)));
    let t = clamp((introProgress - spread) / band, 0.0, 1.0);
    if (t <= 0.0) {
      return vec4f(background, select(0.0, 1.0, toSurface));
    }
    let back = t - 1.0;
    size = max(size * (1.0 + 2.70158 * back * back * back + 1.70158 * back * back), 0.02);
    front = 1.0 - smoothstep(0.0, 1.0, abs(introProgress - spread) / band);
  }
  let aa = 2.0 / cellPx;
  let coverage = smoothstep(aa, -aa, shapeDistance(local, shape, size));

  let tint = mix(params.color.rgb, params.hover.rgb, max(smoothstep(0.15, 0.85, charge), front * 0.35));

  let rgb = mix(background, tint, coverage * level);
  if (toSurface) { return vec4f(rgb, 1.0); }
  let luminance = dot(tint * level, vec3f(0.2126, 0.7152, 0.0722));
  let glow = max(0.0, (luminance - GLOW_THRESHOLD) / (1.0 - GLOW_THRESHOLD)) * coverage;
  return vec4f(rgb, glow);
}
`,vt=`
struct Blur { direction: vec4f }
@group(0) @binding(0) var<uniform> blur: Blur;
@group(0) @binding(1) var sourceTexture: texture_2d<f32>;
@group(0) @binding(2) var sourceSampler: sampler;

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let sigma = blur.direction.z;
  let radius = i32(ceil(3.0 * sigma));
  var sum = vec3f(0.0);
  var weight = 0.0;
  for (var i = -radius; i <= radius; i++) {
    let offset = f32(i);
    let w = exp(-(offset * offset) / (2.0 * sigma * sigma));
    let sample = textureSampleLevel(sourceTexture, sourceSampler, uv + offset * blur.direction.xy, 0.0);
    sum += select(sample.rgb, sample.rgb * sample.a, blur.direction.w > 0.5) * w;
    weight += w;
  }
  return vec4f(sum / weight, 1.0);
}
`,jt=`
struct Composite { strength: vec4f }
@group(0) @binding(0) var<uniform> composite: Composite;
@group(0) @binding(1) var sceneTexture: texture_2d<f32>;
@group(0) @binding(2) var glowTexture: texture_2d<f32>;
@group(0) @binding(3) var linearSampler: sampler;

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let scene = textureSampleLevel(sceneTexture, linearSampler, uv, 0.0).rgb;
  let glow = textureSampleLevel(glowTexture, linearSampler, uv, 0.0).rgb;
  return vec4f(scene + glow * composite.strength.x, 1.0);
}
`,Ce=(G,ae)=>{const se=typeof G=="string"?G.trim():"";let B=(/^#?([\da-f]{3}|[\da-f]{6})$/i.exec(se)||/^#?([\da-f]{6})$/i.exec(ae))[1];return B.length===3&&(B=B.replace(/./g,L=>L+L)),[0,2,4].map(L=>parseInt(B.slice(L,L+2),16)/255)};function Vt({text:G="",fontFamily:ae='Geist, "Geist Sans", system-ui, sans-serif',fontWeight:se=500,textSize:Se=.6,shapes:B="mixed",cellSize:L=10,dotSize:Be=.75,color:$e="#929292",hoverColor:He="#ffffff",backgroundColor:Pe="#000000",speed:We=1,scale:Oe=1,contrast:Ne=1,brightness:je=.4,flow:Ue=0,direction:Xe=0,fade:Ve=.25,interactive:Ye=!0,splashRadius:Ge=40,splashStrength:Je=.4,glow:Ze=.35,intro:Qe=!0,introDuration:Ke=1.6,introKey:Me=0,paused:et=!1,onError:tt,className:wt=""}){const rt=x.useRef(null),nt=x.useRef(null),[zt,at]=x.useState(!1),m=x.useRef(null),oe=x.useRef(()=>{}),ce=x.useRef(()=>{}),ie=x.useRef(tt);m.current={text:String(G??""),fontFamily:ae,fontWeight:se,textSize:Se,shapes:B,cellSize:Math.max(2,L),dotSize:Be,color:$e,hoverColor:He,backgroundColor:Pe,speed:We,scale:Math.max(.05,Oe),contrast:Ne,brightness:je,flow:Ue,direction:Xe,fade:Ve,interactive:Ye,splashRadius:Ge,splashStrength:Je,glow:Ze,intro:Qe,introDuration:Math.max(.1,Ke),introKey:Me,paused:et},ie.current=tt;const bt=[B,L,Be,$e,He,Pe,We,Oe,Ne,je,Ue,Xe,Ve,Ye,Ge,Je,Ze,Qe,Ke,et].join("|"),St=[G,ae,se,Se].join("|"),Ee=x.useRef(()=>{});return x.useEffect(()=>{oe.current()},[bt]),x.useEffect(()=>{ce.current()},[St]),x.useEffect(()=>{Me&&Ee.current()},[Me]),x.useEffect(()=>{const le=rt.current,fe=nt.current;if(!le||!fe)return;let v=!1,E=!1,r,$,S,R=0,ge=0,st=0,J=[0,0],I=1,ue=!0,ot=!1,f=1,h=1,T=10,H=[0,0],P=new Float32Array(1),d=new Float32Array(1),W=new Float32Array(1),me=0,ct=0,Z=ne,de=!1,O=!1,N=null,j,q,D,C=()=>{};const k={x:0,y:0,at:0,inside:!1},Q=window.matchMedia("(prefers-reduced-motion: reduce)"),pe=document.createElement("canvas"),M=pe.getContext("2d"),xe=()=>C(),Re=()=>{N=null},Pt=(a,p,s)=>{const g=m.current,y=Math.max(.5,g.splashRadius*I/T*.5),_=Math.ceil(y*2.5),w=(a*I-H[0])/T-.5,z=(p*I-H[1])/T-.5,K=Math.max(0,Math.floor(z-_)),V=Math.min(h-1,Math.ceil(z+_)),Y=Math.max(0,Math.floor(w-_)),ve=Math.min(f-1,Math.ceil(w+_));for(let U=K;U<=V;U++){const ee=U-z;for(let X=Y;X<=ve;X++){const te=X-w,he=s*Math.exp(-(te*te+ee*ee)/(2*y*y)),re=U*f+X;d[re]=Math.min(1.2,d[re]+he)}}O=!0},it=a=>{if(!m.current.interactive)return;N||(N=le.getBoundingClientRect());const p=performance.now(),s=a.clientX-N.left,g=a.clientY-N.top,y=s>=0&&g>=0&&s<=N.width&&g<=N.height;if(y){const _=k.inside?Math.max(8,p-k.at):16,z=(k.inside?Math.hypot(s-k.x,g-k.y):0)/_*1e3;Pt(s,g,Math.min(1,.22+z*6e-4)*m.current.splashStrength),C()}k.x=s,k.y=g,k.at=p,k.inside=y},Te=a=>{var s;if(v||E)return;E=!0,R&&cancelAnimationFrame(R),R=0,q==null||q.disconnect(),D==null||D.disconnect(),j==null||j(),oe.current=()=>{},ce.current=()=>{};const p=r;r=void 0,p==null||p.dispose(),at(!1),(s=ie.current)==null||s.call(ie,a instanceof Error?a:new Error(String(a)))},lt=()=>(I=Math.min(window.devicePixelRatio||1,qt),[Math.max(1,Math.round(fe.clientWidth*I)),Math.max(1,Math.round(fe.clientHeight*I))]);return(async()=>{try{if(r=await kt({powerPreference:"low-power"}),v)return r.dispose();j=r.onError(Te);const a=lt(),p=navigator.gpu.getPreferredCanvasFormat(),s=_t(r,fe,{dpr:I,size:a,autoResize:!1,format:p}),g=ze(r,{resolution:[a[0],a[1],1/a[0],1/a[1]],placement:[0,0,1,0],grid:[10,.75,0,1],field:[320,.5,2.8,0],motion:[0,0,0,.25],color:[.573,.573,.573,1],hover:[1,1,1,0],background:[0,0,0,1]}),y=At(r,{minFilter:"linear",magFilter:"linear",addressModeU:"clamp-to-edge",addressModeV:"clamp-to-edge"}),_=(e,t)=>r.device.createTexture({size:[e,t],format:"rgba8unorm",usage:["texture_binding","copy_dst","render_attachment"],label:"shape-waves-mask"});$=_(1,1),S=xt(r,4,"read"),S.write(P);const w=be(r,Nt,{label:"shape-waves-scene",set:{params:g,maskTexture:$,maskSampler:y,charges:S}}),z=qe(r,{size:a,format:"rgba8unorm",label:"shape-waves-scene"}),K=e=>[Math.max(1,Math.ceil(e[0]/2)),Math.max(1,Math.ceil(e[1]/2))],V=qe(r,{size:K(a),format:"rgba8unorm",label:"shape-waves-glow-a"}),Y=qe(r,{size:K(a),format:"rgba8unorm",label:"shape-waves-glow-b"}),ve=ze(r,{direction:[0,0,4,1]}),U=ze(r,{direction:[0,0,4,0]}),ee=be(r,vt,{label:"shape-waves-glow-x",set:{blur:ve,sourceTexture:z,sourceSampler:y}}),X=be(r,vt,{label:"shape-waves-glow-y",set:{blur:U,sourceTexture:V,sourceSampler:y}}),te=ze(r,{strength:[2,0,0,0]}),he=be(r,jt,{label:"shape-waves-composite",set:{composite:te,sceneTexture:z,glowTexture:Y,linearSampler:y}});if(await Promise.all([w.compile({colors:[p]}),w.compile(z),ee.compile(V),X.compile(Y),he.compile({colors:[p]})]),v)return;const re=()=>m.current.glow>0;let ft=!1;const Mt=()=>{const e=m.current,[t,c]=s.size,i=Math.max(1,Math.round(t/(e.cellSize*I)));T=t/i;const n=Math.max(1,Math.floor(c/T));if(H=[0,(c-n*T)/2],i===f&&n===h&&P.length===f*h)return;f=i,h=n,P=new Float32Array(f*h),d=new Float32Array(f*h),W=new Float32Array(f*h),O=!1;const b=xt(r,P.byteLength,"read");b.write(P),w.set({charges:b}),S.destroy(),S=b},Et=()=>{const e=f-1,t=h-1;let c=0;for(let n=0;n<h;n++){const b=(n===0?n:n-1)*f,o=(n===t?n:n+1)*f,u=n*f;for(let l=0;l<f;l++){const A=u+l,ye=u+(l===0?l:l-1),we=u+(l===e?l:l+1),F=d[A],Ae=d[ye]+d[we]+d[b+l]+d[o+l]-4*F,Le=(F-W[A])*$t,dt=(F+Le+Bt*Ae)*Ht;W[A]=dt;const Ie=Math.min(1,Math.max(0,dt));P[A]=Ie,Ie>c&&(c=Ie)}}const i=d;return d=W,W=i,c},Rt=e=>{if(!O)return!1;me=Math.min(me+e,De*4);let t=1;for(;me>=De;)me-=De,t=Et();return t<Wt&&(d.fill(0),W.fill(0),P.fill(0),O=!1),S.write(P),O},Tt=()=>{const e=m.current;return ue&&!document.hidden&&!e.paused&&e.speed>0&&!Q.matches},gt=e=>{if(R=0,v||E)return;const t=m.current,c=ge?Math.min(.1,(e-ge)/1e3):0;ge=e;const i=Tt();if(i){st+=c*Ft*t.speed;const o=t.direction*Math.PI/180,u=t.flow*T*c;J=[J[0]+Math.cos(o)*u,J[1]+Math.sin(o)*u]}const n=ue&&!document.hidden&&Rt(c);de&&(de=!1,ct=e,Z=0);const b=Z<ne;b&&(Z=Math.min(ne,(e-ct)/1e3/t.introDuration*ne)),g.set({placement:[H[0],H[1],h,Z]}),g.set({field:[Ct*T*t.scale,.5-(t.brightness-.5)*.4,2.8*t.contrast,st]}),g.set({motion:[J[0],J[1],t.text.trim()?1:0,t.fade]});try{Lt(r,o=>{if(!re()){o.pass(s,w);return}o.pass(z,w),o.pass(V,ee),o.pass(Y,X),o.pass(s,he)})}catch(o){Te(o);return}ot||(ot=!0,at(!0)),i||n||b?R=requestAnimationFrame(gt):ge=0};C=()=>{v||E||R||(R=requestAnimationFrame(gt))};const ke=()=>{const e=m.current,t=e.text.trim(),[c,i]=s.size,n=t.length>0,b=n?Math.min(1,Dt/Math.max(c,i)):0,o=n?Math.max(1,Math.round(c*b)):1,u=n?Math.max(1,Math.round(i*b)):1;if(pe.width=o,pe.height=u,M.fillStyle="#000",M.fillRect(0,0,o,u),n){let A=Math.max(1,e.textSize*u);M.font=`${e.fontWeight} ${A}px ${e.fontFamily}`;const ye=M.measureText(t).width,we=o*.9;ye>we&&(A=Math.max(1,A*we/ye),M.font=`${e.fontWeight} ${A}px ${e.fontFamily}`),M.textAlign="center",M.textBaseline="alphabetic";const F=M.measureText(t),Ae=(o+F.actualBoundingBoxLeft-F.actualBoundingBoxRight)/2,Le=(u+F.actualBoundingBoxAscent-F.actualBoundingBoxDescent)/2;M.fillStyle="#fff",M.fillText(t,Ae,Le)}const l=_(o,u);r.gpu.queue.copyExternalImageToTexture({source:pe},{texture:l.gpu},[o,u]),w.set({maskTexture:l}),$.destroy(),$=l},_e=()=>{if(v||E)return;const e=m.current;Mt(),g.set({placement:[H[0],H[1],h,Z],grid:[T,Math.min(1,Math.max(.1,e.dotSize)),It[e.shapes]??0,f],color:[...Ce(e.color,"#929292"),1],hover:[...Ce(e.hoverColor,"#ffffff"),re()?1:0],background:[...Ce(e.backgroundColor,"#000000"),1]}),te.set({strength:[2*e.glow,0,0,0]}),e.intro!==ft&&(ft=e.intro,e.intro&&!Q.matches&&(de=!0)),!e.interactive&&O&&(d.fill(0),W.fill(0),P.fill(0),O=!1,S.write(P)),C()},ut=()=>{var t;if(v||E)return;ke(),_e();const e=m.current;!e.text.trim()||!((t=document.fonts)!=null&&t.load)||document.fonts.load(`${e.fontWeight} 32px ${e.fontFamily}`).then(()=>{v||E||(ke(),C())}).catch(()=>{})},mt=()=>{if(v||E)return;Re();const e=lt();(e[0]!==s.size[0]||e[1]!==s.size[1])&&s.resize(e);const[t,c]=s.size;z.resize([t,c]);const i=K([t,c]);V.resize(i),Y.resize(i),ve.set({direction:[1/i[0],0,4,1]}),U.set({direction:[0,1/i[1],4,0]}),g.set({resolution:[t,c,1/t,1/c]}),ke(),_e()};oe.current=_e,ce.current=ut,Ee.current=()=>{v||E||!m.current.intro||Q.matches||(de=!0,C())},q=new ResizeObserver(mt),q.observe(le),D=new IntersectionObserver(e=>{ue=e.some(t=>t.isIntersecting),ue&&C()},{threshold:0}),D.observe(le),document.addEventListener("visibilitychange",xe),Q.addEventListener("change",xe),window.addEventListener("pointermove",it,{passive:!0}),window.addEventListener("scroll",Re,{capture:!0,passive:!0}),mt(),ut()}catch(a){Te(a)}})(),()=>{v=!0,C=()=>{},oe.current=()=>{},ce.current=()=>{},Ee.current=()=>{},document.removeEventListener("visibilitychange",xe),Q.removeEventListener("change",xe),window.removeEventListener("pointermove",it),window.removeEventListener("scroll",Re,{capture:!0}),q==null||q.disconnect(),D==null||D.disconnect(),j==null||j(),R&&cancelAnimationFrame(R),$==null||$.destroy(),S==null||S.destroy(),r==null||r.dispose()}},[]),pt.jsx("div",{ref:rt,className:`shape-waves ${wt}`,"data-ready":zt,style:{backgroundColor:Pe},"aria-hidden":"true",children:pt.jsx("canvas",{ref:nt,className:"shape-waves__canvas"})})}export{Vt as default};
