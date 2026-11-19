const r=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
import { Renderer, Program, Mesh, Triangle, Texture } from 'ogl';\r
\r
import './ElectricLogo.css';\r
\r
const BOLT = \`data:image/svg+xml;charset=utf-8,\${encodeURIComponent(\r
  '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><path d="M39 3 12 37h17l-4 24 27-34H35z" fill="#fff"/></svg>'\r
)}\`;\r
const RASTER = 560;\r
const CELL = 4;\r
const FAR = 1e20;\r
const ARCS = 5;\r
const PULSES = 3;\r
const PIXEL_BUDGET = 4e6;\r
\r
const hexToRgb = hex => {\r
  let h = String(hex || '').replace('#', '');\r
  if (h.length === 3) h = h.replace(/./g, c => c + c);\r
  const n = parseInt(h.slice(0, 6), 16);\r
  return Number.isNaN(n) ? [1, 1, 1] : [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];\r
};\r
\r
const transformLine = (f, d, v, z, n) => {\r
  let k = 0;\r
  v[0] = 0;\r
  z[0] = -FAR;\r
  z[1] = FAR;\r
  for (let q = 1; q < n; q++) {\r
    let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);\r
    while (s <= z[k]) {\r
      k--;\r
      s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);\r
    }\r
    k++;\r
    v[k] = q;\r
    z[k] = s;\r
    z[k + 1] = FAR;\r
  }\r
  k = 0;\r
  for (let q = 0; q < n; q++) {\r
    while (z[k + 1] < q) k++;\r
    d[q] = (q - v[k]) * (q - v[k]) + f[v[k]];\r
  }\r
};\r
\r
const transformGrid = (grid, w, h) => {\r
  const n = Math.max(w, h);\r
  const f = new Float64Array(n);\r
  const d = new Float64Array(n);\r
  const v = new Int32Array(n);\r
  const z = new Float64Array(n + 1);\r
  for (let x = 0; x < w; x++) {\r
    for (let y = 0; y < h; y++) f[y] = grid[y * w + x];\r
    transformLine(f, d, v, z, h);\r
    for (let y = 0; y < h; y++) grid[y * w + x] = d[y];\r
  }\r
  for (let y = 0; y < h; y++) {\r
    for (let x = 0; x < w; x++) f[x] = grid[y * w + x];\r
    transformLine(f, d, v, z, w);\r
    for (let x = 0; x < w; x++) grid[y * w + x] = d[x];\r
  }\r
};\r
\r
const blurLine = (src, dst, offset, stride, n, r) => {\r
  const scale = 1 / (2 * r + 1);\r
  let sum = 0;\r
  for (let i = 0; i <= r && i < n; i++) sum += src[offset + i * stride];\r
  for (let i = 0; i < n; i++) {\r
    dst[offset + i * stride] = sum * scale;\r
    if (i + r + 1 < n) sum += src[offset + (i + r + 1) * stride];\r
    if (i - r >= 0) sum -= src[offset + (i - r) * stride];\r
  }\r
};\r
\r
const blurGrid = (grid, w, h, r) => {\r
  const tmp = new Float32Array(w * h);\r
  for (let pass = 0; pass < 3; pass++) {\r
    for (let y = 0; y < h; y++) blurLine(grid, tmp, y * w, 1, w, r);\r
    for (let x = 0; x < w; x++) blurLine(tmp, grid, x, w, h, r);\r
  }\r
};\r
\r
const readCoverage = (data, w, h) => {\r
  const coverage = new Float32Array(w * h);\r
  let clear = 0;\r
  for (let i = 0; i < w * h; i++) if (data[i * 4 + 3] < 250) clear++;\r
  if (clear > w * h * 0.01) {\r
    for (let i = 0; i < w * h; i++) coverage[i] = data[i * 4 + 3] / 255;\r
    return coverage;\r
  }\r
  let r = 0;\r
  let g = 0;\r
  let b = 0;\r
  let n = 0;\r
  const sample = i => {\r
    r += data[i * 4];\r
    g += data[i * 4 + 1];\r
    b += data[i * 4 + 2];\r
    n++;\r
  };\r
  for (let x = 0; x < w; x++) {\r
    sample(x);\r
    sample((h - 1) * w + x);\r
  }\r
  for (let y = 0; y < h; y++) {\r
    sample(y * w);\r
    sample(y * w + w - 1);\r
  }\r
  r /= n;\r
  g /= n;\r
  b /= n;\r
  for (let i = 0; i < w * h; i++) {\r
    const diff = Math.max(Math.abs(data[i * 4] - r), Math.abs(data[i * 4 + 1] - g), Math.abs(data[i * 4 + 2] - b));\r
    coverage[i] = Math.min(1, Math.max(0, (diff - 24) / 48));\r
  }\r
  return coverage;\r
};\r
\r
const sampleField = (shape, x, y) => {\r
  const { field, width, height } = shape;\r
  const cx = Math.min(Math.max(x, 0.5), width - 0.5);\r
  const cy = Math.min(Math.max(y, 0.5), height - 0.5);\r
  const x0 = Math.min(Math.floor(cx - 0.5), width - 2);\r
  const y0 = Math.min(Math.floor(cy - 0.5), height - 2);\r
  const tx = cx - 0.5 - x0;\r
  const ty = cy - 0.5 - y0;\r
  const i = y0 * width + x0;\r
  const top = field[i] + (field[i + 1] - field[i]) * tx;\r
  const bottom = field[i + width] + (field[i + width + 1] - field[i + width]) * tx;\r
  return top + (bottom - top) * ty + Math.hypot(x - cx, y - cy);\r
};\r
\r
const traceShape = image => {\r
  const iw = image.naturalWidth || image.width;\r
  const ih = image.naturalHeight || image.height;\r
  if (!iw || !ih) return null;\r
  const fit = RASTER / Math.max(iw, ih);\r
  const w = Math.max(2, Math.round(iw * fit));\r
  const h = Math.max(2, Math.round(ih * fit));\r
  const canvas = document.createElement('canvas');\r
  canvas.width = w;\r
  canvas.height = h;\r
  const ctx = canvas.getContext('2d', { willReadFrequently: true });\r
  if (!ctx) return null;\r
  ctx.drawImage(image, 0, 0, w, h);\r
  const coverage = readCoverage(ctx.getImageData(0, 0, w, h).data, w, h);\r
\r
  let left = w;\r
  let top = h;\r
  let right = -1;\r
  let bottom = -1;\r
  for (let y = 0; y < h; y++) {\r
    for (let x = 0; x < w; x++) {\r
      if (coverage[y * w + x] <= 0.01) continue;\r
      if (x < left) left = x;\r
      if (x > right) right = x;\r
      if (y < top) top = y;\r
      if (y > bottom) bottom = y;\r
    }\r
  }\r
  if (right < 0) return null;\r
\r
  const logoWidth = right - left + 1;\r
  const logoHeight = bottom - top + 1;\r
  const pad = Math.ceil(Math.max(logoWidth, logoHeight) * 0.25) + 2;\r
  const width = logoWidth + pad * 2;\r
  const height = logoHeight + pad * 2;\r
  const outer = new Float32Array(width * height);\r
  const inner = new Float32Array(width * height);\r
  for (let y = 0; y < height; y++) {\r
    for (let x = 0; x < width; x++) {\r
      const sx = x - pad + left;\r
      const sy = y - pad + top;\r
      const a = sx >= 0 && sy >= 0 && sx < w && sy < h ? coverage[sy * w + sx] : 0;\r
      const i = y * width + x;\r
      if (a >= 1) {\r
        outer[i] = 0;\r
        inner[i] = FAR;\r
      } else if (a <= 0) {\r
        outer[i] = FAR;\r
        inner[i] = 0;\r
      } else {\r
        const e = 0.5 - a;\r
        outer[i] = e > 0 ? e * e : 0;\r
        inner[i] = e < 0 ? e * e : 0;\r
      }\r
    }\r
  }\r
  transformGrid(outer, width, height);\r
  transformGrid(inner, width, height);\r
\r
  const field = new Float32Array(width * height);\r
  for (let i = 0; i < width * height; i++) field[i] = Math.sqrt(outer[i]) - Math.sqrt(inner[i]);\r
\r
  const points = [];\r
  for (let y = 1; y < height - 1; y++) {\r
    for (let x = 1; x < width - 1; x++) {\r
      const i = y * width + x;\r
      const d = field[i];\r
      if (d > 0) continue;\r
      if (field[i - 1] <= 0 && field[i + 1] <= 0 && field[i - width] <= 0 && field[i + width] <= 0) continue;\r
      const gx = field[i + 1] - field[i - 1];\r
      const gy = field[i + width] - field[i - width];\r
      const len = Math.hypot(gx, gy) || 1;\r
      points.push(x + 0.5 - (d * gx) / len, y + 0.5 - (d * gy) / len);\r
    }\r
  }\r
  const stride = Math.max(1, Math.ceil(points.length / 2 / 3000)) * 2;\r
  const edges = [];\r
  for (let i = 0; i < points.length; i += stride) edges.push(points[i], points[i + 1]);\r
\r
  const size = Math.max(logoWidth, logoHeight);\r
  const glowPad = Math.ceil((size * 0.7) / CELL);\r
  const glowWidth = Math.ceil(logoWidth / CELL) + glowPad * 2;\r
  const glowHeight = Math.ceil(logoHeight / CELL) + glowPad * 2;\r
  const tight = new Float32Array(glowWidth * glowHeight);\r
  for (let y = 0; y < height; y++) {\r
    const gy = Math.floor((y - pad) / CELL) + glowPad;\r
    for (let x = 0; x < width; x++) {\r
      const gx = Math.floor((x - pad) / CELL) + glowPad;\r
      tight[gy * glowWidth + gx] += Math.exp(-Math.abs(field[y * width + x]) / 1.5) / (CELL * CELL);\r
    }\r
  }\r
  const wide = tight.slice();\r
  const tightRadius = Math.max(1, Math.round((size * 0.035) / CELL));\r
  const wideRadius = Math.max(2, Math.round((size * 0.13) / CELL));\r
  blurGrid(tight, glowWidth, glowHeight, tightRadius);\r
  blurGrid(wide, glowWidth, glowHeight, wideRadius);\r
  const tightNorm = (Math.sqrt(2 * Math.PI * (tightRadius * tightRadius + tightRadius)) * CELL) / 3;\r
  const wideNorm = (Math.sqrt(2 * Math.PI * (wideRadius * wideRadius + wideRadius)) * CELL) / 3;\r
  const glow = new Float32Array(glowWidth * glowHeight * 2);\r
  for (let i = 0; i < glowWidth * glowHeight; i++) {\r
    glow[i * 2] = tight[i] * tightNorm;\r
    glow[i * 2 + 1] = wide[i] * wideNorm;\r
  }\r
\r
  return {\r
    field,\r
    edges,\r
    width,\r
    height,\r
    pad,\r
    logoWidth,\r
    logoHeight,\r
    glow,\r
    glowWidth,\r
    glowHeight,\r
    glowOffset: pad - glowPad * CELL\r
  };\r
};\r
\r
const spawnArc = (shape, time, focus) => {\r
  const { edges, logoWidth, logoHeight } = shape;\r
  const count = edges.length / 2;\r
  if (count < 2) return null;\r
  const size = Math.max(logoWidth, logoHeight);\r
  let i = Math.floor(Math.random() * count);\r
  if (focus) {\r
    let found = false;\r
    for (let attempt = 0; attempt < 40 && !found; attempt++) {\r
      const j = Math.floor(Math.random() * count);\r
      if (Math.hypot(edges[j * 2] - focus.x, edges[j * 2 + 1] - focus.y) < focus.radius) {\r
        i = j;\r
        found = true;\r
      }\r
    }\r
    if (!found) return null;\r
  }\r
  const ax = edges[i * 2];\r
  const ay = edges[i * 2 + 1];\r
  for (let attempt = 0; attempt < 24; attempt++) {\r
    const j = Math.floor(Math.random() * count);\r
    const bx = edges[j * 2];\r
    const by = edges[j * 2 + 1];\r
    const len = Math.hypot(bx - ax, by - ay);\r
    if (len < size * 0.08 || len > size * 0.3) continue;\r
    const nx = -(by - ay) / len;\r
    const ny = (bx - ax) / len;\r
    const bow = len * (0.2 + Math.random() * 0.3);\r
    const mx = (ax + bx) / 2;\r
    const my = (ay + by) / 2;\r
    const left = sampleField(shape, mx + nx * bow, my + ny * bow);\r
    const right = sampleField(shape, mx - nx * bow, my - ny * bow);\r
    if (Math.max(left, right) <= 0) continue;\r
    return {\r
      ax,\r
      ay,\r
      bx,\r
      by,\r
      bow: left >= right ? bow : -bow,\r
      seed: 1 + Math.random() * 60,\r
      born: time,\r
      life: 0.35 + Math.random() * 0.45\r
    };\r
  }\r
  return null;\r
};\r
\r
const vertex = \`#version 300 es\r
in vec2 position;\r
in vec2 uv;\r
out vec2 vUv;\r
void main() {\r
  vUv = uv;\r
  gl_Position = vec4(position, 0.0, 1.0);\r
}\r
\`;\r
\r
const fragment = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
\r
uniform sampler2D tFieldFrom;\r
uniform sampler2D tGlowFrom;\r
uniform sampler2D tFieldTo;\r
uniform sampler2D tGlowTo;\r
uniform vec4 uMapFrom;\r
uniform vec4 uSizeFrom;\r
uniform vec4 uMapTo;\r
uniform vec4 uSizeTo;\r
uniform float uMorph;\r
uniform vec2 uResolution;\r
uniform float uUnit;\r
uniform float uTime;\r
uniform float uPresence;\r
uniform vec3 uHover;\r
uniform float uHoverRadius;\r
uniform vec4 uPulses[\${PULSES}];\r
uniform float uPulseBoost;\r
uniform float uFlash;\r
uniform vec3 uColor;\r
uniform vec3 uGlowColor;\r
uniform float uIntensity;\r
uniform float uGlow;\r
uniform float uThickness;\r
uniform float uStrands;\r
uniform float uBend;\r
uniform float uCrackle;\r
uniform float uFlicker;\r
uniform float uFill;\r
uniform float uInk;\r
uniform vec4 uArcEnds[\${ARCS}];\r
uniform vec4 uArcShape[\${ARCS}];\r
\r
in vec2 vUv;\r
out vec4 fragColor;\r
\r
uint scramble(uint x) {\r
  x ^= x >> 16u;\r
  x *= 0x7feb352du;\r
  x ^= x >> 15u;\r
  x *= 0x846ca68bu;\r
  x ^= x >> 16u;\r
  return x;\r
}\r
\r
float fieldAt(sampler2D tex, vec4 map, vec4 size, vec2 p) {\r
  vec2 f = (p - map.xy) / map.z;\r
  vec2 c = clamp(f, vec2(0.5), size.xy - 0.5);\r
  return (textureLod(tex, c / size.xy, 0.0).r + length(f - c)) * map.z;\r
}\r
\r
vec2 glowAt(sampler2D tex, vec4 map, vec4 size, vec2 p) {\r
  vec2 f = (p - map.xy) / map.z - map.w;\r
  return textureLod(tex, f / (size.zw * \${CELL}.0), 0.0).rg;\r
}\r
\r
float shape(vec2 p, float k) {\r
  float to = fieldAt(tFieldTo, uMapTo, uSizeTo, p);\r
  if (k >= 1.0) return to;\r
  return mix(fieldAt(tFieldFrom, uMapFrom, uSizeFrom, p), to, k);\r
}\r
\r
vec2 aura(vec2 p, float k) {\r
  vec2 to = glowAt(tGlowTo, uMapTo, uSizeTo, p);\r
  if (k >= 1.0) return to;\r
  return mix(glowAt(tGlowFrom, uMapFrom, uSizeFrom, p), to, k);\r
}\r
\r
vec4 corner(ivec2 c, uint seed) {\r
  uint h = scramble(uint(c.x) * 0x8da6b343u + uint(c.y) * 0xd8163841u + seed * 0xcb1ab31fu);\r
  return vec4(uvec4(h, h >> 8u, h >> 16u, h >> 24u) & 255u) / 127.5 - 1.0;\r
}\r
\r
vec2 drift(vec2 p, uint seed, out mat2 jac) {\r
  vec2 i = floor(p);\r
  vec2 f = p - i;\r
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);\r
  vec2 du = 30.0 * f * f * (f * (f - 2.0) + 1.0);\r
  ivec2 c = ivec2(i);\r
  vec4 ga = corner(c, seed);\r
  vec4 gb = corner(c + ivec2(1, 0), seed);\r
  vec4 gc = corner(c + ivec2(0, 1), seed);\r
  vec4 gd = corner(c + ivec2(1, 1), seed);\r
  vec2 fb = f - vec2(1.0, 0.0);\r
  vec2 fc = f - vec2(0.0, 1.0);\r
  vec2 fd = f - vec2(1.0);\r
  vec2 va = vec2(dot(ga.xy, f), dot(ga.zw, f));\r
  vec2 vb = vec2(dot(gb.xy, fb), dot(gb.zw, fb));\r
  vec2 vc = vec2(dot(gc.xy, fc), dot(gc.zw, fc));\r
  vec2 vd = vec2(dot(gd.xy, fd), dot(gd.zw, fd));\r
  vec2 k = va - vb - vc + vd;\r
  vec4 g = ga + u.x * (gb - ga) + u.y * (gc - ga) + u.x * u.y * (ga - gb - gc + gd);\r
  jac = mat2(\r
    g.xy + du * (u.yx * k.x + vec2(vb.x - va.x, vc.x - va.x)),\r
    g.zw + du * (u.yx * k.y + vec2(vb.y - va.y, vc.y - va.y))\r
  );\r
  return va + u.x * (vb - va) + u.y * (vc - va) + u.x * u.y * k;\r
}\r
\r
float wobble(vec2 p, uint seed) {\r
  mat2 jac;\r
  return drift(p, seed, jac).x;\r
}\r
\r
vec2 ripple(vec2 p, out float surge) {\r
  vec2 push = vec2(0.0);\r
  surge = 0.0;\r
  float width = uUnit * 10.0;\r
  for (int i = 0; i < \${PULSES}; i++) {\r
    vec4 pulse = uPulses[i];\r
    if (pulse.w <= 0.0) continue;\r
    vec2 d = p - pulse.xy;\r
    float dist = length(d);\r
    float front = (dist - pulse.z * uUnit * 150.0) / width;\r
    float env = exp(-front * front) * pulse.w * exp(-pulse.z * 1.7) * smoothstep(0.0, uUnit * 8.0, dist);\r
    push += d / max(dist, 1.0) * env * cos(front * 2.2) * uUnit * 7.5;\r
    surge += env;\r
  }\r
  return push;\r
}\r
\r
vec2 wander(vec2 p, float t, uint seed, float reachScale, out mat2 jac, out vec2 sway) {\r
  vec2 q = p / uUnit;\r
  mat2 ja;\r
  mat2 jb;\r
  mat2 jc;\r
  mat2 jd;\r
  vec2 a = drift(q * 0.028 + vec2(t * 0.29, t * 0.21), seed, ja);\r
  vec2 b = drift(q * 0.085 + a * 0.4 + vec2(t * 0.83, -t * 0.61) + 17.0, seed + 1u, jb);\r
  vec2 c = drift(p / 9.0 + b * 0.6 + vec2(t * 1.9, t * 1.3) + 5.0, seed + 2u, jc);\r
  vec2 d = drift(p / 4.1 + vec2(-t * 2.7, t * 2.2) + 11.0, seed + 3u, jd);\r
  float bendAmp = uBend * 8.0 * reachScale;\r
  float rippleAmp = uBend * 3.2 * reachScale;\r
  float crinkleAmp = uCrackle * 1.5 * reachScale;\r
  jac = ja * (0.028 * bendAmp) + jb * (0.085 * rippleAmp) + jc * (crinkleAmp / 9.0) + jd * (crinkleAmp * 0.35 / 4.1);\r
  sway = (a * bendAmp + b * rippleAmp) * uUnit;\r
  return sway + (c + d * 0.35) * crinkleAmp;\r
}\r
\r
vec2 glowShape(float line, float spread, float w) {\r
  float x = abs(line);\r
  float y = abs(spread);\r
  return vec2(exp(-x * x / (w * w * 0.5)) + exp(-y / (w * 2.2)) * 0.6, exp(-y / (w * 4.5)) * 0.5);\r
}\r
\r
void addArc(vec2 p, vec4 ends, vec4 info, float t, inout vec3 light, inout float energy, inout float hot) {\r
  if (info.y < 0.002) return;\r
  vec2 ab = ends.zw - ends.xy;\r
  float len = max(length(ab), 1.0);\r
  vec2 dir = ab / len;\r
  vec2 rel = p - ends.xy;\r
  float s = dot(rel, dir);\r
  float h = dot(rel, vec2(-dir.y, dir.x));\r
  float margin = abs(info.x) + uCrackle * (2.0 + len * 0.08) + uThickness * 12.0 + 10.0;\r
  if (s < -margin || s > len + margin || abs(h) > margin) return;\r
  float u = clamp(s / len, 0.0, 1.0);\r
  float taper = sin(3.14159265 * u);\r
  float bendSlope = s > 0.0 && s < len ? 3.14159265 / len * cos(3.14159265 * u) : 0.0;\r
  float beyond = max(-s, 0.0) + max(s - len, 0.0);\r
  for (int c = 0; c < 2; c++) {\r
    uint seed = uint(info.z * 131.0) + uint(c) * 29u + 7u;\r
    float jag = 0.0;\r
    float jagSlope = 0.0;\r
    float wave = max(len * 0.3, 14.0);\r
    float weight = uCrackle * (1.5 + len * 0.05) * (c == 0 ? 1.0 : 1.5);\r
    for (int o = 0; o < 3; o++) {\r
      mat2 jac;\r
      float n = drift(vec2(s / wave + info.z * 3.0, t * (1.4 + float(o) * 1.1)), seed + uint(o), jac).x;\r
      jag += n * weight;\r
      jagSlope += jac[0].x * weight / wave;\r
      wave *= 0.42;\r
      weight *= 0.4;\r
    }\r
    float offset = (info.x + jag) * taper;\r
    float offsetSlope = (info.x + jag) * bendSlope + jagSlope * taper;\r
    float across = (h - offset) / sqrt(1.0 + offsetSlope * offsetSlope);\r
    float gap = length(vec2(beyond, across));\r
    float w = uThickness * (c == 0 ? 0.9 : 0.6);\r
    vec2 g = glowShape(gap, gap, w);\r
    float k = info.y * (c == 0 ? 1.0 : 0.45);\r
    light += (uColor * g.x + uGlowColor * g.y * uGlow) * k;\r
    energy += (g.x + g.y * uGlow) * k;\r
    hot += exp(-gap * gap / (w * w * 0.16)) * k * (c == 0 ? 1.0 : 0.0);\r
  }\r
}\r
\r
void main() {\r
  vec2 p = vec2(vUv.x, 1.0 - vUv.y) * uResolution;\r
  float t = uTime;\r
  vec3 light = vec3(0.0);\r
  float energy = 0.0;\r
  float hot = 0.0;\r
\r
  float surge;\r
  vec2 pr = p - ripple(p, surge);\r
  float k = uMorph >= 1.0 ? 1.0 : smoothstep(0.0, 1.0, clamp(uMorph * 1.7 - 0.35 + 0.35 * wobble(p / uUnit * 0.018, 41u), 0.0, 1.0));\r
  float transit = uMorph >= 1.0 ? 0.0 : sin(3.14159265 * uMorph);\r
  float base = shape(pr, k);\r
\r
  vec2 toHover = p - uHover.xy;\r
  float heat = min(uHover.z * exp(-dot(toHover, toHover) / (uHoverRadius * uHoverRadius)) + surge * 1.4 + transit * 0.5, 2.0);\r
  float heatCap = min(uHover.z + uPulseBoost * 1.4 + transit * 0.5, 2.0);\r
  float breath = 1.0 + uFlicker * 0.6 * wobble(vec2(t * 2.1, 7.0), 3u);\r
  float grow = uPresence;\r
\r
  float edge = abs(base);\r
  vec2 halo = aura(pr, k);\r
  float ink = uInk;\r
  float bloom = (halo.x * 0.16 + halo.y * 0.08) * (1.0 - ink * 0.65) * uGlow * (1.0 + heat * 1.2);\r
  float body = smoothstep(0.75, -0.75, base) * uFill * (0.06 + 1.2 * min(halo.x, 1.0)) * (1.0 + heat * 0.5);\r
  light += uGlowColor * bloom * grow * grow;\r
  energy += bloom * grow * grow;\r
\r
  float reachScale = mix(0.15, 1.0, grow) * (1.0 + heat * 0.9);\r
  float reach = (uUnit * uBend * 16.0 + uCrackle * 3.0) * (1.0 + heatCap * 0.9) + uThickness * 20.0 + 8.0;\r
  if (edge < reach && grow > 0.0) {\r
    float fade = smoothstep(reach, reach * 0.55, edge);\r
    vec2 q = pr / uUnit;\r
    float count = min(uStrands + heat * 2.5, 6.0);\r
    float limit = min(uStrands + heatCap * 2.5, 6.0);\r
    for (int i = 0; i < 6; i++) {\r
      float fi = float(i);\r
      if (fi >= limit) break;\r
      float present = clamp(count - fi, 0.0, 1.0);\r
      if (present <= 0.0) continue;\r
      uint seed = uint(i) * 7u + 3u;\r
      mat2 jac;\r
      vec2 sway;\r
      float lead = i == 0 ? 1.0 : 0.0;\r
      vec2 warped = pr + wander(pr, t * (1.0 + fi * 0.19), seed, reachScale * mix(0.6 + fi * 0.2, 0.7, lead), jac, sway);\r
      float dw = shape(warped, k);\r
      vec2 slope = vec2(shape(warped + vec2(1.0, 0.0), k), shape(warped + vec2(0.0, 1.0), k)) - dw;\r
      float d = dw / max(length(slope + jac * slope), 0.3);\r
      float spread = shape(pr + sway, k);\r
      float swell = 0.5 + 0.5 * wobble(q * 0.06 + vec2(t * 0.9, fi * 5.1 - t * 0.6), seed + 8u);\r
      float w = uThickness * mix(0.5, 1.0, lead) * (0.5 + swell);\r
      float vis = mix(0.3 + 0.45 * smoothstep(-0.25, 0.2, wobble(q * 0.035 + vec2(t * 0.21, fi * 3.7), seed + 5u)), 1.0, lead);\r
      float spark = 1.0 - uFlicker * 0.3 * (0.5 + 0.5 * wobble(vec2(t * 6.0, fi * 2.3), seed + 6u));\r
      float weight = max(vis, heat * 0.85) * spark * fade * present * (0.7 + 0.6 * swell);\r
      vec2 g = glowShape(d, spread, w) * weight;\r
      float soft = mix(1.0, mix(0.5, 1.0, lead), ink);\r
      vec3 stroke = mix(uColor, uGlowColor, ink * (1.0 - lead) * 0.65);\r
      float haze = uGlow * (1.0 + heat) * (1.0 - ink * 0.7);\r
      light += stroke * g.x * soft + uGlowColor * g.y * haze;\r
      energy += g.x * soft + g.y * haze;\r
      hot += exp(-d * d / (w * w * 0.16)) * lead * weight;\r
    }\r
    light *= grow;\r
    energy *= grow;\r
  }\r
\r
  for (int i = 0; i < \${ARCS}; i++) addArc(pr, uArcEnds[i], uArcShape[i], t, light, energy, hot);\r
\r
  float gain = uIntensity * breath * (1.0 + heat * 0.45) * (1.0 + uFlash * 0.3) * 1.4;\r
  float alpha = 1.0 - exp(-energy * gain);\r
  vec3 color = mix(1.0 - exp(-light * gain), alpha * light / max(energy, 1e-4), ink);\r
  color = mix(color, vec3(alpha), clamp(hot * grow, 0.0, 1.0) * ink * 0.85);\r
  float tint = (1.0 - exp(-body * gain * 1.2)) * grow * grow * (1.0 - ink * 0.82);\r
  color += uGlowColor * tint * (1.0 - alpha);\r
  alpha += tint * (1.0 - alpha);\r
  float grain = (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;\r
  alpha = clamp(alpha + grain, 0.0, 1.0);\r
  fragColor = vec4(clamp(color + grain, 0.0, alpha), alpha);\r
}\r
\`;\r
\r
const ElectricLogo = ({\r
  src = BOLT,\r
  color = '#ecc7ff',\r
  glowColor = '#ad6dff',\r
  scale = 0.7,\r
  intensity = 1,\r
  glow = 1,\r
  thickness = 1.5,\r
  strands = 4,\r
  bend = 0.6,\r
  crackle = 1.5,\r
  arcs = 1,\r
  flicker = 0.6,\r
  fill = 0,\r
  speed = 2.5,\r
  interactive = true,\r
  cursorIntensity = 0.75,\r
  cursorRadius = 100,\r
  theme = 'dark',\r
  onRender,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const settingsRef = useRef(null);\r
  const shapeRef = useRef(null);\r
\r
  useEffect(() => {\r
    settingsRef.current = {\r
      color,\r
      glowColor,\r
      scale,\r
      intensity,\r
      glow,\r
      thickness,\r
      strands,\r
      bend,\r
      crackle,\r
      arcs,\r
      flicker,\r
      fill,\r
      speed,\r
      interactive,\r
      cursorIntensity,\r
      cursorRadius,\r
      theme,\r
      onRender\r
    };\r
  });\r
\r
  useEffect(() => {\r
    let alive = true;\r
    const image = new Image();\r
    image.crossOrigin = 'anonymous';\r
    image.decoding = 'async';\r
    image.onload = () => {\r
      if (!alive) return;\r
      let traced = null;\r
      try {\r
        traced = traceShape(image);\r
      } catch {\r
        traced = null;\r
      }\r
      if (traced) shapeRef.current = traced;\r
    };\r
    image.src = src || BOLT;\r
    return () => {\r
      alive = false;\r
      image.onload = null;\r
    };\r
  }, [src]);\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    if (!container) return undefined;\r
\r
    const renderer = new Renderer({\r
      dpr: Math.min(window.devicePixelRatio || 1, 2),\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false\r
    });\r
    const gl = renderer.gl;\r
    if (!renderer.isWebgl2) {\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
      return undefined;\r
    }\r
    gl.clearColor(0, 0, 0, 0);\r
    const canvas = gl.canvas;\r
    canvas.style.display = 'block';\r
    canvas.style.width = '100%';\r
    canvas.style.height = '100%';\r
    container.appendChild(canvas);\r
\r
    const makeSlot = () => ({\r
      shape: null,\r
      field: new Texture(gl, {\r
        image: new Float32Array([1000]),\r
        width: 1,\r
        height: 1,\r
        internalFormat: gl.R16F,\r
        format: gl.RED,\r
        type: gl.FLOAT,\r
        minFilter: gl.LINEAR,\r
        magFilter: gl.LINEAR,\r
        generateMipmaps: false,\r
        flipY: false,\r
        unpackAlignment: 1\r
      }),\r
      glow: new Texture(gl, {\r
        image: new Float32Array([0, 0]),\r
        width: 1,\r
        height: 1,\r
        internalFormat: gl.RG16F,\r
        format: gl.RG,\r
        type: gl.FLOAT,\r
        minFilter: gl.LINEAR,\r
        magFilter: gl.LINEAR,\r
        generateMipmaps: false,\r
        flipY: false,\r
        unpackAlignment: 1\r
      })\r
    });\r
    const slots = [makeSlot(), makeSlot()];\r
\r
    const arcEnds = Array.from({ length: ARCS * 4 }, () => 0);\r
    const arcShape = Array.from({ length: ARCS * 4 }, () => 0);\r
    const pulseData = Array.from({ length: PULSES * 4 }, () => 0);\r
    const uniforms = {\r
      tFieldFrom: { value: slots[1].field },\r
      tGlowFrom: { value: slots[1].glow },\r
      tFieldTo: { value: slots[0].field },\r
      tGlowTo: { value: slots[0].glow },\r
      uMapFrom: { value: [0, 0, 1, 0] },\r
      uSizeFrom: { value: [1, 1, 1, 1] },\r
      uMapTo: { value: [0, 0, 1, 0] },\r
      uSizeTo: { value: [1, 1, 1, 1] },\r
      uMorph: { value: 1 },\r
      uResolution: { value: [1, 1] },\r
      uUnit: { value: 1 },\r
      uTime: { value: 0 },\r
      uPresence: { value: 0 },\r
      uHover: { value: [0, 0, 0] },\r
      uHoverRadius: { value: 120 },\r
      uPulses: { value: pulseData },\r
      uPulseBoost: { value: 0 },\r
      uFlash: { value: 0 },\r
      uColor: { value: [1, 1, 1] },\r
      uGlowColor: { value: [0.43, 0.48, 1] },\r
      uIntensity: { value: 1 },\r
      uGlow: { value: 1 },\r
      uThickness: { value: 1.8 },\r
      uStrands: { value: 3 },\r
      uBend: { value: 1 },\r
      uCrackle: { value: 1 },\r
      uFlicker: { value: 0.4 },\r
      uFill: { value: 0.5 },\r
      uInk: { value: 0 },\r
      uArcEnds: { value: arcEnds },\r
      uArcShape: { value: arcShape }\r
    };\r
    const mesh = new Mesh(gl, {\r
      geometry: new Triangle(gl),\r
      program: new Program(gl, { vertex, fragment, uniforms, depthTest: false, depthWrite: false })\r
    });\r
\r
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const pointer = { x: 0, y: 0, over: false };\r
    const hover = { x: 0, y: 0, vx: 0, vy: 0, power: 0 };\r
    const sparks = [];\r
    const pulses = [];\r
    let target = 0;\r
    let pending = null;\r
    let morph = 1;\r
    let burst = null;\r
    let progress = 0;\r
    let ink = 0;\r
    const hues = [\r
      [1, 1, 1],\r
      [1, 1, 1]\r
    ];\r
    let settled = false;\r
    let time = 0;\r
    let width = 1;\r
    let height = 1;\r
    let raf = 0;\r
    let last = performance.now();\r
    let visible = true;\r
\r
    const load = (slot, next) => {\r
      slot.shape = next;\r
      slot.field.image = next.field;\r
      slot.field.width = next.width;\r
      slot.field.height = next.height;\r
      slot.field.needsUpdate = true;\r
      slot.glow.image = next.glow;\r
      slot.glow.width = next.glowWidth;\r
      slot.glow.height = next.glowHeight;\r
      slot.glow.needsUpdate = true;\r
    };\r
\r
    const place = (shape, s) => {\r
      const fit = Math.max(1e-4, Math.min((width * s.scale) / shape.logoWidth, (height * s.scale) / shape.logoHeight));\r
      return {\r
        fit,\r
        ox: width / 2 - (shape.pad + shape.logoWidth / 2) * fit,\r
        oy: height / 2 - (shape.pad + shape.logoHeight / 2) * fit,\r
        unit: (Math.max(shape.logoWidth, shape.logoHeight) * fit) / 100\r
      };\r
    };\r
\r
    const resize = () => {\r
      width = Math.max(1, container.clientWidth);\r
      height = Math.max(1, container.clientHeight);\r
      renderer.dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(PIXEL_BUDGET / (width * height)));\r
      renderer.setSize(width, height);\r
      uniforms.uResolution.value = [width, height];\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      const s = settingsRef.current;\r
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));\r
      last = now;\r
\r
      const incoming = shapeRef.current;\r
      if (incoming && incoming !== slots[target].shape) pending = incoming;\r
      if (pending && morph >= 1) {\r
        if (slots[target].shape) {\r
          target = 1 - target;\r
          morph = 0;\r
          sparks.length = 0;\r
        }\r
        load(slots[target], pending);\r
        pending = null;\r
      }\r
      if (morph < 1) morph = Math.min(1, morph + dt / (pending ? 0.3 : 1.6));\r
\r
      const to = slots[target].shape;\r
      const from = morph < 1 ? slots[1 - target].shape : null;\r
      if (to) progress = Math.min(1, progress + dt / 1.4);\r
      const presence = progress * progress * (3 - 2 * progress);\r
\r
      if (to && s) {\r
        const near = place(to, s);\r
        const far = from ? place(from, s) : near;\r
        const blend = morph * morph * (3 - 2 * morph);\r
        const unit = far.unit + (near.unit - far.unit) * blend;\r
\r
        const engaged = s.interactive && pointer.over;\r
        if (engaged && hover.power < 0.01) {\r
          hover.x = pointer.x;\r
          hover.y = pointer.y;\r
          hover.vx = 0;\r
          hover.vy = 0;\r
        }\r
        hover.vx += ((pointer.x - hover.x) * 120 - hover.vx * 19) * dt;\r
        hover.vy += ((pointer.y - hover.y) * 120 - hover.vy * 19) * dt;\r
        hover.x += hover.vx * dt;\r
        hover.y += hover.vy * dt;\r
        hover.power += ((engaged ? 1 : 0) - hover.power) * (1 - Math.exp(-dt / (engaged ? 0.3 : 0.55)));\r
\r
        const motion = reducedMotion ? 0.2 : 1;\r
        time += dt * s.speed * motion;\r
\r
        for (let i = sparks.length - 1; i >= 0; i--) {\r
          if (time - sparks[i].born > sparks[i].life) sparks.splice(i, 1);\r
        }\r
        const focus = spot => ({\r
          x: (spot.x - near.ox) / near.fit,\r
          y: (spot.y - near.oy) / near.fit,\r
          radius: Math.max(1, s.cursorRadius) / near.fit\r
        });\r
        if (burst && morph >= 1 && s.arcs > 0) {\r
          for (let i = 0; i < 3 && sparks.length < ARCS; i++) {\r
            const spark = spawnArc(to, time, focus(burst));\r
            if (spark) sparks.push(spark);\r
          }\r
        }\r
        burst = null;\r
        if (!reducedMotion && presence > 0.8 && morph >= 1 && sparks.length < ARCS) {\r
          const chance = dt * s.speed * s.arcs;\r
          if (Math.random() < chance * 6 * hover.power * s.cursorIntensity) {\r
            const spark = spawnArc(to, time, focus(hover));\r
            if (spark) sparks.push(spark);\r
          } else if (Math.random() < chance * 2.2) {\r
            const spark = spawnArc(to, time, null);\r
            if (spark) sparks.push(spark);\r
          }\r
        }\r
\r
        for (let i = 0; i < ARCS; i++) {\r
          const o = i * 4;\r
          const spark = sparks[i];\r
          if (!spark) {\r
            arcShape[o + 1] = 0;\r
            continue;\r
          }\r
          const k = (time - spark.born) / spark.life;\r
          arcEnds[o] = near.ox + spark.ax * near.fit;\r
          arcEnds[o + 1] = near.oy + spark.ay * near.fit;\r
          arcEnds[o + 2] = near.ox + spark.bx * near.fit;\r
          arcEnds[o + 3] = near.oy + spark.by * near.fit;\r
          arcShape[o] = spark.bow * near.fit;\r
          arcShape[o + 1] = Math.sin(Math.PI * Math.min(1, Math.max(0, k))) * presence;\r
          arcShape[o + 2] = spark.seed;\r
        }\r
\r
        let boost = 0;\r
        let flash = 0;\r
        for (let i = pulses.length - 1; i >= 0; i--) {\r
          if ((now - pulses[i].born) / 1000 > 2) pulses.splice(i, 1);\r
        }\r
        for (let i = 0; i < PULSES; i++) {\r
          const o = i * 4;\r
          const pulse = pulses[i];\r
          if (!pulse) {\r
            pulseData[o + 3] = 0;\r
            continue;\r
          }\r
          const age = (now - pulse.born) / 1000;\r
          pulseData[o] = pulse.x;\r
          pulseData[o + 1] = pulse.y;\r
          pulseData[o + 2] = age;\r
          pulseData[o + 3] = 1;\r
          boost = Math.max(boost, Math.exp(-age * 1.7));\r
          flash += Math.exp(-age * 7);\r
        }\r
\r
        const fromSlot = slots[1 - target];\r
        uniforms.tFieldTo.value = slots[target].field;\r
        uniforms.tGlowTo.value = slots[target].glow;\r
        uniforms.tFieldFrom.value = fromSlot.field;\r
        uniforms.tGlowFrom.value = fromSlot.glow;\r
        uniforms.uMapTo.value = [near.ox, near.oy, near.fit, to.glowOffset];\r
        uniforms.uSizeTo.value = [to.width, to.height, to.glowWidth, to.glowHeight];\r
        if (from) {\r
          uniforms.uMapFrom.value = [far.ox, far.oy, far.fit, from.glowOffset];\r
          uniforms.uSizeFrom.value = [from.width, from.height, from.glowWidth, from.glowHeight];\r
        }\r
        uniforms.uMorph.value = morph;\r
        uniforms.uUnit.value = unit;\r
        uniforms.uTime.value = time;\r
        uniforms.uPresence.value = presence;\r
        uniforms.uHover.value = [hover.x, hover.y, hover.power * Math.max(0, s.cursorIntensity)];\r
        uniforms.uHoverRadius.value = Math.max(1, s.cursorRadius);\r
        uniforms.uPulseBoost.value = boost;\r
        uniforms.uFlash.value = flash;\r
        const targets = [hexToRgb(s.color), hexToRgb(s.glowColor)];\r
        const shift = settled ? 1 - Math.exp(-dt / 0.35) : 1;\r
        settled = true;\r
        for (let i = 0; i < 2; i++) {\r
          for (let c = 0; c < 3; c++) hues[i][c] += (targets[i][c] - hues[i][c]) * shift;\r
        }\r
        uniforms.uColor.value = hues[0].slice();\r
        uniforms.uGlowColor.value = hues[1].slice();\r
        uniforms.uIntensity.value = s.intensity;\r
        uniforms.uGlow.value = s.glow;\r
        uniforms.uThickness.value = s.thickness;\r
        uniforms.uStrands.value = Math.max(1, Math.min(6, Math.round(s.strands)));\r
        uniforms.uBend.value = s.bend;\r
        uniforms.uCrackle.value = s.crackle;\r
        uniforms.uFlicker.value = reducedMotion ? 0 : s.flicker;\r
        ink += ((s.theme === 'light' ? 1 : 0) - ink) * (1 - Math.exp(-dt / 0.25));\r
        uniforms.uFill.value = s.fill;\r
        uniforms.uInk.value = ink;\r
        renderer.render({ scene: mesh });\r
        s.onRender?.(canvas);\r
      }\r
\r
      if (visible) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const start = () => {\r
      if (raf || !visible) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const onMove = e => {\r
      const rect = container.getBoundingClientRect();\r
      pointer.x = e.clientX - rect.left;\r
      pointer.y = e.clientY - rect.top;\r
      pointer.over = true;\r
    };\r
    const onDown = e => {\r
      onMove(e);\r
      if (!settingsRef.current?.interactive || reducedMotion) return;\r
      pulses.push({ x: pointer.x, y: pointer.y, born: performance.now() });\r
      if (pulses.length > PULSES) pulses.shift();\r
      burst = { x: pointer.x, y: pointer.y };\r
    };\r
    const onLeave = () => {\r
      pointer.over = false;\r
    };\r
    container.addEventListener('pointermove', onMove);\r
    container.addEventListener('pointerdown', onDown);\r
    container.addEventListener('pointerleave', onLeave);\r
    container.addEventListener('pointercancel', onLeave);\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(container);\r
    const intersectionObserver = new IntersectionObserver(([entry]) => {\r
      visible = entry.isIntersecting;\r
      start();\r
    });\r
    intersectionObserver.observe(container);\r
\r
    resize();\r
    start();\r
\r
    return () => {\r
      visible = false;\r
      cancelAnimationFrame(raf);\r
      resizeObserver.disconnect();\r
      intersectionObserver.disconnect();\r
      container.removeEventListener('pointermove', onMove);\r
      container.removeEventListener('pointerdown', onDown);\r
      container.removeEventListener('pointerleave', onLeave);\r
      container.removeEventListener('pointercancel', onLeave);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);\r
    };\r
  }, []);\r
\r
  return <div ref={containerRef} className={\`electric-logo \${className}\`.trim()} style={style} />;\r
};\r
\r
export default ElectricLogo;\r
`,n=`.electric-logo {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
`,e=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
import { Renderer, Program, Mesh, Triangle, Texture } from 'ogl';\r
\r
const BOLT = \`data:image/svg+xml;charset=utf-8,\${encodeURIComponent(\r
  '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><path d="M39 3 12 37h17l-4 24 27-34H35z" fill="#fff"/></svg>'\r
)}\`;\r
const RASTER = 560;\r
const CELL = 4;\r
const FAR = 1e20;\r
const ARCS = 5;\r
const PULSES = 3;\r
const PIXEL_BUDGET = 4e6;\r
\r
const hexToRgb = hex => {\r
  let h = String(hex || '').replace('#', '');\r
  if (h.length === 3) h = h.replace(/./g, c => c + c);\r
  const n = parseInt(h.slice(0, 6), 16);\r
  return Number.isNaN(n) ? [1, 1, 1] : [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];\r
};\r
\r
const transformLine = (f, d, v, z, n) => {\r
  let k = 0;\r
  v[0] = 0;\r
  z[0] = -FAR;\r
  z[1] = FAR;\r
  for (let q = 1; q < n; q++) {\r
    let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);\r
    while (s <= z[k]) {\r
      k--;\r
      s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);\r
    }\r
    k++;\r
    v[k] = q;\r
    z[k] = s;\r
    z[k + 1] = FAR;\r
  }\r
  k = 0;\r
  for (let q = 0; q < n; q++) {\r
    while (z[k + 1] < q) k++;\r
    d[q] = (q - v[k]) * (q - v[k]) + f[v[k]];\r
  }\r
};\r
\r
const transformGrid = (grid, w, h) => {\r
  const n = Math.max(w, h);\r
  const f = new Float64Array(n);\r
  const d = new Float64Array(n);\r
  const v = new Int32Array(n);\r
  const z = new Float64Array(n + 1);\r
  for (let x = 0; x < w; x++) {\r
    for (let y = 0; y < h; y++) f[y] = grid[y * w + x];\r
    transformLine(f, d, v, z, h);\r
    for (let y = 0; y < h; y++) grid[y * w + x] = d[y];\r
  }\r
  for (let y = 0; y < h; y++) {\r
    for (let x = 0; x < w; x++) f[x] = grid[y * w + x];\r
    transformLine(f, d, v, z, w);\r
    for (let x = 0; x < w; x++) grid[y * w + x] = d[x];\r
  }\r
};\r
\r
const blurLine = (src, dst, offset, stride, n, r) => {\r
  const scale = 1 / (2 * r + 1);\r
  let sum = 0;\r
  for (let i = 0; i <= r && i < n; i++) sum += src[offset + i * stride];\r
  for (let i = 0; i < n; i++) {\r
    dst[offset + i * stride] = sum * scale;\r
    if (i + r + 1 < n) sum += src[offset + (i + r + 1) * stride];\r
    if (i - r >= 0) sum -= src[offset + (i - r) * stride];\r
  }\r
};\r
\r
const blurGrid = (grid, w, h, r) => {\r
  const tmp = new Float32Array(w * h);\r
  for (let pass = 0; pass < 3; pass++) {\r
    for (let y = 0; y < h; y++) blurLine(grid, tmp, y * w, 1, w, r);\r
    for (let x = 0; x < w; x++) blurLine(tmp, grid, x, w, h, r);\r
  }\r
};\r
\r
const readCoverage = (data, w, h) => {\r
  const coverage = new Float32Array(w * h);\r
  let clear = 0;\r
  for (let i = 0; i < w * h; i++) if (data[i * 4 + 3] < 250) clear++;\r
  if (clear > w * h * 0.01) {\r
    for (let i = 0; i < w * h; i++) coverage[i] = data[i * 4 + 3] / 255;\r
    return coverage;\r
  }\r
  let r = 0;\r
  let g = 0;\r
  let b = 0;\r
  let n = 0;\r
  const sample = i => {\r
    r += data[i * 4];\r
    g += data[i * 4 + 1];\r
    b += data[i * 4 + 2];\r
    n++;\r
  };\r
  for (let x = 0; x < w; x++) {\r
    sample(x);\r
    sample((h - 1) * w + x);\r
  }\r
  for (let y = 0; y < h; y++) {\r
    sample(y * w);\r
    sample(y * w + w - 1);\r
  }\r
  r /= n;\r
  g /= n;\r
  b /= n;\r
  for (let i = 0; i < w * h; i++) {\r
    const diff = Math.max(Math.abs(data[i * 4] - r), Math.abs(data[i * 4 + 1] - g), Math.abs(data[i * 4 + 2] - b));\r
    coverage[i] = Math.min(1, Math.max(0, (diff - 24) / 48));\r
  }\r
  return coverage;\r
};\r
\r
const sampleField = (shape, x, y) => {\r
  const { field, width, height } = shape;\r
  const cx = Math.min(Math.max(x, 0.5), width - 0.5);\r
  const cy = Math.min(Math.max(y, 0.5), height - 0.5);\r
  const x0 = Math.min(Math.floor(cx - 0.5), width - 2);\r
  const y0 = Math.min(Math.floor(cy - 0.5), height - 2);\r
  const tx = cx - 0.5 - x0;\r
  const ty = cy - 0.5 - y0;\r
  const i = y0 * width + x0;\r
  const top = field[i] + (field[i + 1] - field[i]) * tx;\r
  const bottom = field[i + width] + (field[i + width + 1] - field[i + width]) * tx;\r
  return top + (bottom - top) * ty + Math.hypot(x - cx, y - cy);\r
};\r
\r
const traceShape = image => {\r
  const iw = image.naturalWidth || image.width;\r
  const ih = image.naturalHeight || image.height;\r
  if (!iw || !ih) return null;\r
  const fit = RASTER / Math.max(iw, ih);\r
  const w = Math.max(2, Math.round(iw * fit));\r
  const h = Math.max(2, Math.round(ih * fit));\r
  const canvas = document.createElement('canvas');\r
  canvas.width = w;\r
  canvas.height = h;\r
  const ctx = canvas.getContext('2d', { willReadFrequently: true });\r
  if (!ctx) return null;\r
  ctx.drawImage(image, 0, 0, w, h);\r
  const coverage = readCoverage(ctx.getImageData(0, 0, w, h).data, w, h);\r
\r
  let left = w;\r
  let top = h;\r
  let right = -1;\r
  let bottom = -1;\r
  for (let y = 0; y < h; y++) {\r
    for (let x = 0; x < w; x++) {\r
      if (coverage[y * w + x] <= 0.01) continue;\r
      if (x < left) left = x;\r
      if (x > right) right = x;\r
      if (y < top) top = y;\r
      if (y > bottom) bottom = y;\r
    }\r
  }\r
  if (right < 0) return null;\r
\r
  const logoWidth = right - left + 1;\r
  const logoHeight = bottom - top + 1;\r
  const pad = Math.ceil(Math.max(logoWidth, logoHeight) * 0.25) + 2;\r
  const width = logoWidth + pad * 2;\r
  const height = logoHeight + pad * 2;\r
  const outer = new Float32Array(width * height);\r
  const inner = new Float32Array(width * height);\r
  for (let y = 0; y < height; y++) {\r
    for (let x = 0; x < width; x++) {\r
      const sx = x - pad + left;\r
      const sy = y - pad + top;\r
      const a = sx >= 0 && sy >= 0 && sx < w && sy < h ? coverage[sy * w + sx] : 0;\r
      const i = y * width + x;\r
      if (a >= 1) {\r
        outer[i] = 0;\r
        inner[i] = FAR;\r
      } else if (a <= 0) {\r
        outer[i] = FAR;\r
        inner[i] = 0;\r
      } else {\r
        const e = 0.5 - a;\r
        outer[i] = e > 0 ? e * e : 0;\r
        inner[i] = e < 0 ? e * e : 0;\r
      }\r
    }\r
  }\r
  transformGrid(outer, width, height);\r
  transformGrid(inner, width, height);\r
\r
  const field = new Float32Array(width * height);\r
  for (let i = 0; i < width * height; i++) field[i] = Math.sqrt(outer[i]) - Math.sqrt(inner[i]);\r
\r
  const points = [];\r
  for (let y = 1; y < height - 1; y++) {\r
    for (let x = 1; x < width - 1; x++) {\r
      const i = y * width + x;\r
      const d = field[i];\r
      if (d > 0) continue;\r
      if (field[i - 1] <= 0 && field[i + 1] <= 0 && field[i - width] <= 0 && field[i + width] <= 0) continue;\r
      const gx = field[i + 1] - field[i - 1];\r
      const gy = field[i + width] - field[i - width];\r
      const len = Math.hypot(gx, gy) || 1;\r
      points.push(x + 0.5 - (d * gx) / len, y + 0.5 - (d * gy) / len);\r
    }\r
  }\r
  const stride = Math.max(1, Math.ceil(points.length / 2 / 3000)) * 2;\r
  const edges = [];\r
  for (let i = 0; i < points.length; i += stride) edges.push(points[i], points[i + 1]);\r
\r
  const size = Math.max(logoWidth, logoHeight);\r
  const glowPad = Math.ceil((size * 0.7) / CELL);\r
  const glowWidth = Math.ceil(logoWidth / CELL) + glowPad * 2;\r
  const glowHeight = Math.ceil(logoHeight / CELL) + glowPad * 2;\r
  const tight = new Float32Array(glowWidth * glowHeight);\r
  for (let y = 0; y < height; y++) {\r
    const gy = Math.floor((y - pad) / CELL) + glowPad;\r
    for (let x = 0; x < width; x++) {\r
      const gx = Math.floor((x - pad) / CELL) + glowPad;\r
      tight[gy * glowWidth + gx] += Math.exp(-Math.abs(field[y * width + x]) / 1.5) / (CELL * CELL);\r
    }\r
  }\r
  const wide = tight.slice();\r
  const tightRadius = Math.max(1, Math.round((size * 0.035) / CELL));\r
  const wideRadius = Math.max(2, Math.round((size * 0.13) / CELL));\r
  blurGrid(tight, glowWidth, glowHeight, tightRadius);\r
  blurGrid(wide, glowWidth, glowHeight, wideRadius);\r
  const tightNorm = (Math.sqrt(2 * Math.PI * (tightRadius * tightRadius + tightRadius)) * CELL) / 3;\r
  const wideNorm = (Math.sqrt(2 * Math.PI * (wideRadius * wideRadius + wideRadius)) * CELL) / 3;\r
  const glow = new Float32Array(glowWidth * glowHeight * 2);\r
  for (let i = 0; i < glowWidth * glowHeight; i++) {\r
    glow[i * 2] = tight[i] * tightNorm;\r
    glow[i * 2 + 1] = wide[i] * wideNorm;\r
  }\r
\r
  return {\r
    field,\r
    edges,\r
    width,\r
    height,\r
    pad,\r
    logoWidth,\r
    logoHeight,\r
    glow,\r
    glowWidth,\r
    glowHeight,\r
    glowOffset: pad - glowPad * CELL\r
  };\r
};\r
\r
const spawnArc = (shape, time, focus) => {\r
  const { edges, logoWidth, logoHeight } = shape;\r
  const count = edges.length / 2;\r
  if (count < 2) return null;\r
  const size = Math.max(logoWidth, logoHeight);\r
  let i = Math.floor(Math.random() * count);\r
  if (focus) {\r
    let found = false;\r
    for (let attempt = 0; attempt < 40 && !found; attempt++) {\r
      const j = Math.floor(Math.random() * count);\r
      if (Math.hypot(edges[j * 2] - focus.x, edges[j * 2 + 1] - focus.y) < focus.radius) {\r
        i = j;\r
        found = true;\r
      }\r
    }\r
    if (!found) return null;\r
  }\r
  const ax = edges[i * 2];\r
  const ay = edges[i * 2 + 1];\r
  for (let attempt = 0; attempt < 24; attempt++) {\r
    const j = Math.floor(Math.random() * count);\r
    const bx = edges[j * 2];\r
    const by = edges[j * 2 + 1];\r
    const len = Math.hypot(bx - ax, by - ay);\r
    if (len < size * 0.08 || len > size * 0.3) continue;\r
    const nx = -(by - ay) / len;\r
    const ny = (bx - ax) / len;\r
    const bow = len * (0.2 + Math.random() * 0.3);\r
    const mx = (ax + bx) / 2;\r
    const my = (ay + by) / 2;\r
    const left = sampleField(shape, mx + nx * bow, my + ny * bow);\r
    const right = sampleField(shape, mx - nx * bow, my - ny * bow);\r
    if (Math.max(left, right) <= 0) continue;\r
    return {\r
      ax,\r
      ay,\r
      bx,\r
      by,\r
      bow: left >= right ? bow : -bow,\r
      seed: 1 + Math.random() * 60,\r
      born: time,\r
      life: 0.35 + Math.random() * 0.45\r
    };\r
  }\r
  return null;\r
};\r
\r
const vertex = \`#version 300 es\r
in vec2 position;\r
in vec2 uv;\r
out vec2 vUv;\r
void main() {\r
  vUv = uv;\r
  gl_Position = vec4(position, 0.0, 1.0);\r
}\r
\`;\r
\r
const fragment = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
\r
uniform sampler2D tFieldFrom;\r
uniform sampler2D tGlowFrom;\r
uniform sampler2D tFieldTo;\r
uniform sampler2D tGlowTo;\r
uniform vec4 uMapFrom;\r
uniform vec4 uSizeFrom;\r
uniform vec4 uMapTo;\r
uniform vec4 uSizeTo;\r
uniform float uMorph;\r
uniform vec2 uResolution;\r
uniform float uUnit;\r
uniform float uTime;\r
uniform float uPresence;\r
uniform vec3 uHover;\r
uniform float uHoverRadius;\r
uniform vec4 uPulses[\${PULSES}];\r
uniform float uPulseBoost;\r
uniform float uFlash;\r
uniform vec3 uColor;\r
uniform vec3 uGlowColor;\r
uniform float uIntensity;\r
uniform float uGlow;\r
uniform float uThickness;\r
uniform float uStrands;\r
uniform float uBend;\r
uniform float uCrackle;\r
uniform float uFlicker;\r
uniform float uFill;\r
uniform float uInk;\r
uniform vec4 uArcEnds[\${ARCS}];\r
uniform vec4 uArcShape[\${ARCS}];\r
\r
in vec2 vUv;\r
out vec4 fragColor;\r
\r
uint scramble(uint x) {\r
  x ^= x >> 16u;\r
  x *= 0x7feb352du;\r
  x ^= x >> 15u;\r
  x *= 0x846ca68bu;\r
  x ^= x >> 16u;\r
  return x;\r
}\r
\r
float fieldAt(sampler2D tex, vec4 map, vec4 size, vec2 p) {\r
  vec2 f = (p - map.xy) / map.z;\r
  vec2 c = clamp(f, vec2(0.5), size.xy - 0.5);\r
  return (textureLod(tex, c / size.xy, 0.0).r + length(f - c)) * map.z;\r
}\r
\r
vec2 glowAt(sampler2D tex, vec4 map, vec4 size, vec2 p) {\r
  vec2 f = (p - map.xy) / map.z - map.w;\r
  return textureLod(tex, f / (size.zw * \${CELL}.0), 0.0).rg;\r
}\r
\r
float shape(vec2 p, float k) {\r
  float to = fieldAt(tFieldTo, uMapTo, uSizeTo, p);\r
  if (k >= 1.0) return to;\r
  return mix(fieldAt(tFieldFrom, uMapFrom, uSizeFrom, p), to, k);\r
}\r
\r
vec2 aura(vec2 p, float k) {\r
  vec2 to = glowAt(tGlowTo, uMapTo, uSizeTo, p);\r
  if (k >= 1.0) return to;\r
  return mix(glowAt(tGlowFrom, uMapFrom, uSizeFrom, p), to, k);\r
}\r
\r
vec4 corner(ivec2 c, uint seed) {\r
  uint h = scramble(uint(c.x) * 0x8da6b343u + uint(c.y) * 0xd8163841u + seed * 0xcb1ab31fu);\r
  return vec4(uvec4(h, h >> 8u, h >> 16u, h >> 24u) & 255u) / 127.5 - 1.0;\r
}\r
\r
vec2 drift(vec2 p, uint seed, out mat2 jac) {\r
  vec2 i = floor(p);\r
  vec2 f = p - i;\r
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);\r
  vec2 du = 30.0 * f * f * (f * (f - 2.0) + 1.0);\r
  ivec2 c = ivec2(i);\r
  vec4 ga = corner(c, seed);\r
  vec4 gb = corner(c + ivec2(1, 0), seed);\r
  vec4 gc = corner(c + ivec2(0, 1), seed);\r
  vec4 gd = corner(c + ivec2(1, 1), seed);\r
  vec2 fb = f - vec2(1.0, 0.0);\r
  vec2 fc = f - vec2(0.0, 1.0);\r
  vec2 fd = f - vec2(1.0);\r
  vec2 va = vec2(dot(ga.xy, f), dot(ga.zw, f));\r
  vec2 vb = vec2(dot(gb.xy, fb), dot(gb.zw, fb));\r
  vec2 vc = vec2(dot(gc.xy, fc), dot(gc.zw, fc));\r
  vec2 vd = vec2(dot(gd.xy, fd), dot(gd.zw, fd));\r
  vec2 k = va - vb - vc + vd;\r
  vec4 g = ga + u.x * (gb - ga) + u.y * (gc - ga) + u.x * u.y * (ga - gb - gc + gd);\r
  jac = mat2(\r
    g.xy + du * (u.yx * k.x + vec2(vb.x - va.x, vc.x - va.x)),\r
    g.zw + du * (u.yx * k.y + vec2(vb.y - va.y, vc.y - va.y))\r
  );\r
  return va + u.x * (vb - va) + u.y * (vc - va) + u.x * u.y * k;\r
}\r
\r
float wobble(vec2 p, uint seed) {\r
  mat2 jac;\r
  return drift(p, seed, jac).x;\r
}\r
\r
vec2 ripple(vec2 p, out float surge) {\r
  vec2 push = vec2(0.0);\r
  surge = 0.0;\r
  float width = uUnit * 10.0;\r
  for (int i = 0; i < \${PULSES}; i++) {\r
    vec4 pulse = uPulses[i];\r
    if (pulse.w <= 0.0) continue;\r
    vec2 d = p - pulse.xy;\r
    float dist = length(d);\r
    float front = (dist - pulse.z * uUnit * 150.0) / width;\r
    float env = exp(-front * front) * pulse.w * exp(-pulse.z * 1.7) * smoothstep(0.0, uUnit * 8.0, dist);\r
    push += d / max(dist, 1.0) * env * cos(front * 2.2) * uUnit * 7.5;\r
    surge += env;\r
  }\r
  return push;\r
}\r
\r
vec2 wander(vec2 p, float t, uint seed, float reachScale, out mat2 jac, out vec2 sway) {\r
  vec2 q = p / uUnit;\r
  mat2 ja;\r
  mat2 jb;\r
  mat2 jc;\r
  mat2 jd;\r
  vec2 a = drift(q * 0.028 + vec2(t * 0.29, t * 0.21), seed, ja);\r
  vec2 b = drift(q * 0.085 + a * 0.4 + vec2(t * 0.83, -t * 0.61) + 17.0, seed + 1u, jb);\r
  vec2 c = drift(p / 9.0 + b * 0.6 + vec2(t * 1.9, t * 1.3) + 5.0, seed + 2u, jc);\r
  vec2 d = drift(p / 4.1 + vec2(-t * 2.7, t * 2.2) + 11.0, seed + 3u, jd);\r
  float bendAmp = uBend * 8.0 * reachScale;\r
  float rippleAmp = uBend * 3.2 * reachScale;\r
  float crinkleAmp = uCrackle * 1.5 * reachScale;\r
  jac = ja * (0.028 * bendAmp) + jb * (0.085 * rippleAmp) + jc * (crinkleAmp / 9.0) + jd * (crinkleAmp * 0.35 / 4.1);\r
  sway = (a * bendAmp + b * rippleAmp) * uUnit;\r
  return sway + (c + d * 0.35) * crinkleAmp;\r
}\r
\r
vec2 glowShape(float line, float spread, float w) {\r
  float x = abs(line);\r
  float y = abs(spread);\r
  return vec2(exp(-x * x / (w * w * 0.5)) + exp(-y / (w * 2.2)) * 0.6, exp(-y / (w * 4.5)) * 0.5);\r
}\r
\r
void addArc(vec2 p, vec4 ends, vec4 info, float t, inout vec3 light, inout float energy, inout float hot) {\r
  if (info.y < 0.002) return;\r
  vec2 ab = ends.zw - ends.xy;\r
  float len = max(length(ab), 1.0);\r
  vec2 dir = ab / len;\r
  vec2 rel = p - ends.xy;\r
  float s = dot(rel, dir);\r
  float h = dot(rel, vec2(-dir.y, dir.x));\r
  float margin = abs(info.x) + uCrackle * (2.0 + len * 0.08) + uThickness * 12.0 + 10.0;\r
  if (s < -margin || s > len + margin || abs(h) > margin) return;\r
  float u = clamp(s / len, 0.0, 1.0);\r
  float taper = sin(3.14159265 * u);\r
  float bendSlope = s > 0.0 && s < len ? 3.14159265 / len * cos(3.14159265 * u) : 0.0;\r
  float beyond = max(-s, 0.0) + max(s - len, 0.0);\r
  for (int c = 0; c < 2; c++) {\r
    uint seed = uint(info.z * 131.0) + uint(c) * 29u + 7u;\r
    float jag = 0.0;\r
    float jagSlope = 0.0;\r
    float wave = max(len * 0.3, 14.0);\r
    float weight = uCrackle * (1.5 + len * 0.05) * (c == 0 ? 1.0 : 1.5);\r
    for (int o = 0; o < 3; o++) {\r
      mat2 jac;\r
      float n = drift(vec2(s / wave + info.z * 3.0, t * (1.4 + float(o) * 1.1)), seed + uint(o), jac).x;\r
      jag += n * weight;\r
      jagSlope += jac[0].x * weight / wave;\r
      wave *= 0.42;\r
      weight *= 0.4;\r
    }\r
    float offset = (info.x + jag) * taper;\r
    float offsetSlope = (info.x + jag) * bendSlope + jagSlope * taper;\r
    float across = (h - offset) / sqrt(1.0 + offsetSlope * offsetSlope);\r
    float gap = length(vec2(beyond, across));\r
    float w = uThickness * (c == 0 ? 0.9 : 0.6);\r
    vec2 g = glowShape(gap, gap, w);\r
    float k = info.y * (c == 0 ? 1.0 : 0.45);\r
    light += (uColor * g.x + uGlowColor * g.y * uGlow) * k;\r
    energy += (g.x + g.y * uGlow) * k;\r
    hot += exp(-gap * gap / (w * w * 0.16)) * k * (c == 0 ? 1.0 : 0.0);\r
  }\r
}\r
\r
void main() {\r
  vec2 p = vec2(vUv.x, 1.0 - vUv.y) * uResolution;\r
  float t = uTime;\r
  vec3 light = vec3(0.0);\r
  float energy = 0.0;\r
  float hot = 0.0;\r
\r
  float surge;\r
  vec2 pr = p - ripple(p, surge);\r
  float k = uMorph >= 1.0 ? 1.0 : smoothstep(0.0, 1.0, clamp(uMorph * 1.7 - 0.35 + 0.35 * wobble(p / uUnit * 0.018, 41u), 0.0, 1.0));\r
  float transit = uMorph >= 1.0 ? 0.0 : sin(3.14159265 * uMorph);\r
  float base = shape(pr, k);\r
\r
  vec2 toHover = p - uHover.xy;\r
  float heat = min(uHover.z * exp(-dot(toHover, toHover) / (uHoverRadius * uHoverRadius)) + surge * 1.4 + transit * 0.5, 2.0);\r
  float heatCap = min(uHover.z + uPulseBoost * 1.4 + transit * 0.5, 2.0);\r
  float breath = 1.0 + uFlicker * 0.6 * wobble(vec2(t * 2.1, 7.0), 3u);\r
  float grow = uPresence;\r
\r
  float edge = abs(base);\r
  vec2 halo = aura(pr, k);\r
  float ink = uInk;\r
  float bloom = (halo.x * 0.16 + halo.y * 0.08) * (1.0 - ink * 0.65) * uGlow * (1.0 + heat * 1.2);\r
  float body = smoothstep(0.75, -0.75, base) * uFill * (0.06 + 1.2 * min(halo.x, 1.0)) * (1.0 + heat * 0.5);\r
  light += uGlowColor * bloom * grow * grow;\r
  energy += bloom * grow * grow;\r
\r
  float reachScale = mix(0.15, 1.0, grow) * (1.0 + heat * 0.9);\r
  float reach = (uUnit * uBend * 16.0 + uCrackle * 3.0) * (1.0 + heatCap * 0.9) + uThickness * 20.0 + 8.0;\r
  if (edge < reach && grow > 0.0) {\r
    float fade = smoothstep(reach, reach * 0.55, edge);\r
    vec2 q = pr / uUnit;\r
    float count = min(uStrands + heat * 2.5, 6.0);\r
    float limit = min(uStrands + heatCap * 2.5, 6.0);\r
    for (int i = 0; i < 6; i++) {\r
      float fi = float(i);\r
      if (fi >= limit) break;\r
      float present = clamp(count - fi, 0.0, 1.0);\r
      if (present <= 0.0) continue;\r
      uint seed = uint(i) * 7u + 3u;\r
      mat2 jac;\r
      vec2 sway;\r
      float lead = i == 0 ? 1.0 : 0.0;\r
      vec2 warped = pr + wander(pr, t * (1.0 + fi * 0.19), seed, reachScale * mix(0.6 + fi * 0.2, 0.7, lead), jac, sway);\r
      float dw = shape(warped, k);\r
      vec2 slope = vec2(shape(warped + vec2(1.0, 0.0), k), shape(warped + vec2(0.0, 1.0), k)) - dw;\r
      float d = dw / max(length(slope + jac * slope), 0.3);\r
      float spread = shape(pr + sway, k);\r
      float swell = 0.5 + 0.5 * wobble(q * 0.06 + vec2(t * 0.9, fi * 5.1 - t * 0.6), seed + 8u);\r
      float w = uThickness * mix(0.5, 1.0, lead) * (0.5 + swell);\r
      float vis = mix(0.3 + 0.45 * smoothstep(-0.25, 0.2, wobble(q * 0.035 + vec2(t * 0.21, fi * 3.7), seed + 5u)), 1.0, lead);\r
      float spark = 1.0 - uFlicker * 0.3 * (0.5 + 0.5 * wobble(vec2(t * 6.0, fi * 2.3), seed + 6u));\r
      float weight = max(vis, heat * 0.85) * spark * fade * present * (0.7 + 0.6 * swell);\r
      vec2 g = glowShape(d, spread, w) * weight;\r
      float soft = mix(1.0, mix(0.5, 1.0, lead), ink);\r
      vec3 stroke = mix(uColor, uGlowColor, ink * (1.0 - lead) * 0.65);\r
      float haze = uGlow * (1.0 + heat) * (1.0 - ink * 0.7);\r
      light += stroke * g.x * soft + uGlowColor * g.y * haze;\r
      energy += g.x * soft + g.y * haze;\r
      hot += exp(-d * d / (w * w * 0.16)) * lead * weight;\r
    }\r
    light *= grow;\r
    energy *= grow;\r
  }\r
\r
  for (int i = 0; i < \${ARCS}; i++) addArc(pr, uArcEnds[i], uArcShape[i], t, light, energy, hot);\r
\r
  float gain = uIntensity * breath * (1.0 + heat * 0.45) * (1.0 + uFlash * 0.3) * 1.4;\r
  float alpha = 1.0 - exp(-energy * gain);\r
  vec3 color = mix(1.0 - exp(-light * gain), alpha * light / max(energy, 1e-4), ink);\r
  color = mix(color, vec3(alpha), clamp(hot * grow, 0.0, 1.0) * ink * 0.85);\r
  float tint = (1.0 - exp(-body * gain * 1.2)) * grow * grow * (1.0 - ink * 0.82);\r
  color += uGlowColor * tint * (1.0 - alpha);\r
  alpha += tint * (1.0 - alpha);\r
  float grain = (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;\r
  alpha = clamp(alpha + grain, 0.0, 1.0);\r
  fragColor = vec4(clamp(color + grain, 0.0, alpha), alpha);\r
}\r
\`;\r
\r
const ElectricLogo = ({\r
  src = BOLT,\r
  color = '#ecc7ff',\r
  glowColor = '#ad6dff',\r
  scale = 0.7,\r
  intensity = 1,\r
  glow = 1,\r
  thickness = 1.5,\r
  strands = 4,\r
  bend = 0.6,\r
  crackle = 1.5,\r
  arcs = 1,\r
  flicker = 0.6,\r
  fill = 0,\r
  speed = 2.5,\r
  interactive = true,\r
  cursorIntensity = 0.75,\r
  cursorRadius = 100,\r
  theme = 'dark',\r
  onRender,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const settingsRef = useRef(null);\r
  const shapeRef = useRef(null);\r
\r
  useEffect(() => {\r
    settingsRef.current = {\r
      color,\r
      glowColor,\r
      scale,\r
      intensity,\r
      glow,\r
      thickness,\r
      strands,\r
      bend,\r
      crackle,\r
      arcs,\r
      flicker,\r
      fill,\r
      speed,\r
      interactive,\r
      cursorIntensity,\r
      cursorRadius,\r
      theme,\r
      onRender\r
    };\r
  });\r
\r
  useEffect(() => {\r
    let alive = true;\r
    const image = new Image();\r
    image.crossOrigin = 'anonymous';\r
    image.decoding = 'async';\r
    image.onload = () => {\r
      if (!alive) return;\r
      let traced = null;\r
      try {\r
        traced = traceShape(image);\r
      } catch {\r
        traced = null;\r
      }\r
      if (traced) shapeRef.current = traced;\r
    };\r
    image.src = src || BOLT;\r
    return () => {\r
      alive = false;\r
      image.onload = null;\r
    };\r
  }, [src]);\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    if (!container) return undefined;\r
\r
    const renderer = new Renderer({\r
      dpr: Math.min(window.devicePixelRatio || 1, 2),\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false\r
    });\r
    const gl = renderer.gl;\r
    if (!renderer.isWebgl2) {\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
      return undefined;\r
    }\r
    gl.clearColor(0, 0, 0, 0);\r
    const canvas = gl.canvas;\r
    canvas.style.display = 'block';\r
    canvas.style.width = '100%';\r
    canvas.style.height = '100%';\r
    container.appendChild(canvas);\r
\r
    const makeSlot = () => ({\r
      shape: null,\r
      field: new Texture(gl, {\r
        image: new Float32Array([1000]),\r
        width: 1,\r
        height: 1,\r
        internalFormat: gl.R16F,\r
        format: gl.RED,\r
        type: gl.FLOAT,\r
        minFilter: gl.LINEAR,\r
        magFilter: gl.LINEAR,\r
        generateMipmaps: false,\r
        flipY: false,\r
        unpackAlignment: 1\r
      }),\r
      glow: new Texture(gl, {\r
        image: new Float32Array([0, 0]),\r
        width: 1,\r
        height: 1,\r
        internalFormat: gl.RG16F,\r
        format: gl.RG,\r
        type: gl.FLOAT,\r
        minFilter: gl.LINEAR,\r
        magFilter: gl.LINEAR,\r
        generateMipmaps: false,\r
        flipY: false,\r
        unpackAlignment: 1\r
      })\r
    });\r
    const slots = [makeSlot(), makeSlot()];\r
\r
    const arcEnds = Array.from({ length: ARCS * 4 }, () => 0);\r
    const arcShape = Array.from({ length: ARCS * 4 }, () => 0);\r
    const pulseData = Array.from({ length: PULSES * 4 }, () => 0);\r
    const uniforms = {\r
      tFieldFrom: { value: slots[1].field },\r
      tGlowFrom: { value: slots[1].glow },\r
      tFieldTo: { value: slots[0].field },\r
      tGlowTo: { value: slots[0].glow },\r
      uMapFrom: { value: [0, 0, 1, 0] },\r
      uSizeFrom: { value: [1, 1, 1, 1] },\r
      uMapTo: { value: [0, 0, 1, 0] },\r
      uSizeTo: { value: [1, 1, 1, 1] },\r
      uMorph: { value: 1 },\r
      uResolution: { value: [1, 1] },\r
      uUnit: { value: 1 },\r
      uTime: { value: 0 },\r
      uPresence: { value: 0 },\r
      uHover: { value: [0, 0, 0] },\r
      uHoverRadius: { value: 120 },\r
      uPulses: { value: pulseData },\r
      uPulseBoost: { value: 0 },\r
      uFlash: { value: 0 },\r
      uColor: { value: [1, 1, 1] },\r
      uGlowColor: { value: [0.43, 0.48, 1] },\r
      uIntensity: { value: 1 },\r
      uGlow: { value: 1 },\r
      uThickness: { value: 1.8 },\r
      uStrands: { value: 3 },\r
      uBend: { value: 1 },\r
      uCrackle: { value: 1 },\r
      uFlicker: { value: 0.4 },\r
      uFill: { value: 0.5 },\r
      uInk: { value: 0 },\r
      uArcEnds: { value: arcEnds },\r
      uArcShape: { value: arcShape }\r
    };\r
    const mesh = new Mesh(gl, {\r
      geometry: new Triangle(gl),\r
      program: new Program(gl, { vertex, fragment, uniforms, depthTest: false, depthWrite: false })\r
    });\r
\r
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const pointer = { x: 0, y: 0, over: false };\r
    const hover = { x: 0, y: 0, vx: 0, vy: 0, power: 0 };\r
    const sparks = [];\r
    const pulses = [];\r
    let target = 0;\r
    let pending = null;\r
    let morph = 1;\r
    let burst = null;\r
    let progress = 0;\r
    let ink = 0;\r
    const hues = [\r
      [1, 1, 1],\r
      [1, 1, 1]\r
    ];\r
    let settled = false;\r
    let time = 0;\r
    let width = 1;\r
    let height = 1;\r
    let raf = 0;\r
    let last = performance.now();\r
    let visible = true;\r
\r
    const load = (slot, next) => {\r
      slot.shape = next;\r
      slot.field.image = next.field;\r
      slot.field.width = next.width;\r
      slot.field.height = next.height;\r
      slot.field.needsUpdate = true;\r
      slot.glow.image = next.glow;\r
      slot.glow.width = next.glowWidth;\r
      slot.glow.height = next.glowHeight;\r
      slot.glow.needsUpdate = true;\r
    };\r
\r
    const place = (shape, s) => {\r
      const fit = Math.max(1e-4, Math.min((width * s.scale) / shape.logoWidth, (height * s.scale) / shape.logoHeight));\r
      return {\r
        fit,\r
        ox: width / 2 - (shape.pad + shape.logoWidth / 2) * fit,\r
        oy: height / 2 - (shape.pad + shape.logoHeight / 2) * fit,\r
        unit: (Math.max(shape.logoWidth, shape.logoHeight) * fit) / 100\r
      };\r
    };\r
\r
    const resize = () => {\r
      width = Math.max(1, container.clientWidth);\r
      height = Math.max(1, container.clientHeight);\r
      renderer.dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(PIXEL_BUDGET / (width * height)));\r
      renderer.setSize(width, height);\r
      uniforms.uResolution.value = [width, height];\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      const s = settingsRef.current;\r
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));\r
      last = now;\r
\r
      const incoming = shapeRef.current;\r
      if (incoming && incoming !== slots[target].shape) pending = incoming;\r
      if (pending && morph >= 1) {\r
        if (slots[target].shape) {\r
          target = 1 - target;\r
          morph = 0;\r
          sparks.length = 0;\r
        }\r
        load(slots[target], pending);\r
        pending = null;\r
      }\r
      if (morph < 1) morph = Math.min(1, morph + dt / (pending ? 0.3 : 1.6));\r
\r
      const to = slots[target].shape;\r
      const from = morph < 1 ? slots[1 - target].shape : null;\r
      if (to) progress = Math.min(1, progress + dt / 1.4);\r
      const presence = progress * progress * (3 - 2 * progress);\r
\r
      if (to && s) {\r
        const near = place(to, s);\r
        const far = from ? place(from, s) : near;\r
        const blend = morph * morph * (3 - 2 * morph);\r
        const unit = far.unit + (near.unit - far.unit) * blend;\r
\r
        const engaged = s.interactive && pointer.over;\r
        if (engaged && hover.power < 0.01) {\r
          hover.x = pointer.x;\r
          hover.y = pointer.y;\r
          hover.vx = 0;\r
          hover.vy = 0;\r
        }\r
        hover.vx += ((pointer.x - hover.x) * 120 - hover.vx * 19) * dt;\r
        hover.vy += ((pointer.y - hover.y) * 120 - hover.vy * 19) * dt;\r
        hover.x += hover.vx * dt;\r
        hover.y += hover.vy * dt;\r
        hover.power += ((engaged ? 1 : 0) - hover.power) * (1 - Math.exp(-dt / (engaged ? 0.3 : 0.55)));\r
\r
        const motion = reducedMotion ? 0.2 : 1;\r
        time += dt * s.speed * motion;\r
\r
        for (let i = sparks.length - 1; i >= 0; i--) {\r
          if (time - sparks[i].born > sparks[i].life) sparks.splice(i, 1);\r
        }\r
        const focus = spot => ({\r
          x: (spot.x - near.ox) / near.fit,\r
          y: (spot.y - near.oy) / near.fit,\r
          radius: Math.max(1, s.cursorRadius) / near.fit\r
        });\r
        if (burst && morph >= 1 && s.arcs > 0) {\r
          for (let i = 0; i < 3 && sparks.length < ARCS; i++) {\r
            const spark = spawnArc(to, time, focus(burst));\r
            if (spark) sparks.push(spark);\r
          }\r
        }\r
        burst = null;\r
        if (!reducedMotion && presence > 0.8 && morph >= 1 && sparks.length < ARCS) {\r
          const chance = dt * s.speed * s.arcs;\r
          if (Math.random() < chance * 6 * hover.power * s.cursorIntensity) {\r
            const spark = spawnArc(to, time, focus(hover));\r
            if (spark) sparks.push(spark);\r
          } else if (Math.random() < chance * 2.2) {\r
            const spark = spawnArc(to, time, null);\r
            if (spark) sparks.push(spark);\r
          }\r
        }\r
\r
        for (let i = 0; i < ARCS; i++) {\r
          const o = i * 4;\r
          const spark = sparks[i];\r
          if (!spark) {\r
            arcShape[o + 1] = 0;\r
            continue;\r
          }\r
          const k = (time - spark.born) / spark.life;\r
          arcEnds[o] = near.ox + spark.ax * near.fit;\r
          arcEnds[o + 1] = near.oy + spark.ay * near.fit;\r
          arcEnds[o + 2] = near.ox + spark.bx * near.fit;\r
          arcEnds[o + 3] = near.oy + spark.by * near.fit;\r
          arcShape[o] = spark.bow * near.fit;\r
          arcShape[o + 1] = Math.sin(Math.PI * Math.min(1, Math.max(0, k))) * presence;\r
          arcShape[o + 2] = spark.seed;\r
        }\r
\r
        let boost = 0;\r
        let flash = 0;\r
        for (let i = pulses.length - 1; i >= 0; i--) {\r
          if ((now - pulses[i].born) / 1000 > 2) pulses.splice(i, 1);\r
        }\r
        for (let i = 0; i < PULSES; i++) {\r
          const o = i * 4;\r
          const pulse = pulses[i];\r
          if (!pulse) {\r
            pulseData[o + 3] = 0;\r
            continue;\r
          }\r
          const age = (now - pulse.born) / 1000;\r
          pulseData[o] = pulse.x;\r
          pulseData[o + 1] = pulse.y;\r
          pulseData[o + 2] = age;\r
          pulseData[o + 3] = 1;\r
          boost = Math.max(boost, Math.exp(-age * 1.7));\r
          flash += Math.exp(-age * 7);\r
        }\r
\r
        const fromSlot = slots[1 - target];\r
        uniforms.tFieldTo.value = slots[target].field;\r
        uniforms.tGlowTo.value = slots[target].glow;\r
        uniforms.tFieldFrom.value = fromSlot.field;\r
        uniforms.tGlowFrom.value = fromSlot.glow;\r
        uniforms.uMapTo.value = [near.ox, near.oy, near.fit, to.glowOffset];\r
        uniforms.uSizeTo.value = [to.width, to.height, to.glowWidth, to.glowHeight];\r
        if (from) {\r
          uniforms.uMapFrom.value = [far.ox, far.oy, far.fit, from.glowOffset];\r
          uniforms.uSizeFrom.value = [from.width, from.height, from.glowWidth, from.glowHeight];\r
        }\r
        uniforms.uMorph.value = morph;\r
        uniforms.uUnit.value = unit;\r
        uniforms.uTime.value = time;\r
        uniforms.uPresence.value = presence;\r
        uniforms.uHover.value = [hover.x, hover.y, hover.power * Math.max(0, s.cursorIntensity)];\r
        uniforms.uHoverRadius.value = Math.max(1, s.cursorRadius);\r
        uniforms.uPulseBoost.value = boost;\r
        uniforms.uFlash.value = flash;\r
        const targets = [hexToRgb(s.color), hexToRgb(s.glowColor)];\r
        const shift = settled ? 1 - Math.exp(-dt / 0.35) : 1;\r
        settled = true;\r
        for (let i = 0; i < 2; i++) {\r
          for (let c = 0; c < 3; c++) hues[i][c] += (targets[i][c] - hues[i][c]) * shift;\r
        }\r
        uniforms.uColor.value = hues[0].slice();\r
        uniforms.uGlowColor.value = hues[1].slice();\r
        uniforms.uIntensity.value = s.intensity;\r
        uniforms.uGlow.value = s.glow;\r
        uniforms.uThickness.value = s.thickness;\r
        uniforms.uStrands.value = Math.max(1, Math.min(6, Math.round(s.strands)));\r
        uniforms.uBend.value = s.bend;\r
        uniforms.uCrackle.value = s.crackle;\r
        uniforms.uFlicker.value = reducedMotion ? 0 : s.flicker;\r
        ink += ((s.theme === 'light' ? 1 : 0) - ink) * (1 - Math.exp(-dt / 0.25));\r
        uniforms.uFill.value = s.fill;\r
        uniforms.uInk.value = ink;\r
        renderer.render({ scene: mesh });\r
        s.onRender?.(canvas);\r
      }\r
\r
      if (visible) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const start = () => {\r
      if (raf || !visible) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const onMove = e => {\r
      const rect = container.getBoundingClientRect();\r
      pointer.x = e.clientX - rect.left;\r
      pointer.y = e.clientY - rect.top;\r
      pointer.over = true;\r
    };\r
    const onDown = e => {\r
      onMove(e);\r
      if (!settingsRef.current?.interactive || reducedMotion) return;\r
      pulses.push({ x: pointer.x, y: pointer.y, born: performance.now() });\r
      if (pulses.length > PULSES) pulses.shift();\r
      burst = { x: pointer.x, y: pointer.y };\r
    };\r
    const onLeave = () => {\r
      pointer.over = false;\r
    };\r
    container.addEventListener('pointermove', onMove);\r
    container.addEventListener('pointerdown', onDown);\r
    container.addEventListener('pointerleave', onLeave);\r
    container.addEventListener('pointercancel', onLeave);\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(container);\r
    const intersectionObserver = new IntersectionObserver(([entry]) => {\r
      visible = entry.isIntersecting;\r
      start();\r
    });\r
    intersectionObserver.observe(container);\r
\r
    resize();\r
    start();\r
\r
    return () => {\r
      visible = false;\r
      cancelAnimationFrame(raf);\r
      resizeObserver.disconnect();\r
      intersectionObserver.disconnect();\r
      container.removeEventListener('pointermove', onMove);\r
      container.removeEventListener('pointerdown', onDown);\r
      container.removeEventListener('pointerleave', onLeave);\r
      container.removeEventListener('pointercancel', onLeave);\r
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
export default ElectricLogo;\r
`,t=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
import type { CSSProperties } from 'react';\r
import { Renderer, Program, Mesh, Triangle, Texture } from 'ogl';\r
\r
import './ElectricLogo.css';\r
\r
const BOLT = \`data:image/svg+xml;charset=utf-8,\${encodeURIComponent(\r
  '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><path d="M39 3 12 37h17l-4 24 27-34H35z" fill="#fff"/></svg>'\r
)}\`;\r
const RASTER = 560;\r
const CELL = 4;\r
const FAR = 1e20;\r
const ARCS = 5;\r
const PULSES = 3;\r
const PIXEL_BUDGET = 4e6;\r
\r
type Rgb = [number, number, number];\r
\r
export interface ElectricLogoProps {\r
  src?: string;\r
  color?: string;\r
  glowColor?: string;\r
  scale?: number;\r
  intensity?: number;\r
  glow?: number;\r
  thickness?: number;\r
  strands?: number;\r
  bend?: number;\r
  crackle?: number;\r
  arcs?: number;\r
  flicker?: number;\r
  fill?: number;\r
  speed?: number;\r
  interactive?: boolean;\r
  cursorIntensity?: number;\r
  cursorRadius?: number;\r
  theme?: 'dark' | 'light';\r
  onRender?: (canvas: HTMLCanvasElement) => void;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
type Settings = Required<Omit<ElectricLogoProps, 'src' | 'className' | 'style' | 'onRender'>> &\r
  Pick<ElectricLogoProps, 'onRender'>;\r
\r
interface Shape {\r
  field: Float32Array;\r
  edges: number[];\r
  width: number;\r
  height: number;\r
  pad: number;\r
  logoWidth: number;\r
  logoHeight: number;\r
  glow: Float32Array;\r
  glowWidth: number;\r
  glowHeight: number;\r
  glowOffset: number;\r
}\r
\r
interface Slot {\r
  shape: Shape | null;\r
  field: Texture;\r
  glow: Texture;\r
}\r
\r
interface Pulse {\r
  x: number;\r
  y: number;\r
  born: number;\r
}\r
\r
interface Point {\r
  x: number;\r
  y: number;\r
}\r
\r
interface Focus {\r
  x: number;\r
  y: number;\r
  radius: number;\r
}\r
\r
interface Spark {\r
  ax: number;\r
  ay: number;\r
  bx: number;\r
  by: number;\r
  bow: number;\r
  seed: number;\r
  born: number;\r
  life: number;\r
}\r
\r
const hexToRgb = (hex: string): Rgb => {\r
  let h = String(hex || '').replace('#', '');\r
  if (h.length === 3) h = h.replace(/./g, c => c + c);\r
  const n = parseInt(h.slice(0, 6), 16);\r
  return Number.isNaN(n) ? [1, 1, 1] : [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];\r
};\r
\r
const transformLine = (f: Float64Array, d: Float64Array, v: Int32Array, z: Float64Array, n: number) => {\r
  let k = 0;\r
  v[0] = 0;\r
  z[0] = -FAR;\r
  z[1] = FAR;\r
  for (let q = 1; q < n; q++) {\r
    let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);\r
    while (s <= z[k]) {\r
      k--;\r
      s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);\r
    }\r
    k++;\r
    v[k] = q;\r
    z[k] = s;\r
    z[k + 1] = FAR;\r
  }\r
  k = 0;\r
  for (let q = 0; q < n; q++) {\r
    while (z[k + 1] < q) k++;\r
    d[q] = (q - v[k]) * (q - v[k]) + f[v[k]];\r
  }\r
};\r
\r
const transformGrid = (grid: Float32Array, w: number, h: number) => {\r
  const n = Math.max(w, h);\r
  const f = new Float64Array(n);\r
  const d = new Float64Array(n);\r
  const v = new Int32Array(n);\r
  const z = new Float64Array(n + 1);\r
  for (let x = 0; x < w; x++) {\r
    for (let y = 0; y < h; y++) f[y] = grid[y * w + x];\r
    transformLine(f, d, v, z, h);\r
    for (let y = 0; y < h; y++) grid[y * w + x] = d[y];\r
  }\r
  for (let y = 0; y < h; y++) {\r
    for (let x = 0; x < w; x++) f[x] = grid[y * w + x];\r
    transformLine(f, d, v, z, w);\r
    for (let x = 0; x < w; x++) grid[y * w + x] = d[x];\r
  }\r
};\r
\r
const blurLine = (src: Float32Array, dst: Float32Array, offset: number, stride: number, n: number, r: number) => {\r
  const scale = 1 / (2 * r + 1);\r
  let sum = 0;\r
  for (let i = 0; i <= r && i < n; i++) sum += src[offset + i * stride];\r
  for (let i = 0; i < n; i++) {\r
    dst[offset + i * stride] = sum * scale;\r
    if (i + r + 1 < n) sum += src[offset + (i + r + 1) * stride];\r
    if (i - r >= 0) sum -= src[offset + (i - r) * stride];\r
  }\r
};\r
\r
const blurGrid = (grid: Float32Array, w: number, h: number, r: number) => {\r
  const tmp = new Float32Array(w * h);\r
  for (let pass = 0; pass < 3; pass++) {\r
    for (let y = 0; y < h; y++) blurLine(grid, tmp, y * w, 1, w, r);\r
    for (let x = 0; x < w; x++) blurLine(tmp, grid, x, w, h, r);\r
  }\r
};\r
\r
const readCoverage = (data: Uint8ClampedArray, w: number, h: number) => {\r
  const coverage = new Float32Array(w * h);\r
  let clear = 0;\r
  for (let i = 0; i < w * h; i++) if (data[i * 4 + 3] < 250) clear++;\r
  if (clear > w * h * 0.01) {\r
    for (let i = 0; i < w * h; i++) coverage[i] = data[i * 4 + 3] / 255;\r
    return coverage;\r
  }\r
  let r = 0;\r
  let g = 0;\r
  let b = 0;\r
  let n = 0;\r
  const sample = (i: number) => {\r
    r += data[i * 4];\r
    g += data[i * 4 + 1];\r
    b += data[i * 4 + 2];\r
    n++;\r
  };\r
  for (let x = 0; x < w; x++) {\r
    sample(x);\r
    sample((h - 1) * w + x);\r
  }\r
  for (let y = 0; y < h; y++) {\r
    sample(y * w);\r
    sample(y * w + w - 1);\r
  }\r
  r /= n;\r
  g /= n;\r
  b /= n;\r
  for (let i = 0; i < w * h; i++) {\r
    const diff = Math.max(Math.abs(data[i * 4] - r), Math.abs(data[i * 4 + 1] - g), Math.abs(data[i * 4 + 2] - b));\r
    coverage[i] = Math.min(1, Math.max(0, (diff - 24) / 48));\r
  }\r
  return coverage;\r
};\r
\r
const sampleField = (shape: Shape, x: number, y: number) => {\r
  const { field, width, height } = shape;\r
  const cx = Math.min(Math.max(x, 0.5), width - 0.5);\r
  const cy = Math.min(Math.max(y, 0.5), height - 0.5);\r
  const x0 = Math.min(Math.floor(cx - 0.5), width - 2);\r
  const y0 = Math.min(Math.floor(cy - 0.5), height - 2);\r
  const tx = cx - 0.5 - x0;\r
  const ty = cy - 0.5 - y0;\r
  const i = y0 * width + x0;\r
  const top = field[i] + (field[i + 1] - field[i]) * tx;\r
  const bottom = field[i + width] + (field[i + width + 1] - field[i + width]) * tx;\r
  return top + (bottom - top) * ty + Math.hypot(x - cx, y - cy);\r
};\r
\r
const traceShape = (image: HTMLImageElement): Shape | null => {\r
  const iw = image.naturalWidth || image.width;\r
  const ih = image.naturalHeight || image.height;\r
  if (!iw || !ih) return null;\r
  const fit = RASTER / Math.max(iw, ih);\r
  const w = Math.max(2, Math.round(iw * fit));\r
  const h = Math.max(2, Math.round(ih * fit));\r
  const canvas = document.createElement('canvas');\r
  canvas.width = w;\r
  canvas.height = h;\r
  const ctx = canvas.getContext('2d', { willReadFrequently: true });\r
  if (!ctx) return null;\r
  ctx.drawImage(image, 0, 0, w, h);\r
  const coverage = readCoverage(ctx.getImageData(0, 0, w, h).data, w, h);\r
\r
  let left = w;\r
  let top = h;\r
  let right = -1;\r
  let bottom = -1;\r
  for (let y = 0; y < h; y++) {\r
    for (let x = 0; x < w; x++) {\r
      if (coverage[y * w + x] <= 0.01) continue;\r
      if (x < left) left = x;\r
      if (x > right) right = x;\r
      if (y < top) top = y;\r
      if (y > bottom) bottom = y;\r
    }\r
  }\r
  if (right < 0) return null;\r
\r
  const logoWidth = right - left + 1;\r
  const logoHeight = bottom - top + 1;\r
  const pad = Math.ceil(Math.max(logoWidth, logoHeight) * 0.25) + 2;\r
  const width = logoWidth + pad * 2;\r
  const height = logoHeight + pad * 2;\r
  const outer = new Float32Array(width * height);\r
  const inner = new Float32Array(width * height);\r
  for (let y = 0; y < height; y++) {\r
    for (let x = 0; x < width; x++) {\r
      const sx = x - pad + left;\r
      const sy = y - pad + top;\r
      const a = sx >= 0 && sy >= 0 && sx < w && sy < h ? coverage[sy * w + sx] : 0;\r
      const i = y * width + x;\r
      if (a >= 1) {\r
        outer[i] = 0;\r
        inner[i] = FAR;\r
      } else if (a <= 0) {\r
        outer[i] = FAR;\r
        inner[i] = 0;\r
      } else {\r
        const e = 0.5 - a;\r
        outer[i] = e > 0 ? e * e : 0;\r
        inner[i] = e < 0 ? e * e : 0;\r
      }\r
    }\r
  }\r
  transformGrid(outer, width, height);\r
  transformGrid(inner, width, height);\r
\r
  const field = new Float32Array(width * height);\r
  for (let i = 0; i < width * height; i++) field[i] = Math.sqrt(outer[i]) - Math.sqrt(inner[i]);\r
\r
  const points: number[] = [];\r
  for (let y = 1; y < height - 1; y++) {\r
    for (let x = 1; x < width - 1; x++) {\r
      const i = y * width + x;\r
      const d = field[i];\r
      if (d > 0) continue;\r
      if (field[i - 1] <= 0 && field[i + 1] <= 0 && field[i - width] <= 0 && field[i + width] <= 0) continue;\r
      const gx = field[i + 1] - field[i - 1];\r
      const gy = field[i + width] - field[i - width];\r
      const len = Math.hypot(gx, gy) || 1;\r
      points.push(x + 0.5 - (d * gx) / len, y + 0.5 - (d * gy) / len);\r
    }\r
  }\r
  const stride = Math.max(1, Math.ceil(points.length / 2 / 3000)) * 2;\r
  const edges: number[] = [];\r
  for (let i = 0; i < points.length; i += stride) edges.push(points[i], points[i + 1]);\r
\r
  const size = Math.max(logoWidth, logoHeight);\r
  const glowPad = Math.ceil((size * 0.7) / CELL);\r
  const glowWidth = Math.ceil(logoWidth / CELL) + glowPad * 2;\r
  const glowHeight = Math.ceil(logoHeight / CELL) + glowPad * 2;\r
  const tight = new Float32Array(glowWidth * glowHeight);\r
  for (let y = 0; y < height; y++) {\r
    const gy = Math.floor((y - pad) / CELL) + glowPad;\r
    for (let x = 0; x < width; x++) {\r
      const gx = Math.floor((x - pad) / CELL) + glowPad;\r
      tight[gy * glowWidth + gx] += Math.exp(-Math.abs(field[y * width + x]) / 1.5) / (CELL * CELL);\r
    }\r
  }\r
  const wide = tight.slice();\r
  const tightRadius = Math.max(1, Math.round((size * 0.035) / CELL));\r
  const wideRadius = Math.max(2, Math.round((size * 0.13) / CELL));\r
  blurGrid(tight, glowWidth, glowHeight, tightRadius);\r
  blurGrid(wide, glowWidth, glowHeight, wideRadius);\r
  const tightNorm = (Math.sqrt(2 * Math.PI * (tightRadius * tightRadius + tightRadius)) * CELL) / 3;\r
  const wideNorm = (Math.sqrt(2 * Math.PI * (wideRadius * wideRadius + wideRadius)) * CELL) / 3;\r
  const glow = new Float32Array(glowWidth * glowHeight * 2);\r
  for (let i = 0; i < glowWidth * glowHeight; i++) {\r
    glow[i * 2] = tight[i] * tightNorm;\r
    glow[i * 2 + 1] = wide[i] * wideNorm;\r
  }\r
\r
  return {\r
    field,\r
    edges,\r
    width,\r
    height,\r
    pad,\r
    logoWidth,\r
    logoHeight,\r
    glow,\r
    glowWidth,\r
    glowHeight,\r
    glowOffset: pad - glowPad * CELL\r
  };\r
};\r
\r
const spawnArc = (shape: Shape, time: number, focus: Focus | null): Spark | null => {\r
  const { edges, logoWidth, logoHeight } = shape;\r
  const count = edges.length / 2;\r
  if (count < 2) return null;\r
  const size = Math.max(logoWidth, logoHeight);\r
  let i = Math.floor(Math.random() * count);\r
  if (focus) {\r
    let found = false;\r
    for (let attempt = 0; attempt < 40 && !found; attempt++) {\r
      const j = Math.floor(Math.random() * count);\r
      if (Math.hypot(edges[j * 2] - focus.x, edges[j * 2 + 1] - focus.y) < focus.radius) {\r
        i = j;\r
        found = true;\r
      }\r
    }\r
    if (!found) return null;\r
  }\r
  const ax = edges[i * 2];\r
  const ay = edges[i * 2 + 1];\r
  for (let attempt = 0; attempt < 24; attempt++) {\r
    const j = Math.floor(Math.random() * count);\r
    const bx = edges[j * 2];\r
    const by = edges[j * 2 + 1];\r
    const len = Math.hypot(bx - ax, by - ay);\r
    if (len < size * 0.08 || len > size * 0.3) continue;\r
    const nx = -(by - ay) / len;\r
    const ny = (bx - ax) / len;\r
    const bow = len * (0.2 + Math.random() * 0.3);\r
    const mx = (ax + bx) / 2;\r
    const my = (ay + by) / 2;\r
    const left = sampleField(shape, mx + nx * bow, my + ny * bow);\r
    const right = sampleField(shape, mx - nx * bow, my - ny * bow);\r
    if (Math.max(left, right) <= 0) continue;\r
    return {\r
      ax,\r
      ay,\r
      bx,\r
      by,\r
      bow: left >= right ? bow : -bow,\r
      seed: 1 + Math.random() * 60,\r
      born: time,\r
      life: 0.35 + Math.random() * 0.45\r
    };\r
  }\r
  return null;\r
};\r
\r
const vertex = \`#version 300 es\r
in vec2 position;\r
in vec2 uv;\r
out vec2 vUv;\r
void main() {\r
  vUv = uv;\r
  gl_Position = vec4(position, 0.0, 1.0);\r
}\r
\`;\r
\r
const fragment = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
\r
uniform sampler2D tFieldFrom;\r
uniform sampler2D tGlowFrom;\r
uniform sampler2D tFieldTo;\r
uniform sampler2D tGlowTo;\r
uniform vec4 uMapFrom;\r
uniform vec4 uSizeFrom;\r
uniform vec4 uMapTo;\r
uniform vec4 uSizeTo;\r
uniform float uMorph;\r
uniform vec2 uResolution;\r
uniform float uUnit;\r
uniform float uTime;\r
uniform float uPresence;\r
uniform vec3 uHover;\r
uniform float uHoverRadius;\r
uniform vec4 uPulses[\${PULSES}];\r
uniform float uPulseBoost;\r
uniform float uFlash;\r
uniform vec3 uColor;\r
uniform vec3 uGlowColor;\r
uniform float uIntensity;\r
uniform float uGlow;\r
uniform float uThickness;\r
uniform float uStrands;\r
uniform float uBend;\r
uniform float uCrackle;\r
uniform float uFlicker;\r
uniform float uFill;\r
uniform float uInk;\r
uniform vec4 uArcEnds[\${ARCS}];\r
uniform vec4 uArcShape[\${ARCS}];\r
\r
in vec2 vUv;\r
out vec4 fragColor;\r
\r
uint scramble(uint x) {\r
  x ^= x >> 16u;\r
  x *= 0x7feb352du;\r
  x ^= x >> 15u;\r
  x *= 0x846ca68bu;\r
  x ^= x >> 16u;\r
  return x;\r
}\r
\r
float fieldAt(sampler2D tex, vec4 map, vec4 size, vec2 p) {\r
  vec2 f = (p - map.xy) / map.z;\r
  vec2 c = clamp(f, vec2(0.5), size.xy - 0.5);\r
  return (textureLod(tex, c / size.xy, 0.0).r + length(f - c)) * map.z;\r
}\r
\r
vec2 glowAt(sampler2D tex, vec4 map, vec4 size, vec2 p) {\r
  vec2 f = (p - map.xy) / map.z - map.w;\r
  return textureLod(tex, f / (size.zw * \${CELL}.0), 0.0).rg;\r
}\r
\r
float shape(vec2 p, float k) {\r
  float to = fieldAt(tFieldTo, uMapTo, uSizeTo, p);\r
  if (k >= 1.0) return to;\r
  return mix(fieldAt(tFieldFrom, uMapFrom, uSizeFrom, p), to, k);\r
}\r
\r
vec2 aura(vec2 p, float k) {\r
  vec2 to = glowAt(tGlowTo, uMapTo, uSizeTo, p);\r
  if (k >= 1.0) return to;\r
  return mix(glowAt(tGlowFrom, uMapFrom, uSizeFrom, p), to, k);\r
}\r
\r
vec4 corner(ivec2 c, uint seed) {\r
  uint h = scramble(uint(c.x) * 0x8da6b343u + uint(c.y) * 0xd8163841u + seed * 0xcb1ab31fu);\r
  return vec4(uvec4(h, h >> 8u, h >> 16u, h >> 24u) & 255u) / 127.5 - 1.0;\r
}\r
\r
vec2 drift(vec2 p, uint seed, out mat2 jac) {\r
  vec2 i = floor(p);\r
  vec2 f = p - i;\r
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);\r
  vec2 du = 30.0 * f * f * (f * (f - 2.0) + 1.0);\r
  ivec2 c = ivec2(i);\r
  vec4 ga = corner(c, seed);\r
  vec4 gb = corner(c + ivec2(1, 0), seed);\r
  vec4 gc = corner(c + ivec2(0, 1), seed);\r
  vec4 gd = corner(c + ivec2(1, 1), seed);\r
  vec2 fb = f - vec2(1.0, 0.0);\r
  vec2 fc = f - vec2(0.0, 1.0);\r
  vec2 fd = f - vec2(1.0);\r
  vec2 va = vec2(dot(ga.xy, f), dot(ga.zw, f));\r
  vec2 vb = vec2(dot(gb.xy, fb), dot(gb.zw, fb));\r
  vec2 vc = vec2(dot(gc.xy, fc), dot(gc.zw, fc));\r
  vec2 vd = vec2(dot(gd.xy, fd), dot(gd.zw, fd));\r
  vec2 k = va - vb - vc + vd;\r
  vec4 g = ga + u.x * (gb - ga) + u.y * (gc - ga) + u.x * u.y * (ga - gb - gc + gd);\r
  jac = mat2(\r
    g.xy + du * (u.yx * k.x + vec2(vb.x - va.x, vc.x - va.x)),\r
    g.zw + du * (u.yx * k.y + vec2(vb.y - va.y, vc.y - va.y))\r
  );\r
  return va + u.x * (vb - va) + u.y * (vc - va) + u.x * u.y * k;\r
}\r
\r
float wobble(vec2 p, uint seed) {\r
  mat2 jac;\r
  return drift(p, seed, jac).x;\r
}\r
\r
vec2 ripple(vec2 p, out float surge) {\r
  vec2 push = vec2(0.0);\r
  surge = 0.0;\r
  float width = uUnit * 10.0;\r
  for (int i = 0; i < \${PULSES}; i++) {\r
    vec4 pulse = uPulses[i];\r
    if (pulse.w <= 0.0) continue;\r
    vec2 d = p - pulse.xy;\r
    float dist = length(d);\r
    float front = (dist - pulse.z * uUnit * 150.0) / width;\r
    float env = exp(-front * front) * pulse.w * exp(-pulse.z * 1.7) * smoothstep(0.0, uUnit * 8.0, dist);\r
    push += d / max(dist, 1.0) * env * cos(front * 2.2) * uUnit * 7.5;\r
    surge += env;\r
  }\r
  return push;\r
}\r
\r
vec2 wander(vec2 p, float t, uint seed, float reachScale, out mat2 jac, out vec2 sway) {\r
  vec2 q = p / uUnit;\r
  mat2 ja;\r
  mat2 jb;\r
  mat2 jc;\r
  mat2 jd;\r
  vec2 a = drift(q * 0.028 + vec2(t * 0.29, t * 0.21), seed, ja);\r
  vec2 b = drift(q * 0.085 + a * 0.4 + vec2(t * 0.83, -t * 0.61) + 17.0, seed + 1u, jb);\r
  vec2 c = drift(p / 9.0 + b * 0.6 + vec2(t * 1.9, t * 1.3) + 5.0, seed + 2u, jc);\r
  vec2 d = drift(p / 4.1 + vec2(-t * 2.7, t * 2.2) + 11.0, seed + 3u, jd);\r
  float bendAmp = uBend * 8.0 * reachScale;\r
  float rippleAmp = uBend * 3.2 * reachScale;\r
  float crinkleAmp = uCrackle * 1.5 * reachScale;\r
  jac = ja * (0.028 * bendAmp) + jb * (0.085 * rippleAmp) + jc * (crinkleAmp / 9.0) + jd * (crinkleAmp * 0.35 / 4.1);\r
  sway = (a * bendAmp + b * rippleAmp) * uUnit;\r
  return sway + (c + d * 0.35) * crinkleAmp;\r
}\r
\r
vec2 glowShape(float line, float spread, float w) {\r
  float x = abs(line);\r
  float y = abs(spread);\r
  return vec2(exp(-x * x / (w * w * 0.5)) + exp(-y / (w * 2.2)) * 0.6, exp(-y / (w * 4.5)) * 0.5);\r
}\r
\r
void addArc(vec2 p, vec4 ends, vec4 info, float t, inout vec3 light, inout float energy, inout float hot) {\r
  if (info.y < 0.002) return;\r
  vec2 ab = ends.zw - ends.xy;\r
  float len = max(length(ab), 1.0);\r
  vec2 dir = ab / len;\r
  vec2 rel = p - ends.xy;\r
  float s = dot(rel, dir);\r
  float h = dot(rel, vec2(-dir.y, dir.x));\r
  float margin = abs(info.x) + uCrackle * (2.0 + len * 0.08) + uThickness * 12.0 + 10.0;\r
  if (s < -margin || s > len + margin || abs(h) > margin) return;\r
  float u = clamp(s / len, 0.0, 1.0);\r
  float taper = sin(3.14159265 * u);\r
  float bendSlope = s > 0.0 && s < len ? 3.14159265 / len * cos(3.14159265 * u) : 0.0;\r
  float beyond = max(-s, 0.0) + max(s - len, 0.0);\r
  for (int c = 0; c < 2; c++) {\r
    uint seed = uint(info.z * 131.0) + uint(c) * 29u + 7u;\r
    float jag = 0.0;\r
    float jagSlope = 0.0;\r
    float wave = max(len * 0.3, 14.0);\r
    float weight = uCrackle * (1.5 + len * 0.05) * (c == 0 ? 1.0 : 1.5);\r
    for (int o = 0; o < 3; o++) {\r
      mat2 jac;\r
      float n = drift(vec2(s / wave + info.z * 3.0, t * (1.4 + float(o) * 1.1)), seed + uint(o), jac).x;\r
      jag += n * weight;\r
      jagSlope += jac[0].x * weight / wave;\r
      wave *= 0.42;\r
      weight *= 0.4;\r
    }\r
    float offset = (info.x + jag) * taper;\r
    float offsetSlope = (info.x + jag) * bendSlope + jagSlope * taper;\r
    float across = (h - offset) / sqrt(1.0 + offsetSlope * offsetSlope);\r
    float gap = length(vec2(beyond, across));\r
    float w = uThickness * (c == 0 ? 0.9 : 0.6);\r
    vec2 g = glowShape(gap, gap, w);\r
    float k = info.y * (c == 0 ? 1.0 : 0.45);\r
    light += (uColor * g.x + uGlowColor * g.y * uGlow) * k;\r
    energy += (g.x + g.y * uGlow) * k;\r
    hot += exp(-gap * gap / (w * w * 0.16)) * k * (c == 0 ? 1.0 : 0.0);\r
  }\r
}\r
\r
void main() {\r
  vec2 p = vec2(vUv.x, 1.0 - vUv.y) * uResolution;\r
  float t = uTime;\r
  vec3 light = vec3(0.0);\r
  float energy = 0.0;\r
  float hot = 0.0;\r
\r
  float surge;\r
  vec2 pr = p - ripple(p, surge);\r
  float k = uMorph >= 1.0 ? 1.0 : smoothstep(0.0, 1.0, clamp(uMorph * 1.7 - 0.35 + 0.35 * wobble(p / uUnit * 0.018, 41u), 0.0, 1.0));\r
  float transit = uMorph >= 1.0 ? 0.0 : sin(3.14159265 * uMorph);\r
  float base = shape(pr, k);\r
\r
  vec2 toHover = p - uHover.xy;\r
  float heat = min(uHover.z * exp(-dot(toHover, toHover) / (uHoverRadius * uHoverRadius)) + surge * 1.4 + transit * 0.5, 2.0);\r
  float heatCap = min(uHover.z + uPulseBoost * 1.4 + transit * 0.5, 2.0);\r
  float breath = 1.0 + uFlicker * 0.6 * wobble(vec2(t * 2.1, 7.0), 3u);\r
  float grow = uPresence;\r
\r
  float edge = abs(base);\r
  vec2 halo = aura(pr, k);\r
  float ink = uInk;\r
  float bloom = (halo.x * 0.16 + halo.y * 0.08) * (1.0 - ink * 0.65) * uGlow * (1.0 + heat * 1.2);\r
  float body = smoothstep(0.75, -0.75, base) * uFill * (0.06 + 1.2 * min(halo.x, 1.0)) * (1.0 + heat * 0.5);\r
  light += uGlowColor * bloom * grow * grow;\r
  energy += bloom * grow * grow;\r
\r
  float reachScale = mix(0.15, 1.0, grow) * (1.0 + heat * 0.9);\r
  float reach = (uUnit * uBend * 16.0 + uCrackle * 3.0) * (1.0 + heatCap * 0.9) + uThickness * 20.0 + 8.0;\r
  if (edge < reach && grow > 0.0) {\r
    float fade = smoothstep(reach, reach * 0.55, edge);\r
    vec2 q = pr / uUnit;\r
    float count = min(uStrands + heat * 2.5, 6.0);\r
    float limit = min(uStrands + heatCap * 2.5, 6.0);\r
    for (int i = 0; i < 6; i++) {\r
      float fi = float(i);\r
      if (fi >= limit) break;\r
      float present = clamp(count - fi, 0.0, 1.0);\r
      if (present <= 0.0) continue;\r
      uint seed = uint(i) * 7u + 3u;\r
      mat2 jac;\r
      vec2 sway;\r
      float lead = i == 0 ? 1.0 : 0.0;\r
      vec2 warped = pr + wander(pr, t * (1.0 + fi * 0.19), seed, reachScale * mix(0.6 + fi * 0.2, 0.7, lead), jac, sway);\r
      float dw = shape(warped, k);\r
      vec2 slope = vec2(shape(warped + vec2(1.0, 0.0), k), shape(warped + vec2(0.0, 1.0), k)) - dw;\r
      float d = dw / max(length(slope + jac * slope), 0.3);\r
      float spread = shape(pr + sway, k);\r
      float swell = 0.5 + 0.5 * wobble(q * 0.06 + vec2(t * 0.9, fi * 5.1 - t * 0.6), seed + 8u);\r
      float w = uThickness * mix(0.5, 1.0, lead) * (0.5 + swell);\r
      float vis = mix(0.3 + 0.45 * smoothstep(-0.25, 0.2, wobble(q * 0.035 + vec2(t * 0.21, fi * 3.7), seed + 5u)), 1.0, lead);\r
      float spark = 1.0 - uFlicker * 0.3 * (0.5 + 0.5 * wobble(vec2(t * 6.0, fi * 2.3), seed + 6u));\r
      float weight = max(vis, heat * 0.85) * spark * fade * present * (0.7 + 0.6 * swell);\r
      vec2 g = glowShape(d, spread, w) * weight;\r
      float soft = mix(1.0, mix(0.5, 1.0, lead), ink);\r
      vec3 stroke = mix(uColor, uGlowColor, ink * (1.0 - lead) * 0.65);\r
      float haze = uGlow * (1.0 + heat) * (1.0 - ink * 0.7);\r
      light += stroke * g.x * soft + uGlowColor * g.y * haze;\r
      energy += g.x * soft + g.y * haze;\r
      hot += exp(-d * d / (w * w * 0.16)) * lead * weight;\r
    }\r
    light *= grow;\r
    energy *= grow;\r
  }\r
\r
  for (int i = 0; i < \${ARCS}; i++) addArc(pr, uArcEnds[i], uArcShape[i], t, light, energy, hot);\r
\r
  float gain = uIntensity * breath * (1.0 + heat * 0.45) * (1.0 + uFlash * 0.3) * 1.4;\r
  float alpha = 1.0 - exp(-energy * gain);\r
  vec3 color = mix(1.0 - exp(-light * gain), alpha * light / max(energy, 1e-4), ink);\r
  color = mix(color, vec3(alpha), clamp(hot * grow, 0.0, 1.0) * ink * 0.85);\r
  float tint = (1.0 - exp(-body * gain * 1.2)) * grow * grow * (1.0 - ink * 0.82);\r
  color += uGlowColor * tint * (1.0 - alpha);\r
  alpha += tint * (1.0 - alpha);\r
  float grain = (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;\r
  alpha = clamp(alpha + grain, 0.0, 1.0);\r
  fragColor = vec4(clamp(color + grain, 0.0, alpha), alpha);\r
}\r
\`;\r
\r
const ElectricLogo = ({\r
  src = BOLT,\r
  color = '#ecc7ff',\r
  glowColor = '#ad6dff',\r
  scale = 0.7,\r
  intensity = 1,\r
  glow = 1,\r
  thickness = 1.5,\r
  strands = 4,\r
  bend = 0.6,\r
  crackle = 1.5,\r
  arcs = 1,\r
  flicker = 0.6,\r
  fill = 0,\r
  speed = 2.5,\r
  interactive = true,\r
  cursorIntensity = 0.75,\r
  cursorRadius = 100,\r
  theme = 'dark',\r
  onRender,\r
  className = '',\r
  style\r
}: ElectricLogoProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const settingsRef = useRef<Settings | null>(null);\r
  const shapeRef = useRef<Shape | null>(null);\r
\r
  useEffect(() => {\r
    settingsRef.current = {\r
      color,\r
      glowColor,\r
      scale,\r
      intensity,\r
      glow,\r
      thickness,\r
      strands,\r
      bend,\r
      crackle,\r
      arcs,\r
      flicker,\r
      fill,\r
      speed,\r
      interactive,\r
      cursorIntensity,\r
      cursorRadius,\r
      theme,\r
      onRender\r
    };\r
  });\r
\r
  useEffect(() => {\r
    let alive = true;\r
    const image = new Image();\r
    image.crossOrigin = 'anonymous';\r
    image.decoding = 'async';\r
    image.onload = () => {\r
      if (!alive) return;\r
      let traced: Shape | null = null;\r
      try {\r
        traced = traceShape(image);\r
      } catch {\r
        traced = null;\r
      }\r
      if (traced) shapeRef.current = traced;\r
    };\r
    image.src = src || BOLT;\r
    return () => {\r
      alive = false;\r
      image.onload = null;\r
    };\r
  }, [src]);\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    if (!container) return undefined;\r
\r
    const renderer = new Renderer({\r
      dpr: Math.min(window.devicePixelRatio || 1, 2),\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false\r
    });\r
    const gl = renderer.gl;\r
    const gl2 = gl as WebGL2RenderingContext;\r
    if (!renderer.isWebgl2) {\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
      return undefined;\r
    }\r
    gl.clearColor(0, 0, 0, 0);\r
    const canvas = gl.canvas;\r
    canvas.style.display = 'block';\r
    canvas.style.width = '100%';\r
    canvas.style.height = '100%';\r
    container.appendChild(canvas);\r
\r
    const makeSlot = (): Slot => ({\r
      shape: null,\r
      field: new Texture(gl, {\r
        image: new Float32Array([1000]),\r
        width: 1,\r
        height: 1,\r
        internalFormat: gl2.R16F,\r
        format: gl2.RED,\r
        type: gl.FLOAT,\r
        minFilter: gl.LINEAR,\r
        magFilter: gl.LINEAR,\r
        generateMipmaps: false,\r
        flipY: false,\r
        unpackAlignment: 1\r
      }),\r
      glow: new Texture(gl, {\r
        image: new Float32Array([0, 0]),\r
        width: 1,\r
        height: 1,\r
        internalFormat: gl2.RG16F,\r
        format: gl2.RG,\r
        type: gl.FLOAT,\r
        minFilter: gl.LINEAR,\r
        magFilter: gl.LINEAR,\r
        generateMipmaps: false,\r
        flipY: false,\r
        unpackAlignment: 1\r
      })\r
    });\r
    const slots = [makeSlot(), makeSlot()];\r
\r
    const arcEnds = Array.from({ length: ARCS * 4 }, () => 0);\r
    const arcShape = Array.from({ length: ARCS * 4 }, () => 0);\r
    const pulseData = Array.from({ length: PULSES * 4 }, () => 0);\r
    const uniforms = {\r
      tFieldFrom: { value: slots[1].field },\r
      tGlowFrom: { value: slots[1].glow },\r
      tFieldTo: { value: slots[0].field },\r
      tGlowTo: { value: slots[0].glow },\r
      uMapFrom: { value: [0, 0, 1, 0] },\r
      uSizeFrom: { value: [1, 1, 1, 1] },\r
      uMapTo: { value: [0, 0, 1, 0] },\r
      uSizeTo: { value: [1, 1, 1, 1] },\r
      uMorph: { value: 1 },\r
      uResolution: { value: [1, 1] },\r
      uUnit: { value: 1 },\r
      uTime: { value: 0 },\r
      uPresence: { value: 0 },\r
      uHover: { value: [0, 0, 0] },\r
      uHoverRadius: { value: 120 },\r
      uPulses: { value: pulseData },\r
      uPulseBoost: { value: 0 },\r
      uFlash: { value: 0 },\r
      uColor: { value: [1, 1, 1] },\r
      uGlowColor: { value: [0.43, 0.48, 1] },\r
      uIntensity: { value: 1 },\r
      uGlow: { value: 1 },\r
      uThickness: { value: 1.8 },\r
      uStrands: { value: 3 },\r
      uBend: { value: 1 },\r
      uCrackle: { value: 1 },\r
      uFlicker: { value: 0.4 },\r
      uFill: { value: 0.5 },\r
      uInk: { value: 0 },\r
      uArcEnds: { value: arcEnds },\r
      uArcShape: { value: arcShape }\r
    };\r
    const mesh = new Mesh(gl, {\r
      geometry: new Triangle(gl),\r
      program: new Program(gl, { vertex, fragment, uniforms, depthTest: false, depthWrite: false })\r
    });\r
\r
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const pointer = { x: 0, y: 0, over: false };\r
    const hover = { x: 0, y: 0, vx: 0, vy: 0, power: 0 };\r
    const sparks: Spark[] = [];\r
    const pulses: Pulse[] = [];\r
    let target = 0;\r
    let pending: Shape | null = null;\r
    let morph = 1;\r
    let burst: Point | null = null;\r
    let progress = 0;\r
    let ink = 0;\r
    const hues = [\r
      [1, 1, 1],\r
      [1, 1, 1]\r
    ];\r
    let settled = false;\r
    let time = 0;\r
    let width = 1;\r
    let height = 1;\r
    let raf = 0;\r
    let last = performance.now();\r
    let visible = true;\r
\r
    const load = (slot: Slot, next: Shape) => {\r
      slot.shape = next;\r
      slot.field.image = next.field;\r
      slot.field.width = next.width;\r
      slot.field.height = next.height;\r
      slot.field.needsUpdate = true;\r
      slot.glow.image = next.glow;\r
      slot.glow.width = next.glowWidth;\r
      slot.glow.height = next.glowHeight;\r
      slot.glow.needsUpdate = true;\r
    };\r
\r
    const place = (shape: Shape, s: Settings) => {\r
      const fit = Math.max(1e-4, Math.min((width * s.scale) / shape.logoWidth, (height * s.scale) / shape.logoHeight));\r
      return {\r
        fit,\r
        ox: width / 2 - (shape.pad + shape.logoWidth / 2) * fit,\r
        oy: height / 2 - (shape.pad + shape.logoHeight / 2) * fit,\r
        unit: (Math.max(shape.logoWidth, shape.logoHeight) * fit) / 100\r
      };\r
    };\r
\r
    const resize = () => {\r
      width = Math.max(1, container.clientWidth);\r
      height = Math.max(1, container.clientHeight);\r
      renderer.dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(PIXEL_BUDGET / (width * height)));\r
      renderer.setSize(width, height);\r
      uniforms.uResolution.value = [width, height];\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      const s = settingsRef.current;\r
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));\r
      last = now;\r
\r
      const incoming = shapeRef.current;\r
      if (incoming && incoming !== slots[target].shape) pending = incoming;\r
      if (pending && morph >= 1) {\r
        if (slots[target].shape) {\r
          target = 1 - target;\r
          morph = 0;\r
          sparks.length = 0;\r
        }\r
        load(slots[target], pending);\r
        pending = null;\r
      }\r
      if (morph < 1) morph = Math.min(1, morph + dt / (pending ? 0.3 : 1.6));\r
\r
      const to = slots[target].shape;\r
      const from = morph < 1 ? slots[1 - target].shape : null;\r
      if (to) progress = Math.min(1, progress + dt / 1.4);\r
      const presence = progress * progress * (3 - 2 * progress);\r
\r
      if (to && s) {\r
        const near = place(to, s);\r
        const far = from ? place(from, s) : near;\r
        const blend = morph * morph * (3 - 2 * morph);\r
        const unit = far.unit + (near.unit - far.unit) * blend;\r
\r
        const engaged = s.interactive && pointer.over;\r
        if (engaged && hover.power < 0.01) {\r
          hover.x = pointer.x;\r
          hover.y = pointer.y;\r
          hover.vx = 0;\r
          hover.vy = 0;\r
        }\r
        hover.vx += ((pointer.x - hover.x) * 120 - hover.vx * 19) * dt;\r
        hover.vy += ((pointer.y - hover.y) * 120 - hover.vy * 19) * dt;\r
        hover.x += hover.vx * dt;\r
        hover.y += hover.vy * dt;\r
        hover.power += ((engaged ? 1 : 0) - hover.power) * (1 - Math.exp(-dt / (engaged ? 0.3 : 0.55)));\r
\r
        const motion = reducedMotion ? 0.2 : 1;\r
        time += dt * s.speed * motion;\r
\r
        for (let i = sparks.length - 1; i >= 0; i--) {\r
          if (time - sparks[i].born > sparks[i].life) sparks.splice(i, 1);\r
        }\r
        const focus = (spot: Point): Focus => ({\r
          x: (spot.x - near.ox) / near.fit,\r
          y: (spot.y - near.oy) / near.fit,\r
          radius: Math.max(1, s.cursorRadius) / near.fit\r
        });\r
        if (burst && morph >= 1 && s.arcs > 0) {\r
          for (let i = 0; i < 3 && sparks.length < ARCS; i++) {\r
            const spark = spawnArc(to, time, focus(burst));\r
            if (spark) sparks.push(spark);\r
          }\r
        }\r
        burst = null;\r
        if (!reducedMotion && presence > 0.8 && morph >= 1 && sparks.length < ARCS) {\r
          const chance = dt * s.speed * s.arcs;\r
          if (Math.random() < chance * 6 * hover.power * s.cursorIntensity) {\r
            const spark = spawnArc(to, time, focus(hover));\r
            if (spark) sparks.push(spark);\r
          } else if (Math.random() < chance * 2.2) {\r
            const spark = spawnArc(to, time, null);\r
            if (spark) sparks.push(spark);\r
          }\r
        }\r
\r
        for (let i = 0; i < ARCS; i++) {\r
          const o = i * 4;\r
          const spark = sparks[i];\r
          if (!spark) {\r
            arcShape[o + 1] = 0;\r
            continue;\r
          }\r
          const k = (time - spark.born) / spark.life;\r
          arcEnds[o] = near.ox + spark.ax * near.fit;\r
          arcEnds[o + 1] = near.oy + spark.ay * near.fit;\r
          arcEnds[o + 2] = near.ox + spark.bx * near.fit;\r
          arcEnds[o + 3] = near.oy + spark.by * near.fit;\r
          arcShape[o] = spark.bow * near.fit;\r
          arcShape[o + 1] = Math.sin(Math.PI * Math.min(1, Math.max(0, k))) * presence;\r
          arcShape[o + 2] = spark.seed;\r
        }\r
\r
        let boost = 0;\r
        let flash = 0;\r
        for (let i = pulses.length - 1; i >= 0; i--) {\r
          if ((now - pulses[i].born) / 1000 > 2) pulses.splice(i, 1);\r
        }\r
        for (let i = 0; i < PULSES; i++) {\r
          const o = i * 4;\r
          const pulse = pulses[i];\r
          if (!pulse) {\r
            pulseData[o + 3] = 0;\r
            continue;\r
          }\r
          const age = (now - pulse.born) / 1000;\r
          pulseData[o] = pulse.x;\r
          pulseData[o + 1] = pulse.y;\r
          pulseData[o + 2] = age;\r
          pulseData[o + 3] = 1;\r
          boost = Math.max(boost, Math.exp(-age * 1.7));\r
          flash += Math.exp(-age * 7);\r
        }\r
\r
        const fromSlot = slots[1 - target];\r
        uniforms.tFieldTo.value = slots[target].field;\r
        uniforms.tGlowTo.value = slots[target].glow;\r
        uniforms.tFieldFrom.value = fromSlot.field;\r
        uniforms.tGlowFrom.value = fromSlot.glow;\r
        uniforms.uMapTo.value = [near.ox, near.oy, near.fit, to.glowOffset];\r
        uniforms.uSizeTo.value = [to.width, to.height, to.glowWidth, to.glowHeight];\r
        if (from) {\r
          uniforms.uMapFrom.value = [far.ox, far.oy, far.fit, from.glowOffset];\r
          uniforms.uSizeFrom.value = [from.width, from.height, from.glowWidth, from.glowHeight];\r
        }\r
        uniforms.uMorph.value = morph;\r
        uniforms.uUnit.value = unit;\r
        uniforms.uTime.value = time;\r
        uniforms.uPresence.value = presence;\r
        uniforms.uHover.value = [hover.x, hover.y, hover.power * Math.max(0, s.cursorIntensity)];\r
        uniforms.uHoverRadius.value = Math.max(1, s.cursorRadius);\r
        uniforms.uPulseBoost.value = boost;\r
        uniforms.uFlash.value = flash;\r
        const targets = [hexToRgb(s.color), hexToRgb(s.glowColor)];\r
        const shift = settled ? 1 - Math.exp(-dt / 0.35) : 1;\r
        settled = true;\r
        for (let i = 0; i < 2; i++) {\r
          for (let c = 0; c < 3; c++) hues[i][c] += (targets[i][c] - hues[i][c]) * shift;\r
        }\r
        uniforms.uColor.value = hues[0].slice();\r
        uniforms.uGlowColor.value = hues[1].slice();\r
        uniforms.uIntensity.value = s.intensity;\r
        uniforms.uGlow.value = s.glow;\r
        uniforms.uThickness.value = s.thickness;\r
        uniforms.uStrands.value = Math.max(1, Math.min(6, Math.round(s.strands)));\r
        uniforms.uBend.value = s.bend;\r
        uniforms.uCrackle.value = s.crackle;\r
        uniforms.uFlicker.value = reducedMotion ? 0 : s.flicker;\r
        ink += ((s.theme === 'light' ? 1 : 0) - ink) * (1 - Math.exp(-dt / 0.25));\r
        uniforms.uFill.value = s.fill;\r
        uniforms.uInk.value = ink;\r
        renderer.render({ scene: mesh });\r
        s.onRender?.(canvas);\r
      }\r
\r
      if (visible) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const start = () => {\r
      if (raf || !visible) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const onMove = (e: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      pointer.x = e.clientX - rect.left;\r
      pointer.y = e.clientY - rect.top;\r
      pointer.over = true;\r
    };\r
    const onDown = (e: PointerEvent) => {\r
      onMove(e);\r
      if (!settingsRef.current?.interactive || reducedMotion) return;\r
      pulses.push({ x: pointer.x, y: pointer.y, born: performance.now() });\r
      if (pulses.length > PULSES) pulses.shift();\r
      burst = { x: pointer.x, y: pointer.y };\r
    };\r
    const onLeave = () => {\r
      pointer.over = false;\r
    };\r
    container.addEventListener('pointermove', onMove);\r
    container.addEventListener('pointerdown', onDown);\r
    container.addEventListener('pointerleave', onLeave);\r
    container.addEventListener('pointercancel', onLeave);\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(container);\r
    const intersectionObserver = new IntersectionObserver(([entry]) => {\r
      visible = entry.isIntersecting;\r
      start();\r
    });\r
    intersectionObserver.observe(container);\r
\r
    resize();\r
    start();\r
\r
    return () => {\r
      visible = false;\r
      cancelAnimationFrame(raf);\r
      resizeObserver.disconnect();\r
      intersectionObserver.disconnect();\r
      container.removeEventListener('pointermove', onMove);\r
      container.removeEventListener('pointerdown', onDown);\r
      container.removeEventListener('pointerleave', onLeave);\r
      container.removeEventListener('pointercancel', onLeave);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);\r
    };\r
  }, []);\r
\r
  return <div ref={containerRef} className={\`electric-logo \${className}\`.trim()} style={style} />;\r
};\r
\r
export default ElectricLogo;\r
`,o=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
import type { CSSProperties } from 'react';\r
import { Renderer, Program, Mesh, Triangle, Texture } from 'ogl';\r
\r
const BOLT = \`data:image/svg+xml;charset=utf-8,\${encodeURIComponent(\r
  '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><path d="M39 3 12 37h17l-4 24 27-34H35z" fill="#fff"/></svg>'\r
)}\`;\r
const RASTER = 560;\r
const CELL = 4;\r
const FAR = 1e20;\r
const ARCS = 5;\r
const PULSES = 3;\r
const PIXEL_BUDGET = 4e6;\r
\r
type Rgb = [number, number, number];\r
\r
export interface ElectricLogoProps {\r
  src?: string;\r
  color?: string;\r
  glowColor?: string;\r
  scale?: number;\r
  intensity?: number;\r
  glow?: number;\r
  thickness?: number;\r
  strands?: number;\r
  bend?: number;\r
  crackle?: number;\r
  arcs?: number;\r
  flicker?: number;\r
  fill?: number;\r
  speed?: number;\r
  interactive?: boolean;\r
  cursorIntensity?: number;\r
  cursorRadius?: number;\r
  theme?: 'dark' | 'light';\r
  onRender?: (canvas: HTMLCanvasElement) => void;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
type Settings = Required<Omit<ElectricLogoProps, 'src' | 'className' | 'style' | 'onRender'>> &\r
  Pick<ElectricLogoProps, 'onRender'>;\r
\r
interface Shape {\r
  field: Float32Array;\r
  edges: number[];\r
  width: number;\r
  height: number;\r
  pad: number;\r
  logoWidth: number;\r
  logoHeight: number;\r
  glow: Float32Array;\r
  glowWidth: number;\r
  glowHeight: number;\r
  glowOffset: number;\r
}\r
\r
interface Slot {\r
  shape: Shape | null;\r
  field: Texture;\r
  glow: Texture;\r
}\r
\r
interface Pulse {\r
  x: number;\r
  y: number;\r
  born: number;\r
}\r
\r
interface Point {\r
  x: number;\r
  y: number;\r
}\r
\r
interface Focus {\r
  x: number;\r
  y: number;\r
  radius: number;\r
}\r
\r
interface Spark {\r
  ax: number;\r
  ay: number;\r
  bx: number;\r
  by: number;\r
  bow: number;\r
  seed: number;\r
  born: number;\r
  life: number;\r
}\r
\r
const hexToRgb = (hex: string): Rgb => {\r
  let h = String(hex || '').replace('#', '');\r
  if (h.length === 3) h = h.replace(/./g, c => c + c);\r
  const n = parseInt(h.slice(0, 6), 16);\r
  return Number.isNaN(n) ? [1, 1, 1] : [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];\r
};\r
\r
const transformLine = (f: Float64Array, d: Float64Array, v: Int32Array, z: Float64Array, n: number) => {\r
  let k = 0;\r
  v[0] = 0;\r
  z[0] = -FAR;\r
  z[1] = FAR;\r
  for (let q = 1; q < n; q++) {\r
    let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);\r
    while (s <= z[k]) {\r
      k--;\r
      s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);\r
    }\r
    k++;\r
    v[k] = q;\r
    z[k] = s;\r
    z[k + 1] = FAR;\r
  }\r
  k = 0;\r
  for (let q = 0; q < n; q++) {\r
    while (z[k + 1] < q) k++;\r
    d[q] = (q - v[k]) * (q - v[k]) + f[v[k]];\r
  }\r
};\r
\r
const transformGrid = (grid: Float32Array, w: number, h: number) => {\r
  const n = Math.max(w, h);\r
  const f = new Float64Array(n);\r
  const d = new Float64Array(n);\r
  const v = new Int32Array(n);\r
  const z = new Float64Array(n + 1);\r
  for (let x = 0; x < w; x++) {\r
    for (let y = 0; y < h; y++) f[y] = grid[y * w + x];\r
    transformLine(f, d, v, z, h);\r
    for (let y = 0; y < h; y++) grid[y * w + x] = d[y];\r
  }\r
  for (let y = 0; y < h; y++) {\r
    for (let x = 0; x < w; x++) f[x] = grid[y * w + x];\r
    transformLine(f, d, v, z, w);\r
    for (let x = 0; x < w; x++) grid[y * w + x] = d[x];\r
  }\r
};\r
\r
const blurLine = (src: Float32Array, dst: Float32Array, offset: number, stride: number, n: number, r: number) => {\r
  const scale = 1 / (2 * r + 1);\r
  let sum = 0;\r
  for (let i = 0; i <= r && i < n; i++) sum += src[offset + i * stride];\r
  for (let i = 0; i < n; i++) {\r
    dst[offset + i * stride] = sum * scale;\r
    if (i + r + 1 < n) sum += src[offset + (i + r + 1) * stride];\r
    if (i - r >= 0) sum -= src[offset + (i - r) * stride];\r
  }\r
};\r
\r
const blurGrid = (grid: Float32Array, w: number, h: number, r: number) => {\r
  const tmp = new Float32Array(w * h);\r
  for (let pass = 0; pass < 3; pass++) {\r
    for (let y = 0; y < h; y++) blurLine(grid, tmp, y * w, 1, w, r);\r
    for (let x = 0; x < w; x++) blurLine(tmp, grid, x, w, h, r);\r
  }\r
};\r
\r
const readCoverage = (data: Uint8ClampedArray, w: number, h: number) => {\r
  const coverage = new Float32Array(w * h);\r
  let clear = 0;\r
  for (let i = 0; i < w * h; i++) if (data[i * 4 + 3] < 250) clear++;\r
  if (clear > w * h * 0.01) {\r
    for (let i = 0; i < w * h; i++) coverage[i] = data[i * 4 + 3] / 255;\r
    return coverage;\r
  }\r
  let r = 0;\r
  let g = 0;\r
  let b = 0;\r
  let n = 0;\r
  const sample = (i: number) => {\r
    r += data[i * 4];\r
    g += data[i * 4 + 1];\r
    b += data[i * 4 + 2];\r
    n++;\r
  };\r
  for (let x = 0; x < w; x++) {\r
    sample(x);\r
    sample((h - 1) * w + x);\r
  }\r
  for (let y = 0; y < h; y++) {\r
    sample(y * w);\r
    sample(y * w + w - 1);\r
  }\r
  r /= n;\r
  g /= n;\r
  b /= n;\r
  for (let i = 0; i < w * h; i++) {\r
    const diff = Math.max(Math.abs(data[i * 4] - r), Math.abs(data[i * 4 + 1] - g), Math.abs(data[i * 4 + 2] - b));\r
    coverage[i] = Math.min(1, Math.max(0, (diff - 24) / 48));\r
  }\r
  return coverage;\r
};\r
\r
const sampleField = (shape: Shape, x: number, y: number) => {\r
  const { field, width, height } = shape;\r
  const cx = Math.min(Math.max(x, 0.5), width - 0.5);\r
  const cy = Math.min(Math.max(y, 0.5), height - 0.5);\r
  const x0 = Math.min(Math.floor(cx - 0.5), width - 2);\r
  const y0 = Math.min(Math.floor(cy - 0.5), height - 2);\r
  const tx = cx - 0.5 - x0;\r
  const ty = cy - 0.5 - y0;\r
  const i = y0 * width + x0;\r
  const top = field[i] + (field[i + 1] - field[i]) * tx;\r
  const bottom = field[i + width] + (field[i + width + 1] - field[i + width]) * tx;\r
  return top + (bottom - top) * ty + Math.hypot(x - cx, y - cy);\r
};\r
\r
const traceShape = (image: HTMLImageElement): Shape | null => {\r
  const iw = image.naturalWidth || image.width;\r
  const ih = image.naturalHeight || image.height;\r
  if (!iw || !ih) return null;\r
  const fit = RASTER / Math.max(iw, ih);\r
  const w = Math.max(2, Math.round(iw * fit));\r
  const h = Math.max(2, Math.round(ih * fit));\r
  const canvas = document.createElement('canvas');\r
  canvas.width = w;\r
  canvas.height = h;\r
  const ctx = canvas.getContext('2d', { willReadFrequently: true });\r
  if (!ctx) return null;\r
  ctx.drawImage(image, 0, 0, w, h);\r
  const coverage = readCoverage(ctx.getImageData(0, 0, w, h).data, w, h);\r
\r
  let left = w;\r
  let top = h;\r
  let right = -1;\r
  let bottom = -1;\r
  for (let y = 0; y < h; y++) {\r
    for (let x = 0; x < w; x++) {\r
      if (coverage[y * w + x] <= 0.01) continue;\r
      if (x < left) left = x;\r
      if (x > right) right = x;\r
      if (y < top) top = y;\r
      if (y > bottom) bottom = y;\r
    }\r
  }\r
  if (right < 0) return null;\r
\r
  const logoWidth = right - left + 1;\r
  const logoHeight = bottom - top + 1;\r
  const pad = Math.ceil(Math.max(logoWidth, logoHeight) * 0.25) + 2;\r
  const width = logoWidth + pad * 2;\r
  const height = logoHeight + pad * 2;\r
  const outer = new Float32Array(width * height);\r
  const inner = new Float32Array(width * height);\r
  for (let y = 0; y < height; y++) {\r
    for (let x = 0; x < width; x++) {\r
      const sx = x - pad + left;\r
      const sy = y - pad + top;\r
      const a = sx >= 0 && sy >= 0 && sx < w && sy < h ? coverage[sy * w + sx] : 0;\r
      const i = y * width + x;\r
      if (a >= 1) {\r
        outer[i] = 0;\r
        inner[i] = FAR;\r
      } else if (a <= 0) {\r
        outer[i] = FAR;\r
        inner[i] = 0;\r
      } else {\r
        const e = 0.5 - a;\r
        outer[i] = e > 0 ? e * e : 0;\r
        inner[i] = e < 0 ? e * e : 0;\r
      }\r
    }\r
  }\r
  transformGrid(outer, width, height);\r
  transformGrid(inner, width, height);\r
\r
  const field = new Float32Array(width * height);\r
  for (let i = 0; i < width * height; i++) field[i] = Math.sqrt(outer[i]) - Math.sqrt(inner[i]);\r
\r
  const points: number[] = [];\r
  for (let y = 1; y < height - 1; y++) {\r
    for (let x = 1; x < width - 1; x++) {\r
      const i = y * width + x;\r
      const d = field[i];\r
      if (d > 0) continue;\r
      if (field[i - 1] <= 0 && field[i + 1] <= 0 && field[i - width] <= 0 && field[i + width] <= 0) continue;\r
      const gx = field[i + 1] - field[i - 1];\r
      const gy = field[i + width] - field[i - width];\r
      const len = Math.hypot(gx, gy) || 1;\r
      points.push(x + 0.5 - (d * gx) / len, y + 0.5 - (d * gy) / len);\r
    }\r
  }\r
  const stride = Math.max(1, Math.ceil(points.length / 2 / 3000)) * 2;\r
  const edges: number[] = [];\r
  for (let i = 0; i < points.length; i += stride) edges.push(points[i], points[i + 1]);\r
\r
  const size = Math.max(logoWidth, logoHeight);\r
  const glowPad = Math.ceil((size * 0.7) / CELL);\r
  const glowWidth = Math.ceil(logoWidth / CELL) + glowPad * 2;\r
  const glowHeight = Math.ceil(logoHeight / CELL) + glowPad * 2;\r
  const tight = new Float32Array(glowWidth * glowHeight);\r
  for (let y = 0; y < height; y++) {\r
    const gy = Math.floor((y - pad) / CELL) + glowPad;\r
    for (let x = 0; x < width; x++) {\r
      const gx = Math.floor((x - pad) / CELL) + glowPad;\r
      tight[gy * glowWidth + gx] += Math.exp(-Math.abs(field[y * width + x]) / 1.5) / (CELL * CELL);\r
    }\r
  }\r
  const wide = tight.slice();\r
  const tightRadius = Math.max(1, Math.round((size * 0.035) / CELL));\r
  const wideRadius = Math.max(2, Math.round((size * 0.13) / CELL));\r
  blurGrid(tight, glowWidth, glowHeight, tightRadius);\r
  blurGrid(wide, glowWidth, glowHeight, wideRadius);\r
  const tightNorm = (Math.sqrt(2 * Math.PI * (tightRadius * tightRadius + tightRadius)) * CELL) / 3;\r
  const wideNorm = (Math.sqrt(2 * Math.PI * (wideRadius * wideRadius + wideRadius)) * CELL) / 3;\r
  const glow = new Float32Array(glowWidth * glowHeight * 2);\r
  for (let i = 0; i < glowWidth * glowHeight; i++) {\r
    glow[i * 2] = tight[i] * tightNorm;\r
    glow[i * 2 + 1] = wide[i] * wideNorm;\r
  }\r
\r
  return {\r
    field,\r
    edges,\r
    width,\r
    height,\r
    pad,\r
    logoWidth,\r
    logoHeight,\r
    glow,\r
    glowWidth,\r
    glowHeight,\r
    glowOffset: pad - glowPad * CELL\r
  };\r
};\r
\r
const spawnArc = (shape: Shape, time: number, focus: Focus | null): Spark | null => {\r
  const { edges, logoWidth, logoHeight } = shape;\r
  const count = edges.length / 2;\r
  if (count < 2) return null;\r
  const size = Math.max(logoWidth, logoHeight);\r
  let i = Math.floor(Math.random() * count);\r
  if (focus) {\r
    let found = false;\r
    for (let attempt = 0; attempt < 40 && !found; attempt++) {\r
      const j = Math.floor(Math.random() * count);\r
      if (Math.hypot(edges[j * 2] - focus.x, edges[j * 2 + 1] - focus.y) < focus.radius) {\r
        i = j;\r
        found = true;\r
      }\r
    }\r
    if (!found) return null;\r
  }\r
  const ax = edges[i * 2];\r
  const ay = edges[i * 2 + 1];\r
  for (let attempt = 0; attempt < 24; attempt++) {\r
    const j = Math.floor(Math.random() * count);\r
    const bx = edges[j * 2];\r
    const by = edges[j * 2 + 1];\r
    const len = Math.hypot(bx - ax, by - ay);\r
    if (len < size * 0.08 || len > size * 0.3) continue;\r
    const nx = -(by - ay) / len;\r
    const ny = (bx - ax) / len;\r
    const bow = len * (0.2 + Math.random() * 0.3);\r
    const mx = (ax + bx) / 2;\r
    const my = (ay + by) / 2;\r
    const left = sampleField(shape, mx + nx * bow, my + ny * bow);\r
    const right = sampleField(shape, mx - nx * bow, my - ny * bow);\r
    if (Math.max(left, right) <= 0) continue;\r
    return {\r
      ax,\r
      ay,\r
      bx,\r
      by,\r
      bow: left >= right ? bow : -bow,\r
      seed: 1 + Math.random() * 60,\r
      born: time,\r
      life: 0.35 + Math.random() * 0.45\r
    };\r
  }\r
  return null;\r
};\r
\r
const vertex = \`#version 300 es\r
in vec2 position;\r
in vec2 uv;\r
out vec2 vUv;\r
void main() {\r
  vUv = uv;\r
  gl_Position = vec4(position, 0.0, 1.0);\r
}\r
\`;\r
\r
const fragment = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
\r
uniform sampler2D tFieldFrom;\r
uniform sampler2D tGlowFrom;\r
uniform sampler2D tFieldTo;\r
uniform sampler2D tGlowTo;\r
uniform vec4 uMapFrom;\r
uniform vec4 uSizeFrom;\r
uniform vec4 uMapTo;\r
uniform vec4 uSizeTo;\r
uniform float uMorph;\r
uniform vec2 uResolution;\r
uniform float uUnit;\r
uniform float uTime;\r
uniform float uPresence;\r
uniform vec3 uHover;\r
uniform float uHoverRadius;\r
uniform vec4 uPulses[\${PULSES}];\r
uniform float uPulseBoost;\r
uniform float uFlash;\r
uniform vec3 uColor;\r
uniform vec3 uGlowColor;\r
uniform float uIntensity;\r
uniform float uGlow;\r
uniform float uThickness;\r
uniform float uStrands;\r
uniform float uBend;\r
uniform float uCrackle;\r
uniform float uFlicker;\r
uniform float uFill;\r
uniform float uInk;\r
uniform vec4 uArcEnds[\${ARCS}];\r
uniform vec4 uArcShape[\${ARCS}];\r
\r
in vec2 vUv;\r
out vec4 fragColor;\r
\r
uint scramble(uint x) {\r
  x ^= x >> 16u;\r
  x *= 0x7feb352du;\r
  x ^= x >> 15u;\r
  x *= 0x846ca68bu;\r
  x ^= x >> 16u;\r
  return x;\r
}\r
\r
float fieldAt(sampler2D tex, vec4 map, vec4 size, vec2 p) {\r
  vec2 f = (p - map.xy) / map.z;\r
  vec2 c = clamp(f, vec2(0.5), size.xy - 0.5);\r
  return (textureLod(tex, c / size.xy, 0.0).r + length(f - c)) * map.z;\r
}\r
\r
vec2 glowAt(sampler2D tex, vec4 map, vec4 size, vec2 p) {\r
  vec2 f = (p - map.xy) / map.z - map.w;\r
  return textureLod(tex, f / (size.zw * \${CELL}.0), 0.0).rg;\r
}\r
\r
float shape(vec2 p, float k) {\r
  float to = fieldAt(tFieldTo, uMapTo, uSizeTo, p);\r
  if (k >= 1.0) return to;\r
  return mix(fieldAt(tFieldFrom, uMapFrom, uSizeFrom, p), to, k);\r
}\r
\r
vec2 aura(vec2 p, float k) {\r
  vec2 to = glowAt(tGlowTo, uMapTo, uSizeTo, p);\r
  if (k >= 1.0) return to;\r
  return mix(glowAt(tGlowFrom, uMapFrom, uSizeFrom, p), to, k);\r
}\r
\r
vec4 corner(ivec2 c, uint seed) {\r
  uint h = scramble(uint(c.x) * 0x8da6b343u + uint(c.y) * 0xd8163841u + seed * 0xcb1ab31fu);\r
  return vec4(uvec4(h, h >> 8u, h >> 16u, h >> 24u) & 255u) / 127.5 - 1.0;\r
}\r
\r
vec2 drift(vec2 p, uint seed, out mat2 jac) {\r
  vec2 i = floor(p);\r
  vec2 f = p - i;\r
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);\r
  vec2 du = 30.0 * f * f * (f * (f - 2.0) + 1.0);\r
  ivec2 c = ivec2(i);\r
  vec4 ga = corner(c, seed);\r
  vec4 gb = corner(c + ivec2(1, 0), seed);\r
  vec4 gc = corner(c + ivec2(0, 1), seed);\r
  vec4 gd = corner(c + ivec2(1, 1), seed);\r
  vec2 fb = f - vec2(1.0, 0.0);\r
  vec2 fc = f - vec2(0.0, 1.0);\r
  vec2 fd = f - vec2(1.0);\r
  vec2 va = vec2(dot(ga.xy, f), dot(ga.zw, f));\r
  vec2 vb = vec2(dot(gb.xy, fb), dot(gb.zw, fb));\r
  vec2 vc = vec2(dot(gc.xy, fc), dot(gc.zw, fc));\r
  vec2 vd = vec2(dot(gd.xy, fd), dot(gd.zw, fd));\r
  vec2 k = va - vb - vc + vd;\r
  vec4 g = ga + u.x * (gb - ga) + u.y * (gc - ga) + u.x * u.y * (ga - gb - gc + gd);\r
  jac = mat2(\r
    g.xy + du * (u.yx * k.x + vec2(vb.x - va.x, vc.x - va.x)),\r
    g.zw + du * (u.yx * k.y + vec2(vb.y - va.y, vc.y - va.y))\r
  );\r
  return va + u.x * (vb - va) + u.y * (vc - va) + u.x * u.y * k;\r
}\r
\r
float wobble(vec2 p, uint seed) {\r
  mat2 jac;\r
  return drift(p, seed, jac).x;\r
}\r
\r
vec2 ripple(vec2 p, out float surge) {\r
  vec2 push = vec2(0.0);\r
  surge = 0.0;\r
  float width = uUnit * 10.0;\r
  for (int i = 0; i < \${PULSES}; i++) {\r
    vec4 pulse = uPulses[i];\r
    if (pulse.w <= 0.0) continue;\r
    vec2 d = p - pulse.xy;\r
    float dist = length(d);\r
    float front = (dist - pulse.z * uUnit * 150.0) / width;\r
    float env = exp(-front * front) * pulse.w * exp(-pulse.z * 1.7) * smoothstep(0.0, uUnit * 8.0, dist);\r
    push += d / max(dist, 1.0) * env * cos(front * 2.2) * uUnit * 7.5;\r
    surge += env;\r
  }\r
  return push;\r
}\r
\r
vec2 wander(vec2 p, float t, uint seed, float reachScale, out mat2 jac, out vec2 sway) {\r
  vec2 q = p / uUnit;\r
  mat2 ja;\r
  mat2 jb;\r
  mat2 jc;\r
  mat2 jd;\r
  vec2 a = drift(q * 0.028 + vec2(t * 0.29, t * 0.21), seed, ja);\r
  vec2 b = drift(q * 0.085 + a * 0.4 + vec2(t * 0.83, -t * 0.61) + 17.0, seed + 1u, jb);\r
  vec2 c = drift(p / 9.0 + b * 0.6 + vec2(t * 1.9, t * 1.3) + 5.0, seed + 2u, jc);\r
  vec2 d = drift(p / 4.1 + vec2(-t * 2.7, t * 2.2) + 11.0, seed + 3u, jd);\r
  float bendAmp = uBend * 8.0 * reachScale;\r
  float rippleAmp = uBend * 3.2 * reachScale;\r
  float crinkleAmp = uCrackle * 1.5 * reachScale;\r
  jac = ja * (0.028 * bendAmp) + jb * (0.085 * rippleAmp) + jc * (crinkleAmp / 9.0) + jd * (crinkleAmp * 0.35 / 4.1);\r
  sway = (a * bendAmp + b * rippleAmp) * uUnit;\r
  return sway + (c + d * 0.35) * crinkleAmp;\r
}\r
\r
vec2 glowShape(float line, float spread, float w) {\r
  float x = abs(line);\r
  float y = abs(spread);\r
  return vec2(exp(-x * x / (w * w * 0.5)) + exp(-y / (w * 2.2)) * 0.6, exp(-y / (w * 4.5)) * 0.5);\r
}\r
\r
void addArc(vec2 p, vec4 ends, vec4 info, float t, inout vec3 light, inout float energy, inout float hot) {\r
  if (info.y < 0.002) return;\r
  vec2 ab = ends.zw - ends.xy;\r
  float len = max(length(ab), 1.0);\r
  vec2 dir = ab / len;\r
  vec2 rel = p - ends.xy;\r
  float s = dot(rel, dir);\r
  float h = dot(rel, vec2(-dir.y, dir.x));\r
  float margin = abs(info.x) + uCrackle * (2.0 + len * 0.08) + uThickness * 12.0 + 10.0;\r
  if (s < -margin || s > len + margin || abs(h) > margin) return;\r
  float u = clamp(s / len, 0.0, 1.0);\r
  float taper = sin(3.14159265 * u);\r
  float bendSlope = s > 0.0 && s < len ? 3.14159265 / len * cos(3.14159265 * u) : 0.0;\r
  float beyond = max(-s, 0.0) + max(s - len, 0.0);\r
  for (int c = 0; c < 2; c++) {\r
    uint seed = uint(info.z * 131.0) + uint(c) * 29u + 7u;\r
    float jag = 0.0;\r
    float jagSlope = 0.0;\r
    float wave = max(len * 0.3, 14.0);\r
    float weight = uCrackle * (1.5 + len * 0.05) * (c == 0 ? 1.0 : 1.5);\r
    for (int o = 0; o < 3; o++) {\r
      mat2 jac;\r
      float n = drift(vec2(s / wave + info.z * 3.0, t * (1.4 + float(o) * 1.1)), seed + uint(o), jac).x;\r
      jag += n * weight;\r
      jagSlope += jac[0].x * weight / wave;\r
      wave *= 0.42;\r
      weight *= 0.4;\r
    }\r
    float offset = (info.x + jag) * taper;\r
    float offsetSlope = (info.x + jag) * bendSlope + jagSlope * taper;\r
    float across = (h - offset) / sqrt(1.0 + offsetSlope * offsetSlope);\r
    float gap = length(vec2(beyond, across));\r
    float w = uThickness * (c == 0 ? 0.9 : 0.6);\r
    vec2 g = glowShape(gap, gap, w);\r
    float k = info.y * (c == 0 ? 1.0 : 0.45);\r
    light += (uColor * g.x + uGlowColor * g.y * uGlow) * k;\r
    energy += (g.x + g.y * uGlow) * k;\r
    hot += exp(-gap * gap / (w * w * 0.16)) * k * (c == 0 ? 1.0 : 0.0);\r
  }\r
}\r
\r
void main() {\r
  vec2 p = vec2(vUv.x, 1.0 - vUv.y) * uResolution;\r
  float t = uTime;\r
  vec3 light = vec3(0.0);\r
  float energy = 0.0;\r
  float hot = 0.0;\r
\r
  float surge;\r
  vec2 pr = p - ripple(p, surge);\r
  float k = uMorph >= 1.0 ? 1.0 : smoothstep(0.0, 1.0, clamp(uMorph * 1.7 - 0.35 + 0.35 * wobble(p / uUnit * 0.018, 41u), 0.0, 1.0));\r
  float transit = uMorph >= 1.0 ? 0.0 : sin(3.14159265 * uMorph);\r
  float base = shape(pr, k);\r
\r
  vec2 toHover = p - uHover.xy;\r
  float heat = min(uHover.z * exp(-dot(toHover, toHover) / (uHoverRadius * uHoverRadius)) + surge * 1.4 + transit * 0.5, 2.0);\r
  float heatCap = min(uHover.z + uPulseBoost * 1.4 + transit * 0.5, 2.0);\r
  float breath = 1.0 + uFlicker * 0.6 * wobble(vec2(t * 2.1, 7.0), 3u);\r
  float grow = uPresence;\r
\r
  float edge = abs(base);\r
  vec2 halo = aura(pr, k);\r
  float ink = uInk;\r
  float bloom = (halo.x * 0.16 + halo.y * 0.08) * (1.0 - ink * 0.65) * uGlow * (1.0 + heat * 1.2);\r
  float body = smoothstep(0.75, -0.75, base) * uFill * (0.06 + 1.2 * min(halo.x, 1.0)) * (1.0 + heat * 0.5);\r
  light += uGlowColor * bloom * grow * grow;\r
  energy += bloom * grow * grow;\r
\r
  float reachScale = mix(0.15, 1.0, grow) * (1.0 + heat * 0.9);\r
  float reach = (uUnit * uBend * 16.0 + uCrackle * 3.0) * (1.0 + heatCap * 0.9) + uThickness * 20.0 + 8.0;\r
  if (edge < reach && grow > 0.0) {\r
    float fade = smoothstep(reach, reach * 0.55, edge);\r
    vec2 q = pr / uUnit;\r
    float count = min(uStrands + heat * 2.5, 6.0);\r
    float limit = min(uStrands + heatCap * 2.5, 6.0);\r
    for (int i = 0; i < 6; i++) {\r
      float fi = float(i);\r
      if (fi >= limit) break;\r
      float present = clamp(count - fi, 0.0, 1.0);\r
      if (present <= 0.0) continue;\r
      uint seed = uint(i) * 7u + 3u;\r
      mat2 jac;\r
      vec2 sway;\r
      float lead = i == 0 ? 1.0 : 0.0;\r
      vec2 warped = pr + wander(pr, t * (1.0 + fi * 0.19), seed, reachScale * mix(0.6 + fi * 0.2, 0.7, lead), jac, sway);\r
      float dw = shape(warped, k);\r
      vec2 slope = vec2(shape(warped + vec2(1.0, 0.0), k), shape(warped + vec2(0.0, 1.0), k)) - dw;\r
      float d = dw / max(length(slope + jac * slope), 0.3);\r
      float spread = shape(pr + sway, k);\r
      float swell = 0.5 + 0.5 * wobble(q * 0.06 + vec2(t * 0.9, fi * 5.1 - t * 0.6), seed + 8u);\r
      float w = uThickness * mix(0.5, 1.0, lead) * (0.5 + swell);\r
      float vis = mix(0.3 + 0.45 * smoothstep(-0.25, 0.2, wobble(q * 0.035 + vec2(t * 0.21, fi * 3.7), seed + 5u)), 1.0, lead);\r
      float spark = 1.0 - uFlicker * 0.3 * (0.5 + 0.5 * wobble(vec2(t * 6.0, fi * 2.3), seed + 6u));\r
      float weight = max(vis, heat * 0.85) * spark * fade * present * (0.7 + 0.6 * swell);\r
      vec2 g = glowShape(d, spread, w) * weight;\r
      float soft = mix(1.0, mix(0.5, 1.0, lead), ink);\r
      vec3 stroke = mix(uColor, uGlowColor, ink * (1.0 - lead) * 0.65);\r
      float haze = uGlow * (1.0 + heat) * (1.0 - ink * 0.7);\r
      light += stroke * g.x * soft + uGlowColor * g.y * haze;\r
      energy += g.x * soft + g.y * haze;\r
      hot += exp(-d * d / (w * w * 0.16)) * lead * weight;\r
    }\r
    light *= grow;\r
    energy *= grow;\r
  }\r
\r
  for (int i = 0; i < \${ARCS}; i++) addArc(pr, uArcEnds[i], uArcShape[i], t, light, energy, hot);\r
\r
  float gain = uIntensity * breath * (1.0 + heat * 0.45) * (1.0 + uFlash * 0.3) * 1.4;\r
  float alpha = 1.0 - exp(-energy * gain);\r
  vec3 color = mix(1.0 - exp(-light * gain), alpha * light / max(energy, 1e-4), ink);\r
  color = mix(color, vec3(alpha), clamp(hot * grow, 0.0, 1.0) * ink * 0.85);\r
  float tint = (1.0 - exp(-body * gain * 1.2)) * grow * grow * (1.0 - ink * 0.82);\r
  color += uGlowColor * tint * (1.0 - alpha);\r
  alpha += tint * (1.0 - alpha);\r
  float grain = (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;\r
  alpha = clamp(alpha + grain, 0.0, 1.0);\r
  fragColor = vec4(clamp(color + grain, 0.0, alpha), alpha);\r
}\r
\`;\r
\r
const ElectricLogo = ({\r
  src = BOLT,\r
  color = '#ecc7ff',\r
  glowColor = '#ad6dff',\r
  scale = 0.7,\r
  intensity = 1,\r
  glow = 1,\r
  thickness = 1.5,\r
  strands = 4,\r
  bend = 0.6,\r
  crackle = 1.5,\r
  arcs = 1,\r
  flicker = 0.6,\r
  fill = 0,\r
  speed = 2.5,\r
  interactive = true,\r
  cursorIntensity = 0.75,\r
  cursorRadius = 100,\r
  theme = 'dark',\r
  onRender,\r
  className = '',\r
  style\r
}: ElectricLogoProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const settingsRef = useRef<Settings | null>(null);\r
  const shapeRef = useRef<Shape | null>(null);\r
\r
  useEffect(() => {\r
    settingsRef.current = {\r
      color,\r
      glowColor,\r
      scale,\r
      intensity,\r
      glow,\r
      thickness,\r
      strands,\r
      bend,\r
      crackle,\r
      arcs,\r
      flicker,\r
      fill,\r
      speed,\r
      interactive,\r
      cursorIntensity,\r
      cursorRadius,\r
      theme,\r
      onRender\r
    };\r
  });\r
\r
  useEffect(() => {\r
    let alive = true;\r
    const image = new Image();\r
    image.crossOrigin = 'anonymous';\r
    image.decoding = 'async';\r
    image.onload = () => {\r
      if (!alive) return;\r
      let traced: Shape | null = null;\r
      try {\r
        traced = traceShape(image);\r
      } catch {\r
        traced = null;\r
      }\r
      if (traced) shapeRef.current = traced;\r
    };\r
    image.src = src || BOLT;\r
    return () => {\r
      alive = false;\r
      image.onload = null;\r
    };\r
  }, [src]);\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    if (!container) return undefined;\r
\r
    const renderer = new Renderer({\r
      dpr: Math.min(window.devicePixelRatio || 1, 2),\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false\r
    });\r
    const gl = renderer.gl;\r
    const gl2 = gl as WebGL2RenderingContext;\r
    if (!renderer.isWebgl2) {\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
      return undefined;\r
    }\r
    gl.clearColor(0, 0, 0, 0);\r
    const canvas = gl.canvas;\r
    canvas.style.display = 'block';\r
    canvas.style.width = '100%';\r
    canvas.style.height = '100%';\r
    container.appendChild(canvas);\r
\r
    const makeSlot = (): Slot => ({\r
      shape: null,\r
      field: new Texture(gl, {\r
        image: new Float32Array([1000]),\r
        width: 1,\r
        height: 1,\r
        internalFormat: gl2.R16F,\r
        format: gl2.RED,\r
        type: gl.FLOAT,\r
        minFilter: gl.LINEAR,\r
        magFilter: gl.LINEAR,\r
        generateMipmaps: false,\r
        flipY: false,\r
        unpackAlignment: 1\r
      }),\r
      glow: new Texture(gl, {\r
        image: new Float32Array([0, 0]),\r
        width: 1,\r
        height: 1,\r
        internalFormat: gl2.RG16F,\r
        format: gl2.RG,\r
        type: gl.FLOAT,\r
        minFilter: gl.LINEAR,\r
        magFilter: gl.LINEAR,\r
        generateMipmaps: false,\r
        flipY: false,\r
        unpackAlignment: 1\r
      })\r
    });\r
    const slots = [makeSlot(), makeSlot()];\r
\r
    const arcEnds = Array.from({ length: ARCS * 4 }, () => 0);\r
    const arcShape = Array.from({ length: ARCS * 4 }, () => 0);\r
    const pulseData = Array.from({ length: PULSES * 4 }, () => 0);\r
    const uniforms = {\r
      tFieldFrom: { value: slots[1].field },\r
      tGlowFrom: { value: slots[1].glow },\r
      tFieldTo: { value: slots[0].field },\r
      tGlowTo: { value: slots[0].glow },\r
      uMapFrom: { value: [0, 0, 1, 0] },\r
      uSizeFrom: { value: [1, 1, 1, 1] },\r
      uMapTo: { value: [0, 0, 1, 0] },\r
      uSizeTo: { value: [1, 1, 1, 1] },\r
      uMorph: { value: 1 },\r
      uResolution: { value: [1, 1] },\r
      uUnit: { value: 1 },\r
      uTime: { value: 0 },\r
      uPresence: { value: 0 },\r
      uHover: { value: [0, 0, 0] },\r
      uHoverRadius: { value: 120 },\r
      uPulses: { value: pulseData },\r
      uPulseBoost: { value: 0 },\r
      uFlash: { value: 0 },\r
      uColor: { value: [1, 1, 1] },\r
      uGlowColor: { value: [0.43, 0.48, 1] },\r
      uIntensity: { value: 1 },\r
      uGlow: { value: 1 },\r
      uThickness: { value: 1.8 },\r
      uStrands: { value: 3 },\r
      uBend: { value: 1 },\r
      uCrackle: { value: 1 },\r
      uFlicker: { value: 0.4 },\r
      uFill: { value: 0.5 },\r
      uInk: { value: 0 },\r
      uArcEnds: { value: arcEnds },\r
      uArcShape: { value: arcShape }\r
    };\r
    const mesh = new Mesh(gl, {\r
      geometry: new Triangle(gl),\r
      program: new Program(gl, { vertex, fragment, uniforms, depthTest: false, depthWrite: false })\r
    });\r
\r
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const pointer = { x: 0, y: 0, over: false };\r
    const hover = { x: 0, y: 0, vx: 0, vy: 0, power: 0 };\r
    const sparks: Spark[] = [];\r
    const pulses: Pulse[] = [];\r
    let target = 0;\r
    let pending: Shape | null = null;\r
    let morph = 1;\r
    let burst: Point | null = null;\r
    let progress = 0;\r
    let ink = 0;\r
    const hues = [\r
      [1, 1, 1],\r
      [1, 1, 1]\r
    ];\r
    let settled = false;\r
    let time = 0;\r
    let width = 1;\r
    let height = 1;\r
    let raf = 0;\r
    let last = performance.now();\r
    let visible = true;\r
\r
    const load = (slot: Slot, next: Shape) => {\r
      slot.shape = next;\r
      slot.field.image = next.field;\r
      slot.field.width = next.width;\r
      slot.field.height = next.height;\r
      slot.field.needsUpdate = true;\r
      slot.glow.image = next.glow;\r
      slot.glow.width = next.glowWidth;\r
      slot.glow.height = next.glowHeight;\r
      slot.glow.needsUpdate = true;\r
    };\r
\r
    const place = (shape: Shape, s: Settings) => {\r
      const fit = Math.max(1e-4, Math.min((width * s.scale) / shape.logoWidth, (height * s.scale) / shape.logoHeight));\r
      return {\r
        fit,\r
        ox: width / 2 - (shape.pad + shape.logoWidth / 2) * fit,\r
        oy: height / 2 - (shape.pad + shape.logoHeight / 2) * fit,\r
        unit: (Math.max(shape.logoWidth, shape.logoHeight) * fit) / 100\r
      };\r
    };\r
\r
    const resize = () => {\r
      width = Math.max(1, container.clientWidth);\r
      height = Math.max(1, container.clientHeight);\r
      renderer.dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(PIXEL_BUDGET / (width * height)));\r
      renderer.setSize(width, height);\r
      uniforms.uResolution.value = [width, height];\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      const s = settingsRef.current;\r
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));\r
      last = now;\r
\r
      const incoming = shapeRef.current;\r
      if (incoming && incoming !== slots[target].shape) pending = incoming;\r
      if (pending && morph >= 1) {\r
        if (slots[target].shape) {\r
          target = 1 - target;\r
          morph = 0;\r
          sparks.length = 0;\r
        }\r
        load(slots[target], pending);\r
        pending = null;\r
      }\r
      if (morph < 1) morph = Math.min(1, morph + dt / (pending ? 0.3 : 1.6));\r
\r
      const to = slots[target].shape;\r
      const from = morph < 1 ? slots[1 - target].shape : null;\r
      if (to) progress = Math.min(1, progress + dt / 1.4);\r
      const presence = progress * progress * (3 - 2 * progress);\r
\r
      if (to && s) {\r
        const near = place(to, s);\r
        const far = from ? place(from, s) : near;\r
        const blend = morph * morph * (3 - 2 * morph);\r
        const unit = far.unit + (near.unit - far.unit) * blend;\r
\r
        const engaged = s.interactive && pointer.over;\r
        if (engaged && hover.power < 0.01) {\r
          hover.x = pointer.x;\r
          hover.y = pointer.y;\r
          hover.vx = 0;\r
          hover.vy = 0;\r
        }\r
        hover.vx += ((pointer.x - hover.x) * 120 - hover.vx * 19) * dt;\r
        hover.vy += ((pointer.y - hover.y) * 120 - hover.vy * 19) * dt;\r
        hover.x += hover.vx * dt;\r
        hover.y += hover.vy * dt;\r
        hover.power += ((engaged ? 1 : 0) - hover.power) * (1 - Math.exp(-dt / (engaged ? 0.3 : 0.55)));\r
\r
        const motion = reducedMotion ? 0.2 : 1;\r
        time += dt * s.speed * motion;\r
\r
        for (let i = sparks.length - 1; i >= 0; i--) {\r
          if (time - sparks[i].born > sparks[i].life) sparks.splice(i, 1);\r
        }\r
        const focus = (spot: Point): Focus => ({\r
          x: (spot.x - near.ox) / near.fit,\r
          y: (spot.y - near.oy) / near.fit,\r
          radius: Math.max(1, s.cursorRadius) / near.fit\r
        });\r
        if (burst && morph >= 1 && s.arcs > 0) {\r
          for (let i = 0; i < 3 && sparks.length < ARCS; i++) {\r
            const spark = spawnArc(to, time, focus(burst));\r
            if (spark) sparks.push(spark);\r
          }\r
        }\r
        burst = null;\r
        if (!reducedMotion && presence > 0.8 && morph >= 1 && sparks.length < ARCS) {\r
          const chance = dt * s.speed * s.arcs;\r
          if (Math.random() < chance * 6 * hover.power * s.cursorIntensity) {\r
            const spark = spawnArc(to, time, focus(hover));\r
            if (spark) sparks.push(spark);\r
          } else if (Math.random() < chance * 2.2) {\r
            const spark = spawnArc(to, time, null);\r
            if (spark) sparks.push(spark);\r
          }\r
        }\r
\r
        for (let i = 0; i < ARCS; i++) {\r
          const o = i * 4;\r
          const spark = sparks[i];\r
          if (!spark) {\r
            arcShape[o + 1] = 0;\r
            continue;\r
          }\r
          const k = (time - spark.born) / spark.life;\r
          arcEnds[o] = near.ox + spark.ax * near.fit;\r
          arcEnds[o + 1] = near.oy + spark.ay * near.fit;\r
          arcEnds[o + 2] = near.ox + spark.bx * near.fit;\r
          arcEnds[o + 3] = near.oy + spark.by * near.fit;\r
          arcShape[o] = spark.bow * near.fit;\r
          arcShape[o + 1] = Math.sin(Math.PI * Math.min(1, Math.max(0, k))) * presence;\r
          arcShape[o + 2] = spark.seed;\r
        }\r
\r
        let boost = 0;\r
        let flash = 0;\r
        for (let i = pulses.length - 1; i >= 0; i--) {\r
          if ((now - pulses[i].born) / 1000 > 2) pulses.splice(i, 1);\r
        }\r
        for (let i = 0; i < PULSES; i++) {\r
          const o = i * 4;\r
          const pulse = pulses[i];\r
          if (!pulse) {\r
            pulseData[o + 3] = 0;\r
            continue;\r
          }\r
          const age = (now - pulse.born) / 1000;\r
          pulseData[o] = pulse.x;\r
          pulseData[o + 1] = pulse.y;\r
          pulseData[o + 2] = age;\r
          pulseData[o + 3] = 1;\r
          boost = Math.max(boost, Math.exp(-age * 1.7));\r
          flash += Math.exp(-age * 7);\r
        }\r
\r
        const fromSlot = slots[1 - target];\r
        uniforms.tFieldTo.value = slots[target].field;\r
        uniforms.tGlowTo.value = slots[target].glow;\r
        uniforms.tFieldFrom.value = fromSlot.field;\r
        uniforms.tGlowFrom.value = fromSlot.glow;\r
        uniforms.uMapTo.value = [near.ox, near.oy, near.fit, to.glowOffset];\r
        uniforms.uSizeTo.value = [to.width, to.height, to.glowWidth, to.glowHeight];\r
        if (from) {\r
          uniforms.uMapFrom.value = [far.ox, far.oy, far.fit, from.glowOffset];\r
          uniforms.uSizeFrom.value = [from.width, from.height, from.glowWidth, from.glowHeight];\r
        }\r
        uniforms.uMorph.value = morph;\r
        uniforms.uUnit.value = unit;\r
        uniforms.uTime.value = time;\r
        uniforms.uPresence.value = presence;\r
        uniforms.uHover.value = [hover.x, hover.y, hover.power * Math.max(0, s.cursorIntensity)];\r
        uniforms.uHoverRadius.value = Math.max(1, s.cursorRadius);\r
        uniforms.uPulseBoost.value = boost;\r
        uniforms.uFlash.value = flash;\r
        const targets = [hexToRgb(s.color), hexToRgb(s.glowColor)];\r
        const shift = settled ? 1 - Math.exp(-dt / 0.35) : 1;\r
        settled = true;\r
        for (let i = 0; i < 2; i++) {\r
          for (let c = 0; c < 3; c++) hues[i][c] += (targets[i][c] - hues[i][c]) * shift;\r
        }\r
        uniforms.uColor.value = hues[0].slice();\r
        uniforms.uGlowColor.value = hues[1].slice();\r
        uniforms.uIntensity.value = s.intensity;\r
        uniforms.uGlow.value = s.glow;\r
        uniforms.uThickness.value = s.thickness;\r
        uniforms.uStrands.value = Math.max(1, Math.min(6, Math.round(s.strands)));\r
        uniforms.uBend.value = s.bend;\r
        uniforms.uCrackle.value = s.crackle;\r
        uniforms.uFlicker.value = reducedMotion ? 0 : s.flicker;\r
        ink += ((s.theme === 'light' ? 1 : 0) - ink) * (1 - Math.exp(-dt / 0.25));\r
        uniforms.uFill.value = s.fill;\r
        uniforms.uInk.value = ink;\r
        renderer.render({ scene: mesh });\r
        s.onRender?.(canvas);\r
      }\r
\r
      if (visible) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const start = () => {\r
      if (raf || !visible) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const onMove = (e: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      pointer.x = e.clientX - rect.left;\r
      pointer.y = e.clientY - rect.top;\r
      pointer.over = true;\r
    };\r
    const onDown = (e: PointerEvent) => {\r
      onMove(e);\r
      if (!settingsRef.current?.interactive || reducedMotion) return;\r
      pulses.push({ x: pointer.x, y: pointer.y, born: performance.now() });\r
      if (pulses.length > PULSES) pulses.shift();\r
      burst = { x: pointer.x, y: pointer.y };\r
    };\r
    const onLeave = () => {\r
      pointer.over = false;\r
    };\r
    container.addEventListener('pointermove', onMove);\r
    container.addEventListener('pointerdown', onDown);\r
    container.addEventListener('pointerleave', onLeave);\r
    container.addEventListener('pointercancel', onLeave);\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(container);\r
    const intersectionObserver = new IntersectionObserver(([entry]) => {\r
      visible = entry.isIntersecting;\r
      start();\r
    });\r
    intersectionObserver.observe(container);\r
\r
    resize();\r
    start();\r
\r
    return () => {\r
      visible = false;\r
      cancelAnimationFrame(raf);\r
      resizeObserver.disconnect();\r
      intersectionObserver.disconnect();\r
      container.removeEventListener('pointermove', onMove);\r
      container.removeEventListener('pointerdown', onDown);\r
      container.removeEventListener('pointerleave', onLeave);\r
      container.removeEventListener('pointercancel', onLeave);\r
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
export default ElectricLogo;\r
`,a={dependencies:"ogl",usage:`import ElectricLogo from './ElectricLogo';

<div style={{ width: '100%', height: '480px', position: 'relative' }}>
  <ElectricLogo
    src="/logo.svg"
    color="#ecc7ff"
    glowColor="#ad6dff"
    scale={0.7}
    strands={4}
    bend={0.6}
    crackle={1.5}
    arcs={1}
    speed={2.5}
    interactive
  />
</div>`,code:r,css:n,tailwind:e,tsCode:t,tsTailwind:o};export{a as electricLogo};
