const r=`'use client';\r
\r
import { useEffect, useRef, useState } from 'react';\r
import './Topography.css';\r
\r
const FOV = 0.32;\r
const ORBIT = 9;\r
const NEAR = 0.05;\r
const FAR = 160;\r
const HEIGHT = 1.7;\r
const FREQUENCY = 0.45;\r
const INTRO_SECONDS = 2.8;\r
const MAX_PULSES = 4;\r
const BLOOM_LEVELS = 4;\r
const SCULPT_SIZE = 256;\r
const SCULPT_SPAN = 48;\r
const MAX_CELLS = 200000;\r
const SUN = [-0.81, 0.58, -0.02];\r
const DIRECTIONS = { forward: [0, 1], backward: [0, -1], left: [-1, 0], right: [1, 0] };\r
const HOVER_EFFECTS = ['lift', 'trace', 'light'];\r
const MARKER_STYLES = { plus: 0, dots: 1 };\r
const MARKER_SPACING = 1.25;\r
\r
const COMMON = \`\r
precision highp float;\r
precision highp int;\r
\r
uniform float uFrequency;\r
uniform vec2 uMorph;\r
uniform sampler2D uSculpt;\r
uniform float uSculptOn;\r
uniform vec4 uPulses[\${MAX_PULSES}];\r
uniform vec3 uEye;\r
uniform vec3 uForward;\r
uniform vec3 uNear;\r
\r
uint lattice(ivec2 p) {\r
  uvec2 q = uvec2(p + 1073741824);\r
  uint h = q.x * 2654435761u + q.y * 2246822519u;\r
  h = (h ^ (h >> 15u)) * 739982445u;\r
  h = (h ^ (h >> 12u)) * 695872825u;\r
  return h ^ (h >> 15u);\r
}\r
\r
float corner(ivec2 c, vec2 f) {\r
  uint h = lattice(c);\r
  vec2 g = vec2(float(h & 65535u), float(h >> 16u)) / 32767.5 - 1.0;\r
  return dot(g, f);\r
}\r
\r
float noise(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = p - i;\r
  ivec2 c = ivec2(i);\r
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);\r
  float a = corner(c, f);\r
  float b = corner(c + ivec2(1, 0), f - vec2(1.0, 0.0));\r
  float d = corner(c + ivec2(0, 1), f - vec2(0.0, 1.0));\r
  float e = corner(c + ivec2(1, 1), f - vec2(1.0, 1.0));\r
  return mix(mix(a, b, u.x), mix(d, e, u.x), u.y);\r
}\r
\r
vec2 octave(vec2 p, vec2 shift) {\r
  return vec2(1.6 * p.x - 1.2 * p.y, 1.2 * p.x + 1.6 * p.y) + shift;\r
}\r
\r
float relief(vec2 t) {\r
  vec2 p = t * uFrequency;\r
  vec2 w = vec2(noise(p * 0.42 + uMorph), noise(p * 0.42 - uMorph.yx + vec2(5.2, 1.3)));\r
  p += w * 0.8;\r
  float n = noise(p) * 0.55;\r
  p = octave(p, vec2(7.1, 3.7));\r
  n += noise(p) * 0.15;\r
  p = octave(p, vec2(1.9, 8.3));\r
  n += noise(p) * 0.04;\r
  float s = log(1.0 + exp(7.0 * (3.0 * n + 0.05))) / 7.0;\r
  return s * s * 1.4 + 0.1 * n;\r
}\r
\r
float swell(vec2 t) {\r
  float lift = 0.0;\r
  for (int i = 0; i < \${MAX_PULSES}; i++) {\r
    vec4 p = uPulses[i];\r
    if (p.w <= 0.0) continue;\r
    float x = (length(t - p.xy) - p.z) / (0.28 + p.z * 0.05);\r
    lift += exp(-x * x) * p.w;\r
  }\r
  return lift;\r
}\r
\r
vec4 sculpted(vec2 t) {\r
  return uSculptOn > 0.5 ? textureLod(uSculpt, t / \${SCULPT_SPAN}.0, 0.0) : vec4(0.0);\r
}\r
\r
float settle(vec2 world) {\r
  float depth = dot(vec3(world.x, 0.0, world.y) - uEye, uForward);\r
  float x = clamp((depth - uNear.x) / max(uNear.y - uNear.x, 1e-3), 0.0, 1.0);\r
  return mix(uNear.z, 1.0, x * x * x * (x * (x * 6.0 - 15.0) + 10.0));\r
}\r
\`;\r
\r
const FIELD = \`#version 300 es\r
\${COMMON}\r
uniform ivec2 uBase;\r
uniform float uCell;\r
uniform float uDetail;\r
layout(location = 0) out vec4 outField;\r
layout(location = 1) out vec4 outHeight;\r
\r
void main() {\r
  vec2 t = vec2(uBase + ivec2(gl_FragCoord.xy)) * uCell;\r
  vec4 carved = sculpted(t);\r
  float ring = swell(t);\r
  float ground = relief(t) + carved.r + ring * 0.14;\r
  vec2 dp = t * uFrequency * 5.0 + vec2(13.1, 4.7);\r
  float fine = noise(dp) * 0.6 + noise(octave(dp, vec2(2.3, 6.1))) * 0.3;\r
  outField = vec4(carved.g, ring, ground, carved.r);\r
  outHeight = vec4(ground + uDetail * 0.1 * fine, 0.0, 0.0, 1.0);\r
}\`;\r
\r
const terrainVertex = baked => \`#version 300 es\r
#define BAKED \${baked ? 1 : 0}\r
\${COMMON}\r
uniform sampler2D uField;\r
uniform ivec2 uOrigin;\r
uniform ivec2 uCamCell;\r
uniform vec2 uCamFrac;\r
uniform float uCell;\r
uniform int uStride;\r
uniform float uHeight;\r
uniform mat4 uViewProj;\r
out vec2 vTexel;\r
out vec2 vTerrain;\r
out float vDepth;\r
out float vLift;\r
out vec3 vNormal;\r
\r
float ground(vec2 t) {\r
  return relief(t) + swell(t) * 0.14;\r
}\r
\r
void main() {\r
  ivec2 step = ivec2(gl_VertexID >> 1, gl_InstanceID + (gl_VertexID & 1)) * uStride;\r
  ivec2 local = uOrigin + step;\r
  vec2 terrain = vec2(local + uCamCell) * uCell;\r
  vec2 world = vec2(local) * uCell - uCamFrac;\r
  float k = settle(world);\r
#if BAKED\r
  ivec2 texel = step + 2;\r
  vec4 c = texelFetch(uField, texel, 0);\r
  vec4 l = texelFetch(uField, texel - ivec2(1, 0), 0);\r
  vec4 r = texelFetch(uField, texel + ivec2(1, 0), 0);\r
  vec4 d = texelFetch(uField, texel - ivec2(0, 1), 0);\r
  vec4 u = texelFetch(uField, texel + ivec2(0, 1), 0);\r
  float h = (c.b - c.a) * k + c.a;\r
  float dx = (l.b - l.a - r.b + r.a) * k + l.a - r.a;\r
  float dz = (d.b - d.a - u.b + u.a) * k + d.a - u.a;\r
  vNormal = vec3(dx * uHeight / (2.0 * uCell), 1.0, dz * uHeight / (2.0 * uCell));\r
  vTexel = vec2(texel) + 0.5;\r
#else\r
  float h = ground(terrain) * k;\r
  float hx = ground(terrain + vec2(0.04, 0.0)) * k;\r
  float hz = ground(terrain + vec2(0.0, 0.04)) * k;\r
  vNormal = vec3((h - hx) * uHeight / 0.04, 1.0, (h - hz) * uHeight / 0.04);\r
  vTexel = vec2(0.0);\r
#endif\r
  vec4 clip = uViewProj * vec4(world.x, h * uHeight, world.y, 1.0);\r
  gl_Position = clip;\r
  vTerrain = terrain;\r
  vDepth = clip.w;\r
  vLift = h * uHeight;\r
}\`;\r
\r
const terrainFragment = baked => \`#version 300 es\r
#define BAKED \${baked ? 1 : 0}\r
\${COMMON}\r
uniform sampler2D uField;\r
uniform highp sampler2D uHeightField;\r
uniform float uDetail;\r
uniform float uLines;\r
uniform float uLineWidth;\r
uniform float uMajor;\r
uniform vec3 uColor;\r
uniform float uBrightness;\r
uniform vec2 uFade;\r
uniform vec3 uFocus;\r
uniform vec4 uHeat;\r
uniform vec4 uLamp;\r
uniform vec4 uTrace;\r
uniform vec3 uSun;\r
uniform float uRefDepth;\r
uniform float uReveal;\r
uniform float uLightMode;\r
uniform float uOpacity;\r
uniform vec4 uGlitch[3];\r
uniform float uGlitchSeed;\r
uniform float uPixel;\r
in vec2 vTexel;\r
in vec2 vTerrain;\r
in float vDepth;\r
in float vLift;\r
in vec3 vNormal;\r
out vec4 outColor;\r
\r
float smoother(float x) {\r
  x = clamp(x, 0.0, 1.0);\r
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);\r
}\r
\r
float stroke(float dist, float width, float soft, float density, float crowd) {\r
  float cover = max(0.0, min(min(width, soft), 0.5 * (width + soft) - dist)) / soft;\r
  return mix(cover, min(width * density, 1.0) * 0.6, crowd);\r
}\r
\r
float sampleHeight(vec2 coord, out vec2 slope) {\r
  vec2 u = coord - 0.5;\r
  vec2 i = floor(u + 0.5);\r
  vec2 f = u - i;\r
  vec3 wx = vec3(0.5 * (0.5 - f.x) * (0.5 - f.x), 0.75 - f.x * f.x, 0.5 * (0.5 + f.x) * (0.5 + f.x));\r
  vec3 wy = vec3(0.5 * (0.5 - f.y) * (0.5 - f.y), 0.75 - f.y * f.y, 0.5 * (0.5 + f.y) * (0.5 + f.y));\r
  vec3 dx = vec3(f.x - 0.5, -2.0 * f.x, 0.5 + f.x);\r
  vec3 dy = vec3(f.y - 0.5, -2.0 * f.y, 0.5 + f.y);\r
  ivec2 base = ivec2(i) - 1;\r
  float total = 0.0;\r
  slope = vec2(0.0);\r
  for (int y = 0; y < 3; y++) {\r
    float a = texelFetch(uHeightField, base + ivec2(0, y), 0).r;\r
    float b = texelFetch(uHeightField, base + ivec2(1, y), 0).r;\r
    float c = texelFetch(uHeightField, base + ivec2(2, y), 0).r;\r
    float row = a * wx.x + b * wx.y + c * wx.z;\r
    total += row * wy[y];\r
    slope += vec2((a * dx.x + b * dx.y + c * dx.z) * wy[y], row * dy[y]);\r
  }\r
  return total;\r
}\r
\r
void main() {\r
  float py = gl_FragCoord.y / uPixel;\r
  float shift = 0.0;\r
  float split = 0.0;\r
  for (int i = 0; i < 3; i++) {\r
    if (py >= uGlitch[i].x && py < uGlitch[i].y) {\r
      shift = uGlitch[i].z * uPixel;\r
      split = uGlitch[i].w * uPixel;\r
    }\r
  }\r
  vec2 spot = vTerrain - dFdx(vTerrain) * shift;\r
#if BAKED\r
  vec2 ex = dFdx(vTexel);\r
  vec2 ey = dFdy(vTexel);\r
  vec2 coord = vTexel - ex * shift;\r
  vec2 slope;\r
  float h = sampleHeight(coord, slope);\r
  vec4 field = texture(uField, coord / vec2(textureSize(uField, 0)));\r
  float trail = field.r;\r
  float ring = field.g;\r
  float gx = dot(slope, ex) * uLines;\r
  float gy = dot(slope, ey) * uLines;\r
#else\r
  vec2 dp = spot * uFrequency * 5.0 + vec2(13.1, 4.7);\r
  float ring = swell(spot);\r
  float h = relief(spot) + ring * 0.14 + uDetail * 0.1 * (noise(dp) * 0.6 + noise(octave(dp, vec2(2.3, 6.1))) * 0.3);\r
  float trail = 0.0;\r
  float gx = dFdx(h) * uLines;\r
  float gy = dFdy(h) * uLines;\r
#endif\r
\r
  float lc = h * uLines + 0.5;\r
  float density = max(sqrt(gx * gx + gy * gy), 1e-5);\r
  float dist = abs(fract(lc + 0.5) - 0.5) / density;\r
  float major = uMajor * (1.0 - step(0.5, mod(floor(lc + 0.5), 5.0)));\r
\r
  vec2 hd = spot - uHeat.xy;\r
  float heat = exp(-dot(hd, hd) / (uHeat.z * uHeat.z)) * uHeat.w + trail * 0.6;\r
  float energy = heat + ring;\r
\r
  float depth = max(vDepth, 0.01);\r
  float persp = clamp(sqrt(uRefDepth / depth), 0.6, 1.6);\r
  float width = uLineWidth * persp * (1.0 + 0.6 * major) * (1.0 + 0.45 * min(energy, 1.5));\r
  float soft = 1.0 + min(uFocus.y * abs(1.0 - uFocus.x / depth), uFocus.z);\r
  float crowd = smoothstep(0.3, 0.75, density * max(width, soft));\r
  float cover = stroke(dist, width, soft, density, crowd);\r
  vec3 cover3 = vec3(cover);\r
  if (split > 0.0) {\r
    float offset = split * density;\r
    cover3.r = stroke(abs(fract(lc + offset + 0.5) - 0.5) / density, width, soft, density, crowd);\r
    cover3.b = stroke(abs(fract(lc - offset + 0.5) - 0.5) / density, width, soft, density, crowd);\r
    vec2 block = floor(vec2(gl_FragCoord.x / (uPixel * 26.0), py / 5.0)) + uGlitchSeed * 71.0;\r
    float drop = fract(sin(dot(block, vec2(12.9898, 78.233))) * 43758.5453);\r
    cover3 *= drop > 0.82 ? 0.1 : 1.2;\r
  }\r
\r
  vec3 normal = normalize(vNormal);\r
  float sun = clamp(dot(normal, uSun), 0.0, 1.0);\r
  vec3 toLamp = uLamp.xyz - vec3(vTerrain.x, vLift, vTerrain.y);\r
  float lampDistance = length(toLamp);\r
  float lamp = clamp(dot(normal, toLamp / max(lampDistance, 1e-3)), 0.0, 1.0) * uLamp.w / (1.0 + lampDistance * lampDistance * 0.9);\r
  float level = mix(0.45, 1.05, smoothstep(0.0, 1.1, h)) * mix(0.35, 1.25, sun * sun) * (1.0 + 0.6 * major);\r
  level += heat * 1.4 + ring * 3.0 + lamp * 1.2;\r
\r
  float fade = 1.0 - smoother((depth - uFade.x) / max(uFade.y - uFade.x, 1e-3));\r
  vec3 light = cover3 * level;\r
\r
  if (uTrace.y > 0.0) {\r
    float traceWidth = uLineWidth * persp * 1.8;\r
    float trace = stroke(abs(h - uTrace.x) * uLines / density, traceWidth, soft, density, crowd);\r
    vec2 td = spot - uTrace.zw;\r
    light += trace * uTrace.y * mix(0.35, 1.0, exp(-dot(td, td) / 20.0)) * 2.6;\r
  }\r
  light *= fade * uBrightness * uReveal;\r
\r
  if (uLightMode > 0.5) {\r
    float ink = (1.0 - exp(-max(max(light.r, light.g), light.b) * 1.8)) * 0.92 * uOpacity;\r
    outColor = vec4(uColor * ink, ink);\r
    return;\r
  }\r
\r
  vec3 color = 1.0 - exp(-uColor * light * 1.8);\r
  float top = max(max(color.r, color.g), color.b);\r
  float dither = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;\r
  color = max(color + dither / 255.0 * step(0.002, top), 0.0);\r
  outColor = vec4(color, max(max(color.r, color.g), color.b)) * uOpacity;\r
}\`;\r
\r
const MARKER_VERTEX = \`#version 300 es\r
\${COMMON}\r
uniform ivec2 uOrigin;\r
uniform ivec2 uCamCell;\r
uniform vec2 uCamFrac;\r
uniform float uSpacing;\r
uniform int uColumns;\r
uniform float uHeight;\r
uniform mat4 uViewProj;\r
uniform vec2 uView;\r
uniform float uSize;\r
uniform float uRefDepth;\r
uniform vec4 uHeat;\r
uniform float uTime;\r
uniform vec4 uGlitch[3];\r
uniform float uPixel;\r
out vec2 vCorner;\r
out float vSize;\r
out float vGlow;\r
out float vFrame;\r
out float vDepth;\r
\r
void main() {\r
  ivec2 local = uOrigin + ivec2(gl_InstanceID % uColumns, gl_InstanceID / uColumns);\r
  ivec2 id = local + uCamCell;\r
  vec2 terrain = vec2(id) * uSpacing;\r
  vec2 world = vec2(local) * uSpacing - uCamFrac;\r
  float ring = swell(terrain);\r
  float h = (relief(terrain) + ring * 0.14) * settle(world) + sculpted(terrain).r;\r
  vec4 clip = uViewProj * vec4(world.x, h * uHeight + 0.05, world.y, 1.0);\r
  uint seed = lattice(id + ivec2(911, 377));\r
  float a = float(seed & 1023u) / 1023.0;\r
  float b = float((seed >> 10u) & 1023u) / 1023.0;\r
  vec2 hd = terrain - uHeat.xy;\r
  float heat = exp(-dot(hd, hd) / (uHeat.z * uHeat.z)) * uHeat.w;\r
  float blink = step(0.92, a) * (0.5 + 0.5 * sin(uTime * (1.4 + b * 2.2) + b * 40.0));\r
  float size = uSize * clamp(sqrt(uRefDepth / max(clip.w, 0.01)), 0.6, 1.3) * (1.0 + 0.4 * heat + 0.35 * blink);\r
  float frame = max(smoothstep(0.55, 0.95, blink), smoothstep(0.3, 0.8, heat));\r
  vec2 corner = vec2(float(gl_VertexID & 1), float(gl_VertexID >> 1)) * 2.0 - 1.0;\r
  vec2 offset = corner * (size * (frame > 0.001 ? 2.6 : 1.0) + 1.5);\r
  float py = (clip.y / clip.w * 0.5 + 0.5) * uView.y / uPixel;\r
  float shift = 0.0;\r
  for (int i = 0; i < 3; i++) {\r
    if (py >= uGlitch[i].x && py < uGlitch[i].y) shift = uGlitch[i].z;\r
  }\r
  clip.xy += (offset + vec2(shift * uPixel, 0.0)) / uView * 2.0 * clip.w;\r
  gl_Position = clip;\r
  vCorner = offset;\r
  vSize = size;\r
  vFrame = frame;\r
  vGlow = 0.5 + 0.4 * b + blink * 0.9 + heat * 1.8 + ring * 3.0;\r
  vDepth = clip.w;\r
}\`;\r
\r
const MARKER_FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform vec3 uColor;\r
uniform vec2 uFade;\r
uniform float uReveal;\r
uniform float uBrightness;\r
uniform float uLightMode;\r
uniform float uOpacity;\r
uniform float uStyle;\r
uniform float uPixel;\r
in vec2 vCorner;\r
in float vSize;\r
in float vGlow;\r
in float vFrame;\r
in float vDepth;\r
out vec4 outColor;\r
\r
float smoother(float x) {\r
  x = clamp(x, 0.0, 1.0);\r
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  vec2 a = abs(vCorner);\r
  float cover;\r
  if (uStyle < 0.5) {\r
    float thick = max(0.6 * uPixel, 0.5);\r
    float across = clamp(vSize - a.x + 0.5, 0.0, 1.0) * clamp(thick - a.y + 0.5, 0.0, 1.0);\r
    float down = clamp(vSize - a.y + 0.5, 0.0, 1.0) * clamp(thick - a.x + 0.5, 0.0, 1.0);\r
    cover = max(across, down);\r
  } else {\r
    cover = clamp(vSize * 0.42 - length(vCorner) + 0.5, 0.0, 1.0);\r
  }\r
  if (vFrame > 0.001) {\r
    float edge = vSize * 2.3;\r
    float reach = edge * 0.45;\r
    float line = max(0.5 * uPixel, 0.5);\r
    float sides = clamp(line - abs(a.x - edge) + 0.5, 0.0, 1.0) * clamp(a.y - edge + reach + 0.5, 0.0, 1.0) * clamp(edge + line - a.y + 0.5, 0.0, 1.0);\r
    float caps = clamp(line - abs(a.y - edge) + 0.5, 0.0, 1.0) * clamp(a.x - edge + reach + 0.5, 0.0, 1.0) * clamp(edge + line - a.x + 0.5, 0.0, 1.0);\r
    cover = max(cover, max(sides, caps) * vFrame * 0.8);\r
  }\r
  float fade = 1.0 - smoother((vDepth - uFade.x) / max(uFade.y - uFade.x, 1e-3));\r
  float light = cover * vGlow * fade * fade * uReveal * uBrightness;\r
  if (uLightMode > 0.5) {\r
    float ink = (1.0 - exp(-light * 1.8)) * 0.92 * uOpacity;\r
    outColor = vec4(uColor * ink, ink);\r
    return;\r
  }\r
  vec3 color = 1.0 - exp(-uColor * light * 1.8);\r
  outColor = vec4(color, max(max(color.r, color.g), color.b)) * uOpacity;\r
}\`;\r
\r
const FULLSCREEN = \`#version 300 es\r
void main() {\r
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\r
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const SCULPT = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uPrevious;\r
uniform vec4 uSegment;\r
uniform vec4 uBrush;\r
uniform vec4 uBurst;\r
uniform vec2 uDecay;\r
out vec4 outColor;\r
\r
vec2 wrapped(vec2 d) {\r
  return d - \${SCULPT_SPAN}.0 * floor(d / \${SCULPT_SPAN}.0 + 0.5);\r
}\r
\r
void main() {\r
  vec4 previous = texelFetch(uPrevious, ivec2(gl_FragCoord.xy), 0);\r
  vec2 t = gl_FragCoord.xy / \${SCULPT_SIZE}.0 * \${SCULPT_SPAN}.0;\r
  vec2 a = wrapped(t - uSegment.xy);\r
  vec2 ab = uSegment.zw - uSegment.xy;\r
  float k = clamp(dot(a, ab) / max(dot(ab, ab), 1e-6), 0.0, 1.0);\r
  vec2 d = a - ab * k;\r
  float g = exp(-dot(d, d) / (uBrush.x * uBrush.x)) * uBrush.w;\r
  float height = previous.r * uDecay.x;\r
  height += (uBrush.y - height) * g * uBrush.z;\r
  float heat = previous.g * uDecay.y;\r
  heat += (1.0 - heat) * g * uBrush.z;\r
  vec2 b = wrapped(t - uBurst.xy);\r
  height += uBurst.w * exp(-dot(b, b) / (uBurst.z * uBurst.z));\r
  outColor = vec4(height, heat, 0.0, 1.0);\r
}\`;\r
\r
const DOWNSAMPLE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uSource;\r
uniform vec2 uTarget;\r
uniform vec2 uTexel;\r
out vec4 outColor;\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uTarget;\r
  vec4 color = texture(uSource, uv - uTexel);\r
  color += texture(uSource, uv + uTexel);\r
  color += texture(uSource, uv + vec2(uTexel.x, -uTexel.y));\r
  color += texture(uSource, uv + vec2(-uTexel.x, uTexel.y));\r
  outColor = min(color * 0.25, vec4(1.0));\r
}\`;\r
\r
const BLUR = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uSource;\r
uniform vec2 uTarget;\r
uniform vec2 uStep;\r
out vec4 outColor;\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uTarget;\r
  vec4 color = texture(uSource, uv) * 0.181862;\r
  color += (texture(uSource, uv + uStep * 1.423135) + texture(uSource, uv - uStep * 1.423135)) * 0.284316;\r
  color += (texture(uSource, uv + uStep * 3.326702) + texture(uSource, uv - uStep * 3.326702)) * 0.106598;\r
  color += (texture(uSource, uv + uStep * 5.242989) + texture(uSource, uv - uStep * 5.242989)) * 0.018156;\r
  outColor = color;\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uBloom0;\r
uniform sampler2D uBloom1;\r
uniform sampler2D uBloom2;\r
uniform sampler2D uBloom3;\r
uniform vec2 uView;\r
uniform float uGlow;\r
uniform float uLightMode;\r
out vec4 outColor;\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uView;\r
  vec4 halo = texture(uBloom0, uv) * 0.4;\r
  halo += texture(uBloom1, uv) * 0.3;\r
  halo += texture(uBloom2, uv) * 0.2;\r
  halo += texture(uBloom3, uv) * 0.1;\r
  if (uLightMode > 0.5) {\r
    outColor = halo * uGlow * 0.35;\r
    return;\r
  }\r
  vec3 color = halo.rgb * uGlow * 1.6;\r
  color = color / (1.0 + color);\r
  outColor = vec4(color, max(max(color.r, color.g), color.b));\r
}\`;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const smoother = x => {\r
  const t = clamp(x, 0, 1);\r
  return t * t * t * (t * (t * 6 - 15) + 10);\r
};\r
\r
const lattice = (x, y) => {\r
  let h = (Math.imul(x + 1073741824, 2654435761) + Math.imul(y + 1073741824, 2246822519)) >>> 0;\r
  h = Math.imul(h ^ (h >>> 15), 739982445) >>> 0;\r
  h = Math.imul(h ^ (h >>> 12), 695872825) >>> 0;\r
  return (h ^ (h >>> 15)) >>> 0;\r
};\r
\r
const corner = (cx, cy, fx, fy) => {\r
  const h = lattice(cx, cy);\r
  return ((h & 65535) / 32767.5 - 1) * fx + ((h >>> 16) / 32767.5 - 1) * fy;\r
};\r
\r
const noise = (x, y) => {\r
  const ix = Math.floor(x);\r
  const iy = Math.floor(y);\r
  const fx = x - ix;\r
  const fy = y - iy;\r
  const ux = fx * fx * fx * (fx * (fx * 6 - 15) + 10);\r
  const uy = fy * fy * fy * (fy * (fy * 6 - 15) + 10);\r
  const a = corner(ix, iy, fx, fy);\r
  const b = corner(ix + 1, iy, fx - 1, fy);\r
  const d = corner(ix, iy + 1, fx, fy - 1);\r
  const e = corner(ix + 1, iy + 1, fx - 1, fy - 1);\r
  const top = a + (b - a) * ux;\r
  return top + (d + (e - d) * ux - top) * uy;\r
};\r
\r
const relief = (tx, tz, frequency, morphX, morphZ) => {\r
  let px = tx * frequency;\r
  let pz = tz * frequency;\r
  const wx = noise(px * 0.42 + morphX, pz * 0.42 + morphZ);\r
  const wz = noise(px * 0.42 - morphZ + 5.2, pz * 0.42 - morphX + 1.3);\r
  px += wx * 0.8;\r
  pz += wz * 0.8;\r
  let n = noise(px, pz) * 0.55;\r
  const qx = 1.6 * px - 1.2 * pz + 7.1;\r
  const qz = 1.2 * px + 1.6 * pz + 3.7;\r
  n += noise(qx, qz) * 0.15;\r
  n += noise(1.6 * qx - 1.2 * qz + 1.9, 1.2 * qx + 1.6 * qz + 8.3) * 0.04;\r
  const s = Math.log(1 + Math.exp(7 * (3 * n + 0.05))) / 7;\r
  return s * s * 1.4 + 0.1 * n;\r
};\r
\r
const fineDetail = (tx, tz, frequency) => {\r
  const px = tx * frequency * 5 + 13.1;\r
  const pz = tz * frequency * 5 + 4.7;\r
  return noise(px, pz) * 0.6 + noise(1.6 * px - 1.2 * pz + 2.3, 1.2 * px + 1.6 * pz + 6.1) * 0.3;\r
};\r
\r
const compile = (gl, type, source) => {\r
  const shader = gl.createShader(type);\r
  if (!shader) return null;\r
  gl.shaderSource(shader, source);\r
  gl.compileShader(shader);\r
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;\r
  gl.deleteShader(shader);\r
  return null;\r
};\r
\r
const link = (gl, vertexSource, fragmentSource) => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);\r
  const program = gl.createProgram();\r
  if (!vertex || !fragment || !program) return null;\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
  gl.linkProgram(program);\r
  gl.deleteShader(vertex);\r
  gl.deleteShader(fragment);\r
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {\r
    gl.deleteProgram(program);\r
    return null;\r
  }\r
  const uniforms = {};\r
  const total = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
  for (let i = 0; i < total; i++) {\r
    const info = gl.getActiveUniform(program, i);\r
    if (info) uniforms[info.name.replace(/\\[0\\]$/, '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const toRgb = hex => {\r
  let h = String(hex || '#ffffff')\r
    .replace('#', '')\r
    .trim();\r
  if (h.length === 3 || h.length === 4)\r
    h = h\r
      .slice(0, 3)\r
      .split('')\r
      .map(c => c + c)\r
      .join('');\r
  const num = parseInt(h.slice(0, 6), 16);\r
  if (Number.isNaN(num)) return [1, 1, 1];\r
  return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];\r
};\r
\r
const orient = (yaw, pitch) => {\r
  const cp = Math.cos(pitch);\r
  const f = [Math.sin(yaw) * cp, -Math.sin(pitch), Math.cos(yaw) * cp];\r
  const r = [Math.cos(yaw), 0, -Math.sin(yaw)];\r
  const u = [f[1] * r[2] - f[2] * r[1], f[2] * r[0] - f[0] * r[2], f[0] * r[1] - f[1] * r[0]];\r
  return { f, r, u };\r
};\r
\r
const lens = aspect => clamp(0.4877 / aspect, FOV, 0.6);\r
\r
const viewProjection = ({ eye, f, r, u }, aspect, out) => {\r
  const t = 1 / lens(aspect);\r
  const nf = 1 / (NEAR - FAR);\r
  const view = [\r
    r[0],\r
    u[0],\r
    -f[0],\r
    0,\r
    r[1],\r
    u[1],\r
    -f[1],\r
    0,\r
    r[2],\r
    u[2],\r
    -f[2],\r
    0,\r
    -(r[0] * eye[0] + r[1] * eye[1] + r[2] * eye[2]),\r
    -(u[0] * eye[0] + u[1] * eye[1] + u[2] * eye[2]),\r
    f[0] * eye[0] + f[1] * eye[1] + f[2] * eye[2],\r
    1\r
  ];\r
  const projection = [t / aspect, 0, 0, 0, 0, t, 0, 0, 0, 0, (FAR + NEAR) * nf, -1, 0, 0, 2 * FAR * NEAR * nf, 0];\r
  for (let c = 0; c < 4; c++) {\r
    for (let row = 0; row < 4; row++) {\r
      let sum = 0;\r
      for (let k = 0; k < 4; k++) sum += projection[k * 4 + row] * view[c * 4 + k];\r
      out[c * 4 + row] = sum;\r
    }\r
  }\r
  return out;\r
};\r
\r
const Topography = ({\r
  color = '#4f7cff',\r
  lineCount = 22,\r
  lineWidth = 1.2,\r
  majorLines = true,\r
  elevation = 1,\r
  foreground = 0.2,\r
  scale = 1,\r
  detail = 0.35,\r
  tilt = 32,\r
  speed = 0.25,\r
  direction = 'forward',\r
  morph = 0.2,\r
  glow = 0.6,\r
  depthOfField = 0.4,\r
  fog = 0.35,\r
  brightness = 1,\r
  opacity = 1,\r
  mouseInteraction = true,\r
  hoverEffect = 'lift',\r
  mouseRadius = 1,\r
  mouseStrength = 0.6,\r
  trail = 0.3,\r
  parallax = 0.5,\r
  clickEffect = 'pulse',\r
  markers = 'none',\r
  glitch = 0,\r
  intro = true,\r
  lightMode = false,\r
  dpr,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const [generation, setGeneration] = useState(0);\r
  const settings = {\r
    color,\r
    lineCount: clamp(lineCount, 2, 80),\r
    lineWidth: Math.max(0.2, lineWidth),\r
    majorLines,\r
    elevation: clamp(elevation, 0, 3),\r
    foreground: clamp(foreground, 0, 1),\r
    scale: clamp(scale, 0.2, 5),\r
    detail: clamp(detail, 0, 1),\r
    tilt: clamp(tilt, 12, 90),\r
    speed,\r
    direction: DIRECTIONS[direction] ?? DIRECTIONS.forward,\r
    morph: Math.max(0, morph),\r
    glow: Math.max(0, glow),\r
    depthOfField: clamp(depthOfField, 0, 1),\r
    fog: clamp(fog, 0, 1),\r
    brightness: Math.max(0, brightness),\r
    opacity: clamp(opacity, 0, 1),\r
    mouseInteraction,\r
    hoverEffect: HOVER_EFFECTS.includes(hoverEffect) ? hoverEffect : 'lift',\r
    mouseRadius: Math.max(0.1, mouseRadius),\r
    mouseStrength: Math.max(0, mouseStrength),\r
    trail: clamp(trail, 0, 1),\r
    parallax: clamp(parallax, 0, 1),\r
    clickEffect,\r
    markers: MARKER_STYLES[markers] ?? -1,\r
    glitch: clamp(glitch, 0, 1),\r
    intro,\r
    lightMode,\r
    dpr\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    const ratio = Math.min(settingsRef.current.dpr || window.devicePixelRatio || 1, 2);\r
    const gl = canvas?.getContext('webgl2', {\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: ratio < 1.5,\r
      depth: true,\r
      stencil: false,\r
      powerPreference: 'high-performance'\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const floatTargets = !!gl.getExtension('EXT_color_buffer_float');\r
    const terrain = link(gl, terrainVertex(floatTargets), terrainFragment(floatTargets));\r
    const fieldProgram = floatTargets ? link(gl, FULLSCREEN, FIELD) : null;\r
    const sculptProgram = floatTargets ? link(gl, FULLSCREEN, SCULPT) : null;\r
    const downProgram = link(gl, FULLSCREEN, DOWNSAMPLE);\r
    const blurProgram = link(gl, FULLSCREEN, BLUR);\r
    const compositeProgram = link(gl, FULLSCREEN, COMPOSITE);\r
    const markerProgram = link(gl, MARKER_VERTEX, MARKER_FRAGMENT);\r
    if (!terrain || !downProgram || !blurProgram || !compositeProgram || !markerProgram) return undefined;\r
\r
    const onContextLost = event => event.preventDefault();\r
    const onContextRestored = () => setGeneration(value => value + 1);\r
    canvas.addEventListener('webglcontextlost', onContextLost);\r
    canvas.addEventListener('webglcontextrestored', onContextRestored);\r
\r
    const vao = gl.createVertexArray();\r
    const format = floatTargets ? gl.RGBA16F : gl.RGBA8;\r
\r
    const createTexture = (width, height, internal, wrap) => {\r
      const texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texStorage2D(gl.TEXTURE_2D, 1, internal, width, height);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);\r
      return texture;\r
    };\r
\r
    const createTarget = () => ({\r
      texture: null,\r
      framebuffer: gl.createFramebuffer(),\r
      depth: null,\r
      width: 0,\r
      height: 0\r
    });\r
\r
    const allocate = (target, width, height, withDepth) => {\r
      if (target.texture && target.width === width && target.height === height) return;\r
      if (target.texture) gl.deleteTexture(target.texture);\r
      target.texture = createTexture(width, height, format, gl.CLAMP_TO_EDGE);\r
      target.width = width;\r
      target.height = height;\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target.texture, 0);\r
      if (withDepth) {\r
        if (!target.depth) target.depth = gl.createRenderbuffer();\r
        gl.bindRenderbuffer(gl.RENDERBUFFER, target.depth);\r
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, width, height);\r
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, target.depth);\r
      }\r
    };\r
\r
    const source = createTarget();\r
    const levels = Array.from({ length: BLOOM_LEVELS }, () => [createTarget(), createTarget()]);\r
    const sculpt = sculptProgram\r
      ? [0, 1].map(() => {\r
          const texture = createTexture(SCULPT_SIZE, SCULPT_SIZE, gl.RG16F, gl.REPEAT);\r
          const framebuffer = gl.createFramebuffer();\r
          gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
          gl.clearColor(0, 0, 0, 0);\r
          gl.clear(gl.COLOR_BUFFER_BIT);\r
          return { texture, framebuffer };\r
        })\r
      : null;\r
    const blank = createTexture(1, 1, gl.RGBA8, gl.REPEAT);\r
    const field = { texture: null, heights: null, framebuffer: gl.createFramebuffer(), width: 0, height: 0 };\r
    let sculptIndex = 0;\r
\r
    const reserveField = (width, height) => {\r
      if (field.texture && width <= field.width && height <= field.height) return;\r
      if (field.texture) gl.deleteTexture(field.texture);\r
      if (field.heights) gl.deleteTexture(field.heights);\r
      field.width = Math.max(width, Math.ceil(field.width * 1.25), 64);\r
      field.height = Math.max(height, Math.ceil(field.height * 1.25), 64);\r
      field.texture = createTexture(field.width, field.height, gl.RGBA16F, gl.CLAMP_TO_EDGE);\r
      field.heights = createTexture(field.width, field.height, gl.R32F, gl.CLAMP_TO_EDGE);\r
      gl.bindTexture(gl.TEXTURE_2D, field.heights);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, field.framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, field.texture, 0);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, field.heights, 0);\r
      gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);\r
    };\r
\r
    const bind = (unit, texture) => {\r
      gl.activeTexture(gl.TEXTURE0 + unit);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
    };\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const matrix = new Float32Array(16);\r
    const pulseData = new Float32Array(MAX_PULSES * 4);\r
    const glitchData = new Float32Array(12);\r
    const glitch = { until: 0, next: 1.5, roll: 0, seed: 0 };\r
    let entropy = 7919;\r
    const random = () => {\r
      entropy = (entropy * 16807) % 2147483647;\r
      return (entropy - 1) / 2147483646;\r
    };\r
    const pulses = [];\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const view = { width: 1, height: 1, ratio: 1, cell: 0.05, cellKey: '' };\r
    const state = {\r
      intro: settingsRef.current.intro && !reduce ? 0 : 1,\r
      rise: 1,\r
      travelX: 0,\r
      travelZ: 0,\r
      morph: 0,\r
      yaw: 0,\r
      pitch: 0,\r
      yawVelocity: 0,\r
      pitchVelocity: 0,\r
      presence: 0,\r
      focus: ORBIT,\r
      hit: null,\r
      brushFrom: null,\r
      sculptLife: 0,\r
      burst: null,\r
      level: 0,\r
      trace: 0,\r
      clock: 0,\r
      tilt: settingsRef.current.tilt,\r
      elevation: settingsRef.current.elevation,\r
      scale: settingsRef.current.scale\r
    };\r
    state.rise = smoother(state.intro);\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let quiet = 0;\r
\r
    const camera = () => {\r
      const pitch = Math.min((state.tilt * Math.PI) / 180 + state.pitch, Math.PI / 2 - 1e-4);\r
      const frame = orient(state.yaw, pitch);\r
      const lift = state.elevation * HEIGHT * state.rise * 0.18;\r
      const clearance = state.elevation * HEIGHT * state.rise * 1.3 + 0.9;\r
      const distance = Math.max(ORBIT, (clearance - lift) / Math.sin(pitch));\r
      return {\r
        ...frame,\r
        distance,\r
        eye: [-frame.f[0] * distance, lift - frame.f[1] * distance, -frame.f[2] * distance]\r
      };\r
    };\r
\r
    const rayDirection = (cam, nx, ny) => {\r
      const aspect = view.width / view.height;\r
      const t = lens(aspect);\r
      const d = [0, 1, 2].map(i => cam.f[i] + cam.r[i] * nx * t * aspect + cam.u[i] * ny * t);\r
      const length = Math.hypot(d[0], d[1], d[2]);\r
      return d.map(v => v / length);\r
    };\r
\r
    const along = (cam, d) => d[0] * cam.f[0] + d[1] * cam.f[1] + d[2] * cam.f[2];\r
\r
    const groundDepth = (cam, ny) => {\r
      const d = rayDirection(cam, 0, ny);\r
      if (d[1] > -1e-3) return Infinity;\r
      return (cam.eye[1] / -d[1]) * along(cam, d);\r
    };\r
\r
    const nearRange = (cam, s) => [groundDepth(cam, -1) * 0.9, cam.distance, s.foreground];\r
\r
    const settleAt = (cam, near, x, z) => {\r
      const depth = (x - cam.eye[0]) * cam.f[0] - cam.eye[1] * cam.f[1] + (z - cam.eye[2]) * cam.f[2];\r
      return near[2] + (1 - near[2]) * smoother((depth - near[0]) / Math.max(near[1] - near[0], 1e-3));\r
    };\r
\r
    const pick = (cam, s, nx, ny) => {\r
      const d = rayDirection(cam, nx, ny);\r
      const height = state.elevation * HEIGHT * state.rise;\r
      const frequency = FREQUENCY / state.scale;\r
      const near = nearRange(cam, s);\r
      const above = distance => {\r
        const x = cam.eye[0] + d[0] * distance;\r
        const z = cam.eye[2] + d[2] * distance;\r
        const ground = relief(state.travelX + x, state.travelZ + z, frequency, state.morph * 0.37, state.morph * 0.23);\r
        return cam.eye[1] + d[1] * distance - ground * height * settleAt(cam, near, x, z);\r
      };\r
      let distance = NEAR;\r
      let gap = above(distance);\r
      for (let i = 0; i < 200 && distance < FAR * 0.5; i++) {\r
        const next = distance + Math.max(0.02, gap * 0.4);\r
        const value = above(next);\r
        if (value < 0) {\r
          let lo = distance;\r
          let hi = next;\r
          for (let k = 0; k < 10; k++) {\r
            const mid = (lo + hi) * 0.5;\r
            if (above(mid) < 0) hi = mid;\r
            else lo = mid;\r
          }\r
          return {\r
            x: state.travelX + cam.eye[0] + d[0] * hi,\r
            y: cam.eye[1] + d[1] * hi,\r
            z: state.travelZ + cam.eye[2] + d[2] * hi,\r
            depth: hi * along(cam, d)\r
          };\r
        }\r
        distance = next;\r
        gap = value;\r
      }\r
      return null;\r
    };\r
\r
    const footprint = (cam, s, fadeEnd) => {\r
      const ceiling = state.elevation * HEIGHT * state.rise * 1.7 + 0.2 + s.mouseStrength;\r
      const box = { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity, near: Infinity };\r
      const add = (d, distance) => {\r
        const x = cam.eye[0] + d[0] * distance;\r
        const z = cam.eye[2] + d[2] * distance;\r
        box.minX = Math.min(box.minX, x);\r
        box.maxX = Math.max(box.maxX, x);\r
        box.minZ = Math.min(box.minZ, z);\r
        box.maxZ = Math.max(box.maxZ, z);\r
      };\r
      for (const nx of [-1.08, 0, 1.08]) {\r
        for (const ny of [-1.08, 1.08]) {\r
          const d = rayDirection(cam, nx, ny);\r
          const forward = Math.max(along(cam, d), 1e-3);\r
          let near = NEAR;\r
          let far = (fadeEnd * 1.05) / forward;\r
          if (d[1] < -1e-4) {\r
            near = Math.max(NEAR, (cam.eye[1] - ceiling) / -d[1]);\r
            far = Math.min(far, cam.eye[1] / -d[1]);\r
          }\r
          near = Math.min(near, far);\r
          add(d, near);\r
          add(d, far);\r
          box.near = Math.min(box.near, near * forward);\r
        }\r
      }\r
      return box;\r
    };\r
\r
    const grid = (box, cell) => {\r
      const camX = Math.floor(state.travelX / cell);\r
      const camZ = Math.floor(state.travelZ / cell);\r
      const fracX = state.travelX - camX * cell;\r
      const fracZ = state.travelZ - camZ * cell;\r
      const k0 = Math.floor((box.minX + fracX) / cell) - 2;\r
      const m0 = Math.floor((box.minZ + fracZ) / cell) - 2;\r
      const columns = clamp(Math.ceil((box.maxX + fracX) / cell) + 2 - k0, 1, 4000);\r
      const rows = clamp(Math.ceil((box.maxZ + fracZ) / cell) + 2 - m0, 1, Math.floor((MAX_CELLS * 1.5) / columns));\r
      return { cell, camX, camZ, fracX, fracZ, k0, m0, columns, rows };\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const cam = camera();\r
      viewProjection(cam, view.width / view.height, matrix);\r
\r
      const bottom = groundDepth(cam, -1);\r
      const top = Math.min(groundDepth(cam, 1), cam.distance * 3.2);\r
      const horizon = Math.max(top, bottom * 1.6, cam.distance * 1.4);\r
      const fadeEnd = horizon + (bottom * 1.8 - horizon) * s.fog;\r
      const fadeStart = fadeEnd * 0.7 + (bottom * 0.7 - fadeEnd * 0.7) * s.fog;\r
      const box = footprint(cam, s, fadeEnd);\r
\r
      const cellKey = \`\${view.width}x\${view.height}@\${view.ratio}|\${Math.round(state.tilt / 4)}|\${Math.round(state.elevation * 5)}|\${s.fog}\`;\r
      if (cellKey !== view.cellKey) {\r
        view.cellKey = cellKey;\r
        const focal = (view.height * view.ratio * 0.5) / lens(view.width / view.height);\r
        let cell = clamp((14 * Math.max(box.near, 0.5)) / focal, 0.02, 0.4);\r
        const cells = ((box.maxX - box.minX) * (box.maxZ - box.minZ)) / (cell * cell);\r
        if (cells > MAX_CELLS) cell *= Math.sqrt(cells / MAX_CELLS);\r
        view.cell = cell;\r
      }\r
\r
      const color = toRgb(s.color);\r
      const height = state.elevation * HEIGHT * state.rise;\r
      const layout = grid(box, view.cell);\r
      const near = nearRange(cam, s);\r
      const dots = s.markers >= 0 ? grid(box, MARKER_SPACING) : null;\r
      const touch = state.hit && s.mouseInteraction ? state.presence : 0;\r
      const heatStrength = touch * (0.35 + 0.5 * s.mouseStrength);\r
      const focusScale = s.depthOfField * view.height * 0.016;\r
      const reveal = smoother(state.intro / 0.35);\r
      const hitX = state.hit ? state.hit.x : 0;\r
      const hitZ = state.hit ? state.hit.z : 0;\r
\r
      pulseData.fill(0);\r
      pulses.forEach((p, i) => {\r
        pulseData.set([p.x, p.z, p.age * 4.2, Math.exp(-p.age * 1.1) * smoother(p.age / 0.08)], i * 4);\r
      });\r
\r
      gl.bindVertexArray(vao);\r
      if (fieldProgram) {\r
        const width = layout.columns + 7;\r
        const height2 = layout.rows + 7;\r
        reserveField(width, height2);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, field.framebuffer);\r
        gl.viewport(0, 0, width, height2);\r
        gl.useProgram(fieldProgram.program);\r
        const f = fieldProgram.uniforms;\r
        bind(0, sculpt ? sculpt[sculptIndex].texture : blank);\r
        gl.uniform1i(f.uSculpt, 0);\r
        gl.uniform1f(f.uSculptOn, sculpt ? 1 : 0);\r
        gl.uniform1f(f.uFrequency, FREQUENCY / state.scale);\r
        gl.uniform2f(f.uMorph, state.morph * 0.37, state.morph * 0.23);\r
        gl.uniform4fv(f.uPulses, pulseData);\r
        gl.uniform2i(f.uBase, layout.k0 - 2 + layout.camX, layout.m0 - 2 + layout.camZ);\r
        gl.uniform1f(f.uCell, layout.cell);\r
        gl.uniform1f(f.uDetail, s.detail);\r
        gl.disable(gl.DEPTH_TEST);\r
        gl.disable(gl.BLEND);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      }\r
\r
      const drawTerrain = (pixel, width, targetHeight, stride) => {\r
        gl.viewport(0, 0, width, targetHeight);\r
        gl.useProgram(terrain.program);\r
        const u = terrain.uniforms;\r
        bind(0, fieldProgram ? field.texture : blank);\r
        gl.uniform1i(u.uField, 0);\r
        bind(1, fieldProgram ? field.heights : blank);\r
        gl.uniform1i(u.uHeightField, 1);\r
        gl.uniform1f(u.uFrequency, FREQUENCY / state.scale);\r
        gl.uniform2f(u.uMorph, state.morph * 0.37, state.morph * 0.23);\r
        gl.uniform4fv(u.uPulses, pulseData);\r
        gl.uniform2i(u.uOrigin, layout.k0, layout.m0);\r
        gl.uniform2i(u.uCamCell, layout.camX, layout.camZ);\r
        gl.uniform2f(u.uCamFrac, layout.fracX, layout.fracZ);\r
        gl.uniform1f(u.uCell, layout.cell);\r
        gl.uniform1i(u.uStride, stride);\r
        gl.uniform1f(u.uHeight, height);\r
        gl.uniform3fv(u.uEye, cam.eye);\r
        gl.uniform3fv(u.uForward, cam.f);\r
        gl.uniform3fv(u.uNear, near);\r
        gl.uniform1f(u.uRefDepth, cam.distance);\r
        gl.uniformMatrix4fv(u.uViewProj, false, matrix);\r
        gl.uniform1f(u.uDetail, s.detail);\r
        gl.uniform1f(u.uLines, s.lineCount);\r
        gl.uniform1f(u.uLineWidth, s.lineWidth * pixel);\r
        gl.uniform1f(u.uMajor, s.majorLines ? 1 : 0);\r
        gl.uniform3fv(u.uColor, color);\r
        gl.uniform1f(u.uBrightness, s.brightness);\r
        gl.uniform2f(u.uFade, fadeStart, fadeEnd);\r
        gl.uniform3f(u.uFocus, state.focus, focusScale * pixel, view.height * 0.03 * pixel);\r
        gl.uniform4f(u.uHeat, hitX, hitZ, 0.9 * s.mouseRadius, heatStrength);\r
        gl.uniform4f(u.uLamp, hitX, state.hit ? state.hit.y + 1.4 : 0, hitZ, heatStrength);\r
        gl.uniform4f(u.uTrace, state.level, state.trace, hitX, hitZ);\r
        gl.uniform3fv(u.uSun, SUN);\r
        gl.uniform1f(u.uReveal, reveal);\r
        gl.uniform1f(u.uLightMode, s.lightMode ? 1 : 0);\r
        gl.uniform1f(u.uOpacity, s.opacity);\r
        gl.uniform4fv(u.uGlitch, glitchData);\r
        gl.uniform1f(u.uGlitchSeed, glitch.seed);\r
        gl.uniform1f(u.uPixel, pixel);\r
        gl.enable(gl.DEPTH_TEST);\r
        gl.depthFunc(gl.LESS);\r
        gl.disable(gl.BLEND);\r
        gl.clearColor(0, 0, 0, 0);\r
        gl.clearDepth(1);\r
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);\r
        gl.drawArraysInstanced(\r
          gl.TRIANGLE_STRIP,\r
          0,\r
          2 * (Math.ceil(layout.columns / stride) + 1),\r
          Math.ceil(layout.rows / stride)\r
        );\r
        if (dots) {\r
          gl.useProgram(markerProgram.program);\r
          const m = markerProgram.uniforms;\r
          bind(2, sculpt ? sculpt[sculptIndex].texture : blank);\r
          gl.uniform1i(m.uSculpt, 2);\r
          gl.uniform1f(m.uSculptOn, sculpt ? 1 : 0);\r
          gl.uniform1f(m.uFrequency, FREQUENCY / state.scale);\r
          gl.uniform2f(m.uMorph, state.morph * 0.37, state.morph * 0.23);\r
          gl.uniform4fv(m.uPulses, pulseData);\r
          gl.uniform3fv(m.uEye, cam.eye);\r
          gl.uniform3fv(m.uForward, cam.f);\r
          gl.uniform3fv(m.uNear, near);\r
          gl.uniform2i(m.uOrigin, dots.k0, dots.m0);\r
          gl.uniform2i(m.uCamCell, dots.camX, dots.camZ);\r
          gl.uniform2f(m.uCamFrac, dots.fracX, dots.fracZ);\r
          gl.uniform1f(m.uSpacing, dots.cell);\r
          gl.uniform1i(m.uColumns, dots.columns + 1);\r
          gl.uniform1f(m.uHeight, height);\r
          gl.uniformMatrix4fv(m.uViewProj, false, matrix);\r
          gl.uniform2f(m.uView, width, targetHeight);\r
          gl.uniform1f(m.uSize, 4 * pixel);\r
          gl.uniform1f(m.uRefDepth, cam.distance);\r
          gl.uniform4f(m.uHeat, hitX, hitZ, 1.2 * s.mouseRadius, heatStrength);\r
          gl.uniform1f(m.uTime, state.clock);\r
          gl.uniform4fv(m.uGlitch, glitchData);\r
          gl.uniform1f(m.uPixel, pixel);\r
          gl.uniform3fv(m.uColor, color);\r
          gl.uniform2f(m.uFade, fadeStart, fadeEnd);\r
          gl.uniform1f(m.uReveal, reveal);\r
          gl.uniform1f(m.uBrightness, s.brightness);\r
          gl.uniform1f(m.uLightMode, s.lightMode ? 1 : 0);\r
          gl.uniform1f(m.uOpacity, s.opacity);\r
          gl.uniform1f(m.uStyle, s.markers);\r
          gl.depthFunc(gl.LEQUAL);\r
          gl.depthMask(false);\r
          gl.enable(gl.BLEND);\r
          gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
          gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, (dots.columns + 1) * (dots.rows + 1));\r
          gl.disable(gl.BLEND);\r
          gl.depthMask(true);\r
        }\r
        gl.disable(gl.DEPTH_TEST);\r
      };\r
\r
      const bloom = s.glow > 0.001;\r
      if (bloom) {\r
        const width = Math.max(1, Math.round(view.width / 2));\r
        const targetHeight = Math.max(1, Math.round(view.height / 2));\r
        allocate(source, width, targetHeight, true);\r
        levels.forEach((pair, index) => {\r
          const w = Math.max(1, Math.round(view.width / 2 ** (index + 2)));\r
          const h = Math.max(1, Math.round(view.height / 2 ** (index + 2)));\r
          allocate(pair[0], w, h, false);\r
          allocate(pair[1], w, h, false);\r
        });\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, source.framebuffer);\r
        drawTerrain(0.5, width, targetHeight, 2);\r
        let from = source;\r
        levels.forEach(([front, back]) => {\r
          gl.bindFramebuffer(gl.FRAMEBUFFER, front.framebuffer);\r
          gl.viewport(0, 0, front.width, front.height);\r
          gl.useProgram(downProgram.program);\r
          bind(0, from.texture);\r
          gl.uniform1i(downProgram.uniforms.uSource, 0);\r
          gl.uniform2f(downProgram.uniforms.uTarget, front.width, front.height);\r
          gl.uniform2f(downProgram.uniforms.uTexel, 1 / from.width, 1 / from.height);\r
          gl.drawArrays(gl.TRIANGLES, 0, 3);\r
          gl.useProgram(blurProgram.program);\r
          gl.uniform1i(blurProgram.uniforms.uSource, 0);\r
          gl.uniform2f(blurProgram.uniforms.uTarget, back.width, back.height);\r
          gl.bindFramebuffer(gl.FRAMEBUFFER, back.framebuffer);\r
          bind(0, front.texture);\r
          gl.uniform2f(blurProgram.uniforms.uStep, 1 / front.width, 0);\r
          gl.drawArrays(gl.TRIANGLES, 0, 3);\r
          gl.bindFramebuffer(gl.FRAMEBUFFER, front.framebuffer);\r
          bind(0, back.texture);\r
          gl.uniform2f(blurProgram.uniforms.uStep, 0, 1 / back.height);\r
          gl.drawArrays(gl.TRIANGLES, 0, 3);\r
          from = front;\r
        });\r
      }\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      drawTerrain(view.ratio, canvas.width, canvas.height, 1);\r
\r
      if (bloom) {\r
        gl.viewport(0, 0, canvas.width, canvas.height);\r
        gl.useProgram(compositeProgram.program);\r
        const c = compositeProgram.uniforms;\r
        levels.forEach(([front], index) => {\r
          bind(index, front.texture);\r
          gl.uniform1i(c[\`uBloom\${index}\`], index);\r
        });\r
        gl.uniform2f(c.uView, canvas.width, canvas.height);\r
        gl.uniform1f(c.uGlow, s.glow * reveal);\r
        gl.uniform1f(c.uLightMode, s.lightMode ? 1 : 0);\r
        gl.enable(gl.BLEND);\r
        if (s.lightMode) gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
        else gl.blendFunc(gl.ONE, gl.ONE);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
        gl.disable(gl.BLEND);\r
      }\r
      for (let unit = BLOOM_LEVELS; unit >= 0; unit--) bind(unit, null);\r
    };\r
\r
    const updateSculpt = (s, dt) => {\r
      if (!sculpt || !sculptProgram) return false;\r
      const brush = s.mouseInteraction && s.hoverEffect === 'lift' && state.presence > 0.001 ? state.hit : null;\r
      const burst = state.burst;\r
      if (!brush && !burst && state.sculptLife <= 0) return false;\r
      const from = state.brushFrom || brush;\r
      const read = sculpt[sculptIndex];\r
      const write = sculpt[1 - sculptIndex];\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, write.framebuffer);\r
      gl.viewport(0, 0, SCULPT_SIZE, SCULPT_SIZE);\r
      gl.useProgram(sculptProgram.program);\r
      const u = sculptProgram.uniforms;\r
      bind(0, read.texture);\r
      gl.uniform1i(u.uPrevious, 0);\r
      if (brush && from) gl.uniform4f(u.uSegment, from.x, from.z, brush.x, brush.z);\r
      else gl.uniform4f(u.uSegment, 0, 0, 0, 0);\r
      gl.uniform4f(\r
        u.uBrush,\r
        1.1 * s.mouseRadius,\r
        0.9 * s.mouseStrength,\r
        1 - Math.exp(-dt * 7),\r
        brush ? state.presence : 0\r
      );\r
      if (burst) {\r
        const before = smoother(burst.age / 0.7);\r
        burst.age += dt;\r
        const amount = (smoother(burst.age / 0.7) - before) * 0.9 * Math.max(s.mouseStrength, 0.3);\r
        gl.uniform4f(u.uBurst, burst.x, burst.z, 1.6 * s.mouseRadius, amount);\r
        if (burst.age >= 0.7) state.burst = null;\r
      } else {\r
        gl.uniform4f(u.uBurst, 0, 0, 1, 0);\r
      }\r
      const tau = 0.25 + 3 * s.trail * s.trail;\r
      gl.uniform2f(u.uDecay, Math.exp(-dt / tau), Math.exp(-dt / 0.7));\r
      gl.disable(gl.BLEND);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      sculptIndex = 1 - sculptIndex;\r
      state.brushFrom = brush ? { x: brush.x, z: brush.z } : null;\r
      if (brush || burst) state.sculptLife = tau * 6;\r
      else state.sculptLife -= dt;\r
      return true;\r
    };\r
\r
    let sizedDpr = settingsRef.current.dpr;\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      sizedDpr = s.dpr;\r
      view.width = Math.max(1, container.clientWidth);\r
      view.height = Math.max(1, container.clientHeight);\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(view.width * view.ratio));\r
      canvas.height = Math.max(1, Math.round(view.height * view.ratio));\r
      render();\r
      wake();\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      if (s.dpr !== sizedDpr) resize();\r
      const dt = last ? clamp((now - last) / 1000, 0, 1 / 20) : 1 / 60;\r
      last = now;\r
\r
      if (!s.intro || reduce) state.intro = 1;\r
      else if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / INTRO_SECONDS);\r
      state.rise = smoother(state.intro);\r
      const ease = reduce ? 1 : 1 - Math.exp(-dt / 0.4);\r
      state.tilt += (s.tilt - state.tilt) * ease;\r
      state.elevation += (s.elevation - state.elevation) * ease;\r
      state.scale = s.scale;\r
\r
      state.clock += dt;\r
      const glitching = reduce ? 0 : s.glitch;\r
      if (glitching > 0) {\r
        if (state.clock >= glitch.next && state.clock >= glitch.until) {\r
          glitch.until = state.clock + 0.1 + random() * 0.22 * (0.5 + glitching);\r
          glitch.next = glitch.until + (9 - 7.4 * glitching) * (0.45 + random() * 1.1);\r
          glitch.roll = 0;\r
        }\r
        if (state.clock < glitch.until) {\r
          if (state.clock >= glitch.roll) {\r
            glitchData.fill(0);\r
            const count = 1 + Math.floor(random() * 3);\r
            for (let i = 0; i < count; i++) {\r
              const band = 3 + random() * random() * view.height * 0.14;\r
              const y = random() * view.height;\r
              const shift = (random() - 0.5) * 2 * (10 + 46 * glitching);\r
              glitchData.set([y, y + band, shift, 1 + random() * 3 * glitching], i * 4);\r
            }\r
            glitch.seed = random();\r
            glitch.roll = state.clock + 0.04 + random() * 0.05;\r
          }\r
        } else glitchData.fill(0);\r
      } else glitchData.fill(0);\r
\r
      if (!reduce) {\r
        state.travelX += s.direction[0] * s.speed * 0.8 * dt;\r
        state.travelZ += s.direction[1] * s.speed * 0.8 * dt;\r
        state.morph += s.morph * 0.12 * dt;\r
      }\r
\r
      const engaged = pointer.inside && s.mouseInteraction;\r
      state.presence += ((engaged ? 1 : 0) - state.presence) * (1 - Math.exp(-dt / (engaged ? 0.18 : 0.45)));\r
\r
      const nx = (pointer.x / view.width) * 2 - 1;\r
      const ny = 1 - (pointer.y / view.height) * 2;\r
      const lean = reduce || !engaged ? 0 : s.parallax;\r
      const targetYaw = nx * lean * 0.09;\r
      const targetPitch = -ny * lean * 0.045;\r
      state.yawVelocity += (38 * (targetYaw - state.yaw) - 11 * state.yawVelocity) * dt;\r
      state.pitchVelocity += (38 * (targetPitch - state.pitch) - 11 * state.pitchVelocity) * dt;\r
      state.yaw += state.yawVelocity * dt;\r
      state.pitch += state.pitchVelocity * dt;\r
\r
      const cam = camera();\r
      if (engaged) {\r
        state.hit = pick(cam, s, nx, ny);\r
        if (state.hit && state.brushFrom) {\r
          const jump = Math.hypot(state.hit.x - state.brushFrom.x, state.hit.z - state.brushFrom.z);\r
          if (jump > 3 * s.mouseRadius) state.brushFrom = null;\r
        }\r
      } else if (state.presence < 0.002) {\r
        state.hit = null;\r
        state.brushFrom = null;\r
      }\r
\r
      const tracing = state.hit && s.mouseInteraction && s.hoverEffect === 'trace' ? state.presence : 0;\r
      if (state.hit) {\r
        const frequency = FREQUENCY / state.scale;\r
        const target =\r
          relief(state.hit.x, state.hit.z, frequency, state.morph * 0.37, state.morph * 0.23) +\r
          s.detail * 0.1 * fineDetail(state.hit.x, state.hit.z, frequency);\r
        state.level = state.trace < 0.01 ? target : state.level + (target - state.level) * (1 - Math.exp(-dt / 0.09));\r
      }\r
      state.trace += (tracing - state.trace) * (1 - Math.exp(-dt / 0.2));\r
\r
      const focusTarget = state.hit && s.depthOfField > 0 ? state.hit.depth : cam.distance;\r
      state.focus += (focusTarget - state.focus) * (1 - Math.exp(-dt / 0.35));\r
\r
      for (let i = pulses.length - 1; i >= 0; i--) {\r
        pulses[i].age += dt;\r
        if (pulses[i].age > 4) pulses.splice(i, 1);\r
      }\r
\r
      const sculpting = updateSculpt(s, dt);\r
      render();\r
\r
      const settling =\r
        Math.abs(s.tilt - state.tilt) > 0.01 ||\r
        Math.abs(s.elevation - state.elevation) > 1e-4 ||\r
        Math.abs(state.yaw - targetYaw) > 1e-4 ||\r
        Math.abs(state.pitch - targetPitch) > 1e-4 ||\r
        Math.abs(state.yawVelocity) > 1e-4 ||\r
        Math.abs(state.pitchVelocity) > 1e-4 ||\r
        Math.abs(focusTarget - state.focus) > 1e-3 ||\r
        Math.abs(tracing - state.trace) > 1e-3;\r
      const busy =\r
        (!reduce && (s.speed !== 0 || s.morph !== 0 || s.glitch > 0 || s.markers >= 0)) ||\r
        state.intro < 1 ||\r
        pulses.length > 0 ||\r
        sculpting ||\r
        settling ||\r
        (state.presence > 0.001 && state.presence < 0.999);\r
      quiet = busy ? 0 : quiet + dt;\r
      if (quiet < 0.5) raf = requestAnimationFrame(frame);\r
    };\r
\r
    function wake() {\r
      quiet = 0;\r
      if (!raf && visible && !document.hidden) {\r
        last = 0;\r
        raf = requestAnimationFrame(frame);\r
      }\r
    }\r
\r
    const locate = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };\r
    };\r
\r
    const onPointerMove = event => {\r
      const { x, y, inside } = locate(event);\r
      const was = pointer.inside;\r
      pointer.inside = inside;\r
      if (inside) {\r
        pointer.x = x;\r
        pointer.y = y;\r
      }\r
      if (inside || was) wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      const { x, y, inside } = locate(event);\r
      if (!inside) return;\r
      pointer.x = x;\r
      pointer.y = y;\r
      pointer.inside = true;\r
      wake();\r
      if (s.glitch > 0 && !reduce) {\r
        glitch.until = state.clock + 0.16;\r
        glitch.roll = 0;\r
      }\r
      if (!s.mouseInteraction || (s.clickEffect !== 'pulse' && s.clickEffect !== 'peak')) return;\r
      const hit = pick(camera(), s, (x / view.width) * 2 - 1, 1 - (y / view.height) * 2);\r
      if (!hit) return;\r
      if (s.clickEffect === 'peak' && sculpt) {\r
        state.burst = { x: hit.x, z: hit.z, age: 0 };\r
      } else if (s.clickEffect === 'pulse') {\r
        if (pulses.length >= MAX_PULSES) pulses.shift();\r
        pulses.push({ x: hit.x, z: hit.z, age: 0 });\r
      }\r
    };\r
\r
    const onPointerUp = event => {\r
      if (event.pointerType !== 'touch') return;\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
    const onVisibility = () => wake();\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(container);\r
    const intersection = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible) wake();\r
    });\r
    intersection.observe(container);\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    window.addEventListener('pointerup', onPointerUp, { passive: true });\r
    window.addEventListener('pointercancel', onPointerUp, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
    wakeRef.current = wake;\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('pointerup', onPointerUp);\r
      window.removeEventListener('pointercancel', onPointerUp);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      canvas.removeEventListener('webglcontextlost', onContextLost);\r
      canvas.removeEventListener('webglcontextrestored', onContextRestored);\r
      [source, ...levels.flat()].forEach(target => {\r
        if (target.texture) gl.deleteTexture(target.texture);\r
        if (target.depth) gl.deleteRenderbuffer(target.depth);\r
        gl.deleteFramebuffer(target.framebuffer);\r
      });\r
      sculpt?.forEach(target => {\r
        gl.deleteTexture(target.texture);\r
        gl.deleteFramebuffer(target.framebuffer);\r
      });\r
      gl.deleteTexture(blank);\r
      gl.deleteVertexArray(vao);\r
      if (field.texture) gl.deleteTexture(field.texture);\r
      if (field.heights) gl.deleteTexture(field.heights);\r
      gl.deleteFramebuffer(field.framebuffer);\r
      [terrain, fieldProgram, sculptProgram, downProgram, blurProgram, compositeProgram, markerProgram].forEach(\r
        program => program && gl.deleteProgram(program.program)\r
      );\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
    };\r
  }, [generation]);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div ref={containerRef} className={\`topography-container \${className}\`.trim()} style={style}>\r
      <canvas ref={canvasRef} className="topography-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Topography;\r
`,n=`.topography-container {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.topography-canvas {\r
  display: block;\r
  width: 100%;\r
  height: 100%;\r
}\r
`,e=`'use client';\r
\r
import { useEffect, useRef, useState } from 'react';\r
\r
const FOV = 0.32;\r
const ORBIT = 9;\r
const NEAR = 0.05;\r
const FAR = 160;\r
const HEIGHT = 1.7;\r
const FREQUENCY = 0.45;\r
const INTRO_SECONDS = 2.8;\r
const MAX_PULSES = 4;\r
const BLOOM_LEVELS = 4;\r
const SCULPT_SIZE = 256;\r
const SCULPT_SPAN = 48;\r
const MAX_CELLS = 200000;\r
const SUN = [-0.81, 0.58, -0.02];\r
const DIRECTIONS = { forward: [0, 1], backward: [0, -1], left: [-1, 0], right: [1, 0] };\r
const HOVER_EFFECTS = ['lift', 'trace', 'light'];\r
const MARKER_STYLES = { plus: 0, dots: 1 };\r
const MARKER_SPACING = 1.25;\r
\r
const COMMON = \`\r
precision highp float;\r
precision highp int;\r
\r
uniform float uFrequency;\r
uniform vec2 uMorph;\r
uniform sampler2D uSculpt;\r
uniform float uSculptOn;\r
uniform vec4 uPulses[\${MAX_PULSES}];\r
uniform vec3 uEye;\r
uniform vec3 uForward;\r
uniform vec3 uNear;\r
\r
uint lattice(ivec2 p) {\r
  uvec2 q = uvec2(p + 1073741824);\r
  uint h = q.x * 2654435761u + q.y * 2246822519u;\r
  h = (h ^ (h >> 15u)) * 739982445u;\r
  h = (h ^ (h >> 12u)) * 695872825u;\r
  return h ^ (h >> 15u);\r
}\r
\r
float corner(ivec2 c, vec2 f) {\r
  uint h = lattice(c);\r
  vec2 g = vec2(float(h & 65535u), float(h >> 16u)) / 32767.5 - 1.0;\r
  return dot(g, f);\r
}\r
\r
float noise(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = p - i;\r
  ivec2 c = ivec2(i);\r
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);\r
  float a = corner(c, f);\r
  float b = corner(c + ivec2(1, 0), f - vec2(1.0, 0.0));\r
  float d = corner(c + ivec2(0, 1), f - vec2(0.0, 1.0));\r
  float e = corner(c + ivec2(1, 1), f - vec2(1.0, 1.0));\r
  return mix(mix(a, b, u.x), mix(d, e, u.x), u.y);\r
}\r
\r
vec2 octave(vec2 p, vec2 shift) {\r
  return vec2(1.6 * p.x - 1.2 * p.y, 1.2 * p.x + 1.6 * p.y) + shift;\r
}\r
\r
float relief(vec2 t) {\r
  vec2 p = t * uFrequency;\r
  vec2 w = vec2(noise(p * 0.42 + uMorph), noise(p * 0.42 - uMorph.yx + vec2(5.2, 1.3)));\r
  p += w * 0.8;\r
  float n = noise(p) * 0.55;\r
  p = octave(p, vec2(7.1, 3.7));\r
  n += noise(p) * 0.15;\r
  p = octave(p, vec2(1.9, 8.3));\r
  n += noise(p) * 0.04;\r
  float s = log(1.0 + exp(7.0 * (3.0 * n + 0.05))) / 7.0;\r
  return s * s * 1.4 + 0.1 * n;\r
}\r
\r
float swell(vec2 t) {\r
  float lift = 0.0;\r
  for (int i = 0; i < \${MAX_PULSES}; i++) {\r
    vec4 p = uPulses[i];\r
    if (p.w <= 0.0) continue;\r
    float x = (length(t - p.xy) - p.z) / (0.28 + p.z * 0.05);\r
    lift += exp(-x * x) * p.w;\r
  }\r
  return lift;\r
}\r
\r
vec4 sculpted(vec2 t) {\r
  return uSculptOn > 0.5 ? textureLod(uSculpt, t / \${SCULPT_SPAN}.0, 0.0) : vec4(0.0);\r
}\r
\r
float settle(vec2 world) {\r
  float depth = dot(vec3(world.x, 0.0, world.y) - uEye, uForward);\r
  float x = clamp((depth - uNear.x) / max(uNear.y - uNear.x, 1e-3), 0.0, 1.0);\r
  return mix(uNear.z, 1.0, x * x * x * (x * (x * 6.0 - 15.0) + 10.0));\r
}\r
\`;\r
\r
const FIELD = \`#version 300 es\r
\${COMMON}\r
uniform ivec2 uBase;\r
uniform float uCell;\r
uniform float uDetail;\r
layout(location = 0) out vec4 outField;\r
layout(location = 1) out vec4 outHeight;\r
\r
void main() {\r
  vec2 t = vec2(uBase + ivec2(gl_FragCoord.xy)) * uCell;\r
  vec4 carved = sculpted(t);\r
  float ring = swell(t);\r
  float ground = relief(t) + carved.r + ring * 0.14;\r
  vec2 dp = t * uFrequency * 5.0 + vec2(13.1, 4.7);\r
  float fine = noise(dp) * 0.6 + noise(octave(dp, vec2(2.3, 6.1))) * 0.3;\r
  outField = vec4(carved.g, ring, ground, carved.r);\r
  outHeight = vec4(ground + uDetail * 0.1 * fine, 0.0, 0.0, 1.0);\r
}\`;\r
\r
const terrainVertex = baked => \`#version 300 es\r
#define BAKED \${baked ? 1 : 0}\r
\${COMMON}\r
uniform sampler2D uField;\r
uniform ivec2 uOrigin;\r
uniform ivec2 uCamCell;\r
uniform vec2 uCamFrac;\r
uniform float uCell;\r
uniform int uStride;\r
uniform float uHeight;\r
uniform mat4 uViewProj;\r
out vec2 vTexel;\r
out vec2 vTerrain;\r
out float vDepth;\r
out float vLift;\r
out vec3 vNormal;\r
\r
float ground(vec2 t) {\r
  return relief(t) + swell(t) * 0.14;\r
}\r
\r
void main() {\r
  ivec2 step = ivec2(gl_VertexID >> 1, gl_InstanceID + (gl_VertexID & 1)) * uStride;\r
  ivec2 local = uOrigin + step;\r
  vec2 terrain = vec2(local + uCamCell) * uCell;\r
  vec2 world = vec2(local) * uCell - uCamFrac;\r
  float k = settle(world);\r
#if BAKED\r
  ivec2 texel = step + 2;\r
  vec4 c = texelFetch(uField, texel, 0);\r
  vec4 l = texelFetch(uField, texel - ivec2(1, 0), 0);\r
  vec4 r = texelFetch(uField, texel + ivec2(1, 0), 0);\r
  vec4 d = texelFetch(uField, texel - ivec2(0, 1), 0);\r
  vec4 u = texelFetch(uField, texel + ivec2(0, 1), 0);\r
  float h = (c.b - c.a) * k + c.a;\r
  float dx = (l.b - l.a - r.b + r.a) * k + l.a - r.a;\r
  float dz = (d.b - d.a - u.b + u.a) * k + d.a - u.a;\r
  vNormal = vec3(dx * uHeight / (2.0 * uCell), 1.0, dz * uHeight / (2.0 * uCell));\r
  vTexel = vec2(texel) + 0.5;\r
#else\r
  float h = ground(terrain) * k;\r
  float hx = ground(terrain + vec2(0.04, 0.0)) * k;\r
  float hz = ground(terrain + vec2(0.0, 0.04)) * k;\r
  vNormal = vec3((h - hx) * uHeight / 0.04, 1.0, (h - hz) * uHeight / 0.04);\r
  vTexel = vec2(0.0);\r
#endif\r
  vec4 clip = uViewProj * vec4(world.x, h * uHeight, world.y, 1.0);\r
  gl_Position = clip;\r
  vTerrain = terrain;\r
  vDepth = clip.w;\r
  vLift = h * uHeight;\r
}\`;\r
\r
const terrainFragment = baked => \`#version 300 es\r
#define BAKED \${baked ? 1 : 0}\r
\${COMMON}\r
uniform sampler2D uField;\r
uniform highp sampler2D uHeightField;\r
uniform float uDetail;\r
uniform float uLines;\r
uniform float uLineWidth;\r
uniform float uMajor;\r
uniform vec3 uColor;\r
uniform float uBrightness;\r
uniform vec2 uFade;\r
uniform vec3 uFocus;\r
uniform vec4 uHeat;\r
uniform vec4 uLamp;\r
uniform vec4 uTrace;\r
uniform vec3 uSun;\r
uniform float uRefDepth;\r
uniform float uReveal;\r
uniform float uLightMode;\r
uniform float uOpacity;\r
uniform vec4 uGlitch[3];\r
uniform float uGlitchSeed;\r
uniform float uPixel;\r
in vec2 vTexel;\r
in vec2 vTerrain;\r
in float vDepth;\r
in float vLift;\r
in vec3 vNormal;\r
out vec4 outColor;\r
\r
float smoother(float x) {\r
  x = clamp(x, 0.0, 1.0);\r
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);\r
}\r
\r
float stroke(float dist, float width, float soft, float density, float crowd) {\r
  float cover = max(0.0, min(min(width, soft), 0.5 * (width + soft) - dist)) / soft;\r
  return mix(cover, min(width * density, 1.0) * 0.6, crowd);\r
}\r
\r
float sampleHeight(vec2 coord, out vec2 slope) {\r
  vec2 u = coord - 0.5;\r
  vec2 i = floor(u + 0.5);\r
  vec2 f = u - i;\r
  vec3 wx = vec3(0.5 * (0.5 - f.x) * (0.5 - f.x), 0.75 - f.x * f.x, 0.5 * (0.5 + f.x) * (0.5 + f.x));\r
  vec3 wy = vec3(0.5 * (0.5 - f.y) * (0.5 - f.y), 0.75 - f.y * f.y, 0.5 * (0.5 + f.y) * (0.5 + f.y));\r
  vec3 dx = vec3(f.x - 0.5, -2.0 * f.x, 0.5 + f.x);\r
  vec3 dy = vec3(f.y - 0.5, -2.0 * f.y, 0.5 + f.y);\r
  ivec2 base = ivec2(i) - 1;\r
  float total = 0.0;\r
  slope = vec2(0.0);\r
  for (int y = 0; y < 3; y++) {\r
    float a = texelFetch(uHeightField, base + ivec2(0, y), 0).r;\r
    float b = texelFetch(uHeightField, base + ivec2(1, y), 0).r;\r
    float c = texelFetch(uHeightField, base + ivec2(2, y), 0).r;\r
    float row = a * wx.x + b * wx.y + c * wx.z;\r
    total += row * wy[y];\r
    slope += vec2((a * dx.x + b * dx.y + c * dx.z) * wy[y], row * dy[y]);\r
  }\r
  return total;\r
}\r
\r
void main() {\r
  float py = gl_FragCoord.y / uPixel;\r
  float shift = 0.0;\r
  float split = 0.0;\r
  for (int i = 0; i < 3; i++) {\r
    if (py >= uGlitch[i].x && py < uGlitch[i].y) {\r
      shift = uGlitch[i].z * uPixel;\r
      split = uGlitch[i].w * uPixel;\r
    }\r
  }\r
  vec2 spot = vTerrain - dFdx(vTerrain) * shift;\r
#if BAKED\r
  vec2 ex = dFdx(vTexel);\r
  vec2 ey = dFdy(vTexel);\r
  vec2 coord = vTexel - ex * shift;\r
  vec2 slope;\r
  float h = sampleHeight(coord, slope);\r
  vec4 field = texture(uField, coord / vec2(textureSize(uField, 0)));\r
  float trail = field.r;\r
  float ring = field.g;\r
  float gx = dot(slope, ex) * uLines;\r
  float gy = dot(slope, ey) * uLines;\r
#else\r
  vec2 dp = spot * uFrequency * 5.0 + vec2(13.1, 4.7);\r
  float ring = swell(spot);\r
  float h = relief(spot) + ring * 0.14 + uDetail * 0.1 * (noise(dp) * 0.6 + noise(octave(dp, vec2(2.3, 6.1))) * 0.3);\r
  float trail = 0.0;\r
  float gx = dFdx(h) * uLines;\r
  float gy = dFdy(h) * uLines;\r
#endif\r
\r
  float lc = h * uLines + 0.5;\r
  float density = max(sqrt(gx * gx + gy * gy), 1e-5);\r
  float dist = abs(fract(lc + 0.5) - 0.5) / density;\r
  float major = uMajor * (1.0 - step(0.5, mod(floor(lc + 0.5), 5.0)));\r
\r
  vec2 hd = spot - uHeat.xy;\r
  float heat = exp(-dot(hd, hd) / (uHeat.z * uHeat.z)) * uHeat.w + trail * 0.6;\r
  float energy = heat + ring;\r
\r
  float depth = max(vDepth, 0.01);\r
  float persp = clamp(sqrt(uRefDepth / depth), 0.6, 1.6);\r
  float width = uLineWidth * persp * (1.0 + 0.6 * major) * (1.0 + 0.45 * min(energy, 1.5));\r
  float soft = 1.0 + min(uFocus.y * abs(1.0 - uFocus.x / depth), uFocus.z);\r
  float crowd = smoothstep(0.3, 0.75, density * max(width, soft));\r
  float cover = stroke(dist, width, soft, density, crowd);\r
  vec3 cover3 = vec3(cover);\r
  if (split > 0.0) {\r
    float offset = split * density;\r
    cover3.r = stroke(abs(fract(lc + offset + 0.5) - 0.5) / density, width, soft, density, crowd);\r
    cover3.b = stroke(abs(fract(lc - offset + 0.5) - 0.5) / density, width, soft, density, crowd);\r
    vec2 block = floor(vec2(gl_FragCoord.x / (uPixel * 26.0), py / 5.0)) + uGlitchSeed * 71.0;\r
    float drop = fract(sin(dot(block, vec2(12.9898, 78.233))) * 43758.5453);\r
    cover3 *= drop > 0.82 ? 0.1 : 1.2;\r
  }\r
\r
  vec3 normal = normalize(vNormal);\r
  float sun = clamp(dot(normal, uSun), 0.0, 1.0);\r
  vec3 toLamp = uLamp.xyz - vec3(vTerrain.x, vLift, vTerrain.y);\r
  float lampDistance = length(toLamp);\r
  float lamp = clamp(dot(normal, toLamp / max(lampDistance, 1e-3)), 0.0, 1.0) * uLamp.w / (1.0 + lampDistance * lampDistance * 0.9);\r
  float level = mix(0.45, 1.05, smoothstep(0.0, 1.1, h)) * mix(0.35, 1.25, sun * sun) * (1.0 + 0.6 * major);\r
  level += heat * 1.4 + ring * 3.0 + lamp * 1.2;\r
\r
  float fade = 1.0 - smoother((depth - uFade.x) / max(uFade.y - uFade.x, 1e-3));\r
  vec3 light = cover3 * level;\r
\r
  if (uTrace.y > 0.0) {\r
    float traceWidth = uLineWidth * persp * 1.8;\r
    float trace = stroke(abs(h - uTrace.x) * uLines / density, traceWidth, soft, density, crowd);\r
    vec2 td = spot - uTrace.zw;\r
    light += trace * uTrace.y * mix(0.35, 1.0, exp(-dot(td, td) / 20.0)) * 2.6;\r
  }\r
  light *= fade * uBrightness * uReveal;\r
\r
  if (uLightMode > 0.5) {\r
    float ink = (1.0 - exp(-max(max(light.r, light.g), light.b) * 1.8)) * 0.92 * uOpacity;\r
    outColor = vec4(uColor * ink, ink);\r
    return;\r
  }\r
\r
  vec3 color = 1.0 - exp(-uColor * light * 1.8);\r
  float top = max(max(color.r, color.g), color.b);\r
  float dither = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;\r
  color = max(color + dither / 255.0 * step(0.002, top), 0.0);\r
  outColor = vec4(color, max(max(color.r, color.g), color.b)) * uOpacity;\r
}\`;\r
\r
const MARKER_VERTEX = \`#version 300 es\r
\${COMMON}\r
uniform ivec2 uOrigin;\r
uniform ivec2 uCamCell;\r
uniform vec2 uCamFrac;\r
uniform float uSpacing;\r
uniform int uColumns;\r
uniform float uHeight;\r
uniform mat4 uViewProj;\r
uniform vec2 uView;\r
uniform float uSize;\r
uniform float uRefDepth;\r
uniform vec4 uHeat;\r
uniform float uTime;\r
uniform vec4 uGlitch[3];\r
uniform float uPixel;\r
out vec2 vCorner;\r
out float vSize;\r
out float vGlow;\r
out float vFrame;\r
out float vDepth;\r
\r
void main() {\r
  ivec2 local = uOrigin + ivec2(gl_InstanceID % uColumns, gl_InstanceID / uColumns);\r
  ivec2 id = local + uCamCell;\r
  vec2 terrain = vec2(id) * uSpacing;\r
  vec2 world = vec2(local) * uSpacing - uCamFrac;\r
  float ring = swell(terrain);\r
  float h = (relief(terrain) + ring * 0.14) * settle(world) + sculpted(terrain).r;\r
  vec4 clip = uViewProj * vec4(world.x, h * uHeight + 0.05, world.y, 1.0);\r
  uint seed = lattice(id + ivec2(911, 377));\r
  float a = float(seed & 1023u) / 1023.0;\r
  float b = float((seed >> 10u) & 1023u) / 1023.0;\r
  vec2 hd = terrain - uHeat.xy;\r
  float heat = exp(-dot(hd, hd) / (uHeat.z * uHeat.z)) * uHeat.w;\r
  float blink = step(0.92, a) * (0.5 + 0.5 * sin(uTime * (1.4 + b * 2.2) + b * 40.0));\r
  float size = uSize * clamp(sqrt(uRefDepth / max(clip.w, 0.01)), 0.6, 1.3) * (1.0 + 0.4 * heat + 0.35 * blink);\r
  float frame = max(smoothstep(0.55, 0.95, blink), smoothstep(0.3, 0.8, heat));\r
  vec2 corner = vec2(float(gl_VertexID & 1), float(gl_VertexID >> 1)) * 2.0 - 1.0;\r
  vec2 offset = corner * (size * (frame > 0.001 ? 2.6 : 1.0) + 1.5);\r
  float py = (clip.y / clip.w * 0.5 + 0.5) * uView.y / uPixel;\r
  float shift = 0.0;\r
  for (int i = 0; i < 3; i++) {\r
    if (py >= uGlitch[i].x && py < uGlitch[i].y) shift = uGlitch[i].z;\r
  }\r
  clip.xy += (offset + vec2(shift * uPixel, 0.0)) / uView * 2.0 * clip.w;\r
  gl_Position = clip;\r
  vCorner = offset;\r
  vSize = size;\r
  vFrame = frame;\r
  vGlow = 0.5 + 0.4 * b + blink * 0.9 + heat * 1.8 + ring * 3.0;\r
  vDepth = clip.w;\r
}\`;\r
\r
const MARKER_FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform vec3 uColor;\r
uniform vec2 uFade;\r
uniform float uReveal;\r
uniform float uBrightness;\r
uniform float uLightMode;\r
uniform float uOpacity;\r
uniform float uStyle;\r
uniform float uPixel;\r
in vec2 vCorner;\r
in float vSize;\r
in float vGlow;\r
in float vFrame;\r
in float vDepth;\r
out vec4 outColor;\r
\r
float smoother(float x) {\r
  x = clamp(x, 0.0, 1.0);\r
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  vec2 a = abs(vCorner);\r
  float cover;\r
  if (uStyle < 0.5) {\r
    float thick = max(0.6 * uPixel, 0.5);\r
    float across = clamp(vSize - a.x + 0.5, 0.0, 1.0) * clamp(thick - a.y + 0.5, 0.0, 1.0);\r
    float down = clamp(vSize - a.y + 0.5, 0.0, 1.0) * clamp(thick - a.x + 0.5, 0.0, 1.0);\r
    cover = max(across, down);\r
  } else {\r
    cover = clamp(vSize * 0.42 - length(vCorner) + 0.5, 0.0, 1.0);\r
  }\r
  if (vFrame > 0.001) {\r
    float edge = vSize * 2.3;\r
    float reach = edge * 0.45;\r
    float line = max(0.5 * uPixel, 0.5);\r
    float sides = clamp(line - abs(a.x - edge) + 0.5, 0.0, 1.0) * clamp(a.y - edge + reach + 0.5, 0.0, 1.0) * clamp(edge + line - a.y + 0.5, 0.0, 1.0);\r
    float caps = clamp(line - abs(a.y - edge) + 0.5, 0.0, 1.0) * clamp(a.x - edge + reach + 0.5, 0.0, 1.0) * clamp(edge + line - a.x + 0.5, 0.0, 1.0);\r
    cover = max(cover, max(sides, caps) * vFrame * 0.8);\r
  }\r
  float fade = 1.0 - smoother((vDepth - uFade.x) / max(uFade.y - uFade.x, 1e-3));\r
  float light = cover * vGlow * fade * fade * uReveal * uBrightness;\r
  if (uLightMode > 0.5) {\r
    float ink = (1.0 - exp(-light * 1.8)) * 0.92 * uOpacity;\r
    outColor = vec4(uColor * ink, ink);\r
    return;\r
  }\r
  vec3 color = 1.0 - exp(-uColor * light * 1.8);\r
  outColor = vec4(color, max(max(color.r, color.g), color.b)) * uOpacity;\r
}\`;\r
\r
const FULLSCREEN = \`#version 300 es\r
void main() {\r
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\r
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const SCULPT = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uPrevious;\r
uniform vec4 uSegment;\r
uniform vec4 uBrush;\r
uniform vec4 uBurst;\r
uniform vec2 uDecay;\r
out vec4 outColor;\r
\r
vec2 wrapped(vec2 d) {\r
  return d - \${SCULPT_SPAN}.0 * floor(d / \${SCULPT_SPAN}.0 + 0.5);\r
}\r
\r
void main() {\r
  vec4 previous = texelFetch(uPrevious, ivec2(gl_FragCoord.xy), 0);\r
  vec2 t = gl_FragCoord.xy / \${SCULPT_SIZE}.0 * \${SCULPT_SPAN}.0;\r
  vec2 a = wrapped(t - uSegment.xy);\r
  vec2 ab = uSegment.zw - uSegment.xy;\r
  float k = clamp(dot(a, ab) / max(dot(ab, ab), 1e-6), 0.0, 1.0);\r
  vec2 d = a - ab * k;\r
  float g = exp(-dot(d, d) / (uBrush.x * uBrush.x)) * uBrush.w;\r
  float height = previous.r * uDecay.x;\r
  height += (uBrush.y - height) * g * uBrush.z;\r
  float heat = previous.g * uDecay.y;\r
  heat += (1.0 - heat) * g * uBrush.z;\r
  vec2 b = wrapped(t - uBurst.xy);\r
  height += uBurst.w * exp(-dot(b, b) / (uBurst.z * uBurst.z));\r
  outColor = vec4(height, heat, 0.0, 1.0);\r
}\`;\r
\r
const DOWNSAMPLE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uSource;\r
uniform vec2 uTarget;\r
uniform vec2 uTexel;\r
out vec4 outColor;\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uTarget;\r
  vec4 color = texture(uSource, uv - uTexel);\r
  color += texture(uSource, uv + uTexel);\r
  color += texture(uSource, uv + vec2(uTexel.x, -uTexel.y));\r
  color += texture(uSource, uv + vec2(-uTexel.x, uTexel.y));\r
  outColor = min(color * 0.25, vec4(1.0));\r
}\`;\r
\r
const BLUR = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uSource;\r
uniform vec2 uTarget;\r
uniform vec2 uStep;\r
out vec4 outColor;\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uTarget;\r
  vec4 color = texture(uSource, uv) * 0.181862;\r
  color += (texture(uSource, uv + uStep * 1.423135) + texture(uSource, uv - uStep * 1.423135)) * 0.284316;\r
  color += (texture(uSource, uv + uStep * 3.326702) + texture(uSource, uv - uStep * 3.326702)) * 0.106598;\r
  color += (texture(uSource, uv + uStep * 5.242989) + texture(uSource, uv - uStep * 5.242989)) * 0.018156;\r
  outColor = color;\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uBloom0;\r
uniform sampler2D uBloom1;\r
uniform sampler2D uBloom2;\r
uniform sampler2D uBloom3;\r
uniform vec2 uView;\r
uniform float uGlow;\r
uniform float uLightMode;\r
out vec4 outColor;\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uView;\r
  vec4 halo = texture(uBloom0, uv) * 0.4;\r
  halo += texture(uBloom1, uv) * 0.3;\r
  halo += texture(uBloom2, uv) * 0.2;\r
  halo += texture(uBloom3, uv) * 0.1;\r
  if (uLightMode > 0.5) {\r
    outColor = halo * uGlow * 0.35;\r
    return;\r
  }\r
  vec3 color = halo.rgb * uGlow * 1.6;\r
  color = color / (1.0 + color);\r
  outColor = vec4(color, max(max(color.r, color.g), color.b));\r
}\`;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const smoother = x => {\r
  const t = clamp(x, 0, 1);\r
  return t * t * t * (t * (t * 6 - 15) + 10);\r
};\r
\r
const lattice = (x, y) => {\r
  let h = (Math.imul(x + 1073741824, 2654435761) + Math.imul(y + 1073741824, 2246822519)) >>> 0;\r
  h = Math.imul(h ^ (h >>> 15), 739982445) >>> 0;\r
  h = Math.imul(h ^ (h >>> 12), 695872825) >>> 0;\r
  return (h ^ (h >>> 15)) >>> 0;\r
};\r
\r
const corner = (cx, cy, fx, fy) => {\r
  const h = lattice(cx, cy);\r
  return ((h & 65535) / 32767.5 - 1) * fx + ((h >>> 16) / 32767.5 - 1) * fy;\r
};\r
\r
const noise = (x, y) => {\r
  const ix = Math.floor(x);\r
  const iy = Math.floor(y);\r
  const fx = x - ix;\r
  const fy = y - iy;\r
  const ux = fx * fx * fx * (fx * (fx * 6 - 15) + 10);\r
  const uy = fy * fy * fy * (fy * (fy * 6 - 15) + 10);\r
  const a = corner(ix, iy, fx, fy);\r
  const b = corner(ix + 1, iy, fx - 1, fy);\r
  const d = corner(ix, iy + 1, fx, fy - 1);\r
  const e = corner(ix + 1, iy + 1, fx - 1, fy - 1);\r
  const top = a + (b - a) * ux;\r
  return top + (d + (e - d) * ux - top) * uy;\r
};\r
\r
const relief = (tx, tz, frequency, morphX, morphZ) => {\r
  let px = tx * frequency;\r
  let pz = tz * frequency;\r
  const wx = noise(px * 0.42 + morphX, pz * 0.42 + morphZ);\r
  const wz = noise(px * 0.42 - morphZ + 5.2, pz * 0.42 - morphX + 1.3);\r
  px += wx * 0.8;\r
  pz += wz * 0.8;\r
  let n = noise(px, pz) * 0.55;\r
  const qx = 1.6 * px - 1.2 * pz + 7.1;\r
  const qz = 1.2 * px + 1.6 * pz + 3.7;\r
  n += noise(qx, qz) * 0.15;\r
  n += noise(1.6 * qx - 1.2 * qz + 1.9, 1.2 * qx + 1.6 * qz + 8.3) * 0.04;\r
  const s = Math.log(1 + Math.exp(7 * (3 * n + 0.05))) / 7;\r
  return s * s * 1.4 + 0.1 * n;\r
};\r
\r
const fineDetail = (tx, tz, frequency) => {\r
  const px = tx * frequency * 5 + 13.1;\r
  const pz = tz * frequency * 5 + 4.7;\r
  return noise(px, pz) * 0.6 + noise(1.6 * px - 1.2 * pz + 2.3, 1.2 * px + 1.6 * pz + 6.1) * 0.3;\r
};\r
\r
const compile = (gl, type, source) => {\r
  const shader = gl.createShader(type);\r
  if (!shader) return null;\r
  gl.shaderSource(shader, source);\r
  gl.compileShader(shader);\r
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;\r
  gl.deleteShader(shader);\r
  return null;\r
};\r
\r
const link = (gl, vertexSource, fragmentSource) => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);\r
  const program = gl.createProgram();\r
  if (!vertex || !fragment || !program) return null;\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
  gl.linkProgram(program);\r
  gl.deleteShader(vertex);\r
  gl.deleteShader(fragment);\r
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {\r
    gl.deleteProgram(program);\r
    return null;\r
  }\r
  const uniforms = {};\r
  const total = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
  for (let i = 0; i < total; i++) {\r
    const info = gl.getActiveUniform(program, i);\r
    if (info) uniforms[info.name.replace(/\\[0\\]$/, '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const toRgb = hex => {\r
  let h = String(hex || '#ffffff')\r
    .replace('#', '')\r
    .trim();\r
  if (h.length === 3 || h.length === 4)\r
    h = h\r
      .slice(0, 3)\r
      .split('')\r
      .map(c => c + c)\r
      .join('');\r
  const num = parseInt(h.slice(0, 6), 16);\r
  if (Number.isNaN(num)) return [1, 1, 1];\r
  return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];\r
};\r
\r
const orient = (yaw, pitch) => {\r
  const cp = Math.cos(pitch);\r
  const f = [Math.sin(yaw) * cp, -Math.sin(pitch), Math.cos(yaw) * cp];\r
  const r = [Math.cos(yaw), 0, -Math.sin(yaw)];\r
  const u = [f[1] * r[2] - f[2] * r[1], f[2] * r[0] - f[0] * r[2], f[0] * r[1] - f[1] * r[0]];\r
  return { f, r, u };\r
};\r
\r
const lens = aspect => clamp(0.4877 / aspect, FOV, 0.6);\r
\r
const viewProjection = ({ eye, f, r, u }, aspect, out) => {\r
  const t = 1 / lens(aspect);\r
  const nf = 1 / (NEAR - FAR);\r
  const view = [\r
    r[0],\r
    u[0],\r
    -f[0],\r
    0,\r
    r[1],\r
    u[1],\r
    -f[1],\r
    0,\r
    r[2],\r
    u[2],\r
    -f[2],\r
    0,\r
    -(r[0] * eye[0] + r[1] * eye[1] + r[2] * eye[2]),\r
    -(u[0] * eye[0] + u[1] * eye[1] + u[2] * eye[2]),\r
    f[0] * eye[0] + f[1] * eye[1] + f[2] * eye[2],\r
    1\r
  ];\r
  const projection = [t / aspect, 0, 0, 0, 0, t, 0, 0, 0, 0, (FAR + NEAR) * nf, -1, 0, 0, 2 * FAR * NEAR * nf, 0];\r
  for (let c = 0; c < 4; c++) {\r
    for (let row = 0; row < 4; row++) {\r
      let sum = 0;\r
      for (let k = 0; k < 4; k++) sum += projection[k * 4 + row] * view[c * 4 + k];\r
      out[c * 4 + row] = sum;\r
    }\r
  }\r
  return out;\r
};\r
\r
const Topography = ({\r
  color = '#4f7cff',\r
  lineCount = 22,\r
  lineWidth = 1.2,\r
  majorLines = true,\r
  elevation = 1,\r
  foreground = 0.2,\r
  scale = 1,\r
  detail = 0.35,\r
  tilt = 32,\r
  speed = 0.25,\r
  direction = 'forward',\r
  morph = 0.2,\r
  glow = 0.6,\r
  depthOfField = 0.4,\r
  fog = 0.35,\r
  brightness = 1,\r
  opacity = 1,\r
  mouseInteraction = true,\r
  hoverEffect = 'lift',\r
  mouseRadius = 1,\r
  mouseStrength = 0.6,\r
  trail = 0.3,\r
  parallax = 0.5,\r
  clickEffect = 'pulse',\r
  markers = 'none',\r
  glitch = 0,\r
  intro = true,\r
  lightMode = false,\r
  dpr,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const [generation, setGeneration] = useState(0);\r
  const settings = {\r
    color,\r
    lineCount: clamp(lineCount, 2, 80),\r
    lineWidth: Math.max(0.2, lineWidth),\r
    majorLines,\r
    elevation: clamp(elevation, 0, 3),\r
    foreground: clamp(foreground, 0, 1),\r
    scale: clamp(scale, 0.2, 5),\r
    detail: clamp(detail, 0, 1),\r
    tilt: clamp(tilt, 12, 90),\r
    speed,\r
    direction: DIRECTIONS[direction] ?? DIRECTIONS.forward,\r
    morph: Math.max(0, morph),\r
    glow: Math.max(0, glow),\r
    depthOfField: clamp(depthOfField, 0, 1),\r
    fog: clamp(fog, 0, 1),\r
    brightness: Math.max(0, brightness),\r
    opacity: clamp(opacity, 0, 1),\r
    mouseInteraction,\r
    hoverEffect: HOVER_EFFECTS.includes(hoverEffect) ? hoverEffect : 'lift',\r
    mouseRadius: Math.max(0.1, mouseRadius),\r
    mouseStrength: Math.max(0, mouseStrength),\r
    trail: clamp(trail, 0, 1),\r
    parallax: clamp(parallax, 0, 1),\r
    clickEffect,\r
    markers: MARKER_STYLES[markers] ?? -1,\r
    glitch: clamp(glitch, 0, 1),\r
    intro,\r
    lightMode,\r
    dpr\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    const ratio = Math.min(settingsRef.current.dpr || window.devicePixelRatio || 1, 2);\r
    const gl = canvas?.getContext('webgl2', {\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: ratio < 1.5,\r
      depth: true,\r
      stencil: false,\r
      powerPreference: 'high-performance'\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const floatTargets = !!gl.getExtension('EXT_color_buffer_float');\r
    const terrain = link(gl, terrainVertex(floatTargets), terrainFragment(floatTargets));\r
    const fieldProgram = floatTargets ? link(gl, FULLSCREEN, FIELD) : null;\r
    const sculptProgram = floatTargets ? link(gl, FULLSCREEN, SCULPT) : null;\r
    const downProgram = link(gl, FULLSCREEN, DOWNSAMPLE);\r
    const blurProgram = link(gl, FULLSCREEN, BLUR);\r
    const compositeProgram = link(gl, FULLSCREEN, COMPOSITE);\r
    const markerProgram = link(gl, MARKER_VERTEX, MARKER_FRAGMENT);\r
    if (!terrain || !downProgram || !blurProgram || !compositeProgram || !markerProgram) return undefined;\r
\r
    const onContextLost = event => event.preventDefault();\r
    const onContextRestored = () => setGeneration(value => value + 1);\r
    canvas.addEventListener('webglcontextlost', onContextLost);\r
    canvas.addEventListener('webglcontextrestored', onContextRestored);\r
\r
    const vao = gl.createVertexArray();\r
    const format = floatTargets ? gl.RGBA16F : gl.RGBA8;\r
\r
    const createTexture = (width, height, internal, wrap) => {\r
      const texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texStorage2D(gl.TEXTURE_2D, 1, internal, width, height);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);\r
      return texture;\r
    };\r
\r
    const createTarget = () => ({\r
      texture: null,\r
      framebuffer: gl.createFramebuffer(),\r
      depth: null,\r
      width: 0,\r
      height: 0\r
    });\r
\r
    const allocate = (target, width, height, withDepth) => {\r
      if (target.texture && target.width === width && target.height === height) return;\r
      if (target.texture) gl.deleteTexture(target.texture);\r
      target.texture = createTexture(width, height, format, gl.CLAMP_TO_EDGE);\r
      target.width = width;\r
      target.height = height;\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target.texture, 0);\r
      if (withDepth) {\r
        if (!target.depth) target.depth = gl.createRenderbuffer();\r
        gl.bindRenderbuffer(gl.RENDERBUFFER, target.depth);\r
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, width, height);\r
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, target.depth);\r
      }\r
    };\r
\r
    const source = createTarget();\r
    const levels = Array.from({ length: BLOOM_LEVELS }, () => [createTarget(), createTarget()]);\r
    const sculpt = sculptProgram\r
      ? [0, 1].map(() => {\r
          const texture = createTexture(SCULPT_SIZE, SCULPT_SIZE, gl.RG16F, gl.REPEAT);\r
          const framebuffer = gl.createFramebuffer();\r
          gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
          gl.clearColor(0, 0, 0, 0);\r
          gl.clear(gl.COLOR_BUFFER_BIT);\r
          return { texture, framebuffer };\r
        })\r
      : null;\r
    const blank = createTexture(1, 1, gl.RGBA8, gl.REPEAT);\r
    const field = { texture: null, heights: null, framebuffer: gl.createFramebuffer(), width: 0, height: 0 };\r
    let sculptIndex = 0;\r
\r
    const reserveField = (width, height) => {\r
      if (field.texture && width <= field.width && height <= field.height) return;\r
      if (field.texture) gl.deleteTexture(field.texture);\r
      if (field.heights) gl.deleteTexture(field.heights);\r
      field.width = Math.max(width, Math.ceil(field.width * 1.25), 64);\r
      field.height = Math.max(height, Math.ceil(field.height * 1.25), 64);\r
      field.texture = createTexture(field.width, field.height, gl.RGBA16F, gl.CLAMP_TO_EDGE);\r
      field.heights = createTexture(field.width, field.height, gl.R32F, gl.CLAMP_TO_EDGE);\r
      gl.bindTexture(gl.TEXTURE_2D, field.heights);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, field.framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, field.texture, 0);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, field.heights, 0);\r
      gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);\r
    };\r
\r
    const bind = (unit, texture) => {\r
      gl.activeTexture(gl.TEXTURE0 + unit);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
    };\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const matrix = new Float32Array(16);\r
    const pulseData = new Float32Array(MAX_PULSES * 4);\r
    const glitchData = new Float32Array(12);\r
    const glitch = { until: 0, next: 1.5, roll: 0, seed: 0 };\r
    let entropy = 7919;\r
    const random = () => {\r
      entropy = (entropy * 16807) % 2147483647;\r
      return (entropy - 1) / 2147483646;\r
    };\r
    const pulses = [];\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const view = { width: 1, height: 1, ratio: 1, cell: 0.05, cellKey: '' };\r
    const state = {\r
      intro: settingsRef.current.intro && !reduce ? 0 : 1,\r
      rise: 1,\r
      travelX: 0,\r
      travelZ: 0,\r
      morph: 0,\r
      yaw: 0,\r
      pitch: 0,\r
      yawVelocity: 0,\r
      pitchVelocity: 0,\r
      presence: 0,\r
      focus: ORBIT,\r
      hit: null,\r
      brushFrom: null,\r
      sculptLife: 0,\r
      burst: null,\r
      level: 0,\r
      trace: 0,\r
      clock: 0,\r
      tilt: settingsRef.current.tilt,\r
      elevation: settingsRef.current.elevation,\r
      scale: settingsRef.current.scale\r
    };\r
    state.rise = smoother(state.intro);\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let quiet = 0;\r
\r
    const camera = () => {\r
      const pitch = Math.min((state.tilt * Math.PI) / 180 + state.pitch, Math.PI / 2 - 1e-4);\r
      const frame = orient(state.yaw, pitch);\r
      const lift = state.elevation * HEIGHT * state.rise * 0.18;\r
      const clearance = state.elevation * HEIGHT * state.rise * 1.3 + 0.9;\r
      const distance = Math.max(ORBIT, (clearance - lift) / Math.sin(pitch));\r
      return {\r
        ...frame,\r
        distance,\r
        eye: [-frame.f[0] * distance, lift - frame.f[1] * distance, -frame.f[2] * distance]\r
      };\r
    };\r
\r
    const rayDirection = (cam, nx, ny) => {\r
      const aspect = view.width / view.height;\r
      const t = lens(aspect);\r
      const d = [0, 1, 2].map(i => cam.f[i] + cam.r[i] * nx * t * aspect + cam.u[i] * ny * t);\r
      const length = Math.hypot(d[0], d[1], d[2]);\r
      return d.map(v => v / length);\r
    };\r
\r
    const along = (cam, d) => d[0] * cam.f[0] + d[1] * cam.f[1] + d[2] * cam.f[2];\r
\r
    const groundDepth = (cam, ny) => {\r
      const d = rayDirection(cam, 0, ny);\r
      if (d[1] > -1e-3) return Infinity;\r
      return (cam.eye[1] / -d[1]) * along(cam, d);\r
    };\r
\r
    const nearRange = (cam, s) => [groundDepth(cam, -1) * 0.9, cam.distance, s.foreground];\r
\r
    const settleAt = (cam, near, x, z) => {\r
      const depth = (x - cam.eye[0]) * cam.f[0] - cam.eye[1] * cam.f[1] + (z - cam.eye[2]) * cam.f[2];\r
      return near[2] + (1 - near[2]) * smoother((depth - near[0]) / Math.max(near[1] - near[0], 1e-3));\r
    };\r
\r
    const pick = (cam, s, nx, ny) => {\r
      const d = rayDirection(cam, nx, ny);\r
      const height = state.elevation * HEIGHT * state.rise;\r
      const frequency = FREQUENCY / state.scale;\r
      const near = nearRange(cam, s);\r
      const above = distance => {\r
        const x = cam.eye[0] + d[0] * distance;\r
        const z = cam.eye[2] + d[2] * distance;\r
        const ground = relief(state.travelX + x, state.travelZ + z, frequency, state.morph * 0.37, state.morph * 0.23);\r
        return cam.eye[1] + d[1] * distance - ground * height * settleAt(cam, near, x, z);\r
      };\r
      let distance = NEAR;\r
      let gap = above(distance);\r
      for (let i = 0; i < 200 && distance < FAR * 0.5; i++) {\r
        const next = distance + Math.max(0.02, gap * 0.4);\r
        const value = above(next);\r
        if (value < 0) {\r
          let lo = distance;\r
          let hi = next;\r
          for (let k = 0; k < 10; k++) {\r
            const mid = (lo + hi) * 0.5;\r
            if (above(mid) < 0) hi = mid;\r
            else lo = mid;\r
          }\r
          return {\r
            x: state.travelX + cam.eye[0] + d[0] * hi,\r
            y: cam.eye[1] + d[1] * hi,\r
            z: state.travelZ + cam.eye[2] + d[2] * hi,\r
            depth: hi * along(cam, d)\r
          };\r
        }\r
        distance = next;\r
        gap = value;\r
      }\r
      return null;\r
    };\r
\r
    const footprint = (cam, s, fadeEnd) => {\r
      const ceiling = state.elevation * HEIGHT * state.rise * 1.7 + 0.2 + s.mouseStrength;\r
      const box = { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity, near: Infinity };\r
      const add = (d, distance) => {\r
        const x = cam.eye[0] + d[0] * distance;\r
        const z = cam.eye[2] + d[2] * distance;\r
        box.minX = Math.min(box.minX, x);\r
        box.maxX = Math.max(box.maxX, x);\r
        box.minZ = Math.min(box.minZ, z);\r
        box.maxZ = Math.max(box.maxZ, z);\r
      };\r
      for (const nx of [-1.08, 0, 1.08]) {\r
        for (const ny of [-1.08, 1.08]) {\r
          const d = rayDirection(cam, nx, ny);\r
          const forward = Math.max(along(cam, d), 1e-3);\r
          let near = NEAR;\r
          let far = (fadeEnd * 1.05) / forward;\r
          if (d[1] < -1e-4) {\r
            near = Math.max(NEAR, (cam.eye[1] - ceiling) / -d[1]);\r
            far = Math.min(far, cam.eye[1] / -d[1]);\r
          }\r
          near = Math.min(near, far);\r
          add(d, near);\r
          add(d, far);\r
          box.near = Math.min(box.near, near * forward);\r
        }\r
      }\r
      return box;\r
    };\r
\r
    const grid = (box, cell) => {\r
      const camX = Math.floor(state.travelX / cell);\r
      const camZ = Math.floor(state.travelZ / cell);\r
      const fracX = state.travelX - camX * cell;\r
      const fracZ = state.travelZ - camZ * cell;\r
      const k0 = Math.floor((box.minX + fracX) / cell) - 2;\r
      const m0 = Math.floor((box.minZ + fracZ) / cell) - 2;\r
      const columns = clamp(Math.ceil((box.maxX + fracX) / cell) + 2 - k0, 1, 4000);\r
      const rows = clamp(Math.ceil((box.maxZ + fracZ) / cell) + 2 - m0, 1, Math.floor((MAX_CELLS * 1.5) / columns));\r
      return { cell, camX, camZ, fracX, fracZ, k0, m0, columns, rows };\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const cam = camera();\r
      viewProjection(cam, view.width / view.height, matrix);\r
\r
      const bottom = groundDepth(cam, -1);\r
      const top = Math.min(groundDepth(cam, 1), cam.distance * 3.2);\r
      const horizon = Math.max(top, bottom * 1.6, cam.distance * 1.4);\r
      const fadeEnd = horizon + (bottom * 1.8 - horizon) * s.fog;\r
      const fadeStart = fadeEnd * 0.7 + (bottom * 0.7 - fadeEnd * 0.7) * s.fog;\r
      const box = footprint(cam, s, fadeEnd);\r
\r
      const cellKey = \`\${view.width}x\${view.height}@\${view.ratio}|\${Math.round(state.tilt / 4)}|\${Math.round(state.elevation * 5)}|\${s.fog}\`;\r
      if (cellKey !== view.cellKey) {\r
        view.cellKey = cellKey;\r
        const focal = (view.height * view.ratio * 0.5) / lens(view.width / view.height);\r
        let cell = clamp((14 * Math.max(box.near, 0.5)) / focal, 0.02, 0.4);\r
        const cells = ((box.maxX - box.minX) * (box.maxZ - box.minZ)) / (cell * cell);\r
        if (cells > MAX_CELLS) cell *= Math.sqrt(cells / MAX_CELLS);\r
        view.cell = cell;\r
      }\r
\r
      const color = toRgb(s.color);\r
      const height = state.elevation * HEIGHT * state.rise;\r
      const layout = grid(box, view.cell);\r
      const near = nearRange(cam, s);\r
      const dots = s.markers >= 0 ? grid(box, MARKER_SPACING) : null;\r
      const touch = state.hit && s.mouseInteraction ? state.presence : 0;\r
      const heatStrength = touch * (0.35 + 0.5 * s.mouseStrength);\r
      const focusScale = s.depthOfField * view.height * 0.016;\r
      const reveal = smoother(state.intro / 0.35);\r
      const hitX = state.hit ? state.hit.x : 0;\r
      const hitZ = state.hit ? state.hit.z : 0;\r
\r
      pulseData.fill(0);\r
      pulses.forEach((p, i) => {\r
        pulseData.set([p.x, p.z, p.age * 4.2, Math.exp(-p.age * 1.1) * smoother(p.age / 0.08)], i * 4);\r
      });\r
\r
      gl.bindVertexArray(vao);\r
      if (fieldProgram) {\r
        const width = layout.columns + 7;\r
        const height2 = layout.rows + 7;\r
        reserveField(width, height2);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, field.framebuffer);\r
        gl.viewport(0, 0, width, height2);\r
        gl.useProgram(fieldProgram.program);\r
        const f = fieldProgram.uniforms;\r
        bind(0, sculpt ? sculpt[sculptIndex].texture : blank);\r
        gl.uniform1i(f.uSculpt, 0);\r
        gl.uniform1f(f.uSculptOn, sculpt ? 1 : 0);\r
        gl.uniform1f(f.uFrequency, FREQUENCY / state.scale);\r
        gl.uniform2f(f.uMorph, state.morph * 0.37, state.morph * 0.23);\r
        gl.uniform4fv(f.uPulses, pulseData);\r
        gl.uniform2i(f.uBase, layout.k0 - 2 + layout.camX, layout.m0 - 2 + layout.camZ);\r
        gl.uniform1f(f.uCell, layout.cell);\r
        gl.uniform1f(f.uDetail, s.detail);\r
        gl.disable(gl.DEPTH_TEST);\r
        gl.disable(gl.BLEND);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      }\r
\r
      const drawTerrain = (pixel, width, targetHeight, stride) => {\r
        gl.viewport(0, 0, width, targetHeight);\r
        gl.useProgram(terrain.program);\r
        const u = terrain.uniforms;\r
        bind(0, fieldProgram ? field.texture : blank);\r
        gl.uniform1i(u.uField, 0);\r
        bind(1, fieldProgram ? field.heights : blank);\r
        gl.uniform1i(u.uHeightField, 1);\r
        gl.uniform1f(u.uFrequency, FREQUENCY / state.scale);\r
        gl.uniform2f(u.uMorph, state.morph * 0.37, state.morph * 0.23);\r
        gl.uniform4fv(u.uPulses, pulseData);\r
        gl.uniform2i(u.uOrigin, layout.k0, layout.m0);\r
        gl.uniform2i(u.uCamCell, layout.camX, layout.camZ);\r
        gl.uniform2f(u.uCamFrac, layout.fracX, layout.fracZ);\r
        gl.uniform1f(u.uCell, layout.cell);\r
        gl.uniform1i(u.uStride, stride);\r
        gl.uniform1f(u.uHeight, height);\r
        gl.uniform3fv(u.uEye, cam.eye);\r
        gl.uniform3fv(u.uForward, cam.f);\r
        gl.uniform3fv(u.uNear, near);\r
        gl.uniform1f(u.uRefDepth, cam.distance);\r
        gl.uniformMatrix4fv(u.uViewProj, false, matrix);\r
        gl.uniform1f(u.uDetail, s.detail);\r
        gl.uniform1f(u.uLines, s.lineCount);\r
        gl.uniform1f(u.uLineWidth, s.lineWidth * pixel);\r
        gl.uniform1f(u.uMajor, s.majorLines ? 1 : 0);\r
        gl.uniform3fv(u.uColor, color);\r
        gl.uniform1f(u.uBrightness, s.brightness);\r
        gl.uniform2f(u.uFade, fadeStart, fadeEnd);\r
        gl.uniform3f(u.uFocus, state.focus, focusScale * pixel, view.height * 0.03 * pixel);\r
        gl.uniform4f(u.uHeat, hitX, hitZ, 0.9 * s.mouseRadius, heatStrength);\r
        gl.uniform4f(u.uLamp, hitX, state.hit ? state.hit.y + 1.4 : 0, hitZ, heatStrength);\r
        gl.uniform4f(u.uTrace, state.level, state.trace, hitX, hitZ);\r
        gl.uniform3fv(u.uSun, SUN);\r
        gl.uniform1f(u.uReveal, reveal);\r
        gl.uniform1f(u.uLightMode, s.lightMode ? 1 : 0);\r
        gl.uniform1f(u.uOpacity, s.opacity);\r
        gl.uniform4fv(u.uGlitch, glitchData);\r
        gl.uniform1f(u.uGlitchSeed, glitch.seed);\r
        gl.uniform1f(u.uPixel, pixel);\r
        gl.enable(gl.DEPTH_TEST);\r
        gl.depthFunc(gl.LESS);\r
        gl.disable(gl.BLEND);\r
        gl.clearColor(0, 0, 0, 0);\r
        gl.clearDepth(1);\r
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);\r
        gl.drawArraysInstanced(\r
          gl.TRIANGLE_STRIP,\r
          0,\r
          2 * (Math.ceil(layout.columns / stride) + 1),\r
          Math.ceil(layout.rows / stride)\r
        );\r
        if (dots) {\r
          gl.useProgram(markerProgram.program);\r
          const m = markerProgram.uniforms;\r
          bind(2, sculpt ? sculpt[sculptIndex].texture : blank);\r
          gl.uniform1i(m.uSculpt, 2);\r
          gl.uniform1f(m.uSculptOn, sculpt ? 1 : 0);\r
          gl.uniform1f(m.uFrequency, FREQUENCY / state.scale);\r
          gl.uniform2f(m.uMorph, state.morph * 0.37, state.morph * 0.23);\r
          gl.uniform4fv(m.uPulses, pulseData);\r
          gl.uniform3fv(m.uEye, cam.eye);\r
          gl.uniform3fv(m.uForward, cam.f);\r
          gl.uniform3fv(m.uNear, near);\r
          gl.uniform2i(m.uOrigin, dots.k0, dots.m0);\r
          gl.uniform2i(m.uCamCell, dots.camX, dots.camZ);\r
          gl.uniform2f(m.uCamFrac, dots.fracX, dots.fracZ);\r
          gl.uniform1f(m.uSpacing, dots.cell);\r
          gl.uniform1i(m.uColumns, dots.columns + 1);\r
          gl.uniform1f(m.uHeight, height);\r
          gl.uniformMatrix4fv(m.uViewProj, false, matrix);\r
          gl.uniform2f(m.uView, width, targetHeight);\r
          gl.uniform1f(m.uSize, 4 * pixel);\r
          gl.uniform1f(m.uRefDepth, cam.distance);\r
          gl.uniform4f(m.uHeat, hitX, hitZ, 1.2 * s.mouseRadius, heatStrength);\r
          gl.uniform1f(m.uTime, state.clock);\r
          gl.uniform4fv(m.uGlitch, glitchData);\r
          gl.uniform1f(m.uPixel, pixel);\r
          gl.uniform3fv(m.uColor, color);\r
          gl.uniform2f(m.uFade, fadeStart, fadeEnd);\r
          gl.uniform1f(m.uReveal, reveal);\r
          gl.uniform1f(m.uBrightness, s.brightness);\r
          gl.uniform1f(m.uLightMode, s.lightMode ? 1 : 0);\r
          gl.uniform1f(m.uOpacity, s.opacity);\r
          gl.uniform1f(m.uStyle, s.markers);\r
          gl.depthFunc(gl.LEQUAL);\r
          gl.depthMask(false);\r
          gl.enable(gl.BLEND);\r
          gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
          gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, (dots.columns + 1) * (dots.rows + 1));\r
          gl.disable(gl.BLEND);\r
          gl.depthMask(true);\r
        }\r
        gl.disable(gl.DEPTH_TEST);\r
      };\r
\r
      const bloom = s.glow > 0.001;\r
      if (bloom) {\r
        const width = Math.max(1, Math.round(view.width / 2));\r
        const targetHeight = Math.max(1, Math.round(view.height / 2));\r
        allocate(source, width, targetHeight, true);\r
        levels.forEach((pair, index) => {\r
          const w = Math.max(1, Math.round(view.width / 2 ** (index + 2)));\r
          const h = Math.max(1, Math.round(view.height / 2 ** (index + 2)));\r
          allocate(pair[0], w, h, false);\r
          allocate(pair[1], w, h, false);\r
        });\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, source.framebuffer);\r
        drawTerrain(0.5, width, targetHeight, 2);\r
        let from = source;\r
        levels.forEach(([front, back]) => {\r
          gl.bindFramebuffer(gl.FRAMEBUFFER, front.framebuffer);\r
          gl.viewport(0, 0, front.width, front.height);\r
          gl.useProgram(downProgram.program);\r
          bind(0, from.texture);\r
          gl.uniform1i(downProgram.uniforms.uSource, 0);\r
          gl.uniform2f(downProgram.uniforms.uTarget, front.width, front.height);\r
          gl.uniform2f(downProgram.uniforms.uTexel, 1 / from.width, 1 / from.height);\r
          gl.drawArrays(gl.TRIANGLES, 0, 3);\r
          gl.useProgram(blurProgram.program);\r
          gl.uniform1i(blurProgram.uniforms.uSource, 0);\r
          gl.uniform2f(blurProgram.uniforms.uTarget, back.width, back.height);\r
          gl.bindFramebuffer(gl.FRAMEBUFFER, back.framebuffer);\r
          bind(0, front.texture);\r
          gl.uniform2f(blurProgram.uniforms.uStep, 1 / front.width, 0);\r
          gl.drawArrays(gl.TRIANGLES, 0, 3);\r
          gl.bindFramebuffer(gl.FRAMEBUFFER, front.framebuffer);\r
          bind(0, back.texture);\r
          gl.uniform2f(blurProgram.uniforms.uStep, 0, 1 / back.height);\r
          gl.drawArrays(gl.TRIANGLES, 0, 3);\r
          from = front;\r
        });\r
      }\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      drawTerrain(view.ratio, canvas.width, canvas.height, 1);\r
\r
      if (bloom) {\r
        gl.viewport(0, 0, canvas.width, canvas.height);\r
        gl.useProgram(compositeProgram.program);\r
        const c = compositeProgram.uniforms;\r
        levels.forEach(([front], index) => {\r
          bind(index, front.texture);\r
          gl.uniform1i(c[\`uBloom\${index}\`], index);\r
        });\r
        gl.uniform2f(c.uView, canvas.width, canvas.height);\r
        gl.uniform1f(c.uGlow, s.glow * reveal);\r
        gl.uniform1f(c.uLightMode, s.lightMode ? 1 : 0);\r
        gl.enable(gl.BLEND);\r
        if (s.lightMode) gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
        else gl.blendFunc(gl.ONE, gl.ONE);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
        gl.disable(gl.BLEND);\r
      }\r
      for (let unit = BLOOM_LEVELS; unit >= 0; unit--) bind(unit, null);\r
    };\r
\r
    const updateSculpt = (s, dt) => {\r
      if (!sculpt || !sculptProgram) return false;\r
      const brush = s.mouseInteraction && s.hoverEffect === 'lift' && state.presence > 0.001 ? state.hit : null;\r
      const burst = state.burst;\r
      if (!brush && !burst && state.sculptLife <= 0) return false;\r
      const from = state.brushFrom || brush;\r
      const read = sculpt[sculptIndex];\r
      const write = sculpt[1 - sculptIndex];\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, write.framebuffer);\r
      gl.viewport(0, 0, SCULPT_SIZE, SCULPT_SIZE);\r
      gl.useProgram(sculptProgram.program);\r
      const u = sculptProgram.uniforms;\r
      bind(0, read.texture);\r
      gl.uniform1i(u.uPrevious, 0);\r
      if (brush && from) gl.uniform4f(u.uSegment, from.x, from.z, brush.x, brush.z);\r
      else gl.uniform4f(u.uSegment, 0, 0, 0, 0);\r
      gl.uniform4f(\r
        u.uBrush,\r
        1.1 * s.mouseRadius,\r
        0.9 * s.mouseStrength,\r
        1 - Math.exp(-dt * 7),\r
        brush ? state.presence : 0\r
      );\r
      if (burst) {\r
        const before = smoother(burst.age / 0.7);\r
        burst.age += dt;\r
        const amount = (smoother(burst.age / 0.7) - before) * 0.9 * Math.max(s.mouseStrength, 0.3);\r
        gl.uniform4f(u.uBurst, burst.x, burst.z, 1.6 * s.mouseRadius, amount);\r
        if (burst.age >= 0.7) state.burst = null;\r
      } else {\r
        gl.uniform4f(u.uBurst, 0, 0, 1, 0);\r
      }\r
      const tau = 0.25 + 3 * s.trail * s.trail;\r
      gl.uniform2f(u.uDecay, Math.exp(-dt / tau), Math.exp(-dt / 0.7));\r
      gl.disable(gl.BLEND);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      sculptIndex = 1 - sculptIndex;\r
      state.brushFrom = brush ? { x: brush.x, z: brush.z } : null;\r
      if (brush || burst) state.sculptLife = tau * 6;\r
      else state.sculptLife -= dt;\r
      return true;\r
    };\r
\r
    let sizedDpr = settingsRef.current.dpr;\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      sizedDpr = s.dpr;\r
      view.width = Math.max(1, container.clientWidth);\r
      view.height = Math.max(1, container.clientHeight);\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(view.width * view.ratio));\r
      canvas.height = Math.max(1, Math.round(view.height * view.ratio));\r
      render();\r
      wake();\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      if (s.dpr !== sizedDpr) resize();\r
      const dt = last ? clamp((now - last) / 1000, 0, 1 / 20) : 1 / 60;\r
      last = now;\r
\r
      if (!s.intro || reduce) state.intro = 1;\r
      else if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / INTRO_SECONDS);\r
      state.rise = smoother(state.intro);\r
      const ease = reduce ? 1 : 1 - Math.exp(-dt / 0.4);\r
      state.tilt += (s.tilt - state.tilt) * ease;\r
      state.elevation += (s.elevation - state.elevation) * ease;\r
      state.scale = s.scale;\r
\r
      state.clock += dt;\r
      const glitching = reduce ? 0 : s.glitch;\r
      if (glitching > 0) {\r
        if (state.clock >= glitch.next && state.clock >= glitch.until) {\r
          glitch.until = state.clock + 0.1 + random() * 0.22 * (0.5 + glitching);\r
          glitch.next = glitch.until + (9 - 7.4 * glitching) * (0.45 + random() * 1.1);\r
          glitch.roll = 0;\r
        }\r
        if (state.clock < glitch.until) {\r
          if (state.clock >= glitch.roll) {\r
            glitchData.fill(0);\r
            const count = 1 + Math.floor(random() * 3);\r
            for (let i = 0; i < count; i++) {\r
              const band = 3 + random() * random() * view.height * 0.14;\r
              const y = random() * view.height;\r
              const shift = (random() - 0.5) * 2 * (10 + 46 * glitching);\r
              glitchData.set([y, y + band, shift, 1 + random() * 3 * glitching], i * 4);\r
            }\r
            glitch.seed = random();\r
            glitch.roll = state.clock + 0.04 + random() * 0.05;\r
          }\r
        } else glitchData.fill(0);\r
      } else glitchData.fill(0);\r
\r
      if (!reduce) {\r
        state.travelX += s.direction[0] * s.speed * 0.8 * dt;\r
        state.travelZ += s.direction[1] * s.speed * 0.8 * dt;\r
        state.morph += s.morph * 0.12 * dt;\r
      }\r
\r
      const engaged = pointer.inside && s.mouseInteraction;\r
      state.presence += ((engaged ? 1 : 0) - state.presence) * (1 - Math.exp(-dt / (engaged ? 0.18 : 0.45)));\r
\r
      const nx = (pointer.x / view.width) * 2 - 1;\r
      const ny = 1 - (pointer.y / view.height) * 2;\r
      const lean = reduce || !engaged ? 0 : s.parallax;\r
      const targetYaw = nx * lean * 0.09;\r
      const targetPitch = -ny * lean * 0.045;\r
      state.yawVelocity += (38 * (targetYaw - state.yaw) - 11 * state.yawVelocity) * dt;\r
      state.pitchVelocity += (38 * (targetPitch - state.pitch) - 11 * state.pitchVelocity) * dt;\r
      state.yaw += state.yawVelocity * dt;\r
      state.pitch += state.pitchVelocity * dt;\r
\r
      const cam = camera();\r
      if (engaged) {\r
        state.hit = pick(cam, s, nx, ny);\r
        if (state.hit && state.brushFrom) {\r
          const jump = Math.hypot(state.hit.x - state.brushFrom.x, state.hit.z - state.brushFrom.z);\r
          if (jump > 3 * s.mouseRadius) state.brushFrom = null;\r
        }\r
      } else if (state.presence < 0.002) {\r
        state.hit = null;\r
        state.brushFrom = null;\r
      }\r
\r
      const tracing = state.hit && s.mouseInteraction && s.hoverEffect === 'trace' ? state.presence : 0;\r
      if (state.hit) {\r
        const frequency = FREQUENCY / state.scale;\r
        const target =\r
          relief(state.hit.x, state.hit.z, frequency, state.morph * 0.37, state.morph * 0.23) +\r
          s.detail * 0.1 * fineDetail(state.hit.x, state.hit.z, frequency);\r
        state.level = state.trace < 0.01 ? target : state.level + (target - state.level) * (1 - Math.exp(-dt / 0.09));\r
      }\r
      state.trace += (tracing - state.trace) * (1 - Math.exp(-dt / 0.2));\r
\r
      const focusTarget = state.hit && s.depthOfField > 0 ? state.hit.depth : cam.distance;\r
      state.focus += (focusTarget - state.focus) * (1 - Math.exp(-dt / 0.35));\r
\r
      for (let i = pulses.length - 1; i >= 0; i--) {\r
        pulses[i].age += dt;\r
        if (pulses[i].age > 4) pulses.splice(i, 1);\r
      }\r
\r
      const sculpting = updateSculpt(s, dt);\r
      render();\r
\r
      const settling =\r
        Math.abs(s.tilt - state.tilt) > 0.01 ||\r
        Math.abs(s.elevation - state.elevation) > 1e-4 ||\r
        Math.abs(state.yaw - targetYaw) > 1e-4 ||\r
        Math.abs(state.pitch - targetPitch) > 1e-4 ||\r
        Math.abs(state.yawVelocity) > 1e-4 ||\r
        Math.abs(state.pitchVelocity) > 1e-4 ||\r
        Math.abs(focusTarget - state.focus) > 1e-3 ||\r
        Math.abs(tracing - state.trace) > 1e-3;\r
      const busy =\r
        (!reduce && (s.speed !== 0 || s.morph !== 0 || s.glitch > 0 || s.markers >= 0)) ||\r
        state.intro < 1 ||\r
        pulses.length > 0 ||\r
        sculpting ||\r
        settling ||\r
        (state.presence > 0.001 && state.presence < 0.999);\r
      quiet = busy ? 0 : quiet + dt;\r
      if (quiet < 0.5) raf = requestAnimationFrame(frame);\r
    };\r
\r
    function wake() {\r
      quiet = 0;\r
      if (!raf && visible && !document.hidden) {\r
        last = 0;\r
        raf = requestAnimationFrame(frame);\r
      }\r
    }\r
\r
    const locate = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };\r
    };\r
\r
    const onPointerMove = event => {\r
      const { x, y, inside } = locate(event);\r
      const was = pointer.inside;\r
      pointer.inside = inside;\r
      if (inside) {\r
        pointer.x = x;\r
        pointer.y = y;\r
      }\r
      if (inside || was) wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      const { x, y, inside } = locate(event);\r
      if (!inside) return;\r
      pointer.x = x;\r
      pointer.y = y;\r
      pointer.inside = true;\r
      wake();\r
      if (s.glitch > 0 && !reduce) {\r
        glitch.until = state.clock + 0.16;\r
        glitch.roll = 0;\r
      }\r
      if (!s.mouseInteraction || (s.clickEffect !== 'pulse' && s.clickEffect !== 'peak')) return;\r
      const hit = pick(camera(), s, (x / view.width) * 2 - 1, 1 - (y / view.height) * 2);\r
      if (!hit) return;\r
      if (s.clickEffect === 'peak' && sculpt) {\r
        state.burst = { x: hit.x, z: hit.z, age: 0 };\r
      } else if (s.clickEffect === 'pulse') {\r
        if (pulses.length >= MAX_PULSES) pulses.shift();\r
        pulses.push({ x: hit.x, z: hit.z, age: 0 });\r
      }\r
    };\r
\r
    const onPointerUp = event => {\r
      if (event.pointerType !== 'touch') return;\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
    const onVisibility = () => wake();\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(container);\r
    const intersection = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible) wake();\r
    });\r
    intersection.observe(container);\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    window.addEventListener('pointerup', onPointerUp, { passive: true });\r
    window.addEventListener('pointercancel', onPointerUp, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
    wakeRef.current = wake;\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('pointerup', onPointerUp);\r
      window.removeEventListener('pointercancel', onPointerUp);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      canvas.removeEventListener('webglcontextlost', onContextLost);\r
      canvas.removeEventListener('webglcontextrestored', onContextRestored);\r
      [source, ...levels.flat()].forEach(target => {\r
        if (target.texture) gl.deleteTexture(target.texture);\r
        if (target.depth) gl.deleteRenderbuffer(target.depth);\r
        gl.deleteFramebuffer(target.framebuffer);\r
      });\r
      sculpt?.forEach(target => {\r
        gl.deleteTexture(target.texture);\r
        gl.deleteFramebuffer(target.framebuffer);\r
      });\r
      gl.deleteTexture(blank);\r
      gl.deleteVertexArray(vao);\r
      if (field.texture) gl.deleteTexture(field.texture);\r
      if (field.heights) gl.deleteTexture(field.heights);\r
      gl.deleteFramebuffer(field.framebuffer);\r
      [terrain, fieldProgram, sculptProgram, downProgram, blurProgram, compositeProgram, markerProgram].forEach(\r
        program => program && gl.deleteProgram(program.program)\r
      );\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
    };\r
  }, [generation]);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div\r
      ref={containerRef}\r
      className={['relative w-full h-full overflow-hidden', className].filter(Boolean).join(' ')}\r
      style={style}\r
    >\r
      <canvas ref={canvasRef} className="block w-full h-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Topography;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, useState, type CSSProperties } from 'react';\r
import './Topography.css';\r
\r
const FOV = 0.32;\r
const ORBIT = 9;\r
const NEAR = 0.05;\r
const FAR = 160;\r
const HEIGHT = 1.7;\r
const FREQUENCY = 0.45;\r
const INTRO_SECONDS = 2.8;\r
const MAX_PULSES = 4;\r
const BLOOM_LEVELS = 4;\r
const SCULPT_SIZE = 256;\r
const SCULPT_SPAN = 48;\r
const MAX_CELLS = 200000;\r
const SUN = [-0.81, 0.58, -0.02];\r
export type TopographyDirection = 'forward' | 'backward' | 'left' | 'right';\r
export type TopographyHoverEffect = 'lift' | 'trace' | 'light';\r
export type TopographyClickEffect = 'pulse' | 'peak' | 'none';\r
export type TopographyMarkers = 'none' | 'plus' | 'dots';\r
\r
export interface TopographyProps {\r
  color?: string;\r
  lineCount?: number;\r
  lineWidth?: number;\r
  majorLines?: boolean;\r
  elevation?: number;\r
  foreground?: number;\r
  scale?: number;\r
  detail?: number;\r
  tilt?: number;\r
  speed?: number;\r
  direction?: TopographyDirection;\r
  morph?: number;\r
  glow?: number;\r
  depthOfField?: number;\r
  fog?: number;\r
  brightness?: number;\r
  opacity?: number;\r
  mouseInteraction?: boolean;\r
  hoverEffect?: TopographyHoverEffect;\r
  mouseRadius?: number;\r
  mouseStrength?: number;\r
  trail?: number;\r
  parallax?: number;\r
  clickEffect?: TopographyClickEffect;\r
  markers?: TopographyMarkers;\r
  glitch?: number;\r
  intro?: boolean;\r
  lightMode?: boolean;\r
  dpr?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Program {\r
  program: WebGLProgram;\r
  uniforms: Record<string, WebGLUniformLocation | null>;\r
}\r
\r
interface Target {\r
  texture: WebGLTexture | null;\r
  framebuffer: WebGLFramebuffer | null;\r
  depth: WebGLRenderbuffer | null;\r
  width: number;\r
  height: number;\r
}\r
\r
interface Frame {\r
  f: number[];\r
  r: number[];\r
  u: number[];\r
  eye: number[];\r
  distance: number;\r
}\r
\r
interface Hit {\r
  x: number;\r
  y: number;\r
  z: number;\r
  depth: number;\r
}\r
\r
interface Box {\r
  minX: number;\r
  maxX: number;\r
  minZ: number;\r
  maxZ: number;\r
  near: number;\r
}\r
\r
interface Pulse {\r
  x: number;\r
  z: number;\r
  age: number;\r
}\r
\r
interface TopographyState {\r
  intro: number;\r
  rise: number;\r
  travelX: number;\r
  travelZ: number;\r
  morph: number;\r
  yaw: number;\r
  pitch: number;\r
  yawVelocity: number;\r
  pitchVelocity: number;\r
  presence: number;\r
  focus: number;\r
  hit: Hit | null;\r
  brushFrom: { x: number; z: number } | null;\r
  sculptLife: number;\r
  burst: Pulse | null;\r
  level: number;\r
  trace: number;\r
  clock: number;\r
  tilt: number;\r
  elevation: number;\r
  scale: number;\r
}\r
\r
const DIRECTIONS: Record<string, number[]> = { forward: [0, 1], backward: [0, -1], left: [-1, 0], right: [1, 0] };\r
const HOVER_EFFECTS = ['lift', 'trace', 'light'];\r
const MARKER_STYLES: Record<string, number> = { plus: 0, dots: 1 };\r
const MARKER_SPACING = 1.25;\r
\r
const COMMON = \`\r
precision highp float;\r
precision highp int;\r
\r
uniform float uFrequency;\r
uniform vec2 uMorph;\r
uniform sampler2D uSculpt;\r
uniform float uSculptOn;\r
uniform vec4 uPulses[\${MAX_PULSES}];\r
uniform vec3 uEye;\r
uniform vec3 uForward;\r
uniform vec3 uNear;\r
\r
uint lattice(ivec2 p) {\r
  uvec2 q = uvec2(p + 1073741824);\r
  uint h = q.x * 2654435761u + q.y * 2246822519u;\r
  h = (h ^ (h >> 15u)) * 739982445u;\r
  h = (h ^ (h >> 12u)) * 695872825u;\r
  return h ^ (h >> 15u);\r
}\r
\r
float corner(ivec2 c, vec2 f) {\r
  uint h = lattice(c);\r
  vec2 g = vec2(float(h & 65535u), float(h >> 16u)) / 32767.5 - 1.0;\r
  return dot(g, f);\r
}\r
\r
float noise(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = p - i;\r
  ivec2 c = ivec2(i);\r
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);\r
  float a = corner(c, f);\r
  float b = corner(c + ivec2(1, 0), f - vec2(1.0, 0.0));\r
  float d = corner(c + ivec2(0, 1), f - vec2(0.0, 1.0));\r
  float e = corner(c + ivec2(1, 1), f - vec2(1.0, 1.0));\r
  return mix(mix(a, b, u.x), mix(d, e, u.x), u.y);\r
}\r
\r
vec2 octave(vec2 p, vec2 shift) {\r
  return vec2(1.6 * p.x - 1.2 * p.y, 1.2 * p.x + 1.6 * p.y) + shift;\r
}\r
\r
float relief(vec2 t) {\r
  vec2 p = t * uFrequency;\r
  vec2 w = vec2(noise(p * 0.42 + uMorph), noise(p * 0.42 - uMorph.yx + vec2(5.2, 1.3)));\r
  p += w * 0.8;\r
  float n = noise(p) * 0.55;\r
  p = octave(p, vec2(7.1, 3.7));\r
  n += noise(p) * 0.15;\r
  p = octave(p, vec2(1.9, 8.3));\r
  n += noise(p) * 0.04;\r
  float s = log(1.0 + exp(7.0 * (3.0 * n + 0.05))) / 7.0;\r
  return s * s * 1.4 + 0.1 * n;\r
}\r
\r
float swell(vec2 t) {\r
  float lift = 0.0;\r
  for (int i = 0; i < \${MAX_PULSES}; i++) {\r
    vec4 p = uPulses[i];\r
    if (p.w <= 0.0) continue;\r
    float x = (length(t - p.xy) - p.z) / (0.28 + p.z * 0.05);\r
    lift += exp(-x * x) * p.w;\r
  }\r
  return lift;\r
}\r
\r
vec4 sculpted(vec2 t) {\r
  return uSculptOn > 0.5 ? textureLod(uSculpt, t / \${SCULPT_SPAN}.0, 0.0) : vec4(0.0);\r
}\r
\r
float settle(vec2 world) {\r
  float depth = dot(vec3(world.x, 0.0, world.y) - uEye, uForward);\r
  float x = clamp((depth - uNear.x) / max(uNear.y - uNear.x, 1e-3), 0.0, 1.0);\r
  return mix(uNear.z, 1.0, x * x * x * (x * (x * 6.0 - 15.0) + 10.0));\r
}\r
\`;\r
\r
const FIELD = \`#version 300 es\r
\${COMMON}\r
uniform ivec2 uBase;\r
uniform float uCell;\r
uniform float uDetail;\r
layout(location = 0) out vec4 outField;\r
layout(location = 1) out vec4 outHeight;\r
\r
void main() {\r
  vec2 t = vec2(uBase + ivec2(gl_FragCoord.xy)) * uCell;\r
  vec4 carved = sculpted(t);\r
  float ring = swell(t);\r
  float ground = relief(t) + carved.r + ring * 0.14;\r
  vec2 dp = t * uFrequency * 5.0 + vec2(13.1, 4.7);\r
  float fine = noise(dp) * 0.6 + noise(octave(dp, vec2(2.3, 6.1))) * 0.3;\r
  outField = vec4(carved.g, ring, ground, carved.r);\r
  outHeight = vec4(ground + uDetail * 0.1 * fine, 0.0, 0.0, 1.0);\r
}\`;\r
\r
const terrainVertex = (baked: boolean) => \`#version 300 es\r
#define BAKED \${baked ? 1 : 0}\r
\${COMMON}\r
uniform sampler2D uField;\r
uniform ivec2 uOrigin;\r
uniform ivec2 uCamCell;\r
uniform vec2 uCamFrac;\r
uniform float uCell;\r
uniform int uStride;\r
uniform float uHeight;\r
uniform mat4 uViewProj;\r
out vec2 vTexel;\r
out vec2 vTerrain;\r
out float vDepth;\r
out float vLift;\r
out vec3 vNormal;\r
\r
float ground(vec2 t) {\r
  return relief(t) + swell(t) * 0.14;\r
}\r
\r
void main() {\r
  ivec2 step = ivec2(gl_VertexID >> 1, gl_InstanceID + (gl_VertexID & 1)) * uStride;\r
  ivec2 local = uOrigin + step;\r
  vec2 terrain = vec2(local + uCamCell) * uCell;\r
  vec2 world = vec2(local) * uCell - uCamFrac;\r
  float k = settle(world);\r
#if BAKED\r
  ivec2 texel = step + 2;\r
  vec4 c = texelFetch(uField, texel, 0);\r
  vec4 l = texelFetch(uField, texel - ivec2(1, 0), 0);\r
  vec4 r = texelFetch(uField, texel + ivec2(1, 0), 0);\r
  vec4 d = texelFetch(uField, texel - ivec2(0, 1), 0);\r
  vec4 u = texelFetch(uField, texel + ivec2(0, 1), 0);\r
  float h = (c.b - c.a) * k + c.a;\r
  float dx = (l.b - l.a - r.b + r.a) * k + l.a - r.a;\r
  float dz = (d.b - d.a - u.b + u.a) * k + d.a - u.a;\r
  vNormal = vec3(dx * uHeight / (2.0 * uCell), 1.0, dz * uHeight / (2.0 * uCell));\r
  vTexel = vec2(texel) + 0.5;\r
#else\r
  float h = ground(terrain) * k;\r
  float hx = ground(terrain + vec2(0.04, 0.0)) * k;\r
  float hz = ground(terrain + vec2(0.0, 0.04)) * k;\r
  vNormal = vec3((h - hx) * uHeight / 0.04, 1.0, (h - hz) * uHeight / 0.04);\r
  vTexel = vec2(0.0);\r
#endif\r
  vec4 clip = uViewProj * vec4(world.x, h * uHeight, world.y, 1.0);\r
  gl_Position = clip;\r
  vTerrain = terrain;\r
  vDepth = clip.w;\r
  vLift = h * uHeight;\r
}\`;\r
\r
const terrainFragment = (baked: boolean) => \`#version 300 es\r
#define BAKED \${baked ? 1 : 0}\r
\${COMMON}\r
uniform sampler2D uField;\r
uniform highp sampler2D uHeightField;\r
uniform float uDetail;\r
uniform float uLines;\r
uniform float uLineWidth;\r
uniform float uMajor;\r
uniform vec3 uColor;\r
uniform float uBrightness;\r
uniform vec2 uFade;\r
uniform vec3 uFocus;\r
uniform vec4 uHeat;\r
uniform vec4 uLamp;\r
uniform vec4 uTrace;\r
uniform vec3 uSun;\r
uniform float uRefDepth;\r
uniform float uReveal;\r
uniform float uLightMode;\r
uniform float uOpacity;\r
uniform vec4 uGlitch[3];\r
uniform float uGlitchSeed;\r
uniform float uPixel;\r
in vec2 vTexel;\r
in vec2 vTerrain;\r
in float vDepth;\r
in float vLift;\r
in vec3 vNormal;\r
out vec4 outColor;\r
\r
float smoother(float x) {\r
  x = clamp(x, 0.0, 1.0);\r
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);\r
}\r
\r
float stroke(float dist, float width, float soft, float density, float crowd) {\r
  float cover = max(0.0, min(min(width, soft), 0.5 * (width + soft) - dist)) / soft;\r
  return mix(cover, min(width * density, 1.0) * 0.6, crowd);\r
}\r
\r
float sampleHeight(vec2 coord, out vec2 slope) {\r
  vec2 u = coord - 0.5;\r
  vec2 i = floor(u + 0.5);\r
  vec2 f = u - i;\r
  vec3 wx = vec3(0.5 * (0.5 - f.x) * (0.5 - f.x), 0.75 - f.x * f.x, 0.5 * (0.5 + f.x) * (0.5 + f.x));\r
  vec3 wy = vec3(0.5 * (0.5 - f.y) * (0.5 - f.y), 0.75 - f.y * f.y, 0.5 * (0.5 + f.y) * (0.5 + f.y));\r
  vec3 dx = vec3(f.x - 0.5, -2.0 * f.x, 0.5 + f.x);\r
  vec3 dy = vec3(f.y - 0.5, -2.0 * f.y, 0.5 + f.y);\r
  ivec2 base = ivec2(i) - 1;\r
  float total = 0.0;\r
  slope = vec2(0.0);\r
  for (int y = 0; y < 3; y++) {\r
    float a = texelFetch(uHeightField, base + ivec2(0, y), 0).r;\r
    float b = texelFetch(uHeightField, base + ivec2(1, y), 0).r;\r
    float c = texelFetch(uHeightField, base + ivec2(2, y), 0).r;\r
    float row = a * wx.x + b * wx.y + c * wx.z;\r
    total += row * wy[y];\r
    slope += vec2((a * dx.x + b * dx.y + c * dx.z) * wy[y], row * dy[y]);\r
  }\r
  return total;\r
}\r
\r
void main() {\r
  float py = gl_FragCoord.y / uPixel;\r
  float shift = 0.0;\r
  float split = 0.0;\r
  for (int i = 0; i < 3; i++) {\r
    if (py >= uGlitch[i].x && py < uGlitch[i].y) {\r
      shift = uGlitch[i].z * uPixel;\r
      split = uGlitch[i].w * uPixel;\r
    }\r
  }\r
  vec2 spot = vTerrain - dFdx(vTerrain) * shift;\r
#if BAKED\r
  vec2 ex = dFdx(vTexel);\r
  vec2 ey = dFdy(vTexel);\r
  vec2 coord = vTexel - ex * shift;\r
  vec2 slope;\r
  float h = sampleHeight(coord, slope);\r
  vec4 field = texture(uField, coord / vec2(textureSize(uField, 0)));\r
  float trail = field.r;\r
  float ring = field.g;\r
  float gx = dot(slope, ex) * uLines;\r
  float gy = dot(slope, ey) * uLines;\r
#else\r
  vec2 dp = spot * uFrequency * 5.0 + vec2(13.1, 4.7);\r
  float ring = swell(spot);\r
  float h = relief(spot) + ring * 0.14 + uDetail * 0.1 * (noise(dp) * 0.6 + noise(octave(dp, vec2(2.3, 6.1))) * 0.3);\r
  float trail = 0.0;\r
  float gx = dFdx(h) * uLines;\r
  float gy = dFdy(h) * uLines;\r
#endif\r
\r
  float lc = h * uLines + 0.5;\r
  float density = max(sqrt(gx * gx + gy * gy), 1e-5);\r
  float dist = abs(fract(lc + 0.5) - 0.5) / density;\r
  float major = uMajor * (1.0 - step(0.5, mod(floor(lc + 0.5), 5.0)));\r
\r
  vec2 hd = spot - uHeat.xy;\r
  float heat = exp(-dot(hd, hd) / (uHeat.z * uHeat.z)) * uHeat.w + trail * 0.6;\r
  float energy = heat + ring;\r
\r
  float depth = max(vDepth, 0.01);\r
  float persp = clamp(sqrt(uRefDepth / depth), 0.6, 1.6);\r
  float width = uLineWidth * persp * (1.0 + 0.6 * major) * (1.0 + 0.45 * min(energy, 1.5));\r
  float soft = 1.0 + min(uFocus.y * abs(1.0 - uFocus.x / depth), uFocus.z);\r
  float crowd = smoothstep(0.3, 0.75, density * max(width, soft));\r
  float cover = stroke(dist, width, soft, density, crowd);\r
  vec3 cover3 = vec3(cover);\r
  if (split > 0.0) {\r
    float offset = split * density;\r
    cover3.r = stroke(abs(fract(lc + offset + 0.5) - 0.5) / density, width, soft, density, crowd);\r
    cover3.b = stroke(abs(fract(lc - offset + 0.5) - 0.5) / density, width, soft, density, crowd);\r
    vec2 block = floor(vec2(gl_FragCoord.x / (uPixel * 26.0), py / 5.0)) + uGlitchSeed * 71.0;\r
    float drop = fract(sin(dot(block, vec2(12.9898, 78.233))) * 43758.5453);\r
    cover3 *= drop > 0.82 ? 0.1 : 1.2;\r
  }\r
\r
  vec3 normal = normalize(vNormal);\r
  float sun = clamp(dot(normal, uSun), 0.0, 1.0);\r
  vec3 toLamp = uLamp.xyz - vec3(vTerrain.x, vLift, vTerrain.y);\r
  float lampDistance = length(toLamp);\r
  float lamp = clamp(dot(normal, toLamp / max(lampDistance, 1e-3)), 0.0, 1.0) * uLamp.w / (1.0 + lampDistance * lampDistance * 0.9);\r
  float level = mix(0.45, 1.05, smoothstep(0.0, 1.1, h)) * mix(0.35, 1.25, sun * sun) * (1.0 + 0.6 * major);\r
  level += heat * 1.4 + ring * 3.0 + lamp * 1.2;\r
\r
  float fade = 1.0 - smoother((depth - uFade.x) / max(uFade.y - uFade.x, 1e-3));\r
  vec3 light = cover3 * level;\r
\r
  if (uTrace.y > 0.0) {\r
    float traceWidth = uLineWidth * persp * 1.8;\r
    float trace = stroke(abs(h - uTrace.x) * uLines / density, traceWidth, soft, density, crowd);\r
    vec2 td = spot - uTrace.zw;\r
    light += trace * uTrace.y * mix(0.35, 1.0, exp(-dot(td, td) / 20.0)) * 2.6;\r
  }\r
  light *= fade * uBrightness * uReveal;\r
\r
  if (uLightMode > 0.5) {\r
    float ink = (1.0 - exp(-max(max(light.r, light.g), light.b) * 1.8)) * 0.92 * uOpacity;\r
    outColor = vec4(uColor * ink, ink);\r
    return;\r
  }\r
\r
  vec3 color = 1.0 - exp(-uColor * light * 1.8);\r
  float top = max(max(color.r, color.g), color.b);\r
  float dither = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;\r
  color = max(color + dither / 255.0 * step(0.002, top), 0.0);\r
  outColor = vec4(color, max(max(color.r, color.g), color.b)) * uOpacity;\r
}\`;\r
\r
const MARKER_VERTEX = \`#version 300 es\r
\${COMMON}\r
uniform ivec2 uOrigin;\r
uniform ivec2 uCamCell;\r
uniform vec2 uCamFrac;\r
uniform float uSpacing;\r
uniform int uColumns;\r
uniform float uHeight;\r
uniform mat4 uViewProj;\r
uniform vec2 uView;\r
uniform float uSize;\r
uniform float uRefDepth;\r
uniform vec4 uHeat;\r
uniform float uTime;\r
uniform vec4 uGlitch[3];\r
uniform float uPixel;\r
out vec2 vCorner;\r
out float vSize;\r
out float vGlow;\r
out float vFrame;\r
out float vDepth;\r
\r
void main() {\r
  ivec2 local = uOrigin + ivec2(gl_InstanceID % uColumns, gl_InstanceID / uColumns);\r
  ivec2 id = local + uCamCell;\r
  vec2 terrain = vec2(id) * uSpacing;\r
  vec2 world = vec2(local) * uSpacing - uCamFrac;\r
  float ring = swell(terrain);\r
  float h = (relief(terrain) + ring * 0.14) * settle(world) + sculpted(terrain).r;\r
  vec4 clip = uViewProj * vec4(world.x, h * uHeight + 0.05, world.y, 1.0);\r
  uint seed = lattice(id + ivec2(911, 377));\r
  float a = float(seed & 1023u) / 1023.0;\r
  float b = float((seed >> 10u) & 1023u) / 1023.0;\r
  vec2 hd = terrain - uHeat.xy;\r
  float heat = exp(-dot(hd, hd) / (uHeat.z * uHeat.z)) * uHeat.w;\r
  float blink = step(0.92, a) * (0.5 + 0.5 * sin(uTime * (1.4 + b * 2.2) + b * 40.0));\r
  float size = uSize * clamp(sqrt(uRefDepth / max(clip.w, 0.01)), 0.6, 1.3) * (1.0 + 0.4 * heat + 0.35 * blink);\r
  float frame = max(smoothstep(0.55, 0.95, blink), smoothstep(0.3, 0.8, heat));\r
  vec2 corner = vec2(float(gl_VertexID & 1), float(gl_VertexID >> 1)) * 2.0 - 1.0;\r
  vec2 offset = corner * (size * (frame > 0.001 ? 2.6 : 1.0) + 1.5);\r
  float py = (clip.y / clip.w * 0.5 + 0.5) * uView.y / uPixel;\r
  float shift = 0.0;\r
  for (int i = 0; i < 3; i++) {\r
    if (py >= uGlitch[i].x && py < uGlitch[i].y) shift = uGlitch[i].z;\r
  }\r
  clip.xy += (offset + vec2(shift * uPixel, 0.0)) / uView * 2.0 * clip.w;\r
  gl_Position = clip;\r
  vCorner = offset;\r
  vSize = size;\r
  vFrame = frame;\r
  vGlow = 0.5 + 0.4 * b + blink * 0.9 + heat * 1.8 + ring * 3.0;\r
  vDepth = clip.w;\r
}\`;\r
\r
const MARKER_FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform vec3 uColor;\r
uniform vec2 uFade;\r
uniform float uReveal;\r
uniform float uBrightness;\r
uniform float uLightMode;\r
uniform float uOpacity;\r
uniform float uStyle;\r
uniform float uPixel;\r
in vec2 vCorner;\r
in float vSize;\r
in float vGlow;\r
in float vFrame;\r
in float vDepth;\r
out vec4 outColor;\r
\r
float smoother(float x) {\r
  x = clamp(x, 0.0, 1.0);\r
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  vec2 a = abs(vCorner);\r
  float cover;\r
  if (uStyle < 0.5) {\r
    float thick = max(0.6 * uPixel, 0.5);\r
    float across = clamp(vSize - a.x + 0.5, 0.0, 1.0) * clamp(thick - a.y + 0.5, 0.0, 1.0);\r
    float down = clamp(vSize - a.y + 0.5, 0.0, 1.0) * clamp(thick - a.x + 0.5, 0.0, 1.0);\r
    cover = max(across, down);\r
  } else {\r
    cover = clamp(vSize * 0.42 - length(vCorner) + 0.5, 0.0, 1.0);\r
  }\r
  if (vFrame > 0.001) {\r
    float edge = vSize * 2.3;\r
    float reach = edge * 0.45;\r
    float line = max(0.5 * uPixel, 0.5);\r
    float sides = clamp(line - abs(a.x - edge) + 0.5, 0.0, 1.0) * clamp(a.y - edge + reach + 0.5, 0.0, 1.0) * clamp(edge + line - a.y + 0.5, 0.0, 1.0);\r
    float caps = clamp(line - abs(a.y - edge) + 0.5, 0.0, 1.0) * clamp(a.x - edge + reach + 0.5, 0.0, 1.0) * clamp(edge + line - a.x + 0.5, 0.0, 1.0);\r
    cover = max(cover, max(sides, caps) * vFrame * 0.8);\r
  }\r
  float fade = 1.0 - smoother((vDepth - uFade.x) / max(uFade.y - uFade.x, 1e-3));\r
  float light = cover * vGlow * fade * fade * uReveal * uBrightness;\r
  if (uLightMode > 0.5) {\r
    float ink = (1.0 - exp(-light * 1.8)) * 0.92 * uOpacity;\r
    outColor = vec4(uColor * ink, ink);\r
    return;\r
  }\r
  vec3 color = 1.0 - exp(-uColor * light * 1.8);\r
  outColor = vec4(color, max(max(color.r, color.g), color.b)) * uOpacity;\r
}\`;\r
\r
const FULLSCREEN = \`#version 300 es\r
void main() {\r
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\r
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const SCULPT = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uPrevious;\r
uniform vec4 uSegment;\r
uniform vec4 uBrush;\r
uniform vec4 uBurst;\r
uniform vec2 uDecay;\r
out vec4 outColor;\r
\r
vec2 wrapped(vec2 d) {\r
  return d - \${SCULPT_SPAN}.0 * floor(d / \${SCULPT_SPAN}.0 + 0.5);\r
}\r
\r
void main() {\r
  vec4 previous = texelFetch(uPrevious, ivec2(gl_FragCoord.xy), 0);\r
  vec2 t = gl_FragCoord.xy / \${SCULPT_SIZE}.0 * \${SCULPT_SPAN}.0;\r
  vec2 a = wrapped(t - uSegment.xy);\r
  vec2 ab = uSegment.zw - uSegment.xy;\r
  float k = clamp(dot(a, ab) / max(dot(ab, ab), 1e-6), 0.0, 1.0);\r
  vec2 d = a - ab * k;\r
  float g = exp(-dot(d, d) / (uBrush.x * uBrush.x)) * uBrush.w;\r
  float height = previous.r * uDecay.x;\r
  height += (uBrush.y - height) * g * uBrush.z;\r
  float heat = previous.g * uDecay.y;\r
  heat += (1.0 - heat) * g * uBrush.z;\r
  vec2 b = wrapped(t - uBurst.xy);\r
  height += uBurst.w * exp(-dot(b, b) / (uBurst.z * uBurst.z));\r
  outColor = vec4(height, heat, 0.0, 1.0);\r
}\`;\r
\r
const DOWNSAMPLE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uSource;\r
uniform vec2 uTarget;\r
uniform vec2 uTexel;\r
out vec4 outColor;\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uTarget;\r
  vec4 color = texture(uSource, uv - uTexel);\r
  color += texture(uSource, uv + uTexel);\r
  color += texture(uSource, uv + vec2(uTexel.x, -uTexel.y));\r
  color += texture(uSource, uv + vec2(-uTexel.x, uTexel.y));\r
  outColor = min(color * 0.25, vec4(1.0));\r
}\`;\r
\r
const BLUR = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uSource;\r
uniform vec2 uTarget;\r
uniform vec2 uStep;\r
out vec4 outColor;\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uTarget;\r
  vec4 color = texture(uSource, uv) * 0.181862;\r
  color += (texture(uSource, uv + uStep * 1.423135) + texture(uSource, uv - uStep * 1.423135)) * 0.284316;\r
  color += (texture(uSource, uv + uStep * 3.326702) + texture(uSource, uv - uStep * 3.326702)) * 0.106598;\r
  color += (texture(uSource, uv + uStep * 5.242989) + texture(uSource, uv - uStep * 5.242989)) * 0.018156;\r
  outColor = color;\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uBloom0;\r
uniform sampler2D uBloom1;\r
uniform sampler2D uBloom2;\r
uniform sampler2D uBloom3;\r
uniform vec2 uView;\r
uniform float uGlow;\r
uniform float uLightMode;\r
out vec4 outColor;\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uView;\r
  vec4 halo = texture(uBloom0, uv) * 0.4;\r
  halo += texture(uBloom1, uv) * 0.3;\r
  halo += texture(uBloom2, uv) * 0.2;\r
  halo += texture(uBloom3, uv) * 0.1;\r
  if (uLightMode > 0.5) {\r
    outColor = halo * uGlow * 0.35;\r
    return;\r
  }\r
  vec3 color = halo.rgb * uGlow * 1.6;\r
  color = color / (1.0 + color);\r
  outColor = vec4(color, max(max(color.r, color.g), color.b));\r
}\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const smoother = (x: number) => {\r
  const t = clamp(x, 0, 1);\r
  return t * t * t * (t * (t * 6 - 15) + 10);\r
};\r
\r
const lattice = (x: number, y: number) => {\r
  let h = (Math.imul(x + 1073741824, 2654435761) + Math.imul(y + 1073741824, 2246822519)) >>> 0;\r
  h = Math.imul(h ^ (h >>> 15), 739982445) >>> 0;\r
  h = Math.imul(h ^ (h >>> 12), 695872825) >>> 0;\r
  return (h ^ (h >>> 15)) >>> 0;\r
};\r
\r
const corner = (cx: number, cy: number, fx: number, fy: number) => {\r
  const h = lattice(cx, cy);\r
  return ((h & 65535) / 32767.5 - 1) * fx + ((h >>> 16) / 32767.5 - 1) * fy;\r
};\r
\r
const noise = (x: number, y: number) => {\r
  const ix = Math.floor(x);\r
  const iy = Math.floor(y);\r
  const fx = x - ix;\r
  const fy = y - iy;\r
  const ux = fx * fx * fx * (fx * (fx * 6 - 15) + 10);\r
  const uy = fy * fy * fy * (fy * (fy * 6 - 15) + 10);\r
  const a = corner(ix, iy, fx, fy);\r
  const b = corner(ix + 1, iy, fx - 1, fy);\r
  const d = corner(ix, iy + 1, fx, fy - 1);\r
  const e = corner(ix + 1, iy + 1, fx - 1, fy - 1);\r
  const top = a + (b - a) * ux;\r
  return top + (d + (e - d) * ux - top) * uy;\r
};\r
\r
const relief = (tx: number, tz: number, frequency: number, morphX: number, morphZ: number) => {\r
  let px = tx * frequency;\r
  let pz = tz * frequency;\r
  const wx = noise(px * 0.42 + morphX, pz * 0.42 + morphZ);\r
  const wz = noise(px * 0.42 - morphZ + 5.2, pz * 0.42 - morphX + 1.3);\r
  px += wx * 0.8;\r
  pz += wz * 0.8;\r
  let n = noise(px, pz) * 0.55;\r
  const qx = 1.6 * px - 1.2 * pz + 7.1;\r
  const qz = 1.2 * px + 1.6 * pz + 3.7;\r
  n += noise(qx, qz) * 0.15;\r
  n += noise(1.6 * qx - 1.2 * qz + 1.9, 1.2 * qx + 1.6 * qz + 8.3) * 0.04;\r
  const s = Math.log(1 + Math.exp(7 * (3 * n + 0.05))) / 7;\r
  return s * s * 1.4 + 0.1 * n;\r
};\r
\r
const fineDetail = (tx: number, tz: number, frequency: number) => {\r
  const px = tx * frequency * 5 + 13.1;\r
  const pz = tz * frequency * 5 + 4.7;\r
  return noise(px, pz) * 0.6 + noise(1.6 * px - 1.2 * pz + 2.3, 1.2 * px + 1.6 * pz + 6.1) * 0.3;\r
};\r
\r
const compile = (gl: WebGL2RenderingContext, type: number, source: string) => {\r
  const shader = gl.createShader(type);\r
  if (!shader) return null;\r
  gl.shaderSource(shader, source);\r
  gl.compileShader(shader);\r
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;\r
  gl.deleteShader(shader);\r
  return null;\r
};\r
\r
const link = (gl: WebGL2RenderingContext, vertexSource: string, fragmentSource: string): Program | null => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);\r
  const program = gl.createProgram();\r
  if (!vertex || !fragment || !program) return null;\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
  gl.linkProgram(program);\r
  gl.deleteShader(vertex);\r
  gl.deleteShader(fragment);\r
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {\r
    gl.deleteProgram(program);\r
    return null;\r
  }\r
  const uniforms: Record<string, WebGLUniformLocation | null> = {};\r
  const total = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
  for (let i = 0; i < total; i++) {\r
    const info = gl.getActiveUniform(program, i);\r
    if (info) uniforms[info.name.replace(/\\[0\\]$/, '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const toRgb = (hex: string): number[] => {\r
  let h = String(hex || '#ffffff')\r
    .replace('#', '')\r
    .trim();\r
  if (h.length === 3 || h.length === 4)\r
    h = h\r
      .slice(0, 3)\r
      .split('')\r
      .map(c => c + c)\r
      .join('');\r
  const num = parseInt(h.slice(0, 6), 16);\r
  if (Number.isNaN(num)) return [1, 1, 1];\r
  return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];\r
};\r
\r
const orient = (yaw: number, pitch: number) => {\r
  const cp = Math.cos(pitch);\r
  const f = [Math.sin(yaw) * cp, -Math.sin(pitch), Math.cos(yaw) * cp];\r
  const r = [Math.cos(yaw), 0, -Math.sin(yaw)];\r
  const u = [f[1] * r[2] - f[2] * r[1], f[2] * r[0] - f[0] * r[2], f[0] * r[1] - f[1] * r[0]];\r
  return { f, r, u };\r
};\r
\r
const lens = (aspect: number) => clamp(0.4877 / aspect, FOV, 0.6);\r
\r
const viewProjection = ({ eye, f, r, u }: Frame, aspect: number, out: Float32Array) => {\r
  const t = 1 / lens(aspect);\r
  const nf = 1 / (NEAR - FAR);\r
  const view = [\r
    r[0],\r
    u[0],\r
    -f[0],\r
    0,\r
    r[1],\r
    u[1],\r
    -f[1],\r
    0,\r
    r[2],\r
    u[2],\r
    -f[2],\r
    0,\r
    -(r[0] * eye[0] + r[1] * eye[1] + r[2] * eye[2]),\r
    -(u[0] * eye[0] + u[1] * eye[1] + u[2] * eye[2]),\r
    f[0] * eye[0] + f[1] * eye[1] + f[2] * eye[2],\r
    1\r
  ];\r
  const projection = [t / aspect, 0, 0, 0, 0, t, 0, 0, 0, 0, (FAR + NEAR) * nf, -1, 0, 0, 2 * FAR * NEAR * nf, 0];\r
  for (let c = 0; c < 4; c++) {\r
    for (let row = 0; row < 4; row++) {\r
      let sum = 0;\r
      for (let k = 0; k < 4; k++) sum += projection[k * 4 + row] * view[c * 4 + k];\r
      out[c * 4 + row] = sum;\r
    }\r
  }\r
  return out;\r
};\r
\r
const Topography = ({\r
  color = '#4f7cff',\r
  lineCount = 22,\r
  lineWidth = 1.2,\r
  majorLines = true,\r
  elevation = 1,\r
  foreground = 0.2,\r
  scale = 1,\r
  detail = 0.35,\r
  tilt = 32,\r
  speed = 0.25,\r
  direction = 'forward',\r
  morph = 0.2,\r
  glow = 0.6,\r
  depthOfField = 0.4,\r
  fog = 0.35,\r
  brightness = 1,\r
  opacity = 1,\r
  mouseInteraction = true,\r
  hoverEffect = 'lift',\r
  mouseRadius = 1,\r
  mouseStrength = 0.6,\r
  trail = 0.3,\r
  parallax = 0.5,\r
  clickEffect = 'pulse',\r
  markers = 'none',\r
  glitch = 0,\r
  intro = true,\r
  lightMode = false,\r
  dpr,\r
  className = '',\r
  style\r
}: TopographyProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const [generation, setGeneration] = useState(0);\r
  const settings = {\r
    color,\r
    lineCount: clamp(lineCount, 2, 80),\r
    lineWidth: Math.max(0.2, lineWidth),\r
    majorLines,\r
    elevation: clamp(elevation, 0, 3),\r
    foreground: clamp(foreground, 0, 1),\r
    scale: clamp(scale, 0.2, 5),\r
    detail: clamp(detail, 0, 1),\r
    tilt: clamp(tilt, 12, 90),\r
    speed,\r
    direction: DIRECTIONS[direction] ?? DIRECTIONS.forward,\r
    morph: Math.max(0, morph),\r
    glow: Math.max(0, glow),\r
    depthOfField: clamp(depthOfField, 0, 1),\r
    fog: clamp(fog, 0, 1),\r
    brightness: Math.max(0, brightness),\r
    opacity: clamp(opacity, 0, 1),\r
    mouseInteraction,\r
    hoverEffect: HOVER_EFFECTS.includes(hoverEffect) ? hoverEffect : 'lift',\r
    mouseRadius: Math.max(0.1, mouseRadius),\r
    mouseStrength: Math.max(0, mouseStrength),\r
    trail: clamp(trail, 0, 1),\r
    parallax: clamp(parallax, 0, 1),\r
    clickEffect,\r
    markers: MARKER_STYLES[markers] ?? -1,\r
    glitch: clamp(glitch, 0, 1),\r
    intro,\r
    lightMode,\r
    dpr\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    const ratio = Math.min(settingsRef.current.dpr || window.devicePixelRatio || 1, 2);\r
    const gl = canvas?.getContext('webgl2', {\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: ratio < 1.5,\r
      depth: true,\r
      stencil: false,\r
      powerPreference: 'high-performance'\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const floatTargets = !!gl.getExtension('EXT_color_buffer_float');\r
    const terrain = link(gl, terrainVertex(floatTargets), terrainFragment(floatTargets));\r
    const fieldProgram = floatTargets ? link(gl, FULLSCREEN, FIELD) : null;\r
    const sculptProgram = floatTargets ? link(gl, FULLSCREEN, SCULPT) : null;\r
    const downProgram = link(gl, FULLSCREEN, DOWNSAMPLE);\r
    const blurProgram = link(gl, FULLSCREEN, BLUR);\r
    const compositeProgram = link(gl, FULLSCREEN, COMPOSITE);\r
    const markerProgram = link(gl, MARKER_VERTEX, MARKER_FRAGMENT);\r
    if (!terrain || !downProgram || !blurProgram || !compositeProgram || !markerProgram) return undefined;\r
\r
    const onContextLost = (event: Event) => event.preventDefault();\r
    const onContextRestored = () => setGeneration(value => value + 1);\r
    canvas.addEventListener('webglcontextlost', onContextLost);\r
    canvas.addEventListener('webglcontextrestored', onContextRestored);\r
\r
    const vao = gl.createVertexArray();\r
    const format = floatTargets ? gl.RGBA16F : gl.RGBA8;\r
\r
    const createTexture = (width: number, height: number, internal: number, wrap: number) => {\r
      const texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texStorage2D(gl.TEXTURE_2D, 1, internal, width, height);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);\r
      return texture;\r
    };\r
\r
    const createTarget = (): Target => ({\r
      texture: null,\r
      framebuffer: gl.createFramebuffer(),\r
      depth: null,\r
      width: 0,\r
      height: 0\r
    });\r
\r
    const allocate = (target: Target, width: number, height: number, withDepth: boolean) => {\r
      if (target.texture && target.width === width && target.height === height) return;\r
      if (target.texture) gl.deleteTexture(target.texture);\r
      target.texture = createTexture(width, height, format, gl.CLAMP_TO_EDGE);\r
      target.width = width;\r
      target.height = height;\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target.texture, 0);\r
      if (withDepth) {\r
        if (!target.depth) target.depth = gl.createRenderbuffer();\r
        gl.bindRenderbuffer(gl.RENDERBUFFER, target.depth);\r
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, width, height);\r
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, target.depth);\r
      }\r
    };\r
\r
    const source = createTarget();\r
    const levels = Array.from({ length: BLOOM_LEVELS }, () => [createTarget(), createTarget()]);\r
    const sculpt = sculptProgram\r
      ? [0, 1].map(() => {\r
          const texture = createTexture(SCULPT_SIZE, SCULPT_SIZE, gl.RG16F, gl.REPEAT);\r
          const framebuffer = gl.createFramebuffer();\r
          gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
          gl.clearColor(0, 0, 0, 0);\r
          gl.clear(gl.COLOR_BUFFER_BIT);\r
          return { texture, framebuffer };\r
        })\r
      : null;\r
    const blank = createTexture(1, 1, gl.RGBA8, gl.REPEAT);\r
    const field: {\r
      texture: WebGLTexture | null;\r
      heights: WebGLTexture | null;\r
      framebuffer: WebGLFramebuffer | null;\r
      width: number;\r
      height: number;\r
    } = { texture: null, heights: null, framebuffer: gl.createFramebuffer(), width: 0, height: 0 };\r
    let sculptIndex = 0;\r
\r
    const reserveField = (width: number, height: number) => {\r
      if (field.texture && width <= field.width && height <= field.height) return;\r
      if (field.texture) gl.deleteTexture(field.texture);\r
      if (field.heights) gl.deleteTexture(field.heights);\r
      field.width = Math.max(width, Math.ceil(field.width * 1.25), 64);\r
      field.height = Math.max(height, Math.ceil(field.height * 1.25), 64);\r
      field.texture = createTexture(field.width, field.height, gl.RGBA16F, gl.CLAMP_TO_EDGE);\r
      field.heights = createTexture(field.width, field.height, gl.R32F, gl.CLAMP_TO_EDGE);\r
      gl.bindTexture(gl.TEXTURE_2D, field.heights);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, field.framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, field.texture, 0);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, field.heights, 0);\r
      gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);\r
    };\r
\r
    const bind = (unit: number, texture: WebGLTexture | null) => {\r
      gl.activeTexture(gl.TEXTURE0 + unit);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
    };\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const matrix = new Float32Array(16);\r
    const pulseData = new Float32Array(MAX_PULSES * 4);\r
    const glitchData = new Float32Array(12);\r
    const glitch = { until: 0, next: 1.5, roll: 0, seed: 0 };\r
    let entropy = 7919;\r
    const random = () => {\r
      entropy = (entropy * 16807) % 2147483647;\r
      return (entropy - 1) / 2147483646;\r
    };\r
    const pulses: Pulse[] = [];\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const view = { width: 1, height: 1, ratio: 1, cell: 0.05, cellKey: '' };\r
    const state: TopographyState = {\r
      intro: settingsRef.current.intro && !reduce ? 0 : 1,\r
      rise: 1,\r
      travelX: 0,\r
      travelZ: 0,\r
      morph: 0,\r
      yaw: 0,\r
      pitch: 0,\r
      yawVelocity: 0,\r
      pitchVelocity: 0,\r
      presence: 0,\r
      focus: ORBIT,\r
      hit: null,\r
      brushFrom: null,\r
      sculptLife: 0,\r
      burst: null,\r
      level: 0,\r
      trace: 0,\r
      clock: 0,\r
      tilt: settingsRef.current.tilt,\r
      elevation: settingsRef.current.elevation,\r
      scale: settingsRef.current.scale\r
    };\r
    state.rise = smoother(state.intro);\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let quiet = 0;\r
\r
    const camera = (): Frame => {\r
      const pitch = Math.min((state.tilt * Math.PI) / 180 + state.pitch, Math.PI / 2 - 1e-4);\r
      const frame = orient(state.yaw, pitch);\r
      const lift = state.elevation * HEIGHT * state.rise * 0.18;\r
      const clearance = state.elevation * HEIGHT * state.rise * 1.3 + 0.9;\r
      const distance = Math.max(ORBIT, (clearance - lift) / Math.sin(pitch));\r
      return {\r
        ...frame,\r
        distance,\r
        eye: [-frame.f[0] * distance, lift - frame.f[1] * distance, -frame.f[2] * distance]\r
      };\r
    };\r
\r
    const rayDirection = (cam: Frame, nx: number, ny: number) => {\r
      const aspect = view.width / view.height;\r
      const t = lens(aspect);\r
      const d = [0, 1, 2].map(i => cam.f[i] + cam.r[i] * nx * t * aspect + cam.u[i] * ny * t);\r
      const length = Math.hypot(d[0], d[1], d[2]);\r
      return d.map(v => v / length);\r
    };\r
\r
    const along = (cam: Frame, d: number[]) => d[0] * cam.f[0] + d[1] * cam.f[1] + d[2] * cam.f[2];\r
\r
    const groundDepth = (cam: Frame, ny: number) => {\r
      const d = rayDirection(cam, 0, ny);\r
      if (d[1] > -1e-3) return Infinity;\r
      return (cam.eye[1] / -d[1]) * along(cam, d);\r
    };\r
\r
    const nearRange = (cam: Frame, s: typeof settings) => [groundDepth(cam, -1) * 0.9, cam.distance, s.foreground];\r
\r
    const settleAt = (cam: Frame, near: number[], x: number, z: number) => {\r
      const depth = (x - cam.eye[0]) * cam.f[0] - cam.eye[1] * cam.f[1] + (z - cam.eye[2]) * cam.f[2];\r
      return near[2] + (1 - near[2]) * smoother((depth - near[0]) / Math.max(near[1] - near[0], 1e-3));\r
    };\r
\r
    const pick = (cam: Frame, s: typeof settings, nx: number, ny: number): Hit | null => {\r
      const d = rayDirection(cam, nx, ny);\r
      const height = state.elevation * HEIGHT * state.rise;\r
      const frequency = FREQUENCY / state.scale;\r
      const near = nearRange(cam, s);\r
      const above = (distance: number) => {\r
        const x = cam.eye[0] + d[0] * distance;\r
        const z = cam.eye[2] + d[2] * distance;\r
        const ground = relief(state.travelX + x, state.travelZ + z, frequency, state.morph * 0.37, state.morph * 0.23);\r
        return cam.eye[1] + d[1] * distance - ground * height * settleAt(cam, near, x, z);\r
      };\r
      let distance = NEAR;\r
      let gap = above(distance);\r
      for (let i = 0; i < 200 && distance < FAR * 0.5; i++) {\r
        const next = distance + Math.max(0.02, gap * 0.4);\r
        const value = above(next);\r
        if (value < 0) {\r
          let lo = distance;\r
          let hi = next;\r
          for (let k = 0; k < 10; k++) {\r
            const mid = (lo + hi) * 0.5;\r
            if (above(mid) < 0) hi = mid;\r
            else lo = mid;\r
          }\r
          return {\r
            x: state.travelX + cam.eye[0] + d[0] * hi,\r
            y: cam.eye[1] + d[1] * hi,\r
            z: state.travelZ + cam.eye[2] + d[2] * hi,\r
            depth: hi * along(cam, d)\r
          };\r
        }\r
        distance = next;\r
        gap = value;\r
      }\r
      return null;\r
    };\r
\r
    const footprint = (cam: Frame, s: typeof settings, fadeEnd: number) => {\r
      const ceiling = state.elevation * HEIGHT * state.rise * 1.7 + 0.2 + s.mouseStrength;\r
      const box: Box = { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity, near: Infinity };\r
      const add = (d: number[], distance: number) => {\r
        const x = cam.eye[0] + d[0] * distance;\r
        const z = cam.eye[2] + d[2] * distance;\r
        box.minX = Math.min(box.minX, x);\r
        box.maxX = Math.max(box.maxX, x);\r
        box.minZ = Math.min(box.minZ, z);\r
        box.maxZ = Math.max(box.maxZ, z);\r
      };\r
      for (const nx of [-1.08, 0, 1.08]) {\r
        for (const ny of [-1.08, 1.08]) {\r
          const d = rayDirection(cam, nx, ny);\r
          const forward = Math.max(along(cam, d), 1e-3);\r
          let near = NEAR;\r
          let far = (fadeEnd * 1.05) / forward;\r
          if (d[1] < -1e-4) {\r
            near = Math.max(NEAR, (cam.eye[1] - ceiling) / -d[1]);\r
            far = Math.min(far, cam.eye[1] / -d[1]);\r
          }\r
          near = Math.min(near, far);\r
          add(d, near);\r
          add(d, far);\r
          box.near = Math.min(box.near, near * forward);\r
        }\r
      }\r
      return box;\r
    };\r
\r
    const grid = (box: Box, cell: number) => {\r
      const camX = Math.floor(state.travelX / cell);\r
      const camZ = Math.floor(state.travelZ / cell);\r
      const fracX = state.travelX - camX * cell;\r
      const fracZ = state.travelZ - camZ * cell;\r
      const k0 = Math.floor((box.minX + fracX) / cell) - 2;\r
      const m0 = Math.floor((box.minZ + fracZ) / cell) - 2;\r
      const columns = clamp(Math.ceil((box.maxX + fracX) / cell) + 2 - k0, 1, 4000);\r
      const rows = clamp(Math.ceil((box.maxZ + fracZ) / cell) + 2 - m0, 1, Math.floor((MAX_CELLS * 1.5) / columns));\r
      return { cell, camX, camZ, fracX, fracZ, k0, m0, columns, rows };\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const cam = camera();\r
      viewProjection(cam, view.width / view.height, matrix);\r
\r
      const bottom = groundDepth(cam, -1);\r
      const top = Math.min(groundDepth(cam, 1), cam.distance * 3.2);\r
      const horizon = Math.max(top, bottom * 1.6, cam.distance * 1.4);\r
      const fadeEnd = horizon + (bottom * 1.8 - horizon) * s.fog;\r
      const fadeStart = fadeEnd * 0.7 + (bottom * 0.7 - fadeEnd * 0.7) * s.fog;\r
      const box = footprint(cam, s, fadeEnd);\r
\r
      const cellKey = \`\${view.width}x\${view.height}@\${view.ratio}|\${Math.round(state.tilt / 4)}|\${Math.round(state.elevation * 5)}|\${s.fog}\`;\r
      if (cellKey !== view.cellKey) {\r
        view.cellKey = cellKey;\r
        const focal = (view.height * view.ratio * 0.5) / lens(view.width / view.height);\r
        let cell = clamp((14 * Math.max(box.near, 0.5)) / focal, 0.02, 0.4);\r
        const cells = ((box.maxX - box.minX) * (box.maxZ - box.minZ)) / (cell * cell);\r
        if (cells > MAX_CELLS) cell *= Math.sqrt(cells / MAX_CELLS);\r
        view.cell = cell;\r
      }\r
\r
      const color = toRgb(s.color);\r
      const height = state.elevation * HEIGHT * state.rise;\r
      const layout = grid(box, view.cell);\r
      const near = nearRange(cam, s);\r
      const dots = s.markers >= 0 ? grid(box, MARKER_SPACING) : null;\r
      const touch = state.hit && s.mouseInteraction ? state.presence : 0;\r
      const heatStrength = touch * (0.35 + 0.5 * s.mouseStrength);\r
      const focusScale = s.depthOfField * view.height * 0.016;\r
      const reveal = smoother(state.intro / 0.35);\r
      const hitX = state.hit ? state.hit.x : 0;\r
      const hitZ = state.hit ? state.hit.z : 0;\r
\r
      pulseData.fill(0);\r
      pulses.forEach((p, i) => {\r
        pulseData.set([p.x, p.z, p.age * 4.2, Math.exp(-p.age * 1.1) * smoother(p.age / 0.08)], i * 4);\r
      });\r
\r
      gl.bindVertexArray(vao);\r
      if (fieldProgram) {\r
        const width = layout.columns + 7;\r
        const height2 = layout.rows + 7;\r
        reserveField(width, height2);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, field.framebuffer);\r
        gl.viewport(0, 0, width, height2);\r
        gl.useProgram(fieldProgram.program);\r
        const f = fieldProgram.uniforms;\r
        bind(0, sculpt ? sculpt[sculptIndex].texture : blank);\r
        gl.uniform1i(f.uSculpt, 0);\r
        gl.uniform1f(f.uSculptOn, sculpt ? 1 : 0);\r
        gl.uniform1f(f.uFrequency, FREQUENCY / state.scale);\r
        gl.uniform2f(f.uMorph, state.morph * 0.37, state.morph * 0.23);\r
        gl.uniform4fv(f.uPulses, pulseData);\r
        gl.uniform2i(f.uBase, layout.k0 - 2 + layout.camX, layout.m0 - 2 + layout.camZ);\r
        gl.uniform1f(f.uCell, layout.cell);\r
        gl.uniform1f(f.uDetail, s.detail);\r
        gl.disable(gl.DEPTH_TEST);\r
        gl.disable(gl.BLEND);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      }\r
\r
      const drawTerrain = (pixel: number, width: number, targetHeight: number, stride: number) => {\r
        gl.viewport(0, 0, width, targetHeight);\r
        gl.useProgram(terrain.program);\r
        const u = terrain.uniforms;\r
        bind(0, fieldProgram ? field.texture : blank);\r
        gl.uniform1i(u.uField, 0);\r
        bind(1, fieldProgram ? field.heights : blank);\r
        gl.uniform1i(u.uHeightField, 1);\r
        gl.uniform1f(u.uFrequency, FREQUENCY / state.scale);\r
        gl.uniform2f(u.uMorph, state.morph * 0.37, state.morph * 0.23);\r
        gl.uniform4fv(u.uPulses, pulseData);\r
        gl.uniform2i(u.uOrigin, layout.k0, layout.m0);\r
        gl.uniform2i(u.uCamCell, layout.camX, layout.camZ);\r
        gl.uniform2f(u.uCamFrac, layout.fracX, layout.fracZ);\r
        gl.uniform1f(u.uCell, layout.cell);\r
        gl.uniform1i(u.uStride, stride);\r
        gl.uniform1f(u.uHeight, height);\r
        gl.uniform3fv(u.uEye, cam.eye);\r
        gl.uniform3fv(u.uForward, cam.f);\r
        gl.uniform3fv(u.uNear, near);\r
        gl.uniform1f(u.uRefDepth, cam.distance);\r
        gl.uniformMatrix4fv(u.uViewProj, false, matrix);\r
        gl.uniform1f(u.uDetail, s.detail);\r
        gl.uniform1f(u.uLines, s.lineCount);\r
        gl.uniform1f(u.uLineWidth, s.lineWidth * pixel);\r
        gl.uniform1f(u.uMajor, s.majorLines ? 1 : 0);\r
        gl.uniform3fv(u.uColor, color);\r
        gl.uniform1f(u.uBrightness, s.brightness);\r
        gl.uniform2f(u.uFade, fadeStart, fadeEnd);\r
        gl.uniform3f(u.uFocus, state.focus, focusScale * pixel, view.height * 0.03 * pixel);\r
        gl.uniform4f(u.uHeat, hitX, hitZ, 0.9 * s.mouseRadius, heatStrength);\r
        gl.uniform4f(u.uLamp, hitX, state.hit ? state.hit.y + 1.4 : 0, hitZ, heatStrength);\r
        gl.uniform4f(u.uTrace, state.level, state.trace, hitX, hitZ);\r
        gl.uniform3fv(u.uSun, SUN);\r
        gl.uniform1f(u.uReveal, reveal);\r
        gl.uniform1f(u.uLightMode, s.lightMode ? 1 : 0);\r
        gl.uniform1f(u.uOpacity, s.opacity);\r
        gl.uniform4fv(u.uGlitch, glitchData);\r
        gl.uniform1f(u.uGlitchSeed, glitch.seed);\r
        gl.uniform1f(u.uPixel, pixel);\r
        gl.enable(gl.DEPTH_TEST);\r
        gl.depthFunc(gl.LESS);\r
        gl.disable(gl.BLEND);\r
        gl.clearColor(0, 0, 0, 0);\r
        gl.clearDepth(1);\r
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);\r
        gl.drawArraysInstanced(\r
          gl.TRIANGLE_STRIP,\r
          0,\r
          2 * (Math.ceil(layout.columns / stride) + 1),\r
          Math.ceil(layout.rows / stride)\r
        );\r
        if (dots) {\r
          gl.useProgram(markerProgram.program);\r
          const m = markerProgram.uniforms;\r
          bind(2, sculpt ? sculpt[sculptIndex].texture : blank);\r
          gl.uniform1i(m.uSculpt, 2);\r
          gl.uniform1f(m.uSculptOn, sculpt ? 1 : 0);\r
          gl.uniform1f(m.uFrequency, FREQUENCY / state.scale);\r
          gl.uniform2f(m.uMorph, state.morph * 0.37, state.morph * 0.23);\r
          gl.uniform4fv(m.uPulses, pulseData);\r
          gl.uniform3fv(m.uEye, cam.eye);\r
          gl.uniform3fv(m.uForward, cam.f);\r
          gl.uniform3fv(m.uNear, near);\r
          gl.uniform2i(m.uOrigin, dots.k0, dots.m0);\r
          gl.uniform2i(m.uCamCell, dots.camX, dots.camZ);\r
          gl.uniform2f(m.uCamFrac, dots.fracX, dots.fracZ);\r
          gl.uniform1f(m.uSpacing, dots.cell);\r
          gl.uniform1i(m.uColumns, dots.columns + 1);\r
          gl.uniform1f(m.uHeight, height);\r
          gl.uniformMatrix4fv(m.uViewProj, false, matrix);\r
          gl.uniform2f(m.uView, width, targetHeight);\r
          gl.uniform1f(m.uSize, 4 * pixel);\r
          gl.uniform1f(m.uRefDepth, cam.distance);\r
          gl.uniform4f(m.uHeat, hitX, hitZ, 1.2 * s.mouseRadius, heatStrength);\r
          gl.uniform1f(m.uTime, state.clock);\r
          gl.uniform4fv(m.uGlitch, glitchData);\r
          gl.uniform1f(m.uPixel, pixel);\r
          gl.uniform3fv(m.uColor, color);\r
          gl.uniform2f(m.uFade, fadeStart, fadeEnd);\r
          gl.uniform1f(m.uReveal, reveal);\r
          gl.uniform1f(m.uBrightness, s.brightness);\r
          gl.uniform1f(m.uLightMode, s.lightMode ? 1 : 0);\r
          gl.uniform1f(m.uOpacity, s.opacity);\r
          gl.uniform1f(m.uStyle, s.markers);\r
          gl.depthFunc(gl.LEQUAL);\r
          gl.depthMask(false);\r
          gl.enable(gl.BLEND);\r
          gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
          gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, (dots.columns + 1) * (dots.rows + 1));\r
          gl.disable(gl.BLEND);\r
          gl.depthMask(true);\r
        }\r
        gl.disable(gl.DEPTH_TEST);\r
      };\r
\r
      const bloom = s.glow > 0.001;\r
      if (bloom) {\r
        const width = Math.max(1, Math.round(view.width / 2));\r
        const targetHeight = Math.max(1, Math.round(view.height / 2));\r
        allocate(source, width, targetHeight, true);\r
        levels.forEach((pair, index) => {\r
          const w = Math.max(1, Math.round(view.width / 2 ** (index + 2)));\r
          const h = Math.max(1, Math.round(view.height / 2 ** (index + 2)));\r
          allocate(pair[0], w, h, false);\r
          allocate(pair[1], w, h, false);\r
        });\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, source.framebuffer);\r
        drawTerrain(0.5, width, targetHeight, 2);\r
        let from = source;\r
        levels.forEach(([front, back]) => {\r
          gl.bindFramebuffer(gl.FRAMEBUFFER, front.framebuffer);\r
          gl.viewport(0, 0, front.width, front.height);\r
          gl.useProgram(downProgram.program);\r
          bind(0, from.texture);\r
          gl.uniform1i(downProgram.uniforms.uSource, 0);\r
          gl.uniform2f(downProgram.uniforms.uTarget, front.width, front.height);\r
          gl.uniform2f(downProgram.uniforms.uTexel, 1 / from.width, 1 / from.height);\r
          gl.drawArrays(gl.TRIANGLES, 0, 3);\r
          gl.useProgram(blurProgram.program);\r
          gl.uniform1i(blurProgram.uniforms.uSource, 0);\r
          gl.uniform2f(blurProgram.uniforms.uTarget, back.width, back.height);\r
          gl.bindFramebuffer(gl.FRAMEBUFFER, back.framebuffer);\r
          bind(0, front.texture);\r
          gl.uniform2f(blurProgram.uniforms.uStep, 1 / front.width, 0);\r
          gl.drawArrays(gl.TRIANGLES, 0, 3);\r
          gl.bindFramebuffer(gl.FRAMEBUFFER, front.framebuffer);\r
          bind(0, back.texture);\r
          gl.uniform2f(blurProgram.uniforms.uStep, 0, 1 / back.height);\r
          gl.drawArrays(gl.TRIANGLES, 0, 3);\r
          from = front;\r
        });\r
      }\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      drawTerrain(view.ratio, canvas.width, canvas.height, 1);\r
\r
      if (bloom) {\r
        gl.viewport(0, 0, canvas.width, canvas.height);\r
        gl.useProgram(compositeProgram.program);\r
        const c = compositeProgram.uniforms;\r
        levels.forEach(([front], index) => {\r
          bind(index, front.texture);\r
          gl.uniform1i(c[\`uBloom\${index}\`], index);\r
        });\r
        gl.uniform2f(c.uView, canvas.width, canvas.height);\r
        gl.uniform1f(c.uGlow, s.glow * reveal);\r
        gl.uniform1f(c.uLightMode, s.lightMode ? 1 : 0);\r
        gl.enable(gl.BLEND);\r
        if (s.lightMode) gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
        else gl.blendFunc(gl.ONE, gl.ONE);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
        gl.disable(gl.BLEND);\r
      }\r
      for (let unit = BLOOM_LEVELS; unit >= 0; unit--) bind(unit, null);\r
    };\r
\r
    const updateSculpt = (s: typeof settings, dt: number) => {\r
      if (!sculpt || !sculptProgram) return false;\r
      const brush = s.mouseInteraction && s.hoverEffect === 'lift' && state.presence > 0.001 ? state.hit : null;\r
      const burst = state.burst;\r
      if (!brush && !burst && state.sculptLife <= 0) return false;\r
      const from = state.brushFrom || brush;\r
      const read = sculpt[sculptIndex];\r
      const write = sculpt[1 - sculptIndex];\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, write.framebuffer);\r
      gl.viewport(0, 0, SCULPT_SIZE, SCULPT_SIZE);\r
      gl.useProgram(sculptProgram.program);\r
      const u = sculptProgram.uniforms;\r
      bind(0, read.texture);\r
      gl.uniform1i(u.uPrevious, 0);\r
      if (brush && from) gl.uniform4f(u.uSegment, from.x, from.z, brush.x, brush.z);\r
      else gl.uniform4f(u.uSegment, 0, 0, 0, 0);\r
      gl.uniform4f(\r
        u.uBrush,\r
        1.1 * s.mouseRadius,\r
        0.9 * s.mouseStrength,\r
        1 - Math.exp(-dt * 7),\r
        brush ? state.presence : 0\r
      );\r
      if (burst) {\r
        const before = smoother(burst.age / 0.7);\r
        burst.age += dt;\r
        const amount = (smoother(burst.age / 0.7) - before) * 0.9 * Math.max(s.mouseStrength, 0.3);\r
        gl.uniform4f(u.uBurst, burst.x, burst.z, 1.6 * s.mouseRadius, amount);\r
        if (burst.age >= 0.7) state.burst = null;\r
      } else {\r
        gl.uniform4f(u.uBurst, 0, 0, 1, 0);\r
      }\r
      const tau = 0.25 + 3 * s.trail * s.trail;\r
      gl.uniform2f(u.uDecay, Math.exp(-dt / tau), Math.exp(-dt / 0.7));\r
      gl.disable(gl.BLEND);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      sculptIndex = 1 - sculptIndex;\r
      state.brushFrom = brush ? { x: brush.x, z: brush.z } : null;\r
      if (brush || burst) state.sculptLife = tau * 6;\r
      else state.sculptLife -= dt;\r
      return true;\r
    };\r
\r
    let sizedDpr = settingsRef.current.dpr;\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      sizedDpr = s.dpr;\r
      view.width = Math.max(1, container.clientWidth);\r
      view.height = Math.max(1, container.clientHeight);\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(view.width * view.ratio));\r
      canvas.height = Math.max(1, Math.round(view.height * view.ratio));\r
      render();\r
      wake();\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      if (s.dpr !== sizedDpr) resize();\r
      const dt = last ? clamp((now - last) / 1000, 0, 1 / 20) : 1 / 60;\r
      last = now;\r
\r
      if (!s.intro || reduce) state.intro = 1;\r
      else if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / INTRO_SECONDS);\r
      state.rise = smoother(state.intro);\r
      const ease = reduce ? 1 : 1 - Math.exp(-dt / 0.4);\r
      state.tilt += (s.tilt - state.tilt) * ease;\r
      state.elevation += (s.elevation - state.elevation) * ease;\r
      state.scale = s.scale;\r
\r
      state.clock += dt;\r
      const glitching = reduce ? 0 : s.glitch;\r
      if (glitching > 0) {\r
        if (state.clock >= glitch.next && state.clock >= glitch.until) {\r
          glitch.until = state.clock + 0.1 + random() * 0.22 * (0.5 + glitching);\r
          glitch.next = glitch.until + (9 - 7.4 * glitching) * (0.45 + random() * 1.1);\r
          glitch.roll = 0;\r
        }\r
        if (state.clock < glitch.until) {\r
          if (state.clock >= glitch.roll) {\r
            glitchData.fill(0);\r
            const count = 1 + Math.floor(random() * 3);\r
            for (let i = 0; i < count; i++) {\r
              const band = 3 + random() * random() * view.height * 0.14;\r
              const y = random() * view.height;\r
              const shift = (random() - 0.5) * 2 * (10 + 46 * glitching);\r
              glitchData.set([y, y + band, shift, 1 + random() * 3 * glitching], i * 4);\r
            }\r
            glitch.seed = random();\r
            glitch.roll = state.clock + 0.04 + random() * 0.05;\r
          }\r
        } else glitchData.fill(0);\r
      } else glitchData.fill(0);\r
\r
      if (!reduce) {\r
        state.travelX += s.direction[0] * s.speed * 0.8 * dt;\r
        state.travelZ += s.direction[1] * s.speed * 0.8 * dt;\r
        state.morph += s.morph * 0.12 * dt;\r
      }\r
\r
      const engaged = pointer.inside && s.mouseInteraction;\r
      state.presence += ((engaged ? 1 : 0) - state.presence) * (1 - Math.exp(-dt / (engaged ? 0.18 : 0.45)));\r
\r
      const nx = (pointer.x / view.width) * 2 - 1;\r
      const ny = 1 - (pointer.y / view.height) * 2;\r
      const lean = reduce || !engaged ? 0 : s.parallax;\r
      const targetYaw = nx * lean * 0.09;\r
      const targetPitch = -ny * lean * 0.045;\r
      state.yawVelocity += (38 * (targetYaw - state.yaw) - 11 * state.yawVelocity) * dt;\r
      state.pitchVelocity += (38 * (targetPitch - state.pitch) - 11 * state.pitchVelocity) * dt;\r
      state.yaw += state.yawVelocity * dt;\r
      state.pitch += state.pitchVelocity * dt;\r
\r
      const cam = camera();\r
      if (engaged) {\r
        state.hit = pick(cam, s, nx, ny);\r
        if (state.hit && state.brushFrom) {\r
          const jump = Math.hypot(state.hit.x - state.brushFrom.x, state.hit.z - state.brushFrom.z);\r
          if (jump > 3 * s.mouseRadius) state.brushFrom = null;\r
        }\r
      } else if (state.presence < 0.002) {\r
        state.hit = null;\r
        state.brushFrom = null;\r
      }\r
\r
      const tracing = state.hit && s.mouseInteraction && s.hoverEffect === 'trace' ? state.presence : 0;\r
      if (state.hit) {\r
        const frequency = FREQUENCY / state.scale;\r
        const target =\r
          relief(state.hit.x, state.hit.z, frequency, state.morph * 0.37, state.morph * 0.23) +\r
          s.detail * 0.1 * fineDetail(state.hit.x, state.hit.z, frequency);\r
        state.level = state.trace < 0.01 ? target : state.level + (target - state.level) * (1 - Math.exp(-dt / 0.09));\r
      }\r
      state.trace += (tracing - state.trace) * (1 - Math.exp(-dt / 0.2));\r
\r
      const focusTarget = state.hit && s.depthOfField > 0 ? state.hit.depth : cam.distance;\r
      state.focus += (focusTarget - state.focus) * (1 - Math.exp(-dt / 0.35));\r
\r
      for (let i = pulses.length - 1; i >= 0; i--) {\r
        pulses[i].age += dt;\r
        if (pulses[i].age > 4) pulses.splice(i, 1);\r
      }\r
\r
      const sculpting = updateSculpt(s, dt);\r
      render();\r
\r
      const settling =\r
        Math.abs(s.tilt - state.tilt) > 0.01 ||\r
        Math.abs(s.elevation - state.elevation) > 1e-4 ||\r
        Math.abs(state.yaw - targetYaw) > 1e-4 ||\r
        Math.abs(state.pitch - targetPitch) > 1e-4 ||\r
        Math.abs(state.yawVelocity) > 1e-4 ||\r
        Math.abs(state.pitchVelocity) > 1e-4 ||\r
        Math.abs(focusTarget - state.focus) > 1e-3 ||\r
        Math.abs(tracing - state.trace) > 1e-3;\r
      const busy =\r
        (!reduce && (s.speed !== 0 || s.morph !== 0 || s.glitch > 0 || s.markers >= 0)) ||\r
        state.intro < 1 ||\r
        pulses.length > 0 ||\r
        sculpting ||\r
        settling ||\r
        (state.presence > 0.001 && state.presence < 0.999);\r
      quiet = busy ? 0 : quiet + dt;\r
      if (quiet < 0.5) raf = requestAnimationFrame(frame);\r
    };\r
\r
    function wake() {\r
      quiet = 0;\r
      if (!raf && visible && !document.hidden) {\r
        last = 0;\r
        raf = requestAnimationFrame(frame);\r
      }\r
    }\r
\r
    const locate = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const { x, y, inside } = locate(event);\r
      const was = pointer.inside;\r
      pointer.inside = inside;\r
      if (inside) {\r
        pointer.x = x;\r
        pointer.y = y;\r
      }\r
      if (inside || was) wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      const { x, y, inside } = locate(event);\r
      if (!inside) return;\r
      pointer.x = x;\r
      pointer.y = y;\r
      pointer.inside = true;\r
      wake();\r
      if (s.glitch > 0 && !reduce) {\r
        glitch.until = state.clock + 0.16;\r
        glitch.roll = 0;\r
      }\r
      if (!s.mouseInteraction || (s.clickEffect !== 'pulse' && s.clickEffect !== 'peak')) return;\r
      const hit = pick(camera(), s, (x / view.width) * 2 - 1, 1 - (y / view.height) * 2);\r
      if (!hit) return;\r
      if (s.clickEffect === 'peak' && sculpt) {\r
        state.burst = { x: hit.x, z: hit.z, age: 0 };\r
      } else if (s.clickEffect === 'pulse') {\r
        if (pulses.length >= MAX_PULSES) pulses.shift();\r
        pulses.push({ x: hit.x, z: hit.z, age: 0 });\r
      }\r
    };\r
\r
    const onPointerUp = (event: PointerEvent) => {\r
      if (event.pointerType !== 'touch') return;\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
    const onVisibility = () => wake();\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(container);\r
    const intersection = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible) wake();\r
    });\r
    intersection.observe(container);\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    window.addEventListener('pointerup', onPointerUp, { passive: true });\r
    window.addEventListener('pointercancel', onPointerUp, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
    wakeRef.current = wake;\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('pointerup', onPointerUp);\r
      window.removeEventListener('pointercancel', onPointerUp);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      canvas.removeEventListener('webglcontextlost', onContextLost);\r
      canvas.removeEventListener('webglcontextrestored', onContextRestored);\r
      [source, ...levels.flat()].forEach(target => {\r
        if (target.texture) gl.deleteTexture(target.texture);\r
        if (target.depth) gl.deleteRenderbuffer(target.depth);\r
        gl.deleteFramebuffer(target.framebuffer);\r
      });\r
      sculpt?.forEach(target => {\r
        gl.deleteTexture(target.texture);\r
        gl.deleteFramebuffer(target.framebuffer);\r
      });\r
      gl.deleteTexture(blank);\r
      gl.deleteVertexArray(vao);\r
      if (field.texture) gl.deleteTexture(field.texture);\r
      if (field.heights) gl.deleteTexture(field.heights);\r
      gl.deleteFramebuffer(field.framebuffer);\r
      [terrain, fieldProgram, sculptProgram, downProgram, blurProgram, compositeProgram, markerProgram].forEach(\r
        program => program && gl.deleteProgram(program.program)\r
      );\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
    };\r
  }, [generation]);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div ref={containerRef} className={\`topography-container \${className}\`.trim()} style={style}>\r
      <canvas ref={canvasRef} className="topography-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Topography;\r
`,o=`'use client';\r
\r
import { useEffect, useRef, useState, type CSSProperties } from 'react';\r
\r
const FOV = 0.32;\r
const ORBIT = 9;\r
const NEAR = 0.05;\r
const FAR = 160;\r
const HEIGHT = 1.7;\r
const FREQUENCY = 0.45;\r
const INTRO_SECONDS = 2.8;\r
const MAX_PULSES = 4;\r
const BLOOM_LEVELS = 4;\r
const SCULPT_SIZE = 256;\r
const SCULPT_SPAN = 48;\r
const MAX_CELLS = 200000;\r
const SUN = [-0.81, 0.58, -0.02];\r
export type TopographyDirection = 'forward' | 'backward' | 'left' | 'right';\r
export type TopographyHoverEffect = 'lift' | 'trace' | 'light';\r
export type TopographyClickEffect = 'pulse' | 'peak' | 'none';\r
export type TopographyMarkers = 'none' | 'plus' | 'dots';\r
\r
export interface TopographyProps {\r
  color?: string;\r
  lineCount?: number;\r
  lineWidth?: number;\r
  majorLines?: boolean;\r
  elevation?: number;\r
  foreground?: number;\r
  scale?: number;\r
  detail?: number;\r
  tilt?: number;\r
  speed?: number;\r
  direction?: TopographyDirection;\r
  morph?: number;\r
  glow?: number;\r
  depthOfField?: number;\r
  fog?: number;\r
  brightness?: number;\r
  opacity?: number;\r
  mouseInteraction?: boolean;\r
  hoverEffect?: TopographyHoverEffect;\r
  mouseRadius?: number;\r
  mouseStrength?: number;\r
  trail?: number;\r
  parallax?: number;\r
  clickEffect?: TopographyClickEffect;\r
  markers?: TopographyMarkers;\r
  glitch?: number;\r
  intro?: boolean;\r
  lightMode?: boolean;\r
  dpr?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Program {\r
  program: WebGLProgram;\r
  uniforms: Record<string, WebGLUniformLocation | null>;\r
}\r
\r
interface Target {\r
  texture: WebGLTexture | null;\r
  framebuffer: WebGLFramebuffer | null;\r
  depth: WebGLRenderbuffer | null;\r
  width: number;\r
  height: number;\r
}\r
\r
interface Frame {\r
  f: number[];\r
  r: number[];\r
  u: number[];\r
  eye: number[];\r
  distance: number;\r
}\r
\r
interface Hit {\r
  x: number;\r
  y: number;\r
  z: number;\r
  depth: number;\r
}\r
\r
interface Box {\r
  minX: number;\r
  maxX: number;\r
  minZ: number;\r
  maxZ: number;\r
  near: number;\r
}\r
\r
interface Pulse {\r
  x: number;\r
  z: number;\r
  age: number;\r
}\r
\r
interface TopographyState {\r
  intro: number;\r
  rise: number;\r
  travelX: number;\r
  travelZ: number;\r
  morph: number;\r
  yaw: number;\r
  pitch: number;\r
  yawVelocity: number;\r
  pitchVelocity: number;\r
  presence: number;\r
  focus: number;\r
  hit: Hit | null;\r
  brushFrom: { x: number; z: number } | null;\r
  sculptLife: number;\r
  burst: Pulse | null;\r
  level: number;\r
  trace: number;\r
  clock: number;\r
  tilt: number;\r
  elevation: number;\r
  scale: number;\r
}\r
\r
const DIRECTIONS: Record<string, number[]> = { forward: [0, 1], backward: [0, -1], left: [-1, 0], right: [1, 0] };\r
const HOVER_EFFECTS = ['lift', 'trace', 'light'];\r
const MARKER_STYLES: Record<string, number> = { plus: 0, dots: 1 };\r
const MARKER_SPACING = 1.25;\r
\r
const COMMON = \`\r
precision highp float;\r
precision highp int;\r
\r
uniform float uFrequency;\r
uniform vec2 uMorph;\r
uniform sampler2D uSculpt;\r
uniform float uSculptOn;\r
uniform vec4 uPulses[\${MAX_PULSES}];\r
uniform vec3 uEye;\r
uniform vec3 uForward;\r
uniform vec3 uNear;\r
\r
uint lattice(ivec2 p) {\r
  uvec2 q = uvec2(p + 1073741824);\r
  uint h = q.x * 2654435761u + q.y * 2246822519u;\r
  h = (h ^ (h >> 15u)) * 739982445u;\r
  h = (h ^ (h >> 12u)) * 695872825u;\r
  return h ^ (h >> 15u);\r
}\r
\r
float corner(ivec2 c, vec2 f) {\r
  uint h = lattice(c);\r
  vec2 g = vec2(float(h & 65535u), float(h >> 16u)) / 32767.5 - 1.0;\r
  return dot(g, f);\r
}\r
\r
float noise(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = p - i;\r
  ivec2 c = ivec2(i);\r
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);\r
  float a = corner(c, f);\r
  float b = corner(c + ivec2(1, 0), f - vec2(1.0, 0.0));\r
  float d = corner(c + ivec2(0, 1), f - vec2(0.0, 1.0));\r
  float e = corner(c + ivec2(1, 1), f - vec2(1.0, 1.0));\r
  return mix(mix(a, b, u.x), mix(d, e, u.x), u.y);\r
}\r
\r
vec2 octave(vec2 p, vec2 shift) {\r
  return vec2(1.6 * p.x - 1.2 * p.y, 1.2 * p.x + 1.6 * p.y) + shift;\r
}\r
\r
float relief(vec2 t) {\r
  vec2 p = t * uFrequency;\r
  vec2 w = vec2(noise(p * 0.42 + uMorph), noise(p * 0.42 - uMorph.yx + vec2(5.2, 1.3)));\r
  p += w * 0.8;\r
  float n = noise(p) * 0.55;\r
  p = octave(p, vec2(7.1, 3.7));\r
  n += noise(p) * 0.15;\r
  p = octave(p, vec2(1.9, 8.3));\r
  n += noise(p) * 0.04;\r
  float s = log(1.0 + exp(7.0 * (3.0 * n + 0.05))) / 7.0;\r
  return s * s * 1.4 + 0.1 * n;\r
}\r
\r
float swell(vec2 t) {\r
  float lift = 0.0;\r
  for (int i = 0; i < \${MAX_PULSES}; i++) {\r
    vec4 p = uPulses[i];\r
    if (p.w <= 0.0) continue;\r
    float x = (length(t - p.xy) - p.z) / (0.28 + p.z * 0.05);\r
    lift += exp(-x * x) * p.w;\r
  }\r
  return lift;\r
}\r
\r
vec4 sculpted(vec2 t) {\r
  return uSculptOn > 0.5 ? textureLod(uSculpt, t / \${SCULPT_SPAN}.0, 0.0) : vec4(0.0);\r
}\r
\r
float settle(vec2 world) {\r
  float depth = dot(vec3(world.x, 0.0, world.y) - uEye, uForward);\r
  float x = clamp((depth - uNear.x) / max(uNear.y - uNear.x, 1e-3), 0.0, 1.0);\r
  return mix(uNear.z, 1.0, x * x * x * (x * (x * 6.0 - 15.0) + 10.0));\r
}\r
\`;\r
\r
const FIELD = \`#version 300 es\r
\${COMMON}\r
uniform ivec2 uBase;\r
uniform float uCell;\r
uniform float uDetail;\r
layout(location = 0) out vec4 outField;\r
layout(location = 1) out vec4 outHeight;\r
\r
void main() {\r
  vec2 t = vec2(uBase + ivec2(gl_FragCoord.xy)) * uCell;\r
  vec4 carved = sculpted(t);\r
  float ring = swell(t);\r
  float ground = relief(t) + carved.r + ring * 0.14;\r
  vec2 dp = t * uFrequency * 5.0 + vec2(13.1, 4.7);\r
  float fine = noise(dp) * 0.6 + noise(octave(dp, vec2(2.3, 6.1))) * 0.3;\r
  outField = vec4(carved.g, ring, ground, carved.r);\r
  outHeight = vec4(ground + uDetail * 0.1 * fine, 0.0, 0.0, 1.0);\r
}\`;\r
\r
const terrainVertex = (baked: boolean) => \`#version 300 es\r
#define BAKED \${baked ? 1 : 0}\r
\${COMMON}\r
uniform sampler2D uField;\r
uniform ivec2 uOrigin;\r
uniform ivec2 uCamCell;\r
uniform vec2 uCamFrac;\r
uniform float uCell;\r
uniform int uStride;\r
uniform float uHeight;\r
uniform mat4 uViewProj;\r
out vec2 vTexel;\r
out vec2 vTerrain;\r
out float vDepth;\r
out float vLift;\r
out vec3 vNormal;\r
\r
float ground(vec2 t) {\r
  return relief(t) + swell(t) * 0.14;\r
}\r
\r
void main() {\r
  ivec2 step = ivec2(gl_VertexID >> 1, gl_InstanceID + (gl_VertexID & 1)) * uStride;\r
  ivec2 local = uOrigin + step;\r
  vec2 terrain = vec2(local + uCamCell) * uCell;\r
  vec2 world = vec2(local) * uCell - uCamFrac;\r
  float k = settle(world);\r
#if BAKED\r
  ivec2 texel = step + 2;\r
  vec4 c = texelFetch(uField, texel, 0);\r
  vec4 l = texelFetch(uField, texel - ivec2(1, 0), 0);\r
  vec4 r = texelFetch(uField, texel + ivec2(1, 0), 0);\r
  vec4 d = texelFetch(uField, texel - ivec2(0, 1), 0);\r
  vec4 u = texelFetch(uField, texel + ivec2(0, 1), 0);\r
  float h = (c.b - c.a) * k + c.a;\r
  float dx = (l.b - l.a - r.b + r.a) * k + l.a - r.a;\r
  float dz = (d.b - d.a - u.b + u.a) * k + d.a - u.a;\r
  vNormal = vec3(dx * uHeight / (2.0 * uCell), 1.0, dz * uHeight / (2.0 * uCell));\r
  vTexel = vec2(texel) + 0.5;\r
#else\r
  float h = ground(terrain) * k;\r
  float hx = ground(terrain + vec2(0.04, 0.0)) * k;\r
  float hz = ground(terrain + vec2(0.0, 0.04)) * k;\r
  vNormal = vec3((h - hx) * uHeight / 0.04, 1.0, (h - hz) * uHeight / 0.04);\r
  vTexel = vec2(0.0);\r
#endif\r
  vec4 clip = uViewProj * vec4(world.x, h * uHeight, world.y, 1.0);\r
  gl_Position = clip;\r
  vTerrain = terrain;\r
  vDepth = clip.w;\r
  vLift = h * uHeight;\r
}\`;\r
\r
const terrainFragment = (baked: boolean) => \`#version 300 es\r
#define BAKED \${baked ? 1 : 0}\r
\${COMMON}\r
uniform sampler2D uField;\r
uniform highp sampler2D uHeightField;\r
uniform float uDetail;\r
uniform float uLines;\r
uniform float uLineWidth;\r
uniform float uMajor;\r
uniform vec3 uColor;\r
uniform float uBrightness;\r
uniform vec2 uFade;\r
uniform vec3 uFocus;\r
uniform vec4 uHeat;\r
uniform vec4 uLamp;\r
uniform vec4 uTrace;\r
uniform vec3 uSun;\r
uniform float uRefDepth;\r
uniform float uReveal;\r
uniform float uLightMode;\r
uniform float uOpacity;\r
uniform vec4 uGlitch[3];\r
uniform float uGlitchSeed;\r
uniform float uPixel;\r
in vec2 vTexel;\r
in vec2 vTerrain;\r
in float vDepth;\r
in float vLift;\r
in vec3 vNormal;\r
out vec4 outColor;\r
\r
float smoother(float x) {\r
  x = clamp(x, 0.0, 1.0);\r
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);\r
}\r
\r
float stroke(float dist, float width, float soft, float density, float crowd) {\r
  float cover = max(0.0, min(min(width, soft), 0.5 * (width + soft) - dist)) / soft;\r
  return mix(cover, min(width * density, 1.0) * 0.6, crowd);\r
}\r
\r
float sampleHeight(vec2 coord, out vec2 slope) {\r
  vec2 u = coord - 0.5;\r
  vec2 i = floor(u + 0.5);\r
  vec2 f = u - i;\r
  vec3 wx = vec3(0.5 * (0.5 - f.x) * (0.5 - f.x), 0.75 - f.x * f.x, 0.5 * (0.5 + f.x) * (0.5 + f.x));\r
  vec3 wy = vec3(0.5 * (0.5 - f.y) * (0.5 - f.y), 0.75 - f.y * f.y, 0.5 * (0.5 + f.y) * (0.5 + f.y));\r
  vec3 dx = vec3(f.x - 0.5, -2.0 * f.x, 0.5 + f.x);\r
  vec3 dy = vec3(f.y - 0.5, -2.0 * f.y, 0.5 + f.y);\r
  ivec2 base = ivec2(i) - 1;\r
  float total = 0.0;\r
  slope = vec2(0.0);\r
  for (int y = 0; y < 3; y++) {\r
    float a = texelFetch(uHeightField, base + ivec2(0, y), 0).r;\r
    float b = texelFetch(uHeightField, base + ivec2(1, y), 0).r;\r
    float c = texelFetch(uHeightField, base + ivec2(2, y), 0).r;\r
    float row = a * wx.x + b * wx.y + c * wx.z;\r
    total += row * wy[y];\r
    slope += vec2((a * dx.x + b * dx.y + c * dx.z) * wy[y], row * dy[y]);\r
  }\r
  return total;\r
}\r
\r
void main() {\r
  float py = gl_FragCoord.y / uPixel;\r
  float shift = 0.0;\r
  float split = 0.0;\r
  for (int i = 0; i < 3; i++) {\r
    if (py >= uGlitch[i].x && py < uGlitch[i].y) {\r
      shift = uGlitch[i].z * uPixel;\r
      split = uGlitch[i].w * uPixel;\r
    }\r
  }\r
  vec2 spot = vTerrain - dFdx(vTerrain) * shift;\r
#if BAKED\r
  vec2 ex = dFdx(vTexel);\r
  vec2 ey = dFdy(vTexel);\r
  vec2 coord = vTexel - ex * shift;\r
  vec2 slope;\r
  float h = sampleHeight(coord, slope);\r
  vec4 field = texture(uField, coord / vec2(textureSize(uField, 0)));\r
  float trail = field.r;\r
  float ring = field.g;\r
  float gx = dot(slope, ex) * uLines;\r
  float gy = dot(slope, ey) * uLines;\r
#else\r
  vec2 dp = spot * uFrequency * 5.0 + vec2(13.1, 4.7);\r
  float ring = swell(spot);\r
  float h = relief(spot) + ring * 0.14 + uDetail * 0.1 * (noise(dp) * 0.6 + noise(octave(dp, vec2(2.3, 6.1))) * 0.3);\r
  float trail = 0.0;\r
  float gx = dFdx(h) * uLines;\r
  float gy = dFdy(h) * uLines;\r
#endif\r
\r
  float lc = h * uLines + 0.5;\r
  float density = max(sqrt(gx * gx + gy * gy), 1e-5);\r
  float dist = abs(fract(lc + 0.5) - 0.5) / density;\r
  float major = uMajor * (1.0 - step(0.5, mod(floor(lc + 0.5), 5.0)));\r
\r
  vec2 hd = spot - uHeat.xy;\r
  float heat = exp(-dot(hd, hd) / (uHeat.z * uHeat.z)) * uHeat.w + trail * 0.6;\r
  float energy = heat + ring;\r
\r
  float depth = max(vDepth, 0.01);\r
  float persp = clamp(sqrt(uRefDepth / depth), 0.6, 1.6);\r
  float width = uLineWidth * persp * (1.0 + 0.6 * major) * (1.0 + 0.45 * min(energy, 1.5));\r
  float soft = 1.0 + min(uFocus.y * abs(1.0 - uFocus.x / depth), uFocus.z);\r
  float crowd = smoothstep(0.3, 0.75, density * max(width, soft));\r
  float cover = stroke(dist, width, soft, density, crowd);\r
  vec3 cover3 = vec3(cover);\r
  if (split > 0.0) {\r
    float offset = split * density;\r
    cover3.r = stroke(abs(fract(lc + offset + 0.5) - 0.5) / density, width, soft, density, crowd);\r
    cover3.b = stroke(abs(fract(lc - offset + 0.5) - 0.5) / density, width, soft, density, crowd);\r
    vec2 block = floor(vec2(gl_FragCoord.x / (uPixel * 26.0), py / 5.0)) + uGlitchSeed * 71.0;\r
    float drop = fract(sin(dot(block, vec2(12.9898, 78.233))) * 43758.5453);\r
    cover3 *= drop > 0.82 ? 0.1 : 1.2;\r
  }\r
\r
  vec3 normal = normalize(vNormal);\r
  float sun = clamp(dot(normal, uSun), 0.0, 1.0);\r
  vec3 toLamp = uLamp.xyz - vec3(vTerrain.x, vLift, vTerrain.y);\r
  float lampDistance = length(toLamp);\r
  float lamp = clamp(dot(normal, toLamp / max(lampDistance, 1e-3)), 0.0, 1.0) * uLamp.w / (1.0 + lampDistance * lampDistance * 0.9);\r
  float level = mix(0.45, 1.05, smoothstep(0.0, 1.1, h)) * mix(0.35, 1.25, sun * sun) * (1.0 + 0.6 * major);\r
  level += heat * 1.4 + ring * 3.0 + lamp * 1.2;\r
\r
  float fade = 1.0 - smoother((depth - uFade.x) / max(uFade.y - uFade.x, 1e-3));\r
  vec3 light = cover3 * level;\r
\r
  if (uTrace.y > 0.0) {\r
    float traceWidth = uLineWidth * persp * 1.8;\r
    float trace = stroke(abs(h - uTrace.x) * uLines / density, traceWidth, soft, density, crowd);\r
    vec2 td = spot - uTrace.zw;\r
    light += trace * uTrace.y * mix(0.35, 1.0, exp(-dot(td, td) / 20.0)) * 2.6;\r
  }\r
  light *= fade * uBrightness * uReveal;\r
\r
  if (uLightMode > 0.5) {\r
    float ink = (1.0 - exp(-max(max(light.r, light.g), light.b) * 1.8)) * 0.92 * uOpacity;\r
    outColor = vec4(uColor * ink, ink);\r
    return;\r
  }\r
\r
  vec3 color = 1.0 - exp(-uColor * light * 1.8);\r
  float top = max(max(color.r, color.g), color.b);\r
  float dither = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;\r
  color = max(color + dither / 255.0 * step(0.002, top), 0.0);\r
  outColor = vec4(color, max(max(color.r, color.g), color.b)) * uOpacity;\r
}\`;\r
\r
const MARKER_VERTEX = \`#version 300 es\r
\${COMMON}\r
uniform ivec2 uOrigin;\r
uniform ivec2 uCamCell;\r
uniform vec2 uCamFrac;\r
uniform float uSpacing;\r
uniform int uColumns;\r
uniform float uHeight;\r
uniform mat4 uViewProj;\r
uniform vec2 uView;\r
uniform float uSize;\r
uniform float uRefDepth;\r
uniform vec4 uHeat;\r
uniform float uTime;\r
uniform vec4 uGlitch[3];\r
uniform float uPixel;\r
out vec2 vCorner;\r
out float vSize;\r
out float vGlow;\r
out float vFrame;\r
out float vDepth;\r
\r
void main() {\r
  ivec2 local = uOrigin + ivec2(gl_InstanceID % uColumns, gl_InstanceID / uColumns);\r
  ivec2 id = local + uCamCell;\r
  vec2 terrain = vec2(id) * uSpacing;\r
  vec2 world = vec2(local) * uSpacing - uCamFrac;\r
  float ring = swell(terrain);\r
  float h = (relief(terrain) + ring * 0.14) * settle(world) + sculpted(terrain).r;\r
  vec4 clip = uViewProj * vec4(world.x, h * uHeight + 0.05, world.y, 1.0);\r
  uint seed = lattice(id + ivec2(911, 377));\r
  float a = float(seed & 1023u) / 1023.0;\r
  float b = float((seed >> 10u) & 1023u) / 1023.0;\r
  vec2 hd = terrain - uHeat.xy;\r
  float heat = exp(-dot(hd, hd) / (uHeat.z * uHeat.z)) * uHeat.w;\r
  float blink = step(0.92, a) * (0.5 + 0.5 * sin(uTime * (1.4 + b * 2.2) + b * 40.0));\r
  float size = uSize * clamp(sqrt(uRefDepth / max(clip.w, 0.01)), 0.6, 1.3) * (1.0 + 0.4 * heat + 0.35 * blink);\r
  float frame = max(smoothstep(0.55, 0.95, blink), smoothstep(0.3, 0.8, heat));\r
  vec2 corner = vec2(float(gl_VertexID & 1), float(gl_VertexID >> 1)) * 2.0 - 1.0;\r
  vec2 offset = corner * (size * (frame > 0.001 ? 2.6 : 1.0) + 1.5);\r
  float py = (clip.y / clip.w * 0.5 + 0.5) * uView.y / uPixel;\r
  float shift = 0.0;\r
  for (int i = 0; i < 3; i++) {\r
    if (py >= uGlitch[i].x && py < uGlitch[i].y) shift = uGlitch[i].z;\r
  }\r
  clip.xy += (offset + vec2(shift * uPixel, 0.0)) / uView * 2.0 * clip.w;\r
  gl_Position = clip;\r
  vCorner = offset;\r
  vSize = size;\r
  vFrame = frame;\r
  vGlow = 0.5 + 0.4 * b + blink * 0.9 + heat * 1.8 + ring * 3.0;\r
  vDepth = clip.w;\r
}\`;\r
\r
const MARKER_FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform vec3 uColor;\r
uniform vec2 uFade;\r
uniform float uReveal;\r
uniform float uBrightness;\r
uniform float uLightMode;\r
uniform float uOpacity;\r
uniform float uStyle;\r
uniform float uPixel;\r
in vec2 vCorner;\r
in float vSize;\r
in float vGlow;\r
in float vFrame;\r
in float vDepth;\r
out vec4 outColor;\r
\r
float smoother(float x) {\r
  x = clamp(x, 0.0, 1.0);\r
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  vec2 a = abs(vCorner);\r
  float cover;\r
  if (uStyle < 0.5) {\r
    float thick = max(0.6 * uPixel, 0.5);\r
    float across = clamp(vSize - a.x + 0.5, 0.0, 1.0) * clamp(thick - a.y + 0.5, 0.0, 1.0);\r
    float down = clamp(vSize - a.y + 0.5, 0.0, 1.0) * clamp(thick - a.x + 0.5, 0.0, 1.0);\r
    cover = max(across, down);\r
  } else {\r
    cover = clamp(vSize * 0.42 - length(vCorner) + 0.5, 0.0, 1.0);\r
  }\r
  if (vFrame > 0.001) {\r
    float edge = vSize * 2.3;\r
    float reach = edge * 0.45;\r
    float line = max(0.5 * uPixel, 0.5);\r
    float sides = clamp(line - abs(a.x - edge) + 0.5, 0.0, 1.0) * clamp(a.y - edge + reach + 0.5, 0.0, 1.0) * clamp(edge + line - a.y + 0.5, 0.0, 1.0);\r
    float caps = clamp(line - abs(a.y - edge) + 0.5, 0.0, 1.0) * clamp(a.x - edge + reach + 0.5, 0.0, 1.0) * clamp(edge + line - a.x + 0.5, 0.0, 1.0);\r
    cover = max(cover, max(sides, caps) * vFrame * 0.8);\r
  }\r
  float fade = 1.0 - smoother((vDepth - uFade.x) / max(uFade.y - uFade.x, 1e-3));\r
  float light = cover * vGlow * fade * fade * uReveal * uBrightness;\r
  if (uLightMode > 0.5) {\r
    float ink = (1.0 - exp(-light * 1.8)) * 0.92 * uOpacity;\r
    outColor = vec4(uColor * ink, ink);\r
    return;\r
  }\r
  vec3 color = 1.0 - exp(-uColor * light * 1.8);\r
  outColor = vec4(color, max(max(color.r, color.g), color.b)) * uOpacity;\r
}\`;\r
\r
const FULLSCREEN = \`#version 300 es\r
void main() {\r
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\r
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const SCULPT = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uPrevious;\r
uniform vec4 uSegment;\r
uniform vec4 uBrush;\r
uniform vec4 uBurst;\r
uniform vec2 uDecay;\r
out vec4 outColor;\r
\r
vec2 wrapped(vec2 d) {\r
  return d - \${SCULPT_SPAN}.0 * floor(d / \${SCULPT_SPAN}.0 + 0.5);\r
}\r
\r
void main() {\r
  vec4 previous = texelFetch(uPrevious, ivec2(gl_FragCoord.xy), 0);\r
  vec2 t = gl_FragCoord.xy / \${SCULPT_SIZE}.0 * \${SCULPT_SPAN}.0;\r
  vec2 a = wrapped(t - uSegment.xy);\r
  vec2 ab = uSegment.zw - uSegment.xy;\r
  float k = clamp(dot(a, ab) / max(dot(ab, ab), 1e-6), 0.0, 1.0);\r
  vec2 d = a - ab * k;\r
  float g = exp(-dot(d, d) / (uBrush.x * uBrush.x)) * uBrush.w;\r
  float height = previous.r * uDecay.x;\r
  height += (uBrush.y - height) * g * uBrush.z;\r
  float heat = previous.g * uDecay.y;\r
  heat += (1.0 - heat) * g * uBrush.z;\r
  vec2 b = wrapped(t - uBurst.xy);\r
  height += uBurst.w * exp(-dot(b, b) / (uBurst.z * uBurst.z));\r
  outColor = vec4(height, heat, 0.0, 1.0);\r
}\`;\r
\r
const DOWNSAMPLE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uSource;\r
uniform vec2 uTarget;\r
uniform vec2 uTexel;\r
out vec4 outColor;\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uTarget;\r
  vec4 color = texture(uSource, uv - uTexel);\r
  color += texture(uSource, uv + uTexel);\r
  color += texture(uSource, uv + vec2(uTexel.x, -uTexel.y));\r
  color += texture(uSource, uv + vec2(-uTexel.x, uTexel.y));\r
  outColor = min(color * 0.25, vec4(1.0));\r
}\`;\r
\r
const BLUR = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uSource;\r
uniform vec2 uTarget;\r
uniform vec2 uStep;\r
out vec4 outColor;\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uTarget;\r
  vec4 color = texture(uSource, uv) * 0.181862;\r
  color += (texture(uSource, uv + uStep * 1.423135) + texture(uSource, uv - uStep * 1.423135)) * 0.284316;\r
  color += (texture(uSource, uv + uStep * 3.326702) + texture(uSource, uv - uStep * 3.326702)) * 0.106598;\r
  color += (texture(uSource, uv + uStep * 5.242989) + texture(uSource, uv - uStep * 5.242989)) * 0.018156;\r
  outColor = color;\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uBloom0;\r
uniform sampler2D uBloom1;\r
uniform sampler2D uBloom2;\r
uniform sampler2D uBloom3;\r
uniform vec2 uView;\r
uniform float uGlow;\r
uniform float uLightMode;\r
out vec4 outColor;\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uView;\r
  vec4 halo = texture(uBloom0, uv) * 0.4;\r
  halo += texture(uBloom1, uv) * 0.3;\r
  halo += texture(uBloom2, uv) * 0.2;\r
  halo += texture(uBloom3, uv) * 0.1;\r
  if (uLightMode > 0.5) {\r
    outColor = halo * uGlow * 0.35;\r
    return;\r
  }\r
  vec3 color = halo.rgb * uGlow * 1.6;\r
  color = color / (1.0 + color);\r
  outColor = vec4(color, max(max(color.r, color.g), color.b));\r
}\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const smoother = (x: number) => {\r
  const t = clamp(x, 0, 1);\r
  return t * t * t * (t * (t * 6 - 15) + 10);\r
};\r
\r
const lattice = (x: number, y: number) => {\r
  let h = (Math.imul(x + 1073741824, 2654435761) + Math.imul(y + 1073741824, 2246822519)) >>> 0;\r
  h = Math.imul(h ^ (h >>> 15), 739982445) >>> 0;\r
  h = Math.imul(h ^ (h >>> 12), 695872825) >>> 0;\r
  return (h ^ (h >>> 15)) >>> 0;\r
};\r
\r
const corner = (cx: number, cy: number, fx: number, fy: number) => {\r
  const h = lattice(cx, cy);\r
  return ((h & 65535) / 32767.5 - 1) * fx + ((h >>> 16) / 32767.5 - 1) * fy;\r
};\r
\r
const noise = (x: number, y: number) => {\r
  const ix = Math.floor(x);\r
  const iy = Math.floor(y);\r
  const fx = x - ix;\r
  const fy = y - iy;\r
  const ux = fx * fx * fx * (fx * (fx * 6 - 15) + 10);\r
  const uy = fy * fy * fy * (fy * (fy * 6 - 15) + 10);\r
  const a = corner(ix, iy, fx, fy);\r
  const b = corner(ix + 1, iy, fx - 1, fy);\r
  const d = corner(ix, iy + 1, fx, fy - 1);\r
  const e = corner(ix + 1, iy + 1, fx - 1, fy - 1);\r
  const top = a + (b - a) * ux;\r
  return top + (d + (e - d) * ux - top) * uy;\r
};\r
\r
const relief = (tx: number, tz: number, frequency: number, morphX: number, morphZ: number) => {\r
  let px = tx * frequency;\r
  let pz = tz * frequency;\r
  const wx = noise(px * 0.42 + morphX, pz * 0.42 + morphZ);\r
  const wz = noise(px * 0.42 - morphZ + 5.2, pz * 0.42 - morphX + 1.3);\r
  px += wx * 0.8;\r
  pz += wz * 0.8;\r
  let n = noise(px, pz) * 0.55;\r
  const qx = 1.6 * px - 1.2 * pz + 7.1;\r
  const qz = 1.2 * px + 1.6 * pz + 3.7;\r
  n += noise(qx, qz) * 0.15;\r
  n += noise(1.6 * qx - 1.2 * qz + 1.9, 1.2 * qx + 1.6 * qz + 8.3) * 0.04;\r
  const s = Math.log(1 + Math.exp(7 * (3 * n + 0.05))) / 7;\r
  return s * s * 1.4 + 0.1 * n;\r
};\r
\r
const fineDetail = (tx: number, tz: number, frequency: number) => {\r
  const px = tx * frequency * 5 + 13.1;\r
  const pz = tz * frequency * 5 + 4.7;\r
  return noise(px, pz) * 0.6 + noise(1.6 * px - 1.2 * pz + 2.3, 1.2 * px + 1.6 * pz + 6.1) * 0.3;\r
};\r
\r
const compile = (gl: WebGL2RenderingContext, type: number, source: string) => {\r
  const shader = gl.createShader(type);\r
  if (!shader) return null;\r
  gl.shaderSource(shader, source);\r
  gl.compileShader(shader);\r
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;\r
  gl.deleteShader(shader);\r
  return null;\r
};\r
\r
const link = (gl: WebGL2RenderingContext, vertexSource: string, fragmentSource: string): Program | null => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);\r
  const program = gl.createProgram();\r
  if (!vertex || !fragment || !program) return null;\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
  gl.linkProgram(program);\r
  gl.deleteShader(vertex);\r
  gl.deleteShader(fragment);\r
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {\r
    gl.deleteProgram(program);\r
    return null;\r
  }\r
  const uniforms: Record<string, WebGLUniformLocation | null> = {};\r
  const total = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
  for (let i = 0; i < total; i++) {\r
    const info = gl.getActiveUniform(program, i);\r
    if (info) uniforms[info.name.replace(/\\[0\\]$/, '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const toRgb = (hex: string): number[] => {\r
  let h = String(hex || '#ffffff')\r
    .replace('#', '')\r
    .trim();\r
  if (h.length === 3 || h.length === 4)\r
    h = h\r
      .slice(0, 3)\r
      .split('')\r
      .map(c => c + c)\r
      .join('');\r
  const num = parseInt(h.slice(0, 6), 16);\r
  if (Number.isNaN(num)) return [1, 1, 1];\r
  return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];\r
};\r
\r
const orient = (yaw: number, pitch: number) => {\r
  const cp = Math.cos(pitch);\r
  const f = [Math.sin(yaw) * cp, -Math.sin(pitch), Math.cos(yaw) * cp];\r
  const r = [Math.cos(yaw), 0, -Math.sin(yaw)];\r
  const u = [f[1] * r[2] - f[2] * r[1], f[2] * r[0] - f[0] * r[2], f[0] * r[1] - f[1] * r[0]];\r
  return { f, r, u };\r
};\r
\r
const lens = (aspect: number) => clamp(0.4877 / aspect, FOV, 0.6);\r
\r
const viewProjection = ({ eye, f, r, u }: Frame, aspect: number, out: Float32Array) => {\r
  const t = 1 / lens(aspect);\r
  const nf = 1 / (NEAR - FAR);\r
  const view = [\r
    r[0],\r
    u[0],\r
    -f[0],\r
    0,\r
    r[1],\r
    u[1],\r
    -f[1],\r
    0,\r
    r[2],\r
    u[2],\r
    -f[2],\r
    0,\r
    -(r[0] * eye[0] + r[1] * eye[1] + r[2] * eye[2]),\r
    -(u[0] * eye[0] + u[1] * eye[1] + u[2] * eye[2]),\r
    f[0] * eye[0] + f[1] * eye[1] + f[2] * eye[2],\r
    1\r
  ];\r
  const projection = [t / aspect, 0, 0, 0, 0, t, 0, 0, 0, 0, (FAR + NEAR) * nf, -1, 0, 0, 2 * FAR * NEAR * nf, 0];\r
  for (let c = 0; c < 4; c++) {\r
    for (let row = 0; row < 4; row++) {\r
      let sum = 0;\r
      for (let k = 0; k < 4; k++) sum += projection[k * 4 + row] * view[c * 4 + k];\r
      out[c * 4 + row] = sum;\r
    }\r
  }\r
  return out;\r
};\r
\r
const Topography = ({\r
  color = '#4f7cff',\r
  lineCount = 22,\r
  lineWidth = 1.2,\r
  majorLines = true,\r
  elevation = 1,\r
  foreground = 0.2,\r
  scale = 1,\r
  detail = 0.35,\r
  tilt = 32,\r
  speed = 0.25,\r
  direction = 'forward',\r
  morph = 0.2,\r
  glow = 0.6,\r
  depthOfField = 0.4,\r
  fog = 0.35,\r
  brightness = 1,\r
  opacity = 1,\r
  mouseInteraction = true,\r
  hoverEffect = 'lift',\r
  mouseRadius = 1,\r
  mouseStrength = 0.6,\r
  trail = 0.3,\r
  parallax = 0.5,\r
  clickEffect = 'pulse',\r
  markers = 'none',\r
  glitch = 0,\r
  intro = true,\r
  lightMode = false,\r
  dpr,\r
  className = '',\r
  style\r
}: TopographyProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const [generation, setGeneration] = useState(0);\r
  const settings = {\r
    color,\r
    lineCount: clamp(lineCount, 2, 80),\r
    lineWidth: Math.max(0.2, lineWidth),\r
    majorLines,\r
    elevation: clamp(elevation, 0, 3),\r
    foreground: clamp(foreground, 0, 1),\r
    scale: clamp(scale, 0.2, 5),\r
    detail: clamp(detail, 0, 1),\r
    tilt: clamp(tilt, 12, 90),\r
    speed,\r
    direction: DIRECTIONS[direction] ?? DIRECTIONS.forward,\r
    morph: Math.max(0, morph),\r
    glow: Math.max(0, glow),\r
    depthOfField: clamp(depthOfField, 0, 1),\r
    fog: clamp(fog, 0, 1),\r
    brightness: Math.max(0, brightness),\r
    opacity: clamp(opacity, 0, 1),\r
    mouseInteraction,\r
    hoverEffect: HOVER_EFFECTS.includes(hoverEffect) ? hoverEffect : 'lift',\r
    mouseRadius: Math.max(0.1, mouseRadius),\r
    mouseStrength: Math.max(0, mouseStrength),\r
    trail: clamp(trail, 0, 1),\r
    parallax: clamp(parallax, 0, 1),\r
    clickEffect,\r
    markers: MARKER_STYLES[markers] ?? -1,\r
    glitch: clamp(glitch, 0, 1),\r
    intro,\r
    lightMode,\r
    dpr\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    const ratio = Math.min(settingsRef.current.dpr || window.devicePixelRatio || 1, 2);\r
    const gl = canvas?.getContext('webgl2', {\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: ratio < 1.5,\r
      depth: true,\r
      stencil: false,\r
      powerPreference: 'high-performance'\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const floatTargets = !!gl.getExtension('EXT_color_buffer_float');\r
    const terrain = link(gl, terrainVertex(floatTargets), terrainFragment(floatTargets));\r
    const fieldProgram = floatTargets ? link(gl, FULLSCREEN, FIELD) : null;\r
    const sculptProgram = floatTargets ? link(gl, FULLSCREEN, SCULPT) : null;\r
    const downProgram = link(gl, FULLSCREEN, DOWNSAMPLE);\r
    const blurProgram = link(gl, FULLSCREEN, BLUR);\r
    const compositeProgram = link(gl, FULLSCREEN, COMPOSITE);\r
    const markerProgram = link(gl, MARKER_VERTEX, MARKER_FRAGMENT);\r
    if (!terrain || !downProgram || !blurProgram || !compositeProgram || !markerProgram) return undefined;\r
\r
    const onContextLost = (event: Event) => event.preventDefault();\r
    const onContextRestored = () => setGeneration(value => value + 1);\r
    canvas.addEventListener('webglcontextlost', onContextLost);\r
    canvas.addEventListener('webglcontextrestored', onContextRestored);\r
\r
    const vao = gl.createVertexArray();\r
    const format = floatTargets ? gl.RGBA16F : gl.RGBA8;\r
\r
    const createTexture = (width: number, height: number, internal: number, wrap: number) => {\r
      const texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texStorage2D(gl.TEXTURE_2D, 1, internal, width, height);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);\r
      return texture;\r
    };\r
\r
    const createTarget = (): Target => ({\r
      texture: null,\r
      framebuffer: gl.createFramebuffer(),\r
      depth: null,\r
      width: 0,\r
      height: 0\r
    });\r
\r
    const allocate = (target: Target, width: number, height: number, withDepth: boolean) => {\r
      if (target.texture && target.width === width && target.height === height) return;\r
      if (target.texture) gl.deleteTexture(target.texture);\r
      target.texture = createTexture(width, height, format, gl.CLAMP_TO_EDGE);\r
      target.width = width;\r
      target.height = height;\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target.texture, 0);\r
      if (withDepth) {\r
        if (!target.depth) target.depth = gl.createRenderbuffer();\r
        gl.bindRenderbuffer(gl.RENDERBUFFER, target.depth);\r
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, width, height);\r
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, target.depth);\r
      }\r
    };\r
\r
    const source = createTarget();\r
    const levels = Array.from({ length: BLOOM_LEVELS }, () => [createTarget(), createTarget()]);\r
    const sculpt = sculptProgram\r
      ? [0, 1].map(() => {\r
          const texture = createTexture(SCULPT_SIZE, SCULPT_SIZE, gl.RG16F, gl.REPEAT);\r
          const framebuffer = gl.createFramebuffer();\r
          gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
          gl.clearColor(0, 0, 0, 0);\r
          gl.clear(gl.COLOR_BUFFER_BIT);\r
          return { texture, framebuffer };\r
        })\r
      : null;\r
    const blank = createTexture(1, 1, gl.RGBA8, gl.REPEAT);\r
    const field: {\r
      texture: WebGLTexture | null;\r
      heights: WebGLTexture | null;\r
      framebuffer: WebGLFramebuffer | null;\r
      width: number;\r
      height: number;\r
    } = { texture: null, heights: null, framebuffer: gl.createFramebuffer(), width: 0, height: 0 };\r
    let sculptIndex = 0;\r
\r
    const reserveField = (width: number, height: number) => {\r
      if (field.texture && width <= field.width && height <= field.height) return;\r
      if (field.texture) gl.deleteTexture(field.texture);\r
      if (field.heights) gl.deleteTexture(field.heights);\r
      field.width = Math.max(width, Math.ceil(field.width * 1.25), 64);\r
      field.height = Math.max(height, Math.ceil(field.height * 1.25), 64);\r
      field.texture = createTexture(field.width, field.height, gl.RGBA16F, gl.CLAMP_TO_EDGE);\r
      field.heights = createTexture(field.width, field.height, gl.R32F, gl.CLAMP_TO_EDGE);\r
      gl.bindTexture(gl.TEXTURE_2D, field.heights);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, field.framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, field.texture, 0);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, field.heights, 0);\r
      gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);\r
    };\r
\r
    const bind = (unit: number, texture: WebGLTexture | null) => {\r
      gl.activeTexture(gl.TEXTURE0 + unit);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
    };\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const matrix = new Float32Array(16);\r
    const pulseData = new Float32Array(MAX_PULSES * 4);\r
    const glitchData = new Float32Array(12);\r
    const glitch = { until: 0, next: 1.5, roll: 0, seed: 0 };\r
    let entropy = 7919;\r
    const random = () => {\r
      entropy = (entropy * 16807) % 2147483647;\r
      return (entropy - 1) / 2147483646;\r
    };\r
    const pulses: Pulse[] = [];\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const view = { width: 1, height: 1, ratio: 1, cell: 0.05, cellKey: '' };\r
    const state: TopographyState = {\r
      intro: settingsRef.current.intro && !reduce ? 0 : 1,\r
      rise: 1,\r
      travelX: 0,\r
      travelZ: 0,\r
      morph: 0,\r
      yaw: 0,\r
      pitch: 0,\r
      yawVelocity: 0,\r
      pitchVelocity: 0,\r
      presence: 0,\r
      focus: ORBIT,\r
      hit: null,\r
      brushFrom: null,\r
      sculptLife: 0,\r
      burst: null,\r
      level: 0,\r
      trace: 0,\r
      clock: 0,\r
      tilt: settingsRef.current.tilt,\r
      elevation: settingsRef.current.elevation,\r
      scale: settingsRef.current.scale\r
    };\r
    state.rise = smoother(state.intro);\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let quiet = 0;\r
\r
    const camera = (): Frame => {\r
      const pitch = Math.min((state.tilt * Math.PI) / 180 + state.pitch, Math.PI / 2 - 1e-4);\r
      const frame = orient(state.yaw, pitch);\r
      const lift = state.elevation * HEIGHT * state.rise * 0.18;\r
      const clearance = state.elevation * HEIGHT * state.rise * 1.3 + 0.9;\r
      const distance = Math.max(ORBIT, (clearance - lift) / Math.sin(pitch));\r
      return {\r
        ...frame,\r
        distance,\r
        eye: [-frame.f[0] * distance, lift - frame.f[1] * distance, -frame.f[2] * distance]\r
      };\r
    };\r
\r
    const rayDirection = (cam: Frame, nx: number, ny: number) => {\r
      const aspect = view.width / view.height;\r
      const t = lens(aspect);\r
      const d = [0, 1, 2].map(i => cam.f[i] + cam.r[i] * nx * t * aspect + cam.u[i] * ny * t);\r
      const length = Math.hypot(d[0], d[1], d[2]);\r
      return d.map(v => v / length);\r
    };\r
\r
    const along = (cam: Frame, d: number[]) => d[0] * cam.f[0] + d[1] * cam.f[1] + d[2] * cam.f[2];\r
\r
    const groundDepth = (cam: Frame, ny: number) => {\r
      const d = rayDirection(cam, 0, ny);\r
      if (d[1] > -1e-3) return Infinity;\r
      return (cam.eye[1] / -d[1]) * along(cam, d);\r
    };\r
\r
    const nearRange = (cam: Frame, s: typeof settings) => [groundDepth(cam, -1) * 0.9, cam.distance, s.foreground];\r
\r
    const settleAt = (cam: Frame, near: number[], x: number, z: number) => {\r
      const depth = (x - cam.eye[0]) * cam.f[0] - cam.eye[1] * cam.f[1] + (z - cam.eye[2]) * cam.f[2];\r
      return near[2] + (1 - near[2]) * smoother((depth - near[0]) / Math.max(near[1] - near[0], 1e-3));\r
    };\r
\r
    const pick = (cam: Frame, s: typeof settings, nx: number, ny: number): Hit | null => {\r
      const d = rayDirection(cam, nx, ny);\r
      const height = state.elevation * HEIGHT * state.rise;\r
      const frequency = FREQUENCY / state.scale;\r
      const near = nearRange(cam, s);\r
      const above = (distance: number) => {\r
        const x = cam.eye[0] + d[0] * distance;\r
        const z = cam.eye[2] + d[2] * distance;\r
        const ground = relief(state.travelX + x, state.travelZ + z, frequency, state.morph * 0.37, state.morph * 0.23);\r
        return cam.eye[1] + d[1] * distance - ground * height * settleAt(cam, near, x, z);\r
      };\r
      let distance = NEAR;\r
      let gap = above(distance);\r
      for (let i = 0; i < 200 && distance < FAR * 0.5; i++) {\r
        const next = distance + Math.max(0.02, gap * 0.4);\r
        const value = above(next);\r
        if (value < 0) {\r
          let lo = distance;\r
          let hi = next;\r
          for (let k = 0; k < 10; k++) {\r
            const mid = (lo + hi) * 0.5;\r
            if (above(mid) < 0) hi = mid;\r
            else lo = mid;\r
          }\r
          return {\r
            x: state.travelX + cam.eye[0] + d[0] * hi,\r
            y: cam.eye[1] + d[1] * hi,\r
            z: state.travelZ + cam.eye[2] + d[2] * hi,\r
            depth: hi * along(cam, d)\r
          };\r
        }\r
        distance = next;\r
        gap = value;\r
      }\r
      return null;\r
    };\r
\r
    const footprint = (cam: Frame, s: typeof settings, fadeEnd: number) => {\r
      const ceiling = state.elevation * HEIGHT * state.rise * 1.7 + 0.2 + s.mouseStrength;\r
      const box: Box = { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity, near: Infinity };\r
      const add = (d: number[], distance: number) => {\r
        const x = cam.eye[0] + d[0] * distance;\r
        const z = cam.eye[2] + d[2] * distance;\r
        box.minX = Math.min(box.minX, x);\r
        box.maxX = Math.max(box.maxX, x);\r
        box.minZ = Math.min(box.minZ, z);\r
        box.maxZ = Math.max(box.maxZ, z);\r
      };\r
      for (const nx of [-1.08, 0, 1.08]) {\r
        for (const ny of [-1.08, 1.08]) {\r
          const d = rayDirection(cam, nx, ny);\r
          const forward = Math.max(along(cam, d), 1e-3);\r
          let near = NEAR;\r
          let far = (fadeEnd * 1.05) / forward;\r
          if (d[1] < -1e-4) {\r
            near = Math.max(NEAR, (cam.eye[1] - ceiling) / -d[1]);\r
            far = Math.min(far, cam.eye[1] / -d[1]);\r
          }\r
          near = Math.min(near, far);\r
          add(d, near);\r
          add(d, far);\r
          box.near = Math.min(box.near, near * forward);\r
        }\r
      }\r
      return box;\r
    };\r
\r
    const grid = (box: Box, cell: number) => {\r
      const camX = Math.floor(state.travelX / cell);\r
      const camZ = Math.floor(state.travelZ / cell);\r
      const fracX = state.travelX - camX * cell;\r
      const fracZ = state.travelZ - camZ * cell;\r
      const k0 = Math.floor((box.minX + fracX) / cell) - 2;\r
      const m0 = Math.floor((box.minZ + fracZ) / cell) - 2;\r
      const columns = clamp(Math.ceil((box.maxX + fracX) / cell) + 2 - k0, 1, 4000);\r
      const rows = clamp(Math.ceil((box.maxZ + fracZ) / cell) + 2 - m0, 1, Math.floor((MAX_CELLS * 1.5) / columns));\r
      return { cell, camX, camZ, fracX, fracZ, k0, m0, columns, rows };\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const cam = camera();\r
      viewProjection(cam, view.width / view.height, matrix);\r
\r
      const bottom = groundDepth(cam, -1);\r
      const top = Math.min(groundDepth(cam, 1), cam.distance * 3.2);\r
      const horizon = Math.max(top, bottom * 1.6, cam.distance * 1.4);\r
      const fadeEnd = horizon + (bottom * 1.8 - horizon) * s.fog;\r
      const fadeStart = fadeEnd * 0.7 + (bottom * 0.7 - fadeEnd * 0.7) * s.fog;\r
      const box = footprint(cam, s, fadeEnd);\r
\r
      const cellKey = \`\${view.width}x\${view.height}@\${view.ratio}|\${Math.round(state.tilt / 4)}|\${Math.round(state.elevation * 5)}|\${s.fog}\`;\r
      if (cellKey !== view.cellKey) {\r
        view.cellKey = cellKey;\r
        const focal = (view.height * view.ratio * 0.5) / lens(view.width / view.height);\r
        let cell = clamp((14 * Math.max(box.near, 0.5)) / focal, 0.02, 0.4);\r
        const cells = ((box.maxX - box.minX) * (box.maxZ - box.minZ)) / (cell * cell);\r
        if (cells > MAX_CELLS) cell *= Math.sqrt(cells / MAX_CELLS);\r
        view.cell = cell;\r
      }\r
\r
      const color = toRgb(s.color);\r
      const height = state.elevation * HEIGHT * state.rise;\r
      const layout = grid(box, view.cell);\r
      const near = nearRange(cam, s);\r
      const dots = s.markers >= 0 ? grid(box, MARKER_SPACING) : null;\r
      const touch = state.hit && s.mouseInteraction ? state.presence : 0;\r
      const heatStrength = touch * (0.35 + 0.5 * s.mouseStrength);\r
      const focusScale = s.depthOfField * view.height * 0.016;\r
      const reveal = smoother(state.intro / 0.35);\r
      const hitX = state.hit ? state.hit.x : 0;\r
      const hitZ = state.hit ? state.hit.z : 0;\r
\r
      pulseData.fill(0);\r
      pulses.forEach((p, i) => {\r
        pulseData.set([p.x, p.z, p.age * 4.2, Math.exp(-p.age * 1.1) * smoother(p.age / 0.08)], i * 4);\r
      });\r
\r
      gl.bindVertexArray(vao);\r
      if (fieldProgram) {\r
        const width = layout.columns + 7;\r
        const height2 = layout.rows + 7;\r
        reserveField(width, height2);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, field.framebuffer);\r
        gl.viewport(0, 0, width, height2);\r
        gl.useProgram(fieldProgram.program);\r
        const f = fieldProgram.uniforms;\r
        bind(0, sculpt ? sculpt[sculptIndex].texture : blank);\r
        gl.uniform1i(f.uSculpt, 0);\r
        gl.uniform1f(f.uSculptOn, sculpt ? 1 : 0);\r
        gl.uniform1f(f.uFrequency, FREQUENCY / state.scale);\r
        gl.uniform2f(f.uMorph, state.morph * 0.37, state.morph * 0.23);\r
        gl.uniform4fv(f.uPulses, pulseData);\r
        gl.uniform2i(f.uBase, layout.k0 - 2 + layout.camX, layout.m0 - 2 + layout.camZ);\r
        gl.uniform1f(f.uCell, layout.cell);\r
        gl.uniform1f(f.uDetail, s.detail);\r
        gl.disable(gl.DEPTH_TEST);\r
        gl.disable(gl.BLEND);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      }\r
\r
      const drawTerrain = (pixel: number, width: number, targetHeight: number, stride: number) => {\r
        gl.viewport(0, 0, width, targetHeight);\r
        gl.useProgram(terrain.program);\r
        const u = terrain.uniforms;\r
        bind(0, fieldProgram ? field.texture : blank);\r
        gl.uniform1i(u.uField, 0);\r
        bind(1, fieldProgram ? field.heights : blank);\r
        gl.uniform1i(u.uHeightField, 1);\r
        gl.uniform1f(u.uFrequency, FREQUENCY / state.scale);\r
        gl.uniform2f(u.uMorph, state.morph * 0.37, state.morph * 0.23);\r
        gl.uniform4fv(u.uPulses, pulseData);\r
        gl.uniform2i(u.uOrigin, layout.k0, layout.m0);\r
        gl.uniform2i(u.uCamCell, layout.camX, layout.camZ);\r
        gl.uniform2f(u.uCamFrac, layout.fracX, layout.fracZ);\r
        gl.uniform1f(u.uCell, layout.cell);\r
        gl.uniform1i(u.uStride, stride);\r
        gl.uniform1f(u.uHeight, height);\r
        gl.uniform3fv(u.uEye, cam.eye);\r
        gl.uniform3fv(u.uForward, cam.f);\r
        gl.uniform3fv(u.uNear, near);\r
        gl.uniform1f(u.uRefDepth, cam.distance);\r
        gl.uniformMatrix4fv(u.uViewProj, false, matrix);\r
        gl.uniform1f(u.uDetail, s.detail);\r
        gl.uniform1f(u.uLines, s.lineCount);\r
        gl.uniform1f(u.uLineWidth, s.lineWidth * pixel);\r
        gl.uniform1f(u.uMajor, s.majorLines ? 1 : 0);\r
        gl.uniform3fv(u.uColor, color);\r
        gl.uniform1f(u.uBrightness, s.brightness);\r
        gl.uniform2f(u.uFade, fadeStart, fadeEnd);\r
        gl.uniform3f(u.uFocus, state.focus, focusScale * pixel, view.height * 0.03 * pixel);\r
        gl.uniform4f(u.uHeat, hitX, hitZ, 0.9 * s.mouseRadius, heatStrength);\r
        gl.uniform4f(u.uLamp, hitX, state.hit ? state.hit.y + 1.4 : 0, hitZ, heatStrength);\r
        gl.uniform4f(u.uTrace, state.level, state.trace, hitX, hitZ);\r
        gl.uniform3fv(u.uSun, SUN);\r
        gl.uniform1f(u.uReveal, reveal);\r
        gl.uniform1f(u.uLightMode, s.lightMode ? 1 : 0);\r
        gl.uniform1f(u.uOpacity, s.opacity);\r
        gl.uniform4fv(u.uGlitch, glitchData);\r
        gl.uniform1f(u.uGlitchSeed, glitch.seed);\r
        gl.uniform1f(u.uPixel, pixel);\r
        gl.enable(gl.DEPTH_TEST);\r
        gl.depthFunc(gl.LESS);\r
        gl.disable(gl.BLEND);\r
        gl.clearColor(0, 0, 0, 0);\r
        gl.clearDepth(1);\r
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);\r
        gl.drawArraysInstanced(\r
          gl.TRIANGLE_STRIP,\r
          0,\r
          2 * (Math.ceil(layout.columns / stride) + 1),\r
          Math.ceil(layout.rows / stride)\r
        );\r
        if (dots) {\r
          gl.useProgram(markerProgram.program);\r
          const m = markerProgram.uniforms;\r
          bind(2, sculpt ? sculpt[sculptIndex].texture : blank);\r
          gl.uniform1i(m.uSculpt, 2);\r
          gl.uniform1f(m.uSculptOn, sculpt ? 1 : 0);\r
          gl.uniform1f(m.uFrequency, FREQUENCY / state.scale);\r
          gl.uniform2f(m.uMorph, state.morph * 0.37, state.morph * 0.23);\r
          gl.uniform4fv(m.uPulses, pulseData);\r
          gl.uniform3fv(m.uEye, cam.eye);\r
          gl.uniform3fv(m.uForward, cam.f);\r
          gl.uniform3fv(m.uNear, near);\r
          gl.uniform2i(m.uOrigin, dots.k0, dots.m0);\r
          gl.uniform2i(m.uCamCell, dots.camX, dots.camZ);\r
          gl.uniform2f(m.uCamFrac, dots.fracX, dots.fracZ);\r
          gl.uniform1f(m.uSpacing, dots.cell);\r
          gl.uniform1i(m.uColumns, dots.columns + 1);\r
          gl.uniform1f(m.uHeight, height);\r
          gl.uniformMatrix4fv(m.uViewProj, false, matrix);\r
          gl.uniform2f(m.uView, width, targetHeight);\r
          gl.uniform1f(m.uSize, 4 * pixel);\r
          gl.uniform1f(m.uRefDepth, cam.distance);\r
          gl.uniform4f(m.uHeat, hitX, hitZ, 1.2 * s.mouseRadius, heatStrength);\r
          gl.uniform1f(m.uTime, state.clock);\r
          gl.uniform4fv(m.uGlitch, glitchData);\r
          gl.uniform1f(m.uPixel, pixel);\r
          gl.uniform3fv(m.uColor, color);\r
          gl.uniform2f(m.uFade, fadeStart, fadeEnd);\r
          gl.uniform1f(m.uReveal, reveal);\r
          gl.uniform1f(m.uBrightness, s.brightness);\r
          gl.uniform1f(m.uLightMode, s.lightMode ? 1 : 0);\r
          gl.uniform1f(m.uOpacity, s.opacity);\r
          gl.uniform1f(m.uStyle, s.markers);\r
          gl.depthFunc(gl.LEQUAL);\r
          gl.depthMask(false);\r
          gl.enable(gl.BLEND);\r
          gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
          gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, (dots.columns + 1) * (dots.rows + 1));\r
          gl.disable(gl.BLEND);\r
          gl.depthMask(true);\r
        }\r
        gl.disable(gl.DEPTH_TEST);\r
      };\r
\r
      const bloom = s.glow > 0.001;\r
      if (bloom) {\r
        const width = Math.max(1, Math.round(view.width / 2));\r
        const targetHeight = Math.max(1, Math.round(view.height / 2));\r
        allocate(source, width, targetHeight, true);\r
        levels.forEach((pair, index) => {\r
          const w = Math.max(1, Math.round(view.width / 2 ** (index + 2)));\r
          const h = Math.max(1, Math.round(view.height / 2 ** (index + 2)));\r
          allocate(pair[0], w, h, false);\r
          allocate(pair[1], w, h, false);\r
        });\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, source.framebuffer);\r
        drawTerrain(0.5, width, targetHeight, 2);\r
        let from = source;\r
        levels.forEach(([front, back]) => {\r
          gl.bindFramebuffer(gl.FRAMEBUFFER, front.framebuffer);\r
          gl.viewport(0, 0, front.width, front.height);\r
          gl.useProgram(downProgram.program);\r
          bind(0, from.texture);\r
          gl.uniform1i(downProgram.uniforms.uSource, 0);\r
          gl.uniform2f(downProgram.uniforms.uTarget, front.width, front.height);\r
          gl.uniform2f(downProgram.uniforms.uTexel, 1 / from.width, 1 / from.height);\r
          gl.drawArrays(gl.TRIANGLES, 0, 3);\r
          gl.useProgram(blurProgram.program);\r
          gl.uniform1i(blurProgram.uniforms.uSource, 0);\r
          gl.uniform2f(blurProgram.uniforms.uTarget, back.width, back.height);\r
          gl.bindFramebuffer(gl.FRAMEBUFFER, back.framebuffer);\r
          bind(0, front.texture);\r
          gl.uniform2f(blurProgram.uniforms.uStep, 1 / front.width, 0);\r
          gl.drawArrays(gl.TRIANGLES, 0, 3);\r
          gl.bindFramebuffer(gl.FRAMEBUFFER, front.framebuffer);\r
          bind(0, back.texture);\r
          gl.uniform2f(blurProgram.uniforms.uStep, 0, 1 / back.height);\r
          gl.drawArrays(gl.TRIANGLES, 0, 3);\r
          from = front;\r
        });\r
      }\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      drawTerrain(view.ratio, canvas.width, canvas.height, 1);\r
\r
      if (bloom) {\r
        gl.viewport(0, 0, canvas.width, canvas.height);\r
        gl.useProgram(compositeProgram.program);\r
        const c = compositeProgram.uniforms;\r
        levels.forEach(([front], index) => {\r
          bind(index, front.texture);\r
          gl.uniform1i(c[\`uBloom\${index}\`], index);\r
        });\r
        gl.uniform2f(c.uView, canvas.width, canvas.height);\r
        gl.uniform1f(c.uGlow, s.glow * reveal);\r
        gl.uniform1f(c.uLightMode, s.lightMode ? 1 : 0);\r
        gl.enable(gl.BLEND);\r
        if (s.lightMode) gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
        else gl.blendFunc(gl.ONE, gl.ONE);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
        gl.disable(gl.BLEND);\r
      }\r
      for (let unit = BLOOM_LEVELS; unit >= 0; unit--) bind(unit, null);\r
    };\r
\r
    const updateSculpt = (s: typeof settings, dt: number) => {\r
      if (!sculpt || !sculptProgram) return false;\r
      const brush = s.mouseInteraction && s.hoverEffect === 'lift' && state.presence > 0.001 ? state.hit : null;\r
      const burst = state.burst;\r
      if (!brush && !burst && state.sculptLife <= 0) return false;\r
      const from = state.brushFrom || brush;\r
      const read = sculpt[sculptIndex];\r
      const write = sculpt[1 - sculptIndex];\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, write.framebuffer);\r
      gl.viewport(0, 0, SCULPT_SIZE, SCULPT_SIZE);\r
      gl.useProgram(sculptProgram.program);\r
      const u = sculptProgram.uniforms;\r
      bind(0, read.texture);\r
      gl.uniform1i(u.uPrevious, 0);\r
      if (brush && from) gl.uniform4f(u.uSegment, from.x, from.z, brush.x, brush.z);\r
      else gl.uniform4f(u.uSegment, 0, 0, 0, 0);\r
      gl.uniform4f(\r
        u.uBrush,\r
        1.1 * s.mouseRadius,\r
        0.9 * s.mouseStrength,\r
        1 - Math.exp(-dt * 7),\r
        brush ? state.presence : 0\r
      );\r
      if (burst) {\r
        const before = smoother(burst.age / 0.7);\r
        burst.age += dt;\r
        const amount = (smoother(burst.age / 0.7) - before) * 0.9 * Math.max(s.mouseStrength, 0.3);\r
        gl.uniform4f(u.uBurst, burst.x, burst.z, 1.6 * s.mouseRadius, amount);\r
        if (burst.age >= 0.7) state.burst = null;\r
      } else {\r
        gl.uniform4f(u.uBurst, 0, 0, 1, 0);\r
      }\r
      const tau = 0.25 + 3 * s.trail * s.trail;\r
      gl.uniform2f(u.uDecay, Math.exp(-dt / tau), Math.exp(-dt / 0.7));\r
      gl.disable(gl.BLEND);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      sculptIndex = 1 - sculptIndex;\r
      state.brushFrom = brush ? { x: brush.x, z: brush.z } : null;\r
      if (brush || burst) state.sculptLife = tau * 6;\r
      else state.sculptLife -= dt;\r
      return true;\r
    };\r
\r
    let sizedDpr = settingsRef.current.dpr;\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      sizedDpr = s.dpr;\r
      view.width = Math.max(1, container.clientWidth);\r
      view.height = Math.max(1, container.clientHeight);\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(view.width * view.ratio));\r
      canvas.height = Math.max(1, Math.round(view.height * view.ratio));\r
      render();\r
      wake();\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      if (s.dpr !== sizedDpr) resize();\r
      const dt = last ? clamp((now - last) / 1000, 0, 1 / 20) : 1 / 60;\r
      last = now;\r
\r
      if (!s.intro || reduce) state.intro = 1;\r
      else if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / INTRO_SECONDS);\r
      state.rise = smoother(state.intro);\r
      const ease = reduce ? 1 : 1 - Math.exp(-dt / 0.4);\r
      state.tilt += (s.tilt - state.tilt) * ease;\r
      state.elevation += (s.elevation - state.elevation) * ease;\r
      state.scale = s.scale;\r
\r
      state.clock += dt;\r
      const glitching = reduce ? 0 : s.glitch;\r
      if (glitching > 0) {\r
        if (state.clock >= glitch.next && state.clock >= glitch.until) {\r
          glitch.until = state.clock + 0.1 + random() * 0.22 * (0.5 + glitching);\r
          glitch.next = glitch.until + (9 - 7.4 * glitching) * (0.45 + random() * 1.1);\r
          glitch.roll = 0;\r
        }\r
        if (state.clock < glitch.until) {\r
          if (state.clock >= glitch.roll) {\r
            glitchData.fill(0);\r
            const count = 1 + Math.floor(random() * 3);\r
            for (let i = 0; i < count; i++) {\r
              const band = 3 + random() * random() * view.height * 0.14;\r
              const y = random() * view.height;\r
              const shift = (random() - 0.5) * 2 * (10 + 46 * glitching);\r
              glitchData.set([y, y + band, shift, 1 + random() * 3 * glitching], i * 4);\r
            }\r
            glitch.seed = random();\r
            glitch.roll = state.clock + 0.04 + random() * 0.05;\r
          }\r
        } else glitchData.fill(0);\r
      } else glitchData.fill(0);\r
\r
      if (!reduce) {\r
        state.travelX += s.direction[0] * s.speed * 0.8 * dt;\r
        state.travelZ += s.direction[1] * s.speed * 0.8 * dt;\r
        state.morph += s.morph * 0.12 * dt;\r
      }\r
\r
      const engaged = pointer.inside && s.mouseInteraction;\r
      state.presence += ((engaged ? 1 : 0) - state.presence) * (1 - Math.exp(-dt / (engaged ? 0.18 : 0.45)));\r
\r
      const nx = (pointer.x / view.width) * 2 - 1;\r
      const ny = 1 - (pointer.y / view.height) * 2;\r
      const lean = reduce || !engaged ? 0 : s.parallax;\r
      const targetYaw = nx * lean * 0.09;\r
      const targetPitch = -ny * lean * 0.045;\r
      state.yawVelocity += (38 * (targetYaw - state.yaw) - 11 * state.yawVelocity) * dt;\r
      state.pitchVelocity += (38 * (targetPitch - state.pitch) - 11 * state.pitchVelocity) * dt;\r
      state.yaw += state.yawVelocity * dt;\r
      state.pitch += state.pitchVelocity * dt;\r
\r
      const cam = camera();\r
      if (engaged) {\r
        state.hit = pick(cam, s, nx, ny);\r
        if (state.hit && state.brushFrom) {\r
          const jump = Math.hypot(state.hit.x - state.brushFrom.x, state.hit.z - state.brushFrom.z);\r
          if (jump > 3 * s.mouseRadius) state.brushFrom = null;\r
        }\r
      } else if (state.presence < 0.002) {\r
        state.hit = null;\r
        state.brushFrom = null;\r
      }\r
\r
      const tracing = state.hit && s.mouseInteraction && s.hoverEffect === 'trace' ? state.presence : 0;\r
      if (state.hit) {\r
        const frequency = FREQUENCY / state.scale;\r
        const target =\r
          relief(state.hit.x, state.hit.z, frequency, state.morph * 0.37, state.morph * 0.23) +\r
          s.detail * 0.1 * fineDetail(state.hit.x, state.hit.z, frequency);\r
        state.level = state.trace < 0.01 ? target : state.level + (target - state.level) * (1 - Math.exp(-dt / 0.09));\r
      }\r
      state.trace += (tracing - state.trace) * (1 - Math.exp(-dt / 0.2));\r
\r
      const focusTarget = state.hit && s.depthOfField > 0 ? state.hit.depth : cam.distance;\r
      state.focus += (focusTarget - state.focus) * (1 - Math.exp(-dt / 0.35));\r
\r
      for (let i = pulses.length - 1; i >= 0; i--) {\r
        pulses[i].age += dt;\r
        if (pulses[i].age > 4) pulses.splice(i, 1);\r
      }\r
\r
      const sculpting = updateSculpt(s, dt);\r
      render();\r
\r
      const settling =\r
        Math.abs(s.tilt - state.tilt) > 0.01 ||\r
        Math.abs(s.elevation - state.elevation) > 1e-4 ||\r
        Math.abs(state.yaw - targetYaw) > 1e-4 ||\r
        Math.abs(state.pitch - targetPitch) > 1e-4 ||\r
        Math.abs(state.yawVelocity) > 1e-4 ||\r
        Math.abs(state.pitchVelocity) > 1e-4 ||\r
        Math.abs(focusTarget - state.focus) > 1e-3 ||\r
        Math.abs(tracing - state.trace) > 1e-3;\r
      const busy =\r
        (!reduce && (s.speed !== 0 || s.morph !== 0 || s.glitch > 0 || s.markers >= 0)) ||\r
        state.intro < 1 ||\r
        pulses.length > 0 ||\r
        sculpting ||\r
        settling ||\r
        (state.presence > 0.001 && state.presence < 0.999);\r
      quiet = busy ? 0 : quiet + dt;\r
      if (quiet < 0.5) raf = requestAnimationFrame(frame);\r
    };\r
\r
    function wake() {\r
      quiet = 0;\r
      if (!raf && visible && !document.hidden) {\r
        last = 0;\r
        raf = requestAnimationFrame(frame);\r
      }\r
    }\r
\r
    const locate = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const { x, y, inside } = locate(event);\r
      const was = pointer.inside;\r
      pointer.inside = inside;\r
      if (inside) {\r
        pointer.x = x;\r
        pointer.y = y;\r
      }\r
      if (inside || was) wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      const { x, y, inside } = locate(event);\r
      if (!inside) return;\r
      pointer.x = x;\r
      pointer.y = y;\r
      pointer.inside = true;\r
      wake();\r
      if (s.glitch > 0 && !reduce) {\r
        glitch.until = state.clock + 0.16;\r
        glitch.roll = 0;\r
      }\r
      if (!s.mouseInteraction || (s.clickEffect !== 'pulse' && s.clickEffect !== 'peak')) return;\r
      const hit = pick(camera(), s, (x / view.width) * 2 - 1, 1 - (y / view.height) * 2);\r
      if (!hit) return;\r
      if (s.clickEffect === 'peak' && sculpt) {\r
        state.burst = { x: hit.x, z: hit.z, age: 0 };\r
      } else if (s.clickEffect === 'pulse') {\r
        if (pulses.length >= MAX_PULSES) pulses.shift();\r
        pulses.push({ x: hit.x, z: hit.z, age: 0 });\r
      }\r
    };\r
\r
    const onPointerUp = (event: PointerEvent) => {\r
      if (event.pointerType !== 'touch') return;\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
    const onVisibility = () => wake();\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(container);\r
    const intersection = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible) wake();\r
    });\r
    intersection.observe(container);\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    window.addEventListener('pointerup', onPointerUp, { passive: true });\r
    window.addEventListener('pointercancel', onPointerUp, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
    wakeRef.current = wake;\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('pointerup', onPointerUp);\r
      window.removeEventListener('pointercancel', onPointerUp);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      canvas.removeEventListener('webglcontextlost', onContextLost);\r
      canvas.removeEventListener('webglcontextrestored', onContextRestored);\r
      [source, ...levels.flat()].forEach(target => {\r
        if (target.texture) gl.deleteTexture(target.texture);\r
        if (target.depth) gl.deleteRenderbuffer(target.depth);\r
        gl.deleteFramebuffer(target.framebuffer);\r
      });\r
      sculpt?.forEach(target => {\r
        gl.deleteTexture(target.texture);\r
        gl.deleteFramebuffer(target.framebuffer);\r
      });\r
      gl.deleteTexture(blank);\r
      gl.deleteVertexArray(vao);\r
      if (field.texture) gl.deleteTexture(field.texture);\r
      if (field.heights) gl.deleteTexture(field.heights);\r
      gl.deleteFramebuffer(field.framebuffer);\r
      [terrain, fieldProgram, sculptProgram, downProgram, blurProgram, compositeProgram, markerProgram].forEach(\r
        program => program && gl.deleteProgram(program.program)\r
      );\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
    };\r
  }, [generation]);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div\r
      ref={containerRef}\r
      className={['relative w-full h-full overflow-hidden', className].filter(Boolean).join(' ')}\r
      style={style}\r
    >\r
      <canvas ref={canvasRef} className="block w-full h-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Topography;\r
`,a={usage:`import Topography from './Topography';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <Topography
    color="#4f7cff"
    lineCount={22}
    lineWidth={1.2}
    elevation={1}
    foreground={0.2}
    tilt={32}
    speed={0.25}
    direction="forward"
    glow={0.6}
    depthOfField={0.4}
    fog={0.35}
    hoverEffect="lift"
    clickEffect="pulse"
  />
</div>`,code:r,css:n,tailwind:e,tsCode:t,tsTailwind:o};export{a as topography};
