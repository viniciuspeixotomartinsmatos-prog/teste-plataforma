const r=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
import { Renderer, Program, Mesh, Triangle, Texture, RenderTarget } from 'ogl';\r
\r
import './DitherVeil.css';\r
\r
const DEFAULT_SRC = 'https://images.unsplash.com/photo-1737071371043-761e02b1ef95?q=80&w=1400&auto=format&fit=crop';\r
\r
const ORDERED = { bayer: 0, noise: 1, lines: 2 };\r
\r
const KERNELS = {\r
  atkinson: [\r
    [1, 0, 1 / 8],\r
    [2, 0, 1 / 8],\r
    [-1, 1, 1 / 8],\r
    [0, 1, 1 / 8],\r
    [1, 1, 1 / 8],\r
    [0, 2, 1 / 8]\r
  ],\r
  floyd: [\r
    [1, 0, 7 / 16],\r
    [-1, 1, 3 / 16],\r
    [0, 1, 5 / 16],\r
    [1, 1, 1 / 16]\r
  ]\r
};\r
\r
const MASK_SCALE = 0.5;\r
const MAX_BURSTS = 4;\r
const BURST_SECONDS = 1.2;\r
const HOLD = 1.6;\r
const INTRO_MS = 1100;\r
\r
const hexToRgb = hex => {\r
  let h = String(hex || '').replace('#', '');\r
  if (h.length === 3) h = h.replace(/./g, c => c + c);\r
  const n = parseInt(h.slice(0, 6), 16);\r
  return Number.isNaN(n) ? [0, 0, 0] : [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];\r
};\r
\r
const fitScale = (w, h, iw, ih, contain) => {\r
  const ratio = w / h / (iw / ih);\r
  if (contain) return ratio > 1 ? [ratio, 1] : [1, 1 / ratio];\r
  return ratio > 1 ? [1, 1 / ratio] : [ratio, 1];\r
};\r
\r
const wanderAt = (t, w, h) => [\r
  w * (0.5 + 0.33 * Math.sin(t * 0.53) + 0.08 * Math.sin(t * 1.31 + 0.6)),\r
  h * (0.5 + 0.28 * Math.sin(t * 0.71 + 1.1) + 0.07 * Math.cos(t * 1.57))\r
];\r
\r
const measureEdge = (context, image) => {\r
  const size = 32;\r
  context.canvas.width = size;\r
  context.canvas.height = size;\r
  context.drawImage(image, 0, 0, size, size);\r
  const data = context.getImageData(0, 0, size, size).data;\r
  const sum = [0, 0, 0];\r
  const squares = [0, 0, 0];\r
  let count = 0;\r
  for (let y = 0; y < size; y++) {\r
    for (let x = 0; x < size; x++) {\r
      if (x > 0 && y > 0 && x < size - 1 && y < size - 1) continue;\r
      for (let c = 0; c < 3; c++) {\r
        const v = data[(y * size + x) * 4 + c] / 255;\r
        sum[c] += v;\r
        squares[c] += v * v;\r
      }\r
      count++;\r
    }\r
  }\r
  const matte = [sum[0] / count, sum[1] / count, sum[2] / count];\r
  const spread =\r
    matte.reduce((total, mean, c) => total + Math.sqrt(Math.max(0, squares[c] / count - mean * mean)), 0) / 3;\r
  return { matte, plain: spread < 0.06 };\r
};\r
\r
let blueNoise = null;\r
\r
const getBlueNoise = () => {\r
  if (blueNoise) return blueNoise;\r
  const size = 64;\r
  const n = size * size;\r
  const wrap = size - 1;\r
  const taps = [];\r
  for (let dy = -6; dy <= 6; dy++) {\r
    for (let dx = -6; dx <= 6; dx++) taps.push(dx, dy, Math.exp(-(dx * dx + dy * dy) / 4.5));\r
  }\r
  const energy = new Float32Array(n);\r
  const on = new Uint8Array(n);\r
  const splat = (i, sign) => {\r
    const x = i % size;\r
    const y = (i - x) / size;\r
    for (let k = 0; k < taps.length; k += 3) {\r
      energy[((y + taps[k + 1]) & wrap) * size + ((x + taps[k]) & wrap)] += sign * taps[k + 2];\r
    }\r
  };\r
  const find = (state, highest) => {\r
    let best = 0;\r
    let value = highest ? -Infinity : Infinity;\r
    for (let i = 0; i < n; i++) {\r
      if (on[i] !== state) continue;\r
      if (highest ? energy[i] > value : energy[i] < value) {\r
        value = energy[i];\r
        best = i;\r
      }\r
    }\r
    return best;\r
  };\r
  let seed = 7;\r
  const random = () => {\r
    seed = (seed * 16807) % 2147483647;\r
    return seed / 2147483647;\r
  };\r
  const initial = Math.round(n * 0.1);\r
  for (let placed = 0; placed < initial; ) {\r
    const i = Math.floor(random() * n);\r
    if (on[i]) continue;\r
    on[i] = 1;\r
    splat(i, 1);\r
    placed++;\r
  }\r
  for (let guard = 0; guard < n; guard++) {\r
    const cluster = find(1, true);\r
    on[cluster] = 0;\r
    splat(cluster, -1);\r
    const gap = find(0, false);\r
    on[gap] = 1;\r
    splat(gap, 1);\r
    if (gap === cluster) break;\r
  }\r
  const seedOn = on.slice();\r
  const seedEnergy = energy.slice();\r
  const rank = new Uint16Array(n);\r
  for (let r = initial - 1; r >= 0; r--) {\r
    const cluster = find(1, true);\r
    on[cluster] = 0;\r
    splat(cluster, -1);\r
    rank[cluster] = r;\r
  }\r
  on.set(seedOn);\r
  energy.set(seedEnergy);\r
  for (let r = initial; r < n; r++) {\r
    const gap = find(0, false);\r
    on[gap] = 1;\r
    splat(gap, 1);\r
    rank[gap] = r;\r
  }\r
  const data = new Uint8Array(n * 4);\r
  for (let i = 0; i < n; i++) {\r
    const v = Math.floor((rank[i] / n) * 256);\r
    data[i * 4] = v;\r
    data[i * 4 + 1] = v;\r
    data[i * 4 + 2] = v;\r
    data[i * 4 + 3] = 255;\r
  }\r
  blueNoise = data;\r
  return data;\r
};\r
\r
const diffuse = (pixels, cols, rows, kernel, levels, rgb, grade) => {\r
  const channels = rgb ? 3 : 1;\r
  const values = new Float32Array(cols * rows * channels);\r
  for (let i = 0; i < cols * rows; i++) {\r
    const r = pixels[i * 4] / 255;\r
    const g = pixels[i * 4 + 1] / 255;\r
    const b = pixels[i * 4 + 2] / 255;\r
    if (rgb) {\r
      values[i * 3] = grade(r);\r
      values[i * 3 + 1] = grade(g);\r
      values[i * 3 + 2] = grade(b);\r
    } else {\r
      values[i] = grade(0.2126 * r + 0.7152 * g + 0.0722 * b);\r
    }\r
  }\r
  const steps = levels - 1;\r
  const out = new Uint8Array(cols * rows * 4);\r
  for (let y = 0; y < rows; y++) {\r
    const dir = y & 1 ? -1 : 1;\r
    for (let i = 0; i < cols; i++) {\r
      const x = dir > 0 ? i : cols - 1 - i;\r
      const p = y * cols + x;\r
      for (let c = 0; c < channels; c++) {\r
        const old = values[p * channels + c];\r
        const q = Math.min(steps, Math.max(0, Math.round(old * steps))) / steps;\r
        const err = old - q;\r
        const byte = Math.round(q * 255);\r
        if (rgb) out[p * 4 + c] = byte;\r
        else out[p * 4] = out[p * 4 + 1] = out[p * 4 + 2] = byte;\r
        for (let k = 0; k < kernel.length; k++) {\r
          const nx = x + kernel[k][0] * dir;\r
          const ny = y + kernel[k][1];\r
          if (nx < 0 || nx >= cols || ny >= rows) continue;\r
          values[(ny * cols + nx) * channels + c] += err * kernel[k][2];\r
        }\r
      }\r
      out[p * 4 + 3] = 255;\r
    }\r
  }\r
  return out;\r
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
const maskFragment = \`#version 300 es\r
precision highp float;\r
\r
uniform sampler2D tPrev;\r
uniform vec2 uSize;\r
uniform vec2 uFrom;\r
uniform vec2 uTo;\r
uniform float uRadius;\r
uniform float uSoftness;\r
uniform float uStrength;\r
uniform float uFade;\r
uniform float uHold;\r
\r
in vec2 vUv;\r
out vec4 fragColor;\r
\r
float strokeDistance(vec2 p, vec2 a, vec2 b) {\r
  vec2 ab = b - a;\r
  float h = clamp(dot(p - a, ab) / max(dot(ab, ab), 0.0001), 0.0, 1.0);\r
  return length(p - a - ab * h);\r
}\r
\r
void main() {\r
  vec2 p = vec2(vUv.x, 1.0 - vUv.y) * uSize;\r
  float trail = max(texture(tPrev, vUv).r - uFade, 0.0);\r
  float band = max(uRadius * uSoftness, 1.0) * uHold;\r
  float d = strokeDistance(p, uFrom, uTo);\r
  trail = max(trail, clamp((uRadius - d) / band, 0.0, 1.0) * uStrength);\r
  fragColor = vec4(trail, 0.0, 0.0, 1.0);\r
}\r
\`;\r
\r
const viewFragment = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
\r
uniform sampler2D tImage;\r
uniform sampler2D tMask;\r
uniform sampler2D tNoise;\r
uniform sampler2D tDiffused;\r
uniform vec2 uResolution;\r
uniform vec2 uCover;\r
uniform float uLod;\r
uniform float uCell;\r
uniform int uPattern;\r
uniform int uPalette;\r
uniform float uLevels;\r
uniform vec3 uInk;\r
uniform vec3 uPaper;\r
uniform vec3 uRimColor;\r
uniform float uRim;\r
uniform float uContrast;\r
uniform float uBrightness;\r
uniform float uReverse;\r
uniform float uIntro;\r
uniform float uHold;\r
uniform vec3 uMatte;\r
uniform float uKey;\r
uniform vec2 uSize;\r
uniform vec4 uBursts[4];\r
uniform float uBurstWidth;\r
\r
in vec2 vUv;\r
out vec4 fragColor;\r
\r
float bayer(vec2 cell) {\r
  ivec2 p = ivec2(mod(cell, 8.0));\r
  int v = p.x ^ p.y;\r
  int m = ((v & 1) << 5) | ((p.y & 1) << 4) | ((v & 2) << 2) | ((p.y & 2) << 1) | ((v & 4) >> 1) | ((p.y & 4) >> 2);\r
  return (float(m) + 0.5) / 64.0;\r
}\r
\r
float blueNoise(vec2 cell) {\r
  return (texelFetch(tNoise, ivec2(mod(cell, 64.0)), 0).r * 255.0 + 0.5) / 256.0;\r
}\r
\r
float engraving(vec2 cell) {\r
  float period = 6.0;\r
  float f = (mod(cell.x + cell.y, period) + 0.5) / period;\r
  return clamp(abs(f * 2.0 - 1.0) + (bayer(cell) - 0.5) * (2.0 / period), 0.0, 1.0);\r
}\r
\r
vec2 imageUv(vec2 uv) {\r
  return (uv - 0.5) * uCover + 0.5;\r
}\r
\r
float within(vec2 p) {\r
  vec2 s = step(vec2(0.0), p) * step(p, vec2(1.0));\r
  return s.x * s.y;\r
}\r
\r
vec3 grade(vec3 c) {\r
  return pow(clamp((c - 0.5) * uContrast + 0.5 + uBrightness, 0.0, 1.0), vec3(1.6));\r
}\r
\r
float shockwave(vec2 p) {\r
  float value = 0.0;\r
  for (int i = 0; i < 4; i++) {\r
    vec4 burst = uBursts[i];\r
    if (burst.w <= 0.0) continue;\r
    float offset = distance(p, burst.xy) - burst.z;\r
    float edge = offset > 0.0 ? offset / (uBurstWidth * 0.35) : -offset / uBurstWidth;\r
    value = max(value, clamp(1.0 - edge, 0.0, 1.0) * burst.w);\r
  }\r
  return value;\r
}\r
\r
vec3 toned(vec3 c) {\r
  return uPalette == 1 ? grade(c) : grade(vec3(dot(c, vec3(0.2126, 0.7152, 0.0722))));\r
}\r
\r
vec3 quantize(vec3 v, float t) {\r
  float steps = max(uLevels - 1.0, 1.0);\r
  vec3 s = v * steps;\r
  vec3 base = floor(s);\r
  return min(base + step(vec3(t), s - base), vec3(steps)) / steps;\r
}\r
\r
void main() {\r
  vec2 px = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);\r
  vec2 cell = floor(px / uCell);\r
  vec2 center = (cell + 0.5) * uCell;\r
  vec2 cellUv = vec2(center.x / uResolution.x, 1.0 - center.y / uResolution.y);\r
\r
  vec2 sampleUv = imageUv(cellUv);\r
  float framed = within(sampleUv);\r
  vec3 level;\r
  if (uPattern == 3) {\r
    level = texelFetch(tDiffused, ivec2(cell), 0).rgb;\r
  } else {\r
    vec3 c = mix(uMatte, textureLod(tImage, sampleUv, uLod).rgb, framed);\r
    float t = uPattern == 1 ? blueNoise(cell) : (uPattern == 2 ? engraving(cell) : bayer(cell));\r
    level = quantize(toned(c), t);\r
  }\r
\r
  vec3 color = mix(uInk, mix(uInk, uPaper, level), max(framed, uKey));\r
  vec3 backdrop = mix(uInk, uPaper, toned(uMatte));\r
  vec2 photoUv = imageUv(vUv);\r
  vec3 raw = texture(tImage, photoUv).rgb;\r
  float plain = uKey * (1.0 - smoothstep(0.05, 0.22, distance(raw, uMatte)));\r
  vec3 photo = mix(mix(uInk, backdrop, uKey), mix(raw, backdrop, plain), within(photoUv));\r
\r
  vec2 point = vec2(cellUv.x, 1.0 - cellUv.y) * uSize;\r
  float mask = max(clamp(texture(tMask, cellUv).r * uHold, 0.0, 1.0), shockwave(point));\r
  float shown = mix(mask, 1.0 - mask, uReverse);\r
  float order = bayer(cell.yx);\r
  float low = order * (1.0 - uRim);\r
  color = mix(color, uRimColor, step(low, shown) * step(0.001, uRim));\r
  color = mix(color, photo, step(low + uRim, shown));\r
\r
  vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);\r
  float spread = length((cellUv - 0.5) * aspect) / length(aspect * 0.5);\r
  float appear = step(spread * 0.72 + bayer(cell + vec2(3.0, 5.0)) * 0.28, uIntro * 1.001);\r
  fragColor = vec4(mix(uInk, color, appear), 1.0);\r
}\r
\`;\r
\r
const DitherVeil = ({\r
  src = DEFAULT_SRC,\r
  fit = 'contain',\r
  pattern = 'floyd',\r
  pixelSize = 2,\r
  levels = 2,\r
  palette = 'duotone',\r
  inkColor = '#120f17',\r
  paperColor = '#f4f1ea',\r
  contrast = 1.15,\r
  brightness = 0,\r
  revealRadius = 200,\r
  softness = 0.6,\r
  linger = 1,\r
  rimColor = '#a78bfa',\r
  rim = 0,\r
  reverse = false,\r
  wander = false,\r
  clickBurst = true,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const settingsRef = useRef(null);\r
  const wakeRef = useRef(() => {});\r
\r
  useEffect(() => {\r
    settingsRef.current = {\r
      fit,\r
      pattern,\r
      pixelSize,\r
      levels,\r
      palette,\r
      inkColor,\r
      paperColor,\r
      contrast,\r
      brightness,\r
      revealRadius,\r
      softness,\r
      linger,\r
      rimColor,\r
      rim,\r
      reverse,\r
      wander,\r
      clickBurst\r
    };\r
    wakeRef.current();\r
  });\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    if (!container) return undefined;\r
\r
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;\r
    const renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio || 1, 2), alpha: false, antialias: false });\r
    const gl = renderer.gl;\r
    const canvas = gl.canvas;\r
    canvas.style.display = 'block';\r
    canvas.style.width = '100%';\r
    canvas.style.height = '100%';\r
    container.appendChild(canvas);\r
\r
    const floatMask = renderer.isWebgl2 && !!renderer.getExtension('EXT_color_buffer_float');\r
    const geometry = new Triangle(gl);\r
\r
    const dataTexture = () =>\r
      new Texture(gl, {\r
        image: new Uint8Array(4),\r
        width: 1,\r
        height: 1,\r
        generateMipmaps: false,\r
        flipY: false,\r
        minFilter: gl.NEAREST,\r
        magFilter: gl.NEAREST\r
      });\r
    const imageTexture = new Texture(gl, { minFilter: gl.LINEAR_MIPMAP_LINEAR, magFilter: gl.LINEAR });\r
    const noiseTexture = dataTexture();\r
    const diffusedTexture = dataTexture();\r
\r
    const createMask = (w, h) =>\r
      new RenderTarget(gl, {\r
        width: w,\r
        height: h,\r
        depth: false,\r
        type: floatMask ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE,\r
        internalFormat: floatMask ? gl.RGBA16F : gl.RGBA,\r
        minFilter: gl.LINEAR,\r
        magFilter: gl.LINEAR\r
      });\r
    const destroyMask = target => {\r
      gl.deleteFramebuffer(target.buffer);\r
      gl.deleteTexture(target.texture.texture);\r
    };\r
    let masks = [createMask(2, 2), createMask(2, 2)];\r
\r
    const maskUniforms = {\r
      tPrev: { value: masks[0].texture },\r
      uSize: { value: [1, 1] },\r
      uFrom: { value: [0, 0] },\r
      uTo: { value: [0, 0] },\r
      uRadius: { value: 1 },\r
      uSoftness: { value: 0.5 },\r
      uStrength: { value: 0 },\r
      uFade: { value: 1 },\r
      uHold: { value: HOLD }\r
    };\r
    const viewUniforms = {\r
      tImage: { value: imageTexture },\r
      tMask: { value: masks[0].texture },\r
      tNoise: { value: noiseTexture },\r
      tDiffused: { value: diffusedTexture },\r
      uResolution: { value: [1, 1] },\r
      uCover: { value: [1, 1] },\r
      uLod: { value: 0 },\r
      uCell: { value: 3 },\r
      uPattern: { value: 0 },\r
      uPalette: { value: 0 },\r
      uLevels: { value: 2 },\r
      uInk: { value: [0, 0, 0] },\r
      uPaper: { value: [1, 1, 1] },\r
      uRimColor: { value: [1, 1, 1] },\r
      uRim: { value: 0 },\r
      uContrast: { value: 1 },\r
      uBrightness: { value: 0 },\r
      uReverse: { value: 0 },\r
      uIntro: { value: 0 },\r
      uHold: { value: HOLD },\r
      uMatte: { value: [0, 0, 0] },\r
      uKey: { value: 0 },\r
      uSize: { value: [1, 1] },\r
      uBursts: { value: Array.from({ length: MAX_BURSTS * 4 }, () => 0) },\r
      uBurstWidth: { value: 60 }\r
    };\r
    const program = (fragment, uniforms) =>\r
      new Program(gl, { vertex, fragment, uniforms, depthTest: false, depthWrite: false });\r
    const maskMesh = new Mesh(gl, { geometry, program: program(maskFragment, maskUniforms) });\r
    const viewMesh = new Mesh(gl, { geometry, program: program(viewFragment, viewUniforms) });\r
\r
    const sampler = document.createElement('canvas');\r
    const samplerContext = sampler.getContext('2d', { willReadFrequently: true });\r
\r
    let image = null;\r
    let introStart = 0;\r
    let diffusedKey = '';\r
    let diffusionBlocked = false;\r
    let width = 1;\r
    let height = 1;\r
    let visible = true;\r
    let raf = 0;\r
    let last = performance.now();\r
    let trailUntil = 0;\r
    let presence = 0;\r
    let drift = 0;\r
    const pointer = { x: 0, y: 0, inside: false, fresh: true, placed: false };\r
    const brush = { x: 0, y: 0, px: 0, py: 0 };\r
    const bursts = [];\r
\r
    const layout = () => {\r
      width = Math.max(1, container.clientWidth);\r
      height = Math.max(1, container.clientHeight);\r
      renderer.setSize(width, height);\r
      viewUniforms.uResolution.value = [canvas.width, canvas.height];\r
      maskUniforms.uSize.value = [width, height];\r
      viewUniforms.uSize.value = [width, height];\r
      const mw = Math.max(2, Math.round(width * MASK_SCALE));\r
      const mh = Math.max(2, Math.round(height * MASK_SCALE));\r
      if (mw !== masks[0].width || mh !== masks[0].height) {\r
        masks.forEach(destroyMask);\r
        masks = [createMask(mw, mh), createMask(mw, mh)];\r
      }\r
      if (!pointer.placed) {\r
        pointer.x = width / 2;\r
        pointer.y = height / 2;\r
      }\r
    };\r
\r
    const updateDiffusion = (cell, s) => {\r
      if (!image || !samplerContext) return;\r
      const cols = Math.ceil(canvas.width / cell);\r
      const rows = Math.ceil(canvas.height / cell);\r
      const key = [\r
        s.pattern,\r
        s.levels,\r
        s.palette,\r
        s.contrast,\r
        s.brightness,\r
        s.fit,\r
        cols,\r
        rows,\r
        canvas.width,\r
        canvas.height\r
      ].join('|');\r
      if (key === diffusedKey) return;\r
      diffusedKey = key;\r
      const [cx, cy] = viewUniforms.uCover.value;\r
      const iw = image.naturalWidth;\r
      const ih = image.naturalHeight;\r
      sampler.width = cols;\r
      sampler.height = rows;\r
      samplerContext.imageSmoothingEnabled = true;\r
      samplerContext.imageSmoothingQuality = 'high';\r
      const [mr, mg, mb] = viewUniforms.uMatte.value;\r
      samplerContext.fillStyle = \`rgb(\${mr * 255}, \${mg * 255}, \${mb * 255})\`;\r
      samplerContext.fillRect(0, 0, cols, rows);\r
      const sx = (0.5 - 0.5 * cx) * iw;\r
      const sy = (0.5 - 0.5 * cy) * ih;\r
      const sw = ((cols * cell) / canvas.width) * cx * iw;\r
      const sh = ((rows * cell) / canvas.height) * cy * ih;\r
      const x0 = Math.max(sx, 0);\r
      const y0 = Math.max(sy, 0);\r
      const x1 = Math.min(sx + sw, iw);\r
      const y1 = Math.min(sy + sh, ih);\r
      if (x1 > x0 && y1 > y0) {\r
        samplerContext.drawImage(\r
          image,\r
          x0,\r
          y0,\r
          x1 - x0,\r
          y1 - y0,\r
          ((x0 - sx) / sw) * cols,\r
          ((y0 - sy) / sh) * rows,\r
          ((x1 - x0) / sw) * cols,\r
          ((y1 - y0) / sh) * rows\r
        );\r
      }\r
      const grade = v => Math.pow(Math.min(1, Math.max(0, (v - 0.5) * s.contrast + 0.5 + s.brightness)), 1.6);\r
      const pixels = samplerContext.getImageData(0, 0, cols, rows).data;\r
      diffusedTexture.image = diffuse(pixels, cols, rows, KERNELS[s.pattern], s.levels, s.palette === 'rgb', grade);\r
      diffusedTexture.width = cols;\r
      diffusedTexture.height = rows;\r
      diffusedTexture.needsUpdate = true;\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      const s = settingsRef.current;\r
      if (!s) return;\r
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));\r
      last = now;\r
\r
      const wanderOn = s.wander && !reducedMotion;\r
      let targetX = pointer.x;\r
      let targetY = pointer.y;\r
      if (!pointer.inside && wanderOn) {\r
        drift = Math.min(1, drift + dt / 1.2);\r
        const [wx, wy] = wanderAt(now / 1000, width, height);\r
        const k = drift * drift * (3 - 2 * drift);\r
        targetX += (wx - targetX) * k;\r
        targetY += (wy - targetY) * k;\r
      } else {\r
        drift = 0;\r
      }\r
\r
      presence += ((pointer.inside || wanderOn ? 1 : 0) - presence) * (1 - Math.exp(-dt / 0.16));\r
\r
      if (pointer.fresh) {\r
        brush.x = brush.px = targetX;\r
        brush.y = brush.py = targetY;\r
        pointer.fresh = false;\r
      } else {\r
        const follow = 1 - Math.exp(-dt / 0.035);\r
        brush.x += (targetX - brush.x) * follow;\r
        brush.y += (targetY - brush.y) * follow;\r
      }\r
\r
      const burstData = viewUniforms.uBursts.value;\r
      burstData.fill(0);\r
      for (let i = bursts.length - 1; i >= 0; i--) {\r
        if ((now - bursts[i].start) / 1000 >= BURST_SECONDS) bursts.splice(i, 1);\r
      }\r
      bursts.forEach((b, i) => {\r
        const k = Math.max(0, (now - b.start) / 1000 / BURST_SECONDS);\r
        const reach =\r
          Math.hypot(Math.max(b.x, width - b.x), Math.max(b.y, height - b.y)) + viewUniforms.uBurstWidth.value;\r
        burstData[i * 4] = b.x;\r
        burstData[i * 4 + 1] = b.y;\r
        burstData[i * 4 + 2] = reach * Math.sin((k * Math.PI) / 2);\r
        burstData[i * 4 + 3] = 1 - k * k * k;\r
      });\r
\r
      if (presence > 0.002) trailUntil = now + s.linger * 1000 + 150;\r
\r
      const minFade = floatMask ? 0 : 1.5 / 255;\r
      const fade = s.linger > 0 ? dt / s.linger : 1;\r
      maskUniforms.tPrev.value = masks[0].texture;\r
      maskUniforms.uFrom.value = [brush.px, brush.py];\r
      maskUniforms.uTo.value = [brush.x, brush.y];\r
      maskUniforms.uRadius.value = s.revealRadius * (0.45 + 0.55 * presence);\r
      maskUniforms.uSoftness.value = s.softness;\r
      maskUniforms.uStrength.value = presence;\r
      maskUniforms.uFade.value = Math.max(fade, minFade);\r
      viewUniforms.uBurstWidth.value = Math.max(60, s.revealRadius * 0.9);\r
      renderer.render({ scene: maskMesh, target: masks[1] });\r
      masks.reverse();\r
      brush.px = brush.x;\r
      brush.py = brush.y;\r
\r
      const cell = Math.max(1, Math.round(s.pixelSize * renderer.dpr));\r
      if (image) {\r
        viewUniforms.uCover.value = fitScale(\r
          canvas.width,\r
          canvas.height,\r
          image.naturalWidth,\r
          image.naturalHeight,\r
          s.fit === 'contain'\r
        );\r
      }\r
      let patternIndex = ORDERED[s.pattern] ?? 0;\r
      if (KERNELS[s.pattern]) {\r
        patternIndex = 0;\r
        if (image && !diffusionBlocked) {\r
          try {\r
            updateDiffusion(cell, s);\r
            patternIndex = 3;\r
          } catch {\r
            diffusionBlocked = true;\r
          }\r
        }\r
      }\r
      if (patternIndex === 1 && noiseTexture.width !== 64) {\r
        noiseTexture.image = getBlueNoise();\r
        noiseTexture.width = 64;\r
        noiseTexture.height = 64;\r
        noiseTexture.needsUpdate = true;\r
      }\r
\r
      const texelsPerPixel = image ? (viewUniforms.uCover.value[0] * image.naturalWidth) / canvas.width : 1;\r
      viewUniforms.tMask.value = masks[0].texture;\r
      viewUniforms.uCell.value = cell;\r
      viewUniforms.uLod.value = Math.log2(Math.max(cell * texelsPerPixel, 1));\r
      viewUniforms.uPattern.value = patternIndex;\r
      viewUniforms.uPalette.value = s.palette === 'rgb' ? 1 : 0;\r
      viewUniforms.uLevels.value = Math.max(2, Math.round(s.levels));\r
      viewUniforms.uInk.value = hexToRgb(s.inkColor);\r
      viewUniforms.uPaper.value = hexToRgb(s.paperColor);\r
      viewUniforms.uRimColor.value = hexToRgb(s.rimColor);\r
      viewUniforms.uRim.value = Math.min(Math.max(s.rim, 0), 0.95);\r
      viewUniforms.uContrast.value = s.contrast;\r
      viewUniforms.uBrightness.value = s.brightness;\r
      viewUniforms.uReverse.value = s.reverse ? 1 : 0;\r
      const intro = image ? Math.min(1, (now - introStart) / INTRO_MS) : 0;\r
      viewUniforms.uIntro.value = 1 - Math.pow(1 - intro, 2);\r
      renderer.render({ scene: viewMesh });\r
\r
      const busy =\r
        pointer.inside || wanderOn || presence > 0.002 || bursts.length > 0 || now < trailUntil || (image && intro < 1);\r
      if (busy && visible) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (raf || !visible) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
    wakeRef.current = wake;\r
\r
    const img = new Image();\r
    img.crossOrigin = 'anonymous';\r
    img.decoding = 'async';\r
    img.onload = () => {\r
      image = img;\r
      imageTexture.image = img;\r
      try {\r
        if (samplerContext) {\r
          const edge = measureEdge(samplerContext, img);\r
          viewUniforms.uMatte.value = edge.matte;\r
          viewUniforms.uKey.value = edge.plain ? 1 : 0;\r
        }\r
      } catch {}\r
      introStart = performance.now();\r
      wake();\r
    };\r
    img.src = src;\r
\r
    const locate = e => {\r
      const rect = container.getBoundingClientRect();\r
      pointer.x = e.clientX - rect.left;\r
      pointer.y = e.clientY - rect.top;\r
      pointer.placed = true;\r
    };\r
    const onMove = e => {\r
      locate(e);\r
      if (!pointer.inside) {\r
        pointer.inside = true;\r
        pointer.fresh = true;\r
      }\r
      wake();\r
    };\r
    const onLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
    const onDown = e => {\r
      onMove(e);\r
      if (!settingsRef.current?.clickBurst || (e.pointerType === 'mouse' && e.button !== 0)) return;\r
      bursts.push({ x: pointer.x, y: pointer.y, start: performance.now() });\r
      if (bursts.length > MAX_BURSTS) bursts.shift();\r
    };\r
    container.addEventListener('pointermove', onMove, { passive: true });\r
    container.addEventListener('pointerenter', onMove, { passive: true });\r
    container.addEventListener('pointerdown', onDown, { passive: true });\r
    container.addEventListener('pointerleave', onLeave, { passive: true });\r
    container.addEventListener('pointercancel', onLeave, { passive: true });\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      layout();\r
      wake();\r
    });\r
    resizeObserver.observe(container);\r
    const intersectionObserver = new IntersectionObserver(([entry]) => {\r
      visible = entry.isIntersecting;\r
      wake();\r
    });\r
    intersectionObserver.observe(container);\r
\r
    layout();\r
    wake();\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = () => {};\r
      resizeObserver.disconnect();\r
      intersectionObserver.disconnect();\r
      img.onload = null;\r
      container.removeEventListener('pointermove', onMove);\r
      container.removeEventListener('pointerenter', onMove);\r
      container.removeEventListener('pointerdown', onDown);\r
      container.removeEventListener('pointerleave', onLeave);\r
      container.removeEventListener('pointercancel', onLeave);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);\r
    };\r
  }, [src]);\r
\r
  return <div ref={containerRef} className={\`dither-veil \${className}\`.trim()} style={style} />;\r
};\r
\r
export default DitherVeil;\r
`,n=`.dither-veil {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
  touch-action: pan-y;\r
}\r
`,e=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
import { Renderer, Program, Mesh, Triangle, Texture, RenderTarget } from 'ogl';\r
\r
const DEFAULT_SRC = 'https://images.unsplash.com/photo-1737071371043-761e02b1ef95?q=80&w=1400&auto=format&fit=crop';\r
\r
const ORDERED = { bayer: 0, noise: 1, lines: 2 };\r
\r
const KERNELS = {\r
  atkinson: [\r
    [1, 0, 1 / 8],\r
    [2, 0, 1 / 8],\r
    [-1, 1, 1 / 8],\r
    [0, 1, 1 / 8],\r
    [1, 1, 1 / 8],\r
    [0, 2, 1 / 8]\r
  ],\r
  floyd: [\r
    [1, 0, 7 / 16],\r
    [-1, 1, 3 / 16],\r
    [0, 1, 5 / 16],\r
    [1, 1, 1 / 16]\r
  ]\r
};\r
\r
const MASK_SCALE = 0.5;\r
const MAX_BURSTS = 4;\r
const BURST_SECONDS = 1.2;\r
const HOLD = 1.6;\r
const INTRO_MS = 1100;\r
\r
const hexToRgb = hex => {\r
  let h = String(hex || '').replace('#', '');\r
  if (h.length === 3) h = h.replace(/./g, c => c + c);\r
  const n = parseInt(h.slice(0, 6), 16);\r
  return Number.isNaN(n) ? [0, 0, 0] : [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];\r
};\r
\r
const fitScale = (w, h, iw, ih, contain) => {\r
  const ratio = w / h / (iw / ih);\r
  if (contain) return ratio > 1 ? [ratio, 1] : [1, 1 / ratio];\r
  return ratio > 1 ? [1, 1 / ratio] : [ratio, 1];\r
};\r
\r
const wanderAt = (t, w, h) => [\r
  w * (0.5 + 0.33 * Math.sin(t * 0.53) + 0.08 * Math.sin(t * 1.31 + 0.6)),\r
  h * (0.5 + 0.28 * Math.sin(t * 0.71 + 1.1) + 0.07 * Math.cos(t * 1.57))\r
];\r
\r
const measureEdge = (context, image) => {\r
  const size = 32;\r
  context.canvas.width = size;\r
  context.canvas.height = size;\r
  context.drawImage(image, 0, 0, size, size);\r
  const data = context.getImageData(0, 0, size, size).data;\r
  const sum = [0, 0, 0];\r
  const squares = [0, 0, 0];\r
  let count = 0;\r
  for (let y = 0; y < size; y++) {\r
    for (let x = 0; x < size; x++) {\r
      if (x > 0 && y > 0 && x < size - 1 && y < size - 1) continue;\r
      for (let c = 0; c < 3; c++) {\r
        const v = data[(y * size + x) * 4 + c] / 255;\r
        sum[c] += v;\r
        squares[c] += v * v;\r
      }\r
      count++;\r
    }\r
  }\r
  const matte = [sum[0] / count, sum[1] / count, sum[2] / count];\r
  const spread =\r
    matte.reduce((total, mean, c) => total + Math.sqrt(Math.max(0, squares[c] / count - mean * mean)), 0) / 3;\r
  return { matte, plain: spread < 0.06 };\r
};\r
\r
let blueNoise = null;\r
\r
const getBlueNoise = () => {\r
  if (blueNoise) return blueNoise;\r
  const size = 64;\r
  const n = size * size;\r
  const wrap = size - 1;\r
  const taps = [];\r
  for (let dy = -6; dy <= 6; dy++) {\r
    for (let dx = -6; dx <= 6; dx++) taps.push(dx, dy, Math.exp(-(dx * dx + dy * dy) / 4.5));\r
  }\r
  const energy = new Float32Array(n);\r
  const on = new Uint8Array(n);\r
  const splat = (i, sign) => {\r
    const x = i % size;\r
    const y = (i - x) / size;\r
    for (let k = 0; k < taps.length; k += 3) {\r
      energy[((y + taps[k + 1]) & wrap) * size + ((x + taps[k]) & wrap)] += sign * taps[k + 2];\r
    }\r
  };\r
  const find = (state, highest) => {\r
    let best = 0;\r
    let value = highest ? -Infinity : Infinity;\r
    for (let i = 0; i < n; i++) {\r
      if (on[i] !== state) continue;\r
      if (highest ? energy[i] > value : energy[i] < value) {\r
        value = energy[i];\r
        best = i;\r
      }\r
    }\r
    return best;\r
  };\r
  let seed = 7;\r
  const random = () => {\r
    seed = (seed * 16807) % 2147483647;\r
    return seed / 2147483647;\r
  };\r
  const initial = Math.round(n * 0.1);\r
  for (let placed = 0; placed < initial; ) {\r
    const i = Math.floor(random() * n);\r
    if (on[i]) continue;\r
    on[i] = 1;\r
    splat(i, 1);\r
    placed++;\r
  }\r
  for (let guard = 0; guard < n; guard++) {\r
    const cluster = find(1, true);\r
    on[cluster] = 0;\r
    splat(cluster, -1);\r
    const gap = find(0, false);\r
    on[gap] = 1;\r
    splat(gap, 1);\r
    if (gap === cluster) break;\r
  }\r
  const seedOn = on.slice();\r
  const seedEnergy = energy.slice();\r
  const rank = new Uint16Array(n);\r
  for (let r = initial - 1; r >= 0; r--) {\r
    const cluster = find(1, true);\r
    on[cluster] = 0;\r
    splat(cluster, -1);\r
    rank[cluster] = r;\r
  }\r
  on.set(seedOn);\r
  energy.set(seedEnergy);\r
  for (let r = initial; r < n; r++) {\r
    const gap = find(0, false);\r
    on[gap] = 1;\r
    splat(gap, 1);\r
    rank[gap] = r;\r
  }\r
  const data = new Uint8Array(n * 4);\r
  for (let i = 0; i < n; i++) {\r
    const v = Math.floor((rank[i] / n) * 256);\r
    data[i * 4] = v;\r
    data[i * 4 + 1] = v;\r
    data[i * 4 + 2] = v;\r
    data[i * 4 + 3] = 255;\r
  }\r
  blueNoise = data;\r
  return data;\r
};\r
\r
const diffuse = (pixels, cols, rows, kernel, levels, rgb, grade) => {\r
  const channels = rgb ? 3 : 1;\r
  const values = new Float32Array(cols * rows * channels);\r
  for (let i = 0; i < cols * rows; i++) {\r
    const r = pixels[i * 4] / 255;\r
    const g = pixels[i * 4 + 1] / 255;\r
    const b = pixels[i * 4 + 2] / 255;\r
    if (rgb) {\r
      values[i * 3] = grade(r);\r
      values[i * 3 + 1] = grade(g);\r
      values[i * 3 + 2] = grade(b);\r
    } else {\r
      values[i] = grade(0.2126 * r + 0.7152 * g + 0.0722 * b);\r
    }\r
  }\r
  const steps = levels - 1;\r
  const out = new Uint8Array(cols * rows * 4);\r
  for (let y = 0; y < rows; y++) {\r
    const dir = y & 1 ? -1 : 1;\r
    for (let i = 0; i < cols; i++) {\r
      const x = dir > 0 ? i : cols - 1 - i;\r
      const p = y * cols + x;\r
      for (let c = 0; c < channels; c++) {\r
        const old = values[p * channels + c];\r
        const q = Math.min(steps, Math.max(0, Math.round(old * steps))) / steps;\r
        const err = old - q;\r
        const byte = Math.round(q * 255);\r
        if (rgb) out[p * 4 + c] = byte;\r
        else out[p * 4] = out[p * 4 + 1] = out[p * 4 + 2] = byte;\r
        for (let k = 0; k < kernel.length; k++) {\r
          const nx = x + kernel[k][0] * dir;\r
          const ny = y + kernel[k][1];\r
          if (nx < 0 || nx >= cols || ny >= rows) continue;\r
          values[(ny * cols + nx) * channels + c] += err * kernel[k][2];\r
        }\r
      }\r
      out[p * 4 + 3] = 255;\r
    }\r
  }\r
  return out;\r
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
const maskFragment = \`#version 300 es\r
precision highp float;\r
\r
uniform sampler2D tPrev;\r
uniform vec2 uSize;\r
uniform vec2 uFrom;\r
uniform vec2 uTo;\r
uniform float uRadius;\r
uniform float uSoftness;\r
uniform float uStrength;\r
uniform float uFade;\r
uniform float uHold;\r
\r
in vec2 vUv;\r
out vec4 fragColor;\r
\r
float strokeDistance(vec2 p, vec2 a, vec2 b) {\r
  vec2 ab = b - a;\r
  float h = clamp(dot(p - a, ab) / max(dot(ab, ab), 0.0001), 0.0, 1.0);\r
  return length(p - a - ab * h);\r
}\r
\r
void main() {\r
  vec2 p = vec2(vUv.x, 1.0 - vUv.y) * uSize;\r
  float trail = max(texture(tPrev, vUv).r - uFade, 0.0);\r
  float band = max(uRadius * uSoftness, 1.0) * uHold;\r
  float d = strokeDistance(p, uFrom, uTo);\r
  trail = max(trail, clamp((uRadius - d) / band, 0.0, 1.0) * uStrength);\r
  fragColor = vec4(trail, 0.0, 0.0, 1.0);\r
}\r
\`;\r
\r
const viewFragment = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
\r
uniform sampler2D tImage;\r
uniform sampler2D tMask;\r
uniform sampler2D tNoise;\r
uniform sampler2D tDiffused;\r
uniform vec2 uResolution;\r
uniform vec2 uCover;\r
uniform float uLod;\r
uniform float uCell;\r
uniform int uPattern;\r
uniform int uPalette;\r
uniform float uLevels;\r
uniform vec3 uInk;\r
uniform vec3 uPaper;\r
uniform vec3 uRimColor;\r
uniform float uRim;\r
uniform float uContrast;\r
uniform float uBrightness;\r
uniform float uReverse;\r
uniform float uIntro;\r
uniform float uHold;\r
uniform vec3 uMatte;\r
uniform float uKey;\r
uniform vec2 uSize;\r
uniform vec4 uBursts[4];\r
uniform float uBurstWidth;\r
\r
in vec2 vUv;\r
out vec4 fragColor;\r
\r
float bayer(vec2 cell) {\r
  ivec2 p = ivec2(mod(cell, 8.0));\r
  int v = p.x ^ p.y;\r
  int m = ((v & 1) << 5) | ((p.y & 1) << 4) | ((v & 2) << 2) | ((p.y & 2) << 1) | ((v & 4) >> 1) | ((p.y & 4) >> 2);\r
  return (float(m) + 0.5) / 64.0;\r
}\r
\r
float blueNoise(vec2 cell) {\r
  return (texelFetch(tNoise, ivec2(mod(cell, 64.0)), 0).r * 255.0 + 0.5) / 256.0;\r
}\r
\r
float engraving(vec2 cell) {\r
  float period = 6.0;\r
  float f = (mod(cell.x + cell.y, period) + 0.5) / period;\r
  return clamp(abs(f * 2.0 - 1.0) + (bayer(cell) - 0.5) * (2.0 / period), 0.0, 1.0);\r
}\r
\r
vec2 imageUv(vec2 uv) {\r
  return (uv - 0.5) * uCover + 0.5;\r
}\r
\r
float within(vec2 p) {\r
  vec2 s = step(vec2(0.0), p) * step(p, vec2(1.0));\r
  return s.x * s.y;\r
}\r
\r
vec3 grade(vec3 c) {\r
  return pow(clamp((c - 0.5) * uContrast + 0.5 + uBrightness, 0.0, 1.0), vec3(1.6));\r
}\r
\r
float shockwave(vec2 p) {\r
  float value = 0.0;\r
  for (int i = 0; i < 4; i++) {\r
    vec4 burst = uBursts[i];\r
    if (burst.w <= 0.0) continue;\r
    float offset = distance(p, burst.xy) - burst.z;\r
    float edge = offset > 0.0 ? offset / (uBurstWidth * 0.35) : -offset / uBurstWidth;\r
    value = max(value, clamp(1.0 - edge, 0.0, 1.0) * burst.w);\r
  }\r
  return value;\r
}\r
\r
vec3 toned(vec3 c) {\r
  return uPalette == 1 ? grade(c) : grade(vec3(dot(c, vec3(0.2126, 0.7152, 0.0722))));\r
}\r
\r
vec3 quantize(vec3 v, float t) {\r
  float steps = max(uLevels - 1.0, 1.0);\r
  vec3 s = v * steps;\r
  vec3 base = floor(s);\r
  return min(base + step(vec3(t), s - base), vec3(steps)) / steps;\r
}\r
\r
void main() {\r
  vec2 px = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);\r
  vec2 cell = floor(px / uCell);\r
  vec2 center = (cell + 0.5) * uCell;\r
  vec2 cellUv = vec2(center.x / uResolution.x, 1.0 - center.y / uResolution.y);\r
\r
  vec2 sampleUv = imageUv(cellUv);\r
  float framed = within(sampleUv);\r
  vec3 level;\r
  if (uPattern == 3) {\r
    level = texelFetch(tDiffused, ivec2(cell), 0).rgb;\r
  } else {\r
    vec3 c = mix(uMatte, textureLod(tImage, sampleUv, uLod).rgb, framed);\r
    float t = uPattern == 1 ? blueNoise(cell) : (uPattern == 2 ? engraving(cell) : bayer(cell));\r
    level = quantize(toned(c), t);\r
  }\r
\r
  vec3 color = mix(uInk, mix(uInk, uPaper, level), max(framed, uKey));\r
  vec3 backdrop = mix(uInk, uPaper, toned(uMatte));\r
  vec2 photoUv = imageUv(vUv);\r
  vec3 raw = texture(tImage, photoUv).rgb;\r
  float plain = uKey * (1.0 - smoothstep(0.05, 0.22, distance(raw, uMatte)));\r
  vec3 photo = mix(mix(uInk, backdrop, uKey), mix(raw, backdrop, plain), within(photoUv));\r
\r
  vec2 point = vec2(cellUv.x, 1.0 - cellUv.y) * uSize;\r
  float mask = max(clamp(texture(tMask, cellUv).r * uHold, 0.0, 1.0), shockwave(point));\r
  float shown = mix(mask, 1.0 - mask, uReverse);\r
  float order = bayer(cell.yx);\r
  float low = order * (1.0 - uRim);\r
  color = mix(color, uRimColor, step(low, shown) * step(0.001, uRim));\r
  color = mix(color, photo, step(low + uRim, shown));\r
\r
  vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);\r
  float spread = length((cellUv - 0.5) * aspect) / length(aspect * 0.5);\r
  float appear = step(spread * 0.72 + bayer(cell + vec2(3.0, 5.0)) * 0.28, uIntro * 1.001);\r
  fragColor = vec4(mix(uInk, color, appear), 1.0);\r
}\r
\`;\r
\r
const DitherVeil = ({\r
  src = DEFAULT_SRC,\r
  fit = 'contain',\r
  pattern = 'floyd',\r
  pixelSize = 2,\r
  levels = 2,\r
  palette = 'duotone',\r
  inkColor = '#120f17',\r
  paperColor = '#f4f1ea',\r
  contrast = 1.15,\r
  brightness = 0,\r
  revealRadius = 200,\r
  softness = 0.6,\r
  linger = 1,\r
  rimColor = '#a78bfa',\r
  rim = 0,\r
  reverse = false,\r
  wander = false,\r
  clickBurst = true,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const settingsRef = useRef(null);\r
  const wakeRef = useRef(() => {});\r
\r
  useEffect(() => {\r
    settingsRef.current = {\r
      fit,\r
      pattern,\r
      pixelSize,\r
      levels,\r
      palette,\r
      inkColor,\r
      paperColor,\r
      contrast,\r
      brightness,\r
      revealRadius,\r
      softness,\r
      linger,\r
      rimColor,\r
      rim,\r
      reverse,\r
      wander,\r
      clickBurst\r
    };\r
    wakeRef.current();\r
  });\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    if (!container) return undefined;\r
\r
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;\r
    const renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio || 1, 2), alpha: false, antialias: false });\r
    const gl = renderer.gl;\r
    const canvas = gl.canvas;\r
    canvas.style.display = 'block';\r
    canvas.style.width = '100%';\r
    canvas.style.height = '100%';\r
    container.appendChild(canvas);\r
\r
    const floatMask = renderer.isWebgl2 && !!renderer.getExtension('EXT_color_buffer_float');\r
    const geometry = new Triangle(gl);\r
\r
    const dataTexture = () =>\r
      new Texture(gl, {\r
        image: new Uint8Array(4),\r
        width: 1,\r
        height: 1,\r
        generateMipmaps: false,\r
        flipY: false,\r
        minFilter: gl.NEAREST,\r
        magFilter: gl.NEAREST\r
      });\r
    const imageTexture = new Texture(gl, { minFilter: gl.LINEAR_MIPMAP_LINEAR, magFilter: gl.LINEAR });\r
    const noiseTexture = dataTexture();\r
    const diffusedTexture = dataTexture();\r
\r
    const createMask = (w, h) =>\r
      new RenderTarget(gl, {\r
        width: w,\r
        height: h,\r
        depth: false,\r
        type: floatMask ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE,\r
        internalFormat: floatMask ? gl.RGBA16F : gl.RGBA,\r
        minFilter: gl.LINEAR,\r
        magFilter: gl.LINEAR\r
      });\r
    const destroyMask = target => {\r
      gl.deleteFramebuffer(target.buffer);\r
      gl.deleteTexture(target.texture.texture);\r
    };\r
    let masks = [createMask(2, 2), createMask(2, 2)];\r
\r
    const maskUniforms = {\r
      tPrev: { value: masks[0].texture },\r
      uSize: { value: [1, 1] },\r
      uFrom: { value: [0, 0] },\r
      uTo: { value: [0, 0] },\r
      uRadius: { value: 1 },\r
      uSoftness: { value: 0.5 },\r
      uStrength: { value: 0 },\r
      uFade: { value: 1 },\r
      uHold: { value: HOLD }\r
    };\r
    const viewUniforms = {\r
      tImage: { value: imageTexture },\r
      tMask: { value: masks[0].texture },\r
      tNoise: { value: noiseTexture },\r
      tDiffused: { value: diffusedTexture },\r
      uResolution: { value: [1, 1] },\r
      uCover: { value: [1, 1] },\r
      uLod: { value: 0 },\r
      uCell: { value: 3 },\r
      uPattern: { value: 0 },\r
      uPalette: { value: 0 },\r
      uLevels: { value: 2 },\r
      uInk: { value: [0, 0, 0] },\r
      uPaper: { value: [1, 1, 1] },\r
      uRimColor: { value: [1, 1, 1] },\r
      uRim: { value: 0 },\r
      uContrast: { value: 1 },\r
      uBrightness: { value: 0 },\r
      uReverse: { value: 0 },\r
      uIntro: { value: 0 },\r
      uHold: { value: HOLD },\r
      uMatte: { value: [0, 0, 0] },\r
      uKey: { value: 0 },\r
      uSize: { value: [1, 1] },\r
      uBursts: { value: Array.from({ length: MAX_BURSTS * 4 }, () => 0) },\r
      uBurstWidth: { value: 60 }\r
    };\r
    const program = (fragment, uniforms) =>\r
      new Program(gl, { vertex, fragment, uniforms, depthTest: false, depthWrite: false });\r
    const maskMesh = new Mesh(gl, { geometry, program: program(maskFragment, maskUniforms) });\r
    const viewMesh = new Mesh(gl, { geometry, program: program(viewFragment, viewUniforms) });\r
\r
    const sampler = document.createElement('canvas');\r
    const samplerContext = sampler.getContext('2d', { willReadFrequently: true });\r
\r
    let image = null;\r
    let introStart = 0;\r
    let diffusedKey = '';\r
    let diffusionBlocked = false;\r
    let width = 1;\r
    let height = 1;\r
    let visible = true;\r
    let raf = 0;\r
    let last = performance.now();\r
    let trailUntil = 0;\r
    let presence = 0;\r
    let drift = 0;\r
    const pointer = { x: 0, y: 0, inside: false, fresh: true, placed: false };\r
    const brush = { x: 0, y: 0, px: 0, py: 0 };\r
    const bursts = [];\r
\r
    const layout = () => {\r
      width = Math.max(1, container.clientWidth);\r
      height = Math.max(1, container.clientHeight);\r
      renderer.setSize(width, height);\r
      viewUniforms.uResolution.value = [canvas.width, canvas.height];\r
      maskUniforms.uSize.value = [width, height];\r
      viewUniforms.uSize.value = [width, height];\r
      const mw = Math.max(2, Math.round(width * MASK_SCALE));\r
      const mh = Math.max(2, Math.round(height * MASK_SCALE));\r
      if (mw !== masks[0].width || mh !== masks[0].height) {\r
        masks.forEach(destroyMask);\r
        masks = [createMask(mw, mh), createMask(mw, mh)];\r
      }\r
      if (!pointer.placed) {\r
        pointer.x = width / 2;\r
        pointer.y = height / 2;\r
      }\r
    };\r
\r
    const updateDiffusion = (cell, s) => {\r
      if (!image || !samplerContext) return;\r
      const cols = Math.ceil(canvas.width / cell);\r
      const rows = Math.ceil(canvas.height / cell);\r
      const key = [\r
        s.pattern,\r
        s.levels,\r
        s.palette,\r
        s.contrast,\r
        s.brightness,\r
        s.fit,\r
        cols,\r
        rows,\r
        canvas.width,\r
        canvas.height\r
      ].join('|');\r
      if (key === diffusedKey) return;\r
      diffusedKey = key;\r
      const [cx, cy] = viewUniforms.uCover.value;\r
      const iw = image.naturalWidth;\r
      const ih = image.naturalHeight;\r
      sampler.width = cols;\r
      sampler.height = rows;\r
      samplerContext.imageSmoothingEnabled = true;\r
      samplerContext.imageSmoothingQuality = 'high';\r
      const [mr, mg, mb] = viewUniforms.uMatte.value;\r
      samplerContext.fillStyle = \`rgb(\${mr * 255}, \${mg * 255}, \${mb * 255})\`;\r
      samplerContext.fillRect(0, 0, cols, rows);\r
      const sx = (0.5 - 0.5 * cx) * iw;\r
      const sy = (0.5 - 0.5 * cy) * ih;\r
      const sw = ((cols * cell) / canvas.width) * cx * iw;\r
      const sh = ((rows * cell) / canvas.height) * cy * ih;\r
      const x0 = Math.max(sx, 0);\r
      const y0 = Math.max(sy, 0);\r
      const x1 = Math.min(sx + sw, iw);\r
      const y1 = Math.min(sy + sh, ih);\r
      if (x1 > x0 && y1 > y0) {\r
        samplerContext.drawImage(\r
          image,\r
          x0,\r
          y0,\r
          x1 - x0,\r
          y1 - y0,\r
          ((x0 - sx) / sw) * cols,\r
          ((y0 - sy) / sh) * rows,\r
          ((x1 - x0) / sw) * cols,\r
          ((y1 - y0) / sh) * rows\r
        );\r
      }\r
      const grade = v => Math.pow(Math.min(1, Math.max(0, (v - 0.5) * s.contrast + 0.5 + s.brightness)), 1.6);\r
      const pixels = samplerContext.getImageData(0, 0, cols, rows).data;\r
      diffusedTexture.image = diffuse(pixels, cols, rows, KERNELS[s.pattern], s.levels, s.palette === 'rgb', grade);\r
      diffusedTexture.width = cols;\r
      diffusedTexture.height = rows;\r
      diffusedTexture.needsUpdate = true;\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      const s = settingsRef.current;\r
      if (!s) return;\r
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));\r
      last = now;\r
\r
      const wanderOn = s.wander && !reducedMotion;\r
      let targetX = pointer.x;\r
      let targetY = pointer.y;\r
      if (!pointer.inside && wanderOn) {\r
        drift = Math.min(1, drift + dt / 1.2);\r
        const [wx, wy] = wanderAt(now / 1000, width, height);\r
        const k = drift * drift * (3 - 2 * drift);\r
        targetX += (wx - targetX) * k;\r
        targetY += (wy - targetY) * k;\r
      } else {\r
        drift = 0;\r
      }\r
\r
      presence += ((pointer.inside || wanderOn ? 1 : 0) - presence) * (1 - Math.exp(-dt / 0.16));\r
\r
      if (pointer.fresh) {\r
        brush.x = brush.px = targetX;\r
        brush.y = brush.py = targetY;\r
        pointer.fresh = false;\r
      } else {\r
        const follow = 1 - Math.exp(-dt / 0.035);\r
        brush.x += (targetX - brush.x) * follow;\r
        brush.y += (targetY - brush.y) * follow;\r
      }\r
\r
      const burstData = viewUniforms.uBursts.value;\r
      burstData.fill(0);\r
      for (let i = bursts.length - 1; i >= 0; i--) {\r
        if ((now - bursts[i].start) / 1000 >= BURST_SECONDS) bursts.splice(i, 1);\r
      }\r
      bursts.forEach((b, i) => {\r
        const k = Math.max(0, (now - b.start) / 1000 / BURST_SECONDS);\r
        const reach =\r
          Math.hypot(Math.max(b.x, width - b.x), Math.max(b.y, height - b.y)) + viewUniforms.uBurstWidth.value;\r
        burstData[i * 4] = b.x;\r
        burstData[i * 4 + 1] = b.y;\r
        burstData[i * 4 + 2] = reach * Math.sin((k * Math.PI) / 2);\r
        burstData[i * 4 + 3] = 1 - k * k * k;\r
      });\r
\r
      if (presence > 0.002) trailUntil = now + s.linger * 1000 + 150;\r
\r
      const minFade = floatMask ? 0 : 1.5 / 255;\r
      const fade = s.linger > 0 ? dt / s.linger : 1;\r
      maskUniforms.tPrev.value = masks[0].texture;\r
      maskUniforms.uFrom.value = [brush.px, brush.py];\r
      maskUniforms.uTo.value = [brush.x, brush.y];\r
      maskUniforms.uRadius.value = s.revealRadius * (0.45 + 0.55 * presence);\r
      maskUniforms.uSoftness.value = s.softness;\r
      maskUniforms.uStrength.value = presence;\r
      maskUniforms.uFade.value = Math.max(fade, minFade);\r
      viewUniforms.uBurstWidth.value = Math.max(60, s.revealRadius * 0.9);\r
      renderer.render({ scene: maskMesh, target: masks[1] });\r
      masks.reverse();\r
      brush.px = brush.x;\r
      brush.py = brush.y;\r
\r
      const cell = Math.max(1, Math.round(s.pixelSize * renderer.dpr));\r
      if (image) {\r
        viewUniforms.uCover.value = fitScale(\r
          canvas.width,\r
          canvas.height,\r
          image.naturalWidth,\r
          image.naturalHeight,\r
          s.fit === 'contain'\r
        );\r
      }\r
      let patternIndex = ORDERED[s.pattern] ?? 0;\r
      if (KERNELS[s.pattern]) {\r
        patternIndex = 0;\r
        if (image && !diffusionBlocked) {\r
          try {\r
            updateDiffusion(cell, s);\r
            patternIndex = 3;\r
          } catch {\r
            diffusionBlocked = true;\r
          }\r
        }\r
      }\r
      if (patternIndex === 1 && noiseTexture.width !== 64) {\r
        noiseTexture.image = getBlueNoise();\r
        noiseTexture.width = 64;\r
        noiseTexture.height = 64;\r
        noiseTexture.needsUpdate = true;\r
      }\r
\r
      const texelsPerPixel = image ? (viewUniforms.uCover.value[0] * image.naturalWidth) / canvas.width : 1;\r
      viewUniforms.tMask.value = masks[0].texture;\r
      viewUniforms.uCell.value = cell;\r
      viewUniforms.uLod.value = Math.log2(Math.max(cell * texelsPerPixel, 1));\r
      viewUniforms.uPattern.value = patternIndex;\r
      viewUniforms.uPalette.value = s.palette === 'rgb' ? 1 : 0;\r
      viewUniforms.uLevels.value = Math.max(2, Math.round(s.levels));\r
      viewUniforms.uInk.value = hexToRgb(s.inkColor);\r
      viewUniforms.uPaper.value = hexToRgb(s.paperColor);\r
      viewUniforms.uRimColor.value = hexToRgb(s.rimColor);\r
      viewUniforms.uRim.value = Math.min(Math.max(s.rim, 0), 0.95);\r
      viewUniforms.uContrast.value = s.contrast;\r
      viewUniforms.uBrightness.value = s.brightness;\r
      viewUniforms.uReverse.value = s.reverse ? 1 : 0;\r
      const intro = image ? Math.min(1, (now - introStart) / INTRO_MS) : 0;\r
      viewUniforms.uIntro.value = 1 - Math.pow(1 - intro, 2);\r
      renderer.render({ scene: viewMesh });\r
\r
      const busy =\r
        pointer.inside || wanderOn || presence > 0.002 || bursts.length > 0 || now < trailUntil || (image && intro < 1);\r
      if (busy && visible) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (raf || !visible) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
    wakeRef.current = wake;\r
\r
    const img = new Image();\r
    img.crossOrigin = 'anonymous';\r
    img.decoding = 'async';\r
    img.onload = () => {\r
      image = img;\r
      imageTexture.image = img;\r
      try {\r
        if (samplerContext) {\r
          const edge = measureEdge(samplerContext, img);\r
          viewUniforms.uMatte.value = edge.matte;\r
          viewUniforms.uKey.value = edge.plain ? 1 : 0;\r
        }\r
      } catch {}\r
      introStart = performance.now();\r
      wake();\r
    };\r
    img.src = src;\r
\r
    const locate = e => {\r
      const rect = container.getBoundingClientRect();\r
      pointer.x = e.clientX - rect.left;\r
      pointer.y = e.clientY - rect.top;\r
      pointer.placed = true;\r
    };\r
    const onMove = e => {\r
      locate(e);\r
      if (!pointer.inside) {\r
        pointer.inside = true;\r
        pointer.fresh = true;\r
      }\r
      wake();\r
    };\r
    const onLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
    const onDown = e => {\r
      onMove(e);\r
      if (!settingsRef.current?.clickBurst || (e.pointerType === 'mouse' && e.button !== 0)) return;\r
      bursts.push({ x: pointer.x, y: pointer.y, start: performance.now() });\r
      if (bursts.length > MAX_BURSTS) bursts.shift();\r
    };\r
    container.addEventListener('pointermove', onMove, { passive: true });\r
    container.addEventListener('pointerenter', onMove, { passive: true });\r
    container.addEventListener('pointerdown', onDown, { passive: true });\r
    container.addEventListener('pointerleave', onLeave, { passive: true });\r
    container.addEventListener('pointercancel', onLeave, { passive: true });\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      layout();\r
      wake();\r
    });\r
    resizeObserver.observe(container);\r
    const intersectionObserver = new IntersectionObserver(([entry]) => {\r
      visible = entry.isIntersecting;\r
      wake();\r
    });\r
    intersectionObserver.observe(container);\r
\r
    layout();\r
    wake();\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = () => {};\r
      resizeObserver.disconnect();\r
      intersectionObserver.disconnect();\r
      img.onload = null;\r
      container.removeEventListener('pointermove', onMove);\r
      container.removeEventListener('pointerenter', onMove);\r
      container.removeEventListener('pointerdown', onDown);\r
      container.removeEventListener('pointerleave', onLeave);\r
      container.removeEventListener('pointercancel', onLeave);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);\r
    };\r
  }, [src]);\r
\r
  return (\r
    <div\r
      ref={containerRef}\r
      className={\`relative w-full h-full overflow-hidden touch-pan-y \${className}\`.trim()}\r
      style={style}\r
    />\r
  );\r
};\r
\r
export default DitherVeil;\r
`,t=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
import type { CSSProperties } from 'react';\r
import { Renderer, Program, Mesh, Triangle, Texture, RenderTarget } from 'ogl';\r
\r
import './DitherVeil.css';\r
\r
type Pattern = 'bayer' | 'noise' | 'atkinson' | 'floyd' | 'lines';\r
type Palette = 'duotone' | 'rgb';\r
type Fit = 'contain' | 'cover';\r
type Kernel = [number, number, number][];\r
type Rgb = [number, number, number];\r
\r
export interface DitherVeilProps {\r
  src?: string;\r
  fit?: Fit;\r
  pattern?: Pattern;\r
  pixelSize?: number;\r
  levels?: number;\r
  palette?: Palette;\r
  inkColor?: string;\r
  paperColor?: string;\r
  contrast?: number;\r
  brightness?: number;\r
  revealRadius?: number;\r
  softness?: number;\r
  linger?: number;\r
  rimColor?: string;\r
  rim?: number;\r
  reverse?: boolean;\r
  wander?: boolean;\r
  clickBurst?: boolean;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
type Settings = Required<Omit<DitherVeilProps, 'src' | 'className' | 'style'>>;\r
\r
const DEFAULT_SRC = 'https://images.unsplash.com/photo-1737071371043-761e02b1ef95?q=80&w=1400&auto=format&fit=crop';\r
\r
const ORDERED: Record<string, number> = { bayer: 0, noise: 1, lines: 2 };\r
\r
const KERNELS: Record<string, Kernel> = {\r
  atkinson: [\r
    [1, 0, 1 / 8],\r
    [2, 0, 1 / 8],\r
    [-1, 1, 1 / 8],\r
    [0, 1, 1 / 8],\r
    [1, 1, 1 / 8],\r
    [0, 2, 1 / 8]\r
  ],\r
  floyd: [\r
    [1, 0, 7 / 16],\r
    [-1, 1, 3 / 16],\r
    [0, 1, 5 / 16],\r
    [1, 1, 1 / 16]\r
  ]\r
};\r
\r
const MASK_SCALE = 0.5;\r
const MAX_BURSTS = 4;\r
const BURST_SECONDS = 1.2;\r
const HOLD = 1.6;\r
const INTRO_MS = 1100;\r
\r
const hexToRgb = (hex: string): Rgb => {\r
  let h = String(hex || '').replace('#', '');\r
  if (h.length === 3) h = h.replace(/./g, c => c + c);\r
  const n = parseInt(h.slice(0, 6), 16);\r
  return Number.isNaN(n) ? [0, 0, 0] : [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];\r
};\r
\r
const fitScale = (w: number, h: number, iw: number, ih: number, contain: boolean): [number, number] => {\r
  const ratio = w / h / (iw / ih);\r
  if (contain) return ratio > 1 ? [ratio, 1] : [1, 1 / ratio];\r
  return ratio > 1 ? [1, 1 / ratio] : [ratio, 1];\r
};\r
\r
const wanderAt = (t: number, w: number, h: number): [number, number] => [\r
  w * (0.5 + 0.33 * Math.sin(t * 0.53) + 0.08 * Math.sin(t * 1.31 + 0.6)),\r
  h * (0.5 + 0.28 * Math.sin(t * 0.71 + 1.1) + 0.07 * Math.cos(t * 1.57))\r
];\r
\r
const measureEdge = (context: CanvasRenderingContext2D, image: HTMLImageElement): { matte: Rgb; plain: boolean } => {\r
  const size = 32;\r
  context.canvas.width = size;\r
  context.canvas.height = size;\r
  context.drawImage(image, 0, 0, size, size);\r
  const data = context.getImageData(0, 0, size, size).data;\r
  const sum = [0, 0, 0];\r
  const squares = [0, 0, 0];\r
  let count = 0;\r
  for (let y = 0; y < size; y++) {\r
    for (let x = 0; x < size; x++) {\r
      if (x > 0 && y > 0 && x < size - 1 && y < size - 1) continue;\r
      for (let c = 0; c < 3; c++) {\r
        const v = data[(y * size + x) * 4 + c] / 255;\r
        sum[c] += v;\r
        squares[c] += v * v;\r
      }\r
      count++;\r
    }\r
  }\r
  const matte: Rgb = [sum[0] / count, sum[1] / count, sum[2] / count];\r
  const spread =\r
    matte.reduce((total, mean, c) => total + Math.sqrt(Math.max(0, squares[c] / count - mean * mean)), 0) / 3;\r
  return { matte, plain: spread < 0.06 };\r
};\r
\r
let blueNoise: Uint8Array | null = null;\r
\r
const getBlueNoise = (): Uint8Array => {\r
  if (blueNoise) return blueNoise;\r
  const size = 64;\r
  const n = size * size;\r
  const wrap = size - 1;\r
  const taps: number[] = [];\r
  for (let dy = -6; dy <= 6; dy++) {\r
    for (let dx = -6; dx <= 6; dx++) taps.push(dx, dy, Math.exp(-(dx * dx + dy * dy) / 4.5));\r
  }\r
  const energy = new Float32Array(n);\r
  const on = new Uint8Array(n);\r
  const splat = (i: number, sign: number) => {\r
    const x = i % size;\r
    const y = (i - x) / size;\r
    for (let k = 0; k < taps.length; k += 3) {\r
      energy[((y + taps[k + 1]) & wrap) * size + ((x + taps[k]) & wrap)] += sign * taps[k + 2];\r
    }\r
  };\r
  const find = (state: number, highest: boolean) => {\r
    let best = 0;\r
    let value = highest ? -Infinity : Infinity;\r
    for (let i = 0; i < n; i++) {\r
      if (on[i] !== state) continue;\r
      if (highest ? energy[i] > value : energy[i] < value) {\r
        value = energy[i];\r
        best = i;\r
      }\r
    }\r
    return best;\r
  };\r
  let seed = 7;\r
  const random = () => {\r
    seed = (seed * 16807) % 2147483647;\r
    return seed / 2147483647;\r
  };\r
  const initial = Math.round(n * 0.1);\r
  for (let placed = 0; placed < initial; ) {\r
    const i = Math.floor(random() * n);\r
    if (on[i]) continue;\r
    on[i] = 1;\r
    splat(i, 1);\r
    placed++;\r
  }\r
  for (let guard = 0; guard < n; guard++) {\r
    const cluster = find(1, true);\r
    on[cluster] = 0;\r
    splat(cluster, -1);\r
    const gap = find(0, false);\r
    on[gap] = 1;\r
    splat(gap, 1);\r
    if (gap === cluster) break;\r
  }\r
  const seedOn = on.slice();\r
  const seedEnergy = energy.slice();\r
  const rank = new Uint16Array(n);\r
  for (let r = initial - 1; r >= 0; r--) {\r
    const cluster = find(1, true);\r
    on[cluster] = 0;\r
    splat(cluster, -1);\r
    rank[cluster] = r;\r
  }\r
  on.set(seedOn);\r
  energy.set(seedEnergy);\r
  for (let r = initial; r < n; r++) {\r
    const gap = find(0, false);\r
    on[gap] = 1;\r
    splat(gap, 1);\r
    rank[gap] = r;\r
  }\r
  const data = new Uint8Array(n * 4);\r
  for (let i = 0; i < n; i++) {\r
    const v = Math.floor((rank[i] / n) * 256);\r
    data[i * 4] = v;\r
    data[i * 4 + 1] = v;\r
    data[i * 4 + 2] = v;\r
    data[i * 4 + 3] = 255;\r
  }\r
  blueNoise = data;\r
  return data;\r
};\r
\r
const diffuse = (\r
  pixels: Uint8ClampedArray,\r
  cols: number,\r
  rows: number,\r
  kernel: Kernel,\r
  levels: number,\r
  rgb: boolean,\r
  grade: (v: number) => number\r
): Uint8Array => {\r
  const channels = rgb ? 3 : 1;\r
  const values = new Float32Array(cols * rows * channels);\r
  for (let i = 0; i < cols * rows; i++) {\r
    const r = pixels[i * 4] / 255;\r
    const g = pixels[i * 4 + 1] / 255;\r
    const b = pixels[i * 4 + 2] / 255;\r
    if (rgb) {\r
      values[i * 3] = grade(r);\r
      values[i * 3 + 1] = grade(g);\r
      values[i * 3 + 2] = grade(b);\r
    } else {\r
      values[i] = grade(0.2126 * r + 0.7152 * g + 0.0722 * b);\r
    }\r
  }\r
  const steps = levels - 1;\r
  const out = new Uint8Array(cols * rows * 4);\r
  for (let y = 0; y < rows; y++) {\r
    const dir = y & 1 ? -1 : 1;\r
    for (let i = 0; i < cols; i++) {\r
      const x = dir > 0 ? i : cols - 1 - i;\r
      const p = y * cols + x;\r
      for (let c = 0; c < channels; c++) {\r
        const old = values[p * channels + c];\r
        const q = Math.min(steps, Math.max(0, Math.round(old * steps))) / steps;\r
        const err = old - q;\r
        const byte = Math.round(q * 255);\r
        if (rgb) out[p * 4 + c] = byte;\r
        else out[p * 4] = out[p * 4 + 1] = out[p * 4 + 2] = byte;\r
        for (let k = 0; k < kernel.length; k++) {\r
          const nx = x + kernel[k][0] * dir;\r
          const ny = y + kernel[k][1];\r
          if (nx < 0 || nx >= cols || ny >= rows) continue;\r
          values[(ny * cols + nx) * channels + c] += err * kernel[k][2];\r
        }\r
      }\r
      out[p * 4 + 3] = 255;\r
    }\r
  }\r
  return out;\r
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
const maskFragment = \`#version 300 es\r
precision highp float;\r
\r
uniform sampler2D tPrev;\r
uniform vec2 uSize;\r
uniform vec2 uFrom;\r
uniform vec2 uTo;\r
uniform float uRadius;\r
uniform float uSoftness;\r
uniform float uStrength;\r
uniform float uFade;\r
uniform float uHold;\r
\r
in vec2 vUv;\r
out vec4 fragColor;\r
\r
float strokeDistance(vec2 p, vec2 a, vec2 b) {\r
  vec2 ab = b - a;\r
  float h = clamp(dot(p - a, ab) / max(dot(ab, ab), 0.0001), 0.0, 1.0);\r
  return length(p - a - ab * h);\r
}\r
\r
void main() {\r
  vec2 p = vec2(vUv.x, 1.0 - vUv.y) * uSize;\r
  float trail = max(texture(tPrev, vUv).r - uFade, 0.0);\r
  float band = max(uRadius * uSoftness, 1.0) * uHold;\r
  float d = strokeDistance(p, uFrom, uTo);\r
  trail = max(trail, clamp((uRadius - d) / band, 0.0, 1.0) * uStrength);\r
  fragColor = vec4(trail, 0.0, 0.0, 1.0);\r
}\r
\`;\r
\r
const viewFragment = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
\r
uniform sampler2D tImage;\r
uniform sampler2D tMask;\r
uniform sampler2D tNoise;\r
uniform sampler2D tDiffused;\r
uniform vec2 uResolution;\r
uniform vec2 uCover;\r
uniform float uLod;\r
uniform float uCell;\r
uniform int uPattern;\r
uniform int uPalette;\r
uniform float uLevels;\r
uniform vec3 uInk;\r
uniform vec3 uPaper;\r
uniform vec3 uRimColor;\r
uniform float uRim;\r
uniform float uContrast;\r
uniform float uBrightness;\r
uniform float uReverse;\r
uniform float uIntro;\r
uniform float uHold;\r
uniform vec3 uMatte;\r
uniform float uKey;\r
uniform vec2 uSize;\r
uniform vec4 uBursts[4];\r
uniform float uBurstWidth;\r
\r
in vec2 vUv;\r
out vec4 fragColor;\r
\r
float bayer(vec2 cell) {\r
  ivec2 p = ivec2(mod(cell, 8.0));\r
  int v = p.x ^ p.y;\r
  int m = ((v & 1) << 5) | ((p.y & 1) << 4) | ((v & 2) << 2) | ((p.y & 2) << 1) | ((v & 4) >> 1) | ((p.y & 4) >> 2);\r
  return (float(m) + 0.5) / 64.0;\r
}\r
\r
float blueNoise(vec2 cell) {\r
  return (texelFetch(tNoise, ivec2(mod(cell, 64.0)), 0).r * 255.0 + 0.5) / 256.0;\r
}\r
\r
float engraving(vec2 cell) {\r
  float period = 6.0;\r
  float f = (mod(cell.x + cell.y, period) + 0.5) / period;\r
  return clamp(abs(f * 2.0 - 1.0) + (bayer(cell) - 0.5) * (2.0 / period), 0.0, 1.0);\r
}\r
\r
vec2 imageUv(vec2 uv) {\r
  return (uv - 0.5) * uCover + 0.5;\r
}\r
\r
float within(vec2 p) {\r
  vec2 s = step(vec2(0.0), p) * step(p, vec2(1.0));\r
  return s.x * s.y;\r
}\r
\r
vec3 grade(vec3 c) {\r
  return pow(clamp((c - 0.5) * uContrast + 0.5 + uBrightness, 0.0, 1.0), vec3(1.6));\r
}\r
\r
float shockwave(vec2 p) {\r
  float value = 0.0;\r
  for (int i = 0; i < 4; i++) {\r
    vec4 burst = uBursts[i];\r
    if (burst.w <= 0.0) continue;\r
    float offset = distance(p, burst.xy) - burst.z;\r
    float edge = offset > 0.0 ? offset / (uBurstWidth * 0.35) : -offset / uBurstWidth;\r
    value = max(value, clamp(1.0 - edge, 0.0, 1.0) * burst.w);\r
  }\r
  return value;\r
}\r
\r
vec3 toned(vec3 c) {\r
  return uPalette == 1 ? grade(c) : grade(vec3(dot(c, vec3(0.2126, 0.7152, 0.0722))));\r
}\r
\r
vec3 quantize(vec3 v, float t) {\r
  float steps = max(uLevels - 1.0, 1.0);\r
  vec3 s = v * steps;\r
  vec3 base = floor(s);\r
  return min(base + step(vec3(t), s - base), vec3(steps)) / steps;\r
}\r
\r
void main() {\r
  vec2 px = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);\r
  vec2 cell = floor(px / uCell);\r
  vec2 center = (cell + 0.5) * uCell;\r
  vec2 cellUv = vec2(center.x / uResolution.x, 1.0 - center.y / uResolution.y);\r
\r
  vec2 sampleUv = imageUv(cellUv);\r
  float framed = within(sampleUv);\r
  vec3 level;\r
  if (uPattern == 3) {\r
    level = texelFetch(tDiffused, ivec2(cell), 0).rgb;\r
  } else {\r
    vec3 c = mix(uMatte, textureLod(tImage, sampleUv, uLod).rgb, framed);\r
    float t = uPattern == 1 ? blueNoise(cell) : (uPattern == 2 ? engraving(cell) : bayer(cell));\r
    level = quantize(toned(c), t);\r
  }\r
\r
  vec3 color = mix(uInk, mix(uInk, uPaper, level), max(framed, uKey));\r
  vec3 backdrop = mix(uInk, uPaper, toned(uMatte));\r
  vec2 photoUv = imageUv(vUv);\r
  vec3 raw = texture(tImage, photoUv).rgb;\r
  float plain = uKey * (1.0 - smoothstep(0.05, 0.22, distance(raw, uMatte)));\r
  vec3 photo = mix(mix(uInk, backdrop, uKey), mix(raw, backdrop, plain), within(photoUv));\r
\r
  vec2 point = vec2(cellUv.x, 1.0 - cellUv.y) * uSize;\r
  float mask = max(clamp(texture(tMask, cellUv).r * uHold, 0.0, 1.0), shockwave(point));\r
  float shown = mix(mask, 1.0 - mask, uReverse);\r
  float order = bayer(cell.yx);\r
  float low = order * (1.0 - uRim);\r
  color = mix(color, uRimColor, step(low, shown) * step(0.001, uRim));\r
  color = mix(color, photo, step(low + uRim, shown));\r
\r
  vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);\r
  float spread = length((cellUv - 0.5) * aspect) / length(aspect * 0.5);\r
  float appear = step(spread * 0.72 + bayer(cell + vec2(3.0, 5.0)) * 0.28, uIntro * 1.001);\r
  fragColor = vec4(mix(uInk, color, appear), 1.0);\r
}\r
\`;\r
\r
const DitherVeil = ({\r
  src = DEFAULT_SRC,\r
  fit = 'contain',\r
  pattern = 'floyd',\r
  pixelSize = 2,\r
  levels = 2,\r
  palette = 'duotone',\r
  inkColor = '#120f17',\r
  paperColor = '#f4f1ea',\r
  contrast = 1.15,\r
  brightness = 0,\r
  revealRadius = 200,\r
  softness = 0.6,\r
  linger = 1,\r
  rimColor = '#a78bfa',\r
  rim = 0,\r
  reverse = false,\r
  wander = false,\r
  clickBurst = true,\r
  className = '',\r
  style\r
}: DitherVeilProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const settingsRef = useRef<Settings | null>(null);\r
  const wakeRef = useRef<() => void>(() => {});\r
\r
  useEffect(() => {\r
    settingsRef.current = {\r
      fit,\r
      pattern,\r
      pixelSize,\r
      levels,\r
      palette,\r
      inkColor,\r
      paperColor,\r
      contrast,\r
      brightness,\r
      revealRadius,\r
      softness,\r
      linger,\r
      rimColor,\r
      rim,\r
      reverse,\r
      wander,\r
      clickBurst\r
    };\r
    wakeRef.current();\r
  });\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    if (!container) return undefined;\r
\r
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;\r
    const renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio || 1, 2), alpha: false, antialias: false });\r
    const gl = renderer.gl;\r
    const canvas = gl.canvas;\r
    canvas.style.display = 'block';\r
    canvas.style.width = '100%';\r
    canvas.style.height = '100%';\r
    container.appendChild(canvas);\r
\r
    const gl2 = gl as WebGL2RenderingContext;\r
    const floatMask = renderer.isWebgl2 && !!renderer.getExtension('EXT_color_buffer_float');\r
    const geometry = new Triangle(gl);\r
\r
    const dataTexture = () =>\r
      new Texture(gl, {\r
        image: new Uint8Array(4),\r
        width: 1,\r
        height: 1,\r
        generateMipmaps: false,\r
        flipY: false,\r
        minFilter: gl.NEAREST,\r
        magFilter: gl.NEAREST\r
      });\r
    const imageTexture = new Texture(gl, { minFilter: gl.LINEAR_MIPMAP_LINEAR, magFilter: gl.LINEAR });\r
    const noiseTexture = dataTexture();\r
    const diffusedTexture = dataTexture();\r
\r
    const createMask = (w: number, h: number) =>\r
      new RenderTarget(gl, {\r
        width: w,\r
        height: h,\r
        depth: false,\r
        type: floatMask ? gl2.HALF_FLOAT : gl.UNSIGNED_BYTE,\r
        internalFormat: floatMask ? gl2.RGBA16F : gl.RGBA,\r
        minFilter: gl.LINEAR,\r
        magFilter: gl.LINEAR\r
      });\r
    const destroyMask = (target: RenderTarget) => {\r
      gl.deleteFramebuffer(target.buffer);\r
      gl.deleteTexture(target.texture.texture);\r
    };\r
    let masks = [createMask(2, 2), createMask(2, 2)];\r
\r
    const maskUniforms = {\r
      tPrev: { value: masks[0].texture },\r
      uSize: { value: [1, 1] },\r
      uFrom: { value: [0, 0] },\r
      uTo: { value: [0, 0] },\r
      uRadius: { value: 1 },\r
      uSoftness: { value: 0.5 },\r
      uStrength: { value: 0 },\r
      uFade: { value: 1 },\r
      uHold: { value: HOLD }\r
    };\r
    const viewUniforms = {\r
      tImage: { value: imageTexture },\r
      tMask: { value: masks[0].texture },\r
      tNoise: { value: noiseTexture },\r
      tDiffused: { value: diffusedTexture },\r
      uResolution: { value: [1, 1] },\r
      uCover: { value: [1, 1] },\r
      uLod: { value: 0 },\r
      uCell: { value: 3 },\r
      uPattern: { value: 0 },\r
      uPalette: { value: 0 },\r
      uLevels: { value: 2 },\r
      uInk: { value: [0, 0, 0] },\r
      uPaper: { value: [1, 1, 1] },\r
      uRimColor: { value: [1, 1, 1] },\r
      uRim: { value: 0 },\r
      uContrast: { value: 1 },\r
      uBrightness: { value: 0 },\r
      uReverse: { value: 0 },\r
      uIntro: { value: 0 },\r
      uHold: { value: HOLD },\r
      uMatte: { value: [0, 0, 0] },\r
      uKey: { value: 0 },\r
      uSize: { value: [1, 1] },\r
      uBursts: { value: Array.from({ length: MAX_BURSTS * 4 }, () => 0) },\r
      uBurstWidth: { value: 60 }\r
    };\r
    const program = (fragment: string, uniforms: Record<string, { value: unknown }>) =>\r
      new Program(gl, { vertex, fragment, uniforms, depthTest: false, depthWrite: false });\r
    const maskMesh = new Mesh(gl, { geometry, program: program(maskFragment, maskUniforms) });\r
    const viewMesh = new Mesh(gl, { geometry, program: program(viewFragment, viewUniforms) });\r
\r
    const sampler = document.createElement('canvas');\r
    const samplerContext = sampler.getContext('2d', { willReadFrequently: true });\r
\r
    let image: HTMLImageElement | null = null;\r
    let introStart = 0;\r
    let diffusedKey = '';\r
    let diffusionBlocked = false;\r
    let width = 1;\r
    let height = 1;\r
    let visible = true;\r
    let raf = 0;\r
    let last = performance.now();\r
    let trailUntil = 0;\r
    let presence = 0;\r
    let drift = 0;\r
    const pointer = { x: 0, y: 0, inside: false, fresh: true, placed: false };\r
    const brush = { x: 0, y: 0, px: 0, py: 0 };\r
    const bursts: { x: number; y: number; start: number }[] = [];\r
\r
    const layout = () => {\r
      width = Math.max(1, container.clientWidth);\r
      height = Math.max(1, container.clientHeight);\r
      renderer.setSize(width, height);\r
      viewUniforms.uResolution.value = [canvas.width, canvas.height];\r
      maskUniforms.uSize.value = [width, height];\r
      viewUniforms.uSize.value = [width, height];\r
      const mw = Math.max(2, Math.round(width * MASK_SCALE));\r
      const mh = Math.max(2, Math.round(height * MASK_SCALE));\r
      if (mw !== masks[0].width || mh !== masks[0].height) {\r
        masks.forEach(destroyMask);\r
        masks = [createMask(mw, mh), createMask(mw, mh)];\r
      }\r
      if (!pointer.placed) {\r
        pointer.x = width / 2;\r
        pointer.y = height / 2;\r
      }\r
    };\r
\r
    const updateDiffusion = (cell: number, s: Settings) => {\r
      if (!image || !samplerContext) return;\r
      const cols = Math.ceil(canvas.width / cell);\r
      const rows = Math.ceil(canvas.height / cell);\r
      const key = [\r
        s.pattern,\r
        s.levels,\r
        s.palette,\r
        s.contrast,\r
        s.brightness,\r
        s.fit,\r
        cols,\r
        rows,\r
        canvas.width,\r
        canvas.height\r
      ].join('|');\r
      if (key === diffusedKey) return;\r
      diffusedKey = key;\r
      const [cx, cy] = viewUniforms.uCover.value;\r
      const iw = image.naturalWidth;\r
      const ih = image.naturalHeight;\r
      sampler.width = cols;\r
      sampler.height = rows;\r
      samplerContext.imageSmoothingEnabled = true;\r
      samplerContext.imageSmoothingQuality = 'high';\r
      const [mr, mg, mb] = viewUniforms.uMatte.value;\r
      samplerContext.fillStyle = \`rgb(\${mr * 255}, \${mg * 255}, \${mb * 255})\`;\r
      samplerContext.fillRect(0, 0, cols, rows);\r
      const sx = (0.5 - 0.5 * cx) * iw;\r
      const sy = (0.5 - 0.5 * cy) * ih;\r
      const sw = ((cols * cell) / canvas.width) * cx * iw;\r
      const sh = ((rows * cell) / canvas.height) * cy * ih;\r
      const x0 = Math.max(sx, 0);\r
      const y0 = Math.max(sy, 0);\r
      const x1 = Math.min(sx + sw, iw);\r
      const y1 = Math.min(sy + sh, ih);\r
      if (x1 > x0 && y1 > y0) {\r
        samplerContext.drawImage(\r
          image,\r
          x0,\r
          y0,\r
          x1 - x0,\r
          y1 - y0,\r
          ((x0 - sx) / sw) * cols,\r
          ((y0 - sy) / sh) * rows,\r
          ((x1 - x0) / sw) * cols,\r
          ((y1 - y0) / sh) * rows\r
        );\r
      }\r
      const grade = (v: number) => Math.pow(Math.min(1, Math.max(0, (v - 0.5) * s.contrast + 0.5 + s.brightness)), 1.6);\r
      const pixels = samplerContext.getImageData(0, 0, cols, rows).data;\r
      diffusedTexture.image = diffuse(pixels, cols, rows, KERNELS[s.pattern], s.levels, s.palette === 'rgb', grade);\r
      diffusedTexture.width = cols;\r
      diffusedTexture.height = rows;\r
      diffusedTexture.needsUpdate = true;\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      const s = settingsRef.current;\r
      if (!s) return;\r
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));\r
      last = now;\r
\r
      const wanderOn = s.wander && !reducedMotion;\r
      let targetX = pointer.x;\r
      let targetY = pointer.y;\r
      if (!pointer.inside && wanderOn) {\r
        drift = Math.min(1, drift + dt / 1.2);\r
        const [wx, wy] = wanderAt(now / 1000, width, height);\r
        const k = drift * drift * (3 - 2 * drift);\r
        targetX += (wx - targetX) * k;\r
        targetY += (wy - targetY) * k;\r
      } else {\r
        drift = 0;\r
      }\r
\r
      presence += ((pointer.inside || wanderOn ? 1 : 0) - presence) * (1 - Math.exp(-dt / 0.16));\r
\r
      if (pointer.fresh) {\r
        brush.x = brush.px = targetX;\r
        brush.y = brush.py = targetY;\r
        pointer.fresh = false;\r
      } else {\r
        const follow = 1 - Math.exp(-dt / 0.035);\r
        brush.x += (targetX - brush.x) * follow;\r
        brush.y += (targetY - brush.y) * follow;\r
      }\r
\r
      const burstData = viewUniforms.uBursts.value;\r
      burstData.fill(0);\r
      for (let i = bursts.length - 1; i >= 0; i--) {\r
        if ((now - bursts[i].start) / 1000 >= BURST_SECONDS) bursts.splice(i, 1);\r
      }\r
      bursts.forEach((b, i) => {\r
        const k = Math.max(0, (now - b.start) / 1000 / BURST_SECONDS);\r
        const reach =\r
          Math.hypot(Math.max(b.x, width - b.x), Math.max(b.y, height - b.y)) + viewUniforms.uBurstWidth.value;\r
        burstData[i * 4] = b.x;\r
        burstData[i * 4 + 1] = b.y;\r
        burstData[i * 4 + 2] = reach * Math.sin((k * Math.PI) / 2);\r
        burstData[i * 4 + 3] = 1 - k * k * k;\r
      });\r
\r
      if (presence > 0.002) trailUntil = now + s.linger * 1000 + 150;\r
\r
      const minFade = floatMask ? 0 : 1.5 / 255;\r
      const fade = s.linger > 0 ? dt / s.linger : 1;\r
      maskUniforms.tPrev.value = masks[0].texture;\r
      maskUniforms.uFrom.value = [brush.px, brush.py];\r
      maskUniforms.uTo.value = [brush.x, brush.y];\r
      maskUniforms.uRadius.value = s.revealRadius * (0.45 + 0.55 * presence);\r
      maskUniforms.uSoftness.value = s.softness;\r
      maskUniforms.uStrength.value = presence;\r
      maskUniforms.uFade.value = Math.max(fade, minFade);\r
      viewUniforms.uBurstWidth.value = Math.max(60, s.revealRadius * 0.9);\r
      renderer.render({ scene: maskMesh, target: masks[1] });\r
      masks.reverse();\r
      brush.px = brush.x;\r
      brush.py = brush.y;\r
\r
      const cell = Math.max(1, Math.round(s.pixelSize * renderer.dpr));\r
      if (image) {\r
        viewUniforms.uCover.value = fitScale(\r
          canvas.width,\r
          canvas.height,\r
          image.naturalWidth,\r
          image.naturalHeight,\r
          s.fit === 'contain'\r
        );\r
      }\r
      let patternIndex = ORDERED[s.pattern] ?? 0;\r
      if (KERNELS[s.pattern]) {\r
        patternIndex = 0;\r
        if (image && !diffusionBlocked) {\r
          try {\r
            updateDiffusion(cell, s);\r
            patternIndex = 3;\r
          } catch {\r
            diffusionBlocked = true;\r
          }\r
        }\r
      }\r
      if (patternIndex === 1 && noiseTexture.width !== 64) {\r
        noiseTexture.image = getBlueNoise();\r
        noiseTexture.width = 64;\r
        noiseTexture.height = 64;\r
        noiseTexture.needsUpdate = true;\r
      }\r
\r
      const texelsPerPixel = image ? (viewUniforms.uCover.value[0] * image.naturalWidth) / canvas.width : 1;\r
      viewUniforms.tMask.value = masks[0].texture;\r
      viewUniforms.uCell.value = cell;\r
      viewUniforms.uLod.value = Math.log2(Math.max(cell * texelsPerPixel, 1));\r
      viewUniforms.uPattern.value = patternIndex;\r
      viewUniforms.uPalette.value = s.palette === 'rgb' ? 1 : 0;\r
      viewUniforms.uLevels.value = Math.max(2, Math.round(s.levels));\r
      viewUniforms.uInk.value = hexToRgb(s.inkColor);\r
      viewUniforms.uPaper.value = hexToRgb(s.paperColor);\r
      viewUniforms.uRimColor.value = hexToRgb(s.rimColor);\r
      viewUniforms.uRim.value = Math.min(Math.max(s.rim, 0), 0.95);\r
      viewUniforms.uContrast.value = s.contrast;\r
      viewUniforms.uBrightness.value = s.brightness;\r
      viewUniforms.uReverse.value = s.reverse ? 1 : 0;\r
      const intro = image ? Math.min(1, (now - introStart) / INTRO_MS) : 0;\r
      viewUniforms.uIntro.value = 1 - Math.pow(1 - intro, 2);\r
      renderer.render({ scene: viewMesh });\r
\r
      const busy =\r
        pointer.inside || wanderOn || presence > 0.002 || bursts.length > 0 || now < trailUntil || (image && intro < 1);\r
      if (busy && visible) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (raf || !visible) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
    wakeRef.current = wake;\r
\r
    const img = new Image();\r
    img.crossOrigin = 'anonymous';\r
    img.decoding = 'async';\r
    img.onload = () => {\r
      image = img;\r
      imageTexture.image = img;\r
      try {\r
        if (samplerContext) {\r
          const edge = measureEdge(samplerContext, img);\r
          viewUniforms.uMatte.value = edge.matte;\r
          viewUniforms.uKey.value = edge.plain ? 1 : 0;\r
        }\r
      } catch {}\r
      introStart = performance.now();\r
      wake();\r
    };\r
    img.src = src;\r
\r
    const locate = (e: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      pointer.x = e.clientX - rect.left;\r
      pointer.y = e.clientY - rect.top;\r
      pointer.placed = true;\r
    };\r
    const onMove = (e: PointerEvent) => {\r
      locate(e);\r
      if (!pointer.inside) {\r
        pointer.inside = true;\r
        pointer.fresh = true;\r
      }\r
      wake();\r
    };\r
    const onLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
    const onDown = (e: PointerEvent) => {\r
      onMove(e);\r
      if (!settingsRef.current?.clickBurst || (e.pointerType === 'mouse' && e.button !== 0)) return;\r
      bursts.push({ x: pointer.x, y: pointer.y, start: performance.now() });\r
      if (bursts.length > MAX_BURSTS) bursts.shift();\r
    };\r
    container.addEventListener('pointermove', onMove, { passive: true });\r
    container.addEventListener('pointerenter', onMove, { passive: true });\r
    container.addEventListener('pointerdown', onDown, { passive: true });\r
    container.addEventListener('pointerleave', onLeave, { passive: true });\r
    container.addEventListener('pointercancel', onLeave, { passive: true });\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      layout();\r
      wake();\r
    });\r
    resizeObserver.observe(container);\r
    const intersectionObserver = new IntersectionObserver(([entry]) => {\r
      visible = entry.isIntersecting;\r
      wake();\r
    });\r
    intersectionObserver.observe(container);\r
\r
    layout();\r
    wake();\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = () => {};\r
      resizeObserver.disconnect();\r
      intersectionObserver.disconnect();\r
      img.onload = null;\r
      container.removeEventListener('pointermove', onMove);\r
      container.removeEventListener('pointerenter', onMove);\r
      container.removeEventListener('pointerdown', onDown);\r
      container.removeEventListener('pointerleave', onLeave);\r
      container.removeEventListener('pointercancel', onLeave);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);\r
    };\r
  }, [src]);\r
\r
  return <div ref={containerRef} className={\`dither-veil \${className}\`.trim()} style={style} />;\r
};\r
\r
export default DitherVeil;\r
`,s=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
import type { CSSProperties } from 'react';\r
import { Renderer, Program, Mesh, Triangle, Texture, RenderTarget } from 'ogl';\r
\r
type Pattern = 'bayer' | 'noise' | 'atkinson' | 'floyd' | 'lines';\r
type Palette = 'duotone' | 'rgb';\r
type Fit = 'contain' | 'cover';\r
type Kernel = [number, number, number][];\r
type Rgb = [number, number, number];\r
\r
export interface DitherVeilProps {\r
  src?: string;\r
  fit?: Fit;\r
  pattern?: Pattern;\r
  pixelSize?: number;\r
  levels?: number;\r
  palette?: Palette;\r
  inkColor?: string;\r
  paperColor?: string;\r
  contrast?: number;\r
  brightness?: number;\r
  revealRadius?: number;\r
  softness?: number;\r
  linger?: number;\r
  rimColor?: string;\r
  rim?: number;\r
  reverse?: boolean;\r
  wander?: boolean;\r
  clickBurst?: boolean;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
type Settings = Required<Omit<DitherVeilProps, 'src' | 'className' | 'style'>>;\r
\r
const DEFAULT_SRC = 'https://images.unsplash.com/photo-1737071371043-761e02b1ef95?q=80&w=1400&auto=format&fit=crop';\r
\r
const ORDERED: Record<string, number> = { bayer: 0, noise: 1, lines: 2 };\r
\r
const KERNELS: Record<string, Kernel> = {\r
  atkinson: [\r
    [1, 0, 1 / 8],\r
    [2, 0, 1 / 8],\r
    [-1, 1, 1 / 8],\r
    [0, 1, 1 / 8],\r
    [1, 1, 1 / 8],\r
    [0, 2, 1 / 8]\r
  ],\r
  floyd: [\r
    [1, 0, 7 / 16],\r
    [-1, 1, 3 / 16],\r
    [0, 1, 5 / 16],\r
    [1, 1, 1 / 16]\r
  ]\r
};\r
\r
const MASK_SCALE = 0.5;\r
const MAX_BURSTS = 4;\r
const BURST_SECONDS = 1.2;\r
const HOLD = 1.6;\r
const INTRO_MS = 1100;\r
\r
const hexToRgb = (hex: string): Rgb => {\r
  let h = String(hex || '').replace('#', '');\r
  if (h.length === 3) h = h.replace(/./g, c => c + c);\r
  const n = parseInt(h.slice(0, 6), 16);\r
  return Number.isNaN(n) ? [0, 0, 0] : [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];\r
};\r
\r
const fitScale = (w: number, h: number, iw: number, ih: number, contain: boolean): [number, number] => {\r
  const ratio = w / h / (iw / ih);\r
  if (contain) return ratio > 1 ? [ratio, 1] : [1, 1 / ratio];\r
  return ratio > 1 ? [1, 1 / ratio] : [ratio, 1];\r
};\r
\r
const wanderAt = (t: number, w: number, h: number): [number, number] => [\r
  w * (0.5 + 0.33 * Math.sin(t * 0.53) + 0.08 * Math.sin(t * 1.31 + 0.6)),\r
  h * (0.5 + 0.28 * Math.sin(t * 0.71 + 1.1) + 0.07 * Math.cos(t * 1.57))\r
];\r
\r
const measureEdge = (context: CanvasRenderingContext2D, image: HTMLImageElement): { matte: Rgb; plain: boolean } => {\r
  const size = 32;\r
  context.canvas.width = size;\r
  context.canvas.height = size;\r
  context.drawImage(image, 0, 0, size, size);\r
  const data = context.getImageData(0, 0, size, size).data;\r
  const sum = [0, 0, 0];\r
  const squares = [0, 0, 0];\r
  let count = 0;\r
  for (let y = 0; y < size; y++) {\r
    for (let x = 0; x < size; x++) {\r
      if (x > 0 && y > 0 && x < size - 1 && y < size - 1) continue;\r
      for (let c = 0; c < 3; c++) {\r
        const v = data[(y * size + x) * 4 + c] / 255;\r
        sum[c] += v;\r
        squares[c] += v * v;\r
      }\r
      count++;\r
    }\r
  }\r
  const matte: Rgb = [sum[0] / count, sum[1] / count, sum[2] / count];\r
  const spread =\r
    matte.reduce((total, mean, c) => total + Math.sqrt(Math.max(0, squares[c] / count - mean * mean)), 0) / 3;\r
  return { matte, plain: spread < 0.06 };\r
};\r
\r
let blueNoise: Uint8Array | null = null;\r
\r
const getBlueNoise = (): Uint8Array => {\r
  if (blueNoise) return blueNoise;\r
  const size = 64;\r
  const n = size * size;\r
  const wrap = size - 1;\r
  const taps: number[] = [];\r
  for (let dy = -6; dy <= 6; dy++) {\r
    for (let dx = -6; dx <= 6; dx++) taps.push(dx, dy, Math.exp(-(dx * dx + dy * dy) / 4.5));\r
  }\r
  const energy = new Float32Array(n);\r
  const on = new Uint8Array(n);\r
  const splat = (i: number, sign: number) => {\r
    const x = i % size;\r
    const y = (i - x) / size;\r
    for (let k = 0; k < taps.length; k += 3) {\r
      energy[((y + taps[k + 1]) & wrap) * size + ((x + taps[k]) & wrap)] += sign * taps[k + 2];\r
    }\r
  };\r
  const find = (state: number, highest: boolean) => {\r
    let best = 0;\r
    let value = highest ? -Infinity : Infinity;\r
    for (let i = 0; i < n; i++) {\r
      if (on[i] !== state) continue;\r
      if (highest ? energy[i] > value : energy[i] < value) {\r
        value = energy[i];\r
        best = i;\r
      }\r
    }\r
    return best;\r
  };\r
  let seed = 7;\r
  const random = () => {\r
    seed = (seed * 16807) % 2147483647;\r
    return seed / 2147483647;\r
  };\r
  const initial = Math.round(n * 0.1);\r
  for (let placed = 0; placed < initial; ) {\r
    const i = Math.floor(random() * n);\r
    if (on[i]) continue;\r
    on[i] = 1;\r
    splat(i, 1);\r
    placed++;\r
  }\r
  for (let guard = 0; guard < n; guard++) {\r
    const cluster = find(1, true);\r
    on[cluster] = 0;\r
    splat(cluster, -1);\r
    const gap = find(0, false);\r
    on[gap] = 1;\r
    splat(gap, 1);\r
    if (gap === cluster) break;\r
  }\r
  const seedOn = on.slice();\r
  const seedEnergy = energy.slice();\r
  const rank = new Uint16Array(n);\r
  for (let r = initial - 1; r >= 0; r--) {\r
    const cluster = find(1, true);\r
    on[cluster] = 0;\r
    splat(cluster, -1);\r
    rank[cluster] = r;\r
  }\r
  on.set(seedOn);\r
  energy.set(seedEnergy);\r
  for (let r = initial; r < n; r++) {\r
    const gap = find(0, false);\r
    on[gap] = 1;\r
    splat(gap, 1);\r
    rank[gap] = r;\r
  }\r
  const data = new Uint8Array(n * 4);\r
  for (let i = 0; i < n; i++) {\r
    const v = Math.floor((rank[i] / n) * 256);\r
    data[i * 4] = v;\r
    data[i * 4 + 1] = v;\r
    data[i * 4 + 2] = v;\r
    data[i * 4 + 3] = 255;\r
  }\r
  blueNoise = data;\r
  return data;\r
};\r
\r
const diffuse = (\r
  pixels: Uint8ClampedArray,\r
  cols: number,\r
  rows: number,\r
  kernel: Kernel,\r
  levels: number,\r
  rgb: boolean,\r
  grade: (v: number) => number\r
): Uint8Array => {\r
  const channels = rgb ? 3 : 1;\r
  const values = new Float32Array(cols * rows * channels);\r
  for (let i = 0; i < cols * rows; i++) {\r
    const r = pixels[i * 4] / 255;\r
    const g = pixels[i * 4 + 1] / 255;\r
    const b = pixels[i * 4 + 2] / 255;\r
    if (rgb) {\r
      values[i * 3] = grade(r);\r
      values[i * 3 + 1] = grade(g);\r
      values[i * 3 + 2] = grade(b);\r
    } else {\r
      values[i] = grade(0.2126 * r + 0.7152 * g + 0.0722 * b);\r
    }\r
  }\r
  const steps = levels - 1;\r
  const out = new Uint8Array(cols * rows * 4);\r
  for (let y = 0; y < rows; y++) {\r
    const dir = y & 1 ? -1 : 1;\r
    for (let i = 0; i < cols; i++) {\r
      const x = dir > 0 ? i : cols - 1 - i;\r
      const p = y * cols + x;\r
      for (let c = 0; c < channels; c++) {\r
        const old = values[p * channels + c];\r
        const q = Math.min(steps, Math.max(0, Math.round(old * steps))) / steps;\r
        const err = old - q;\r
        const byte = Math.round(q * 255);\r
        if (rgb) out[p * 4 + c] = byte;\r
        else out[p * 4] = out[p * 4 + 1] = out[p * 4 + 2] = byte;\r
        for (let k = 0; k < kernel.length; k++) {\r
          const nx = x + kernel[k][0] * dir;\r
          const ny = y + kernel[k][1];\r
          if (nx < 0 || nx >= cols || ny >= rows) continue;\r
          values[(ny * cols + nx) * channels + c] += err * kernel[k][2];\r
        }\r
      }\r
      out[p * 4 + 3] = 255;\r
    }\r
  }\r
  return out;\r
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
const maskFragment = \`#version 300 es\r
precision highp float;\r
\r
uniform sampler2D tPrev;\r
uniform vec2 uSize;\r
uniform vec2 uFrom;\r
uniform vec2 uTo;\r
uniform float uRadius;\r
uniform float uSoftness;\r
uniform float uStrength;\r
uniform float uFade;\r
uniform float uHold;\r
\r
in vec2 vUv;\r
out vec4 fragColor;\r
\r
float strokeDistance(vec2 p, vec2 a, vec2 b) {\r
  vec2 ab = b - a;\r
  float h = clamp(dot(p - a, ab) / max(dot(ab, ab), 0.0001), 0.0, 1.0);\r
  return length(p - a - ab * h);\r
}\r
\r
void main() {\r
  vec2 p = vec2(vUv.x, 1.0 - vUv.y) * uSize;\r
  float trail = max(texture(tPrev, vUv).r - uFade, 0.0);\r
  float band = max(uRadius * uSoftness, 1.0) * uHold;\r
  float d = strokeDistance(p, uFrom, uTo);\r
  trail = max(trail, clamp((uRadius - d) / band, 0.0, 1.0) * uStrength);\r
  fragColor = vec4(trail, 0.0, 0.0, 1.0);\r
}\r
\`;\r
\r
const viewFragment = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
\r
uniform sampler2D tImage;\r
uniform sampler2D tMask;\r
uniform sampler2D tNoise;\r
uniform sampler2D tDiffused;\r
uniform vec2 uResolution;\r
uniform vec2 uCover;\r
uniform float uLod;\r
uniform float uCell;\r
uniform int uPattern;\r
uniform int uPalette;\r
uniform float uLevels;\r
uniform vec3 uInk;\r
uniform vec3 uPaper;\r
uniform vec3 uRimColor;\r
uniform float uRim;\r
uniform float uContrast;\r
uniform float uBrightness;\r
uniform float uReverse;\r
uniform float uIntro;\r
uniform float uHold;\r
uniform vec3 uMatte;\r
uniform float uKey;\r
uniform vec2 uSize;\r
uniform vec4 uBursts[4];\r
uniform float uBurstWidth;\r
\r
in vec2 vUv;\r
out vec4 fragColor;\r
\r
float bayer(vec2 cell) {\r
  ivec2 p = ivec2(mod(cell, 8.0));\r
  int v = p.x ^ p.y;\r
  int m = ((v & 1) << 5) | ((p.y & 1) << 4) | ((v & 2) << 2) | ((p.y & 2) << 1) | ((v & 4) >> 1) | ((p.y & 4) >> 2);\r
  return (float(m) + 0.5) / 64.0;\r
}\r
\r
float blueNoise(vec2 cell) {\r
  return (texelFetch(tNoise, ivec2(mod(cell, 64.0)), 0).r * 255.0 + 0.5) / 256.0;\r
}\r
\r
float engraving(vec2 cell) {\r
  float period = 6.0;\r
  float f = (mod(cell.x + cell.y, period) + 0.5) / period;\r
  return clamp(abs(f * 2.0 - 1.0) + (bayer(cell) - 0.5) * (2.0 / period), 0.0, 1.0);\r
}\r
\r
vec2 imageUv(vec2 uv) {\r
  return (uv - 0.5) * uCover + 0.5;\r
}\r
\r
float within(vec2 p) {\r
  vec2 s = step(vec2(0.0), p) * step(p, vec2(1.0));\r
  return s.x * s.y;\r
}\r
\r
vec3 grade(vec3 c) {\r
  return pow(clamp((c - 0.5) * uContrast + 0.5 + uBrightness, 0.0, 1.0), vec3(1.6));\r
}\r
\r
float shockwave(vec2 p) {\r
  float value = 0.0;\r
  for (int i = 0; i < 4; i++) {\r
    vec4 burst = uBursts[i];\r
    if (burst.w <= 0.0) continue;\r
    float offset = distance(p, burst.xy) - burst.z;\r
    float edge = offset > 0.0 ? offset / (uBurstWidth * 0.35) : -offset / uBurstWidth;\r
    value = max(value, clamp(1.0 - edge, 0.0, 1.0) * burst.w);\r
  }\r
  return value;\r
}\r
\r
vec3 toned(vec3 c) {\r
  return uPalette == 1 ? grade(c) : grade(vec3(dot(c, vec3(0.2126, 0.7152, 0.0722))));\r
}\r
\r
vec3 quantize(vec3 v, float t) {\r
  float steps = max(uLevels - 1.0, 1.0);\r
  vec3 s = v * steps;\r
  vec3 base = floor(s);\r
  return min(base + step(vec3(t), s - base), vec3(steps)) / steps;\r
}\r
\r
void main() {\r
  vec2 px = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);\r
  vec2 cell = floor(px / uCell);\r
  vec2 center = (cell + 0.5) * uCell;\r
  vec2 cellUv = vec2(center.x / uResolution.x, 1.0 - center.y / uResolution.y);\r
\r
  vec2 sampleUv = imageUv(cellUv);\r
  float framed = within(sampleUv);\r
  vec3 level;\r
  if (uPattern == 3) {\r
    level = texelFetch(tDiffused, ivec2(cell), 0).rgb;\r
  } else {\r
    vec3 c = mix(uMatte, textureLod(tImage, sampleUv, uLod).rgb, framed);\r
    float t = uPattern == 1 ? blueNoise(cell) : (uPattern == 2 ? engraving(cell) : bayer(cell));\r
    level = quantize(toned(c), t);\r
  }\r
\r
  vec3 color = mix(uInk, mix(uInk, uPaper, level), max(framed, uKey));\r
  vec3 backdrop = mix(uInk, uPaper, toned(uMatte));\r
  vec2 photoUv = imageUv(vUv);\r
  vec3 raw = texture(tImage, photoUv).rgb;\r
  float plain = uKey * (1.0 - smoothstep(0.05, 0.22, distance(raw, uMatte)));\r
  vec3 photo = mix(mix(uInk, backdrop, uKey), mix(raw, backdrop, plain), within(photoUv));\r
\r
  vec2 point = vec2(cellUv.x, 1.0 - cellUv.y) * uSize;\r
  float mask = max(clamp(texture(tMask, cellUv).r * uHold, 0.0, 1.0), shockwave(point));\r
  float shown = mix(mask, 1.0 - mask, uReverse);\r
  float order = bayer(cell.yx);\r
  float low = order * (1.0 - uRim);\r
  color = mix(color, uRimColor, step(low, shown) * step(0.001, uRim));\r
  color = mix(color, photo, step(low + uRim, shown));\r
\r
  vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);\r
  float spread = length((cellUv - 0.5) * aspect) / length(aspect * 0.5);\r
  float appear = step(spread * 0.72 + bayer(cell + vec2(3.0, 5.0)) * 0.28, uIntro * 1.001);\r
  fragColor = vec4(mix(uInk, color, appear), 1.0);\r
}\r
\`;\r
\r
const DitherVeil = ({\r
  src = DEFAULT_SRC,\r
  fit = 'contain',\r
  pattern = 'floyd',\r
  pixelSize = 2,\r
  levels = 2,\r
  palette = 'duotone',\r
  inkColor = '#120f17',\r
  paperColor = '#f4f1ea',\r
  contrast = 1.15,\r
  brightness = 0,\r
  revealRadius = 200,\r
  softness = 0.6,\r
  linger = 1,\r
  rimColor = '#a78bfa',\r
  rim = 0,\r
  reverse = false,\r
  wander = false,\r
  clickBurst = true,\r
  className = '',\r
  style\r
}: DitherVeilProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const settingsRef = useRef<Settings | null>(null);\r
  const wakeRef = useRef<() => void>(() => {});\r
\r
  useEffect(() => {\r
    settingsRef.current = {\r
      fit,\r
      pattern,\r
      pixelSize,\r
      levels,\r
      palette,\r
      inkColor,\r
      paperColor,\r
      contrast,\r
      brightness,\r
      revealRadius,\r
      softness,\r
      linger,\r
      rimColor,\r
      rim,\r
      reverse,\r
      wander,\r
      clickBurst\r
    };\r
    wakeRef.current();\r
  });\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    if (!container) return undefined;\r
\r
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;\r
    const renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio || 1, 2), alpha: false, antialias: false });\r
    const gl = renderer.gl;\r
    const canvas = gl.canvas;\r
    canvas.style.display = 'block';\r
    canvas.style.width = '100%';\r
    canvas.style.height = '100%';\r
    container.appendChild(canvas);\r
\r
    const gl2 = gl as WebGL2RenderingContext;\r
    const floatMask = renderer.isWebgl2 && !!renderer.getExtension('EXT_color_buffer_float');\r
    const geometry = new Triangle(gl);\r
\r
    const dataTexture = () =>\r
      new Texture(gl, {\r
        image: new Uint8Array(4),\r
        width: 1,\r
        height: 1,\r
        generateMipmaps: false,\r
        flipY: false,\r
        minFilter: gl.NEAREST,\r
        magFilter: gl.NEAREST\r
      });\r
    const imageTexture = new Texture(gl, { minFilter: gl.LINEAR_MIPMAP_LINEAR, magFilter: gl.LINEAR });\r
    const noiseTexture = dataTexture();\r
    const diffusedTexture = dataTexture();\r
\r
    const createMask = (w: number, h: number) =>\r
      new RenderTarget(gl, {\r
        width: w,\r
        height: h,\r
        depth: false,\r
        type: floatMask ? gl2.HALF_FLOAT : gl.UNSIGNED_BYTE,\r
        internalFormat: floatMask ? gl2.RGBA16F : gl.RGBA,\r
        minFilter: gl.LINEAR,\r
        magFilter: gl.LINEAR\r
      });\r
    const destroyMask = (target: RenderTarget) => {\r
      gl.deleteFramebuffer(target.buffer);\r
      gl.deleteTexture(target.texture.texture);\r
    };\r
    let masks = [createMask(2, 2), createMask(2, 2)];\r
\r
    const maskUniforms = {\r
      tPrev: { value: masks[0].texture },\r
      uSize: { value: [1, 1] },\r
      uFrom: { value: [0, 0] },\r
      uTo: { value: [0, 0] },\r
      uRadius: { value: 1 },\r
      uSoftness: { value: 0.5 },\r
      uStrength: { value: 0 },\r
      uFade: { value: 1 },\r
      uHold: { value: HOLD }\r
    };\r
    const viewUniforms = {\r
      tImage: { value: imageTexture },\r
      tMask: { value: masks[0].texture },\r
      tNoise: { value: noiseTexture },\r
      tDiffused: { value: diffusedTexture },\r
      uResolution: { value: [1, 1] },\r
      uCover: { value: [1, 1] },\r
      uLod: { value: 0 },\r
      uCell: { value: 3 },\r
      uPattern: { value: 0 },\r
      uPalette: { value: 0 },\r
      uLevels: { value: 2 },\r
      uInk: { value: [0, 0, 0] },\r
      uPaper: { value: [1, 1, 1] },\r
      uRimColor: { value: [1, 1, 1] },\r
      uRim: { value: 0 },\r
      uContrast: { value: 1 },\r
      uBrightness: { value: 0 },\r
      uReverse: { value: 0 },\r
      uIntro: { value: 0 },\r
      uHold: { value: HOLD },\r
      uMatte: { value: [0, 0, 0] },\r
      uKey: { value: 0 },\r
      uSize: { value: [1, 1] },\r
      uBursts: { value: Array.from({ length: MAX_BURSTS * 4 }, () => 0) },\r
      uBurstWidth: { value: 60 }\r
    };\r
    const program = (fragment: string, uniforms: Record<string, { value: unknown }>) =>\r
      new Program(gl, { vertex, fragment, uniforms, depthTest: false, depthWrite: false });\r
    const maskMesh = new Mesh(gl, { geometry, program: program(maskFragment, maskUniforms) });\r
    const viewMesh = new Mesh(gl, { geometry, program: program(viewFragment, viewUniforms) });\r
\r
    const sampler = document.createElement('canvas');\r
    const samplerContext = sampler.getContext('2d', { willReadFrequently: true });\r
\r
    let image: HTMLImageElement | null = null;\r
    let introStart = 0;\r
    let diffusedKey = '';\r
    let diffusionBlocked = false;\r
    let width = 1;\r
    let height = 1;\r
    let visible = true;\r
    let raf = 0;\r
    let last = performance.now();\r
    let trailUntil = 0;\r
    let presence = 0;\r
    let drift = 0;\r
    const pointer = { x: 0, y: 0, inside: false, fresh: true, placed: false };\r
    const brush = { x: 0, y: 0, px: 0, py: 0 };\r
    const bursts: { x: number; y: number; start: number }[] = [];\r
\r
    const layout = () => {\r
      width = Math.max(1, container.clientWidth);\r
      height = Math.max(1, container.clientHeight);\r
      renderer.setSize(width, height);\r
      viewUniforms.uResolution.value = [canvas.width, canvas.height];\r
      maskUniforms.uSize.value = [width, height];\r
      viewUniforms.uSize.value = [width, height];\r
      const mw = Math.max(2, Math.round(width * MASK_SCALE));\r
      const mh = Math.max(2, Math.round(height * MASK_SCALE));\r
      if (mw !== masks[0].width || mh !== masks[0].height) {\r
        masks.forEach(destroyMask);\r
        masks = [createMask(mw, mh), createMask(mw, mh)];\r
      }\r
      if (!pointer.placed) {\r
        pointer.x = width / 2;\r
        pointer.y = height / 2;\r
      }\r
    };\r
\r
    const updateDiffusion = (cell: number, s: Settings) => {\r
      if (!image || !samplerContext) return;\r
      const cols = Math.ceil(canvas.width / cell);\r
      const rows = Math.ceil(canvas.height / cell);\r
      const key = [\r
        s.pattern,\r
        s.levels,\r
        s.palette,\r
        s.contrast,\r
        s.brightness,\r
        s.fit,\r
        cols,\r
        rows,\r
        canvas.width,\r
        canvas.height\r
      ].join('|');\r
      if (key === diffusedKey) return;\r
      diffusedKey = key;\r
      const [cx, cy] = viewUniforms.uCover.value;\r
      const iw = image.naturalWidth;\r
      const ih = image.naturalHeight;\r
      sampler.width = cols;\r
      sampler.height = rows;\r
      samplerContext.imageSmoothingEnabled = true;\r
      samplerContext.imageSmoothingQuality = 'high';\r
      const [mr, mg, mb] = viewUniforms.uMatte.value;\r
      samplerContext.fillStyle = \`rgb(\${mr * 255}, \${mg * 255}, \${mb * 255})\`;\r
      samplerContext.fillRect(0, 0, cols, rows);\r
      const sx = (0.5 - 0.5 * cx) * iw;\r
      const sy = (0.5 - 0.5 * cy) * ih;\r
      const sw = ((cols * cell) / canvas.width) * cx * iw;\r
      const sh = ((rows * cell) / canvas.height) * cy * ih;\r
      const x0 = Math.max(sx, 0);\r
      const y0 = Math.max(sy, 0);\r
      const x1 = Math.min(sx + sw, iw);\r
      const y1 = Math.min(sy + sh, ih);\r
      if (x1 > x0 && y1 > y0) {\r
        samplerContext.drawImage(\r
          image,\r
          x0,\r
          y0,\r
          x1 - x0,\r
          y1 - y0,\r
          ((x0 - sx) / sw) * cols,\r
          ((y0 - sy) / sh) * rows,\r
          ((x1 - x0) / sw) * cols,\r
          ((y1 - y0) / sh) * rows\r
        );\r
      }\r
      const grade = (v: number) => Math.pow(Math.min(1, Math.max(0, (v - 0.5) * s.contrast + 0.5 + s.brightness)), 1.6);\r
      const pixels = samplerContext.getImageData(0, 0, cols, rows).data;\r
      diffusedTexture.image = diffuse(pixels, cols, rows, KERNELS[s.pattern], s.levels, s.palette === 'rgb', grade);\r
      diffusedTexture.width = cols;\r
      diffusedTexture.height = rows;\r
      diffusedTexture.needsUpdate = true;\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      const s = settingsRef.current;\r
      if (!s) return;\r
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));\r
      last = now;\r
\r
      const wanderOn = s.wander && !reducedMotion;\r
      let targetX = pointer.x;\r
      let targetY = pointer.y;\r
      if (!pointer.inside && wanderOn) {\r
        drift = Math.min(1, drift + dt / 1.2);\r
        const [wx, wy] = wanderAt(now / 1000, width, height);\r
        const k = drift * drift * (3 - 2 * drift);\r
        targetX += (wx - targetX) * k;\r
        targetY += (wy - targetY) * k;\r
      } else {\r
        drift = 0;\r
      }\r
\r
      presence += ((pointer.inside || wanderOn ? 1 : 0) - presence) * (1 - Math.exp(-dt / 0.16));\r
\r
      if (pointer.fresh) {\r
        brush.x = brush.px = targetX;\r
        brush.y = brush.py = targetY;\r
        pointer.fresh = false;\r
      } else {\r
        const follow = 1 - Math.exp(-dt / 0.035);\r
        brush.x += (targetX - brush.x) * follow;\r
        brush.y += (targetY - brush.y) * follow;\r
      }\r
\r
      const burstData = viewUniforms.uBursts.value;\r
      burstData.fill(0);\r
      for (let i = bursts.length - 1; i >= 0; i--) {\r
        if ((now - bursts[i].start) / 1000 >= BURST_SECONDS) bursts.splice(i, 1);\r
      }\r
      bursts.forEach((b, i) => {\r
        const k = Math.max(0, (now - b.start) / 1000 / BURST_SECONDS);\r
        const reach =\r
          Math.hypot(Math.max(b.x, width - b.x), Math.max(b.y, height - b.y)) + viewUniforms.uBurstWidth.value;\r
        burstData[i * 4] = b.x;\r
        burstData[i * 4 + 1] = b.y;\r
        burstData[i * 4 + 2] = reach * Math.sin((k * Math.PI) / 2);\r
        burstData[i * 4 + 3] = 1 - k * k * k;\r
      });\r
\r
      if (presence > 0.002) trailUntil = now + s.linger * 1000 + 150;\r
\r
      const minFade = floatMask ? 0 : 1.5 / 255;\r
      const fade = s.linger > 0 ? dt / s.linger : 1;\r
      maskUniforms.tPrev.value = masks[0].texture;\r
      maskUniforms.uFrom.value = [brush.px, brush.py];\r
      maskUniforms.uTo.value = [brush.x, brush.y];\r
      maskUniforms.uRadius.value = s.revealRadius * (0.45 + 0.55 * presence);\r
      maskUniforms.uSoftness.value = s.softness;\r
      maskUniforms.uStrength.value = presence;\r
      maskUniforms.uFade.value = Math.max(fade, minFade);\r
      viewUniforms.uBurstWidth.value = Math.max(60, s.revealRadius * 0.9);\r
      renderer.render({ scene: maskMesh, target: masks[1] });\r
      masks.reverse();\r
      brush.px = brush.x;\r
      brush.py = brush.y;\r
\r
      const cell = Math.max(1, Math.round(s.pixelSize * renderer.dpr));\r
      if (image) {\r
        viewUniforms.uCover.value = fitScale(\r
          canvas.width,\r
          canvas.height,\r
          image.naturalWidth,\r
          image.naturalHeight,\r
          s.fit === 'contain'\r
        );\r
      }\r
      let patternIndex = ORDERED[s.pattern] ?? 0;\r
      if (KERNELS[s.pattern]) {\r
        patternIndex = 0;\r
        if (image && !diffusionBlocked) {\r
          try {\r
            updateDiffusion(cell, s);\r
            patternIndex = 3;\r
          } catch {\r
            diffusionBlocked = true;\r
          }\r
        }\r
      }\r
      if (patternIndex === 1 && noiseTexture.width !== 64) {\r
        noiseTexture.image = getBlueNoise();\r
        noiseTexture.width = 64;\r
        noiseTexture.height = 64;\r
        noiseTexture.needsUpdate = true;\r
      }\r
\r
      const texelsPerPixel = image ? (viewUniforms.uCover.value[0] * image.naturalWidth) / canvas.width : 1;\r
      viewUniforms.tMask.value = masks[0].texture;\r
      viewUniforms.uCell.value = cell;\r
      viewUniforms.uLod.value = Math.log2(Math.max(cell * texelsPerPixel, 1));\r
      viewUniforms.uPattern.value = patternIndex;\r
      viewUniforms.uPalette.value = s.palette === 'rgb' ? 1 : 0;\r
      viewUniforms.uLevels.value = Math.max(2, Math.round(s.levels));\r
      viewUniforms.uInk.value = hexToRgb(s.inkColor);\r
      viewUniforms.uPaper.value = hexToRgb(s.paperColor);\r
      viewUniforms.uRimColor.value = hexToRgb(s.rimColor);\r
      viewUniforms.uRim.value = Math.min(Math.max(s.rim, 0), 0.95);\r
      viewUniforms.uContrast.value = s.contrast;\r
      viewUniforms.uBrightness.value = s.brightness;\r
      viewUniforms.uReverse.value = s.reverse ? 1 : 0;\r
      const intro = image ? Math.min(1, (now - introStart) / INTRO_MS) : 0;\r
      viewUniforms.uIntro.value = 1 - Math.pow(1 - intro, 2);\r
      renderer.render({ scene: viewMesh });\r
\r
      const busy =\r
        pointer.inside || wanderOn || presence > 0.002 || bursts.length > 0 || now < trailUntil || (image && intro < 1);\r
      if (busy && visible) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (raf || !visible) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
    wakeRef.current = wake;\r
\r
    const img = new Image();\r
    img.crossOrigin = 'anonymous';\r
    img.decoding = 'async';\r
    img.onload = () => {\r
      image = img;\r
      imageTexture.image = img;\r
      try {\r
        if (samplerContext) {\r
          const edge = measureEdge(samplerContext, img);\r
          viewUniforms.uMatte.value = edge.matte;\r
          viewUniforms.uKey.value = edge.plain ? 1 : 0;\r
        }\r
      } catch {}\r
      introStart = performance.now();\r
      wake();\r
    };\r
    img.src = src;\r
\r
    const locate = (e: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      pointer.x = e.clientX - rect.left;\r
      pointer.y = e.clientY - rect.top;\r
      pointer.placed = true;\r
    };\r
    const onMove = (e: PointerEvent) => {\r
      locate(e);\r
      if (!pointer.inside) {\r
        pointer.inside = true;\r
        pointer.fresh = true;\r
      }\r
      wake();\r
    };\r
    const onLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
    const onDown = (e: PointerEvent) => {\r
      onMove(e);\r
      if (!settingsRef.current?.clickBurst || (e.pointerType === 'mouse' && e.button !== 0)) return;\r
      bursts.push({ x: pointer.x, y: pointer.y, start: performance.now() });\r
      if (bursts.length > MAX_BURSTS) bursts.shift();\r
    };\r
    container.addEventListener('pointermove', onMove, { passive: true });\r
    container.addEventListener('pointerenter', onMove, { passive: true });\r
    container.addEventListener('pointerdown', onDown, { passive: true });\r
    container.addEventListener('pointerleave', onLeave, { passive: true });\r
    container.addEventListener('pointercancel', onLeave, { passive: true });\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      layout();\r
      wake();\r
    });\r
    resizeObserver.observe(container);\r
    const intersectionObserver = new IntersectionObserver(([entry]) => {\r
      visible = entry.isIntersecting;\r
      wake();\r
    });\r
    intersectionObserver.observe(container);\r
\r
    layout();\r
    wake();\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = () => {};\r
      resizeObserver.disconnect();\r
      intersectionObserver.disconnect();\r
      img.onload = null;\r
      container.removeEventListener('pointermove', onMove);\r
      container.removeEventListener('pointerenter', onMove);\r
      container.removeEventListener('pointerdown', onDown);\r
      container.removeEventListener('pointerleave', onLeave);\r
      container.removeEventListener('pointercancel', onLeave);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);\r
    };\r
  }, [src]);\r
\r
  return (\r
    <div\r
      ref={containerRef}\r
      className={\`relative w-full h-full overflow-hidden touch-pan-y \${className}\`.trim()}\r
      style={style}\r
    />\r
  );\r
};\r
\r
export default DitherVeil;\r
`,a={dependencies:"ogl",usage:`import DitherVeil from './DitherVeil';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <DitherVeil
    src="https://images.unsplash.com/photo-1737071371043-761e02b1ef95?q=80&w=1400&auto=format&fit=crop"
    pattern="floyd"
    pixelSize={2}
    inkColor="#120f17"
    paperColor="#f4f1ea"
    revealRadius={200}
    softness={0.6}
    linger={1}
  />
</div>`,code:r,css:n,tailwind:e,tsCode:t,tsTailwind:s};export{a as ditherVeil};
