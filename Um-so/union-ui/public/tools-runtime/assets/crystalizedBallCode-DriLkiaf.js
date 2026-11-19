const r=`'use client';\r
\r
import { useEffect, useMemo, useRef } from 'react';\r
import { Renderer, Program, Mesh, Triangle, Geometry, RenderTarget, Texture } from 'ogl';\r
\r
import './CrystalizedBall.css';\r
\r
const BALL_PRESETS = {\r
  plasma: {\r
    color: '#F25BD0',\r
    strands: 6,\r
    crackle: 0.85,\r
    flares: 0.65,\r
    glow: 0.9,\r
    sparks: 0.6,\r
    particleCount: 15000,\r
    fill: 0.5,\r
    motion: 'rise',\r
    particleShape: 'square',\r
    depth: 0.6,\r
    sway: 0.5,\r
    twinkle: 0.5,\r
    haze: 0.7,\r
    dustSpeed: 1\r
  },\r
  aurora: {\r
    color: '#5CFFC8',\r
    strands: 5,\r
    crackle: 0.6,\r
    flares: 0.5,\r
    glow: 0.8,\r
    sparks: 0.45,\r
    particleCount: 15000,\r
    fill: 0.5,\r
    motion: 'rise',\r
    particleShape: 'square',\r
    depth: 0.6,\r
    sway: 0.5,\r
    twinkle: 0.5,\r
    haze: 0.7,\r
    dustSpeed: 1\r
  },\r
  nebula: {\r
    color: '#9478FF',\r
    strands: 6,\r
    crackle: 1,\r
    flares: 0.5,\r
    glow: 0.9,\r
    sparks: 0.6,\r
    particleCount: 18000,\r
    fill: 0.45,\r
    motion: 'rise',\r
    particleShape: 'square',\r
    depth: 0.5,\r
    sway: 0.4,\r
    twinkle: 0.6,\r
    haze: 0.8,\r
    dustSpeed: 1.2\r
  },\r
  ember: {\r
    color: '#FF8A2A',\r
    strands: 5,\r
    crackle: 0.9,\r
    flares: 0.8,\r
    glow: 1,\r
    sparks: 0.8,\r
    particleCount: 12000,\r
    fill: 0.35,\r
    motion: 'rise',\r
    particleShape: 'round',\r
    depth: 0.7,\r
    sway: 0.3,\r
    twinkle: 0.7,\r
    haze: 0.9,\r
    dustSpeed: 1.6\r
  },\r
  frost: {\r
    color: '#BFE6FF',\r
    strands: 3,\r
    crackle: 0.3,\r
    flares: 0.3,\r
    glow: 0.6,\r
    sparks: 0.2,\r
    particleCount: 16000,\r
    fill: 0.6,\r
    motion: 'fall',\r
    particleShape: 'round',\r
    depth: 0.8,\r
    sway: 0.4,\r
    twinkle: 0.4,\r
    haze: 0.5,\r
    dustSpeed: 0.7\r
  },\r
  solar: {\r
    color: '#FFD36E',\r
    strands: 6,\r
    crackle: 0.7,\r
    flares: 1,\r
    glow: 1.1,\r
    sparks: 0.5,\r
    particleCount: 15000,\r
    fill: 0.55,\r
    motion: 'orbit',\r
    particleShape: 'square',\r
    depth: 0.6,\r
    sway: 0.7,\r
    twinkle: 0.5,\r
    haze: 0.8,\r
    dustSpeed: 1\r
  },\r
  eclipse: {\r
    color: '#FFFFFF',\r
    strands: 4,\r
    crackle: 0.5,\r
    flares: 0.4,\r
    glow: 0.7,\r
    sparks: 0.35,\r
    particleCount: 14000,\r
    fill: 0.5,\r
    motion: 'drift',\r
    particleShape: 'square',\r
    depth: 0.7,\r
    sway: 0.5,\r
    twinkle: 0.5,\r
    haze: 0.5,\r
    dustSpeed: 0.8\r
  },\r
  abyss: {\r
    color: '#3F7BFF',\r
    strands: 5,\r
    crackle: 0.55,\r
    flares: 0.6,\r
    glow: 0.9,\r
    sparks: 0.4,\r
    particleCount: 20000,\r
    fill: 0.8,\r
    motion: 'orbit',\r
    particleShape: 'round',\r
    depth: 0.8,\r
    sway: 0.8,\r
    twinkle: 0.5,\r
    haze: 0.6,\r
    dustSpeed: 0.9\r
  }\r
};\r
\r
const MOTIONS = { rise: 0, fall: 1, drift: 2, orbit: 3 };\r
const SHAPES = { square: 0, round: 1 };\r
const MAX_STRANDS = 8;\r
const MAX_ARCS = 4;\r
const MAX_PARTICLES = 40000;\r
const STATE_WIDTH = 256;\r
const PIXEL_BUDGET = 4.5e6;\r
const INTRO_SECONDS = 2.2;\r
const SETTLE_SECONDS = 7;\r
const WHITE = [1, 1, 1];\r
const BLACK = [0, 0, 0];\r
\r
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);\r
const smooth = (edge0, edge1, value) => {\r
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);\r
  return t * t * (3 - 2 * t);\r
};\r
const easeOut = t => 1 - Math.pow(1 - t, 3);\r
const mixColor = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);\r
const wrapAngle = a => a - Math.PI * 2 * Math.floor((a + Math.PI) / (Math.PI * 2));\r
\r
const parseColor = (value, fallback) => {\r
  try {\r
    const ctx = document.createElement('canvas').getContext('2d');\r
    if (!ctx) return fallback;\r
    ctx.fillStyle = '#000000';\r
    ctx.fillStyle = value;\r
    const resolved = ctx.fillStyle;\r
    if (resolved.startsWith('#')) {\r
      const n = parseInt(resolved.slice(1), 16);\r
      return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];\r
    }\r
    const parts = resolved.match(/[\\d.]+/g);\r
    if (!parts || parts.length < 3) return fallback;\r
    return [Number(parts[0]) / 255, Number(parts[1]) / 255, Number(parts[2]) / 255];\r
  } catch {\r
    return fallback;\r
  }\r
};\r
\r
const toLinear = c => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));\r
const toGamma = c => (c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);\r
\r
const toOklab = rgb => {\r
  const [r, g, b] = rgb.map(toLinear);\r
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);\r
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);\r
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);\r
  return [\r
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,\r
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,\r
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s\r
  ];\r
};\r
\r
const fromOklab = ([L, a, b]) => {\r
  const l = Math.pow(L + 0.3963377774 * a + 0.2158037573 * b, 3);\r
  const m = Math.pow(L - 0.1055613458 * a - 0.0638541728 * b, 3);\r
  const s = Math.pow(L - 0.0894841775 * a - 1.291485548 * b, 3);\r
  return [\r
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,\r
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,\r
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s\r
  ].map(v => clamp(toGamma(clamp(v, 0, 1)), 0, 1));\r
};\r
\r
const blend = (a, b, t) => fromOklab(mixColor(toOklab(a), toOklab(b), t));\r
\r
const shift = (rgb, hue, lightness, chroma) => {\r
  const [L, a, b] = toOklab(rgb);\r
  const c = Math.hypot(a, b) * chroma;\r
  const h = Math.atan2(b, a) + (hue * Math.PI) / 180;\r
  return fromOklab([clamp(L + lightness, 0, 1), c * Math.cos(h), c * Math.sin(h)]);\r
};\r
\r
const withLightness = (rgb, hue, lightness, chroma) => {\r
  const [, a, b] = toOklab(rgb);\r
  const c = Math.max(Math.hypot(a, b) * chroma, 0.02);\r
  const h = Math.atan2(b, a) + (hue * Math.PI) / 180;\r
  return fromOklab([clamp(lightness, 0, 1), c * Math.cos(h), c * Math.sin(h)]);\r
};\r
\r
const buildPalette = (color, light) => {\r
  if (light) {\r
    const ink = withLightness(color, 0, Math.min(toOklab(color)[0], 0.62), 1.15);\r
    return {\r
      rim: ink,\r
      rimHot: ink,\r
      rimMid: ink,\r
      rimDeep: withLightness(color, 0, 0.72, 0.8),\r
      spark: withLightness(color, 0, 0.6, 1.2),\r
      sparkGlow: withLightness(color, 0, 0.78, 0.8),\r
      haze: withLightness(color, 0, 0.8, 0.6),\r
      edge: withLightness(color, 0, 0.72, 0.8),\r
      tones: [\r
        withLightness(color, 0, 0.56, 1.1),\r
        withLightness(color, 16, 0.6, 1.05),\r
        withLightness(color, -16, 0.5, 1.1),\r
        withLightness(color, 0, 0.66, 0.9),\r
        withLightness(color, 0, 0.74, 0.7)\r
      ]\r
    };\r
  }\r
  return {\r
    rim: color,\r
    rimHot: mixColor(color, WHITE, 0.72),\r
    rimMid: mixColor(color, BLACK, 0.15),\r
    rimDeep: mixColor(color, BLACK, 0.45),\r
    spark: mixColor(color, WHITE, 0.45),\r
    sparkGlow: shift(color, 0, -0.15, 1),\r
    haze: mixColor(color, BLACK, 0.6),\r
    edge: shift(color, 0, -0.3, 0.9),\r
    tones: [\r
      shift(color, 0, -0.06, 1),\r
      shift(color, 16, -0.02, 1),\r
      shift(color, -16, -0.12, 1.05),\r
      shift(blend(color, WHITE, 0.25), 0, 0.04, 1),\r
      blend(color, WHITE, 0.7)\r
    ]\r
  };\r
};\r
\r
const seeded = start => {\r
  let state = start >>> 0;\r
  return () => {\r
    state = (state + 0x6d2b79f5) >>> 0;\r
    let t = state;\r
    t = Math.imul(t ^ (t >>> 15), t | 1);\r
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\r
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\r
  };\r
};\r
\r
const buildStrands = () => {\r
  const random = seeded(99);\r
  const bands = [\r
    [6, 12, 0.6, 1.6],\r
    [18, 34, 1.5, 3.5],\r
    [40, 70, 3, 7],\r
    [80, 130, 6, 12]\r
  ];\r
  const data = { harmonics: [], rates: [], phases: [], flareHarmonics: [], flareRates: [], flarePhases: [] };\r
  for (let s = 0; s < MAX_STRANDS; s++) {\r
    bands.forEach(([low, high, slow, fast]) => {\r
      data.harmonics.push(Math.round(low + random() * (high - low)));\r
      data.rates.push((slow + random() * (fast - slow)) * (random() < 0.5 ? -1 : 1));\r
      data.phases.push(random() * Math.PI * 2);\r
    });\r
    for (let j = 0; j < 3; j++) {\r
      data.flareHarmonics.push(4 + Math.floor(random() * 6));\r
      data.flareRates.push((0.4 + random() * 0.8) * (random() < 0.5 ? -1 : 1));\r
      data.flarePhases.push(random() * Math.PI * 2);\r
    }\r
    const lead = s === 0;\r
    data.flareHarmonics.push(lead ? 0.75 : 0.95 + random() * 0.3);\r
    data.flareRates.push(lead ? 1.15 : 0.8 + random() * 0.2);\r
    data.flarePhases.push(lead ? 1 : 0.7 + random() * 0.25);\r
  }\r
  return data;\r
};\r
\r
const buildDust = count => {\r
  const random = seeded(1337);\r
  const rows = Math.max(1, Math.ceil(count / STATE_WIDTH));\r
  const home = new Float32Array(STATE_WIDTH * rows * 4);\r
  const seed = new Float32Array(STATE_WIDTH * rows * 4);\r
  let k = 0;\r
  let guard = 0;\r
  while (k < count && guard < count * 80) {\r
    guard++;\r
    let x;\r
    let y;\r
    let tone;\r
    if (random() < 0.28) {\r
      const angle = random() * Math.PI * 2;\r
      const radius = 0.87 + Math.sqrt(random()) * 0.105;\r
      x = Math.cos(angle) * radius;\r
      y = Math.sin(angle) * radius;\r
      if (random() > smooth(-0.6, 0.3, -y)) continue;\r
      const q = random();\r
      tone = q < 0.5 ? 3 : q < 0.8 ? 2 : 1;\r
    } else {\r
      x = random() * 2 - 1;\r
      y = random() * 2 - 1;\r
      const radius = Math.hypot(x, y);\r
      if (radius > 0.975) continue;\r
      const bowl = Math.pow(smooth(-0.25, 0.85, -y), 1.3);\r
      const band = smooth(0.66, 0.96, radius) * smooth(-0.7, 0.3, -y);\r
      const weight = Math.max(bowl, band * 0.9);\r
      if (random() > 0.012 + 0.988 * weight) continue;\r
      if (weight < 0.12) tone = 4;\r
      else {\r
        const q = random();\r
        tone = q < 0.32 ? 0 : q < 0.52 ? 1 : q < 0.8 ? 2 : 3;\r
      }\r
    }\r
    const chord = Math.sqrt(Math.max(0, 0.95 - x * x - y * y));\r
    home[k * 4] = x;\r
    home[k * 4 + 1] = y;\r
    home[k * 4 + 2] = (random() * 2 - 1) * chord;\r
    home[k * 4 + 3] = tone;\r
    seed[k * 4] = tone === 4 ? 1.8 : random() < 0.22 ? 2.1 : 1.3;\r
    seed[k * 4 + 1] = random();\r
    seed[k * 4 + 2] = 2.5 + random() * 3.5;\r
    seed[k * 4 + 3] = 0.16 + random() * 0.26;\r
    k++;\r
  }\r
  return { home, seed, count: k, rows };\r
};\r
\r
const passVertex = \`#version 300 es\r
in vec2 position;\r
in vec2 uv;\r
out vec2 vUv;\r
void main() {\r
  vUv = uv;\r
  gl_Position = vec4(position, 0.0, 1.0);\r
}\r
\`;\r
\r
const hashChunk = \`\r
uint scramble(uint v) {\r
  v = v * 747796405u + 2891336453u;\r
  uint w = ((v >> ((v >> 28u) + 4u)) ^ v) * 277803737u;\r
  return (w >> 22u) ^ w;\r
}\r
\r
float random(uint v) {\r
  return float(scramble(v)) * (1.0 / 4294967295.0);\r
}\r
\`;\r
\r
const dustChunk = \`\r
uniform float uDustTime;\r
uniform vec2 uTurn;\r
uniform float uMotion;\r
uniform float uFill;\r
\r
vec3 settle(vec3 p, out float spread) {\r
  float bend = exp2((0.5 - uFill) * 1.8);\r
  float h = clamp((p.y + 1.0) * 0.5, 0.0, 1.0);\r
  float y = 2.0 * pow(h, bend) - 1.0;\r
  float from = sqrt(max(1.0 - p.y * p.y, 1e-4));\r
  float to = sqrt(max(1.0 - y * y, 0.0));\r
  spread = clamp(bend * pow(max(h, 1e-3), bend - 1.0) * to / from, 0.25, 1.0);\r
  return vec3(p.xz * (to / from), y).xzy;\r
}\r
\r
vec3 drift(vec4 home, vec4 seed, uint id, out float life, out float spread) {\r
  vec3 p = settle(home.xyz, spread);\r
  float t = uDustTime;\r
  float u = fract(t / seed.z + seed.y);\r
  life = sin(3.14159265 * u);\r
  float travel = seed.w;\r
  if (uMotion < 0.5) {\r
    p.y += travel * (u - 0.5);\r
  } else if (uMotion < 1.5) {\r
    p.y -= travel * (u - 0.5);\r
  } else if (uMotion < 2.5) {\r
    p += 0.045 * vec3(\r
      sin(t * 0.37 + seed.y * 17.0) + 0.5 * sin(t * 0.83 + seed.z * 5.0),\r
      sin(t * 0.29 + seed.z * 11.0) + 0.5 * sin(t * 0.61 + seed.w * 7.0),\r
      sin(t * 0.33 + seed.w * 23.0)\r
    );\r
  } else {\r
    float loop = t * (0.6 + 0.9 * random(id * 7u + 3u)) * (random(id * 7u + 10u) < 0.5 ? -1.0 : 1.0) + seed.y * 6.2831853;\r
    p.xy += (0.025 + 0.05 * random(id * 7u + 16u)) * vec2(cos(loop), sin(loop));\r
  }\r
  float wobble = 0.002 + 0.006 * random(id * 7u + 1u);\r
  float w1 = 0.8 + 2.4 * random(id * 7u + 2u);\r
  float w2 = 0.8 + 2.4 * random(id * 7u + 4u);\r
  p += wobble * vec3(sin(t * w1 + seed.y * 40.0), cos(t * w2 + seed.z * 30.0), sin(t * (w1 + w2) * 0.5 + seed.w * 20.0));\r
  float cy = cos(uTurn.x);\r
  float sy = sin(uTurn.x);\r
  p.xz = mat2(cy, -sy, sy, cy) * p.xz;\r
  float cx = cos(uTurn.y);\r
  float sx = sin(uTurn.y);\r
  p.yz = mat2(cx, -sx, sx, cx) * p.yz;\r
  return p;\r
}\r
\`;\r
\r
const fieldFragment = \`#version 300 es\r
precision highp float;\r
\r
uniform vec2 uCenter;\r
uniform float uRadius;\r
uniform float uDpr;\r
uniform float uLine;\r
uniform float uTime;\r
uniform float uFrame;\r
uniform float uBins;\r
uniform float uStrands;\r
uniform float uCrackle;\r
uniform float uFlares;\r
uniform float uGlow;\r
uniform float uHaze;\r
uniform float uFill;\r
uniform float uPresence;\r
uniform float uUnfold;\r
uniform float uBloom;\r
uniform float uInside;\r
uniform float uEncode;\r
uniform vec3 uRim;\r
uniform vec3 uRimHot;\r
uniform vec3 uRimMid;\r
uniform vec3 uRimDeep;\r
uniform vec3 uSpark;\r
uniform vec3 uSparkGlow;\r
uniform vec3 uHazeColor;\r
uniform vec3 uEdgeColor;\r
uniform vec4 uHeat;\r
uniform vec4 uHarmonics[8];\r
uniform vec4 uRates[8];\r
uniform vec4 uPhases[8];\r
uniform vec4 uFlareHarmonics[8];\r
uniform vec4 uFlareRates[8];\r
uniform vec4 uFlarePhases[8];\r
uniform vec4 uArcs[4];\r
\r
out vec4 fragColor;\r
\${hashChunk}\r
const float PI = 3.14159265;\r
const float TAU = 6.28318531;\r
const vec4 AMPS = vec4(0.35, 0.3, 0.22, 0.13);\r
\r
float bell(float d, float w) {\r
  float x = d / w;\r
  return exp(-x * x);\r
}\r
\r
float segment(vec2 p, vec2 a, vec2 b) {\r
  vec2 pa = p - a;\r
  vec2 ba = b - a;\r
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-5), 0.0, 1.0);\r
  return length(pa - ba * h);\r
}\r
\r
float pool(vec2 q) {\r
  float t = length(q - vec2(0.0, mix(-1.0, -0.66, uFill))) / mix(0.8, 1.35, uFill);\r
  return t < 0.6 ? mix(0.5, 0.22, t / 0.6) : mix(0.22, 0.0, clamp((t - 0.6) / 0.4, 0.0, 1.0));\r
}\r
\r
void main() {\r
  vec2 p = gl_FragCoord.xy / uDpr - uCenter;\r
  float r = length(p);\r
  float R = uRadius;\r
  float theta = atan(p.y, p.x);\r
  float lift = p.y / max(r, 1e-3);\r
  float topDim = 1.0 - 0.35 * pow(max(lift, 0.0), 1.5);\r
  vec3 col = vec3(0.0);\r
  float hot = 0.0;\r
  uint frame = uint(uFrame);\r
\r
  if (r < R) {\r
    vec2 q = p / R;\r
    float chord = sqrt(max(1.0 - dot(q, q), 0.0));\r
    float haze = pool(q) * (0.55 + 0.45 * chord);\r
    col += uHazeColor * haze * uHaze * uInside;\r
    float e = length(q - vec2(0.0, 0.2)) / 1.2;\r
    float edge = 0.5 * pow(smoothstep(0.62, 1.0, e), 1.4);\r
    col += uEdgeColor * edge * uInside * (0.5 + 0.5 * uHaze);\r
  }\r
\r
  float dr = r - R;\r
  float halo = 1.0 - smoothstep(R * 0.05, R * 0.105, abs(dr - R * 0.0213));\r
  col += uRimDeep * 0.18 * halo * topDim * uGlow * uBloom;\r
  col += uRim * 0.12 * bell(dr + R * 0.0383, R * 0.032) * uGlow * uBloom;\r
  col += uRim * 0.32 * bell(dr, max(R * 0.0117, uLine)) * uPresence * uUnfold;\r
\r
  float delta = mod(theta - uHeat.x + PI, TAU) - PI;\r
  float heat = uHeat.z * uHeat.y * exp(-delta * delta / 0.3);\r
  float crackle = uCrackle + heat * 0.9;\r
  float amp = R * 0.016 * (0.3 + 1.4 * crackle) * uUnfold;\r
  float jitterAmp = R * 0.0048 * (0.3 + 1.4 * uCrackle) * uUnfold * (1.0 + heat * 0.3);\r
  float flareAmp = R * 0.064 * (0.4 + 1.2 * crackle) * uFlares * 1.6 * uUnfold;\r
\r
  if (abs(dr) < amp * 2.0 + flareAmp + R * 0.3) {\r
    float step = TAU / uBins;\r
    float binPos = (theta + PI) / step;\r
    float bin0 = floor(binPos);\r
    float binF = binPos - bin0;\r
    float th0 = bin0 * step - PI;\r
    float th1 = th0 + step;\r
    uint b0 = uint(mod(bin0, uBins));\r
    uint b1 = uint(mod(bin0 + 1.0, uBins));\r
    float gain = min(1.0, 2.4 / max(uStrands, 1.0));\r
    for (int k = 0; k < 8; k++) {\r
      if (float(k) >= uStrands) break;\r
      vec4 m = uHarmonics[k];\r
      vec4 lead = uRates[k] * uTime + uPhases[k];\r
      float wave0 = dot(AMPS, sin(m * th0 + lead));\r
      float wave1 = dot(AMPS, sin(m * th1 + lead));\r
      uint salt = uint(k) * 1013u + frame * 7919u;\r
      vec4 shape = uFlareHarmonics[k];\r
      vec4 look = uFlareRates[k];\r
      vec4 tone = uFlarePhases[k];\r
      float a = amp * shape.w;\r
      float off0 = a * wave0 + jitterAmp * (random(b0 + salt) - 0.5);\r
      float off1 = a * wave1 + jitterAmp * (random(b1 + salt) - 0.5);\r
      float rc = R + mix(off0, off1, binF);\r
      float grade = (off1 - off0) / (step * max(r, 1.0));\r
      float d = abs(r - rc) * inversesqrt(1.0 + grade * grade);\r
      float swell = 0.8 + 0.4 * (0.5 + 0.5 * sin(3.0 * theta + uTime * 0.7 + tone.x * 1.7));\r
      float width = uLine * look.w * swell * (1.0 + heat * 0.25);\r
      float core = exp(-d * d / (width * width));\r
      float sheath = exp(-d * d / (width * width * 3.0));\r
      float bright = tone.w * (1.0 + heat * 0.45) * uPresence;\r
      col += (uRimHot * core * 0.8 + uRim * sheath * 0.32) * bright;\r
      hot += core * bright;\r
      vec3 fargs = shape.xyz * theta + look.xyz * uTime + tone.xyz;\r
      float flare = max(0.0, (sin(fargs.x) + sin(fargs.y) + sin(fargs.z)) / 3.0);\r
      flare = (flare * flare + heat * 0.35) * flareAmp;\r
      float dw = abs(r - rc - flare);\r
      float dm = abs(r - rc - flare * 0.6);\r
      float dn = abs(r - rc - flare * 0.25);\r
      vec3 glow = uRimDeep * (0.07 * bell(dw, R * 0.09) + 0.16 * bell(dw, R * 0.05));\r
      glow += uRimMid * 0.28 * bell(dm, R * 0.027) + uRim * 0.38 * bell(dn, R * 0.013);\r
      col += glow * gain * topDim * uGlow * uBloom * (1.0 + heat * 1.4);\r
    }\r
  }\r
\r
  for (int i = 0; i < 4; i++) {\r
    vec4 arc = uArcs[i];\r
    if (arc.w <= 0.002) continue;\r
    float mid = arc.x + arc.y * 0.5;\r
    vec2 center = R * 0.93 * vec2(cos(mid), sin(mid));\r
    if (distance(p, center) > R * (abs(arc.y) * 0.6 + 0.1) + 12.0) continue;\r
    float ar = R * 0.955;\r
    vec2 a0 = ar * vec2(cos(arc.x), sin(arc.x));\r
    vec2 a2 = ar * vec2(cos(arc.x + arc.y), sin(arc.x + arc.y));\r
    vec2 a1 = R * (0.955 - arc.z) * vec2(cos(mid), sin(mid));\r
    float dmin = 1e5;\r
    float along = 0.0;\r
    vec2 prev = a0;\r
    for (int s = 1; s <= 10; s++) {\r
      float u = float(s) / 10.0;\r
      vec2 b = mix(mix(a0, a1, u), mix(a1, a2, u), u);\r
      vec2 pa = p - prev;\r
      vec2 ba = b - prev;\r
      float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-5), 0.0, 1.0);\r
      float dist = length(pa - ba * h);\r
      if (dist < dmin) {\r
        dmin = dist;\r
        along = (float(s) - 1.0 + h) / 10.0;\r
      }\r
      prev = b;\r
    }\r
    float taper = sqrt(max(sin(PI * along), 0.0));\r
    float arcWidth = uLine * (0.55 + 0.6 * taper);\r
    float arcCore = exp(-dmin * dmin / (arcWidth * arcWidth));\r
    float arcGlow = exp(-dmin * dmin / (arcWidth * arcWidth * 12.0));\r
    col += (uSpark * 0.95 * arcCore + uSparkGlow * 0.4 * arcGlow) * arc.w * taper;\r
    hot += arcCore * arc.w * taper * 0.6;\r
  }\r
\r
  fragColor = vec4(col, hot) * uEncode;\r
}\r
\`;\r
\r
const dustVertex = \`#version 300 es\r
precision highp float;\r
\r
in float aIndex;\r
\r
uniform sampler2D tHome;\r
uniform sampler2D tSeed;\r
uniform sampler2D tOffset;\r
uniform float uStirred;\r
uniform vec2 uCenter;\r
uniform vec2 uViewport;\r
uniform float uRadius;\r
uniform float uDpr;\r
uniform float uDepth;\r
uniform float uTwinkle;\r
uniform float uPointScale;\r
uniform float uReveal;\r
uniform float uEncode;\r
uniform vec3 uTones[5];\r
uniform vec3 uRimTone;\r
\r
out vec3 vColor;\r
out float vSize;\r
\${hashChunk}\r
\${dustChunk}\r
void main() {\r
  ivec2 cell = ivec2(int(mod(aIndex, \${STATE_WIDTH}.0)), int(floor(aIndex / \${STATE_WIDTH}.0)));\r
  uint id = uint(aIndex);\r
  vec4 home = texelFetch(tHome, cell, 0);\r
  vec4 seed = texelFetch(tSeed, cell, 0);\r
  float life;\r
  float spread;\r
  vec3 p = drift(home, seed, id, life, spread);\r
  if (uStirred > 0.5) p += texelFetch(tOffset, cell, 0).xyz;\r
  float len = length(p);\r
  float inside = 1.0 - smoothstep(0.955, 0.985, length(p.xy));\r
  if (len > 0.975) p *= 0.975 / len;\r
\r
  float front = p.z * 0.5 + 0.5;\r
  float depthSize = mix(1.0, 0.7 + 0.6 * front, uDepth);\r
  float depthLight = mix(1.0, 0.35 + 0.8 * front, uDepth);\r
  float blink = sin(uDustTime * (2.0 + 6.0 * random(id * 7u + 5u)) + random(id * 7u + 6u) * 6.2831853);\r
  float twinkle = mix(1.0, smoothstep(-0.9, -0.6, blink), uTwinkle);\r
  float fade = smoothstep(0.04, 0.12, life);\r
  float order = (home.y + 1.0) * 0.5 * 0.55 + random(id * 7u + 8u) * 0.25;\r
  float reveal = smoothstep(order, order + 0.2, uReveal * 1.0);\r
  float alpha = random(id * 7u + 9u) < 0.5 || home.w > 3.5 ? 1.0 : 0.6;\r
\r
  float size = seed.x * uPointScale * (0.35 + 0.95 * life) * depthSize * mix(0.5, 1.0, reveal);\r
  vec2 screen = uCenter + p.xy * uRadius;\r
  gl_Position = vec4(screen / uViewport * 2.0 - 1.0, 0.0, 1.0);\r
  float px = size * uDpr;\r
  gl_PointSize = px + 2.0;\r
  vSize = px;\r
\r
  int tone = int(home.w + 0.5);\r
  float rimLit = smoothstep(0.8, 0.97, length(p.xy));\r
  vec3 color = uTones[tone] + uRimTone * rimLit * rimLit * 0.12;\r
  vColor = color * alpha * fade * twinkle * depthLight * reveal * inside * sqrt(spread) * uEncode;\r
}\r
\`;\r
\r
const dustFragment = \`#version 300 es\r
precision highp float;\r
\r
uniform float uShape;\r
\r
in vec3 vColor;\r
in float vSize;\r
\r
out vec4 fragColor;\r
\r
void main() {\r
  vec2 q = (gl_PointCoord - 0.5) * (vSize + 2.0);\r
  float half_ = max(vSize * 0.5, 0.5);\r
  float cover;\r
  if (uShape < 0.5) {\r
    vec2 c = clamp(half_ - abs(q) + 0.5, 0.0, 1.0);\r
    cover = c.x * c.y;\r
  } else {\r
    cover = clamp(half_ - length(q) + 0.5, 0.0, 1.0);\r
  }\r
  if (cover <= 0.0) discard;\r
  fragColor = vec4(vColor * cover, 0.0);\r
}\r
\`;\r
\r
const stirFragment = \`#version 300 es\r
precision highp float;\r
\r
uniform sampler2D tHome;\r
uniform sampler2D tSeed;\r
uniform sampler2D tOffset;\r
uniform sampler2D tVelocity;\r
uniform float uDt;\r
uniform float uReset;\r
uniform vec4 uBrush;\r
uniform float uBrushPower;\r
uniform vec4 uKick;\r
\r
layout(location = 0) out vec4 outOffset;\r
layout(location = 1) out vec4 outVelocity;\r
\${hashChunk}\r
\${dustChunk}\r
vec3 swirl(vec3 p) {\r
  float t = uDustTime * 0.15;\r
  vec3 a = vec3(1.7, 1.9, 1.5) * p.yzx + vec3(t, 1.2, 2.1);\r
  vec3 b = vec3(2.3, 2.1, 2.7) * p.zxy + vec3(0.4, t * 1.3, 0.9);\r
  vec3 ca = cos(a) * vec3(1.7, 1.9, 1.5);\r
  vec3 cb = cos(b) * vec3(2.3, 2.1, 2.7);\r
  return vec3(ca.z - cb.x, cb.y - ca.x, ca.y - cb.z);\r
}\r
\r
void main() {\r
  ivec2 cell = ivec2(gl_FragCoord.xy);\r
  if (uReset > 0.5) {\r
    outOffset = vec4(0.0);\r
    outVelocity = vec4(0.0);\r
    return;\r
  }\r
  uint id = uint(cell.y * \${STATE_WIDTH} + cell.x);\r
  vec4 home = texelFetch(tHome, cell, 0);\r
  vec4 seed = texelFetch(tSeed, cell, 0);\r
  vec3 o = texelFetch(tOffset, cell, 0).xyz;\r
  vec3 v = texelFetch(tVelocity, cell, 0).xyz;\r
  float life;\r
  float spread;\r
  vec3 base = drift(home, seed, id, life, spread);\r
  vec3 p = base + o;\r
\r
  float k = mix(0.8, 2.2, random(id * 7u + 11u));\r
  vec3 acc = -k * o - 1.5 * sqrt(k) * v;\r
\r
  vec2 gap = p.xy - uBrush.xy;\r
  float touch = exp(-dot(gap, gap) / 0.07) * uBrushPower;\r
  acc += (vec3(uBrush.zw, 0.0) - v) * touch * 14.0;\r
  float pace = length(v);\r
  if (pace > 1e-4) {\r
    vec3 heading = v / pace;\r
    vec3 curl = swirl(p * 1.6);\r
    acc += (curl - heading * dot(curl, heading)) * min(pace, 2.0) * 1.8;\r
  }\r
\r
  if (uKick.z > 0.0) {\r
    vec3 jolt = vec3(random(id * 7u + 12u), random(id * 7u + 13u), random(id * 7u + 14u)) - 0.5;\r
    float near = exp(-dot(p.xy - uKick.xy, p.xy - uKick.xy) / 0.4);\r
    vec3 spinKick = vec3(-p.z, 0.0, p.x) * 0.9;\r
    vec3 lift = vec3(0.0, 0.5 + 0.8 * random(id * 7u + 15u), 0.0) * (0.3 + 0.7 * smoothstep(0.2, -0.8, p.y));\r
    v += (jolt * 0.8 + spinKick + lift) * uKick.z * (0.4 + 0.45 * near);\r
  }\r
\r
  v += acc * uDt;\r
  o += v * uDt;\r
  vec3 q = base + o;\r
  float len = length(q);\r
  if (len > 0.97) {\r
    vec3 n = q / len;\r
    o -= n * (len - 0.97);\r
    v -= n * max(dot(v, n), 0.0) * 1.5;\r
  }\r
  outOffset = vec4(o, 1.0);\r
  outVelocity = vec4(v, 1.0);\r
}\r
\`;\r
\r
const compositeFragment = \`#version 300 es\r
precision highp float;\r
\r
uniform sampler2D tScene;\r
uniform float uLight;\r
uniform float uDecode;\r
\r
in vec2 vUv;\r
out vec4 fragColor;\r
\r
vec3 soften(vec3 x) {\r
  vec3 over = max(x - 0.6, 0.0);\r
  return min(x, 0.6) + 0.4 * (1.0 - exp(-over / 0.4));\r
}\r
\r
void main() {\r
  vec4 scene = texture(tScene, vUv) * uDecode;\r
  vec3 light = max(scene.rgb, 0.0);\r
  float peak = max(light.r, max(light.g, light.b));\r
  if (uLight > 0.5) {\r
    vec3 hue = light / max(peak, 1e-4);\r
    float cover = 1.0 - exp(-peak * 2.4);\r
    vec3 ink = hue * mix(0.92, 0.72, cover);\r
    float core = clamp(scene.a * 0.7, 0.0, 1.0) * cover;\r
    vec3 tint = mix(vec3(1.0), hue, 0.22);\r
    fragColor = vec4(tint * core + ink * cover * (1.0 - core), core + cover * (1.0 - core));\r
    return;\r
  }\r
  light += vec3(max(peak - 1.8, 0.0) * 0.25);\r
  vec3 shown = soften(light);\r
  fragColor = vec4(shown, max(shown.r, max(shown.g, shown.b)));\r
}\r
\`;\r
\r
const CrystalizedBall = ({\r
  preset = 'plasma',\r
  color,\r
  theme = 'dark',\r
  size = 0.7,\r
  strands,\r
  crackle,\r
  flares,\r
  glow,\r
  sparks,\r
  particleCount,\r
  fill,\r
  motion,\r
  particleShape,\r
  depth,\r
  sway,\r
  twinkle,\r
  haze,\r
  speed = 1,\r
  dustSpeed,\r
  interactive = true,\r
  hoverStrength = 0.7,\r
  intro = true,\r
  paused = false,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const settingsRef = useRef(null);\r
  const wakeRef = useRef(null);\r
\r
  const base = BALL_PRESETS[preset] || BALL_PRESETS.plasma;\r
  const pick = (value, key) => (value === undefined || value === null ? base[key] : value);\r
  const tint = pick(color, 'color');\r
\r
  const colors = useMemo(() => {\r
    const light = theme === 'light';\r
    return { light, palette: buildPalette(parseColor(tint, [0.95, 0.36, 0.82]), light) };\r
  }, [tint, theme]);\r
\r
  useEffect(() => {\r
    settingsRef.current = {\r
      ...colors,\r
      size,\r
      strands: pick(strands, 'strands'),\r
      crackle: pick(crackle, 'crackle'),\r
      flares: pick(flares, 'flares'),\r
      glow: pick(glow, 'glow'),\r
      sparks: pick(sparks, 'sparks'),\r
      particleCount: pick(particleCount, 'particleCount'),\r
      fill: pick(fill, 'fill'),\r
      motion: pick(motion, 'motion'),\r
      particleShape: pick(particleShape, 'particleShape'),\r
      depth: pick(depth, 'depth'),\r
      sway: pick(sway, 'sway'),\r
      twinkle: pick(twinkle, 'twinkle'),\r
      haze: pick(haze, 'haze'),\r
      dustSpeed: pick(dustSpeed, 'dustSpeed'),\r
      speed,\r
      interactive,\r
      hoverStrength,\r
      intro,\r
      paused\r
    };\r
    wakeRef.current?.();\r
  });\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    if (!container) return undefined;\r
\r
    const renderer = new Renderer({ alpha: true, premultipliedAlpha: true, antialias: false, depth: false });\r
    const gl = renderer.gl;\r
    if (!renderer.isWebgl2) {\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
      return undefined;\r
    }\r
    const canvas = gl.canvas;\r
    canvas.style.display = 'block';\r
    canvas.style.width = '100%';\r
    canvas.style.height = '100%';\r
    canvas.setAttribute('aria-hidden', 'true');\r
    container.appendChild(canvas);\r
\r
    const fullFloat = !!gl.getExtension('EXT_color_buffer_float');\r
    const halfFloat = fullFloat || !!gl.getExtension('EXT_color_buffer_half_float');\r
    const encode = halfFloat ? 1 : 0.25;\r
    const geometry = new Triangle(gl);\r
    const blank = new Texture(gl);\r
    const strandData = buildStrands();\r
\r
    const sceneTarget = new RenderTarget(gl, {\r
      width: 1,\r
      height: 1,\r
      depth: false,\r
      type: halfFloat ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE,\r
      format: gl.RGBA,\r
      internalFormat: halfFloat ? gl.RGBA16F : gl.RGBA,\r
      minFilter: gl.NEAREST,\r
      magFilter: gl.NEAREST\r
    });\r
\r
    const arcData = new Array(MAX_ARCS * 4).fill(0);\r
    const fieldUniforms = {\r
      uCenter: { value: [0, 0] },\r
      uRadius: { value: 1 },\r
      uDpr: { value: 1 },\r
      uLine: { value: 0.6 },\r
      uTime: { value: 0 },\r
      uFrame: { value: 0 },\r
      uBins: { value: 420 },\r
      uStrands: { value: 5 },\r
      uCrackle: { value: 0.6 },\r
      uFlares: { value: 0.5 },\r
      uGlow: { value: 0.8 },\r
      uHaze: { value: 0.7 },\r
      uFill: { value: 0.5 },\r
      uPresence: { value: 0 },\r
      uUnfold: { value: 0 },\r
      uBloom: { value: 0 },\r
      uInside: { value: 0 },\r
      uEncode: { value: encode },\r
      uRim: { value: [1, 1, 1] },\r
      uRimHot: { value: [1, 1, 1] },\r
      uRimMid: { value: [1, 1, 1] },\r
      uRimDeep: { value: [1, 1, 1] },\r
      uSpark: { value: [1, 1, 1] },\r
      uSparkGlow: { value: [1, 1, 1] },\r
      uHazeColor: { value: [0, 0, 0] },\r
      uEdgeColor: { value: [0, 0, 0] },\r
      uHeat: { value: [0, 0, 0, 0] },\r
      uHarmonics: { value: strandData.harmonics },\r
      uRates: { value: strandData.rates },\r
      uPhases: { value: strandData.phases },\r
      uFlareHarmonics: { value: strandData.flareHarmonics },\r
      uFlareRates: { value: strandData.flareRates },\r
      uFlarePhases: { value: strandData.flarePhases },\r
      uArcs: { value: arcData }\r
    };\r
\r
    const dustShared = {\r
      uDustTime: { value: 0 },\r
      uTurn: { value: [0, 0] },\r
      uMotion: { value: 0 },\r
      uFill: fieldUniforms.uFill,\r
      tHome: { value: blank },\r
      tSeed: { value: blank }\r
    };\r
\r
    const dustUniforms = {\r
      ...dustShared,\r
      tOffset: { value: blank },\r
      uStirred: { value: 0 },\r
      uCenter: fieldUniforms.uCenter,\r
      uViewport: { value: [1, 1] },\r
      uRadius: fieldUniforms.uRadius,\r
      uDpr: fieldUniforms.uDpr,\r
      uDepth: { value: 0.6 },\r
      uTwinkle: { value: 0.5 },\r
      uPointScale: { value: 1 },\r
      uReveal: { value: 0 },\r
      uEncode: { value: encode },\r
      uTones: { value: new Array(15).fill(1) },\r
      uRimTone: { value: [1, 1, 1] },\r
      uShape: { value: 0 }\r
    };\r
\r
    const stirUniforms = {\r
      ...dustShared,\r
      tOffset: { value: blank },\r
      tVelocity: { value: blank },\r
      uDt: { value: 0.016 },\r
      uReset: { value: 1 },\r
      uBrush: { value: [0, 0, 0, 0] },\r
      uBrushPower: { value: 0 },\r
      uKick: { value: [0, 0, 0, 0] }\r
    };\r
\r
    const compositeUniforms = {\r
      tScene: { value: sceneTarget.texture },\r
      uLight: { value: 0 },\r
      uDecode: { value: 1 / encode }\r
    };\r
\r
    const additive = program => {\r
      program.setBlendFunc(gl.ONE, gl.ONE);\r
      return program;\r
    };\r
\r
    const fieldMesh = new Mesh(gl, {\r
      geometry,\r
      program: additive(\r
        new Program(gl, {\r
          vertex: passVertex,\r
          fragment: fieldFragment,\r
          uniforms: fieldUniforms,\r
          transparent: true,\r
          depthTest: false,\r
          depthWrite: false\r
        })\r
      )\r
    });\r
    const dustProgram = additive(\r
      new Program(gl, {\r
        vertex: dustVertex,\r
        fragment: dustFragment,\r
        uniforms: dustUniforms,\r
        transparent: true,\r
        depthTest: false,\r
        depthWrite: false\r
      })\r
    );\r
    const stirMesh = halfFloat\r
      ? new Mesh(gl, {\r
          geometry,\r
          program: new Program(gl, {\r
            vertex: passVertex,\r
            fragment: stirFragment,\r
            uniforms: stirUniforms,\r
            depthTest: false,\r
            depthWrite: false\r
          })\r
        })\r
      : null;\r
    const compositeMesh = new Mesh(gl, {\r
      geometry,\r
      program: new Program(gl, {\r
        vertex: passVertex,\r
        fragment: compositeFragment,\r
        uniforms: compositeUniforms,\r
        depthTest: false,\r
        depthWrite: false\r
      })\r
    });\r
\r
    const disposeTarget = target => {\r
      if (!target) return;\r
      gl.deleteFramebuffer(target.buffer);\r
      target.textures.forEach(texture => gl.deleteTexture(texture.texture));\r
    };\r
\r
    const stateTarget = rows =>\r
      new RenderTarget(gl, {\r
        width: STATE_WIDTH,\r
        height: rows,\r
        color: 2,\r
        depth: false,\r
        type: fullFloat ? gl.FLOAT : gl.HALF_FLOAT,\r
        format: gl.RGBA,\r
        internalFormat: fullFloat ? gl.RGBA32F : gl.RGBA16F,\r
        minFilter: gl.NEAREST,\r
        magFilter: gl.NEAREST\r
      });\r
\r
    const dataTexture = (data, rows) =>\r
      new Texture(gl, {\r
        image: data,\r
        width: STATE_WIDTH,\r
        height: rows,\r
        type: gl.FLOAT,\r
        format: gl.RGBA,\r
        internalFormat: gl.RGBA32F,\r
        minFilter: gl.NEAREST,\r
        magFilter: gl.NEAREST,\r
        generateMipmaps: false,\r
        flipY: false\r
      });\r
\r
    let dust = null;\r
\r
    const disposeDust = () => {\r
      if (!dust) return;\r
      dust.mesh.geometry.remove();\r
      gl.deleteTexture(dust.home.texture);\r
      gl.deleteTexture(dust.seed.texture);\r
      disposeTarget(dust.read);\r
      disposeTarget(dust.write);\r
      dust = null;\r
    };\r
\r
    const resetStir = () => {\r
      if (!stirMesh || !dust || !dust.read || !dust.write) return;\r
      stirUniforms.tOffset.value = blank;\r
      stirUniforms.tVelocity.value = blank;\r
      stirUniforms.uReset.value = 1;\r
      renderer.render({ scene: stirMesh, target: dust.read, clear: false });\r
      renderer.render({ scene: stirMesh, target: dust.write, clear: false });\r
      stirUniforms.uReset.value = 0;\r
    };\r
\r
    const rebuildDust = requested => {\r
      const total = clamp(Math.round(requested / 100) * 100, 0, MAX_PARTICLES);\r
      if (dust && dust.requested === total) return;\r
      disposeDust();\r
      if (!total) {\r
        dust = null;\r
        return;\r
      }\r
      const data = buildDust(total);\r
      const indices = new Float32Array(data.count);\r
      for (let i = 0; i < data.count; i++) indices[i] = i;\r
      const points = new Geometry(gl, { aIndex: { size: 1, data: indices } });\r
      dust = {\r
        requested: total,\r
        rows: data.rows,\r
        home: dataTexture(data.home, data.rows),\r
        seed: dataTexture(data.seed, data.rows),\r
        mesh: new Mesh(gl, { mode: gl.POINTS, geometry: points, program: dustProgram }),\r
        read: stirMesh ? stateTarget(data.rows) : null,\r
        write: stirMesh ? stateTarget(data.rows) : null\r
      };\r
      dustShared.tHome.value = dust.home;\r
      dustShared.tSeed.value = dust.seed;\r
      resetStir();\r
      stirring = 0;\r
    };\r
\r
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const random = seeded(913);\r
\r
    let width = 1;\r
    let height = 1;\r
    let raf = 0;\r
    let last = performance.now();\r
    let rimTime = 0;\r
    let dustTime = 0;\r
    let swayClock = 0;\r
    let introClock = 0;\r
    let visible = true;\r
    let alive = true;\r
    let surge = 0;\r
    let stirring = 0;\r
    let stirEnergy = 0;\r
    let kick = null;\r
    let nextArc = 0.3;\r
    const arcs = [];\r
    const pointer = { x: 0, y: 0, inside: false, fresh: true };\r
    const heat = { angle: 0, velocity: 0, power: 0, near: 0 };\r
    const brush = { x: 0, y: 0, vx: 0, vy: 0 };\r
    const look = { x: 0, y: 0, vx: 0, vy: 0 };\r
\r
    const resize = () => {\r
      width = Math.max(1, container.clientWidth);\r
      height = Math.max(1, container.clientHeight);\r
      renderer.dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(PIXEL_BUDGET / (width * height)));\r
      renderer.setSize(width, height);\r
      sceneTarget.setSize(gl.canvas.width, gl.canvas.height);\r
      start();\r
    };\r
\r
    const spawnArc = (angle, strength) => {\r
      if (arcs.length >= MAX_ARCS) return;\r
      arcs.push({\r
        start: angle,\r
        span: (0.05 + random() * 0.07) * (random() < 0.5 ? -1 : 1),\r
        curl: 0.02 + random() * 0.04,\r
        life: 0,\r
        duration: 0.2 + random() * 0.2,\r
        drift: (random() - 0.5) * 0.3,\r
        strength\r
      });\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!alive) return;\r
      const s = settingsRef.current;\r
      const dt = Math.min(0.05, Math.max(1 / 240, (now - last) / 1000));\r
      last = now;\r
      if (!s) return;\r
\r
      const moving = !s.paused && !reducedMotion;\r
      introClock = s.intro && !reducedMotion ? Math.min(1, introClock + dt / INTRO_SECONDS) : 1;\r
      const presence = easeOut(smooth(0, 0.42, introClock));\r
      const unfold = easeOut(smooth(0, 0.32, introClock));\r
      const charge = Math.sin(Math.PI * smooth(0.22, 0.78, introClock)) * 0.35;\r
      const radius = Math.max(8, (clamp(s.size, 0.1, 1.5) * Math.min(width, height)) / 2);\r
\r
      const strength = s.interactive && !reducedMotion ? clamp(s.hoverStrength, 0, 1) : 0;\r
      const px = pointer.x - width / 2;\r
      const py = height / 2 - pointer.y;\r
      const reach = Math.hypot(px, py);\r
      const target = pointer.inside ? strength : 0;\r
      if (heat.power < 0.02) {\r
        heat.angle = Math.atan2(py, px);\r
        heat.velocity = 0;\r
      }\r
      const turn = wrapAngle(Math.atan2(py, px) - heat.angle);\r
      heat.velocity += (120 * turn - 19 * heat.velocity) * dt;\r
      heat.angle = wrapAngle(heat.angle + heat.velocity * dt);\r
      heat.power += (target - heat.power) * (1 - Math.exp(-dt / (target > heat.power ? 0.3 : 0.55)));\r
      const nearTarget = Math.exp(-Math.pow((reach - radius) / (radius * 0.45), 2));\r
      heat.near += (nearTarget - heat.near) * (1 - Math.exp(-dt / 0.15));\r
      surge *= Math.exp(-dt / 0.7);\r
\r
      const bx = px / radius;\r
      const by = py / radius;\r
      if (Math.hypot(bx - brush.x, by - brush.y) > 0.6) pointer.fresh = true;\r
      if (pointer.fresh) {\r
        brush.x = bx;\r
        brush.y = by;\r
        brush.vx = 0;\r
        brush.vy = 0;\r
        pointer.fresh = false;\r
      }\r
      const follow = 1 - Math.exp(-dt / 0.05);\r
      brush.vx += ((bx - brush.x) / dt - brush.vx) * follow;\r
      brush.vy += ((by - brush.y) / dt - brush.vy) * follow;\r
      brush.x = bx;\r
      brush.y = by;\r
      const brushSpeed = Math.hypot(brush.vx, brush.vy);\r
      const cap = brushSpeed > 4 ? 4 / brushSpeed : 1;\r
      const inBall = Math.exp(-Math.max(0, Math.hypot(bx, by) - 1) * 6);\r
      const brushPower = pointer.inside ? strength * inBall * presence : 0;\r
      stirEnergy = stirEnergy * Math.exp(-dt / 1.2) + brushPower * Math.min(brushSpeed, 4) * dt;\r
\r
      if (moving) {\r
        const pace = 1 + surge * 0.6 + heat.power * heat.near * 0.3;\r
        const step = dt * Math.max(0, s.speed) * 2 * pace;\r
        rimTime += step;\r
        dustTime += dt * Math.max(0, s.dustSpeed) * (1 + surge * 0.4);\r
        swayClock += dt * Math.max(0, s.dustSpeed);\r
        const crackleNow = clamp(s.crackle + surge * 0.5, 0, 1.5);\r
        if (s.sparks > 0.01 && introClock > 0.55) {\r
          nextArc -= step * s.sparks * 2 * (0.6 + crackleNow * 0.6);\r
          if (nextArc <= 0) {\r
            const local = heat.power * heat.near;\r
            const angle =\r
              random() < local * 0.7\r
                ? heat.angle + (random() - 0.5) * 0.8\r
                : random() < 0.7\r
                  ? Math.PI / 2 + (random() - 0.5) * 1.5\r
                  : random() * Math.PI * 2;\r
            spawnArc(angle, 0.8 + local * 0.6 + surge * 0.4);\r
            nextArc = 0.15 + random() * 0.6;\r
          }\r
        }\r
        for (let i = arcs.length - 1; i >= 0; i--) {\r
          const arc = arcs[i];\r
          arc.life += step;\r
          arc.start += arc.drift * step;\r
          if (arc.life >= arc.duration) arcs.splice(i, 1);\r
        }\r
      } else {\r
        arcs.length = 0;\r
      }\r
      for (let i = 0; i < MAX_ARCS; i++) {\r
        const arc = arcs[i];\r
        arcData[i * 4] = arc ? arc.start : 0;\r
        arcData[i * 4 + 1] = arc ? arc.span : 0;\r
        arcData[i * 4 + 2] = arc ? arc.curl : 0;\r
        arcData[i * 4 + 3] = arc ? Math.sin((Math.PI * arc.life) / arc.duration) * arc.strength : 0;\r
      }\r
\r
      rebuildDust(s.particleCount);\r
      const palette = s.palette;\r
\r
      fieldUniforms.uCenter.value = [width / 2, height / 2];\r
      fieldUniforms.uRadius.value = radius;\r
      fieldUniforms.uDpr.value = renderer.dpr;\r
      fieldUniforms.uLine.value = Math.max(0.6, radius * 0.0035);\r
      fieldUniforms.uTime.value = rimTime;\r
      fieldUniforms.uFrame.value = Math.floor(rimTime * 24) % 100000;\r
      fieldUniforms.uBins.value = clamp(Math.round((Math.PI * 2 * radius) / 2.6), 240, 900);\r
      fieldUniforms.uStrands.value = Math.round(clamp(s.strands, 1, MAX_STRANDS));\r
      fieldUniforms.uCrackle.value = clamp(s.crackle, 0, 1) + surge * 0.5 + charge;\r
      fieldUniforms.uFlares.value = clamp(s.flares, 0, 1);\r
      fieldUniforms.uGlow.value = clamp(s.glow, 0, 2) * (1 + surge * 0.5 + charge) * (s.light ? 0.35 : 1);\r
      fieldUniforms.uHaze.value = clamp(s.haze, 0, 2) * (s.light ? 0.6 : 1);\r
      fieldUniforms.uFill.value = clamp(s.fill, 0, 1);\r
      fieldUniforms.uPresence.value = presence;\r
      fieldUniforms.uUnfold.value = unfold;\r
      fieldUniforms.uBloom.value = presence * presence;\r
      fieldUniforms.uInside.value = smooth(0.2, 0.95, introClock);\r
      fieldUniforms.uRim.value = palette.rim;\r
      fieldUniforms.uRimHot.value = palette.rimHot;\r
      fieldUniforms.uRimMid.value = palette.rimMid;\r
      fieldUniforms.uRimDeep.value = palette.rimDeep;\r
      fieldUniforms.uSpark.value = palette.spark;\r
      fieldUniforms.uSparkGlow.value = palette.sparkGlow;\r
      fieldUniforms.uHazeColor.value = palette.haze;\r
      fieldUniforms.uEdgeColor.value = palette.edge;\r
      fieldUniforms.uHeat.value = [heat.angle, heat.near, heat.power * presence, 0];\r
\r
      dustShared.uDustTime.value = dustTime;\r
      const gaze = pointer.inside ? strength * presence : 0;\r
      const lookX = clamp(bx, -1.6, 1.6) * gaze;\r
      const lookY = clamp(by, -1.6, 1.6) * gaze;\r
      look.vx += (40 * (lookX - look.x) - 11 * look.vx) * dt;\r
      look.vy += (40 * (lookY - look.y) - 11 * look.vy) * dt;\r
      look.x += look.vx * dt;\r
      look.y += look.vy * dt;\r
      const swing = clamp(s.sway, 0, 1);\r
      dustShared.uTurn.value = [\r
        swing * 0.42 * Math.sin(swayClock * 0.23) + look.x * 0.3,\r
        swing * 0.12 * Math.sin(swayClock * 0.17 + 1.3) - look.y * 0.16\r
      ];\r
      dustShared.uMotion.value = MOTIONS[s.motion] ?? 0;\r
      dustUniforms.uViewport.value = [width, height];\r
      dustUniforms.uDepth.value = clamp(s.depth, 0, 1);\r
      dustUniforms.uTwinkle.value = clamp(s.twinkle, 0, 1);\r
      dustUniforms.uPointScale.value = Math.max(1, radius / 491);\r
      dustUniforms.uReveal.value = smooth(0.18, 1, introClock);\r
      dustUniforms.uTones.value = palette.tones.flat();\r
      dustUniforms.uRimTone.value = palette.rim;\r
      dustUniforms.uShape.value = SHAPES[s.particleShape] ?? 0;\r
\r
      const layer = dust;\r
      if (layer && stirMesh && (stirEnergy > 0.002 || kick)) stirring = SETTLE_SECONDS;\r
      let stirred = false;\r
      if (layer && layer.read && layer.write && stirMesh && stirring > 0) {\r
        stirUniforms.uDt.value = Math.min(dt, 1 / 30);\r
        stirUniforms.uBrush.value = [brush.x, brush.y, brush.vx * cap, brush.vy * cap];\r
        stirUniforms.uBrushPower.value = brushPower;\r
        stirUniforms.uKick.value = kick ? [kick.x, kick.y, kick.strength, 0] : [0, 0, 0, 0];\r
        stirUniforms.tOffset.value = layer.read.textures[0];\r
        stirUniforms.tVelocity.value = layer.read.textures[1];\r
        renderer.render({ scene: stirMesh, target: layer.write, clear: false });\r
        const swap = layer.read;\r
        layer.read = layer.write;\r
        layer.write = swap;\r
        stirring -= dt;\r
        stirred = stirring > 0;\r
        if (!stirred) {\r
          stirring = 0;\r
          resetStir();\r
        }\r
      }\r
      kick = null;\r
      dustUniforms.uStirred.value = stirred ? 1 : 0;\r
      dustUniforms.tOffset.value = layer && layer.read ? layer.read.textures[0] : blank;\r
\r
      gl.clearColor(0, 0, 0, 0);\r
      renderer.render({ scene: fieldMesh, target: sceneTarget, clear: true });\r
      if (dust) renderer.render({ scene: dust.mesh, target: sceneTarget, clear: false });\r
\r
      compositeUniforms.uLight.value = s.light ? 1 : 0;\r
      renderer.render({ scene: compositeMesh, clear: false });\r
\r
      const settling =\r
        Math.abs(target - heat.power) > 0.002 ||\r
        surge > 0.002 ||\r
        stirring > 0 ||\r
        Math.abs(heat.velocity) > 0.01 ||\r
        Math.hypot(look.vx, look.vy, look.x - lookX, look.y - lookY) > 0.001;\r
      if (visible && (moving || introClock < 1 || settling)) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const start = () => {\r
      if (raf || !visible || !alive) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const locate = e => {\r
      const rect = container.getBoundingClientRect();\r
      const x = e.clientX - rect.left;\r
      const y = e.clientY - rect.top;\r
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };\r
    };\r
\r
    const onPointerMove = e => {\r
      const spot = locate(e);\r
      if (spot.inside && !pointer.inside) pointer.fresh = true;\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = spot.inside;\r
      if (spot.inside) start();\r
    };\r
\r
    const onPointerDown = e => {\r
      const s = settingsRef.current;\r
      const spot = locate(e);\r
      if (!s || !s.interactive || reducedMotion || !spot.inside) return;\r
      if (!pointer.inside) pointer.fresh = true;\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = true;\r
      const radius = Math.max(8, (clamp(s.size, 0.1, 1.5) * Math.min(width, height)) / 2);\r
      const kx = (spot.x - width / 2) / radius;\r
      const ky = (height / 2 - spot.y) / radius;\r
      const distance = Math.hypot(kx, ky);\r
      if (distance > 1.3) return;\r
      const strength = clamp(s.hoverStrength, 0, 1);\r
      kick = { x: kx, y: ky, strength: strength * 1.2 };\r
      surge = Math.max(surge, strength);\r
      const angle = Math.atan2(ky, kx);\r
      spawnArc(angle + (random() - 0.5) * 0.5, 1.3);\r
      spawnArc(angle + Math.PI + (random() - 0.5) * 1.2, 1.1);\r
      start();\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      start();\r
    };\r
\r
    const onPointerOut = e => {\r
      if (!e.relatedTarget) onPointerLeave();\r
    };\r
\r
    const onPointerUp = e => {\r
      if (e.pointerType === 'touch') onPointerLeave();\r
    };\r
\r
    const onVisibility = () => {\r
      if (!document.hidden) start();\r
    };\r
\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    window.addEventListener('pointerout', onPointerOut, { passive: true });\r
    window.addEventListener('pointerup', onPointerUp, { passive: true });\r
    window.addEventListener('blur', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(container);\r
    const intersectionObserver = new IntersectionObserver(([entry]) => {\r
      visible = entry.isIntersecting;\r
      start();\r
    });\r
    intersectionObserver.observe(container);\r
\r
    wakeRef.current = start;\r
    resize();\r
\r
    return () => {\r
      alive = false;\r
      visible = false;\r
      cancelAnimationFrame(raf);\r
      resizeObserver.disconnect();\r
      intersectionObserver.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('pointerout', onPointerOut);\r
      window.removeEventListener('pointerup', onPointerUp);\r
      window.removeEventListener('blur', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      wakeRef.current = null;\r
      disposeDust();\r
      disposeTarget(sceneTarget);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);\r
    };\r
  }, []);\r
\r
  return <div ref={containerRef} className={\`crystalized-ball \${className}\`.trim()} style={style} />;\r
};\r
\r
export default CrystalizedBall;\r
`,n=`.crystalized-ball {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
`,e=`'use client';\r
\r
import { useEffect, useMemo, useRef } from 'react';\r
import { Renderer, Program, Mesh, Triangle, Geometry, RenderTarget, Texture } from 'ogl';\r
\r
const BALL_PRESETS = {\r
  plasma: {\r
    color: '#F25BD0',\r
    strands: 6,\r
    crackle: 0.85,\r
    flares: 0.65,\r
    glow: 0.9,\r
    sparks: 0.6,\r
    particleCount: 15000,\r
    fill: 0.5,\r
    motion: 'rise',\r
    particleShape: 'square',\r
    depth: 0.6,\r
    sway: 0.5,\r
    twinkle: 0.5,\r
    haze: 0.7,\r
    dustSpeed: 1\r
  },\r
  aurora: {\r
    color: '#5CFFC8',\r
    strands: 5,\r
    crackle: 0.6,\r
    flares: 0.5,\r
    glow: 0.8,\r
    sparks: 0.45,\r
    particleCount: 15000,\r
    fill: 0.5,\r
    motion: 'rise',\r
    particleShape: 'square',\r
    depth: 0.6,\r
    sway: 0.5,\r
    twinkle: 0.5,\r
    haze: 0.7,\r
    dustSpeed: 1\r
  },\r
  nebula: {\r
    color: '#9478FF',\r
    strands: 6,\r
    crackle: 1,\r
    flares: 0.5,\r
    glow: 0.9,\r
    sparks: 0.6,\r
    particleCount: 18000,\r
    fill: 0.45,\r
    motion: 'rise',\r
    particleShape: 'square',\r
    depth: 0.5,\r
    sway: 0.4,\r
    twinkle: 0.6,\r
    haze: 0.8,\r
    dustSpeed: 1.2\r
  },\r
  ember: {\r
    color: '#FF8A2A',\r
    strands: 5,\r
    crackle: 0.9,\r
    flares: 0.8,\r
    glow: 1,\r
    sparks: 0.8,\r
    particleCount: 12000,\r
    fill: 0.35,\r
    motion: 'rise',\r
    particleShape: 'round',\r
    depth: 0.7,\r
    sway: 0.3,\r
    twinkle: 0.7,\r
    haze: 0.9,\r
    dustSpeed: 1.6\r
  },\r
  frost: {\r
    color: '#BFE6FF',\r
    strands: 3,\r
    crackle: 0.3,\r
    flares: 0.3,\r
    glow: 0.6,\r
    sparks: 0.2,\r
    particleCount: 16000,\r
    fill: 0.6,\r
    motion: 'fall',\r
    particleShape: 'round',\r
    depth: 0.8,\r
    sway: 0.4,\r
    twinkle: 0.4,\r
    haze: 0.5,\r
    dustSpeed: 0.7\r
  },\r
  solar: {\r
    color: '#FFD36E',\r
    strands: 6,\r
    crackle: 0.7,\r
    flares: 1,\r
    glow: 1.1,\r
    sparks: 0.5,\r
    particleCount: 15000,\r
    fill: 0.55,\r
    motion: 'orbit',\r
    particleShape: 'square',\r
    depth: 0.6,\r
    sway: 0.7,\r
    twinkle: 0.5,\r
    haze: 0.8,\r
    dustSpeed: 1\r
  },\r
  eclipse: {\r
    color: '#FFFFFF',\r
    strands: 4,\r
    crackle: 0.5,\r
    flares: 0.4,\r
    glow: 0.7,\r
    sparks: 0.35,\r
    particleCount: 14000,\r
    fill: 0.5,\r
    motion: 'drift',\r
    particleShape: 'square',\r
    depth: 0.7,\r
    sway: 0.5,\r
    twinkle: 0.5,\r
    haze: 0.5,\r
    dustSpeed: 0.8\r
  },\r
  abyss: {\r
    color: '#3F7BFF',\r
    strands: 5,\r
    crackle: 0.55,\r
    flares: 0.6,\r
    glow: 0.9,\r
    sparks: 0.4,\r
    particleCount: 20000,\r
    fill: 0.8,\r
    motion: 'orbit',\r
    particleShape: 'round',\r
    depth: 0.8,\r
    sway: 0.8,\r
    twinkle: 0.5,\r
    haze: 0.6,\r
    dustSpeed: 0.9\r
  }\r
};\r
\r
const MOTIONS = { rise: 0, fall: 1, drift: 2, orbit: 3 };\r
const SHAPES = { square: 0, round: 1 };\r
const MAX_STRANDS = 8;\r
const MAX_ARCS = 4;\r
const MAX_PARTICLES = 40000;\r
const STATE_WIDTH = 256;\r
const PIXEL_BUDGET = 4.5e6;\r
const INTRO_SECONDS = 2.2;\r
const SETTLE_SECONDS = 7;\r
const WHITE = [1, 1, 1];\r
const BLACK = [0, 0, 0];\r
\r
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);\r
const smooth = (edge0, edge1, value) => {\r
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);\r
  return t * t * (3 - 2 * t);\r
};\r
const easeOut = t => 1 - Math.pow(1 - t, 3);\r
const mixColor = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);\r
const wrapAngle = a => a - Math.PI * 2 * Math.floor((a + Math.PI) / (Math.PI * 2));\r
\r
const parseColor = (value, fallback) => {\r
  try {\r
    const ctx = document.createElement('canvas').getContext('2d');\r
    if (!ctx) return fallback;\r
    ctx.fillStyle = '#000000';\r
    ctx.fillStyle = value;\r
    const resolved = ctx.fillStyle;\r
    if (resolved.startsWith('#')) {\r
      const n = parseInt(resolved.slice(1), 16);\r
      return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];\r
    }\r
    const parts = resolved.match(/[\\d.]+/g);\r
    if (!parts || parts.length < 3) return fallback;\r
    return [Number(parts[0]) / 255, Number(parts[1]) / 255, Number(parts[2]) / 255];\r
  } catch {\r
    return fallback;\r
  }\r
};\r
\r
const toLinear = c => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));\r
const toGamma = c => (c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);\r
\r
const toOklab = rgb => {\r
  const [r, g, b] = rgb.map(toLinear);\r
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);\r
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);\r
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);\r
  return [\r
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,\r
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,\r
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s\r
  ];\r
};\r
\r
const fromOklab = ([L, a, b]) => {\r
  const l = Math.pow(L + 0.3963377774 * a + 0.2158037573 * b, 3);\r
  const m = Math.pow(L - 0.1055613458 * a - 0.0638541728 * b, 3);\r
  const s = Math.pow(L - 0.0894841775 * a - 1.291485548 * b, 3);\r
  return [\r
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,\r
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,\r
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s\r
  ].map(v => clamp(toGamma(clamp(v, 0, 1)), 0, 1));\r
};\r
\r
const blend = (a, b, t) => fromOklab(mixColor(toOklab(a), toOklab(b), t));\r
\r
const shift = (rgb, hue, lightness, chroma) => {\r
  const [L, a, b] = toOklab(rgb);\r
  const c = Math.hypot(a, b) * chroma;\r
  const h = Math.atan2(b, a) + (hue * Math.PI) / 180;\r
  return fromOklab([clamp(L + lightness, 0, 1), c * Math.cos(h), c * Math.sin(h)]);\r
};\r
\r
const withLightness = (rgb, hue, lightness, chroma) => {\r
  const [, a, b] = toOklab(rgb);\r
  const c = Math.max(Math.hypot(a, b) * chroma, 0.02);\r
  const h = Math.atan2(b, a) + (hue * Math.PI) / 180;\r
  return fromOklab([clamp(lightness, 0, 1), c * Math.cos(h), c * Math.sin(h)]);\r
};\r
\r
const buildPalette = (color, light) => {\r
  if (light) {\r
    const ink = withLightness(color, 0, Math.min(toOklab(color)[0], 0.62), 1.15);\r
    return {\r
      rim: ink,\r
      rimHot: ink,\r
      rimMid: ink,\r
      rimDeep: withLightness(color, 0, 0.72, 0.8),\r
      spark: withLightness(color, 0, 0.6, 1.2),\r
      sparkGlow: withLightness(color, 0, 0.78, 0.8),\r
      haze: withLightness(color, 0, 0.8, 0.6),\r
      edge: withLightness(color, 0, 0.72, 0.8),\r
      tones: [\r
        withLightness(color, 0, 0.56, 1.1),\r
        withLightness(color, 16, 0.6, 1.05),\r
        withLightness(color, -16, 0.5, 1.1),\r
        withLightness(color, 0, 0.66, 0.9),\r
        withLightness(color, 0, 0.74, 0.7)\r
      ]\r
    };\r
  }\r
  return {\r
    rim: color,\r
    rimHot: mixColor(color, WHITE, 0.72),\r
    rimMid: mixColor(color, BLACK, 0.15),\r
    rimDeep: mixColor(color, BLACK, 0.45),\r
    spark: mixColor(color, WHITE, 0.45),\r
    sparkGlow: shift(color, 0, -0.15, 1),\r
    haze: mixColor(color, BLACK, 0.6),\r
    edge: shift(color, 0, -0.3, 0.9),\r
    tones: [\r
      shift(color, 0, -0.06, 1),\r
      shift(color, 16, -0.02, 1),\r
      shift(color, -16, -0.12, 1.05),\r
      shift(blend(color, WHITE, 0.25), 0, 0.04, 1),\r
      blend(color, WHITE, 0.7)\r
    ]\r
  };\r
};\r
\r
const seeded = start => {\r
  let state = start >>> 0;\r
  return () => {\r
    state = (state + 0x6d2b79f5) >>> 0;\r
    let t = state;\r
    t = Math.imul(t ^ (t >>> 15), t | 1);\r
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\r
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\r
  };\r
};\r
\r
const buildStrands = () => {\r
  const random = seeded(99);\r
  const bands = [\r
    [6, 12, 0.6, 1.6],\r
    [18, 34, 1.5, 3.5],\r
    [40, 70, 3, 7],\r
    [80, 130, 6, 12]\r
  ];\r
  const data = { harmonics: [], rates: [], phases: [], flareHarmonics: [], flareRates: [], flarePhases: [] };\r
  for (let s = 0; s < MAX_STRANDS; s++) {\r
    bands.forEach(([low, high, slow, fast]) => {\r
      data.harmonics.push(Math.round(low + random() * (high - low)));\r
      data.rates.push((slow + random() * (fast - slow)) * (random() < 0.5 ? -1 : 1));\r
      data.phases.push(random() * Math.PI * 2);\r
    });\r
    for (let j = 0; j < 3; j++) {\r
      data.flareHarmonics.push(4 + Math.floor(random() * 6));\r
      data.flareRates.push((0.4 + random() * 0.8) * (random() < 0.5 ? -1 : 1));\r
      data.flarePhases.push(random() * Math.PI * 2);\r
    }\r
    const lead = s === 0;\r
    data.flareHarmonics.push(lead ? 0.75 : 0.95 + random() * 0.3);\r
    data.flareRates.push(lead ? 1.15 : 0.8 + random() * 0.2);\r
    data.flarePhases.push(lead ? 1 : 0.7 + random() * 0.25);\r
  }\r
  return data;\r
};\r
\r
const buildDust = count => {\r
  const random = seeded(1337);\r
  const rows = Math.max(1, Math.ceil(count / STATE_WIDTH));\r
  const home = new Float32Array(STATE_WIDTH * rows * 4);\r
  const seed = new Float32Array(STATE_WIDTH * rows * 4);\r
  let k = 0;\r
  let guard = 0;\r
  while (k < count && guard < count * 80) {\r
    guard++;\r
    let x;\r
    let y;\r
    let tone;\r
    if (random() < 0.28) {\r
      const angle = random() * Math.PI * 2;\r
      const radius = 0.87 + Math.sqrt(random()) * 0.105;\r
      x = Math.cos(angle) * radius;\r
      y = Math.sin(angle) * radius;\r
      if (random() > smooth(-0.6, 0.3, -y)) continue;\r
      const q = random();\r
      tone = q < 0.5 ? 3 : q < 0.8 ? 2 : 1;\r
    } else {\r
      x = random() * 2 - 1;\r
      y = random() * 2 - 1;\r
      const radius = Math.hypot(x, y);\r
      if (radius > 0.975) continue;\r
      const bowl = Math.pow(smooth(-0.25, 0.85, -y), 1.3);\r
      const band = smooth(0.66, 0.96, radius) * smooth(-0.7, 0.3, -y);\r
      const weight = Math.max(bowl, band * 0.9);\r
      if (random() > 0.012 + 0.988 * weight) continue;\r
      if (weight < 0.12) tone = 4;\r
      else {\r
        const q = random();\r
        tone = q < 0.32 ? 0 : q < 0.52 ? 1 : q < 0.8 ? 2 : 3;\r
      }\r
    }\r
    const chord = Math.sqrt(Math.max(0, 0.95 - x * x - y * y));\r
    home[k * 4] = x;\r
    home[k * 4 + 1] = y;\r
    home[k * 4 + 2] = (random() * 2 - 1) * chord;\r
    home[k * 4 + 3] = tone;\r
    seed[k * 4] = tone === 4 ? 1.8 : random() < 0.22 ? 2.1 : 1.3;\r
    seed[k * 4 + 1] = random();\r
    seed[k * 4 + 2] = 2.5 + random() * 3.5;\r
    seed[k * 4 + 3] = 0.16 + random() * 0.26;\r
    k++;\r
  }\r
  return { home, seed, count: k, rows };\r
};\r
\r
const passVertex = \`#version 300 es\r
in vec2 position;\r
in vec2 uv;\r
out vec2 vUv;\r
void main() {\r
  vUv = uv;\r
  gl_Position = vec4(position, 0.0, 1.0);\r
}\r
\`;\r
\r
const hashChunk = \`\r
uint scramble(uint v) {\r
  v = v * 747796405u + 2891336453u;\r
  uint w = ((v >> ((v >> 28u) + 4u)) ^ v) * 277803737u;\r
  return (w >> 22u) ^ w;\r
}\r
\r
float random(uint v) {\r
  return float(scramble(v)) * (1.0 / 4294967295.0);\r
}\r
\`;\r
\r
const dustChunk = \`\r
uniform float uDustTime;\r
uniform vec2 uTurn;\r
uniform float uMotion;\r
uniform float uFill;\r
\r
vec3 settle(vec3 p, out float spread) {\r
  float bend = exp2((0.5 - uFill) * 1.8);\r
  float h = clamp((p.y + 1.0) * 0.5, 0.0, 1.0);\r
  float y = 2.0 * pow(h, bend) - 1.0;\r
  float from = sqrt(max(1.0 - p.y * p.y, 1e-4));\r
  float to = sqrt(max(1.0 - y * y, 0.0));\r
  spread = clamp(bend * pow(max(h, 1e-3), bend - 1.0) * to / from, 0.25, 1.0);\r
  return vec3(p.xz * (to / from), y).xzy;\r
}\r
\r
vec3 drift(vec4 home, vec4 seed, uint id, out float life, out float spread) {\r
  vec3 p = settle(home.xyz, spread);\r
  float t = uDustTime;\r
  float u = fract(t / seed.z + seed.y);\r
  life = sin(3.14159265 * u);\r
  float travel = seed.w;\r
  if (uMotion < 0.5) {\r
    p.y += travel * (u - 0.5);\r
  } else if (uMotion < 1.5) {\r
    p.y -= travel * (u - 0.5);\r
  } else if (uMotion < 2.5) {\r
    p += 0.045 * vec3(\r
      sin(t * 0.37 + seed.y * 17.0) + 0.5 * sin(t * 0.83 + seed.z * 5.0),\r
      sin(t * 0.29 + seed.z * 11.0) + 0.5 * sin(t * 0.61 + seed.w * 7.0),\r
      sin(t * 0.33 + seed.w * 23.0)\r
    );\r
  } else {\r
    float loop = t * (0.6 + 0.9 * random(id * 7u + 3u)) * (random(id * 7u + 10u) < 0.5 ? -1.0 : 1.0) + seed.y * 6.2831853;\r
    p.xy += (0.025 + 0.05 * random(id * 7u + 16u)) * vec2(cos(loop), sin(loop));\r
  }\r
  float wobble = 0.002 + 0.006 * random(id * 7u + 1u);\r
  float w1 = 0.8 + 2.4 * random(id * 7u + 2u);\r
  float w2 = 0.8 + 2.4 * random(id * 7u + 4u);\r
  p += wobble * vec3(sin(t * w1 + seed.y * 40.0), cos(t * w2 + seed.z * 30.0), sin(t * (w1 + w2) * 0.5 + seed.w * 20.0));\r
  float cy = cos(uTurn.x);\r
  float sy = sin(uTurn.x);\r
  p.xz = mat2(cy, -sy, sy, cy) * p.xz;\r
  float cx = cos(uTurn.y);\r
  float sx = sin(uTurn.y);\r
  p.yz = mat2(cx, -sx, sx, cx) * p.yz;\r
  return p;\r
}\r
\`;\r
\r
const fieldFragment = \`#version 300 es\r
precision highp float;\r
\r
uniform vec2 uCenter;\r
uniform float uRadius;\r
uniform float uDpr;\r
uniform float uLine;\r
uniform float uTime;\r
uniform float uFrame;\r
uniform float uBins;\r
uniform float uStrands;\r
uniform float uCrackle;\r
uniform float uFlares;\r
uniform float uGlow;\r
uniform float uHaze;\r
uniform float uFill;\r
uniform float uPresence;\r
uniform float uUnfold;\r
uniform float uBloom;\r
uniform float uInside;\r
uniform float uEncode;\r
uniform vec3 uRim;\r
uniform vec3 uRimHot;\r
uniform vec3 uRimMid;\r
uniform vec3 uRimDeep;\r
uniform vec3 uSpark;\r
uniform vec3 uSparkGlow;\r
uniform vec3 uHazeColor;\r
uniform vec3 uEdgeColor;\r
uniform vec4 uHeat;\r
uniform vec4 uHarmonics[8];\r
uniform vec4 uRates[8];\r
uniform vec4 uPhases[8];\r
uniform vec4 uFlareHarmonics[8];\r
uniform vec4 uFlareRates[8];\r
uniform vec4 uFlarePhases[8];\r
uniform vec4 uArcs[4];\r
\r
out vec4 fragColor;\r
\${hashChunk}\r
const float PI = 3.14159265;\r
const float TAU = 6.28318531;\r
const vec4 AMPS = vec4(0.35, 0.3, 0.22, 0.13);\r
\r
float bell(float d, float w) {\r
  float x = d / w;\r
  return exp(-x * x);\r
}\r
\r
float segment(vec2 p, vec2 a, vec2 b) {\r
  vec2 pa = p - a;\r
  vec2 ba = b - a;\r
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-5), 0.0, 1.0);\r
  return length(pa - ba * h);\r
}\r
\r
float pool(vec2 q) {\r
  float t = length(q - vec2(0.0, mix(-1.0, -0.66, uFill))) / mix(0.8, 1.35, uFill);\r
  return t < 0.6 ? mix(0.5, 0.22, t / 0.6) : mix(0.22, 0.0, clamp((t - 0.6) / 0.4, 0.0, 1.0));\r
}\r
\r
void main() {\r
  vec2 p = gl_FragCoord.xy / uDpr - uCenter;\r
  float r = length(p);\r
  float R = uRadius;\r
  float theta = atan(p.y, p.x);\r
  float lift = p.y / max(r, 1e-3);\r
  float topDim = 1.0 - 0.35 * pow(max(lift, 0.0), 1.5);\r
  vec3 col = vec3(0.0);\r
  float hot = 0.0;\r
  uint frame = uint(uFrame);\r
\r
  if (r < R) {\r
    vec2 q = p / R;\r
    float chord = sqrt(max(1.0 - dot(q, q), 0.0));\r
    float haze = pool(q) * (0.55 + 0.45 * chord);\r
    col += uHazeColor * haze * uHaze * uInside;\r
    float e = length(q - vec2(0.0, 0.2)) / 1.2;\r
    float edge = 0.5 * pow(smoothstep(0.62, 1.0, e), 1.4);\r
    col += uEdgeColor * edge * uInside * (0.5 + 0.5 * uHaze);\r
  }\r
\r
  float dr = r - R;\r
  float halo = 1.0 - smoothstep(R * 0.05, R * 0.105, abs(dr - R * 0.0213));\r
  col += uRimDeep * 0.18 * halo * topDim * uGlow * uBloom;\r
  col += uRim * 0.12 * bell(dr + R * 0.0383, R * 0.032) * uGlow * uBloom;\r
  col += uRim * 0.32 * bell(dr, max(R * 0.0117, uLine)) * uPresence * uUnfold;\r
\r
  float delta = mod(theta - uHeat.x + PI, TAU) - PI;\r
  float heat = uHeat.z * uHeat.y * exp(-delta * delta / 0.3);\r
  float crackle = uCrackle + heat * 0.9;\r
  float amp = R * 0.016 * (0.3 + 1.4 * crackle) * uUnfold;\r
  float jitterAmp = R * 0.0048 * (0.3 + 1.4 * uCrackle) * uUnfold * (1.0 + heat * 0.3);\r
  float flareAmp = R * 0.064 * (0.4 + 1.2 * crackle) * uFlares * 1.6 * uUnfold;\r
\r
  if (abs(dr) < amp * 2.0 + flareAmp + R * 0.3) {\r
    float step = TAU / uBins;\r
    float binPos = (theta + PI) / step;\r
    float bin0 = floor(binPos);\r
    float binF = binPos - bin0;\r
    float th0 = bin0 * step - PI;\r
    float th1 = th0 + step;\r
    uint b0 = uint(mod(bin0, uBins));\r
    uint b1 = uint(mod(bin0 + 1.0, uBins));\r
    float gain = min(1.0, 2.4 / max(uStrands, 1.0));\r
    for (int k = 0; k < 8; k++) {\r
      if (float(k) >= uStrands) break;\r
      vec4 m = uHarmonics[k];\r
      vec4 lead = uRates[k] * uTime + uPhases[k];\r
      float wave0 = dot(AMPS, sin(m * th0 + lead));\r
      float wave1 = dot(AMPS, sin(m * th1 + lead));\r
      uint salt = uint(k) * 1013u + frame * 7919u;\r
      vec4 shape = uFlareHarmonics[k];\r
      vec4 look = uFlareRates[k];\r
      vec4 tone = uFlarePhases[k];\r
      float a = amp * shape.w;\r
      float off0 = a * wave0 + jitterAmp * (random(b0 + salt) - 0.5);\r
      float off1 = a * wave1 + jitterAmp * (random(b1 + salt) - 0.5);\r
      float rc = R + mix(off0, off1, binF);\r
      float grade = (off1 - off0) / (step * max(r, 1.0));\r
      float d = abs(r - rc) * inversesqrt(1.0 + grade * grade);\r
      float swell = 0.8 + 0.4 * (0.5 + 0.5 * sin(3.0 * theta + uTime * 0.7 + tone.x * 1.7));\r
      float width = uLine * look.w * swell * (1.0 + heat * 0.25);\r
      float core = exp(-d * d / (width * width));\r
      float sheath = exp(-d * d / (width * width * 3.0));\r
      float bright = tone.w * (1.0 + heat * 0.45) * uPresence;\r
      col += (uRimHot * core * 0.8 + uRim * sheath * 0.32) * bright;\r
      hot += core * bright;\r
      vec3 fargs = shape.xyz * theta + look.xyz * uTime + tone.xyz;\r
      float flare = max(0.0, (sin(fargs.x) + sin(fargs.y) + sin(fargs.z)) / 3.0);\r
      flare = (flare * flare + heat * 0.35) * flareAmp;\r
      float dw = abs(r - rc - flare);\r
      float dm = abs(r - rc - flare * 0.6);\r
      float dn = abs(r - rc - flare * 0.25);\r
      vec3 glow = uRimDeep * (0.07 * bell(dw, R * 0.09) + 0.16 * bell(dw, R * 0.05));\r
      glow += uRimMid * 0.28 * bell(dm, R * 0.027) + uRim * 0.38 * bell(dn, R * 0.013);\r
      col += glow * gain * topDim * uGlow * uBloom * (1.0 + heat * 1.4);\r
    }\r
  }\r
\r
  for (int i = 0; i < 4; i++) {\r
    vec4 arc = uArcs[i];\r
    if (arc.w <= 0.002) continue;\r
    float mid = arc.x + arc.y * 0.5;\r
    vec2 center = R * 0.93 * vec2(cos(mid), sin(mid));\r
    if (distance(p, center) > R * (abs(arc.y) * 0.6 + 0.1) + 12.0) continue;\r
    float ar = R * 0.955;\r
    vec2 a0 = ar * vec2(cos(arc.x), sin(arc.x));\r
    vec2 a2 = ar * vec2(cos(arc.x + arc.y), sin(arc.x + arc.y));\r
    vec2 a1 = R * (0.955 - arc.z) * vec2(cos(mid), sin(mid));\r
    float dmin = 1e5;\r
    float along = 0.0;\r
    vec2 prev = a0;\r
    for (int s = 1; s <= 10; s++) {\r
      float u = float(s) / 10.0;\r
      vec2 b = mix(mix(a0, a1, u), mix(a1, a2, u), u);\r
      vec2 pa = p - prev;\r
      vec2 ba = b - prev;\r
      float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-5), 0.0, 1.0);\r
      float dist = length(pa - ba * h);\r
      if (dist < dmin) {\r
        dmin = dist;\r
        along = (float(s) - 1.0 + h) / 10.0;\r
      }\r
      prev = b;\r
    }\r
    float taper = sqrt(max(sin(PI * along), 0.0));\r
    float arcWidth = uLine * (0.55 + 0.6 * taper);\r
    float arcCore = exp(-dmin * dmin / (arcWidth * arcWidth));\r
    float arcGlow = exp(-dmin * dmin / (arcWidth * arcWidth * 12.0));\r
    col += (uSpark * 0.95 * arcCore + uSparkGlow * 0.4 * arcGlow) * arc.w * taper;\r
    hot += arcCore * arc.w * taper * 0.6;\r
  }\r
\r
  fragColor = vec4(col, hot) * uEncode;\r
}\r
\`;\r
\r
const dustVertex = \`#version 300 es\r
precision highp float;\r
\r
in float aIndex;\r
\r
uniform sampler2D tHome;\r
uniform sampler2D tSeed;\r
uniform sampler2D tOffset;\r
uniform float uStirred;\r
uniform vec2 uCenter;\r
uniform vec2 uViewport;\r
uniform float uRadius;\r
uniform float uDpr;\r
uniform float uDepth;\r
uniform float uTwinkle;\r
uniform float uPointScale;\r
uniform float uReveal;\r
uniform float uEncode;\r
uniform vec3 uTones[5];\r
uniform vec3 uRimTone;\r
\r
out vec3 vColor;\r
out float vSize;\r
\${hashChunk}\r
\${dustChunk}\r
void main() {\r
  ivec2 cell = ivec2(int(mod(aIndex, \${STATE_WIDTH}.0)), int(floor(aIndex / \${STATE_WIDTH}.0)));\r
  uint id = uint(aIndex);\r
  vec4 home = texelFetch(tHome, cell, 0);\r
  vec4 seed = texelFetch(tSeed, cell, 0);\r
  float life;\r
  float spread;\r
  vec3 p = drift(home, seed, id, life, spread);\r
  if (uStirred > 0.5) p += texelFetch(tOffset, cell, 0).xyz;\r
  float len = length(p);\r
  float inside = 1.0 - smoothstep(0.955, 0.985, length(p.xy));\r
  if (len > 0.975) p *= 0.975 / len;\r
\r
  float front = p.z * 0.5 + 0.5;\r
  float depthSize = mix(1.0, 0.7 + 0.6 * front, uDepth);\r
  float depthLight = mix(1.0, 0.35 + 0.8 * front, uDepth);\r
  float blink = sin(uDustTime * (2.0 + 6.0 * random(id * 7u + 5u)) + random(id * 7u + 6u) * 6.2831853);\r
  float twinkle = mix(1.0, smoothstep(-0.9, -0.6, blink), uTwinkle);\r
  float fade = smoothstep(0.04, 0.12, life);\r
  float order = (home.y + 1.0) * 0.5 * 0.55 + random(id * 7u + 8u) * 0.25;\r
  float reveal = smoothstep(order, order + 0.2, uReveal * 1.0);\r
  float alpha = random(id * 7u + 9u) < 0.5 || home.w > 3.5 ? 1.0 : 0.6;\r
\r
  float size = seed.x * uPointScale * (0.35 + 0.95 * life) * depthSize * mix(0.5, 1.0, reveal);\r
  vec2 screen = uCenter + p.xy * uRadius;\r
  gl_Position = vec4(screen / uViewport * 2.0 - 1.0, 0.0, 1.0);\r
  float px = size * uDpr;\r
  gl_PointSize = px + 2.0;\r
  vSize = px;\r
\r
  int tone = int(home.w + 0.5);\r
  float rimLit = smoothstep(0.8, 0.97, length(p.xy));\r
  vec3 color = uTones[tone] + uRimTone * rimLit * rimLit * 0.12;\r
  vColor = color * alpha * fade * twinkle * depthLight * reveal * inside * sqrt(spread) * uEncode;\r
}\r
\`;\r
\r
const dustFragment = \`#version 300 es\r
precision highp float;\r
\r
uniform float uShape;\r
\r
in vec3 vColor;\r
in float vSize;\r
\r
out vec4 fragColor;\r
\r
void main() {\r
  vec2 q = (gl_PointCoord - 0.5) * (vSize + 2.0);\r
  float half_ = max(vSize * 0.5, 0.5);\r
  float cover;\r
  if (uShape < 0.5) {\r
    vec2 c = clamp(half_ - abs(q) + 0.5, 0.0, 1.0);\r
    cover = c.x * c.y;\r
  } else {\r
    cover = clamp(half_ - length(q) + 0.5, 0.0, 1.0);\r
  }\r
  if (cover <= 0.0) discard;\r
  fragColor = vec4(vColor * cover, 0.0);\r
}\r
\`;\r
\r
const stirFragment = \`#version 300 es\r
precision highp float;\r
\r
uniform sampler2D tHome;\r
uniform sampler2D tSeed;\r
uniform sampler2D tOffset;\r
uniform sampler2D tVelocity;\r
uniform float uDt;\r
uniform float uReset;\r
uniform vec4 uBrush;\r
uniform float uBrushPower;\r
uniform vec4 uKick;\r
\r
layout(location = 0) out vec4 outOffset;\r
layout(location = 1) out vec4 outVelocity;\r
\${hashChunk}\r
\${dustChunk}\r
vec3 swirl(vec3 p) {\r
  float t = uDustTime * 0.15;\r
  vec3 a = vec3(1.7, 1.9, 1.5) * p.yzx + vec3(t, 1.2, 2.1);\r
  vec3 b = vec3(2.3, 2.1, 2.7) * p.zxy + vec3(0.4, t * 1.3, 0.9);\r
  vec3 ca = cos(a) * vec3(1.7, 1.9, 1.5);\r
  vec3 cb = cos(b) * vec3(2.3, 2.1, 2.7);\r
  return vec3(ca.z - cb.x, cb.y - ca.x, ca.y - cb.z);\r
}\r
\r
void main() {\r
  ivec2 cell = ivec2(gl_FragCoord.xy);\r
  if (uReset > 0.5) {\r
    outOffset = vec4(0.0);\r
    outVelocity = vec4(0.0);\r
    return;\r
  }\r
  uint id = uint(cell.y * \${STATE_WIDTH} + cell.x);\r
  vec4 home = texelFetch(tHome, cell, 0);\r
  vec4 seed = texelFetch(tSeed, cell, 0);\r
  vec3 o = texelFetch(tOffset, cell, 0).xyz;\r
  vec3 v = texelFetch(tVelocity, cell, 0).xyz;\r
  float life;\r
  float spread;\r
  vec3 base = drift(home, seed, id, life, spread);\r
  vec3 p = base + o;\r
\r
  float k = mix(0.8, 2.2, random(id * 7u + 11u));\r
  vec3 acc = -k * o - 1.5 * sqrt(k) * v;\r
\r
  vec2 gap = p.xy - uBrush.xy;\r
  float touch = exp(-dot(gap, gap) / 0.07) * uBrushPower;\r
  acc += (vec3(uBrush.zw, 0.0) - v) * touch * 14.0;\r
  float pace = length(v);\r
  if (pace > 1e-4) {\r
    vec3 heading = v / pace;\r
    vec3 curl = swirl(p * 1.6);\r
    acc += (curl - heading * dot(curl, heading)) * min(pace, 2.0) * 1.8;\r
  }\r
\r
  if (uKick.z > 0.0) {\r
    vec3 jolt = vec3(random(id * 7u + 12u), random(id * 7u + 13u), random(id * 7u + 14u)) - 0.5;\r
    float near = exp(-dot(p.xy - uKick.xy, p.xy - uKick.xy) / 0.4);\r
    vec3 spinKick = vec3(-p.z, 0.0, p.x) * 0.9;\r
    vec3 lift = vec3(0.0, 0.5 + 0.8 * random(id * 7u + 15u), 0.0) * (0.3 + 0.7 * smoothstep(0.2, -0.8, p.y));\r
    v += (jolt * 0.8 + spinKick + lift) * uKick.z * (0.4 + 0.45 * near);\r
  }\r
\r
  v += acc * uDt;\r
  o += v * uDt;\r
  vec3 q = base + o;\r
  float len = length(q);\r
  if (len > 0.97) {\r
    vec3 n = q / len;\r
    o -= n * (len - 0.97);\r
    v -= n * max(dot(v, n), 0.0) * 1.5;\r
  }\r
  outOffset = vec4(o, 1.0);\r
  outVelocity = vec4(v, 1.0);\r
}\r
\`;\r
\r
const compositeFragment = \`#version 300 es\r
precision highp float;\r
\r
uniform sampler2D tScene;\r
uniform float uLight;\r
uniform float uDecode;\r
\r
in vec2 vUv;\r
out vec4 fragColor;\r
\r
vec3 soften(vec3 x) {\r
  vec3 over = max(x - 0.6, 0.0);\r
  return min(x, 0.6) + 0.4 * (1.0 - exp(-over / 0.4));\r
}\r
\r
void main() {\r
  vec4 scene = texture(tScene, vUv) * uDecode;\r
  vec3 light = max(scene.rgb, 0.0);\r
  float peak = max(light.r, max(light.g, light.b));\r
  if (uLight > 0.5) {\r
    vec3 hue = light / max(peak, 1e-4);\r
    float cover = 1.0 - exp(-peak * 2.4);\r
    vec3 ink = hue * mix(0.92, 0.72, cover);\r
    float core = clamp(scene.a * 0.7, 0.0, 1.0) * cover;\r
    vec3 tint = mix(vec3(1.0), hue, 0.22);\r
    fragColor = vec4(tint * core + ink * cover * (1.0 - core), core + cover * (1.0 - core));\r
    return;\r
  }\r
  light += vec3(max(peak - 1.8, 0.0) * 0.25);\r
  vec3 shown = soften(light);\r
  fragColor = vec4(shown, max(shown.r, max(shown.g, shown.b)));\r
}\r
\`;\r
\r
const CrystalizedBall = ({\r
  preset = 'plasma',\r
  color,\r
  theme = 'dark',\r
  size = 0.7,\r
  strands,\r
  crackle,\r
  flares,\r
  glow,\r
  sparks,\r
  particleCount,\r
  fill,\r
  motion,\r
  particleShape,\r
  depth,\r
  sway,\r
  twinkle,\r
  haze,\r
  speed = 1,\r
  dustSpeed,\r
  interactive = true,\r
  hoverStrength = 0.7,\r
  intro = true,\r
  paused = false,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const settingsRef = useRef(null);\r
  const wakeRef = useRef(null);\r
\r
  const base = BALL_PRESETS[preset] || BALL_PRESETS.plasma;\r
  const pick = (value, key) => (value === undefined || value === null ? base[key] : value);\r
  const tint = pick(color, 'color');\r
\r
  const colors = useMemo(() => {\r
    const light = theme === 'light';\r
    return { light, palette: buildPalette(parseColor(tint, [0.95, 0.36, 0.82]), light) };\r
  }, [tint, theme]);\r
\r
  useEffect(() => {\r
    settingsRef.current = {\r
      ...colors,\r
      size,\r
      strands: pick(strands, 'strands'),\r
      crackle: pick(crackle, 'crackle'),\r
      flares: pick(flares, 'flares'),\r
      glow: pick(glow, 'glow'),\r
      sparks: pick(sparks, 'sparks'),\r
      particleCount: pick(particleCount, 'particleCount'),\r
      fill: pick(fill, 'fill'),\r
      motion: pick(motion, 'motion'),\r
      particleShape: pick(particleShape, 'particleShape'),\r
      depth: pick(depth, 'depth'),\r
      sway: pick(sway, 'sway'),\r
      twinkle: pick(twinkle, 'twinkle'),\r
      haze: pick(haze, 'haze'),\r
      dustSpeed: pick(dustSpeed, 'dustSpeed'),\r
      speed,\r
      interactive,\r
      hoverStrength,\r
      intro,\r
      paused\r
    };\r
    wakeRef.current?.();\r
  });\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    if (!container) return undefined;\r
\r
    const renderer = new Renderer({ alpha: true, premultipliedAlpha: true, antialias: false, depth: false });\r
    const gl = renderer.gl;\r
    if (!renderer.isWebgl2) {\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
      return undefined;\r
    }\r
    const canvas = gl.canvas;\r
    canvas.style.display = 'block';\r
    canvas.style.width = '100%';\r
    canvas.style.height = '100%';\r
    canvas.setAttribute('aria-hidden', 'true');\r
    container.appendChild(canvas);\r
\r
    const fullFloat = !!gl.getExtension('EXT_color_buffer_float');\r
    const halfFloat = fullFloat || !!gl.getExtension('EXT_color_buffer_half_float');\r
    const encode = halfFloat ? 1 : 0.25;\r
    const geometry = new Triangle(gl);\r
    const blank = new Texture(gl);\r
    const strandData = buildStrands();\r
\r
    const sceneTarget = new RenderTarget(gl, {\r
      width: 1,\r
      height: 1,\r
      depth: false,\r
      type: halfFloat ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE,\r
      format: gl.RGBA,\r
      internalFormat: halfFloat ? gl.RGBA16F : gl.RGBA,\r
      minFilter: gl.NEAREST,\r
      magFilter: gl.NEAREST\r
    });\r
\r
    const arcData = new Array(MAX_ARCS * 4).fill(0);\r
    const fieldUniforms = {\r
      uCenter: { value: [0, 0] },\r
      uRadius: { value: 1 },\r
      uDpr: { value: 1 },\r
      uLine: { value: 0.6 },\r
      uTime: { value: 0 },\r
      uFrame: { value: 0 },\r
      uBins: { value: 420 },\r
      uStrands: { value: 5 },\r
      uCrackle: { value: 0.6 },\r
      uFlares: { value: 0.5 },\r
      uGlow: { value: 0.8 },\r
      uHaze: { value: 0.7 },\r
      uFill: { value: 0.5 },\r
      uPresence: { value: 0 },\r
      uUnfold: { value: 0 },\r
      uBloom: { value: 0 },\r
      uInside: { value: 0 },\r
      uEncode: { value: encode },\r
      uRim: { value: [1, 1, 1] },\r
      uRimHot: { value: [1, 1, 1] },\r
      uRimMid: { value: [1, 1, 1] },\r
      uRimDeep: { value: [1, 1, 1] },\r
      uSpark: { value: [1, 1, 1] },\r
      uSparkGlow: { value: [1, 1, 1] },\r
      uHazeColor: { value: [0, 0, 0] },\r
      uEdgeColor: { value: [0, 0, 0] },\r
      uHeat: { value: [0, 0, 0, 0] },\r
      uHarmonics: { value: strandData.harmonics },\r
      uRates: { value: strandData.rates },\r
      uPhases: { value: strandData.phases },\r
      uFlareHarmonics: { value: strandData.flareHarmonics },\r
      uFlareRates: { value: strandData.flareRates },\r
      uFlarePhases: { value: strandData.flarePhases },\r
      uArcs: { value: arcData }\r
    };\r
\r
    const dustShared = {\r
      uDustTime: { value: 0 },\r
      uTurn: { value: [0, 0] },\r
      uMotion: { value: 0 },\r
      uFill: fieldUniforms.uFill,\r
      tHome: { value: blank },\r
      tSeed: { value: blank }\r
    };\r
\r
    const dustUniforms = {\r
      ...dustShared,\r
      tOffset: { value: blank },\r
      uStirred: { value: 0 },\r
      uCenter: fieldUniforms.uCenter,\r
      uViewport: { value: [1, 1] },\r
      uRadius: fieldUniforms.uRadius,\r
      uDpr: fieldUniforms.uDpr,\r
      uDepth: { value: 0.6 },\r
      uTwinkle: { value: 0.5 },\r
      uPointScale: { value: 1 },\r
      uReveal: { value: 0 },\r
      uEncode: { value: encode },\r
      uTones: { value: new Array(15).fill(1) },\r
      uRimTone: { value: [1, 1, 1] },\r
      uShape: { value: 0 }\r
    };\r
\r
    const stirUniforms = {\r
      ...dustShared,\r
      tOffset: { value: blank },\r
      tVelocity: { value: blank },\r
      uDt: { value: 0.016 },\r
      uReset: { value: 1 },\r
      uBrush: { value: [0, 0, 0, 0] },\r
      uBrushPower: { value: 0 },\r
      uKick: { value: [0, 0, 0, 0] }\r
    };\r
\r
    const compositeUniforms = {\r
      tScene: { value: sceneTarget.texture },\r
      uLight: { value: 0 },\r
      uDecode: { value: 1 / encode }\r
    };\r
\r
    const additive = program => {\r
      program.setBlendFunc(gl.ONE, gl.ONE);\r
      return program;\r
    };\r
\r
    const fieldMesh = new Mesh(gl, {\r
      geometry,\r
      program: additive(\r
        new Program(gl, {\r
          vertex: passVertex,\r
          fragment: fieldFragment,\r
          uniforms: fieldUniforms,\r
          transparent: true,\r
          depthTest: false,\r
          depthWrite: false\r
        })\r
      )\r
    });\r
    const dustProgram = additive(\r
      new Program(gl, {\r
        vertex: dustVertex,\r
        fragment: dustFragment,\r
        uniforms: dustUniforms,\r
        transparent: true,\r
        depthTest: false,\r
        depthWrite: false\r
      })\r
    );\r
    const stirMesh = halfFloat\r
      ? new Mesh(gl, {\r
          geometry,\r
          program: new Program(gl, {\r
            vertex: passVertex,\r
            fragment: stirFragment,\r
            uniforms: stirUniforms,\r
            depthTest: false,\r
            depthWrite: false\r
          })\r
        })\r
      : null;\r
    const compositeMesh = new Mesh(gl, {\r
      geometry,\r
      program: new Program(gl, {\r
        vertex: passVertex,\r
        fragment: compositeFragment,\r
        uniforms: compositeUniforms,\r
        depthTest: false,\r
        depthWrite: false\r
      })\r
    });\r
\r
    const disposeTarget = target => {\r
      if (!target) return;\r
      gl.deleteFramebuffer(target.buffer);\r
      target.textures.forEach(texture => gl.deleteTexture(texture.texture));\r
    };\r
\r
    const stateTarget = rows =>\r
      new RenderTarget(gl, {\r
        width: STATE_WIDTH,\r
        height: rows,\r
        color: 2,\r
        depth: false,\r
        type: fullFloat ? gl.FLOAT : gl.HALF_FLOAT,\r
        format: gl.RGBA,\r
        internalFormat: fullFloat ? gl.RGBA32F : gl.RGBA16F,\r
        minFilter: gl.NEAREST,\r
        magFilter: gl.NEAREST\r
      });\r
\r
    const dataTexture = (data, rows) =>\r
      new Texture(gl, {\r
        image: data,\r
        width: STATE_WIDTH,\r
        height: rows,\r
        type: gl.FLOAT,\r
        format: gl.RGBA,\r
        internalFormat: gl.RGBA32F,\r
        minFilter: gl.NEAREST,\r
        magFilter: gl.NEAREST,\r
        generateMipmaps: false,\r
        flipY: false\r
      });\r
\r
    let dust = null;\r
\r
    const disposeDust = () => {\r
      if (!dust) return;\r
      dust.mesh.geometry.remove();\r
      gl.deleteTexture(dust.home.texture);\r
      gl.deleteTexture(dust.seed.texture);\r
      disposeTarget(dust.read);\r
      disposeTarget(dust.write);\r
      dust = null;\r
    };\r
\r
    const resetStir = () => {\r
      if (!stirMesh || !dust || !dust.read || !dust.write) return;\r
      stirUniforms.tOffset.value = blank;\r
      stirUniforms.tVelocity.value = blank;\r
      stirUniforms.uReset.value = 1;\r
      renderer.render({ scene: stirMesh, target: dust.read, clear: false });\r
      renderer.render({ scene: stirMesh, target: dust.write, clear: false });\r
      stirUniforms.uReset.value = 0;\r
    };\r
\r
    const rebuildDust = requested => {\r
      const total = clamp(Math.round(requested / 100) * 100, 0, MAX_PARTICLES);\r
      if (dust && dust.requested === total) return;\r
      disposeDust();\r
      if (!total) {\r
        dust = null;\r
        return;\r
      }\r
      const data = buildDust(total);\r
      const indices = new Float32Array(data.count);\r
      for (let i = 0; i < data.count; i++) indices[i] = i;\r
      const points = new Geometry(gl, { aIndex: { size: 1, data: indices } });\r
      dust = {\r
        requested: total,\r
        rows: data.rows,\r
        home: dataTexture(data.home, data.rows),\r
        seed: dataTexture(data.seed, data.rows),\r
        mesh: new Mesh(gl, { mode: gl.POINTS, geometry: points, program: dustProgram }),\r
        read: stirMesh ? stateTarget(data.rows) : null,\r
        write: stirMesh ? stateTarget(data.rows) : null\r
      };\r
      dustShared.tHome.value = dust.home;\r
      dustShared.tSeed.value = dust.seed;\r
      resetStir();\r
      stirring = 0;\r
    };\r
\r
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const random = seeded(913);\r
\r
    let width = 1;\r
    let height = 1;\r
    let raf = 0;\r
    let last = performance.now();\r
    let rimTime = 0;\r
    let dustTime = 0;\r
    let swayClock = 0;\r
    let introClock = 0;\r
    let visible = true;\r
    let alive = true;\r
    let surge = 0;\r
    let stirring = 0;\r
    let stirEnergy = 0;\r
    let kick = null;\r
    let nextArc = 0.3;\r
    const arcs = [];\r
    const pointer = { x: 0, y: 0, inside: false, fresh: true };\r
    const heat = { angle: 0, velocity: 0, power: 0, near: 0 };\r
    const brush = { x: 0, y: 0, vx: 0, vy: 0 };\r
    const look = { x: 0, y: 0, vx: 0, vy: 0 };\r
\r
    const resize = () => {\r
      width = Math.max(1, container.clientWidth);\r
      height = Math.max(1, container.clientHeight);\r
      renderer.dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(PIXEL_BUDGET / (width * height)));\r
      renderer.setSize(width, height);\r
      sceneTarget.setSize(gl.canvas.width, gl.canvas.height);\r
      start();\r
    };\r
\r
    const spawnArc = (angle, strength) => {\r
      if (arcs.length >= MAX_ARCS) return;\r
      arcs.push({\r
        start: angle,\r
        span: (0.05 + random() * 0.07) * (random() < 0.5 ? -1 : 1),\r
        curl: 0.02 + random() * 0.04,\r
        life: 0,\r
        duration: 0.2 + random() * 0.2,\r
        drift: (random() - 0.5) * 0.3,\r
        strength\r
      });\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!alive) return;\r
      const s = settingsRef.current;\r
      const dt = Math.min(0.05, Math.max(1 / 240, (now - last) / 1000));\r
      last = now;\r
      if (!s) return;\r
\r
      const moving = !s.paused && !reducedMotion;\r
      introClock = s.intro && !reducedMotion ? Math.min(1, introClock + dt / INTRO_SECONDS) : 1;\r
      const presence = easeOut(smooth(0, 0.42, introClock));\r
      const unfold = easeOut(smooth(0, 0.32, introClock));\r
      const charge = Math.sin(Math.PI * smooth(0.22, 0.78, introClock)) * 0.35;\r
      const radius = Math.max(8, (clamp(s.size, 0.1, 1.5) * Math.min(width, height)) / 2);\r
\r
      const strength = s.interactive && !reducedMotion ? clamp(s.hoverStrength, 0, 1) : 0;\r
      const px = pointer.x - width / 2;\r
      const py = height / 2 - pointer.y;\r
      const reach = Math.hypot(px, py);\r
      const target = pointer.inside ? strength : 0;\r
      if (heat.power < 0.02) {\r
        heat.angle = Math.atan2(py, px);\r
        heat.velocity = 0;\r
      }\r
      const turn = wrapAngle(Math.atan2(py, px) - heat.angle);\r
      heat.velocity += (120 * turn - 19 * heat.velocity) * dt;\r
      heat.angle = wrapAngle(heat.angle + heat.velocity * dt);\r
      heat.power += (target - heat.power) * (1 - Math.exp(-dt / (target > heat.power ? 0.3 : 0.55)));\r
      const nearTarget = Math.exp(-Math.pow((reach - radius) / (radius * 0.45), 2));\r
      heat.near += (nearTarget - heat.near) * (1 - Math.exp(-dt / 0.15));\r
      surge *= Math.exp(-dt / 0.7);\r
\r
      const bx = px / radius;\r
      const by = py / radius;\r
      if (Math.hypot(bx - brush.x, by - brush.y) > 0.6) pointer.fresh = true;\r
      if (pointer.fresh) {\r
        brush.x = bx;\r
        brush.y = by;\r
        brush.vx = 0;\r
        brush.vy = 0;\r
        pointer.fresh = false;\r
      }\r
      const follow = 1 - Math.exp(-dt / 0.05);\r
      brush.vx += ((bx - brush.x) / dt - brush.vx) * follow;\r
      brush.vy += ((by - brush.y) / dt - brush.vy) * follow;\r
      brush.x = bx;\r
      brush.y = by;\r
      const brushSpeed = Math.hypot(brush.vx, brush.vy);\r
      const cap = brushSpeed > 4 ? 4 / brushSpeed : 1;\r
      const inBall = Math.exp(-Math.max(0, Math.hypot(bx, by) - 1) * 6);\r
      const brushPower = pointer.inside ? strength * inBall * presence : 0;\r
      stirEnergy = stirEnergy * Math.exp(-dt / 1.2) + brushPower * Math.min(brushSpeed, 4) * dt;\r
\r
      if (moving) {\r
        const pace = 1 + surge * 0.6 + heat.power * heat.near * 0.3;\r
        const step = dt * Math.max(0, s.speed) * 2 * pace;\r
        rimTime += step;\r
        dustTime += dt * Math.max(0, s.dustSpeed) * (1 + surge * 0.4);\r
        swayClock += dt * Math.max(0, s.dustSpeed);\r
        const crackleNow = clamp(s.crackle + surge * 0.5, 0, 1.5);\r
        if (s.sparks > 0.01 && introClock > 0.55) {\r
          nextArc -= step * s.sparks * 2 * (0.6 + crackleNow * 0.6);\r
          if (nextArc <= 0) {\r
            const local = heat.power * heat.near;\r
            const angle =\r
              random() < local * 0.7\r
                ? heat.angle + (random() - 0.5) * 0.8\r
                : random() < 0.7\r
                  ? Math.PI / 2 + (random() - 0.5) * 1.5\r
                  : random() * Math.PI * 2;\r
            spawnArc(angle, 0.8 + local * 0.6 + surge * 0.4);\r
            nextArc = 0.15 + random() * 0.6;\r
          }\r
        }\r
        for (let i = arcs.length - 1; i >= 0; i--) {\r
          const arc = arcs[i];\r
          arc.life += step;\r
          arc.start += arc.drift * step;\r
          if (arc.life >= arc.duration) arcs.splice(i, 1);\r
        }\r
      } else {\r
        arcs.length = 0;\r
      }\r
      for (let i = 0; i < MAX_ARCS; i++) {\r
        const arc = arcs[i];\r
        arcData[i * 4] = arc ? arc.start : 0;\r
        arcData[i * 4 + 1] = arc ? arc.span : 0;\r
        arcData[i * 4 + 2] = arc ? arc.curl : 0;\r
        arcData[i * 4 + 3] = arc ? Math.sin((Math.PI * arc.life) / arc.duration) * arc.strength : 0;\r
      }\r
\r
      rebuildDust(s.particleCount);\r
      const palette = s.palette;\r
\r
      fieldUniforms.uCenter.value = [width / 2, height / 2];\r
      fieldUniforms.uRadius.value = radius;\r
      fieldUniforms.uDpr.value = renderer.dpr;\r
      fieldUniforms.uLine.value = Math.max(0.6, radius * 0.0035);\r
      fieldUniforms.uTime.value = rimTime;\r
      fieldUniforms.uFrame.value = Math.floor(rimTime * 24) % 100000;\r
      fieldUniforms.uBins.value = clamp(Math.round((Math.PI * 2 * radius) / 2.6), 240, 900);\r
      fieldUniforms.uStrands.value = Math.round(clamp(s.strands, 1, MAX_STRANDS));\r
      fieldUniforms.uCrackle.value = clamp(s.crackle, 0, 1) + surge * 0.5 + charge;\r
      fieldUniforms.uFlares.value = clamp(s.flares, 0, 1);\r
      fieldUniforms.uGlow.value = clamp(s.glow, 0, 2) * (1 + surge * 0.5 + charge) * (s.light ? 0.35 : 1);\r
      fieldUniforms.uHaze.value = clamp(s.haze, 0, 2) * (s.light ? 0.6 : 1);\r
      fieldUniforms.uFill.value = clamp(s.fill, 0, 1);\r
      fieldUniforms.uPresence.value = presence;\r
      fieldUniforms.uUnfold.value = unfold;\r
      fieldUniforms.uBloom.value = presence * presence;\r
      fieldUniforms.uInside.value = smooth(0.2, 0.95, introClock);\r
      fieldUniforms.uRim.value = palette.rim;\r
      fieldUniforms.uRimHot.value = palette.rimHot;\r
      fieldUniforms.uRimMid.value = palette.rimMid;\r
      fieldUniforms.uRimDeep.value = palette.rimDeep;\r
      fieldUniforms.uSpark.value = palette.spark;\r
      fieldUniforms.uSparkGlow.value = palette.sparkGlow;\r
      fieldUniforms.uHazeColor.value = palette.haze;\r
      fieldUniforms.uEdgeColor.value = palette.edge;\r
      fieldUniforms.uHeat.value = [heat.angle, heat.near, heat.power * presence, 0];\r
\r
      dustShared.uDustTime.value = dustTime;\r
      const gaze = pointer.inside ? strength * presence : 0;\r
      const lookX = clamp(bx, -1.6, 1.6) * gaze;\r
      const lookY = clamp(by, -1.6, 1.6) * gaze;\r
      look.vx += (40 * (lookX - look.x) - 11 * look.vx) * dt;\r
      look.vy += (40 * (lookY - look.y) - 11 * look.vy) * dt;\r
      look.x += look.vx * dt;\r
      look.y += look.vy * dt;\r
      const swing = clamp(s.sway, 0, 1);\r
      dustShared.uTurn.value = [\r
        swing * 0.42 * Math.sin(swayClock * 0.23) + look.x * 0.3,\r
        swing * 0.12 * Math.sin(swayClock * 0.17 + 1.3) - look.y * 0.16\r
      ];\r
      dustShared.uMotion.value = MOTIONS[s.motion] ?? 0;\r
      dustUniforms.uViewport.value = [width, height];\r
      dustUniforms.uDepth.value = clamp(s.depth, 0, 1);\r
      dustUniforms.uTwinkle.value = clamp(s.twinkle, 0, 1);\r
      dustUniforms.uPointScale.value = Math.max(1, radius / 491);\r
      dustUniforms.uReveal.value = smooth(0.18, 1, introClock);\r
      dustUniforms.uTones.value = palette.tones.flat();\r
      dustUniforms.uRimTone.value = palette.rim;\r
      dustUniforms.uShape.value = SHAPES[s.particleShape] ?? 0;\r
\r
      const layer = dust;\r
      if (layer && stirMesh && (stirEnergy > 0.002 || kick)) stirring = SETTLE_SECONDS;\r
      let stirred = false;\r
      if (layer && layer.read && layer.write && stirMesh && stirring > 0) {\r
        stirUniforms.uDt.value = Math.min(dt, 1 / 30);\r
        stirUniforms.uBrush.value = [brush.x, brush.y, brush.vx * cap, brush.vy * cap];\r
        stirUniforms.uBrushPower.value = brushPower;\r
        stirUniforms.uKick.value = kick ? [kick.x, kick.y, kick.strength, 0] : [0, 0, 0, 0];\r
        stirUniforms.tOffset.value = layer.read.textures[0];\r
        stirUniforms.tVelocity.value = layer.read.textures[1];\r
        renderer.render({ scene: stirMesh, target: layer.write, clear: false });\r
        const swap = layer.read;\r
        layer.read = layer.write;\r
        layer.write = swap;\r
        stirring -= dt;\r
        stirred = stirring > 0;\r
        if (!stirred) {\r
          stirring = 0;\r
          resetStir();\r
        }\r
      }\r
      kick = null;\r
      dustUniforms.uStirred.value = stirred ? 1 : 0;\r
      dustUniforms.tOffset.value = layer && layer.read ? layer.read.textures[0] : blank;\r
\r
      gl.clearColor(0, 0, 0, 0);\r
      renderer.render({ scene: fieldMesh, target: sceneTarget, clear: true });\r
      if (dust) renderer.render({ scene: dust.mesh, target: sceneTarget, clear: false });\r
\r
      compositeUniforms.uLight.value = s.light ? 1 : 0;\r
      renderer.render({ scene: compositeMesh, clear: false });\r
\r
      const settling =\r
        Math.abs(target - heat.power) > 0.002 ||\r
        surge > 0.002 ||\r
        stirring > 0 ||\r
        Math.abs(heat.velocity) > 0.01 ||\r
        Math.hypot(look.vx, look.vy, look.x - lookX, look.y - lookY) > 0.001;\r
      if (visible && (moving || introClock < 1 || settling)) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const start = () => {\r
      if (raf || !visible || !alive) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const locate = e => {\r
      const rect = container.getBoundingClientRect();\r
      const x = e.clientX - rect.left;\r
      const y = e.clientY - rect.top;\r
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };\r
    };\r
\r
    const onPointerMove = e => {\r
      const spot = locate(e);\r
      if (spot.inside && !pointer.inside) pointer.fresh = true;\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = spot.inside;\r
      if (spot.inside) start();\r
    };\r
\r
    const onPointerDown = e => {\r
      const s = settingsRef.current;\r
      const spot = locate(e);\r
      if (!s || !s.interactive || reducedMotion || !spot.inside) return;\r
      if (!pointer.inside) pointer.fresh = true;\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = true;\r
      const radius = Math.max(8, (clamp(s.size, 0.1, 1.5) * Math.min(width, height)) / 2);\r
      const kx = (spot.x - width / 2) / radius;\r
      const ky = (height / 2 - spot.y) / radius;\r
      const distance = Math.hypot(kx, ky);\r
      if (distance > 1.3) return;\r
      const strength = clamp(s.hoverStrength, 0, 1);\r
      kick = { x: kx, y: ky, strength: strength * 1.2 };\r
      surge = Math.max(surge, strength);\r
      const angle = Math.atan2(ky, kx);\r
      spawnArc(angle + (random() - 0.5) * 0.5, 1.3);\r
      spawnArc(angle + Math.PI + (random() - 0.5) * 1.2, 1.1);\r
      start();\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      start();\r
    };\r
\r
    const onPointerOut = e => {\r
      if (!e.relatedTarget) onPointerLeave();\r
    };\r
\r
    const onPointerUp = e => {\r
      if (e.pointerType === 'touch') onPointerLeave();\r
    };\r
\r
    const onVisibility = () => {\r
      if (!document.hidden) start();\r
    };\r
\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    window.addEventListener('pointerout', onPointerOut, { passive: true });\r
    window.addEventListener('pointerup', onPointerUp, { passive: true });\r
    window.addEventListener('blur', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(container);\r
    const intersectionObserver = new IntersectionObserver(([entry]) => {\r
      visible = entry.isIntersecting;\r
      start();\r
    });\r
    intersectionObserver.observe(container);\r
\r
    wakeRef.current = start;\r
    resize();\r
\r
    return () => {\r
      alive = false;\r
      visible = false;\r
      cancelAnimationFrame(raf);\r
      resizeObserver.disconnect();\r
      intersectionObserver.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('pointerout', onPointerOut);\r
      window.removeEventListener('pointerup', onPointerUp);\r
      window.removeEventListener('blur', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      wakeRef.current = null;\r
      disposeDust();\r
      disposeTarget(sceneTarget);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);\r
    };\r
  }, []);\r
\r
  return (\r
    <div ref={containerRef} className={\`relative w-full h-full overflow-hidden \${className}\`.trim()} style={style} />\r
  );\r
};\r
\r
export default CrystalizedBall;\r
`,t=`'use client';\r
\r
import { useEffect, useMemo, useRef } from 'react';\r
import type { CSSProperties } from 'react';\r
import { Renderer, Program, Mesh, Triangle, Geometry, RenderTarget, Texture } from 'ogl';\r
\r
import './CrystalizedBall.css';\r
\r
type Preset = 'plasma' | 'aurora' | 'nebula' | 'ember' | 'frost' | 'solar' | 'eclipse' | 'abyss';\r
type Motion = 'rise' | 'fall' | 'drift' | 'orbit';\r
type ParticleShape = 'square' | 'round';\r
type Theme = 'dark' | 'light';\r
type Rgb = [number, number, number];\r
\r
interface PresetValues {\r
  color: string;\r
  strands: number;\r
  crackle: number;\r
  flares: number;\r
  glow: number;\r
  sparks: number;\r
  particleCount: number;\r
  fill: number;\r
  motion: Motion;\r
  particleShape: ParticleShape;\r
  depth: number;\r
  sway: number;\r
  twinkle: number;\r
  haze: number;\r
  dustSpeed: number;\r
}\r
\r
export interface CrystalizedBallProps extends Partial<PresetValues> {\r
  preset?: Preset;\r
  theme?: Theme;\r
  size?: number;\r
  speed?: number;\r
  interactive?: boolean;\r
  hoverStrength?: number;\r
  intro?: boolean;\r
  paused?: boolean;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Palette {\r
  rim: Rgb;\r
  rimHot: Rgb;\r
  rimMid: Rgb;\r
  rimDeep: Rgb;\r
  spark: Rgb;\r
  sparkGlow: Rgb;\r
  haze: Rgb;\r
  edge: Rgb;\r
  tones: Rgb[];\r
}\r
\r
interface Settings extends Omit<PresetValues, 'color'> {\r
  light: boolean;\r
  palette: Palette;\r
  size: number;\r
  speed: number;\r
  interactive: boolean;\r
  hoverStrength: number;\r
  intro: boolean;\r
  paused: boolean;\r
}\r
\r
interface StrandData {\r
  harmonics: number[];\r
  rates: number[];\r
  phases: number[];\r
  flareHarmonics: number[];\r
  flareRates: number[];\r
  flarePhases: number[];\r
}\r
\r
interface Arc {\r
  start: number;\r
  span: number;\r
  curl: number;\r
  life: number;\r
  duration: number;\r
  drift: number;\r
  strength: number;\r
}\r
\r
interface DustLayer {\r
  requested: number;\r
  rows: number;\r
  home: Texture;\r
  seed: Texture;\r
  mesh: Mesh;\r
  read: RenderTarget | null;\r
  write: RenderTarget | null;\r
}\r
\r
const BALL_PRESETS: Record<Preset, PresetValues> = {\r
  plasma: {\r
    color: '#F25BD0',\r
    strands: 6,\r
    crackle: 0.85,\r
    flares: 0.65,\r
    glow: 0.9,\r
    sparks: 0.6,\r
    particleCount: 15000,\r
    fill: 0.5,\r
    motion: 'rise',\r
    particleShape: 'square',\r
    depth: 0.6,\r
    sway: 0.5,\r
    twinkle: 0.5,\r
    haze: 0.7,\r
    dustSpeed: 1\r
  },\r
  aurora: {\r
    color: '#5CFFC8',\r
    strands: 5,\r
    crackle: 0.6,\r
    flares: 0.5,\r
    glow: 0.8,\r
    sparks: 0.45,\r
    particleCount: 15000,\r
    fill: 0.5,\r
    motion: 'rise',\r
    particleShape: 'square',\r
    depth: 0.6,\r
    sway: 0.5,\r
    twinkle: 0.5,\r
    haze: 0.7,\r
    dustSpeed: 1\r
  },\r
  nebula: {\r
    color: '#9478FF',\r
    strands: 6,\r
    crackle: 1,\r
    flares: 0.5,\r
    glow: 0.9,\r
    sparks: 0.6,\r
    particleCount: 18000,\r
    fill: 0.45,\r
    motion: 'rise',\r
    particleShape: 'square',\r
    depth: 0.5,\r
    sway: 0.4,\r
    twinkle: 0.6,\r
    haze: 0.8,\r
    dustSpeed: 1.2\r
  },\r
  ember: {\r
    color: '#FF8A2A',\r
    strands: 5,\r
    crackle: 0.9,\r
    flares: 0.8,\r
    glow: 1,\r
    sparks: 0.8,\r
    particleCount: 12000,\r
    fill: 0.35,\r
    motion: 'rise',\r
    particleShape: 'round',\r
    depth: 0.7,\r
    sway: 0.3,\r
    twinkle: 0.7,\r
    haze: 0.9,\r
    dustSpeed: 1.6\r
  },\r
  frost: {\r
    color: '#BFE6FF',\r
    strands: 3,\r
    crackle: 0.3,\r
    flares: 0.3,\r
    glow: 0.6,\r
    sparks: 0.2,\r
    particleCount: 16000,\r
    fill: 0.6,\r
    motion: 'fall',\r
    particleShape: 'round',\r
    depth: 0.8,\r
    sway: 0.4,\r
    twinkle: 0.4,\r
    haze: 0.5,\r
    dustSpeed: 0.7\r
  },\r
  solar: {\r
    color: '#FFD36E',\r
    strands: 6,\r
    crackle: 0.7,\r
    flares: 1,\r
    glow: 1.1,\r
    sparks: 0.5,\r
    particleCount: 15000,\r
    fill: 0.55,\r
    motion: 'orbit',\r
    particleShape: 'square',\r
    depth: 0.6,\r
    sway: 0.7,\r
    twinkle: 0.5,\r
    haze: 0.8,\r
    dustSpeed: 1\r
  },\r
  eclipse: {\r
    color: '#FFFFFF',\r
    strands: 4,\r
    crackle: 0.5,\r
    flares: 0.4,\r
    glow: 0.7,\r
    sparks: 0.35,\r
    particleCount: 14000,\r
    fill: 0.5,\r
    motion: 'drift',\r
    particleShape: 'square',\r
    depth: 0.7,\r
    sway: 0.5,\r
    twinkle: 0.5,\r
    haze: 0.5,\r
    dustSpeed: 0.8\r
  },\r
  abyss: {\r
    color: '#3F7BFF',\r
    strands: 5,\r
    crackle: 0.55,\r
    flares: 0.6,\r
    glow: 0.9,\r
    sparks: 0.4,\r
    particleCount: 20000,\r
    fill: 0.8,\r
    motion: 'orbit',\r
    particleShape: 'round',\r
    depth: 0.8,\r
    sway: 0.8,\r
    twinkle: 0.5,\r
    haze: 0.6,\r
    dustSpeed: 0.9\r
  }\r
};\r
\r
const MOTIONS: Record<string, number> = { rise: 0, fall: 1, drift: 2, orbit: 3 };\r
const SHAPES: Record<string, number> = { square: 0, round: 1 };\r
const MAX_STRANDS = 8;\r
const MAX_ARCS = 4;\r
const MAX_PARTICLES = 40000;\r
const STATE_WIDTH = 256;\r
const PIXEL_BUDGET = 4.5e6;\r
const INTRO_SECONDS = 2.2;\r
const SETTLE_SECONDS = 7;\r
const WHITE: Rgb = [1, 1, 1];\r
const BLACK: Rgb = [0, 0, 0];\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);\r
const smooth = (edge0: number, edge1: number, value: number) => {\r
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);\r
  return t * t * (3 - 2 * t);\r
};\r
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);\r
const mixColor = (a: number[], b: number[], t: number): Rgb => a.map((v, i) => v + (b[i] - v) * t) as Rgb;\r
const wrapAngle = (a: number) => a - Math.PI * 2 * Math.floor((a + Math.PI) / (Math.PI * 2));\r
\r
const parseColor = (value: string, fallback: Rgb): Rgb => {\r
  try {\r
    const ctx = document.createElement('canvas').getContext('2d');\r
    if (!ctx) return fallback;\r
    ctx.fillStyle = '#000000';\r
    ctx.fillStyle = value;\r
    const resolved = ctx.fillStyle;\r
    if (resolved.startsWith('#')) {\r
      const n = parseInt(resolved.slice(1), 16);\r
      return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];\r
    }\r
    const parts = resolved.match(/[\\d.]+/g);\r
    if (!parts || parts.length < 3) return fallback;\r
    return [Number(parts[0]) / 255, Number(parts[1]) / 255, Number(parts[2]) / 255];\r
  } catch {\r
    return fallback;\r
  }\r
};\r
\r
const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));\r
const toGamma = (c: number) => (c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);\r
\r
const toOklab = (rgb: number[]): Rgb => {\r
  const [r, g, b] = rgb.map(toLinear);\r
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);\r
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);\r
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);\r
  return [\r
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,\r
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,\r
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s\r
  ];\r
};\r
\r
const fromOklab = ([L, a, b]: number[]): Rgb => {\r
  const l = Math.pow(L + 0.3963377774 * a + 0.2158037573 * b, 3);\r
  const m = Math.pow(L - 0.1055613458 * a - 0.0638541728 * b, 3);\r
  const s = Math.pow(L - 0.0894841775 * a - 1.291485548 * b, 3);\r
  return [\r
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,\r
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,\r
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s\r
  ].map(v => clamp(toGamma(clamp(v, 0, 1)), 0, 1)) as Rgb;\r
};\r
\r
const blend = (a: Rgb, b: Rgb, t: number): Rgb => fromOklab(mixColor(toOklab(a), toOklab(b), t));\r
\r
const shift = (rgb: Rgb, hue: number, lightness: number, chroma: number): Rgb => {\r
  const [L, a, b] = toOklab(rgb);\r
  const c = Math.hypot(a, b) * chroma;\r
  const h = Math.atan2(b, a) + (hue * Math.PI) / 180;\r
  return fromOklab([clamp(L + lightness, 0, 1), c * Math.cos(h), c * Math.sin(h)]);\r
};\r
\r
const withLightness = (rgb: Rgb, hue: number, lightness: number, chroma: number): Rgb => {\r
  const [, a, b] = toOklab(rgb);\r
  const c = Math.max(Math.hypot(a, b) * chroma, 0.02);\r
  const h = Math.atan2(b, a) + (hue * Math.PI) / 180;\r
  return fromOklab([clamp(lightness, 0, 1), c * Math.cos(h), c * Math.sin(h)]);\r
};\r
\r
const buildPalette = (color: Rgb, light: boolean): Palette => {\r
  if (light) {\r
    const ink = withLightness(color, 0, Math.min(toOklab(color)[0], 0.62), 1.15);\r
    return {\r
      rim: ink,\r
      rimHot: ink,\r
      rimMid: ink,\r
      rimDeep: withLightness(color, 0, 0.72, 0.8),\r
      spark: withLightness(color, 0, 0.6, 1.2),\r
      sparkGlow: withLightness(color, 0, 0.78, 0.8),\r
      haze: withLightness(color, 0, 0.8, 0.6),\r
      edge: withLightness(color, 0, 0.72, 0.8),\r
      tones: [\r
        withLightness(color, 0, 0.56, 1.1),\r
        withLightness(color, 16, 0.6, 1.05),\r
        withLightness(color, -16, 0.5, 1.1),\r
        withLightness(color, 0, 0.66, 0.9),\r
        withLightness(color, 0, 0.74, 0.7)\r
      ]\r
    };\r
  }\r
  return {\r
    rim: color,\r
    rimHot: mixColor(color, WHITE, 0.72),\r
    rimMid: mixColor(color, BLACK, 0.15),\r
    rimDeep: mixColor(color, BLACK, 0.45),\r
    spark: mixColor(color, WHITE, 0.45),\r
    sparkGlow: shift(color, 0, -0.15, 1),\r
    haze: mixColor(color, BLACK, 0.6),\r
    edge: shift(color, 0, -0.3, 0.9),\r
    tones: [\r
      shift(color, 0, -0.06, 1),\r
      shift(color, 16, -0.02, 1),\r
      shift(color, -16, -0.12, 1.05),\r
      shift(blend(color, WHITE, 0.25), 0, 0.04, 1),\r
      blend(color, WHITE, 0.7)\r
    ]\r
  };\r
};\r
\r
const seeded = (start: number) => {\r
  let state = start >>> 0;\r
  return () => {\r
    state = (state + 0x6d2b79f5) >>> 0;\r
    let t = state;\r
    t = Math.imul(t ^ (t >>> 15), t | 1);\r
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\r
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\r
  };\r
};\r
\r
const buildStrands = (): StrandData => {\r
  const random = seeded(99);\r
  const bands = [\r
    [6, 12, 0.6, 1.6],\r
    [18, 34, 1.5, 3.5],\r
    [40, 70, 3, 7],\r
    [80, 130, 6, 12]\r
  ];\r
  const data: StrandData = {\r
    harmonics: [],\r
    rates: [],\r
    phases: [],\r
    flareHarmonics: [],\r
    flareRates: [],\r
    flarePhases: []\r
  };\r
  for (let s = 0; s < MAX_STRANDS; s++) {\r
    bands.forEach(([low, high, slow, fast]) => {\r
      data.harmonics.push(Math.round(low + random() * (high - low)));\r
      data.rates.push((slow + random() * (fast - slow)) * (random() < 0.5 ? -1 : 1));\r
      data.phases.push(random() * Math.PI * 2);\r
    });\r
    for (let j = 0; j < 3; j++) {\r
      data.flareHarmonics.push(4 + Math.floor(random() * 6));\r
      data.flareRates.push((0.4 + random() * 0.8) * (random() < 0.5 ? -1 : 1));\r
      data.flarePhases.push(random() * Math.PI * 2);\r
    }\r
    const lead = s === 0;\r
    data.flareHarmonics.push(lead ? 0.75 : 0.95 + random() * 0.3);\r
    data.flareRates.push(lead ? 1.15 : 0.8 + random() * 0.2);\r
    data.flarePhases.push(lead ? 1 : 0.7 + random() * 0.25);\r
  }\r
  return data;\r
};\r
\r
const buildDust = (count: number) => {\r
  const random = seeded(1337);\r
  const rows = Math.max(1, Math.ceil(count / STATE_WIDTH));\r
  const home = new Float32Array(STATE_WIDTH * rows * 4);\r
  const seed = new Float32Array(STATE_WIDTH * rows * 4);\r
  let k = 0;\r
  let guard = 0;\r
  while (k < count && guard < count * 80) {\r
    guard++;\r
    let x: number;\r
    let y: number;\r
    let tone: number;\r
    if (random() < 0.28) {\r
      const angle = random() * Math.PI * 2;\r
      const radius = 0.87 + Math.sqrt(random()) * 0.105;\r
      x = Math.cos(angle) * radius;\r
      y = Math.sin(angle) * radius;\r
      if (random() > smooth(-0.6, 0.3, -y)) continue;\r
      const q = random();\r
      tone = q < 0.5 ? 3 : q < 0.8 ? 2 : 1;\r
    } else {\r
      x = random() * 2 - 1;\r
      y = random() * 2 - 1;\r
      const radius = Math.hypot(x, y);\r
      if (radius > 0.975) continue;\r
      const bowl = Math.pow(smooth(-0.25, 0.85, -y), 1.3);\r
      const band = smooth(0.66, 0.96, radius) * smooth(-0.7, 0.3, -y);\r
      const weight = Math.max(bowl, band * 0.9);\r
      if (random() > 0.012 + 0.988 * weight) continue;\r
      if (weight < 0.12) tone = 4;\r
      else {\r
        const q = random();\r
        tone = q < 0.32 ? 0 : q < 0.52 ? 1 : q < 0.8 ? 2 : 3;\r
      }\r
    }\r
    const chord = Math.sqrt(Math.max(0, 0.95 - x * x - y * y));\r
    home[k * 4] = x;\r
    home[k * 4 + 1] = y;\r
    home[k * 4 + 2] = (random() * 2 - 1) * chord;\r
    home[k * 4 + 3] = tone;\r
    seed[k * 4] = tone === 4 ? 1.8 : random() < 0.22 ? 2.1 : 1.3;\r
    seed[k * 4 + 1] = random();\r
    seed[k * 4 + 2] = 2.5 + random() * 3.5;\r
    seed[k * 4 + 3] = 0.16 + random() * 0.26;\r
    k++;\r
  }\r
  return { home, seed, count: k, rows };\r
};\r
\r
const passVertex = \`#version 300 es\r
in vec2 position;\r
in vec2 uv;\r
out vec2 vUv;\r
void main() {\r
  vUv = uv;\r
  gl_Position = vec4(position, 0.0, 1.0);\r
}\r
\`;\r
\r
const hashChunk = \`\r
uint scramble(uint v) {\r
  v = v * 747796405u + 2891336453u;\r
  uint w = ((v >> ((v >> 28u) + 4u)) ^ v) * 277803737u;\r
  return (w >> 22u) ^ w;\r
}\r
\r
float random(uint v) {\r
  return float(scramble(v)) * (1.0 / 4294967295.0);\r
}\r
\`;\r
\r
const dustChunk = \`\r
uniform float uDustTime;\r
uniform vec2 uTurn;\r
uniform float uMotion;\r
uniform float uFill;\r
\r
vec3 settle(vec3 p, out float spread) {\r
  float bend = exp2((0.5 - uFill) * 1.8);\r
  float h = clamp((p.y + 1.0) * 0.5, 0.0, 1.0);\r
  float y = 2.0 * pow(h, bend) - 1.0;\r
  float from = sqrt(max(1.0 - p.y * p.y, 1e-4));\r
  float to = sqrt(max(1.0 - y * y, 0.0));\r
  spread = clamp(bend * pow(max(h, 1e-3), bend - 1.0) * to / from, 0.25, 1.0);\r
  return vec3(p.xz * (to / from), y).xzy;\r
}\r
\r
vec3 drift(vec4 home, vec4 seed, uint id, out float life, out float spread) {\r
  vec3 p = settle(home.xyz, spread);\r
  float t = uDustTime;\r
  float u = fract(t / seed.z + seed.y);\r
  life = sin(3.14159265 * u);\r
  float travel = seed.w;\r
  if (uMotion < 0.5) {\r
    p.y += travel * (u - 0.5);\r
  } else if (uMotion < 1.5) {\r
    p.y -= travel * (u - 0.5);\r
  } else if (uMotion < 2.5) {\r
    p += 0.045 * vec3(\r
      sin(t * 0.37 + seed.y * 17.0) + 0.5 * sin(t * 0.83 + seed.z * 5.0),\r
      sin(t * 0.29 + seed.z * 11.0) + 0.5 * sin(t * 0.61 + seed.w * 7.0),\r
      sin(t * 0.33 + seed.w * 23.0)\r
    );\r
  } else {\r
    float loop = t * (0.6 + 0.9 * random(id * 7u + 3u)) * (random(id * 7u + 10u) < 0.5 ? -1.0 : 1.0) + seed.y * 6.2831853;\r
    p.xy += (0.025 + 0.05 * random(id * 7u + 16u)) * vec2(cos(loop), sin(loop));\r
  }\r
  float wobble = 0.002 + 0.006 * random(id * 7u + 1u);\r
  float w1 = 0.8 + 2.4 * random(id * 7u + 2u);\r
  float w2 = 0.8 + 2.4 * random(id * 7u + 4u);\r
  p += wobble * vec3(sin(t * w1 + seed.y * 40.0), cos(t * w2 + seed.z * 30.0), sin(t * (w1 + w2) * 0.5 + seed.w * 20.0));\r
  float cy = cos(uTurn.x);\r
  float sy = sin(uTurn.x);\r
  p.xz = mat2(cy, -sy, sy, cy) * p.xz;\r
  float cx = cos(uTurn.y);\r
  float sx = sin(uTurn.y);\r
  p.yz = mat2(cx, -sx, sx, cx) * p.yz;\r
  return p;\r
}\r
\`;\r
\r
const fieldFragment = \`#version 300 es\r
precision highp float;\r
\r
uniform vec2 uCenter;\r
uniform float uRadius;\r
uniform float uDpr;\r
uniform float uLine;\r
uniform float uTime;\r
uniform float uFrame;\r
uniform float uBins;\r
uniform float uStrands;\r
uniform float uCrackle;\r
uniform float uFlares;\r
uniform float uGlow;\r
uniform float uHaze;\r
uniform float uFill;\r
uniform float uPresence;\r
uniform float uUnfold;\r
uniform float uBloom;\r
uniform float uInside;\r
uniform float uEncode;\r
uniform vec3 uRim;\r
uniform vec3 uRimHot;\r
uniform vec3 uRimMid;\r
uniform vec3 uRimDeep;\r
uniform vec3 uSpark;\r
uniform vec3 uSparkGlow;\r
uniform vec3 uHazeColor;\r
uniform vec3 uEdgeColor;\r
uniform vec4 uHeat;\r
uniform vec4 uHarmonics[8];\r
uniform vec4 uRates[8];\r
uniform vec4 uPhases[8];\r
uniform vec4 uFlareHarmonics[8];\r
uniform vec4 uFlareRates[8];\r
uniform vec4 uFlarePhases[8];\r
uniform vec4 uArcs[4];\r
\r
out vec4 fragColor;\r
\${hashChunk}\r
const float PI = 3.14159265;\r
const float TAU = 6.28318531;\r
const vec4 AMPS = vec4(0.35, 0.3, 0.22, 0.13);\r
\r
float bell(float d, float w) {\r
  float x = d / w;\r
  return exp(-x * x);\r
}\r
\r
float segment(vec2 p, vec2 a, vec2 b) {\r
  vec2 pa = p - a;\r
  vec2 ba = b - a;\r
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-5), 0.0, 1.0);\r
  return length(pa - ba * h);\r
}\r
\r
float pool(vec2 q) {\r
  float t = length(q - vec2(0.0, mix(-1.0, -0.66, uFill))) / mix(0.8, 1.35, uFill);\r
  return t < 0.6 ? mix(0.5, 0.22, t / 0.6) : mix(0.22, 0.0, clamp((t - 0.6) / 0.4, 0.0, 1.0));\r
}\r
\r
void main() {\r
  vec2 p = gl_FragCoord.xy / uDpr - uCenter;\r
  float r = length(p);\r
  float R = uRadius;\r
  float theta = atan(p.y, p.x);\r
  float lift = p.y / max(r, 1e-3);\r
  float topDim = 1.0 - 0.35 * pow(max(lift, 0.0), 1.5);\r
  vec3 col = vec3(0.0);\r
  float hot = 0.0;\r
  uint frame = uint(uFrame);\r
\r
  if (r < R) {\r
    vec2 q = p / R;\r
    float chord = sqrt(max(1.0 - dot(q, q), 0.0));\r
    float haze = pool(q) * (0.55 + 0.45 * chord);\r
    col += uHazeColor * haze * uHaze * uInside;\r
    float e = length(q - vec2(0.0, 0.2)) / 1.2;\r
    float edge = 0.5 * pow(smoothstep(0.62, 1.0, e), 1.4);\r
    col += uEdgeColor * edge * uInside * (0.5 + 0.5 * uHaze);\r
  }\r
\r
  float dr = r - R;\r
  float halo = 1.0 - smoothstep(R * 0.05, R * 0.105, abs(dr - R * 0.0213));\r
  col += uRimDeep * 0.18 * halo * topDim * uGlow * uBloom;\r
  col += uRim * 0.12 * bell(dr + R * 0.0383, R * 0.032) * uGlow * uBloom;\r
  col += uRim * 0.32 * bell(dr, max(R * 0.0117, uLine)) * uPresence * uUnfold;\r
\r
  float delta = mod(theta - uHeat.x + PI, TAU) - PI;\r
  float heat = uHeat.z * uHeat.y * exp(-delta * delta / 0.3);\r
  float crackle = uCrackle + heat * 0.9;\r
  float amp = R * 0.016 * (0.3 + 1.4 * crackle) * uUnfold;\r
  float jitterAmp = R * 0.0048 * (0.3 + 1.4 * uCrackle) * uUnfold * (1.0 + heat * 0.3);\r
  float flareAmp = R * 0.064 * (0.4 + 1.2 * crackle) * uFlares * 1.6 * uUnfold;\r
\r
  if (abs(dr) < amp * 2.0 + flareAmp + R * 0.3) {\r
    float step = TAU / uBins;\r
    float binPos = (theta + PI) / step;\r
    float bin0 = floor(binPos);\r
    float binF = binPos - bin0;\r
    float th0 = bin0 * step - PI;\r
    float th1 = th0 + step;\r
    uint b0 = uint(mod(bin0, uBins));\r
    uint b1 = uint(mod(bin0 + 1.0, uBins));\r
    float gain = min(1.0, 2.4 / max(uStrands, 1.0));\r
    for (int k = 0; k < 8; k++) {\r
      if (float(k) >= uStrands) break;\r
      vec4 m = uHarmonics[k];\r
      vec4 lead = uRates[k] * uTime + uPhases[k];\r
      float wave0 = dot(AMPS, sin(m * th0 + lead));\r
      float wave1 = dot(AMPS, sin(m * th1 + lead));\r
      uint salt = uint(k) * 1013u + frame * 7919u;\r
      vec4 shape = uFlareHarmonics[k];\r
      vec4 look = uFlareRates[k];\r
      vec4 tone = uFlarePhases[k];\r
      float a = amp * shape.w;\r
      float off0 = a * wave0 + jitterAmp * (random(b0 + salt) - 0.5);\r
      float off1 = a * wave1 + jitterAmp * (random(b1 + salt) - 0.5);\r
      float rc = R + mix(off0, off1, binF);\r
      float grade = (off1 - off0) / (step * max(r, 1.0));\r
      float d = abs(r - rc) * inversesqrt(1.0 + grade * grade);\r
      float swell = 0.8 + 0.4 * (0.5 + 0.5 * sin(3.0 * theta + uTime * 0.7 + tone.x * 1.7));\r
      float width = uLine * look.w * swell * (1.0 + heat * 0.25);\r
      float core = exp(-d * d / (width * width));\r
      float sheath = exp(-d * d / (width * width * 3.0));\r
      float bright = tone.w * (1.0 + heat * 0.45) * uPresence;\r
      col += (uRimHot * core * 0.8 + uRim * sheath * 0.32) * bright;\r
      hot += core * bright;\r
      vec3 fargs = shape.xyz * theta + look.xyz * uTime + tone.xyz;\r
      float flare = max(0.0, (sin(fargs.x) + sin(fargs.y) + sin(fargs.z)) / 3.0);\r
      flare = (flare * flare + heat * 0.35) * flareAmp;\r
      float dw = abs(r - rc - flare);\r
      float dm = abs(r - rc - flare * 0.6);\r
      float dn = abs(r - rc - flare * 0.25);\r
      vec3 glow = uRimDeep * (0.07 * bell(dw, R * 0.09) + 0.16 * bell(dw, R * 0.05));\r
      glow += uRimMid * 0.28 * bell(dm, R * 0.027) + uRim * 0.38 * bell(dn, R * 0.013);\r
      col += glow * gain * topDim * uGlow * uBloom * (1.0 + heat * 1.4);\r
    }\r
  }\r
\r
  for (int i = 0; i < 4; i++) {\r
    vec4 arc = uArcs[i];\r
    if (arc.w <= 0.002) continue;\r
    float mid = arc.x + arc.y * 0.5;\r
    vec2 center = R * 0.93 * vec2(cos(mid), sin(mid));\r
    if (distance(p, center) > R * (abs(arc.y) * 0.6 + 0.1) + 12.0) continue;\r
    float ar = R * 0.955;\r
    vec2 a0 = ar * vec2(cos(arc.x), sin(arc.x));\r
    vec2 a2 = ar * vec2(cos(arc.x + arc.y), sin(arc.x + arc.y));\r
    vec2 a1 = R * (0.955 - arc.z) * vec2(cos(mid), sin(mid));\r
    float dmin = 1e5;\r
    float along = 0.0;\r
    vec2 prev = a0;\r
    for (int s = 1; s <= 10; s++) {\r
      float u = float(s) / 10.0;\r
      vec2 b = mix(mix(a0, a1, u), mix(a1, a2, u), u);\r
      vec2 pa = p - prev;\r
      vec2 ba = b - prev;\r
      float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-5), 0.0, 1.0);\r
      float dist = length(pa - ba * h);\r
      if (dist < dmin) {\r
        dmin = dist;\r
        along = (float(s) - 1.0 + h) / 10.0;\r
      }\r
      prev = b;\r
    }\r
    float taper = sqrt(max(sin(PI * along), 0.0));\r
    float arcWidth = uLine * (0.55 + 0.6 * taper);\r
    float arcCore = exp(-dmin * dmin / (arcWidth * arcWidth));\r
    float arcGlow = exp(-dmin * dmin / (arcWidth * arcWidth * 12.0));\r
    col += (uSpark * 0.95 * arcCore + uSparkGlow * 0.4 * arcGlow) * arc.w * taper;\r
    hot += arcCore * arc.w * taper * 0.6;\r
  }\r
\r
  fragColor = vec4(col, hot) * uEncode;\r
}\r
\`;\r
\r
const dustVertex = \`#version 300 es\r
precision highp float;\r
\r
in float aIndex;\r
\r
uniform sampler2D tHome;\r
uniform sampler2D tSeed;\r
uniform sampler2D tOffset;\r
uniform float uStirred;\r
uniform vec2 uCenter;\r
uniform vec2 uViewport;\r
uniform float uRadius;\r
uniform float uDpr;\r
uniform float uDepth;\r
uniform float uTwinkle;\r
uniform float uPointScale;\r
uniform float uReveal;\r
uniform float uEncode;\r
uniform vec3 uTones[5];\r
uniform vec3 uRimTone;\r
\r
out vec3 vColor;\r
out float vSize;\r
\${hashChunk}\r
\${dustChunk}\r
void main() {\r
  ivec2 cell = ivec2(int(mod(aIndex, \${STATE_WIDTH}.0)), int(floor(aIndex / \${STATE_WIDTH}.0)));\r
  uint id = uint(aIndex);\r
  vec4 home = texelFetch(tHome, cell, 0);\r
  vec4 seed = texelFetch(tSeed, cell, 0);\r
  float life;\r
  float spread;\r
  vec3 p = drift(home, seed, id, life, spread);\r
  if (uStirred > 0.5) p += texelFetch(tOffset, cell, 0).xyz;\r
  float len = length(p);\r
  float inside = 1.0 - smoothstep(0.955, 0.985, length(p.xy));\r
  if (len > 0.975) p *= 0.975 / len;\r
\r
  float front = p.z * 0.5 + 0.5;\r
  float depthSize = mix(1.0, 0.7 + 0.6 * front, uDepth);\r
  float depthLight = mix(1.0, 0.35 + 0.8 * front, uDepth);\r
  float blink = sin(uDustTime * (2.0 + 6.0 * random(id * 7u + 5u)) + random(id * 7u + 6u) * 6.2831853);\r
  float twinkle = mix(1.0, smoothstep(-0.9, -0.6, blink), uTwinkle);\r
  float fade = smoothstep(0.04, 0.12, life);\r
  float order = (home.y + 1.0) * 0.5 * 0.55 + random(id * 7u + 8u) * 0.25;\r
  float reveal = smoothstep(order, order + 0.2, uReveal * 1.0);\r
  float alpha = random(id * 7u + 9u) < 0.5 || home.w > 3.5 ? 1.0 : 0.6;\r
\r
  float size = seed.x * uPointScale * (0.35 + 0.95 * life) * depthSize * mix(0.5, 1.0, reveal);\r
  vec2 screen = uCenter + p.xy * uRadius;\r
  gl_Position = vec4(screen / uViewport * 2.0 - 1.0, 0.0, 1.0);\r
  float px = size * uDpr;\r
  gl_PointSize = px + 2.0;\r
  vSize = px;\r
\r
  int tone = int(home.w + 0.5);\r
  float rimLit = smoothstep(0.8, 0.97, length(p.xy));\r
  vec3 color = uTones[tone] + uRimTone * rimLit * rimLit * 0.12;\r
  vColor = color * alpha * fade * twinkle * depthLight * reveal * inside * sqrt(spread) * uEncode;\r
}\r
\`;\r
\r
const dustFragment = \`#version 300 es\r
precision highp float;\r
\r
uniform float uShape;\r
\r
in vec3 vColor;\r
in float vSize;\r
\r
out vec4 fragColor;\r
\r
void main() {\r
  vec2 q = (gl_PointCoord - 0.5) * (vSize + 2.0);\r
  float half_ = max(vSize * 0.5, 0.5);\r
  float cover;\r
  if (uShape < 0.5) {\r
    vec2 c = clamp(half_ - abs(q) + 0.5, 0.0, 1.0);\r
    cover = c.x * c.y;\r
  } else {\r
    cover = clamp(half_ - length(q) + 0.5, 0.0, 1.0);\r
  }\r
  if (cover <= 0.0) discard;\r
  fragColor = vec4(vColor * cover, 0.0);\r
}\r
\`;\r
\r
const stirFragment = \`#version 300 es\r
precision highp float;\r
\r
uniform sampler2D tHome;\r
uniform sampler2D tSeed;\r
uniform sampler2D tOffset;\r
uniform sampler2D tVelocity;\r
uniform float uDt;\r
uniform float uReset;\r
uniform vec4 uBrush;\r
uniform float uBrushPower;\r
uniform vec4 uKick;\r
\r
layout(location = 0) out vec4 outOffset;\r
layout(location = 1) out vec4 outVelocity;\r
\${hashChunk}\r
\${dustChunk}\r
vec3 swirl(vec3 p) {\r
  float t = uDustTime * 0.15;\r
  vec3 a = vec3(1.7, 1.9, 1.5) * p.yzx + vec3(t, 1.2, 2.1);\r
  vec3 b = vec3(2.3, 2.1, 2.7) * p.zxy + vec3(0.4, t * 1.3, 0.9);\r
  vec3 ca = cos(a) * vec3(1.7, 1.9, 1.5);\r
  vec3 cb = cos(b) * vec3(2.3, 2.1, 2.7);\r
  return vec3(ca.z - cb.x, cb.y - ca.x, ca.y - cb.z);\r
}\r
\r
void main() {\r
  ivec2 cell = ivec2(gl_FragCoord.xy);\r
  if (uReset > 0.5) {\r
    outOffset = vec4(0.0);\r
    outVelocity = vec4(0.0);\r
    return;\r
  }\r
  uint id = uint(cell.y * \${STATE_WIDTH} + cell.x);\r
  vec4 home = texelFetch(tHome, cell, 0);\r
  vec4 seed = texelFetch(tSeed, cell, 0);\r
  vec3 o = texelFetch(tOffset, cell, 0).xyz;\r
  vec3 v = texelFetch(tVelocity, cell, 0).xyz;\r
  float life;\r
  float spread;\r
  vec3 base = drift(home, seed, id, life, spread);\r
  vec3 p = base + o;\r
\r
  float k = mix(0.8, 2.2, random(id * 7u + 11u));\r
  vec3 acc = -k * o - 1.5 * sqrt(k) * v;\r
\r
  vec2 gap = p.xy - uBrush.xy;\r
  float touch = exp(-dot(gap, gap) / 0.07) * uBrushPower;\r
  acc += (vec3(uBrush.zw, 0.0) - v) * touch * 14.0;\r
  float pace = length(v);\r
  if (pace > 1e-4) {\r
    vec3 heading = v / pace;\r
    vec3 curl = swirl(p * 1.6);\r
    acc += (curl - heading * dot(curl, heading)) * min(pace, 2.0) * 1.8;\r
  }\r
\r
  if (uKick.z > 0.0) {\r
    vec3 jolt = vec3(random(id * 7u + 12u), random(id * 7u + 13u), random(id * 7u + 14u)) - 0.5;\r
    float near = exp(-dot(p.xy - uKick.xy, p.xy - uKick.xy) / 0.4);\r
    vec3 spinKick = vec3(-p.z, 0.0, p.x) * 0.9;\r
    vec3 lift = vec3(0.0, 0.5 + 0.8 * random(id * 7u + 15u), 0.0) * (0.3 + 0.7 * smoothstep(0.2, -0.8, p.y));\r
    v += (jolt * 0.8 + spinKick + lift) * uKick.z * (0.4 + 0.45 * near);\r
  }\r
\r
  v += acc * uDt;\r
  o += v * uDt;\r
  vec3 q = base + o;\r
  float len = length(q);\r
  if (len > 0.97) {\r
    vec3 n = q / len;\r
    o -= n * (len - 0.97);\r
    v -= n * max(dot(v, n), 0.0) * 1.5;\r
  }\r
  outOffset = vec4(o, 1.0);\r
  outVelocity = vec4(v, 1.0);\r
}\r
\`;\r
\r
const compositeFragment = \`#version 300 es\r
precision highp float;\r
\r
uniform sampler2D tScene;\r
uniform float uLight;\r
uniform float uDecode;\r
\r
in vec2 vUv;\r
out vec4 fragColor;\r
\r
vec3 soften(vec3 x) {\r
  vec3 over = max(x - 0.6, 0.0);\r
  return min(x, 0.6) + 0.4 * (1.0 - exp(-over / 0.4));\r
}\r
\r
void main() {\r
  vec4 scene = texture(tScene, vUv) * uDecode;\r
  vec3 light = max(scene.rgb, 0.0);\r
  float peak = max(light.r, max(light.g, light.b));\r
  if (uLight > 0.5) {\r
    vec3 hue = light / max(peak, 1e-4);\r
    float cover = 1.0 - exp(-peak * 2.4);\r
    vec3 ink = hue * mix(0.92, 0.72, cover);\r
    float core = clamp(scene.a * 0.7, 0.0, 1.0) * cover;\r
    vec3 tint = mix(vec3(1.0), hue, 0.22);\r
    fragColor = vec4(tint * core + ink * cover * (1.0 - core), core + cover * (1.0 - core));\r
    return;\r
  }\r
  light += vec3(max(peak - 1.8, 0.0) * 0.25);\r
  vec3 shown = soften(light);\r
  fragColor = vec4(shown, max(shown.r, max(shown.g, shown.b)));\r
}\r
\`;\r
\r
const CrystalizedBall = ({\r
  preset = 'plasma',\r
  color,\r
  theme = 'dark',\r
  size = 0.7,\r
  strands,\r
  crackle,\r
  flares,\r
  glow,\r
  sparks,\r
  particleCount,\r
  fill,\r
  motion,\r
  particleShape,\r
  depth,\r
  sway,\r
  twinkle,\r
  haze,\r
  speed = 1,\r
  dustSpeed,\r
  interactive = true,\r
  hoverStrength = 0.7,\r
  intro = true,\r
  paused = false,\r
  className = '',\r
  style\r
}: CrystalizedBallProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const settingsRef = useRef<Settings | null>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
\r
  const base = BALL_PRESETS[preset] || BALL_PRESETS.plasma;\r
  const pick = <K extends keyof PresetValues>(value: PresetValues[K] | undefined, key: K): PresetValues[K] =>\r
    value === undefined || value === null ? base[key] : value;\r
  const tint = pick(color, 'color');\r
\r
  const colors = useMemo(() => {\r
    const light = theme === 'light';\r
    return { light, palette: buildPalette(parseColor(tint, [0.95, 0.36, 0.82]), light) };\r
  }, [tint, theme]);\r
\r
  useEffect(() => {\r
    settingsRef.current = {\r
      ...colors,\r
      size,\r
      strands: pick(strands, 'strands'),\r
      crackle: pick(crackle, 'crackle'),\r
      flares: pick(flares, 'flares'),\r
      glow: pick(glow, 'glow'),\r
      sparks: pick(sparks, 'sparks'),\r
      particleCount: pick(particleCount, 'particleCount'),\r
      fill: pick(fill, 'fill'),\r
      motion: pick(motion, 'motion'),\r
      particleShape: pick(particleShape, 'particleShape'),\r
      depth: pick(depth, 'depth'),\r
      sway: pick(sway, 'sway'),\r
      twinkle: pick(twinkle, 'twinkle'),\r
      haze: pick(haze, 'haze'),\r
      dustSpeed: pick(dustSpeed, 'dustSpeed'),\r
      speed,\r
      interactive,\r
      hoverStrength,\r
      intro,\r
      paused\r
    };\r
    wakeRef.current?.();\r
  });\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    if (!container) return undefined;\r
\r
    const renderer = new Renderer({ alpha: true, premultipliedAlpha: true, antialias: false, depth: false });\r
    const gl = renderer.gl;\r
    const gl2 = gl as unknown as WebGL2RenderingContext;\r
    if (!renderer.isWebgl2) {\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
      return undefined;\r
    }\r
    const canvas = gl.canvas;\r
    canvas.style.display = 'block';\r
    canvas.style.width = '100%';\r
    canvas.style.height = '100%';\r
    canvas.setAttribute('aria-hidden', 'true');\r
    container.appendChild(canvas);\r
\r
    const fullFloat = !!gl.getExtension('EXT_color_buffer_float');\r
    const halfFloat = fullFloat || !!gl.getExtension('EXT_color_buffer_half_float');\r
    const encode = halfFloat ? 1 : 0.25;\r
    const geometry = new Triangle(gl);\r
    const blank = new Texture(gl);\r
    const strandData = buildStrands();\r
\r
    const sceneTarget = new RenderTarget(gl, {\r
      width: 1,\r
      height: 1,\r
      depth: false,\r
      type: halfFloat ? gl2.HALF_FLOAT : gl.UNSIGNED_BYTE,\r
      format: gl.RGBA,\r
      internalFormat: halfFloat ? gl2.RGBA16F : gl.RGBA,\r
      minFilter: gl.NEAREST,\r
      magFilter: gl.NEAREST\r
    });\r
\r
    const arcData = new Array(MAX_ARCS * 4).fill(0);\r
    const fieldUniforms = {\r
      uCenter: { value: [0, 0] },\r
      uRadius: { value: 1 },\r
      uDpr: { value: 1 },\r
      uLine: { value: 0.6 },\r
      uTime: { value: 0 },\r
      uFrame: { value: 0 },\r
      uBins: { value: 420 },\r
      uStrands: { value: 5 },\r
      uCrackle: { value: 0.6 },\r
      uFlares: { value: 0.5 },\r
      uGlow: { value: 0.8 },\r
      uHaze: { value: 0.7 },\r
      uFill: { value: 0.5 },\r
      uPresence: { value: 0 },\r
      uUnfold: { value: 0 },\r
      uBloom: { value: 0 },\r
      uInside: { value: 0 },\r
      uEncode: { value: encode },\r
      uRim: { value: [1, 1, 1] },\r
      uRimHot: { value: [1, 1, 1] },\r
      uRimMid: { value: [1, 1, 1] },\r
      uRimDeep: { value: [1, 1, 1] },\r
      uSpark: { value: [1, 1, 1] },\r
      uSparkGlow: { value: [1, 1, 1] },\r
      uHazeColor: { value: [0, 0, 0] },\r
      uEdgeColor: { value: [0, 0, 0] },\r
      uHeat: { value: [0, 0, 0, 0] },\r
      uHarmonics: { value: strandData.harmonics },\r
      uRates: { value: strandData.rates },\r
      uPhases: { value: strandData.phases },\r
      uFlareHarmonics: { value: strandData.flareHarmonics },\r
      uFlareRates: { value: strandData.flareRates },\r
      uFlarePhases: { value: strandData.flarePhases },\r
      uArcs: { value: arcData }\r
    };\r
\r
    const dustShared = {\r
      uDustTime: { value: 0 },\r
      uTurn: { value: [0, 0] },\r
      uMotion: { value: 0 },\r
      uFill: fieldUniforms.uFill,\r
      tHome: { value: blank },\r
      tSeed: { value: blank }\r
    };\r
\r
    const dustUniforms = {\r
      ...dustShared,\r
      tOffset: { value: blank },\r
      uStirred: { value: 0 },\r
      uCenter: fieldUniforms.uCenter,\r
      uViewport: { value: [1, 1] },\r
      uRadius: fieldUniforms.uRadius,\r
      uDpr: fieldUniforms.uDpr,\r
      uDepth: { value: 0.6 },\r
      uTwinkle: { value: 0.5 },\r
      uPointScale: { value: 1 },\r
      uReveal: { value: 0 },\r
      uEncode: { value: encode },\r
      uTones: { value: new Array(15).fill(1) },\r
      uRimTone: { value: [1, 1, 1] },\r
      uShape: { value: 0 }\r
    };\r
\r
    const stirUniforms = {\r
      ...dustShared,\r
      tOffset: { value: blank },\r
      tVelocity: { value: blank },\r
      uDt: { value: 0.016 },\r
      uReset: { value: 1 },\r
      uBrush: { value: [0, 0, 0, 0] },\r
      uBrushPower: { value: 0 },\r
      uKick: { value: [0, 0, 0, 0] }\r
    };\r
\r
    const compositeUniforms = {\r
      tScene: { value: sceneTarget.texture },\r
      uLight: { value: 0 },\r
      uDecode: { value: 1 / encode }\r
    };\r
\r
    const additive = (program: Program) => {\r
      program.setBlendFunc(gl.ONE, gl.ONE);\r
      return program;\r
    };\r
\r
    const fieldMesh = new Mesh(gl, {\r
      geometry,\r
      program: additive(\r
        new Program(gl, {\r
          vertex: passVertex,\r
          fragment: fieldFragment,\r
          uniforms: fieldUniforms,\r
          transparent: true,\r
          depthTest: false,\r
          depthWrite: false\r
        })\r
      )\r
    });\r
    const dustProgram = additive(\r
      new Program(gl, {\r
        vertex: dustVertex,\r
        fragment: dustFragment,\r
        uniforms: dustUniforms,\r
        transparent: true,\r
        depthTest: false,\r
        depthWrite: false\r
      })\r
    );\r
    const stirMesh = halfFloat\r
      ? new Mesh(gl, {\r
          geometry,\r
          program: new Program(gl, {\r
            vertex: passVertex,\r
            fragment: stirFragment,\r
            uniforms: stirUniforms,\r
            depthTest: false,\r
            depthWrite: false\r
          })\r
        })\r
      : null;\r
    const compositeMesh = new Mesh(gl, {\r
      geometry,\r
      program: new Program(gl, {\r
        vertex: passVertex,\r
        fragment: compositeFragment,\r
        uniforms: compositeUniforms,\r
        depthTest: false,\r
        depthWrite: false\r
      })\r
    });\r
\r
    const disposeTarget = (target: RenderTarget | null) => {\r
      if (!target) return;\r
      gl.deleteFramebuffer(target.buffer);\r
      target.textures.forEach(texture => gl.deleteTexture(texture.texture));\r
    };\r
\r
    const stateTarget = (rows: number) =>\r
      new RenderTarget(gl, {\r
        width: STATE_WIDTH,\r
        height: rows,\r
        color: 2,\r
        depth: false,\r
        type: fullFloat ? gl.FLOAT : gl2.HALF_FLOAT,\r
        format: gl.RGBA,\r
        internalFormat: fullFloat ? gl2.RGBA32F : gl2.RGBA16F,\r
        minFilter: gl.NEAREST,\r
        magFilter: gl.NEAREST\r
      });\r
\r
    const dataTexture = (data: Float32Array, rows: number) =>\r
      new Texture(gl, {\r
        image: data,\r
        width: STATE_WIDTH,\r
        height: rows,\r
        type: gl.FLOAT,\r
        format: gl.RGBA,\r
        internalFormat: gl2.RGBA32F,\r
        minFilter: gl.NEAREST,\r
        magFilter: gl.NEAREST,\r
        generateMipmaps: false,\r
        flipY: false\r
      });\r
\r
    let dust: DustLayer | null = null;\r
\r
    const disposeDust = () => {\r
      if (!dust) return;\r
      dust.mesh.geometry.remove();\r
      gl.deleteTexture(dust.home.texture);\r
      gl.deleteTexture(dust.seed.texture);\r
      disposeTarget(dust.read);\r
      disposeTarget(dust.write);\r
      dust = null;\r
    };\r
\r
    const resetStir = () => {\r
      if (!stirMesh || !dust || !dust.read || !dust.write) return;\r
      stirUniforms.tOffset.value = blank;\r
      stirUniforms.tVelocity.value = blank;\r
      stirUniforms.uReset.value = 1;\r
      renderer.render({ scene: stirMesh, target: dust.read, clear: false });\r
      renderer.render({ scene: stirMesh, target: dust.write, clear: false });\r
      stirUniforms.uReset.value = 0;\r
    };\r
\r
    const rebuildDust = (requested: number) => {\r
      const total = clamp(Math.round(requested / 100) * 100, 0, MAX_PARTICLES);\r
      if (dust && dust.requested === total) return;\r
      disposeDust();\r
      if (!total) {\r
        dust = null;\r
        return;\r
      }\r
      const data = buildDust(total);\r
      const indices = new Float32Array(data.count);\r
      for (let i = 0; i < data.count; i++) indices[i] = i;\r
      const points = new Geometry(gl, { aIndex: { size: 1, data: indices } });\r
      dust = {\r
        requested: total,\r
        rows: data.rows,\r
        home: dataTexture(data.home, data.rows),\r
        seed: dataTexture(data.seed, data.rows),\r
        mesh: new Mesh(gl, { mode: gl.POINTS, geometry: points, program: dustProgram }),\r
        read: stirMesh ? stateTarget(data.rows) : null,\r
        write: stirMesh ? stateTarget(data.rows) : null\r
      };\r
      dustShared.tHome.value = dust.home;\r
      dustShared.tSeed.value = dust.seed;\r
      resetStir();\r
      stirring = 0;\r
    };\r
\r
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const random = seeded(913);\r
\r
    let width = 1;\r
    let height = 1;\r
    let raf = 0;\r
    let last = performance.now();\r
    let rimTime = 0;\r
    let dustTime = 0;\r
    let swayClock = 0;\r
    let introClock = 0;\r
    let visible = true;\r
    let alive = true;\r
    let surge = 0;\r
    let stirring = 0;\r
    let stirEnergy = 0;\r
    let kick: { x: number; y: number; strength: number } | null = null;\r
    let nextArc = 0.3;\r
    const arcs: Arc[] = [];\r
    const pointer = { x: 0, y: 0, inside: false, fresh: true };\r
    const heat = { angle: 0, velocity: 0, power: 0, near: 0 };\r
    const brush = { x: 0, y: 0, vx: 0, vy: 0 };\r
    const look = { x: 0, y: 0, vx: 0, vy: 0 };\r
\r
    const resize = () => {\r
      width = Math.max(1, container.clientWidth);\r
      height = Math.max(1, container.clientHeight);\r
      renderer.dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(PIXEL_BUDGET / (width * height)));\r
      renderer.setSize(width, height);\r
      sceneTarget.setSize(gl.canvas.width, gl.canvas.height);\r
      start();\r
    };\r
\r
    const spawnArc = (angle: number, strength: number) => {\r
      if (arcs.length >= MAX_ARCS) return;\r
      arcs.push({\r
        start: angle,\r
        span: (0.05 + random() * 0.07) * (random() < 0.5 ? -1 : 1),\r
        curl: 0.02 + random() * 0.04,\r
        life: 0,\r
        duration: 0.2 + random() * 0.2,\r
        drift: (random() - 0.5) * 0.3,\r
        strength\r
      });\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!alive) return;\r
      const s = settingsRef.current;\r
      const dt = Math.min(0.05, Math.max(1 / 240, (now - last) / 1000));\r
      last = now;\r
      if (!s) return;\r
\r
      const moving = !s.paused && !reducedMotion;\r
      introClock = s.intro && !reducedMotion ? Math.min(1, introClock + dt / INTRO_SECONDS) : 1;\r
      const presence = easeOut(smooth(0, 0.42, introClock));\r
      const unfold = easeOut(smooth(0, 0.32, introClock));\r
      const charge = Math.sin(Math.PI * smooth(0.22, 0.78, introClock)) * 0.35;\r
      const radius = Math.max(8, (clamp(s.size, 0.1, 1.5) * Math.min(width, height)) / 2);\r
\r
      const strength = s.interactive && !reducedMotion ? clamp(s.hoverStrength, 0, 1) : 0;\r
      const px = pointer.x - width / 2;\r
      const py = height / 2 - pointer.y;\r
      const reach = Math.hypot(px, py);\r
      const target = pointer.inside ? strength : 0;\r
      if (heat.power < 0.02) {\r
        heat.angle = Math.atan2(py, px);\r
        heat.velocity = 0;\r
      }\r
      const turn = wrapAngle(Math.atan2(py, px) - heat.angle);\r
      heat.velocity += (120 * turn - 19 * heat.velocity) * dt;\r
      heat.angle = wrapAngle(heat.angle + heat.velocity * dt);\r
      heat.power += (target - heat.power) * (1 - Math.exp(-dt / (target > heat.power ? 0.3 : 0.55)));\r
      const nearTarget = Math.exp(-Math.pow((reach - radius) / (radius * 0.45), 2));\r
      heat.near += (nearTarget - heat.near) * (1 - Math.exp(-dt / 0.15));\r
      surge *= Math.exp(-dt / 0.7);\r
\r
      const bx = px / radius;\r
      const by = py / radius;\r
      if (Math.hypot(bx - brush.x, by - brush.y) > 0.6) pointer.fresh = true;\r
      if (pointer.fresh) {\r
        brush.x = bx;\r
        brush.y = by;\r
        brush.vx = 0;\r
        brush.vy = 0;\r
        pointer.fresh = false;\r
      }\r
      const follow = 1 - Math.exp(-dt / 0.05);\r
      brush.vx += ((bx - brush.x) / dt - brush.vx) * follow;\r
      brush.vy += ((by - brush.y) / dt - brush.vy) * follow;\r
      brush.x = bx;\r
      brush.y = by;\r
      const brushSpeed = Math.hypot(brush.vx, brush.vy);\r
      const cap = brushSpeed > 4 ? 4 / brushSpeed : 1;\r
      const inBall = Math.exp(-Math.max(0, Math.hypot(bx, by) - 1) * 6);\r
      const brushPower = pointer.inside ? strength * inBall * presence : 0;\r
      stirEnergy = stirEnergy * Math.exp(-dt / 1.2) + brushPower * Math.min(brushSpeed, 4) * dt;\r
\r
      if (moving) {\r
        const pace = 1 + surge * 0.6 + heat.power * heat.near * 0.3;\r
        const step = dt * Math.max(0, s.speed) * 2 * pace;\r
        rimTime += step;\r
        dustTime += dt * Math.max(0, s.dustSpeed) * (1 + surge * 0.4);\r
        swayClock += dt * Math.max(0, s.dustSpeed);\r
        const crackleNow = clamp(s.crackle + surge * 0.5, 0, 1.5);\r
        if (s.sparks > 0.01 && introClock > 0.55) {\r
          nextArc -= step * s.sparks * 2 * (0.6 + crackleNow * 0.6);\r
          if (nextArc <= 0) {\r
            const local = heat.power * heat.near;\r
            const angle =\r
              random() < local * 0.7\r
                ? heat.angle + (random() - 0.5) * 0.8\r
                : random() < 0.7\r
                  ? Math.PI / 2 + (random() - 0.5) * 1.5\r
                  : random() * Math.PI * 2;\r
            spawnArc(angle, 0.8 + local * 0.6 + surge * 0.4);\r
            nextArc = 0.15 + random() * 0.6;\r
          }\r
        }\r
        for (let i = arcs.length - 1; i >= 0; i--) {\r
          const arc = arcs[i];\r
          arc.life += step;\r
          arc.start += arc.drift * step;\r
          if (arc.life >= arc.duration) arcs.splice(i, 1);\r
        }\r
      } else {\r
        arcs.length = 0;\r
      }\r
      for (let i = 0; i < MAX_ARCS; i++) {\r
        const arc = arcs[i];\r
        arcData[i * 4] = arc ? arc.start : 0;\r
        arcData[i * 4 + 1] = arc ? arc.span : 0;\r
        arcData[i * 4 + 2] = arc ? arc.curl : 0;\r
        arcData[i * 4 + 3] = arc ? Math.sin((Math.PI * arc.life) / arc.duration) * arc.strength : 0;\r
      }\r
\r
      rebuildDust(s.particleCount);\r
      const palette = s.palette;\r
\r
      fieldUniforms.uCenter.value = [width / 2, height / 2];\r
      fieldUniforms.uRadius.value = radius;\r
      fieldUniforms.uDpr.value = renderer.dpr;\r
      fieldUniforms.uLine.value = Math.max(0.6, radius * 0.0035);\r
      fieldUniforms.uTime.value = rimTime;\r
      fieldUniforms.uFrame.value = Math.floor(rimTime * 24) % 100000;\r
      fieldUniforms.uBins.value = clamp(Math.round((Math.PI * 2 * radius) / 2.6), 240, 900);\r
      fieldUniforms.uStrands.value = Math.round(clamp(s.strands, 1, MAX_STRANDS));\r
      fieldUniforms.uCrackle.value = clamp(s.crackle, 0, 1) + surge * 0.5 + charge;\r
      fieldUniforms.uFlares.value = clamp(s.flares, 0, 1);\r
      fieldUniforms.uGlow.value = clamp(s.glow, 0, 2) * (1 + surge * 0.5 + charge) * (s.light ? 0.35 : 1);\r
      fieldUniforms.uHaze.value = clamp(s.haze, 0, 2) * (s.light ? 0.6 : 1);\r
      fieldUniforms.uFill.value = clamp(s.fill, 0, 1);\r
      fieldUniforms.uPresence.value = presence;\r
      fieldUniforms.uUnfold.value = unfold;\r
      fieldUniforms.uBloom.value = presence * presence;\r
      fieldUniforms.uInside.value = smooth(0.2, 0.95, introClock);\r
      fieldUniforms.uRim.value = palette.rim;\r
      fieldUniforms.uRimHot.value = palette.rimHot;\r
      fieldUniforms.uRimMid.value = palette.rimMid;\r
      fieldUniforms.uRimDeep.value = palette.rimDeep;\r
      fieldUniforms.uSpark.value = palette.spark;\r
      fieldUniforms.uSparkGlow.value = palette.sparkGlow;\r
      fieldUniforms.uHazeColor.value = palette.haze;\r
      fieldUniforms.uEdgeColor.value = palette.edge;\r
      fieldUniforms.uHeat.value = [heat.angle, heat.near, heat.power * presence, 0];\r
\r
      dustShared.uDustTime.value = dustTime;\r
      const gaze = pointer.inside ? strength * presence : 0;\r
      const lookX = clamp(bx, -1.6, 1.6) * gaze;\r
      const lookY = clamp(by, -1.6, 1.6) * gaze;\r
      look.vx += (40 * (lookX - look.x) - 11 * look.vx) * dt;\r
      look.vy += (40 * (lookY - look.y) - 11 * look.vy) * dt;\r
      look.x += look.vx * dt;\r
      look.y += look.vy * dt;\r
      const swing = clamp(s.sway, 0, 1);\r
      dustShared.uTurn.value = [\r
        swing * 0.42 * Math.sin(swayClock * 0.23) + look.x * 0.3,\r
        swing * 0.12 * Math.sin(swayClock * 0.17 + 1.3) - look.y * 0.16\r
      ];\r
      dustShared.uMotion.value = MOTIONS[s.motion] ?? 0;\r
      dustUniforms.uViewport.value = [width, height];\r
      dustUniforms.uDepth.value = clamp(s.depth, 0, 1);\r
      dustUniforms.uTwinkle.value = clamp(s.twinkle, 0, 1);\r
      dustUniforms.uPointScale.value = Math.max(1, radius / 491);\r
      dustUniforms.uReveal.value = smooth(0.18, 1, introClock);\r
      dustUniforms.uTones.value = palette.tones.flat();\r
      dustUniforms.uRimTone.value = palette.rim;\r
      dustUniforms.uShape.value = SHAPES[s.particleShape] ?? 0;\r
\r
      const layer = dust;\r
      if (layer && stirMesh && (stirEnergy > 0.002 || kick)) stirring = SETTLE_SECONDS;\r
      let stirred = false;\r
      if (layer && layer.read && layer.write && stirMesh && stirring > 0) {\r
        stirUniforms.uDt.value = Math.min(dt, 1 / 30);\r
        stirUniforms.uBrush.value = [brush.x, brush.y, brush.vx * cap, brush.vy * cap];\r
        stirUniforms.uBrushPower.value = brushPower;\r
        stirUniforms.uKick.value = kick ? [kick.x, kick.y, kick.strength, 0] : [0, 0, 0, 0];\r
        stirUniforms.tOffset.value = layer.read.textures[0];\r
        stirUniforms.tVelocity.value = layer.read.textures[1];\r
        renderer.render({ scene: stirMesh, target: layer.write, clear: false });\r
        const swap = layer.read;\r
        layer.read = layer.write;\r
        layer.write = swap;\r
        stirring -= dt;\r
        stirred = stirring > 0;\r
        if (!stirred) {\r
          stirring = 0;\r
          resetStir();\r
        }\r
      }\r
      kick = null;\r
      dustUniforms.uStirred.value = stirred ? 1 : 0;\r
      dustUniforms.tOffset.value = layer && layer.read ? layer.read.textures[0] : blank;\r
\r
      gl.clearColor(0, 0, 0, 0);\r
      renderer.render({ scene: fieldMesh, target: sceneTarget, clear: true });\r
      if (dust) renderer.render({ scene: dust.mesh, target: sceneTarget, clear: false });\r
\r
      compositeUniforms.uLight.value = s.light ? 1 : 0;\r
      renderer.render({ scene: compositeMesh, clear: false });\r
\r
      const settling =\r
        Math.abs(target - heat.power) > 0.002 ||\r
        surge > 0.002 ||\r
        stirring > 0 ||\r
        Math.abs(heat.velocity) > 0.01 ||\r
        Math.hypot(look.vx, look.vy, look.x - lookX, look.y - lookY) > 0.001;\r
      if (visible && (moving || introClock < 1 || settling)) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const start = () => {\r
      if (raf || !visible || !alive) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const locate = (e: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = e.clientX - rect.left;\r
      const y = e.clientY - rect.top;\r
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };\r
    };\r
\r
    const onPointerMove = (e: PointerEvent) => {\r
      const spot = locate(e);\r
      if (spot.inside && !pointer.inside) pointer.fresh = true;\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = spot.inside;\r
      if (spot.inside) start();\r
    };\r
\r
    const onPointerDown = (e: PointerEvent) => {\r
      const s = settingsRef.current;\r
      const spot = locate(e);\r
      if (!s || !s.interactive || reducedMotion || !spot.inside) return;\r
      if (!pointer.inside) pointer.fresh = true;\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = true;\r
      const radius = Math.max(8, (clamp(s.size, 0.1, 1.5) * Math.min(width, height)) / 2);\r
      const kx = (spot.x - width / 2) / radius;\r
      const ky = (height / 2 - spot.y) / radius;\r
      const distance = Math.hypot(kx, ky);\r
      if (distance > 1.3) return;\r
      const strength = clamp(s.hoverStrength, 0, 1);\r
      kick = { x: kx, y: ky, strength: strength * 1.2 };\r
      surge = Math.max(surge, strength);\r
      const angle = Math.atan2(ky, kx);\r
      spawnArc(angle + (random() - 0.5) * 0.5, 1.3);\r
      spawnArc(angle + Math.PI + (random() - 0.5) * 1.2, 1.1);\r
      start();\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      start();\r
    };\r
\r
    const onPointerOut = (e: PointerEvent) => {\r
      if (!e.relatedTarget) onPointerLeave();\r
    };\r
\r
    const onPointerUp = (e: PointerEvent) => {\r
      if (e.pointerType === 'touch') onPointerLeave();\r
    };\r
\r
    const onVisibility = () => {\r
      if (!document.hidden) start();\r
    };\r
\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    window.addEventListener('pointerout', onPointerOut, { passive: true });\r
    window.addEventListener('pointerup', onPointerUp, { passive: true });\r
    window.addEventListener('blur', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(container);\r
    const intersectionObserver = new IntersectionObserver(([entry]) => {\r
      visible = entry.isIntersecting;\r
      start();\r
    });\r
    intersectionObserver.observe(container);\r
\r
    wakeRef.current = start;\r
    resize();\r
\r
    return () => {\r
      alive = false;\r
      visible = false;\r
      cancelAnimationFrame(raf);\r
      resizeObserver.disconnect();\r
      intersectionObserver.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('pointerout', onPointerOut);\r
      window.removeEventListener('pointerup', onPointerUp);\r
      window.removeEventListener('blur', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      wakeRef.current = null;\r
      disposeDust();\r
      disposeTarget(sceneTarget);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);\r
    };\r
  }, []);\r
\r
  return <div ref={containerRef} className={\`crystalized-ball \${className}\`.trim()} style={style} />;\r
};\r
\r
export default CrystalizedBall;\r
`,a=`'use client';\r
\r
import { useEffect, useMemo, useRef } from 'react';\r
import type { CSSProperties } from 'react';\r
import { Renderer, Program, Mesh, Triangle, Geometry, RenderTarget, Texture } from 'ogl';\r
\r
type Preset = 'plasma' | 'aurora' | 'nebula' | 'ember' | 'frost' | 'solar' | 'eclipse' | 'abyss';\r
type Motion = 'rise' | 'fall' | 'drift' | 'orbit';\r
type ParticleShape = 'square' | 'round';\r
type Theme = 'dark' | 'light';\r
type Rgb = [number, number, number];\r
\r
interface PresetValues {\r
  color: string;\r
  strands: number;\r
  crackle: number;\r
  flares: number;\r
  glow: number;\r
  sparks: number;\r
  particleCount: number;\r
  fill: number;\r
  motion: Motion;\r
  particleShape: ParticleShape;\r
  depth: number;\r
  sway: number;\r
  twinkle: number;\r
  haze: number;\r
  dustSpeed: number;\r
}\r
\r
export interface CrystalizedBallProps extends Partial<PresetValues> {\r
  preset?: Preset;\r
  theme?: Theme;\r
  size?: number;\r
  speed?: number;\r
  interactive?: boolean;\r
  hoverStrength?: number;\r
  intro?: boolean;\r
  paused?: boolean;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Palette {\r
  rim: Rgb;\r
  rimHot: Rgb;\r
  rimMid: Rgb;\r
  rimDeep: Rgb;\r
  spark: Rgb;\r
  sparkGlow: Rgb;\r
  haze: Rgb;\r
  edge: Rgb;\r
  tones: Rgb[];\r
}\r
\r
interface Settings extends Omit<PresetValues, 'color'> {\r
  light: boolean;\r
  palette: Palette;\r
  size: number;\r
  speed: number;\r
  interactive: boolean;\r
  hoverStrength: number;\r
  intro: boolean;\r
  paused: boolean;\r
}\r
\r
interface StrandData {\r
  harmonics: number[];\r
  rates: number[];\r
  phases: number[];\r
  flareHarmonics: number[];\r
  flareRates: number[];\r
  flarePhases: number[];\r
}\r
\r
interface Arc {\r
  start: number;\r
  span: number;\r
  curl: number;\r
  life: number;\r
  duration: number;\r
  drift: number;\r
  strength: number;\r
}\r
\r
interface DustLayer {\r
  requested: number;\r
  rows: number;\r
  home: Texture;\r
  seed: Texture;\r
  mesh: Mesh;\r
  read: RenderTarget | null;\r
  write: RenderTarget | null;\r
}\r
\r
const BALL_PRESETS: Record<Preset, PresetValues> = {\r
  plasma: {\r
    color: '#F25BD0',\r
    strands: 6,\r
    crackle: 0.85,\r
    flares: 0.65,\r
    glow: 0.9,\r
    sparks: 0.6,\r
    particleCount: 15000,\r
    fill: 0.5,\r
    motion: 'rise',\r
    particleShape: 'square',\r
    depth: 0.6,\r
    sway: 0.5,\r
    twinkle: 0.5,\r
    haze: 0.7,\r
    dustSpeed: 1\r
  },\r
  aurora: {\r
    color: '#5CFFC8',\r
    strands: 5,\r
    crackle: 0.6,\r
    flares: 0.5,\r
    glow: 0.8,\r
    sparks: 0.45,\r
    particleCount: 15000,\r
    fill: 0.5,\r
    motion: 'rise',\r
    particleShape: 'square',\r
    depth: 0.6,\r
    sway: 0.5,\r
    twinkle: 0.5,\r
    haze: 0.7,\r
    dustSpeed: 1\r
  },\r
  nebula: {\r
    color: '#9478FF',\r
    strands: 6,\r
    crackle: 1,\r
    flares: 0.5,\r
    glow: 0.9,\r
    sparks: 0.6,\r
    particleCount: 18000,\r
    fill: 0.45,\r
    motion: 'rise',\r
    particleShape: 'square',\r
    depth: 0.5,\r
    sway: 0.4,\r
    twinkle: 0.6,\r
    haze: 0.8,\r
    dustSpeed: 1.2\r
  },\r
  ember: {\r
    color: '#FF8A2A',\r
    strands: 5,\r
    crackle: 0.9,\r
    flares: 0.8,\r
    glow: 1,\r
    sparks: 0.8,\r
    particleCount: 12000,\r
    fill: 0.35,\r
    motion: 'rise',\r
    particleShape: 'round',\r
    depth: 0.7,\r
    sway: 0.3,\r
    twinkle: 0.7,\r
    haze: 0.9,\r
    dustSpeed: 1.6\r
  },\r
  frost: {\r
    color: '#BFE6FF',\r
    strands: 3,\r
    crackle: 0.3,\r
    flares: 0.3,\r
    glow: 0.6,\r
    sparks: 0.2,\r
    particleCount: 16000,\r
    fill: 0.6,\r
    motion: 'fall',\r
    particleShape: 'round',\r
    depth: 0.8,\r
    sway: 0.4,\r
    twinkle: 0.4,\r
    haze: 0.5,\r
    dustSpeed: 0.7\r
  },\r
  solar: {\r
    color: '#FFD36E',\r
    strands: 6,\r
    crackle: 0.7,\r
    flares: 1,\r
    glow: 1.1,\r
    sparks: 0.5,\r
    particleCount: 15000,\r
    fill: 0.55,\r
    motion: 'orbit',\r
    particleShape: 'square',\r
    depth: 0.6,\r
    sway: 0.7,\r
    twinkle: 0.5,\r
    haze: 0.8,\r
    dustSpeed: 1\r
  },\r
  eclipse: {\r
    color: '#FFFFFF',\r
    strands: 4,\r
    crackle: 0.5,\r
    flares: 0.4,\r
    glow: 0.7,\r
    sparks: 0.35,\r
    particleCount: 14000,\r
    fill: 0.5,\r
    motion: 'drift',\r
    particleShape: 'square',\r
    depth: 0.7,\r
    sway: 0.5,\r
    twinkle: 0.5,\r
    haze: 0.5,\r
    dustSpeed: 0.8\r
  },\r
  abyss: {\r
    color: '#3F7BFF',\r
    strands: 5,\r
    crackle: 0.55,\r
    flares: 0.6,\r
    glow: 0.9,\r
    sparks: 0.4,\r
    particleCount: 20000,\r
    fill: 0.8,\r
    motion: 'orbit',\r
    particleShape: 'round',\r
    depth: 0.8,\r
    sway: 0.8,\r
    twinkle: 0.5,\r
    haze: 0.6,\r
    dustSpeed: 0.9\r
  }\r
};\r
\r
const MOTIONS: Record<string, number> = { rise: 0, fall: 1, drift: 2, orbit: 3 };\r
const SHAPES: Record<string, number> = { square: 0, round: 1 };\r
const MAX_STRANDS = 8;\r
const MAX_ARCS = 4;\r
const MAX_PARTICLES = 40000;\r
const STATE_WIDTH = 256;\r
const PIXEL_BUDGET = 4.5e6;\r
const INTRO_SECONDS = 2.2;\r
const SETTLE_SECONDS = 7;\r
const WHITE: Rgb = [1, 1, 1];\r
const BLACK: Rgb = [0, 0, 0];\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);\r
const smooth = (edge0: number, edge1: number, value: number) => {\r
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);\r
  return t * t * (3 - 2 * t);\r
};\r
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);\r
const mixColor = (a: number[], b: number[], t: number): Rgb => a.map((v, i) => v + (b[i] - v) * t) as Rgb;\r
const wrapAngle = (a: number) => a - Math.PI * 2 * Math.floor((a + Math.PI) / (Math.PI * 2));\r
\r
const parseColor = (value: string, fallback: Rgb): Rgb => {\r
  try {\r
    const ctx = document.createElement('canvas').getContext('2d');\r
    if (!ctx) return fallback;\r
    ctx.fillStyle = '#000000';\r
    ctx.fillStyle = value;\r
    const resolved = ctx.fillStyle;\r
    if (resolved.startsWith('#')) {\r
      const n = parseInt(resolved.slice(1), 16);\r
      return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];\r
    }\r
    const parts = resolved.match(/[\\d.]+/g);\r
    if (!parts || parts.length < 3) return fallback;\r
    return [Number(parts[0]) / 255, Number(parts[1]) / 255, Number(parts[2]) / 255];\r
  } catch {\r
    return fallback;\r
  }\r
};\r
\r
const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));\r
const toGamma = (c: number) => (c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);\r
\r
const toOklab = (rgb: number[]): Rgb => {\r
  const [r, g, b] = rgb.map(toLinear);\r
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);\r
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);\r
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);\r
  return [\r
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,\r
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,\r
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s\r
  ];\r
};\r
\r
const fromOklab = ([L, a, b]: number[]): Rgb => {\r
  const l = Math.pow(L + 0.3963377774 * a + 0.2158037573 * b, 3);\r
  const m = Math.pow(L - 0.1055613458 * a - 0.0638541728 * b, 3);\r
  const s = Math.pow(L - 0.0894841775 * a - 1.291485548 * b, 3);\r
  return [\r
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,\r
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,\r
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s\r
  ].map(v => clamp(toGamma(clamp(v, 0, 1)), 0, 1)) as Rgb;\r
};\r
\r
const blend = (a: Rgb, b: Rgb, t: number): Rgb => fromOklab(mixColor(toOklab(a), toOklab(b), t));\r
\r
const shift = (rgb: Rgb, hue: number, lightness: number, chroma: number): Rgb => {\r
  const [L, a, b] = toOklab(rgb);\r
  const c = Math.hypot(a, b) * chroma;\r
  const h = Math.atan2(b, a) + (hue * Math.PI) / 180;\r
  return fromOklab([clamp(L + lightness, 0, 1), c * Math.cos(h), c * Math.sin(h)]);\r
};\r
\r
const withLightness = (rgb: Rgb, hue: number, lightness: number, chroma: number): Rgb => {\r
  const [, a, b] = toOklab(rgb);\r
  const c = Math.max(Math.hypot(a, b) * chroma, 0.02);\r
  const h = Math.atan2(b, a) + (hue * Math.PI) / 180;\r
  return fromOklab([clamp(lightness, 0, 1), c * Math.cos(h), c * Math.sin(h)]);\r
};\r
\r
const buildPalette = (color: Rgb, light: boolean): Palette => {\r
  if (light) {\r
    const ink = withLightness(color, 0, Math.min(toOklab(color)[0], 0.62), 1.15);\r
    return {\r
      rim: ink,\r
      rimHot: ink,\r
      rimMid: ink,\r
      rimDeep: withLightness(color, 0, 0.72, 0.8),\r
      spark: withLightness(color, 0, 0.6, 1.2),\r
      sparkGlow: withLightness(color, 0, 0.78, 0.8),\r
      haze: withLightness(color, 0, 0.8, 0.6),\r
      edge: withLightness(color, 0, 0.72, 0.8),\r
      tones: [\r
        withLightness(color, 0, 0.56, 1.1),\r
        withLightness(color, 16, 0.6, 1.05),\r
        withLightness(color, -16, 0.5, 1.1),\r
        withLightness(color, 0, 0.66, 0.9),\r
        withLightness(color, 0, 0.74, 0.7)\r
      ]\r
    };\r
  }\r
  return {\r
    rim: color,\r
    rimHot: mixColor(color, WHITE, 0.72),\r
    rimMid: mixColor(color, BLACK, 0.15),\r
    rimDeep: mixColor(color, BLACK, 0.45),\r
    spark: mixColor(color, WHITE, 0.45),\r
    sparkGlow: shift(color, 0, -0.15, 1),\r
    haze: mixColor(color, BLACK, 0.6),\r
    edge: shift(color, 0, -0.3, 0.9),\r
    tones: [\r
      shift(color, 0, -0.06, 1),\r
      shift(color, 16, -0.02, 1),\r
      shift(color, -16, -0.12, 1.05),\r
      shift(blend(color, WHITE, 0.25), 0, 0.04, 1),\r
      blend(color, WHITE, 0.7)\r
    ]\r
  };\r
};\r
\r
const seeded = (start: number) => {\r
  let state = start >>> 0;\r
  return () => {\r
    state = (state + 0x6d2b79f5) >>> 0;\r
    let t = state;\r
    t = Math.imul(t ^ (t >>> 15), t | 1);\r
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\r
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\r
  };\r
};\r
\r
const buildStrands = (): StrandData => {\r
  const random = seeded(99);\r
  const bands = [\r
    [6, 12, 0.6, 1.6],\r
    [18, 34, 1.5, 3.5],\r
    [40, 70, 3, 7],\r
    [80, 130, 6, 12]\r
  ];\r
  const data: StrandData = {\r
    harmonics: [],\r
    rates: [],\r
    phases: [],\r
    flareHarmonics: [],\r
    flareRates: [],\r
    flarePhases: []\r
  };\r
  for (let s = 0; s < MAX_STRANDS; s++) {\r
    bands.forEach(([low, high, slow, fast]) => {\r
      data.harmonics.push(Math.round(low + random() * (high - low)));\r
      data.rates.push((slow + random() * (fast - slow)) * (random() < 0.5 ? -1 : 1));\r
      data.phases.push(random() * Math.PI * 2);\r
    });\r
    for (let j = 0; j < 3; j++) {\r
      data.flareHarmonics.push(4 + Math.floor(random() * 6));\r
      data.flareRates.push((0.4 + random() * 0.8) * (random() < 0.5 ? -1 : 1));\r
      data.flarePhases.push(random() * Math.PI * 2);\r
    }\r
    const lead = s === 0;\r
    data.flareHarmonics.push(lead ? 0.75 : 0.95 + random() * 0.3);\r
    data.flareRates.push(lead ? 1.15 : 0.8 + random() * 0.2);\r
    data.flarePhases.push(lead ? 1 : 0.7 + random() * 0.25);\r
  }\r
  return data;\r
};\r
\r
const buildDust = (count: number) => {\r
  const random = seeded(1337);\r
  const rows = Math.max(1, Math.ceil(count / STATE_WIDTH));\r
  const home = new Float32Array(STATE_WIDTH * rows * 4);\r
  const seed = new Float32Array(STATE_WIDTH * rows * 4);\r
  let k = 0;\r
  let guard = 0;\r
  while (k < count && guard < count * 80) {\r
    guard++;\r
    let x: number;\r
    let y: number;\r
    let tone: number;\r
    if (random() < 0.28) {\r
      const angle = random() * Math.PI * 2;\r
      const radius = 0.87 + Math.sqrt(random()) * 0.105;\r
      x = Math.cos(angle) * radius;\r
      y = Math.sin(angle) * radius;\r
      if (random() > smooth(-0.6, 0.3, -y)) continue;\r
      const q = random();\r
      tone = q < 0.5 ? 3 : q < 0.8 ? 2 : 1;\r
    } else {\r
      x = random() * 2 - 1;\r
      y = random() * 2 - 1;\r
      const radius = Math.hypot(x, y);\r
      if (radius > 0.975) continue;\r
      const bowl = Math.pow(smooth(-0.25, 0.85, -y), 1.3);\r
      const band = smooth(0.66, 0.96, radius) * smooth(-0.7, 0.3, -y);\r
      const weight = Math.max(bowl, band * 0.9);\r
      if (random() > 0.012 + 0.988 * weight) continue;\r
      if (weight < 0.12) tone = 4;\r
      else {\r
        const q = random();\r
        tone = q < 0.32 ? 0 : q < 0.52 ? 1 : q < 0.8 ? 2 : 3;\r
      }\r
    }\r
    const chord = Math.sqrt(Math.max(0, 0.95 - x * x - y * y));\r
    home[k * 4] = x;\r
    home[k * 4 + 1] = y;\r
    home[k * 4 + 2] = (random() * 2 - 1) * chord;\r
    home[k * 4 + 3] = tone;\r
    seed[k * 4] = tone === 4 ? 1.8 : random() < 0.22 ? 2.1 : 1.3;\r
    seed[k * 4 + 1] = random();\r
    seed[k * 4 + 2] = 2.5 + random() * 3.5;\r
    seed[k * 4 + 3] = 0.16 + random() * 0.26;\r
    k++;\r
  }\r
  return { home, seed, count: k, rows };\r
};\r
\r
const passVertex = \`#version 300 es\r
in vec2 position;\r
in vec2 uv;\r
out vec2 vUv;\r
void main() {\r
  vUv = uv;\r
  gl_Position = vec4(position, 0.0, 1.0);\r
}\r
\`;\r
\r
const hashChunk = \`\r
uint scramble(uint v) {\r
  v = v * 747796405u + 2891336453u;\r
  uint w = ((v >> ((v >> 28u) + 4u)) ^ v) * 277803737u;\r
  return (w >> 22u) ^ w;\r
}\r
\r
float random(uint v) {\r
  return float(scramble(v)) * (1.0 / 4294967295.0);\r
}\r
\`;\r
\r
const dustChunk = \`\r
uniform float uDustTime;\r
uniform vec2 uTurn;\r
uniform float uMotion;\r
uniform float uFill;\r
\r
vec3 settle(vec3 p, out float spread) {\r
  float bend = exp2((0.5 - uFill) * 1.8);\r
  float h = clamp((p.y + 1.0) * 0.5, 0.0, 1.0);\r
  float y = 2.0 * pow(h, bend) - 1.0;\r
  float from = sqrt(max(1.0 - p.y * p.y, 1e-4));\r
  float to = sqrt(max(1.0 - y * y, 0.0));\r
  spread = clamp(bend * pow(max(h, 1e-3), bend - 1.0) * to / from, 0.25, 1.0);\r
  return vec3(p.xz * (to / from), y).xzy;\r
}\r
\r
vec3 drift(vec4 home, vec4 seed, uint id, out float life, out float spread) {\r
  vec3 p = settle(home.xyz, spread);\r
  float t = uDustTime;\r
  float u = fract(t / seed.z + seed.y);\r
  life = sin(3.14159265 * u);\r
  float travel = seed.w;\r
  if (uMotion < 0.5) {\r
    p.y += travel * (u - 0.5);\r
  } else if (uMotion < 1.5) {\r
    p.y -= travel * (u - 0.5);\r
  } else if (uMotion < 2.5) {\r
    p += 0.045 * vec3(\r
      sin(t * 0.37 + seed.y * 17.0) + 0.5 * sin(t * 0.83 + seed.z * 5.0),\r
      sin(t * 0.29 + seed.z * 11.0) + 0.5 * sin(t * 0.61 + seed.w * 7.0),\r
      sin(t * 0.33 + seed.w * 23.0)\r
    );\r
  } else {\r
    float loop = t * (0.6 + 0.9 * random(id * 7u + 3u)) * (random(id * 7u + 10u) < 0.5 ? -1.0 : 1.0) + seed.y * 6.2831853;\r
    p.xy += (0.025 + 0.05 * random(id * 7u + 16u)) * vec2(cos(loop), sin(loop));\r
  }\r
  float wobble = 0.002 + 0.006 * random(id * 7u + 1u);\r
  float w1 = 0.8 + 2.4 * random(id * 7u + 2u);\r
  float w2 = 0.8 + 2.4 * random(id * 7u + 4u);\r
  p += wobble * vec3(sin(t * w1 + seed.y * 40.0), cos(t * w2 + seed.z * 30.0), sin(t * (w1 + w2) * 0.5 + seed.w * 20.0));\r
  float cy = cos(uTurn.x);\r
  float sy = sin(uTurn.x);\r
  p.xz = mat2(cy, -sy, sy, cy) * p.xz;\r
  float cx = cos(uTurn.y);\r
  float sx = sin(uTurn.y);\r
  p.yz = mat2(cx, -sx, sx, cx) * p.yz;\r
  return p;\r
}\r
\`;\r
\r
const fieldFragment = \`#version 300 es\r
precision highp float;\r
\r
uniform vec2 uCenter;\r
uniform float uRadius;\r
uniform float uDpr;\r
uniform float uLine;\r
uniform float uTime;\r
uniform float uFrame;\r
uniform float uBins;\r
uniform float uStrands;\r
uniform float uCrackle;\r
uniform float uFlares;\r
uniform float uGlow;\r
uniform float uHaze;\r
uniform float uFill;\r
uniform float uPresence;\r
uniform float uUnfold;\r
uniform float uBloom;\r
uniform float uInside;\r
uniform float uEncode;\r
uniform vec3 uRim;\r
uniform vec3 uRimHot;\r
uniform vec3 uRimMid;\r
uniform vec3 uRimDeep;\r
uniform vec3 uSpark;\r
uniform vec3 uSparkGlow;\r
uniform vec3 uHazeColor;\r
uniform vec3 uEdgeColor;\r
uniform vec4 uHeat;\r
uniform vec4 uHarmonics[8];\r
uniform vec4 uRates[8];\r
uniform vec4 uPhases[8];\r
uniform vec4 uFlareHarmonics[8];\r
uniform vec4 uFlareRates[8];\r
uniform vec4 uFlarePhases[8];\r
uniform vec4 uArcs[4];\r
\r
out vec4 fragColor;\r
\${hashChunk}\r
const float PI = 3.14159265;\r
const float TAU = 6.28318531;\r
const vec4 AMPS = vec4(0.35, 0.3, 0.22, 0.13);\r
\r
float bell(float d, float w) {\r
  float x = d / w;\r
  return exp(-x * x);\r
}\r
\r
float segment(vec2 p, vec2 a, vec2 b) {\r
  vec2 pa = p - a;\r
  vec2 ba = b - a;\r
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-5), 0.0, 1.0);\r
  return length(pa - ba * h);\r
}\r
\r
float pool(vec2 q) {\r
  float t = length(q - vec2(0.0, mix(-1.0, -0.66, uFill))) / mix(0.8, 1.35, uFill);\r
  return t < 0.6 ? mix(0.5, 0.22, t / 0.6) : mix(0.22, 0.0, clamp((t - 0.6) / 0.4, 0.0, 1.0));\r
}\r
\r
void main() {\r
  vec2 p = gl_FragCoord.xy / uDpr - uCenter;\r
  float r = length(p);\r
  float R = uRadius;\r
  float theta = atan(p.y, p.x);\r
  float lift = p.y / max(r, 1e-3);\r
  float topDim = 1.0 - 0.35 * pow(max(lift, 0.0), 1.5);\r
  vec3 col = vec3(0.0);\r
  float hot = 0.0;\r
  uint frame = uint(uFrame);\r
\r
  if (r < R) {\r
    vec2 q = p / R;\r
    float chord = sqrt(max(1.0 - dot(q, q), 0.0));\r
    float haze = pool(q) * (0.55 + 0.45 * chord);\r
    col += uHazeColor * haze * uHaze * uInside;\r
    float e = length(q - vec2(0.0, 0.2)) / 1.2;\r
    float edge = 0.5 * pow(smoothstep(0.62, 1.0, e), 1.4);\r
    col += uEdgeColor * edge * uInside * (0.5 + 0.5 * uHaze);\r
  }\r
\r
  float dr = r - R;\r
  float halo = 1.0 - smoothstep(R * 0.05, R * 0.105, abs(dr - R * 0.0213));\r
  col += uRimDeep * 0.18 * halo * topDim * uGlow * uBloom;\r
  col += uRim * 0.12 * bell(dr + R * 0.0383, R * 0.032) * uGlow * uBloom;\r
  col += uRim * 0.32 * bell(dr, max(R * 0.0117, uLine)) * uPresence * uUnfold;\r
\r
  float delta = mod(theta - uHeat.x + PI, TAU) - PI;\r
  float heat = uHeat.z * uHeat.y * exp(-delta * delta / 0.3);\r
  float crackle = uCrackle + heat * 0.9;\r
  float amp = R * 0.016 * (0.3 + 1.4 * crackle) * uUnfold;\r
  float jitterAmp = R * 0.0048 * (0.3 + 1.4 * uCrackle) * uUnfold * (1.0 + heat * 0.3);\r
  float flareAmp = R * 0.064 * (0.4 + 1.2 * crackle) * uFlares * 1.6 * uUnfold;\r
\r
  if (abs(dr) < amp * 2.0 + flareAmp + R * 0.3) {\r
    float step = TAU / uBins;\r
    float binPos = (theta + PI) / step;\r
    float bin0 = floor(binPos);\r
    float binF = binPos - bin0;\r
    float th0 = bin0 * step - PI;\r
    float th1 = th0 + step;\r
    uint b0 = uint(mod(bin0, uBins));\r
    uint b1 = uint(mod(bin0 + 1.0, uBins));\r
    float gain = min(1.0, 2.4 / max(uStrands, 1.0));\r
    for (int k = 0; k < 8; k++) {\r
      if (float(k) >= uStrands) break;\r
      vec4 m = uHarmonics[k];\r
      vec4 lead = uRates[k] * uTime + uPhases[k];\r
      float wave0 = dot(AMPS, sin(m * th0 + lead));\r
      float wave1 = dot(AMPS, sin(m * th1 + lead));\r
      uint salt = uint(k) * 1013u + frame * 7919u;\r
      vec4 shape = uFlareHarmonics[k];\r
      vec4 look = uFlareRates[k];\r
      vec4 tone = uFlarePhases[k];\r
      float a = amp * shape.w;\r
      float off0 = a * wave0 + jitterAmp * (random(b0 + salt) - 0.5);\r
      float off1 = a * wave1 + jitterAmp * (random(b1 + salt) - 0.5);\r
      float rc = R + mix(off0, off1, binF);\r
      float grade = (off1 - off0) / (step * max(r, 1.0));\r
      float d = abs(r - rc) * inversesqrt(1.0 + grade * grade);\r
      float swell = 0.8 + 0.4 * (0.5 + 0.5 * sin(3.0 * theta + uTime * 0.7 + tone.x * 1.7));\r
      float width = uLine * look.w * swell * (1.0 + heat * 0.25);\r
      float core = exp(-d * d / (width * width));\r
      float sheath = exp(-d * d / (width * width * 3.0));\r
      float bright = tone.w * (1.0 + heat * 0.45) * uPresence;\r
      col += (uRimHot * core * 0.8 + uRim * sheath * 0.32) * bright;\r
      hot += core * bright;\r
      vec3 fargs = shape.xyz * theta + look.xyz * uTime + tone.xyz;\r
      float flare = max(0.0, (sin(fargs.x) + sin(fargs.y) + sin(fargs.z)) / 3.0);\r
      flare = (flare * flare + heat * 0.35) * flareAmp;\r
      float dw = abs(r - rc - flare);\r
      float dm = abs(r - rc - flare * 0.6);\r
      float dn = abs(r - rc - flare * 0.25);\r
      vec3 glow = uRimDeep * (0.07 * bell(dw, R * 0.09) + 0.16 * bell(dw, R * 0.05));\r
      glow += uRimMid * 0.28 * bell(dm, R * 0.027) + uRim * 0.38 * bell(dn, R * 0.013);\r
      col += glow * gain * topDim * uGlow * uBloom * (1.0 + heat * 1.4);\r
    }\r
  }\r
\r
  for (int i = 0; i < 4; i++) {\r
    vec4 arc = uArcs[i];\r
    if (arc.w <= 0.002) continue;\r
    float mid = arc.x + arc.y * 0.5;\r
    vec2 center = R * 0.93 * vec2(cos(mid), sin(mid));\r
    if (distance(p, center) > R * (abs(arc.y) * 0.6 + 0.1) + 12.0) continue;\r
    float ar = R * 0.955;\r
    vec2 a0 = ar * vec2(cos(arc.x), sin(arc.x));\r
    vec2 a2 = ar * vec2(cos(arc.x + arc.y), sin(arc.x + arc.y));\r
    vec2 a1 = R * (0.955 - arc.z) * vec2(cos(mid), sin(mid));\r
    float dmin = 1e5;\r
    float along = 0.0;\r
    vec2 prev = a0;\r
    for (int s = 1; s <= 10; s++) {\r
      float u = float(s) / 10.0;\r
      vec2 b = mix(mix(a0, a1, u), mix(a1, a2, u), u);\r
      vec2 pa = p - prev;\r
      vec2 ba = b - prev;\r
      float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-5), 0.0, 1.0);\r
      float dist = length(pa - ba * h);\r
      if (dist < dmin) {\r
        dmin = dist;\r
        along = (float(s) - 1.0 + h) / 10.0;\r
      }\r
      prev = b;\r
    }\r
    float taper = sqrt(max(sin(PI * along), 0.0));\r
    float arcWidth = uLine * (0.55 + 0.6 * taper);\r
    float arcCore = exp(-dmin * dmin / (arcWidth * arcWidth));\r
    float arcGlow = exp(-dmin * dmin / (arcWidth * arcWidth * 12.0));\r
    col += (uSpark * 0.95 * arcCore + uSparkGlow * 0.4 * arcGlow) * arc.w * taper;\r
    hot += arcCore * arc.w * taper * 0.6;\r
  }\r
\r
  fragColor = vec4(col, hot) * uEncode;\r
}\r
\`;\r
\r
const dustVertex = \`#version 300 es\r
precision highp float;\r
\r
in float aIndex;\r
\r
uniform sampler2D tHome;\r
uniform sampler2D tSeed;\r
uniform sampler2D tOffset;\r
uniform float uStirred;\r
uniform vec2 uCenter;\r
uniform vec2 uViewport;\r
uniform float uRadius;\r
uniform float uDpr;\r
uniform float uDepth;\r
uniform float uTwinkle;\r
uniform float uPointScale;\r
uniform float uReveal;\r
uniform float uEncode;\r
uniform vec3 uTones[5];\r
uniform vec3 uRimTone;\r
\r
out vec3 vColor;\r
out float vSize;\r
\${hashChunk}\r
\${dustChunk}\r
void main() {\r
  ivec2 cell = ivec2(int(mod(aIndex, \${STATE_WIDTH}.0)), int(floor(aIndex / \${STATE_WIDTH}.0)));\r
  uint id = uint(aIndex);\r
  vec4 home = texelFetch(tHome, cell, 0);\r
  vec4 seed = texelFetch(tSeed, cell, 0);\r
  float life;\r
  float spread;\r
  vec3 p = drift(home, seed, id, life, spread);\r
  if (uStirred > 0.5) p += texelFetch(tOffset, cell, 0).xyz;\r
  float len = length(p);\r
  float inside = 1.0 - smoothstep(0.955, 0.985, length(p.xy));\r
  if (len > 0.975) p *= 0.975 / len;\r
\r
  float front = p.z * 0.5 + 0.5;\r
  float depthSize = mix(1.0, 0.7 + 0.6 * front, uDepth);\r
  float depthLight = mix(1.0, 0.35 + 0.8 * front, uDepth);\r
  float blink = sin(uDustTime * (2.0 + 6.0 * random(id * 7u + 5u)) + random(id * 7u + 6u) * 6.2831853);\r
  float twinkle = mix(1.0, smoothstep(-0.9, -0.6, blink), uTwinkle);\r
  float fade = smoothstep(0.04, 0.12, life);\r
  float order = (home.y + 1.0) * 0.5 * 0.55 + random(id * 7u + 8u) * 0.25;\r
  float reveal = smoothstep(order, order + 0.2, uReveal * 1.0);\r
  float alpha = random(id * 7u + 9u) < 0.5 || home.w > 3.5 ? 1.0 : 0.6;\r
\r
  float size = seed.x * uPointScale * (0.35 + 0.95 * life) * depthSize * mix(0.5, 1.0, reveal);\r
  vec2 screen = uCenter + p.xy * uRadius;\r
  gl_Position = vec4(screen / uViewport * 2.0 - 1.0, 0.0, 1.0);\r
  float px = size * uDpr;\r
  gl_PointSize = px + 2.0;\r
  vSize = px;\r
\r
  int tone = int(home.w + 0.5);\r
  float rimLit = smoothstep(0.8, 0.97, length(p.xy));\r
  vec3 color = uTones[tone] + uRimTone * rimLit * rimLit * 0.12;\r
  vColor = color * alpha * fade * twinkle * depthLight * reveal * inside * sqrt(spread) * uEncode;\r
}\r
\`;\r
\r
const dustFragment = \`#version 300 es\r
precision highp float;\r
\r
uniform float uShape;\r
\r
in vec3 vColor;\r
in float vSize;\r
\r
out vec4 fragColor;\r
\r
void main() {\r
  vec2 q = (gl_PointCoord - 0.5) * (vSize + 2.0);\r
  float half_ = max(vSize * 0.5, 0.5);\r
  float cover;\r
  if (uShape < 0.5) {\r
    vec2 c = clamp(half_ - abs(q) + 0.5, 0.0, 1.0);\r
    cover = c.x * c.y;\r
  } else {\r
    cover = clamp(half_ - length(q) + 0.5, 0.0, 1.0);\r
  }\r
  if (cover <= 0.0) discard;\r
  fragColor = vec4(vColor * cover, 0.0);\r
}\r
\`;\r
\r
const stirFragment = \`#version 300 es\r
precision highp float;\r
\r
uniform sampler2D tHome;\r
uniform sampler2D tSeed;\r
uniform sampler2D tOffset;\r
uniform sampler2D tVelocity;\r
uniform float uDt;\r
uniform float uReset;\r
uniform vec4 uBrush;\r
uniform float uBrushPower;\r
uniform vec4 uKick;\r
\r
layout(location = 0) out vec4 outOffset;\r
layout(location = 1) out vec4 outVelocity;\r
\${hashChunk}\r
\${dustChunk}\r
vec3 swirl(vec3 p) {\r
  float t = uDustTime * 0.15;\r
  vec3 a = vec3(1.7, 1.9, 1.5) * p.yzx + vec3(t, 1.2, 2.1);\r
  vec3 b = vec3(2.3, 2.1, 2.7) * p.zxy + vec3(0.4, t * 1.3, 0.9);\r
  vec3 ca = cos(a) * vec3(1.7, 1.9, 1.5);\r
  vec3 cb = cos(b) * vec3(2.3, 2.1, 2.7);\r
  return vec3(ca.z - cb.x, cb.y - ca.x, ca.y - cb.z);\r
}\r
\r
void main() {\r
  ivec2 cell = ivec2(gl_FragCoord.xy);\r
  if (uReset > 0.5) {\r
    outOffset = vec4(0.0);\r
    outVelocity = vec4(0.0);\r
    return;\r
  }\r
  uint id = uint(cell.y * \${STATE_WIDTH} + cell.x);\r
  vec4 home = texelFetch(tHome, cell, 0);\r
  vec4 seed = texelFetch(tSeed, cell, 0);\r
  vec3 o = texelFetch(tOffset, cell, 0).xyz;\r
  vec3 v = texelFetch(tVelocity, cell, 0).xyz;\r
  float life;\r
  float spread;\r
  vec3 base = drift(home, seed, id, life, spread);\r
  vec3 p = base + o;\r
\r
  float k = mix(0.8, 2.2, random(id * 7u + 11u));\r
  vec3 acc = -k * o - 1.5 * sqrt(k) * v;\r
\r
  vec2 gap = p.xy - uBrush.xy;\r
  float touch = exp(-dot(gap, gap) / 0.07) * uBrushPower;\r
  acc += (vec3(uBrush.zw, 0.0) - v) * touch * 14.0;\r
  float pace = length(v);\r
  if (pace > 1e-4) {\r
    vec3 heading = v / pace;\r
    vec3 curl = swirl(p * 1.6);\r
    acc += (curl - heading * dot(curl, heading)) * min(pace, 2.0) * 1.8;\r
  }\r
\r
  if (uKick.z > 0.0) {\r
    vec3 jolt = vec3(random(id * 7u + 12u), random(id * 7u + 13u), random(id * 7u + 14u)) - 0.5;\r
    float near = exp(-dot(p.xy - uKick.xy, p.xy - uKick.xy) / 0.4);\r
    vec3 spinKick = vec3(-p.z, 0.0, p.x) * 0.9;\r
    vec3 lift = vec3(0.0, 0.5 + 0.8 * random(id * 7u + 15u), 0.0) * (0.3 + 0.7 * smoothstep(0.2, -0.8, p.y));\r
    v += (jolt * 0.8 + spinKick + lift) * uKick.z * (0.4 + 0.45 * near);\r
  }\r
\r
  v += acc * uDt;\r
  o += v * uDt;\r
  vec3 q = base + o;\r
  float len = length(q);\r
  if (len > 0.97) {\r
    vec3 n = q / len;\r
    o -= n * (len - 0.97);\r
    v -= n * max(dot(v, n), 0.0) * 1.5;\r
  }\r
  outOffset = vec4(o, 1.0);\r
  outVelocity = vec4(v, 1.0);\r
}\r
\`;\r
\r
const compositeFragment = \`#version 300 es\r
precision highp float;\r
\r
uniform sampler2D tScene;\r
uniform float uLight;\r
uniform float uDecode;\r
\r
in vec2 vUv;\r
out vec4 fragColor;\r
\r
vec3 soften(vec3 x) {\r
  vec3 over = max(x - 0.6, 0.0);\r
  return min(x, 0.6) + 0.4 * (1.0 - exp(-over / 0.4));\r
}\r
\r
void main() {\r
  vec4 scene = texture(tScene, vUv) * uDecode;\r
  vec3 light = max(scene.rgb, 0.0);\r
  float peak = max(light.r, max(light.g, light.b));\r
  if (uLight > 0.5) {\r
    vec3 hue = light / max(peak, 1e-4);\r
    float cover = 1.0 - exp(-peak * 2.4);\r
    vec3 ink = hue * mix(0.92, 0.72, cover);\r
    float core = clamp(scene.a * 0.7, 0.0, 1.0) * cover;\r
    vec3 tint = mix(vec3(1.0), hue, 0.22);\r
    fragColor = vec4(tint * core + ink * cover * (1.0 - core), core + cover * (1.0 - core));\r
    return;\r
  }\r
  light += vec3(max(peak - 1.8, 0.0) * 0.25);\r
  vec3 shown = soften(light);\r
  fragColor = vec4(shown, max(shown.r, max(shown.g, shown.b)));\r
}\r
\`;\r
\r
const CrystalizedBall = ({\r
  preset = 'plasma',\r
  color,\r
  theme = 'dark',\r
  size = 0.7,\r
  strands,\r
  crackle,\r
  flares,\r
  glow,\r
  sparks,\r
  particleCount,\r
  fill,\r
  motion,\r
  particleShape,\r
  depth,\r
  sway,\r
  twinkle,\r
  haze,\r
  speed = 1,\r
  dustSpeed,\r
  interactive = true,\r
  hoverStrength = 0.7,\r
  intro = true,\r
  paused = false,\r
  className = '',\r
  style\r
}: CrystalizedBallProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const settingsRef = useRef<Settings | null>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
\r
  const base = BALL_PRESETS[preset] || BALL_PRESETS.plasma;\r
  const pick = <K extends keyof PresetValues>(value: PresetValues[K] | undefined, key: K): PresetValues[K] =>\r
    value === undefined || value === null ? base[key] : value;\r
  const tint = pick(color, 'color');\r
\r
  const colors = useMemo(() => {\r
    const light = theme === 'light';\r
    return { light, palette: buildPalette(parseColor(tint, [0.95, 0.36, 0.82]), light) };\r
  }, [tint, theme]);\r
\r
  useEffect(() => {\r
    settingsRef.current = {\r
      ...colors,\r
      size,\r
      strands: pick(strands, 'strands'),\r
      crackle: pick(crackle, 'crackle'),\r
      flares: pick(flares, 'flares'),\r
      glow: pick(glow, 'glow'),\r
      sparks: pick(sparks, 'sparks'),\r
      particleCount: pick(particleCount, 'particleCount'),\r
      fill: pick(fill, 'fill'),\r
      motion: pick(motion, 'motion'),\r
      particleShape: pick(particleShape, 'particleShape'),\r
      depth: pick(depth, 'depth'),\r
      sway: pick(sway, 'sway'),\r
      twinkle: pick(twinkle, 'twinkle'),\r
      haze: pick(haze, 'haze'),\r
      dustSpeed: pick(dustSpeed, 'dustSpeed'),\r
      speed,\r
      interactive,\r
      hoverStrength,\r
      intro,\r
      paused\r
    };\r
    wakeRef.current?.();\r
  });\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    if (!container) return undefined;\r
\r
    const renderer = new Renderer({ alpha: true, premultipliedAlpha: true, antialias: false, depth: false });\r
    const gl = renderer.gl;\r
    const gl2 = gl as unknown as WebGL2RenderingContext;\r
    if (!renderer.isWebgl2) {\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
      return undefined;\r
    }\r
    const canvas = gl.canvas;\r
    canvas.style.display = 'block';\r
    canvas.style.width = '100%';\r
    canvas.style.height = '100%';\r
    canvas.setAttribute('aria-hidden', 'true');\r
    container.appendChild(canvas);\r
\r
    const fullFloat = !!gl.getExtension('EXT_color_buffer_float');\r
    const halfFloat = fullFloat || !!gl.getExtension('EXT_color_buffer_half_float');\r
    const encode = halfFloat ? 1 : 0.25;\r
    const geometry = new Triangle(gl);\r
    const blank = new Texture(gl);\r
    const strandData = buildStrands();\r
\r
    const sceneTarget = new RenderTarget(gl, {\r
      width: 1,\r
      height: 1,\r
      depth: false,\r
      type: halfFloat ? gl2.HALF_FLOAT : gl.UNSIGNED_BYTE,\r
      format: gl.RGBA,\r
      internalFormat: halfFloat ? gl2.RGBA16F : gl.RGBA,\r
      minFilter: gl.NEAREST,\r
      magFilter: gl.NEAREST\r
    });\r
\r
    const arcData = new Array(MAX_ARCS * 4).fill(0);\r
    const fieldUniforms = {\r
      uCenter: { value: [0, 0] },\r
      uRadius: { value: 1 },\r
      uDpr: { value: 1 },\r
      uLine: { value: 0.6 },\r
      uTime: { value: 0 },\r
      uFrame: { value: 0 },\r
      uBins: { value: 420 },\r
      uStrands: { value: 5 },\r
      uCrackle: { value: 0.6 },\r
      uFlares: { value: 0.5 },\r
      uGlow: { value: 0.8 },\r
      uHaze: { value: 0.7 },\r
      uFill: { value: 0.5 },\r
      uPresence: { value: 0 },\r
      uUnfold: { value: 0 },\r
      uBloom: { value: 0 },\r
      uInside: { value: 0 },\r
      uEncode: { value: encode },\r
      uRim: { value: [1, 1, 1] },\r
      uRimHot: { value: [1, 1, 1] },\r
      uRimMid: { value: [1, 1, 1] },\r
      uRimDeep: { value: [1, 1, 1] },\r
      uSpark: { value: [1, 1, 1] },\r
      uSparkGlow: { value: [1, 1, 1] },\r
      uHazeColor: { value: [0, 0, 0] },\r
      uEdgeColor: { value: [0, 0, 0] },\r
      uHeat: { value: [0, 0, 0, 0] },\r
      uHarmonics: { value: strandData.harmonics },\r
      uRates: { value: strandData.rates },\r
      uPhases: { value: strandData.phases },\r
      uFlareHarmonics: { value: strandData.flareHarmonics },\r
      uFlareRates: { value: strandData.flareRates },\r
      uFlarePhases: { value: strandData.flarePhases },\r
      uArcs: { value: arcData }\r
    };\r
\r
    const dustShared = {\r
      uDustTime: { value: 0 },\r
      uTurn: { value: [0, 0] },\r
      uMotion: { value: 0 },\r
      uFill: fieldUniforms.uFill,\r
      tHome: { value: blank },\r
      tSeed: { value: blank }\r
    };\r
\r
    const dustUniforms = {\r
      ...dustShared,\r
      tOffset: { value: blank },\r
      uStirred: { value: 0 },\r
      uCenter: fieldUniforms.uCenter,\r
      uViewport: { value: [1, 1] },\r
      uRadius: fieldUniforms.uRadius,\r
      uDpr: fieldUniforms.uDpr,\r
      uDepth: { value: 0.6 },\r
      uTwinkle: { value: 0.5 },\r
      uPointScale: { value: 1 },\r
      uReveal: { value: 0 },\r
      uEncode: { value: encode },\r
      uTones: { value: new Array(15).fill(1) },\r
      uRimTone: { value: [1, 1, 1] },\r
      uShape: { value: 0 }\r
    };\r
\r
    const stirUniforms = {\r
      ...dustShared,\r
      tOffset: { value: blank },\r
      tVelocity: { value: blank },\r
      uDt: { value: 0.016 },\r
      uReset: { value: 1 },\r
      uBrush: { value: [0, 0, 0, 0] },\r
      uBrushPower: { value: 0 },\r
      uKick: { value: [0, 0, 0, 0] }\r
    };\r
\r
    const compositeUniforms = {\r
      tScene: { value: sceneTarget.texture },\r
      uLight: { value: 0 },\r
      uDecode: { value: 1 / encode }\r
    };\r
\r
    const additive = (program: Program) => {\r
      program.setBlendFunc(gl.ONE, gl.ONE);\r
      return program;\r
    };\r
\r
    const fieldMesh = new Mesh(gl, {\r
      geometry,\r
      program: additive(\r
        new Program(gl, {\r
          vertex: passVertex,\r
          fragment: fieldFragment,\r
          uniforms: fieldUniforms,\r
          transparent: true,\r
          depthTest: false,\r
          depthWrite: false\r
        })\r
      )\r
    });\r
    const dustProgram = additive(\r
      new Program(gl, {\r
        vertex: dustVertex,\r
        fragment: dustFragment,\r
        uniforms: dustUniforms,\r
        transparent: true,\r
        depthTest: false,\r
        depthWrite: false\r
      })\r
    );\r
    const stirMesh = halfFloat\r
      ? new Mesh(gl, {\r
          geometry,\r
          program: new Program(gl, {\r
            vertex: passVertex,\r
            fragment: stirFragment,\r
            uniforms: stirUniforms,\r
            depthTest: false,\r
            depthWrite: false\r
          })\r
        })\r
      : null;\r
    const compositeMesh = new Mesh(gl, {\r
      geometry,\r
      program: new Program(gl, {\r
        vertex: passVertex,\r
        fragment: compositeFragment,\r
        uniforms: compositeUniforms,\r
        depthTest: false,\r
        depthWrite: false\r
      })\r
    });\r
\r
    const disposeTarget = (target: RenderTarget | null) => {\r
      if (!target) return;\r
      gl.deleteFramebuffer(target.buffer);\r
      target.textures.forEach(texture => gl.deleteTexture(texture.texture));\r
    };\r
\r
    const stateTarget = (rows: number) =>\r
      new RenderTarget(gl, {\r
        width: STATE_WIDTH,\r
        height: rows,\r
        color: 2,\r
        depth: false,\r
        type: fullFloat ? gl.FLOAT : gl2.HALF_FLOAT,\r
        format: gl.RGBA,\r
        internalFormat: fullFloat ? gl2.RGBA32F : gl2.RGBA16F,\r
        minFilter: gl.NEAREST,\r
        magFilter: gl.NEAREST\r
      });\r
\r
    const dataTexture = (data: Float32Array, rows: number) =>\r
      new Texture(gl, {\r
        image: data,\r
        width: STATE_WIDTH,\r
        height: rows,\r
        type: gl.FLOAT,\r
        format: gl.RGBA,\r
        internalFormat: gl2.RGBA32F,\r
        minFilter: gl.NEAREST,\r
        magFilter: gl.NEAREST,\r
        generateMipmaps: false,\r
        flipY: false\r
      });\r
\r
    let dust: DustLayer | null = null;\r
\r
    const disposeDust = () => {\r
      if (!dust) return;\r
      dust.mesh.geometry.remove();\r
      gl.deleteTexture(dust.home.texture);\r
      gl.deleteTexture(dust.seed.texture);\r
      disposeTarget(dust.read);\r
      disposeTarget(dust.write);\r
      dust = null;\r
    };\r
\r
    const resetStir = () => {\r
      if (!stirMesh || !dust || !dust.read || !dust.write) return;\r
      stirUniforms.tOffset.value = blank;\r
      stirUniforms.tVelocity.value = blank;\r
      stirUniforms.uReset.value = 1;\r
      renderer.render({ scene: stirMesh, target: dust.read, clear: false });\r
      renderer.render({ scene: stirMesh, target: dust.write, clear: false });\r
      stirUniforms.uReset.value = 0;\r
    };\r
\r
    const rebuildDust = (requested: number) => {\r
      const total = clamp(Math.round(requested / 100) * 100, 0, MAX_PARTICLES);\r
      if (dust && dust.requested === total) return;\r
      disposeDust();\r
      if (!total) {\r
        dust = null;\r
        return;\r
      }\r
      const data = buildDust(total);\r
      const indices = new Float32Array(data.count);\r
      for (let i = 0; i < data.count; i++) indices[i] = i;\r
      const points = new Geometry(gl, { aIndex: { size: 1, data: indices } });\r
      dust = {\r
        requested: total,\r
        rows: data.rows,\r
        home: dataTexture(data.home, data.rows),\r
        seed: dataTexture(data.seed, data.rows),\r
        mesh: new Mesh(gl, { mode: gl.POINTS, geometry: points, program: dustProgram }),\r
        read: stirMesh ? stateTarget(data.rows) : null,\r
        write: stirMesh ? stateTarget(data.rows) : null\r
      };\r
      dustShared.tHome.value = dust.home;\r
      dustShared.tSeed.value = dust.seed;\r
      resetStir();\r
      stirring = 0;\r
    };\r
\r
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const random = seeded(913);\r
\r
    let width = 1;\r
    let height = 1;\r
    let raf = 0;\r
    let last = performance.now();\r
    let rimTime = 0;\r
    let dustTime = 0;\r
    let swayClock = 0;\r
    let introClock = 0;\r
    let visible = true;\r
    let alive = true;\r
    let surge = 0;\r
    let stirring = 0;\r
    let stirEnergy = 0;\r
    let kick: { x: number; y: number; strength: number } | null = null;\r
    let nextArc = 0.3;\r
    const arcs: Arc[] = [];\r
    const pointer = { x: 0, y: 0, inside: false, fresh: true };\r
    const heat = { angle: 0, velocity: 0, power: 0, near: 0 };\r
    const brush = { x: 0, y: 0, vx: 0, vy: 0 };\r
    const look = { x: 0, y: 0, vx: 0, vy: 0 };\r
\r
    const resize = () => {\r
      width = Math.max(1, container.clientWidth);\r
      height = Math.max(1, container.clientHeight);\r
      renderer.dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(PIXEL_BUDGET / (width * height)));\r
      renderer.setSize(width, height);\r
      sceneTarget.setSize(gl.canvas.width, gl.canvas.height);\r
      start();\r
    };\r
\r
    const spawnArc = (angle: number, strength: number) => {\r
      if (arcs.length >= MAX_ARCS) return;\r
      arcs.push({\r
        start: angle,\r
        span: (0.05 + random() * 0.07) * (random() < 0.5 ? -1 : 1),\r
        curl: 0.02 + random() * 0.04,\r
        life: 0,\r
        duration: 0.2 + random() * 0.2,\r
        drift: (random() - 0.5) * 0.3,\r
        strength\r
      });\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!alive) return;\r
      const s = settingsRef.current;\r
      const dt = Math.min(0.05, Math.max(1 / 240, (now - last) / 1000));\r
      last = now;\r
      if (!s) return;\r
\r
      const moving = !s.paused && !reducedMotion;\r
      introClock = s.intro && !reducedMotion ? Math.min(1, introClock + dt / INTRO_SECONDS) : 1;\r
      const presence = easeOut(smooth(0, 0.42, introClock));\r
      const unfold = easeOut(smooth(0, 0.32, introClock));\r
      const charge = Math.sin(Math.PI * smooth(0.22, 0.78, introClock)) * 0.35;\r
      const radius = Math.max(8, (clamp(s.size, 0.1, 1.5) * Math.min(width, height)) / 2);\r
\r
      const strength = s.interactive && !reducedMotion ? clamp(s.hoverStrength, 0, 1) : 0;\r
      const px = pointer.x - width / 2;\r
      const py = height / 2 - pointer.y;\r
      const reach = Math.hypot(px, py);\r
      const target = pointer.inside ? strength : 0;\r
      if (heat.power < 0.02) {\r
        heat.angle = Math.atan2(py, px);\r
        heat.velocity = 0;\r
      }\r
      const turn = wrapAngle(Math.atan2(py, px) - heat.angle);\r
      heat.velocity += (120 * turn - 19 * heat.velocity) * dt;\r
      heat.angle = wrapAngle(heat.angle + heat.velocity * dt);\r
      heat.power += (target - heat.power) * (1 - Math.exp(-dt / (target > heat.power ? 0.3 : 0.55)));\r
      const nearTarget = Math.exp(-Math.pow((reach - radius) / (radius * 0.45), 2));\r
      heat.near += (nearTarget - heat.near) * (1 - Math.exp(-dt / 0.15));\r
      surge *= Math.exp(-dt / 0.7);\r
\r
      const bx = px / radius;\r
      const by = py / radius;\r
      if (Math.hypot(bx - brush.x, by - brush.y) > 0.6) pointer.fresh = true;\r
      if (pointer.fresh) {\r
        brush.x = bx;\r
        brush.y = by;\r
        brush.vx = 0;\r
        brush.vy = 0;\r
        pointer.fresh = false;\r
      }\r
      const follow = 1 - Math.exp(-dt / 0.05);\r
      brush.vx += ((bx - brush.x) / dt - brush.vx) * follow;\r
      brush.vy += ((by - brush.y) / dt - brush.vy) * follow;\r
      brush.x = bx;\r
      brush.y = by;\r
      const brushSpeed = Math.hypot(brush.vx, brush.vy);\r
      const cap = brushSpeed > 4 ? 4 / brushSpeed : 1;\r
      const inBall = Math.exp(-Math.max(0, Math.hypot(bx, by) - 1) * 6);\r
      const brushPower = pointer.inside ? strength * inBall * presence : 0;\r
      stirEnergy = stirEnergy * Math.exp(-dt / 1.2) + brushPower * Math.min(brushSpeed, 4) * dt;\r
\r
      if (moving) {\r
        const pace = 1 + surge * 0.6 + heat.power * heat.near * 0.3;\r
        const step = dt * Math.max(0, s.speed) * 2 * pace;\r
        rimTime += step;\r
        dustTime += dt * Math.max(0, s.dustSpeed) * (1 + surge * 0.4);\r
        swayClock += dt * Math.max(0, s.dustSpeed);\r
        const crackleNow = clamp(s.crackle + surge * 0.5, 0, 1.5);\r
        if (s.sparks > 0.01 && introClock > 0.55) {\r
          nextArc -= step * s.sparks * 2 * (0.6 + crackleNow * 0.6);\r
          if (nextArc <= 0) {\r
            const local = heat.power * heat.near;\r
            const angle =\r
              random() < local * 0.7\r
                ? heat.angle + (random() - 0.5) * 0.8\r
                : random() < 0.7\r
                  ? Math.PI / 2 + (random() - 0.5) * 1.5\r
                  : random() * Math.PI * 2;\r
            spawnArc(angle, 0.8 + local * 0.6 + surge * 0.4);\r
            nextArc = 0.15 + random() * 0.6;\r
          }\r
        }\r
        for (let i = arcs.length - 1; i >= 0; i--) {\r
          const arc = arcs[i];\r
          arc.life += step;\r
          arc.start += arc.drift * step;\r
          if (arc.life >= arc.duration) arcs.splice(i, 1);\r
        }\r
      } else {\r
        arcs.length = 0;\r
      }\r
      for (let i = 0; i < MAX_ARCS; i++) {\r
        const arc = arcs[i];\r
        arcData[i * 4] = arc ? arc.start : 0;\r
        arcData[i * 4 + 1] = arc ? arc.span : 0;\r
        arcData[i * 4 + 2] = arc ? arc.curl : 0;\r
        arcData[i * 4 + 3] = arc ? Math.sin((Math.PI * arc.life) / arc.duration) * arc.strength : 0;\r
      }\r
\r
      rebuildDust(s.particleCount);\r
      const palette = s.palette;\r
\r
      fieldUniforms.uCenter.value = [width / 2, height / 2];\r
      fieldUniforms.uRadius.value = radius;\r
      fieldUniforms.uDpr.value = renderer.dpr;\r
      fieldUniforms.uLine.value = Math.max(0.6, radius * 0.0035);\r
      fieldUniforms.uTime.value = rimTime;\r
      fieldUniforms.uFrame.value = Math.floor(rimTime * 24) % 100000;\r
      fieldUniforms.uBins.value = clamp(Math.round((Math.PI * 2 * radius) / 2.6), 240, 900);\r
      fieldUniforms.uStrands.value = Math.round(clamp(s.strands, 1, MAX_STRANDS));\r
      fieldUniforms.uCrackle.value = clamp(s.crackle, 0, 1) + surge * 0.5 + charge;\r
      fieldUniforms.uFlares.value = clamp(s.flares, 0, 1);\r
      fieldUniforms.uGlow.value = clamp(s.glow, 0, 2) * (1 + surge * 0.5 + charge) * (s.light ? 0.35 : 1);\r
      fieldUniforms.uHaze.value = clamp(s.haze, 0, 2) * (s.light ? 0.6 : 1);\r
      fieldUniforms.uFill.value = clamp(s.fill, 0, 1);\r
      fieldUniforms.uPresence.value = presence;\r
      fieldUniforms.uUnfold.value = unfold;\r
      fieldUniforms.uBloom.value = presence * presence;\r
      fieldUniforms.uInside.value = smooth(0.2, 0.95, introClock);\r
      fieldUniforms.uRim.value = palette.rim;\r
      fieldUniforms.uRimHot.value = palette.rimHot;\r
      fieldUniforms.uRimMid.value = palette.rimMid;\r
      fieldUniforms.uRimDeep.value = palette.rimDeep;\r
      fieldUniforms.uSpark.value = palette.spark;\r
      fieldUniforms.uSparkGlow.value = palette.sparkGlow;\r
      fieldUniforms.uHazeColor.value = palette.haze;\r
      fieldUniforms.uEdgeColor.value = palette.edge;\r
      fieldUniforms.uHeat.value = [heat.angle, heat.near, heat.power * presence, 0];\r
\r
      dustShared.uDustTime.value = dustTime;\r
      const gaze = pointer.inside ? strength * presence : 0;\r
      const lookX = clamp(bx, -1.6, 1.6) * gaze;\r
      const lookY = clamp(by, -1.6, 1.6) * gaze;\r
      look.vx += (40 * (lookX - look.x) - 11 * look.vx) * dt;\r
      look.vy += (40 * (lookY - look.y) - 11 * look.vy) * dt;\r
      look.x += look.vx * dt;\r
      look.y += look.vy * dt;\r
      const swing = clamp(s.sway, 0, 1);\r
      dustShared.uTurn.value = [\r
        swing * 0.42 * Math.sin(swayClock * 0.23) + look.x * 0.3,\r
        swing * 0.12 * Math.sin(swayClock * 0.17 + 1.3) - look.y * 0.16\r
      ];\r
      dustShared.uMotion.value = MOTIONS[s.motion] ?? 0;\r
      dustUniforms.uViewport.value = [width, height];\r
      dustUniforms.uDepth.value = clamp(s.depth, 0, 1);\r
      dustUniforms.uTwinkle.value = clamp(s.twinkle, 0, 1);\r
      dustUniforms.uPointScale.value = Math.max(1, radius / 491);\r
      dustUniforms.uReveal.value = smooth(0.18, 1, introClock);\r
      dustUniforms.uTones.value = palette.tones.flat();\r
      dustUniforms.uRimTone.value = palette.rim;\r
      dustUniforms.uShape.value = SHAPES[s.particleShape] ?? 0;\r
\r
      const layer = dust;\r
      if (layer && stirMesh && (stirEnergy > 0.002 || kick)) stirring = SETTLE_SECONDS;\r
      let stirred = false;\r
      if (layer && layer.read && layer.write && stirMesh && stirring > 0) {\r
        stirUniforms.uDt.value = Math.min(dt, 1 / 30);\r
        stirUniforms.uBrush.value = [brush.x, brush.y, brush.vx * cap, brush.vy * cap];\r
        stirUniforms.uBrushPower.value = brushPower;\r
        stirUniforms.uKick.value = kick ? [kick.x, kick.y, kick.strength, 0] : [0, 0, 0, 0];\r
        stirUniforms.tOffset.value = layer.read.textures[0];\r
        stirUniforms.tVelocity.value = layer.read.textures[1];\r
        renderer.render({ scene: stirMesh, target: layer.write, clear: false });\r
        const swap = layer.read;\r
        layer.read = layer.write;\r
        layer.write = swap;\r
        stirring -= dt;\r
        stirred = stirring > 0;\r
        if (!stirred) {\r
          stirring = 0;\r
          resetStir();\r
        }\r
      }\r
      kick = null;\r
      dustUniforms.uStirred.value = stirred ? 1 : 0;\r
      dustUniforms.tOffset.value = layer && layer.read ? layer.read.textures[0] : blank;\r
\r
      gl.clearColor(0, 0, 0, 0);\r
      renderer.render({ scene: fieldMesh, target: sceneTarget, clear: true });\r
      if (dust) renderer.render({ scene: dust.mesh, target: sceneTarget, clear: false });\r
\r
      compositeUniforms.uLight.value = s.light ? 1 : 0;\r
      renderer.render({ scene: compositeMesh, clear: false });\r
\r
      const settling =\r
        Math.abs(target - heat.power) > 0.002 ||\r
        surge > 0.002 ||\r
        stirring > 0 ||\r
        Math.abs(heat.velocity) > 0.01 ||\r
        Math.hypot(look.vx, look.vy, look.x - lookX, look.y - lookY) > 0.001;\r
      if (visible && (moving || introClock < 1 || settling)) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const start = () => {\r
      if (raf || !visible || !alive) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const locate = (e: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = e.clientX - rect.left;\r
      const y = e.clientY - rect.top;\r
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };\r
    };\r
\r
    const onPointerMove = (e: PointerEvent) => {\r
      const spot = locate(e);\r
      if (spot.inside && !pointer.inside) pointer.fresh = true;\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = spot.inside;\r
      if (spot.inside) start();\r
    };\r
\r
    const onPointerDown = (e: PointerEvent) => {\r
      const s = settingsRef.current;\r
      const spot = locate(e);\r
      if (!s || !s.interactive || reducedMotion || !spot.inside) return;\r
      if (!pointer.inside) pointer.fresh = true;\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = true;\r
      const radius = Math.max(8, (clamp(s.size, 0.1, 1.5) * Math.min(width, height)) / 2);\r
      const kx = (spot.x - width / 2) / radius;\r
      const ky = (height / 2 - spot.y) / radius;\r
      const distance = Math.hypot(kx, ky);\r
      if (distance > 1.3) return;\r
      const strength = clamp(s.hoverStrength, 0, 1);\r
      kick = { x: kx, y: ky, strength: strength * 1.2 };\r
      surge = Math.max(surge, strength);\r
      const angle = Math.atan2(ky, kx);\r
      spawnArc(angle + (random() - 0.5) * 0.5, 1.3);\r
      spawnArc(angle + Math.PI + (random() - 0.5) * 1.2, 1.1);\r
      start();\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      start();\r
    };\r
\r
    const onPointerOut = (e: PointerEvent) => {\r
      if (!e.relatedTarget) onPointerLeave();\r
    };\r
\r
    const onPointerUp = (e: PointerEvent) => {\r
      if (e.pointerType === 'touch') onPointerLeave();\r
    };\r
\r
    const onVisibility = () => {\r
      if (!document.hidden) start();\r
    };\r
\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    window.addEventListener('pointerout', onPointerOut, { passive: true });\r
    window.addEventListener('pointerup', onPointerUp, { passive: true });\r
    window.addEventListener('blur', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(container);\r
    const intersectionObserver = new IntersectionObserver(([entry]) => {\r
      visible = entry.isIntersecting;\r
      start();\r
    });\r
    intersectionObserver.observe(container);\r
\r
    wakeRef.current = start;\r
    resize();\r
\r
    return () => {\r
      alive = false;\r
      visible = false;\r
      cancelAnimationFrame(raf);\r
      resizeObserver.disconnect();\r
      intersectionObserver.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('pointerout', onPointerOut);\r
      window.removeEventListener('pointerup', onPointerUp);\r
      window.removeEventListener('blur', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      wakeRef.current = null;\r
      disposeDust();\r
      disposeTarget(sceneTarget);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);\r
    };\r
  }, []);\r
\r
  return (\r
    <div ref={containerRef} className={\`relative w-full h-full overflow-hidden \${className}\`.trim()} style={style} />\r
  );\r
};\r
\r
export default CrystalizedBall;\r
`,o={dependencies:"ogl",usage:`import CrystalizedBall from './CrystalizedBall';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <CrystalizedBall
    preset="plasma"
    color="#F25BD0"
    size={0.7}
    crackle={0.85}
    fill={0.5}
    interactive
    hoverStrength={0.7}
  />
</div>`,code:r,css:n,tailwind:e,tsCode:t,tsTailwind:a};export{o as crystalizedBall};
