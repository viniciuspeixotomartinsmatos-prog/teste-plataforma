const r=`'use client';\r
\r
import { useEffect, useMemo, useRef } from 'react';\r
import './CRTWarp.css';\r
\r
const ROOT = 'crt-warp-container';\r
const CANVAS = 'crt-warp-canvas';\r
\r
const MASKS = { none: 0, aperture: 1, shadow: 2, slot: 3 };\r
const CELL_ASPECT = 0.56;\r
const INTRO_SECONDS = 1.6;\r
const FLIP_SECONDS = 0.8;\r
const TAU = Math.PI * 2;\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const CONTENT = \`#version 300 es\r
precision highp float;\r
uniform vec2 uGrid;\r
uniform float uTime;\r
uniform float uAmplitude;\r
uniform float uFrequency;\r
uniform float uLevels;\r
uniform float uDecay;\r
uniform float uReveal;\r
uniform float uRise;\r
uniform vec4 uSeed;\r
uniform sampler2D uPrevious;\r
out vec4 outColor;\r
\r
float field(vec2 uv, float t) {\r
  uv = (uv - 0.5) * uFrequency + 0.5;\r
  float f = 0.0;\r
  f += 0.7 * sin(0.5 * uv.x + t / 5.0 + uSeed.x);\r
  f += 3.0 * sin(1.6 * uv.y + t / 5.0 + uSeed.y);\r
  f += sin(10.0 * (uv.y * sin(t / 2.0 + uSeed.z) + uv.x * cos(t / 5.0)) + t / 2.0);\r
  float cx = uv.x + 0.5 * sin(t / 2.0 + uSeed.w);\r
  float cy = uv.y + 0.5 * cos(t / 4.0 + uSeed.x * 0.7);\r
  f += 0.4 * sin(sqrt(100.0 * cx * cx + 100.0 * cy * cy + 1.0) + t);\r
  f += 0.9 * sin(sqrt(75.0 * cx * cx + 25.0 * cy * cy + 1.0) + t);\r
  f -= 1.4 * sin(sqrt(256.0 * cx * cx + 25.0 * cy * cy + 1.0) + t);\r
  f += 0.3 * sin(0.5 * uv.y + uv.x + sin(t));\r
  return f;\r
}\r
\r
void main() {\r
  vec2 cell = floor(gl_FragCoord.xy);\r
  vec2 uv = (cell + 0.5) / uGrid;\r
  float s = (0.5 + 0.499 * sin(field(uv, uTime) * uAmplitude)) * mix(1.0 / uLevels, 1.0, uReveal);\r
  float level = floor(s * uLevels) / max(uLevels - 1.0, 1.0);\r
  float previous = texelFetch(uPrevious, ivec2(cell), 0).r;\r
  float lifted = min(level, previous + uRise);\r
  outColor = vec4(max(lifted, previous * uDecay - 0.004), level, 0.0, 1.0);\r
}\`;\r
\r
const GLOW = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uContent;\r
uniform vec2 uSize;\r
out vec4 outColor;\r
\r
void main() {\r
  float v = texture(uContent, gl_FragCoord.xy / uSize).r;\r
  outColor = vec4(v * v, 0.0, 0.0, 1.0);\r
}\`;\r
\r
const BLUR = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uSource;\r
uniform vec2 uSize;\r
uniform vec2 uDirection;\r
uniform float uSigma;\r
out vec4 outColor;\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uSize;\r
  float stride = max(uSigma * 0.55, 0.5);\r
  float total = 0.0;\r
  float sum = 0.0;\r
  for (int i = -7; i <= 7; i++) {\r
    float x = float(i) * stride;\r
    float w = exp(-0.5 * x * x / (uSigma * uSigma));\r
    sum += texture(uSource, uv + uDirection * x / uSize).r * w;\r
    total += w;\r
  }\r
  outColor = vec4(sum / total, 0.0, 0.0, 1.0);\r
}\`;\r
\r
const DISPLAY = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uContent;\r
uniform sampler2D uGlow;\r
uniform vec2 uGrid;\r
uniform vec2 uResolution;\r
uniform float uPixel;\r
uniform float uTime;\r
uniform vec3 uColor;\r
uniform vec3 uBackground;\r
uniform float uOpaque;\r
uniform float uLight;\r
uniform float uLines;\r
uniform float uScanline;\r
uniform float uCurve;\r
uniform float uCorners;\r
uniform int uMaskType;\r
uniform float uMask;\r
uniform float uBloom;\r
uniform float uBrightness;\r
uniform float uNoise;\r
uniform float uFlicker;\r
uniform float uInterference;\r
uniform float uVignette;\r
uniform float uShift;\r
uniform float uWarm;\r
uniform float uFocus;\r
uniform float uStatic;\r
uniform float uRoll;\r
uniform float uTear;\r
uniform float uGain;\r
uniform vec4 uMagnet;\r
uniform float uPurity;\r
out vec4 outColor;\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
vec2 curve(vec2 uv) {\r
  if (uCurve <= 0.0) return uv;\r
  vec2 p = (uv - 0.5) * 2.0;\r
  float corner = uCurve / sqrt(max(uCurve * uCurve - 2.0, 0.001));\r
  p = uCurve * p / sqrt(max(uCurve * uCurve - dot(p, p), 0.001));\r
  p /= corner;\r
  return p * 0.5 + 0.5;\r
}\r
\r
float lineValue(float x, float y) {\r
  if (x < 0.0 || x > 1.0 || y < 0.0 || y > 1.0) return 0.0;\r
  float cx = x * uGrid.x - 0.5;\r
  float c0 = floor(cx);\r
  int row = int(clamp(floor(y * uGrid.y), 0.0, uGrid.y - 1.0));\r
  float a = texelFetch(uContent, ivec2(int(clamp(c0, 0.0, uGrid.x - 1.0)), row), 0).r;\r
  float b = texelFetch(uContent, ivec2(int(clamp(c0 + 1.0, 0.0, uGrid.x - 1.0)), row), 0).r;\r
  float soft = mix(0.5, 0.14, uFocus);\r
  return pow(mix(a, b, smoothstep(0.5 - soft, 0.5 + soft, cx - c0)), 1.25);\r
}\r
\r
float beam(vec2 uv) {\r
  float ly = uv.y * uLines - 0.5;\r
  float r0 = floor(ly);\r
  float f = ly - r0;\r
  float a = lineValue(uv.x, (r0 + 0.5) / uLines);\r
  float b = lineValue(uv.x, (r0 + 1.5) / uLines);\r
  float nearest = f < 0.5 ? a : b;\r
  float sa = mix(0.16, 0.34, sqrt(a));\r
  float sb = mix(0.16, 0.34, sqrt(b));\r
  float lit = a * exp(-0.5 * f * f / (sa * sa)) + b * exp(-0.5 * (1.0 - f) * (1.0 - f) / (sb * sb));\r
  return mix(nearest, lit * 1.18, uScanline * mix(0.3, 1.0, uFocus));\r
}\r
\r
vec3 maskAt(vec2 px) {\r
  if (uMaskType == 0 || uMask <= 0.0) return vec3(1.0);\r
  float size = max(1.0, floor(uPixel + 0.5));\r
  vec2 q = floor(px / size);\r
  float low = 1.0 - uMask;\r
  vec3 m = vec3(low);\r
  float column = q.x;\r
  if (uMaskType == 2) column += mod(floor(q.y / 2.0), 2.0) * 1.5;\r
  int stripe = int(mod(floor(column), 3.0));\r
  if (stripe == 0) m.r = 1.0;\r
  else if (stripe == 1) m.g = 1.0;\r
  else m.b = 1.0;\r
  if (uMaskType == 2 && mod(q.y, 2.0) > 0.5) m *= mix(1.0, 0.72, uMask);\r
  if (uMaskType == 3) {\r
    float slot = mod(q.y + mod(floor(q.x / 3.0), 2.0) * 2.0, 4.0);\r
    if (slot < 1.0) m *= mix(1.0, 0.45, uMask);\r
  }\r
  return m / sqrt((1.0 + 2.0 * low) / 3.0);\r
}\r
\r
vec3 phosphor(vec3 cov) {\r
  float peak = max(max(uColor.r, uColor.g), max(uColor.b, 0.001));\r
  vec3 weight = 1.0 - uColor / peak;\r
  return uColor * cov * pow(max(cov, vec3(0.0001)), 0.7 * weight);\r
}\r
\r
void main() {\r
  vec2 frag = gl_FragCoord.xy / uResolution;\r
  float aspect = uResolution.x / uResolution.y;\r
  vec2 uv = curve(frag);\r
  float shape = 1.0;\r
  if (uCorners > 0.0) {\r
    float margin = uCorners * 0.035;\r
    float radius = uCorners * 0.1;\r
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0);\r
    vec2 box = (0.5 - margin) * vec2(aspect, 1.0);\r
    vec2 q = abs(p) - box + radius;\r
    float sd = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;\r
    float aa = max(fwidth(sd), 0.0005);\r
    shape = (1.0 - smoothstep(-aa, aa, sd)) * mix(1.0, smoothstep(0.0, 0.06, -sd), 0.35);\r
    uv = (uv - 0.5) / (1.0 - 2.0 * margin) + 0.5;\r
  }\r
  float rolling = step(0.0001, abs(uRoll));\r
  uv.y += uRoll;\r
  float wrapped = fract(uv.y);\r
  uv.y = mix(uv.y, wrapped, rolling);\r
  float offset = fract(uRoll);\r
  float reach = smoothstep(0.0, 0.08, min(offset, 1.0 - offset));\r
  float blank = mix(1.0, smoothstep(0.0, 0.05, wrapped) * smoothstep(1.0, 0.95, wrapped), rolling * reach);\r
\r
  float line = floor(uv.y * uLines);\r
  float tick = floor(uTime * 30.0);\r
  uv.x += uTear * (sin(uv.y * 21.0 + uTime * 37.0) * 0.6 + hash(vec2(line, tick)) - 0.5) * 0.05;\r
  uv.x += uInterference * 0.003 * (hash(vec2(line * 0.37, floor(uTime * 24.0))) - 0.5);\r
\r
  vec2 dp = (frag - uMagnet.xy) * vec2(aspect, 1.0);\r
  float fall = exp(-dot(dp, dp) / max(uMagnet.w * uMagnet.w, 0.0001));\r
  vec2 swirl = vec2(-dp.y, dp.x) / vec2(aspect, 1.0) * fall * uMagnet.z * 0.5;\r
  vec3 spread = mix(vec3(0.85), vec3(1.0, 0.6, 0.2), uPurity);\r
\r
  vec3 level = vec3(\r
    beam(uv + swirl * spread.r + vec2(uShift, 0.0)),\r
    beam(uv + swirl * spread.g),\r
    beam(uv + swirl * spread.b - vec2(uShift, 0.0))\r
  );\r
\r
  float turn = uTime * 0.35;\r
  vec2 axis = vec2(cos(turn), sin(turn));\r
  float lobe = dot(dp, axis) / max(uMagnet.w, 0.0001);\r
  float side = dot(dp, vec2(-axis.y, axis.x)) / max(uMagnet.w, 0.0001);\r
  vec3 purity = vec3(lobe, -0.35 * lobe + 0.6 * side, -lobe);\r
  level *= 1.0 + uPurity * fall * uMagnet.z * 0.9 * purity;\r
\r
  float glow = texture(uGlow, uv).r * uBloom;\r
  float hum = 1.0 - uInterference * 0.24 * smoothstep(0.2, 1.0, 0.5 + 0.5 * sin((frag.y - uTime * 0.09) * 6.2831853));\r
  float flick = 1.0 + uFlicker * 0.1 * (hash(vec2(floor(uTime * 60.0), 7.3)) - 0.5);\r
  float grain = hash(gl_FragCoord.xy + fract(uTime) * 173.0) - 0.5;\r
  vec2 v = frag - 0.5;\r
  float vignette = mix(1.0, smoothstep(0.0, 1.0, clamp(1.0 - dot(v, v) * 2.0, 0.0, 1.0)), uVignette);\r
  float gain = uBrightness * hum * flick * vignette * blank * uGain * uWarm;\r
\r
  float noise = hash(floor(gl_FragCoord.xy / (uPixel * 1.5)) + fract(uTime * 13.7) * 91.0);\r
  level = mix(level, vec3(noise * noise * 1.15), uStatic);\r
  level *= gain * (1.0 + grain * uNoise * 2.0);\r
  level *= maskAt(gl_FragCoord.xy);\r
  glow *= gain * shape * (1.0 + 0.6 * (1.0 - uFocus));\r
  level *= shape;\r
\r
  vec3 color;\r
  float alpha;\r
  if (uLight < 0.5) {\r
    vec3 cov = clamp(level, 0.0, 1.0);\r
    vec3 light = phosphor(cov) + uColor * glow * 0.5 * (1.0 - cov);\r
    vec3 excess = max(level - 1.1, 0.0);\r
    light += (1.0 - light) * (1.0 - exp(-excess * 0.6));\r
    light = clamp(light, 0.0, 1.0);\r
    color = uBackground + light * (1.0 - uBackground);\r
    alpha = max(max(light.r, light.g), light.b);\r
    if (uOpaque < 0.5) color = light;\r
  } else {\r
    vec3 cov = clamp(level * 0.86, 0.0, 0.88);\r
    cov += clamp(glow * 0.12, 0.0, 0.2) * (1.0 - cov);\r
    color = mix(uBackground, uColor, cov);\r
    alpha = max(max(cov.r, cov.g), cov.b);\r
    if (uOpaque < 0.5) color = uColor * cov;\r
  }\r
  outColor = uOpaque > 0.5 ? vec4(color, 1.0) : vec4(color, alpha);\r
}\`;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const smooth = t => t * t * (3 - 2 * t);\r
\r
const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);\r
\r
let probe = null;\r
\r
const parseColor = (value, fallback) => {\r
  if (value === 'transparent') return null;\r
  if (typeof document === 'undefined') return fallback;\r
  if (!probe) probe = document.createElement('canvas').getContext('2d');\r
  if (!probe) return fallback;\r
  probe.fillStyle = '#000000';\r
  probe.fillStyle = value;\r
  const text = probe.fillStyle;\r
  if (text.startsWith('#')) {\r
    const hex = parseInt(text.slice(1), 16);\r
    return [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255];\r
  }\r
  const match = /rgba?\\(([\\d.]+),\\s*([\\d.]+),\\s*([\\d.]+)(?:,\\s*([\\d.]+))?/.exec(text);\r
  if (!match) return fallback;\r
  if (match[4] !== undefined && Number(match[4]) === 0) return null;\r
  return [Number(match[1]) / 255, Number(match[2]) / 255, Number(match[3]) / 255];\r
};\r
\r
const seedFor = channel => {\r
  const a = Math.sin(channel * 12.9898 + 1.7) * 43758.5453;\r
  const b = Math.sin(channel * 78.233 + 4.1) * 24634.6345;\r
  const c = Math.sin(channel * 37.719 + 2.9) * 17431.7731;\r
  const d = Math.sin(channel * 91.113 + 0.3) * 31337.1337;\r
  const f = v => (v - Math.floor(v)) * TAU;\r
  return channel === 0 ? [0, 0, 0, 0] : [f(a), f(b), f(c), f(d)];\r
};\r
\r
const introAt = t => {\r
  if (t >= INTRO_SECONDS) return [1, 1, 1];\r
  const reveal = smooth(clamp(t / INTRO_SECONDS, 0, 1));\r
  const warm = smooth(clamp(t / 0.6, 0, 1));\r
  const focus = smooth(clamp((t - 0.15) / (INTRO_SECONDS - 0.15), 0, 1));\r
  return [reveal, warm, focus];\r
};\r
\r
const compile = (gl, type, source) => {\r
  const shader = gl.createShader(type);\r
  if (!shader) return null;\r
  gl.shaderSource(shader, source);\r
  gl.compileShader(shader);\r
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {\r
    gl.deleteShader(shader);\r
    return null;\r
  }\r
  return shader;\r
};\r
\r
const createProgram = (gl, fragment, names) => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const shader = compile(gl, gl.FRAGMENT_SHADER, fragment);\r
  if (!vertex || !shader) return null;\r
  const program = gl.createProgram();\r
  if (!program) return null;\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, shader);\r
  gl.bindAttribLocation(program, 0, 'aPosition');\r
  gl.linkProgram(program);\r
  gl.deleteShader(vertex);\r
  gl.deleteShader(shader);\r
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {\r
    gl.deleteProgram(program);\r
    return null;\r
  }\r
  const uniforms = {};\r
  names.forEach(name => {\r
    uniforms[name] = gl.getUniformLocation(program, name);\r
  });\r
  return { program, uniforms };\r
};\r
\r
const createTarget = (gl, width, height) => {\r
  const texture = gl.createTexture();\r
  gl.bindTexture(gl.TEXTURE_2D, texture);\r
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
  const framebuffer = gl.createFramebuffer();\r
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
  gl.clearColor(0, 0, 0, 1);\r
  gl.clear(gl.COLOR_BUFFER_BIT);\r
  return { texture, framebuffer, width, height };\r
};\r
\r
const deleteTarget = (gl, target) => {\r
  if (!target) return;\r
  gl.deleteTexture(target.texture);\r
  gl.deleteFramebuffer(target.framebuffer);\r
};\r
\r
const prefersReduced = () =>\r
  typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);\r
\r
export default function CRTWarp({\r
  color = '#c755f7',\r
  backgroundColor = '#120f17',\r
  lightMode = false,\r
  speed = 0.5,\r
  variation = 0,\r
  waveAmplitude = 0.3,\r
  waveFrequency = 2.5,\r
  levels = 3,\r
  columns = 80,\r
  persistence = 0.4,\r
  curvature = 0.25,\r
  corners = 0,\r
  scanlineStrength = 0.6,\r
  scanlineFrequency = 200,\r
  mask = 'aperture',\r
  maskStrength = 0.3,\r
  bloom = 1.5,\r
  bloomRadius = 1,\r
  rgbShift = 0.003,\r
  noise = 0.1,\r
  flicker = 0.15,\r
  interference = 0.2,\r
  vignette = 0.3,\r
  brightness = 1,\r
  intro = true,\r
  mouseReact = true,\r
  mouseStrength = 0.5,\r
  changeOnClick = true,\r
  dpr = 2,\r
  fps = 60,\r
  paused = false,\r
  className = '',\r
  style\r
}) {\r
  const containerRef = useRef(null);\r
  const ink = useMemo(() => parseColor(color, [0.78, 0.33, 0.97]) ?? [0.78, 0.33, 0.97], [color]);\r
  const paper = useMemo(() => parseColor(backgroundColor, [0.07, 0.06, 0.09]), [backgroundColor]);\r
\r
  const settings = {\r
    ink,\r
    paper,\r
    lightMode,\r
    speed,\r
    variation,\r
    amplitude: Math.max(0, waveAmplitude) / 0.28,\r
    frequency: Math.max(0.01, waveFrequency) / 2.2,\r
    levels: clamp(Math.round(levels), 2, 12),\r
    columns: clamp(Math.round(columns), 8, 400),\r
    persistence: clamp(persistence, 0, 0.98),\r
    curve: curvature > 0.001 ? 1.1 + 0.42 / curvature : 0,\r
    corners: clamp(corners, 0, 1),\r
    scanline: clamp(scanlineStrength, 0, 1),\r
    lines: clamp(scanlineFrequency, 20, 1200),\r
    mask: MASKS[mask] ?? 0,\r
    maskStrength: clamp(maskStrength, 0, 1),\r
    bloom: Math.max(0, bloom),\r
    bloomRadius: Math.max(0.05, bloomRadius),\r
    rgbShift,\r
    noise: Math.max(0, noise),\r
    flicker: Math.max(0, flicker),\r
    interference: Math.max(0, interference),\r
    vignette: clamp(vignette, 0, 1),\r
    brightness: Math.max(0, brightness),\r
    intro,\r
    mouseReact,\r
    mouseStrength: Math.max(0, mouseStrength),\r
    changeOnClick,\r
    dpr: Math.max(0.5, dpr),\r
    fps: Math.max(1, fps),\r
    paused\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    if (!container) return undefined;\r
    const canvas = document.createElement('canvas');\r
    canvas.className = CANVAS;\r
    container.appendChild(canvas);\r
    const gl = canvas.getContext('webgl2', {\r
      alpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false,\r
      premultipliedAlpha: true,\r
      powerPreference: 'high-performance'\r
    });\r
    if (!gl) {\r
      canvas.remove();\r
      return undefined;\r
    }\r
\r
    const content = createProgram(gl, CONTENT, [\r
      'uGrid',\r
      'uTime',\r
      'uAmplitude',\r
      'uFrequency',\r
      'uLevels',\r
      'uDecay',\r
      'uReveal',\r
      'uRise',\r
      'uSeed',\r
      'uPrevious'\r
    ]);\r
    const glowSource = createProgram(gl, GLOW, ['uContent', 'uSize']);\r
    const blur = createProgram(gl, BLUR, ['uSource', 'uSize', 'uDirection', 'uSigma']);\r
    const display = createProgram(gl, DISPLAY, [\r
      'uContent',\r
      'uGlow',\r
      'uGrid',\r
      'uResolution',\r
      'uPixel',\r
      'uTime',\r
      'uColor',\r
      'uBackground',\r
      'uOpaque',\r
      'uLight',\r
      'uLines',\r
      'uScanline',\r
      'uCurve',\r
      'uCorners',\r
      'uMaskType',\r
      'uMask',\r
      'uBloom',\r
      'uBrightness',\r
      'uNoise',\r
      'uFlicker',\r
      'uInterference',\r
      'uVignette',\r
      'uShift',\r
      'uWarm',\r
      'uFocus',\r
      'uStatic',\r
      'uRoll',\r
      'uTear',\r
      'uGain',\r
      'uMagnet',\r
      'uPurity'\r
    ]);\r
    if (!content || !glowSource || !blur || !display) {\r
      canvas.remove();\r
      return undefined;\r
    }\r
\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    const buffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const state = {\r
      width: 1,\r
      height: 1,\r
      pixel: 1,\r
      grid: [0, 0],\r
      cells: [null, null],\r
      glows: [null, null],\r
      flip: 0,\r
      time: 0,\r
      clock: 0,\r
      last: 0,\r
      frame: 0,\r
      raf: 0,\r
      visible: false,\r
      introAt: -1,\r
      flipAt: -1,\r
      flipped: true,\r
      channel: 0,\r
      pointer: [0.5, 0.5],\r
      magnet: [0.5, 0.5, 0, 0, 0],\r
      magnetGoal: 0,\r
      lost: false,\r
      quiet: 0,\r
      seen: null\r
    };\r
\r
    const ensureTargets = () => {\r
      const s = settingsRef.current;\r
      const cols = s.columns;\r
      const rows = clamp(Math.round((cols * CELL_ASPECT * state.height) / Math.max(state.width, 1)), 4, 300);\r
      if (cols !== state.grid[0] || rows !== state.grid[1]) {\r
        state.cells.forEach(target => deleteTarget(gl, target));\r
        state.cells = [createTarget(gl, cols, rows), createTarget(gl, cols, rows)];\r
        state.grid = [cols, rows];\r
      }\r
      const gw = Math.max(1, Math.round(state.width / 4));\r
      const gh = Math.max(1, Math.round(state.height / 4));\r
      const glow = state.glows[0];\r
      if (!glow || glow.width !== gw || glow.height !== gh) {\r
        state.glows.forEach(target => deleteTarget(gl, target));\r
        state.glows = [createTarget(gl, gw, gh), createTarget(gl, gw, gh)];\r
      }\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const ratio = Math.min(window.devicePixelRatio || 1, s.dpr);\r
      const width = Math.max(1, Math.round(container.clientWidth * ratio));\r
      const height = Math.max(1, Math.round(container.clientHeight * ratio));\r
      state.pixel = ratio;\r
      if (width === state.width && height === state.height) return;\r
      state.quiet = 0;\r
      state.width = width;\r
      state.height = height;\r
      canvas.width = width;\r
      canvas.height = height;\r
    };\r
\r
    const draw = (target, width, height) => {\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.framebuffer : null);\r
      gl.viewport(0, 0, width, height);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const bindTexture = (unit, texture, location) => {\r
      gl.activeTexture(gl.TEXTURE0 + unit);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.uniform1i(location, unit);\r
    };\r
\r
    const render = (dt, reduced) => {\r
      const s = settingsRef.current;\r
      ensureTargets();\r
      const [cols, rows] = state.grid;\r
      const seed = seedFor(s.variation + state.channel);\r
      const introClock = state.introAt < 0 ? 0 : state.clock - state.introAt;\r
      const [reveal, warm, focus] = s.intro && !reduced ? introAt(introClock) : [1, 1, 1];\r
\r
      const previous = state.cells[state.flip];\r
      const next = state.cells[1 - state.flip];\r
      const [glowA, glowB] = state.glows;\r
      if (!previous || !next || !glowA || !glowB) return;\r
      gl.useProgram(content.program);\r
      gl.uniform2f(content.uniforms.uGrid, cols, rows);\r
      gl.uniform1f(content.uniforms.uTime, state.time);\r
      gl.uniform1f(content.uniforms.uAmplitude, s.amplitude);\r
      gl.uniform1f(content.uniforms.uFrequency, s.frequency);\r
      gl.uniform1f(content.uniforms.uLevels, s.levels);\r
      gl.uniform1f(content.uniforms.uDecay, reduced ? 0 : s.persistence ** (dt * 60));\r
      gl.uniform1f(content.uniforms.uReveal, reveal);\r
      gl.uniform1f(content.uniforms.uRise, reveal < 1 ? dt / 0.22 : 1);\r
      gl.uniform4f(content.uniforms.uSeed, seed[0], seed[1], seed[2], seed[3]);\r
      bindTexture(0, previous.texture, content.uniforms.uPrevious);\r
      draw(next, cols, rows);\r
      state.flip = 1 - state.flip;\r
\r
      gl.useProgram(glowSource.program);\r
      gl.uniform2f(glowSource.uniforms.uSize, glowA.width, glowA.height);\r
      bindTexture(0, next.texture, glowSource.uniforms.uContent);\r
      draw(glowA, glowA.width, glowA.height);\r
      const sigma = Math.max(0.6, (glowA.height / 48) * s.bloomRadius);\r
      gl.useProgram(blur.program);\r
      gl.uniform2f(blur.uniforms.uSize, glowA.width, glowA.height);\r
      gl.uniform1f(blur.uniforms.uSigma, sigma);\r
      gl.uniform2f(blur.uniforms.uDirection, 1, 0);\r
      bindTexture(0, glowA.texture, blur.uniforms.uSource);\r
      draw(glowB, glowB.width, glowB.height);\r
      gl.uniform2f(blur.uniforms.uDirection, 0, 1);\r
      bindTexture(0, glowB.texture, blur.uniforms.uSource);\r
      draw(glowA, glowA.width, glowA.height);\r
\r
      let roll = 0;\r
      let tear = 0;\r
      let staticNoise = 0;\r
      let gain = 1;\r
      if (state.flipAt >= 0) {\r
        const t = state.clock - state.flipAt;\r
        if (!state.flipped && t >= 0.22) {\r
          state.flipped = true;\r
          state.channel += 1;\r
        }\r
        if (t >= FLIP_SECONDS) {\r
          state.flipAt = -1;\r
        } else {\r
          const p = t / FLIP_SECONDS;\r
          roll = easeInOut(p);\r
          tear = Math.sin(Math.PI * clamp(t / 0.5, 0, 1)) * 0.6;\r
          staticNoise = Math.sin(Math.PI * clamp(t / 0.55, 0, 1)) * 0.75;\r
          gain = 1 - 0.3 * Math.sin(Math.PI * p);\r
        }\r
      }\r
\r
      gl.useProgram(display.program);\r
      const u = display.uniforms;\r
      bindTexture(0, next.texture, u.uContent);\r
      bindTexture(1, glowA.texture, u.uGlow);\r
      gl.uniform2f(u.uGrid, cols, rows);\r
      gl.uniform2f(u.uResolution, state.width, state.height);\r
      gl.uniform1f(u.uPixel, state.pixel);\r
      gl.uniform1f(u.uTime, reduced ? 0 : state.clock);\r
      gl.uniform3f(u.uColor, s.ink[0], s.ink[1], s.ink[2]);\r
      const paperColor = s.paper ?? [0, 0, 0];\r
      gl.uniform3f(u.uBackground, paperColor[0], paperColor[1], paperColor[2]);\r
      gl.uniform1f(u.uOpaque, s.paper ? 1 : 0);\r
      gl.uniform1f(u.uLight, s.lightMode ? 1 : 0);\r
      gl.uniform1f(u.uLines, s.lines);\r
      gl.uniform1f(u.uScanline, s.scanline);\r
      gl.uniform1f(u.uCurve, s.curve);\r
      gl.uniform1f(u.uCorners, s.corners);\r
      gl.uniform1i(u.uMaskType, s.mask);\r
      gl.uniform1f(u.uMask, s.maskStrength);\r
      gl.uniform1f(u.uBloom, s.bloom);\r
      gl.uniform1f(u.uBrightness, s.brightness);\r
      gl.uniform1f(u.uNoise, s.noise);\r
      gl.uniform1f(u.uFlicker, reduced ? 0 : s.flicker);\r
      gl.uniform1f(u.uInterference, s.interference);\r
      gl.uniform1f(u.uVignette, s.vignette);\r
      gl.uniform1f(u.uShift, s.rgbShift);\r
      gl.uniform1f(u.uWarm, warm);\r
      gl.uniform1f(u.uFocus, focus);\r
      gl.uniform1f(u.uStatic, staticNoise);\r
      gl.uniform1f(u.uRoll, roll);\r
      gl.uniform1f(u.uTear, tear);\r
      gl.uniform1f(u.uGain, gain);\r
      gl.uniform4f(u.uMagnet, state.magnet[0], 1 - state.magnet[1], state.magnet[4] * s.mouseStrength * 2, 0.24);\r
      gl.uniform1f(u.uPurity, s.mask > 0 ? 1 : 0);\r
      draw(null, state.width, state.height);\r
    };\r
\r
    const tick = now => {\r
      state.raf = requestAnimationFrame(tick);\r
      if (!state.visible || document.hidden || state.lost) {\r
        state.last = now;\r
        return;\r
      }\r
      const s = settingsRef.current;\r
      const interval = 1000 / s.fps;\r
      if (state.last && now - state.last < interval - 1) return;\r
      const dt = state.last ? Math.min((now - state.last) / 1000, 0.1) : 1 / 60;\r
      state.last = now;\r
      const reduced = prefersReduced();\r
      state.clock += dt;\r
      if (state.introAt < 0) state.introAt = state.clock;\r
      if (!s.paused && !reduced) state.time += dt * s.speed;\r
\r
      const m = state.magnet;\r
      const omega = TAU / 0.3;\r
      for (let i = 0; i < 2; i++) {\r
        const accel = -omega * omega * (m[i] - state.pointer[i]) - 2 * omega * m[2 + i];\r
        m[2 + i] += accel * dt;\r
        m[i] += m[2 + i] * dt;\r
      }\r
      const goal = s.mouseReact && !reduced ? state.magnetGoal : 0;\r
      m[4] += (goal - m[4]) * (1 - Math.exp(-dt / 0.18));\r
\r
      const still = s.paused || reduced;\r
      const settling =\r
        Math.abs(m[4] - goal) > 0.002 ||\r
        (m[4] > 0.002 && (Math.abs(m[2]) + Math.abs(m[3]) > 0.0005 || Math.abs(m[0] - state.pointer[0]) > 0.0005));\r
      const transient =\r
        state.flipAt >= 0 || (s.intro && !reduced && state.clock - state.introAt < INTRO_SECONDS) || settling;\r
      if (state.seen !== s || transient || !still) state.quiet = 0;\r
      else state.quiet += 1;\r
      state.seen = s;\r
      if (state.quiet > 90) return;\r
\r
      resize();\r
      render(dt, reduced);\r
    };\r
\r
    const local = event => {\r
      const rect = container.getBoundingClientRect();\r
      return {\r
        x: (event.clientX - rect.left) / Math.max(rect.width, 1),\r
        y: (event.clientY - rect.top) / Math.max(rect.height, 1),\r
        inside:\r
          event.clientX >= rect.left &&\r
          event.clientX <= rect.right &&\r
          event.clientY >= rect.top &&\r
          event.clientY <= rect.bottom\r
      };\r
    };\r
\r
    const onMove = event => {\r
      const point = local(event);\r
      if (point.inside) {\r
        if (state.magnetGoal === 0 && state.magnet[4] < 0.02) {\r
          state.magnet[0] = point.x;\r
          state.magnet[1] = point.y;\r
          state.magnet[2] = 0;\r
          state.magnet[3] = 0;\r
        }\r
        state.pointer = [point.x, point.y];\r
      }\r
      state.magnetGoal = point.inside ? 1 : 0;\r
    };\r
\r
    const onLeave = () => {\r
      state.magnetGoal = 0;\r
    };\r
\r
    const onDown = event => {\r
      const s = settingsRef.current;\r
      if (!s.changeOnClick || event.button !== 0) return;\r
      if (\r
        event.target instanceof Element &&\r
        event.target.closest('a, button, input, textarea, select, label, [role="button"]')\r
      )\r
        return;\r
      const point = local(event);\r
      if (!point.inside) return;\r
      if (prefersReduced()) {\r
        state.channel += 1;\r
        return;\r
      }\r
      if (state.flipAt >= 0) return;\r
      state.flipAt = state.clock;\r
      state.flipped = false;\r
    };\r
\r
    const onLost = event => {\r
      event.preventDefault();\r
      state.lost = true;\r
    };\r
\r
    const visibility = new IntersectionObserver(entries => {\r
      state.visible = entries.some(entry => entry.isIntersecting);\r
    });\r
    visibility.observe(container);\r
    const sizes = new ResizeObserver(resize);\r
    sizes.observe(container);\r
    resize();\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    window.addEventListener('pointerdown', onDown);\r
    document.documentElement.addEventListener('pointerleave', onLeave);\r
    canvas.addEventListener('webglcontextlost', onLost);\r
    state.raf = requestAnimationFrame(tick);\r
\r
    return () => {\r
      cancelAnimationFrame(state.raf);\r
      visibility.disconnect();\r
      sizes.disconnect();\r
      window.removeEventListener('pointermove', onMove);\r
      window.removeEventListener('pointerdown', onDown);\r
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
      canvas.removeEventListener('webglcontextlost', onLost);\r
      state.cells.forEach(target => deleteTarget(gl, target));\r
      state.glows.forEach(target => deleteTarget(gl, target));\r
      [content, glowSource, blur, display].forEach(item => gl.deleteProgram(item.program));\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
      canvas.remove();\r
    };\r
  }, []);\r
\r
  return <div ref={containerRef} className={[ROOT, className].filter(Boolean).join(' ')} style={style} />;\r
}\r
`,n=`.crt-warp-container {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.crt-warp-canvas {\r
  position: absolute;\r
  inset: 0;\r
  display: block;\r
  width: 100%;\r
  height: 100%;\r
}\r
`,e=`'use client';\r
\r
import { useEffect, useMemo, useRef } from 'react';\r
\r
const ROOT = 'relative h-full w-full overflow-hidden';\r
const CANVAS = 'absolute inset-0 block h-full w-full';\r
\r
const MASKS = { none: 0, aperture: 1, shadow: 2, slot: 3 };\r
const CELL_ASPECT = 0.56;\r
const INTRO_SECONDS = 1.6;\r
const FLIP_SECONDS = 0.8;\r
const TAU = Math.PI * 2;\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const CONTENT = \`#version 300 es\r
precision highp float;\r
uniform vec2 uGrid;\r
uniform float uTime;\r
uniform float uAmplitude;\r
uniform float uFrequency;\r
uniform float uLevels;\r
uniform float uDecay;\r
uniform float uReveal;\r
uniform float uRise;\r
uniform vec4 uSeed;\r
uniform sampler2D uPrevious;\r
out vec4 outColor;\r
\r
float field(vec2 uv, float t) {\r
  uv = (uv - 0.5) * uFrequency + 0.5;\r
  float f = 0.0;\r
  f += 0.7 * sin(0.5 * uv.x + t / 5.0 + uSeed.x);\r
  f += 3.0 * sin(1.6 * uv.y + t / 5.0 + uSeed.y);\r
  f += sin(10.0 * (uv.y * sin(t / 2.0 + uSeed.z) + uv.x * cos(t / 5.0)) + t / 2.0);\r
  float cx = uv.x + 0.5 * sin(t / 2.0 + uSeed.w);\r
  float cy = uv.y + 0.5 * cos(t / 4.0 + uSeed.x * 0.7);\r
  f += 0.4 * sin(sqrt(100.0 * cx * cx + 100.0 * cy * cy + 1.0) + t);\r
  f += 0.9 * sin(sqrt(75.0 * cx * cx + 25.0 * cy * cy + 1.0) + t);\r
  f -= 1.4 * sin(sqrt(256.0 * cx * cx + 25.0 * cy * cy + 1.0) + t);\r
  f += 0.3 * sin(0.5 * uv.y + uv.x + sin(t));\r
  return f;\r
}\r
\r
void main() {\r
  vec2 cell = floor(gl_FragCoord.xy);\r
  vec2 uv = (cell + 0.5) / uGrid;\r
  float s = (0.5 + 0.499 * sin(field(uv, uTime) * uAmplitude)) * mix(1.0 / uLevels, 1.0, uReveal);\r
  float level = floor(s * uLevels) / max(uLevels - 1.0, 1.0);\r
  float previous = texelFetch(uPrevious, ivec2(cell), 0).r;\r
  float lifted = min(level, previous + uRise);\r
  outColor = vec4(max(lifted, previous * uDecay - 0.004), level, 0.0, 1.0);\r
}\`;\r
\r
const GLOW = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uContent;\r
uniform vec2 uSize;\r
out vec4 outColor;\r
\r
void main() {\r
  float v = texture(uContent, gl_FragCoord.xy / uSize).r;\r
  outColor = vec4(v * v, 0.0, 0.0, 1.0);\r
}\`;\r
\r
const BLUR = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uSource;\r
uniform vec2 uSize;\r
uniform vec2 uDirection;\r
uniform float uSigma;\r
out vec4 outColor;\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uSize;\r
  float stride = max(uSigma * 0.55, 0.5);\r
  float total = 0.0;\r
  float sum = 0.0;\r
  for (int i = -7; i <= 7; i++) {\r
    float x = float(i) * stride;\r
    float w = exp(-0.5 * x * x / (uSigma * uSigma));\r
    sum += texture(uSource, uv + uDirection * x / uSize).r * w;\r
    total += w;\r
  }\r
  outColor = vec4(sum / total, 0.0, 0.0, 1.0);\r
}\`;\r
\r
const DISPLAY = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uContent;\r
uniform sampler2D uGlow;\r
uniform vec2 uGrid;\r
uniform vec2 uResolution;\r
uniform float uPixel;\r
uniform float uTime;\r
uniform vec3 uColor;\r
uniform vec3 uBackground;\r
uniform float uOpaque;\r
uniform float uLight;\r
uniform float uLines;\r
uniform float uScanline;\r
uniform float uCurve;\r
uniform float uCorners;\r
uniform int uMaskType;\r
uniform float uMask;\r
uniform float uBloom;\r
uniform float uBrightness;\r
uniform float uNoise;\r
uniform float uFlicker;\r
uniform float uInterference;\r
uniform float uVignette;\r
uniform float uShift;\r
uniform float uWarm;\r
uniform float uFocus;\r
uniform float uStatic;\r
uniform float uRoll;\r
uniform float uTear;\r
uniform float uGain;\r
uniform vec4 uMagnet;\r
uniform float uPurity;\r
out vec4 outColor;\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
vec2 curve(vec2 uv) {\r
  if (uCurve <= 0.0) return uv;\r
  vec2 p = (uv - 0.5) * 2.0;\r
  float corner = uCurve / sqrt(max(uCurve * uCurve - 2.0, 0.001));\r
  p = uCurve * p / sqrt(max(uCurve * uCurve - dot(p, p), 0.001));\r
  p /= corner;\r
  return p * 0.5 + 0.5;\r
}\r
\r
float lineValue(float x, float y) {\r
  if (x < 0.0 || x > 1.0 || y < 0.0 || y > 1.0) return 0.0;\r
  float cx = x * uGrid.x - 0.5;\r
  float c0 = floor(cx);\r
  int row = int(clamp(floor(y * uGrid.y), 0.0, uGrid.y - 1.0));\r
  float a = texelFetch(uContent, ivec2(int(clamp(c0, 0.0, uGrid.x - 1.0)), row), 0).r;\r
  float b = texelFetch(uContent, ivec2(int(clamp(c0 + 1.0, 0.0, uGrid.x - 1.0)), row), 0).r;\r
  float soft = mix(0.5, 0.14, uFocus);\r
  return pow(mix(a, b, smoothstep(0.5 - soft, 0.5 + soft, cx - c0)), 1.25);\r
}\r
\r
float beam(vec2 uv) {\r
  float ly = uv.y * uLines - 0.5;\r
  float r0 = floor(ly);\r
  float f = ly - r0;\r
  float a = lineValue(uv.x, (r0 + 0.5) / uLines);\r
  float b = lineValue(uv.x, (r0 + 1.5) / uLines);\r
  float nearest = f < 0.5 ? a : b;\r
  float sa = mix(0.16, 0.34, sqrt(a));\r
  float sb = mix(0.16, 0.34, sqrt(b));\r
  float lit = a * exp(-0.5 * f * f / (sa * sa)) + b * exp(-0.5 * (1.0 - f) * (1.0 - f) / (sb * sb));\r
  return mix(nearest, lit * 1.18, uScanline * mix(0.3, 1.0, uFocus));\r
}\r
\r
vec3 maskAt(vec2 px) {\r
  if (uMaskType == 0 || uMask <= 0.0) return vec3(1.0);\r
  float size = max(1.0, floor(uPixel + 0.5));\r
  vec2 q = floor(px / size);\r
  float low = 1.0 - uMask;\r
  vec3 m = vec3(low);\r
  float column = q.x;\r
  if (uMaskType == 2) column += mod(floor(q.y / 2.0), 2.0) * 1.5;\r
  int stripe = int(mod(floor(column), 3.0));\r
  if (stripe == 0) m.r = 1.0;\r
  else if (stripe == 1) m.g = 1.0;\r
  else m.b = 1.0;\r
  if (uMaskType == 2 && mod(q.y, 2.0) > 0.5) m *= mix(1.0, 0.72, uMask);\r
  if (uMaskType == 3) {\r
    float slot = mod(q.y + mod(floor(q.x / 3.0), 2.0) * 2.0, 4.0);\r
    if (slot < 1.0) m *= mix(1.0, 0.45, uMask);\r
  }\r
  return m / sqrt((1.0 + 2.0 * low) / 3.0);\r
}\r
\r
vec3 phosphor(vec3 cov) {\r
  float peak = max(max(uColor.r, uColor.g), max(uColor.b, 0.001));\r
  vec3 weight = 1.0 - uColor / peak;\r
  return uColor * cov * pow(max(cov, vec3(0.0001)), 0.7 * weight);\r
}\r
\r
void main() {\r
  vec2 frag = gl_FragCoord.xy / uResolution;\r
  float aspect = uResolution.x / uResolution.y;\r
  vec2 uv = curve(frag);\r
  float shape = 1.0;\r
  if (uCorners > 0.0) {\r
    float margin = uCorners * 0.035;\r
    float radius = uCorners * 0.1;\r
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0);\r
    vec2 box = (0.5 - margin) * vec2(aspect, 1.0);\r
    vec2 q = abs(p) - box + radius;\r
    float sd = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;\r
    float aa = max(fwidth(sd), 0.0005);\r
    shape = (1.0 - smoothstep(-aa, aa, sd)) * mix(1.0, smoothstep(0.0, 0.06, -sd), 0.35);\r
    uv = (uv - 0.5) / (1.0 - 2.0 * margin) + 0.5;\r
  }\r
  float rolling = step(0.0001, abs(uRoll));\r
  uv.y += uRoll;\r
  float wrapped = fract(uv.y);\r
  uv.y = mix(uv.y, wrapped, rolling);\r
  float offset = fract(uRoll);\r
  float reach = smoothstep(0.0, 0.08, min(offset, 1.0 - offset));\r
  float blank = mix(1.0, smoothstep(0.0, 0.05, wrapped) * smoothstep(1.0, 0.95, wrapped), rolling * reach);\r
\r
  float line = floor(uv.y * uLines);\r
  float tick = floor(uTime * 30.0);\r
  uv.x += uTear * (sin(uv.y * 21.0 + uTime * 37.0) * 0.6 + hash(vec2(line, tick)) - 0.5) * 0.05;\r
  uv.x += uInterference * 0.003 * (hash(vec2(line * 0.37, floor(uTime * 24.0))) - 0.5);\r
\r
  vec2 dp = (frag - uMagnet.xy) * vec2(aspect, 1.0);\r
  float fall = exp(-dot(dp, dp) / max(uMagnet.w * uMagnet.w, 0.0001));\r
  vec2 swirl = vec2(-dp.y, dp.x) / vec2(aspect, 1.0) * fall * uMagnet.z * 0.5;\r
  vec3 spread = mix(vec3(0.85), vec3(1.0, 0.6, 0.2), uPurity);\r
\r
  vec3 level = vec3(\r
    beam(uv + swirl * spread.r + vec2(uShift, 0.0)),\r
    beam(uv + swirl * spread.g),\r
    beam(uv + swirl * spread.b - vec2(uShift, 0.0))\r
  );\r
\r
  float turn = uTime * 0.35;\r
  vec2 axis = vec2(cos(turn), sin(turn));\r
  float lobe = dot(dp, axis) / max(uMagnet.w, 0.0001);\r
  float side = dot(dp, vec2(-axis.y, axis.x)) / max(uMagnet.w, 0.0001);\r
  vec3 purity = vec3(lobe, -0.35 * lobe + 0.6 * side, -lobe);\r
  level *= 1.0 + uPurity * fall * uMagnet.z * 0.9 * purity;\r
\r
  float glow = texture(uGlow, uv).r * uBloom;\r
  float hum = 1.0 - uInterference * 0.24 * smoothstep(0.2, 1.0, 0.5 + 0.5 * sin((frag.y - uTime * 0.09) * 6.2831853));\r
  float flick = 1.0 + uFlicker * 0.1 * (hash(vec2(floor(uTime * 60.0), 7.3)) - 0.5);\r
  float grain = hash(gl_FragCoord.xy + fract(uTime) * 173.0) - 0.5;\r
  vec2 v = frag - 0.5;\r
  float vignette = mix(1.0, smoothstep(0.0, 1.0, clamp(1.0 - dot(v, v) * 2.0, 0.0, 1.0)), uVignette);\r
  float gain = uBrightness * hum * flick * vignette * blank * uGain * uWarm;\r
\r
  float noise = hash(floor(gl_FragCoord.xy / (uPixel * 1.5)) + fract(uTime * 13.7) * 91.0);\r
  level = mix(level, vec3(noise * noise * 1.15), uStatic);\r
  level *= gain * (1.0 + grain * uNoise * 2.0);\r
  level *= maskAt(gl_FragCoord.xy);\r
  glow *= gain * shape * (1.0 + 0.6 * (1.0 - uFocus));\r
  level *= shape;\r
\r
  vec3 color;\r
  float alpha;\r
  if (uLight < 0.5) {\r
    vec3 cov = clamp(level, 0.0, 1.0);\r
    vec3 light = phosphor(cov) + uColor * glow * 0.5 * (1.0 - cov);\r
    vec3 excess = max(level - 1.1, 0.0);\r
    light += (1.0 - light) * (1.0 - exp(-excess * 0.6));\r
    light = clamp(light, 0.0, 1.0);\r
    color = uBackground + light * (1.0 - uBackground);\r
    alpha = max(max(light.r, light.g), light.b);\r
    if (uOpaque < 0.5) color = light;\r
  } else {\r
    vec3 cov = clamp(level * 0.86, 0.0, 0.88);\r
    cov += clamp(glow * 0.12, 0.0, 0.2) * (1.0 - cov);\r
    color = mix(uBackground, uColor, cov);\r
    alpha = max(max(cov.r, cov.g), cov.b);\r
    if (uOpaque < 0.5) color = uColor * cov;\r
  }\r
  outColor = uOpaque > 0.5 ? vec4(color, 1.0) : vec4(color, alpha);\r
}\`;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const smooth = t => t * t * (3 - 2 * t);\r
\r
const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);\r
\r
let probe = null;\r
\r
const parseColor = (value, fallback) => {\r
  if (value === 'transparent') return null;\r
  if (typeof document === 'undefined') return fallback;\r
  if (!probe) probe = document.createElement('canvas').getContext('2d');\r
  if (!probe) return fallback;\r
  probe.fillStyle = '#000000';\r
  probe.fillStyle = value;\r
  const text = probe.fillStyle;\r
  if (text.startsWith('#')) {\r
    const hex = parseInt(text.slice(1), 16);\r
    return [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255];\r
  }\r
  const match = /rgba?\\(([\\d.]+),\\s*([\\d.]+),\\s*([\\d.]+)(?:,\\s*([\\d.]+))?/.exec(text);\r
  if (!match) return fallback;\r
  if (match[4] !== undefined && Number(match[4]) === 0) return null;\r
  return [Number(match[1]) / 255, Number(match[2]) / 255, Number(match[3]) / 255];\r
};\r
\r
const seedFor = channel => {\r
  const a = Math.sin(channel * 12.9898 + 1.7) * 43758.5453;\r
  const b = Math.sin(channel * 78.233 + 4.1) * 24634.6345;\r
  const c = Math.sin(channel * 37.719 + 2.9) * 17431.7731;\r
  const d = Math.sin(channel * 91.113 + 0.3) * 31337.1337;\r
  const f = v => (v - Math.floor(v)) * TAU;\r
  return channel === 0 ? [0, 0, 0, 0] : [f(a), f(b), f(c), f(d)];\r
};\r
\r
const introAt = t => {\r
  if (t >= INTRO_SECONDS) return [1, 1, 1];\r
  const reveal = smooth(clamp(t / INTRO_SECONDS, 0, 1));\r
  const warm = smooth(clamp(t / 0.6, 0, 1));\r
  const focus = smooth(clamp((t - 0.15) / (INTRO_SECONDS - 0.15), 0, 1));\r
  return [reveal, warm, focus];\r
};\r
\r
const compile = (gl, type, source) => {\r
  const shader = gl.createShader(type);\r
  if (!shader) return null;\r
  gl.shaderSource(shader, source);\r
  gl.compileShader(shader);\r
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {\r
    gl.deleteShader(shader);\r
    return null;\r
  }\r
  return shader;\r
};\r
\r
const createProgram = (gl, fragment, names) => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const shader = compile(gl, gl.FRAGMENT_SHADER, fragment);\r
  if (!vertex || !shader) return null;\r
  const program = gl.createProgram();\r
  if (!program) return null;\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, shader);\r
  gl.bindAttribLocation(program, 0, 'aPosition');\r
  gl.linkProgram(program);\r
  gl.deleteShader(vertex);\r
  gl.deleteShader(shader);\r
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {\r
    gl.deleteProgram(program);\r
    return null;\r
  }\r
  const uniforms = {};\r
  names.forEach(name => {\r
    uniforms[name] = gl.getUniformLocation(program, name);\r
  });\r
  return { program, uniforms };\r
};\r
\r
const createTarget = (gl, width, height) => {\r
  const texture = gl.createTexture();\r
  gl.bindTexture(gl.TEXTURE_2D, texture);\r
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
  const framebuffer = gl.createFramebuffer();\r
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
  gl.clearColor(0, 0, 0, 1);\r
  gl.clear(gl.COLOR_BUFFER_BIT);\r
  return { texture, framebuffer, width, height };\r
};\r
\r
const deleteTarget = (gl, target) => {\r
  if (!target) return;\r
  gl.deleteTexture(target.texture);\r
  gl.deleteFramebuffer(target.framebuffer);\r
};\r
\r
const prefersReduced = () =>\r
  typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);\r
\r
export default function CRTWarp({\r
  color = '#c755f7',\r
  backgroundColor = '#120f17',\r
  lightMode = false,\r
  speed = 0.5,\r
  variation = 0,\r
  waveAmplitude = 0.3,\r
  waveFrequency = 2.5,\r
  levels = 3,\r
  columns = 80,\r
  persistence = 0.4,\r
  curvature = 0.25,\r
  corners = 0,\r
  scanlineStrength = 0.6,\r
  scanlineFrequency = 200,\r
  mask = 'aperture',\r
  maskStrength = 0.3,\r
  bloom = 1.5,\r
  bloomRadius = 1,\r
  rgbShift = 0.003,\r
  noise = 0.1,\r
  flicker = 0.15,\r
  interference = 0.2,\r
  vignette = 0.3,\r
  brightness = 1,\r
  intro = true,\r
  mouseReact = true,\r
  mouseStrength = 0.5,\r
  changeOnClick = true,\r
  dpr = 2,\r
  fps = 60,\r
  paused = false,\r
  className = '',\r
  style\r
}) {\r
  const containerRef = useRef(null);\r
  const ink = useMemo(() => parseColor(color, [0.78, 0.33, 0.97]) ?? [0.78, 0.33, 0.97], [color]);\r
  const paper = useMemo(() => parseColor(backgroundColor, [0.07, 0.06, 0.09]), [backgroundColor]);\r
\r
  const settings = {\r
    ink,\r
    paper,\r
    lightMode,\r
    speed,\r
    variation,\r
    amplitude: Math.max(0, waveAmplitude) / 0.28,\r
    frequency: Math.max(0.01, waveFrequency) / 2.2,\r
    levels: clamp(Math.round(levels), 2, 12),\r
    columns: clamp(Math.round(columns), 8, 400),\r
    persistence: clamp(persistence, 0, 0.98),\r
    curve: curvature > 0.001 ? 1.1 + 0.42 / curvature : 0,\r
    corners: clamp(corners, 0, 1),\r
    scanline: clamp(scanlineStrength, 0, 1),\r
    lines: clamp(scanlineFrequency, 20, 1200),\r
    mask: MASKS[mask] ?? 0,\r
    maskStrength: clamp(maskStrength, 0, 1),\r
    bloom: Math.max(0, bloom),\r
    bloomRadius: Math.max(0.05, bloomRadius),\r
    rgbShift,\r
    noise: Math.max(0, noise),\r
    flicker: Math.max(0, flicker),\r
    interference: Math.max(0, interference),\r
    vignette: clamp(vignette, 0, 1),\r
    brightness: Math.max(0, brightness),\r
    intro,\r
    mouseReact,\r
    mouseStrength: Math.max(0, mouseStrength),\r
    changeOnClick,\r
    dpr: Math.max(0.5, dpr),\r
    fps: Math.max(1, fps),\r
    paused\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    if (!container) return undefined;\r
    const canvas = document.createElement('canvas');\r
    canvas.className = CANVAS;\r
    container.appendChild(canvas);\r
    const gl = canvas.getContext('webgl2', {\r
      alpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false,\r
      premultipliedAlpha: true,\r
      powerPreference: 'high-performance'\r
    });\r
    if (!gl) {\r
      canvas.remove();\r
      return undefined;\r
    }\r
\r
    const content = createProgram(gl, CONTENT, [\r
      'uGrid',\r
      'uTime',\r
      'uAmplitude',\r
      'uFrequency',\r
      'uLevels',\r
      'uDecay',\r
      'uReveal',\r
      'uRise',\r
      'uSeed',\r
      'uPrevious'\r
    ]);\r
    const glowSource = createProgram(gl, GLOW, ['uContent', 'uSize']);\r
    const blur = createProgram(gl, BLUR, ['uSource', 'uSize', 'uDirection', 'uSigma']);\r
    const display = createProgram(gl, DISPLAY, [\r
      'uContent',\r
      'uGlow',\r
      'uGrid',\r
      'uResolution',\r
      'uPixel',\r
      'uTime',\r
      'uColor',\r
      'uBackground',\r
      'uOpaque',\r
      'uLight',\r
      'uLines',\r
      'uScanline',\r
      'uCurve',\r
      'uCorners',\r
      'uMaskType',\r
      'uMask',\r
      'uBloom',\r
      'uBrightness',\r
      'uNoise',\r
      'uFlicker',\r
      'uInterference',\r
      'uVignette',\r
      'uShift',\r
      'uWarm',\r
      'uFocus',\r
      'uStatic',\r
      'uRoll',\r
      'uTear',\r
      'uGain',\r
      'uMagnet',\r
      'uPurity'\r
    ]);\r
    if (!content || !glowSource || !blur || !display) {\r
      canvas.remove();\r
      return undefined;\r
    }\r
\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    const buffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const state = {\r
      width: 1,\r
      height: 1,\r
      pixel: 1,\r
      grid: [0, 0],\r
      cells: [null, null],\r
      glows: [null, null],\r
      flip: 0,\r
      time: 0,\r
      clock: 0,\r
      last: 0,\r
      frame: 0,\r
      raf: 0,\r
      visible: false,\r
      introAt: -1,\r
      flipAt: -1,\r
      flipped: true,\r
      channel: 0,\r
      pointer: [0.5, 0.5],\r
      magnet: [0.5, 0.5, 0, 0, 0],\r
      magnetGoal: 0,\r
      lost: false,\r
      quiet: 0,\r
      seen: null\r
    };\r
\r
    const ensureTargets = () => {\r
      const s = settingsRef.current;\r
      const cols = s.columns;\r
      const rows = clamp(Math.round((cols * CELL_ASPECT * state.height) / Math.max(state.width, 1)), 4, 300);\r
      if (cols !== state.grid[0] || rows !== state.grid[1]) {\r
        state.cells.forEach(target => deleteTarget(gl, target));\r
        state.cells = [createTarget(gl, cols, rows), createTarget(gl, cols, rows)];\r
        state.grid = [cols, rows];\r
      }\r
      const gw = Math.max(1, Math.round(state.width / 4));\r
      const gh = Math.max(1, Math.round(state.height / 4));\r
      const glow = state.glows[0];\r
      if (!glow || glow.width !== gw || glow.height !== gh) {\r
        state.glows.forEach(target => deleteTarget(gl, target));\r
        state.glows = [createTarget(gl, gw, gh), createTarget(gl, gw, gh)];\r
      }\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const ratio = Math.min(window.devicePixelRatio || 1, s.dpr);\r
      const width = Math.max(1, Math.round(container.clientWidth * ratio));\r
      const height = Math.max(1, Math.round(container.clientHeight * ratio));\r
      state.pixel = ratio;\r
      if (width === state.width && height === state.height) return;\r
      state.quiet = 0;\r
      state.width = width;\r
      state.height = height;\r
      canvas.width = width;\r
      canvas.height = height;\r
    };\r
\r
    const draw = (target, width, height) => {\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.framebuffer : null);\r
      gl.viewport(0, 0, width, height);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const bindTexture = (unit, texture, location) => {\r
      gl.activeTexture(gl.TEXTURE0 + unit);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.uniform1i(location, unit);\r
    };\r
\r
    const render = (dt, reduced) => {\r
      const s = settingsRef.current;\r
      ensureTargets();\r
      const [cols, rows] = state.grid;\r
      const seed = seedFor(s.variation + state.channel);\r
      const introClock = state.introAt < 0 ? 0 : state.clock - state.introAt;\r
      const [reveal, warm, focus] = s.intro && !reduced ? introAt(introClock) : [1, 1, 1];\r
\r
      const previous = state.cells[state.flip];\r
      const next = state.cells[1 - state.flip];\r
      const [glowA, glowB] = state.glows;\r
      if (!previous || !next || !glowA || !glowB) return;\r
      gl.useProgram(content.program);\r
      gl.uniform2f(content.uniforms.uGrid, cols, rows);\r
      gl.uniform1f(content.uniforms.uTime, state.time);\r
      gl.uniform1f(content.uniforms.uAmplitude, s.amplitude);\r
      gl.uniform1f(content.uniforms.uFrequency, s.frequency);\r
      gl.uniform1f(content.uniforms.uLevels, s.levels);\r
      gl.uniform1f(content.uniforms.uDecay, reduced ? 0 : s.persistence ** (dt * 60));\r
      gl.uniform1f(content.uniforms.uReveal, reveal);\r
      gl.uniform1f(content.uniforms.uRise, reveal < 1 ? dt / 0.22 : 1);\r
      gl.uniform4f(content.uniforms.uSeed, seed[0], seed[1], seed[2], seed[3]);\r
      bindTexture(0, previous.texture, content.uniforms.uPrevious);\r
      draw(next, cols, rows);\r
      state.flip = 1 - state.flip;\r
\r
      gl.useProgram(glowSource.program);\r
      gl.uniform2f(glowSource.uniforms.uSize, glowA.width, glowA.height);\r
      bindTexture(0, next.texture, glowSource.uniforms.uContent);\r
      draw(glowA, glowA.width, glowA.height);\r
      const sigma = Math.max(0.6, (glowA.height / 48) * s.bloomRadius);\r
      gl.useProgram(blur.program);\r
      gl.uniform2f(blur.uniforms.uSize, glowA.width, glowA.height);\r
      gl.uniform1f(blur.uniforms.uSigma, sigma);\r
      gl.uniform2f(blur.uniforms.uDirection, 1, 0);\r
      bindTexture(0, glowA.texture, blur.uniforms.uSource);\r
      draw(glowB, glowB.width, glowB.height);\r
      gl.uniform2f(blur.uniforms.uDirection, 0, 1);\r
      bindTexture(0, glowB.texture, blur.uniforms.uSource);\r
      draw(glowA, glowA.width, glowA.height);\r
\r
      let roll = 0;\r
      let tear = 0;\r
      let staticNoise = 0;\r
      let gain = 1;\r
      if (state.flipAt >= 0) {\r
        const t = state.clock - state.flipAt;\r
        if (!state.flipped && t >= 0.22) {\r
          state.flipped = true;\r
          state.channel += 1;\r
        }\r
        if (t >= FLIP_SECONDS) {\r
          state.flipAt = -1;\r
        } else {\r
          const p = t / FLIP_SECONDS;\r
          roll = easeInOut(p);\r
          tear = Math.sin(Math.PI * clamp(t / 0.5, 0, 1)) * 0.6;\r
          staticNoise = Math.sin(Math.PI * clamp(t / 0.55, 0, 1)) * 0.75;\r
          gain = 1 - 0.3 * Math.sin(Math.PI * p);\r
        }\r
      }\r
\r
      gl.useProgram(display.program);\r
      const u = display.uniforms;\r
      bindTexture(0, next.texture, u.uContent);\r
      bindTexture(1, glowA.texture, u.uGlow);\r
      gl.uniform2f(u.uGrid, cols, rows);\r
      gl.uniform2f(u.uResolution, state.width, state.height);\r
      gl.uniform1f(u.uPixel, state.pixel);\r
      gl.uniform1f(u.uTime, reduced ? 0 : state.clock);\r
      gl.uniform3f(u.uColor, s.ink[0], s.ink[1], s.ink[2]);\r
      const paperColor = s.paper ?? [0, 0, 0];\r
      gl.uniform3f(u.uBackground, paperColor[0], paperColor[1], paperColor[2]);\r
      gl.uniform1f(u.uOpaque, s.paper ? 1 : 0);\r
      gl.uniform1f(u.uLight, s.lightMode ? 1 : 0);\r
      gl.uniform1f(u.uLines, s.lines);\r
      gl.uniform1f(u.uScanline, s.scanline);\r
      gl.uniform1f(u.uCurve, s.curve);\r
      gl.uniform1f(u.uCorners, s.corners);\r
      gl.uniform1i(u.uMaskType, s.mask);\r
      gl.uniform1f(u.uMask, s.maskStrength);\r
      gl.uniform1f(u.uBloom, s.bloom);\r
      gl.uniform1f(u.uBrightness, s.brightness);\r
      gl.uniform1f(u.uNoise, s.noise);\r
      gl.uniform1f(u.uFlicker, reduced ? 0 : s.flicker);\r
      gl.uniform1f(u.uInterference, s.interference);\r
      gl.uniform1f(u.uVignette, s.vignette);\r
      gl.uniform1f(u.uShift, s.rgbShift);\r
      gl.uniform1f(u.uWarm, warm);\r
      gl.uniform1f(u.uFocus, focus);\r
      gl.uniform1f(u.uStatic, staticNoise);\r
      gl.uniform1f(u.uRoll, roll);\r
      gl.uniform1f(u.uTear, tear);\r
      gl.uniform1f(u.uGain, gain);\r
      gl.uniform4f(u.uMagnet, state.magnet[0], 1 - state.magnet[1], state.magnet[4] * s.mouseStrength * 2, 0.24);\r
      gl.uniform1f(u.uPurity, s.mask > 0 ? 1 : 0);\r
      draw(null, state.width, state.height);\r
    };\r
\r
    const tick = now => {\r
      state.raf = requestAnimationFrame(tick);\r
      if (!state.visible || document.hidden || state.lost) {\r
        state.last = now;\r
        return;\r
      }\r
      const s = settingsRef.current;\r
      const interval = 1000 / s.fps;\r
      if (state.last && now - state.last < interval - 1) return;\r
      const dt = state.last ? Math.min((now - state.last) / 1000, 0.1) : 1 / 60;\r
      state.last = now;\r
      const reduced = prefersReduced();\r
      state.clock += dt;\r
      if (state.introAt < 0) state.introAt = state.clock;\r
      if (!s.paused && !reduced) state.time += dt * s.speed;\r
\r
      const m = state.magnet;\r
      const omega = TAU / 0.3;\r
      for (let i = 0; i < 2; i++) {\r
        const accel = -omega * omega * (m[i] - state.pointer[i]) - 2 * omega * m[2 + i];\r
        m[2 + i] += accel * dt;\r
        m[i] += m[2 + i] * dt;\r
      }\r
      const goal = s.mouseReact && !reduced ? state.magnetGoal : 0;\r
      m[4] += (goal - m[4]) * (1 - Math.exp(-dt / 0.18));\r
\r
      const still = s.paused || reduced;\r
      const settling =\r
        Math.abs(m[4] - goal) > 0.002 ||\r
        (m[4] > 0.002 && (Math.abs(m[2]) + Math.abs(m[3]) > 0.0005 || Math.abs(m[0] - state.pointer[0]) > 0.0005));\r
      const transient =\r
        state.flipAt >= 0 || (s.intro && !reduced && state.clock - state.introAt < INTRO_SECONDS) || settling;\r
      if (state.seen !== s || transient || !still) state.quiet = 0;\r
      else state.quiet += 1;\r
      state.seen = s;\r
      if (state.quiet > 90) return;\r
\r
      resize();\r
      render(dt, reduced);\r
    };\r
\r
    const local = event => {\r
      const rect = container.getBoundingClientRect();\r
      return {\r
        x: (event.clientX - rect.left) / Math.max(rect.width, 1),\r
        y: (event.clientY - rect.top) / Math.max(rect.height, 1),\r
        inside:\r
          event.clientX >= rect.left &&\r
          event.clientX <= rect.right &&\r
          event.clientY >= rect.top &&\r
          event.clientY <= rect.bottom\r
      };\r
    };\r
\r
    const onMove = event => {\r
      const point = local(event);\r
      if (point.inside) {\r
        if (state.magnetGoal === 0 && state.magnet[4] < 0.02) {\r
          state.magnet[0] = point.x;\r
          state.magnet[1] = point.y;\r
          state.magnet[2] = 0;\r
          state.magnet[3] = 0;\r
        }\r
        state.pointer = [point.x, point.y];\r
      }\r
      state.magnetGoal = point.inside ? 1 : 0;\r
    };\r
\r
    const onLeave = () => {\r
      state.magnetGoal = 0;\r
    };\r
\r
    const onDown = event => {\r
      const s = settingsRef.current;\r
      if (!s.changeOnClick || event.button !== 0) return;\r
      if (\r
        event.target instanceof Element &&\r
        event.target.closest('a, button, input, textarea, select, label, [role="button"]')\r
      )\r
        return;\r
      const point = local(event);\r
      if (!point.inside) return;\r
      if (prefersReduced()) {\r
        state.channel += 1;\r
        return;\r
      }\r
      if (state.flipAt >= 0) return;\r
      state.flipAt = state.clock;\r
      state.flipped = false;\r
    };\r
\r
    const onLost = event => {\r
      event.preventDefault();\r
      state.lost = true;\r
    };\r
\r
    const visibility = new IntersectionObserver(entries => {\r
      state.visible = entries.some(entry => entry.isIntersecting);\r
    });\r
    visibility.observe(container);\r
    const sizes = new ResizeObserver(resize);\r
    sizes.observe(container);\r
    resize();\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    window.addEventListener('pointerdown', onDown);\r
    document.documentElement.addEventListener('pointerleave', onLeave);\r
    canvas.addEventListener('webglcontextlost', onLost);\r
    state.raf = requestAnimationFrame(tick);\r
\r
    return () => {\r
      cancelAnimationFrame(state.raf);\r
      visibility.disconnect();\r
      sizes.disconnect();\r
      window.removeEventListener('pointermove', onMove);\r
      window.removeEventListener('pointerdown', onDown);\r
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
      canvas.removeEventListener('webglcontextlost', onLost);\r
      state.cells.forEach(target => deleteTarget(gl, target));\r
      state.glows.forEach(target => deleteTarget(gl, target));\r
      [content, glowSource, blur, display].forEach(item => gl.deleteProgram(item.program));\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
      canvas.remove();\r
    };\r
  }, []);\r
\r
  return <div ref={containerRef} className={[ROOT, className].filter(Boolean).join(' ')} style={style} />;\r
}\r
`,t=`'use client';\r
\r
import { useEffect, useMemo, useRef, type CSSProperties } from 'react';\r
import './CRTWarp.css';\r
\r
export interface CRTWarpProps {\r
  color?: string;\r
  backgroundColor?: string;\r
  lightMode?: boolean;\r
  speed?: number;\r
  variation?: number;\r
  waveAmplitude?: number;\r
  waveFrequency?: number;\r
  levels?: number;\r
  columns?: number;\r
  persistence?: number;\r
  curvature?: number;\r
  corners?: number;\r
  scanlineStrength?: number;\r
  scanlineFrequency?: number;\r
  mask?: 'aperture' | 'shadow' | 'slot' | 'none';\r
  maskStrength?: number;\r
  bloom?: number;\r
  bloomRadius?: number;\r
  rgbShift?: number;\r
  noise?: number;\r
  flicker?: number;\r
  interference?: number;\r
  vignette?: number;\r
  brightness?: number;\r
  intro?: boolean;\r
  mouseReact?: boolean;\r
  mouseStrength?: number;\r
  changeOnClick?: boolean;\r
  dpr?: number;\r
  fps?: number;\r
  paused?: boolean;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
type RGB = [number, number, number];\r
\r
interface Program {\r
  program: WebGLProgram;\r
  uniforms: Record<string, WebGLUniformLocation | null>;\r
}\r
\r
interface Target {\r
  texture: WebGLTexture;\r
  framebuffer: WebGLFramebuffer;\r
  width: number;\r
  height: number;\r
}\r
\r
const ROOT = 'crt-warp-container';\r
const CANVAS = 'crt-warp-canvas';\r
\r
const MASKS: Record<string, number> = { none: 0, aperture: 1, shadow: 2, slot: 3 };\r
const CELL_ASPECT = 0.56;\r
const INTRO_SECONDS = 1.6;\r
const FLIP_SECONDS = 0.8;\r
const TAU = Math.PI * 2;\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const CONTENT = \`#version 300 es\r
precision highp float;\r
uniform vec2 uGrid;\r
uniform float uTime;\r
uniform float uAmplitude;\r
uniform float uFrequency;\r
uniform float uLevels;\r
uniform float uDecay;\r
uniform float uReveal;\r
uniform float uRise;\r
uniform vec4 uSeed;\r
uniform sampler2D uPrevious;\r
out vec4 outColor;\r
\r
float field(vec2 uv, float t) {\r
  uv = (uv - 0.5) * uFrequency + 0.5;\r
  float f = 0.0;\r
  f += 0.7 * sin(0.5 * uv.x + t / 5.0 + uSeed.x);\r
  f += 3.0 * sin(1.6 * uv.y + t / 5.0 + uSeed.y);\r
  f += sin(10.0 * (uv.y * sin(t / 2.0 + uSeed.z) + uv.x * cos(t / 5.0)) + t / 2.0);\r
  float cx = uv.x + 0.5 * sin(t / 2.0 + uSeed.w);\r
  float cy = uv.y + 0.5 * cos(t / 4.0 + uSeed.x * 0.7);\r
  f += 0.4 * sin(sqrt(100.0 * cx * cx + 100.0 * cy * cy + 1.0) + t);\r
  f += 0.9 * sin(sqrt(75.0 * cx * cx + 25.0 * cy * cy + 1.0) + t);\r
  f -= 1.4 * sin(sqrt(256.0 * cx * cx + 25.0 * cy * cy + 1.0) + t);\r
  f += 0.3 * sin(0.5 * uv.y + uv.x + sin(t));\r
  return f;\r
}\r
\r
void main() {\r
  vec2 cell = floor(gl_FragCoord.xy);\r
  vec2 uv = (cell + 0.5) / uGrid;\r
  float s = (0.5 + 0.499 * sin(field(uv, uTime) * uAmplitude)) * mix(1.0 / uLevels, 1.0, uReveal);\r
  float level = floor(s * uLevels) / max(uLevels - 1.0, 1.0);\r
  float previous = texelFetch(uPrevious, ivec2(cell), 0).r;\r
  float lifted = min(level, previous + uRise);\r
  outColor = vec4(max(lifted, previous * uDecay - 0.004), level, 0.0, 1.0);\r
}\`;\r
\r
const GLOW = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uContent;\r
uniform vec2 uSize;\r
out vec4 outColor;\r
\r
void main() {\r
  float v = texture(uContent, gl_FragCoord.xy / uSize).r;\r
  outColor = vec4(v * v, 0.0, 0.0, 1.0);\r
}\`;\r
\r
const BLUR = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uSource;\r
uniform vec2 uSize;\r
uniform vec2 uDirection;\r
uniform float uSigma;\r
out vec4 outColor;\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uSize;\r
  float stride = max(uSigma * 0.55, 0.5);\r
  float total = 0.0;\r
  float sum = 0.0;\r
  for (int i = -7; i <= 7; i++) {\r
    float x = float(i) * stride;\r
    float w = exp(-0.5 * x * x / (uSigma * uSigma));\r
    sum += texture(uSource, uv + uDirection * x / uSize).r * w;\r
    total += w;\r
  }\r
  outColor = vec4(sum / total, 0.0, 0.0, 1.0);\r
}\`;\r
\r
const DISPLAY = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uContent;\r
uniform sampler2D uGlow;\r
uniform vec2 uGrid;\r
uniform vec2 uResolution;\r
uniform float uPixel;\r
uniform float uTime;\r
uniform vec3 uColor;\r
uniform vec3 uBackground;\r
uniform float uOpaque;\r
uniform float uLight;\r
uniform float uLines;\r
uniform float uScanline;\r
uniform float uCurve;\r
uniform float uCorners;\r
uniform int uMaskType;\r
uniform float uMask;\r
uniform float uBloom;\r
uniform float uBrightness;\r
uniform float uNoise;\r
uniform float uFlicker;\r
uniform float uInterference;\r
uniform float uVignette;\r
uniform float uShift;\r
uniform float uWarm;\r
uniform float uFocus;\r
uniform float uStatic;\r
uniform float uRoll;\r
uniform float uTear;\r
uniform float uGain;\r
uniform vec4 uMagnet;\r
uniform float uPurity;\r
out vec4 outColor;\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
vec2 curve(vec2 uv) {\r
  if (uCurve <= 0.0) return uv;\r
  vec2 p = (uv - 0.5) * 2.0;\r
  float corner = uCurve / sqrt(max(uCurve * uCurve - 2.0, 0.001));\r
  p = uCurve * p / sqrt(max(uCurve * uCurve - dot(p, p), 0.001));\r
  p /= corner;\r
  return p * 0.5 + 0.5;\r
}\r
\r
float lineValue(float x, float y) {\r
  if (x < 0.0 || x > 1.0 || y < 0.0 || y > 1.0) return 0.0;\r
  float cx = x * uGrid.x - 0.5;\r
  float c0 = floor(cx);\r
  int row = int(clamp(floor(y * uGrid.y), 0.0, uGrid.y - 1.0));\r
  float a = texelFetch(uContent, ivec2(int(clamp(c0, 0.0, uGrid.x - 1.0)), row), 0).r;\r
  float b = texelFetch(uContent, ivec2(int(clamp(c0 + 1.0, 0.0, uGrid.x - 1.0)), row), 0).r;\r
  float soft = mix(0.5, 0.14, uFocus);\r
  return pow(mix(a, b, smoothstep(0.5 - soft, 0.5 + soft, cx - c0)), 1.25);\r
}\r
\r
float beam(vec2 uv) {\r
  float ly = uv.y * uLines - 0.5;\r
  float r0 = floor(ly);\r
  float f = ly - r0;\r
  float a = lineValue(uv.x, (r0 + 0.5) / uLines);\r
  float b = lineValue(uv.x, (r0 + 1.5) / uLines);\r
  float nearest = f < 0.5 ? a : b;\r
  float sa = mix(0.16, 0.34, sqrt(a));\r
  float sb = mix(0.16, 0.34, sqrt(b));\r
  float lit = a * exp(-0.5 * f * f / (sa * sa)) + b * exp(-0.5 * (1.0 - f) * (1.0 - f) / (sb * sb));\r
  return mix(nearest, lit * 1.18, uScanline * mix(0.3, 1.0, uFocus));\r
}\r
\r
vec3 maskAt(vec2 px) {\r
  if (uMaskType == 0 || uMask <= 0.0) return vec3(1.0);\r
  float size = max(1.0, floor(uPixel + 0.5));\r
  vec2 q = floor(px / size);\r
  float low = 1.0 - uMask;\r
  vec3 m = vec3(low);\r
  float column = q.x;\r
  if (uMaskType == 2) column += mod(floor(q.y / 2.0), 2.0) * 1.5;\r
  int stripe = int(mod(floor(column), 3.0));\r
  if (stripe == 0) m.r = 1.0;\r
  else if (stripe == 1) m.g = 1.0;\r
  else m.b = 1.0;\r
  if (uMaskType == 2 && mod(q.y, 2.0) > 0.5) m *= mix(1.0, 0.72, uMask);\r
  if (uMaskType == 3) {\r
    float slot = mod(q.y + mod(floor(q.x / 3.0), 2.0) * 2.0, 4.0);\r
    if (slot < 1.0) m *= mix(1.0, 0.45, uMask);\r
  }\r
  return m / sqrt((1.0 + 2.0 * low) / 3.0);\r
}\r
\r
vec3 phosphor(vec3 cov) {\r
  float peak = max(max(uColor.r, uColor.g), max(uColor.b, 0.001));\r
  vec3 weight = 1.0 - uColor / peak;\r
  return uColor * cov * pow(max(cov, vec3(0.0001)), 0.7 * weight);\r
}\r
\r
void main() {\r
  vec2 frag = gl_FragCoord.xy / uResolution;\r
  float aspect = uResolution.x / uResolution.y;\r
  vec2 uv = curve(frag);\r
  float shape = 1.0;\r
  if (uCorners > 0.0) {\r
    float margin = uCorners * 0.035;\r
    float radius = uCorners * 0.1;\r
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0);\r
    vec2 box = (0.5 - margin) * vec2(aspect, 1.0);\r
    vec2 q = abs(p) - box + radius;\r
    float sd = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;\r
    float aa = max(fwidth(sd), 0.0005);\r
    shape = (1.0 - smoothstep(-aa, aa, sd)) * mix(1.0, smoothstep(0.0, 0.06, -sd), 0.35);\r
    uv = (uv - 0.5) / (1.0 - 2.0 * margin) + 0.5;\r
  }\r
  float rolling = step(0.0001, abs(uRoll));\r
  uv.y += uRoll;\r
  float wrapped = fract(uv.y);\r
  uv.y = mix(uv.y, wrapped, rolling);\r
  float offset = fract(uRoll);\r
  float reach = smoothstep(0.0, 0.08, min(offset, 1.0 - offset));\r
  float blank = mix(1.0, smoothstep(0.0, 0.05, wrapped) * smoothstep(1.0, 0.95, wrapped), rolling * reach);\r
\r
  float line = floor(uv.y * uLines);\r
  float tick = floor(uTime * 30.0);\r
  uv.x += uTear * (sin(uv.y * 21.0 + uTime * 37.0) * 0.6 + hash(vec2(line, tick)) - 0.5) * 0.05;\r
  uv.x += uInterference * 0.003 * (hash(vec2(line * 0.37, floor(uTime * 24.0))) - 0.5);\r
\r
  vec2 dp = (frag - uMagnet.xy) * vec2(aspect, 1.0);\r
  float fall = exp(-dot(dp, dp) / max(uMagnet.w * uMagnet.w, 0.0001));\r
  vec2 swirl = vec2(-dp.y, dp.x) / vec2(aspect, 1.0) * fall * uMagnet.z * 0.5;\r
  vec3 spread = mix(vec3(0.85), vec3(1.0, 0.6, 0.2), uPurity);\r
\r
  vec3 level = vec3(\r
    beam(uv + swirl * spread.r + vec2(uShift, 0.0)),\r
    beam(uv + swirl * spread.g),\r
    beam(uv + swirl * spread.b - vec2(uShift, 0.0))\r
  );\r
\r
  float turn = uTime * 0.35;\r
  vec2 axis = vec2(cos(turn), sin(turn));\r
  float lobe = dot(dp, axis) / max(uMagnet.w, 0.0001);\r
  float side = dot(dp, vec2(-axis.y, axis.x)) / max(uMagnet.w, 0.0001);\r
  vec3 purity = vec3(lobe, -0.35 * lobe + 0.6 * side, -lobe);\r
  level *= 1.0 + uPurity * fall * uMagnet.z * 0.9 * purity;\r
\r
  float glow = texture(uGlow, uv).r * uBloom;\r
  float hum = 1.0 - uInterference * 0.24 * smoothstep(0.2, 1.0, 0.5 + 0.5 * sin((frag.y - uTime * 0.09) * 6.2831853));\r
  float flick = 1.0 + uFlicker * 0.1 * (hash(vec2(floor(uTime * 60.0), 7.3)) - 0.5);\r
  float grain = hash(gl_FragCoord.xy + fract(uTime) * 173.0) - 0.5;\r
  vec2 v = frag - 0.5;\r
  float vignette = mix(1.0, smoothstep(0.0, 1.0, clamp(1.0 - dot(v, v) * 2.0, 0.0, 1.0)), uVignette);\r
  float gain = uBrightness * hum * flick * vignette * blank * uGain * uWarm;\r
\r
  float noise = hash(floor(gl_FragCoord.xy / (uPixel * 1.5)) + fract(uTime * 13.7) * 91.0);\r
  level = mix(level, vec3(noise * noise * 1.15), uStatic);\r
  level *= gain * (1.0 + grain * uNoise * 2.0);\r
  level *= maskAt(gl_FragCoord.xy);\r
  glow *= gain * shape * (1.0 + 0.6 * (1.0 - uFocus));\r
  level *= shape;\r
\r
  vec3 color;\r
  float alpha;\r
  if (uLight < 0.5) {\r
    vec3 cov = clamp(level, 0.0, 1.0);\r
    vec3 light = phosphor(cov) + uColor * glow * 0.5 * (1.0 - cov);\r
    vec3 excess = max(level - 1.1, 0.0);\r
    light += (1.0 - light) * (1.0 - exp(-excess * 0.6));\r
    light = clamp(light, 0.0, 1.0);\r
    color = uBackground + light * (1.0 - uBackground);\r
    alpha = max(max(light.r, light.g), light.b);\r
    if (uOpaque < 0.5) color = light;\r
  } else {\r
    vec3 cov = clamp(level * 0.86, 0.0, 0.88);\r
    cov += clamp(glow * 0.12, 0.0, 0.2) * (1.0 - cov);\r
    color = mix(uBackground, uColor, cov);\r
    alpha = max(max(cov.r, cov.g), cov.b);\r
    if (uOpaque < 0.5) color = uColor * cov;\r
  }\r
  outColor = uOpaque > 0.5 ? vec4(color, 1.0) : vec4(color, alpha);\r
}\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const smooth = (t: number) => t * t * (3 - 2 * t);\r
\r
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);\r
\r
let probe: CanvasRenderingContext2D | null = null;\r
\r
const parseColor = (value: string, fallback: RGB | null): RGB | null => {\r
  if (value === 'transparent') return null;\r
  if (typeof document === 'undefined') return fallback;\r
  if (!probe) probe = document.createElement('canvas').getContext('2d');\r
  if (!probe) return fallback;\r
  probe.fillStyle = '#000000';\r
  probe.fillStyle = value;\r
  const text = probe.fillStyle;\r
  if (text.startsWith('#')) {\r
    const hex = parseInt(text.slice(1), 16);\r
    return [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255];\r
  }\r
  const match = /rgba?\\(([\\d.]+),\\s*([\\d.]+),\\s*([\\d.]+)(?:,\\s*([\\d.]+))?/.exec(text);\r
  if (!match) return fallback;\r
  if (match[4] !== undefined && Number(match[4]) === 0) return null;\r
  return [Number(match[1]) / 255, Number(match[2]) / 255, Number(match[3]) / 255];\r
};\r
\r
const seedFor = (channel: number) => {\r
  const a = Math.sin(channel * 12.9898 + 1.7) * 43758.5453;\r
  const b = Math.sin(channel * 78.233 + 4.1) * 24634.6345;\r
  const c = Math.sin(channel * 37.719 + 2.9) * 17431.7731;\r
  const d = Math.sin(channel * 91.113 + 0.3) * 31337.1337;\r
  const f = (v: number) => (v - Math.floor(v)) * TAU;\r
  return channel === 0 ? [0, 0, 0, 0] : [f(a), f(b), f(c), f(d)];\r
};\r
\r
const introAt = (t: number) => {\r
  if (t >= INTRO_SECONDS) return [1, 1, 1];\r
  const reveal = smooth(clamp(t / INTRO_SECONDS, 0, 1));\r
  const warm = smooth(clamp(t / 0.6, 0, 1));\r
  const focus = smooth(clamp((t - 0.15) / (INTRO_SECONDS - 0.15), 0, 1));\r
  return [reveal, warm, focus];\r
};\r
\r
const compile = (gl: WebGL2RenderingContext, type: number, source: string) => {\r
  const shader = gl.createShader(type);\r
  if (!shader) return null;\r
  gl.shaderSource(shader, source);\r
  gl.compileShader(shader);\r
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {\r
    gl.deleteShader(shader);\r
    return null;\r
  }\r
  return shader;\r
};\r
\r
const createProgram = (gl: WebGL2RenderingContext, fragment: string, names: string[]): Program | null => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const shader = compile(gl, gl.FRAGMENT_SHADER, fragment);\r
  if (!vertex || !shader) return null;\r
  const program = gl.createProgram();\r
  if (!program) return null;\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, shader);\r
  gl.bindAttribLocation(program, 0, 'aPosition');\r
  gl.linkProgram(program);\r
  gl.deleteShader(vertex);\r
  gl.deleteShader(shader);\r
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {\r
    gl.deleteProgram(program);\r
    return null;\r
  }\r
  const uniforms: Record<string, WebGLUniformLocation | null> = {};\r
  names.forEach(name => {\r
    uniforms[name] = gl.getUniformLocation(program, name);\r
  });\r
  return { program, uniforms };\r
};\r
\r
const createTarget = (gl: WebGL2RenderingContext, width: number, height: number): Target => {\r
  const texture = gl.createTexture();\r
  gl.bindTexture(gl.TEXTURE_2D, texture);\r
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
  const framebuffer = gl.createFramebuffer();\r
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
  gl.clearColor(0, 0, 0, 1);\r
  gl.clear(gl.COLOR_BUFFER_BIT);\r
  return { texture, framebuffer, width, height };\r
};\r
\r
const deleteTarget = (gl: WebGL2RenderingContext, target: Target | null) => {\r
  if (!target) return;\r
  gl.deleteTexture(target.texture);\r
  gl.deleteFramebuffer(target.framebuffer);\r
};\r
\r
const prefersReduced = () =>\r
  typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);\r
\r
export default function CRTWarp({\r
  color = '#c755f7',\r
  backgroundColor = '#120f17',\r
  lightMode = false,\r
  speed = 0.5,\r
  variation = 0,\r
  waveAmplitude = 0.3,\r
  waveFrequency = 2.5,\r
  levels = 3,\r
  columns = 80,\r
  persistence = 0.4,\r
  curvature = 0.25,\r
  corners = 0,\r
  scanlineStrength = 0.6,\r
  scanlineFrequency = 200,\r
  mask = 'aperture',\r
  maskStrength = 0.3,\r
  bloom = 1.5,\r
  bloomRadius = 1,\r
  rgbShift = 0.003,\r
  noise = 0.1,\r
  flicker = 0.15,\r
  interference = 0.2,\r
  vignette = 0.3,\r
  brightness = 1,\r
  intro = true,\r
  mouseReact = true,\r
  mouseStrength = 0.5,\r
  changeOnClick = true,\r
  dpr = 2,\r
  fps = 60,\r
  paused = false,\r
  className = '',\r
  style\r
}: CRTWarpProps) {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const ink = useMemo((): RGB => parseColor(color, [0.78, 0.33, 0.97]) ?? [0.78, 0.33, 0.97], [color]);\r
  const paper = useMemo(() => parseColor(backgroundColor, [0.07, 0.06, 0.09]), [backgroundColor]);\r
\r
  const settings = {\r
    ink,\r
    paper,\r
    lightMode,\r
    speed,\r
    variation,\r
    amplitude: Math.max(0, waveAmplitude) / 0.28,\r
    frequency: Math.max(0.01, waveFrequency) / 2.2,\r
    levels: clamp(Math.round(levels), 2, 12),\r
    columns: clamp(Math.round(columns), 8, 400),\r
    persistence: clamp(persistence, 0, 0.98),\r
    curve: curvature > 0.001 ? 1.1 + 0.42 / curvature : 0,\r
    corners: clamp(corners, 0, 1),\r
    scanline: clamp(scanlineStrength, 0, 1),\r
    lines: clamp(scanlineFrequency, 20, 1200),\r
    mask: MASKS[mask] ?? 0,\r
    maskStrength: clamp(maskStrength, 0, 1),\r
    bloom: Math.max(0, bloom),\r
    bloomRadius: Math.max(0.05, bloomRadius),\r
    rgbShift,\r
    noise: Math.max(0, noise),\r
    flicker: Math.max(0, flicker),\r
    interference: Math.max(0, interference),\r
    vignette: clamp(vignette, 0, 1),\r
    brightness: Math.max(0, brightness),\r
    intro,\r
    mouseReact,\r
    mouseStrength: Math.max(0, mouseStrength),\r
    changeOnClick,\r
    dpr: Math.max(0.5, dpr),\r
    fps: Math.max(1, fps),\r
    paused\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    if (!container) return undefined;\r
    const canvas = document.createElement('canvas');\r
    canvas.className = CANVAS;\r
    container.appendChild(canvas);\r
    const gl = canvas.getContext('webgl2', {\r
      alpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false,\r
      premultipliedAlpha: true,\r
      powerPreference: 'high-performance'\r
    });\r
    if (!gl) {\r
      canvas.remove();\r
      return undefined;\r
    }\r
\r
    const content = createProgram(gl, CONTENT, [\r
      'uGrid',\r
      'uTime',\r
      'uAmplitude',\r
      'uFrequency',\r
      'uLevels',\r
      'uDecay',\r
      'uReveal',\r
      'uRise',\r
      'uSeed',\r
      'uPrevious'\r
    ]);\r
    const glowSource = createProgram(gl, GLOW, ['uContent', 'uSize']);\r
    const blur = createProgram(gl, BLUR, ['uSource', 'uSize', 'uDirection', 'uSigma']);\r
    const display = createProgram(gl, DISPLAY, [\r
      'uContent',\r
      'uGlow',\r
      'uGrid',\r
      'uResolution',\r
      'uPixel',\r
      'uTime',\r
      'uColor',\r
      'uBackground',\r
      'uOpaque',\r
      'uLight',\r
      'uLines',\r
      'uScanline',\r
      'uCurve',\r
      'uCorners',\r
      'uMaskType',\r
      'uMask',\r
      'uBloom',\r
      'uBrightness',\r
      'uNoise',\r
      'uFlicker',\r
      'uInterference',\r
      'uVignette',\r
      'uShift',\r
      'uWarm',\r
      'uFocus',\r
      'uStatic',\r
      'uRoll',\r
      'uTear',\r
      'uGain',\r
      'uMagnet',\r
      'uPurity'\r
    ]);\r
    if (!content || !glowSource || !blur || !display) {\r
      canvas.remove();\r
      return undefined;\r
    }\r
\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    const buffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const state = {\r
      width: 1,\r
      height: 1,\r
      pixel: 1,\r
      grid: [0, 0],\r
      cells: [null, null] as (Target | null)[],\r
      glows: [null, null] as (Target | null)[],\r
      flip: 0,\r
      time: 0,\r
      clock: 0,\r
      last: 0,\r
      frame: 0,\r
      raf: 0,\r
      visible: false,\r
      introAt: -1,\r
      flipAt: -1,\r
      flipped: true,\r
      channel: 0,\r
      pointer: [0.5, 0.5],\r
      magnet: [0.5, 0.5, 0, 0, 0],\r
      magnetGoal: 0,\r
      lost: false,\r
      quiet: 0,\r
      seen: null as typeof settings | null\r
    };\r
\r
    const ensureTargets = () => {\r
      const s = settingsRef.current;\r
      const cols = s.columns;\r
      const rows = clamp(Math.round((cols * CELL_ASPECT * state.height) / Math.max(state.width, 1)), 4, 300);\r
      if (cols !== state.grid[0] || rows !== state.grid[1]) {\r
        state.cells.forEach(target => deleteTarget(gl, target));\r
        state.cells = [createTarget(gl, cols, rows), createTarget(gl, cols, rows)];\r
        state.grid = [cols, rows];\r
      }\r
      const gw = Math.max(1, Math.round(state.width / 4));\r
      const gh = Math.max(1, Math.round(state.height / 4));\r
      const glow = state.glows[0];\r
      if (!glow || glow.width !== gw || glow.height !== gh) {\r
        state.glows.forEach(target => deleteTarget(gl, target));\r
        state.glows = [createTarget(gl, gw, gh), createTarget(gl, gw, gh)];\r
      }\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const ratio = Math.min(window.devicePixelRatio || 1, s.dpr);\r
      const width = Math.max(1, Math.round(container.clientWidth * ratio));\r
      const height = Math.max(1, Math.round(container.clientHeight * ratio));\r
      state.pixel = ratio;\r
      if (width === state.width && height === state.height) return;\r
      state.quiet = 0;\r
      state.width = width;\r
      state.height = height;\r
      canvas.width = width;\r
      canvas.height = height;\r
    };\r
\r
    const draw = (target: Target | null, width: number, height: number) => {\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.framebuffer : null);\r
      gl.viewport(0, 0, width, height);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const bindTexture = (unit: number, texture: WebGLTexture, location: WebGLUniformLocation | null) => {\r
      gl.activeTexture(gl.TEXTURE0 + unit);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.uniform1i(location, unit);\r
    };\r
\r
    const render = (dt: number, reduced: boolean) => {\r
      const s = settingsRef.current;\r
      ensureTargets();\r
      const [cols, rows] = state.grid;\r
      const seed = seedFor(s.variation + state.channel);\r
      const introClock = state.introAt < 0 ? 0 : state.clock - state.introAt;\r
      const [reveal, warm, focus] = s.intro && !reduced ? introAt(introClock) : [1, 1, 1];\r
\r
      const previous = state.cells[state.flip];\r
      const next = state.cells[1 - state.flip];\r
      const [glowA, glowB] = state.glows;\r
      if (!previous || !next || !glowA || !glowB) return;\r
      gl.useProgram(content.program);\r
      gl.uniform2f(content.uniforms.uGrid, cols, rows);\r
      gl.uniform1f(content.uniforms.uTime, state.time);\r
      gl.uniform1f(content.uniforms.uAmplitude, s.amplitude);\r
      gl.uniform1f(content.uniforms.uFrequency, s.frequency);\r
      gl.uniform1f(content.uniforms.uLevels, s.levels);\r
      gl.uniform1f(content.uniforms.uDecay, reduced ? 0 : s.persistence ** (dt * 60));\r
      gl.uniform1f(content.uniforms.uReveal, reveal);\r
      gl.uniform1f(content.uniforms.uRise, reveal < 1 ? dt / 0.22 : 1);\r
      gl.uniform4f(content.uniforms.uSeed, seed[0], seed[1], seed[2], seed[3]);\r
      bindTexture(0, previous.texture, content.uniforms.uPrevious);\r
      draw(next, cols, rows);\r
      state.flip = 1 - state.flip;\r
\r
      gl.useProgram(glowSource.program);\r
      gl.uniform2f(glowSource.uniforms.uSize, glowA.width, glowA.height);\r
      bindTexture(0, next.texture, glowSource.uniforms.uContent);\r
      draw(glowA, glowA.width, glowA.height);\r
      const sigma = Math.max(0.6, (glowA.height / 48) * s.bloomRadius);\r
      gl.useProgram(blur.program);\r
      gl.uniform2f(blur.uniforms.uSize, glowA.width, glowA.height);\r
      gl.uniform1f(blur.uniforms.uSigma, sigma);\r
      gl.uniform2f(blur.uniforms.uDirection, 1, 0);\r
      bindTexture(0, glowA.texture, blur.uniforms.uSource);\r
      draw(glowB, glowB.width, glowB.height);\r
      gl.uniform2f(blur.uniforms.uDirection, 0, 1);\r
      bindTexture(0, glowB.texture, blur.uniforms.uSource);\r
      draw(glowA, glowA.width, glowA.height);\r
\r
      let roll = 0;\r
      let tear = 0;\r
      let staticNoise = 0;\r
      let gain = 1;\r
      if (state.flipAt >= 0) {\r
        const t = state.clock - state.flipAt;\r
        if (!state.flipped && t >= 0.22) {\r
          state.flipped = true;\r
          state.channel += 1;\r
        }\r
        if (t >= FLIP_SECONDS) {\r
          state.flipAt = -1;\r
        } else {\r
          const p = t / FLIP_SECONDS;\r
          roll = easeInOut(p);\r
          tear = Math.sin(Math.PI * clamp(t / 0.5, 0, 1)) * 0.6;\r
          staticNoise = Math.sin(Math.PI * clamp(t / 0.55, 0, 1)) * 0.75;\r
          gain = 1 - 0.3 * Math.sin(Math.PI * p);\r
        }\r
      }\r
\r
      gl.useProgram(display.program);\r
      const u = display.uniforms;\r
      bindTexture(0, next.texture, u.uContent);\r
      bindTexture(1, glowA.texture, u.uGlow);\r
      gl.uniform2f(u.uGrid, cols, rows);\r
      gl.uniform2f(u.uResolution, state.width, state.height);\r
      gl.uniform1f(u.uPixel, state.pixel);\r
      gl.uniform1f(u.uTime, reduced ? 0 : state.clock);\r
      gl.uniform3f(u.uColor, s.ink[0], s.ink[1], s.ink[2]);\r
      const paperColor = s.paper ?? [0, 0, 0];\r
      gl.uniform3f(u.uBackground, paperColor[0], paperColor[1], paperColor[2]);\r
      gl.uniform1f(u.uOpaque, s.paper ? 1 : 0);\r
      gl.uniform1f(u.uLight, s.lightMode ? 1 : 0);\r
      gl.uniform1f(u.uLines, s.lines);\r
      gl.uniform1f(u.uScanline, s.scanline);\r
      gl.uniform1f(u.uCurve, s.curve);\r
      gl.uniform1f(u.uCorners, s.corners);\r
      gl.uniform1i(u.uMaskType, s.mask);\r
      gl.uniform1f(u.uMask, s.maskStrength);\r
      gl.uniform1f(u.uBloom, s.bloom);\r
      gl.uniform1f(u.uBrightness, s.brightness);\r
      gl.uniform1f(u.uNoise, s.noise);\r
      gl.uniform1f(u.uFlicker, reduced ? 0 : s.flicker);\r
      gl.uniform1f(u.uInterference, s.interference);\r
      gl.uniform1f(u.uVignette, s.vignette);\r
      gl.uniform1f(u.uShift, s.rgbShift);\r
      gl.uniform1f(u.uWarm, warm);\r
      gl.uniform1f(u.uFocus, focus);\r
      gl.uniform1f(u.uStatic, staticNoise);\r
      gl.uniform1f(u.uRoll, roll);\r
      gl.uniform1f(u.uTear, tear);\r
      gl.uniform1f(u.uGain, gain);\r
      gl.uniform4f(u.uMagnet, state.magnet[0], 1 - state.magnet[1], state.magnet[4] * s.mouseStrength * 2, 0.24);\r
      gl.uniform1f(u.uPurity, s.mask > 0 ? 1 : 0);\r
      draw(null, state.width, state.height);\r
    };\r
\r
    const tick = (now: number) => {\r
      state.raf = requestAnimationFrame(tick);\r
      if (!state.visible || document.hidden || state.lost) {\r
        state.last = now;\r
        return;\r
      }\r
      const s = settingsRef.current;\r
      const interval = 1000 / s.fps;\r
      if (state.last && now - state.last < interval - 1) return;\r
      const dt = state.last ? Math.min((now - state.last) / 1000, 0.1) : 1 / 60;\r
      state.last = now;\r
      const reduced = prefersReduced();\r
      state.clock += dt;\r
      if (state.introAt < 0) state.introAt = state.clock;\r
      if (!s.paused && !reduced) state.time += dt * s.speed;\r
\r
      const m = state.magnet;\r
      const omega = TAU / 0.3;\r
      for (let i = 0; i < 2; i++) {\r
        const accel = -omega * omega * (m[i] - state.pointer[i]) - 2 * omega * m[2 + i];\r
        m[2 + i] += accel * dt;\r
        m[i] += m[2 + i] * dt;\r
      }\r
      const goal = s.mouseReact && !reduced ? state.magnetGoal : 0;\r
      m[4] += (goal - m[4]) * (1 - Math.exp(-dt / 0.18));\r
\r
      const still = s.paused || reduced;\r
      const settling =\r
        Math.abs(m[4] - goal) > 0.002 ||\r
        (m[4] > 0.002 && (Math.abs(m[2]) + Math.abs(m[3]) > 0.0005 || Math.abs(m[0] - state.pointer[0]) > 0.0005));\r
      const transient =\r
        state.flipAt >= 0 || (s.intro && !reduced && state.clock - state.introAt < INTRO_SECONDS) || settling;\r
      if (state.seen !== s || transient || !still) state.quiet = 0;\r
      else state.quiet += 1;\r
      state.seen = s;\r
      if (state.quiet > 90) return;\r
\r
      resize();\r
      render(dt, reduced);\r
    };\r
\r
    const local = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      return {\r
        x: (event.clientX - rect.left) / Math.max(rect.width, 1),\r
        y: (event.clientY - rect.top) / Math.max(rect.height, 1),\r
        inside:\r
          event.clientX >= rect.left &&\r
          event.clientX <= rect.right &&\r
          event.clientY >= rect.top &&\r
          event.clientY <= rect.bottom\r
      };\r
    };\r
\r
    const onMove = (event: PointerEvent) => {\r
      const point = local(event);\r
      if (point.inside) {\r
        if (state.magnetGoal === 0 && state.magnet[4] < 0.02) {\r
          state.magnet[0] = point.x;\r
          state.magnet[1] = point.y;\r
          state.magnet[2] = 0;\r
          state.magnet[3] = 0;\r
        }\r
        state.pointer = [point.x, point.y];\r
      }\r
      state.magnetGoal = point.inside ? 1 : 0;\r
    };\r
\r
    const onLeave = () => {\r
      state.magnetGoal = 0;\r
    };\r
\r
    const onDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      if (!s.changeOnClick || event.button !== 0) return;\r
      if (\r
        event.target instanceof Element &&\r
        event.target.closest('a, button, input, textarea, select, label, [role="button"]')\r
      )\r
        return;\r
      const point = local(event);\r
      if (!point.inside) return;\r
      if (prefersReduced()) {\r
        state.channel += 1;\r
        return;\r
      }\r
      if (state.flipAt >= 0) return;\r
      state.flipAt = state.clock;\r
      state.flipped = false;\r
    };\r
\r
    const onLost = (event: Event) => {\r
      event.preventDefault();\r
      state.lost = true;\r
    };\r
\r
    const visibility = new IntersectionObserver(entries => {\r
      state.visible = entries.some(entry => entry.isIntersecting);\r
    });\r
    visibility.observe(container);\r
    const sizes = new ResizeObserver(resize);\r
    sizes.observe(container);\r
    resize();\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    window.addEventListener('pointerdown', onDown);\r
    document.documentElement.addEventListener('pointerleave', onLeave);\r
    canvas.addEventListener('webglcontextlost', onLost);\r
    state.raf = requestAnimationFrame(tick);\r
\r
    return () => {\r
      cancelAnimationFrame(state.raf);\r
      visibility.disconnect();\r
      sizes.disconnect();\r
      window.removeEventListener('pointermove', onMove);\r
      window.removeEventListener('pointerdown', onDown);\r
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
      canvas.removeEventListener('webglcontextlost', onLost);\r
      state.cells.forEach(target => deleteTarget(gl, target));\r
      state.glows.forEach(target => deleteTarget(gl, target));\r
      [content, glowSource, blur, display].forEach(item => gl.deleteProgram(item.program));\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
      canvas.remove();\r
    };\r
  }, []);\r
\r
  return <div ref={containerRef} className={[ROOT, className].filter(Boolean).join(' ')} style={style} />;\r
}\r
`,o=`'use client';\r
\r
import { useEffect, useMemo, useRef, type CSSProperties } from 'react';\r
\r
export interface CRTWarpProps {\r
  color?: string;\r
  backgroundColor?: string;\r
  lightMode?: boolean;\r
  speed?: number;\r
  variation?: number;\r
  waveAmplitude?: number;\r
  waveFrequency?: number;\r
  levels?: number;\r
  columns?: number;\r
  persistence?: number;\r
  curvature?: number;\r
  corners?: number;\r
  scanlineStrength?: number;\r
  scanlineFrequency?: number;\r
  mask?: 'aperture' | 'shadow' | 'slot' | 'none';\r
  maskStrength?: number;\r
  bloom?: number;\r
  bloomRadius?: number;\r
  rgbShift?: number;\r
  noise?: number;\r
  flicker?: number;\r
  interference?: number;\r
  vignette?: number;\r
  brightness?: number;\r
  intro?: boolean;\r
  mouseReact?: boolean;\r
  mouseStrength?: number;\r
  changeOnClick?: boolean;\r
  dpr?: number;\r
  fps?: number;\r
  paused?: boolean;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
type RGB = [number, number, number];\r
\r
interface Program {\r
  program: WebGLProgram;\r
  uniforms: Record<string, WebGLUniformLocation | null>;\r
}\r
\r
interface Target {\r
  texture: WebGLTexture;\r
  framebuffer: WebGLFramebuffer;\r
  width: number;\r
  height: number;\r
}\r
\r
const ROOT = 'relative h-full w-full overflow-hidden';\r
const CANVAS = 'absolute inset-0 block h-full w-full';\r
\r
const MASKS: Record<string, number> = { none: 0, aperture: 1, shadow: 2, slot: 3 };\r
const CELL_ASPECT = 0.56;\r
const INTRO_SECONDS = 1.6;\r
const FLIP_SECONDS = 0.8;\r
const TAU = Math.PI * 2;\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const CONTENT = \`#version 300 es\r
precision highp float;\r
uniform vec2 uGrid;\r
uniform float uTime;\r
uniform float uAmplitude;\r
uniform float uFrequency;\r
uniform float uLevels;\r
uniform float uDecay;\r
uniform float uReveal;\r
uniform float uRise;\r
uniform vec4 uSeed;\r
uniform sampler2D uPrevious;\r
out vec4 outColor;\r
\r
float field(vec2 uv, float t) {\r
  uv = (uv - 0.5) * uFrequency + 0.5;\r
  float f = 0.0;\r
  f += 0.7 * sin(0.5 * uv.x + t / 5.0 + uSeed.x);\r
  f += 3.0 * sin(1.6 * uv.y + t / 5.0 + uSeed.y);\r
  f += sin(10.0 * (uv.y * sin(t / 2.0 + uSeed.z) + uv.x * cos(t / 5.0)) + t / 2.0);\r
  float cx = uv.x + 0.5 * sin(t / 2.0 + uSeed.w);\r
  float cy = uv.y + 0.5 * cos(t / 4.0 + uSeed.x * 0.7);\r
  f += 0.4 * sin(sqrt(100.0 * cx * cx + 100.0 * cy * cy + 1.0) + t);\r
  f += 0.9 * sin(sqrt(75.0 * cx * cx + 25.0 * cy * cy + 1.0) + t);\r
  f -= 1.4 * sin(sqrt(256.0 * cx * cx + 25.0 * cy * cy + 1.0) + t);\r
  f += 0.3 * sin(0.5 * uv.y + uv.x + sin(t));\r
  return f;\r
}\r
\r
void main() {\r
  vec2 cell = floor(gl_FragCoord.xy);\r
  vec2 uv = (cell + 0.5) / uGrid;\r
  float s = (0.5 + 0.499 * sin(field(uv, uTime) * uAmplitude)) * mix(1.0 / uLevels, 1.0, uReveal);\r
  float level = floor(s * uLevels) / max(uLevels - 1.0, 1.0);\r
  float previous = texelFetch(uPrevious, ivec2(cell), 0).r;\r
  float lifted = min(level, previous + uRise);\r
  outColor = vec4(max(lifted, previous * uDecay - 0.004), level, 0.0, 1.0);\r
}\`;\r
\r
const GLOW = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uContent;\r
uniform vec2 uSize;\r
out vec4 outColor;\r
\r
void main() {\r
  float v = texture(uContent, gl_FragCoord.xy / uSize).r;\r
  outColor = vec4(v * v, 0.0, 0.0, 1.0);\r
}\`;\r
\r
const BLUR = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uSource;\r
uniform vec2 uSize;\r
uniform vec2 uDirection;\r
uniform float uSigma;\r
out vec4 outColor;\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uSize;\r
  float stride = max(uSigma * 0.55, 0.5);\r
  float total = 0.0;\r
  float sum = 0.0;\r
  for (int i = -7; i <= 7; i++) {\r
    float x = float(i) * stride;\r
    float w = exp(-0.5 * x * x / (uSigma * uSigma));\r
    sum += texture(uSource, uv + uDirection * x / uSize).r * w;\r
    total += w;\r
  }\r
  outColor = vec4(sum / total, 0.0, 0.0, 1.0);\r
}\`;\r
\r
const DISPLAY = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uContent;\r
uniform sampler2D uGlow;\r
uniform vec2 uGrid;\r
uniform vec2 uResolution;\r
uniform float uPixel;\r
uniform float uTime;\r
uniform vec3 uColor;\r
uniform vec3 uBackground;\r
uniform float uOpaque;\r
uniform float uLight;\r
uniform float uLines;\r
uniform float uScanline;\r
uniform float uCurve;\r
uniform float uCorners;\r
uniform int uMaskType;\r
uniform float uMask;\r
uniform float uBloom;\r
uniform float uBrightness;\r
uniform float uNoise;\r
uniform float uFlicker;\r
uniform float uInterference;\r
uniform float uVignette;\r
uniform float uShift;\r
uniform float uWarm;\r
uniform float uFocus;\r
uniform float uStatic;\r
uniform float uRoll;\r
uniform float uTear;\r
uniform float uGain;\r
uniform vec4 uMagnet;\r
uniform float uPurity;\r
out vec4 outColor;\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
vec2 curve(vec2 uv) {\r
  if (uCurve <= 0.0) return uv;\r
  vec2 p = (uv - 0.5) * 2.0;\r
  float corner = uCurve / sqrt(max(uCurve * uCurve - 2.0, 0.001));\r
  p = uCurve * p / sqrt(max(uCurve * uCurve - dot(p, p), 0.001));\r
  p /= corner;\r
  return p * 0.5 + 0.5;\r
}\r
\r
float lineValue(float x, float y) {\r
  if (x < 0.0 || x > 1.0 || y < 0.0 || y > 1.0) return 0.0;\r
  float cx = x * uGrid.x - 0.5;\r
  float c0 = floor(cx);\r
  int row = int(clamp(floor(y * uGrid.y), 0.0, uGrid.y - 1.0));\r
  float a = texelFetch(uContent, ivec2(int(clamp(c0, 0.0, uGrid.x - 1.0)), row), 0).r;\r
  float b = texelFetch(uContent, ivec2(int(clamp(c0 + 1.0, 0.0, uGrid.x - 1.0)), row), 0).r;\r
  float soft = mix(0.5, 0.14, uFocus);\r
  return pow(mix(a, b, smoothstep(0.5 - soft, 0.5 + soft, cx - c0)), 1.25);\r
}\r
\r
float beam(vec2 uv) {\r
  float ly = uv.y * uLines - 0.5;\r
  float r0 = floor(ly);\r
  float f = ly - r0;\r
  float a = lineValue(uv.x, (r0 + 0.5) / uLines);\r
  float b = lineValue(uv.x, (r0 + 1.5) / uLines);\r
  float nearest = f < 0.5 ? a : b;\r
  float sa = mix(0.16, 0.34, sqrt(a));\r
  float sb = mix(0.16, 0.34, sqrt(b));\r
  float lit = a * exp(-0.5 * f * f / (sa * sa)) + b * exp(-0.5 * (1.0 - f) * (1.0 - f) / (sb * sb));\r
  return mix(nearest, lit * 1.18, uScanline * mix(0.3, 1.0, uFocus));\r
}\r
\r
vec3 maskAt(vec2 px) {\r
  if (uMaskType == 0 || uMask <= 0.0) return vec3(1.0);\r
  float size = max(1.0, floor(uPixel + 0.5));\r
  vec2 q = floor(px / size);\r
  float low = 1.0 - uMask;\r
  vec3 m = vec3(low);\r
  float column = q.x;\r
  if (uMaskType == 2) column += mod(floor(q.y / 2.0), 2.0) * 1.5;\r
  int stripe = int(mod(floor(column), 3.0));\r
  if (stripe == 0) m.r = 1.0;\r
  else if (stripe == 1) m.g = 1.0;\r
  else m.b = 1.0;\r
  if (uMaskType == 2 && mod(q.y, 2.0) > 0.5) m *= mix(1.0, 0.72, uMask);\r
  if (uMaskType == 3) {\r
    float slot = mod(q.y + mod(floor(q.x / 3.0), 2.0) * 2.0, 4.0);\r
    if (slot < 1.0) m *= mix(1.0, 0.45, uMask);\r
  }\r
  return m / sqrt((1.0 + 2.0 * low) / 3.0);\r
}\r
\r
vec3 phosphor(vec3 cov) {\r
  float peak = max(max(uColor.r, uColor.g), max(uColor.b, 0.001));\r
  vec3 weight = 1.0 - uColor / peak;\r
  return uColor * cov * pow(max(cov, vec3(0.0001)), 0.7 * weight);\r
}\r
\r
void main() {\r
  vec2 frag = gl_FragCoord.xy / uResolution;\r
  float aspect = uResolution.x / uResolution.y;\r
  vec2 uv = curve(frag);\r
  float shape = 1.0;\r
  if (uCorners > 0.0) {\r
    float margin = uCorners * 0.035;\r
    float radius = uCorners * 0.1;\r
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0);\r
    vec2 box = (0.5 - margin) * vec2(aspect, 1.0);\r
    vec2 q = abs(p) - box + radius;\r
    float sd = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;\r
    float aa = max(fwidth(sd), 0.0005);\r
    shape = (1.0 - smoothstep(-aa, aa, sd)) * mix(1.0, smoothstep(0.0, 0.06, -sd), 0.35);\r
    uv = (uv - 0.5) / (1.0 - 2.0 * margin) + 0.5;\r
  }\r
  float rolling = step(0.0001, abs(uRoll));\r
  uv.y += uRoll;\r
  float wrapped = fract(uv.y);\r
  uv.y = mix(uv.y, wrapped, rolling);\r
  float offset = fract(uRoll);\r
  float reach = smoothstep(0.0, 0.08, min(offset, 1.0 - offset));\r
  float blank = mix(1.0, smoothstep(0.0, 0.05, wrapped) * smoothstep(1.0, 0.95, wrapped), rolling * reach);\r
\r
  float line = floor(uv.y * uLines);\r
  float tick = floor(uTime * 30.0);\r
  uv.x += uTear * (sin(uv.y * 21.0 + uTime * 37.0) * 0.6 + hash(vec2(line, tick)) - 0.5) * 0.05;\r
  uv.x += uInterference * 0.003 * (hash(vec2(line * 0.37, floor(uTime * 24.0))) - 0.5);\r
\r
  vec2 dp = (frag - uMagnet.xy) * vec2(aspect, 1.0);\r
  float fall = exp(-dot(dp, dp) / max(uMagnet.w * uMagnet.w, 0.0001));\r
  vec2 swirl = vec2(-dp.y, dp.x) / vec2(aspect, 1.0) * fall * uMagnet.z * 0.5;\r
  vec3 spread = mix(vec3(0.85), vec3(1.0, 0.6, 0.2), uPurity);\r
\r
  vec3 level = vec3(\r
    beam(uv + swirl * spread.r + vec2(uShift, 0.0)),\r
    beam(uv + swirl * spread.g),\r
    beam(uv + swirl * spread.b - vec2(uShift, 0.0))\r
  );\r
\r
  float turn = uTime * 0.35;\r
  vec2 axis = vec2(cos(turn), sin(turn));\r
  float lobe = dot(dp, axis) / max(uMagnet.w, 0.0001);\r
  float side = dot(dp, vec2(-axis.y, axis.x)) / max(uMagnet.w, 0.0001);\r
  vec3 purity = vec3(lobe, -0.35 * lobe + 0.6 * side, -lobe);\r
  level *= 1.0 + uPurity * fall * uMagnet.z * 0.9 * purity;\r
\r
  float glow = texture(uGlow, uv).r * uBloom;\r
  float hum = 1.0 - uInterference * 0.24 * smoothstep(0.2, 1.0, 0.5 + 0.5 * sin((frag.y - uTime * 0.09) * 6.2831853));\r
  float flick = 1.0 + uFlicker * 0.1 * (hash(vec2(floor(uTime * 60.0), 7.3)) - 0.5);\r
  float grain = hash(gl_FragCoord.xy + fract(uTime) * 173.0) - 0.5;\r
  vec2 v = frag - 0.5;\r
  float vignette = mix(1.0, smoothstep(0.0, 1.0, clamp(1.0 - dot(v, v) * 2.0, 0.0, 1.0)), uVignette);\r
  float gain = uBrightness * hum * flick * vignette * blank * uGain * uWarm;\r
\r
  float noise = hash(floor(gl_FragCoord.xy / (uPixel * 1.5)) + fract(uTime * 13.7) * 91.0);\r
  level = mix(level, vec3(noise * noise * 1.15), uStatic);\r
  level *= gain * (1.0 + grain * uNoise * 2.0);\r
  level *= maskAt(gl_FragCoord.xy);\r
  glow *= gain * shape * (1.0 + 0.6 * (1.0 - uFocus));\r
  level *= shape;\r
\r
  vec3 color;\r
  float alpha;\r
  if (uLight < 0.5) {\r
    vec3 cov = clamp(level, 0.0, 1.0);\r
    vec3 light = phosphor(cov) + uColor * glow * 0.5 * (1.0 - cov);\r
    vec3 excess = max(level - 1.1, 0.0);\r
    light += (1.0 - light) * (1.0 - exp(-excess * 0.6));\r
    light = clamp(light, 0.0, 1.0);\r
    color = uBackground + light * (1.0 - uBackground);\r
    alpha = max(max(light.r, light.g), light.b);\r
    if (uOpaque < 0.5) color = light;\r
  } else {\r
    vec3 cov = clamp(level * 0.86, 0.0, 0.88);\r
    cov += clamp(glow * 0.12, 0.0, 0.2) * (1.0 - cov);\r
    color = mix(uBackground, uColor, cov);\r
    alpha = max(max(cov.r, cov.g), cov.b);\r
    if (uOpaque < 0.5) color = uColor * cov;\r
  }\r
  outColor = uOpaque > 0.5 ? vec4(color, 1.0) : vec4(color, alpha);\r
}\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const smooth = (t: number) => t * t * (3 - 2 * t);\r
\r
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);\r
\r
let probe: CanvasRenderingContext2D | null = null;\r
\r
const parseColor = (value: string, fallback: RGB | null): RGB | null => {\r
  if (value === 'transparent') return null;\r
  if (typeof document === 'undefined') return fallback;\r
  if (!probe) probe = document.createElement('canvas').getContext('2d');\r
  if (!probe) return fallback;\r
  probe.fillStyle = '#000000';\r
  probe.fillStyle = value;\r
  const text = probe.fillStyle;\r
  if (text.startsWith('#')) {\r
    const hex = parseInt(text.slice(1), 16);\r
    return [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255];\r
  }\r
  const match = /rgba?\\(([\\d.]+),\\s*([\\d.]+),\\s*([\\d.]+)(?:,\\s*([\\d.]+))?/.exec(text);\r
  if (!match) return fallback;\r
  if (match[4] !== undefined && Number(match[4]) === 0) return null;\r
  return [Number(match[1]) / 255, Number(match[2]) / 255, Number(match[3]) / 255];\r
};\r
\r
const seedFor = (channel: number) => {\r
  const a = Math.sin(channel * 12.9898 + 1.7) * 43758.5453;\r
  const b = Math.sin(channel * 78.233 + 4.1) * 24634.6345;\r
  const c = Math.sin(channel * 37.719 + 2.9) * 17431.7731;\r
  const d = Math.sin(channel * 91.113 + 0.3) * 31337.1337;\r
  const f = (v: number) => (v - Math.floor(v)) * TAU;\r
  return channel === 0 ? [0, 0, 0, 0] : [f(a), f(b), f(c), f(d)];\r
};\r
\r
const introAt = (t: number) => {\r
  if (t >= INTRO_SECONDS) return [1, 1, 1];\r
  const reveal = smooth(clamp(t / INTRO_SECONDS, 0, 1));\r
  const warm = smooth(clamp(t / 0.6, 0, 1));\r
  const focus = smooth(clamp((t - 0.15) / (INTRO_SECONDS - 0.15), 0, 1));\r
  return [reveal, warm, focus];\r
};\r
\r
const compile = (gl: WebGL2RenderingContext, type: number, source: string) => {\r
  const shader = gl.createShader(type);\r
  if (!shader) return null;\r
  gl.shaderSource(shader, source);\r
  gl.compileShader(shader);\r
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {\r
    gl.deleteShader(shader);\r
    return null;\r
  }\r
  return shader;\r
};\r
\r
const createProgram = (gl: WebGL2RenderingContext, fragment: string, names: string[]): Program | null => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const shader = compile(gl, gl.FRAGMENT_SHADER, fragment);\r
  if (!vertex || !shader) return null;\r
  const program = gl.createProgram();\r
  if (!program) return null;\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, shader);\r
  gl.bindAttribLocation(program, 0, 'aPosition');\r
  gl.linkProgram(program);\r
  gl.deleteShader(vertex);\r
  gl.deleteShader(shader);\r
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {\r
    gl.deleteProgram(program);\r
    return null;\r
  }\r
  const uniforms: Record<string, WebGLUniformLocation | null> = {};\r
  names.forEach(name => {\r
    uniforms[name] = gl.getUniformLocation(program, name);\r
  });\r
  return { program, uniforms };\r
};\r
\r
const createTarget = (gl: WebGL2RenderingContext, width: number, height: number): Target => {\r
  const texture = gl.createTexture();\r
  gl.bindTexture(gl.TEXTURE_2D, texture);\r
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
  const framebuffer = gl.createFramebuffer();\r
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
  gl.clearColor(0, 0, 0, 1);\r
  gl.clear(gl.COLOR_BUFFER_BIT);\r
  return { texture, framebuffer, width, height };\r
};\r
\r
const deleteTarget = (gl: WebGL2RenderingContext, target: Target | null) => {\r
  if (!target) return;\r
  gl.deleteTexture(target.texture);\r
  gl.deleteFramebuffer(target.framebuffer);\r
};\r
\r
const prefersReduced = () =>\r
  typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);\r
\r
export default function CRTWarp({\r
  color = '#c755f7',\r
  backgroundColor = '#120f17',\r
  lightMode = false,\r
  speed = 0.5,\r
  variation = 0,\r
  waveAmplitude = 0.3,\r
  waveFrequency = 2.5,\r
  levels = 3,\r
  columns = 80,\r
  persistence = 0.4,\r
  curvature = 0.25,\r
  corners = 0,\r
  scanlineStrength = 0.6,\r
  scanlineFrequency = 200,\r
  mask = 'aperture',\r
  maskStrength = 0.3,\r
  bloom = 1.5,\r
  bloomRadius = 1,\r
  rgbShift = 0.003,\r
  noise = 0.1,\r
  flicker = 0.15,\r
  interference = 0.2,\r
  vignette = 0.3,\r
  brightness = 1,\r
  intro = true,\r
  mouseReact = true,\r
  mouseStrength = 0.5,\r
  changeOnClick = true,\r
  dpr = 2,\r
  fps = 60,\r
  paused = false,\r
  className = '',\r
  style\r
}: CRTWarpProps) {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const ink = useMemo((): RGB => parseColor(color, [0.78, 0.33, 0.97]) ?? [0.78, 0.33, 0.97], [color]);\r
  const paper = useMemo(() => parseColor(backgroundColor, [0.07, 0.06, 0.09]), [backgroundColor]);\r
\r
  const settings = {\r
    ink,\r
    paper,\r
    lightMode,\r
    speed,\r
    variation,\r
    amplitude: Math.max(0, waveAmplitude) / 0.28,\r
    frequency: Math.max(0.01, waveFrequency) / 2.2,\r
    levels: clamp(Math.round(levels), 2, 12),\r
    columns: clamp(Math.round(columns), 8, 400),\r
    persistence: clamp(persistence, 0, 0.98),\r
    curve: curvature > 0.001 ? 1.1 + 0.42 / curvature : 0,\r
    corners: clamp(corners, 0, 1),\r
    scanline: clamp(scanlineStrength, 0, 1),\r
    lines: clamp(scanlineFrequency, 20, 1200),\r
    mask: MASKS[mask] ?? 0,\r
    maskStrength: clamp(maskStrength, 0, 1),\r
    bloom: Math.max(0, bloom),\r
    bloomRadius: Math.max(0.05, bloomRadius),\r
    rgbShift,\r
    noise: Math.max(0, noise),\r
    flicker: Math.max(0, flicker),\r
    interference: Math.max(0, interference),\r
    vignette: clamp(vignette, 0, 1),\r
    brightness: Math.max(0, brightness),\r
    intro,\r
    mouseReact,\r
    mouseStrength: Math.max(0, mouseStrength),\r
    changeOnClick,\r
    dpr: Math.max(0.5, dpr),\r
    fps: Math.max(1, fps),\r
    paused\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    if (!container) return undefined;\r
    const canvas = document.createElement('canvas');\r
    canvas.className = CANVAS;\r
    container.appendChild(canvas);\r
    const gl = canvas.getContext('webgl2', {\r
      alpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false,\r
      premultipliedAlpha: true,\r
      powerPreference: 'high-performance'\r
    });\r
    if (!gl) {\r
      canvas.remove();\r
      return undefined;\r
    }\r
\r
    const content = createProgram(gl, CONTENT, [\r
      'uGrid',\r
      'uTime',\r
      'uAmplitude',\r
      'uFrequency',\r
      'uLevels',\r
      'uDecay',\r
      'uReveal',\r
      'uRise',\r
      'uSeed',\r
      'uPrevious'\r
    ]);\r
    const glowSource = createProgram(gl, GLOW, ['uContent', 'uSize']);\r
    const blur = createProgram(gl, BLUR, ['uSource', 'uSize', 'uDirection', 'uSigma']);\r
    const display = createProgram(gl, DISPLAY, [\r
      'uContent',\r
      'uGlow',\r
      'uGrid',\r
      'uResolution',\r
      'uPixel',\r
      'uTime',\r
      'uColor',\r
      'uBackground',\r
      'uOpaque',\r
      'uLight',\r
      'uLines',\r
      'uScanline',\r
      'uCurve',\r
      'uCorners',\r
      'uMaskType',\r
      'uMask',\r
      'uBloom',\r
      'uBrightness',\r
      'uNoise',\r
      'uFlicker',\r
      'uInterference',\r
      'uVignette',\r
      'uShift',\r
      'uWarm',\r
      'uFocus',\r
      'uStatic',\r
      'uRoll',\r
      'uTear',\r
      'uGain',\r
      'uMagnet',\r
      'uPurity'\r
    ]);\r
    if (!content || !glowSource || !blur || !display) {\r
      canvas.remove();\r
      return undefined;\r
    }\r
\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    const buffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const state = {\r
      width: 1,\r
      height: 1,\r
      pixel: 1,\r
      grid: [0, 0],\r
      cells: [null, null] as (Target | null)[],\r
      glows: [null, null] as (Target | null)[],\r
      flip: 0,\r
      time: 0,\r
      clock: 0,\r
      last: 0,\r
      frame: 0,\r
      raf: 0,\r
      visible: false,\r
      introAt: -1,\r
      flipAt: -1,\r
      flipped: true,\r
      channel: 0,\r
      pointer: [0.5, 0.5],\r
      magnet: [0.5, 0.5, 0, 0, 0],\r
      magnetGoal: 0,\r
      lost: false,\r
      quiet: 0,\r
      seen: null as typeof settings | null\r
    };\r
\r
    const ensureTargets = () => {\r
      const s = settingsRef.current;\r
      const cols = s.columns;\r
      const rows = clamp(Math.round((cols * CELL_ASPECT * state.height) / Math.max(state.width, 1)), 4, 300);\r
      if (cols !== state.grid[0] || rows !== state.grid[1]) {\r
        state.cells.forEach(target => deleteTarget(gl, target));\r
        state.cells = [createTarget(gl, cols, rows), createTarget(gl, cols, rows)];\r
        state.grid = [cols, rows];\r
      }\r
      const gw = Math.max(1, Math.round(state.width / 4));\r
      const gh = Math.max(1, Math.round(state.height / 4));\r
      const glow = state.glows[0];\r
      if (!glow || glow.width !== gw || glow.height !== gh) {\r
        state.glows.forEach(target => deleteTarget(gl, target));\r
        state.glows = [createTarget(gl, gw, gh), createTarget(gl, gw, gh)];\r
      }\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const ratio = Math.min(window.devicePixelRatio || 1, s.dpr);\r
      const width = Math.max(1, Math.round(container.clientWidth * ratio));\r
      const height = Math.max(1, Math.round(container.clientHeight * ratio));\r
      state.pixel = ratio;\r
      if (width === state.width && height === state.height) return;\r
      state.quiet = 0;\r
      state.width = width;\r
      state.height = height;\r
      canvas.width = width;\r
      canvas.height = height;\r
    };\r
\r
    const draw = (target: Target | null, width: number, height: number) => {\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.framebuffer : null);\r
      gl.viewport(0, 0, width, height);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const bindTexture = (unit: number, texture: WebGLTexture, location: WebGLUniformLocation | null) => {\r
      gl.activeTexture(gl.TEXTURE0 + unit);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.uniform1i(location, unit);\r
    };\r
\r
    const render = (dt: number, reduced: boolean) => {\r
      const s = settingsRef.current;\r
      ensureTargets();\r
      const [cols, rows] = state.grid;\r
      const seed = seedFor(s.variation + state.channel);\r
      const introClock = state.introAt < 0 ? 0 : state.clock - state.introAt;\r
      const [reveal, warm, focus] = s.intro && !reduced ? introAt(introClock) : [1, 1, 1];\r
\r
      const previous = state.cells[state.flip];\r
      const next = state.cells[1 - state.flip];\r
      const [glowA, glowB] = state.glows;\r
      if (!previous || !next || !glowA || !glowB) return;\r
      gl.useProgram(content.program);\r
      gl.uniform2f(content.uniforms.uGrid, cols, rows);\r
      gl.uniform1f(content.uniforms.uTime, state.time);\r
      gl.uniform1f(content.uniforms.uAmplitude, s.amplitude);\r
      gl.uniform1f(content.uniforms.uFrequency, s.frequency);\r
      gl.uniform1f(content.uniforms.uLevels, s.levels);\r
      gl.uniform1f(content.uniforms.uDecay, reduced ? 0 : s.persistence ** (dt * 60));\r
      gl.uniform1f(content.uniforms.uReveal, reveal);\r
      gl.uniform1f(content.uniforms.uRise, reveal < 1 ? dt / 0.22 : 1);\r
      gl.uniform4f(content.uniforms.uSeed, seed[0], seed[1], seed[2], seed[3]);\r
      bindTexture(0, previous.texture, content.uniforms.uPrevious);\r
      draw(next, cols, rows);\r
      state.flip = 1 - state.flip;\r
\r
      gl.useProgram(glowSource.program);\r
      gl.uniform2f(glowSource.uniforms.uSize, glowA.width, glowA.height);\r
      bindTexture(0, next.texture, glowSource.uniforms.uContent);\r
      draw(glowA, glowA.width, glowA.height);\r
      const sigma = Math.max(0.6, (glowA.height / 48) * s.bloomRadius);\r
      gl.useProgram(blur.program);\r
      gl.uniform2f(blur.uniforms.uSize, glowA.width, glowA.height);\r
      gl.uniform1f(blur.uniforms.uSigma, sigma);\r
      gl.uniform2f(blur.uniforms.uDirection, 1, 0);\r
      bindTexture(0, glowA.texture, blur.uniforms.uSource);\r
      draw(glowB, glowB.width, glowB.height);\r
      gl.uniform2f(blur.uniforms.uDirection, 0, 1);\r
      bindTexture(0, glowB.texture, blur.uniforms.uSource);\r
      draw(glowA, glowA.width, glowA.height);\r
\r
      let roll = 0;\r
      let tear = 0;\r
      let staticNoise = 0;\r
      let gain = 1;\r
      if (state.flipAt >= 0) {\r
        const t = state.clock - state.flipAt;\r
        if (!state.flipped && t >= 0.22) {\r
          state.flipped = true;\r
          state.channel += 1;\r
        }\r
        if (t >= FLIP_SECONDS) {\r
          state.flipAt = -1;\r
        } else {\r
          const p = t / FLIP_SECONDS;\r
          roll = easeInOut(p);\r
          tear = Math.sin(Math.PI * clamp(t / 0.5, 0, 1)) * 0.6;\r
          staticNoise = Math.sin(Math.PI * clamp(t / 0.55, 0, 1)) * 0.75;\r
          gain = 1 - 0.3 * Math.sin(Math.PI * p);\r
        }\r
      }\r
\r
      gl.useProgram(display.program);\r
      const u = display.uniforms;\r
      bindTexture(0, next.texture, u.uContent);\r
      bindTexture(1, glowA.texture, u.uGlow);\r
      gl.uniform2f(u.uGrid, cols, rows);\r
      gl.uniform2f(u.uResolution, state.width, state.height);\r
      gl.uniform1f(u.uPixel, state.pixel);\r
      gl.uniform1f(u.uTime, reduced ? 0 : state.clock);\r
      gl.uniform3f(u.uColor, s.ink[0], s.ink[1], s.ink[2]);\r
      const paperColor = s.paper ?? [0, 0, 0];\r
      gl.uniform3f(u.uBackground, paperColor[0], paperColor[1], paperColor[2]);\r
      gl.uniform1f(u.uOpaque, s.paper ? 1 : 0);\r
      gl.uniform1f(u.uLight, s.lightMode ? 1 : 0);\r
      gl.uniform1f(u.uLines, s.lines);\r
      gl.uniform1f(u.uScanline, s.scanline);\r
      gl.uniform1f(u.uCurve, s.curve);\r
      gl.uniform1f(u.uCorners, s.corners);\r
      gl.uniform1i(u.uMaskType, s.mask);\r
      gl.uniform1f(u.uMask, s.maskStrength);\r
      gl.uniform1f(u.uBloom, s.bloom);\r
      gl.uniform1f(u.uBrightness, s.brightness);\r
      gl.uniform1f(u.uNoise, s.noise);\r
      gl.uniform1f(u.uFlicker, reduced ? 0 : s.flicker);\r
      gl.uniform1f(u.uInterference, s.interference);\r
      gl.uniform1f(u.uVignette, s.vignette);\r
      gl.uniform1f(u.uShift, s.rgbShift);\r
      gl.uniform1f(u.uWarm, warm);\r
      gl.uniform1f(u.uFocus, focus);\r
      gl.uniform1f(u.uStatic, staticNoise);\r
      gl.uniform1f(u.uRoll, roll);\r
      gl.uniform1f(u.uTear, tear);\r
      gl.uniform1f(u.uGain, gain);\r
      gl.uniform4f(u.uMagnet, state.magnet[0], 1 - state.magnet[1], state.magnet[4] * s.mouseStrength * 2, 0.24);\r
      gl.uniform1f(u.uPurity, s.mask > 0 ? 1 : 0);\r
      draw(null, state.width, state.height);\r
    };\r
\r
    const tick = (now: number) => {\r
      state.raf = requestAnimationFrame(tick);\r
      if (!state.visible || document.hidden || state.lost) {\r
        state.last = now;\r
        return;\r
      }\r
      const s = settingsRef.current;\r
      const interval = 1000 / s.fps;\r
      if (state.last && now - state.last < interval - 1) return;\r
      const dt = state.last ? Math.min((now - state.last) / 1000, 0.1) : 1 / 60;\r
      state.last = now;\r
      const reduced = prefersReduced();\r
      state.clock += dt;\r
      if (state.introAt < 0) state.introAt = state.clock;\r
      if (!s.paused && !reduced) state.time += dt * s.speed;\r
\r
      const m = state.magnet;\r
      const omega = TAU / 0.3;\r
      for (let i = 0; i < 2; i++) {\r
        const accel = -omega * omega * (m[i] - state.pointer[i]) - 2 * omega * m[2 + i];\r
        m[2 + i] += accel * dt;\r
        m[i] += m[2 + i] * dt;\r
      }\r
      const goal = s.mouseReact && !reduced ? state.magnetGoal : 0;\r
      m[4] += (goal - m[4]) * (1 - Math.exp(-dt / 0.18));\r
\r
      const still = s.paused || reduced;\r
      const settling =\r
        Math.abs(m[4] - goal) > 0.002 ||\r
        (m[4] > 0.002 && (Math.abs(m[2]) + Math.abs(m[3]) > 0.0005 || Math.abs(m[0] - state.pointer[0]) > 0.0005));\r
      const transient =\r
        state.flipAt >= 0 || (s.intro && !reduced && state.clock - state.introAt < INTRO_SECONDS) || settling;\r
      if (state.seen !== s || transient || !still) state.quiet = 0;\r
      else state.quiet += 1;\r
      state.seen = s;\r
      if (state.quiet > 90) return;\r
\r
      resize();\r
      render(dt, reduced);\r
    };\r
\r
    const local = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      return {\r
        x: (event.clientX - rect.left) / Math.max(rect.width, 1),\r
        y: (event.clientY - rect.top) / Math.max(rect.height, 1),\r
        inside:\r
          event.clientX >= rect.left &&\r
          event.clientX <= rect.right &&\r
          event.clientY >= rect.top &&\r
          event.clientY <= rect.bottom\r
      };\r
    };\r
\r
    const onMove = (event: PointerEvent) => {\r
      const point = local(event);\r
      if (point.inside) {\r
        if (state.magnetGoal === 0 && state.magnet[4] < 0.02) {\r
          state.magnet[0] = point.x;\r
          state.magnet[1] = point.y;\r
          state.magnet[2] = 0;\r
          state.magnet[3] = 0;\r
        }\r
        state.pointer = [point.x, point.y];\r
      }\r
      state.magnetGoal = point.inside ? 1 : 0;\r
    };\r
\r
    const onLeave = () => {\r
      state.magnetGoal = 0;\r
    };\r
\r
    const onDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      if (!s.changeOnClick || event.button !== 0) return;\r
      if (\r
        event.target instanceof Element &&\r
        event.target.closest('a, button, input, textarea, select, label, [role="button"]')\r
      )\r
        return;\r
      const point = local(event);\r
      if (!point.inside) return;\r
      if (prefersReduced()) {\r
        state.channel += 1;\r
        return;\r
      }\r
      if (state.flipAt >= 0) return;\r
      state.flipAt = state.clock;\r
      state.flipped = false;\r
    };\r
\r
    const onLost = (event: Event) => {\r
      event.preventDefault();\r
      state.lost = true;\r
    };\r
\r
    const visibility = new IntersectionObserver(entries => {\r
      state.visible = entries.some(entry => entry.isIntersecting);\r
    });\r
    visibility.observe(container);\r
    const sizes = new ResizeObserver(resize);\r
    sizes.observe(container);\r
    resize();\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    window.addEventListener('pointerdown', onDown);\r
    document.documentElement.addEventListener('pointerleave', onLeave);\r
    canvas.addEventListener('webglcontextlost', onLost);\r
    state.raf = requestAnimationFrame(tick);\r
\r
    return () => {\r
      cancelAnimationFrame(state.raf);\r
      visibility.disconnect();\r
      sizes.disconnect();\r
      window.removeEventListener('pointermove', onMove);\r
      window.removeEventListener('pointerdown', onDown);\r
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
      canvas.removeEventListener('webglcontextlost', onLost);\r
      state.cells.forEach(target => deleteTarget(gl, target));\r
      state.glows.forEach(target => deleteTarget(gl, target));\r
      [content, glowSource, blur, display].forEach(item => gl.deleteProgram(item.program));\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
      canvas.remove();\r
    };\r
  }, []);\r
\r
  return <div ref={containerRef} className={[ROOT, className].filter(Boolean).join(' ')} style={style} />;\r
}\r
`,a={dependencies:"",usage:`import CRTWarp from './CRTWarp';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <CRTWarp
    color="#c755f7"
    backgroundColor="#120f17"
    mask="aperture"
    curvature={0.25}
    persistence={0.4}
  />
</div>`,code:r,css:n,tailwind:e,tsCode:t,tsTailwind:o};export{a as crtWarp};
