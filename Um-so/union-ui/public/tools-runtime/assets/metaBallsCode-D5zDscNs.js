const n=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
import './MetaBalls.css';\r
\r
const MAX_BALLS = 50;\r
const SLOTS = MAX_BALLS + 1;\r
const VARIANTS = { solid: 0, outline: 1, contour: 2 };\r
const VISIBLE = 0.877;\r
\r
const fract = x => x - Math.floor(x);\r
\r
const hash31 = p => {\r
  const r = [p * 0.1031, p * 0.103, p * 0.0973].map(fract);\r
  const dot = r[0] * (r[1] + 33.33) + r[1] * (r[2] + 33.33) + r[2] * (r[0] + 33.33);\r
  return r.map(value => fract(value + dot));\r
};\r
\r
const hash33 = v => {\r
  const p = [v[0] * 0.1031, v[1] * 0.103, v[2] * 0.0973].map(fract);\r
  const dot = p[0] * (p[1] + 33.33) + p[1] * (p[0] + 33.33) + p[2] * (p[2] + 33.33);\r
  const q = p.map(value => fract(value + dot));\r
  return [fract((q[0] + q[1]) * q[2]), fract((q[0] + q[0]) * q[1]), fract((q[1] + q[0]) * q[0])];\r
};\r
\r
const toRgb = color => {\r
  let hex = String(color || '')\r
    .trim()\r
    .replace('#', '');\r
  if (hex.length === 3) hex = hex.replace(/./g, c => c + c);\r
  if (!/^[0-9a-f]{6}/i.test(hex)) return [1, 1, 1];\r
  return [0, 2, 4].map(index => parseInt(hex.slice(index, index + 2), 16) / 255);\r
};\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
const smoothstep = (a, b, x) => {\r
  const t = clamp((x - a) / (b - a), 0, 1);\r
  return t * t * (3 - 2 * t);\r
};\r
const easeOut = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);\r
const easeInOut = t => {\r
  const x = clamp(t, 0, 1);\r
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;\r
};\r
\r
const VERTEX = \`#version 300 es\r
in vec2 position;\r
void main() {\r
  gl_Position = vec4(position, 0.0, 1.0);\r
}\r
\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
\r
uniform vec2 uResolution;\r
uniform float uScale;\r
uniform vec4 uBalls[\${SLOTS}];\r
uniform vec4 uShapes[\${SLOTS}];\r
uniform int uCount;\r
uniform float uGamma;\r
uniform float uThreshold;\r
uniform vec3 uColor;\r
uniform vec3 uCursorColor;\r
uniform int uVariant;\r
uniform float uLine;\r
uniform float uSpacing;\r
uniform float uRings;\r
uniform float uOpaque;\r
\r
out vec4 outColor;\r
\r
void main() {\r
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution) * uScale;\r
  float field = 0.0;\r
  float tint = 0.0;\r
  float mass = 0.0;\r
  vec2 grad = vec2(0.0);\r
  bool classic = abs(uGamma - 1.0) < 0.001;\r
  for (int i = 0; i < \${SLOTS}; i++) {\r
    if (i >= uCount) break;\r
    vec4 ball = uBalls[i];\r
    vec4 shape = uShapes[i];\r
    vec2 d = p - ball.xy;\r
    vec2 q = vec2(shape.x * d.x + shape.y * d.y, shape.y * d.x + shape.z * d.y);\r
    float qq = max(dot(q, q), ball.z * 1e-4 + 1e-12);\r
    float v = ball.z / qq;\r
    float w = classic ? v : pow(v, uGamma);\r
    field += w;\r
    float weight = w / (1.0 + w / uThreshold);\r
    mass += weight;\r
    tint += weight * ball.w;\r
    grad -= 2.0 * uGamma * w / qq * vec2(shape.x * q.x + shape.y * q.y, shape.y * q.x + shape.z * q.y);\r
  }\r
  float slope = max(length(grad) * uScale, 1e-8);\r
  vec3 color = mix(uColor, uCursorColor, mass > 0.0 ? clamp(tint / mass, 0.0, 1.0) : 0.0);\r
  float alpha;\r
  if (uVariant == 0) {\r
    alpha = field > 3.0 * uThreshold ? 1.0 : clamp((field - uThreshold) / slope + 0.5, 0.0, 1.0);\r
  } else if (uVariant == 1) {\r
    alpha = field > 3.0 * uThreshold ? 0.0 : clamp(0.5 * uLine + 0.5 - abs((field - uThreshold) / slope), 0.0, 1.0);\r
  } else {\r
    float rho = pow(max(field / uThreshold, 1e-6), -0.5 / uGamma);\r
    float rate = rho * slope / (2.0 * uGamma * max(field, 1e-8));\r
    float u = (rho - 1.0) / uSpacing;\r
    float ring = floor(u + 0.5);\r
    float gap = (u - ring) * uSpacing / max(rate, 1e-8);\r
    alpha = clamp(0.5 * uLine + 0.5 - abs(gap), 0.0, 1.0);\r
    alpha *= ring < -0.5 || ring > uRings + 0.5 ? 0.0 : 1.0 - ring / (uRings + 1.0);\r
    if (ring > 0.5) alpha *= smoothstep(uLine * 6.0, uLine * 12.0, uSpacing / max(rate, 1e-8));\r
  }\r
  outColor = vec4(color * alpha, uOpaque > 0.5 ? 1.0 : alpha);\r
}\r
\`;\r
\r
const compile = (gl, type, source) => {\r
  const shader = gl.createShader(type);\r
  gl.shaderSource(shader, source);\r
  gl.compileShader(shader);\r
  return shader;\r
};\r
\r
const createBall = index => {\r
  const h1 = hash31(index + 1);\r
  const h2 = hash33(h1);\r
  return {\r
    start: h1[0] * Math.PI * 2,\r
    rate: 0.1 * Math.PI + h1[1] * 0.3 * Math.PI,\r
    reach: 5 + h1[1] * 5,\r
    toggle: Math.floor(h2[0] * 2),\r
    radius: 0.5 + h2[2] * 1.5,\r
    lane: h2[1] * 2 - 1,\r
    rise: 0.55 + h1[2] * 0.7,\r
    sway: h2[0] * Math.PI * 2,\r
    delay: 0.1 + fract(h1[2] * 7.31 + h2[1] * 3.17) * 0.55,\r
    x: 0,\r
    y: 0,\r
    vx: 0,\r
    vy: 0,\r
    fx: 0,\r
    fy: 0,\r
    ax: 0,\r
    ay: 0,\r
    avx: 0,\r
    avy: 0,\r
    a: 0,\r
    b: 0,\r
    va: 0,\r
    vb: 0\r
  };\r
};\r
\r
const MetaBalls = ({\r
  className = '',\r
  color = '#ffffff',\r
  cursorBallColor = '#ffffff',\r
  speed = 0.3,\r
  enableMouseInteraction = true,\r
  hoverSmoothness = 0.1,\r
  animationSize = 30,\r
  ballCount = 15,\r
  clumpFactor = 1,\r
  cursorBallSize = 3,\r
  enableTransparency = false,\r
  variant = 'solid',\r
  motion = 'orbit',\r
  gooeyness = 0.5,\r
  stickiness = 0.5,\r
  stretch = 0.5,\r
  wobble = 0.5,\r
  lineWidth = 1.5,\r
  rings = 4,\r
  clickBurst = true,\r
  intro = true,\r
  paused = false,\r
  dpr,\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const settings = {\r
    color,\r
    cursorBallColor,\r
    speed,\r
    enableMouseInteraction,\r
    hoverSmoothness,\r
    animationSize,\r
    ballCount,\r
    clumpFactor,\r
    cursorBallSize,\r
    enableTransparency,\r
    variant,\r
    motion,\r
    gooeyness,\r
    stickiness,\r
    stretch,\r
    wobble,\r
    lineWidth,\r
    rings,\r
    clickBurst,\r
    paused,\r
    dpr\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
  const introRef = useRef(intro);\r
  const engineRef = useRef(null);\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    if (!container || !canvas) return;\r
    const gl = canvas.getContext('webgl2', { alpha: true, antialias: false, premultipliedAlpha: true });\r
    if (!gl) return;\r
\r
    const program = gl.createProgram();\r
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));\r
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));\r
    gl.bindAttribLocation(program, 0, 'position');\r
    gl.linkProgram(program);\r
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;\r
    gl.useProgram(program);\r
\r
    const buffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const uniform = name => gl.getUniformLocation(program, name);\r
    const loc = {\r
      resolution: uniform('uResolution'),\r
      scale: uniform('uScale'),\r
      balls: uniform('uBalls'),\r
      shapes: uniform('uShapes'),\r
      count: uniform('uCount'),\r
      gamma: uniform('uGamma'),\r
      threshold: uniform('uThreshold'),\r
      color: uniform('uColor'),\r
      cursorColor: uniform('uCursorColor'),\r
      variant: uniform('uVariant'),\r
      line: uniform('uLine'),\r
      spacing: uniform('uSpacing'),\r
      rings: uniform('uRings'),\r
      opaque: uniform('uOpaque')\r
    };\r
\r
    const ballData = new Float32Array(SLOTS * 4);\r
    const shapeData = new Float32Array(SLOTS * 4);\r
    const balls = Array.from({ length: MAX_BALLS }, (_, index) => createBall(index));\r
    const idle = createBall(MAX_BALLS + 7);\r
    const cursor = { x: 0, y: 0, vx: 0, vy: 0, a: 0, b: 0, va: 0, vb: 0, pulse: 0, pulseVelocity: 0, ready: false };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
    const view = { width: 1, height: 1, ratio: 1 };\r
    const colors = new Map();\r
    const rgb = value => {\r
      if (!colors.has(value)) colors.set(value, toRgb(value));\r
      return colors.get(value);\r
    };\r
    let phase = 0;\r
    let clock = 0;\r
    let introAt = introRef.current && !reduced ? 0 : -1;\r
    let visible = true;\r
    let raf = 0;\r
    let last = 0;\r
    let dirty = true;\r
\r
    const resize = () => {\r
      const rect = container.getBoundingClientRect();\r
      const s = settingsRef.current;\r
      const ratio = Math.max(0.5, Math.min(s.dpr ?? window.devicePixelRatio ?? 1, 2));\r
      view.width = Math.max(1, rect.width);\r
      view.height = Math.max(1, rect.height);\r
      view.ratio = ratio;\r
      canvas.width = Math.max(1, Math.round(view.width * ratio));\r
      canvas.height = Math.max(1, Math.round(view.height * ratio));\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      dirty = true;\r
    };\r
\r
    const toWorld = (clientX, clientY) => {\r
      const rect = container.getBoundingClientRect();\r
      const scale = settingsRef.current.animationSize / Math.max(1, rect.height);\r
      return {\r
        x: (clientX - rect.left - rect.width / 2) * scale,\r
        y: (rect.top + rect.height / 2 - clientY) * scale,\r
        inside: clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom\r
      };\r
    };\r
\r
    const presence = () => {\r
      if (introAt < 0) return { size: 1, time: Infinity };\r
      const t = clock - introAt;\r
      return { size: easeOut(t / 0.5), time: t };\r
    };\r
\r
    const release = (ball, look) => (look.time === Infinity ? 1 : easeInOut((look.time - ball.delay) / 1.15));\r
\r
    const anchor = (ball, s, spread) => {\r
      const halfWidth = (s.animationSize * view.width) / view.height / 2;\r
      const halfHeight = s.animationSize / 2;\r
      const clump = Math.min(1.25, s.clumpFactor);\r
      if (s.motion === 'lava') {\r
        const cycle = Math.sin(phase * ball.rise * 1.6 + ball.start);\r
        const x =\r
          ball.lane * halfWidth * 0.8 * clump + Math.sin(phase * 0.5 * ball.rise + ball.sway) * halfWidth * 0.06;\r
        const y = Math.sign(cycle) * Math.pow(Math.abs(cycle), 0.55) * halfHeight * 0.9;\r
        return [x * spread, y * spread];\r
      }\r
      if (s.motion === 'drift') {\r
        const x = Math.sin(phase * ball.rise * 0.9 + ball.start) * halfWidth * 0.84 * clump;\r
        const y = Math.sin(phase * ball.rate * 1.3 + ball.sway) * halfHeight * 0.78 * clump;\r
        return [x * spread, y * spread];\r
      }\r
      const t = phase * ball.rate;\r
      const angle = ball.start + t;\r
      return [\r
        Math.cos(angle) * ball.reach * s.clumpFactor * spread,\r
        Math.sin(angle + t * ball.toggle) * ball.reach * s.clumpFactor * spread\r
      ];\r
    };\r
\r
    const deform = (body, h, s) => {\r
      const speed = Math.hypot(body.vx, body.vy);\r
      const amount = 0.6 * s.stretch * Math.tanh(speed / 14);\r
      let ta = 0;\r
      let tb = 0;\r
      if (speed > 1e-4) {\r
        ta = (amount * (body.vx * body.vx - body.vy * body.vy)) / (speed * speed);\r
        tb = (amount * 2 * body.vx * body.vy) / (speed * speed);\r
      }\r
      const omega = 13;\r
      const zeta = 0.85 - 0.68 * clamp(s.wobble, 0, 1);\r
      body.va += (omega * omega * (ta - body.a) - 2 * zeta * omega * body.va) * h;\r
      body.vb += (omega * omega * (tb - body.b) - 2 * zeta * omega * body.vb) * h;\r
      body.a += body.va * h;\r
      body.b += body.vb * h;\r
    };\r
\r
    const bridge = s => {\r
      const goo = clamp(s.gooeyness, 0, 1);\r
      const gamma = goo < 0.5 ? 1 + (0.5 - goo) * 1.2 : 1 - (goo - 0.5) * 0.5;\r
      return { gamma, threshold: Math.pow(1.3, gamma), reach: Math.pow(2, 0.5 / gamma) };\r
    };\r
\r
    const step = (h, s, count, look) => {\r
      const { reach } = bridge(s);\r
      const pull = 36 * clamp(s.stickiness, 0, 1);\r
      const cursorRadius = s.cursorBallSize * VISIBLE * look.size * (1 + cursor.pulse);\r
      phase += h * s.speed;\r
\r
      for (let i = 0; i < count; i++) {\r
        const ball = balls[i];\r
        const [x, y] = anchor(ball, s, release(ball, look));\r
        ball.avx = clamp((x - ball.ax) / h, -40, 40);\r
        ball.avy = clamp((y - ball.ay) / h, -40, 40);\r
        ball.ax = x;\r
        ball.ay = y;\r
        ball.fx = 20 * (x - ball.x) - 5.4 * (ball.vx - ball.avx);\r
        ball.fy = 20 * (y - ball.y) - 5.4 * (ball.vy - ball.avy);\r
      }\r
\r
      for (let i = 0; i < count; i++) {\r
        const p = balls[i];\r
        const rp = p.radius * VISIBLE * look.size;\r
        for (let j = i + 1; j < count; j++) {\r
          const q = balls[j];\r
          const rq = q.radius * VISIBLE * look.size;\r
          const dx = q.x - p.x;\r
          const dy = q.y - p.y;\r
          const distance = Math.hypot(dx, dy) || 1e-4;\r
          const far = (rp + rq) * reach;\r
          if (distance >= far) continue;\r
          const core = (rp + rq) * 0.62;\r
          let force;\r
          if (distance < core) force = -60 * (core - distance);\r
          else {\r
            const t = (distance - core) / (far - core);\r
            force = pull * Math.min(rp, rq) * smoothstep(0, 0.6, t) * (1 - smoothstep(0.82, 1, t));\r
          }\r
          const nx = dx / distance;\r
          const ny = dy / distance;\r
          const mp = rp * rp + 0.05;\r
          const mq = rq * rq + 0.05;\r
          p.fx += (nx * force) / mp;\r
          p.fy += (ny * force) / mp;\r
          q.fx -= (nx * force) / mq;\r
          q.fy -= (ny * force) / mq;\r
        }\r
        const dx = cursor.x - p.x;\r
        const dy = cursor.y - p.y;\r
        const distance = Math.hypot(dx, dy) || 1e-4;\r
        const far = (rp + cursorRadius) * reach;\r
        if (distance < far) {\r
          const core = (rp + cursorRadius) * 0.62;\r
          let force;\r
          if (distance < core) force = -140 * (core - distance);\r
          else {\r
            const t = (distance - core) / (far - core);\r
            force = pull * 0.6 * rp * smoothstep(0, 0.6, t) * (1 - smoothstep(0.82, 1, t));\r
          }\r
          p.fx += ((dx / distance) * force) / (rp * rp + 0.05);\r
          p.fy += ((dy / distance) * force) / (rp * rp + 0.05);\r
        }\r
      }\r
\r
      for (let i = 0; i < count; i++) {\r
        const ball = balls[i];\r
        ball.vx += ball.fx * h;\r
        ball.vy += ball.fy * h;\r
        ball.x += ball.vx * h;\r
        ball.y += ball.vy * h;\r
        deform(ball, h, s);\r
        if (!Number.isFinite(ball.x + ball.y + ball.vx + ball.vy + ball.a + ball.b + ball.va + ball.vb)) {\r
          Object.assign(ball, { x: ball.ax, y: ball.ay, vx: 0, vy: 0, a: 0, b: 0, va: 0, vb: 0 });\r
        }\r
      }\r
    };\r
\r
    const moveCursor = (dt, s, look) => {\r
      let tx;\r
      let ty;\r
      if (pointer.inside && s.enableMouseInteraction) {\r
        tx = pointer.x;\r
        ty = pointer.y;\r
      } else {\r
        const out = look.time === Infinity ? 1 : easeInOut((look.time - 0.75) / 1.3);\r
        if (s.motion === 'lava' || s.motion === 'drift') {\r
          [tx, ty] = anchor(idle, s, out);\r
        } else {\r
          const halfWidth = (s.animationSize * view.width) / view.height / 2;\r
          const halfHeight = s.animationSize / 2;\r
          tx = Math.cos(clock * s.speed) * halfWidth * 0.3 * out;\r
          ty = Math.sin(clock * s.speed) * halfHeight * 0.3 * out;\r
        }\r
      }\r
      if (!cursor.ready) {\r
        cursor.x = tx;\r
        cursor.y = ty;\r
        cursor.ready = true;\r
      }\r
      const follow = 1 - Math.pow(1 - clamp(s.hoverSmoothness, 0.001, 1), dt * 60);\r
      const nx = cursor.x + (tx - cursor.x) * follow;\r
      const ny = cursor.y + (ty - cursor.y) * follow;\r
      const blend = 1 - Math.exp(-dt / 0.05);\r
      cursor.vx += ((nx - cursor.x) / Math.max(dt, 1e-4) - cursor.vx) * blend;\r
      cursor.vy += ((ny - cursor.y) / Math.max(dt, 1e-4) - cursor.vy) * blend;\r
      cursor.x = nx;\r
      cursor.y = ny;\r
    };\r
\r
    const burst = (x, y) => {\r
      const s = settingsRef.current;\r
      const count = clamp(Math.round(s.ballCount), 0, MAX_BALLS);\r
      const radius = s.animationSize * 0.45;\r
      for (let i = 0; i < count; i++) {\r
        const ball = balls[i];\r
        const dx = ball.x - x;\r
        const dy = ball.y - y;\r
        const distance = Math.hypot(dx, dy) || 1e-4;\r
        if (distance > radius) continue;\r
        const falloff = Math.pow(1 - distance / radius, 1.2);\r
        const kick = 72 * falloff;\r
        ball.vx += (dx / distance) * kick - (dy / distance) * kick * 0.3;\r
        ball.vy += (dy / distance) * kick + (dx / distance) * kick * 0.3;\r
      }\r
      cursor.pulseVelocity += 9;\r
    };\r
\r
    const shapeOf = (body, out, offset) => {\r
      const m = Math.hypot(body.a, body.b);\r
      const c = Math.cosh(m);\r
      const k = m > 1e-6 ? Math.sinh(m) / m : 1;\r
      out[offset] = c - k * body.a;\r
      out[offset + 1] = -k * body.b;\r
      out[offset + 2] = c + k * body.a;\r
      out[offset + 3] = 0;\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      const count = clamp(Math.round(s.ballCount), 0, MAX_BALLS);\r
      const look = presence();\r
      const { gamma, threshold } = bridge(s);\r
      for (let i = 0; i < count; i++) {\r
        const ball = balls[i];\r
        const radius = ball.radius * look.size;\r
        ballData[i * 4] = ball.x;\r
        ballData[i * 4 + 1] = ball.y;\r
        ballData[i * 4 + 2] = radius * radius;\r
        ballData[i * 4 + 3] = 0;\r
        shapeOf(ball, shapeData, i * 4);\r
      }\r
      const cursorRadius = s.cursorBallSize * look.size * (1 + cursor.pulse);\r
      ballData[count * 4] = cursor.x;\r
      ballData[count * 4 + 1] = cursor.y;\r
      ballData[count * 4 + 2] = cursorRadius * cursorRadius;\r
      ballData[count * 4 + 3] = 1;\r
      shapeOf(cursor, shapeData, count * 4);\r
\r
      gl.uniform2f(loc.resolution, canvas.width, canvas.height);\r
      gl.uniform1f(loc.scale, s.animationSize / canvas.height);\r
      gl.uniform4fv(loc.balls, ballData);\r
      gl.uniform4fv(loc.shapes, shapeData);\r
      gl.uniform1i(loc.count, count + 1);\r
      gl.uniform1f(loc.gamma, gamma);\r
      gl.uniform1f(loc.threshold, threshold);\r
      gl.uniform3fv(loc.color, rgb(s.color));\r
      gl.uniform3fv(loc.cursorColor, rgb(s.cursorBallColor));\r
      gl.uniform1i(loc.variant, VARIANTS[s.variant] ?? 0);\r
      gl.uniform1f(loc.line, Math.max(0.25, s.lineWidth) * view.ratio);\r
      gl.uniform1f(loc.spacing, 0.28);\r
      gl.uniform1f(loc.rings, clamp(Math.round(s.rings), 0, 12));\r
      gl.uniform1f(loc.opaque, s.enableTransparency ? 0 : 1);\r
      gl.clearColor(0, 0, 0, s.enableTransparency ? 0 : 1);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      dirty = false;\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible) return;\r
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 1 / 60);\r
      last = now;\r
      const s = settingsRef.current;\r
      if (!s.paused && dt > 1e-4) {\r
        clock += dt;\r
        const count = clamp(Math.round(s.ballCount), 0, MAX_BALLS);\r
        const look = presence();\r
        moveCursor(dt, s, look);\r
        const steps = Math.max(1, Math.ceil(dt / (1 / 240)));\r
        for (let i = 0; i < steps; i++) step(dt / steps, s, count, look);\r
        deform(cursor, dt, s);\r
        cursor.pulseVelocity += (-170 * cursor.pulse - 2 * 0.42 * 13 * cursor.pulseVelocity) * dt;\r
        cursor.pulse = Math.max(-0.4, cursor.pulse + cursor.pulseVelocity * dt);\r
        dirty = true;\r
      }\r
      if (dirty) draw();\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const start = () => {\r
      if (raf || !visible) return;\r
      last = 0;\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const onMove = event => {\r
      const point = toWorld(event.clientX, event.clientY);\r
      pointer.x = point.x;\r
      pointer.y = point.y;\r
      pointer.inside = point.inside;\r
    };\r
    const onLeave = event => {\r
      if (!event.relatedTarget) pointer.inside = false;\r
    };\r
    const onLift = event => {\r
      if (event.pointerType !== 'mouse') pointer.inside = false;\r
    };\r
    const onDown = event => {\r
      const s = settingsRef.current;\r
      if (!s.clickBurst || !s.enableMouseInteraction || s.paused || event.button !== 0) return;\r
      const point = toWorld(event.clientX, event.clientY);\r
      if (point.inside) burst(point.x, point.y);\r
    };\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(container);\r
    const intersection = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible) start();\r
    });\r
    intersection.observe(container);\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    window.addEventListener('pointerdown', onDown, { passive: true });\r
    window.addEventListener('pointerout', onLeave);\r
    window.addEventListener('pointerup', onLift);\r
    window.addEventListener('pointercancel', onLift);\r
\r
    resize();\r
    start();\r
    engineRef.current = {\r
      refresh: () => {\r
        dirty = true;\r
      }\r
    };\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onMove);\r
      window.removeEventListener('pointerdown', onDown);\r
      window.removeEventListener('pointerout', onLeave);\r
      window.removeEventListener('pointerup', onLift);\r
      window.removeEventListener('pointercancel', onLift);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteProgram(program);\r
      engineRef.current = null;\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    engineRef.current?.refresh();\r
  });\r
\r
  return (\r
    <div ref={containerRef} className={\`metaballs-container \${className}\`.trim()} style={style}>\r
      <canvas ref={canvasRef} className="metaballs-canvas" />\r
    </div>\r
  );\r
};\r
\r
export default MetaBalls;\r
`,r=`.metaballs-container {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
}\r
\r
.metaballs-canvas {\r
  display: block;\r
  width: 100%;\r
  height: 100%;\r
}\r
`,e=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
const MAX_BALLS = 50;\r
const SLOTS = MAX_BALLS + 1;\r
const VARIANTS = { solid: 0, outline: 1, contour: 2 };\r
const VISIBLE = 0.877;\r
\r
const fract = x => x - Math.floor(x);\r
\r
const hash31 = p => {\r
  const r = [p * 0.1031, p * 0.103, p * 0.0973].map(fract);\r
  const dot = r[0] * (r[1] + 33.33) + r[1] * (r[2] + 33.33) + r[2] * (r[0] + 33.33);\r
  return r.map(value => fract(value + dot));\r
};\r
\r
const hash33 = v => {\r
  const p = [v[0] * 0.1031, v[1] * 0.103, v[2] * 0.0973].map(fract);\r
  const dot = p[0] * (p[1] + 33.33) + p[1] * (p[0] + 33.33) + p[2] * (p[2] + 33.33);\r
  const q = p.map(value => fract(value + dot));\r
  return [fract((q[0] + q[1]) * q[2]), fract((q[0] + q[0]) * q[1]), fract((q[1] + q[0]) * q[0])];\r
};\r
\r
const toRgb = color => {\r
  let hex = String(color || '')\r
    .trim()\r
    .replace('#', '');\r
  if (hex.length === 3) hex = hex.replace(/./g, c => c + c);\r
  if (!/^[0-9a-f]{6}/i.test(hex)) return [1, 1, 1];\r
  return [0, 2, 4].map(index => parseInt(hex.slice(index, index + 2), 16) / 255);\r
};\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
const smoothstep = (a, b, x) => {\r
  const t = clamp((x - a) / (b - a), 0, 1);\r
  return t * t * (3 - 2 * t);\r
};\r
const easeOut = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);\r
const easeInOut = t => {\r
  const x = clamp(t, 0, 1);\r
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;\r
};\r
\r
const VERTEX = \`#version 300 es\r
in vec2 position;\r
void main() {\r
  gl_Position = vec4(position, 0.0, 1.0);\r
}\r
\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
\r
uniform vec2 uResolution;\r
uniform float uScale;\r
uniform vec4 uBalls[\${SLOTS}];\r
uniform vec4 uShapes[\${SLOTS}];\r
uniform int uCount;\r
uniform float uGamma;\r
uniform float uThreshold;\r
uniform vec3 uColor;\r
uniform vec3 uCursorColor;\r
uniform int uVariant;\r
uniform float uLine;\r
uniform float uSpacing;\r
uniform float uRings;\r
uniform float uOpaque;\r
\r
out vec4 outColor;\r
\r
void main() {\r
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution) * uScale;\r
  float field = 0.0;\r
  float tint = 0.0;\r
  float mass = 0.0;\r
  vec2 grad = vec2(0.0);\r
  bool classic = abs(uGamma - 1.0) < 0.001;\r
  for (int i = 0; i < \${SLOTS}; i++) {\r
    if (i >= uCount) break;\r
    vec4 ball = uBalls[i];\r
    vec4 shape = uShapes[i];\r
    vec2 d = p - ball.xy;\r
    vec2 q = vec2(shape.x * d.x + shape.y * d.y, shape.y * d.x + shape.z * d.y);\r
    float qq = max(dot(q, q), ball.z * 1e-4 + 1e-12);\r
    float v = ball.z / qq;\r
    float w = classic ? v : pow(v, uGamma);\r
    field += w;\r
    float weight = w / (1.0 + w / uThreshold);\r
    mass += weight;\r
    tint += weight * ball.w;\r
    grad -= 2.0 * uGamma * w / qq * vec2(shape.x * q.x + shape.y * q.y, shape.y * q.x + shape.z * q.y);\r
  }\r
  float slope = max(length(grad) * uScale, 1e-8);\r
  vec3 color = mix(uColor, uCursorColor, mass > 0.0 ? clamp(tint / mass, 0.0, 1.0) : 0.0);\r
  float alpha;\r
  if (uVariant == 0) {\r
    alpha = field > 3.0 * uThreshold ? 1.0 : clamp((field - uThreshold) / slope + 0.5, 0.0, 1.0);\r
  } else if (uVariant == 1) {\r
    alpha = field > 3.0 * uThreshold ? 0.0 : clamp(0.5 * uLine + 0.5 - abs((field - uThreshold) / slope), 0.0, 1.0);\r
  } else {\r
    float rho = pow(max(field / uThreshold, 1e-6), -0.5 / uGamma);\r
    float rate = rho * slope / (2.0 * uGamma * max(field, 1e-8));\r
    float u = (rho - 1.0) / uSpacing;\r
    float ring = floor(u + 0.5);\r
    float gap = (u - ring) * uSpacing / max(rate, 1e-8);\r
    alpha = clamp(0.5 * uLine + 0.5 - abs(gap), 0.0, 1.0);\r
    alpha *= ring < -0.5 || ring > uRings + 0.5 ? 0.0 : 1.0 - ring / (uRings + 1.0);\r
    if (ring > 0.5) alpha *= smoothstep(uLine * 6.0, uLine * 12.0, uSpacing / max(rate, 1e-8));\r
  }\r
  outColor = vec4(color * alpha, uOpaque > 0.5 ? 1.0 : alpha);\r
}\r
\`;\r
\r
const compile = (gl, type, source) => {\r
  const shader = gl.createShader(type);\r
  gl.shaderSource(shader, source);\r
  gl.compileShader(shader);\r
  return shader;\r
};\r
\r
const createBall = index => {\r
  const h1 = hash31(index + 1);\r
  const h2 = hash33(h1);\r
  return {\r
    start: h1[0] * Math.PI * 2,\r
    rate: 0.1 * Math.PI + h1[1] * 0.3 * Math.PI,\r
    reach: 5 + h1[1] * 5,\r
    toggle: Math.floor(h2[0] * 2),\r
    radius: 0.5 + h2[2] * 1.5,\r
    lane: h2[1] * 2 - 1,\r
    rise: 0.55 + h1[2] * 0.7,\r
    sway: h2[0] * Math.PI * 2,\r
    delay: 0.1 + fract(h1[2] * 7.31 + h2[1] * 3.17) * 0.55,\r
    x: 0,\r
    y: 0,\r
    vx: 0,\r
    vy: 0,\r
    fx: 0,\r
    fy: 0,\r
    ax: 0,\r
    ay: 0,\r
    avx: 0,\r
    avy: 0,\r
    a: 0,\r
    b: 0,\r
    va: 0,\r
    vb: 0\r
  };\r
};\r
\r
const MetaBalls = ({\r
  className = '',\r
  color = '#ffffff',\r
  cursorBallColor = '#ffffff',\r
  speed = 0.3,\r
  enableMouseInteraction = true,\r
  hoverSmoothness = 0.1,\r
  animationSize = 30,\r
  ballCount = 15,\r
  clumpFactor = 1,\r
  cursorBallSize = 3,\r
  enableTransparency = false,\r
  variant = 'solid',\r
  motion = 'orbit',\r
  gooeyness = 0.5,\r
  stickiness = 0.5,\r
  stretch = 0.5,\r
  wobble = 0.5,\r
  lineWidth = 1.5,\r
  rings = 4,\r
  clickBurst = true,\r
  intro = true,\r
  paused = false,\r
  dpr,\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const settings = {\r
    color,\r
    cursorBallColor,\r
    speed,\r
    enableMouseInteraction,\r
    hoverSmoothness,\r
    animationSize,\r
    ballCount,\r
    clumpFactor,\r
    cursorBallSize,\r
    enableTransparency,\r
    variant,\r
    motion,\r
    gooeyness,\r
    stickiness,\r
    stretch,\r
    wobble,\r
    lineWidth,\r
    rings,\r
    clickBurst,\r
    paused,\r
    dpr\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
  const introRef = useRef(intro);\r
  const engineRef = useRef(null);\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    if (!container || !canvas) return;\r
    const gl = canvas.getContext('webgl2', { alpha: true, antialias: false, premultipliedAlpha: true });\r
    if (!gl) return;\r
\r
    const program = gl.createProgram();\r
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));\r
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));\r
    gl.bindAttribLocation(program, 0, 'position');\r
    gl.linkProgram(program);\r
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;\r
    gl.useProgram(program);\r
\r
    const buffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const uniform = name => gl.getUniformLocation(program, name);\r
    const loc = {\r
      resolution: uniform('uResolution'),\r
      scale: uniform('uScale'),\r
      balls: uniform('uBalls'),\r
      shapes: uniform('uShapes'),\r
      count: uniform('uCount'),\r
      gamma: uniform('uGamma'),\r
      threshold: uniform('uThreshold'),\r
      color: uniform('uColor'),\r
      cursorColor: uniform('uCursorColor'),\r
      variant: uniform('uVariant'),\r
      line: uniform('uLine'),\r
      spacing: uniform('uSpacing'),\r
      rings: uniform('uRings'),\r
      opaque: uniform('uOpaque')\r
    };\r
\r
    const ballData = new Float32Array(SLOTS * 4);\r
    const shapeData = new Float32Array(SLOTS * 4);\r
    const balls = Array.from({ length: MAX_BALLS }, (_, index) => createBall(index));\r
    const idle = createBall(MAX_BALLS + 7);\r
    const cursor = { x: 0, y: 0, vx: 0, vy: 0, a: 0, b: 0, va: 0, vb: 0, pulse: 0, pulseVelocity: 0, ready: false };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
    const view = { width: 1, height: 1, ratio: 1 };\r
    const colors = new Map();\r
    const rgb = value => {\r
      if (!colors.has(value)) colors.set(value, toRgb(value));\r
      return colors.get(value);\r
    };\r
    let phase = 0;\r
    let clock = 0;\r
    let introAt = introRef.current && !reduced ? 0 : -1;\r
    let visible = true;\r
    let raf = 0;\r
    let last = 0;\r
    let dirty = true;\r
\r
    const resize = () => {\r
      const rect = container.getBoundingClientRect();\r
      const s = settingsRef.current;\r
      const ratio = Math.max(0.5, Math.min(s.dpr ?? window.devicePixelRatio ?? 1, 2));\r
      view.width = Math.max(1, rect.width);\r
      view.height = Math.max(1, rect.height);\r
      view.ratio = ratio;\r
      canvas.width = Math.max(1, Math.round(view.width * ratio));\r
      canvas.height = Math.max(1, Math.round(view.height * ratio));\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      dirty = true;\r
    };\r
\r
    const toWorld = (clientX, clientY) => {\r
      const rect = container.getBoundingClientRect();\r
      const scale = settingsRef.current.animationSize / Math.max(1, rect.height);\r
      return {\r
        x: (clientX - rect.left - rect.width / 2) * scale,\r
        y: (rect.top + rect.height / 2 - clientY) * scale,\r
        inside: clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom\r
      };\r
    };\r
\r
    const presence = () => {\r
      if (introAt < 0) return { size: 1, time: Infinity };\r
      const t = clock - introAt;\r
      return { size: easeOut(t / 0.5), time: t };\r
    };\r
\r
    const release = (ball, look) => (look.time === Infinity ? 1 : easeInOut((look.time - ball.delay) / 1.15));\r
\r
    const anchor = (ball, s, spread) => {\r
      const halfWidth = (s.animationSize * view.width) / view.height / 2;\r
      const halfHeight = s.animationSize / 2;\r
      const clump = Math.min(1.25, s.clumpFactor);\r
      if (s.motion === 'lava') {\r
        const cycle = Math.sin(phase * ball.rise * 1.6 + ball.start);\r
        const x =\r
          ball.lane * halfWidth * 0.8 * clump + Math.sin(phase * 0.5 * ball.rise + ball.sway) * halfWidth * 0.06;\r
        const y = Math.sign(cycle) * Math.pow(Math.abs(cycle), 0.55) * halfHeight * 0.9;\r
        return [x * spread, y * spread];\r
      }\r
      if (s.motion === 'drift') {\r
        const x = Math.sin(phase * ball.rise * 0.9 + ball.start) * halfWidth * 0.84 * clump;\r
        const y = Math.sin(phase * ball.rate * 1.3 + ball.sway) * halfHeight * 0.78 * clump;\r
        return [x * spread, y * spread];\r
      }\r
      const t = phase * ball.rate;\r
      const angle = ball.start + t;\r
      return [\r
        Math.cos(angle) * ball.reach * s.clumpFactor * spread,\r
        Math.sin(angle + t * ball.toggle) * ball.reach * s.clumpFactor * spread\r
      ];\r
    };\r
\r
    const deform = (body, h, s) => {\r
      const speed = Math.hypot(body.vx, body.vy);\r
      const amount = 0.6 * s.stretch * Math.tanh(speed / 14);\r
      let ta = 0;\r
      let tb = 0;\r
      if (speed > 1e-4) {\r
        ta = (amount * (body.vx * body.vx - body.vy * body.vy)) / (speed * speed);\r
        tb = (amount * 2 * body.vx * body.vy) / (speed * speed);\r
      }\r
      const omega = 13;\r
      const zeta = 0.85 - 0.68 * clamp(s.wobble, 0, 1);\r
      body.va += (omega * omega * (ta - body.a) - 2 * zeta * omega * body.va) * h;\r
      body.vb += (omega * omega * (tb - body.b) - 2 * zeta * omega * body.vb) * h;\r
      body.a += body.va * h;\r
      body.b += body.vb * h;\r
    };\r
\r
    const bridge = s => {\r
      const goo = clamp(s.gooeyness, 0, 1);\r
      const gamma = goo < 0.5 ? 1 + (0.5 - goo) * 1.2 : 1 - (goo - 0.5) * 0.5;\r
      return { gamma, threshold: Math.pow(1.3, gamma), reach: Math.pow(2, 0.5 / gamma) };\r
    };\r
\r
    const step = (h, s, count, look) => {\r
      const { reach } = bridge(s);\r
      const pull = 36 * clamp(s.stickiness, 0, 1);\r
      const cursorRadius = s.cursorBallSize * VISIBLE * look.size * (1 + cursor.pulse);\r
      phase += h * s.speed;\r
\r
      for (let i = 0; i < count; i++) {\r
        const ball = balls[i];\r
        const [x, y] = anchor(ball, s, release(ball, look));\r
        ball.avx = clamp((x - ball.ax) / h, -40, 40);\r
        ball.avy = clamp((y - ball.ay) / h, -40, 40);\r
        ball.ax = x;\r
        ball.ay = y;\r
        ball.fx = 20 * (x - ball.x) - 5.4 * (ball.vx - ball.avx);\r
        ball.fy = 20 * (y - ball.y) - 5.4 * (ball.vy - ball.avy);\r
      }\r
\r
      for (let i = 0; i < count; i++) {\r
        const p = balls[i];\r
        const rp = p.radius * VISIBLE * look.size;\r
        for (let j = i + 1; j < count; j++) {\r
          const q = balls[j];\r
          const rq = q.radius * VISIBLE * look.size;\r
          const dx = q.x - p.x;\r
          const dy = q.y - p.y;\r
          const distance = Math.hypot(dx, dy) || 1e-4;\r
          const far = (rp + rq) * reach;\r
          if (distance >= far) continue;\r
          const core = (rp + rq) * 0.62;\r
          let force;\r
          if (distance < core) force = -60 * (core - distance);\r
          else {\r
            const t = (distance - core) / (far - core);\r
            force = pull * Math.min(rp, rq) * smoothstep(0, 0.6, t) * (1 - smoothstep(0.82, 1, t));\r
          }\r
          const nx = dx / distance;\r
          const ny = dy / distance;\r
          const mp = rp * rp + 0.05;\r
          const mq = rq * rq + 0.05;\r
          p.fx += (nx * force) / mp;\r
          p.fy += (ny * force) / mp;\r
          q.fx -= (nx * force) / mq;\r
          q.fy -= (ny * force) / mq;\r
        }\r
        const dx = cursor.x - p.x;\r
        const dy = cursor.y - p.y;\r
        const distance = Math.hypot(dx, dy) || 1e-4;\r
        const far = (rp + cursorRadius) * reach;\r
        if (distance < far) {\r
          const core = (rp + cursorRadius) * 0.62;\r
          let force;\r
          if (distance < core) force = -140 * (core - distance);\r
          else {\r
            const t = (distance - core) / (far - core);\r
            force = pull * 0.6 * rp * smoothstep(0, 0.6, t) * (1 - smoothstep(0.82, 1, t));\r
          }\r
          p.fx += ((dx / distance) * force) / (rp * rp + 0.05);\r
          p.fy += ((dy / distance) * force) / (rp * rp + 0.05);\r
        }\r
      }\r
\r
      for (let i = 0; i < count; i++) {\r
        const ball = balls[i];\r
        ball.vx += ball.fx * h;\r
        ball.vy += ball.fy * h;\r
        ball.x += ball.vx * h;\r
        ball.y += ball.vy * h;\r
        deform(ball, h, s);\r
        if (!Number.isFinite(ball.x + ball.y + ball.vx + ball.vy + ball.a + ball.b + ball.va + ball.vb)) {\r
          Object.assign(ball, { x: ball.ax, y: ball.ay, vx: 0, vy: 0, a: 0, b: 0, va: 0, vb: 0 });\r
        }\r
      }\r
    };\r
\r
    const moveCursor = (dt, s, look) => {\r
      let tx;\r
      let ty;\r
      if (pointer.inside && s.enableMouseInteraction) {\r
        tx = pointer.x;\r
        ty = pointer.y;\r
      } else {\r
        const out = look.time === Infinity ? 1 : easeInOut((look.time - 0.75) / 1.3);\r
        if (s.motion === 'lava' || s.motion === 'drift') {\r
          [tx, ty] = anchor(idle, s, out);\r
        } else {\r
          const halfWidth = (s.animationSize * view.width) / view.height / 2;\r
          const halfHeight = s.animationSize / 2;\r
          tx = Math.cos(clock * s.speed) * halfWidth * 0.3 * out;\r
          ty = Math.sin(clock * s.speed) * halfHeight * 0.3 * out;\r
        }\r
      }\r
      if (!cursor.ready) {\r
        cursor.x = tx;\r
        cursor.y = ty;\r
        cursor.ready = true;\r
      }\r
      const follow = 1 - Math.pow(1 - clamp(s.hoverSmoothness, 0.001, 1), dt * 60);\r
      const nx = cursor.x + (tx - cursor.x) * follow;\r
      const ny = cursor.y + (ty - cursor.y) * follow;\r
      const blend = 1 - Math.exp(-dt / 0.05);\r
      cursor.vx += ((nx - cursor.x) / Math.max(dt, 1e-4) - cursor.vx) * blend;\r
      cursor.vy += ((ny - cursor.y) / Math.max(dt, 1e-4) - cursor.vy) * blend;\r
      cursor.x = nx;\r
      cursor.y = ny;\r
    };\r
\r
    const burst = (x, y) => {\r
      const s = settingsRef.current;\r
      const count = clamp(Math.round(s.ballCount), 0, MAX_BALLS);\r
      const radius = s.animationSize * 0.45;\r
      for (let i = 0; i < count; i++) {\r
        const ball = balls[i];\r
        const dx = ball.x - x;\r
        const dy = ball.y - y;\r
        const distance = Math.hypot(dx, dy) || 1e-4;\r
        if (distance > radius) continue;\r
        const falloff = Math.pow(1 - distance / radius, 1.2);\r
        const kick = 72 * falloff;\r
        ball.vx += (dx / distance) * kick - (dy / distance) * kick * 0.3;\r
        ball.vy += (dy / distance) * kick + (dx / distance) * kick * 0.3;\r
      }\r
      cursor.pulseVelocity += 9;\r
    };\r
\r
    const shapeOf = (body, out, offset) => {\r
      const m = Math.hypot(body.a, body.b);\r
      const c = Math.cosh(m);\r
      const k = m > 1e-6 ? Math.sinh(m) / m : 1;\r
      out[offset] = c - k * body.a;\r
      out[offset + 1] = -k * body.b;\r
      out[offset + 2] = c + k * body.a;\r
      out[offset + 3] = 0;\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      const count = clamp(Math.round(s.ballCount), 0, MAX_BALLS);\r
      const look = presence();\r
      const { gamma, threshold } = bridge(s);\r
      for (let i = 0; i < count; i++) {\r
        const ball = balls[i];\r
        const radius = ball.radius * look.size;\r
        ballData[i * 4] = ball.x;\r
        ballData[i * 4 + 1] = ball.y;\r
        ballData[i * 4 + 2] = radius * radius;\r
        ballData[i * 4 + 3] = 0;\r
        shapeOf(ball, shapeData, i * 4);\r
      }\r
      const cursorRadius = s.cursorBallSize * look.size * (1 + cursor.pulse);\r
      ballData[count * 4] = cursor.x;\r
      ballData[count * 4 + 1] = cursor.y;\r
      ballData[count * 4 + 2] = cursorRadius * cursorRadius;\r
      ballData[count * 4 + 3] = 1;\r
      shapeOf(cursor, shapeData, count * 4);\r
\r
      gl.uniform2f(loc.resolution, canvas.width, canvas.height);\r
      gl.uniform1f(loc.scale, s.animationSize / canvas.height);\r
      gl.uniform4fv(loc.balls, ballData);\r
      gl.uniform4fv(loc.shapes, shapeData);\r
      gl.uniform1i(loc.count, count + 1);\r
      gl.uniform1f(loc.gamma, gamma);\r
      gl.uniform1f(loc.threshold, threshold);\r
      gl.uniform3fv(loc.color, rgb(s.color));\r
      gl.uniform3fv(loc.cursorColor, rgb(s.cursorBallColor));\r
      gl.uniform1i(loc.variant, VARIANTS[s.variant] ?? 0);\r
      gl.uniform1f(loc.line, Math.max(0.25, s.lineWidth) * view.ratio);\r
      gl.uniform1f(loc.spacing, 0.28);\r
      gl.uniform1f(loc.rings, clamp(Math.round(s.rings), 0, 12));\r
      gl.uniform1f(loc.opaque, s.enableTransparency ? 0 : 1);\r
      gl.clearColor(0, 0, 0, s.enableTransparency ? 0 : 1);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      dirty = false;\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible) return;\r
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 1 / 60);\r
      last = now;\r
      const s = settingsRef.current;\r
      if (!s.paused && dt > 1e-4) {\r
        clock += dt;\r
        const count = clamp(Math.round(s.ballCount), 0, MAX_BALLS);\r
        const look = presence();\r
        moveCursor(dt, s, look);\r
        const steps = Math.max(1, Math.ceil(dt / (1 / 240)));\r
        for (let i = 0; i < steps; i++) step(dt / steps, s, count, look);\r
        deform(cursor, dt, s);\r
        cursor.pulseVelocity += (-170 * cursor.pulse - 2 * 0.42 * 13 * cursor.pulseVelocity) * dt;\r
        cursor.pulse = Math.max(-0.4, cursor.pulse + cursor.pulseVelocity * dt);\r
        dirty = true;\r
      }\r
      if (dirty) draw();\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const start = () => {\r
      if (raf || !visible) return;\r
      last = 0;\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const onMove = event => {\r
      const point = toWorld(event.clientX, event.clientY);\r
      pointer.x = point.x;\r
      pointer.y = point.y;\r
      pointer.inside = point.inside;\r
    };\r
    const onLeave = event => {\r
      if (!event.relatedTarget) pointer.inside = false;\r
    };\r
    const onLift = event => {\r
      if (event.pointerType !== 'mouse') pointer.inside = false;\r
    };\r
    const onDown = event => {\r
      const s = settingsRef.current;\r
      if (!s.clickBurst || !s.enableMouseInteraction || s.paused || event.button !== 0) return;\r
      const point = toWorld(event.clientX, event.clientY);\r
      if (point.inside) burst(point.x, point.y);\r
    };\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(container);\r
    const intersection = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible) start();\r
    });\r
    intersection.observe(container);\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    window.addEventListener('pointerdown', onDown, { passive: true });\r
    window.addEventListener('pointerout', onLeave);\r
    window.addEventListener('pointerup', onLift);\r
    window.addEventListener('pointercancel', onLift);\r
\r
    resize();\r
    start();\r
    engineRef.current = {\r
      refresh: () => {\r
        dirty = true;\r
      }\r
    };\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onMove);\r
      window.removeEventListener('pointerdown', onDown);\r
      window.removeEventListener('pointerout', onLeave);\r
      window.removeEventListener('pointerup', onLift);\r
      window.removeEventListener('pointercancel', onLift);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteProgram(program);\r
      engineRef.current = null;\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    engineRef.current?.refresh();\r
  });\r
\r
  return (\r
    <div ref={containerRef} className={\`relative h-full w-full \${className}\`.trim()} style={style}>\r
      <canvas ref={canvasRef} className="block h-full w-full" />\r
    </div>\r
  );\r
};\r
\r
export default MetaBalls;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties } from 'react';\r
\r
import './MetaBalls.css';\r
\r
type Variant = 'solid' | 'outline' | 'contour';\r
type Motion = 'orbit' | 'drift' | 'lava';\r
\r
interface MetaBallsProps {\r
  className?: string;\r
  color?: string;\r
  cursorBallColor?: string;\r
  speed?: number;\r
  enableMouseInteraction?: boolean;\r
  hoverSmoothness?: number;\r
  animationSize?: number;\r
  ballCount?: number;\r
  clumpFactor?: number;\r
  cursorBallSize?: number;\r
  enableTransparency?: boolean;\r
  variant?: Variant;\r
  motion?: Motion;\r
  gooeyness?: number;\r
  stickiness?: number;\r
  stretch?: number;\r
  wobble?: number;\r
  lineWidth?: number;\r
  rings?: number;\r
  clickBurst?: boolean;\r
  intro?: boolean;\r
  paused?: boolean;\r
  dpr?: number;\r
  style?: CSSProperties;\r
}\r
\r
interface Body {\r
  vx: number;\r
  vy: number;\r
  a: number;\r
  b: number;\r
  va: number;\r
  vb: number;\r
}\r
\r
interface Look {\r
  size: number;\r
  time: number;\r
}\r
\r
const MAX_BALLS = 50;\r
const SLOTS = MAX_BALLS + 1;\r
const VARIANTS: Record<string, number> = { solid: 0, outline: 1, contour: 2 };\r
const VISIBLE = 0.877;\r
\r
const fract = (x: number) => x - Math.floor(x);\r
\r
const hash31 = (p: number) => {\r
  const r = [p * 0.1031, p * 0.103, p * 0.0973].map(fract);\r
  const dot = r[0] * (r[1] + 33.33) + r[1] * (r[2] + 33.33) + r[2] * (r[0] + 33.33);\r
  return r.map(value => fract(value + dot));\r
};\r
\r
const hash33 = (v: number[]) => {\r
  const p = [v[0] * 0.1031, v[1] * 0.103, v[2] * 0.0973].map(fract);\r
  const dot = p[0] * (p[1] + 33.33) + p[1] * (p[0] + 33.33) + p[2] * (p[2] + 33.33);\r
  const q = p.map(value => fract(value + dot));\r
  return [fract((q[0] + q[1]) * q[2]), fract((q[0] + q[0]) * q[1]), fract((q[1] + q[0]) * q[0])];\r
};\r
\r
const toRgb = (color: string): [number, number, number] => {\r
  let hex = String(color || '')\r
    .trim()\r
    .replace('#', '');\r
  if (hex.length === 3) hex = hex.replace(/./g, c => c + c);\r
  if (!/^[0-9a-f]{6}/i.test(hex)) return [1, 1, 1];\r
  return [0, 2, 4].map(index => parseInt(hex.slice(index, index + 2), 16) / 255) as [number, number, number];\r
};\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
const smoothstep = (a: number, b: number, x: number) => {\r
  const t = clamp((x - a) / (b - a), 0, 1);\r
  return t * t * (3 - 2 * t);\r
};\r
const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);\r
const easeInOut = (t: number) => {\r
  const x = clamp(t, 0, 1);\r
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;\r
};\r
\r
const VERTEX = \`#version 300 es\r
in vec2 position;\r
void main() {\r
  gl_Position = vec4(position, 0.0, 1.0);\r
}\r
\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
\r
uniform vec2 uResolution;\r
uniform float uScale;\r
uniform vec4 uBalls[\${SLOTS}];\r
uniform vec4 uShapes[\${SLOTS}];\r
uniform int uCount;\r
uniform float uGamma;\r
uniform float uThreshold;\r
uniform vec3 uColor;\r
uniform vec3 uCursorColor;\r
uniform int uVariant;\r
uniform float uLine;\r
uniform float uSpacing;\r
uniform float uRings;\r
uniform float uOpaque;\r
\r
out vec4 outColor;\r
\r
void main() {\r
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution) * uScale;\r
  float field = 0.0;\r
  float tint = 0.0;\r
  float mass = 0.0;\r
  vec2 grad = vec2(0.0);\r
  bool classic = abs(uGamma - 1.0) < 0.001;\r
  for (int i = 0; i < \${SLOTS}; i++) {\r
    if (i >= uCount) break;\r
    vec4 ball = uBalls[i];\r
    vec4 shape = uShapes[i];\r
    vec2 d = p - ball.xy;\r
    vec2 q = vec2(shape.x * d.x + shape.y * d.y, shape.y * d.x + shape.z * d.y);\r
    float qq = max(dot(q, q), ball.z * 1e-4 + 1e-12);\r
    float v = ball.z / qq;\r
    float w = classic ? v : pow(v, uGamma);\r
    field += w;\r
    float weight = w / (1.0 + w / uThreshold);\r
    mass += weight;\r
    tint += weight * ball.w;\r
    grad -= 2.0 * uGamma * w / qq * vec2(shape.x * q.x + shape.y * q.y, shape.y * q.x + shape.z * q.y);\r
  }\r
  float slope = max(length(grad) * uScale, 1e-8);\r
  vec3 color = mix(uColor, uCursorColor, mass > 0.0 ? clamp(tint / mass, 0.0, 1.0) : 0.0);\r
  float alpha;\r
  if (uVariant == 0) {\r
    alpha = field > 3.0 * uThreshold ? 1.0 : clamp((field - uThreshold) / slope + 0.5, 0.0, 1.0);\r
  } else if (uVariant == 1) {\r
    alpha = field > 3.0 * uThreshold ? 0.0 : clamp(0.5 * uLine + 0.5 - abs((field - uThreshold) / slope), 0.0, 1.0);\r
  } else {\r
    float rho = pow(max(field / uThreshold, 1e-6), -0.5 / uGamma);\r
    float rate = rho * slope / (2.0 * uGamma * max(field, 1e-8));\r
    float u = (rho - 1.0) / uSpacing;\r
    float ring = floor(u + 0.5);\r
    float gap = (u - ring) * uSpacing / max(rate, 1e-8);\r
    alpha = clamp(0.5 * uLine + 0.5 - abs(gap), 0.0, 1.0);\r
    alpha *= ring < -0.5 || ring > uRings + 0.5 ? 0.0 : 1.0 - ring / (uRings + 1.0);\r
    if (ring > 0.5) alpha *= smoothstep(uLine * 6.0, uLine * 12.0, uSpacing / max(rate, 1e-8));\r
  }\r
  outColor = vec4(color * alpha, uOpaque > 0.5 ? 1.0 : alpha);\r
}\r
\`;\r
\r
const compile = (gl: WebGL2RenderingContext, type: number, source: string) => {\r
  const shader = gl.createShader(type) as WebGLShader;\r
  gl.shaderSource(shader, source);\r
  gl.compileShader(shader);\r
  return shader;\r
};\r
\r
const createBall = (index: number) => {\r
  const h1 = hash31(index + 1);\r
  const h2 = hash33(h1);\r
  return {\r
    start: h1[0] * Math.PI * 2,\r
    rate: 0.1 * Math.PI + h1[1] * 0.3 * Math.PI,\r
    reach: 5 + h1[1] * 5,\r
    toggle: Math.floor(h2[0] * 2),\r
    radius: 0.5 + h2[2] * 1.5,\r
    lane: h2[1] * 2 - 1,\r
    rise: 0.55 + h1[2] * 0.7,\r
    sway: h2[0] * Math.PI * 2,\r
    delay: 0.1 + fract(h1[2] * 7.31 + h2[1] * 3.17) * 0.55,\r
    x: 0,\r
    y: 0,\r
    vx: 0,\r
    vy: 0,\r
    fx: 0,\r
    fy: 0,\r
    ax: 0,\r
    ay: 0,\r
    avx: 0,\r
    avy: 0,\r
    a: 0,\r
    b: 0,\r
    va: 0,\r
    vb: 0\r
  };\r
};\r
\r
type Ball = ReturnType<typeof createBall>;\r
\r
const MetaBalls = ({\r
  className = '',\r
  color = '#ffffff',\r
  cursorBallColor = '#ffffff',\r
  speed = 0.3,\r
  enableMouseInteraction = true,\r
  hoverSmoothness = 0.1,\r
  animationSize = 30,\r
  ballCount = 15,\r
  clumpFactor = 1,\r
  cursorBallSize = 3,\r
  enableTransparency = false,\r
  variant = 'solid',\r
  motion = 'orbit',\r
  gooeyness = 0.5,\r
  stickiness = 0.5,\r
  stretch = 0.5,\r
  wobble = 0.5,\r
  lineWidth = 1.5,\r
  rings = 4,\r
  clickBurst = true,\r
  intro = true,\r
  paused = false,\r
  dpr,\r
  style\r
}: MetaBallsProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const settings = {\r
    color,\r
    cursorBallColor,\r
    speed,\r
    enableMouseInteraction,\r
    hoverSmoothness,\r
    animationSize,\r
    ballCount,\r
    clumpFactor,\r
    cursorBallSize,\r
    enableTransparency,\r
    variant,\r
    motion,\r
    gooeyness,\r
    stickiness,\r
    stretch,\r
    wobble,\r
    lineWidth,\r
    rings,\r
    clickBurst,\r
    paused,\r
    dpr\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
  const introRef = useRef(intro);\r
  const engineRef = useRef<{ refresh: () => void } | null>(null);\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    if (!container || !canvas) return;\r
    const gl = canvas.getContext('webgl2', { alpha: true, antialias: false, premultipliedAlpha: true });\r
    if (!gl) return;\r
\r
    const program = gl.createProgram() as WebGLProgram;\r
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));\r
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));\r
    gl.bindAttribLocation(program, 0, 'position');\r
    gl.linkProgram(program);\r
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;\r
    gl.useProgram(program);\r
\r
    const buffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const uniform = (name: string) => gl.getUniformLocation(program, name);\r
    const loc = {\r
      resolution: uniform('uResolution'),\r
      scale: uniform('uScale'),\r
      balls: uniform('uBalls'),\r
      shapes: uniform('uShapes'),\r
      count: uniform('uCount'),\r
      gamma: uniform('uGamma'),\r
      threshold: uniform('uThreshold'),\r
      color: uniform('uColor'),\r
      cursorColor: uniform('uCursorColor'),\r
      variant: uniform('uVariant'),\r
      line: uniform('uLine'),\r
      spacing: uniform('uSpacing'),\r
      rings: uniform('uRings'),\r
      opaque: uniform('uOpaque')\r
    };\r
\r
    const ballData = new Float32Array(SLOTS * 4);\r
    const shapeData = new Float32Array(SLOTS * 4);\r
    const balls = Array.from({ length: MAX_BALLS }, (_, index) => createBall(index));\r
    const idle = createBall(MAX_BALLS + 7);\r
    const cursor = { x: 0, y: 0, vx: 0, vy: 0, a: 0, b: 0, va: 0, vb: 0, pulse: 0, pulseVelocity: 0, ready: false };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
    const view = { width: 1, height: 1, ratio: 1 };\r
    const colors = new Map<string, [number, number, number]>();\r
    const rgb = (value: string) => {\r
      if (!colors.has(value)) colors.set(value, toRgb(value));\r
      return colors.get(value) as [number, number, number];\r
    };\r
    let phase = 0;\r
    let clock = 0;\r
    let introAt = introRef.current && !reduced ? 0 : -1;\r
    let visible = true;\r
    let raf = 0;\r
    let last = 0;\r
    let dirty = true;\r
\r
    const resize = () => {\r
      const rect = container.getBoundingClientRect();\r
      const s = settingsRef.current;\r
      const ratio = Math.max(0.5, Math.min(s.dpr ?? window.devicePixelRatio ?? 1, 2));\r
      view.width = Math.max(1, rect.width);\r
      view.height = Math.max(1, rect.height);\r
      view.ratio = ratio;\r
      canvas.width = Math.max(1, Math.round(view.width * ratio));\r
      canvas.height = Math.max(1, Math.round(view.height * ratio));\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      dirty = true;\r
    };\r
\r
    const toWorld = (clientX: number, clientY: number) => {\r
      const rect = container.getBoundingClientRect();\r
      const scale = settingsRef.current.animationSize / Math.max(1, rect.height);\r
      return {\r
        x: (clientX - rect.left - rect.width / 2) * scale,\r
        y: (rect.top + rect.height / 2 - clientY) * scale,\r
        inside: clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom\r
      };\r
    };\r
\r
    const presence = (): Look => {\r
      if (introAt < 0) return { size: 1, time: Infinity };\r
      const t = clock - introAt;\r
      return { size: easeOut(t / 0.5), time: t };\r
    };\r
\r
    const release = (ball: Ball, look: Look) =>\r
      look.time === Infinity ? 1 : easeInOut((look.time - ball.delay) / 1.15);\r
\r
    const anchor = (ball: Ball, s: typeof settings, spread: number): [number, number] => {\r
      const halfWidth = (s.animationSize * view.width) / view.height / 2;\r
      const halfHeight = s.animationSize / 2;\r
      const clump = Math.min(1.25, s.clumpFactor);\r
      if (s.motion === 'lava') {\r
        const cycle = Math.sin(phase * ball.rise * 1.6 + ball.start);\r
        const x =\r
          ball.lane * halfWidth * 0.8 * clump + Math.sin(phase * 0.5 * ball.rise + ball.sway) * halfWidth * 0.06;\r
        const y = Math.sign(cycle) * Math.pow(Math.abs(cycle), 0.55) * halfHeight * 0.9;\r
        return [x * spread, y * spread];\r
      }\r
      if (s.motion === 'drift') {\r
        const x = Math.sin(phase * ball.rise * 0.9 + ball.start) * halfWidth * 0.84 * clump;\r
        const y = Math.sin(phase * ball.rate * 1.3 + ball.sway) * halfHeight * 0.78 * clump;\r
        return [x * spread, y * spread];\r
      }\r
      const t = phase * ball.rate;\r
      const angle = ball.start + t;\r
      return [\r
        Math.cos(angle) * ball.reach * s.clumpFactor * spread,\r
        Math.sin(angle + t * ball.toggle) * ball.reach * s.clumpFactor * spread\r
      ];\r
    };\r
\r
    const deform = (body: Body, h: number, s: typeof settings) => {\r
      const speed = Math.hypot(body.vx, body.vy);\r
      const amount = 0.6 * s.stretch * Math.tanh(speed / 14);\r
      let ta = 0;\r
      let tb = 0;\r
      if (speed > 1e-4) {\r
        ta = (amount * (body.vx * body.vx - body.vy * body.vy)) / (speed * speed);\r
        tb = (amount * 2 * body.vx * body.vy) / (speed * speed);\r
      }\r
      const omega = 13;\r
      const zeta = 0.85 - 0.68 * clamp(s.wobble, 0, 1);\r
      body.va += (omega * omega * (ta - body.a) - 2 * zeta * omega * body.va) * h;\r
      body.vb += (omega * omega * (tb - body.b) - 2 * zeta * omega * body.vb) * h;\r
      body.a += body.va * h;\r
      body.b += body.vb * h;\r
    };\r
\r
    const bridge = (s: typeof settings) => {\r
      const goo = clamp(s.gooeyness, 0, 1);\r
      const gamma = goo < 0.5 ? 1 + (0.5 - goo) * 1.2 : 1 - (goo - 0.5) * 0.5;\r
      return { gamma, threshold: Math.pow(1.3, gamma), reach: Math.pow(2, 0.5 / gamma) };\r
    };\r
\r
    const step = (h: number, s: typeof settings, count: number, look: Look) => {\r
      const { reach } = bridge(s);\r
      const pull = 36 * clamp(s.stickiness, 0, 1);\r
      const cursorRadius = s.cursorBallSize * VISIBLE * look.size * (1 + cursor.pulse);\r
      phase += h * s.speed;\r
\r
      for (let i = 0; i < count; i++) {\r
        const ball = balls[i];\r
        const [x, y] = anchor(ball, s, release(ball, look));\r
        ball.avx = clamp((x - ball.ax) / h, -40, 40);\r
        ball.avy = clamp((y - ball.ay) / h, -40, 40);\r
        ball.ax = x;\r
        ball.ay = y;\r
        ball.fx = 20 * (x - ball.x) - 5.4 * (ball.vx - ball.avx);\r
        ball.fy = 20 * (y - ball.y) - 5.4 * (ball.vy - ball.avy);\r
      }\r
\r
      for (let i = 0; i < count; i++) {\r
        const p = balls[i];\r
        const rp = p.radius * VISIBLE * look.size;\r
        for (let j = i + 1; j < count; j++) {\r
          const q = balls[j];\r
          const rq = q.radius * VISIBLE * look.size;\r
          const dx = q.x - p.x;\r
          const dy = q.y - p.y;\r
          const distance = Math.hypot(dx, dy) || 1e-4;\r
          const far = (rp + rq) * reach;\r
          if (distance >= far) continue;\r
          const core = (rp + rq) * 0.62;\r
          let force;\r
          if (distance < core) force = -60 * (core - distance);\r
          else {\r
            const t = (distance - core) / (far - core);\r
            force = pull * Math.min(rp, rq) * smoothstep(0, 0.6, t) * (1 - smoothstep(0.82, 1, t));\r
          }\r
          const nx = dx / distance;\r
          const ny = dy / distance;\r
          const mp = rp * rp + 0.05;\r
          const mq = rq * rq + 0.05;\r
          p.fx += (nx * force) / mp;\r
          p.fy += (ny * force) / mp;\r
          q.fx -= (nx * force) / mq;\r
          q.fy -= (ny * force) / mq;\r
        }\r
        const dx = cursor.x - p.x;\r
        const dy = cursor.y - p.y;\r
        const distance = Math.hypot(dx, dy) || 1e-4;\r
        const far = (rp + cursorRadius) * reach;\r
        if (distance < far) {\r
          const core = (rp + cursorRadius) * 0.62;\r
          let force;\r
          if (distance < core) force = -140 * (core - distance);\r
          else {\r
            const t = (distance - core) / (far - core);\r
            force = pull * 0.6 * rp * smoothstep(0, 0.6, t) * (1 - smoothstep(0.82, 1, t));\r
          }\r
          p.fx += ((dx / distance) * force) / (rp * rp + 0.05);\r
          p.fy += ((dy / distance) * force) / (rp * rp + 0.05);\r
        }\r
      }\r
\r
      for (let i = 0; i < count; i++) {\r
        const ball = balls[i];\r
        ball.vx += ball.fx * h;\r
        ball.vy += ball.fy * h;\r
        ball.x += ball.vx * h;\r
        ball.y += ball.vy * h;\r
        deform(ball, h, s);\r
        if (!Number.isFinite(ball.x + ball.y + ball.vx + ball.vy + ball.a + ball.b + ball.va + ball.vb)) {\r
          Object.assign(ball, { x: ball.ax, y: ball.ay, vx: 0, vy: 0, a: 0, b: 0, va: 0, vb: 0 });\r
        }\r
      }\r
    };\r
\r
    const moveCursor = (dt: number, s: typeof settings, look: Look) => {\r
      let tx: number;\r
      let ty: number;\r
      if (pointer.inside && s.enableMouseInteraction) {\r
        tx = pointer.x;\r
        ty = pointer.y;\r
      } else {\r
        const out = look.time === Infinity ? 1 : easeInOut((look.time - 0.75) / 1.3);\r
        if (s.motion === 'lava' || s.motion === 'drift') {\r
          [tx, ty] = anchor(idle, s, out);\r
        } else {\r
          const halfWidth = (s.animationSize * view.width) / view.height / 2;\r
          const halfHeight = s.animationSize / 2;\r
          tx = Math.cos(clock * s.speed) * halfWidth * 0.3 * out;\r
          ty = Math.sin(clock * s.speed) * halfHeight * 0.3 * out;\r
        }\r
      }\r
      if (!cursor.ready) {\r
        cursor.x = tx;\r
        cursor.y = ty;\r
        cursor.ready = true;\r
      }\r
      const follow = 1 - Math.pow(1 - clamp(s.hoverSmoothness, 0.001, 1), dt * 60);\r
      const nx = cursor.x + (tx - cursor.x) * follow;\r
      const ny = cursor.y + (ty - cursor.y) * follow;\r
      const blend = 1 - Math.exp(-dt / 0.05);\r
      cursor.vx += ((nx - cursor.x) / Math.max(dt, 1e-4) - cursor.vx) * blend;\r
      cursor.vy += ((ny - cursor.y) / Math.max(dt, 1e-4) - cursor.vy) * blend;\r
      cursor.x = nx;\r
      cursor.y = ny;\r
    };\r
\r
    const burst = (x: number, y: number) => {\r
      const s = settingsRef.current;\r
      const count = clamp(Math.round(s.ballCount), 0, MAX_BALLS);\r
      const radius = s.animationSize * 0.45;\r
      for (let i = 0; i < count; i++) {\r
        const ball = balls[i];\r
        const dx = ball.x - x;\r
        const dy = ball.y - y;\r
        const distance = Math.hypot(dx, dy) || 1e-4;\r
        if (distance > radius) continue;\r
        const falloff = Math.pow(1 - distance / radius, 1.2);\r
        const kick = 72 * falloff;\r
        ball.vx += (dx / distance) * kick - (dy / distance) * kick * 0.3;\r
        ball.vy += (dy / distance) * kick + (dx / distance) * kick * 0.3;\r
      }\r
      cursor.pulseVelocity += 9;\r
    };\r
\r
    const shapeOf = (body: Body, out: Float32Array, offset: number) => {\r
      const m = Math.hypot(body.a, body.b);\r
      const c = Math.cosh(m);\r
      const k = m > 1e-6 ? Math.sinh(m) / m : 1;\r
      out[offset] = c - k * body.a;\r
      out[offset + 1] = -k * body.b;\r
      out[offset + 2] = c + k * body.a;\r
      out[offset + 3] = 0;\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      const count = clamp(Math.round(s.ballCount), 0, MAX_BALLS);\r
      const look = presence();\r
      const { gamma, threshold } = bridge(s);\r
      for (let i = 0; i < count; i++) {\r
        const ball = balls[i];\r
        const radius = ball.radius * look.size;\r
        ballData[i * 4] = ball.x;\r
        ballData[i * 4 + 1] = ball.y;\r
        ballData[i * 4 + 2] = radius * radius;\r
        ballData[i * 4 + 3] = 0;\r
        shapeOf(ball, shapeData, i * 4);\r
      }\r
      const cursorRadius = s.cursorBallSize * look.size * (1 + cursor.pulse);\r
      ballData[count * 4] = cursor.x;\r
      ballData[count * 4 + 1] = cursor.y;\r
      ballData[count * 4 + 2] = cursorRadius * cursorRadius;\r
      ballData[count * 4 + 3] = 1;\r
      shapeOf(cursor, shapeData, count * 4);\r
\r
      gl.uniform2f(loc.resolution, canvas.width, canvas.height);\r
      gl.uniform1f(loc.scale, s.animationSize / canvas.height);\r
      gl.uniform4fv(loc.balls, ballData);\r
      gl.uniform4fv(loc.shapes, shapeData);\r
      gl.uniform1i(loc.count, count + 1);\r
      gl.uniform1f(loc.gamma, gamma);\r
      gl.uniform1f(loc.threshold, threshold);\r
      gl.uniform3fv(loc.color, rgb(s.color));\r
      gl.uniform3fv(loc.cursorColor, rgb(s.cursorBallColor));\r
      gl.uniform1i(loc.variant, VARIANTS[s.variant] ?? 0);\r
      gl.uniform1f(loc.line, Math.max(0.25, s.lineWidth) * view.ratio);\r
      gl.uniform1f(loc.spacing, 0.28);\r
      gl.uniform1f(loc.rings, clamp(Math.round(s.rings), 0, 12));\r
      gl.uniform1f(loc.opaque, s.enableTransparency ? 0 : 1);\r
      gl.clearColor(0, 0, 0, s.enableTransparency ? 0 : 1);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      dirty = false;\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible) return;\r
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 1 / 60);\r
      last = now;\r
      const s = settingsRef.current;\r
      if (!s.paused && dt > 1e-4) {\r
        clock += dt;\r
        const count = clamp(Math.round(s.ballCount), 0, MAX_BALLS);\r
        const look = presence();\r
        moveCursor(dt, s, look);\r
        const steps = Math.max(1, Math.ceil(dt / (1 / 240)));\r
        for (let i = 0; i < steps; i++) step(dt / steps, s, count, look);\r
        deform(cursor, dt, s);\r
        cursor.pulseVelocity += (-170 * cursor.pulse - 2 * 0.42 * 13 * cursor.pulseVelocity) * dt;\r
        cursor.pulse = Math.max(-0.4, cursor.pulse + cursor.pulseVelocity * dt);\r
        dirty = true;\r
      }\r
      if (dirty) draw();\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const start = () => {\r
      if (raf || !visible) return;\r
      last = 0;\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const onMove = (event: PointerEvent) => {\r
      const point = toWorld(event.clientX, event.clientY);\r
      pointer.x = point.x;\r
      pointer.y = point.y;\r
      pointer.inside = point.inside;\r
    };\r
    const onLeave = (event: PointerEvent) => {\r
      if (!event.relatedTarget) pointer.inside = false;\r
    };\r
    const onLift = (event: PointerEvent) => {\r
      if (event.pointerType !== 'mouse') pointer.inside = false;\r
    };\r
    const onDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      if (!s.clickBurst || !s.enableMouseInteraction || s.paused || event.button !== 0) return;\r
      const point = toWorld(event.clientX, event.clientY);\r
      if (point.inside) burst(point.x, point.y);\r
    };\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(container);\r
    const intersection = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible) start();\r
    });\r
    intersection.observe(container);\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    window.addEventListener('pointerdown', onDown, { passive: true });\r
    window.addEventListener('pointerout', onLeave);\r
    window.addEventListener('pointerup', onLift);\r
    window.addEventListener('pointercancel', onLift);\r
\r
    resize();\r
    start();\r
    engineRef.current = {\r
      refresh: () => {\r
        dirty = true;\r
      }\r
    };\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onMove);\r
      window.removeEventListener('pointerdown', onDown);\r
      window.removeEventListener('pointerout', onLeave);\r
      window.removeEventListener('pointerup', onLift);\r
      window.removeEventListener('pointercancel', onLift);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteProgram(program);\r
      engineRef.current = null;\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    engineRef.current?.refresh();\r
  });\r
\r
  return (\r
    <div ref={containerRef} className={\`metaballs-container \${className}\`.trim()} style={style}>\r
      <canvas ref={canvasRef} className="metaballs-canvas" />\r
    </div>\r
  );\r
};\r
\r
export default MetaBalls;\r
`,o=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties } from 'react';\r
\r
type Variant = 'solid' | 'outline' | 'contour';\r
type Motion = 'orbit' | 'drift' | 'lava';\r
\r
interface MetaBallsProps {\r
  className?: string;\r
  color?: string;\r
  cursorBallColor?: string;\r
  speed?: number;\r
  enableMouseInteraction?: boolean;\r
  hoverSmoothness?: number;\r
  animationSize?: number;\r
  ballCount?: number;\r
  clumpFactor?: number;\r
  cursorBallSize?: number;\r
  enableTransparency?: boolean;\r
  variant?: Variant;\r
  motion?: Motion;\r
  gooeyness?: number;\r
  stickiness?: number;\r
  stretch?: number;\r
  wobble?: number;\r
  lineWidth?: number;\r
  rings?: number;\r
  clickBurst?: boolean;\r
  intro?: boolean;\r
  paused?: boolean;\r
  dpr?: number;\r
  style?: CSSProperties;\r
}\r
\r
interface Body {\r
  vx: number;\r
  vy: number;\r
  a: number;\r
  b: number;\r
  va: number;\r
  vb: number;\r
}\r
\r
interface Look {\r
  size: number;\r
  time: number;\r
}\r
\r
const MAX_BALLS = 50;\r
const SLOTS = MAX_BALLS + 1;\r
const VARIANTS: Record<string, number> = { solid: 0, outline: 1, contour: 2 };\r
const VISIBLE = 0.877;\r
\r
const fract = (x: number) => x - Math.floor(x);\r
\r
const hash31 = (p: number) => {\r
  const r = [p * 0.1031, p * 0.103, p * 0.0973].map(fract);\r
  const dot = r[0] * (r[1] + 33.33) + r[1] * (r[2] + 33.33) + r[2] * (r[0] + 33.33);\r
  return r.map(value => fract(value + dot));\r
};\r
\r
const hash33 = (v: number[]) => {\r
  const p = [v[0] * 0.1031, v[1] * 0.103, v[2] * 0.0973].map(fract);\r
  const dot = p[0] * (p[1] + 33.33) + p[1] * (p[0] + 33.33) + p[2] * (p[2] + 33.33);\r
  const q = p.map(value => fract(value + dot));\r
  return [fract((q[0] + q[1]) * q[2]), fract((q[0] + q[0]) * q[1]), fract((q[1] + q[0]) * q[0])];\r
};\r
\r
const toRgb = (color: string): [number, number, number] => {\r
  let hex = String(color || '')\r
    .trim()\r
    .replace('#', '');\r
  if (hex.length === 3) hex = hex.replace(/./g, c => c + c);\r
  if (!/^[0-9a-f]{6}/i.test(hex)) return [1, 1, 1];\r
  return [0, 2, 4].map(index => parseInt(hex.slice(index, index + 2), 16) / 255) as [number, number, number];\r
};\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
const smoothstep = (a: number, b: number, x: number) => {\r
  const t = clamp((x - a) / (b - a), 0, 1);\r
  return t * t * (3 - 2 * t);\r
};\r
const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);\r
const easeInOut = (t: number) => {\r
  const x = clamp(t, 0, 1);\r
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;\r
};\r
\r
const VERTEX = \`#version 300 es\r
in vec2 position;\r
void main() {\r
  gl_Position = vec4(position, 0.0, 1.0);\r
}\r
\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
\r
uniform vec2 uResolution;\r
uniform float uScale;\r
uniform vec4 uBalls[\${SLOTS}];\r
uniform vec4 uShapes[\${SLOTS}];\r
uniform int uCount;\r
uniform float uGamma;\r
uniform float uThreshold;\r
uniform vec3 uColor;\r
uniform vec3 uCursorColor;\r
uniform int uVariant;\r
uniform float uLine;\r
uniform float uSpacing;\r
uniform float uRings;\r
uniform float uOpaque;\r
\r
out vec4 outColor;\r
\r
void main() {\r
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution) * uScale;\r
  float field = 0.0;\r
  float tint = 0.0;\r
  float mass = 0.0;\r
  vec2 grad = vec2(0.0);\r
  bool classic = abs(uGamma - 1.0) < 0.001;\r
  for (int i = 0; i < \${SLOTS}; i++) {\r
    if (i >= uCount) break;\r
    vec4 ball = uBalls[i];\r
    vec4 shape = uShapes[i];\r
    vec2 d = p - ball.xy;\r
    vec2 q = vec2(shape.x * d.x + shape.y * d.y, shape.y * d.x + shape.z * d.y);\r
    float qq = max(dot(q, q), ball.z * 1e-4 + 1e-12);\r
    float v = ball.z / qq;\r
    float w = classic ? v : pow(v, uGamma);\r
    field += w;\r
    float weight = w / (1.0 + w / uThreshold);\r
    mass += weight;\r
    tint += weight * ball.w;\r
    grad -= 2.0 * uGamma * w / qq * vec2(shape.x * q.x + shape.y * q.y, shape.y * q.x + shape.z * q.y);\r
  }\r
  float slope = max(length(grad) * uScale, 1e-8);\r
  vec3 color = mix(uColor, uCursorColor, mass > 0.0 ? clamp(tint / mass, 0.0, 1.0) : 0.0);\r
  float alpha;\r
  if (uVariant == 0) {\r
    alpha = field > 3.0 * uThreshold ? 1.0 : clamp((field - uThreshold) / slope + 0.5, 0.0, 1.0);\r
  } else if (uVariant == 1) {\r
    alpha = field > 3.0 * uThreshold ? 0.0 : clamp(0.5 * uLine + 0.5 - abs((field - uThreshold) / slope), 0.0, 1.0);\r
  } else {\r
    float rho = pow(max(field / uThreshold, 1e-6), -0.5 / uGamma);\r
    float rate = rho * slope / (2.0 * uGamma * max(field, 1e-8));\r
    float u = (rho - 1.0) / uSpacing;\r
    float ring = floor(u + 0.5);\r
    float gap = (u - ring) * uSpacing / max(rate, 1e-8);\r
    alpha = clamp(0.5 * uLine + 0.5 - abs(gap), 0.0, 1.0);\r
    alpha *= ring < -0.5 || ring > uRings + 0.5 ? 0.0 : 1.0 - ring / (uRings + 1.0);\r
    if (ring > 0.5) alpha *= smoothstep(uLine * 6.0, uLine * 12.0, uSpacing / max(rate, 1e-8));\r
  }\r
  outColor = vec4(color * alpha, uOpaque > 0.5 ? 1.0 : alpha);\r
}\r
\`;\r
\r
const compile = (gl: WebGL2RenderingContext, type: number, source: string) => {\r
  const shader = gl.createShader(type) as WebGLShader;\r
  gl.shaderSource(shader, source);\r
  gl.compileShader(shader);\r
  return shader;\r
};\r
\r
const createBall = (index: number) => {\r
  const h1 = hash31(index + 1);\r
  const h2 = hash33(h1);\r
  return {\r
    start: h1[0] * Math.PI * 2,\r
    rate: 0.1 * Math.PI + h1[1] * 0.3 * Math.PI,\r
    reach: 5 + h1[1] * 5,\r
    toggle: Math.floor(h2[0] * 2),\r
    radius: 0.5 + h2[2] * 1.5,\r
    lane: h2[1] * 2 - 1,\r
    rise: 0.55 + h1[2] * 0.7,\r
    sway: h2[0] * Math.PI * 2,\r
    delay: 0.1 + fract(h1[2] * 7.31 + h2[1] * 3.17) * 0.55,\r
    x: 0,\r
    y: 0,\r
    vx: 0,\r
    vy: 0,\r
    fx: 0,\r
    fy: 0,\r
    ax: 0,\r
    ay: 0,\r
    avx: 0,\r
    avy: 0,\r
    a: 0,\r
    b: 0,\r
    va: 0,\r
    vb: 0\r
  };\r
};\r
\r
type Ball = ReturnType<typeof createBall>;\r
\r
const MetaBalls = ({\r
  className = '',\r
  color = '#ffffff',\r
  cursorBallColor = '#ffffff',\r
  speed = 0.3,\r
  enableMouseInteraction = true,\r
  hoverSmoothness = 0.1,\r
  animationSize = 30,\r
  ballCount = 15,\r
  clumpFactor = 1,\r
  cursorBallSize = 3,\r
  enableTransparency = false,\r
  variant = 'solid',\r
  motion = 'orbit',\r
  gooeyness = 0.5,\r
  stickiness = 0.5,\r
  stretch = 0.5,\r
  wobble = 0.5,\r
  lineWidth = 1.5,\r
  rings = 4,\r
  clickBurst = true,\r
  intro = true,\r
  paused = false,\r
  dpr,\r
  style\r
}: MetaBallsProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const settings = {\r
    color,\r
    cursorBallColor,\r
    speed,\r
    enableMouseInteraction,\r
    hoverSmoothness,\r
    animationSize,\r
    ballCount,\r
    clumpFactor,\r
    cursorBallSize,\r
    enableTransparency,\r
    variant,\r
    motion,\r
    gooeyness,\r
    stickiness,\r
    stretch,\r
    wobble,\r
    lineWidth,\r
    rings,\r
    clickBurst,\r
    paused,\r
    dpr\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
  const introRef = useRef(intro);\r
  const engineRef = useRef<{ refresh: () => void } | null>(null);\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    if (!container || !canvas) return;\r
    const gl = canvas.getContext('webgl2', { alpha: true, antialias: false, premultipliedAlpha: true });\r
    if (!gl) return;\r
\r
    const program = gl.createProgram() as WebGLProgram;\r
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));\r
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));\r
    gl.bindAttribLocation(program, 0, 'position');\r
    gl.linkProgram(program);\r
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;\r
    gl.useProgram(program);\r
\r
    const buffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const uniform = (name: string) => gl.getUniformLocation(program, name);\r
    const loc = {\r
      resolution: uniform('uResolution'),\r
      scale: uniform('uScale'),\r
      balls: uniform('uBalls'),\r
      shapes: uniform('uShapes'),\r
      count: uniform('uCount'),\r
      gamma: uniform('uGamma'),\r
      threshold: uniform('uThreshold'),\r
      color: uniform('uColor'),\r
      cursorColor: uniform('uCursorColor'),\r
      variant: uniform('uVariant'),\r
      line: uniform('uLine'),\r
      spacing: uniform('uSpacing'),\r
      rings: uniform('uRings'),\r
      opaque: uniform('uOpaque')\r
    };\r
\r
    const ballData = new Float32Array(SLOTS * 4);\r
    const shapeData = new Float32Array(SLOTS * 4);\r
    const balls = Array.from({ length: MAX_BALLS }, (_, index) => createBall(index));\r
    const idle = createBall(MAX_BALLS + 7);\r
    const cursor = { x: 0, y: 0, vx: 0, vy: 0, a: 0, b: 0, va: 0, vb: 0, pulse: 0, pulseVelocity: 0, ready: false };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
    const view = { width: 1, height: 1, ratio: 1 };\r
    const colors = new Map<string, [number, number, number]>();\r
    const rgb = (value: string) => {\r
      if (!colors.has(value)) colors.set(value, toRgb(value));\r
      return colors.get(value) as [number, number, number];\r
    };\r
    let phase = 0;\r
    let clock = 0;\r
    let introAt = introRef.current && !reduced ? 0 : -1;\r
    let visible = true;\r
    let raf = 0;\r
    let last = 0;\r
    let dirty = true;\r
\r
    const resize = () => {\r
      const rect = container.getBoundingClientRect();\r
      const s = settingsRef.current;\r
      const ratio = Math.max(0.5, Math.min(s.dpr ?? window.devicePixelRatio ?? 1, 2));\r
      view.width = Math.max(1, rect.width);\r
      view.height = Math.max(1, rect.height);\r
      view.ratio = ratio;\r
      canvas.width = Math.max(1, Math.round(view.width * ratio));\r
      canvas.height = Math.max(1, Math.round(view.height * ratio));\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      dirty = true;\r
    };\r
\r
    const toWorld = (clientX: number, clientY: number) => {\r
      const rect = container.getBoundingClientRect();\r
      const scale = settingsRef.current.animationSize / Math.max(1, rect.height);\r
      return {\r
        x: (clientX - rect.left - rect.width / 2) * scale,\r
        y: (rect.top + rect.height / 2 - clientY) * scale,\r
        inside: clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom\r
      };\r
    };\r
\r
    const presence = (): Look => {\r
      if (introAt < 0) return { size: 1, time: Infinity };\r
      const t = clock - introAt;\r
      return { size: easeOut(t / 0.5), time: t };\r
    };\r
\r
    const release = (ball: Ball, look: Look) =>\r
      look.time === Infinity ? 1 : easeInOut((look.time - ball.delay) / 1.15);\r
\r
    const anchor = (ball: Ball, s: typeof settings, spread: number): [number, number] => {\r
      const halfWidth = (s.animationSize * view.width) / view.height / 2;\r
      const halfHeight = s.animationSize / 2;\r
      const clump = Math.min(1.25, s.clumpFactor);\r
      if (s.motion === 'lava') {\r
        const cycle = Math.sin(phase * ball.rise * 1.6 + ball.start);\r
        const x =\r
          ball.lane * halfWidth * 0.8 * clump + Math.sin(phase * 0.5 * ball.rise + ball.sway) * halfWidth * 0.06;\r
        const y = Math.sign(cycle) * Math.pow(Math.abs(cycle), 0.55) * halfHeight * 0.9;\r
        return [x * spread, y * spread];\r
      }\r
      if (s.motion === 'drift') {\r
        const x = Math.sin(phase * ball.rise * 0.9 + ball.start) * halfWidth * 0.84 * clump;\r
        const y = Math.sin(phase * ball.rate * 1.3 + ball.sway) * halfHeight * 0.78 * clump;\r
        return [x * spread, y * spread];\r
      }\r
      const t = phase * ball.rate;\r
      const angle = ball.start + t;\r
      return [\r
        Math.cos(angle) * ball.reach * s.clumpFactor * spread,\r
        Math.sin(angle + t * ball.toggle) * ball.reach * s.clumpFactor * spread\r
      ];\r
    };\r
\r
    const deform = (body: Body, h: number, s: typeof settings) => {\r
      const speed = Math.hypot(body.vx, body.vy);\r
      const amount = 0.6 * s.stretch * Math.tanh(speed / 14);\r
      let ta = 0;\r
      let tb = 0;\r
      if (speed > 1e-4) {\r
        ta = (amount * (body.vx * body.vx - body.vy * body.vy)) / (speed * speed);\r
        tb = (amount * 2 * body.vx * body.vy) / (speed * speed);\r
      }\r
      const omega = 13;\r
      const zeta = 0.85 - 0.68 * clamp(s.wobble, 0, 1);\r
      body.va += (omega * omega * (ta - body.a) - 2 * zeta * omega * body.va) * h;\r
      body.vb += (omega * omega * (tb - body.b) - 2 * zeta * omega * body.vb) * h;\r
      body.a += body.va * h;\r
      body.b += body.vb * h;\r
    };\r
\r
    const bridge = (s: typeof settings) => {\r
      const goo = clamp(s.gooeyness, 0, 1);\r
      const gamma = goo < 0.5 ? 1 + (0.5 - goo) * 1.2 : 1 - (goo - 0.5) * 0.5;\r
      return { gamma, threshold: Math.pow(1.3, gamma), reach: Math.pow(2, 0.5 / gamma) };\r
    };\r
\r
    const step = (h: number, s: typeof settings, count: number, look: Look) => {\r
      const { reach } = bridge(s);\r
      const pull = 36 * clamp(s.stickiness, 0, 1);\r
      const cursorRadius = s.cursorBallSize * VISIBLE * look.size * (1 + cursor.pulse);\r
      phase += h * s.speed;\r
\r
      for (let i = 0; i < count; i++) {\r
        const ball = balls[i];\r
        const [x, y] = anchor(ball, s, release(ball, look));\r
        ball.avx = clamp((x - ball.ax) / h, -40, 40);\r
        ball.avy = clamp((y - ball.ay) / h, -40, 40);\r
        ball.ax = x;\r
        ball.ay = y;\r
        ball.fx = 20 * (x - ball.x) - 5.4 * (ball.vx - ball.avx);\r
        ball.fy = 20 * (y - ball.y) - 5.4 * (ball.vy - ball.avy);\r
      }\r
\r
      for (let i = 0; i < count; i++) {\r
        const p = balls[i];\r
        const rp = p.radius * VISIBLE * look.size;\r
        for (let j = i + 1; j < count; j++) {\r
          const q = balls[j];\r
          const rq = q.radius * VISIBLE * look.size;\r
          const dx = q.x - p.x;\r
          const dy = q.y - p.y;\r
          const distance = Math.hypot(dx, dy) || 1e-4;\r
          const far = (rp + rq) * reach;\r
          if (distance >= far) continue;\r
          const core = (rp + rq) * 0.62;\r
          let force;\r
          if (distance < core) force = -60 * (core - distance);\r
          else {\r
            const t = (distance - core) / (far - core);\r
            force = pull * Math.min(rp, rq) * smoothstep(0, 0.6, t) * (1 - smoothstep(0.82, 1, t));\r
          }\r
          const nx = dx / distance;\r
          const ny = dy / distance;\r
          const mp = rp * rp + 0.05;\r
          const mq = rq * rq + 0.05;\r
          p.fx += (nx * force) / mp;\r
          p.fy += (ny * force) / mp;\r
          q.fx -= (nx * force) / mq;\r
          q.fy -= (ny * force) / mq;\r
        }\r
        const dx = cursor.x - p.x;\r
        const dy = cursor.y - p.y;\r
        const distance = Math.hypot(dx, dy) || 1e-4;\r
        const far = (rp + cursorRadius) * reach;\r
        if (distance < far) {\r
          const core = (rp + cursorRadius) * 0.62;\r
          let force;\r
          if (distance < core) force = -140 * (core - distance);\r
          else {\r
            const t = (distance - core) / (far - core);\r
            force = pull * 0.6 * rp * smoothstep(0, 0.6, t) * (1 - smoothstep(0.82, 1, t));\r
          }\r
          p.fx += ((dx / distance) * force) / (rp * rp + 0.05);\r
          p.fy += ((dy / distance) * force) / (rp * rp + 0.05);\r
        }\r
      }\r
\r
      for (let i = 0; i < count; i++) {\r
        const ball = balls[i];\r
        ball.vx += ball.fx * h;\r
        ball.vy += ball.fy * h;\r
        ball.x += ball.vx * h;\r
        ball.y += ball.vy * h;\r
        deform(ball, h, s);\r
        if (!Number.isFinite(ball.x + ball.y + ball.vx + ball.vy + ball.a + ball.b + ball.va + ball.vb)) {\r
          Object.assign(ball, { x: ball.ax, y: ball.ay, vx: 0, vy: 0, a: 0, b: 0, va: 0, vb: 0 });\r
        }\r
      }\r
    };\r
\r
    const moveCursor = (dt: number, s: typeof settings, look: Look) => {\r
      let tx: number;\r
      let ty: number;\r
      if (pointer.inside && s.enableMouseInteraction) {\r
        tx = pointer.x;\r
        ty = pointer.y;\r
      } else {\r
        const out = look.time === Infinity ? 1 : easeInOut((look.time - 0.75) / 1.3);\r
        if (s.motion === 'lava' || s.motion === 'drift') {\r
          [tx, ty] = anchor(idle, s, out);\r
        } else {\r
          const halfWidth = (s.animationSize * view.width) / view.height / 2;\r
          const halfHeight = s.animationSize / 2;\r
          tx = Math.cos(clock * s.speed) * halfWidth * 0.3 * out;\r
          ty = Math.sin(clock * s.speed) * halfHeight * 0.3 * out;\r
        }\r
      }\r
      if (!cursor.ready) {\r
        cursor.x = tx;\r
        cursor.y = ty;\r
        cursor.ready = true;\r
      }\r
      const follow = 1 - Math.pow(1 - clamp(s.hoverSmoothness, 0.001, 1), dt * 60);\r
      const nx = cursor.x + (tx - cursor.x) * follow;\r
      const ny = cursor.y + (ty - cursor.y) * follow;\r
      const blend = 1 - Math.exp(-dt / 0.05);\r
      cursor.vx += ((nx - cursor.x) / Math.max(dt, 1e-4) - cursor.vx) * blend;\r
      cursor.vy += ((ny - cursor.y) / Math.max(dt, 1e-4) - cursor.vy) * blend;\r
      cursor.x = nx;\r
      cursor.y = ny;\r
    };\r
\r
    const burst = (x: number, y: number) => {\r
      const s = settingsRef.current;\r
      const count = clamp(Math.round(s.ballCount), 0, MAX_BALLS);\r
      const radius = s.animationSize * 0.45;\r
      for (let i = 0; i < count; i++) {\r
        const ball = balls[i];\r
        const dx = ball.x - x;\r
        const dy = ball.y - y;\r
        const distance = Math.hypot(dx, dy) || 1e-4;\r
        if (distance > radius) continue;\r
        const falloff = Math.pow(1 - distance / radius, 1.2);\r
        const kick = 72 * falloff;\r
        ball.vx += (dx / distance) * kick - (dy / distance) * kick * 0.3;\r
        ball.vy += (dy / distance) * kick + (dx / distance) * kick * 0.3;\r
      }\r
      cursor.pulseVelocity += 9;\r
    };\r
\r
    const shapeOf = (body: Body, out: Float32Array, offset: number) => {\r
      const m = Math.hypot(body.a, body.b);\r
      const c = Math.cosh(m);\r
      const k = m > 1e-6 ? Math.sinh(m) / m : 1;\r
      out[offset] = c - k * body.a;\r
      out[offset + 1] = -k * body.b;\r
      out[offset + 2] = c + k * body.a;\r
      out[offset + 3] = 0;\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      const count = clamp(Math.round(s.ballCount), 0, MAX_BALLS);\r
      const look = presence();\r
      const { gamma, threshold } = bridge(s);\r
      for (let i = 0; i < count; i++) {\r
        const ball = balls[i];\r
        const radius = ball.radius * look.size;\r
        ballData[i * 4] = ball.x;\r
        ballData[i * 4 + 1] = ball.y;\r
        ballData[i * 4 + 2] = radius * radius;\r
        ballData[i * 4 + 3] = 0;\r
        shapeOf(ball, shapeData, i * 4);\r
      }\r
      const cursorRadius = s.cursorBallSize * look.size * (1 + cursor.pulse);\r
      ballData[count * 4] = cursor.x;\r
      ballData[count * 4 + 1] = cursor.y;\r
      ballData[count * 4 + 2] = cursorRadius * cursorRadius;\r
      ballData[count * 4 + 3] = 1;\r
      shapeOf(cursor, shapeData, count * 4);\r
\r
      gl.uniform2f(loc.resolution, canvas.width, canvas.height);\r
      gl.uniform1f(loc.scale, s.animationSize / canvas.height);\r
      gl.uniform4fv(loc.balls, ballData);\r
      gl.uniform4fv(loc.shapes, shapeData);\r
      gl.uniform1i(loc.count, count + 1);\r
      gl.uniform1f(loc.gamma, gamma);\r
      gl.uniform1f(loc.threshold, threshold);\r
      gl.uniform3fv(loc.color, rgb(s.color));\r
      gl.uniform3fv(loc.cursorColor, rgb(s.cursorBallColor));\r
      gl.uniform1i(loc.variant, VARIANTS[s.variant] ?? 0);\r
      gl.uniform1f(loc.line, Math.max(0.25, s.lineWidth) * view.ratio);\r
      gl.uniform1f(loc.spacing, 0.28);\r
      gl.uniform1f(loc.rings, clamp(Math.round(s.rings), 0, 12));\r
      gl.uniform1f(loc.opaque, s.enableTransparency ? 0 : 1);\r
      gl.clearColor(0, 0, 0, s.enableTransparency ? 0 : 1);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      dirty = false;\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible) return;\r
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 1 / 60);\r
      last = now;\r
      const s = settingsRef.current;\r
      if (!s.paused && dt > 1e-4) {\r
        clock += dt;\r
        const count = clamp(Math.round(s.ballCount), 0, MAX_BALLS);\r
        const look = presence();\r
        moveCursor(dt, s, look);\r
        const steps = Math.max(1, Math.ceil(dt / (1 / 240)));\r
        for (let i = 0; i < steps; i++) step(dt / steps, s, count, look);\r
        deform(cursor, dt, s);\r
        cursor.pulseVelocity += (-170 * cursor.pulse - 2 * 0.42 * 13 * cursor.pulseVelocity) * dt;\r
        cursor.pulse = Math.max(-0.4, cursor.pulse + cursor.pulseVelocity * dt);\r
        dirty = true;\r
      }\r
      if (dirty) draw();\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const start = () => {\r
      if (raf || !visible) return;\r
      last = 0;\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const onMove = (event: PointerEvent) => {\r
      const point = toWorld(event.clientX, event.clientY);\r
      pointer.x = point.x;\r
      pointer.y = point.y;\r
      pointer.inside = point.inside;\r
    };\r
    const onLeave = (event: PointerEvent) => {\r
      if (!event.relatedTarget) pointer.inside = false;\r
    };\r
    const onLift = (event: PointerEvent) => {\r
      if (event.pointerType !== 'mouse') pointer.inside = false;\r
    };\r
    const onDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      if (!s.clickBurst || !s.enableMouseInteraction || s.paused || event.button !== 0) return;\r
      const point = toWorld(event.clientX, event.clientY);\r
      if (point.inside) burst(point.x, point.y);\r
    };\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(container);\r
    const intersection = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible) start();\r
    });\r
    intersection.observe(container);\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    window.addEventListener('pointerdown', onDown, { passive: true });\r
    window.addEventListener('pointerout', onLeave);\r
    window.addEventListener('pointerup', onLift);\r
    window.addEventListener('pointercancel', onLift);\r
\r
    resize();\r
    start();\r
    engineRef.current = {\r
      refresh: () => {\r
        dirty = true;\r
      }\r
    };\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onMove);\r
      window.removeEventListener('pointerdown', onDown);\r
      window.removeEventListener('pointerout', onLeave);\r
      window.removeEventListener('pointerup', onLift);\r
      window.removeEventListener('pointercancel', onLift);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteProgram(program);\r
      engineRef.current = null;\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    engineRef.current?.refresh();\r
  });\r
\r
  return (\r
    <div ref={containerRef} className={\`relative h-full w-full \${className}\`.trim()} style={style}>\r
      <canvas ref={canvasRef} className="block h-full w-full" />\r
    </div>\r
  );\r
};\r
\r
export default MetaBalls;\r
`,a={dependencies:"",usage:`import MetaBalls from './MetaBalls';

<div style={{ width: '100%', height: '480px', position: 'relative' }}>
  <MetaBalls
    color="#ffffff"
    cursorBallColor="#ffffff"
    variant="solid"
    motion="orbit"
    ballCount={15}
    animationSize={30}
    gooeyness={0.5}
    stretch={0.5}
    wobble={0.5}
    enableTransparency={true}
  />
</div>`,code:n,css:r,tailwind:e,tsCode:t,tsTailwind:o};export{a as metaBalls};
