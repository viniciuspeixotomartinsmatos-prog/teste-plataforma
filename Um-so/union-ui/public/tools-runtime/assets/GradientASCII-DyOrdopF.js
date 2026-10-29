import{a as G,j as Me}from"./index-DrbxZl7q.js";const Ce=8,ae=4,ie=24,Ue=1.2,Le=.7,De=.015,ot=2.4,Y=60,z=100,rt=16,at=.78,Ie=["#1e3fd8","#f6f8ff","#a5d8ff","#38bdf8"],Ge=" =+xX0S8#@",Pe='"Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',it={horizon:0,pinch:1,rise:2,eclipse:3},nt={none:0,wave:1,burst:2},ct=`#version 300 es
out vec2 vUv;
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  vUv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`,ke=`
float hash12(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}
`,ut=`#version 300 es
precision highp float;
precision highp int;
uniform float uAspect;
uniform float uTime;
uniform int uShape;
uniform vec3 uRamp[8];
uniform int uCount;
uniform float uScale;
uniform float uSoftness;
uniform float uFlow;
uniform vec2 uSeed;
uniform vec4 uTrail[24];
uniform float uRadius;
uniform vec4 uClicks[4];
uniform int uClickEffect;
uniform float uIntro;
uniform float uFrame;
in vec2 vUv;
layout(location = 0) out vec4 outColor;
layout(location = 1) out vec4 outAux;
${ke}
vec2 hash22(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.103, 0.0973));
  q += dot(q, q.yzx + 33.33);
  return fract((q.xx + q.yz) * q.zy) * 2.0 - 1.0;
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = dot(hash22(i), f);
  float b = dot(hash22(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
  float c = dot(hash22(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
  float d = dot(hash22(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));
  return 0.5 + 0.5 * mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

vec3 labToRgb(vec3 lab) {
  float l = lab.x + 0.3963377774 * lab.y + 0.2158037573 * lab.z;
  float m = lab.x - 0.1055613458 * lab.y - 0.0638541728 * lab.z;
  float s = lab.x - 0.0894841775 * lab.y - 1.2914855480 * lab.z;
  l = l * l * l;
  m = m * m * m;
  s = s * s * s;
  return vec3(
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
  );
}

vec3 encode(vec3 c) {
  c = clamp(c, 0.0, 1.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

vec3 horizon(vec2 p, float time, out float order) {
  float span = 0.5 * max(uAspect, 1.0);
  float x = p.x / span;
  float arch = -0.17 - 0.2 * x * x + 0.02 * sin(time * 0.6);
  float soft = mix(0.05, 0.22, uSoftness);
  float edge = p.y - arch;
  float rim = 0.38 * smoothstep(-soft, 0.42, edge);
  vec2 sun = vec2(0.08 * sin(time * 0.31) * span, 0.58);
  float spread = length((p - sun) / vec2(0.95 * span, 0.75));
  float sky = mix(0.55, 1.0, smoothstep(0.2, 0.95, spread));
  order = clamp(edge * 1.3, 0.0, 1.0);
  return vec3(rim, sky, smoothstep(0.18, 0.62, edge));
}

vec3 pinch(vec2 p, float time, out float order) {
  float span = 0.5 * max(uAspect, 0.75);
  float x = p.x / span;
  float sway = 0.02 * sin(x * 1.7 + time * 0.55);
  float breathe = 1.0 + 0.06 * sin(time * 0.8);
  float width = (0.13 + 0.22 * x * x) * breathe * mix(0.85, 1.2, uSoftness);
  float y = abs(p.y - sway) / width;
  float t = exp(-pow(y, 2.2)) * (0.42 + 0.58 * exp(-x * x * 1.8));
  order = clamp(abs(p.y - sway) * 2.4 + abs(x) * 0.3, 0.0, 1.0);
  return vec3(t, t, 0.0);
}

vec3 rise(vec2 p, float time, out float order) {
  float wide = max(uAspect, 0.9);
  vec2 center = vec2(0.05 * sin(time * 0.45) * wide, -0.7);
  vec2 radius = vec2(0.82 * wide, 0.64 * (1.0 + 0.04 * sin(time * 0.8)));
  float d = length((p - center) / radius);
  float soft = mix(0.6, 1.15, uSoftness);
  float t = clamp(pow(clamp(1.0 - d, 0.0, 1.0), soft) * 1.35, 0.0, 1.0);
  order = clamp((d - 0.2) * 1.3, 0.0, 1.0);
  return vec3(t, t, 0.0);
}

vec3 eclipse(vec2 p, float time, out float order) {
  float fit = min(1.0, uAspect * 1.25);
  float r = 0.23 * fit * (1.0 + 0.015 * sin(time * 0.9));
  float angle = atan(p.y, p.x);
  float rays = noise(vec2(cos(angle), sin(angle)) * 2.2 + time * 0.08) * 0.8 + 0.6;
  float d = length(p) - r;
  float reach = mix(0.07, 0.15, uSoftness) * rays * fit;
  float t = smoothstep(-0.006, 0.006 + 0.02 * uSoftness, d) * exp(-max(d, 0.0) / reach);
  order = clamp(d * 2.0, 0.0, 1.0);
  return vec3(t, t, 0.0);
}

vec4 tone(float t) {
  float x = smoothstep(0.3, 1.0, t) * float(uCount - 1);
  int index = int(floor(x));
  return vec4(mix(uRamp[index], uRamp[min(index + 1, uCount - 1)], fract(x)), smoothstep(0.0, 0.38, t));
}

void main() {
  vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
  float time = uTime;
  vec2 q = p / uScale;
  vec2 warp = vec2(
    noise(q * 1.6 + uSeed + vec2(0.0, time * 0.3)),
    noise(q * 1.6 + uSeed.yx + vec2(4.3, -time * 0.24))
  ) - 0.5;
  q += warp * uFlow * (uShape == 3 ? 0.04 : 0.18);
  float order = 0.0;
  vec3 shape;
  if (uShape == 0) shape = horizon(q, time, order);
  else if (uShape == 1) shape = pinch(q, time, order);
  else if (uShape == 2) shape = rise(q, time, order);
  else shape = eclipse(q, time, order);

  float reveal = clamp((uIntro * 1.45 - order) / 0.45, 0.0, 1.0);
  reveal = reveal * reveal * (3.0 - 2.0 * reveal);

  float scramble = 0.0;
  for (int i = 0; i < 24; i++) {
    vec4 point = uTrail[i];
    if (point.z <= 0.0) continue;
    vec2 d = p - point.xy;
    scramble = max(scramble, point.z * exp(-dot(d, d) / (uRadius * uRadius)));
  }
  for (int i = 0; i < 4; i++) {
    vec4 c = uClicks[i];
    if (c.w <= 0.0) continue;
    float d = length(p - c.xy);
    if (uClickEffect == 1) {
      scramble = max(scramble, exp(-pow((d - c.z * 0.75) / 0.06, 2.0)) * c.w);
    } else if (uClickEffect == 2) {
      float size = 0.08 + 0.22 * (1.0 - exp(-c.z * 5.0));
      scramble = max(scramble, (1.0 - smoothstep(size * 0.6, size, d)) * c.w);
    }
  }
  vec2 t = clamp(shape.xy * mix(0.7, 1.0, reveal), 0.0, 1.0);
  vec4 mixed = mix(tone(t.x), tone(t.y), shape.z);
  vec3 color = encode(labToRgb(mixed.rgb));
  float alpha = mixed.a * reveal;
  float dither = (hash12(gl_FragCoord.xy + uFrame * 13.7) - 0.5) / 255.0;
  outColor = clamp(vec4(color * alpha + dither, alpha + dither), 0.0, 1.0);
  outAux = vec4(reveal, scramble, 0.0, 1.0);
}`,Ne=`
uniform sampler2D uField;
uniform sampler2D uAux;
uniform sampler2D uAtlas;
uniform vec2 uResolution;
uniform vec2 uCell;
uniform vec2 uOffset;
uniform vec2 uAtlasGrid;
uniform float uCount;
uniform float uDensity;
uniform float uOpacity;
uniform float uFlicker;
uniform float uDepth;
uniform float uGlyphTime;
uniform float uSeedValue;
uniform float uLight;
${ke}
float sampleGlyph(float index, vec2 local, vec2 coord, float soft) {
  float column = mod(index, uAtlasGrid.x);
  float row = floor(index / uAtlasGrid.x);
  vec2 atlasUv = vec2((column + local.x) / uAtlasGrid.x, (row + 1.0 - local.y) / uAtlasGrid.y);
  vec2 continuous = coord / uAtlasGrid;
  float scale = exp2(soft);
  return textureGrad(uAtlas, atlasUv, dFdx(continuous) * scale, dFdy(continuous) * scale).a;
}

vec4 glyphAt(vec2 px) {
  vec2 coord = (px - uOffset) / uCell;
  vec2 cell = floor(coord);
  vec2 local = coord - cell;
  vec2 uv = clamp(((cell + 0.5) * uCell + uOffset) / uResolution, vec2(0.0), vec2(1.0));
  vec4 field = texture(uField, uv);
  vec4 aux = texture(uAux, uv);
  vec3 visible = uLight > 0.5 ? field.rgb + (1.0 - field.a) : field.rgb;
  float luma = dot(visible, vec3(0.2126, 0.7152, 0.0722));
  float value = uLight > 0.5 ? clamp((1.0 - luma) * 1.5, 0.0, 1.0) : luma;
  float pick = hash12(cell + uSeedValue * 7.31);
  float level = hash12(cell * 1.73 + 4.1 + uSeedValue);
  float tick = floor(uGlyphTime * 9.0 + level * 9.0);
  float wobble = (hash12(cell * 2.31 + tick * 17.7) - 0.5) * uFlicker * 0.4 + (level - 0.5) * 0.1;
  float tone = clamp(pow(value, 0.75) + wobble, 0.0, 1.0);
  float index = floor(tone * (uCount - 1.0) + 0.5);
  float decode = max(aux.g, 1.0 - aux.r);
  if (decode > 0.02) {
    float frame = floor(uGlyphTime * 20.0);
    if (hash12(cell * 3.7 + frame * 5.3) < decode * 1.25) index = 1.0 + floor(hash12(cell + frame * 1.37) * (uCount - 1.0));
  }
  float present = step(pick, uDensity * mix(1.0, 0.3 + tone * 1.1, 0.55));
  float cutoff = smoothstep(0.03, 0.1, value);
  float focus = step(hash12(cell * 0.71 + 9.2 + uSeedValue), uDepth);
  float coverage = sampleGlyph(index, local, coord, focus * 1.2);
  float alpha = uOpacity * present * cutoff * coverage * mix(1.0, 0.35 + 0.65 * level, 0.55) * (1.0 - focus * 0.5);
  if (uLight < 0.5) {
    vec3 light = field.rgb * 0.55 + vec3(0.03) * field.a;
    return vec4(light * alpha, 0.6 * field.a * alpha);
  }
  vec3 ink = visible * 0.8;
  return vec4(ink * alpha, alpha);
}
`,st=`#version 300 es
precision highp float;
uniform float uDownscale;
in vec2 vUv;
out vec4 outColor;
${Ne}
void main() {
  outColor = glyphAt(gl_FragCoord.xy * uDownscale);
}`,lt=`#version 300 es
precision highp float;
uniform sampler2D uSource;
uniform vec2 uStep;
in vec2 vUv;
out vec4 outColor;
void main() {
  vec4 sum = texture(uSource, vUv) * 0.2270270270;
  sum += texture(uSource, vUv + uStep * 1.3846153846) * 0.3162162162;
  sum += texture(uSource, vUv - uStep * 1.3846153846) * 0.3162162162;
  sum += texture(uSource, vUv + uStep * 3.2307692308) * 0.0702702703;
  sum += texture(uSource, vUv - uStep * 3.2307692308) * 0.0702702703;
  outColor = sum;
}`,ft=`#version 300 es
precision highp float;
uniform sampler2D uHalo;
uniform float uGlow;
uniform float uGradient;
uniform float uGrain;
uniform float uFrame;
in vec2 vUv;
out vec4 outColor;
${Ne}
void main() {
  vec4 base = texture(uField, vUv) * uGradient;
  vec4 glyph = glyphAt(gl_FragCoord.xy);
  vec4 halo = texture(uHalo, vUv) * uGlow;
  vec4 color;
  if (uLight < 0.5) {
    color = base + glyph + halo;
  } else {
    color = glyph + base * (1.0 - glyph.a);
    color += halo * 0.6 * (1.0 - color.a);
  }
  float grain = (hash12(gl_FragCoord.xy + uFrame * vec2(17.0, 59.0)) + hash12(gl_FragCoord.xy * 1.31 + uFrame * 7.0) - 1.0) * uGrain;
  float body = clamp(color.a, 0.0, 1.0);
  color.rgb += grain * (0.25 + body) * 0.5;
  color.a = clamp(color.a, 0.0, 1.0);
  color.rgb = clamp(color.rgb, 0.0, color.a);
  outColor = color;
}`,x=(t,s,l)=>Math.min(l,Math.max(s,t)),ne=t=>t<=.04045?t/12.92:((t+.055)/1.055)**2.4,mt=([t,s,l])=>{const n=ne(t),u=ne(s),m=ne(l),y=Math.cbrt(.4122214708*n+.5363325363*u+.0514459929*m),h=Math.cbrt(.2119034982*n+.6806995451*u+.1073969566*m),d=Math.cbrt(.0883024619*n+.2817188376*u+.6299787005*m);return[.2104542553*y+.793617785*h-.0040720468*d,1.9779984951*y-2.428592205*h+.4505937099*d,.0259040371*y+.7827717662*h-.808675766*d]},Oe=(t,s,l)=>{const n=t.createShader(s);return n?(t.shaderSource(n,l),t.compileShader(n),t.getShaderParameter(n,t.COMPILE_STATUS)?n:(t.deleteShader(n),null)):null},j=(t,s)=>{const l=Oe(t,t.VERTEX_SHADER,ct),n=Oe(t,t.FRAGMENT_SHADER,s),u=t.createProgram();if(!l||!n||!u)return null;if(t.attachShader(u,l),t.attachShader(u,n),t.linkProgram(u),t.deleteShader(l),t.deleteShader(n),!t.getProgramParameter(u,t.LINK_STATUS))return t.deleteProgram(u),null;const m={},y=t.getProgramParameter(u,t.ACTIVE_UNIFORMS);for(let h=0;h<y;h++){const d=t.getActiveUniform(u,h);if(!d)continue;const _=d.name.replace(/\[0\]$/,"");m[_]=t.getUniformLocation(u,_)}return{program:u,uniforms:m}},ce=(t,s)=>({textures:Array.from({length:s},()=>{const n=t.createTexture();return t.bindTexture(t.TEXTURE_2D,n),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),n}),framebuffer:t.createFramebuffer(),width:0,height:0}),ue=(t,s,l,n)=>{s.width===l&&s.height===n||(s.width=l,s.height=n,t.bindFramebuffer(t.FRAMEBUFFER,s.framebuffer),s.textures.forEach((u,m)=>{t.bindTexture(t.TEXTURE_2D,u),t.texImage2D(t.TEXTURE_2D,0,t.RGBA8,l,n,0,t.RGBA,t.UNSIGNED_BYTE,null),t.framebufferTexture2D(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0+m,t.TEXTURE_2D,u,0)}),t.bindFramebuffer(t.FRAMEBUFFER,null))},Xe=(t,s,l)=>{const n=[...new Set([...s].filter(C=>C!==`
`&&C!=="\r"))];n.length||n.push(" ");const u=`300 ${Math.round(z*at)}px ${l}`,m=Math.min(rt,n.length),y=Math.ceil(n.length/m),h=document.createElement("canvas");h.width=Y*m,h.height=z*y;const d=h.getContext("2d");d&&(d.font=u,d.textAlign="center",d.textBaseline="middle",d.fillStyle="#fff",n.forEach((C,q)=>{const J=q%m,Q=Math.floor(q/m);d.fillText(C,J*Y+Y/2,Q*z+z/2+3)}));const _=t.createTexture();return t.bindTexture(t.TEXTURE_2D,_),t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),t.texImage2D(t.TEXTURE_2D,0,t.RGBA8,t.RGBA,t.UNSIGNED_BYTE,h),t.generateMipmap(t.TEXTURE_2D),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR_MIPMAP_LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),{texture:_,count:n.length,grid:[m,y]}},ht=({colors:t=Ie,shape:s="horizon",characters:l=Ge,cellSize:n=18,density:u=.8,glyphOpacity:m=.85,glow:y=.2,depthOfField:h=0,flicker:d=.2,softness:_=.5,scale:C=1,flow:q=.5,speed:J=1,gradientOpacity:Q=.9,grain:ze=.08,variation:qe=0,mouseInteraction:Be=!0,scrambleRadius:He=.1,clickEffect:Ve="wave",intro:$e=!0,lightMode:We=!1,fontFamily:Ke=Pe,dpr:je,className:se="",style:Ye,...Je})=>{const le=G.useRef(null),fe=G.useRef(null),P=G.useRef(null),B=(Array.isArray(t)&&t.length?t:Ie).slice(0,Ce),me={colors:B.length>1?B:[B[0],B[0]],shape:it[s]??0,characters:l||Ge,cellSize:x(n,6,64),density:x(u,0,1),glyphOpacity:x(m,0,1),glow:x(y,0,2),depthOfField:x(h,0,1),flicker:x(d,0,1),softness:x(_,0,1),scale:x(C,.4,2.5),flow:x(q,0,2),speed:Math.max(0,J),gradientOpacity:x(Q,0,1),grain:x(ze,0,.4),variation:Math.max(0,qe),mouseInteraction:Be,scrambleRadius:x(He,.02,.4),clickEffect:nt[Ve]??1,intro:$e,lightMode:We,fontFamily:Ke||Pe,dpr:je},R=G.useRef(me);return R.current=me,G.useEffect(()=>{var ge;const S=le.current,f=fe.current,e=f==null?void 0:f.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!S||!f||!e)return;const H=j(e,ut),O=j(e,st),U=j(e,lt),X=j(e,ft);if(!H||!O||!U||!X)return;const de=e.createVertexArray(),g=ce(e,2),T=ce(e,1),V=ce(e,1),L=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),he=new Map,Qe=a=>{const r=String(a),o=he.get(r);if(o)return o;let i=[0,0,0];if(L){L.clearRect(0,0,1,1),L.fillStyle="#000000",L.fillStyle=r,L.fillRect(0,0,1,1);const[c,w,F]=L.getImageData(0,0,1,1).data;i=[c/255,w/255,F/255]}return he.set(r,i),i},M=((ge=window.matchMedia)==null?void 0:ge.call(window,"(prefers-reduced-motion: reduce)").matches)??!1,A={width:1,height:1,ratio:1},pe=new Float32Array(Ce*3),Z=new Float32Array(ae*4),b=[],ee=new Float32Array(ie*4),E=[],v={x:0,y:0,inside:!1};let p=null,te="",ve="",xe=0,Ee=0,k=R.current.intro&&!M?0:1,$=0,oe=0,N=0,D=0,W=!0,K=!1;const Ze=()=>{var o,i;const a=R.current,r=`${a.fontFamily}|${a.characters}`;r===te&&p||(te=r,p&&e.deleteTexture(p.texture),p=Xe(e,a.characters,a.fontFamily),(i=(o=document.fonts)==null?void 0:o.load)==null||i.call(o,`300 64px ${a.fontFamily}`,a.characters).then(()=>{K||te!==r||(p&&e.deleteTexture(p.texture),p=Xe(e,a.characters,a.fontFamily),re())},()=>{}))},et=()=>{const a=R.current,r=a.colors.join(",");r!==ve&&(ve=r,a.colors.forEach((o,i)=>pe.set(mt(Qe(o)),i*3)))},Te=(a,r,o)=>{if(!p)return;const i=R.current,c=a.uniforms,w=i.cellSize*A.ratio,F=w*(Y/z);e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,g.textures[0]),e.uniform1i(c.uField,0),e.activeTexture(e.TEXTURE1),e.bindTexture(e.TEXTURE_2D,g.textures[1]),e.uniform1i(c.uAux,1),e.activeTexture(e.TEXTURE2),e.bindTexture(e.TEXTURE_2D,p.texture),e.uniform1i(c.uAtlas,2),e.uniform2f(c.uResolution,r,o),e.uniform2f(c.uCell,F,w),e.uniform2f(c.uOffset,(r-Math.ceil(r/F)*F)/2,(o-Math.ceil(o/w)*w)/2),e.uniform2f(c.uAtlasGrid,p.grid[0],p.grid[1]),e.uniform1f(c.uCount,p.count),e.uniform1f(c.uDensity,i.density),e.uniform1f(c.uOpacity,i.glyphOpacity),e.uniform1f(c.uFlicker,M?0:i.flicker),e.uniform1f(c.uDepth,i.depthOfField),e.uniform1f(c.uGlyphTime,Ee),e.uniform1f(c.uSeedValue,i.variation),e.uniform1f(c.uLight,i.lightMode?1:0)},re=()=>{const a=R.current,r=A.width/A.height;Ze(),et(),e.bindVertexArray(de),e.disable(e.BLEND),e.bindFramebuffer(e.FRAMEBUFFER,g.framebuffer),e.drawBuffers([e.COLOR_ATTACHMENT0,e.COLOR_ATTACHMENT1]),e.viewport(0,0,g.width,g.height),e.useProgram(H.program);const o=H.uniforms;e.uniform1f(o.uAspect,r),e.uniform1f(o.uTime,xe),e.uniform1i(o.uShape,a.shape),e.uniform3fv(o.uRamp,pe),e.uniform1i(o.uCount,a.colors.length),e.uniform1f(o.uScale,a.scale),e.uniform1f(o.uSoftness,a.softness),e.uniform1f(o.uFlow,a.flow),e.uniform2f(o.uSeed,a.variation*3.17,a.variation*1.91),e.uniform4fv(o.uTrail,ee),e.uniform1f(o.uRadius,a.scrambleRadius),e.uniform4fv(o.uClicks,Z),e.uniform1i(o.uClickEffect,a.clickEffect),e.uniform1f(o.uIntro,k),e.uniform1f(o.uFrame,$),e.drawArrays(e.TRIANGLES,0,3);const i=a.glow>.001;i&&(e.bindFramebuffer(e.FRAMEBUFFER,T.framebuffer),e.drawBuffers([e.COLOR_ATTACHMENT0]),e.viewport(0,0,T.width,T.height),e.useProgram(O.program),Te(O,f.width,f.height),e.uniform1f(O.uniforms.uDownscale,f.width/T.width),e.drawArrays(e.TRIANGLES,0,3),e.useProgram(U.program),e.activeTexture(e.TEXTURE0),e.uniform1i(U.uniforms.uSource,0),e.bindFramebuffer(e.FRAMEBUFFER,V.framebuffer),e.bindTexture(e.TEXTURE_2D,T.textures[0]),e.uniform2f(U.uniforms.uStep,1/T.width,0),e.drawArrays(e.TRIANGLES,0,3),e.bindFramebuffer(e.FRAMEBUFFER,T.framebuffer),e.bindTexture(e.TEXTURE_2D,V.textures[0]),e.uniform2f(U.uniforms.uStep,0,1/T.height),e.drawArrays(e.TRIANGLES,0,3)),e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,f.width,f.height),e.useProgram(X.program),Te(X,f.width,f.height);const c=X.uniforms;e.activeTexture(e.TEXTURE3),e.bindTexture(e.TEXTURE_2D,T.textures[0]),e.uniform1i(c.uHalo,3),e.uniform1f(c.uGlow,i?a.glow:0),e.uniform1f(c.uGradient,a.gradientOpacity),e.uniform1f(c.uGrain,a.grain),e.uniform1f(c.uFrame,$),e.drawArrays(e.TRIANGLES,0,3)},ye=()=>{const a=R.current;A.width=Math.max(1,S.clientWidth),A.height=Math.max(1,S.clientHeight),A.ratio=Math.min(a.dpr||window.devicePixelRatio||1,2),f.width=Math.max(1,Math.round(A.width*A.ratio)),f.height=Math.max(1,Math.round(A.height*A.ratio)),ue(e,g,Math.max(1,Math.round(f.width/2)),Math.max(1,Math.round(f.height/2)));const r=Math.max(1,Math.round(f.width/4)),o=Math.max(1,Math.round(f.height/4));ue(e,T,r,o),ue(e,V,r,o),re(),I()},tt=a=>{for(E.forEach(r=>{r.age+=a});E.length&&E[E.length-1].age>Le;)E.pop();for(let r=0;r<ie;r++){const o=E[r];if(!o){ee[r*4+2]=0;continue}const i=1-o.age/Le;ee.set([o.x,o.y,i*i,0],r*4)}for(b.forEach(r=>{r.age+=a});b.length&&b[b.length-1].age>Ue;)b.pop();for(let r=0;r<ae;r++){const o=b[r];if(!o){Z[r*4+3]=0;continue}const i=o.age/Ue,c=Math.min(1,o.age/.08)*(1-i)*(1-i);Z.set([o.x,o.y,o.age,c],r*4)}},Re=a=>{if(N=0,K||!W||document.hidden)return;const r=R.current,o=D?x((a-D)/1e3,.001,.05):1/60;D=a,M||(xe+=o*r.speed*.5,Ee+=o*Math.max(r.speed,.15)),k<1&&(k=Math.min(1,k+o/ot)),oe+=o,!M&&oe>1/24&&(oe=0,$=($+1)%97),tt(o),re(),!M||k<1||b.length>0||E.length>0?N=requestAnimationFrame(Re):D=0};function I(){!N&&!K&&W&&!document.hidden&&(N=requestAnimationFrame(Re))}const Ae=a=>{const r=S.getBoundingClientRect(),o=(a.clientX-r.left)/Math.max(1,r.width),i=1-(a.clientY-r.top)/Math.max(1,r.height),c=r.width/Math.max(1,r.height);v.inside=o>=0&&o<=1&&i>=0&&i<=1,v.x=(o-.5)*c,v.y=i-.5},be=a=>{Ae(a);const r=R.current;if(!v.inside||!r.mouseInteraction||M)return;const o=E[0],i=o?Math.hypot(v.x-o.x,v.y-o.y):1/0;if(!(i<De)){if(o&&o.age<.1){const c=Math.min(6,Math.floor(i/(De*2)));for(let w=1;w<=c;w++){const F=w/(c+1);E.unshift({x:o.x+(v.x-o.x)*F,y:o.y+(v.y-o.y)*F,age:0})}}E.unshift({x:v.x,y:v.y,age:0}),E.length=Math.min(E.length,ie),I()}},we=a=>{Ae(a);const r=R.current;!v.inside||!r.clickEffect||M||(b.unshift({x:v.x,y:v.y,age:0}),b.length>ae&&b.pop(),I())},Se=()=>{D=0,I()},Fe=new ResizeObserver(ye);Fe.observe(S);const _e=new IntersectionObserver(a=>{W=a.some(r=>r.isIntersecting),W&&(D=0,I())});return _e.observe(S),window.addEventListener("pointermove",be,{passive:!0}),window.addEventListener("pointerdown",we,{passive:!0}),document.addEventListener("visibilitychange",Se),ye(),P.current=I,()=>{var a;K=!0,cancelAnimationFrame(N),P.current=null,Fe.disconnect(),_e.disconnect(),window.removeEventListener("pointermove",be),window.removeEventListener("pointerdown",we),document.removeEventListener("visibilitychange",Se),[g,T,V].forEach(r=>{r.textures.forEach(o=>e.deleteTexture(o)),e.deleteFramebuffer(r.framebuffer)}),p&&e.deleteTexture(p.texture),e.deleteVertexArray(de),[H,O,U,X].forEach(r=>e.deleteProgram(r.program)),(a=e.getExtension("WEBGL_lose_context"))==null||a.loseContext()}},[]),G.useEffect(()=>{var S;(S=P.current)==null||S.call(P)}),Me.jsx("div",{ref:le,className:`gradient-ascii-container${se?` ${se}`:""}`,style:Ye,...Je,children:Me.jsx("canvas",{ref:fe,className:"gradient-ascii-canvas","aria-hidden":"true"})})};export{ht as default};
