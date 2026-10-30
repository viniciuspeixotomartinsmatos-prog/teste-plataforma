import{a as G,j as _e}from"./index-DrbxZl7q.js";const S=1/3,K=1,ot=2.4,rt=38*Math.PI/180,ke={up:[0,1],down:[0,-1],left:[-1,0],right:[1,0],none:[0,0]},nt=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,it=`#version 300 es
precision highp float;
uniform sampler2D uState;
uniform vec2 uGridOrigin;
uniform float uCell;
uniform float uDt;
uniform float uTime;
uniform vec2 uFlow;
uniform float uTurbulence;
uniform float uMagnetism;
uniform float uFieldScale;
uniform vec2 uSeed;
uniform vec4 uCursor;
uniform vec4 uPulse;
uniform float uPulseSpeed;
uniform float uPulseWidth;
uniform vec3 uIntro;
uniform float uSpikeHeight;
uniform float uMound;
uniform float uStiffness;
uniform float uDamping;
uniform float uSettle;
out vec4 outState;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float flowField(vec2 p) {
  vec2 q = p / uFieldScale + uSeed;
  vec2 drift = uFlow * uTime * 0.55;
  vec2 warp = vec2(noise(q * 0.6 + vec2(uTime * 0.07, 3.1)), noise(q * 0.6 - vec2(7.3, uTime * 0.06))) - 0.5;
  vec2 r = q + warp * 1.8 * uTurbulence - drift;
  float n = noise(r) * 0.65 + noise(r * 2.03 + 11.7 - drift * 0.5) * 0.35;
  return smoothstep(0.44, 0.86, n);
}

void main() {
  vec2 texel = floor(gl_FragCoord.xy);
  vec2 p = uGridOrigin + (texel + 0.5) * uCell;
  vec4 prev = texelFetch(uState, ivec2(texel), 0);
  float swell = flowField(p);
  float field = uMagnetism * (0.03 + 1.0 * swell * swell);
  vec2 dc = p - uCursor.xy;
  float falloff = dot(dc, dc) / (uCursor.w * uCursor.w);
  field += uCursor.z * exp(-falloff);
  float mound = uCursor.z * exp(-falloff / 2.2);
  if (uPulse.w > 0.0) {
    float ring = length(p - uPulse.xy) - uPulse.z * uPulseSpeed;
    float envelope = smoothstep(0.0, 0.08, uPulse.z) * exp(-uPulse.z * 1.1);
    field += uPulse.w * envelope * exp(-ring * ring / (uPulseWidth * uPulseWidth));
  }
  float front = clamp((uIntro.z - length(p - uIntro.xy)) / 3.0, 0.0, 1.0);
  front = front * front * (3.0 - 2.0 * front);
  float target = uSpikeHeight * min(pow(max(field * front - 0.04, 0.0), 1.6), 1.0);
  float height = prev.x;
  float velocity = prev.y;
  if (uSettle > 0.5) {
    height = target;
    velocity = 0.0;
  } else {
    float steps = ceil(uDt / 0.008);
    float h = uDt / steps;
    for (int k = 0; k < 8; k++) {
      if (float(k) >= steps) break;
      velocity += (uStiffness * (target - height) - uDamping * velocity) * h;
      height += velocity * h;
    }
    if (height < 0.0) {
      height = 0.0;
      velocity = max(velocity, 0.0);
    }
  }
  outState = vec4(height, velocity, mound * front * uMound, 1.0);
}`,at=`#version 300 es
precision highp float;
uniform sampler2D uState;
uniform vec2 uGridOrigin;
uniform float uCell;
uniform vec2 uStateSize;
uniform float uBoundCell;
out vec4 outBound;

void main() {
  vec2 center = uGridOrigin + (floor(gl_FragCoord.xy) + 0.5) * uBoundCell;
  vec2 base = floor((center - uGridOrigin) / uCell);
  float top = 0.0;
  float peak = 0.0;
  for (int y = -4; y <= 4; y++) {
    for (int x = -4; x <= 4; x++) {
      vec2 texel = clamp(base + vec2(float(x), float(y)), vec2(0.0), uStateSize - 1.0);
      vec4 s = texelFetch(uState, ivec2(texel), 0);
      top = max(top, max(s.x, 0.0) * 1.05 + s.z);
      peak = max(peak, s.x);
    }
  }
  outBound = vec4(top, peak, 0.0, 1.0);
}`,ut=`#version 300 es
precision highp float;
uniform sampler2D uField;
uniform sampler2D uBound;
uniform vec2 uGridOrigin;
uniform vec2 uGridSpan;
uniform vec2 uBoundSpan;
uniform float uCellSize;
uniform vec2 uResolution;
uniform vec3 uCamera;
uniform vec3 uForward;
uniform vec3 uUpward;
uniform float uTanHalf;
uniform float uPixelAngle;
uniform float uFar;
uniform float uFogStart;
uniform float uTop;
uniform float uBottom;
uniform float uTime;
uniform vec4 uCursor;
uniform float uMound;
uniform float uRound;
uniform float uSpan;
uniform float uExponent;
uniform float uWarp;
uniform vec3 uKey;
uniform vec3 uStrip;
uniform vec3 uFill;
uniform float uExposure;
uniform float uLight;
uniform float uOpaque;
uniform vec3 uBase;
uniform float uOpacity;
out vec4 outColor;

const float G = 7.2551975;
const vec2 E1 = vec2(0.8660254, 0.5);
const vec2 E2 = vec2(-0.8660254, 0.5);
const vec2 E3 = vec2(0.0, -1.0);
const mat2 TURN = mat2(0.9902681, 0.1391731, -0.1391731, 0.9902681);
const float F0 = 0.06;

vec3 mound(vec2 p) {
  vec2 d = p - uCursor.xy;
  float inv = 1.0 / (uCursor.w * uCursor.w * 2.2);
  float e = uCursor.z * exp(-dot(d, d) * inv);
  return vec3(e, -2.0 * inv * e * d) * uMound;
}

vec2 lattice(vec2 p) {
  vec2 q = TURN * p;
  float t = uTime * 0.35;
  return q + uWarp * vec2(sin(q.y * 0.9 + t), cos(q.x * 0.8 - t * 0.8));
}

float detail(float t) {
  return smoothstep(3.0, 8.0, 1.0 / max(t * uPixelAngle, 1e-5)) * (1.0 - smoothstep(uFogStart, mix(uFogStart, uFar, 0.7), t));
}

float profile(float u, out float rate) {
  float root = sqrt(max(1.0 - u, 0.0) + uRound * uRound);
  rate = 0.5 / (uSpan * root);
  return clamp(1.0 - (root - uRound) / uSpan, 0.0, 1.0);
}

float spikes(vec2 p, float a, float rise, out float clearance) {
  clearance = 10.0;
  if (a < 0.002) return 0.0;
  vec2 q = lattice(p);
  float u = (cos(G * dot(E1, q)) + cos(G * dot(E2, q)) + cos(G * dot(E3, q)) + 1.5) / 4.5;
  if (a > 0.05) {
    float root = uRound + (1.0 - pow(clamp(rise / a, 0.0, 1.0), 1.0 / uExponent)) * uSpan;
    clearance = sqrt(max(1.0 - u, 0.0) / 8.77) - sqrt(max(root * root - uRound * uRound, 0.0) / 8.77);
  }
  float rate;
  return a * pow(profile(u, rate), uExponent);
}

vec2 spikesSlope(vec2 p, float a, vec2 aSlope) {
  if (a < 0.002) return vec2(0.0);
  vec2 q = lattice(p);
  float c1 = G * dot(E1, q);
  float c2 = G * dot(E2, q);
  float c3 = G * dot(E3, q);
  float u = (cos(c1) + cos(c2) + cos(c3) + 1.5) / 4.5;
  vec2 du = -(G / 4.5) * (sin(c1) * E1 + sin(c2) * E2 + sin(c3) * E3) * TURN;
  float rate;
  float s = max(profile(u, rate), 1e-4);
  float shape = pow(s, uExponent);
  return a * uExponent * shape / s * rate * du + aSlope * shape;
}

float surface(vec2 p, float z, float t, out float clearance) {
  vec4 f = texture(uField, (p - uGridOrigin) / uGridSpan);
  return f.z + spikes(p, f.x * detail(t), z - f.z, clearance);
}

vec2 bound(vec2 p) {
  return texture(uBound, (p - uGridOrigin) / uBoundSpan).rg;
}

float panel(vec3 r, vec3 dir, vec3 up, vec2 extent, float soft) {
  vec3 side = normalize(cross(dir, up));
  vec3 top = cross(side, dir);
  float facing = dot(r, dir);
  if (facing <= 0.0) return 0.0;
  vec2 q = vec2(dot(r, side), dot(r, top)) / facing;
  vec2 e = smoothstep(extent + soft, extent - soft, abs(q));
  return e.x * e.y;
}

vec3 studio(vec3 r, vec3 rd, float soft) {
  vec3 z = vec3(0.0, 0.0, 1.0);
  vec3 col = uKey * 4.2 * panel(r, normalize(vec3(-0.3, -0.5, 0.81)), z, vec2(0.36, 0.22), 0.08 + soft);
  col += uStrip * 1.5 * panel(r, normalize(vec3(-0.9, -0.2, 0.38)), z, vec2(0.12, 0.7), 0.07 + soft);
  col += uStrip * 1.5 * panel(r, normalize(vec3(0.9, -0.1, 0.42)), z, vec2(0.12, 0.7), 0.07 + soft);
  float lift = asin(clamp(r.z, -1.0, 1.0)) - asin(clamp(-rd.z, -1.0, 1.0));
  col += uFill * 0.45 * smoothstep(0.08 - soft, 0.7 + soft, lift) * smoothstep(1.6, 1.0, lift);
  return col;
}

vec4 finish(vec3 light, vec3 paper, float alpha) {
  if (uLight > 0.5) {
    if (uOpaque > 0.5) return vec4(mix(uBase, paper, alpha) * uOpacity, uOpacity);
    vec3 shade = mix(vec3(1.0), paper, alpha * uOpacity);
    float cover = 1.0 - min(shade.r, min(shade.g, shade.b));
    return vec4(shade - (1.0 - cover), cover);
  }
  vec3 glow = light * alpha * uOpacity;
  if (uOpaque > 0.5) return vec4(uBase + glow, 1.0);
  return vec4(glow, max(glow.r, max(glow.g, glow.b)));
}

void main() {
  vec2 ndc = (gl_FragCoord.xy - 0.5 * uResolution) / (0.5 * uResolution.y);
  vec3 side = normalize(cross(uForward, uUpward));
  vec3 rd = normalize(uForward + (ndc.x * side + ndc.y * uUpward) * uTanHalf);
  if (rd.z > -0.004) {
    outColor = finish(vec3(0.0), vec3(1.0), 0.0);
    return;
  }
  float tTop = max((uTop - uCamera.z) / rd.z, 0.0);
  float tEnd = min((uBottom - uCamera.z) / rd.z, uFar);
  if (tTop >= tEnd) {
    outColor = finish(vec3(0.0), vec3(1.0), 0.0);
    return;
  }
  float sink = max(-rd.z, 0.2);
  float glide = max(length(rd.xy), 0.05);
  float chunk = 0.9 / glide;
  float t = tEnd;
  float tPrev = tEnd;
  bool found = false;
  bool smoothHit = false;
  float t0 = tTop;
  vec2 b0 = bound(uCamera.xy + rd.xy * t0);
  for (int c = 0; c < 64; c++) {
    if (t0 >= tEnd) break;
    float t1 = min(t0 + chunk, tEnd);
    vec2 b1 = bound(uCamera.xy + rd.xy * t1);
    float b = max(b0.x, b1.x) + 0.03;
    float z1 = uCamera.z + rd.z * t1;
    if (z1 > b) {
      t0 = t1;
      b0 = b1;
      continue;
    }
    float tt = max(t0, (b - uCamera.z) / rd.z);
    if (max(b0.y, b1.y) < 0.002) {
      for (int k = 0; k < 3; k++) {
        vec3 probe = uCamera + rd * tt;
        tt += (probe.z - mound(probe.xy).x) / sink * 0.95;
      }
      if (tt <= t1 + 0.02 || t1 >= tEnd) {
        t = tt;
        smoothHit = true;
        break;
      }
      t0 = t1;
      b0 = b1;
      continue;
    }
    float tp = tt;
    for (int k = 0; k < 48; k++) {
      vec3 pos = uCamera + rd * tt;
      float clearance;
      float gap = pos.z - surface(pos.xy, pos.z, tt, clearance);
      if (gap < 0.0) {
        found = true;
        break;
      }
      tp = tt;
      float pixel = tt * uPixelAngle;
      float limit = pos.z > bound(pos.xy).x + 0.02 ? 0.6 / glide : max(clearance * 0.9, pixel) / glide;
      tt += max(min(gap * 0.75 / sink, limit), pixel);
      if (tt > t1) break;
    }
    if (found) {
      t = tt;
      tPrev = tp;
      break;
    }
    t0 = t1;
    b0 = b1;
  }

  vec3 pos;
  vec2 slope;
  if (smoothHit || !found) {
    pos = uCamera + rd * t;
    slope = mound(pos.xy).yz;
  } else {
    float lo = tPrev;
    float hi = t;
    for (int k = 0; k < 4; k++) {
      float mid = 0.5 * (lo + hi);
      vec3 probe = uCamera + rd * mid;
      float clearance;
      if (probe.z - surface(probe.xy, probe.z, mid, clearance) < 0.0) hi = mid;
      else lo = mid;
    }
    t = hi;
    pos = uCamera + rd * t;
    vec2 uv = (pos.xy - uGridOrigin) / uGridSpan;
    vec2 step = uCellSize / uGridSpan;
    float fade = detail(t);
    float a = texture(uField, uv).x * fade;
    vec2 aSlope = vec2(
      texture(uField, uv + vec2(step.x, 0.0)).x - texture(uField, uv - vec2(step.x, 0.0)).x,
      texture(uField, uv + vec2(0.0, step.y)).x - texture(uField, uv - vec2(0.0, step.y)).x
    ) * fade / (2.0 * uCellSize);
    slope = mound(pos.xy).yz + spikesSlope(pos.xy, a, aSlope);
  }

  vec3 n = normalize(vec3(-slope, 1.0));
  vec3 r = reflect(rd, n);
  float soft = length(fwidth(r)) * 0.6;
  float facing = max(dot(n, -rd), 0.0);
  float fresnel = F0 + (1.0 - F0) * pow(1.0 - facing, 5.0);
  float rim = pow(1.0 - clamp(abs(dot(rd, n)), 0.0, 1.0), 3.0) * smoothstep(0.85, 0.4, n.z);
  float distance = 1.0 - smoothstep(uFogStart, uFar, t);

  if (uLight > 0.5) {
    vec3 key = normalize(vec3(-0.45, -0.55, 0.7));
    float lambert = clamp(dot(n, key) / key.z, 0.0, 1.0);
    float diffuse = mix(0.62, 1.0, lambert);
    float room = mix(0.3, 1.0, smoothstep(-0.25, 0.3, r.z));
    room -= 0.3 * rim;
    float lum = mix(diffuse, room, fresnel);
    lum = 1.0 - (1.0 - lum) * clamp(uExposure / 3.0, 0.0, 1.5);
    vec3 shadow = mix(vec3(0.0), uStrip, 0.45);
    vec3 paper = mix(shadow, vec3(1.0), clamp(lum, 0.0, 1.0));
    outColor = finish(vec3(0.0), paper, distance);
    return;
  }

  vec3 shine = 1.0 - exp(-(studio(r, rd, soft) * fresnel + uFill * rim * 0.35) * uExposure);
  outColor = finish(shine, vec3(1.0), distance);
}`,C=(n,E,v)=>Math.min(v,Math.max(E,n)),Ue=n=>{const E=C((n-1)/4,0,1),v=1-E*.7,x=1.05+E*1.2,p=Math.sqrt(1+v*v)-v;return{round:v,exponent:x,span:p}},De=(n,E,v)=>{const x=n.createShader(E);return x?(n.shaderSource(x,v),n.compileShader(x),n.getShaderParameter(x,n.COMPILE_STATUS)?x:(n.deleteShader(x),null)):null},le=(n,E)=>{const v=De(n,n.VERTEX_SHADER,nt),x=De(n,n.FRAGMENT_SHADER,E),p=n.createProgram();if(!v||!x||!p)return null;if(n.attachShader(p,v),n.attachShader(p,x),n.bindAttribLocation(p,0,"aPosition"),n.linkProgram(p),n.deleteShader(v),n.deleteShader(x),!n.getProgramParameter(p,n.LINK_STATUS))return n.deleteProgram(p),null;const j={},re=n.getProgramParameter(p,n.ACTIVE_UNIFORMS);for(let L=0;L<re;L++){const B=n.getActiveUniform(p,L);B&&(j[B.name.replace("[0]","")]=n.getUniformLocation(p,B.name))}return{program:p,uniforms:j}},st=({colors:n=["#ffffff","#ffffff","#ffffff"],speed:E=.5,scale:v=1.6,spikeHeight:x=1,sharpness:p=2.5,turbulence:j=1,fluidity:re=.5,tilt:L=48,magnetism:B=1,variation:Oe=0,flowDirection:Ge="down",brightness:Le=1,mouseInteraction:Be=!0,mouseStrength:Xe=1,mouseRadius:Ie=.22,mouseDampening:qe=.15,clickPulse:He=!0,intro:Ne=!0,lightMode:We=!1,transparent:Ye=!0,color:Ve,opacity:Ke=1,paused:je=!1,dpr:$e,mixBlendMode:de,className:me="",style:pe,...Je})=>{const he=G.useRef(null),ve=G.useRef(null),X=G.useRef(null),xe={colors:Array.isArray(n)&&n.length?n.slice(0,3):["#ffffff"],speed:Math.max(0,E),scale:C(v,.2,6),spikeHeight:Math.max(0,x),sharpness:C(p,.6,6),turbulence:Math.max(0,j),fluidity:C(re,0,1),tilt:C(L,10,70),magnetism:Math.max(0,B),variation:Oe,flow:ke[Ge]??ke.down,brightness:Math.max(0,Le),mouseInteraction:Be,mouseStrength:Math.max(0,Xe),mouseRadius:C(Ie,.02,2),mouseDampening:Math.max(0,qe),clickPulse:He,intro:Ne,lightMode:We,transparent:Ye,color:Ve,opacity:C(Ke,0,1),paused:je,dpr:$e},y=G.useRef(xe);return y.current=xe,G.useEffect(()=>{var Pe;const w=he.current,F=ve.current,e=F==null?void 0:F.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!w||!F||!e)return;const ge=!!e.getExtension("EXT_color_buffer_float"),$=le(e,it),J=le(e,at),Q=le(e,ut);if(!$||!J||!Q)return;const Ee=e.createBuffer(),ne=e.createVertexArray();e.bindVertexArray(ne),e.bindBuffer(e.ARRAY_BUFFER,Ee),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0);const ie=(o,t,i)=>{const u=e.createTexture();e.bindTexture(e.TEXTURE_2D,u),ge?e.texImage2D(e.TEXTURE_2D,0,e.RGBA16F,o,t,0,e.RGBA,e.HALF_FLOAT,null):e.texImage2D(e.TEXTURE_2D,0,e.RGBA,o,t,0,e.RGBA,e.UNSIGNED_BYTE,null),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,i),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,i),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);const f=e.createFramebuffer();return e.bindFramebuffer(e.FRAMEBUFFER,f),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,u,0),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),{texture:u,framebuffer:f}},Z=o=>{o&&(e.deleteTexture(o.texture),e.deleteFramebuffer(o.framebuffer))},k=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),ae=new Map,ye=(o,t)=>{if(!o)return t;const i=String(o);if(ae.has(i))return ae.get(i);let u=t;if(k){k.clearRect(0,0,1,1),k.fillStyle="#000000",k.fillStyle=i,k.fillRect(0,0,1,1);const[f,m,T]=k.getImageData(0,0,1,1).data;u=[f/255,m/255,T/255]}return ae.set(i,u),u},I=((Pe=window.matchMedia)==null?void 0:Pe.call(window,"(prefers-reduced-motion: reduce)").matches)??!1,q=Math.tan(rt/2),l={width:1,height:1,worldHeight:10,scale:0,tilt:-1,reach:1},c={x:0,y:0,z:1,forward:[0,1,0],upward:[0,0,1],far:10,distance:4},a={width:0,height:0,originX:0,originY:0,boundWidth:0,boundHeight:0};let U=[],D=null,H=0,ue=!0;const h={x:0,y:0,inside:!1},d={x:0,y:0,strength:0},M={x:0,y:0,age:10};let fe=0,N=y.current.intro&&!I?0:1,ee=Ue(y.current.sharpness),we=y.current.sharpness,W=0,Y=0,te=!0;const Qe=(o,t)=>{const i=l.width/l.height,u=o*i*q,f=t*q,[m,T,z]=c.forward,[,s,b]=c.upward,r=m+u,R=T+f*s,P=z+f*b,g=Math.hypot(r,R,P)||1;return[r/g,R/g,P/g]},O=(o,t)=>{const[i,u,f]=Qe(o,t),m=f<-.004?Math.min(-c.z/f,c.far):c.far;return[c.x+i*m,c.y+u*m]},be=()=>{const o=y.current,t=Math.max(1,w.clientWidth),i=Math.max(1,w.clientHeight),u=Math.min(o.dpr||window.devicePixelRatio||1,2);F.width=Math.max(1,Math.round(t*u)),F.height=Math.max(1,Math.round(i*u)),l.width=F.width,l.height=F.height,l.worldHeight=22/o.scale,l.scale=o.scale,l.tilt=o.tilt;const f=(90-o.tilt)*Math.PI/180,m=l.worldHeight/(2*q);c.forward=[0,Math.cos(f),-Math.sin(f)],c.upward=[0,Math.sin(f),Math.cos(f)],c.x=0,c.y=-m*Math.cos(f),c.z=m*Math.sin(f),c.far=m*2.5,c.distance=m;const T=[O(-1,-1),O(1,-1),O(-1,1),O(1,1),O(0,1)],z=T.map(A=>A[0]),s=T.map(A=>A[1]),b=Math.min(...z)-3,r=Math.max(...z)+3,R=Math.min(...s)-3,P=Math.max(...s)+3;l.reach=Math.max(...T.map(A=>Math.hypot(A[0],A[1])))+4;const g=Math.ceil((r-b)/S)+2,_=Math.ceil((P-R)/S)+2;a.originX=b,a.originY=R,(g!==a.width||_!==a.height)&&(U.forEach(Z),Z(D),U=[ie(g,_,e.LINEAR),ie(g,_,e.LINEAR)],a.width=g,a.height=_,a.boundWidth=Math.ceil(g*S/K),a.boundHeight=Math.ceil(_*S/K),D=ie(a.boundWidth,a.boundHeight,e.NEAREST),H=0),ue=!0},Ze=(o,t)=>{const i=w.getBoundingClientRect(),u=(o-i.left)/Math.max(1,i.width)*2-1,f=1-(t-i.top)/Math.max(1,i.height)*2;return O(u,f)},et=o=>{const t=y.current;(t.scale!==l.scale||t.tilt!==l.tilt)&&be();const i=t.paused?0:1;fe+=o*i*(I?0:t.speed),N=t.intro&&!I?Math.min(1,N+o*i/ot):1,M.age+=o*i;const u=t.mouseInteraction&&h.inside,f=t.mouseDampening>0?1-Math.exp(-o/t.mouseDampening):1;u&&(d.x+=(h.x-d.x)*f,d.y+=(h.y-d.y)*f);const m=u?t.mouseStrength*1.4:0;d.strength+=(m-d.strength)*(1-Math.exp(-o/.35)),Math.abs(m-d.strength)<.001&&(d.strength=m)},Te=o=>{if(!D||U.length<2)return;const t=y.current,i=l.worldHeight,u=t.mouseRadius*i,f=1.2*t.spikeHeight;t.sharpness!==we&&(we=t.sharpness,ee=Ue(t.sharpness));const m=N*N*(3-2*N);e.bindVertexArray(ne),e.activeTexture(e.TEXTURE0);const T=U[H],z=U[1-H];e.bindFramebuffer(e.FRAMEBUFFER,z.framebuffer),e.viewport(0,0,a.width,a.height),e.useProgram($.program);const s=$.uniforms;e.bindTexture(e.TEXTURE_2D,T.texture),e.uniform1i(s.uState,0),e.uniform2f(s.uGridOrigin,a.originX,a.originY),e.uniform1f(s.uCell,S),e.uniform1f(s.uDt,Math.max(o,.001)),e.uniform1f(s.uTime,fe),e.uniform2f(s.uFlow,t.flow[0],t.flow[1]),e.uniform1f(s.uTurbulence,t.turbulence),e.uniform1f(s.uMagnetism,t.magnetism),e.uniform1f(s.uFieldScale,5.5),e.uniform2f(s.uSeed,t.variation*17.31,t.variation*9.73),e.uniform4f(s.uCursor,d.x,d.y,d.strength,u),e.uniform4f(s.uPulse,M.x,M.y,M.age,M.age<4?1.1:0),e.uniform1f(s.uPulseSpeed,i*.45),e.uniform1f(s.uPulseWidth,1.4),e.uniform3f(s.uIntro,0,0,m*(l.reach+3)),e.uniform1f(s.uSpikeHeight,f),e.uniform1f(s.uMound,.6),e.uniform1f(s.uStiffness,150),e.uniform1f(s.uDamping,22-t.fluidity*15),e.uniform1f(s.uSettle,ue||!ge||I?1:0),e.drawArrays(e.TRIANGLES,0,3),ue=!1,H=1-H,e.bindFramebuffer(e.FRAMEBUFFER,D.framebuffer),e.viewport(0,0,a.boundWidth,a.boundHeight),e.useProgram(J.program);const b=J.uniforms;e.bindTexture(e.TEXTURE_2D,z.texture),e.uniform1i(b.uState,0),e.uniform2f(b.uGridOrigin,a.originX,a.originY),e.uniform1f(b.uCell,S),e.uniform2f(b.uStateSize,a.width,a.height),e.uniform1f(b.uBoundCell,K),e.drawArrays(e.TRIANGLES,0,3),e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,l.width,l.height),e.useProgram(Q.program);const r=Q.uniforms;e.bindTexture(e.TEXTURE_2D,z.texture),e.uniform1i(r.uField,0),e.activeTexture(e.TEXTURE1),e.bindTexture(e.TEXTURE_2D,D.texture),e.uniform1i(r.uBound,1),e.activeTexture(e.TEXTURE0),e.uniform2f(r.uGridOrigin,a.originX,a.originY),e.uniform2f(r.uGridSpan,a.width*S,a.height*S),e.uniform2f(r.uBoundSpan,a.boundWidth*K,a.boundHeight*K),e.uniform1f(r.uCellSize,S),e.uniform2f(r.uResolution,l.width,l.height),e.uniform3f(r.uCamera,c.x,c.y,c.z),e.uniform3fv(r.uForward,c.forward),e.uniform3fv(r.uUpward,c.upward),e.uniform1f(r.uTanHalf,q),e.uniform1f(r.uPixelAngle,2*q/l.height),e.uniform1f(r.uFar,c.far),e.uniform1f(r.uFogStart,c.distance*.95),e.uniform1f(r.uTop,f*1.6+.6*3+.1),e.uniform1f(r.uBottom,-.05),e.uniform1f(r.uTime,fe*2),e.uniform4f(r.uCursor,d.x,d.y,d.strength,u),e.uniform1f(r.uMound,.6),e.uniform1f(r.uRound,ee.round),e.uniform1f(r.uSpan,ee.span),e.uniform1f(r.uExponent,ee.exponent),e.uniform1f(r.uWarp,.06*t.turbulence);const R=t.colors.map(A=>ye(A,[1,1,1])),P=R[0],g=R[1]??P,_=R[2]??g;e.uniform3fv(r.uKey,P),e.uniform3fv(r.uStrip,g),e.uniform3fv(r.uFill,_),e.uniform1f(r.uExposure,3*t.brightness),e.uniform1f(r.uLight,t.lightMode?1:0),e.uniform1f(r.uOpaque,t.transparent?0:1),e.uniform3fv(r.uBase,ye(t.color,t.lightMode?[1,1,1]:[.0706,.0588,.0902])),e.uniform1f(r.uOpacity,t.opacity),e.drawArrays(e.TRIANGLES,0,3)},Re=o=>{if(W=0,!te||document.hidden)return;const t=Y?C((o-Y)/1e3,5e-4,.05):1/60;Y=o,et(t),Te(t),W=requestAnimationFrame(Re)},V=()=>{!W&&te&&!document.hidden&&(W=requestAnimationFrame(Re))},se=()=>{be(),Te(0),V()},tt=o=>{const t=w.getBoundingClientRect(),i=o.clientX-t.left,u=o.clientY-t.top;h.inside=i>=0&&u>=0&&i<=t.width&&u<=t.height,[h.x,h.y]=Ze(o.clientX,o.clientY)},ce=o=>{const t=h.inside;tt(o),h.inside&&!t&&d.strength<.05&&(d.x=h.x,d.y=h.y),V()},Se=o=>{ce(o),!(!h.inside||!y.current.clickPulse||I)&&(M.x=h.x,M.y=h.y,M.age=0)},oe=o=>{o.pointerType!=="mouse"&&(h.inside=!1)},Fe=()=>{h.inside=!1},Me=()=>{Y=0,V()},ze=new ResizeObserver(se);ze.observe(w);const Ae=new IntersectionObserver(o=>{te=o.some(t=>t.isIntersecting),te&&(Y=0,V())});Ae.observe(w),window.addEventListener("pointermove",ce,{passive:!0}),window.addEventListener("pointerdown",Se,{passive:!0}),window.addEventListener("pointerup",oe,{passive:!0}),window.addEventListener("pointercancel",oe,{passive:!0}),document.documentElement.addEventListener("pointerleave",Fe),document.addEventListener("visibilitychange",Me),se();let Ce=y.current.dpr;return X.current=()=>{const o=y.current;if(o.dpr!==Ce){Ce=o.dpr,se();return}V()},()=>{var o;cancelAnimationFrame(W),X.current=null,ze.disconnect(),Ae.disconnect(),window.removeEventListener("pointermove",ce),window.removeEventListener("pointerdown",Se),window.removeEventListener("pointerup",oe),window.removeEventListener("pointercancel",oe),document.documentElement.removeEventListener("pointerleave",Fe),document.removeEventListener("visibilitychange",Me),U.forEach(Z),Z(D),e.deleteProgram($.program),e.deleteProgram(J.program),e.deleteProgram(Q.program),e.deleteBuffer(Ee),e.deleteVertexArray(ne),(o=e.getExtension("WEBGL_lose_context"))==null||o.loseContext()}},[]),G.useEffect(()=>{var w;(w=X.current)==null||w.call(X)}),_e.jsx("div",{ref:he,className:`ferrofluid-container${me?` ${me}`:""}`,style:de?{...pe,mixBlendMode:de}:pe,...Je,children:_e.jsx("canvas",{ref:ve,className:"ferrofluid-canvas","aria-hidden":"true"})})};export{st as default};
