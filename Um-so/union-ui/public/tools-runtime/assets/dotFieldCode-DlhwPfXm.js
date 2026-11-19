const n=`'use client';\r
\r
import { useEffect, useRef, useState } from 'react';\r
import './DotField.css';\r
\r
const PIXEL_BUDGET = 9e6;\r
const MAX_DOTS = 120000;\r
const PATTERNS = { grid: 0, hex: 1, spiral: 2, scatter: 3 };\r
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));\r
\r
const VERTEX = \`#version 300 es\r
precision highp float;\r
layout(location = 0) in vec4 aDot;\r
uniform vec2 uSize;\r
uniform float uPixel;\r
uniform float uRadius;\r
uniform float uCell;\r
uniform vec4 uLens;\r
uniform vec2 uWarp;\r
uniform vec3 uGlow;\r
uniform vec3 uFrom;\r
uniform vec3 uTo;\r
uniform vec4 uGlowColor;\r
uniform vec3 uGradient;\r
uniform float uTime;\r
uniform float uWave;\r
uniform float uSparkle;\r
uniform float uFocus;\r
uniform float uBase;\r
uniform float uLight;\r
out vec2 vLocal;\r
out float vRadius;\r
out float vBlur;\r
out float vHalo;\r
out float vHaloWidth;\r
out vec3 vColor;\r
out float vAlpha;\r
\r
vec3 toRgb(vec3 lab) {\r
  float l = lab.x + 0.3963377774 * lab.y + 0.2158037573 * lab.z;\r
  float m = lab.x - 0.1055613458 * lab.y - 0.0638541728 * lab.z;\r
  float s = lab.x - 0.0894841775 * lab.y - 1.291485548 * lab.z;\r
  vec3 lms = vec3(l * l * l, m * m * m, s * s * s);\r
  vec3 lin = clamp(vec3(\r
    4.0767416621 * lms.x - 3.3077115913 * lms.y + 0.2309699292 * lms.z,\r
    -1.2684380046 * lms.x + 2.6097574011 * lms.y - 0.3413193965 * lms.z,\r
    -0.0041960863 * lms.x - 0.7034186147 * lms.y + 1.707614701 * lms.z\r
  ), 0.0, 1.0);\r
  return mix(lin * 12.92, 1.055 * pow(lin, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, lin));\r
}\r
\r
vec3 blend(vec3 a, vec3 b, float t) {\r
  vec2 ab = mix(a.yz, b.yz, t);\r
  float chroma = mix(length(a.yz), length(b.yz), t);\r
  float len = length(ab);\r
  return vec3(mix(a.x, b.x, t), len > 1e-5 ? ab * (chroma / len) : ab);\r
}\r
\r
vec3 wave(vec2 p, float t) {\r
  float ay = p.x * 0.018 + t + 1.1 * sin(p.y * 0.016 - t * 0.4);\r
  float ax = p.y * 0.021 + t * 0.7 + 1.3 * sin(p.x * 0.013 + t * 0.3);\r
  float spread = cos(ay) * 0.0176 * cos(p.y * 0.016 - t * 0.4) + 0.5 * cos(ax) * 0.0169 * cos(p.x * 0.013 + t * 0.3);\r
  return uWave * vec3(0.5 * sin(ax), sin(ay), spread);\r
}\r
\r
void main() {\r
  vec2 corner = vec2(float(gl_VertexID & 1), float(gl_VertexID >> 1)) * 2.0 - 1.0;\r
  vec2 center = uSize * 0.5;\r
  vec3 swell = wave(aDot.xy, uTime);\r
  vec2 source = center + (aDot.xy - center) * mix(1.12, 1.0, uFocus) + swell.xy;\r
\r
  vec2 rel = source - uLens.xy;\r
  float x = length(rel) / uLens.z;\r
  float y = clamp(1.0 - x * x, 0.0, 1.0);\r
  float w = y * y * y;\r
  float k = uWarp.x * uLens.w;\r
  float grow = 1.0 + k * w;\r
  float spread = 1.0 + k * (w - 6.0 * x * x * y * y);\r
  float theta = uWarp.y * uLens.w * w;\r
  vec2 turn = vec2(cos(theta), sin(theta));\r
  vec2 display = uLens.xy + vec2(turn.x * rel.x - turn.y * rel.y, turn.y * rel.x + turn.x * rel.y) * grow;\r
  float scale = sqrt(max(grow * spread, 0.02));\r
\r
  float spark = 0.0;\r
  if (uSparkle > 0.0) {\r
    float phase = 0.5 + 0.5 * sin(uTime * (0.55 + aDot.w * 0.9) + aDot.z * 6.2831853);\r
    spark = pow(phase, 48.0) * step(0.72, fract(aDot.z * 7.31 + aDot.w * 3.17)) * uSparkle;\r
  }\r
\r
  float pool = 0.0;\r
  if (uGlow.x > 0.0) {\r
    float g = length(display - uLens.xy) / uGlow.x;\r
    float q = clamp(1.0 - g * g, 0.0, 1.0);\r
    pool = q * q * uGlow.y * uLens.w;\r
  }\r
\r
  float radius = uRadius * (1.0 + 0.7 * spark);\r
  float device = radius * scale * uPixel;\r
  float fade = 1.0;\r
  if (device < 0.75) {\r
    fade = device * device / 0.5625;\r
    radius = 0.75 / (scale * uPixel);\r
  }\r
  float blur = (1.0 - uFocus) * uCell * 0.42;\r
  float energy = pow(radius / (radius + blur), 1.15);\r
  float halo = pool * uGlow.z;\r
  float haloWidth = 2.0 + radius * 1.5;\r
  float pad = radius + blur * 1.2 + 1.5 / (scale * uPixel) + (halo > 0.0 ? haloWidth * 2.5 : 0.0);\r
\r
  float t = clamp(dot(aDot.xy - center, uGradient.xy) / uGradient.z + 0.5, 0.0, 1.0);\r
  vec3 tone = blend(uFrom, uTo, t);\r
  vec3 deep = vec3(tone.x * 0.72, tone.yz * 1.3);\r
  vec3 base = toRgb(tone);\r
  vec3 lit = toRgb(mix(deep, uGlowColor.xyz, uGlowColor.w));\r
  vec3 color = mix(base, lit, clamp(pool, 0.0, 1.0) * 0.8);\r
  color = mix(color, uLight > 0.5 ? color * 0.6 : vec3(1.0), spark * 0.55);\r
\r
  vLocal = corner * pad;\r
  vRadius = radius + blur;\r
  vBlur = blur * 0.7;\r
  vHalo = halo;\r
  vHaloWidth = haloWidth;\r
  vColor = color;\r
  float shade = clamp(1.0 - swell.z * 2.5, 0.4, 1.6);\r
  vAlpha = mix(min(uBase * shade, 1.0), 1.0, clamp(max(pool, spark), 0.0, 1.0)) * fade * energy * smoothstep(0.0, 0.25, uFocus + 0.08);\r
  vec2 point = display + corner * pad * scale;\r
  gl_Position = vec4(point.x / uSize.x * 2.0 - 1.0, 1.0 - point.y / uSize.y * 2.0, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform float uOpacity;\r
in vec2 vLocal;\r
in float vRadius;\r
in float vBlur;\r
in float vHalo;\r
in float vHaloWidth;\r
in vec3 vColor;\r
in float vAlpha;\r
out vec4 fragColor;\r
\r
void main() {\r
  float dist = length(vLocal);\r
  float d = dist - vRadius;\r
  float edge = max(fwidth(dist), 1e-4) + vBlur;\r
  float cover = 1.0 - smoothstep(-0.5 * edge, 0.5 * edge, d);\r
  float glow = vHalo * exp(-max(d, 0.0) / vHaloWidth) * 0.5;\r
  float alpha = min(cover + glow, 1.0) * vAlpha * uOpacity;\r
  if (alpha < 0.002) discard;\r
  fragColor = vec4(vColor * alpha, alpha);\r
}\`;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const parseColor = value => {\r
  const text = String(value || '').trim();\r
  const hex = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text);\r
  if (hex) {\r
    const full = hex[1].length === 3 ? hex[1].replace(/./g, digit => digit + digit) : hex[1];\r
    return [0, 2, 4].map(index => parseInt(full.slice(index, index + 2), 16) / 255);\r
  }\r
  const rgb = /^rgba?\\(\\s*([\\d.]+)[\\s,]+([\\d.]+)[\\s,]+([\\d.]+)/i.exec(text);\r
  if (rgb) return [rgb[1], rgb[2], rgb[3]].map(channel => clamp(parseFloat(channel) / 255, 0, 1));\r
  return null;\r
};\r
\r
const toLinear = channel => (channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4));\r
\r
const toOklab = color => {\r
  const [r, g, b] = color.map(toLinear);\r
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
const toInk = (value, fallback, light) => {\r
  const lab = toOklab(parseColor(value) || fallback);\r
  if (!light) return lab;\r
  const hue = (Math.atan2(lab[2], lab[1]) * 180) / Math.PI;\r
  const warmth = clamp(1 - Math.abs(hue - 85) / 40, 0, 1);\r
  const ceiling = 0.6 + 0.16 * warmth * warmth * (3 - 2 * warmth);\r
  if (lab[0] <= ceiling) return lab;\r
  const boost = 1 + (lab[0] - ceiling) * 1.6;\r
  return [ceiling, lab[1] * boost, lab[2] * boost];\r
};\r
\r
const chroma = value => {\r
  const lab = toOklab(parseColor(value) || [1, 1, 1]);\r
  return Math.hypot(lab[1], lab[2]);\r
};\r
\r
const hash = (a, b, c) => {\r
  let h = (Math.imul(a, 374761393) + Math.imul(b, 668265263) + Math.imul(c, 1274126177)) | 0;\r
  h = Math.imul(h ^ (h >>> 13), 1274126177);\r
  h ^= h >>> 16;\r
  return (h >>> 0) / 4294967296;\r
};\r
\r
const lensReach = (radius, strength, twist) => {\r
  let peak = 0;\r
  for (let index = 1; index < 48; index++) {\r
    const x = index / 48;\r
    const w = (1 - x * x) ** 3;\r
    const sigma = x * radius;\r
    const grow = 1 + strength * w;\r
    const theta = twist * w;\r
    peak = Math.max(peak, Math.hypot(sigma * (grow * Math.cos(theta) - 1), sigma * grow * Math.sin(theta)));\r
  }\r
  return peak;\r
};\r
\r
const buildDots = (width, height, step, pattern, margin) => {\r
  const cx = width / 2;\r
  const cy = height / 2;\r
  const minX = -margin;\r
  const maxX = width + margin;\r
  const minY = -margin;\r
  const maxY = height + margin;\r
  const out = [];\r
  const push = (x, y, a, b) => {\r
    if (x >= minX && x <= maxX && y >= minY && y <= maxY) out.push(x, y, a, b);\r
  };\r
  if (pattern === PATTERNS.spiral) {\r
    const spacing = step / Math.sqrt(Math.PI);\r
    const reach = Math.hypot(width / 2 + margin, height / 2 + margin);\r
    const count = Math.ceil((reach / spacing) ** 2);\r
    for (let index = 0; index < count; index++) {\r
      const r = spacing * Math.sqrt(index + 0.5);\r
      const angle = index * GOLDEN_ANGLE;\r
      push(cx + r * Math.cos(angle), cy + r * Math.sin(angle), hash(index, 0, 3), hash(index, 0, 4));\r
    }\r
  } else {\r
    const rowStep = pattern === PATTERNS.hex ? (step * Math.sqrt(3)) / 2 : step;\r
    const cols = Math.ceil((width / 2 + margin) / step) + 1;\r
    const rows = Math.ceil((height / 2 + margin) / rowStep) + 1;\r
    for (let row = -rows; row <= rows; row++) {\r
      for (let col = -cols; col <= cols; col++) {\r
        let x = cx + col * step + (pattern === PATTERNS.hex && row & 1 ? step / 2 : 0);\r
        let y = cy + row * rowStep;\r
        if (pattern === PATTERNS.scatter) {\r
          x += (hash(col, row, 1) - 0.5) * step * 0.8;\r
          y += (hash(col, row, 2) - 0.5) * step * 0.8;\r
        }\r
        push(x, y, hash(col, row, 3), hash(col, row, 4));\r
      }\r
    }\r
  }\r
  return new Float32Array(out);\r
};\r
\r
const compile = (gl, type, source) => {\r
  const shader = gl.createShader(type);\r
  if (!shader) return null;\r
  gl.shaderSource(shader, source);\r
  gl.compileShader(shader);\r
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {\r
    console.error(gl.getShaderInfoLog(shader));\r
    gl.deleteShader(shader);\r
    return null;\r
  }\r
  return shader;\r
};\r
\r
const link = gl => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
  const program = vertex && fragment ? gl.createProgram() : null;\r
  if (!vertex || !fragment || !program) {\r
    if (vertex) gl.deleteShader(vertex);\r
    if (fragment) gl.deleteShader(fragment);\r
    return null;\r
  }\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
  gl.linkProgram(program);\r
  gl.deleteShader(vertex);\r
  gl.deleteShader(fragment);\r
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {\r
    console.error(gl.getProgramInfoLog(program));\r
    gl.deleteProgram(program);\r
    return null;\r
  }\r
  const uniforms = {};\r
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
  for (let index = 0; index < count; index++) {\r
    const info = gl.getActiveUniform(program, index);\r
    if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const DotField = ({\r
  dotRadius = 1.5,\r
  dotSpacing = 14,\r
  pattern = 'grid',\r
  gradientFrom = '#5227FF',\r
  gradientTo = '#FF9FFC',\r
  gradientAngle = 135,\r
  cursorRadius = 240,\r
  bulgeStrength = 0.6,\r
  twist = 0,\r
  glowColor = '#ffffff',\r
  glowRadius = 160,\r
  glowIntensity = 0.8,\r
  baseOpacity = 0.55,\r
  waveAmplitude = 0,\r
  sparkle = false,\r
  speed = 1,\r
  interactive = true,\r
  holdToZoom = true,\r
  intro = true,\r
  lightMode = false,\r
  opacity = 1,\r
  maxDevicePixelRatio = 2,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const [generation, setGeneration] = useState(0);\r
\r
  const radius = clamp(dotRadius, 0.25, 12);\r
  const step = radius * 2 + clamp(dotSpacing, 1, 200);\r
  const angle = (gradientAngle * Math.PI) / 180;\r
  const settings = {\r
    radius,\r
    step,\r
    pattern: PATTERNS[pattern] ?? PATTERNS.grid,\r
    from: toInk(gradientFrom, [0.32, 0.15, 1], lightMode),\r
    to: toInk(gradientTo, [1, 0.62, 0.99], lightMode),\r
    glowColor: toInk(glowColor, [1, 1, 1], lightMode),\r
    glowWeight: lightMode ? clamp((chroma(glowColor) - 0.02) / 0.06, 0, 1) : 1,\r
    direction: [Math.sin(angle), -Math.cos(angle)],\r
    lensRadius: clamp(cursorRadius, 20, 2000),\r
    strength: clamp(bulgeStrength, -1, 1),\r
    twist: (clamp(twist, -360, 360) * Math.PI) / 180,\r
    glowRadius: Math.max(0, glowRadius),\r
    glowIntensity: clamp(glowIntensity, 0, 2),\r
    base: clamp(baseOpacity, 0, 1),\r
    wave: clamp(waveAmplitude, 0, 60),\r
    sparkle: sparkle ? 1 : 0,\r
    speed: Math.max(0, speed),\r
    interactive,\r
    holdToZoom,\r
    intro,\r
    light: lightMode,\r
    opacity: clamp(opacity, 0, 1),\r
    maxRatio: clamp(maxDevicePixelRatio, 0.5, 3)\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    if (!container || !canvas) return;\r
\r
    const gl = canvas.getContext('webgl2', {\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false,\r
      powerPreference: 'high-performance'\r
    });\r
    const shader = gl ? link(gl) : null;\r
    if (!gl || !shader) return;\r
\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
    const vao = gl.createVertexArray();\r
    const buffer = gl.createBuffer();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 16, 0);\r
    gl.vertexAttribDivisor(0, 1);\r
    gl.bindVertexArray(null);\r
\r
    const size = { width: 1, height: 1, ratio: 1 };\r
    const pointer = { x: 0, y: 0, inside: false, down: false };\r
    const lens = { x: 0, y: 0, vx: 0, vy: 0, presence: 0, zoom: 0, ready: false };\r
    let layoutKey = '';\r
    let count = 0;\r
    let time = Math.random() * 100;\r
    let focus = settingsRef.current.intro && !reduced && generation === 0 ? 0 : 1;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let pageVisible = document.visibilityState !== 'hidden';\r
    let lost = false;\r
\r
    const strengthOf = (s, zoom) => {\r
      const base = s.strength >= 0 ? s.strength * 1.2 : s.strength * 0.7;\r
      return clamp(base * (1 + zoom * 0.6), -0.85, 1.45);\r
    };\r
\r
    const layout = () => {\r
      const s = settingsRef.current;\r
      const reach = lensReach(s.lensRadius, strengthOf(s, s.holdToZoom ? 1 : 0), s.twist * (s.holdToZoom ? 1.6 : 1));\r
      const margin = Math.ceil(reach + s.wave + s.step * 2);\r
      const area = (size.width + margin * 2) * (size.height + margin * 2);\r
      const step = Math.max(s.step, Math.sqrt(area / MAX_DOTS));\r
      const key = \`\${size.width}|\${size.height}|\${step}|\${s.pattern}|\${margin}\`;\r
      if (key === layoutKey) return;\r
      layoutKey = key;\r
      const data = buildDots(size.width, size.height, step, s.pattern, margin);\r
      count = data.length / 4;\r
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const rect = container.getBoundingClientRect();\r
      const cssWidth = Math.max(1, rect.width);\r
      const cssHeight = Math.max(1, rect.height);\r
      const ratio = Math.min(\r
        window.devicePixelRatio || 1,\r
        s.maxRatio,\r
        Math.sqrt(PIXEL_BUDGET / (cssWidth * cssHeight))\r
      );\r
      const width = Math.max(1, Math.round(cssWidth * ratio));\r
      const height = Math.max(1, Math.round(cssHeight * ratio));\r
      if (canvas.width !== width || canvas.height !== height) {\r
        canvas.width = width;\r
        canvas.height = height;\r
      }\r
      size.width = cssWidth;\r
      size.height = cssHeight;\r
      size.ratio = width / cssWidth;\r
      layout();\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (lost) return;\r
      const s = settingsRef.current;\r
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05);\r
      last = Math.max(last, now);\r
      if (!reduced) time += dt * s.speed;\r
      if (focus < 1) focus = Math.min(1, focus + dt / 1.8);\r
\r
      const tracking = s.interactive && pointer.inside;\r
      if (tracking && (!lens.ready || lens.presence < 0.01)) {\r
        lens.x = pointer.x;\r
        lens.y = pointer.y;\r
        lens.vx = 0;\r
        lens.vy = 0;\r
        lens.ready = true;\r
      }\r
      if (lens.ready) {\r
        const omega = 18;\r
        const f = 1 + 2 * dt * omega;\r
        const oo = omega * omega;\r
        const hoo = dt * oo;\r
        const hhoo = dt * hoo;\r
        const inv = 1 / (f + hhoo);\r
        const nx = (f * lens.x + dt * lens.vx + hhoo * pointer.x) * inv;\r
        const ny = (f * lens.y + dt * lens.vy + hhoo * pointer.y) * inv;\r
        lens.vx = (lens.vx + hoo * (pointer.x - lens.x)) * inv;\r
        lens.vy = (lens.vy + hoo * (pointer.y - lens.y)) * inv;\r
        lens.x = nx;\r
        lens.y = ny;\r
      }\r
      const presenceTarget = tracking ? 1 : 0;\r
      lens.presence += (presenceTarget - lens.presence) * (1 - Math.exp(-dt / (tracking ? 0.18 : 0.4)));\r
      const zoomTarget = tracking && pointer.down && s.holdToZoom ? 1 : 0;\r
      lens.zoom += (zoomTarget - lens.zoom) * (1 - Math.exp(-dt / 0.14));\r
\r
      const eased = focus < 0.5 ? 4 * focus * focus * focus : 1 - Math.pow(-2 * focus + 2, 3) / 2;\r
      const presence = lens.presence * lens.presence * (3 - 2 * lens.presence);\r
      const extent = Math.abs(size.width * s.direction[0]) + Math.abs(size.height * s.direction[1]);\r
\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      gl.useProgram(shader.program);\r
      gl.bindVertexArray(vao);\r
      const u = shader.uniforms;\r
      gl.uniform2f(u.uSize, size.width, size.height);\r
      gl.uniform1f(u.uPixel, size.ratio);\r
      gl.uniform1f(u.uRadius, s.radius);\r
      gl.uniform1f(u.uCell, s.step);\r
      gl.uniform4f(u.uLens, lens.x, lens.y, s.lensRadius * (1 + lens.zoom * 0.12), presence);\r
      gl.uniform2f(u.uWarp, strengthOf(s, lens.zoom), s.twist * (1 + lens.zoom * 0.6));\r
      gl.uniform3f(\r
        u.uGlow,\r
        s.glowRadius * (1 + lens.zoom * 0.1),\r
        s.glowIntensity * (1 + lens.zoom * 0.25),\r
        s.light ? 0 : 1\r
      );\r
      gl.uniform3f(u.uFrom, s.from[0], s.from[1], s.from[2]);\r
      gl.uniform3f(u.uTo, s.to[0], s.to[1], s.to[2]);\r
      gl.uniform4f(u.uGlowColor, s.glowColor[0], s.glowColor[1], s.glowColor[2], s.glowWeight);\r
      gl.uniform3f(u.uGradient, s.direction[0], s.direction[1], Math.max(extent, 1));\r
      gl.uniform1f(u.uTime, time);\r
      gl.uniform1f(u.uWave, s.wave);\r
      gl.uniform1f(u.uSparkle, s.sparkle);\r
      gl.uniform1f(u.uFocus, eased);\r
      gl.uniform1f(u.uBase, s.light ? Math.min(1, s.base * 1.3) : s.base);\r
      gl.uniform1f(u.uLight, s.light ? 1 : 0);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      if (count) gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, count);\r
\r
      const moving =\r
        Math.abs(pointer.x - lens.x) + Math.abs(pointer.y - lens.y) > 0.05 || Math.hypot(lens.vx, lens.vy) > 0.5;\r
      const settling =\r
        Math.abs(presenceTarget - lens.presence) > 0.002 ||\r
        Math.abs(zoomTarget - lens.zoom) > 0.002 ||\r
        (lens.presence > 0.002 && moving);\r
      const animated = !reduced && s.speed > 0 && (s.wave > 0 || s.sparkle > 0);\r
      const busy = focus < 1 || settling || animated;\r
      if (busy && visible && pageVisible) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (raf || lost || !visible || !pageVisible) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
    wakeRef.current = () => {\r
      resize();\r
      wake();\r
    };\r
\r
    const locate = event => {\r
      const rect = container.getBoundingClientRect();\r
      return {\r
        x: event.clientX - rect.left,\r
        y: event.clientY - rect.top,\r
        inside:\r
          event.clientX >= rect.left &&\r
          event.clientX <= rect.right &&\r
          event.clientY >= rect.top &&\r
          event.clientY <= rect.bottom\r
      };\r
    };\r
\r
    const onPointerMove = event => {\r
      const spot = locate(event);\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = spot.inside;\r
      wake();\r
    };\r
    const onPointerDown = event => {\r
      const spot = locate(event);\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = spot.inside;\r
      pointer.down = spot.inside;\r
      wake();\r
    };\r
    const onLeave = () => {\r
      pointer.inside = false;\r
      pointer.down = false;\r
      wake();\r
    };\r
    const onPointerUp = event => {\r
      pointer.down = false;\r
      if (event.pointerType !== 'mouse') pointer.inside = false;\r
      wake();\r
    };\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    window.addEventListener('pointerup', onPointerUp, { passive: true });\r
    window.addEventListener('pointercancel', onPointerUp, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onLeave);\r
\r
    const onLost = event => {\r
      event.preventDefault();\r
      lost = true;\r
      cancelAnimationFrame(raf);\r
      raf = 0;\r
    };\r
    const onRestored = () => setGeneration(value => value + 1);\r
    canvas.addEventListener('webglcontextlost', onLost);\r
    canvas.addEventListener('webglcontextrestored', onRestored);\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      resize();\r
      wake();\r
    });\r
    resizeObserver.observe(container);\r
\r
    const intersection = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      wake();\r
    });\r
    intersection.observe(container);\r
\r
    const onVisibility = () => {\r
      pageVisible = document.visibilityState !== 'hidden';\r
      wake();\r
    };\r
    document.addEventListener('visibilitychange', onVisibility);\r
\r
    resize();\r
    wake();\r
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
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      canvas.removeEventListener('webglcontextlost', onLost);\r
      canvas.removeEventListener('webglcontextrestored', onRestored);\r
      if (!gl.isContextLost()) {\r
        gl.deleteBuffer(buffer);\r
        gl.deleteVertexArray(vao);\r
        gl.deleteProgram(shader.program);\r
      }\r
    };\r
  }, [generation]);\r
\r
  return (\r
    <div ref={containerRef} className={\`dot-field\${className ? \` \${className}\` : ''}\`} style={style}>\r
      <canvas ref={canvasRef} className="dot-field__canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default DotField;\r
`,r=`.dot-field {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.dot-field__canvas {\r
  position: absolute;\r
  inset: 0;\r
  display: block;\r
  width: 100%;\r
  height: 100%;\r
}\r
`,e=`'use client';\r
\r
import { useEffect, useRef, useState } from 'react';\r
\r
const PIXEL_BUDGET = 9e6;\r
const MAX_DOTS = 120000;\r
const PATTERNS = { grid: 0, hex: 1, spiral: 2, scatter: 3 };\r
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));\r
\r
const VERTEX = \`#version 300 es\r
precision highp float;\r
layout(location = 0) in vec4 aDot;\r
uniform vec2 uSize;\r
uniform float uPixel;\r
uniform float uRadius;\r
uniform float uCell;\r
uniform vec4 uLens;\r
uniform vec2 uWarp;\r
uniform vec3 uGlow;\r
uniform vec3 uFrom;\r
uniform vec3 uTo;\r
uniform vec4 uGlowColor;\r
uniform vec3 uGradient;\r
uniform float uTime;\r
uniform float uWave;\r
uniform float uSparkle;\r
uniform float uFocus;\r
uniform float uBase;\r
uniform float uLight;\r
out vec2 vLocal;\r
out float vRadius;\r
out float vBlur;\r
out float vHalo;\r
out float vHaloWidth;\r
out vec3 vColor;\r
out float vAlpha;\r
\r
vec3 toRgb(vec3 lab) {\r
  float l = lab.x + 0.3963377774 * lab.y + 0.2158037573 * lab.z;\r
  float m = lab.x - 0.1055613458 * lab.y - 0.0638541728 * lab.z;\r
  float s = lab.x - 0.0894841775 * lab.y - 1.291485548 * lab.z;\r
  vec3 lms = vec3(l * l * l, m * m * m, s * s * s);\r
  vec3 lin = clamp(vec3(\r
    4.0767416621 * lms.x - 3.3077115913 * lms.y + 0.2309699292 * lms.z,\r
    -1.2684380046 * lms.x + 2.6097574011 * lms.y - 0.3413193965 * lms.z,\r
    -0.0041960863 * lms.x - 0.7034186147 * lms.y + 1.707614701 * lms.z\r
  ), 0.0, 1.0);\r
  return mix(lin * 12.92, 1.055 * pow(lin, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, lin));\r
}\r
\r
vec3 blend(vec3 a, vec3 b, float t) {\r
  vec2 ab = mix(a.yz, b.yz, t);\r
  float chroma = mix(length(a.yz), length(b.yz), t);\r
  float len = length(ab);\r
  return vec3(mix(a.x, b.x, t), len > 1e-5 ? ab * (chroma / len) : ab);\r
}\r
\r
vec3 wave(vec2 p, float t) {\r
  float ay = p.x * 0.018 + t + 1.1 * sin(p.y * 0.016 - t * 0.4);\r
  float ax = p.y * 0.021 + t * 0.7 + 1.3 * sin(p.x * 0.013 + t * 0.3);\r
  float spread = cos(ay) * 0.0176 * cos(p.y * 0.016 - t * 0.4) + 0.5 * cos(ax) * 0.0169 * cos(p.x * 0.013 + t * 0.3);\r
  return uWave * vec3(0.5 * sin(ax), sin(ay), spread);\r
}\r
\r
void main() {\r
  vec2 corner = vec2(float(gl_VertexID & 1), float(gl_VertexID >> 1)) * 2.0 - 1.0;\r
  vec2 center = uSize * 0.5;\r
  vec3 swell = wave(aDot.xy, uTime);\r
  vec2 source = center + (aDot.xy - center) * mix(1.12, 1.0, uFocus) + swell.xy;\r
\r
  vec2 rel = source - uLens.xy;\r
  float x = length(rel) / uLens.z;\r
  float y = clamp(1.0 - x * x, 0.0, 1.0);\r
  float w = y * y * y;\r
  float k = uWarp.x * uLens.w;\r
  float grow = 1.0 + k * w;\r
  float spread = 1.0 + k * (w - 6.0 * x * x * y * y);\r
  float theta = uWarp.y * uLens.w * w;\r
  vec2 turn = vec2(cos(theta), sin(theta));\r
  vec2 display = uLens.xy + vec2(turn.x * rel.x - turn.y * rel.y, turn.y * rel.x + turn.x * rel.y) * grow;\r
  float scale = sqrt(max(grow * spread, 0.02));\r
\r
  float spark = 0.0;\r
  if (uSparkle > 0.0) {\r
    float phase = 0.5 + 0.5 * sin(uTime * (0.55 + aDot.w * 0.9) + aDot.z * 6.2831853);\r
    spark = pow(phase, 48.0) * step(0.72, fract(aDot.z * 7.31 + aDot.w * 3.17)) * uSparkle;\r
  }\r
\r
  float pool = 0.0;\r
  if (uGlow.x > 0.0) {\r
    float g = length(display - uLens.xy) / uGlow.x;\r
    float q = clamp(1.0 - g * g, 0.0, 1.0);\r
    pool = q * q * uGlow.y * uLens.w;\r
  }\r
\r
  float radius = uRadius * (1.0 + 0.7 * spark);\r
  float device = radius * scale * uPixel;\r
  float fade = 1.0;\r
  if (device < 0.75) {\r
    fade = device * device / 0.5625;\r
    radius = 0.75 / (scale * uPixel);\r
  }\r
  float blur = (1.0 - uFocus) * uCell * 0.42;\r
  float energy = pow(radius / (radius + blur), 1.15);\r
  float halo = pool * uGlow.z;\r
  float haloWidth = 2.0 + radius * 1.5;\r
  float pad = radius + blur * 1.2 + 1.5 / (scale * uPixel) + (halo > 0.0 ? haloWidth * 2.5 : 0.0);\r
\r
  float t = clamp(dot(aDot.xy - center, uGradient.xy) / uGradient.z + 0.5, 0.0, 1.0);\r
  vec3 tone = blend(uFrom, uTo, t);\r
  vec3 deep = vec3(tone.x * 0.72, tone.yz * 1.3);\r
  vec3 base = toRgb(tone);\r
  vec3 lit = toRgb(mix(deep, uGlowColor.xyz, uGlowColor.w));\r
  vec3 color = mix(base, lit, clamp(pool, 0.0, 1.0) * 0.8);\r
  color = mix(color, uLight > 0.5 ? color * 0.6 : vec3(1.0), spark * 0.55);\r
\r
  vLocal = corner * pad;\r
  vRadius = radius + blur;\r
  vBlur = blur * 0.7;\r
  vHalo = halo;\r
  vHaloWidth = haloWidth;\r
  vColor = color;\r
  float shade = clamp(1.0 - swell.z * 2.5, 0.4, 1.6);\r
  vAlpha = mix(min(uBase * shade, 1.0), 1.0, clamp(max(pool, spark), 0.0, 1.0)) * fade * energy * smoothstep(0.0, 0.25, uFocus + 0.08);\r
  vec2 point = display + corner * pad * scale;\r
  gl_Position = vec4(point.x / uSize.x * 2.0 - 1.0, 1.0 - point.y / uSize.y * 2.0, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform float uOpacity;\r
in vec2 vLocal;\r
in float vRadius;\r
in float vBlur;\r
in float vHalo;\r
in float vHaloWidth;\r
in vec3 vColor;\r
in float vAlpha;\r
out vec4 fragColor;\r
\r
void main() {\r
  float dist = length(vLocal);\r
  float d = dist - vRadius;\r
  float edge = max(fwidth(dist), 1e-4) + vBlur;\r
  float cover = 1.0 - smoothstep(-0.5 * edge, 0.5 * edge, d);\r
  float glow = vHalo * exp(-max(d, 0.0) / vHaloWidth) * 0.5;\r
  float alpha = min(cover + glow, 1.0) * vAlpha * uOpacity;\r
  if (alpha < 0.002) discard;\r
  fragColor = vec4(vColor * alpha, alpha);\r
}\`;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const parseColor = value => {\r
  const text = String(value || '').trim();\r
  const hex = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text);\r
  if (hex) {\r
    const full = hex[1].length === 3 ? hex[1].replace(/./g, digit => digit + digit) : hex[1];\r
    return [0, 2, 4].map(index => parseInt(full.slice(index, index + 2), 16) / 255);\r
  }\r
  const rgb = /^rgba?\\(\\s*([\\d.]+)[\\s,]+([\\d.]+)[\\s,]+([\\d.]+)/i.exec(text);\r
  if (rgb) return [rgb[1], rgb[2], rgb[3]].map(channel => clamp(parseFloat(channel) / 255, 0, 1));\r
  return null;\r
};\r
\r
const toLinear = channel => (channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4));\r
\r
const toOklab = color => {\r
  const [r, g, b] = color.map(toLinear);\r
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
const toInk = (value, fallback, light) => {\r
  const lab = toOklab(parseColor(value) || fallback);\r
  if (!light) return lab;\r
  const hue = (Math.atan2(lab[2], lab[1]) * 180) / Math.PI;\r
  const warmth = clamp(1 - Math.abs(hue - 85) / 40, 0, 1);\r
  const ceiling = 0.6 + 0.16 * warmth * warmth * (3 - 2 * warmth);\r
  if (lab[0] <= ceiling) return lab;\r
  const boost = 1 + (lab[0] - ceiling) * 1.6;\r
  return [ceiling, lab[1] * boost, lab[2] * boost];\r
};\r
\r
const chroma = value => {\r
  const lab = toOklab(parseColor(value) || [1, 1, 1]);\r
  return Math.hypot(lab[1], lab[2]);\r
};\r
\r
const hash = (a, b, c) => {\r
  let h = (Math.imul(a, 374761393) + Math.imul(b, 668265263) + Math.imul(c, 1274126177)) | 0;\r
  h = Math.imul(h ^ (h >>> 13), 1274126177);\r
  h ^= h >>> 16;\r
  return (h >>> 0) / 4294967296;\r
};\r
\r
const lensReach = (radius, strength, twist) => {\r
  let peak = 0;\r
  for (let index = 1; index < 48; index++) {\r
    const x = index / 48;\r
    const w = (1 - x * x) ** 3;\r
    const sigma = x * radius;\r
    const grow = 1 + strength * w;\r
    const theta = twist * w;\r
    peak = Math.max(peak, Math.hypot(sigma * (grow * Math.cos(theta) - 1), sigma * grow * Math.sin(theta)));\r
  }\r
  return peak;\r
};\r
\r
const buildDots = (width, height, step, pattern, margin) => {\r
  const cx = width / 2;\r
  const cy = height / 2;\r
  const minX = -margin;\r
  const maxX = width + margin;\r
  const minY = -margin;\r
  const maxY = height + margin;\r
  const out = [];\r
  const push = (x, y, a, b) => {\r
    if (x >= minX && x <= maxX && y >= minY && y <= maxY) out.push(x, y, a, b);\r
  };\r
  if (pattern === PATTERNS.spiral) {\r
    const spacing = step / Math.sqrt(Math.PI);\r
    const reach = Math.hypot(width / 2 + margin, height / 2 + margin);\r
    const count = Math.ceil((reach / spacing) ** 2);\r
    for (let index = 0; index < count; index++) {\r
      const r = spacing * Math.sqrt(index + 0.5);\r
      const angle = index * GOLDEN_ANGLE;\r
      push(cx + r * Math.cos(angle), cy + r * Math.sin(angle), hash(index, 0, 3), hash(index, 0, 4));\r
    }\r
  } else {\r
    const rowStep = pattern === PATTERNS.hex ? (step * Math.sqrt(3)) / 2 : step;\r
    const cols = Math.ceil((width / 2 + margin) / step) + 1;\r
    const rows = Math.ceil((height / 2 + margin) / rowStep) + 1;\r
    for (let row = -rows; row <= rows; row++) {\r
      for (let col = -cols; col <= cols; col++) {\r
        let x = cx + col * step + (pattern === PATTERNS.hex && row & 1 ? step / 2 : 0);\r
        let y = cy + row * rowStep;\r
        if (pattern === PATTERNS.scatter) {\r
          x += (hash(col, row, 1) - 0.5) * step * 0.8;\r
          y += (hash(col, row, 2) - 0.5) * step * 0.8;\r
        }\r
        push(x, y, hash(col, row, 3), hash(col, row, 4));\r
      }\r
    }\r
  }\r
  return new Float32Array(out);\r
};\r
\r
const compile = (gl, type, source) => {\r
  const shader = gl.createShader(type);\r
  if (!shader) return null;\r
  gl.shaderSource(shader, source);\r
  gl.compileShader(shader);\r
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {\r
    console.error(gl.getShaderInfoLog(shader));\r
    gl.deleteShader(shader);\r
    return null;\r
  }\r
  return shader;\r
};\r
\r
const link = gl => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
  const program = vertex && fragment ? gl.createProgram() : null;\r
  if (!vertex || !fragment || !program) {\r
    if (vertex) gl.deleteShader(vertex);\r
    if (fragment) gl.deleteShader(fragment);\r
    return null;\r
  }\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
  gl.linkProgram(program);\r
  gl.deleteShader(vertex);\r
  gl.deleteShader(fragment);\r
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {\r
    console.error(gl.getProgramInfoLog(program));\r
    gl.deleteProgram(program);\r
    return null;\r
  }\r
  const uniforms = {};\r
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
  for (let index = 0; index < count; index++) {\r
    const info = gl.getActiveUniform(program, index);\r
    if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const DotField = ({\r
  dotRadius = 1.5,\r
  dotSpacing = 14,\r
  pattern = 'grid',\r
  gradientFrom = '#5227FF',\r
  gradientTo = '#FF9FFC',\r
  gradientAngle = 135,\r
  cursorRadius = 240,\r
  bulgeStrength = 0.6,\r
  twist = 0,\r
  glowColor = '#ffffff',\r
  glowRadius = 160,\r
  glowIntensity = 0.8,\r
  baseOpacity = 0.55,\r
  waveAmplitude = 0,\r
  sparkle = false,\r
  speed = 1,\r
  interactive = true,\r
  holdToZoom = true,\r
  intro = true,\r
  lightMode = false,\r
  opacity = 1,\r
  maxDevicePixelRatio = 2,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const [generation, setGeneration] = useState(0);\r
\r
  const radius = clamp(dotRadius, 0.25, 12);\r
  const step = radius * 2 + clamp(dotSpacing, 1, 200);\r
  const angle = (gradientAngle * Math.PI) / 180;\r
  const settings = {\r
    radius,\r
    step,\r
    pattern: PATTERNS[pattern] ?? PATTERNS.grid,\r
    from: toInk(gradientFrom, [0.32, 0.15, 1], lightMode),\r
    to: toInk(gradientTo, [1, 0.62, 0.99], lightMode),\r
    glowColor: toInk(glowColor, [1, 1, 1], lightMode),\r
    glowWeight: lightMode ? clamp((chroma(glowColor) - 0.02) / 0.06, 0, 1) : 1,\r
    direction: [Math.sin(angle), -Math.cos(angle)],\r
    lensRadius: clamp(cursorRadius, 20, 2000),\r
    strength: clamp(bulgeStrength, -1, 1),\r
    twist: (clamp(twist, -360, 360) * Math.PI) / 180,\r
    glowRadius: Math.max(0, glowRadius),\r
    glowIntensity: clamp(glowIntensity, 0, 2),\r
    base: clamp(baseOpacity, 0, 1),\r
    wave: clamp(waveAmplitude, 0, 60),\r
    sparkle: sparkle ? 1 : 0,\r
    speed: Math.max(0, speed),\r
    interactive,\r
    holdToZoom,\r
    intro,\r
    light: lightMode,\r
    opacity: clamp(opacity, 0, 1),\r
    maxRatio: clamp(maxDevicePixelRatio, 0.5, 3)\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    if (!container || !canvas) return;\r
\r
    const gl = canvas.getContext('webgl2', {\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false,\r
      powerPreference: 'high-performance'\r
    });\r
    const shader = gl ? link(gl) : null;\r
    if (!gl || !shader) return;\r
\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
    const vao = gl.createVertexArray();\r
    const buffer = gl.createBuffer();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 16, 0);\r
    gl.vertexAttribDivisor(0, 1);\r
    gl.bindVertexArray(null);\r
\r
    const size = { width: 1, height: 1, ratio: 1 };\r
    const pointer = { x: 0, y: 0, inside: false, down: false };\r
    const lens = { x: 0, y: 0, vx: 0, vy: 0, presence: 0, zoom: 0, ready: false };\r
    let layoutKey = '';\r
    let count = 0;\r
    let time = Math.random() * 100;\r
    let focus = settingsRef.current.intro && !reduced && generation === 0 ? 0 : 1;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let pageVisible = document.visibilityState !== 'hidden';\r
    let lost = false;\r
\r
    const strengthOf = (s, zoom) => {\r
      const base = s.strength >= 0 ? s.strength * 1.2 : s.strength * 0.7;\r
      return clamp(base * (1 + zoom * 0.6), -0.85, 1.45);\r
    };\r
\r
    const layout = () => {\r
      const s = settingsRef.current;\r
      const reach = lensReach(s.lensRadius, strengthOf(s, s.holdToZoom ? 1 : 0), s.twist * (s.holdToZoom ? 1.6 : 1));\r
      const margin = Math.ceil(reach + s.wave + s.step * 2);\r
      const area = (size.width + margin * 2) * (size.height + margin * 2);\r
      const step = Math.max(s.step, Math.sqrt(area / MAX_DOTS));\r
      const key = \`\${size.width}|\${size.height}|\${step}|\${s.pattern}|\${margin}\`;\r
      if (key === layoutKey) return;\r
      layoutKey = key;\r
      const data = buildDots(size.width, size.height, step, s.pattern, margin);\r
      count = data.length / 4;\r
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const rect = container.getBoundingClientRect();\r
      const cssWidth = Math.max(1, rect.width);\r
      const cssHeight = Math.max(1, rect.height);\r
      const ratio = Math.min(\r
        window.devicePixelRatio || 1,\r
        s.maxRatio,\r
        Math.sqrt(PIXEL_BUDGET / (cssWidth * cssHeight))\r
      );\r
      const width = Math.max(1, Math.round(cssWidth * ratio));\r
      const height = Math.max(1, Math.round(cssHeight * ratio));\r
      if (canvas.width !== width || canvas.height !== height) {\r
        canvas.width = width;\r
        canvas.height = height;\r
      }\r
      size.width = cssWidth;\r
      size.height = cssHeight;\r
      size.ratio = width / cssWidth;\r
      layout();\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (lost) return;\r
      const s = settingsRef.current;\r
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05);\r
      last = Math.max(last, now);\r
      if (!reduced) time += dt * s.speed;\r
      if (focus < 1) focus = Math.min(1, focus + dt / 1.8);\r
\r
      const tracking = s.interactive && pointer.inside;\r
      if (tracking && (!lens.ready || lens.presence < 0.01)) {\r
        lens.x = pointer.x;\r
        lens.y = pointer.y;\r
        lens.vx = 0;\r
        lens.vy = 0;\r
        lens.ready = true;\r
      }\r
      if (lens.ready) {\r
        const omega = 18;\r
        const f = 1 + 2 * dt * omega;\r
        const oo = omega * omega;\r
        const hoo = dt * oo;\r
        const hhoo = dt * hoo;\r
        const inv = 1 / (f + hhoo);\r
        const nx = (f * lens.x + dt * lens.vx + hhoo * pointer.x) * inv;\r
        const ny = (f * lens.y + dt * lens.vy + hhoo * pointer.y) * inv;\r
        lens.vx = (lens.vx + hoo * (pointer.x - lens.x)) * inv;\r
        lens.vy = (lens.vy + hoo * (pointer.y - lens.y)) * inv;\r
        lens.x = nx;\r
        lens.y = ny;\r
      }\r
      const presenceTarget = tracking ? 1 : 0;\r
      lens.presence += (presenceTarget - lens.presence) * (1 - Math.exp(-dt / (tracking ? 0.18 : 0.4)));\r
      const zoomTarget = tracking && pointer.down && s.holdToZoom ? 1 : 0;\r
      lens.zoom += (zoomTarget - lens.zoom) * (1 - Math.exp(-dt / 0.14));\r
\r
      const eased = focus < 0.5 ? 4 * focus * focus * focus : 1 - Math.pow(-2 * focus + 2, 3) / 2;\r
      const presence = lens.presence * lens.presence * (3 - 2 * lens.presence);\r
      const extent = Math.abs(size.width * s.direction[0]) + Math.abs(size.height * s.direction[1]);\r
\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      gl.useProgram(shader.program);\r
      gl.bindVertexArray(vao);\r
      const u = shader.uniforms;\r
      gl.uniform2f(u.uSize, size.width, size.height);\r
      gl.uniform1f(u.uPixel, size.ratio);\r
      gl.uniform1f(u.uRadius, s.radius);\r
      gl.uniform1f(u.uCell, s.step);\r
      gl.uniform4f(u.uLens, lens.x, lens.y, s.lensRadius * (1 + lens.zoom * 0.12), presence);\r
      gl.uniform2f(u.uWarp, strengthOf(s, lens.zoom), s.twist * (1 + lens.zoom * 0.6));\r
      gl.uniform3f(\r
        u.uGlow,\r
        s.glowRadius * (1 + lens.zoom * 0.1),\r
        s.glowIntensity * (1 + lens.zoom * 0.25),\r
        s.light ? 0 : 1\r
      );\r
      gl.uniform3f(u.uFrom, s.from[0], s.from[1], s.from[2]);\r
      gl.uniform3f(u.uTo, s.to[0], s.to[1], s.to[2]);\r
      gl.uniform4f(u.uGlowColor, s.glowColor[0], s.glowColor[1], s.glowColor[2], s.glowWeight);\r
      gl.uniform3f(u.uGradient, s.direction[0], s.direction[1], Math.max(extent, 1));\r
      gl.uniform1f(u.uTime, time);\r
      gl.uniform1f(u.uWave, s.wave);\r
      gl.uniform1f(u.uSparkle, s.sparkle);\r
      gl.uniform1f(u.uFocus, eased);\r
      gl.uniform1f(u.uBase, s.light ? Math.min(1, s.base * 1.3) : s.base);\r
      gl.uniform1f(u.uLight, s.light ? 1 : 0);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      if (count) gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, count);\r
\r
      const moving =\r
        Math.abs(pointer.x - lens.x) + Math.abs(pointer.y - lens.y) > 0.05 || Math.hypot(lens.vx, lens.vy) > 0.5;\r
      const settling =\r
        Math.abs(presenceTarget - lens.presence) > 0.002 ||\r
        Math.abs(zoomTarget - lens.zoom) > 0.002 ||\r
        (lens.presence > 0.002 && moving);\r
      const animated = !reduced && s.speed > 0 && (s.wave > 0 || s.sparkle > 0);\r
      const busy = focus < 1 || settling || animated;\r
      if (busy && visible && pageVisible) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (raf || lost || !visible || !pageVisible) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
    wakeRef.current = () => {\r
      resize();\r
      wake();\r
    };\r
\r
    const locate = event => {\r
      const rect = container.getBoundingClientRect();\r
      return {\r
        x: event.clientX - rect.left,\r
        y: event.clientY - rect.top,\r
        inside:\r
          event.clientX >= rect.left &&\r
          event.clientX <= rect.right &&\r
          event.clientY >= rect.top &&\r
          event.clientY <= rect.bottom\r
      };\r
    };\r
\r
    const onPointerMove = event => {\r
      const spot = locate(event);\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = spot.inside;\r
      wake();\r
    };\r
    const onPointerDown = event => {\r
      const spot = locate(event);\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = spot.inside;\r
      pointer.down = spot.inside;\r
      wake();\r
    };\r
    const onLeave = () => {\r
      pointer.inside = false;\r
      pointer.down = false;\r
      wake();\r
    };\r
    const onPointerUp = event => {\r
      pointer.down = false;\r
      if (event.pointerType !== 'mouse') pointer.inside = false;\r
      wake();\r
    };\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    window.addEventListener('pointerup', onPointerUp, { passive: true });\r
    window.addEventListener('pointercancel', onPointerUp, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onLeave);\r
\r
    const onLost = event => {\r
      event.preventDefault();\r
      lost = true;\r
      cancelAnimationFrame(raf);\r
      raf = 0;\r
    };\r
    const onRestored = () => setGeneration(value => value + 1);\r
    canvas.addEventListener('webglcontextlost', onLost);\r
    canvas.addEventListener('webglcontextrestored', onRestored);\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      resize();\r
      wake();\r
    });\r
    resizeObserver.observe(container);\r
\r
    const intersection = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      wake();\r
    });\r
    intersection.observe(container);\r
\r
    const onVisibility = () => {\r
      pageVisible = document.visibilityState !== 'hidden';\r
      wake();\r
    };\r
    document.addEventListener('visibilitychange', onVisibility);\r
\r
    resize();\r
    wake();\r
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
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      canvas.removeEventListener('webglcontextlost', onLost);\r
      canvas.removeEventListener('webglcontextrestored', onRestored);\r
      if (!gl.isContextLost()) {\r
        gl.deleteBuffer(buffer);\r
        gl.deleteVertexArray(vao);\r
        gl.deleteProgram(shader.program);\r
      }\r
    };\r
  }, [generation]);\r
\r
  return (\r
    <div ref={containerRef} className={\`relative h-full w-full overflow-hidden \${className}\`.trim()} style={style}>\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default DotField;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, useState, type CSSProperties } from 'react';\r
import './DotField.css';\r
\r
type Pattern = 'grid' | 'hex' | 'spiral' | 'scatter';\r
\r
export interface DotFieldProps {\r
  dotRadius?: number;\r
  dotSpacing?: number;\r
  pattern?: Pattern;\r
  gradientFrom?: string;\r
  gradientTo?: string;\r
  gradientAngle?: number;\r
  cursorRadius?: number;\r
  bulgeStrength?: number;\r
  twist?: number;\r
  glowColor?: string;\r
  glowRadius?: number;\r
  glowIntensity?: number;\r
  baseOpacity?: number;\r
  waveAmplitude?: number;\r
  sparkle?: boolean;\r
  speed?: number;\r
  interactive?: boolean;\r
  holdToZoom?: boolean;\r
  intro?: boolean;\r
  lightMode?: boolean;\r
  opacity?: number;\r
  maxDevicePixelRatio?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Settings {\r
  radius: number;\r
  step: number;\r
  pattern: number;\r
  from: number[];\r
  to: number[];\r
  glowColor: number[];\r
  glowWeight: number;\r
  direction: number[];\r
  lensRadius: number;\r
  strength: number;\r
  twist: number;\r
  glowRadius: number;\r
  glowIntensity: number;\r
  base: number;\r
  wave: number;\r
  sparkle: number;\r
  speed: number;\r
  interactive: boolean;\r
  holdToZoom: boolean;\r
  intro: boolean;\r
  light: boolean;\r
  opacity: number;\r
  maxRatio: number;\r
}\r
\r
interface Program {\r
  program: WebGLProgram;\r
  uniforms: Record<string, WebGLUniformLocation | null>;\r
}\r
\r
const PIXEL_BUDGET = 9e6;\r
const MAX_DOTS = 120000;\r
const PATTERNS: Record<Pattern, number> = { grid: 0, hex: 1, spiral: 2, scatter: 3 };\r
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));\r
\r
const VERTEX = \`#version 300 es\r
precision highp float;\r
layout(location = 0) in vec4 aDot;\r
uniform vec2 uSize;\r
uniform float uPixel;\r
uniform float uRadius;\r
uniform float uCell;\r
uniform vec4 uLens;\r
uniform vec2 uWarp;\r
uniform vec3 uGlow;\r
uniform vec3 uFrom;\r
uniform vec3 uTo;\r
uniform vec4 uGlowColor;\r
uniform vec3 uGradient;\r
uniform float uTime;\r
uniform float uWave;\r
uniform float uSparkle;\r
uniform float uFocus;\r
uniform float uBase;\r
uniform float uLight;\r
out vec2 vLocal;\r
out float vRadius;\r
out float vBlur;\r
out float vHalo;\r
out float vHaloWidth;\r
out vec3 vColor;\r
out float vAlpha;\r
\r
vec3 toRgb(vec3 lab) {\r
  float l = lab.x + 0.3963377774 * lab.y + 0.2158037573 * lab.z;\r
  float m = lab.x - 0.1055613458 * lab.y - 0.0638541728 * lab.z;\r
  float s = lab.x - 0.0894841775 * lab.y - 1.291485548 * lab.z;\r
  vec3 lms = vec3(l * l * l, m * m * m, s * s * s);\r
  vec3 lin = clamp(vec3(\r
    4.0767416621 * lms.x - 3.3077115913 * lms.y + 0.2309699292 * lms.z,\r
    -1.2684380046 * lms.x + 2.6097574011 * lms.y - 0.3413193965 * lms.z,\r
    -0.0041960863 * lms.x - 0.7034186147 * lms.y + 1.707614701 * lms.z\r
  ), 0.0, 1.0);\r
  return mix(lin * 12.92, 1.055 * pow(lin, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, lin));\r
}\r
\r
vec3 blend(vec3 a, vec3 b, float t) {\r
  vec2 ab = mix(a.yz, b.yz, t);\r
  float chroma = mix(length(a.yz), length(b.yz), t);\r
  float len = length(ab);\r
  return vec3(mix(a.x, b.x, t), len > 1e-5 ? ab * (chroma / len) : ab);\r
}\r
\r
vec3 wave(vec2 p, float t) {\r
  float ay = p.x * 0.018 + t + 1.1 * sin(p.y * 0.016 - t * 0.4);\r
  float ax = p.y * 0.021 + t * 0.7 + 1.3 * sin(p.x * 0.013 + t * 0.3);\r
  float spread = cos(ay) * 0.0176 * cos(p.y * 0.016 - t * 0.4) + 0.5 * cos(ax) * 0.0169 * cos(p.x * 0.013 + t * 0.3);\r
  return uWave * vec3(0.5 * sin(ax), sin(ay), spread);\r
}\r
\r
void main() {\r
  vec2 corner = vec2(float(gl_VertexID & 1), float(gl_VertexID >> 1)) * 2.0 - 1.0;\r
  vec2 center = uSize * 0.5;\r
  vec3 swell = wave(aDot.xy, uTime);\r
  vec2 source = center + (aDot.xy - center) * mix(1.12, 1.0, uFocus) + swell.xy;\r
\r
  vec2 rel = source - uLens.xy;\r
  float x = length(rel) / uLens.z;\r
  float y = clamp(1.0 - x * x, 0.0, 1.0);\r
  float w = y * y * y;\r
  float k = uWarp.x * uLens.w;\r
  float grow = 1.0 + k * w;\r
  float spread = 1.0 + k * (w - 6.0 * x * x * y * y);\r
  float theta = uWarp.y * uLens.w * w;\r
  vec2 turn = vec2(cos(theta), sin(theta));\r
  vec2 display = uLens.xy + vec2(turn.x * rel.x - turn.y * rel.y, turn.y * rel.x + turn.x * rel.y) * grow;\r
  float scale = sqrt(max(grow * spread, 0.02));\r
\r
  float spark = 0.0;\r
  if (uSparkle > 0.0) {\r
    float phase = 0.5 + 0.5 * sin(uTime * (0.55 + aDot.w * 0.9) + aDot.z * 6.2831853);\r
    spark = pow(phase, 48.0) * step(0.72, fract(aDot.z * 7.31 + aDot.w * 3.17)) * uSparkle;\r
  }\r
\r
  float pool = 0.0;\r
  if (uGlow.x > 0.0) {\r
    float g = length(display - uLens.xy) / uGlow.x;\r
    float q = clamp(1.0 - g * g, 0.0, 1.0);\r
    pool = q * q * uGlow.y * uLens.w;\r
  }\r
\r
  float radius = uRadius * (1.0 + 0.7 * spark);\r
  float device = radius * scale * uPixel;\r
  float fade = 1.0;\r
  if (device < 0.75) {\r
    fade = device * device / 0.5625;\r
    radius = 0.75 / (scale * uPixel);\r
  }\r
  float blur = (1.0 - uFocus) * uCell * 0.42;\r
  float energy = pow(radius / (radius + blur), 1.15);\r
  float halo = pool * uGlow.z;\r
  float haloWidth = 2.0 + radius * 1.5;\r
  float pad = radius + blur * 1.2 + 1.5 / (scale * uPixel) + (halo > 0.0 ? haloWidth * 2.5 : 0.0);\r
\r
  float t = clamp(dot(aDot.xy - center, uGradient.xy) / uGradient.z + 0.5, 0.0, 1.0);\r
  vec3 tone = blend(uFrom, uTo, t);\r
  vec3 deep = vec3(tone.x * 0.72, tone.yz * 1.3);\r
  vec3 base = toRgb(tone);\r
  vec3 lit = toRgb(mix(deep, uGlowColor.xyz, uGlowColor.w));\r
  vec3 color = mix(base, lit, clamp(pool, 0.0, 1.0) * 0.8);\r
  color = mix(color, uLight > 0.5 ? color * 0.6 : vec3(1.0), spark * 0.55);\r
\r
  vLocal = corner * pad;\r
  vRadius = radius + blur;\r
  vBlur = blur * 0.7;\r
  vHalo = halo;\r
  vHaloWidth = haloWidth;\r
  vColor = color;\r
  float shade = clamp(1.0 - swell.z * 2.5, 0.4, 1.6);\r
  vAlpha = mix(min(uBase * shade, 1.0), 1.0, clamp(max(pool, spark), 0.0, 1.0)) * fade * energy * smoothstep(0.0, 0.25, uFocus + 0.08);\r
  vec2 point = display + corner * pad * scale;\r
  gl_Position = vec4(point.x / uSize.x * 2.0 - 1.0, 1.0 - point.y / uSize.y * 2.0, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform float uOpacity;\r
in vec2 vLocal;\r
in float vRadius;\r
in float vBlur;\r
in float vHalo;\r
in float vHaloWidth;\r
in vec3 vColor;\r
in float vAlpha;\r
out vec4 fragColor;\r
\r
void main() {\r
  float dist = length(vLocal);\r
  float d = dist - vRadius;\r
  float edge = max(fwidth(dist), 1e-4) + vBlur;\r
  float cover = 1.0 - smoothstep(-0.5 * edge, 0.5 * edge, d);\r
  float glow = vHalo * exp(-max(d, 0.0) / vHaloWidth) * 0.5;\r
  float alpha = min(cover + glow, 1.0) * vAlpha * uOpacity;\r
  if (alpha < 0.002) discard;\r
  fragColor = vec4(vColor * alpha, alpha);\r
}\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const parseColor = (value: string): number[] | null => {\r
  const text = String(value || '').trim();\r
  const hex = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text);\r
  if (hex) {\r
    const full = hex[1].length === 3 ? hex[1].replace(/./g, digit => digit + digit) : hex[1];\r
    return [0, 2, 4].map(index => parseInt(full.slice(index, index + 2), 16) / 255);\r
  }\r
  const rgb = /^rgba?\\(\\s*([\\d.]+)[\\s,]+([\\d.]+)[\\s,]+([\\d.]+)/i.exec(text);\r
  if (rgb) return [rgb[1], rgb[2], rgb[3]].map(channel => clamp(parseFloat(channel) / 255, 0, 1));\r
  return null;\r
};\r
\r
const toLinear = (channel: number) => (channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4));\r
\r
const toOklab = (color: number[]): number[] => {\r
  const [r, g, b] = color.map(toLinear);\r
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
const toInk = (value: string, fallback: number[], light: boolean): number[] => {\r
  const lab = toOklab(parseColor(value) || fallback);\r
  if (!light) return lab;\r
  const hue = (Math.atan2(lab[2], lab[1]) * 180) / Math.PI;\r
  const warmth = clamp(1 - Math.abs(hue - 85) / 40, 0, 1);\r
  const ceiling = 0.6 + 0.16 * warmth * warmth * (3 - 2 * warmth);\r
  if (lab[0] <= ceiling) return lab;\r
  const boost = 1 + (lab[0] - ceiling) * 1.6;\r
  return [ceiling, lab[1] * boost, lab[2] * boost];\r
};\r
\r
const chroma = (value: string) => {\r
  const lab = toOklab(parseColor(value) || [1, 1, 1]);\r
  return Math.hypot(lab[1], lab[2]);\r
};\r
\r
const hash = (a: number, b: number, c: number) => {\r
  let h = (Math.imul(a, 374761393) + Math.imul(b, 668265263) + Math.imul(c, 1274126177)) | 0;\r
  h = Math.imul(h ^ (h >>> 13), 1274126177);\r
  h ^= h >>> 16;\r
  return (h >>> 0) / 4294967296;\r
};\r
\r
const lensReach = (radius: number, strength: number, twist: number) => {\r
  let peak = 0;\r
  for (let index = 1; index < 48; index++) {\r
    const x = index / 48;\r
    const w = (1 - x * x) ** 3;\r
    const sigma = x * radius;\r
    const grow = 1 + strength * w;\r
    const theta = twist * w;\r
    peak = Math.max(peak, Math.hypot(sigma * (grow * Math.cos(theta) - 1), sigma * grow * Math.sin(theta)));\r
  }\r
  return peak;\r
};\r
\r
const buildDots = (width: number, height: number, step: number, pattern: number, margin: number) => {\r
  const cx = width / 2;\r
  const cy = height / 2;\r
  const minX = -margin;\r
  const maxX = width + margin;\r
  const minY = -margin;\r
  const maxY = height + margin;\r
  const out: number[] = [];\r
  const push = (x: number, y: number, a: number, b: number) => {\r
    if (x >= minX && x <= maxX && y >= minY && y <= maxY) out.push(x, y, a, b);\r
  };\r
  if (pattern === PATTERNS.spiral) {\r
    const spacing = step / Math.sqrt(Math.PI);\r
    const reach = Math.hypot(width / 2 + margin, height / 2 + margin);\r
    const count = Math.ceil((reach / spacing) ** 2);\r
    for (let index = 0; index < count; index++) {\r
      const r = spacing * Math.sqrt(index + 0.5);\r
      const angle = index * GOLDEN_ANGLE;\r
      push(cx + r * Math.cos(angle), cy + r * Math.sin(angle), hash(index, 0, 3), hash(index, 0, 4));\r
    }\r
  } else {\r
    const rowStep = pattern === PATTERNS.hex ? (step * Math.sqrt(3)) / 2 : step;\r
    const cols = Math.ceil((width / 2 + margin) / step) + 1;\r
    const rows = Math.ceil((height / 2 + margin) / rowStep) + 1;\r
    for (let row = -rows; row <= rows; row++) {\r
      for (let col = -cols; col <= cols; col++) {\r
        let x = cx + col * step + (pattern === PATTERNS.hex && row & 1 ? step / 2 : 0);\r
        let y = cy + row * rowStep;\r
        if (pattern === PATTERNS.scatter) {\r
          x += (hash(col, row, 1) - 0.5) * step * 0.8;\r
          y += (hash(col, row, 2) - 0.5) * step * 0.8;\r
        }\r
        push(x, y, hash(col, row, 3), hash(col, row, 4));\r
      }\r
    }\r
  }\r
  return new Float32Array(out);\r
};\r
\r
const compile = (gl: WebGL2RenderingContext, type: number, source: string) => {\r
  const shader = gl.createShader(type);\r
  if (!shader) return null;\r
  gl.shaderSource(shader, source);\r
  gl.compileShader(shader);\r
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {\r
    console.error(gl.getShaderInfoLog(shader));\r
    gl.deleteShader(shader);\r
    return null;\r
  }\r
  return shader;\r
};\r
\r
const link = (gl: WebGL2RenderingContext): Program | null => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
  const program = vertex && fragment ? gl.createProgram() : null;\r
  if (!vertex || !fragment || !program) {\r
    if (vertex) gl.deleteShader(vertex);\r
    if (fragment) gl.deleteShader(fragment);\r
    return null;\r
  }\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
  gl.linkProgram(program);\r
  gl.deleteShader(vertex);\r
  gl.deleteShader(fragment);\r
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {\r
    console.error(gl.getProgramInfoLog(program));\r
    gl.deleteProgram(program);\r
    return null;\r
  }\r
  const uniforms: Program['uniforms'] = {};\r
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
  for (let index = 0; index < count; index++) {\r
    const info = gl.getActiveUniform(program, index);\r
    if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const DotField = ({\r
  dotRadius = 1.5,\r
  dotSpacing = 14,\r
  pattern = 'grid',\r
  gradientFrom = '#5227FF',\r
  gradientTo = '#FF9FFC',\r
  gradientAngle = 135,\r
  cursorRadius = 240,\r
  bulgeStrength = 0.6,\r
  twist = 0,\r
  glowColor = '#ffffff',\r
  glowRadius = 160,\r
  glowIntensity = 0.8,\r
  baseOpacity = 0.55,\r
  waveAmplitude = 0,\r
  sparkle = false,\r
  speed = 1,\r
  interactive = true,\r
  holdToZoom = true,\r
  intro = true,\r
  lightMode = false,\r
  opacity = 1,\r
  maxDevicePixelRatio = 2,\r
  className = '',\r
  style\r
}: DotFieldProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const [generation, setGeneration] = useState(0);\r
\r
  const radius = clamp(dotRadius, 0.25, 12);\r
  const step = radius * 2 + clamp(dotSpacing, 1, 200);\r
  const angle = (gradientAngle * Math.PI) / 180;\r
  const settings: Settings = {\r
    radius,\r
    step,\r
    pattern: PATTERNS[pattern] ?? PATTERNS.grid,\r
    from: toInk(gradientFrom, [0.32, 0.15, 1], lightMode),\r
    to: toInk(gradientTo, [1, 0.62, 0.99], lightMode),\r
    glowColor: toInk(glowColor, [1, 1, 1], lightMode),\r
    glowWeight: lightMode ? clamp((chroma(glowColor) - 0.02) / 0.06, 0, 1) : 1,\r
    direction: [Math.sin(angle), -Math.cos(angle)],\r
    lensRadius: clamp(cursorRadius, 20, 2000),\r
    strength: clamp(bulgeStrength, -1, 1),\r
    twist: (clamp(twist, -360, 360) * Math.PI) / 180,\r
    glowRadius: Math.max(0, glowRadius),\r
    glowIntensity: clamp(glowIntensity, 0, 2),\r
    base: clamp(baseOpacity, 0, 1),\r
    wave: clamp(waveAmplitude, 0, 60),\r
    sparkle: sparkle ? 1 : 0,\r
    speed: Math.max(0, speed),\r
    interactive,\r
    holdToZoom,\r
    intro,\r
    light: lightMode,\r
    opacity: clamp(opacity, 0, 1),\r
    maxRatio: clamp(maxDevicePixelRatio, 0.5, 3)\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    if (!container || !canvas) return;\r
\r
    const gl = canvas.getContext('webgl2', {\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false,\r
      powerPreference: 'high-performance'\r
    });\r
    const shader = gl ? link(gl) : null;\r
    if (!gl || !shader) return;\r
\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
    const vao = gl.createVertexArray();\r
    const buffer = gl.createBuffer();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 16, 0);\r
    gl.vertexAttribDivisor(0, 1);\r
    gl.bindVertexArray(null);\r
\r
    const size = { width: 1, height: 1, ratio: 1 };\r
    const pointer = { x: 0, y: 0, inside: false, down: false };\r
    const lens = { x: 0, y: 0, vx: 0, vy: 0, presence: 0, zoom: 0, ready: false };\r
    let layoutKey = '';\r
    let count = 0;\r
    let time = Math.random() * 100;\r
    let focus = settingsRef.current.intro && !reduced && generation === 0 ? 0 : 1;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let pageVisible = document.visibilityState !== 'hidden';\r
    let lost = false;\r
\r
    const strengthOf = (s: Settings, zoom: number) => {\r
      const base = s.strength >= 0 ? s.strength * 1.2 : s.strength * 0.7;\r
      return clamp(base * (1 + zoom * 0.6), -0.85, 1.45);\r
    };\r
\r
    const layout = () => {\r
      const s = settingsRef.current;\r
      const reach = lensReach(s.lensRadius, strengthOf(s, s.holdToZoom ? 1 : 0), s.twist * (s.holdToZoom ? 1.6 : 1));\r
      const margin = Math.ceil(reach + s.wave + s.step * 2);\r
      const area = (size.width + margin * 2) * (size.height + margin * 2);\r
      const step = Math.max(s.step, Math.sqrt(area / MAX_DOTS));\r
      const key = \`\${size.width}|\${size.height}|\${step}|\${s.pattern}|\${margin}\`;\r
      if (key === layoutKey) return;\r
      layoutKey = key;\r
      const data = buildDots(size.width, size.height, step, s.pattern, margin);\r
      count = data.length / 4;\r
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const rect = container.getBoundingClientRect();\r
      const cssWidth = Math.max(1, rect.width);\r
      const cssHeight = Math.max(1, rect.height);\r
      const ratio = Math.min(\r
        window.devicePixelRatio || 1,\r
        s.maxRatio,\r
        Math.sqrt(PIXEL_BUDGET / (cssWidth * cssHeight))\r
      );\r
      const width = Math.max(1, Math.round(cssWidth * ratio));\r
      const height = Math.max(1, Math.round(cssHeight * ratio));\r
      if (canvas.width !== width || canvas.height !== height) {\r
        canvas.width = width;\r
        canvas.height = height;\r
      }\r
      size.width = cssWidth;\r
      size.height = cssHeight;\r
      size.ratio = width / cssWidth;\r
      layout();\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (lost) return;\r
      const s = settingsRef.current;\r
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05);\r
      last = Math.max(last, now);\r
      if (!reduced) time += dt * s.speed;\r
      if (focus < 1) focus = Math.min(1, focus + dt / 1.8);\r
\r
      const tracking = s.interactive && pointer.inside;\r
      if (tracking && (!lens.ready || lens.presence < 0.01)) {\r
        lens.x = pointer.x;\r
        lens.y = pointer.y;\r
        lens.vx = 0;\r
        lens.vy = 0;\r
        lens.ready = true;\r
      }\r
      if (lens.ready) {\r
        const omega = 18;\r
        const f = 1 + 2 * dt * omega;\r
        const oo = omega * omega;\r
        const hoo = dt * oo;\r
        const hhoo = dt * hoo;\r
        const inv = 1 / (f + hhoo);\r
        const nx = (f * lens.x + dt * lens.vx + hhoo * pointer.x) * inv;\r
        const ny = (f * lens.y + dt * lens.vy + hhoo * pointer.y) * inv;\r
        lens.vx = (lens.vx + hoo * (pointer.x - lens.x)) * inv;\r
        lens.vy = (lens.vy + hoo * (pointer.y - lens.y)) * inv;\r
        lens.x = nx;\r
        lens.y = ny;\r
      }\r
      const presenceTarget = tracking ? 1 : 0;\r
      lens.presence += (presenceTarget - lens.presence) * (1 - Math.exp(-dt / (tracking ? 0.18 : 0.4)));\r
      const zoomTarget = tracking && pointer.down && s.holdToZoom ? 1 : 0;\r
      lens.zoom += (zoomTarget - lens.zoom) * (1 - Math.exp(-dt / 0.14));\r
\r
      const eased = focus < 0.5 ? 4 * focus * focus * focus : 1 - Math.pow(-2 * focus + 2, 3) / 2;\r
      const presence = lens.presence * lens.presence * (3 - 2 * lens.presence);\r
      const extent = Math.abs(size.width * s.direction[0]) + Math.abs(size.height * s.direction[1]);\r
\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      gl.useProgram(shader.program);\r
      gl.bindVertexArray(vao);\r
      const u = shader.uniforms;\r
      gl.uniform2f(u.uSize, size.width, size.height);\r
      gl.uniform1f(u.uPixel, size.ratio);\r
      gl.uniform1f(u.uRadius, s.radius);\r
      gl.uniform1f(u.uCell, s.step);\r
      gl.uniform4f(u.uLens, lens.x, lens.y, s.lensRadius * (1 + lens.zoom * 0.12), presence);\r
      gl.uniform2f(u.uWarp, strengthOf(s, lens.zoom), s.twist * (1 + lens.zoom * 0.6));\r
      gl.uniform3f(\r
        u.uGlow,\r
        s.glowRadius * (1 + lens.zoom * 0.1),\r
        s.glowIntensity * (1 + lens.zoom * 0.25),\r
        s.light ? 0 : 1\r
      );\r
      gl.uniform3f(u.uFrom, s.from[0], s.from[1], s.from[2]);\r
      gl.uniform3f(u.uTo, s.to[0], s.to[1], s.to[2]);\r
      gl.uniform4f(u.uGlowColor, s.glowColor[0], s.glowColor[1], s.glowColor[2], s.glowWeight);\r
      gl.uniform3f(u.uGradient, s.direction[0], s.direction[1], Math.max(extent, 1));\r
      gl.uniform1f(u.uTime, time);\r
      gl.uniform1f(u.uWave, s.wave);\r
      gl.uniform1f(u.uSparkle, s.sparkle);\r
      gl.uniform1f(u.uFocus, eased);\r
      gl.uniform1f(u.uBase, s.light ? Math.min(1, s.base * 1.3) : s.base);\r
      gl.uniform1f(u.uLight, s.light ? 1 : 0);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      if (count) gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, count);\r
\r
      const moving =\r
        Math.abs(pointer.x - lens.x) + Math.abs(pointer.y - lens.y) > 0.05 || Math.hypot(lens.vx, lens.vy) > 0.5;\r
      const settling =\r
        Math.abs(presenceTarget - lens.presence) > 0.002 ||\r
        Math.abs(zoomTarget - lens.zoom) > 0.002 ||\r
        (lens.presence > 0.002 && moving);\r
      const animated = !reduced && s.speed > 0 && (s.wave > 0 || s.sparkle > 0);\r
      const busy = focus < 1 || settling || animated;\r
      if (busy && visible && pageVisible) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (raf || lost || !visible || !pageVisible) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
    wakeRef.current = () => {\r
      resize();\r
      wake();\r
    };\r
\r
    const locate = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      return {\r
        x: event.clientX - rect.left,\r
        y: event.clientY - rect.top,\r
        inside:\r
          event.clientX >= rect.left &&\r
          event.clientX <= rect.right &&\r
          event.clientY >= rect.top &&\r
          event.clientY <= rect.bottom\r
      };\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const spot = locate(event);\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = spot.inside;\r
      wake();\r
    };\r
    const onPointerDown = (event: PointerEvent) => {\r
      const spot = locate(event);\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = spot.inside;\r
      pointer.down = spot.inside;\r
      wake();\r
    };\r
    const onLeave = () => {\r
      pointer.inside = false;\r
      pointer.down = false;\r
      wake();\r
    };\r
    const onPointerUp = (event: PointerEvent) => {\r
      pointer.down = false;\r
      if (event.pointerType !== 'mouse') pointer.inside = false;\r
      wake();\r
    };\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    window.addEventListener('pointerup', onPointerUp, { passive: true });\r
    window.addEventListener('pointercancel', onPointerUp, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onLeave);\r
\r
    const onLost = (event: Event) => {\r
      event.preventDefault();\r
      lost = true;\r
      cancelAnimationFrame(raf);\r
      raf = 0;\r
    };\r
    const onRestored = () => setGeneration(value => value + 1);\r
    canvas.addEventListener('webglcontextlost', onLost);\r
    canvas.addEventListener('webglcontextrestored', onRestored);\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      resize();\r
      wake();\r
    });\r
    resizeObserver.observe(container);\r
\r
    const intersection = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      wake();\r
    });\r
    intersection.observe(container);\r
\r
    const onVisibility = () => {\r
      pageVisible = document.visibilityState !== 'hidden';\r
      wake();\r
    };\r
    document.addEventListener('visibilitychange', onVisibility);\r
\r
    resize();\r
    wake();\r
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
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      canvas.removeEventListener('webglcontextlost', onLost);\r
      canvas.removeEventListener('webglcontextrestored', onRestored);\r
      if (!gl.isContextLost()) {\r
        gl.deleteBuffer(buffer);\r
        gl.deleteVertexArray(vao);\r
        gl.deleteProgram(shader.program);\r
      }\r
    };\r
  }, [generation]);\r
\r
  return (\r
    <div ref={containerRef} className={\`dot-field\${className ? \` \${className}\` : ''}\`} style={style}>\r
      <canvas ref={canvasRef} className="dot-field__canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default DotField;\r
`,o=`'use client';\r
\r
import { useEffect, useRef, useState, type CSSProperties } from 'react';\r
\r
type Pattern = 'grid' | 'hex' | 'spiral' | 'scatter';\r
\r
export interface DotFieldProps {\r
  dotRadius?: number;\r
  dotSpacing?: number;\r
  pattern?: Pattern;\r
  gradientFrom?: string;\r
  gradientTo?: string;\r
  gradientAngle?: number;\r
  cursorRadius?: number;\r
  bulgeStrength?: number;\r
  twist?: number;\r
  glowColor?: string;\r
  glowRadius?: number;\r
  glowIntensity?: number;\r
  baseOpacity?: number;\r
  waveAmplitude?: number;\r
  sparkle?: boolean;\r
  speed?: number;\r
  interactive?: boolean;\r
  holdToZoom?: boolean;\r
  intro?: boolean;\r
  lightMode?: boolean;\r
  opacity?: number;\r
  maxDevicePixelRatio?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Settings {\r
  radius: number;\r
  step: number;\r
  pattern: number;\r
  from: number[];\r
  to: number[];\r
  glowColor: number[];\r
  glowWeight: number;\r
  direction: number[];\r
  lensRadius: number;\r
  strength: number;\r
  twist: number;\r
  glowRadius: number;\r
  glowIntensity: number;\r
  base: number;\r
  wave: number;\r
  sparkle: number;\r
  speed: number;\r
  interactive: boolean;\r
  holdToZoom: boolean;\r
  intro: boolean;\r
  light: boolean;\r
  opacity: number;\r
  maxRatio: number;\r
}\r
\r
interface Program {\r
  program: WebGLProgram;\r
  uniforms: Record<string, WebGLUniformLocation | null>;\r
}\r
\r
const PIXEL_BUDGET = 9e6;\r
const MAX_DOTS = 120000;\r
const PATTERNS: Record<Pattern, number> = { grid: 0, hex: 1, spiral: 2, scatter: 3 };\r
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));\r
\r
const VERTEX = \`#version 300 es\r
precision highp float;\r
layout(location = 0) in vec4 aDot;\r
uniform vec2 uSize;\r
uniform float uPixel;\r
uniform float uRadius;\r
uniform float uCell;\r
uniform vec4 uLens;\r
uniform vec2 uWarp;\r
uniform vec3 uGlow;\r
uniform vec3 uFrom;\r
uniform vec3 uTo;\r
uniform vec4 uGlowColor;\r
uniform vec3 uGradient;\r
uniform float uTime;\r
uniform float uWave;\r
uniform float uSparkle;\r
uniform float uFocus;\r
uniform float uBase;\r
uniform float uLight;\r
out vec2 vLocal;\r
out float vRadius;\r
out float vBlur;\r
out float vHalo;\r
out float vHaloWidth;\r
out vec3 vColor;\r
out float vAlpha;\r
\r
vec3 toRgb(vec3 lab) {\r
  float l = lab.x + 0.3963377774 * lab.y + 0.2158037573 * lab.z;\r
  float m = lab.x - 0.1055613458 * lab.y - 0.0638541728 * lab.z;\r
  float s = lab.x - 0.0894841775 * lab.y - 1.291485548 * lab.z;\r
  vec3 lms = vec3(l * l * l, m * m * m, s * s * s);\r
  vec3 lin = clamp(vec3(\r
    4.0767416621 * lms.x - 3.3077115913 * lms.y + 0.2309699292 * lms.z,\r
    -1.2684380046 * lms.x + 2.6097574011 * lms.y - 0.3413193965 * lms.z,\r
    -0.0041960863 * lms.x - 0.7034186147 * lms.y + 1.707614701 * lms.z\r
  ), 0.0, 1.0);\r
  return mix(lin * 12.92, 1.055 * pow(lin, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, lin));\r
}\r
\r
vec3 blend(vec3 a, vec3 b, float t) {\r
  vec2 ab = mix(a.yz, b.yz, t);\r
  float chroma = mix(length(a.yz), length(b.yz), t);\r
  float len = length(ab);\r
  return vec3(mix(a.x, b.x, t), len > 1e-5 ? ab * (chroma / len) : ab);\r
}\r
\r
vec3 wave(vec2 p, float t) {\r
  float ay = p.x * 0.018 + t + 1.1 * sin(p.y * 0.016 - t * 0.4);\r
  float ax = p.y * 0.021 + t * 0.7 + 1.3 * sin(p.x * 0.013 + t * 0.3);\r
  float spread = cos(ay) * 0.0176 * cos(p.y * 0.016 - t * 0.4) + 0.5 * cos(ax) * 0.0169 * cos(p.x * 0.013 + t * 0.3);\r
  return uWave * vec3(0.5 * sin(ax), sin(ay), spread);\r
}\r
\r
void main() {\r
  vec2 corner = vec2(float(gl_VertexID & 1), float(gl_VertexID >> 1)) * 2.0 - 1.0;\r
  vec2 center = uSize * 0.5;\r
  vec3 swell = wave(aDot.xy, uTime);\r
  vec2 source = center + (aDot.xy - center) * mix(1.12, 1.0, uFocus) + swell.xy;\r
\r
  vec2 rel = source - uLens.xy;\r
  float x = length(rel) / uLens.z;\r
  float y = clamp(1.0 - x * x, 0.0, 1.0);\r
  float w = y * y * y;\r
  float k = uWarp.x * uLens.w;\r
  float grow = 1.0 + k * w;\r
  float spread = 1.0 + k * (w - 6.0 * x * x * y * y);\r
  float theta = uWarp.y * uLens.w * w;\r
  vec2 turn = vec2(cos(theta), sin(theta));\r
  vec2 display = uLens.xy + vec2(turn.x * rel.x - turn.y * rel.y, turn.y * rel.x + turn.x * rel.y) * grow;\r
  float scale = sqrt(max(grow * spread, 0.02));\r
\r
  float spark = 0.0;\r
  if (uSparkle > 0.0) {\r
    float phase = 0.5 + 0.5 * sin(uTime * (0.55 + aDot.w * 0.9) + aDot.z * 6.2831853);\r
    spark = pow(phase, 48.0) * step(0.72, fract(aDot.z * 7.31 + aDot.w * 3.17)) * uSparkle;\r
  }\r
\r
  float pool = 0.0;\r
  if (uGlow.x > 0.0) {\r
    float g = length(display - uLens.xy) / uGlow.x;\r
    float q = clamp(1.0 - g * g, 0.0, 1.0);\r
    pool = q * q * uGlow.y * uLens.w;\r
  }\r
\r
  float radius = uRadius * (1.0 + 0.7 * spark);\r
  float device = radius * scale * uPixel;\r
  float fade = 1.0;\r
  if (device < 0.75) {\r
    fade = device * device / 0.5625;\r
    radius = 0.75 / (scale * uPixel);\r
  }\r
  float blur = (1.0 - uFocus) * uCell * 0.42;\r
  float energy = pow(radius / (radius + blur), 1.15);\r
  float halo = pool * uGlow.z;\r
  float haloWidth = 2.0 + radius * 1.5;\r
  float pad = radius + blur * 1.2 + 1.5 / (scale * uPixel) + (halo > 0.0 ? haloWidth * 2.5 : 0.0);\r
\r
  float t = clamp(dot(aDot.xy - center, uGradient.xy) / uGradient.z + 0.5, 0.0, 1.0);\r
  vec3 tone = blend(uFrom, uTo, t);\r
  vec3 deep = vec3(tone.x * 0.72, tone.yz * 1.3);\r
  vec3 base = toRgb(tone);\r
  vec3 lit = toRgb(mix(deep, uGlowColor.xyz, uGlowColor.w));\r
  vec3 color = mix(base, lit, clamp(pool, 0.0, 1.0) * 0.8);\r
  color = mix(color, uLight > 0.5 ? color * 0.6 : vec3(1.0), spark * 0.55);\r
\r
  vLocal = corner * pad;\r
  vRadius = radius + blur;\r
  vBlur = blur * 0.7;\r
  vHalo = halo;\r
  vHaloWidth = haloWidth;\r
  vColor = color;\r
  float shade = clamp(1.0 - swell.z * 2.5, 0.4, 1.6);\r
  vAlpha = mix(min(uBase * shade, 1.0), 1.0, clamp(max(pool, spark), 0.0, 1.0)) * fade * energy * smoothstep(0.0, 0.25, uFocus + 0.08);\r
  vec2 point = display + corner * pad * scale;\r
  gl_Position = vec4(point.x / uSize.x * 2.0 - 1.0, 1.0 - point.y / uSize.y * 2.0, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform float uOpacity;\r
in vec2 vLocal;\r
in float vRadius;\r
in float vBlur;\r
in float vHalo;\r
in float vHaloWidth;\r
in vec3 vColor;\r
in float vAlpha;\r
out vec4 fragColor;\r
\r
void main() {\r
  float dist = length(vLocal);\r
  float d = dist - vRadius;\r
  float edge = max(fwidth(dist), 1e-4) + vBlur;\r
  float cover = 1.0 - smoothstep(-0.5 * edge, 0.5 * edge, d);\r
  float glow = vHalo * exp(-max(d, 0.0) / vHaloWidth) * 0.5;\r
  float alpha = min(cover + glow, 1.0) * vAlpha * uOpacity;\r
  if (alpha < 0.002) discard;\r
  fragColor = vec4(vColor * alpha, alpha);\r
}\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const parseColor = (value: string): number[] | null => {\r
  const text = String(value || '').trim();\r
  const hex = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text);\r
  if (hex) {\r
    const full = hex[1].length === 3 ? hex[1].replace(/./g, digit => digit + digit) : hex[1];\r
    return [0, 2, 4].map(index => parseInt(full.slice(index, index + 2), 16) / 255);\r
  }\r
  const rgb = /^rgba?\\(\\s*([\\d.]+)[\\s,]+([\\d.]+)[\\s,]+([\\d.]+)/i.exec(text);\r
  if (rgb) return [rgb[1], rgb[2], rgb[3]].map(channel => clamp(parseFloat(channel) / 255, 0, 1));\r
  return null;\r
};\r
\r
const toLinear = (channel: number) => (channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4));\r
\r
const toOklab = (color: number[]): number[] => {\r
  const [r, g, b] = color.map(toLinear);\r
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
const toInk = (value: string, fallback: number[], light: boolean): number[] => {\r
  const lab = toOklab(parseColor(value) || fallback);\r
  if (!light) return lab;\r
  const hue = (Math.atan2(lab[2], lab[1]) * 180) / Math.PI;\r
  const warmth = clamp(1 - Math.abs(hue - 85) / 40, 0, 1);\r
  const ceiling = 0.6 + 0.16 * warmth * warmth * (3 - 2 * warmth);\r
  if (lab[0] <= ceiling) return lab;\r
  const boost = 1 + (lab[0] - ceiling) * 1.6;\r
  return [ceiling, lab[1] * boost, lab[2] * boost];\r
};\r
\r
const chroma = (value: string) => {\r
  const lab = toOklab(parseColor(value) || [1, 1, 1]);\r
  return Math.hypot(lab[1], lab[2]);\r
};\r
\r
const hash = (a: number, b: number, c: number) => {\r
  let h = (Math.imul(a, 374761393) + Math.imul(b, 668265263) + Math.imul(c, 1274126177)) | 0;\r
  h = Math.imul(h ^ (h >>> 13), 1274126177);\r
  h ^= h >>> 16;\r
  return (h >>> 0) / 4294967296;\r
};\r
\r
const lensReach = (radius: number, strength: number, twist: number) => {\r
  let peak = 0;\r
  for (let index = 1; index < 48; index++) {\r
    const x = index / 48;\r
    const w = (1 - x * x) ** 3;\r
    const sigma = x * radius;\r
    const grow = 1 + strength * w;\r
    const theta = twist * w;\r
    peak = Math.max(peak, Math.hypot(sigma * (grow * Math.cos(theta) - 1), sigma * grow * Math.sin(theta)));\r
  }\r
  return peak;\r
};\r
\r
const buildDots = (width: number, height: number, step: number, pattern: number, margin: number) => {\r
  const cx = width / 2;\r
  const cy = height / 2;\r
  const minX = -margin;\r
  const maxX = width + margin;\r
  const minY = -margin;\r
  const maxY = height + margin;\r
  const out: number[] = [];\r
  const push = (x: number, y: number, a: number, b: number) => {\r
    if (x >= minX && x <= maxX && y >= minY && y <= maxY) out.push(x, y, a, b);\r
  };\r
  if (pattern === PATTERNS.spiral) {\r
    const spacing = step / Math.sqrt(Math.PI);\r
    const reach = Math.hypot(width / 2 + margin, height / 2 + margin);\r
    const count = Math.ceil((reach / spacing) ** 2);\r
    for (let index = 0; index < count; index++) {\r
      const r = spacing * Math.sqrt(index + 0.5);\r
      const angle = index * GOLDEN_ANGLE;\r
      push(cx + r * Math.cos(angle), cy + r * Math.sin(angle), hash(index, 0, 3), hash(index, 0, 4));\r
    }\r
  } else {\r
    const rowStep = pattern === PATTERNS.hex ? (step * Math.sqrt(3)) / 2 : step;\r
    const cols = Math.ceil((width / 2 + margin) / step) + 1;\r
    const rows = Math.ceil((height / 2 + margin) / rowStep) + 1;\r
    for (let row = -rows; row <= rows; row++) {\r
      for (let col = -cols; col <= cols; col++) {\r
        let x = cx + col * step + (pattern === PATTERNS.hex && row & 1 ? step / 2 : 0);\r
        let y = cy + row * rowStep;\r
        if (pattern === PATTERNS.scatter) {\r
          x += (hash(col, row, 1) - 0.5) * step * 0.8;\r
          y += (hash(col, row, 2) - 0.5) * step * 0.8;\r
        }\r
        push(x, y, hash(col, row, 3), hash(col, row, 4));\r
      }\r
    }\r
  }\r
  return new Float32Array(out);\r
};\r
\r
const compile = (gl: WebGL2RenderingContext, type: number, source: string) => {\r
  const shader = gl.createShader(type);\r
  if (!shader) return null;\r
  gl.shaderSource(shader, source);\r
  gl.compileShader(shader);\r
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {\r
    console.error(gl.getShaderInfoLog(shader));\r
    gl.deleteShader(shader);\r
    return null;\r
  }\r
  return shader;\r
};\r
\r
const link = (gl: WebGL2RenderingContext): Program | null => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
  const program = vertex && fragment ? gl.createProgram() : null;\r
  if (!vertex || !fragment || !program) {\r
    if (vertex) gl.deleteShader(vertex);\r
    if (fragment) gl.deleteShader(fragment);\r
    return null;\r
  }\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
  gl.linkProgram(program);\r
  gl.deleteShader(vertex);\r
  gl.deleteShader(fragment);\r
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {\r
    console.error(gl.getProgramInfoLog(program));\r
    gl.deleteProgram(program);\r
    return null;\r
  }\r
  const uniforms: Program['uniforms'] = {};\r
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
  for (let index = 0; index < count; index++) {\r
    const info = gl.getActiveUniform(program, index);\r
    if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const DotField = ({\r
  dotRadius = 1.5,\r
  dotSpacing = 14,\r
  pattern = 'grid',\r
  gradientFrom = '#5227FF',\r
  gradientTo = '#FF9FFC',\r
  gradientAngle = 135,\r
  cursorRadius = 240,\r
  bulgeStrength = 0.6,\r
  twist = 0,\r
  glowColor = '#ffffff',\r
  glowRadius = 160,\r
  glowIntensity = 0.8,\r
  baseOpacity = 0.55,\r
  waveAmplitude = 0,\r
  sparkle = false,\r
  speed = 1,\r
  interactive = true,\r
  holdToZoom = true,\r
  intro = true,\r
  lightMode = false,\r
  opacity = 1,\r
  maxDevicePixelRatio = 2,\r
  className = '',\r
  style\r
}: DotFieldProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const [generation, setGeneration] = useState(0);\r
\r
  const radius = clamp(dotRadius, 0.25, 12);\r
  const step = radius * 2 + clamp(dotSpacing, 1, 200);\r
  const angle = (gradientAngle * Math.PI) / 180;\r
  const settings: Settings = {\r
    radius,\r
    step,\r
    pattern: PATTERNS[pattern] ?? PATTERNS.grid,\r
    from: toInk(gradientFrom, [0.32, 0.15, 1], lightMode),\r
    to: toInk(gradientTo, [1, 0.62, 0.99], lightMode),\r
    glowColor: toInk(glowColor, [1, 1, 1], lightMode),\r
    glowWeight: lightMode ? clamp((chroma(glowColor) - 0.02) / 0.06, 0, 1) : 1,\r
    direction: [Math.sin(angle), -Math.cos(angle)],\r
    lensRadius: clamp(cursorRadius, 20, 2000),\r
    strength: clamp(bulgeStrength, -1, 1),\r
    twist: (clamp(twist, -360, 360) * Math.PI) / 180,\r
    glowRadius: Math.max(0, glowRadius),\r
    glowIntensity: clamp(glowIntensity, 0, 2),\r
    base: clamp(baseOpacity, 0, 1),\r
    wave: clamp(waveAmplitude, 0, 60),\r
    sparkle: sparkle ? 1 : 0,\r
    speed: Math.max(0, speed),\r
    interactive,\r
    holdToZoom,\r
    intro,\r
    light: lightMode,\r
    opacity: clamp(opacity, 0, 1),\r
    maxRatio: clamp(maxDevicePixelRatio, 0.5, 3)\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    if (!container || !canvas) return;\r
\r
    const gl = canvas.getContext('webgl2', {\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false,\r
      powerPreference: 'high-performance'\r
    });\r
    const shader = gl ? link(gl) : null;\r
    if (!gl || !shader) return;\r
\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
    const vao = gl.createVertexArray();\r
    const buffer = gl.createBuffer();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 16, 0);\r
    gl.vertexAttribDivisor(0, 1);\r
    gl.bindVertexArray(null);\r
\r
    const size = { width: 1, height: 1, ratio: 1 };\r
    const pointer = { x: 0, y: 0, inside: false, down: false };\r
    const lens = { x: 0, y: 0, vx: 0, vy: 0, presence: 0, zoom: 0, ready: false };\r
    let layoutKey = '';\r
    let count = 0;\r
    let time = Math.random() * 100;\r
    let focus = settingsRef.current.intro && !reduced && generation === 0 ? 0 : 1;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let pageVisible = document.visibilityState !== 'hidden';\r
    let lost = false;\r
\r
    const strengthOf = (s: Settings, zoom: number) => {\r
      const base = s.strength >= 0 ? s.strength * 1.2 : s.strength * 0.7;\r
      return clamp(base * (1 + zoom * 0.6), -0.85, 1.45);\r
    };\r
\r
    const layout = () => {\r
      const s = settingsRef.current;\r
      const reach = lensReach(s.lensRadius, strengthOf(s, s.holdToZoom ? 1 : 0), s.twist * (s.holdToZoom ? 1.6 : 1));\r
      const margin = Math.ceil(reach + s.wave + s.step * 2);\r
      const area = (size.width + margin * 2) * (size.height + margin * 2);\r
      const step = Math.max(s.step, Math.sqrt(area / MAX_DOTS));\r
      const key = \`\${size.width}|\${size.height}|\${step}|\${s.pattern}|\${margin}\`;\r
      if (key === layoutKey) return;\r
      layoutKey = key;\r
      const data = buildDots(size.width, size.height, step, s.pattern, margin);\r
      count = data.length / 4;\r
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const rect = container.getBoundingClientRect();\r
      const cssWidth = Math.max(1, rect.width);\r
      const cssHeight = Math.max(1, rect.height);\r
      const ratio = Math.min(\r
        window.devicePixelRatio || 1,\r
        s.maxRatio,\r
        Math.sqrt(PIXEL_BUDGET / (cssWidth * cssHeight))\r
      );\r
      const width = Math.max(1, Math.round(cssWidth * ratio));\r
      const height = Math.max(1, Math.round(cssHeight * ratio));\r
      if (canvas.width !== width || canvas.height !== height) {\r
        canvas.width = width;\r
        canvas.height = height;\r
      }\r
      size.width = cssWidth;\r
      size.height = cssHeight;\r
      size.ratio = width / cssWidth;\r
      layout();\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (lost) return;\r
      const s = settingsRef.current;\r
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05);\r
      last = Math.max(last, now);\r
      if (!reduced) time += dt * s.speed;\r
      if (focus < 1) focus = Math.min(1, focus + dt / 1.8);\r
\r
      const tracking = s.interactive && pointer.inside;\r
      if (tracking && (!lens.ready || lens.presence < 0.01)) {\r
        lens.x = pointer.x;\r
        lens.y = pointer.y;\r
        lens.vx = 0;\r
        lens.vy = 0;\r
        lens.ready = true;\r
      }\r
      if (lens.ready) {\r
        const omega = 18;\r
        const f = 1 + 2 * dt * omega;\r
        const oo = omega * omega;\r
        const hoo = dt * oo;\r
        const hhoo = dt * hoo;\r
        const inv = 1 / (f + hhoo);\r
        const nx = (f * lens.x + dt * lens.vx + hhoo * pointer.x) * inv;\r
        const ny = (f * lens.y + dt * lens.vy + hhoo * pointer.y) * inv;\r
        lens.vx = (lens.vx + hoo * (pointer.x - lens.x)) * inv;\r
        lens.vy = (lens.vy + hoo * (pointer.y - lens.y)) * inv;\r
        lens.x = nx;\r
        lens.y = ny;\r
      }\r
      const presenceTarget = tracking ? 1 : 0;\r
      lens.presence += (presenceTarget - lens.presence) * (1 - Math.exp(-dt / (tracking ? 0.18 : 0.4)));\r
      const zoomTarget = tracking && pointer.down && s.holdToZoom ? 1 : 0;\r
      lens.zoom += (zoomTarget - lens.zoom) * (1 - Math.exp(-dt / 0.14));\r
\r
      const eased = focus < 0.5 ? 4 * focus * focus * focus : 1 - Math.pow(-2 * focus + 2, 3) / 2;\r
      const presence = lens.presence * lens.presence * (3 - 2 * lens.presence);\r
      const extent = Math.abs(size.width * s.direction[0]) + Math.abs(size.height * s.direction[1]);\r
\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      gl.useProgram(shader.program);\r
      gl.bindVertexArray(vao);\r
      const u = shader.uniforms;\r
      gl.uniform2f(u.uSize, size.width, size.height);\r
      gl.uniform1f(u.uPixel, size.ratio);\r
      gl.uniform1f(u.uRadius, s.radius);\r
      gl.uniform1f(u.uCell, s.step);\r
      gl.uniform4f(u.uLens, lens.x, lens.y, s.lensRadius * (1 + lens.zoom * 0.12), presence);\r
      gl.uniform2f(u.uWarp, strengthOf(s, lens.zoom), s.twist * (1 + lens.zoom * 0.6));\r
      gl.uniform3f(\r
        u.uGlow,\r
        s.glowRadius * (1 + lens.zoom * 0.1),\r
        s.glowIntensity * (1 + lens.zoom * 0.25),\r
        s.light ? 0 : 1\r
      );\r
      gl.uniform3f(u.uFrom, s.from[0], s.from[1], s.from[2]);\r
      gl.uniform3f(u.uTo, s.to[0], s.to[1], s.to[2]);\r
      gl.uniform4f(u.uGlowColor, s.glowColor[0], s.glowColor[1], s.glowColor[2], s.glowWeight);\r
      gl.uniform3f(u.uGradient, s.direction[0], s.direction[1], Math.max(extent, 1));\r
      gl.uniform1f(u.uTime, time);\r
      gl.uniform1f(u.uWave, s.wave);\r
      gl.uniform1f(u.uSparkle, s.sparkle);\r
      gl.uniform1f(u.uFocus, eased);\r
      gl.uniform1f(u.uBase, s.light ? Math.min(1, s.base * 1.3) : s.base);\r
      gl.uniform1f(u.uLight, s.light ? 1 : 0);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      if (count) gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, count);\r
\r
      const moving =\r
        Math.abs(pointer.x - lens.x) + Math.abs(pointer.y - lens.y) > 0.05 || Math.hypot(lens.vx, lens.vy) > 0.5;\r
      const settling =\r
        Math.abs(presenceTarget - lens.presence) > 0.002 ||\r
        Math.abs(zoomTarget - lens.zoom) > 0.002 ||\r
        (lens.presence > 0.002 && moving);\r
      const animated = !reduced && s.speed > 0 && (s.wave > 0 || s.sparkle > 0);\r
      const busy = focus < 1 || settling || animated;\r
      if (busy && visible && pageVisible) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (raf || lost || !visible || !pageVisible) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
    wakeRef.current = () => {\r
      resize();\r
      wake();\r
    };\r
\r
    const locate = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      return {\r
        x: event.clientX - rect.left,\r
        y: event.clientY - rect.top,\r
        inside:\r
          event.clientX >= rect.left &&\r
          event.clientX <= rect.right &&\r
          event.clientY >= rect.top &&\r
          event.clientY <= rect.bottom\r
      };\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const spot = locate(event);\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = spot.inside;\r
      wake();\r
    };\r
    const onPointerDown = (event: PointerEvent) => {\r
      const spot = locate(event);\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = spot.inside;\r
      pointer.down = spot.inside;\r
      wake();\r
    };\r
    const onLeave = () => {\r
      pointer.inside = false;\r
      pointer.down = false;\r
      wake();\r
    };\r
    const onPointerUp = (event: PointerEvent) => {\r
      pointer.down = false;\r
      if (event.pointerType !== 'mouse') pointer.inside = false;\r
      wake();\r
    };\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    window.addEventListener('pointerup', onPointerUp, { passive: true });\r
    window.addEventListener('pointercancel', onPointerUp, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onLeave);\r
\r
    const onLost = (event: Event) => {\r
      event.preventDefault();\r
      lost = true;\r
      cancelAnimationFrame(raf);\r
      raf = 0;\r
    };\r
    const onRestored = () => setGeneration(value => value + 1);\r
    canvas.addEventListener('webglcontextlost', onLost);\r
    canvas.addEventListener('webglcontextrestored', onRestored);\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      resize();\r
      wake();\r
    });\r
    resizeObserver.observe(container);\r
\r
    const intersection = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      wake();\r
    });\r
    intersection.observe(container);\r
\r
    const onVisibility = () => {\r
      pageVisible = document.visibilityState !== 'hidden';\r
      wake();\r
    };\r
    document.addEventListener('visibilitychange', onVisibility);\r
\r
    resize();\r
    wake();\r
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
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      canvas.removeEventListener('webglcontextlost', onLost);\r
      canvas.removeEventListener('webglcontextrestored', onRestored);\r
      if (!gl.isContextLost()) {\r
        gl.deleteBuffer(buffer);\r
        gl.deleteVertexArray(vao);\r
        gl.deleteProgram(shader.program);\r
      }\r
    };\r
  }, [generation]);\r
\r
  return (\r
    <div ref={containerRef} className={\`relative h-full w-full overflow-hidden \${className}\`.trim()} style={style}>\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default DotField;\r
`,a={dependencies:"",usage:`import DotField from './DotField';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <DotField
    gradientFrom="#5227FF"
    gradientTo="#FF9FFC"
    dotRadius={1.5}
    dotSpacing={14}
    cursorRadius={240}
    bulgeStrength={0.6}
    glowRadius={160}
  />
</div>`,code:n,css:r,tailwind:e,tsCode:t,tsTailwind:o};export{a as dotField};
