const r=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
import './Dither.css';\r
\r
const MODES = { bayer: 0, bayer4: 1, bayer2: 2, halftone: 3, lines: 4, crosshatch: 5, noise: 6, none: 7 };\r
const EFFECTS = { erase: 0, reveal: 1, ripple: 2 };\r
const MAX_TRAIL = 16;\r
const MAX_RIPPLES = 4;\r
const MAX_PALETTE = 8;\r
const INTRO_SECONDS = 1.8;\r
const RIPPLE_SECONDS = 1.6;\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const WAVE_FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform vec2 uResolution;\r
uniform float uCell;\r
uniform float uTime;\r
uniform float uWaveSpeed;\r
uniform float uWaveFrequency;\r
uniform float uWaveAmplitude;\r
uniform float uScale;\r
uniform float uContrast;\r
uniform float uBrightness;\r
uniform int uEffect;\r
uniform float uRadius;\r
uniform float uStrength;\r
uniform vec3 uTrail[\${MAX_TRAIL}];\r
uniform int uTrailCount;\r
uniform vec4 uRipples[\${MAX_RIPPLES}];\r
uniform int uRippleCount;\r
uniform float uIntro;\r
uniform float uReach;\r
out vec4 outColor;\r
\r
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }\r
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }\r
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }\r
vec2 fade(vec2 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }\r
\r
float cnoise(vec2 P) {\r
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);\r
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);\r
  Pi = mod289(Pi);\r
  vec4 ix = Pi.xzxz;\r
  vec4 iy = Pi.yyww;\r
  vec4 fx = Pf.xzxz;\r
  vec4 fy = Pf.yyww;\r
  vec4 i = permute(permute(ix) + iy);\r
  vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0;\r
  vec4 gy = abs(gx) - 0.5;\r
  vec4 tx = floor(gx + 0.5);\r
  gx = gx - tx;\r
  vec2 g00 = vec2(gx.x, gy.x);\r
  vec2 g10 = vec2(gx.y, gy.y);\r
  vec2 g01 = vec2(gx.z, gy.z);\r
  vec2 g11 = vec2(gx.w, gy.w);\r
  vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));\r
  g00 *= norm.x;\r
  g01 *= norm.y;\r
  g10 *= norm.z;\r
  g11 *= norm.w;\r
  float n00 = dot(g00, vec2(fx.x, fy.x));\r
  float n10 = dot(g10, vec2(fx.y, fy.y));\r
  float n01 = dot(g01, vec2(fx.z, fy.z));\r
  float n11 = dot(g11, vec2(fx.w, fy.w));\r
  vec2 fadeXY = fade(Pf.xy);\r
  vec2 nx = mix(vec2(n00, n01), vec2(n10, n11), fadeXY.x);\r
  return 2.3 * mix(nx.x, nx.y, fadeXY.y);\r
}\r
\r
float fbm(vec2 p) {\r
  float value = 0.0;\r
  float amp = 1.0;\r
  for (int i = 0; i < 4; i++) {\r
    value += amp * abs(cnoise(p));\r
    p *= uWaveFrequency;\r
    amp *= uWaveAmplitude;\r
  }\r
  return value;\r
}\r
\r
float pattern(vec2 p) {\r
  vec2 p2 = p - uTime * uWaveSpeed;\r
  return fbm(p + fbm(p2));\r
}\r
\r
void main() {\r
  vec2 corner = (gl_FragCoord.xy - 0.5) * uCell;\r
  vec2 uv = corner / uResolution - 0.5;\r
  uv.x *= uResolution.x / uResolution.y;\r
\r
  float touch = 0.0;\r
  for (int i = 0; i < \${MAX_TRAIL}; i++) {\r
    if (i >= uTrailCount) break;\r
    vec3 point = uTrail[i];\r
    float reach = uRadius * mix(0.55, 1.0, point.z);\r
    touch = max(touch, point.z * (1.0 - smoothstep(0.0, reach, length(uv - point.xy))));\r
  }\r
\r
  vec2 warp = vec2(0.0);\r
  float ring = 0.0;\r
  for (int i = 0; i < \${MAX_RIPPLES}; i++) {\r
    if (i >= uRippleCount) break;\r
    vec4 ripple = uRipples[i];\r
    vec2 delta = uv - ripple.xy;\r
    float dist = length(delta);\r
    float life = clamp(ripple.z / \${RIPPLE_SECONDS.toFixed(2)}, 0.0, 1.0);\r
    float wave = exp(-pow((dist - ripple.z * 0.9) / 0.07, 2.0)) * (1.0 - life) * (1.0 - life) * ripple.w;\r
    warp += (dist > 0.0001 ? delta / dist : vec2(0.0)) * wave * 0.035;\r
    ring += wave;\r
  }\r
\r
  if (uEffect == 2 && touch > 0.0) {\r
    vec3 head = uTrail[0];\r
    vec2 delta = uv - head.xy;\r
    float dist = length(delta);\r
    warp += (dist > 0.0001 ? delta / dist : vec2(0.0)) * sin(dist / max(uRadius, 0.001) * 16.0 - uTime * 7.0) * 0.04 * touch * uStrength;\r
  }\r
\r
  float f = pattern((uv + warp) / uScale);\r
  if (uEffect == 0) f -= 0.5 * touch * uStrength;\r
  if (uEffect == 1) f += 0.5 * touch * uStrength;\r
  f += ring * 0.55;\r
  f = (f - 0.5) * uContrast + 0.5 + uBrightness;\r
  float show = clamp((uIntro * uReach - length(uv)) / 0.45, 0.0, 1.0);\r
  float v = clamp(f, 0.0, 1.0) * show * show * (3.0 - 2.0 * show);\r
  outColor = vec4(floor(v * 255.0) / 255.0, fract(v * 255.0), 0.0, 1.0);\r
}\`;\r
\r
const DITHER_FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform sampler2D uField;\r
uniform ivec2 uFieldSize;\r
uniform float uCellDevice;\r
uniform int uMode;\r
uniform float uColorNum;\r
uniform vec3 uWave;\r
uniform vec3 uBackground;\r
uniform vec3 uPalette[\${MAX_PALETTE}];\r
uniform int uPaletteCount;\r
uniform float uTransparent;\r
out vec4 outColor;\r
\r
const float bayer8[64] = float[64](\r
  0.0 / 64.0, 48.0 / 64.0, 12.0 / 64.0, 60.0 / 64.0, 3.0 / 64.0, 51.0 / 64.0, 15.0 / 64.0, 63.0 / 64.0,\r
  32.0 / 64.0, 16.0 / 64.0, 44.0 / 64.0, 28.0 / 64.0, 35.0 / 64.0, 19.0 / 64.0, 47.0 / 64.0, 31.0 / 64.0,\r
  8.0 / 64.0, 56.0 / 64.0, 4.0 / 64.0, 52.0 / 64.0, 11.0 / 64.0, 59.0 / 64.0, 7.0 / 64.0, 55.0 / 64.0,\r
  40.0 / 64.0, 24.0 / 64.0, 36.0 / 64.0, 20.0 / 64.0, 43.0 / 64.0, 27.0 / 64.0, 39.0 / 64.0, 23.0 / 64.0,\r
  2.0 / 64.0, 50.0 / 64.0, 14.0 / 64.0, 62.0 / 64.0, 1.0 / 64.0, 49.0 / 64.0, 13.0 / 64.0, 61.0 / 64.0,\r
  34.0 / 64.0, 18.0 / 64.0, 46.0 / 64.0, 30.0 / 64.0, 33.0 / 64.0, 17.0 / 64.0, 45.0 / 64.0, 29.0 / 64.0,\r
  10.0 / 64.0, 58.0 / 64.0, 6.0 / 64.0, 54.0 / 64.0, 9.0 / 64.0, 57.0 / 64.0, 5.0 / 64.0, 53.0 / 64.0,\r
  42.0 / 64.0, 26.0 / 64.0, 38.0 / 64.0, 22.0 / 64.0, 41.0 / 64.0, 25.0 / 64.0, 37.0 / 64.0, 21.0 / 64.0\r
);\r
\r
const float bayer4[16] = float[16](\r
  0.0 / 16.0, 8.0 / 16.0, 2.0 / 16.0, 10.0 / 16.0,\r
  12.0 / 16.0, 4.0 / 16.0, 14.0 / 16.0, 6.0 / 16.0,\r
  3.0 / 16.0, 11.0 / 16.0, 1.0 / 16.0, 9.0 / 16.0,\r
  15.0 / 16.0, 7.0 / 16.0, 13.0 / 16.0, 5.0 / 16.0\r
);\r
\r
const float bayer2[4] = float[4](0.0 / 4.0, 2.0 / 4.0, 3.0 / 4.0, 1.0 / 4.0);\r
\r
float threshold(vec2 cell) {\r
  if (uMode == 1) {\r
    ivec2 c = ivec2(mod(cell, 4.0));\r
    return bayer4[c.y * 4 + c.x];\r
  }\r
  if (uMode == 2) {\r
    ivec2 c = ivec2(mod(cell, 2.0));\r
    return bayer2[c.y * 2 + c.x];\r
  }\r
  if (uMode == 3) {\r
    vec2 r = vec2(cell.x + cell.y, cell.x - cell.y) * 0.70710678 / 4.0;\r
    return clamp(length(fract(r) - 0.5) * 1.41421356, 0.0, 0.999);\r
  }\r
  if (uMode == 4) {\r
    return abs(fract(cell.y / 4.0) - 0.5) * 2.0 * 0.999;\r
  }\r
  if (uMode == 5) {\r
    float a = abs(fract((cell.x + cell.y) / 6.0) - 0.5) * 2.0;\r
    float b = abs(fract((cell.x - cell.y) / 6.0) - 0.5) * 2.0;\r
    return min(a, b) * 0.999;\r
  }\r
  if (uMode == 6) {\r
    return fract(52.9829189 * fract(dot(cell, vec2(0.06711056, 0.00583715))));\r
  }\r
  if (uMode == 7) {\r
    return 0.25;\r
  }\r
  ivec2 c = ivec2(mod(cell, 8.0));\r
  return bayer8[c.y * 8 + c.x];\r
}\r
\r
vec3 toSrgb(vec3 c) {\r
  c = clamp(c, 0.0, 1.0);\r
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));\r
}\r
\r
void main() {\r
  vec2 cell = floor(gl_FragCoord.xy / uCellDevice);\r
  vec4 sampleValue = texelFetch(uField, clamp(ivec2(cell), ivec2(0), uFieldSize - 1), 0);\r
  float f = sampleValue.r + sampleValue.g / 255.0;\r
  float t = threshold(cell) - 0.25;\r
\r
  if (uPaletteCount > 1) {\r
    float n = float(uPaletteCount);\r
    float v = f + t / (n - 1.0);\r
    v = clamp(v - mix(0.2, 0.0, smoothstep(0.45, 0.8, v)), 0.0, 1.0);\r
    int index = int(floor(v * (n - 1.0) + 0.5));\r
    outColor = vec4(toSrgb(uPalette[index]), 1.0);\r
    return;\r
  }\r
\r
  float levels = max(uColorNum, 1.01) - 1.0;\r
  if (uTransparent > 0.5) {\r
    float v = f + t / levels;\r
    v = clamp(v - mix(0.2, 0.0, smoothstep(0.45, 0.8, v)), 0.0, 1.0);\r
    float a = floor(v * levels + 0.5) / levels;\r
    outColor = vec4(toSrgb(uWave) * a, a);\r
    return;\r
  }\r
\r
  float base = dot(uBackground, vec3(0.2126, 0.7152, 0.0722));\r
  vec3 offset = (uWave - vec3(base)) * f + t / levels;\r
  float luminance = dot(uBackground + offset, vec3(0.2126, 0.7152, 0.0722));\r
  offset -= mix(0.2, 0.0, smoothstep(0.45, 0.8, luminance));\r
  bool rising = dot(uWave, vec3(0.2126, 0.7152, 0.0722)) >= base;\r
  float lower = rising ? 0.0 : -max(uBackground.r, max(uBackground.g, uBackground.b));\r
  float upper = rising ? 1.0 - min(uBackground.r, min(uBackground.g, uBackground.b)) : 0.0;\r
  offset = floor(clamp(offset, lower, upper) * levels + 0.5) / levels;\r
  outColor = vec4(toSrgb(uBackground + offset), 1.0);\r
}\`;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
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
const link = (gl, fragmentSource) => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);\r
  const program = gl.createProgram();\r
  if (!vertex || !fragment || !program) return null;\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
  gl.bindAttribLocation(program, 0, 'aPosition');\r
  gl.linkProgram(program);\r
  gl.deleteShader(vertex);\r
  gl.deleteShader(fragment);\r
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {\r
    gl.deleteProgram(program);\r
    return null;\r
  }\r
  const uniforms = {};\r
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
  for (let i = 0; i < count; i++) {\r
    const info = gl.getActiveUniform(program, i);\r
    if (info) uniforms[info.name.replace('[0]', '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const toLinear = value => (value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4));\r
\r
const Dither = ({\r
  waveSpeed = 0.05,\r
  waveFrequency = 3,\r
  waveAmplitude = 0.3,\r
  waveColor = [0.5, 0.5, 0.5],\r
  backgroundColor = [0, 0, 0],\r
  colorNum = 4,\r
  pixelSize = 2,\r
  disableAnimation = false,\r
  enableMouseInteraction = true,\r
  mouseRadius = 1,\r
  ditherMode = 'bayer',\r
  palette,\r
  scale = 1,\r
  contrast = 1,\r
  brightness = 0,\r
  mouseEffect = 'erase',\r
  mouseStrength = 1,\r
  trail = 0.5,\r
  clickRipple = true,\r
  intro = true,\r
  dpr,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settings = {\r
    waveSpeed,\r
    waveFrequency,\r
    waveAmplitude,\r
    waveColor,\r
    backgroundColor,\r
    colorNum: Math.max(2, colorNum),\r
    pixelSize: Math.max(1, pixelSize),\r
    disableAnimation,\r
    enableMouseInteraction,\r
    mouseRadius: Math.max(0.001, mouseRadius),\r
    mode: MODES[ditherMode] ?? 0,\r
    palette: Array.isArray(palette) ? palette.filter(Boolean).slice(0, MAX_PALETTE) : [],\r
    scale: Math.max(0.05, scale),\r
    contrast,\r
    brightness,\r
    effect: EFFECTS[mouseEffect] ?? 0,\r
    mouseStrength: Math.max(0, mouseStrength),\r
    trail: clamp(trail, 0, 1),\r
    clickRipple,\r
    intro,\r
    dpr\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    const gl = canvas?.getContext('webgl2', {\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const wave = link(gl, WAVE_FRAGMENT);\r
    const dither = link(gl, DITHER_FRAGMENT);\r
    if (!wave || !dither) return undefined;\r
\r
    const buffer = gl.createBuffer();\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const field = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, field);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    const framebuffer = gl.createFramebuffer();\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const cache = new Map();\r
    const toColor = value => {\r
      if (Array.isArray(value)) return [0, 1, 2].map(i => clamp(Number(value[i]) || 0, 0, 1));\r
      const key = String(value);\r
      if (cache.has(key)) return cache.get(key);\r
      let rgb = [0, 0, 0];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#000000';\r
        probe.fillStyle = key;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r, g, b].map(channel => toLinear(channel / 255));\r
      }\r
      cache.set(key, rgb);\r
      return rgb;\r
    };\r
\r
    const view = { width: 1, height: 1, ratio: 1, cell: 1, cellCss: 1, cols: 1, rows: 1 };\r
    const pointer = { x: 0, y: 0, inside: false, set: false };\r
    const trailPoints = [];\r
    const ripples = [];\r
    const trailData = new Float32Array(MAX_TRAIL * 3);\r
    const rippleData = new Float32Array(MAX_RIPPLES * 4);\r
    const paletteData = new Float32Array(MAX_PALETTE * 3);\r
    const state = {\r
      time: 0,\r
      hx: 0,\r
      hy: 0,\r
      presence: 0,\r
      reveal: settingsRef.current.intro && !reduce ? 0 : 1\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const allocate = () => {\r
      const s = settingsRef.current;\r
      view.cell = Math.max(1, Math.round(s.pixelSize * view.ratio));\r
      view.cellCss = view.cell / view.ratio;\r
      view.cols = Math.max(1, Math.ceil(canvas.width / view.cell));\r
      view.rows = Math.max(1, Math.ceil(canvas.height / view.cell));\r
      gl.bindTexture(gl.TEXTURE_2D, field);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, view.cols, view.rows, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, field, 0);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
    };\r
\r
    const toUv = (x, y) => {\r
      const aspect = view.width / view.height;\r
      return [(x / view.width - 0.5) * aspect, -(y / view.height - 0.5)];\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const expected = Math.max(1, Math.round(s.pixelSize * view.ratio));\r
      if (expected !== view.cell) allocate();\r
\r
      let trailCount = 0;\r
      for (let i = 0; i < trailPoints.length && trailCount < MAX_TRAIL; i++) {\r
        const point = trailPoints[i];\r
        if (point.weight <= 0.01) continue;\r
        trailData.set([point.x, point.y, point.weight], trailCount * 3);\r
        trailCount++;\r
      }\r
      let rippleCount = 0;\r
      for (let i = ripples.length - 1; i >= 0 && rippleCount < MAX_RIPPLES; i--) {\r
        rippleData.set([ripples[i].x, ripples[i].y, ripples[i].age, 1], rippleCount * 4);\r
        rippleCount++;\r
      }\r
\r
      const eased = s.intro && !reduce ? state.reveal * state.reveal * (3 - 2 * state.reveal) : 1;\r
\r
      gl.bindVertexArray(vao);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.viewport(0, 0, view.cols, view.rows);\r
      gl.useProgram(wave.program);\r
      const w = wave.uniforms;\r
      gl.uniform2f(w.uResolution, canvas.width / view.ratio, canvas.height / view.ratio);\r
      gl.uniform1f(w.uCell, view.cellCss);\r
      gl.uniform1f(w.uTime, state.time);\r
      gl.uniform1f(w.uWaveSpeed, s.waveSpeed);\r
      gl.uniform1f(w.uWaveFrequency, s.waveFrequency);\r
      gl.uniform1f(w.uWaveAmplitude, s.waveAmplitude);\r
      gl.uniform1f(w.uScale, s.scale);\r
      gl.uniform1f(w.uContrast, s.contrast);\r
      gl.uniform1f(w.uBrightness, s.brightness);\r
      gl.uniform1i(w.uEffect, s.effect);\r
      gl.uniform1f(w.uRadius, s.mouseRadius);\r
      gl.uniform1f(w.uStrength, s.mouseStrength);\r
      gl.uniform3fv(w.uTrail, trailData);\r
      gl.uniform1i(w.uTrailCount, trailCount);\r
      gl.uniform4fv(w.uRipples, rippleData);\r
      gl.uniform1i(w.uRippleCount, rippleCount);\r
      gl.uniform1f(w.uIntro, eased);\r
      gl.uniform1f(w.uReach, 0.5 * Math.hypot(view.width / view.height, 1) + 0.45);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(dither.program);\r
      const d = dither.uniforms;\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, field);\r
      gl.uniform1i(d.uField, 0);\r
      gl.uniform2i(d.uFieldSize, view.cols, view.rows);\r
      gl.uniform1f(d.uCellDevice, view.cell);\r
      gl.uniform1i(d.uMode, s.mode);\r
      gl.uniform1f(d.uColorNum, s.colorNum);\r
      gl.uniform3fv(d.uWave, toColor(s.waveColor));\r
      const transparent = s.backgroundColor === 'transparent';\r
      gl.uniform3fv(d.uBackground, transparent ? [0, 0, 0] : toColor(s.backgroundColor));\r
      gl.uniform1f(d.uTransparent, transparent ? 1 : 0);\r
      s.palette.forEach((value, index) => paletteData.set(toColor(value), index * 3));\r
      gl.uniform3fv(d.uPalette, paletteData);\r
      gl.uniform1i(d.uPaletteCount, s.palette.length);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.0005, 0.05) : 1 / 60;\r
      last = now;\r
      if (!s.disableAnimation && !reduce) state.time += dt;\r
\r
      const engaged = s.enableMouseInteraction && pointer.inside && !reduce;\r
      state.presence += ((engaged ? 1 : 0) - state.presence) * (1 - Math.exp(-dt / (engaged ? 0.12 : 0.35)));\r
      if (pointer.set) {\r
        const [tx, ty] = toUv(pointer.x, pointer.y);\r
        const follow = 1 - Math.exp(-dt / 0.06);\r
        const moved = Math.hypot(tx - state.hx, ty - state.hy);\r
        state.hx += (tx - state.hx) * follow;\r
        state.hy += (ty - state.hy) * follow;\r
        const decay = Math.exp(-dt / (0.08 + s.trail * 0.7));\r
        trailPoints.forEach(point => {\r
          point.weight *= decay;\r
        });\r
        const head = trailPoints[0];\r
        if (!head || Math.hypot(head.x - state.hx, head.y - state.hy) > 0.012 || moved > 0.012) {\r
          trailPoints.unshift({ x: state.hx, y: state.hy, weight: state.presence });\r
        } else {\r
          head.x = state.hx;\r
          head.y = state.hy;\r
          head.weight = state.presence;\r
        }\r
        if (s.trail <= 0.001) trailPoints.length = Math.min(trailPoints.length, 1);\r
        while (\r
          trailPoints.length > MAX_TRAIL ||\r
          (trailPoints.length > 1 && trailPoints[trailPoints.length - 1].weight < 0.01)\r
        ) {\r
          trailPoints.pop();\r
        }\r
      }\r
\r
      for (let i = ripples.length - 1; i >= 0; i--) {\r
        ripples[i].age += dt;\r
        if (ripples[i].age >= RIPPLE_SECONDS) ripples.splice(i, 1);\r
      }\r
\r
      if (!s.intro || reduce) state.reveal = 1;\r
      else if (state.reveal < 1) state.reveal = Math.min(1, state.reveal + dt / INTRO_SECONDS);\r
\r
      render();\r
      const busy =\r
        !s.disableAnimation ||\r
        state.reveal < 1 ||\r
        ripples.length > 0 ||\r
        state.presence > 0.002 ||\r
        trailPoints.some(point => point.weight > 0.01);\r
      if (busy && !reduce) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      view.width = width;\r
      view.height = height;\r
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      view.ratio = canvas.width / width;\r
      allocate();\r
      render();\r
      wake();\r
    };\r
\r
    const locate = event => {\r
      const rect = container.getBoundingClientRect();\r
      pointer.x = event.clientX - rect.left;\r
      pointer.y = event.clientY - rect.top;\r
      pointer.inside = pointer.x >= 0 && pointer.y >= 0 && pointer.x <= rect.width && pointer.y <= rect.height;\r
      if (pointer.inside && !pointer.set) {\r
        const [x, y] = toUv(pointer.x, pointer.y);\r
        state.hx = x;\r
        state.hy = y;\r
        pointer.set = true;\r
      }\r
    };\r
\r
    const onPointerMove = event => {\r
      locate(event);\r
      wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      locate(event);\r
      if (!pointer.inside || !s.clickRipple || reduce) return;\r
      const [x, y] = toUv(pointer.x, pointer.y);\r
      ripples.push({ x, y, age: 0 });\r
      if (ripples.length > MAX_RIPPLES) ripples.shift();\r
      wake();\r
    };\r
\r
    const onPointerUp = event => {\r
      if (event.pointerType !== 'mouse') pointer.inside = false;\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
    };\r
\r
    const onVisibility = () => {\r
      last = 0;\r
      wake();\r
    };\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(container);\r
    const intersection = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible) {\r
        last = 0;\r
        wake();\r
      }\r
    });\r
    intersection.observe(container);\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    window.addEventListener('pointerup', onPointerUp, { passive: true });\r
    window.addEventListener('pointercancel', onPointerUp, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
\r
    let lastDpr = settingsRef.current.dpr;\r
    wakeRef.current = () => {\r
      const s = settingsRef.current;\r
      if (s.dpr !== lastDpr) {\r
        lastDpr = s.dpr;\r
        resize();\r
        return;\r
      }\r
      if (!raf) render();\r
      wake();\r
    };\r
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
      gl.deleteProgram(wave.program);\r
      gl.deleteProgram(dither.program);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteTexture(field);\r
      gl.deleteFramebuffer(framebuffer);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div ref={containerRef} className={\`dither-container\${className ? \` \${className}\` : ''}\`} style={style}>\r
      <canvas ref={canvasRef} className="dither-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Dither;\r
`,n=`.dither-container {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.dither-canvas {\r
  position: absolute;\r
  inset: 0;\r
  display: block;\r
  width: 100%;\r
  height: 100%;\r
}\r
`,e=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
const MODES = { bayer: 0, bayer4: 1, bayer2: 2, halftone: 3, lines: 4, crosshatch: 5, noise: 6, none: 7 };\r
const EFFECTS = { erase: 0, reveal: 1, ripple: 2 };\r
const MAX_TRAIL = 16;\r
const MAX_RIPPLES = 4;\r
const MAX_PALETTE = 8;\r
const INTRO_SECONDS = 1.8;\r
const RIPPLE_SECONDS = 1.6;\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const WAVE_FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform vec2 uResolution;\r
uniform float uCell;\r
uniform float uTime;\r
uniform float uWaveSpeed;\r
uniform float uWaveFrequency;\r
uniform float uWaveAmplitude;\r
uniform float uScale;\r
uniform float uContrast;\r
uniform float uBrightness;\r
uniform int uEffect;\r
uniform float uRadius;\r
uniform float uStrength;\r
uniform vec3 uTrail[\${MAX_TRAIL}];\r
uniform int uTrailCount;\r
uniform vec4 uRipples[\${MAX_RIPPLES}];\r
uniform int uRippleCount;\r
uniform float uIntro;\r
uniform float uReach;\r
out vec4 outColor;\r
\r
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }\r
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }\r
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }\r
vec2 fade(vec2 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }\r
\r
float cnoise(vec2 P) {\r
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);\r
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);\r
  Pi = mod289(Pi);\r
  vec4 ix = Pi.xzxz;\r
  vec4 iy = Pi.yyww;\r
  vec4 fx = Pf.xzxz;\r
  vec4 fy = Pf.yyww;\r
  vec4 i = permute(permute(ix) + iy);\r
  vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0;\r
  vec4 gy = abs(gx) - 0.5;\r
  vec4 tx = floor(gx + 0.5);\r
  gx = gx - tx;\r
  vec2 g00 = vec2(gx.x, gy.x);\r
  vec2 g10 = vec2(gx.y, gy.y);\r
  vec2 g01 = vec2(gx.z, gy.z);\r
  vec2 g11 = vec2(gx.w, gy.w);\r
  vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));\r
  g00 *= norm.x;\r
  g01 *= norm.y;\r
  g10 *= norm.z;\r
  g11 *= norm.w;\r
  float n00 = dot(g00, vec2(fx.x, fy.x));\r
  float n10 = dot(g10, vec2(fx.y, fy.y));\r
  float n01 = dot(g01, vec2(fx.z, fy.z));\r
  float n11 = dot(g11, vec2(fx.w, fy.w));\r
  vec2 fadeXY = fade(Pf.xy);\r
  vec2 nx = mix(vec2(n00, n01), vec2(n10, n11), fadeXY.x);\r
  return 2.3 * mix(nx.x, nx.y, fadeXY.y);\r
}\r
\r
float fbm(vec2 p) {\r
  float value = 0.0;\r
  float amp = 1.0;\r
  for (int i = 0; i < 4; i++) {\r
    value += amp * abs(cnoise(p));\r
    p *= uWaveFrequency;\r
    amp *= uWaveAmplitude;\r
  }\r
  return value;\r
}\r
\r
float pattern(vec2 p) {\r
  vec2 p2 = p - uTime * uWaveSpeed;\r
  return fbm(p + fbm(p2));\r
}\r
\r
void main() {\r
  vec2 corner = (gl_FragCoord.xy - 0.5) * uCell;\r
  vec2 uv = corner / uResolution - 0.5;\r
  uv.x *= uResolution.x / uResolution.y;\r
\r
  float touch = 0.0;\r
  for (int i = 0; i < \${MAX_TRAIL}; i++) {\r
    if (i >= uTrailCount) break;\r
    vec3 point = uTrail[i];\r
    float reach = uRadius * mix(0.55, 1.0, point.z);\r
    touch = max(touch, point.z * (1.0 - smoothstep(0.0, reach, length(uv - point.xy))));\r
  }\r
\r
  vec2 warp = vec2(0.0);\r
  float ring = 0.0;\r
  for (int i = 0; i < \${MAX_RIPPLES}; i++) {\r
    if (i >= uRippleCount) break;\r
    vec4 ripple = uRipples[i];\r
    vec2 delta = uv - ripple.xy;\r
    float dist = length(delta);\r
    float life = clamp(ripple.z / \${RIPPLE_SECONDS.toFixed(2)}, 0.0, 1.0);\r
    float wave = exp(-pow((dist - ripple.z * 0.9) / 0.07, 2.0)) * (1.0 - life) * (1.0 - life) * ripple.w;\r
    warp += (dist > 0.0001 ? delta / dist : vec2(0.0)) * wave * 0.035;\r
    ring += wave;\r
  }\r
\r
  if (uEffect == 2 && touch > 0.0) {\r
    vec3 head = uTrail[0];\r
    vec2 delta = uv - head.xy;\r
    float dist = length(delta);\r
    warp += (dist > 0.0001 ? delta / dist : vec2(0.0)) * sin(dist / max(uRadius, 0.001) * 16.0 - uTime * 7.0) * 0.04 * touch * uStrength;\r
  }\r
\r
  float f = pattern((uv + warp) / uScale);\r
  if (uEffect == 0) f -= 0.5 * touch * uStrength;\r
  if (uEffect == 1) f += 0.5 * touch * uStrength;\r
  f += ring * 0.55;\r
  f = (f - 0.5) * uContrast + 0.5 + uBrightness;\r
  float show = clamp((uIntro * uReach - length(uv)) / 0.45, 0.0, 1.0);\r
  float v = clamp(f, 0.0, 1.0) * show * show * (3.0 - 2.0 * show);\r
  outColor = vec4(floor(v * 255.0) / 255.0, fract(v * 255.0), 0.0, 1.0);\r
}\`;\r
\r
const DITHER_FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform sampler2D uField;\r
uniform ivec2 uFieldSize;\r
uniform float uCellDevice;\r
uniform int uMode;\r
uniform float uColorNum;\r
uniform vec3 uWave;\r
uniform vec3 uBackground;\r
uniform vec3 uPalette[\${MAX_PALETTE}];\r
uniform int uPaletteCount;\r
uniform float uTransparent;\r
out vec4 outColor;\r
\r
const float bayer8[64] = float[64](\r
  0.0 / 64.0, 48.0 / 64.0, 12.0 / 64.0, 60.0 / 64.0, 3.0 / 64.0, 51.0 / 64.0, 15.0 / 64.0, 63.0 / 64.0,\r
  32.0 / 64.0, 16.0 / 64.0, 44.0 / 64.0, 28.0 / 64.0, 35.0 / 64.0, 19.0 / 64.0, 47.0 / 64.0, 31.0 / 64.0,\r
  8.0 / 64.0, 56.0 / 64.0, 4.0 / 64.0, 52.0 / 64.0, 11.0 / 64.0, 59.0 / 64.0, 7.0 / 64.0, 55.0 / 64.0,\r
  40.0 / 64.0, 24.0 / 64.0, 36.0 / 64.0, 20.0 / 64.0, 43.0 / 64.0, 27.0 / 64.0, 39.0 / 64.0, 23.0 / 64.0,\r
  2.0 / 64.0, 50.0 / 64.0, 14.0 / 64.0, 62.0 / 64.0, 1.0 / 64.0, 49.0 / 64.0, 13.0 / 64.0, 61.0 / 64.0,\r
  34.0 / 64.0, 18.0 / 64.0, 46.0 / 64.0, 30.0 / 64.0, 33.0 / 64.0, 17.0 / 64.0, 45.0 / 64.0, 29.0 / 64.0,\r
  10.0 / 64.0, 58.0 / 64.0, 6.0 / 64.0, 54.0 / 64.0, 9.0 / 64.0, 57.0 / 64.0, 5.0 / 64.0, 53.0 / 64.0,\r
  42.0 / 64.0, 26.0 / 64.0, 38.0 / 64.0, 22.0 / 64.0, 41.0 / 64.0, 25.0 / 64.0, 37.0 / 64.0, 21.0 / 64.0\r
);\r
\r
const float bayer4[16] = float[16](\r
  0.0 / 16.0, 8.0 / 16.0, 2.0 / 16.0, 10.0 / 16.0,\r
  12.0 / 16.0, 4.0 / 16.0, 14.0 / 16.0, 6.0 / 16.0,\r
  3.0 / 16.0, 11.0 / 16.0, 1.0 / 16.0, 9.0 / 16.0,\r
  15.0 / 16.0, 7.0 / 16.0, 13.0 / 16.0, 5.0 / 16.0\r
);\r
\r
const float bayer2[4] = float[4](0.0 / 4.0, 2.0 / 4.0, 3.0 / 4.0, 1.0 / 4.0);\r
\r
float threshold(vec2 cell) {\r
  if (uMode == 1) {\r
    ivec2 c = ivec2(mod(cell, 4.0));\r
    return bayer4[c.y * 4 + c.x];\r
  }\r
  if (uMode == 2) {\r
    ivec2 c = ivec2(mod(cell, 2.0));\r
    return bayer2[c.y * 2 + c.x];\r
  }\r
  if (uMode == 3) {\r
    vec2 r = vec2(cell.x + cell.y, cell.x - cell.y) * 0.70710678 / 4.0;\r
    return clamp(length(fract(r) - 0.5) * 1.41421356, 0.0, 0.999);\r
  }\r
  if (uMode == 4) {\r
    return abs(fract(cell.y / 4.0) - 0.5) * 2.0 * 0.999;\r
  }\r
  if (uMode == 5) {\r
    float a = abs(fract((cell.x + cell.y) / 6.0) - 0.5) * 2.0;\r
    float b = abs(fract((cell.x - cell.y) / 6.0) - 0.5) * 2.0;\r
    return min(a, b) * 0.999;\r
  }\r
  if (uMode == 6) {\r
    return fract(52.9829189 * fract(dot(cell, vec2(0.06711056, 0.00583715))));\r
  }\r
  if (uMode == 7) {\r
    return 0.25;\r
  }\r
  ivec2 c = ivec2(mod(cell, 8.0));\r
  return bayer8[c.y * 8 + c.x];\r
}\r
\r
vec3 toSrgb(vec3 c) {\r
  c = clamp(c, 0.0, 1.0);\r
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));\r
}\r
\r
void main() {\r
  vec2 cell = floor(gl_FragCoord.xy / uCellDevice);\r
  vec4 sampleValue = texelFetch(uField, clamp(ivec2(cell), ivec2(0), uFieldSize - 1), 0);\r
  float f = sampleValue.r + sampleValue.g / 255.0;\r
  float t = threshold(cell) - 0.25;\r
\r
  if (uPaletteCount > 1) {\r
    float n = float(uPaletteCount);\r
    float v = f + t / (n - 1.0);\r
    v = clamp(v - mix(0.2, 0.0, smoothstep(0.45, 0.8, v)), 0.0, 1.0);\r
    int index = int(floor(v * (n - 1.0) + 0.5));\r
    outColor = vec4(toSrgb(uPalette[index]), 1.0);\r
    return;\r
  }\r
\r
  float levels = max(uColorNum, 1.01) - 1.0;\r
  if (uTransparent > 0.5) {\r
    float v = f + t / levels;\r
    v = clamp(v - mix(0.2, 0.0, smoothstep(0.45, 0.8, v)), 0.0, 1.0);\r
    float a = floor(v * levels + 0.5) / levels;\r
    outColor = vec4(toSrgb(uWave) * a, a);\r
    return;\r
  }\r
\r
  float base = dot(uBackground, vec3(0.2126, 0.7152, 0.0722));\r
  vec3 offset = (uWave - vec3(base)) * f + t / levels;\r
  float luminance = dot(uBackground + offset, vec3(0.2126, 0.7152, 0.0722));\r
  offset -= mix(0.2, 0.0, smoothstep(0.45, 0.8, luminance));\r
  bool rising = dot(uWave, vec3(0.2126, 0.7152, 0.0722)) >= base;\r
  float lower = rising ? 0.0 : -max(uBackground.r, max(uBackground.g, uBackground.b));\r
  float upper = rising ? 1.0 - min(uBackground.r, min(uBackground.g, uBackground.b)) : 0.0;\r
  offset = floor(clamp(offset, lower, upper) * levels + 0.5) / levels;\r
  outColor = vec4(toSrgb(uBackground + offset), 1.0);\r
}\`;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
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
const link = (gl, fragmentSource) => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);\r
  const program = gl.createProgram();\r
  if (!vertex || !fragment || !program) return null;\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
  gl.bindAttribLocation(program, 0, 'aPosition');\r
  gl.linkProgram(program);\r
  gl.deleteShader(vertex);\r
  gl.deleteShader(fragment);\r
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {\r
    gl.deleteProgram(program);\r
    return null;\r
  }\r
  const uniforms = {};\r
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
  for (let i = 0; i < count; i++) {\r
    const info = gl.getActiveUniform(program, i);\r
    if (info) uniforms[info.name.replace('[0]', '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const toLinear = value => (value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4));\r
\r
const Dither = ({\r
  waveSpeed = 0.05,\r
  waveFrequency = 3,\r
  waveAmplitude = 0.3,\r
  waveColor = [0.5, 0.5, 0.5],\r
  backgroundColor = [0, 0, 0],\r
  colorNum = 4,\r
  pixelSize = 2,\r
  disableAnimation = false,\r
  enableMouseInteraction = true,\r
  mouseRadius = 1,\r
  ditherMode = 'bayer',\r
  palette,\r
  scale = 1,\r
  contrast = 1,\r
  brightness = 0,\r
  mouseEffect = 'erase',\r
  mouseStrength = 1,\r
  trail = 0.5,\r
  clickRipple = true,\r
  intro = true,\r
  dpr,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settings = {\r
    waveSpeed,\r
    waveFrequency,\r
    waveAmplitude,\r
    waveColor,\r
    backgroundColor,\r
    colorNum: Math.max(2, colorNum),\r
    pixelSize: Math.max(1, pixelSize),\r
    disableAnimation,\r
    enableMouseInteraction,\r
    mouseRadius: Math.max(0.001, mouseRadius),\r
    mode: MODES[ditherMode] ?? 0,\r
    palette: Array.isArray(palette) ? palette.filter(Boolean).slice(0, MAX_PALETTE) : [],\r
    scale: Math.max(0.05, scale),\r
    contrast,\r
    brightness,\r
    effect: EFFECTS[mouseEffect] ?? 0,\r
    mouseStrength: Math.max(0, mouseStrength),\r
    trail: clamp(trail, 0, 1),\r
    clickRipple,\r
    intro,\r
    dpr\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    const gl = canvas?.getContext('webgl2', {\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const wave = link(gl, WAVE_FRAGMENT);\r
    const dither = link(gl, DITHER_FRAGMENT);\r
    if (!wave || !dither) return undefined;\r
\r
    const buffer = gl.createBuffer();\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const field = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, field);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    const framebuffer = gl.createFramebuffer();\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const cache = new Map();\r
    const toColor = value => {\r
      if (Array.isArray(value)) return [0, 1, 2].map(i => clamp(Number(value[i]) || 0, 0, 1));\r
      const key = String(value);\r
      if (cache.has(key)) return cache.get(key);\r
      let rgb = [0, 0, 0];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#000000';\r
        probe.fillStyle = key;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r, g, b].map(channel => toLinear(channel / 255));\r
      }\r
      cache.set(key, rgb);\r
      return rgb;\r
    };\r
\r
    const view = { width: 1, height: 1, ratio: 1, cell: 1, cellCss: 1, cols: 1, rows: 1 };\r
    const pointer = { x: 0, y: 0, inside: false, set: false };\r
    const trailPoints = [];\r
    const ripples = [];\r
    const trailData = new Float32Array(MAX_TRAIL * 3);\r
    const rippleData = new Float32Array(MAX_RIPPLES * 4);\r
    const paletteData = new Float32Array(MAX_PALETTE * 3);\r
    const state = {\r
      time: 0,\r
      hx: 0,\r
      hy: 0,\r
      presence: 0,\r
      reveal: settingsRef.current.intro && !reduce ? 0 : 1\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const allocate = () => {\r
      const s = settingsRef.current;\r
      view.cell = Math.max(1, Math.round(s.pixelSize * view.ratio));\r
      view.cellCss = view.cell / view.ratio;\r
      view.cols = Math.max(1, Math.ceil(canvas.width / view.cell));\r
      view.rows = Math.max(1, Math.ceil(canvas.height / view.cell));\r
      gl.bindTexture(gl.TEXTURE_2D, field);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, view.cols, view.rows, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, field, 0);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
    };\r
\r
    const toUv = (x, y) => {\r
      const aspect = view.width / view.height;\r
      return [(x / view.width - 0.5) * aspect, -(y / view.height - 0.5)];\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const expected = Math.max(1, Math.round(s.pixelSize * view.ratio));\r
      if (expected !== view.cell) allocate();\r
\r
      let trailCount = 0;\r
      for (let i = 0; i < trailPoints.length && trailCount < MAX_TRAIL; i++) {\r
        const point = trailPoints[i];\r
        if (point.weight <= 0.01) continue;\r
        trailData.set([point.x, point.y, point.weight], trailCount * 3);\r
        trailCount++;\r
      }\r
      let rippleCount = 0;\r
      for (let i = ripples.length - 1; i >= 0 && rippleCount < MAX_RIPPLES; i--) {\r
        rippleData.set([ripples[i].x, ripples[i].y, ripples[i].age, 1], rippleCount * 4);\r
        rippleCount++;\r
      }\r
\r
      const eased = s.intro && !reduce ? state.reveal * state.reveal * (3 - 2 * state.reveal) : 1;\r
\r
      gl.bindVertexArray(vao);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.viewport(0, 0, view.cols, view.rows);\r
      gl.useProgram(wave.program);\r
      const w = wave.uniforms;\r
      gl.uniform2f(w.uResolution, canvas.width / view.ratio, canvas.height / view.ratio);\r
      gl.uniform1f(w.uCell, view.cellCss);\r
      gl.uniform1f(w.uTime, state.time);\r
      gl.uniform1f(w.uWaveSpeed, s.waveSpeed);\r
      gl.uniform1f(w.uWaveFrequency, s.waveFrequency);\r
      gl.uniform1f(w.uWaveAmplitude, s.waveAmplitude);\r
      gl.uniform1f(w.uScale, s.scale);\r
      gl.uniform1f(w.uContrast, s.contrast);\r
      gl.uniform1f(w.uBrightness, s.brightness);\r
      gl.uniform1i(w.uEffect, s.effect);\r
      gl.uniform1f(w.uRadius, s.mouseRadius);\r
      gl.uniform1f(w.uStrength, s.mouseStrength);\r
      gl.uniform3fv(w.uTrail, trailData);\r
      gl.uniform1i(w.uTrailCount, trailCount);\r
      gl.uniform4fv(w.uRipples, rippleData);\r
      gl.uniform1i(w.uRippleCount, rippleCount);\r
      gl.uniform1f(w.uIntro, eased);\r
      gl.uniform1f(w.uReach, 0.5 * Math.hypot(view.width / view.height, 1) + 0.45);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(dither.program);\r
      const d = dither.uniforms;\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, field);\r
      gl.uniform1i(d.uField, 0);\r
      gl.uniform2i(d.uFieldSize, view.cols, view.rows);\r
      gl.uniform1f(d.uCellDevice, view.cell);\r
      gl.uniform1i(d.uMode, s.mode);\r
      gl.uniform1f(d.uColorNum, s.colorNum);\r
      gl.uniform3fv(d.uWave, toColor(s.waveColor));\r
      const transparent = s.backgroundColor === 'transparent';\r
      gl.uniform3fv(d.uBackground, transparent ? [0, 0, 0] : toColor(s.backgroundColor));\r
      gl.uniform1f(d.uTransparent, transparent ? 1 : 0);\r
      s.palette.forEach((value, index) => paletteData.set(toColor(value), index * 3));\r
      gl.uniform3fv(d.uPalette, paletteData);\r
      gl.uniform1i(d.uPaletteCount, s.palette.length);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.0005, 0.05) : 1 / 60;\r
      last = now;\r
      if (!s.disableAnimation && !reduce) state.time += dt;\r
\r
      const engaged = s.enableMouseInteraction && pointer.inside && !reduce;\r
      state.presence += ((engaged ? 1 : 0) - state.presence) * (1 - Math.exp(-dt / (engaged ? 0.12 : 0.35)));\r
      if (pointer.set) {\r
        const [tx, ty] = toUv(pointer.x, pointer.y);\r
        const follow = 1 - Math.exp(-dt / 0.06);\r
        const moved = Math.hypot(tx - state.hx, ty - state.hy);\r
        state.hx += (tx - state.hx) * follow;\r
        state.hy += (ty - state.hy) * follow;\r
        const decay = Math.exp(-dt / (0.08 + s.trail * 0.7));\r
        trailPoints.forEach(point => {\r
          point.weight *= decay;\r
        });\r
        const head = trailPoints[0];\r
        if (!head || Math.hypot(head.x - state.hx, head.y - state.hy) > 0.012 || moved > 0.012) {\r
          trailPoints.unshift({ x: state.hx, y: state.hy, weight: state.presence });\r
        } else {\r
          head.x = state.hx;\r
          head.y = state.hy;\r
          head.weight = state.presence;\r
        }\r
        if (s.trail <= 0.001) trailPoints.length = Math.min(trailPoints.length, 1);\r
        while (\r
          trailPoints.length > MAX_TRAIL ||\r
          (trailPoints.length > 1 && trailPoints[trailPoints.length - 1].weight < 0.01)\r
        ) {\r
          trailPoints.pop();\r
        }\r
      }\r
\r
      for (let i = ripples.length - 1; i >= 0; i--) {\r
        ripples[i].age += dt;\r
        if (ripples[i].age >= RIPPLE_SECONDS) ripples.splice(i, 1);\r
      }\r
\r
      if (!s.intro || reduce) state.reveal = 1;\r
      else if (state.reveal < 1) state.reveal = Math.min(1, state.reveal + dt / INTRO_SECONDS);\r
\r
      render();\r
      const busy =\r
        !s.disableAnimation ||\r
        state.reveal < 1 ||\r
        ripples.length > 0 ||\r
        state.presence > 0.002 ||\r
        trailPoints.some(point => point.weight > 0.01);\r
      if (busy && !reduce) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      view.width = width;\r
      view.height = height;\r
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      view.ratio = canvas.width / width;\r
      allocate();\r
      render();\r
      wake();\r
    };\r
\r
    const locate = event => {\r
      const rect = container.getBoundingClientRect();\r
      pointer.x = event.clientX - rect.left;\r
      pointer.y = event.clientY - rect.top;\r
      pointer.inside = pointer.x >= 0 && pointer.y >= 0 && pointer.x <= rect.width && pointer.y <= rect.height;\r
      if (pointer.inside && !pointer.set) {\r
        const [x, y] = toUv(pointer.x, pointer.y);\r
        state.hx = x;\r
        state.hy = y;\r
        pointer.set = true;\r
      }\r
    };\r
\r
    const onPointerMove = event => {\r
      locate(event);\r
      wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      locate(event);\r
      if (!pointer.inside || !s.clickRipple || reduce) return;\r
      const [x, y] = toUv(pointer.x, pointer.y);\r
      ripples.push({ x, y, age: 0 });\r
      if (ripples.length > MAX_RIPPLES) ripples.shift();\r
      wake();\r
    };\r
\r
    const onPointerUp = event => {\r
      if (event.pointerType !== 'mouse') pointer.inside = false;\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
    };\r
\r
    const onVisibility = () => {\r
      last = 0;\r
      wake();\r
    };\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(container);\r
    const intersection = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible) {\r
        last = 0;\r
        wake();\r
      }\r
    });\r
    intersection.observe(container);\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    window.addEventListener('pointerup', onPointerUp, { passive: true });\r
    window.addEventListener('pointercancel', onPointerUp, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
\r
    let lastDpr = settingsRef.current.dpr;\r
    wakeRef.current = () => {\r
      const s = settingsRef.current;\r
      if (s.dpr !== lastDpr) {\r
        lastDpr = s.dpr;\r
        resize();\r
        return;\r
      }\r
      if (!raf) render();\r
      wake();\r
    };\r
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
      gl.deleteProgram(wave.program);\r
      gl.deleteProgram(dither.program);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteTexture(field);\r
      gl.deleteFramebuffer(framebuffer);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div\r
      ref={containerRef}\r
      className={['relative h-full w-full overflow-hidden', className].filter(Boolean).join(' ')}\r
      style={style}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Dither;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties } from 'react';\r
import './Dither.css';\r
\r
export type DitherColor = string | [number, number, number];\r
export type DitherMode = 'bayer' | 'bayer4' | 'bayer2' | 'halftone' | 'lines' | 'crosshatch' | 'noise' | 'none';\r
export type DitherMouseEffect = 'erase' | 'reveal' | 'ripple';\r
\r
export interface DitherProps {\r
  waveSpeed?: number;\r
  waveFrequency?: number;\r
  waveAmplitude?: number;\r
  waveColor?: DitherColor;\r
  backgroundColor?: DitherColor;\r
  colorNum?: number;\r
  pixelSize?: number;\r
  disableAnimation?: boolean;\r
  enableMouseInteraction?: boolean;\r
  mouseRadius?: number;\r
  ditherMode?: DitherMode;\r
  palette?: string[];\r
  scale?: number;\r
  contrast?: number;\r
  brightness?: number;\r
  mouseEffect?: DitherMouseEffect;\r
  mouseStrength?: number;\r
  trail?: number;\r
  clickRipple?: boolean;\r
  intro?: boolean;\r
  dpr?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
type Settings = {\r
  waveSpeed: number;\r
  waveFrequency: number;\r
  waveAmplitude: number;\r
  waveColor: DitherColor;\r
  backgroundColor: DitherColor;\r
  colorNum: number;\r
  pixelSize: number;\r
  disableAnimation: boolean;\r
  enableMouseInteraction: boolean;\r
  mouseRadius: number;\r
  mode: number;\r
  palette: string[];\r
  scale: number;\r
  contrast: number;\r
  brightness: number;\r
  effect: number;\r
  mouseStrength: number;\r
  trail: number;\r
  clickRipple: boolean;\r
  intro: boolean;\r
  dpr?: number;\r
};\r
\r
type TrailPoint = { x: number; y: number; weight: number };\r
\r
type Ripple = { x: number; y: number; age: number };\r
\r
type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };\r
\r
const MODES: Record<string, number> = {\r
  bayer: 0,\r
  bayer4: 1,\r
  bayer2: 2,\r
  halftone: 3,\r
  lines: 4,\r
  crosshatch: 5,\r
  noise: 6,\r
  none: 7\r
};\r
const EFFECTS: Record<string, number> = { erase: 0, reveal: 1, ripple: 2 };\r
const MAX_TRAIL = 16;\r
const MAX_RIPPLES = 4;\r
const MAX_PALETTE = 8;\r
const INTRO_SECONDS = 1.8;\r
const RIPPLE_SECONDS = 1.6;\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const WAVE_FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform vec2 uResolution;\r
uniform float uCell;\r
uniform float uTime;\r
uniform float uWaveSpeed;\r
uniform float uWaveFrequency;\r
uniform float uWaveAmplitude;\r
uniform float uScale;\r
uniform float uContrast;\r
uniform float uBrightness;\r
uniform int uEffect;\r
uniform float uRadius;\r
uniform float uStrength;\r
uniform vec3 uTrail[\${MAX_TRAIL}];\r
uniform int uTrailCount;\r
uniform vec4 uRipples[\${MAX_RIPPLES}];\r
uniform int uRippleCount;\r
uniform float uIntro;\r
uniform float uReach;\r
out vec4 outColor;\r
\r
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }\r
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }\r
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }\r
vec2 fade(vec2 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }\r
\r
float cnoise(vec2 P) {\r
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);\r
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);\r
  Pi = mod289(Pi);\r
  vec4 ix = Pi.xzxz;\r
  vec4 iy = Pi.yyww;\r
  vec4 fx = Pf.xzxz;\r
  vec4 fy = Pf.yyww;\r
  vec4 i = permute(permute(ix) + iy);\r
  vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0;\r
  vec4 gy = abs(gx) - 0.5;\r
  vec4 tx = floor(gx + 0.5);\r
  gx = gx - tx;\r
  vec2 g00 = vec2(gx.x, gy.x);\r
  vec2 g10 = vec2(gx.y, gy.y);\r
  vec2 g01 = vec2(gx.z, gy.z);\r
  vec2 g11 = vec2(gx.w, gy.w);\r
  vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));\r
  g00 *= norm.x;\r
  g01 *= norm.y;\r
  g10 *= norm.z;\r
  g11 *= norm.w;\r
  float n00 = dot(g00, vec2(fx.x, fy.x));\r
  float n10 = dot(g10, vec2(fx.y, fy.y));\r
  float n01 = dot(g01, vec2(fx.z, fy.z));\r
  float n11 = dot(g11, vec2(fx.w, fy.w));\r
  vec2 fadeXY = fade(Pf.xy);\r
  vec2 nx = mix(vec2(n00, n01), vec2(n10, n11), fadeXY.x);\r
  return 2.3 * mix(nx.x, nx.y, fadeXY.y);\r
}\r
\r
float fbm(vec2 p) {\r
  float value = 0.0;\r
  float amp = 1.0;\r
  for (int i = 0; i < 4; i++) {\r
    value += amp * abs(cnoise(p));\r
    p *= uWaveFrequency;\r
    amp *= uWaveAmplitude;\r
  }\r
  return value;\r
}\r
\r
float pattern(vec2 p) {\r
  vec2 p2 = p - uTime * uWaveSpeed;\r
  return fbm(p + fbm(p2));\r
}\r
\r
void main() {\r
  vec2 corner = (gl_FragCoord.xy - 0.5) * uCell;\r
  vec2 uv = corner / uResolution - 0.5;\r
  uv.x *= uResolution.x / uResolution.y;\r
\r
  float touch = 0.0;\r
  for (int i = 0; i < \${MAX_TRAIL}; i++) {\r
    if (i >= uTrailCount) break;\r
    vec3 point = uTrail[i];\r
    float reach = uRadius * mix(0.55, 1.0, point.z);\r
    touch = max(touch, point.z * (1.0 - smoothstep(0.0, reach, length(uv - point.xy))));\r
  }\r
\r
  vec2 warp = vec2(0.0);\r
  float ring = 0.0;\r
  for (int i = 0; i < \${MAX_RIPPLES}; i++) {\r
    if (i >= uRippleCount) break;\r
    vec4 ripple = uRipples[i];\r
    vec2 delta = uv - ripple.xy;\r
    float dist = length(delta);\r
    float life = clamp(ripple.z / \${RIPPLE_SECONDS.toFixed(2)}, 0.0, 1.0);\r
    float wave = exp(-pow((dist - ripple.z * 0.9) / 0.07, 2.0)) * (1.0 - life) * (1.0 - life) * ripple.w;\r
    warp += (dist > 0.0001 ? delta / dist : vec2(0.0)) * wave * 0.035;\r
    ring += wave;\r
  }\r
\r
  if (uEffect == 2 && touch > 0.0) {\r
    vec3 head = uTrail[0];\r
    vec2 delta = uv - head.xy;\r
    float dist = length(delta);\r
    warp += (dist > 0.0001 ? delta / dist : vec2(0.0)) * sin(dist / max(uRadius, 0.001) * 16.0 - uTime * 7.0) * 0.04 * touch * uStrength;\r
  }\r
\r
  float f = pattern((uv + warp) / uScale);\r
  if (uEffect == 0) f -= 0.5 * touch * uStrength;\r
  if (uEffect == 1) f += 0.5 * touch * uStrength;\r
  f += ring * 0.55;\r
  f = (f - 0.5) * uContrast + 0.5 + uBrightness;\r
  float show = clamp((uIntro * uReach - length(uv)) / 0.45, 0.0, 1.0);\r
  float v = clamp(f, 0.0, 1.0) * show * show * (3.0 - 2.0 * show);\r
  outColor = vec4(floor(v * 255.0) / 255.0, fract(v * 255.0), 0.0, 1.0);\r
}\`;\r
\r
const DITHER_FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform sampler2D uField;\r
uniform ivec2 uFieldSize;\r
uniform float uCellDevice;\r
uniform int uMode;\r
uniform float uColorNum;\r
uniform vec3 uWave;\r
uniform vec3 uBackground;\r
uniform vec3 uPalette[\${MAX_PALETTE}];\r
uniform int uPaletteCount;\r
uniform float uTransparent;\r
out vec4 outColor;\r
\r
const float bayer8[64] = float[64](\r
  0.0 / 64.0, 48.0 / 64.0, 12.0 / 64.0, 60.0 / 64.0, 3.0 / 64.0, 51.0 / 64.0, 15.0 / 64.0, 63.0 / 64.0,\r
  32.0 / 64.0, 16.0 / 64.0, 44.0 / 64.0, 28.0 / 64.0, 35.0 / 64.0, 19.0 / 64.0, 47.0 / 64.0, 31.0 / 64.0,\r
  8.0 / 64.0, 56.0 / 64.0, 4.0 / 64.0, 52.0 / 64.0, 11.0 / 64.0, 59.0 / 64.0, 7.0 / 64.0, 55.0 / 64.0,\r
  40.0 / 64.0, 24.0 / 64.0, 36.0 / 64.0, 20.0 / 64.0, 43.0 / 64.0, 27.0 / 64.0, 39.0 / 64.0, 23.0 / 64.0,\r
  2.0 / 64.0, 50.0 / 64.0, 14.0 / 64.0, 62.0 / 64.0, 1.0 / 64.0, 49.0 / 64.0, 13.0 / 64.0, 61.0 / 64.0,\r
  34.0 / 64.0, 18.0 / 64.0, 46.0 / 64.0, 30.0 / 64.0, 33.0 / 64.0, 17.0 / 64.0, 45.0 / 64.0, 29.0 / 64.0,\r
  10.0 / 64.0, 58.0 / 64.0, 6.0 / 64.0, 54.0 / 64.0, 9.0 / 64.0, 57.0 / 64.0, 5.0 / 64.0, 53.0 / 64.0,\r
  42.0 / 64.0, 26.0 / 64.0, 38.0 / 64.0, 22.0 / 64.0, 41.0 / 64.0, 25.0 / 64.0, 37.0 / 64.0, 21.0 / 64.0\r
);\r
\r
const float bayer4[16] = float[16](\r
  0.0 / 16.0, 8.0 / 16.0, 2.0 / 16.0, 10.0 / 16.0,\r
  12.0 / 16.0, 4.0 / 16.0, 14.0 / 16.0, 6.0 / 16.0,\r
  3.0 / 16.0, 11.0 / 16.0, 1.0 / 16.0, 9.0 / 16.0,\r
  15.0 / 16.0, 7.0 / 16.0, 13.0 / 16.0, 5.0 / 16.0\r
);\r
\r
const float bayer2[4] = float[4](0.0 / 4.0, 2.0 / 4.0, 3.0 / 4.0, 1.0 / 4.0);\r
\r
float threshold(vec2 cell) {\r
  if (uMode == 1) {\r
    ivec2 c = ivec2(mod(cell, 4.0));\r
    return bayer4[c.y * 4 + c.x];\r
  }\r
  if (uMode == 2) {\r
    ivec2 c = ivec2(mod(cell, 2.0));\r
    return bayer2[c.y * 2 + c.x];\r
  }\r
  if (uMode == 3) {\r
    vec2 r = vec2(cell.x + cell.y, cell.x - cell.y) * 0.70710678 / 4.0;\r
    return clamp(length(fract(r) - 0.5) * 1.41421356, 0.0, 0.999);\r
  }\r
  if (uMode == 4) {\r
    return abs(fract(cell.y / 4.0) - 0.5) * 2.0 * 0.999;\r
  }\r
  if (uMode == 5) {\r
    float a = abs(fract((cell.x + cell.y) / 6.0) - 0.5) * 2.0;\r
    float b = abs(fract((cell.x - cell.y) / 6.0) - 0.5) * 2.0;\r
    return min(a, b) * 0.999;\r
  }\r
  if (uMode == 6) {\r
    return fract(52.9829189 * fract(dot(cell, vec2(0.06711056, 0.00583715))));\r
  }\r
  if (uMode == 7) {\r
    return 0.25;\r
  }\r
  ivec2 c = ivec2(mod(cell, 8.0));\r
  return bayer8[c.y * 8 + c.x];\r
}\r
\r
vec3 toSrgb(vec3 c) {\r
  c = clamp(c, 0.0, 1.0);\r
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));\r
}\r
\r
void main() {\r
  vec2 cell = floor(gl_FragCoord.xy / uCellDevice);\r
  vec4 sampleValue = texelFetch(uField, clamp(ivec2(cell), ivec2(0), uFieldSize - 1), 0);\r
  float f = sampleValue.r + sampleValue.g / 255.0;\r
  float t = threshold(cell) - 0.25;\r
\r
  if (uPaletteCount > 1) {\r
    float n = float(uPaletteCount);\r
    float v = f + t / (n - 1.0);\r
    v = clamp(v - mix(0.2, 0.0, smoothstep(0.45, 0.8, v)), 0.0, 1.0);\r
    int index = int(floor(v * (n - 1.0) + 0.5));\r
    outColor = vec4(toSrgb(uPalette[index]), 1.0);\r
    return;\r
  }\r
\r
  float levels = max(uColorNum, 1.01) - 1.0;\r
  if (uTransparent > 0.5) {\r
    float v = f + t / levels;\r
    v = clamp(v - mix(0.2, 0.0, smoothstep(0.45, 0.8, v)), 0.0, 1.0);\r
    float a = floor(v * levels + 0.5) / levels;\r
    outColor = vec4(toSrgb(uWave) * a, a);\r
    return;\r
  }\r
\r
  float base = dot(uBackground, vec3(0.2126, 0.7152, 0.0722));\r
  vec3 offset = (uWave - vec3(base)) * f + t / levels;\r
  float luminance = dot(uBackground + offset, vec3(0.2126, 0.7152, 0.0722));\r
  offset -= mix(0.2, 0.0, smoothstep(0.45, 0.8, luminance));\r
  bool rising = dot(uWave, vec3(0.2126, 0.7152, 0.0722)) >= base;\r
  float lower = rising ? 0.0 : -max(uBackground.r, max(uBackground.g, uBackground.b));\r
  float upper = rising ? 1.0 - min(uBackground.r, min(uBackground.g, uBackground.b)) : 0.0;\r
  offset = floor(clamp(offset, lower, upper) * levels + 0.5) / levels;\r
  outColor = vec4(toSrgb(uBackground + offset), 1.0);\r
}\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
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
const link = (gl: WebGL2RenderingContext, fragmentSource: string): Program | null => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);\r
  const program = gl.createProgram();\r
  if (!vertex || !fragment || !program) return null;\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
  gl.bindAttribLocation(program, 0, 'aPosition');\r
  gl.linkProgram(program);\r
  gl.deleteShader(vertex);\r
  gl.deleteShader(fragment);\r
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {\r
    gl.deleteProgram(program);\r
    return null;\r
  }\r
  const uniforms: Record<string, WebGLUniformLocation | null> = {};\r
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
  for (let i = 0; i < count; i++) {\r
    const info = gl.getActiveUniform(program, i);\r
    if (info) uniforms[info.name.replace('[0]', '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const toLinear = (value: number) => (value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4));\r
\r
const Dither = ({\r
  waveSpeed = 0.05,\r
  waveFrequency = 3,\r
  waveAmplitude = 0.3,\r
  waveColor = [0.5, 0.5, 0.5],\r
  backgroundColor = [0, 0, 0],\r
  colorNum = 4,\r
  pixelSize = 2,\r
  disableAnimation = false,\r
  enableMouseInteraction = true,\r
  mouseRadius = 1,\r
  ditherMode = 'bayer',\r
  palette,\r
  scale = 1,\r
  contrast = 1,\r
  brightness = 0,\r
  mouseEffect = 'erase',\r
  mouseStrength = 1,\r
  trail = 0.5,\r
  clickRipple = true,\r
  intro = true,\r
  dpr,\r
  className = '',\r
  style\r
}: DitherProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings: Settings = {\r
    waveSpeed,\r
    waveFrequency,\r
    waveAmplitude,\r
    waveColor,\r
    backgroundColor,\r
    colorNum: Math.max(2, colorNum),\r
    pixelSize: Math.max(1, pixelSize),\r
    disableAnimation,\r
    enableMouseInteraction,\r
    mouseRadius: Math.max(0.001, mouseRadius),\r
    mode: MODES[ditherMode] ?? 0,\r
    palette: Array.isArray(palette) ? palette.filter(Boolean).slice(0, MAX_PALETTE) : [],\r
    scale: Math.max(0.05, scale),\r
    contrast,\r
    brightness,\r
    effect: EFFECTS[mouseEffect] ?? 0,\r
    mouseStrength: Math.max(0, mouseStrength),\r
    trail: clamp(trail, 0, 1),\r
    clickRipple,\r
    intro,\r
    dpr\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    const gl = canvas?.getContext('webgl2', {\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const wave = link(gl, WAVE_FRAGMENT);\r
    const dither = link(gl, DITHER_FRAGMENT);\r
    if (!wave || !dither) return undefined;\r
\r
    const buffer = gl.createBuffer();\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const field = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, field);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    const framebuffer = gl.createFramebuffer();\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const cache = new Map<string, number[]>();\r
    const toColor = (value: DitherColor): number[] => {\r
      if (Array.isArray(value)) return [0, 1, 2].map(i => clamp(Number(value[i]) || 0, 0, 1));\r
      const key = String(value);\r
      const cached = cache.get(key);\r
      if (cached) return cached;\r
      let rgb = [0, 0, 0];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#000000';\r
        probe.fillStyle = key;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r, g, b].map(channel => toLinear(channel / 255));\r
      }\r
      cache.set(key, rgb);\r
      return rgb;\r
    };\r
\r
    const view = { width: 1, height: 1, ratio: 1, cell: 1, cellCss: 1, cols: 1, rows: 1 };\r
    const pointer = { x: 0, y: 0, inside: false, set: false };\r
    const trailPoints: TrailPoint[] = [];\r
    const ripples: Ripple[] = [];\r
    const trailData = new Float32Array(MAX_TRAIL * 3);\r
    const rippleData = new Float32Array(MAX_RIPPLES * 4);\r
    const paletteData = new Float32Array(MAX_PALETTE * 3);\r
    const state = {\r
      time: 0,\r
      hx: 0,\r
      hy: 0,\r
      presence: 0,\r
      reveal: settingsRef.current.intro && !reduce ? 0 : 1\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const allocate = () => {\r
      const s = settingsRef.current;\r
      view.cell = Math.max(1, Math.round(s.pixelSize * view.ratio));\r
      view.cellCss = view.cell / view.ratio;\r
      view.cols = Math.max(1, Math.ceil(canvas.width / view.cell));\r
      view.rows = Math.max(1, Math.ceil(canvas.height / view.cell));\r
      gl.bindTexture(gl.TEXTURE_2D, field);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, view.cols, view.rows, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, field, 0);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
    };\r
\r
    const toUv = (x: number, y: number): [number, number] => {\r
      const aspect = view.width / view.height;\r
      return [(x / view.width - 0.5) * aspect, -(y / view.height - 0.5)];\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const expected = Math.max(1, Math.round(s.pixelSize * view.ratio));\r
      if (expected !== view.cell) allocate();\r
\r
      let trailCount = 0;\r
      for (let i = 0; i < trailPoints.length && trailCount < MAX_TRAIL; i++) {\r
        const point = trailPoints[i];\r
        if (point.weight <= 0.01) continue;\r
        trailData.set([point.x, point.y, point.weight], trailCount * 3);\r
        trailCount++;\r
      }\r
      let rippleCount = 0;\r
      for (let i = ripples.length - 1; i >= 0 && rippleCount < MAX_RIPPLES; i--) {\r
        rippleData.set([ripples[i].x, ripples[i].y, ripples[i].age, 1], rippleCount * 4);\r
        rippleCount++;\r
      }\r
\r
      const eased = s.intro && !reduce ? state.reveal * state.reveal * (3 - 2 * state.reveal) : 1;\r
\r
      gl.bindVertexArray(vao);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.viewport(0, 0, view.cols, view.rows);\r
      gl.useProgram(wave.program);\r
      const w = wave.uniforms;\r
      gl.uniform2f(w.uResolution, canvas.width / view.ratio, canvas.height / view.ratio);\r
      gl.uniform1f(w.uCell, view.cellCss);\r
      gl.uniform1f(w.uTime, state.time);\r
      gl.uniform1f(w.uWaveSpeed, s.waveSpeed);\r
      gl.uniform1f(w.uWaveFrequency, s.waveFrequency);\r
      gl.uniform1f(w.uWaveAmplitude, s.waveAmplitude);\r
      gl.uniform1f(w.uScale, s.scale);\r
      gl.uniform1f(w.uContrast, s.contrast);\r
      gl.uniform1f(w.uBrightness, s.brightness);\r
      gl.uniform1i(w.uEffect, s.effect);\r
      gl.uniform1f(w.uRadius, s.mouseRadius);\r
      gl.uniform1f(w.uStrength, s.mouseStrength);\r
      gl.uniform3fv(w.uTrail, trailData);\r
      gl.uniform1i(w.uTrailCount, trailCount);\r
      gl.uniform4fv(w.uRipples, rippleData);\r
      gl.uniform1i(w.uRippleCount, rippleCount);\r
      gl.uniform1f(w.uIntro, eased);\r
      gl.uniform1f(w.uReach, 0.5 * Math.hypot(view.width / view.height, 1) + 0.45);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(dither.program);\r
      const d = dither.uniforms;\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, field);\r
      gl.uniform1i(d.uField, 0);\r
      gl.uniform2i(d.uFieldSize, view.cols, view.rows);\r
      gl.uniform1f(d.uCellDevice, view.cell);\r
      gl.uniform1i(d.uMode, s.mode);\r
      gl.uniform1f(d.uColorNum, s.colorNum);\r
      gl.uniform3fv(d.uWave, toColor(s.waveColor));\r
      const transparent = s.backgroundColor === 'transparent';\r
      gl.uniform3fv(d.uBackground, transparent ? [0, 0, 0] : toColor(s.backgroundColor));\r
      gl.uniform1f(d.uTransparent, transparent ? 1 : 0);\r
      s.palette.forEach((value, index) => paletteData.set(toColor(value), index * 3));\r
      gl.uniform3fv(d.uPalette, paletteData);\r
      gl.uniform1i(d.uPaletteCount, s.palette.length);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.0005, 0.05) : 1 / 60;\r
      last = now;\r
      if (!s.disableAnimation && !reduce) state.time += dt;\r
\r
      const engaged = s.enableMouseInteraction && pointer.inside && !reduce;\r
      state.presence += ((engaged ? 1 : 0) - state.presence) * (1 - Math.exp(-dt / (engaged ? 0.12 : 0.35)));\r
      if (pointer.set) {\r
        const [tx, ty] = toUv(pointer.x, pointer.y);\r
        const follow = 1 - Math.exp(-dt / 0.06);\r
        const moved = Math.hypot(tx - state.hx, ty - state.hy);\r
        state.hx += (tx - state.hx) * follow;\r
        state.hy += (ty - state.hy) * follow;\r
        const decay = Math.exp(-dt / (0.08 + s.trail * 0.7));\r
        trailPoints.forEach(point => {\r
          point.weight *= decay;\r
        });\r
        const head = trailPoints[0];\r
        if (!head || Math.hypot(head.x - state.hx, head.y - state.hy) > 0.012 || moved > 0.012) {\r
          trailPoints.unshift({ x: state.hx, y: state.hy, weight: state.presence });\r
        } else {\r
          head.x = state.hx;\r
          head.y = state.hy;\r
          head.weight = state.presence;\r
        }\r
        if (s.trail <= 0.001) trailPoints.length = Math.min(trailPoints.length, 1);\r
        while (\r
          trailPoints.length > MAX_TRAIL ||\r
          (trailPoints.length > 1 && trailPoints[trailPoints.length - 1].weight < 0.01)\r
        ) {\r
          trailPoints.pop();\r
        }\r
      }\r
\r
      for (let i = ripples.length - 1; i >= 0; i--) {\r
        ripples[i].age += dt;\r
        if (ripples[i].age >= RIPPLE_SECONDS) ripples.splice(i, 1);\r
      }\r
\r
      if (!s.intro || reduce) state.reveal = 1;\r
      else if (state.reveal < 1) state.reveal = Math.min(1, state.reveal + dt / INTRO_SECONDS);\r
\r
      render();\r
      const busy =\r
        !s.disableAnimation ||\r
        state.reveal < 1 ||\r
        ripples.length > 0 ||\r
        state.presence > 0.002 ||\r
        trailPoints.some(point => point.weight > 0.01);\r
      if (busy && !reduce) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      view.width = width;\r
      view.height = height;\r
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      view.ratio = canvas.width / width;\r
      allocate();\r
      render();\r
      wake();\r
    };\r
\r
    const locate = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      pointer.x = event.clientX - rect.left;\r
      pointer.y = event.clientY - rect.top;\r
      pointer.inside = pointer.x >= 0 && pointer.y >= 0 && pointer.x <= rect.width && pointer.y <= rect.height;\r
      if (pointer.inside && !pointer.set) {\r
        const [x, y] = toUv(pointer.x, pointer.y);\r
        state.hx = x;\r
        state.hy = y;\r
        pointer.set = true;\r
      }\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      locate(event);\r
      wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      locate(event);\r
      if (!pointer.inside || !s.clickRipple || reduce) return;\r
      const [x, y] = toUv(pointer.x, pointer.y);\r
      ripples.push({ x, y, age: 0 });\r
      if (ripples.length > MAX_RIPPLES) ripples.shift();\r
      wake();\r
    };\r
\r
    const onPointerUp = (event: PointerEvent) => {\r
      if (event.pointerType !== 'mouse') pointer.inside = false;\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
    };\r
\r
    const onVisibility = () => {\r
      last = 0;\r
      wake();\r
    };\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(container);\r
    const intersection = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible) {\r
        last = 0;\r
        wake();\r
      }\r
    });\r
    intersection.observe(container);\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    window.addEventListener('pointerup', onPointerUp, { passive: true });\r
    window.addEventListener('pointercancel', onPointerUp, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
\r
    let lastDpr = settingsRef.current.dpr;\r
    wakeRef.current = () => {\r
      const s = settingsRef.current;\r
      if (s.dpr !== lastDpr) {\r
        lastDpr = s.dpr;\r
        resize();\r
        return;\r
      }\r
      if (!raf) render();\r
      wake();\r
    };\r
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
      gl.deleteProgram(wave.program);\r
      gl.deleteProgram(dither.program);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteTexture(field);\r
      gl.deleteFramebuffer(framebuffer);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div ref={containerRef} className={\`dither-container\${className ? \` \${className}\` : ''}\`} style={style}>\r
      <canvas ref={canvasRef} className="dither-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Dither;\r
`,o=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties } from 'react';\r
\r
export type DitherColor = string | [number, number, number];\r
export type DitherMode = 'bayer' | 'bayer4' | 'bayer2' | 'halftone' | 'lines' | 'crosshatch' | 'noise' | 'none';\r
export type DitherMouseEffect = 'erase' | 'reveal' | 'ripple';\r
\r
export interface DitherProps {\r
  waveSpeed?: number;\r
  waveFrequency?: number;\r
  waveAmplitude?: number;\r
  waveColor?: DitherColor;\r
  backgroundColor?: DitherColor;\r
  colorNum?: number;\r
  pixelSize?: number;\r
  disableAnimation?: boolean;\r
  enableMouseInteraction?: boolean;\r
  mouseRadius?: number;\r
  ditherMode?: DitherMode;\r
  palette?: string[];\r
  scale?: number;\r
  contrast?: number;\r
  brightness?: number;\r
  mouseEffect?: DitherMouseEffect;\r
  mouseStrength?: number;\r
  trail?: number;\r
  clickRipple?: boolean;\r
  intro?: boolean;\r
  dpr?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
type Settings = {\r
  waveSpeed: number;\r
  waveFrequency: number;\r
  waveAmplitude: number;\r
  waveColor: DitherColor;\r
  backgroundColor: DitherColor;\r
  colorNum: number;\r
  pixelSize: number;\r
  disableAnimation: boolean;\r
  enableMouseInteraction: boolean;\r
  mouseRadius: number;\r
  mode: number;\r
  palette: string[];\r
  scale: number;\r
  contrast: number;\r
  brightness: number;\r
  effect: number;\r
  mouseStrength: number;\r
  trail: number;\r
  clickRipple: boolean;\r
  intro: boolean;\r
  dpr?: number;\r
};\r
\r
type TrailPoint = { x: number; y: number; weight: number };\r
\r
type Ripple = { x: number; y: number; age: number };\r
\r
type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };\r
\r
const MODES: Record<string, number> = {\r
  bayer: 0,\r
  bayer4: 1,\r
  bayer2: 2,\r
  halftone: 3,\r
  lines: 4,\r
  crosshatch: 5,\r
  noise: 6,\r
  none: 7\r
};\r
const EFFECTS: Record<string, number> = { erase: 0, reveal: 1, ripple: 2 };\r
const MAX_TRAIL = 16;\r
const MAX_RIPPLES = 4;\r
const MAX_PALETTE = 8;\r
const INTRO_SECONDS = 1.8;\r
const RIPPLE_SECONDS = 1.6;\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const WAVE_FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform vec2 uResolution;\r
uniform float uCell;\r
uniform float uTime;\r
uniform float uWaveSpeed;\r
uniform float uWaveFrequency;\r
uniform float uWaveAmplitude;\r
uniform float uScale;\r
uniform float uContrast;\r
uniform float uBrightness;\r
uniform int uEffect;\r
uniform float uRadius;\r
uniform float uStrength;\r
uniform vec3 uTrail[\${MAX_TRAIL}];\r
uniform int uTrailCount;\r
uniform vec4 uRipples[\${MAX_RIPPLES}];\r
uniform int uRippleCount;\r
uniform float uIntro;\r
uniform float uReach;\r
out vec4 outColor;\r
\r
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }\r
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }\r
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }\r
vec2 fade(vec2 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }\r
\r
float cnoise(vec2 P) {\r
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);\r
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);\r
  Pi = mod289(Pi);\r
  vec4 ix = Pi.xzxz;\r
  vec4 iy = Pi.yyww;\r
  vec4 fx = Pf.xzxz;\r
  vec4 fy = Pf.yyww;\r
  vec4 i = permute(permute(ix) + iy);\r
  vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0;\r
  vec4 gy = abs(gx) - 0.5;\r
  vec4 tx = floor(gx + 0.5);\r
  gx = gx - tx;\r
  vec2 g00 = vec2(gx.x, gy.x);\r
  vec2 g10 = vec2(gx.y, gy.y);\r
  vec2 g01 = vec2(gx.z, gy.z);\r
  vec2 g11 = vec2(gx.w, gy.w);\r
  vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));\r
  g00 *= norm.x;\r
  g01 *= norm.y;\r
  g10 *= norm.z;\r
  g11 *= norm.w;\r
  float n00 = dot(g00, vec2(fx.x, fy.x));\r
  float n10 = dot(g10, vec2(fx.y, fy.y));\r
  float n01 = dot(g01, vec2(fx.z, fy.z));\r
  float n11 = dot(g11, vec2(fx.w, fy.w));\r
  vec2 fadeXY = fade(Pf.xy);\r
  vec2 nx = mix(vec2(n00, n01), vec2(n10, n11), fadeXY.x);\r
  return 2.3 * mix(nx.x, nx.y, fadeXY.y);\r
}\r
\r
float fbm(vec2 p) {\r
  float value = 0.0;\r
  float amp = 1.0;\r
  for (int i = 0; i < 4; i++) {\r
    value += amp * abs(cnoise(p));\r
    p *= uWaveFrequency;\r
    amp *= uWaveAmplitude;\r
  }\r
  return value;\r
}\r
\r
float pattern(vec2 p) {\r
  vec2 p2 = p - uTime * uWaveSpeed;\r
  return fbm(p + fbm(p2));\r
}\r
\r
void main() {\r
  vec2 corner = (gl_FragCoord.xy - 0.5) * uCell;\r
  vec2 uv = corner / uResolution - 0.5;\r
  uv.x *= uResolution.x / uResolution.y;\r
\r
  float touch = 0.0;\r
  for (int i = 0; i < \${MAX_TRAIL}; i++) {\r
    if (i >= uTrailCount) break;\r
    vec3 point = uTrail[i];\r
    float reach = uRadius * mix(0.55, 1.0, point.z);\r
    touch = max(touch, point.z * (1.0 - smoothstep(0.0, reach, length(uv - point.xy))));\r
  }\r
\r
  vec2 warp = vec2(0.0);\r
  float ring = 0.0;\r
  for (int i = 0; i < \${MAX_RIPPLES}; i++) {\r
    if (i >= uRippleCount) break;\r
    vec4 ripple = uRipples[i];\r
    vec2 delta = uv - ripple.xy;\r
    float dist = length(delta);\r
    float life = clamp(ripple.z / \${RIPPLE_SECONDS.toFixed(2)}, 0.0, 1.0);\r
    float wave = exp(-pow((dist - ripple.z * 0.9) / 0.07, 2.0)) * (1.0 - life) * (1.0 - life) * ripple.w;\r
    warp += (dist > 0.0001 ? delta / dist : vec2(0.0)) * wave * 0.035;\r
    ring += wave;\r
  }\r
\r
  if (uEffect == 2 && touch > 0.0) {\r
    vec3 head = uTrail[0];\r
    vec2 delta = uv - head.xy;\r
    float dist = length(delta);\r
    warp += (dist > 0.0001 ? delta / dist : vec2(0.0)) * sin(dist / max(uRadius, 0.001) * 16.0 - uTime * 7.0) * 0.04 * touch * uStrength;\r
  }\r
\r
  float f = pattern((uv + warp) / uScale);\r
  if (uEffect == 0) f -= 0.5 * touch * uStrength;\r
  if (uEffect == 1) f += 0.5 * touch * uStrength;\r
  f += ring * 0.55;\r
  f = (f - 0.5) * uContrast + 0.5 + uBrightness;\r
  float show = clamp((uIntro * uReach - length(uv)) / 0.45, 0.0, 1.0);\r
  float v = clamp(f, 0.0, 1.0) * show * show * (3.0 - 2.0 * show);\r
  outColor = vec4(floor(v * 255.0) / 255.0, fract(v * 255.0), 0.0, 1.0);\r
}\`;\r
\r
const DITHER_FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform sampler2D uField;\r
uniform ivec2 uFieldSize;\r
uniform float uCellDevice;\r
uniform int uMode;\r
uniform float uColorNum;\r
uniform vec3 uWave;\r
uniform vec3 uBackground;\r
uniform vec3 uPalette[\${MAX_PALETTE}];\r
uniform int uPaletteCount;\r
uniform float uTransparent;\r
out vec4 outColor;\r
\r
const float bayer8[64] = float[64](\r
  0.0 / 64.0, 48.0 / 64.0, 12.0 / 64.0, 60.0 / 64.0, 3.0 / 64.0, 51.0 / 64.0, 15.0 / 64.0, 63.0 / 64.0,\r
  32.0 / 64.0, 16.0 / 64.0, 44.0 / 64.0, 28.0 / 64.0, 35.0 / 64.0, 19.0 / 64.0, 47.0 / 64.0, 31.0 / 64.0,\r
  8.0 / 64.0, 56.0 / 64.0, 4.0 / 64.0, 52.0 / 64.0, 11.0 / 64.0, 59.0 / 64.0, 7.0 / 64.0, 55.0 / 64.0,\r
  40.0 / 64.0, 24.0 / 64.0, 36.0 / 64.0, 20.0 / 64.0, 43.0 / 64.0, 27.0 / 64.0, 39.0 / 64.0, 23.0 / 64.0,\r
  2.0 / 64.0, 50.0 / 64.0, 14.0 / 64.0, 62.0 / 64.0, 1.0 / 64.0, 49.0 / 64.0, 13.0 / 64.0, 61.0 / 64.0,\r
  34.0 / 64.0, 18.0 / 64.0, 46.0 / 64.0, 30.0 / 64.0, 33.0 / 64.0, 17.0 / 64.0, 45.0 / 64.0, 29.0 / 64.0,\r
  10.0 / 64.0, 58.0 / 64.0, 6.0 / 64.0, 54.0 / 64.0, 9.0 / 64.0, 57.0 / 64.0, 5.0 / 64.0, 53.0 / 64.0,\r
  42.0 / 64.0, 26.0 / 64.0, 38.0 / 64.0, 22.0 / 64.0, 41.0 / 64.0, 25.0 / 64.0, 37.0 / 64.0, 21.0 / 64.0\r
);\r
\r
const float bayer4[16] = float[16](\r
  0.0 / 16.0, 8.0 / 16.0, 2.0 / 16.0, 10.0 / 16.0,\r
  12.0 / 16.0, 4.0 / 16.0, 14.0 / 16.0, 6.0 / 16.0,\r
  3.0 / 16.0, 11.0 / 16.0, 1.0 / 16.0, 9.0 / 16.0,\r
  15.0 / 16.0, 7.0 / 16.0, 13.0 / 16.0, 5.0 / 16.0\r
);\r
\r
const float bayer2[4] = float[4](0.0 / 4.0, 2.0 / 4.0, 3.0 / 4.0, 1.0 / 4.0);\r
\r
float threshold(vec2 cell) {\r
  if (uMode == 1) {\r
    ivec2 c = ivec2(mod(cell, 4.0));\r
    return bayer4[c.y * 4 + c.x];\r
  }\r
  if (uMode == 2) {\r
    ivec2 c = ivec2(mod(cell, 2.0));\r
    return bayer2[c.y * 2 + c.x];\r
  }\r
  if (uMode == 3) {\r
    vec2 r = vec2(cell.x + cell.y, cell.x - cell.y) * 0.70710678 / 4.0;\r
    return clamp(length(fract(r) - 0.5) * 1.41421356, 0.0, 0.999);\r
  }\r
  if (uMode == 4) {\r
    return abs(fract(cell.y / 4.0) - 0.5) * 2.0 * 0.999;\r
  }\r
  if (uMode == 5) {\r
    float a = abs(fract((cell.x + cell.y) / 6.0) - 0.5) * 2.0;\r
    float b = abs(fract((cell.x - cell.y) / 6.0) - 0.5) * 2.0;\r
    return min(a, b) * 0.999;\r
  }\r
  if (uMode == 6) {\r
    return fract(52.9829189 * fract(dot(cell, vec2(0.06711056, 0.00583715))));\r
  }\r
  if (uMode == 7) {\r
    return 0.25;\r
  }\r
  ivec2 c = ivec2(mod(cell, 8.0));\r
  return bayer8[c.y * 8 + c.x];\r
}\r
\r
vec3 toSrgb(vec3 c) {\r
  c = clamp(c, 0.0, 1.0);\r
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));\r
}\r
\r
void main() {\r
  vec2 cell = floor(gl_FragCoord.xy / uCellDevice);\r
  vec4 sampleValue = texelFetch(uField, clamp(ivec2(cell), ivec2(0), uFieldSize - 1), 0);\r
  float f = sampleValue.r + sampleValue.g / 255.0;\r
  float t = threshold(cell) - 0.25;\r
\r
  if (uPaletteCount > 1) {\r
    float n = float(uPaletteCount);\r
    float v = f + t / (n - 1.0);\r
    v = clamp(v - mix(0.2, 0.0, smoothstep(0.45, 0.8, v)), 0.0, 1.0);\r
    int index = int(floor(v * (n - 1.0) + 0.5));\r
    outColor = vec4(toSrgb(uPalette[index]), 1.0);\r
    return;\r
  }\r
\r
  float levels = max(uColorNum, 1.01) - 1.0;\r
  if (uTransparent > 0.5) {\r
    float v = f + t / levels;\r
    v = clamp(v - mix(0.2, 0.0, smoothstep(0.45, 0.8, v)), 0.0, 1.0);\r
    float a = floor(v * levels + 0.5) / levels;\r
    outColor = vec4(toSrgb(uWave) * a, a);\r
    return;\r
  }\r
\r
  float base = dot(uBackground, vec3(0.2126, 0.7152, 0.0722));\r
  vec3 offset = (uWave - vec3(base)) * f + t / levels;\r
  float luminance = dot(uBackground + offset, vec3(0.2126, 0.7152, 0.0722));\r
  offset -= mix(0.2, 0.0, smoothstep(0.45, 0.8, luminance));\r
  bool rising = dot(uWave, vec3(0.2126, 0.7152, 0.0722)) >= base;\r
  float lower = rising ? 0.0 : -max(uBackground.r, max(uBackground.g, uBackground.b));\r
  float upper = rising ? 1.0 - min(uBackground.r, min(uBackground.g, uBackground.b)) : 0.0;\r
  offset = floor(clamp(offset, lower, upper) * levels + 0.5) / levels;\r
  outColor = vec4(toSrgb(uBackground + offset), 1.0);\r
}\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
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
const link = (gl: WebGL2RenderingContext, fragmentSource: string): Program | null => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);\r
  const program = gl.createProgram();\r
  if (!vertex || !fragment || !program) return null;\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
  gl.bindAttribLocation(program, 0, 'aPosition');\r
  gl.linkProgram(program);\r
  gl.deleteShader(vertex);\r
  gl.deleteShader(fragment);\r
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {\r
    gl.deleteProgram(program);\r
    return null;\r
  }\r
  const uniforms: Record<string, WebGLUniformLocation | null> = {};\r
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
  for (let i = 0; i < count; i++) {\r
    const info = gl.getActiveUniform(program, i);\r
    if (info) uniforms[info.name.replace('[0]', '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const toLinear = (value: number) => (value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4));\r
\r
const Dither = ({\r
  waveSpeed = 0.05,\r
  waveFrequency = 3,\r
  waveAmplitude = 0.3,\r
  waveColor = [0.5, 0.5, 0.5],\r
  backgroundColor = [0, 0, 0],\r
  colorNum = 4,\r
  pixelSize = 2,\r
  disableAnimation = false,\r
  enableMouseInteraction = true,\r
  mouseRadius = 1,\r
  ditherMode = 'bayer',\r
  palette,\r
  scale = 1,\r
  contrast = 1,\r
  brightness = 0,\r
  mouseEffect = 'erase',\r
  mouseStrength = 1,\r
  trail = 0.5,\r
  clickRipple = true,\r
  intro = true,\r
  dpr,\r
  className = '',\r
  style\r
}: DitherProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings: Settings = {\r
    waveSpeed,\r
    waveFrequency,\r
    waveAmplitude,\r
    waveColor,\r
    backgroundColor,\r
    colorNum: Math.max(2, colorNum),\r
    pixelSize: Math.max(1, pixelSize),\r
    disableAnimation,\r
    enableMouseInteraction,\r
    mouseRadius: Math.max(0.001, mouseRadius),\r
    mode: MODES[ditherMode] ?? 0,\r
    palette: Array.isArray(palette) ? palette.filter(Boolean).slice(0, MAX_PALETTE) : [],\r
    scale: Math.max(0.05, scale),\r
    contrast,\r
    brightness,\r
    effect: EFFECTS[mouseEffect] ?? 0,\r
    mouseStrength: Math.max(0, mouseStrength),\r
    trail: clamp(trail, 0, 1),\r
    clickRipple,\r
    intro,\r
    dpr\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    const gl = canvas?.getContext('webgl2', {\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const wave = link(gl, WAVE_FRAGMENT);\r
    const dither = link(gl, DITHER_FRAGMENT);\r
    if (!wave || !dither) return undefined;\r
\r
    const buffer = gl.createBuffer();\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const field = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, field);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    const framebuffer = gl.createFramebuffer();\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const cache = new Map<string, number[]>();\r
    const toColor = (value: DitherColor): number[] => {\r
      if (Array.isArray(value)) return [0, 1, 2].map(i => clamp(Number(value[i]) || 0, 0, 1));\r
      const key = String(value);\r
      const cached = cache.get(key);\r
      if (cached) return cached;\r
      let rgb = [0, 0, 0];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#000000';\r
        probe.fillStyle = key;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r, g, b].map(channel => toLinear(channel / 255));\r
      }\r
      cache.set(key, rgb);\r
      return rgb;\r
    };\r
\r
    const view = { width: 1, height: 1, ratio: 1, cell: 1, cellCss: 1, cols: 1, rows: 1 };\r
    const pointer = { x: 0, y: 0, inside: false, set: false };\r
    const trailPoints: TrailPoint[] = [];\r
    const ripples: Ripple[] = [];\r
    const trailData = new Float32Array(MAX_TRAIL * 3);\r
    const rippleData = new Float32Array(MAX_RIPPLES * 4);\r
    const paletteData = new Float32Array(MAX_PALETTE * 3);\r
    const state = {\r
      time: 0,\r
      hx: 0,\r
      hy: 0,\r
      presence: 0,\r
      reveal: settingsRef.current.intro && !reduce ? 0 : 1\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const allocate = () => {\r
      const s = settingsRef.current;\r
      view.cell = Math.max(1, Math.round(s.pixelSize * view.ratio));\r
      view.cellCss = view.cell / view.ratio;\r
      view.cols = Math.max(1, Math.ceil(canvas.width / view.cell));\r
      view.rows = Math.max(1, Math.ceil(canvas.height / view.cell));\r
      gl.bindTexture(gl.TEXTURE_2D, field);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, view.cols, view.rows, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, field, 0);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
    };\r
\r
    const toUv = (x: number, y: number): [number, number] => {\r
      const aspect = view.width / view.height;\r
      return [(x / view.width - 0.5) * aspect, -(y / view.height - 0.5)];\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const expected = Math.max(1, Math.round(s.pixelSize * view.ratio));\r
      if (expected !== view.cell) allocate();\r
\r
      let trailCount = 0;\r
      for (let i = 0; i < trailPoints.length && trailCount < MAX_TRAIL; i++) {\r
        const point = trailPoints[i];\r
        if (point.weight <= 0.01) continue;\r
        trailData.set([point.x, point.y, point.weight], trailCount * 3);\r
        trailCount++;\r
      }\r
      let rippleCount = 0;\r
      for (let i = ripples.length - 1; i >= 0 && rippleCount < MAX_RIPPLES; i--) {\r
        rippleData.set([ripples[i].x, ripples[i].y, ripples[i].age, 1], rippleCount * 4);\r
        rippleCount++;\r
      }\r
\r
      const eased = s.intro && !reduce ? state.reveal * state.reveal * (3 - 2 * state.reveal) : 1;\r
\r
      gl.bindVertexArray(vao);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.viewport(0, 0, view.cols, view.rows);\r
      gl.useProgram(wave.program);\r
      const w = wave.uniforms;\r
      gl.uniform2f(w.uResolution, canvas.width / view.ratio, canvas.height / view.ratio);\r
      gl.uniform1f(w.uCell, view.cellCss);\r
      gl.uniform1f(w.uTime, state.time);\r
      gl.uniform1f(w.uWaveSpeed, s.waveSpeed);\r
      gl.uniform1f(w.uWaveFrequency, s.waveFrequency);\r
      gl.uniform1f(w.uWaveAmplitude, s.waveAmplitude);\r
      gl.uniform1f(w.uScale, s.scale);\r
      gl.uniform1f(w.uContrast, s.contrast);\r
      gl.uniform1f(w.uBrightness, s.brightness);\r
      gl.uniform1i(w.uEffect, s.effect);\r
      gl.uniform1f(w.uRadius, s.mouseRadius);\r
      gl.uniform1f(w.uStrength, s.mouseStrength);\r
      gl.uniform3fv(w.uTrail, trailData);\r
      gl.uniform1i(w.uTrailCount, trailCount);\r
      gl.uniform4fv(w.uRipples, rippleData);\r
      gl.uniform1i(w.uRippleCount, rippleCount);\r
      gl.uniform1f(w.uIntro, eased);\r
      gl.uniform1f(w.uReach, 0.5 * Math.hypot(view.width / view.height, 1) + 0.45);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(dither.program);\r
      const d = dither.uniforms;\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, field);\r
      gl.uniform1i(d.uField, 0);\r
      gl.uniform2i(d.uFieldSize, view.cols, view.rows);\r
      gl.uniform1f(d.uCellDevice, view.cell);\r
      gl.uniform1i(d.uMode, s.mode);\r
      gl.uniform1f(d.uColorNum, s.colorNum);\r
      gl.uniform3fv(d.uWave, toColor(s.waveColor));\r
      const transparent = s.backgroundColor === 'transparent';\r
      gl.uniform3fv(d.uBackground, transparent ? [0, 0, 0] : toColor(s.backgroundColor));\r
      gl.uniform1f(d.uTransparent, transparent ? 1 : 0);\r
      s.palette.forEach((value, index) => paletteData.set(toColor(value), index * 3));\r
      gl.uniform3fv(d.uPalette, paletteData);\r
      gl.uniform1i(d.uPaletteCount, s.palette.length);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.0005, 0.05) : 1 / 60;\r
      last = now;\r
      if (!s.disableAnimation && !reduce) state.time += dt;\r
\r
      const engaged = s.enableMouseInteraction && pointer.inside && !reduce;\r
      state.presence += ((engaged ? 1 : 0) - state.presence) * (1 - Math.exp(-dt / (engaged ? 0.12 : 0.35)));\r
      if (pointer.set) {\r
        const [tx, ty] = toUv(pointer.x, pointer.y);\r
        const follow = 1 - Math.exp(-dt / 0.06);\r
        const moved = Math.hypot(tx - state.hx, ty - state.hy);\r
        state.hx += (tx - state.hx) * follow;\r
        state.hy += (ty - state.hy) * follow;\r
        const decay = Math.exp(-dt / (0.08 + s.trail * 0.7));\r
        trailPoints.forEach(point => {\r
          point.weight *= decay;\r
        });\r
        const head = trailPoints[0];\r
        if (!head || Math.hypot(head.x - state.hx, head.y - state.hy) > 0.012 || moved > 0.012) {\r
          trailPoints.unshift({ x: state.hx, y: state.hy, weight: state.presence });\r
        } else {\r
          head.x = state.hx;\r
          head.y = state.hy;\r
          head.weight = state.presence;\r
        }\r
        if (s.trail <= 0.001) trailPoints.length = Math.min(trailPoints.length, 1);\r
        while (\r
          trailPoints.length > MAX_TRAIL ||\r
          (trailPoints.length > 1 && trailPoints[trailPoints.length - 1].weight < 0.01)\r
        ) {\r
          trailPoints.pop();\r
        }\r
      }\r
\r
      for (let i = ripples.length - 1; i >= 0; i--) {\r
        ripples[i].age += dt;\r
        if (ripples[i].age >= RIPPLE_SECONDS) ripples.splice(i, 1);\r
      }\r
\r
      if (!s.intro || reduce) state.reveal = 1;\r
      else if (state.reveal < 1) state.reveal = Math.min(1, state.reveal + dt / INTRO_SECONDS);\r
\r
      render();\r
      const busy =\r
        !s.disableAnimation ||\r
        state.reveal < 1 ||\r
        ripples.length > 0 ||\r
        state.presence > 0.002 ||\r
        trailPoints.some(point => point.weight > 0.01);\r
      if (busy && !reduce) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      view.width = width;\r
      view.height = height;\r
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      view.ratio = canvas.width / width;\r
      allocate();\r
      render();\r
      wake();\r
    };\r
\r
    const locate = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      pointer.x = event.clientX - rect.left;\r
      pointer.y = event.clientY - rect.top;\r
      pointer.inside = pointer.x >= 0 && pointer.y >= 0 && pointer.x <= rect.width && pointer.y <= rect.height;\r
      if (pointer.inside && !pointer.set) {\r
        const [x, y] = toUv(pointer.x, pointer.y);\r
        state.hx = x;\r
        state.hy = y;\r
        pointer.set = true;\r
      }\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      locate(event);\r
      wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      locate(event);\r
      if (!pointer.inside || !s.clickRipple || reduce) return;\r
      const [x, y] = toUv(pointer.x, pointer.y);\r
      ripples.push({ x, y, age: 0 });\r
      if (ripples.length > MAX_RIPPLES) ripples.shift();\r
      wake();\r
    };\r
\r
    const onPointerUp = (event: PointerEvent) => {\r
      if (event.pointerType !== 'mouse') pointer.inside = false;\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
    };\r
\r
    const onVisibility = () => {\r
      last = 0;\r
      wake();\r
    };\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(container);\r
    const intersection = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible) {\r
        last = 0;\r
        wake();\r
      }\r
    });\r
    intersection.observe(container);\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    window.addEventListener('pointerup', onPointerUp, { passive: true });\r
    window.addEventListener('pointercancel', onPointerUp, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
\r
    let lastDpr = settingsRef.current.dpr;\r
    wakeRef.current = () => {\r
      const s = settingsRef.current;\r
      if (s.dpr !== lastDpr) {\r
        lastDpr = s.dpr;\r
        resize();\r
        return;\r
      }\r
      if (!raf) render();\r
      wake();\r
    };\r
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
      gl.deleteProgram(wave.program);\r
      gl.deleteProgram(dither.program);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteTexture(field);\r
      gl.deleteFramebuffer(framebuffer);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div\r
      ref={containerRef}\r
      className={['relative h-full w-full overflow-hidden', className].filter(Boolean).join(' ')}\r
      style={style}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Dither;\r
`,i={usage:`import Dither from './Dither';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <Dither
    waveColor="#bcbcbc"
    backgroundColor="#120f17"
    ditherMode="bayer"
    colorNum={4}
    pixelSize={2}
    waveSpeed={0.05}
    waveFrequency={3}
    waveAmplitude={0.3}
    mouseEffect="erase"
    mouseRadius={0.3}
  />
</div>`,code:r,css:n,tailwind:e,tsCode:t,tsTailwind:o};export{i as dither};
