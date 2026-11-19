const n=`'use client';\r
\r
import { useEffect, useRef, useState } from 'react';\r
import './MagnetLines.css';\r
\r
const VERTEX = \`#version 300 es\r
layout(location = 0) in vec2 aCorner;\r
layout(location = 1) in vec2 aCenter;\r
layout(location = 2) in vec4 aState;\r
uniform mat3 uView;\r
uniform vec2 uCanvas;\r
uniform vec2 uOffset;\r
uniform vec2 uLine;\r
uniform float uStretch;\r
uniform float uHead;\r
uniform float uPad;\r
uniform float uFar;\r
out vec2 vLocal;\r
out vec2 vHalf;\r
out float vEmphasis;\r
out float vFlash;\r
out float vAngle;\r
out float vShown;\r
void main() {\r
  float angle = aState.x;\r
  float emphasis = aState.y;\r
  float halfLength = uLine.x * (1.0 + uStretch * emphasis);\r
  float halfWidth = uLine.y;\r
  vec2 extent = vec2(halfLength + uPad, max(halfWidth, uHead * halfLength) + uPad);\r
  vec2 local = aCorner * extent;\r
  vec2 axis = vec2(cos(angle), sin(angle));\r
  vec2 point = aCenter + axis * local.x + vec2(-axis.y, axis.x) * local.y;\r
  vec3 screen = uView * vec3(point, 1.0);\r
  vec2 scale = vec2(2.0 / uCanvas.x, -2.0 / uCanvas.y);\r
  vec2 shift = vec2(-1.0 + 2.0 * uOffset.x / uCanvas.x, 1.0 - 2.0 * uOffset.y / uCanvas.y);\r
  gl_Position = vec4(screen.xy * scale + shift * screen.z, 0.0, screen.z);\r
  float depth = (uView * vec3(aCenter, 1.0)).z;\r
  vLocal = local;\r
  vHalf = vec2(halfLength, halfWidth);\r
  vEmphasis = emphasis;\r
  vFlash = aState.z;\r
  vAngle = angle;\r
  vShown = aState.w * (1.0 - smoothstep(uFar * 0.45, uFar, depth));\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
in vec2 vLocal;\r
in vec2 vHalf;\r
in float vEmphasis;\r
in float vFlash;\r
in float vAngle;\r
in float vShown;\r
out vec4 fragColor;\r
uniform vec3 uColor;\r
uniform vec3 uAccent;\r
uniform float uAccentMix;\r
uniform float uOpacity;\r
uniform float uFade;\r
uniform int uShape;\r
uniform float uHead;\r
uniform float uRainbow;\r
uniform float uTone;\r
uniform float uPeriod;\r
uniform vec2 uCanvas;\r
uniform vec2 uOffset;\r
uniform vec2 uPixels;\r
uniform vec2 uEdge;\r
\r
float ndot(vec2 a, vec2 b) {\r
  return a.x * b.x - a.y * b.y;\r
}\r
\r
float rhombus(vec2 p, vec2 b) {\r
  p = abs(p);\r
  float h = clamp(ndot(b - 2.0 * p, b) / dot(b, b), -1.0, 1.0);\r
  float d = length(p - 0.5 * b * vec2(1.0 - h, 1.0 + h));\r
  return d * sign(p.x * b.y + p.y * b.x - b.x * b.y);\r
}\r
\r
float triangle(vec2 p, vec2 q) {\r
  p.x = abs(p.x);\r
  vec2 a = p - q * clamp(dot(p, q) / dot(q, q), 0.0, 1.0);\r
  vec2 b = p - q * vec2(clamp(p.x / q.x, 0.0, 1.0), 1.0);\r
  float s = -sign(q.y);\r
  vec2 d = min(vec2(dot(a, a), s * (p.x * q.y - p.y * q.x)), vec2(dot(b, b), s * (p.y - q.y)));\r
  return -sqrt(d.x) * sign(d.y);\r
}\r
\r
float capsule(vec2 p, float from, float to, float radius) {\r
  float x = clamp(p.x, from, to);\r
  return length(vec2(p.x - x, p.y)) - radius;\r
}\r
\r
float feather(float distance, float zone) {\r
  if (zone <= 0.0) return 1.0;\r
  float t = clamp(distance / zone, 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
vec3 spectrum(float hue, float tone) {\r
  vec3 k = clamp(abs(fract(hue + vec3(0.0, 2.0, 1.0) / 3.0) * 6.0 - 3.0) - 1.0, 0.0, 1.0);\r
  k = k * k * (3.0 - 2.0 * k);\r
  float chroma = (1.0 - abs(2.0 * tone - 1.0)) * 0.92;\r
  return tone + chroma * (k - 0.5);\r
}\r
\r
void main() {\r
  vec2 p = vLocal;\r
  float aa = max(length(fwidth(p)) * 0.7071, 0.0001);\r
  float halfWidth = max(vHalf.y, aa * 0.5);\r
  float thin = vHalf.y / halfWidth;\r
  float halfLength = max(vHalf.x, halfWidth);\r
  float d;\r
  if (uShape == 1) {\r
    float head = min(halfLength * 0.9, max(halfWidth * 4.5, halfLength * 0.55));\r
    float wing = max(uHead * halfLength, halfWidth * 2.2);\r
    float shaft = capsule(p, -halfLength + halfWidth, halfLength - head * 0.6, halfWidth);\r
    float tip = triangle(vec2(p.y, halfLength - p.x), vec2(wing, head));\r
    d = min(shaft, tip);\r
  } else if (uShape == 2) {\r
    d = rhombus(p, vec2(halfLength, max(uHead * halfLength, halfWidth)));\r
  } else {\r
    d = capsule(p, -halfLength + halfWidth, halfLength - halfWidth, halfWidth);\r
  }\r
  float coverage = clamp(0.5 - d / aa, 0.0, 1.0) * thin;\r
  if (coverage <= 0.0) discard;\r
\r
  float emphasis = clamp(vEmphasis + vFlash, 0.0, 1.0);\r
  vec3 color = mix(uColor, uAccent, uAccentMix * emphasis);\r
  if (uShape == 2) {\r
    float north = smoothstep(-aa, aa, p.x);\r
    color = mix(uColor, uAccent, north);\r
  }\r
  if (uRainbow > 0.5) {\r
    float hue = fract(vAngle / uPeriod);\r
    vec3 tint = spectrum(hue, uTone);\r
    color = uShape == 2 ? mix(tint, uColor, 1.0 - smoothstep(-aa, aa, p.x)) : tint;\r
  }\r
  float alpha = uOpacity * mix(1.0 - uFade, 1.0, clamp(vEmphasis, 0.0, 1.0));\r
  alpha = clamp(alpha + vFlash * 0.6, 0.0, 1.0) * coverage * vShown;\r
  vec2 point = vec2(gl_FragCoord.x, uPixels.y - gl_FragCoord.y) * (uCanvas / uPixels) - uOffset;\r
  vec2 inside = min(point, uCanvas - 2.0 * uOffset - point);\r
  alpha *= feather(inside.x, uEdge.x) * feather(inside.y, uEdge.y);\r
  fragColor = vec4(color * alpha, alpha);\r
}\`;\r
\r
const MODES = ['orbit', 'attract', 'spiral', 'dipole'];\r
const SHAPES = { line: 0, arrow: 1, needle: 2 };\r
const TAU = Math.PI * 2;\r
const PULSE_SPEED = 520;\r
const PULSE_SPIN = 0.34;\r
const INTRO_SPEED = 700;\r
const INTRO_TIME = 1.1;\r
const INTRO_SPIN = 0.65;\r
const FAR = 4;\r
const MAX_LINES = 30000;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
const smootherstep = t => t * t * t * (t * (t * 6 - 15) + 10);\r
\r
const wrap = (value, period) => {\r
  const half = period / 2;\r
  return ((((value + half) % period) + period) % period) - half;\r
};\r
\r
const seedFor = (column, row) => {\r
  let hash = Math.imul(column + 40503, 2246822519) ^ Math.imul(row + 9973, 3266489917);\r
  hash = Math.imul(hash ^ (hash >>> 15), 668265263);\r
  hash = Math.imul(hash ^ (hash >>> 13), 374761393);\r
  return (((hash ^ (hash >>> 16)) >>> 0) / 4294967296) * 2 - 1;\r
};\r
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
  if (typeof document !== 'undefined') {\r
    const context = document.createElement('canvas').getContext('2d');\r
    if (context) {\r
      context.fillStyle = '#000000';\r
      context.fillStyle = text;\r
      const normal = String(context.fillStyle);\r
      if (normal !== '#000000' || /^(#0{3}|#0{6}|black)$/i.test(text)) return parseColor(normal);\r
    }\r
  }\r
  return [0.94, 0.94, 0.94];\r
};\r
\r
const lightness = rgb => (Math.max(...rgb) + Math.min(...rgb)) / 2;\r
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
const multiply = (a, b) => {\r
  const out = [];\r
  for (let r = 0; r < 3; r++) {\r
    for (let c = 0; c < 3; c++) {\r
      out.push(a[r * 3] * b[c] + a[r * 3 + 1] * b[c + 3] + a[r * 3 + 2] * b[c + 6]);\r
    }\r
  }\r
  return out;\r
};\r
\r
const invert = m => {\r
  const [a, b, c, d, e, f, g, h, i] = m;\r
  const A = e * i - f * h;\r
  const B = f * g - d * i;\r
  const C = d * h - e * g;\r
  const det = a * A + b * B + c * C;\r
  return [A, c * h - b * i, b * f - c * e, B, a * i - c * g, c * d - a * f, C, b * g - a * h, a * e - b * d].map(\r
    value => value / det\r
  );\r
};\r
\r
const apply = (m, x, y) => {\r
  const w = m[6] * x + m[7] * y + m[8];\r
  return [(m[0] * x + m[1] * y + m[2]) / w, (m[3] * x + m[4] * y + m[5]) / w, w];\r
};\r
\r
const viewFor = (tiltX, tiltY, width, height, fill) => {\r
  const ax = (tiltX * Math.PI) / 180;\r
  const ay = (tiltY * Math.PI) / 180;\r
  const depth = Math.max(width, height) * 1.25;\r
  const tilt = [\r
    Math.cos(ay),\r
    0,\r
    0,\r
    Math.sin(ax) * Math.sin(ay),\r
    Math.cos(ax),\r
    0,\r
    (Math.sin(ay) * Math.cos(ax)) / depth,\r
    -Math.sin(ax) / depth,\r
    1\r
  ];\r
  if (fill) {\r
    const forward = multiply([1, 0, width / 2, 0, 1, height / 2, 0, 0, 1], tilt);\r
    return { forward, inverse: invert(forward), minScale: 1, maxScale: 1 };\r
  }\r
  const corners = [\r
    [-width / 2, -height / 2],\r
    [width / 2, -height / 2],\r
    [width / 2, height / 2],\r
    [-width / 2, height / 2]\r
  ].map(([x, y]) => apply(tilt, x, y));\r
  const xs = corners.map(point => point[0]);\r
  const ys = corners.map(point => point[1]);\r
  const spanX = Math.max(...xs) - Math.min(...xs);\r
  const spanY = Math.max(...ys) - Math.min(...ys);\r
  const fit = Math.min(1, width / Math.max(1, spanX), height / Math.max(1, spanY));\r
  const midX = (Math.max(...xs) + Math.min(...xs)) / 2;\r
  const midY = (Math.max(...ys) + Math.min(...ys)) / 2;\r
  const place = [fit, 0, width / 2 - midX * fit, 0, fit, height / 2 - midY * fit, 0, 0, 1];\r
  const forward = multiply(place, tilt);\r
  const scales = corners.map(point => fit / Math.abs(point[2]));\r
  return { forward, inverse: invert(forward), minScale: Math.min(...scales), maxScale: Math.max(...scales) };\r
};\r
\r
const visibleRange = (view, width, height, cellX, cellY) => {\r
  const inverse = view.inverse;\r
  const edge = Math.max(cellX, cellY) * 2;\r
  const corners = [\r
    [-edge, -edge],\r
    [width + edge, -edge],\r
    [width + edge, height + edge],\r
    [-edge, height + edge]\r
  ];\r
  const depthOf = ([x, y]) => inverse[6] * x + inverse[7] * y + inverse[8] - 1 / FAR;\r
  const hull = [];\r
  corners.forEach((from, index) => {\r
    const to = corners[(index + 1) % corners.length];\r
    const a = depthOf(from);\r
    const b = depthOf(to);\r
    if (a >= 0) hull.push(from);\r
    if (a >= 0 !== b >= 0) {\r
      const t = a / (a - b);\r
      hull.push([from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t]);\r
    }\r
  });\r
  if (hull.length < 3) return null;\r
  let minX = Infinity;\r
  let minY = Infinity;\r
  let maxX = -Infinity;\r
  let maxY = -Infinity;\r
  for (const [x, y] of hull) {\r
    const point = apply(inverse, x, y);\r
    minX = Math.min(minX, point[0]);\r
    minY = Math.min(minY, point[1]);\r
    maxX = Math.max(maxX, point[0]);\r
    maxY = Math.max(maxY, point[1]);\r
  }\r
  return {\r
    fromColumn: Math.floor((minX + width / 2) / cellX - 0.5) - 1,\r
    toColumn: Math.ceil((maxX + width / 2) / cellX - 0.5) + 1,\r
    fromRow: Math.floor((minY + height / 2) / cellY - 0.5) - 1,\r
    toRow: Math.ceil((maxY + height / 2) / cellY - 0.5) + 1\r
  };\r
};\r
\r
const MagnetLines = ({\r
  spacing = 30,\r
  rows,\r
  columns,\r
  containerSize,\r
  lineColor = '#efefef',\r
  accentColor,\r
  lineWidth = 2,\r
  lineHeight = 18,\r
  baseAngle = -10,\r
  mode = 'orbit',\r
  shape = 'line',\r
  rainbow = false,\r
  radius = 200,\r
  fade = 0.65,\r
  edgeFade = 0,\r
  stretch = 0.4,\r
  reach = 0,\r
  scatter = 0,\r
  inertia = 0.35,\r
  bounce = 0.3,\r
  ripple = 0.3,\r
  clickPulse = true,\r
  intro = true,\r
  idle = false,\r
  tiltX = 0,\r
  tiltY = 0,\r
  maxDevicePixelRatio = 2,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const probeRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const [generation, setGeneration] = useState(0);\r
\r
  const size = typeof containerSize === 'number' ? \`\${containerSize}px\` : containerSize;\r
  const square = Boolean(size);\r
  const color = parseColor(lineColor);\r
  const accent = accentColor ? parseColor(accentColor) : null;\r
  const settings = {\r
    square,\r
    spacing: Math.max(4, Number(spacing) || 30),\r
    rows: rows ? clamp(Math.round(rows), 1, 400) : 0,\r
    columns: columns ? clamp(Math.round(columns), 1, 400) : 0,\r
    lineWidth,\r
    lineHeight,\r
    baseAngle: (baseAngle * Math.PI) / 180,\r
    mode: MODES.includes(mode) ? mode : 'orbit',\r
    shape: SHAPES[shape] !== undefined ? shape : 'line',\r
    color,\r
    accent: accent ?? (shape === 'needle' ? parseColor('#f43f5e') : color),\r
    accentMix: accent ? 1 : 0,\r
    rainbow,\r
    tone: clamp(lightness(color), 0.42, 0.66),\r
    radius: Math.max(1, radius),\r
    fade: clamp(fade, 0, 1),\r
    edgeFade: clamp(edgeFade, 0, 1),\r
    stretch: clamp(stretch, 0, 2),\r
    reach: Math.max(0, reach),\r
    scatter: clamp(scatter, 0, 1),\r
    inertia: clamp(inertia, 0, 1),\r
    bounce: clamp(bounce, 0, 1),\r
    ripple: clamp(ripple, 0, 1),\r
    clickPulse,\r
    intro,\r
    idle,\r
    tiltX: clamp(tiltX, -70, 70),\r
    tiltY: clamp(tiltY, -70, 70),\r
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
    const probe = probeRef.current;\r
    if (!container || !canvas || !probe) return;\r
\r
    const gl = canvas.getContext('webgl2', {\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false,\r
      powerPreference: 'default'\r
    });\r
    const program = gl ? link(gl) : null;\r
    if (!gl || !program) return;\r
\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    const cornerBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    const centerBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, centerBuffer);\r
    gl.enableVertexAttribArray(1);\r
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);\r
    gl.vertexAttribDivisor(1, 1);\r
    const stateBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, stateBuffer);\r
    gl.enableVertexAttribArray(2);\r
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, 0);\r
    gl.vertexAttribDivisor(2, 1);\r
    gl.enable(gl.BLEND);\r
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
\r
    const field = {\r
      width: 1,\r
      height: 1,\r
      pad: 0,\r
      ratio: 1,\r
      view: null,\r
      length: 20,\r
      thickness: 2,\r
      fill: true,\r
      edgePad: 1,\r
      minScale: 1,\r
      maxScale: 1,\r
      introSpeed: INTRO_SPEED,\r
      bounds: [0, 0, 0, 0],\r
      key: ''\r
    };\r
    const pointer = { x: 0, y: 0, vx: 0, vy: 0, time: 0, seen: false, inside: false, away: 0 };\r
    const target = { x: 0, y: 0, heading: 0 };\r
    const pulses = [];\r
    let count = 0;\r
    let centers = new Float32Array(0);\r
    let cells = new Int32Array(0);\r
    let reveal = new Float32Array(0);\r
    let rests = new Float32Array(0);\r
    let seeds = new Float32Array(0);\r
    let angles = new Float32Array(0);\r
    let speeds = new Float32Array(0);\r
    let seenX = new Float32Array(0);\r
    let seenY = new Float32Array(0);\r
    let pending = new Uint8Array(0);\r
    let state = new Float32Array(0);\r
    let introStart = -1;\r
    let introLive = settingsRef.current.intro && !reduced && generation === 0;\r
    let raf = 0;\r
    let last = 0;\r
    let clock = 0;\r
    let visible = true;\r
    let pageVisible = document.visibilityState !== 'hidden';\r
    let lost = false;\r
    let dirty = true;\r
\r
    const measure = value => {\r
      if (typeof value === 'number') return value;\r
      probe.style.width = String(value);\r
      return probe.getBoundingClientRect().width;\r
    };\r
\r
    const layout = (width, height, view, columnCount, rowCount, tiled) => {\r
      const cellX = width / columnCount;\r
      const cellY = height / rowCount;\r
      const range = tiled\r
        ? visibleRange(view, width, height, cellX, cellY)\r
        : { fromColumn: 0, toColumn: columnCount - 1, fromRow: 0, toRow: rowCount - 1 };\r
      const origin = apply(view.forward, 0, 0);\r
      const found = [];\r
      if (range) {\r
        for (let row = range.fromRow; row <= range.toRow; row++) {\r
          const y = (row + 0.5) * cellY - height / 2;\r
          for (let column = range.fromColumn; column <= range.toColumn; column++) {\r
            const x = (column + 0.5) * cellX - width / 2;\r
            const [screenX, screenY, w] = apply(view.forward, x, y);\r
            if (tiled) {\r
              if (w <= 0 || w > FAR) continue;\r
              const margin = (0.49 * Math.min(cellX, cellY)) / w;\r
              if (screenX < -margin || screenX > width + margin || screenY < -margin || screenY > height + margin)\r
                continue;\r
            }\r
            found.push({ x, y, column, row, w, distance: Math.hypot(screenX - origin[0], screenY - origin[1]) });\r
          }\r
        }\r
      }\r
      if (found.length > MAX_LINES) {\r
        found.sort((a, b) => a.w - b.w);\r
        found.length = MAX_LINES;\r
      }\r
\r
      const previous = new Map();\r
      for (let index = 0; index < count; index++) previous.set(cells[index * 2] * 65536 + cells[index * 2 + 1], index);\r
      const total = found.length;\r
      const next = {\r
        centers: new Float32Array(total * 2),\r
        cells: new Int32Array(total * 2),\r
        reveal: new Float32Array(total),\r
        seeds: new Float32Array(total),\r
        rests: new Float32Array(total),\r
        angles: new Float32Array(total),\r
        speeds: new Float32Array(total),\r
        seenX: new Float32Array(total),\r
        seenY: new Float32Array(total),\r
        pending: new Uint8Array(total)\r
      };\r
      let farthest = 0;\r
      let nearest = Infinity;\r
      let deepest = 0;\r
      const bounds = [Infinity, Infinity, -Infinity, -Infinity];\r
      found.forEach((item, index) => {\r
        next.centers[index * 2] = item.x;\r
        next.centers[index * 2 + 1] = item.y;\r
        next.cells[index * 2] = item.column;\r
        next.cells[index * 2 + 1] = item.row;\r
        next.reveal[index] = item.distance;\r
        next.seeds[index] = seedFor(item.column, item.row);\r
        farthest = Math.max(farthest, item.distance);\r
        nearest = Math.min(nearest, item.w);\r
        deepest = Math.max(deepest, item.w);\r
        bounds[0] = Math.min(bounds[0], item.x);\r
        bounds[1] = Math.min(bounds[1], item.y);\r
        bounds[2] = Math.max(bounds[2], item.x);\r
        bounds[3] = Math.max(bounds[3], item.y);\r
        const old = previous.get(item.column * 65536 + item.row);\r
        if (old === undefined) {\r
          next.pending[index] = 1;\r
          return;\r
        }\r
        next.angles[index] = angles[old];\r
        next.speeds[index] = speeds[old];\r
        next.seenX[index] = seenX[old];\r
        next.seenY[index] = seenY[old];\r
      });\r
\r
      count = total;\r
      ({ centers, cells, reveal, seeds, rests, angles, speeds, seenX, seenY, pending } = next);\r
      state = new Float32Array(total * 4);\r
      field.introSpeed = Math.max(INTRO_SPEED, farthest / INTRO_TIME);\r
      field.bounds = total ? bounds : [0, 0, 0, 0];\r
      field.minScale = total ? 1 / deepest : 1;\r
      field.maxScale = total ? 1 / nearest : 1;\r
      gl.bindBuffer(gl.ARRAY_BUFFER, centerBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, centers, gl.STATIC_DRAW);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, stateBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, state.byteLength || 16, gl.DYNAMIC_DRAW);\r
    };\r
\r
    const rebuild = () => {\r
      const s = settingsRef.current;\r
      const rect = container.getBoundingClientRect();\r
      const width = Math.max(1, rect.width);\r
      const height = Math.max(1, rect.height);\r
      const length = Math.max(1, measure(s.lineHeight));\r
      const thickness = Math.max(0.25, measure(s.lineWidth));\r
      const fill = !s.square;\r
      const tiled = fill && (s.tiltX !== 0 || s.tiltY !== 0);\r
      const view = viewFor(s.tiltX, s.tiltY, width, height, fill);\r
      const ratio = Math.min(window.devicePixelRatio || 1, s.maxRatio);\r
\r
      let columnCount = Math.max(1, Math.round(s.columns || (s.rows ? (s.rows * width) / height : width / s.spacing)));\r
      let rowCount = Math.max(1, Math.round(s.rows || (s.columns ? (s.columns * height) / width : height / s.spacing)));\r
      if (columnCount * rowCount > MAX_LINES) {\r
        const shrink = Math.sqrt((columnCount * rowCount) / MAX_LINES);\r
        columnCount = Math.max(1, Math.floor(columnCount / shrink));\r
        rowCount = Math.max(1, Math.floor(rowCount / shrink));\r
      }\r
\r
      const key = [\r
        fill,\r
        columnCount,\r
        rowCount,\r
        width.toFixed(1),\r
        height.toFixed(1),\r
        tiled ? \`\${s.tiltX},\${s.tiltY}\` : ''\r
      ].join('|');\r
      if (key !== field.key) {\r
        field.key = key;\r
        layout(width, height, view, columnCount, rowCount, tiled);\r
      }\r
\r
      const minScale = fill ? field.minScale : view.minScale;\r
      const maxScale = fill ? field.maxScale : view.maxScale;\r
      const pad = fill ? 0 : Math.ceil((length * (1 + s.stretch) + thickness * 2) * Math.max(1, maxScale) + 8);\r
      const canvasWidth = width + pad * 2;\r
      const canvasHeight = height + pad * 2;\r
      canvas.style.left = \`\${-pad}px\`;\r
      canvas.style.top = \`\${-pad}px\`;\r
      canvas.style.width = \`\${canvasWidth}px\`;\r
      canvas.style.height = \`\${canvasHeight}px\`;\r
      const pixelWidth = Math.max(1, Math.round(canvasWidth * ratio));\r
      const pixelHeight = Math.max(1, Math.round(canvasHeight * ratio));\r
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {\r
        canvas.width = pixelWidth;\r
        canvas.height = pixelHeight;\r
      }\r
      Object.assign(field, {\r
        width,\r
        height,\r
        pad,\r
        ratio,\r
        view,\r
        length,\r
        thickness,\r
        fill,\r
        edgePad: 2 / (ratio * Math.max(0.05, minScale))\r
      });\r
    };\r
\r
    const fieldAngle = (s, index, px, py) => {\r
      const dx = px - centers[index * 2];\r
      const dy = py - centers[index * 2 + 1];\r
      if (s.mode === 'dipole') {\r
        const distance = Math.hypot(dx, dy) || 1;\r
        const rx = -dx / distance;\r
        const ry = -dy / distance;\r
        const mx = Math.cos(target.heading);\r
        const my = Math.sin(target.heading);\r
        const dot = mx * rx + my * ry;\r
        return Math.atan2(3 * dot * ry - my, 3 * dot * rx - mx);\r
      }\r
      const toward = Math.atan2(dy, dx);\r
      if (s.mode === 'attract') return toward;\r
      if (s.mode === 'spiral') return toward + Math.PI / 4;\r
      return toward + Math.PI / 2;\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (lost) return;\r
      const s = settingsRef.current;\r
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05);\r
      last = Math.max(last, now);\r
      clock += dt;\r
      if (dirty) rebuild();\r
      dirty = false;\r
\r
      const period = s.shape === 'line' ? Math.PI : TAU;\r
      const spread = s.scatter * Math.PI * 0.5;\r
      for (let index = 0; index < count; index++) rests[index] = s.baseAngle + Math.PI / 2 + seeds[index] * spread;\r
\r
      const wandering = s.idle && !reduced && (!pointer.seen || pointer.away > 1.2);\r
      if (pointer.seen && !pointer.inside) pointer.away += dt;\r
      let px = pointer.seen ? pointer.x : 0;\r
      let py = pointer.seen ? pointer.y : 0;\r
      if (wandering) {\r
        const amount = Math.min(field.width, field.height) * 0.32;\r
        px = Math.cos(clock * 0.37) * amount + Math.sin(clock * 0.21) * amount * 0.35;\r
        py = Math.sin(clock * 0.53 + 1.3) * amount * 0.8;\r
      }\r
      const follow = 1 - Math.exp(-dt / (pointer.seen && !wandering ? 0.035 : 0.6));\r
      target.x += (px - target.x) * follow;\r
      target.y += (py - target.y) * follow;\r
      const speed = Math.hypot(pointer.vx, pointer.vy);\r
      if (speed > 40) {\r
        const turn = wrap(Math.atan2(pointer.vy, pointer.vx) - target.heading, TAU);\r
        target.heading += turn * (1 - Math.exp(-dt / 0.25));\r
      }\r
      pointer.vx *= Math.exp(-dt / 0.12);\r
      pointer.vy *= Math.exp(-dt / 0.12);\r
\r
      if (introLive && introStart < 0) introStart = clock;\r
      const introTime = introLive ? clock - introStart : Infinity;\r
      let introBusy = false;\r
\r
      const stiffness = s.inertia <= 0 || reduced ? 0 : Math.pow(6 + 42 * Math.pow(1 - s.inertia, 2), 2);\r
      const damping = stiffness ? 2 * Math.sqrt(stiffness) * (1 - 0.75 * s.bounce) : 0;\r
      const steps = stiffness ? Math.max(1, Math.ceil(dt / (1 / 240))) : 0;\r
      const h = steps ? dt / steps : 0;\r
      const lag = reduced ? 0 : s.ripple / 900;\r
      const radius = s.radius;\r
      const reachIn = s.reach * 0.55;\r
      const reachOut = s.reach;\r
\r
      for (let i = pulses.length - 1; i >= 0; i--) {\r
        const age = clock - pulses[i].start;\r
        if (age > pulses[i].life) pulses.splice(i, 1);\r
      }\r
\r
      let moving = false;\r
      for (let index = 0; index < count; index++) {\r
        const cx = centers[index * 2];\r
        const cy = centers[index * 2 + 1];\r
        const born = pending[index] === 1;\r
        if (born) {\r
          seenX[index] = target.x;\r
          seenY[index] = target.y;\r
        } else {\r
          const distance = Math.hypot(target.x - cx, target.y - cy);\r
          const tau = lag * distance;\r
          const k = tau > 0 ? 1 - Math.exp(-dt / tau) : 1;\r
          seenX[index] += (target.x - seenX[index]) * k;\r
          seenY[index] += (target.y - seenY[index]) * k;\r
          if (Math.abs(target.x - seenX[index]) + Math.abs(target.y - seenY[index]) > 0.05) moving = true;\r
        }\r
        const sx = seenX[index];\r
        const sy = seenY[index];\r
        const near = Math.hypot(sx - cx, sy - cy);\r
        let goal = fieldAngle(s, index, sx, sy);\r
        const rest = rests[index];\r
        if (reachOut > 0) {\r
          const t = clamp((reachOut - near) / Math.max(1, reachOut - reachIn), 0, 1);\r
          goal = rest + wrap(goal - rest, period) * smootherstep(t);\r
        }\r
        let shown = 1;\r
        if (introLive) {\r
          const local = (introTime - reveal[index] / field.introSpeed) / INTRO_SPIN;\r
          const progress = smootherstep(clamp(local, 0, 1));\r
          if (local < 1) introBusy = true;\r
          goal = rest + wrap(goal - rest, period) * progress;\r
          shown = clamp(local * 2.5, 0, 1);\r
        }\r
        if (born) {\r
          angles[index] = introLive ? rest : goal;\r
          speeds[index] = 0;\r
          pending[index] = 0;\r
        } else if (!stiffness) {\r
          angles[index] = angles[index] + wrap(goal - angles[index], period);\r
          speeds[index] = 0;\r
        } else {\r
          let angle = angles[index];\r
          let velocity = speeds[index];\r
          for (let step = 0; step < steps; step++) {\r
            velocity += (stiffness * wrap(goal - angle, period) - damping * velocity) * h;\r
            angle += velocity * h;\r
          }\r
          if (Math.abs(velocity) < 0.002 && Math.abs(wrap(goal - angle, period)) < 0.0005) {\r
            angle += wrap(goal - angle, period);\r
            velocity = 0;\r
          } else moving = true;\r
          if (angle > 40 || angle < -40) angle = wrap(angle, TAU);\r
          angles[index] = angle;\r
          speeds[index] = velocity;\r
        }\r
\r
        let spin = 0;\r
        let flash = 0;\r
        for (const pulse of pulses) {\r
          const travelled = (clock - pulse.start) * PULSE_SPEED;\r
          const gap = Math.hypot(cx - pulse.x, cy - pulse.y);\r
          const local = (travelled - gap) / (PULSE_SPEED * PULSE_SPIN);\r
          if (local > 0 && local < 1) spin += smootherstep(local) * period;\r
          const band = (travelled - gap - PULSE_SPEED * PULSE_SPIN * 0.5) / 60;\r
          flash += Math.exp(-band * band) * Math.max(0, 1 - (clock - pulse.start) / pulse.life);\r
        }\r
\r
        const emphasis = Math.exp(-(near * near) / (radius * radius)) * shown;\r
        state[index * 4] = angles[index] + spin;\r
        state[index * 4 + 1] = emphasis;\r
        state[index * 4 + 2] = Math.min(1, flash * 0.9) * shown;\r
        state[index * 4 + 3] = shown;\r
      }\r
      if (introLive && !introBusy && clock - introStart > 0.2) introLive = false;\r
      if (Math.abs(px - target.x) + Math.abs(py - target.y) > 0.05) moving = true;\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      if (count && field.view) {\r
        const u = program.uniforms;\r
        gl.useProgram(program.program);\r
        gl.uniformMatrix3fv(u.uView, true, field.view.forward);\r
        gl.uniform2f(u.uCanvas, field.width + field.pad * 2, field.height + field.pad * 2);\r
        gl.uniform2f(u.uOffset, field.pad, field.pad);\r
        gl.uniform2f(u.uLine, field.length / 2, field.thickness / 2);\r
        gl.uniform1f(u.uStretch, s.stretch);\r
        gl.uniform1f(u.uHead, s.shape === 'needle' ? 0.16 : s.shape === 'arrow' ? 0.32 : 0);\r
        gl.uniform1f(u.uPad, field.edgePad);\r
        gl.uniform1f(u.uFar, field.fill ? FAR : 1e6);\r
        gl.uniform3fv(u.uColor, s.color);\r
        gl.uniform3fv(u.uAccent, s.accent);\r
        gl.uniform1f(u.uAccentMix, s.accentMix);\r
        gl.uniform1f(u.uOpacity, 1);\r
        gl.uniform1f(u.uFade, s.fade);\r
        gl.uniform1i(u.uShape, SHAPES[s.shape]);\r
        gl.uniform1f(u.uRainbow, s.rainbow ? 1 : 0);\r
        gl.uniform1f(u.uTone, s.tone);\r
        gl.uniform1f(u.uPeriod, period);\r
        gl.uniform2f(u.uPixels, canvas.width, canvas.height);\r
        gl.uniform2f(u.uEdge, s.edgeFade * 0.34 * field.width, s.edgeFade * 0.44 * field.height);\r
        gl.bindVertexArray(vao);\r
        gl.bindBuffer(gl.ARRAY_BUFFER, stateBuffer);\r
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, state);\r
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, count);\r
      }\r
\r
      const busy = moving || introLive || pulses.length > 0 || wandering;\r
      if (busy && visible && pageVisible) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (raf || lost || !visible || !pageVisible) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
    wakeRef.current = () => {\r
      dirty = true;\r
      wake();\r
    };\r
\r
    const toPlane = (clientX, clientY) => {\r
      if (!field.view) return null;\r
      const rect = container.getBoundingClientRect();\r
      const [x, y, w] = apply(field.view.inverse, clientX - rect.left, clientY - rect.top);\r
      if (w <= 0) return null;\r
      const inside = clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;\r
      return { x, y, inside };\r
    };\r
\r
    const onPointerMove = event => {\r
      const spot = toPlane(event.clientX, event.clientY);\r
      if (!spot) return;\r
      const now = performance.now();\r
      const dt = Math.max(1, now - pointer.time) / 1000;\r
      if (pointer.seen && dt < 0.2) {\r
        pointer.vx = pointer.vx * 0.6 + ((spot.x - pointer.x) / dt) * 0.4;\r
        pointer.vy = pointer.vy * 0.6 + ((spot.y - pointer.y) / dt) * 0.4;\r
      }\r
      pointer.time = now;\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.seen = true;\r
      pointer.inside = spot.inside;\r
      if (spot.inside) pointer.away = 0;\r
      wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      onPointerMove(event);\r
      const s = settingsRef.current;\r
      if (!s.clickPulse || reduced || !count) return;\r
      const spot = toPlane(event.clientX, event.clientY);\r
      if (!spot) return;\r
      const inside = field.fill\r
        ? spot.inside\r
        : Math.abs(spot.x) <= field.width / 2 && Math.abs(spot.y) <= field.height / 2;\r
      if (!inside) return;\r
      const [minX, minY, maxX, maxY] = field.bounds;\r
      const farthest = Math.max(\r
        Math.hypot(spot.x - minX, spot.y - minY),\r
        Math.hypot(spot.x - maxX, spot.y - minY),\r
        Math.hypot(spot.x - minX, spot.y - maxY),\r
        Math.hypot(spot.x - maxX, spot.y - maxY)\r
      );\r
      pulses.push({\r
        x: spot.x,\r
        y: spot.y,\r
        start: clock,\r
        life: Math.min(6, farthest / PULSE_SPEED + PULSE_SPIN + 0.1)\r
      });\r
      if (pulses.length > 6) pulses.shift();\r
      wake();\r
    };\r
\r
    const onLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
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
      dirty = true;\r
      wake();\r
    });\r
    resizeObserver.observe(container);\r
    const onResize = () => {\r
      dirty = true;\r
      wake();\r
    };\r
    window.addEventListener('resize', onResize);\r
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
    wake();\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('resize', onResize);\r
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      canvas.removeEventListener('webglcontextlost', onLost);\r
      canvas.removeEventListener('webglcontextrestored', onRestored);\r
      if (!gl.isContextLost()) {\r
        gl.deleteBuffer(cornerBuffer);\r
        gl.deleteBuffer(centerBuffer);\r
        gl.deleteBuffer(stateBuffer);\r
        gl.deleteVertexArray(vao);\r
        gl.deleteProgram(program.program);\r
      }\r
    };\r
  }, [generation]);\r
\r
  return (\r
    <div\r
      ref={containerRef}\r
      className={\`magnet-lines\${square ? ' magnet-lines--square' : ''}\${className ? \` \${className}\` : ''}\`}\r
      style={square ? { width: size, ...style } : style}\r
    >\r
      <canvas ref={canvasRef} className="magnet-lines__canvas" aria-hidden="true" />\r
      <span ref={probeRef} className="magnet-lines__probe" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default MagnetLines;\r
`,r=`.magnet-lines {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.magnet-lines--square {\r
  height: auto;\r
  max-width: 100%;\r
  aspect-ratio: 1 / 1;\r
  overflow: visible;\r
}\r
\r
.magnet-lines__canvas {\r
  position: absolute;\r
  display: block;\r
  pointer-events: none;\r
}\r
\r
.magnet-lines__probe {\r
  position: absolute;\r
  top: 0;\r
  left: 0;\r
  height: 0;\r
  visibility: hidden;\r
  pointer-events: none;\r
}\r
`,e=`'use client';\r
\r
import { useEffect, useRef, useState } from 'react';\r
\r
const VERTEX = \`#version 300 es\r
layout(location = 0) in vec2 aCorner;\r
layout(location = 1) in vec2 aCenter;\r
layout(location = 2) in vec4 aState;\r
uniform mat3 uView;\r
uniform vec2 uCanvas;\r
uniform vec2 uOffset;\r
uniform vec2 uLine;\r
uniform float uStretch;\r
uniform float uHead;\r
uniform float uPad;\r
uniform float uFar;\r
out vec2 vLocal;\r
out vec2 vHalf;\r
out float vEmphasis;\r
out float vFlash;\r
out float vAngle;\r
out float vShown;\r
void main() {\r
  float angle = aState.x;\r
  float emphasis = aState.y;\r
  float halfLength = uLine.x * (1.0 + uStretch * emphasis);\r
  float halfWidth = uLine.y;\r
  vec2 extent = vec2(halfLength + uPad, max(halfWidth, uHead * halfLength) + uPad);\r
  vec2 local = aCorner * extent;\r
  vec2 axis = vec2(cos(angle), sin(angle));\r
  vec2 point = aCenter + axis * local.x + vec2(-axis.y, axis.x) * local.y;\r
  vec3 screen = uView * vec3(point, 1.0);\r
  vec2 scale = vec2(2.0 / uCanvas.x, -2.0 / uCanvas.y);\r
  vec2 shift = vec2(-1.0 + 2.0 * uOffset.x / uCanvas.x, 1.0 - 2.0 * uOffset.y / uCanvas.y);\r
  gl_Position = vec4(screen.xy * scale + shift * screen.z, 0.0, screen.z);\r
  float depth = (uView * vec3(aCenter, 1.0)).z;\r
  vLocal = local;\r
  vHalf = vec2(halfLength, halfWidth);\r
  vEmphasis = emphasis;\r
  vFlash = aState.z;\r
  vAngle = angle;\r
  vShown = aState.w * (1.0 - smoothstep(uFar * 0.45, uFar, depth));\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
in vec2 vLocal;\r
in vec2 vHalf;\r
in float vEmphasis;\r
in float vFlash;\r
in float vAngle;\r
in float vShown;\r
out vec4 fragColor;\r
uniform vec3 uColor;\r
uniform vec3 uAccent;\r
uniform float uAccentMix;\r
uniform float uOpacity;\r
uniform float uFade;\r
uniform int uShape;\r
uniform float uHead;\r
uniform float uRainbow;\r
uniform float uTone;\r
uniform float uPeriod;\r
uniform vec2 uCanvas;\r
uniform vec2 uOffset;\r
uniform vec2 uPixels;\r
uniform vec2 uEdge;\r
\r
float ndot(vec2 a, vec2 b) {\r
  return a.x * b.x - a.y * b.y;\r
}\r
\r
float rhombus(vec2 p, vec2 b) {\r
  p = abs(p);\r
  float h = clamp(ndot(b - 2.0 * p, b) / dot(b, b), -1.0, 1.0);\r
  float d = length(p - 0.5 * b * vec2(1.0 - h, 1.0 + h));\r
  return d * sign(p.x * b.y + p.y * b.x - b.x * b.y);\r
}\r
\r
float triangle(vec2 p, vec2 q) {\r
  p.x = abs(p.x);\r
  vec2 a = p - q * clamp(dot(p, q) / dot(q, q), 0.0, 1.0);\r
  vec2 b = p - q * vec2(clamp(p.x / q.x, 0.0, 1.0), 1.0);\r
  float s = -sign(q.y);\r
  vec2 d = min(vec2(dot(a, a), s * (p.x * q.y - p.y * q.x)), vec2(dot(b, b), s * (p.y - q.y)));\r
  return -sqrt(d.x) * sign(d.y);\r
}\r
\r
float capsule(vec2 p, float from, float to, float radius) {\r
  float x = clamp(p.x, from, to);\r
  return length(vec2(p.x - x, p.y)) - radius;\r
}\r
\r
float feather(float distance, float zone) {\r
  if (zone <= 0.0) return 1.0;\r
  float t = clamp(distance / zone, 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
vec3 spectrum(float hue, float tone) {\r
  vec3 k = clamp(abs(fract(hue + vec3(0.0, 2.0, 1.0) / 3.0) * 6.0 - 3.0) - 1.0, 0.0, 1.0);\r
  k = k * k * (3.0 - 2.0 * k);\r
  float chroma = (1.0 - abs(2.0 * tone - 1.0)) * 0.92;\r
  return tone + chroma * (k - 0.5);\r
}\r
\r
void main() {\r
  vec2 p = vLocal;\r
  float aa = max(length(fwidth(p)) * 0.7071, 0.0001);\r
  float halfWidth = max(vHalf.y, aa * 0.5);\r
  float thin = vHalf.y / halfWidth;\r
  float halfLength = max(vHalf.x, halfWidth);\r
  float d;\r
  if (uShape == 1) {\r
    float head = min(halfLength * 0.9, max(halfWidth * 4.5, halfLength * 0.55));\r
    float wing = max(uHead * halfLength, halfWidth * 2.2);\r
    float shaft = capsule(p, -halfLength + halfWidth, halfLength - head * 0.6, halfWidth);\r
    float tip = triangle(vec2(p.y, halfLength - p.x), vec2(wing, head));\r
    d = min(shaft, tip);\r
  } else if (uShape == 2) {\r
    d = rhombus(p, vec2(halfLength, max(uHead * halfLength, halfWidth)));\r
  } else {\r
    d = capsule(p, -halfLength + halfWidth, halfLength - halfWidth, halfWidth);\r
  }\r
  float coverage = clamp(0.5 - d / aa, 0.0, 1.0) * thin;\r
  if (coverage <= 0.0) discard;\r
\r
  float emphasis = clamp(vEmphasis + vFlash, 0.0, 1.0);\r
  vec3 color = mix(uColor, uAccent, uAccentMix * emphasis);\r
  if (uShape == 2) {\r
    float north = smoothstep(-aa, aa, p.x);\r
    color = mix(uColor, uAccent, north);\r
  }\r
  if (uRainbow > 0.5) {\r
    float hue = fract(vAngle / uPeriod);\r
    vec3 tint = spectrum(hue, uTone);\r
    color = uShape == 2 ? mix(tint, uColor, 1.0 - smoothstep(-aa, aa, p.x)) : tint;\r
  }\r
  float alpha = uOpacity * mix(1.0 - uFade, 1.0, clamp(vEmphasis, 0.0, 1.0));\r
  alpha = clamp(alpha + vFlash * 0.6, 0.0, 1.0) * coverage * vShown;\r
  vec2 point = vec2(gl_FragCoord.x, uPixels.y - gl_FragCoord.y) * (uCanvas / uPixels) - uOffset;\r
  vec2 inside = min(point, uCanvas - 2.0 * uOffset - point);\r
  alpha *= feather(inside.x, uEdge.x) * feather(inside.y, uEdge.y);\r
  fragColor = vec4(color * alpha, alpha);\r
}\`;\r
\r
const MODES = ['orbit', 'attract', 'spiral', 'dipole'];\r
const SHAPES = { line: 0, arrow: 1, needle: 2 };\r
const TAU = Math.PI * 2;\r
const PULSE_SPEED = 520;\r
const PULSE_SPIN = 0.34;\r
const INTRO_SPEED = 700;\r
const INTRO_TIME = 1.1;\r
const INTRO_SPIN = 0.65;\r
const FAR = 4;\r
const MAX_LINES = 30000;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
const smootherstep = t => t * t * t * (t * (t * 6 - 15) + 10);\r
\r
const wrap = (value, period) => {\r
  const half = period / 2;\r
  return ((((value + half) % period) + period) % period) - half;\r
};\r
\r
const seedFor = (column, row) => {\r
  let hash = Math.imul(column + 40503, 2246822519) ^ Math.imul(row + 9973, 3266489917);\r
  hash = Math.imul(hash ^ (hash >>> 15), 668265263);\r
  hash = Math.imul(hash ^ (hash >>> 13), 374761393);\r
  return (((hash ^ (hash >>> 16)) >>> 0) / 4294967296) * 2 - 1;\r
};\r
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
  if (typeof document !== 'undefined') {\r
    const context = document.createElement('canvas').getContext('2d');\r
    if (context) {\r
      context.fillStyle = '#000000';\r
      context.fillStyle = text;\r
      const normal = String(context.fillStyle);\r
      if (normal !== '#000000' || /^(#0{3}|#0{6}|black)$/i.test(text)) return parseColor(normal);\r
    }\r
  }\r
  return [0.94, 0.94, 0.94];\r
};\r
\r
const lightness = rgb => (Math.max(...rgb) + Math.min(...rgb)) / 2;\r
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
const multiply = (a, b) => {\r
  const out = [];\r
  for (let r = 0; r < 3; r++) {\r
    for (let c = 0; c < 3; c++) {\r
      out.push(a[r * 3] * b[c] + a[r * 3 + 1] * b[c + 3] + a[r * 3 + 2] * b[c + 6]);\r
    }\r
  }\r
  return out;\r
};\r
\r
const invert = m => {\r
  const [a, b, c, d, e, f, g, h, i] = m;\r
  const A = e * i - f * h;\r
  const B = f * g - d * i;\r
  const C = d * h - e * g;\r
  const det = a * A + b * B + c * C;\r
  return [A, c * h - b * i, b * f - c * e, B, a * i - c * g, c * d - a * f, C, b * g - a * h, a * e - b * d].map(\r
    value => value / det\r
  );\r
};\r
\r
const apply = (m, x, y) => {\r
  const w = m[6] * x + m[7] * y + m[8];\r
  return [(m[0] * x + m[1] * y + m[2]) / w, (m[3] * x + m[4] * y + m[5]) / w, w];\r
};\r
\r
const viewFor = (tiltX, tiltY, width, height, fill) => {\r
  const ax = (tiltX * Math.PI) / 180;\r
  const ay = (tiltY * Math.PI) / 180;\r
  const depth = Math.max(width, height) * 1.25;\r
  const tilt = [\r
    Math.cos(ay),\r
    0,\r
    0,\r
    Math.sin(ax) * Math.sin(ay),\r
    Math.cos(ax),\r
    0,\r
    (Math.sin(ay) * Math.cos(ax)) / depth,\r
    -Math.sin(ax) / depth,\r
    1\r
  ];\r
  if (fill) {\r
    const forward = multiply([1, 0, width / 2, 0, 1, height / 2, 0, 0, 1], tilt);\r
    return { forward, inverse: invert(forward), minScale: 1, maxScale: 1 };\r
  }\r
  const corners = [\r
    [-width / 2, -height / 2],\r
    [width / 2, -height / 2],\r
    [width / 2, height / 2],\r
    [-width / 2, height / 2]\r
  ].map(([x, y]) => apply(tilt, x, y));\r
  const xs = corners.map(point => point[0]);\r
  const ys = corners.map(point => point[1]);\r
  const spanX = Math.max(...xs) - Math.min(...xs);\r
  const spanY = Math.max(...ys) - Math.min(...ys);\r
  const fit = Math.min(1, width / Math.max(1, spanX), height / Math.max(1, spanY));\r
  const midX = (Math.max(...xs) + Math.min(...xs)) / 2;\r
  const midY = (Math.max(...ys) + Math.min(...ys)) / 2;\r
  const place = [fit, 0, width / 2 - midX * fit, 0, fit, height / 2 - midY * fit, 0, 0, 1];\r
  const forward = multiply(place, tilt);\r
  const scales = corners.map(point => fit / Math.abs(point[2]));\r
  return { forward, inverse: invert(forward), minScale: Math.min(...scales), maxScale: Math.max(...scales) };\r
};\r
\r
const visibleRange = (view, width, height, cellX, cellY) => {\r
  const inverse = view.inverse;\r
  const edge = Math.max(cellX, cellY) * 2;\r
  const corners = [\r
    [-edge, -edge],\r
    [width + edge, -edge],\r
    [width + edge, height + edge],\r
    [-edge, height + edge]\r
  ];\r
  const depthOf = ([x, y]) => inverse[6] * x + inverse[7] * y + inverse[8] - 1 / FAR;\r
  const hull = [];\r
  corners.forEach((from, index) => {\r
    const to = corners[(index + 1) % corners.length];\r
    const a = depthOf(from);\r
    const b = depthOf(to);\r
    if (a >= 0) hull.push(from);\r
    if (a >= 0 !== b >= 0) {\r
      const t = a / (a - b);\r
      hull.push([from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t]);\r
    }\r
  });\r
  if (hull.length < 3) return null;\r
  let minX = Infinity;\r
  let minY = Infinity;\r
  let maxX = -Infinity;\r
  let maxY = -Infinity;\r
  for (const [x, y] of hull) {\r
    const point = apply(inverse, x, y);\r
    minX = Math.min(minX, point[0]);\r
    minY = Math.min(minY, point[1]);\r
    maxX = Math.max(maxX, point[0]);\r
    maxY = Math.max(maxY, point[1]);\r
  }\r
  return {\r
    fromColumn: Math.floor((minX + width / 2) / cellX - 0.5) - 1,\r
    toColumn: Math.ceil((maxX + width / 2) / cellX - 0.5) + 1,\r
    fromRow: Math.floor((minY + height / 2) / cellY - 0.5) - 1,\r
    toRow: Math.ceil((maxY + height / 2) / cellY - 0.5) + 1\r
  };\r
};\r
\r
const MagnetLines = ({\r
  spacing = 30,\r
  rows,\r
  columns,\r
  containerSize,\r
  lineColor = '#efefef',\r
  accentColor,\r
  lineWidth = 2,\r
  lineHeight = 18,\r
  baseAngle = -10,\r
  mode = 'orbit',\r
  shape = 'line',\r
  rainbow = false,\r
  radius = 200,\r
  fade = 0.65,\r
  edgeFade = 0,\r
  stretch = 0.4,\r
  reach = 0,\r
  scatter = 0,\r
  inertia = 0.35,\r
  bounce = 0.3,\r
  ripple = 0.3,\r
  clickPulse = true,\r
  intro = true,\r
  idle = false,\r
  tiltX = 0,\r
  tiltY = 0,\r
  maxDevicePixelRatio = 2,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const probeRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const [generation, setGeneration] = useState(0);\r
\r
  const size = typeof containerSize === 'number' ? \`\${containerSize}px\` : containerSize;\r
  const square = Boolean(size);\r
  const color = parseColor(lineColor);\r
  const accent = accentColor ? parseColor(accentColor) : null;\r
  const settings = {\r
    square,\r
    spacing: Math.max(4, Number(spacing) || 30),\r
    rows: rows ? clamp(Math.round(rows), 1, 400) : 0,\r
    columns: columns ? clamp(Math.round(columns), 1, 400) : 0,\r
    lineWidth,\r
    lineHeight,\r
    baseAngle: (baseAngle * Math.PI) / 180,\r
    mode: MODES.includes(mode) ? mode : 'orbit',\r
    shape: SHAPES[shape] !== undefined ? shape : 'line',\r
    color,\r
    accent: accent ?? (shape === 'needle' ? parseColor('#f43f5e') : color),\r
    accentMix: accent ? 1 : 0,\r
    rainbow,\r
    tone: clamp(lightness(color), 0.42, 0.66),\r
    radius: Math.max(1, radius),\r
    fade: clamp(fade, 0, 1),\r
    edgeFade: clamp(edgeFade, 0, 1),\r
    stretch: clamp(stretch, 0, 2),\r
    reach: Math.max(0, reach),\r
    scatter: clamp(scatter, 0, 1),\r
    inertia: clamp(inertia, 0, 1),\r
    bounce: clamp(bounce, 0, 1),\r
    ripple: clamp(ripple, 0, 1),\r
    clickPulse,\r
    intro,\r
    idle,\r
    tiltX: clamp(tiltX, -70, 70),\r
    tiltY: clamp(tiltY, -70, 70),\r
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
    const probe = probeRef.current;\r
    if (!container || !canvas || !probe) return;\r
\r
    const gl = canvas.getContext('webgl2', {\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false,\r
      powerPreference: 'default'\r
    });\r
    const program = gl ? link(gl) : null;\r
    if (!gl || !program) return;\r
\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    const cornerBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    const centerBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, centerBuffer);\r
    gl.enableVertexAttribArray(1);\r
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);\r
    gl.vertexAttribDivisor(1, 1);\r
    const stateBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, stateBuffer);\r
    gl.enableVertexAttribArray(2);\r
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, 0);\r
    gl.vertexAttribDivisor(2, 1);\r
    gl.enable(gl.BLEND);\r
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
\r
    const field = {\r
      width: 1,\r
      height: 1,\r
      pad: 0,\r
      ratio: 1,\r
      view: null,\r
      length: 20,\r
      thickness: 2,\r
      fill: true,\r
      edgePad: 1,\r
      minScale: 1,\r
      maxScale: 1,\r
      introSpeed: INTRO_SPEED,\r
      bounds: [0, 0, 0, 0],\r
      key: ''\r
    };\r
    const pointer = { x: 0, y: 0, vx: 0, vy: 0, time: 0, seen: false, inside: false, away: 0 };\r
    const target = { x: 0, y: 0, heading: 0 };\r
    const pulses = [];\r
    let count = 0;\r
    let centers = new Float32Array(0);\r
    let cells = new Int32Array(0);\r
    let reveal = new Float32Array(0);\r
    let rests = new Float32Array(0);\r
    let seeds = new Float32Array(0);\r
    let angles = new Float32Array(0);\r
    let speeds = new Float32Array(0);\r
    let seenX = new Float32Array(0);\r
    let seenY = new Float32Array(0);\r
    let pending = new Uint8Array(0);\r
    let state = new Float32Array(0);\r
    let introStart = -1;\r
    let introLive = settingsRef.current.intro && !reduced && generation === 0;\r
    let raf = 0;\r
    let last = 0;\r
    let clock = 0;\r
    let visible = true;\r
    let pageVisible = document.visibilityState !== 'hidden';\r
    let lost = false;\r
    let dirty = true;\r
\r
    const measure = value => {\r
      if (typeof value === 'number') return value;\r
      probe.style.width = String(value);\r
      return probe.getBoundingClientRect().width;\r
    };\r
\r
    const layout = (width, height, view, columnCount, rowCount, tiled) => {\r
      const cellX = width / columnCount;\r
      const cellY = height / rowCount;\r
      const range = tiled\r
        ? visibleRange(view, width, height, cellX, cellY)\r
        : { fromColumn: 0, toColumn: columnCount - 1, fromRow: 0, toRow: rowCount - 1 };\r
      const origin = apply(view.forward, 0, 0);\r
      const found = [];\r
      if (range) {\r
        for (let row = range.fromRow; row <= range.toRow; row++) {\r
          const y = (row + 0.5) * cellY - height / 2;\r
          for (let column = range.fromColumn; column <= range.toColumn; column++) {\r
            const x = (column + 0.5) * cellX - width / 2;\r
            const [screenX, screenY, w] = apply(view.forward, x, y);\r
            if (tiled) {\r
              if (w <= 0 || w > FAR) continue;\r
              const margin = (0.49 * Math.min(cellX, cellY)) / w;\r
              if (screenX < -margin || screenX > width + margin || screenY < -margin || screenY > height + margin)\r
                continue;\r
            }\r
            found.push({ x, y, column, row, w, distance: Math.hypot(screenX - origin[0], screenY - origin[1]) });\r
          }\r
        }\r
      }\r
      if (found.length > MAX_LINES) {\r
        found.sort((a, b) => a.w - b.w);\r
        found.length = MAX_LINES;\r
      }\r
\r
      const previous = new Map();\r
      for (let index = 0; index < count; index++) previous.set(cells[index * 2] * 65536 + cells[index * 2 + 1], index);\r
      const total = found.length;\r
      const next = {\r
        centers: new Float32Array(total * 2),\r
        cells: new Int32Array(total * 2),\r
        reveal: new Float32Array(total),\r
        seeds: new Float32Array(total),\r
        rests: new Float32Array(total),\r
        angles: new Float32Array(total),\r
        speeds: new Float32Array(total),\r
        seenX: new Float32Array(total),\r
        seenY: new Float32Array(total),\r
        pending: new Uint8Array(total)\r
      };\r
      let farthest = 0;\r
      let nearest = Infinity;\r
      let deepest = 0;\r
      const bounds = [Infinity, Infinity, -Infinity, -Infinity];\r
      found.forEach((item, index) => {\r
        next.centers[index * 2] = item.x;\r
        next.centers[index * 2 + 1] = item.y;\r
        next.cells[index * 2] = item.column;\r
        next.cells[index * 2 + 1] = item.row;\r
        next.reveal[index] = item.distance;\r
        next.seeds[index] = seedFor(item.column, item.row);\r
        farthest = Math.max(farthest, item.distance);\r
        nearest = Math.min(nearest, item.w);\r
        deepest = Math.max(deepest, item.w);\r
        bounds[0] = Math.min(bounds[0], item.x);\r
        bounds[1] = Math.min(bounds[1], item.y);\r
        bounds[2] = Math.max(bounds[2], item.x);\r
        bounds[3] = Math.max(bounds[3], item.y);\r
        const old = previous.get(item.column * 65536 + item.row);\r
        if (old === undefined) {\r
          next.pending[index] = 1;\r
          return;\r
        }\r
        next.angles[index] = angles[old];\r
        next.speeds[index] = speeds[old];\r
        next.seenX[index] = seenX[old];\r
        next.seenY[index] = seenY[old];\r
      });\r
\r
      count = total;\r
      ({ centers, cells, reveal, seeds, rests, angles, speeds, seenX, seenY, pending } = next);\r
      state = new Float32Array(total * 4);\r
      field.introSpeed = Math.max(INTRO_SPEED, farthest / INTRO_TIME);\r
      field.bounds = total ? bounds : [0, 0, 0, 0];\r
      field.minScale = total ? 1 / deepest : 1;\r
      field.maxScale = total ? 1 / nearest : 1;\r
      gl.bindBuffer(gl.ARRAY_BUFFER, centerBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, centers, gl.STATIC_DRAW);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, stateBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, state.byteLength || 16, gl.DYNAMIC_DRAW);\r
    };\r
\r
    const rebuild = () => {\r
      const s = settingsRef.current;\r
      const rect = container.getBoundingClientRect();\r
      const width = Math.max(1, rect.width);\r
      const height = Math.max(1, rect.height);\r
      const length = Math.max(1, measure(s.lineHeight));\r
      const thickness = Math.max(0.25, measure(s.lineWidth));\r
      const fill = !s.square;\r
      const tiled = fill && (s.tiltX !== 0 || s.tiltY !== 0);\r
      const view = viewFor(s.tiltX, s.tiltY, width, height, fill);\r
      const ratio = Math.min(window.devicePixelRatio || 1, s.maxRatio);\r
\r
      let columnCount = Math.max(1, Math.round(s.columns || (s.rows ? (s.rows * width) / height : width / s.spacing)));\r
      let rowCount = Math.max(1, Math.round(s.rows || (s.columns ? (s.columns * height) / width : height / s.spacing)));\r
      if (columnCount * rowCount > MAX_LINES) {\r
        const shrink = Math.sqrt((columnCount * rowCount) / MAX_LINES);\r
        columnCount = Math.max(1, Math.floor(columnCount / shrink));\r
        rowCount = Math.max(1, Math.floor(rowCount / shrink));\r
      }\r
\r
      const key = [\r
        fill,\r
        columnCount,\r
        rowCount,\r
        width.toFixed(1),\r
        height.toFixed(1),\r
        tiled ? \`\${s.tiltX},\${s.tiltY}\` : ''\r
      ].join('|');\r
      if (key !== field.key) {\r
        field.key = key;\r
        layout(width, height, view, columnCount, rowCount, tiled);\r
      }\r
\r
      const minScale = fill ? field.minScale : view.minScale;\r
      const maxScale = fill ? field.maxScale : view.maxScale;\r
      const pad = fill ? 0 : Math.ceil((length * (1 + s.stretch) + thickness * 2) * Math.max(1, maxScale) + 8);\r
      const canvasWidth = width + pad * 2;\r
      const canvasHeight = height + pad * 2;\r
      canvas.style.left = \`\${-pad}px\`;\r
      canvas.style.top = \`\${-pad}px\`;\r
      canvas.style.width = \`\${canvasWidth}px\`;\r
      canvas.style.height = \`\${canvasHeight}px\`;\r
      const pixelWidth = Math.max(1, Math.round(canvasWidth * ratio));\r
      const pixelHeight = Math.max(1, Math.round(canvasHeight * ratio));\r
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {\r
        canvas.width = pixelWidth;\r
        canvas.height = pixelHeight;\r
      }\r
      Object.assign(field, {\r
        width,\r
        height,\r
        pad,\r
        ratio,\r
        view,\r
        length,\r
        thickness,\r
        fill,\r
        edgePad: 2 / (ratio * Math.max(0.05, minScale))\r
      });\r
    };\r
\r
    const fieldAngle = (s, index, px, py) => {\r
      const dx = px - centers[index * 2];\r
      const dy = py - centers[index * 2 + 1];\r
      if (s.mode === 'dipole') {\r
        const distance = Math.hypot(dx, dy) || 1;\r
        const rx = -dx / distance;\r
        const ry = -dy / distance;\r
        const mx = Math.cos(target.heading);\r
        const my = Math.sin(target.heading);\r
        const dot = mx * rx + my * ry;\r
        return Math.atan2(3 * dot * ry - my, 3 * dot * rx - mx);\r
      }\r
      const toward = Math.atan2(dy, dx);\r
      if (s.mode === 'attract') return toward;\r
      if (s.mode === 'spiral') return toward + Math.PI / 4;\r
      return toward + Math.PI / 2;\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (lost) return;\r
      const s = settingsRef.current;\r
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05);\r
      last = Math.max(last, now);\r
      clock += dt;\r
      if (dirty) rebuild();\r
      dirty = false;\r
\r
      const period = s.shape === 'line' ? Math.PI : TAU;\r
      const spread = s.scatter * Math.PI * 0.5;\r
      for (let index = 0; index < count; index++) rests[index] = s.baseAngle + Math.PI / 2 + seeds[index] * spread;\r
\r
      const wandering = s.idle && !reduced && (!pointer.seen || pointer.away > 1.2);\r
      if (pointer.seen && !pointer.inside) pointer.away += dt;\r
      let px = pointer.seen ? pointer.x : 0;\r
      let py = pointer.seen ? pointer.y : 0;\r
      if (wandering) {\r
        const amount = Math.min(field.width, field.height) * 0.32;\r
        px = Math.cos(clock * 0.37) * amount + Math.sin(clock * 0.21) * amount * 0.35;\r
        py = Math.sin(clock * 0.53 + 1.3) * amount * 0.8;\r
      }\r
      const follow = 1 - Math.exp(-dt / (pointer.seen && !wandering ? 0.035 : 0.6));\r
      target.x += (px - target.x) * follow;\r
      target.y += (py - target.y) * follow;\r
      const speed = Math.hypot(pointer.vx, pointer.vy);\r
      if (speed > 40) {\r
        const turn = wrap(Math.atan2(pointer.vy, pointer.vx) - target.heading, TAU);\r
        target.heading += turn * (1 - Math.exp(-dt / 0.25));\r
      }\r
      pointer.vx *= Math.exp(-dt / 0.12);\r
      pointer.vy *= Math.exp(-dt / 0.12);\r
\r
      if (introLive && introStart < 0) introStart = clock;\r
      const introTime = introLive ? clock - introStart : Infinity;\r
      let introBusy = false;\r
\r
      const stiffness = s.inertia <= 0 || reduced ? 0 : Math.pow(6 + 42 * Math.pow(1 - s.inertia, 2), 2);\r
      const damping = stiffness ? 2 * Math.sqrt(stiffness) * (1 - 0.75 * s.bounce) : 0;\r
      const steps = stiffness ? Math.max(1, Math.ceil(dt / (1 / 240))) : 0;\r
      const h = steps ? dt / steps : 0;\r
      const lag = reduced ? 0 : s.ripple / 900;\r
      const radius = s.radius;\r
      const reachIn = s.reach * 0.55;\r
      const reachOut = s.reach;\r
\r
      for (let i = pulses.length - 1; i >= 0; i--) {\r
        const age = clock - pulses[i].start;\r
        if (age > pulses[i].life) pulses.splice(i, 1);\r
      }\r
\r
      let moving = false;\r
      for (let index = 0; index < count; index++) {\r
        const cx = centers[index * 2];\r
        const cy = centers[index * 2 + 1];\r
        const born = pending[index] === 1;\r
        if (born) {\r
          seenX[index] = target.x;\r
          seenY[index] = target.y;\r
        } else {\r
          const distance = Math.hypot(target.x - cx, target.y - cy);\r
          const tau = lag * distance;\r
          const k = tau > 0 ? 1 - Math.exp(-dt / tau) : 1;\r
          seenX[index] += (target.x - seenX[index]) * k;\r
          seenY[index] += (target.y - seenY[index]) * k;\r
          if (Math.abs(target.x - seenX[index]) + Math.abs(target.y - seenY[index]) > 0.05) moving = true;\r
        }\r
        const sx = seenX[index];\r
        const sy = seenY[index];\r
        const near = Math.hypot(sx - cx, sy - cy);\r
        let goal = fieldAngle(s, index, sx, sy);\r
        const rest = rests[index];\r
        if (reachOut > 0) {\r
          const t = clamp((reachOut - near) / Math.max(1, reachOut - reachIn), 0, 1);\r
          goal = rest + wrap(goal - rest, period) * smootherstep(t);\r
        }\r
        let shown = 1;\r
        if (introLive) {\r
          const local = (introTime - reveal[index] / field.introSpeed) / INTRO_SPIN;\r
          const progress = smootherstep(clamp(local, 0, 1));\r
          if (local < 1) introBusy = true;\r
          goal = rest + wrap(goal - rest, period) * progress;\r
          shown = clamp(local * 2.5, 0, 1);\r
        }\r
        if (born) {\r
          angles[index] = introLive ? rest : goal;\r
          speeds[index] = 0;\r
          pending[index] = 0;\r
        } else if (!stiffness) {\r
          angles[index] = angles[index] + wrap(goal - angles[index], period);\r
          speeds[index] = 0;\r
        } else {\r
          let angle = angles[index];\r
          let velocity = speeds[index];\r
          for (let step = 0; step < steps; step++) {\r
            velocity += (stiffness * wrap(goal - angle, period) - damping * velocity) * h;\r
            angle += velocity * h;\r
          }\r
          if (Math.abs(velocity) < 0.002 && Math.abs(wrap(goal - angle, period)) < 0.0005) {\r
            angle += wrap(goal - angle, period);\r
            velocity = 0;\r
          } else moving = true;\r
          if (angle > 40 || angle < -40) angle = wrap(angle, TAU);\r
          angles[index] = angle;\r
          speeds[index] = velocity;\r
        }\r
\r
        let spin = 0;\r
        let flash = 0;\r
        for (const pulse of pulses) {\r
          const travelled = (clock - pulse.start) * PULSE_SPEED;\r
          const gap = Math.hypot(cx - pulse.x, cy - pulse.y);\r
          const local = (travelled - gap) / (PULSE_SPEED * PULSE_SPIN);\r
          if (local > 0 && local < 1) spin += smootherstep(local) * period;\r
          const band = (travelled - gap - PULSE_SPEED * PULSE_SPIN * 0.5) / 60;\r
          flash += Math.exp(-band * band) * Math.max(0, 1 - (clock - pulse.start) / pulse.life);\r
        }\r
\r
        const emphasis = Math.exp(-(near * near) / (radius * radius)) * shown;\r
        state[index * 4] = angles[index] + spin;\r
        state[index * 4 + 1] = emphasis;\r
        state[index * 4 + 2] = Math.min(1, flash * 0.9) * shown;\r
        state[index * 4 + 3] = shown;\r
      }\r
      if (introLive && !introBusy && clock - introStart > 0.2) introLive = false;\r
      if (Math.abs(px - target.x) + Math.abs(py - target.y) > 0.05) moving = true;\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      if (count && field.view) {\r
        const u = program.uniforms;\r
        gl.useProgram(program.program);\r
        gl.uniformMatrix3fv(u.uView, true, field.view.forward);\r
        gl.uniform2f(u.uCanvas, field.width + field.pad * 2, field.height + field.pad * 2);\r
        gl.uniform2f(u.uOffset, field.pad, field.pad);\r
        gl.uniform2f(u.uLine, field.length / 2, field.thickness / 2);\r
        gl.uniform1f(u.uStretch, s.stretch);\r
        gl.uniform1f(u.uHead, s.shape === 'needle' ? 0.16 : s.shape === 'arrow' ? 0.32 : 0);\r
        gl.uniform1f(u.uPad, field.edgePad);\r
        gl.uniform1f(u.uFar, field.fill ? FAR : 1e6);\r
        gl.uniform3fv(u.uColor, s.color);\r
        gl.uniform3fv(u.uAccent, s.accent);\r
        gl.uniform1f(u.uAccentMix, s.accentMix);\r
        gl.uniform1f(u.uOpacity, 1);\r
        gl.uniform1f(u.uFade, s.fade);\r
        gl.uniform1i(u.uShape, SHAPES[s.shape]);\r
        gl.uniform1f(u.uRainbow, s.rainbow ? 1 : 0);\r
        gl.uniform1f(u.uTone, s.tone);\r
        gl.uniform1f(u.uPeriod, period);\r
        gl.uniform2f(u.uPixels, canvas.width, canvas.height);\r
        gl.uniform2f(u.uEdge, s.edgeFade * 0.34 * field.width, s.edgeFade * 0.44 * field.height);\r
        gl.bindVertexArray(vao);\r
        gl.bindBuffer(gl.ARRAY_BUFFER, stateBuffer);\r
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, state);\r
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, count);\r
      }\r
\r
      const busy = moving || introLive || pulses.length > 0 || wandering;\r
      if (busy && visible && pageVisible) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (raf || lost || !visible || !pageVisible) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
    wakeRef.current = () => {\r
      dirty = true;\r
      wake();\r
    };\r
\r
    const toPlane = (clientX, clientY) => {\r
      if (!field.view) return null;\r
      const rect = container.getBoundingClientRect();\r
      const [x, y, w] = apply(field.view.inverse, clientX - rect.left, clientY - rect.top);\r
      if (w <= 0) return null;\r
      const inside = clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;\r
      return { x, y, inside };\r
    };\r
\r
    const onPointerMove = event => {\r
      const spot = toPlane(event.clientX, event.clientY);\r
      if (!spot) return;\r
      const now = performance.now();\r
      const dt = Math.max(1, now - pointer.time) / 1000;\r
      if (pointer.seen && dt < 0.2) {\r
        pointer.vx = pointer.vx * 0.6 + ((spot.x - pointer.x) / dt) * 0.4;\r
        pointer.vy = pointer.vy * 0.6 + ((spot.y - pointer.y) / dt) * 0.4;\r
      }\r
      pointer.time = now;\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.seen = true;\r
      pointer.inside = spot.inside;\r
      if (spot.inside) pointer.away = 0;\r
      wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      onPointerMove(event);\r
      const s = settingsRef.current;\r
      if (!s.clickPulse || reduced || !count) return;\r
      const spot = toPlane(event.clientX, event.clientY);\r
      if (!spot) return;\r
      const inside = field.fill\r
        ? spot.inside\r
        : Math.abs(spot.x) <= field.width / 2 && Math.abs(spot.y) <= field.height / 2;\r
      if (!inside) return;\r
      const [minX, minY, maxX, maxY] = field.bounds;\r
      const farthest = Math.max(\r
        Math.hypot(spot.x - minX, spot.y - minY),\r
        Math.hypot(spot.x - maxX, spot.y - minY),\r
        Math.hypot(spot.x - minX, spot.y - maxY),\r
        Math.hypot(spot.x - maxX, spot.y - maxY)\r
      );\r
      pulses.push({\r
        x: spot.x,\r
        y: spot.y,\r
        start: clock,\r
        life: Math.min(6, farthest / PULSE_SPEED + PULSE_SPIN + 0.1)\r
      });\r
      if (pulses.length > 6) pulses.shift();\r
      wake();\r
    };\r
\r
    const onLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
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
      dirty = true;\r
      wake();\r
    });\r
    resizeObserver.observe(container);\r
    const onResize = () => {\r
      dirty = true;\r
      wake();\r
    };\r
    window.addEventListener('resize', onResize);\r
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
    wake();\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('resize', onResize);\r
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      canvas.removeEventListener('webglcontextlost', onLost);\r
      canvas.removeEventListener('webglcontextrestored', onRestored);\r
      if (!gl.isContextLost()) {\r
        gl.deleteBuffer(cornerBuffer);\r
        gl.deleteBuffer(centerBuffer);\r
        gl.deleteBuffer(stateBuffer);\r
        gl.deleteVertexArray(vao);\r
        gl.deleteProgram(program.program);\r
      }\r
    };\r
  }, [generation]);\r
\r
  return (\r
    <div\r
      ref={containerRef}\r
      className={\`relative \${square ? 'aspect-square max-w-full' : 'h-full w-full overflow-hidden'}\${className ? \` \${className}\` : ''}\`}\r
      style={square ? { width: size, ...style } : style}\r
    >\r
      <canvas ref={canvasRef} className="pointer-events-none absolute block" aria-hidden="true" />\r
      <span ref={probeRef} className="pointer-events-none invisible absolute left-0 top-0 h-0" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default MagnetLines;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, useState, type CSSProperties } from 'react';\r
import './MagnetLines.css';\r
\r
type Mode = 'orbit' | 'attract' | 'spiral' | 'dipole';\r
type Shape = 'line' | 'arrow' | 'needle';\r
type Matrix = number[];\r
\r
export interface MagnetLinesProps {\r
  spacing?: number;\r
  rows?: number;\r
  columns?: number;\r
  containerSize?: number | string;\r
  lineColor?: string;\r
  accentColor?: string;\r
  lineWidth?: number | string;\r
  lineHeight?: number | string;\r
  baseAngle?: number;\r
  mode?: Mode;\r
  shape?: Shape;\r
  rainbow?: boolean;\r
  radius?: number;\r
  fade?: number;\r
  edgeFade?: number;\r
  stretch?: number;\r
  reach?: number;\r
  scatter?: number;\r
  inertia?: number;\r
  bounce?: number;\r
  ripple?: number;\r
  clickPulse?: boolean;\r
  intro?: boolean;\r
  idle?: boolean;\r
  tiltX?: number;\r
  tiltY?: number;\r
  maxDevicePixelRatio?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Settings {\r
  square: boolean;\r
  spacing: number;\r
  rows: number;\r
  columns: number;\r
  lineWidth: number | string;\r
  lineHeight: number | string;\r
  baseAngle: number;\r
  mode: Mode;\r
  shape: Shape;\r
  color: number[];\r
  accent: number[];\r
  accentMix: number;\r
  rainbow: boolean;\r
  tone: number;\r
  radius: number;\r
  fade: number;\r
  edgeFade: number;\r
  stretch: number;\r
  reach: number;\r
  scatter: number;\r
  inertia: number;\r
  bounce: number;\r
  ripple: number;\r
  clickPulse: boolean;\r
  intro: boolean;\r
  idle: boolean;\r
  tiltX: number;\r
  tiltY: number;\r
  maxRatio: number;\r
}\r
\r
interface View {\r
  forward: Matrix;\r
  inverse: Matrix;\r
  minScale: number;\r
  maxScale: number;\r
}\r
\r
interface Range {\r
  fromColumn: number;\r
  toColumn: number;\r
  fromRow: number;\r
  toRow: number;\r
}\r
\r
interface Program {\r
  program: WebGLProgram;\r
  uniforms: Record<string, WebGLUniformLocation | null>;\r
}\r
\r
interface Field {\r
  width: number;\r
  height: number;\r
  pad: number;\r
  ratio: number;\r
  view: View | null;\r
  length: number;\r
  thickness: number;\r
  fill: boolean;\r
  edgePad: number;\r
  minScale: number;\r
  maxScale: number;\r
  introSpeed: number;\r
  bounds: number[];\r
  key: string;\r
}\r
\r
interface Pulse {\r
  x: number;\r
  y: number;\r
  start: number;\r
  life: number;\r
}\r
\r
interface Candidate {\r
  x: number;\r
  y: number;\r
  column: number;\r
  row: number;\r
  w: number;\r
  distance: number;\r
}\r
\r
const VERTEX = \`#version 300 es\r
layout(location = 0) in vec2 aCorner;\r
layout(location = 1) in vec2 aCenter;\r
layout(location = 2) in vec4 aState;\r
uniform mat3 uView;\r
uniform vec2 uCanvas;\r
uniform vec2 uOffset;\r
uniform vec2 uLine;\r
uniform float uStretch;\r
uniform float uHead;\r
uniform float uPad;\r
uniform float uFar;\r
out vec2 vLocal;\r
out vec2 vHalf;\r
out float vEmphasis;\r
out float vFlash;\r
out float vAngle;\r
out float vShown;\r
void main() {\r
  float angle = aState.x;\r
  float emphasis = aState.y;\r
  float halfLength = uLine.x * (1.0 + uStretch * emphasis);\r
  float halfWidth = uLine.y;\r
  vec2 extent = vec2(halfLength + uPad, max(halfWidth, uHead * halfLength) + uPad);\r
  vec2 local = aCorner * extent;\r
  vec2 axis = vec2(cos(angle), sin(angle));\r
  vec2 point = aCenter + axis * local.x + vec2(-axis.y, axis.x) * local.y;\r
  vec3 screen = uView * vec3(point, 1.0);\r
  vec2 scale = vec2(2.0 / uCanvas.x, -2.0 / uCanvas.y);\r
  vec2 shift = vec2(-1.0 + 2.0 * uOffset.x / uCanvas.x, 1.0 - 2.0 * uOffset.y / uCanvas.y);\r
  gl_Position = vec4(screen.xy * scale + shift * screen.z, 0.0, screen.z);\r
  float depth = (uView * vec3(aCenter, 1.0)).z;\r
  vLocal = local;\r
  vHalf = vec2(halfLength, halfWidth);\r
  vEmphasis = emphasis;\r
  vFlash = aState.z;\r
  vAngle = angle;\r
  vShown = aState.w * (1.0 - smoothstep(uFar * 0.45, uFar, depth));\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
in vec2 vLocal;\r
in vec2 vHalf;\r
in float vEmphasis;\r
in float vFlash;\r
in float vAngle;\r
in float vShown;\r
out vec4 fragColor;\r
uniform vec3 uColor;\r
uniform vec3 uAccent;\r
uniform float uAccentMix;\r
uniform float uOpacity;\r
uniform float uFade;\r
uniform int uShape;\r
uniform float uHead;\r
uniform float uRainbow;\r
uniform float uTone;\r
uniform float uPeriod;\r
uniform vec2 uCanvas;\r
uniform vec2 uOffset;\r
uniform vec2 uPixels;\r
uniform vec2 uEdge;\r
\r
float ndot(vec2 a, vec2 b) {\r
  return a.x * b.x - a.y * b.y;\r
}\r
\r
float rhombus(vec2 p, vec2 b) {\r
  p = abs(p);\r
  float h = clamp(ndot(b - 2.0 * p, b) / dot(b, b), -1.0, 1.0);\r
  float d = length(p - 0.5 * b * vec2(1.0 - h, 1.0 + h));\r
  return d * sign(p.x * b.y + p.y * b.x - b.x * b.y);\r
}\r
\r
float triangle(vec2 p, vec2 q) {\r
  p.x = abs(p.x);\r
  vec2 a = p - q * clamp(dot(p, q) / dot(q, q), 0.0, 1.0);\r
  vec2 b = p - q * vec2(clamp(p.x / q.x, 0.0, 1.0), 1.0);\r
  float s = -sign(q.y);\r
  vec2 d = min(vec2(dot(a, a), s * (p.x * q.y - p.y * q.x)), vec2(dot(b, b), s * (p.y - q.y)));\r
  return -sqrt(d.x) * sign(d.y);\r
}\r
\r
float capsule(vec2 p, float from, float to, float radius) {\r
  float x = clamp(p.x, from, to);\r
  return length(vec2(p.x - x, p.y)) - radius;\r
}\r
\r
float feather(float distance, float zone) {\r
  if (zone <= 0.0) return 1.0;\r
  float t = clamp(distance / zone, 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
vec3 spectrum(float hue, float tone) {\r
  vec3 k = clamp(abs(fract(hue + vec3(0.0, 2.0, 1.0) / 3.0) * 6.0 - 3.0) - 1.0, 0.0, 1.0);\r
  k = k * k * (3.0 - 2.0 * k);\r
  float chroma = (1.0 - abs(2.0 * tone - 1.0)) * 0.92;\r
  return tone + chroma * (k - 0.5);\r
}\r
\r
void main() {\r
  vec2 p = vLocal;\r
  float aa = max(length(fwidth(p)) * 0.7071, 0.0001);\r
  float halfWidth = max(vHalf.y, aa * 0.5);\r
  float thin = vHalf.y / halfWidth;\r
  float halfLength = max(vHalf.x, halfWidth);\r
  float d;\r
  if (uShape == 1) {\r
    float head = min(halfLength * 0.9, max(halfWidth * 4.5, halfLength * 0.55));\r
    float wing = max(uHead * halfLength, halfWidth * 2.2);\r
    float shaft = capsule(p, -halfLength + halfWidth, halfLength - head * 0.6, halfWidth);\r
    float tip = triangle(vec2(p.y, halfLength - p.x), vec2(wing, head));\r
    d = min(shaft, tip);\r
  } else if (uShape == 2) {\r
    d = rhombus(p, vec2(halfLength, max(uHead * halfLength, halfWidth)));\r
  } else {\r
    d = capsule(p, -halfLength + halfWidth, halfLength - halfWidth, halfWidth);\r
  }\r
  float coverage = clamp(0.5 - d / aa, 0.0, 1.0) * thin;\r
  if (coverage <= 0.0) discard;\r
\r
  float emphasis = clamp(vEmphasis + vFlash, 0.0, 1.0);\r
  vec3 color = mix(uColor, uAccent, uAccentMix * emphasis);\r
  if (uShape == 2) {\r
    float north = smoothstep(-aa, aa, p.x);\r
    color = mix(uColor, uAccent, north);\r
  }\r
  if (uRainbow > 0.5) {\r
    float hue = fract(vAngle / uPeriod);\r
    vec3 tint = spectrum(hue, uTone);\r
    color = uShape == 2 ? mix(tint, uColor, 1.0 - smoothstep(-aa, aa, p.x)) : tint;\r
  }\r
  float alpha = uOpacity * mix(1.0 - uFade, 1.0, clamp(vEmphasis, 0.0, 1.0));\r
  alpha = clamp(alpha + vFlash * 0.6, 0.0, 1.0) * coverage * vShown;\r
  vec2 point = vec2(gl_FragCoord.x, uPixels.y - gl_FragCoord.y) * (uCanvas / uPixels) - uOffset;\r
  vec2 inside = min(point, uCanvas - 2.0 * uOffset - point);\r
  alpha *= feather(inside.x, uEdge.x) * feather(inside.y, uEdge.y);\r
  fragColor = vec4(color * alpha, alpha);\r
}\`;\r
\r
const MODES = ['orbit', 'attract', 'spiral', 'dipole'];\r
const SHAPES: Record<Shape, number> = { line: 0, arrow: 1, needle: 2 };\r
const TAU = Math.PI * 2;\r
const PULSE_SPEED = 520;\r
const PULSE_SPIN = 0.34;\r
const INTRO_SPEED = 700;\r
const INTRO_TIME = 1.1;\r
const INTRO_SPIN = 0.65;\r
const FAR = 4;\r
const MAX_LINES = 30000;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
const smootherstep = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);\r
\r
const wrap = (value: number, period: number) => {\r
  const half = period / 2;\r
  return ((((value + half) % period) + period) % period) - half;\r
};\r
\r
const seedFor = (column: number, row: number) => {\r
  let hash = Math.imul(column + 40503, 2246822519) ^ Math.imul(row + 9973, 3266489917);\r
  hash = Math.imul(hash ^ (hash >>> 15), 668265263);\r
  hash = Math.imul(hash ^ (hash >>> 13), 374761393);\r
  return (((hash ^ (hash >>> 16)) >>> 0) / 4294967296) * 2 - 1;\r
};\r
\r
const parseColor = (value: string): number[] => {\r
  const text = String(value || '').trim();\r
  const hex = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text);\r
  if (hex) {\r
    const full = hex[1].length === 3 ? hex[1].replace(/./g, digit => digit + digit) : hex[1];\r
    return [0, 2, 4].map(index => parseInt(full.slice(index, index + 2), 16) / 255);\r
  }\r
  const rgb = /^rgba?\\(\\s*([\\d.]+)[\\s,]+([\\d.]+)[\\s,]+([\\d.]+)/i.exec(text);\r
  if (rgb) return [rgb[1], rgb[2], rgb[3]].map(channel => clamp(parseFloat(channel) / 255, 0, 1));\r
  if (typeof document !== 'undefined') {\r
    const context = document.createElement('canvas').getContext('2d');\r
    if (context) {\r
      context.fillStyle = '#000000';\r
      context.fillStyle = text;\r
      const normal = String(context.fillStyle);\r
      if (normal !== '#000000' || /^(#0{3}|#0{6}|black)$/i.test(text)) return parseColor(normal);\r
    }\r
  }\r
  return [0.94, 0.94, 0.94];\r
};\r
\r
const lightness = (rgb: number[]) => (Math.max(...rgb) + Math.min(...rgb)) / 2;\r
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
const multiply = (a: Matrix, b: Matrix): Matrix => {\r
  const out: number[] = [];\r
  for (let r = 0; r < 3; r++) {\r
    for (let c = 0; c < 3; c++) {\r
      out.push(a[r * 3] * b[c] + a[r * 3 + 1] * b[c + 3] + a[r * 3 + 2] * b[c + 6]);\r
    }\r
  }\r
  return out;\r
};\r
\r
const invert = (m: Matrix): Matrix => {\r
  const [a, b, c, d, e, f, g, h, i] = m;\r
  const A = e * i - f * h;\r
  const B = f * g - d * i;\r
  const C = d * h - e * g;\r
  const det = a * A + b * B + c * C;\r
  return [A, c * h - b * i, b * f - c * e, B, a * i - c * g, c * d - a * f, C, b * g - a * h, a * e - b * d].map(\r
    value => value / det\r
  );\r
};\r
\r
const apply = (m: Matrix, x: number, y: number) => {\r
  const w = m[6] * x + m[7] * y + m[8];\r
  return [(m[0] * x + m[1] * y + m[2]) / w, (m[3] * x + m[4] * y + m[5]) / w, w];\r
};\r
\r
const viewFor = (tiltX: number, tiltY: number, width: number, height: number, fill: boolean): View => {\r
  const ax = (tiltX * Math.PI) / 180;\r
  const ay = (tiltY * Math.PI) / 180;\r
  const depth = Math.max(width, height) * 1.25;\r
  const tilt = [\r
    Math.cos(ay),\r
    0,\r
    0,\r
    Math.sin(ax) * Math.sin(ay),\r
    Math.cos(ax),\r
    0,\r
    (Math.sin(ay) * Math.cos(ax)) / depth,\r
    -Math.sin(ax) / depth,\r
    1\r
  ];\r
  if (fill) {\r
    const forward = multiply([1, 0, width / 2, 0, 1, height / 2, 0, 0, 1], tilt);\r
    return { forward, inverse: invert(forward), minScale: 1, maxScale: 1 };\r
  }\r
  const corners = [\r
    [-width / 2, -height / 2],\r
    [width / 2, -height / 2],\r
    [width / 2, height / 2],\r
    [-width / 2, height / 2]\r
  ].map(([x, y]) => apply(tilt, x, y));\r
  const xs = corners.map(point => point[0]);\r
  const ys = corners.map(point => point[1]);\r
  const spanX = Math.max(...xs) - Math.min(...xs);\r
  const spanY = Math.max(...ys) - Math.min(...ys);\r
  const fit = Math.min(1, width / Math.max(1, spanX), height / Math.max(1, spanY));\r
  const midX = (Math.max(...xs) + Math.min(...xs)) / 2;\r
  const midY = (Math.max(...ys) + Math.min(...ys)) / 2;\r
  const place = [fit, 0, width / 2 - midX * fit, 0, fit, height / 2 - midY * fit, 0, 0, 1];\r
  const forward = multiply(place, tilt);\r
  const scales = corners.map(point => fit / Math.abs(point[2]));\r
  return { forward, inverse: invert(forward), minScale: Math.min(...scales), maxScale: Math.max(...scales) };\r
};\r
\r
const visibleRange = (view: View, width: number, height: number, cellX: number, cellY: number): Range | null => {\r
  const inverse = view.inverse;\r
  const edge = Math.max(cellX, cellY) * 2;\r
  const corners = [\r
    [-edge, -edge],\r
    [width + edge, -edge],\r
    [width + edge, height + edge],\r
    [-edge, height + edge]\r
  ];\r
  const depthOf = ([x, y]: number[]) => inverse[6] * x + inverse[7] * y + inverse[8] - 1 / FAR;\r
  const hull: number[][] = [];\r
  corners.forEach((from, index) => {\r
    const to = corners[(index + 1) % corners.length];\r
    const a = depthOf(from);\r
    const b = depthOf(to);\r
    if (a >= 0) hull.push(from);\r
    if (a >= 0 !== b >= 0) {\r
      const t = a / (a - b);\r
      hull.push([from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t]);\r
    }\r
  });\r
  if (hull.length < 3) return null;\r
  let minX = Infinity;\r
  let minY = Infinity;\r
  let maxX = -Infinity;\r
  let maxY = -Infinity;\r
  for (const [x, y] of hull) {\r
    const point = apply(inverse, x, y);\r
    minX = Math.min(minX, point[0]);\r
    minY = Math.min(minY, point[1]);\r
    maxX = Math.max(maxX, point[0]);\r
    maxY = Math.max(maxY, point[1]);\r
  }\r
  return {\r
    fromColumn: Math.floor((minX + width / 2) / cellX - 0.5) - 1,\r
    toColumn: Math.ceil((maxX + width / 2) / cellX - 0.5) + 1,\r
    fromRow: Math.floor((minY + height / 2) / cellY - 0.5) - 1,\r
    toRow: Math.ceil((maxY + height / 2) / cellY - 0.5) + 1\r
  };\r
};\r
\r
const MagnetLines = ({\r
  spacing = 30,\r
  rows,\r
  columns,\r
  containerSize,\r
  lineColor = '#efefef',\r
  accentColor,\r
  lineWidth = 2,\r
  lineHeight = 18,\r
  baseAngle = -10,\r
  mode = 'orbit',\r
  shape = 'line',\r
  rainbow = false,\r
  radius = 200,\r
  fade = 0.65,\r
  edgeFade = 0,\r
  stretch = 0.4,\r
  reach = 0,\r
  scatter = 0,\r
  inertia = 0.35,\r
  bounce = 0.3,\r
  ripple = 0.3,\r
  clickPulse = true,\r
  intro = true,\r
  idle = false,\r
  tiltX = 0,\r
  tiltY = 0,\r
  maxDevicePixelRatio = 2,\r
  className = '',\r
  style\r
}: MagnetLinesProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const probeRef = useRef<HTMLSpanElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const [generation, setGeneration] = useState(0);\r
\r
  const size = typeof containerSize === 'number' ? \`\${containerSize}px\` : containerSize;\r
  const square = Boolean(size);\r
  const color = parseColor(lineColor);\r
  const accent = accentColor ? parseColor(accentColor) : null;\r
  const settings: Settings = {\r
    square,\r
    spacing: Math.max(4, Number(spacing) || 30),\r
    rows: rows ? clamp(Math.round(rows), 1, 400) : 0,\r
    columns: columns ? clamp(Math.round(columns), 1, 400) : 0,\r
    lineWidth,\r
    lineHeight,\r
    baseAngle: (baseAngle * Math.PI) / 180,\r
    mode: MODES.includes(mode) ? mode : 'orbit',\r
    shape: SHAPES[shape] !== undefined ? shape : 'line',\r
    color,\r
    accent: accent ?? (shape === 'needle' ? parseColor('#f43f5e') : color),\r
    accentMix: accent ? 1 : 0,\r
    rainbow,\r
    tone: clamp(lightness(color), 0.42, 0.66),\r
    radius: Math.max(1, radius),\r
    fade: clamp(fade, 0, 1),\r
    edgeFade: clamp(edgeFade, 0, 1),\r
    stretch: clamp(stretch, 0, 2),\r
    reach: Math.max(0, reach),\r
    scatter: clamp(scatter, 0, 1),\r
    inertia: clamp(inertia, 0, 1),\r
    bounce: clamp(bounce, 0, 1),\r
    ripple: clamp(ripple, 0, 1),\r
    clickPulse,\r
    intro,\r
    idle,\r
    tiltX: clamp(tiltX, -70, 70),\r
    tiltY: clamp(tiltY, -70, 70),\r
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
    const probe = probeRef.current;\r
    if (!container || !canvas || !probe) return;\r
\r
    const gl = canvas.getContext('webgl2', {\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false,\r
      powerPreference: 'default'\r
    });\r
    const program = gl ? link(gl) : null;\r
    if (!gl || !program) return;\r
\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    const cornerBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    const centerBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, centerBuffer);\r
    gl.enableVertexAttribArray(1);\r
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);\r
    gl.vertexAttribDivisor(1, 1);\r
    const stateBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, stateBuffer);\r
    gl.enableVertexAttribArray(2);\r
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, 0);\r
    gl.vertexAttribDivisor(2, 1);\r
    gl.enable(gl.BLEND);\r
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
\r
    const field: Field = {\r
      width: 1,\r
      height: 1,\r
      pad: 0,\r
      ratio: 1,\r
      view: null,\r
      length: 20,\r
      thickness: 2,\r
      fill: true,\r
      edgePad: 1,\r
      minScale: 1,\r
      maxScale: 1,\r
      introSpeed: INTRO_SPEED,\r
      bounds: [0, 0, 0, 0],\r
      key: ''\r
    };\r
    const pointer = { x: 0, y: 0, vx: 0, vy: 0, time: 0, seen: false, inside: false, away: 0 };\r
    const target = { x: 0, y: 0, heading: 0 };\r
    const pulses: Pulse[] = [];\r
    let count = 0;\r
    let centers = new Float32Array(0);\r
    let cells = new Int32Array(0);\r
    let reveal = new Float32Array(0);\r
    let rests = new Float32Array(0);\r
    let seeds = new Float32Array(0);\r
    let angles = new Float32Array(0);\r
    let speeds = new Float32Array(0);\r
    let seenX = new Float32Array(0);\r
    let seenY = new Float32Array(0);\r
    let pending = new Uint8Array(0);\r
    let state = new Float32Array(0);\r
    let introStart = -1;\r
    let introLive = settingsRef.current.intro && !reduced && generation === 0;\r
    let raf = 0;\r
    let last = 0;\r
    let clock = 0;\r
    let visible = true;\r
    let pageVisible = document.visibilityState !== 'hidden';\r
    let lost = false;\r
    let dirty = true;\r
\r
    const measure = (value: number | string) => {\r
      if (typeof value === 'number') return value;\r
      probe.style.width = String(value);\r
      return probe.getBoundingClientRect().width;\r
    };\r
\r
    const layout = (\r
      width: number,\r
      height: number,\r
      view: View,\r
      columnCount: number,\r
      rowCount: number,\r
      tiled: boolean\r
    ) => {\r
      const cellX = width / columnCount;\r
      const cellY = height / rowCount;\r
      const range = tiled\r
        ? visibleRange(view, width, height, cellX, cellY)\r
        : { fromColumn: 0, toColumn: columnCount - 1, fromRow: 0, toRow: rowCount - 1 };\r
      const origin = apply(view.forward, 0, 0);\r
      const found: Candidate[] = [];\r
      if (range) {\r
        for (let row = range.fromRow; row <= range.toRow; row++) {\r
          const y = (row + 0.5) * cellY - height / 2;\r
          for (let column = range.fromColumn; column <= range.toColumn; column++) {\r
            const x = (column + 0.5) * cellX - width / 2;\r
            const [screenX, screenY, w] = apply(view.forward, x, y);\r
            if (tiled) {\r
              if (w <= 0 || w > FAR) continue;\r
              const margin = (0.49 * Math.min(cellX, cellY)) / w;\r
              if (screenX < -margin || screenX > width + margin || screenY < -margin || screenY > height + margin)\r
                continue;\r
            }\r
            found.push({ x, y, column, row, w, distance: Math.hypot(screenX - origin[0], screenY - origin[1]) });\r
          }\r
        }\r
      }\r
      if (found.length > MAX_LINES) {\r
        found.sort((a, b) => a.w - b.w);\r
        found.length = MAX_LINES;\r
      }\r
\r
      const previous = new Map<number, number>();\r
      for (let index = 0; index < count; index++) previous.set(cells[index * 2] * 65536 + cells[index * 2 + 1], index);\r
      const total = found.length;\r
      const next = {\r
        centers: new Float32Array(total * 2),\r
        cells: new Int32Array(total * 2),\r
        reveal: new Float32Array(total),\r
        seeds: new Float32Array(total),\r
        rests: new Float32Array(total),\r
        angles: new Float32Array(total),\r
        speeds: new Float32Array(total),\r
        seenX: new Float32Array(total),\r
        seenY: new Float32Array(total),\r
        pending: new Uint8Array(total)\r
      };\r
      let farthest = 0;\r
      let nearest = Infinity;\r
      let deepest = 0;\r
      const bounds = [Infinity, Infinity, -Infinity, -Infinity];\r
      found.forEach((item, index) => {\r
        next.centers[index * 2] = item.x;\r
        next.centers[index * 2 + 1] = item.y;\r
        next.cells[index * 2] = item.column;\r
        next.cells[index * 2 + 1] = item.row;\r
        next.reveal[index] = item.distance;\r
        next.seeds[index] = seedFor(item.column, item.row);\r
        farthest = Math.max(farthest, item.distance);\r
        nearest = Math.min(nearest, item.w);\r
        deepest = Math.max(deepest, item.w);\r
        bounds[0] = Math.min(bounds[0], item.x);\r
        bounds[1] = Math.min(bounds[1], item.y);\r
        bounds[2] = Math.max(bounds[2], item.x);\r
        bounds[3] = Math.max(bounds[3], item.y);\r
        const old = previous.get(item.column * 65536 + item.row);\r
        if (old === undefined) {\r
          next.pending[index] = 1;\r
          return;\r
        }\r
        next.angles[index] = angles[old];\r
        next.speeds[index] = speeds[old];\r
        next.seenX[index] = seenX[old];\r
        next.seenY[index] = seenY[old];\r
      });\r
\r
      count = total;\r
      ({ centers, cells, reveal, seeds, rests, angles, speeds, seenX, seenY, pending } = next);\r
      state = new Float32Array(total * 4);\r
      field.introSpeed = Math.max(INTRO_SPEED, farthest / INTRO_TIME);\r
      field.bounds = total ? bounds : [0, 0, 0, 0];\r
      field.minScale = total ? 1 / deepest : 1;\r
      field.maxScale = total ? 1 / nearest : 1;\r
      gl.bindBuffer(gl.ARRAY_BUFFER, centerBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, centers, gl.STATIC_DRAW);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, stateBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, state.byteLength || 16, gl.DYNAMIC_DRAW);\r
    };\r
\r
    const rebuild = () => {\r
      const s = settingsRef.current;\r
      const rect = container.getBoundingClientRect();\r
      const width = Math.max(1, rect.width);\r
      const height = Math.max(1, rect.height);\r
      const length = Math.max(1, measure(s.lineHeight));\r
      const thickness = Math.max(0.25, measure(s.lineWidth));\r
      const fill = !s.square;\r
      const tiled = fill && (s.tiltX !== 0 || s.tiltY !== 0);\r
      const view = viewFor(s.tiltX, s.tiltY, width, height, fill);\r
      const ratio = Math.min(window.devicePixelRatio || 1, s.maxRatio);\r
\r
      let columnCount = Math.max(1, Math.round(s.columns || (s.rows ? (s.rows * width) / height : width / s.spacing)));\r
      let rowCount = Math.max(1, Math.round(s.rows || (s.columns ? (s.columns * height) / width : height / s.spacing)));\r
      if (columnCount * rowCount > MAX_LINES) {\r
        const shrink = Math.sqrt((columnCount * rowCount) / MAX_LINES);\r
        columnCount = Math.max(1, Math.floor(columnCount / shrink));\r
        rowCount = Math.max(1, Math.floor(rowCount / shrink));\r
      }\r
\r
      const key = [\r
        fill,\r
        columnCount,\r
        rowCount,\r
        width.toFixed(1),\r
        height.toFixed(1),\r
        tiled ? \`\${s.tiltX},\${s.tiltY}\` : ''\r
      ].join('|');\r
      if (key !== field.key) {\r
        field.key = key;\r
        layout(width, height, view, columnCount, rowCount, tiled);\r
      }\r
\r
      const minScale = fill ? field.minScale : view.minScale;\r
      const maxScale = fill ? field.maxScale : view.maxScale;\r
      const pad = fill ? 0 : Math.ceil((length * (1 + s.stretch) + thickness * 2) * Math.max(1, maxScale) + 8);\r
      const canvasWidth = width + pad * 2;\r
      const canvasHeight = height + pad * 2;\r
      canvas.style.left = \`\${-pad}px\`;\r
      canvas.style.top = \`\${-pad}px\`;\r
      canvas.style.width = \`\${canvasWidth}px\`;\r
      canvas.style.height = \`\${canvasHeight}px\`;\r
      const pixelWidth = Math.max(1, Math.round(canvasWidth * ratio));\r
      const pixelHeight = Math.max(1, Math.round(canvasHeight * ratio));\r
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {\r
        canvas.width = pixelWidth;\r
        canvas.height = pixelHeight;\r
      }\r
      Object.assign(field, {\r
        width,\r
        height,\r
        pad,\r
        ratio,\r
        view,\r
        length,\r
        thickness,\r
        fill,\r
        edgePad: 2 / (ratio * Math.max(0.05, minScale))\r
      });\r
    };\r
\r
    const fieldAngle = (s: Settings, index: number, px: number, py: number) => {\r
      const dx = px - centers[index * 2];\r
      const dy = py - centers[index * 2 + 1];\r
      if (s.mode === 'dipole') {\r
        const distance = Math.hypot(dx, dy) || 1;\r
        const rx = -dx / distance;\r
        const ry = -dy / distance;\r
        const mx = Math.cos(target.heading);\r
        const my = Math.sin(target.heading);\r
        const dot = mx * rx + my * ry;\r
        return Math.atan2(3 * dot * ry - my, 3 * dot * rx - mx);\r
      }\r
      const toward = Math.atan2(dy, dx);\r
      if (s.mode === 'attract') return toward;\r
      if (s.mode === 'spiral') return toward + Math.PI / 4;\r
      return toward + Math.PI / 2;\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (lost) return;\r
      const s = settingsRef.current;\r
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05);\r
      last = Math.max(last, now);\r
      clock += dt;\r
      if (dirty) rebuild();\r
      dirty = false;\r
\r
      const period = s.shape === 'line' ? Math.PI : TAU;\r
      const spread = s.scatter * Math.PI * 0.5;\r
      for (let index = 0; index < count; index++) rests[index] = s.baseAngle + Math.PI / 2 + seeds[index] * spread;\r
\r
      const wandering = s.idle && !reduced && (!pointer.seen || pointer.away > 1.2);\r
      if (pointer.seen && !pointer.inside) pointer.away += dt;\r
      let px = pointer.seen ? pointer.x : 0;\r
      let py = pointer.seen ? pointer.y : 0;\r
      if (wandering) {\r
        const amount = Math.min(field.width, field.height) * 0.32;\r
        px = Math.cos(clock * 0.37) * amount + Math.sin(clock * 0.21) * amount * 0.35;\r
        py = Math.sin(clock * 0.53 + 1.3) * amount * 0.8;\r
      }\r
      const follow = 1 - Math.exp(-dt / (pointer.seen && !wandering ? 0.035 : 0.6));\r
      target.x += (px - target.x) * follow;\r
      target.y += (py - target.y) * follow;\r
      const speed = Math.hypot(pointer.vx, pointer.vy);\r
      if (speed > 40) {\r
        const turn = wrap(Math.atan2(pointer.vy, pointer.vx) - target.heading, TAU);\r
        target.heading += turn * (1 - Math.exp(-dt / 0.25));\r
      }\r
      pointer.vx *= Math.exp(-dt / 0.12);\r
      pointer.vy *= Math.exp(-dt / 0.12);\r
\r
      if (introLive && introStart < 0) introStart = clock;\r
      const introTime = introLive ? clock - introStart : Infinity;\r
      let introBusy = false;\r
\r
      const stiffness = s.inertia <= 0 || reduced ? 0 : Math.pow(6 + 42 * Math.pow(1 - s.inertia, 2), 2);\r
      const damping = stiffness ? 2 * Math.sqrt(stiffness) * (1 - 0.75 * s.bounce) : 0;\r
      const steps = stiffness ? Math.max(1, Math.ceil(dt / (1 / 240))) : 0;\r
      const h = steps ? dt / steps : 0;\r
      const lag = reduced ? 0 : s.ripple / 900;\r
      const radius = s.radius;\r
      const reachIn = s.reach * 0.55;\r
      const reachOut = s.reach;\r
\r
      for (let i = pulses.length - 1; i >= 0; i--) {\r
        const age = clock - pulses[i].start;\r
        if (age > pulses[i].life) pulses.splice(i, 1);\r
      }\r
\r
      let moving = false;\r
      for (let index = 0; index < count; index++) {\r
        const cx = centers[index * 2];\r
        const cy = centers[index * 2 + 1];\r
        const born = pending[index] === 1;\r
        if (born) {\r
          seenX[index] = target.x;\r
          seenY[index] = target.y;\r
        } else {\r
          const distance = Math.hypot(target.x - cx, target.y - cy);\r
          const tau = lag * distance;\r
          const k = tau > 0 ? 1 - Math.exp(-dt / tau) : 1;\r
          seenX[index] += (target.x - seenX[index]) * k;\r
          seenY[index] += (target.y - seenY[index]) * k;\r
          if (Math.abs(target.x - seenX[index]) + Math.abs(target.y - seenY[index]) > 0.05) moving = true;\r
        }\r
        const sx = seenX[index];\r
        const sy = seenY[index];\r
        const near = Math.hypot(sx - cx, sy - cy);\r
        let goal = fieldAngle(s, index, sx, sy);\r
        const rest = rests[index];\r
        if (reachOut > 0) {\r
          const t = clamp((reachOut - near) / Math.max(1, reachOut - reachIn), 0, 1);\r
          goal = rest + wrap(goal - rest, period) * smootherstep(t);\r
        }\r
        let shown = 1;\r
        if (introLive) {\r
          const local = (introTime - reveal[index] / field.introSpeed) / INTRO_SPIN;\r
          const progress = smootherstep(clamp(local, 0, 1));\r
          if (local < 1) introBusy = true;\r
          goal = rest + wrap(goal - rest, period) * progress;\r
          shown = clamp(local * 2.5, 0, 1);\r
        }\r
        if (born) {\r
          angles[index] = introLive ? rest : goal;\r
          speeds[index] = 0;\r
          pending[index] = 0;\r
        } else if (!stiffness) {\r
          angles[index] = angles[index] + wrap(goal - angles[index], period);\r
          speeds[index] = 0;\r
        } else {\r
          let angle = angles[index];\r
          let velocity = speeds[index];\r
          for (let step = 0; step < steps; step++) {\r
            velocity += (stiffness * wrap(goal - angle, period) - damping * velocity) * h;\r
            angle += velocity * h;\r
          }\r
          if (Math.abs(velocity) < 0.002 && Math.abs(wrap(goal - angle, period)) < 0.0005) {\r
            angle += wrap(goal - angle, period);\r
            velocity = 0;\r
          } else moving = true;\r
          if (angle > 40 || angle < -40) angle = wrap(angle, TAU);\r
          angles[index] = angle;\r
          speeds[index] = velocity;\r
        }\r
\r
        let spin = 0;\r
        let flash = 0;\r
        for (const pulse of pulses) {\r
          const travelled = (clock - pulse.start) * PULSE_SPEED;\r
          const gap = Math.hypot(cx - pulse.x, cy - pulse.y);\r
          const local = (travelled - gap) / (PULSE_SPEED * PULSE_SPIN);\r
          if (local > 0 && local < 1) spin += smootherstep(local) * period;\r
          const band = (travelled - gap - PULSE_SPEED * PULSE_SPIN * 0.5) / 60;\r
          flash += Math.exp(-band * band) * Math.max(0, 1 - (clock - pulse.start) / pulse.life);\r
        }\r
\r
        const emphasis = Math.exp(-(near * near) / (radius * radius)) * shown;\r
        state[index * 4] = angles[index] + spin;\r
        state[index * 4 + 1] = emphasis;\r
        state[index * 4 + 2] = Math.min(1, flash * 0.9) * shown;\r
        state[index * 4 + 3] = shown;\r
      }\r
      if (introLive && !introBusy && clock - introStart > 0.2) introLive = false;\r
      if (Math.abs(px - target.x) + Math.abs(py - target.y) > 0.05) moving = true;\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      if (count && field.view) {\r
        const u = program.uniforms;\r
        gl.useProgram(program.program);\r
        gl.uniformMatrix3fv(u.uView, true, field.view.forward);\r
        gl.uniform2f(u.uCanvas, field.width + field.pad * 2, field.height + field.pad * 2);\r
        gl.uniform2f(u.uOffset, field.pad, field.pad);\r
        gl.uniform2f(u.uLine, field.length / 2, field.thickness / 2);\r
        gl.uniform1f(u.uStretch, s.stretch);\r
        gl.uniform1f(u.uHead, s.shape === 'needle' ? 0.16 : s.shape === 'arrow' ? 0.32 : 0);\r
        gl.uniform1f(u.uPad, field.edgePad);\r
        gl.uniform1f(u.uFar, field.fill ? FAR : 1e6);\r
        gl.uniform3fv(u.uColor, s.color);\r
        gl.uniform3fv(u.uAccent, s.accent);\r
        gl.uniform1f(u.uAccentMix, s.accentMix);\r
        gl.uniform1f(u.uOpacity, 1);\r
        gl.uniform1f(u.uFade, s.fade);\r
        gl.uniform1i(u.uShape, SHAPES[s.shape]);\r
        gl.uniform1f(u.uRainbow, s.rainbow ? 1 : 0);\r
        gl.uniform1f(u.uTone, s.tone);\r
        gl.uniform1f(u.uPeriod, period);\r
        gl.uniform2f(u.uPixels, canvas.width, canvas.height);\r
        gl.uniform2f(u.uEdge, s.edgeFade * 0.34 * field.width, s.edgeFade * 0.44 * field.height);\r
        gl.bindVertexArray(vao);\r
        gl.bindBuffer(gl.ARRAY_BUFFER, stateBuffer);\r
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, state);\r
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, count);\r
      }\r
\r
      const busy = moving || introLive || pulses.length > 0 || wandering;\r
      if (busy && visible && pageVisible) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (raf || lost || !visible || !pageVisible) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
    wakeRef.current = () => {\r
      dirty = true;\r
      wake();\r
    };\r
\r
    const toPlane = (clientX: number, clientY: number) => {\r
      if (!field.view) return null;\r
      const rect = container.getBoundingClientRect();\r
      const [x, y, w] = apply(field.view.inverse, clientX - rect.left, clientY - rect.top);\r
      if (w <= 0) return null;\r
      const inside = clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;\r
      return { x, y, inside };\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const spot = toPlane(event.clientX, event.clientY);\r
      if (!spot) return;\r
      const now = performance.now();\r
      const dt = Math.max(1, now - pointer.time) / 1000;\r
      if (pointer.seen && dt < 0.2) {\r
        pointer.vx = pointer.vx * 0.6 + ((spot.x - pointer.x) / dt) * 0.4;\r
        pointer.vy = pointer.vy * 0.6 + ((spot.y - pointer.y) / dt) * 0.4;\r
      }\r
      pointer.time = now;\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.seen = true;\r
      pointer.inside = spot.inside;\r
      if (spot.inside) pointer.away = 0;\r
      wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      onPointerMove(event);\r
      const s = settingsRef.current;\r
      if (!s.clickPulse || reduced || !count) return;\r
      const spot = toPlane(event.clientX, event.clientY);\r
      if (!spot) return;\r
      const inside = field.fill\r
        ? spot.inside\r
        : Math.abs(spot.x) <= field.width / 2 && Math.abs(spot.y) <= field.height / 2;\r
      if (!inside) return;\r
      const [minX, minY, maxX, maxY] = field.bounds;\r
      const farthest = Math.max(\r
        Math.hypot(spot.x - minX, spot.y - minY),\r
        Math.hypot(spot.x - maxX, spot.y - minY),\r
        Math.hypot(spot.x - minX, spot.y - maxY),\r
        Math.hypot(spot.x - maxX, spot.y - maxY)\r
      );\r
      pulses.push({\r
        x: spot.x,\r
        y: spot.y,\r
        start: clock,\r
        life: Math.min(6, farthest / PULSE_SPEED + PULSE_SPIN + 0.1)\r
      });\r
      if (pulses.length > 6) pulses.shift();\r
      wake();\r
    };\r
\r
    const onLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
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
      dirty = true;\r
      wake();\r
    });\r
    resizeObserver.observe(container);\r
    const onResize = () => {\r
      dirty = true;\r
      wake();\r
    };\r
    window.addEventListener('resize', onResize);\r
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
    wake();\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('resize', onResize);\r
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      canvas.removeEventListener('webglcontextlost', onLost);\r
      canvas.removeEventListener('webglcontextrestored', onRestored);\r
      if (!gl.isContextLost()) {\r
        gl.deleteBuffer(cornerBuffer);\r
        gl.deleteBuffer(centerBuffer);\r
        gl.deleteBuffer(stateBuffer);\r
        gl.deleteVertexArray(vao);\r
        gl.deleteProgram(program.program);\r
      }\r
    };\r
  }, [generation]);\r
\r
  return (\r
    <div\r
      ref={containerRef}\r
      className={\`magnet-lines\${square ? ' magnet-lines--square' : ''}\${className ? \` \${className}\` : ''}\`}\r
      style={square ? { width: size, ...style } : style}\r
    >\r
      <canvas ref={canvasRef} className="magnet-lines__canvas" aria-hidden="true" />\r
      <span ref={probeRef} className="magnet-lines__probe" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default MagnetLines;\r
`,a=`'use client';\r
\r
import { useEffect, useRef, useState, type CSSProperties } from 'react';\r
\r
type Mode = 'orbit' | 'attract' | 'spiral' | 'dipole';\r
type Shape = 'line' | 'arrow' | 'needle';\r
type Matrix = number[];\r
\r
export interface MagnetLinesProps {\r
  spacing?: number;\r
  rows?: number;\r
  columns?: number;\r
  containerSize?: number | string;\r
  lineColor?: string;\r
  accentColor?: string;\r
  lineWidth?: number | string;\r
  lineHeight?: number | string;\r
  baseAngle?: number;\r
  mode?: Mode;\r
  shape?: Shape;\r
  rainbow?: boolean;\r
  radius?: number;\r
  fade?: number;\r
  edgeFade?: number;\r
  stretch?: number;\r
  reach?: number;\r
  scatter?: number;\r
  inertia?: number;\r
  bounce?: number;\r
  ripple?: number;\r
  clickPulse?: boolean;\r
  intro?: boolean;\r
  idle?: boolean;\r
  tiltX?: number;\r
  tiltY?: number;\r
  maxDevicePixelRatio?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Settings {\r
  square: boolean;\r
  spacing: number;\r
  rows: number;\r
  columns: number;\r
  lineWidth: number | string;\r
  lineHeight: number | string;\r
  baseAngle: number;\r
  mode: Mode;\r
  shape: Shape;\r
  color: number[];\r
  accent: number[];\r
  accentMix: number;\r
  rainbow: boolean;\r
  tone: number;\r
  radius: number;\r
  fade: number;\r
  edgeFade: number;\r
  stretch: number;\r
  reach: number;\r
  scatter: number;\r
  inertia: number;\r
  bounce: number;\r
  ripple: number;\r
  clickPulse: boolean;\r
  intro: boolean;\r
  idle: boolean;\r
  tiltX: number;\r
  tiltY: number;\r
  maxRatio: number;\r
}\r
\r
interface View {\r
  forward: Matrix;\r
  inverse: Matrix;\r
  minScale: number;\r
  maxScale: number;\r
}\r
\r
interface Range {\r
  fromColumn: number;\r
  toColumn: number;\r
  fromRow: number;\r
  toRow: number;\r
}\r
\r
interface Program {\r
  program: WebGLProgram;\r
  uniforms: Record<string, WebGLUniformLocation | null>;\r
}\r
\r
interface Field {\r
  width: number;\r
  height: number;\r
  pad: number;\r
  ratio: number;\r
  view: View | null;\r
  length: number;\r
  thickness: number;\r
  fill: boolean;\r
  edgePad: number;\r
  minScale: number;\r
  maxScale: number;\r
  introSpeed: number;\r
  bounds: number[];\r
  key: string;\r
}\r
\r
interface Pulse {\r
  x: number;\r
  y: number;\r
  start: number;\r
  life: number;\r
}\r
\r
interface Candidate {\r
  x: number;\r
  y: number;\r
  column: number;\r
  row: number;\r
  w: number;\r
  distance: number;\r
}\r
\r
const VERTEX = \`#version 300 es\r
layout(location = 0) in vec2 aCorner;\r
layout(location = 1) in vec2 aCenter;\r
layout(location = 2) in vec4 aState;\r
uniform mat3 uView;\r
uniform vec2 uCanvas;\r
uniform vec2 uOffset;\r
uniform vec2 uLine;\r
uniform float uStretch;\r
uniform float uHead;\r
uniform float uPad;\r
uniform float uFar;\r
out vec2 vLocal;\r
out vec2 vHalf;\r
out float vEmphasis;\r
out float vFlash;\r
out float vAngle;\r
out float vShown;\r
void main() {\r
  float angle = aState.x;\r
  float emphasis = aState.y;\r
  float halfLength = uLine.x * (1.0 + uStretch * emphasis);\r
  float halfWidth = uLine.y;\r
  vec2 extent = vec2(halfLength + uPad, max(halfWidth, uHead * halfLength) + uPad);\r
  vec2 local = aCorner * extent;\r
  vec2 axis = vec2(cos(angle), sin(angle));\r
  vec2 point = aCenter + axis * local.x + vec2(-axis.y, axis.x) * local.y;\r
  vec3 screen = uView * vec3(point, 1.0);\r
  vec2 scale = vec2(2.0 / uCanvas.x, -2.0 / uCanvas.y);\r
  vec2 shift = vec2(-1.0 + 2.0 * uOffset.x / uCanvas.x, 1.0 - 2.0 * uOffset.y / uCanvas.y);\r
  gl_Position = vec4(screen.xy * scale + shift * screen.z, 0.0, screen.z);\r
  float depth = (uView * vec3(aCenter, 1.0)).z;\r
  vLocal = local;\r
  vHalf = vec2(halfLength, halfWidth);\r
  vEmphasis = emphasis;\r
  vFlash = aState.z;\r
  vAngle = angle;\r
  vShown = aState.w * (1.0 - smoothstep(uFar * 0.45, uFar, depth));\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
in vec2 vLocal;\r
in vec2 vHalf;\r
in float vEmphasis;\r
in float vFlash;\r
in float vAngle;\r
in float vShown;\r
out vec4 fragColor;\r
uniform vec3 uColor;\r
uniform vec3 uAccent;\r
uniform float uAccentMix;\r
uniform float uOpacity;\r
uniform float uFade;\r
uniform int uShape;\r
uniform float uHead;\r
uniform float uRainbow;\r
uniform float uTone;\r
uniform float uPeriod;\r
uniform vec2 uCanvas;\r
uniform vec2 uOffset;\r
uniform vec2 uPixels;\r
uniform vec2 uEdge;\r
\r
float ndot(vec2 a, vec2 b) {\r
  return a.x * b.x - a.y * b.y;\r
}\r
\r
float rhombus(vec2 p, vec2 b) {\r
  p = abs(p);\r
  float h = clamp(ndot(b - 2.0 * p, b) / dot(b, b), -1.0, 1.0);\r
  float d = length(p - 0.5 * b * vec2(1.0 - h, 1.0 + h));\r
  return d * sign(p.x * b.y + p.y * b.x - b.x * b.y);\r
}\r
\r
float triangle(vec2 p, vec2 q) {\r
  p.x = abs(p.x);\r
  vec2 a = p - q * clamp(dot(p, q) / dot(q, q), 0.0, 1.0);\r
  vec2 b = p - q * vec2(clamp(p.x / q.x, 0.0, 1.0), 1.0);\r
  float s = -sign(q.y);\r
  vec2 d = min(vec2(dot(a, a), s * (p.x * q.y - p.y * q.x)), vec2(dot(b, b), s * (p.y - q.y)));\r
  return -sqrt(d.x) * sign(d.y);\r
}\r
\r
float capsule(vec2 p, float from, float to, float radius) {\r
  float x = clamp(p.x, from, to);\r
  return length(vec2(p.x - x, p.y)) - radius;\r
}\r
\r
float feather(float distance, float zone) {\r
  if (zone <= 0.0) return 1.0;\r
  float t = clamp(distance / zone, 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
vec3 spectrum(float hue, float tone) {\r
  vec3 k = clamp(abs(fract(hue + vec3(0.0, 2.0, 1.0) / 3.0) * 6.0 - 3.0) - 1.0, 0.0, 1.0);\r
  k = k * k * (3.0 - 2.0 * k);\r
  float chroma = (1.0 - abs(2.0 * tone - 1.0)) * 0.92;\r
  return tone + chroma * (k - 0.5);\r
}\r
\r
void main() {\r
  vec2 p = vLocal;\r
  float aa = max(length(fwidth(p)) * 0.7071, 0.0001);\r
  float halfWidth = max(vHalf.y, aa * 0.5);\r
  float thin = vHalf.y / halfWidth;\r
  float halfLength = max(vHalf.x, halfWidth);\r
  float d;\r
  if (uShape == 1) {\r
    float head = min(halfLength * 0.9, max(halfWidth * 4.5, halfLength * 0.55));\r
    float wing = max(uHead * halfLength, halfWidth * 2.2);\r
    float shaft = capsule(p, -halfLength + halfWidth, halfLength - head * 0.6, halfWidth);\r
    float tip = triangle(vec2(p.y, halfLength - p.x), vec2(wing, head));\r
    d = min(shaft, tip);\r
  } else if (uShape == 2) {\r
    d = rhombus(p, vec2(halfLength, max(uHead * halfLength, halfWidth)));\r
  } else {\r
    d = capsule(p, -halfLength + halfWidth, halfLength - halfWidth, halfWidth);\r
  }\r
  float coverage = clamp(0.5 - d / aa, 0.0, 1.0) * thin;\r
  if (coverage <= 0.0) discard;\r
\r
  float emphasis = clamp(vEmphasis + vFlash, 0.0, 1.0);\r
  vec3 color = mix(uColor, uAccent, uAccentMix * emphasis);\r
  if (uShape == 2) {\r
    float north = smoothstep(-aa, aa, p.x);\r
    color = mix(uColor, uAccent, north);\r
  }\r
  if (uRainbow > 0.5) {\r
    float hue = fract(vAngle / uPeriod);\r
    vec3 tint = spectrum(hue, uTone);\r
    color = uShape == 2 ? mix(tint, uColor, 1.0 - smoothstep(-aa, aa, p.x)) : tint;\r
  }\r
  float alpha = uOpacity * mix(1.0 - uFade, 1.0, clamp(vEmphasis, 0.0, 1.0));\r
  alpha = clamp(alpha + vFlash * 0.6, 0.0, 1.0) * coverage * vShown;\r
  vec2 point = vec2(gl_FragCoord.x, uPixels.y - gl_FragCoord.y) * (uCanvas / uPixels) - uOffset;\r
  vec2 inside = min(point, uCanvas - 2.0 * uOffset - point);\r
  alpha *= feather(inside.x, uEdge.x) * feather(inside.y, uEdge.y);\r
  fragColor = vec4(color * alpha, alpha);\r
}\`;\r
\r
const MODES = ['orbit', 'attract', 'spiral', 'dipole'];\r
const SHAPES: Record<Shape, number> = { line: 0, arrow: 1, needle: 2 };\r
const TAU = Math.PI * 2;\r
const PULSE_SPEED = 520;\r
const PULSE_SPIN = 0.34;\r
const INTRO_SPEED = 700;\r
const INTRO_TIME = 1.1;\r
const INTRO_SPIN = 0.65;\r
const FAR = 4;\r
const MAX_LINES = 30000;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
const smootherstep = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);\r
\r
const wrap = (value: number, period: number) => {\r
  const half = period / 2;\r
  return ((((value + half) % period) + period) % period) - half;\r
};\r
\r
const seedFor = (column: number, row: number) => {\r
  let hash = Math.imul(column + 40503, 2246822519) ^ Math.imul(row + 9973, 3266489917);\r
  hash = Math.imul(hash ^ (hash >>> 15), 668265263);\r
  hash = Math.imul(hash ^ (hash >>> 13), 374761393);\r
  return (((hash ^ (hash >>> 16)) >>> 0) / 4294967296) * 2 - 1;\r
};\r
\r
const parseColor = (value: string): number[] => {\r
  const text = String(value || '').trim();\r
  const hex = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text);\r
  if (hex) {\r
    const full = hex[1].length === 3 ? hex[1].replace(/./g, digit => digit + digit) : hex[1];\r
    return [0, 2, 4].map(index => parseInt(full.slice(index, index + 2), 16) / 255);\r
  }\r
  const rgb = /^rgba?\\(\\s*([\\d.]+)[\\s,]+([\\d.]+)[\\s,]+([\\d.]+)/i.exec(text);\r
  if (rgb) return [rgb[1], rgb[2], rgb[3]].map(channel => clamp(parseFloat(channel) / 255, 0, 1));\r
  if (typeof document !== 'undefined') {\r
    const context = document.createElement('canvas').getContext('2d');\r
    if (context) {\r
      context.fillStyle = '#000000';\r
      context.fillStyle = text;\r
      const normal = String(context.fillStyle);\r
      if (normal !== '#000000' || /^(#0{3}|#0{6}|black)$/i.test(text)) return parseColor(normal);\r
    }\r
  }\r
  return [0.94, 0.94, 0.94];\r
};\r
\r
const lightness = (rgb: number[]) => (Math.max(...rgb) + Math.min(...rgb)) / 2;\r
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
const multiply = (a: Matrix, b: Matrix): Matrix => {\r
  const out: number[] = [];\r
  for (let r = 0; r < 3; r++) {\r
    for (let c = 0; c < 3; c++) {\r
      out.push(a[r * 3] * b[c] + a[r * 3 + 1] * b[c + 3] + a[r * 3 + 2] * b[c + 6]);\r
    }\r
  }\r
  return out;\r
};\r
\r
const invert = (m: Matrix): Matrix => {\r
  const [a, b, c, d, e, f, g, h, i] = m;\r
  const A = e * i - f * h;\r
  const B = f * g - d * i;\r
  const C = d * h - e * g;\r
  const det = a * A + b * B + c * C;\r
  return [A, c * h - b * i, b * f - c * e, B, a * i - c * g, c * d - a * f, C, b * g - a * h, a * e - b * d].map(\r
    value => value / det\r
  );\r
};\r
\r
const apply = (m: Matrix, x: number, y: number) => {\r
  const w = m[6] * x + m[7] * y + m[8];\r
  return [(m[0] * x + m[1] * y + m[2]) / w, (m[3] * x + m[4] * y + m[5]) / w, w];\r
};\r
\r
const viewFor = (tiltX: number, tiltY: number, width: number, height: number, fill: boolean): View => {\r
  const ax = (tiltX * Math.PI) / 180;\r
  const ay = (tiltY * Math.PI) / 180;\r
  const depth = Math.max(width, height) * 1.25;\r
  const tilt = [\r
    Math.cos(ay),\r
    0,\r
    0,\r
    Math.sin(ax) * Math.sin(ay),\r
    Math.cos(ax),\r
    0,\r
    (Math.sin(ay) * Math.cos(ax)) / depth,\r
    -Math.sin(ax) / depth,\r
    1\r
  ];\r
  if (fill) {\r
    const forward = multiply([1, 0, width / 2, 0, 1, height / 2, 0, 0, 1], tilt);\r
    return { forward, inverse: invert(forward), minScale: 1, maxScale: 1 };\r
  }\r
  const corners = [\r
    [-width / 2, -height / 2],\r
    [width / 2, -height / 2],\r
    [width / 2, height / 2],\r
    [-width / 2, height / 2]\r
  ].map(([x, y]) => apply(tilt, x, y));\r
  const xs = corners.map(point => point[0]);\r
  const ys = corners.map(point => point[1]);\r
  const spanX = Math.max(...xs) - Math.min(...xs);\r
  const spanY = Math.max(...ys) - Math.min(...ys);\r
  const fit = Math.min(1, width / Math.max(1, spanX), height / Math.max(1, spanY));\r
  const midX = (Math.max(...xs) + Math.min(...xs)) / 2;\r
  const midY = (Math.max(...ys) + Math.min(...ys)) / 2;\r
  const place = [fit, 0, width / 2 - midX * fit, 0, fit, height / 2 - midY * fit, 0, 0, 1];\r
  const forward = multiply(place, tilt);\r
  const scales = corners.map(point => fit / Math.abs(point[2]));\r
  return { forward, inverse: invert(forward), minScale: Math.min(...scales), maxScale: Math.max(...scales) };\r
};\r
\r
const visibleRange = (view: View, width: number, height: number, cellX: number, cellY: number): Range | null => {\r
  const inverse = view.inverse;\r
  const edge = Math.max(cellX, cellY) * 2;\r
  const corners = [\r
    [-edge, -edge],\r
    [width + edge, -edge],\r
    [width + edge, height + edge],\r
    [-edge, height + edge]\r
  ];\r
  const depthOf = ([x, y]: number[]) => inverse[6] * x + inverse[7] * y + inverse[8] - 1 / FAR;\r
  const hull: number[][] = [];\r
  corners.forEach((from, index) => {\r
    const to = corners[(index + 1) % corners.length];\r
    const a = depthOf(from);\r
    const b = depthOf(to);\r
    if (a >= 0) hull.push(from);\r
    if (a >= 0 !== b >= 0) {\r
      const t = a / (a - b);\r
      hull.push([from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t]);\r
    }\r
  });\r
  if (hull.length < 3) return null;\r
  let minX = Infinity;\r
  let minY = Infinity;\r
  let maxX = -Infinity;\r
  let maxY = -Infinity;\r
  for (const [x, y] of hull) {\r
    const point = apply(inverse, x, y);\r
    minX = Math.min(minX, point[0]);\r
    minY = Math.min(minY, point[1]);\r
    maxX = Math.max(maxX, point[0]);\r
    maxY = Math.max(maxY, point[1]);\r
  }\r
  return {\r
    fromColumn: Math.floor((minX + width / 2) / cellX - 0.5) - 1,\r
    toColumn: Math.ceil((maxX + width / 2) / cellX - 0.5) + 1,\r
    fromRow: Math.floor((minY + height / 2) / cellY - 0.5) - 1,\r
    toRow: Math.ceil((maxY + height / 2) / cellY - 0.5) + 1\r
  };\r
};\r
\r
const MagnetLines = ({\r
  spacing = 30,\r
  rows,\r
  columns,\r
  containerSize,\r
  lineColor = '#efefef',\r
  accentColor,\r
  lineWidth = 2,\r
  lineHeight = 18,\r
  baseAngle = -10,\r
  mode = 'orbit',\r
  shape = 'line',\r
  rainbow = false,\r
  radius = 200,\r
  fade = 0.65,\r
  edgeFade = 0,\r
  stretch = 0.4,\r
  reach = 0,\r
  scatter = 0,\r
  inertia = 0.35,\r
  bounce = 0.3,\r
  ripple = 0.3,\r
  clickPulse = true,\r
  intro = true,\r
  idle = false,\r
  tiltX = 0,\r
  tiltY = 0,\r
  maxDevicePixelRatio = 2,\r
  className = '',\r
  style\r
}: MagnetLinesProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const probeRef = useRef<HTMLSpanElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const [generation, setGeneration] = useState(0);\r
\r
  const size = typeof containerSize === 'number' ? \`\${containerSize}px\` : containerSize;\r
  const square = Boolean(size);\r
  const color = parseColor(lineColor);\r
  const accent = accentColor ? parseColor(accentColor) : null;\r
  const settings: Settings = {\r
    square,\r
    spacing: Math.max(4, Number(spacing) || 30),\r
    rows: rows ? clamp(Math.round(rows), 1, 400) : 0,\r
    columns: columns ? clamp(Math.round(columns), 1, 400) : 0,\r
    lineWidth,\r
    lineHeight,\r
    baseAngle: (baseAngle * Math.PI) / 180,\r
    mode: MODES.includes(mode) ? mode : 'orbit',\r
    shape: SHAPES[shape] !== undefined ? shape : 'line',\r
    color,\r
    accent: accent ?? (shape === 'needle' ? parseColor('#f43f5e') : color),\r
    accentMix: accent ? 1 : 0,\r
    rainbow,\r
    tone: clamp(lightness(color), 0.42, 0.66),\r
    radius: Math.max(1, radius),\r
    fade: clamp(fade, 0, 1),\r
    edgeFade: clamp(edgeFade, 0, 1),\r
    stretch: clamp(stretch, 0, 2),\r
    reach: Math.max(0, reach),\r
    scatter: clamp(scatter, 0, 1),\r
    inertia: clamp(inertia, 0, 1),\r
    bounce: clamp(bounce, 0, 1),\r
    ripple: clamp(ripple, 0, 1),\r
    clickPulse,\r
    intro,\r
    idle,\r
    tiltX: clamp(tiltX, -70, 70),\r
    tiltY: clamp(tiltY, -70, 70),\r
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
    const probe = probeRef.current;\r
    if (!container || !canvas || !probe) return;\r
\r
    const gl = canvas.getContext('webgl2', {\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false,\r
      powerPreference: 'default'\r
    });\r
    const program = gl ? link(gl) : null;\r
    if (!gl || !program) return;\r
\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    const cornerBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    const centerBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, centerBuffer);\r
    gl.enableVertexAttribArray(1);\r
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);\r
    gl.vertexAttribDivisor(1, 1);\r
    const stateBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, stateBuffer);\r
    gl.enableVertexAttribArray(2);\r
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, 0);\r
    gl.vertexAttribDivisor(2, 1);\r
    gl.enable(gl.BLEND);\r
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
\r
    const field: Field = {\r
      width: 1,\r
      height: 1,\r
      pad: 0,\r
      ratio: 1,\r
      view: null,\r
      length: 20,\r
      thickness: 2,\r
      fill: true,\r
      edgePad: 1,\r
      minScale: 1,\r
      maxScale: 1,\r
      introSpeed: INTRO_SPEED,\r
      bounds: [0, 0, 0, 0],\r
      key: ''\r
    };\r
    const pointer = { x: 0, y: 0, vx: 0, vy: 0, time: 0, seen: false, inside: false, away: 0 };\r
    const target = { x: 0, y: 0, heading: 0 };\r
    const pulses: Pulse[] = [];\r
    let count = 0;\r
    let centers = new Float32Array(0);\r
    let cells = new Int32Array(0);\r
    let reveal = new Float32Array(0);\r
    let rests = new Float32Array(0);\r
    let seeds = new Float32Array(0);\r
    let angles = new Float32Array(0);\r
    let speeds = new Float32Array(0);\r
    let seenX = new Float32Array(0);\r
    let seenY = new Float32Array(0);\r
    let pending = new Uint8Array(0);\r
    let state = new Float32Array(0);\r
    let introStart = -1;\r
    let introLive = settingsRef.current.intro && !reduced && generation === 0;\r
    let raf = 0;\r
    let last = 0;\r
    let clock = 0;\r
    let visible = true;\r
    let pageVisible = document.visibilityState !== 'hidden';\r
    let lost = false;\r
    let dirty = true;\r
\r
    const measure = (value: number | string) => {\r
      if (typeof value === 'number') return value;\r
      probe.style.width = String(value);\r
      return probe.getBoundingClientRect().width;\r
    };\r
\r
    const layout = (\r
      width: number,\r
      height: number,\r
      view: View,\r
      columnCount: number,\r
      rowCount: number,\r
      tiled: boolean\r
    ) => {\r
      const cellX = width / columnCount;\r
      const cellY = height / rowCount;\r
      const range = tiled\r
        ? visibleRange(view, width, height, cellX, cellY)\r
        : { fromColumn: 0, toColumn: columnCount - 1, fromRow: 0, toRow: rowCount - 1 };\r
      const origin = apply(view.forward, 0, 0);\r
      const found: Candidate[] = [];\r
      if (range) {\r
        for (let row = range.fromRow; row <= range.toRow; row++) {\r
          const y = (row + 0.5) * cellY - height / 2;\r
          for (let column = range.fromColumn; column <= range.toColumn; column++) {\r
            const x = (column + 0.5) * cellX - width / 2;\r
            const [screenX, screenY, w] = apply(view.forward, x, y);\r
            if (tiled) {\r
              if (w <= 0 || w > FAR) continue;\r
              const margin = (0.49 * Math.min(cellX, cellY)) / w;\r
              if (screenX < -margin || screenX > width + margin || screenY < -margin || screenY > height + margin)\r
                continue;\r
            }\r
            found.push({ x, y, column, row, w, distance: Math.hypot(screenX - origin[0], screenY - origin[1]) });\r
          }\r
        }\r
      }\r
      if (found.length > MAX_LINES) {\r
        found.sort((a, b) => a.w - b.w);\r
        found.length = MAX_LINES;\r
      }\r
\r
      const previous = new Map<number, number>();\r
      for (let index = 0; index < count; index++) previous.set(cells[index * 2] * 65536 + cells[index * 2 + 1], index);\r
      const total = found.length;\r
      const next = {\r
        centers: new Float32Array(total * 2),\r
        cells: new Int32Array(total * 2),\r
        reveal: new Float32Array(total),\r
        seeds: new Float32Array(total),\r
        rests: new Float32Array(total),\r
        angles: new Float32Array(total),\r
        speeds: new Float32Array(total),\r
        seenX: new Float32Array(total),\r
        seenY: new Float32Array(total),\r
        pending: new Uint8Array(total)\r
      };\r
      let farthest = 0;\r
      let nearest = Infinity;\r
      let deepest = 0;\r
      const bounds = [Infinity, Infinity, -Infinity, -Infinity];\r
      found.forEach((item, index) => {\r
        next.centers[index * 2] = item.x;\r
        next.centers[index * 2 + 1] = item.y;\r
        next.cells[index * 2] = item.column;\r
        next.cells[index * 2 + 1] = item.row;\r
        next.reveal[index] = item.distance;\r
        next.seeds[index] = seedFor(item.column, item.row);\r
        farthest = Math.max(farthest, item.distance);\r
        nearest = Math.min(nearest, item.w);\r
        deepest = Math.max(deepest, item.w);\r
        bounds[0] = Math.min(bounds[0], item.x);\r
        bounds[1] = Math.min(bounds[1], item.y);\r
        bounds[2] = Math.max(bounds[2], item.x);\r
        bounds[3] = Math.max(bounds[3], item.y);\r
        const old = previous.get(item.column * 65536 + item.row);\r
        if (old === undefined) {\r
          next.pending[index] = 1;\r
          return;\r
        }\r
        next.angles[index] = angles[old];\r
        next.speeds[index] = speeds[old];\r
        next.seenX[index] = seenX[old];\r
        next.seenY[index] = seenY[old];\r
      });\r
\r
      count = total;\r
      ({ centers, cells, reveal, seeds, rests, angles, speeds, seenX, seenY, pending } = next);\r
      state = new Float32Array(total * 4);\r
      field.introSpeed = Math.max(INTRO_SPEED, farthest / INTRO_TIME);\r
      field.bounds = total ? bounds : [0, 0, 0, 0];\r
      field.minScale = total ? 1 / deepest : 1;\r
      field.maxScale = total ? 1 / nearest : 1;\r
      gl.bindBuffer(gl.ARRAY_BUFFER, centerBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, centers, gl.STATIC_DRAW);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, stateBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, state.byteLength || 16, gl.DYNAMIC_DRAW);\r
    };\r
\r
    const rebuild = () => {\r
      const s = settingsRef.current;\r
      const rect = container.getBoundingClientRect();\r
      const width = Math.max(1, rect.width);\r
      const height = Math.max(1, rect.height);\r
      const length = Math.max(1, measure(s.lineHeight));\r
      const thickness = Math.max(0.25, measure(s.lineWidth));\r
      const fill = !s.square;\r
      const tiled = fill && (s.tiltX !== 0 || s.tiltY !== 0);\r
      const view = viewFor(s.tiltX, s.tiltY, width, height, fill);\r
      const ratio = Math.min(window.devicePixelRatio || 1, s.maxRatio);\r
\r
      let columnCount = Math.max(1, Math.round(s.columns || (s.rows ? (s.rows * width) / height : width / s.spacing)));\r
      let rowCount = Math.max(1, Math.round(s.rows || (s.columns ? (s.columns * height) / width : height / s.spacing)));\r
      if (columnCount * rowCount > MAX_LINES) {\r
        const shrink = Math.sqrt((columnCount * rowCount) / MAX_LINES);\r
        columnCount = Math.max(1, Math.floor(columnCount / shrink));\r
        rowCount = Math.max(1, Math.floor(rowCount / shrink));\r
      }\r
\r
      const key = [\r
        fill,\r
        columnCount,\r
        rowCount,\r
        width.toFixed(1),\r
        height.toFixed(1),\r
        tiled ? \`\${s.tiltX},\${s.tiltY}\` : ''\r
      ].join('|');\r
      if (key !== field.key) {\r
        field.key = key;\r
        layout(width, height, view, columnCount, rowCount, tiled);\r
      }\r
\r
      const minScale = fill ? field.minScale : view.minScale;\r
      const maxScale = fill ? field.maxScale : view.maxScale;\r
      const pad = fill ? 0 : Math.ceil((length * (1 + s.stretch) + thickness * 2) * Math.max(1, maxScale) + 8);\r
      const canvasWidth = width + pad * 2;\r
      const canvasHeight = height + pad * 2;\r
      canvas.style.left = \`\${-pad}px\`;\r
      canvas.style.top = \`\${-pad}px\`;\r
      canvas.style.width = \`\${canvasWidth}px\`;\r
      canvas.style.height = \`\${canvasHeight}px\`;\r
      const pixelWidth = Math.max(1, Math.round(canvasWidth * ratio));\r
      const pixelHeight = Math.max(1, Math.round(canvasHeight * ratio));\r
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {\r
        canvas.width = pixelWidth;\r
        canvas.height = pixelHeight;\r
      }\r
      Object.assign(field, {\r
        width,\r
        height,\r
        pad,\r
        ratio,\r
        view,\r
        length,\r
        thickness,\r
        fill,\r
        edgePad: 2 / (ratio * Math.max(0.05, minScale))\r
      });\r
    };\r
\r
    const fieldAngle = (s: Settings, index: number, px: number, py: number) => {\r
      const dx = px - centers[index * 2];\r
      const dy = py - centers[index * 2 + 1];\r
      if (s.mode === 'dipole') {\r
        const distance = Math.hypot(dx, dy) || 1;\r
        const rx = -dx / distance;\r
        const ry = -dy / distance;\r
        const mx = Math.cos(target.heading);\r
        const my = Math.sin(target.heading);\r
        const dot = mx * rx + my * ry;\r
        return Math.atan2(3 * dot * ry - my, 3 * dot * rx - mx);\r
      }\r
      const toward = Math.atan2(dy, dx);\r
      if (s.mode === 'attract') return toward;\r
      if (s.mode === 'spiral') return toward + Math.PI / 4;\r
      return toward + Math.PI / 2;\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (lost) return;\r
      const s = settingsRef.current;\r
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05);\r
      last = Math.max(last, now);\r
      clock += dt;\r
      if (dirty) rebuild();\r
      dirty = false;\r
\r
      const period = s.shape === 'line' ? Math.PI : TAU;\r
      const spread = s.scatter * Math.PI * 0.5;\r
      for (let index = 0; index < count; index++) rests[index] = s.baseAngle + Math.PI / 2 + seeds[index] * spread;\r
\r
      const wandering = s.idle && !reduced && (!pointer.seen || pointer.away > 1.2);\r
      if (pointer.seen && !pointer.inside) pointer.away += dt;\r
      let px = pointer.seen ? pointer.x : 0;\r
      let py = pointer.seen ? pointer.y : 0;\r
      if (wandering) {\r
        const amount = Math.min(field.width, field.height) * 0.32;\r
        px = Math.cos(clock * 0.37) * amount + Math.sin(clock * 0.21) * amount * 0.35;\r
        py = Math.sin(clock * 0.53 + 1.3) * amount * 0.8;\r
      }\r
      const follow = 1 - Math.exp(-dt / (pointer.seen && !wandering ? 0.035 : 0.6));\r
      target.x += (px - target.x) * follow;\r
      target.y += (py - target.y) * follow;\r
      const speed = Math.hypot(pointer.vx, pointer.vy);\r
      if (speed > 40) {\r
        const turn = wrap(Math.atan2(pointer.vy, pointer.vx) - target.heading, TAU);\r
        target.heading += turn * (1 - Math.exp(-dt / 0.25));\r
      }\r
      pointer.vx *= Math.exp(-dt / 0.12);\r
      pointer.vy *= Math.exp(-dt / 0.12);\r
\r
      if (introLive && introStart < 0) introStart = clock;\r
      const introTime = introLive ? clock - introStart : Infinity;\r
      let introBusy = false;\r
\r
      const stiffness = s.inertia <= 0 || reduced ? 0 : Math.pow(6 + 42 * Math.pow(1 - s.inertia, 2), 2);\r
      const damping = stiffness ? 2 * Math.sqrt(stiffness) * (1 - 0.75 * s.bounce) : 0;\r
      const steps = stiffness ? Math.max(1, Math.ceil(dt / (1 / 240))) : 0;\r
      const h = steps ? dt / steps : 0;\r
      const lag = reduced ? 0 : s.ripple / 900;\r
      const radius = s.radius;\r
      const reachIn = s.reach * 0.55;\r
      const reachOut = s.reach;\r
\r
      for (let i = pulses.length - 1; i >= 0; i--) {\r
        const age = clock - pulses[i].start;\r
        if (age > pulses[i].life) pulses.splice(i, 1);\r
      }\r
\r
      let moving = false;\r
      for (let index = 0; index < count; index++) {\r
        const cx = centers[index * 2];\r
        const cy = centers[index * 2 + 1];\r
        const born = pending[index] === 1;\r
        if (born) {\r
          seenX[index] = target.x;\r
          seenY[index] = target.y;\r
        } else {\r
          const distance = Math.hypot(target.x - cx, target.y - cy);\r
          const tau = lag * distance;\r
          const k = tau > 0 ? 1 - Math.exp(-dt / tau) : 1;\r
          seenX[index] += (target.x - seenX[index]) * k;\r
          seenY[index] += (target.y - seenY[index]) * k;\r
          if (Math.abs(target.x - seenX[index]) + Math.abs(target.y - seenY[index]) > 0.05) moving = true;\r
        }\r
        const sx = seenX[index];\r
        const sy = seenY[index];\r
        const near = Math.hypot(sx - cx, sy - cy);\r
        let goal = fieldAngle(s, index, sx, sy);\r
        const rest = rests[index];\r
        if (reachOut > 0) {\r
          const t = clamp((reachOut - near) / Math.max(1, reachOut - reachIn), 0, 1);\r
          goal = rest + wrap(goal - rest, period) * smootherstep(t);\r
        }\r
        let shown = 1;\r
        if (introLive) {\r
          const local = (introTime - reveal[index] / field.introSpeed) / INTRO_SPIN;\r
          const progress = smootherstep(clamp(local, 0, 1));\r
          if (local < 1) introBusy = true;\r
          goal = rest + wrap(goal - rest, period) * progress;\r
          shown = clamp(local * 2.5, 0, 1);\r
        }\r
        if (born) {\r
          angles[index] = introLive ? rest : goal;\r
          speeds[index] = 0;\r
          pending[index] = 0;\r
        } else if (!stiffness) {\r
          angles[index] = angles[index] + wrap(goal - angles[index], period);\r
          speeds[index] = 0;\r
        } else {\r
          let angle = angles[index];\r
          let velocity = speeds[index];\r
          for (let step = 0; step < steps; step++) {\r
            velocity += (stiffness * wrap(goal - angle, period) - damping * velocity) * h;\r
            angle += velocity * h;\r
          }\r
          if (Math.abs(velocity) < 0.002 && Math.abs(wrap(goal - angle, period)) < 0.0005) {\r
            angle += wrap(goal - angle, period);\r
            velocity = 0;\r
          } else moving = true;\r
          if (angle > 40 || angle < -40) angle = wrap(angle, TAU);\r
          angles[index] = angle;\r
          speeds[index] = velocity;\r
        }\r
\r
        let spin = 0;\r
        let flash = 0;\r
        for (const pulse of pulses) {\r
          const travelled = (clock - pulse.start) * PULSE_SPEED;\r
          const gap = Math.hypot(cx - pulse.x, cy - pulse.y);\r
          const local = (travelled - gap) / (PULSE_SPEED * PULSE_SPIN);\r
          if (local > 0 && local < 1) spin += smootherstep(local) * period;\r
          const band = (travelled - gap - PULSE_SPEED * PULSE_SPIN * 0.5) / 60;\r
          flash += Math.exp(-band * band) * Math.max(0, 1 - (clock - pulse.start) / pulse.life);\r
        }\r
\r
        const emphasis = Math.exp(-(near * near) / (radius * radius)) * shown;\r
        state[index * 4] = angles[index] + spin;\r
        state[index * 4 + 1] = emphasis;\r
        state[index * 4 + 2] = Math.min(1, flash * 0.9) * shown;\r
        state[index * 4 + 3] = shown;\r
      }\r
      if (introLive && !introBusy && clock - introStart > 0.2) introLive = false;\r
      if (Math.abs(px - target.x) + Math.abs(py - target.y) > 0.05) moving = true;\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      if (count && field.view) {\r
        const u = program.uniforms;\r
        gl.useProgram(program.program);\r
        gl.uniformMatrix3fv(u.uView, true, field.view.forward);\r
        gl.uniform2f(u.uCanvas, field.width + field.pad * 2, field.height + field.pad * 2);\r
        gl.uniform2f(u.uOffset, field.pad, field.pad);\r
        gl.uniform2f(u.uLine, field.length / 2, field.thickness / 2);\r
        gl.uniform1f(u.uStretch, s.stretch);\r
        gl.uniform1f(u.uHead, s.shape === 'needle' ? 0.16 : s.shape === 'arrow' ? 0.32 : 0);\r
        gl.uniform1f(u.uPad, field.edgePad);\r
        gl.uniform1f(u.uFar, field.fill ? FAR : 1e6);\r
        gl.uniform3fv(u.uColor, s.color);\r
        gl.uniform3fv(u.uAccent, s.accent);\r
        gl.uniform1f(u.uAccentMix, s.accentMix);\r
        gl.uniform1f(u.uOpacity, 1);\r
        gl.uniform1f(u.uFade, s.fade);\r
        gl.uniform1i(u.uShape, SHAPES[s.shape]);\r
        gl.uniform1f(u.uRainbow, s.rainbow ? 1 : 0);\r
        gl.uniform1f(u.uTone, s.tone);\r
        gl.uniform1f(u.uPeriod, period);\r
        gl.uniform2f(u.uPixels, canvas.width, canvas.height);\r
        gl.uniform2f(u.uEdge, s.edgeFade * 0.34 * field.width, s.edgeFade * 0.44 * field.height);\r
        gl.bindVertexArray(vao);\r
        gl.bindBuffer(gl.ARRAY_BUFFER, stateBuffer);\r
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, state);\r
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, count);\r
      }\r
\r
      const busy = moving || introLive || pulses.length > 0 || wandering;\r
      if (busy && visible && pageVisible) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (raf || lost || !visible || !pageVisible) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
    wakeRef.current = () => {\r
      dirty = true;\r
      wake();\r
    };\r
\r
    const toPlane = (clientX: number, clientY: number) => {\r
      if (!field.view) return null;\r
      const rect = container.getBoundingClientRect();\r
      const [x, y, w] = apply(field.view.inverse, clientX - rect.left, clientY - rect.top);\r
      if (w <= 0) return null;\r
      const inside = clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;\r
      return { x, y, inside };\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const spot = toPlane(event.clientX, event.clientY);\r
      if (!spot) return;\r
      const now = performance.now();\r
      const dt = Math.max(1, now - pointer.time) / 1000;\r
      if (pointer.seen && dt < 0.2) {\r
        pointer.vx = pointer.vx * 0.6 + ((spot.x - pointer.x) / dt) * 0.4;\r
        pointer.vy = pointer.vy * 0.6 + ((spot.y - pointer.y) / dt) * 0.4;\r
      }\r
      pointer.time = now;\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.seen = true;\r
      pointer.inside = spot.inside;\r
      if (spot.inside) pointer.away = 0;\r
      wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      onPointerMove(event);\r
      const s = settingsRef.current;\r
      if (!s.clickPulse || reduced || !count) return;\r
      const spot = toPlane(event.clientX, event.clientY);\r
      if (!spot) return;\r
      const inside = field.fill\r
        ? spot.inside\r
        : Math.abs(spot.x) <= field.width / 2 && Math.abs(spot.y) <= field.height / 2;\r
      if (!inside) return;\r
      const [minX, minY, maxX, maxY] = field.bounds;\r
      const farthest = Math.max(\r
        Math.hypot(spot.x - minX, spot.y - minY),\r
        Math.hypot(spot.x - maxX, spot.y - minY),\r
        Math.hypot(spot.x - minX, spot.y - maxY),\r
        Math.hypot(spot.x - maxX, spot.y - maxY)\r
      );\r
      pulses.push({\r
        x: spot.x,\r
        y: spot.y,\r
        start: clock,\r
        life: Math.min(6, farthest / PULSE_SPEED + PULSE_SPIN + 0.1)\r
      });\r
      if (pulses.length > 6) pulses.shift();\r
      wake();\r
    };\r
\r
    const onLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
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
      dirty = true;\r
      wake();\r
    });\r
    resizeObserver.observe(container);\r
    const onResize = () => {\r
      dirty = true;\r
      wake();\r
    };\r
    window.addEventListener('resize', onResize);\r
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
    wake();\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('resize', onResize);\r
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      canvas.removeEventListener('webglcontextlost', onLost);\r
      canvas.removeEventListener('webglcontextrestored', onRestored);\r
      if (!gl.isContextLost()) {\r
        gl.deleteBuffer(cornerBuffer);\r
        gl.deleteBuffer(centerBuffer);\r
        gl.deleteBuffer(stateBuffer);\r
        gl.deleteVertexArray(vao);\r
        gl.deleteProgram(program.program);\r
      }\r
    };\r
  }, [generation]);\r
\r
  return (\r
    <div\r
      ref={containerRef}\r
      className={\`relative \${square ? 'aspect-square max-w-full' : 'h-full w-full overflow-hidden'}\${className ? \` \${className}\` : ''}\`}\r
      style={square ? { width: size, ...style } : style}\r
    >\r
      <canvas ref={canvasRef} className="pointer-events-none absolute block" aria-hidden="true" />\r
      <span ref={probeRef} className="pointer-events-none invisible absolute left-0 top-0 h-0" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default MagnetLines;\r
`,i={usage:`import MagnetLines from './MagnetLines';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <MagnetLines
    lineColor="#efefef"
    spacing={30}
    lineWidth={2}
    lineHeight={18}
    mode="orbit"
    shape="line"
    radius={200}
    fade={0.65}
  />
</div>`,code:n,css:r,tailwind:e,tsCode:t,tsTailwind:a};export{i as magnetLines};
