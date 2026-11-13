const n=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
import './Waves.css';\r
\r
const STYLES = { solid: 0, dashed: 1 };\r
const CELL = 12;\r
const STEP = 4;\r
const INTRO_SECONDS = 2.2;\r
const RIPPLE_SPEED = 640;\r
const RIPPLE_WIDTH = 64;\r
const RIPPLE_IMPULSE = (RIPPLE_WIDTH * Math.sqrt(Math.PI / 2)) / RIPPLE_SPEED;\r
const MAX_VERTICES = 1600000;\r
\r
const VERTEX = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform vec2 uView;\r
uniform float uRatio;\r
uniform vec2 uAxis;\r
uniform float uSpacing;\r
uniform float uStep;\r
uniform vec2 uStart;\r
uniform float uAmplitude;\r
uniform vec2 uFrequency;\r
uniform vec2 uDrift;\r
uniform float uTwist;\r
uniform uint uSeed;\r
uniform sampler2D uField;\r
uniform ivec2 uFieldSize;\r
uniform float uCell;\r
uniform float uLimit;\r
uniform float uReach;\r
uniform float uReveal;\r
uniform float uBand;\r
out float vAcross;\r
out float vAlong;\r
out float vEnergy;\r
out float vShow;\r
out float vPhase;\r
\r
const vec2 GRADIENTS[12] = vec2[12](\r
  vec2(1.0, 1.0), vec2(-1.0, 1.0), vec2(1.0, -1.0), vec2(-1.0, -1.0),\r
  vec2(1.0, 0.0), vec2(-1.0, 0.0), vec2(1.0, 0.0), vec2(-1.0, 0.0),\r
  vec2(0.0, 1.0), vec2(0.0, -1.0), vec2(0.0, 1.0), vec2(0.0, -1.0)\r
);\r
\r
vec2 gradient(vec2 cell) {\r
  uvec2 q = uvec2(ivec2(cell) + 65536) + uvec2(uSeed * 7919u, uSeed * 104729u);\r
  q = 1103515245u * ((q >> 1u) ^ q.yx);\r
  uint n = 1103515245u * (q.x ^ (q.y >> 3u));\r
  return GRADIENTS[(n >> 16u) % 12u];\r
}\r
\r
float ease(float t) {\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
float perlin(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = p - i;\r
  float n00 = dot(gradient(i), f);\r
  float n10 = dot(gradient(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));\r
  float n01 = dot(gradient(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));\r
  float n11 = dot(gradient(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));\r
  vec2 u = vec2(ease(f.x), ease(f.y));\r
  return mix(mix(n00, n10, u.x), mix(n01, n11, u.x), u.y);\r
}\r
\r
vec2 node(ivec2 cell) {\r
  return texelFetch(uField, clamp(cell, ivec2(0), uFieldSize - 1), 0).xy;\r
}\r
\r
void weights(float f, out vec4 w, out vec4 d) {\r
  float g = 1.0 - f;\r
  float f2 = f * f;\r
  float f3 = f2 * f;\r
  w = vec4(g * g * g, 3.0 * f3 - 6.0 * f2 + 4.0, -3.0 * f3 + 3.0 * f2 + 3.0 * f + 1.0, f3) / 6.0;\r
  d = vec4(-g * g, 3.0 * f2 - 4.0 * f, -3.0 * f2 + 2.0 * f + 1.0, f2) * 0.5;\r
}\r
\r
vec2 field(vec2 point, out mat2 slope) {\r
  vec2 t = point / uCell;\r
  vec2 base = floor(t);\r
  vec2 f = t - base;\r
  vec4 wx;\r
  vec4 dx;\r
  vec4 wy;\r
  vec4 dy;\r
  weights(f.x, wx, dx);\r
  weights(f.y, wy, dy);\r
  ivec2 origin = ivec2(base) - 1;\r
  vec2 value = vec2(0.0);\r
  vec2 alongX = vec2(0.0);\r
  vec2 alongY = vec2(0.0);\r
  for (int j = 0; j < 4; j++) {\r
    vec2 row = vec2(0.0);\r
    vec2 rowSlope = vec2(0.0);\r
    for (int i = 0; i < 4; i++) {\r
      vec2 tap = node(origin + ivec2(i, j));\r
      row += tap * wx[i];\r
      rowSlope += tap * dx[i];\r
    }\r
    value += row * wy[j];\r
    alongX += rowSlope * wy[j];\r
    alongY += row * dy[j];\r
  }\r
  float size = length(value);\r
  float scale = size > 0.0001 ? uLimit * tanh(size / uLimit) / size : 1.0;\r
  slope = mat2(alongX, alongY) * (scale / uCell);\r
  return value * scale;\r
}\r
\r
vec2 wave(vec2 rest) {\r
  float turn = perlin(rest * uFrequency + uDrift) * 12.0 * uTwist;\r
  vec2 local = rest + vec2(cos(turn), sin(turn) * 0.5) * uAmplitude;\r
  return uView * 0.5 + vec2(local.x * uAxis.x - local.y * uAxis.y, local.x * uAxis.y + local.y * uAxis.x);\r
}\r
\r
void main() {\r
  int index = gl_VertexID >> 1;\r
  float side = float(gl_VertexID & 1) * 2.0 - 1.0;\r
  float u = uStart.x + float(gl_InstanceID) * uSpacing;\r
  float v = uStart.y + float(index) * uStep;\r
  vec2 flowing = wave(vec2(u, v));\r
  vec2 bend = wave(vec2(u, v + uStep)) - wave(vec2(u, v - uStep));\r
  mat2 slope;\r
  vec2 shift = field(flowing, slope);\r
  vec2 point = flowing + shift;\r
  float energy = length(shift);\r
  vec2 tangent = bend + slope * bend;\r
  float span = max(length(tangent), 0.0001);\r
  vec2 normal = vec2(-tangent.y, tangent.x) / span;\r
  vec2 corner = point + normal * side * uReach / uRatio;\r
  vAcross = side * uReach;\r
  vAlong = v;\r
  vEnergy = energy;\r
  vShow = clamp((uReveal - abs(u)) / uBand, 0.0, 1.0);\r
  uint line = uint(gl_InstanceID) * 747796405u + uSeed * 2891336453u + 1u;\r
  line = ((line >> ((line >> 28u) + 4u)) ^ line) * 277803737u;\r
  vPhase = float((line >> 22u) ^ line) / 4294967295.0;\r
  vec2 clip = corner / uView * 2.0 - 1.0;\r
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform vec2 uView;\r
uniform float uRatio;\r
uniform float uHalf;\r
uniform float uThin;\r
uniform int uStyle;\r
uniform float uPeriod;\r
uniform float uFlow;\r
uniform vec3 uColor;\r
uniform vec3 uAccent;\r
uniform float uBase;\r
uniform float uHeat;\r
uniform float uFade;\r
uniform float uOpacity;\r
in float vAcross;\r
in float vAlong;\r
in float vEnergy;\r
in float vShow;\r
in float vPhase;\r
out vec4 outColor;\r
\r
float smootherstep(float edge, float x) {\r
  float t = clamp(x / max(edge, 0.0001), 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  float coverage = clamp(uHalf + 0.5 - abs(vAcross), 0.0, 1.0) * uThin;\r
  if (uStyle == 1) {\r
    float phase = (vAlong + uFlow) / uPeriod + vPhase;\r
    float blur = max(fwidth(phase), 0.0001);\r
    coverage *= clamp((0.25 - abs(fract(phase) - 0.5)) / blur + 0.5, 0.0, 1.0);\r
  }\r
  float heat = smoothstep(0.0, uHeat, vEnergy);\r
  vec2 uv = gl_FragCoord.xy / (uView * uRatio);\r
  float edge = uFade * 0.5;\r
  float mask = smootherstep(edge, uv.x) * smootherstep(edge, 1.0 - uv.x) * smootherstep(edge, uv.y) * smootherstep(edge, 1.0 - uv.y);\r
  float alpha = coverage * mix(uBase, 1.0, heat) * mask * vShow * uOpacity;\r
  outColor = vec4(mix(uColor, uAccent, heat) * alpha, alpha);\r
}\`;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const smootherstep = value => {\r
  const t = clamp(value, 0, 1);\r
  return t * t * t * (t * (t * 6 - 15) + 10);\r
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
const link = gl => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
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
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
  for (let i = 0; i < count; i++) {\r
    const info = gl.getActiveUniform(program, i);\r
    if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const Waves = ({\r
  lineColor = '#ffffff',\r
  accentColor,\r
  backgroundColor = 'transparent',\r
  lineStyle = 'solid',\r
  spacing = 10,\r
  lineWidth = 1,\r
  rotation = 0,\r
  amplitude = 32,\r
  scale = 1,\r
  twist = 1,\r
  speed = 1,\r
  variation = 0,\r
  mouseInteraction = true,\r
  mouseRadius = 175,\r
  mouseStrength = 1,\r
  bounce = 0.5,\r
  returnDuration = 1.4,\r
  clickRipple = true,\r
  intro = true,\r
  fade = 0,\r
  opacity = 1,\r
  lightMode = false,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settings = {\r
    lineColor: String(lineColor),\r
    accentColor: accentColor ? String(accentColor) : '',\r
    lineStyle: STYLES[lineStyle] ?? 0,\r
    spacing: Math.max(2, spacing),\r
    lineWidth: Math.max(0.25, lineWidth),\r
    rotation,\r
    amplitude: Math.max(0, amplitude),\r
    scale: Math.max(0.05, scale),\r
    twist: Math.max(0, twist),\r
    speed,\r
    variation: Math.max(0, Math.round(variation)),\r
    mouseInteraction,\r
    mouseRadius: Math.max(20, mouseRadius),\r
    mouseStrength: Math.max(0, mouseStrength),\r
    bounce: clamp(bounce, 0, 1),\r
    returnDuration: Math.max(0.2, returnDuration),\r
    clickRipple,\r
    intro,\r
    fade: clamp(fade, 0, 1),\r
    opacity: clamp(opacity, 0, 1),\r
    lightMode,\r
    paused,\r
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
    const program = link(gl);\r
    if (!program) return undefined;\r
    const u = program.uniforms;\r
\r
    const vao = gl.createVertexArray();\r
    const texture = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, texture);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const colors = new Map();\r
    const parse = value => {\r
      if (colors.has(value)) return colors.get(value);\r
      let rgb = [1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#ffffff';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      colors.set(value, rgb);\r
      return rgb;\r
    };\r
    const ink = rgb => {\r
      const linear = rgb.map(v => Math.pow(v, 2.2));\r
      const tone = 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];\r
      const depth = Math.min(1, 0.045 / Math.max(tone, 0.0001));\r
      return linear.map(v => Math.pow(v * depth, 1 / 2.2));\r
    };\r
\r
    const view = { width: 1, height: 1, ratio: 1 };\r
    const grid = {\r
      cols: 0,\r
      rows: 0,\r
      shift: new Float32Array(0),\r
      speed: new Float32Array(0),\r
      top: 0,\r
      bottom: -1,\r
      left: 0,\r
      right: -1\r
    };\r
    const pointer = { x: 0, y: 0, sx: 0, sy: 0, vx: 0, vy: 0, inside: false };\r
    const ripples = [];\r
    const state = { flow: 0, intro: settingsRef.current.intro && !reduce ? 0 : 1 };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const limitOf = s => Math.max(12, s.mouseRadius * 0.5);\r
\r
    const rebuild = () => {\r
      grid.cols = Math.ceil(view.width / CELL) + 2;\r
      grid.rows = Math.ceil(view.height / CELL) + 2;\r
      grid.shift = new Float32Array(grid.cols * grid.rows * 2);\r
      grid.speed = new Float32Array(grid.cols * grid.rows * 2);\r
      grid.top = 0;\r
      grid.bottom = -1;\r
      grid.left = 0;\r
      grid.right = -1;\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG32F, grid.cols, grid.rows, 0, gl.RG, gl.FLOAT, grid.shift);\r
    };\r
\r
    const include = (x0, y0, x1, y1) => {\r
      const c0 = clamp(Math.floor(x0 / CELL), 0, grid.cols - 1);\r
      const c1 = clamp(Math.ceil(x1 / CELL), 0, grid.cols - 1);\r
      const r0 = clamp(Math.floor(y0 / CELL), 0, grid.rows - 1);\r
      const r1 = clamp(Math.ceil(y1 / CELL), 0, grid.rows - 1);\r
      const empty = grid.bottom < grid.top;\r
      grid.top = empty ? r0 : Math.min(grid.top, r0);\r
      grid.bottom = empty ? r1 : Math.max(grid.bottom, r1);\r
      grid.left = empty ? c0 : Math.min(grid.left, c0);\r
      grid.right = empty ? c1 : Math.max(grid.right, c1);\r
    };\r
\r
    const simulate = dt => {\r
      const s = settingsRef.current;\r
      const follow = 1 - Math.exp(-dt / 0.045);\r
      const nx = pointer.sx + (pointer.x - pointer.sx) * follow;\r
      const ny = pointer.sy + (pointer.y - pointer.sy) * follow;\r
      const blend = 1 - Math.exp(-dt / 0.06);\r
      pointer.vx += ((nx - pointer.sx) / dt - pointer.vx) * blend;\r
      pointer.vy += ((ny - pointer.sy) / dt - pointer.vy) * blend;\r
      pointer.sx = nx;\r
      pointer.sy = ny;\r
\r
      const zeta = 1 - 0.85 * s.bounce;\r
      const omega = 4 / (zeta * s.returnDuration);\r
      const radius = s.mouseRadius;\r
      const speedNow = Math.hypot(pointer.vx, pointer.vy);\r
      const drive =\r
        s.mouseInteraction && pointer.inside && !reduce ? 26000 * Math.tanh(speedNow / 1400) * s.mouseStrength : 0;\r
      if (drive > 1) include(pointer.sx - radius, pointer.sy - radius, pointer.sx + radius, pointer.sy + radius);\r
\r
      const live = [];\r
      for (let i = ripples.length - 1; i >= 0; i--) {\r
        const ripple = ripples[i];\r
        ripple.age += dt;\r
        const front = ripple.age * RIPPLE_SPEED;\r
        const life = 1 - front / ripple.range;\r
        if (life <= 0) {\r
          ripples.splice(i, 1);\r
          continue;\r
        }\r
        const reach = front + RIPPLE_WIDTH * 3;\r
        include(ripple.x - reach, ripple.y - reach, ripple.x + reach, ripple.y + reach);\r
        live.push({\r
          x: ripple.x,\r
          y: ripple.y,\r
          front,\r
          power: (150 * omega * life * Math.sqrt(life)) / RIPPLE_IMPULSE\r
        });\r
      }\r
\r
      if (grid.bottom < grid.top) return false;\r
\r
      const stiffness = omega * omega;\r
      const damping = 2 * zeta * omega;\r
      const steps = Math.min(16, Math.max(1, Math.ceil(dt / Math.min(1 / 120, 0.6 / omega))));\r
      const h = dt / steps;\r
      const dirX = speedNow > 0.001 ? pointer.vx / speedNow : 0;\r
      const dirY = speedNow > 0.001 ? pointer.vy / speedNow : 0;\r
      const { cols, shift, speed: velocity, left, right } = grid;\r
      let peak = 0;\r
\r
      for (let row = grid.top; row <= grid.bottom; row++) {\r
        const y = row * CELL;\r
        for (let col = left; col <= right; col++) {\r
          const x = col * CELL;\r
          const index = (row * cols + col) * 2;\r
          let ax = 0;\r
          let ay = 0;\r
          if (drive > 1) {\r
            const distance = Math.hypot(x - pointer.sx, y - pointer.sy);\r
            if (distance < radius) {\r
              const weight = smootherstep(1 - distance / radius) * drive;\r
              ax += dirX * weight;\r
              ay += dirY * weight;\r
            }\r
          }\r
          for (const ripple of live) {\r
            const ex = x - ripple.x;\r
            const ey = y - ripple.y;\r
            const distance = Math.hypot(ex, ey);\r
            const offset = (distance - ripple.front) / RIPPLE_WIDTH;\r
            if (distance > 0.001 && Math.abs(offset) < 3) {\r
              const push = ripple.power * Math.exp(-offset * offset * 2) * smootherstep(distance / 56);\r
              ax += (ex / distance) * push;\r
              ay += (ey / distance) * push;\r
            }\r
          }\r
          let px = shift[index];\r
          let py = shift[index + 1];\r
          let vx = velocity[index];\r
          let vy = velocity[index + 1];\r
          for (let k = 0; k < steps; k++) {\r
            vx += (ax - stiffness * px - damping * vx) * h;\r
            vy += (ay - stiffness * py - damping * vy) * h;\r
            px += vx * h;\r
            py += vy * h;\r
          }\r
          shift[index] = px;\r
          shift[index + 1] = py;\r
          velocity[index] = vx;\r
          velocity[index + 1] = vy;\r
          peak = Math.max(peak, Math.abs(px) + Math.abs(py) + (Math.abs(vx) + Math.abs(vy)) * 0.05);\r
        }\r
      }\r
\r
      const top = grid.top;\r
      const height = grid.bottom - grid.top + 1;\r
      if (peak < 0.02 && drive <= 1 && !live.length) {\r
        for (let row = grid.top; row <= grid.bottom; row++) {\r
          shift.fill(0, (row * cols + left) * 2, (row * cols + right + 1) * 2);\r
          velocity.fill(0, (row * cols + left) * 2, (row * cols + right + 1) * 2);\r
        }\r
        grid.top = 0;\r
        grid.bottom = -1;\r
      }\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texSubImage2D(\r
        gl.TEXTURE_2D,\r
        0,\r
        0,\r
        top,\r
        cols,\r
        height,\r
        gl.RG,\r
        gl.FLOAT,\r
        shift.subarray(top * cols * 2, (top + height) * cols * 2)\r
      );\r
      return grid.bottom >= grid.top;\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const angle = (s.rotation * Math.PI) / 180;\r
      const cos = Math.cos(angle);\r
      const sin = Math.sin(angle);\r
      const limit = limitOf(s);\r
      const margin = s.amplitude * 1.1 + limit + s.spacing * 2 + 8;\r
      const reachU = (view.width * Math.abs(cos) + view.height * Math.abs(sin)) / 2 + margin;\r
      const reachV = (view.width * Math.abs(sin) + view.height * Math.abs(cos)) / 2 + margin;\r
      const half = Math.ceil(reachU / s.spacing);\r
      const lines = half * 2 + 1;\r
      let step = STEP;\r
      let samples = Math.ceil((reachV * 2) / step) + 1;\r
      if (lines * samples * 2 > MAX_VERTICES) {\r
        samples = Math.max(16, Math.floor(MAX_VERTICES / (lines * 2)));\r
        step = (reachV * 2) / (samples - 1);\r
      }\r
      const width = s.lineWidth * view.ratio;\r
      const halfWidth = Math.max(0.5, width / 2);\r
      const reach = halfWidth + 1;\r
      const progress = state.intro;\r
      const reveal = s.intro && !reduce ? (1 - Math.pow(1 - clamp(progress / 0.7, 0, 1), 3)) * reachU * 1.3 : 1e6;\r
      const swell = s.intro && !reduce ? smootherstep((progress - 0.1) / 0.9) : 1;\r
      const base = parse(s.lineColor);\r
      const tone = s.lightMode ? ink(base) : base;\r
      const accent = s.accentColor ? parse(s.accentColor) : tone;\r
      const flowTime = state.flow + s.variation * 37.1;\r
\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      gl.useProgram(program.program);\r
      gl.bindVertexArray(vao);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.uniform1i(u.uField, 0);\r
      gl.uniform2f(u.uView, view.width, view.height);\r
      gl.uniform1f(u.uRatio, view.ratio);\r
      gl.uniform2f(u.uAxis, cos, sin);\r
      gl.uniform1f(u.uSpacing, s.spacing);\r
      gl.uniform1f(u.uStep, step);\r
      gl.uniform2f(u.uStart, -half * s.spacing, -reachV);\r
      gl.uniform1f(u.uAmplitude, s.amplitude * swell);\r
      gl.uniform2f(u.uFrequency, 0.002 / s.scale, 0.0015 / s.scale);\r
      gl.uniform2f(u.uDrift, flowTime * 0.025, flowTime * 0.0075);\r
      gl.uniform1f(u.uTwist, s.twist);\r
      gl.uniform1ui(u.uSeed, s.variation);\r
      gl.uniform2i(u.uFieldSize, grid.cols, grid.rows);\r
      gl.uniform1f(u.uCell, CELL);\r
      gl.uniform1f(u.uLimit, limit);\r
      gl.uniform1f(u.uReach, reach);\r
      gl.uniform1f(u.uReveal, reveal);\r
      gl.uniform1f(u.uBand, Math.max(1, reachU * 0.3));\r
      gl.uniform1f(u.uHalf, halfWidth);\r
      gl.uniform1f(u.uThin, Math.min(1, width));\r
      gl.uniform1i(u.uStyle, s.lineStyle);\r
      gl.uniform1f(u.uPeriod, s.spacing * 2.6);\r
      gl.uniform1f(u.uFlow, (state.flow * 16) % (s.spacing * 2.6));\r
      gl.uniform3fv(u.uColor, tone);\r
      gl.uniform3fv(u.uAccent, accent);\r
      gl.uniform1f(u.uBase, 0.62);\r
      gl.uniform1f(u.uHeat, limit * 0.55);\r
      gl.uniform1f(u.uFade, s.fade);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, samples * 2, lines);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.0005, 0.05) : 1 / 60;\r
      last = now;\r
      if (s.paused) {\r
        state.intro = 1;\r
        render();\r
        last = 0;\r
        return;\r
      }\r
      if (!reduce) state.flow += dt * s.speed;\r
      if (!s.intro || reduce) state.intro = 1;\r
      else if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / INTRO_SECONDS);\r
      const awake = simulate(dt);\r
      render();\r
      const engaged = pointer.inside && s.mouseInteraction && Math.hypot(pointer.vx, pointer.vy) > 1;\r
      if (!reduce || awake || engaged || ripples.length || state.intro < 1) raf = requestAnimationFrame(frame);\r
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
      rebuild();\r
      render();\r
      wake();\r
    };\r
\r
    const place = (event, snap) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      const inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      if (snap || (inside && !pointer.inside)) {\r
        pointer.sx = x;\r
        pointer.sy = y;\r
        pointer.vx = 0;\r
        pointer.vy = 0;\r
      }\r
      pointer.inside = inside;\r
      pointer.x = x;\r
      pointer.y = y;\r
      return { x, y, rect, inside };\r
    };\r
\r
    const onPointerMove = event => {\r
      place(event, false);\r
      if (!settingsRef.current.paused) wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      const { x, y, rect, inside } = place(event, event.pointerType !== 'mouse');\r
      if (inside && s.clickRipple && !s.paused && !reduce) {\r
        ripples.push({ x, y, age: 0, range: Math.max(360, Math.hypot(rect.width, rect.height) * 0.55) });\r
        if (ripples.length > 6) ripples.shift();\r
      }\r
      wake();\r
    };\r
\r
    const onPointerUp = event => {\r
      if (event.pointerType !== 'mouse') pointer.inside = false;\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
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
      gl.deleteProgram(program.program);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteTexture(texture);\r
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
      className={\`waves\${className ? \` \${className}\` : ''}\`}\r
      style={{ backgroundColor, ...style }}\r
    >\r
      <canvas ref={canvasRef} className="waves__canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Waves;\r
`,r=`.waves {\r
  position: absolute;\r
  inset: 0;\r
  overflow: hidden;\r
}\r
\r
.waves__canvas {\r
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
const STYLES = { solid: 0, dashed: 1 };\r
const CELL = 12;\r
const STEP = 4;\r
const INTRO_SECONDS = 2.2;\r
const RIPPLE_SPEED = 640;\r
const RIPPLE_WIDTH = 64;\r
const RIPPLE_IMPULSE = (RIPPLE_WIDTH * Math.sqrt(Math.PI / 2)) / RIPPLE_SPEED;\r
const MAX_VERTICES = 1600000;\r
\r
const VERTEX = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform vec2 uView;\r
uniform float uRatio;\r
uniform vec2 uAxis;\r
uniform float uSpacing;\r
uniform float uStep;\r
uniform vec2 uStart;\r
uniform float uAmplitude;\r
uniform vec2 uFrequency;\r
uniform vec2 uDrift;\r
uniform float uTwist;\r
uniform uint uSeed;\r
uniform sampler2D uField;\r
uniform ivec2 uFieldSize;\r
uniform float uCell;\r
uniform float uLimit;\r
uniform float uReach;\r
uniform float uReveal;\r
uniform float uBand;\r
out float vAcross;\r
out float vAlong;\r
out float vEnergy;\r
out float vShow;\r
out float vPhase;\r
\r
const vec2 GRADIENTS[12] = vec2[12](\r
  vec2(1.0, 1.0), vec2(-1.0, 1.0), vec2(1.0, -1.0), vec2(-1.0, -1.0),\r
  vec2(1.0, 0.0), vec2(-1.0, 0.0), vec2(1.0, 0.0), vec2(-1.0, 0.0),\r
  vec2(0.0, 1.0), vec2(0.0, -1.0), vec2(0.0, 1.0), vec2(0.0, -1.0)\r
);\r
\r
vec2 gradient(vec2 cell) {\r
  uvec2 q = uvec2(ivec2(cell) + 65536) + uvec2(uSeed * 7919u, uSeed * 104729u);\r
  q = 1103515245u * ((q >> 1u) ^ q.yx);\r
  uint n = 1103515245u * (q.x ^ (q.y >> 3u));\r
  return GRADIENTS[(n >> 16u) % 12u];\r
}\r
\r
float ease(float t) {\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
float perlin(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = p - i;\r
  float n00 = dot(gradient(i), f);\r
  float n10 = dot(gradient(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));\r
  float n01 = dot(gradient(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));\r
  float n11 = dot(gradient(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));\r
  vec2 u = vec2(ease(f.x), ease(f.y));\r
  return mix(mix(n00, n10, u.x), mix(n01, n11, u.x), u.y);\r
}\r
\r
vec2 node(ivec2 cell) {\r
  return texelFetch(uField, clamp(cell, ivec2(0), uFieldSize - 1), 0).xy;\r
}\r
\r
void weights(float f, out vec4 w, out vec4 d) {\r
  float g = 1.0 - f;\r
  float f2 = f * f;\r
  float f3 = f2 * f;\r
  w = vec4(g * g * g, 3.0 * f3 - 6.0 * f2 + 4.0, -3.0 * f3 + 3.0 * f2 + 3.0 * f + 1.0, f3) / 6.0;\r
  d = vec4(-g * g, 3.0 * f2 - 4.0 * f, -3.0 * f2 + 2.0 * f + 1.0, f2) * 0.5;\r
}\r
\r
vec2 field(vec2 point, out mat2 slope) {\r
  vec2 t = point / uCell;\r
  vec2 base = floor(t);\r
  vec2 f = t - base;\r
  vec4 wx;\r
  vec4 dx;\r
  vec4 wy;\r
  vec4 dy;\r
  weights(f.x, wx, dx);\r
  weights(f.y, wy, dy);\r
  ivec2 origin = ivec2(base) - 1;\r
  vec2 value = vec2(0.0);\r
  vec2 alongX = vec2(0.0);\r
  vec2 alongY = vec2(0.0);\r
  for (int j = 0; j < 4; j++) {\r
    vec2 row = vec2(0.0);\r
    vec2 rowSlope = vec2(0.0);\r
    for (int i = 0; i < 4; i++) {\r
      vec2 tap = node(origin + ivec2(i, j));\r
      row += tap * wx[i];\r
      rowSlope += tap * dx[i];\r
    }\r
    value += row * wy[j];\r
    alongX += rowSlope * wy[j];\r
    alongY += row * dy[j];\r
  }\r
  float size = length(value);\r
  float scale = size > 0.0001 ? uLimit * tanh(size / uLimit) / size : 1.0;\r
  slope = mat2(alongX, alongY) * (scale / uCell);\r
  return value * scale;\r
}\r
\r
vec2 wave(vec2 rest) {\r
  float turn = perlin(rest * uFrequency + uDrift) * 12.0 * uTwist;\r
  vec2 local = rest + vec2(cos(turn), sin(turn) * 0.5) * uAmplitude;\r
  return uView * 0.5 + vec2(local.x * uAxis.x - local.y * uAxis.y, local.x * uAxis.y + local.y * uAxis.x);\r
}\r
\r
void main() {\r
  int index = gl_VertexID >> 1;\r
  float side = float(gl_VertexID & 1) * 2.0 - 1.0;\r
  float u = uStart.x + float(gl_InstanceID) * uSpacing;\r
  float v = uStart.y + float(index) * uStep;\r
  vec2 flowing = wave(vec2(u, v));\r
  vec2 bend = wave(vec2(u, v + uStep)) - wave(vec2(u, v - uStep));\r
  mat2 slope;\r
  vec2 shift = field(flowing, slope);\r
  vec2 point = flowing + shift;\r
  float energy = length(shift);\r
  vec2 tangent = bend + slope * bend;\r
  float span = max(length(tangent), 0.0001);\r
  vec2 normal = vec2(-tangent.y, tangent.x) / span;\r
  vec2 corner = point + normal * side * uReach / uRatio;\r
  vAcross = side * uReach;\r
  vAlong = v;\r
  vEnergy = energy;\r
  vShow = clamp((uReveal - abs(u)) / uBand, 0.0, 1.0);\r
  uint line = uint(gl_InstanceID) * 747796405u + uSeed * 2891336453u + 1u;\r
  line = ((line >> ((line >> 28u) + 4u)) ^ line) * 277803737u;\r
  vPhase = float((line >> 22u) ^ line) / 4294967295.0;\r
  vec2 clip = corner / uView * 2.0 - 1.0;\r
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform vec2 uView;\r
uniform float uRatio;\r
uniform float uHalf;\r
uniform float uThin;\r
uniform int uStyle;\r
uniform float uPeriod;\r
uniform float uFlow;\r
uniform vec3 uColor;\r
uniform vec3 uAccent;\r
uniform float uBase;\r
uniform float uHeat;\r
uniform float uFade;\r
uniform float uOpacity;\r
in float vAcross;\r
in float vAlong;\r
in float vEnergy;\r
in float vShow;\r
in float vPhase;\r
out vec4 outColor;\r
\r
float smootherstep(float edge, float x) {\r
  float t = clamp(x / max(edge, 0.0001), 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  float coverage = clamp(uHalf + 0.5 - abs(vAcross), 0.0, 1.0) * uThin;\r
  if (uStyle == 1) {\r
    float phase = (vAlong + uFlow) / uPeriod + vPhase;\r
    float blur = max(fwidth(phase), 0.0001);\r
    coverage *= clamp((0.25 - abs(fract(phase) - 0.5)) / blur + 0.5, 0.0, 1.0);\r
  }\r
  float heat = smoothstep(0.0, uHeat, vEnergy);\r
  vec2 uv = gl_FragCoord.xy / (uView * uRatio);\r
  float edge = uFade * 0.5;\r
  float mask = smootherstep(edge, uv.x) * smootherstep(edge, 1.0 - uv.x) * smootherstep(edge, uv.y) * smootherstep(edge, 1.0 - uv.y);\r
  float alpha = coverage * mix(uBase, 1.0, heat) * mask * vShow * uOpacity;\r
  outColor = vec4(mix(uColor, uAccent, heat) * alpha, alpha);\r
}\`;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const smootherstep = value => {\r
  const t = clamp(value, 0, 1);\r
  return t * t * t * (t * (t * 6 - 15) + 10);\r
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
const link = gl => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
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
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
  for (let i = 0; i < count; i++) {\r
    const info = gl.getActiveUniform(program, i);\r
    if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const Waves = ({\r
  lineColor = '#ffffff',\r
  accentColor,\r
  backgroundColor = 'transparent',\r
  lineStyle = 'solid',\r
  spacing = 10,\r
  lineWidth = 1,\r
  rotation = 0,\r
  amplitude = 32,\r
  scale = 1,\r
  twist = 1,\r
  speed = 1,\r
  variation = 0,\r
  mouseInteraction = true,\r
  mouseRadius = 175,\r
  mouseStrength = 1,\r
  bounce = 0.5,\r
  returnDuration = 1.4,\r
  clickRipple = true,\r
  intro = true,\r
  fade = 0,\r
  opacity = 1,\r
  lightMode = false,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settings = {\r
    lineColor: String(lineColor),\r
    accentColor: accentColor ? String(accentColor) : '',\r
    lineStyle: STYLES[lineStyle] ?? 0,\r
    spacing: Math.max(2, spacing),\r
    lineWidth: Math.max(0.25, lineWidth),\r
    rotation,\r
    amplitude: Math.max(0, amplitude),\r
    scale: Math.max(0.05, scale),\r
    twist: Math.max(0, twist),\r
    speed,\r
    variation: Math.max(0, Math.round(variation)),\r
    mouseInteraction,\r
    mouseRadius: Math.max(20, mouseRadius),\r
    mouseStrength: Math.max(0, mouseStrength),\r
    bounce: clamp(bounce, 0, 1),\r
    returnDuration: Math.max(0.2, returnDuration),\r
    clickRipple,\r
    intro,\r
    fade: clamp(fade, 0, 1),\r
    opacity: clamp(opacity, 0, 1),\r
    lightMode,\r
    paused,\r
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
    const program = link(gl);\r
    if (!program) return undefined;\r
    const u = program.uniforms;\r
\r
    const vao = gl.createVertexArray();\r
    const texture = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, texture);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const colors = new Map();\r
    const parse = value => {\r
      if (colors.has(value)) return colors.get(value);\r
      let rgb = [1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#ffffff';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      colors.set(value, rgb);\r
      return rgb;\r
    };\r
    const ink = rgb => {\r
      const linear = rgb.map(v => Math.pow(v, 2.2));\r
      const tone = 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];\r
      const depth = Math.min(1, 0.045 / Math.max(tone, 0.0001));\r
      return linear.map(v => Math.pow(v * depth, 1 / 2.2));\r
    };\r
\r
    const view = { width: 1, height: 1, ratio: 1 };\r
    const grid = {\r
      cols: 0,\r
      rows: 0,\r
      shift: new Float32Array(0),\r
      speed: new Float32Array(0),\r
      top: 0,\r
      bottom: -1,\r
      left: 0,\r
      right: -1\r
    };\r
    const pointer = { x: 0, y: 0, sx: 0, sy: 0, vx: 0, vy: 0, inside: false };\r
    const ripples = [];\r
    const state = { flow: 0, intro: settingsRef.current.intro && !reduce ? 0 : 1 };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const limitOf = s => Math.max(12, s.mouseRadius * 0.5);\r
\r
    const rebuild = () => {\r
      grid.cols = Math.ceil(view.width / CELL) + 2;\r
      grid.rows = Math.ceil(view.height / CELL) + 2;\r
      grid.shift = new Float32Array(grid.cols * grid.rows * 2);\r
      grid.speed = new Float32Array(grid.cols * grid.rows * 2);\r
      grid.top = 0;\r
      grid.bottom = -1;\r
      grid.left = 0;\r
      grid.right = -1;\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG32F, grid.cols, grid.rows, 0, gl.RG, gl.FLOAT, grid.shift);\r
    };\r
\r
    const include = (x0, y0, x1, y1) => {\r
      const c0 = clamp(Math.floor(x0 / CELL), 0, grid.cols - 1);\r
      const c1 = clamp(Math.ceil(x1 / CELL), 0, grid.cols - 1);\r
      const r0 = clamp(Math.floor(y0 / CELL), 0, grid.rows - 1);\r
      const r1 = clamp(Math.ceil(y1 / CELL), 0, grid.rows - 1);\r
      const empty = grid.bottom < grid.top;\r
      grid.top = empty ? r0 : Math.min(grid.top, r0);\r
      grid.bottom = empty ? r1 : Math.max(grid.bottom, r1);\r
      grid.left = empty ? c0 : Math.min(grid.left, c0);\r
      grid.right = empty ? c1 : Math.max(grid.right, c1);\r
    };\r
\r
    const simulate = dt => {\r
      const s = settingsRef.current;\r
      const follow = 1 - Math.exp(-dt / 0.045);\r
      const nx = pointer.sx + (pointer.x - pointer.sx) * follow;\r
      const ny = pointer.sy + (pointer.y - pointer.sy) * follow;\r
      const blend = 1 - Math.exp(-dt / 0.06);\r
      pointer.vx += ((nx - pointer.sx) / dt - pointer.vx) * blend;\r
      pointer.vy += ((ny - pointer.sy) / dt - pointer.vy) * blend;\r
      pointer.sx = nx;\r
      pointer.sy = ny;\r
\r
      const zeta = 1 - 0.85 * s.bounce;\r
      const omega = 4 / (zeta * s.returnDuration);\r
      const radius = s.mouseRadius;\r
      const speedNow = Math.hypot(pointer.vx, pointer.vy);\r
      const drive =\r
        s.mouseInteraction && pointer.inside && !reduce ? 26000 * Math.tanh(speedNow / 1400) * s.mouseStrength : 0;\r
      if (drive > 1) include(pointer.sx - radius, pointer.sy - radius, pointer.sx + radius, pointer.sy + radius);\r
\r
      const live = [];\r
      for (let i = ripples.length - 1; i >= 0; i--) {\r
        const ripple = ripples[i];\r
        ripple.age += dt;\r
        const front = ripple.age * RIPPLE_SPEED;\r
        const life = 1 - front / ripple.range;\r
        if (life <= 0) {\r
          ripples.splice(i, 1);\r
          continue;\r
        }\r
        const reach = front + RIPPLE_WIDTH * 3;\r
        include(ripple.x - reach, ripple.y - reach, ripple.x + reach, ripple.y + reach);\r
        live.push({\r
          x: ripple.x,\r
          y: ripple.y,\r
          front,\r
          power: (150 * omega * life * Math.sqrt(life)) / RIPPLE_IMPULSE\r
        });\r
      }\r
\r
      if (grid.bottom < grid.top) return false;\r
\r
      const stiffness = omega * omega;\r
      const damping = 2 * zeta * omega;\r
      const steps = Math.min(16, Math.max(1, Math.ceil(dt / Math.min(1 / 120, 0.6 / omega))));\r
      const h = dt / steps;\r
      const dirX = speedNow > 0.001 ? pointer.vx / speedNow : 0;\r
      const dirY = speedNow > 0.001 ? pointer.vy / speedNow : 0;\r
      const { cols, shift, speed: velocity, left, right } = grid;\r
      let peak = 0;\r
\r
      for (let row = grid.top; row <= grid.bottom; row++) {\r
        const y = row * CELL;\r
        for (let col = left; col <= right; col++) {\r
          const x = col * CELL;\r
          const index = (row * cols + col) * 2;\r
          let ax = 0;\r
          let ay = 0;\r
          if (drive > 1) {\r
            const distance = Math.hypot(x - pointer.sx, y - pointer.sy);\r
            if (distance < radius) {\r
              const weight = smootherstep(1 - distance / radius) * drive;\r
              ax += dirX * weight;\r
              ay += dirY * weight;\r
            }\r
          }\r
          for (const ripple of live) {\r
            const ex = x - ripple.x;\r
            const ey = y - ripple.y;\r
            const distance = Math.hypot(ex, ey);\r
            const offset = (distance - ripple.front) / RIPPLE_WIDTH;\r
            if (distance > 0.001 && Math.abs(offset) < 3) {\r
              const push = ripple.power * Math.exp(-offset * offset * 2) * smootherstep(distance / 56);\r
              ax += (ex / distance) * push;\r
              ay += (ey / distance) * push;\r
            }\r
          }\r
          let px = shift[index];\r
          let py = shift[index + 1];\r
          let vx = velocity[index];\r
          let vy = velocity[index + 1];\r
          for (let k = 0; k < steps; k++) {\r
            vx += (ax - stiffness * px - damping * vx) * h;\r
            vy += (ay - stiffness * py - damping * vy) * h;\r
            px += vx * h;\r
            py += vy * h;\r
          }\r
          shift[index] = px;\r
          shift[index + 1] = py;\r
          velocity[index] = vx;\r
          velocity[index + 1] = vy;\r
          peak = Math.max(peak, Math.abs(px) + Math.abs(py) + (Math.abs(vx) + Math.abs(vy)) * 0.05);\r
        }\r
      }\r
\r
      const top = grid.top;\r
      const height = grid.bottom - grid.top + 1;\r
      if (peak < 0.02 && drive <= 1 && !live.length) {\r
        for (let row = grid.top; row <= grid.bottom; row++) {\r
          shift.fill(0, (row * cols + left) * 2, (row * cols + right + 1) * 2);\r
          velocity.fill(0, (row * cols + left) * 2, (row * cols + right + 1) * 2);\r
        }\r
        grid.top = 0;\r
        grid.bottom = -1;\r
      }\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texSubImage2D(\r
        gl.TEXTURE_2D,\r
        0,\r
        0,\r
        top,\r
        cols,\r
        height,\r
        gl.RG,\r
        gl.FLOAT,\r
        shift.subarray(top * cols * 2, (top + height) * cols * 2)\r
      );\r
      return grid.bottom >= grid.top;\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const angle = (s.rotation * Math.PI) / 180;\r
      const cos = Math.cos(angle);\r
      const sin = Math.sin(angle);\r
      const limit = limitOf(s);\r
      const margin = s.amplitude * 1.1 + limit + s.spacing * 2 + 8;\r
      const reachU = (view.width * Math.abs(cos) + view.height * Math.abs(sin)) / 2 + margin;\r
      const reachV = (view.width * Math.abs(sin) + view.height * Math.abs(cos)) / 2 + margin;\r
      const half = Math.ceil(reachU / s.spacing);\r
      const lines = half * 2 + 1;\r
      let step = STEP;\r
      let samples = Math.ceil((reachV * 2) / step) + 1;\r
      if (lines * samples * 2 > MAX_VERTICES) {\r
        samples = Math.max(16, Math.floor(MAX_VERTICES / (lines * 2)));\r
        step = (reachV * 2) / (samples - 1);\r
      }\r
      const width = s.lineWidth * view.ratio;\r
      const halfWidth = Math.max(0.5, width / 2);\r
      const reach = halfWidth + 1;\r
      const progress = state.intro;\r
      const reveal = s.intro && !reduce ? (1 - Math.pow(1 - clamp(progress / 0.7, 0, 1), 3)) * reachU * 1.3 : 1e6;\r
      const swell = s.intro && !reduce ? smootherstep((progress - 0.1) / 0.9) : 1;\r
      const base = parse(s.lineColor);\r
      const tone = s.lightMode ? ink(base) : base;\r
      const accent = s.accentColor ? parse(s.accentColor) : tone;\r
      const flowTime = state.flow + s.variation * 37.1;\r
\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      gl.useProgram(program.program);\r
      gl.bindVertexArray(vao);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.uniform1i(u.uField, 0);\r
      gl.uniform2f(u.uView, view.width, view.height);\r
      gl.uniform1f(u.uRatio, view.ratio);\r
      gl.uniform2f(u.uAxis, cos, sin);\r
      gl.uniform1f(u.uSpacing, s.spacing);\r
      gl.uniform1f(u.uStep, step);\r
      gl.uniform2f(u.uStart, -half * s.spacing, -reachV);\r
      gl.uniform1f(u.uAmplitude, s.amplitude * swell);\r
      gl.uniform2f(u.uFrequency, 0.002 / s.scale, 0.0015 / s.scale);\r
      gl.uniform2f(u.uDrift, flowTime * 0.025, flowTime * 0.0075);\r
      gl.uniform1f(u.uTwist, s.twist);\r
      gl.uniform1ui(u.uSeed, s.variation);\r
      gl.uniform2i(u.uFieldSize, grid.cols, grid.rows);\r
      gl.uniform1f(u.uCell, CELL);\r
      gl.uniform1f(u.uLimit, limit);\r
      gl.uniform1f(u.uReach, reach);\r
      gl.uniform1f(u.uReveal, reveal);\r
      gl.uniform1f(u.uBand, Math.max(1, reachU * 0.3));\r
      gl.uniform1f(u.uHalf, halfWidth);\r
      gl.uniform1f(u.uThin, Math.min(1, width));\r
      gl.uniform1i(u.uStyle, s.lineStyle);\r
      gl.uniform1f(u.uPeriod, s.spacing * 2.6);\r
      gl.uniform1f(u.uFlow, (state.flow * 16) % (s.spacing * 2.6));\r
      gl.uniform3fv(u.uColor, tone);\r
      gl.uniform3fv(u.uAccent, accent);\r
      gl.uniform1f(u.uBase, 0.62);\r
      gl.uniform1f(u.uHeat, limit * 0.55);\r
      gl.uniform1f(u.uFade, s.fade);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, samples * 2, lines);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.0005, 0.05) : 1 / 60;\r
      last = now;\r
      if (s.paused) {\r
        state.intro = 1;\r
        render();\r
        last = 0;\r
        return;\r
      }\r
      if (!reduce) state.flow += dt * s.speed;\r
      if (!s.intro || reduce) state.intro = 1;\r
      else if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / INTRO_SECONDS);\r
      const awake = simulate(dt);\r
      render();\r
      const engaged = pointer.inside && s.mouseInteraction && Math.hypot(pointer.vx, pointer.vy) > 1;\r
      if (!reduce || awake || engaged || ripples.length || state.intro < 1) raf = requestAnimationFrame(frame);\r
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
      rebuild();\r
      render();\r
      wake();\r
    };\r
\r
    const place = (event, snap) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      const inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      if (snap || (inside && !pointer.inside)) {\r
        pointer.sx = x;\r
        pointer.sy = y;\r
        pointer.vx = 0;\r
        pointer.vy = 0;\r
      }\r
      pointer.inside = inside;\r
      pointer.x = x;\r
      pointer.y = y;\r
      return { x, y, rect, inside };\r
    };\r
\r
    const onPointerMove = event => {\r
      place(event, false);\r
      if (!settingsRef.current.paused) wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      const { x, y, rect, inside } = place(event, event.pointerType !== 'mouse');\r
      if (inside && s.clickRipple && !s.paused && !reduce) {\r
        ripples.push({ x, y, age: 0, range: Math.max(360, Math.hypot(rect.width, rect.height) * 0.55) });\r
        if (ripples.length > 6) ripples.shift();\r
      }\r
      wake();\r
    };\r
\r
    const onPointerUp = event => {\r
      if (event.pointerType !== 'mouse') pointer.inside = false;\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
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
      gl.deleteProgram(program.program);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteTexture(texture);\r
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
      className={['absolute inset-0 overflow-hidden', className].filter(Boolean).join(' ')}\r
      style={{ backgroundColor, ...style }}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Waves;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties } from 'react';\r
import './Waves.css';\r
\r
export type WavesLineStyle = 'solid' | 'dashed';\r
\r
export interface WavesProps {\r
  lineColor?: string;\r
  accentColor?: string;\r
  backgroundColor?: string;\r
  lineStyle?: WavesLineStyle;\r
  spacing?: number;\r
  lineWidth?: number;\r
  rotation?: number;\r
  amplitude?: number;\r
  scale?: number;\r
  twist?: number;\r
  speed?: number;\r
  variation?: number;\r
  mouseInteraction?: boolean;\r
  mouseRadius?: number;\r
  mouseStrength?: number;\r
  bounce?: number;\r
  returnDuration?: number;\r
  clickRipple?: boolean;\r
  intro?: boolean;\r
  fade?: number;\r
  opacity?: number;\r
  lightMode?: boolean;\r
  paused?: boolean;\r
  dpr?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
type Settings = {\r
  lineColor: string;\r
  accentColor: string;\r
  lineStyle: number;\r
  spacing: number;\r
  lineWidth: number;\r
  rotation: number;\r
  amplitude: number;\r
  scale: number;\r
  twist: number;\r
  speed: number;\r
  variation: number;\r
  mouseInteraction: boolean;\r
  mouseRadius: number;\r
  mouseStrength: number;\r
  bounce: number;\r
  returnDuration: number;\r
  clickRipple: boolean;\r
  intro: boolean;\r
  fade: number;\r
  opacity: number;\r
  lightMode: boolean;\r
  paused: boolean;\r
  dpr?: number;\r
};\r
\r
type Ripple = { x: number; y: number; age: number; range: number };\r
\r
type Front = { x: number; y: number; front: number; power: number };\r
\r
type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };\r
\r
const STYLES: Record<string, number> = { solid: 0, dashed: 1 };\r
const CELL = 12;\r
const STEP = 4;\r
const INTRO_SECONDS = 2.2;\r
const RIPPLE_SPEED = 640;\r
const RIPPLE_WIDTH = 64;\r
const RIPPLE_IMPULSE = (RIPPLE_WIDTH * Math.sqrt(Math.PI / 2)) / RIPPLE_SPEED;\r
const MAX_VERTICES = 1600000;\r
\r
const VERTEX = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform vec2 uView;\r
uniform float uRatio;\r
uniform vec2 uAxis;\r
uniform float uSpacing;\r
uniform float uStep;\r
uniform vec2 uStart;\r
uniform float uAmplitude;\r
uniform vec2 uFrequency;\r
uniform vec2 uDrift;\r
uniform float uTwist;\r
uniform uint uSeed;\r
uniform sampler2D uField;\r
uniform ivec2 uFieldSize;\r
uniform float uCell;\r
uniform float uLimit;\r
uniform float uReach;\r
uniform float uReveal;\r
uniform float uBand;\r
out float vAcross;\r
out float vAlong;\r
out float vEnergy;\r
out float vShow;\r
out float vPhase;\r
\r
const vec2 GRADIENTS[12] = vec2[12](\r
  vec2(1.0, 1.0), vec2(-1.0, 1.0), vec2(1.0, -1.0), vec2(-1.0, -1.0),\r
  vec2(1.0, 0.0), vec2(-1.0, 0.0), vec2(1.0, 0.0), vec2(-1.0, 0.0),\r
  vec2(0.0, 1.0), vec2(0.0, -1.0), vec2(0.0, 1.0), vec2(0.0, -1.0)\r
);\r
\r
vec2 gradient(vec2 cell) {\r
  uvec2 q = uvec2(ivec2(cell) + 65536) + uvec2(uSeed * 7919u, uSeed * 104729u);\r
  q = 1103515245u * ((q >> 1u) ^ q.yx);\r
  uint n = 1103515245u * (q.x ^ (q.y >> 3u));\r
  return GRADIENTS[(n >> 16u) % 12u];\r
}\r
\r
float ease(float t) {\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
float perlin(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = p - i;\r
  float n00 = dot(gradient(i), f);\r
  float n10 = dot(gradient(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));\r
  float n01 = dot(gradient(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));\r
  float n11 = dot(gradient(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));\r
  vec2 u = vec2(ease(f.x), ease(f.y));\r
  return mix(mix(n00, n10, u.x), mix(n01, n11, u.x), u.y);\r
}\r
\r
vec2 node(ivec2 cell) {\r
  return texelFetch(uField, clamp(cell, ivec2(0), uFieldSize - 1), 0).xy;\r
}\r
\r
void weights(float f, out vec4 w, out vec4 d) {\r
  float g = 1.0 - f;\r
  float f2 = f * f;\r
  float f3 = f2 * f;\r
  w = vec4(g * g * g, 3.0 * f3 - 6.0 * f2 + 4.0, -3.0 * f3 + 3.0 * f2 + 3.0 * f + 1.0, f3) / 6.0;\r
  d = vec4(-g * g, 3.0 * f2 - 4.0 * f, -3.0 * f2 + 2.0 * f + 1.0, f2) * 0.5;\r
}\r
\r
vec2 field(vec2 point, out mat2 slope) {\r
  vec2 t = point / uCell;\r
  vec2 base = floor(t);\r
  vec2 f = t - base;\r
  vec4 wx;\r
  vec4 dx;\r
  vec4 wy;\r
  vec4 dy;\r
  weights(f.x, wx, dx);\r
  weights(f.y, wy, dy);\r
  ivec2 origin = ivec2(base) - 1;\r
  vec2 value = vec2(0.0);\r
  vec2 alongX = vec2(0.0);\r
  vec2 alongY = vec2(0.0);\r
  for (int j = 0; j < 4; j++) {\r
    vec2 row = vec2(0.0);\r
    vec2 rowSlope = vec2(0.0);\r
    for (int i = 0; i < 4; i++) {\r
      vec2 tap = node(origin + ivec2(i, j));\r
      row += tap * wx[i];\r
      rowSlope += tap * dx[i];\r
    }\r
    value += row * wy[j];\r
    alongX += rowSlope * wy[j];\r
    alongY += row * dy[j];\r
  }\r
  float size = length(value);\r
  float scale = size > 0.0001 ? uLimit * tanh(size / uLimit) / size : 1.0;\r
  slope = mat2(alongX, alongY) * (scale / uCell);\r
  return value * scale;\r
}\r
\r
vec2 wave(vec2 rest) {\r
  float turn = perlin(rest * uFrequency + uDrift) * 12.0 * uTwist;\r
  vec2 local = rest + vec2(cos(turn), sin(turn) * 0.5) * uAmplitude;\r
  return uView * 0.5 + vec2(local.x * uAxis.x - local.y * uAxis.y, local.x * uAxis.y + local.y * uAxis.x);\r
}\r
\r
void main() {\r
  int index = gl_VertexID >> 1;\r
  float side = float(gl_VertexID & 1) * 2.0 - 1.0;\r
  float u = uStart.x + float(gl_InstanceID) * uSpacing;\r
  float v = uStart.y + float(index) * uStep;\r
  vec2 flowing = wave(vec2(u, v));\r
  vec2 bend = wave(vec2(u, v + uStep)) - wave(vec2(u, v - uStep));\r
  mat2 slope;\r
  vec2 shift = field(flowing, slope);\r
  vec2 point = flowing + shift;\r
  float energy = length(shift);\r
  vec2 tangent = bend + slope * bend;\r
  float span = max(length(tangent), 0.0001);\r
  vec2 normal = vec2(-tangent.y, tangent.x) / span;\r
  vec2 corner = point + normal * side * uReach / uRatio;\r
  vAcross = side * uReach;\r
  vAlong = v;\r
  vEnergy = energy;\r
  vShow = clamp((uReveal - abs(u)) / uBand, 0.0, 1.0);\r
  uint line = uint(gl_InstanceID) * 747796405u + uSeed * 2891336453u + 1u;\r
  line = ((line >> ((line >> 28u) + 4u)) ^ line) * 277803737u;\r
  vPhase = float((line >> 22u) ^ line) / 4294967295.0;\r
  vec2 clip = corner / uView * 2.0 - 1.0;\r
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform vec2 uView;\r
uniform float uRatio;\r
uniform float uHalf;\r
uniform float uThin;\r
uniform int uStyle;\r
uniform float uPeriod;\r
uniform float uFlow;\r
uniform vec3 uColor;\r
uniform vec3 uAccent;\r
uniform float uBase;\r
uniform float uHeat;\r
uniform float uFade;\r
uniform float uOpacity;\r
in float vAcross;\r
in float vAlong;\r
in float vEnergy;\r
in float vShow;\r
in float vPhase;\r
out vec4 outColor;\r
\r
float smootherstep(float edge, float x) {\r
  float t = clamp(x / max(edge, 0.0001), 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  float coverage = clamp(uHalf + 0.5 - abs(vAcross), 0.0, 1.0) * uThin;\r
  if (uStyle == 1) {\r
    float phase = (vAlong + uFlow) / uPeriod + vPhase;\r
    float blur = max(fwidth(phase), 0.0001);\r
    coverage *= clamp((0.25 - abs(fract(phase) - 0.5)) / blur + 0.5, 0.0, 1.0);\r
  }\r
  float heat = smoothstep(0.0, uHeat, vEnergy);\r
  vec2 uv = gl_FragCoord.xy / (uView * uRatio);\r
  float edge = uFade * 0.5;\r
  float mask = smootherstep(edge, uv.x) * smootherstep(edge, 1.0 - uv.x) * smootherstep(edge, uv.y) * smootherstep(edge, 1.0 - uv.y);\r
  float alpha = coverage * mix(uBase, 1.0, heat) * mask * vShow * uOpacity;\r
  outColor = vec4(mix(uColor, uAccent, heat) * alpha, alpha);\r
}\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const smootherstep = (value: number) => {\r
  const t = clamp(value, 0, 1);\r
  return t * t * t * (t * (t * 6 - 15) + 10);\r
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
const link = (gl: WebGL2RenderingContext): Program | null => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
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
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
  for (let i = 0; i < count; i++) {\r
    const info = gl.getActiveUniform(program, i);\r
    if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const Waves = ({\r
  lineColor = '#ffffff',\r
  accentColor,\r
  backgroundColor = 'transparent',\r
  lineStyle = 'solid',\r
  spacing = 10,\r
  lineWidth = 1,\r
  rotation = 0,\r
  amplitude = 32,\r
  scale = 1,\r
  twist = 1,\r
  speed = 1,\r
  variation = 0,\r
  mouseInteraction = true,\r
  mouseRadius = 175,\r
  mouseStrength = 1,\r
  bounce = 0.5,\r
  returnDuration = 1.4,\r
  clickRipple = true,\r
  intro = true,\r
  fade = 0,\r
  opacity = 1,\r
  lightMode = false,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  style\r
}: WavesProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings: Settings = {\r
    lineColor: String(lineColor),\r
    accentColor: accentColor ? String(accentColor) : '',\r
    lineStyle: STYLES[lineStyle] ?? 0,\r
    spacing: Math.max(2, spacing),\r
    lineWidth: Math.max(0.25, lineWidth),\r
    rotation,\r
    amplitude: Math.max(0, amplitude),\r
    scale: Math.max(0.05, scale),\r
    twist: Math.max(0, twist),\r
    speed,\r
    variation: Math.max(0, Math.round(variation)),\r
    mouseInteraction,\r
    mouseRadius: Math.max(20, mouseRadius),\r
    mouseStrength: Math.max(0, mouseStrength),\r
    bounce: clamp(bounce, 0, 1),\r
    returnDuration: Math.max(0.2, returnDuration),\r
    clickRipple,\r
    intro,\r
    fade: clamp(fade, 0, 1),\r
    opacity: clamp(opacity, 0, 1),\r
    lightMode,\r
    paused,\r
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
    const program = link(gl);\r
    if (!program) return undefined;\r
    const u = program.uniforms;\r
\r
    const vao = gl.createVertexArray();\r
    const texture = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, texture);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const colors = new Map<string, number[]>();\r
    const parse = (value: string): number[] => {\r
      const cached = colors.get(value);\r
      if (cached) return cached;\r
      let rgb = [1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#ffffff';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      colors.set(value, rgb);\r
      return rgb;\r
    };\r
    const ink = (rgb: number[]): number[] => {\r
      const linear = rgb.map(v => Math.pow(v, 2.2));\r
      const tone = 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];\r
      const depth = Math.min(1, 0.045 / Math.max(tone, 0.0001));\r
      return linear.map(v => Math.pow(v * depth, 1 / 2.2));\r
    };\r
\r
    const view = { width: 1, height: 1, ratio: 1 };\r
    const grid = {\r
      cols: 0,\r
      rows: 0,\r
      shift: new Float32Array(0),\r
      speed: new Float32Array(0),\r
      top: 0,\r
      bottom: -1,\r
      left: 0,\r
      right: -1\r
    };\r
    const pointer = { x: 0, y: 0, sx: 0, sy: 0, vx: 0, vy: 0, inside: false };\r
    const ripples: Ripple[] = [];\r
    const state = { flow: 0, intro: settingsRef.current.intro && !reduce ? 0 : 1 };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const limitOf = (s: Settings) => Math.max(12, s.mouseRadius * 0.5);\r
\r
    const rebuild = () => {\r
      grid.cols = Math.ceil(view.width / CELL) + 2;\r
      grid.rows = Math.ceil(view.height / CELL) + 2;\r
      grid.shift = new Float32Array(grid.cols * grid.rows * 2);\r
      grid.speed = new Float32Array(grid.cols * grid.rows * 2);\r
      grid.top = 0;\r
      grid.bottom = -1;\r
      grid.left = 0;\r
      grid.right = -1;\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG32F, grid.cols, grid.rows, 0, gl.RG, gl.FLOAT, grid.shift);\r
    };\r
\r
    const include = (x0: number, y0: number, x1: number, y1: number) => {\r
      const c0 = clamp(Math.floor(x0 / CELL), 0, grid.cols - 1);\r
      const c1 = clamp(Math.ceil(x1 / CELL), 0, grid.cols - 1);\r
      const r0 = clamp(Math.floor(y0 / CELL), 0, grid.rows - 1);\r
      const r1 = clamp(Math.ceil(y1 / CELL), 0, grid.rows - 1);\r
      const empty = grid.bottom < grid.top;\r
      grid.top = empty ? r0 : Math.min(grid.top, r0);\r
      grid.bottom = empty ? r1 : Math.max(grid.bottom, r1);\r
      grid.left = empty ? c0 : Math.min(grid.left, c0);\r
      grid.right = empty ? c1 : Math.max(grid.right, c1);\r
    };\r
\r
    const simulate = (dt: number) => {\r
      const s = settingsRef.current;\r
      const follow = 1 - Math.exp(-dt / 0.045);\r
      const nx = pointer.sx + (pointer.x - pointer.sx) * follow;\r
      const ny = pointer.sy + (pointer.y - pointer.sy) * follow;\r
      const blend = 1 - Math.exp(-dt / 0.06);\r
      pointer.vx += ((nx - pointer.sx) / dt - pointer.vx) * blend;\r
      pointer.vy += ((ny - pointer.sy) / dt - pointer.vy) * blend;\r
      pointer.sx = nx;\r
      pointer.sy = ny;\r
\r
      const zeta = 1 - 0.85 * s.bounce;\r
      const omega = 4 / (zeta * s.returnDuration);\r
      const radius = s.mouseRadius;\r
      const speedNow = Math.hypot(pointer.vx, pointer.vy);\r
      const drive =\r
        s.mouseInteraction && pointer.inside && !reduce ? 26000 * Math.tanh(speedNow / 1400) * s.mouseStrength : 0;\r
      if (drive > 1) include(pointer.sx - radius, pointer.sy - radius, pointer.sx + radius, pointer.sy + radius);\r
\r
      const live: Front[] = [];\r
      for (let i = ripples.length - 1; i >= 0; i--) {\r
        const ripple = ripples[i];\r
        ripple.age += dt;\r
        const front = ripple.age * RIPPLE_SPEED;\r
        const life = 1 - front / ripple.range;\r
        if (life <= 0) {\r
          ripples.splice(i, 1);\r
          continue;\r
        }\r
        const reach = front + RIPPLE_WIDTH * 3;\r
        include(ripple.x - reach, ripple.y - reach, ripple.x + reach, ripple.y + reach);\r
        live.push({\r
          x: ripple.x,\r
          y: ripple.y,\r
          front,\r
          power: (150 * omega * life * Math.sqrt(life)) / RIPPLE_IMPULSE\r
        });\r
      }\r
\r
      if (grid.bottom < grid.top) return false;\r
\r
      const stiffness = omega * omega;\r
      const damping = 2 * zeta * omega;\r
      const steps = Math.min(16, Math.max(1, Math.ceil(dt / Math.min(1 / 120, 0.6 / omega))));\r
      const h = dt / steps;\r
      const dirX = speedNow > 0.001 ? pointer.vx / speedNow : 0;\r
      const dirY = speedNow > 0.001 ? pointer.vy / speedNow : 0;\r
      const { cols, shift, speed: velocity, left, right } = grid;\r
      let peak = 0;\r
\r
      for (let row = grid.top; row <= grid.bottom; row++) {\r
        const y = row * CELL;\r
        for (let col = left; col <= right; col++) {\r
          const x = col * CELL;\r
          const index = (row * cols + col) * 2;\r
          let ax = 0;\r
          let ay = 0;\r
          if (drive > 1) {\r
            const distance = Math.hypot(x - pointer.sx, y - pointer.sy);\r
            if (distance < radius) {\r
              const weight = smootherstep(1 - distance / radius) * drive;\r
              ax += dirX * weight;\r
              ay += dirY * weight;\r
            }\r
          }\r
          for (const ripple of live) {\r
            const ex = x - ripple.x;\r
            const ey = y - ripple.y;\r
            const distance = Math.hypot(ex, ey);\r
            const offset = (distance - ripple.front) / RIPPLE_WIDTH;\r
            if (distance > 0.001 && Math.abs(offset) < 3) {\r
              const push = ripple.power * Math.exp(-offset * offset * 2) * smootherstep(distance / 56);\r
              ax += (ex / distance) * push;\r
              ay += (ey / distance) * push;\r
            }\r
          }\r
          let px = shift[index];\r
          let py = shift[index + 1];\r
          let vx = velocity[index];\r
          let vy = velocity[index + 1];\r
          for (let k = 0; k < steps; k++) {\r
            vx += (ax - stiffness * px - damping * vx) * h;\r
            vy += (ay - stiffness * py - damping * vy) * h;\r
            px += vx * h;\r
            py += vy * h;\r
          }\r
          shift[index] = px;\r
          shift[index + 1] = py;\r
          velocity[index] = vx;\r
          velocity[index + 1] = vy;\r
          peak = Math.max(peak, Math.abs(px) + Math.abs(py) + (Math.abs(vx) + Math.abs(vy)) * 0.05);\r
        }\r
      }\r
\r
      const top = grid.top;\r
      const height = grid.bottom - grid.top + 1;\r
      if (peak < 0.02 && drive <= 1 && !live.length) {\r
        for (let row = grid.top; row <= grid.bottom; row++) {\r
          shift.fill(0, (row * cols + left) * 2, (row * cols + right + 1) * 2);\r
          velocity.fill(0, (row * cols + left) * 2, (row * cols + right + 1) * 2);\r
        }\r
        grid.top = 0;\r
        grid.bottom = -1;\r
      }\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texSubImage2D(\r
        gl.TEXTURE_2D,\r
        0,\r
        0,\r
        top,\r
        cols,\r
        height,\r
        gl.RG,\r
        gl.FLOAT,\r
        shift.subarray(top * cols * 2, (top + height) * cols * 2)\r
      );\r
      return grid.bottom >= grid.top;\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const angle = (s.rotation * Math.PI) / 180;\r
      const cos = Math.cos(angle);\r
      const sin = Math.sin(angle);\r
      const limit = limitOf(s);\r
      const margin = s.amplitude * 1.1 + limit + s.spacing * 2 + 8;\r
      const reachU = (view.width * Math.abs(cos) + view.height * Math.abs(sin)) / 2 + margin;\r
      const reachV = (view.width * Math.abs(sin) + view.height * Math.abs(cos)) / 2 + margin;\r
      const half = Math.ceil(reachU / s.spacing);\r
      const lines = half * 2 + 1;\r
      let step = STEP;\r
      let samples = Math.ceil((reachV * 2) / step) + 1;\r
      if (lines * samples * 2 > MAX_VERTICES) {\r
        samples = Math.max(16, Math.floor(MAX_VERTICES / (lines * 2)));\r
        step = (reachV * 2) / (samples - 1);\r
      }\r
      const width = s.lineWidth * view.ratio;\r
      const halfWidth = Math.max(0.5, width / 2);\r
      const reach = halfWidth + 1;\r
      const progress = state.intro;\r
      const reveal = s.intro && !reduce ? (1 - Math.pow(1 - clamp(progress / 0.7, 0, 1), 3)) * reachU * 1.3 : 1e6;\r
      const swell = s.intro && !reduce ? smootherstep((progress - 0.1) / 0.9) : 1;\r
      const base = parse(s.lineColor);\r
      const tone = s.lightMode ? ink(base) : base;\r
      const accent = s.accentColor ? parse(s.accentColor) : tone;\r
      const flowTime = state.flow + s.variation * 37.1;\r
\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      gl.useProgram(program.program);\r
      gl.bindVertexArray(vao);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.uniform1i(u.uField, 0);\r
      gl.uniform2f(u.uView, view.width, view.height);\r
      gl.uniform1f(u.uRatio, view.ratio);\r
      gl.uniform2f(u.uAxis, cos, sin);\r
      gl.uniform1f(u.uSpacing, s.spacing);\r
      gl.uniform1f(u.uStep, step);\r
      gl.uniform2f(u.uStart, -half * s.spacing, -reachV);\r
      gl.uniform1f(u.uAmplitude, s.amplitude * swell);\r
      gl.uniform2f(u.uFrequency, 0.002 / s.scale, 0.0015 / s.scale);\r
      gl.uniform2f(u.uDrift, flowTime * 0.025, flowTime * 0.0075);\r
      gl.uniform1f(u.uTwist, s.twist);\r
      gl.uniform1ui(u.uSeed, s.variation);\r
      gl.uniform2i(u.uFieldSize, grid.cols, grid.rows);\r
      gl.uniform1f(u.uCell, CELL);\r
      gl.uniform1f(u.uLimit, limit);\r
      gl.uniform1f(u.uReach, reach);\r
      gl.uniform1f(u.uReveal, reveal);\r
      gl.uniform1f(u.uBand, Math.max(1, reachU * 0.3));\r
      gl.uniform1f(u.uHalf, halfWidth);\r
      gl.uniform1f(u.uThin, Math.min(1, width));\r
      gl.uniform1i(u.uStyle, s.lineStyle);\r
      gl.uniform1f(u.uPeriod, s.spacing * 2.6);\r
      gl.uniform1f(u.uFlow, (state.flow * 16) % (s.spacing * 2.6));\r
      gl.uniform3fv(u.uColor, tone);\r
      gl.uniform3fv(u.uAccent, accent);\r
      gl.uniform1f(u.uBase, 0.62);\r
      gl.uniform1f(u.uHeat, limit * 0.55);\r
      gl.uniform1f(u.uFade, s.fade);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, samples * 2, lines);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.0005, 0.05) : 1 / 60;\r
      last = now;\r
      if (s.paused) {\r
        state.intro = 1;\r
        render();\r
        last = 0;\r
        return;\r
      }\r
      if (!reduce) state.flow += dt * s.speed;\r
      if (!s.intro || reduce) state.intro = 1;\r
      else if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / INTRO_SECONDS);\r
      const awake = simulate(dt);\r
      render();\r
      const engaged = pointer.inside && s.mouseInteraction && Math.hypot(pointer.vx, pointer.vy) > 1;\r
      if (!reduce || awake || engaged || ripples.length || state.intro < 1) raf = requestAnimationFrame(frame);\r
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
      rebuild();\r
      render();\r
      wake();\r
    };\r
\r
    const place = (event: PointerEvent, snap: boolean) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      const inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      if (snap || (inside && !pointer.inside)) {\r
        pointer.sx = x;\r
        pointer.sy = y;\r
        pointer.vx = 0;\r
        pointer.vy = 0;\r
      }\r
      pointer.inside = inside;\r
      pointer.x = x;\r
      pointer.y = y;\r
      return { x, y, rect, inside };\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      place(event, false);\r
      if (!settingsRef.current.paused) wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      const { x, y, rect, inside } = place(event, event.pointerType !== 'mouse');\r
      if (inside && s.clickRipple && !s.paused && !reduce) {\r
        ripples.push({ x, y, age: 0, range: Math.max(360, Math.hypot(rect.width, rect.height) * 0.55) });\r
        if (ripples.length > 6) ripples.shift();\r
      }\r
      wake();\r
    };\r
\r
    const onPointerUp = (event: PointerEvent) => {\r
      if (event.pointerType !== 'mouse') pointer.inside = false;\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
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
      gl.deleteProgram(program.program);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteTexture(texture);\r
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
      className={\`waves\${className ? \` \${className}\` : ''}\`}\r
      style={{ backgroundColor, ...style }}\r
    >\r
      <canvas ref={canvasRef} className="waves__canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Waves;\r
`,o=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties } from 'react';\r
\r
export type WavesLineStyle = 'solid' | 'dashed';\r
\r
export interface WavesProps {\r
  lineColor?: string;\r
  accentColor?: string;\r
  backgroundColor?: string;\r
  lineStyle?: WavesLineStyle;\r
  spacing?: number;\r
  lineWidth?: number;\r
  rotation?: number;\r
  amplitude?: number;\r
  scale?: number;\r
  twist?: number;\r
  speed?: number;\r
  variation?: number;\r
  mouseInteraction?: boolean;\r
  mouseRadius?: number;\r
  mouseStrength?: number;\r
  bounce?: number;\r
  returnDuration?: number;\r
  clickRipple?: boolean;\r
  intro?: boolean;\r
  fade?: number;\r
  opacity?: number;\r
  lightMode?: boolean;\r
  paused?: boolean;\r
  dpr?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
type Settings = {\r
  lineColor: string;\r
  accentColor: string;\r
  lineStyle: number;\r
  spacing: number;\r
  lineWidth: number;\r
  rotation: number;\r
  amplitude: number;\r
  scale: number;\r
  twist: number;\r
  speed: number;\r
  variation: number;\r
  mouseInteraction: boolean;\r
  mouseRadius: number;\r
  mouseStrength: number;\r
  bounce: number;\r
  returnDuration: number;\r
  clickRipple: boolean;\r
  intro: boolean;\r
  fade: number;\r
  opacity: number;\r
  lightMode: boolean;\r
  paused: boolean;\r
  dpr?: number;\r
};\r
\r
type Ripple = { x: number; y: number; age: number; range: number };\r
\r
type Front = { x: number; y: number; front: number; power: number };\r
\r
type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };\r
\r
const STYLES: Record<string, number> = { solid: 0, dashed: 1 };\r
const CELL = 12;\r
const STEP = 4;\r
const INTRO_SECONDS = 2.2;\r
const RIPPLE_SPEED = 640;\r
const RIPPLE_WIDTH = 64;\r
const RIPPLE_IMPULSE = (RIPPLE_WIDTH * Math.sqrt(Math.PI / 2)) / RIPPLE_SPEED;\r
const MAX_VERTICES = 1600000;\r
\r
const VERTEX = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform vec2 uView;\r
uniform float uRatio;\r
uniform vec2 uAxis;\r
uniform float uSpacing;\r
uniform float uStep;\r
uniform vec2 uStart;\r
uniform float uAmplitude;\r
uniform vec2 uFrequency;\r
uniform vec2 uDrift;\r
uniform float uTwist;\r
uniform uint uSeed;\r
uniform sampler2D uField;\r
uniform ivec2 uFieldSize;\r
uniform float uCell;\r
uniform float uLimit;\r
uniform float uReach;\r
uniform float uReveal;\r
uniform float uBand;\r
out float vAcross;\r
out float vAlong;\r
out float vEnergy;\r
out float vShow;\r
out float vPhase;\r
\r
const vec2 GRADIENTS[12] = vec2[12](\r
  vec2(1.0, 1.0), vec2(-1.0, 1.0), vec2(1.0, -1.0), vec2(-1.0, -1.0),\r
  vec2(1.0, 0.0), vec2(-1.0, 0.0), vec2(1.0, 0.0), vec2(-1.0, 0.0),\r
  vec2(0.0, 1.0), vec2(0.0, -1.0), vec2(0.0, 1.0), vec2(0.0, -1.0)\r
);\r
\r
vec2 gradient(vec2 cell) {\r
  uvec2 q = uvec2(ivec2(cell) + 65536) + uvec2(uSeed * 7919u, uSeed * 104729u);\r
  q = 1103515245u * ((q >> 1u) ^ q.yx);\r
  uint n = 1103515245u * (q.x ^ (q.y >> 3u));\r
  return GRADIENTS[(n >> 16u) % 12u];\r
}\r
\r
float ease(float t) {\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
float perlin(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = p - i;\r
  float n00 = dot(gradient(i), f);\r
  float n10 = dot(gradient(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));\r
  float n01 = dot(gradient(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));\r
  float n11 = dot(gradient(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));\r
  vec2 u = vec2(ease(f.x), ease(f.y));\r
  return mix(mix(n00, n10, u.x), mix(n01, n11, u.x), u.y);\r
}\r
\r
vec2 node(ivec2 cell) {\r
  return texelFetch(uField, clamp(cell, ivec2(0), uFieldSize - 1), 0).xy;\r
}\r
\r
void weights(float f, out vec4 w, out vec4 d) {\r
  float g = 1.0 - f;\r
  float f2 = f * f;\r
  float f3 = f2 * f;\r
  w = vec4(g * g * g, 3.0 * f3 - 6.0 * f2 + 4.0, -3.0 * f3 + 3.0 * f2 + 3.0 * f + 1.0, f3) / 6.0;\r
  d = vec4(-g * g, 3.0 * f2 - 4.0 * f, -3.0 * f2 + 2.0 * f + 1.0, f2) * 0.5;\r
}\r
\r
vec2 field(vec2 point, out mat2 slope) {\r
  vec2 t = point / uCell;\r
  vec2 base = floor(t);\r
  vec2 f = t - base;\r
  vec4 wx;\r
  vec4 dx;\r
  vec4 wy;\r
  vec4 dy;\r
  weights(f.x, wx, dx);\r
  weights(f.y, wy, dy);\r
  ivec2 origin = ivec2(base) - 1;\r
  vec2 value = vec2(0.0);\r
  vec2 alongX = vec2(0.0);\r
  vec2 alongY = vec2(0.0);\r
  for (int j = 0; j < 4; j++) {\r
    vec2 row = vec2(0.0);\r
    vec2 rowSlope = vec2(0.0);\r
    for (int i = 0; i < 4; i++) {\r
      vec2 tap = node(origin + ivec2(i, j));\r
      row += tap * wx[i];\r
      rowSlope += tap * dx[i];\r
    }\r
    value += row * wy[j];\r
    alongX += rowSlope * wy[j];\r
    alongY += row * dy[j];\r
  }\r
  float size = length(value);\r
  float scale = size > 0.0001 ? uLimit * tanh(size / uLimit) / size : 1.0;\r
  slope = mat2(alongX, alongY) * (scale / uCell);\r
  return value * scale;\r
}\r
\r
vec2 wave(vec2 rest) {\r
  float turn = perlin(rest * uFrequency + uDrift) * 12.0 * uTwist;\r
  vec2 local = rest + vec2(cos(turn), sin(turn) * 0.5) * uAmplitude;\r
  return uView * 0.5 + vec2(local.x * uAxis.x - local.y * uAxis.y, local.x * uAxis.y + local.y * uAxis.x);\r
}\r
\r
void main() {\r
  int index = gl_VertexID >> 1;\r
  float side = float(gl_VertexID & 1) * 2.0 - 1.0;\r
  float u = uStart.x + float(gl_InstanceID) * uSpacing;\r
  float v = uStart.y + float(index) * uStep;\r
  vec2 flowing = wave(vec2(u, v));\r
  vec2 bend = wave(vec2(u, v + uStep)) - wave(vec2(u, v - uStep));\r
  mat2 slope;\r
  vec2 shift = field(flowing, slope);\r
  vec2 point = flowing + shift;\r
  float energy = length(shift);\r
  vec2 tangent = bend + slope * bend;\r
  float span = max(length(tangent), 0.0001);\r
  vec2 normal = vec2(-tangent.y, tangent.x) / span;\r
  vec2 corner = point + normal * side * uReach / uRatio;\r
  vAcross = side * uReach;\r
  vAlong = v;\r
  vEnergy = energy;\r
  vShow = clamp((uReveal - abs(u)) / uBand, 0.0, 1.0);\r
  uint line = uint(gl_InstanceID) * 747796405u + uSeed * 2891336453u + 1u;\r
  line = ((line >> ((line >> 28u) + 4u)) ^ line) * 277803737u;\r
  vPhase = float((line >> 22u) ^ line) / 4294967295.0;\r
  vec2 clip = corner / uView * 2.0 - 1.0;\r
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform vec2 uView;\r
uniform float uRatio;\r
uniform float uHalf;\r
uniform float uThin;\r
uniform int uStyle;\r
uniform float uPeriod;\r
uniform float uFlow;\r
uniform vec3 uColor;\r
uniform vec3 uAccent;\r
uniform float uBase;\r
uniform float uHeat;\r
uniform float uFade;\r
uniform float uOpacity;\r
in float vAcross;\r
in float vAlong;\r
in float vEnergy;\r
in float vShow;\r
in float vPhase;\r
out vec4 outColor;\r
\r
float smootherstep(float edge, float x) {\r
  float t = clamp(x / max(edge, 0.0001), 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  float coverage = clamp(uHalf + 0.5 - abs(vAcross), 0.0, 1.0) * uThin;\r
  if (uStyle == 1) {\r
    float phase = (vAlong + uFlow) / uPeriod + vPhase;\r
    float blur = max(fwidth(phase), 0.0001);\r
    coverage *= clamp((0.25 - abs(fract(phase) - 0.5)) / blur + 0.5, 0.0, 1.0);\r
  }\r
  float heat = smoothstep(0.0, uHeat, vEnergy);\r
  vec2 uv = gl_FragCoord.xy / (uView * uRatio);\r
  float edge = uFade * 0.5;\r
  float mask = smootherstep(edge, uv.x) * smootherstep(edge, 1.0 - uv.x) * smootherstep(edge, uv.y) * smootherstep(edge, 1.0 - uv.y);\r
  float alpha = coverage * mix(uBase, 1.0, heat) * mask * vShow * uOpacity;\r
  outColor = vec4(mix(uColor, uAccent, heat) * alpha, alpha);\r
}\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const smootherstep = (value: number) => {\r
  const t = clamp(value, 0, 1);\r
  return t * t * t * (t * (t * 6 - 15) + 10);\r
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
const link = (gl: WebGL2RenderingContext): Program | null => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
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
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
  for (let i = 0; i < count; i++) {\r
    const info = gl.getActiveUniform(program, i);\r
    if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const Waves = ({\r
  lineColor = '#ffffff',\r
  accentColor,\r
  backgroundColor = 'transparent',\r
  lineStyle = 'solid',\r
  spacing = 10,\r
  lineWidth = 1,\r
  rotation = 0,\r
  amplitude = 32,\r
  scale = 1,\r
  twist = 1,\r
  speed = 1,\r
  variation = 0,\r
  mouseInteraction = true,\r
  mouseRadius = 175,\r
  mouseStrength = 1,\r
  bounce = 0.5,\r
  returnDuration = 1.4,\r
  clickRipple = true,\r
  intro = true,\r
  fade = 0,\r
  opacity = 1,\r
  lightMode = false,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  style\r
}: WavesProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings: Settings = {\r
    lineColor: String(lineColor),\r
    accentColor: accentColor ? String(accentColor) : '',\r
    lineStyle: STYLES[lineStyle] ?? 0,\r
    spacing: Math.max(2, spacing),\r
    lineWidth: Math.max(0.25, lineWidth),\r
    rotation,\r
    amplitude: Math.max(0, amplitude),\r
    scale: Math.max(0.05, scale),\r
    twist: Math.max(0, twist),\r
    speed,\r
    variation: Math.max(0, Math.round(variation)),\r
    mouseInteraction,\r
    mouseRadius: Math.max(20, mouseRadius),\r
    mouseStrength: Math.max(0, mouseStrength),\r
    bounce: clamp(bounce, 0, 1),\r
    returnDuration: Math.max(0.2, returnDuration),\r
    clickRipple,\r
    intro,\r
    fade: clamp(fade, 0, 1),\r
    opacity: clamp(opacity, 0, 1),\r
    lightMode,\r
    paused,\r
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
    const program = link(gl);\r
    if (!program) return undefined;\r
    const u = program.uniforms;\r
\r
    const vao = gl.createVertexArray();\r
    const texture = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, texture);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const colors = new Map<string, number[]>();\r
    const parse = (value: string): number[] => {\r
      const cached = colors.get(value);\r
      if (cached) return cached;\r
      let rgb = [1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#ffffff';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      colors.set(value, rgb);\r
      return rgb;\r
    };\r
    const ink = (rgb: number[]): number[] => {\r
      const linear = rgb.map(v => Math.pow(v, 2.2));\r
      const tone = 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];\r
      const depth = Math.min(1, 0.045 / Math.max(tone, 0.0001));\r
      return linear.map(v => Math.pow(v * depth, 1 / 2.2));\r
    };\r
\r
    const view = { width: 1, height: 1, ratio: 1 };\r
    const grid = {\r
      cols: 0,\r
      rows: 0,\r
      shift: new Float32Array(0),\r
      speed: new Float32Array(0),\r
      top: 0,\r
      bottom: -1,\r
      left: 0,\r
      right: -1\r
    };\r
    const pointer = { x: 0, y: 0, sx: 0, sy: 0, vx: 0, vy: 0, inside: false };\r
    const ripples: Ripple[] = [];\r
    const state = { flow: 0, intro: settingsRef.current.intro && !reduce ? 0 : 1 };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const limitOf = (s: Settings) => Math.max(12, s.mouseRadius * 0.5);\r
\r
    const rebuild = () => {\r
      grid.cols = Math.ceil(view.width / CELL) + 2;\r
      grid.rows = Math.ceil(view.height / CELL) + 2;\r
      grid.shift = new Float32Array(grid.cols * grid.rows * 2);\r
      grid.speed = new Float32Array(grid.cols * grid.rows * 2);\r
      grid.top = 0;\r
      grid.bottom = -1;\r
      grid.left = 0;\r
      grid.right = -1;\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG32F, grid.cols, grid.rows, 0, gl.RG, gl.FLOAT, grid.shift);\r
    };\r
\r
    const include = (x0: number, y0: number, x1: number, y1: number) => {\r
      const c0 = clamp(Math.floor(x0 / CELL), 0, grid.cols - 1);\r
      const c1 = clamp(Math.ceil(x1 / CELL), 0, grid.cols - 1);\r
      const r0 = clamp(Math.floor(y0 / CELL), 0, grid.rows - 1);\r
      const r1 = clamp(Math.ceil(y1 / CELL), 0, grid.rows - 1);\r
      const empty = grid.bottom < grid.top;\r
      grid.top = empty ? r0 : Math.min(grid.top, r0);\r
      grid.bottom = empty ? r1 : Math.max(grid.bottom, r1);\r
      grid.left = empty ? c0 : Math.min(grid.left, c0);\r
      grid.right = empty ? c1 : Math.max(grid.right, c1);\r
    };\r
\r
    const simulate = (dt: number) => {\r
      const s = settingsRef.current;\r
      const follow = 1 - Math.exp(-dt / 0.045);\r
      const nx = pointer.sx + (pointer.x - pointer.sx) * follow;\r
      const ny = pointer.sy + (pointer.y - pointer.sy) * follow;\r
      const blend = 1 - Math.exp(-dt / 0.06);\r
      pointer.vx += ((nx - pointer.sx) / dt - pointer.vx) * blend;\r
      pointer.vy += ((ny - pointer.sy) / dt - pointer.vy) * blend;\r
      pointer.sx = nx;\r
      pointer.sy = ny;\r
\r
      const zeta = 1 - 0.85 * s.bounce;\r
      const omega = 4 / (zeta * s.returnDuration);\r
      const radius = s.mouseRadius;\r
      const speedNow = Math.hypot(pointer.vx, pointer.vy);\r
      const drive =\r
        s.mouseInteraction && pointer.inside && !reduce ? 26000 * Math.tanh(speedNow / 1400) * s.mouseStrength : 0;\r
      if (drive > 1) include(pointer.sx - radius, pointer.sy - radius, pointer.sx + radius, pointer.sy + radius);\r
\r
      const live: Front[] = [];\r
      for (let i = ripples.length - 1; i >= 0; i--) {\r
        const ripple = ripples[i];\r
        ripple.age += dt;\r
        const front = ripple.age * RIPPLE_SPEED;\r
        const life = 1 - front / ripple.range;\r
        if (life <= 0) {\r
          ripples.splice(i, 1);\r
          continue;\r
        }\r
        const reach = front + RIPPLE_WIDTH * 3;\r
        include(ripple.x - reach, ripple.y - reach, ripple.x + reach, ripple.y + reach);\r
        live.push({\r
          x: ripple.x,\r
          y: ripple.y,\r
          front,\r
          power: (150 * omega * life * Math.sqrt(life)) / RIPPLE_IMPULSE\r
        });\r
      }\r
\r
      if (grid.bottom < grid.top) return false;\r
\r
      const stiffness = omega * omega;\r
      const damping = 2 * zeta * omega;\r
      const steps = Math.min(16, Math.max(1, Math.ceil(dt / Math.min(1 / 120, 0.6 / omega))));\r
      const h = dt / steps;\r
      const dirX = speedNow > 0.001 ? pointer.vx / speedNow : 0;\r
      const dirY = speedNow > 0.001 ? pointer.vy / speedNow : 0;\r
      const { cols, shift, speed: velocity, left, right } = grid;\r
      let peak = 0;\r
\r
      for (let row = grid.top; row <= grid.bottom; row++) {\r
        const y = row * CELL;\r
        for (let col = left; col <= right; col++) {\r
          const x = col * CELL;\r
          const index = (row * cols + col) * 2;\r
          let ax = 0;\r
          let ay = 0;\r
          if (drive > 1) {\r
            const distance = Math.hypot(x - pointer.sx, y - pointer.sy);\r
            if (distance < radius) {\r
              const weight = smootherstep(1 - distance / radius) * drive;\r
              ax += dirX * weight;\r
              ay += dirY * weight;\r
            }\r
          }\r
          for (const ripple of live) {\r
            const ex = x - ripple.x;\r
            const ey = y - ripple.y;\r
            const distance = Math.hypot(ex, ey);\r
            const offset = (distance - ripple.front) / RIPPLE_WIDTH;\r
            if (distance > 0.001 && Math.abs(offset) < 3) {\r
              const push = ripple.power * Math.exp(-offset * offset * 2) * smootherstep(distance / 56);\r
              ax += (ex / distance) * push;\r
              ay += (ey / distance) * push;\r
            }\r
          }\r
          let px = shift[index];\r
          let py = shift[index + 1];\r
          let vx = velocity[index];\r
          let vy = velocity[index + 1];\r
          for (let k = 0; k < steps; k++) {\r
            vx += (ax - stiffness * px - damping * vx) * h;\r
            vy += (ay - stiffness * py - damping * vy) * h;\r
            px += vx * h;\r
            py += vy * h;\r
          }\r
          shift[index] = px;\r
          shift[index + 1] = py;\r
          velocity[index] = vx;\r
          velocity[index + 1] = vy;\r
          peak = Math.max(peak, Math.abs(px) + Math.abs(py) + (Math.abs(vx) + Math.abs(vy)) * 0.05);\r
        }\r
      }\r
\r
      const top = grid.top;\r
      const height = grid.bottom - grid.top + 1;\r
      if (peak < 0.02 && drive <= 1 && !live.length) {\r
        for (let row = grid.top; row <= grid.bottom; row++) {\r
          shift.fill(0, (row * cols + left) * 2, (row * cols + right + 1) * 2);\r
          velocity.fill(0, (row * cols + left) * 2, (row * cols + right + 1) * 2);\r
        }\r
        grid.top = 0;\r
        grid.bottom = -1;\r
      }\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texSubImage2D(\r
        gl.TEXTURE_2D,\r
        0,\r
        0,\r
        top,\r
        cols,\r
        height,\r
        gl.RG,\r
        gl.FLOAT,\r
        shift.subarray(top * cols * 2, (top + height) * cols * 2)\r
      );\r
      return grid.bottom >= grid.top;\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const angle = (s.rotation * Math.PI) / 180;\r
      const cos = Math.cos(angle);\r
      const sin = Math.sin(angle);\r
      const limit = limitOf(s);\r
      const margin = s.amplitude * 1.1 + limit + s.spacing * 2 + 8;\r
      const reachU = (view.width * Math.abs(cos) + view.height * Math.abs(sin)) / 2 + margin;\r
      const reachV = (view.width * Math.abs(sin) + view.height * Math.abs(cos)) / 2 + margin;\r
      const half = Math.ceil(reachU / s.spacing);\r
      const lines = half * 2 + 1;\r
      let step = STEP;\r
      let samples = Math.ceil((reachV * 2) / step) + 1;\r
      if (lines * samples * 2 > MAX_VERTICES) {\r
        samples = Math.max(16, Math.floor(MAX_VERTICES / (lines * 2)));\r
        step = (reachV * 2) / (samples - 1);\r
      }\r
      const width = s.lineWidth * view.ratio;\r
      const halfWidth = Math.max(0.5, width / 2);\r
      const reach = halfWidth + 1;\r
      const progress = state.intro;\r
      const reveal = s.intro && !reduce ? (1 - Math.pow(1 - clamp(progress / 0.7, 0, 1), 3)) * reachU * 1.3 : 1e6;\r
      const swell = s.intro && !reduce ? smootherstep((progress - 0.1) / 0.9) : 1;\r
      const base = parse(s.lineColor);\r
      const tone = s.lightMode ? ink(base) : base;\r
      const accent = s.accentColor ? parse(s.accentColor) : tone;\r
      const flowTime = state.flow + s.variation * 37.1;\r
\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      gl.useProgram(program.program);\r
      gl.bindVertexArray(vao);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.uniform1i(u.uField, 0);\r
      gl.uniform2f(u.uView, view.width, view.height);\r
      gl.uniform1f(u.uRatio, view.ratio);\r
      gl.uniform2f(u.uAxis, cos, sin);\r
      gl.uniform1f(u.uSpacing, s.spacing);\r
      gl.uniform1f(u.uStep, step);\r
      gl.uniform2f(u.uStart, -half * s.spacing, -reachV);\r
      gl.uniform1f(u.uAmplitude, s.amplitude * swell);\r
      gl.uniform2f(u.uFrequency, 0.002 / s.scale, 0.0015 / s.scale);\r
      gl.uniform2f(u.uDrift, flowTime * 0.025, flowTime * 0.0075);\r
      gl.uniform1f(u.uTwist, s.twist);\r
      gl.uniform1ui(u.uSeed, s.variation);\r
      gl.uniform2i(u.uFieldSize, grid.cols, grid.rows);\r
      gl.uniform1f(u.uCell, CELL);\r
      gl.uniform1f(u.uLimit, limit);\r
      gl.uniform1f(u.uReach, reach);\r
      gl.uniform1f(u.uReveal, reveal);\r
      gl.uniform1f(u.uBand, Math.max(1, reachU * 0.3));\r
      gl.uniform1f(u.uHalf, halfWidth);\r
      gl.uniform1f(u.uThin, Math.min(1, width));\r
      gl.uniform1i(u.uStyle, s.lineStyle);\r
      gl.uniform1f(u.uPeriod, s.spacing * 2.6);\r
      gl.uniform1f(u.uFlow, (state.flow * 16) % (s.spacing * 2.6));\r
      gl.uniform3fv(u.uColor, tone);\r
      gl.uniform3fv(u.uAccent, accent);\r
      gl.uniform1f(u.uBase, 0.62);\r
      gl.uniform1f(u.uHeat, limit * 0.55);\r
      gl.uniform1f(u.uFade, s.fade);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, samples * 2, lines);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.0005, 0.05) : 1 / 60;\r
      last = now;\r
      if (s.paused) {\r
        state.intro = 1;\r
        render();\r
        last = 0;\r
        return;\r
      }\r
      if (!reduce) state.flow += dt * s.speed;\r
      if (!s.intro || reduce) state.intro = 1;\r
      else if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / INTRO_SECONDS);\r
      const awake = simulate(dt);\r
      render();\r
      const engaged = pointer.inside && s.mouseInteraction && Math.hypot(pointer.vx, pointer.vy) > 1;\r
      if (!reduce || awake || engaged || ripples.length || state.intro < 1) raf = requestAnimationFrame(frame);\r
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
      rebuild();\r
      render();\r
      wake();\r
    };\r
\r
    const place = (event: PointerEvent, snap: boolean) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      const inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      if (snap || (inside && !pointer.inside)) {\r
        pointer.sx = x;\r
        pointer.sy = y;\r
        pointer.vx = 0;\r
        pointer.vy = 0;\r
      }\r
      pointer.inside = inside;\r
      pointer.x = x;\r
      pointer.y = y;\r
      return { x, y, rect, inside };\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      place(event, false);\r
      if (!settingsRef.current.paused) wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      const { x, y, rect, inside } = place(event, event.pointerType !== 'mouse');\r
      if (inside && s.clickRipple && !s.paused && !reduce) {\r
        ripples.push({ x, y, age: 0, range: Math.max(360, Math.hypot(rect.width, rect.height) * 0.55) });\r
        if (ripples.length > 6) ripples.shift();\r
      }\r
      wake();\r
    };\r
\r
    const onPointerUp = (event: PointerEvent) => {\r
      if (event.pointerType !== 'mouse') pointer.inside = false;\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
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
      gl.deleteProgram(program.program);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteTexture(texture);\r
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
      className={['absolute inset-0 overflow-hidden', className].filter(Boolean).join(' ')}\r
      style={{ backgroundColor, ...style }}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Waves;\r
`,i={usage:`import Waves from './Waves';

<div style={{ position: 'relative', width: '100%', height: '600px' }}>
  <Waves
    lineColor="#ffffff"
    spacing={10}
    amplitude={32}
    twist={1}
    speed={1}
    mouseRadius={175}
    mouseStrength={1}
  />
</div>`,code:n,css:r,tailwind:e,tsCode:t,tsTailwind:o};export{i as waves};
