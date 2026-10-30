import{a as L,j as Xe}from"./index-DrbxZl7q.js";const A=10,vt=1.8,xt={square:0,circle:1,triangle:2,diamond:3,cross:4,ring:5},gt={none:0,grow:1,reveal:2},me=(a,r)=>(Math.floor(a)/2+Math.floor(r)*Math.floor(r)*.75)%1,Rt=(a,r)=>(me(a/4,r/4)*.25+me(a/2,r/2))*.25+me(a,r),yt=Array.from({length:64},(a,r)=>Rt(r%8,Math.floor(r/8)).toFixed(6)).join(", "),Et=-6,Mt=10,Tt=`#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`,$e=`
const float RANGE_MIN = ${Et.toFixed(1)};
const float RANGE_MAX = ${Mt.toFixed(1)};

vec2 pack16(float value) {
  float x = floor(clamp((value - RANGE_MIN) / (RANGE_MAX - RANGE_MIN), 0.0, 1.0) * 65535.0 + 0.5);
  float hi = floor(x / 256.0);
  return vec2(hi, x - hi * 256.0) / 255.0;
}

float unpack16(vec2 c) {
  float x = floor(c.x * 255.0 + 0.5) * 256.0 + floor(c.y * 255.0 + 0.5);
  return RANGE_MIN + x / 65535.0 * (RANGE_MAX - RANGE_MIN);
}
`,wt=`#version 300 es
precision highp float;
precision highp int;

uniform vec2 uResolution;
uniform float uTime;
uniform float uPixelSize;
uniform float uScale;
uniform float uDensity;
uniform int uEnableRipples;
uniform float uRippleSpeed;
uniform float uRippleThickness;
uniform float uRippleIntensity;
uniform vec2 uClickPos[${A}];
uniform float uClickAge[${A}];
uniform ivec2 uOrigin;
uniform vec2 uDrift;
uniform int uHover;
uniform vec2 uMouse;
uniform float uMouseRadius;
uniform float uMousePresence;
uniform float uIntro;
uniform sampler2D uPrev;
uniform float uDecay;
uniform float uFresh;

out vec4 outCell;
${$e}
float hash11(float n) { return fract(sin(n) * 43758.5453); }

float vnoise(vec3 p) {
  vec3 ip = floor(p);
  vec3 fp = fract(p);
  float n000 = hash11(dot(ip + vec3(0.0, 0.0, 0.0), vec3(1.0, 57.0, 113.0)));
  float n100 = hash11(dot(ip + vec3(1.0, 0.0, 0.0), vec3(1.0, 57.0, 113.0)));
  float n010 = hash11(dot(ip + vec3(0.0, 1.0, 0.0), vec3(1.0, 57.0, 113.0)));
  float n110 = hash11(dot(ip + vec3(1.0, 1.0, 0.0), vec3(1.0, 57.0, 113.0)));
  float n001 = hash11(dot(ip + vec3(0.0, 0.0, 1.0), vec3(1.0, 57.0, 113.0)));
  float n101 = hash11(dot(ip + vec3(1.0, 0.0, 1.0), vec3(1.0, 57.0, 113.0)));
  float n011 = hash11(dot(ip + vec3(0.0, 1.0, 1.0), vec3(1.0, 57.0, 113.0)));
  float n111 = hash11(dot(ip + vec3(1.0, 1.0, 1.0), vec3(1.0, 57.0, 113.0)));
  vec3 w = fp * fp * fp * (fp * (fp * 6.0 - 15.0) + 10.0);
  float x00 = mix(n000, n100, w.x);
  float x10 = mix(n010, n110, w.x);
  float x01 = mix(n001, n101, w.x);
  float x11 = mix(n011, n111, w.x);
  float y0 = mix(x00, x10, w.y);
  float y1 = mix(x01, x11, w.y);
  return mix(y0, y1, w.z) * 2.0 - 1.0;
}

float fbm2(vec2 uv, float t) {
  vec3 p = vec3(uv * uScale, t);
  float amp = 1.0;
  float freq = 1.0;
  float sum = 1.0;
  for (int i = 0; i < 5; ++i) {
    sum += amp * vnoise(p * freq);
    freq *= 1.25;
    amp *= 1.0;
  }
  return sum * 0.5 + 0.5;
}

void main() {
  ivec2 texel = ivec2(gl_FragCoord.xy);
  float aspectRatio = uResolution.x / uResolution.y;
  float cellPixelSize = 8.0 * uPixelSize;
  vec2 cellId = vec2(texel + uOrigin);
  vec2 cellCoord = cellId * cellPixelSize;
  vec2 uv = cellCoord / uResolution * vec2(aspectRatio, 1.0);

  float base = fbm2(uv + uDrift, uTime * 0.05);
  base = base * 0.5 - 0.65;
  float feed = base + (uDensity - 0.5) * 0.3;
  if (uEnableRipples == 1) {
    for (int i = 0; i < ${A}; ++i) {
      vec2 pos = uClickPos[i];
      if (pos.x < 0.0) continue;
      vec2 cuv = (((pos - uResolution * 0.5 - cellPixelSize * 0.5) / uResolution)) * vec2(aspectRatio, 1.0);
      float t = max(uClickAge[i], 0.0);
      float r = distance(uv, cuv);
      float waveR = uRippleSpeed * t;
      float ring = exp(-pow((r - waveR) / uRippleThickness, 2.0));
      float atten = exp(-1.0 * t) * exp(-10.0 * r);
      feed = max(feed, ring * atten * uRippleIntensity);
    }
  }

  if (uIntro < 1.0) {
    vec2 center = (-cellPixelSize * 0.5 / uResolution) * vec2(aspectRatio, 1.0);
    float reach = length(vec2(aspectRatio, 1.0)) * 0.5 + 0.2;
    float eased = 1.0 - pow(1.0 - uIntro, 2.4);
    float front = eased * reach;
    float r = distance(uv, center);
    float shown = smoothstep(front + 0.04, front - 0.06, r);
    float ring = exp(-pow((r - front) / 0.07, 2.0)) * (1.0 - uIntro);
    feed = mix(-1.0, feed, shown);
    feed = max(feed, ring * 1.4);
  }

  float brush = 0.0;
  if (uHover > 0) {
    vec2 d = (cellCoord + cellPixelSize * 0.5 + uResolution * 0.5 - uMouse) / max(uMouseRadius, 1.0);
    brush = exp(-dot(d, d)) * uMousePresence;
  }
  vec4 prev = texelFetch(uPrev, texel, 0) * (1.0 - uFresh);
  float trail = max(brush, max(prev.a * uDecay - 1.0 / 255.0, 0.0));
  if (uHover == 2) feed += trail * 0.9;

  outCell = vec4(pack16(feed), clamp((feed + 0.5) * 0.5, 0.0, 1.0), trail);
}`,bt=`#version 300 es
precision highp float;
precision highp int;

uniform vec3 uColor;
uniform vec3 uAccent;
uniform vec2 uResolution;
uniform float uTime;
uniform float uClock;
uniform float uPixelSize;
uniform float uPixelJitter;
uniform float uEdgeFade;
uniform int uShapeType;
uniform sampler2D uCells;
uniform ivec2 uOrigin;
uniform ivec2 uCellCount;
uniform float uSoftness;
uniform float uSmoothing;
uniform float uGlow;
uniform float uTwinkle;
uniform float uLightMode;
uniform float uTransparent;
uniform float uNoise;
uniform int uHover;
uniform mat3 uPlane;
uniform float uTilted;

out vec4 fragColor;
${$e}
const float BAYER[64] = float[64](${yt});

vec2 gDx;
vec2 gDy;

float aaFrom(vec2 grad) {
  return abs(dot(grad, gDx)) + abs(dot(grad, gDy));
}

float maskSquare(vec2 p, float cov, float soft) {
  if (soft <= 0.0) return cov;
  float side = 0.5 * sqrt(clamp(cov, 0.0, 1.0));
  vec2 c = p - 0.5;
  vec2 q = abs(c) - side;
  float d = max(q.x, q.y);
  vec2 grad = q.x > q.y ? vec2(sign(c.x), 0.0) : vec2(0.0, sign(c.y));
  float aa = max(aaFrom(grad), 1e-4);
  return 1.0 - smoothstep(-aa * 0.5, aa * 0.5, d);
}

float maskCircle(vec2 p, float cov) {
  float r = sqrt(cov) * 0.25;
  vec2 c = p - 0.5;
  float len = length(c);
  float d = len - r;
  float aa = 0.5 * aaFrom(c / max(len, 1e-5));
  return cov * (1.0 - smoothstep(-aa, aa, d * 2.0));
}

float maskTriangle(vec2 p, vec2 id, float cov) {
  bool flip = mod(id.x + id.y, 2.0) > 0.5;
  if (flip) p.x = 1.0 - p.x;
  float r = sqrt(cov);
  float d = p.y - r * (1.0 - p.x);
  float aa = max(aaFrom(vec2(flip ? -r : r, 1.0)), 1e-4);
  return cov * clamp(0.5 - d / aa, 0.0, 1.0);
}

float maskDiamond(vec2 p, float cov) {
  float r = sqrt(cov) * 0.564;
  return step(abs(p.x - 0.49) + abs(p.y - 0.49), r);
}

float maskCross(vec2 p, float cov) {
  float s = sqrt(clamp(cov, 0.0, 1.0));
  vec2 c = p - 0.5;
  vec2 q = abs(c);
  float arm = 0.42 * s;
  float bar = 0.13 * s + 0.02;
  float a1 = max(q.x - arm, q.y - bar);
  float a2 = max(q.x - bar, q.y - arm);
  float d = min(a1, a2);
  bool horizontal = a1 < a2 ? q.x - arm > q.y - bar : q.x - bar > q.y - arm;
  vec2 grad = horizontal ? vec2(sign(c.x), 0.0) : vec2(0.0, sign(c.y));
  float aa = max(aaFrom(grad), 1e-4);
  return 1.0 - smoothstep(-aa * 0.5, aa * 0.5, d);
}

float maskRing(vec2 p, float cov) {
  float s = sqrt(clamp(cov, 0.0, 1.0));
  vec2 c = p - 0.5;
  float len = length(c);
  float d = abs(len - 0.3 * s) - 0.09 * s;
  vec2 grad = sign(len - 0.3 * s) * c / max(len, 1e-5);
  float aa = max(aaFrom(grad), 1e-4);
  return 1.0 - smoothstep(-aa * 0.5, aa * 0.5, d);
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  float pixelSize = uPixelSize;
  vec2 screen = gl_FragCoord.xy;
  vec4 empty = uTransparent < 0.5 ? vec4(vec3(uLightMode > 0.5 ? 1.0 : 0.0), 1.0) : vec4(0.0);

  float lod = 0.0;
  float depthFade = 1.0;
  if (uTilted > 0.5) {
    vec3 plane = uPlane * vec3(screen.x, uResolution.y - screen.y, 1.0);
    screen = vec2(plane.x, uResolution.y * plane.z - plane.y) / max(plane.z, 1e-4);
    float footprint = length(fwidth(screen));
    lod = smoothstep(0.3, 0.85, footprint / pixelSize);
    depthFade = (1.0 - smoothstep(0.45, 1.0, footprint / (8.0 * pixelSize))) * step(0.0, plane.z);
  }

  vec2 fragCoord = screen - uResolution * 0.5;
  gDx = dFdx(fragCoord) / pixelSize;
  gDy = dFdy(fragCoord) / pixelSize;
  if (depthFade <= 0.0) {
    fragColor = empty;
    return;
  }

  float cellPixelSize = 8.0 * pixelSize;
  vec2 cellId = floor(fragCoord / cellPixelSize);
  ivec2 texel = clamp(ivec2(cellId) - uOrigin, ivec2(0), uCellCount - 1);
  vec2 smoothAt = (fragCoord / cellPixelSize - vec2(uOrigin)) / vec2(uCellCount);
  vec4 blended = texture(uCells, smoothAt);
  float smoothFeed = blended.b * 2.0 - 0.5;
  float feed = smoothFeed;
  float trail = uHover == 1 ? blended.a : 0.0;
  if (uSmoothing < 1.0) {
    vec4 cell = texelFetch(uCells, texel, 0);
    feed = mix(unpack16(cell.rg), smoothFeed, uSmoothing);
    if (uHover == 1) trail = mix(cell.a, blended.a, uSmoothing);
  }

  if (feed < -0.12 * uSoftness && smoothFeed < 0.2 && (lod <= 0.0 || smoothFeed <= 0.0)) {
    fragColor = empty;
    return;
  }

  vec2 pixelId = floor(fragCoord / pixelSize);
  vec2 pixelUV = fragCoord / pixelSize - pixelId;
  ivec2 cellBits = ivec2(mod(pixelId, 8.0));
  float bayer = BAYER[cellBits.y * 8 + cellBits.x] - 0.5;
  float margin = feed + bayer - 0.5;
  float bw = uSoftness > 0.0 ? smoothstep(-0.12 * uSoftness, 0.12 * uSoftness, margin) : step(0.0, margin);

  float h = uPixelJitter > 0.0 || uTwinkle > 0.0 ? fract(sin(dot(pixelId, vec2(127.1, 311.7))) * 43758.5453) : 0.5;
  float jitterScale = 1.0 + (h - 0.5) * uPixelJitter;
  float heat = max(trail, clamp((feed - 1.0) * 2.5, 0.0, 1.0) * min(uGlow * 2.0, 1.0));
  float coverage = bw * jitterScale * (1.0 + heat * 0.35);
  float M;
  float area;
  if (uShapeType == 1) {
    M = maskCircle(pixelUV, coverage);
    area = 0.196;
  } else if (uShapeType == 2) {
    M = maskTriangle(pixelUV, pixelId, coverage);
    area = 0.5;
  } else if (uShapeType == 3) {
    M = maskDiamond(pixelUV, coverage);
    area = 0.62;
  } else if (uShapeType == 4) {
    M = maskCross(pixelUV, coverage);
    area = 0.41;
  } else if (uShapeType == 5) {
    M = maskRing(pixelUV, coverage);
    area = 0.41;
  } else {
    M = maskSquare(pixelUV, coverage, uSoftness);
    area = 1.0;
  }
  if (lod > 0.0) {
    float average = clamp(smoothFeed, 0.0, 1.0) * area * (1.0 + heat * 0.35);
    M = mix(M, average, lod);
  }

  if (uTwinkle > 0.0) {
    float rate = 1.5 + 3.0 * fract(h * 7.31);
    float wave = 0.5 + 0.5 * sin(uClock * rate + h * 37.0);
    M *= 1.0 - uTwinkle * 0.55 * wave * wave;
  }

  float density = clamp(smoothFeed, 0.0, 1.0);
  float glow = 0.0;
  if (uGlow > 0.0) {
    float bloom = smoothstep(0.2, 1.0, density);
    glow = bloom * bloom * uGlow * (uLightMode > 0.5 ? 0.12 : 0.22) * depthFade;
  }

  float fade = depthFade;
  if (uEdgeFade > 0.0) {
    vec2 norm = gl_FragCoord.xy / uResolution;
    vec2 edgeA = clamp(norm / uEdgeFade, 0.0, 1.0);
    vec2 edgeB = clamp((1.0 - norm) / uEdgeFade, 0.0, 1.0);
    vec2 sa = edgeA * edgeA * edgeA * (edgeA * (edgeA * 6.0 - 15.0) + 10.0);
    vec2 sb = edgeB * edgeB * edgeB * (edgeB * (edgeB * 6.0 - 15.0) + 10.0);
    fade *= sa.x * sa.y * sb.x * sb.y;
  }
  M = clamp(M, 0.0, 1.0) * fade;
  glow *= fade;

  float hot = clamp(heat, 0.0, 1.0);
  float tone = smoothstep(0.3, 1.0, density) * 0.85;
  vec3 color = mix(uColor, uAccent, max(tone, hot));
  vec3 lit = uLightMode > 0.5 ? color * (1.0 - 0.35 * hot) : mix(color, vec3(1.0), 0.45 * hot);
  if (uNoise > 0.0) {
    float n = hash(floor(gl_FragCoord.xy) + floor(uTime * 60.0));
    lit = clamp(lit + (n - 0.5) * uNoise, 0.0, 1.0);
  }

  vec3 haze = uLightMode > 0.5 ? mix(color, vec3(1.0), 0.35) : color;
  float alpha = M + glow * (1.0 - M);
  vec3 premul = lit * M + haze * glow * (1.0 - M);
  if (uTransparent < 0.5) {
    vec3 paper = vec3(uLightMode > 0.5 ? 1.0 : 0.0);
    fragColor = vec4(premul + paper * (1.0 - alpha), 1.0);
    return;
  }
  fragColor = vec4(premul, alpha);
}`,_=(a,r,l)=>Math.min(l,Math.max(r,a)),Be=(a,r,l)=>{const n=a.createShader(r);return n?(a.shaderSource(n,l),a.compileShader(n),a.getShaderParameter(n,a.COMPILE_STATUS)?n:(a.deleteShader(n),null)):null},qe=(a,r)=>{const l=Be(a,a.VERTEX_SHADER,Tt),n=Be(a,a.FRAGMENT_SHADER,r),c=a.createProgram();if(!l||!n||!c)return null;if(a.attachShader(c,l),a.attachShader(c,n),a.linkProgram(c),a.deleteShader(l),a.deleteShader(n),!a.getProgramParameter(c,a.LINK_STATUS))return a.deleteProgram(c),null;const R={},w=a.getProgramParameter(c,a.ACTIVE_UNIFORMS);for(let y=0;y<w;y++){const M=a.getActiveUniform(c,y);if(!M)continue;const b=M.name.replace(/\[0\]$/,"");R[b]=a.getUniformLocation(c,b)}return{program:c,uniforms:R}},ee=new Map,Ge=a=>{const r=String(a),l=ee.get(r);if(l)return l;const n=St(a);return ee.size>64&&ee.clear(),ee.set(r,n),n},St=a=>{let r=String(a||"#ffffff").replace("#","").trim();(r.length===3||r.length===4)&&(r=r.slice(0,3).split("").map(n=>n+n).join(""));const l=parseInt(r.slice(0,6),16);return Number.isNaN(l)?[1,1,1]:[(l>>16&255)/255,(l>>8&255)/255,(l&255)/255]},At=()=>{var a;if(typeof window<"u"&&((a=window.crypto)!=null&&a.getRandomValues)){const r=new Uint32Array(1);return window.crypto.getRandomValues(r),r[0]/4294967295}return Math.random()},Ft=a=>{const[r,l,n,c,R,w,y,M,b]=a,N=R*b-w*M,V=-(c*b-w*y),H=c*M-R*y,S=r*N+l*V+n*H||1;return[N/S,-(l*b-n*M)/S,(l*w-n*R)/S,V/S,(r*b-n*y)/S,-(r*w-n*c)/S,H/S,-(r*M-l*y)/S,(r*R-l*c)/S]},Oe=(a,r)=>{const l=new Array(9);for(let n=0;n<3;n++)for(let c=0;c<3;c++)l[n*3+c]=a[n*3]*r[c]+a[n*3+1]*r[3+c]+a[n*3+2]*r[6+c];return l},Ct=(a,r,l,n)=>{const c=a*Math.PI/180,R=r*Math.PI/180,w=Math.max(l,n)*1.25,y=l/2,M=n/2,b=[Math.cos(R),0,0,Math.sin(c)*Math.sin(R),Math.cos(c),0,Math.sin(R)*Math.cos(c)/w,-Math.sin(c)/w,1],N=Oe(Oe([1,0,y,0,1,M,0,0,1],b),[1,0,-y,0,1,-M,0,0,1]);return Ft(N)},kt=({variant:a="square",pixelSize:r=3,color:l="#B497CF",accentColor:n,className:c,style:R,patternScale:w=2,patternDensity:y=1,pixelSizeJitter:M=0,enableRipples:b=!0,rippleIntensityScale:N=1,rippleThickness:V=.1,rippleSpeed:H=.3,autoPauseOffscreen:S=!0,speed:Ve=.5,transparent:He=!0,edgeFade:Ye=.5,noiseAmount:je=0,softness:Ke=.6,smoothing:Je=1,glow:We=.4,twinkle:Qe=.25,drift:Ze=.2,driftAngle:et=30,hoverEffect:tt="reveal",hoverRadius:ot=140,autoRipple:at=0,tiltX:rt=0,tiltY:it=0,intro:nt=!0,variation:lt,lightMode:ct=!1,dpr:st})=>{const de=L.useRef(null),pe=L.useRef(null),X=L.useRef(null),he={variant:xt[a]??0,pixelSize:Math.max(.5,r),color:l,accentColor:n||l,patternScale:w,patternDensity:y,pixelSizeJitter:M,enableRipples:b,rippleIntensityScale:N,rippleThickness:Math.max(.001,V),rippleSpeed:H,autoPauseOffscreen:S,speed:Ve,transparent:He,edgeFade:_(Ye,0,1),noiseAmount:je,softness:_(Ke,0,1),smoothing:_(Je,0,1),glow:_(We,0,2),twinkle:_(Qe,0,1),drift:Ze,driftAngle:et,hoverEffect:gt[tt]??0,hoverRadius:Math.max(10,ot),autoRipple:Math.max(0,at),tiltX:_(rt,-70,70),tiltY:_(it,-70,70),intro:nt,variation:lt,lightMode:ct,dpr:st},k=L.useRef(he);return k.current=he,L.useEffect(()=>{var ze;const F=de.current,m=pe.current,e=m==null?void 0:m.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!F||!m||!e)return;const Y=qe(e,wt),j=qe(e,bt);if(!Y||!j)return;const p=Y.uniforms,d=j.uniforms,te=e.createVertexArray(),ft=t=>{const o=e.createTexture();return e.bindTexture(e.TEXTURE_2D,o),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,t),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,t),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,1,1,0,e.RGBA,e.UNSIGNED_BYTE,null),o},B=[0,1].map(()=>{const t=ft(e.LINEAR),o=e.createFramebuffer();return e.bindFramebuffer(e.FRAMEBUFFER,o),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0),{texture:t,framebuffer:o}});e.bindFramebuffer(e.FRAMEBUFFER,null);const I=((ze=window.matchMedia)==null?void 0:ze.call(window,"(prefers-reduced-motion: reduce)").matches)??!1,s={width:1,height:1,ratio:1,plane:null,tiltKey:""},g={x:0,y:0,w:1,h:1,key:""},C={x:0,y:0,inside:!1},T={x:0,y:0,ready:!1},z=new Float32Array(A*2).fill(-1),ve=new Float32Array(A),oe=new Float32Array(A);let q=0,G=0,ae=!0;const xe=k.current.variation,ut=typeof xe=="number"?xe*37:At()*1e3;let ge=0,K=0,J=0,Re=0,ye=0,U=k.current.intro&&!I?0:1,re=1.2,O=0,W=0,Q=!0,Z=0;const Ee=t=>ut+ge*t.speed,Me=t=>{const i=8*(t.pixelSize*s.ratio),f=m.width,u=m.height;let x=-f/2,v=f/2,P=-u/2,E=u/2;if(s.plane){const fe=[[0,0],[f,0],[0,u],[f,u],[f/2,0],[f/2,u],[0,u/2],[f,u/2]];x=1/0,v=-1/0,P=1/0,E=-1/0;for(const[pt,ht]of fe){const[ue,Le]=ie(pt,ht);ue<-1e5||(x=Math.min(x,ue-f/2),v=Math.max(v,ue-f/2),P=Math.min(P,Le-u/2),E=Math.max(E,Le-u/2))}Number.isFinite(x)||(x=-f/2,v=f/2,P=-u/2,E=u/2)}const h=i,ne=Math.floor((x-h)/i),mt=Math.floor((v+h)/i),le=Math.floor((P-h)/i),dt=Math.floor((E+h)/i),ce=Math.max(1,Math.min(2048,mt-ne+1)),se=Math.max(1,Math.min(2048,dt-le+1)),Ue=`${ne}:${le}:${ce}:${se}`;if(Ue!==g.key){g.key=Ue,g.x=ne,g.y=le,g.w=ce,g.h=se;for(const fe of B)e.bindTexture(e.TEXTURE_2D,fe.texture),e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,ce,se,0,e.RGBA,e.UNSIGNED_BYTE,null);ae=!0}},$=new Float32Array(A*2),Te=(t,o)=>{for(let v=0;v<A;v++){if(z[v*2]<0){$[v*2]=-1,$[v*2+1]=-1;continue}const[P,E]=ie(z[v*2],z[v*2+1]);$[v*2]=Math.max(P,0),$[v*2+1]=E}const[i,f]=ie(T.x,T.y),u=B[G],x=B[1-G];e.bindFramebuffer(e.FRAMEBUFFER,x.framebuffer),e.viewport(0,0,g.w,g.h),e.disable(e.BLEND),e.useProgram(Y.program),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,u.texture),e.uniform1i(p.uPrev,0),e.uniform2f(p.uResolution,m.width,m.height),e.uniform1f(p.uTime,Ee(t)),e.uniform1f(p.uPixelSize,t.pixelSize*s.ratio),e.uniform1f(p.uScale,t.patternScale),e.uniform1f(p.uDensity,t.patternDensity),e.uniform1i(p.uEnableRipples,t.enableRipples?1:0),e.uniform1f(p.uRippleSpeed,t.rippleSpeed),e.uniform1f(p.uRippleThickness,t.rippleThickness),e.uniform1f(p.uRippleIntensity,t.rippleIntensityScale),e.uniform2fv(p.uClickPos,$),e.uniform1fv(p.uClickAge,oe),e.uniform2i(p.uOrigin,g.x,g.y),e.uniform2f(p.uDrift,Re,ye),e.uniform1i(p.uHover,t.hoverEffect),e.uniform2f(p.uMouse,i,f),e.uniform1f(p.uMouseRadius,t.hoverRadius*s.ratio),e.uniform1f(p.uMousePresence,J),e.uniform1f(p.uIntro,U),e.uniform1f(p.uDecay,o),e.uniform1f(p.uFresh,ae?1:0),e.bindVertexArray(te),e.drawArrays(e.TRIANGLES,0,3),e.bindFramebuffer(e.FRAMEBUFFER,null),G=1-G,ae=!1},we=()=>{const t=k.current;if(e.viewport(0,0,m.width,m.height),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.useProgram(j.program),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,B[G].texture),e.uniform1i(d.uCells,0),e.uniform3fv(d.uColor,Ge(t.color)),e.uniform3fv(d.uAccent,Ge(t.accentColor)),e.uniform2f(d.uResolution,m.width,m.height),e.uniform1f(d.uTime,Ee(t)),e.uniform1f(d.uClock,K),e.uniform1f(d.uPixelSize,t.pixelSize*s.ratio),e.uniform1f(d.uPixelJitter,t.pixelSizeJitter),e.uniform1f(d.uEdgeFade,t.edgeFade),e.uniform1i(d.uShapeType,t.variant),e.uniform2i(d.uOrigin,g.x,g.y),e.uniform2i(d.uCellCount,g.w,g.h),e.uniform1f(d.uSoftness,t.softness),e.uniform1f(d.uSmoothing,t.smoothing),e.uniform1f(d.uGlow,t.glow),e.uniform1f(d.uTwinkle,I?0:t.twinkle),e.uniform1f(d.uLightMode,t.lightMode?1:0),e.uniform1f(d.uTransparent,t.transparent?1:0),e.uniform1f(d.uNoise,t.noiseAmount),e.uniform1i(d.uHover,t.hoverEffect),e.uniform1f(d.uTilted,s.plane?1:0),s.plane){const o=s.plane;e.uniformMatrix3fv(d.uPlane,!1,[o[0],o[3],o[6],o[1],o[4],o[7],o[2],o[5],o[8]])}e.bindVertexArray(te),e.drawArrays(e.TRIANGLES,0,3),e.bindVertexArray(null)},ie=(t,o)=>{const i=s.plane;if(!i)return[t,o];const f=m.height,u=f-o,x=i[6]*t+i[7]*u+i[8];return x<=1e-4?[-1e6,-1e6]:[(i[0]*t+i[1]*u+i[2])/x,f-(i[3]*t+i[4]*u+i[5])/x]},be=t=>{s.plane=t.tiltX||t.tiltY?Ct(t.tiltX,t.tiltY,m.width,m.height):null,s.tiltKey=`${t.tiltX}:${t.tiltY}:${m.width}:${m.height}`},Se=()=>{const t=k.current;s.width=Math.max(1,F.clientWidth),s.height=Math.max(1,F.clientHeight),s.ratio=Math.min(t.dpr||window.devicePixelRatio||1,2),m.width=Math.max(1,Math.round(s.width*s.ratio)),m.height=Math.max(1,Math.round(s.height*s.ratio)),T.ready||(T.ready=!0,T.x=m.width/2,T.y=m.height/2),be(t),Me(t),Te(t,0),we(),D()},Ae=t=>{O=0;const o=k.current;if(!Q&&o.autoPauseOffscreen||document.hidden)return;const i=W?_((t-W)/1e3,0,1/20):0;if(W=t,I||(ge+=i),K+=i,!I&&o.drift){const h=o.driftAngle*Math.PI/180;Re+=Math.cos(h)*o.drift*i*.05,ye+=Math.sin(h)*o.drift*i*.05}!I&&o.enableRipples&&o.autoRipple>0&&U>=1&&(re-=i,re<=0&&(re=o.autoRipple*(.7+Math.random()*.6),Pe((.15+Math.random()*.7)*s.width,(.15+Math.random()*.7)*s.height)));for(let h=0;h<A;h++)oe[h]=(K-ve[h])*.5;const f=C.x*s.ratio,u=(s.height-C.y)*s.ratio,x=1-Math.exp(-i/.08);C.inside&&(T.x+=(f-T.x)*x,T.y+=(u-T.y)*x),J+=((C.inside?1:0)-J)*(1-Math.exp(-i/.25)),`${o.tiltX}:${o.tiltY}:${m.width}:${m.height}`!==s.tiltKey&&be(o),Me(o);const P=o.hoverEffect?Math.exp(-i/.45):0;Te(o,P),we(),U<1&&(U=Math.min(1,U+i/vt));let E=!I&&(o.speed!==0||o.drift!==0||o.twinkle>0||o.autoRipple>0&&o.enableRipples);E=E||U<1||J>.001;for(let h=0;h<A;h++)E=E||z[h*2]>=0&&oe[h]<8;Z=E?0:Z+i,Z<1.5&&(O=requestAnimationFrame(Ae))};function D(){Z=0,!O&&(Q||!k.current.autoPauseOffscreen)&&!document.hidden&&(W=0,O=requestAnimationFrame(Ae))}const Fe=t=>{const o=F.getBoundingClientRect(),i=t.clientX-o.left,f=t.clientY-o.top;return{x:i,y:f,inside:i>=0&&f>=0&&i<=o.width&&f<=o.height}},Ce=t=>{const{x:o,y:i,inside:f}=Fe(t),u=C.inside;C.inside=f,f&&(C.x=o,C.y=i,u||(T.x=o*s.ratio,T.y=(s.height-i)*s.ratio)),(f||u)&&D()};function Pe(t,o){z[q*2]=t*s.ratio,z[q*2+1]=(s.height-o)*s.ratio,ve[q]=K,q=(q+1)%A,D()}const ke=t=>{const o=k.current,{x:i,y:f,inside:u}=Fe(t);!u||I||!o.enableRipples||Pe(i,f)},_e=()=>{C.inside=!1,D()},Ie=()=>D(),De=new ResizeObserver(Se);De.observe(F);const Ne=new IntersectionObserver(t=>{Q=t.some(o=>o.isIntersecting),Q&&D()});return Ne.observe(F),window.addEventListener("pointermove",Ce,{passive:!0}),window.addEventListener("pointerdown",ke,{passive:!0}),document.documentElement.addEventListener("pointerleave",_e),document.addEventListener("visibilitychange",Ie),Se(),X.current=D,()=>{var t;cancelAnimationFrame(O),X.current=null,De.disconnect(),Ne.disconnect(),window.removeEventListener("pointermove",Ce),window.removeEventListener("pointerdown",ke),document.documentElement.removeEventListener("pointerleave",_e),document.removeEventListener("visibilitychange",Ie);for(const o of B)e.deleteTexture(o.texture),e.deleteFramebuffer(o.framebuffer);e.deleteVertexArray(te),e.deleteProgram(Y.program),e.deleteProgram(j.program),(t=e.getExtension("WEBGL_lose_context"))==null||t.loseContext()}},[]),L.useEffect(()=>{var F;(F=X.current)==null||F.call(X)}),Xe.jsx("div",{ref:de,className:`pixel-blast-container${c?` ${c}`:""}`,style:R,"aria-label":"PixelBlast interactive background",children:Xe.jsx("canvas",{ref:pe,className:"pixel-blast-canvas","aria-hidden":"true"})})};export{kt as default};
