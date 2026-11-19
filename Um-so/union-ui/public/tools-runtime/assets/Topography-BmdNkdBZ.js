import{a as ee,j as gt}from"./index-DrbxZl7q.js";const qt=.32,Et=9,fe=.05,Ne=160,ye=1.7,we=.45,Kt=2.8,Oe=4,yt=4,Te=256,Ie=48,qe=2e5,Wt=[-.81,.58,-.02],wt={forward:[0,1],backward:[0,-1],left:[-1,0],right:[1,0]},Yt=["lift","trace","light"],Qt={plus:0,dots:1},Jt=1.25,ze=`
precision highp float;
precision highp int;

uniform float uFrequency;
uniform vec2 uMorph;
uniform sampler2D uSculpt;
uniform float uSculptOn;
uniform vec4 uPulses[${Oe}];
uniform vec3 uEye;
uniform vec3 uForward;
uniform vec3 uNear;

uint lattice(ivec2 p) {
  uvec2 q = uvec2(p + 1073741824);
  uint h = q.x * 2654435761u + q.y * 2246822519u;
  h = (h ^ (h >> 15u)) * 739982445u;
  h = (h ^ (h >> 12u)) * 695872825u;
  return h ^ (h >> 15u);
}

float corner(ivec2 c, vec2 f) {
  uint h = lattice(c);
  vec2 g = vec2(float(h & 65535u), float(h >> 16u)) / 32767.5 - 1.0;
  return dot(g, f);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = p - i;
  ivec2 c = ivec2(i);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = corner(c, f);
  float b = corner(c + ivec2(1, 0), f - vec2(1.0, 0.0));
  float d = corner(c + ivec2(0, 1), f - vec2(0.0, 1.0));
  float e = corner(c + ivec2(1, 1), f - vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(d, e, u.x), u.y);
}

vec2 octave(vec2 p, vec2 shift) {
  return vec2(1.6 * p.x - 1.2 * p.y, 1.2 * p.x + 1.6 * p.y) + shift;
}

float relief(vec2 t) {
  vec2 p = t * uFrequency;
  vec2 w = vec2(noise(p * 0.42 + uMorph), noise(p * 0.42 - uMorph.yx + vec2(5.2, 1.3)));
  p += w * 0.8;
  float n = noise(p) * 0.55;
  p = octave(p, vec2(7.1, 3.7));
  n += noise(p) * 0.15;
  p = octave(p, vec2(1.9, 8.3));
  n += noise(p) * 0.04;
  float s = log(1.0 + exp(7.0 * (3.0 * n + 0.05))) / 7.0;
  return s * s * 1.4 + 0.1 * n;
}

float swell(vec2 t) {
  float lift = 0.0;
  for (int i = 0; i < ${Oe}; i++) {
    vec4 p = uPulses[i];
    if (p.w <= 0.0) continue;
    float x = (length(t - p.xy) - p.z) / (0.28 + p.z * 0.05);
    lift += exp(-x * x) * p.w;
  }
  return lift;
}

vec4 sculpted(vec2 t) {
  return uSculptOn > 0.5 ? textureLod(uSculpt, t / ${Ie}.0, 0.0) : vec4(0.0);
}

float settle(vec2 world) {
  float depth = dot(vec3(world.x, 0.0, world.y) - uEye, uForward);
  float x = clamp((depth - uNear.x) / max(uNear.y - uNear.x, 1e-3), 0.0, 1.0);
  return mix(uNear.z, 1.0, x * x * x * (x * (x * 6.0 - 15.0) + 10.0));
}
`,eo=`#version 300 es
${ze}
uniform ivec2 uBase;
uniform float uCell;
uniform float uDetail;
layout(location = 0) out vec4 outField;
layout(location = 1) out vec4 outHeight;

void main() {
  vec2 t = vec2(uBase + ivec2(gl_FragCoord.xy)) * uCell;
  vec4 carved = sculpted(t);
  float ring = swell(t);
  float ground = relief(t) + carved.r + ring * 0.14;
  vec2 dp = t * uFrequency * 5.0 + vec2(13.1, 4.7);
  float fine = noise(dp) * 0.6 + noise(octave(dp, vec2(2.3, 6.1))) * 0.3;
  outField = vec4(carved.g, ring, ground, carved.r);
  outHeight = vec4(ground + uDetail * 0.1 * fine, 0.0, 0.0, 1.0);
}`,to=n=>`#version 300 es
#define BAKED ${n?1:0}
${ze}
uniform sampler2D uField;
uniform ivec2 uOrigin;
uniform ivec2 uCamCell;
uniform vec2 uCamFrac;
uniform float uCell;
uniform int uStride;
uniform float uHeight;
uniform mat4 uViewProj;
out vec2 vTexel;
out vec2 vTerrain;
out float vDepth;
out float vLift;
out vec3 vNormal;

float ground(vec2 t) {
  return relief(t) + swell(t) * 0.14;
}

void main() {
  ivec2 step = ivec2(gl_VertexID >> 1, gl_InstanceID + (gl_VertexID & 1)) * uStride;
  ivec2 local = uOrigin + step;
  vec2 terrain = vec2(local + uCamCell) * uCell;
  vec2 world = vec2(local) * uCell - uCamFrac;
  float k = settle(world);
#if BAKED
  ivec2 texel = step + 2;
  vec4 c = texelFetch(uField, texel, 0);
  vec4 l = texelFetch(uField, texel - ivec2(1, 0), 0);
  vec4 r = texelFetch(uField, texel + ivec2(1, 0), 0);
  vec4 d = texelFetch(uField, texel - ivec2(0, 1), 0);
  vec4 u = texelFetch(uField, texel + ivec2(0, 1), 0);
  float h = (c.b - c.a) * k + c.a;
  float dx = (l.b - l.a - r.b + r.a) * k + l.a - r.a;
  float dz = (d.b - d.a - u.b + u.a) * k + d.a - u.a;
  vNormal = vec3(dx * uHeight / (2.0 * uCell), 1.0, dz * uHeight / (2.0 * uCell));
  vTexel = vec2(texel) + 0.5;
#else
  float h = ground(terrain) * k;
  float hx = ground(terrain + vec2(0.04, 0.0)) * k;
  float hz = ground(terrain + vec2(0.0, 0.04)) * k;
  vNormal = vec3((h - hx) * uHeight / 0.04, 1.0, (h - hz) * uHeight / 0.04);
  vTexel = vec2(0.0);
#endif
  vec4 clip = uViewProj * vec4(world.x, h * uHeight, world.y, 1.0);
  gl_Position = clip;
  vTerrain = terrain;
  vDepth = clip.w;
  vLift = h * uHeight;
}`,oo=n=>`#version 300 es
#define BAKED ${n?1:0}
${ze}
uniform sampler2D uField;
uniform highp sampler2D uHeightField;
uniform float uDetail;
uniform float uLines;
uniform float uLineWidth;
uniform float uMajor;
uniform vec3 uColor;
uniform float uBrightness;
uniform vec2 uFade;
uniform vec3 uFocus;
uniform vec4 uHeat;
uniform vec4 uLamp;
uniform vec4 uTrace;
uniform vec3 uSun;
uniform float uRefDepth;
uniform float uReveal;
uniform float uLightMode;
uniform float uOpacity;
uniform vec4 uGlitch[3];
uniform float uGlitchSeed;
uniform float uPixel;
in vec2 vTexel;
in vec2 vTerrain;
in float vDepth;
in float vLift;
in vec3 vNormal;
out vec4 outColor;

float smoother(float x) {
  x = clamp(x, 0.0, 1.0);
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
}

float stroke(float dist, float width, float soft, float density, float crowd) {
  float cover = max(0.0, min(min(width, soft), 0.5 * (width + soft) - dist)) / soft;
  return mix(cover, min(width * density, 1.0) * 0.6, crowd);
}

float sampleHeight(vec2 coord, out vec2 slope) {
  vec2 u = coord - 0.5;
  vec2 i = floor(u + 0.5);
  vec2 f = u - i;
  vec3 wx = vec3(0.5 * (0.5 - f.x) * (0.5 - f.x), 0.75 - f.x * f.x, 0.5 * (0.5 + f.x) * (0.5 + f.x));
  vec3 wy = vec3(0.5 * (0.5 - f.y) * (0.5 - f.y), 0.75 - f.y * f.y, 0.5 * (0.5 + f.y) * (0.5 + f.y));
  vec3 dx = vec3(f.x - 0.5, -2.0 * f.x, 0.5 + f.x);
  vec3 dy = vec3(f.y - 0.5, -2.0 * f.y, 0.5 + f.y);
  ivec2 base = ivec2(i) - 1;
  float total = 0.0;
  slope = vec2(0.0);
  for (int y = 0; y < 3; y++) {
    float a = texelFetch(uHeightField, base + ivec2(0, y), 0).r;
    float b = texelFetch(uHeightField, base + ivec2(1, y), 0).r;
    float c = texelFetch(uHeightField, base + ivec2(2, y), 0).r;
    float row = a * wx.x + b * wx.y + c * wx.z;
    total += row * wy[y];
    slope += vec2((a * dx.x + b * dx.y + c * dx.z) * wy[y], row * dy[y]);
  }
  return total;
}

void main() {
  float py = gl_FragCoord.y / uPixel;
  float shift = 0.0;
  float split = 0.0;
  for (int i = 0; i < 3; i++) {
    if (py >= uGlitch[i].x && py < uGlitch[i].y) {
      shift = uGlitch[i].z * uPixel;
      split = uGlitch[i].w * uPixel;
    }
  }
  vec2 spot = vTerrain - dFdx(vTerrain) * shift;
#if BAKED
  vec2 ex = dFdx(vTexel);
  vec2 ey = dFdy(vTexel);
  vec2 coord = vTexel - ex * shift;
  vec2 slope;
  float h = sampleHeight(coord, slope);
  vec4 field = texture(uField, coord / vec2(textureSize(uField, 0)));
  float trail = field.r;
  float ring = field.g;
  float gx = dot(slope, ex) * uLines;
  float gy = dot(slope, ey) * uLines;
#else
  vec2 dp = spot * uFrequency * 5.0 + vec2(13.1, 4.7);
  float ring = swell(spot);
  float h = relief(spot) + ring * 0.14 + uDetail * 0.1 * (noise(dp) * 0.6 + noise(octave(dp, vec2(2.3, 6.1))) * 0.3);
  float trail = 0.0;
  float gx = dFdx(h) * uLines;
  float gy = dFdy(h) * uLines;
#endif

  float lc = h * uLines + 0.5;
  float density = max(sqrt(gx * gx + gy * gy), 1e-5);
  float dist = abs(fract(lc + 0.5) - 0.5) / density;
  float major = uMajor * (1.0 - step(0.5, mod(floor(lc + 0.5), 5.0)));

  vec2 hd = spot - uHeat.xy;
  float heat = exp(-dot(hd, hd) / (uHeat.z * uHeat.z)) * uHeat.w + trail * 0.6;
  float energy = heat + ring;

  float depth = max(vDepth, 0.01);
  float persp = clamp(sqrt(uRefDepth / depth), 0.6, 1.6);
  float width = uLineWidth * persp * (1.0 + 0.6 * major) * (1.0 + 0.45 * min(energy, 1.5));
  float soft = 1.0 + min(uFocus.y * abs(1.0 - uFocus.x / depth), uFocus.z);
  float crowd = smoothstep(0.3, 0.75, density * max(width, soft));
  float cover = stroke(dist, width, soft, density, crowd);
  vec3 cover3 = vec3(cover);
  if (split > 0.0) {
    float offset = split * density;
    cover3.r = stroke(abs(fract(lc + offset + 0.5) - 0.5) / density, width, soft, density, crowd);
    cover3.b = stroke(abs(fract(lc - offset + 0.5) - 0.5) / density, width, soft, density, crowd);
    vec2 block = floor(vec2(gl_FragCoord.x / (uPixel * 26.0), py / 5.0)) + uGlitchSeed * 71.0;
    float drop = fract(sin(dot(block, vec2(12.9898, 78.233))) * 43758.5453);
    cover3 *= drop > 0.82 ? 0.1 : 1.2;
  }

  vec3 normal = normalize(vNormal);
  float sun = clamp(dot(normal, uSun), 0.0, 1.0);
  vec3 toLamp = uLamp.xyz - vec3(vTerrain.x, vLift, vTerrain.y);
  float lampDistance = length(toLamp);
  float lamp = clamp(dot(normal, toLamp / max(lampDistance, 1e-3)), 0.0, 1.0) * uLamp.w / (1.0 + lampDistance * lampDistance * 0.9);
  float level = mix(0.45, 1.05, smoothstep(0.0, 1.1, h)) * mix(0.35, 1.25, sun * sun) * (1.0 + 0.6 * major);
  level += heat * 1.4 + ring * 3.0 + lamp * 1.2;

  float fade = 1.0 - smoother((depth - uFade.x) / max(uFade.y - uFade.x, 1e-3));
  vec3 light = cover3 * level;

  if (uTrace.y > 0.0) {
    float traceWidth = uLineWidth * persp * 1.8;
    float trace = stroke(abs(h - uTrace.x) * uLines / density, traceWidth, soft, density, crowd);
    vec2 td = spot - uTrace.zw;
    light += trace * uTrace.y * mix(0.35, 1.0, exp(-dot(td, td) / 20.0)) * 2.6;
  }
  light *= fade * uBrightness * uReveal;

  if (uLightMode > 0.5) {
    float ink = (1.0 - exp(-max(max(light.r, light.g), light.b) * 1.8)) * 0.92 * uOpacity;
    outColor = vec4(uColor * ink, ink);
    return;
  }

  vec3 color = 1.0 - exp(-uColor * light * 1.8);
  float top = max(max(color.r, color.g), color.b);
  float dither = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
  color = max(color + dither / 255.0 * step(0.002, top), 0.0);
  outColor = vec4(color, max(max(color.r, color.g), color.b)) * uOpacity;
}`,ro=`#version 300 es
${ze}
uniform ivec2 uOrigin;
uniform ivec2 uCamCell;
uniform vec2 uCamFrac;
uniform float uSpacing;
uniform int uColumns;
uniform float uHeight;
uniform mat4 uViewProj;
uniform vec2 uView;
uniform float uSize;
uniform float uRefDepth;
uniform vec4 uHeat;
uniform float uTime;
uniform vec4 uGlitch[3];
uniform float uPixel;
out vec2 vCorner;
out float vSize;
out float vGlow;
out float vFrame;
out float vDepth;

void main() {
  ivec2 local = uOrigin + ivec2(gl_InstanceID % uColumns, gl_InstanceID / uColumns);
  ivec2 id = local + uCamCell;
  vec2 terrain = vec2(id) * uSpacing;
  vec2 world = vec2(local) * uSpacing - uCamFrac;
  float ring = swell(terrain);
  float h = (relief(terrain) + ring * 0.14) * settle(world) + sculpted(terrain).r;
  vec4 clip = uViewProj * vec4(world.x, h * uHeight + 0.05, world.y, 1.0);
  uint seed = lattice(id + ivec2(911, 377));
  float a = float(seed & 1023u) / 1023.0;
  float b = float((seed >> 10u) & 1023u) / 1023.0;
  vec2 hd = terrain - uHeat.xy;
  float heat = exp(-dot(hd, hd) / (uHeat.z * uHeat.z)) * uHeat.w;
  float blink = step(0.92, a) * (0.5 + 0.5 * sin(uTime * (1.4 + b * 2.2) + b * 40.0));
  float size = uSize * clamp(sqrt(uRefDepth / max(clip.w, 0.01)), 0.6, 1.3) * (1.0 + 0.4 * heat + 0.35 * blink);
  float frame = max(smoothstep(0.55, 0.95, blink), smoothstep(0.3, 0.8, heat));
  vec2 corner = vec2(float(gl_VertexID & 1), float(gl_VertexID >> 1)) * 2.0 - 1.0;
  vec2 offset = corner * (size * (frame > 0.001 ? 2.6 : 1.0) + 1.5);
  float py = (clip.y / clip.w * 0.5 + 0.5) * uView.y / uPixel;
  float shift = 0.0;
  for (int i = 0; i < 3; i++) {
    if (py >= uGlitch[i].x && py < uGlitch[i].y) shift = uGlitch[i].z;
  }
  clip.xy += (offset + vec2(shift * uPixel, 0.0)) / uView * 2.0 * clip.w;
  gl_Position = clip;
  vCorner = offset;
  vSize = size;
  vFrame = frame;
  vGlow = 0.5 + 0.4 * b + blink * 0.9 + heat * 1.8 + ring * 3.0;
  vDepth = clip.w;
}`,io=`#version 300 es
precision highp float;
uniform vec3 uColor;
uniform vec2 uFade;
uniform float uReveal;
uniform float uBrightness;
uniform float uLightMode;
uniform float uOpacity;
uniform float uStyle;
uniform float uPixel;
in vec2 vCorner;
in float vSize;
in float vGlow;
in float vFrame;
in float vDepth;
out vec4 outColor;

float smoother(float x) {
  x = clamp(x, 0.0, 1.0);
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
}

void main() {
  vec2 a = abs(vCorner);
  float cover;
  if (uStyle < 0.5) {
    float thick = max(0.6 * uPixel, 0.5);
    float across = clamp(vSize - a.x + 0.5, 0.0, 1.0) * clamp(thick - a.y + 0.5, 0.0, 1.0);
    float down = clamp(vSize - a.y + 0.5, 0.0, 1.0) * clamp(thick - a.x + 0.5, 0.0, 1.0);
    cover = max(across, down);
  } else {
    cover = clamp(vSize * 0.42 - length(vCorner) + 0.5, 0.0, 1.0);
  }
  if (vFrame > 0.001) {
    float edge = vSize * 2.3;
    float reach = edge * 0.45;
    float line = max(0.5 * uPixel, 0.5);
    float sides = clamp(line - abs(a.x - edge) + 0.5, 0.0, 1.0) * clamp(a.y - edge + reach + 0.5, 0.0, 1.0) * clamp(edge + line - a.y + 0.5, 0.0, 1.0);
    float caps = clamp(line - abs(a.y - edge) + 0.5, 0.0, 1.0) * clamp(a.x - edge + reach + 0.5, 0.0, 1.0) * clamp(edge + line - a.x + 0.5, 0.0, 1.0);
    cover = max(cover, max(sides, caps) * vFrame * 0.8);
  }
  float fade = 1.0 - smoother((vDepth - uFade.x) / max(uFade.y - uFade.x, 1e-3));
  float light = cover * vGlow * fade * fade * uReveal * uBrightness;
  if (uLightMode > 0.5) {
    float ink = (1.0 - exp(-light * 1.8)) * 0.92 * uOpacity;
    outColor = vec4(uColor * ink, ink);
    return;
  }
  vec3 color = 1.0 - exp(-uColor * light * 1.8);
  outColor = vec4(color, max(max(color.r, color.g), color.b)) * uOpacity;
}`,Fe=`#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`,no=`#version 300 es
precision highp float;
uniform sampler2D uPrevious;
uniform vec4 uSegment;
uniform vec4 uBrush;
uniform vec4 uBurst;
uniform vec2 uDecay;
out vec4 outColor;

vec2 wrapped(vec2 d) {
  return d - ${Ie}.0 * floor(d / ${Ie}.0 + 0.5);
}

void main() {
  vec4 previous = texelFetch(uPrevious, ivec2(gl_FragCoord.xy), 0);
  vec2 t = gl_FragCoord.xy / ${Te}.0 * ${Ie}.0;
  vec2 a = wrapped(t - uSegment.xy);
  vec2 ab = uSegment.zw - uSegment.xy;
  float k = clamp(dot(a, ab) / max(dot(ab, ab), 1e-6), 0.0, 1.0);
  vec2 d = a - ab * k;
  float g = exp(-dot(d, d) / (uBrush.x * uBrush.x)) * uBrush.w;
  float height = previous.r * uDecay.x;
  height += (uBrush.y - height) * g * uBrush.z;
  float heat = previous.g * uDecay.y;
  heat += (1.0 - heat) * g * uBrush.z;
  vec2 b = wrapped(t - uBurst.xy);
  height += uBurst.w * exp(-dot(b, b) / (uBurst.z * uBurst.z));
  outColor = vec4(height, heat, 0.0, 1.0);
}`,uo=`#version 300 es
precision highp float;
uniform sampler2D uSource;
uniform vec2 uTarget;
uniform vec2 uTexel;
out vec4 outColor;

void main() {
  vec2 uv = gl_FragCoord.xy / uTarget;
  vec4 color = texture(uSource, uv - uTexel);
  color += texture(uSource, uv + uTexel);
  color += texture(uSource, uv + vec2(uTexel.x, -uTexel.y));
  color += texture(uSource, uv + vec2(-uTexel.x, uTexel.y));
  outColor = min(color * 0.25, vec4(1.0));
}`,ao=`#version 300 es
precision highp float;
uniform sampler2D uSource;
uniform vec2 uTarget;
uniform vec2 uStep;
out vec4 outColor;

void main() {
  vec2 uv = gl_FragCoord.xy / uTarget;
  vec4 color = texture(uSource, uv) * 0.181862;
  color += (texture(uSource, uv + uStep * 1.423135) + texture(uSource, uv - uStep * 1.423135)) * 0.284316;
  color += (texture(uSource, uv + uStep * 3.326702) + texture(uSource, uv - uStep * 3.326702)) * 0.106598;
  color += (texture(uSource, uv + uStep * 5.242989) + texture(uSource, uv - uStep * 5.242989)) * 0.018156;
  outColor = color;
}`,co=`#version 300 es
precision highp float;
uniform sampler2D uBloom0;
uniform sampler2D uBloom1;
uniform sampler2D uBloom2;
uniform sampler2D uBloom3;
uniform vec2 uView;
uniform float uGlow;
uniform float uLightMode;
out vec4 outColor;

void main() {
  vec2 uv = gl_FragCoord.xy / uView;
  vec4 halo = texture(uBloom0, uv) * 0.4;
  halo += texture(uBloom1, uv) * 0.3;
  halo += texture(uBloom2, uv) * 0.2;
  halo += texture(uBloom3, uv) * 0.1;
  if (uLightMode > 0.5) {
    outColor = halo * uGlow * 0.35;
    return;
  }
  vec3 color = halo.rgb * uGlow * 1.6;
  color = color / (1.0 + color);
  outColor = vec4(color, max(max(color.r, color.g), color.b));
}`,S=(n,s,a)=>Math.min(a,Math.max(s,n)),te=n=>{const s=S(n,0,1);return s*s*s*(s*(s*6-15)+10)},lo=(n,s)=>{let a=Math.imul(n+1073741824,2654435761)+Math.imul(s+1073741824,2246822519)>>>0;return a=Math.imul(a^a>>>15,739982445)>>>0,a=Math.imul(a^a>>>12,695872825)>>>0,(a^a>>>15)>>>0},Be=(n,s,a,c)=>{const h=lo(n,s);return((h&65535)/32767.5-1)*a+((h>>>16)/32767.5-1)*c},re=(n,s)=>{const a=Math.floor(n),c=Math.floor(s),h=n-a,d=s-c,C=h*h*h*(h*(h*6-15)+10),V=d*d*d*(d*(d*6-15)+10),O=Be(a,c,h,d),P=Be(a+1,c,h-1,d),B=Be(a,c+1,h,d-1),z=Be(a+1,c+1,h-1,d-1),Z=O+(P-O)*C;return Z+(B+(z-B)*C-Z)*V},Ft=(n,s,a,c,h)=>{let d=n*a,C=s*a;const V=re(d*.42+c,C*.42+h),O=re(d*.42-h+5.2,C*.42-c+1.3);d+=V*.8,C+=O*.8;let P=re(d,C)*.55;const B=1.6*d-1.2*C+7.1,z=1.2*d+1.6*C+3.7;P+=re(B,z)*.15,P+=re(1.6*B-1.2*z+1.9,1.2*B+1.6*z+8.3)*.04;const Z=Math.log(1+Math.exp(7*(3*P+.05)))/7;return Z*Z*1.4+.1*P},fo=(n,s,a)=>{const c=n*a*5+13.1,h=s*a*5+4.7;return re(c,h)*.6+re(1.6*c-1.2*h+2.3,1.2*c+1.6*h+6.1)*.3},Tt=(n,s,a)=>{const c=n.createShader(s);return c?(n.shaderSource(c,a),n.compileShader(c),n.getShaderParameter(c,n.COMPILE_STATUS)?c:(n.deleteShader(c),null)):null},oe=(n,s,a)=>{const c=Tt(n,n.VERTEX_SHADER,s),h=Tt(n,n.FRAGMENT_SHADER,a),d=n.createProgram();if(!c||!h||!d)return null;if(n.attachShader(d,c),n.attachShader(d,h),n.linkProgram(d),n.deleteShader(c),n.deleteShader(h),!n.getProgramParameter(d,n.LINK_STATUS))return n.deleteProgram(d),null;const C={},V=n.getProgramParameter(d,n.ACTIVE_UNIFORMS);for(let O=0;O<V;O++){const P=n.getActiveUniform(d,O);P&&(C[P.name.replace(/\[0\]$/,"")]=n.getUniformLocation(d,P.name))}return{program:d,uniforms:C}},so=n=>{let s=String(n||"#ffffff").replace("#","").trim();(s.length===3||s.length===4)&&(s=s.slice(0,3).split("").map(c=>c+c).join(""));const a=parseInt(s.slice(0,6),16);return Number.isNaN(a)?[1,1,1]:[(a>>16&255)/255,(a>>8&255)/255,(a&255)/255]},ho=(n,s)=>{const a=Math.cos(s),c=[Math.sin(n)*a,-Math.sin(s),Math.cos(n)*a],h=[Math.cos(n),0,-Math.sin(n)],d=[c[1]*h[2]-c[2]*h[1],c[2]*h[0]-c[0]*h[2],c[0]*h[1]-c[1]*h[0]];return{f:c,r:h,u:d}},Ke=n=>S(.4877/n,qt,.6),mo=({eye:n,f:s,r:a,u:c},h,d)=>{const C=1/Ke(h),V=1/(fe-Ne),O=[a[0],c[0],-s[0],0,a[1],c[1],-s[1],0,a[2],c[2],-s[2],0,-(a[0]*n[0]+a[1]*n[1]+a[2]*n[2]),-(c[0]*n[0]+c[1]*n[1]+c[2]*n[2]),s[0]*n[0]+s[1]*n[1]+s[2]*n[2],1],P=[C/h,0,0,0,0,C,0,0,0,0,(Ne+fe)*V,-1,0,0,2*Ne*fe*V,0];for(let B=0;B<4;B++)for(let z=0;z<4;z++){let Z=0;for(let ie=0;ie<4;ie++)Z+=P[ie*4+z]*O[B*4+ie];d[B*4+z]=Z}return d},po=({color:n="#4f7cff",lineCount:s=22,lineWidth:a=1.2,majorLines:c=!0,elevation:h=1,foreground:d=.2,scale:C=1,detail:V=.35,tilt:O=32,speed:P=.25,direction:B="forward",morph:z=.2,glow:Z=.6,depthOfField:ie=.4,fog:Mt=.35,brightness:bt=1,opacity:Rt=1,mouseInteraction:St=!0,hoverEffect:We="lift",mouseRadius:Ct=1,mouseStrength:Lt=.6,trail:Dt=.3,parallax:At=.5,clickEffect:_t="pulse",markers:Pt="none",glitch:Bt=0,intro:Nt=!0,lightMode:It=!1,dpr:Ot,className:zt="",style:kt})=>{const Ye=ee.useRef(null),Qe=ee.useRef(null),se=ee.useRef(null),[Ut,Ht]=ee.useState(0),Je={color:n,lineCount:S(s,2,80),lineWidth:Math.max(.2,a),majorLines:c,elevation:S(h,0,3),foreground:S(d,0,1),scale:S(C,.2,5),detail:S(V,0,1),tilt:S(O,12,90),speed:P,direction:wt[B]??wt.forward,morph:Math.max(0,z),glow:Math.max(0,Z),depthOfField:S(ie,0,1),fog:S(Mt,0,1),brightness:Math.max(0,bt),opacity:S(Rt,0,1),mouseInteraction:St,hoverEffect:Yt.includes(We)?We:"lift",mouseRadius:Math.max(.1,Ct),mouseStrength:Math.max(0,Lt),trail:S(Dt,0,1),parallax:S(At,0,1),clickEffect:_t,markers:Qt[Pt]??-1,glitch:S(Bt,0,1),intro:Nt,lightMode:It,dpr:Ot},X=ee.useRef(Je);return X.current=Je,ee.useEffect(()=>{var pt;const q=Ye.current,D=Qe.current,Xt=Math.min(X.current.dpr||window.devicePixelRatio||1,2),e=D==null?void 0:D.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:Xt<1.5,depth:!0,stencil:!1,powerPreference:"high-performance"});if(!q||!D||!e)return;const he=!!e.getExtension("EXT_color_buffer_float"),Me=oe(e,to(he),oo(he)),ne=he?oe(e,Fe,eo):null,me=he?oe(e,Fe,no):null,ue=oe(e,Fe,uo),Q=oe(e,Fe,ao),be=oe(e,Fe,co),Re=oe(e,ro,io);if(!Me||!ue||!Q||!be||!Re)return;const et=o=>o.preventDefault(),tt=()=>Ht(o=>o+1);D.addEventListener("webglcontextlost",et),D.addEventListener("webglcontextrestored",tt);const ot=e.createVertexArray(),Gt=he?e.RGBA16F:e.RGBA8,de=(o,r,i,l)=>{const u=e.createTexture();return e.bindTexture(e.TEXTURE_2D,u),e.texStorage2D(e.TEXTURE_2D,1,i,o,r),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,l),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,l),u},ke=()=>({texture:null,framebuffer:e.createFramebuffer(),depth:null,width:0,height:0}),Ue=(o,r,i,l)=>{o.texture&&o.width===r&&o.height===i||(o.texture&&e.deleteTexture(o.texture),o.texture=de(r,i,Gt,e.CLAMP_TO_EDGE),o.width=r,o.height=i,e.bindFramebuffer(e.FRAMEBUFFER,o.framebuffer),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,o.texture,0),l&&(o.depth||(o.depth=e.createRenderbuffer()),e.bindRenderbuffer(e.RENDERBUFFER,o.depth),e.renderbufferStorage(e.RENDERBUFFER,e.DEPTH_COMPONENT24,r,i),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.RENDERBUFFER,o.depth)))},Se=ke(),Ce=Array.from({length:yt},()=>[ke(),ke()]),N=me?[0,1].map(()=>{const o=de(Te,Te,e.RG16F,e.REPEAT),r=e.createFramebuffer();return e.bindFramebuffer(e.FRAMEBUFFER,r),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,o,0),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),{texture:o,framebuffer:r}}):null,ve=de(1,1,e.RGBA8,e.REPEAT),E={texture:null,heights:null,framebuffer:e.createFramebuffer(),width:0,height:0};let ae=0;const Vt=(o,r)=>{E.texture&&o<=E.width&&r<=E.height||(E.texture&&e.deleteTexture(E.texture),E.heights&&e.deleteTexture(E.heights),E.width=Math.max(o,Math.ceil(E.width*1.25),64),E.height=Math.max(r,Math.ceil(E.height*1.25),64),E.texture=de(E.width,E.height,e.RGBA16F,e.CLAMP_TO_EDGE),E.heights=de(E.width,E.height,e.R32F,e.CLAMP_TO_EDGE),e.bindTexture(e.TEXTURE_2D,E.heights),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.bindFramebuffer(e.FRAMEBUFFER,E.framebuffer),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,E.texture,0),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT1,e.TEXTURE_2D,E.heights,0),e.drawBuffers([e.COLOR_ATTACHMENT0,e.COLOR_ATTACHMENT1]))},j=(o,r)=>{e.activeTexture(e.TEXTURE0+o),e.bindTexture(e.TEXTURE_2D,r)},W=((pt=window.matchMedia)==null?void 0:pt.call(window,"(prefers-reduced-motion: reduce)").matches)??!1,He=new Float32Array(16),pe=new Float32Array(Oe*4),ce=new Float32Array(12),I={until:0,next:1.5,roll:0,seed:0};let Xe=7919;const $=()=>(Xe=Xe*16807%2147483647,(Xe-1)/2147483646),K=[],k={x:0,y:0,inside:!1},m={width:1,height:1,ratio:1,cell:.05,cellKey:""},t={intro:X.current.intro&&!W?0:1,rise:1,travelX:0,travelZ:0,morph:0,yaw:0,pitch:0,yawVelocity:0,pitchVelocity:0,presence:0,focus:Et,hit:null,brushFrom:null,sculptLife:0,burst:null,level:0,trace:0,clock:0,tilt:X.current.tilt,elevation:X.current.elevation,scale:X.current.scale};t.rise=te(t.intro);let xe=0,Le=0,De=!0,Ae=0;const Ge=()=>{const o=Math.min(t.tilt*Math.PI/180+t.pitch,Math.PI/2-1e-4),r=ho(t.yaw,o),i=t.elevation*ye*t.rise*.18,l=t.elevation*ye*t.rise*1.3+.9,u=Math.max(Et,(l-i)/Math.sin(o));return{...r,distance:u,eye:[-r.f[0]*u,i-r.f[1]*u,-r.f[2]*u]}},Ve=(o,r,i)=>{const l=m.width/m.height,u=Ke(l),p=[0,1,2].map(v=>o.f[v]+o.r[v]*r*u*l+o.u[v]*i*u),b=Math.hypot(p[0],p[1],p[2]);return p.map(v=>v/b)},Ze=(o,r)=>r[0]*o.f[0]+r[1]*o.f[1]+r[2]*o.f[2],je=(o,r)=>{const i=Ve(o,0,r);return i[1]>-.001?1/0:o.eye[1]/-i[1]*Ze(o,i)},rt=(o,r)=>[je(o,-1)*.9,o.distance,r.foreground],Zt=(o,r,i,l)=>{const u=(i-o.eye[0])*o.f[0]-o.eye[1]*o.f[1]+(l-o.eye[2])*o.f[2];return r[2]+(1-r[2])*te((u-r[0])/Math.max(r[1]-r[0],.001))},it=(o,r,i,l)=>{const u=Ve(o,i,l),p=t.elevation*ye*t.rise,b=we/t.scale,v=rt(o,r),w=g=>{const U=o.eye[0]+u[0]*g,M=o.eye[2]+u[2]*g,J=Ft(t.travelX+U,t.travelZ+M,b,t.morph*.37,t.morph*.23);return o.eye[1]+u[1]*g-J*p*Zt(o,v,U,M)};let T=fe,A=w(T);for(let g=0;g<200&&T<Ne*.5;g++){const U=T+Math.max(.02,A*.4),M=w(U);if(M<0){let J=T,H=U;for(let ge=0;ge<10;ge++){const R=(J+H)*.5;w(R)<0?H=R:J=R}return{x:t.travelX+o.eye[0]+u[0]*H,y:o.eye[1]+u[1]*H,z:t.travelZ+o.eye[2]+u[2]*H,depth:H*Ze(o,u)}}T=U,A=M}return null},jt=(o,r,i)=>{const l=t.elevation*ye*t.rise*1.7+.2+r.mouseStrength,u={minX:1/0,maxX:-1/0,minZ:1/0,maxZ:-1/0,near:1/0},p=(b,v)=>{const w=o.eye[0]+b[0]*v,T=o.eye[2]+b[2]*v;u.minX=Math.min(u.minX,w),u.maxX=Math.max(u.maxX,w),u.minZ=Math.min(u.minZ,T),u.maxZ=Math.max(u.maxZ,T)};for(const b of[-1.08,0,1.08])for(const v of[-1.08,1.08]){const w=Ve(o,b,v),T=Math.max(Ze(o,w),.001);let A=fe,g=i*1.05/T;w[1]<-1e-4&&(A=Math.max(fe,(o.eye[1]-l)/-w[1]),g=Math.min(g,o.eye[1]/-w[1])),A=Math.min(A,g),p(w,A),p(w,g),u.near=Math.min(u.near,A*T)}return u},nt=(o,r)=>{const i=Math.floor(t.travelX/r),l=Math.floor(t.travelZ/r),u=t.travelX-i*r,p=t.travelZ-l*r,b=Math.floor((o.minX+u)/r)-2,v=Math.floor((o.minZ+p)/r)-2,w=S(Math.ceil((o.maxX+u)/r)+2-b,1,4e3),T=S(Math.ceil((o.maxZ+p)/r)+2-v,1,Math.floor(qe*1.5/w));return{cell:r,camX:i,camZ:l,fracX:u,fracZ:p,k0:b,m0:v,columns:w,rows:T}},ut=()=>{const o=X.current,r=Ge();mo(r,m.width/m.height,He);const i=je(r,-1),l=Math.min(je(r,1),r.distance*3.2),u=Math.max(l,i*1.6,r.distance*1.4),p=u+(i*1.8-u)*o.fog,b=p*.7+(i*.7-p*.7)*o.fog,v=jt(r,o,p),w=`${m.width}x${m.height}@${m.ratio}|${Math.round(t.tilt/4)}|${Math.round(t.elevation*5)}|${o.fog}`;if(w!==m.cellKey){m.cellKey=w;const y=m.height*m.ratio*.5/Ke(m.width/m.height);let L=S(14*Math.max(v.near,.5)/y,.02,.4);const F=(v.maxX-v.minX)*(v.maxZ-v.minZ)/(L*L);F>qe&&(L*=Math.sqrt(F/qe)),m.cell=L}const T=so(o.color),A=t.elevation*ye*t.rise,g=nt(v,m.cell),U=rt(r,o),M=o.markers>=0?nt(v,Jt):null,H=(t.hit&&o.mouseInteraction?t.presence:0)*(.35+.5*o.mouseStrength),ge=o.depthOfField*m.height*.016,R=te(t.intro/.35),G=t.hit?t.hit.x:0,le=t.hit?t.hit.z:0;if(pe.fill(0),K.forEach((y,L)=>{pe.set([y.x,y.z,y.age*4.2,Math.exp(-y.age*1.1)*te(y.age/.08)],L*4)}),e.bindVertexArray(ot),ne){const y=g.columns+7,L=g.rows+7;Vt(y,L),e.bindFramebuffer(e.FRAMEBUFFER,E.framebuffer),e.viewport(0,0,y,L),e.useProgram(ne.program);const F=ne.uniforms;j(0,N?N[ae].texture:ve),e.uniform1i(F.uSculpt,0),e.uniform1f(F.uSculptOn,N?1:0),e.uniform1f(F.uFrequency,we/t.scale),e.uniform2f(F.uMorph,t.morph*.37,t.morph*.23),e.uniform4fv(F.uPulses,pe),e.uniform2i(F.uBase,g.k0-2+g.camX,g.m0-2+g.camZ),e.uniform1f(F.uCell,g.cell),e.uniform1f(F.uDetail,o.detail),e.disable(e.DEPTH_TEST),e.disable(e.BLEND),e.drawArrays(e.TRIANGLES,0,3)}const Ee=(y,L,F,_)=>{e.viewport(0,0,L,F),e.useProgram(Me.program);const f=Me.uniforms;if(j(0,ne?E.texture:ve),e.uniform1i(f.uField,0),j(1,ne?E.heights:ve),e.uniform1i(f.uHeightField,1),e.uniform1f(f.uFrequency,we/t.scale),e.uniform2f(f.uMorph,t.morph*.37,t.morph*.23),e.uniform4fv(f.uPulses,pe),e.uniform2i(f.uOrigin,g.k0,g.m0),e.uniform2i(f.uCamCell,g.camX,g.camZ),e.uniform2f(f.uCamFrac,g.fracX,g.fracZ),e.uniform1f(f.uCell,g.cell),e.uniform1i(f.uStride,_),e.uniform1f(f.uHeight,A),e.uniform3fv(f.uEye,r.eye),e.uniform3fv(f.uForward,r.f),e.uniform3fv(f.uNear,U),e.uniform1f(f.uRefDepth,r.distance),e.uniformMatrix4fv(f.uViewProj,!1,He),e.uniform1f(f.uDetail,o.detail),e.uniform1f(f.uLines,o.lineCount),e.uniform1f(f.uLineWidth,o.lineWidth*y),e.uniform1f(f.uMajor,o.majorLines?1:0),e.uniform3fv(f.uColor,T),e.uniform1f(f.uBrightness,o.brightness),e.uniform2f(f.uFade,b,p),e.uniform3f(f.uFocus,t.focus,ge*y,m.height*.03*y),e.uniform4f(f.uHeat,G,le,.9*o.mouseRadius,H),e.uniform4f(f.uLamp,G,t.hit?t.hit.y+1.4:0,le,H),e.uniform4f(f.uTrace,t.level,t.trace,G,le),e.uniform3fv(f.uSun,Wt),e.uniform1f(f.uReveal,R),e.uniform1f(f.uLightMode,o.lightMode?1:0),e.uniform1f(f.uOpacity,o.opacity),e.uniform4fv(f.uGlitch,ce),e.uniform1f(f.uGlitchSeed,I.seed),e.uniform1f(f.uPixel,y),e.enable(e.DEPTH_TEST),e.depthFunc(e.LESS),e.disable(e.BLEND),e.clearColor(0,0,0,0),e.clearDepth(1),e.clear(e.COLOR_BUFFER_BIT|e.DEPTH_BUFFER_BIT),e.drawArraysInstanced(e.TRIANGLE_STRIP,0,2*(Math.ceil(g.columns/_)+1),Math.ceil(g.rows/_)),M){e.useProgram(Re.program);const x=Re.uniforms;j(2,N?N[ae].texture:ve),e.uniform1i(x.uSculpt,2),e.uniform1f(x.uSculptOn,N?1:0),e.uniform1f(x.uFrequency,we/t.scale),e.uniform2f(x.uMorph,t.morph*.37,t.morph*.23),e.uniform4fv(x.uPulses,pe),e.uniform3fv(x.uEye,r.eye),e.uniform3fv(x.uForward,r.f),e.uniform3fv(x.uNear,U),e.uniform2i(x.uOrigin,M.k0,M.m0),e.uniform2i(x.uCamCell,M.camX,M.camZ),e.uniform2f(x.uCamFrac,M.fracX,M.fracZ),e.uniform1f(x.uSpacing,M.cell),e.uniform1i(x.uColumns,M.columns+1),e.uniform1f(x.uHeight,A),e.uniformMatrix4fv(x.uViewProj,!1,He),e.uniform2f(x.uView,L,F),e.uniform1f(x.uSize,4*y),e.uniform1f(x.uRefDepth,r.distance),e.uniform4f(x.uHeat,G,le,1.2*o.mouseRadius,H),e.uniform1f(x.uTime,t.clock),e.uniform4fv(x.uGlitch,ce),e.uniform1f(x.uPixel,y),e.uniform3fv(x.uColor,T),e.uniform2f(x.uFade,b,p),e.uniform1f(x.uReveal,R),e.uniform1f(x.uBrightness,o.brightness),e.uniform1f(x.uLightMode,o.lightMode?1:0),e.uniform1f(x.uOpacity,o.opacity),e.uniform1f(x.uStyle,o.markers),e.depthFunc(e.LEQUAL),e.depthMask(!1),e.enable(e.BLEND),e.blendFunc(e.ONE,e.ONE_MINUS_SRC_ALPHA),e.drawArraysInstanced(e.TRIANGLE_STRIP,0,4,(M.columns+1)*(M.rows+1)),e.disable(e.BLEND),e.depthMask(!0)}e.disable(e.DEPTH_TEST)},Pe=o.glow>.001;if(Pe){const y=Math.max(1,Math.round(m.width/2)),L=Math.max(1,Math.round(m.height/2));Ue(Se,y,L,!0),Ce.forEach((_,f)=>{const x=Math.max(1,Math.round(m.width/2**(f+2))),xt=Math.max(1,Math.round(m.height/2**(f+2)));Ue(_[0],x,xt,!1),Ue(_[1],x,xt,!1)}),e.bindFramebuffer(e.FRAMEBUFFER,Se.framebuffer),Ee(.5,y,L,2);let F=Se;Ce.forEach(([_,f])=>{e.bindFramebuffer(e.FRAMEBUFFER,_.framebuffer),e.viewport(0,0,_.width,_.height),e.useProgram(ue.program),j(0,F.texture),e.uniform1i(ue.uniforms.uSource,0),e.uniform2f(ue.uniforms.uTarget,_.width,_.height),e.uniform2f(ue.uniforms.uTexel,1/F.width,1/F.height),e.drawArrays(e.TRIANGLES,0,3),e.useProgram(Q.program),e.uniform1i(Q.uniforms.uSource,0),e.uniform2f(Q.uniforms.uTarget,f.width,f.height),e.bindFramebuffer(e.FRAMEBUFFER,f.framebuffer),j(0,_.texture),e.uniform2f(Q.uniforms.uStep,1/_.width,0),e.drawArrays(e.TRIANGLES,0,3),e.bindFramebuffer(e.FRAMEBUFFER,_.framebuffer),j(0,f.texture),e.uniform2f(Q.uniforms.uStep,0,1/f.height),e.drawArrays(e.TRIANGLES,0,3),F=_})}if(e.bindFramebuffer(e.FRAMEBUFFER,null),Ee(m.ratio,D.width,D.height,1),Pe){e.viewport(0,0,D.width,D.height),e.useProgram(be.program);const y=be.uniforms;Ce.forEach(([L],F)=>{j(F,L.texture),e.uniform1i(y[`uBloom${F}`],F)}),e.uniform2f(y.uView,D.width,D.height),e.uniform1f(y.uGlow,o.glow*R),e.uniform1f(y.uLightMode,o.lightMode?1:0),e.enable(e.BLEND),o.lightMode?e.blendFunc(e.ONE,e.ONE_MINUS_SRC_ALPHA):e.blendFunc(e.ONE,e.ONE),e.drawArrays(e.TRIANGLES,0,3),e.disable(e.BLEND)}for(let y=yt;y>=0;y--)j(y,null)},$t=(o,r)=>{if(!N||!me)return!1;const i=o.mouseInteraction&&o.hoverEffect==="lift"&&t.presence>.001?t.hit:null,l=t.burst;if(!i&&!l&&t.sculptLife<=0)return!1;const u=t.brushFrom||i,p=N[ae],b=N[1-ae];e.bindFramebuffer(e.FRAMEBUFFER,b.framebuffer),e.viewport(0,0,Te,Te),e.useProgram(me.program);const v=me.uniforms;if(j(0,p.texture),e.uniform1i(v.uPrevious,0),i&&u?e.uniform4f(v.uSegment,u.x,u.z,i.x,i.z):e.uniform4f(v.uSegment,0,0,0,0),e.uniform4f(v.uBrush,1.1*o.mouseRadius,.9*o.mouseStrength,1-Math.exp(-r*7),i?t.presence:0),l){const T=te(l.age/.7);l.age+=r;const A=(te(l.age/.7)-T)*.9*Math.max(o.mouseStrength,.3);e.uniform4f(v.uBurst,l.x,l.z,1.6*o.mouseRadius,A),l.age>=.7&&(t.burst=null)}else e.uniform4f(v.uBurst,0,0,1,0);const w=.25+3*o.trail*o.trail;return e.uniform2f(v.uDecay,Math.exp(-r/w),Math.exp(-r/.7)),e.disable(e.BLEND),e.drawArrays(e.TRIANGLES,0,3),ae=1-ae,t.brushFrom=i?{x:i.x,z:i.z}:null,i||l?t.sculptLife=w*6:t.sculptLife-=r,!0};let at=X.current.dpr;const $e=()=>{const o=X.current;at=o.dpr,m.width=Math.max(1,q.clientWidth),m.height=Math.max(1,q.clientHeight),m.ratio=Math.min(o.dpr||window.devicePixelRatio||1,2),D.width=Math.max(1,Math.round(m.width*m.ratio)),D.height=Math.max(1,Math.round(m.height*m.ratio)),ut(),Y()},ct=o=>{if(xe=0,!De||document.hidden)return;const r=X.current;r.dpr!==at&&$e();const i=Le?S((o-Le)/1e3,0,1/20):1/60;Le=o,!r.intro||W?t.intro=1:t.intro<1&&(t.intro=Math.min(1,t.intro+i/Kt)),t.rise=te(t.intro);const l=W?1:1-Math.exp(-i/.4);t.tilt+=(r.tilt-t.tilt)*l,t.elevation+=(r.elevation-t.elevation)*l,t.scale=r.scale,t.clock+=i;const u=W?0:r.glitch;if(u>0)if(t.clock>=I.next&&t.clock>=I.until&&(I.until=t.clock+.1+$()*.22*(.5+u),I.next=I.until+(9-7.4*u)*(.45+$()*1.1),I.roll=0),t.clock<I.until){if(t.clock>=I.roll){ce.fill(0);const R=1+Math.floor($()*3);for(let G=0;G<R;G++){const le=3+$()*$()*m.height*.14,Ee=$()*m.height,Pe=($()-.5)*2*(10+46*u);ce.set([Ee,Ee+le,Pe,1+$()*3*u],G*4)}I.seed=$(),I.roll=t.clock+.04+$()*.05}}else ce.fill(0);else ce.fill(0);W||(t.travelX+=r.direction[0]*r.speed*.8*i,t.travelZ+=r.direction[1]*r.speed*.8*i,t.morph+=r.morph*.12*i);const p=k.inside&&r.mouseInteraction;t.presence+=((p?1:0)-t.presence)*(1-Math.exp(-i/(p?.18:.45)));const b=k.x/m.width*2-1,v=1-k.y/m.height*2,w=W||!p?0:r.parallax,T=b*w*.09,A=-v*w*.045;t.yawVelocity+=(38*(T-t.yaw)-11*t.yawVelocity)*i,t.pitchVelocity+=(38*(A-t.pitch)-11*t.pitchVelocity)*i,t.yaw+=t.yawVelocity*i,t.pitch+=t.pitchVelocity*i;const g=Ge();p?(t.hit=it(g,r,b,v),t.hit&&t.brushFrom&&Math.hypot(t.hit.x-t.brushFrom.x,t.hit.z-t.brushFrom.z)>3*r.mouseRadius&&(t.brushFrom=null)):t.presence<.002&&(t.hit=null,t.brushFrom=null);const U=t.hit&&r.mouseInteraction&&r.hoverEffect==="trace"?t.presence:0;if(t.hit){const R=we/t.scale,G=Ft(t.hit.x,t.hit.z,R,t.morph*.37,t.morph*.23)+r.detail*.1*fo(t.hit.x,t.hit.z,R);t.level=t.trace<.01?G:t.level+(G-t.level)*(1-Math.exp(-i/.09))}t.trace+=(U-t.trace)*(1-Math.exp(-i/.2));const M=t.hit&&r.depthOfField>0?t.hit.depth:g.distance;t.focus+=(M-t.focus)*(1-Math.exp(-i/.35));for(let R=K.length-1;R>=0;R--)K[R].age+=i,K[R].age>4&&K.splice(R,1);const J=$t(r,i);ut();const H=Math.abs(r.tilt-t.tilt)>.01||Math.abs(r.elevation-t.elevation)>1e-4||Math.abs(t.yaw-T)>1e-4||Math.abs(t.pitch-A)>1e-4||Math.abs(t.yawVelocity)>1e-4||Math.abs(t.pitchVelocity)>1e-4||Math.abs(M-t.focus)>.001||Math.abs(U-t.trace)>.001;Ae=!W&&(r.speed!==0||r.morph!==0||r.glitch>0||r.markers>=0)||t.intro<1||K.length>0||J||H||t.presence>.001&&t.presence<.999?0:Ae+i,Ae<.5&&(xe=requestAnimationFrame(ct))};function Y(){Ae=0,!xe&&De&&!document.hidden&&(Le=0,xe=requestAnimationFrame(ct))}const lt=o=>{const r=q.getBoundingClientRect(),i=o.clientX-r.left,l=o.clientY-r.top;return{x:i,y:l,inside:i>=0&&l>=0&&i<=r.width&&l<=r.height}},ft=o=>{const{x:r,y:i,inside:l}=lt(o),u=k.inside;k.inside=l,l&&(k.x=r,k.y=i),(l||u)&&Y()},st=o=>{const r=X.current,{x:i,y:l,inside:u}=lt(o);if(!u||(k.x=i,k.y=l,k.inside=!0,Y(),r.glitch>0&&!W&&(I.until=t.clock+.16,I.roll=0),!r.mouseInteraction||r.clickEffect!=="pulse"&&r.clickEffect!=="peak"))return;const p=it(Ge(),r,i/m.width*2-1,1-l/m.height*2);p&&(r.clickEffect==="peak"&&N?t.burst={x:p.x,z:p.z,age:0}:r.clickEffect==="pulse"&&(K.length>=Oe&&K.shift(),K.push({x:p.x,z:p.z,age:0})))},_e=o=>{o.pointerType==="touch"&&(k.inside=!1,Y())},ht=()=>{k.inside=!1,Y()},mt=()=>Y(),dt=new ResizeObserver($e);dt.observe(q);const vt=new IntersectionObserver(o=>{De=o.some(r=>r.isIntersecting),De&&Y()});return vt.observe(q),window.addEventListener("pointermove",ft,{passive:!0}),window.addEventListener("pointerdown",st,{passive:!0}),window.addEventListener("pointerup",_e,{passive:!0}),window.addEventListener("pointercancel",_e,{passive:!0}),document.documentElement.addEventListener("pointerleave",ht),document.addEventListener("visibilitychange",mt),$e(),se.current=Y,()=>{var o;cancelAnimationFrame(xe),se.current=null,dt.disconnect(),vt.disconnect(),window.removeEventListener("pointermove",ft),window.removeEventListener("pointerdown",st),window.removeEventListener("pointerup",_e),window.removeEventListener("pointercancel",_e),document.documentElement.removeEventListener("pointerleave",ht),document.removeEventListener("visibilitychange",mt),D.removeEventListener("webglcontextlost",et),D.removeEventListener("webglcontextrestored",tt),[Se,...Ce.flat()].forEach(r=>{r.texture&&e.deleteTexture(r.texture),r.depth&&e.deleteRenderbuffer(r.depth),e.deleteFramebuffer(r.framebuffer)}),N==null||N.forEach(r=>{e.deleteTexture(r.texture),e.deleteFramebuffer(r.framebuffer)}),e.deleteTexture(ve),e.deleteVertexArray(ot),E.texture&&e.deleteTexture(E.texture),E.heights&&e.deleteTexture(E.heights),e.deleteFramebuffer(E.framebuffer),[Me,ne,me,ue,Q,be,Re].forEach(r=>r&&e.deleteProgram(r.program)),(o=e.getExtension("WEBGL_lose_context"))==null||o.loseContext()}},[Ut]),ee.useEffect(()=>{var q;(q=se.current)==null||q.call(se)}),gt.jsx("div",{ref:Ye,className:`topography-container ${zt}`.trim(),style:kt,children:gt.jsx("canvas",{ref:Qe,className:"topography-canvas","aria-hidden":"true"})})};export{po as default};
