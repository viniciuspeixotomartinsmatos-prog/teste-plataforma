import{a as re,j as Et}from"./index-DrbxZl7q.js";import{t as o}from"./three-lB2Imsr2.js";const k=400,O=160,G=80,H=1500,j=8,tt=["straight","gentle","winding","hills","racing","deep"],ot={dark:{background:"transparent",road:"#08080a",lines:"#25252d",tail:["#d856bf","#6750a2","#c247ac"],head:["#03b3c3","#0e5ea5","#324555"],poles:["#03b3c3"],dust:"#ffffff"},light:{background:"transparent",road:"#efeff2",lines:"#d0d0d7",tail:["#d856bf","#6750a2","#c247ac"],head:["#03b3c3","#0e5ea5","#324555"],poles:["#03b3c3"],dust:"#18181b"}},ce=`
  uniform float uTime;
  uniform float uCurvature;
  uniform vec4 uCurveA;
  uniform float uCurveB;
  uniform float uFogNear;
  uniform float uFogFar;
  uniform float uPixel;
  #define PI 3.14159265358979
  float nsin(float v) { return sin(v) * 0.5 + 0.5; }
  vec3 gentle(float p) {
    return vec3(
      cos(p * PI * 5.0 + uTime) * 25.0 - cos(0.02 * PI * 5.0 + uTime) * 25.0,
      sin(p * PI * 2.0 + PI * 0.5 + uTime) * 15.0 - sin(0.02 * PI * 2.0 + PI * 0.5 + uTime) * 15.0,
      0.0
    );
  }
  float windX(float p) { return cos(PI * p * 4.0 + uTime) * 25.0 + pow(cos(PI * p * 8.0 + uTime * 2.0), 2.0) * 5.0; }
  float windY(float p) { return -nsin(PI * p * 8.0 + uTime) * 10.0 - pow(nsin(PI * p + uTime / 8.0), 5.0) * 10.0; }
  vec3 winding(float p) { return vec3(windX(p) - windX(0.0125), windY(p) - windY(0.0125), 0.0); }
  vec3 hills(float p) {
    return vec3(
      cos(p * PI * 3.0 + uTime) * 30.0 - cos(0.02 * PI * 3.0 + uTime) * 30.0,
      nsin(p * PI * 6.0 + uTime) * 30.0 - nsin(0.02 * PI * 6.0 + uTime) * 30.0,
      nsin(p * PI * 10.0 + uTime) * 20.0 - nsin(0.02 * PI * 10.0 + uTime) * 20.0
    );
  }
  vec3 racing(float p) {
    return vec3(
      sin(p * PI * 2.0 + uTime) * 35.0 - sin(0.0125 * PI * 2.0 + uTime) * 35.0,
      sin(p * PI * 3.0 + uTime) * 10.0 - sin(0.0125 * PI * 3.0 + uTime) * 10.0,
      0.0
    );
  }
  float deepX(float p) { return sin(p * PI * 4.0 + uTime) * 10.0; }
  float deepY(float p) { return pow(abs(p * 10.0), 2.0) + sin(p * PI * 8.0 + uTime) * 20.0; }
  vec3 deep(float p) { return vec3(deepX(p) - deepX(0.02), deepY(p) - deepY(0.02), 0.0); }
  vec3 bend(float p) {
    vec3 d = gentle(p) * uCurveA.x + winding(p) * uCurveA.y + hills(p) * uCurveA.z + racing(p) * uCurveA.w + deep(p) * uCurveB;
    return d * uCurvature;
  }
`,It=`
  ${ce}
  attribute vec4 aSeedA;
  attribute vec4 aSeedB;
  attribute float aPair;
  attribute float aTone;
  uniform float uTravel;
  uniform float uRoadX;
  uniform float uRoadWidth;
  uniform float uLanes;
  uniform float uDirection;
  uniform vec2 uSpeedRange;
  uniform float uTrail;
  uniform float uStretch;
  uniform float uSize;
  uniform float uRadiusScale;
  uniform float uMirror;
  uniform vec3 uColors[${j}];
  uniform float uColorCount;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vColor;
  varying float vFog;
  varying float vAbove;
  varying float vThin;
  void main() {
    float laneWidth = uRoadWidth / uLanes;
    float lane = min(floor(aSeedA.x * uLanes), uLanes - 1.0);
    float laneX = (lane + 0.5) * laneWidth - uRoadWidth * 0.5 + (aSeedA.y - 0.5) * 0.5 * laneWidth;
    float carWidth = mix(0.3, 0.5, aSeedA.z) * laneWidth;
    float radius = mix(0.05, 0.14, aSeedA.w) * uSize;
    float len = mix(0.03, 0.2, aSeedB.x) * uTravel * uTrail * (1.0 + uStretch);
    float speed = mix(uSpeedRange.x, uSpeedRange.y, aSeedB.y) * uDirection;
    vec3 center = vec3(
      uRoadX + laneX + aPair * carWidth,
      aSeedB.w * 0.8 + radius * 1.3,
      position.z * len + len - mod(uTime * speed + aSeedB.z * uTravel, uTravel)
    );
    vAbove = center.y;
    center.y = mix(center.y, -center.y * 1.8, uMirror);
    center += bend(abs(center.z / uTravel));
    float depth = max(0.1, -(modelViewMatrix * vec4(center, 1.0)).z);
    float wanted = radius * uRadiusScale;
    float shown = max(wanted, depth * uPixel * 0.75);
    vThin = wanted / shown;
    vec3 p = center + vec3(position.x * shown, position.y * shown * mix(1.0, 2.2, uMirror), 0.0);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    vec3 n = normal;
    n.y *= 1.0 - 2.0 * uMirror;
    vNormal = normalize(normalMatrix * n);
    vView = -mv.xyz;
    vUv = uv;
    vColor = uColors[int(min(floor(aTone * uColorCount), uColorCount - 1.0))];
    vFog = smoothstep(uFogNear, uFogFar, -mv.z);
  }
`,Pt=`
  uniform vec2 uFade;
  uniform float uIntensity;
  uniform float uSharp;
  uniform float uCore;
  uniform float uMirror;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vColor;
  varying float vFog;
  varying float vAbove;
  varying float vThin;
  void main() {
    float facing = abs(dot(normalize(vNormal), normalize(vView)));
    float alpha = pow(facing, uSharp) * smoothstep(uFade.x, uFade.y, vUv.x) * uIntensity * vThin * (1.0 - vFog);
    alpha *= mix(1.0, exp(-vAbove * 0.9), uMirror);
    if (alpha < 0.003) discard;
    gl_FragColor = vec4(mix(vColor, vec3(1.0), pow(facing, 12.0) * uCore), min(alpha, 1.0));
  }
`,Lt=`
  ${ce}
  attribute vec4 aSeed;
  attribute float aIndex;
  attribute float aSide;
  uniform float uTravel;
  uniform float uCount;
  uniform float uEdge;
  uniform float uHeight;
  uniform float uRadiusScale;
  uniform float uMirror;
  uniform vec3 uColors[${j}];
  uniform float uColorCount;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vColor;
  varying float vFog;
  varying float vAbove;
  varying float vHeight;
  varying float vThin;
  void main() {
    vHeight = position.y + 0.5;
    float width = mix(0.08, 0.22, aSeed.y);
    float height = mix(1.3, 1.9, aSeed.z) * uHeight;
    float spacing = uTravel / max(uCount, 1.0);
    vec3 center = vec3(
      aSide * uEdge,
      vHeight * height,
      -uTravel + mod(uTime * 120.0 + (aIndex + aSeed.x * 0.6) * spacing, uTravel)
    );
    vAbove = center.y;
    center.y = mix(center.y, -center.y * 1.6, uMirror);
    center += bend(abs(center.z / uTravel));
    float depth = max(0.1, -(modelViewMatrix * vec4(center, 1.0)).z);
    float wanted = width * uRadiusScale;
    float shown = max(wanted, depth * uPixel * 0.75);
    vThin = wanted / shown;
    vec3 p = center + vec3(position.x * shown, 0.0, position.z * shown);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    vNormal = normalize(normalMatrix * normal);
    vView = -mv.xyz;
    vColor = uColors[int(min(floor(aSeed.w * uColorCount), uColorCount - 1.0))];
    vFog = smoothstep(uFogNear, uFogFar, -mv.z);
  }
`,Wt=`
  uniform float uIntensity;
  uniform float uSharp;
  uniform float uCore;
  uniform float uMirror;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vColor;
  varying float vFog;
  varying float vAbove;
  varying float vHeight;
  varying float vThin;
  void main() {
    float facing = abs(dot(normalize(vNormal), normalize(vView)));
    float ends = smoothstep(0.0, 0.08, vHeight) * smoothstep(1.0, 0.9, vHeight);
    float alpha = pow(facing, uSharp) * ends * uIntensity * vThin * (1.0 - vFog);
    alpha *= mix(1.0, exp(-vAbove * 0.6), uMirror);
    if (alpha < 0.003) discard;
    gl_FragColor = vec4(mix(vColor, vec3(1.0), pow(facing, 12.0) * uCore), min(alpha, 1.0));
  }
`,Bt=`
  ${ce}
  attribute vec4 aSeed;
  attribute float aEnd;
  uniform float uTravel;
  uniform float uStretch;
  uniform float uSpread;
  varying float vAlpha;
  void main() {
    float x = (aSeed.x - 0.5) * uSpread;
    float y = mix(1.0, 42.0, aSeed.y * aSeed.y);
    float speed = mix(140.0, 260.0, aSeed.w);
    float z = -uTravel + mod(uTime * speed + aSeed.z * uTravel, uTravel);
    float len = (0.6 + uStretch * 7.0) * mix(0.6, 1.4, aSeed.w);
    vec3 p = vec3(x, y, z + aEnd * len);
    p += bend(abs(p.z / uTravel));
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    vAlpha = aEnd * (1.0 - smoothstep(uFogNear, uFogFar, -mv.z));
  }
`,zt=`
  uniform vec3 uColor;
  uniform float uIntensity;
  varying float vAlpha;
  void main() {
    gl_FragColor = vec4(uColor, vAlpha * uIntensity);
  }
`,Ot=`
  ${ce}
  uniform float uTravel;
  uniform float uWidth;
  varying vec2 vRoad;
  varying float vFog;
  void main() {
    vec3 p = position;
    p.x *= uWidth;
    vRoad = vec2(p.x, p.z);
    p += bend(abs(p.z / uTravel));
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    vFog = smoothstep(uFogNear, uFogFar, -mv.z);
  }
`,Vt=`
  uniform float uTime;
  uniform vec3 uRoadColor;
  uniform vec3 uLineColor;
  uniform vec3 uBackground;
  uniform float uRoadWidth;
  uniform float uMedian;
  uniform float uLanes;
  uniform float uTransparent;
  uniform float uOpacity;
  varying vec2 vRoad;
  varying float vFog;
  float stripe(float d, float w) {
    float aa = fwidth(d) * 1.2;
    return 1.0 - smoothstep(w - aa, w + aa, d);
  }
  void main() {
    float rx = abs(vRoad.x) - uMedian * 0.5;
    vec3 color = rx < 0.0 ? mix(uRoadColor, uLineColor, 0.12) : uRoadColor;
    if (rx >= 0.0) {
      float laneWidth = uRoadWidth / uLanes;
      float shoulder = max(stripe(abs(rx - 0.3), 0.07), stripe(abs(rx - (uRoadWidth - 0.3)), 0.07));
      float nearest = floor(rx / laneWidth + 0.5);
      float inner = step(0.5, nearest) * step(nearest, uLanes - 0.5);
      float dash = step(0.5, fract((vRoad.y - uTime * 120.0) / 14.0));
      float marks = max(shoulder, stripe(abs(rx - nearest * laneWidth), 0.06) * inner * dash);
      color = mix(color, uLineColor, marks);
    }
    float alpha = mix(1.0, 1.0 - vFog, uTransparent) * uOpacity;
    gl_FragColor = vec4(mix(color, uBackground, vFog * (1.0 - uTransparent)), alpha);
  }
`,Xt=`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`,_t=`
  uniform sampler2D uTexture;
  uniform vec2 uTexel;
  varying vec2 vUv;
  vec4 tap(vec2 offset) {
    return min(texture2D(uTexture, vUv + uTexel * offset), vec4(1.0));
  }
  void main() {
    vec4 sum = tap(vec2(0.0)) * 4.0 + tap(vec2(-1.0, -1.0)) + tap(vec2(1.0, -1.0)) + tap(vec2(-1.0, 1.0)) + tap(vec2(1.0, 1.0));
    gl_FragColor = sum * 0.125;
  }
`,nt=`
  uniform sampler2D uTexture;
  uniform vec2 uTexel;
  varying vec2 vUv;
  vec4 tent() {
    vec4 sum = texture2D(uTexture, vUv + uTexel * vec2(-1.0, 0.0));
    sum += texture2D(uTexture, vUv + uTexel * vec2(1.0, 0.0));
    sum += texture2D(uTexture, vUv + uTexel * vec2(0.0, -1.0));
    sum += texture2D(uTexture, vUv + uTexel * vec2(0.0, 1.0));
    sum += texture2D(uTexture, vUv + uTexel * vec2(-0.5, -0.5)) * 2.0;
    sum += texture2D(uTexture, vUv + uTexel * vec2(0.5, -0.5)) * 2.0;
    sum += texture2D(uTexture, vUv + uTexel * vec2(-0.5, 0.5)) * 2.0;
    sum += texture2D(uTexture, vUv + uTexel * vec2(0.5, 0.5)) * 2.0;
    return sum / 12.0;
  }
`,Dt=`
  ${nt}
  void main() {
    gl_FragColor = tent();
  }
`,Ut=`
  ${nt}
  uniform float uStrength;
  uniform float uCeiling;
  uniform float uLight;
  void main() {
    vec4 color = tent() * uStrength;
    float peak = max(uLight > 0.5 ? color.a : max(color.r, max(color.g, color.b)), 0.0001);
    color *= uCeiling * (1.0 - exp(-peak / uCeiling)) / peak;
    gl_FragColor = uLight > 0.5 ? color : vec4(color.rgb, 0.0);
  }
`;let V=null;const Y=r=>{var f;if(V=V??document.createElement("canvas").getContext("2d"),!V)return[1,1,1];V.fillStyle="#000000",V.fillStyle=r;const a=String(V.fillStyle);if(a.startsWith("#")){const d=parseInt(a.slice(1,7),16);return[(d>>16&255)/255,(d>>8&255)/255,(d&255)/255]}const s=((f=a.match(/[\d.]+/g))==null?void 0:f.map(Number))??[0,0,0];return[s[0]/255,s[1]/255,s[2]/255]},be=(r,a,s)=>{const f=s.length?s:["#ffffff"];for(let d=0;d<j;d++)r.value[d].fromArray(Y(f[d%f.length]));a.value=Math.min(f.length,j)},at=r=>{const a=new o.InstancedBufferGeometry;return a.setIndex(r.index),Object.entries(r.attributes).forEach(([s,f])=>a.setAttribute(s,f)),a},X=r=>Math.sin(r)*.5+.5,ie=(r,a)=>Math.cos(Math.PI*r*4+a)*25+Math.cos(Math.PI*r*8+a*2)**2*5,ue=(r,a)=>-X(Math.PI*r*8+a)*10-X(Math.PI*r+a/8)**5*10,le=(r,a)=>Math.sin(r*Math.PI*4+a)*10,se=(r,a)=>Math.abs(r*10)**2+Math.sin(r*Math.PI*8+a)*20,Nt=(r,a)=>{const{PI:s,cos:f,sin:d}=Math;return[[f(r*s*5+a)*25-f(.02*s*5+a)*25,d(r*s*2+s*.5+a)*15-d(.02*s*2+s*.5+a)*15,0],[ie(r,a)-ie(.0125,a),ue(r,a)-ue(.0125,a),0],[f(r*s*3+a)*30-f(.02*s*3+a)*30,X(r*s*6+a)*30-X(.02*s*6+a)*30,X(r*s*10+a)*20-X(.02*s*10+a)*20],[d(r*s*2+a)*35-d(.0125*s*2+a)*35,d(r*s*3+a)*10-d(.0125*s*3+a)*10,0],[le(r,a)-le(.02,a),se(r,a)-se(.02,a),0]]},kt=(r,a)=>{const[f,,d,$]=Nt(.025,r);return[[f[0]*a*2,f[1]*a*.4,-3],[(ie(.025,r)-ie(.025+.007,r))*a*-2,(ue(.025,r)-ue(.025+.007,r))*a*-5,-10],[d[0]*a*2,d[1]*a*2,d[2]*a*2-5],[$[0]*a,$[1]*a,-5],[(le(.025,r)-le(.025+.01,r))*a*-2,(se(.025,r)-se(.025+.01,r))*a*-4,-10]]},Yt=({curve:r="winding",curvature:a=1,speed:s=1,boost:f=3,fov:d=90,boostFov:$=130,lanes:rt=3,roadWidth:it=10,medianWidth:ut=2,density:lt=40,trailLength:st=1,lightSize:ct=1,poles:dt=20,poleHeight:vt=1,dust:ft=100,glow:mt=.6,reflections:ht=.5,steer:pt=.35,tailColors:K,headColors:q,poleColors:Q,roadColor:gt,roadOpacity:xt=.1,lineColor:wt,background:yt,theme:Te="dark",interactive:Mt=!0,boosting:bt=!1,onBoostStart:Ce,onBoostEnd:Se,className:Ae="",style:Tt})=>{const Re=re.useRef(null),C=ot[Te]??ot.dark,Fe={light:Te==="light",curve:tt.includes(r)?r:"winding",curvature:Math.max(0,a),speed:Math.max(0,s),boost:Math.max(1,f),fov:Math.min(170,Math.max(20,d)),boostFov:Math.min(170,Math.max(20,$)),lanes:Math.max(1,Math.round(rt)),roadWidth:Math.max(1,it),medianWidth:Math.max(0,ut),density:Math.min(O,Math.max(0,Math.round(lt))),trailLength:Math.max(.05,st),lightSize:Math.max(.1,ct),poles:Math.min(G,Math.max(0,Math.round(dt))),poleHeight:Math.max(.1,vt),dust:Math.min(H,Math.max(0,Math.round(ft))),glow:Math.max(0,mt),reflections:Math.max(0,ht),steer:Math.max(0,pt),tailColors:K!=null&&K.length?K:C.tail,headColors:q!=null&&q.length?q:C.head,poleColors:Q!=null&&Q.length?Q:C.poles,roadColor:gt??C.road,roadOpacity:Math.min(1,Math.max(0,xt)),lineColor:wt??C.lines,background:yt??C.background,dustColor:C.dust,interactive:Mt,boosting:bt},P=re.useRef(Fe);P.current=Fe;const de=re.useRef({onBoostStart:Ce,onBoostEnd:Se});return de.current={onBoostStart:Ce,onBoostEnd:Se},re.useEffect(()=>{var et;const p=Re.current;if(!p)return;const Ee=((et=window.matchMedia)==null?void 0:et.call(window,"(prefers-reduced-motion: reduce)").matches)??!1,v=new o.WebGLRenderer({antialias:!0,alpha:!0,powerPreference:"high-performance"});v.outputColorSpace=o.LinearSRGBColorSpace,v.autoClear=!1,v.setPixelRatio(Math.min(window.devicePixelRatio||1,2)),p.appendChild(v.domElement);const L=new o.Scene,g=new o.PerspectiveCamera(P.current.fov,1,.1,1e4);g.position.set(0,8,-5);const x={uTime:{value:0},uCurvature:{value:1},uCurveA:{value:new o.Vector4},uCurveB:{value:0},uFogNear:{value:k*.22},uFogFar:{value:k*.95},uTravel:{value:k},uStretch:{value:0},uPixel:{value:.001}},w=[],Z=[],J=(t,e,i,c={})=>{const m=new o.ShaderMaterial({vertexShader:t,fragmentShader:e,uniforms:{...x,...i},transparent:!0,depthWrite:!1,...c});return w.push(m),m},Ie=()=>({value:Array.from({length:j},()=>new o.Vector3(1,1,1))}),ee=new o.PlaneGeometry(1,k,1,220);ee.rotateX(-Math.PI/2),ee.translate(0,0,-k/2),w.push(ee);const y={uWidth:{value:1},uRoadColor:{value:new o.Vector3},uLineColor:{value:new o.Vector3},uBackground:{value:new o.Vector3},uRoadWidth:{value:10},uMedian:{value:2},uLanes:{value:3},uTransparent:{value:0},uOpacity:{value:1}},te=J(Ot,Vt,y,{transparent:!0,depthWrite:!0}),oe=new o.Mesh(ee,te);oe.frustumCulled=!1,oe.renderOrder=0,oe.layers.enable(1),L.add(oe);const Pe=new o.TubeGeometry(new o.LineCurve3(new o.Vector3(0,0,0),new o.Vector3(0,0,-1)),24,1,7,!1);w.push(Pe);const Le=(t,e,i)=>{const c=at(Pe),m=new Float32Array(O*2*4),h=new Float32Array(O*2*4),E=new Float32Array(O*2),D=new Float32Array(O*2);for(let T=0;T<O;T++){const z=[Math.random(),Math.random(),Math.random(),Math.random()],I=[Math.random(),Math.random(),Math.random(),Math.random()*Math.random()],N=Math.random();for(let u=0;u<2;u++){const l=T*2+u;m.set(z,l*4),h.set(I,l*4),E[l]=u?.5:-.5,D[l]=N}}c.setAttribute("aSeedA",new o.InstancedBufferAttribute(m,4)),c.setAttribute("aSeedB",new o.InstancedBufferAttribute(h,4)),c.setAttribute("aPair",new o.InstancedBufferAttribute(E,1)),c.setAttribute("aTone",new o.InstancedBufferAttribute(D,1)),c.instanceCount=0,w.push(c);const U={uRoadX:{value:0},uRoadWidth:{value:10},uLanes:{value:3},uDirection:{value:t},uSpeedRange:{value:new o.Vector2(...i)},uTrail:{value:1},uSize:{value:1},uColors:Ie(),uColorCount:{value:1},uFade:{value:new o.Vector2(...e)}},ne=(T,z,I,N)=>{const u=J(It,Pt,{...U,uRadiusScale:{value:T},uSharp:{value:z},uMirror:{value:I},uIntensity:{value:1},uCore:{value:0}},{depthTest:!I});Z.push(u);const l=new o.Mesh(c,u);return l.frustumCulled=!1,l.renderOrder=N,I||l.layers.enable(1),L.add(l),u};return{geometry:c,uniforms:U,reflection:ne(2.1,1.2,1,1),core:ne(1,.85,0,3)}},ve=Le(1,[0,.6],[60,80]),fe=Le(-1,[1,.4],[120,160]),We=new o.CylinderGeometry(1,1,1,8,1,!0);w.push(We);const S=at(We),Be=new Float32Array(G*2*4),ze=new Float32Array(G*2),Oe=new Float32Array(G*2);for(let t=0;t<G;t++)for(let e=0;e<2;e++){const i=t*2+e;Be.set([Math.random(),Math.random(),Math.random(),Math.random()],i*4),ze[i]=t+(e?.5:0),Oe[i]=e?1:-1}S.setAttribute("aSeed",new o.InstancedBufferAttribute(Be,4)),S.setAttribute("aIndex",new o.InstancedBufferAttribute(ze,1)),S.setAttribute("aSide",new o.InstancedBufferAttribute(Oe,1)),S.instanceCount=0,w.push(S);const W={uCount:{value:20},uEdge:{value:11},uHeight:{value:1},uColors:Ie(),uColorCount:{value:1}},Ve=(t,e,i,c)=>{const m=J(Lt,Wt,{...W,uRadiusScale:{value:t},uSharp:{value:e},uMirror:{value:i},uIntensity:{value:1},uCore:{value:0}},{depthTest:!i});Z.push(m);const h=new o.Mesh(S,m);return h.frustumCulled=!1,h.renderOrder=c,i||h.layers.enable(1),L.add(h),m},me={reflection:Ve(2.4,1.2,1,1),core:Ve(1,.8,0,3)},A=new o.BufferGeometry,he=new Float32Array(H*2*4),Xe=new Float32Array(H*2);for(let t=0;t<H;t++){const e=[Math.random(),Math.random(),Math.random(),Math.random()];he.set(e,t*8),he.set(e,t*8+4),Xe[t*2+1]=1}A.setAttribute("position",new o.BufferAttribute(new Float32Array(H*2*3),3)),A.setAttribute("aSeed",new o.BufferAttribute(he,4)),A.setAttribute("aEnd",new o.BufferAttribute(Xe,1)),A.setDrawRange(0,0),w.push(A);const ae={uSpread:{value:140},uColor:{value:new o.Vector3(1,1,1)},uIntensity:{value:.5}},_e=J(Bt,zt,ae);Z.push(_e);const pe=new o.LineSegments(A,_e);pe.frustumCulled=!1,pe.renderOrder=4,L.add(pe);const Ct=v.extensions.has("EXT_color_buffer_float")||v.extensions.has("EXT_color_buffer_half_float"),M=Array.from({length:5},(t,e)=>{const i=new o.WebGLRenderTarget(1,1,{type:Ct?o.HalfFloatType:o.UnsignedByteType,depthBuffer:e===0});return w.push(i),i}),De=new o.Scene,St=new o.OrthographicCamera(-1,1,1,-1,0,1),Ue=new o.PlaneGeometry(2,2);w.push(Ue);const ge=new o.Mesh(Ue);ge.frustumCulled=!1,De.add(ge);const xe=(t,e)=>{const i=new o.ShaderMaterial({vertexShader:Xt,fragmentShader:t,uniforms:{uTexture:{value:null},uTexel:{value:new o.Vector2},uStrength:{value:1},uCeiling:{value:1},uLight:{value:0}},depthTest:!1,depthWrite:!1,...e});return w.push(i),i},At=xe(_t,{blending:o.NoBlending}),Rt=xe(Dt,{blending:o.CustomBlending,blendSrc:o.OneFactor,blendDst:o.OneFactor,blendSrcAlpha:o.OneFactor,blendDstAlpha:o.OneFactor}),R=xe(Ut,{blending:o.CustomBlending,blendSrc:o.OneFactor}),we=(t,e,i)=>{ge.material=t,t.uniforms.uTexture.value=e.texture,t.uniforms.uTexel.value.set(1/e.width,1/e.height),v.setRenderTarget(i),v.render(De,St)},Ne=new o.Color;let ke=0;const n={boost:0,held:!1,fov:P.current.fov,fovVelocity:0,steerX:0,steerY:0,pointerX:0,pointerY:0,weights:[0,0,0,0,0],visible:!0},b={tail:"",head:"",poles:"",surface:"",light:null},F=new o.Vector3;let _=0,ye=performance.now(),Me=!0;const Ft=t=>{const e=t.tailColors.join();e!==b.tail&&(b.tail=e,be(ve.uniforms.uColors,ve.uniforms.uColorCount,t.tailColors));const i=t.headColors.join();i!==b.head&&(b.head=i,be(fe.uniforms.uColors,fe.uniforms.uColorCount,t.headColors));const c=t.poleColors.join();c!==b.poles&&(b.poles=c,be(W.uColors,W.uColorCount,t.poleColors));const m=[t.roadColor,t.lineColor,t.background,t.dustColor].join();if(m!==b.surface){b.surface=m,y.uRoadColor.value.fromArray(Y(t.roadColor)),y.uLineColor.value.fromArray(Y(t.lineColor)),ae.uColor.value.fromArray(Y(t.dustColor));const h=t.background==="transparent",E=h?[0,0,0]:Y(t.background);y.uBackground.value.fromArray(E),y.uTransparent.value=h?1:0,Ne.setRGB(...E,o.LinearSRGBColorSpace),ke=h?0:1}b.light!==t.light&&(b.light=t.light,Z.forEach(h=>{h.blending=t.light?o.NormalBlending:o.AdditiveBlending,h.needsUpdate=!0}),R.blendDst=t.light?o.OneMinusSrcAlphaFactor:o.OneFactor,R.blendSrcAlpha=t.light?o.OneFactor:o.ZeroFactor,R.blendDstAlpha=t.light?o.OneMinusSrcAlphaFactor:o.OneFactor,R.uniforms.uLight.value=t.light?1:0)},Ge=()=>{const t=Math.max(1,p.clientWidth),e=Math.max(1,p.clientHeight);v.setSize(t,e,!1),M.forEach((i,c)=>i.setSize(Math.max(1,Math.round(t/2**(c+1))),Math.max(1,Math.round(e/2**(c+1))))),g.aspect=t/e,g.updateProjectionMatrix(),Ye()},He=t=>{if(_=0,!Me)return;const e=P.current,i=Math.min(.05,Math.max(.001,(t-ye)/1e3));ye=t,Ft(e);const c=n.held&&e.interactive||e.boosting?1:0;n.boost+=(c-n.boost)*(1-Math.exp(-i/(c>n.boost?.28:.85)));const m=e.speed*(Ee?.3:1)*(1+(e.boost-1)*n.boost);x.uTime.value+=i*m,x.uStretch.value=n.boost*1.1,x.uCurvature.value=e.curvature;const h=tt.indexOf(e.curve)-1,E=1-Math.exp(-i/.6);n.weights=n.weights.map((u,l)=>u+((l===h?1:0)-u)*E),x.uCurveA.value.set(n.weights[0],n.weights[1],n.weights[2],n.weights[3]),x.uCurveB.value=n.weights[4];const D=e.roadWidth/2+e.medianWidth/2,U=.45+.55*e.roadOpacity;[ve,fe].forEach((u,l)=>{u.geometry.instanceCount=e.density*2,u.uniforms.uRoadX.value=l?D:-D,u.uniforms.uRoadWidth.value=e.roadWidth,u.uniforms.uLanes.value=e.lanes,u.uniforms.uTrail.value=e.trailLength,u.uniforms.uSize.value=e.lightSize,u.core.uniforms.uIntensity.value=e.light?.95:1+.35*n.boost,u.core.uniforms.uCore.value=e.light?0:.75,u.reflection.uniforms.uIntensity.value=e.reflections*(e.light?.22:.42)*U}),S.instanceCount=e.poles*2,W.uCount.value=Math.max(1,e.poles),W.uEdge.value=e.roadWidth+e.medianWidth/2+.8,W.uHeight.value=e.poleHeight,me.core.uniforms.uIntensity.value=e.light?.9:1,me.core.uniforms.uCore.value=e.light?0:.6,me.reflection.uniforms.uIntensity.value=e.reflections*(e.light?.2:.38)*U,A.setDrawRange(0,e.dust*2),ae.uIntensity.value=(e.light?.35:.45)*(1+n.boost),ae.uSpread.value=(e.roadWidth*2+e.medianWidth)*5,y.uWidth.value=e.roadWidth*2+e.medianWidth+3,y.uRoadWidth.value=e.roadWidth,y.uMedian.value=e.medianWidth,y.uLanes.value=e.lanes,y.uOpacity.value=e.roadOpacity,te.depthWrite=e.roadOpacity>.5;const ne=Ee?e.fov:e.fov+(e.boostFov-e.fov)*n.boost;n.fovVelocity+=((ne-n.fov)*90-n.fovVelocity*13)*i,n.fov+=n.fovVelocity*i,g.fov=n.fov,x.uPixel.value=2*Math.tan(n.fov*Math.PI/360)/Math.max(1,v.domElement.height);const T=1-Math.exp(-i/.35),z=e.interactive?e.steer:0;n.steerX+=(n.pointerX*z-n.steerX)*T,n.steerY+=(n.pointerY*z-n.steerY)*T,g.position.set(n.steerX*e.roadWidth*.45,8-n.steerY*2.5,-5);const I=kt(x.uTime.value,e.curvature),N=1-n.weights.reduce((u,l)=>u+l,0);if(F.set(0,0,-10*N),I.forEach((u,l)=>{F.x+=u[0]*n.weights[l],F.y+=u[1]*n.weights[l],F.z+=u[2]*n.weights[l]}),F.x+=n.steerX*2.5,F.add(g.position),g.lookAt(F),g.updateProjectionMatrix(),v.setRenderTarget(null),v.setClearColor(Ne,ke),v.clear(),v.render(L,g),e.glow>0){const u=x.uPixel.value;x.uPixel.value=u*(v.domElement.height/M[0].height),g.layers.set(1),te.colorWrite=!1,v.setRenderTarget(M[0]),v.setClearColor(0,0),v.clear(),v.render(L,g),te.colorWrite=!0,g.layers.set(0),x.uPixel.value=u;for(let l=1;l<M.length;l++)we(At,M[l-1],M[l]);for(let l=M.length-1;l>1;l--)we(Rt,M[l],M[l-1]);R.uniforms.uStrength.value=e.glow*(e.light?.5:1.4),R.uniforms.uCeiling.value=e.glow*(e.light?.3:.5),we(R,M[1],null)}n.visible&&(_=requestAnimationFrame(He))},Ye=()=>{_||!Me||!n.visible||(ye=performance.now(),_=requestAnimationFrame(He))},je=t=>{var e,i,c,m;n.held!==t&&(n.held=t,P.current.interactive&&(t?(i=(e=de.current).onBoostStart)==null||i.call(e):(m=(c=de.current).onBoostEnd)==null||m.call(c)))},$e=t=>{t.button!==0&&t.pointerType==="mouse"||je(!0)},B=()=>je(!1),Ke=t=>{const e=p.getBoundingClientRect();n.pointerX=(t.clientX-e.left)/e.width*2-1,n.pointerY=(t.clientY-e.top)/e.height*2-1},qe=()=>{n.pointerX=0,n.pointerY=0},Qe=t=>{P.current.interactive&&t.preventDefault()},Ze=new ResizeObserver(Ge);Ze.observe(p);const Je=new IntersectionObserver(t=>{n.visible=t.some(e=>e.isIntersecting),n.visible&&Ye()});return Je.observe(p),p.addEventListener("pointerdown",$e),p.addEventListener("pointermove",Ke),p.addEventListener("pointerleave",qe),p.addEventListener("contextmenu",Qe),window.addEventListener("pointerup",B),window.addEventListener("pointercancel",B),window.addEventListener("blur",B),Ge(),()=>{Me=!1,cancelAnimationFrame(_),Ze.disconnect(),Je.disconnect(),p.removeEventListener("pointerdown",$e),p.removeEventListener("pointermove",Ke),p.removeEventListener("pointerleave",qe),p.removeEventListener("contextmenu",Qe),window.removeEventListener("pointerup",B),window.removeEventListener("pointercancel",B),window.removeEventListener("blur",B),w.forEach(t=>t.dispose()),v.dispose(),v.domElement.remove()}},[]),Et.jsx("div",{ref:Re,className:`hyperspeed${Ae?` ${Ae}`:""}`,style:Tt})};export{Yt as default};
