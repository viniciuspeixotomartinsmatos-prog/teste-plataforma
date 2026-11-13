const r=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
import './SwarmCursor.css';\r
\r
const MAX_PARTICLES = 2000;\r
const INTRO_SECONDS = 1.4;\r
const HIDDEN = 'swarm-cursor-hidden';\r
const SHAPES = { dot: 0, square: 1, streak: 2 };\r
const CELL = 16;\r
const MAX_COLS = 72;\r
const MAX_ROWS = 48;\r
const PRESSURE_STEPS = 12;\r
\r
const VERTEX = \`#version 300 es\r
layout(location = 0) in vec2 aCorner;\r
layout(location = 1) in vec4 aAgent;\r
layout(location = 2) in vec4 aLook;\r
layout(location = 3) in vec2 aExtra;\r
uniform vec2 uView;\r
out vec2 vLocal;\r
out vec2 vHalf;\r
out float vAlpha;\r
out float vTint;\r
out float vSoft;\r
out float vShape;\r
\r
void main() {\r
  vec2 dir = aAgent.zw;\r
  vec2 side = vec2(-dir.y, dir.x);\r
  vec2 extent = aLook.xy * 0.5;\r
  vec2 pad = extent + 1.0 + aExtra.x * 1.5;\r
  vec2 local = aCorner * pad;\r
  vec2 center = aAgent.xy - dir * (extent.x - extent.y);\r
  vec2 pos = center + dir * local.x + side * local.y;\r
  vLocal = local;\r
  vHalf = extent;\r
  vAlpha = aLook.z;\r
  vTint = aLook.w;\r
  vSoft = aExtra.x;\r
  vShape = aExtra.y;\r
  vec2 clip = pos / uView * 2.0 - 1.0;\r
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform vec3 uColor;\r
uniform vec3 uAccent;\r
uniform float uRatio;\r
in vec2 vLocal;\r
in vec2 vHalf;\r
in float vAlpha;\r
in float vTint;\r
in float vSoft;\r
in float vShape;\r
out vec4 outColor;\r
\r
void main() {\r
  float d;\r
  if (vShape > 0.5 && vShape < 1.5) {\r
    float corner = vHalf.y * 0.3;\r
    vec2 q = abs(vLocal) - vHalf + corner;\r
    d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - corner;\r
  } else {\r
    vec2 q = vLocal;\r
    q.x = max(abs(q.x) - (vHalf.x - vHalf.y), 0.0);\r
    d = length(q) - vHalf.y;\r
  }\r
  float edge = 0.6 / uRatio + vSoft;\r
  float cover = 1.0 - smoothstep(-edge, edge, d);\r
  float stretch = clamp(1.0 - vHalf.y / max(vHalf.x, 0.001), 0.0, 1.0);\r
  float head = clamp((vLocal.x + vHalf.x) / max(2.0 * vHalf.x, 0.001), 0.0, 1.0);\r
  cover *= mix(1.0, 0.12 + 0.88 * head * head, stretch);\r
  float alpha = cover * vAlpha;\r
  outColor = vec4(mix(uColor, uAccent, vTint) * alpha, alpha);\r
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
const random = seed => {\r
  let state = seed >>> 0 || 1;\r
  return () => {\r
    state ^= state << 13;\r
    state ^= state >>> 17;\r
    state ^= state << 5;\r
    return (state >>> 0) / 4294967296;\r
  };\r
};\r
\r
const rectField = (x, y, hx, hy, r, out) => {\r
  const sx = x < 0 ? -1 : 1;\r
  const sy = y < 0 ? -1 : 1;\r
  const qx = Math.abs(x) - (hx - r);\r
  const qy = Math.abs(y) - (hy - r);\r
  if (qx > 0 && qy > 0) {\r
    const l = Math.hypot(qx, qy) || 1;\r
    out[0] = l - r;\r
    out[1] = (qx / l) * sx;\r
    out[2] = (qy / l) * sy;\r
  } else if (qx > qy) {\r
    out[0] = qx - r;\r
    out[1] = sx;\r
    out[2] = 0;\r
  } else {\r
    out[0] = qy - r;\r
    out[1] = 0;\r
    out[2] = sy;\r
  }\r
  return out;\r
};\r
\r
const SwarmCursor = ({\r
  count = 800,\r
  size = 2.6,\r
  shape = 'dot',\r
  color,\r
  accentColor,\r
  spread = 90,\r
  speed = 1,\r
  swirl = 0.6,\r
  tail = 0.5,\r
  trail = 0.6,\r
  wander = 0.5,\r
  depth = 0.7,\r
  targets = 'a, button, [data-swarm-target]',\r
  idle = 'roam',\r
  clickEffect = 'burst',\r
  hideCursor = false,\r
  intro = true,\r
  enabled = true,\r
  lightMode = false,\r
  dpr,\r
  children,\r
  className = '',\r
  style,\r
  ...rest\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const ink = lightMode ? '#18181b' : '#ffffff';\r
  const settings = {\r
    count: Math.round(clamp(count, 1, MAX_PARTICLES)),\r
    size: clamp(size, 0.5, 16),\r
    shape: SHAPES[shape] ?? 0,\r
    color: color || ink,\r
    accentColor: accentColor || color || ink,\r
    spread: clamp(spread, 20, 400),\r
    speed: clamp(speed, 0, 4),\r
    swirl: clamp(swirl, 0, 1),\r
    tail: clamp(tail, 0, 1),\r
    trail: clamp(trail, 0, 3),\r
    wander: clamp(wander, 0, 2),\r
    depth: clamp(depth, 0, 1),\r
    targets,\r
    idle,\r
    clickEffect,\r
    hideCursor,\r
    intro,\r
    enabled,\r
    lightMode,\r
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
    const shader = link(gl);\r
    if (!shader) return undefined;\r
    const u = shader.uniforms;\r
\r
    const slots = MAX_PARTICLES + 1;\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    const cornerBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    const agentData = new Float32Array(slots * 4);\r
    const lookData = new Float32Array(slots * 4);\r
    const extraData = new Float32Array(slots * 2);\r
    const instanced = (location, width, data) => {\r
      const buffer = gl.createBuffer();\r
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, data.byteLength, gl.DYNAMIC_DRAW);\r
      gl.enableVertexAttribArray(location);\r
      gl.vertexAttribPointer(location, width, gl.FLOAT, false, 0, 0);\r
      gl.vertexAttribDivisor(location, 1);\r
      return buffer;\r
    };\r
    const agentBuffer = instanced(1, 4, agentData);\r
    const lookBuffer = instanced(2, 4, lookData);\r
    const extraBuffer = instanced(3, 2, extraData);\r
    gl.bindVertexArray(null);\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const colorCache = new Map();\r
    const parse = value => {\r
      const key = String(value);\r
      const cached = colorCache.get(key);\r
      if (cached) return cached;\r
      let rgb = [1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#000000';\r
        probe.fillStyle = key;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      colorCache.set(key, rgb);\r
      return rgb;\r
    };\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1, ratio: 1 };\r
    const px = new Float32Array(MAX_PARTICLES);\r
    const py = new Float32Array(MAX_PARTICLES);\r
    const pz = new Float32Array(MAX_PARTICLES);\r
    const vx = new Float32Array(MAX_PARTICLES);\r
    const vy = new Float32Array(MAX_PARTICLES);\r
    const vz = new Float32Array(MAX_PARTICLES);\r
    const home = new Float32Array(MAX_PARTICLES);\r
    const heft = new Float32Array(MAX_PARTICLES);\r
    const bob = new Float32Array(MAX_PARTICLES);\r
    const bobRate = new Float32Array(MAX_PARTICLES);\r
    const grain = new Float32Array(MAX_PARTICLES);\r
    const glint = new Float32Array(MAX_PARTICLES);\r
    const order = new Int32Array(MAX_PARTICLES);\r
    const field = [0, 0, 0];\r
    let cols = 1;\r
    let rows = 1;\r
    let cell = CELL;\r
    let flowX = new Float32Array(1);\r
    let flowY = new Float32Array(1);\r
    let lastX = new Float32Array(1);\r
    let lastY = new Float32Array(1);\r
    let pressure = new Float32Array(1);\r
    let divergence = new Float32Array(1);\r
    let curl = new Float32Array(1);\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const anchor = { x: 0, y: 0, lastX: 0, lastY: 0, moveX: 0, moveY: 0 };\r
    const ring = { active: false, x: 0, y: 0, hx: 0, hy: 0, corner: 0, spin: 1 };\r
    const burst = { age: 10 };\r
    const ping = { age: 10, x: 0, y: 0 };\r
    let hovered = null;\r
    let time = 0;\r
    let presence = 1;\r
    let introClock = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let seeded = false;\r
    let hidden = false;\r
    let sorted = 0;\r
\r
    const setHidden = value => {\r
      if (value === hidden) return;\r
      hidden = value;\r
      container.classList.toggle(HIDDEN, value);\r
    };\r
\r
    const allocate = () => {\r
      const nextCols = clamp(Math.round(view.width / CELL), 8, MAX_COLS);\r
      const nextRows = clamp(Math.round(view.height / CELL), 8, MAX_ROWS);\r
      cell = Math.max(view.width / nextCols, view.height / nextRows);\r
      if (nextCols === cols && nextRows === rows) return;\r
      cols = nextCols;\r
      rows = nextRows;\r
      const total = cols * rows;\r
      flowX = new Float32Array(total);\r
      flowY = new Float32Array(total);\r
      lastX = new Float32Array(total);\r
      lastY = new Float32Array(total);\r
      pressure = new Float32Array(total);\r
      divergence = new Float32Array(total);\r
      curl = new Float32Array(total);\r
    };\r
\r
    const sample = (values, x, y) => {\r
      let gx = x / cell - 0.5;\r
      let gy = y / cell - 0.5;\r
      if (gx < 0) gx = 0;\r
      else if (gx > cols - 1.001) gx = cols - 1.001;\r
      if (gy < 0) gy = 0;\r
      else if (gy > rows - 1.001) gy = rows - 1.001;\r
      const i = gx | 0;\r
      const j = gy | 0;\r
      const fx = gx - i;\r
      const fy = gy - j;\r
      const k = i + j * cols;\r
      return (\r
        (values[k] * (1 - fx) + values[k + 1] * fx) * (1 - fy) +\r
        (values[k + cols] * (1 - fx) + values[k + cols + 1] * fx) * fy\r
      );\r
    };\r
\r
    const walls = (values, axis) => {\r
      for (let j = 1; j < rows - 1; j++) {\r
        const left = j * cols;\r
        const right = left + cols - 1;\r
        values[left] = axis === 1 ? -values[left + 1] : values[left + 1];\r
        values[right] = axis === 1 ? -values[right - 1] : values[right - 1];\r
      }\r
      for (let i = 1; i < cols - 1; i++) {\r
        const bottom = i + (rows - 1) * cols;\r
        values[i] = axis === 2 ? -values[i + cols] : values[i + cols];\r
        values[bottom] = axis === 2 ? -values[bottom - cols] : values[bottom - cols];\r
      }\r
      values[0] = 0.5 * (values[1] + values[cols]);\r
      values[cols - 1] = 0.5 * (values[cols - 2] + values[2 * cols - 1]);\r
      values[(rows - 1) * cols] = 0.5 * (values[(rows - 2) * cols] + values[(rows - 1) * cols + 1]);\r
      values[rows * cols - 1] = 0.5 * (values[rows * cols - 2] + values[(rows - 1) * cols - 1]);\r
    };\r
\r
    const stir = (s, dt, ease) => {\r
      const radius = s.spread;\r
      const reach = radius * 2.2;\r
      const i0 = Math.max(1, Math.floor((anchor.x - reach) / cell));\r
      const i1 = Math.min(cols - 2, Math.ceil((anchor.x + reach) / cell));\r
      const j0 = Math.max(1, Math.floor((anchor.y - reach) / cell));\r
      const j1 = Math.min(rows - 2, Math.ceil((anchor.y + reach) / cell));\r
      const inv = 1 / (radius * radius * 0.55);\r
      const moving = Math.hypot(anchor.moveX, anchor.moveY);\r
      const grab = (1 - Math.exp(-dt * 20)) * clamp(moving / 240, 0, 1) * presence;\r
      const whirl = ring.active ? 0 : radius * (0.5 + 4 * (1 - ease)) * (0.35 + 0.65 * s.speed);\r
      const churn = s.wander * radius * 14 * (0.4 + 0.6 * s.speed);\r
      const fk = 1.4 / radius;\r
      const ft = time * 0.75 * (0.4 + 0.6 * s.speed);\r
      for (let j = j0; j <= j1; j++) {\r
        for (let i = i0; i <= i1; i++) {\r
          const k = i + j * cols;\r
          const x = (i + 0.5) * cell;\r
          const y = (j + 0.5) * cell;\r
          const rx = x - anchor.x;\r
          const ry = y - anchor.y;\r
          const d2 = rx * rx + ry * ry;\r
          const w = Math.exp(-d2 * inv);\r
          if (w < 0.003) continue;\r
          const d = Math.sqrt(d2) + 0.001;\r
          flowX[k] += (anchor.moveX - flowX[k]) * w * grab;\r
          flowY[k] += (anchor.moveY - flowY[k]) * w * grab;\r
          const reachOut = Math.min(1, d / (radius * 0.45));\r
          flowX[k] += (-ry / d) * whirl * reachOut * w * dt;\r
          flowY[k] += (rx / d) * whirl * reachOut * w * dt;\r
          const a1 = x * fk + ft;\r
          const b1 = y * fk * 1.1 - ft * 0.8;\r
          const a2 = y * fk * 1.7 + ft * 1.2 + 1.3;\r
          const b2 = x * fk * 1.3 - 0.7;\r
          const curlX = -Math.sin(a1) * Math.sin(b1) * 1.1 + 1.02 * Math.cos(a2) * Math.cos(b2);\r
          const curlY = -(Math.cos(a1) * Math.cos(b1) - 0.78 * Math.sin(a2) * Math.sin(b2));\r
          flowX[k] += curlX * churn * w * dt;\r
          flowY[k] += curlY * churn * w * dt;\r
        }\r
      }\r
      if (!ring.active) return;\r
      const band = Math.max(4, radius * 0.16);\r
      const margin = band + 24;\r
      const circulate = 230 * (0.4 + 0.6 * s.speed) * ring.spin;\r
      const r0 = Math.max(1, Math.floor((ring.x - ring.hx - margin) / cell));\r
      const r1 = Math.min(cols - 2, Math.ceil((ring.x + ring.hx + margin) / cell));\r
      const c0 = Math.max(1, Math.floor((ring.y - ring.hy - margin) / cell));\r
      const c1 = Math.min(rows - 2, Math.ceil((ring.y + ring.hy + margin) / cell));\r
      const rate = 1 - Math.exp(-dt * 6);\r
      for (let j = c0; j <= c1; j++) {\r
        for (let i = r0; i <= r1; i++) {\r
          const k = i + j * cols;\r
          rectField((i + 0.5) * cell - ring.x, (j + 0.5) * cell - ring.y, ring.hx, ring.hy, ring.corner, field);\r
          const off = field[0] - (5 + band * 0.5);\r
          const w = Math.exp(-(off * off) / (margin * margin * 0.35));\r
          if (w < 0.01) continue;\r
          flowX[k] += (-field[2] * circulate - flowX[k]) * w * rate;\r
          flowY[k] += (field[1] * circulate - flowY[k]) * w * rate;\r
        }\r
      }\r
    };\r
\r
    const flow = (s, dt) => {\r
      const total = cols * rows;\r
      for (let j = 1; j < rows - 1; j++) {\r
        for (let i = 1; i < cols - 1; i++) {\r
          const k = i + j * cols;\r
          curl[k] = (flowY[k + 1] - flowY[k - 1] - flowX[k + cols] + flowX[k - cols]) * (0.5 / cell);\r
        }\r
      }\r
      const confine = s.swirl * cell * 9;\r
      for (let j = 2; j < rows - 2; j++) {\r
        for (let i = 2; i < cols - 2; i++) {\r
          const k = i + j * cols;\r
          const gx = Math.abs(curl[k + 1]) - Math.abs(curl[k - 1]);\r
          const gy = Math.abs(curl[k + cols]) - Math.abs(curl[k - cols]);\r
          const len = Math.hypot(gx, gy) + 1e-5;\r
          flowX[k] += (gy / len) * curl[k] * confine * dt;\r
          flowY[k] -= (gx / len) * curl[k] * confine * dt;\r
        }\r
      }\r
      lastX.set(flowX);\r
      lastY.set(flowY);\r
      const back = dt / cell;\r
      const fade = Math.exp(-dt / (0.35 + 1.5 * s.swirl));\r
      for (let j = 1; j < rows - 1; j++) {\r
        for (let i = 1; i < cols - 1; i++) {\r
          const k = i + j * cols;\r
          let x = i - back * lastX[k];\r
          let y = j - back * lastY[k];\r
          if (x < 0.5) x = 0.5;\r
          else if (x > cols - 1.5) x = cols - 1.5;\r
          if (y < 0.5) y = 0.5;\r
          else if (y > rows - 1.5) y = rows - 1.5;\r
          const i0 = x | 0;\r
          const j0 = y | 0;\r
          const fx = x - i0;\r
          const fy = y - j0;\r
          const a = i0 + j0 * cols;\r
          flowX[k] =\r
            ((lastX[a] * (1 - fx) + lastX[a + 1] * fx) * (1 - fy) +\r
              (lastX[a + cols] * (1 - fx) + lastX[a + cols + 1] * fx) * fy) *\r
            fade;\r
          flowY[k] =\r
            ((lastY[a] * (1 - fx) + lastY[a + 1] * fx) * (1 - fy) +\r
              (lastY[a + cols] * (1 - fx) + lastY[a + cols + 1] * fx) * fy) *\r
            fade;\r
        }\r
      }\r
      walls(flowX, 1);\r
      walls(flowY, 2);\r
      const h2 = cell * cell;\r
      for (let j = 1; j < rows - 1; j++) {\r
        for (let i = 1; i < cols - 1; i++) {\r
          const k = i + j * cols;\r
          divergence[k] = (flowX[k + 1] - flowX[k - 1] + flowY[k + cols] - flowY[k - cols]) * (0.5 / cell);\r
        }\r
      }\r
      pressure.fill(0, 0, total);\r
      walls(divergence, 0);\r
      for (let step = 0; step < PRESSURE_STEPS; step++) {\r
        for (let j = 1; j < rows - 1; j++) {\r
          for (let i = 1; i < cols - 1; i++) {\r
            const k = i + j * cols;\r
            pressure[k] =\r
              (pressure[k - 1] + pressure[k + 1] + pressure[k - cols] + pressure[k + cols] - h2 * divergence[k]) * 0.25;\r
          }\r
        }\r
        walls(pressure, 0);\r
      }\r
      for (let j = 1; j < rows - 1; j++) {\r
        for (let i = 1; i < cols - 1; i++) {\r
          const k = i + j * cols;\r
          flowX[k] -= (pressure[k + 1] - pressure[k - 1]) * (0.5 / cell);\r
          flowY[k] -= (pressure[k + cols] - pressure[k - cols]) * (0.5 / cell);\r
        }\r
      }\r
      walls(flowX, 1);\r
      walls(flowY, 2);\r
    };\r
\r
    const crowd = new Int32Array(MAX_PARTICLES);\r
    let crowdHeads = new Int32Array(1);\r
    let crowdRows = 1;\r
    const push = (n, h) => {\r
      const gc = Math.max(1, Math.ceil(view.width / h) + 2);\r
      const gr = Math.max(1, Math.ceil(view.height / h) + 2);\r
      if (crowdHeads.length < gc * gr) crowdHeads = new Int32Array(gc * gr);\r
      crowdHeads.fill(-1, 0, gc * gr);\r
      crowdRows = gr;\r
      for (let i = 0; i < n; i++) {\r
        const cx = clamp(Math.floor(px[i] / h) + 1, 0, gc - 1);\r
        const cy = clamp(Math.floor(py[i] / h) + 1, 0, gr - 1);\r
        const key = cy * gc + cx;\r
        crowd[i] = crowdHeads[key];\r
        crowdHeads[key] = i;\r
      }\r
      return gc;\r
    };\r
\r
    const move = (s, dt, ease) => {\r
      const n = s.count;\r
      const radius = s.spread;\r
      const loose = 1 - 0.6 * s.tail;\r
      const gather = 12 * loose * (0.2 + 0.8 * ease);\r
      const pull = 30 * loose * (0.2 + 0.8 * ease);\r
      const band = Math.max(4, radius * 0.16);\r
      const w = view.width;\r
      const h = view.height;\r
      const gap = radius * Math.sqrt(Math.PI / Math.max(n, 1)) * 1.6;\r
      const repel = 4000;\r
      const gc = push(n, gap);\r
      for (let i = 0; i < n; i++) {\r
        const x = px[i];\r
        const y = py[i];\r
        const k = 10 * (1 - 0.6 * s.tail * heft[i]);\r
        let ax = (sample(flowX, x, y) - vx[i]) * k;\r
        let ay = (sample(flowY, x, y) - vy[i]) * k;\r
        const cx = clamp(Math.floor(x / gap) + 1, 0, gc - 1);\r
        const cy = clamp(Math.floor(y / gap) + 1, 0, crowdRows - 1);\r
        for (let oy = -1; oy <= 1; oy++) {\r
          const row = cy + oy;\r
          if (row < 0 || row >= crowdRows) continue;\r
          for (let ox = -1; ox <= 1; ox++) {\r
            const col = cx + ox;\r
            if (col < 0 || col >= gc) continue;\r
            for (let j = crowdHeads[row * gc + col]; j !== -1; j = crowd[j]) {\r
              if (j === i) continue;\r
              const dx = x - px[j];\r
              const dy = y - py[j];\r
              const d2 = dx * dx + dy * dy;\r
              if (d2 >= gap * gap || d2 < 1e-6) continue;\r
              const d = Math.sqrt(d2);\r
              const q = 1 - d / gap;\r
              ax += (dx / d) * q * q * repel;\r
              ay += (dy / d) * q * q * repel;\r
            }\r
          }\r
        }\r
        if (ring.active) {\r
          rectField(x - ring.x, y - ring.y, ring.hx, ring.hy, ring.corner, field);\r
          const e = field[0] - (5 + band * home[i] * home[i]);\r
          const hold = e > 0 ? 70 : 140;\r
          ax -= field[1] * e * hold;\r
          ay -= field[2] * e * hold;\r
        } else {\r
          const dx = anchor.x - x;\r
          const dy = anchor.y - y;\r
          const d = Math.hypot(dx, dy) + 0.001;\r
          const over = Math.max(0, d - radius);\r
          ax += (dx / d) * (d * gather + over * pull);\r
          ay += (dy / d) * (d * gather + over * pull);\r
        }\r
        if (introClock >= 1) {\r
          if (x < 8) ax += (8 - x) * 30;\r
          else if (x > w - 8) ax -= (x - w + 8) * 30;\r
          if (y < 8) ay += (8 - y) * 30;\r
          else if (y > h - 8) ay -= (y - h + 8) * 30;\r
        }\r
        const lift = Math.sin(time * bobRate[i] + bob[i]) * radius * (ring.active ? 0.15 : 0.55);\r
        const az = (lift - pz[i]) * 36 - vz[i] * 9;\r
        vx[i] += ax * dt;\r
        vy[i] += ay * dt;\r
        vz[i] += az * dt;\r
        px[i] += vx[i] * dt;\r
        py[i] += vy[i] * dt;\r
        pz[i] += vz[i] * dt;\r
      }\r
    };\r
\r
    const seed = () => {\r
      const rand = random(7);\r
      for (let i = 0; i < MAX_PARTICLES; i++) {\r
        home[i] = 0.08 + 0.92 * Math.sqrt(rand());\r
        heft[i] = rand() * rand();\r
        bob[i] = rand() * Math.PI * 2;\r
        bobRate[i] = 0.5 + rand() * 1.1;\r
        grain[i] = 0.55 + rand() * 0.9;\r
        glint[i] = rand() * 100;\r
      }\r
      seeded = true;\r
    };\r
\r
    const place = gathered => {\r
      const s = settingsRef.current;\r
      const rand = random(11);\r
      const reachOut = Math.hypot(view.width, view.height) * 0.5;\r
      for (let i = 0; i < MAX_PARTICLES; i++) {\r
        const a = rand() * Math.PI * 2;\r
        const r = gathered ? home[i] * s.spread : (0.35 + 0.65 * Math.sqrt(rand())) * reachOut;\r
        px[i] = anchor.x + Math.cos(a) * r;\r
        py[i] = anchor.y + Math.sin(a) * r;\r
        pz[i] = Math.sin(bob[i]) * s.spread * 0.55;\r
        vx[i] = 0;\r
        vy[i] = 0;\r
        vz[i] = 0;\r
      }\r
    };\r
\r
    const findTarget = () => {\r
      const s = settingsRef.current;\r
      if (!s.targets || !pointer.inside) return null;\r
      const rect = container.getBoundingClientRect();\r
      const element = document.elementFromPoint(rect.left + pointer.x, rect.top + pointer.y);\r
      if (!element || !container.contains(element)) return null;\r
      let match = null;\r
      try {\r
        match = element.closest(s.targets);\r
      } catch {\r
        match = null;\r
      }\r
      return match && container.contains(match) ? match : null;\r
    };\r
\r
    const updateAnchor = (s, dt) => {\r
      const w = view.width;\r
      const h = view.height;\r
      if (hovered && hovered.isConnected) {\r
        const box = hovered.getBoundingClientRect();\r
        const frame = container.getBoundingClientRect();\r
        const radius = parseFloat(getComputedStyle(hovered).borderTopLeftRadius) || 0;\r
        ring.x = box.left - frame.left + box.width / 2;\r
        ring.y = box.top - frame.top + box.height / 2;\r
        ring.hx = box.width / 2;\r
        ring.hy = box.height / 2;\r
        ring.corner = Math.min(radius, ring.hx, ring.hy);\r
        if (!ring.active) {\r
          let turning = 0;\r
          for (let i = 0; i < s.count; i++) turning += (px[i] - ring.x) * vy[i] - (py[i] - ring.y) * vx[i];\r
          ring.spin = turning < 0 ? -1 : 1;\r
        }\r
        ring.active = true;\r
      } else {\r
        ring.active = false;\r
      }\r
      let goal = 1;\r
      if (pointer.inside) {\r
        anchor.x = pointer.x;\r
        anchor.y = pointer.y;\r
      } else if (s.idle === 'gather') {\r
        anchor.x = w * 0.5;\r
        anchor.y = h * 0.5;\r
      } else if (s.idle === 'hide') {\r
        goal = 0;\r
      } else {\r
        anchor.x = w * (0.5 + 0.3 * Math.sin(time * 0.21) + 0.06 * Math.sin(time * 0.53 + 1.7));\r
        anchor.y = h * (0.5 + 0.24 * Math.sin(time * 0.29 + 0.8) + 0.05 * Math.sin(time * 0.71));\r
      }\r
      if (dt > 0) {\r
        const moveX = clamp((anchor.x - anchor.lastX) / dt, -4000, 4000);\r
        const moveY = clamp((anchor.y - anchor.lastY) / dt, -4000, 4000);\r
        const blend = 1 - Math.exp(-dt * 30);\r
        anchor.moveX += (moveX - anchor.moveX) * blend;\r
        anchor.moveY += (moveY - anchor.moveY) * blend;\r
      }\r
      anchor.lastX = anchor.x;\r
      anchor.lastY = anchor.y;\r
      presence += (goal - presence) * (1 - Math.exp(-dt / 0.25));\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      const n = s.count;\r
      const fade = introClock * introClock * (3 - 2 * introClock) * presence;\r
      const zr = Math.max(s.spread * 0.55, 10);\r
      if (sorted !== n) {\r
        for (let a = 0; a < n; a++) order[a] = a;\r
        sorted = n;\r
      }\r
      for (let a = 1; a < n; a++) {\r
        const value = order[a];\r
        const key = pz[value];\r
        let b = a - 1;\r
        while (b >= 0 && pz[order[b]] > key) {\r
          order[b + 1] = order[b];\r
          b--;\r
        }\r
        order[b + 1] = value;\r
      }\r
      const flash = burst.age < 1.2 ? Math.exp(-burst.age / 0.3) : 0;\r
      const front = ping.age * 520;\r
      let written = 0;\r
      for (let a = 0; a < n; a++) {\r
        const i = order[a];\r
        const near = clamp(pz[i] / zr, -1, 1);\r
        const scale = 1 + s.depth * 0.6 * near;\r
        const body = s.size * grain[i] * scale;\r
        const soft = s.depth * s.size * (s.lightMode ? 0.35 : 1.4) * Math.pow(Math.abs(near), 1.6);\r
        const flat = Math.hypot(vx[i], vy[i]);\r
        const dx = flat > 0.001 ? vx[i] / flat : 1;\r
        const dy = flat > 0.001 ? vy[i] / flat : 0;\r
        let wave = 0;\r
        if (ping.age < 1.6) {\r
          const offset = (Math.hypot(px[i] - ping.x, py[i] - ping.y) - front) / 40;\r
          wave = Math.exp(-offset * offset) * (1 - ping.age / 1.6);\r
        }\r
        const tint = Math.max(clamp((flat - 380) / 900, 0, 1), flash, wave);\r
        const width = body * (1 + wave * 0.8);\r
        let length = width + Math.min(flat * s.trail * 0.02, body * 14);\r
        if (s.shape === 2) length = width * 2.6 + Math.min(flat * s.trail * 0.03, body * 18);\r
        const twinkle = 0.86 + 0.14 * Math.sin(time * 3.1 + glint[i]);\r
        const dim = 1 - s.depth * 0.45 * Math.max(0, -near);\r
        const o = written * 4;\r
        agentData[o] = px[i];\r
        agentData[o + 1] = py[i];\r
        agentData[o + 2] = dx;\r
        agentData[o + 3] = dy;\r
        lookData[o] = length;\r
        lookData[o + 1] = width;\r
        lookData[o + 2] = clamp(0.95 * dim * (body / (body + soft)) * twinkle * (1 + wave * 0.4), 0, 1) * fade;\r
        lookData[o + 3] = tint;\r
        extraData[written * 2] = soft;\r
        extraData[written * 2 + 1] = s.shape;\r
        written++;\r
      }\r
      if (s.hideCursor && pointer.inside) {\r
        const o = written * 4;\r
        agentData[o] = pointer.x;\r
        agentData[o + 1] = pointer.y;\r
        agentData[o + 2] = 1;\r
        agentData[o + 3] = 0;\r
        lookData[o] = 6;\r
        lookData[o + 1] = 6;\r
        lookData[o + 2] = 1;\r
        lookData[o + 3] = 0;\r
        extraData[written * 2] = 0;\r
        extraData[written * 2 + 1] = 0;\r
        written++;\r
      }\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      if (!s.enabled || !written) return;\r
      gl.useProgram(shader.program);\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      gl.bindVertexArray(vao);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, agentBuffer);\r
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, agentData, 0, written * 4);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, lookBuffer);\r
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, lookData, 0, written * 4);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, extraBuffer);\r
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, extraData, 0, written * 2);\r
      gl.uniform2f(u.uView, view.width, view.height);\r
      gl.uniform3fv(u.uColor, parse(s.color));\r
      gl.uniform3fv(u.uAccent, parse(s.accentColor));\r
      gl.uniform1f(u.uRatio, view.ratio);\r
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, written);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      view.width = Math.max(1, container.clientWidth);\r
      view.height = Math.max(1, container.clientHeight);\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(view.width * view.ratio));\r
      canvas.height = Math.max(1, Math.round(view.height * view.ratio));\r
      allocate();\r
      if (!seeded) {\r
        seed();\r
        updateAnchor(s, 0);\r
        if (reduce) {\r
          anchor.x = view.width / 2;\r
          anchor.y = view.height / 2;\r
        }\r
        anchor.lastX = anchor.x;\r
        anchor.lastY = anchor.y;\r
        place(introClock >= 1);\r
      }\r
      draw();\r
      wake();\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.001, 1 / 30) : 1 / 60;\r
      last = now;\r
      if (!s.enabled || reduce) {\r
        setHidden(false);\r
        draw();\r
        return;\r
      }\r
      time += dt;\r
      burst.age += dt;\r
      ping.age += dt;\r
      if (introClock < 1) introClock = Math.min(1, introClock + dt / INTRO_SECONDS);\r
      const ease = introClock * introClock * (3 - 2 * introClock);\r
      hovered = findTarget();\r
      updateAnchor(s, dt);\r
      setHidden(s.hideCursor && pointer.inside);\r
      stir(s, dt, ease);\r
      flow(s, dt);\r
      move(s, dt / 2, ease);\r
      move(s, dt / 2, ease);\r
      draw();\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    function wake() {\r
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    }\r
\r
    const locate = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };\r
    };\r
\r
    const onPointerMove = event => {\r
      const { x, y, inside } = locate(event);\r
      pointer.x = x;\r
      pointer.y = y;\r
      pointer.inside = inside;\r
    };\r
\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      const { x, y, inside } = locate(event);\r
      if (!inside || !s.enabled || reduce || s.clickEffect === 'none') return;\r
      const reachOut = s.spread * 2.2;\r
      if (s.clickEffect === 'pulse') {\r
        ping.x = x;\r
        ping.y = y;\r
        ping.age = 0;\r
      } else {\r
        burst.age = 0;\r
      }\r
      const kick = s.clickEffect === 'pulse' ? 160 : 780;\r
      for (let i = 0; i < s.count; i++) {\r
        const dx = px[i] - x;\r
        const dy = py[i] - y;\r
        const d = Math.hypot(dx, dy) || 1;\r
        if (d > reachOut) continue;\r
        const k = (1 - d / reachOut) * kick * (0.6 + 0.4 * grain[i]);\r
        vx[i] += (dx / d) * k;\r
        vy[i] += (dy / d) * k;\r
      }\r
      if (s.clickEffect === 'pulse') return;\r
      const twist = 520 * (time % 2 < 1 ? 1 : -1);\r
      const inv = 1 / (s.spread * s.spread);\r
      for (let j = 1; j < rows - 1; j++) {\r
        for (let i = 1; i < cols - 1; i++) {\r
          const k = i + j * cols;\r
          const rx = (i + 0.5) * cell - x;\r
          const ry = (j + 0.5) * cell - y;\r
          const d2 = rx * rx + ry * ry;\r
          const w = (Math.sqrt(d2) / s.spread) * Math.exp(-d2 * inv);\r
          if (w < 0.003) continue;\r
          const d = Math.sqrt(d2) + 0.001;\r
          flowX[k] += (-ry / d) * twist * w;\r
          flowY[k] += (rx / d) * twist * w;\r
        }\r
      }\r
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
    wakeRef.current = wake;\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      setHidden(false);\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('pointerup', onPointerUp);\r
      window.removeEventListener('pointercancel', onPointerUp);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteBuffer(cornerBuffer);\r
      gl.deleteBuffer(agentBuffer);\r
      gl.deleteBuffer(lookBuffer);\r
      gl.deleteBuffer(extraBuffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(shader.program);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div ref={containerRef} className={\`swarm-cursor\${className ? \` \${className}\` : ''}\`} style={style} {...rest}>\r
      <style>{\`.\${HIDDEN}, .\${HIDDEN} * { cursor: none !important; }\`}</style>\r
      <canvas ref={canvasRef} className="swarm-cursor-canvas" aria-hidden="true" />\r
      {children ? <div className="swarm-cursor-content">{children}</div> : null}\r
    </div>\r
  );\r
};\r
\r
export default SwarmCursor;\r
`,n=`.swarm-cursor {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.swarm-cursor-canvas {\r
  position: absolute;\r
  inset: 0;\r
  display: block;\r
  width: 100%;\r
  height: 100%;\r
  pointer-events: none;\r
}\r
\r
.swarm-cursor-content {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
}\r
`,e=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
const MAX_PARTICLES = 2000;\r
const INTRO_SECONDS = 1.4;\r
const HIDDEN = 'swarm-cursor-hidden';\r
const SHAPES = { dot: 0, square: 1, streak: 2 };\r
const CELL = 16;\r
const MAX_COLS = 72;\r
const MAX_ROWS = 48;\r
const PRESSURE_STEPS = 12;\r
\r
const VERTEX = \`#version 300 es\r
layout(location = 0) in vec2 aCorner;\r
layout(location = 1) in vec4 aAgent;\r
layout(location = 2) in vec4 aLook;\r
layout(location = 3) in vec2 aExtra;\r
uniform vec2 uView;\r
out vec2 vLocal;\r
out vec2 vHalf;\r
out float vAlpha;\r
out float vTint;\r
out float vSoft;\r
out float vShape;\r
\r
void main() {\r
  vec2 dir = aAgent.zw;\r
  vec2 side = vec2(-dir.y, dir.x);\r
  vec2 extent = aLook.xy * 0.5;\r
  vec2 pad = extent + 1.0 + aExtra.x * 1.5;\r
  vec2 local = aCorner * pad;\r
  vec2 center = aAgent.xy - dir * (extent.x - extent.y);\r
  vec2 pos = center + dir * local.x + side * local.y;\r
  vLocal = local;\r
  vHalf = extent;\r
  vAlpha = aLook.z;\r
  vTint = aLook.w;\r
  vSoft = aExtra.x;\r
  vShape = aExtra.y;\r
  vec2 clip = pos / uView * 2.0 - 1.0;\r
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform vec3 uColor;\r
uniform vec3 uAccent;\r
uniform float uRatio;\r
in vec2 vLocal;\r
in vec2 vHalf;\r
in float vAlpha;\r
in float vTint;\r
in float vSoft;\r
in float vShape;\r
out vec4 outColor;\r
\r
void main() {\r
  float d;\r
  if (vShape > 0.5 && vShape < 1.5) {\r
    float corner = vHalf.y * 0.3;\r
    vec2 q = abs(vLocal) - vHalf + corner;\r
    d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - corner;\r
  } else {\r
    vec2 q = vLocal;\r
    q.x = max(abs(q.x) - (vHalf.x - vHalf.y), 0.0);\r
    d = length(q) - vHalf.y;\r
  }\r
  float edge = 0.6 / uRatio + vSoft;\r
  float cover = 1.0 - smoothstep(-edge, edge, d);\r
  float stretch = clamp(1.0 - vHalf.y / max(vHalf.x, 0.001), 0.0, 1.0);\r
  float head = clamp((vLocal.x + vHalf.x) / max(2.0 * vHalf.x, 0.001), 0.0, 1.0);\r
  cover *= mix(1.0, 0.12 + 0.88 * head * head, stretch);\r
  float alpha = cover * vAlpha;\r
  outColor = vec4(mix(uColor, uAccent, vTint) * alpha, alpha);\r
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
const random = seed => {\r
  let state = seed >>> 0 || 1;\r
  return () => {\r
    state ^= state << 13;\r
    state ^= state >>> 17;\r
    state ^= state << 5;\r
    return (state >>> 0) / 4294967296;\r
  };\r
};\r
\r
const rectField = (x, y, hx, hy, r, out) => {\r
  const sx = x < 0 ? -1 : 1;\r
  const sy = y < 0 ? -1 : 1;\r
  const qx = Math.abs(x) - (hx - r);\r
  const qy = Math.abs(y) - (hy - r);\r
  if (qx > 0 && qy > 0) {\r
    const l = Math.hypot(qx, qy) || 1;\r
    out[0] = l - r;\r
    out[1] = (qx / l) * sx;\r
    out[2] = (qy / l) * sy;\r
  } else if (qx > qy) {\r
    out[0] = qx - r;\r
    out[1] = sx;\r
    out[2] = 0;\r
  } else {\r
    out[0] = qy - r;\r
    out[1] = 0;\r
    out[2] = sy;\r
  }\r
  return out;\r
};\r
\r
const SwarmCursor = ({\r
  count = 800,\r
  size = 2.6,\r
  shape = 'dot',\r
  color,\r
  accentColor,\r
  spread = 90,\r
  speed = 1,\r
  swirl = 0.6,\r
  tail = 0.5,\r
  trail = 0.6,\r
  wander = 0.5,\r
  depth = 0.7,\r
  targets = 'a, button, [data-swarm-target]',\r
  idle = 'roam',\r
  clickEffect = 'burst',\r
  hideCursor = false,\r
  intro = true,\r
  enabled = true,\r
  lightMode = false,\r
  dpr,\r
  children,\r
  className = '',\r
  style,\r
  ...rest\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const ink = lightMode ? '#18181b' : '#ffffff';\r
  const settings = {\r
    count: Math.round(clamp(count, 1, MAX_PARTICLES)),\r
    size: clamp(size, 0.5, 16),\r
    shape: SHAPES[shape] ?? 0,\r
    color: color || ink,\r
    accentColor: accentColor || color || ink,\r
    spread: clamp(spread, 20, 400),\r
    speed: clamp(speed, 0, 4),\r
    swirl: clamp(swirl, 0, 1),\r
    tail: clamp(tail, 0, 1),\r
    trail: clamp(trail, 0, 3),\r
    wander: clamp(wander, 0, 2),\r
    depth: clamp(depth, 0, 1),\r
    targets,\r
    idle,\r
    clickEffect,\r
    hideCursor,\r
    intro,\r
    enabled,\r
    lightMode,\r
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
    const shader = link(gl);\r
    if (!shader) return undefined;\r
    const u = shader.uniforms;\r
\r
    const slots = MAX_PARTICLES + 1;\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    const cornerBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    const agentData = new Float32Array(slots * 4);\r
    const lookData = new Float32Array(slots * 4);\r
    const extraData = new Float32Array(slots * 2);\r
    const instanced = (location, width, data) => {\r
      const buffer = gl.createBuffer();\r
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, data.byteLength, gl.DYNAMIC_DRAW);\r
      gl.enableVertexAttribArray(location);\r
      gl.vertexAttribPointer(location, width, gl.FLOAT, false, 0, 0);\r
      gl.vertexAttribDivisor(location, 1);\r
      return buffer;\r
    };\r
    const agentBuffer = instanced(1, 4, agentData);\r
    const lookBuffer = instanced(2, 4, lookData);\r
    const extraBuffer = instanced(3, 2, extraData);\r
    gl.bindVertexArray(null);\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const colorCache = new Map();\r
    const parse = value => {\r
      const key = String(value);\r
      const cached = colorCache.get(key);\r
      if (cached) return cached;\r
      let rgb = [1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#000000';\r
        probe.fillStyle = key;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      colorCache.set(key, rgb);\r
      return rgb;\r
    };\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1, ratio: 1 };\r
    const px = new Float32Array(MAX_PARTICLES);\r
    const py = new Float32Array(MAX_PARTICLES);\r
    const pz = new Float32Array(MAX_PARTICLES);\r
    const vx = new Float32Array(MAX_PARTICLES);\r
    const vy = new Float32Array(MAX_PARTICLES);\r
    const vz = new Float32Array(MAX_PARTICLES);\r
    const home = new Float32Array(MAX_PARTICLES);\r
    const heft = new Float32Array(MAX_PARTICLES);\r
    const bob = new Float32Array(MAX_PARTICLES);\r
    const bobRate = new Float32Array(MAX_PARTICLES);\r
    const grain = new Float32Array(MAX_PARTICLES);\r
    const glint = new Float32Array(MAX_PARTICLES);\r
    const order = new Int32Array(MAX_PARTICLES);\r
    const field = [0, 0, 0];\r
    let cols = 1;\r
    let rows = 1;\r
    let cell = CELL;\r
    let flowX = new Float32Array(1);\r
    let flowY = new Float32Array(1);\r
    let lastX = new Float32Array(1);\r
    let lastY = new Float32Array(1);\r
    let pressure = new Float32Array(1);\r
    let divergence = new Float32Array(1);\r
    let curl = new Float32Array(1);\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const anchor = { x: 0, y: 0, lastX: 0, lastY: 0, moveX: 0, moveY: 0 };\r
    const ring = { active: false, x: 0, y: 0, hx: 0, hy: 0, corner: 0, spin: 1 };\r
    const burst = { age: 10 };\r
    const ping = { age: 10, x: 0, y: 0 };\r
    let hovered = null;\r
    let time = 0;\r
    let presence = 1;\r
    let introClock = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let seeded = false;\r
    let hidden = false;\r
    let sorted = 0;\r
\r
    const setHidden = value => {\r
      if (value === hidden) return;\r
      hidden = value;\r
      container.classList.toggle(HIDDEN, value);\r
    };\r
\r
    const allocate = () => {\r
      const nextCols = clamp(Math.round(view.width / CELL), 8, MAX_COLS);\r
      const nextRows = clamp(Math.round(view.height / CELL), 8, MAX_ROWS);\r
      cell = Math.max(view.width / nextCols, view.height / nextRows);\r
      if (nextCols === cols && nextRows === rows) return;\r
      cols = nextCols;\r
      rows = nextRows;\r
      const total = cols * rows;\r
      flowX = new Float32Array(total);\r
      flowY = new Float32Array(total);\r
      lastX = new Float32Array(total);\r
      lastY = new Float32Array(total);\r
      pressure = new Float32Array(total);\r
      divergence = new Float32Array(total);\r
      curl = new Float32Array(total);\r
    };\r
\r
    const sample = (values, x, y) => {\r
      let gx = x / cell - 0.5;\r
      let gy = y / cell - 0.5;\r
      if (gx < 0) gx = 0;\r
      else if (gx > cols - 1.001) gx = cols - 1.001;\r
      if (gy < 0) gy = 0;\r
      else if (gy > rows - 1.001) gy = rows - 1.001;\r
      const i = gx | 0;\r
      const j = gy | 0;\r
      const fx = gx - i;\r
      const fy = gy - j;\r
      const k = i + j * cols;\r
      return (\r
        (values[k] * (1 - fx) + values[k + 1] * fx) * (1 - fy) +\r
        (values[k + cols] * (1 - fx) + values[k + cols + 1] * fx) * fy\r
      );\r
    };\r
\r
    const walls = (values, axis) => {\r
      for (let j = 1; j < rows - 1; j++) {\r
        const left = j * cols;\r
        const right = left + cols - 1;\r
        values[left] = axis === 1 ? -values[left + 1] : values[left + 1];\r
        values[right] = axis === 1 ? -values[right - 1] : values[right - 1];\r
      }\r
      for (let i = 1; i < cols - 1; i++) {\r
        const bottom = i + (rows - 1) * cols;\r
        values[i] = axis === 2 ? -values[i + cols] : values[i + cols];\r
        values[bottom] = axis === 2 ? -values[bottom - cols] : values[bottom - cols];\r
      }\r
      values[0] = 0.5 * (values[1] + values[cols]);\r
      values[cols - 1] = 0.5 * (values[cols - 2] + values[2 * cols - 1]);\r
      values[(rows - 1) * cols] = 0.5 * (values[(rows - 2) * cols] + values[(rows - 1) * cols + 1]);\r
      values[rows * cols - 1] = 0.5 * (values[rows * cols - 2] + values[(rows - 1) * cols - 1]);\r
    };\r
\r
    const stir = (s, dt, ease) => {\r
      const radius = s.spread;\r
      const reach = radius * 2.2;\r
      const i0 = Math.max(1, Math.floor((anchor.x - reach) / cell));\r
      const i1 = Math.min(cols - 2, Math.ceil((anchor.x + reach) / cell));\r
      const j0 = Math.max(1, Math.floor((anchor.y - reach) / cell));\r
      const j1 = Math.min(rows - 2, Math.ceil((anchor.y + reach) / cell));\r
      const inv = 1 / (radius * radius * 0.55);\r
      const moving = Math.hypot(anchor.moveX, anchor.moveY);\r
      const grab = (1 - Math.exp(-dt * 20)) * clamp(moving / 240, 0, 1) * presence;\r
      const whirl = ring.active ? 0 : radius * (0.5 + 4 * (1 - ease)) * (0.35 + 0.65 * s.speed);\r
      const churn = s.wander * radius * 14 * (0.4 + 0.6 * s.speed);\r
      const fk = 1.4 / radius;\r
      const ft = time * 0.75 * (0.4 + 0.6 * s.speed);\r
      for (let j = j0; j <= j1; j++) {\r
        for (let i = i0; i <= i1; i++) {\r
          const k = i + j * cols;\r
          const x = (i + 0.5) * cell;\r
          const y = (j + 0.5) * cell;\r
          const rx = x - anchor.x;\r
          const ry = y - anchor.y;\r
          const d2 = rx * rx + ry * ry;\r
          const w = Math.exp(-d2 * inv);\r
          if (w < 0.003) continue;\r
          const d = Math.sqrt(d2) + 0.001;\r
          flowX[k] += (anchor.moveX - flowX[k]) * w * grab;\r
          flowY[k] += (anchor.moveY - flowY[k]) * w * grab;\r
          const reachOut = Math.min(1, d / (radius * 0.45));\r
          flowX[k] += (-ry / d) * whirl * reachOut * w * dt;\r
          flowY[k] += (rx / d) * whirl * reachOut * w * dt;\r
          const a1 = x * fk + ft;\r
          const b1 = y * fk * 1.1 - ft * 0.8;\r
          const a2 = y * fk * 1.7 + ft * 1.2 + 1.3;\r
          const b2 = x * fk * 1.3 - 0.7;\r
          const curlX = -Math.sin(a1) * Math.sin(b1) * 1.1 + 1.02 * Math.cos(a2) * Math.cos(b2);\r
          const curlY = -(Math.cos(a1) * Math.cos(b1) - 0.78 * Math.sin(a2) * Math.sin(b2));\r
          flowX[k] += curlX * churn * w * dt;\r
          flowY[k] += curlY * churn * w * dt;\r
        }\r
      }\r
      if (!ring.active) return;\r
      const band = Math.max(4, radius * 0.16);\r
      const margin = band + 24;\r
      const circulate = 230 * (0.4 + 0.6 * s.speed) * ring.spin;\r
      const r0 = Math.max(1, Math.floor((ring.x - ring.hx - margin) / cell));\r
      const r1 = Math.min(cols - 2, Math.ceil((ring.x + ring.hx + margin) / cell));\r
      const c0 = Math.max(1, Math.floor((ring.y - ring.hy - margin) / cell));\r
      const c1 = Math.min(rows - 2, Math.ceil((ring.y + ring.hy + margin) / cell));\r
      const rate = 1 - Math.exp(-dt * 6);\r
      for (let j = c0; j <= c1; j++) {\r
        for (let i = r0; i <= r1; i++) {\r
          const k = i + j * cols;\r
          rectField((i + 0.5) * cell - ring.x, (j + 0.5) * cell - ring.y, ring.hx, ring.hy, ring.corner, field);\r
          const off = field[0] - (5 + band * 0.5);\r
          const w = Math.exp(-(off * off) / (margin * margin * 0.35));\r
          if (w < 0.01) continue;\r
          flowX[k] += (-field[2] * circulate - flowX[k]) * w * rate;\r
          flowY[k] += (field[1] * circulate - flowY[k]) * w * rate;\r
        }\r
      }\r
    };\r
\r
    const flow = (s, dt) => {\r
      const total = cols * rows;\r
      for (let j = 1; j < rows - 1; j++) {\r
        for (let i = 1; i < cols - 1; i++) {\r
          const k = i + j * cols;\r
          curl[k] = (flowY[k + 1] - flowY[k - 1] - flowX[k + cols] + flowX[k - cols]) * (0.5 / cell);\r
        }\r
      }\r
      const confine = s.swirl * cell * 9;\r
      for (let j = 2; j < rows - 2; j++) {\r
        for (let i = 2; i < cols - 2; i++) {\r
          const k = i + j * cols;\r
          const gx = Math.abs(curl[k + 1]) - Math.abs(curl[k - 1]);\r
          const gy = Math.abs(curl[k + cols]) - Math.abs(curl[k - cols]);\r
          const len = Math.hypot(gx, gy) + 1e-5;\r
          flowX[k] += (gy / len) * curl[k] * confine * dt;\r
          flowY[k] -= (gx / len) * curl[k] * confine * dt;\r
        }\r
      }\r
      lastX.set(flowX);\r
      lastY.set(flowY);\r
      const back = dt / cell;\r
      const fade = Math.exp(-dt / (0.35 + 1.5 * s.swirl));\r
      for (let j = 1; j < rows - 1; j++) {\r
        for (let i = 1; i < cols - 1; i++) {\r
          const k = i + j * cols;\r
          let x = i - back * lastX[k];\r
          let y = j - back * lastY[k];\r
          if (x < 0.5) x = 0.5;\r
          else if (x > cols - 1.5) x = cols - 1.5;\r
          if (y < 0.5) y = 0.5;\r
          else if (y > rows - 1.5) y = rows - 1.5;\r
          const i0 = x | 0;\r
          const j0 = y | 0;\r
          const fx = x - i0;\r
          const fy = y - j0;\r
          const a = i0 + j0 * cols;\r
          flowX[k] =\r
            ((lastX[a] * (1 - fx) + lastX[a + 1] * fx) * (1 - fy) +\r
              (lastX[a + cols] * (1 - fx) + lastX[a + cols + 1] * fx) * fy) *\r
            fade;\r
          flowY[k] =\r
            ((lastY[a] * (1 - fx) + lastY[a + 1] * fx) * (1 - fy) +\r
              (lastY[a + cols] * (1 - fx) + lastY[a + cols + 1] * fx) * fy) *\r
            fade;\r
        }\r
      }\r
      walls(flowX, 1);\r
      walls(flowY, 2);\r
      const h2 = cell * cell;\r
      for (let j = 1; j < rows - 1; j++) {\r
        for (let i = 1; i < cols - 1; i++) {\r
          const k = i + j * cols;\r
          divergence[k] = (flowX[k + 1] - flowX[k - 1] + flowY[k + cols] - flowY[k - cols]) * (0.5 / cell);\r
        }\r
      }\r
      pressure.fill(0, 0, total);\r
      walls(divergence, 0);\r
      for (let step = 0; step < PRESSURE_STEPS; step++) {\r
        for (let j = 1; j < rows - 1; j++) {\r
          for (let i = 1; i < cols - 1; i++) {\r
            const k = i + j * cols;\r
            pressure[k] =\r
              (pressure[k - 1] + pressure[k + 1] + pressure[k - cols] + pressure[k + cols] - h2 * divergence[k]) * 0.25;\r
          }\r
        }\r
        walls(pressure, 0);\r
      }\r
      for (let j = 1; j < rows - 1; j++) {\r
        for (let i = 1; i < cols - 1; i++) {\r
          const k = i + j * cols;\r
          flowX[k] -= (pressure[k + 1] - pressure[k - 1]) * (0.5 / cell);\r
          flowY[k] -= (pressure[k + cols] - pressure[k - cols]) * (0.5 / cell);\r
        }\r
      }\r
      walls(flowX, 1);\r
      walls(flowY, 2);\r
    };\r
\r
    const crowd = new Int32Array(MAX_PARTICLES);\r
    let crowdHeads = new Int32Array(1);\r
    let crowdRows = 1;\r
    const push = (n, h) => {\r
      const gc = Math.max(1, Math.ceil(view.width / h) + 2);\r
      const gr = Math.max(1, Math.ceil(view.height / h) + 2);\r
      if (crowdHeads.length < gc * gr) crowdHeads = new Int32Array(gc * gr);\r
      crowdHeads.fill(-1, 0, gc * gr);\r
      crowdRows = gr;\r
      for (let i = 0; i < n; i++) {\r
        const cx = clamp(Math.floor(px[i] / h) + 1, 0, gc - 1);\r
        const cy = clamp(Math.floor(py[i] / h) + 1, 0, gr - 1);\r
        const key = cy * gc + cx;\r
        crowd[i] = crowdHeads[key];\r
        crowdHeads[key] = i;\r
      }\r
      return gc;\r
    };\r
\r
    const move = (s, dt, ease) => {\r
      const n = s.count;\r
      const radius = s.spread;\r
      const loose = 1 - 0.6 * s.tail;\r
      const gather = 12 * loose * (0.2 + 0.8 * ease);\r
      const pull = 30 * loose * (0.2 + 0.8 * ease);\r
      const band = Math.max(4, radius * 0.16);\r
      const w = view.width;\r
      const h = view.height;\r
      const gap = radius * Math.sqrt(Math.PI / Math.max(n, 1)) * 1.6;\r
      const repel = 4000;\r
      const gc = push(n, gap);\r
      for (let i = 0; i < n; i++) {\r
        const x = px[i];\r
        const y = py[i];\r
        const k = 10 * (1 - 0.6 * s.tail * heft[i]);\r
        let ax = (sample(flowX, x, y) - vx[i]) * k;\r
        let ay = (sample(flowY, x, y) - vy[i]) * k;\r
        const cx = clamp(Math.floor(x / gap) + 1, 0, gc - 1);\r
        const cy = clamp(Math.floor(y / gap) + 1, 0, crowdRows - 1);\r
        for (let oy = -1; oy <= 1; oy++) {\r
          const row = cy + oy;\r
          if (row < 0 || row >= crowdRows) continue;\r
          for (let ox = -1; ox <= 1; ox++) {\r
            const col = cx + ox;\r
            if (col < 0 || col >= gc) continue;\r
            for (let j = crowdHeads[row * gc + col]; j !== -1; j = crowd[j]) {\r
              if (j === i) continue;\r
              const dx = x - px[j];\r
              const dy = y - py[j];\r
              const d2 = dx * dx + dy * dy;\r
              if (d2 >= gap * gap || d2 < 1e-6) continue;\r
              const d = Math.sqrt(d2);\r
              const q = 1 - d / gap;\r
              ax += (dx / d) * q * q * repel;\r
              ay += (dy / d) * q * q * repel;\r
            }\r
          }\r
        }\r
        if (ring.active) {\r
          rectField(x - ring.x, y - ring.y, ring.hx, ring.hy, ring.corner, field);\r
          const e = field[0] - (5 + band * home[i] * home[i]);\r
          const hold = e > 0 ? 70 : 140;\r
          ax -= field[1] * e * hold;\r
          ay -= field[2] * e * hold;\r
        } else {\r
          const dx = anchor.x - x;\r
          const dy = anchor.y - y;\r
          const d = Math.hypot(dx, dy) + 0.001;\r
          const over = Math.max(0, d - radius);\r
          ax += (dx / d) * (d * gather + over * pull);\r
          ay += (dy / d) * (d * gather + over * pull);\r
        }\r
        if (introClock >= 1) {\r
          if (x < 8) ax += (8 - x) * 30;\r
          else if (x > w - 8) ax -= (x - w + 8) * 30;\r
          if (y < 8) ay += (8 - y) * 30;\r
          else if (y > h - 8) ay -= (y - h + 8) * 30;\r
        }\r
        const lift = Math.sin(time * bobRate[i] + bob[i]) * radius * (ring.active ? 0.15 : 0.55);\r
        const az = (lift - pz[i]) * 36 - vz[i] * 9;\r
        vx[i] += ax * dt;\r
        vy[i] += ay * dt;\r
        vz[i] += az * dt;\r
        px[i] += vx[i] * dt;\r
        py[i] += vy[i] * dt;\r
        pz[i] += vz[i] * dt;\r
      }\r
    };\r
\r
    const seed = () => {\r
      const rand = random(7);\r
      for (let i = 0; i < MAX_PARTICLES; i++) {\r
        home[i] = 0.08 + 0.92 * Math.sqrt(rand());\r
        heft[i] = rand() * rand();\r
        bob[i] = rand() * Math.PI * 2;\r
        bobRate[i] = 0.5 + rand() * 1.1;\r
        grain[i] = 0.55 + rand() * 0.9;\r
        glint[i] = rand() * 100;\r
      }\r
      seeded = true;\r
    };\r
\r
    const place = gathered => {\r
      const s = settingsRef.current;\r
      const rand = random(11);\r
      const reachOut = Math.hypot(view.width, view.height) * 0.5;\r
      for (let i = 0; i < MAX_PARTICLES; i++) {\r
        const a = rand() * Math.PI * 2;\r
        const r = gathered ? home[i] * s.spread : (0.35 + 0.65 * Math.sqrt(rand())) * reachOut;\r
        px[i] = anchor.x + Math.cos(a) * r;\r
        py[i] = anchor.y + Math.sin(a) * r;\r
        pz[i] = Math.sin(bob[i]) * s.spread * 0.55;\r
        vx[i] = 0;\r
        vy[i] = 0;\r
        vz[i] = 0;\r
      }\r
    };\r
\r
    const findTarget = () => {\r
      const s = settingsRef.current;\r
      if (!s.targets || !pointer.inside) return null;\r
      const rect = container.getBoundingClientRect();\r
      const element = document.elementFromPoint(rect.left + pointer.x, rect.top + pointer.y);\r
      if (!element || !container.contains(element)) return null;\r
      let match = null;\r
      try {\r
        match = element.closest(s.targets);\r
      } catch {\r
        match = null;\r
      }\r
      return match && container.contains(match) ? match : null;\r
    };\r
\r
    const updateAnchor = (s, dt) => {\r
      const w = view.width;\r
      const h = view.height;\r
      if (hovered && hovered.isConnected) {\r
        const box = hovered.getBoundingClientRect();\r
        const frame = container.getBoundingClientRect();\r
        const radius = parseFloat(getComputedStyle(hovered).borderTopLeftRadius) || 0;\r
        ring.x = box.left - frame.left + box.width / 2;\r
        ring.y = box.top - frame.top + box.height / 2;\r
        ring.hx = box.width / 2;\r
        ring.hy = box.height / 2;\r
        ring.corner = Math.min(radius, ring.hx, ring.hy);\r
        if (!ring.active) {\r
          let turning = 0;\r
          for (let i = 0; i < s.count; i++) turning += (px[i] - ring.x) * vy[i] - (py[i] - ring.y) * vx[i];\r
          ring.spin = turning < 0 ? -1 : 1;\r
        }\r
        ring.active = true;\r
      } else {\r
        ring.active = false;\r
      }\r
      let goal = 1;\r
      if (pointer.inside) {\r
        anchor.x = pointer.x;\r
        anchor.y = pointer.y;\r
      } else if (s.idle === 'gather') {\r
        anchor.x = w * 0.5;\r
        anchor.y = h * 0.5;\r
      } else if (s.idle === 'hide') {\r
        goal = 0;\r
      } else {\r
        anchor.x = w * (0.5 + 0.3 * Math.sin(time * 0.21) + 0.06 * Math.sin(time * 0.53 + 1.7));\r
        anchor.y = h * (0.5 + 0.24 * Math.sin(time * 0.29 + 0.8) + 0.05 * Math.sin(time * 0.71));\r
      }\r
      if (dt > 0) {\r
        const moveX = clamp((anchor.x - anchor.lastX) / dt, -4000, 4000);\r
        const moveY = clamp((anchor.y - anchor.lastY) / dt, -4000, 4000);\r
        const blend = 1 - Math.exp(-dt * 30);\r
        anchor.moveX += (moveX - anchor.moveX) * blend;\r
        anchor.moveY += (moveY - anchor.moveY) * blend;\r
      }\r
      anchor.lastX = anchor.x;\r
      anchor.lastY = anchor.y;\r
      presence += (goal - presence) * (1 - Math.exp(-dt / 0.25));\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      const n = s.count;\r
      const fade = introClock * introClock * (3 - 2 * introClock) * presence;\r
      const zr = Math.max(s.spread * 0.55, 10);\r
      if (sorted !== n) {\r
        for (let a = 0; a < n; a++) order[a] = a;\r
        sorted = n;\r
      }\r
      for (let a = 1; a < n; a++) {\r
        const value = order[a];\r
        const key = pz[value];\r
        let b = a - 1;\r
        while (b >= 0 && pz[order[b]] > key) {\r
          order[b + 1] = order[b];\r
          b--;\r
        }\r
        order[b + 1] = value;\r
      }\r
      const flash = burst.age < 1.2 ? Math.exp(-burst.age / 0.3) : 0;\r
      const front = ping.age * 520;\r
      let written = 0;\r
      for (let a = 0; a < n; a++) {\r
        const i = order[a];\r
        const near = clamp(pz[i] / zr, -1, 1);\r
        const scale = 1 + s.depth * 0.6 * near;\r
        const body = s.size * grain[i] * scale;\r
        const soft = s.depth * s.size * (s.lightMode ? 0.35 : 1.4) * Math.pow(Math.abs(near), 1.6);\r
        const flat = Math.hypot(vx[i], vy[i]);\r
        const dx = flat > 0.001 ? vx[i] / flat : 1;\r
        const dy = flat > 0.001 ? vy[i] / flat : 0;\r
        let wave = 0;\r
        if (ping.age < 1.6) {\r
          const offset = (Math.hypot(px[i] - ping.x, py[i] - ping.y) - front) / 40;\r
          wave = Math.exp(-offset * offset) * (1 - ping.age / 1.6);\r
        }\r
        const tint = Math.max(clamp((flat - 380) / 900, 0, 1), flash, wave);\r
        const width = body * (1 + wave * 0.8);\r
        let length = width + Math.min(flat * s.trail * 0.02, body * 14);\r
        if (s.shape === 2) length = width * 2.6 + Math.min(flat * s.trail * 0.03, body * 18);\r
        const twinkle = 0.86 + 0.14 * Math.sin(time * 3.1 + glint[i]);\r
        const dim = 1 - s.depth * 0.45 * Math.max(0, -near);\r
        const o = written * 4;\r
        agentData[o] = px[i];\r
        agentData[o + 1] = py[i];\r
        agentData[o + 2] = dx;\r
        agentData[o + 3] = dy;\r
        lookData[o] = length;\r
        lookData[o + 1] = width;\r
        lookData[o + 2] = clamp(0.95 * dim * (body / (body + soft)) * twinkle * (1 + wave * 0.4), 0, 1) * fade;\r
        lookData[o + 3] = tint;\r
        extraData[written * 2] = soft;\r
        extraData[written * 2 + 1] = s.shape;\r
        written++;\r
      }\r
      if (s.hideCursor && pointer.inside) {\r
        const o = written * 4;\r
        agentData[o] = pointer.x;\r
        agentData[o + 1] = pointer.y;\r
        agentData[o + 2] = 1;\r
        agentData[o + 3] = 0;\r
        lookData[o] = 6;\r
        lookData[o + 1] = 6;\r
        lookData[o + 2] = 1;\r
        lookData[o + 3] = 0;\r
        extraData[written * 2] = 0;\r
        extraData[written * 2 + 1] = 0;\r
        written++;\r
      }\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      if (!s.enabled || !written) return;\r
      gl.useProgram(shader.program);\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      gl.bindVertexArray(vao);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, agentBuffer);\r
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, agentData, 0, written * 4);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, lookBuffer);\r
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, lookData, 0, written * 4);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, extraBuffer);\r
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, extraData, 0, written * 2);\r
      gl.uniform2f(u.uView, view.width, view.height);\r
      gl.uniform3fv(u.uColor, parse(s.color));\r
      gl.uniform3fv(u.uAccent, parse(s.accentColor));\r
      gl.uniform1f(u.uRatio, view.ratio);\r
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, written);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      view.width = Math.max(1, container.clientWidth);\r
      view.height = Math.max(1, container.clientHeight);\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(view.width * view.ratio));\r
      canvas.height = Math.max(1, Math.round(view.height * view.ratio));\r
      allocate();\r
      if (!seeded) {\r
        seed();\r
        updateAnchor(s, 0);\r
        if (reduce) {\r
          anchor.x = view.width / 2;\r
          anchor.y = view.height / 2;\r
        }\r
        anchor.lastX = anchor.x;\r
        anchor.lastY = anchor.y;\r
        place(introClock >= 1);\r
      }\r
      draw();\r
      wake();\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.001, 1 / 30) : 1 / 60;\r
      last = now;\r
      if (!s.enabled || reduce) {\r
        setHidden(false);\r
        draw();\r
        return;\r
      }\r
      time += dt;\r
      burst.age += dt;\r
      ping.age += dt;\r
      if (introClock < 1) introClock = Math.min(1, introClock + dt / INTRO_SECONDS);\r
      const ease = introClock * introClock * (3 - 2 * introClock);\r
      hovered = findTarget();\r
      updateAnchor(s, dt);\r
      setHidden(s.hideCursor && pointer.inside);\r
      stir(s, dt, ease);\r
      flow(s, dt);\r
      move(s, dt / 2, ease);\r
      move(s, dt / 2, ease);\r
      draw();\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    function wake() {\r
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    }\r
\r
    const locate = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };\r
    };\r
\r
    const onPointerMove = event => {\r
      const { x, y, inside } = locate(event);\r
      pointer.x = x;\r
      pointer.y = y;\r
      pointer.inside = inside;\r
    };\r
\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      const { x, y, inside } = locate(event);\r
      if (!inside || !s.enabled || reduce || s.clickEffect === 'none') return;\r
      const reachOut = s.spread * 2.2;\r
      if (s.clickEffect === 'pulse') {\r
        ping.x = x;\r
        ping.y = y;\r
        ping.age = 0;\r
      } else {\r
        burst.age = 0;\r
      }\r
      const kick = s.clickEffect === 'pulse' ? 160 : 780;\r
      for (let i = 0; i < s.count; i++) {\r
        const dx = px[i] - x;\r
        const dy = py[i] - y;\r
        const d = Math.hypot(dx, dy) || 1;\r
        if (d > reachOut) continue;\r
        const k = (1 - d / reachOut) * kick * (0.6 + 0.4 * grain[i]);\r
        vx[i] += (dx / d) * k;\r
        vy[i] += (dy / d) * k;\r
      }\r
      if (s.clickEffect === 'pulse') return;\r
      const twist = 520 * (time % 2 < 1 ? 1 : -1);\r
      const inv = 1 / (s.spread * s.spread);\r
      for (let j = 1; j < rows - 1; j++) {\r
        for (let i = 1; i < cols - 1; i++) {\r
          const k = i + j * cols;\r
          const rx = (i + 0.5) * cell - x;\r
          const ry = (j + 0.5) * cell - y;\r
          const d2 = rx * rx + ry * ry;\r
          const w = (Math.sqrt(d2) / s.spread) * Math.exp(-d2 * inv);\r
          if (w < 0.003) continue;\r
          const d = Math.sqrt(d2) + 0.001;\r
          flowX[k] += (-ry / d) * twist * w;\r
          flowY[k] += (rx / d) * twist * w;\r
        }\r
      }\r
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
    wakeRef.current = wake;\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      setHidden(false);\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('pointerup', onPointerUp);\r
      window.removeEventListener('pointercancel', onPointerUp);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteBuffer(cornerBuffer);\r
      gl.deleteBuffer(agentBuffer);\r
      gl.deleteBuffer(lookBuffer);\r
      gl.deleteBuffer(extraBuffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(shader.program);\r
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
      {...rest}\r
    >\r
      <style>{\`.\${HIDDEN}, .\${HIDDEN} * { cursor: none !important; }\`}</style>\r
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 block h-full w-full" aria-hidden="true" />\r
      {children ? <div className="relative h-full w-full">{children}</div> : null}\r
    </div>\r
  );\r
};\r
\r
export default SwarmCursor;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';\r
import './SwarmCursor.css';\r
\r
export type SwarmShape = 'dot' | 'streak' | 'square';\r
export type SwarmIdle = 'roam' | 'gather' | 'hide';\r
export type SwarmClickEffect = 'burst' | 'pulse' | 'none';\r
\r
export interface SwarmCursorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'color'> {\r
  count?: number;\r
  size?: number;\r
  shape?: SwarmShape;\r
  color?: string;\r
  accentColor?: string;\r
  spread?: number;\r
  speed?: number;\r
  swirl?: number;\r
  tail?: number;\r
  trail?: number;\r
  wander?: number;\r
  depth?: number;\r
  targets?: string;\r
  idle?: SwarmIdle;\r
  clickEffect?: SwarmClickEffect;\r
  hideCursor?: boolean;\r
  intro?: boolean;\r
  enabled?: boolean;\r
  lightMode?: boolean;\r
  dpr?: number;\r
  children?: ReactNode;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
type Settings = {\r
  count: number;\r
  size: number;\r
  shape: number;\r
  color: string;\r
  accentColor: string;\r
  spread: number;\r
  speed: number;\r
  swirl: number;\r
  tail: number;\r
  trail: number;\r
  wander: number;\r
  depth: number;\r
  targets: string;\r
  idle: SwarmIdle;\r
  clickEffect: SwarmClickEffect;\r
  hideCursor: boolean;\r
  intro: boolean;\r
  enabled: boolean;\r
  lightMode: boolean;\r
  dpr?: number;\r
};\r
\r
type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };\r
\r
const MAX_PARTICLES = 2000;\r
const INTRO_SECONDS = 1.4;\r
const HIDDEN = 'swarm-cursor-hidden';\r
const SHAPES: Record<string, number> = { dot: 0, square: 1, streak: 2 };\r
const CELL = 16;\r
const MAX_COLS = 72;\r
const MAX_ROWS = 48;\r
const PRESSURE_STEPS = 12;\r
\r
const VERTEX = \`#version 300 es\r
layout(location = 0) in vec2 aCorner;\r
layout(location = 1) in vec4 aAgent;\r
layout(location = 2) in vec4 aLook;\r
layout(location = 3) in vec2 aExtra;\r
uniform vec2 uView;\r
out vec2 vLocal;\r
out vec2 vHalf;\r
out float vAlpha;\r
out float vTint;\r
out float vSoft;\r
out float vShape;\r
\r
void main() {\r
  vec2 dir = aAgent.zw;\r
  vec2 side = vec2(-dir.y, dir.x);\r
  vec2 extent = aLook.xy * 0.5;\r
  vec2 pad = extent + 1.0 + aExtra.x * 1.5;\r
  vec2 local = aCorner * pad;\r
  vec2 center = aAgent.xy - dir * (extent.x - extent.y);\r
  vec2 pos = center + dir * local.x + side * local.y;\r
  vLocal = local;\r
  vHalf = extent;\r
  vAlpha = aLook.z;\r
  vTint = aLook.w;\r
  vSoft = aExtra.x;\r
  vShape = aExtra.y;\r
  vec2 clip = pos / uView * 2.0 - 1.0;\r
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform vec3 uColor;\r
uniform vec3 uAccent;\r
uniform float uRatio;\r
in vec2 vLocal;\r
in vec2 vHalf;\r
in float vAlpha;\r
in float vTint;\r
in float vSoft;\r
in float vShape;\r
out vec4 outColor;\r
\r
void main() {\r
  float d;\r
  if (vShape > 0.5 && vShape < 1.5) {\r
    float corner = vHalf.y * 0.3;\r
    vec2 q = abs(vLocal) - vHalf + corner;\r
    d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - corner;\r
  } else {\r
    vec2 q = vLocal;\r
    q.x = max(abs(q.x) - (vHalf.x - vHalf.y), 0.0);\r
    d = length(q) - vHalf.y;\r
  }\r
  float edge = 0.6 / uRatio + vSoft;\r
  float cover = 1.0 - smoothstep(-edge, edge, d);\r
  float stretch = clamp(1.0 - vHalf.y / max(vHalf.x, 0.001), 0.0, 1.0);\r
  float head = clamp((vLocal.x + vHalf.x) / max(2.0 * vHalf.x, 0.001), 0.0, 1.0);\r
  cover *= mix(1.0, 0.12 + 0.88 * head * head, stretch);\r
  float alpha = cover * vAlpha;\r
  outColor = vec4(mix(uColor, uAccent, vTint) * alpha, alpha);\r
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
const random = (seed: number) => {\r
  let state = seed >>> 0 || 1;\r
  return () => {\r
    state ^= state << 13;\r
    state ^= state >>> 17;\r
    state ^= state << 5;\r
    return (state >>> 0) / 4294967296;\r
  };\r
};\r
\r
const rectField = (x: number, y: number, hx: number, hy: number, r: number, out: number[]) => {\r
  const sx = x < 0 ? -1 : 1;\r
  const sy = y < 0 ? -1 : 1;\r
  const qx = Math.abs(x) - (hx - r);\r
  const qy = Math.abs(y) - (hy - r);\r
  if (qx > 0 && qy > 0) {\r
    const l = Math.hypot(qx, qy) || 1;\r
    out[0] = l - r;\r
    out[1] = (qx / l) * sx;\r
    out[2] = (qy / l) * sy;\r
  } else if (qx > qy) {\r
    out[0] = qx - r;\r
    out[1] = sx;\r
    out[2] = 0;\r
  } else {\r
    out[0] = qy - r;\r
    out[1] = 0;\r
    out[2] = sy;\r
  }\r
  return out;\r
};\r
\r
const SwarmCursor = ({\r
  count = 800,\r
  size = 2.6,\r
  shape = 'dot',\r
  color,\r
  accentColor,\r
  spread = 90,\r
  speed = 1,\r
  swirl = 0.6,\r
  tail = 0.5,\r
  trail = 0.6,\r
  wander = 0.5,\r
  depth = 0.7,\r
  targets = 'a, button, [data-swarm-target]',\r
  idle = 'roam',\r
  clickEffect = 'burst',\r
  hideCursor = false,\r
  intro = true,\r
  enabled = true,\r
  lightMode = false,\r
  dpr,\r
  children,\r
  className = '',\r
  style,\r
  ...rest\r
}: SwarmCursorProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const ink = lightMode ? '#18181b' : '#ffffff';\r
  const settings: Settings = {\r
    count: Math.round(clamp(count, 1, MAX_PARTICLES)),\r
    size: clamp(size, 0.5, 16),\r
    shape: SHAPES[shape] ?? 0,\r
    color: color || ink,\r
    accentColor: accentColor || color || ink,\r
    spread: clamp(spread, 20, 400),\r
    speed: clamp(speed, 0, 4),\r
    swirl: clamp(swirl, 0, 1),\r
    tail: clamp(tail, 0, 1),\r
    trail: clamp(trail, 0, 3),\r
    wander: clamp(wander, 0, 2),\r
    depth: clamp(depth, 0, 1),\r
    targets,\r
    idle,\r
    clickEffect,\r
    hideCursor,\r
    intro,\r
    enabled,\r
    lightMode,\r
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
    const shader = link(gl);\r
    if (!shader) return undefined;\r
    const u = shader.uniforms;\r
\r
    const slots = MAX_PARTICLES + 1;\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    const cornerBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    const agentData = new Float32Array(slots * 4);\r
    const lookData = new Float32Array(slots * 4);\r
    const extraData = new Float32Array(slots * 2);\r
    const instanced = (location: number, width: number, data: Float32Array) => {\r
      const buffer = gl.createBuffer();\r
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, data.byteLength, gl.DYNAMIC_DRAW);\r
      gl.enableVertexAttribArray(location);\r
      gl.vertexAttribPointer(location, width, gl.FLOAT, false, 0, 0);\r
      gl.vertexAttribDivisor(location, 1);\r
      return buffer;\r
    };\r
    const agentBuffer = instanced(1, 4, agentData);\r
    const lookBuffer = instanced(2, 4, lookData);\r
    const extraBuffer = instanced(3, 2, extraData);\r
    gl.bindVertexArray(null);\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const colorCache = new Map<string, number[]>();\r
    const parse = (value: string): number[] => {\r
      const key = String(value);\r
      const cached = colorCache.get(key);\r
      if (cached) return cached;\r
      let rgb = [1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#000000';\r
        probe.fillStyle = key;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      colorCache.set(key, rgb);\r
      return rgb;\r
    };\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1, ratio: 1 };\r
    const px = new Float32Array(MAX_PARTICLES);\r
    const py = new Float32Array(MAX_PARTICLES);\r
    const pz = new Float32Array(MAX_PARTICLES);\r
    const vx = new Float32Array(MAX_PARTICLES);\r
    const vy = new Float32Array(MAX_PARTICLES);\r
    const vz = new Float32Array(MAX_PARTICLES);\r
    const home = new Float32Array(MAX_PARTICLES);\r
    const heft = new Float32Array(MAX_PARTICLES);\r
    const bob = new Float32Array(MAX_PARTICLES);\r
    const bobRate = new Float32Array(MAX_PARTICLES);\r
    const grain = new Float32Array(MAX_PARTICLES);\r
    const glint = new Float32Array(MAX_PARTICLES);\r
    const order = new Int32Array(MAX_PARTICLES);\r
    const field = [0, 0, 0];\r
    let cols = 1;\r
    let rows = 1;\r
    let cell = CELL;\r
    let flowX = new Float32Array(1);\r
    let flowY = new Float32Array(1);\r
    let lastX = new Float32Array(1);\r
    let lastY = new Float32Array(1);\r
    let pressure = new Float32Array(1);\r
    let divergence = new Float32Array(1);\r
    let curl = new Float32Array(1);\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const anchor = { x: 0, y: 0, lastX: 0, lastY: 0, moveX: 0, moveY: 0 };\r
    const ring = { active: false, x: 0, y: 0, hx: 0, hy: 0, corner: 0, spin: 1 };\r
    const burst = { age: 10 };\r
    const ping = { age: 10, x: 0, y: 0 };\r
    let hovered: Element | null = null;\r
    let time = 0;\r
    let presence = 1;\r
    let introClock = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let seeded = false;\r
    let hidden = false;\r
    let sorted = 0;\r
\r
    const setHidden = (value: boolean) => {\r
      if (value === hidden) return;\r
      hidden = value;\r
      container.classList.toggle(HIDDEN, value);\r
    };\r
\r
    const allocate = () => {\r
      const nextCols = clamp(Math.round(view.width / CELL), 8, MAX_COLS);\r
      const nextRows = clamp(Math.round(view.height / CELL), 8, MAX_ROWS);\r
      cell = Math.max(view.width / nextCols, view.height / nextRows);\r
      if (nextCols === cols && nextRows === rows) return;\r
      cols = nextCols;\r
      rows = nextRows;\r
      const total = cols * rows;\r
      flowX = new Float32Array(total);\r
      flowY = new Float32Array(total);\r
      lastX = new Float32Array(total);\r
      lastY = new Float32Array(total);\r
      pressure = new Float32Array(total);\r
      divergence = new Float32Array(total);\r
      curl = new Float32Array(total);\r
    };\r
\r
    const sample = (values: Float32Array, x: number, y: number) => {\r
      let gx = x / cell - 0.5;\r
      let gy = y / cell - 0.5;\r
      if (gx < 0) gx = 0;\r
      else if (gx > cols - 1.001) gx = cols - 1.001;\r
      if (gy < 0) gy = 0;\r
      else if (gy > rows - 1.001) gy = rows - 1.001;\r
      const i = gx | 0;\r
      const j = gy | 0;\r
      const fx = gx - i;\r
      const fy = gy - j;\r
      const k = i + j * cols;\r
      return (\r
        (values[k] * (1 - fx) + values[k + 1] * fx) * (1 - fy) +\r
        (values[k + cols] * (1 - fx) + values[k + cols + 1] * fx) * fy\r
      );\r
    };\r
\r
    const walls = (values: Float32Array, axis: number) => {\r
      for (let j = 1; j < rows - 1; j++) {\r
        const left = j * cols;\r
        const right = left + cols - 1;\r
        values[left] = axis === 1 ? -values[left + 1] : values[left + 1];\r
        values[right] = axis === 1 ? -values[right - 1] : values[right - 1];\r
      }\r
      for (let i = 1; i < cols - 1; i++) {\r
        const bottom = i + (rows - 1) * cols;\r
        values[i] = axis === 2 ? -values[i + cols] : values[i + cols];\r
        values[bottom] = axis === 2 ? -values[bottom - cols] : values[bottom - cols];\r
      }\r
      values[0] = 0.5 * (values[1] + values[cols]);\r
      values[cols - 1] = 0.5 * (values[cols - 2] + values[2 * cols - 1]);\r
      values[(rows - 1) * cols] = 0.5 * (values[(rows - 2) * cols] + values[(rows - 1) * cols + 1]);\r
      values[rows * cols - 1] = 0.5 * (values[rows * cols - 2] + values[(rows - 1) * cols - 1]);\r
    };\r
\r
    const stir = (s: Settings, dt: number, ease: number) => {\r
      const radius = s.spread;\r
      const reach = radius * 2.2;\r
      const i0 = Math.max(1, Math.floor((anchor.x - reach) / cell));\r
      const i1 = Math.min(cols - 2, Math.ceil((anchor.x + reach) / cell));\r
      const j0 = Math.max(1, Math.floor((anchor.y - reach) / cell));\r
      const j1 = Math.min(rows - 2, Math.ceil((anchor.y + reach) / cell));\r
      const inv = 1 / (radius * radius * 0.55);\r
      const moving = Math.hypot(anchor.moveX, anchor.moveY);\r
      const grab = (1 - Math.exp(-dt * 20)) * clamp(moving / 240, 0, 1) * presence;\r
      const whirl = ring.active ? 0 : radius * (0.5 + 4 * (1 - ease)) * (0.35 + 0.65 * s.speed);\r
      const churn = s.wander * radius * 14 * (0.4 + 0.6 * s.speed);\r
      const fk = 1.4 / radius;\r
      const ft = time * 0.75 * (0.4 + 0.6 * s.speed);\r
      for (let j = j0; j <= j1; j++) {\r
        for (let i = i0; i <= i1; i++) {\r
          const k = i + j * cols;\r
          const x = (i + 0.5) * cell;\r
          const y = (j + 0.5) * cell;\r
          const rx = x - anchor.x;\r
          const ry = y - anchor.y;\r
          const d2 = rx * rx + ry * ry;\r
          const w = Math.exp(-d2 * inv);\r
          if (w < 0.003) continue;\r
          const d = Math.sqrt(d2) + 0.001;\r
          flowX[k] += (anchor.moveX - flowX[k]) * w * grab;\r
          flowY[k] += (anchor.moveY - flowY[k]) * w * grab;\r
          const reachOut = Math.min(1, d / (radius * 0.45));\r
          flowX[k] += (-ry / d) * whirl * reachOut * w * dt;\r
          flowY[k] += (rx / d) * whirl * reachOut * w * dt;\r
          const a1 = x * fk + ft;\r
          const b1 = y * fk * 1.1 - ft * 0.8;\r
          const a2 = y * fk * 1.7 + ft * 1.2 + 1.3;\r
          const b2 = x * fk * 1.3 - 0.7;\r
          const curlX = -Math.sin(a1) * Math.sin(b1) * 1.1 + 1.02 * Math.cos(a2) * Math.cos(b2);\r
          const curlY = -(Math.cos(a1) * Math.cos(b1) - 0.78 * Math.sin(a2) * Math.sin(b2));\r
          flowX[k] += curlX * churn * w * dt;\r
          flowY[k] += curlY * churn * w * dt;\r
        }\r
      }\r
      if (!ring.active) return;\r
      const band = Math.max(4, radius * 0.16);\r
      const margin = band + 24;\r
      const circulate = 230 * (0.4 + 0.6 * s.speed) * ring.spin;\r
      const r0 = Math.max(1, Math.floor((ring.x - ring.hx - margin) / cell));\r
      const r1 = Math.min(cols - 2, Math.ceil((ring.x + ring.hx + margin) / cell));\r
      const c0 = Math.max(1, Math.floor((ring.y - ring.hy - margin) / cell));\r
      const c1 = Math.min(rows - 2, Math.ceil((ring.y + ring.hy + margin) / cell));\r
      const rate = 1 - Math.exp(-dt * 6);\r
      for (let j = c0; j <= c1; j++) {\r
        for (let i = r0; i <= r1; i++) {\r
          const k = i + j * cols;\r
          rectField((i + 0.5) * cell - ring.x, (j + 0.5) * cell - ring.y, ring.hx, ring.hy, ring.corner, field);\r
          const off = field[0] - (5 + band * 0.5);\r
          const w = Math.exp(-(off * off) / (margin * margin * 0.35));\r
          if (w < 0.01) continue;\r
          flowX[k] += (-field[2] * circulate - flowX[k]) * w * rate;\r
          flowY[k] += (field[1] * circulate - flowY[k]) * w * rate;\r
        }\r
      }\r
    };\r
\r
    const flow = (s: Settings, dt: number) => {\r
      const total = cols * rows;\r
      for (let j = 1; j < rows - 1; j++) {\r
        for (let i = 1; i < cols - 1; i++) {\r
          const k = i + j * cols;\r
          curl[k] = (flowY[k + 1] - flowY[k - 1] - flowX[k + cols] + flowX[k - cols]) * (0.5 / cell);\r
        }\r
      }\r
      const confine = s.swirl * cell * 9;\r
      for (let j = 2; j < rows - 2; j++) {\r
        for (let i = 2; i < cols - 2; i++) {\r
          const k = i + j * cols;\r
          const gx = Math.abs(curl[k + 1]) - Math.abs(curl[k - 1]);\r
          const gy = Math.abs(curl[k + cols]) - Math.abs(curl[k - cols]);\r
          const len = Math.hypot(gx, gy) + 1e-5;\r
          flowX[k] += (gy / len) * curl[k] * confine * dt;\r
          flowY[k] -= (gx / len) * curl[k] * confine * dt;\r
        }\r
      }\r
      lastX.set(flowX);\r
      lastY.set(flowY);\r
      const back = dt / cell;\r
      const fade = Math.exp(-dt / (0.35 + 1.5 * s.swirl));\r
      for (let j = 1; j < rows - 1; j++) {\r
        for (let i = 1; i < cols - 1; i++) {\r
          const k = i + j * cols;\r
          let x = i - back * lastX[k];\r
          let y = j - back * lastY[k];\r
          if (x < 0.5) x = 0.5;\r
          else if (x > cols - 1.5) x = cols - 1.5;\r
          if (y < 0.5) y = 0.5;\r
          else if (y > rows - 1.5) y = rows - 1.5;\r
          const i0 = x | 0;\r
          const j0 = y | 0;\r
          const fx = x - i0;\r
          const fy = y - j0;\r
          const a = i0 + j0 * cols;\r
          flowX[k] =\r
            ((lastX[a] * (1 - fx) + lastX[a + 1] * fx) * (1 - fy) +\r
              (lastX[a + cols] * (1 - fx) + lastX[a + cols + 1] * fx) * fy) *\r
            fade;\r
          flowY[k] =\r
            ((lastY[a] * (1 - fx) + lastY[a + 1] * fx) * (1 - fy) +\r
              (lastY[a + cols] * (1 - fx) + lastY[a + cols + 1] * fx) * fy) *\r
            fade;\r
        }\r
      }\r
      walls(flowX, 1);\r
      walls(flowY, 2);\r
      const h2 = cell * cell;\r
      for (let j = 1; j < rows - 1; j++) {\r
        for (let i = 1; i < cols - 1; i++) {\r
          const k = i + j * cols;\r
          divergence[k] = (flowX[k + 1] - flowX[k - 1] + flowY[k + cols] - flowY[k - cols]) * (0.5 / cell);\r
        }\r
      }\r
      pressure.fill(0, 0, total);\r
      walls(divergence, 0);\r
      for (let step = 0; step < PRESSURE_STEPS; step++) {\r
        for (let j = 1; j < rows - 1; j++) {\r
          for (let i = 1; i < cols - 1; i++) {\r
            const k = i + j * cols;\r
            pressure[k] =\r
              (pressure[k - 1] + pressure[k + 1] + pressure[k - cols] + pressure[k + cols] - h2 * divergence[k]) * 0.25;\r
          }\r
        }\r
        walls(pressure, 0);\r
      }\r
      for (let j = 1; j < rows - 1; j++) {\r
        for (let i = 1; i < cols - 1; i++) {\r
          const k = i + j * cols;\r
          flowX[k] -= (pressure[k + 1] - pressure[k - 1]) * (0.5 / cell);\r
          flowY[k] -= (pressure[k + cols] - pressure[k - cols]) * (0.5 / cell);\r
        }\r
      }\r
      walls(flowX, 1);\r
      walls(flowY, 2);\r
    };\r
\r
    const crowd = new Int32Array(MAX_PARTICLES);\r
    let crowdHeads = new Int32Array(1);\r
    let crowdRows = 1;\r
    const push = (n: number, h: number) => {\r
      const gc = Math.max(1, Math.ceil(view.width / h) + 2);\r
      const gr = Math.max(1, Math.ceil(view.height / h) + 2);\r
      if (crowdHeads.length < gc * gr) crowdHeads = new Int32Array(gc * gr);\r
      crowdHeads.fill(-1, 0, gc * gr);\r
      crowdRows = gr;\r
      for (let i = 0; i < n; i++) {\r
        const cx = clamp(Math.floor(px[i] / h) + 1, 0, gc - 1);\r
        const cy = clamp(Math.floor(py[i] / h) + 1, 0, gr - 1);\r
        const key = cy * gc + cx;\r
        crowd[i] = crowdHeads[key];\r
        crowdHeads[key] = i;\r
      }\r
      return gc;\r
    };\r
\r
    const move = (s: Settings, dt: number, ease: number) => {\r
      const n = s.count;\r
      const radius = s.spread;\r
      const loose = 1 - 0.6 * s.tail;\r
      const gather = 12 * loose * (0.2 + 0.8 * ease);\r
      const pull = 30 * loose * (0.2 + 0.8 * ease);\r
      const band = Math.max(4, radius * 0.16);\r
      const w = view.width;\r
      const h = view.height;\r
      const gap = radius * Math.sqrt(Math.PI / Math.max(n, 1)) * 1.6;\r
      const repel = 4000;\r
      const gc = push(n, gap);\r
      for (let i = 0; i < n; i++) {\r
        const x = px[i];\r
        const y = py[i];\r
        const k = 10 * (1 - 0.6 * s.tail * heft[i]);\r
        let ax = (sample(flowX, x, y) - vx[i]) * k;\r
        let ay = (sample(flowY, x, y) - vy[i]) * k;\r
        const cx = clamp(Math.floor(x / gap) + 1, 0, gc - 1);\r
        const cy = clamp(Math.floor(y / gap) + 1, 0, crowdRows - 1);\r
        for (let oy = -1; oy <= 1; oy++) {\r
          const row = cy + oy;\r
          if (row < 0 || row >= crowdRows) continue;\r
          for (let ox = -1; ox <= 1; ox++) {\r
            const col = cx + ox;\r
            if (col < 0 || col >= gc) continue;\r
            for (let j = crowdHeads[row * gc + col]; j !== -1; j = crowd[j]) {\r
              if (j === i) continue;\r
              const dx = x - px[j];\r
              const dy = y - py[j];\r
              const d2 = dx * dx + dy * dy;\r
              if (d2 >= gap * gap || d2 < 1e-6) continue;\r
              const d = Math.sqrt(d2);\r
              const q = 1 - d / gap;\r
              ax += (dx / d) * q * q * repel;\r
              ay += (dy / d) * q * q * repel;\r
            }\r
          }\r
        }\r
        if (ring.active) {\r
          rectField(x - ring.x, y - ring.y, ring.hx, ring.hy, ring.corner, field);\r
          const e = field[0] - (5 + band * home[i] * home[i]);\r
          const hold = e > 0 ? 70 : 140;\r
          ax -= field[1] * e * hold;\r
          ay -= field[2] * e * hold;\r
        } else {\r
          const dx = anchor.x - x;\r
          const dy = anchor.y - y;\r
          const d = Math.hypot(dx, dy) + 0.001;\r
          const over = Math.max(0, d - radius);\r
          ax += (dx / d) * (d * gather + over * pull);\r
          ay += (dy / d) * (d * gather + over * pull);\r
        }\r
        if (introClock >= 1) {\r
          if (x < 8) ax += (8 - x) * 30;\r
          else if (x > w - 8) ax -= (x - w + 8) * 30;\r
          if (y < 8) ay += (8 - y) * 30;\r
          else if (y > h - 8) ay -= (y - h + 8) * 30;\r
        }\r
        const lift = Math.sin(time * bobRate[i] + bob[i]) * radius * (ring.active ? 0.15 : 0.55);\r
        const az = (lift - pz[i]) * 36 - vz[i] * 9;\r
        vx[i] += ax * dt;\r
        vy[i] += ay * dt;\r
        vz[i] += az * dt;\r
        px[i] += vx[i] * dt;\r
        py[i] += vy[i] * dt;\r
        pz[i] += vz[i] * dt;\r
      }\r
    };\r
\r
    const seed = () => {\r
      const rand = random(7);\r
      for (let i = 0; i < MAX_PARTICLES; i++) {\r
        home[i] = 0.08 + 0.92 * Math.sqrt(rand());\r
        heft[i] = rand() * rand();\r
        bob[i] = rand() * Math.PI * 2;\r
        bobRate[i] = 0.5 + rand() * 1.1;\r
        grain[i] = 0.55 + rand() * 0.9;\r
        glint[i] = rand() * 100;\r
      }\r
      seeded = true;\r
    };\r
\r
    const place = (gathered: boolean) => {\r
      const s = settingsRef.current;\r
      const rand = random(11);\r
      const reachOut = Math.hypot(view.width, view.height) * 0.5;\r
      for (let i = 0; i < MAX_PARTICLES; i++) {\r
        const a = rand() * Math.PI * 2;\r
        const r = gathered ? home[i] * s.spread : (0.35 + 0.65 * Math.sqrt(rand())) * reachOut;\r
        px[i] = anchor.x + Math.cos(a) * r;\r
        py[i] = anchor.y + Math.sin(a) * r;\r
        pz[i] = Math.sin(bob[i]) * s.spread * 0.55;\r
        vx[i] = 0;\r
        vy[i] = 0;\r
        vz[i] = 0;\r
      }\r
    };\r
\r
    const findTarget = () => {\r
      const s = settingsRef.current;\r
      if (!s.targets || !pointer.inside) return null;\r
      const rect = container.getBoundingClientRect();\r
      const element = document.elementFromPoint(rect.left + pointer.x, rect.top + pointer.y);\r
      if (!element || !container.contains(element)) return null;\r
      let match: Element | null = null;\r
      try {\r
        match = element.closest(s.targets);\r
      } catch {\r
        match = null;\r
      }\r
      return match && container.contains(match) ? match : null;\r
    };\r
\r
    const updateAnchor = (s: Settings, dt: number) => {\r
      const w = view.width;\r
      const h = view.height;\r
      if (hovered && hovered.isConnected) {\r
        const box = hovered.getBoundingClientRect();\r
        const frame = container.getBoundingClientRect();\r
        const radius = parseFloat(getComputedStyle(hovered).borderTopLeftRadius) || 0;\r
        ring.x = box.left - frame.left + box.width / 2;\r
        ring.y = box.top - frame.top + box.height / 2;\r
        ring.hx = box.width / 2;\r
        ring.hy = box.height / 2;\r
        ring.corner = Math.min(radius, ring.hx, ring.hy);\r
        if (!ring.active) {\r
          let turning = 0;\r
          for (let i = 0; i < s.count; i++) turning += (px[i] - ring.x) * vy[i] - (py[i] - ring.y) * vx[i];\r
          ring.spin = turning < 0 ? -1 : 1;\r
        }\r
        ring.active = true;\r
      } else {\r
        ring.active = false;\r
      }\r
      let goal = 1;\r
      if (pointer.inside) {\r
        anchor.x = pointer.x;\r
        anchor.y = pointer.y;\r
      } else if (s.idle === 'gather') {\r
        anchor.x = w * 0.5;\r
        anchor.y = h * 0.5;\r
      } else if (s.idle === 'hide') {\r
        goal = 0;\r
      } else {\r
        anchor.x = w * (0.5 + 0.3 * Math.sin(time * 0.21) + 0.06 * Math.sin(time * 0.53 + 1.7));\r
        anchor.y = h * (0.5 + 0.24 * Math.sin(time * 0.29 + 0.8) + 0.05 * Math.sin(time * 0.71));\r
      }\r
      if (dt > 0) {\r
        const moveX = clamp((anchor.x - anchor.lastX) / dt, -4000, 4000);\r
        const moveY = clamp((anchor.y - anchor.lastY) / dt, -4000, 4000);\r
        const blend = 1 - Math.exp(-dt * 30);\r
        anchor.moveX += (moveX - anchor.moveX) * blend;\r
        anchor.moveY += (moveY - anchor.moveY) * blend;\r
      }\r
      anchor.lastX = anchor.x;\r
      anchor.lastY = anchor.y;\r
      presence += (goal - presence) * (1 - Math.exp(-dt / 0.25));\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      const n = s.count;\r
      const fade = introClock * introClock * (3 - 2 * introClock) * presence;\r
      const zr = Math.max(s.spread * 0.55, 10);\r
      if (sorted !== n) {\r
        for (let a = 0; a < n; a++) order[a] = a;\r
        sorted = n;\r
      }\r
      for (let a = 1; a < n; a++) {\r
        const value = order[a];\r
        const key = pz[value];\r
        let b = a - 1;\r
        while (b >= 0 && pz[order[b]] > key) {\r
          order[b + 1] = order[b];\r
          b--;\r
        }\r
        order[b + 1] = value;\r
      }\r
      const flash = burst.age < 1.2 ? Math.exp(-burst.age / 0.3) : 0;\r
      const front = ping.age * 520;\r
      let written = 0;\r
      for (let a = 0; a < n; a++) {\r
        const i = order[a];\r
        const near = clamp(pz[i] / zr, -1, 1);\r
        const scale = 1 + s.depth * 0.6 * near;\r
        const body = s.size * grain[i] * scale;\r
        const soft = s.depth * s.size * (s.lightMode ? 0.35 : 1.4) * Math.pow(Math.abs(near), 1.6);\r
        const flat = Math.hypot(vx[i], vy[i]);\r
        const dx = flat > 0.001 ? vx[i] / flat : 1;\r
        const dy = flat > 0.001 ? vy[i] / flat : 0;\r
        let wave = 0;\r
        if (ping.age < 1.6) {\r
          const offset = (Math.hypot(px[i] - ping.x, py[i] - ping.y) - front) / 40;\r
          wave = Math.exp(-offset * offset) * (1 - ping.age / 1.6);\r
        }\r
        const tint = Math.max(clamp((flat - 380) / 900, 0, 1), flash, wave);\r
        const width = body * (1 + wave * 0.8);\r
        let length = width + Math.min(flat * s.trail * 0.02, body * 14);\r
        if (s.shape === 2) length = width * 2.6 + Math.min(flat * s.trail * 0.03, body * 18);\r
        const twinkle = 0.86 + 0.14 * Math.sin(time * 3.1 + glint[i]);\r
        const dim = 1 - s.depth * 0.45 * Math.max(0, -near);\r
        const o = written * 4;\r
        agentData[o] = px[i];\r
        agentData[o + 1] = py[i];\r
        agentData[o + 2] = dx;\r
        agentData[o + 3] = dy;\r
        lookData[o] = length;\r
        lookData[o + 1] = width;\r
        lookData[o + 2] = clamp(0.95 * dim * (body / (body + soft)) * twinkle * (1 + wave * 0.4), 0, 1) * fade;\r
        lookData[o + 3] = tint;\r
        extraData[written * 2] = soft;\r
        extraData[written * 2 + 1] = s.shape;\r
        written++;\r
      }\r
      if (s.hideCursor && pointer.inside) {\r
        const o = written * 4;\r
        agentData[o] = pointer.x;\r
        agentData[o + 1] = pointer.y;\r
        agentData[o + 2] = 1;\r
        agentData[o + 3] = 0;\r
        lookData[o] = 6;\r
        lookData[o + 1] = 6;\r
        lookData[o + 2] = 1;\r
        lookData[o + 3] = 0;\r
        extraData[written * 2] = 0;\r
        extraData[written * 2 + 1] = 0;\r
        written++;\r
      }\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      if (!s.enabled || !written) return;\r
      gl.useProgram(shader.program);\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      gl.bindVertexArray(vao);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, agentBuffer);\r
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, agentData, 0, written * 4);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, lookBuffer);\r
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, lookData, 0, written * 4);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, extraBuffer);\r
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, extraData, 0, written * 2);\r
      gl.uniform2f(u.uView, view.width, view.height);\r
      gl.uniform3fv(u.uColor, parse(s.color));\r
      gl.uniform3fv(u.uAccent, parse(s.accentColor));\r
      gl.uniform1f(u.uRatio, view.ratio);\r
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, written);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      view.width = Math.max(1, container.clientWidth);\r
      view.height = Math.max(1, container.clientHeight);\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(view.width * view.ratio));\r
      canvas.height = Math.max(1, Math.round(view.height * view.ratio));\r
      allocate();\r
      if (!seeded) {\r
        seed();\r
        updateAnchor(s, 0);\r
        if (reduce) {\r
          anchor.x = view.width / 2;\r
          anchor.y = view.height / 2;\r
        }\r
        anchor.lastX = anchor.x;\r
        anchor.lastY = anchor.y;\r
        place(introClock >= 1);\r
      }\r
      draw();\r
      wake();\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.001, 1 / 30) : 1 / 60;\r
      last = now;\r
      if (!s.enabled || reduce) {\r
        setHidden(false);\r
        draw();\r
        return;\r
      }\r
      time += dt;\r
      burst.age += dt;\r
      ping.age += dt;\r
      if (introClock < 1) introClock = Math.min(1, introClock + dt / INTRO_SECONDS);\r
      const ease = introClock * introClock * (3 - 2 * introClock);\r
      hovered = findTarget();\r
      updateAnchor(s, dt);\r
      setHidden(s.hideCursor && pointer.inside);\r
      stir(s, dt, ease);\r
      flow(s, dt);\r
      move(s, dt / 2, ease);\r
      move(s, dt / 2, ease);\r
      draw();\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    function wake() {\r
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    }\r
\r
    const locate = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const { x, y, inside } = locate(event);\r
      pointer.x = x;\r
      pointer.y = y;\r
      pointer.inside = inside;\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      const { x, y, inside } = locate(event);\r
      if (!inside || !s.enabled || reduce || s.clickEffect === 'none') return;\r
      const reachOut = s.spread * 2.2;\r
      if (s.clickEffect === 'pulse') {\r
        ping.x = x;\r
        ping.y = y;\r
        ping.age = 0;\r
      } else {\r
        burst.age = 0;\r
      }\r
      const kick = s.clickEffect === 'pulse' ? 160 : 780;\r
      for (let i = 0; i < s.count; i++) {\r
        const dx = px[i] - x;\r
        const dy = py[i] - y;\r
        const d = Math.hypot(dx, dy) || 1;\r
        if (d > reachOut) continue;\r
        const k = (1 - d / reachOut) * kick * (0.6 + 0.4 * grain[i]);\r
        vx[i] += (dx / d) * k;\r
        vy[i] += (dy / d) * k;\r
      }\r
      if (s.clickEffect === 'pulse') return;\r
      const twist = 520 * (time % 2 < 1 ? 1 : -1);\r
      const inv = 1 / (s.spread * s.spread);\r
      for (let j = 1; j < rows - 1; j++) {\r
        for (let i = 1; i < cols - 1; i++) {\r
          const k = i + j * cols;\r
          const rx = (i + 0.5) * cell - x;\r
          const ry = (j + 0.5) * cell - y;\r
          const d2 = rx * rx + ry * ry;\r
          const w = (Math.sqrt(d2) / s.spread) * Math.exp(-d2 * inv);\r
          if (w < 0.003) continue;\r
          const d = Math.sqrt(d2) + 0.001;\r
          flowX[k] += (-ry / d) * twist * w;\r
          flowY[k] += (rx / d) * twist * w;\r
        }\r
      }\r
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
    wakeRef.current = wake;\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      setHidden(false);\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('pointerup', onPointerUp);\r
      window.removeEventListener('pointercancel', onPointerUp);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteBuffer(cornerBuffer);\r
      gl.deleteBuffer(agentBuffer);\r
      gl.deleteBuffer(lookBuffer);\r
      gl.deleteBuffer(extraBuffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(shader.program);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div ref={containerRef} className={\`swarm-cursor\${className ? \` \${className}\` : ''}\`} style={style} {...rest}>\r
      <style>{\`.\${HIDDEN}, .\${HIDDEN} * { cursor: none !important; }\`}</style>\r
      <canvas ref={canvasRef} className="swarm-cursor-canvas" aria-hidden="true" />\r
      {children ? <div className="swarm-cursor-content">{children}</div> : null}\r
    </div>\r
  );\r
};\r
\r
export default SwarmCursor;\r
`,o=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';\r
\r
export type SwarmShape = 'dot' | 'streak' | 'square';\r
export type SwarmIdle = 'roam' | 'gather' | 'hide';\r
export type SwarmClickEffect = 'burst' | 'pulse' | 'none';\r
\r
export interface SwarmCursorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'color'> {\r
  count?: number;\r
  size?: number;\r
  shape?: SwarmShape;\r
  color?: string;\r
  accentColor?: string;\r
  spread?: number;\r
  speed?: number;\r
  swirl?: number;\r
  tail?: number;\r
  trail?: number;\r
  wander?: number;\r
  depth?: number;\r
  targets?: string;\r
  idle?: SwarmIdle;\r
  clickEffect?: SwarmClickEffect;\r
  hideCursor?: boolean;\r
  intro?: boolean;\r
  enabled?: boolean;\r
  lightMode?: boolean;\r
  dpr?: number;\r
  children?: ReactNode;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
type Settings = {\r
  count: number;\r
  size: number;\r
  shape: number;\r
  color: string;\r
  accentColor: string;\r
  spread: number;\r
  speed: number;\r
  swirl: number;\r
  tail: number;\r
  trail: number;\r
  wander: number;\r
  depth: number;\r
  targets: string;\r
  idle: SwarmIdle;\r
  clickEffect: SwarmClickEffect;\r
  hideCursor: boolean;\r
  intro: boolean;\r
  enabled: boolean;\r
  lightMode: boolean;\r
  dpr?: number;\r
};\r
\r
type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };\r
\r
const MAX_PARTICLES = 2000;\r
const INTRO_SECONDS = 1.4;\r
const HIDDEN = 'swarm-cursor-hidden';\r
const SHAPES: Record<string, number> = { dot: 0, square: 1, streak: 2 };\r
const CELL = 16;\r
const MAX_COLS = 72;\r
const MAX_ROWS = 48;\r
const PRESSURE_STEPS = 12;\r
\r
const VERTEX = \`#version 300 es\r
layout(location = 0) in vec2 aCorner;\r
layout(location = 1) in vec4 aAgent;\r
layout(location = 2) in vec4 aLook;\r
layout(location = 3) in vec2 aExtra;\r
uniform vec2 uView;\r
out vec2 vLocal;\r
out vec2 vHalf;\r
out float vAlpha;\r
out float vTint;\r
out float vSoft;\r
out float vShape;\r
\r
void main() {\r
  vec2 dir = aAgent.zw;\r
  vec2 side = vec2(-dir.y, dir.x);\r
  vec2 extent = aLook.xy * 0.5;\r
  vec2 pad = extent + 1.0 + aExtra.x * 1.5;\r
  vec2 local = aCorner * pad;\r
  vec2 center = aAgent.xy - dir * (extent.x - extent.y);\r
  vec2 pos = center + dir * local.x + side * local.y;\r
  vLocal = local;\r
  vHalf = extent;\r
  vAlpha = aLook.z;\r
  vTint = aLook.w;\r
  vSoft = aExtra.x;\r
  vShape = aExtra.y;\r
  vec2 clip = pos / uView * 2.0 - 1.0;\r
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform vec3 uColor;\r
uniform vec3 uAccent;\r
uniform float uRatio;\r
in vec2 vLocal;\r
in vec2 vHalf;\r
in float vAlpha;\r
in float vTint;\r
in float vSoft;\r
in float vShape;\r
out vec4 outColor;\r
\r
void main() {\r
  float d;\r
  if (vShape > 0.5 && vShape < 1.5) {\r
    float corner = vHalf.y * 0.3;\r
    vec2 q = abs(vLocal) - vHalf + corner;\r
    d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - corner;\r
  } else {\r
    vec2 q = vLocal;\r
    q.x = max(abs(q.x) - (vHalf.x - vHalf.y), 0.0);\r
    d = length(q) - vHalf.y;\r
  }\r
  float edge = 0.6 / uRatio + vSoft;\r
  float cover = 1.0 - smoothstep(-edge, edge, d);\r
  float stretch = clamp(1.0 - vHalf.y / max(vHalf.x, 0.001), 0.0, 1.0);\r
  float head = clamp((vLocal.x + vHalf.x) / max(2.0 * vHalf.x, 0.001), 0.0, 1.0);\r
  cover *= mix(1.0, 0.12 + 0.88 * head * head, stretch);\r
  float alpha = cover * vAlpha;\r
  outColor = vec4(mix(uColor, uAccent, vTint) * alpha, alpha);\r
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
const random = (seed: number) => {\r
  let state = seed >>> 0 || 1;\r
  return () => {\r
    state ^= state << 13;\r
    state ^= state >>> 17;\r
    state ^= state << 5;\r
    return (state >>> 0) / 4294967296;\r
  };\r
};\r
\r
const rectField = (x: number, y: number, hx: number, hy: number, r: number, out: number[]) => {\r
  const sx = x < 0 ? -1 : 1;\r
  const sy = y < 0 ? -1 : 1;\r
  const qx = Math.abs(x) - (hx - r);\r
  const qy = Math.abs(y) - (hy - r);\r
  if (qx > 0 && qy > 0) {\r
    const l = Math.hypot(qx, qy) || 1;\r
    out[0] = l - r;\r
    out[1] = (qx / l) * sx;\r
    out[2] = (qy / l) * sy;\r
  } else if (qx > qy) {\r
    out[0] = qx - r;\r
    out[1] = sx;\r
    out[2] = 0;\r
  } else {\r
    out[0] = qy - r;\r
    out[1] = 0;\r
    out[2] = sy;\r
  }\r
  return out;\r
};\r
\r
const SwarmCursor = ({\r
  count = 800,\r
  size = 2.6,\r
  shape = 'dot',\r
  color,\r
  accentColor,\r
  spread = 90,\r
  speed = 1,\r
  swirl = 0.6,\r
  tail = 0.5,\r
  trail = 0.6,\r
  wander = 0.5,\r
  depth = 0.7,\r
  targets = 'a, button, [data-swarm-target]',\r
  idle = 'roam',\r
  clickEffect = 'burst',\r
  hideCursor = false,\r
  intro = true,\r
  enabled = true,\r
  lightMode = false,\r
  dpr,\r
  children,\r
  className = '',\r
  style,\r
  ...rest\r
}: SwarmCursorProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const ink = lightMode ? '#18181b' : '#ffffff';\r
  const settings: Settings = {\r
    count: Math.round(clamp(count, 1, MAX_PARTICLES)),\r
    size: clamp(size, 0.5, 16),\r
    shape: SHAPES[shape] ?? 0,\r
    color: color || ink,\r
    accentColor: accentColor || color || ink,\r
    spread: clamp(spread, 20, 400),\r
    speed: clamp(speed, 0, 4),\r
    swirl: clamp(swirl, 0, 1),\r
    tail: clamp(tail, 0, 1),\r
    trail: clamp(trail, 0, 3),\r
    wander: clamp(wander, 0, 2),\r
    depth: clamp(depth, 0, 1),\r
    targets,\r
    idle,\r
    clickEffect,\r
    hideCursor,\r
    intro,\r
    enabled,\r
    lightMode,\r
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
    const shader = link(gl);\r
    if (!shader) return undefined;\r
    const u = shader.uniforms;\r
\r
    const slots = MAX_PARTICLES + 1;\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    const cornerBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    const agentData = new Float32Array(slots * 4);\r
    const lookData = new Float32Array(slots * 4);\r
    const extraData = new Float32Array(slots * 2);\r
    const instanced = (location: number, width: number, data: Float32Array) => {\r
      const buffer = gl.createBuffer();\r
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, data.byteLength, gl.DYNAMIC_DRAW);\r
      gl.enableVertexAttribArray(location);\r
      gl.vertexAttribPointer(location, width, gl.FLOAT, false, 0, 0);\r
      gl.vertexAttribDivisor(location, 1);\r
      return buffer;\r
    };\r
    const agentBuffer = instanced(1, 4, agentData);\r
    const lookBuffer = instanced(2, 4, lookData);\r
    const extraBuffer = instanced(3, 2, extraData);\r
    gl.bindVertexArray(null);\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const colorCache = new Map<string, number[]>();\r
    const parse = (value: string): number[] => {\r
      const key = String(value);\r
      const cached = colorCache.get(key);\r
      if (cached) return cached;\r
      let rgb = [1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#000000';\r
        probe.fillStyle = key;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      colorCache.set(key, rgb);\r
      return rgb;\r
    };\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1, ratio: 1 };\r
    const px = new Float32Array(MAX_PARTICLES);\r
    const py = new Float32Array(MAX_PARTICLES);\r
    const pz = new Float32Array(MAX_PARTICLES);\r
    const vx = new Float32Array(MAX_PARTICLES);\r
    const vy = new Float32Array(MAX_PARTICLES);\r
    const vz = new Float32Array(MAX_PARTICLES);\r
    const home = new Float32Array(MAX_PARTICLES);\r
    const heft = new Float32Array(MAX_PARTICLES);\r
    const bob = new Float32Array(MAX_PARTICLES);\r
    const bobRate = new Float32Array(MAX_PARTICLES);\r
    const grain = new Float32Array(MAX_PARTICLES);\r
    const glint = new Float32Array(MAX_PARTICLES);\r
    const order = new Int32Array(MAX_PARTICLES);\r
    const field = [0, 0, 0];\r
    let cols = 1;\r
    let rows = 1;\r
    let cell = CELL;\r
    let flowX = new Float32Array(1);\r
    let flowY = new Float32Array(1);\r
    let lastX = new Float32Array(1);\r
    let lastY = new Float32Array(1);\r
    let pressure = new Float32Array(1);\r
    let divergence = new Float32Array(1);\r
    let curl = new Float32Array(1);\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const anchor = { x: 0, y: 0, lastX: 0, lastY: 0, moveX: 0, moveY: 0 };\r
    const ring = { active: false, x: 0, y: 0, hx: 0, hy: 0, corner: 0, spin: 1 };\r
    const burst = { age: 10 };\r
    const ping = { age: 10, x: 0, y: 0 };\r
    let hovered: Element | null = null;\r
    let time = 0;\r
    let presence = 1;\r
    let introClock = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let seeded = false;\r
    let hidden = false;\r
    let sorted = 0;\r
\r
    const setHidden = (value: boolean) => {\r
      if (value === hidden) return;\r
      hidden = value;\r
      container.classList.toggle(HIDDEN, value);\r
    };\r
\r
    const allocate = () => {\r
      const nextCols = clamp(Math.round(view.width / CELL), 8, MAX_COLS);\r
      const nextRows = clamp(Math.round(view.height / CELL), 8, MAX_ROWS);\r
      cell = Math.max(view.width / nextCols, view.height / nextRows);\r
      if (nextCols === cols && nextRows === rows) return;\r
      cols = nextCols;\r
      rows = nextRows;\r
      const total = cols * rows;\r
      flowX = new Float32Array(total);\r
      flowY = new Float32Array(total);\r
      lastX = new Float32Array(total);\r
      lastY = new Float32Array(total);\r
      pressure = new Float32Array(total);\r
      divergence = new Float32Array(total);\r
      curl = new Float32Array(total);\r
    };\r
\r
    const sample = (values: Float32Array, x: number, y: number) => {\r
      let gx = x / cell - 0.5;\r
      let gy = y / cell - 0.5;\r
      if (gx < 0) gx = 0;\r
      else if (gx > cols - 1.001) gx = cols - 1.001;\r
      if (gy < 0) gy = 0;\r
      else if (gy > rows - 1.001) gy = rows - 1.001;\r
      const i = gx | 0;\r
      const j = gy | 0;\r
      const fx = gx - i;\r
      const fy = gy - j;\r
      const k = i + j * cols;\r
      return (\r
        (values[k] * (1 - fx) + values[k + 1] * fx) * (1 - fy) +\r
        (values[k + cols] * (1 - fx) + values[k + cols + 1] * fx) * fy\r
      );\r
    };\r
\r
    const walls = (values: Float32Array, axis: number) => {\r
      for (let j = 1; j < rows - 1; j++) {\r
        const left = j * cols;\r
        const right = left + cols - 1;\r
        values[left] = axis === 1 ? -values[left + 1] : values[left + 1];\r
        values[right] = axis === 1 ? -values[right - 1] : values[right - 1];\r
      }\r
      for (let i = 1; i < cols - 1; i++) {\r
        const bottom = i + (rows - 1) * cols;\r
        values[i] = axis === 2 ? -values[i + cols] : values[i + cols];\r
        values[bottom] = axis === 2 ? -values[bottom - cols] : values[bottom - cols];\r
      }\r
      values[0] = 0.5 * (values[1] + values[cols]);\r
      values[cols - 1] = 0.5 * (values[cols - 2] + values[2 * cols - 1]);\r
      values[(rows - 1) * cols] = 0.5 * (values[(rows - 2) * cols] + values[(rows - 1) * cols + 1]);\r
      values[rows * cols - 1] = 0.5 * (values[rows * cols - 2] + values[(rows - 1) * cols - 1]);\r
    };\r
\r
    const stir = (s: Settings, dt: number, ease: number) => {\r
      const radius = s.spread;\r
      const reach = radius * 2.2;\r
      const i0 = Math.max(1, Math.floor((anchor.x - reach) / cell));\r
      const i1 = Math.min(cols - 2, Math.ceil((anchor.x + reach) / cell));\r
      const j0 = Math.max(1, Math.floor((anchor.y - reach) / cell));\r
      const j1 = Math.min(rows - 2, Math.ceil((anchor.y + reach) / cell));\r
      const inv = 1 / (radius * radius * 0.55);\r
      const moving = Math.hypot(anchor.moveX, anchor.moveY);\r
      const grab = (1 - Math.exp(-dt * 20)) * clamp(moving / 240, 0, 1) * presence;\r
      const whirl = ring.active ? 0 : radius * (0.5 + 4 * (1 - ease)) * (0.35 + 0.65 * s.speed);\r
      const churn = s.wander * radius * 14 * (0.4 + 0.6 * s.speed);\r
      const fk = 1.4 / radius;\r
      const ft = time * 0.75 * (0.4 + 0.6 * s.speed);\r
      for (let j = j0; j <= j1; j++) {\r
        for (let i = i0; i <= i1; i++) {\r
          const k = i + j * cols;\r
          const x = (i + 0.5) * cell;\r
          const y = (j + 0.5) * cell;\r
          const rx = x - anchor.x;\r
          const ry = y - anchor.y;\r
          const d2 = rx * rx + ry * ry;\r
          const w = Math.exp(-d2 * inv);\r
          if (w < 0.003) continue;\r
          const d = Math.sqrt(d2) + 0.001;\r
          flowX[k] += (anchor.moveX - flowX[k]) * w * grab;\r
          flowY[k] += (anchor.moveY - flowY[k]) * w * grab;\r
          const reachOut = Math.min(1, d / (radius * 0.45));\r
          flowX[k] += (-ry / d) * whirl * reachOut * w * dt;\r
          flowY[k] += (rx / d) * whirl * reachOut * w * dt;\r
          const a1 = x * fk + ft;\r
          const b1 = y * fk * 1.1 - ft * 0.8;\r
          const a2 = y * fk * 1.7 + ft * 1.2 + 1.3;\r
          const b2 = x * fk * 1.3 - 0.7;\r
          const curlX = -Math.sin(a1) * Math.sin(b1) * 1.1 + 1.02 * Math.cos(a2) * Math.cos(b2);\r
          const curlY = -(Math.cos(a1) * Math.cos(b1) - 0.78 * Math.sin(a2) * Math.sin(b2));\r
          flowX[k] += curlX * churn * w * dt;\r
          flowY[k] += curlY * churn * w * dt;\r
        }\r
      }\r
      if (!ring.active) return;\r
      const band = Math.max(4, radius * 0.16);\r
      const margin = band + 24;\r
      const circulate = 230 * (0.4 + 0.6 * s.speed) * ring.spin;\r
      const r0 = Math.max(1, Math.floor((ring.x - ring.hx - margin) / cell));\r
      const r1 = Math.min(cols - 2, Math.ceil((ring.x + ring.hx + margin) / cell));\r
      const c0 = Math.max(1, Math.floor((ring.y - ring.hy - margin) / cell));\r
      const c1 = Math.min(rows - 2, Math.ceil((ring.y + ring.hy + margin) / cell));\r
      const rate = 1 - Math.exp(-dt * 6);\r
      for (let j = c0; j <= c1; j++) {\r
        for (let i = r0; i <= r1; i++) {\r
          const k = i + j * cols;\r
          rectField((i + 0.5) * cell - ring.x, (j + 0.5) * cell - ring.y, ring.hx, ring.hy, ring.corner, field);\r
          const off = field[0] - (5 + band * 0.5);\r
          const w = Math.exp(-(off * off) / (margin * margin * 0.35));\r
          if (w < 0.01) continue;\r
          flowX[k] += (-field[2] * circulate - flowX[k]) * w * rate;\r
          flowY[k] += (field[1] * circulate - flowY[k]) * w * rate;\r
        }\r
      }\r
    };\r
\r
    const flow = (s: Settings, dt: number) => {\r
      const total = cols * rows;\r
      for (let j = 1; j < rows - 1; j++) {\r
        for (let i = 1; i < cols - 1; i++) {\r
          const k = i + j * cols;\r
          curl[k] = (flowY[k + 1] - flowY[k - 1] - flowX[k + cols] + flowX[k - cols]) * (0.5 / cell);\r
        }\r
      }\r
      const confine = s.swirl * cell * 9;\r
      for (let j = 2; j < rows - 2; j++) {\r
        for (let i = 2; i < cols - 2; i++) {\r
          const k = i + j * cols;\r
          const gx = Math.abs(curl[k + 1]) - Math.abs(curl[k - 1]);\r
          const gy = Math.abs(curl[k + cols]) - Math.abs(curl[k - cols]);\r
          const len = Math.hypot(gx, gy) + 1e-5;\r
          flowX[k] += (gy / len) * curl[k] * confine * dt;\r
          flowY[k] -= (gx / len) * curl[k] * confine * dt;\r
        }\r
      }\r
      lastX.set(flowX);\r
      lastY.set(flowY);\r
      const back = dt / cell;\r
      const fade = Math.exp(-dt / (0.35 + 1.5 * s.swirl));\r
      for (let j = 1; j < rows - 1; j++) {\r
        for (let i = 1; i < cols - 1; i++) {\r
          const k = i + j * cols;\r
          let x = i - back * lastX[k];\r
          let y = j - back * lastY[k];\r
          if (x < 0.5) x = 0.5;\r
          else if (x > cols - 1.5) x = cols - 1.5;\r
          if (y < 0.5) y = 0.5;\r
          else if (y > rows - 1.5) y = rows - 1.5;\r
          const i0 = x | 0;\r
          const j0 = y | 0;\r
          const fx = x - i0;\r
          const fy = y - j0;\r
          const a = i0 + j0 * cols;\r
          flowX[k] =\r
            ((lastX[a] * (1 - fx) + lastX[a + 1] * fx) * (1 - fy) +\r
              (lastX[a + cols] * (1 - fx) + lastX[a + cols + 1] * fx) * fy) *\r
            fade;\r
          flowY[k] =\r
            ((lastY[a] * (1 - fx) + lastY[a + 1] * fx) * (1 - fy) +\r
              (lastY[a + cols] * (1 - fx) + lastY[a + cols + 1] * fx) * fy) *\r
            fade;\r
        }\r
      }\r
      walls(flowX, 1);\r
      walls(flowY, 2);\r
      const h2 = cell * cell;\r
      for (let j = 1; j < rows - 1; j++) {\r
        for (let i = 1; i < cols - 1; i++) {\r
          const k = i + j * cols;\r
          divergence[k] = (flowX[k + 1] - flowX[k - 1] + flowY[k + cols] - flowY[k - cols]) * (0.5 / cell);\r
        }\r
      }\r
      pressure.fill(0, 0, total);\r
      walls(divergence, 0);\r
      for (let step = 0; step < PRESSURE_STEPS; step++) {\r
        for (let j = 1; j < rows - 1; j++) {\r
          for (let i = 1; i < cols - 1; i++) {\r
            const k = i + j * cols;\r
            pressure[k] =\r
              (pressure[k - 1] + pressure[k + 1] + pressure[k - cols] + pressure[k + cols] - h2 * divergence[k]) * 0.25;\r
          }\r
        }\r
        walls(pressure, 0);\r
      }\r
      for (let j = 1; j < rows - 1; j++) {\r
        for (let i = 1; i < cols - 1; i++) {\r
          const k = i + j * cols;\r
          flowX[k] -= (pressure[k + 1] - pressure[k - 1]) * (0.5 / cell);\r
          flowY[k] -= (pressure[k + cols] - pressure[k - cols]) * (0.5 / cell);\r
        }\r
      }\r
      walls(flowX, 1);\r
      walls(flowY, 2);\r
    };\r
\r
    const crowd = new Int32Array(MAX_PARTICLES);\r
    let crowdHeads = new Int32Array(1);\r
    let crowdRows = 1;\r
    const push = (n: number, h: number) => {\r
      const gc = Math.max(1, Math.ceil(view.width / h) + 2);\r
      const gr = Math.max(1, Math.ceil(view.height / h) + 2);\r
      if (crowdHeads.length < gc * gr) crowdHeads = new Int32Array(gc * gr);\r
      crowdHeads.fill(-1, 0, gc * gr);\r
      crowdRows = gr;\r
      for (let i = 0; i < n; i++) {\r
        const cx = clamp(Math.floor(px[i] / h) + 1, 0, gc - 1);\r
        const cy = clamp(Math.floor(py[i] / h) + 1, 0, gr - 1);\r
        const key = cy * gc + cx;\r
        crowd[i] = crowdHeads[key];\r
        crowdHeads[key] = i;\r
      }\r
      return gc;\r
    };\r
\r
    const move = (s: Settings, dt: number, ease: number) => {\r
      const n = s.count;\r
      const radius = s.spread;\r
      const loose = 1 - 0.6 * s.tail;\r
      const gather = 12 * loose * (0.2 + 0.8 * ease);\r
      const pull = 30 * loose * (0.2 + 0.8 * ease);\r
      const band = Math.max(4, radius * 0.16);\r
      const w = view.width;\r
      const h = view.height;\r
      const gap = radius * Math.sqrt(Math.PI / Math.max(n, 1)) * 1.6;\r
      const repel = 4000;\r
      const gc = push(n, gap);\r
      for (let i = 0; i < n; i++) {\r
        const x = px[i];\r
        const y = py[i];\r
        const k = 10 * (1 - 0.6 * s.tail * heft[i]);\r
        let ax = (sample(flowX, x, y) - vx[i]) * k;\r
        let ay = (sample(flowY, x, y) - vy[i]) * k;\r
        const cx = clamp(Math.floor(x / gap) + 1, 0, gc - 1);\r
        const cy = clamp(Math.floor(y / gap) + 1, 0, crowdRows - 1);\r
        for (let oy = -1; oy <= 1; oy++) {\r
          const row = cy + oy;\r
          if (row < 0 || row >= crowdRows) continue;\r
          for (let ox = -1; ox <= 1; ox++) {\r
            const col = cx + ox;\r
            if (col < 0 || col >= gc) continue;\r
            for (let j = crowdHeads[row * gc + col]; j !== -1; j = crowd[j]) {\r
              if (j === i) continue;\r
              const dx = x - px[j];\r
              const dy = y - py[j];\r
              const d2 = dx * dx + dy * dy;\r
              if (d2 >= gap * gap || d2 < 1e-6) continue;\r
              const d = Math.sqrt(d2);\r
              const q = 1 - d / gap;\r
              ax += (dx / d) * q * q * repel;\r
              ay += (dy / d) * q * q * repel;\r
            }\r
          }\r
        }\r
        if (ring.active) {\r
          rectField(x - ring.x, y - ring.y, ring.hx, ring.hy, ring.corner, field);\r
          const e = field[0] - (5 + band * home[i] * home[i]);\r
          const hold = e > 0 ? 70 : 140;\r
          ax -= field[1] * e * hold;\r
          ay -= field[2] * e * hold;\r
        } else {\r
          const dx = anchor.x - x;\r
          const dy = anchor.y - y;\r
          const d = Math.hypot(dx, dy) + 0.001;\r
          const over = Math.max(0, d - radius);\r
          ax += (dx / d) * (d * gather + over * pull);\r
          ay += (dy / d) * (d * gather + over * pull);\r
        }\r
        if (introClock >= 1) {\r
          if (x < 8) ax += (8 - x) * 30;\r
          else if (x > w - 8) ax -= (x - w + 8) * 30;\r
          if (y < 8) ay += (8 - y) * 30;\r
          else if (y > h - 8) ay -= (y - h + 8) * 30;\r
        }\r
        const lift = Math.sin(time * bobRate[i] + bob[i]) * radius * (ring.active ? 0.15 : 0.55);\r
        const az = (lift - pz[i]) * 36 - vz[i] * 9;\r
        vx[i] += ax * dt;\r
        vy[i] += ay * dt;\r
        vz[i] += az * dt;\r
        px[i] += vx[i] * dt;\r
        py[i] += vy[i] * dt;\r
        pz[i] += vz[i] * dt;\r
      }\r
    };\r
\r
    const seed = () => {\r
      const rand = random(7);\r
      for (let i = 0; i < MAX_PARTICLES; i++) {\r
        home[i] = 0.08 + 0.92 * Math.sqrt(rand());\r
        heft[i] = rand() * rand();\r
        bob[i] = rand() * Math.PI * 2;\r
        bobRate[i] = 0.5 + rand() * 1.1;\r
        grain[i] = 0.55 + rand() * 0.9;\r
        glint[i] = rand() * 100;\r
      }\r
      seeded = true;\r
    };\r
\r
    const place = (gathered: boolean) => {\r
      const s = settingsRef.current;\r
      const rand = random(11);\r
      const reachOut = Math.hypot(view.width, view.height) * 0.5;\r
      for (let i = 0; i < MAX_PARTICLES; i++) {\r
        const a = rand() * Math.PI * 2;\r
        const r = gathered ? home[i] * s.spread : (0.35 + 0.65 * Math.sqrt(rand())) * reachOut;\r
        px[i] = anchor.x + Math.cos(a) * r;\r
        py[i] = anchor.y + Math.sin(a) * r;\r
        pz[i] = Math.sin(bob[i]) * s.spread * 0.55;\r
        vx[i] = 0;\r
        vy[i] = 0;\r
        vz[i] = 0;\r
      }\r
    };\r
\r
    const findTarget = () => {\r
      const s = settingsRef.current;\r
      if (!s.targets || !pointer.inside) return null;\r
      const rect = container.getBoundingClientRect();\r
      const element = document.elementFromPoint(rect.left + pointer.x, rect.top + pointer.y);\r
      if (!element || !container.contains(element)) return null;\r
      let match: Element | null = null;\r
      try {\r
        match = element.closest(s.targets);\r
      } catch {\r
        match = null;\r
      }\r
      return match && container.contains(match) ? match : null;\r
    };\r
\r
    const updateAnchor = (s: Settings, dt: number) => {\r
      const w = view.width;\r
      const h = view.height;\r
      if (hovered && hovered.isConnected) {\r
        const box = hovered.getBoundingClientRect();\r
        const frame = container.getBoundingClientRect();\r
        const radius = parseFloat(getComputedStyle(hovered).borderTopLeftRadius) || 0;\r
        ring.x = box.left - frame.left + box.width / 2;\r
        ring.y = box.top - frame.top + box.height / 2;\r
        ring.hx = box.width / 2;\r
        ring.hy = box.height / 2;\r
        ring.corner = Math.min(radius, ring.hx, ring.hy);\r
        if (!ring.active) {\r
          let turning = 0;\r
          for (let i = 0; i < s.count; i++) turning += (px[i] - ring.x) * vy[i] - (py[i] - ring.y) * vx[i];\r
          ring.spin = turning < 0 ? -1 : 1;\r
        }\r
        ring.active = true;\r
      } else {\r
        ring.active = false;\r
      }\r
      let goal = 1;\r
      if (pointer.inside) {\r
        anchor.x = pointer.x;\r
        anchor.y = pointer.y;\r
      } else if (s.idle === 'gather') {\r
        anchor.x = w * 0.5;\r
        anchor.y = h * 0.5;\r
      } else if (s.idle === 'hide') {\r
        goal = 0;\r
      } else {\r
        anchor.x = w * (0.5 + 0.3 * Math.sin(time * 0.21) + 0.06 * Math.sin(time * 0.53 + 1.7));\r
        anchor.y = h * (0.5 + 0.24 * Math.sin(time * 0.29 + 0.8) + 0.05 * Math.sin(time * 0.71));\r
      }\r
      if (dt > 0) {\r
        const moveX = clamp((anchor.x - anchor.lastX) / dt, -4000, 4000);\r
        const moveY = clamp((anchor.y - anchor.lastY) / dt, -4000, 4000);\r
        const blend = 1 - Math.exp(-dt * 30);\r
        anchor.moveX += (moveX - anchor.moveX) * blend;\r
        anchor.moveY += (moveY - anchor.moveY) * blend;\r
      }\r
      anchor.lastX = anchor.x;\r
      anchor.lastY = anchor.y;\r
      presence += (goal - presence) * (1 - Math.exp(-dt / 0.25));\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      const n = s.count;\r
      const fade = introClock * introClock * (3 - 2 * introClock) * presence;\r
      const zr = Math.max(s.spread * 0.55, 10);\r
      if (sorted !== n) {\r
        for (let a = 0; a < n; a++) order[a] = a;\r
        sorted = n;\r
      }\r
      for (let a = 1; a < n; a++) {\r
        const value = order[a];\r
        const key = pz[value];\r
        let b = a - 1;\r
        while (b >= 0 && pz[order[b]] > key) {\r
          order[b + 1] = order[b];\r
          b--;\r
        }\r
        order[b + 1] = value;\r
      }\r
      const flash = burst.age < 1.2 ? Math.exp(-burst.age / 0.3) : 0;\r
      const front = ping.age * 520;\r
      let written = 0;\r
      for (let a = 0; a < n; a++) {\r
        const i = order[a];\r
        const near = clamp(pz[i] / zr, -1, 1);\r
        const scale = 1 + s.depth * 0.6 * near;\r
        const body = s.size * grain[i] * scale;\r
        const soft = s.depth * s.size * (s.lightMode ? 0.35 : 1.4) * Math.pow(Math.abs(near), 1.6);\r
        const flat = Math.hypot(vx[i], vy[i]);\r
        const dx = flat > 0.001 ? vx[i] / flat : 1;\r
        const dy = flat > 0.001 ? vy[i] / flat : 0;\r
        let wave = 0;\r
        if (ping.age < 1.6) {\r
          const offset = (Math.hypot(px[i] - ping.x, py[i] - ping.y) - front) / 40;\r
          wave = Math.exp(-offset * offset) * (1 - ping.age / 1.6);\r
        }\r
        const tint = Math.max(clamp((flat - 380) / 900, 0, 1), flash, wave);\r
        const width = body * (1 + wave * 0.8);\r
        let length = width + Math.min(flat * s.trail * 0.02, body * 14);\r
        if (s.shape === 2) length = width * 2.6 + Math.min(flat * s.trail * 0.03, body * 18);\r
        const twinkle = 0.86 + 0.14 * Math.sin(time * 3.1 + glint[i]);\r
        const dim = 1 - s.depth * 0.45 * Math.max(0, -near);\r
        const o = written * 4;\r
        agentData[o] = px[i];\r
        agentData[o + 1] = py[i];\r
        agentData[o + 2] = dx;\r
        agentData[o + 3] = dy;\r
        lookData[o] = length;\r
        lookData[o + 1] = width;\r
        lookData[o + 2] = clamp(0.95 * dim * (body / (body + soft)) * twinkle * (1 + wave * 0.4), 0, 1) * fade;\r
        lookData[o + 3] = tint;\r
        extraData[written * 2] = soft;\r
        extraData[written * 2 + 1] = s.shape;\r
        written++;\r
      }\r
      if (s.hideCursor && pointer.inside) {\r
        const o = written * 4;\r
        agentData[o] = pointer.x;\r
        agentData[o + 1] = pointer.y;\r
        agentData[o + 2] = 1;\r
        agentData[o + 3] = 0;\r
        lookData[o] = 6;\r
        lookData[o + 1] = 6;\r
        lookData[o + 2] = 1;\r
        lookData[o + 3] = 0;\r
        extraData[written * 2] = 0;\r
        extraData[written * 2 + 1] = 0;\r
        written++;\r
      }\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      if (!s.enabled || !written) return;\r
      gl.useProgram(shader.program);\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      gl.bindVertexArray(vao);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, agentBuffer);\r
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, agentData, 0, written * 4);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, lookBuffer);\r
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, lookData, 0, written * 4);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, extraBuffer);\r
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, extraData, 0, written * 2);\r
      gl.uniform2f(u.uView, view.width, view.height);\r
      gl.uniform3fv(u.uColor, parse(s.color));\r
      gl.uniform3fv(u.uAccent, parse(s.accentColor));\r
      gl.uniform1f(u.uRatio, view.ratio);\r
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, written);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      view.width = Math.max(1, container.clientWidth);\r
      view.height = Math.max(1, container.clientHeight);\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(view.width * view.ratio));\r
      canvas.height = Math.max(1, Math.round(view.height * view.ratio));\r
      allocate();\r
      if (!seeded) {\r
        seed();\r
        updateAnchor(s, 0);\r
        if (reduce) {\r
          anchor.x = view.width / 2;\r
          anchor.y = view.height / 2;\r
        }\r
        anchor.lastX = anchor.x;\r
        anchor.lastY = anchor.y;\r
        place(introClock >= 1);\r
      }\r
      draw();\r
      wake();\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.001, 1 / 30) : 1 / 60;\r
      last = now;\r
      if (!s.enabled || reduce) {\r
        setHidden(false);\r
        draw();\r
        return;\r
      }\r
      time += dt;\r
      burst.age += dt;\r
      ping.age += dt;\r
      if (introClock < 1) introClock = Math.min(1, introClock + dt / INTRO_SECONDS);\r
      const ease = introClock * introClock * (3 - 2 * introClock);\r
      hovered = findTarget();\r
      updateAnchor(s, dt);\r
      setHidden(s.hideCursor && pointer.inside);\r
      stir(s, dt, ease);\r
      flow(s, dt);\r
      move(s, dt / 2, ease);\r
      move(s, dt / 2, ease);\r
      draw();\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    function wake() {\r
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    }\r
\r
    const locate = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const { x, y, inside } = locate(event);\r
      pointer.x = x;\r
      pointer.y = y;\r
      pointer.inside = inside;\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      const { x, y, inside } = locate(event);\r
      if (!inside || !s.enabled || reduce || s.clickEffect === 'none') return;\r
      const reachOut = s.spread * 2.2;\r
      if (s.clickEffect === 'pulse') {\r
        ping.x = x;\r
        ping.y = y;\r
        ping.age = 0;\r
      } else {\r
        burst.age = 0;\r
      }\r
      const kick = s.clickEffect === 'pulse' ? 160 : 780;\r
      for (let i = 0; i < s.count; i++) {\r
        const dx = px[i] - x;\r
        const dy = py[i] - y;\r
        const d = Math.hypot(dx, dy) || 1;\r
        if (d > reachOut) continue;\r
        const k = (1 - d / reachOut) * kick * (0.6 + 0.4 * grain[i]);\r
        vx[i] += (dx / d) * k;\r
        vy[i] += (dy / d) * k;\r
      }\r
      if (s.clickEffect === 'pulse') return;\r
      const twist = 520 * (time % 2 < 1 ? 1 : -1);\r
      const inv = 1 / (s.spread * s.spread);\r
      for (let j = 1; j < rows - 1; j++) {\r
        for (let i = 1; i < cols - 1; i++) {\r
          const k = i + j * cols;\r
          const rx = (i + 0.5) * cell - x;\r
          const ry = (j + 0.5) * cell - y;\r
          const d2 = rx * rx + ry * ry;\r
          const w = (Math.sqrt(d2) / s.spread) * Math.exp(-d2 * inv);\r
          if (w < 0.003) continue;\r
          const d = Math.sqrt(d2) + 0.001;\r
          flowX[k] += (-ry / d) * twist * w;\r
          flowY[k] += (rx / d) * twist * w;\r
        }\r
      }\r
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
    wakeRef.current = wake;\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      setHidden(false);\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('pointerup', onPointerUp);\r
      window.removeEventListener('pointercancel', onPointerUp);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteBuffer(cornerBuffer);\r
      gl.deleteBuffer(agentBuffer);\r
      gl.deleteBuffer(lookBuffer);\r
      gl.deleteBuffer(extraBuffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(shader.program);\r
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
      {...rest}\r
    >\r
      <style>{\`.\${HIDDEN}, .\${HIDDEN} * { cursor: none !important; }\`}</style>\r
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 block h-full w-full" aria-hidden="true" />\r
      {children ? <div className="relative h-full w-full">{children}</div> : null}\r
    </div>\r
  );\r
};\r
\r
export default SwarmCursor;\r
`,a={usage:`import SwarmCursor from './SwarmCursor';

<div style={{ position: 'relative', width: '100%', height: '600px' }}>
  <SwarmCursor
    count={800}
    size={2.6}
    spread={90}
    swirl={0.6}
    clickEffect="burst"
  >
    {/* Your content here */}
  </SwarmCursor>
</div>`,code:r,css:n,tailwind:e,tsCode:t,tsTailwind:o};export{a as swarmCursor};
