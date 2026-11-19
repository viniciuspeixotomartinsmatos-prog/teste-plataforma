import{a as R,j as dt}from"./index-DrbxZl7q.js";import{R as ht,T as mt,a as De,M as oe,P as re}from"./Triangle-vYsvZ9hc.js";import{R as Ne}from"./RenderTarget-BMPMK3Np.js";const _e={silk:{pattern:"dot",wave:"silk",spacing:9,markSize:.95,depth:.95,light:0,shine:.8,contrast:1.2,speed:.35,scale:1,direction:20},ocean:{pattern:"dot",wave:"swell",spacing:10,markSize:.9,depth:.42,light:0,shine:1,contrast:1.2,speed:.5,scale:1,direction:100},pond:{pattern:"dot",wave:"ripple",spacing:10,markSize:.9,depth:.55,light:0,shine:1.2,contrast:1.2,speed:.5,scale:1,direction:35},lines:{pattern:"line",wave:"silk",spacing:12,markSize:.42,depth:.9,light:0,shine:.6,contrast:1.2,speed:.3,scale:1,direction:20},terminal:{pattern:"glyph",wave:"ripple",spacing:13,markSize:.95,depth:.75,light:0,shine:.9,contrast:1.4,speed:.3,scale:1.1,direction:200},mesh:{pattern:"plus",wave:"silk",spacing:14,markSize:.8,depth:.95,light:0,shine:1,contrast:1.45,speed:.4,scale:1.1,direction:325}},gt={dot:0,square:1,plus:2,line:3,glyph:4},xt={silk:0,swell:1,ripple:2},wt={none:0,edges:1,center:2,bottom:3,top:4},Ge=".:-=+*#%@",yt="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",M=128,Ue=520,We=8,St=60,kt=45e5,At=2,r=(u,f,l)=>Math.min(Math.max(u,f),l),le=u=>.2126*u[0]+.7152*u[1]+.0722*u[2],Be=(u,f)=>{try{const l=document.createElement("canvas").getContext("2d");if(!l)return f;l.fillStyle="#000000",l.fillStyle=u;const x=l.fillStyle;if(x.startsWith("#")){const v=parseInt(x.slice(1),16);return[(v>>16&255)/255,(v>>8&255)/255,(v&255)/255,1]}const s=x.match(/[\d.]+/g);return!s||s.length<3?f:[Number(s[0])/255,Number(s[1])/255,Number(s[2])/255,s[3]?Number(s[3]):1]}catch{return f}},bt=u=>{const f=Array.from(u&&u.length?u:Ge),l=Math.ceil(Math.sqrt(f.length)),x=Math.ceil(f.length/l),s=document.createElement("canvas");s.width=l*M,s.height=x*M;const v=s.getContext("2d");return v?(v.fillStyle="#ffffff",v.textAlign="center",v.textBaseline="middle",v.font=`500 ${Math.round(M*.86)}px ${yt}`,f.forEach((q,I)=>{const X=I%l*M+M/2,Y=Math.floor(I/l)*M+M/2;v.fillText(q,X,Y)}),{canvas:s,columns:l,lines:x,count:f.length}):null},se=`#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`,Ft=`#version 300 es
precision highp float;
precision highp int;
uniform vec2 uSize;
uniform float uDpr;
uniform vec2 uOrigin;
uniform vec2 uPitch;
uniform int uWave;
uniform float uTime;
uniform float uUnit;
uniform vec2 uHeading;
uniform float uAmp;
uniform float uDepth;
uniform vec3 uLight;
uniform float uShine;
uniform float uContrast;
uniform float uInk;
uniform float uOpacity;
uniform int uFade;
uniform float uFadeSize;
uniform float uAppear;
uniform sampler2D tRipple;
uniform float uRipple;
out vec4 fragColor;

const float FOLDS = 5.5;

uvec3 scramble(uvec3 v) {
  v = v * 1664525u + 1013904223u;
  v.x += v.y * v.z;
  v.y += v.z * v.x;
  v.z += v.x * v.y;
  v ^= v >> 16u;
  v.x += v.y * v.z;
  v.y += v.z * v.x;
  v.z += v.x * v.y;
  return v;
}

vec3 lattice(vec3 corner) {
  uvec3 h = scramble(uvec3(ivec3(corner) + 4096));
  return vec3(h & 65535u) / 32767.5 - 1.0;
}

float gradientNoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = p - i;
  vec3 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float n000 = dot(lattice(i), f);
  float n100 = dot(lattice(i + vec3(1.0, 0.0, 0.0)), f - vec3(1.0, 0.0, 0.0));
  float n010 = dot(lattice(i + vec3(0.0, 1.0, 0.0)), f - vec3(0.0, 1.0, 0.0));
  float n110 = dot(lattice(i + vec3(1.0, 1.0, 0.0)), f - vec3(1.0, 1.0, 0.0));
  float n001 = dot(lattice(i + vec3(0.0, 0.0, 1.0)), f - vec3(0.0, 0.0, 1.0));
  float n101 = dot(lattice(i + vec3(1.0, 0.0, 1.0)), f - vec3(1.0, 0.0, 1.0));
  float n011 = dot(lattice(i + vec3(0.0, 1.0, 1.0)), f - vec3(0.0, 1.0, 1.0));
  float n111 = dot(lattice(i + vec3(1.0, 1.0, 1.0)), f - vec3(1.0, 1.0, 1.0));
  return mix(
    mix(mix(n000, n100, u.x), mix(n010, n110, u.x), u.y),
    mix(mix(n001, n101, u.x), mix(n011, n111, u.x), u.y),
    u.z
  );
}

vec2 turn(vec2 v, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec2(c * v.x - s * v.y, s * v.x + c * v.y);
}

float surface(vec2 p, float t) {
  if (uWave == 0) {
    vec2 side = vec2(-uHeading.y, uHeading.x);
    float u = dot(p, uHeading);
    float v = dot(p, side);
    float bend = gradientNoise(vec3(v * 0.85, u * 0.3, t * 0.05)) * 1.7 + 0.4 * sin(v * 1.6 + t * 0.2);
    float phase = u * FOLDS + bend - t * 0.45;
    float swell = 0.6 + 0.4 * gradientNoise(vec3(u * 0.55 + 3.0, v * 0.45, t * 0.04));
    float fold = sin(phase) + 0.32 * sin(2.0 * phase + 1.3);
    float ripple = 0.16 * sin(u * FOLDS * 2.5 + bend * 1.9 - t * 0.9 + 2.1);
    return (fold + ripple) * swell;
  }
  if (uWave == 1) {
    float bend = gradientNoise(vec3(p * 0.6, t * 0.05)) * 0.6;
    float phase = dot(p, uHeading) * 15.0 + bend * 2.2 - t * 1.4;
    float swell = sin(phase) + 0.3 * sin(2.0 * phase - 0.8);
    float roll = 0.75 + 0.25 * gradientNoise(vec3(p * 0.9 + 11.0, t * 0.05));
    return 0.8 * swell * roll;
  }
  float r = length(p + uHeading * 1.2);
  float bend = gradientNoise(vec3(p * 1.2, t * 0.05)) * 0.1;
  return sin((r + bend) * 9.0 - t * 1.8) * (0.45 + 0.55 * exp(-(r - 0.6) * 0.8));
}

float heightAt(vec2 css) {
  float h = surface((css - 0.5 * uSize) / uUnit, uTime) * uAmp;
  if (uRipple > 0.0) h += texture(tRipple, css / uSize).r * uRipple;
  return h;
}

void main() {
  vec2 cell = floor(gl_FragCoord.xy);
  vec2 center = uOrigin + (cell + 0.5) * uPitch;
  vec2 css = center / uDpr;
  vec2 uv = css / uSize;
  float e = max(uPitch.y / uDpr, 4.0);
  float h = heightAt(css);
  float hx = (heightAt(css + vec2(e, 0.0)) - heightAt(css - vec2(e, 0.0))) / (2.0 * e);
  float hy = (heightAt(css + vec2(0.0, e)) - heightAt(css - vec2(0.0, e))) / (2.0 * e);
  vec2 grad = vec2(hx, hy) * uUnit * uDepth * 0.4;
  vec3 n = normalize(vec3(-grad, 1.0));

  float diffuse = clamp(dot(n, uLight), 0.0, 1.0);
  vec3 halfway = normalize(uLight + vec3(0.0, 0.0, 1.0));
  float spec = pow(clamp(dot(n, halfway), 0.0, 1.0), 160.0) * uShine * 1.15;
  float hollow = 0.7 + 0.3 * clamp(h * 0.5 + 0.5, 0.0, 1.0);
  float tone = clamp(diffuse * hollow * 0.78 + spec, 0.0, 1.0);
  tone = clamp((tone - 0.42) * uContrast + 0.42, 0.0, 1.0);

  float level = uInk > 0.5 ? pow(clamp(1.0 - tone / 0.46, 0.0, 1.0), 2.4) * 0.72 : pow(tone, 2.2);
  float emphasis = uInk > 0.5 ? smoothstep(0.55, 0.95, level) : clamp(spec * 1.6, 0.0, 1.0);

  float fade = 1.0;
  vec2 c = uv * 2.0 - 1.0;
  if (uFade == 1) {
    fade = 1.0 - smoothstep(1.0 - uFadeSize, 1.18, length(c));
  } else if (uFade == 2) {
    fade = mix(0.05, 1.0, smoothstep(0.08, 0.08 + uFadeSize, length(c * vec2(1.0, 1.35))));
  } else if (uFade == 3) {
    fade = smoothstep(0.0, uFadeSize, uv.y);
  } else if (uFade == 4) {
    fade = smoothstep(0.0, uFadeSize, 1.0 - uv.y);
  }

  float reach = length(css - 0.5 * uSize) / max(0.5 * length(uSize), 1.0);
  float appear = smoothstep(reach - 0.05, reach + 0.3, uAppear * 1.35);

  float alpha = uOpacity * fade * appear * (0.22 + 0.78 * level);
  float lift = clamp(h * uDepth * 0.42, -0.48, 0.48);
  fragColor = vec4(level, alpha, emphasis, lift + 0.5);
}
`,Mt=`#version 300 es
precision highp float;
uniform sampler2D tState;
uniform vec2 uTexel;
uniform vec2 uSize;
uniform vec2 uFrom;
uniform vec2 uTo;
uniform float uRadius;
uniform float uImpulse;
uniform float uDamping;
out vec4 fragColor;

void main() {
  vec2 uv = gl_FragCoord.xy * uTexel;
  vec2 state = texture(tState, uv).rg;
  float left = texture(tState, uv - vec2(uTexel.x, 0.0)).r;
  float right = texture(tState, uv + vec2(uTexel.x, 0.0)).r;
  float below = texture(tState, uv - vec2(0.0, uTexel.y)).r;
  float above = texture(tState, uv + vec2(0.0, uTexel.y)).r;
  float next = ((left + right + below + above) * 0.5 - state.g) * uDamping;
  vec2 p = uv * uSize;
  vec2 segment = uTo - uFrom;
  float along = clamp(dot(p - uFrom, segment) / max(dot(segment, segment), 1e-4), 0.0, 1.0);
  float d = length(p - uFrom - segment * along) / uRadius;
  next -= uImpulse * exp(-d * d * 2.0);
  fragColor = vec4(next, state.r, 0.0, 1.0);
}
`,Et=`#version 300 es
precision highp float;
precision highp int;
uniform sampler2D tField;
uniform sampler2D tAtlas;
uniform vec2 uOrigin;
uniform vec2 uPitch;
uniform vec2 uGrid;
uniform int uPattern;
uniform float uMarkSize;
uniform float uStroke;
uniform vec3 uColor;
uniform vec3 uAccent;
uniform vec4 uBackground;
uniform vec3 uAtlas;
out vec4 fragColor;

float box(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float coverage(vec2 local, float level) {
  float span = uPitch.y * uMarkSize;
  float area = max(sqrt(level), 0.14);
  if (uPattern == 0) {
    return clamp(0.5 - (length(local) - 0.5 * span * area), 0.0, 1.0);
  }
  if (uPattern == 1) {
    float extent = 0.5 * span * area;
    return clamp(0.5 - box(local, vec2(extent), extent * 0.3), 0.0, 1.0);
  }
  if (uPattern == 2) {
    float arm = 0.5 * span * mix(0.3, 1.0, level);
    float width = 0.5 * uStroke;
    return clamp(0.5 - min(box(local, vec2(arm, width), width), box(local, vec2(width, arm), width)), 0.0, 1.0);
  }
  if (uAtlas.z < 1.0) return 0.0;
  vec2 g = local / span + 0.5;
  if (g.x < 0.0 || g.y < 0.0 || g.x > 1.0 || g.y > 1.0) return 0.0;
  float index = min(floor(level * uAtlas.z), uAtlas.z - 1.0);
  vec2 tile = vec2(mod(index, uAtlas.x), floor(index / uAtlas.x));
  vec2 atlasUv = (tile + vec2(g.x, 1.0 - g.y)) / uAtlas.xy;
  vec2 texel = 1.0 / (span * uAtlas.xy);
  return textureGrad(tAtlas, atlasUv, vec2(texel.x, 0.0), vec2(0.0, texel.y)).a;
}

vec4 lineInk(vec2 rel) {
  float fx = rel.x / uPitch.x - 0.5;
  float c0 = clamp(floor(fx), 0.0, uGrid.x - 1.0);
  float c1 = min(c0 + 1.0, uGrid.x - 1.0);
  float t = clamp(fx - c0, 0.0, 1.0);
  float row = floor(rel.y / uPitch.y);
  vec4 ink = vec4(0.0);
  for (int k = -1; k <= 1; k++) {
    float cy = row + float(k);
    if (cy < 0.0 || cy >= uGrid.y) continue;
    vec4 a = texelFetch(tField, ivec2(int(c0), int(cy)), 0);
    vec4 b = texelFetch(tField, ivec2(int(c1), int(cy)), 0);
    vec4 f = mix(a, b, t);
    if (f.g < 0.002) continue;
    float y = (cy + 0.5 + f.a - 0.5) * uPitch.y;
    float slope = (b.a - a.a) * uPitch.y / uPitch.x;
    float thickness = max(uStroke, uPitch.y * uMarkSize * f.r);
    float d = abs(rel.y - y) / sqrt(1.0 + slope * slope) - 0.5 * thickness;
    float alpha = clamp(0.5 - d, 0.0, 1.0) * f.g;
    if (alpha > ink.a) ink = vec4(mix(uColor, uAccent, f.b) * alpha, alpha);
  }
  return ink;
}

void main() {
  vec2 rel = gl_FragCoord.xy - uOrigin;
  vec4 background = vec4(uBackground.rgb * uBackground.a, uBackground.a);
  vec4 ink = vec4(0.0);
  if (uPattern == 3) {
    ink = lineInk(rel);
  } else {
    float cx = floor(rel.x / uPitch.x);
    float row = floor(rel.y / uPitch.y);
    if (cx >= 0.0 && cx < uGrid.x) {
      for (int k = -1; k <= 1; k++) {
        float cy = row + float(k);
        if (cy < 0.0 || cy >= uGrid.y) continue;
        vec4 f = texelFetch(tField, ivec2(int(cx), int(cy)), 0);
        if (f.g < 0.002) continue;
        vec2 center = (vec2(cx, cy) + 0.5) * uPitch + vec2(0.0, (f.a - 0.5) * uPitch.y);
        float alpha = coverage(rel - center, f.r) * f.g;
        if (alpha > ink.a) ink = vec4(mix(uColor, uAccent, f.b) * alpha, alpha);
      }
    }
  }
  fragColor = ink + background * (1.0 - ink.a);
}
`,Pt=({preset:u="silk",pattern:f,wave:l,spacing:x,markSize:s,depth:v,light:q,shine:I,contrast:X,speed:Y,scale:He,direction:qe,color:ce="#ffffff",backgroundColor:ue="#000000",opacity:Xe=1,fade:Ye="edges",fadeSize:Ve=.5,characters:je=Ge,interactive:$e=!0,cursorSize:Ke=50,cursorStrength:Je=.6,intro:Qe=!0,paused:Ze=!1,className:et="",style:tt})=>{const fe=R.useRef(null),ve=R.useRef(null),P=R.useRef(null),at=_e[u]||_e.silk,d=(c,h)=>c??at[h],it=R.useMemo(()=>({color:Be(ce,[1,1,1,1]),background:Be(ue,[0,0,0,1])}),[ce,ue]);return R.useEffect(()=>{var c;ve.current={...it,pattern:d(f,"pattern"),wave:d(l,"wave"),spacing:d(x,"spacing"),markSize:d(s,"markSize"),depth:d(v,"depth"),light:d(q,"light"),shine:d(I,"shine"),contrast:d(X,"contrast"),speed:d(Y,"speed"),scale:d(He,"scale"),direction:d(qe,"direction"),opacity:Xe,fade:Ye,fadeSize:Ve,characters:je,interactive:$e,cursorSize:Ke,cursorStrength:Je,intro:Qe,paused:Ze},(c=P.current)==null||c.call(P)}),R.useEffect(()=>{var ze,Te;const c=fe.current;if(!c)return;const h=new ht({alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1}),i=h.gl;if(!h.isWebgl2){(ze=i.getExtension("WEBGL_lose_context"))==null||ze.loseContext();return}i.clearColor(0,0,0,0);const w=i.canvas;w.style.display="block",w.style.width="100%",w.style.height="100%",w.setAttribute("aria-hidden","true"),c.appendChild(w);const V=new mt(i),j=new De(i),nt=!!i.getExtension("EXT_color_buffer_float"),E=t=>{i.deleteFramebuffer(t.buffer),i.deleteTexture(t.texture.texture)},pe=(t,e)=>new Ne(i,{width:t,height:e,depth:!1,minFilter:i.NEAREST,magFilter:i.NEAREST}),de=(t,e)=>new Ne(i,{width:t,height:e,depth:!1,type:i.HALF_FLOAT,format:i.RGBA,internalFormat:i.RGBA16F,minFilter:i.LINEAR,magFilter:i.LINEAR});let y=pe(1,1),o=null;const $=new De(i,{generateMipmaps:!0,minFilter:i.LINEAR_MIPMAP_LINEAR,magFilter:i.LINEAR,flipY:!1}),n={uSize:{value:[1,1]},uDpr:{value:1},uOrigin:{value:[0,0]},uPitch:{value:[1,1]},uWave:{value:0},uTime:{value:0},uUnit:{value:Ue},uHeading:{value:[1,0]},uAmp:{value:0},uDepth:{value:.5},uLight:{value:[0,0,1]},uShine:{value:.8},uContrast:{value:1},uInk:{value:0},uOpacity:{value:1},uFade:{value:0},uFadeSize:{value:.5},uAppear:{value:0},tRipple:{value:j},uRipple:{value:0}},ot=new oe(i,{geometry:V,program:new re(i,{vertex:se,fragment:Ft,uniforms:n,depthTest:!1,depthWrite:!1})}),S={tState:{value:j},uTexel:{value:[1,1]},uSize:{value:[1,1]},uFrom:{value:[0,0]},uTo:{value:[0,0]},uRadius:{value:40},uImpulse:{value:0},uDamping:{value:.975}},rt=new oe(i,{geometry:V,program:new re(i,{vertex:se,fragment:Mt,uniforms:S,depthTest:!1,depthWrite:!1})}),p={tField:{value:y.texture},tAtlas:{value:$},uOrigin:{value:[0,0]},uPitch:{value:[1,1]},uGrid:{value:[1,1]},uPattern:{value:0},uMarkSize:{value:.9},uStroke:{value:2},uColor:{value:[1,1,1]},uAccent:{value:[1,1,1]},uBackground:{value:[0,0,0,1]},uAtlas:{value:[1,1,0]}},lt=new oe(i,{geometry:V,program:new re(i,{vertex:se,fragment:Et,uniforms:p,depthTest:!1,depthWrite:!1})}),K=((Te=window.matchMedia)==null?void 0:Te.call(window,"(prefers-reduced-motion: reduce)").matches)??!1;let A=1,k=1,L=0,J=performance.now(),he=0,C=0,O=!0,Q=!0,D=!0,me=0,z=!1,N=0,ge="";const a={x:0,y:0,inside:!1,placed:!1,lastX:0,lastY:0,burst:0},st=()=>{if(!nt)return;const t=r(Math.ceil(A/We),4,512),e=r(Math.ceil(k/We),4,512);o&&o.width===t&&o.height===e||(o&&(E(o.read),E(o.write)),o={width:t,height:e,read:de(t,e),write:de(t,e)},z=!1)},ct=()=>{o&&([o.read,o.write].forEach(t=>{h.bindFramebuffer(t),i.viewport(0,0,t.width,t.height),i.clear(i.COLOR_BUFFER_BIT)}),h.bindFramebuffer())},ut=t=>{if(t.characters===ge)return;ge=t.characters;const e=bt(t.characters);e&&($.image=e.canvas,p.uAtlas.value=[e.columns,e.lines,e.count])},xe=()=>{A=Math.max(1,c.clientWidth),k=Math.max(1,c.clientHeight),h.dpr=Math.min(window.devicePixelRatio||1,2,Math.sqrt(kt/(A*k))),h.setSize(A,k),st(),D=!0,b()},ft=(t,e,m)=>{N=Math.min(N+m*St,4);const g=r(e.cursorStrength,0,1),Z=Math.hypot(a.x-a.lastX,a.y-a.lastY);let T=(a.inside?Math.min(Z/14,1)*.35*g:0)+a.burst*g;for(a.burst=0,S.uTexel.value=[1/t.width,1/t.height],S.uSize.value=[A,k],S.uFrom.value=[a.lastX,k-a.lastY],S.uTo.value=[a.x,k-a.y],S.uRadius.value=r(e.cursorSize,8,400);N>=1;){N-=1,S.tState.value=t.read.texture,S.uImpulse.value=T,h.render({scene:rt,target:t.write,clear:!1});const ee=t.read;t.read=t.write,t.write=ee,T=0}a.lastX=a.x,a.lastY=a.y},we=t=>{if(L=0,!Q)return;const e=ve.current,m=Math.min(.05,Math.max(1/240,(t-J)/1e3));if(J=t,!e)return;const g=!e.paused&&!K&&e.speed!==0;g&&(he+=m*e.speed),C=e.intro&&!K?Math.min(1,C+m/At):1;const Z=1-Math.pow(1-r(C/.75,0,1),3),T=r((C-.1)/.9,0,1),ee=T*T*(3-2*T),te=e.interactive&&!K&&!!o&&e.cursorStrength>0;te&&a.inside&&!a.placed&&(a.lastX=a.x,a.lastY=a.y,a.placed=!0),te&&(a.inside||a.burst>0)&&(me=t+5e3);const Re=te&&t<me;Re&&o?(ft(o,e,m),z=!0):z&&(ct(),z=!1);const U=gt[e.pattern]??0;U===4&&ut(e);const ae=i.canvas.width,Pe=i.canvas.height,W=ae/A,F=Math.max(4,Math.round(r(e.spacing,4,120)*W)),B=U===3?Math.max(2,Math.round(F/4)):F,G=Math.min(4096,Math.ceil(ae/B)+1),H=Math.min(4096,Math.ceil(Pe/F)+2),Le=[Math.floor((ae-G*B)/2),Math.floor((Pe-H*F)/2)];(y.width!==G||y.height!==H)&&(E(y),y=pe(G,H),p.tField.value=y.texture);const Ce=e.direction*Math.PI/180,Ie=(e.direction+180+r(e.light,-90,90))*Math.PI/180,ie=e.background,ne=ie[3]>.02?le(e.color)<le(ie):le(e.color)<.5;n.uSize.value=[A,k],n.uDpr.value=W,n.uOrigin.value=Le,n.uPitch.value=[B,F],n.uWave.value=xt[e.wave]??0,n.uTime.value=he,n.uUnit.value=Ue*r(e.scale,.2,5),n.uHeading.value=[Math.cos(Ce),Math.sin(Ce)],n.uAmp.value=ee,n.uDepth.value=r(e.depth,0,1.5),n.uLight.value=[Math.cos(Ie)*.78,Math.sin(Ie)*.78,.62],n.uShine.value=r(e.shine,0,2),n.uContrast.value=r(e.contrast,.3,3),n.uInk.value=ne?1:0,n.uOpacity.value=r(e.opacity,0,1),n.uFade.value=wt[e.fade]??0,n.uFadeSize.value=r(e.fadeSize,.05,1),n.uAppear.value=Z,n.tRipple.value=o&&z?o.read.texture:j,n.uRipple.value=z?.32:0,h.render({scene:ot,target:y}),p.uOrigin.value=Le,p.uPitch.value=[B,F],p.uGrid.value=[G,H],p.uPattern.value=U,p.uMarkSize.value=r(e.markSize,.05,1),p.uStroke.value=U===3?.9*W:Math.max(1.1*W,F*.08);const vt=ne?0:1,pt=ne?.35:.55;p.uColor.value=e.color.slice(0,3),p.uAccent.value=e.color.slice(0,3).map(Oe=>Oe+(vt-Oe)*pt),p.uBackground.value=ie,h.render({scene:lt}),D=!1,O&&(g||C<1||Re||D)&&(L=requestAnimationFrame(we))},b=()=>{L||!O||!Q||(J=performance.now(),L=requestAnimationFrame(we))},ye=t=>{const e=c.getBoundingClientRect(),m=t.clientX-e.left,g=t.clientY-e.top;return{x:m,y:g,inside:m>=0&&g>=0&&m<=e.width&&g<=e.height}},Se=t=>{const e=ye(t);a.x=e.x,a.y=e.y,e.inside!==a.inside&&(a.placed=!1),a.inside=e.inside,e.inside&&b()},ke=t=>{const e=ye(t);e.inside&&(a.x=e.x,a.y=e.y,a.inside||(a.lastX=e.x,a.lastY=e.y),a.burst=1.2,b())},_=()=>{a.inside=!1,a.placed=!1,b()},Ae=t=>{t.relatedTarget||_()},be=t=>{t.pointerType==="touch"&&_()},Fe=()=>{document.hidden||b()};window.addEventListener("pointermove",Se,{passive:!0}),window.addEventListener("pointerdown",ke,{passive:!0}),window.addEventListener("pointerout",Ae,{passive:!0}),window.addEventListener("pointerup",be,{passive:!0}),window.addEventListener("blur",_),document.addEventListener("visibilitychange",Fe);const Me=new ResizeObserver(xe);Me.observe(c);const Ee=new IntersectionObserver(([t])=>{O=t.isIntersecting,b()});return Ee.observe(c),P.current=()=>{D=!0,b()},xe(),()=>{var t;Q=!1,O=!1,cancelAnimationFrame(L),Me.disconnect(),Ee.disconnect(),window.removeEventListener("pointermove",Se),window.removeEventListener("pointerdown",ke),window.removeEventListener("pointerout",Ae),window.removeEventListener("pointerup",be),window.removeEventListener("blur",_),document.removeEventListener("visibilitychange",Fe),P.current=null,o&&(E(o.read),E(o.write)),E(y),i.deleteTexture($.texture),(t=i.getExtension("WEBGL_lose_context"))==null||t.loseContext(),w.parentNode&&w.parentNode.removeChild(w)}},[]),dt.jsx("div",{ref:fe,className:`pattern-waves ${et}`.trim(),style:tt})};export{Pt as default};
