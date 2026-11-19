const n=`'use client';\r
\r
import { useEffect, useRef, useState } from 'react';\r
import './Antigravity.css';\r
\r
const PIXEL_BUDGET = 2.4e6;\r
const WORLD_HEIGHT = 31.5;\r
const PALETTE_SIZE = 256;\r
const DEFAULT_COLORS = ['#5227FF', '#FF9FFC', '#B497CF'];\r
const SHAPES = { capsule: 0, sphere: 1, box: 2, tetrahedron: 3 };\r
const COLOR_MODES = { conic: 0, radial: 1, random: 2 };\r
\r
const VERTEX = \`#version 300 es\r
precision highp float;\r
layout(location = 0) in vec2 aCorner;\r
layout(location = 1) in vec4 aParticle;\r
layout(location = 2) in vec4 aSeed;\r
uniform vec2 uSize;\r
uniform float uPixel;\r
uniform vec2 uCursor;\r
uniform float uRing;\r
uniform float uBand;\r
uniform float uParticle;\r
uniform float uAmbient;\r
uniform float uTime;\r
uniform float uPulse;\r
uniform float uVariance;\r
uniform float uDepth;\r
uniform float uShape;\r
uniform float uColorMode;\r
uniform float uStops;\r
uniform float uHue;\r
uniform float uReveal;\r
uniform float uStreak;\r
uniform float uCharge;\r
out vec2 vLocal;\r
out vec2 vBounds;\r
out float vU;\r
out float vAlpha;\r
out float vSoft;\r
\r
void main() {\r
  vec2 rel = aParticle.xy - uCursor;\r
  float dist = length(rel);\r
  vec2 radial = dist > 1e-3 ? rel / dist : vec2(1.0, 0.0);\r
  vec2 dir = radial;\r
  float speed = length(aParticle.zw);\r
  float streak = clamp(speed / uStreak, 0.0, 2.5);\r
  if (speed > 1e-3) {\r
    vec2 heading = aParticle.zw / speed * sign(dot(aParticle.zw, radial) + 1e-4);\r
    dir = normalize(mix(radial, heading, smoothstep(0.0, 1.0, streak)));\r
  }\r
  float ring = exp(-pow((dist - uRing) / uBand, 2.0));\r
  float z = aSeed.x;\r
  float depth = 1.0 + z * 0.32 * uDepth;\r
  float pulse = 1.0 + sin(uTime * uPulse + aSeed.y) * 0.22 * uVariance;\r
  float grow = uAmbient + (1.0 - uAmbient) * ring;\r
  float size = uParticle * depth * pulse * (0.85 + 0.3 * aSeed.w) * (1.0 + uCharge * 0.25 * ring);\r
  vec2 bounds;\r
  if (uShape < 0.5) {\r
    float width = size * 0.17 * mix(0.55, 1.0, ring);\r
    bounds = vec2(max(width, size * 0.5 * grow) * (1.0 + streak * 1.2), width);\r
  } else if (uShape < 1.5) {\r
    bounds = vec2(size * 0.22 * mix(0.45, 1.0, grow));\r
  } else {\r
    bounds = vec2(size * 0.26 * mix(0.45, 1.0, grow));\r
  }\r
  float soft = 1.0 + max(-z, 0.0) * 1.6 * uDepth;\r
  vec2 local = aCorner * (bounds + soft * 1.5 / uPixel);\r
  vec2 world = aParticle.xy + dir * local.x + vec2(-dir.y, dir.x) * local.y;\r
  gl_Position = vec4(world.x / uSize.x * 2.0 - 1.0, 1.0 - world.y / uSize.y * 2.0, 0.0, 1.0);\r
  vLocal = local * uPixel;\r
  vBounds = bounds * uPixel;\r
  vSoft = soft;\r
  if (uColorMode < 0.5) {\r
    vU = atan(radial.y, radial.x) / 6.28318530718 + uHue + (aSeed.z - 0.5) * 0.06;\r
  } else if (uColorMode < 1.5) {\r
    vU = clamp(dist / (uRing * 2.4), 0.0, 1.0) + (aSeed.z - 0.5) * 0.06;\r
  } else {\r
    vU = floor(aSeed.z * uStops) / max(uStops - 1.0, 1.0);\r
  }\r
  float fog = 1.0 - max(-z, 0.0) * 0.35 * uDepth;\r
  vAlpha = mix(uAmbient, 1.0, ring) * fog * uReveal;\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uPalette;\r
uniform float uShape;\r
uniform float uColorMode;\r
uniform float uOpacity;\r
in vec2 vLocal;\r
in vec2 vBounds;\r
in float vU;\r
in float vAlpha;\r
in float vSoft;\r
out vec4 fragColor;\r
\r
void main() {\r
  vec2 p = vLocal;\r
  float d;\r
  if (uShape < 0.5) {\r
    float r = vBounds.y;\r
    d = length(vec2(max(abs(p.x) - max(vBounds.x - r, 0.0), 0.0), p.y)) - r;\r
  } else if (uShape < 1.5) {\r
    d = length(p) - vBounds.x;\r
  } else if (uShape < 2.5) {\r
    float r = vBounds.x * 0.28;\r
    vec2 q = abs(p) - (vBounds - r);\r
    d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;\r
  } else {\r
    float r = vBounds.x * 1.15;\r
    vec2 q = vec2(r * 0.5774 - p.x, abs(p.y));\r
    d = max(dot(q, vec2(0.5, 0.8660254)) - r * 0.5, -q.x - r * 0.5) * 1.2;\r
  }\r
  float alpha = clamp(0.5 - d / vSoft, 0.0, 1.0) * vAlpha * uOpacity;\r
  if (alpha < 0.002) discard;\r
  vec3 color = texture(uPalette, vec2(uColorMode < 0.5 ? fract(vU) : vU, uColorMode < 0.5 ? 0.25 : 0.75)).rgb;\r
  fragColor = vec4(color * alpha, alpha);\r
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
const toSrgb = channel =>\r
  channel <= 0.0031308 ? channel * 12.92 : 1.055 * Math.pow(Math.max(channel, 0), 1 / 2.4) - 0.055;\r
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
const fromOklab = ([L, a, b]) => {\r
  const l = Math.pow(L + 0.3963377774 * a + 0.2158037573 * b, 3);\r
  const m = Math.pow(L - 0.1055613458 * a - 0.0638541728 * b, 3);\r
  const s = Math.pow(L - 0.0894841775 * a - 1.291485548 * b, 3);\r
  return [\r
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,\r
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,\r
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s\r
  ].map(channel => clamp(toSrgb(channel), 0, 1));\r
};\r
\r
const buildPalette = (colors, light) => {\r
  const stops = [];\r
  colors.forEach(color => {\r
    const parsed = parseColor(color);\r
    if (!parsed) return;\r
    const lab = toOklab(parsed);\r
    const hue = (Math.atan2(lab[2], lab[1]) * 180) / Math.PI;\r
    const warmth = clamp(1 - Math.abs(hue - 85) / 40, 0, 1);\r
    const ceiling = 0.62 + 0.14 * warmth * warmth * (3 - 2 * warmth);\r
    if (light && lab[0] > ceiling) {\r
      const boost = 1 + (lab[0] - ceiling) * 1.6;\r
      stops.push([ceiling, lab[1] * boost, lab[2] * boost]);\r
    } else {\r
      stops.push(lab);\r
    }\r
  });\r
  if (!stops.length) stops.push(toOklab(light ? [0.1, 0.1, 0.12] : [1, 1, 1]));\r
  const data = new Uint8Array(PALETTE_SIZE * 2 * 4);\r
  const rows = [[...stops, stops[0]], stops.length > 1 ? stops : [stops[0], stops[0]]];\r
  rows.forEach((row, index) => {\r
    for (let x = 0; x < PALETTE_SIZE; x++) {\r
      const t = (x / (PALETTE_SIZE - (index === 0 ? 0 : 1))) * (row.length - 1);\r
      const from = Math.min(Math.floor(t), row.length - 2);\r
      const k = t - from;\r
      const eased = k * k * (3 - 2 * k);\r
      const start = row[from];\r
      const end = row[from + 1];\r
      const chroma = Math.hypot(start[1], start[2]) * (1 - eased) + Math.hypot(end[1], end[2]) * eased;\r
      const a = start[1] + (end[1] - start[1]) * eased;\r
      const b = start[2] + (end[2] - start[2]) * eased;\r
      const length = Math.hypot(a, b);\r
      const scale = length > 1e-4 ? chroma / length : 0;\r
      const color = fromOklab([start[0] + (end[0] - start[0]) * eased, a * scale, b * scale]);\r
      for (let channel = 0; channel < 3; channel++) {\r
        data[(index * PALETTE_SIZE + x) * 4 + channel] = Math.round(color[channel] * 255);\r
      }\r
      data[(index * PALETTE_SIZE + x) * 4 + 3] = 255;\r
    }\r
  });\r
  return data;\r
};\r
\r
const random = seed => () => {\r
  seed |= 0;\r
  seed = (seed + 0x6d2b79f5) | 0;\r
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);\r
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;\r
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\r
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
const Antigravity = ({\r
  count = 1500,\r
  magnetRadius = 9,\r
  ringRadius = 7,\r
  waveSpeed = 0.4,\r
  waveAmplitude = 1,\r
  waveCount = 3,\r
  particleSize = 0.9,\r
  lerpSpeed = 0.05,\r
  color,\r
  colors = DEFAULT_COLORS,\r
  colorMode = 'conic',\r
  colorSpeed = 0.05,\r
  autoAnimate = true,\r
  particleVariance = 1,\r
  rotationSpeed = 0,\r
  depthFactor = 1,\r
  pulseSpeed = 3,\r
  particleShape = 'capsule',\r
  fieldStrength = 10,\r
  ambient = 0.25,\r
  interactive = true,\r
  clickBurst = true,\r
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
  const palette = color ? [color] : Array.isArray(colors) && colors.length ? colors : DEFAULT_COLORS;\r
\r
  const settings = {\r
    count: clamp(Math.round(count), 1, 20000),\r
    magnet: Math.max(0, magnetRadius),\r
    ring: Math.max(0, ringRadius),\r
    waveSpeed,\r
    waveAmplitude: Math.max(0, waveAmplitude),\r
    waveCount: Math.max(0, Math.round(waveCount)),\r
    size: Math.max(0, particleSize),\r
    follow: clamp(lerpSpeed, 0.001, 1),\r
    palette,\r
    paletteKey: \`\${palette.join(',')}|\${lightMode}\`,\r
    colorMode: COLOR_MODES[colorMode] ?? COLOR_MODES.conic,\r
    colorSpeed,\r
    autoAnimate,\r
    variance: Math.max(0, particleVariance),\r
    rotation: rotationSpeed,\r
    depth: Math.max(0, depthFactor),\r
    pulse: pulseSpeed,\r
    shape: SHAPES[particleShape] ?? SHAPES.capsule,\r
    tightness: Math.max(0, fieldStrength),\r
    ambient: clamp(ambient, 0, 1),\r
    interactive,\r
    clickBurst,\r
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
    gl.bindVertexArray(vao);\r
    const cornerBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    const particleBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, particleBuffer);\r
    gl.enableVertexAttribArray(1);\r
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 0, 0);\r
    gl.vertexAttribDivisor(1, 1);\r
    const seedBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, seedBuffer);\r
    gl.enableVertexAttribArray(2);\r
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, 0);\r
    gl.vertexAttribDivisor(2, 1);\r
\r
    const paletteTexture = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, paletteTexture);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
\r
    const size = { width: 1, height: 1, ratio: 1 };\r
    const cursor = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, ready: false };\r
    const pointer = { x: 0, y: 0, inside: false, down: false, moved: -Infinity };\r
    let field = null;\r
    let paletteKey = '';\r
    let time = 0;\r
    let hue = 0;\r
    let charge = 0;\r
    let introClock = settingsRef.current.intro && !reduced && generation === 0 ? 0 : Infinity;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let pageVisible = document.visibilityState !== 'hidden';\r
    let lost = false;\r
\r
    const updatePalette = s => {\r
      if (s.paletteKey === paletteKey) return;\r
      paletteKey = s.paletteKey;\r
      gl.bindTexture(gl.TEXTURE_2D, paletteTexture);\r
      gl.texImage2D(\r
        gl.TEXTURE_2D,\r
        0,\r
        gl.RGBA8,\r
        PALETTE_SIZE,\r
        2,\r
        0,\r
        gl.RGBA,\r
        gl.UNSIGNED_BYTE,\r
        buildPalette(s.palette, s.light)\r
      );\r
    };\r
\r
    const buildField = (total, width, height, previous) => {\r
      const rand = random(1337);\r
      const margin = 0.06;\r
      const spanX = width * (1 + margin * 2);\r
      const spanY = height * (1 + margin * 2);\r
      const cols = Math.max(1, Math.ceil(Math.sqrt((total * spanX) / spanY)));\r
      const rows = Math.max(1, Math.ceil(total / cols));\r
      const cells = Array.from({ length: cols * rows }, (_, index) => index);\r
      for (let index = cells.length - 1; index > 0; index--) {\r
        const swap = Math.floor(rand() * (index + 1));\r
        [cells[index], cells[swap]] = [cells[swap], cells[index]];\r
      }\r
      const depths = Array.from({ length: total }, () => rand() * 2 - 1).sort((a, b) => a - b);\r
      const next = {\r
        total,\r
        width,\r
        height,\r
        homeX: new Float32Array(total),\r
        homeY: new Float32Array(total),\r
        band: new Float32Array(total),\r
        phase: new Float32Array(total),\r
        agility: new Float32Array(total),\r
        delay: new Float32Array(total),\r
        orbit: new Float32Array(total),\r
        x: new Float32Array(total),\r
        y: new Float32Array(total),\r
        vx: new Float32Array(total),\r
        vy: new Float32Array(total),\r
        particles: new Float32Array(total * 4),\r
        seeds: new Float32Array(total * 4)\r
      };\r
      for (let index = 0; index < total; index++) {\r
        const cell = cells[index];\r
        const hx = -width * margin + (((cell % cols) + 0.5 + (rand() - 0.5) * 0.85) / cols) * spanX;\r
        const hy = -height * margin + ((Math.floor(cell / cols) + 0.5 + (rand() - 0.5) * 0.85) / rows) * spanY;\r
        next.homeX[index] = hx;\r
        next.homeY[index] = hy;\r
        next.band[index] = rand() * 2 - 1;\r
        next.phase[index] = rand() * Math.PI * 2;\r
        next.agility[index] = 0.75 + rand() * 0.5;\r
        next.delay[index] = rand();\r
        if (previous && index < previous.total) {\r
          next.x[index] = (previous.x[index] / previous.width) * width;\r
          next.y[index] = (previous.y[index] / previous.height) * height;\r
          next.vx[index] = previous.vx[index];\r
          next.vy[index] = previous.vy[index];\r
          next.orbit[index] = previous.orbit[index];\r
        } else {\r
          next.x[index] = hx;\r
          next.y[index] = introClock === 0 ? hy + height * (0.45 + next.delay[index] * 0.4) : hy;\r
        }\r
        next.seeds[index * 4] = depths[index];\r
        next.seeds[index * 4 + 1] = next.phase[index];\r
        next.seeds[index * 4 + 2] = rand();\r
        next.seeds[index * 4 + 3] = rand();\r
      }\r
      gl.bindBuffer(gl.ARRAY_BUFFER, seedBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, next.seeds, gl.STATIC_DRAW);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, particleBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, next.particles.byteLength, gl.DYNAMIC_DRAW);\r
      return next;\r
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
      if (!cursor.ready) {\r
        cursor.x = cursor.tx = cssWidth / 2;\r
        cursor.y = cursor.ty = cssHeight / 2;\r
        cursor.ready = true;\r
      }\r
      if (\r
        !field ||\r
        field.total !== s.count ||\r
        Math.abs(field.width - cssWidth) > 0.5 ||\r
        Math.abs(field.height - cssHeight) > 0.5\r
      ) {\r
        field = buildField(s.count, cssWidth, cssHeight, field);\r
      }\r
    };\r
\r
    const simulate = (s, dt) => {\r
      if (!field) return;\r
      const unit = size.height / WORLD_HEIGHT;\r
      const ringPx = s.ring * unit * (1 - 0.38 * charge);\r
      const magnetPx = Math.max(s.magnet * unit, 1);\r
      const spread = (5 / (s.tightness + 0.1)) * unit;\r
      const wavePx = s.waveAmplitude * unit * 0.5;\r
      const omegaBase = 2.2 + s.follow * 80;\r
      const spinRate = (s.rotation + charge * 3) * (reduced ? 0.3 : 1);\r
      const centerX = size.width / 2;\r
      const centerY = size.height / 2;\r
      const edge = magnetPx * 0.18;\r
      const { homeX, homeY, band, phase, agility, delay, orbit, x, y, vx, vy, particles, seeds, total } = field;\r
      for (let index = 0; index < total; index++) {\r
        const parallax = 1 - seeds[index * 4] * 0.12 * s.depth;\r
        const cx = centerX + (cursor.x - centerX) * parallax;\r
        const cy = centerY + (cursor.y - centerY) * parallax;\r
        const hx = homeX[index];\r
        const hy = homeY[index] + Math.sin(time * 0.7 + phase[index]) * unit * 0.12 * s.waveAmplitude;\r
        const dx = hx - cx;\r
        const dy = hy - cy;\r
        const dist = Math.sqrt(dx * dx + dy * dy);\r
        const capture = 1 - clamp((dist - (magnetPx - edge)) / (edge * 2), 0, 1);\r
        const ease = capture * capture * (3 - 2 * capture);\r
        let turn = orbit[index] + spinRate * ease * dt;\r
        turn -= Math.atan2(Math.sin(turn), Math.cos(turn)) * (1 - ease) * Math.min(1, dt * 2.5);\r
        orbit[index] = turn;\r
        let tx = hx;\r
        let ty = hy;\r
        if (ease > 0 || Math.abs(turn) > 1e-4) {\r
          const angle = Math.atan2(dy, dx) + turn;\r
          const wave =\r
            wavePx *\r
            (0.6 * Math.sin(angle * s.waveCount - time * s.waveSpeed * 2) +\r
              0.4 * Math.sin(phase[index] + time * s.waveSpeed * 1.3));\r
          const radius = dist + (ringPx + wave + band[index] * spread - dist) * ease;\r
          tx = cx + Math.cos(angle) * radius;\r
          ty = cy + Math.sin(angle) * radius;\r
        }\r
        const omega = introClock < delay[index] * 0.9 ? 0 : omegaBase * agility[index];\r
        const damping = 1.64 * omega;\r
        const stiffness = omega * omega;\r
        const steps = Math.min(4, Math.max(1, Math.ceil(omega * dt * 2)));\r
        const h = dt / steps;\r
        for (let step = 0; step < steps; step++) {\r
          vx[index] += ((tx - x[index]) * stiffness - vx[index] * damping) * h;\r
          vy[index] += ((ty - y[index]) * stiffness - vy[index] * damping) * h;\r
          x[index] += vx[index] * h;\r
          y[index] += vy[index] * h;\r
        }\r
        particles[index * 4] = x[index];\r
        particles[index * 4 + 1] = y[index];\r
        particles[index * 4 + 2] = vx[index];\r
        particles[index * 4 + 3] = vy[index];\r
      }\r
    };\r
\r
    const burst = (s, strength) => {\r
      if (!field) return;\r
      const unit = size.height / WORLD_HEIGHT;\r
      const reach = Math.max(s.magnet, s.ring) * unit * 1.8;\r
      const { x, y, vx, vy, agility, total } = field;\r
      for (let index = 0; index < total; index++) {\r
        const dx = x[index] - cursor.x;\r
        const dy = y[index] - cursor.y;\r
        const dist = Math.sqrt(dx * dx + dy * dy) + 1e-3;\r
        const kick = unit * 110 * strength * Math.exp(-Math.pow(dist / reach, 2)) * agility[index];\r
        vx[index] += (dx / dist) * kick;\r
        vy[index] += (dy / dist) * kick;\r
      }\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (lost || !field) return;\r
      const s = settingsRef.current;\r
      updatePalette(s);\r
      const dt = clamp((now - last) / 1000 || 0, 0, 1 / 30);\r
      last = Math.max(last, now);\r
      const pace = reduced ? 0.3 : 1;\r
      time += dt * pace;\r
      hue += dt * s.colorSpeed * pace;\r
      if (introClock < 3) introClock += dt;\r
      charge = pointer.down ? Math.min(1, charge + dt / 0.9) : Math.max(0, charge - dt * 4);\r
\r
      const idle = performance.now() - pointer.moved > 2000 || !pointer.inside;\r
      if (s.autoAnimate && !reduced && (idle || !s.interactive)) {\r
        cursor.tx = size.width / 2 + Math.sin(time * 0.5) * (size.width / 4);\r
        cursor.ty = size.height / 2 + Math.cos(time) * (size.height / 4);\r
      } else if (s.interactive && pointer.inside) {\r
        cursor.tx = pointer.x;\r
        cursor.ty = pointer.y;\r
      }\r
      cursor.vx += ((cursor.tx - cursor.x) * 49 - cursor.vx * 14) * dt;\r
      cursor.vy += ((cursor.ty - cursor.y) * 49 - cursor.vy * 14) * dt;\r
      cursor.x += cursor.vx * dt;\r
      cursor.y += cursor.vy * dt;\r
\r
      simulate(s, dt);\r
\r
      const unit = size.height / WORLD_HEIGHT;\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      gl.useProgram(shader.program);\r
      gl.bindVertexArray(vao);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, particleBuffer);\r
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, field.particles);\r
      const u = shader.uniforms;\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, paletteTexture);\r
      gl.uniform1i(u.uPalette, 0);\r
      gl.uniform2f(u.uSize, size.width, size.height);\r
      gl.uniform1f(u.uPixel, size.ratio);\r
      gl.uniform2f(u.uCursor, cursor.x, cursor.y);\r
      gl.uniform1f(u.uRing, s.ring * unit * (1 - 0.38 * charge));\r
      gl.uniform1f(u.uBand, Math.max(unit * 6, 1));\r
      gl.uniform1f(u.uParticle, s.size * unit * 0.6);\r
      gl.uniform1f(u.uAmbient, s.ambient);\r
      gl.uniform1f(u.uTime, time);\r
      gl.uniform1f(u.uPulse, s.pulse);\r
      gl.uniform1f(u.uVariance, s.variance);\r
      gl.uniform1f(u.uDepth, s.depth);\r
      gl.uniform1f(u.uShape, s.shape);\r
      gl.uniform1f(u.uColorMode, s.colorMode);\r
      gl.uniform1f(u.uStops, s.palette.length);\r
      gl.uniform1f(u.uHue, hue);\r
      gl.uniform1f(u.uReveal, introClock < 3 ? clamp(introClock / 0.6, 0, 1) : 1);\r
      gl.uniform1f(u.uStreak, unit * 30);\r
      gl.uniform1f(u.uCharge, charge);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, field.total);\r
\r
      if (visible && pageVisible) raf = requestAnimationFrame(frame);\r
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
      pointer.inside = spot.inside;\r
      if (!spot.inside) return;\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.moved = performance.now();\r
    };\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      const spot = locate(event);\r
      if (!spot.inside || !s.interactive) return;\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = true;\r
      pointer.moved = performance.now();\r
      if (s.clickBurst && !reduced) pointer.down = true;\r
    };\r
    const onPointerUp = event => {\r
      if (pointer.down) burst(settingsRef.current, 0.45 + charge);\r
      pointer.down = false;\r
      if (event.pointerType !== 'mouse') pointer.inside = false;\r
    };\r
    const onLeave = () => {\r
      pointer.inside = false;\r
      pointer.down = false;\r
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
        gl.deleteBuffer(cornerBuffer);\r
        gl.deleteBuffer(particleBuffer);\r
        gl.deleteBuffer(seedBuffer);\r
        gl.deleteTexture(paletteTexture);\r
        gl.deleteVertexArray(vao);\r
        gl.deleteProgram(shader.program);\r
      }\r
    };\r
  }, [generation]);\r
\r
  return (\r
    <div ref={containerRef} className={\`antigravity\${className ? \` \${className}\` : ''}\`} style={style}>\r
      <canvas ref={canvasRef} className="antigravity__canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Antigravity;\r
`,r=`.antigravity {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.antigravity__canvas {\r
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
const PIXEL_BUDGET = 2.4e6;\r
const WORLD_HEIGHT = 31.5;\r
const PALETTE_SIZE = 256;\r
const DEFAULT_COLORS = ['#5227FF', '#FF9FFC', '#B497CF'];\r
const SHAPES = { capsule: 0, sphere: 1, box: 2, tetrahedron: 3 };\r
const COLOR_MODES = { conic: 0, radial: 1, random: 2 };\r
\r
const VERTEX = \`#version 300 es\r
precision highp float;\r
layout(location = 0) in vec2 aCorner;\r
layout(location = 1) in vec4 aParticle;\r
layout(location = 2) in vec4 aSeed;\r
uniform vec2 uSize;\r
uniform float uPixel;\r
uniform vec2 uCursor;\r
uniform float uRing;\r
uniform float uBand;\r
uniform float uParticle;\r
uniform float uAmbient;\r
uniform float uTime;\r
uniform float uPulse;\r
uniform float uVariance;\r
uniform float uDepth;\r
uniform float uShape;\r
uniform float uColorMode;\r
uniform float uStops;\r
uniform float uHue;\r
uniform float uReveal;\r
uniform float uStreak;\r
uniform float uCharge;\r
out vec2 vLocal;\r
out vec2 vBounds;\r
out float vU;\r
out float vAlpha;\r
out float vSoft;\r
\r
void main() {\r
  vec2 rel = aParticle.xy - uCursor;\r
  float dist = length(rel);\r
  vec2 radial = dist > 1e-3 ? rel / dist : vec2(1.0, 0.0);\r
  vec2 dir = radial;\r
  float speed = length(aParticle.zw);\r
  float streak = clamp(speed / uStreak, 0.0, 2.5);\r
  if (speed > 1e-3) {\r
    vec2 heading = aParticle.zw / speed * sign(dot(aParticle.zw, radial) + 1e-4);\r
    dir = normalize(mix(radial, heading, smoothstep(0.0, 1.0, streak)));\r
  }\r
  float ring = exp(-pow((dist - uRing) / uBand, 2.0));\r
  float z = aSeed.x;\r
  float depth = 1.0 + z * 0.32 * uDepth;\r
  float pulse = 1.0 + sin(uTime * uPulse + aSeed.y) * 0.22 * uVariance;\r
  float grow = uAmbient + (1.0 - uAmbient) * ring;\r
  float size = uParticle * depth * pulse * (0.85 + 0.3 * aSeed.w) * (1.0 + uCharge * 0.25 * ring);\r
  vec2 bounds;\r
  if (uShape < 0.5) {\r
    float width = size * 0.17 * mix(0.55, 1.0, ring);\r
    bounds = vec2(max(width, size * 0.5 * grow) * (1.0 + streak * 1.2), width);\r
  } else if (uShape < 1.5) {\r
    bounds = vec2(size * 0.22 * mix(0.45, 1.0, grow));\r
  } else {\r
    bounds = vec2(size * 0.26 * mix(0.45, 1.0, grow));\r
  }\r
  float soft = 1.0 + max(-z, 0.0) * 1.6 * uDepth;\r
  vec2 local = aCorner * (bounds + soft * 1.5 / uPixel);\r
  vec2 world = aParticle.xy + dir * local.x + vec2(-dir.y, dir.x) * local.y;\r
  gl_Position = vec4(world.x / uSize.x * 2.0 - 1.0, 1.0 - world.y / uSize.y * 2.0, 0.0, 1.0);\r
  vLocal = local * uPixel;\r
  vBounds = bounds * uPixel;\r
  vSoft = soft;\r
  if (uColorMode < 0.5) {\r
    vU = atan(radial.y, radial.x) / 6.28318530718 + uHue + (aSeed.z - 0.5) * 0.06;\r
  } else if (uColorMode < 1.5) {\r
    vU = clamp(dist / (uRing * 2.4), 0.0, 1.0) + (aSeed.z - 0.5) * 0.06;\r
  } else {\r
    vU = floor(aSeed.z * uStops) / max(uStops - 1.0, 1.0);\r
  }\r
  float fog = 1.0 - max(-z, 0.0) * 0.35 * uDepth;\r
  vAlpha = mix(uAmbient, 1.0, ring) * fog * uReveal;\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uPalette;\r
uniform float uShape;\r
uniform float uColorMode;\r
uniform float uOpacity;\r
in vec2 vLocal;\r
in vec2 vBounds;\r
in float vU;\r
in float vAlpha;\r
in float vSoft;\r
out vec4 fragColor;\r
\r
void main() {\r
  vec2 p = vLocal;\r
  float d;\r
  if (uShape < 0.5) {\r
    float r = vBounds.y;\r
    d = length(vec2(max(abs(p.x) - max(vBounds.x - r, 0.0), 0.0), p.y)) - r;\r
  } else if (uShape < 1.5) {\r
    d = length(p) - vBounds.x;\r
  } else if (uShape < 2.5) {\r
    float r = vBounds.x * 0.28;\r
    vec2 q = abs(p) - (vBounds - r);\r
    d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;\r
  } else {\r
    float r = vBounds.x * 1.15;\r
    vec2 q = vec2(r * 0.5774 - p.x, abs(p.y));\r
    d = max(dot(q, vec2(0.5, 0.8660254)) - r * 0.5, -q.x - r * 0.5) * 1.2;\r
  }\r
  float alpha = clamp(0.5 - d / vSoft, 0.0, 1.0) * vAlpha * uOpacity;\r
  if (alpha < 0.002) discard;\r
  vec3 color = texture(uPalette, vec2(uColorMode < 0.5 ? fract(vU) : vU, uColorMode < 0.5 ? 0.25 : 0.75)).rgb;\r
  fragColor = vec4(color * alpha, alpha);\r
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
const toSrgb = channel =>\r
  channel <= 0.0031308 ? channel * 12.92 : 1.055 * Math.pow(Math.max(channel, 0), 1 / 2.4) - 0.055;\r
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
const fromOklab = ([L, a, b]) => {\r
  const l = Math.pow(L + 0.3963377774 * a + 0.2158037573 * b, 3);\r
  const m = Math.pow(L - 0.1055613458 * a - 0.0638541728 * b, 3);\r
  const s = Math.pow(L - 0.0894841775 * a - 1.291485548 * b, 3);\r
  return [\r
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,\r
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,\r
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s\r
  ].map(channel => clamp(toSrgb(channel), 0, 1));\r
};\r
\r
const buildPalette = (colors, light) => {\r
  const stops = [];\r
  colors.forEach(color => {\r
    const parsed = parseColor(color);\r
    if (!parsed) return;\r
    const lab = toOklab(parsed);\r
    const hue = (Math.atan2(lab[2], lab[1]) * 180) / Math.PI;\r
    const warmth = clamp(1 - Math.abs(hue - 85) / 40, 0, 1);\r
    const ceiling = 0.62 + 0.14 * warmth * warmth * (3 - 2 * warmth);\r
    if (light && lab[0] > ceiling) {\r
      const boost = 1 + (lab[0] - ceiling) * 1.6;\r
      stops.push([ceiling, lab[1] * boost, lab[2] * boost]);\r
    } else {\r
      stops.push(lab);\r
    }\r
  });\r
  if (!stops.length) stops.push(toOklab(light ? [0.1, 0.1, 0.12] : [1, 1, 1]));\r
  const data = new Uint8Array(PALETTE_SIZE * 2 * 4);\r
  const rows = [[...stops, stops[0]], stops.length > 1 ? stops : [stops[0], stops[0]]];\r
  rows.forEach((row, index) => {\r
    for (let x = 0; x < PALETTE_SIZE; x++) {\r
      const t = (x / (PALETTE_SIZE - (index === 0 ? 0 : 1))) * (row.length - 1);\r
      const from = Math.min(Math.floor(t), row.length - 2);\r
      const k = t - from;\r
      const eased = k * k * (3 - 2 * k);\r
      const start = row[from];\r
      const end = row[from + 1];\r
      const chroma = Math.hypot(start[1], start[2]) * (1 - eased) + Math.hypot(end[1], end[2]) * eased;\r
      const a = start[1] + (end[1] - start[1]) * eased;\r
      const b = start[2] + (end[2] - start[2]) * eased;\r
      const length = Math.hypot(a, b);\r
      const scale = length > 1e-4 ? chroma / length : 0;\r
      const color = fromOklab([start[0] + (end[0] - start[0]) * eased, a * scale, b * scale]);\r
      for (let channel = 0; channel < 3; channel++) {\r
        data[(index * PALETTE_SIZE + x) * 4 + channel] = Math.round(color[channel] * 255);\r
      }\r
      data[(index * PALETTE_SIZE + x) * 4 + 3] = 255;\r
    }\r
  });\r
  return data;\r
};\r
\r
const random = seed => () => {\r
  seed |= 0;\r
  seed = (seed + 0x6d2b79f5) | 0;\r
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);\r
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;\r
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\r
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
const Antigravity = ({\r
  count = 1500,\r
  magnetRadius = 9,\r
  ringRadius = 7,\r
  waveSpeed = 0.4,\r
  waveAmplitude = 1,\r
  waveCount = 3,\r
  particleSize = 0.9,\r
  lerpSpeed = 0.05,\r
  color,\r
  colors = DEFAULT_COLORS,\r
  colorMode = 'conic',\r
  colorSpeed = 0.05,\r
  autoAnimate = true,\r
  particleVariance = 1,\r
  rotationSpeed = 0,\r
  depthFactor = 1,\r
  pulseSpeed = 3,\r
  particleShape = 'capsule',\r
  fieldStrength = 10,\r
  ambient = 0.25,\r
  interactive = true,\r
  clickBurst = true,\r
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
  const palette = color ? [color] : Array.isArray(colors) && colors.length ? colors : DEFAULT_COLORS;\r
\r
  const settings = {\r
    count: clamp(Math.round(count), 1, 20000),\r
    magnet: Math.max(0, magnetRadius),\r
    ring: Math.max(0, ringRadius),\r
    waveSpeed,\r
    waveAmplitude: Math.max(0, waveAmplitude),\r
    waveCount: Math.max(0, Math.round(waveCount)),\r
    size: Math.max(0, particleSize),\r
    follow: clamp(lerpSpeed, 0.001, 1),\r
    palette,\r
    paletteKey: \`\${palette.join(',')}|\${lightMode}\`,\r
    colorMode: COLOR_MODES[colorMode] ?? COLOR_MODES.conic,\r
    colorSpeed,\r
    autoAnimate,\r
    variance: Math.max(0, particleVariance),\r
    rotation: rotationSpeed,\r
    depth: Math.max(0, depthFactor),\r
    pulse: pulseSpeed,\r
    shape: SHAPES[particleShape] ?? SHAPES.capsule,\r
    tightness: Math.max(0, fieldStrength),\r
    ambient: clamp(ambient, 0, 1),\r
    interactive,\r
    clickBurst,\r
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
    gl.bindVertexArray(vao);\r
    const cornerBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    const particleBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, particleBuffer);\r
    gl.enableVertexAttribArray(1);\r
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 0, 0);\r
    gl.vertexAttribDivisor(1, 1);\r
    const seedBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, seedBuffer);\r
    gl.enableVertexAttribArray(2);\r
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, 0);\r
    gl.vertexAttribDivisor(2, 1);\r
\r
    const paletteTexture = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, paletteTexture);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
\r
    const size = { width: 1, height: 1, ratio: 1 };\r
    const cursor = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, ready: false };\r
    const pointer = { x: 0, y: 0, inside: false, down: false, moved: -Infinity };\r
    let field = null;\r
    let paletteKey = '';\r
    let time = 0;\r
    let hue = 0;\r
    let charge = 0;\r
    let introClock = settingsRef.current.intro && !reduced && generation === 0 ? 0 : Infinity;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let pageVisible = document.visibilityState !== 'hidden';\r
    let lost = false;\r
\r
    const updatePalette = s => {\r
      if (s.paletteKey === paletteKey) return;\r
      paletteKey = s.paletteKey;\r
      gl.bindTexture(gl.TEXTURE_2D, paletteTexture);\r
      gl.texImage2D(\r
        gl.TEXTURE_2D,\r
        0,\r
        gl.RGBA8,\r
        PALETTE_SIZE,\r
        2,\r
        0,\r
        gl.RGBA,\r
        gl.UNSIGNED_BYTE,\r
        buildPalette(s.palette, s.light)\r
      );\r
    };\r
\r
    const buildField = (total, width, height, previous) => {\r
      const rand = random(1337);\r
      const margin = 0.06;\r
      const spanX = width * (1 + margin * 2);\r
      const spanY = height * (1 + margin * 2);\r
      const cols = Math.max(1, Math.ceil(Math.sqrt((total * spanX) / spanY)));\r
      const rows = Math.max(1, Math.ceil(total / cols));\r
      const cells = Array.from({ length: cols * rows }, (_, index) => index);\r
      for (let index = cells.length - 1; index > 0; index--) {\r
        const swap = Math.floor(rand() * (index + 1));\r
        [cells[index], cells[swap]] = [cells[swap], cells[index]];\r
      }\r
      const depths = Array.from({ length: total }, () => rand() * 2 - 1).sort((a, b) => a - b);\r
      const next = {\r
        total,\r
        width,\r
        height,\r
        homeX: new Float32Array(total),\r
        homeY: new Float32Array(total),\r
        band: new Float32Array(total),\r
        phase: new Float32Array(total),\r
        agility: new Float32Array(total),\r
        delay: new Float32Array(total),\r
        orbit: new Float32Array(total),\r
        x: new Float32Array(total),\r
        y: new Float32Array(total),\r
        vx: new Float32Array(total),\r
        vy: new Float32Array(total),\r
        particles: new Float32Array(total * 4),\r
        seeds: new Float32Array(total * 4)\r
      };\r
      for (let index = 0; index < total; index++) {\r
        const cell = cells[index];\r
        const hx = -width * margin + (((cell % cols) + 0.5 + (rand() - 0.5) * 0.85) / cols) * spanX;\r
        const hy = -height * margin + ((Math.floor(cell / cols) + 0.5 + (rand() - 0.5) * 0.85) / rows) * spanY;\r
        next.homeX[index] = hx;\r
        next.homeY[index] = hy;\r
        next.band[index] = rand() * 2 - 1;\r
        next.phase[index] = rand() * Math.PI * 2;\r
        next.agility[index] = 0.75 + rand() * 0.5;\r
        next.delay[index] = rand();\r
        if (previous && index < previous.total) {\r
          next.x[index] = (previous.x[index] / previous.width) * width;\r
          next.y[index] = (previous.y[index] / previous.height) * height;\r
          next.vx[index] = previous.vx[index];\r
          next.vy[index] = previous.vy[index];\r
          next.orbit[index] = previous.orbit[index];\r
        } else {\r
          next.x[index] = hx;\r
          next.y[index] = introClock === 0 ? hy + height * (0.45 + next.delay[index] * 0.4) : hy;\r
        }\r
        next.seeds[index * 4] = depths[index];\r
        next.seeds[index * 4 + 1] = next.phase[index];\r
        next.seeds[index * 4 + 2] = rand();\r
        next.seeds[index * 4 + 3] = rand();\r
      }\r
      gl.bindBuffer(gl.ARRAY_BUFFER, seedBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, next.seeds, gl.STATIC_DRAW);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, particleBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, next.particles.byteLength, gl.DYNAMIC_DRAW);\r
      return next;\r
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
      if (!cursor.ready) {\r
        cursor.x = cursor.tx = cssWidth / 2;\r
        cursor.y = cursor.ty = cssHeight / 2;\r
        cursor.ready = true;\r
      }\r
      if (\r
        !field ||\r
        field.total !== s.count ||\r
        Math.abs(field.width - cssWidth) > 0.5 ||\r
        Math.abs(field.height - cssHeight) > 0.5\r
      ) {\r
        field = buildField(s.count, cssWidth, cssHeight, field);\r
      }\r
    };\r
\r
    const simulate = (s, dt) => {\r
      if (!field) return;\r
      const unit = size.height / WORLD_HEIGHT;\r
      const ringPx = s.ring * unit * (1 - 0.38 * charge);\r
      const magnetPx = Math.max(s.magnet * unit, 1);\r
      const spread = (5 / (s.tightness + 0.1)) * unit;\r
      const wavePx = s.waveAmplitude * unit * 0.5;\r
      const omegaBase = 2.2 + s.follow * 80;\r
      const spinRate = (s.rotation + charge * 3) * (reduced ? 0.3 : 1);\r
      const centerX = size.width / 2;\r
      const centerY = size.height / 2;\r
      const edge = magnetPx * 0.18;\r
      const { homeX, homeY, band, phase, agility, delay, orbit, x, y, vx, vy, particles, seeds, total } = field;\r
      for (let index = 0; index < total; index++) {\r
        const parallax = 1 - seeds[index * 4] * 0.12 * s.depth;\r
        const cx = centerX + (cursor.x - centerX) * parallax;\r
        const cy = centerY + (cursor.y - centerY) * parallax;\r
        const hx = homeX[index];\r
        const hy = homeY[index] + Math.sin(time * 0.7 + phase[index]) * unit * 0.12 * s.waveAmplitude;\r
        const dx = hx - cx;\r
        const dy = hy - cy;\r
        const dist = Math.sqrt(dx * dx + dy * dy);\r
        const capture = 1 - clamp((dist - (magnetPx - edge)) / (edge * 2), 0, 1);\r
        const ease = capture * capture * (3 - 2 * capture);\r
        let turn = orbit[index] + spinRate * ease * dt;\r
        turn -= Math.atan2(Math.sin(turn), Math.cos(turn)) * (1 - ease) * Math.min(1, dt * 2.5);\r
        orbit[index] = turn;\r
        let tx = hx;\r
        let ty = hy;\r
        if (ease > 0 || Math.abs(turn) > 1e-4) {\r
          const angle = Math.atan2(dy, dx) + turn;\r
          const wave =\r
            wavePx *\r
            (0.6 * Math.sin(angle * s.waveCount - time * s.waveSpeed * 2) +\r
              0.4 * Math.sin(phase[index] + time * s.waveSpeed * 1.3));\r
          const radius = dist + (ringPx + wave + band[index] * spread - dist) * ease;\r
          tx = cx + Math.cos(angle) * radius;\r
          ty = cy + Math.sin(angle) * radius;\r
        }\r
        const omega = introClock < delay[index] * 0.9 ? 0 : omegaBase * agility[index];\r
        const damping = 1.64 * omega;\r
        const stiffness = omega * omega;\r
        const steps = Math.min(4, Math.max(1, Math.ceil(omega * dt * 2)));\r
        const h = dt / steps;\r
        for (let step = 0; step < steps; step++) {\r
          vx[index] += ((tx - x[index]) * stiffness - vx[index] * damping) * h;\r
          vy[index] += ((ty - y[index]) * stiffness - vy[index] * damping) * h;\r
          x[index] += vx[index] * h;\r
          y[index] += vy[index] * h;\r
        }\r
        particles[index * 4] = x[index];\r
        particles[index * 4 + 1] = y[index];\r
        particles[index * 4 + 2] = vx[index];\r
        particles[index * 4 + 3] = vy[index];\r
      }\r
    };\r
\r
    const burst = (s, strength) => {\r
      if (!field) return;\r
      const unit = size.height / WORLD_HEIGHT;\r
      const reach = Math.max(s.magnet, s.ring) * unit * 1.8;\r
      const { x, y, vx, vy, agility, total } = field;\r
      for (let index = 0; index < total; index++) {\r
        const dx = x[index] - cursor.x;\r
        const dy = y[index] - cursor.y;\r
        const dist = Math.sqrt(dx * dx + dy * dy) + 1e-3;\r
        const kick = unit * 110 * strength * Math.exp(-Math.pow(dist / reach, 2)) * agility[index];\r
        vx[index] += (dx / dist) * kick;\r
        vy[index] += (dy / dist) * kick;\r
      }\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (lost || !field) return;\r
      const s = settingsRef.current;\r
      updatePalette(s);\r
      const dt = clamp((now - last) / 1000 || 0, 0, 1 / 30);\r
      last = Math.max(last, now);\r
      const pace = reduced ? 0.3 : 1;\r
      time += dt * pace;\r
      hue += dt * s.colorSpeed * pace;\r
      if (introClock < 3) introClock += dt;\r
      charge = pointer.down ? Math.min(1, charge + dt / 0.9) : Math.max(0, charge - dt * 4);\r
\r
      const idle = performance.now() - pointer.moved > 2000 || !pointer.inside;\r
      if (s.autoAnimate && !reduced && (idle || !s.interactive)) {\r
        cursor.tx = size.width / 2 + Math.sin(time * 0.5) * (size.width / 4);\r
        cursor.ty = size.height / 2 + Math.cos(time) * (size.height / 4);\r
      } else if (s.interactive && pointer.inside) {\r
        cursor.tx = pointer.x;\r
        cursor.ty = pointer.y;\r
      }\r
      cursor.vx += ((cursor.tx - cursor.x) * 49 - cursor.vx * 14) * dt;\r
      cursor.vy += ((cursor.ty - cursor.y) * 49 - cursor.vy * 14) * dt;\r
      cursor.x += cursor.vx * dt;\r
      cursor.y += cursor.vy * dt;\r
\r
      simulate(s, dt);\r
\r
      const unit = size.height / WORLD_HEIGHT;\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      gl.useProgram(shader.program);\r
      gl.bindVertexArray(vao);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, particleBuffer);\r
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, field.particles);\r
      const u = shader.uniforms;\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, paletteTexture);\r
      gl.uniform1i(u.uPalette, 0);\r
      gl.uniform2f(u.uSize, size.width, size.height);\r
      gl.uniform1f(u.uPixel, size.ratio);\r
      gl.uniform2f(u.uCursor, cursor.x, cursor.y);\r
      gl.uniform1f(u.uRing, s.ring * unit * (1 - 0.38 * charge));\r
      gl.uniform1f(u.uBand, Math.max(unit * 6, 1));\r
      gl.uniform1f(u.uParticle, s.size * unit * 0.6);\r
      gl.uniform1f(u.uAmbient, s.ambient);\r
      gl.uniform1f(u.uTime, time);\r
      gl.uniform1f(u.uPulse, s.pulse);\r
      gl.uniform1f(u.uVariance, s.variance);\r
      gl.uniform1f(u.uDepth, s.depth);\r
      gl.uniform1f(u.uShape, s.shape);\r
      gl.uniform1f(u.uColorMode, s.colorMode);\r
      gl.uniform1f(u.uStops, s.palette.length);\r
      gl.uniform1f(u.uHue, hue);\r
      gl.uniform1f(u.uReveal, introClock < 3 ? clamp(introClock / 0.6, 0, 1) : 1);\r
      gl.uniform1f(u.uStreak, unit * 30);\r
      gl.uniform1f(u.uCharge, charge);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, field.total);\r
\r
      if (visible && pageVisible) raf = requestAnimationFrame(frame);\r
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
      pointer.inside = spot.inside;\r
      if (!spot.inside) return;\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.moved = performance.now();\r
    };\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      const spot = locate(event);\r
      if (!spot.inside || !s.interactive) return;\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = true;\r
      pointer.moved = performance.now();\r
      if (s.clickBurst && !reduced) pointer.down = true;\r
    };\r
    const onPointerUp = event => {\r
      if (pointer.down) burst(settingsRef.current, 0.45 + charge);\r
      pointer.down = false;\r
      if (event.pointerType !== 'mouse') pointer.inside = false;\r
    };\r
    const onLeave = () => {\r
      pointer.inside = false;\r
      pointer.down = false;\r
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
        gl.deleteBuffer(cornerBuffer);\r
        gl.deleteBuffer(particleBuffer);\r
        gl.deleteBuffer(seedBuffer);\r
        gl.deleteTexture(paletteTexture);\r
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
export default Antigravity;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, useState, type CSSProperties } from 'react';\r
import './Antigravity.css';\r
\r
type Shape = 'capsule' | 'sphere' | 'box' | 'tetrahedron';\r
type ColorMode = 'conic' | 'radial' | 'random';\r
\r
export interface AntigravityProps {\r
  count?: number;\r
  magnetRadius?: number;\r
  ringRadius?: number;\r
  waveSpeed?: number;\r
  waveAmplitude?: number;\r
  waveCount?: number;\r
  particleSize?: number;\r
  lerpSpeed?: number;\r
  color?: string;\r
  colors?: string[];\r
  colorMode?: ColorMode;\r
  colorSpeed?: number;\r
  autoAnimate?: boolean;\r
  particleVariance?: number;\r
  rotationSpeed?: number;\r
  depthFactor?: number;\r
  pulseSpeed?: number;\r
  particleShape?: Shape;\r
  fieldStrength?: number;\r
  ambient?: number;\r
  interactive?: boolean;\r
  clickBurst?: boolean;\r
  intro?: boolean;\r
  lightMode?: boolean;\r
  opacity?: number;\r
  maxDevicePixelRatio?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Settings {\r
  count: number;\r
  magnet: number;\r
  ring: number;\r
  waveSpeed: number;\r
  waveAmplitude: number;\r
  waveCount: number;\r
  size: number;\r
  follow: number;\r
  palette: string[];\r
  paletteKey: string;\r
  colorMode: number;\r
  colorSpeed: number;\r
  autoAnimate: boolean;\r
  variance: number;\r
  rotation: number;\r
  depth: number;\r
  pulse: number;\r
  shape: number;\r
  tightness: number;\r
  ambient: number;\r
  interactive: boolean;\r
  clickBurst: boolean;\r
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
interface Field {\r
  total: number;\r
  width: number;\r
  height: number;\r
  homeX: Float32Array;\r
  homeY: Float32Array;\r
  band: Float32Array;\r
  phase: Float32Array;\r
  agility: Float32Array;\r
  delay: Float32Array;\r
  orbit: Float32Array;\r
  x: Float32Array;\r
  y: Float32Array;\r
  vx: Float32Array;\r
  vy: Float32Array;\r
  particles: Float32Array;\r
  seeds: Float32Array;\r
}\r
\r
const PIXEL_BUDGET = 2.4e6;\r
const WORLD_HEIGHT = 31.5;\r
const PALETTE_SIZE = 256;\r
const DEFAULT_COLORS = ['#5227FF', '#FF9FFC', '#B497CF'];\r
const SHAPES: Record<Shape, number> = { capsule: 0, sphere: 1, box: 2, tetrahedron: 3 };\r
const COLOR_MODES: Record<ColorMode, number> = { conic: 0, radial: 1, random: 2 };\r
\r
const VERTEX = \`#version 300 es\r
precision highp float;\r
layout(location = 0) in vec2 aCorner;\r
layout(location = 1) in vec4 aParticle;\r
layout(location = 2) in vec4 aSeed;\r
uniform vec2 uSize;\r
uniform float uPixel;\r
uniform vec2 uCursor;\r
uniform float uRing;\r
uniform float uBand;\r
uniform float uParticle;\r
uniform float uAmbient;\r
uniform float uTime;\r
uniform float uPulse;\r
uniform float uVariance;\r
uniform float uDepth;\r
uniform float uShape;\r
uniform float uColorMode;\r
uniform float uStops;\r
uniform float uHue;\r
uniform float uReveal;\r
uniform float uStreak;\r
uniform float uCharge;\r
out vec2 vLocal;\r
out vec2 vBounds;\r
out float vU;\r
out float vAlpha;\r
out float vSoft;\r
\r
void main() {\r
  vec2 rel = aParticle.xy - uCursor;\r
  float dist = length(rel);\r
  vec2 radial = dist > 1e-3 ? rel / dist : vec2(1.0, 0.0);\r
  vec2 dir = radial;\r
  float speed = length(aParticle.zw);\r
  float streak = clamp(speed / uStreak, 0.0, 2.5);\r
  if (speed > 1e-3) {\r
    vec2 heading = aParticle.zw / speed * sign(dot(aParticle.zw, radial) + 1e-4);\r
    dir = normalize(mix(radial, heading, smoothstep(0.0, 1.0, streak)));\r
  }\r
  float ring = exp(-pow((dist - uRing) / uBand, 2.0));\r
  float z = aSeed.x;\r
  float depth = 1.0 + z * 0.32 * uDepth;\r
  float pulse = 1.0 + sin(uTime * uPulse + aSeed.y) * 0.22 * uVariance;\r
  float grow = uAmbient + (1.0 - uAmbient) * ring;\r
  float size = uParticle * depth * pulse * (0.85 + 0.3 * aSeed.w) * (1.0 + uCharge * 0.25 * ring);\r
  vec2 bounds;\r
  if (uShape < 0.5) {\r
    float width = size * 0.17 * mix(0.55, 1.0, ring);\r
    bounds = vec2(max(width, size * 0.5 * grow) * (1.0 + streak * 1.2), width);\r
  } else if (uShape < 1.5) {\r
    bounds = vec2(size * 0.22 * mix(0.45, 1.0, grow));\r
  } else {\r
    bounds = vec2(size * 0.26 * mix(0.45, 1.0, grow));\r
  }\r
  float soft = 1.0 + max(-z, 0.0) * 1.6 * uDepth;\r
  vec2 local = aCorner * (bounds + soft * 1.5 / uPixel);\r
  vec2 world = aParticle.xy + dir * local.x + vec2(-dir.y, dir.x) * local.y;\r
  gl_Position = vec4(world.x / uSize.x * 2.0 - 1.0, 1.0 - world.y / uSize.y * 2.0, 0.0, 1.0);\r
  vLocal = local * uPixel;\r
  vBounds = bounds * uPixel;\r
  vSoft = soft;\r
  if (uColorMode < 0.5) {\r
    vU = atan(radial.y, radial.x) / 6.28318530718 + uHue + (aSeed.z - 0.5) * 0.06;\r
  } else if (uColorMode < 1.5) {\r
    vU = clamp(dist / (uRing * 2.4), 0.0, 1.0) + (aSeed.z - 0.5) * 0.06;\r
  } else {\r
    vU = floor(aSeed.z * uStops) / max(uStops - 1.0, 1.0);\r
  }\r
  float fog = 1.0 - max(-z, 0.0) * 0.35 * uDepth;\r
  vAlpha = mix(uAmbient, 1.0, ring) * fog * uReveal;\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uPalette;\r
uniform float uShape;\r
uniform float uColorMode;\r
uniform float uOpacity;\r
in vec2 vLocal;\r
in vec2 vBounds;\r
in float vU;\r
in float vAlpha;\r
in float vSoft;\r
out vec4 fragColor;\r
\r
void main() {\r
  vec2 p = vLocal;\r
  float d;\r
  if (uShape < 0.5) {\r
    float r = vBounds.y;\r
    d = length(vec2(max(abs(p.x) - max(vBounds.x - r, 0.0), 0.0), p.y)) - r;\r
  } else if (uShape < 1.5) {\r
    d = length(p) - vBounds.x;\r
  } else if (uShape < 2.5) {\r
    float r = vBounds.x * 0.28;\r
    vec2 q = abs(p) - (vBounds - r);\r
    d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;\r
  } else {\r
    float r = vBounds.x * 1.15;\r
    vec2 q = vec2(r * 0.5774 - p.x, abs(p.y));\r
    d = max(dot(q, vec2(0.5, 0.8660254)) - r * 0.5, -q.x - r * 0.5) * 1.2;\r
  }\r
  float alpha = clamp(0.5 - d / vSoft, 0.0, 1.0) * vAlpha * uOpacity;\r
  if (alpha < 0.002) discard;\r
  vec3 color = texture(uPalette, vec2(uColorMode < 0.5 ? fract(vU) : vU, uColorMode < 0.5 ? 0.25 : 0.75)).rgb;\r
  fragColor = vec4(color * alpha, alpha);\r
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
const toSrgb = (channel: number) =>\r
  channel <= 0.0031308 ? channel * 12.92 : 1.055 * Math.pow(Math.max(channel, 0), 1 / 2.4) - 0.055;\r
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
const fromOklab = ([L, a, b]: number[]): number[] => {\r
  const l = Math.pow(L + 0.3963377774 * a + 0.2158037573 * b, 3);\r
  const m = Math.pow(L - 0.1055613458 * a - 0.0638541728 * b, 3);\r
  const s = Math.pow(L - 0.0894841775 * a - 1.291485548 * b, 3);\r
  return [\r
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,\r
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,\r
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s\r
  ].map(channel => clamp(toSrgb(channel), 0, 1));\r
};\r
\r
const buildPalette = (colors: string[], light: boolean) => {\r
  const stops: number[][] = [];\r
  colors.forEach(color => {\r
    const parsed = parseColor(color);\r
    if (!parsed) return;\r
    const lab = toOklab(parsed);\r
    const hue = (Math.atan2(lab[2], lab[1]) * 180) / Math.PI;\r
    const warmth = clamp(1 - Math.abs(hue - 85) / 40, 0, 1);\r
    const ceiling = 0.62 + 0.14 * warmth * warmth * (3 - 2 * warmth);\r
    if (light && lab[0] > ceiling) {\r
      const boost = 1 + (lab[0] - ceiling) * 1.6;\r
      stops.push([ceiling, lab[1] * boost, lab[2] * boost]);\r
    } else {\r
      stops.push(lab);\r
    }\r
  });\r
  if (!stops.length) stops.push(toOklab(light ? [0.1, 0.1, 0.12] : [1, 1, 1]));\r
  const data = new Uint8Array(PALETTE_SIZE * 2 * 4);\r
  const rows = [[...stops, stops[0]], stops.length > 1 ? stops : [stops[0], stops[0]]];\r
  rows.forEach((row, index) => {\r
    for (let x = 0; x < PALETTE_SIZE; x++) {\r
      const t = (x / (PALETTE_SIZE - (index === 0 ? 0 : 1))) * (row.length - 1);\r
      const from = Math.min(Math.floor(t), row.length - 2);\r
      const k = t - from;\r
      const eased = k * k * (3 - 2 * k);\r
      const start = row[from];\r
      const end = row[from + 1];\r
      const chroma = Math.hypot(start[1], start[2]) * (1 - eased) + Math.hypot(end[1], end[2]) * eased;\r
      const a = start[1] + (end[1] - start[1]) * eased;\r
      const b = start[2] + (end[2] - start[2]) * eased;\r
      const length = Math.hypot(a, b);\r
      const scale = length > 1e-4 ? chroma / length : 0;\r
      const color = fromOklab([start[0] + (end[0] - start[0]) * eased, a * scale, b * scale]);\r
      for (let channel = 0; channel < 3; channel++) {\r
        data[(index * PALETTE_SIZE + x) * 4 + channel] = Math.round(color[channel] * 255);\r
      }\r
      data[(index * PALETTE_SIZE + x) * 4 + 3] = 255;\r
    }\r
  });\r
  return data;\r
};\r
\r
const random = (seed: number) => () => {\r
  seed |= 0;\r
  seed = (seed + 0x6d2b79f5) | 0;\r
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);\r
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;\r
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\r
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
const Antigravity = ({\r
  count = 1500,\r
  magnetRadius = 9,\r
  ringRadius = 7,\r
  waveSpeed = 0.4,\r
  waveAmplitude = 1,\r
  waveCount = 3,\r
  particleSize = 0.9,\r
  lerpSpeed = 0.05,\r
  color,\r
  colors = DEFAULT_COLORS,\r
  colorMode = 'conic',\r
  colorSpeed = 0.05,\r
  autoAnimate = true,\r
  particleVariance = 1,\r
  rotationSpeed = 0,\r
  depthFactor = 1,\r
  pulseSpeed = 3,\r
  particleShape = 'capsule',\r
  fieldStrength = 10,\r
  ambient = 0.25,\r
  interactive = true,\r
  clickBurst = true,\r
  intro = true,\r
  lightMode = false,\r
  opacity = 1,\r
  maxDevicePixelRatio = 2,\r
  className = '',\r
  style\r
}: AntigravityProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const [generation, setGeneration] = useState(0);\r
  const palette = color ? [color] : Array.isArray(colors) && colors.length ? colors : DEFAULT_COLORS;\r
\r
  const settings: Settings = {\r
    count: clamp(Math.round(count), 1, 20000),\r
    magnet: Math.max(0, magnetRadius),\r
    ring: Math.max(0, ringRadius),\r
    waveSpeed,\r
    waveAmplitude: Math.max(0, waveAmplitude),\r
    waveCount: Math.max(0, Math.round(waveCount)),\r
    size: Math.max(0, particleSize),\r
    follow: clamp(lerpSpeed, 0.001, 1),\r
    palette,\r
    paletteKey: \`\${palette.join(',')}|\${lightMode}\`,\r
    colorMode: COLOR_MODES[colorMode] ?? COLOR_MODES.conic,\r
    colorSpeed,\r
    autoAnimate,\r
    variance: Math.max(0, particleVariance),\r
    rotation: rotationSpeed,\r
    depth: Math.max(0, depthFactor),\r
    pulse: pulseSpeed,\r
    shape: SHAPES[particleShape] ?? SHAPES.capsule,\r
    tightness: Math.max(0, fieldStrength),\r
    ambient: clamp(ambient, 0, 1),\r
    interactive,\r
    clickBurst,\r
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
    gl.bindVertexArray(vao);\r
    const cornerBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    const particleBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, particleBuffer);\r
    gl.enableVertexAttribArray(1);\r
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 0, 0);\r
    gl.vertexAttribDivisor(1, 1);\r
    const seedBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, seedBuffer);\r
    gl.enableVertexAttribArray(2);\r
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, 0);\r
    gl.vertexAttribDivisor(2, 1);\r
\r
    const paletteTexture = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, paletteTexture);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
\r
    const size = { width: 1, height: 1, ratio: 1 };\r
    const cursor = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, ready: false };\r
    const pointer = { x: 0, y: 0, inside: false, down: false, moved: -Infinity };\r
    let field: Field | null = null;\r
    let paletteKey = '';\r
    let time = 0;\r
    let hue = 0;\r
    let charge = 0;\r
    let introClock = settingsRef.current.intro && !reduced && generation === 0 ? 0 : Infinity;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let pageVisible = document.visibilityState !== 'hidden';\r
    let lost = false;\r
\r
    const updatePalette = (s: Settings) => {\r
      if (s.paletteKey === paletteKey) return;\r
      paletteKey = s.paletteKey;\r
      gl.bindTexture(gl.TEXTURE_2D, paletteTexture);\r
      gl.texImage2D(\r
        gl.TEXTURE_2D,\r
        0,\r
        gl.RGBA8,\r
        PALETTE_SIZE,\r
        2,\r
        0,\r
        gl.RGBA,\r
        gl.UNSIGNED_BYTE,\r
        buildPalette(s.palette, s.light)\r
      );\r
    };\r
\r
    const buildField = (total: number, width: number, height: number, previous: Field | null): Field => {\r
      const rand = random(1337);\r
      const margin = 0.06;\r
      const spanX = width * (1 + margin * 2);\r
      const spanY = height * (1 + margin * 2);\r
      const cols = Math.max(1, Math.ceil(Math.sqrt((total * spanX) / spanY)));\r
      const rows = Math.max(1, Math.ceil(total / cols));\r
      const cells = Array.from({ length: cols * rows }, (_, index) => index);\r
      for (let index = cells.length - 1; index > 0; index--) {\r
        const swap = Math.floor(rand() * (index + 1));\r
        [cells[index], cells[swap]] = [cells[swap], cells[index]];\r
      }\r
      const depths = Array.from({ length: total }, () => rand() * 2 - 1).sort((a, b) => a - b);\r
      const next: Field = {\r
        total,\r
        width,\r
        height,\r
        homeX: new Float32Array(total),\r
        homeY: new Float32Array(total),\r
        band: new Float32Array(total),\r
        phase: new Float32Array(total),\r
        agility: new Float32Array(total),\r
        delay: new Float32Array(total),\r
        orbit: new Float32Array(total),\r
        x: new Float32Array(total),\r
        y: new Float32Array(total),\r
        vx: new Float32Array(total),\r
        vy: new Float32Array(total),\r
        particles: new Float32Array(total * 4),\r
        seeds: new Float32Array(total * 4)\r
      };\r
      for (let index = 0; index < total; index++) {\r
        const cell = cells[index];\r
        const hx = -width * margin + (((cell % cols) + 0.5 + (rand() - 0.5) * 0.85) / cols) * spanX;\r
        const hy = -height * margin + ((Math.floor(cell / cols) + 0.5 + (rand() - 0.5) * 0.85) / rows) * spanY;\r
        next.homeX[index] = hx;\r
        next.homeY[index] = hy;\r
        next.band[index] = rand() * 2 - 1;\r
        next.phase[index] = rand() * Math.PI * 2;\r
        next.agility[index] = 0.75 + rand() * 0.5;\r
        next.delay[index] = rand();\r
        if (previous && index < previous.total) {\r
          next.x[index] = (previous.x[index] / previous.width) * width;\r
          next.y[index] = (previous.y[index] / previous.height) * height;\r
          next.vx[index] = previous.vx[index];\r
          next.vy[index] = previous.vy[index];\r
          next.orbit[index] = previous.orbit[index];\r
        } else {\r
          next.x[index] = hx;\r
          next.y[index] = introClock === 0 ? hy + height * (0.45 + next.delay[index] * 0.4) : hy;\r
        }\r
        next.seeds[index * 4] = depths[index];\r
        next.seeds[index * 4 + 1] = next.phase[index];\r
        next.seeds[index * 4 + 2] = rand();\r
        next.seeds[index * 4 + 3] = rand();\r
      }\r
      gl.bindBuffer(gl.ARRAY_BUFFER, seedBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, next.seeds, gl.STATIC_DRAW);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, particleBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, next.particles.byteLength, gl.DYNAMIC_DRAW);\r
      return next;\r
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
      if (!cursor.ready) {\r
        cursor.x = cursor.tx = cssWidth / 2;\r
        cursor.y = cursor.ty = cssHeight / 2;\r
        cursor.ready = true;\r
      }\r
      if (\r
        !field ||\r
        field.total !== s.count ||\r
        Math.abs(field.width - cssWidth) > 0.5 ||\r
        Math.abs(field.height - cssHeight) > 0.5\r
      ) {\r
        field = buildField(s.count, cssWidth, cssHeight, field);\r
      }\r
    };\r
\r
    const simulate = (s: Settings, dt: number) => {\r
      if (!field) return;\r
      const unit = size.height / WORLD_HEIGHT;\r
      const ringPx = s.ring * unit * (1 - 0.38 * charge);\r
      const magnetPx = Math.max(s.magnet * unit, 1);\r
      const spread = (5 / (s.tightness + 0.1)) * unit;\r
      const wavePx = s.waveAmplitude * unit * 0.5;\r
      const omegaBase = 2.2 + s.follow * 80;\r
      const spinRate = (s.rotation + charge * 3) * (reduced ? 0.3 : 1);\r
      const centerX = size.width / 2;\r
      const centerY = size.height / 2;\r
      const edge = magnetPx * 0.18;\r
      const { homeX, homeY, band, phase, agility, delay, orbit, x, y, vx, vy, particles, seeds, total } = field;\r
      for (let index = 0; index < total; index++) {\r
        const parallax = 1 - seeds[index * 4] * 0.12 * s.depth;\r
        const cx = centerX + (cursor.x - centerX) * parallax;\r
        const cy = centerY + (cursor.y - centerY) * parallax;\r
        const hx = homeX[index];\r
        const hy = homeY[index] + Math.sin(time * 0.7 + phase[index]) * unit * 0.12 * s.waveAmplitude;\r
        const dx = hx - cx;\r
        const dy = hy - cy;\r
        const dist = Math.sqrt(dx * dx + dy * dy);\r
        const capture = 1 - clamp((dist - (magnetPx - edge)) / (edge * 2), 0, 1);\r
        const ease = capture * capture * (3 - 2 * capture);\r
        let turn = orbit[index] + spinRate * ease * dt;\r
        turn -= Math.atan2(Math.sin(turn), Math.cos(turn)) * (1 - ease) * Math.min(1, dt * 2.5);\r
        orbit[index] = turn;\r
        let tx = hx;\r
        let ty = hy;\r
        if (ease > 0 || Math.abs(turn) > 1e-4) {\r
          const angle = Math.atan2(dy, dx) + turn;\r
          const wave =\r
            wavePx *\r
            (0.6 * Math.sin(angle * s.waveCount - time * s.waveSpeed * 2) +\r
              0.4 * Math.sin(phase[index] + time * s.waveSpeed * 1.3));\r
          const radius = dist + (ringPx + wave + band[index] * spread - dist) * ease;\r
          tx = cx + Math.cos(angle) * radius;\r
          ty = cy + Math.sin(angle) * radius;\r
        }\r
        const omega = introClock < delay[index] * 0.9 ? 0 : omegaBase * agility[index];\r
        const damping = 1.64 * omega;\r
        const stiffness = omega * omega;\r
        const steps = Math.min(4, Math.max(1, Math.ceil(omega * dt * 2)));\r
        const h = dt / steps;\r
        for (let step = 0; step < steps; step++) {\r
          vx[index] += ((tx - x[index]) * stiffness - vx[index] * damping) * h;\r
          vy[index] += ((ty - y[index]) * stiffness - vy[index] * damping) * h;\r
          x[index] += vx[index] * h;\r
          y[index] += vy[index] * h;\r
        }\r
        particles[index * 4] = x[index];\r
        particles[index * 4 + 1] = y[index];\r
        particles[index * 4 + 2] = vx[index];\r
        particles[index * 4 + 3] = vy[index];\r
      }\r
    };\r
\r
    const burst = (s: Settings, strength: number) => {\r
      if (!field) return;\r
      const unit = size.height / WORLD_HEIGHT;\r
      const reach = Math.max(s.magnet, s.ring) * unit * 1.8;\r
      const { x, y, vx, vy, agility, total } = field;\r
      for (let index = 0; index < total; index++) {\r
        const dx = x[index] - cursor.x;\r
        const dy = y[index] - cursor.y;\r
        const dist = Math.sqrt(dx * dx + dy * dy) + 1e-3;\r
        const kick = unit * 110 * strength * Math.exp(-Math.pow(dist / reach, 2)) * agility[index];\r
        vx[index] += (dx / dist) * kick;\r
        vy[index] += (dy / dist) * kick;\r
      }\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (lost || !field) return;\r
      const s = settingsRef.current;\r
      updatePalette(s);\r
      const dt = clamp((now - last) / 1000 || 0, 0, 1 / 30);\r
      last = Math.max(last, now);\r
      const pace = reduced ? 0.3 : 1;\r
      time += dt * pace;\r
      hue += dt * s.colorSpeed * pace;\r
      if (introClock < 3) introClock += dt;\r
      charge = pointer.down ? Math.min(1, charge + dt / 0.9) : Math.max(0, charge - dt * 4);\r
\r
      const idle = performance.now() - pointer.moved > 2000 || !pointer.inside;\r
      if (s.autoAnimate && !reduced && (idle || !s.interactive)) {\r
        cursor.tx = size.width / 2 + Math.sin(time * 0.5) * (size.width / 4);\r
        cursor.ty = size.height / 2 + Math.cos(time) * (size.height / 4);\r
      } else if (s.interactive && pointer.inside) {\r
        cursor.tx = pointer.x;\r
        cursor.ty = pointer.y;\r
      }\r
      cursor.vx += ((cursor.tx - cursor.x) * 49 - cursor.vx * 14) * dt;\r
      cursor.vy += ((cursor.ty - cursor.y) * 49 - cursor.vy * 14) * dt;\r
      cursor.x += cursor.vx * dt;\r
      cursor.y += cursor.vy * dt;\r
\r
      simulate(s, dt);\r
\r
      const unit = size.height / WORLD_HEIGHT;\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      gl.useProgram(shader.program);\r
      gl.bindVertexArray(vao);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, particleBuffer);\r
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, field.particles);\r
      const u = shader.uniforms;\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, paletteTexture);\r
      gl.uniform1i(u.uPalette, 0);\r
      gl.uniform2f(u.uSize, size.width, size.height);\r
      gl.uniform1f(u.uPixel, size.ratio);\r
      gl.uniform2f(u.uCursor, cursor.x, cursor.y);\r
      gl.uniform1f(u.uRing, s.ring * unit * (1 - 0.38 * charge));\r
      gl.uniform1f(u.uBand, Math.max(unit * 6, 1));\r
      gl.uniform1f(u.uParticle, s.size * unit * 0.6);\r
      gl.uniform1f(u.uAmbient, s.ambient);\r
      gl.uniform1f(u.uTime, time);\r
      gl.uniform1f(u.uPulse, s.pulse);\r
      gl.uniform1f(u.uVariance, s.variance);\r
      gl.uniform1f(u.uDepth, s.depth);\r
      gl.uniform1f(u.uShape, s.shape);\r
      gl.uniform1f(u.uColorMode, s.colorMode);\r
      gl.uniform1f(u.uStops, s.palette.length);\r
      gl.uniform1f(u.uHue, hue);\r
      gl.uniform1f(u.uReveal, introClock < 3 ? clamp(introClock / 0.6, 0, 1) : 1);\r
      gl.uniform1f(u.uStreak, unit * 30);\r
      gl.uniform1f(u.uCharge, charge);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, field.total);\r
\r
      if (visible && pageVisible) raf = requestAnimationFrame(frame);\r
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
      pointer.inside = spot.inside;\r
      if (!spot.inside) return;\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.moved = performance.now();\r
    };\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      const spot = locate(event);\r
      if (!spot.inside || !s.interactive) return;\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = true;\r
      pointer.moved = performance.now();\r
      if (s.clickBurst && !reduced) pointer.down = true;\r
    };\r
    const onPointerUp = (event: PointerEvent) => {\r
      if (pointer.down) burst(settingsRef.current, 0.45 + charge);\r
      pointer.down = false;\r
      if (event.pointerType !== 'mouse') pointer.inside = false;\r
    };\r
    const onLeave = () => {\r
      pointer.inside = false;\r
      pointer.down = false;\r
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
        gl.deleteBuffer(cornerBuffer);\r
        gl.deleteBuffer(particleBuffer);\r
        gl.deleteBuffer(seedBuffer);\r
        gl.deleteTexture(paletteTexture);\r
        gl.deleteVertexArray(vao);\r
        gl.deleteProgram(shader.program);\r
      }\r
    };\r
  }, [generation]);\r
\r
  return (\r
    <div ref={containerRef} className={\`antigravity\${className ? \` \${className}\` : ''}\`} style={style}>\r
      <canvas ref={canvasRef} className="antigravity__canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Antigravity;\r
`,a=`'use client';\r
\r
import { useEffect, useRef, useState, type CSSProperties } from 'react';\r
\r
type Shape = 'capsule' | 'sphere' | 'box' | 'tetrahedron';\r
type ColorMode = 'conic' | 'radial' | 'random';\r
\r
export interface AntigravityProps {\r
  count?: number;\r
  magnetRadius?: number;\r
  ringRadius?: number;\r
  waveSpeed?: number;\r
  waveAmplitude?: number;\r
  waveCount?: number;\r
  particleSize?: number;\r
  lerpSpeed?: number;\r
  color?: string;\r
  colors?: string[];\r
  colorMode?: ColorMode;\r
  colorSpeed?: number;\r
  autoAnimate?: boolean;\r
  particleVariance?: number;\r
  rotationSpeed?: number;\r
  depthFactor?: number;\r
  pulseSpeed?: number;\r
  particleShape?: Shape;\r
  fieldStrength?: number;\r
  ambient?: number;\r
  interactive?: boolean;\r
  clickBurst?: boolean;\r
  intro?: boolean;\r
  lightMode?: boolean;\r
  opacity?: number;\r
  maxDevicePixelRatio?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Settings {\r
  count: number;\r
  magnet: number;\r
  ring: number;\r
  waveSpeed: number;\r
  waveAmplitude: number;\r
  waveCount: number;\r
  size: number;\r
  follow: number;\r
  palette: string[];\r
  paletteKey: string;\r
  colorMode: number;\r
  colorSpeed: number;\r
  autoAnimate: boolean;\r
  variance: number;\r
  rotation: number;\r
  depth: number;\r
  pulse: number;\r
  shape: number;\r
  tightness: number;\r
  ambient: number;\r
  interactive: boolean;\r
  clickBurst: boolean;\r
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
interface Field {\r
  total: number;\r
  width: number;\r
  height: number;\r
  homeX: Float32Array;\r
  homeY: Float32Array;\r
  band: Float32Array;\r
  phase: Float32Array;\r
  agility: Float32Array;\r
  delay: Float32Array;\r
  orbit: Float32Array;\r
  x: Float32Array;\r
  y: Float32Array;\r
  vx: Float32Array;\r
  vy: Float32Array;\r
  particles: Float32Array;\r
  seeds: Float32Array;\r
}\r
\r
const PIXEL_BUDGET = 2.4e6;\r
const WORLD_HEIGHT = 31.5;\r
const PALETTE_SIZE = 256;\r
const DEFAULT_COLORS = ['#5227FF', '#FF9FFC', '#B497CF'];\r
const SHAPES: Record<Shape, number> = { capsule: 0, sphere: 1, box: 2, tetrahedron: 3 };\r
const COLOR_MODES: Record<ColorMode, number> = { conic: 0, radial: 1, random: 2 };\r
\r
const VERTEX = \`#version 300 es\r
precision highp float;\r
layout(location = 0) in vec2 aCorner;\r
layout(location = 1) in vec4 aParticle;\r
layout(location = 2) in vec4 aSeed;\r
uniform vec2 uSize;\r
uniform float uPixel;\r
uniform vec2 uCursor;\r
uniform float uRing;\r
uniform float uBand;\r
uniform float uParticle;\r
uniform float uAmbient;\r
uniform float uTime;\r
uniform float uPulse;\r
uniform float uVariance;\r
uniform float uDepth;\r
uniform float uShape;\r
uniform float uColorMode;\r
uniform float uStops;\r
uniform float uHue;\r
uniform float uReveal;\r
uniform float uStreak;\r
uniform float uCharge;\r
out vec2 vLocal;\r
out vec2 vBounds;\r
out float vU;\r
out float vAlpha;\r
out float vSoft;\r
\r
void main() {\r
  vec2 rel = aParticle.xy - uCursor;\r
  float dist = length(rel);\r
  vec2 radial = dist > 1e-3 ? rel / dist : vec2(1.0, 0.0);\r
  vec2 dir = radial;\r
  float speed = length(aParticle.zw);\r
  float streak = clamp(speed / uStreak, 0.0, 2.5);\r
  if (speed > 1e-3) {\r
    vec2 heading = aParticle.zw / speed * sign(dot(aParticle.zw, radial) + 1e-4);\r
    dir = normalize(mix(radial, heading, smoothstep(0.0, 1.0, streak)));\r
  }\r
  float ring = exp(-pow((dist - uRing) / uBand, 2.0));\r
  float z = aSeed.x;\r
  float depth = 1.0 + z * 0.32 * uDepth;\r
  float pulse = 1.0 + sin(uTime * uPulse + aSeed.y) * 0.22 * uVariance;\r
  float grow = uAmbient + (1.0 - uAmbient) * ring;\r
  float size = uParticle * depth * pulse * (0.85 + 0.3 * aSeed.w) * (1.0 + uCharge * 0.25 * ring);\r
  vec2 bounds;\r
  if (uShape < 0.5) {\r
    float width = size * 0.17 * mix(0.55, 1.0, ring);\r
    bounds = vec2(max(width, size * 0.5 * grow) * (1.0 + streak * 1.2), width);\r
  } else if (uShape < 1.5) {\r
    bounds = vec2(size * 0.22 * mix(0.45, 1.0, grow));\r
  } else {\r
    bounds = vec2(size * 0.26 * mix(0.45, 1.0, grow));\r
  }\r
  float soft = 1.0 + max(-z, 0.0) * 1.6 * uDepth;\r
  vec2 local = aCorner * (bounds + soft * 1.5 / uPixel);\r
  vec2 world = aParticle.xy + dir * local.x + vec2(-dir.y, dir.x) * local.y;\r
  gl_Position = vec4(world.x / uSize.x * 2.0 - 1.0, 1.0 - world.y / uSize.y * 2.0, 0.0, 1.0);\r
  vLocal = local * uPixel;\r
  vBounds = bounds * uPixel;\r
  vSoft = soft;\r
  if (uColorMode < 0.5) {\r
    vU = atan(radial.y, radial.x) / 6.28318530718 + uHue + (aSeed.z - 0.5) * 0.06;\r
  } else if (uColorMode < 1.5) {\r
    vU = clamp(dist / (uRing * 2.4), 0.0, 1.0) + (aSeed.z - 0.5) * 0.06;\r
  } else {\r
    vU = floor(aSeed.z * uStops) / max(uStops - 1.0, 1.0);\r
  }\r
  float fog = 1.0 - max(-z, 0.0) * 0.35 * uDepth;\r
  vAlpha = mix(uAmbient, 1.0, ring) * fog * uReveal;\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uPalette;\r
uniform float uShape;\r
uniform float uColorMode;\r
uniform float uOpacity;\r
in vec2 vLocal;\r
in vec2 vBounds;\r
in float vU;\r
in float vAlpha;\r
in float vSoft;\r
out vec4 fragColor;\r
\r
void main() {\r
  vec2 p = vLocal;\r
  float d;\r
  if (uShape < 0.5) {\r
    float r = vBounds.y;\r
    d = length(vec2(max(abs(p.x) - max(vBounds.x - r, 0.0), 0.0), p.y)) - r;\r
  } else if (uShape < 1.5) {\r
    d = length(p) - vBounds.x;\r
  } else if (uShape < 2.5) {\r
    float r = vBounds.x * 0.28;\r
    vec2 q = abs(p) - (vBounds - r);\r
    d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;\r
  } else {\r
    float r = vBounds.x * 1.15;\r
    vec2 q = vec2(r * 0.5774 - p.x, abs(p.y));\r
    d = max(dot(q, vec2(0.5, 0.8660254)) - r * 0.5, -q.x - r * 0.5) * 1.2;\r
  }\r
  float alpha = clamp(0.5 - d / vSoft, 0.0, 1.0) * vAlpha * uOpacity;\r
  if (alpha < 0.002) discard;\r
  vec3 color = texture(uPalette, vec2(uColorMode < 0.5 ? fract(vU) : vU, uColorMode < 0.5 ? 0.25 : 0.75)).rgb;\r
  fragColor = vec4(color * alpha, alpha);\r
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
const toSrgb = (channel: number) =>\r
  channel <= 0.0031308 ? channel * 12.92 : 1.055 * Math.pow(Math.max(channel, 0), 1 / 2.4) - 0.055;\r
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
const fromOklab = ([L, a, b]: number[]): number[] => {\r
  const l = Math.pow(L + 0.3963377774 * a + 0.2158037573 * b, 3);\r
  const m = Math.pow(L - 0.1055613458 * a - 0.0638541728 * b, 3);\r
  const s = Math.pow(L - 0.0894841775 * a - 1.291485548 * b, 3);\r
  return [\r
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,\r
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,\r
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s\r
  ].map(channel => clamp(toSrgb(channel), 0, 1));\r
};\r
\r
const buildPalette = (colors: string[], light: boolean) => {\r
  const stops: number[][] = [];\r
  colors.forEach(color => {\r
    const parsed = parseColor(color);\r
    if (!parsed) return;\r
    const lab = toOklab(parsed);\r
    const hue = (Math.atan2(lab[2], lab[1]) * 180) / Math.PI;\r
    const warmth = clamp(1 - Math.abs(hue - 85) / 40, 0, 1);\r
    const ceiling = 0.62 + 0.14 * warmth * warmth * (3 - 2 * warmth);\r
    if (light && lab[0] > ceiling) {\r
      const boost = 1 + (lab[0] - ceiling) * 1.6;\r
      stops.push([ceiling, lab[1] * boost, lab[2] * boost]);\r
    } else {\r
      stops.push(lab);\r
    }\r
  });\r
  if (!stops.length) stops.push(toOklab(light ? [0.1, 0.1, 0.12] : [1, 1, 1]));\r
  const data = new Uint8Array(PALETTE_SIZE * 2 * 4);\r
  const rows = [[...stops, stops[0]], stops.length > 1 ? stops : [stops[0], stops[0]]];\r
  rows.forEach((row, index) => {\r
    for (let x = 0; x < PALETTE_SIZE; x++) {\r
      const t = (x / (PALETTE_SIZE - (index === 0 ? 0 : 1))) * (row.length - 1);\r
      const from = Math.min(Math.floor(t), row.length - 2);\r
      const k = t - from;\r
      const eased = k * k * (3 - 2 * k);\r
      const start = row[from];\r
      const end = row[from + 1];\r
      const chroma = Math.hypot(start[1], start[2]) * (1 - eased) + Math.hypot(end[1], end[2]) * eased;\r
      const a = start[1] + (end[1] - start[1]) * eased;\r
      const b = start[2] + (end[2] - start[2]) * eased;\r
      const length = Math.hypot(a, b);\r
      const scale = length > 1e-4 ? chroma / length : 0;\r
      const color = fromOklab([start[0] + (end[0] - start[0]) * eased, a * scale, b * scale]);\r
      for (let channel = 0; channel < 3; channel++) {\r
        data[(index * PALETTE_SIZE + x) * 4 + channel] = Math.round(color[channel] * 255);\r
      }\r
      data[(index * PALETTE_SIZE + x) * 4 + 3] = 255;\r
    }\r
  });\r
  return data;\r
};\r
\r
const random = (seed: number) => () => {\r
  seed |= 0;\r
  seed = (seed + 0x6d2b79f5) | 0;\r
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);\r
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;\r
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\r
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
const Antigravity = ({\r
  count = 1500,\r
  magnetRadius = 9,\r
  ringRadius = 7,\r
  waveSpeed = 0.4,\r
  waveAmplitude = 1,\r
  waveCount = 3,\r
  particleSize = 0.9,\r
  lerpSpeed = 0.05,\r
  color,\r
  colors = DEFAULT_COLORS,\r
  colorMode = 'conic',\r
  colorSpeed = 0.05,\r
  autoAnimate = true,\r
  particleVariance = 1,\r
  rotationSpeed = 0,\r
  depthFactor = 1,\r
  pulseSpeed = 3,\r
  particleShape = 'capsule',\r
  fieldStrength = 10,\r
  ambient = 0.25,\r
  interactive = true,\r
  clickBurst = true,\r
  intro = true,\r
  lightMode = false,\r
  opacity = 1,\r
  maxDevicePixelRatio = 2,\r
  className = '',\r
  style\r
}: AntigravityProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const [generation, setGeneration] = useState(0);\r
  const palette = color ? [color] : Array.isArray(colors) && colors.length ? colors : DEFAULT_COLORS;\r
\r
  const settings: Settings = {\r
    count: clamp(Math.round(count), 1, 20000),\r
    magnet: Math.max(0, magnetRadius),\r
    ring: Math.max(0, ringRadius),\r
    waveSpeed,\r
    waveAmplitude: Math.max(0, waveAmplitude),\r
    waveCount: Math.max(0, Math.round(waveCount)),\r
    size: Math.max(0, particleSize),\r
    follow: clamp(lerpSpeed, 0.001, 1),\r
    palette,\r
    paletteKey: \`\${palette.join(',')}|\${lightMode}\`,\r
    colorMode: COLOR_MODES[colorMode] ?? COLOR_MODES.conic,\r
    colorSpeed,\r
    autoAnimate,\r
    variance: Math.max(0, particleVariance),\r
    rotation: rotationSpeed,\r
    depth: Math.max(0, depthFactor),\r
    pulse: pulseSpeed,\r
    shape: SHAPES[particleShape] ?? SHAPES.capsule,\r
    tightness: Math.max(0, fieldStrength),\r
    ambient: clamp(ambient, 0, 1),\r
    interactive,\r
    clickBurst,\r
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
    gl.bindVertexArray(vao);\r
    const cornerBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    const particleBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, particleBuffer);\r
    gl.enableVertexAttribArray(1);\r
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 0, 0);\r
    gl.vertexAttribDivisor(1, 1);\r
    const seedBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, seedBuffer);\r
    gl.enableVertexAttribArray(2);\r
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, 0);\r
    gl.vertexAttribDivisor(2, 1);\r
\r
    const paletteTexture = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, paletteTexture);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
\r
    const size = { width: 1, height: 1, ratio: 1 };\r
    const cursor = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, ready: false };\r
    const pointer = { x: 0, y: 0, inside: false, down: false, moved: -Infinity };\r
    let field: Field | null = null;\r
    let paletteKey = '';\r
    let time = 0;\r
    let hue = 0;\r
    let charge = 0;\r
    let introClock = settingsRef.current.intro && !reduced && generation === 0 ? 0 : Infinity;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let pageVisible = document.visibilityState !== 'hidden';\r
    let lost = false;\r
\r
    const updatePalette = (s: Settings) => {\r
      if (s.paletteKey === paletteKey) return;\r
      paletteKey = s.paletteKey;\r
      gl.bindTexture(gl.TEXTURE_2D, paletteTexture);\r
      gl.texImage2D(\r
        gl.TEXTURE_2D,\r
        0,\r
        gl.RGBA8,\r
        PALETTE_SIZE,\r
        2,\r
        0,\r
        gl.RGBA,\r
        gl.UNSIGNED_BYTE,\r
        buildPalette(s.palette, s.light)\r
      );\r
    };\r
\r
    const buildField = (total: number, width: number, height: number, previous: Field | null): Field => {\r
      const rand = random(1337);\r
      const margin = 0.06;\r
      const spanX = width * (1 + margin * 2);\r
      const spanY = height * (1 + margin * 2);\r
      const cols = Math.max(1, Math.ceil(Math.sqrt((total * spanX) / spanY)));\r
      const rows = Math.max(1, Math.ceil(total / cols));\r
      const cells = Array.from({ length: cols * rows }, (_, index) => index);\r
      for (let index = cells.length - 1; index > 0; index--) {\r
        const swap = Math.floor(rand() * (index + 1));\r
        [cells[index], cells[swap]] = [cells[swap], cells[index]];\r
      }\r
      const depths = Array.from({ length: total }, () => rand() * 2 - 1).sort((a, b) => a - b);\r
      const next: Field = {\r
        total,\r
        width,\r
        height,\r
        homeX: new Float32Array(total),\r
        homeY: new Float32Array(total),\r
        band: new Float32Array(total),\r
        phase: new Float32Array(total),\r
        agility: new Float32Array(total),\r
        delay: new Float32Array(total),\r
        orbit: new Float32Array(total),\r
        x: new Float32Array(total),\r
        y: new Float32Array(total),\r
        vx: new Float32Array(total),\r
        vy: new Float32Array(total),\r
        particles: new Float32Array(total * 4),\r
        seeds: new Float32Array(total * 4)\r
      };\r
      for (let index = 0; index < total; index++) {\r
        const cell = cells[index];\r
        const hx = -width * margin + (((cell % cols) + 0.5 + (rand() - 0.5) * 0.85) / cols) * spanX;\r
        const hy = -height * margin + ((Math.floor(cell / cols) + 0.5 + (rand() - 0.5) * 0.85) / rows) * spanY;\r
        next.homeX[index] = hx;\r
        next.homeY[index] = hy;\r
        next.band[index] = rand() * 2 - 1;\r
        next.phase[index] = rand() * Math.PI * 2;\r
        next.agility[index] = 0.75 + rand() * 0.5;\r
        next.delay[index] = rand();\r
        if (previous && index < previous.total) {\r
          next.x[index] = (previous.x[index] / previous.width) * width;\r
          next.y[index] = (previous.y[index] / previous.height) * height;\r
          next.vx[index] = previous.vx[index];\r
          next.vy[index] = previous.vy[index];\r
          next.orbit[index] = previous.orbit[index];\r
        } else {\r
          next.x[index] = hx;\r
          next.y[index] = introClock === 0 ? hy + height * (0.45 + next.delay[index] * 0.4) : hy;\r
        }\r
        next.seeds[index * 4] = depths[index];\r
        next.seeds[index * 4 + 1] = next.phase[index];\r
        next.seeds[index * 4 + 2] = rand();\r
        next.seeds[index * 4 + 3] = rand();\r
      }\r
      gl.bindBuffer(gl.ARRAY_BUFFER, seedBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, next.seeds, gl.STATIC_DRAW);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, particleBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, next.particles.byteLength, gl.DYNAMIC_DRAW);\r
      return next;\r
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
      if (!cursor.ready) {\r
        cursor.x = cursor.tx = cssWidth / 2;\r
        cursor.y = cursor.ty = cssHeight / 2;\r
        cursor.ready = true;\r
      }\r
      if (\r
        !field ||\r
        field.total !== s.count ||\r
        Math.abs(field.width - cssWidth) > 0.5 ||\r
        Math.abs(field.height - cssHeight) > 0.5\r
      ) {\r
        field = buildField(s.count, cssWidth, cssHeight, field);\r
      }\r
    };\r
\r
    const simulate = (s: Settings, dt: number) => {\r
      if (!field) return;\r
      const unit = size.height / WORLD_HEIGHT;\r
      const ringPx = s.ring * unit * (1 - 0.38 * charge);\r
      const magnetPx = Math.max(s.magnet * unit, 1);\r
      const spread = (5 / (s.tightness + 0.1)) * unit;\r
      const wavePx = s.waveAmplitude * unit * 0.5;\r
      const omegaBase = 2.2 + s.follow * 80;\r
      const spinRate = (s.rotation + charge * 3) * (reduced ? 0.3 : 1);\r
      const centerX = size.width / 2;\r
      const centerY = size.height / 2;\r
      const edge = magnetPx * 0.18;\r
      const { homeX, homeY, band, phase, agility, delay, orbit, x, y, vx, vy, particles, seeds, total } = field;\r
      for (let index = 0; index < total; index++) {\r
        const parallax = 1 - seeds[index * 4] * 0.12 * s.depth;\r
        const cx = centerX + (cursor.x - centerX) * parallax;\r
        const cy = centerY + (cursor.y - centerY) * parallax;\r
        const hx = homeX[index];\r
        const hy = homeY[index] + Math.sin(time * 0.7 + phase[index]) * unit * 0.12 * s.waveAmplitude;\r
        const dx = hx - cx;\r
        const dy = hy - cy;\r
        const dist = Math.sqrt(dx * dx + dy * dy);\r
        const capture = 1 - clamp((dist - (magnetPx - edge)) / (edge * 2), 0, 1);\r
        const ease = capture * capture * (3 - 2 * capture);\r
        let turn = orbit[index] + spinRate * ease * dt;\r
        turn -= Math.atan2(Math.sin(turn), Math.cos(turn)) * (1 - ease) * Math.min(1, dt * 2.5);\r
        orbit[index] = turn;\r
        let tx = hx;\r
        let ty = hy;\r
        if (ease > 0 || Math.abs(turn) > 1e-4) {\r
          const angle = Math.atan2(dy, dx) + turn;\r
          const wave =\r
            wavePx *\r
            (0.6 * Math.sin(angle * s.waveCount - time * s.waveSpeed * 2) +\r
              0.4 * Math.sin(phase[index] + time * s.waveSpeed * 1.3));\r
          const radius = dist + (ringPx + wave + band[index] * spread - dist) * ease;\r
          tx = cx + Math.cos(angle) * radius;\r
          ty = cy + Math.sin(angle) * radius;\r
        }\r
        const omega = introClock < delay[index] * 0.9 ? 0 : omegaBase * agility[index];\r
        const damping = 1.64 * omega;\r
        const stiffness = omega * omega;\r
        const steps = Math.min(4, Math.max(1, Math.ceil(omega * dt * 2)));\r
        const h = dt / steps;\r
        for (let step = 0; step < steps; step++) {\r
          vx[index] += ((tx - x[index]) * stiffness - vx[index] * damping) * h;\r
          vy[index] += ((ty - y[index]) * stiffness - vy[index] * damping) * h;\r
          x[index] += vx[index] * h;\r
          y[index] += vy[index] * h;\r
        }\r
        particles[index * 4] = x[index];\r
        particles[index * 4 + 1] = y[index];\r
        particles[index * 4 + 2] = vx[index];\r
        particles[index * 4 + 3] = vy[index];\r
      }\r
    };\r
\r
    const burst = (s: Settings, strength: number) => {\r
      if (!field) return;\r
      const unit = size.height / WORLD_HEIGHT;\r
      const reach = Math.max(s.magnet, s.ring) * unit * 1.8;\r
      const { x, y, vx, vy, agility, total } = field;\r
      for (let index = 0; index < total; index++) {\r
        const dx = x[index] - cursor.x;\r
        const dy = y[index] - cursor.y;\r
        const dist = Math.sqrt(dx * dx + dy * dy) + 1e-3;\r
        const kick = unit * 110 * strength * Math.exp(-Math.pow(dist / reach, 2)) * agility[index];\r
        vx[index] += (dx / dist) * kick;\r
        vy[index] += (dy / dist) * kick;\r
      }\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (lost || !field) return;\r
      const s = settingsRef.current;\r
      updatePalette(s);\r
      const dt = clamp((now - last) / 1000 || 0, 0, 1 / 30);\r
      last = Math.max(last, now);\r
      const pace = reduced ? 0.3 : 1;\r
      time += dt * pace;\r
      hue += dt * s.colorSpeed * pace;\r
      if (introClock < 3) introClock += dt;\r
      charge = pointer.down ? Math.min(1, charge + dt / 0.9) : Math.max(0, charge - dt * 4);\r
\r
      const idle = performance.now() - pointer.moved > 2000 || !pointer.inside;\r
      if (s.autoAnimate && !reduced && (idle || !s.interactive)) {\r
        cursor.tx = size.width / 2 + Math.sin(time * 0.5) * (size.width / 4);\r
        cursor.ty = size.height / 2 + Math.cos(time) * (size.height / 4);\r
      } else if (s.interactive && pointer.inside) {\r
        cursor.tx = pointer.x;\r
        cursor.ty = pointer.y;\r
      }\r
      cursor.vx += ((cursor.tx - cursor.x) * 49 - cursor.vx * 14) * dt;\r
      cursor.vy += ((cursor.ty - cursor.y) * 49 - cursor.vy * 14) * dt;\r
      cursor.x += cursor.vx * dt;\r
      cursor.y += cursor.vy * dt;\r
\r
      simulate(s, dt);\r
\r
      const unit = size.height / WORLD_HEIGHT;\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      gl.useProgram(shader.program);\r
      gl.bindVertexArray(vao);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, particleBuffer);\r
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, field.particles);\r
      const u = shader.uniforms;\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, paletteTexture);\r
      gl.uniform1i(u.uPalette, 0);\r
      gl.uniform2f(u.uSize, size.width, size.height);\r
      gl.uniform1f(u.uPixel, size.ratio);\r
      gl.uniform2f(u.uCursor, cursor.x, cursor.y);\r
      gl.uniform1f(u.uRing, s.ring * unit * (1 - 0.38 * charge));\r
      gl.uniform1f(u.uBand, Math.max(unit * 6, 1));\r
      gl.uniform1f(u.uParticle, s.size * unit * 0.6);\r
      gl.uniform1f(u.uAmbient, s.ambient);\r
      gl.uniform1f(u.uTime, time);\r
      gl.uniform1f(u.uPulse, s.pulse);\r
      gl.uniform1f(u.uVariance, s.variance);\r
      gl.uniform1f(u.uDepth, s.depth);\r
      gl.uniform1f(u.uShape, s.shape);\r
      gl.uniform1f(u.uColorMode, s.colorMode);\r
      gl.uniform1f(u.uStops, s.palette.length);\r
      gl.uniform1f(u.uHue, hue);\r
      gl.uniform1f(u.uReveal, introClock < 3 ? clamp(introClock / 0.6, 0, 1) : 1);\r
      gl.uniform1f(u.uStreak, unit * 30);\r
      gl.uniform1f(u.uCharge, charge);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, field.total);\r
\r
      if (visible && pageVisible) raf = requestAnimationFrame(frame);\r
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
      pointer.inside = spot.inside;\r
      if (!spot.inside) return;\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.moved = performance.now();\r
    };\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      const spot = locate(event);\r
      if (!spot.inside || !s.interactive) return;\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = true;\r
      pointer.moved = performance.now();\r
      if (s.clickBurst && !reduced) pointer.down = true;\r
    };\r
    const onPointerUp = (event: PointerEvent) => {\r
      if (pointer.down) burst(settingsRef.current, 0.45 + charge);\r
      pointer.down = false;\r
      if (event.pointerType !== 'mouse') pointer.inside = false;\r
    };\r
    const onLeave = () => {\r
      pointer.inside = false;\r
      pointer.down = false;\r
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
        gl.deleteBuffer(cornerBuffer);\r
        gl.deleteBuffer(particleBuffer);\r
        gl.deleteBuffer(seedBuffer);\r
        gl.deleteTexture(paletteTexture);\r
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
export default Antigravity;\r
`,o={usage:`import Antigravity from './Antigravity';

<div style={{ width: '100%', height: '400px', position: 'relative' }}>
  <Antigravity
    colors={['#5227FF', '#FF9FFC', '#B497CF']}
    count={1500}
    magnetRadius={9}
    ringRadius={7}
    particleSize={0.9}
    autoAnimate={true}
  />
</div>`,code:n,css:r,tailwind:e,tsCode:t,tsTailwind:a};export{o as antigravity};
