import{a as lo,j as V}from"./index-DrbxZl7q.js";import{u as ro,I as io,c as no}from"./studio-BPa5ocsp.js";const Gt='"Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',le=60,te=100,uo=.94,so=16,co=["-","/","|","\\"];let ze=typeof document>"u";const $e=()=>{var e;return ze||!((e=document.fonts)!=null&&e.load)?Promise.resolve(!0):document.fonts.load(`700 64px ${Gt}`).then(()=>(ze=!0,!0)).catch(()=>(ze=!0,!1))},fo=(e,o)=>{e.clearRect(0,0,le,te),e.fillText(o,le/2,te/2+3);const t=e.getImageData(0,0,le,te).data;let a=0;for(let l=3;l<t.length;l+=4)a+=t[l];return a/(255*le*te)};function Ve(e,o,t=700){const a=[...new Set([...o].filter(g=>g!==`
`))];a.length||a.push(" ");const l=`${t} ${Math.round(te*uo)}px ${Gt}`,r=document.createElement("canvas");r.width=le,r.height=te;const i=r.getContext("2d",{willReadFrequently:!0});i.font=l,i.textAlign="center",i.textBaseline="middle",i.fillStyle="#fff";const u=a.map(g=>({char:g,coverage:fo(i,g)})).sort((g,x)=>g.coverage-x.coverage).map(g=>g.char),c=[...u,...co],s=Math.min(so,c.length),p=Math.ceil(c.length/s),f=document.createElement("canvas");f.width=le*s,f.height=te*p;const m=f.getContext("2d");m.font=l,m.textAlign="center",m.textBaseline="middle",m.fillStyle="#fff",c.forEach((g,x)=>{const k=x%s,h=Math.floor(x/s);m.fillText(g,k*le+le/2,h*te+te/2+3)});const d=e.gl,v=d.createTexture();return d.bindTexture(d.TEXTURE_2D,v),d.pixelStorei(d.UNPACK_FLIP_Y_WEBGL,!0),d.texImage2D(d.TEXTURE_2D,0,d.RGBA8,d.RGBA,d.UNSIGNED_BYTE,f),d.pixelStorei(d.UNPACK_FLIP_Y_WEBGL,!1),d.generateMipmap(d.TEXTURE_2D),d.texParameteri(d.TEXTURE_2D,d.TEXTURE_MIN_FILTER,d.LINEAR_MIPMAP_LINEAR),d.texParameteri(d.TEXTURE_2D,d.TEXTURE_MAG_FILTER,d.LINEAR),d.texParameteri(d.TEXTURE_2D,d.TEXTURE_WRAP_S,d.CLAMP_TO_EDGE),d.texParameteri(d.TEXTURE_2D,d.TEXTURE_WRAP_T,d.CLAMP_TO_EDGE),{texture:v,chars:u,count:u.length,total:c.length,grid:[s,p],aspect:le/te,fontReady:ze}}const Te=64;let Pe=null;function mo(e){const o=e*e,t=1.9,a=7,l=[];for(let h=-a;h<=a;h+=1)for(let b=-a;b<=a;b+=1)l.push([b,h,Math.exp(-(b*b+h*h)/(2*t*t))]);const r=new Float32Array(o),i=new Uint8Array(o),n=(h,b)=>{const y=h%e,S=h/e|0;for(const[I,L,M]of l){const A=(y+I+e)%e,z=(S+L+e)%e;r[z*e+A]+=b*M}};let u=7;const c=()=>(u=u*16807%2147483647,u/2147483647),s=Math.round(o*.1);let p=0;for(;p<s;){const h=Math.floor(c()*o);i[h]||(i[h]=1,n(h,1),p+=1)}const f=()=>{let h=-1,b=-1/0;for(let y=0;y<o;y+=1)i[y]&&r[y]>b&&(b=r[y],h=y);return h},m=()=>{let h=-1,b=1/0;for(let y=0;y<o;y+=1)!i[y]&&r[y]<b&&(b=r[y],h=y);return h};for(let h=0;h<o;h+=1){const b=f();i[b]=0,n(b,-1);const y=m();if(y===b){i[b]=1,n(b,1);break}i[y]=1,n(y,1)}const d=new Int32Array(o).fill(-1),v=i.slice(),g=r.slice();let x=s;for(let h=x-1;h>=0;h-=1){const b=f();i[b]=0,n(b,-1),d[b]=h}i.set(v),r.set(g);for(let h=x;h<o;h+=1){const b=m();i[b]=1,n(b,1),d[b]=h}const k=new Uint8Array(o*4);for(let h=0;h<o;h+=1){const b=Math.round((d[h]+.5)/o*255);k[h*4]=b,k[h*4+1]=b,k[h*4+2]=b,k[h*4+3]=255}return k}function po(e){Pe||(Pe=mo(Te));const o=e.gl,t=o.createTexture();return o.bindTexture(o.TEXTURE_2D,t),o.texImage2D(o.TEXTURE_2D,0,o.RGBA8,Te,Te,0,o.RGBA,o.UNSIGNED_BYTE,Pe),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MIN_FILTER,o.NEAREST),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MAG_FILTER,o.NEAREST),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_S,o.REPEAT),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_T,o.REPEAT),{texture:t,size:Te}}const C=e=>{const o=String(e||"#000000").replace("#",""),t=o.length===3?o.replace(/./g,l=>l+l):o.padEnd(6,"0"),a=parseInt(t.slice(0,6),16);return[(a>>16&255)/255,(a>>8&255)/255,(a&255)/255]},vo=`
uniform float uLod;
void main() {
  outColor = vec4(textureLod(uInput, vUv, uLod).rgb, 1.0);
}`,et=`
uniform vec2 uStep;
uniform float uSigma;

void main() {
  float sigma = max(uSigma, 0.001);
  float radius = min(ceil(sigma * 3.0), 40.0);
  vec3 sum = texture(uInput, vUv).rgb;
  float total = 1.0;
  for (int i = 1; i <= 40; i++) {
    float x = float(i);
    if (x > radius) break;
    float w = exp(-x * x / (2.0 * sigma * sigma));
    vec2 offset = uStep * x;
    sum += (texture(uInput, vUv + offset).rgb + texture(uInput, vUv - offset).rgb) * w;
    total += 2.0 * w;
  }
  outColor = vec4(sum / total, 1.0);
}`;function E(e,o,t,{maxSigma:a=10}={}){let l=1;for(;t/l>a&&l<32;)l*=2;const r=Math.max(1,Math.round(e.width/l)),i=Math.max(1,Math.round(e.height/l));let n=o,u=null;if(l>1){const f=o.mipmapped?o:e.mipmap(o);u=e.pass("blur-down",vo,{input:f,target:e.target(r,i),uniforms:{uLod:Math.log2(l)-.5}}),n=u}const c=t/l,s=e.pass("blur-gauss",et,{input:n,target:e.target(r,i),uniforms:{uStep:[1/r,0],uSigma:c}});u&&e.release(u);const p=e.pass("blur-gauss",et,{input:s,target:e.target(r,i),uniforms:{uStep:[0,1/i],uSigma:c}});return e.release(s),p}const ho=`
uniform vec2 uStep;

void main() {
  vec3 c = texture(uInput, vUv + uStep * vec2(-0.25, -0.25)).rgb;
  c += texture(uInput, vUv + uStep * vec2(0.25, -0.25)).rgb;
  c += texture(uInput, vUv + uStep * vec2(-0.25, 0.25)).rgb;
  c += texture(uInput, vUv + uStep * vec2(0.25, 0.25)).rgb;
  float l = luma(c * 0.25);
  outColor = vec4(l, l * l, 0.0, 1.0);
}`,be=64;function J(e,o){const t=e.pass("image-stats",ho,{input:o,target:e.target(be,be),uniforms:{uStep:[1/be,1/be]}});return e.mipmap(t),{target:t,top:Math.log2(be)}}const re=`
uniform sampler2D uStats;
uniform float uStatsTop;

float autoLevel(float value) {
  vec2 moments = textureLod(uStats, vec2(0.5), uStatsTop).rg;
  float spread = sqrt(max(moments.y - moments.x * moments.x, 1e-5));
  return clamp((value - moments.x) / (spread * 4.2) + 0.5, 0.0, 1.0);
}
`,go=`
${re}
uniform vec3 uColors[8];
uniform float uAuto;
uniform float uCount;
uniform float uContrast;
uniform float uOffset;
uniform float uMix;

vec3 gradientAt(float t) {
  float x = clamp(t, 0.0, 1.0) * (uCount - 1.0);
  float index = floor(x);
  float f = x - index;
  vec3 a = uColors[0];
  vec3 b = uColors[0];
  for (int i = 0; i < 8; i++) {
    if (float(i) == index) a = uColors[i];
    if (float(i) == min(index + 1.0, uCount - 1.0)) b = uColors[i];
  }
  return mix(a, b, smoothstep(0.0, 1.0, f));
}

void main() {
  vec3 color = texture(uInput, vUv).rgb;
  float l = luma(color);
  l = mix(l, autoLevel(l), uAuto);
  l = clamp((l - 0.5) * uContrast + 0.5, 0.0, 1.0);
  float t = l + uOffset;
  t = abs(fract(t * 0.5) * 2.0 - 1.0);
  t = uOffset == 0.0 ? l : t;
  vec3 mapped = gradientAt(t);
  outColor = vec4(mix(color, mapped, uMix), 1.0);
}`,Se={thermal:["#04020c","#1c0a6b","#6a0fa0","#b8197a","#e84a2a","#fb9512","#fde047","#fffbea"],infrared:["#05060a","#2d1b69","#b72e8f","#ff6b6b","#ffe66d","#ffffff"],dusk:["#16121f","#3d2c5c","#c3477a","#ffb38a","#fff3e3"],ocean:["#04111d","#0b3c5d","#328cc1","#9ad1d4","#f2fdff"],noir:["#0b0b0d","#5a5a60","#f1f1ed"],acid:["#0d0221","#2de2e6","#f6019d","#fdf500"],sepia:["#20160f","#6b4a32","#c69c6d","#f6ead6"]},bo={id:"gradient",name:"Gradient map",category:"color",blend:"normal",description:"Maps brightness onto a palette, from duotone to thermal.",animated:!0,animates:e=>e.cycle>0,params:[{key:"palette",label:"Palette",type:"select",default:"dusk",options:[{value:"dusk",label:"Dusk"},{value:"thermal",label:"Thermal"},{value:"infrared",label:"Infrared"},{value:"ocean",label:"Ocean"},{value:"noir",label:"Noir"},{value:"acid",label:"Acid"},{value:"sepia",label:"Sepia"},{value:"custom",label:"Personalizado"}]},{key:"colors",label:"Cores",type:"colors",min:2,max:8,default:["#1d1a2f","#ff5a36","#ffe9c4"],when:e=>e.palette==="custom"},{key:"contrast",label:"Contraste",type:"number",min:.3,max:2.5,step:.01,default:1.1},{key:"auto",label:"Auto levels",type:"boolean",default:!0},{key:"mix",label:"Strength",type:"number",min:0,max:1,step:.01,default:1},{key:"cycle",label:"Cycle",type:"number",min:0,max:2,step:.01,default:0}],render(e,o,t){const l=(t.palette==="custom"?t.colors||[]:Se[t.palette]||Se.dusk).slice(0,8).map(C);l.length<2&&l.push([1,1,1]);const r=l.length;for(;l.length<8;)l.push(l[l.length-1]);const i=J(e,o),n=e.pass("gradient-map",go,{input:o,textures:{uStats:i.target},uniforms:{uStatsTop:i.top,uAuto:t.auto?1:0,uColors:l,uCount:r,uContrast:t.contrast,uOffset:t.cycle>0?e.time*t.cycle*.25:0,uMix:t.mix}});return e.release(i.target),n}},tt={standard:" .:-=+*#%@",letters:" .-=+xX0S8#@",dense:" .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",minimal:" .·:*oO@",mixed:" .:-=+*xX#%░▒▓█@",binary:" 01",matrix:" .:ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ012345789Z",code:" .,:;-~=+<>!?/\\|(){}[]#%&$@"},Le={braille:1,blocks:2,dots:3,diamonds:4,crosses:5,strokes:6,lines:7},yo={braille:.55,blocks:1,dots:1,diamonds:1,crosses:1,strokes:1,lines:.5},xo={braille:[2,4],blocks:[2,2]},ot={light:300,regular:500,bold:700,heavy:900},ko={image:0,ink:1,gradient:2,palette:3},wo={color:0,image:1,soft:2},So=`
uniform sampler2D uGlyphs;
uniform sampler2D uHalo;
uniform sampler2D uBack;
uniform vec3 uBackground;
uniform float uBehind;
uniform float uBackdrop;
uniform float uDim;
uniform float uGlow;

void main() {
  vec3 base;
  if (uBehind < 0.5) {
    base = uBackground;
    if (uBackdrop > 0.0) base = mix(uBackground, mix(uBackground, texture(uInput, vUv).rgb, 0.5), uBackdrop);
  } else {
    base = texture(uBack, vUv).rgb * (1.0 - uDim);
  }
  vec4 glyphs = texture(uGlyphs, vUv);
  vec3 color = base * (1.0 - glyphs.a) + glyphs.rgb;
  if (uGlow > 0.0) color += texture(uHalo, vUv).rgb * uGlow;
  outColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}`,Co=`
uniform vec2 uCell;
uniform vec2 uImage;

void main() {
  vec2 origin = floor(gl_FragCoord.xy) * uCell;
  vec3 sum = vec3(0.0);
  for (int y = 0; y < 4; y++) {
    for (int x = 0; x < 4; x++) {
      vec2 p = origin + (vec2(float(x), float(y)) + 0.5) * 0.25 * uCell;
      sum += texture(uInput, min(p, uImage - 0.5) / uImage).rgb;
    }
  }
  vec3 average = sum / 16.0;
  outColor = vec4(average, luma(average));
}`,Mo=`
uniform sampler2D uCells;
uniform sampler2D uAtlas;
uniform vec2 uCell;
uniform vec2 uGrid;
uniform vec2 uAtlasGrid;
uniform float uCount;
uniform float uShape;
uniform float uMode;
uniform vec3 uInk;
uniform vec3 uAccent;
uniform vec3 uPalette[8];
uniform float uPaletteCount;
uniform float uLift;
uniform float uOpacity;
uniform float uCoverage;
uniform float uThreshold;
uniform float uFade;
uniform float uDepth;
uniform float uTwinkle;
uniform float uEdges;
uniform float uFlicker;
uniform float uRain;
uniform float uSpeed;
uniform float uContrast;
uniform float uBrightness;
uniform float uAuto;
uniform float uInvert;
uniform float uTop;
uniform float uSeed;
uniform float uGlyphCurve;

float tone(float v) {
  float mean = textureLod(uCells, vec2(0.5), uTop).a;
  v += clamp(0.5 - mean, -0.35, 0.35) * uAuto;
  v = clamp((v - 0.5) * uContrast + 0.5 + uBrightness, 0.0, 1.0);
  return uInvert > 0.5 ? 1.0 - v : v;
}

vec4 cellData(ivec2 c) {
  return texelFetch(uCells, clamp(c, ivec2(0), ivec2(uGrid) - 1), 0);
}

float cellTone(ivec2 c) {
  return tone(cellData(c).a);
}

float rainAt(vec2 cell, float rows) {
  float column = cell.x;
  float speed = 0.35 + hash11(column * 7.13) * 0.9;
  float offset = hash11(column * 3.71 + 11.0) * 40.0;
  float phase = uTime * uSpeed * speed * 0.12 + offset;
  float head = fract(phase) * (rows + 24.0) - 12.0;
  float behind = head - (rows - 1.0 - cell.y);
  float trail = behind >= 0.0 ? exp(-behind / (6.0 + hash11(column) * 10.0)) : 0.0;
  return trail * step(0.35, hash11(column * 1.91 + floor(phase) * 3.3));
}

float flickerAt(vec2 cell) {
  float tick = floor(uTime * 10.0 * uSpeed + hash12(cell) * 4.0);
  return hash12(cell + tick * 17.37) - 0.5;
}

float orderedTwo(vec2 a) {
  a = floor(a);
  return fract(dot(a, vec2(0.5, a.y * 0.75)));
}

float ordered(vec2 a) {
  return orderedTwo(0.5 * a) * 0.25 + orderedTwo(a);
}

vec3 paletteAt(float t) {
  float x = clamp(t, 0.0, 1.0) * (uPaletteCount - 1.0);
  float index = floor(x);
  vec3 a = uPalette[0];
  vec3 b = uPalette[0];
  for (int i = 0; i < 8; i++) {
    if (float(i) == index) a = uPalette[i];
    if (float(i) == min(index + 1.0, uPaletteCount - 1.0)) b = uPalette[i];
  }
  return mix(a, b, smoothstep(0.0, 1.0, x - index));
}

vec3 inkFor(vec3 color, float value) {
  vec3 ink;
  if (uMode < 0.5) {
    float peak = max(max(color.r, color.g), max(color.b, 0.08));
    ink = mix(color / peak, vec3(1.0), 0.08);
  } else if (uMode < 1.5) {
    ink = uInk;
  } else if (uMode < 2.5) {
    ink = mix(uInk, uAccent, smoothstep(0.15, 0.9, value));
  } else {
    ink = paletteAt(value);
  }
  return mix(ink, vec3(1.0), uLift);
}

float presence(vec2 cell, float value) {
  float pick = hash12(cell * 1.31 + uSeed * 7.7);
  float level = hash12(cell * 2.17 + uSeed * 3.1 + 11.0);
  float density = clamp(uCoverage * mix(1.0, 0.25 + value * 1.25, 0.6), 0.0, 1.0);
  float show = uCoverage >= 1.0 ? 1.0 : step(pick, density);
  show *= smoothstep(uThreshold, uThreshold + 0.16, value + (uThreshold <= 0.0 ? 1.0 : 0.0));
  float alpha = uOpacity * show * mix(1.0, 0.2 + 0.8 * level, uFade);
  if (uTwinkle > 0.0) {
    float wave = 0.5 + 0.5 * sin(uTime * uSpeed * (0.8 + level * 1.8) + pick * TAU);
    alpha *= 1.0 - uTwinkle * wave;
  }
  return alpha;
}

float focusOf(vec2 cell) {
  return step(hash12(cell * 0.73 + uSeed * 5.3 + 3.0), uDepth);
}

float sampleGlyph(float index, vec2 local, vec2 coord, float soft) {
  float column = mod(index, uAtlasGrid.x);
  float row = floor(index / uAtlasGrid.x);
  vec2 atlasUv = vec2((column + local.x) / uAtlasGrid.x, 1.0 - (row + 1.0 - local.y) / uAtlasGrid.y);
  vec2 continuous = coord / uAtlasGrid;
  float scale = exp2(soft * 2.4);
  return textureGrad(uAtlas, atlasUv, dFdx(continuous) * scale, dFdy(continuous) * scale).a;
}

float coverageOf(float d, float aa) {
  return 1.0 - smoothstep(-aa, aa, d);
}

vec4 shapeMark(vec2 coord, vec2 cell, vec2 local, vec4 data, float value) {
  vec2 p = (local - 0.5) * uCell / min(uCell.x, uCell.y);
  float aa = max(fwidth(p.x) * 0.9, 0.012);
  float d = 1.0;
  if (uShape < 3.5) {
    d = length(p) - 0.5 * sqrt(value) * 0.98;
  } else if (uShape < 4.5) {
    d = (abs(p.x) + abs(p.y)) - 0.62 * sqrt(value);
  } else if (uShape < 5.5) {
    vec2 q = value > 0.62 ? rotation(0.785398) * p : p;
    float arm = 0.46 * smoothstep(0.02, 0.5, value) + 0.04;
    float thick = 0.05 + 0.1 * value;
    d = max(min(abs(q.x), abs(q.y)) - thick, max(abs(q.x), abs(q.y)) - arm);
  } else if (uShape < 6.5) {
    ivec2 id = ivec2(cell);
    float gx = cellTone(id + ivec2(1, 0)) - cellTone(id - ivec2(1, 0));
    float gy = cellTone(id + ivec2(0, 1)) - cellTone(id - ivec2(0, 1));
    float strength = smoothstep(0.08, 0.22, length(vec2(gx, gy)));
    float angle = mix(0.785398, atan(gy, gx) + 1.5708, strength);
    vec2 q = rotation(-angle) * p;
    float thick = 0.03 + 0.17 * value;
    d = max(abs(q.y) - thick, abs(q.x) - 0.56);
  } else {
    d = abs(p.x) - (0.04 + 0.42 * value);
  }
  return vec4(data.rgb, coverageOf(d, aa));
}

vec4 subcellMark(vec2 px, out vec4 picked, out float value, out vec2 markCell) {
  vec2 coord = px / uCell;
  vec2 cell = floor(coord);
  vec2 local = coord - cell;
  vec2 counts = uShape < 1.5 ? vec2(2.0, 4.0) : vec2(2.0);
  vec2 sub = min(floor(local * counts), counts - 1.0);
  vec2 id = cell * counts + sub;
  vec4 data = cellData(ivec2(id));
  value = tone(data.a);
  if (uRain > 0.0) value = clamp(value + rainAt(cell, uGrid.y / counts.y) * uRain * 0.85, 0.0, 1.0);
  if (uFlicker > 0.0) value = clamp(value + flickerAt(id) * uFlicker * 0.5, 0.0, 1.0);
  float on = step(ordered(id) * (uShape < 1.5 ? 0.94 : 0.7) + (uShape < 1.5 ? 0.03 : 0.02), value);
  float coverage;
  if (uShape < 1.5) {
    vec2 center = vec2(sub.x < 0.5 ? 0.28 : 0.72, 0.5 + (sub.y - 1.5) * 0.235);
    float dist = length((local - center) * uCell);
    float radius = 0.095 * uCell.y;
    float aa = max(fwidth(dist), 0.5);
    coverage = 1.0 - smoothstep(radius - aa, radius + aa, dist);
  } else {
    vec2 q = abs(fract(local * counts) - 0.5);
    float edge = max(q.x, q.y);
    float aa = max(fwidth(edge), 0.004);
    coverage = 1.0 - smoothstep(0.46 - aa, 0.46 + aa, edge);
  }
  picked = data;
  markCell = id;
  return vec4(data.rgb, on * coverage);
}

void main() {
  vec2 px = vUv * uResolution;
  vec4 mark;
  vec4 data;
  float value;
  vec2 cell;
  if (uShape > 0.5 && uShape < 2.5) {
    mark = subcellMark(px, data, value, cell);
  } else {
    vec2 coord = px / uCell;
    cell = floor(coord);
    vec2 local = coord - cell;
    ivec2 id = ivec2(cell);
    data = cellData(id);
    value = tone(data.a);
    float rain = 0.0;
    if (uRain > 0.0) {
      rain = rainAt(cell, uGrid.y) * uRain;
      value = clamp(value + rain * 0.85, 0.0, 1.0);
    }
    if (uFlicker > 0.0) {
      value = clamp(value + flickerAt(cell) * uFlicker * (uShape > 0.5 ? 0.25 : 2.2 / max(uCount - 1.0, 1.0)), 0.0, 1.0);
    }
    if (uShape > 2.5) {
      mark = shapeMark(coord, cell, local, data, value);
    } else {
      float glyphValue = clamp(pow(value, uGlyphCurve), 0.0, 1.0);
      float index = floor(glyphValue * (uCount - 1.0) + 0.5);
      if (uEdges > 0.0) {
        float tl = cellTone(id + ivec2(-1, 1));
        float tc = cellTone(id + ivec2(0, 1));
        float tr = cellTone(id + ivec2(1, 1));
        float ml = cellTone(id + ivec2(-1, 0));
        float mr = cellTone(id + ivec2(1, 0));
        float bl = cellTone(id + ivec2(-1, -1));
        float bc = cellTone(id + ivec2(0, -1));
        float br = cellTone(id + ivec2(1, -1));
        float gx = (tr + 2.0 * mr + br) - (tl + 2.0 * ml + bl);
        float gy = (tl + 2.0 * tc + tr) - (bl + 2.0 * bc + br);
        if (length(vec2(gx, gy)) > mix(2.4, 0.45, uEdges)) {
          float angle = atan(gy, gx);
          float bin = mod(floor((angle + PI / 8.0) / (PI / 4.0)) + 8.0, 4.0);
          index = uCount + (bin < 0.5 ? 2.0 : bin < 1.5 ? 3.0 : bin < 2.5 ? 0.0 : 1.0);
          value = max(value, 0.55);
        }
      }
      mark = vec4(data.rgb, sampleGlyph(index, local, coord, focusOf(cell)));
      data.rgb = mix(data.rgb, vec3(1.0), rain * 0.75);
    }
  }
  float alpha = clamp(presence(cell, value) * mark.a * (1.0 - focusOf(cell) * 0.3), 0.0, 1.0);
  outColor = vec4(inkFor(data.rgb, value) * alpha, alpha);
}`,To={id:"ascii",name:"ASCII",category:"type",description:"Rebuilds the image from characters, braille, blocks or shapes, over a solid color or the softened photo.",animated:!0,animates:e=>e.speed>0&&(e.flicker>0||e.rain>0||e.twinkle>0),params:[{key:"charset",label:"Characters",type:"select",default:"standard",options:[{value:"standard",label:"Standard"},{value:"letters",label:"Letters"},{value:"dense",label:"Dense"},{value:"minimal",label:"Minimal"},{value:"mixed",label:"Mixed"},{value:"blocks",label:"Blocks"},{value:"braille",label:"Braille dots"},{value:"dots",label:"Dots"},{value:"diamonds",label:"Diamonds"},{value:"crosses",label:"Crosses"},{value:"strokes",label:"Strokes"},{value:"lines",label:"Lines"},{value:"binary",label:"Binary"},{value:"matrix",label:"Matrix"},{value:"code",label:"Código"},{value:"custom",label:"Personalizado"}]},{key:"text",label:"Custom set",type:"text",default:" .:-=+*#%@",when:e=>e.charset==="custom"},{key:"size",label:"Tamanho",type:"number",min:3,max:40,step:.5,default:10},{key:"weight",label:"Weight",type:"select",default:"bold",options:[{value:"light",label:"Claro"},{value:"regular",label:"Regular"},{value:"bold",label:"Bold"},{value:"heavy",label:"Heavy"}],when:e=>!(e.charset in Le)},{key:"behind",label:"Fundo",type:"select",default:"color",options:[{value:"color",label:"Solid color"},{value:"image",label:"Imagem"},{value:"soft",label:"Soft image"}]},{key:"background",label:"Background color",type:"color",default:"#0c0b10",when:e=>e.behind==="color"},{key:"backdrop",label:"Image behind",type:"number",min:0,max:1,step:.01,default:0,when:e=>e.behind==="color"},{key:"blur",label:"Softness",type:"number",min:0,max:40,step:.5,default:14,when:e=>e.behind==="soft"},{key:"dim",label:"Dim image",type:"number",min:0,max:1,step:.01,default:0,when:e=>e.behind!=="color"},{key:"color",label:"Cor",type:"select",default:"image",options:[{value:"image",label:"From image"},{value:"ink",label:"Single ink"},{value:"gradient",label:"Two tone"},{value:"palette",label:"Palette"}]},{key:"ink",label:"Ink",type:"color",default:"#f2efe8",when:e=>e.color==="ink"||e.color==="gradient"},{key:"accent",label:"Highlight",type:"color",default:"#7cffb2",when:e=>e.color==="gradient"},{key:"palette",label:"Palette",type:"select",default:"ocean",options:Object.keys(Se).map(e=>({value:e,label:e[0].toUpperCase()+e.slice(1)})),when:e=>e.color==="palette"},{key:"lift",label:"Glyph brightness",type:"number",min:0,max:1,step:.01,default:0},{key:"opacity",label:"Glyph opacity",type:"number",min:0,max:1,step:.01,default:1},{key:"coverage",label:"Densidade",type:"number",min:.05,max:1,step:.01,default:1},{key:"threshold",label:"Dark cutoff",type:"number",min:0,max:.9,step:.01,default:0},{key:"fade",label:"Opacity variation",type:"number",min:0,max:1,step:.01,default:0},{key:"depth",label:"Depth of field",type:"number",min:0,max:1,step:.01,default:0},{key:"glow",label:"Glow",type:"number",min:0,max:1.5,step:.01,default:0},{key:"spread",label:"Character weight",type:"number",min:.4,max:2.5,step:.01,default:1,when:e=>!(e.charset in Le)},{key:"contrast",label:"Contraste",type:"number",min:.4,max:2.5,step:.01,default:1.2},{key:"brightness",label:"Brilho",type:"number",min:-.5,max:.5,step:.01,default:0},{key:"auto",label:"Auto levels",type:"boolean",default:!0},{key:"edges",label:"Edge lines",type:"number",min:0,max:1,step:.01,default:0,when:e=>!(e.charset in Le)},{key:"invert",label:"Invert",type:"boolean",default:!1},{key:"twinkle",label:"Twinkle",type:"number",min:0,max:1,step:.01,default:0},{key:"flicker",label:"Flicker",type:"number",min:0,max:1,step:.01,default:.15},{key:"rain",label:"Rain",type:"number",min:0,max:1,step:.01,default:0},{key:"speed",label:"Velocidade",type:"number",min:0,max:3,step:.05,default:1},{key:"variation",label:"Variação",type:"number",min:0,max:100,step:1,default:0}],render(e,o,t,a){const l=Le[t.charset]||0,r=Math.max(3,t.size*e.unit);let i=r*(yo[t.charset]??.6),n=null;if(!l){const b=t.charset==="custom"?t.text||" .":tt[t.charset]||tt.standard,y=ot[t.weight]||ot.bold,S=`${y}:${b}`;(!a.atlas||a.key!==S||!a.atlas.fontReady&&a.fontLoaded)&&(a.atlas&&e.gl.deleteTexture(a.atlas.texture),a.atlas=Ve(e.engine,b,y),a.key=S,!a.atlas.fontReady&&!a.fontPending&&(a.fontPending=!0,$e().then(()=>{a.fontLoaded=!0}))),n=a.atlas,i=r*n.aspect}const u=Math.ceil(e.width/i),c=Math.ceil(e.height/r),s=xo[t.charset]||[1,1],p=[u*s[0],c*s[1]],f=e.pass("ascii-cells",Co,{input:o,target:e.target(p[0],p[1],{filter:"nearest"}),uniforms:{uCell:[i/s[0],r/s[1]],uImage:[e.width,e.height]}});e.mipmap(f);const m=wo[t.behind]??0,d=m===2&&t.blur>0?E(e,o,Math.max(.5,t.blur*e.unit)):null,v=(Se[t.palette]||Se.ocean).slice(0,8).map(C),g=v.length;for(;v.length<8;)v.push(v[v.length-1]);const x=e.pass("ascii-glyphs",Mo,{input:o,textures:{uCells:f,uAtlas:n?n.texture:f},uniforms:{uCell:[i,r],uGrid:p,uAtlasGrid:n?n.grid:[1,1],uCount:n?n.count:1,uShape:l,uMode:ko[t.color]??0,uInk:C(t.ink),uAccent:C(t.accent),uPalette:v,uPaletteCount:g,uLift:t.lift,uOpacity:t.opacity,uCoverage:t.coverage,uThreshold:t.threshold,uFade:t.fade,uDepth:l?0:t.depth,uTwinkle:t.twinkle,uEdges:l?0:t.edges,uFlicker:t.flicker,uRain:t.rain,uSpeed:t.speed,uContrast:t.contrast,uBrightness:t.brightness,uAuto:t.auto?1:0,uInvert:t.invert?1:0,uTop:Math.floor(Math.log2(Math.max(p[0],p[1]))),uSeed:t.variation,uGlyphCurve:1/Math.max(t.spread,.1)}});e.release(f);const k=t.glow>0?E(e,x,Math.max(1,r*.45)):null,h=e.pass("ascii-composite",So,{input:o,textures:{uGlyphs:x,uHalo:k||x,uBack:d||o},uniforms:{uBackground:C(t.background),uBehind:m,uBackdrop:t.backdrop,uDim:t.dim,uGlow:t.glow}});return e.release(x),k&&e.release(k),d&&e.release(d),h},dispose(e,o){o.atlas&&e.deleteTexture(o.atlas.texture)}},Lo=`
uniform float uMode;
uniform float uShape;
uniform float uCell;
uniform float uAngle;
uniform float uScale;
uniform vec3 uPaper;
uniform vec3 uInk;
uniform vec3 uAccent;
uniform float uContrast;
uniform float uBrightness;
uniform float uRough;
uniform float uShift;
uniform vec2 uDrift;
uniform float uTexels;

const vec3 CYAN = vec3(0.0, 0.64, 0.93);
const vec3 MAGENTA = vec3(0.92, 0.07, 0.56);
const vec3 YELLOW = vec3(1.0, 0.91, 0.0);
const vec3 KEY = vec3(0.11, 0.1, 0.12);
const vec3 RED = vec3(1.0, 0.16, 0.12);
const vec3 GREEN = vec3(0.12, 1.0, 0.3);
const vec3 BLUE = vec3(0.16, 0.32, 1.0);

vec3 photo(vec2 p, float lod) {
  vec2 uv = clamp(p / uResolution, 0.0, 1.0);
  return textureLod(uInput, uv, lod).rgb;
}

float grade(float v) {
  return clamp((v - 0.5) * uContrast + 0.5 + uBrightness, 0.0, 1.0);
}

vec3 gradeColor(vec3 c) {
  return vec3(grade(c.r), grade(c.g), grade(c.b));
}

vec3 tone(vec3 c) {
  return pow(max(c, 0.0), vec3(1.5));
}

float press(float t) {
  t = clamp(t, 0.0, 1.0);
  return smoothstep(0.0, 0.04, t) * (0.05 + t * 0.89);
}

float plate(float t) {
  t = clamp(t, 0.0, 1.0);
  return smoothstep(0.0, 0.03, t) * (0.02 + t * 0.92);
}

vec3 decode(vec3 c) {
  return pow(max(c, 0.0), vec3(2.2));
}

vec4 separate(vec3 color) {
  vec3 target = clamp(tone(gradeColor(color)) / max(tone(uPaper), vec3(0.02)), 0.0, 1.0);
  vec3 absorbC = 1.0 - decode(CYAN);
  vec3 absorbM = 1.0 - decode(MAGENTA);
  vec3 absorbY = 1.0 - decode(YELLOW);
  float bright = pow(max(max(target.r, target.g), target.b), 0.4545);
  float key = pow(clamp(1.0 - bright / 0.62, 0.0, 1.0), 1.4) * 0.95;
  vec3 rest = clamp(target / max(1.0 - key * (1.0 - decode(KEY)), vec3(0.03)), 0.0, 1.0);
  vec3 a = 1.0 - rest;
  for (int i = 0; i < 3; i++) {
    vec3 tc = 1.0 - a.x * absorbC;
    vec3 tm = 1.0 - a.y * absorbM;
    vec3 ty = 1.0 - a.z * absorbY;
    mat3 slope = mat3(-absorbC * tm * ty, -absorbM * tc * ty, -absorbY * tc * tm);
    if (abs(determinant(slope)) < 1e-6) break;
    a = clamp(a - inverse(slope) * (tc * tm * ty - rest), 0.0, 1.0);
  }
  return vec4(a, key);
}

vec3 emit(vec3 color) {
  vec3 target = max(tone(gradeColor(color)) - tone(uPaper), 0.0);
  mat3 lights = mat3(decode(RED), decode(GREEN), decode(BLUE));
  return clamp(inverse(lights) * target, 0.0, 1.0);
}

float metric(vec2 f) {
  if (uShape < 0.5) return length(f);
  if (uShape < 1.5) return length(f * vec2(0.8, 1.15));
  if (uShape < 2.5) return max(abs(f.x), abs(f.y));
  if (uShape < 3.5) return abs(f.x) + abs(f.y);
  if (uShape < 4.5) return abs(f.y);
  return min(abs(f.x), abs(f.y));
}

float reach(float t) {
  t = clamp(t, 0.0, 1.0);
  if (uShape < 0.5) return t < 0.785 ? sqrt(t / 3.14159) : mix(0.5, 0.72, (t - 0.785) / 0.215);
  if (uShape < 1.5) return t < 0.7 ? sqrt(t * 0.92 / 3.14159) : mix(0.4497, 0.72, (t - 0.7) / 0.3);
  if (uShape < 2.5) return 0.5 * sqrt(t) + 0.02 * t;
  if (uShape < 3.5) return t < 0.5 ? sqrt(t * 0.5) : 1.0 - sqrt((1.0 - t) * 0.5);
  if (uShape < 4.5) return 0.52 * t;
  return (1.0 - sqrt(1.0 - t)) * 0.5 + 0.02 * t;
}

vec2 center(vec2 p, float angle) {
  vec2 q = rotation(angle) * p / uCell;
  vec2 c = floor(q) + 0.5;
  if (uShape > 3.5 && uShape < 4.5) c.x = q.x;
  return rotation(-angle) * c * uCell;
}

float dots(vec2 p, float angle, float t, float seed) {
  vec2 q = rotation(angle) * p / uCell;
  float d = metric(fract(q) - 0.5);
  d += (valueNoise(p * 0.42 / max(uUnit, 0.25) + seed * 17.0) - 0.5) * uRough * 0.18;
  float r = reach(t) * uScale;
  float w = max(fwidth(d), 0.0001) * 0.75;
  return smoothstep(r + w, r - w, d) * clamp(r / (w * 2.0), 0.0, 1.0);
}

float coverage(vec3 image) {
  float shade = dot(tone(gradeColor(image)), LUMA);
  float paper = dot(tone(uPaper), LUMA);
  float span = dot(tone(uInk), LUMA) - paper;
  float t = abs(span) < 0.02 ? 1.0 - shade : (shade - paper) / span;
  return press(t);
}

void main() {
  vec2 p = vUv * uResolution + uDrift;
  float lod = log2(max(uCell * uTexels, 1.0));
  float base = uAngle;
  vec2 drift = vec2(uShift, uShift * -0.6);
  vec3 print = uPaper;

  if (uMode < 0.5) {
    float k = dots(p, base, coverage(photo(center(p, base) - uDrift, lod)), 0.0);
    print = mix(uPaper, uInk, k);
  } else if (uMode < 1.5) {
    float second = base + 0.5236;
    float tA = coverage(photo(center(p, base) - uDrift, lod));
    float tB = coverage(photo(center(p + drift, second) - drift - uDrift, lod));
    float kA = dots(p, base, pow(tA, 1.9), 0.0);
    float kB = dots(p + drift, second, clamp(tB * 1.3, 0.0, 1.0) * 0.8, 1.0);
    if (dot(uPaper, LUMA) > 0.5) {
      print = uPaper * mix(vec3(1.0), uAccent, kB) * mix(vec3(1.0), uInk, kA);
    } else {
      print = min(uPaper + uAccent * kB + uInk * kA, vec3(1.0));
    }
  } else if (uMode < 2.5) {
    float ac = base - 0.5236;
    float am = base + 0.5236;
    float ay = base - 0.7854;
    vec3 sc = photo(center(p + drift, ac) - drift - uDrift, lod);
    vec3 sm = photo(center(p - drift, am) + drift - uDrift, lod);
    vec3 sy = photo(center(p + drift.yx, ay) - drift.yx - uDrift, lod);
    vec3 sk = photo(center(p, base) - uDrift, lod);
    float kc = dots(p + drift, ac, plate(separate(sc).x), 1.0);
    float km = dots(p - drift, am, plate(separate(sm).y), 2.0);
    float ky = dots(p + drift.yx, ay, plate(separate(sy).z), 3.0);
    float kk = dots(p, base, plate(separate(sk).w), 4.0);
    print = uPaper;
    print *= mix(vec3(1.0), CYAN, kc);
    print *= mix(vec3(1.0), MAGENTA, km);
    print *= mix(vec3(1.0), YELLOW, ky);
    print *= mix(vec3(1.0), KEY, kk);
  } else {
    float ar = base - 0.5236;
    float ag = base + 0.5236;
    vec3 sr = photo(center(p + drift, ar) - drift - uDrift, lod);
    vec3 sg = photo(center(p - drift, ag) + drift - uDrift, lod);
    vec3 sb = photo(center(p, base) - uDrift, lod);
    float kr = dots(p + drift, ar, plate(emit(sr).x), 1.0);
    float kg = dots(p - drift, ag, plate(emit(sg).y), 2.0);
    float kb = dots(p, base, plate(emit(sb).z), 3.0);
    print = min(uPaper + RED * kr + GREEN * kg + BLUE * kb, vec3(1.0));
  }

  outColor = vec4(print, 1.0);
}`,Uo={mono:0,duotone:1,cmyk:2,rgb:3},Io={dot:0,ellipse:1,square:2,diamond:3,line:4,cross:5},zo={id:"halftone",name:"Halftone",category:"print",description:"Print screens of dots or lines, from one ink to full CMYK.",animated:!0,animates:e=>e.motion>0,params:[{key:"mode",label:"Inks",type:"select",default:"cmyk",options:[{value:"cmyk",label:"CMYK"},{value:"mono",label:"One ink"},{value:"duotone",label:"Two inks"},{value:"rgb",label:"Light (RGB)"}]},{key:"shape",label:"Shape",type:"select",default:"dot",options:[{value:"dot",label:"Dot"},{value:"ellipse",label:"Ellipse"},{value:"square",label:"Square"},{value:"diamond",label:"Diamond"},{value:"line",label:"Line"},{value:"cross",label:"Cross"}]},{key:"size",label:"Tamanho",type:"number",min:2,max:40,step:.5,default:8},{key:"angle",label:"Ângulo",type:"number",min:0,max:90,step:1,default:15},{key:"paper",label:"Paper",type:"color",default:"#f3eee4"},{key:"ink",label:"Ink",type:"color",default:"#17151a",when:e=>e.mode==="mono"||e.mode==="duotone"},{key:"accent",label:"Second ink",type:"color",default:"#ff5a36",when:e=>e.mode==="duotone"},{key:"gain",label:"Dot gain",type:"number",min:.6,max:1.6,step:.01,default:1},{key:"contrast",label:"Contraste",type:"number",min:.5,max:2,step:.01,default:1.1},{key:"brightness",label:"Brilho",type:"number",min:-.4,max:.4,step:.01,default:0},{key:"rough",label:"Ink texture",type:"number",min:0,max:1,step:.01,default:.3},{key:"misregister",label:"Misregister",type:"number",min:0,max:1,step:.01,default:.15},{key:"motion",label:"Drift",type:"number",min:0,max:2,step:.01,default:0}],render(e,o,t){const a=o.mipmapped?o:e.mipmap(o),l=Math.max(2,t.size*e.unit),r=t.motion*e.time;return e.pass("halftone",Lo,{input:a,uniforms:{uMode:Uo[t.mode]??2,uShape:Io[t.shape]??0,uCell:l,uAngle:(t.angle+r*3)*Math.PI/180,uScale:t.gain,uPaper:C(t.paper),uInk:C(t.ink),uAccent:C(t.accent),uContrast:t.contrast,uBrightness:t.brightness,uRough:t.rough,uShift:t.misregister*l*.35,uDrift:[r*l*.6,r*l*.25],uTexels:1}})}},Ce=64,Nt=40,Ee=2,Ao=1/255,at=.8/255,qe=`
uniform sampler2D uNoise;
uniform vec2 uFull;
uniform float uPixel;
uniform float uPattern;
uniform float uSpread;
uniform float uContrast;
uniform float uBrightness;
uniform vec3 uPalette[${Ce}];
uniform vec3 uLab[${Ce}];
uniform float uCount;
uniform float uLevels;
uniform float uMatch;
uniform float uEncode;
uniform vec2 uOffset;

float bayer2(vec2 a) {
  a = floor(a);
  return fract(a.x / 2.0 + a.y * a.y * 0.75);
}

float bayer4(vec2 a) {
  return bayer2(0.5 * a) * 0.25 + bayer2(a);
}

float bayer8(vec2 a) {
  return bayer4(0.5 * a) * 0.25 + bayer2(a);
}

float threshold(vec2 cell) {
  vec2 c = cell + uOffset;
  if (uPattern < 0.5) return bayer4(c);
  if (uPattern < 1.5) return bayer8(c);
  if (uPattern < 2.5) return texture(uNoise, (c + 0.5) / 64.0).r;
  if (uPattern < 3.5) {
    vec2 q = rotation(0.785398) * c / 5.6568;
    vec2 f = fract(q) - 0.5;
    float d = length(f) * 1.4142;
    return clamp(1.0 - d, 0.0, 1.0);
  }
  if (uPattern < 4.5) {
    return abs(fract(c.y / 4.0 + bayer2(vec2(c.x, 0.0)) * 0.03) - 0.5) * 2.0;
  }
  if (uPattern < 5.5) return hash12(c * 0.7 + 3.1);
  if (uPattern < 6.5) return bayer2(c) + 0.125;
  vec2 g = floor(c);
  float across = abs(fract((g.x + g.y) / 6.0 + 0.0833) - 0.5) * 2.0;
  return clamp(across * 0.88 + bayer2(vec2(g.x - g.y, 0.0)) * 0.2, 0.0, 1.0);
}

vec3 grade(vec3 c) {
  c = clamp((c - 0.5) * uContrast + 0.5 + uBrightness, 0.0, 1.0);
  return c;
}

vec3 ramp(vec3 color, float t) {
  float l = clamp(toOklab(color).x, 0.0, 1.0);
  float x = l * (uCount - 1.0);
  float index = floor(x);
  float pick = min(index + step(t, fract(x) - 1e-4), uCount - 1.0);
  return uPalette[int(pick)];
}

vec3 quantize(vec3 color, float t) {
  if (uMatch < 0.5) return ramp(color, t);
  if (uCount < 1.5) return uPalette[0];
  vec3 lab = toOklab(color);
  float best = 1e9;
  float second = 1e9;
  int ia = 0;
  int ib = 0;
  for (int i = 0; i < ${Ce}; i++) {
    if (float(i) >= uCount) break;
    float d = distance(lab, uLab[i]);
    if (d < best) {
      second = best;
      ib = ia;
      best = d;
      ia = i;
    } else if (d < second) {
      second = d;
      ib = i;
    }
  }
  vec3 a = uLab[ia];
  vec3 b = uLab[ib];
  vec3 ab = b - a;
  float f = clamp(dot(lab - a, ab) / max(dot(ab, ab), 1e-6), 0.0, 1.0);
  return f > t ? uPalette[ib] : uPalette[ia];
}

void main() {
  vec2 cell = floor(gl_FragCoord.xy);
  vec2 center = (cell + 0.5) * uPixel;
  vec3 color = textureLod(uInput, center / uFull, log2(max(uPixel, 1.0))).rgb;
  color = grade(color);
  if (uEncode > 0.5) {
    if (uEncode > 2.5) {
      outColor = vec4(color, 1.0);
    } else {
      vec3 lab = toOklab(color);
      outColor = vec4(clamp(lab.x, 0.0, 1.0), clamp(lab.yz / 0.8 + 0.5, 0.0, 1.0), 1.0);
    }
    return;
  }
  float t = threshold(cell);
  t = clamp(0.5 + (t - 0.5) * uSpread, 0.0, 0.999);
  vec3 result;
  if (uLevels > 0.5) {
    float steps = max(uLevels - 1.0, 1.0);
    result = floor(color * steps + t) / steps;
  } else {
    result = quantize(color, t);
  }
  outColor = vec4(result, 1.0);
}`,lt=`
uniform sampler2D uGrid;
uniform float uPixel;

void main() {
  outColor = vec4(texelFetch(uGrid, ivec2(floor(gl_FragCoord.xy / uPixel)), 0).rgb, 1.0);
}`,rt={gameboy:["#0f380f","#306230","#8bac0f","#9bbc0f"],pico8:["#000000","#1d2b53","#7e2553","#008751","#ab5236","#5f574f","#c2c3c7","#fff1e8","#ff004d","#ffa300","#ffec27","#00e436","#29adff","#83769c","#ff77a8","#ffccaa"],cga:["#000000","#55ffff","#ff55ff","#ffffff"],sepia:["#21170f","#5e4430","#a9835f","#efe0c4"],mac:["#000000","#ffffff"],virtualboy:["#000000","#550000","#aa0000","#ff0000"],ega:["#000000","#0000aa","#00aa00","#00aaaa","#aa0000","#aa00aa","#aa5500","#aaaaaa","#555555","#5555ff","#55ff55","#55ffff","#ff5555","#ff55ff","#ffff55","#ffffff"],c64:["#000000","#ffffff","#813338","#75cec8","#8e3c97","#56ac4d","#2e2c9b","#edf171","#8e5029","#553800","#c46c71","#4a4a4a","#7b7b7b","#a9ff9f","#706deb","#b2b2b2"],vic20:["#000000","#ffffff","#a8734a","#e9b287","#772d26","#b66862","#85d4dc","#c5ffff","#a85fb4","#e99df5","#559e4a","#92df87","#42348b","#7e70ca","#bdcc71","#ffffb0"],zx:["#000000","#0000d7","#d70000","#d700d7","#00d700","#00d7d7","#d7d700","#d7d7d7","#0000ff","#ff0000","#ff00ff","#00ff00","#00ffff","#ffff00","#ffffff"],cpc:["#000000","#000080","#0000ff","#800000","#800080","#8000ff","#ff0000","#ff0080","#ff00ff","#008000","#008080","#0080ff","#808000","#808080","#8080ff","#ff8000","#ff8080","#ff80ff","#00ff00","#00ff80","#00ffff","#80ff00","#80ff80","#80ffff","#ffff00","#ffff80","#ffffff"],msx:["#000000","#3eb849","#74d07d","#5955e0","#8076f1","#b95e51","#65dbef","#db6559","#ff897d","#ccc35e","#ded087","#3aa241","#b766b5","#cccccc","#ffffff"],apple2:["#000000","#bb36ff","#43c800","#07a8e0","#f9561d","#ffffff"],nes:["#7c7c7c","#0000fc","#0000bc","#4428bc","#940084","#a80020","#a81000","#881400","#503000","#007800","#006800","#005800","#004058","#000000","#bcbcbc","#0078f8","#0058f8","#6844fc","#d800cc","#e40058","#f83800","#e45c10","#ac7c00","#00b800","#00a800","#00a844","#008888","#f8f8f8","#3cbcfc","#6888fc","#9878f8","#f878f8","#f85898","#f87858","#fca044","#f8b800","#b8f818","#58d854","#58f898","#00e8d8","#787878","#a4e4fc","#b8b8f8","#d8b8f8","#f8b8f8","#f8a4c0","#f0d0b0","#fce0a8","#f8d878","#d8f878","#b8f8b8","#b8f8d8","#00fcfc","#f8d8f8"],teletext:["#000000","#ff0000","#00ff00","#ffff00","#0000ff","#ff00ff","#00ffff","#ffffff"],mac16:["#ffffff","#fcf305","#ff6402","#dd0806","#f20884","#4600a5","#0000d4","#02abea","#1fb714","#006411","#562c05","#90713a","#c0c0c0","#808080","#404040","#000000"],amber:["#120a02","#5c3606","#c47c0c","#ffbf3a"],phosphor:["#020f06","#0b4d1c","#23a83c","#7cff7a"],neon:["#0d0222","#ec2f73","#3ec6d0","#d4f8ff"]},Ro={bayer4:0,bayer8:1,blue:2,clustered:3,lines:4,noise:5,bayer2:6,diagonal:7},Do=new Set(["custom","gameboy","cga","sepia","mac","gray","virtualboy","amber","phosphor","neon"]),it={floyd:0,atkinson:1},Fe=e=>{const o=e.map(r=>Math.max(r,0)**2.2),t=Math.cbrt(.4122214708*o[0]+.5363325363*o[1]+.0514459929*o[2]),a=Math.cbrt(.2119034982*o[0]+.6806995451*o[1]+.1073969566*o[2]),l=Math.cbrt(.0883024619*o[0]+.2817188376*o[1]+.6299787005*o[2]);return[.2104542553*t+.793617785*a-.0040720468*l,1.9779984951*t-2.428592205*a+.4505937099*l,.0259040371*t+.7827717662*a-.808675766*l]},Eo=e=>Array.from({length:e},(o,t)=>`#${Math.round(((t/(e-1))**3)**.45454545454545453*255).toString(16).padStart(2,"0").repeat(3)}`),Po=e=>{var o;return e.palette==="custom"?(o=e.colors)!=null&&o.length?e.colors:["#000000","#ffffff"]:e.palette==="gray"?Eo(Math.max(2,Math.round(e.levels||4))):rt[e.palette]||rt.mac},Xe=(e,o,t)=>{let a=Math.imul(e,374761393)+Math.imul(o,668265263)+Math.imul(t,1442695041);return a=Math.imul(a^a>>>13,1274126177),((a^a>>>16)>>>0)/4294967296};function he(e,o,t,a,l,r,i){if(e){const n=i*.125;o[l+r]+=n,o[l+r+r]+=n,t[l-r]+=n,t[l]+=n,t[l+r]+=n,a[l]+=n}else o[l+r]+=i*.4375,t[l-r]+=i*.1875,t[l]+=i*.3125,t[l+r]+=i*.0625}function qo(e,o,t,a,l,{strength:r,jitter:i,seed:n,count:u,bytes:c}){const s=u-1,p=s/255;for(let f=0;f<t;f+=1){const m=a[f%3],d=a[(f+1)%3],v=a[(f+2)%3],g=t-1-f,x=f&1?-1:1;let k=x>0?0:o-1;for(let h=0;h<o;h+=1,k+=x){const b=(g*o+k)*4,y=k+Ee;let S=e[b]*p+m[y];S=S<-.5?-.5:S>s+.5?s+.5:S;const I=i?S+(Xe(k,g,n)-.5)*i:S,L=I<=0?0:I>=s?s:I+.5|0;he(l,m,d,v,y,x,(S-L)*r);const M=L*3;e[b]=c[M],e[b+1]=c[M+1],e[b+2]=c[M+2]}m.fill(0)}}function Fo(e,o,t,a,l,{strength:r,jitter:i,seed:n,lut:u,lab:c,bytes:s}){const p=Nt;for(let f=0;f<t;f+=1){const m=f%3,d=(f+1)%3,v=(f+2)%3,g=a[m],x=a[d],k=a[v],h=a[3+m],b=a[3+d],y=a[3+v],S=a[6+m],I=a[6+d],L=a[6+v],M=t-1-f,A=f&1?-1:1;let z=A>0?0:o-1;for(let P=0;P<o;P+=1,z+=A){const D=(M*o+z)*4,F=z+Ee;let H=e[D]*Ao+g[F],j=e[D+1]*at-.4+h[F],_=e[D+2]*at-.4+S[F];H=H<0?0:H>1?1:H,j=j<-.4?-.4:j>.4?.4:j,_=_<-.4?-.4:_>.4?.4:_;let q=i?H+(Xe(z,M,n)-.5)*i:H;q=q<0?0:q>.9999?.9999:q;const B=(j+.4)*1.25,W=(_+.4)*1.25,Z=(B>.9999?.9999:B)*p|0,Q=(W>.9999?.9999:W)*p|0,Y=u[((q*p|0)*p+Z)*p+Q]*3;he(l,g,x,k,F,A,(H-c[Y])*r),he(l,h,b,y,F,A,(j-c[Y+1])*r),he(l,S,I,L,F,A,(_-c[Y+2])*r),e[D]=s[Y],e[D+1]=s[Y+1],e[D+2]=s[Y+2]}g.fill(0),h.fill(0),S.fill(0)}}function Bo(e,o,t,a,l,{strength:r,jitter:i,seed:n,steps:u}){const c=.5/u,s=-c,p=u+c,f=u/255,m=Uint8Array.from({length:u+1},(d,v)=>Math.round(v/u*255));for(let d=0;d<t;d+=1){const v=d%3,g=(d+1)%3,x=(d+2)%3,k=a[v],h=a[g],b=a[x],y=a[3+v],S=a[3+g],I=a[3+x],L=a[6+v],M=a[6+g],A=a[6+x],z=t-1-d,P=d&1?-1:1;let D=P>0?0:o-1;for(let F=0;F<o;F+=1,D+=P){const H=(z*o+D)*4,j=D+Ee,_=i?(Xe(D,z,n)-.5)*i:0;let q=e[H]*f+k[j],B=e[H+1]*f+y[j],W=e[H+2]*f+L[j];q=q<s?s:q>p?p:q,B=B<s?s:B>p?p:B,W=W<s?s:W>p?p:W;const Z=q+_,Q=B+_,Y=W+_,U=Z<=0?0:Z>=u?u:Z+.5|0,w=Q<=0?0:Q>=u?u:Q+.5|0,T=Y<=0?0:Y>=u?u:Y+.5|0;he(l,k,h,b,j,P,(q-U)*r),he(l,y,S,I,j,P,(B-w)*r),he(l,L,M,A,j,P,(W-T)*r),e[H]=m[U],e[H+1]=m[w],e[H+2]=m[T]}k.fill(0),y.fill(0),L.fill(0)}}function Go(e,o){const t=Nt,a=new Uint8Array(t*t*t);for(let l=0;l<t;l+=1){const r=(l+.5)/t;for(let i=0;i<t;i+=1){const n=((i+.5)/t-.5)*.8;for(let u=0;u<t;u+=1){const c=((u+.5)/t-.5)*.8;let s=0,p=1/0;for(let f=0;f<o;f+=1){const m=r-e[f*3],d=n-e[f*3+1],v=c-e[f*3+2],g=m*m+d*d+v*v;g<p&&(p=g,s=f)}a[(l*t+i)*t+u]=s}}}return a}function No(e,o,t,a){const l=e.gl,r=o.diffusion;if(r&&r.width===t&&r.height===a)return r;r&&(l.deleteTexture(r.texture),l.deleteBuffer(r.pbo));const i=l.createBuffer();return l.bindBuffer(l.PIXEL_PACK_BUFFER,i),l.bufferData(l.PIXEL_PACK_BUFFER,t*a*4,l.STREAM_READ),l.bindBuffer(l.PIXEL_PACK_BUFFER,null),o.diffusion={width:t,height:a,texture:e.engine.createTexture(t,a,{float:!1,filter:"nearest"}),pbo:i,data:new Uint8Array(t*a*4),rows:Array.from({length:9},()=>new Float32Array(t+Ee*2)),lutKey:r==null?void 0:r.lutKey,lut:r==null?void 0:r.lut},o.diffusion}const Oo={id:"dither",name:"Dither",category:"print",description:"Error diffusion, ordered, halftone and line dithers in classic computer and console palettes.",animated:!0,animates:e=>e.motion>0,preview:{params:{pattern:"floyd",palette:"c64",pixel:2.5}},params:[{key:"pattern",label:"Pattern",type:"select",default:"blue",options:[{value:"floyd",label:"Floyd–Steinberg"},{value:"atkinson",label:"Atkinson"},{value:"blue",label:"Blue noise"},{value:"bayer2",label:"Bayer 2×2"},{value:"bayer4",label:"Bayer 4×4"},{value:"bayer8",label:"Bayer 8×8"},{value:"clustered",label:"Halftone"},{value:"lines",label:"Lines"},{value:"diagonal",label:"Diagonal lines"},{value:"noise",label:"Ruído"}]},{key:"palette",label:"Palette",type:"select",default:"custom",options:[{value:"custom",label:"Personalizado"},{value:"levels",label:"Image colors"},{value:"gray",label:"Grayscale"},{value:"mac",label:"1-bit"},{value:"gameboy",label:"Game Boy"},{value:"virtualboy",label:"Virtual Boy"},{value:"cga",label:"CGA"},{value:"ega",label:"EGA"},{value:"c64",label:"Commodore 64"},{value:"vic20",label:"Commodore VIC-20"},{value:"zx",label:"ZX Spectrum"},{value:"cpc",label:"Amstrad CPC"},{value:"msx",label:"MSX"},{value:"apple2",label:"Apple II"},{value:"nes",label:"NES"},{value:"teletext",label:"Teletext"},{value:"mac16",label:"Macintosh 16"},{value:"pico8",label:"PICO-8"},{value:"amber",label:"Amber screen"},{value:"phosphor",label:"Green screen"},{value:"neon",label:"Neon"},{value:"sepia",label:"Sepia"}]},{key:"colors",label:"Cores",type:"colors",min:2,max:8,default:["#111014","#f1ede4"],when:e=>e.palette==="custom"},{key:"match",label:"Match by",type:"select",default:"auto",options:[{value:"auto",label:"Auto"},{value:"brightness",label:"Brilho"},{value:"color",label:"Cor"}],when:e=>e.palette!=="levels"&&e.palette!=="gray"},{key:"levels",label:"Levels",type:"number",min:2,max:16,step:1,default:3,when:e=>e.palette==="levels"||e.palette==="gray"},{key:"pixel",label:"Pixel size",type:"number",min:.5,max:16,step:.5,default:1.5},{key:"spread",label:"Amount",type:"number",min:0,max:1.5,step:.01,default:1},{key:"contrast",label:"Contraste",type:"number",min:.4,max:2.5,step:.01,default:1.15},{key:"brightness",label:"Brilho",type:"number",min:-.5,max:.5,step:.01,default:0},{key:"motion",label:"Shimmer",type:"number",min:0,max:2,step:.01,default:0}],render(e,o,t,a){const l=e.shared("blue-noise",po),r=o.mipmapped?o:e.mipmap(o),i=Math.max(1,Math.round(t.pixel*e.unit)),n=Math.ceil(e.width/i),u=Math.ceil(e.height/i),c=it[t.pattern],s=t.palette==="levels",p=t.palette!=="gray"&&(t.match==="color"||t.match==="auto"&&!Do.has(t.palette)),f=Po(t).slice(0,Ce);let m=f.map(C);p||(m=m.slice().sort((D,F)=>Fe(D)[0]-Fe(F)[0]));const d=m.map(Fe),v=m.length,g=m.slice(),x=d.slice();for(;g.length<Ce;)g.push([0,0,0]),x.push([0,0,0]);const k=t.motion>0?Math.floor(e.time*12*t.motion):0,h={uFull:[e.width,e.height],uPixel:i,uPattern:Ro[t.pattern]??2,uSpread:t.spread,uContrast:t.contrast,uBrightness:t.brightness,uPalette:g,uLab:x,uCount:v,uLevels:s?t.levels:0,uMatch:p?1:0,uEncode:0,uOffset:k?[k*37%64+k*.618%1,k*23%64+k*.382%1]:[0,0]};if(c===void 0){if(i===1)return e.pass("dither-grid",qe,{input:r,textures:{uNoise:l.texture},uniforms:h});const D=e.pass("dither-grid",qe,{input:r,target:e.target(n,u,{float:!1,filter:"nearest"}),textures:{uNoise:l.texture},uniforms:h}),F=e.pass("dither-show",lt,{input:r,textures:{uGrid:D},uniforms:{uPixel:i}});return e.release(D),F}const b=e.pass("dither-grid",qe,{input:r,target:e.target(n,u,{float:!1,filter:"nearest"}),textures:{uNoise:l.texture},uniforms:{...h,uEncode:s?3:p?2:1}}),y=e.gl,S=No(e,a,n,u);y.bindFramebuffer(y.FRAMEBUFFER,b.fbo),y.bindBuffer(y.PIXEL_PACK_BUFFER,S.pbo),y.readPixels(0,0,n,u,y.RGBA,y.UNSIGNED_BYTE,0);const I=y.fenceSync(y.SYNC_GPU_COMMANDS_COMPLETE,0);y.flush(),y.clientWaitSync(I,y.SYNC_FLUSH_COMMANDS_BIT,0),y.getBufferSubData(y.PIXEL_PACK_BUFFER,0,S.data),y.deleteSync(I),y.bindBuffer(y.PIXEL_PACK_BUFFER,null),e.release(b),S.rows.forEach(D=>D.fill(0));const L=c===it.atkinson,M=new Uint8Array(m.flat().map(D=>Math.round(D*255))),A=Math.min(t.spread,1),z=Math.max(t.spread-1,0)*1.6+(t.motion>0?.35:0),P=k+1;if(s){const D=Math.max(Math.round(t.levels)-1,1);Bo(S.data,n,u,S.rows,L,{strength:A,jitter:z,seed:P,steps:D})}else if(p&&v>1){const D=f.join(",");S.lutKey!==D&&(S.lut=Go(d.flat(),v),S.lutKey=D),Fo(S.data,n,u,S.rows,L,{strength:A,jitter:z*.3,seed:P,lut:S.lut,lab:new Float32Array(d.flat()),bytes:M})}else qo(S.data,n,u,S.rows,L,{strength:A,jitter:z,seed:P,count:Math.max(v,1),bytes:M});return y.bindTexture(y.TEXTURE_2D,S.texture),y.pixelStorei(y.UNPACK_FLIP_Y_WEBGL,!1),y.pixelStorei(y.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),y.texSubImage2D(y.TEXTURE_2D,0,0,0,n,u,y.RGBA,y.UNSIGNED_BYTE,S.data),e.pass("dither-show",lt,{input:r,textures:{uGrid:S.texture},uniforms:{uPixel:i}})},dispose(e,o){o.diffusion&&(e.deleteTexture(o.diffusion.texture),e.deleteBuffer(o.diffusion.pbo)),o.diffusion=null}},ge=`
uniform vec2 uCell;
uniform vec2 uOrigin;
uniform vec2 uOffset;
uniform float uBond;
`,Ho=`
${ge}
uniform vec2 uImage;
uniform float uHex;

void main() {
  vec2 c = floor(gl_FragCoord.xy) - uOffset;
  vec2 center;
  vec2 extent;
  if (uHex > 0.5) {
    center = uOrigin + uCell.x * vec2(c.x + 0.5 * mod(c.y, 2.0), 0.8660254 * c.y);
    extent = vec2(uCell.x * 0.9);
  } else {
    center = uOrigin + (c + vec2(0.5 + uBond * mod(c.y, 2.0), 0.5)) * uCell;
    extent = uCell;
  }
  float lod = log2(max(min(extent.x, extent.y) * 0.25, 1.0));
  vec3 sum = vec3(0.0);
  for (int y = 0; y < 4; y++) {
    for (int x = 0; x < 4; x++) {
      vec2 o = (vec2(float(x), float(y)) + 0.5) * 0.25 - 0.5;
      sum += textureLod(uInput, clamp((center + o * extent) / uImage, 0.0, 1.0), lod).rgb;
    }
  }
  outColor = vec4(sum / 16.0, 1.0);
}`,Wo=`
${re}
uniform float uMode;
uniform vec3 uPalette[64];
uniform vec3 uLab[64];
uniform float uCount;
uniform float uLevels;
uniform float uDither;
uniform float uOutline;
uniform float uBoost;
uniform float uJitter;
uniform float uMono;
uniform vec3 uTint;
uniform float uSharp;
uniform float uChroma;

float bayer2(vec2 a) {
  a = floor(a);
  return fract(a.x / 2.0 + a.y * a.y * 0.75);
}

float bayer4(vec2 a) {
  return bayer2(0.5 * a) * 0.25 + bayer2(a);
}

vec3 fetchCell(vec2 c) {
  return texelFetch(uInput, ivec2(clamp(c, vec2(0.0), uResolution - 1.0)), 0).rgb;
}

vec3 nearest(vec3 color, float t) {
  vec3 w = vec3(1.0, uChroma, uChroma);
  vec3 lab = toOklab(color) * w;
  float best = 1e9;
  float second = 1e9;
  int ia = 0;
  int ib = 0;
  for (int i = 0; i < 64; i++) {
    if (float(i) >= uCount) break;
    vec3 d = lab - uLab[i] * w;
    float e = dot(d, d);
    if (e < best) {
      second = best;
      ib = ia;
      best = e;
      ia = i;
    } else if (e < second) {
      second = e;
      ib = i;
    }
  }
  if (uCount < 1.5) return uPalette[ia];
  vec3 a = uLab[ia] * w;
  vec3 ab = uLab[ib] * w - a;
  float f = clamp(dot(lab - a, ab) / max(dot(ab, ab), 1e-6), 0.0, 1.0);
  return f > t ? uPalette[ib] : uPalette[ia];
}

vec3 boost(vec3 c, float amount) {
  float l = luma(c);
  c = mix(vec3(l), c, 1.0 + 0.35 * amount);
  c = (c - 0.5) * (1.0 + 0.12 * amount) + 0.5;
  return clamp(c, 0.0, 1.0);
}

vec3 quantize(vec3 c, float t) {
  if (uLevels > 0.5) {
    float steps = max(uLevels - 1.0, 1.0);
    return clamp(floor(c * steps + t) / steps, 0.0, 1.0);
  }
  if (uCount > 0.5) return nearest(c, t);
  return c;
}

vec3 darker(vec3 c) {
  vec3 hsv = rgb2hsv(c);
  hsv.z *= 0.45;
  hsv.y = min(1.0, hsv.y * 1.2 + 0.1);
  return hsv2rgb(hsv);
}

void main() {
  vec2 cell = floor(gl_FragCoord.xy);
  vec3 c = fetchCell(cell);
  vec3 result = c;
  if (uMode < 0.5) {
    vec3 around = fetchCell(cell + vec2(1.0, 0.0)) + fetchCell(cell - vec2(1.0, 0.0));
    around += fetchCell(cell + vec2(0.0, 1.0)) + fetchCell(cell - vec2(0.0, 1.0));
    vec3 crisp = clamp(c + (c - around * 0.25) * uSharp, 0.0, 1.0);
    vec3 graded = boost(crisp, uBoost);
    float t = 0.5 + (bayer4(cell) + 0.03125 - 0.5) * uDither;
    result = quantize(graded, t);
    if (uOutline > 0.5) {
      float l0 = toOklab(c).x;
      float l1 = toOklab(fetchCell(cell + vec2(1.0, 0.0))).x;
      float l2 = toOklab(fetchCell(cell - vec2(1.0, 0.0))).x;
      float l3 = toOklab(fetchCell(cell + vec2(0.0, 1.0))).x;
      float l4 = toOklab(fetchCell(cell - vec2(0.0, 1.0))).x;
      float rise = max(max(l1, l2), max(l3, l4)) - l0;
      if (rise > 0.08) {
        vec3 line = uOutline < 1.5 ? darker(result) : vec3(0.05, 0.045, 0.06);
        result = (uLevels > 0.5 || uCount > 0.5) ? quantize(line, 0.5) : line;
      }
    }
  } else if (uMode < 1.5) {
    vec3 vivid = clamp(mix(vec3(luma(c)), c, 1.15), 0.0, 1.0);
    result = pow(vivid, vec3(1.1)) * 1.12;
    if (uMono > 0.5) {
      float v = mix(luma(c), autoLevel(luma(c)), 0.7);
      result = uTint * pow(clamp(v, 0.0, 1.0), 1.6) * 1.35;
    }
  } else if (uMode > 2.5 && uMode < 3.5) {
    vec3 h = hash32(cell * 1.31 + 7.0);
    vec3 hsv = rgb2hsv(boost(c, uBoost));
    hsv.z *= 1.0 + (h.x - 0.5) * 0.32 * uJitter;
    hsv.y = clamp(hsv.y * (1.0 + (h.y - 0.5) * 0.5 * uJitter), 0.0, 1.0);
    hsv.x = fract(hsv.x + (h.z - 0.5) * 0.04 * uJitter);
    result = hsv2rgb(hsv);
  } else if (uMode > 3.5) {
    vec3 graded = boost(c, uBoost);
    float t = 0.5 + (bayer4(cell) + 0.03125 - 0.5) * uDither;
    result = quantize(graded, t);
  }
  outColor = vec4(result, 1.0);
}`,jo=`
${ge}
uniform sampler2D uCells;
uniform float uGap;
uniform float uGlow;
uniform vec3 uBackground;

void main() {
  vec2 p = vUv * uResolution;
  vec2 q = (p - uOrigin) / uCell;
  vec2 c = floor(q);
  vec3 color = texelFetch(uCells, ivec2(c + uOffset), 0).rgb;
  if (uGap <= 0.0 && uGlow <= 0.0) {
    outColor = vec4(color, 1.0);
    return;
  }
  vec2 local = q - c - 0.5;
  float d = max(abs(local.x), abs(local.y));
  float edge = 0.5 - uGap * 0.5;
  float aa = 0.75 / uCell.x;
  float mask = uGap > 0.0 ? 1.0 - smoothstep(edge - aa, edge + aa, d) : 1.0;
  float halo = exp(-max(d - edge, 0.0) * mix(26.0, 5.0, uGlow)) * uGlow * (1.0 - mask);
  vec3 lit = color * (1.0 + uGlow * 0.25 * (1.0 - smoothstep(0.0, edge, d)));
  outColor = vec4(mix(uBackground + color * halo, lit, mask), 1.0);
}`,_o=`
${ge}
uniform sampler2D uCells;
uniform float uGap;
uniform float uGlow;
uniform vec3 uBackground;

vec2 hexCell(vec2 p) {
  vec2 r = vec2(1.0, 1.7320508);
  vec2 h = r * 0.5;
  vec2 a = mod(p, r) - h;
  vec2 b = mod(p - h, r) - h;
  return dot(a, a) < dot(b, b) ? a : b;
}

void main() {
  vec2 p = vUv * uResolution;
  vec2 q = (p - uOrigin) / uCell.x;
  vec2 g = hexCell(q);
  vec2 center = q - g;
  float j = floor(center.y / 0.8660254 + 0.5);
  float i = floor(center.x - 0.5 * mod(j, 2.0) + 0.5);
  vec3 color = texelFetch(uCells, ivec2(vec2(i, j) + uOffset), 0).rgb;
  if (uGap <= 0.0 && uGlow <= 0.0) {
    outColor = vec4(color, 1.0);
    return;
  }
  float d = max(dot(abs(g), vec2(0.5, 0.8660254)), abs(g.x));
  float edge = 0.5 - uGap * 0.5;
  float aa = 0.75 / uCell.x;
  float mask = uGap > 0.0 ? 1.0 - smoothstep(edge - aa, edge + aa, d) : 1.0;
  float halo = exp(-max(d - edge, 0.0) * mix(26.0, 5.0, uGlow)) * uGlow * (1.0 - mask);
  vec3 lit = color * (1.0 + uGlow * 0.25 * (1.0 - smoothstep(0.0, edge, d)));
  outColor = vec4(mix(uBackground + color * halo, lit, mask), 1.0);
}`,Ye=`
const vec3 LIGHT = vec3(-0.48, 0.56, 0.675);

float sdBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

vec2 sdBoxGrad(vec2 p, vec2 b, float r) {
  vec2 w = abs(p) - b + r;
  vec2 s = vec2(p.x < 0.0 ? -1.0 : 1.0, p.y < 0.0 ? -1.0 : 1.0);
  vec2 g = max(w.x, w.y) > 0.0 ? normalize(max(w, 0.0)) : (w.x > w.y ? vec2(1.0, 0.0) : vec2(0.0, 1.0));
  return s * g;
}

float lambert(vec3 n) {
  return dot(n, LIGHT) / LIGHT.z;
}

float gloss(vec3 n, float power) {
  vec3 h = normalize(LIGHT + vec3(0.0, 0.0, 1.0));
  return pow(max(dot(n, h), 0.0), power);
}
`,$o=`
${ge}
${Ye}
uniform sampler2D uCells;
uniform vec3 uGrout;
uniform float uGroutWidth;
uniform float uBevel;
uniform float uIrregular;
uniform float uJitter;

void main() {
  vec2 p = vUv * uResolution;
  vec2 q = (p - uOrigin) / uCell;
  float row = floor(q.y);
  q.x -= uBond * mod(row, 2.0);
  vec2 c = vec2(floor(q.x), row);
  vec2 local = (fract(q) - 0.5) * uCell;
  vec3 color = texelFetch(uCells, ivec2(c + uOffset), 0).rgb;

  vec4 h = vec4(hash32(c + 3.7), hash12(c * 1.7 + 11.0));
  float angle = (h.x - 0.5) * 0.2 * uIrregular;
  vec2 shift = (h.yz - 0.5) * min(uCell.x, uCell.y) * 0.07 * uIrregular;
  vec2 halfSize = max(uCell * 0.5 - uGroutWidth * 0.5, vec2(0.5));
  float cs = abs(cos(angle));
  float sn = abs(sin(angle));
  vec2 bound = vec2(halfSize.x * cs + halfSize.y * sn, halfSize.x * sn + halfSize.y * cs);
  vec2 room = uCell * 0.5 - abs(shift) - uGroutWidth * 0.2 * uIrregular;
  vec2 fit = room / max(bound, vec2(1e-3));
  halfSize *= clamp(min(fit.x, fit.y), 0.5, 1.0) * (1.0 - h.w * 0.06 * uIrregular);

  mat2 spin = rotation(angle);
  vec2 lp = spin * (local - shift);
  float radius = min(halfSize.x, halfSize.y) * mix(0.12, 0.3, uIrregular);
  float sd = sdBox(lp, halfSize, radius);
  vec2 grad = sdBoxGrad(lp, halfSize, radius) * spin;

  float inside = -sd;
  float width = max(min(halfSize.x, halfSize.y) * 0.42, 1.0);
  float tilt = 1.0 - smoothstep(0.0, width, inside);
  tilt *= tilt;
  vec3 n = normalize(vec3(grad * tilt * 1.4 * uBevel, 1.0));
  float shade = 1.0 + (lambert(n) - 1.0) * 0.5;
  vec2 tone = (h.zx - 0.5) * 2.0;
  float glaze = 1.0 + dot(lp / max(halfSize, vec2(1.0)), tone) * 0.05 * uJitter;
  vec3 tile = color * shade * glaze;
  tile += gloss(n, 40.0) * 0.2 * uBevel * smoothstep(0.0, 1.0, tilt);
  tile *= 1.0 - 0.18 * uBevel * smoothstep(1.5, -0.5, inside);

  float occlusion = smoothstep(-0.5, max(uGroutWidth * 0.6, 1.0), sd);
  vec3 grout = uGrout * mix(0.62, 1.0, occlusion);
  float mask = clamp(0.5 - sd, 0.0, 1.0);
  outColor = vec4(clamp(mix(grout, tile, mask), 0.0, 1.0), 1.0);
}`,Vo=`
${ge}
${Ye}
uniform sampler2D uCells;
uniform float uPiece;
uniform float uRelief;
uniform vec3 uBackground;

void main() {
  vec2 p = vUv * uResolution;
  vec2 q = (p - uOrigin) / uCell;
  vec2 c = floor(q);
  vec2 l = q - c - 0.5;
  vec3 color = texelFetch(uCells, ivec2(c + uOffset), 0).rgb;
  float px = 1.0 / uCell.x;
  float relief = uRelief;

  float seam = max(0.012, px * 0.5);
  float plateSd;
  vec2 plateGrad;
  if (uPiece > 0.5 && uPiece < 1.5) {
    float r = 0.5 - seam;
    plateSd = length(l) - r;
    plateGrad = normalize(l + 1e-5);
  } else {
    plateSd = sdBox(l, vec2(0.5 - seam), 0.05);
    plateGrad = sdBoxGrad(l, vec2(0.5 - seam), 0.05);
  }
  float edgeTilt = 1.0 - smoothstep(0.0, 0.07, -plateSd);
  vec3 n = normalize(vec3(plateGrad * edgeTilt * 1.6 * relief, 1.0));
  vec3 plastic = color * (1.0 + (lambert(n) - 1.0) * 0.5);
  plastic += gloss(n, 24.0) * 0.18 * relief;

  if (uPiece < 1.5) {
    float r = 0.3;
    float d = length(l);
    vec2 sh = l - vec2(0.075, -0.085) * (0.4 + relief);
    float shadow = 1.0 - smoothstep(r - 0.06, r + 0.1, length(sh));
    plastic *= 1.0 - shadow * 0.42 * relief * smoothstep(r - px, r + px, d);
    float rim = smoothstep(r - 0.09, r, d);
    vec2 dir = l / max(d, 1e-4);
    vec3 sn = normalize(vec3(dir * rim * 1.7 * relief, 1.0));
    vec3 stud = color * (1.0 + (lambert(sn) - 1.0) * 0.55) * (1.0 + 0.05 * relief);
    stud += gloss(sn, 18.0) * 0.4 * relief;
    float ring = smoothstep(r - 0.12, r - 0.05, d) * (1.0 - smoothstep(r - 0.05, r - 0.01, d));
    stud *= 1.0 - ring * 0.06 * relief;
    float studMask = 1.0 - smoothstep(r - px, r + px, d);
    plastic = mix(plastic, stud, studMask);
  } else {
    plastic *= 1.0 + (l.y - l.x) * 0.08 * relief;
    plastic += gloss(normalize(vec3(-l * 0.5, 1.0)), 60.0) * 0.08 * relief;
  }

  vec3 gap = uPiece > 0.5 && uPiece < 1.5 ? uBackground : color * (1.0 - 0.3 * relief);
  float mask = clamp(0.5 - plateSd / px, 0.0, 1.0);
  outColor = vec4(clamp(mix(gap, plastic, mask), 0.0, 1.0), 1.0);
}`,Xo=`
${ge}
${Ye}
uniform sampler2D uCells;
uniform vec2 uGrid;
uniform float uType;
uniform float uGap;
uniform float uGlow;
uniform vec3 uBackground;

vec3 cellAt(vec2 c) {
  return texelFetch(uCells, ivec2(clamp(c + uOffset, vec2(0.0), uGrid - 1.0)), 0).rgb;
}

vec3 softClip(vec3 x) {
  float m = max(max(x.r, x.g), x.b);
  if (m <= 0.8) return x;
  float t = 0.8 + 0.2 * (1.0 - exp(-(m - 0.8) * 5.0));
  return mix(x * (t / m), min(x, vec3(1.0)), 0.3);
}

vec3 lens(vec2 l, float r, float px, vec3 board, vec3 color, out float cover) {
  float d = length(l);
  cover = 1.0 - smoothstep(r - px, r + px, d);
  float dome = sqrt(max(1.0 - (d * d) / (r * r), 0.0));
  vec3 n = normalize(vec3(l / r * 0.85, dome + 0.2));
  vec3 body = board + vec3(0.028) * dome + gloss(n, 34.0) * 0.07;
  return body + color * (0.62 + 0.62 * dome * dome);
}

void main() {
  vec2 p = vUv * uResolution;
  vec2 q = (p - uOrigin) / uCell;
  vec2 c = floor(q);
  vec2 l = q - c - 0.5;
  float px = 1.0 / uCell.x;
  vec3 color = cellAt(c);
  float r = max(0.5 - uGap * 0.5, px);
  vec3 board = uBackground;
  vec3 result = board;
  float core = r;
  float reach = 1.0;
  float cover = 0.0;

  if (uType < 0.5) {
    vec3 lit = lens(l, r, px, board, color, cover);
    result = mix(board, lit, cover);
  } else if (uType < 1.5) {
    float s = r * 0.8;
    float housingSd = sdBox(l, vec2(min(r * 0.98 + 0.04, 0.5)), 0.03);
    float sd = sdBox(l, vec2(s), s * 0.3);
    cover = 1.0 - smoothstep(-px, px, sd);
    float frame = 1.0 - smoothstep(-px, px, housingSd);
    vec3 housing = mix(board, board * 1.5 + vec3(0.02), frame);
    float plateau = 0.86 + 0.24 * smoothstep(0.0, s * 0.9, -sd);
    vec3 emit = housing + vec3(0.02) + color * plateau;
    result = mix(housing, emit, cover);
    core = s;
  } else if (uType < 2.5) {
    float rs = r * 0.47;
    vec3 sum = board;
    for (int k = 0; k < 3; k++) {
      float a = float(k) * 2.0943951 + 2.6179939;
      vec2 o = l - vec2(cos(a), sin(a)) * r * 0.54;
      vec3 primary = k == 0 ? vec3(1.0, 0.12, 0.08) : (k == 1 ? vec3(0.1, 1.0, 0.3) : vec3(0.16, 0.3, 1.0));
      float level = k == 0 ? color.r : (k == 1 ? color.g : color.b);
      float m;
      vec3 lit = lens(o, rs, px, vec3(0.0), mix(primary * level * 3.0, color * 1.3, 0.22), m);
      sum = mix(sum, board + lit, m);
      cover += m;
    }
    result = sum;
    core = r * 0.8;
  } else {
    float rb = r * 0.88;
    float d = length(l);
    float socket = 1.0 - smoothstep(rb + 0.05 - px, rb + 0.05 + px, d);
    float socketRing = smoothstep(rb - px, rb + px, d) * socket;
    cover = 1.0 - smoothstep(rb - px, rb + px, d);
    float dome = sqrt(max(1.0 - (d * d) / (rb * rb), 0.0));
    float level = max(max(color.r, color.g), color.b);
    float filament = exp(-d * d / (rb * rb * 0.08));
    vec3 warm = mix(color, vec3(luma(color)) * vec3(1.2, 0.84, 0.48), 0.65);
    vec3 n = normalize(vec3(l / rb * 0.9, dome + 0.12));
    vec3 glass = board + vec3(0.075, 0.068, 0.06) * dome + gloss(n, 28.0) * 0.22;
    vec3 emit = warm * (0.5 + 0.7 * dome) + vec3(1.0, 0.92, 0.78) * filament * level * 0.7;
    float side = 0.5 + 0.5 * dot(normalize(l + 1e-5), normalize(LIGHT.xy));
    vec3 metal = board * 2.4 + vec3(0.035) + vec3(0.06) * side;
    result = mix(board, metal, socketRing);
    result = mix(result, glass + emit, cover);
    core = rb;
    reach = 1.35;
  }

  if (uGlow > 0.0) {
    float tight = mix(0.03, 0.11, uGlow) * reach;
    float soft = mix(0.08, 0.34, uGlow) * reach;
    vec3 halo = vec3(0.0);
    for (int y = -1; y <= 1; y++) {
      for (int x = -1; x <= 1; x++) {
        vec2 o = vec2(float(x), float(y));
        float dist = max(length(l - o) - core, 0.0);
        halo += cellAt(c + o) * (0.55 * exp(-dist / tight) + 0.3 * exp(-dist * dist / (2.0 * soft * soft)));
      }
    }
    vec3 wide = textureLod(uCells, (q + uOffset) / uGrid, 1.5).rgb;
    result += (halo * 0.66 + wide * 0.3 * uGlow) * uGlow * (1.0 - cover * 0.35);
  }
  outColor = vec4(softClip(result), 1.0);
}`,Yo={square:0,round:1,hex:2,mosaic:3,brick:4},Ko={square:1,round:1,hex:1,mosaic:1.8,brick:1.8},nt={square:[1,1,0],wide:[1.4,.7,0],tall:[.7,1.4,0],offset:[1.4,.7,.5]},Zo={plate:0,round:1,tile:2},Jo={round:0,smd:1,rgb:2,bulb:3},Qo={none:0,shaded:1,black:2},ut={gameboy:["#0f380f","#306230","#8bac0f","#9bbc0f"],cga:["#000000","#55ffff","#ff55ff","#ffffff"],c64:["#000000","#ffffff","#880000","#aaffee","#cc44cc","#00cc55","#0000aa","#eeee77","#dd8855","#664400","#ff7777","#333333","#777777","#aaff66","#0088ff","#bbbbbb"],nes:["#7c7c7c","#0000fc","#0000bc","#4428bc","#940084","#a80020","#a81000","#881400","#503000","#007800","#006800","#005800","#004058","#000000","#bcbcbc","#0078f8","#0058f8","#6844fc","#d800cc","#e40058","#f83800","#e45c10","#ac7c00","#00b800","#00a800","#00a844","#008888","#f8f8f8","#3cbcfc","#6888fc","#9878f8","#f878f8","#f85898","#f87858","#fca044","#f8b800","#b8f818","#58d854","#58f898","#00e8d8","#787878","#a4e4fc","#b8b8f8","#d8b8f8","#f8b8f8","#f8a4c0","#f0d0b0","#fce0a8","#f8d878","#d8f878","#b8f8b8","#b8f8d8","#00fcfc","#f8d8f8"],pico8:["#000000","#1d2b53","#7e2553","#008751","#ab5236","#5f574f","#c2c3c7","#fff1e8","#ff004d","#ffa300","#ffec27","#00e436","#29adff","#83769c","#ff77a8","#ffccaa"],sweetie16:["#1a1c2c","#5d275d","#b13e53","#ef7d57","#ffcd75","#a7f070","#38b764","#257179","#29366f","#3b5dc9","#41a6f6","#73eff7","#f4f4f4","#94b0c2","#566c86","#333c57"],endesga32:["#be4a2f","#d77643","#ead4aa","#e4a672","#b86f50","#733e39","#3e2731","#a22633","#e43b44","#f77622","#feae34","#fee761","#63c74d","#3e8948","#265c42","#193c3e","#124e89","#0099db","#2ce8f5","#ffffff","#c0cbdc","#8b9bb4","#5a6988","#3a4466","#262b44","#181425","#ff0044","#68386c","#b55088","#f6757a","#e8b796","#c28569"],resurrect64:["#2e222f","#3e3546","#625565","#966c6c","#ab947a","#694f62","#7f708a","#9babb2","#c7dcd0","#ffffff","#6e2727","#b33831","#ea4f36","#f57d4a","#ae2334","#e83b3b","#fb6b1d","#f79617","#f9c22b","#7a3045","#9e4539","#cd683d","#e6904e","#fbb954","#4c3e24","#676633","#a2a947","#d5e04b","#fbff86","#165a4c","#239063","#1ebc73","#91db69","#cddf6c","#313638","#374e4a","#547e64","#92a984","#b2ba90","#0b5e65","#0b8a8f","#0eaf9b","#30e1b9","#8ff8e2","#323353","#484a77","#4d65b4","#4d9be6","#8fd3ff","#45293f","#6b3e75","#905ea9","#a884f3","#eaaded","#753c54","#a24b6f","#cf657f","#ed8099","#831c5d","#c32454","#f04f78","#f68181","#fca790","#fdcbb0"]},ea=["#f2f3f2","#a0a5a9","#6c6e68","#575857","#1e2124","#c91a09","#720e0f","#fe8a18","#f8bb3d","#f2cd37","#fff03a","#e4cd9e","#958a73","#f6d7b3","#d09168","#aa7d55","#582a12","#bbe90b","#dfeea5","#4b9f4a","#237841","#184632","#a0bcac","#36aebf","#078bc9","#9fc3e9","#5a93db","#0055bf","#0a3463","#6074a1","#adc3c0","#ff698f","#e4adc8","#c870a0","#923978","#ac78ba","#3f3691","#a95500"],ta=e=>{const o=e.map(r=>Math.max(r,0)**2.2),t=Math.cbrt(.4122214708*o[0]+.5363325363*o[1]+.0514459929*o[2]),a=Math.cbrt(.2119034982*o[0]+.6806995451*o[1]+.1073969566*o[2]),l=Math.cbrt(.0883024619*o[0]+.2817188376*o[1]+.6299787005*o[2]);return[.2104542553*t+.793617785*a-.0040720468*l,1.9779984951*t-2.428592205*a+.4505937099*l,.0259040371*t+.7827717662*a-.808675766*l]},Be=e=>{const o=e.slice(0,64).map(C),t=o.map(ta),a=o.length;for(;o.length<64;)o.push([0,0,0]),t.push([0,0,0]);return{uPalette:o,uLab:t,uCount:a}},Ge=e=>e==="square"||e==="hex",oa={id:"pixel",name:"Pixel",category:"pixel",description:"Pixel art, mosaic tiles, toy bricks, a honeycomb or a glowing LED sign.",animated:!1,params:[{key:"shape",label:"Style",type:"select",default:"square",options:[{value:"square",label:"Pixel art"},{value:"mosaic",label:"Tiles"},{value:"brick",label:"Bricks"},{value:"hex",label:"Hexagons"},{value:"round",label:"LED"}]},{key:"size",label:"Tamanho",type:"number",min:2,max:60,step:.5,default:10},{key:"palette",label:"Palette",type:"select",default:"resurrect64",options:[{value:"none",label:"Full color"},{value:"levels",label:"Levels"},{value:"resurrect64",label:"Resurrect 64"},{value:"endesga32",label:"Endesga 32"},{value:"sweetie16",label:"Sweetie 16"},{value:"pico8",label:"PICO-8"},{value:"nes",label:"NES"},{value:"c64",label:"C64"},{value:"gameboy",label:"Game Boy"},{value:"cga",label:"CGA"},{value:"custom",label:"Personalizado"}],when:e=>e.shape==="square"},{key:"colors",label:"Cores",type:"colors",min:2,max:16,default:["#1a1c2c","#3b5dc9","#41a6f6","#ef7d57","#ffcd75","#f4f4f4"],when:e=>e.shape==="square"&&e.palette==="custom"},{key:"levels",label:"Levels",type:"number",min:2,max:8,step:1,default:4,when:e=>e.shape==="square"&&e.palette==="levels"},{key:"dither",label:"Dither",type:"number",min:0,max:1,step:.01,default:0,when:e=>e.shape==="square"&&e.palette!=="none"||e.shape==="brick"&&e.brickColors!=="photo"},{key:"outline",label:"Outline",type:"select",default:"none",options:[{value:"none",label:"None"},{value:"shaded",label:"Shaded"},{value:"black",label:"Black"}],when:e=>e.shape==="square"},{key:"tile",label:"Tile shape",type:"select",default:"square",options:[{value:"square",label:"Square"},{value:"wide",label:"Wide"},{value:"tall",label:"Tall"},{value:"offset",label:"Offset rows"}],when:e=>e.shape==="mosaic"},{key:"grout",label:"Grout",type:"number",min:0,max:.4,step:.01,default:.08,when:e=>e.shape==="mosaic"},{key:"groutColor",label:"Grout color",type:"color",default:"#c9c4ba",when:e=>e.shape==="mosaic"},{key:"bevel",label:"Bevel",type:"number",min:0,max:1,step:.01,default:.45,when:e=>e.shape==="mosaic"},{key:"irregular",label:"Hand laid",type:"number",min:0,max:1,step:.01,default:.25,when:e=>e.shape==="mosaic"},{key:"jitter",label:"Color variation",type:"number",min:0,max:1,step:.01,default:.35,when:e=>e.shape==="mosaic"},{key:"piece",label:"Piece",type:"select",default:"plate",options:[{value:"plate",label:"Studded"},{value:"round",label:"Round"},{value:"tile",label:"Flat"}],when:e=>e.shape==="brick"},{key:"brickColors",label:"Cores",type:"select",default:"toy",options:[{value:"toy",label:"Brick palette"},{value:"photo",label:"Photo colors"}],when:e=>e.shape==="brick"},{key:"relief",label:"Relief",type:"number",min:0,max:1,step:.01,default:.6,when:e=>e.shape==="brick"},{key:"led",label:"Bulb",type:"select",default:"round",options:[{value:"round",label:"Round"},{value:"smd",label:"SMD"},{value:"rgb",label:"RGB"},{value:"bulb",label:"Marquee"}],when:e=>e.shape==="round"},{key:"mono",label:"Single color",type:"boolean",default:!1,when:e=>e.shape==="round"},{key:"ledColor",label:"LED color",type:"color",default:"#ffa23a",when:e=>e.shape==="round"&&e.mono},{key:"gap",label:"Gap",type:"number",min:0,max:.8,step:.01,default:0,when:e=>Ge(e.shape)||e.shape==="round"},{key:"glow",label:"Glow",type:"number",min:0,max:1,step:.01,default:0,when:e=>e.shape==="round"||Ge(e.shape)&&e.gap>0},{key:"background",label:"Fundo",type:"color",default:"#0a090d",when:e=>e.shape==="round"||Ge(e.shape)&&e.gap>0||e.shape==="brick"&&e.piece==="round"}],render(e,o,t){var I;const a=o.mipmapped?o:e.mipmap(o),l=Yo[t.shape]===void 0?"square":t.shape,r=Math.max(1,(t.size??10)*e.unit*Ko[l]),i=l==="hex",n=nt[t.tile]||nt.square,u=l==="mosaic"?[r*n[0],r*n[1]]:i?[r,r*.8660254]:[r,r],c=l==="mosaic"?n[2]:0,s=[e.width/2,e.height/2],p=[Math.ceil(e.width/(2*u[0]))+2,Math.ceil(e.height/(2*u[1]))+2],f=[p[0]*2+1,p[1]*2+1],m={uCell:u,uOrigin:s,uOffset:p,uBond:c},d=e.pass("pixel-average",Ho,{input:a,target:e.target(f[0],f[1]),uniforms:{...m,uCell:i?[r,r]:u,uImage:[e.width,e.height],uHex:i?1:0}});let v=0,g={uCount:0},x=0;l==="square"?t.palette==="levels"?x=t.levels??4:t.palette==="custom"?g=Be((I=t.colors)!=null&&I.length?t.colors:["#000000","#ffffff"]):ut[t.palette]&&(g=Be(ut[t.palette])):l==="round"?v=1:l==="mosaic"?v=3:l==="brick"&&(v=4,t.brickColors!=="photo"&&(g=Be(ea)));const k=x>0||g.uCount>0,h=l==="round"&&t.mono?J(e,o):null,b=i?d:e.pass("pixel-cells",Wo,{input:d,target:e.target(f[0],f[1]),textures:h?{uStats:h.target}:{},uniforms:{uStatsTop:h?h.top:0,uMode:v,uPalette:g.uPalette,uLab:g.uLab,uCount:g.uCount,uLevels:x,uDither:k?t.dither??0:0,uOutline:l==="square"?Qo[t.outline]??0:0,uBoost:l==="brick"?.35:k?.7:l==="mosaic"?.6:0,uSharp:l==="square"?.3:0,uChroma:l==="brick"?1.8:1,uJitter:t.jitter??.35,uMono:t.mono?1:0,uTint:C(t.ledColor||"#ffa23a")}});i||e.release(d),h&&e.release(h.target);const y=C(t.background);let S;return l==="mosaic"?S=e.pass("pixel-mosaic",$o,{input:a,textures:{uCells:b},uniforms:{...m,uGrout:C(t.groutColor||"#c9c4ba"),uGroutWidth:(t.grout??.08)*r,uBevel:t.bevel??.45,uIrregular:t.irregular??.25,uJitter:t.jitter??.35}}):l==="brick"?S=e.pass("pixel-brick",Vo,{input:a,textures:{uCells:b},uniforms:{...m,uPiece:Zo[t.piece]??0,uRelief:t.relief??.6,uBackground:y}}):l==="round"?(e.mipmap(b),S=e.pass("pixel-led",Xo,{input:a,textures:{uCells:b},uniforms:{...m,uGrid:f,uType:Jo[t.led]??0,uGap:t.gap,uGlow:t.glow,uBackground:y}})):S=e.pass(i?"pixel-hex":"pixel-square",i?_o:jo,{input:a,textures:{uCells:b},uniforms:{...m,uGap:t.gap,uGlow:t.glow,uBackground:y}}),e.release(b),S}},aa=`
uniform vec2 uGridMin;
uniform vec2 uImage;
uniform float uEdge;
uniform float uHeight;
uniform float uRelief;

vec3 area(vec2 center, float lod) {
  vec3 sum = vec3(0.0);
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 o = vec2(float(x), float(y)) * uEdge * 0.42;
      sum += textureLod(uInput, clamp((center + o) / uImage, 0.0, 1.0), lod).rgb;
    }
  }
  return sum / 9.0;
}

float rise(vec3 c) {
  float l = clamp(luma(c), 0.0, 1.0);
  return uRelief > 1.5 ? 1.0 - l : l;
}

void main() {
  vec2 cell = floor(gl_FragCoord.xy) + uGridMin;
  vec2 corner = vec2((cell.x - cell.y) * 0.8660254, -1.5 * (cell.x + cell.y) - 1.0);
  vec2 center = uImage * 0.5 + corner * uEdge;
  float lod = log2(max(uEdge * 0.5, 1.0));
  float n = 0.0;
  if (uRelief > 0.5 && uHeight > 0.0) {
    float guess = rise(area(center, lod + 1.0)) * uHeight;
    guess = rise(area(center + vec2(0.0, guess * uEdge), lod + 1.0)) * uHeight;
    n = floor(rise(area(center + vec2(0.0, guess * uEdge), lod)) * uHeight + 0.5);
  }
  vec3 color = area(center + vec2(0.0, n * uEdge), lod);
  outColor = vec4(color, n);
}`,la=`
uniform sampler2D uColumns;
uniform vec2 uGridMin;
uniform vec2 uGridSize;
uniform float uEdge;
uniform float uHeight;
uniform float uGap;
uniform vec3 uFaces;
uniform float uOutline;
uniform float uDepth;
uniform vec3 uBackground;

vec4 column(vec2 cell) {
  vec2 t = cell - uGridMin;
  if (t.x < 0.0 || t.y < 0.0 || t.x >= uGridSize.x || t.y >= uGridSize.y) return vec4(0.0, 0.0, 0.0, -1.0);
  return texelFetch(uColumns, ivec2(t), 0);
}

vec3 shadeRay(vec2 p) {
  float a = p.x * 0.57735027 - p.y;
  float b = -p.x * 0.57735027 - p.y;
  float z = (2.0 * p.y + uHeight) / 3.0 + 1.5;
  float zEnd = (2.0 * p.y - 1.0) / 3.0 - 1.5;
  vec2 xy = vec2(a, b) + z;
  vec2 cell = floor(xy);
  float g = uGap * 0.5;
  for (int k = 0; k < 160; k++) {
    if (z < zEnd) break;
    vec2 rem = xy - cell;
    float tExit = min(rem.x, rem.y);
    vec4 col = column(cell);
    if (col.a >= 0.0) {
      float base = -(cell.x + cell.y);
      float top = base + col.a;
      float tx0 = xy.x - (cell.x + 1.0 - g);
      float ty0 = xy.y - (cell.y + 1.0 - g);
      float tz0 = z - top;
      float tIn = max(max(tx0, ty0), max(tz0, 0.0));
      float tOut = min(min(xy.x - (cell.x + g), xy.y - (cell.y + g)), z - base + 1.0);
      if (tIn <= tOut && tIn <= tExit) {
        vec3 h = vec3(xy - tIn, z - tIn);
        vec2 f = h.xy - cell;
        float face;
        vec2 uv;
        if (tz0 >= max(tx0, ty0)) {
          face = 0.0;
          uv = f;
        } else if (tx0 >= ty0) {
          face = 2.0;
          uv = vec2(f.y, h.z);
        } else {
          face = 1.0;
          uv = vec2(f.x, h.z);
        }
        vec3 color = col.rgb * (face < 0.5 ? uFaces.x : (face < 1.5 ? uFaces.y : uFaces.z));
        if (face > 0.5) {
          float lift = clamp((h.z - base + 1.0) / max(col.a + 1.0, 1.0), 0.0, 1.0);
          color *= 1.0 - uDepth * (1.0 - lift) * 0.35;
        }
        if (uOutline > 0.0) {
          float across = min(uv.x - g, 1.0 - g - uv.x);
          float along = face < 0.5 ? min(uv.y - g, 1.0 - g - uv.y) : abs(fract(uv.y + 0.5) - 0.5);
          float d = min(across, along) * uEdge;
          float width = max(uEdge * 0.035, 0.45) * (0.6 + uOutline * 0.8);
          float line = 1.0 - smoothstep(width - 0.5, width + 0.5, d);
          color = mix(color, color * 0.18, line * min(uOutline * 1.4, 1.0));
        }
        return color;
      }
    }
    xy -= tExit;
    z -= tExit;
    if (rem.x <= rem.y) cell.x -= 1.0;
    else cell.y -= 1.0;
  }
  return uBackground;
}

void main() {
  vec2 p = vUv * uResolution - uResolution * 0.5;
  vec3 sum = shadeRay((p + vec2(-0.375, 0.125)) / uEdge);
  sum += shadeRay((p + vec2(0.125, 0.375)) / uEdge);
  sum += shadeRay((p + vec2(0.375, -0.125)) / uEdge);
  sum += shadeRay((p + vec2(-0.125, -0.375)) / uEdge);
  outColor = vec4(sum * 0.25, 1.0);
}`,st={left:[1,.72,.48],right:[1,.48,.72],top:[1,.6,.6],below:[.55,.9,.75]},ra={id:"voxel",name:"Voxels",category:"pixel",description:"The picture rebuilt from shaded isometric cubes, flat or stacked by brightness.",animated:!1,params:[{key:"size",label:"Cube size",type:"number",min:3,max:40,step:.5,default:9},{key:"relief",label:"Relief",type:"select",default:"brightness",options:[{value:"flat",label:"Flat"},{value:"brightness",label:"By brightness"},{value:"darkness",label:"By darkness"}]},{key:"height",label:"Altura",type:"number",min:1,max:12,step:1,default:3,when:e=>e.relief!=="flat"},{key:"light",label:"Claro",type:"select",default:"left",options:[{value:"left",label:"From the left"},{value:"right",label:"From the right"},{value:"top",label:"From above"},{value:"below",label:"From below"}]},{key:"shading",label:"Shading",type:"number",min:0,max:1,step:.01,default:.75},{key:"outline",label:"Outline",type:"number",min:0,max:1,step:.01,default:.15},{key:"gap",label:"Gap",type:"number",min:0,max:.6,step:.01,default:0},{key:"background",label:"Fundo",type:"color",default:"#0a090d",when:e=>e.gap>0}],render(e,o,t){const a=o.mipmapped?o:e.mipmap(o),l=Math.max(2,t.size*e.unit),r=t.relief==="darkness"?2:t.relief==="flat"?0:1,i=r?Math.max(0,Math.round(t.height)):0,n=e.width/l,u=e.height/l,c=n/Math.sqrt(3)/2+u/6,s=Math.floor(-c-3),f=Math.ceil(c+i/3+3)-s+1,m=e.pass("voxel-columns",aa,{input:a,target:e.target(f,f,{filter:"nearest"}),uniforms:{uGridMin:[s,s],uImage:[e.width,e.height],uEdge:l,uHeight:i,uRelief:r}}),d=Math.min(1,Math.max(0,t.shading)),v=(st[t.light]||st.left).map(x=>1+(x-1)*d),g=e.pass("voxel-march",la,{input:a,textures:{uColumns:m},uniforms:{uGridMin:[s,s],uGridSize:[f,f],uEdge:l,uHeight:i,uGap:t.gap,uFaces:v,uOutline:t.outline,uDepth:r&&i>0?d:0,uBackground:C(t.background)}});return e.release(m),g}},ia=`
uniform float uLevels;
uniform float uSmooth;
uniform float uSaturation;
uniform float uOutline;
uniform vec3 uLine;

float band(float v) {
  float x = v * uLevels;
  float base = floor(x);
  float f = fract(x);
  float edge = smoothstep(0.5 - 0.06, 0.5 + 0.06, f);
  return (base + edge) / uLevels;
}

void main() {
  float lod = uSmooth;
  vec3 color = textureLod(uInput, vUv, lod).rgb;
  float l = max(luma(color), 1e-4);
  float q = band(l);
  vec3 tinted = color * (q / l);
  vec3 hue = mix(vec3(luma(tinted)), tinted, uSaturation);
  vec3 result = clamp(hue, 0.0, 1.0);

  if (uOutline > 0.0) {
    vec2 t = 1.0 / uResolution * max(uUnit, 0.6);
    float tl = luma(textureLod(uInput, vUv + vec2(-t.x, t.y), lod).rgb);
    float tr = luma(textureLod(uInput, vUv + vec2(t.x, t.y), lod).rgb);
    float bl = luma(textureLod(uInput, vUv + vec2(-t.x, -t.y), lod).rgb);
    float br = luma(textureLod(uInput, vUv + vec2(t.x, -t.y), lod).rgb);
    float gx = (tr + br) - (tl + bl);
    float gy = (tl + tr) - (bl + br);
    float edge = smoothstep(0.12, 0.32, length(vec2(gx, gy)) * uOutline * 2.0);
    result = mix(result, uLine, edge);
  }
  outColor = vec4(result, 1.0);
}`,na={id:"posterize",name:"Posterize",category:"print",description:"Flat cel-shaded tones with optional outlines.",animated:!1,params:[{key:"levels",label:"Levels",type:"number",min:2,max:12,step:1,default:5},{key:"smooth",label:"Smoothing",type:"number",min:0,max:4,step:.1,default:1.2},{key:"saturation",label:"Saturação",type:"number",min:0,max:2,step:.01,default:1.15},{key:"outline",label:"Outline",type:"number",min:0,max:1,step:.01,default:.35},{key:"line",label:"Line color",type:"color",default:"#141217",when:e=>e.outline>0}],render(e,o,t){const a=o.mipmapped?o:e.mipmap(o);return e.pass("posterize",ia,{input:a,uniforms:{uLevels:t.levels,uSmooth:t.smooth*Math.max(.6,Math.log2(Math.max(e.unit,1))+1),uSaturation:t.saturation,uOutline:t.outline,uLine:C(t.line)}})}},ua=`
uniform sampler2D uSmall;
uniform sampler2D uLarge;
uniform float uTop;
uniform float uStrength;
uniform float uThreshold;
uniform float uSoftness;
uniform vec3 uInk;
uniform vec3 uPaper;
uniform float uColor;
uniform float uShading;
uniform float uSpacing;
uniform float uBoil;
uniform float uSeed;

float hatch(vec2 p, float angle, float darkness) {
  vec2 q = rotation(angle) * p / uSpacing;
  float wander = (valueNoise(vec2(q.x * 0.9, q.y * 0.045) + angle * 17.0 + uSeed) - 0.5) * 0.45;
  float d = abs(fract(q.x + wander) - 0.5) * 2.0;
  float width = 0.08 + clamp(darkness, 0.0, 1.0) * 0.62;
  float aa = fwidth(q.x) * 1.5;
  float line = 1.0 - smoothstep(width - aa, width + aa, d);
  float broken = smoothstep(0.18, 0.42, valueNoise(vec2(q.x * 3.1, q.y * 0.18) + angle * 5.0 + uSeed * 1.3) + darkness * 0.6);
  return line * smoothstep(0.0, 0.12, darkness) * broken;
}

void main() {
  vec2 p = vUv * uResolution;
  vec2 wobble = vec2(0.0);
  if (uBoil > 0.0) {
    vec2 n = vec2(valueNoise(p * 0.035 / max(uUnit, 0.3) + uSeed), valueNoise(p * 0.035 / max(uUnit, 0.3) + uSeed + 7.7)) - 0.5;
    wobble = n * uBoil * 3.0 * uUnit / uResolution;
  }
  float a = luma(texture(uSmall, vUv + wobble).rgb);
  float b = luma(texture(uLarge, vUv + wobble).rgb);
  float d = a - uStrength * b;
  float e = d >= -uThreshold ? 1.0 : 1.0 + tanh(uSoftness * (d + uThreshold));
  e = clamp(e, 0.0, 1.0);

  vec3 original = texture(uInput, vUv).rgb;
  if (uShading > 0.0) {
    float mean = luma(textureLod(uSmall, vec2(0.5), uTop).rgb);
    float tone = clamp(a + (0.5 - mean) * 0.85, 0.0, 1.0);
    vec2 hp = p + wobble * uResolution;
    float l1 = hatch(hp, 0.785, smoothstep(0.86, 0.3, tone) * uShading);
    float l2 = hatch(hp, -0.785, smoothstep(0.6, 0.12, tone) * uShading);
    float l3 = hatch(hp, 0.0, smoothstep(0.36, 0.0, tone) * uShading);
    e = min(e, 1.0 - max(max(l1, l2), l3) * 0.92);
  }
  vec3 paper = mix(uPaper, original * mix(vec3(1.0), uPaper, 0.15) * 1.08, uColor);
  outColor = vec4(mix(uInk, paper, e), 1.0);
}`,sa={id:"ink",name:"Ink",category:"art",description:"Turns the image into a pen drawing with optional hatching.",animated:!0,animates:e=>e.boil>0,params:[{key:"weight",label:"Line weight",type:"number",min:.3,max:4,step:.05,default:1.1},{key:"detail",label:"Detalhe",type:"number",min:0,max:1,step:.01,default:.55},{key:"softness",label:"Softness",type:"number",min:0,max:1,step:.01,default:.35},{key:"shading",label:"Hatching",type:"number",min:0,max:1,step:.01,default:.55},{key:"spacing",label:"Hatch spacing",type:"number",min:1,max:12,step:.1,default:3.2,when:e=>e.shading>0},{key:"ink",label:"Ink",type:"color",default:"#1b1a1f"},{key:"paper",label:"Paper",type:"color",default:"#f4f0e6"},{key:"color",label:"Keep color",type:"number",min:0,max:1,step:.01,default:0},{key:"boil",label:"Line boil",type:"number",min:0,max:1,step:.01,default:0}],render(e,o,t){const a=Math.max(.6,t.weight*e.unit*.9),l=e.mipmap(E(e,o,a)),r=E(e,o,a*1.6),i=t.boil>0?Math.floor(e.time*10)*3.17:0,n=e.pass("ink",ua,{input:o,textures:{uSmall:l,uLarge:r},uniforms:{uTop:Math.floor(Math.log2(Math.max(l.width,l.height))),uStrength:1,uThreshold:.0015+(1-t.detail)*.012,uSoftness:60+(1-t.softness)*500,uInk:C(t.ink),uPaper:C(t.paper),uColor:t.color,uShading:t.shading,uSpacing:Math.max(2,t.spacing*e.unit),uBoil:t.boil,uSeed:i}});return e.release(l),e.release(r),n}},ca=`
vec3 tap(vec2 offset) {
  return texture(uInput, vUv + offset / uResolution).rgb;
}

void main() {
  vec3 gx = (tap(vec2(1.0, -1.0)) + 2.0 * tap(vec2(1.0, 0.0)) + tap(vec2(1.0, 1.0))
    - tap(vec2(-1.0, -1.0)) - 2.0 * tap(vec2(-1.0, 0.0)) - tap(vec2(-1.0, 1.0))) * 0.25;
  vec3 gy = (tap(vec2(-1.0, 1.0)) + 2.0 * tap(vec2(0.0, 1.0)) + tap(vec2(1.0, 1.0))
    - tap(vec2(-1.0, -1.0)) - 2.0 * tap(vec2(0.0, -1.0)) - tap(vec2(1.0, -1.0))) * 0.25;
  outColor = vec4(dot(gx, gx), dot(gx, gy), dot(gy, gy), 1.0);
}`,ct=`
uniform vec2 uStep;

void main() {
  vec3 sum = texture(uInput, vUv).rgb * 0.2270270270;
  sum += (texture(uInput, vUv + uStep * 1.3846153846).rgb + texture(uInput, vUv - uStep * 1.3846153846).rgb) * 0.3162162162;
  sum += (texture(uInput, vUv + uStep * 3.2307692308).rgb + texture(uInput, vUv - uStep * 3.2307692308).rgb) * 0.0702702703;
  outColor = vec4(sum, 1.0);
}`,fa=`
uniform sampler2D uTensor;
uniform float uRadius;
uniform float uSharpness;
uniform float uFlow;

void main() {
  vec2 texel = 1.0 / uResolution;
  vec3 tensor = texture(uTensor, vUv).rgb;
  float e = tensor.x;
  float f = tensor.y;
  float g = tensor.z;
  float root = sqrt(max((e - g) * (e - g) + 4.0 * f * f, 0.0));
  float l1 = 0.5 * (e + g + root);
  float l2 = 0.5 * (e + g - root);
  vec2 dir = vec2(l1 - e, -f);
  dir = dot(dir, dir) > 1e-12 ? normalize(dir) : vec2(0.0, 1.0);
  float anisotropy = (l1 + l2) > 1e-7 ? (l1 - l2) / (l1 + l2) : 0.0;
  anisotropy *= uFlow;
  float alpha = 1.0;
  float a = uRadius * clamp((alpha + anisotropy) / alpha, 0.1, 2.0);
  float b = uRadius * clamp(alpha / (alpha + anisotropy), 0.1, 2.0);
  vec2 major = dir;
  vec2 minor = vec2(-dir.y, dir.x);
  float extentX = sqrt(a * a * major.x * major.x + b * b * minor.x * minor.x);
  float extentY = sqrt(a * a * major.y * major.y + b * b * minor.y * minor.y);
  float stride = max(1.0, max(a, b) / 5.5);

  vec3 m[8];
  vec3 s[8];
  float w[8];
  for (int k = 0; k < 8; k++) {
    m[k] = vec3(0.0);
    s[k] = vec3(0.0);
    w[k] = 0.0;
  }
  float zeta = 2.0 / 3.0;
  float eta = 0.95;
  for (float j = -extentY; j <= extentY; j += stride) {
    for (float i = -extentX; i <= extentX; i += stride) {
      vec2 d = vec2(i, j);
      vec2 v = vec2(dot(d, major) / a, dot(d, minor) / b);
      if (dot(v, v) > 1.0) continue;
      vec3 c = texture(uInput, vUv + d * texel).rgb;
      float wx[8];
      float sum = 0.0;
      float vxx = zeta - eta * v.x * v.x;
      float vyy = zeta - eta * v.y * v.y;
      float z = max(0.0, v.y + vxx); wx[0] = z * z; sum += wx[0];
      z = max(0.0, -v.x + vyy); wx[2] = z * z; sum += wx[2];
      z = max(0.0, -v.y + vxx); wx[4] = z * z; sum += wx[4];
      z = max(0.0, v.x + vyy); wx[6] = z * z; sum += wx[6];
      vec2 r = 0.70710678 * vec2(v.x - v.y, v.x + v.y);
      vxx = zeta - eta * r.x * r.x;
      vyy = zeta - eta * r.y * r.y;
      z = max(0.0, r.y + vxx); wx[1] = z * z; sum += wx[1];
      z = max(0.0, -r.x + vyy); wx[3] = z * z; sum += wx[3];
      z = max(0.0, -r.y + vxx); wx[5] = z * z; sum += wx[5];
      z = max(0.0, r.x + vyy); wx[7] = z * z; sum += wx[7];
      float gauss = exp(-3.125 * dot(v, v)) / max(sum, 1e-5);
      for (int k = 0; k < 8; k++) {
        float weight = wx[k] * gauss;
        m[k] += c * weight;
        s[k] += c * c * weight;
        w[k] += weight;
      }
    }
  }
  float sigma[8];
  float lowest = 1e9;
  for (int k = 0; k < 8; k++) {
    vec3 mean = m[k] / max(w[k], 1e-6);
    vec3 variance = abs(s[k] / max(w[k], 1e-6) - mean * mean);
    sigma[k] = variance.r + variance.g + variance.b;
    lowest = min(lowest, sigma[k]);
  }
  vec3 result = vec3(0.0);
  float total = 0.0;
  for (int k = 0; k < 8; k++) {
    vec3 mean = m[k] / max(w[k], 1e-6);
    float weight = 1.0 / (1.0 + pow(1000.0 * max(sigma[k] - lowest, 0.0) + 1.0, 0.5 * uSharpness));
    result += mean * weight;
    total += weight;
  }
  outColor = vec4(result / max(total, 1e-20), 1.0);
}`,ma=`
uniform sampler2D uTensor;
uniform float uSaturation;
uniform float uCanvas;
uniform float uLight;

void main() {
  vec3 color = texture(uInput, vUv).rgb;
  float gray = luma(color);
  color = mix(vec3(gray), color, uSaturation);
  vec2 p = vUv * uResolution / max(uUnit, 0.3);
  float weave = (valueNoise(p * vec2(0.9, 0.12)) + valueNoise(p * vec2(0.12, 0.9))) * 0.5;
  float fiber = valueNoise(p * 2.7) * 0.5 + valueNoise(p * 6.1) * 0.5;
  float canvas = mix(weave, fiber, 0.35) - 0.5;
  vec3 tensor = texture(uTensor, vUv).rgb;
  float root = sqrt(max((tensor.x - tensor.z) * (tensor.x - tensor.z) + 4.0 * tensor.y * tensor.y, 0.0));
  vec2 dir = vec2(0.5 * (tensor.x + tensor.z + root) - tensor.x, -tensor.y);
  dir = dot(dir, dir) > 1e-12 ? normalize(dir) : vec2(0.0, 1.0);
  float streak = valueNoise(vec2(dot(p, vec2(-dir.y, dir.x)) * 0.9, dot(p, dir) * 0.08)) - 0.5;
  vec2 t = 1.5 * uUnit / uResolution;
  float lx = luma(texture(uInput, vUv + vec2(t.x, 0.0)).rgb) - luma(texture(uInput, vUv - vec2(t.x, 0.0)).rgb);
  float ly = luma(texture(uInput, vUv + vec2(0.0, t.y)).rgb) - luma(texture(uInput, vUv - vec2(0.0, t.y)).rgb);
  float relief = (lx * 0.7 + ly * 0.7) * uLight * 3.0 + streak * uLight * 0.12;
  color *= 1.0 + canvas * uCanvas * 0.2 + relief;
  outColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}`;function Ke(e,o,{radius:t,flow:a,sharpness:l}){const r=Math.max(1,t*e.unit),i=Math.min(1,8/r),n=Math.max(1,Math.round(e.width*i)),u=Math.max(1,Math.round(e.height*i)),c=Math.max(1.5,r*i),s=e.pass("paint-tensor",ca,{input:o,target:e.target(n,u)}),p=e.pass("paint-smooth",ct,{input:s,target:e.target(n,u),uniforms:{uStep:[1.4/n,0]}});e.release(s);const f=e.pass("paint-smooth",ct,{input:p,target:e.target(n,u),uniforms:{uStep:[0,1.4/u]}});return e.release(p),{painted:e.pass("paint-kuwahara",fa,{input:o,target:e.target(n,u),textures:{uTensor:f},uniforms:{uRadius:c,uSharpness:l,uFlow:a}}),tensor:f}}const da={id:"paint",name:"Paint",category:"art",description:"Oil paint strokes that follow the shapes in the image.",animated:!1,params:[{key:"radius",label:"Brush",type:"number",min:1,max:20,step:.1,default:6},{key:"flow",label:"Stroke flow",type:"number",min:0,max:1,step:.01,default:.8},{key:"sharpness",label:"Sharpness",type:"number",min:2,max:18,step:.5,default:8},{key:"saturation",label:"Saturação",type:"number",min:0,max:2,step:.01,default:1.12},{key:"canvas",label:"Canvas",type:"number",min:0,max:1,step:.01,default:.35},{key:"light",label:"Impasto",type:"number",min:0,max:1,step:.01,default:.35}],render(e,o,t){const{painted:a,tensor:l}=Ke(e,o,t),r=e.pass("paint-finish",ma,{input:a,textures:{uTensor:l},uniforms:{uSaturation:t.saturation,uCanvas:t.canvas,uLight:t.light}});return e.release(a),e.release(l),r}},pa=`
uniform sampler2D uSoft;
uniform vec3 uPaper;
uniform float uEdges;
uniform float uGranulation;
uniform float uBleed;
uniform float uLightness;
uniform float uDrift;

float paperNoise(vec2 p) {
  return fbm(p * 0.35) * 0.6 + valueNoise(p * 1.7) * 0.4;
}

void main() {
  vec2 p = vUv * uResolution / max(uUnit, 0.3);
  vec2 bleed = vec2(fbm(p * 0.018 + uDrift), fbm(p * 0.018 + 17.3 - uDrift)) - 0.5;
  vec2 uv = vUv + bleed * uBleed * 14.0 * uUnit / uResolution;
  vec3 wash = toLinear(texture(uInput, uv).rgb);
  vec3 soft = toLinear(texture(uSoft, uv).rgb);

  vec3 paper = toLinear(uPaper);
  vec3 transmit = clamp(wash / max(paper, vec3(0.05)), 0.0, 1.0);
  vec3 density = -log(max(transmit, vec3(0.004)));
  density *= 1.0 - uLightness * 0.55;

  float rim = max(luma(soft) - luma(wash), 0.0);
  density *= 1.0 + smoothstep(0.0, 0.06, rim) * uEdges * 1.1;

  float grain = paperNoise(p);
  float turbulence = fbm(p * 0.01 + 3.7);
  density *= 1.0 + (grain - 0.5) * uGranulation * 1.4 + (turbulence - 0.5) * uGranulation * 0.6;

  vec3 color = paper * exp(-max(density, 0.0));
  float tooth = valueNoise(p * 2.3) - 0.5;
  color *= 1.0 + tooth * 0.05 * uGranulation;
  outColor = vec4(toGamma(color), 1.0);
}`,va={id:"watercolor",name:"Watercolor",category:"art",description:"Transparent washes with wet edges and pigment settling into the paper.",animated:!0,animates:e=>e.bleed>0&&e.speed>0,params:[{key:"radius",label:"Brush",type:"number",min:2,max:24,step:.1,default:9},{key:"edges",label:"Wet edges",type:"number",min:0,max:1,step:.01,default:.65},{key:"granulation",label:"Granulation",type:"number",min:0,max:1,step:.01,default:.5},{key:"bleed",label:"Bleed",type:"number",min:0,max:1,step:.01,default:.45},{key:"lightness",label:"Lightness",type:"number",min:0,max:1,step:.01,default:.35},{key:"paper",label:"Paper",type:"color",default:"#fbf7ee"},{key:"speed",label:"Flow",type:"number",min:0,max:2,step:.01,default:.3}],render(e,o,t){const{painted:a,tensor:l}=Ke(e,o,{radius:t.radius,flow:.7,sharpness:9});e.release(l);const r=E(e,a,Math.max(1,t.radius*e.unit*.6)),i=e.pass("watercolor-wash",pa,{input:a,textures:{uSoft:r},uniforms:{uPaper:C(t.paper),uEdges:t.edges,uGranulation:t.granulation,uBleed:t.bleed,uLightness:t.lightness,uDrift:e.time*t.speed*.05}});return e.release(a),e.release(r),i}},ha=`
uniform float uStyle;
uniform float uFrequency;
uniform float uAngle;
uniform float uRelief;
uniform float uWaviness;
uniform float uContrast;
uniform vec3 uInk;
uniform vec3 uPaper;

uint mxRotl(uint x, int k) {
  return (x << uint(k)) | (x >> uint(32 - k));
}

uint mxFinal(uint a, uint b, uint c) {
  c ^= b;
  c -= mxRotl(b, 14);
  a ^= c;
  a -= mxRotl(c, 11);
  b ^= a;
  b -= mxRotl(a, 25);
  c ^= b;
  c -= mxRotl(b, 16);
  a ^= c;
  a -= mxRotl(c, 4);
  b ^= a;
  b -= mxRotl(a, 14);
  c ^= b;
  c -= mxRotl(b, 24);
  return c;
}

uint mxHash(int x, int y) {
  uint seed = 0xdeadbeefu + 21u;
  return mxFinal(seed + uint(x), seed + uint(y), seed);
}

float mxGradient(uint hash, float x, float y) {
  uint h = hash & 7u;
  float u = h < 4u ? x : y;
  float v = 2.0 * (h < 4u ? y : x);
  return ((h & 1u) != 0u ? -u : u) + ((h & 2u) != 0u ? -v : v);
}

float mxNoise(vec2 p) {
  int x = int(floor(p.x));
  int y = int(floor(p.y));
  float fx = p.x - float(x);
  float fy = p.y - float(y);
  float u = fx * fx * fx * (fx * (fx * 6.0 - 15.0) + 10.0);
  float v = fy * fy * fy * (fy * (fy * 6.0 - 15.0) + 10.0);
  float a = mxGradient(mxHash(x, y), fx, fy);
  float b = mxGradient(mxHash(x + 1, y), fx - 1.0, fy);
  float c = mxGradient(mxHash(x, y + 1), fx, fy - 1.0);
  float d = mxGradient(mxHash(x + 1, y + 1), fx - 1.0, fy - 1.0);
  return 0.6616 * mix(mix(a, b, u), mix(c, d, u), v);
}

float pulse(float phase, float level, float footprint) {
  float reach = acos(clamp(mix(-1.15, 1.15, clamp(level, 0.0, 1.0)), -1.0, 1.0));
  float fp = clamp(footprint, 0.001, TAU);
  float w = phase - TAU * floor(phase / TAU + 0.5);
  float a = w - fp * 0.5;
  float b = w + fp * 0.5;
  float cover = max(0.0, min(b, reach) - max(a, -reach));
  cover += max(0.0, min(b, TAU + reach) - max(a, TAU - reach));
  cover += max(0.0, min(b, reach - TAU) - max(a, -reach - TAU));
  return clamp(cover / fp, 0.0, 1.0);
}

float plate(vec2 p, float angle, float frequency, float relief, float level, float footprint) {
  float a = radians(angle);
  float w = -p.x * sin(a) + p.y * cos(a);
  return pulse(w * frequency * TAU + relief, level, footprint * frequency);
}

float spiral(vec2 p, vec2 center, float frequency, float relief, float level, float footprint, float swing) {
  vec2 d = p - center;
  float r = length(d);
  float theta = atan(d.y, d.x);
  float turn = 1.0 / max(r * uResolution.y, 0.5);
  float fp = sqrt(footprint * frequency * footprint * frequency + turn * turn) + swing;
  return pulse((r * frequency - theta / TAU) * TAU + relief, level, fp);
}

void main() {
  vec3 color = toLinear(texture(uInput, vUv).rgb);
  float lum = dot(color, vec3(0.299, 0.587, 0.114));
  float level = clamp(0.5 + (lum - 0.5) * uContrast, 0.0, 1.0);

  float aspect = uResolution.x / uResolution.y;
  vec2 pa = vec2(vUv.x * aspect, vUv.y);
  vec2 meander = vec2(mxNoise(pa * 3.1), mxNoise(pa * 3.1 + vec2(7.31, 3.77)));
  vec2 p = pa + meander * uWaviness * 0.06;

  float relief = uRelief * level * 9.42;
  float swing = fwidth(relief);
  float footprint = TAU / max(uResolution.y, 1.0);

  float cover;
  if (uStyle > 1.5) {
    cover = spiral(p, vec2(0.5 * aspect, 0.5), uFrequency, relief, level, footprint, swing);
  } else if (uStyle > 0.5) {
    float first = plate(p, uAngle, uFrequency, relief, level, footprint + swing / uFrequency);
    float second = plate(p, uAngle + 72.0, uFrequency * 0.92, relief * 0.7, level / 0.55, footprint + swing * 0.7 / (uFrequency * 0.92));
    float third = plate(p, uAngle - 38.0, uFrequency * 1.13, relief * 0.5, level / 0.28, footprint + swing * 0.5 / (uFrequency * 1.13));
    cover = max(first, max(second, third));
  } else {
    cover = plate(p, uAngle, uFrequency, relief, level, footprint + swing / uFrequency);
  }

  vec3 result = mix(toLinear(uPaper), toLinear(uInk), cover);
  outColor = vec4(toGamma(result), 1.0);
}`,ga={line:0,crosshatch:1,spiral:2},ba={id:"engrave",name:"Engraving",category:"art",description:"Banknote line engraving whose lines swell in the shadows and climb over the form.",animated:!1,params:[{key:"style",label:"Style",type:"select",default:"crosshatch",options:[{value:"line",label:"Line"},{value:"crosshatch",label:"Cross-hatch"},{value:"spiral",label:"Spiral"}]},{key:"density",label:"Line density",type:"number",min:20,max:300,step:1,default:90},{key:"angle",label:"Ângulo",type:"number",min:0,max:180,step:1,default:8,when:e=>e.style!=="spiral"},{key:"relief",label:"Relief",type:"number",min:0,max:2,step:.01,default:.6},{key:"waviness",label:"Waviness",type:"number",min:0,max:1,step:.01,default:.35},{key:"smoothing",label:"Smoothing",type:"number",min:0,max:1,step:.01,default:.4},{key:"contrast",label:"Contraste",type:"number",min:.25,max:3,step:.01,default:1.15},{key:"ink",label:"Ink",type:"color",default:"#1a1410"},{key:"paper",label:"Paper",type:"color",default:"#f4eee2"}],render(e,o,t){const a=e.height/Math.max(t.density,1)*t.smoothing*.4,l=a>.3?E(e,o,a):null,r=e.pass("engrave",ha,{input:l||o,uniforms:{uStyle:ga[t.style]??1,uFrequency:t.density,uAngle:t.angle,uRelief:t.relief,uWaviness:t.waviness,uContrast:t.contrast,uInk:C(t.ink),uPaper:C(t.paper)}});return l&&e.release(l),r}},ya=`
uniform float uSpacing;
uniform float uSensitivity;
uniform float uHatch;
uniform float uShading;
uniform float uGrain;
uniform vec3 uBoard;
uniform vec3 uChalk;
uniform float uStyle;

const vec3 REC601 = vec3(0.299, 0.587, 0.114);

float tone(vec2 uv) {
  return dot(toLinear(texture(uInput, uv).rgb), REC601);
}

float hatchLine(vec2 p, float shade, float angle, float threshold) {
  vec2 q = rotation(angle) * p / uHatch;
  float wander = (valueNoise(vec2(q.x * 0.7, q.y * 0.05) + angle * 9.0) - 0.5) * 0.5;
  float d = abs(fract(q.x + wander) - 0.5) * 2.0;
  float amount = smoothstep(threshold, threshold + 0.3, shade);
  float width = 0.1 + amount * 0.28;
  float line = 1.0 - smoothstep(width * 0.5, width, d);
  float skip = smoothstep(0.3, 0.7, valueNoise(vec2(q.x * 2.3, q.y * 0.35) + angle * 3.0) + amount * 0.3);
  return line * amount * skip;
}

void main() {
  vec2 t = uSpacing / uResolution;
  float tl = tone(vUv + vec2(-t.x, -t.y));
  float tc = tone(vUv + vec2(0.0, -t.y));
  float tr = tone(vUv + vec2(t.x, -t.y));
  float ml = tone(vUv + vec2(-t.x, 0.0));
  float mr = tone(vUv + vec2(t.x, 0.0));
  float bl = tone(vUv + vec2(-t.x, t.y));
  float bc = tone(vUv + vec2(0.0, t.y));
  float br = tone(vUv + vec2(t.x, t.y));
  float gx = -tl - ml * 2.0 - bl + tr + mr * 2.0 + br;
  float gy = -tl - tc * 2.0 - tr + bl + bc * 2.0 + br;
  float high = mix(1.0, 0.08, uSensitivity);
  float edge = smoothstep(high * 0.4, high, sqrt(gx * gx + gy * gy));

  float level = tone(vUv);
  float board = dot(toLinear(uBoard), REC601);
  float span = dot(toLinear(uChalk), REC601) - board;
  float shade = abs(span) < 0.02 ? 1.0 - level : clamp((level - board) / span, 0.0, 1.0);
  vec2 p = vUv * uResolution / uUnit;
  float hatch;
  if (uStyle < 0.5) {
    vec2 r = rotation(0.42) * p;
    float streak = valueNoise(vec2(r.x * 0.045, r.y * 0.75)) * 0.65 + valueNoise(vec2(r.x * 0.11, r.y * 2.1)) * 0.35;
    float speck = valueNoise(p * 1.7) - 0.5;
    hatch = smoothstep(0.18, 0.9, shade * (0.5 + 0.6 * streak) + speck * 0.3);
  } else {
    hatch = max(max(hatchLine(p, shade, 0.785, 0.22), hatchLine(p, shade, -0.785, 0.5)), hatchLine(p, shade, 0.0, 0.78));
  }
  hatch *= uShading;

  float dust = mix(1.0 - uGrain, 1.0, valueNoise(p * 0.5) * 0.6 + valueNoise(p * 2.1) * 0.4);
  float mask = clamp(max(edge, hatch) * dust, 0.0, 1.0);
  vec3 surface = toLinear(uBoard) + (valueNoise(p * 0.9) - 0.5) * 0.04;
  vec3 color = mix(surface, toLinear(uChalk), mask);
  outColor = vec4(toGamma(color), 1.0);
}`,xa={id:"chalk",name:"Chalk",category:"art",description:"A chalk drawing on a blackboard, with dusty outlines and smudged or cross-hatched shading.",animated:!1,params:[{key:"board",label:"Board",type:"color",default:"#1f2a25"},{key:"chalk",label:"Chalk",type:"color",default:"#eceadb"},{key:"sensitivity",label:"Edge sensitivity",type:"number",min:0,max:1,step:.01,default:.6},{key:"thickness",label:"Stroke width",type:"number",min:.5,max:4,step:.1,default:1.5},{key:"shading",label:"Shading",type:"number",min:0,max:1,step:.01,default:.5},{key:"style",label:"Shading style",type:"select",default:"smudge",options:[{value:"smudge",label:"Smudged"},{value:"hatch",label:"Cross-hatched"}],when:e=>e.shading>0},{key:"spacing",label:"Hatch spacing",type:"number",min:3,max:24,step:.5,default:16,when:e=>e.shading>0&&e.style==="hatch"},{key:"grain",label:"Dust",type:"number",min:0,max:1,step:.01,default:.45}],render(e,o,t){return e.pass("chalk",ya,{input:o,uniforms:{uSpacing:t.thickness*e.unit,uSensitivity:t.sensitivity,uHatch:t.spacing,uShading:t.shading,uGrain:t.grain,uBoard:C(t.board),uChalk:C(t.chalk),uStyle:t.style==="hatch"?1:0}})}},ka=`
uniform sampler2D uImage;
uniform float uLevels;
uniform float uWidth;
uniform float uSoftness;
uniform float uGamma;
uniform float uInvert;
uniform float uFlat;
uniform float uImageLines;
uniform vec3 uLine;
uniform vec3 uFill;

float height(vec2 uv) {
  float value = dot(toLinear(texture(uInput, uv).rgb), LUMA);
  value = uInvert > 0.5 ? 1.0 - value : value;
  return pow(clamp(value, 0.0, 1.0), uGamma) * uLevels + 0.5;
}

void main() {
  vec3 image = texture(uImage, vUv).rgb;
  vec2 px = 1.5 / uResolution;
  float scaled = height(vUv);
  vec2 slope = vec2(
    height(vUv + vec2(px.x, 0.0)) - height(vUv - vec2(px.x, 0.0)),
    height(vUv + vec2(0.0, px.y)) - height(vUv - vec2(0.0, px.y))
  ) / 3.0;
  float dist = abs(fract(scaled + 0.5) - 0.5) / max(length(slope), 0.0001);
  float inner = uWidth * (1.0 - (uSoftness * 0.99 + 0.01));
  float lo = min(inner, uWidth - 0.5);
  float hi = max(uWidth + 0.5, lo + 0.001);
  float mask = 1.0 - smoothstep(lo, hi, dist);

  vec3 base = uFlat > 0.5 ? toLinear(uFill) : toLinear(image);
  vec3 line = uFlat > 0.5 && uImageLines > 0.5 ? toLinear(image) : toLinear(uLine);
  outColor = vec4(toGamma(mix(base, line, mask)), 1.0);
}`,wa={id:"contour",name:"Contours",category:"art",description:"Topographic contour lines traced through the brightness of the image.",animated:!1,params:[{key:"levels",label:"Levels",type:"number",min:2,max:30,step:1,default:8},{key:"width",label:"Line width",type:"number",min:.5,max:5,step:.1,default:1.5},{key:"softness",label:"Softness",type:"number",min:0,max:1,step:.01,default:0},{key:"balance",label:"Balance",type:"number",min:.1,max:2,step:.01,default:.5},{key:"smoothing",label:"Smoothing",type:"number",min:0,max:1,step:.01,default:.4},{key:"invert",label:"Invert",type:"boolean",default:!1},{key:"background",label:"Fundo",type:"select",default:"color",options:[{value:"color",label:"Flat color"},{value:"image",label:"Imagem"}]},{key:"fill",label:"Background color",type:"color",default:"#121212",when:e=>e.background==="color"},{key:"lineMode",label:"Lines",type:"select",default:"image",options:[{value:"image",label:"Image colors"},{value:"color",label:"One color"}],when:e=>e.background==="color"},{key:"line",label:"Line color",type:"color",default:"#f4f1ea",when:e=>e.background==="image"||e.lineMode==="color"}],render(e,o,t){const a=t.smoothing*8*e.unit,l=a>.3?E(e,o,a):null,r=e.pass("contour",ka,{input:l||o,textures:{uImage:o},uniforms:{uLevels:t.levels,uWidth:t.width*e.unit,uSoftness:t.softness,uGamma:t.balance,uInvert:t.invert,uFlat:t.background==="color",uImageLines:t.lineMode==="image",uLine:C(t.line),uFill:C(t.fill)}});return l&&e.release(l),r}},Sa=`
uniform sampler2D uGlowMap;
uniform float uCurvature;
uniform float uLines;
uniform float uScan;
uniform float uMaskType;
uniform float uMask;
uniform float uMaskSize;
uniform float uGlow;
uniform float uVignette;
uniform float uFlicker;
uniform float uRoll;
uniform float uConvergence;
uniform float uSeed;

vec2 warp(vec2 uv) {
  vec2 c = uv * 2.0 - 1.0;
  vec2 offset = c.yx * c.yx * vec2(0.11, 0.16) * uCurvature;
  c += c * offset;
  return c * 0.5 + 0.5;
}

vec3 maskAt(vec2 px) {
  if (uMaskType < 0.5) return vec3(1.0);
  float size = uMaskSize;
  if (uMaskType < 1.5) {
    float x = mod(floor(px.x / size), 3.0);
    return vec3(x < 0.5 ? 1.0 : 0.0, x > 0.5 && x < 1.5 ? 1.0 : 0.0, x > 1.5 ? 1.0 : 0.0);
  }
  if (uMaskType < 2.5) {
    float column = floor(px.x / (size * 3.0));
    float x = mod(floor(px.x / size), 3.0);
    vec3 triad = vec3(x < 0.5 ? 1.0 : 0.0, x > 0.5 && x < 1.5 ? 1.0 : 0.0, x > 1.5 ? 1.0 : 0.0);
    float y = fract((px.y + mod(column, 2.0) * size * 2.0) / (size * 4.0));
    return triad * (y < 0.82 ? 1.0 : 0.25);
  }
  vec2 cell = floor(px / size);
  float x = mod(cell.x + mod(cell.y, 2.0), 3.0);
  return vec3(x < 0.5 ? 1.0 : 0.0, x > 0.5 && x < 1.5 ? 1.0 : 0.0, x > 1.5 ? 1.0 : 0.0);
}

void main() {
  vec2 uv = warp(vUv);
  vec2 edge = smoothstep(vec2(0.0), vec2(0.004 + uCurvature * 0.006), uv) * smoothstep(vec2(0.0), vec2(0.004 + uCurvature * 0.006), 1.0 - uv);
  float inside = edge.x * edge.y;
  float shift = uConvergence / uResolution.x;
  vec3 color;
  color.r = texture(uInput, uv + vec2(shift, 0.0)).r;
  color.g = texture(uInput, uv).g;
  color.b = texture(uInput, uv - vec2(shift, 0.0)).b;
  vec3 linear = toLinear(color);

  float y = uv.y * uLines;
  float s = sin(fract(y) * PI);
  float bright = luma(linear);
  float beam = pow(s, mix(2.4, 0.7, clamp(bright * 1.6, 0.0, 1.0)));
  linear *= mix(1.0, beam * 1.55, uScan);

  vec3 mask = maskAt(uv * uResolution);
  linear *= mix(vec3(1.0), mask * 2.4 + 0.18, uMask);

  linear += toLinear(texture(uGlowMap, uv).rgb) * uGlow;

  if (uRoll > 0.0) {
    float band = fract(uv.y - uTime * 0.11);
    linear *= 1.0 + smoothstep(0.0, 0.12, band) * smoothstep(0.26, 0.12, band) * uRoll * 0.16;
  }
  linear *= 1.0 + (hash11(uSeed) - 0.5) * uFlicker * 0.12;

  vec2 v = vUv * 2.0 - 1.0;
  float vig = smootherstep(1.45, 0.35, length(v * vec2(0.92, 1.0)));
  linear *= mix(1.0, vig, uVignette);

  outColor = vec4(toGamma(linear) * inside, 1.0);
}`,Ca={none:0,aperture:1,slot:2,shadow:3},Ma={id:"crt",name:"CRT",category:"analog",blend:"normal",description:"Curved glass, scanlines, a phosphor mask and glow.",animated:!0,animates:e=>e.flicker>0||e.roll>0,params:[{key:"curvature",label:"Curvature",type:"number",min:0,max:1,step:.01,default:.45},{key:"lines",label:"Line size",type:"number",min:1.5,max:10,step:.1,default:3.2},{key:"scan",label:"Scanlines",type:"number",min:0,max:1,step:.01,default:.6},{key:"mask",label:"Mask",type:"select",default:"aperture",options:[{value:"aperture",label:"Aperture grille"},{value:"slot",label:"Slot mask"},{value:"shadow",label:"Shadow mask"},{value:"none",label:"None"}]},{key:"maskStrength",label:"Mask strength",type:"number",min:0,max:1,step:.01,default:.35,when:e=>e.mask!=="none"},{key:"glow",label:"Glow",type:"number",min:0,max:1.5,step:.01,default:.45},{key:"convergence",label:"Convergence",type:"number",min:0,max:4,step:.05,default:.8},{key:"vignette",label:"Vignette",type:"number",min:0,max:1,step:.01,default:.55},{key:"flicker",label:"Flicker",type:"number",min:0,max:1,step:.01,default:.2},{key:"roll",label:"Rolling band",type:"number",min:0,max:1,step:.01,default:.3}],render(e,o,t){const a=E(e,o,Math.max(1,6*e.unit)),l=Math.max(1.5,t.lines*e.unit),r=e.pass("crt",Sa,{input:o,textures:{uGlowMap:a},uniforms:{uCurvature:t.curvature,uLines:e.height/l,uScan:t.scan,uMaskType:Ca[t.mask]??1,uMask:t.mask==="none"?0:t.maskStrength,uMaskSize:Math.max(1,Math.round(e.unit*1.2)),uGlow:t.glow,uVignette:t.vignette,uFlicker:t.flicker,uRoll:t.roll,uConvergence:t.convergence*e.unit,uSeed:Math.floor(e.time*30)*1.7}});return e.release(a),r}},Ot=`
vec3 rgb2yiq(vec3 c) {
  return vec3(
    dot(c, vec3(0.299, 0.587, 0.114)),
    dot(c, vec3(0.596, -0.274, -0.322)),
    dot(c, vec3(0.211, -0.523, 0.312))
  );
}

vec3 yiq2rgb(vec3 c) {
  return vec3(
    dot(c, vec3(1.0, 0.956, 0.621)),
    dot(c, vec3(1.0, -0.272, -0.647)),
    dot(c, vec3(1.0, -1.106, 1.703))
  );
}
`,Ta=`
uniform float uJitter;
uniform float uTracking;
uniform float uSpeed;
uniform float uLines;
${Ot}
void main() {
  float t = uTime * uSpeed;
  float line = floor(vUv.y * uLines);
  float wobble = valueNoise(vec2(line * 0.09, t * 1.7)) - 0.5;
  wobble += (valueNoise(vec2(line * 0.6, t * 9.0)) - 0.5) * 0.35;
  float shift = wobble * uJitter * 3.2 / 640.0;

  float bandPos = 1.12 - fract(t * 0.043 + 0.62) * 1.24;
  float d = vUv.y - bandPos;
  float band = exp(-d * d / 0.0009) * uTracking;
  shift += (hash11(line * 1.73 + floor(t * 30.0) * 7.1) - 0.5) * band * 0.035;
  shift += band * 0.012 * sin(line * 0.21 + t * 7.0);

  float head = smoothstep(0.028, 0.0, vUv.y) * step(0.001, uSpeed + uJitter + uTracking);
  shift += head * (0.012 + 0.02 * valueNoise(vec2(line * 0.8, t * 18.0)));

  vec3 color = texture(uInput, vec2(vUv.x - shift, vUv.y)).rgb;
  vec3 yiq = rgb2yiq(color);
  outColor = vec4(yiq.x, yiq.y + 0.5, yiq.z + 0.5, clamp(band + head, 0.0, 1.0));
}`,La=`
uniform float uBleed;
uniform float uSharp;
uniform float uNoise;
uniform float uFade;
uniform float uLines;
uniform float uLuma;
uniform float uSeed;
${Ot}
void main() {
  vec2 px = vUv * uResolution;
  vec2 texel = 1.0 / uResolution;
  float line = floor(vUv.y * uLines);
  float lumaWidth = uResolution.x / uLuma;
  float chromaWidth = uResolution.x / 52.0 * (0.25 + uBleed);

  float soft = 0.0;
  float wide = 0.0;
  float total = 0.0;
  for (int i = -4; i <= 4; i++) {
    float x = float(i);
    float w = exp(-x * x / 8.0);
    soft += texture(uInput, vUv + vec2(x * lumaWidth * 0.3 * texel.x, 0.0)).r * w;
    wide += texture(uInput, vUv + vec2((x * 0.85 - 1.1) * lumaWidth * texel.x, 0.0)).r * w;
    total += w;
  }
  soft /= total;
  wide /= total;
  float y = soft + (soft - wide) * uSharp * 1.6;

  vec2 iq = vec2(0.0);
  total = 0.0;
  float delay = chromaWidth * 0.3;
  vec2 above = vec2(0.0, uResolution.y / uLines * texel.y);
  for (int i = 0; i < 16; i++) {
    float f = float(i) / 15.0 * 2.0 - 1.0;
    float w = exp(-f * f * 2.5);
    vec2 s = vUv + vec2((f * chromaWidth - delay) * texel.x, 0.0);
    iq += (texture(uInput, s).gb - 0.5) * w;
    iq += (texture(uInput, s + above).gb - 0.5) * w * 0.6;
    total += w * 1.6;
  }
  iq /= total;

  float mask = texture(uInput, vUv).a;
  float rowSeed = hash11(line * 0.137 + uSeed);
  float grain = valueNoise(vec2(px.x / (lumaWidth * 2.2) + rowSeed * 613.0, line * 17.31 + uSeed)) - 0.5;
  float fine = hash12(vec2(floor(px.x / max(lumaWidth * 0.7, 1.0)), line) + uSeed) - 0.5;
  y += (grain * 0.75 + fine * 0.35) * uNoise * 0.16 * (1.0 + mask * 3.0);
  vec2 blotch = vec2(
    valueNoise(vec2(px.x / (chromaWidth * 0.9) + rowSeed * 211.0, line * 0.35 + uSeed * 3.0)),
    valueNoise(vec2(px.x / (chromaWidth * 0.9) + rowSeed * 97.0, line * 0.35 + uSeed * 5.0 + 40.0))
  ) - 0.5;
  iq += blotch * uNoise * 0.07 * (1.0 + mask * 2.0);

  float dropout = step(1.0 - uNoise * 0.006 - mask * 0.05, hash12(vec2(line, floor(uSeed * 7.0))));
  float span = smoothstep(0.0, 0.08, fract(vUv.x * 0.7 + rowSeed) ) * step(fract(vUv.x * 0.7 + rowSeed), 0.35 + rowSeed * 0.4);
  y += dropout * span * 0.8;

  iq *= 1.0 - uFade * 0.3;
  vec3 color = yiq2rgb(vec3(y, iq));
  color = color * (1.0 - uFade * 0.14) + vec3(0.055, 0.035, 0.065) * uFade;
  color = mix(color, color * vec3(1.03, 0.98, 1.04), uFade);
  outColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}`,ft={sp:[330,1,1],lp:[250,1.25,1.35],ep:[190,1.55,1.8]},Ua={id:"vhs",name:"VHS",category:"analog",blend:"normal",description:"Soft tape picture with color smear, edge halos, noise, tracking drift and head switching.",animated:!0,preview:{params:{bleed:1.2,noise:.8,tracking:.9,fade:.7}},animates:e=>e.speed>0,params:[{key:"tape",label:"Recording",type:"select",default:"sp",options:[{value:"sp",label:"Standard play"},{value:"lp",label:"Long play"},{value:"ep",label:"Extended play"}]},{key:"bleed",label:"Color bleed",type:"number",min:0,max:1.5,step:.01,default:.75},{key:"sharpen",label:"Edge halo",type:"number",min:0,max:1,step:.01,default:.5},{key:"noise",label:"Ruído",type:"number",min:0,max:1,step:.01,default:.4},{key:"jitter",label:"Jitter",type:"number",min:0,max:1.5,step:.01,default:.5},{key:"tracking",label:"Tracking",type:"number",min:0,max:1,step:.01,default:.45},{key:"fade",label:"Wear",type:"number",min:0,max:1,step:.01,default:.45},{key:"speed",label:"Velocidade",type:"number",min:0,max:3,step:.05,default:1}],render(e,o,t){const[a,l,r]=ft[t.tape]||ft.sp,i=Math.min(e.height,480),n=e.pass("vhs-encode",Ta,{input:o,uniforms:{uJitter:t.jitter,uTracking:t.tracking,uSpeed:t.speed,uLines:i}}),u=e.pass("vhs-decode",La,{input:n,uniforms:{uBleed:t.bleed*l,uSharp:t.sharpen,uNoise:Math.min(t.noise*r,1.6),uFade:t.fade,uLines:i,uLuma:a,uSeed:Math.floor(e.time*30*Math.max(t.speed,1e-4))%997*.731}});return e.release(n),u}},Ia=`
uniform float uAmount;
uniform float uMode;
uniform float uAngle;
uniform float uFalloff;
uniform vec2 uCenter;

vec3 spectrum(float t) {
  vec3 c = vec3(
    smoothstep(0.45, 0.0, abs(t - 0.05)) + smoothstep(0.35, 0.0, abs(t - 0.95)) * 0.25,
    smoothstep(0.38, 0.0, abs(t - 0.5)),
    smoothstep(0.42, 0.0, abs(t - 0.95))
  );
  return c;
}

void main() {
  vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
  vec2 dir;
  float strength;
  if (uMode < 0.5) {
    vec2 d = (vUv - uCenter) * aspect;
    float r = length(d);
    strength = pow(clamp(r / 0.75, 0.0, 1.0), uFalloff);
    dir = d / max(r, 1e-4) / aspect;
  } else {
    dir = vec2(cos(uAngle), sin(uAngle)) / aspect;
    strength = 1.0;
  }
  vec2 offset = dir * uAmount * strength / uResolution.y;
  vec3 sum = vec3(0.0);
  vec3 weight = vec3(0.0);
  for (int i = 0; i < 9; i++) {
    float t = float(i) / 8.0;
    vec3 w = spectrum(t);
    sum += texture(uInput, vUv + offset * (t - 0.5) * 2.0).rgb * w;
    weight += w;
  }
  outColor = vec4(sum / weight, 1.0);
}`,za={id:"chromatic",name:"Chromatic",category:"analog",blend:"normal",description:"Prism-like color fringes that spread from the center or along a line.",animated:!0,preview:{params:{amount:16}},animates:e=>e.wobble>0,params:[{key:"mode",label:"Direção",type:"select",default:"radial",options:[{value:"radial",label:"From center"},{value:"linear",label:"Along a line"}]},{key:"amount",label:"Amount",type:"number",min:0,max:40,step:.1,default:6},{key:"angle",label:"Ângulo",type:"number",min:0,max:360,step:1,default:0,when:e=>e.mode==="linear"},{key:"falloff",label:"Falloff",type:"number",min:.3,max:4,step:.05,default:1.6,when:e=>e.mode==="radial"},{key:"wobble",label:"Wobble",type:"number",min:0,max:1,step:.01,default:0}],render(e,o,t){const a=t.wobble>0?1+Math.sin(e.time*2.3)*.45*t.wobble+Math.sin(e.time*5.7)*.15*t.wobble:1;return e.pass("chromatic",Ia,{input:o,uniforms:{uAmount:t.amount*e.unit*a,uMode:t.mode==="linear"?1:0,uAngle:t.angle*Math.PI/180,uFalloff:t.falloff,uCenter:[.5,.5]}})}},Aa=`
uniform float uAmount;
uniform float uBlocks;
uniform float uSplit;
uniform float uSeed;
uniform float uActive;
uniform float uColorGlitch;

void main() {
  vec2 uv = vUv;
  float gate = uActive;
  float rows = mix(6.0, 28.0, hash11(uSeed * 1.3));
  float row = floor(uv.y * rows);
  float rowHash = hash12(vec2(row, uSeed));
  float slice = step(1.0 - uAmount * 0.55 * gate, rowHash);
  uv.x += (hash12(vec2(row, uSeed + 4.1)) - 0.5) * 0.18 * slice * uAmount;

  vec2 grid = vec2(mix(4.0, 18.0, hash11(uSeed + 7.0)), mix(8.0, 30.0, hash11(uSeed + 9.0)));
  vec2 block = floor(vUv * grid);
  float blockHash = hash12(block + uSeed * 3.17);
  float hit = step(1.0 - uBlocks * 0.35 * gate, blockHash);
  vec2 jump = (hash22(block + uSeed) - 0.5) * vec2(0.24, 0.06);
  uv += jump * hit;

  float split = uSplit * (0.004 + gate * 0.02) * (0.4 + slice * 1.6);
  vec3 color;
  color.r = texture(uInput, uv + vec2(split, 0.0)).r;
  color.g = texture(uInput, uv).g;
  color.b = texture(uInput, uv - vec2(split, split * 0.4)).b;

  if (hit > 0.5 && hash12(block + uSeed * 1.7) < uColorGlitch) {
    float mode = hash12(block + uSeed * 2.3);
    if (mode < 0.33) color = color.brg;
    else if (mode < 0.66) color = 1.0 - color;
    else color = vec3(step(0.5, luma(color))) * vec3(0.9, 1.0, 0.95);
  }
  float scan = step(0.985, hash12(vec2(floor(vUv.y * uResolution.y / max(uUnit, 1.0)), uSeed))) * gate;
  color = mix(color, vec3(hash12(vUv * uResolution + uSeed)), scan * 0.6);
  outColor = vec4(color, 1.0);
}`,Ra={id:"glitch",name:"Glitch",category:"glitch",blend:"normal",description:"Bursts of sliced rows, jumping blocks and split color.",animated:!0,preview:{params:{amount:.85,blocks:.7,split:1,frequency:1}},animates:()=>!0,params:[{key:"amount",label:"Slices",type:"number",min:0,max:1,step:.01,default:.45},{key:"blocks",label:"Blocks",type:"number",min:0,max:1,step:.01,default:.35},{key:"split",label:"Color split",type:"number",min:0,max:1.5,step:.01,default:.6},{key:"colorGlitch",label:"Color errors",type:"number",min:0,max:1,step:.01,default:.25},{key:"frequency",label:"Frequency",type:"number",min:0,max:1,step:.01,default:.45},{key:"speed",label:"Velocidade",type:"number",min:.2,max:3,step:.05,default:1},{key:"variation",label:"Variação",type:"number",min:0,max:100,step:1,default:7}],render(e,o,t){const a=Math.floor(e.time*14*t.speed),l=Math.floor(e.time*2.2*t.speed),r=Math.sin(l*12.9898+t.variation*78.233)*43758.5453,i=r-Math.floor(r)<t.frequency?1:0,n=Math.max(.12,i);return e.pass("glitch",Aa,{input:o,uniforms:{uAmount:t.amount,uBlocks:t.blocks,uSplit:t.split,uSeed:a%251*1.618+t.variation*3.1,uActive:n,uColorGlitch:t.colorGlitch}})}},Da=`
uniform float uMode;
uniform vec2 uDirection;
uniform float uLength;
uniform float uThreshold;
uniform float uPosition;
uniform float uVariance;
uniform float uSpeed;

void main() {
  vec2 dir = uDirection;
  if (uMode < 0.5) {
    vec3 base = texture(uInput, vUv).rgb;
    vec3 streak = vec3(0.0);
    for (int i = 1; i <= 40; i++) {
      float t = float(i) / 40.0;
      vec3 c = texture(uInput, vUv - dir * t * uLength / uResolution).rgb;
      float w = max(luma(c) - uThreshold, 0.0) / max(1.0 - uThreshold, 1e-3);
      streak = max(streak, c * w * pow(1.0 - t, 1.6));
    }
    outColor = vec4(1.0 - (1.0 - base) * (1.0 - clamp(streak, 0.0, 1.0)), 1.0);
    return;
  }
  vec2 normal = vec2(-dir.y, dir.x);
  float across = dot(vUv - 0.5, normal);
  float along = dot(vUv - 0.5, dir) + 0.5;
  float row = floor(across * uResolution.y / max(uUnit * 2.0, 1.0));
  float start = uPosition + (valueNoise(vec2(row * 0.15, uTime * uSpeed * 0.4)) - 0.5) * uVariance;
  vec2 uv = vUv;
  if (along > start) uv -= dir * (along - start);
  outColor = vec4(texture(uInput, uv).rgb, 1.0);
}`,Ea={id:"smear",name:"Smear",category:"glitch",blend:"normal",description:"Light streaks or stretched pixels, like a slit-scan.",animated:!0,preview:{params:{position:.4}},animates:e=>e.mode==="stretch"&&e.speed>0&&e.variance>0,params:[{key:"mode",label:"Type",type:"select",default:"stretch",options:[{value:"stretch",label:"Pixel stretch"},{value:"streak",label:"Light streaks"}]},{key:"angle",label:"Ângulo",type:"number",min:0,max:360,step:1,default:0},{key:"position",label:"Start",type:"number",min:0,max:1,step:.01,default:.6,when:e=>e.mode==="stretch"},{key:"variance",label:"Ragged edge",type:"number",min:0,max:.8,step:.01,default:.35,when:e=>e.mode==="stretch"},{key:"length",label:"Duração",type:"number",min:2,max:300,step:1,default:80,when:e=>e.mode==="streak"},{key:"threshold",label:"Threshold",type:"number",min:0,max:1,step:.01,default:.55,when:e=>e.mode==="streak"},{key:"speed",label:"Velocidade",type:"number",min:0,max:3,step:.05,default:.6}],render(e,o,t){const a=t.angle*Math.PI/180;return e.pass("smear",Da,{input:o,uniforms:{uMode:t.mode==="streak"?0:1,uDirection:[Math.cos(a),Math.sin(a)],uLength:t.length*e.unit,uThreshold:t.threshold,uPosition:t.position,uVariance:t.variance,uSpeed:t.speed}})}},Pa=`
uniform float uKey;

float sortKey(vec3 c) {
  if (uKey < 0.5) return luma(c);
  vec3 hsv = rgb2hsv(clamp(c, 0.0, 1.0));
  if (uKey < 1.5) return hsv.x;
  return hsv.y;
}
`,qa=`
uniform vec2 uImage;
uniform vec2 uCenter;
uniform vec2 uAlong;
uniform vec2 uAcross;
uniform vec2 uExtent;
uniform vec2 uSpacing;
uniform vec2 uTaps;
uniform float uLow;
uniform float uHigh;
uniform float uRandom;
uniform float uSeed;

void main() {
  vec2 g = gl_FragCoord.xy * uSpacing - uExtent * 0.5;
  vec2 p = uCenter + uAlong * g.x + uAcross * g.y;
  vec3 color = vec3(0.0);
  for (int a = 0; a < 4; a++) {
    if (float(a) >= uTaps.x) break;
    for (int b = 0; b < 4; b++) {
      if (float(b) >= uTaps.y) break;
      vec2 o = ((vec2(a, b) + 0.5) / uTaps - 0.5) * uSpacing;
      color += texture(uInput, (p + uAlong * o.x + uAcross * o.y) / uImage).rgb;
    }
  }
  color /= uTaps.x * uTaps.y;
  float row = floor(gl_FragCoord.y);
  float jitter = (hash11(row * 0.6180339 + uSeed) - 0.5) * uRandom * 0.12;
  float l = luma(color) + jitter;
  bool inside = p.x >= 0.0 && p.y >= 0.0 && p.x <= uImage.x && p.y <= uImage.y;
  float flag = inside && l >= uLow && l <= uHigh ? 1.0 : 0.0;
  outColor = vec4(color, flag);
}`,Fa=`
uniform float uPiece;
uniform float uRandom;
uniform float uSeed;
uniform float uPhase;

float piece(float i, float row) {
  float u = i / uPiece + uPhase;
  float ragged = hash11(row * 0.7548777 + uSeed * 1.3) * uRandom;
  float wander = valueNoise(vec2(u * 0.6 + uSeed, row * 0.045 + uSeed * 3.1)) * (1.0 - uRandom * 0.5);
  return floor(u + ragged + wander);
}

void main() {
  int i = int(gl_FragCoord.x);
  int row = int(gl_FragCoord.y);
  float best = -1.0;
  vec4 prev = i >= 8 ? texelFetch(uInput, ivec2(i - 8, row), 0) : vec4(0.0);
  float prevPiece = piece(float(i - 8), float(row));
  vec4 here = vec4(0.0);
  for (int k = 7; k >= 0; k--) {
    int x = i - k;
    if (x < 0) continue;
    vec4 cur = texelFetch(uInput, ivec2(x, row), 0);
    float pc = piece(float(x), float(row));
    bool joined = x > 0 && cur.a > 0.5 && prev.a > 0.5 && pc == prevPiece;
    if (!joined) best = float(x);
    prev = cur;
    prevPiece = pc;
    if (k == 0) here = cur;
  }
  outColor = vec4(here.rgb, best);
}`,Ba=`
uniform float uDistance;

void main() {
  int i = int(gl_FragCoord.x);
  int row = int(gl_FragCoord.y);
  int d = int(uDistance + 0.5);
  vec4 here = texelFetch(uInput, ivec2(i, row), 0);
  float best = here.a;
  for (int k = 1; k < 8; k++) {
    int x = i - k * d;
    if (x < 0) break;
    best = max(best, texelFetch(uInput, ivec2(x, row), 0).a);
  }
  outColor = vec4(here.rgb, best);
}`,Ga=`
${Pa}
uniform float uMerge;
uniform float uDistance;
uniform float uSteps;

vec4 v[8];
float c[8];

void exchange(int a, int b, bool up) {
  if ((c[a] > c[b]) == up) {
    vec4 tv = v[a];
    v[a] = v[b];
    v[b] = tv;
    float tc = c[a];
    c[a] = c[b];
    c[b] = tc;
  }
}

void main() {
  int i = int(gl_FragCoord.x);
  int row = int(gl_FragCoord.y);
  int k = int(uMerge + 0.5);
  int steps = int(uSteps + 0.5);
  int j1 = int(uDistance + 0.5);
  int j2 = steps > 1 ? j1 / 2 : 0;
  int j3 = steps > 2 ? j1 / 4 : 0;
  int base = i & ~(j1 | j2 | j3);
  bool up = (i & k) == 0;
  for (int t = 0; t < 8; t++) {
    int x = base + ((t & 4) != 0 ? j1 : 0) + ((t & 2) != 0 ? j2 : 0) + ((t & 1) != 0 ? j3 : 0);
    v[t] = texelFetch(uInput, ivec2(x, row), 0);
    c[t] = v[t].a + clamp(sortKey(v[t].rgb), 0.0, 1.0) * 0.998;
  }
  exchange(0, 4, up);
  exchange(1, 5, up);
  exchange(2, 6, up);
  exchange(3, 7, up);
  if (steps > 1) {
    exchange(0, 2, up);
    exchange(1, 3, up);
    exchange(4, 6, up);
    exchange(5, 7, up);
  }
  if (steps > 2) {
    exchange(0, 1, up);
    exchange(2, 3, up);
    exchange(4, 5, up);
    exchange(6, 7, up);
  }
  int t = ((i & j1) != 0 ? 4 : 0) + (j2 > 0 && (i & j2) != 0 ? 2 : 0) + (j3 > 0 && (i & j3) != 0 ? 1 : 0);
  outColor = v[t];
}`,Na=`
uniform sampler2D uSorted;
uniform vec2 uCenter;
uniform vec2 uAlong;
uniform vec2 uAcross;
uniform vec2 uExtent;
uniform vec2 uSpacing;
uniform vec2 uGrid;
uniform float uSoft;

float spanAt(int i, int row) {
  if (i < 0 || i >= int(uGrid.x) || row < 0 || row >= int(uGrid.y)) return 0.0;
  float s = texelFetch(uSorted, ivec2(i, row), 0).a;
  float next = i + 1 < int(uGrid.x) ? texelFetch(uSorted, ivec2(i + 1, row), 0).a : -1.0;
  return abs(s - float(i)) > 0.5 || abs(next - float(i)) < 0.5 ? 1.0 : 0.0;
}

void main() {
  vec2 p = vUv * uResolution;
  vec2 d = p - uCenter;
  vec2 g = (vec2(dot(d, uAlong), dot(d, uAcross)) + uExtent * 0.5) / uSpacing;
  vec3 original = texture(uInput, vUv).rgb;
  vec3 sorted = texture(uSorted, g / uGrid).rgb;
  if (uSoft > 0.0) {
    vec3 sum = sorted;
    float total = 1.0;
    for (int k = 1; k <= 4; k++) {
      float o = float(k) * uSoft * 0.5;
      float w = exp(-float(k * k) * 0.25);
      sum += (texture(uSorted, (g + vec2(o, 0.0)) / uGrid).rgb + texture(uSorted, (g - vec2(o, 0.0)) / uGrid).rgb) * w;
      total += 2.0 * w;
    }
    sorted = sum / total;
  }
  vec2 x = g - 0.5;
  ivec2 c0 = ivec2(floor(x));
  vec2 f = fract(x);
  float bottom = mix(spanAt(c0.x, c0.y), spanAt(c0.x + 1, c0.y), f.x);
  float top = mix(spanAt(c0.x, c0.y + 1), spanAt(c0.x + 1, c0.y + 1), f.x);
  float mask = mix(bottom, top, f.y);
  outColor = vec4(mix(original, sorted, mask), 1.0);
}`,Oa={brightness:0,hue:1,saturation:2},Ha=e=>{const o=[];for(let t=2;t<=e;t*=2){let a=t/2;for(;a>=1;){const l=Math.min(3,Math.round(Math.log2(a))+1);o.push([t,a,l]),a/=2**l}}return o},Wa={id:"pixelsort",name:"Pixel sort",category:"glitch",blend:"normal",description:"Sorts runs of pixels by brightness, hue or saturation into glitchy streaks.",animated:!0,animates:e=>e.drift>0,params:[{key:"sortBy",label:"Sort by",type:"select",default:"brightness",options:[{value:"brightness",label:"Brilho"},{value:"hue",label:"Hue"},{value:"saturation",label:"Saturação"}]},{key:"low",label:"Lower threshold",type:"number",min:0,max:1,step:.01,default:.4},{key:"high",label:"Upper threshold",type:"number",min:0,max:1,step:.01,default:.9},{key:"angle",label:"Ângulo",type:"number",min:0,max:180,step:1,default:0},{key:"reverse",label:"Reverse",type:"boolean",default:!1},{key:"length",label:"Streak length",type:"number",min:.02,max:1,step:.01,default:.5},{key:"randomness",label:"Ragged ends",type:"number",min:0,max:1,step:.01,default:.5},{key:"smooth",label:"Smoothing",type:"number",min:0,max:1,step:.01,default:.3},{key:"drift",label:"Drift",type:"number",min:0,max:1,step:.01,default:0},{key:"variation",label:"Variação",type:"number",min:0,max:100,step:1,default:0}],render(e,o,t){const a=(t.angle+(t.reverse?180:0))*Math.PI/180,l=[Math.cos(a),Math.sin(a)],r=[-l[1],l[0]],i=Math.abs(e.width*l[0])+Math.abs(e.height*l[1]),n=Math.abs(e.width*l[1])+Math.abs(e.height*l[0]),u=Math.max(1,e.unit),c=Math.min(1024,Math.max(64,2**Math.round(Math.log2(i/u)))),s=Math.max(1,Math.round(n/u)),p=[i/c,n/s],f=t.variation*1.618,m=e.time*t.drift,d=t.drift>0?.12*Math.sin(m*.9)+.04*Math.sin(m*2.3+1.7):0,v={uCenter:[e.width/2,e.height/2],uAlong:l,uAcross:r,uExtent:[i,n],uSpacing:p};let g=e.pass("pixelsort-sample",qa,{input:o,size:[c,s],uniforms:{...v,uImage:[e.width,e.height],uTaps:[Math.min(4,Math.ceil(p[0]/2)),Math.min(4,Math.ceil(p[1]/2))],uLow:t.low+d,uHigh:t.high+d,uRandom:t.randomness,uSeed:f}});const x=h=>{e.release(g),g=h};x(e.pass("pixelsort-start",Fa,{input:g,size:[c,s],uniforms:{uPiece:Math.max(2,t.length*1e3*e.unit/p[0]),uRandom:t.randomness,uSeed:f,uPhase:m*.15}}));for(let h=8;h<c;h*=8)x(e.pass("pixelsort-scan",Ba,{input:g,size:[c,s],uniforms:{uDistance:h}}));Ha(c).forEach(([h,b,y])=>{x(e.pass("pixelsort-sort",Ga,{input:g,size:[c,s],uniforms:{uKey:Oa[t.sortBy]??0,uMerge:h,uDistance:b,uSteps:y}}))});const k=e.pass("pixelsort-composite",Na,{input:o,textures:{uSorted:g},uniforms:{...v,uGrid:[c,s],uSoft:t.smooth*12*Math.max(e.unit,1)/p[0]}});return e.release(g),k}},ja=[16,11,10,16,24,40,51,61,12,12,14,19,26,58,60,55,14,13,16,24,40,57,69,56,14,17,22,29,51,87,80,62,18,22,37,56,68,109,103,77,24,35,55,64,81,104,113,92,49,64,78,87,103,121,120,101,72,92,95,98,112,100,103,99],_a=[17,18,24,47,99,99,99,99,18,21,26,66,99,99,99,99,24,26,56,99,99,99,99,99,47,66,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99],$a=`
uniform float uCell;
uniform vec2 uImage;
uniform float uLod;

vec3 tap(vec2 p) {
  return textureLod(uInput, vec2(p.x / uImage.x, 1.0 - p.y / uImage.y), uLod).rgb;
}

void main() {
  vec2 center = (floor(gl_FragCoord.xy) + 0.5) * uCell;
  float q = uCell * 0.25;
  vec3 c = (tap(center + vec2(-q, -q)) + tap(center + vec2(q, -q)) + tap(center + vec2(-q, q)) + tap(center + vec2(q, q))) * 0.25;
  outColor = vec4(
    dot(c, vec3(0.299, 0.587, 0.114)) - 0.5,
    dot(c, vec3(-0.168736, -0.331264, 0.5)),
    dot(c, vec3(0.5, -0.418688, -0.081312)),
    1.0
  );
}`,Va=`
void main() {
  ivec2 p = ivec2(gl_FragCoord.xy);
  int u = p.x % 8;
  int start = p.x - u;
  vec3 sum = vec3(0.0);
  for (int x = 0; x < 8; x++) {
    sum += texelFetch(uInput, ivec2(start + x, p.y), 0).rgb * cos(float((2 * x + 1) * u) * PI / 16.0);
  }
  outColor = vec4(sum, 1.0);
}`,Xa=`
uniform vec4 uLumaSteps[16];
uniform vec4 uChromaSteps[16];

void main() {
  ivec2 p = ivec2(gl_FragCoord.xy);
  int u = p.x % 8;
  int v = p.y % 8;
  int start = p.y - v;
  vec3 sum = vec3(0.0);
  for (int y = 0; y < 8; y++) {
    sum += texelFetch(uInput, ivec2(p.x, start + y), 0).rgb * cos(float((2 * y + 1) * v) * PI / 16.0);
  }
  float cu = u == 0 ? 0.70710678 : 1.0;
  float cv = v == 0 ? 0.70710678 : 1.0;
  vec3 coefficient = sum * 0.25 * cu * cv;
  int index = v * 8 + u;
  float lumaStep = uLumaSteps[index / 4][index % 4];
  float chromaStep = uChromaSteps[index / 4][index % 4];
  vec3 q = vec3(lumaStep, chromaStep, chromaStep);
  vec3 kept = floor(coefficient / q + 0.5) * q;
  outColor = vec4(kept * cu * cv, 1.0);
}`,Ya=`
void main() {
  ivec2 p = ivec2(gl_FragCoord.xy);
  int y = p.y % 8;
  int start = p.y - y;
  vec3 sum = vec3(0.0);
  for (int v = 0; v < 8; v++) {
    sum += texelFetch(uInput, ivec2(p.x, start + v), 0).rgb * cos(float((2 * y + 1) * v) * PI / 16.0);
  }
  outColor = vec4(sum, 1.0);
}`,Ka=`
uniform sampler2D uSamples;

vec3 toRgb(vec3 c) {
  float y = c.x + 0.5;
  return vec3(y + 1.402 * c.z, y - 0.344136 * c.y - 0.714136 * c.z, y + 1.772 * c.y);
}

void main() {
  ivec2 p = ivec2(gl_FragCoord.xy);
  int x = p.x % 8;
  int start = p.x - x;
  vec3 sum = vec3(0.0);
  for (int u = 0; u < 8; u++) {
    sum += texelFetch(uInput, ivec2(start + u, p.y), 0).rgb * cos(float((2 * x + 1) * u) * PI / 16.0);
  }
  vec3 rebuilt = clamp(toRgb(sum * 0.25), 0.0, 1.0);
  vec3 original = clamp(toRgb(texelFetch(uSamples, p, 0).rgb), 0.0, 1.0);
  outColor = vec4(abs(original - rebuilt), 1.0);
}`,Za=`
uniform sampler2D uError;
uniform sampler2D uStats;
uniform float uStatsTop;
uniform vec2 uErrorScale;
uniform vec2 uErrorTexel;
uniform float uSoften;
uniform float uDetail;
uniform vec3 uPalette[6];
uniform float uMode;
uniform float uIntensity;
uniform float uBackground;
uniform float uBlock;
uniform float uGrid;
uniform float uLine;
uniform vec4 uRegions[4];
uniform float uGains[4];
uniform float uRegionCount;
uniform float uMarkers;
uniform float uScan;

vec3 paletteAt(float t) {
  float x = clamp(t, 0.0, 1.0) * 5.0;
  float index = floor(x);
  float f = x - index;
  vec3 a = uPalette[0];
  vec3 b = uPalette[0];
  for (int i = 0; i < 6; i++) {
    if (float(i) == index) a = uPalette[i];
    if (float(i) == min(index + 1.0, 5.0)) b = uPalette[i];
  }
  return mix(a, b, f);
}

float bracket(vec2 p, vec4 r, float arm, float w) {
  vec2 mid = (r.xy + r.zw) * 0.5;
  vec2 corner = vec2(p.x < mid.x ? r.x : r.z, p.y < mid.y ? r.y : r.w);
  vec2 inward = vec2(p.x < mid.x ? 1.0 : -1.0, p.y < mid.y ? 1.0 : -1.0);
  vec2 q = (p - corner) * inward;
  float dh = length(vec2(q.x - clamp(q.x, 0.0, arm), q.y));
  float dv = length(vec2(q.x, q.y - clamp(q.y, 0.0, arm)));
  return smoothstep(w * 0.5 + 0.75, w * 0.5 - 0.75, min(dh, dv));
}

float errorAt(vec2 uv, float lod) {
  return luma(textureLod(uError, uv, lod).rgb);
}

void main() {
  vec2 p = vUv * uResolution;
  vec2 top = vec2(p.x, uResolution.y - p.y);
  vec2 euv = top * uErrorScale;
  vec3 color = texture(uInput, vUv).rgb;
  vec3 crisp = textureLod(uError, euv, 0.0).rgb;
  vec2 o = uErrorTexel * exp2(uSoften) * 0.5;
  float soft = errorAt(euv + vec2(-o.x, -o.y), uSoften) + errorAt(euv + vec2(o.x, -o.y), uSoften);
  soft = (soft + errorAt(euv + vec2(-o.x, o.y), uSoften) + errorAt(euv + vec2(o.x, o.y), uSoften)) * 0.25;
  float mean = textureLod(uStats, vec2(0.5), uStatsTop).r + 0.0015;
  float gain = 1.0;
  float cold = 0.0;
  for (int i = 0; i < 4; i++) {
    if (float(i) >= uRegionCount) break;
    vec4 r = uRegions[i] * uResolution.xyxy;
    if (p.x > r.x && p.x < r.z && p.y > r.y && p.y < r.w) {
      gain = uGains[i];
      cold = step(gain, 0.999);
    }
  }
  float boost = 1.0;
  float sweep = 0.0;
  if (uScan > -1.5) {
    float d = (vUv.y - uScan) * uResolution.y / max(uResolution.x, uResolution.y);
    sweep = exp(-d * d * 4000.0);
    boost += sweep * 1.5 + step(0.0, d) * exp(-d * 7.0) * 0.8;
  }
  float level = mix(soft, luma(crisp), uDetail) / mean * gain * boost;
  float t = 1.0 - exp(-pow(max(level - 0.4, 0.0) * 0.6 * uIntensity, 1.5));
  float l = luma(color);
  vec3 glow;
  if (uMode < 0.5) {
    glow = paletteAt(t * (0.3 + 1.1 * l));
  } else if (uMode < 1.5) {
    vec3 vivid = clamp(mix(vec3(l), color, 1.6), 0.0, 1.0);
    glow = clamp(vivid * (0.7 + 1.6 * t), 0.0, 1.0) * t;
  } else {
    glow = clamp(crisp / mean * gain * boost * 0.16 * uIntensity, 0.0, 1.0);
  }
  vec3 base = color * uBackground * (1.0 - cold * 0.45);
  vec3 outc = 1.0 - (1.0 - base) * (1.0 - glow);
  vec3 ink = uMode < 0.5 ? paletteAt(0.72) : vec3(0.85);
  if (uGrid > 0.5) {
    vec2 g = abs(fract(top / uBlock - 0.5) - 0.5) * uBlock;
    float line = smoothstep(uLine * 0.4 + 0.5, uLine * 0.4 - 0.5, min(g.x, g.y));
    outc = mix(outc, ink, line * 0.2);
  }
  if (uMarkers > 0.5) {
    for (int i = 0; i < 4; i++) {
      if (float(i) >= uRegionCount) break;
      vec4 r = uRegions[i] * uResolution.xyxy;
      float arm = min(r.z - r.x, r.w - r.y) * 0.18;
      outc = mix(outc, vec3(0.88), bracket(p, r, arm, uLine) * 0.9);
    }
  }
  outc = mix(outc, ink, sweep * 0.5);
  outColor = vec4(outc, 1.0);
}`,mt={heat:["#000000","#3a0a06","#b3200e","#f2661c","#ffc23d","#fff6dc"],ice:["#000000","#06142e","#0f4a9c","#1aa3e8","#8fe3ff","#f2fdff"],toxic:["#000000","#07200c","#0f6b2a","#36c24a","#c8f25a","#f8ffe0"],mono:["#000000","#262626","#5c5c5c","#9a9a9a","#d4d4d4","#ffffff"]},Ja={picture:1,raw:2},dt=(e,o)=>{const t=Math.min(Math.max(o,1),100),a=t<50?5e3/t:200-t*2,l=e.map(r=>Math.min(Math.max(Math.floor((a*r+50)/100),1),255)/255);return Array.from({length:16},(r,i)=>l.slice(i*4,i*4+4))},Qa=e=>{let o=Math.floor(e)*2654435761+1013904223>>>0;return()=>{o=o+1831565813>>>0;let t=o;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}},el=(e,o)=>e[0]<o[2]+.04&&e[2]>o[0]-.04&&e[1]<o[3]+.04&&e[3]>o[1]-.04,tl=(e,o)=>{const t=Qa(o+11),a=[];for(let l=0;l<200&&a.length<e;l+=1){const r=.16+t()*.2,i=.28+t()*.34,n=.06+t()*(.88-r),u=.06+t()*(.88-i),c=[n,u,n+r,u+i];a.some(s=>el(c,s))||a.push(c)}return a},ol={id:"forensics",name:"Forensics",category:"glitch",description:"Error level analysis: JPEG re-save errors glow as heat over a darkened picture.",animated:!0,animates:e=>e.scan>0,params:[{key:"palette",label:"Palette",type:"select",default:"heat",options:[{value:"heat",label:"Heat"},{value:"ice",label:"Ice"},{value:"toxic",label:"Toxic"},{value:"mono",label:"Mono"},{value:"picture",label:"Picture colors"},{value:"raw",label:"Raw error"}]},{key:"intensity",label:"Intensidade",type:"number",min:0,max:3,step:.01,default:1},{key:"detail",label:"Detalhe",type:"number",min:0,max:1,step:.01,default:.35},{key:"quality",label:"Re-save quality",type:"number",min:10,max:98,step:1,default:80},{key:"size",label:"Block size",type:"number",min:3,max:40,step:.5,default:8},{key:"background",label:"Photo brightness",type:"number",min:0,max:1,step:.01,default:.12},{key:"regions",label:"Suspect regions",type:"number",min:0,max:4,step:1,default:2},{key:"markers",label:"Markers",type:"boolean",default:!0},{key:"grid",label:"Block grid",type:"boolean",default:!1},{key:"scan",label:"Scan speed",type:"number",min:0,max:2,step:.01,default:0},{key:"variation",label:"Variação",type:"number",min:0,max:100,step:1,default:3}],render(e,o,t){const a=o.mipmapped?o:e.mipmap(o),l=Math.max(8,t.size*e.unit),r=l/8,i=Math.ceil(e.width/l)*8,n=Math.ceil(e.height/l)*8,u=e.pass("forensics-sample",$a,{input:a,size:[i,n],uniforms:{uCell:r,uImage:[e.width,e.height],uLod:Math.log2(Math.max(r*.5,1))}}),c=e.pass("forensics-rows",Va,{input:u,size:[i,n]}),s=e.pass("forensics-quantize",Xa,{input:c,size:[i,n],uniforms:{uLumaSteps:dt(ja,t.quality),uChromaSteps:dt(_a,t.quality)}});e.release(c);const p=e.pass("forensics-inverse",Ya,{input:s,size:[i,n]});e.release(s);const f=e.pass("forensics-error",Ka,{input:p,size:[i,n],textures:{uSamples:u}});e.release(p),e.release(u);const m=J(e,f);e.mipmap(f);const d=(mt[t.palette]||mt.heat).map(C),v=tl(Math.round(t.regions),t.variation),g=v.length;for(;v.length<4;)v.push([0,0,0,0]);const x=[2.4,.3,1.8,.45],k=t.scan>0?1.1-e.time*t.scan*.2%1*1.4:-2,h=e.pass("forensics-composite",Za,{input:o,textures:{uError:f,uStats:m.target},uniforms:{uStatsTop:m.top,uErrorScale:[1/(i*r),1/(n*r)],uErrorTexel:[1/i,1/n],uSoften:Math.log2(Math.max(1,3*e.unit/r)),uDetail:t.detail,uPalette:d,uMode:Ja[t.palette]??0,uIntensity:t.intensity,uBackground:t.background,uBlock:l,uGrid:t.grid?1:0,uLine:Math.max(1,1.5*e.unit),uRegions:v.map(b=>[b[0],1-b[3],b[2],1-b[1]]),uGains:x,uRegionCount:g,uMarkers:t.markers?1:0,uScan:k}});return e.release(f),e.release(m.target),h}},al=[16,11,10,16,24,40,51,61,12,12,14,19,26,58,60,55,14,13,16,24,40,57,69,56,14,17,22,29,51,87,80,62,18,22,37,56,68,109,103,77,24,35,55,64,81,104,113,92,49,64,78,87,103,121,120,101,72,92,95,98,112,100,103,99],ll=[17,18,24,47,99,99,99,99,18,21,26,66,99,99,99,99,24,26,56,99,99,99,99,99,47,66,99,99,99,99,99,99,...Array(32).fill(99)],rl=`
uniform float uCell;
uniform vec2 uImage;
uniform float uLod;

vec3 tap(vec2 p) {
  return textureLod(uInput, vec2(p.x / uImage.x, 1.0 - p.y / uImage.y), uLod).rgb;
}

void main() {
  vec2 center = (floor(gl_FragCoord.xy) + 0.5) * uCell;
  float q = uCell * 0.25;
  vec3 c = (tap(center + vec2(-q, -q)) + tap(center + vec2(q, -q)) + tap(center + vec2(-q, q)) + tap(center + vec2(q, q))) * 0.25;
  outColor = vec4(
    dot(c, vec3(0.299, 0.587, 0.114)) - 0.5,
    dot(c, vec3(-0.168736, -0.331264, 0.5)),
    dot(c, vec3(0.5, -0.418688, -0.081312)),
    1.0
  );
}`,il=`
void main() {
  ivec2 p = ivec2(gl_FragCoord.xy);
  int u = p.x % 8;
  int start = p.x - u;
  vec3 sum = vec3(0.0);
  for (int x = 0; x < 8; x++) {
    sum += texelFetch(uInput, ivec2(start + x, p.y), 0).rgb * cos(float((2 * x + 1) * u) * PI / 16.0);
  }
  outColor = vec4(sum, 1.0);
}`,nl=`
uniform vec4 uLumaSteps[16];
uniform vec4 uChromaSteps[16];

void main() {
  ivec2 p = ivec2(gl_FragCoord.xy);
  int u = p.x % 8;
  int v = p.y % 8;
  int start = p.y - v;
  vec3 sum = vec3(0.0);
  for (int y = 0; y < 8; y++) {
    sum += texelFetch(uInput, ivec2(p.x, start + y), 0).rgb * cos(float((2 * y + 1) * v) * PI / 16.0);
  }
  float cu = u == 0 ? 0.70710678 : 1.0;
  float cv = v == 0 ? 0.70710678 : 1.0;
  vec3 coefficient = sum * 0.25 * cu * cv;
  int index = v * 8 + u;
  float lumaStep = uLumaSteps[index / 4][index % 4];
  float chromaStep = uChromaSteps[index / 4][index % 4];
  vec3 q = vec3(lumaStep, chromaStep, chromaStep);
  vec3 kept = floor(coefficient / q + 0.5) * q;
  outColor = vec4(kept * cu * cv, 1.0);
}`,ul=`
uniform float uBlock;

void main() {
  ivec2 p = ivec2(gl_FragCoord.xy);
  float cell = uBlock / 8.0;
  float top = uResolution.y - gl_FragCoord.y;
  float block = floor(top / uBlock);
  float local = top / cell - block * 8.0 - 0.5;
  int start = int(block) * 8;
  vec3 sum = vec3(0.0);
  for (int v = 0; v < 8; v++) {
    sum += texelFetch(uInput, ivec2(p.x, start + v), 0).rgb * cos((2.0 * local + 1.0) * float(v) * PI / 16.0);
  }
  outColor = vec4(sum, 1.0);
}`,sl=`
uniform sampler2D uChroma;
uniform vec2 uBlocks;

vec3 decodeRow(sampler2D partial, float size) {
  float cell = size / 8.0;
  float block = floor(gl_FragCoord.x / size);
  float local = gl_FragCoord.x / cell - block * 8.0 - 0.5;
  int start = int(block) * 8;
  int row = int(gl_FragCoord.y);
  vec3 sum = vec3(0.0);
  for (int u = 0; u < 8; u++) {
    sum += texelFetch(partial, ivec2(start + u, row), 0).rgb * cos((2.0 * local + 1.0) * float(u) * PI / 16.0);
  }
  return sum * 0.25;
}

void main() {
  float y = decodeRow(uInput, uBlocks.x).x + 0.5;
  vec2 c = decodeRow(uChroma, uBlocks.y).yz;
  vec3 rgb = vec3(y + 1.402 * c.y, y - 0.344136 * c.x - 0.714136 * c.y, y + 1.772 * c.x);
  outColor = vec4(clamp(rgb, 0.0, 1.0), 1.0);
}`,cl={low:1,medium:2,high:4},pt=(e,o)=>{const t=Math.min(Math.max(o,1),100),a=t<50?5e3/t:200-t*2,l=e.map(r=>Math.min(Math.max(Math.floor((a*r+50)/100),1),255)/255);return Array.from({length:16},(r,i)=>l.slice(i*4,i*4+4))},vt=(e,o,t,a)=>{const l=t/8,r=Math.ceil(e.width/t)*8,i=Math.ceil(e.height/t)*8,n=e.pass("jpeg-sample",rl,{input:o,size:[r,i],uniforms:{uCell:l,uImage:[e.width,e.height],uLod:Math.log2(Math.max(l*.5,1))}}),u=e.pass("jpeg-rows",il,{input:n,size:[r,i]});e.release(n);const c=e.pass("jpeg-quantize",nl,{input:u,size:[r,i],uniforms:{uLumaSteps:pt(al,a),uChromaSteps:pt(ll,a)}});e.release(u);const s=e.pass("jpeg-columns",ul,{input:c,size:[r,e.height],uniforms:{uBlock:t}});return e.release(c),s},fl={id:"jpeg",name:"Compression",category:"glitch",blend:"normal",description:"Heavy JPEG compression: blocky 8×8 tiles, ringing around edges and smeared color.",animated:!1,params:[{key:"quality",label:"Qualidade",type:"number",min:1,max:100,step:1,default:12},{key:"size",label:"Block size",type:"number",min:4,max:64,step:1,default:16},{key:"bleed",label:"Color bleed",type:"select",default:"medium",options:[{value:"low",label:"Low"},{value:"medium",label:"Medium"},{value:"high",label:"High"}]}],render(e,o,t){const a=o.mipmapped?o:e.mipmap(o),l=Math.max(8,t.size*e.unit),r=cl[t.bleed]??2,i=vt(e,a,l,t.quality),n=r===1?i:vt(e,a,l*r,t.quality),u=e.pass("jpeg-decode",sl,{input:i,textures:{uChroma:n},uniforms:{uBlocks:[l,l*r]}});return e.release(i),n!==i&&e.release(n),u}},ml=`
uniform float uLod;
void main() {
  outColor = vec4(textureLod(uInput, vUv, uLod).rgb, 0.0);
}`,dl=`
uniform float uLod;
void main() {
  outColor = vec4(luma(textureLod(uInput, vUv, uLod).rgb), 0.0, 0.0, 1.0);
}`,pl=`
uniform sampler2D uPrevious;

float block[64];
float coarse[16];

float fineCost(ivec2 origin, ivec2 offset, ivec2 limit) {
  float sum = 0.0;
  for (int i = 0; i < 64; i++) {
    ivec2 p = clamp(origin + ivec2(i % 8, i / 8) + offset, ivec2(0), limit);
    sum += abs(block[i] - texelFetch(uPrevious, p, 0).r);
  }
  return sum / 64.0 + 0.0015 * length(vec2(offset));
}

float coarseCost(vec2 origin, vec2 offset, vec2 size) {
  float sum = 0.0;
  for (int i = 0; i < 16; i++) {
    vec2 p = origin + vec2(float(i % 4), float(i / 4)) * 2.0 + 1.0 + offset;
    sum += abs(coarse[i] - texture(uPrevious, p / size).r);
  }
  return sum / 16.0 + 0.0015 * length(offset);
}

void main() {
  ivec2 isize = textureSize(uInput, 0);
  vec2 size = vec2(isize);
  ivec2 limit = isize - 1;
  ivec2 origin = ivec2(floor(gl_FragCoord.xy)) * 8;
  vec2 o = vec2(origin);
  for (int i = 0; i < 64; i++) {
    block[i] = texelFetch(uInput, clamp(origin + ivec2(i % 8, i / 8), ivec2(0), limit), 0).r;
  }
  for (int i = 0; i < 16; i++) {
    coarse[i] = texture(uInput, (o + vec2(float(i % 4), float(i / 4)) * 2.0 + 1.0) / size).r;
  }

  vec2 guess = vec2(0.0);
  float bestCoarse = coarseCost(o, guess, size);
  for (int y = -3; y <= 3; y++) {
    for (int x = -3; x <= 3; x++) {
      vec2 d = vec2(float(x), float(y)) * 2.0;
      float c = coarseCost(o, d, size);
      if (c < bestCoarse) {
        bestCoarse = c;
        guess = d;
      }
    }
  }

  ivec2 center = ivec2(guess);
  ivec2 found = center;
  float best = 1e9;
  for (int i = 0; i < 9; i++) {
    ivec2 d = center + ivec2(i % 3 - 1, i / 3 - 1);
    float c = fineCost(origin, d, limit);
    if (c < best) {
      best = c;
      found = d;
    }
  }
  float still = fineCost(origin, ivec2(0), limit);
  if (best >= still - 0.002) {
    outColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }
  float l = fineCost(origin, found - ivec2(1, 0), limit);
  float r = fineCost(origin, found + ivec2(1, 0), limit);
  float d = fineCost(origin, found - ivec2(0, 1), limit);
  float u = fineCost(origin, found + ivec2(0, 1), limit);
  vec2 offset = vec2(found);
  offset.x += clamp((l - r) / max(2.0 * (l - 2.0 * best + r), 1e-5), -0.5, 0.5);
  offset.y += clamp((d - u) / max(2.0 * (d - 2.0 * best + u), 1e-5), -0.5, 0.5);
  float trust = smoothstep(0.002, 0.01, still - best);
  outColor = vec4(offset * trust / size, trust, 1.0);
}`,vl=`
uniform sampler2D uLive;
uniform sampler2D uMotion;
uniform float uSimTime;
uniform float uSimDt;
uniform float uSeed;
uniform float uIntensity;
uniform float uBlock;
uniform float uDrift;
uniform float uChurn;
uniform float uFollow;
uniform vec2 uLumaSize;
uniform float uLod;
uniform float uQuant;
uniform float uDecay;

float moshHash(float p) {
  uint u = floatBitsToUint(p * 3141592653.0);
  return float(u * u * 3141592653u) / 4294967295.0;
}

vec2 blockMotion(vec2 low, vec2 high) {
  ivec2 cells = textureSize(uMotion, 0);
  ivec2 first = clamp(ivec2(floor(low * uLumaSize / 8.0)), ivec2(0), cells - 1);
  ivec2 last = clamp(ivec2(floor(high * uLumaSize / 8.0 - 0.001)), ivec2(0), cells - 1);
  vec3 sum = vec3(0.0);
  for (int y = 0; y < 8; y++) {
    if (first.y + y > last.y) break;
    for (int x = 0; x < 8; x++) {
      if (first.x + x > last.x) break;
      sum += texelFetch(uMotion, first + ivec2(x, y), 0).xyz;
    }
  }
  return sum.z > 0.001 ? sum.xy / sum.z : vec2(0.0);
}

void main() {
  vec2 pos = vUv * uResolution / uUnit;
  float churnRate = 0.15 + uChurn * 0.8;
  float fine = max(uBlock, 8.0 / uUnit);
  float coarse = fine * 2.6;
  vec2 cb = floor(pos / coarse);
  float cPhase = moshHash(cb.x * 91.17 + cb.y * 41.23 + uSeed * 3.7);
  float cEpoch = floor(uSimTime * churnRate * 0.25 + cPhase);
  float pick = moshHash(cb.x * 12.9898 + cb.y * 78.233 + cEpoch * 37.71 + uSeed * 3.7);
  float bs = pick < 0.35 ? coarse : fine;
  vec2 b = floor(pos / bs);

  float bPhase = moshHash(b.x * 127.1 + b.y * 311.7 + uSeed * 17.9);
  float bRate = churnRate * (0.7 + 0.6 * moshHash(b.x * 53.7 + b.y * 97.3 + uSeed * 5.3));
  float bEpoch = floor(uSimTime * bRate + bPhase);
  float bh = b.x * 127.1 + b.y * 311.7 + bEpoch * 74.7 + uSeed * 17.9;
  float h1 = moshHash(bh + 0.13);
  float h2 = moshHash(bh + 7.77);
  float h3 = moshHash(bh + 23.19);

  vec2 toUv = uUnit / uResolution;
  vec2 bc = (b + 0.5) * bs * toUv;
  float field = 0.5
    + 0.25 * sin(bc.x * 2.7 + uSimTime * 0.31 + uSeed) * sin(bc.y * 2.1 - uSimTime * 0.23 + uSeed * 0.4)
    + 0.25 * sin((bc.x + bc.y) * 1.6 + uSimTime * 0.17 + uSeed * 0.7);
  float thresh = 1.0 - uIntensity * 0.55;
  float hold = smoothstep(thresh - 0.09, thresh + 0.09, field + (h1 - 0.5) * 0.3);

  float flowAngle = sin(bc.x * 1.9 + uSeed * 3.1) * 1.7 + cos(bc.y * 2.3 - uSeed * 2.7) * 1.3 + uSimTime * 0.15;
  float angle = flowAngle + (h2 - 0.5) * 1.1;
  float mag = (0.5 + 0.5 * h3) * uDrift * uSimDt * 10.0 * bs;
  vec2 follow = uFollow > 0.0 ? blockMotion(b * bs * toUv, (b + 1.0) * bs * toUv) * uFollow : vec2(0.0);
  vec2 source = vUv - vec2(cos(angle), sin(angle)) * mag * toUv + follow;
  float inside = step(0.0, source.x) * step(source.x, 1.0) * step(0.0, source.y) * step(source.y, 1.0);

  vec3 previous = texture(uInput, clamp(source, 0.0, 1.0)).rgb;
  vec3 quant = (floor(previous * 18.0) + 0.5) / 18.0;
  vec3 held = mix(previous, quant, uQuant) * uDecay;
  float rekey = clamp(uSimDt * (1.2 + (1.0 - uIntensity) * 2.0), 0.0, 0.2);
  vec3 fresh = textureLod(uLive, vUv, uLod).rgb;
  float w = hold * inside;
  outColor = vec4(mix(fresh, mix(held, fresh, rekey), w), w);
}`,hl=`
uniform sampler2D uState;
uniform float uLod;
void main() {
  vec4 state = texture(uState, vUv);
  vec3 live = texture(uInput, vUv).rgb;
  vec3 low = textureLod(uInput, vUv, uLod).rgb;
  outColor = vec4(state.rgb + (1.0 - state.a) * (live - low), 1.0);
}`,gl=2048,bl=250,yl=.5,de=1/60,Ne=8,xl=1.2,kl=96,wl=(e,o)=>{e.deleteTexture(o.texture),e.deleteFramebuffer(o.fbo)},Sl=(e,o)=>{const t=`${e.width}x${e.height}`;if(o.key===t&&o.history)return!1;[...o.history||[],...o.luma||[]].forEach(s=>e.release(s));const a=Math.max(e.width,e.height),l=Math.min(1,gl/a),r=Math.min(1,bl/a),i=Math.max(1,Math.round(e.width*l)),n=Math.max(1,Math.round(e.height*l)),u=Math.max(8,Math.round(e.width*r)),c=Math.max(8,Math.round(e.height*r));return o.history=[e.engine.target(i,n),e.engine.target(i,n)],o.luma=[e.engine.target(u,c),e.engine.target(u,c)],o.key=t,o.lod=Math.log2(1/l),o.lumaLod=Math.log2(1/r),!0},Cl={id:"datamosh",name:"Datamosh",category:"glitch",blend:"normal",description:"Corrupted video: blocks freeze and drag their pixels across the frame in melting trails.",animated:!0,animates:e=>e.speed>0&&e.intensity>0,params:[{key:"intensity",label:"Intensidade",type:"number",min:0,max:1,step:.01,default:.7},{key:"size",label:"Block size",type:"number",min:16,max:200,step:1,default:60},{key:"drift",label:"Drift",type:"number",min:0,max:1,step:.01,default:.35},{key:"churn",label:"Churn",type:"number",min:0,max:1,step:.01,default:.4},{key:"follow",label:"Follow motion",type:"number",min:0,max:2,step:.01,default:1},{key:"speed",label:"Velocidade",type:"number",min:0,max:4,step:.05,default:1},{key:"variation",label:"Variação",type:"number",min:0,max:100,step:1,default:7}],render(e,o,t,a){const l=e.time-a.time,i=Sl(e,a)||!(l>=0)||l>yl,n=(a.lod>0||a.lumaLod>0)&&!o.mipmapped?e.mipmap(o):o,u=Math.max(t.speed,0),c={uSeed:t.variation,uIntensity:t.intensity,uBlock:t.size,uDrift:t.drift,uChurn:t.churn,uLod:a.lod,uLumaSize:[a.luma[0].width,a.luma[0].height]},s=(f,m,d,v,g)=>e.pass("datamosh-step",vl,{input:a.history[f],target:a.history[1-f],textures:{uLive:n,uMotion:v},uniforms:{...c,uSimTime:m,uSimDt:d,uFollow:g,uQuant:1-Math.pow(.88,d*60),uDecay:Math.pow(.9985,d*60)}}),p=f=>e.pass("datamosh-luma",dl,{input:n,target:f,uniforms:{uLod:a.lumaLod}});if(i){a.history.forEach(m=>e.pass("datamosh-seed",ml,{input:n,target:m,uniforms:{uLod:a.lod}})),a.luma.forEach(p),a.current=0,a.lumaCurrent=0,a.carry=0,a.last={simTime:e.time*u,simDt:0,ticks:1};const f=u>0?Math.min(kl,Math.ceil(xl/(de*u))):0;for(let m=0;m<f;m+=1)s(a.current,(e.time-(f-1-m)*de)*u,de*u,a.luma[0],0),a.current=1-a.current;f&&(a.last.simDt=de*u)}else{let f=0,m=de;if(l>1e-6){const x=a.carry+l;f=Math.max(0,Math.round(x/de)),f>Ne?(m=x/Ne,f=Ne,a.carry=0):a.carry=x-f*de}const d=f?a.lumaCurrent:1-a.lumaCurrent,v=1-d;p(a.luma[v]);const g=e.pass("datamosh-match",pl,{input:a.luma[v],size:[Math.ceil(a.luma[0].width/8),Math.ceil(a.luma[0].height/8)],textures:{uPrevious:a.luma[d]}});if(f){for(let x=0;x<f;x+=1)s(a.current,(e.time-(f-1-x)*m)*u,m*u,g,t.follow/f),a.current=1-a.current;a.last={simTime:e.time*u,simDt:m*u,ticks:f}}else s(1-a.current,a.last.simTime,a.last.simDt,g,t.follow/a.last.ticks);e.release(g),a.lumaCurrent=v}return a.time=e.time,e.pass("datamosh-composite",hl,{input:o,textures:{uState:a.history[a.current]},uniforms:{uLod:a.lod}})},dispose(e,o){[...o.history||[],...o.luma||[]].forEach(t=>wl(e,t)),o.history=null,o.luma=null,o.key=null}},Ht=`
uniform float uPersistence;
uniform vec2 uSpread;
uniform vec2 uDrift;
uniform float uZoom;
uniform float uHue;

vec4 decayed(sampler2D history, vec2 uv) {
  vec2 b = (uv - 0.5) / max(uZoom, 0.01) + 0.5 - uDrift;
  vec4 sum = texture(history, b - uSpread);
  sum += texture(history, b + vec2(uSpread.x, -uSpread.y));
  sum += texture(history, b + vec2(-uSpread.x, uSpread.y));
  sum += texture(history, b + uSpread);
  vec4 trail = sum * 0.25 * uPersistence;
  if (uHue != 0.0 && trail.a > 0.0001) {
    vec3 hsv = rgb2hsv(trail.rgb / trail.a);
    trail.rgb = hsv2rgb(vec3(fract(hsv.x + uHue), hsv.y, hsv.z)) * trail.a;
  }
  return trail;
}
`,Ml=`
uniform float uLod;
void main() {
  outColor = vec4(textureLod(uInput, vUv, uLod).rgb, 1.0);
}`,Tl=`
void main() {
  outColor = vec4(0.0);
}`,Ll=`
uniform sampler2D uLive;
uniform sampler2D uPrevious;
uniform float uThreshold;
uniform float uStamp;
${Ht}
void main() {
  vec4 trail = decayed(uInput, vUv);
  vec3 live = texture(uLive, vUv).rgb;
  vec3 previous = texture(uPrevious, vUv).rgb;
  float change = dot(abs(live - previous), vec3(0.299, 0.587, 0.114));
  float m = smoothstep(uThreshold, uThreshold * 2.0 + 0.001, change);
  vec3 s = live * m;
  vec3 rgb = s + trail.rgb * (1.0 - m);
  if (uStamp > 1.5) rgb = s + trail.rgb;
  else if (uStamp > 0.5) rgb = s + trail.rgb - s * trail.rgb;
  outColor = vec4(rgb, m + trail.a * (1.0 - m));
}`,Ul=`
uniform sampler2D uHistory;
uniform float uOpacity;
uniform float uBlend;
uniform float uTint;
uniform vec3 uColor;
${Ht}
vec3 blendWith(vec3 b, vec3 s) {
  if (uBlend < 0.5) return s;
  if (uBlend < 1.5) return b + s;
  if (uBlend < 2.5) return 1.0 - (1.0 - b) * (1.0 - s);
  if (uBlend < 3.5) return b * s;
  if (uBlend < 4.5) return max(b, s);
  if (uBlend < 5.5) return min(b, s);
  return abs(b - s);
}

void main() {
  vec3 live = texture(uInput, vUv).rgb;
  vec4 trail = decayed(uHistory, vUv);
  if (uTint > 0.5 && uTint < 1.5) {
    float a = max(trail.a, 0.0001);
    float lum = dot(trail.rgb / a, vec3(0.299, 0.587, 0.114));
    trail.rgb = uColor * lum * 1.5 * trail.a;
  }
  vec3 straight = trail.a > 0.001 ? trail.rgb / trail.a : vec3(0.0);
  float alpha = clamp(trail.a, 0.0, 1.0) * uOpacity;
  outColor = vec4(blendWith(live, straight) * alpha + live * (1.0 - alpha), 1.0);
}`,Il={normal:0,add:1,screen:2,multiply:3,lighten:4,darken:5,difference:6},zl={none:0,color:1,rainbow:2},Al=1600,Rl=.5,Dl=(e,o)=>{e.deleteTexture(o.texture),e.deleteFramebuffer(o.fbo)},El=(e,o)=>{const t=Math.min(1,Al/Math.max(e.width,e.height)),a=Math.max(1,Math.round(e.width*t)),l=Math.max(1,Math.round(e.height*t)),r=`${e.width}x${e.height}`;return o.key===r&&o.history?!1:([...o.history||[],...o.live||[]].forEach(i=>e.release(i)),o.history=[e.engine.target(a,l),e.engine.target(a,l)],o.live=[e.engine.target(a,l,{float:!1}),e.engine.target(a,l,{float:!1})],o.key=r,o.lod=Math.log2(1/t),!0)},Pl={id:"echo",name:"Eco",category:"glitch",blend:"normal",description:"Anything that moves leaves a soft, fading trail, like a long exposure.",animated:!1,params:[{key:"length",label:"Trail length",type:"number",min:.05,max:4,step:.01,default:1},{key:"threshold",label:"Motion threshold",type:"number",min:.01,max:.5,step:.01,default:.06},{key:"softness",label:"Softness",type:"number",min:0,max:1,step:.01,default:1},{key:"opacity",label:"Trail opacity",type:"number",min:0,max:1,step:.01,default:1},{key:"blend",label:"Trail blend",type:"select",default:"normal",options:[{value:"normal",label:"Normal"},{value:"add",label:"Adicionar"},{value:"screen",label:"Screen"},{value:"multiply",label:"Multiply"},{value:"lighten",label:"Lighten"},{value:"darken",label:"Darken"},{value:"difference",label:"Difference"}]},{key:"tint",label:"Trail color",type:"select",default:"none",options:[{value:"none",label:"Original"},{value:"color",label:"Single color"},{value:"rainbow",label:"Rainbow"}]},{key:"color",label:"Cor",type:"color",default:"#33aaff",when:e=>e.tint==="color"},{key:"drift",label:"Drift",type:"number",min:0,max:1,step:.01,default:0},{key:"angle",label:"Drift angle",type:"number",min:0,max:360,step:1,default:90,when:e=>e.drift>0},{key:"zoom",label:"Zoom",type:"number",min:-1,max:1,step:.01,default:0}],render(e,o,t,a){const l=e.time-a.time,i=El(e,a)||!(l>=0)||l>Rl,n=a.lod>0&&!o.mipmapped?e.mipmap(o):o,u=(b,y)=>e.pass("echo-live",Ml,{input:n,target:b,uniforms:{uLod:y}});i&&(a.history.forEach(b=>e.pass("echo-clear",Tl,{target:b})),u(a.live[0],a.lod),a.current=0,a.dt=0);const c=!i&&l>1e-6,s=c?l:a.dt,p=i||c?a.current:1-a.current,f=1-p,m=t.softness*2*Math.sqrt(Math.max(s,0)*60),d=t.angle*Math.PI/180,v=t.drift*500*s,g=Il[t.blend]??0,x=zl[t.tint]??0,k={uPersistence:Math.exp(-s/Math.max(t.length,.001)),uSpread:[m*e.unit/e.width,m*e.unit/e.height],uDrift:[Math.cos(d)*v*e.unit/e.width,Math.sin(d)*v*e.unit/e.height],uZoom:Math.pow(1+t.zoom*.03,s*60),uHue:x===2?.35*s:0};u(a.live[f],a.lod),e.pass("echo-step",Ll,{input:a.history[p],target:a.history[f],textures:{uLive:a.live[f],uPrevious:a.live[p]},uniforms:{...k,uThreshold:t.threshold,uStamp:g===2?1:g===1?2:0}});const h=e.pass("echo-composite",Ul,{input:o,textures:{uHistory:a.history[p]},uniforms:{...k,uOpacity:t.opacity,uBlend:g,uTint:x,uColor:C(t.color)}});return a.current=f,a.time=e.time,a.dt=s,h},dispose(e,o){[...o.history||[],...o.live||[]].forEach(t=>Dl(e,t)),o.history=null,o.live=null,o.key=null}},ql=`
uniform float uCount;
uniform vec2 uDirection;
uniform float uIntensity;
uniform float uSeed;
uniform float uSpeed;
uniform float uEdges;

float barHash(float x) {
  return (fract(sin(x * 12.9898) * 43758.5453) - 0.5) * 2.0;
}

vec2 edgeUv(vec2 uv) {
  if (uEdges < 0.5) return 1.0 - abs(1.0 - mod(uv, 2.0));
  if (uEdges < 1.5) return clamp(uv, 0.0, 1.0);
  return fract(uv);
}

vec3 sharpSample(vec2 uv) {
  vec2 size = uResolution;
  vec2 pos = uv * size;
  vec2 c = floor(pos - 0.5) + 0.5;
  vec2 f = pos - c;
  vec2 w0 = f * (-0.5 + f * (1.0 - 0.5 * f));
  vec2 w1 = 1.0 + f * f * (-2.5 + 1.5 * f);
  vec2 w2 = f * (0.5 + f * (2.0 - 1.5 * f));
  vec2 w3 = f * f * (-0.5 + 0.5 * f);
  vec2 w12 = w1 + w2;
  vec2 t0 = (c - 1.0) / size;
  vec2 t3 = (c + 2.0) / size;
  vec2 t12 = (c + w2 / w12) / size;
  vec3 r = texture(uInput, vec2(t0.x, t0.y)).rgb * w0.x * w0.y;
  r += texture(uInput, vec2(t12.x, t0.y)).rgb * w12.x * w0.y;
  r += texture(uInput, vec2(t3.x, t0.y)).rgb * w3.x * w0.y;
  r += texture(uInput, vec2(t0.x, t12.y)).rgb * w0.x * w12.y;
  r += texture(uInput, vec2(t12.x, t12.y)).rgb * w12.x * w12.y;
  r += texture(uInput, vec2(t3.x, t12.y)).rgb * w3.x * w12.y;
  r += texture(uInput, vec2(t0.x, t3.y)).rgb * w0.x * w3.y;
  r += texture(uInput, vec2(t12.x, t3.y)).rgb * w12.x * w3.y;
  r += texture(uInput, vec2(t3.x, t3.y)).rgb * w3.x * w3.y;
  return max(r, 0.0);
}

vec3 bar(vec2 p, float index, vec2 along, float aspect) {
  float seed = uSeed * 0.137;
  float rest = barHash(index + seed);
  float rate = barHash(index + seed + 42.7);
  float offset = (rest + uTime * uSpeed * rate * 0.2) * uIntensity;
  vec2 q = p + along * offset;
  return sharpSample(edgeUv(vec2(q.x / aspect + 0.5, q.y + 0.5)));
}

void main() {
  float aspect = uResolution.x / uResolution.y;
  vec2 p = vec2((vUv.x - 0.5) * aspect, vUv.y - 0.5);
  vec2 along = vec2(-uDirection.y, uDirection.x);
  float coord = dot(p, uDirection) * uCount / max(aspect, 1.0);
  float index = floor(coord);
  float f = coord - index;
  float footprint = max(length(vec2(dFdx(coord), dFdy(coord))), 1e-5);
  vec3 color = bar(p, index, along, aspect);
  float lower = f / footprint;
  float upper = (1.0 - f) / footprint;
  if (lower < 0.5) color = mix(bar(p, index - 1.0, along, aspect), color, lower + 0.5);
  else if (upper < 0.5) color = mix(bar(p, index + 1.0, along, aspect), color, upper + 0.5);
  outColor = vec4(color, 1.0);
}`,Fl={mirror:0,stretch:1,repeat:2},Bl={id:"bars",name:"Bar shift",category:"glitch",blend:"normal",description:"Slices the picture into parallel bars and slides each one by its own amount.",animated:!0,animates:e=>e.speed>0&&e.intensity>0,params:[{key:"count",label:"Bars",type:"number",min:1,max:30,step:1,default:6},{key:"angle",label:"Ângulo",type:"number",min:0,max:180,step:1,default:0},{key:"intensity",label:"Shift",type:"number",min:0,max:1,step:.01,default:.15},{key:"speed",label:"Velocidade",type:"number",min:0,max:2,step:.05,default:.5},{key:"variation",label:"Variação",type:"number",min:0,max:100,step:1,default:0},{key:"edges",label:"Edges",type:"select",default:"mirror",options:[{value:"mirror",label:"Mirror"},{value:"stretch",label:"Stretch"},{value:"repeat",label:"Repeat"}]}],render(e,o,t){const a=t.angle*Math.PI/180;return e.pass("bars",ql,{input:o,uniforms:{uCount:t.count,uDirection:[Math.cos(a),Math.sin(a)],uIntensity:t.intensity,uSeed:t.variation,uSpeed:t.speed,uEdges:Fl[t.edges]??0}})}},Gl=`
uniform vec2 uTexel;
uniform float uThreshold;
uniform float uKnee;

vec3 tap(vec2 uv) {
  return toLinear(texture(uInput, uv).rgb);
}

void main() {
  vec2 uv = vUv;
  vec3 a = tap(uv + uTexel * vec2(-1.0, -1.0));
  vec3 b = tap(uv + uTexel * vec2(1.0, -1.0));
  vec3 c = tap(uv + uTexel * vec2(-1.0, 1.0));
  vec3 d = tap(uv + uTexel * vec2(1.0, 1.0));
  vec3 color = (a + b + c + d) * 0.25;
  float bright = max(color.r, max(color.g, color.b));
  float soft = clamp(bright - uThreshold + uKnee, 0.0, 2.0 * uKnee);
  soft = soft * soft / (4.0 * uKnee + 1e-5);
  float contribution = max(soft, bright - uThreshold) / max(bright, 1e-5);
  outColor = vec4(color * contribution, 1.0);
}`,Nl=`
uniform vec2 uTexel;

void main() {
  vec2 uv = vUv;
  vec2 t = uTexel;
  vec3 a = texture(uInput, uv + t * vec2(-2.0, 2.0)).rgb;
  vec3 b = texture(uInput, uv + t * vec2(0.0, 2.0)).rgb;
  vec3 c = texture(uInput, uv + t * vec2(2.0, 2.0)).rgb;
  vec3 d = texture(uInput, uv + t * vec2(-2.0, 0.0)).rgb;
  vec3 e = texture(uInput, uv).rgb;
  vec3 f = texture(uInput, uv + t * vec2(2.0, 0.0)).rgb;
  vec3 g = texture(uInput, uv + t * vec2(-2.0, -2.0)).rgb;
  vec3 h = texture(uInput, uv + t * vec2(0.0, -2.0)).rgb;
  vec3 i = texture(uInput, uv + t * vec2(2.0, -2.0)).rgb;
  vec3 j = texture(uInput, uv + t * vec2(-1.0, 1.0)).rgb;
  vec3 k = texture(uInput, uv + t * vec2(1.0, 1.0)).rgb;
  vec3 l = texture(uInput, uv + t * vec2(-1.0, -1.0)).rgb;
  vec3 m = texture(uInput, uv + t * vec2(1.0, -1.0)).rgb;
  vec3 color = e * 0.125 + (a + c + g + i) * 0.03125 + (b + d + f + h) * 0.0625 + (j + k + l + m) * 0.125;
  outColor = vec4(color, 1.0);
}`,Ol=`
uniform sampler2D uLower;
uniform vec2 uTexel;
uniform float uSpread;

void main() {
  vec4 d = vec4(1.0, 1.0, -1.0, 0.0) * uTexel.xyxy;
  vec3 s = texture(uLower, vUv - d.xy).rgb;
  s += texture(uLower, vUv - d.wy).rgb * 2.0;
  s += texture(uLower, vUv - d.zy).rgb;
  s += texture(uLower, vUv + d.zw).rgb * 2.0;
  s += texture(uLower, vUv).rgb * 4.0;
  s += texture(uLower, vUv + d.xw).rgb * 2.0;
  s += texture(uLower, vUv + d.zy).rgb;
  s += texture(uLower, vUv + d.wy).rgb * 2.0;
  s += texture(uLower, vUv + d.xy).rgb;
  outColor = vec4(texture(uInput, vUv).rgb + s / 16.0 * uSpread, 1.0);
}`,Hl=`
uniform sampler2D uBloom;
uniform sampler2D uSmall;
uniform float uIntensity;
uniform vec3 uTint;
uniform float uLevels;

void main() {
  vec3 base = toLinear(texture(uInput, vUv).rgb);
  vec3 glow = texture(uBloom, vUv).rgb / max(uLevels * 0.55, 1.0);
  vec3 mean = texture(uSmall, vec2(0.25)).rgb + texture(uSmall, vec2(0.75, 0.25)).rgb;
  mean += texture(uSmall, vec2(0.25, 0.75)).rgb + texture(uSmall, vec2(0.75)).rgb;
  float energy = luma(mean * 0.25);
  glow *= uIntensity * 1.5 / (1.0 + energy * 5.0);
  vec3 color = 1.0 - (1.0 - base) * exp(-glow * uTint);
  outColor = vec4(toGamma(color), 1.0);
}`,Wl={id:"bloom",name:"Bloom",category:"light",blend:"normal",description:"Soft glow around the brightest parts of the image.",animated:!1,preview:{params:{threshold:.5,intensity:1.5}},params:[{key:"threshold",label:"Threshold",type:"number",min:0,max:1,step:.01,default:.72},{key:"intensity",label:"Intensidade",type:"number",min:0,max:4,step:.01,default:.65},{key:"radius",label:"Radius",type:"number",min:.2,max:1,step:.01,default:.7},{key:"softness",label:"Softness",type:"number",min:.05,max:1,step:.01,default:.5},{key:"tint",label:"Tint",type:"color",default:"#ffffff"}],render(e,o,t){const a=Math.max(2,Math.round(e.width/2)),l=Math.max(2,Math.round(e.height/2)),r=Math.pow(t.threshold,2.2),i=e.pass("bloom-pre",Gl,{input:o,target:e.target(a,l),uniforms:{uTexel:[1/e.width,1/e.height],uThreshold:r,uKnee:Math.max(r*t.softness,.001)}}),n=[i];let u=i;for(;n.length<7&&Math.min(u.width,u.height)>12;){const f=e.pass("bloom-down",Nl,{input:u,target:e.target(Math.max(1,Math.round(u.width/2)),Math.max(1,Math.round(u.height/2))),uniforms:{uTexel:[1/u.width,1/u.height]}});n.push(f),u=f}const c=n[n.length-1];let s=c;for(let f=n.length-2;f>=0;f-=1){const m=n[f],d=e.pass("bloom-up",Ol,{input:m,target:e.target(m.width,m.height),textures:{uLower:s},uniforms:{uTexel:[1/s.width,1/s.height],uSpread:t.radius}});n.includes(s)||e.release(s),s=d}const p=e.pass("bloom-composite",Hl,{input:o,textures:{uBloom:s,uSmall:c},uniforms:{uIntensity:t.intensity,uTint:C(t.tint),uLevels:n.length}});return n.forEach(f=>e.release(f)),s!==c&&e.release(s),p}},jl=`
uniform float uThreshold;
void main() {
  vec3 linear = toLinear(texture(uInput, vUv).rgb);
  float l = luma(linear);
  float k = smoothstep(uThreshold, uThreshold + 0.35, l);
  outColor = vec4(toGamma(linear * k), 1.0);
}`,_l=`
uniform sampler2D uHalo;
uniform sampler2D uWide;
uniform sampler2D uBright;
uniform float uTop;
uniform vec3 uTint;
uniform float uIntensity;

void main() {
  vec3 base = toLinear(texture(uInput, vUv).rgb);
  vec3 halo = toLinear(texture(uHalo, vUv).rgb);
  vec3 wide = toLinear(texture(uWide, vUv).rgb);
  float mean = luma(toLinear(textureLod(uBright, vec2(0.5), uTop).rgb));
  float energy = (luma(halo) * 0.65 + luma(wide) * 0.5) / (1.0 + mean * 6.0);
  vec3 color = 1.0 - (1.0 - base) * exp(-uTint * energy * uIntensity * 2.2);
  outColor = vec4(toGamma(color), 1.0);
}`,$l={id:"halation",name:"Halation",category:"light",blend:"normal",description:"The warm red halo film puts around bright lights.",animated:!1,preview:{params:{threshold:.3,intensity:1.5}},params:[{key:"threshold",label:"Threshold",type:"number",min:0,max:1,step:.01,default:.45},{key:"radius",label:"Radius",type:"number",min:1,max:30,step:.1,default:9},{key:"intensity",label:"Intensidade",type:"number",min:0,max:2,step:.01,default:.7},{key:"tint",label:"Cor",type:"color",default:"#ff3d1f"}],render(e,o,t){const a=e.mipmap(e.pass("halation-extract",jl,{input:o,uniforms:{uThreshold:t.threshold*.8}})),l=E(e,a,Math.max(1,t.radius*e.unit*.5)),r=E(e,a,Math.max(2,t.radius*e.unit*1.6)),i=e.pass("halation",_l,{input:o,textures:{uHalo:l,uWide:r,uBright:a},uniforms:{uTint:C(t.tint),uIntensity:t.intensity,uTop:Math.floor(Math.log2(Math.max(e.width,e.height)))}});return e.release(a),e.release(l),e.release(r),i}},Vl=`
uniform vec2 uAnchor;
uniform float uSpread;
uniform float uIntensity;
uniform float uStreaks;
uniform vec3 uHot;
uniform vec3 uMid;
uniform vec3 uFringe;
uniform vec4 uDrift;
uniform float uClock;

vec3 ramp(float heat) {
  float toMid = smoothstep(0.0, 0.5, heat);
  float toHot = smoothstep(0.55, 1.15, heat);
  return mix(mix(uFringe, uMid, toMid), uHot, toHot) * clamp(heat, 0.0, 1.6);
}

float band(float u, float center, float width) {
  return exp(-(u - center) * (u - center) / (width * width));
}

void main() {
  vec2 frame = uResolution / min(uResolution.x, uResolution.y);
  vec2 p = vUv * frame;
  vec2 anchor = uAnchor * frame;
  vec2 toCenter = frame * 0.5 - anchor;
  float reach = length(toCenter);
  vec2 dir = reach < 0.02 ? vec2(1.0, 0.0) : toCenter / max(reach, 0.001);
  vec2 rel = p - anchor;
  float u = dot(rel, dir);
  float v = rel.y * dir.x - rel.x * dir.y;

  float sp = max(uSpread, 0.05);
  float elong = sp * (1.5 + 0.7 * uDrift.z);
  float du = u / sp;
  float dv = v / elong;
  float r2 = du * du + dv * dv;
  float core = exp(-r2 * 1.9);
  float shoulder = exp(-r2 * 0.45) * 0.22;

  float along = exp(-dv * dv * 0.55);
  float c1 = sp * (0.42 + 0.22 * uDrift.y);
  float w1 = max(sp * (0.07 + 0.07 * uDrift.w), 0.008);
  float c2 = sp * (0.8 + 0.3 * uDrift.y);
  float w2 = max(sp * (0.16 + 0.12 * uDrift.w), 0.015);
  float streaks = (band(u, c1, w1) + band(u, c2, w2) * 0.45) * along * uStreaks;

  float heat = (core * 1.25 + shoulder + streaks * 0.85) * uIntensity * 2.2 * uDrift.x;
  heat = max(heat + (hash12(vUv * 1024.0 + vec2(uClock, uClock * 1.7)) - 0.5) * 0.012, 0.0);
  vec3 leak = vec3(ramp(heat * 1.08).r, ramp(heat).g, ramp(heat * 0.88).b);

  vec3 base = clamp(toLinear(texture(uInput, vUv).rgb), 0.0, 1.0);
  vec3 screened = 1.0 - (1.0 - base) * (1.0 - clamp(leak, 0.0, 1.0));
  vec3 color = clamp(screened + leak * 0.16, 0.0, 1.0);
  outColor = vec4(toGamma(color), 1.0);
}`,ht={right:[.95,.4],"top-right":[.9,.1],top:[.6,.04],"top-left":[.1,.1],left:[.05,.4],"bottom-left":[.1,.9],bottom:[.4,.96],"bottom-right":[.9,.9]},Ue=(e,o)=>{const t=Math.sin(e*127.1+o*311.7)*43758.5453123;return t-Math.floor(t)},ye=(e,o)=>{const t=Math.floor(e),a=Math.floor(o),l=e-t,r=o-a,i=l*l*(3-2*l),n=r*r*(3-2*r),u=Ue(t,a),c=Ue(t+1,a),s=Ue(t,a+1),p=Ue(t+1,a+1);return u+(c-u)*i+(s-u)*n+(u-c-s+p)*i*n},Oe=e=>C(e).map(o=>Math.pow(o,2.2)),Xl={id:"leak",name:"Light leak",category:"light",blend:"normal",description:"Warm overexposed light bleeding in from one edge, with streak bands, color fringes and slow breathing.",animated:!0,preview:{params:{intensity:.42,spread:.6}},animates:e=>e.speed>0&&e.intensity>0,params:[{key:"position",label:"Posição",type:"select",default:"right",options:[{value:"right",label:"Direita"},{value:"top-right",label:"Top right"},{value:"top",label:"Topo"},{value:"top-left",label:"Top left"},{value:"left",label:"Esquerda"},{value:"bottom-left",label:"Bottom left"},{value:"bottom",label:"Base"},{value:"bottom-right",label:"Bottom right"}]},{key:"intensity",label:"Intensidade",type:"number",min:0,max:1,step:.01,default:.25},{key:"spread",label:"Spread",type:"number",min:.1,max:1.5,step:.01,default:.45},{key:"streaks",label:"Streaks",type:"number",min:0,max:1,step:.01,default:.6},{key:"hot",label:"Core",type:"color",default:"#fff3c4"},{key:"mid",label:"Cor",type:"color",default:"#ff7a2f"},{key:"fringe",label:"Fringe",type:"color",default:"#a63d8f"},{key:"flicker",label:"Flicker",type:"number",min:0,max:1,step:.01,default:.35},{key:"speed",label:"Velocidade",type:"number",min:0,max:4,step:.05,default:1},{key:"variation",label:"Variação",type:"number",min:0,max:100,step:1,default:0}],render(e,o,t){const a=t.variation,l=e.time*t.speed*.6+a*7.9,n=[1+(.25+1.5*(ye(l*.9,a*.53+11.7)*.65+ye(l*2.7+41.3,a*.29+5.1)*.35)-1)*t.flicker,ye(l*.13+3.1,a*.41+27),ye(l*.09+17.7,a*.61+8.4),ye(l*.17+51.2,a*.23+2.9)],[u,c]=ht[t.position]||ht.right;return e.pass("light-leak",Vl,{input:o,uniforms:{uAnchor:[u,1-c],uSpread:t.spread,uIntensity:t.intensity,uStreaks:t.streaks,uHot:Oe(t.hot),uMid:Oe(t.mid),uFringe:Oe(t.fringe),uDrift:n,uClock:l}})}},Yl=`
uniform float uSpacing;
uniform float uIntensity;
uniform float uThreshold;
uniform float uExpand;
uniform float uRayRate;
uniform float uColorize;
uniform float uClock;
uniform float uSeed;
uniform float uScale;

vec3 scatterHash(vec2 p) {
  uvec2 u = floatBitsToUint(p * vec2(141421356.0, 2718281828.0));
  uint h = u.x ^ u.y;
  uvec3 prod = uvec3(h) * uvec3(1732050807u, 2645751311u, 3316624790u);
  return vec3(prod) / 4294967295.0;
}

vec4 brightest(vec2 point, float angle) {
  vec3 color = toLinear(texture(uInput, point / uResolution).rgb);
  float best = dot(color, LUMA);
  if (uExpand > 0.0) {
    for (int i = 0; i < 4; i++) {
      float a = angle + float(i) * 1.5707963;
      vec3 tap = toLinear(texture(uInput, (point + vec2(cos(a), sin(a)) * uExpand) / uResolution).rgb);
      float l = dot(tap, LUMA);
      if (l > best) {
        best = l;
        color = tap;
      }
    }
  }
  return vec4(color, best);
}

float glint(vec2 o, float reach) {
  vec2 a = abs(o);
  float core = exp(-dot(o, o) * 0.9);
  float rays = exp(-(a.x * 1.6 + a.y * uRayRate)) + exp(-(a.y * 1.6 + a.x * uRayRate));
  return (core + rays * 0.25) * (1.0 - smoothstep(reach * 0.6, reach, max(a.x, a.y)));
}

vec3 layer(vec2 px, float scale, float index) {
  float cell = uSpacing * scale;
  vec2 base = floor(px / cell - 0.5);
  float seed = uSeed + index * 0.31;
  vec2 salt = vec2(seed * 97.13, seed * 31.71);
  vec3 sum = vec3(0.0);
  for (int j = 0; j < 4; j++) {
    vec2 c = base + vec2(float(j % 2), float(j / 2));
    vec3 r = scatterHash(c + salt);
    vec2 point = (c + 0.5 + (r.xy - 0.5) * 0.6) * cell;
    vec4 source = brightest(point, index * 0.7853982);
    float presence = smoothstep(uThreshold, uThreshold + 0.12, sqrt(max(source.a, 0.0)));
    float blink = max(sin(uClock * (0.8 + r.z * 1.2) + r.x * TAU), 0.0);
    blink *= blink;
    blink *= blink;
    blink *= blink;
    float level = 0.35 + 0.65 * step(0.45, r.z);
    float star = glint((px - point) / uScale, cell * 0.5 / uScale);
    vec3 hue = source.rgb / max(source.a, 0.001) * 0.6;
    vec3 tint = mix(vec3(1.0), hue, uColorize);
    sum += tint * star * blink * presence * level * uIntensity;
  }
  return sum;
}

void main() {
  vec2 px = vUv * uResolution;
  vec3 glow = layer(px, 1.0, 0.0) + layer(px, 2.0 / 3.0, 1.0);
  vec3 color = toLinear(texture(uInput, vUv).rgb) + glow;
  outColor = vec4(clamp(toGamma(color), 0.0, 1.0), 1.0);
}`,Kl={id:"sparkle",name:"Sparkle",category:"light",blend:"normal",description:"Twinkling star glints over the bright parts of the image.",animated:!0,preview:{zoom:2.5,params:{threshold:.7,intensity:14}},animates:e=>e.speed>0&&e.intensity>0,params:[{key:"spacing",label:"Spacing",type:"number",min:10,max:200,step:1,default:60},{key:"intensity",label:"Intensidade",type:"number",min:0,max:20,step:.1,default:10},{key:"threshold",label:"Threshold",type:"number",min:0,max:1,step:.01,default:.82},{key:"expand",label:"Reach",type:"number",min:0,max:100,step:1,default:10},{key:"rays",label:"Ray length",type:"number",min:0,max:20,step:.1,default:5},{key:"colorize",label:"Image color",type:"number",min:0,max:1,step:.01,default:.45},{key:"speed",label:"Twinkle speed",type:"number",min:0,max:5,step:.05,default:1},{key:"variation",label:"Variação",type:"number",min:0,max:100,step:1,default:0}],render(e,o,t){if(t.intensity<=0)return o;const a=Math.max(e.unit,.4);return e.pass("sparkle",Yl,{input:o,uniforms:{uSpacing:t.spacing*e.unit,uIntensity:t.intensity,uThreshold:t.threshold,uExpand:t.expand*e.unit,uRayRate:.45/Math.max(t.rays,.01),uColorize:t.colorize,uClock:e.time*t.speed,uSeed:t.variation,uScale:a}})}},Zl=`
uniform float uDistortion;
uniform float uChroma;
uniform float uVignette;
uniform float uVignetteSize;
uniform float uSoftness;
uniform float uZoom;

vec2 distort(vec2 uv, float k) {
  vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
  vec2 c = (uv - 0.5) * aspect;
  float r2 = dot(c, c);
  c *= (1.0 + k * r2) / uZoom;
  return c / aspect + 0.5;
}

void main() {
  vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
  float r = length((vUv - 0.5) * aspect);
  float edge = smoothstep(0.15, 0.85, r);
  float lod = edge * uSoftness * 4.0;
  vec2 uvG = distort(vUv, uDistortion);
  vec2 uvR = distort(vUv, uDistortion + uChroma * 0.06);
  vec2 uvB = distort(vUv, uDistortion - uChroma * 0.06);
  vec3 color = vec3(
    textureLod(uInput, uvR, lod).r,
    textureLod(uInput, uvG, lod).g,
    textureLod(uInput, uvB, lod).b
  );
  float vig = 1.0 - smootherstep(uVignetteSize * 0.55, uVignetteSize * 0.55 + 0.6, r);
  color *= mix(1.0, vig, uVignette);
  outColor = vec4(color, 1.0);
}`,Jl={id:"lens",name:"Lens",category:"lens",blend:"normal",description:"Barrel distortion, soft corners, edge fringes and vignette.",animated:!1,preview:{params:{distortion:.3,chroma:.9,vignette:.9}},params:[{key:"distortion",label:"Distortion",type:"number",min:-.6,max:.6,step:.01,default:.12},{key:"chroma",label:"Edge fringes",type:"number",min:0,max:1,step:.01,default:.35},{key:"softness",label:"Soft corners",type:"number",min:0,max:1,step:.01,default:.3},{key:"vignette",label:"Vignette",type:"number",min:0,max:1,step:.01,default:.5},{key:"vignetteSize",label:"Vignette size",type:"number",min:.2,max:1.5,step:.01,default:.85}],render(e,o,t){const a=o.mipmapped?o:e.mipmap(o),l=t.distortion;return e.pass("lens",Zl,{input:a,uniforms:{uDistortion:l,uChroma:t.chroma,uVignette:t.vignette,uVignetteSize:t.vignetteSize,uSoftness:t.softness,uZoom:l>0?1+l*.42:1+l*.05}})}},Ql=`
uniform float uMode;
uniform float uAmount;
uniform vec2 uDirection;
uniform vec2 uCenter;

void main() {
  vec2 span = uMode < 0.5 ? uDirection * uAmount / uResolution : (vUv - uCenter) * uAmount * 0.0036;
  float jitter = (hash12(gl_FragCoord.xy) - 0.5) / 31.0;
  vec3 sum = vec3(0.0);
  float total = 0.0;
  for (int i = 0; i < 32; i++) {
    float t = float(i) / 31.0 - 0.5 + jitter;
    float w = 1.0 - abs(t) * 0.8;
    sum += texture(uInput, vUv + span * t).rgb * w;
    total += w;
  }
  outColor = vec4(sum / total, 1.0);
}`,er=`
uniform sampler2D uSoft;
uniform sampler2D uSofter;
uniform float uFocus;
uniform float uWidth;

void main() {
  float d = abs(vUv.y - uFocus);
  float k = smoothstep(uWidth * 0.5, uWidth * 0.5 + 0.28, d);
  vec3 sharp = texture(uInput, vUv).rgb;
  vec3 soft = texture(uSoft, vUv).rgb;
  vec3 softer = texture(uSofter, vUv).rgb;
  vec3 color = mix(sharp, soft, smoothstep(0.0, 0.5, k));
  color = mix(color, softer, smoothstep(0.5, 1.0, k));
  float pop = 1.0 + (1.0 - k) * 0.06;
  outColor = vec4(mix(vec3(luma(color)), color, pop), 1.0);
}`,tr={id:"blur",name:"Desfoque",category:"lens",blend:"normal",description:"Gaussian, zoom, motion or tilt-shift blur.",animated:!1,preview:{params:{amount:22}},params:[{key:"mode",label:"Type",type:"select",default:"gaussian",options:[{value:"gaussian",label:"Gaussian"},{value:"zoom",label:"Zoom"},{value:"motion",label:"Movimento"},{value:"tilt",label:"Tilt-shift"}]},{key:"amount",label:"Amount",type:"number",min:0,max:60,step:.1,default:8},{key:"angle",label:"Ângulo",type:"number",min:0,max:180,step:1,default:0,when:e=>e.mode==="motion"},{key:"focus",label:"Focus",type:"number",min:0,max:1,step:.01,default:.45,when:e=>e.mode==="tilt"},{key:"width",label:"Focus size",type:"number",min:.02,max:.8,step:.01,default:.22,when:e=>e.mode==="tilt"}],render(e,o,t){const a=t.amount*e.unit;if(a<=.01)return o;if(t.mode==="gaussian")return E(e,o,a*.5);if(t.mode==="tilt"){const r=E(e,o,a*.3),i=E(e,o,a*.8),n=e.pass("blur-tilt",er,{input:o,textures:{uSoft:r,uSofter:i},uniforms:{uFocus:1-t.focus,uWidth:t.width}});return e.release(r),e.release(i),n}const l=t.angle*Math.PI/180;return e.pass("blur-directional",Ql,{input:o,uniforms:{uMode:t.mode==="motion"?0:1,uAmount:t.mode==="motion"?a*2:t.amount,uDirection:[Math.cos(l),Math.sin(l)],uCenter:[.5,.5]}})}},or=`
uniform float uGain;
uniform float uThreshold;

void main() {
  vec3 color = toLinear(texture(uInput, vUv).rgb);
  float hi = smoothstep(uThreshold, uThreshold + 0.35, dot(color, LUMA));
  float weight = (1.0 + uGain * hi * hi) / (1.0 + uGain);
  outColor = vec4(color * weight, weight);
}`,ar=`
uniform vec4 uTaps[100];
uniform vec2 uSource;
uniform vec2 uRotate;
uniform float uRadius;
uniform float uFringe;
uniform float uCatEye;
uniform float uLod;

void main() {
  vec2 texel = 1.0 / uSource;
  float aspect = uSource.x / uSource.y;
  vec2 v = vec2((vUv.x - 0.5) * aspect, vUv.y - 0.5);
  float reach = length(v);
  float corner = sqrt(0.25 * aspect * aspect + 0.25);
  vec2 shift = v * (uCatEye * (reach / corner) * 1.4 / max(reach, 0.0001));
  vec3 sum = vec3(0.0);
  vec3 total = vec3(0.0);
  for (int i = 0; i < 100; i++) {
    vec4 tap = uTaps[i];
    vec2 o = vec2(tap.x * uRotate.x - tap.y * uRotate.y, tap.x * uRotate.y + tap.y * uRotate.x);
    float k = tap.z * (1.0 - smoothstep(1.02, 1.12, length(o + shift)));
    vec2 offset = o * uRadius * texel;
    vec4 base = textureLod(uInput, vUv + offset, uLod);
    vec4 red = base;
    vec4 blue = base;
    if (uFringe > 0.001) {
      red = textureLod(uInput, vUv + offset * (1.0 + uFringe * 0.5), uLod);
      blue = textureLod(uInput, vUv + offset * (1.0 - uFringe * 0.5), uLod);
    }
    sum += vec3(red.r, base.g, blue.b) * k;
    total += vec3(red.a, base.a, blue.a) * k;
  }
  outColor = vec4(sum / max(total, vec3(1e-5)), 1.0);
}`,lr=`
void main() {
  outColor = vec4(toGamma(texture(uInput, vUv).rgb), 1.0);
}`,we=100,rr=1024,ir=Math.PI*(3-Math.sqrt(5)),Me=Math.PI*2,gt=.6,nr=8,ur=.25,sr=(e,o)=>{if(o<3)return 1;const t=Me/o,a=e-t*Math.floor(e/t+.5);return Math.cos(t*.5)/Math.cos(a)},cr=(e,o)=>{const t=1.3333333333333333,a=Math.abs(e)/t,l=-o/t+.6;if(a+l>1)return(Math.hypot(a-.25,l-.75)-Math.SQRT2/4)*t;const r=l-1,i=Math.max(a+l,0)*.5;return Math.sqrt(Math.min(a*a+r*r,(a-i)**2+(l-i)**2))*Math.sign(a-l)*t},fr=(e,o,t,a)=>{const l=Math.hypot(e,o),r=Me/t,i=Math.atan2(o,e)-Math.floor(Math.atan2(o,e)/r+.5)*r,n=Math.abs(l*Math.sin(i)),u=l*Math.cos(i),c=Math.PI/t,s=a*Math.sin(c),p=a*Math.cos(c)-1,f=u-1,m=Math.min(Math.max((n*s+f*p)/(s*s+p*p),0),1);return Math.hypot(n-s*m,u-(1+p*m))*Math.sign(s*f-p*n)},mr=(e,o,t,a)=>{const l=Math.atan2(o,e)*t/Me,r=Math.abs((l-Math.floor(l))*2-1);return Math.hypot(e,o)-(a+(1-a)*r)},dr=(e,o)=>{const t=Math.abs(e),a=Math.abs(o);return Math.min(Math.max(t-.92,a-.3),Math.max(a-.92,t-.3))-.08},pr=(e,o)=>Math.abs(Math.hypot(e,o)-.72)-.28,bt=(e,o)=>{let t=1,a=0,l=e;for(;l>0;)t/=o,a+=t*(l%o),l=Math.floor(l/o);return a},yt=e=>Math.round(e)>=3?Math.round(e):5,vr={star:.47,flower:.62,heart:.5,cross:.69,ring:.81},hr={star:(e,o,t)=>fr(-o,e,yt(t),.5),flower:(e,o,t)=>mr(-o,e,yt(t),.55),heart:(e,o)=>cr(e,o),cross:(e,o)=>dr(e,o),ring:(e,o)=>pr(e,o)};function Wt(e,o){const t=[],a=hr[e];if(a){for(let u=1;t.length<we&&u<=2e4;u+=1){const c=bt(u,2)*2-1,s=bt(u,3)*2-1,p=a(c,s,o);if(p>0)continue;const f=Math.min(Math.max(1+p/ur,0),1);t.push([-c,-s,1+gt*f*f])}if(!t.length)return Wt("circle",0);for(let u=0;t.length<we;u+=1)t.push(t[u%t.length]);const n=t.reduce((u,c)=>Math.max(u,Math.hypot(c[0],c[1])),0);n>1&&t.forEach(u=>{u[0]/=n,u[1]/=n})}else{const n=e==="circle"?0:Math.round(o);for(let u=0;u<we;u+=1){const c=Math.sqrt((u+.5)/we),s=u*ir,p=c*sr(s,n);t.push([-Math.cos(s)*p,-Math.sin(s)*p,1+gt*Math.pow(c,nr)])}}const l=Math.round(o),r=l>=3?l*Math.sin(Me/l)/Me:1,i=vr[e]??(e==="circle"?1:r);return{list:t.map(([n,u,c])=>[n,-u,c,0]),area:i}}const gr={id:"bokeh",name:"Lens blur",category:"lens",blend:"normal",description:"Photographic lens blur where bright highlights bloom into aperture-shaped discs.",animated:!1,params:[{key:"radius",label:"Amount",type:"number",min:0,max:100,step:1,default:35},{key:"gain",label:"Highlight bloom",type:"number",min:0,max:10,step:.1,default:8},{key:"threshold",label:"Highlight threshold",type:"number",min:0,max:1,step:.01,default:.45},{key:"shape",label:"Aperture",type:"select",default:"blades",options:[{value:"blades",label:"Blades"},{value:"circle",label:"Circle"},{value:"star",label:"Star"},{value:"heart",label:"Heart"},{value:"flower",label:"Flower"},{value:"cross",label:"Cross"},{value:"ring",label:"Ring"}]},{key:"blades",label:"Blades",type:"number",min:3,max:9,step:1,default:6,when:e=>e.shape==="blades"||e.shape==="star"||e.shape==="flower"},{key:"rotation",label:"Rotação",type:"number",min:0,max:360,step:1,default:0},{key:"fringe",label:"Color fringe",type:"number",min:0,max:1,step:.01,default:.2},{key:"catEye",label:"Cat eye",type:"number",min:0,max:1,step:.01,default:0}],render(e,o,t,a){const l=t.radius*.8*e.unit;if(l<.5)return o;const r=`${t.shape}|${Math.round(t.blades)}`;a.key!==r&&(a.key=r,a.taps=Wt(t.shape,t.blades));const i=e.mipmap(e.pass("bokeh-weight",or,{input:o,uniforms:{uGain:t.gain,uThreshold:t.threshold}})),n=Math.min(1,rr/Math.max(e.width,e.height)),u=Math.max(8,Math.round(e.width*n)),c=Math.max(8,Math.round(e.height*n)),s=l*Math.sqrt(Math.PI*a.taps.area/we),p=-t.rotation*Math.PI/180,f=e.pass("bokeh-gather",ar,{input:i,target:e.target(u,c),uniforms:{uTaps:a.taps.list,uSource:[e.width,e.height],uRotate:[Math.cos(p),Math.sin(p)],uRadius:l,uFringe:t.fringe,uCatEye:t.catEye,uLod:Math.max(0,Math.log2(Math.max(s,1))-.5)}});e.release(i);const m=e.pass("bokeh-output",lr,{input:f});return e.release(f),m}},br=`
uniform float uAmount;
uniform float uSize;
uniform float uChroma;
uniform float uSeed;
uniform float uProtect;

float grainAt(vec2 p, float seed) {
  vec2 q = p / uSize + vec2(seed * 17.13, seed * 9.71);
  float n = valueNoise(q) * 1.0 + valueNoise(q * 1.93 + 4.1) * 0.62 + valueNoise(q * 3.71 + 9.3) * 0.36;
  return n / 1.98 - 0.5;
}

void main() {
  vec3 color = texture(uInput, vUv).rgb;
  vec2 p = vUv * uResolution;
  float l = luma(color);
  float response = mix(1.0, 4.0 * l * (1.0 - l), 0.55);
  response *= 1.0 - smoothstep(0.75, 1.0, l) * uProtect;
  response *= 1.0 - (1.0 - smoothstep(0.0, 0.08, l)) * uProtect * 0.6;
  float mono = grainAt(p, uSeed);
  vec3 grain = vec3(mono);
  if (uChroma > 0.0) {
    vec3 tinted = vec3(mono, grainAt(p, uSeed + 3.31), grainAt(p, uSeed + 7.77));
    grain = mix(grain, tinted, uChroma);
  }
  color += grain * uAmount * response * 0.6;
  outColor = vec4(color, 1.0);
}`,yr={id:"grain",name:"Grain",category:"film",blend:"normal",description:"Film grain that lives in the midtones and moves every frame.",animated:!0,preview:{zoom:2.5,params:{amount:.7}},animates:e=>e.motion>0&&e.amount>0,params:[{key:"amount",label:"Amount",type:"number",min:0,max:1,step:.01,default:.28},{key:"size",label:"Tamanho",type:"number",min:.4,max:5,step:.05,default:1.1},{key:"chroma",label:"Cor",type:"number",min:0,max:1,step:.01,default:.15},{key:"protect",label:"Protect highlights",type:"number",min:0,max:1,step:.01,default:.5},{key:"motion",label:"Movimento",type:"number",min:0,max:2,step:.01,default:1}],render(e,o,t){const a=t.motion>0?Math.floor(e.time*24*t.motion)%997:0;return e.pass("grain",br,{input:o,uniforms:{uAmount:t.amount,uSize:Math.max(.5,t.size*e.unit),uChroma:t.chroma,uSeed:a*1.37,uProtect:t.protect}})}},xr=`
uniform float uWeave;
uniform float uFlicker;
uniform float uDust;
uniform float uScratches;
uniform float uSeed;
uniform float uFade;
uniform float uWarmth;

void main() {
  vec2 weave = (vec2(hash11(uSeed), hash11(uSeed + 3.1)) - 0.5) * vec2(0.6, 1.0) * uWeave * 3.0 * uUnit / uResolution;
  vec3 color = texture(uInput, vUv + weave).rgb;
  color *= 1.0 + (hash11(uSeed * 1.7 + 0.3) - 0.5) * uFlicker * 0.16;

  vec2 grid = uResolution / max(uUnit * 46.0, 8.0);
  vec2 p = vUv * grid;
  vec2 cell = floor(p);
  vec2 f = fract(p);
  float h = hash12(cell + uSeed * 1.31);
  if (h < uDust * 0.09) {
    vec2 center = 0.2 + hash22(cell + uSeed * 2.07) * 0.6;
    float size = mix(0.04, 0.16, hash12(cell + uSeed * 3.3));
    vec2 d = (f - center) * vec2(1.0, mix(0.5, 1.8, hash12(cell + 9.1)));
    float hair = abs(d.y + sin(d.x * 18.0 + h * 40.0) * 0.05);
    float speck = h < uDust * 0.06 ? smoothstep(size, size * 0.35, length(d)) : smoothstep(0.012, 0.0, hair) * step(abs(d.x), size * 2.5);
    vec3 tone = h < uDust * 0.03 ? vec3(0.02) : vec3(0.96, 0.94, 0.9);
    color = mix(color, tone, speck * 0.85);
  }

  for (int i = 0; i < 2; i++) {
    float fi = float(i);
    float epoch = floor(uTime * 0.6 + fi * 0.37);
    float alive = step(0.45, hash11(epoch * 3.1 + fi));
    float x = hash11(epoch * 7.3 + fi * 11.0) + sin(uTime * 3.0 + fi) * 0.002;
    float width = (0.6 + hash11(epoch + fi) * 1.2) * uUnit / uResolution.x;
    float line = smoothstep(width, 0.0, abs(vUv.x - x)) * alive * (0.6 + hash11(uSeed + fi) * 0.4);
    color = mix(color, color * 0.55 + vec3(0.18), line * uScratches);
  }

  color = color * (1.0 - uFade * 0.16) + vec3(0.05, 0.04, 0.035) * uFade;
  color *= vec3(1.0 + uWarmth * 0.06, 1.0, 1.0 - uWarmth * 0.08);
  outColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}`,kr={id:"film",name:"Film",category:"film",blend:"normal",description:"Projector weave, flicker, dust and scratches.",animated:!0,preview:{params:{dust:1,scratches:.9,fade:.5}},animates:()=>!0,params:[{key:"weave",label:"Gate weave",type:"number",min:0,max:1,step:.01,default:.35},{key:"flicker",label:"Flicker",type:"number",min:0,max:1,step:.01,default:.35},{key:"dust",label:"Dust",type:"number",min:0,max:1,step:.01,default:.4},{key:"scratches",label:"Scratches",type:"number",min:0,max:1,step:.01,default:.3},{key:"fade",label:"Fade",type:"number",min:0,max:1,step:.01,default:.3},{key:"warmth",label:"Warmth",type:"number",min:-1,max:1,step:.01,default:.25},{key:"fps",label:"Frame rate",type:"number",min:6,max:30,step:1,default:18}],render(e,o,t){const a=Math.floor(e.time*t.fps)%997*1.371+.5;return e.pass("film",xr,{input:o,uniforms:{uWeave:t.weave,uFlicker:t.flicker,uDust:t.dust,uScratches:t.scratches,uSeed:a,uFade:t.fade,uWarmth:t.warmth}})}},wr=`
uniform float uZoom;
uniform float uSharp;
uniform float uThickness;
uniform float uClock;
uniform float uRoll;
uniform float uMode;
uniform float uSeed;
uniform float uOpacity;
uniform vec3 uColor;

float cellHash(vec2 p) {
  uvec2 u = floatBitsToUint(p * vec2(141421356.0, 2718281828.0));
  return float((u.x ^ u.y) * 3141592653u) / 4294967295.0;
}

float scratch(vec2 uv, float f) {
  vec2 cell = floor(uv);
  vec2 lo = uv - cell;
  float sx = floor(sin(cell.x * 51024.0) * 3104.0);
  float sy = floor(sin(cell.y * 1324.0) * 554.0);
  float ss = sx + sy;
  vec2 q = lo * 2.0 - 1.0;
  q = q * cos(ss) + vec2(-q.y, q.x) * sin(ss);
  q += sin(sx - sy);
  q = q * 0.5 + 0.5;
  float wave = (sin(sx + q.y * PI) + sin(sy + q.y * PI)) * 0.2;
  float x = 0.5 - abs(q.x - 0.5 + wave) * (f / uThickness);
  x = smoothstep(-2.0, fwidth(x) * 1.5 + 16.0, x) * 12.0;
  float h = cellHash(cell);
  float pulse = sin(uClock + h * TAU) * 0.5 + 0.5;
  if (uMode > 0.5) {
    float roll = cellHash(cell + vec2(uRoll * 0.6180339, uRoll * 0.3819660 + 7.0));
    pulse = step(0.5, roll) * (0.35 + 0.65 * fract(roll * 7.31 + h));
  }
  return x * q.y * pulse;
}

void main() {
  vec2 p = vUv * uResolution / min(uResolution.x, uResolution.y) * uZoom + uSeed;
  float lines = 0.0;
  for (int i = 0; i < 8; i++) {
    lines = max(lines, scratch(p, uSharp));
    p = vec2(p.x + p.y * 0.7, p.x * -0.7 + p.y) - 12.31;
  }
  vec3 base = toLinear(texture(uInput, vUv).rgb);
  vec3 color = mix(base, uColor, clamp(lines, 0.0, 1.0) * uOpacity);
  outColor = vec4(toGamma(color), 1.0);
}`,Sr={id:"scratches",name:"Scratches",category:"film",blend:"normal",description:"Fine hairline scratches over the image, like worn film or a scuffed surface.",animated:!0,preview:{zoom:2.5},animates:e=>e.speed>0&&e.opacity>0,params:[{key:"opacity",label:"Opacidade",type:"number",min:0,max:1,step:.01,default:.75},{key:"color",label:"Cor",type:"color",default:"#ffffff"},{key:"density",label:"Densidade",type:"number",min:-1,max:4,step:.1,default:1.5},{key:"thickness",label:"Thickness",type:"number",min:.2,max:5,step:.01,default:1.2},{key:"flicker",label:"Flicker",type:"select",default:"smooth",options:[{value:"smooth",label:"Smooth"},{value:"frame",label:"Every frame"}]},{key:"speed",label:"Velocidade",type:"number",min:0,max:5,step:.1,default:1},{key:"variation",label:"Variação",type:"number",min:0,max:100,step:1,default:0}],render(e,o,t){if(t.opacity<=0)return o;const a=Math.exp(t.density),l=Math.min(e.width,e.height);return e.pass("scratches",wr,{input:o,uniforms:{uZoom:a,uSharp:l/(a*Math.SQRT2*e.unit),uThickness:t.thickness,uClock:e.time*t.speed,uRoll:Math.floor(e.time*24*t.speed),uMode:t.flicker==="frame"?1:0,uSeed:t.variation,uOpacity:t.opacity,uColor:C(t.color).map(r=>Math.pow(r,2.2))}})}},De=128,xt=666.6667,Cr=`
uniform sampler2D uNoise;
uniform vec3 uPaper;
uniform vec3 uShadow;
uniform float uFade;
uniform float uBend;
uniform float uAngle;
uniform float uSeed;
uniform float uRoughness;
uniform float uRoughnessSize;
uniform float uRoughnessRows;
uniform float uFiber;
uniform float uFiberSize;
uniform float uFolds;
uniform vec2 uFoldLines;
uniform float uWrinkles;
uniform float uWrinkleSize;
uniform float uCrumples;
uniform float uCrumpleCount;
uniform float uDrops;

float lst(float edge0, float edge1, float x) {
  return clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
}

float paperHash21(vec2 p) {
  p = fract(p * vec2(0.3183099, 0.3678794)) + 0.1;
  p += dot(p, p + 19.19);
  return fract(p.x * p.y);
}

vec2 paperHash22(vec2 p) {
  p = fract(p * vec2(0.3183099, 0.3678794)) + 0.1;
  p += dot(p, p.yx + 19.19);
  return fract(vec2(p.x * p.y, p.x + p.y));
}

float getRoughness(vec2 p, vec2 lightDir, vec2 seedShift, float basePixel, float pixel) {
  vec2 u = p / vec2(2.0, 4.0);
  float w = 100.0 * basePixel;
  float eps = 4.0 * w;
  float size = mix(3.2, 0.8, uRoughnessSize);
  float logLac = log2(2.1);
  float level = -log2(w + 1e-8) / logLac;
  float baseLevel = floor(level) - 2.0;
  float fade = fract(level);
  vec2 px = (u.x + vec2(eps, -eps)) * 0.1;
  float py = u.y * 0.1;
  vec2 sum = vec2(0.0);
  float norm = 0.0;
  float amp = 0.5;
  float freq = exp2(baseLevel * logLac);
  for (int i = 0; i < 4; i++) {
    float absIdx = baseLevel + float(i);
    vec2 qx = size * px * freq;
    float qy = size * py * freq;
    float wi = 1.0;
    if (i == 0) wi = 1.0 - fade;
    if (i == 3) wi = fade;
    float visible = smoothstep(0.35, 1.0, 1.0 / (50.0 * size * freq * pixel));
    vec2 fx = fract(qx);
    float fy = fract(qy);
    vec2 shift = 0.5 + absIdx * 0.3 + seedShift;
    float uvY = floor(qy) / 50.0 + shift.y;
    vec2 s0a = textureLod(uNoise, fract(vec2(floor(qx.x) / 50.0 + shift.x, uvY)), 0.0).rg;
    vec2 s1a = textureLod(uNoise, fract(vec2(ceil(qx.x) / 50.0 + shift.x, uvY)), 0.0).rg;
    vec2 s0b = textureLod(uNoise, fract(vec2(floor(qx.y) / 50.0 + shift.x, uvY)), 0.0).rg;
    vec2 s1b = textureLod(uNoise, fract(vec2(ceil(qx.y) / 50.0 + shift.x, uvY)), 0.0).rg;
    vec2 ny0 = mix(vec2(s0a.r, s0b.r), vec2(s0a.g, s0b.g), fy);
    vec2 ny1 = mix(vec2(s1a.r, s1b.r), vec2(s1a.g, s1b.g), fy);
    vec2 n = mix(ny0, ny1, fx);
    sum += amp * wi * visible * n;
    norm += amp * wi;
    amp *= 0.8;
    freq *= 2.1;
  }
  vec2 r = sum / norm;
  float dx = 0.5 + r.x - r.y;
  float grain = 3.0 * dx * dx - 0.7;
  float rowBand = fract(dot(p, lightDir) * 0.05 * size);
  return grain + 0.6 * uRoughnessRows * (rowBand - 0.5);
}

float getFiber(vec2 p, vec2 seedShift, float basePixel, float pixel) {
  float size = mix(4.0, 1.0, uFiberSize);
  float w = 50.0 * basePixel;
  float level = -log2(w + 1e-8);
  float baseLevel = floor(level) - 3.0;
  float fade = fract(level);
  vec2 grad = vec2(0.0);
  float scale = 1.0;
  float amp = 1.0;
  float freq = pow(1.7, baseLevel);
  for (int i = 0; i < 5; i++) {
    float absIdx = baseLevel + float(i);
    vec2 q = size * p * freq;
    float an = absIdx * 0.8;
    float rc = cos(an);
    float rs = sin(an);
    q = vec2(rc * q.x - rs * q.y, rs * q.x + rc * q.y);
    float wi = 1.0;
    if (i == 0) wi = 1.0 - fade;
    if (i == 4) wi = fade;
    wi *= smoothstep(0.35, 1.0, 1.0 / (50.0 * size * freq * pixel));
    vec2 iq = floor(q);
    vec2 fq = fract(q);
    float shift = absIdx * 0.3;
    vec4 uv = fract(vec4(iq, iq + 1.0) / 50.0 + 0.5 + shift + seedShift.xyxy);
    float aF = textureLod(uNoise, uv.xy, 0.0).b;
    float bF = textureLod(uNoise, uv.zy, 0.0).b;
    float cF = textureLod(uNoise, uv.xw, 0.0).b;
    float dF = textureLod(uNoise, uv.zw, 0.0).b;
    vec2 s = fq * fq * (3.0 - 2.0 * fq);
    vec2 du = 8.0 * fq * (1.0 - fq);
    float dx = du.x * mix(bF - aF, dF - cF, s.y);
    float dy = du.y * mix(cF - aF, dF - bF, s.x);
    grad += wi * amp * scale * vec2(rc * dx + rs * dy, -rs * dx + rc * dy);
    scale *= 1.7;
    amp *= 0.5;
    freq *= 1.7;
  }
  return clamp(0.333 * length(grad), 0.0, 1.0);
}

vec2 smoothNoise(vec2 p) {
  vec2 t = p * 50.0 - 0.5;
  vec2 i = floor(t);
  vec2 f = fract(t);
  f = f * f * (3.0 - 2.0 * f);
  return textureLod(uNoise, fract((i + f + 0.5) / vec2(50.0)), 0.0).rg;
}

float getDrops(vec2 uv, vec2 seedShift) {
  vec2 cell = floor(uv);
  vec2 local = fract(uv);
  float minDist = 1.0;
  for (int y = -1; y < 2; y += 1) {
    for (int x = -1; x < 2; x += 1) {
      vec2 neighbor = vec2(float(y), float(x));
      vec2 offset = paperHash22(cell + neighbor + 50.0 * seedShift);
      vec2 pos = neighbor + offset - local;
      minDist *= min(1.0, dot(pos, pos));
    }
  }
  return 0.5 * lst(0.09, 0.08, sqrt(sqrt(minDist)));
}

vec2 getCellTilt(float idx, float radius) {
  vec2 rand = paperHash22(vec2(idx + 31.0, idx * uSeed + 17.0));
  float an = rand.x * TAU;
  return vec2(cos(an), sin(an)) * mix(0.3, 1.7, rand.y * rand.y) * mix(0.7, 1.0, radius);
}

vec2 getCrumpleDetail(vec2 uv, float freq, float shift, float basePixel, out float depth) {
  depth = 0.0;
  vec2 v = uv * freq;
  float pixel = 0.9 * freq * basePixel;
  vec2 base = floor(v);
  float n1 = 9.0;
  float n2 = 9.0;
  vec2 s1 = vec2(0.0);
  vec2 s2 = vec2(0.0);
  vec2 q1 = vec2(0.0);
  vec2 q2 = vec2(0.0);
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 cell = base + vec2(float(x), float(y));
      vec2 q = paperHash22(vec2(cell.y * 1.9 + 3.1 + shift, cell.x * 1.3 + 0.11 * uSeed));
      if (q.y > 0.8) continue;
      vec2 r = paperHash22(vec2(cell.x + 0.37 * uSeed + shift + 11.1, cell.y - 0.21 * uSeed + 5.7));
      vec2 s = cell + 0.06 + 0.88 * r;
      vec2 d = v - s;
      float dsq = dot(d, d);
      if (dsq < n1) {
        n2 = n1;
        s2 = s1;
        q2 = q1;
        n1 = dsq;
        s1 = s;
        q1 = q;
      } else if (dsq < n2) {
        n2 = dsq;
        s2 = s;
        q2 = q;
      }
    }
  }
  if (n1 > 8.0) return vec2(0.0);
  float an1 = q1.x * TAU;
  float mag1 = q1.y / 0.8;
  vec2 t1 = vec2(cos(an1), sin(an1)) * mix(0.3, 1.7, mag1 * mag1);
  float an2 = q2.x * TAU;
  float mag2 = q2.y / 0.8;
  vec2 t2 = vec2(cos(an2), sin(an2)) * mix(0.3, 1.7, mag2 * mag2);
  vec2 span = s1 - s2;
  float spanLen = max(length(span), 1e-4);
  float toEdge = (n2 - n1) / (2.0 * spanLen);
  float pair = paperHash21(s1 + s2 + 1.7 * abs(s1 - s2));
  float pairSoft = 0.05 + 0.1 * step(pair, 0.4);
  float b = clamp(toEdge / max(1.5 * pixel, 0.5 * pairSoft), 0.0, 1.0);
  b = b * b * (3.0 - 2.0 * b);
  float d1 = max(sqrt(n1), 1e-4);
  depth = 0.2 * d1;
  float shoulderAmt = max(0.0, 1.0 - toEdge / 0.42) * b;
  vec2 shoulder = vec2(0.0);
  if (shoulderAmt > 0.0) {
    float d2 = max(sqrt(n2), 1e-4);
    shoulder = shoulderAmt * ((v - s2) / d2 - (v - s1) / d1);
  }
  vec2 mid = 0.5 * (t1 + t2);
  return mid + (t1 - mid) * b + 0.9 * shoulder;
}

vec4 getCrumples(vec2 uv) {
  float crumpleN = max(2.0, floor(uCrumpleCount + 0.5));
  float near = 60000.0;
  float nearB = 60000.0;
  float idx = 0.0;
  float rad = 0.0;
  vec2 nearP = vec2(0.0);
  vec2 nearPb = vec2(0.0);
  vec4 seeds[15];
  for (int i = 0; i < 15; i++) {
    if (float(i) >= crumpleN) break;
    vec2 rand = paperHash22(vec2(float(i), float(i) * uSeed));
    float an = rand.x * TAU;
    vec2 p = vec2(cos(an), sin(an)) * rand.y;
    seeds[i] = vec4(p, rand);
    vec2 d = uv - p;
    float dsq = dot(d, d);
    if (dsq < near) {
      nearB = near;
      nearPb = nearP;
      near = dsq;
      idx = float(i);
      rad = rand.y;
      nearP = p;
    } else if (dsq < nearB) {
      nearB = dsq;
      nearPb = p;
    }
  }
  float l = sqrt(near);
  float lb = sqrt(nearB);
  vec2 dir = (uv - nearP) / max(l, 1e-4);
  float edge = lst(0.0, 0.5, lb - l);
  float shoulderLimit = l + 0.5;
  vec2 tilt = getCellTilt(idx, rad);
  float tiltSum = 1.0;
  vec2 wide = vec2(0.0);
  float wideSum = 0.0;
  float toEdge = 9.0;
  float edgeSoft = 0.0;
  for (int i = 0; i < 15; i++) {
    if (float(i) >= crumpleN) break;
    if (float(i) == idx) continue;
    vec4 seed = seeds[i];
    vec2 p = seed.xy;
    vec2 rand = seed.zw;
    vec2 d = uv - p;
    float dsq = dot(d, d);
    if (dsq < shoulderLimit * shoulderLimit) {
      float di = sqrt(dsq);
      float shoulder = lst(0.5, 0.0, di - l);
      wide += shoulder * (d / max(di, 1e-4) - dir);
      wideSum += shoulder;
    }
    float pairSoft = 0.01 + 0.05 * step(0.2, rand.x) + 0.3 * rand.y;
    float toBisector = (dsq - near) / (0.2 * max(length(p - nearP), 1e-4));
    if (toBisector < toEdge) {
      toEdge = toBisector;
      edgeSoft = pairSoft;
    }
    float w = 1.0 - toBisector / pairSoft;
    if (w > 0.0) {
      w *= w;
      tilt += w * getCellTilt(float(i), rand.y);
      tiltSum += w;
    }
  }
  float blend = clamp(toEdge / edgeSoft, 0.0, 1.0);
  vec2 sharp = (1.0 - edge) * ((uv - nearPb) / max(lb, 1e-4) - dir);
  vec2 rounding = mix(sharp, wide / max(wideSum, 1.0), min(2.0 * edgeSoft, 1.0));
  float radial = l / max(l + toEdge, 1e-4);
  return vec4(tilt / tiltSum + rounding * blend * radial, 0.2 * l, edge);
}

void foldAxis(float coord, float extent, float lines, float noise, out float dx, out float count) {
  if (lines < 0.5) {
    count = 1.0;
    dx = 0.5;
    return;
  }
  float panel = extent / (lines + 1.0);
  float period = lines < 1.5 ? 2.0 : min(2.0, 1.6 * panel);
  count = 1.0 / period;
  float local = (coord + 0.5 * extent) / panel;
  float k = clamp(floor(local + 0.5), 1.0, lines);
  dx = clamp(((local - k) * panel + noise) * count, -0.5, 0.5);
}

void getFolds(vec2 coord, vec2 extent, vec2 noise, float basePixel, out vec2 slope, out vec2 dark, out vec2 lift) {
  vec2 dx;
  vec2 count;
  foldAxis(coord.x, extent.x, uFoldLines.x, noise.x, dx.x, count.x);
  foldAxis(coord.y, extent.y, uFoldLines.y, noise.y, dx.y, count.y);
  noise *= count;
  vec2 adx = abs(dx);
  vec2 t = clamp(adx / 0.3, 0.0, 1.0);
  dark = t * t * (3.0 - 2.0 * t);
  lift = 1.0 - t;
  lift *= lift;
  vec2 crease = clamp(dx / max(count * basePixel, 1e-5), -1.0, 1.0);
  slope = crease * (1.0 - dark);
  vec2 lineWidth = 0.02 * count * mix(vec2(2.5), vec2(0.8), dark.yx) + 0.1 * noise;
  slope -= 1.0 - smoothstep(vec2(0.0), lineWidth, adx);
  slope *= step(0.5, uFoldLines);
}

vec2 mirrorUv(vec2 uv) {
  return 1.0 - abs(1.0 - abs(uv));
}

void main() {
  vec2 imageUV = vec2(vUv.x, 1.0 - vUv.y);
  float toPattern = 1.0 / (uUnit * ${xt.toFixed(4)});
  vec2 patternUV = (imageUV - 0.5) * uResolution * toPattern;
  vec2 extent = uResolution * toPattern;
  float basePixel = 1.0 / ${xt.toFixed(4)};
  float aaPixel = max(basePixel, toPattern);

  float pattern = 0.0;
  float crumpleDepth = 0.0;
  float wrinkleDepth = 0.0;
  float foldDepth = 0.0;
  float roughness = 0.0;
  float fiber = 0.0;
  float drops = 0.0;

  float grazing = 0.7;
  float lightRad = radians(uAngle);
  vec2 lightDir = vec2(sin(lightRad), -cos(lightRad));
  float foldAngleInSector = mod(uAngle, 90.0);
  float foldLightRad = radians(uAngle - foldAngleInSector + mix(12.0, 78.0, foldAngleInSector / 90.0));
  vec2 foldLightDir = vec2(sin(foldLightRad), -cos(foldLightRad));
  vec2 relief = vec2(0.0);
  vec2 foldSlope = vec2(0.0);
  float reliefAmount = 0.0;
  float foldInk = 1.0;
  vec2 crumpleFlow = vec2(0.0);

  vec2 warpNoise = vec2(0.0);
  if (uCrumples > 0.0 || uFolds > 0.0 || uWrinkles > 0.0) {
    warpNoise = smoothNoise(patternUV * 0.1 + 0.2 + 0.6 * fract(0.017 * uSeed)) - 0.5;
  }
  vec2 crumplesUV = patternUV * 0.9 + 0.012 * warpNoise;

  if (uCrumples > 0.0) {
    vec4 crumples = getCrumples(crumplesUV);
    vec2 crumpleTilt = 0.5 * uCrumples * crumples.xy;
    crumpleTilt -= 0.1 * max(dot(crumpleTilt, lightDir), 0.0) * lightDir;
    relief += crumpleTilt;
    reliefAmount += 0.6 * uCrumples;
    crumpleFlow = crumples.w * crumpleTilt;
    crumpleDepth = clamp(5.0 * crumples.z, 0.0, 1.0);
  }

  if (uWrinkles > 0.0) {
    float detailFreq = mix(10.0, 1.0, uWrinkleSize);
    float detailAmp = 0.2;
    vec2 detailGrad = vec2(0.0);
    float detailDepth = 0.0;
    float depthSum = 0.0;
    for (int i = 0; i < 3; i++) {
      float layerDepth;
      detailGrad += detailAmp * getCrumpleDetail(crumplesUV, detailFreq, 31.0 * float(i), aaPixel, layerDepth);
      detailDepth += detailAmp * layerDepth;
      depthSum += detailAmp;
      detailAmp *= 0.5 + 0.2 * detailGrad.x;
      detailFreq *= 2.1;
    }
    vec2 detailTilt = 1.5 * uWrinkles * detailGrad;
    detailTilt -= 0.65 * max(dot(detailTilt, lightDir), 0.0) * lightDir;
    relief += detailTilt;
    reliefAmount += 0.6 * uWrinkles;
    wrinkleDepth = clamp(5.0 * detailDepth / max(depthSum, 1e-4), 0.0, 1.0);
  }

  if (uFolds > 0.0 && uFoldLines.x + uFoldLines.y > 0.5) {
    vec2 foldNoise = 0.005 * warpNoise;
    vec2 slope;
    vec2 dark;
    vec2 lift;
    getFolds(patternUV + 0.03 * crumpleFlow, extent, foldNoise, aaPixel, slope, dark, lift);
    foldSlope = uFolds * slope;
    reliefAmount += uFolds;
    vec2 ink = mix(vec2(0.96), vec2(1.0), dark);
    float flatness = dark.x * dark.y;
    foldInk *= mix(1.0, ink.x * ink.y * mix(0.5, 0.3, flatness), uFolds);
    foldDepth = uFolds * (lift.y * foldLightDir.y - lift.x * foldLightDir.x);
  }

  float unlit = cos(grazing);
  if (reliefAmount > 0.0) {
    float lightFalloff = clamp(0.5 + dot(imageUV - 0.5, lightDir), 0.0, 1.0);
    float lightPower = mix(0.5, 1.0, lightFalloff);
    float slope = clamp(dot(relief, lightDir) + dot(foldSlope, foldLightDir), -1.2, 1.2);
    float lit = max(cos(slope + grazing), 0.0);
    pattern += (clamp(reliefAmount, 0.0, 1.0) * unlit + (lit - unlit)) * foldInk * lightPower;
  }

  patternUV += 0.04 * crumpleFlow;
  vec2 seedShift = floor(fract(uSeed * vec2(0.7548776662, 0.5698402909)) * 50.0) / 50.0;

  if (uRoughness > 0.0) {
    roughness = uRoughness * getRoughness(1000.0 * patternUV, lightDir, seedShift, basePixel, toPattern);
    pattern += roughness;
  }
  if (uFiber > 0.0) {
    fiber = uFiber * getFiber(50.0 * patternUV, seedShift, basePixel, toPattern);
    pattern += fiber;
  }
  if (uDrops > 0.0) {
    drops = uDrops * getDrops(patternUV * 10.0, seedShift);
  }
  pattern = clamp(pattern, 0.0, 1.0);

  vec2 centered = imageUV - 0.5;
  float edgeDist = 2.0 * max(abs(centered.x), abs(centered.y));
  float wrinkleDistortion = mix(0.38, 0.0175, smoothstep(0.0, 1.0, edgeDist));
  float scaleDistortion = 0.15 * uCrumples * (crumpleDepth - 0.5) + wrinkleDistortion * uWrinkles * (wrinkleDepth - 0.5) + 0.05 * foldDepth;
  vec2 linearDistortion = 0.002 * lightDir * drops;
  float radialDistortion = 0.02 * (roughness + fiber);
  centered *= 1.0 - uBend * scaleDistortion;
  centered -= uBend * linearDistortion;
  vec2 sampleUV = 0.5 + centered * (1.0 - abs(uBend) * radialDistortion * dot(centered, centered));

  vec3 image = texture(uInput, mirrorUv(vec2(sampleUV.x, 1.0 - sampleUV.y))).rgb;
  vec3 sheet = uShadow * pattern + uPaper * (1.0 - pattern);
  float maxC = max(max(image.r, image.g), image.b);
  float minC = min(min(image.r, image.g), image.b);
  float sat = maxC > 0.0 ? (maxC - minC) / maxC : 0.0;
  float midC = image.r + image.g + image.b - maxC - minC;
  float secondaryness = maxC > minC ? (midC - minC) / (maxC - minC) : 0.0;
  float satDampen = sat * (1.0 - 0.5 * secondaryness);
  float darkDampen = 1.0 - luma(image);
  float dampen = 0.7 * uFade * max(satDampen, darkDampen);
  vec3 color = image * sheet;
  color = mix(color, vec3(1.0), 0.6 * pow(dampen, 2.0 + 3.0 * pattern));
  color *= mix(vec3(1.0), 0.5 * uShadow, drops);
  outColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}`,Mr=()=>{const e=new Uint8Array(De*De*4);let o=2654435769;const t=()=>{o=o+1831565813|0;let a=Math.imul(o^o>>>15,1|o);return a=a+Math.imul(a^a>>>7,61|a)^a,((a^a>>>14)>>>0)/4294967296};for(let a=0;a<e.length;a+=4){for(let l=0;l<3;l+=1){const r=t(),i=t();e[a+l]=Math.round((r<.3?i*.03:r<.5?.97+i*.03:i)*255)}e[a+3]=255}return e},Tr={id:"paper",name:"Paper",category:"film",blend:"normal",description:"A sheet of real paper under the image: grain, fibers, wrinkles, creases and drops.",animated:!1,params:[{key:"paper",label:"Paper",type:"color",default:"#ffffff"},{key:"shadow",label:"Sombra",type:"color",default:"#cccccc"},{key:"grain",label:"Grain",type:"number",min:0,max:1,step:.01,default:.4},{key:"grainSize",label:"Grain size",type:"number",min:0,max:1,step:.01,default:.5,when:e=>e.grain>0},{key:"laid",label:"Laid lines",type:"number",min:0,max:1,step:.01,default:0,when:e=>e.grain>0},{key:"fibers",label:"Fibers",type:"number",min:0,max:1,step:.01,default:.4},{key:"fiberSize",label:"Fiber size",type:"number",min:0,max:1,step:.01,default:.5,when:e=>e.fibers>0},{key:"wrinkles",label:"Wrinkles",type:"number",min:0,max:1,step:.01,default:1},{key:"wrinkleSize",label:"Wrinkle size",type:"number",min:0,max:1,step:.01,default:.65,when:e=>e.wrinkles>0},{key:"crumples",label:"Crumples",type:"number",min:0,max:1,step:.01,default:0},{key:"facets",label:"Crumple facets",type:"number",min:2,max:15,step:1,default:6,when:e=>e.crumples>0},{key:"folds",label:"Folds",type:"number",min:0,max:1,step:.01,default:.5},{key:"foldsX",label:"Vertical folds",type:"number",min:0,max:5,step:1,default:1,when:e=>e.folds>0},{key:"foldsY",label:"Horizontal folds",type:"number",min:0,max:5,step:1,default:1,when:e=>e.folds>0},{key:"drops",label:"Drops",type:"number",min:0,max:1,step:.01,default:.4},{key:"bend",label:"Bend",type:"number",min:-1,max:1,step:.01,default:.3},{key:"fade",label:"Ink fade",type:"number",min:0,max:1,step:.01,default:1},{key:"angle",label:"Light angle",type:"number",min:0,max:360,step:1,default:300},{key:"variation",label:"Variação",type:"number",min:0,max:100,step:1,default:4}],render(e,o,t){const a=e.shared("paper-noise",l=>({texture:l.createTexture(De,De,{float:!1,filter:"linear",wrap:"repeat",data:Mr()})}));return e.pass("paper",Cr,{input:o,textures:{uNoise:a},uniforms:{uPaper:C(t.paper),uShadow:C(t.shadow),uFade:t.fade,uBend:t.bend,uAngle:t.angle,uSeed:t.variation,uRoughness:t.grain,uRoughnessSize:t.grainSize,uRoughnessRows:t.laid,uFiber:t.fibers,uFiberSize:t.fiberSize,uFolds:t.folds,uFoldLines:[t.foldsX,t.foldsY],uWrinkles:t.wrinkles,uWrinkleSize:t.wrinkleSize,uCrumples:t.crumples,uCrumpleCount:t.facets,uDrops:t.drops}})}},Lr=`
uniform float uRatio;
uniform vec3 uColor;
uniform float uSoftness;

void main() {
  vec3 color = texture(uInput, vUv).rgb;
  float aspect = uResolution.x / uResolution.y;
  float soft = max(uSoftness * 0.02, 0.5 / min(uResolution.x, uResolution.y));
  float mask = 0.0;
  if (uRatio >= aspect) {
    float visible = max(aspect / uRatio, 0.5);
    float d = abs(vUv.y - 0.5) * 2.0;
    mask = smoothstep(visible - soft, visible + soft, d);
  } else {
    float visible = max(uRatio / aspect, 0.5);
    float d = abs(vUv.x - 0.5) * 2.0;
    mask = smoothstep(visible - soft * aspect, visible + soft * aspect, d);
  }
  outColor = vec4(mix(color, uColor, mask), 1.0);
}`,Ur={id:"letterbox",name:"Letterbox",category:"film",blend:"normal",description:"Cinema bars that frame the picture at a wider or narrower ratio.",animated:!1,params:[{key:"ratio",label:"Ratio",type:"select",default:"2.39",options:[{value:"2.76",label:"Ultra wide 2.76"},{value:"2.39",label:"Scope 2.39"},{value:"2",label:"Univisium 2.00"},{value:"1.85",label:"Flat 1.85"},{value:"1.33",label:"Academy 4:3"},{value:"1",label:"Square"}]},{key:"color",label:"Bar color",type:"color",default:"#000000"},{key:"softness",label:"Edge softness",type:"number",min:0,max:1,step:.01,default:0}],render(e,o,t){return e.pass("letterbox",Lr,{input:o,uniforms:{uRatio:Number(t.ratio)||2.39,uColor:C(t.color),uSoftness:t.softness}})}},Ir=`
uniform float uExposure;
uniform float uContrast;
uniform float uSaturation;
uniform float uVibrance;
uniform float uTemperature;
uniform float uTint;
uniform float uHighlights;
uniform float uShadows;
uniform float uFade;
uniform float uSharpen;

void main() {
  vec3 color = texture(uInput, vUv).rgb;
  if (uSharpen > 0.0) {
    vec2 t = 1.0 / uResolution;
    vec3 blur = (
      texture(uInput, vUv + vec2(t.x, 0.0)).rgb +
      texture(uInput, vUv - vec2(t.x, 0.0)).rgb +
      texture(uInput, vUv + vec2(0.0, t.y)).rgb +
      texture(uInput, vUv - vec2(0.0, t.y)).rgb
    ) * 0.25;
    color += (color - blur) * uSharpen * 1.5;
  }

  vec3 linear = toLinear(color) * exp2(uExposure);
  linear *= vec3(1.0 + uTemperature * 0.28 + uTint * 0.08, 1.0 - uTint * 0.16, 1.0 - uTemperature * 0.32 + uTint * 0.08);
  color = toGamma(linear);

  float l = luma(color);
  float shadowMask = 1.0 - smoothstep(0.0, 0.55, l);
  float highlightMask = smoothstep(0.45, 1.0, l);
  color += color * uShadows * shadowMask * 0.9 + uShadows * shadowMask * 0.06;
  color += (uHighlights > 0.0 ? (1.0 - color) : color) * uHighlights * highlightMask * 0.6;

  color = (color - 0.5) * uContrast + 0.5;

  float gray = luma(color);
  color = mix(vec3(gray), color, uSaturation);
  float chroma = max(color.r, max(color.g, color.b)) - min(color.r, min(color.g, color.b));
  color = mix(vec3(luma(color)), color, 1.0 + uVibrance * (1.0 - clamp(chroma * 1.6, 0.0, 1.0)));

  color = color * (1.0 - uFade * 0.22) + uFade * 0.09;
  outColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}`,zr={id:"adjust",name:"Adjust",category:"color",blend:"normal",description:"Exposure, contrast, color balance and tone.",animated:!1,preview:{params:{contrast:1.25,saturation:1.5,temperature:.35}},params:[{key:"exposure",label:"Exposure",type:"number",min:-2,max:2,step:.01,default:0},{key:"contrast",label:"Contraste",type:"number",min:0,max:2,step:.01,default:1},{key:"saturation",label:"Saturação",type:"number",min:0,max:2,step:.01,default:1},{key:"vibrance",label:"Vibrance",type:"number",min:-1,max:1,step:.01,default:0},{key:"temperature",label:"Temperature",type:"number",min:-1,max:1,step:.01,default:0},{key:"tint",label:"Tint",type:"number",min:-1,max:1,step:.01,default:0},{key:"highlights",label:"Highlights",type:"number",min:-1,max:1,step:.01,default:0},{key:"shadows",label:"Shadows",type:"number",min:-1,max:1,step:.01,default:0},{key:"fade",label:"Fade",type:"number",min:0,max:1,step:.01,default:0},{key:"sharpen",label:"Sharpen",type:"number",min:0,max:2,step:.01,default:0}],render(e,o,t){return e.pass("adjust",Ir,{input:o,uniforms:{uExposure:t.exposure,uContrast:t.contrast,uSaturation:t.saturation,uVibrance:t.vibrance,uTemperature:t.temperature,uTint:t.tint,uHighlights:t.highlights,uShadows:t.shadows,uFade:t.fade,uSharpen:t.sharpen}})}},Ar=`
uniform vec3 uShadowTone;
uniform vec3 uHighlightTone;
uniform float uBalance;
uniform float uSplit;
uniform float uCurve;
uniform float uBlacks;
uniform float uRolloff;
uniform float uSaturation;
uniform float uSkin;

vec3 rolloff(vec3 c, float knee) {
  vec3 over = max(c - knee, 0.0);
  return min(c, vec3(knee)) + (1.0 - knee) * (1.0 - exp(-over / max(1.0 - knee, 1e-3)));
}

void main() {
  vec3 color = texture(uInput, vUv).rgb;
  float l = luma(color);
  vec3 hsv = rgb2hsv(color);
  float skin = smoothstep(0.12, 0.02, abs(hsv.x - 0.07)) * smoothstep(0.1, 0.3, hsv.y) * uSkin;
  float w = smoothstep(0.05, 0.95, clamp(l + uBalance * 0.35, 0.0, 1.0));
  vec3 shadowTint = uShadowTone - luma(uShadowTone);
  vec3 highlightTint = uHighlightTone - luma(uHighlightTone);
  vec3 tint = shadowTint * (1.0 - w) * (1.0 - w) + highlightTint * w * w;
  color += tint * uSplit * 0.75 * (1.0 - skin * 0.7);
  color = clamp(color, 0.0, 1.0);
  vec3 s = color * color * (3.0 - 2.0 * color);
  color = mix(color, s, uCurve);
  color = uBlacks >= 0.0 ? color * (1.0 - uBlacks) + uBlacks : max(color + uBlacks, 0.0) / (1.0 + uBlacks);
  color = mix(color, rolloff(color, 0.62), uRolloff);
  color = mix(vec3(luma(color)), color, uSaturation);
  outColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}`,Rr={id:"grade",name:"Color grade",category:"color",blend:"normal",description:"Split toning and a film curve, from teal and orange to bleach bypass.",animated:!1,params:[{key:"shadows",label:"Shadow tone",type:"color",default:"#1f7a8c"},{key:"highlights",label:"Highlight tone",type:"color",default:"#ffa45c"},{key:"split",label:"Toning",type:"number",min:0,max:1,step:.01,default:.55},{key:"balance",label:"Balance",type:"number",min:-1,max:1,step:.01,default:0},{key:"curve",label:"Film curve",type:"number",min:0,max:1,step:.01,default:.45},{key:"blacks",label:"Blacks",type:"number",min:-.2,max:.2,step:.005,default:.03},{key:"rolloff",label:"Highlight rolloff",type:"number",min:0,max:1,step:.01,default:.6},{key:"saturation",label:"Saturação",type:"number",min:0,max:2,step:.01,default:1},{key:"skin",label:"Protect skin",type:"number",min:0,max:1,step:.01,default:.6}],render(e,o,t){return e.pass("grade",Ar,{input:o,uniforms:{uShadowTone:C(t.shadows),uHighlightTone:C(t.highlights),uSplit:t.split,uBalance:t.balance,uCurve:t.curve,uBlacks:t.blacks,uRolloff:t.rolloff,uSaturation:t.saturation,uSkin:t.skin}})}},Dr=`
uniform float uShift;
uniform float uSaturation;
uniform float uInvert;
uniform float uSpread;

void main() {
  vec3 color = texture(uInput, vUv).rgb;
  if (uInvert > 0.5) color = 1.0 - color;
  vec3 hsv = rgb2hsv(color);
  float sweep = uSpread * (vUv.x * 0.6 + vUv.y * 0.4);
  hsv.x = fract(hsv.x + uShift + sweep);
  hsv.y = clamp(hsv.y * uSaturation, 0.0, 1.0);
  outColor = vec4(hsv2rgb(hsv), 1.0);
}`,Er={id:"hue",name:"Hue",category:"color",blend:"normal",description:"Rotates or cycles the colors, with an optional rainbow sweep.",animated:!0,preview:{params:{shift:140}},animates:e=>e.cycle>0,params:[{key:"shift",label:"Shift",type:"number",min:-180,max:180,step:1,default:0},{key:"cycle",label:"Cycle",type:"number",min:0,max:2,step:.01,default:0},{key:"spread",label:"Sweep",type:"number",min:0,max:1,step:.01,default:0},{key:"saturation",label:"Saturação",type:"number",min:0,max:2,step:.01,default:1},{key:"invert",label:"Invert",type:"boolean",default:!1}],render(e,o,t){return e.pass("hue",Dr,{input:o,uniforms:{uShift:t.shift/360+e.time*t.cycle*.1,uSaturation:t.saturation,uInvert:t.invert?1:0,uSpread:t.spread}})}},Pr=`
uniform float uStrength;
uniform float uScale;
uniform float uSpeed;
uniform float uSplit;

vec2 flow(vec2 p, float t) {
  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, -t * 0.8)));
  vec2 r = vec2(fbm(p + q * 1.7 + vec2(1.7, 9.2) + t * 0.3), fbm(p + q * 1.7 + vec2(8.3, 2.8) - t * 0.25));
  return r - 0.5;
}

void main() {
  vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
  vec2 p = vUv * aspect * uScale;
  float t = uTime * uSpeed * 0.2;
  vec2 offset = flow(p, t) * uStrength / aspect;
  vec3 color;
  if (uSplit > 0.0) {
    color.r = texture(uInput, vUv + offset * (1.0 + uSplit * 0.35)).r;
    color.g = texture(uInput, vUv + offset).g;
    color.b = texture(uInput, vUv + offset * (1.0 - uSplit * 0.35)).b;
  } else {
    color = texture(uInput, vUv + offset).rgb;
  }
  outColor = vec4(color, 1.0);
}`,qr={id:"warp",name:"Warp",category:"distort",blend:"normal",description:"A slow liquid flow that bends the image.",animated:!0,preview:{params:{strength:.16}},animates:e=>e.speed>0&&e.strength>0,params:[{key:"strength",label:"Strength",type:"number",min:0,max:.4,step:.001,default:.06},{key:"scale",label:"Escala",type:"number",min:.3,max:8,step:.05,default:2},{key:"speed",label:"Velocidade",type:"number",min:0,max:3,step:.05,default:1},{key:"split",label:"Color split",type:"number",min:0,max:1,step:.01,default:0}],render(e,o,t){return e.pass("warp",Pr,{input:o,uniforms:{uStrength:t.strength,uScale:t.scale,uSpeed:t.speed,uSplit:t.split}})}},Fr=`
uniform float uMode;
uniform float uAmplitude;
uniform float uFrequency;
uniform float uSpeed;
uniform float uAngle;
uniform float uShine;
uniform vec2 uCenter;

void main() {
  vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
  vec2 d = (vUv - uCenter) * aspect;
  float t = uTime * uSpeed;
  vec2 offset;
  float wave;
  if (uMode < 0.5) {
    float r = length(d);
    wave = sin(r * uFrequency * 40.0 - t * 4.0);
    float fade = exp(-r * 1.4);
    offset = d / max(r, 1e-4) * wave * uAmplitude * fade;
  } else {
    vec2 dir = vec2(cos(uAngle), sin(uAngle));
    float x = dot(d, dir);
    wave = sin(x * uFrequency * 40.0 - t * 4.0) + 0.5 * sin(x * uFrequency * 23.0 + t * 2.3);
    offset = vec2(-dir.y, dir.x) * wave * uAmplitude * 0.7;
  }
  vec3 color = texture(uInput, vUv + offset / aspect).rgb;
  color += uShine * 0.12 * max(wave, 0.0) * smoothstep(0.0, 0.02, uAmplitude);
  outColor = vec4(color, 1.0);
}`,Br={id:"ripple",name:"Ripple",category:"distort",blend:"normal",description:"Water rings from the center, or rolling waves.",animated:!0,preview:{params:{amplitude:.03}},animates:e=>e.speed>0&&e.amplitude>0,params:[{key:"mode",label:"Type",type:"select",default:"rings",options:[{value:"rings",label:"Rings"},{value:"waves",label:"Waves"}]},{key:"amplitude",label:"Amplitude",type:"number",min:0,max:.05,step:5e-4,default:.008},{key:"frequency",label:"Frequency",type:"number",min:.1,max:4,step:.01,default:1},{key:"angle",label:"Ângulo",type:"number",min:0,max:180,step:1,default:90,when:e=>e.mode==="waves"},{key:"shine",label:"Shine",type:"number",min:0,max:1,step:.01,default:.2},{key:"speed",label:"Velocidade",type:"number",min:0,max:3,step:.05,default:1}],render(e,o,t){return e.pass("ripple",Fr,{input:o,uniforms:{uMode:t.mode==="waves"?1:0,uAmplitude:t.amplitude,uFrequency:t.frequency,uSpeed:t.speed,uAngle:t.angle*Math.PI/180,uShine:t.shine,uCenter:[.5,.5]}})}},Gr=`
uniform float uScale;
uniform float uCaustic;
uniform float uWaves;
uniform float uLayering;
uniform float uHighlights;
uniform vec3 uHighlight;
uniform float uT;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float causticNoise(vec2 uv, float t, float scale) {
  vec2 n = vec2(0.1);
  vec2 N = vec2(0.1);
  mat2 m = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
  for (int j = 0; j < 6; j++) {
    uv *= m;
    n *= m;
    vec2 q = uv * scale + float(j) + n + (0.5 + 0.5 * float(j)) * (mod(float(j), 2.0) - 1.0) * t;
    n += sin(q);
    N += cos(q) / scale;
    scale *= 1.1;
  }
  return N.x + N.y + 1.0;
}

vec2 mirrorUv(vec2 uv) {
  return 1.0 - abs(1.0 - abs(uv));
}

void main() {
  vec2 imageUV = vec2(vUv.x, 1.0 - vUv.y);
  vec2 patternUV = (imageUV - 0.5) * uResolution / uScale;
  float t = uT;

  float waves = snoise((0.3 + 0.1 * sin(t)) * 0.1 * patternUV + vec2(0.0, 0.4 * t));
  float caustic = causticNoise(patternUV + uWaves * vec2(1.0, -1.0) * waves, 2.0 * t, 1.5);
  if (uLayering > 0.0) {
    caustic += uLayering * causticNoise(patternUV + 2.0 * uWaves * vec2(1.0, -1.0) * waves, 1.5 * t, 2.0);
  }
  caustic = caustic * caustic;

  float wavesShift = 0.1 * uWaves * waves;
  vec2 shift = vec2(wavesShift, -wavesShift) + uCaustic * 0.02 * caustic;
  vec2 offset = shift * vec2(1000.0, 666.6667) * uUnit / uResolution;
  vec2 uv = imageUV + offset;
  vec3 color = texture(uInput, mirrorUv(vec2(uv.x, 1.0 - uv.y))).rgb;

  float glow = 0.025 * uHighlights * caustic;
  color = mix(color, uHighlight, 0.05 * uHighlights * caustic);
  color += glow * (0.5 + 0.5 * waves);
  outColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}`,Nr={id:"water",name:"Water",category:"distort",blend:"normal",description:"Rippling water over the picture, with refracted caustics and glints of light.",animated:!0,animates:e=>e.speed>0,params:[{key:"size",label:"Tamanho",type:"number",min:.05,max:1,step:.01,default:.6},{key:"refraction",label:"Refraction",type:"number",min:0,max:1,step:.01,default:.15},{key:"waves",label:"Waves",type:"number",min:0,max:1,step:.01,default:.12},{key:"layering",label:"Layering",type:"number",min:0,max:1,step:.01,default:.4},{key:"highlights",label:"Highlights",type:"number",min:0,max:1,step:.01,default:.25},{key:"color",label:"Highlight color",type:"color",default:"#ffffff"},{key:"speed",label:"Velocidade",type:"number",min:0,max:3,step:.05,default:.6}],render(e,o,t){return e.pass("water",Gr,{input:o,uniforms:{uScale:(.01+.09*t.size)*666.6667*e.unit,uCaustic:t.refraction*.25,uWaves:t.waves,uLayering:t.layering,uHighlights:t.highlights,uHighlight:C(t.color),uT:e.time*t.speed}})}},Or=`
uniform float uShape;
uniform float uProfile;
uniform float uBar;
uniform float uAngle;
uniform float uDistortion;
uniform float uShift;
uniform float uStretch;
uniform float uBlur;
uniform float uHighlights;
uniform float uShadows;
uniform float uFrost;
uniform float uSize;
uniform float uDrift;

float smoothFract(float x) {
  float f = fract(x);
  float w = fwidth(x);
  float edge = abs(f - 0.5) - 0.5;
  float band = smoothstep(-w, w, edge);
  return mix(f, 1.0 - f, band);
}

float uvFrame(vec2 uv, float softness) {
  float aax = 2.0 * fwidth(uv.x);
  float aay = 2.0 * fwidth(uv.y);
  float left = smoothstep(0.0, aax + softness, uv.x);
  float right = 1.0 - smoothstep(1.0 - softness - aax, 1.0, uv.x);
  float bottom = smoothstep(0.0, aay + softness, uv.y);
  float top = 1.0 - smoothstep(1.0 - softness - aay, 1.0, uv.y);
  return left * right * bottom * top;
}

vec2 toUv(vec2 p) {
  return vec2(p.x / uResolution.x + 0.5, 0.5 - p.y / uResolution.y);
}

vec2 mirrorUv(vec2 uv) {
  return 1.0 - abs(1.0 - abs(uv));
}

void main() {
  vec2 p = (vec2(vUv.x, 1.0 - vUv.y) - 0.5) * uResolution;
  mat2 toBars = rotation(uAngle);
  mat2 fromBars = rotation(-uAngle);
  vec2 q = toBars * p / uBar;
  q.x += uDrift;

  float curve = 0.0;
  if (uShape > 3.5) {
    curve = 0.5 + 0.5 * sin(0.5 * PI * q.x) * cos(0.5 * PI * q.y);
  } else if (uShape > 2.5) {
    curve = 10.0 * abs(fract(0.1 * q.y) - 0.5);
  } else if (uShape > 1.5) {
    curve = 4.0 * sin(0.23 * q.y);
  } else if (uShape > 0.5) {
    curve = 0.5 + 0.5 * sin(0.5 * q.x) * sin(1.7 * q.x);
  }

  float u = q.x + curve;
  float x = smoothFract(u);
  float xn = fract(u) + 0.0001;
  float scale = max(uUnit, 0.5);

  float lineWidth = 2.0 * max(0.001, fwidth(u) * scale);
  float highlights = 1.0 - smoothstep(0.0, lineWidth, xn) * smoothstep(1.0, 1.0 - lineWidth, xn);
  highlights = clamp(highlights * uHighlights, 0.0, 1.0);

  float shadows = pow(x, 1.3);
  float distortion = 0.0;
  float frameFade = 0.0;
  float fadeX = 1.0;
  float aa = max(max(fwidth(xn), fwidth(q.x)), fwidth(u)) * scale;
  aa = max(aa, 0.0001);

  if (uProfile < 0.5) {
    distortion = -pow(1.5 * x, 3.0) + (0.5 - uShift);
    frameFade = pow(1.5 * x, 3.0);
    aa = max(0.2, aa) + mix(0.2, 0.0, uSize);
    fadeX = smoothstep(0.0, aa, xn) * smoothstep(1.0, 1.0 - aa, xn);
    distortion = mix(0.5, distortion, fadeX);
  } else if (uProfile < 1.5) {
    distortion = 2.0 * pow(x, 2.0) - (0.5 + uShift);
    frameFade = pow(abs(x - 0.5), 4.0);
    aa = max(0.2, aa) + mix(0.2, 0.0, uSize);
    fadeX = smoothstep(0.0, aa, xn) * smoothstep(1.0, 1.0 - aa, xn);
    distortion = mix(0.5, distortion, fadeX);
    frameFade = mix(1.0, frameFade, 0.5 * fadeX);
  } else if (uProfile < 2.5) {
    distortion = pow(abs(2.0 * (xn - 0.5)), 6.0) - 0.25 - uShift;
    frameFade = 1.0 - 2.0 * pow(abs(x - 0.4), 2.0);
    aa = 0.15 + mix(0.1, 0.0, uSize);
    fadeX = smoothstep(0.0, aa, xn) * smoothstep(1.0, 1.0 - aa, xn);
    frameFade = mix(1.0, frameFade, fadeX);
  } else if (uProfile < 3.5) {
    x = xn;
    distortion = sin((x + 0.25) * TAU);
    shadows = 0.5 + 0.5 * asin(distortion) / (0.5 * PI);
    distortion = distortion * 0.5 - uShift;
    frameFade = 0.5 + 0.5 * sin(x * TAU);
  } else {
    distortion = -pow(abs(x), 0.2) * x + 0.33 - 3.0 * uShift;
    distortion *= 0.33;
    frameFade = 0.3 * smoothstep(0.0, 1.0, x);
    shadows = pow(x, 2.5);
    aa = max(0.1, aa) + mix(0.1, 0.0, uSize);
    fadeX = smoothstep(0.0, aa, xn) * smoothstep(1.0, 1.0 - aa, xn);
    distortion *= fadeX;
  }

  if (uFrost > 0.0) {
    float grain = smoothstep(0.4, 0.7, valueNoise(p * 0.8 / uUnit)) * uFrost;
    distortion = mix(distortion, 0.0, grain);
  }

  shadows = clamp(min(shadows, 1.0) * uShadows * uShadows, 0.0, 1.0);
  distortion *= 3.0 * uDistortion;
  frameFade *= uDistortion;

  vec2 sp = p + fromBars * vec2(distortion * uBar, 0.0);
  vec2 uv = toUv(sp);

  float stretch = 1.0 - smoothstep(0.0, 0.5, xn) * smoothstep(1.0, 0.5, xn);
  stretch *= stretch;
  stretch *= uvFrame(uv, 0.1 + 0.05 * frameFade);
  vec2 along = toBars * sp;
  along.y = mix(along.y, 0.0, uStretch * stretch);
  sp = fromBars * along;
  uv = toUv(sp);

  vec2 texel = vec2(textureSize(uInput, 0));
  vec2 gx = dFdx(uv) * texel;
  vec2 gy = dFdy(uv) * texel;
  float lod = 0.5 * log2(max(max(dot(gx, gx), dot(gy, gy)), 1e-8));

  vec3 image;
  if (uBlur < 0.5) {
    image = textureLod(uInput, mirrorUv(uv), max(lod, 0.0)).rgb;
  } else {
    float stride = max(1.0, uBlur / 8.0);
    float level = max(lod, log2(stride) - 0.5);
    vec2 dir = fromBars * vec2(0.0, 1.0);
    vec2 stepUv = vec2(dir.x / uResolution.x, -dir.y / uResolution.y) * stride;
    float reach = min(ceil(3.0 * uBlur / stride), 24.0);
    vec3 sum = vec3(0.0);
    float total = 0.0;
    for (int i = -24; i <= 24; i++) {
      float k = float(i);
      if (abs(k) > reach) continue;
      float d = k * stride;
      float w = exp(-d * d / (2.0 * uBlur * uBlur));
      sum += textureLod(uInput, mirrorUv(uv + stepUv * k), level).rgb * w;
      total += w;
    }
    image = sum / total;
  }

  vec3 color = vec3(highlights);
  float opacity = highlights;
  shadows = mix(shadows, 0.0, highlights);
  color *= 1.0 - 0.5 * shadows;
  opacity = clamp(opacity + shadows, 0.0, 1.0);
  color = clamp(color, 0.0, 1.0) + image * (1.0 - opacity);
  outColor = vec4(color, 1.0);
}`,Hr={lines:0,irregular:1,wave:2,zigzag:3,pattern:4},Wr={prism:0,lens:1,contour:2,cascade:3,flat:4},jr={id:"fluted",name:"Fluted glass",category:"glass",blend:"normal",description:"Reeded glass that splits the picture into refracted, streaky bars.",animated:!0,animates:e=>e.drift!==0,params:[{key:"shape",label:"Shape",type:"select",default:"lines",options:[{value:"lines",label:"Straight"},{value:"irregular",label:"Irregular"},{value:"wave",label:"Wave"},{value:"zigzag",label:"Zigzag"},{value:"pattern",label:"Weave"}]},{key:"profile",label:"Profile",type:"select",default:"prism",options:[{value:"prism",label:"Prism"},{value:"lens",label:"Lens"},{value:"contour",label:"Contour"},{value:"cascade",label:"Cascade"},{value:"flat",label:"Flat"}]},{key:"size",label:"Bar size",type:"number",min:4,max:120,step:.5,default:24},{key:"angle",label:"Ângulo",type:"number",min:0,max:180,step:1,default:0},{key:"distortion",label:"Distortion",type:"number",min:0,max:1,step:.01,default:.5},{key:"shift",label:"Shift",type:"number",min:-1,max:1,step:.01,default:0},{key:"stretch",label:"Stretch",type:"number",min:0,max:1,step:.01,default:0},{key:"blur",label:"Desfoque",type:"number",min:0,max:1,step:.01,default:0},{key:"highlights",label:"Highlights",type:"number",min:0,max:1,step:.01,default:.1},{key:"shadows",label:"Shadows",type:"number",min:0,max:1,step:.01,default:.25},{key:"frost",label:"Frost",type:"number",min:0,max:1,step:.01,default:0},{key:"drift",label:"Drift",type:"number",min:-2,max:2,step:.01,default:0}],render(e,o,t){const a=o.mipmapped?o:e.mipmap(o),l=Math.max(1,t.size*e.unit),r=1e3/Math.max(t.size,1);return e.pass("fluted",Or,{input:a,uniforms:{uShape:Hr[t.shape]??0,uProfile:Wr[t.profile]??0,uBar:l,uAngle:t.angle*Math.PI/180,uDistortion:t.distortion,uShift:t.shift,uStretch:t.stretch,uBlur:t.blur*24*e.unit,uHighlights:t.highlights,uShadows:t.shadows,uFrost:t.frost,uSize:Math.min(1,Math.max(0,(200-r)/195)),uDrift:t.drift*e.time}})}},_r=`
uniform float uSpread;
uniform float uBias;
uniform float uAngle;
uniform float uPerspective;
uniform float uCount;
uniform float uDispersion;
uniform float uHue;
uniform float uFocusCenter;
uniform float uFocusEdges;
uniform float uSwirl;
uniform float uNoise;
uniform float uBulge;
uniform float uCircle;
uniform float uGrain;

vec3 hueColor(float hue) {
  vec3 rgb = clamp(abs(mod(hue * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return rgb * rgb * (3.0 - 2.0 * rgb);
}

float dispersionCurve(float t, float biasPow) {
  float mirroredT = uBias < 0.0 ? 1.0 - t : t;
  float curved = pow(mirroredT, biasPow);
  return uBias < 0.0 ? 1.0 - curved : curved;
}

vec2 getSpread(vec2 fromCenter, float radius, vec2 warpedUV, float edgeAA, float inradius, float outradius, float reach, float aspect, out float outStrength) {
  vec2 uniformDir = vec2(cos(uAngle), sin(uAngle));
  float invInradius = 1.0 / inradius;
  vec2 radialDir = fromCenter * invInradius;
  float maxLen = (outradius + reach) * invInradius;
  float radialLen = radius * invInradius;
  if (radialLen > maxLen) radialDir *= maxLen / radialLen;
  vec2 spreadDir = mix(uniformDir, radialDir, uPerspective);

  float bandProximity = smoothstep(inradius * 0.8, inradius, radius);
  float lensCircleMaxing = bandProximity * uCircle * uCircle * uCircle;
  spreadDir = mix(spreadDir, radialDir, lensCircleMaxing);

  vec2 warpedAbs = abs(warpedUV - 0.5);
  float inner = mix(1.0, smoothstep(0.0, mix(inradius, outradius, uFocusCenter), radius), uFocusCenter);
  float boxDist = max(warpedAbs.x, warpedAbs.y) * 2.0;
  float outer = mix(1.0, 1.0 - min(boxDist, 1.0), uFocusEdges);
  float strength = inner * outer;
  strength *= mix(1.0, mix(0.15, 0.03, max(-uBulge, 0.0)), lensCircleMaxing);

  vec2 outside = max(warpedAbs - 0.5, 0.0);
  float margin = max(reach * length(spreadDir) * (1.0 - uCircle), edgeAA);
  strength *= 1.0 - smoothstep(0.0, margin, length(outside));

  outStrength = strength;
  vec2 axis = spreadDir * (reach * strength);
  if (uNoise > 0.0) {
    float turn = (valueNoise(fromCenter * 4.5) - 0.5) * 2.0 * uNoise;
    axis = mat2(cos(turn), -sin(turn), sin(turn), cos(turn)) * axis;
  }
  axis.x /= aspect;
  return axis;
}

vec2 lensWarp(vec2 fromCenter, float radius, float inradius, float aspect, out float bulgeFade) {
  bulgeFade = 1.0;
  if (uBulge == 0.0 && uCircle <= 0.0) return fromCenter;
  if (radius < 1e-5) return fromCenter;
  float r = radius;
  if (uBulge != 0.0) {
    float rn = radius / inradius;
    float bulge = abs(uBulge) * (uBulge > 0.0 ? 1.4 : 1.2);
    if (uBulge > 0.0) bulgeFade = 1.0 - smoothstep(1.45, 1.53, rn * bulge);
    float map = uBulge > 0.0 ? tan(min(rn * bulge, 1.53)) / tan(bulge) : atan(rn * tan(bulge)) / bulge;
    float bulgeScale = map / rn;
    fromCenter *= bulgeScale;
    r *= bulgeScale;
  }
  if (uCircle > 0.0) {
    vec2 dir = fromCenter / max(r, 1e-5);
    vec2 halfBox = vec2(aspect, 1.0) * 0.5;
    float rBox = min(halfBox.x / max(abs(dir.x), 1e-4), halfBox.y / max(abs(dir.y), 1e-4));
    float band = inradius * mix(0.03, 0.2, 0.5 * (uBulge + 1.0));
    float innerEdge = inradius - band;
    float over = smoothstep(0.0, 1.0, (r - innerEdge) / band);
    float g = r + (rBox - inradius) * pow(over, 14.0);
    fromCenter = dir * mix(r, g, uCircle);
  }
  return fromCenter;
}

float boxFrame(vec2 uv) {
  vec2 invAA = 1.0 / clamp(fwidth(uv), 1e-5, 0.02);
  vec2 lo = clamp(uv * invAA + 0.5, 0.0, 1.0);
  vec2 hi = clamp((1.0 - uv) * invAA + 0.5, 0.0, 1.0);
  return lo.x * hi.x * lo.y * hi.y;
}

vec3 tap(vec2 uv) {
  uv = 1.0 - abs(1.0 - abs(uv));
  return texture(uInput, vec2(uv.x, 1.0 - uv.y)).rgb;
}

void main() {
  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
  float aspect = uResolution.x / uResolution.y;
  float invAspect = 1.0 / aspect;
  float inradius = 0.5 * min(aspect, 1.0);
  float outradius = 0.5 * length(vec2(aspect, 1.0));
  float reach = 0.7 * pow(uSpread, 1.3 + 2.7 * uSpread);

  vec2 fromCenter = uv - 0.5;
  fromCenter.x *= aspect;
  float radius = length(fromCenter);

  float bulgeFade;
  vec2 warpedFromCenter = lensWarp(fromCenter, radius, inradius, aspect, bulgeFade);
  vec2 baseUV = vec2(warpedFromCenter.x * invAspect, warpedFromCenter.y) + 0.5;
  float inside = boxFrame(baseUV) * bulgeFade;
  vec2 baseDerivative = fwidth(baseUV);
  float edgeAA = clamp(2.0 * max(baseDerivative.x, baseDerivative.y), 0.001, 0.02);

  float spreadStrength;
  vec2 spreadAxis = getSpread(fromCenter, radius, baseUV, edgeAA, inradius, outradius, reach, aspect, spreadStrength);

  if (uGrain > 0.0) {
    float grainSeed = valueNoise((uv - 0.5) * uResolution * 0.8 / uUnit);
    vec2 jit = fract(grainSeed * vec2(157.31, 113.57)) * 2.0 - 1.0;
    spreadAxis += jit * 0.3 * uGrain * length(spreadAxis);
  }

  float count = floor(uCount);
  float invCount = 1.0 / count;
  float invSpan = 1.0 / max(count - 1.0, 1.0);
  float hueBase = uHue + 0.5;
  float biasPower = 1.0 + 2.0 * abs(uBias);
  float dispersionPower = pow(uDispersion, 0.8);
  float warpedRadius = length(warpedFromCenter);
  float swirlAngle = uSwirl * 0.4 * PI * spreadStrength * uSpread * min(1.0, inradius / max(warpedRadius, 1e-4));

  vec3 colorSum = vec3(0.0);
  vec3 weightSum = vec3(0.0);
  for (int i = 0; i < 50; i++) {
    float layer = float(i);
    if (layer >= count) break;
    float hue = hueBase + layer * invCount;
    float spread = layer * invSpan;
    if (uBias != 0.0) spread = dispersionCurve(spread, biasPower);
    float fanPos = 1.0 - 2.0 * spread;
    vec2 tapUV = baseUV + spreadAxis * fanPos - 0.5;
    if (uSwirl != 0.0) {
      tapUV.x *= aspect;
      tapUV = rotation(-swirlAngle * fanPos) * tapUV;
      tapUV.x *= invAspect;
    }
    vec3 weight = 1.0 - dispersionPower * hueColor(hue);
    colorSum += tap(tapUV + 0.5) * weight;
    weightSum += weight;
  }
  vec3 color = colorSum / max(weightSum, 1e-4);
  outColor = vec4(color * inside, 1.0);
}`,$r={id:"refract",name:"Lens split",category:"distort",blend:"normal",description:"Splits the picture into a fan of shifted color layers, like shooting through a prism.",animated:!1,preview:{params:{spread:1.2}},params:[{key:"spread",label:"Spread",type:"number",min:0,max:1,step:.01,default:.6},{key:"angle",label:"Direção",type:"number",min:0,max:360,step:1,default:0,when:e=>e.radial<1},{key:"radial",label:"Radial",type:"number",min:0,max:1,step:.01,default:.1},{key:"layers",label:"Camadas",type:"number",min:2,max:50,step:1,default:35},{key:"bias",label:"Balance",type:"number",min:-1,max:1,step:.01,default:1},{key:"dispersion",label:"Rainbow",type:"number",min:0,max:1,step:.01,default:1},{key:"hue",label:"Hue",type:"number",min:0,max:1,step:.01,default:.6,when:e=>e.dispersion>0},{key:"swirl",label:"Swirl",type:"number",min:-1,max:1,step:.01,default:.35},{key:"clearCenter",label:"Clear center",type:"number",min:0,max:1,step:.01,default:.8},{key:"clearEdges",label:"Clear edges",type:"number",min:0,max:1,step:.01,default:1},{key:"turbulence",label:"Turbulence",type:"number",min:0,max:1,step:.01,default:0},{key:"bulge",label:"Bulge",type:"number",min:-1,max:1,step:.01,default:0},{key:"circle",label:"Round lens",type:"number",min:0,max:1,step:.01,default:0},{key:"scatter",label:"Scatter",type:"number",min:0,max:1,step:.01,default:0}],render(e,o,t){return e.pass("refract",_r,{input:o,uniforms:{uSpread:t.spread,uBias:t.bias,uAngle:t.angle*Math.PI/180,uPerspective:t.radial,uCount:t.layers,uDispersion:t.dispersion,uHue:t.hue,uFocusCenter:t.clearCenter,uFocusEdges:t.clearEdges,uSwirl:t.swirl,uNoise:t.turbulence,uBulge:t.bulge,uCircle:t.circle,uGrain:t.scatter}})}},Vr=`
uniform float uSegments;
uniform float uRotation;
uniform float uZoom;
uniform vec2 uOffset;

void main() {
  vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
  vec2 p = (vUv - 0.5) * aspect;
  float r = length(p) / uZoom;
  float a = atan(p.y, p.x) + uRotation;
  float sector = TAU / uSegments;
  a = mod(a, sector);
  a = abs(a - sector * 0.5);
  vec2 q = vec2(cos(a), sin(a)) * r;
  vec2 uv = q / aspect + 0.5 + uOffset;
  uv = abs(fract(uv * 0.5) * 2.0 - 1.0);
  uv = 1.0 - abs(1.0 - uv);
  outColor = vec4(texture(uInput, uv).rgb, 1.0);
}`,Xr={id:"kaleidoscope",name:"Kaleidoscope",category:"distort",blend:"normal",description:"Mirrored slices that turn the image into a mandala.",animated:!0,preview:{params:{spin:0}},animates:e=>e.spin!==0,params:[{key:"segments",label:"Segments",type:"number",min:2,max:24,step:1,default:8},{key:"zoom",label:"Zoom",type:"number",min:.2,max:3,step:.01,default:1},{key:"rotation",label:"Rotação",type:"number",min:0,max:360,step:1,default:0},{key:"spin",label:"Spin",type:"number",min:-2,max:2,step:.01,default:.15},{key:"pan",label:"Pan",type:"number",min:-.5,max:.5,step:.01,default:0}],render(e,o,t){return e.pass("kaleidoscope",Vr,{input:o,uniforms:{uSegments:t.segments,uRotation:t.rotation*Math.PI/180+e.time*t.spin*.25,uZoom:t.zoom,uOffset:[t.pan,t.pan*.4]}})}},Yr=`
uniform vec2 uCenter;
uniform float uShort;
uniform float uEdges;

vec2 toUv(vec2 q) {
  return (uCenter * uResolution + q * uShort) / uResolution;
}

vec2 edgeUv(vec2 uv) {
  if (uEdges < 0.5) return clamp(uv, 0.5 / uResolution, 1.0 - 0.5 / uResolution);
  if (uEdges < 1.5) return 1.0 - abs(1.0 - mod(uv, 2.0));
  return fract(uv);
}

vec3 fetch(vec2 uv, vec2 dx, vec2 dy) {
  return textureGrad(uInput, edgeUv(uv), dx, dy).rgb;
}
`,Kr=`
${Yr}
uniform float uType;
uniform float uRadius;
uniform float uStrength;
uniform float uPhase;
uniform float uOption;
uniform float uCurve;
uniform float uCount;
uniform float uRotation;
uniform float uSeamless;

vec2 twirl(vec2 q) {
  float x = length(q) / uRadius;
  if (x >= 1.0) return q;
  float f = (1.0 - x) * (1.0 - x);
  return rotation(uStrength * 3.0 * PI * f) * q;
}

vec2 pinch(vec2 q) {
  float r = length(q);
  float x = r / uRadius;
  if (x >= 1.0 || x <= 0.0) return q;
  float power = exp(-1.1 * uStrength);
  float x4 = x * x * x * x;
  float f = mix(pow(x, power), x, x4);
  return q * (f / x);
}

vec2 bulge(vec2 q) {
  float r = length(q);
  float x = r / uRadius;
  if (x >= 1.0 || x <= 0.0) return q;
  float sphere = uStrength >= 0.0 ? asin(x) / (0.5 * PI) : sin(x * 0.5 * PI);
  float x2 = x * x;
  float f = mix(x, sphere, (uStrength >= 0.0 ? uStrength * 1.6 : -uStrength) * (1.0 - x2 * x2 * x2));
  return q * (f / x);
}

vec2 shear(vec2 q) {
  vec2 s = uOption < 0.5 ? q : q.yx;
  float y = s.y;
  float f = y;
  if (uCurve > 0.5 && uCurve < 1.5) f = y * y * 2.0 - 0.35;
  if (uCurve > 1.5) f = sin(y * PI * 1.6) * 0.32;
  s.x -= uStrength * f;
  return uOption < 0.5 ? s : s.yx;
}

float zig(float x) {
  return mix(sin(x * TAU), 1.0 - 4.0 * abs(fract(x + 0.25) - 0.5), 0.5);
}

vec2 zigzag(vec2 q) {
  float r = length(q);
  float x = r / uRadius;
  if (x >= 1.0) return q;
  float fall = (1.0 - x * x) * (1.0 - x * x) * smoothstep(0.0, 0.1, x);
  float w = zig(x * uCount - uPhase) * fall * uStrength * 0.06;
  vec2 s = q;
  if (uOption < 0.5 || uOption > 1.5) s = rotation(w / max(r, 0.03)) * s;
  if (uOption > 0.5) s *= 1.0 + w / max(r, 0.03);
  return s;
}

void main() {
  vec2 q = (vUv - uCenter) * uResolution / uShort;
  if (uType > 3.5 && uType < 4.5) {
    vec2 uv;
    vec2 dx;
    vec2 dy;
    if (uOption < 0.5) {
      float r = length(q) / uRadius;
      float th = atan(q.y, q.x);
      float u = (0.75 - th / TAU + uRotation) * uCount + uSeamless * 0.25;
      uv = vec2(u, r);
      vec2 qx = dFdx(q);
      vec2 qy = dFdy(q);
      float rr = max(dot(q, q), 1e-6);
      vec2 n = vec2(-q.y, q.x) / rr;
      vec2 g = q / max(length(q), 1e-4) / uRadius;
      float k = uCount * (1.0 + uSeamless);
      dx = vec2(-dot(n, qx) / TAU * k, dot(g, qx));
      dy = vec2(-dot(n, qy) / TAU * k, dot(g, qy));
      uv.x = uSeamless > 0.5 ? abs(2.0 * fract(uv.x + 0.5) - 1.0) : fract(uv.x);
    } else {
      float u = uSeamless > 0.5 ? vUv.x * 0.5 - 0.25 : vUv.x;
      float th = (0.75 + uRotation - u / uCount) * TAU;
      float r = vUv.y * uRadius;
      uv = toUv(vec2(cos(th), sin(th)) * r);
      dx = dFdx(uv);
      dy = dFdy(uv);
    }
    outColor = vec4(fetch(uv, dx, dy), 1.0);
    return;
  }
  vec2 s = q;
  if (uType < 0.5) s = twirl(q);
  else if (uType < 1.5) s = pinch(q);
  else if (uType < 2.5) s = bulge(q);
  else if (uType < 3.5) s = shear(q);
  else s = zigzag(q);
  vec2 uv = toUv(s);
  outColor = vec4(fetch(uv, dFdx(uv), dFdy(uv)), 1.0);
}`,Zr=`
uniform vec2 uDirection;
uniform float uStep;
uniform float uLength;
uniform float uStreaks;
uniform float uPhase;
uniform float uUnitPx;
uniform float uShift;
uniform float uPower;
uniform float uFirst;
uniform float uFinal;

float decay(vec2 p) {
  vec2 n = vec2(-uDirection.y, uDirection.x);
  float across = dot(p, n) / uUnitPx;
  float coarse = valueNoise(vec2(across * 0.015 + 3.7, uPhase * 0.12));
  float mid = valueNoise(vec2(across * 0.1, 7.3 + uPhase * 0.2));
  float fine = valueNoise(vec2(across * 0.6, 1.9 + uPhase * 0.35));
  float v = coarse * 0.15 + mid * 0.35 + fine * 0.5;
  float drip = smoothstep(0.38, 0.78, v);
  float len = max(uLength * mix(1.0, 0.06 + drip * drip * 2.0, uStreaks), 0.5);
  return exp(-uStep / len);
}

vec4 load(vec2 uv) {
  vec4 c = texture(uInput, clamp(uv, 0.5 / uResolution, 1.0 - 0.5 / uResolution));
  if (uFirst < 0.5) return c;
  float l = luma(c.rgb);
  float w = 0.02 + l * l * l * 3.0;
  return vec4(c.rgb * w, w);
}

void main() {
  vec2 p = vUv * uResolution;
  float weight = pow(decay(p), uPower);
  vec4 sum = load(vUv) + load((p - uDirection * uShift) / uResolution) * weight;
  if (uFinal > 0.5) sum = vec4(sum.rgb / max(sum.a, 1e-5), 1.0);
  outColor = sum;
}`,Jr={twirl:0,pinch:1,bulge:2,shear:3,polar:4,zigzag:5,smudge:6},Qr={stretch:0,mirror:1,repeat:2},ei={around:0,out:1,pond:2},ti={straight:0,bow:1,wave:2},oi=(e,o)=>e===4?o.polarMode==="unwrap"?1:0:e===3?o.axis==="vertical"?1:0:ei[o.style]??0,ai=e=>["twirl","pinch","bulge","polar","zigzag"].includes(e.type),li={id:"distort",name:"Distort",category:"distort",blend:"normal",description:"Twirl, pinch, bulge, shear, smudge, zigzag or wrap the picture into polar coordinates.",animated:!0,animates:e=>e.speed>0,params:[{key:"type",label:"Type",type:"select",default:"twirl",options:[{value:"twirl",label:"Twirl"},{value:"pinch",label:"Pinch"},{value:"bulge",label:"Bulge"},{value:"polar",label:"Polar coordinates"},{value:"shear",label:"Shear"},{value:"smudge",label:"Smudge"},{value:"zigzag",label:"Zigzag"}]},{key:"strength",label:"Strength",type:"number",min:-1,max:1,step:.01,default:.5,when:e=>e.type!=="polar"},{key:"radius",label:"Radius",type:"number",min:.05,max:1.5,step:.01,default:.5,when:ai},{key:"centerX",label:"Center X",type:"number",min:0,max:1,step:.01,default:.5,when:e=>e.type!=="smudge"},{key:"centerY",label:"Center Y",type:"number",min:0,max:1,step:.01,default:.5,when:e=>e.type!=="smudge"},{key:"polarMode",label:"Mapping",type:"select",default:"wrap",options:[{value:"wrap",label:"Wrap into a circle"},{value:"unwrap",label:"Unwrap a circle"}],when:e=>e.type==="polar"},{key:"repeats",label:"Repeats",type:"number",min:1,max:8,step:1,default:1,when:e=>e.type==="polar"},{key:"seamless",label:"Seamless",type:"boolean",default:!0,when:e=>e.type==="polar"},{key:"rotation",label:"Rotação",type:"number",min:0,max:360,step:1,default:0,when:e=>e.type==="polar"},{key:"axis",label:"Axis",type:"select",default:"horizontal",options:[{value:"horizontal",label:"Horizontal"},{value:"vertical",label:"Vertical"}],when:e=>e.type==="shear"},{key:"curve",label:"Curve",type:"select",default:"straight",options:[{value:"straight",label:"Straight"},{value:"bow",label:"Bow"},{value:"wave",label:"Wave"}],when:e=>e.type==="shear"},{key:"angle",label:"Direção",type:"number",min:0,max:360,step:1,default:270,when:e=>e.type==="smudge"},{key:"streaks",label:"Streaks",type:"number",min:0,max:1,step:.01,default:.85,when:e=>e.type==="smudge"},{key:"ridges",label:"Ridges",type:"number",min:1,max:30,step:.5,default:14,when:e=>e.type==="zigzag"},{key:"style",label:"Style",type:"select",default:"around",options:[{value:"around",label:"Around center"},{value:"out",label:"Out from center"},{value:"pond",label:"Pond ripples"}],when:e=>e.type==="zigzag"},{key:"edges",label:"Edges",type:"select",default:"stretch",options:[{value:"stretch",label:"Stretch"},{value:"mirror",label:"Mirror"},{value:"repeat",label:"Repeat"}],when:e=>["polar","shear"].includes(e.type)||e.type!=="smudge"&&e.radius>.6},{key:"speed",label:"Movimento",type:"number",min:0,max:2,step:.01,default:0}],render(e,o,t){const a=Jr[t.type]??0,l=e.time*t.speed,r=Math.min(e.width,e.height);if(a===6){const p=t.angle*Math.PI/180,f=[Math.cos(p),Math.sin(p)],m=t.strength<0?-1:1,d=[f[0]*m,f[1]*m],v=Math.abs(t.strength)*140*e.unit,g=Math.max(1,e.unit);let x=o,k=1;const h=Math.max(1,Math.min(10,Math.ceil(Math.log2(v*4/g+1))));for(let b=0;b<h;b+=1){const y=e.pass("distort-smudge",Zr,{input:x,uniforms:{uDirection:d,uStep:g,uLength:Math.max(v,.5),uStreaks:t.streaks,uPhase:l,uUnitPx:Math.max(e.unit,.5),uShift:g*k,uPower:k,uFirst:b===0?1:0,uFinal:b===h-1?1:0}});x!==o&&e.release(x),x=y,k*=2}return x}const i=o.mipmapped?o:e.mipmap(o),n=t.speed>0?.7+.3*Math.cos(l*.8):1;let u=t.strength,c=(t.rotation||0)/360,s=0;return a<=2&&(u*=n),a===3&&(u*=t.speed>0?Math.cos(l*.6):1),a===4&&(c+=l*.03),a===5&&(s=l*.6),e.pass("distort-warp",Kr,{input:i,uniforms:{uType:a,uCenter:[t.centerX,1-t.centerY],uShort:r,uEdges:Qr[t.edges]??0,uRadius:t.radius*(a===4?1.6:a===5?1.8:1),uSeamless:t.seamless?1:0,uStrength:a===3?u*.8:u,uPhase:s,uOption:oi(a,t),uCurve:ti[t.curve]??0,uCount:a===4?Math.max(1,Math.round(t.repeats)):t.ridges,uRotation:c}})}},ri=`
uniform float uCell;
uniform float uShape;
uniform float uScale;
uniform float uFloor;
uniform float uContrast;
uniform float uPalette;
uniform vec3 uInk;
uniform vec3 uGround;
uniform float uOffset;
uniform float uSpin;
uniform float uSeed;
uniform float uLod;
uniform float uReach;

const vec3 RED = vec3(0.86, 0.2, 0.15);
const vec3 YELLOW = vec3(0.96, 0.74, 0.1);
const vec3 BLUE = vec3(0.1, 0.32, 0.66);
const vec3 BLACK = vec3(0.09, 0.09, 0.1);
const vec3 CREAM = vec3(0.94, 0.91, 0.85);

float sdBox(vec2 p, vec2 b) {
  vec2 d = abs(p) - b;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

float sdTriangle(vec2 p, float r) {
  const float k = 1.7320508;
  p.y += r * 0.18;
  p.x = abs(p.x) - r;
  p.y = p.y + r / k;
  if (p.x + k * p.y > 0.0) p = vec2(p.x - k * p.y, -k * p.x - p.y) / 2.0;
  p.x -= clamp(p.x, -2.0 * r, 0.0);
  return -length(p) * sign(p.y);
}

float sdStar(vec2 p, float r, float rf) {
  const vec2 k1 = vec2(0.809016994375, -0.587785252292);
  const vec2 k2 = vec2(-k1.x, k1.y);
  p.y -= r * 0.08;
  p.x = abs(p.x);
  p -= 2.0 * max(dot(k1, p), 0.0) * k1;
  p -= 2.0 * max(dot(k2, p), 0.0) * k2;
  p.x = abs(p.x);
  p.y -= r;
  vec2 ba = rf * vec2(-k1.y, k1.x) - vec2(0.0, 1.0);
  float h = clamp(dot(p, ba) / dot(ba, ba), 0.0, r);
  return length(p - ba * h) * sign(p.y * ba.x - p.x * ba.y);
}

float sdSpokes(vec2 p, float r) {
  float d = 1e5;
  float t = max(r * 0.2, 0.035);
  for (int i = 0; i < 3; i++) {
    vec2 q = rotation(float(i) * PI / 3.0 + PI * 0.5) * p;
    d = min(d, sdBox(q, vec2(r, 0.0)) - t);
  }
  return d;
}

float shapeDistance(float kind, vec2 p, float r) {
  if (kind < 0.5) return length(p) - r;
  if (kind < 1.5) return sdBox(p, vec2(r * 0.86)) - r * 0.04;
  if (kind < 2.5) return sdTriangle(p, r * 1.12);
  if (kind < 3.5) {
    float t = r * 0.34;
    return min(sdBox(p, vec2(r, t)), sdBox(p, vec2(t, r)));
  }
  if (kind < 4.5) return sdStar(p, r * 1.08, 0.45);
  if (kind < 5.5) return sdSpokes(p, r);
  if (kind < 6.5) return abs(length(p) - r * 0.74) - r * 0.26;
  if (kind < 7.5) {
    vec2 q = p + vec2(0.0, r * 0.42);
    return max(length(q) - r * 1.1, -q.y);
  }
  vec2 q = p + vec2(r * 0.86);
  return max(length(q) - r * 1.72, sdBox(p, vec2(r * 0.86)));
}

vec3 bauhaus(vec3 c) {
  vec3 hsv = rgb2hsv(c);
  float dark = smoothstep(0.35, 0.65, luma(uGround));
  if (hsv.y < 0.2 || hsv.z < 0.12) return mix(CREAM, BLACK, dark);
  float h = hsv.x;
  float dr = min(abs(h - 0.02), abs(h - 1.02));
  float dy = abs(h - 0.14);
  float db = abs(h - 0.6);
  if (dr < dy && dr < db) return RED;
  return dy < db ? YELLOW : BLUE;
}

vec4 stamp(vec2 cell, vec2 rowShift, vec2 p) {
  vec2 center = (cell + 0.5 + rowShift) * uCell;
  vec2 uv = center / uResolution;
  if (uv.x < -0.02 || uv.y < -0.02 || uv.x > 1.02 || uv.y > 1.02) return vec4(0.0);
  vec3 image = textureLod(uInput, clamp(uv, 0.0, 1.0), uLod).rgb;
  float l = clamp((luma(image) - 0.5) * uContrast + 0.5, 0.0, 1.0);
  float dark = smoothstep(0.35, 0.65, luma(uGround));
  float tone = mix(l, 1.0 - l, dark);
  vec3 h = hash32(cell + uSeed * 13.7 + rowShift * 3.1);
  float kind = uShape;
  if (uShape > 8.5) {
    float pick = floor(h.x * 5.0);
    kind = pick < 0.5 ? 0.0 : pick < 1.5 ? 2.0 : pick < 2.5 ? 7.0 : pick < 3.5 ? 1.0 : 8.0;
  }
  float size = mix(uFloor, 1.0, pow(tone, 0.75)) * uScale * 0.5;
  float spin = floor(h.y * 4.0) * PI * 0.5 * step(8.5, uShape);
  spin += uSpin * (h.z * 2.0 - 1.0 + sign(h.z - 0.5) * 0.4);
  vec2 q = rotation(spin) * (p - center) / uCell;
  float d = shapeDistance(kind, q, size) * uCell;
  float cover = smoothstep(0.7, -0.7, d) * clamp(size * uCell / 0.8, 0.0, 1.0);
  vec3 color = uInk;
  if (uPalette < 0.5) {
    vec3 hsv = rgb2hsv(image);
    float value = mix(0.16 + 0.84 * pow(tone, 0.8), 0.9 - 0.72 * pow(tone, 0.9), dark);
    color = hsv2rgb(vec3(hsv.x, clamp(hsv.y * mix(0.5, 1.6, smoothstep(0.04, 0.45, tone)), 0.0, 1.0), value));
  } else if (uPalette < 1.5) {
    color = bauhaus(image);
  }
  return vec4(color, cover);
}

void main() {
  vec2 p = vUv * uResolution;
  vec3 color = uGround;
  float row = floor(p.y / uCell);
  for (int j = -1; j <= 1; j++) {
    float r = row + float(j);
    if (abs(float(j)) > uReach) continue;
    vec2 shift = vec2(uOffset * 0.5 * mod(r, 2.0), 0.0);
    float col = floor(p.x / uCell - shift.x);
    for (int i = -1; i <= 1; i++) {
      if (abs(float(i)) > uReach) continue;
      vec4 s = stamp(vec2(col + float(i), r), shift, p);
      color = mix(color, s.rgb, s.a);
    }
  }
  outColor = vec4(color, 1.0);
}`,ii={circle:0,square:1,triangle:2,cross:3,star:4,asterisk:5,ring:6,half:7,quarter:8,mixed:9},ni={image:0,bauhaus:1,ink:2},ui={id:"forms",name:"Forms",category:"geometric",description:"Bold geometric stamps on a grid, each sized by the tone beneath it, like a Bauhaus poster.",animated:!0,preview:{zoom:2},animates:e=>e.spin>0,params:[{key:"shape",label:"Shape",type:"select",default:"mixed",options:[{value:"mixed",label:"Mixed"},{value:"circle",label:"Circle"},{value:"square",label:"Square"},{value:"triangle",label:"Triangle"},{value:"cross",label:"Cross"},{value:"star",label:"Star"},{value:"asterisk",label:"Asterisk"},{value:"ring",label:"Ring"},{value:"half",label:"Half circle"},{value:"quarter",label:"Quarter circle"}]},{key:"palette",label:"Cores",type:"select",default:"image",options:[{value:"image",label:"From image"},{value:"bauhaus",label:"Bauhaus"},{value:"ink",label:"Single ink"}]},{key:"ink",label:"Ink",type:"color",default:"#f2ede4",when:e=>e.palette==="ink"},{key:"background",label:"Fundo",type:"color",default:"#0d0c11"},{key:"size",label:"Grid size",type:"number",min:6,max:80,step:.5,default:26},{key:"scale",label:"Stamp size",type:"number",min:.3,max:1.8,step:.01,default:.85},{key:"floor",label:"Smallest stamp",type:"number",min:0,max:1,step:.01,default:.2},{key:"contrast",label:"Contraste",type:"number",min:.5,max:2.5,step:.01,default:1.2},{key:"layout",label:"Layout",type:"select",default:"grid",options:[{value:"grid",label:"Grid"},{value:"offset",label:"Offset rows"}]},{key:"spin",label:"Spin",type:"number",min:0,max:2,step:.01,default:0},{key:"variation",label:"Variação",type:"number",min:0,max:100,step:1,default:0}],render(e,o,t){const a=o.mipmapped?o:e.mipmap(o),l=Math.max(3,t.size*e.unit);return e.pass("forms",ri,{input:a,uniforms:{uCell:l,uShape:ii[t.shape]??9,uScale:t.scale,uFloor:t.floor,uContrast:t.contrast,uPalette:ni[t.palette]??0,uInk:C(t.ink),uGround:C(t.background),uOffset:t.layout==="offset"?1:0,uSpin:e.time*t.spin*.8,uSeed:t.variation,uLod:Math.max(0,Math.log2(l)-.5),uReach:t.scale>.8||t.spin>0?1:0}})}},si=`
uniform sampler2D uTone;
uniform float uTile;
uniform float uWidth;
uniform float uWeight;
uniform float uPattern;
uniform float uStyle;
uniform float uMode;
uniform vec3 uInk;
uniform vec3 uGround;
uniform float uContrast;
uniform float uShuffle;
uniform float uSeed;
uniform float uLod;

float toneAt(vec3 c) {
  float l = clamp((luma(c) - 0.5) * uContrast + 0.5, 0.0, 1.0);
  float g = luma(uGround);
  return mix(l, 1.0 - l, smoothstep(0.35, 0.65, g));
}

float choose(vec2 cell, float tone) {
  float h = hash12(cell + uSeed * 17.31);
  if (uPattern < 0.5) return step(0.5, h);
  if (uPattern < 1.5) return step(h, mix(0.1, 0.9, smoothstep(0.15, 0.85, tone)));
  if (uPattern < 2.5) return mod(cell.x + cell.y, 2.0);
  return step(0.94, h);
}

float arcs(vec2 f, float w) {
  float a = abs(length(f) - 0.5);
  float b = abs(length(f - 1.0) - 0.5);
  if (uStyle < 0.5) return min(a, b) - w;
  if (uStyle < 1.5) {
    float t = clamp(w * 0.28, 0.004, 0.066);
    float gap = 0.06 + t * 1.2;
    return min(abs(a - gap) - t, abs(b - gap) - t);
  }
  return abs(f.x - f.y) * 0.70710678 - w;
}

void main() {
  vec2 p = vUv * uResolution;
  vec2 g = p / uTile;
  vec2 cell = floor(g);
  vec2 f = g - cell;
  vec2 centerUv = (cell + 0.5) * uTile / uResolution;
  float cellTone = toneAt(texture(uTone, centerUv).rgb);
  float flip = choose(cell, cellTone);
  if (uShuffle > 0.0) {
    float rate = 0.08 + 0.12 * hash12(cell + 3.7 + uSeed);
    float phase = uShuffle * rate + hash12(cell + 9.1 + uSeed);
    flip = mod(flip + floor(phase), 2.0);
    f = rotation(smootherstep(0.0, 0.7 * rate, fract(phase)) * PI * 0.5) * (f - 0.5) + 0.5;
  }
  if (flip > 0.5) f.x = 1.0 - f.x;
  vec3 smoothColor = texture(uTone, vUv).rgb;
  float tone = toneAt(smoothColor);
  float w = uWidth * mix(1.0, 0.08 + 1.1 * tone, uWeight) * 0.5;
  float d = arcs(f, w) * uTile;
  float aa = 0.75;
  float cover = smoothstep(aa, -aa, d) * clamp(w * uTile * 2.0 / 1.2, 0.0, 1.0);
  vec3 image = textureLod(uInput, vUv, uLod).rgb;
  vec3 ink = uInk;
  if (uMode < 0.5) {
    vec3 hsv = rgb2hsv(image);
    float dark = smoothstep(0.35, 0.65, luma(uGround));
    float value = mix(0.14 + 0.86 * pow(tone, 0.85), 0.9 - 0.72 * pow(tone, 0.9), dark);
    ink = hsv2rgb(vec3(hsv.x, clamp(hsv.y * mix(0.5, 1.7, smoothstep(0.04, 0.45, tone)), 0.0, 1.0), value));
  }
  outColor = vec4(mix(uGround, ink, cover), 1.0);
}`,ci={maze:0,tone:1,rings:2,waves:3},fi={arcs:0,double:1,diagonal:2},mi={image:0,ink:1},di={id:"truchet",name:"Truchet",category:"geometric",description:"Curved arc tiles join into a flowing woven pattern that takes its weight and color from the picture.",animated:!0,preview:{zoom:2},animates:e=>e.shuffle>0,params:[{key:"pattern",label:"Pattern",type:"select",default:"tone",options:[{value:"tone",label:"Follow tone"},{value:"maze",label:"Maze"},{value:"rings",label:"Rings"},{value:"waves",label:"Waves"}]},{key:"style",label:"Style",type:"select",default:"arcs",options:[{value:"arcs",label:"Arcs"},{value:"double",label:"Double arcs"},{value:"diagonal",label:"Diagonals"}]},{key:"size",label:"Tile size",type:"number",min:6,max:80,step:.5,default:20},{key:"width",label:"Line width",type:"number",min:.03,max:.45,step:.01,default:.22},{key:"weight",label:"Weight by tone",type:"number",min:0,max:1,step:.01,default:.6},{key:"contrast",label:"Contraste",type:"number",min:.5,max:2.5,step:.01,default:1.2},{key:"color",label:"Cor",type:"select",default:"image",options:[{value:"image",label:"From image"},{value:"ink",label:"Single ink"}]},{key:"ink",label:"Ink",type:"color",default:"#f4efe6",when:e=>e.color==="ink"},{key:"ground",label:"Fundo",type:"color",default:"#0b0a0f"},{key:"shuffle",label:"Shuffle",type:"number",min:0,max:2,step:.01,default:0},{key:"variation",label:"Variação",type:"number",min:0,max:100,step:1,default:0}],render(e,o,t){const a=Math.max(3,t.size*e.unit),l=o.mipmapped?o:e.mipmap(o),r=E(e,o,a*.3),i=e.pass("truchet",si,{input:l,textures:{uTone:r},uniforms:{uTile:a,uWidth:t.width,uWeight:t.weight,uPattern:ci[t.pattern]??1,uStyle:fi[t.style]??0,uMode:mi[t.color]??0,uInk:C(t.ink),uGround:C(t.ground),uContrast:t.contrast,uShuffle:e.time*t.shuffle,uSeed:t.variation,uLod:Math.max(0,Math.log2(a*.15))}});return e.release(r),i}},pi=`
uniform sampler2D uTone;
uniform float uPitch;
uniform float uAngle;
uniform float uBend;
uniform float uWidth;
uniform float uWeight;
uniform float uWeave;
uniform float uDepth;
uniform float uMode;
uniform vec3 uWarpColor;
uniform vec3 uWeftColor;
uniform vec3 uGround;
uniform float uContrast;
uniform float uRipple;
uniform float uPhase;
uniform float uLod;

float toneOf(vec3 c) {
  float l = clamp((luma(c) - 0.5) * uContrast + 0.5, 0.0, 1.0);
  return mix(l, 1.0 - l, smoothstep(0.35, 0.65, luma(uGround)));
}

float over(float i, float j) {
  if (uWeave < 0.5) return mod(i + j, 2.0) < 0.5 ? 1.0 : -1.0;
  if (uWeave < 1.5) return mod(i + j, 4.0) < 1.5 ? 1.0 : -1.0;
  return mod(floor(i * 0.5) + floor(j * 0.5), 2.0) < 0.5 ? 1.0 : -1.0;
}

vec3 vivid(vec3 c, float tone) {
  vec3 hsv = rgb2hsv(c);
  float dark = smoothstep(0.35, 0.65, luma(uGround));
  float value = mix(0.1 + 0.9 * pow(tone, 0.9), 0.9 - 0.75 * pow(tone, 0.9), dark);
  return hsv2rgb(vec3(hsv.x, clamp(hsv.y * mix(0.5, 1.45, smoothstep(0.04, 0.45, tone)), 0.0, 1.0), value));
}

void main() {
  vec2 p = vUv * uResolution;
  vec3 soft = texture(uTone, vUv).rgb;
  float tone = toneOf(soft);
  vec2 q = rotation(uAngle) * (p - 0.5 * uResolution) / uPitch;
  float bend = (luma(soft) - 0.5) * uBend;
  q += vec2(bend, -bend);
  if (uRipple > 0.0) {
    q.x += sin(q.y * 0.21 + uPhase * 1.3) * uRipple * 0.9 + sin(q.y * 0.07 - uPhase * 0.7 + q.x * 0.05) * uRipple * 1.4;
    q.y += sin(q.x * 0.17 - uPhase * 1.1) * uRipple * 0.9 + sin(q.x * 0.06 + uPhase * 0.6 - q.y * 0.04) * uRipple * 1.4;
  }
  vec2 aa = max(fwidth(q), vec2(1e-4)) * 0.8;

  float i = floor(q.x);
  float fu = q.x - i - 0.5;
  float j = floor(q.y);
  float fv = q.y - j - 0.5;
  float jv = floor(q.y - 0.5);
  float rv = q.y - 0.5 - jv;
  float iu = floor(q.x - 0.5);
  float ru = q.x - 0.5 - iu;
  float hw = mix(over(i, jv), over(i, jv + 1.0), smoothstep(0.0, 1.0, rv));
  float hf = -mix(over(iu, j), over(iu + 1.0, j), smoothstep(0.0, 1.0, ru));
  float sw = (over(i, jv + 1.0) - over(i, jv)) * 6.0 * rv * (1.0 - rv);
  float sf = -(over(iu + 1.0, j) - over(iu, j)) * 6.0 * ru * (1.0 - ru);

  float w = uWidth * mix(1.0, 0.12 + 0.88 * tone, uWeight) * 0.5;
  float cw = smoothstep(w + aa.x, w - aa.x, abs(fu)) * clamp(w / aa.x, 0.0, 1.0);
  float cf = smoothstep(w + aa.y, w - aa.y, abs(fv)) * clamp(w / aa.y, 0.0, 1.0);

  vec3 image = textureLod(uInput, vUv, uLod).rgb;
  vec3 baseWarp = uWarpColor * (0.08 + 0.92 * tone);
  vec3 baseWeft = uWeftColor * (0.08 + 0.92 * tone);
  if (uMode < 0.5) {
    baseWarp = vivid(image, tone);
    baseWeft = baseWarp * 0.9;
  }

  vec3 light = normalize(vec3(-0.45, 0.55, 0.7));
  float xw = clamp(fu / max(w, 1e-3), -1.0, 1.0);
  vec3 nw = normalize(vec3(xw, -sw * 0.35, sqrt(max(1.0 - xw * xw, 0.0)) + 0.05));
  float xf = clamp(fv / max(w, 1e-3), -1.0, 1.0);
  vec3 nf = normalize(vec3(-sf * 0.35, xf, sqrt(max(1.0 - xf * xf, 0.0)) + 0.05));
  mat2 back = rotation(-uAngle);
  nw.xy = back * nw.xy;
  nf.xy = back * nf.xy;
  float dw = 0.4 + 0.6 * max(dot(nw, light), 0.0);
  float df = 0.4 + 0.6 * max(dot(nf, light), 0.0);
  float ow = 0.55 + 0.45 * (hw * 0.5 + 0.5);
  float of = 0.55 + 0.45 * (hf * 0.5 + 0.5);
  float shadeW = mix(1.0, dw * ow * 1.3, uDepth);
  float shadeF = mix(1.0, df * of * 1.3, uDepth);
  vec3 warpColor = baseWarp * shadeW;
  vec3 weftColor = baseWeft * shadeF;

  float gap = 1.0 - uDepth * 0.5 * max(smoothstep(w + 0.25, w, abs(fu)), smoothstep(w + 0.25, w, abs(fv)));
  vec3 color = uGround * gap;
  float warpTop = smoothstep(-0.15, 0.15, hw - hf);
  vec3 under = mix(warpColor, weftColor, warpTop);
  float underCover = mix(cw, cf, warpTop);
  under *= 1.0 - uDepth * 0.45 * smoothstep(w + 0.22, w, mix(abs(fv), abs(fu), warpTop));
  color = mix(color, under, underCover);
  vec3 top = mix(weftColor, warpColor, warpTop);
  float topCover = mix(cf, cw, warpTop);
  color = mix(color, top, topCover);
  outColor = vec4(color, 1.0);
}`,vi={plain:0,twill:1,basket:2},hi={id:"lattice",name:"Lattice",category:"geometric",description:"An over-and-under woven lattice that bends and shades with the picture.",animated:!0,preview:{zoom:2},animates:e=>e.ripple>0,params:[{key:"weave",label:"Weave",type:"select",default:"plain",options:[{value:"plain",label:"Plain"},{value:"twill",label:"Twill"},{value:"basket",label:"Basket"}]},{key:"size",label:"Thread spacing",type:"number",min:4,max:60,step:.5,default:18},{key:"width",label:"Thread width",type:"number",min:.2,max:1,step:.01,default:.72},{key:"weight",label:"Width by tone",type:"number",min:0,max:1,step:.01,default:.6},{key:"bend",label:"Bend",type:"number",min:0,max:6,step:.01,default:3},{key:"angle",label:"Ângulo",type:"number",min:0,max:90,step:1,default:0},{key:"depth",label:"Profundidade",type:"number",min:0,max:1,step:.01,default:.7},{key:"contrast",label:"Contraste",type:"number",min:.5,max:2.5,step:.01,default:1.15},{key:"color",label:"Thread color",type:"select",default:"image",options:[{value:"image",label:"From image"},{value:"custom",label:"Two colors"}]},{key:"warpColor",label:"Vertical threads",type:"color",default:"#f1e7d4",when:e=>e.color==="custom"},{key:"weftColor",label:"Horizontal threads",type:"color",default:"#d2563b",when:e=>e.color==="custom"},{key:"ground",label:"Fundo",type:"color",default:"#0b0a0e"},{key:"ripple",label:"Ripple",type:"number",min:0,max:1,step:.01,default:0}],render(e,o,t){const a=Math.max(2,t.size*e.unit),l=o.mipmapped?o:e.mipmap(o),r=E(e,o,a*.9),i=e.pass("lattice",pi,{input:l,textures:{uTone:r},uniforms:{uPitch:a,uAngle:t.angle*Math.PI/180,uBend:t.bend,uWidth:t.width,uWeight:t.weight,uWeave:vi[t.weave]??0,uDepth:t.depth,uMode:t.color==="custom"?1:0,uWarpColor:C(t.warpColor),uWeftColor:C(t.weftColor),uGround:C(t.ground),uContrast:t.contrast,uRipple:t.ripple,uPhase:e.time,uLod:Math.max(0,Math.log2(a*.25))}});return e.release(r),i}},gi=`
uniform vec2 uCell;
uniform vec2 uImage;
uniform float uLod;

void main() {
  vec2 center = (floor(gl_FragCoord.xy) + 0.5) * uCell;
  float l[36];
  vec3 sum = vec3(0.0);
  vec3 squares = vec3(0.0);
  for (int y = 0; y < 6; y++) {
    for (int x = 0; x < 6; x++) {
      vec2 p = center + (vec2(float(x), float(y)) - 2.5) * 0.25 * uCell;
      vec3 c = textureLod(uInput, clamp(p / uImage, 0.0, 1.0), uLod).rgb;
      l[y * 6 + x] = dot(c, vec3(0.3, 0.55, 0.15));
      if (x > 0 && x < 5 && y > 0 && y < 5) {
        sum += c;
        squares += c * c;
      }
    }
  }
  vec3 mean = sum / 16.0;
  vec3 variance = max(squares / 16.0 - mean * mean, 0.0);
  float spread = sqrt(variance.r + variance.g + variance.b);
  vec2 offset = vec2(0.0);
  float total = 0.0;
  float peak = 0.0;
  for (int y = 1; y < 5; y++) {
    for (int x = 1; x < 5; x++) {
      float gx = l[y * 6 + x + 1] - l[y * 6 + x - 1];
      float gy = l[(y + 1) * 6 + x] - l[(y - 1) * 6 + x];
      float g = gx * gx + gy * gy;
      float w = g * g + 1e-12;
      offset += (vec2(float(x), float(y)) - 2.5) * 0.25 * w;
      total += w;
      peak = max(peak, g);
    }
  }
  offset /= total;
  outColor = vec4(clamp(spread * 2.2, 0.0, 1.0), clamp(sqrt(sqrt(peak)) * 2.0, 0.0, 1.0), offset + 0.5);
}`,jt=`
uniform sampler2D uTris;
uniform float uTriRow;
uniform vec4 uBounds;

int texelOf(int t, int k) {
  return t * 5 + k;
}

vec4 fetchTri(int t, int k) {
  int index = texelOf(t, k);
  int row = int(uTriRow);
  return texelFetch(uTris, ivec2(index % row, index / row), 0);
}

vec2 unpack(vec4 v) {
  vec4 b = floor(v * 255.0 + 0.5);
  return vec2(b.r * 256.0 + b.g, b.b * 256.0 + b.a);
}

vec2 vertexOf(int t, int k) {
  return unpack(fetchTri(t, k)) / 65535.0 * uBounds.zw + uBounds.xy;
}

int neighborOf(int t, int k) {
  vec2 pair = unpack(fetchTri(t, 3 + k / 2));
  float n = k == 1 ? pair.y : pair.x;
  return n > 65534.5 ? -1 : int(n);
}

float edgeFn(vec2 a, vec2 b, vec2 p) {
  vec2 ab = b - a;
  vec2 ap = p - a;
  return ab.x * ap.y - ab.y * ap.x;
}
`,bi=`
${jt}
uniform vec2 uImage;
uniform float uCount;
uniform float uColorRow;
uniform float uRelief;
uniform float uDepth;
uniform vec3 uLight;
uniform float uSaturation;
uniform float uContrast;

vec3 photo(vec2 p, float lod) {
  return textureLod(uInput, clamp(p / uImage, 0.0, 1.0), lod).rgb;
}

void main() {
  int t = int(gl_FragCoord.x) + int(gl_FragCoord.y) * int(uColorRow);
  if (t >= int(uCount)) {
    outColor = vec4(0.0);
    return;
  }
  vec2 a = vertexOf(t, 0);
  vec2 b = vertexOf(t, 1);
  vec2 c = vertexOf(t, 2);
  vec2 m = (a + b + c) / 3.0;
  float area = abs(edgeFn(a, b, m) + edgeFn(b, c, m) + edgeFn(c, a, m)) * 0.5;
  float lod = log2(max(sqrt(area) * 0.2, 1.0));
  vec3 color = photo(m, lod) * 0.55;
  color += photo(mix(m, a, 0.5), lod) * 0.15;
  color += photo(mix(m, b, 0.5), lod) * 0.15;
  color += photo(mix(m, c, 0.5), lod) * 0.15;

  float vlod = lod + 1.0;
  float ha = luma(photo(a, vlod)) * uDepth;
  float hb = luma(photo(b, vlod)) * uDepth;
  float hc = luma(photo(c, vlod)) * uDepth;
  vec3 n = cross(vec3(b - a, hb - ha), vec3(c - a, hc - ha));
  n = normalize(n * sign(n.z + 1e-9));
  float lit = dot(n, uLight) / max(uLight.z, 1e-3);
  float shade = clamp(mix(1.0, lit, uRelief * 1.6), 0.25, 1.6);
  color *= shade;

  float l = luma(color);
  color = mix(vec3(l), color, uSaturation);
  color = (color - 0.5) * uContrast + 0.5;
  outColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}`,yi=`
${jt}
uniform sampler2D uBins;
uniform sampler2D uColors;
uniform vec2 uBinGrid;
uniform float uBinSize;
uniform float uColorRow;
uniform float uEdges;
uniform float uEdgeWidth;
uniform vec3 uEdgeColor;

vec3 colorOf(int t) {
  int row = int(uColorRow);
  return texelFetch(uColors, ivec2(t % row, t / row), 0).rgb;
}

void main() {
  vec2 p = gl_FragCoord.xy;
  ivec2 bin = ivec2(min(floor(p / uBinSize), uBinGrid - 1.0));
  vec2 seed = unpack(texelFetch(uBins, bin, 0));
  int t = int(seed.x);
  vec2 a = vec2(0.0);
  vec2 b = vec2(0.0);
  vec2 c = vec2(0.0);
  vec3 e = vec3(0.0);
  for (int i = 0; i < 48; i++) {
    a = vertexOf(t, 0);
    b = vertexOf(t, 1);
    c = vertexOf(t, 2);
    e = vec3(edgeFn(a, b, p), edgeFn(b, c, p), edgeFn(c, a, p));
    if (min(e.x, min(e.y, e.z)) >= 0.0) break;
    int k = e.x < e.y ? (e.x < e.z ? 0 : 2) : (e.y < e.z ? 1 : 2);
    int next = neighborOf(t, k);
    if (next < 0) break;
    t = next;
  }
  vec3 d = e / vec3(length(b - a), length(c - b), length(a - c));
  vec3 own = colorOf(t);
  vec3 color = own;
  vec3 w = clamp(0.5 - d, 0.0, 0.5);
  float total = w.x + w.y + w.z;
  if (total > 0.0) {
    vec3 mixed = own * max(1.0 - total, 0.0);
    for (int k = 0; k < 3; k++) {
      if (w[k] <= 0.0) continue;
      int n = neighborOf(t, k);
      mixed += (n < 0 ? own : colorOf(n)) * w[k];
    }
    color = mixed / max(1.0, total);
  }
  float edge = min(d.x, min(d.y, d.z));
  float line = 1.0 - smoothstep(uEdgeWidth - 0.6, uEdgeWidth + 0.6, edge);
  color = mix(color, uEdgeColor, line * uEdges);
  outColor = vec4(color, 1.0);
}`,xi=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5],Ae=1e3,He=256;function xe(e,o,t){let a=Math.imul(e|0,374761393)^Math.imul(o|0,668265263)^Math.imul(t|0,2246822519);return a=Math.imul(a^a>>>13,1274126177),a^=a>>>16,(a>>>0)/4294967296}function ki(e,o,t){const a=t.ids,l=t.dists;let r=1/0,i=1/0,n=-1/0,u=-1/0;for(let U=0;U<o;U+=1){const w=e[2*U],T=e[2*U+1];w<r&&(r=w),T<i&&(i=T),w>n&&(n=w),T>u&&(u=T),a[U]=U}const c=(r+n)/2,s=(i+u)/2;let p=0,f=1/0;for(let U=0;U<o;U+=1){const w=(e[2*U]-c)**2+(e[2*U+1]-s)**2;w<f&&(p=U,f=w)}const m=e[2*p],d=e[2*p+1];let v=-1;f=1/0;for(let U=0;U<o;U+=1){if(U===p)continue;const w=(e[2*U]-m)**2+(e[2*U+1]-d)**2;w<f&&w>0&&(v=U,f=w)}if(v<0)return 0;let g=e[2*v],x=e[2*v+1],k=-1;f=1/0;for(let U=0;U<o;U+=1){if(U===p||U===v)continue;const w=Ci(m,d,g,x,e[2*U],e[2*U+1]);w<f&&(k=U,f=w)}if(k<0||f===1/0)return 0;let h=e[2*k],b=e[2*k+1];if(ve(m,d,g,x,h,b)<0){const U=v,w=g,T=x;v=k,g=h,x=b,k=U,h=w,b=T}const y=Mi(m,d,g,x,h,b),S=y[0],I=y[1];for(let U=0;U<o;U+=1)l[U]=(e[2*U]-S)**2+(e[2*U+1]-I)**2;_e(a,l,0,o-1);const L=Math.max(1,Math.ceil(Math.sqrt(o))),M=t.hullPrev,A=t.hullNext,z=t.hullTri,P=new Int32Array(L).fill(-1),D=t.triangles,F=t.halfedges,H=t.stack;let j=0,_=p;const q=(U,w)=>Math.floor(wi(U-S,w-I)*L)%L,B=(U,w)=>{F[U]=w,w!==-1&&(F[w]=U)},W=(U,w,T,O,G,K)=>{const R=j;return D[R]=U,D[R+1]=w,D[R+2]=T,B(R,O),B(R+1,G),B(R+2,K),j+=3,R},Z=U=>{let w=0,T=U,O=U;for(;;){const G=F[T],K=T-T%3;if(O=K+(T+2)%3,G===-1){if(w===0)break;T=H[--w];continue}const R=G-G%3,N=K+(T+1)%3,X=K+(T+2)%3,$=R+(G+2)%3,ee=R+(G+1)%3,ie=D[X],ne=D[T],ce=D[N],fe=D[$];if(Si(e[2*ne],e[2*ne+1],e[2*ce],e[2*ce+1],e[2*ie],e[2*ie+1],e[2*fe],e[2*fe+1])){D[T]=fe,D[G]=ie;const ue=F[$],se=F[X];if(ue===-1){let ae=_;do{if(z[ae]===$){z[ae]=T;break}ae=M[ae]}while(ae!==_)}B(T,ue),B(G,se),B(X,$),w<H.length&&(H[w++]=ee)}else{if(w===0)break;T=H[--w]}}return O};A[p]=M[k]=v,A[v]=M[p]=k,A[k]=M[v]=p,z[p]=0,z[v]=1,z[k]=2,P[q(m,d)]=p,P[q(g,x)]=v,P[q(h,b)]=k,W(p,v,k,-1,-1,-1);let Q=0,Y=0;for(let U=0;U<o;U+=1){const w=a[U],T=e[2*w],O=e[2*w+1];if(U>0&&Math.abs(T-Q)<=1e-9&&Math.abs(O-Y)<=1e-9||(Q=T,Y=O,w===p||w===v||w===k))continue;let G=0;const K=q(T,O);for(let ee=0;ee<L&&(G=P[(K+ee)%L],!(G!==-1&&G!==A[G]));ee+=1);G=M[G];let R=G,N=A[R];for(;ve(e[2*R],e[2*R+1],e[2*N],e[2*N+1],T,O)>=0;){if(R=N,R===G){R=-1;break}N=A[R]}if(R===-1)continue;let X=W(R,w,A[R],-1,-1,z[R]);z[w]=Z(X+2),z[R]=X;let $=A[R];for(N=A[$];ve(e[2*$],e[2*$+1],e[2*N],e[2*N+1],T,O)<0;)X=W($,w,N,z[w],-1,z[$]),z[w]=Z(X+2),A[$]=$,$=N,N=A[$];if(R===G)for(N=M[R];ve(e[2*N],e[2*N+1],e[2*R],e[2*R+1],T,O)<0;)X=W(N,w,R,-1,z[R],z[N]),Z(X+2),z[N]=X,A[R]=R,R=N,N=M[R];_=M[w]=R,A[R]=M[$]=w,A[w]=$,P[q(T,O)]=w,P[q(e[2*R],e[2*R+1])]=R}return j/3}function ve(e,o,t,a,l,r){return(t-e)*(r-o)-(a-o)*(l-e)}function wi(e,o){const t=e/(Math.abs(e)+Math.abs(o)||1);return(o>0?3-t:1+t)/4}function Si(e,o,t,a,l,r,i,n){const u=e-i,c=o-n,s=t-i,p=a-n,f=l-i,m=r-n,d=u*u+c*c,v=s*s+p*p,g=f*f+m*m;return u*(p*g-v*m)-c*(s*g-v*f)+d*(s*m-p*f)>0}function Ci(e,o,t,a,l,r){const i=t-e,n=a-o,u=l-e,c=r-o,s=i*i+n*n,p=u*u+c*c,f=.5/(i*c-n*u),m=(c*s-n*p)*f,d=(i*p-u*s)*f,v=m*m+d*d;return Number.isFinite(v)?v:1/0}function Mi(e,o,t,a,l,r){const i=t-e,n=a-o,u=l-e,c=r-o,s=i*i+n*n,p=u*u+c*c,f=.5/(i*c-n*u);return[e+(c*s-n*p)*f,o+(i*p-u*s)*f]}function _e(e,o,t,a){for(;a-t>16;){const l=t+a>>1;ke(e,l,t+1),o[e[t]]>o[e[a]]&&ke(e,t,a),o[e[t+1]]>o[e[a]]&&ke(e,t+1,a),o[e[t]]>o[e[t+1]]&&ke(e,t,t+1);let r=t+1,i=a;const n=e[t+1],u=o[n];for(;;){do r+=1;while(o[e[r]]<u);do i-=1;while(o[e[i]]>u);if(i<r)break;ke(e,r,i)}e[t+1]=e[i],e[i]=n,a-r+1>=i-t?(_e(e,o,r,a),a=i-1):(_e(e,o,t,i-1),t=r)}for(let l=t+1;l<=a;l+=1){const r=e[l],i=o[r];let n=l-1;for(;n>=t&&o[e[n]]>i;)e[n+1]=e[n],n-=1;e[n+1]=r}}function ke(e,o,t){const a=e[o];e[o]=e[t],e[t]=a}function Ti(e,o){if(e.work&&e.work.capacity>=o)return e.work;const t=Math.ceil(o*1.25)+64,a=Math.max(t*2-5,3)*3;return e.work={capacity:t,coords:new Float64Array(t*2),ids:new Uint32Array(t),dists:new Float64Array(t),hullPrev:new Uint32Array(t),hullNext:new Uint32Array(t),hullTri:new Uint32Array(t),triangles:new Uint32Array(a),halfedges:new Int32Array(a),stack:new Uint32Array(1024)},e.work}function kt(e,o,t,a,l,r){const i=e.gl,n=o[t];if(!n||n.width!==a||n.rows<l){n&&i.deleteTexture(n.texture);const u=Math.max(l,Math.ceil(((n==null?void 0:n.rows)||0)*1.5),1);o[t]={width:a,rows:u,texture:e.engine.createTexture(a,u,{float:!1,filter:"nearest"})}}return i.bindTexture(i.TEXTURE_2D,o[t].texture),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.texSubImage2D(i.TEXTURE_2D,0,0,0,a,l,i.RGBA,i.UNSIGNED_BYTE,r),o[t]}function Ie(e,o,t,a){e[o]=t>>8,e[o+1]=t&255,e[o+2]=a>>8,e[o+3]=a&255}function Li(e,o,t,a,l,r,i){const n=e.width,u=e.height,c=n/l,s=u/r,p=l*r,f=new Uint32Array(256);for(let w=0;w<p;w+=1)f[a[w*4]]+=1;let m=0,d=255;for(let w=0;w<256;w+=1)if(m+=f[w],m>=p*.8){d=w;break}const v=1/Math.max(d,10),g=Math.min(Math.max(t.detail,0),1),x=Math.min(Math.max(t.jitter,0),1),k=Math.min(Math.max(t.snap,0),1),h=Math.round(t.variation)*7919+13,b=o.accepted&&o.accepted.length===p&&o.acceptKey===i?o.accepted:null,y=new Uint8Array(p),S=Math.ceil((l+r)*2)+8,I=Ti(o,p+S),L=I.coords;let M=0;const A=1;for(let w=0;w<r;w+=1)for(let T=0;T<l;T+=1){const O=w*l+T,G=xi[(w&3)*4+(T&3)],K=G===0?.01:(G+.5+(xe(T,w,h+7)-.5)*1.8*x)/16,R=Math.min(a[O*4]*v,1),N=Math.min(Math.max((R-.1)/.9,0),1),$=.25+(.0625+.9375*N*N*(3-2*N)-.25)*g,ee=b?b[O]?.035:-.035:0;if(K>=$+ee)continue;y[O]=1;const ie=G===0?1.7:G<4?1.2:.9,ne=Math.min(Math.max((a[O*4+1]/255-.25)*2.5,0),1)*k,ce=1-ne*.85,fe=(a[O*4+2]/255-.5)*ne,me=(a[O*4+3]/255-.5)*ne,ue=fe+(xe(T,w,h)-.5)*ie*x*ce+(xe(T,w,h+3)-.5)*.002,se=me+(xe(T,w,h+1)-.5)*ie*x*ce+(xe(T,w,h+5)-.5)*.002;L[2*M]=Math.min(Math.max((T+.5+ue)*c,A),n-A),L[2*M+1]=Math.min(Math.max((w+.5+se)*s,A),u-A),M+=1}o.accepted=y,o.acceptKey=i;const z=2,P=(w,T)=>1+4*T*w*(1-w);for(let w=0;w<=l;w+=1){const T=w/l,O=y[Math.min(w,l-1)]||y[Math.max(w-1,0)],G=y[(r-1)*l+Math.min(w,l-1)]||y[(r-1)*l+Math.max(w-1,0)];(w%4===0||w===l||O)&&(L[2*M]=T*n,L[2*M+1]=-P(T,z),M+=1),(w%4===0||w===l||G)&&(L[2*M]=T*n,L[2*M+1]=u+P(T,z),M+=1)}for(let w=1;w<r;w+=1){const T=w/r,O=y[w*l]||y[(w-1)*l],G=y[w*l+l-1]||y[(w-1)*l+l-1];(w%4===0||O)&&(L[2*M]=-P(T,z),L[2*M+1]=T*u,M+=1),(w%4===0||G)&&(L[2*M]=n+P(T,z),L[2*M+1]=T*u,M+=1)}L[2*M]=-1,L[2*M+1]=-1,L[2*M+2]=n+1,L[2*M+3]=-1,L[2*M+4]=-1,L[2*M+5]=u+1,L[2*M+6]=n+1,L[2*M+7]=u+1,M+=4;const D=ki(L,M,I),F=[-8,-8,n+16,u+16],H=Math.max(1,Math.ceil(D*5/Ae)),j=new Uint8Array(Ae*H*4),_=I.triangles,q=I.halfedges,B=new Uint16Array(M*2);for(let w=0;w<M;w+=1)B[2*w]=Math.round((L[2*w]-F[0])/F[2]*65535),B[2*w+1]=Math.round((L[2*w+1]-F[1])/F[3]*65535);for(let w=0;w<D;w+=1){const T=w*20;for(let R=0;R<3;R+=1){const N=_[3*w+R];Ie(j,T+R*4,B[2*N],B[2*N+1])}const O=q[3*w]<0?65535:Math.floor(q[3*w]/3),G=q[3*w+1]<0?65535:Math.floor(q[3*w+1]/3),K=q[3*w+2]<0?65535:Math.floor(q[3*w+2]/3);Ie(j,T+12,O,G),Ie(j,T+16,K,65535)}const W=Math.max(c,s)*2,Z=Math.ceil(n/W),Q=Math.ceil(u/W),Y=new Uint8Array(Z*Q*4),U=(w,T)=>B[2*w+T]/65535*F[2+T]+F[T];for(let w=0;w<D;w+=1){const T=_[3*w],O=_[3*w+1],G=_[3*w+2],K=U(T,0),R=U(T,1),N=U(O,0),X=U(O,1),$=U(G,0),ee=U(G,1),ie=Math.max(0,Math.floor(Math.min(K,N,$)/W-1)),ne=Math.min(Z-1,Math.ceil(Math.max(K,N,$)/W)),ce=Math.max(0,Math.floor(Math.min(R,X,ee)/W-1)),fe=Math.min(Q-1,Math.ceil(Math.max(R,X,ee)/W));for(let me=ce;me<=fe;me+=1){const ue=Math.min((me+.5)*W,u-.5);for(let se=ie;se<=ne;se+=1){const ae=Math.min((se+.5)*W,n-.5);ve(K,R,N,X,ae,ue)<0||ve(N,X,$,ee,ae,ue)<0||ve($,ee,K,R,ae,ue)<0||Ie(Y,(me*Z+se)*4,w,0)}}}return kt(e,o,"trisTexture",Ae,H,j),kt(e,o,"binTexture",Z,Q,Y),{triangles:D,frame:F,binSize:W,bins:[Z,Q]}}const Ui={id:"lowpoly",name:"Low poly",category:"geometric",description:"Facets the picture into flat-shaded triangles that get smaller where the image has detail.",animated:!0,animates:e=>e.shimmer>0&&e.relief>0,params:[{key:"size",label:"Facet size",type:"number",min:12,max:120,step:1,default:48},{key:"detail",label:"Detalhe",type:"number",min:0,max:1,step:.01,default:.8},{key:"jitter",label:"Jitter",type:"number",min:0,max:1,step:.01,default:.85},{key:"snap",label:"Follow edges",type:"number",min:0,max:1,step:.01,default:.8},{key:"variation",label:"Variação",type:"number",min:0,max:100,step:1,default:0},{key:"relief",label:"Facet shading",type:"number",min:0,max:1,step:.01,default:.35},{key:"saturation",label:"Saturação",type:"number",min:0,max:2,step:.01,default:1.15},{key:"contrast",label:"Contraste",type:"number",min:.5,max:2,step:.01,default:1.12},{key:"edges",label:"Edges",type:"number",min:0,max:1,step:.01,default:.12},{key:"edgeColor",label:"Edge color",type:"color",default:"#000000"},{key:"shimmer",label:"Shimmer",type:"number",min:0,max:1,step:.01,default:0}],render(e,o,t,a){const l=o.mipmapped?o:e.mipmap(o),r=Math.max(4,t.size*.5*e.unit),i=Math.max(4,Math.round(e.width/r)),n=Math.max(4,Math.round(e.height/r)),u=[e.width/i,e.height/n],c=e.pass("lowpoly-detail",gi,{input:l,target:e.target(i,n,{float:!1,filter:"nearest"}),uniforms:{uCell:u,uImage:[e.width,e.height],uLod:Math.max(0,Math.log2(u[0]*.25))}}),s=e.gl;(!a.detail||a.detail.length!==i*n*4)&&(a.detail=new Uint8Array(i*n*4)),s.bindFramebuffer(s.FRAMEBUFFER,c.fbo),s.readPixels(0,0,i,n,s.RGBA,s.UNSIGNED_BYTE,a.detail),e.release(c);const p=[e.width,e.height,i,n,t.detail,t.jitter,t.snap,t.variation].join(":");let f=a.mesh&&a.meshKey===p&&a.previous&&a.previous.length===a.detail.length;if(f){const b=a.detail,y=a.previous;for(let S=0;S<b.length;S+=1)if(b[S]!==y[S]){f=!1;break}}f||(a.mesh=Li(e,a,t,a.detail,i,n,p),a.meshKey=p,a.previous=a.detail.slice());const m=a.mesh,d=2.3+e.time*t.shimmer*1.6,v=[Math.cos(d)*.62,Math.sin(d)*.62,.78],g=Math.hypot(...v),x={uTriRow:Ae,uBounds:m.frame,uColorRow:He},k=e.pass("lowpoly-colors",bi,{input:l,target:e.target(He,Math.max(1,Math.ceil(m.triangles/He)),{filter:"nearest"}),textures:{uTris:a.trisTexture.texture},uniforms:{...x,uImage:[e.width,e.height],uCount:m.triangles,uRelief:t.relief,uDepth:r*2.2,uLight:v.map(b=>b/g),uSaturation:t.saturation,uContrast:t.contrast}}),h=e.pass("lowpoly-draw",yi,{input:o,textures:{uTris:a.trisTexture.texture,uBins:a.binTexture.texture,uColors:k},uniforms:{...x,uBinGrid:m.bins,uBinSize:m.binSize,uEdges:t.edges,uEdgeWidth:Math.max(.35,.6*e.unit),uEdgeColor:C(t.edgeColor)}});return e.release(k),h},dispose(e,o){o.trisTexture&&e.deleteTexture(o.trisTexture.texture),o.binTexture&&e.deleteTexture(o.binTexture.texture),o.trisTexture=null,o.binTexture=null,o.mesh=null}},Ii=`
${re}
uniform vec2 uCellPx;
uniform vec2 uImage;
uniform float uLod;
uniform float uInvert;

void main() {
  vec2 origin = floor(gl_FragCoord.xy) * uCellPx;
  vec3 sum = vec3(0.0);
  for (int y = 0; y < 4; y++) {
    for (int x = 0; x < 4; x++) {
      vec2 p = origin + (vec2(float(x), float(y)) + 0.5) * 0.25 * uCellPx;
      sum += textureLod(uInput, min(p, uImage - 0.5) / uImage, uLod).rgb;
    }
  }
  vec3 color = sum / 16.0;
  float l = luma(color);
  l = clamp(mix(l, autoLevel(l), 0.55), 0.0, 1.0);
  l = uInvert > 0.5 ? 1.0 - l : l;
  outColor = vec4(color, l);
}`,_t=`
uniform sampler2D uCells;
uniform vec2 uGrid;
uniform float uAspect;
uniform float uHeight;
uniform float uBase;
uniform vec3 uRight;
uniform vec3 uUp;
uniform vec3 uDir;
uniform vec2 uCenter;
uniform float uScale;
uniform vec3 uBackground;
uniform float uShade;
uniform float uGap;
uniform float uPalette;
uniform vec3 uLow;
uniform vec3 uHigh;
uniform float uCellPx;

vec4 cellAt(vec2 c) {
  return texelFetch(uCells, ivec2(clamp(c, vec2(0.0), uGrid - 1.0)), 0);
}

vec3 albedo(vec4 cell) {
  if (uPalette > 0.5) return mix(uLow, uHigh, smoothstep(0.0, 1.0, cell.a));
  return cell.rgb;
}

vec3 wallShade(vec3 color, vec3 n, float lift, float along) {
  float side = dot(n, uRight) * 0.5 + 0.5;
  float light = mix(1.0 - 0.3 * uShade, 1.0 - 0.62 * uShade, side);
  float ao = mix(1.0 - 0.45 * uShade, 1.0, smoothstep(0.0, 0.35, lift));
  float edge = smoothstep(0.0, 1.2 / uCellPx, min(along, 1.0 - along));
  return color * light * ao * mix(1.0 - 0.35 * uShade, 1.0, edge);
}

vec3 topShade(vec3 color, vec2 f) {
  vec2 e = min(f, 1.0 - f);
  float edge = smoothstep(0.0, 1.4 / uCellPx, min(e.x, e.y));
  return color * mix(1.0 - 0.22 * uShade, 1.0, edge);
}

vec3 trace(vec2 screen) {
  vec3 o = screen.x * uRight + screen.y * uUp - uDir * 8.0;
  vec3 dirSign = vec3(uDir.x >= 0.0 ? 1.0 : -1.0, uDir.y >= 0.0 ? 1.0 : -1.0, uDir.z >= 0.0 ? 1.0 : -1.0);
  vec3 d = dirSign * max(abs(uDir), vec3(1e-6));
  float top = uBase + uHeight;
  vec3 lo = vec3(-0.5 * uAspect, 0.0, -0.5);
  vec3 hi = vec3(0.5 * uAspect, top, 0.5);
  vec3 t1 = (lo - o) / d;
  vec3 t2 = (hi - o) / d;
  vec3 tn = min(t1, t2);
  vec3 tf = max(t1, t2);
  float t0 = max(max(tn.x, tn.y), tn.z);
  float tEnd = min(min(tf.x, tf.y), tf.z);
  if (t0 >= tEnd) return uBackground;

  vec2 toGrid = vec2(uGrid.x / uAspect, uGrid.y);
  vec2 gd = d.xz * toGrid;
  vec2 gridOrigin = (o.xz + vec2(0.5 * uAspect, 0.5)) * toGrid;
  vec2 g = gridOrigin + gd * t0;
  vec2 cell = clamp(floor(g), vec2(0.0), uGrid - 1.0);
  vec2 stepDir = dirSign.xz;
  vec2 tDelta = abs(1.0 / gd);
  vec2 tMax = t0 + ((cell + max(stepDir, 0.0)) - g) / gd;

  vec3 n = tn.y >= max(tn.x, tn.z) ? vec3(0.0, 1.0, 0.0) : (tn.x > tn.z ? vec3(-stepDir.x, 0.0, 0.0) : vec3(0.0, 0.0, -stepDir.y));
  float t = t0;
  float previous = 0.0;
  float halfGap = uGap * 0.5;
  float tFloor = halfGap > 0.0 ? (uBase - o.y) / d.y : 1e9;

  if (halfGap > 0.0 && o.y + d.y * t0 <= uBase) {
    vec2 hit = g;
    float along = abs(n.x) > 0.5 ? fract(hit.y) : fract(hit.x);
    return wallShade(albedo(cellAt(cell)) * 0.4, n, 1.0, along);
  }

  for (int i = 0; i < 1200; i++) {
    vec4 data = cellAt(cell);
    float h = uBase + data.a * uHeight;
    float tExit = min(min(tMax.x, tMax.y), tEnd);
    vec3 color = albedo(data);

    vec2 b1 = (cell + halfGap - gridOrigin) / gd;
    vec2 b2 = (cell + 1.0 - halfGap - gridOrigin) / gd;
    vec2 bn = min(b1, b2);
    vec2 bf = max(b1, b2);
    float bIn = max(max(bn.x, bn.y), t);
    float bOut = min(min(bf.x, bf.y), tExit);

    float hitT = 1e9;
    float kind = 0.0;
    if (bIn < bOut) {
      float yIn = o.y + d.y * bIn;
      if (yIn <= h) {
        hitT = bIn;
        kind = 1.0;
      } else if (o.y + d.y * bOut <= h) {
        hitT = (h - o.y) / d.y;
        kind = 2.0;
      }
    }
    if (tFloor >= t && tFloor <= tExit && tFloor < hitT) {
      return color * 0.3 + uBackground * 0.15;
    }
    if (kind > 1.5) {
      return topShade(color, fract(gridOrigin + gd * hitT));
    }
    if (kind > 0.5) {
      vec3 wn = n;
      if (bIn > t + 1e-6) wn = bn.x > bn.y ? vec3(-stepDir.x, 0.0, 0.0) : vec3(0.0, 0.0, -stepDir.y);
      vec2 hit = gridOrigin + gd * hitT;
      if (wn.y > 0.5) return topShade(color, fract(hit));
      float along = abs(wn.x) > 0.5 ? fract(hit.y) : fract(hit.x);
      float floorY = halfGap > 0.0 && bIn > t + 1e-6 ? uBase : previous;
      float lift = (o.y + d.y * hitT - floorY) * uGrid.y;
      return wallShade(color, wn, lift, along);
    }

    previous = h;
    if (tExit >= tEnd) break;
    t = tExit;
    if (tMax.x < tMax.y) {
      cell.x += stepDir.x;
      tMax.x += tDelta.x;
      n = vec3(-stepDir.x, 0.0, 0.0);
    } else {
      cell.y += stepDir.y;
      tMax.y += tDelta.y;
      n = vec3(0.0, 0.0, -stepDir.y);
    }
    if (cell.x < 0.0 || cell.y < 0.0 || cell.x >= uGrid.x || cell.y >= uGrid.y) break;
  }
  return uBackground;
}

vec3 traceAt(vec2 frag) {
  return trace((frag - 0.5 * uResolution) / uScale + uCenter);
}
`,zi=`
${_t}
void main() {
  outColor = vec4(traceAt(gl_FragCoord.xy), 1.0);
}`,Ai=`
${_t}
uniform sampler2D uFirst;

void main() {
  ivec2 p = ivec2(gl_FragCoord.xy);
  ivec2 limit = ivec2(uResolution) - 1;
  vec3 c = texelFetch(uFirst, p, 0).rgb;
  float l = luma(c);
  float contrast = abs(luma(texelFetch(uFirst, min(p + ivec2(1, 0), limit), 0).rgb) - l);
  contrast = max(contrast, abs(luma(texelFetch(uFirst, max(p - ivec2(1, 0), ivec2(0)), 0).rgb) - l));
  contrast = max(contrast, abs(luma(texelFetch(uFirst, min(p + ivec2(0, 1), limit), 0).rgb) - l));
  contrast = max(contrast, abs(luma(texelFetch(uFirst, max(p - ivec2(0, 1), ivec2(0)), 0).rgb) - l));
  if (contrast < 0.025) {
    outColor = vec4(c, 1.0);
    return;
  }
  vec2 f = gl_FragCoord.xy;
  vec3 sum = c;
  sum += traceAt(f + vec2(0.125, 0.375));
  sum += traceAt(f + vec2(0.375, -0.125));
  sum += traceAt(f + vec2(-0.125, -0.375));
  sum += traceAt(f + vec2(-0.375, 0.125));
  outColor = vec4(sum * 0.2, 1.0);
}`,Ri={id:"extrude",name:"Iso extrude",category:"geometric",blend:"normal",description:"Extrudes the picture into isometric bars whose height follows brightness, like a city relief map.",animated:!0,animates:e=>e.turn!==0,params:[{key:"size",label:"Cell size",type:"number",min:3,max:40,step:.5,default:9},{key:"height",label:"Altura",type:"number",min:0,max:2,step:.01,default:1},{key:"rotation",label:"Rotação",type:"number",min:0,max:360,step:1,default:45},{key:"tilt",label:"View angle",type:"number",min:15,max:89,step:1,default:35},{key:"zoom",label:"Zoom",type:"number",min:.5,max:2.5,step:.01,default:1},{key:"invert",label:"Dark is tall",type:"boolean",default:!1},{key:"palette",label:"Cores",type:"select",default:"image",options:[{value:"image",label:"From image"},{value:"gradient",label:"Two tone"}]},{key:"low",label:"Low color",type:"color",default:"#10206a",when:e=>e.palette==="gradient"},{key:"high",label:"High color",type:"color",default:"#8ff4ff",when:e=>e.palette==="gradient"},{key:"shading",label:"Side shading",type:"number",min:0,max:1,step:.01,default:.6},{key:"gap",label:"Spacing",type:"number",min:0,max:.7,step:.01,default:0},{key:"background",label:"Fundo",type:"color",default:"#0d0f14"},{key:"turn",label:"Turn",type:"number",min:-1,max:1,step:.01,default:0}],render(e,o,t){const a=o.mipmapped?o:e.mipmap(o),l=e.width/e.height,r=Math.max(l,1),i=Math.max(t.size,1)/1e3*r,n=Math.max(2,Math.round(l/i)),u=Math.max(2,Math.round(1/i)),c=[e.width/n,e.height/u],s=J(e,o),p=e.pass("extrude-cells",Ii,{input:a,target:e.target(n,u,{filter:"nearest"}),textures:{uStats:s.target},uniforms:{uStatsTop:s.top,uCellPx:c,uImage:[e.width,e.height],uLod:Math.max(0,Math.log2(Math.max(c[0],c[1])/4)),uInvert:t.invert}}),f=(t.rotation+t.turn*e.time*24)*Math.PI/180,m=Math.min(Math.max(t.tilt,5),89.5)*Math.PI/180,d=[Math.sin(f),0,Math.cos(f)],v=[Math.cos(f),0,-Math.sin(f)],g=[Math.sin(m)*d[0],Math.cos(m),Math.sin(m)*d[2]],x=[Math.cos(m)*d[0],-Math.sin(m),Math.cos(m)*d[2]],k=t.height*.12,h=.014,b=Math.hypot(l/2,.5),y=[2*b,2*b*Math.sin(m)+(k+h)*Math.cos(m)],S=Math.min(e.width*.9/y[0],e.height*.9/y[1])*t.zoom,I={uGrid:[n,u],uAspect:l,uHeight:k,uBase:h,uRight:v,uUp:g,uDir:x,uCenter:[0,(k+h)*Math.cos(m)/2],uScale:S,uBackground:C(t.background),uShade:t.shading,uGap:t.gap,uPalette:t.palette==="gradient",uLow:C(t.low),uHigh:C(t.high),uCellPx:S/u},L=e.pass("extrude-trace",zi,{input:o,textures:{uCells:p},uniforms:I}),M=e.pass("extrude-refine",Ai,{input:o,textures:{uCells:p,uFirst:L},uniforms:I});return e.release(L),e.release(p),e.release(s.target),M}},Di=`
${re}
uniform sampler2D uField;
uniform float uView;
uniform float uCell;
uniform vec2 uDrift;
uniform vec2 uRelief;
uniform float uWidth;
uniform float uHalo;
uniform float uThreshold;
uniform float uPattern;
uniform float uColorMode;
uniform vec3 uColor;
uniform float uHorizon;
uniform float uDepth;

vec3 field(vec2 p) {
  return texture(uField, clamp(p / uResolution, 0.0, 1.0)).rgb;
}

float level(vec3 c) {
  float l = luma(c);
  l = mix(l, autoLevel(l), 0.7);
  float v = smoothstep(uThreshold, 1.0, l);
  return v * sqrt(v);
}

vec2 gridOf(vec2 q) {
  if (uView < 0.5) return q / uCell + uDrift;
  vec2 n = (q - 0.5 * uResolution) / uResolution.y;
  float z = 1.0 / max(uHorizon - n.y, 0.02);
  return vec2(n.x * z, z) * uDepth + uDrift;
}

void main() {
  vec2 p = gl_FragCoord.xy;
  vec2 q = p;
  for (int i = 0; i < 4; i++) q = p - uRelief * level(field(q));
  vec3 surface = field(q);
  float strength = level(surface);
  vec2 g = gridOf(q);
  vec2 fw = max(fwidth(g), vec2(1e-5));
  vec2 d = abs(fract(g + 0.5) - 0.5) / fw;
  float dense = smoothstep(0.1, 0.4, max(fw.x, fw.y));
  vec2 wire = 1.0 - smoothstep(vec2(uWidth - 0.5), vec2(uWidth + 0.5), d);
  vec2 wireHalo = exp(-d * d / (2.0 * uHalo * uHalo));
  float node = length(d);
  float r = uWidth * 1.8 + 0.4;
  float bead = 1.0 - smoothstep(r - 0.6, r + 0.6, node);
  float beadHalo = exp(-node * node / (2.0 * (uHalo + r) * (uHalo + r)));

  float lines = max(wire.x, wire.y);
  float halo = max(wireHalo.x, wireHalo.y);
  float nodes = 1.0;
  if (uPattern > 0.5 && uPattern < 1.5) {
    lines = wire.y;
    halo = wireHalo.y;
    nodes = 0.0;
  } else if (uPattern > 1.5 && uPattern < 2.5) {
    lines = wire.x;
    halo = wireHalo.x;
    nodes = 0.0;
  } else if (uPattern > 2.5) {
    lines = 0.0;
    halo = 0.0;
  }

  float full = smoothstep(0.1, 0.32, strength);
  float spark = step(hash12(floor(g + 0.5) + 17.0), strength * 2.6) * (1.0 - full);
  float small = 1.0 - smoothstep(r * 0.55 - 0.6, r * 0.55 + 0.6, node);
  float core = lines * full * 0.6 + bead * nodes * full * 1.7 + small * spark * 0.9;
  float glow = (halo * full * 0.6 + beadHalo * nodes * full) * 0.35;
  float average = clamp(2.0 * uWidth * max(fw.x, fw.y), 0.0, 1.0) * full;
  core = mix(core, average, dense);
  glow = mix(glow, average, dense);
  float energy = max(strength, spark * 0.35);

  vec3 tint = uColor;
  if (uColorMode > 0.5) {
    float peak = max(max(surface.r, surface.g), max(surface.b, 0.04));
    tint = mix(surface / peak, vec3(1.0), 0.12);
  }
  float fade = uView > 0.5 ? smoothstep(uHorizon - 0.02, uHorizon - 0.5, (q.y - 0.5 * uResolution.y) / uResolution.y) : 1.0;
  vec3 light = toLinear(tint) * (core + glow) * energy * 1.5 + vec3(core * energy * energy * 0.6);
  outColor = vec4(light * fade, 1.0);
}`,Ei=`
uniform sampler2D uLines;
uniform sampler2D uNear;
uniform sampler2D uFar;
uniform float uGlow;
uniform vec3 uBackground;
uniform float uBackdrop;

void main() {
  vec3 lines = texture(uLines, vUv).rgb;
  vec3 near = texture(uNear, vUv).rgb;
  vec3 far = texture(uFar, vUv).rgb;
  vec3 image = texture(uInput, vUv).rgb;
  vec3 base = mix(uBackground, image * 0.55 + uBackground * 0.45, uBackdrop);
  vec3 light = lines + (near * 0.85 + far * 0.45) * uGlow;
  vec3 color = 1.0 - (1.0 - toLinear(base)) * exp(-light);
  outColor = vec4(toGamma(color), 1.0);
}`,Pi={grid:0,rows:1,columns:2,dots:3},qi={id:"neongrid",name:"Neon grid",category:"geometric",description:"A glowing neon wireframe grid that lights up and bends with the brightness of the image.",animated:!0,animates:e=>e.speed>0,params:[{key:"view",label:"View",type:"select",default:"flat",options:[{value:"flat",label:"Flat"},{value:"perspective",label:"Perspectiva"}]},{key:"pattern",label:"Pattern",type:"select",default:"grid",options:[{value:"grid",label:"Grid"},{value:"rows",label:"Rows"},{value:"columns",label:"Columns"},{value:"dots",label:"Dots"}]},{key:"density",label:"Densidade",type:"number",min:12,max:200,step:1,default:60},{key:"relief",label:"Relief",type:"number",min:0,max:1,step:.01,default:.35},{key:"width",label:"Line width",type:"number",min:.02,max:.4,step:.01,default:.12},{key:"threshold",label:"Threshold",type:"number",min:0,max:.9,step:.01,default:.3},{key:"colorMode",label:"Line color",type:"select",default:"neon",options:[{value:"neon",label:"Neon"},{value:"image",label:"From image"}]},{key:"color",label:"Neon color",type:"color",default:"#2fe4f2",when:e=>e.colorMode==="neon"},{key:"glow",label:"Glow",type:"number",min:0,max:2,step:.01,default:.9},{key:"background",label:"Fundo",type:"color",default:"#030506"},{key:"backdrop",label:"Image behind",type:"number",min:0,max:1,step:.01,default:0},{key:"speed",label:"Movimento",type:"number",min:0,max:1,step:.01,default:.2}],render(e,o,t){const a=t.view==="perspective",l=Math.max(2,1e3/Math.max(t.density,1)*e.unit),r=E(e,o,Math.max(l*.45,1)),i=J(e,o),n=e.time*t.speed,u=e.pass("neongrid-lines",Di,{input:o,textures:{uField:r,uStats:i.target},uniforms:{uStatsTop:i.top,uView:a?1:0,uCell:l,uDrift:a?[0,-n*1.5]:[n*.35,n*.6],uRelief:[t.relief*.25*l*2.2,t.relief*l*2.2],uWidth:Math.max(.45,t.width*l*.5),uHalo:Math.max(.8,l*.11),uThreshold:t.threshold,uPattern:Pi[t.pattern]??0,uColorMode:t.colorMode==="image"?1:0,uColor:C(t.color),uHorizon:.85,uDepth:t.density/1e3*(e.height/Math.max(e.unit,.001))*.85}});e.release(r),e.release(i.target);const c=E(e,u,5*e.unit),s=E(e,u,22*e.unit),p=e.pass("neongrid-composite",Ei,{input:o,textures:{uLines:u,uNear:c,uFar:s},uniforms:{uGlow:t.glow,uBackground:C(t.background),uBackdrop:t.backdrop}});return e.release(u),e.release(c),e.release(s),p}},Fi=`
uniform vec2 uWork;
uniform float uUnitPx;
uniform float uFreq;
uniform float uFollow;
uniform float uImageScale;
uniform float uEvolve;
uniform float uSeed;

vec2 gradDir(vec2 cell, float t) {
  vec2 h = hash22(cell + uSeed * 31.7);
  float a = h.x * TAU + t * (h.y > 0.5 ? 1.0 : -1.0) * (0.6 + h.y);
  return vec2(cos(a), sin(a));
}

vec2 gnoise(vec2 p, float t) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  vec2 du = 30.0 * f * f * (f * (f - 2.0) + 1.0);
  vec2 ga = gradDir(i, t);
  vec2 gb = gradDir(i + vec2(1.0, 0.0), t);
  vec2 gc = gradDir(i + vec2(0.0, 1.0), t);
  vec2 gd = gradDir(i + vec2(1.0, 1.0), t);
  float va = dot(ga, f);
  float vb = dot(gb, f - vec2(1.0, 0.0));
  float vc = dot(gc, f - vec2(0.0, 1.0));
  float vd = dot(gd, f - vec2(1.0, 1.0));
  vec2 d = ga + u.x * (gb - ga) + u.y * (gc - ga) + u.x * u.y * (ga - gb - gc + gd);
  return d + du * (u.yx * (va - vb - vc + vd) + vec2(vb, vc) - va);
}

void main() {
  vec2 pu = vUv * uWork / uUnitPx;
  vec2 g = gnoise(pu * uFreq + 3.1, uEvolve) + gnoise(pu * uFreq * 2.3 + 11.7, uEvolve * 1.6) * 0.3;
  vec2 e = 1.0 / vec2(textureSize(uInput, 0));
  float lx = luma(texture(uInput, vUv + vec2(e.x, 0.0)).rgb) - luma(texture(uInput, vUv - vec2(e.x, 0.0)).rgb);
  float ly = luma(texture(uInput, vUv + vec2(0.0, e.y)).rgb) - luma(texture(uInput, vUv - vec2(0.0, e.y)).rgb);
  vec2 slope = vec2(lx, ly) / (2.0 * e * uWork / uUnitPx);
  vec2 v = vec2(g.y, -g.x) + vec2(slope.y, -slope.x) * uImageScale * uFollow;
  float m = length(v);
  outColor = vec4(v / max(m, 1e-6), m, 1.0);
}`,$t=`
uniform vec2 uWork;
uniform float uSegments;
uniform float uPerRow;
uniform vec2 uGrid;
uniform vec2 uOrigin;
uniform float uCell;
uniform float uStep;
uniform float uSeed;

vec2 seedHash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}

vec2 seedOf(float index) {
  vec2 cell = vec2(mod(index, uGrid.x), floor(index / uGrid.x));
  return uOrigin + (cell + 0.1 + 0.8 * seedHash(cell + uSeed * 7.13)) * uCell;
}
`,Bi=`
uniform sampler2D uFlow;
${$t}
void main() {
  vec2 texel = floor(gl_FragCoord.xy);
  float k = mod(texel.x, uSegments);
  float index = texel.y * uPerRow + floor(texel.x / uSegments);
  vec2 start = seedOf(index);
  vec2 x = start;
  vec2 scale = 1.0 / uWork;
  for (int i = 0; i < 96; i++) {
    if (float(i) >= k) break;
    vec2 dir = texture(uFlow, x * scale).xy;
    dir = texture(uFlow, (x + dir * uStep * 0.5) * scale).xy;
    x += dir * uStep;
  }
  vec2 offset = x - start;
  vec2 coarse = floor(offset / 16.0 + 0.5) * 16.0;
  outColor = vec4(coarse, offset - coarse);
}`,Gi=`#version 300 es
precision highp float;
precision highp sampler2D;
uniform sampler2D uPaths;
uniform sampler2D uTone;
uniform float uVisible;
uniform float uHalfWidth;
uniform float uTrail;
uniform float uTravel;
uniform float uClock;
uniform float uContrast;
uniform float uLight;
${$t}
out float vAcross;
out float vAlong;
out float vHalf;
flat out float vHead;
flat out float vLife;
flat out float vBright;

vec2 pointAt(float index, float k) {
  float row = floor(index / uPerRow);
  float column = mod(index, uPerRow) * uSegments + clamp(k, 0.0, uSegments - 1.0);
  vec4 t = texelFetch(uPaths, ivec2(int(column), int(row)), 0);
  return t.xy + t.zw;
}

void main() {
  float index = float(gl_InstanceID);
  float side = float(gl_VertexID % 2) * 2.0 - 1.0;
  vec2 cell = vec2(mod(index, uGrid.x), floor(index / uGrid.x));
  vec2 h = seedHash(cell + 71.3 + uSeed * 3.31);
  float age = fract(h.x + uClock);
  float head = age * uTravel;
  float first = clamp(floor((head - uTrail) / uStep), 0.0, max(uSegments - uVisible, 0.0));
  float k = min(first + float(gl_VertexID / 2), uSegments - 1.0);
  vec2 seed = seedOf(index);
  vec2 p = seed + pointAt(index, k);
  vec2 tangent = pointAt(index, k + 1.0) - pointAt(index, k - 1.0);
  tangent = length(tangent) > 1e-4 ? normalize(tangent) : vec2(1.0, 0.0);
  float l = dot(texture(uTone, p / uWork).rgb, vec3(0.2126, 0.7152, 0.0722));
  l = clamp((l - 0.5) * uContrast + 0.5, 0.0, 1.0);
  l = mix(l, 1.0 - l, uLight);
  vHalf = uHalfWidth * (0.6 + 0.7 * l);
  float extent = vHalf + 1.0;
  vec2 position = p + vec2(-tangent.y, tangent.x) * side * extent;
  gl_Position = vec4(position / uWork * 2.0 - 1.0, 0.0, 1.0);
  vAcross = side * extent;
  vAlong = k * uStep;
  vHead = head;
  vLife = smoothstep(0.0, 0.04, age) * (1.0 - smoothstep(0.72, 1.0, age));
  vBright = 0.55 + 0.45 * h.y;
}`,Ni=`#version 300 es
precision highp float;
uniform float uTrail;
in float vAcross;
in float vAlong;
in float vHalf;
flat in float vHead;
flat in float vLife;
flat in float vBright;
out vec4 outColor;

void main() {
  float cover = clamp(vHalf + 0.5 - abs(vAcross), 0.0, 1.0) * min(vHalf * 2.0, 1.0);
  float d = vAlong;
  float along = smoothstep(vHead - uTrail, vHead - uTrail * 0.65, d);
  along *= smoothstep(vHead + 0.5, vHead - uTrail * 0.08, d);
  along *= smoothstep(-0.5, uTrail * 0.06, d);
  float a = cover * along * vLife;
  outColor = vec4(a, a * vBright, 0.0, a);
}`,Oi=`
uniform sampler2D uStrokes;
uniform vec3 uGround;
uniform vec3 uInk;
uniform float uMode;
uniform float uLight;
uniform float uContrast;

void main() {
  vec4 stroke = texture(uStrokes, vUv);
  float alpha = stroke.r;
  float bright = alpha > 0.001 ? stroke.g / alpha : 1.0;
  vec3 image = texture(uInput, vUv).rgb;
  float l = clamp((luma(image) - 0.5) * uContrast + 0.5, 0.0, 1.0);
  float tone = mix(l, 1.0 - l, uLight);
  vec3 color;
  if (uMode < 0.5) {
    vec3 hsv = rgb2hsv(image);
    float value = mix(0.17 + 0.83 * pow(tone, 0.85), 0.84 - 0.72 * pow(tone, 0.85), uLight);
    value *= mix(1.0, bright, 0.5);
    float saturation = min(hsv.y * mix(0.45, 1.5, smoothstep(0.04, 0.45, tone)), 1.0);
    color = mix(uGround, hsv2rgb(vec3(hsv.x, saturation, value)), alpha);
  } else {
    color = mix(uGround, uInk, alpha * (0.22 + 0.78 * tone) * mix(1.0, bright, 0.5));
  }
  outColor = vec4(color, 1.0);
}`,wt={dark:[.043,.039,.051],light:[.949,.933,.902]},Hi=2048;function Wi(e,o){if(o.program)return o.program;const t=(u,c)=>{const s=e.createShader(u);if(e.shaderSource(s,c),e.compileShader(s),!e.getShaderParameter(s,e.COMPILE_STATUS)){const p=e.getShaderInfoLog(s);throw e.deleteShader(s),new Error(`Shader "flowfield-strokes" failed to compile.
${p}`)}return s},a=t(e.VERTEX_SHADER,Gi),l=t(e.FRAGMENT_SHADER,Ni),r=e.createProgram();if(e.attachShader(r,a),e.attachShader(r,l),e.linkProgram(r),e.deleteShader(a),e.deleteShader(l),!e.getProgramParameter(r,e.LINK_STATUS))throw new Error(`Program "flowfield-strokes" failed to link: ${e.getProgramInfoLog(r)}`);const n=Object.fromEntries(["uPaths","uTone","uContrast","uLight","uVisible","uHalfWidth","uTrail","uTravel","uClock","uWork","uSegments","uPerRow","uGrid","uOrigin","uCell","uStep","uSeed"].map(u=>[u,e.getUniformLocation(r,u)]));return o.program={program:r,uniforms:n,vao:e.createVertexArray()},o.program}const ji={id:"flowfield",name:"Flow lines",category:"geometric",description:"The picture traced by thousands of fine lines streaming along a smooth, swirling current.",animated:!0,preview:{zoom:2},animates:e=>e.drift>0,params:[{key:"density",label:"Line density",type:"number",min:0,max:1,step:.01,default:.8},{key:"length",label:"Line length",type:"number",min:10,max:200,step:1,default:70},{key:"width",label:"Line width",type:"number",min:.4,max:6,step:.05,default:2.2},{key:"curl",label:"Curl",type:"number",min:0,max:1,step:.01,default:.2},{key:"follow",label:"Follow image",type:"number",min:0,max:1,step:.01,default:.6},{key:"contrast",label:"Contraste",type:"number",min:.5,max:2.5,step:.01,default:1.4},{key:"color",label:"Line color",type:"select",default:"image",options:[{value:"image",label:"From image"},{value:"ink",label:"Single ink"}]},{key:"ink",label:"Ink",type:"color",default:"#e4572e",when:e=>e.color==="ink"},{key:"ground",label:"Fundo",type:"select",default:"dark",options:[{value:"dark",label:"Escuro"},{value:"light",label:"Claro"}]},{key:"drift",label:"Drift",type:"number",min:0,max:2,step:.01,default:.5},{key:"variation",label:"Variação",type:"number",min:0,max:100,step:1,default:0}],render(e,o,t,a){const l=e.gl,r=e.unit,i=Math.max(8,Math.round(e.width/4)),n=Math.max(8,Math.round(e.height/4)),u=E(e,o,7*r),c=Math.pow(t.curl,1.4),s=e.pass("flowfield-flow",Fi,{input:u,target:e.target(i,n),uniforms:{uWork:[e.width,e.height],uUnitPx:r,uFreq:(1.2+c*8)/1e3,uFollow:t.follow,uImageScale:150,uEvolve:e.time*t.drift*.1,uSeed:t.variation}}),p=(16-13*t.density)*r,f=Math.max(3,t.length*r),m=f*1.6,d=Math.max(m/72,2.5*r,1),v=Math.max(3,Math.ceil(m/d)+1),g=Math.min(v,Math.ceil(f/d)+3),x=Math.max(2,Math.sqrt(p*f*.75)),k=m,h=[Math.ceil((e.width+k*2)/x),Math.ceil((e.height+k*2)/x)],b=h[0]*h[1],y=Math.max(1,Math.floor(Hi/v)),S=Math.ceil(b/y),I={uWork:[e.width,e.height],uSegments:v,uPerRow:y,uGrid:h,uOrigin:[-k,-k],uCell:x,uStep:d,uSeed:t.variation},L=e.pass("flowfield-paths",Bi,{target:e.target(y*v,S,{filter:"nearest"}),textures:{uFlow:s},uniforms:I});e.release(s);const M=e.target(e.width,e.height,{float:!1}),A=Wi(l,a),z=A.uniforms;l.bindFramebuffer(l.FRAMEBUFFER,M.fbo),l.viewport(0,0,M.width,M.height),l.clearColor(0,0,0,0),l.clear(l.COLOR_BUFFER_BIT),l.useProgram(A.program),l.bindVertexArray(A.vao),l.activeTexture(l.TEXTURE0),l.bindTexture(l.TEXTURE_2D,L.texture),l.uniform1i(z.uPaths,0),l.activeTexture(l.TEXTURE1),l.bindTexture(l.TEXTURE_2D,u.texture),l.uniform1i(z.uTone,1),l.uniform1f(z.uContrast,t.contrast),l.uniform1f(z.uLight,t.ground==="light"?1:0),l.uniform1f(z.uVisible,g),l.uniform1f(z.uHalfWidth,Math.max(.15,t.width*r*.5)),l.uniform1f(z.uTrail,f),l.uniform1f(z.uTravel,m),l.uniform1f(z.uClock,e.time*t.drift*30*r/m%1+1),l.uniform2f(z.uWork,e.width,e.height),l.uniform1f(z.uSegments,v),l.uniform1f(z.uPerRow,y),l.uniform2f(z.uGrid,h[0],h[1]),l.uniform2f(z.uOrigin,-k,-k),l.uniform1f(z.uCell,x),l.uniform1f(z.uStep,d),l.uniform1f(z.uSeed,t.variation),l.enable(l.BLEND),l.blendEquation(l.MAX),l.drawArraysInstanced(l.TRIANGLE_STRIP,0,g*2,b),l.disable(l.BLEND),l.blendEquation(l.FUNC_ADD),l.bindVertexArray(e.engine.vao),l.activeTexture(l.TEXTURE0),e.release(L),e.release(u);const P=t.ground==="light",D=e.pass("flowfield-composite",Oi,{input:o,textures:{uStrokes:M},uniforms:{uGround:wt[t.ground]||wt.dark,uInk:C(t.ink),uMode:t.color==="ink"?1:0,uLight:P?1:0,uContrast:t.contrast}});return e.release(M),D},dispose(e,o){o.program&&(e.deleteProgram(o.program.program),e.deleteVertexArray(o.program.vao)),o.program=null}},St="RCUQ0123456789",_i=600,$i=`
uniform vec2 uCellPx;
uniform vec2 uImage;
uniform float uLod;
uniform float uSeed;

float tone(vec2 p) {
  return luma(textureLod(uInput, clamp(p / uImage, 0.0, 1.0), uLod).rgb);
}

float salience(vec2 p, float reach) {
  float l = tone(p);
  float gx = tone(p + vec2(reach, 0.0)) - tone(p - vec2(reach, 0.0));
  float gy = tone(p + vec2(0.0, reach)) - tone(p - vec2(0.0, reach));
  return length(vec2(gx, gy)) * (0.35 + l);
}

void main() {
  vec2 cell = floor(gl_FragCoord.xy);
  vec2 origin = cell * uCellPx;
  float reach = exp2(uLod);
  vec2 sum = vec2(0.0);
  float total = 0.0;
  float best = 0.0;
  for (int y = 0; y < 5; y++) {
    for (int x = 0; x < 5; x++) {
      vec2 jitter = (hash22(cell * 5.0 + vec2(float(x), float(y)) + uSeed) - 0.5) * 0.14;
      vec2 local = clamp((vec2(float(x), float(y)) + 0.5) / 5.0 + jitter, 0.08, 0.92);
      float s = salience(origin + local * uCellPx, reach);
      float s2 = s * s;
      float w = s2 * s2 * s2 + 1e-24;
      sum += local * w;
      total += w;
      best = max(best, s);
    }
  }
  vec2 local = sum / total;
  outColor = vec4(local, best, tone(origin + local * uCellPx));
}`,Vi=`
uniform sampler2D uNodes;
uniform sampler2D uAtlas;
uniform vec2 uGrid;
uniform vec2 uCellPx;
uniform float uTop;
uniform float uThreshold;
uniform float uLinks;
uniform float uStyle;
uniform float uRadius;
uniform float uLine;
uniform float uLabels;
uniform float uGridAmount;
uniform float uInkMode;
uniform vec3 uInk;
uniform float uBackground;
uniform float uPulse;
uniform float uSignals;
uniform float uSeed;
uniform vec2 uAtlasGrid;
uniform float uGlyphs[14];
uniform float uTextHeight;
uniform float uAspect;

vec3 backdrop(vec3 image) {
  float l = luma(image);
  if (uBackground < 0.5) return image;
  if (uBackground < 1.5) return mix(vec3(l), image, 0.75) * 0.4;
  if (uBackground < 2.5) return mix(vec3(0.03, 0.11, 0.24), vec3(0.15, 0.35, 0.6), pow(l, 1.25));
  return vec3(0.95, 0.935, 0.9) * (0.86 + 0.14 * l);
}

vec3 inkFor(vec3 back) {
  if (uInkMode > 0.5) return uInk;
  if (uBackground > 2.5) return vec3(0.1, 0.13, 0.18);
  if (uBackground > 1.5) return vec3(0.9, 0.95, 1.0);
  float l = luma(back);
  float peak = max(max(back.r, back.g), max(back.b, 0.05));
  vec3 light = mix(back / peak, vec3(1.0), 0.72);
  vec3 dark = back * 0.16;
  return mix(light, dark, smoothstep(0.52, 0.7, l));
}

float segment(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
  return length(pa - ba * h);
}

vec2 along(vec2 a, vec2 bend, vec2 b, float t) {
  float l1 = length(bend - a);
  float l2 = length(b - bend);
  float s = t * (l1 + l2);
  return s < l1 ? mix(a, bend, s / max(l1, 1e-4)) : mix(bend, b, (s - l1) / max(l2, 1e-4));
}

vec2 corner(vec2 a, vec2 b) {
  vec2 d = b - a;
  if (abs(d.x) >= abs(d.y)) return vec2(b.x - sign(d.x) * abs(d.y), a.y);
  return vec2(a.x, b.y - sign(d.y) * abs(d.x));
}

float stroke(float d, float width) {
  return 1.0 - smoothstep(width - 0.5, width + 0.5, d);
}

float glyph(vec2 p, vec2 origin, float index) {
  float h = uTextHeight;
  float w = h * uAspect;
  vec2 local = (p - origin) / vec2(w, h);
  if (local.x < 0.0 || local.y < 0.0 || local.x > 1.0 || local.y > 1.0) return 0.0;
  float column = mod(index, uAtlasGrid.x);
  float row = floor(index / uAtlasGrid.x);
  vec2 uv = vec2((column + local.x) / uAtlasGrid.x, 1.0 - (row + 1.0 - local.y) / uAtlasGrid.y);
  vec2 gx = vec2(1.0 / (w * uAtlasGrid.x), 0.0);
  vec2 gy = vec2(0.0, 1.0 / (h * uAtlasGrid.y));
  return textureGrad(uAtlas, uv, gx, gy).a;
}

float label(vec2 p, vec2 origin, float id) {
  float w = uTextHeight * uAspect * 0.86;
  float letter = floor(hash11(id * 91.7) * 4.0);
  float number = 1.0 + floor(hash11(id * 37.3) * 98.0);
  float tens = floor(number / 10.0);
  float ones = number - tens * 10.0;
  float a = glyph(p, origin, uGlyphs[int(letter)]);
  if (tens > 0.0) {
    a = max(a, glyph(p, origin + vec2(w, 0.0), uGlyphs[4 + int(tens)]));
    a = max(a, glyph(p, origin + vec2(2.0 * w, 0.0), uGlyphs[4 + int(ones)]));
  } else {
    a = max(a, glyph(p, origin + vec2(w, 0.0), uGlyphs[4 + int(ones)]));
  }
  return a;
}

vec3 nodeAt(vec2 c, float mean) {
  if (c.x < 0.0 || c.y < 0.0 || c.x >= uGrid.x || c.y >= uGrid.y) return vec3(-1e5, -1e5, 0.0);
  vec4 n = texelFetch(uNodes, ivec2(c), 0);
  return vec3((c + n.xy) * uCellPx, smoothstep(uThreshold, uThreshold + 0.25, n.z / mean));
}

bool labeled(vec2 c, float mean) {
  return hash12(c * 0.71 + uSeed * 3.3) < 0.2 && nodeAt(c, mean).z >= 0.5;
}

void main() {
  vec2 p = gl_FragCoord.xy;
  vec3 image = texture(uInput, vUv).rgb;
  vec3 back = backdrop(image);
  vec3 ink = inkFor(backdrop(textureLod(uInput, vUv, 5.0).rgb));
  float mean = max(textureLod(uNodes, vec2(0.5), uTop).b, 1e-4);
  vec2 cell = floor(p / uCellPx);

  float lineAlpha = 0.0;
  float pulse = 0.0;
  float spark = 0.0;
  vec2 reach = vec2(uRadius * 5.0 + uLine);
  if (uStyle < 1.5) {
    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        vec2 ca = cell + vec2(float(i), float(j));
        vec3 na = nodeAt(ca, mean);
        if (na.z <= 0.0) continue;
        for (int o = 0; o < 4; o++) {
          vec2 off = o == 0 ? vec2(1.0, 0.0) : (o == 1 ? vec2(0.0, 1.0) : (o == 2 ? vec2(1.0) : vec2(-1.0, 1.0)));
          if (o == 2 && hash12(ca + uSeed * 2.1) >= 0.5) continue;
          if (o == 3 && hash12(ca - vec2(1.0, 0.0) + uSeed * 2.1) < 0.5) continue;
          float pick = hash12(ca * 3.17 + float(o) * 19.31 + uSeed);
          if (pick > uLinks) continue;
          vec3 nb = nodeAt(ca + off, mean);
          if (nb.z <= 0.0) continue;
          vec2 pa = na.xy;
          vec2 pb = nb.xy;
          if (any(lessThan(p, min(pa, pb) - reach)) || any(greaterThan(p, max(pa, pb) + reach))) continue;
          float strength = min(na.z, nb.z);
          float d;
          vec2 bend = pa;
          if (uStyle > 0.5) {
            bend = corner(pa, pb);
            d = min(segment(p, pa, bend), segment(p, bend, pb));
          } else {
            d = segment(p, pa, pb);
          }
          lineAlpha = max(lineAlpha, stroke(d, uLine) * strength);
          if (uSignals > 0.5 && d < uRadius * 5.0 && hash11(pick * 3.9) < 0.7) {
            float rate = 0.35 + hash11(pick * 71.0) * 0.65;
            float t = fract(uPulse * rate + pick * 13.0);
            float span = length(bend - pa) + length(pb - bend);
            float tail = uRadius * 3.0 / max(span, 1.0);
            float forward = hash11(pick * 5.3) < 0.5 ? 1.0 : -1.0;
            float t0 = forward > 0.0 ? t : 1.0 - t;
            float t1 = clamp(t0 - forward * tail, 0.0, 1.0);
            vec2 head = along(pa, bend, pb, t0);
            vec2 back = along(pa, bend, pb, t1);
            float dp = segment(p, back, head);
            float visible = smoothstep(0.0, 0.1, t) * smoothstep(1.0, 0.9, t) * strength;
            pulse = max(pulse, stroke(dp, uLine * 2.0) * visible);
            spark = max(spark, exp(-dp * dp / (2.0 * uRadius * uRadius * 2.5)) * visible);
          }
        }
      }
    }
  }

  float nodeAlpha = 0.0;
  float halo = 0.0;
  float marks = 0.0;
  float text = 0.0;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 c = cell + vec2(float(i), float(j));
      vec3 node = nodeAt(c, mean);
      if (node.z <= 0.0) continue;
      float id = hash12(c * 0.71 + uSeed * 3.3);
      vec2 q = p - node.xy;
      float r = length(q);
      nodeAlpha = max(nodeAlpha, (1.0 - smoothstep(uRadius - 0.6, uRadius + 0.6, r)) * node.z);
      halo = max(halo, exp(-r * r / (2.0 * uRadius * uRadius * 9.0)) * node.z);
      if (uLabels < 0.5) continue;
      if (id < 0.2) {
        marks = max(marks, stroke(abs(r - uRadius * 2.8), uLine) * node.z);
        bool crowded = labeled(c + vec2(1.0, 0.0), mean) || labeled(c + vec2(1.0, 1.0), mean);
        crowded = crowded || labeled(c + vec2(0.0, 1.0), mean) || labeled(c + vec2(1.0, -1.0), mean);
        if (i <= 0 && j <= 0 && node.z >= 0.5 && !crowded) {
          vec2 start = node.xy + vec2(uRadius * 2.0);
          float rise = min(uCellPx.x, uCellPx.y) * 0.24;
          vec2 elbow = start + vec2(rise);
          float width = uTextHeight * uAspect * 0.86 * 3.2;
          float leader = min(segment(p, start, elbow), segment(p, elbow, elbow + vec2(width, 0.0)));
          marks = max(marks, stroke(leader, uLine * 0.85) * node.z);
          text = max(text, label(p, elbow + vec2(uTextHeight * 0.1, uTextHeight * -0.02), id) * node.z);
        }
      } else if (id < 0.34) {
        vec2 box = abs(q) - vec2(uRadius * 2.4);
        float frame = abs(max(box.x, box.y));
        marks = max(marks, stroke(frame, uLine) * node.z);
      } else if (id < 0.46) {
        float arm = max(abs(q.x), abs(q.y));
        float bar = min(abs(q.x), abs(q.y));
        float plus = stroke(bar, uLine) * step(uRadius * 1.8, arm) * step(arm, uRadius * 3.6);
        marks = max(marks, plus * node.z);
      }
    }
  }

  vec2 g = abs(fract(p / uCellPx + 0.5) - 0.5) * uCellPx;
  float gridLine = stroke(min(g.x, g.y), uLine * 0.6);
  vec2 major = abs(fract(p / (uCellPx * 4.0) + 0.5) - 0.5) * uCellPx * 4.0;
  float majorLine = stroke(min(major.x, major.y), uLine * 0.6);
  float gridAlpha = uGridAmount * (gridLine * 0.22 + majorLine * 0.28);

  vec3 color = back;
  color = mix(color, ink, clamp(gridAlpha, 0.0, 1.0));
  float lit = smoothstep(0.35, 0.65, luma(ink));
  color = mix(color, ink, halo * 0.26 * lit);
  color = mix(color, ink, lineAlpha * 0.78);
  color = mix(color, ink, marks * 0.9);
  color = mix(color, ink, nodeAlpha);
  color = mix(color, ink, clamp(text, 0.0, 1.0));
  vec3 hot = mix(ink, vec3(1.0), 0.6 * lit);
  color = mix(color, hot, clamp(spark * 0.45 * lit, 0.0, 1.0));
  color = mix(color, hot, clamp(pulse, 0.0, 1.0));
  outColor = vec4(color, 1.0);
}`,Xi={straight:0,circuit:1,none:2},Yi={photo:0,dim:1,blueprint:2,paper:3};function Ki(e,o){return(!o.atlas||!o.atlas.fontReady&&o.fontLoaded)&&(o.atlas&&e.gl.deleteTexture(o.atlas.texture),o.atlas=Ve(e.engine,St,_i),o.glyphs=[...St].map(t=>o.atlas.chars.indexOf(t)),!o.atlas.fontReady&&!o.fontPending&&(o.fontPending=!0,$e().then(()=>{o.fontLoaded=!0}))),o.atlas}const Zi={id:"schematic",name:"Schematic",category:"geometric",description:"Draws a technical schematic over the subject: nodes on salient points, connectors and small callouts.",animated:!0,animates:e=>e.speed>0&&e.style!=="none",params:[{key:"density",label:"Node density",type:"number",min:8,max:60,step:1,default:26},{key:"threshold",label:"Selectivity",type:"number",min:0,max:2.5,step:.01,default:.9},{key:"style",label:"Connectors",type:"select",default:"straight",options:[{value:"straight",label:"Straight"},{value:"circuit",label:"Circuit"},{value:"none",label:"None"}]},{key:"links",label:"Connections",type:"number",min:0,max:1,step:.01,default:.7},{key:"size",label:"Node size",type:"number",min:.5,max:4,step:.05,default:1.4},{key:"labels",label:"Callouts",type:"boolean",default:!0},{key:"grid",label:"Grid",type:"number",min:0,max:1,step:.01,default:.25},{key:"background",label:"Fundo",type:"select",default:"photo",options:[{value:"photo",label:"Photo"},{value:"dim",label:"Dimmed photo"},{value:"blueprint",label:"Blueprint"},{value:"paper",label:"Paper"}]},{key:"inkMode",label:"Ink",type:"select",default:"auto",options:[{value:"auto",label:"Automatic"},{value:"custom",label:"Personalizado"}]},{key:"ink",label:"Ink color",type:"color",default:"#ffffff",when:e=>e.inkMode==="custom"},{key:"variation",label:"Variação",type:"number",min:0,max:100,step:1,default:0},{key:"speed",label:"Signals",type:"number",min:0,max:1,step:.01,default:.35}],render(e,o,t,a){const l=o.mipmapped?o:e.mipmap(o),i=Math.max(e.width,e.height)/Math.max(t.density,1),n=Math.max(2,Math.round(e.width/i)),u=Math.max(2,Math.round(e.height/i)),c=[e.width/n,e.height/u],s=Math.round(t.variation)%997*1.618,p=e.pass("schematic-nodes",$i,{input:l,target:e.target(n,u,{filter:"nearest"}),uniforms:{uCellPx:c,uImage:[e.width,e.height],uLod:Math.max(0,Math.log2(Math.min(c[0],c[1])/12)),uSeed:s}});e.mipmap(p);const f=Ki(e,a),m=e.pass("schematic-draw",Vi,{input:l,textures:{uNodes:p,uAtlas:f.texture},uniforms:{uGrid:[n,u],uCellPx:c,uTop:Math.ceil(Math.log2(Math.max(n,u))),uThreshold:t.threshold,uLinks:t.links,uStyle:Xi[t.style]??0,uRadius:Math.max(.8,t.size*1.6*e.unit),uLine:Math.max(.4,.55*e.unit),uLabels:t.labels,uGridAmount:t.grid,uInkMode:t.inkMode==="custom"?1:0,uInk:C(t.ink),uBackground:Yi[t.background]??0,uPulse:e.time*t.speed*.6,uSignals:t.speed>0,uSeed:s,uAtlasGrid:f.grid,uGlyphs:a.glyphs,uTextHeight:Math.max(6,13*e.unit),uAspect:f.aspect}});return e.release(p),m},dispose(e,o){o.atlas&&e.deleteTexture(o.atlas.texture),o.atlas=null}},Ct="0123456789ABCDEF#xy",Ji=500,oe=24,Qi=384,en=`
uniform float uLod;

void main() {
  outColor = vec4(textureLod(uInput, vUv, uLod).rgb, 1.0);
}`,tn=`
uniform vec2 uCount;
uniform float uBox;
uniform float uLod;
uniform float uSeed;
uniform vec2 uImage;
uniform sampler2D uHistory;
uniform float uSticky;
uniform float uKept;

vec3 photo(vec2 p, float lod) {
  return textureLod(uInput, clamp(p / uImage, 0.0, 1.0), lod).rgb;
}

void main() {
  int index = int(gl_FragCoord.x);
  int columns = int(uCount.x);
  vec2 grid = vec2(float(index % columns), float(index / columns));
  vec2 spacing = uImage / uCount;
  vec2 center = (grid + 0.5 + (hash22(grid * 1.31 + uSeed) - 0.5) * 0.7) * spacing;
  float reach = uBox * 0.5;
  float tones[25];
  float fine[25];
  float sum = 0.0;
  float squares = 0.0;
  float chroma = 0.0;
  float grain = 0.0;
  for (int y = 0; y < 5; y++) {
    for (int x = 0; x < 5; x++) {
      vec2 offset = (vec2(float(x), float(y)) - 2.0) / 2.0 * reach * 0.8;
      vec3 c = photo(center + offset, uLod);
      float l = luma(c);
      float f = abs(luma(photo(center + offset, max(uLod - 1.0, 0.0))) - l);
      tones[y * 5 + x] = l;
      fine[y * 5 + x] = f;
      sum += l;
      squares += l * l;
      grain += f;
      chroma += max(max(c.r, c.g), c.b) - min(min(c.r, c.g), c.b);
    }
  }
  float average = sum / 25.0;
  float spread = sqrt(max(squares / 25.0 - average * average, 0.0));
  float steps = 0.0;
  for (int y = 0; y < 5; y++) {
    for (int x = 0; x < 4; x++) {
      steps += abs(tones[y * 5 + x + 1] - tones[y * 5 + x]) + abs(tones[x * 5 + y + 5] - tones[x * 5 + y]);
    }
  }
  vec2 pull = vec2(0.0);
  float total = 0.0;
  for (int y = 0; y < 5; y++) {
    for (int x = 0; x < 5; x++) {
      vec2 offset = (vec2(float(x), float(y)) - 2.0) / 2.0 * reach * 0.8;
      float w = abs(tones[y * 5 + x] - average) + fine[y * 5 + x] * 2.0;
      w *= w;
      pull += offset * w;
      total += w;
    }
  }
  center += pull / max(total, 1e-5) * 0.6;
  center = clamp(center, vec2(reach + uBox * 0.06), uImage - reach - uBox * 0.06);
  vec3 local = photo(center, uLod + 2.3);
  vec3 wide = photo(center, uLod + 4.0);
  float distinct = length(local - wide);
  float score = spread * 1.6 + steps / 40.0 * 2.0 + grain / 25.0 * 3.0 + distinct * 1.5 + chroma / 25.0 * 0.12;
  score = score * (0.8 + 0.4 * hash12(grid * 2.71 + uSeed * 1.7)) + 0.05 * hash12(grid * 5.13 + uSeed * 0.9);
  if (uSticky > 0.5) {
    float near = 0.0;
    for (int k = 0; k < ${oe}; k++) {
      if (k >= int(uKept)) break;
      vec4 h = texelFetch(uHistory, ivec2(k, 2), 0);
      if (h.z < 0.5) continue;
      near = max(near, 1.0 - smoothstep(uBox * 0.15, uBox * 0.6, distance(h.xy, center)));
    }
    score *= 1.0 + 0.45 * near;
  }
  outColor = vec4(center, score, 1.0);
}`,on=`
uniform sampler2D uCandidates;
uniform float uTotal;
uniform float uLayout;
uniform float uCount;
uniform float uBox;
uniform float uGap;
uniform vec2 uImage;
uniform float uWander;
uniform float uSeed;

void main() {
  int i = int(gl_FragCoord.x);
  vec2 center = vec2(0.0);
  float valid = 0.0;
  if (uLayout > 0.5) {
    float columns = max(1.0, floor(sqrt(uCount * uImage.x / uImage.y) + 0.5));
    float rows = ceil(uCount / columns);
    float column = mod(float(i), columns);
    float row = floor(float(i) / columns);
    float inRow = min(columns, uCount - row * columns);
    vec2 cell = vec2(uImage.x / columns, uImage.y / rows);
    float shift = (columns - inRow) * 0.5;
    center = vec2((column + shift + 0.5) * cell.x, uImage.y - (row + 0.5) * cell.y);
    valid = float(i) < uCount ? 1.0 : 0.0;
  } else {
    vec2 chosen[${oe}];
    for (int n = 0; n < ${oe}; n++) {
      if (n >= int(uCount) || n > i) break;
      float best = -1.0;
      vec2 pick = vec2(0.0);
      for (int j = 0; j < 1024; j++) {
        if (j >= int(uTotal)) break;
        vec4 c = texelFetch(uCandidates, ivec2(j, 0), 0);
        if (c.z <= best) continue;
        bool free = true;
        for (int m = 0; m < ${oe}; m++) {
          if (m >= n) break;
          vec2 d = abs(chosen[m] - c.xy);
          if (max(d.x, d.y) < uGap) {
            free = false;
            break;
          }
        }
        if (free) {
          best = c.z;
          pick = c.xy;
        }
      }
      if (best < 0.0) break;
      chosen[n] = pick;
      if (n == i) {
        center = pick;
        valid = 1.0;
      }
    }
  }
  vec2 base = center;
  if (uWander > 0.0) {
    float id = float(i) * 7.31 + uSeed;
    vec2 drift = vec2(valueNoise(vec2(id, uTime * 0.35)), valueNoise(vec2(id + 41.0, uTime * 0.35 + 9.0))) - 0.5;
    center += drift * uBox * 0.5 * uWander;
    center = clamp(center, vec2(uBox * 0.56), uImage - uBox * 0.56);
  }
  vec3 color = textureLod(uInput, center / uImage, log2(max(uBox * 0.35, 1.0))).rgb;
  if (gl_FragCoord.y < 1.0) outColor = vec4(center, valid, 1.0);
  else if (gl_FragCoord.y < 2.0) outColor = vec4(color, 1.0);
  else outColor = vec4(base, valid, 1.0);
}`,an=`
uniform sampler2D uBoxes;
uniform float uCount;

void main() {
  int i = int(gl_FragCoord.x);
  vec4 a = texelFetch(uBoxes, ivec2(i, 0), 0);
  float first = -1.0;
  float second = -1.0;
  float d1 = 1e20;
  float d2 = 1e20;
  for (int j = 0; j < ${oe}; j++) {
    if (j >= int(uCount)) break;
    if (j == i) continue;
    vec4 b = texelFetch(uBoxes, ivec2(j, 0), 0);
    if (b.z < 0.5) continue;
    float d = distance(a.xy, b.xy);
    if (d < d1) {
      d2 = d1;
      second = first;
      d1 = d;
      first = float(j);
    } else if (d < d2) {
      d2 = d;
      second = float(j);
    }
  }
  outColor = vec4(first, second, d1, d2);
}`,ln=`
uniform sampler2D uBoxes;
uniform sampler2D uLinks;
uniform sampler2D uAtlas;
uniform float uCount;
uniform float uHalf;
uniform float uRadius;
uniform float uStroke;
uniform vec3 uColor;
uniform float uFill;
uniform float uLabels;
uniform float uConnect;
uniform float uDim;
uniform float uTextHeight;
uniform vec2 uAtlasGrid;
uniform float uAspect;
uniform float uGlyphs[19];
uniform float uDot;

float roundBox(vec2 q, float r) {
  vec2 d = abs(q) - vec2(uHalf) + r;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - r;
}

vec2 glyph(vec2 p, vec2 origin, float index, float w, float h) {
  vec2 local = (p - origin) / vec2(w, h);
  if (local.x < 0.0 || local.y < 0.0 || local.x > 1.0 || local.y > 1.0) return vec2(0.0);
  float column = mod(index, uAtlasGrid.x);
  float row = floor(index / uAtlasGrid.x);
  vec2 uv = vec2((column + local.x) / uAtlasGrid.x, 1.0 - (row + 1.0 - local.y) / uAtlasGrid.y);
  vec2 gx = vec2(1.0 / (w * uAtlasGrid.x), 0.0);
  vec2 gy = vec2(0.0, 1.0 / (h * uAtlasGrid.y));
  return vec2(textureGrad(uAtlas, uv, gx, gy).a, textureGrad(uAtlas, uv, gx * 5.0, gy * 5.0).a);
}

int digit(float value, int place) {
  float scale = place == 0 ? 1.0 : (place == 1 ? 10.0 : 100.0);
  float v = floor((value + 0.5) / scale);
  return int(v - floor(v / 10.0) * 10.0);
}

int codeAt(int slot, float index, vec2 center, vec3 swatch) {
  if (uLabels < 0.5) {
    float x = clamp(floor(center.x / uResolution.x * 1000.0), 0.0, 999.0);
    float y = clamp(floor((1.0 - center.y / uResolution.y) * 1000.0), 0.0, 999.0);
    if (slot == 0) return 17;
    if (slot >= 2 && slot <= 4) return digit(x, 4 - slot);
    if (slot == 7) return 18;
    if (slot >= 9 && slot <= 11) return digit(y, 11 - slot);
    return -1;
  }
  if (uLabels < 1.5) {
    if (slot == 0) return 16;
    if (slot > 6) return -1;
    int channel = (slot - 1) / 2;
    float c = channel == 0 ? swatch.r : (channel == 1 ? swatch.g : swatch.b);
    float byte = floor(clamp(c, 0.0, 1.0) * 255.0 + 0.5);
    float high = floor(byte / 16.0);
    return int(slot % 2 == 1 ? high : byte - high * 16.0);
  }
  if (slot > 1) return -1;
  return digit(index + 1.0, 1 - slot);
}

vec2 label(vec2 p, vec2 origin, float index, vec2 center, vec3 swatch) {
  float h = uTextHeight;
  float w = h * uAspect * 0.78;
  vec2 local = p - origin;
  if (local.y < 0.0 || local.y > h || local.x < 0.0 || local.x > w * 12.0) return vec2(0.0);
  int slot = int(floor(local.x / w));
  int code = codeAt(slot, index, center, swatch);
  if (code < 0) return vec2(0.0);
  return glyph(p, origin + vec2(float(slot) * w - (h * uAspect - w) * 0.5, 0.0), uGlyphs[code], h * uAspect, h);
}

void main() {
  vec2 p = gl_FragCoord.xy;
  vec3 image = texture(uInput, vUv).rgb;
  float inside = 0.0;
  float edge = 0.0;
  float shade = 0.0;
  float text = 0.0;
  float halo = 0.0;
  float dots = 0.0;
  vec3 fill = image;
  for (int i = 0; i < ${oe}; i++) {
    if (i >= int(uCount)) break;
    vec4 box = texelFetch(uBoxes, ivec2(i, 0), 0);
    if (box.z < 0.5) continue;
    vec3 swatch = texelFetch(uBoxes, ivec2(i, 1), 0).rgb;
    vec2 q = p - box.xy;
    float d = roundBox(q, uRadius);
    float cover = 1.0 - smoothstep(-0.5, 0.5, d);
    if (cover > 0.0) {
      vec3 content = image;
      if (uFill > 0.5 && uFill < 1.5) content = swatch;
      if (uFill > 1.5) content = textureLod(uInput, (box.xy + q * 0.5) / uResolution, 0.0).rgb;
      fill = mix(fill, content, cover);
    }
    inside = max(inside, cover);
    edge = max(edge, 1.0 - smoothstep(uStroke - 0.5, uStroke + 0.5, abs(d)));
    shade = max(shade, 1.0 - smoothstep(uStroke + 0.5, uStroke * 3.0 + 1.5, abs(d)));
    if (uLabels < 2.5) {
      vec2 origin = box.xy + vec2(-uHalf + uRadius * 0.3, uHalf + uTextHeight * 0.35);
      vec2 t = label(p, origin, float(i), box.xy, swatch);
      text = max(text, t.x);
      halo = max(halo, t.y);
    }
    if (uConnect > 0.5) {
      vec4 near = texelFetch(uLinks, ivec2(i, 0), 0);
      for (int k = 0; k < 2; k++) {
        float j = k == 0 ? near.x : near.y;
        if (j < 0.0) continue;
        vec2 other = texelFetch(uBoxes, ivec2(int(j), 0), 0).xy;
        vec2 dir = other - box.xy;
        float len = length(dir);
        if (len < 1.0) continue;
        dir /= len;
        vec2 rel = p - box.xy;
        float s = dot(rel, dir);
        float e = abs(dir.x * rel.y - dir.y * rel.x);
        if (s < 0.0 || s > len || e > uDot * 3.0) continue;
        float spacing = uDot * 4.5;
        float middle = len * 0.5;
        float k0 = floor((s - middle) / spacing + 0.5);
        float at = middle + k0 * spacing;
        vec2 centerDot = box.xy + dir * at;
        float clear = min(roundBox(centerDot - box.xy, uRadius), roundBox(centerDot - other, uRadius));
        if (clear < uDot * 3.0) continue;
        float r = length(vec2(s - at, e));
        dots = max(dots, 1.0 - smoothstep(uDot - 0.5, uDot + 0.5, r));
      }
    }
  }
  vec3 color = mix(image, image * 0.32, uDim * (1.0 - inside));
  color = mix(color, fill, inside);
  float lift = luma(uColor) > 0.5 ? 1.0 : 0.0;
  color = mix(color, color * 0.55, shade * 0.45 * lift);
  color = mix(color, uColor, dots * 0.75);
  color = mix(color, uColor, edge);
  color = mix(color, color * 0.35, clamp(halo * 1.6, 0.0, 1.0) * 0.6 * lift);
  color = mix(color, uColor, clamp(text, 0.0, 1.0));
  outColor = vec4(color, 1.0);
}`,rn={frame:0,swatch:1,zoom:2},nn={coords:0,hex:1,index:2,none:3};function un(e,o){return(!o.atlas||!o.atlas.fontReady&&o.fontLoaded)&&(o.atlas&&e.gl.deleteTexture(o.atlas.texture),o.atlas=Ve(e.engine,Ct,Ji),o.glyphs=[...Ct].map(t=>o.atlas.chars.indexOf(t)),!o.atlas.fontReady&&!o.fontPending&&(o.fontPending=!0,$e().then(()=>{o.fontLoaded=!0}))),o.atlas}const sn={id:"specimen",name:"Specimen",category:"geometric",description:"Boxes the most striking parts of the picture like a specimen sheet, with sampled colors and small labels.",animated:!0,animates:e=>e.motion>0,params:[{key:"layout",label:"Layout",type:"select",default:"detect",options:[{value:"detect",label:"Points of interest"},{value:"grid",label:"Sheet"}]},{key:"count",label:"Boxes",type:"number",min:1,max:oe,step:1,default:6},{key:"size",label:"Box size",type:"number",min:40,max:400,step:1,default:150},{key:"fill",label:"Fill",type:"select",default:"frame",options:[{value:"frame",label:"Outline"},{value:"swatch",label:"Swatch"},{value:"zoom",label:"Magnify"}]},{key:"labels",label:"Labels",type:"select",default:"coords",options:[{value:"coords",label:"Coordinates"},{value:"hex",label:"Hex color"},{value:"index",label:"Numbers"},{value:"none",label:"None"}]},{key:"links",label:"Connectors",type:"boolean",default:!0},{key:"stroke",label:"Stroke color",type:"color",default:"#cfdcb8"},{key:"width",label:"Stroke width",type:"number",min:.5,max:6,step:.1,default:2.4},{key:"radius",label:"Corner radius",type:"number",min:0,max:.5,step:.01,default:.12},{key:"dim",label:"Dim outside",type:"number",min:0,max:1,step:.01,default:0},{key:"variation",label:"Variação",type:"number",min:0,max:100,step:1,default:0},{key:"motion",label:"Wander",type:"number",min:0,max:1,step:.01,default:0}],render(e,o,t,a){const l=o.mipmapped?o:e.mipmap(o),r=Math.max(1,Math.min(oe,Math.round(t.count))),i=Math.max(1,Math.floor(Math.sqrt(r*e.width/e.height)+.5)),n=Math.ceil(r/i),u=Math.min(e.width/i,e.height/n)*.86,c=Math.max(8,t.layout==="grid"?Math.min(t.size*e.unit,u):t.size*e.unit),s=Math.round(t.variation)%997*1.618,p=t.layout==="grid",f=[e.width,e.height,t.layout,r,t.size,t.variation].join(":"),m=e.time-(a.historyTime??1/0),d=!!a.history&&a.historyKey===f&&m>0&&m<.5;let v=null,g=1;if(!p){const y=c*.8,S=Math.max(1,Math.min(28,Math.round(e.width/y))),I=Math.max(1,Math.min(28,Math.round(e.height/y)));g=S*I;const L=Math.max(e.width,e.height),M=Qi/L,A=e.pass("specimen-analysis",en,{input:l,target:e.target(Math.max(1,Math.round(e.width*M)),Math.max(1,Math.round(e.height*M))),uniforms:{uLod:Math.max(0,Math.log2(1/M)-.5)}});e.mipmap(A),v=e.pass("specimen-candidates",tn,{input:A,target:e.target(g,1,{filter:"nearest"}),textures:{uHistory:d?a.history:l},uniforms:{uSticky:d,uKept:a.historyCount||0,uCount:[S,I],uBox:c,uLod:Math.max(0,Math.log2(c*M/10)),uSeed:s,uImage:[e.width,e.height]}}),e.release(A)}const x=e.pass("specimen-gather",on,{input:l,target:e.target(oe,3,{filter:"nearest"}),textures:{uCandidates:v||l},uniforms:{uTotal:g,uLayout:p?1:0,uCount:r,uBox:c,uGap:c*1.16,uImage:[e.width,e.height],uWander:t.motion,uSeed:s}});v&&e.release(v);const k=e.pass("specimen-neighbors",an,{input:l,target:e.target(oe,1,{filter:"nearest"}),textures:{uBoxes:x},uniforms:{uCount:r}}),h=un(e,a),b=e.pass("specimen-draw",ln,{input:l,textures:{uBoxes:x,uLinks:k,uAtlas:h.texture},uniforms:{uCount:r,uHalf:c*.5,uRadius:Math.min(t.radius,.5)*c*.5,uStroke:Math.max(.5,t.width*.5*e.unit),uColor:C(t.stroke),uFill:rn[t.fill]??0,uLabels:nn[t.labels]??0,uConnect:t.links,uDim:t.dim,uTextHeight:Math.max(7,13*e.unit),uAtlasGrid:h.grid,uAspect:h.aspect,uGlyphs:a.glyphs,uDot:Math.max(.6,1.1*e.unit)}});return a.history&&e.release(a.history),a.history=x,a.historyKey=f,a.historyTime=e.time,a.historyCount=r,e.release(k),b},dispose(e,o){o.atlas&&e.deleteTexture(o.atlas.texture),o.history&&(e.deleteTexture(o.history.texture),e.deleteFramebuffer(o.history.fbo)),o.atlas=null,o.history=null}},cn=`
void main() {
  outColor = vec4(toLinear(texture(uInput, vUv).rgb), 1.0);
}`,fn=`
uniform sampler2D uBlur;
uniform float uTexture;
uniform float uScatter;
uniform float uSize;
uniform vec3 uTint;
uniform float uHaze;
uniform float uClear;
uniform float uClearSize;
uniform float uClock;
uniform float uSeed;

vec2 mirrorUv(vec2 uv) {
  return 1.0 - abs(1.0 - abs(uv));
}

vec3 sharpAt(vec2 p) {
  vec2 uv = mirrorUv(vec2(p.x / uResolution.x, 1.0 - p.y / uResolution.y));
  return toLinear(texture(uInput, uv).rgb);
}

vec3 frostAt(vec2 p) {
  vec2 uv = mirrorUv(vec2(p.x / uResolution.x, 1.0 - p.y / uResolution.y));
  return texture(uBlur, uv).rgb;
}

float dimples(vec2 q) {
  vec2 i = floor(q);
  vec2 f = fract(q);
  float sum = 0.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 g = vec2(float(x), float(y));
      vec3 h = hash32(i + g + uSeed * 17.0);
      vec2 r = g + 0.1 + 0.8 * h.xy - f;
      float size = 0.75 + 0.5 * h.z;
      sum += exp(-7.0 * dot(r, r) / (size * size));
    }
  }
  return -log(sum + 1e-4) / 7.0;
}

float ripples(vec2 q) {
  vec2 w = vec2(fbm(q * 0.31 + uSeed), fbm(q * 0.31 + vec2(9.2, 3.7) + uSeed));
  float a = sin(q.y * 1.05 + w.x * 5.0 + sin(q.x * 0.37) * 1.2);
  float b = sin(dot(q, vec2(0.55, 0.62)) * 1.4 + w.y * 4.0);
  return a * 0.65 + b * 0.35;
}

float surface(vec2 q) {
  if (uTexture < 1.5) return dimples(q) + 0.35 * dimples(q * 2.3 + 11.0);
  return ripples(q);
}

vec2 slope(vec2 q, float e) {
  float h = surface(q);
  return vec2(surface(q + vec2(e, 0.0)) - h, surface(q + vec2(0.0, e)) - h) / e;
}

float dripPath(float y, float id) {
  return (valueNoise(vec2(y * 0.012, id * 13.1)) - 0.5) * 22.0 + (valueNoise(vec2(y * 0.06, id * 7.3)) - 0.5) * 4.0;
}

vec4 drop(vec2 d, vec2 radii) {
  vec2 n = d / radii;
  float r2 = dot(n, n);
  if (r2 >= 1.0) return vec4(0.0);
  float aa = 1.5 / (uUnit * min(radii.x, radii.y));
  float mask = 1.0 - smoothstep(1.0 - aa, 1.0, sqrt(r2));
  return vec4(n, mask, r2);
}

void lensDrop(vec4 b, float radius, float power, float amount, inout vec2 offset, inout float clear, inout float shade, inout float glint) {
  float m = b.z * amount;
  if (m <= 0.0) return;
  clear = max(clear, m);
  offset = mix(offset, -b.xy * radius * power, m);
  float weight = smoothstep(1.5, 8.0, radius);
  float rim = smoothstep(0.45, 1.0, b.w);
  float dark = 1.0 - (0.3 + 0.45 * weight) * rim * clamp(0.55 + b.y * 0.6, 0.0, 1.0);
  dark += 0.6 * smoothstep(0.55, 0.95, b.w) * smoothstep(0.3, 0.9, b.y) * (1.0 - smoothstep(0.95, 1.0, b.w));
  shade = mix(shade, dark, m);
  float spot = mix(0.42, 0.2, weight);
  float key = smoothstep(spot, 0.0, length(b.xy - vec2(-0.3, -0.42)));
  float bounce = 0.4 * smoothstep(0.3, 0.0, length(b.xy - vec2(0.2, 0.62)));
  glint = max(glint, m * (key + bounce * weight));
}

void drips(vec2 q, float H, inout vec2 offset, inout float clear, inout float shade, inout float glint) {
  float spacing = mix(170.0, 44.0, uClearSize);
  float col = floor(q.x / spacing);
  for (int k = -1; k <= 1; k++) {
    float c = col + float(k);
    vec3 r = hash32(vec2(c * 1.13 + 0.7, uSeed * 1.37 + 3.1));
    if (r.z > 0.8) continue;
    float life = uClock * mix(0.12, 0.26, r.x) + r.y;
    float cycle = floor(life);
    float phase = fract(life);
    vec3 s = hash32(vec2(c * 3.7 + 1.3, cycle * 1.91 + uSeed));
    float id = c * 7.0 + cycle * 3.0;
    float x0 = (c + 0.3 + 0.4 * s.x) * spacing;
    float start = (s.y * 0.7 - 0.1) * H;
    float travel = H * 1.25;
    float headY = start + travel * (phase + 0.0239 * sin(phase * TAU * 6.0));
    float radius = mix(10.0, 17.0, s.z);
    float fade = smoothstep(0.0, 0.04, phase) * (1.0 - smoothstep(0.8, 1.0, phase));
    float px = x0 + dripPath(q.y, id);
    if (q.y > start && q.y < headY) {
      float age = (headY - q.y) / travel;
      float width = radius * mix(0.62, 0.36, smoothstep(0.0, 0.4, age));
      width *= 0.8 + 0.4 * valueNoise(vec2(q.y * 0.12, id));
      float dx = abs(q.x - px);
      float aa = 1.0 / uUnit;
      float trail = 1.0 - smoothstep(width - aa, width + aa, dx);
      trail *= (1.0 - smoothstep(0.3, 0.85, age)) * smoothstep(0.0, radius, q.y - start) * fade;
      clear = max(clear, trail);
      float edge = smoothstep(width - 2.5, width, dx) * trail;
      shade = mix(shade, 0.72, edge);
      float pitch = radius * 2.0;
      float slot = floor(q.y / pitch);
      float bead = hash12(vec2(slot, id));
      if (bead > 0.4 && trail > 0.0) {
        float by = (slot + 0.3 + 0.4 * fract(bead * 9.1)) * pitch;
        float br = radius * mix(0.25, 0.45, fract(bead * 4.7));
        vec4 b = drop(vec2(q.x - x0 - dripPath(by, id), q.y - by), vec2(br * 0.9, br));
        lensDrop(b, br, 2.6, 1.0, offset, clear, shade, glint);
      }
    }
    vec2 hd = vec2(q.x - x0 - dripPath(headY, id), q.y - headY);
    vec2 radii = vec2(radius, radius * mix(1.1, 1.3, s.x));
    hd.x *= 1.0 + 0.3 * clamp(-hd.y / radii.y, 0.0, 1.0);
    vec4 h = drop(hd, radii);
    lensDrop(h, radius, 3.2, fade, offset, clear, shade, glint);
  }
}

void beads(vec2 q, float wiped, inout vec2 offset, inout float clear, inout float shade, inout float glint) {
  float cell = 15.0;
  vec2 i = floor(q / cell);
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 g = i + vec2(float(x), float(y));
      vec3 h = hash32(g + uSeed * 5.31);
      if (h.z > 0.38) continue;
      vec2 center = (g + 0.2 + 0.6 * h.xy) * cell;
      float size = fract(h.z * 7.13);
      float radius = mix(1.8, 7.0, size * size * size);
      vec4 b = drop(q - center, vec2(radius));
      lensDrop(b, radius, 2.4, 1.0 - wiped, offset, clear, shade, glint);
    }
  }
}

void main() {
  vec2 p = vec2(vUv.x, 1.0 - vUv.y) * uResolution;
  vec2 q = p / uUnit;
  float H = uResolution.y / uUnit;
  vec2 offset = vec2(0.0);
  float sparkle = 0.0;
  float light = 0.0;

  if (uTexture < 0.5) {
    vec2 g = q / max(uSize * 0.13, 0.5);
    vec2 n = vec2(valueNoise(g + uSeed), valueNoise(g + vec2(31.7, 17.3) + uSeed)) - 0.5;
    n += 0.7 * (vec2(valueNoise(g * 2.1 + 5.1), valueNoise(g * 2.1 + 41.9)) - 0.5);
    n += 0.5 * (vec2(valueNoise(g * 0.31 + 9.7), valueNoise(g * 0.31 + 63.1)) - 0.5);
    offset = n * uScatter * 14.0;
    sparkle = valueNoise(g * 1.6 + 77.0) - 0.5 + 0.6 * (valueNoise(g * 3.3 + 13.0) - 0.5);
    sparkle *= 0.5;
  } else {
    float scale = uTexture < 1.5 ? uSize * 0.8 : uSize * 2.2;
    vec2 g = q / max(scale, 1.0);
    vec2 s = slope(g, 0.03);
    offset = -s * uScatter * scale * (uTexture < 1.5 ? 1.6 : 0.55);
    vec3 normal = normalize(vec3(-s * (uTexture < 1.5 ? 0.5 : 0.4), 1.0));
    vec3 L = normalize(vec3(-0.45, -0.6, 0.65));
    light = (dot(normal, L) / L.z - 1.0) * 0.35;
    float spec = pow(max(dot(reflect(-L, normal), vec3(0.0, 0.0, 1.0)), 0.0), 60.0);
    light += spec * 0.9;
    sparkle = (valueNoise(q * 0.9 + uSeed) - 0.5) * 0.12;
  }

  vec3 color = frostAt(p + offset * uUnit);
  color *= 1.0 + sparkle * uScatter + light * uScatter;
  vec3 tint = toLinear(uTint);
  color *= tint;
  color = mix(color, color * 0.55 + 0.32 * tint, uHaze);

  if (uClear > 0.5) {
    float clear = 0.0;
    vec2 lens = vec2(0.0);
    float shade = 1.0;
    float glint = 0.0;
    if (uClear < 1.5) {
      drips(q, H, lens, clear, shade, glint);
      beads(q, smoothstep(0.2, 0.6, clear), lens, clear, shade, glint);
    } else if (uClear < 2.5) {
      vec2 c = (p - 0.5 * uResolution) / min(uResolution.x, uResolution.y);
      float a = atan(c.y, c.x);
      float r = length(c * vec2(0.82, 1.0));
      float edge = mix(0.1, 0.42, uClearSize) * (1.0 + 0.14 * (fbm(vec2(cos(a), sin(a)) * 1.7 + uSeed) - 0.5));
      float fuzz = 0.035 * (0.6 + 0.8 * valueNoise(q * 0.08));
      clear = 1.0 - smoothstep(edge - fuzz, edge + fuzz, r);
    } else {
      float band = mix(0.06, 0.4, uClearSize) * uResolution.y;
      float d = abs(p.y - 0.5 * uResolution.y) - band;
      clear = 1.0 - smoothstep(-0.75, 0.75, d);
    }
    vec3 clean = sharpAt(p + lens * uUnit) * tint * shade + glint * 1.2;
    color = mix(color, clean, clamp(clear, 0.0, 1.0));
  }

  outColor = vec4(toGamma(color), 1.0);
}`,mn={frosted:0,hammered:1,rippled:2},dn={frosted:1,hammered:.55,rippled:.6},pn={none:0,drips:1,spot:2,band:3},vn={id:"frosted",name:"Frosted glass",category:"glass",blend:"normal",description:"Frosted, hammered or rippled glass that softens and scatters the picture, with optional drips.",animated:!0,animates:e=>e.clear==="drips"&&e.speed>0,preview:{zoom:1.5,params:{clear:"drips",clearSize:.8}},params:[{key:"texture",label:"Glass",type:"select",default:"frosted",options:[{value:"frosted",label:"Frosted"},{value:"hammered",label:"Hammered"},{value:"rippled",label:"Rippled"}]},{key:"frost",label:"Frost",type:"number",min:0,max:1,step:.01,default:.45},{key:"scatter",label:"Scatter",type:"number",min:0,max:1,step:.01,default:.5},{key:"size",label:"Texture size",type:"number",min:4,max:80,step:.5,default:20},{key:"tint",label:"Glass tint",type:"color",default:"#ffffff"},{key:"haze",label:"Haze",type:"number",min:0,max:1,step:.01,default:.12},{key:"clear",label:"Clear glass",type:"select",default:"none",options:[{value:"none",label:"None"},{value:"drips",label:"Drips"},{value:"spot",label:"Wiped spot"},{value:"band",label:"Clear band"}]},{key:"clearSize",label:"Clear amount",type:"number",min:0,max:1,step:.01,default:.5,when:e=>e.clear!=="none"},{key:"speed",label:"Drip speed",type:"number",min:0,max:2,step:.01,default:.5,when:e=>e.clear==="drips"},{key:"variation",label:"Variação",type:"number",min:0,max:100,step:1,default:0}],render(e,o,t){const a=e.pass("frosted-linear",cn,{input:o}),l=(.6+27.4*t.frost*t.frost)*(dn[t.texture]??1)*e.unit,r=t.frost>0?E(e,a,l):a,i=e.pass("frosted",fn,{input:o,textures:{uBlur:r},uniforms:{uTexture:mn[t.texture]??0,uScatter:t.scatter,uSize:t.size,uTint:C(t.tint),uHaze:t.haze,uClear:pn[t.clear]??0,uClearSize:t.clearSize,uClock:e.time*t.speed,uSeed:t.variation}});return r!==a&&e.release(r),e.release(a),i}},hn=`
uniform float uPattern;
uniform float uCell;
uniform float uLead;
uniform vec3 uLeadColor;
uniform float uBoost;
uniform float uVariety;
uniform float uTexture;
uniform float uShimmer;
uniform float uBacklight;
uniform float uSeed;

vec2 site(vec2 cell) {
  return 0.5 + 0.8 * (hash22(cell + uSeed * 7.31) - 0.5);
}

vec4 voronoi(vec2 x) {
  vec2 n = floor(x);
  vec2 f = fract(x);
  vec2 mg = vec2(0.0);
  vec2 mr = vec2(0.0);
  float md = 8.0;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 r = g + site(n + g) - f;
      float d = dot(r, r);
      if (d < md) {
        md = d;
        mr = r;
        mg = g;
      }
    }
  }
  md = 8.0;
  for (int j = -2; j <= 2; j++) {
    for (int i = -2; i <= 2; i++) {
      vec2 g = mg + vec2(float(i), float(j));
      vec2 r = g + site(n + g) - f;
      vec2 e = r - mr;
      if (dot(e, e) > 1e-5) md = min(md, dot(0.5 * (mr + r), normalize(e)));
    }
  }
  return vec4(x + mr, md, hash12(n + mg + uSeed * 3.17));
}

vec4 diamonds(vec2 x) {
  vec2 a = vec2(x.x * 0.72 + x.y, x.y - x.x * 0.72);
  vec2 cell = floor(a);
  vec2 f = fract(a) - 0.5;
  float edge = (0.5 - max(abs(f.x), abs(f.y))) * 0.82;
  vec2 c = cell + 0.5;
  vec2 center = vec2((c.x - c.y) / 1.44, (c.x + c.y) * 0.5);
  return vec4(center, edge, hash12(cell + uSeed * 3.17));
}

vec4 rose(vec2 x, vec2 middle) {
  vec2 v = x - middle;
  float r = length(v);
  float a = atan(v.y, v.x) / TAU + 0.5;
  float ring = floor(r);
  float count = ring < 0.5 ? 1.0 : 6.0 * pow(2.0, floor(log2(ring + 1.0)));
  float twist = ring * 0.5 / count;
  float s = a * count + twist * count;
  float sector = floor(s);
  float fs = fract(s);
  float radial = r < 1.0 ? 1.0 - r : min(fract(r), 1.0 - fract(r));
  float angular = count > 1.5 ? min(fs, 1.0 - fs) * TAU * r / count : 9.0;
  float edge = min(radial, angular);
  float ca = ((sector + 0.5) / count - twist) * TAU - PI;
  vec2 center = ring < 0.5 ? middle : middle + vec2(cos(ca), sin(ca)) * (ring + 0.5);
  return vec4(center, edge, hash12(vec2(ring, sector) + uSeed * 3.17));
}

void main() {
  vec2 p = vUv * uResolution;
  vec2 x = p / uCell;
  vec4 v;
  if (uPattern < 0.5) v = voronoi(x);
  else if (uPattern < 1.5) v = diamonds(x);
  else v = rose(x, 0.5 * uResolution / uCell);

  vec2 siteUv = clamp(v.xy * uCell / uResolution, 0.0, 1.0);
  float lod = log2(max(uCell * 0.75, 1.0));
  vec3 base = textureLod(uInput, siteUv, lod).rgb;
  base = mix(base, textureLod(uInput, siteUv, lod + 1.0).rgb, 0.3);

  vec3 hsv = rgb2hsv(base);
  vec3 rnd = hash32(vec2(v.w * 91.7, v.w * 13.3 + 5.0));
  float boost = 1.0 + uBoost * 5.0;
  hsv.y = clamp(hsv.y * boost / (1.0 + (boost - 1.0) * hsv.y), 0.0, 1.0);
  hsv.x = fract(hsv.x + (rnd.x - 0.5) * uVariety * 0.16);
  hsv.y = clamp(hsv.y * (1.0 + (rnd.y - 0.5) * uVariety * 0.8), 0.0, 1.0);
  hsv.z = clamp(hsv.z * (1.0 + (rnd.z - 0.5) * uVariety * 0.5), 0.0, 1.0);
  vec3 glass = toLinear(hsv2rgb(hsv));

  if (uShimmer > 0.0) {
    float light = valueNoise(siteUv * vec2(2.2, 1.6) + vec2(uTime * 0.11, uTime * 0.04) + uSeed);
    light += 0.5 * valueNoise(siteUv * 5.0 - vec2(uTime * 0.07, uTime * 0.13));
    glass *= 1.0 + uShimmer * (light - 0.75) * 0.9;
  }

  vec2 local = (x - v.xy);
  float angle = v.w * TAU;
  vec2 grain = rotation(angle) * local;
  float streak = valueNoise(grain * vec2(1.6, 9.0) + v.w * 40.0) - 0.5;
  float ripple = valueNoise(grain * 3.4 + v.w * 17.0) - 0.5;
  float seeds = smoothstep(0.82, 0.92, valueNoise(x * 11.0 + v.w * 9.0));
  float surface = streak * 0.5 + ripple * 0.35 + seeds * 0.25;
  glass *= 1.0 + surface * uTexture * 0.9;

  float edge = v.z * uCell / uUnit;
  float inner = smoothstep(0.0, uLead * 0.5 + 9.0, edge - uLead * 0.5);
  glass *= mix(0.6, 1.0 + 0.4 * uBacklight, inner);

  float aa = 0.75 / uUnit;
  float halfLead = uLead * 0.5;
  float lead = (1.0 - smoothstep(halfLead - aa, halfLead + aa, edge)) * clamp(uLead * 2.0, 0.0, 1.0);
  float profile = clamp(edge / max(halfLead, 1e-3), 0.0, 1.0);
  vec3 metal = toLinear(uLeadColor) * (0.7 + 0.6 * (1.0 - profile * profile));
  vec3 color = mix(glass, metal, lead);
  outColor = vec4(color, 1.0);
}`,Mt=`
uniform sampler2D uGlow;
uniform float uGlowAmount;

void main() {
  vec3 color = texture(uInput, vUv).rgb;
  vec3 glow = texture(uGlow, vUv).rgb;
  float level = dot(glow, LUMA);
  color += glow * smoothstep(0.08, 0.7, level) * uGlowAmount;
  color = color / (1.0 + max(color - 1.0, 0.0));
  outColor = vec4(toGamma(color), 1.0);
}`,gn={mosaic:0,diamond:1,rose:2},bn={id:"stained",name:"Stained glass",category:"glass",description:"Leaded panes of tinted glass, each taking the color of the picture behind it.",animated:!0,animates:e=>e.shimmer>0,params:[{key:"pattern",label:"Pattern",type:"select",default:"mosaic",options:[{value:"mosaic",label:"Mosaic"},{value:"diamond",label:"Diamond"},{value:"rose",label:"Rose window"}]},{key:"size",label:"Pane size",type:"number",min:10,max:150,step:1,default:38},{key:"lead",label:"Leading",type:"number",min:0,max:14,step:.1,default:4},{key:"leadColor",label:"Lead color",type:"color",default:"#141217"},{key:"saturation",label:"Color boost",type:"number",min:0,max:1,step:.01,default:.6},{key:"variety",label:"Color variety",type:"number",min:0,max:1,step:.01,default:.3},{key:"texture",label:"Glass texture",type:"number",min:0,max:1,step:.01,default:.5},{key:"glow",label:"Back light",type:"number",min:0,max:1,step:.01,default:.5},{key:"shimmer",label:"Shimmer",type:"number",min:0,max:1,step:.01,default:0},{key:"variation",label:"Variação",type:"number",min:0,max:100,step:1,default:0}],render(e,o,t){const a=o.mipmapped?o:e.mipmap(o),l=Math.max(3,t.size*e.unit),r=e.pass("stained-panes",hn,{input:a,uniforms:{uPattern:gn[t.pattern]??0,uCell:l,uLead:Math.min(t.lead,t.size*.35),uLeadColor:C(t.leadColor),uBoost:t.saturation,uVariety:t.variety,uTexture:t.texture,uShimmer:t.shimmer,uBacklight:t.glow,uSeed:t.variation}});if(t.glow<=0){const u=e.pass("stained-composite",Mt,{input:r,textures:{uGlow:r},uniforms:{uGlowAmount:0}});return e.release(r),u}const i=E(e,r,l*.45),n=e.pass("stained-composite",Mt,{input:r,textures:{uGlow:i},uniforms:{uGlowAmount:t.glow*.9}});return e.release(i),e.release(r),n}},yn=`
uniform float uPattern;
uniform float uFacet;
uniform float uCell;
uniform float uAngle;
uniform float uRefraction;
uniform float uSpread;
uniform float uLines;
uniform float uWidth;
uniform float uShading;
uniform vec3 uTint;
uniform vec2 uDrift;
uniform float uSeed;

vec2 mirrorUv(vec2 uv) {
  return 1.0 - abs(1.0 - abs(uv));
}

vec3 photo(vec2 p) {
  return toLinear(texture(uInput, mirrorUv(vec2(p.x / uResolution.x, 1.0 - p.y / uResolution.y))).rgb);
}

void main() {
  vec2 p = vec2(vUv.x, 1.0 - vUv.y) * uResolution;
  vec2 centered = p - 0.5 * uResolution;
  mat2 spin = rotation(uAngle);
  vec2 g = spin * centered / uCell + uDrift;

  mat2 toLocal = mat2(1.0);
  if (uPattern > 0.5 && uPattern < 1.5) toLocal = mat2(0.68, -0.68, 0.6, 0.6);
  vec2 q = toLocal * g;
  vec2 scale = vec2(length(vec2(toLocal[0][0], toLocal[1][0])), length(vec2(toLocal[0][1], toLocal[1][1])));

  vec2 cell;
  vec2 f;
  float edge;
  vec2 edgeNormal;
  float ridge;
  if (uPattern < 1.5) {
    cell = floor(q);
    f = fract(q) - 0.5;
    vec2 dist = (0.5 - abs(f)) / scale;
    edge = min(dist.x, dist.y);
    edgeNormal = dist.x < dist.y ? vec2(sign(f.x), 0.0) : vec2(0.0, sign(f.y));
    ridge = abs(abs(f.x) - abs(f.y)) * 0.7071 / max(scale.x, scale.y);
  } else {
    vec2 r = vec2(1.0, 1.7320508);
    vec2 h = r * 0.5;
    vec2 a = mod(q, r) - h;
    vec2 b = mod(q - h, r) - h;
    f = dot(a, a) < dot(b, b) ? a : b;
    cell = floor((q - f) * 2.0 + 0.5);
    vec2 af = abs(f);
    float p1 = af.x;
    float p2 = dot(af, vec2(0.5, 0.8660254));
    float p3 = abs(dot(af, vec2(-0.5, 0.8660254)));
    edge = 0.5 - max(p1, p2);
    edgeNormal = p1 > p2 ? vec2(sign(f.x), 0.0) : sign(f) * vec2(0.5, 0.8660254);
    ridge = p1 > p2 ? (p1 - p2) : min(p2 - p1, p2 - p3);
  }

  vec2 slope;
  if (uFacet < 0.5) {
    vec2 tilt = hash22(cell + uSeed * 3.1) - 0.5;
    slope = tilt * 1.1 + f * 0.9;
  } else if (uFacet < 1.5) {
    slope = edgeNormal * 0.8;
  } else {
    float d = length(f * 2.0);
    slope = f * 2.4 * (1.0 + 0.6 * d * d);
  }

  mat2 back = inverse(toLocal);
  mat2 unspin = rotation(-uAngle);
  vec2 lit = unspin * (back * slope);
  vec2 shift = lit * uCell * uRefraction * 0.35;

  vec3 color;
  if (uSpread > 0.0) {
    color = vec3(
      photo(p - shift * (1.0 - uSpread)).r,
      photo(p - shift).g,
      photo(p - shift * (1.0 + uSpread)).b
    );
  } else {
    color = photo(p - shift);
  }

  vec2 lightDir = normalize(vec2(-0.6, -0.8));
  float facing = dot(normalize(lit + 1e-5), lightDir) * min(length(lit), 1.0);
  color *= 1.0 + facing * uShading * 0.55;
  color *= toLinear(uTint);

  float aa = 0.75 / uUnit;
  float w = uWidth * 0.5;
  float px = edge * uCell / uUnit;
  float line = 1.0 - smoothstep(w - aa, w + aa, px);
  vec2 n = unspin * (back * edgeNormal);
  float side = dot(normalize(n + 1e-5), lightDir);
  float bevel = exp(-px / (uWidth * 1.4 + 1.0)) * (1.0 - line);
  color *= 1.0 - bevel * uLines * 0.35 * max(side, 0.0);
  color += bevel * uLines * 0.25 * max(-side, 0.0) * (0.3 + color);

  if (uFacet > 0.5 && uFacet < 1.5) {
    float rpx = ridge * uCell / uUnit;
    float crest = 1.0 - smoothstep(w * 0.35 - aa, w * 0.35 + aa, rpx);
    float glow = exp(-rpx / (uWidth + 1.0));
    color += (crest * 0.28 + glow * 0.1) * uLines * (0.25 + color);
  } else if (uFacet > 1.5) {
    vec2 spot = f * 2.0 - toLocal * (spin * vec2(-0.35, -0.42));
    color += exp(-dot(spot, spot) * 9.0) * uShading * 0.5 * (0.4 + color);
  }

  vec3 bright = mix(color * 1.6 + 0.12, vec3(1.0), 0.6) * toLinear(uTint);
  color = mix(color, bright, line * uLines);

  outColor = vec4(toGamma(color), 1.0);
}`,xn={square:0,diamond:1,hexagon:2},kn={flat:0,pyramid:1,dome:2},wn={id:"vitrine",name:"Pressed glass",category:"glass",blend:"normal",description:"A grid of pressed-glass facets, each refracting its own piece of the picture.",animated:!0,animates:e=>e.drift!==0,params:[{key:"pattern",label:"Pattern",type:"select",default:"square",options:[{value:"square",label:"Square"},{value:"diamond",label:"Diamond"},{value:"hexagon",label:"Hexagon"}]},{key:"facet",label:"Facets",type:"select",default:"flat",options:[{value:"flat",label:"Flat"},{value:"pyramid",label:"Pyramid"},{value:"dome",label:"Dome"}]},{key:"size",label:"Facet size",type:"number",min:10,max:200,step:1,default:60},{key:"angle",label:"Ângulo",type:"number",min:0,max:90,step:1,default:0},{key:"refraction",label:"Refraction",type:"number",min:0,max:1,step:.01,default:.4},{key:"dispersion",label:"Rainbow edges",type:"number",min:0,max:1,step:.01,default:.3},{key:"lines",label:"Highlight lines",type:"number",min:0,max:1,step:.01,default:.8},{key:"width",label:"Line width",type:"number",min:.5,max:8,step:.1,default:2.6},{key:"shading",label:"Facet shading",type:"number",min:0,max:1,step:.01,default:.35},{key:"tint",label:"Glass tint",type:"color",default:"#ffffff"},{key:"drift",label:"Drift",type:"number",min:-2,max:2,step:.01,default:0},{key:"variation",label:"Variação",type:"number",min:0,max:100,step:1,default:0,when:e=>e.facet==="flat"}],render(e,o,t){const a=o.mipmapped?o:e.mipmap(o),l=t.drift*e.time*.15;return e.pass("vitrine",yn,{input:a,uniforms:{uPattern:xn[t.pattern]??0,uFacet:kn[t.facet]??0,uCell:Math.max(4,t.size*e.unit),uAngle:t.angle*Math.PI/180,uRefraction:t.refraction,uSpread:t.dispersion*.35,uLines:t.lines,uWidth:t.width,uShading:t.shading,uTint:C(t.tint),uDrift:[l,l*.4],uSeed:t.variation}})}},Sn=`
uniform float uPattern;
uniform vec2 uImpact;
uniform float uSpokes;
uniform float uRing;
uniform float uGrowth;
uniform float uShard;
uniform float uDisplace;
uniform float uTilt;
uniform float uCracks;
uniform float uWidth;
uniform float uSpread;
uniform float uDrift;
uniform float uSway;
uniform float uWave;
uniform float uSeed;

struct Shard {
  vec2 center;
  float id;
  float edge;
  vec2 normal;
};

vec2 mirrorUv(vec2 uv) {
  return 1.0 - abs(1.0 - abs(uv));
}

vec3 photo(vec2 p) {
  return toLinear(texture(uInput, mirrorUv(vec2(p.x / uResolution.x, 1.0 - p.y / uResolution.y))).rgb);
}

float spokeJitter(float i) {
  return (hash11(mod(i, uSpokes) * 1.731 + uSeed * 0.37 + 0.11) - 0.5) * 0.7;
}

float spokeAngle(float i) {
  return (i + spokeJitter(i)) / uSpokes * TAU - PI;
}

float ringRadius(float i, float j) {
  return uRing * pow(uGrowth, j) * (1.0 + 0.36 * (hash12(vec2(mod(i, uSpokes) * 1.37, j * 2.11) + uSeed * 0.19) - 0.5));
}

Shard impact(vec2 p) {
  vec2 v = p - uImpact;
  float r = length(v);
  float a = (atan(v.y, v.x) + PI) / TAU * uSpokes;
  float k = floor(a);
  float s = k;
  if (a < k + spokeJitter(k)) s = k - 1.0;
  else if (a >= k + 1.0 + spokeJitter(k + 1.0)) s = k + 1.0;
  float a0 = spokeAngle(s);
  float a1 = spokeAngle(s + 1.0);
  vec2 d0 = vec2(cos(a0), sin(a0));
  vec2 d1 = vec2(cos(a1), sin(a1));
  vec2 perp0 = v - d0 * dot(v, d0);
  vec2 perp1 = v - d1 * dot(v, d1);
  float edge = length(perp0);
  vec2 normal = perp0 / max(edge, 1e-4);
  if (length(perp1) < edge) {
    edge = length(perp1);
    normal = perp1 / max(edge, 1e-4);
  }
  float sector = mod(s, uSpokes);
  float band = -1.0;
  for (int t = 0; t < 14; t++) {
    float j = float(t);
    if (hash12(vec2(sector * 3.1 + 0.5, j * 1.7) + uSeed * 0.71) < 0.2) continue;
    vec2 p0 = uImpact + d0 * ringRadius(s, j);
    vec2 p1 = uImpact + d1 * ringRadius(s + 1.0, j);
    vec2 dir = normalize(p1 - p0);
    vec2 n = vec2(dir.y, -dir.x);
    if (dot(n, p0 - uImpact) < 0.0) n = -n;
    float dist = dot(p - p0, n);
    if (dist > 0.0) band = j;
    if (abs(dist) < edge) {
      edge = abs(dist);
      normal = n * sign(dist);
    }
  }
  float inner = band < 0.0 ? 0.0 : ringRadius(s, band);
  float outer = ringRadius(s, band + 1.0);
  float mid = 0.5 * (a0 + a1);
  vec2 center = uImpact + vec2(cos(mid), sin(mid)) * 0.5 * (inner + outer);
  return Shard(center, hash12(vec2(sector * 0.731, band * 1.93) + uSeed * 0.53), edge, normal);
}

Shard splits(vec2 p) {
  vec2 c = 0.5 * uResolution;
  float extent = length(uResolution) * 0.5;
  float id = 1.0;
  float edge = 1e9;
  vec2 normal = vec2(0.0, 1.0);
  float angle = hash11(uSeed * 0.13 + 0.3) * PI;
  for (int i = 0; i < 12; i++) {
    if (extent < uShard) break;
    vec3 h = hash32(vec2(id * 0.7183 + 0.37, uSeed * 0.29 + 1.3));
    angle += PI * 0.5 + (h.x - 0.5) * 1.5;
    vec2 n = vec2(cos(angle), sin(angle));
    vec2 o = c + (h.yz - 0.5) * extent * 0.7;
    float d = dot(p - o, n);
    float side = d >= 0.0 ? 1.0 : -1.0;
    id = id * 2.0 + max(side, 0.0);
    if (abs(d) < edge) {
      edge = abs(d);
      normal = n * side;
    }
    c = o + n * side * extent * 0.3;
    extent *= 0.74;
  }
  return Shard(c, hash11(id * 0.1371 + uSeed * 0.77), edge, normal);
}

Shard crackle(vec2 p) {
  vec2 x = p / uShard;
  vec2 n = floor(x);
  vec2 f = fract(x);
  vec2 mg = vec2(0.0);
  vec2 mr = vec2(0.0);
  float md = 8.0;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 r = g + 0.5 + 0.8 * (hash22(n + g + uSeed * 7.1) - 0.5) - f;
      float d = dot(r, r);
      if (d < md) {
        md = d;
        mr = r;
        mg = g;
      }
    }
  }
  md = 8.0;
  vec2 normal = vec2(0.0, 1.0);
  for (int j = -2; j <= 2; j++) {
    for (int i = -2; i <= 2; i++) {
      vec2 g = mg + vec2(float(i), float(j));
      vec2 r = g + 0.5 + 0.8 * (hash22(n + g + uSeed * 7.1) - 0.5) - f;
      vec2 e = r - mr;
      if (dot(e, e) < 1e-5) continue;
      float d = dot(0.5 * (mr + r), normalize(e));
      if (d < md) {
        md = d;
        normal = -normalize(e);
      }
    }
  }
  return Shard((x + mr) * uShard, hash12(n + mg + uSeed * 3.3), md * uShard, normal);
}

void main() {
  vec2 p = vec2(vUv.x, 1.0 - vUv.y) * uResolution;
  Shard sh;
  if (uPattern < 0.5) sh = impact(p);
  else if (uPattern < 1.5) sh = splits(p);
  else sh = crackle(p);

  vec3 h = hash32(vec2(sh.id * 97.1 + 0.3, sh.id * 13.7 + 2.0));
  vec3 g = hash32(vec2(sh.id * 51.3 + 7.0, sh.id * 3.1 + 0.9));
  float phase = h.z * TAU;
  vec2 sway = vec2(sin(uDrift * (0.6 + 0.5 * g.z) + phase), cos(uDrift * (0.5 + 0.4 * h.x) + phase * 1.3));
  float angle = (h.z - 0.5) * 0.08 * uWave + sway.x * 0.012 * uSway;
  vec2 offset = (h.xy - 0.5) * 2.0 * uDisplace + sway * uSway * (uDisplace * 0.35 + uWidth * 2.0);
  float zoom = 1.0 + (g.x - 0.5) * 0.06 * uWave;
  vec2 src = sh.center + rotation(angle) * (p - sh.center) * zoom + offset;

  vec2 tiltXY = (g.xy - 0.5) * 0.9 * uTilt * (uPattern > 1.5 ? 0.4 : 1.0) + sway * 0.08 * uTilt * uSway;
  float near = exp(-sh.edge / (uWidth * 4.0 + 2.0));
  vec2 fringe = (sh.normal * (1.0 + 6.0 * near) + (g.yx - 0.5) * 5.0) * uSpread;
  vec3 color = vec3(photo(src - fringe).r, photo(src).g, photo(src + fringe).b);

  vec3 normal = normalize(vec3(tiltXY, 1.0));
  vec3 L = normalize(vec3(-0.5, -0.65, 0.75));
  float diffuse = dot(normal, L) / L.z;
  color *= max(1.0 + (diffuse - 1.0) * 1.6, 0.2);
  float spec = pow(max(dot(reflect(-L, normal), vec3(0.0, 0.0, 1.0)), 0.0), 90.0);
  color += vec3(spec) * uTilt * 0.7;

  vec2 lightDir = normalize(vec2(-0.6, -0.8));
  float facing = -dot(sh.normal, lightDir);
  float streak = smoothstep(0.25, 0.75, valueNoise(p / (uWidth * 22.0) + sh.id * 7.0));
  float strength = uCracks * mix(0.35, 1.0, streak);
  float centerFade = 1.0;
  if (uPattern < 0.5) centerFade = smoothstep(uRing * 0.12, uRing * 0.45, length(p - uImpact));
  strength *= centerFade;
  float bevel = exp(-sh.edge / (uWidth * 0.9 + 0.6));
  color *= 1.0 + bevel * facing * strength * 0.45;
  float aa = 0.8;
  float core = 1.0 - smoothstep(uWidth * 0.5 - aa, uWidth * 0.5 + aa, sh.edge);
  float shadow = (1.0 - smoothstep(uWidth * 0.5, uWidth * 1.6 + 1.0, sh.edge)) * step(0.0, -facing);
  color *= 1.0 - shadow * strength * 0.35;
  vec3 crack = mix(color, vec3(1.0), 0.7) + 0.12;
  color = mix(color, crack, core * strength);

  if (uPattern < 0.5) {
    float r = length(p - uImpact);
    float crush = 1.0 - smoothstep(uRing * 0.1, uRing * 0.5, r + (valueNoise(p / (uWidth * 3.0)) - 0.5) * uRing * 0.25);
    float flecks = smoothstep(0.55, 0.8, valueNoise(p / max(uWidth * 1.2, 1.0) + uSeed));
    flecks += 0.5 * smoothstep(0.6, 0.9, valueNoise(p / max(uWidth * 3.0, 1.0) + 9.0));
    vec3 powder = mix(color, vec3(0.92), 0.55) + flecks * 0.35;
    color = mix(color, powder, crush * uCracks);
  }

  outColor = vec4(toGamma(color), 1.0);
}`,Cn={impact:0,shards:1,crackle:2},Mn={id:"shatter",name:"Shatter",category:"glass",blend:"normal",description:"The picture cracked into sharp glass shards that shift and catch the light.",animated:!0,animates:e=>e.drift>0,params:[{key:"pattern",label:"Pattern",type:"select",default:"impact",options:[{value:"impact",label:"Impact"},{value:"shards",label:"Shards"},{value:"crackle",label:"Crackle"}]},{key:"x",label:"Impact horizontal",type:"number",min:0,max:1,step:.01,default:.5,when:e=>e.pattern==="impact"},{key:"y",label:"Impact vertical",type:"number",min:0,max:1,step:.01,default:.42,when:e=>e.pattern==="impact"},{key:"size",label:"Shard size",type:"number",min:20,max:200,step:1,default:70},{key:"displacement",label:"Displacement",type:"number",min:0,max:1,step:.01,default:.35},{key:"tilt",label:"Tilt",type:"number",min:0,max:1,step:.01,default:.5},{key:"cracks",label:"Crack lines",type:"number",min:0,max:1,step:.01,default:.7},{key:"dispersion",label:"Rainbow edges",type:"number",min:0,max:1,step:.01,default:.3},{key:"drift",label:"Drift",type:"number",min:0,max:1,step:.01,default:0},{key:"variation",label:"Variação",type:"number",min:0,max:100,step:1,default:0}],render(e,o,t){const a=o.mipmapped?o:e.mipmap(o),l=t.size*e.unit;return e.pass("shatter",Sn,{input:a,uniforms:{uPattern:Cn[t.pattern]??0,uImpact:[t.x*e.width,t.y*e.height],uSpokes:Math.round(Math.min(34,Math.max(8,1100/t.size))),uRing:l*.5,uGrowth:1.42,uShard:t.pattern==="crackle"?l*.24:l*1.4,uDisplace:t.displacement*(t.pattern==="crackle"?10:26)*e.unit,uTilt:t.tilt,uCracks:t.cracks,uWidth:Math.max(1,1.6*e.unit),uSpread:t.dispersion*1.6*e.unit,uDrift:e.time*(.6+t.drift),uSway:t.drift,uWave:t.displacement,uSeed:t.variation}})}},Tn=`
void main() {
  outColor = vec4(toLinear(texture(uInput, vUv).rgb), 1.0);
}`,Ln=`
uniform sampler2D uBack;
uniform sampler2D uSoft;
uniform vec2 uCenter;
uniform float uRadius;
uniform float uIndex;
uniform float uSpread;
uniform float uHighlight;
uniform float uRim;
uniform float uCaustic;
uniform vec3 uTint;
uniform vec3 uLight;

vec2 mirrorUv(vec2 uv) {
  return 1.0 - abs(1.0 - abs(uv));
}

vec3 sharpAt(vec2 p) {
  return toLinear(texture(uInput, mirrorUv(p / uResolution)).rgb);
}

vec3 backAt(vec2 p) {
  return texture(uBack, mirrorUv(p / uResolution)).rgb;
}

vec3 softAt(vec2 p) {
  return texture(uSoft, mirrorUv(p / uResolution)).rgb;
}

float shadowAt(vec2 d, vec2 dir) {
  vec2 s = d + dir * 0.42;
  vec2 a = vec2(dot(s, dir), dot(s, vec2(-dir.y, dir.x)));
  float e = length(a / vec2(1.08, 0.98));
  float ring = smoothstep(0.55, 0.96, e) * (1.0 - smoothstep(0.96, 1.14, e));
  float body = 1.0 - smoothstep(0.8, 1.12, e);
  return ring * 0.5 + body * 0.2;
}

float causticAt(vec2 d, vec2 dir) {
  vec2 s = d + dir * 1.03;
  vec2 a = vec2(dot(s, dir), dot(s, vec2(-dir.y, dir.x)));
  float core = exp(-dot(a * vec2(13.0, 6.5), a * vec2(13.0, 6.5)));
  float halo = exp(-dot(a * vec2(3.6, 2.4), a * vec2(3.6, 2.4)));
  return core * 1.2 + halo * 0.25;
}

vec2 throughBall(vec3 n1, float index) {
  vec3 t1 = refract(vec3(0.0, 0.0, -1.0), n1, 1.0 / index);
  vec3 s2 = n1 + t1 * (-2.0 * dot(n1, t1));
  vec3 t2 = refract(t1, -s2, index);
  if (dot(t2, t2) < 1e-4) t2 = reflect(t1, -s2);
  float depth = 6.0;
  float k = (-depth - s2.z) / min(t2.z, -0.05);
  return s2.xy + t2.xy * k;
}

void main() {
  vec2 p = vUv * uResolution;
  vec2 d = (p - uCenter) / uRadius;
  float r = length(d);
  float aa = 1.5 / uRadius;
  float inside = 1.0 - smoothstep(1.0 - aa, 1.0, r);
  vec2 dir = normalize(uLight.xy);

  vec3 back = backAt(p);
  back *= 1.0 - shadowAt(d, dir) * uCaustic * 0.5;
  back += vec3(1.0, 0.9, 0.72) * causticAt(d, dir) * uCaustic * 1.6;

  vec3 color = back;
  if (r < 1.0) {
    vec2 dd = d / max(r, 1.0);
    float z = sqrt(max(1.0 - dot(dd, dd), 0.0));
    vec3 n1 = vec3(dd, z);
    vec3 refracted;
    if (uSpread > 0.001) {
      vec2 qr = throughBall(n1, uIndex - uSpread);
      vec2 qg = throughBall(n1, uIndex);
      vec2 qb = throughBall(n1, uIndex + uSpread);
      refracted = vec3(
        sharpAt(uCenter + qr * uRadius).r,
        sharpAt(uCenter + qg * uRadius).g,
        sharpAt(uCenter + qb * uRadius).b
      );
    } else {
      refracted = sharpAt(uCenter + throughBall(n1, uIndex) * uRadius);
    }
    float f0 = pow((uIndex - 1.0) / (uIndex + 1.0), 2.0);
    float fresnel = f0 + (1.0 - f0) * pow(1.0 - z, 5.0);
    refracted *= toLinear(uTint) * (1.0 - fresnel) * (1.0 - 0.45 * smoothstep(0.8, 1.0, r));

    vec3 rv = reflect(vec3(0.0, 0.0, -1.0), n1);
    vec3 env = softAt(uCenter + rv.xy * uRadius * 1.6) * 0.9;
    env += vec3(0.25) * smoothstep(-0.2, 0.8, rv.y);
    vec3 reflection = env * fresnel * (0.4 + 1.6 * uRim);

    vec3 L = normalize(uLight);
    float lobe = max(dot(rv, L), 0.0);
    float spec = exp((lobe - 1.0) * 7.0) * 0.35 + exp((lobe - 1.0) * 38.0) * 0.85 + pow(lobe, 1200.0) * 3.0;
    vec2 exitSpot = -dir * 0.78;
    spec += exp(-dot(d - exitSpot, d - exitSpot) * 60.0) * 0.5;
    vec3 highlight = vec3(spec) * uHighlight;

    float rim = smoothstep(0.92, 0.995, r) * (1.0 - smoothstep(0.995, 1.0, r));
    vec3 rimLight = vec3(rim) * uRim * 0.6;

    float side = dot(d / max(r, 1e-4), -dir);
    float arc = smoothstep(0.3, 0.95, side);
    float band = smoothstep(0.8, 0.955, r) * (1.0 - smoothstep(0.96, 0.995, r));
    float haze = smoothstep(0.5, 0.95, r) * 0.22;
    vec3 inner = vec3(1.0, 0.9, 0.75) * arc * arc * (band * 1.3 + haze) * uCaustic;

    vec3 ball = refracted + reflection + highlight + rimLight + inner;
    color = mix(back, ball, inside);
  }

  outColor = vec4(toGamma(color), 1.0);
}`,Un={id:"orb",name:"Glass orb",category:"glass",blend:"normal",description:"A crystal ball that flips the scene inside, with rim light, caustics and rainbow edges.",animated:!0,animates:e=>e.float>0,params:[{key:"size",label:"Tamanho",type:"number",min:.1,max:1.2,step:.01,default:.72},{key:"x",label:"Horizontal",type:"number",min:0,max:1,step:.01,default:.5},{key:"y",label:"Vertical",type:"number",min:0,max:1,step:.01,default:.5},{key:"refraction",label:"Refraction",type:"number",min:0,max:1,step:.01,default:.6},{key:"dispersion",label:"Rainbow edges",type:"number",min:0,max:1,step:.01,default:.45},{key:"highlight",label:"Highlight",type:"number",min:0,max:1,step:.01,default:.6},{key:"rim",label:"Rim light",type:"number",min:0,max:1,step:.01,default:.5},{key:"caustic",label:"Caustic glow",type:"number",min:0,max:1,step:.01,default:.5},{key:"tint",label:"Glass tint",type:"color",default:"#ffffff"},{key:"background",label:"Fundo",type:"select",default:"blurred",options:[{value:"image",label:"Imagem"},{value:"blurred",label:"Blurred"}]},{key:"blur",label:"Background blur",type:"number",min:0,max:1,step:.01,default:.4,when:e=>e.background==="blurred"},{key:"float",label:"Float",type:"number",min:0,max:1,step:.01,default:0}],render(e,o,t){const a=e.pass("orb-linear",Tn,{input:o}),l=E(e,a,14*e.unit),r=t.background==="blurred"&&t.blur>0?E(e,a,(2+30*t.blur)*e.unit):null,i=Math.min(e.width,e.height),n=e.time,u=t.float,c=t.x*e.width+Math.sin(n*.55)*i*.012*u,s=(1-t.y)*e.height+Math.sin(n*.9)*i*.03*u,f=[-.55+Math.sin(n*.35)*.25*u,.65,.55],m=o.mipmapped?o:e.mipmap(o),v=6/(1+(.4+4.1*Math.pow(t.refraction,1.5))),g=2*v/(2*v-1),x=e.pass("orb",Ln,{input:m,textures:{uBack:r||a,uSoft:l},uniforms:{uCenter:[c,s],uRadius:Math.max(2,t.size*i*.5),uIndex:g,uSpread:(g-1)*t.dispersion*.12,uHighlight:t.highlight,uRim:t.rim,uCaustic:t.caustic,uTint:C(t.tint),uLight:f}});return r&&e.release(r),e.release(l),e.release(a),x}},In=`
uniform vec2 uCenter;
uniform vec4 uExtent;
uniform float uShape;
uniform float uRadius;
uniform float uLogScale;
uniform vec2 uBeta;
uniform vec2 uShift;
uniform float uBlend;
uniform float uDepth;
uniform float uSwirl;
uniform float uStretch;

vec2 cmul(vec2 a, vec2 b) {
  return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

float frameNorm(vec2 q) {
  if (uShape < 0.5) return length(q) / uRadius;
  vec2 f = abs(q / vec2(q.x > 0.0 ? uExtent.y : uExtent.x, q.y > 0.0 ? uExtent.w : uExtent.z));
  if (uShape < 1.5) return length(f);
  return max(f.x, f.y);
}

vec3 photo(vec2 q, float lod) {
  vec2 uv = clamp((uCenter + q) / uResolution, 0.0, 1.0);
  return textureLod(uInput, uv, max(lod, 0.0)).rgb;
}

void main() {
  vec2 q = vUv * uResolution - uCenter;
  float r = max(length(q), 1e-3);
  float lr = log(r / uRadius);
  vec2 w = cmul(vec2(lr, atan(q.y, q.x)), uBeta) + uShift;
  w.y -= uSwirl * lr;
  vec2 q2 = exp(w.x) * uRadius * vec2(cos(w.y), sin(w.y));
  float level = log(max(frameNorm(q2), 1e-9)) / uLogScale;
  float k = floor(level) + 1.0;
  float u = level - k + 1.0;
  vec2 q1 = q2 * exp(-k * uLogScale);
  float stretch = uStretch * uRadius * exp(w.x - k * uLogScale) / r;
  float lod = log2(max(stretch, 1e-6));
  vec3 color = photo(q1, lod);
  float aa = 1.5 * length(uBeta) / (r * uLogScale);
  float m = smoothstep(1.0 - max(uBlend, aa), 1.0, u);
  if (m > 0.0) color = mix(color, photo(q1 * exp(-uLogScale), lod - uLogScale / log(2.0)), m);
  float levels = max(0.0, log(uRadius / r) / uLogScale);
  color *= exp(-levels * uDepth * 0.9);
  outColor = vec4(color, 1.0);
}`,zn={circle:0,oval:1,frame:2},An={id:"droste",name:"Droste",category:"distort",blend:"normal",description:"The picture spirals into a smaller copy of itself, again and again, like an Escher print.",animated:!0,animates:e=>e.zoom!==0||e.spin!==0,params:[{key:"shape",label:"Shape",type:"select",default:"circle",options:[{value:"circle",label:"Circle"},{value:"oval",label:"Oval"},{value:"frame",label:"Picture frame"}]},{key:"scale",label:"Ring scale",type:"number",min:1.5,max:10,step:.05,default:2.6},{key:"arms",label:"Spiral arms",type:"number",min:-3,max:3,step:1,default:1},{key:"twist",label:"Twist",type:"number",min:-1,max:2,step:.01,default:1},{key:"repeats",label:"Copies per turn",type:"number",min:1,max:4,step:1,default:1},{key:"x",label:"Horizontal center",type:"number",min:.05,max:.95,step:.01,default:.5},{key:"y",label:"Vertical center",type:"number",min:.05,max:.95,step:.01,default:.5},{key:"rotation",label:"Rotação",type:"number",min:-180,max:180,step:1,default:0},{key:"blend",label:"Seam blend",type:"number",min:0,max:1,step:.01,default:.1},{key:"depth",label:"Depth shade",type:"number",min:0,max:1,step:.01,default:.25},{key:"zoom",label:"Zoom speed",type:"number",min:-1,max:1,step:.01,default:.2},{key:"spin",label:"Spin",type:"number",min:-1,max:1,step:.01,default:0}],render(e,o,t){const a=o.mipmapped?o:e.mipmap(o),l=t.x*e.width,r=(1-t.y)*e.height,i=[l,e.width-l,r,e.height-r],n=Math.log(Math.max(t.scale,1.05)),u=Math.round(t.arms),c=Math.max(1,Math.round(t.repeats)),s=(k,h)=>(k%h+h)%h,p=-s(e.time*t.zoom*n*.35,n),f=s(t.rotation*Math.PI/180+e.time*t.spin*.6,Math.PI*2),m=u*n/(2*Math.PI),d=t.twist*.8*(u<0?-1:1),v=2*c*c+m*m+(m+d)*(m+d),g=c*c+m*(m+d),x=Math.sqrt((v+Math.sqrt(Math.max(v*v-4*g*g,0)))/2);return e.pass("droste",In,{input:a,uniforms:{uCenter:[l,r],uExtent:i,uShape:zn[t.shape]??0,uRadius:Math.max(1,Math.min(...i)),uLogScale:n,uBeta:[c,-m],uShift:[p,f],uBlend:t.blend*.5,uDepth:t.depth,uSwirl:d,uStretch:x}})}},Vt=`
vec4 bspline(sampler2D tex, vec2 uv, vec2 size) {
  vec2 p = uv * size - 0.5;
  vec2 i = floor(p);
  vec2 f = p - i;
  vec2 f2 = f * f;
  vec2 f3 = f2 * f;
  vec2 w0 = (1.0 - 3.0 * f + 3.0 * f2 - f3) / 6.0;
  vec2 w1 = (4.0 - 6.0 * f2 + 3.0 * f3) / 6.0;
  vec2 w2 = (1.0 + 3.0 * f + 3.0 * f2 - 3.0 * f3) / 6.0;
  vec2 w3 = f3 / 6.0;
  vec2 g0 = w0 + w1;
  vec2 g1 = w2 + w3;
  vec2 h0 = (i - 0.5 + w1 / g0) / size;
  vec2 h1 = (i + 1.5 + w3 / g1) / size;
  vec4 a = texture(tex, vec2(h0.x, h0.y));
  vec4 b = texture(tex, vec2(h1.x, h0.y));
  vec4 c = texture(tex, vec2(h0.x, h1.y));
  vec4 d = texture(tex, vec2(h1.x, h1.y));
  return g0.y * (g0.x * a + g1.x * b) + g1.y * (g0.x * c + g1.x * d);
}
`,Rn=`
uniform sampler2D uCoarse;
uniform vec2 uCoarseSize;
uniform sampler2D uStats;
uniform float uStatsTop;
uniform float uDepth;
uniform float uSwell;
uniform float uInvert;
uniform float uTexelUnits;
${Vt}
vec2 moments;

float level(float l) {
  float t = clamp((l - moments.x) / moments.y + 0.5, 0.0, 1.0);
  return mix(t, 1.0 - t, uInvert);
}

float heightAt(vec2 uv) {
  float fine = level(luma(texture(uInput, uv).rgb));
  float broad = level(luma(bspline(uCoarse, uv, uCoarseSize).rgb));
  return fine + broad * uSwell;
}

void main() {
  vec2 stats = textureLod(uStats, vec2(0.5), uStatsTop).rg;
  moments = vec2(stats.x, max(sqrt(max(stats.y - stats.x * stats.x, 0.0)), 0.09) * 3.6);
  vec2 t = 1.0 / uResolution;
  float hx = heightAt(vUv + vec2(t.x, 0.0)) - heightAt(vUv - vec2(t.x, 0.0));
  float hy = heightAt(vUv + vec2(0.0, t.y)) - heightAt(vUv - vec2(0.0, t.y));
  vec2 slope = vec2(hx, hy) * uDepth / (2.0 * uTexelUnits);
  float raw = luma(texture(uInput, vUv).rgb);
  outColor = vec4(slope, mix(raw, 1.0 - raw, uInvert), level(raw));
}`,Dn=`
uniform sampler2D uSlope;
uniform vec2 uSlopeSize;
uniform float uEnv;
uniform vec3 uTint;
uniform vec3 uBackdrop;
uniform float uRough;
uniform float uLight;
uniform float uSpin;
uniform float uColor;
uniform float uTone;
${Vt}
vec3 dirOf(float az, float el) {
  return vec3(cos(el) * cos(az), cos(el) * sin(az), sin(el));
}

float lobe(vec3 r, vec3 axis, float radius, float soft) {
  float angle = degrees(acos(clamp(dot(r, axis), -1.0, 1.0)));
  return 1.0 - smoothstep(radius - soft, radius + soft, angle);
}

float rise(float e, float at, float soft) {
  return smoothstep(at - soft, at + soft, e);
}

float span(float e, float lo, float hi, float soft) {
  return rise(e, lo, soft) * (1.0 - rise(e, hi, soft));
}

float studio(vec3 r, float s) {
  float e = degrees(asin(clamp(r.z, -1.0, 1.0)));
  float az = atan(r.y, r.x);
  float facing = cos(az - uLight);
  float peak = 1.0 / (1.0 + s * 0.06);
  float value = 0.0;
  if (uEnv < 0.5) {
    float side = cos(az - uLight + 2.2);
    value += rise(e, 79.0, s) * 0.2;
    value += span(e, 69.0, 77.0, s) * (0.58 + 0.52 * facing) * peak;
    value += span(e, 59.0, 66.0, s) * 0.03;
    value += span(e, 48.0, 57.0, s) * (0.2 + 1.0 * smoothstep(-0.3, 0.9, side)) * peak;
    value += span(e, 39.0, 46.0, s) * 0.04;
    value += span(e, 13.0, 37.0, s) * (0.3 + 0.26 * facing);
    value += span(e, 2.0, 10.0, s) * (1.3 + 0.6 * facing) * peak;
    value += (1.0 - rise(e, 1.0, s)) * 0.03;
    value += lobe(r, dirOf(uLight, radians(24.0)), 9.0, 3.0 + s) * 1.5 * peak;
    value += lobe(r, dirOf(uLight + 2.4, radians(46.0)), 8.0, 2.0 + s) * 1.3 * peak;
  } else if (uEnv < 1.5) {
    float sky = rise(e, 0.0, s);
    value += sky * mix(1.0, 0.14, smoothstep(0.0, 60.0, e));
    value += span(e, 0.0, 6.0, s) * 2.2 * peak;
    value += (1.0 - sky) * (0.02 + 0.08 * rise(-e, 50.0, 30.0));
    value += lobe(r, dirOf(uLight, radians(50.0)), 6.0, 1.5 + s) * 4.0 * peak;
  } else {
    value += rise(e, 80.0, s) * 0.16;
    value += span(e, 68.0, 77.0, s) * (1.0 + 0.4 * facing) * peak;
    value += span(e, 46.0, 55.0, s) * (0.9 + 0.5 * cos(az - uLight + 2.1)) * peak;
    value += span(e, 24.0, 32.0, s) * (1.3 + 0.6 * facing) * peak;
    value += span(e, 4.0, 10.0, s) * 1.8 * peak;
  }
  return max(value, 0.0);
}

void main() {
  vec4 s = bspline(uSlope, vUv, uSlopeSize);
  vec3 n = normalize(vec3(-s.xy, 1.0));
  vec3 r = vec3(2.0 * n.z * n.xy, 2.0 * n.z * n.z - 1.0);
  r.xy = rotation(uSpin) * r.xy;
  vec3 rx = dFdx(r);
  vec3 ry = dFdy(r);
  float footprint = degrees(sqrt(max(dot(rx, rx), dot(ry, ry))));
  float soft = 2.0 + uRough * 22.0 + footprint * 0.8;
  float env = studio(r, soft);
  float tone = clamp(s.z, 0.0, 1.0);
  float k = mix(1.0, pow(smoothstep(0.03, 0.6, tone), 1.25) * smoothstep(0.04, 0.5, s.w), uTone);
  float intensity = env * k * 1.8;
  vec3 image = textureLod(uInput, vUv, 1.5).rgb;
  vec3 hue = image / max(max(image.r, max(image.g, image.b)), 0.04);
  vec3 tint = toLinear(uTint) * mix(vec3(1.0), toLinear(hue), uColor);
  vec3 base = toLinear(uBackdrop);
  vec3 color = mix(base, tint, 1.0 - exp(-1.6 * intensity));
  float hot = max(intensity - 1.0, 0.0);
  color = mix(color, vec3(1.0), (1.0 - exp(-hot * 0.7)) * 0.7);
  outColor = vec4(toGamma(color), 1.0);
}`,En={studio:0,horizon:1,rings:2},Pn={id:"chrome",name:"Chrome",category:"material",description:"The picture cast in polished liquid chrome that reflects a slowly turning studio.",animated:!0,animates:e=>e.speed>0,params:[{key:"environment",label:"Reflections",type:"select",default:"studio",options:[{value:"studio",label:"Studio"},{value:"horizon",label:"Horizon"},{value:"rings",label:"Ring lights"}]},{key:"tint",label:"Tint",type:"color",default:"#b8c8e6"},{key:"backdrop",label:"Backdrop",type:"color",default:"#171e30"},{key:"roughness",label:"Roughness",type:"number",min:0,max:1,step:.01,default:.2},{key:"depth",label:"Profundidade",type:"number",min:0,max:1,step:.01,default:.5},{key:"detail",label:"Detalhe",type:"number",min:0,max:1,step:.01,default:.45},{key:"tone",label:"Timbre",type:"number",min:0,max:1,step:.01,default:1},{key:"light",label:"Light angle",type:"number",min:0,max:360,step:1,default:135},{key:"color",label:"Image color",type:"number",min:0,max:1,step:.01,default:0},{key:"invert",label:"Invert",type:"boolean",default:!1},{key:"speed",label:"Velocidade",type:"number",min:0,max:2,step:.01,default:.25}],render(e,o,t){const a=o.mipmapped?o:e.mipmap(o),l=(9-7.4*t.detail)*e.unit,r=E(e,a,l,{maxSigma:3}),i=E(e,a,30*e.unit,{maxSigma:6}),n=J(e,a),u=1e3/Math.max(r.width,r.height),c=e.pass("chrome-slope",Rn,{input:r,target:e.target(r.width,r.height),textures:{uCoarse:i,uStats:n.target},uniforms:{uCoarseSize:[i.width,i.height],uStatsTop:n.top,uDepth:10+90*t.depth,uSwell:1.2,uInvert:t.invert?1:0,uTexelUnits:u}});e.release(r),e.release(i),e.release(n.target);const s=e.pass("chrome-shade",Dn,{input:a,textures:{uSlope:c},uniforms:{uSlopeSize:[c.width,c.height],uEnv:En[t.environment]??0,uTint:C(t.tint),uBackdrop:C(t.backdrop),uRough:t.roughness,uLight:t.light*Math.PI/180,uSpin:e.time*t.speed*.35,uColor:t.color,uTone:t.tone}});return e.release(c),s}},Xt=`
uniform float uCell;
uniform float uJitter;
uniform float uSeed;
uniform float uDrift;

const float ROW = 0.8660254;

vec2 seedAt(vec2 c) {
  vec2 h = hash22(c + uSeed * 17.31 + 3.7);
  vec2 o = (h - 0.5) * uJitter * 0.92;
#ifdef DRIFT
  vec2 g = hash22(c * 1.37 + uSeed * 5.13 + 11.1);
  o += vec2(sin(uDrift * (0.6 + g.x) + g.y * TAU), cos(uDrift * (0.5 + g.y) + g.x * TAU)) * 0.22;
#endif
  return vec2(c.x + 0.5 + 0.5 * mod(c.y, 2.0) + o.x, (c.y + 0.5 + o.y) * ROW) * uCell;
}

vec2 baseCell(vec2 p) {
  float jy = floor(p.y / (uCell * ROW));
  float jx = floor(p.x / uCell - 0.5 * mod(jy, 2.0));
  return vec2(jx, jy);
}

vec2 nearestCell(vec2 p) {
  vec2 base = baseCell(p);
  float best = 1e20;
  vec2 cell = base;
  for (int y = -2; y <= 2; y++) {
    for (int x = -2; x <= 2; x++) {
      vec2 c = base + vec2(float(x), float(y));
      vec2 d = p - seedAt(c);
      float dd = dot(d, d);
      if (dd < best) {
        best = dd;
        cell = c;
      }
    }
  }
  return cell;
}
`,qn=`
uniform vec2 uImage;
uniform float uLod;
${Xt}
void main() {
  vec2 c = floor(vUv * uResolution) - 2.0;
  vec2 s = seedAt(c);
  vec3 sum = vec3(0.0);
  float total = 0.0;
  for (int y = -2; y <= 2; y++) {
    for (int x = -2; x <= 2; x++) {
      vec2 p = s + vec2(float(x), float(y)) * uCell * 0.4;
      vec2 n = nearestCell(p);
      if (any(notEqual(n, c))) continue;
      vec2 uv = clamp(p / uImage, 0.0, 1.0);
      sum += textureLod(uInput, uv, uLod).rgb;
      total += 1.0;
    }
  }
  vec3 color = total > 0.0 ? sum / total : textureLod(uInput, clamp(s / uImage, 0.0, 1.0), uLod + 1.0).rgb;
  outColor = vec4(color, 1.0);
}`,Fn=`
uniform sampler2D uCells;
uniform float uFacets;
uniform float uCut;
uniform float uLight;
uniform float uEdges;
uniform vec3 uEdgeColor;
${Xt}
vec3 cellColor(vec2 c) {
  ivec2 size = textureSize(uCells, 0);
  ivec2 t = clamp(ivec2(c + 2.0), ivec2(0), size - 1);
  return texelFetch(uCells, t, 0).rgb;
}

float facetShade(vec2 c, vec2 toEdge) {
  vec3 light = normalize(vec3(cos(uLight), sin(uLight), 0.9));
  vec2 tilt = uCut > 0.5 ? toEdge * 0.55 : (hash22(c * 1.91 + uSeed * 2.7) - 0.5) * 1.3;
  vec3 n = normalize(vec3(tilt, 1.0));
  float lit = dot(n, light) / light.z;
  float glint = pow(max(dot(reflect(-light, n), vec3(0.0, 0.0, 1.0)), 0.0), 24.0);
  return (lit - 1.0) * 0.9 + glint * 0.35;
}

void main() {
  vec2 p = vUv * uResolution;
  vec2 base = baseCell(p);
  float best = 1e20;
  vec2 cell = base;
  vec2 seed = vec2(0.0);
  for (int y = -2; y <= 2; y++) {
    for (int x = -2; x <= 2; x++) {
      vec2 c = base + vec2(float(x), float(y));
      vec2 s = seedAt(c);
      vec2 d = p - s;
      float dd = dot(d, d);
      if (dd < best) {
        best = dd;
        cell = c;
        seed = s;
      }
    }
  }
  float edge = 1e20;
  float edge2 = 1e20;
  vec2 other = cell;
  vec2 dir1 = vec2(0.0);
  vec2 dir2 = vec2(0.0);
  vec2 cellBase = baseCell(seed);
  for (int y = -2; y <= 2; y++) {
    for (int x = -2; x <= 2; x++) {
      vec2 c = cellBase + vec2(float(x), float(y));
      if (all(equal(c, cell))) continue;
      vec2 s = seedAt(c);
      vec2 along = s - seed;
      float len = length(along);
      if (len < 1e-4) continue;
      vec2 dir = along / len;
      float d = dot(0.5 * (seed + s) - p, dir);
      if (d < edge) {
        edge2 = edge;
        dir2 = dir1;
        edge = d;
        dir1 = dir;
        other = c;
      } else if (d < edge2) {
        edge2 = d;
        dir2 = dir;
      }
    }
  }
  float aa = max(fwidth(p.x), 1.0) * 0.75;
  vec3 color = cellColor(cell);
  vec3 neighbor = cellColor(other);
  if (uFacets > 0.0) {
    float ridge = smoothstep(0.0, aa * 2.0, edge2 - edge);
    float shadeA = facetShade(cell, dir1);
    float shadeB = facetShade(cell, dir2);
    float shade = mix(0.5 * (shadeA + shadeB), shadeA, uCut > 0.5 ? ridge : 1.0);
    float shadeN = facetShade(other, -dir1);
    color *= 1.0 + shade * uFacets;
    neighbor *= 1.0 + shadeN * uFacets;
  }
  float blend = clamp(0.5 + edge / aa, 0.0, 1.0);
  color = mix(neighbor, color, blend);
  if (uEdges > 0.0) {
    float width = uEdges * uCell * 0.08;
    float line = 1.0 - smoothstep(width - aa, width + aa, edge);
    color = mix(color, uEdgeColor, line);
  }
  outColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}`,Bn={id:"crystallize",name:"Crystallize",category:"material",description:"Breaks the picture into crystal cells, each filled with the average color of its area.",animated:!0,animates:e=>e.drift>0,preview:{zoom:2},params:[{key:"size",label:"Cell size",type:"number",min:4,max:120,step:.5,default:26},{key:"jitter",label:"Irregularity",type:"number",min:0,max:1,step:.01,default:.85},{key:"facets",label:"Facet shading",type:"number",min:0,max:1,step:.01,default:0},{key:"cut",label:"Facet cut",type:"select",default:"gem",options:[{value:"gem",label:"Cut gem"},{value:"tilted",label:"Tilted plates"}],when:e=>e.facets>0},{key:"light",label:"Light angle",type:"number",min:0,max:360,step:1,default:135,when:e=>e.facets>0},{key:"edges",label:"Edges",type:"number",min:0,max:1,step:.01,default:0},{key:"edgeColor",label:"Edge color",type:"color",default:"#141217",when:e=>e.edges>0},{key:"drift",label:"Drift",type:"number",min:0,max:2,step:.01,default:0},{key:"variation",label:"Variação",type:"number",min:0,max:100,step:1,default:0}],render(e,o,t){const a=o.mipmapped?o:e.mipmap(o),l=Math.max(3,t.size*e.unit),r=l*.8660254,i={uCell:l,uJitter:t.jitter,uSeed:t.variation,uDrift:e.time*t.drift},n=t.drift>0,u=n?`#define DRIFT 1
`:"",c=e.pass(n?"crystallize-cells-drift":"crystallize-cells",u+qn,{input:a,target:e.target(Math.ceil(e.width/l)+6,Math.ceil(e.height/r)+6,{filter:"nearest"}),uniforms:{...i,uImage:[e.width,e.height],uLod:Math.max(0,Math.log2(l*.4))}}),s=e.pass(n?"crystallize-drift":"crystallize",u+Fn,{input:a,textures:{uCells:c},uniforms:{...i,uFacets:t.facets,uCut:t.cut==="tilted"?0:1,uLight:t.light*Math.PI/180,uEdges:t.edges,uEdgeColor:C(t.edgeColor)}});return e.release(c),s}},Gn=`
uniform sampler2D uFine;
uniform sampler2D uBroad;
uniform sampler2D uStats;
uniform float uStatsTop;
uniform float uMaterial;
uniform float uSign;
uniform vec3 uTint;
uniform float uImage;
uniform float uDepth;
uniform float uLight;
uniform float uTexture;
uniform float uShadow;

float spread;

float heightAt(vec2 uv) {
  float fine = luma(texture(uFine, uv).rgb);
  float broad = luma(texture(uBroad, uv).rgb);
  return uSign * (fine - broad) / spread;
}

float grain(vec2 p) {
  if (uMaterial < 0.5) {
    return valueNoise(vec2(p.x * 0.02, p.y * 1.3)) * 0.12 + valueNoise(vec2(p.x * 0.07, p.y * 3.4) + 5.0) * 0.05;
  }
  if (uMaterial < 1.5) {
    return valueNoise(p * 0.5) * 0.22 + valueNoise(rotation(0.7) * p * 1.3 + 7.0) * 0.1 + valueNoise(p * vec2(0.18, 1.5) + 3.0) * 0.06;
  }
  return fbm(p * 0.07) * 2.6 + valueNoise(p * 0.55 + 11.0) * 0.35 + valueNoise(p * 1.7 + 4.0) * 0.12;
}

void main() {
  vec2 moments = textureLod(uStats, vec2(0.5), uStatsTop).rg;
  spread = max(sqrt(max(moments.y - moments.x * moments.x, 0.0)), 0.08) * 4.0;
  vec2 t = 1.0 / uResolution;
  float h = heightAt(vUv);
  float hl = heightAt(vUv - vec2(t.x, 0.0));
  float hr = heightAt(vUv + vec2(t.x, 0.0));
  float hd = heightAt(vUv - vec2(0.0, t.y));
  float hu = heightAt(vUv + vec2(0.0, t.y));
  vec2 slope = vec2(hr - hl, hu - hd) * 0.5 * uDepth;
  slope /= 1.0 + length(slope) * 0.45;
  vec2 p = vUv * uResolution / max(uUnit, 0.25);
  float gx = grain(p + vec2(0.4, 0.0)) - grain(p - vec2(0.4, 0.0));
  float gy = grain(p + vec2(0.0, 0.4)) - grain(p - vec2(0.0, 0.4));
  slope += vec2(gx, gy) / 0.8 * uTexture;
  vec3 n = normalize(vec3(-slope, 1.0));
  float elevation = uMaterial < 0.5 ? 0.62 : 0.72;
  vec3 light = normalize(vec3(cos(uLight) * cos(elevation), sin(uLight) * cos(elevation), sin(elevation)));
  float lambert = max(dot(n, light), 0.0) / light.z;

  vec2 toward = vec2(cos(uLight), sin(uLight)) * t * uUnit * 1.6;
  float occluded = 0.0;
  for (int i = 1; i <= 6; i++) {
    float k = float(i);
    float rise = heightAt(vUv + toward * k) - h;
    occluded = max(occluded, rise * uDepth / (k * uUnit * 1.6) - tan(elevation) * 0.35);
  }
  float shadow = 1.0 - smoothstep(0.0, 0.9, occluded) * uShadow;
  float cavity = clamp((hl + hr + hd + hu - 4.0 * h) * uDepth * 0.35, -1.0, 1.0);

  vec3 base;
  float diffuse;
  float shine;
  float gloss;
  if (uMaterial < 0.5) {
    base = vec3(0.776, 0.792, 0.824);
    diffuse = 0.85;
    shine = 0.55;
    gloss = 34.0;
  } else if (uMaterial < 1.5) {
    base = vec3(0.95, 0.935, 0.905);
    diffuse = 0.8;
    shine = 0.04;
    gloss = 6.0;
  } else {
    base = vec3(0.87, 0.85, 0.82);
    diffuse = 0.9;
    shine = 0.02;
    gloss = 4.0;
  }
  vec3 image = textureLod(uInput, vUv, 0.0).rgb;
  vec3 albedo = mix(base, image, uImage) * uTint;
  vec3 halfway = normalize(light + vec3(0.0, 0.0, 1.0));
  float spec = pow(max(dot(n, halfway), 0.0), gloss) - pow(halfway.z, gloss);
  float lit = 1.0 + (lambert - 1.0) * diffuse;
  lit = lit > 1.0 ? 1.0 + 0.3 * (1.0 - exp((1.0 - lit) / 0.3)) : 0.14 + 0.86 * max(lit, 0.0);
  lit *= shadow;
  lit *= 1.0 - max(cavity, 0.0) * (uMaterial > 1.5 ? 0.35 : 0.15);
  float glint = 0.3 * (1.0 - exp(-max(spec, 0.0) * shine / 0.3));
  vec3 color = albedo * lit + vec3(glint) * shadow;
  outColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}`,Nn={metal:0,paper:1,plaster:2},On={id:"emboss",name:"Emboss",category:"material",blend:"normal",description:"The picture pressed into metal, paper or plaster as raised or sunken relief.",animated:!1,preview:{zoom:2.5,params:{depth:.75}},params:[{key:"material",label:"Material",type:"select",default:"metal",options:[{value:"metal",label:"Metal"},{value:"paper",label:"Paper"},{value:"plaster",label:"Plaster"}]},{key:"direction",label:"Relief",type:"select",default:"raised",options:[{value:"raised",label:"Raised"},{value:"pressed",label:"Pressed in"}]},{key:"tint",label:"Tint",type:"color",default:"#ffffff"},{key:"imageColor",label:"Keep image color",type:"boolean",default:!1},{key:"depth",label:"Profundidade",type:"number",min:0,max:1,step:.01,default:.5},{key:"detail",label:"Detalhe",type:"number",min:0,max:1,step:.01,default:.6},{key:"light",label:"Light angle",type:"number",min:0,max:360,step:1,default:135},{key:"shadow",label:"Shadows",type:"number",min:0,max:1,step:.01,default:.4},{key:"texture",label:"Surface texture",type:"number",min:0,max:1,step:.01,default:.35}],render(e,o,t){const a=o.mipmapped?o:e.mipmap(o),l=(2.6-2.1*t.detail)*e.unit,r=E(e,a,l),i=E(e,a,40*e.unit,{maxSigma:4}),n=J(e,a),u=e.pass("emboss",Gn,{input:a,textures:{uFine:r,uBroad:i,uStats:n.target},uniforms:{uStatsTop:n.top,uMaterial:Nn[t.material]??0,uSign:t.direction==="pressed"?-1:1,uTint:C(t.tint),uImage:t.imageColor?1:0,uDepth:(1.5+22*t.depth)*e.unit,uLight:t.light*Math.PI/180,uTexture:t.texture,uShadow:t.shadow}});return e.release(r),e.release(i),e.release(n.target),u}},Hn=`
uniform vec2 uUnits;
uniform float uScale;
uniform float uSeed;
uniform float uClock;
uniform float uEddies;

float stream(vec2 p) {
  vec2 q = p / uScale;
  float a = valueNoise(q * 0.55 + vec2(uClock * 0.11, -uClock * 0.07) + uSeed * 1.7);
  float b = valueNoise(rotation(1.1) * q * 1.3 + vec2(-uClock * 0.17, uClock * 0.13) + uSeed * 3.1 + 19.0);
  float c = valueNoise(rotation(2.3) * q * 2.9 + vec2(uClock * 0.23, uClock * 0.19) + uSeed * 0.7 + 41.0);
  return (a * 1.0 + b * 0.45 + c * 0.18) * uScale * 0.9;
}

void main() {
  vec2 p = vUv * uUnits;
  float e = uScale * 0.04;
  float dx = stream(p + vec2(e, 0.0)) - stream(p - vec2(e, 0.0));
  float dy = stream(p + vec2(0.0, e)) - stream(p - vec2(0.0, e));
  vec2 v = vec2(dy, -dx) / (2.0 * e);
  float cell = uScale * 1.15;
  vec2 base = floor(p / cell);
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 c = base + vec2(float(x), float(y));
      vec3 h = hash32(c + uSeed * 7.13);
      if (h.z < 0.25) continue;
      vec2 wobble = vec2(sin(uClock * 0.21 + h.x * TAU), cos(uClock * 0.17 + h.y * TAU)) * 0.12;
      vec2 center = (c + 0.2 + h.xy * 0.6 + wobble) * cell;
      float radius = cell * (0.16 + 0.26 * fract(h.x * 7.31 + h.y * 3.17));
      float spin = (fract(h.z * 13.7) < 0.5 ? -1.0 : 1.0) * mix(0.6, 1.0, fract(h.y * 5.9));
      vec2 d = p - center;
      v += uEddies * spin * vec2(-d.y, d.x) / radius * exp(-dot(d, d) / (radius * radius)) * 3.2;
    }
  }
  outColor = vec4(v, 0.0, 1.0);
}`,Wn=`
uniform sampler2D uFlow;
uniform vec2 uUnits;
uniform float uStep;
uniform float uGrain;

vec2 velocity(vec2 p) {
  return texture(uFlow, p / uUnits).xy;
}

float streakAlong(vec2 p, float dir) {
  float sum = 0.0;
  vec2 q = p;
  for (int i = 1; i <= 10; i++) {
    vec2 v = velocity(q);
    q += dir * v / max(length(v), 1e-4) * uGrain * 0.8;
    float w = 1.0 - float(i) / 11.0;
    sum += (valueNoise(q / uGrain) - 0.5) * w;
  }
  return sum;
}

void main() {
  vec2 p = vUv * uUnits;
  vec2 q = p;
  for (int i = 0; i < 24; i++) {
    vec2 mid = q - velocity(q) * uStep * 0.5;
    q -= velocity(mid) * uStep;
  }
  float streak = (valueNoise(p / uGrain) - 0.5) + streakAlong(p, 1.0) + streakAlong(p, -1.0);
  outColor = vec4((q - p) / uUnits, clamp(0.5 + streak * 0.42, 0.0, 1.0), 1.0);
}`,jn=`
uniform sampler2D uAdvect;
uniform vec2 uUnits;
uniform float uMode;
uniform vec3 uStone;
uniform vec3 uVein;
uniform float uVeins;
uniform float uDensity;
uniform float uPolish;
uniform float uSeed;
uniform float uScale;
uniform float uLod;
uniform vec2 uAdvectSize;

vec2 mirrorUv(vec2 uv) {
  return 1.0 - abs(1.0 - mod(uv, 2.0));
}

float lines(float v, float width) {
  float d = abs(fract(v + 0.5) - 0.5);
  float w = fwidth(v) + 1e-5;
  float wide = max(width, w * 0.9);
  float fade = 1.0 - smoothstep(0.18, 0.4, w);
  float line = exp(-d * d / (wide * wide) * 1.6) * (width / wide);
  return line * fade + width * 1.6 * (1.0 - fade);
}

float smoothNoise(vec2 p) {
  return valueNoise(p) * 0.65 + valueNoise(rotation(0.9) * p * 2.1 + 7.3) * 0.35;
}

void main() {
  vec4 adv = texture(uAdvect, vUv);
  vec2 uv = vUv + adv.xy;
  vec2 q = uv * uUnits;
  vec2 muv = mirrorUv(uv);
  vec3 color = textureLod(uInput, muv, 0.6).rgb;
  float soft = luma(textureLod(uInput, muv, uLod).rgb);
  float wander = smoothNoise(q / (uScale * 0.45) + uSeed * 2.3);
  float field = soft * mix(2.0, 12.0, uDensity) + wander * mix(0.8, 3.2, uDensity);
  float major = lines(field, 0.045 + 0.03 * smoothNoise(q / (uScale * 0.18) + 5.0));
  float minor = lines(field * 2.618 + 0.37, 0.022) * 0.4;
  float vein = clamp(major + minor, 0.0, 1.0);
  float stripes = adv.z;

  vec3 base;
  if (uMode < 0.5) {
    vec3 c = mix(vec3(luma(color)), color, 1.25);
    base = clamp((c - 0.5) * 1.15 + 0.5, 0.0, 1.0);
    base *= 1.0 + (stripes - 0.5) * 0.44 * uVeins;
  } else {
    float cloud = smoothstep(0.05, 0.95, soft) * 0.75 + (wander - 0.5) * 0.6;
    base = uStone * (0.7 + 0.6 * cloud);
    base = mix(base, mix(uStone, uVein, 0.28), smoothstep(0.5, 1.0, cloud) * 0.55);
    base *= 1.0 + (stripes - 0.5) * 0.12 * uVeins * 2.0;
  }
  float reach = uMode < 0.5 ? 0.18 + 0.82 * smoothstep(0.02, 0.45, luma(base)) : 1.0;
  vec3 marble = mix(base, uVein, vein * uVeins * reach);

  vec2 at = 1.0 / uAdvectSize;
  float sx = texture(uAdvect, vUv + vec2(at.x, 0.0)).z - texture(uAdvect, vUv - vec2(at.x, 0.0)).z;
  float sy = texture(uAdvect, vUv + vec2(0.0, at.y)).z - texture(uAdvect, vUv - vec2(0.0, at.y)).z;
  vec2 grad = vec2(sx, sy) * 2.2 + vec2(dFdx(vein), dFdy(vein)) * 0.5;
  vec3 n = normalize(vec3(-grad, 1.0));
  vec3 light = normalize(vec3(-0.5, 0.6, 0.62));
  vec3 h = normalize(light + vec3(0.0, 0.0, 1.0));
  float glint = max(pow(max(dot(n, h), 0.0), 36.0) - pow(h.z, 36.0), 0.0);
  vec3 tone3 = vec3(luma(marble));
  vec3 deep = pow(mix(tone3, marble, 1.0 + uPolish * 0.25), vec3(1.0 + uPolish * 0.45));
  vec3 finish = mix(marble, deep, uPolish);
  finish += vec3(glint) * uPolish * 0.9;
  outColor = vec4(clamp(finish, 0.0, 1.0), 1.0);
}`,_n={id:"marble",name:"Marble",category:"material",blend:"normal",description:"Swirls the picture into polished marble with veins that follow its tones.",animated:!0,animates:e=>e.speed>0,params:[{key:"colors",label:"Cores",type:"select",default:"image",options:[{value:"image",label:"Image colors"},{value:"stone",label:"Stone"}]},{key:"stone",label:"Stone color",type:"color",default:"#1d1b21",when:e=>e.colors==="stone"},{key:"vein",label:"Vein color",type:"color",default:"#f4eee6"},{key:"veins",label:"Veins",type:"number",min:0,max:1,step:.01,default:.5},{key:"density",label:"Vein density",type:"number",min:0,max:1,step:.01,default:.45},{key:"swirl",label:"Swirl",type:"number",min:0,max:1,step:.01,default:.42},{key:"scale",label:"Swirl size",type:"number",min:0,max:1,step:.01,default:.3},{key:"polish",label:"Polish",type:"number",min:0,max:1,step:.01,default:.5},{key:"speed",label:"Flow speed",type:"number",min:0,max:1,step:.01,default:.2},{key:"variation",label:"Variação",type:"number",min:0,max:100,step:1,default:0}],render(e,o,t){const a=o.mipmapped?o:e.mipmap(o),l=[e.width/e.unit,e.height/e.unit],r=50+250*t.scale,i=e.time*t.speed*1.2,n=Math.min(1,384/Math.max(e.width,e.height)),u=e.pass("marble-flow",Hn,{target:e.target(Math.max(8,e.width*n),Math.max(8,e.height*n)),uniforms:{uUnits:l,uScale:r,uSeed:t.variation,uClock:i,uEddies:1}}),c=Math.min(1,1024/Math.max(e.width,e.height)),s=e.pass("marble-advect",Wn,{target:e.target(Math.max(8,e.width*c),Math.max(8,e.height*c)),textures:{uFlow:u},uniforms:{uUnits:l,uStep:t.swirl*r*1.6/24,uGrain:4.6-3.2*t.density}});e.release(u);const p=e.pass("marble",jn,{input:a,textures:{uAdvect:s},uniforms:{uUnits:l,uMode:t.colors==="stone"?1:0,uStone:C(t.stone),uVein:C(t.vein),uVeins:t.veins,uDensity:t.density,uPolish:t.polish,uSeed:t.variation,uScale:r,uLod:Math.max(0,Math.log2(5*e.unit)),uAdvectSize:[s.width,s.height]}});return e.release(s),p}},Tt={iron:["#090202","#2a0806","#5c160c","#9a3418","#cf5a2a","#f39a3f","#ffd77a","#fffbe0"],gold:["#0a0503","#2b1205","#5e300b","#9a5c16","#d18f27","#f2bd45","#ffe48c","#fffcea"],copper:["#0a0303","#2c0a09","#621a14","#a03224","#d6563a","#f58a62","#ffc3a6","#fff4ec"]},Yt=`
uniform sampler2D uStats;
uniform float uStatsTop;
uniform vec2 uUnits;
uniform float uHeat;
uniform float uCrust;
uniform float uFlow;
uniform float uSize;
uniform float uClock;
uniform vec3 uRamp[8];

float noise2(vec2 p) {
  return valueNoise(p) * 0.6 + valueNoise(rotation(0.8) * p * 2.03 + 17.0) * 0.28 + valueNoise(rotation(1.9) * p * 4.1 + 31.0) * 0.12;
}

vec2 flowOffset(vec2 q) {
  vec2 a = vec2(noise2(q / (uSize * 2.2) + vec2(uClock * 0.09, -uClock * 0.05)), noise2(q / (uSize * 2.2) + vec2(5.2 - uClock * 0.07, 1.3 + uClock * 0.06)));
  return (a - 0.5) * uSize * 1.6 * uFlow;
}

float level(float l) {
  vec2 moments = textureLod(uStats, vec2(0.5), uStatsTop).rg;
  float spread = max(sqrt(max(moments.y - moments.x * moments.x, 0.0)), 0.08);
  return clamp((l - moments.x) / (spread * 3.8) + 0.5, 0.0, 1.0);
}

vec3 ramp(float t) {
  float x = clamp(t, 0.0, 1.0) * 7.0;
  float i = floor(x);
  float f = smoothstep(0.0, 1.0, x - i);
  vec3 a = uRamp[0];
  vec3 b = uRamp[0];
  for (int k = 0; k < 8; k++) {
    if (float(k) == i) a = uRamp[k];
    if (float(k) == min(i + 1.0, 7.0)) b = uRamp[k];
  }
  return mix(a, b, f);
}

vec4 heatAt(vec2 uv, float lod) {
  vec2 q = uv * uUnits;
  vec2 warped = uv + flowOffset(q) / uUnits;
  float l = luma(textureLod(uInput, clamp(warped, 0.0, 1.0), lod).rgb);
  float tone = mix(level(l), smoothstep(0.0, 0.85, l), 0.45);
  float t = tone * 0.9 + (uHeat - 0.5) * 0.7 + 0.05;
  vec2 drift = vec2(uClock * 0.035, -uClock * 0.05);
  vec2 cq = (q + flowOffset(q * 1.7) * 0.6) / uSize + drift;
  float mottle = noise2(cq + 3.0) * 0.62 + noise2(cq * 2.7 + 11.0) * 0.26 + valueNoise(cq * 7.3 + 23.0) * 0.12;
  float cool = smoothstep(0.75, 0.25, t);
  float c = mottle + cool * 0.3 - 0.2;
  float live = smoothstep(0.18, 0.42, t);
  float crust = smoothstep(0.5, 0.6, c) * uCrust * live;
  float seam = (smoothstep(0.43, 0.5, c) - smoothstep(0.5, 0.6, c)) * uCrust * live;
  return vec4(t, crust, max(seam, 0.0), tone);
}
`,$n=`
${Yt}
void main() {
  vec4 h = heatAt(vUv, 1.5);
  float t = h.x - h.y * 0.35;
  vec3 hot = ramp(t) * smoothstep(0.4, 0.9, t);
  outColor = vec4(hot, t);
}`,Vn=`
${Yt}
uniform sampler2D uEmit;
uniform sampler2D uGlow;
uniform vec2 uEmitSize;
uniform float uGrain;
uniform float uGlowAmount;
uniform float uShine;

vec4 bspline(sampler2D tex, vec2 uv, vec2 size) {
  vec2 p = uv * size - 0.5;
  vec2 i = floor(p);
  vec2 f = p - i;
  vec2 f2 = f * f;
  vec2 f3 = f2 * f;
  vec2 w0 = (1.0 - 3.0 * f + 3.0 * f2 - f3) / 6.0;
  vec2 w1 = (4.0 - 6.0 * f2 + 3.0 * f3) / 6.0;
  vec2 w2 = (1.0 + 3.0 * f + 3.0 * f2 - 3.0 * f3) / 6.0;
  vec2 w3 = f3 / 6.0;
  vec2 g0 = w0 + w1;
  vec2 g1 = w2 + w3;
  vec2 h0 = (i - 0.5 + w1 / g0) / size;
  vec2 h1 = (i + 1.5 + w3 / g1) / size;
  return g0.y * (g0.x * texture(tex, vec2(h0.x, h0.y)) + g1.x * texture(tex, vec2(h1.x, h0.y)))
    + g1.y * (g0.x * texture(tex, vec2(h0.x, h1.y)) + g1.x * texture(tex, vec2(h1.x, h1.y)));
}

void main() {
  vec4 h = heatAt(vUv, 0.0);
  vec2 q = vUv * uUnits;
  vec2 g = q + flowOffset(q) * 0.5;
  float speck = valueNoise(g * 0.42) * 0.5 + valueNoise(g * 0.95 + 9.0) * 0.3 + valueNoise(g * 2.1 + 5.0) * 0.2;
  float pits = smoothstep(0.6, 0.8, valueNoise(g * 0.22 + 21.0) * 0.5 + speck * 0.5);
  float t = h.x;
  t -= h.y * (0.3 + 0.2 * speck);
  t += (speck - 0.5) * uGrain * 0.3 - pits * uGrain * 0.18 * smoothstep(0.3, 0.8, t);
  t += h.z * 0.12;
  vec3 color = ramp(t);
  color = mix(color, color * vec3(0.6, 0.52, 0.5), h.y * 0.3);

  vec2 texel = 1.0 / uEmitSize;
  float hl = bspline(uEmit, vUv - vec2(texel.x, 0.0), uEmitSize).a;
  float hr = bspline(uEmit, vUv + vec2(texel.x, 0.0), uEmitSize).a;
  float hd = bspline(uEmit, vUv - vec2(0.0, texel.y), uEmitSize).a;
  float hu = bspline(uEmit, vUv + vec2(0.0, texel.y), uEmitSize).a;
  vec2 slope = vec2(hr - hl, hu - hd) * 0.5 / (texel * uUnits) * 24.0;
  slope /= 1.0 + length(slope) * 0.3;
  vec3 n = normalize(vec3(-slope, 1.0));
  vec3 light = normalize(vec3(-0.5, 0.6, 0.62));
  vec3 halfway = normalize(light + vec3(0.0, 0.0, 1.0));
  float spec = pow(max(dot(n, halfway), 0.0), 14.0) - pow(halfway.z, 14.0);
  float dim = pow(max(dot(n, halfway), 0.0), 2.0) - pow(halfway.z, 2.0);
  float sheen = max(spec, 0.0) * uShine * (1.0 - h.y * 0.6);
  color *= 1.0 + min(dim, 0.0) * uShine * 1.2;
  color += ramp(clamp(t + 0.4, 0.0, 1.0)) * sheen * 1.4;

  vec3 glow = texture(uGlow, vUv).rgb;
  color = 1.0 - (1.0 - color) * exp(-glow * uGlowAmount * 4.5);
  outColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}`,Xn={id:"molten",name:"Molten metal",category:"material",description:"The picture poured in glowing liquid alloy, from white-hot to a cooling crust.",animated:!0,animates:e=>e.speed>0,params:[{key:"alloy",label:"Alloy",type:"select",default:"iron",options:[{value:"iron",label:"Iron"},{value:"gold",label:"Gold"},{value:"copper",label:"Copper"}]},{key:"heat",label:"Heat",type:"number",min:0,max:1,step:.01,default:.42},{key:"crust",label:"Crust",type:"number",min:0,max:1,step:.01,default:.45},{key:"size",label:"Crust size",type:"number",min:0,max:1,step:.01,default:.22},{key:"grain",label:"Grain",type:"number",min:0,max:1,step:.01,default:.5},{key:"glow",label:"Glow",type:"number",min:0,max:1,step:.01,default:.35},{key:"shine",label:"Shine",type:"number",min:0,max:1,step:.01,default:.4},{key:"flow",label:"Flow",type:"number",min:0,max:1,step:.01,default:.4},{key:"speed",label:"Velocidade",type:"number",min:0,max:2,step:.01,default:.3}],render(e,o,t){const a=o.mipmapped?o:e.mipmap(o),l=J(e,a),r=(Tt[t.alloy]||Tt.iron).map(C),i={uStatsTop:l.top,uUnits:[e.width/e.unit,e.height/e.unit],uHeat:t.heat,uCrust:t.crust,uFlow:t.flow,uSize:14+70*t.size,uClock:e.time*t.speed*2,uRamp:r},n=e.pass("molten-emit",$n,{input:a,target:e.target(Math.max(8,e.width/2),Math.max(8,e.height/2)),textures:{uStats:l.target},uniforms:i}),u=E(e,n,16*e.unit,{maxSigma:4}),c=e.pass("molten",Vn,{input:a,textures:{uStats:l.target,uEmit:n,uGlow:u},uniforms:{...i,uEmitSize:[n.width,n.height],uGrain:t.grain,uGlowAmount:t.glow,uShine:t.shine}});return e.release(n),e.release(u),e.release(l.target),c}},Re=768,Kt=3e3,pe=(e,o,t,a)=>{const l=e<o?t:a;return Math.exp(-.5*(e-o)*(e-o)/(l*l))},Yn=e=>[1.056*pe(e,599.8,37.9,31)+.362*pe(e,442,16,26.7)-.065*pe(e,501.1,20.4,26.2),.821*pe(e,568.8,46.9,40.5)+.286*pe(e,530.9,16.3,31.1),1.217*pe(e,437,11.8,36)+.681*pe(e,459,26,13.8)],Kn=([e,o,t])=>[3.2406*e-1.5372*o-.4986*t,-.9689*e+1.8758*o+.0415*t,.0557*e-.204*o+1.057*t];function Zn(){const e=[];for(let l=380;l<=780;l+=4)e.push([l,Yn(l)]);const o=l=>{const r=[0,0,0];return e.forEach(([i,n])=>{const u=l(i);r[0]+=u*n[0],r[1]+=u*n[1],r[2]+=u*n[2]}),Kn(r)},t=o(()=>1),a=new Uint8Array(Re*4);for(let l=0;l<Re;l+=1){const r=l/(Re-1)*Kt,i=o(n=>.5-.5*Math.cos(2*Math.PI*r/n));for(let n=0;n<3;n+=1){const u=Math.min(1,Math.max(0,i[n]/t[n]));a[l*4+n]=Math.round(Math.pow(u,1/2.2)*255)}a[l*4+3]=255}return a}const Jn=`
uniform sampler2D uSoft;
uniform sampler2D uStats;
uniform float uStatsTop;
uniform vec2 uSoftSize;
uniform vec2 uUnits;
uniform float uBase;
uniform float uSpread;
uniform float uEdges;
uniform float uSwirl;
uniform float uScale;
uniform float uClock;
uniform float uSeed;

vec4 bspline(sampler2D tex, vec2 uv, vec2 size) {
  vec2 p = uv * size - 0.5;
  vec2 i = floor(p);
  vec2 f = p - i;
  vec2 f2 = f * f;
  vec2 f3 = f2 * f;
  vec2 w0 = (1.0 - 3.0 * f + 3.0 * f2 - f3) / 6.0;
  vec2 w1 = (4.0 - 6.0 * f2 + 3.0 * f3) / 6.0;
  vec2 w2 = (1.0 + 3.0 * f + 3.0 * f2 - 3.0 * f3) / 6.0;
  vec2 w3 = f3 / 6.0;
  vec2 g0 = w0 + w1;
  vec2 g1 = w2 + w3;
  vec2 h0 = (i - 0.5 + w1 / g0) / size;
  vec2 h1 = (i + 1.5 + w3 / g1) / size;
  return g0.y * (g0.x * texture(tex, vec2(h0.x, h0.y)) + g1.x * texture(tex, vec2(h1.x, h0.y)))
    + g1.y * (g0.x * texture(tex, vec2(h0.x, h1.y)) + g1.x * texture(tex, vec2(h1.x, h1.y)));
}

float level(float l) {
  vec2 moments = textureLod(uStats, vec2(0.5), uStatsTop).rg;
  float spread = max(sqrt(max(moments.y - moments.x * moments.x, 0.0)), 0.08);
  return clamp((l - moments.x) / (spread * 3.8) + 0.5, 0.0, 1.0);
}

float toneAt(vec2 uv) {
  return level(luma(bspline(uSoft, uv, uSoftSize).rgb));
}

void main() {
  vec2 q = vUv * uUnits;
  vec2 texel = 1.0 / uResolution;
  float t = toneAt(vUv);
  float tx = toneAt(vUv + vec2(texel.x, 0.0)) - toneAt(vUv - vec2(texel.x, 0.0));
  float ty = toneAt(vUv + vec2(0.0, texel.y)) - toneAt(vUv - vec2(0.0, texel.y));
  float slope = length(vec2(tx, ty) / (2.0 * texel * uUnits));
  vec2 p = q / uScale + uSeed * 3.17;
  vec2 warp = vec2(fbm(p * 0.7 + vec2(uClock * 0.11, -uClock * 0.08)), fbm(p * 0.7 + vec2(4.7 - uClock * 0.07, 2.1 + uClock * 0.1)));
  float swirl = fbm(p + warp * 2.4 + vec2(-uClock * 0.05, uClock * 0.06));
  float path = uBase + t * uSpread - min(slope * 28.0, 1.6) * uEdges + (swirl - 0.5) * uSwirl;
  outColor = vec4(path, t, 0.0, 1.0);
}`,Qn=`
uniform sampler2D uField;
uniform sampler2D uTable;
uniform float uMaxPath;
uniform float uFilm;
uniform float uStrength;

vec3 film(float path) {
  float x = clamp(path / uMaxPath, 0.0, 1.0);
  return toLinear(texture(uTable, vec2(x, 0.5)).rgb);
}

void main() {
  vec4 field = texture(uField, vUv);
  vec3 image = texture(uInput, vUv).rgb;
  vec3 linear = toLinear(image);
  float lum = luma(linear);
  vec3 sheen = film(field.x);
  vec3 color;
  if (uFilm < 0.5) {
    float body = pow(lum, 0.85);
    color = sheen * (0.06 + body * 1.12);
    color = color / (1.0 + max(color.r, max(color.g, color.b)) * 0.35) * 1.3;
  } else {
    color = linear * 0.78 + sheen * (0.22 + 0.25 * (1.0 - lum));
  }
  color = mix(linear, color, uStrength);
  outColor = vec4(toGamma(clamp(color, 0.0, 1.0)), 1.0);
}`,eu={id:"thinfilm",name:"Thin film",category:"material",description:"Oil-slick or soap-bubble interference colors that follow the brightness and edges of the picture.",animated:!0,animates:e=>e.speed>0,params:[{key:"film",label:"Film",type:"select",default:"oil",options:[{value:"oil",label:"Oil slick"},{value:"soap",label:"Soap bubble"}]},{key:"strength",label:"Strength",type:"number",min:0,max:1,step:.01,default:1},{key:"thickness",label:"Thickness",type:"number",min:0,max:1,step:.01,default:.73},{key:"spread",label:"Color bands",type:"number",min:0,max:1,step:.01,default:.25},{key:"edges",label:"Edge rings",type:"number",min:0,max:1,step:.01,default:.5},{key:"swirl",label:"Swirl",type:"number",min:0,max:1,step:.01,default:.5},{key:"scale",label:"Swirl size",type:"number",min:0,max:1,step:.01,default:.5},{key:"speed",label:"Shimmer",type:"number",min:0,max:2,step:.01,default:.3},{key:"variation",label:"Variação",type:"number",min:0,max:100,step:1,default:0}],render(e,o,t){const a=e.shared("thinfilm-table",p=>({texture:p.createTexture(Re,1,{float:!1,filter:"linear",data:Zn()})})),l=o.mipmapped?o:e.mipmap(o),r=E(e,l,2.5*e.unit,{maxSigma:3}),i=J(e,l),n=Math.min(1,1024/Math.max(e.width,e.height)),u=t.film==="soap",c=e.pass("thinfilm-field",Jn,{target:e.target(Math.max(8,e.width*n),Math.max(8,e.height*n)),textures:{uSoft:r,uStats:i.target},uniforms:{uStatsTop:i.top,uSoftSize:[r.width,r.height],uUnits:[e.width/e.unit,e.height/e.unit],uBase:(u?60:200)+t.thickness*1300,uSpread:t.spread*900,uEdges:t.edges*420,uSwirl:t.swirl*1100,uScale:60+t.scale*340,uClock:e.time*t.speed,uSeed:t.variation}});e.release(r),e.release(i.target);const s=e.pass("thinfilm",Qn,{input:o,textures:{uField:c,uTable:a},uniforms:{uMaxPath:Kt,uFilm:u?1:0,uStrength:t.strength}});return e.release(c),s}},Zt=`
vec3 tap(vec2 offset) {
  return texture(uInput, vUv + offset / uResolution).rgb;
}

void main() {
  float tl = luma(tap(vec2(-1.0, 1.0)));
  float tc = luma(tap(vec2(0.0, 1.0)));
  float tr = luma(tap(vec2(1.0, 1.0)));
  float ml = luma(tap(vec2(-1.0, 0.0)));
  float mr = luma(tap(vec2(1.0, 0.0)));
  float bl = luma(tap(vec2(-1.0, -1.0)));
  float bc = luma(tap(vec2(0.0, -1.0)));
  float br = luma(tap(vec2(1.0, -1.0)));
  float gx = (tr + 2.0 * mr + br - tl - 2.0 * ml - bl) * 0.25;
  float gy = (tl + 2.0 * tc + tr - bl - 2.0 * bc - br) * 0.25;
  outColor = vec4(gx * gx, gx * gy, gy * gy, 1.0);
}`,tu=`
uniform float uLod;

void main() {
  outColor = vec4(textureLod(uInput, vUv, uLod).rgb, 1.0);
}`,ou=`
uniform vec2 uStep;

void main() {
  vec3 sum = texture(uInput, vUv).rgb * 0.2270270270;
  sum += (texture(uInput, vUv + uStep * 1.3846153846).rgb + texture(uInput, vUv - uStep * 1.3846153846).rgb) * 0.3162162162;
  sum += (texture(uInput, vUv + uStep * 3.2307692308).rgb + texture(uInput, vUv - uStep * 3.2307692308).rgb) * 0.0702702703;
  outColor = vec4(sum, 1.0);
}`,au=`
vec3 lab(vec2 offset) {
  return toOklab(texture(uInput, vUv + offset / uResolution).rgb) * vec3(1.0, 1.6, 1.6);
}

void main() {
  float h = 1.0;
  vec3 gx = (lab(vec2(h, 0.0)) - lab(vec2(-h, 0.0))) * 0.5;
  vec3 gy = (lab(vec2(0.0, h)) - lab(vec2(0.0, -h))) * 0.5;
  float e = dot(gx, gx);
  float f = dot(gx, gy);
  float g = dot(gy, gy);
  float root = sqrt(max((e - g) * (e - g) + 4.0 * f * f, 0.0));
  float major = 0.5 * (e + g + root);
  vec2 a = vec2(f, major - e);
  vec2 b = vec2(major - g, f);
  vec2 n = dot(a, a) > dot(b, b) ? a : b;
  n = dot(n, n) > 1e-14 ? normalize(n) : vec2(1.0, 0.0);
  float m = sqrt(major) * uUnit;
  outColor = vec4(n, m, 1.0);
}`,lu=`
uniform sampler2D uWide;
uniform sampler2D uCoarse;
uniform float uThreshold;
uniform float uGain;
uniform float uGate;
uniform vec2 uStep;

void main() {
  vec3 s = texture(uInput, vUv).rgb;
  vec3 w = texture(uWide, vUv).rgb;
  float d = luma(w) - luma(s);
  float fine = clamp((d - uThreshold) * uGain, 0.0, 1.0);

  vec3 c = texture(uCoarse, vUv).rgb;
  vec2 n = c.xy;
  float m0 = c.z;
  float mp = texture(uCoarse, vUv + n * uStep).z;
  float mn = texture(uCoarse, vUv - n * uStep).z;
  float d1 = (mp - mn) * 0.5;
  float d2 = mp + mn - 2.0 * m0;
  float x = d2 < 0.0 ? abs(d1 / d2) : 9.0;
  float line = 1.0 - smoothstep(0.3, 0.75, x);
  line *= smoothstep(uGate * 0.6, uGate * 6.0, m0);
  outColor = vec4(fine, line, 0.0, 1.0);
}`,Jt=`
vec3 orient(vec3 t) {
  float root = sqrt(max((t.x - t.z) * (t.x - t.z) + 4.0 * t.y * t.y, 0.0));
  float major = 0.5 * (t.x + t.z + root);
  float minor = 0.5 * (t.x + t.z - root);
  vec2 a = vec2(major - t.x, -t.y);
  vec2 b = vec2(-t.y, major - t.z);
  vec2 dir = dot(a, a) > dot(b, b) ? a : b;
  dir = dot(dir, dir) > 1e-14 ? normalize(dir) : vec2(1.0, 0.0);
  float coherence = (major - minor) / max(major + minor, 1e-7);
  return vec3(dir, coherence);
}
`,ru=`
uniform sampler2D uDir;
uniform sampler2D uCoarse;
uniform float uReach;
uniform float uCoarseReach;
uniform float uBoil;
uniform float uSeed;
${Jt}

float traceFine(vec2 uv, vec2 dir, vec2 texel) {
  float sum = 0.0;
  float total = 0.0;
  for (int i = -6; i <= 6; i++) {
    float k = float(i) / 6.0;
    float w = 1.0 - k * k * 0.7;
    sum += texture(uInput, uv + dir * k * uReach * texel).r * w;
    total += w;
  }
  return sum / total;
}

float traceCoarse(vec2 uv, vec2 dir, vec2 texel) {
  float sum = 0.0;
  float total = 0.0;
  for (int i = -5; i <= 5; i++) {
    float k = float(i) / 5.0;
    float w = 1.0 - k * k * 0.6;
    sum += texture(uInput, uv + dir * k * uCoarseReach * texel).g * w;
    total += w;
  }
  return sum / total;
}

void main() {
  vec2 texel = 1.0 / uResolution;
  vec2 p = vUv * uResolution / uUnit;
  vec2 uv = vUv;
  if (uBoil > 0.0) {
    vec2 n = vec2(valueNoise(p * 0.05 + uSeed), valueNoise(p * 0.05 + uSeed + 19.7)) - 0.5;
    uv += n * uBoil * 2.4 * uUnit * texel;
  }
  vec3 o = orient(texture(uDir, uv).rgb);
  vec2 dir = o.xy;
  float jitter = (valueNoise(p * 0.02 + 3.1 + uSeed * uBoil * 0.37) - 0.5) * 0.14;
  vec2 side = vec2(-dir.y, dir.x) * 0.4 * uUnit * texel;
  float a = traceFine(uv + side, rotation(jitter + 0.03) * dir, texel);
  float b = traceFine(uv - side, rotation(jitter - 0.045) * dir, texel);
  vec2 g = texture(uCoarse, uv).xy;
  vec2 tangent = vec2(-g.y, g.x);
  vec2 sideC = g * 0.35 * uUnit * texel;
  float ca = traceCoarse(uv + sideC, rotation(jitter * 0.4 + 0.015) * tangent, texel);
  float cb = traceCoarse(uv - sideC, rotation(jitter * 0.4 - 0.025) * tangent, texel);
  outColor = vec4(a, b, max(ca, cb * 0.85), 1.0);
}`,iu=`
${re}
${Jt}
uniform sampler2D uContour;
uniform sampler2D uFlow;
uniform sampler2D uTone;
uniform sampler2D uSmudge;
uniform vec3 uPaper;
uniform vec3 uLead;
uniform float uMedium;
uniform float uOutline;
uniform float uShading;
uniform float uLength;
uniform float uSpacing;
uniform float uWidth;
uniform float uAngle;
uniform float uFollow;
uniform float uSmudgeAmount;
uniform float uGrain;
uniform float uBoil;
uniform float uSeed;
uniform float uRough;
uniform float uDepth;
uniform float uStrokeOpacity;

float hatch(vec2 p, float theta, float amount, float layer, float tilt) {
  vec2 q = rotation(theta) * p;
  float row = floor(q.y / uSpacing);
  float keep = 1.0;
  float aa = 0.7 / uUnit;
  float reach = smoothstep(0.0, 0.3, amount);
  float opacity = clamp(amount * 1.7, 0.0, 1.0);
  float width = uWidth * mix(0.7, 1.25, amount);
  for (int dy = -1; dy <= 1; dy++) {
    float r = row + float(dy);
    float shift = hash11(r * 0.731 + layer * 17.0) * uLength;
    float x = (q.x - shift) / uLength;
    float col = floor(x);
    float side = fract(x) < 0.5 ? -1.0 : 1.0;
    for (int k = 0; k < 2; k++) {
      float c = col + float(k) * side;
      vec2 cell = vec2(c, r) + layer * vec2(113.0, 57.0);
      float renew = uBoil > 0.0 ? step(hash12(cell + 71.3), uBoil) : 0.0;
      vec3 h = hash32(cell + renew * uSeed * vec2(17.31, 9.77));
      float vis = smoothstep(h.x - 0.12, h.x + 0.02, reach);
      if (vis <= 0.001) continue;
      vec3 g = fract(h.zxy * vec3(7.31, 13.7, 5.13) + h.yzx * 3.1);
      float len = uLength * (0.8 + 0.3 * h.y);
      vec2 center = vec2(shift + (c + 0.5 + (h.z - 0.5) * 0.25) * uLength, (r + 0.5 + (g.x - 0.5) * 0.3) * uSpacing);
      vec2 d = q - center;
      float turn = tilt + (g.y - 0.5) * 0.06;
      d = vec2(d.x + turn * d.y, d.y - turn * d.x);
      float u = d.x / len + 0.5;
      if (u < 0.0 || u > 1.0) continue;
      float bow = (g.z - 0.5) * 0.5 * uSpacing;
      float off = abs(d.y - bow * 4.0 * u * (1.0 - u));
      float pressure = mix(1.0, 0.4, pow(u, 1.4)) * smoothstep(0.0, 0.05, u) * smoothstep(1.0, 0.82, u);
      float w = width * (0.6 + 0.4 * pressure);
      float cov = 1.0 - smoothstep(w - aa, w + aa, off);
      keep *= 1.0 - cov * vis * opacity * mix(0.45, 1.0, pressure);
    }
  }
  return 1.0 - keep;
}

float hatchField(vec2 p, float theta, float amount, float layer) {
  float tilt = (valueNoise(p * 0.045 + layer * 7.0 + uSeed * uBoil * 0.13) - 0.5) * 0.26;
  float steps = 12.0;
  float x = theta / PI * steps;
  float i0 = floor(x);
  float f = smoothstep(0.35, 0.65, x - i0);
  float a = f < 0.999 ? hatch(p, i0 / steps * PI, amount, layer, tilt) : 0.0;
  float b = f > 0.001 ? hatch(p, (i0 + 1.0) / steps * PI, amount, layer, tilt) : 0.0;
  return mix(a, b, f);
}

float grainAt(vec2 p) {
  return valueNoise(p * 0.6) * 0.45 + valueNoise(p * 1.4 + 7.0) * 0.35 + valueNoise(p * 3.1 + 3.0) * 0.2;
}

void main() {
  vec2 p = vUv * uResolution / uUnit;
  vec3 source = texture(uTone, vUv).rgb;
  float lum = luma(source);
  float level = mix(lum, autoLevel(lum), 0.35);
  float tone = smoothstep(0.08, 0.92, 1.0 - level);
  bool colored = uMedium > 0.5 && uMedium < 1.5;

  vec3 vivid = clamp(mix(vec3(lum), source, 1.15), 0.0, 1.0);
  float amount = 1.0 - min(min(vivid.r, vivid.g), vivid.b);
  vec3 pigment = clamp(1.0 - (1.0 - vivid) / max(amount, 0.05), 0.0, 1.0);
  float drive = colored ? max(smoothstep(0.05, 0.85, amount), tone * 0.85) : tone;

  vec3 o = orient(texture(uFlow, vUv).rgb);
  vec2 baseDir = vec2(cos(uAngle), sin(uAngle));
  vec2 flowDir = o.xy;
  if (dot(flowDir, baseDir) < 0.0) flowDir = -flowDir;
  float follow = uFollow * smoothstep(0.08, 0.5, o.z);
  vec2 dir = normalize(mix(baseDir, flowDir, follow) + 1e-5);
  float theta = mod(atan(dir.y, dir.x), PI);

  float a1 = clamp(drive * 1.35, 0.0, 1.0) * uShading;
  float a2 = smoothstep(0.42, 0.95, tone) * uShading;
  float h1 = a1 > 0.003 ? hatchField(p, theta, a1, 0.0) : 0.0;
  float h2 = a2 > 0.003 ? hatchField(p, mod(theta + 1.1, PI), a2, 1.0) : 0.0;
  float a3 = smoothstep(0.72, 1.0, tone) * uShading;
  float h3 = a3 > 0.003 ? hatchField(p, mod(theta - 0.5, PI), a3, 2.0) : 0.0;
  float deep = smoothstep(0.82, 1.0, tone) * uShading;

  vec4 c = texture(uContour, vUv);
  float press = 0.6 + 0.4 * valueNoise(p * 0.06 + 11.0 + uSeed * uBoil * 0.71);
  float weight = uOutline;
  float fineA = smoothstep(0.17 - 0.07 * weight, 0.5 - 0.14 * weight, c.r);
  float fineB = smoothstep(0.19 - 0.07 * weight, 0.55 - 0.15 * weight, c.g);
  float coarse = smoothstep(0.08 - 0.03 * weight, 0.55 - 0.15 * weight, c.b);
  float line = 1.0 - (1.0 - fineA * press) * (1.0 - fineB * press * 0.65) * (1.0 - coarse * press * 0.7);
  line *= min(1.0, weight * 1.2);

  float soft = luma(texture(uSmudge, vUv).rgb);
  float softTone = smoothstep(0.08, 0.92, 1.0 - mix(soft, autoLevel(soft), 0.35));
  float fill = clamp(softTone * 1.15, 0.0, 1.0) * uShading;
  float smudge = smoothstep(0.45, 1.0, softTone) * uSmudgeAmount;

  float grain = grainAt(p);
  float tooth = mix(1.0, smoothstep(0.24 + uRough * 0.1, 0.62, grain + 0.08), uGrain);
  vec3 paper = uPaper * (1.0 - (grain - 0.5) * 0.1 * uGrain);
  float blend = uSmudgeAmount * 0.7;
  vec3 color;
  if (colored) {
    vec3 shadow = mix(pigment * 0.5, vec3(0.2, 0.2, 0.34), 0.3);
    vec3 ink = mix(pigment * 0.32, uLead, 0.45);
    float layer = mix(h1, clamp(drive * 1.15, 0.0, 1.0) * uShading * 0.85, blend);
    float cross = mix(1.0 - (1.0 - h2) * (1.0 - h3), a2 * 0.75, blend);
    color = paper;
    color *= 1.0 - layer * 0.92 * mix(tooth, 1.0, blend * 0.5) * (1.0 - pigment);
    color *= 1.0 - cross * 0.8 * tooth * (1.0 - shadow);
    color *= 1.0 - smudge * 0.3 * (1.0 - mix(pigment, shadow, 0.5));
    color *= 1.0 - line * 0.9 * mix(1.0, tooth, 0.5) * (1.0 - ink);
  } else {
    float strokes = 1.0 - (1.0 - h1) * (1.0 - h2) * (1.0 - h3) * (1.0 - deep * 0.45);
    strokes = mix(strokes, fill * 0.85, blend);
    float graphite = 1.0 - (1.0 - strokes * uStrokeOpacity * mix(tooth, 1.0, blend * 0.4)) * (1.0 - line * 0.92 * mix(1.0, tooth, 0.5));
    graphite = 1.0 - (1.0 - graphite) * (1.0 - smudge * uDepth * mix(1.0, grain + 0.35, uGrain * 0.6));
    color = mix(paper, uLead, graphite);
  }
  outColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}`;function nu(e,o){const t=250/Math.max(e.width,e.height),a=Math.max(2,Math.round(e.width*t)),l=Math.max(2,Math.round(e.height*t)),r=o.mipmapped?o:e.mipmap(o),i=e.pass("sketch-down",tu,{input:r,target:e.target(a,l),uniforms:{uLod:Math.max(0,Math.log2(1/t)-.5)}}),n=e.pass("sketch-tensor",Zt,{input:i,target:e.target(a,l)});e.release(i);let u=n;return[[1.6/a,0],[0,1.6/l],[1.6/a,0],[0,1.6/l]].forEach(c=>{const s=e.pass("sketch-smooth",ou,{input:u,target:e.target(a,l),uniforms:{uStep:c}});e.release(u),u=s}),u}const Lt={graphite:{id:0,lead:[.16,.16,.18],width:.55,spacing:2.3,sigma:.75,smudge:0,depth:.4,opacity:.85,rough:0},colored:{id:1,lead:[.14,.13,.16],width:.6,spacing:2.3,sigma:.75,smudge:0,depth:.35,opacity:.9,rough:.3},charcoal:{id:2,lead:[.06,.055,.055],width:1.3,spacing:4.2,sigma:1.5,smudge:.4,depth:.8,opacity:.75,rough:1}},uu={id:"sketch",name:"Pencil",category:"art",description:"A graphite pencil drawing with traced outlines, hatching that follows the forms and paper grain.",preview:{zoom:2},animated:!0,animates:e=>e.boil>0,params:[{key:"medium",label:"Medium",type:"select",default:"graphite",options:[{value:"graphite",label:"Graphite"},{value:"colored",label:"Colored pencil"},{value:"charcoal",label:"Charcoal"}]},{key:"outline",label:"Outlines",type:"number",min:0,max:1,step:.01,default:.8},{key:"detail",label:"Detalhe",type:"number",min:0,max:1,step:.01,default:.6},{key:"shading",label:"Shading",type:"number",min:0,max:1,step:.01,default:.85},{key:"length",label:"Stroke length",type:"number",min:6,max:50,step:.5,default:22},{key:"angle",label:"Hatch angle",type:"number",min:0,max:180,step:1,default:55},{key:"follow",label:"Follow forms",type:"number",min:0,max:1,step:.01,default:.35},{key:"smudge",label:"Smudge",type:"number",min:0,max:1,step:.01,default:.35},{key:"grain",label:"Paper grain",type:"number",min:0,max:1,step:.01,default:.5},{key:"paper",label:"Paper",type:"color",default:"#f3f0e8"},{key:"boil",label:"Line boil",type:"number",min:0,max:1,step:.01,default:0}],render(e,o,t){const a=e.unit,l=t.detail,r=Lt[t.medium]||Lt.graphite,i=Math.max(.6,r.sigma*a),n=E(e,o,i),u=E(e,o,i*1.6,{maxSigma:1.5}),c=E(e,o,6*a,{maxSigma:3}),s=e.pass("sketch-coarse",au,{input:c,target:e.target(c.width,c.height)});e.release(c);const p=e.pass("sketch-edges",lu,{input:n,textures:{uWide:u,uCoarse:s},uniforms:{uThreshold:.006+(1-l)*.03,uGain:12+l*14,uGate:.0014+(1-l)*(1-l)*.01,uStep:[1.2*a/e.width,1.2*a/e.height]}});e.release(u);const f=Math.max(1,Math.round(e.width/2)),m=Math.max(1,Math.round(e.height/2)),d=e.pass("sketch-tensor",Zt,{input:n,target:e.target(f,m)}),v=E(e,d,2.5*a,{maxSigma:3});e.release(d);const g=nu(e,o),x=t.boil>0?Math.floor(e.time*8)%1e3:0,k=e.pass("sketch-contour",ru,{input:p,textures:{uDir:v,uCoarse:s},uniforms:{uReach:9*a,uCoarseReach:12*a,uBoil:t.boil,uSeed:x*1.731}});e.release(s),e.release(p),e.release(v);const h=E(e,o,5*a,{maxSigma:2.5}),b=J(e,o),y=e.pass("sketch-final",iu,{input:o,textures:{uContour:k,uFlow:g,uTone:n,uSmudge:h,uStats:b.target},uniforms:{uStatsTop:b.top,uPaper:C(t.paper),uLead:r.lead,uMedium:r.id,uRough:r.rough,uDepth:r.depth,uStrokeOpacity:r.opacity,uOutline:t.outline,uShading:t.shading,uLength:t.length,uSpacing:r.spacing,uWidth:r.width,uAngle:t.angle*Math.PI/180,uFollow:t.follow,uSmudgeAmount:Math.min(1,t.smudge+r.smudge),uGrain:t.grain,uBoil:t.boil,uSeed:x}});return e.release(n),e.release(k),e.release(g),e.release(h),e.release(b.target),y}},su=`
void main() {
  float t = floor(gl_FragCoord.x) / (uResolution.x - 1.0);
  float count = 0.0;
  for (int y = 0; y < 64; y++) {
    for (int x = 0; x < 64; x++) {
      count += step(texelFetch(uInput, ivec2(x, y), 0).r, t);
    }
  }
  outColor = vec4(count / 4096.0, 0.0, 0.0, 1.0);
}`,cu=`
uniform sampler2D uPlanes;
uniform sampler2D uKey;
uniform sampler2D uMid;
uniform sampler2D uCdf;
uniform vec2 uGrid;
uniform float uGutter;
uniform vec3 uWays[36];
uniform float uWayCount;
uniform float uTones;
uniform float uBrightness;
uniform float uInk;
uniform float uShift;
uniform float uTexture;
uniform vec3 uPaper;
uniform vec3 uKeyInk;
uniform float uVariation;
uniform float uCycle;
uniform float uSourceAspect;

float equalize(float l) {
  float cdf = texture(uCdf, vec2((clamp(l, 0.0, 1.0) * 63.0 + 0.5) / 64.0, 0.5)).r;
  return mix(l, cdf, 0.75);
}

vec3 wayColor(float way, float band) {
  vec3 c = uWays[0];
  for (int i = 0; i < 36; i++) {
    if (float(i) == way * 4.0 + band) c = uWays[i];
  }
  return c;
}

float pickBand(float index) {
  if (uTones < 2.5) return index < 0.5 ? 0.0 : 2.0;
  return index;
}

vec3 planeColor(float way, float x) {
  float w = max(fwidth(x), 1e-4);
  float a = floor(x - w * 0.5);
  float b = floor(x + w * 0.5);
  float top = uTones - 1.0;
  vec3 ca = wayColor(way, pickBand(clamp(a, 0.0, top)));
  if (a == b) return ca;
  vec3 cb = wayColor(way, pickBand(clamp(b, 0.0, top)));
  return mix(ca, cb, clamp((x + w * 0.5 - b) / w, 0.0, 1.0));
}

void main() {
  vec2 px = vec2(vUv.x, 1.0 - vUv.y) * uResolution;
  vec2 cell = (uResolution - uGutter * (uGrid + 1.0)) / uGrid;
  vec2 idx = clamp(floor((px - uGutter * 0.5) / (cell + uGutter)), vec2(0.0), uGrid - 1.0);
  vec2 origin = uGutter + idx * (cell + uGutter);
  vec2 local = px - origin;
  vec2 inside2 = min(local, cell - local);
  float inside = uGutter > 0.0 ? clamp(min(inside2.x, inside2.y) + 0.5, 0.0, 1.0) : 1.0;

  float tile = idx.y * uGrid.x + idx.x;
  float way = mod(tile + floor(uCycle) + uVariation * 3.0, uWayCount);
  vec3 seed = hash32(idx + uVariation * 7.31 + 3.7);

  float cellAspect = cell.x / max(cell.y, 1.0);
  vec2 fit = cellAspect > uSourceAspect ? vec2(1.0, uSourceAspect / cellAspect) : vec2(cellAspect / uSourceAspect, 1.0);
  vec2 uv = (local / cell - 0.5) * fit + 0.5;
  uv.y = 1.0 - uv.y;
  vec2 perPx = fit / cell;
  vec2 shiftA = (seed.xy - 0.5) * uShift * perPx;
  vec2 shiftK = (hash22(idx + uVariation * 3.1 + 11.0) - 0.5) * uShift * 0.45 * perPx;

  vec2 p = px / max(uUnit, 0.2);
  float rough = (valueNoise(p * 0.9) - 0.5) * 0.7 + (valueNoise(p * 2.7 + 5.0) - 0.5) * 0.3;
  float tone = equalize(luma(texture(uPlanes, uv + shiftA * vec2(1.0, -1.0)).rgb)) + uBrightness;
  float x = clamp(tone, 0.0, 0.9999) * uTones + rough * 0.12 * uTexture;
  vec3 color = planeColor(way, x);

  float mottle = (valueNoise(p * 0.02 + seed.z * 50.0) - 0.5) * 0.7 + (valueNoise(p * 0.07 + 9.0) - 0.5) * 0.3;
  float streak = valueNoise(vec2(p.x * 0.004, p.y * 0.35) + seed.x * 20.0) - 0.5;
  float density = 1.0 - uTexture * (0.06 + 0.16 * mottle + 0.14 * streak);
  float pin = smoothstep(0.86, 0.95, valueNoise(p * 0.55 + 31.0)) * smoothstep(0.55, 0.9, valueNoise(p * 0.05 + 7.0));
  density *= 1.0 - pin * uTexture * 0.9;
  color = mix(uPaper, color, clamp(density, 0.0, 1.0));

  vec2 kuv = uv + shiftK * vec2(1.0, -1.0);
  vec3 keySample = texture(uKey, kuv).rgb;
  float kl = equalize(luma(keySample)) + uBrightness * 0.6;
  float speckle = (valueNoise(p * 0.85 + 17.0) - 0.5) * 0.7 + (hash12(floor(p * 1.3)) - 0.5) * 0.3;
  kl += speckle * 0.07 * (0.4 + uTexture);
  float kx = (kl - uInk * 0.42) / max(fwidth(kl), 1e-3) + rough * 2.0 * uTexture;
  float key = 1.0 - clamp(kx + 0.5, 0.0, 1.0);
  float detail = luma(texture(uMid, kuv).rgb) - luma(keySample);
  float lines = smoothstep(0.035, 0.08, detail) * smoothstep(0.0, 0.3, uInk);
  key = max(key, lines * 0.9) * step(0.001, uInk);
  float keyPin = smoothstep(0.8, 0.95, valueNoise(p * 0.8 + 61.0)) * uTexture;
  key *= 0.94 - keyPin * 0.5;
  color = mix(color, uKeyInk, key);

  color = mix(uPaper, color, inside);
  outColor = vec4(color, 1.0);
}`,Ut={marilyn:[["#e8337d","#1fb7c9","#ffd84a","#fff3e6"],["#ff6b1a","#e8337d","#9be7ff","#fffaf0"],["#3a2a9e","#ff5ca8","#ffcf3d","#fff8ee"],["#0a8f7a","#ffc21a","#ff86c0","#fefaf4"],["#d4243c","#ffa31a","#5fd8e6","#fff2f6"],["#5a2bd1","#3dd27a","#ffe84d","#ffffff"],["#1e63d6","#ff8a2a","#fff07a","#ffe9f2"],["#9a1e62","#ff5f9e","#a8f2ff","#fffbe0"],["#f2552c","#6d3cf0","#ffd0ec","#f4ffdb"]],electric:[["#141218","#ff2bd1","#ffe500","#00e1ff"],["#141218","#00e1ff","#ff2bd1","#fff95c"],["#141218","#39ff6a","#ff3b3b","#fff3a8"],["#1a0f3d","#ff3d8f","#00f0d0","#ffffff"],["#0b1d4f","#ffde00","#ff4fd8","#d7fbff"],["#141218","#ff6a00","#00b4ff","#fef6ff"],["#2b0a3d","#00ff9c","#ffe600","#ff8ad8"],["#141218","#b04bff","#38ffe3","#fffbe6"],["#3d0014","#ff2bd1","#7dff3a","#e8f8ff"]],candy:[["#f47fb2","#8fd9ff","#fff089","#fffdf7"],["#9c8cff","#ffb38a","#b9ffd9","#fffdf7"],["#5ec8c0","#ff9fc6","#fff3a6","#fffdf7"],["#ff8f70","#a5e1ff","#ffe0f0","#fffdf7"],["#7a9cff","#ffd36e","#ffc2e0","#fffdf7"],["#e86fd0","#9cf0c4","#fff6b8","#fffdf7"],["#5fb0ff","#ff9a9a","#fff1c9","#fffdf7"],["#ffa64d","#b59cff","#c9fff1","#fffdf7"],["#4fd1a0","#ff8cc6","#e3f1ff","#fffdf7"]],primary:[["#1d3fbf","#e8262b","#ffd400","#fffdf5"],["#e8262b","#1d3fbf","#ffd400","#fffdf5"],["#141218","#e8262b","#ffd400","#fffdf5"],["#1d3fbf","#ffd400","#e8262b","#fffdf5"],["#e8262b","#ffd400","#1d3fbf","#fffdf5"],["#141218","#1d3fbf","#ffd400","#fffdf5"],["#ffd400","#e8262b","#1d3fbf","#fffdf5"],["#1d3fbf","#fffdf5","#e8262b","#ffd400"],["#e8262b","#141218","#ffd400","#fffdf5"]]},It={"2x2":[2,2],"3x3":[3,3],strip:[4,1],single:[1,1]},fu=e=>{const o=(e||[]).slice(0,8);for(;o.length<2;)o.push(o.length?"#ffffff":"#141218");return Array.from({length:Math.min(9,o.length)},(t,a)=>Array.from({length:4},(l,r)=>o[(a+r)%o.length]))},mu={id:"warhol",name:"Pop art",category:"print",blend:"normal",description:"The picture repeated in a grid of flat, high-contrast screen-print colorways.",preview:{zoom:1},animated:!0,animates:e=>e.cycle>0,params:[{key:"layout",label:"Layout",type:"select",default:"2x2",options:[{value:"2x2",label:"2 × 2"},{value:"3x3",label:"3 × 3"},{value:"strip",label:"Strip of four"},{value:"single",label:"Single"}]},{key:"colorway",label:"Colorways",type:"select",default:"marilyn",options:[{value:"marilyn",label:"Marilyn"},{value:"electric",label:"Electric"},{value:"candy",label:"Candy"},{value:"primary",label:"Primary"},{value:"custom",label:"Personalizado"}]},{key:"colors",label:"Cores",type:"colors",min:2,max:8,default:["#ff3d8b","#1fb7c9","#ffd84a","#141218","#fff4e6"],when:e=>e.colorway==="custom"},{key:"tones",label:"Tones",type:"number",min:2,max:4,step:1,default:3},{key:"brightness",label:"Brilho",type:"number",min:-.5,max:.5,step:.01,default:0},{key:"ink",label:"Black ink",type:"number",min:0,max:1,step:.01,default:.5},{key:"simplify",label:"Simplify",type:"number",min:0,max:1,step:.01,default:.25},{key:"misregister",label:"Misregistration",type:"number",min:0,max:1,step:.01,default:.4},{key:"texture",label:"Ink texture",type:"number",min:0,max:1,step:.01,default:.5},{key:"gutter",label:"Gutter",type:"number",min:0,max:40,step:.5,default:12},{key:"paper",label:"Paper",type:"color",default:"#f6f3ec"},{key:"variation",label:"Variação",type:"number",min:0,max:12,step:1,default:0},{key:"cycle",label:"Color swap",type:"number",min:0,max:4,step:.05,default:0}],render(e,o,t){const a=e.unit;let[l,r]=It[t.layout]||It["2x2"];t.layout==="strip"&&e.height>e.width&&([l,r]=[r,l]);const i=t.gutter*a,n=Math.max(1,(e.width-i*(l+1))/l),u=Math.max(1,(e.height-i*(r+1))/r),c=e.width/e.height,s=Math.max(1,Math.min(e.width/n,e.height/u)),p=E(e,o,Math.max(.5,(.6+t.simplify*9)*a*s)),f=E(e,o,Math.max(.5,.7*a*s)),m=E(e,o,Math.max(.8,2.2*a*s),{maxSigma:2.5}),d=J(e,o),v=e.pass("warhol-cdf",su,{input:d.target,target:e.target(64,1)});e.release(d.target);const g=(t.colorway==="custom"?fu(t.colors):Ut[t.colorway]||Ut.marilyn).slice(0,9).map(h=>h.map(C)),x=g.flat();for(;x.length<36;)x.push(x[x.length-1]);const k=e.pass("warhol",cu,{input:o,textures:{uPlanes:p,uKey:f,uMid:m,uCdf:v},uniforms:{uGrid:[l,r],uGutter:i,uWays:x,uWayCount:g.length,uTones:Math.round(t.tones),uBrightness:t.brightness*.5,uInk:t.ink,uShift:t.misregister*16*a,uTexture:t.texture,uPaper:C(t.paper),uKeyInk:[.07,.065,.08],uVariation:Math.round(t.variation),uCycle:t.cycle>0?e.time*t.cycle:0,uSourceAspect:c}});return e.release(p),e.release(f),e.release(m),e.release(v),k}},du=`
uniform float uLod;

void main() {
  outColor = vec4(textureLod(uInput, vUv, uLod).rgb, 1.0);
}`,Ze=`
${re}
uniform vec3 uInks[12];
uniform float uInkCount;
uniform float uChroma;

vec3 prepare(vec3 c) {
  vec3 lab = toOklab(c);
  float l = luma(c);
  float shifted = autoLevel(l);
  lab.x = clamp(lab.x + (shifted - l) * 0.6, 0.0, 1.0);
  lab.yz *= uChroma;
  return lab;
}

vec4 nearest(vec3 lab) {
  float best = 1e9;
  float second = 1e9;
  float index = 0.0;
  for (int i = 0; i < 12; i++) {
    if (float(i) >= uInkCount) break;
    vec3 ink = toOklab(uInks[i]);
    vec3 d = lab - ink;
    float dist = d.x * d.x + dot(d.yz, d.yz) * 2.2;
    if (dist < best) {
      second = best;
      best = dist;
      index = float(i);
    } else if (dist < second) {
      second = dist;
    }
  }
  return vec4(index, best, second, 0.0);
}

vec3 inkAt(float index) {
  vec3 c = uInks[0];
  for (int i = 0; i < 12; i++) {
    if (float(i) == index) c = uInks[i];
  }
  return c;
}
`,pu=`
${Ze}
void main() {
  vec2 t = 1.0 / uResolution;
  vec3 c = texture(uInput, vUv).rgb * 0.25;
  c += (texture(uInput, vUv + vec2(t.x, 0.0)).rgb + texture(uInput, vUv - vec2(t.x, 0.0)).rgb) * 0.125;
  c += (texture(uInput, vUv + vec2(0.0, t.y)).rgb + texture(uInput, vUv - vec2(0.0, t.y)).rgb) * 0.125;
  c += (texture(uInput, vUv + t).rgb + texture(uInput, vUv - t).rgb) * 0.0625;
  c += (texture(uInput, vUv + vec2(t.x, -t.y)).rgb + texture(uInput, vUv - vec2(t.x, -t.y)).rgb) * 0.0625;
  vec3 lab = prepare(c);
  vec4 n = nearest(lab);
  outColor = vec4(n.x, 0.0, 0.0, 1.0);
}`,zt=`
${Ze}
uniform sampler2D uPlanes;

float inkDistance(vec3 lab, float index) {
  vec3 d = lab - toOklab(inkAt(index));
  return sqrt(d.x * d.x + dot(d.yz, d.yz) * 2.2);
}

void main() {
  ivec2 size = textureSize(uInput, 0);
  ivec2 c = ivec2(gl_FragCoord.xy);
  float counts[12];
  for (int i = 0; i < 12; i++) counts[i] = 0.0;
  for (int y = -2; y <= 2; y++) {
    for (int x = -2; x <= 2; x++) {
      if (x * x + y * y > 5) continue;
      ivec2 q = clamp(c + ivec2(x, y), ivec2(0), size - 1);
      int index = int(texelFetch(uInput, q, 0).r + 0.5);
      counts[index] += x == 0 && y == 0 ? 1.5 : 1.0;
    }
  }
  float best = -1.0;
  float pick = 0.0;
  for (int i = 0; i < 12; i++) {
    if (counts[i] > best) {
      best = counts[i];
      pick = float(i);
    }
  }
  float own = texelFetch(uInput, c, 0).r;
  vec3 lab = prepare(texelFetch(uPlanes, c, 0).rgb);
  float support = counts[int(own + 0.5)];
  if (support > 3.4 && inkDistance(lab, pick) > inkDistance(lab, own) + 0.16) pick = own;
  outColor = vec4(pick, 0.0, 0.0, 1.0);
}`,vu=`
uniform float uDetail;

vec3 lab(vec2 uv) {
  return toOklab(texture(uInput, uv).rgb) * vec3(1.0, 1.4, 1.4);
}

void main() {
  vec2 t = 1.0 / uResolution;
  float center = luma(texture(uInput, vUv).rgb);
  float around = 0.0;
  for (int i = 0; i < 8; i++) {
    float a = float(i) * 0.785398;
    around += luma(texture(uInput, vUv + vec2(cos(a), sin(a)) * t * 1.6).rgb);
  }
  around /= 8.0;
  float detail = smoothstep(0.03, 0.09, around - center) * uDetail;
  vec3 gx = lab(vUv + vec2(t.x, 0.0)) - lab(vUv - vec2(t.x, 0.0));
  vec3 gy = lab(vUv + vec2(0.0, t.y)) - lab(vUv - vec2(0.0, t.y));
  float edge = sqrt(dot(gx, gx) + dot(gy, gy)) * 0.5 * uUnit;
  outColor = vec4(detail, edge, 0.0, 1.0);
}`,At=`
uniform vec2 uStep;

void main() {
  vec3 sum = texture(uInput, vUv).rgb * 0.4;
  sum += (texture(uInput, vUv + uStep).rgb + texture(uInput, vUv - uStep).rgb) * 0.3;
  outColor = vec4(sum, 1.0);
}`,hu=`
${Ze}
uniform sampler2D uIndex;
uniform sampler2D uDetail;
uniform sampler2D uTone;
uniform vec3 uPaper;
uniform vec3 uSumi;
uniform vec3 uBandInk;
uniform float uLineAmount;
uniform float uWeight;
uniform float uBokashi;
uniform float uBand;
uniform float uGrain;
uniform float uWashi;
uniform float uSpeckle;

vec4 bspline(float f) {
  float g = 1.0 - f;
  return vec4(g * g * g, 4.0 - 6.0 * f * f + 3.0 * f * f * f, 4.0 - 6.0 * g * g + 3.0 * g * g * g, f * f * f) / 6.0;
}

vec4 vote(vec2 uv) {
  ivec2 size = textureSize(uIndex, 0);
  vec2 pos = uv * vec2(size) - 0.5;
  vec2 base = floor(pos);
  vec2 f = pos - base;
  vec4 wx = bspline(f.x);
  vec4 wy = bspline(f.y);
  float counts[12];
  for (int i = 0; i < 12; i++) counts[i] = 0.0;
  for (int y = 0; y < 4; y++) {
    for (int x = 0; x < 4; x++) {
      ivec2 q = clamp(ivec2(base) + ivec2(x - 1, y - 1), ivec2(0), size - 1);
      int index = int(texelFetch(uIndex, q, 0).r + 0.5);
      counts[index] += wx[x] * wy[y];
    }
  }
  float first = -1.0;
  float second = -1.0;
  float a = 0.0;
  float b = 0.0;
  for (int i = 0; i < 12; i++) {
    float c = counts[i];
    if (c > first) {
      second = first;
      b = a;
      first = c;
      a = float(i);
    } else if (c > second) {
      second = c;
      b = float(i);
    }
  }
  return vec4(a, b, first, max(second, 0.0));
}

vec3 inkOn(vec3 paper, vec3 ink, float density) {
  return paper * pow(clamp(ink / max(paper, vec3(0.02)), 0.002, 1.0), vec3(clamp(density, 0.0, 1.5)));
}

float woodGrain(vec2 p, float block) {
  vec2 q = p + vec2(block * 137.0, block * 59.0);
  float wander = fbm(q * vec2(0.0016, 0.0045)) * 15.0 + valueNoise(q * vec2(0.012, 0.03)) * 2.0;
  float y = q.y + wander;
  float spacing = 5.5 + 3.0 * valueNoise(vec2(q.x * 0.004, y * 0.02) + 4.0);
  float f = fract(y / spacing);
  float ring = pow(f, 5.0) * 0.8 + smoothstep(0.82, 1.0, f) * 0.4;
  float streak = valueNoise(vec2(q.x * 0.008, y * 0.45));
  float fine = valueNoise(vec2(q.x * 0.04, y * 1.8));
  return clamp(ring * 0.75 + (streak - 0.35) * 0.55 + (fine - 0.5) * 0.25, 0.0, 1.0);
}

float fibers(vec2 p) {
  float f = 0.0;
  for (int i = 0; i < 4; i++) {
    float a = float(i) * 1.7 + 0.3;
    vec2 q = rotation(a) * p;
    float bend = valueNoise(q * 0.05 + float(i) * 5.0) * 3.0;
    float n = valueNoise(vec2(q.x * 0.06, q.y * 0.8 + bend) + float(i) * 17.0);
    float strand = 1.0 - abs(n - 0.5) * 14.0;
    f += clamp(strand, 0.0, 1.0) * smoothstep(0.5, 0.8, valueNoise(q * 0.03 + float(i) * 9.0));
  }
  return clamp(f * 0.6, 0.0, 1.0);
}

void main() {
  vec2 p = vUv * uResolution / uUnit;
  vec2 wobble = vec2(valueNoise(p * 0.045), valueNoise(p * 0.045 + 13.0)) - 0.5;
  vec2 uv = vUv + wobble * 1.4 * uUnit / uResolution;

  vec4 v = vote(uv);
  vec3 inkA = inkAt(v.x);
  vec3 inkB = inkAt(v.y);
  float margin = v.z - v.w;
  float aa = max(fwidth(margin), 1e-4);
  float blend = clamp(0.5 + 0.5 * margin / aa, 0.0, 1.0);
  vec3 ink = mix(inkB, inkA, blend);
  float block = blend > 0.5 ? v.x : v.y;

  float tone = toOklab(texture(uTone, vUv).rgb).x;
  float inkL = toOklab(ink).x;
  float paperL = toOklab(uPaper).x;
  float lift = clamp((tone - inkL) / max(paperL - inkL, 0.05), -1.0, 1.0);
  float density = 1.0 - max(lift, 0.0) * uBokashi * 0.85 + min(lift, 0.0) * uBokashi * 0.15;

  float grain = woodGrain(p, block);
  density *= 1.0 - uGrain * 0.4 * grain;
  float speck = smoothstep(0.62, 0.86, valueNoise(p * 1.35 + block * 7.0)) * smoothstep(0.25, 0.75, valueNoise(p * 0.08 + 3.0));
  density *= 1.0 - uSpeckle * speck * 0.75;

  float fiber = fibers(p);
  float mottle = fbm(p * 0.012) - 0.5 + (valueNoise(p * 0.08) - 0.5) * 0.3;
  vec3 paper = uPaper * (1.0 + mottle * 0.14 * uWashi) * (1.0 + fiber * 0.05 * uWashi);
  density *= 1.0 - fiber * 0.14 * uWashi - mottle * 0.4 * uWashi;

  vec3 color = inkOn(paper, ink, density);

  float top = 1.0 - vUv.y;
  float band = (1.0 - smoothstep(0.0, 0.07 + 0.2 * uBand, top)) * uBand;
  band *= 1.0 - uGrain * 0.25 * woodGrain(p * 1.3, 11.0);
  color = inkOn(color, uBandInk, band * 0.95);

  vec3 la = toOklab(inkA);
  vec3 lb = toOklab(inkB);
  vec3 dl = la - lb;
  float contrast = smoothstep(0.04, 0.12, sqrt(dl.x * dl.x + dot(dl.yz, dl.yz) * 1.5));
  float cut = (valueNoise(p * 0.08 + 21.0) - 0.5) * 0.5 + (valueNoise(p * 0.5) - 0.5) * 0.15 + (valueNoise(p * 1.7 + 5.0) - 0.5) * 0.12;
  float width = 0.17 * uWeight * (1.0 + cut);
  float laa = fwidth(margin) * 0.8 + 1e-4;
  vec2 detailMap = texture(uDetail, uv).rg;
  float sharp = smoothstep(0.0035, 0.014, detailMap.g);
  float line = (1.0 - smoothstep(width - laa, width + laa, margin)) * contrast * sharp * step(0.001, v.w);
  float detail = detailMap.r;
  float dw = 0.2 + cut * 0.12;
  line = max(line, smoothstep(dw - 0.05, dw + 0.05, detail));
  line *= uLineAmount;
  float lineSpeck = smoothstep(0.7, 0.92, valueNoise(p * 0.9 + 41.0)) * uSpeckle * 0.5;
  line *= 1.0 - lineSpeck;
  line *= 1.0 - uGrain * 0.15 * grain;
  color = inkOn(color, uSumi, line * 0.97);

  outColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}`,Rt={hiroshige:{inks:["#efe5cf","#262123","#1f3f6e","#5f8fb8","#a9c3d3","#c8553d","#e2a08f","#d6a446","#5c8a5a","#8b8580","#6c6a86"],band:"#1c3a66"},hokusai:{inks:["#efe5cf","#2a2627","#1b3a63","#3f6c98","#8fb0c6","#c9d6d8","#cdbb98","#e3cfa4","#7d8a8c"],band:"#1b3a63"},autumn:{inks:["#f1e2c4","#231a1d","#3a1d2e","#6e2433","#a63a35","#d9783a","#e6b562","#6b6a3a","#9a6a4f"],band:"#4a1f2c"},night:{inks:["#e9dcbc","#151418","#1d2540","#2f3f63","#5b6a7d","#9aa0a3","#e3cf8a","#4a3f5c"],band:"#141a33"}},gu={id:"woodblock",name:"Woodblock",category:"print",description:"A Japanese woodblock print with flat color planes, carved key lines, wood grain and soft gradients.",preview:{zoom:1},animated:!1,params:[{key:"palette",label:"Palette",type:"select",default:"hiroshige",options:[{value:"hiroshige",label:"Hiroshige"},{value:"hokusai",label:"Prussian blue"},{value:"autumn",label:"Autumn"},{value:"night",label:"Night"}]},{key:"simplify",label:"Simplify",type:"number",min:1,max:12,step:.1,default:5},{key:"lines",label:"Key lines",type:"number",min:0,max:1,step:.01,default:.9},{key:"weight",label:"Line weight",type:"number",min:.5,max:4,step:.05,default:2},{key:"detail",label:"Detail lines",type:"number",min:0,max:1,step:.01,default:.5},{key:"bokashi",label:"Soft gradients",type:"number",min:0,max:1,step:.01,default:.6},{key:"band",label:"Sky band",type:"number",min:0,max:1,step:.01,default:.45},{key:"grain",label:"Wood grain",type:"number",min:0,max:1,step:.01,default:.5},{key:"washi",label:"Paper fibers",type:"number",min:0,max:1,step:.01,default:.5},{key:"speckle",label:"Ink speckle",type:"number",min:0,max:1,step:.01,default:.35},{key:"paper",label:"Paper",type:"color",default:"#efe5cf"}],render(e,o,t){const a=Rt[t.palette]||Rt.hiroshige,l=a.inks.map(C);l[0]=C(t.paper);const r=l.length;for(;l.length<12;)l.push(l[l.length-1]);const i=Math.max(e.width,e.height),n=.6+t.simplify*.2,u=Math.min(2,1e3/n/i),c=Math.max(2,Math.round(e.width*u)),s=Math.max(2,Math.round(e.height*u)),p=o.mipmapped?o:e.mipmap(o),f=e.pass("wood-down",du,{input:p,target:e.target(c,s),uniforms:{uLod:Math.max(0,Math.log2(1/u)-.5)}}),m={...e,width:c,height:s,unit:Math.max(c,s)/1e3},{painted:d,tensor:v}=Ke(m,f,{radius:n*2.6,flow:.8,sharpness:10});e.release(f),e.release(v);const g=J(e,o),x={uStatsTop:g.top,uInks:l,uInkCount:r,uChroma:1.25},k=e.pass("wood-quant",pu,{input:d,target:e.target(d.width,d.height,{filter:"nearest"}),textures:{uStats:g.target},uniforms:x}),h=e.pass("wood-mode",zt,{input:k,target:e.target(d.width,d.height,{filter:"nearest"}),textures:{uPlanes:d,uStats:g.target},uniforms:x});e.release(k);const b=e.pass("wood-mode",zt,{input:h,target:e.target(d.width,d.height,{filter:"nearest"}),textures:{uPlanes:d,uStats:g.target},uniforms:x});e.release(h);const y=e.pass("wood-detail",vu,{input:d,target:e.target(d.width,d.height),uniforms:{uDetail:t.detail}}),S=e.pass("wood-soften",At,{input:y,target:e.target(d.width,d.height),uniforms:{uStep:[1/d.width,0]}});e.release(y);const I=e.pass("wood-soften",At,{input:S,target:e.target(d.width,d.height),uniforms:{uStep:[0,1/d.height]}});e.release(S);const L=E(e,o,18*e.unit,{maxSigma:2.5}),M=e.pass("wood-print",hu,{input:o,textures:{uIndex:b,uDetail:I,uTone:L,uStats:g.target},uniforms:{...x,uPaper:C(t.paper),uSumi:[.13,.115,.12],uBandInk:C(a.band),uLineAmount:t.lines,uWeight:t.weight,uBokashi:t.bokashi,uBand:t.band,uGrain:t.grain,uWashi:t.washi,uSpeckle:t.speckle}});return e.release(d),e.release(b),e.release(I),e.release(L),e.release(g.target),M}},We=64,Dt={stipple:0,pointillism:1,mezzotint:2},bu={stipple:2.8,pointillism:8,mezzotint:1.6},Je=`
uniform sampler2D uPoints;
uniform vec2 uFull;
uniform float uSpacing;
uniform float uStyle;
uniform float uContrast;
uniform float uDensity;
uniform float uColor;
uniform vec3 uInk;
uniform vec3 uPaper;
uniform float uScatter;
uniform float uMix;
uniform float uMotion;
uniform float uRadius;
uniform float uReach;
uniform vec3 uBase;

const float FILL[17] = float[17](0.0, 0.068, 0.136, 0.2043, 0.272, 0.34, 0.4082, 0.4782, 0.5522, 0.634, 0.7268, 0.8375, 0.995, 1.0, 1.0, 1.0, 1.0);
const float GROW[17] = float[17](0.54, 0.54, 0.54, 0.54, 0.54, 0.54, 0.54, 0.54, 0.54, 0.54, 0.54, 0.54, 0.54, 0.5781, 0.6266, 0.6924, 0.85);

float fillFor(float c) {
  float x = clamp(c, 0.0, 1.0) * 16.0;
  int i = int(min(floor(x), 15.0));
  return mix(FILL[i], FILL[i + 1], x - float(i));
}

float growFor(float c) {
  float x = clamp(c, 0.0, 1.0) * 16.0;
  int i = int(min(floor(x), 15.0));
  return mix(GROW[i], GROW[i + 1], x - float(i));
}

vec4 pointAt(vec2 cell) {
  return texelFetch(uPoints, ivec2(mod(cell, 64.0)), 0);
}

vec2 offsetFor(vec2 cell, vec4 pt) {
  vec2 o = pt.gb - 0.5;
  if (uStyle > 0.5) o *= uScatter * 1.25;
  if (uMotion > 0.0) {
    float phase = hash12(cell * 1.37 + 3.1) * TAU;
    float speed = 0.55 + hash12(cell * 2.11 + 7.3) * 0.9;
    float t = uTime * uMotion * speed;
    o += vec2(cos(t + phase), sin(t * 0.83 + phase * 1.7)) * 0.11;
  }
  return o;
}

vec3 tone(vec3 c) {
  return pow(max(c, 0.0), vec3(1.4));
}

vec3 untone(vec3 c) {
  return pow(clamp(c, 0.0, 1.0), vec3(1.0 / 1.4));
}

vec3 graded(vec3 c) {
  return clamp((c - 0.5) * uContrast + 0.5, 0.0, 1.0);
}
`,yu=`
${Je}
uniform float uLod;

void main() {
  vec2 cell = floor(gl_FragCoord.xy);
  vec4 pt = pointAt(cell);
  vec2 center = (cell + 0.5 + offsetFor(cell, pt)) * uSpacing;
  vec3 color = graded(textureLod(uInput, clamp(center / uFull, 0.0, 1.0), uLod).rgb);
  vec3 h = hash32(cell + 17.0);

  if (uStyle > 0.5) {
    vec3 hsv = rgb2hsv(color);
    hsv.x = fract(hsv.x + (h.x - 0.5) * uMix * 0.22);
    hsv.y = clamp(hsv.y * (1.35 + (h.y - 0.5) * uMix * 0.6), 0.0, 1.0);
    hsv.z = clamp(pow(hsv.z, 0.85) * (1.0 + (h.z - 0.5) * uMix * 0.5), 0.0, 1.0);
    vec3 dab = hsv2rgb(hsv);
    float contrast = clamp(abs(luma(dab) - luma(uBase)) * 1.4, 0.0, 1.0);
    float radius = uRadius * (0.55 + 0.75 * sqrt(contrast)) * (1.0 + (hash12(cell * 0.73 + 5.0) - 0.5) * 0.3);
    outColor = vec4(dab, min(radius, uReach) * uSpacing);
    return;
  }

  vec3 paper = tone(uPaper);
  vec3 image = tone(color);
  float c;
  vec3 dotColor = uInk;
  if (uColor > 0.5) {
    vec3 absorb = 1.0 - image / max(paper, vec3(0.02));
    c = clamp(max(max(absorb.r, absorb.g), absorb.b), 0.0, 1.0);
    dotColor = untone(paper + (image - paper) / max(c, 0.08));
  } else {
    float lp = dot(paper, LUMA);
    float li = dot(tone(uInk), LUMA);
    c = clamp((lp - dot(image, LUMA)) / max(lp - li, 0.02), 0.0, 1.0);
  }
  c = clamp(c * uDensity, 0.0, 1.0);
  float rank = (pt.r * 65280.0 + pt.a * 255.0) / 65535.0;
  float on = step(rank, fillFor(c) - 0.0001);
  float radius = growFor(c) * (1.0 + (h.x - 0.5) * 0.12);
  outColor = vec4(dotColor, on * min(radius, uReach) * uSpacing);
}`,xu=`
${Je}
uniform sampler2D uDots;
uniform vec2 uGrid;

void main() {
  vec2 p = gl_FragCoord.xy;
  vec2 base = floor(p / uSpacing);
  vec3 color = uBase;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 cell = base + vec2(float(i), float(j));
      if (cell.x < 0.0 || cell.y < 0.0 || cell.x >= uGrid.x || cell.y >= uGrid.y) continue;
      vec4 spot = texelFetch(uDots, ivec2(cell), 0);
      if (spot.a <= 0.0) continue;
      vec2 center = (cell + 0.5 + offsetFor(cell, pointAt(cell))) * uSpacing;
      float cover = clamp(spot.a - length(p - center) + 0.5, 0.0, 1.0);
      color = mix(color, spot.rgb, cover);
    }
  }
  outColor = vec4(color, 1.0);
}`,ku=`
${Je}
uniform float uGrain;
uniform float uLod;

float bump(vec2 p, float seed) {
  vec2 i = floor(p);
  vec2 f = p - i;
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = hash12(i + seed) * TAU;
  float b = hash12(i + vec2(1.0, 0.0) + seed) * TAU;
  float c = hash12(i + vec2(0.0, 1.0) + seed) * TAU;
  float d = hash12(i + vec2(1.0, 1.0) + seed) * TAU;
  float na = dot(vec2(cos(a), sin(a)), f);
  float nb = dot(vec2(cos(b), sin(b)), f - vec2(1.0, 0.0));
  float nc = dot(vec2(cos(c), sin(c)), f - vec2(0.0, 1.0));
  float nd = dot(vec2(cos(d), sin(d)), f - vec2(1.0, 1.0));
  return mix(mix(na, nb, u.x), mix(nc, nd, u.x), u.y);
}

float grain(vec2 q, float seed) {
  return bump(q, seed * 17.13) * 0.65 + bump(rotation(0.9) * q * 2.1 + vec2(31.7, 11.3), seed * 7.71 + 3.0) * 0.35;
}

float field(vec2 q, float channel) {
  float s = uTime * uMotion * 0.6;
  float k = floor(s);
  float f = (s - k) * 1.5707963;
  float seed = channel * 5.31;
  float n = grain(q, seed + k) * cos(f) + grain(q, seed + k + 1.0) * sin(f);
  return clamp(n * 1.6 + 0.5, 0.0, 1.0);
}

float ink(float c, float n) {
  float w = max(fwidth(n) * 0.6, 0.15);
  return smoothstep(n - w, n + w, c);
}

float deepen(float c) {
  c = pow(clamp(c * uDensity, 0.0, 1.0), 0.8);
  return smoothstep(0.05, 0.86, c) * 0.7 + c * 0.3;
}

void main() {
  vec2 q = gl_FragCoord.xy / uGrain;
  vec3 color = graded(textureLod(uInput, vUv, uLod).rgb);
  vec3 paper = tone(uPaper);
  vec3 dark = tone(uInk);
  vec3 image = tone(color);
  vec3 c;
  if (uColor > 0.5) {
    c = clamp((paper - image) / max(paper - dark, vec3(0.02)), 0.0, 1.0);
    c = vec3(deepen(c.r), deepen(c.g), deepen(c.b));
  } else {
    float lp = dot(paper, LUMA);
    c = vec3(deepen(clamp((lp - dot(image, LUMA)) / max(lp - dot(dark, LUMA), 0.02), 0.0, 1.0)));
  }
  int count = uGrain < 2.6 ? 4 : 1;
  vec3 k = vec3(0.0);
  for (int i = 0; i < 4; i++) {
    if (i >= count) break;
    vec2 o = count > 1 ? (vec2(float(i % 2), float(i / 2)) - 0.5) * 0.5 / uGrain : vec2(0.0);
    float n = field(q + o, 0.0);
    k += vec3(ink(c.r, n), ink(c.g, n), ink(c.b, n));
  }
  outColor = vec4(mix(uPaper, uInk, k / float(count)), 1.0);
}`;let je=null;function wu(e){const o=e*e;let t=11;const a=()=>(t=t*16807%2147483647,t/2147483647),l=new Float64Array(o),r=new Float64Array(o),i=new Float64Array(o),n=new Float64Array(o);for(let m=0;m<o;m+=1)l[m]=(a()-.5)*.8,r[m]=(a()-.5)*.8,i[m]=m%e+.5+l[m],n[m]=Math.floor(m/e)+.5+r[m];const u=new Float64Array(o).fill(1/0),c=new Uint32Array(o),s=e/2;let p=Math.floor(a()*o);for(let m=0;m<o&&p>=0;m+=1){c[p]=m,u[p]=-1;const d=i[p],v=n[p];let g=-1,x=-1;for(let k=0;k<o;k+=1){const h=u[k];if(h<0)continue;let b=Math.abs(i[k]-d),y=Math.abs(n[k]-v);b>s&&(b=e-b),y>s&&(y=e-y);const S=b*b+y*y,I=S<h?S:h;u[k]=I,I>x&&(x=I,g=k)}p=g}const f=new Uint8Array(o*4);for(let m=0;m<o;m+=1){const d=Math.round((c[m]+.5)/o*65535);f[m*4]=d>>8,f[m*4+1]=Math.round((l[m]+.5)*255),f[m*4+2]=Math.round((r[m]+.5)*255),f[m*4+3]=d&255}return f}function Su(e){return je||(je=wu(We)),{texture:e.createTexture(We,We,{float:!1,filter:"nearest",wrap:"repeat",data:je})}}const Cu={id:"points",name:"Dots",category:"print",description:"Stippled ink dots, pointillist color dabs or a velvety mezzotint grain.",animated:!0,animates:e=>e.motion>0,params:[{key:"style",label:"Style",type:"select",default:"stipple",options:[{value:"stipple",label:"Stippling"},{value:"pointillism",label:"Pointillism"},{value:"mezzotint",label:"Mezzotint"}]},{key:"size",label:"Dot size",type:"number",min:.4,max:3,step:.05,default:1},{key:"density",label:"Densidade",type:"number",min:.3,max:2,step:.01,default:1},{key:"contrast",label:"Contraste",type:"number",min:.5,max:2,step:.01,default:1.1},{key:"color",label:"Image colors",type:"boolean",default:!1,when:e=>e.style!=="pointillism"},{key:"ink",label:"Ink",type:"color",default:"#1b1815",when:e=>e.style==="mezzotint"||e.style==="stipple"&&!e.color},{key:"paper",label:"Paper",type:"color",default:"#f2ece1",when:e=>e.style!=="pointillism"},{key:"ground",label:"Ground",type:"color",default:"#0b0a0e",when:e=>e.style==="pointillism"},{key:"scatter",label:"Scatter",type:"number",min:0,max:1,step:.01,default:.5,when:e=>e.style==="pointillism"},{key:"mix",label:"Color mix",type:"number",min:0,max:1,step:.01,default:.5,when:e=>e.style==="pointillism"},{key:"motion",label:"Shimmer",type:"number",min:0,max:2,step:.01,default:0}],render(e,o,t){const a=Dt[t.style]??0,l=Object.keys(Dt)[a],r=o.mipmapped?o:e.mipmap(o),i=Math.max(1.2,bu[l]*t.size*e.unit),n={uFull:[e.width,e.height],uStyle:a,uContrast:t.contrast,uDensity:t.density,uColor:t.color?1:0,uInk:C(t.ink),uPaper:C(t.paper),uScatter:t.scatter,uMix:t.mix,uMotion:t.motion};if(a===2)return e.pass("points-mezzotint",ku,{input:r,uniforms:{...n,uGrain:i,uLod:Math.max(0,Math.log2(i)-1)}});const u=e.shared("stipple-points",Su),c=a===1,s=Math.max(2,c?i/t.density:i/1.08),p=t.motion>0?.11:0,f=c?.5*t.scatter:.4,m=Math.max(.3,1.5-f-p-.5/s),d=Math.ceil(e.width/s),v=Math.ceil(e.height/s),g={...n,uSpacing:s,uRadius:.5*i/s,uReach:m,uBase:C(c?t.ground:t.paper)},x=e.pass("points-dots",yu,{input:r,target:e.target(d,v,{filter:"nearest"}),textures:{uPoints:u.texture},uniforms:{...g,uLod:Math.max(0,Math.log2(s)-.5)}}),k=e.pass("points-draw",xu,{input:r,textures:{uPoints:u.texture,uDots:x},uniforms:{...g,uGrid:[d,v]}});return e.release(x),k}},Mu=`
uniform float uShape;
uniform float uTile;
uniform float uRadius;
uniform vec2 uCenter;
uniform float uRows;
uniform float uSpin;
uniform float uTilt;
uniform float uGap;
uniform float uSparkle;
uniform float uClock;
uniform float uSeed;
uniform float uLod;
uniform float uRoom;
uniform float uStars;
uniform vec3 uTint;

vec3 rotX(vec3 v, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec3(v.x, c * v.y - s * v.z, s * v.y + c * v.z);
}

vec3 rotY(vec3 v, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec3(c * v.x + s * v.z, v.y, -s * v.x + c * v.z);
}

vec3 photo(vec2 px) {
  return toLinear(textureLod(uInput, clamp(px / uResolution, 0.0, 1.0), uLod).rgb);
}

float glint(vec3 n, vec3 light, float sharp) {
  vec3 r = reflect(vec3(0.0, 0.0, -1.0), n);
  return pow(max(dot(r, normalize(light)), 0.0), sharp);
}

void main() {
  vec2 p = vUv * uResolution - uCenter;
  vec3 center;
  vec2 cell;
  vec2 local;
  vec2 foot;
  float facing = 1.0;
  float inside = 1.0;
  vec2 sampleAt;

  if (uShape < 0.5) {
    vec2 q = p / uRadius;
    float r2 = dot(q, q);
    inside = 1.0 - smoothstep(1.0 - 2.0 / uRadius, 1.0, sqrt(r2));
    vec3 n = vec3(q, sqrt(max(1.0 - r2, 0.0)));
    vec3 b = rotY(rotX(n, -uTilt), uSpin);
    float lat = asin(clamp(b.y, -1.0, 1.0));
    float lon = atan(b.x, b.z);
    float alpha = PI / uRows;
    float fy = (lat + PI * 0.5) / alpha;
    float row = floor(fy);
    float latC = -PI * 0.5 + (row + 0.5) * alpha;
    float count = max(3.0, floor(TAU * cos(latC) / alpha + 0.5));
    float shift = hash11(row * 7.13 + uSeed);
    float fx = (lon / TAU + 0.5) * count + shift;
    float col = floor(fx);
    float lonC = ((col + 0.5 - shift) / count - 0.5) * TAU;
    vec3 c = vec3(cos(latC) * sin(lonC), sin(latC), cos(latC) * cos(lonC));
    center = rotX(rotY(c, -uSpin), uTilt);
    cell = vec2(mod(col, count), row);
    local = vec2(fract(fx), fract(fy));
    vec2 dLon = vec2(dFdx(lon), dFdy(lon));
    dLon -= TAU * floor(dLon / TAU + 0.5);
    foot = vec2(length(dLon) * count / TAU, length(vec2(dFdx(lat), dFdy(lat))) / alpha);
    facing = n.z;
    vec2 flat2 = center.xy;
    float len = length(flat2);
    float bulge = len > 1e-4 ? mix(1.0, (asin(min(len, 1.0)) / len) * 0.6366, 0.35) : 0.7781;
    sampleAt = uCenter + flat2 * bulge * uRadius * 1.08;
  } else {
    vec2 g = p / uTile;
    cell = floor(g);
    local = fract(g);
    foot = vec2(1.0 / uTile);
    center = vec3(0.0, 0.0, 1.0);
    sampleAt = uCenter + (cell + 0.5) * uTile;
  }

  vec3 h = hash32(cell + uSeed * 17.31);
  vec3 tilted = normalize(center + vec3(h.x - 0.5, h.y - 0.5, 0.0) * 0.32);
  vec3 tile = photo(sampleAt);
  float shade = 0.72 + 0.5 * h.z;
  shade *= mix(1.0, 0.45 + 0.55 * facing, 0.6);
  float lit = luma(tile);

  float spin = uShape < 0.5 ? 0.0 : uSpin;
  vec3 keyLight = vec3(cos(spin) * -0.55, 0.6 + sin(spin) * 0.25, 0.75);
  vec3 fillLight = vec3(0.65, -0.35 + cos(spin * 1.3) * 0.2, 0.7);
  float spec = glint(tilted, keyLight, 90.0) + 0.6 * glint(tilted, fillLight, 140.0);
  float phase = uClock * (0.6 + h.y * 1.1) + h.x * TAU;
  float twinkle = pow(max(sin(phase), 0.0), 18.0) * step(h.z, 0.3 + 0.5 * uSparkle);
  float flash = (spec * 2.4 + twinkle * 2.0) * uSparkle * (0.7 + 0.5 * lit);

  vec2 edge = min(local, 1.0 - local);
  float gap = uGap * 0.14;
  vec2 dist = (edge - gap) / max(foot, vec2(1e-5));
  float body = clamp(min(dist.x, dist.y) + 0.5, 0.0, 1.0);
  float bevel = (smoothstep(0.35, 0.0, local.y - gap) - smoothstep(0.35, 0.0, 1.0 - local.y - gap)) * 0.18;

  vec2 off = local - 0.5;
  float spot = exp(-dot(off, off) * 40.0);
  vec3 mirror = pow(tile, vec3(1.3)) + vec3(0.010, 0.011, 0.013) * (0.4 + h.y);
  vec3 color = mirror * shade * (1.0 + bevel) + uTint * flash * (0.4 + spot * 1.5);
  color *= mix(0.05, 1.0, body);
  float star = step(fract(h.z * 13.7 + h.x * 3.1), uStars);
  float energy = (spec * 1.6 + twinkle * 1.8) * uSparkle * star * spot * body * smoothstep(0.08, 0.6, lit);

  if (uShape < 0.5) {
    vec3 room = toLinear(texture(uInput, vUv).rgb) * uRoom;
    vec2 sp = p / (uTile * 2.4);
    sp.x += uSpin * 5.0 * (1.0 + 0.25 * sin(floor(sp.y) * 1.7));
    vec2 sc = floor(sp);
    vec3 sh = hash32(sc + 91.7 + uSeed);
    vec2 sf = fract(sp) - 0.5 - (sh.xy - 0.5) * 0.45;
    float mark = smoothstep(0.2, 0.1, length(sf)) * step(sh.z, 0.32);
    float flick = 0.55 + 0.45 * sin(uClock * (0.4 + sh.x) + sh.y * TAU);
    room += uTint * mark * flick * (room * 3.0 + 0.05) * uSparkle;
    color = mix(room, color, inside);
    energy *= inside;
  }
  outColor = vec4(color, energy);
}`,Tu=`
uniform vec2 uTexel;
uniform float uThreshold;
uniform vec3 uTint;

vec3 tap(vec2 uv) {
  vec4 t = texture(uInput, uv);
  vec3 c = t.rgb;
  float bright = max(c.r, max(c.g, c.b));
  float k = smoothstep(uThreshold, uThreshold + 0.4, bright);
  return c * k * 0.6;
}

void main() {
  vec3 a = tap(vUv + uTexel * vec2(-1.0, -1.0));
  vec3 b = tap(vUv + uTexel * vec2(1.0, -1.0));
  vec3 c = tap(vUv + uTexel * vec2(-1.0, 1.0));
  vec3 d = tap(vUv + uTexel * vec2(1.0, 1.0));
  outColor = vec4((a + b + c + d) * 0.25, 1.0);
}`,Lu=`
uniform vec2 uTexel;

void main() {
  vec2 t = uTexel;
  vec3 a = texture(uInput, vUv + t * vec2(-2.0, 2.0)).rgb;
  vec3 b = texture(uInput, vUv + t * vec2(0.0, 2.0)).rgb;
  vec3 c = texture(uInput, vUv + t * vec2(2.0, 2.0)).rgb;
  vec3 d = texture(uInput, vUv + t * vec2(-2.0, 0.0)).rgb;
  vec3 e = texture(uInput, vUv).rgb;
  vec3 f = texture(uInput, vUv + t * vec2(2.0, 0.0)).rgb;
  vec3 g = texture(uInput, vUv + t * vec2(-2.0, -2.0)).rgb;
  vec3 h = texture(uInput, vUv + t * vec2(0.0, -2.0)).rgb;
  vec3 i = texture(uInput, vUv + t * vec2(2.0, -2.0)).rgb;
  vec3 j = texture(uInput, vUv + t * vec2(-1.0, 1.0)).rgb;
  vec3 k = texture(uInput, vUv + t * vec2(1.0, 1.0)).rgb;
  vec3 l = texture(uInput, vUv + t * vec2(-1.0, -1.0)).rgb;
  vec3 m = texture(uInput, vUv + t * vec2(1.0, -1.0)).rgb;
  vec3 color = e * 0.125 + (a + c + g + i) * 0.03125 + (b + d + f + h) * 0.0625 + (j + k + l + m) * 0.125;
  outColor = vec4(color, 1.0);
}`,Uu=`
uniform sampler2D uLower;
uniform vec2 uTexel;

void main() {
  vec4 d = vec4(1.0, 1.0, -1.0, 0.0) * uTexel.xyxy;
  vec3 s = texture(uLower, vUv - d.xy).rgb;
  s += texture(uLower, vUv - d.wy).rgb * 2.0;
  s += texture(uLower, vUv - d.zy).rgb;
  s += texture(uLower, vUv + d.zw).rgb * 2.0;
  s += texture(uLower, vUv).rgb * 4.0;
  s += texture(uLower, vUv + d.xw).rgb * 2.0;
  s += texture(uLower, vUv + d.zy).rgb;
  s += texture(uLower, vUv + d.wy).rgb * 2.0;
  s += texture(uLower, vUv + d.xy).rgb;
  outColor = vec4(texture(uInput, vUv).rgb + s / 16.0 * 0.75, 1.0);
}`,Iu=`
uniform vec2 uSpan;
uniform vec3 uTint;
uniform float uCut;
uniform float uGain;

void main() {
  float a = texture(uInput, vUv + uSpan * vec2(-0.25, -0.25)).a;
  float b = texture(uInput, vUv + uSpan * vec2(0.25, -0.25)).a;
  float c = texture(uInput, vUv + uSpan * vec2(-0.25, 0.25)).a;
  float d = texture(uInput, vUv + uSpan * vec2(0.25, 0.25)).a;
  float e = max(max(a, b), max(c, d));
  outColor = vec4(uTint * max(e - uCut, 0.0) * uGain, 1.0);
}`,zu=`
uniform sampler2D uAccum;
uniform vec2 uStep;
uniform float uDecay;
uniform float uFinal;
uniform float uScale;

void main() {
  vec3 sum = texture(uInput, vUv).rgb;
  float w = 1.0;
  for (int s = 1; s < 4; s++) {
    w *= uDecay;
    vec2 o = uStep * float(s);
    sum += (texture(uInput, vUv + o).rgb + texture(uInput, vUv - o).rgb) * w;
  }
  if (uFinal > 0.5) sum = sum * uScale + texture(uAccum, vUv).rgb;
  outColor = vec4(sum, 1.0);
}`,Au=`
uniform sampler2D uBloom;
uniform sampler2D uSmall;
uniform sampler2D uFlares;
uniform float uGlow;
uniform float uFlare;
uniform float uLevels;

void main() {
  vec4 tiles = texture(uInput, vUv);
  vec3 base = clamp(tiles.rgb, 0.0, 1.0);
  vec3 mean = texture(uSmall, vec2(0.25)).rgb + texture(uSmall, vec2(0.75, 0.25)).rgb;
  mean += texture(uSmall, vec2(0.25, 0.75)).rgb + texture(uSmall, vec2(0.75)).rgb;
  float energy = luma(mean * 0.25);
  vec3 bloom = texture(uBloom, vUv).rgb / max(uLevels * 0.4, 1.0);
  bloom *= uGlow * 2.0 / (1.0 + energy * 6.0);
  vec3 flares = texture(uFlares, vUv).rgb;
  vec3 light = max(tiles.rgb - 1.0, 0.0) + bloom + flares * uFlare;
  vec3 color = 1.0 - (1.0 - base) * exp(-light);
  outColor = vec4(toGamma(color), 1.0);
}`,Ru=800,Du={id:"disco",name:"Mirror ball",category:"light",description:"The picture as glittering mirror tiles on a spinning disco ball, with bloom and star flares.",animated:!0,animates:e=>e.spin!==0||e.twinkle>0&&e.sparkle>0,params:[{key:"shape",label:"Shape",type:"select",default:"ball",options:[{value:"ball",label:"Mirror ball"},{value:"flat",label:"Flat tiles"}]},{key:"size",label:"Tile size",type:"number",min:4,max:60,step:.5,default:18},{key:"zoom",label:"Ball size",type:"number",min:.3,max:1.6,step:.01,default:1.1,when:e=>e.shape==="ball"},{key:"spin",label:"Spin",type:"number",min:-1,max:1,step:.01,default:.2},{key:"gap",label:"Grout",type:"number",min:0,max:1,step:.01,default:.35},{key:"sparkle",label:"Glitter",type:"number",min:0,max:1,step:.01,default:.6},{key:"twinkle",label:"Twinkle",type:"number",min:0,max:3,step:.01,default:1},{key:"glow",label:"Bloom",type:"number",min:0,max:2,step:.01,default:.7},{key:"flares",label:"Star flares",type:"number",min:0,max:2,step:.01,default:.8},{key:"rays",label:"Flare rays",type:"select",default:"6",options:[{value:"4",label:"Four"},{value:"6",label:"Six"},{value:"8",label:"Eight"}]},{key:"tint",label:"Light color",type:"color",default:"#fff1dc"},{key:"variation",label:"Variação",type:"number",min:0,max:100,step:1,default:0}],render(e,o,t){const a=o.mipmapped?o:e.mipmap(o),l=t.shape!=="flat",r=Math.max(2,t.size*e.unit),i=Math.hypot(e.width,e.height)/2,n=Math.max(8,t.zoom*i),u=Math.max(6,Math.round(Math.PI*n/r)),c=C(t.tint),s=e.pass("disco-tiles",Mu,{input:a,uniforms:{uShape:l?0:1,uTile:r,uRadius:n,uCenter:[e.width/2,e.height/2],uRows:u,uSpin:e.time*t.spin*.6,uTilt:.32,uGap:t.gap,uSparkle:t.sparkle,uClock:e.time*t.twinkle*2.2,uSeed:t.variation*1.37,uLod:Math.max(0,Math.log2(r)-1.2),uRoom:.16,uStars:.06,uTint:c}}),p=Math.max(2,Math.round(e.width/2)),f=Math.max(2,Math.round(e.height/2)),m=e.pass("disco-prefilter",Tu,{input:s,target:e.target(p,f),uniforms:{uTexel:[1/e.width,1/e.height],uThreshold:.6,uTint:c}}),d=[m];let v=m;for(;d.length<7&&Math.min(v.width,v.height)>12;){const P=e.pass("disco-down",Lu,{input:v,target:e.target(Math.max(1,Math.round(v.width/2)),Math.max(1,Math.round(v.height/2))),uniforms:{uTexel:[1/v.width,1/v.height]}});d.push(P),v=P}let g=d[d.length-1];for(let P=d.length-2;P>=0;P-=1){const D=d[P],F=e.pass("disco-up",Uu,{input:D,target:e.target(D.width,D.height),textures:{uLower:g},uniforms:{uTexel:[1/g.width,1/g.height]}});d.includes(g)||e.release(g),g=F}const x=g,k=Math.min(1,Ru/Math.max(e.width,e.height)),h=Math.max(2,Math.round(e.width*k)),b=Math.max(2,Math.round(e.height*k)),y=e.pass("disco-sparks",Iu,{input:s,target:e.target(h,b),uniforms:{uSpan:[1/h,1/b],uTint:c,uCut:.1,uGain:12}}),S=e.shared("disco-empty",P=>({texture:P.createTexture(1,1,{data:new Uint8Array([0,0,0,255])})})),L=(Number(t.rays)||6)/2,M=120*Math.max(h,b)/1e3;let A=null;for(let P=0;P<L;P+=1){const D=Math.PI/2+P*Math.PI/L+.2,F=M*(P%2===0?1:.62),H=Math.max(2,Math.min(5,Math.ceil(Math.log(F*4+1)/Math.log(4))));let j=1;for(let q=0;q<H;q+=1){const B=Math.exp(-Math.pow(4,q)/F);j*=1+2*(B+B*B+B*B*B)}let _=y;for(let q=0;q<H;q+=1){const B=Math.pow(4,q),W=e.pass("disco-streak",zu,{input:_,target:e.target(h,b),textures:{uAccum:A||S},uniforms:{uStep:[Math.cos(D)*B/h,Math.sin(D)*B/b],uDecay:Math.exp(-B/F),uFinal:q===H-1,uScale:6/j}});_!==y&&e.release(_),_=W}A&&e.release(A),A=_}const z=e.pass("disco-composite",Au,{input:s,textures:{uBloom:x,uSmall:d[d.length-1],uFlares:A},uniforms:{uGlow:t.glow,uFlare:t.flares,uLevels:d.length}});return d.forEach(P=>e.release(P)),d.includes(x)||e.release(x),e.release(s),e.release(y),e.release(A),z}},Eu=`
${re}
uniform sampler2D uDepth;
uniform float uSource;
uniform float uFocus;
uniform vec2 uShift;
uniform vec3 uLeft;
uniform vec3 uRight;
uniform float uColor;
uniform float uPop;

float depthAt(vec2 uv) {
  if (uSource < 0.5) return autoLevel(luma(texture(uDepth, uv).rgb));
  if (uSource < 1.5) return 1.0 - autoLevel(luma(texture(uDepth, uv).rgb));
  if (uSource < 2.5) {
    vec2 d = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
    return 1.0 - smoothstep(0.0, 0.8, length(d));
  }
  if (uSource < 3.5) return smoothstep(1.0, 0.0, uv.y);
  return 1.0;
}

vec3 pop(vec3 c) {
  float l = luma(c);
  c = mix(vec3(l), c, 1.0 + uPop * 0.6);
  c = (c - 0.5) * (1.0 + uPop * 0.45) + 0.5 + uPop * 0.04;
  return clamp(c, 0.0, 1.0);
}

void main() {
  float depth = depthAt(vUv);
  float focus = uSource > 3.5 ? 0.0 : uFocus;
  vec2 shift = uShift * (depth - focus);
  vec3 left = pop(texture(uInput, vUv + shift * 0.5).rgb);
  vec3 right = pop(texture(uInput, vUv - shift * 0.5).rgb);
  vec3 l = mix(vec3(luma(left)), left, uColor);
  vec3 r = mix(vec3(luma(right)), right, uColor);
  outColor = vec4(clamp(uLeft * l + uRight * r, 0.0, 1.0), 1.0);
}`,Pu={brightness:0,shadows:1,center:2,ground:3,flat:4},Et={"red-cyan":[[1,0,0],[0,1,1]],"green-magenta":[[0,1,0],[1,0,1]],"amber-blue":[[1,1,0],[0,0,1]]},qu={id:"anaglyph",name:"Anaglyph",category:"light",blend:"normal",description:"Red and cyan stereo 3D with depth pulled from the picture.",animated:!0,preview:{params:{amount:30,color:.3}},animates:e=>e.wiggle>0&&e.amount>0,params:[{key:"glasses",label:"Glasses",type:"select",default:"red-cyan",options:[{value:"red-cyan",label:"Red and cyan"},{value:"green-magenta",label:"Green and magenta"},{value:"amber-blue",label:"Amber and blue"},{value:"custom",label:"Personalizado"}]},{key:"lens",label:"Left lens",type:"color",default:"#ff2a55",when:e=>e.glasses==="custom"},{key:"amount",label:"Separation",type:"number",min:0,max:40,step:.1,default:18},{key:"angle",label:"Direção",type:"number",min:0,max:360,step:1,default:0},{key:"depth",label:"Depth from",type:"select",default:"brightness",options:[{value:"brightness",label:"Bright is near"},{value:"shadows",label:"Dark is near"},{value:"center",label:"Center is near"},{value:"ground",label:"Bottom is near"},{value:"flat",label:"Flat"}]},{key:"focus",label:"Focus",type:"number",min:0,max:1,step:.01,default:.35,when:e=>e.depth!=="flat"},{key:"smoothing",label:"Depth softness",type:"number",min:0,max:1,step:.01,default:.4,when:e=>e.depth==="brightness"||e.depth==="shadows"},{key:"color",label:"Cor",type:"number",min:0,max:1,step:.01,default:.45},{key:"pop",label:"Pop",type:"number",min:0,max:1,step:.01,default:.35},{key:"wiggle",label:"Wiggle",type:"number",min:0,max:1,step:.01,default:0}],render(e,o,t){const a=Pu[t.depth]??0,l=a<2,r=l?E(e,o,(1.5+t.smoothing*22)*e.unit):null,i=l?J(e,r):null,n=C(t.lens),[u,c]=t.glasses==="custom"?[n,n.map(g=>1-g)]:Et[t.glasses]||Et["red-cyan"],s=e.time,p=t.wiggle>0?1+Math.sin(s*2.2)*.7*t.wiggle:1,f=t.focus+(t.wiggle>0?Math.sin(s*1.3+1)*.22*t.wiggle:0),m=t.angle*Math.PI/180,d=t.amount*e.unit*p*(a>3?1:2),v=e.pass("anaglyph",Eu,{input:o,textures:{uDepth:r||o,uStats:i?i.target:o},uniforms:{uStatsTop:i?i.top:0,uSource:a,uFocus:f,uShift:[Math.cos(m)*d/e.width,Math.sin(m)*d/e.height],uLeft:u,uRight:c,uColor:t.color,uPop:t.pop}});return r&&e.release(r),i&&e.release(i.target),v}},Fu=`
${re}
uniform sampler2D uSoft;
uniform float uThreshold;
uniform float uEdges;
uniform vec2 uStep;

void main() {
  vec3 c = texture(uSoft, vUv).rgb;
  float l = luma(c);
  float level = mix(l, autoLevel(l), 0.6);
  float bright = smoothstep(uThreshold, uThreshold + 0.45, level);
  bright *= bright;
  float gx = luma(texture(uSoft, vUv + vec2(uStep.x, 0.0)).rgb) - luma(texture(uSoft, vUv - vec2(uStep.x, 0.0)).rgb);
  float gy = luma(texture(uSoft, vUv + vec2(0.0, uStep.y)).rgb) - luma(texture(uSoft, vUv - vec2(0.0, uStep.y)).rgb);
  float edge = smoothstep(0.02, 0.14, length(vec2(gx, gy)));
  float presence = max(bright * (1.0 - 0.8 * uEdges), edge * smoothstep(0.05, 0.3, l) * (0.3 + 0.9 * uEdges));
  outColor = vec4(toLinear(c), presence);
}`,Bu=`
uniform sampler2D uPresence;
uniform float uCell;
uniform float uRadius;
uniform float uDensity;
uniform float uClock;
uniform vec2 uFlow;
uniform float uTwinkle;
uniform float uWander;
uniform float uSeed;
uniform float uMode;
uniform vec3 uTint;

vec3 tone(vec3 c) {
  float top = max(c.r, max(c.g, c.b));
  vec3 hue = c / max(top, 1e-4);
  hue = pow(hue, vec3(1.5));
  return hue * (0.3 + 0.7 * sqrt(top));
}

vec3 layer(vec2 px, float scale, float speed, float index) {
  float cell = uCell * scale;
  vec2 shift = uFlow * uClock * speed;
  vec2 q = (px - shift) / cell;
  vec2 base = floor(q);
  vec3 sum = vec3(0.0);
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 c = base + vec2(float(i), float(j));
      vec4 h = vec4(hash32(c + uSeed + index * 57.3), hash12(c * 1.7 + index * 13.1 + uSeed));
      vec2 wobble = vec2(sin(uClock * (0.7 + h.x) + h.y * TAU), cos(uClock * (0.6 + h.y) + h.z * TAU)) * 0.12;
      vec2 at = c + 0.5 + (h.xy - 0.5) * 0.7 + wobble * uWander;
      vec2 screen = at * cell + shift;
      vec4 info = textureLod(uPresence, screen / uResolution, 0.0);
      float visible = smoothstep(h.z - 0.08, h.z + 0.08, info.a * uDensity);
      if (visible <= 0.0) continue;
      float r = uRadius * scale * (0.55 + 0.9 * h.w * h.w);
      float d = length(q - at) * cell / r;
      float dot2 = exp(-d * d * 1.6) + exp(-d * 1.7) * 0.12;
      float flicker = mix(1.0, 0.35 + 0.65 * pow(0.5 + 0.5 * sin(uClock * (1.3 + h.w * 2.5) + h.x * TAU), 2.0), uTwinkle);
      vec3 color = uMode < 0.5 ? tone(info.rgb) : uTint;
      sum += color * dot2 * visible * flicker * (0.6 + 0.8 * h.w);
    }
  }
  return sum;
}

void main() {
  vec2 px = vUv * uResolution;
  vec3 dust = layer(px, 1.0, 1.0, 0.0);
  dust += layer(px, 1.45, 1.6, 1.0) * 0.85;
  dust += layer(px, 0.7, 0.65, 2.0) * 0.9;
  outColor = vec4(dust, 1.0);
}`,Gu=`
uniform sampler2D uDust;
uniform sampler2D uHalo;
uniform float uBackground;
uniform float uGlow;
uniform float uBrightness;

void main() {
  vec3 image = toLinear(texture(uInput, vUv).rgb);
  vec3 ground = image * uBackground * uBackground;
  vec3 dust = texture(uDust, vUv).rgb * uBrightness;
  vec3 halo = texture(uHalo, vUv).rgb * uGlow * uBrightness;
  vec3 color = 1.0 - (1.0 - ground) * exp(-(dust + halo));
  outColor = vec4(toGamma(color), 1.0);
}`,Nu={id:"dust",name:"Dreamdust",category:"light",description:"The picture dissolved into a drifting dust of glowing particles.",animated:!0,animates:e=>e.drift>0||e.twinkle>0,params:[{key:"size",label:"Particle size",type:"number",min:.5,max:6,step:.05,default:1.6},{key:"density",label:"Densidade",type:"number",min:0,max:1,step:.01,default:.6},{key:"threshold",label:"Threshold",type:"number",min:0,max:1,step:.01,default:.4},{key:"edges",label:"Outline focus",type:"number",min:0,max:1,step:.01,default:.5},{key:"glow",label:"Glow",type:"number",min:0,max:2,step:.01,default:.6},{key:"brightness",label:"Brilho",type:"number",min:.2,max:3,step:.01,default:1.5},{key:"colorMode",label:"Cor",type:"select",default:"image",options:[{value:"image",label:"From image"},{value:"tint",label:"One color"}]},{key:"tint",label:"Tint",type:"color",default:"#ffd59a",when:e=>e.colorMode==="tint"},{key:"background",label:"Image beneath",type:"number",min:0,max:1,step:.01,default:.12},{key:"drift",label:"Drift",type:"number",min:0,max:2,step:.01,default:.4},{key:"direction",label:"Direção",type:"number",min:0,max:360,step:1,default:90},{key:"twinkle",label:"Twinkle",type:"number",min:0,max:1,step:.01,default:.5},{key:"variation",label:"Variação",type:"number",min:0,max:100,step:1,default:0}],render(e,o,t){const a=Math.max(.6,t.size*e.unit),l=E(e,o,Math.max(1,a*1.5),{maxSigma:3}),r=J(e,o),i=Math.max(2,Math.round(e.width/2)),n=Math.max(2,Math.round(e.height/2)),u=e.pass("dust-presence",Fu,{input:l,target:e.target(i,n),textures:{uSoft:l,uStats:r.target},uniforms:{uStatsTop:r.top,uThreshold:t.threshold*.9-.1,uEdges:t.edges,uStep:[6*e.unit/e.width,6*e.unit/e.height]}});e.release(l),e.release(r.target);const c=t.direction*Math.PI/180,s=t.drift*40*e.unit,p=e.pass("dust-particles",Bu,{input:o,textures:{uPresence:u},uniforms:{uCell:a*(8-t.density*3.5),uRadius:a,uDensity:.08+t.density,uClock:e.time,uFlow:[Math.cos(c)*s,Math.sin(c)*s],uTwinkle:t.twinkle,uWander:Math.min(t.drift*2,1),uSeed:t.variation*7.31,uMode:t.colorMode==="tint"?1:0,uTint:C(t.tint)}});e.release(u);const f=E(e,p,Math.max(1.5,a*3),{maxSigma:3}),m=e.pass("dust-composite",Gu,{input:o,textures:{uDust:p,uHalo:f},uniforms:{uBackground:t.background,uGlow:t.glow*1.5,uBrightness:t.brightness}});return e.release(p),e.release(f),m}},Ou=`
uniform float uScale;
uniform vec2 uStep;

void main() {
  float x = luma(texture(uInput, vUv + vec2(uStep.x, 0.0)).rgb) - luma(texture(uInput, vUv - vec2(uStep.x, 0.0)).rgb);
  float y = luma(texture(uInput, vUv + vec2(0.0, uStep.y)).rgb) - luma(texture(uInput, vUv - vec2(0.0, uStep.y)).rgb);
  float s = length(vec2(x, y)) * 0.5 * uScale;
  outColor = vec4(vec3(s), s);
}`,Hu=`
uniform sampler2D uFine;
uniform sampler2D uWide;
uniform sampler2D uStrength;
uniform float uStrengthTop;
uniform float uWidth;
uniform float uThreshold;
uniform float uScale;
uniform float uMode;
uniform vec3 uColor;

float dog(vec2 uv) {
  return luma(texture(uFine, uv).rgb) - luma(texture(uWide, uv).rgb);
}

float level(vec2 uv) {
  return luma(texture(uFine, uv).rgb);
}

vec3 vivid(vec3 c) {
  float top = max(c.r, max(c.g, c.b));
  vec3 hue = c / max(top, 1e-3);
  float spread = top - min(c.r, min(c.g, c.b));
  hue = mix(vec3(1.0), hue, clamp(spread / max(top, 1e-3) * 1.6, 0.0, 1.0));
  return pow(hue, vec3(1.6));
}

void main() {
  vec2 px = 1.0 / uResolution;
  float f = dog(vUv);
  vec2 slope = vec2(dog(vUv + vec2(px.x, 0.0)) - dog(vUv - vec2(px.x, 0.0)), dog(vUv + vec2(0.0, px.y)) - dog(vUv - vec2(0.0, px.y))) * 0.5;
  float dist = abs(f) / max(length(slope), 1e-6);
  float line = 1.0 - smoothstep(uWidth * 0.5 - 0.6, uWidth * 0.5 + 0.6, dist);
  float typical = textureLod(uStrength, vec2(0.5), uStrengthTop).a;
  float th = clamp(typical * uThreshold, 0.01, 0.5);
  vec2 grad = vec2(level(vUv + vec2(px.x, 0.0)) - level(vUv - vec2(px.x, 0.0)), level(vUv + vec2(0.0, px.y)) - level(vUv - vec2(0.0, px.y))) * 0.5;
  float fine = length(grad) * uScale;
  float gate = smoothstep(th, th * 1.6, fine) * (0.55 + 0.45 * smoothstep(th, th * 4.0, fine));
  line *= gate;
  vec3 tone = uMode < 0.5 ? vivid(texture(uFine, vUv).rgb) : uColor;
  outColor = vec4(tone * line, line);
}`,Pt=`
uniform vec2 uTexel;

void main() {
  vec2 t = uTexel;
  vec3 a = texture(uInput, vUv + t * vec2(-2.0, 2.0)).rgb;
  vec3 b = texture(uInput, vUv + t * vec2(0.0, 2.0)).rgb;
  vec3 c = texture(uInput, vUv + t * vec2(2.0, 2.0)).rgb;
  vec3 d = texture(uInput, vUv + t * vec2(-2.0, 0.0)).rgb;
  vec3 e = texture(uInput, vUv).rgb;
  vec3 f = texture(uInput, vUv + t * vec2(2.0, 0.0)).rgb;
  vec3 g = texture(uInput, vUv + t * vec2(-2.0, -2.0)).rgb;
  vec3 h = texture(uInput, vUv + t * vec2(0.0, -2.0)).rgb;
  vec3 i = texture(uInput, vUv + t * vec2(2.0, -2.0)).rgb;
  vec3 j = texture(uInput, vUv + t * vec2(-1.0, 1.0)).rgb;
  vec3 k = texture(uInput, vUv + t * vec2(1.0, 1.0)).rgb;
  vec3 l = texture(uInput, vUv + t * vec2(-1.0, -1.0)).rgb;
  vec3 m = texture(uInput, vUv + t * vec2(1.0, -1.0)).rgb;
  vec3 color = e * 0.125 + (a + c + g + i) * 0.03125 + (b + d + f + h) * 0.0625 + (j + k + l + m) * 0.125;
  outColor = vec4(color, 1.0);
}`,Wu=`
uniform sampler2D uLower;
uniform vec2 uTexel;

void main() {
  vec4 d = vec4(1.0, 1.0, -1.0, 0.0) * uTexel.xyxy;
  vec3 s = texture(uLower, vUv - d.xy).rgb;
  s += texture(uLower, vUv - d.wy).rgb * 2.0;
  s += texture(uLower, vUv - d.zy).rgb;
  s += texture(uLower, vUv + d.zw).rgb * 2.0;
  s += texture(uLower, vUv).rgb * 4.0;
  s += texture(uLower, vUv + d.xw).rgb * 2.0;
  s += texture(uLower, vUv + d.zy).rgb;
  s += texture(uLower, vUv + d.wy).rgb * 2.0;
  s += texture(uLower, vUv + d.xy).rgb;
  outColor = vec4(texture(uInput, vUv).rgb + s / 16.0 * 0.6, 1.0);
}`,ju=`
uniform sampler2D uLines;
uniform sampler2D uGlow;
uniform float uBackground;
uniform float uGlowAmount;
uniform float uBrightness;
uniform float uPulse;
uniform float uClock;

void main() {
  vec3 image = toLinear(texture(uInput, vUv).rgb);
  vec3 ground = mix(vec3(luma(image)), image, 0.7) * uBackground * uBackground;
  vec4 lines = texture(uLines, vUv);
  vec3 glow = texture(uGlow, vUv).rgb * 0.8;
  vec2 p = vUv * uResolution / max(uResolution.x, uResolution.y);
  float wave = 0.5 + 0.5 * sin(uClock - (p.x * 0.8 + p.y * 1.3) * 7.0 + valueNoise(p * 3.0 + uClock * 0.1) * 3.0);
  float beat = mix(1.0, 0.35 + 1.1 * wave * wave, uPulse);
  vec3 tone = lines.rgb * uBrightness * beat;
  vec3 core = mix(tone, vec3(luma(tone)) + tone * 0.35, smoothstep(0.4, 1.0, lines.a) * 0.55);
  vec3 light = core + glow * uGlowAmount * uBrightness * beat;
  vec3 color = 1.0 - (1.0 - ground) * exp(-light);
  outColor = vec4(toGamma(color), 1.0);
}`,_u={id:"edgeglow",name:"Edge glow",category:"light",description:"Edges traced as glowing neon lines over a dark ground.",animated:!0,animates:e=>e.pulse>0,params:[{key:"colorMode",label:"Line color",type:"select",default:"image",options:[{value:"image",label:"From image"},{value:"custom",label:"One color"}]},{key:"color",label:"Cor",type:"color",default:"#3df0ff",when:e=>e.colorMode==="custom"},{key:"thickness",label:"Thickness",type:"number",min:.5,max:6,step:.1,default:1.4},{key:"glow",label:"Glow",type:"number",min:0,max:3,step:.01,default:1.2},{key:"brightness",label:"Brilho",type:"number",min:.2,max:3,step:.01,default:1.4},{key:"threshold",label:"Threshold",type:"number",min:0,max:1,step:.01,default:.3},{key:"detail",label:"Detalhe",type:"number",min:0,max:1,step:.01,default:.5},{key:"background",label:"Image beneath",type:"number",min:0,max:1,step:.01,default:.25},{key:"pulse",label:"Pulse",type:"number",min:0,max:1,step:.01,default:.3}],render(e,o,t){const a=(.7+Math.pow(1-t.detail,1.5)*5)*e.unit,l=E(e,o,a),r=E(e,o,a*1.6),i=Math.max(2,Math.round(e.width/4)),n=Math.max(2,Math.round(e.height/4)),u=e.mipmap(e.pass("edgeglow-strength",Ou,{input:l,target:e.target(i,n),uniforms:{uScale:a*2.5,uStep:[1/e.width,1/e.height]}})),c=e.pass("edgeglow-lines",Hu,{input:o,textures:{uFine:l,uWide:r,uStrength:u},uniforms:{uStrengthTop:Math.floor(Math.log2(Math.max(i,n))),uWidth:Math.max(.8,t.thickness*e.unit),uThreshold:.6+t.threshold*5,uScale:a*2.5,uMode:t.colorMode==="custom"?1:0,uColor:C(t.color)}});e.release(l),e.release(r),e.release(u);const s=Math.max(2,Math.round(e.width/2)),p=Math.max(2,Math.round(e.height/2)),f=e.pass("edgeglow-down",Pt,{input:c,target:e.target(s,p),uniforms:{uTexel:[.5/e.width,.5/e.height]}}),m=[f];let d=f;for(;m.length<5&&Math.min(d.width,d.height)>12;){const x=e.pass("edgeglow-down",Pt,{input:d,target:e.target(Math.max(1,Math.round(d.width/2)),Math.max(1,Math.round(d.height/2))),uniforms:{uTexel:[1/d.width,1/d.height]}});m.push(x),d=x}let v=m[m.length-1];for(let x=m.length-2;x>=0;x-=1){const k=m[x],h=e.pass("edgeglow-up",Wu,{input:k,target:e.target(k.width,k.height),textures:{uLower:v},uniforms:{uTexel:[1/v.width,1/v.height]}});m.includes(v)||e.release(v),v=h}const g=e.pass("edgeglow-composite",ju,{input:o,textures:{uLines:c,uGlow:v},uniforms:{uBackground:t.background,uGlowAmount:t.glow,uBrightness:t.brightness,uPulse:t.pulse,uClock:e.time*1.4}});return m.forEach(x=>e.release(x)),m.includes(v)||e.release(v),e.release(c),g}},$u=`
uniform vec2 uTexel;
uniform float uThreshold;
uniform float uKnee;

vec3 tap(vec2 uv) {
  return toLinear(texture(uInput, uv).rgb);
}

void main() {
  vec3 c = tap(vUv + uTexel * vec2(-0.5, -0.5));
  c += tap(vUv + uTexel * vec2(0.5, -0.5));
  c += tap(vUv + uTexel * vec2(-0.5, 0.5));
  c += tap(vUv + uTexel * vec2(0.5, 0.5));
  c *= 0.25;
  float bright = max(c.r, max(c.g, c.b));
  float soft = clamp(bright - uThreshold + uKnee, 0.0, 2.0 * uKnee);
  soft = soft * soft / (4.0 * uKnee + 1e-5);
  float k = max(soft, bright - uThreshold) / max(bright, 1e-5);
  outColor = vec4(c * k, 1.0);
}`,qt=`
uniform float uMode;
uniform vec2 uCenter;
uniform vec2 uDir;
uniform float uSpan;
uniform float uTotal;
uniform float uDecay;
uniform float uTurn;
uniform float uLinearize;
uniform float uSalt;

vec2 at(vec2 uv, float t) {
  if (uMode < 0.5) return uCenter + (uv - uCenter) * (1.0 - t);
  if (uMode < 1.5) {
    vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 d = (uv - uCenter) * aspect;
    return uCenter + rotation(t * uTurn) * d / aspect;
  }
  return uv - uDir * t;
}

void main() {
  float jitter = hash12(gl_FragCoord.xy + uSalt);
  vec3 sum = vec3(0.0);
  float total = 0.0;
  for (int i = 0; i < 16; i++) {
    float t = (float(i) + jitter) / 16.0 * uSpan;
    float w = exp(-t / max(uTotal, 1e-4) * uDecay);
    vec3 c = texture(uInput, at(vUv, t)).rgb;
    if (uLinearize > 0.5) c = toLinear(c);
    sum += c * w;
    total += w;
  }
  outColor = vec4(sum / total, 1.0);
}`,Vu=`
uniform vec2 uTexel;

void main() {
  vec2 t = uTexel;
  vec3 a = texture(uInput, vUv + t * vec2(-2.0, 2.0)).rgb;
  vec3 b = texture(uInput, vUv + t * vec2(0.0, 2.0)).rgb;
  vec3 c = texture(uInput, vUv + t * vec2(2.0, 2.0)).rgb;
  vec3 d = texture(uInput, vUv + t * vec2(-2.0, 0.0)).rgb;
  vec3 e = texture(uInput, vUv).rgb;
  vec3 f = texture(uInput, vUv + t * vec2(2.0, 0.0)).rgb;
  vec3 g = texture(uInput, vUv + t * vec2(-2.0, -2.0)).rgb;
  vec3 h = texture(uInput, vUv + t * vec2(0.0, -2.0)).rgb;
  vec3 i = texture(uInput, vUv + t * vec2(2.0, -2.0)).rgb;
  vec3 j = texture(uInput, vUv + t * vec2(-1.0, 1.0)).rgb;
  vec3 k = texture(uInput, vUv + t * vec2(1.0, 1.0)).rgb;
  vec3 l = texture(uInput, vUv + t * vec2(-1.0, -1.0)).rgb;
  vec3 m = texture(uInput, vUv + t * vec2(1.0, -1.0)).rgb;
  vec3 color = e * 0.125 + (a + c + g + i) * 0.03125 + (b + d + f + h) * 0.0625 + (j + k + l + m) * 0.125;
  outColor = vec4(color, 1.0);
}`,Xu=`
uniform sampler2D uLower;
uniform vec2 uTexel;

void main() {
  vec4 d = vec4(1.0, 1.0, -1.0, 0.0) * uTexel.xyxy;
  vec3 s = texture(uLower, vUv - d.xy).rgb;
  s += texture(uLower, vUv - d.wy).rgb * 2.0;
  s += texture(uLower, vUv - d.zy).rgb;
  s += texture(uLower, vUv + d.zw).rgb * 2.0;
  s += texture(uLower, vUv).rgb * 4.0;
  s += texture(uLower, vUv + d.xw).rgb * 2.0;
  s += texture(uLower, vUv + d.zy).rgb;
  s += texture(uLower, vUv + d.wy).rgb * 2.0;
  s += texture(uLower, vUv + d.xy).rgb;
  outColor = vec4(texture(uInput, vUv).rgb + s / 16.0, 1.0);
}`,Yu=`
uniform sampler2D uSmeared;
uniform sampler2D uLight;
uniform sampler2D uBloom;
uniform sampler2D uSmall;
uniform float uMode;
uniform vec2 uCenter;
uniform float uStrength;
uniform float uSmear;
uniform float uShadows;
uniform float uIntensity;
uniform float uLevels;
uniform vec3 uTint;

void main() {
  vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
  vec3 sharp = toLinear(texture(uInput, vUv).rgb);
  vec3 soft = texture(uSmeared, vUv).rgb;
  float reach = uMode < 1.5 ? smoothstep(0.0, 0.25, length((vUv - uCenter) * aspect) * uStrength) : 1.0;
  vec3 base = mix(sharp, soft, uSmear * reach);
  float l = luma(base);
  base = mix(vec3(l), base, 1.0 + uShadows * 0.35);
  base = clamp(max(base, 0.0) * min(pow(max(l, 1e-4) / 0.4, uShadows * 1.4), 1.0), 0.0, 1.0);
  vec3 streak = texture(uLight, vUv).rgb;
  vec3 bloom = texture(uBloom, vUv).rgb / max(uLevels, 1.0);
  vec3 mean = texture(uSmall, vec2(0.25)).rgb + texture(uSmall, vec2(0.75, 0.25)).rgb;
  mean += texture(uSmall, vec2(0.25, 0.75)).rgb + texture(uSmall, vec2(0.75)).rgb;
  float energy = luma(mean * 0.25);
  vec3 light = (streak * 2.4 + bloom * 0.6) * uIntensity / (1.0 + energy * 10.0);
  vec3 hue = uTint / max(max(uTint.r, max(uTint.g, uTint.b)), 1e-3);
  float level = luma(light);
  vec3 ramp = mix(hue * hue * hue * hue, mix(hue, vec3(1.0), 0.5), smoothstep(0.1, 1.8, level));
  light = mix(light, level * ramp * 1.5, 0.8);
  vec3 color = 1.0 - (1.0 - base) * exp(-light);
  outColor = vec4(toGamma(color), 1.0);
}`,Ku={zoom:0,swirl:1,directional:2},Zu={id:"warpbloom",name:"Warp bloom",category:"light",blend:"normal",description:"Highlights smeared and blossomed into light, zooming, swirling or sweeping across the frame.",animated:!0,animates:e=>e.pulse>0&&(e.strength>0||e.intensity>0),params:[{key:"mode",label:"Warp",type:"select",default:"zoom",options:[{value:"zoom",label:"Zoom"},{value:"swirl",label:"Swirl"},{value:"directional",label:"Directional"}]},{key:"strength",label:"Smear",type:"number",min:0,max:1,step:.01,default:.55},{key:"x",label:"Center X",type:"number",min:0,max:1,step:.01,default:.5,when:e=>e.mode!=="directional"},{key:"y",label:"Center Y",type:"number",min:0,max:1,step:.01,default:.4,when:e=>e.mode!=="directional"},{key:"angle",label:"Ângulo",type:"number",min:0,max:360,step:1,default:90,when:e=>e.mode==="directional"},{key:"threshold",label:"Threshold",type:"number",min:0,max:1,step:.01,default:.78},{key:"intensity",label:"Bloom",type:"number",min:0,max:3,step:.01,default:1.3},{key:"tint",label:"Light color",type:"color",default:"#ffd2a1"},{key:"smear",label:"Image smear",type:"number",min:0,max:1,step:.01,default:.8},{key:"shadows",label:"Shadows",type:"number",min:0,max:1,step:.01,default:.8},{key:"pulse",label:"Pulse",type:"number",min:0,max:1,step:.01,default:.3}],render(e,o,t){const a=Ku[t.mode]??0,l=t.pulse>0?Math.sin(e.time*1.6)*.5+Math.sin(e.time*.7+1.3)*.5:0,r=Math.max(0,t.strength*(1+l*.3*t.pulse)),i=t.intensity*(1+l*.25*t.pulse),n=Math.max(2,Math.round(e.width/2)),u=Math.max(2,Math.round(e.height/2)),c=Math.pow(t.threshold,2.2),s=e.pass("warpbloom-extract",$u,{input:o,target:e.target(n,u),uniforms:{uTexel:[1/e.width,1/e.height],uThreshold:c,uKnee:Math.max(c*.6,.02)}}),p=t.angle*Math.PI/180,f=a===0?r*.85:a===1?r:r*.6,m=[Math.cos(p),Math.sin(p)*e.width/e.height],d=[t.x,1-t.y],v=(S,I,L,M)=>{const A=e.pass("warpbloom-smear",qt,{input:S,target:e.target(n,u),uniforms:{uMode:a,uCenter:d,uDir:m,uSpan:I/16,uTotal:I,uDecay:1.6,uTurn:Math.PI*.9,uLinearize:L,uSalt:M}}),z=e.pass("warpbloom-smear",qt,{input:A,target:e.target(n,u),uniforms:{uMode:a,uCenter:d,uDir:m,uSpan:I,uTotal:I,uDecay:1.6,uTurn:Math.PI*.9,uLinearize:0,uSalt:M+17}});return e.release(A),z},g=v(s,f,0,0),x=v(o,f*.7,1,31),k=[s];let h=s;for(;k.length<6&&Math.min(h.width,h.height)>12;){const S=e.pass("warpbloom-down",Vu,{input:h,target:e.target(Math.max(1,Math.round(h.width/2)),Math.max(1,Math.round(h.height/2))),uniforms:{uTexel:[1/h.width,1/h.height]}});k.push(S),h=S}let b=k[k.length-1];for(let S=k.length-2;S>=1;S-=1){const I=k[S],L=e.pass("warpbloom-up",Xu,{input:I,target:e.target(I.width,I.height),textures:{uLower:b},uniforms:{uTexel:[1/b.width,1/b.height]}});k.includes(b)||e.release(b),b=L}const y=e.pass("warpbloom-composite",Yu,{input:o,textures:{uSmeared:x,uLight:g,uBloom:b,uSmall:k[k.length-1]},uniforms:{uMode:a,uCenter:d,uStrength:r,uSmear:t.smear,uShadows:t.shadows,uIntensity:i,uLevels:k.length-1,uTint:C(t.tint)}});return k.forEach(S=>e.release(S)),k.includes(b)||e.release(b),e.release(g),e.release(x),y}},Ju=`
${re}
uniform vec2 uSpan;
uniform float uLod;
uniform float uLocalLod;
uniform vec2 uRing;
uniform float uThreshold;
uniform float uPoints;
uniform float uSpread;

vec3 grab(vec2 uv) {
  return textureLod(uInput, uv, uLod).rgb;
}

float weight(vec3 c) {
  vec2 moments = textureLod(uStats, vec2(0.5), uStatsTop).rg;
  float spread = sqrt(max(moments.y - moments.x * moments.x, 1e-5));
  float start = clamp(moments.x + uThreshold * spread, 0.4, 0.88);
  float k = clamp((luma(c) - start) / (1.0 - start), 0.0, 1.0);
  return k * k * k;
}

void main() {
  vec3 a = grab(vUv + uSpan * vec2(-0.25, -0.25));
  vec3 b = grab(vUv + uSpan * vec2(0.25, -0.25));
  vec3 c = grab(vUv + uSpan * vec2(-0.25, 0.25));
  vec3 d = grab(vUv + uSpan * vec2(0.25, 0.25));
  vec3 la = toLinear(a) * weight(a);
  vec3 lb = toLinear(b) * weight(b);
  vec3 lc = toLinear(c) * weight(c);
  vec3 ld = toLinear(d) * weight(d);
  vec3 glow = mix((la + lb + lc + ld) * 0.25, max(max(la, lb), max(lc, ld)), 0.5);
  float top = max(max(luma(a), luma(b)), max(luma(c), luma(d)));
  float ring = 0.0;
  for (int i = 0; i < 8; i++) {
    float turn = float(i) * 0.7853982;
    ring = max(ring, luma(textureLod(uInput, vUv + vec2(cos(turn), sin(turn)) * uRing, uLocalLod).rgb));
  }
  float point = smoothstep(0.04, 0.3, top - ring);
  vec3 emit = glow * (uSpread + uPoints * point);
  outColor = vec4(emit, luma(glow) + luma(emit) * 0.04);
}`,Qu=`
uniform vec2 uSpan;
void main() {
  vec4 sum = texture(uInput, vUv + uSpan * vec2(-0.5, -0.5));
  sum += texture(uInput, vUv + uSpan * vec2(0.5, -0.5));
  sum += texture(uInput, vUv + uSpan * vec2(-0.5, 0.5));
  sum += texture(uInput, vUv + uSpan * vec2(0.5, 0.5));
  vec3 hue = sum.rgb / max(max(sum.r, max(sum.g, sum.b)), 1e-5);
  outColor = vec4(hue * sum.a * 0.25, 1.0);
}`,e0=`
uniform sampler2D uAccum;
uniform vec2 uStep;
uniform float uDecay;
uniform float uBoth;
uniform float uFinal;
uniform float uScale;
uniform vec2 uLane;
uniform float uLaneUnit;
uniform float uShimmer;
uniform float uBeams;
uniform float uClock;

void main() {
  vec3 sum = texture(uInput, vUv).rgb;
  float w = 1.0;
  for (int s = 1; s < 4; s++) {
    w *= uDecay;
    vec2 o = uStep * float(s);
    sum += texture(uInput, vUv + o).rgb * w;
    if (uBoth > 0.5) sum += texture(uInput, vUv - o).rgb * w;
  }
  if (uFinal > 0.5) {
    float lane = dot(vUv * uResolution, uLane) / uLaneUnit;
    float flicker = valueNoise(vec2(lane * 0.45, uClock * 0.9)) * 0.6 + valueNoise(vec2(lane * 0.11 + 17.0, uClock * 0.4)) * 0.4;
    float gain = 1.0 + uShimmer * (flicker - 0.5) * 1.8;
    if (uBeams > 0.5) {
      float shaft = valueNoise(vec2(lane * 0.03, uClock * 0.2 + 5.0)) * 0.6 + valueNoise(vec2(lane * 0.08 + 3.0, -uClock * 0.3)) * 0.4;
      gain = (0.25 + smoothstep(0.3, 0.75, shaft) * 1.5) * (1.0 + uShimmer * (flicker - 0.5) * 0.6);
    }
    sum = sum * uScale * gain + texture(uAccum, vUv).rgb;
  }
  outColor = vec4(max(sum, 0.0), 1.0);
}`,Ft=`
uniform vec2 uStep;
void main() {
  vec3 sum = texture(uInput, vUv).rgb * 0.227027;
  sum += (texture(uInput, vUv + uStep * 1.3846154).rgb + texture(uInput, vUv - uStep * 1.3846154).rgb) * 0.3162162;
  sum += (texture(uInput, vUv + uStep * 3.2307692).rgb + texture(uInput, vUv - uStep * 3.2307692).rgb) * 0.0702703;
  outColor = vec4(sum, 1.0);
}`,t0=`
uniform sampler2D uStreak;
uniform sampler2D uShafts;
uniform sampler2D uHalo;
uniform sampler2D uBright;
uniform float uBrightTop;
uniform vec3 uTint;
uniform float uImageColor;
uniform float uIntensity;
uniform float uShaftAmount;
uniform float uGlow;

vec3 colorize(vec3 light) {
  float l = luma(light);
  vec3 hue = light / max(max(light.r, max(light.g, light.b)), 1e-4);
  vec3 own = mix(vec3(1.0), hue, 0.9) * l * 1.2;
  return mix(uTint * l, own * mix(vec3(1.0), uTint, 0.2), uImageColor);
}

void main() {
  vec3 base = toLinear(texture(uInput, vUv).rgb);
  float energy = textureLod(uBright, vec2(0.5), uBrightTop).a;
  float exposure = 1.0 / (0.2 + energy * 8.0);
  vec3 light = colorize(texture(uStreak, vUv).rgb) * uIntensity;
  light += colorize(texture(uShafts, vUv).rgb) * uShaftAmount;
  light += colorize(texture(uHalo, vUv).rgb) * uGlow;
  light *= min(exposure, 5.0);
  vec3 color = 1.0 - (1.0 - base) * exp(-light);
  outColor = vec4(toGamma(color), 1.0);
}`,o0=640;function Bt(e,o,{axes:t,both:a,base:l,lambda:r,shimmer:i,clock:n,perUnit:u,empty:c,beams:s=0}){const p=o.width,f=o.height,m=Math.max(2,Math.min(6,Math.ceil(Math.log(r*4+1)/Math.log(4)))),d=1/Math.sqrt(t);let v=null;for(let g=0;g<t;g+=1){const x=l+g*(a?Math.PI:Math.PI*2)/t,k=[-Math.cos(x),-Math.sin(x)];let h=1;for(let y=0;y<m;y+=1){const S=Math.exp(-Math.pow(4,y)/r);h*=1+(a?2:1)*(S+S*S+S*S*S)}let b=o;for(let y=0;y<m;y+=1){const S=Math.pow(4,y),I=e.pass("rays-streak",e0,{input:b,target:e.target(p,f),textures:{uAccum:v||c},uniforms:{uStep:[k[0]*S/p,k[1]*S/f],uDecay:Math.exp(-S/r),uBoth:a,uFinal:y===m-1,uScale:d/h,uLane:[-k[1],k[0]],uLaneUnit:u,uShimmer:i,uBeams:s,uClock:n+g*3.1}});b!==o&&e.release(b),b=I}v&&e.release(v),v=b}return v}const a0={id:"rays",name:"Rays",category:"light",blend:"normal",description:"Light streaming from the brightest points as streaks, star bursts and shafts.",animated:!0,preview:{params:{intensity:1.6,shafts:1}},animates:e=>e.shimmer>0&&(e.intensity>0||e.shafts>0),params:[{key:"rays",label:"Rays",type:"number",min:1,max:8,step:1,default:2},{key:"length",label:"Duração",type:"number",min:0,max:1,step:.01,default:.55},{key:"angle",label:"Ângulo",type:"number",min:0,max:360,step:1,default:0},{key:"threshold",label:"Threshold",type:"number",min:0,max:1,step:.01,default:.55},{key:"intensity",label:"Streaks",type:"number",min:0,max:3,step:.01,default:1},{key:"spread",label:"Spread",type:"number",min:0,max:1,step:.01,default:.5},{key:"shafts",label:"Light shafts",type:"number",min:0,max:2,step:.01,default:.6},{key:"glow",label:"Halo",type:"number",min:0,max:2,step:.01,default:.5},{key:"tint",label:"Cor",type:"color",default:"#a8d2ff"},{key:"colorize",label:"Image color",type:"number",min:0,max:1,step:.01,default:.35},{key:"shimmer",label:"Shimmer",type:"number",min:0,max:1,step:.01,default:.45}],render(e,o,t){if(t.intensity<=0&&t.glow<=0&&t.shafts<=0)return o;const a=o.mipmapped?o:e.mipmap(o),l=Math.min(1,o0/Math.max(e.width,e.height)),r=Math.max(2,Math.round(e.width*l)),i=Math.max(2,Math.round(e.height*l)),n=Math.max(r,i)/1e3,u=J(e,o),c=e.pass("rays-bright",Ju,{input:a,target:e.target(r,i),textures:{uStats:u.target},uniforms:{uStatsTop:u.top,uSpan:[1/r,1/i],uLod:Math.max(0,Math.log2(1/l)-1),uLocalLod:Math.max(0,Math.log2(Math.max(1,2*e.unit))),uRing:[7*e.unit/e.width,7*e.unit/e.height],uThreshold:t.threshold*3-.4,uPoints:24,uSpread:t.spread}});e.release(u.target);const s=e.shared("rays-empty",I=>({texture:I.createTexture(1,1,{data:new Uint8Array([0,0,0,255])})})),p=Math.max(1,Math.min(8,Math.round(t.rays))),f=p%2===0,m=f?p/2:p,d=Math.max(.5,(4+380*t.length*t.length)*n),v=t.shimmer>0?e.time*(.3+t.shimmer*.9):0,g=Bt(e,c,{axes:m,both:f,base:t.angle*Math.PI/180,lambda:d,shimmer:t.shimmer,clock:v,perUnit:n,empty:s}),x=Math.max(2,Math.round(r/2)),k=Math.max(2,Math.round(i/2)),h=e.pass("rays-shrink",Qu,{input:c,target:e.target(x,k),uniforms:{uSpan:[1/r,1/i]}}),b=Bt(e,h,{axes:m,both:f,base:t.angle*Math.PI/180,lambda:d*.55,shimmer:t.shimmer,clock:v,perUnit:n/2,empty:s,beams:1});let y=h;for(let I=0;I<2;I+=1){const L=e.pass("rays-blur",Ft,{input:y,target:e.target(x,k),uniforms:{uStep:[1.5/x,0]}});y!==h&&e.release(y),y=e.pass("rays-blur",Ft,{input:L,target:e.target(x,k),uniforms:{uStep:[0,1.5/k]}}),e.release(L)}const S=e.pass("rays-composite",t0,{input:o,textures:{uStreak:g,uShafts:b,uHalo:y,uBright:e.mipmap(c)},uniforms:{uBrightTop:Math.floor(Math.log2(Math.max(r,i))),uTint:C(t.tint),uImageColor:t.colorize,uIntensity:t.intensity*5,uShaftAmount:t.shafts*3,uGlow:t.glow*1.5}});return[c,h,g,b,y].forEach(I=>e.release(I)),S}},Qt=[To,zo,mu,gu,Oo,Cu,oa,ra,na,sa,uu,da,va,ba,xa,wa,ui,di,hi,Ui,Ri,qi,ji,Zi,sn,jr,vn,bn,wn,Mn,Un,Pn,Bn,On,_n,Xn,eu,Ma,Ua,za,Ra,fl,Cl,Pl,Bl,Ea,Wa,ol,Wl,$l,Xl,Kl,Du,qu,Nu,_u,Zu,a0,Jl,tr,gr,yr,kr,Sr,Tr,Ur,zr,Rr,bo,Er,qr,Br,Nr,$r,Xr,An,li],l0=[{id:"type",label:"Type"},{id:"print",label:"Print"},{id:"pixel",label:"Pixel"},{id:"art",label:"Art"},{id:"geometric",label:"Geometric"},{id:"glass",label:"Glass"},{id:"light",label:"Claro"},{id:"material",label:"Material"},{id:"analog",label:"Analog"},{id:"glitch",label:"Glitch"},{id:"film",label:"Film"},{id:"color",label:"Cor"},{id:"lens",label:"Lens and blur"},{id:"distort",label:"Distort"}],Qe=Object.fromEntries(Qt.map(e=>[e.id,e])),r0="screen",m0=e=>{var o;return((o=Qe[e])==null?void 0:o.blend)||r0},d0=e=>Object.fromEntries(e.params.map(o=>[o.key,Array.isArray(o.default)?[...o.default]:o.default])),i0={disco:["shape","size","sparkle"],anaglyph:["glasses","amount","depth"],dust:["density","size","glow"],edgeglow:["thickness","glow","threshold"],warpbloom:["mode","strength","intensity"],rays:["rays","length","intensity"],sketch:["medium","shading","outline"],warhol:["layout","colorway","tones"],woodblock:["palette","simplify","lines"],chrome:["environment","roughness","depth"],crystallize:["size","facets","edges"],emboss:["material","depth","light"],marble:["swirl","veins","colors"],molten:["alloy","heat","crust"],thinfilm:["film","thickness","spread"],voxel:["size","relief","shading"],forms:["shape","size","palette"],truchet:["size","pattern","width"],lattice:["size","weave","bend"],lowpoly:["size","detail","edges"],extrude:["size","height","rotation"],neongrid:["density","glow","threshold"],flowfield:["density","length","curl"],schematic:["density","style","background"],specimen:["count","size","fill"],frosted:["frost","texture","clear"],stained:["size","lead","glow"],vitrine:["size","facet","refraction"],shatter:["size","displacement","pattern"],orb:["size","refraction","dispersion"],pixelsort:["low","length","angle"],forensics:["palette","intensity","detail"],droste:["scale","arms","zoom"],distort:["strength","radius","speed"],ascii:["size","coverage","glow"],halftone:["size","angle","contrast"],dither:["palette","pattern","pixel"],points:["style","size","density"],pixel:["size","shape","gap"],posterize:["levels","outline","saturation"],ink:["weight","shading","detail"],paint:["radius","flow","canvas"],watercolor:["radius","edges","granulation"],engrave:["density","relief","style"],chalk:["shading","sensitivity","board"],contour:["levels","width","smoothing"],crt:["curvature","scan","glow"],vhs:["tape","bleed","noise"],chromatic:["amount","mode"],glitch:["amount","blocks","split"],jpeg:["quality","size"],datamosh:["intensity","size","drift"],echo:["length","tint"],bars:["count","intensity","speed"],smear:["mode","position","variance"],bloom:["intensity","threshold","radius"],halation:["intensity","radius"],leak:["intensity","position","spread"],sparkle:["intensity","threshold","spacing"],lens:["distortion","vignette","chroma"],blur:["amount","mode"],bokeh:["radius","gain","shape"],grain:["amount","size"],film:["dust","scratches","weave"],scratches:["opacity","density"],paper:["wrinkles","folds","grain"],letterbox:["ratio","color"],adjust:["exposure","contrast","saturation"],grade:["split","curve","shadows","highlights"],gradient:["palette","contrast"],hue:["shift","cycle"],warp:["strength","scale","speed"],ripple:["amplitude","frequency"],water:["refraction","size","highlights"],fluted:["size","distortion","shape"],refract:["spread","swirl"],kaleidoscope:["segments","zoom","spin"]},n0=new Set(["adjust","grade","grain","bloom","halation","lens","letterbox","scratches","paper","film","hue","chromatic"]),u0=e=>e.primary??Math.max(0,e.layers.findIndex(o=>!n0.has(o.type))),p0=(e,o)=>{var n;if(!e||!o.length)return null;const t=u0(e),a=o[t],l=a&&Qe[a.type];if(!l||a.type!==((n=e.layers[t])==null?void 0:n.type))return null;const i=(e.controls||i0[a.type]||l.hero||l.params.slice(0,3).map(u=>u.key)).map(u=>l.params.find(c=>c.key===u)).filter(u=>u&&(!u.when||u.when(a.params)));return i.length?{layer:a,effect:l,params:i}:null},s0=[{id:"type",label:"Type"},{id:"print",label:"Print"},{id:"pixel",label:"Pixel"},{id:"art",label:"Art"},{id:"geometric",label:"Geometric"},{id:"glass",label:"Glass"},{id:"light",label:"Light and color"},{id:"material",label:"Material"},{id:"signal",label:"Signal"},{id:"film",label:"Film"},{id:"blur",label:"Desfoque"},{id:"motion",label:"Movimento"},{id:"distort",label:"Distort"}],eo=[{id:"soft-type",name:"Soft type",group:"type",tags:"ascii glyphs blur dreamy",primary:2,layers:[{type:"blur",params:{mode:"gaussian",amount:5}},{type:"adjust",params:{exposure:-.45}},{type:"ascii",params:{charset:"letters",size:9.5,weight:"regular",behind:"color",color:"image",lift:.5,opacity:.95,coverage:.32,threshold:.42,fade:.7,depth:.35,glow:.7,spread:.65,twinkle:.3,flicker:.04,contrast:1.1,background:"#000000"}},{type:"grain",params:{amount:.14,size:1.2,chroma:.1,motion:1}}]},{id:"terminal",name:"Terminal",group:"type",layers:[{type:"ascii",params:{charset:"standard",size:8,color:"ink",ink:"#8dffb0",background:"#050806",contrast:1.35,flicker:.35}},{type:"bloom",params:{threshold:.25,intensity:.9,radius:.75,tint:"#8dffb0"}},{type:"crt",params:{curvature:.18,scan:.35,mask:"none",glow:.25,vignette:.45,roll:.25,flicker:.15}}]},{id:"color-type",name:"Color type",group:"type",layers:[{type:"ascii",params:{charset:"dense",size:8,color:"image",background:"#09080c",backdrop:.2,contrast:1.3,flicker:.2}}]},{id:"matrix",name:"Rain",group:"type",layers:[{type:"ascii",params:{charset:"matrix",size:9,color:"gradient",ink:"#0b5c2c",accent:"#b9ffd4",background:"#020403",contrast:1.4,rain:.85,flicker:.45}},{type:"bloom",params:{threshold:.3,intensity:.8,tint:"#9dffc2"}}]},{id:"braille",name:"Braille",group:"type",layers:[{type:"ascii",params:{charset:"braille",size:14,color:"ink",ink:"#f2efe8",background:"#111014",contrast:1.25,flicker:.15}}]},{id:"outline-type",name:"Outline type",group:"type",layers:[{type:"ascii",params:{charset:"minimal",size:8,color:"ink",ink:"#e9e4da",background:"#0d0c11",edges:.65,contrast:1.2,flicker:.1}}]},{id:"blocks",name:"Blocks",group:"type",tags:"ascii quadrant terminal pixel",layers:[{type:"ascii",params:{charset:"blocks",size:9,behind:"color",background:"#09090b",contrast:1.15}}]},{id:"dot-matrix",name:"Dot matrix",group:"type",tags:"ascii dots halftone",layers:[{type:"ascii",params:{charset:"dots",size:10,behind:"color",background:"#0a090d",glow:.35}}]},{id:"diamonds",name:"Diamonds",group:"type",tags:"ascii jewel glyphs",layers:[{type:"ascii",params:{charset:"diamonds",size:11,behind:"color",background:"#0b0a0e",glow:.25}}]},{id:"crosses",name:"Crosses",group:"type",tags:"ascii plus cross stitch",layers:[{type:"ascii",params:{charset:"crosses",size:11,behind:"color",background:"#0b0a0e",glow:.3}}]},{id:"strokes",name:"Strokes",group:"type",tags:"ascii diagonal slashes",layers:[{type:"ascii",params:{charset:"strokes",size:9,behind:"color",background:"#0b0a0e",lift:.2,glow:.45,contrast:1.3}}]},{id:"barcode",name:"Barcode",group:"type",tags:"ascii lines vertical",layers:[{type:"ascii",params:{charset:"lines",size:11,behind:"color",background:"#0a090d",glow:.2}}]},{id:"studio",name:"Studio",group:"type",tags:"ascii palette poster",layers:[{type:"ascii",params:{charset:"dense",size:6.5,behind:"color",background:"#050507",color:"palette",palette:"dusk",glow:.45,contrast:1.3}}]},{id:"mixed-glyphs",name:"Mixed glyphs",group:"type",tags:"ascii blocks symbols",layers:[{type:"ascii",params:{charset:"mixed",size:8,behind:"color",background:"#08080a",contrast:1.25}}]},{id:"typewriter",name:"Typewriter",group:"type",tags:"ascii paper ink print",layers:[{type:"ascii",blend:"normal",params:{charset:"standard",size:7.5,weight:"bold",behind:"color",background:"#efe9dc",color:"ink",ink:"#1c1a19",invert:!0,contrast:1.6,brightness:.06,spread:1.4,flicker:0}},{type:"paper",params:{paper:"#ffffff",shadow:"#d9d2c4",wrinkles:.5,folds:.25,drops:.15}}]},{id:"newsprint",name:"Newsprint",group:"print",layers:[{type:"halftone",params:{mode:"mono",size:6,angle:45,paper:"#ece6d9",ink:"#1c1b1e",contrast:1.25,rough:.45}},{type:"grain",params:{amount:.18,size:.9,chroma:0,motion:.6}}]},{id:"pop-print",name:"CMYK",group:"print",layers:[{type:"adjust",params:{saturation:1.25,contrast:1.1}},{type:"halftone",params:{mode:"cmyk",size:10,angle:15,misregister:.35,rough:.3}}]},{id:"riso",name:"Riso",group:"print",layers:[{type:"halftone",params:{mode:"duotone",size:7,angle:22,paper:"#f4efe4",ink:"#2440ff",accent:"#ff4a6b",misregister:.55,rough:.55,contrast:1.2}},{type:"grain",params:{amount:.22,size:1.3,chroma:0,motion:.5}}]},{id:"comic",name:"Comic",group:"print",layers:[{type:"posterize",params:{levels:4,smooth:1.6,saturation:1.35,outline:.7,line:"#141217"}},{type:"halftone",mix:.35,blend:"multiply",params:{mode:"mono",size:5,angle:45,paper:"#ffffff",ink:"#1a1820"}}]},{id:"ink-sketch",name:"Ink sketch",group:"art",layers:[{type:"ink",params:{weight:1,detail:.6,shading:.55,boil:.35}}]},{id:"banknote",name:"Banknote",group:"print",layers:[{type:"engrave",params:{style:"line",density:140,relief:.8,waviness:.5,ink:"#1f3a2c",paper:"#ece6d3"}},{type:"paper",params:{shadow:"#d6d0c2",grain:.35,fibers:.35,wrinkles:.45,folds:.25,drops:.1}}]},{id:"zine",name:"Zine",group:"print",layers:[{type:"halftone",params:{mode:"mono",size:6,angle:45,paper:"#f1efe9",ink:"#161616",contrast:1.45,rough:.5}},{type:"paper",params:{shadow:"#c9c6bf",wrinkles:.7,crumples:.45,folds:.6,foldsY:0,drops:.25}}]},{id:"watercolor",name:"Watercolor",group:"art",layers:[{type:"watercolor",params:{radius:10,edges:.7,granulation:.55,lightness:.4}}]},{id:"chalkboard",name:"Chalkboard",group:"art",layers:[{type:"chalk",params:{board:"#1f2a25",chalk:"#efece2",shading:.6,grain:.5}}]},{id:"topographic",name:"Topographic",group:"geometric",layers:[{type:"contour",params:{levels:12,width:1.3,smoothing:.5,background:"color",fill:"#0f1014",lineMode:"image"}}]},{id:"spiral-etch",name:"Spiral etch",group:"geometric",layers:[{type:"engrave",params:{style:"spiral",density:120,relief:.5,waviness:.15,ink:"#151417",paper:"#f3efe6"}}]},{id:"pixel-art",name:"Pixel art",group:"pixel",tags:"retro 16-bit palette",layers:[{type:"pixel",params:{shape:"square",size:7,palette:"resurrect64",dither:.25}}]},{id:"mosaic-tiles",name:"Tiles",group:"pixel",tags:"mosaic photo tiles grout",layers:[{type:"pixel",params:{shape:"mosaic",size:8,tile:"square"}}]},{id:"bricks",name:"Bricks",group:"pixel",tags:"lego toy studs",layers:[{type:"pixel",params:{shape:"brick",size:8,piece:"plate",brickColors:"toy"}}]},{id:"voxels",name:"Voxels",group:"pixel",tags:"cubes 3d isometric",layers:[{type:"voxel",params:{}}]},{id:"honeycomb",name:"Honeycomb",group:"pixel",tags:"hex hexagon mosaic",layers:[{type:"pixel",params:{shape:"hex",size:10,palette:"none",gap:.12,background:"#0c0b10"}}]},{id:"home-computer",name:"Home computer",group:"pixel",tags:"c64 retro 8-bit",layers:[{type:"pixel",params:{shape:"square",size:6,palette:"c64",dither:.45}}]},{id:"game-boy",name:"Handheld",group:"pixel",layers:[{type:"adjust",params:{contrast:1.35,exposure:-.15}},{type:"dither",params:{palette:"gameboy",pattern:"bayer4",pixel:3,contrast:1.3}}]},{id:"one-bit",name:"1-bit",group:"pixel",layers:[{type:"dither",params:{palette:"custom",colors:["#0f0e12","#f2eee6"],pattern:"blue",pixel:1.5,contrast:1.25}}]},{id:"pico",name:"Fantasy console",group:"pixel",layers:[{type:"adjust",params:{saturation:1.3,contrast:1.1}},{type:"dither",params:{palette:"pico8",match:"color",pattern:"bayer4",pixel:3.5,contrast:1.15}}]},{id:"arcade",name:"Arcade",group:"pixel",layers:[{type:"pixel",params:{shape:"square",size:4,palette:"none"}},{type:"crt",params:{curvature:.5,scan:.7,mask:"aperture",maskStrength:.45,glow:.55,roll:.2}}]},{id:"led-wall",name:"LED wall",group:"pixel",layers:[{type:"adjust",params:{saturation:1.3,contrast:1.15}},{type:"pixel",params:{shape:"round",size:11,gap:.3,glow:.65}},{type:"bloom",params:{threshold:.35,intensity:.7}}]},{id:"tape",name:"Tape",group:"signal",layers:[{type:"adjust",params:{saturation:.9,contrast:1.05,temperature:.08}},{type:"vhs",params:{bleed:.85,jitter:.5,noise:.35,tracking:.55,fade:.5}},{type:"chromatic",params:{mode:"linear",amount:2.5}}]},{id:"signal-loss",name:"Signal loss",group:"signal",layers:[{type:"vhs",params:{bleed:.6,jitter:.9,noise:.55,tracking:.8,fade:.4}},{type:"glitch",params:{amount:.55,blocks:.4,split:.8,frequency:.55}}]},{id:"broadcast",name:"Broadcast",group:"signal",layers:[{type:"crt",params:{curvature:.35,scan:.55,mask:"slot",maskStrength:.4,glow:.4,roll:.35}}]},{id:"corrupt",name:"Corrupt",group:"signal",layers:[{type:"datamosh",params:{intensity:.75}},{type:"chromatic",params:{mode:"linear",amount:2}}]},{id:"deep-fried",name:"Deep fried",group:"signal",layers:[{type:"adjust",params:{exposure:.1,contrast:1.35,saturation:1.7,vibrance:.3,sharpen:1.2}},{type:"jpeg",params:{quality:7,size:14,bleed:"high"}}]},{id:"sliced",name:"Sliced",group:"signal",layers:[{type:"bars",params:{count:9,intensity:.1,speed:.6}},{type:"chromatic",params:{mode:"linear",amount:3.5}},{type:"grain",params:{amount:.1,size:1,motion:1}}]},{id:"super-8",name:"Super 8",group:"film",layers:[{type:"adjust",params:{temperature:.22,contrast:1.12,fade:.28,saturation:.95}},{type:"halation",params:{threshold:.4,radius:10,intensity:.6}},{type:"grain",params:{amount:.36,size:1.7,chroma:.25,motion:1}},{type:"film",params:{weave:.45,flicker:.4,dust:.45,scratches:.35,fade:.2,fps:18}},{type:"lens",params:{distortion:.04,chroma:.25,softness:.25,vignette:.55}}]},{id:"cinema",name:"Cinema",group:"film",layers:[{type:"grade",params:{split:.6,curve:.5,blacks:.025,rolloff:.65,saturation:.95}},{type:"halation",params:{threshold:.55,radius:8,intensity:.45}},{type:"grain",params:{amount:.2,size:1,chroma:.1,motion:1}},{type:"lens",params:{distortion:0,chroma:.15,softness:.15,vignette:.4}},{type:"letterbox",params:{ratio:"2.39"}}]},{id:"night-glow",name:"Night glow",group:"film",layers:[{type:"adjust",params:{exposure:-.2,contrast:1.2,saturation:1.1}},{type:"bloom",params:{threshold:.45,intensity:1.2,radius:.85}},{type:"halation",params:{threshold:.35,radius:14,intensity:.7}},{type:"grain",params:{amount:.25,size:1.2,motion:1}}]},{id:"expired",name:"Expired film",group:"film",layers:[{type:"grade",params:{shadows:"#2d6a5a",highlights:"#ffb36b",split:.75,curve:.3,blacks:.08,saturation:.85}},{type:"leak",params:{position:"right",intensity:.3,spread:.55}},{type:"grain",params:{amount:.34,size:1.4,chroma:.3,motion:1}},{type:"scratches",params:{opacity:.45,density:1}},{type:"lens",params:{distortion:.02,chroma:.2,softness:.2,vignette:.5}}]},{id:"reeded",name:"Reeded",group:"glass",layers:[{type:"fluted",params:{shape:"lines",profile:"prism",size:28,distortion:.55,highlights:.15,shadows:.3}}]},{id:"wave-glass",name:"Wave glass",group:"glass",layers:[{type:"fluted",params:{shape:"wave",profile:"lens",size:40,distortion:.6,frost:.15,highlights:.2}}]},{id:"pool",name:"Pool",group:"glass",layers:[{type:"water",params:{refraction:.2,highlights:.35}},{type:"grade",params:{shadows:"#1c6e8a",highlights:"#e8fbff",split:.4,curve:.25,rolloff:.4}}]},{id:"prism",name:"Prism",group:"light",layers:[{type:"refract",params:{}},{type:"bloom",params:{threshold:.7,intensity:.5}}]},{id:"oil",name:"Oil paint",group:"art",layers:[{type:"paint",params:{radius:7,flow:.85,sharpness:8,saturation:1.2,canvas:.45,light:.4}},{type:"adjust",params:{vibrance:.2,contrast:1.05}}]},{id:"thermal",name:"Thermal",group:"light",layers:[{type:"blur",params:{mode:"gaussian",amount:2}},{type:"gradient",params:{palette:"thermal",contrast:1.25}},{type:"grain",params:{amount:.15,size:1,chroma:0,motion:1}}]},{id:"poster",name:"Poster",group:"art",layers:[{type:"posterize",params:{levels:5,smooth:1.4,saturation:1.2,outline:.25}},{type:"gradient",mix:.55,blend:"soft-light",params:{palette:"dusk"}},{type:"grain",params:{amount:.15,size:1,motion:.5}}]},{id:"dream",name:"Dream",group:"motion",layers:[{type:"adjust",params:{exposure:.12,saturation:1.12,contrast:1.05}},{type:"blur",mix:.5,blend:"screen",params:{mode:"gaussian",amount:18}},{type:"blur",mix:.35,blend:"multiply",params:{mode:"gaussian",amount:9}},{type:"leak",params:{position:"top-left",intensity:.3,spread:.7,streaks:.4,speed:.6}},{type:"grain",params:{amount:.12,size:1.2,motion:1}}]},{id:"liquid",name:"Liquid",group:"motion",layers:[{type:"warp",params:{strength:.085,scale:1.5,speed:.8,split:.6}},{type:"chromatic",params:{mode:"radial",amount:5,wobble:.4}}]},{id:"mandala",name:"Mandala",group:"motion",layers:[{type:"kaleidoscope",params:{segments:10,zoom:1.15,spin:.2}},{type:"hue",params:{cycle:.25}},{type:"bloom",params:{threshold:.6,intensity:.5}}]},{id:"glitter",name:"Glitter",group:"light",layers:[{type:"sparkle",params:{threshold:.74,intensity:12,spacing:50}},{type:"bloom",params:{threshold:.65,intensity:.5}}]},{id:"slit-scan",name:"Pixel stretch",group:"motion",layers:[{type:"smear",params:{mode:"stretch",angle:0,position:.55,variance:.45,speed:.6}},{type:"grain",params:{amount:.12,size:1,motion:1}}]},{id:"pixel-sort",name:"Pixel sort",group:"signal",tags:"glitch sorting streaks",layers:[{type:"pixelsort",params:{low:.22,high:.96,length:.85,randomness:.6}}]},{id:"forensics",name:"Forensics",group:"signal",tags:"error level heat analysis",layers:[{type:"forensics",params:{}}]},{id:"rgb-split",name:"RGB split",group:"signal",tags:"chromatic aberration channels",layers:[{type:"chromatic",params:{mode:"linear",amount:16,wobble:.35}},{type:"adjust",params:{contrast:1.12,saturation:1.15}}]},{id:"scanlines",name:"Scanlines",group:"signal",tags:"broadcast interlace tv",layers:[{type:"crt",params:{curvature:0,lines:3,scan:.8,mask:"none",glow:.3,vignette:.3,flicker:.1,roll:.25}}]},{id:"lofi",name:"Lo-fi",group:"signal",tags:"tape vhs muted grain",layers:[{type:"grade",params:{split:.35,curve:.2,blacks:.08,rolloff:.7,saturation:.8}},{type:"vhs",params:{tape:"lp",bleed:.9,noise:.45,jitter:.35,tracking:.2,fade:.6}},{type:"grain",params:{amount:.22,size:1.3,motion:1}}]},{id:"twirl",name:"Twirl",group:"distort",tags:"spiral vortex swirl",layers:[{type:"distort",params:{type:"twirl",strength:.65,radius:.6}}]},{id:"pinch",name:"Pinch",group:"distort",tags:"suck squeeze",layers:[{type:"distort",params:{type:"pinch",strength:.7,radius:.6}}]},{id:"bulge",name:"Bulge",group:"distort",tags:"spherize fisheye",layers:[{type:"distort",params:{type:"bulge",strength:.7,radius:.6}}]},{id:"little-planet",name:"Little planet",group:"distort",tags:"polar coordinates tiny planet",layers:[{type:"distort",params:{type:"polar",polarMode:"wrap"}}]},{id:"shear",name:"Shear",group:"distort",tags:"skew slant",layers:[{type:"distort",params:{type:"shear",strength:.75,curve:"wave"}}]},{id:"smudge",name:"Smudge",group:"distort",tags:"drip smear melt",layers:[{type:"distort",params:{type:"smudge",strength:.6}}]},{id:"zigzag",name:"Zigzag",group:"distort",tags:"waves ridges",layers:[{type:"distort",params:{type:"zigzag",strength:.45,ridges:14}}]},{id:"ripple-rings",name:"Ripple",group:"distort",tags:"water rings pond",layers:[{type:"ripple",params:{mode:"rings",amplitude:.014,frequency:1.2,shine:.35}}]},{id:"soft-focus",name:"Soft focus",group:"blur",tags:"gaussian dreamy glow",layers:[{type:"blur",params:{mode:"gaussian",amount:10}},{type:"bloom",params:{threshold:.6,intensity:.6}}]},{id:"motion-blur",name:"Movimento",group:"blur",tags:"speed streak",layers:[{type:"blur",params:{mode:"motion",amount:34,angle:0}}]},{id:"zoom-burst",name:"Zoom burst",group:"blur",tags:"radial zoom",layers:[{type:"blur",params:{mode:"zoom",amount:26}}]},{id:"miniature",name:"Miniature",group:"blur",tags:"tilt shift toy",layers:[{type:"blur",params:{mode:"tilt",amount:14,focus:.45,width:.18}},{type:"adjust",params:{saturation:1.35,contrast:1.12}}]},{id:"bokeh",name:"Bokeh",group:"blur",tags:"lens blur depth highlights",layers:[{type:"bokeh",params:{radius:40,gain:9}},{type:"grade",params:{split:.35,curve:.3,rolloff:.6}}]},{id:"noir",name:"Noir",group:"film",tags:"black white monochrome",layers:[{type:"adjust",params:{saturation:0,contrast:1.35,exposure:-.05}},{type:"grade",params:{split:0,curve:.7,blacks:-.04,rolloff:.5,saturation:0}},{type:"grain",params:{amount:.3,size:1.2,chroma:0,motion:1}},{type:"lens",params:{distortion:0,chroma:0,softness:.2,vignette:.75}}]},{id:"bleach",name:"Bleach bypass",group:"film",tags:"desaturated contrast silver",layers:[{type:"grade",params:{split:.2,curve:.85,blacks:-.03,rolloff:.4,saturation:.45}},{type:"grain",params:{amount:.22,size:1,chroma:.05,motion:1}}]},{id:"golden-hour",name:"Golden hour",group:"film",tags:"warm sunset glow",layers:[{type:"grade",params:{shadows:"#5b3a6e",highlights:"#ffb347",split:.7,curve:.35,blacks:.03,rolloff:.65}},{type:"halation",params:{threshold:.45,radius:12,intensity:.6}},{type:"leak",params:{position:"top-right",intensity:.28,spread:.6}},{type:"grain",params:{amount:.16,size:1.1,motion:1}}]},{id:"bauhaus",name:"Bauhaus",group:"geometric",layers:[{type:"forms",blend:"normal",params:{shape:"mixed",palette:"bauhaus",background:"#efe8da",size:30,scale:1.05,floor:.6,contrast:1.4}},{type:"grain",params:{amount:.16,size:1.2}}]},{id:"asterisk",name:"Asterisk",group:"geometric",layers:[{type:"forms",params:{shape:"asterisk",palette:"image",size:26,scale:1.2,floor:0,contrast:1.6}}]},{id:"arcs",name:"Arcs",group:"geometric",layers:[{type:"truchet",params:{size:22,width:.24}}]},{id:"maze",name:"Maze",group:"geometric",layers:[{type:"truchet",params:{pattern:"maze",style:"diagonal",size:18,width:.2,contrast:1.5}}]},{id:"woven",name:"Woven",group:"geometric",layers:[{type:"lattice",params:{size:20}}]},{id:"basket",name:"Basket",group:"geometric",layers:[{type:"lattice",params:{weave:"basket",size:26,bend:2,depth:.85}}]},{id:"low-poly",name:"Low poly",group:"geometric",layers:[{type:"lowpoly",params:{}}]},{id:"origami",name:"Origami",group:"geometric",layers:[{type:"lowpoly",params:{size:84,detail:.5,relief:.65,saturation:.9,edges:0}},{type:"grain",params:{amount:.12,size:1.4}}]},{id:"skyline",name:"Skyline",group:"geometric",layers:[{type:"extrude",params:{}}]},{id:"data-city",name:"Data city",group:"geometric",layers:[{type:"extrude",params:{palette:"gradient",size:12,gap:.3,height:1.3,turn:.15}}]},{id:"wireframe",name:"Wireframe",group:"geometric",layers:[{type:"neongrid",params:{threshold:.42,density:36}}]},{id:"synthwave",name:"Synthwave",group:"geometric",layers:[{type:"neongrid",params:{view:"perspective",color:"#ff4fd8",threshold:.35,density:40,backdrop:.12}}]},{id:"currents",name:"Currents",group:"geometric",layers:[{type:"flowfield",params:{}}]},{id:"pen-flow",name:"Pen flow",group:"geometric",layers:[{type:"flowfield",blend:"normal",params:{ground:"light",color:"ink",ink:"#1a1820",width:2.6,density:1,contrast:2.5}}]},{id:"schematic",name:"Schematic",group:"geometric",layers:[{type:"schematic",params:{}}]},{id:"blueprint",name:"Blueprint",group:"geometric",layers:[{type:"schematic",blend:"normal",params:{background:"blueprint"}}]},{id:"circuit",name:"Circuit",group:"geometric",layers:[{type:"schematic",params:{style:"circuit",background:"dim",density:32}}]},{id:"field-notes",name:"Field notes",group:"geometric",layers:[{type:"specimen",params:{}}]},{id:"frosted",name:"Frosted",group:"glass",layers:[{type:"frosted",params:{}}]},{id:"rain-window",name:"Rain window",group:"glass",layers:[{type:"frosted",params:{clear:"drips",clearSize:.7,frost:.55}}]},{id:"hammered",name:"Hammered",group:"glass",layers:[{type:"frosted",params:{texture:"hammered",size:28,frost:.3}}]},{id:"crystal-ball",name:"Crystal ball",group:"glass",layers:[{type:"orb",params:{}}]},{id:"shattered",name:"Shattered",group:"glass",layers:[{type:"shatter",params:{}}]},{id:"crackle",name:"Crackle",group:"glass",layers:[{type:"shatter",params:{pattern:"crackle",size:90,cracks:.9,displacement:.3}}]},{id:"stained-glass",name:"Stained glass",group:"glass",layers:[{type:"stained",params:{}}]},{id:"rose-window",name:"Rose window",group:"glass",layers:[{type:"stained",params:{pattern:"rose"}}]},{id:"pressed-glass",name:"Pressed glass",group:"glass",layers:[{type:"vitrine",params:{}}]},{id:"glass-blocks",name:"Glass blocks",group:"glass",layers:[{type:"vitrine",params:{facet:"dome",size:90,refraction:.55}}]},{id:"chrome",name:"Chrome",group:"material",layers:[{type:"chrome",params:{detail:.7,depth:.7}}]},{id:"mercury",name:"Mercury",group:"material",layers:[{type:"chrome",params:{environment:"horizon",tint:"#dfe2e8",backdrop:"#0e0f12",roughness:.3,speed:.4}}]},{id:"crystal",name:"Crystal",group:"material",layers:[{type:"crystallize",params:{size:36,edges:.12}}]},{id:"gemstone",name:"Gemstone",group:"material",layers:[{type:"crystallize",params:{size:34,facets:.8,edges:.3}}]},{id:"pressed-metal",name:"Pressed metal",group:"material",layers:[{type:"emboss",params:{depth:.85,shadow:.6,texture:.25}}]},{id:"letterpress",name:"Letterpress",group:"material",layers:[{type:"emboss",params:{material:"paper",direction:"pressed",depth:.85,shadow:.6}}]},{id:"plaster",name:"Plaster",group:"material",layers:[{type:"emboss",params:{material:"plaster",depth:.9,shadow:.65,light:120}}]},{id:"marble",name:"Marble",group:"material",layers:[{type:"marble",params:{}}]},{id:"molten-gold",name:"Molten gold",group:"material",layers:[{type:"molten",params:{alloy:"gold"}}]},{id:"forge",name:"Forge",group:"material",layers:[{type:"molten",params:{}}]},{id:"oil-slick",name:"Oil slick",group:"material",layers:[{type:"thinfilm",params:{thickness:.55,strength:.85}}]},{id:"soap-bubble",name:"Soap bubble",group:"material",layers:[{type:"thinfilm",params:{film:"soap"}}]},{id:"infinite",name:"Infinite",group:"distort",layers:[{type:"droste",params:{}}]},{id:"pencil",name:"Pencil",group:"art",layers:[{type:"sketch",blend:"normal",params:{}}]},{id:"charcoal",name:"Charcoal",group:"art",layers:[{type:"sketch",blend:"normal",params:{medium:"charcoal",smudge:.7,grain:.75,shading:1}}]},{id:"colored-pencil",name:"Colored pencil",group:"art",layers:[{type:"sketch",blend:"normal",params:{medium:"colored"}}]},{id:"pop-art",name:"Pop art",group:"print",layers:[{type:"warhol",params:{}}]},{id:"pop-strip",name:"Pop strip",group:"print",layers:[{type:"warhol",params:{layout:"strip",colorway:"electric"}}]},{id:"ukiyo-e",name:"Ukiyo-e",group:"print",layers:[{type:"woodblock",params:{}}]},{id:"prussian",name:"Prussian",group:"print",layers:[{type:"woodblock",params:{palette:"hokusai"}}]},{id:"night-print",name:"Night print",group:"print",layers:[{type:"woodblock",params:{palette:"night"}}]},{id:"crosshatch",name:"Crosshatch",group:"print",layers:[{type:"engrave",params:{style:"crosshatch",density:110,relief:.45,waviness:.12,ink:"#17151a",paper:"#f6f3ec"}}]},{id:"sun-print",name:"Sun print",group:"print",layers:[{type:"gradient",params:{palette:"custom",colors:["#0a2149","#1d4f93","#eef2f7"],contrast:1.25}},{type:"paper",params:{shadow:"#c3cede",grain:.4,fibers:.45,wrinkles:.2,folds:0,drops:0}},{type:"grain",params:{amount:.14,size:1.2}}]},{id:"two-tone",name:"Two tone",group:"light",layers:[{type:"gradient",params:{palette:"custom",colors:["#16163a","#ff6a5b"],contrast:1.2}}]},{id:"afterglow",name:"Afterglow",group:"light",layers:[{type:"gradient",params:{palette:"dusk",contrast:1.15}},{type:"bloom",params:{threshold:.6,intensity:.45}}]},{id:"infrared",name:"Infrared",group:"light",layers:[{type:"gradient",params:{palette:"infrared",contrast:1.2}},{type:"grain",params:{amount:.12,size:1}}]},{id:"fringe",name:"Fringe",group:"light",layers:[{type:"lens",params:{distortion:.3,chroma:1,vignette:.35}},{type:"chromatic",params:{mode:"radial",amount:26,falloff:1.2}}]},{id:"waves",name:"Waves",group:"distort",layers:[{type:"ripple",params:{mode:"waves",amplitude:.018,frequency:1.3,angle:80,shine:.45}}]},{id:"stipple",name:"Stipple",group:"print",layers:[{type:"points",params:{}}]},{id:"color-stipple",name:"Color stipple",group:"print",layers:[{type:"points",params:{color:!0}}]},{id:"pointillist",name:"Pointillist",group:"print",layers:[{type:"points",params:{style:"pointillism",size:1.6}}]},{id:"seurat",name:"Seurat",group:"print",layers:[{type:"points",params:{style:"pointillism",ground:"#efe9dd",size:1.4}}]},{id:"velvet",name:"Velvet",group:"print",layers:[{type:"points",params:{style:"mezzotint"}}]},{id:"velvet-color",name:"Color mezzotint",group:"print",layers:[{type:"points",params:{style:"mezzotint",color:!0}}]},{id:"atkinson",name:"Atkinson",group:"pixel",layers:[{type:"dither",params:{pattern:"atkinson",palette:"mac",pixel:2}}]},{id:"micro",name:"Micro",group:"pixel",layers:[{type:"dither",params:{pattern:"floyd",palette:"c64",pixel:3}}]},{id:"neon-dither",name:"Neon dither",group:"pixel",layers:[{type:"dither",params:{pattern:"bayer4",palette:"neon",pixel:3}}]},{id:"amber",name:"Amber",group:"pixel",layers:[{type:"dither",params:{pattern:"bayer4",palette:"amber",pixel:2}},{type:"crt",params:{curvature:.1,scan:.3,mask:"none",glow:.35,vignette:.4,roll:0,flicker:.08}}]},{id:"teletext",name:"Teletext",group:"pixel",layers:[{type:"dither",params:{pattern:"bayer2",palette:"teletext",pixel:6}}]},{id:"mirror-ball",name:"Mirror ball",group:"light",layers:[{type:"disco",params:{}}]},{id:"sequins",name:"Sequins",group:"light",layers:[{type:"disco",params:{shape:"flat",size:12,sparkle:.8}}]},{id:"stereo",name:"Estéreo",group:"light",layers:[{type:"anaglyph",params:{amount:26,pop:.45}}]},{id:"stardust",name:"Stardust",group:"light",layers:[{type:"dust",params:{}}]},{id:"fireflies",name:"Fireflies",group:"light",layers:[{type:"dust",params:{colorMode:"tint",density:.3,threshold:.6,size:2.4,glow:1}}]},{id:"neon-edges",name:"Neon edges",group:"light",layers:[{type:"edgeglow",params:{}}]},{id:"neon-trace",name:"Neon trace",group:"light",layers:[{type:"edgeglow",params:{colorMode:"custom",background:.1}}]},{id:"light-burst",name:"Light burst",group:"light",layers:[{type:"warpbloom",params:{}}]},{id:"vortex",name:"Vortex",group:"light",layers:[{type:"warpbloom",params:{mode:"swirl"}}]},{id:"starburst",name:"Starburst",group:"light",layers:[{type:"rays",params:{rays:4,length:.6,intensity:1.4}}]},{id:"light-sweep",name:"Light sweep",group:"light",layers:[{type:"rays",params:{rays:1,length:.9,intensity:1.5,shafts:1}}]},{id:"relief",name:"Relief",group:"material",layers:[{type:"emboss",params:{imageColor:!0,depth:.8,shadow:.55}}]},{id:"light-painting",name:"Light painting",group:"light",layers:[{type:"flowfield",params:{width:2.4,length:120,density:.7,drift:.6,contrast:1.6}},{type:"bloom",params:{threshold:.45,intensity:.9,radius:.7}}]}],v0=Object.fromEntries(eo.map(e=>[e.id,e])),to=(e,o)=>{const t=e.trim().toLowerCase().split(/\s+/).filter(Boolean);if(!t.length)return!0;const a=o.filter(Boolean).join(" ").toLowerCase();return t.every(l=>a.includes(l))},oo=({query:e,kind:o})=>V.jsxs("p",{className:"lab-empty lab-empty--search",children:["No ",o," match “",e.trim(),"”."]});function h0({value:e,onChange:o,placeholder:t,inputRef:a}){return V.jsxs("label",{className:"bs-search lab-search",children:[V.jsx(io,{icon:no.Search01Icon,size:15}),V.jsx("input",{ref:a,value:e,onChange:l=>o(l.target.value),onKeyDown:l=>{l.key==="Escape"&&e&&(l.stopPropagation(),o(""))},placeholder:t,"aria-label":t,spellCheck:!1,autoComplete:"off"})]})}const ao=({name:e,image:o,active:t,onClick:a,title:l})=>V.jsxs("button",{type:"button",className:"lab-tile","aria-pressed":t,onClick:a,title:l,children:[V.jsx("span",{className:"lab-tile-media",children:o?V.jsx("img",{src:o,alt:"",draggable:!1}):V.jsx("span",{className:"lab-tile-wait"})}),V.jsx("span",{className:"lab-tile-name",children:e})]});function g0({thumbs:e,activeLook:o,onApply:t,query:a=""}){const l=s0.map(r=>{const i=eo.filter(n=>n.group===r.id&&to(a,[n.name,r.label,n.tags,...n.layers.map(u=>{var c;return(c=Qe[u.type])==null?void 0:c.name})]));return i.length?V.jsxs("section",{className:"lab-group",children:[V.jsx("h3",{className:"lab-group-title",children:r.label}),V.jsx("div",{className:"lab-grid",children:i.map(n=>V.jsx(ao,{name:n.name,image:e[`look:${n.id}`],active:o===n.id,onClick:()=>t(n)},n.id))})]},r.id):null});return l.some(Boolean)?l:V.jsx(oo,{query:a,kind:"styles"})}function b0({thumbs:e,onAdd:o,query:t=""}){const a=l0.map(l=>{const r=Qt.filter(i=>i.category===l.id&&to(t,[i.name,i.description,l.label]));return r.length?V.jsxs("section",{className:"lab-group",children:[V.jsx("h3",{className:"lab-group-title",children:l.label}),V.jsx("div",{className:"lab-grid",children:r.map(i=>V.jsx(ao,{name:i.name,title:i.description,image:e[`fx:${i.id}`],active:!1,onClick:()=>o(i.id)},i.id))})]},l.id):null});return a.some(Boolean)?a:V.jsx(oo,{query:t,kind:"effects"})}function y0({children:e}){const o=lo.useRef(null),t=ro(o);return V.jsx("div",{className:"lab-scroll-shell","data-top":t.top?"":void 0,"data-bottom":t.bottom?"":void 0,children:V.jsx("div",{className:"lab-scroll",ref:o,children:e})})}export{Qe as E,y0 as G,eo as L,Qt as a,m0 as b,v0 as c,d0 as d,g0 as e,b0 as f,h0 as g,p0 as h,u0 as l};
