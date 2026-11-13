const r=`'use client';\r
\r
import { useEffect, useRef, useState } from 'react';\r
import './LiquidEther.css';\r
\r
const PIXEL_BUDGET = 2.4e6;\r
const MAX_CELLS = 140000;\r
const PRESSURE_STEPS = 32;\r
const PALETTE_SIZE = 256;\r
\r
const VERTEX = \`#version 300 es\r
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));\r
out vec2 vUv;\r
void main() {\r
  vUv = corners[gl_VertexID] * 0.5 + 0.5;\r
  gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);\r
}\`;\r
\r
const HEADER = \`#version 300 es\r
precision highp float;\r
precision highp sampler2D;\r
in vec2 vUv;\r
out vec4 fragColor;\r
uniform vec2 uTexel;\r
\`;\r
\r
const SPLAT = \`\${HEADER}\r
uniform sampler2D uVelocity;\r
uniform vec2 uSize;\r
uniform vec4 uSegment;\r
uniform vec2 uForce;\r
uniform float uRadius;\r
\r
float segment(vec2 p, vec2 a, vec2 b) {\r
  vec2 ab = b - a;\r
  float t = clamp(dot(p - a, ab) / max(dot(ab, ab), 1e-4), 0.0, 1.0);\r
  return length(p - a - ab * t);\r
}\r
\r
void main() {\r
  float d = segment(vUv * uSize, uSegment.xy, uSegment.zw) / uRadius;\r
  vec2 velocity = texture(uVelocity, vUv).xy + uForce * exp(-d * d * 6.0);\r
  fragColor = vec4(velocity, 0.0, 1.0);\r
}\`;\r
\r
const SMOOTH = \`\${HEADER}\r
uniform sampler2D uVelocity;\r
uniform float uAmount;\r
\r
void main() {\r
  vec2 center = texture(uVelocity, vUv).xy;\r
  vec2 around =\r
    texture(uVelocity, vUv - vec2(uTexel.x, 0.0)).xy +\r
    texture(uVelocity, vUv + vec2(uTexel.x, 0.0)).xy +\r
    texture(uVelocity, vUv - vec2(0.0, uTexel.y)).xy +\r
    texture(uVelocity, vUv + vec2(0.0, uTexel.y)).xy;\r
  fragColor = vec4(mix(center, around * 0.25, uAmount), 0.0, 1.0);\r
}\`;\r
\r
const DIVERGENCE = \`\${HEADER}\r
uniform sampler2D uVelocity;\r
uniform float uWalls;\r
\r
void main() {\r
  vec2 center = texture(uVelocity, vUv).xy;\r
  float left = texture(uVelocity, vUv - vec2(uTexel.x, 0.0)).x;\r
  float right = texture(uVelocity, vUv + vec2(uTexel.x, 0.0)).x;\r
  float down = texture(uVelocity, vUv - vec2(0.0, uTexel.y)).y;\r
  float up = texture(uVelocity, vUv + vec2(0.0, uTexel.y)).y;\r
  float edge = uWalls > 0.5 ? -1.0 : 0.0;\r
  if (vUv.x - uTexel.x < 0.0) left = edge * center.x;\r
  if (vUv.x + uTexel.x > 1.0) right = edge * center.x;\r
  if (vUv.y - uTexel.y < 0.0) down = edge * center.y;\r
  if (vUv.y + uTexel.y > 1.0) up = edge * center.y;\r
  fragColor = vec4(0.5 * (right - left + up - down), 0.0, 0.0, 1.0);\r
}\`;\r
\r
const EDGE = \`\r
uniform float uWalls;\r
\r
float pressureAt(sampler2D field, vec2 uv) {\r
  vec2 inside = step(vec2(0.0), uv) * step(uv, vec2(1.0));\r
  return texture(field, uv).x * mix(inside.x * inside.y, 1.0, uWalls);\r
}\r
\`;\r
\r
const PRESSURE = \`\${HEADER}\r
uniform sampler2D uPressure;\r
uniform sampler2D uDivergence;\r
\${EDGE}\r
void main() {\r
  vec2 reach = uTexel * 2.0;\r
  float sum =\r
    pressureAt(uPressure, vUv - vec2(reach.x, 0.0)) +\r
    pressureAt(uPressure, vUv + vec2(reach.x, 0.0)) +\r
    pressureAt(uPressure, vUv - vec2(0.0, reach.y)) +\r
    pressureAt(uPressure, vUv + vec2(0.0, reach.y));\r
  fragColor = vec4(sum * 0.25 - texture(uDivergence, vUv).x, 0.0, 0.0, 1.0);\r
}\`;\r
\r
const PROJECT = \`\${HEADER}\r
uniform sampler2D uPressure;\r
uniform sampler2D uVelocity;\r
\${EDGE}\r
void main() {\r
  float left = pressureAt(uPressure, vUv - vec2(uTexel.x, 0.0));\r
  float right = pressureAt(uPressure, vUv + vec2(uTexel.x, 0.0));\r
  float down = pressureAt(uPressure, vUv - vec2(0.0, uTexel.y));\r
  float up = pressureAt(uPressure, vUv + vec2(0.0, uTexel.y));\r
  vec2 velocity = texture(uVelocity, vUv).xy - 0.5 * vec2(right - left, up - down);\r
  fragColor = vec4(velocity, 0.0, 1.0);\r
}\`;\r
\r
const ADVECT = \`\${HEADER}\r
uniform sampler2D uVelocity;\r
uniform vec2 uStep;\r
uniform float uKeep;\r
uniform float uWalls;\r
\r
vec2 at(vec2 uv) {\r
  vec2 outside = max(-uv, uv - 1.0) / uTexel;\r
  float open = clamp(1.0 - max(outside.x, outside.y) / 1.5, 0.0, 1.0);\r
  return texture(uVelocity, uv).xy * mix(open, 1.0, uWalls);\r
}\r
\r
void main() {\r
  vec2 start = vUv - at(vUv) * uStep;\r
  vec2 back = start + at(start) * uStep;\r
  vec2 corrected = vUv - (back - vUv) * 0.5;\r
  vec2 origin = corrected - at(corrected) * uStep;\r
  vec2 a = at(origin + vec2(-0.5, -0.5) * uTexel);\r
  vec2 b = at(origin + vec2(0.5, -0.5) * uTexel);\r
  vec2 c = at(origin + vec2(-0.5, 0.5) * uTexel);\r
  vec2 d = at(origin + vec2(0.5, 0.5) * uTexel);\r
  vec2 velocity = clamp(at(origin), min(min(a, b), min(c, d)), max(max(a, b), max(c, d)));\r
  fragColor = vec4(velocity * uKeep, 0.0, 1.0);\r
}\`;\r
\r
const DISPLAY = \`\${HEADER}\r
uniform sampler2D uVelocity;\r
uniform sampler2D uPalette;\r
uniform vec2 uSimSize;\r
uniform float uSpeedScale;\r
uniform float uLight;\r
uniform vec4 uBackground;\r
\r
vec2 velocityAt(vec2 uv) {\r
  vec2 st = uv * uSimSize - 0.5;\r
  vec2 i = floor(st);\r
  vec2 f = st - i;\r
  vec2 f2 = f * f;\r
  vec2 f3 = f2 * f;\r
  vec2 w0 = (-f3 + 3.0 * f2 - 3.0 * f + 1.0) / 6.0;\r
  vec2 w1 = (3.0 * f3 - 6.0 * f2 + 4.0) / 6.0;\r
  vec2 w2 = (-3.0 * f3 + 3.0 * f2 + 3.0 * f + 1.0) / 6.0;\r
  vec2 w3 = f3 / 6.0;\r
  vec2 g0 = w0 + w1;\r
  vec2 g1 = w2 + w3;\r
  vec2 h0 = (i - 0.5 + w1 / g0) / uSimSize;\r
  vec2 h1 = (i + 1.5 + w3 / g1) / uSimSize;\r
  vec2 a = texture(uVelocity, vec2(h0.x, h0.y)).xy;\r
  vec2 b = texture(uVelocity, vec2(h1.x, h0.y)).xy;\r
  vec2 c = texture(uVelocity, vec2(h0.x, h1.y)).xy;\r
  vec2 d = texture(uVelocity, vec2(h1.x, h1.y)).xy;\r
  return g0.y * (g0.x * a + g1.x * b) + g1.y * (g0.x * c + g1.x * d);\r
}\r
\r
void main() {\r
  float speed = length(velocityAt(vUv)) * uSpeedScale;\r
  float level = speed < 0.75 ? speed : 0.75 + 0.25 * tanh((speed - 0.75) * 4.0);\r
  vec3 ink = texture(uPalette, vec2(level, 0.5)).rgb;\r
  float alpha = level;\r
  if (uLight > 0.5) {\r
    float hollow = smoothstep(0.7, 1.6, speed);\r
    alpha = smoothstep(0.08, 0.5, level) * mix(0.85, 0.1, hollow);\r
  } else {\r
    float hot = 1.0 - exp(-max(speed - 0.75, 0.0) * 1.2);\r
    ink = mix(ink, min(ink * 1.8 + 0.06, vec3(1.0)), hot);\r
  }\r
  vec3 color = ink * alpha + uBackground.rgb * uBackground.a * (1.0 - alpha);\r
  float coverage = alpha + uBackground.a * (1.0 - alpha);\r
  float grain = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));\r
  color += (grain - 0.5) / 255.0 * step(0.002, coverage);\r
  fragColor = vec4(clamp(color, vec3(0.0), vec3(coverage)), coverage);\r
}\`;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const keepFor = (persistence, dt) => Math.pow(0.5, dt / (0.35 + persistence * persistence * 12));\r
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
const buildPalette = colors => {\r
  const stops = [];\r
  colors.forEach(color => {\r
    const parsed = parseColor(color);\r
    if (parsed) stops.push(parsed);\r
  });\r
  if (!stops.length) stops.push([1, 1, 1]);\r
  const values = stops.map(color => color.map(toLinear));\r
  const data = new Uint8Array(PALETTE_SIZE * 4);\r
  for (let index = 0; index < PALETTE_SIZE; index++) {\r
    const t = clamp((index / (PALETTE_SIZE - 1)) * values.length - 0.5, 0, values.length - 1);\r
    const from = Math.min(Math.floor(t), Math.max(values.length - 2, 0));\r
    const to = Math.min(from + 1, values.length - 1);\r
    const k = t - from;\r
    const eased = k * k * (3 - 2 * k);\r
    for (let channel = 0; channel < 3; channel++) {\r
      const value = values[from][channel] + (values[to][channel] - values[from][channel]) * eased;\r
      data[index * 4 + channel] = Math.round(clamp(value, 0, 1) * 255);\r
    }\r
    data[index * 4 + 3] = 255;\r
  }\r
  return data;\r
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
const link = (gl, fragmentSource) => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);\r
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
const LiquidEther = ({\r
  colors = ['#5227FF', '#FF9FFC', '#B497CF'],\r
  intensity = 1,\r
  mouseForce = 20,\r
  cursorSize = 100,\r
  persistence = 0.75,\r
  viscosity = 0,\r
  resolution = 0.5,\r
  bounceEdges = false,\r
  clickBurst = true,\r
  autoDemo = true,\r
  autoSpeed = 0.5,\r
  autoIntensity = 2.2,\r
  autoResumeDelay = 1000,\r
  intro = true,\r
  lightMode = false,\r
  backgroundColor = 'transparent',\r
  maxDevicePixelRatio = 2,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const [generation, setGeneration] = useState(0);\r
  const palette = Array.isArray(colors) ? colors : [colors];\r
  const background = backgroundColor === 'transparent' ? null : parseColor(backgroundColor);\r
\r
  const settings = {\r
    colors: palette,\r
    paletteKey: palette.join(','),\r
    intensity: Math.max(0, intensity),\r
    force: Math.max(0, mouseForce),\r
    radius: clamp(cursorSize, 4, 600),\r
    persistence: clamp(persistence, 0, 1),\r
    viscosity: clamp(viscosity, 0, 1),\r
    resolution: clamp(resolution, 0.05, 1),\r
    walls: bounceEdges,\r
    clickBurst,\r
    autoDemo,\r
    autoSpeed: Math.max(0, autoSpeed),\r
    autoIntensity: Math.max(0, autoIntensity),\r
    autoResumeDelay: Math.max(0, autoResumeDelay),\r
    intro,\r
    light: lightMode,\r
    background: background ? [...background, 1] : [0, 0, 0, 0],\r
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
    if (!gl) return;\r
    if (!gl.getExtension('EXT_color_buffer_float') && !gl.getExtension('EXT_color_buffer_half_float')) return;\r
\r
    const programs = {\r
      splat: link(gl, SPLAT),\r
      smooth: link(gl, SMOOTH),\r
      divergence: link(gl, DIVERGENCE),\r
      pressure: link(gl, PRESSURE),\r
      project: link(gl, PROJECT),\r
      advect: link(gl, ADVECT),\r
      display: link(gl, DISPLAY)\r
    };\r
    if (Object.values(programs).some(entry => !entry)) return;\r
\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
    const vao = gl.createVertexArray();\r
    const size = { width: 1, height: 1 };\r
    const grid = { width: 0, height: 0 };\r
    const targets = {};\r
    const pointer = {\r
      x: 0,\r
      y: 0,\r
      fromX: 0,\r
      fromY: 0,\r
      dx: 0,\r
      dy: 0,\r
      inside: false,\r
      ready: false,\r
      moved: false,\r
      last: 0\r
    };\r
    const auto = { phase: Math.random() * 100, x: 0, y: 0, ready: false, ramp: 0 };\r
    const opening = { active: settingsRef.current.intro && !reduced && generation === 0, time: 0 };\r
    const splats = [];\r
    const puffs = [];\r
    let energy = 1;\r
    let lastInput = -Infinity;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let pageVisible = document.visibilityState !== 'hidden';\r
    let lost = false;\r
    let paletteKey = '';\r
\r
    const paletteTexture = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, paletteTexture);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
\r
    const updatePalette = s => {\r
      if (s.paletteKey === paletteKey) return;\r
      paletteKey = s.paletteKey;\r
      gl.bindTexture(gl.TEXTURE_2D, paletteTexture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, PALETTE_SIZE, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, buildPalette(s.colors));\r
    };\r
\r
    const makeTarget = (width, height, channels) => {\r
      const texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texImage2D(\r
        gl.TEXTURE_2D,\r
        0,\r
        channels === 2 ? gl.RG16F : gl.R16F,\r
        width,\r
        height,\r
        0,\r
        channels === 2 ? gl.RG : gl.RED,\r
        gl.HALF_FLOAT,\r
        null\r
      );\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      const framebuffer = gl.createFramebuffer();\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      return { texture, framebuffer };\r
    };\r
\r
    const dropTargets = () => {\r
      Object.keys(targets).forEach(key => {\r
        gl.deleteTexture(targets[key].texture);\r
        gl.deleteFramebuffer(targets[key].framebuffer);\r
        delete targets[key];\r
      });\r
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
      const base = s.resolution * 0.5;\r
      const scale = base * Math.min(1, Math.sqrt(MAX_CELLS / (cssWidth * cssHeight * base * base)));\r
      const gridWidth = clamp(Math.round(cssWidth * scale), 16, 1024);\r
      const gridHeight = clamp(Math.round(cssHeight * scale), 16, 1024);\r
      if (gridWidth === grid.width && gridHeight === grid.height) return;\r
      dropTargets();\r
      grid.width = gridWidth;\r
      grid.height = gridHeight;\r
      targets.velocity = makeTarget(gridWidth, gridHeight, 2);\r
      targets.velocityNext = makeTarget(gridWidth, gridHeight, 2);\r
      targets.divergence = makeTarget(gridWidth, gridHeight, 1);\r
      targets.pressure = makeTarget(gridWidth, gridHeight, 1);\r
      targets.pressureNext = makeTarget(gridWidth, gridHeight, 1);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
    };\r
\r
    const swap = (a, b) => {\r
      const held = targets[a];\r
      targets[a] = targets[b];\r
      targets[b] = held;\r
    };\r
\r
    const bindTexture = (unit, texture, location) => {\r
      gl.activeTexture(gl.TEXTURE0 + unit);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.uniform1i(location, unit);\r
    };\r
\r
    const run = (entry, output, bind) => {\r
      gl.useProgram(entry.program);\r
      gl.uniform2f(entry.uniforms.uTexel, 1 / grid.width, 1 / grid.height);\r
      bind(entry.uniforms);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, output ? output.framebuffer : null);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const simulate = (s, dt) => {\r
      gl.viewport(0, 0, grid.width, grid.height);\r
      const walls = s.walls ? 1 : 0;\r
      splats.forEach(splat => {\r
        run(programs.splat, targets.velocityNext, u => {\r
          bindTexture(0, targets.velocity.texture, u.uVelocity);\r
          gl.uniform2f(u.uSize, size.width, size.height);\r
          gl.uniform4f(u.uSegment, splat.ax, splat.ay, splat.bx, splat.by);\r
          gl.uniform2f(u.uForce, splat.vx, splat.vy);\r
          gl.uniform1f(u.uRadius, splat.radius);\r
        });\r
        swap('velocity', 'velocityNext');\r
      });\r
      splats.length = 0;\r
      const passes = Math.ceil(s.viscosity * 4);\r
      for (let pass = 0; pass < passes; pass++) {\r
        run(programs.smooth, targets.velocityNext, u => {\r
          bindTexture(0, targets.velocity.texture, u.uVelocity);\r
          gl.uniform1f(u.uAmount, Math.min(1, s.viscosity * 4 - pass) * 0.9);\r
        });\r
        swap('velocity', 'velocityNext');\r
      }\r
      run(programs.divergence, targets.divergence, u => {\r
        bindTexture(0, targets.velocity.texture, u.uVelocity);\r
        gl.uniform1f(u.uWalls, walls);\r
      });\r
      for (let iteration = 0; iteration < PRESSURE_STEPS; iteration++) {\r
        run(programs.pressure, targets.pressureNext, u => {\r
          bindTexture(0, targets.pressure.texture, u.uPressure);\r
          bindTexture(1, targets.divergence.texture, u.uDivergence);\r
          gl.uniform1f(u.uWalls, walls);\r
        });\r
        swap('pressure', 'pressureNext');\r
      }\r
      run(programs.project, targets.velocityNext, u => {\r
        bindTexture(0, targets.pressure.texture, u.uPressure);\r
        bindTexture(1, targets.velocity.texture, u.uVelocity);\r
        gl.uniform1f(u.uWalls, walls);\r
      });\r
      swap('velocity', 'velocityNext');\r
      run(programs.advect, targets.velocityNext, u => {\r
        bindTexture(0, targets.velocity.texture, u.uVelocity);\r
        gl.uniform2f(u.uStep, dt / size.width, dt / size.height);\r
        gl.uniform1f(u.uKeep, keepFor(s.persistence, dt));\r
        gl.uniform1f(u.uWalls, walls);\r
      });\r
      swap('velocity', 'velocityNext');\r
    };\r
\r
    const render = s => {\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      run(programs.display, null, u => {\r
        bindTexture(0, targets.velocity.texture, u.uVelocity);\r
        bindTexture(1, paletteTexture, u.uPalette);\r
        gl.uniform2f(u.uSimSize, grid.width, grid.height);\r
        gl.uniform1f(u.uSpeedScale, (1.25 * s.intensity) / (0.84 * Math.max(size.width, size.height)));\r
        gl.uniform1f(u.uLight, s.light ? 1 : 0);\r
        gl.uniform4f(u.uBackground, s.background[0], s.background[1], s.background[2], s.background[3]);\r
      });\r
    };\r
\r
    const wander = t => {\r
      const x = 0.62 * Math.sin(t * 0.83 + 1.3) + 0.38 * Math.sin(t * 1.71 + 0.4);\r
      const y = 0.6 * Math.sin(t * 1.07 + 2.1) + 0.4 * Math.cos(t * 0.61 + 0.7);\r
      return [(0.5 + 0.41 * x) * size.width, (0.5 + 0.41 * y) * size.height];\r
    };\r
\r
    const sweep = t => {\r
      const k = clamp(t / 1.4, 0, 1);\r
      const eased = 1 - Math.pow(1 - k, 3);\r
      const angle = -0.6 + eased * 3.6;\r
      const reach = 0.08 + 0.3 * eased;\r
      return [\r
        (0.5 + Math.cos(angle) * reach * 1.1) * size.width,\r
        (0.5 + Math.sin(angle) * reach * (size.width / size.height) * 0.75) * size.height\r
      ];\r
    };\r
\r
    const addStroke = (from, to, dt, scale, radius) => {\r
      splats.push({\r
        ax: from[0],\r
        ay: from[1],\r
        bx: to[0],\r
        by: to[1],\r
        vx: clamp(((to[0] - from[0]) / dt) * scale, -6000, 6000),\r
        vy: clamp(((to[1] - from[1]) / dt) * scale, -6000, 6000),\r
        radius\r
      });\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (lost) return;\r
      const s = settingsRef.current;\r
      updatePalette(s);\r
      const dt = clamp((now - last) / 1000 || 0, 0, 1 / 30);\r
      last = Math.max(last, now);\r
      const pace = Math.min(1, dt * 60);\r
      const idle = now - lastInput > s.autoResumeDelay && !pointer.inside;\r
\r
      if (opening.active && dt > 0) {\r
        const from = sweep(opening.time);\r
        opening.time += dt;\r
        const fade = Math.sin(Math.min(1, opening.time / 1.4) * Math.PI);\r
        addStroke(from, sweep(opening.time), dt, 0.2 * fade, s.radius);\r
        energy = 1;\r
        if (opening.time > 1.4) opening.active = false;\r
      } else if (s.autoDemo && !reduced && idle && dt > 0) {\r
        auto.ramp = Math.min(1, auto.ramp + dt / 0.8);\r
        auto.phase += dt * s.autoSpeed * 1.6;\r
        const spot = wander(auto.phase);\r
        if (auto.ready) {\r
          const gust = 0.3 + 0.7 * Math.pow(0.5 + 0.5 * Math.sin(auto.phase * 2.6), 2);\r
          const scale = (s.force / 20) * 0.45 * s.autoIntensity * auto.ramp * auto.ramp * gust * pace;\r
          addStroke([auto.x, auto.y], spot, dt, scale, s.radius);\r
        }\r
        auto.x = spot[0];\r
        auto.y = spot[1];\r
        auto.ready = true;\r
        energy = 1;\r
      } else {\r
        auto.ramp = 0;\r
      }\r
\r
      if (pointer.moved && dt > 0) {\r
        pointer.moved = false;\r
        const span = Math.max(now - pointer.last, 8) / 1000;\r
        addStroke([pointer.fromX, pointer.fromY], [pointer.x, pointer.y], span, (s.force / 20) * 0.15 * pace, s.radius);\r
        pointer.fromX = pointer.x;\r
        pointer.fromY = pointer.y;\r
        pointer.last = now;\r
        energy = 1;\r
      }\r
\r
      const puff = puffs.shift();\r
      if (puff) splats.push(puff);\r
\r
      gl.bindVertexArray(vao);\r
      gl.disable(gl.BLEND);\r
      if (dt > 0) simulate(s, dt);\r
      render(s);\r
\r
      energy *= keepFor(s.persistence, dt);\r
      const busy = opening.active || (s.autoDemo && !reduced) || energy > 0.002 || puffs.length > 0 || pointer.moved;\r
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
        y: rect.bottom - event.clientY,\r
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
      if (!spot.inside) {\r
        pointer.ready = false;\r
        return;\r
      }\r
      lastInput = performance.now();\r
      opening.active = false;\r
      if (!pointer.ready) {\r
        pointer.fromX = spot.x;\r
        pointer.fromY = spot.y;\r
        pointer.x = spot.x;\r
        pointer.y = spot.y;\r
        pointer.last = lastInput;\r
        pointer.ready = true;\r
      }\r
      const travelX = spot.x - pointer.x;\r
      const travelY = spot.y - pointer.y;\r
      if (Math.hypot(travelX, travelY) > 0.5) {\r
        pointer.dx = pointer.dx * 0.7 + travelX * 0.3;\r
        pointer.dy = pointer.dy * 0.7 + travelY * 0.3;\r
      }\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.moved = true;\r
      wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      const spot = locate(event);\r
      if (!spot.inside) return;\r
      lastInput = performance.now();\r
      if (!s.clickBurst || reduced) return;\r
      const angle =\r
        Math.hypot(pointer.dx, pointer.dy) > 1 ? Math.atan2(pointer.dy, pointer.dx) : Math.random() * Math.PI * 2;\r
      const dirX = Math.cos(angle);\r
      const dirY = Math.sin(angle);\r
      const reach = s.radius * 0.5;\r
      const push = 1400 * (s.force / 20);\r
      puffs.push({\r
        ax: spot.x - dirX * reach,\r
        ay: spot.y - dirY * reach,\r
        bx: spot.x + dirX * reach,\r
        by: spot.y + dirY * reach,\r
        vx: dirX * push,\r
        vy: dirY * push,\r
        radius: s.radius * 0.9\r
      });\r
      if (puffs.length > 4) puffs.shift();\r
      energy = 1;\r
      wake();\r
    };\r
\r
    const onLeave = () => {\r
      pointer.inside = false;\r
      pointer.ready = false;\r
    };\r
\r
    const onPointerUp = event => {\r
      if (event.pointerType !== 'mouse') onLeave();\r
    };\r
\r
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
        dropTargets();\r
        gl.deleteTexture(paletteTexture);\r
        gl.deleteVertexArray(vao);\r
        Object.values(programs).forEach(entry => gl.deleteProgram(entry.program));\r
      }\r
    };\r
  }, [generation]);\r
\r
  return (\r
    <div ref={containerRef} className={\`liquid-ether\${className ? \` \${className}\` : ''}\`} style={style}>\r
      <canvas ref={canvasRef} className="liquid-ether__canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default LiquidEther;\r
`,e=`.liquid-ether {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.liquid-ether__canvas {\r
  position: absolute;\r
  inset: 0;\r
  display: block;\r
  width: 100%;\r
  height: 100%;\r
}\r
`,n=`'use client';\r
\r
import { useEffect, useRef, useState } from 'react';\r
\r
const PIXEL_BUDGET = 2.4e6;\r
const MAX_CELLS = 140000;\r
const PRESSURE_STEPS = 32;\r
const PALETTE_SIZE = 256;\r
\r
const VERTEX = \`#version 300 es\r
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));\r
out vec2 vUv;\r
void main() {\r
  vUv = corners[gl_VertexID] * 0.5 + 0.5;\r
  gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);\r
}\`;\r
\r
const HEADER = \`#version 300 es\r
precision highp float;\r
precision highp sampler2D;\r
in vec2 vUv;\r
out vec4 fragColor;\r
uniform vec2 uTexel;\r
\`;\r
\r
const SPLAT = \`\${HEADER}\r
uniform sampler2D uVelocity;\r
uniform vec2 uSize;\r
uniform vec4 uSegment;\r
uniform vec2 uForce;\r
uniform float uRadius;\r
\r
float segment(vec2 p, vec2 a, vec2 b) {\r
  vec2 ab = b - a;\r
  float t = clamp(dot(p - a, ab) / max(dot(ab, ab), 1e-4), 0.0, 1.0);\r
  return length(p - a - ab * t);\r
}\r
\r
void main() {\r
  float d = segment(vUv * uSize, uSegment.xy, uSegment.zw) / uRadius;\r
  vec2 velocity = texture(uVelocity, vUv).xy + uForce * exp(-d * d * 6.0);\r
  fragColor = vec4(velocity, 0.0, 1.0);\r
}\`;\r
\r
const SMOOTH = \`\${HEADER}\r
uniform sampler2D uVelocity;\r
uniform float uAmount;\r
\r
void main() {\r
  vec2 center = texture(uVelocity, vUv).xy;\r
  vec2 around =\r
    texture(uVelocity, vUv - vec2(uTexel.x, 0.0)).xy +\r
    texture(uVelocity, vUv + vec2(uTexel.x, 0.0)).xy +\r
    texture(uVelocity, vUv - vec2(0.0, uTexel.y)).xy +\r
    texture(uVelocity, vUv + vec2(0.0, uTexel.y)).xy;\r
  fragColor = vec4(mix(center, around * 0.25, uAmount), 0.0, 1.0);\r
}\`;\r
\r
const DIVERGENCE = \`\${HEADER}\r
uniform sampler2D uVelocity;\r
uniform float uWalls;\r
\r
void main() {\r
  vec2 center = texture(uVelocity, vUv).xy;\r
  float left = texture(uVelocity, vUv - vec2(uTexel.x, 0.0)).x;\r
  float right = texture(uVelocity, vUv + vec2(uTexel.x, 0.0)).x;\r
  float down = texture(uVelocity, vUv - vec2(0.0, uTexel.y)).y;\r
  float up = texture(uVelocity, vUv + vec2(0.0, uTexel.y)).y;\r
  float edge = uWalls > 0.5 ? -1.0 : 0.0;\r
  if (vUv.x - uTexel.x < 0.0) left = edge * center.x;\r
  if (vUv.x + uTexel.x > 1.0) right = edge * center.x;\r
  if (vUv.y - uTexel.y < 0.0) down = edge * center.y;\r
  if (vUv.y + uTexel.y > 1.0) up = edge * center.y;\r
  fragColor = vec4(0.5 * (right - left + up - down), 0.0, 0.0, 1.0);\r
}\`;\r
\r
const EDGE = \`\r
uniform float uWalls;\r
\r
float pressureAt(sampler2D field, vec2 uv) {\r
  vec2 inside = step(vec2(0.0), uv) * step(uv, vec2(1.0));\r
  return texture(field, uv).x * mix(inside.x * inside.y, 1.0, uWalls);\r
}\r
\`;\r
\r
const PRESSURE = \`\${HEADER}\r
uniform sampler2D uPressure;\r
uniform sampler2D uDivergence;\r
\${EDGE}\r
void main() {\r
  vec2 reach = uTexel * 2.0;\r
  float sum =\r
    pressureAt(uPressure, vUv - vec2(reach.x, 0.0)) +\r
    pressureAt(uPressure, vUv + vec2(reach.x, 0.0)) +\r
    pressureAt(uPressure, vUv - vec2(0.0, reach.y)) +\r
    pressureAt(uPressure, vUv + vec2(0.0, reach.y));\r
  fragColor = vec4(sum * 0.25 - texture(uDivergence, vUv).x, 0.0, 0.0, 1.0);\r
}\`;\r
\r
const PROJECT = \`\${HEADER}\r
uniform sampler2D uPressure;\r
uniform sampler2D uVelocity;\r
\${EDGE}\r
void main() {\r
  float left = pressureAt(uPressure, vUv - vec2(uTexel.x, 0.0));\r
  float right = pressureAt(uPressure, vUv + vec2(uTexel.x, 0.0));\r
  float down = pressureAt(uPressure, vUv - vec2(0.0, uTexel.y));\r
  float up = pressureAt(uPressure, vUv + vec2(0.0, uTexel.y));\r
  vec2 velocity = texture(uVelocity, vUv).xy - 0.5 * vec2(right - left, up - down);\r
  fragColor = vec4(velocity, 0.0, 1.0);\r
}\`;\r
\r
const ADVECT = \`\${HEADER}\r
uniform sampler2D uVelocity;\r
uniform vec2 uStep;\r
uniform float uKeep;\r
uniform float uWalls;\r
\r
vec2 at(vec2 uv) {\r
  vec2 outside = max(-uv, uv - 1.0) / uTexel;\r
  float open = clamp(1.0 - max(outside.x, outside.y) / 1.5, 0.0, 1.0);\r
  return texture(uVelocity, uv).xy * mix(open, 1.0, uWalls);\r
}\r
\r
void main() {\r
  vec2 start = vUv - at(vUv) * uStep;\r
  vec2 back = start + at(start) * uStep;\r
  vec2 corrected = vUv - (back - vUv) * 0.5;\r
  vec2 origin = corrected - at(corrected) * uStep;\r
  vec2 a = at(origin + vec2(-0.5, -0.5) * uTexel);\r
  vec2 b = at(origin + vec2(0.5, -0.5) * uTexel);\r
  vec2 c = at(origin + vec2(-0.5, 0.5) * uTexel);\r
  vec2 d = at(origin + vec2(0.5, 0.5) * uTexel);\r
  vec2 velocity = clamp(at(origin), min(min(a, b), min(c, d)), max(max(a, b), max(c, d)));\r
  fragColor = vec4(velocity * uKeep, 0.0, 1.0);\r
}\`;\r
\r
const DISPLAY = \`\${HEADER}\r
uniform sampler2D uVelocity;\r
uniform sampler2D uPalette;\r
uniform vec2 uSimSize;\r
uniform float uSpeedScale;\r
uniform float uLight;\r
uniform vec4 uBackground;\r
\r
vec2 velocityAt(vec2 uv) {\r
  vec2 st = uv * uSimSize - 0.5;\r
  vec2 i = floor(st);\r
  vec2 f = st - i;\r
  vec2 f2 = f * f;\r
  vec2 f3 = f2 * f;\r
  vec2 w0 = (-f3 + 3.0 * f2 - 3.0 * f + 1.0) / 6.0;\r
  vec2 w1 = (3.0 * f3 - 6.0 * f2 + 4.0) / 6.0;\r
  vec2 w2 = (-3.0 * f3 + 3.0 * f2 + 3.0 * f + 1.0) / 6.0;\r
  vec2 w3 = f3 / 6.0;\r
  vec2 g0 = w0 + w1;\r
  vec2 g1 = w2 + w3;\r
  vec2 h0 = (i - 0.5 + w1 / g0) / uSimSize;\r
  vec2 h1 = (i + 1.5 + w3 / g1) / uSimSize;\r
  vec2 a = texture(uVelocity, vec2(h0.x, h0.y)).xy;\r
  vec2 b = texture(uVelocity, vec2(h1.x, h0.y)).xy;\r
  vec2 c = texture(uVelocity, vec2(h0.x, h1.y)).xy;\r
  vec2 d = texture(uVelocity, vec2(h1.x, h1.y)).xy;\r
  return g0.y * (g0.x * a + g1.x * b) + g1.y * (g0.x * c + g1.x * d);\r
}\r
\r
void main() {\r
  float speed = length(velocityAt(vUv)) * uSpeedScale;\r
  float level = speed < 0.75 ? speed : 0.75 + 0.25 * tanh((speed - 0.75) * 4.0);\r
  vec3 ink = texture(uPalette, vec2(level, 0.5)).rgb;\r
  float alpha = level;\r
  if (uLight > 0.5) {\r
    float hollow = smoothstep(0.7, 1.6, speed);\r
    alpha = smoothstep(0.08, 0.5, level) * mix(0.85, 0.1, hollow);\r
  } else {\r
    float hot = 1.0 - exp(-max(speed - 0.75, 0.0) * 1.2);\r
    ink = mix(ink, min(ink * 1.8 + 0.06, vec3(1.0)), hot);\r
  }\r
  vec3 color = ink * alpha + uBackground.rgb * uBackground.a * (1.0 - alpha);\r
  float coverage = alpha + uBackground.a * (1.0 - alpha);\r
  float grain = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));\r
  color += (grain - 0.5) / 255.0 * step(0.002, coverage);\r
  fragColor = vec4(clamp(color, vec3(0.0), vec3(coverage)), coverage);\r
}\`;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const keepFor = (persistence, dt) => Math.pow(0.5, dt / (0.35 + persistence * persistence * 12));\r
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
const buildPalette = colors => {\r
  const stops = [];\r
  colors.forEach(color => {\r
    const parsed = parseColor(color);\r
    if (parsed) stops.push(parsed);\r
  });\r
  if (!stops.length) stops.push([1, 1, 1]);\r
  const values = stops.map(color => color.map(toLinear));\r
  const data = new Uint8Array(PALETTE_SIZE * 4);\r
  for (let index = 0; index < PALETTE_SIZE; index++) {\r
    const t = clamp((index / (PALETTE_SIZE - 1)) * values.length - 0.5, 0, values.length - 1);\r
    const from = Math.min(Math.floor(t), Math.max(values.length - 2, 0));\r
    const to = Math.min(from + 1, values.length - 1);\r
    const k = t - from;\r
    const eased = k * k * (3 - 2 * k);\r
    for (let channel = 0; channel < 3; channel++) {\r
      const value = values[from][channel] + (values[to][channel] - values[from][channel]) * eased;\r
      data[index * 4 + channel] = Math.round(clamp(value, 0, 1) * 255);\r
    }\r
    data[index * 4 + 3] = 255;\r
  }\r
  return data;\r
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
const link = (gl, fragmentSource) => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);\r
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
const LiquidEther = ({\r
  colors = ['#5227FF', '#FF9FFC', '#B497CF'],\r
  intensity = 1,\r
  mouseForce = 20,\r
  cursorSize = 100,\r
  persistence = 0.75,\r
  viscosity = 0,\r
  resolution = 0.5,\r
  bounceEdges = false,\r
  clickBurst = true,\r
  autoDemo = true,\r
  autoSpeed = 0.5,\r
  autoIntensity = 2.2,\r
  autoResumeDelay = 1000,\r
  intro = true,\r
  lightMode = false,\r
  backgroundColor = 'transparent',\r
  maxDevicePixelRatio = 2,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const [generation, setGeneration] = useState(0);\r
  const palette = Array.isArray(colors) ? colors : [colors];\r
  const background = backgroundColor === 'transparent' ? null : parseColor(backgroundColor);\r
\r
  const settings = {\r
    colors: palette,\r
    paletteKey: palette.join(','),\r
    intensity: Math.max(0, intensity),\r
    force: Math.max(0, mouseForce),\r
    radius: clamp(cursorSize, 4, 600),\r
    persistence: clamp(persistence, 0, 1),\r
    viscosity: clamp(viscosity, 0, 1),\r
    resolution: clamp(resolution, 0.05, 1),\r
    walls: bounceEdges,\r
    clickBurst,\r
    autoDemo,\r
    autoSpeed: Math.max(0, autoSpeed),\r
    autoIntensity: Math.max(0, autoIntensity),\r
    autoResumeDelay: Math.max(0, autoResumeDelay),\r
    intro,\r
    light: lightMode,\r
    background: background ? [...background, 1] : [0, 0, 0, 0],\r
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
    if (!gl) return;\r
    if (!gl.getExtension('EXT_color_buffer_float') && !gl.getExtension('EXT_color_buffer_half_float')) return;\r
\r
    const programs = {\r
      splat: link(gl, SPLAT),\r
      smooth: link(gl, SMOOTH),\r
      divergence: link(gl, DIVERGENCE),\r
      pressure: link(gl, PRESSURE),\r
      project: link(gl, PROJECT),\r
      advect: link(gl, ADVECT),\r
      display: link(gl, DISPLAY)\r
    };\r
    if (Object.values(programs).some(entry => !entry)) return;\r
\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
    const vao = gl.createVertexArray();\r
    const size = { width: 1, height: 1 };\r
    const grid = { width: 0, height: 0 };\r
    const targets = {};\r
    const pointer = {\r
      x: 0,\r
      y: 0,\r
      fromX: 0,\r
      fromY: 0,\r
      dx: 0,\r
      dy: 0,\r
      inside: false,\r
      ready: false,\r
      moved: false,\r
      last: 0\r
    };\r
    const auto = { phase: Math.random() * 100, x: 0, y: 0, ready: false, ramp: 0 };\r
    const opening = { active: settingsRef.current.intro && !reduced && generation === 0, time: 0 };\r
    const splats = [];\r
    const puffs = [];\r
    let energy = 1;\r
    let lastInput = -Infinity;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let pageVisible = document.visibilityState !== 'hidden';\r
    let lost = false;\r
    let paletteKey = '';\r
\r
    const paletteTexture = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, paletteTexture);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
\r
    const updatePalette = s => {\r
      if (s.paletteKey === paletteKey) return;\r
      paletteKey = s.paletteKey;\r
      gl.bindTexture(gl.TEXTURE_2D, paletteTexture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, PALETTE_SIZE, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, buildPalette(s.colors));\r
    };\r
\r
    const makeTarget = (width, height, channels) => {\r
      const texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texImage2D(\r
        gl.TEXTURE_2D,\r
        0,\r
        channels === 2 ? gl.RG16F : gl.R16F,\r
        width,\r
        height,\r
        0,\r
        channels === 2 ? gl.RG : gl.RED,\r
        gl.HALF_FLOAT,\r
        null\r
      );\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      const framebuffer = gl.createFramebuffer();\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      return { texture, framebuffer };\r
    };\r
\r
    const dropTargets = () => {\r
      Object.keys(targets).forEach(key => {\r
        gl.deleteTexture(targets[key].texture);\r
        gl.deleteFramebuffer(targets[key].framebuffer);\r
        delete targets[key];\r
      });\r
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
      const base = s.resolution * 0.5;\r
      const scale = base * Math.min(1, Math.sqrt(MAX_CELLS / (cssWidth * cssHeight * base * base)));\r
      const gridWidth = clamp(Math.round(cssWidth * scale), 16, 1024);\r
      const gridHeight = clamp(Math.round(cssHeight * scale), 16, 1024);\r
      if (gridWidth === grid.width && gridHeight === grid.height) return;\r
      dropTargets();\r
      grid.width = gridWidth;\r
      grid.height = gridHeight;\r
      targets.velocity = makeTarget(gridWidth, gridHeight, 2);\r
      targets.velocityNext = makeTarget(gridWidth, gridHeight, 2);\r
      targets.divergence = makeTarget(gridWidth, gridHeight, 1);\r
      targets.pressure = makeTarget(gridWidth, gridHeight, 1);\r
      targets.pressureNext = makeTarget(gridWidth, gridHeight, 1);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
    };\r
\r
    const swap = (a, b) => {\r
      const held = targets[a];\r
      targets[a] = targets[b];\r
      targets[b] = held;\r
    };\r
\r
    const bindTexture = (unit, texture, location) => {\r
      gl.activeTexture(gl.TEXTURE0 + unit);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.uniform1i(location, unit);\r
    };\r
\r
    const run = (entry, output, bind) => {\r
      gl.useProgram(entry.program);\r
      gl.uniform2f(entry.uniforms.uTexel, 1 / grid.width, 1 / grid.height);\r
      bind(entry.uniforms);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, output ? output.framebuffer : null);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const simulate = (s, dt) => {\r
      gl.viewport(0, 0, grid.width, grid.height);\r
      const walls = s.walls ? 1 : 0;\r
      splats.forEach(splat => {\r
        run(programs.splat, targets.velocityNext, u => {\r
          bindTexture(0, targets.velocity.texture, u.uVelocity);\r
          gl.uniform2f(u.uSize, size.width, size.height);\r
          gl.uniform4f(u.uSegment, splat.ax, splat.ay, splat.bx, splat.by);\r
          gl.uniform2f(u.uForce, splat.vx, splat.vy);\r
          gl.uniform1f(u.uRadius, splat.radius);\r
        });\r
        swap('velocity', 'velocityNext');\r
      });\r
      splats.length = 0;\r
      const passes = Math.ceil(s.viscosity * 4);\r
      for (let pass = 0; pass < passes; pass++) {\r
        run(programs.smooth, targets.velocityNext, u => {\r
          bindTexture(0, targets.velocity.texture, u.uVelocity);\r
          gl.uniform1f(u.uAmount, Math.min(1, s.viscosity * 4 - pass) * 0.9);\r
        });\r
        swap('velocity', 'velocityNext');\r
      }\r
      run(programs.divergence, targets.divergence, u => {\r
        bindTexture(0, targets.velocity.texture, u.uVelocity);\r
        gl.uniform1f(u.uWalls, walls);\r
      });\r
      for (let iteration = 0; iteration < PRESSURE_STEPS; iteration++) {\r
        run(programs.pressure, targets.pressureNext, u => {\r
          bindTexture(0, targets.pressure.texture, u.uPressure);\r
          bindTexture(1, targets.divergence.texture, u.uDivergence);\r
          gl.uniform1f(u.uWalls, walls);\r
        });\r
        swap('pressure', 'pressureNext');\r
      }\r
      run(programs.project, targets.velocityNext, u => {\r
        bindTexture(0, targets.pressure.texture, u.uPressure);\r
        bindTexture(1, targets.velocity.texture, u.uVelocity);\r
        gl.uniform1f(u.uWalls, walls);\r
      });\r
      swap('velocity', 'velocityNext');\r
      run(programs.advect, targets.velocityNext, u => {\r
        bindTexture(0, targets.velocity.texture, u.uVelocity);\r
        gl.uniform2f(u.uStep, dt / size.width, dt / size.height);\r
        gl.uniform1f(u.uKeep, keepFor(s.persistence, dt));\r
        gl.uniform1f(u.uWalls, walls);\r
      });\r
      swap('velocity', 'velocityNext');\r
    };\r
\r
    const render = s => {\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      run(programs.display, null, u => {\r
        bindTexture(0, targets.velocity.texture, u.uVelocity);\r
        bindTexture(1, paletteTexture, u.uPalette);\r
        gl.uniform2f(u.uSimSize, grid.width, grid.height);\r
        gl.uniform1f(u.uSpeedScale, (1.25 * s.intensity) / (0.84 * Math.max(size.width, size.height)));\r
        gl.uniform1f(u.uLight, s.light ? 1 : 0);\r
        gl.uniform4f(u.uBackground, s.background[0], s.background[1], s.background[2], s.background[3]);\r
      });\r
    };\r
\r
    const wander = t => {\r
      const x = 0.62 * Math.sin(t * 0.83 + 1.3) + 0.38 * Math.sin(t * 1.71 + 0.4);\r
      const y = 0.6 * Math.sin(t * 1.07 + 2.1) + 0.4 * Math.cos(t * 0.61 + 0.7);\r
      return [(0.5 + 0.41 * x) * size.width, (0.5 + 0.41 * y) * size.height];\r
    };\r
\r
    const sweep = t => {\r
      const k = clamp(t / 1.4, 0, 1);\r
      const eased = 1 - Math.pow(1 - k, 3);\r
      const angle = -0.6 + eased * 3.6;\r
      const reach = 0.08 + 0.3 * eased;\r
      return [\r
        (0.5 + Math.cos(angle) * reach * 1.1) * size.width,\r
        (0.5 + Math.sin(angle) * reach * (size.width / size.height) * 0.75) * size.height\r
      ];\r
    };\r
\r
    const addStroke = (from, to, dt, scale, radius) => {\r
      splats.push({\r
        ax: from[0],\r
        ay: from[1],\r
        bx: to[0],\r
        by: to[1],\r
        vx: clamp(((to[0] - from[0]) / dt) * scale, -6000, 6000),\r
        vy: clamp(((to[1] - from[1]) / dt) * scale, -6000, 6000),\r
        radius\r
      });\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (lost) return;\r
      const s = settingsRef.current;\r
      updatePalette(s);\r
      const dt = clamp((now - last) / 1000 || 0, 0, 1 / 30);\r
      last = Math.max(last, now);\r
      const pace = Math.min(1, dt * 60);\r
      const idle = now - lastInput > s.autoResumeDelay && !pointer.inside;\r
\r
      if (opening.active && dt > 0) {\r
        const from = sweep(opening.time);\r
        opening.time += dt;\r
        const fade = Math.sin(Math.min(1, opening.time / 1.4) * Math.PI);\r
        addStroke(from, sweep(opening.time), dt, 0.2 * fade, s.radius);\r
        energy = 1;\r
        if (opening.time > 1.4) opening.active = false;\r
      } else if (s.autoDemo && !reduced && idle && dt > 0) {\r
        auto.ramp = Math.min(1, auto.ramp + dt / 0.8);\r
        auto.phase += dt * s.autoSpeed * 1.6;\r
        const spot = wander(auto.phase);\r
        if (auto.ready) {\r
          const gust = 0.3 + 0.7 * Math.pow(0.5 + 0.5 * Math.sin(auto.phase * 2.6), 2);\r
          const scale = (s.force / 20) * 0.45 * s.autoIntensity * auto.ramp * auto.ramp * gust * pace;\r
          addStroke([auto.x, auto.y], spot, dt, scale, s.radius);\r
        }\r
        auto.x = spot[0];\r
        auto.y = spot[1];\r
        auto.ready = true;\r
        energy = 1;\r
      } else {\r
        auto.ramp = 0;\r
      }\r
\r
      if (pointer.moved && dt > 0) {\r
        pointer.moved = false;\r
        const span = Math.max(now - pointer.last, 8) / 1000;\r
        addStroke([pointer.fromX, pointer.fromY], [pointer.x, pointer.y], span, (s.force / 20) * 0.15 * pace, s.radius);\r
        pointer.fromX = pointer.x;\r
        pointer.fromY = pointer.y;\r
        pointer.last = now;\r
        energy = 1;\r
      }\r
\r
      const puff = puffs.shift();\r
      if (puff) splats.push(puff);\r
\r
      gl.bindVertexArray(vao);\r
      gl.disable(gl.BLEND);\r
      if (dt > 0) simulate(s, dt);\r
      render(s);\r
\r
      energy *= keepFor(s.persistence, dt);\r
      const busy = opening.active || (s.autoDemo && !reduced) || energy > 0.002 || puffs.length > 0 || pointer.moved;\r
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
        y: rect.bottom - event.clientY,\r
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
      if (!spot.inside) {\r
        pointer.ready = false;\r
        return;\r
      }\r
      lastInput = performance.now();\r
      opening.active = false;\r
      if (!pointer.ready) {\r
        pointer.fromX = spot.x;\r
        pointer.fromY = spot.y;\r
        pointer.x = spot.x;\r
        pointer.y = spot.y;\r
        pointer.last = lastInput;\r
        pointer.ready = true;\r
      }\r
      const travelX = spot.x - pointer.x;\r
      const travelY = spot.y - pointer.y;\r
      if (Math.hypot(travelX, travelY) > 0.5) {\r
        pointer.dx = pointer.dx * 0.7 + travelX * 0.3;\r
        pointer.dy = pointer.dy * 0.7 + travelY * 0.3;\r
      }\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.moved = true;\r
      wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      const spot = locate(event);\r
      if (!spot.inside) return;\r
      lastInput = performance.now();\r
      if (!s.clickBurst || reduced) return;\r
      const angle =\r
        Math.hypot(pointer.dx, pointer.dy) > 1 ? Math.atan2(pointer.dy, pointer.dx) : Math.random() * Math.PI * 2;\r
      const dirX = Math.cos(angle);\r
      const dirY = Math.sin(angle);\r
      const reach = s.radius * 0.5;\r
      const push = 1400 * (s.force / 20);\r
      puffs.push({\r
        ax: spot.x - dirX * reach,\r
        ay: spot.y - dirY * reach,\r
        bx: spot.x + dirX * reach,\r
        by: spot.y + dirY * reach,\r
        vx: dirX * push,\r
        vy: dirY * push,\r
        radius: s.radius * 0.9\r
      });\r
      if (puffs.length > 4) puffs.shift();\r
      energy = 1;\r
      wake();\r
    };\r
\r
    const onLeave = () => {\r
      pointer.inside = false;\r
      pointer.ready = false;\r
    };\r
\r
    const onPointerUp = event => {\r
      if (event.pointerType !== 'mouse') onLeave();\r
    };\r
\r
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
        dropTargets();\r
        gl.deleteTexture(paletteTexture);\r
        gl.deleteVertexArray(vao);\r
        Object.values(programs).forEach(entry => gl.deleteProgram(entry.program));\r
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
export default LiquidEther;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, useState, type CSSProperties } from 'react';\r
import './LiquidEther.css';\r
\r
export interface LiquidEtherProps {\r
  colors?: string[];\r
  intensity?: number;\r
  mouseForce?: number;\r
  cursorSize?: number;\r
  persistence?: number;\r
  viscosity?: number;\r
  resolution?: number;\r
  bounceEdges?: boolean;\r
  clickBurst?: boolean;\r
  autoDemo?: boolean;\r
  autoSpeed?: number;\r
  autoIntensity?: number;\r
  autoResumeDelay?: number;\r
  intro?: boolean;\r
  lightMode?: boolean;\r
  backgroundColor?: string;\r
  maxDevicePixelRatio?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Settings {\r
  colors: string[];\r
  paletteKey: string;\r
  intensity: number;\r
  force: number;\r
  radius: number;\r
  persistence: number;\r
  viscosity: number;\r
  resolution: number;\r
  walls: boolean;\r
  clickBurst: boolean;\r
  autoDemo: boolean;\r
  autoSpeed: number;\r
  autoIntensity: number;\r
  autoResumeDelay: number;\r
  intro: boolean;\r
  light: boolean;\r
  background: number[];\r
  maxRatio: number;\r
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
}\r
\r
interface Splat {\r
  ax: number;\r
  ay: number;\r
  bx: number;\r
  by: number;\r
  vx: number;\r
  vy: number;\r
  radius: number;\r
}\r
\r
type Point = [number, number];\r
type TargetName = 'velocity' | 'velocityNext' | 'divergence' | 'pressure' | 'pressureNext';\r
type ProgramName = 'splat' | 'smooth' | 'divergence' | 'pressure' | 'project' | 'advect' | 'display';\r
\r
const PIXEL_BUDGET = 2.4e6;\r
const MAX_CELLS = 140000;\r
const PRESSURE_STEPS = 32;\r
const PALETTE_SIZE = 256;\r
\r
const VERTEX = \`#version 300 es\r
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));\r
out vec2 vUv;\r
void main() {\r
  vUv = corners[gl_VertexID] * 0.5 + 0.5;\r
  gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);\r
}\`;\r
\r
const HEADER = \`#version 300 es\r
precision highp float;\r
precision highp sampler2D;\r
in vec2 vUv;\r
out vec4 fragColor;\r
uniform vec2 uTexel;\r
\`;\r
\r
const SPLAT = \`\${HEADER}\r
uniform sampler2D uVelocity;\r
uniform vec2 uSize;\r
uniform vec4 uSegment;\r
uniform vec2 uForce;\r
uniform float uRadius;\r
\r
float segment(vec2 p, vec2 a, vec2 b) {\r
  vec2 ab = b - a;\r
  float t = clamp(dot(p - a, ab) / max(dot(ab, ab), 1e-4), 0.0, 1.0);\r
  return length(p - a - ab * t);\r
}\r
\r
void main() {\r
  float d = segment(vUv * uSize, uSegment.xy, uSegment.zw) / uRadius;\r
  vec2 velocity = texture(uVelocity, vUv).xy + uForce * exp(-d * d * 6.0);\r
  fragColor = vec4(velocity, 0.0, 1.0);\r
}\`;\r
\r
const SMOOTH = \`\${HEADER}\r
uniform sampler2D uVelocity;\r
uniform float uAmount;\r
\r
void main() {\r
  vec2 center = texture(uVelocity, vUv).xy;\r
  vec2 around =\r
    texture(uVelocity, vUv - vec2(uTexel.x, 0.0)).xy +\r
    texture(uVelocity, vUv + vec2(uTexel.x, 0.0)).xy +\r
    texture(uVelocity, vUv - vec2(0.0, uTexel.y)).xy +\r
    texture(uVelocity, vUv + vec2(0.0, uTexel.y)).xy;\r
  fragColor = vec4(mix(center, around * 0.25, uAmount), 0.0, 1.0);\r
}\`;\r
\r
const DIVERGENCE = \`\${HEADER}\r
uniform sampler2D uVelocity;\r
uniform float uWalls;\r
\r
void main() {\r
  vec2 center = texture(uVelocity, vUv).xy;\r
  float left = texture(uVelocity, vUv - vec2(uTexel.x, 0.0)).x;\r
  float right = texture(uVelocity, vUv + vec2(uTexel.x, 0.0)).x;\r
  float down = texture(uVelocity, vUv - vec2(0.0, uTexel.y)).y;\r
  float up = texture(uVelocity, vUv + vec2(0.0, uTexel.y)).y;\r
  float edge = uWalls > 0.5 ? -1.0 : 0.0;\r
  if (vUv.x - uTexel.x < 0.0) left = edge * center.x;\r
  if (vUv.x + uTexel.x > 1.0) right = edge * center.x;\r
  if (vUv.y - uTexel.y < 0.0) down = edge * center.y;\r
  if (vUv.y + uTexel.y > 1.0) up = edge * center.y;\r
  fragColor = vec4(0.5 * (right - left + up - down), 0.0, 0.0, 1.0);\r
}\`;\r
\r
const EDGE = \`\r
uniform float uWalls;\r
\r
float pressureAt(sampler2D field, vec2 uv) {\r
  vec2 inside = step(vec2(0.0), uv) * step(uv, vec2(1.0));\r
  return texture(field, uv).x * mix(inside.x * inside.y, 1.0, uWalls);\r
}\r
\`;\r
\r
const PRESSURE = \`\${HEADER}\r
uniform sampler2D uPressure;\r
uniform sampler2D uDivergence;\r
\${EDGE}\r
void main() {\r
  vec2 reach = uTexel * 2.0;\r
  float sum =\r
    pressureAt(uPressure, vUv - vec2(reach.x, 0.0)) +\r
    pressureAt(uPressure, vUv + vec2(reach.x, 0.0)) +\r
    pressureAt(uPressure, vUv - vec2(0.0, reach.y)) +\r
    pressureAt(uPressure, vUv + vec2(0.0, reach.y));\r
  fragColor = vec4(sum * 0.25 - texture(uDivergence, vUv).x, 0.0, 0.0, 1.0);\r
}\`;\r
\r
const PROJECT = \`\${HEADER}\r
uniform sampler2D uPressure;\r
uniform sampler2D uVelocity;\r
\${EDGE}\r
void main() {\r
  float left = pressureAt(uPressure, vUv - vec2(uTexel.x, 0.0));\r
  float right = pressureAt(uPressure, vUv + vec2(uTexel.x, 0.0));\r
  float down = pressureAt(uPressure, vUv - vec2(0.0, uTexel.y));\r
  float up = pressureAt(uPressure, vUv + vec2(0.0, uTexel.y));\r
  vec2 velocity = texture(uVelocity, vUv).xy - 0.5 * vec2(right - left, up - down);\r
  fragColor = vec4(velocity, 0.0, 1.0);\r
}\`;\r
\r
const ADVECT = \`\${HEADER}\r
uniform sampler2D uVelocity;\r
uniform vec2 uStep;\r
uniform float uKeep;\r
uniform float uWalls;\r
\r
vec2 at(vec2 uv) {\r
  vec2 outside = max(-uv, uv - 1.0) / uTexel;\r
  float open = clamp(1.0 - max(outside.x, outside.y) / 1.5, 0.0, 1.0);\r
  return texture(uVelocity, uv).xy * mix(open, 1.0, uWalls);\r
}\r
\r
void main() {\r
  vec2 start = vUv - at(vUv) * uStep;\r
  vec2 back = start + at(start) * uStep;\r
  vec2 corrected = vUv - (back - vUv) * 0.5;\r
  vec2 origin = corrected - at(corrected) * uStep;\r
  vec2 a = at(origin + vec2(-0.5, -0.5) * uTexel);\r
  vec2 b = at(origin + vec2(0.5, -0.5) * uTexel);\r
  vec2 c = at(origin + vec2(-0.5, 0.5) * uTexel);\r
  vec2 d = at(origin + vec2(0.5, 0.5) * uTexel);\r
  vec2 velocity = clamp(at(origin), min(min(a, b), min(c, d)), max(max(a, b), max(c, d)));\r
  fragColor = vec4(velocity * uKeep, 0.0, 1.0);\r
}\`;\r
\r
const DISPLAY = \`\${HEADER}\r
uniform sampler2D uVelocity;\r
uniform sampler2D uPalette;\r
uniform vec2 uSimSize;\r
uniform float uSpeedScale;\r
uniform float uLight;\r
uniform vec4 uBackground;\r
\r
vec2 velocityAt(vec2 uv) {\r
  vec2 st = uv * uSimSize - 0.5;\r
  vec2 i = floor(st);\r
  vec2 f = st - i;\r
  vec2 f2 = f * f;\r
  vec2 f3 = f2 * f;\r
  vec2 w0 = (-f3 + 3.0 * f2 - 3.0 * f + 1.0) / 6.0;\r
  vec2 w1 = (3.0 * f3 - 6.0 * f2 + 4.0) / 6.0;\r
  vec2 w2 = (-3.0 * f3 + 3.0 * f2 + 3.0 * f + 1.0) / 6.0;\r
  vec2 w3 = f3 / 6.0;\r
  vec2 g0 = w0 + w1;\r
  vec2 g1 = w2 + w3;\r
  vec2 h0 = (i - 0.5 + w1 / g0) / uSimSize;\r
  vec2 h1 = (i + 1.5 + w3 / g1) / uSimSize;\r
  vec2 a = texture(uVelocity, vec2(h0.x, h0.y)).xy;\r
  vec2 b = texture(uVelocity, vec2(h1.x, h0.y)).xy;\r
  vec2 c = texture(uVelocity, vec2(h0.x, h1.y)).xy;\r
  vec2 d = texture(uVelocity, vec2(h1.x, h1.y)).xy;\r
  return g0.y * (g0.x * a + g1.x * b) + g1.y * (g0.x * c + g1.x * d);\r
}\r
\r
void main() {\r
  float speed = length(velocityAt(vUv)) * uSpeedScale;\r
  float level = speed < 0.75 ? speed : 0.75 + 0.25 * tanh((speed - 0.75) * 4.0);\r
  vec3 ink = texture(uPalette, vec2(level, 0.5)).rgb;\r
  float alpha = level;\r
  if (uLight > 0.5) {\r
    float hollow = smoothstep(0.7, 1.6, speed);\r
    alpha = smoothstep(0.08, 0.5, level) * mix(0.85, 0.1, hollow);\r
  } else {\r
    float hot = 1.0 - exp(-max(speed - 0.75, 0.0) * 1.2);\r
    ink = mix(ink, min(ink * 1.8 + 0.06, vec3(1.0)), hot);\r
  }\r
  vec3 color = ink * alpha + uBackground.rgb * uBackground.a * (1.0 - alpha);\r
  float coverage = alpha + uBackground.a * (1.0 - alpha);\r
  float grain = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));\r
  color += (grain - 0.5) / 255.0 * step(0.002, coverage);\r
  fragColor = vec4(clamp(color, vec3(0.0), vec3(coverage)), coverage);\r
}\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const keepFor = (persistence: number, dt: number) => Math.pow(0.5, dt / (0.35 + persistence * persistence * 12));\r
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
const buildPalette = (colors: string[]) => {\r
  const stops: number[][] = [];\r
  colors.forEach(color => {\r
    const parsed = parseColor(color);\r
    if (parsed) stops.push(parsed);\r
  });\r
  if (!stops.length) stops.push([1, 1, 1]);\r
  const values = stops.map(color => color.map(toLinear));\r
  const data = new Uint8Array(PALETTE_SIZE * 4);\r
  for (let index = 0; index < PALETTE_SIZE; index++) {\r
    const t = clamp((index / (PALETTE_SIZE - 1)) * values.length - 0.5, 0, values.length - 1);\r
    const from = Math.min(Math.floor(t), Math.max(values.length - 2, 0));\r
    const to = Math.min(from + 1, values.length - 1);\r
    const k = t - from;\r
    const eased = k * k * (3 - 2 * k);\r
    for (let channel = 0; channel < 3; channel++) {\r
      const value = values[from][channel] + (values[to][channel] - values[from][channel]) * eased;\r
      data[index * 4 + channel] = Math.round(clamp(value, 0, 1) * 255);\r
    }\r
    data[index * 4 + 3] = 255;\r
  }\r
  return data;\r
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
const link = (gl: WebGL2RenderingContext, fragmentSource: string): Program | null => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);\r
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
const LiquidEther = ({\r
  colors = ['#5227FF', '#FF9FFC', '#B497CF'],\r
  intensity = 1,\r
  mouseForce = 20,\r
  cursorSize = 100,\r
  persistence = 0.75,\r
  viscosity = 0,\r
  resolution = 0.5,\r
  bounceEdges = false,\r
  clickBurst = true,\r
  autoDemo = true,\r
  autoSpeed = 0.5,\r
  autoIntensity = 2.2,\r
  autoResumeDelay = 1000,\r
  intro = true,\r
  lightMode = false,\r
  backgroundColor = 'transparent',\r
  maxDevicePixelRatio = 2,\r
  className = '',\r
  style\r
}: LiquidEtherProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const [generation, setGeneration] = useState(0);\r
  const palette = Array.isArray(colors) ? colors : [colors];\r
  const background = backgroundColor === 'transparent' ? null : parseColor(backgroundColor);\r
\r
  const settings: Settings = {\r
    colors: palette,\r
    paletteKey: palette.join(','),\r
    intensity: Math.max(0, intensity),\r
    force: Math.max(0, mouseForce),\r
    radius: clamp(cursorSize, 4, 600),\r
    persistence: clamp(persistence, 0, 1),\r
    viscosity: clamp(viscosity, 0, 1),\r
    resolution: clamp(resolution, 0.05, 1),\r
    walls: bounceEdges,\r
    clickBurst,\r
    autoDemo,\r
    autoSpeed: Math.max(0, autoSpeed),\r
    autoIntensity: Math.max(0, autoIntensity),\r
    autoResumeDelay: Math.max(0, autoResumeDelay),\r
    intro,\r
    light: lightMode,\r
    background: background ? [...background, 1] : [0, 0, 0, 0],\r
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
    if (!gl) return;\r
    if (!gl.getExtension('EXT_color_buffer_float') && !gl.getExtension('EXT_color_buffer_half_float')) return;\r
\r
    const programs = {\r
      splat: link(gl, SPLAT),\r
      smooth: link(gl, SMOOTH),\r
      divergence: link(gl, DIVERGENCE),\r
      pressure: link(gl, PRESSURE),\r
      project: link(gl, PROJECT),\r
      advect: link(gl, ADVECT),\r
      display: link(gl, DISPLAY)\r
    } as Record<ProgramName, Program>;\r
    if (Object.values(programs).some(entry => !entry)) return;\r
\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
    const vao = gl.createVertexArray();\r
    const size = { width: 1, height: 1 };\r
    const grid = { width: 0, height: 0 };\r
    const targets = {} as Record<TargetName, Target>;\r
    const pointer = {\r
      x: 0,\r
      y: 0,\r
      fromX: 0,\r
      fromY: 0,\r
      dx: 0,\r
      dy: 0,\r
      inside: false,\r
      ready: false,\r
      moved: false,\r
      last: 0\r
    };\r
    const auto = { phase: Math.random() * 100, x: 0, y: 0, ready: false, ramp: 0 };\r
    const opening = { active: settingsRef.current.intro && !reduced && generation === 0, time: 0 };\r
    const splats: Splat[] = [];\r
    const puffs: Splat[] = [];\r
    let energy = 1;\r
    let lastInput = -Infinity;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let pageVisible = document.visibilityState !== 'hidden';\r
    let lost = false;\r
    let paletteKey = '';\r
\r
    const paletteTexture = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, paletteTexture);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
\r
    const updatePalette = (s: Settings) => {\r
      if (s.paletteKey === paletteKey) return;\r
      paletteKey = s.paletteKey;\r
      gl.bindTexture(gl.TEXTURE_2D, paletteTexture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, PALETTE_SIZE, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, buildPalette(s.colors));\r
    };\r
\r
    const makeTarget = (width: number, height: number, channels: number): Target => {\r
      const texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texImage2D(\r
        gl.TEXTURE_2D,\r
        0,\r
        channels === 2 ? gl.RG16F : gl.R16F,\r
        width,\r
        height,\r
        0,\r
        channels === 2 ? gl.RG : gl.RED,\r
        gl.HALF_FLOAT,\r
        null\r
      );\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      const framebuffer = gl.createFramebuffer();\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      return { texture, framebuffer };\r
    };\r
\r
    const dropTargets = () => {\r
      (Object.keys(targets) as TargetName[]).forEach(key => {\r
        gl.deleteTexture(targets[key].texture);\r
        gl.deleteFramebuffer(targets[key].framebuffer);\r
        delete targets[key];\r
      });\r
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
      const base = s.resolution * 0.5;\r
      const scale = base * Math.min(1, Math.sqrt(MAX_CELLS / (cssWidth * cssHeight * base * base)));\r
      const gridWidth = clamp(Math.round(cssWidth * scale), 16, 1024);\r
      const gridHeight = clamp(Math.round(cssHeight * scale), 16, 1024);\r
      if (gridWidth === grid.width && gridHeight === grid.height) return;\r
      dropTargets();\r
      grid.width = gridWidth;\r
      grid.height = gridHeight;\r
      targets.velocity = makeTarget(gridWidth, gridHeight, 2);\r
      targets.velocityNext = makeTarget(gridWidth, gridHeight, 2);\r
      targets.divergence = makeTarget(gridWidth, gridHeight, 1);\r
      targets.pressure = makeTarget(gridWidth, gridHeight, 1);\r
      targets.pressureNext = makeTarget(gridWidth, gridHeight, 1);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
    };\r
\r
    const swap = (a: TargetName, b: TargetName) => {\r
      const held = targets[a];\r
      targets[a] = targets[b];\r
      targets[b] = held;\r
    };\r
\r
    const bindTexture = (unit: number, texture: WebGLTexture | null, location: WebGLUniformLocation | null) => {\r
      gl.activeTexture(gl.TEXTURE0 + unit);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.uniform1i(location, unit);\r
    };\r
\r
    const run = (entry: Program, output: Target | null, bind: (uniforms: Program['uniforms']) => void) => {\r
      gl.useProgram(entry.program);\r
      gl.uniform2f(entry.uniforms.uTexel, 1 / grid.width, 1 / grid.height);\r
      bind(entry.uniforms);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, output ? output.framebuffer : null);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const simulate = (s: Settings, dt: number) => {\r
      gl.viewport(0, 0, grid.width, grid.height);\r
      const walls = s.walls ? 1 : 0;\r
      splats.forEach(splat => {\r
        run(programs.splat, targets.velocityNext, u => {\r
          bindTexture(0, targets.velocity.texture, u.uVelocity);\r
          gl.uniform2f(u.uSize, size.width, size.height);\r
          gl.uniform4f(u.uSegment, splat.ax, splat.ay, splat.bx, splat.by);\r
          gl.uniform2f(u.uForce, splat.vx, splat.vy);\r
          gl.uniform1f(u.uRadius, splat.radius);\r
        });\r
        swap('velocity', 'velocityNext');\r
      });\r
      splats.length = 0;\r
      const passes = Math.ceil(s.viscosity * 4);\r
      for (let pass = 0; pass < passes; pass++) {\r
        run(programs.smooth, targets.velocityNext, u => {\r
          bindTexture(0, targets.velocity.texture, u.uVelocity);\r
          gl.uniform1f(u.uAmount, Math.min(1, s.viscosity * 4 - pass) * 0.9);\r
        });\r
        swap('velocity', 'velocityNext');\r
      }\r
      run(programs.divergence, targets.divergence, u => {\r
        bindTexture(0, targets.velocity.texture, u.uVelocity);\r
        gl.uniform1f(u.uWalls, walls);\r
      });\r
      for (let iteration = 0; iteration < PRESSURE_STEPS; iteration++) {\r
        run(programs.pressure, targets.pressureNext, u => {\r
          bindTexture(0, targets.pressure.texture, u.uPressure);\r
          bindTexture(1, targets.divergence.texture, u.uDivergence);\r
          gl.uniform1f(u.uWalls, walls);\r
        });\r
        swap('pressure', 'pressureNext');\r
      }\r
      run(programs.project, targets.velocityNext, u => {\r
        bindTexture(0, targets.pressure.texture, u.uPressure);\r
        bindTexture(1, targets.velocity.texture, u.uVelocity);\r
        gl.uniform1f(u.uWalls, walls);\r
      });\r
      swap('velocity', 'velocityNext');\r
      run(programs.advect, targets.velocityNext, u => {\r
        bindTexture(0, targets.velocity.texture, u.uVelocity);\r
        gl.uniform2f(u.uStep, dt / size.width, dt / size.height);\r
        gl.uniform1f(u.uKeep, keepFor(s.persistence, dt));\r
        gl.uniform1f(u.uWalls, walls);\r
      });\r
      swap('velocity', 'velocityNext');\r
    };\r
\r
    const render = (s: Settings) => {\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      run(programs.display, null, u => {\r
        bindTexture(0, targets.velocity.texture, u.uVelocity);\r
        bindTexture(1, paletteTexture, u.uPalette);\r
        gl.uniform2f(u.uSimSize, grid.width, grid.height);\r
        gl.uniform1f(u.uSpeedScale, (1.25 * s.intensity) / (0.84 * Math.max(size.width, size.height)));\r
        gl.uniform1f(u.uLight, s.light ? 1 : 0);\r
        gl.uniform4f(u.uBackground, s.background[0], s.background[1], s.background[2], s.background[3]);\r
      });\r
    };\r
\r
    const wander = (t: number): Point => {\r
      const x = 0.62 * Math.sin(t * 0.83 + 1.3) + 0.38 * Math.sin(t * 1.71 + 0.4);\r
      const y = 0.6 * Math.sin(t * 1.07 + 2.1) + 0.4 * Math.cos(t * 0.61 + 0.7);\r
      return [(0.5 + 0.41 * x) * size.width, (0.5 + 0.41 * y) * size.height];\r
    };\r
\r
    const sweep = (t: number): Point => {\r
      const k = clamp(t / 1.4, 0, 1);\r
      const eased = 1 - Math.pow(1 - k, 3);\r
      const angle = -0.6 + eased * 3.6;\r
      const reach = 0.08 + 0.3 * eased;\r
      return [\r
        (0.5 + Math.cos(angle) * reach * 1.1) * size.width,\r
        (0.5 + Math.sin(angle) * reach * (size.width / size.height) * 0.75) * size.height\r
      ];\r
    };\r
\r
    const addStroke = (from: Point, to: Point, dt: number, scale: number, radius: number) => {\r
      splats.push({\r
        ax: from[0],\r
        ay: from[1],\r
        bx: to[0],\r
        by: to[1],\r
        vx: clamp(((to[0] - from[0]) / dt) * scale, -6000, 6000),\r
        vy: clamp(((to[1] - from[1]) / dt) * scale, -6000, 6000),\r
        radius\r
      });\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (lost) return;\r
      const s = settingsRef.current;\r
      updatePalette(s);\r
      const dt = clamp((now - last) / 1000 || 0, 0, 1 / 30);\r
      last = Math.max(last, now);\r
      const pace = Math.min(1, dt * 60);\r
      const idle = now - lastInput > s.autoResumeDelay && !pointer.inside;\r
\r
      if (opening.active && dt > 0) {\r
        const from = sweep(opening.time);\r
        opening.time += dt;\r
        const fade = Math.sin(Math.min(1, opening.time / 1.4) * Math.PI);\r
        addStroke(from, sweep(opening.time), dt, 0.2 * fade, s.radius);\r
        energy = 1;\r
        if (opening.time > 1.4) opening.active = false;\r
      } else if (s.autoDemo && !reduced && idle && dt > 0) {\r
        auto.ramp = Math.min(1, auto.ramp + dt / 0.8);\r
        auto.phase += dt * s.autoSpeed * 1.6;\r
        const spot = wander(auto.phase);\r
        if (auto.ready) {\r
          const gust = 0.3 + 0.7 * Math.pow(0.5 + 0.5 * Math.sin(auto.phase * 2.6), 2);\r
          const scale = (s.force / 20) * 0.45 * s.autoIntensity * auto.ramp * auto.ramp * gust * pace;\r
          addStroke([auto.x, auto.y], spot, dt, scale, s.radius);\r
        }\r
        auto.x = spot[0];\r
        auto.y = spot[1];\r
        auto.ready = true;\r
        energy = 1;\r
      } else {\r
        auto.ramp = 0;\r
      }\r
\r
      if (pointer.moved && dt > 0) {\r
        pointer.moved = false;\r
        const span = Math.max(now - pointer.last, 8) / 1000;\r
        addStroke([pointer.fromX, pointer.fromY], [pointer.x, pointer.y], span, (s.force / 20) * 0.15 * pace, s.radius);\r
        pointer.fromX = pointer.x;\r
        pointer.fromY = pointer.y;\r
        pointer.last = now;\r
        energy = 1;\r
      }\r
\r
      const puff = puffs.shift();\r
      if (puff) splats.push(puff);\r
\r
      gl.bindVertexArray(vao);\r
      gl.disable(gl.BLEND);\r
      if (dt > 0) simulate(s, dt);\r
      render(s);\r
\r
      energy *= keepFor(s.persistence, dt);\r
      const busy = opening.active || (s.autoDemo && !reduced) || energy > 0.002 || puffs.length > 0 || pointer.moved;\r
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
        y: rect.bottom - event.clientY,\r
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
      if (!spot.inside) {\r
        pointer.ready = false;\r
        return;\r
      }\r
      lastInput = performance.now();\r
      opening.active = false;\r
      if (!pointer.ready) {\r
        pointer.fromX = spot.x;\r
        pointer.fromY = spot.y;\r
        pointer.x = spot.x;\r
        pointer.y = spot.y;\r
        pointer.last = lastInput;\r
        pointer.ready = true;\r
      }\r
      const travelX = spot.x - pointer.x;\r
      const travelY = spot.y - pointer.y;\r
      if (Math.hypot(travelX, travelY) > 0.5) {\r
        pointer.dx = pointer.dx * 0.7 + travelX * 0.3;\r
        pointer.dy = pointer.dy * 0.7 + travelY * 0.3;\r
      }\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.moved = true;\r
      wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      const spot = locate(event);\r
      if (!spot.inside) return;\r
      lastInput = performance.now();\r
      if (!s.clickBurst || reduced) return;\r
      const angle =\r
        Math.hypot(pointer.dx, pointer.dy) > 1 ? Math.atan2(pointer.dy, pointer.dx) : Math.random() * Math.PI * 2;\r
      const dirX = Math.cos(angle);\r
      const dirY = Math.sin(angle);\r
      const reach = s.radius * 0.5;\r
      const push = 1400 * (s.force / 20);\r
      puffs.push({\r
        ax: spot.x - dirX * reach,\r
        ay: spot.y - dirY * reach,\r
        bx: spot.x + dirX * reach,\r
        by: spot.y + dirY * reach,\r
        vx: dirX * push,\r
        vy: dirY * push,\r
        radius: s.radius * 0.9\r
      });\r
      if (puffs.length > 4) puffs.shift();\r
      energy = 1;\r
      wake();\r
    };\r
\r
    const onLeave = () => {\r
      pointer.inside = false;\r
      pointer.ready = false;\r
    };\r
\r
    const onPointerUp = (event: PointerEvent) => {\r
      if (event.pointerType !== 'mouse') onLeave();\r
    };\r
\r
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
        dropTargets();\r
        gl.deleteTexture(paletteTexture);\r
        gl.deleteVertexArray(vao);\r
        Object.values(programs).forEach(entry => gl.deleteProgram(entry.program));\r
      }\r
    };\r
  }, [generation]);\r
\r
  return (\r
    <div ref={containerRef} className={\`liquid-ether\${className ? \` \${className}\` : ''}\`} style={style}>\r
      <canvas ref={canvasRef} className="liquid-ether__canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default LiquidEther;\r
`,o=`'use client';\r
\r
import { useEffect, useRef, useState, type CSSProperties } from 'react';\r
\r
export interface LiquidEtherProps {\r
  colors?: string[];\r
  intensity?: number;\r
  mouseForce?: number;\r
  cursorSize?: number;\r
  persistence?: number;\r
  viscosity?: number;\r
  resolution?: number;\r
  bounceEdges?: boolean;\r
  clickBurst?: boolean;\r
  autoDemo?: boolean;\r
  autoSpeed?: number;\r
  autoIntensity?: number;\r
  autoResumeDelay?: number;\r
  intro?: boolean;\r
  lightMode?: boolean;\r
  backgroundColor?: string;\r
  maxDevicePixelRatio?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Settings {\r
  colors: string[];\r
  paletteKey: string;\r
  intensity: number;\r
  force: number;\r
  radius: number;\r
  persistence: number;\r
  viscosity: number;\r
  resolution: number;\r
  walls: boolean;\r
  clickBurst: boolean;\r
  autoDemo: boolean;\r
  autoSpeed: number;\r
  autoIntensity: number;\r
  autoResumeDelay: number;\r
  intro: boolean;\r
  light: boolean;\r
  background: number[];\r
  maxRatio: number;\r
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
}\r
\r
interface Splat {\r
  ax: number;\r
  ay: number;\r
  bx: number;\r
  by: number;\r
  vx: number;\r
  vy: number;\r
  radius: number;\r
}\r
\r
type Point = [number, number];\r
type TargetName = 'velocity' | 'velocityNext' | 'divergence' | 'pressure' | 'pressureNext';\r
type ProgramName = 'splat' | 'smooth' | 'divergence' | 'pressure' | 'project' | 'advect' | 'display';\r
\r
const PIXEL_BUDGET = 2.4e6;\r
const MAX_CELLS = 140000;\r
const PRESSURE_STEPS = 32;\r
const PALETTE_SIZE = 256;\r
\r
const VERTEX = \`#version 300 es\r
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));\r
out vec2 vUv;\r
void main() {\r
  vUv = corners[gl_VertexID] * 0.5 + 0.5;\r
  gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);\r
}\`;\r
\r
const HEADER = \`#version 300 es\r
precision highp float;\r
precision highp sampler2D;\r
in vec2 vUv;\r
out vec4 fragColor;\r
uniform vec2 uTexel;\r
\`;\r
\r
const SPLAT = \`\${HEADER}\r
uniform sampler2D uVelocity;\r
uniform vec2 uSize;\r
uniform vec4 uSegment;\r
uniform vec2 uForce;\r
uniform float uRadius;\r
\r
float segment(vec2 p, vec2 a, vec2 b) {\r
  vec2 ab = b - a;\r
  float t = clamp(dot(p - a, ab) / max(dot(ab, ab), 1e-4), 0.0, 1.0);\r
  return length(p - a - ab * t);\r
}\r
\r
void main() {\r
  float d = segment(vUv * uSize, uSegment.xy, uSegment.zw) / uRadius;\r
  vec2 velocity = texture(uVelocity, vUv).xy + uForce * exp(-d * d * 6.0);\r
  fragColor = vec4(velocity, 0.0, 1.0);\r
}\`;\r
\r
const SMOOTH = \`\${HEADER}\r
uniform sampler2D uVelocity;\r
uniform float uAmount;\r
\r
void main() {\r
  vec2 center = texture(uVelocity, vUv).xy;\r
  vec2 around =\r
    texture(uVelocity, vUv - vec2(uTexel.x, 0.0)).xy +\r
    texture(uVelocity, vUv + vec2(uTexel.x, 0.0)).xy +\r
    texture(uVelocity, vUv - vec2(0.0, uTexel.y)).xy +\r
    texture(uVelocity, vUv + vec2(0.0, uTexel.y)).xy;\r
  fragColor = vec4(mix(center, around * 0.25, uAmount), 0.0, 1.0);\r
}\`;\r
\r
const DIVERGENCE = \`\${HEADER}\r
uniform sampler2D uVelocity;\r
uniform float uWalls;\r
\r
void main() {\r
  vec2 center = texture(uVelocity, vUv).xy;\r
  float left = texture(uVelocity, vUv - vec2(uTexel.x, 0.0)).x;\r
  float right = texture(uVelocity, vUv + vec2(uTexel.x, 0.0)).x;\r
  float down = texture(uVelocity, vUv - vec2(0.0, uTexel.y)).y;\r
  float up = texture(uVelocity, vUv + vec2(0.0, uTexel.y)).y;\r
  float edge = uWalls > 0.5 ? -1.0 : 0.0;\r
  if (vUv.x - uTexel.x < 0.0) left = edge * center.x;\r
  if (vUv.x + uTexel.x > 1.0) right = edge * center.x;\r
  if (vUv.y - uTexel.y < 0.0) down = edge * center.y;\r
  if (vUv.y + uTexel.y > 1.0) up = edge * center.y;\r
  fragColor = vec4(0.5 * (right - left + up - down), 0.0, 0.0, 1.0);\r
}\`;\r
\r
const EDGE = \`\r
uniform float uWalls;\r
\r
float pressureAt(sampler2D field, vec2 uv) {\r
  vec2 inside = step(vec2(0.0), uv) * step(uv, vec2(1.0));\r
  return texture(field, uv).x * mix(inside.x * inside.y, 1.0, uWalls);\r
}\r
\`;\r
\r
const PRESSURE = \`\${HEADER}\r
uniform sampler2D uPressure;\r
uniform sampler2D uDivergence;\r
\${EDGE}\r
void main() {\r
  vec2 reach = uTexel * 2.0;\r
  float sum =\r
    pressureAt(uPressure, vUv - vec2(reach.x, 0.0)) +\r
    pressureAt(uPressure, vUv + vec2(reach.x, 0.0)) +\r
    pressureAt(uPressure, vUv - vec2(0.0, reach.y)) +\r
    pressureAt(uPressure, vUv + vec2(0.0, reach.y));\r
  fragColor = vec4(sum * 0.25 - texture(uDivergence, vUv).x, 0.0, 0.0, 1.0);\r
}\`;\r
\r
const PROJECT = \`\${HEADER}\r
uniform sampler2D uPressure;\r
uniform sampler2D uVelocity;\r
\${EDGE}\r
void main() {\r
  float left = pressureAt(uPressure, vUv - vec2(uTexel.x, 0.0));\r
  float right = pressureAt(uPressure, vUv + vec2(uTexel.x, 0.0));\r
  float down = pressureAt(uPressure, vUv - vec2(0.0, uTexel.y));\r
  float up = pressureAt(uPressure, vUv + vec2(0.0, uTexel.y));\r
  vec2 velocity = texture(uVelocity, vUv).xy - 0.5 * vec2(right - left, up - down);\r
  fragColor = vec4(velocity, 0.0, 1.0);\r
}\`;\r
\r
const ADVECT = \`\${HEADER}\r
uniform sampler2D uVelocity;\r
uniform vec2 uStep;\r
uniform float uKeep;\r
uniform float uWalls;\r
\r
vec2 at(vec2 uv) {\r
  vec2 outside = max(-uv, uv - 1.0) / uTexel;\r
  float open = clamp(1.0 - max(outside.x, outside.y) / 1.5, 0.0, 1.0);\r
  return texture(uVelocity, uv).xy * mix(open, 1.0, uWalls);\r
}\r
\r
void main() {\r
  vec2 start = vUv - at(vUv) * uStep;\r
  vec2 back = start + at(start) * uStep;\r
  vec2 corrected = vUv - (back - vUv) * 0.5;\r
  vec2 origin = corrected - at(corrected) * uStep;\r
  vec2 a = at(origin + vec2(-0.5, -0.5) * uTexel);\r
  vec2 b = at(origin + vec2(0.5, -0.5) * uTexel);\r
  vec2 c = at(origin + vec2(-0.5, 0.5) * uTexel);\r
  vec2 d = at(origin + vec2(0.5, 0.5) * uTexel);\r
  vec2 velocity = clamp(at(origin), min(min(a, b), min(c, d)), max(max(a, b), max(c, d)));\r
  fragColor = vec4(velocity * uKeep, 0.0, 1.0);\r
}\`;\r
\r
const DISPLAY = \`\${HEADER}\r
uniform sampler2D uVelocity;\r
uniform sampler2D uPalette;\r
uniform vec2 uSimSize;\r
uniform float uSpeedScale;\r
uniform float uLight;\r
uniform vec4 uBackground;\r
\r
vec2 velocityAt(vec2 uv) {\r
  vec2 st = uv * uSimSize - 0.5;\r
  vec2 i = floor(st);\r
  vec2 f = st - i;\r
  vec2 f2 = f * f;\r
  vec2 f3 = f2 * f;\r
  vec2 w0 = (-f3 + 3.0 * f2 - 3.0 * f + 1.0) / 6.0;\r
  vec2 w1 = (3.0 * f3 - 6.0 * f2 + 4.0) / 6.0;\r
  vec2 w2 = (-3.0 * f3 + 3.0 * f2 + 3.0 * f + 1.0) / 6.0;\r
  vec2 w3 = f3 / 6.0;\r
  vec2 g0 = w0 + w1;\r
  vec2 g1 = w2 + w3;\r
  vec2 h0 = (i - 0.5 + w1 / g0) / uSimSize;\r
  vec2 h1 = (i + 1.5 + w3 / g1) / uSimSize;\r
  vec2 a = texture(uVelocity, vec2(h0.x, h0.y)).xy;\r
  vec2 b = texture(uVelocity, vec2(h1.x, h0.y)).xy;\r
  vec2 c = texture(uVelocity, vec2(h0.x, h1.y)).xy;\r
  vec2 d = texture(uVelocity, vec2(h1.x, h1.y)).xy;\r
  return g0.y * (g0.x * a + g1.x * b) + g1.y * (g0.x * c + g1.x * d);\r
}\r
\r
void main() {\r
  float speed = length(velocityAt(vUv)) * uSpeedScale;\r
  float level = speed < 0.75 ? speed : 0.75 + 0.25 * tanh((speed - 0.75) * 4.0);\r
  vec3 ink = texture(uPalette, vec2(level, 0.5)).rgb;\r
  float alpha = level;\r
  if (uLight > 0.5) {\r
    float hollow = smoothstep(0.7, 1.6, speed);\r
    alpha = smoothstep(0.08, 0.5, level) * mix(0.85, 0.1, hollow);\r
  } else {\r
    float hot = 1.0 - exp(-max(speed - 0.75, 0.0) * 1.2);\r
    ink = mix(ink, min(ink * 1.8 + 0.06, vec3(1.0)), hot);\r
  }\r
  vec3 color = ink * alpha + uBackground.rgb * uBackground.a * (1.0 - alpha);\r
  float coverage = alpha + uBackground.a * (1.0 - alpha);\r
  float grain = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));\r
  color += (grain - 0.5) / 255.0 * step(0.002, coverage);\r
  fragColor = vec4(clamp(color, vec3(0.0), vec3(coverage)), coverage);\r
}\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const keepFor = (persistence: number, dt: number) => Math.pow(0.5, dt / (0.35 + persistence * persistence * 12));\r
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
const buildPalette = (colors: string[]) => {\r
  const stops: number[][] = [];\r
  colors.forEach(color => {\r
    const parsed = parseColor(color);\r
    if (parsed) stops.push(parsed);\r
  });\r
  if (!stops.length) stops.push([1, 1, 1]);\r
  const values = stops.map(color => color.map(toLinear));\r
  const data = new Uint8Array(PALETTE_SIZE * 4);\r
  for (let index = 0; index < PALETTE_SIZE; index++) {\r
    const t = clamp((index / (PALETTE_SIZE - 1)) * values.length - 0.5, 0, values.length - 1);\r
    const from = Math.min(Math.floor(t), Math.max(values.length - 2, 0));\r
    const to = Math.min(from + 1, values.length - 1);\r
    const k = t - from;\r
    const eased = k * k * (3 - 2 * k);\r
    for (let channel = 0; channel < 3; channel++) {\r
      const value = values[from][channel] + (values[to][channel] - values[from][channel]) * eased;\r
      data[index * 4 + channel] = Math.round(clamp(value, 0, 1) * 255);\r
    }\r
    data[index * 4 + 3] = 255;\r
  }\r
  return data;\r
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
const link = (gl: WebGL2RenderingContext, fragmentSource: string): Program | null => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);\r
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
const LiquidEther = ({\r
  colors = ['#5227FF', '#FF9FFC', '#B497CF'],\r
  intensity = 1,\r
  mouseForce = 20,\r
  cursorSize = 100,\r
  persistence = 0.75,\r
  viscosity = 0,\r
  resolution = 0.5,\r
  bounceEdges = false,\r
  clickBurst = true,\r
  autoDemo = true,\r
  autoSpeed = 0.5,\r
  autoIntensity = 2.2,\r
  autoResumeDelay = 1000,\r
  intro = true,\r
  lightMode = false,\r
  backgroundColor = 'transparent',\r
  maxDevicePixelRatio = 2,\r
  className = '',\r
  style\r
}: LiquidEtherProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const [generation, setGeneration] = useState(0);\r
  const palette = Array.isArray(colors) ? colors : [colors];\r
  const background = backgroundColor === 'transparent' ? null : parseColor(backgroundColor);\r
\r
  const settings: Settings = {\r
    colors: palette,\r
    paletteKey: palette.join(','),\r
    intensity: Math.max(0, intensity),\r
    force: Math.max(0, mouseForce),\r
    radius: clamp(cursorSize, 4, 600),\r
    persistence: clamp(persistence, 0, 1),\r
    viscosity: clamp(viscosity, 0, 1),\r
    resolution: clamp(resolution, 0.05, 1),\r
    walls: bounceEdges,\r
    clickBurst,\r
    autoDemo,\r
    autoSpeed: Math.max(0, autoSpeed),\r
    autoIntensity: Math.max(0, autoIntensity),\r
    autoResumeDelay: Math.max(0, autoResumeDelay),\r
    intro,\r
    light: lightMode,\r
    background: background ? [...background, 1] : [0, 0, 0, 0],\r
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
    if (!gl) return;\r
    if (!gl.getExtension('EXT_color_buffer_float') && !gl.getExtension('EXT_color_buffer_half_float')) return;\r
\r
    const programs = {\r
      splat: link(gl, SPLAT),\r
      smooth: link(gl, SMOOTH),\r
      divergence: link(gl, DIVERGENCE),\r
      pressure: link(gl, PRESSURE),\r
      project: link(gl, PROJECT),\r
      advect: link(gl, ADVECT),\r
      display: link(gl, DISPLAY)\r
    } as Record<ProgramName, Program>;\r
    if (Object.values(programs).some(entry => !entry)) return;\r
\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
    const vao = gl.createVertexArray();\r
    const size = { width: 1, height: 1 };\r
    const grid = { width: 0, height: 0 };\r
    const targets = {} as Record<TargetName, Target>;\r
    const pointer = {\r
      x: 0,\r
      y: 0,\r
      fromX: 0,\r
      fromY: 0,\r
      dx: 0,\r
      dy: 0,\r
      inside: false,\r
      ready: false,\r
      moved: false,\r
      last: 0\r
    };\r
    const auto = { phase: Math.random() * 100, x: 0, y: 0, ready: false, ramp: 0 };\r
    const opening = { active: settingsRef.current.intro && !reduced && generation === 0, time: 0 };\r
    const splats: Splat[] = [];\r
    const puffs: Splat[] = [];\r
    let energy = 1;\r
    let lastInput = -Infinity;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let pageVisible = document.visibilityState !== 'hidden';\r
    let lost = false;\r
    let paletteKey = '';\r
\r
    const paletteTexture = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, paletteTexture);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
\r
    const updatePalette = (s: Settings) => {\r
      if (s.paletteKey === paletteKey) return;\r
      paletteKey = s.paletteKey;\r
      gl.bindTexture(gl.TEXTURE_2D, paletteTexture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, PALETTE_SIZE, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, buildPalette(s.colors));\r
    };\r
\r
    const makeTarget = (width: number, height: number, channels: number): Target => {\r
      const texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texImage2D(\r
        gl.TEXTURE_2D,\r
        0,\r
        channels === 2 ? gl.RG16F : gl.R16F,\r
        width,\r
        height,\r
        0,\r
        channels === 2 ? gl.RG : gl.RED,\r
        gl.HALF_FLOAT,\r
        null\r
      );\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      const framebuffer = gl.createFramebuffer();\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      return { texture, framebuffer };\r
    };\r
\r
    const dropTargets = () => {\r
      (Object.keys(targets) as TargetName[]).forEach(key => {\r
        gl.deleteTexture(targets[key].texture);\r
        gl.deleteFramebuffer(targets[key].framebuffer);\r
        delete targets[key];\r
      });\r
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
      const base = s.resolution * 0.5;\r
      const scale = base * Math.min(1, Math.sqrt(MAX_CELLS / (cssWidth * cssHeight * base * base)));\r
      const gridWidth = clamp(Math.round(cssWidth * scale), 16, 1024);\r
      const gridHeight = clamp(Math.round(cssHeight * scale), 16, 1024);\r
      if (gridWidth === grid.width && gridHeight === grid.height) return;\r
      dropTargets();\r
      grid.width = gridWidth;\r
      grid.height = gridHeight;\r
      targets.velocity = makeTarget(gridWidth, gridHeight, 2);\r
      targets.velocityNext = makeTarget(gridWidth, gridHeight, 2);\r
      targets.divergence = makeTarget(gridWidth, gridHeight, 1);\r
      targets.pressure = makeTarget(gridWidth, gridHeight, 1);\r
      targets.pressureNext = makeTarget(gridWidth, gridHeight, 1);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
    };\r
\r
    const swap = (a: TargetName, b: TargetName) => {\r
      const held = targets[a];\r
      targets[a] = targets[b];\r
      targets[b] = held;\r
    };\r
\r
    const bindTexture = (unit: number, texture: WebGLTexture | null, location: WebGLUniformLocation | null) => {\r
      gl.activeTexture(gl.TEXTURE0 + unit);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.uniform1i(location, unit);\r
    };\r
\r
    const run = (entry: Program, output: Target | null, bind: (uniforms: Program['uniforms']) => void) => {\r
      gl.useProgram(entry.program);\r
      gl.uniform2f(entry.uniforms.uTexel, 1 / grid.width, 1 / grid.height);\r
      bind(entry.uniforms);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, output ? output.framebuffer : null);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const simulate = (s: Settings, dt: number) => {\r
      gl.viewport(0, 0, grid.width, grid.height);\r
      const walls = s.walls ? 1 : 0;\r
      splats.forEach(splat => {\r
        run(programs.splat, targets.velocityNext, u => {\r
          bindTexture(0, targets.velocity.texture, u.uVelocity);\r
          gl.uniform2f(u.uSize, size.width, size.height);\r
          gl.uniform4f(u.uSegment, splat.ax, splat.ay, splat.bx, splat.by);\r
          gl.uniform2f(u.uForce, splat.vx, splat.vy);\r
          gl.uniform1f(u.uRadius, splat.radius);\r
        });\r
        swap('velocity', 'velocityNext');\r
      });\r
      splats.length = 0;\r
      const passes = Math.ceil(s.viscosity * 4);\r
      for (let pass = 0; pass < passes; pass++) {\r
        run(programs.smooth, targets.velocityNext, u => {\r
          bindTexture(0, targets.velocity.texture, u.uVelocity);\r
          gl.uniform1f(u.uAmount, Math.min(1, s.viscosity * 4 - pass) * 0.9);\r
        });\r
        swap('velocity', 'velocityNext');\r
      }\r
      run(programs.divergence, targets.divergence, u => {\r
        bindTexture(0, targets.velocity.texture, u.uVelocity);\r
        gl.uniform1f(u.uWalls, walls);\r
      });\r
      for (let iteration = 0; iteration < PRESSURE_STEPS; iteration++) {\r
        run(programs.pressure, targets.pressureNext, u => {\r
          bindTexture(0, targets.pressure.texture, u.uPressure);\r
          bindTexture(1, targets.divergence.texture, u.uDivergence);\r
          gl.uniform1f(u.uWalls, walls);\r
        });\r
        swap('pressure', 'pressureNext');\r
      }\r
      run(programs.project, targets.velocityNext, u => {\r
        bindTexture(0, targets.pressure.texture, u.uPressure);\r
        bindTexture(1, targets.velocity.texture, u.uVelocity);\r
        gl.uniform1f(u.uWalls, walls);\r
      });\r
      swap('velocity', 'velocityNext');\r
      run(programs.advect, targets.velocityNext, u => {\r
        bindTexture(0, targets.velocity.texture, u.uVelocity);\r
        gl.uniform2f(u.uStep, dt / size.width, dt / size.height);\r
        gl.uniform1f(u.uKeep, keepFor(s.persistence, dt));\r
        gl.uniform1f(u.uWalls, walls);\r
      });\r
      swap('velocity', 'velocityNext');\r
    };\r
\r
    const render = (s: Settings) => {\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      run(programs.display, null, u => {\r
        bindTexture(0, targets.velocity.texture, u.uVelocity);\r
        bindTexture(1, paletteTexture, u.uPalette);\r
        gl.uniform2f(u.uSimSize, grid.width, grid.height);\r
        gl.uniform1f(u.uSpeedScale, (1.25 * s.intensity) / (0.84 * Math.max(size.width, size.height)));\r
        gl.uniform1f(u.uLight, s.light ? 1 : 0);\r
        gl.uniform4f(u.uBackground, s.background[0], s.background[1], s.background[2], s.background[3]);\r
      });\r
    };\r
\r
    const wander = (t: number): Point => {\r
      const x = 0.62 * Math.sin(t * 0.83 + 1.3) + 0.38 * Math.sin(t * 1.71 + 0.4);\r
      const y = 0.6 * Math.sin(t * 1.07 + 2.1) + 0.4 * Math.cos(t * 0.61 + 0.7);\r
      return [(0.5 + 0.41 * x) * size.width, (0.5 + 0.41 * y) * size.height];\r
    };\r
\r
    const sweep = (t: number): Point => {\r
      const k = clamp(t / 1.4, 0, 1);\r
      const eased = 1 - Math.pow(1 - k, 3);\r
      const angle = -0.6 + eased * 3.6;\r
      const reach = 0.08 + 0.3 * eased;\r
      return [\r
        (0.5 + Math.cos(angle) * reach * 1.1) * size.width,\r
        (0.5 + Math.sin(angle) * reach * (size.width / size.height) * 0.75) * size.height\r
      ];\r
    };\r
\r
    const addStroke = (from: Point, to: Point, dt: number, scale: number, radius: number) => {\r
      splats.push({\r
        ax: from[0],\r
        ay: from[1],\r
        bx: to[0],\r
        by: to[1],\r
        vx: clamp(((to[0] - from[0]) / dt) * scale, -6000, 6000),\r
        vy: clamp(((to[1] - from[1]) / dt) * scale, -6000, 6000),\r
        radius\r
      });\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (lost) return;\r
      const s = settingsRef.current;\r
      updatePalette(s);\r
      const dt = clamp((now - last) / 1000 || 0, 0, 1 / 30);\r
      last = Math.max(last, now);\r
      const pace = Math.min(1, dt * 60);\r
      const idle = now - lastInput > s.autoResumeDelay && !pointer.inside;\r
\r
      if (opening.active && dt > 0) {\r
        const from = sweep(opening.time);\r
        opening.time += dt;\r
        const fade = Math.sin(Math.min(1, opening.time / 1.4) * Math.PI);\r
        addStroke(from, sweep(opening.time), dt, 0.2 * fade, s.radius);\r
        energy = 1;\r
        if (opening.time > 1.4) opening.active = false;\r
      } else if (s.autoDemo && !reduced && idle && dt > 0) {\r
        auto.ramp = Math.min(1, auto.ramp + dt / 0.8);\r
        auto.phase += dt * s.autoSpeed * 1.6;\r
        const spot = wander(auto.phase);\r
        if (auto.ready) {\r
          const gust = 0.3 + 0.7 * Math.pow(0.5 + 0.5 * Math.sin(auto.phase * 2.6), 2);\r
          const scale = (s.force / 20) * 0.45 * s.autoIntensity * auto.ramp * auto.ramp * gust * pace;\r
          addStroke([auto.x, auto.y], spot, dt, scale, s.radius);\r
        }\r
        auto.x = spot[0];\r
        auto.y = spot[1];\r
        auto.ready = true;\r
        energy = 1;\r
      } else {\r
        auto.ramp = 0;\r
      }\r
\r
      if (pointer.moved && dt > 0) {\r
        pointer.moved = false;\r
        const span = Math.max(now - pointer.last, 8) / 1000;\r
        addStroke([pointer.fromX, pointer.fromY], [pointer.x, pointer.y], span, (s.force / 20) * 0.15 * pace, s.radius);\r
        pointer.fromX = pointer.x;\r
        pointer.fromY = pointer.y;\r
        pointer.last = now;\r
        energy = 1;\r
      }\r
\r
      const puff = puffs.shift();\r
      if (puff) splats.push(puff);\r
\r
      gl.bindVertexArray(vao);\r
      gl.disable(gl.BLEND);\r
      if (dt > 0) simulate(s, dt);\r
      render(s);\r
\r
      energy *= keepFor(s.persistence, dt);\r
      const busy = opening.active || (s.autoDemo && !reduced) || energy > 0.002 || puffs.length > 0 || pointer.moved;\r
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
        y: rect.bottom - event.clientY,\r
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
      if (!spot.inside) {\r
        pointer.ready = false;\r
        return;\r
      }\r
      lastInput = performance.now();\r
      opening.active = false;\r
      if (!pointer.ready) {\r
        pointer.fromX = spot.x;\r
        pointer.fromY = spot.y;\r
        pointer.x = spot.x;\r
        pointer.y = spot.y;\r
        pointer.last = lastInput;\r
        pointer.ready = true;\r
      }\r
      const travelX = spot.x - pointer.x;\r
      const travelY = spot.y - pointer.y;\r
      if (Math.hypot(travelX, travelY) > 0.5) {\r
        pointer.dx = pointer.dx * 0.7 + travelX * 0.3;\r
        pointer.dy = pointer.dy * 0.7 + travelY * 0.3;\r
      }\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.moved = true;\r
      wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      const spot = locate(event);\r
      if (!spot.inside) return;\r
      lastInput = performance.now();\r
      if (!s.clickBurst || reduced) return;\r
      const angle =\r
        Math.hypot(pointer.dx, pointer.dy) > 1 ? Math.atan2(pointer.dy, pointer.dx) : Math.random() * Math.PI * 2;\r
      const dirX = Math.cos(angle);\r
      const dirY = Math.sin(angle);\r
      const reach = s.radius * 0.5;\r
      const push = 1400 * (s.force / 20);\r
      puffs.push({\r
        ax: spot.x - dirX * reach,\r
        ay: spot.y - dirY * reach,\r
        bx: spot.x + dirX * reach,\r
        by: spot.y + dirY * reach,\r
        vx: dirX * push,\r
        vy: dirY * push,\r
        radius: s.radius * 0.9\r
      });\r
      if (puffs.length > 4) puffs.shift();\r
      energy = 1;\r
      wake();\r
    };\r
\r
    const onLeave = () => {\r
      pointer.inside = false;\r
      pointer.ready = false;\r
    };\r
\r
    const onPointerUp = (event: PointerEvent) => {\r
      if (event.pointerType !== 'mouse') onLeave();\r
    };\r
\r
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
        dropTargets();\r
        gl.deleteTexture(paletteTexture);\r
        gl.deleteVertexArray(vao);\r
        Object.values(programs).forEach(entry => gl.deleteProgram(entry.program));\r
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
export default LiquidEther;\r
`,a={usage:`import LiquidEther from './LiquidEther';

<div style={{ width: '100%', height: 600, position: 'relative' }}>
  <LiquidEther
    colors={['#5227FF', '#FF9FFC', '#B497CF']}
    mouseForce={20}
    cursorSize={100}
    persistence={0.75}
    autoDemo={true}
    autoSpeed={0.5}
    autoIntensity={2.2}
  />
</div>`,code:r,css:e,tailwind:n,tsCode:t,tsTailwind:o};export{a as liquidEther};
