const n=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
import './DotGrid.css';\r
\r
const VERTEX = \`#version 300 es\r
precision highp float;\r
\r
layout(location = 0) in vec2 aCorner;\r
layout(location = 1) in vec4 aMotion;\r
layout(location = 2) in vec2 aState;\r
\r
uniform vec2 uResolution;\r
uniform float uSize;\r
uniform float uSwell;\r
uniform float uStretch;\r
uniform float uGlow;\r
\r
out vec2 vLocal;\r
out vec2 vPoint;\r
out float vLength;\r
out float vRadius;\r
out float vEnergy;\r
\r
void main() {\r
  float energy = aState.x;\r
  float radius = 0.5 * uSize * aState.y * (1.0 + uSwell * energy);\r
  float speed = length(aMotion.zw);\r
  float angle = speed > 0.001 ? atan(aMotion.w, aMotion.z) : 0.0;\r
  float axis = floor(angle / 1.5707963 + 0.5) * 1.5707963;\r
  angle = axis + (angle - axis) * smoothstep(8.0, 70.0, speed);\r
  vec2 dir = vec2(cos(angle), sin(angle));\r
  float halfLength = min(uSize * 2.0, speed * uStretch * 0.02);\r
  float pad = radius * (1.0 + uGlow * energy * 2.5) + 2.0;\r
  vec2 local = aCorner * vec2(halfLength + pad, pad);\r
  vec2 point = aMotion.xy + dir * local.x + vec2(-dir.y, dir.x) * local.y;\r
  vLocal = local;\r
  vPoint = point;\r
  vLength = halfLength;\r
  vRadius = radius;\r
  vEnergy = energy;\r
  vec2 clip = point / uResolution * 2.0 - 1.0;\r
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);\r
}\r
\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
\r
in vec2 vLocal;\r
in vec2 vPoint;\r
in float vLength;\r
in float vRadius;\r
in float vEnergy;\r
\r
uniform vec2 uResolution;\r
uniform vec3 uBase;\r
uniform vec3 uActive;\r
uniform float uGlow;\r
uniform float uOpacity;\r
uniform float uFade;\r
uniform int uShape;\r
\r
out vec4 outColor;\r
\r
float smootherstep01(float t) {\r
  t = clamp(t, 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  float d;\r
  if (uShape == 1) {\r
    float corner = vRadius * 0.3;\r
    vec2 q = abs(vLocal) - vec2(vLength + vRadius, vRadius) + corner;\r
    d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - corner;\r
  } else {\r
    d = length(vec2(max(abs(vLocal.x) - vLength, 0.0), vLocal.y)) - vRadius;\r
  }\r
  float aa = max(fwidth(d), 0.0001);\r
  float body = clamp(0.5 - d / aa, 0.0, 1.0);\r
  float halo = uGlow * vEnergy * 0.5 * exp(-max(d, 0.0) / max(vRadius * 1.3, 0.6));\r
  float alpha = body + (1.0 - body) * halo;\r
  vec3 color = mix(uBase, uActive, clamp(vEnergy * 1.2, 0.0, 1.0));\r
  float fade = 1.0;\r
  if (uFade > 0.0) {\r
    vec2 edge = min(vPoint, uResolution - vPoint) / (uFade * 0.4 * min(uResolution.x, uResolution.y));\r
    fade = smootherstep01(edge.x) * smootherstep01(edge.y);\r
  }\r
  alpha *= uOpacity * fade;\r
  outColor = vec4(color * alpha, alpha);\r
}\r
\`;\r
\r
const toRgb = color => {\r
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(color).trim());\r
  if (!match) return [1, 1, 1];\r
  const hex = match[1].length === 3 ? match[1].replace(/./g, digit => digit + digit) : match[1];\r
  return [0, 2, 4].map(index => parseInt(hex.slice(index, index + 2), 16) / 255);\r
};\r
\r
const smootherstep = t => {\r
  const x = Math.min(1, Math.max(0, t));\r
  return x * x * x * (x * (x * 6 - 15) + 10);\r
};\r
\r
const backOut = t => {\r
  const s = 1.9;\r
  const x = t - 1;\r
  return 1 + x * x * ((s + 1) * x + s);\r
};\r
\r
const compile = (gl, type, source) => {\r
  const shader = gl.createShader(type);\r
  gl.shaderSource(shader, source);\r
  gl.compileShader(shader);\r
  return shader;\r
};\r
\r
const DotGrid = ({\r
  dotSize = 5,\r
  gap = 18,\r
  baseColor = '#3a3446',\r
  activeColor = '#ffffff',\r
  proximity = 140,\r
  strength = 1,\r
  bounce = 0.6,\r
  tension = 0.4,\r
  returnDuration = 0.8,\r
  shockRadius = 320,\r
  shockStrength = 5,\r
  swell = 0.8,\r
  stretch = 0.5,\r
  glow = 0.5,\r
  shape = 'circle',\r
  fade = 0,\r
  opacity = 1,\r
  intro = true,\r
  mouseInteraction = true,\r
  clickShock = true,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  style\r
}) => {\r
  const canvasRef = useRef(null);\r
  const engineRef = useRef(null);\r
  const settings = {\r
    dotSize,\r
    gap,\r
    baseColor,\r
    activeColor,\r
    proximity,\r
    strength,\r
    bounce,\r
    tension,\r
    returnDuration,\r
    shockRadius,\r
    shockStrength,\r
    swell,\r
    stretch,\r
    glow,\r
    shape,\r
    fade,\r
    opacity,\r
    intro,\r
    mouseInteraction,\r
    clickShock,\r
    paused,\r
    dpr\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const canvas = canvasRef.current;\r
    if (!canvas) return;\r
    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });\r
    if (!gl) return;\r
\r
    const program = gl.createProgram();\r
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));\r
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));\r
    gl.linkProgram(program);\r
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;\r
\r
    const uniforms = {};\r
    for (const name of [\r
      'uResolution',\r
      'uSize',\r
      'uSwell',\r
      'uStretch',\r
      'uGlow',\r
      'uBase',\r
      'uActive',\r
      'uOpacity',\r
      'uFade',\r
      'uShape'\r
    ]) {\r
      uniforms[name] = gl.getUniformLocation(program, name);\r
    }\r
\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    const cornerBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    const instanceBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);\r
    gl.enableVertexAttribArray(1);\r
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 24, 0);\r
    gl.vertexAttribDivisor(1, 1);\r
    gl.enableVertexAttribArray(2);\r
    gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 24, 16);\r
    gl.vertexAttribDivisor(2, 1);\r
    gl.bindVertexArray(null);\r
\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
    const view = { width: 0, height: 0, left: 0, top: 0, ratio: 1 };\r
    const grid = { count: 0, cols: 1, rows: 1, cell: 1, centerX: 0, centerY: 0, reach: 1 };\r
    let rest = new Float32Array(0);\r
    let offset = new Float32Array(0);\r
    let velocity = new Float32Array(0);\r
    let force = new Float32Array(0);\r
    let next = new Float32Array(0);\r
    let wave = new Float32Array(0);\r
    let energy = new Float32Array(0);\r
    let instances = new Float32Array(0);\r
    const pointer = { x: 0, y: 0, vx: 0, vy: 0, time: 0, inside: false, presence: 0 };\r
    const shocks = [];\r
    let introStart = settingsRef.current.intro && !reduced ? -1 : null;\r
    let visible = true;\r
    let raf = 0;\r
    let last = 0;\r
\r
    const rebuild = () => {\r
      const { dotSize: size, gap: spacing } = settingsRef.current;\r
      const cell = Math.max(2, size + spacing);\r
      const cols = Math.max(1, Math.floor((view.width + spacing) / cell));\r
      const rows = Math.max(1, Math.floor((view.height + spacing) / cell));\r
      const startX = (view.width - (cols * cell - spacing)) / 2 + size / 2;\r
      const startY = (view.height - (rows * cell - spacing)) / 2 + size / 2;\r
      const count = cols * rows;\r
      rest = new Float32Array(count * 2);\r
      offset = new Float32Array(count * 2);\r
      velocity = new Float32Array(count * 2);\r
      force = new Float32Array(count * 2);\r
      next = new Float32Array(count * 2);\r
      wave = new Float32Array(count * 4);\r
      energy = new Float32Array(count);\r
      instances = new Float32Array(count * 6);\r
      for (let row = 0; row < rows; row++) {\r
        for (let col = 0; col < cols; col++) {\r
          const index = (row * cols + col) * 2;\r
          rest[index] = startX + col * cell;\r
          rest[index + 1] = startY + row * cell;\r
        }\r
      }\r
      Object.assign(grid, {\r
        count,\r
        cols,\r
        rows,\r
        cell,\r
        centerX: view.width / 2,\r
        centerY: view.height / 2,\r
        reach: Math.hypot(view.width, view.height) / 2\r
      });\r
      gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, instances.byteLength, gl.DYNAMIC_DRAW);\r
    };\r
\r
    const resize = () => {\r
      const rect = canvas.getBoundingClientRect();\r
      const ratio = Math.min(settingsRef.current.dpr ?? window.devicePixelRatio ?? 1, 2);\r
      const width = Math.max(1, Math.round(rect.width));\r
      const height = Math.max(1, Math.round(rect.height));\r
      Object.assign(view, { width, height, left: rect.left, top: rect.top, ratio });\r
      canvas.width = Math.round(width * ratio);\r
      canvas.height = Math.round(height * ratio);\r
      rebuild();\r
      render(performance.now());\r
    };\r
\r
    const step = (dt, now) => {\r
      const s = settingsRef.current;\r
      const motion = reduced ? 0 : 1;\r
      const zeta = 1 - 0.85 * Math.min(1, Math.max(0, s.bounce));\r
      const omega = 4 / (zeta * Math.max(0.2, s.returnDuration));\r
      const stiffness = omega * omega;\r
      const damping = 2 * zeta * omega;\r
      const radius = Math.max(1, s.proximity);\r
      const speed = Math.hypot(pointer.vx, pointer.vy);\r
      const drive = s.mouseInteraction && pointer.inside ? 6500 * Math.tanh(speed / 900) * s.strength * motion : 0;\r
      const dirX = speed > 0.001 ? pointer.vx / speed : 0;\r
      const dirY = speed > 0.001 ? pointer.vy / speed : 0;\r
      const width = grid.cell * 1.4;\r
      const travel = 650;\r
      const active = shocks.map(shock => {\r
        const front = ((now - shock.start) / 1000) * travel;\r
        const power = smootherstep(1 - front / Math.max(1, s.shockRadius));\r
        return { ...shock, front, amplitude: power * s.shockStrength * grid.cell * 0.24 * motion };\r
      });\r
      const coupling = (Math.max(0, s.tension) * 900) ** 2 / (grid.cell * grid.cell);\r
      const viscosity = Math.sqrt(coupling) * 0.06;\r
      const limit = Math.sqrt(stiffness + 8 * coupling) + damping + 8 * viscosity;\r
      const steps = Math.min(24, Math.max(1, Math.ceil(dt / Math.min(1 / 120, 1.2 / limit))));\r
      const h = dt / steps;\r
      for (let i = 0; i < grid.count; i++) {\r
        const index = i * 2;\r
        const rx = rest[index];\r
        const ry = rest[index + 1];\r
        let ax = 0;\r
        let ay = 0;\r
        if (drive > 0) {\r
          const ex = rx + offset[index] - pointer.x;\r
          const ey = ry + offset[index + 1] - pointer.y;\r
          const distance = Math.hypot(ex, ey);\r
          if (distance < radius) {\r
            const weight = smootherstep(1 - distance / radius) * drive;\r
            const nx = distance > 0.001 ? ex / distance : 0;\r
            const ny = distance > 0.001 ? ey / distance : 0;\r
            ax += weight * (dirX + nx * 0.6);\r
            ay += weight * (dirY + ny * 0.6);\r
          }\r
        }\r
        let wx = 0;\r
        let wy = 0;\r
        let wvx = 0;\r
        let wvy = 0;\r
        for (const shock of active) {\r
          if (shock.amplitude <= 0) continue;\r
          const ex = rx - shock.x;\r
          const ey = ry - shock.y;\r
          const distance = Math.hypot(ex, ey);\r
          const u = (distance - shock.front) / width;\r
          if (Math.abs(u) < 3 && distance > 0.001) {\r
            const nx = ex / distance;\r
            const ny = ey / distance;\r
            const profile = Math.exp(-u * u);\r
            const push = shock.amplitude * profile;\r
            const rate = ((shock.amplitude * 2 * u * profile) / width) * travel;\r
            wx += nx * push;\r
            wy += ny * push;\r
            wvx += nx * rate;\r
            wvy += ny * rate;\r
            ax += nx * push * stiffness * 0.35;\r
            ay += ny * push * stiffness * 0.35;\r
          }\r
        }\r
        force[index] = ax;\r
        force[index + 1] = ay;\r
        const target = i * 4;\r
        wave[target] = wx;\r
        wave[target + 1] = wy;\r
        wave[target + 2] = wvx;\r
        wave[target + 3] = wvy;\r
      }\r
      const { cols, rows } = grid;\r
      const stride = cols * 2;\r
      for (let n = 0; n < steps; n++) {\r
        for (let row = 0; row < rows; row++) {\r
          for (let col = 0; col < cols; col++) {\r
            const index = (row * cols + col) * 2;\r
            let ax = force[index] - stiffness * offset[index] - damping * velocity[index];\r
            let ay = force[index + 1] - stiffness * offset[index + 1] - damping * velocity[index + 1];\r
            if (coupling > 0) {\r
              let lx = -4 * offset[index];\r
              let ly = -4 * offset[index + 1];\r
              let mx = -4 * velocity[index];\r
              let my = -4 * velocity[index + 1];\r
              if (col > 0) {\r
                lx += offset[index - 2];\r
                ly += offset[index - 1];\r
                mx += velocity[index - 2];\r
                my += velocity[index - 1];\r
              }\r
              if (col < cols - 1) {\r
                lx += offset[index + 2];\r
                ly += offset[index + 3];\r
                mx += velocity[index + 2];\r
                my += velocity[index + 3];\r
              }\r
              if (row > 0) {\r
                lx += offset[index - stride];\r
                ly += offset[index - stride + 1];\r
                mx += velocity[index - stride];\r
                my += velocity[index - stride + 1];\r
              }\r
              if (row < rows - 1) {\r
                lx += offset[index + stride];\r
                ly += offset[index + stride + 1];\r
                mx += velocity[index + stride];\r
                my += velocity[index + stride + 1];\r
              }\r
              ax += coupling * lx + viscosity * mx;\r
              ay += coupling * ly + viscosity * my;\r
            }\r
            next[index] = velocity[index] + ax * h;\r
            next[index + 1] = velocity[index + 1] + ay * h;\r
          }\r
        }\r
        for (let i = 0; i < offset.length; i++) {\r
          velocity[i] = next[i];\r
          offset[i] += velocity[i] * h;\r
        }\r
      }\r
      for (let i = 0; i < grid.count; i++) {\r
        const index = i * 2;\r
        const target = i * 4;\r
        energy[i] = Math.min(\r
          1,\r
          (Math.hypot(velocity[index] + wave[target + 2], velocity[index + 1] + wave[target + 3]) / 380) * 0.85 +\r
            (Math.hypot(offset[index] + wave[target], offset[index + 1] + wave[target + 1]) / (grid.cell * 2.2)) * 0.35\r
        );\r
      }\r
      for (let i = shocks.length - 1; i >= 0; i--) {\r
        if (active[i].front > s.shockRadius + width * 3) shocks.splice(i, 1);\r
      }\r
      const decay = 1 - Math.exp(-dt / 0.08);\r
      pointer.vx -= pointer.vx * decay;\r
      pointer.vy -= pointer.vy * decay;\r
      const presenceTarget = s.mouseInteraction && pointer.inside ? 1 : 0;\r
      pointer.presence += (presenceTarget - pointer.presence) * (1 - Math.exp(-dt / 0.2));\r
    };\r
\r
    const render = now => {\r
      const s = settingsRef.current;\r
      const radius = Math.max(1, s.proximity);\r
      const introAge = introStart === null ? Infinity : introStart < 0 ? 0 : (now - introStart) / 1000;\r
      const introFront = introAge * grid.reach * 1.25;\r
      const introBand = grid.cell * 4;\r
      for (let i = 0; i < grid.count; i++) {\r
        const index = i * 2;\r
        const source = i * 4;\r
        const x = rest[index] + offset[index] + wave[source];\r
        const y = rest[index + 1] + offset[index + 1] + wave[source + 1];\r
        let glowing = energy[i];\r
        if (pointer.presence > 0.001) {\r
          const distance = Math.hypot(x - pointer.x, y - pointer.y);\r
          if (distance < radius)\r
            glowing = Math.max(glowing, smootherstep(1 - distance / radius) * 0.4 * pointer.presence);\r
        }\r
        let scale = 1;\r
        if (introStart !== null) {\r
          const distance = Math.hypot(rest[index] - grid.centerX, rest[index + 1] - grid.centerY);\r
          const appear = Math.min(1, Math.max(0, (introFront - distance) / introBand));\r
          scale = appear >= 1 ? 1 : Math.max(0, backOut(appear));\r
          glowing = Math.max(glowing, Math.sin(appear * Math.PI) * 0.6);\r
        }\r
        const target = i * 6;\r
        instances[target] = x;\r
        instances[target + 1] = y;\r
        instances[target + 2] = velocity[index] + wave[source + 2];\r
        instances[target + 3] = velocity[index + 1] + wave[source + 3];\r
        instances[target + 4] = glowing;\r
        instances[target + 5] = scale;\r
      }\r
      const base = toRgb(s.baseColor);\r
      const accent = toRgb(s.activeColor);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      gl.useProgram(program);\r
      gl.uniform2f(uniforms.uResolution, view.width, view.height);\r
      gl.uniform1f(uniforms.uSize, Math.max(0.5, s.dotSize));\r
      gl.uniform1f(uniforms.uSwell, reduced ? 0 : Math.max(0, s.swell));\r
      gl.uniform1f(uniforms.uStretch, reduced ? 0 : Math.max(0, s.stretch));\r
      gl.uniform1f(uniforms.uGlow, Math.max(0, s.glow));\r
      gl.uniform3f(uniforms.uBase, base[0], base[1], base[2]);\r
      gl.uniform3f(uniforms.uActive, accent[0], accent[1], accent[2]);\r
      gl.uniform1f(uniforms.uOpacity, Math.min(1, Math.max(0, s.opacity)));\r
      gl.uniform1f(uniforms.uFade, Math.min(1, Math.max(0, s.fade)));\r
      gl.uniform1i(uniforms.uShape, s.shape === 'square' ? 1 : 0);\r
      gl.bindVertexArray(vao);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);\r
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, instances);\r
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, grid.count);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const settled = now => {\r
      if (shocks.length) return false;\r
      if (introStart !== null) {\r
        if (introStart < 0 || (now - introStart) / 1000 < 1.6) return false;\r
        introStart = null;\r
      }\r
      if (Math.abs(pointer.vx) + Math.abs(pointer.vy) > 1) return false;\r
      const presenceTarget = settingsRef.current.mouseInteraction && pointer.inside ? 1 : 0;\r
      if (Math.abs(presenceTarget - pointer.presence) > 0.002) return false;\r
      for (let i = 0; i < offset.length; i++) {\r
        if (Math.abs(offset[i]) > 0.02 || Math.abs(velocity[i]) > 0.5) return false;\r
      }\r
      return true;\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (settingsRef.current.paused || !visible) return;\r
      if (introStart !== null && introStart < 0) introStart = now;\r
      const dt = Math.min(0.05, (now - last) / 1000 || 0);\r
      last = now;\r
      step(dt, now);\r
      render(now);\r
      if (!settled(now)) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (raf || settingsRef.current.paused || !visible) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const locate = event => {\r
      const rect = canvas.getBoundingClientRect();\r
      view.left = rect.left;\r
      view.top = rect.top;\r
      return [event.clientX - rect.left, event.clientY - rect.top];\r
    };\r
\r
    const onMove = event => {\r
      if (!settingsRef.current.mouseInteraction) return;\r
      const [x, y] = locate(event);\r
      const inside = x >= 0 && y >= 0 && x <= view.width && y <= view.height;\r
      const time = event.timeStamp || performance.now();\r
      if (inside && pointer.inside && pointer.time) {\r
        const elapsed = Math.max(4, time - pointer.time) / 1000;\r
        const vx = (x - pointer.x) / elapsed;\r
        const vy = (y - pointer.y) / elapsed;\r
        pointer.vx += (vx - pointer.vx) * 0.6;\r
        pointer.vy += (vy - pointer.vy) * 0.6;\r
      } else {\r
        pointer.vx = 0;\r
        pointer.vy = 0;\r
      }\r
      pointer.x = x;\r
      pointer.y = y;\r
      pointer.time = time;\r
      if (inside !== pointer.inside || inside) {\r
        pointer.inside = inside;\r
        wake();\r
      }\r
    };\r
\r
    const onLeave = () => {\r
      pointer.inside = false;\r
      pointer.time = 0;\r
      wake();\r
    };\r
\r
    const onOut = event => {\r
      if (!event.relatedTarget) onLeave();\r
    };\r
\r
    const onDown = event => {\r
      if (!settingsRef.current.clickShock || reduced) return;\r
      const [x, y] = locate(event);\r
      if (x < 0 || y < 0 || x > view.width || y > view.height) return;\r
      shocks.push({ x, y, start: performance.now() });\r
      if (shocks.length > 6) shocks.shift();\r
      wake();\r
    };\r
\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    window.addEventListener('pointerdown', onDown, { passive: true });\r
    window.addEventListener('pointerout', onOut);\r
    window.addEventListener('blur', onLeave);\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      resize();\r
      wake();\r
    });\r
    resizeObserver.observe(canvas);\r
\r
    const visibilityObserver = new IntersectionObserver(([entry]) => {\r
      visible = entry.isIntersecting;\r
      if (visible) wake();\r
    });\r
    visibilityObserver.observe(canvas);\r
\r
    const onVisibility = () => {\r
      if (document.hidden) {\r
        cancelAnimationFrame(raf);\r
        raf = 0;\r
      } else {\r
        wake();\r
      }\r
    };\r
    document.addEventListener('visibilitychange', onVisibility);\r
\r
    resize();\r
    wake();\r
\r
    engineRef.current = {\r
      rebuild: () => {\r
        rebuild();\r
        render(performance.now());\r
        wake();\r
      },\r
      refresh: () => {\r
        render(performance.now());\r
        wake();\r
      }\r
    };\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      resizeObserver.disconnect();\r
      visibilityObserver.disconnect();\r
      window.removeEventListener('pointermove', onMove);\r
      window.removeEventListener('pointerdown', onDown);\r
      window.removeEventListener('pointerout', onOut);\r
      window.removeEventListener('blur', onLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteBuffer(cornerBuffer);\r
      gl.deleteBuffer(instanceBuffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(program);\r
      engineRef.current = null;\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    engineRef.current?.rebuild();\r
  }, [dotSize, gap]);\r
\r
  useEffect(() => {\r
    engineRef.current?.refresh();\r
  }, [baseColor, activeColor, swell, stretch, glow, shape, fade, opacity, paused, proximity, mouseInteraction]);\r
\r
  return (\r
    <div className={\`dot-grid \${className}\`.trim()} style={style}>\r
      <canvas ref={canvasRef} className="dot-grid__canvas" />\r
    </div>\r
  );\r
};\r
\r
export default DotGrid;\r
`,r=`.dot-grid {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
}\r
\r
.dot-grid__canvas {\r
  position: absolute;\r
  inset: 0;\r
  display: block;\r
  width: 100%;\r
  height: 100%;\r
  pointer-events: none;\r
}\r
`,e=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
const VERTEX = \`#version 300 es\r
precision highp float;\r
\r
layout(location = 0) in vec2 aCorner;\r
layout(location = 1) in vec4 aMotion;\r
layout(location = 2) in vec2 aState;\r
\r
uniform vec2 uResolution;\r
uniform float uSize;\r
uniform float uSwell;\r
uniform float uStretch;\r
uniform float uGlow;\r
\r
out vec2 vLocal;\r
out vec2 vPoint;\r
out float vLength;\r
out float vRadius;\r
out float vEnergy;\r
\r
void main() {\r
  float energy = aState.x;\r
  float radius = 0.5 * uSize * aState.y * (1.0 + uSwell * energy);\r
  float speed = length(aMotion.zw);\r
  float angle = speed > 0.001 ? atan(aMotion.w, aMotion.z) : 0.0;\r
  float axis = floor(angle / 1.5707963 + 0.5) * 1.5707963;\r
  angle = axis + (angle - axis) * smoothstep(8.0, 70.0, speed);\r
  vec2 dir = vec2(cos(angle), sin(angle));\r
  float halfLength = min(uSize * 2.0, speed * uStretch * 0.02);\r
  float pad = radius * (1.0 + uGlow * energy * 2.5) + 2.0;\r
  vec2 local = aCorner * vec2(halfLength + pad, pad);\r
  vec2 point = aMotion.xy + dir * local.x + vec2(-dir.y, dir.x) * local.y;\r
  vLocal = local;\r
  vPoint = point;\r
  vLength = halfLength;\r
  vRadius = radius;\r
  vEnergy = energy;\r
  vec2 clip = point / uResolution * 2.0 - 1.0;\r
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);\r
}\r
\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
\r
in vec2 vLocal;\r
in vec2 vPoint;\r
in float vLength;\r
in float vRadius;\r
in float vEnergy;\r
\r
uniform vec2 uResolution;\r
uniform vec3 uBase;\r
uniform vec3 uActive;\r
uniform float uGlow;\r
uniform float uOpacity;\r
uniform float uFade;\r
uniform int uShape;\r
\r
out vec4 outColor;\r
\r
float smootherstep01(float t) {\r
  t = clamp(t, 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  float d;\r
  if (uShape == 1) {\r
    float corner = vRadius * 0.3;\r
    vec2 q = abs(vLocal) - vec2(vLength + vRadius, vRadius) + corner;\r
    d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - corner;\r
  } else {\r
    d = length(vec2(max(abs(vLocal.x) - vLength, 0.0), vLocal.y)) - vRadius;\r
  }\r
  float aa = max(fwidth(d), 0.0001);\r
  float body = clamp(0.5 - d / aa, 0.0, 1.0);\r
  float halo = uGlow * vEnergy * 0.5 * exp(-max(d, 0.0) / max(vRadius * 1.3, 0.6));\r
  float alpha = body + (1.0 - body) * halo;\r
  vec3 color = mix(uBase, uActive, clamp(vEnergy * 1.2, 0.0, 1.0));\r
  float fade = 1.0;\r
  if (uFade > 0.0) {\r
    vec2 edge = min(vPoint, uResolution - vPoint) / (uFade * 0.4 * min(uResolution.x, uResolution.y));\r
    fade = smootherstep01(edge.x) * smootherstep01(edge.y);\r
  }\r
  alpha *= uOpacity * fade;\r
  outColor = vec4(color * alpha, alpha);\r
}\r
\`;\r
\r
const toRgb = color => {\r
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(color).trim());\r
  if (!match) return [1, 1, 1];\r
  const hex = match[1].length === 3 ? match[1].replace(/./g, digit => digit + digit) : match[1];\r
  return [0, 2, 4].map(index => parseInt(hex.slice(index, index + 2), 16) / 255);\r
};\r
\r
const smootherstep = t => {\r
  const x = Math.min(1, Math.max(0, t));\r
  return x * x * x * (x * (x * 6 - 15) + 10);\r
};\r
\r
const backOut = t => {\r
  const s = 1.9;\r
  const x = t - 1;\r
  return 1 + x * x * ((s + 1) * x + s);\r
};\r
\r
const compile = (gl, type, source) => {\r
  const shader = gl.createShader(type);\r
  gl.shaderSource(shader, source);\r
  gl.compileShader(shader);\r
  return shader;\r
};\r
\r
const DotGrid = ({\r
  dotSize = 5,\r
  gap = 18,\r
  baseColor = '#3a3446',\r
  activeColor = '#ffffff',\r
  proximity = 140,\r
  strength = 1,\r
  bounce = 0.6,\r
  tension = 0.4,\r
  returnDuration = 0.8,\r
  shockRadius = 320,\r
  shockStrength = 5,\r
  swell = 0.8,\r
  stretch = 0.5,\r
  glow = 0.5,\r
  shape = 'circle',\r
  fade = 0,\r
  opacity = 1,\r
  intro = true,\r
  mouseInteraction = true,\r
  clickShock = true,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  style\r
}) => {\r
  const canvasRef = useRef(null);\r
  const engineRef = useRef(null);\r
  const settings = {\r
    dotSize,\r
    gap,\r
    baseColor,\r
    activeColor,\r
    proximity,\r
    strength,\r
    bounce,\r
    tension,\r
    returnDuration,\r
    shockRadius,\r
    shockStrength,\r
    swell,\r
    stretch,\r
    glow,\r
    shape,\r
    fade,\r
    opacity,\r
    intro,\r
    mouseInteraction,\r
    clickShock,\r
    paused,\r
    dpr\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const canvas = canvasRef.current;\r
    if (!canvas) return;\r
    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });\r
    if (!gl) return;\r
\r
    const program = gl.createProgram();\r
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));\r
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));\r
    gl.linkProgram(program);\r
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;\r
\r
    const uniforms = {};\r
    for (const name of [\r
      'uResolution',\r
      'uSize',\r
      'uSwell',\r
      'uStretch',\r
      'uGlow',\r
      'uBase',\r
      'uActive',\r
      'uOpacity',\r
      'uFade',\r
      'uShape'\r
    ]) {\r
      uniforms[name] = gl.getUniformLocation(program, name);\r
    }\r
\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    const cornerBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    const instanceBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);\r
    gl.enableVertexAttribArray(1);\r
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 24, 0);\r
    gl.vertexAttribDivisor(1, 1);\r
    gl.enableVertexAttribArray(2);\r
    gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 24, 16);\r
    gl.vertexAttribDivisor(2, 1);\r
    gl.bindVertexArray(null);\r
\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
    const view = { width: 0, height: 0, left: 0, top: 0, ratio: 1 };\r
    const grid = { count: 0, cols: 1, rows: 1, cell: 1, centerX: 0, centerY: 0, reach: 1 };\r
    let rest = new Float32Array(0);\r
    let offset = new Float32Array(0);\r
    let velocity = new Float32Array(0);\r
    let force = new Float32Array(0);\r
    let next = new Float32Array(0);\r
    let wave = new Float32Array(0);\r
    let energy = new Float32Array(0);\r
    let instances = new Float32Array(0);\r
    const pointer = { x: 0, y: 0, vx: 0, vy: 0, time: 0, inside: false, presence: 0 };\r
    const shocks = [];\r
    let introStart = settingsRef.current.intro && !reduced ? -1 : null;\r
    let visible = true;\r
    let raf = 0;\r
    let last = 0;\r
\r
    const rebuild = () => {\r
      const { dotSize: size, gap: spacing } = settingsRef.current;\r
      const cell = Math.max(2, size + spacing);\r
      const cols = Math.max(1, Math.floor((view.width + spacing) / cell));\r
      const rows = Math.max(1, Math.floor((view.height + spacing) / cell));\r
      const startX = (view.width - (cols * cell - spacing)) / 2 + size / 2;\r
      const startY = (view.height - (rows * cell - spacing)) / 2 + size / 2;\r
      const count = cols * rows;\r
      rest = new Float32Array(count * 2);\r
      offset = new Float32Array(count * 2);\r
      velocity = new Float32Array(count * 2);\r
      force = new Float32Array(count * 2);\r
      next = new Float32Array(count * 2);\r
      wave = new Float32Array(count * 4);\r
      energy = new Float32Array(count);\r
      instances = new Float32Array(count * 6);\r
      for (let row = 0; row < rows; row++) {\r
        for (let col = 0; col < cols; col++) {\r
          const index = (row * cols + col) * 2;\r
          rest[index] = startX + col * cell;\r
          rest[index + 1] = startY + row * cell;\r
        }\r
      }\r
      Object.assign(grid, {\r
        count,\r
        cols,\r
        rows,\r
        cell,\r
        centerX: view.width / 2,\r
        centerY: view.height / 2,\r
        reach: Math.hypot(view.width, view.height) / 2\r
      });\r
      gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, instances.byteLength, gl.DYNAMIC_DRAW);\r
    };\r
\r
    const resize = () => {\r
      const rect = canvas.getBoundingClientRect();\r
      const ratio = Math.min(settingsRef.current.dpr ?? window.devicePixelRatio ?? 1, 2);\r
      const width = Math.max(1, Math.round(rect.width));\r
      const height = Math.max(1, Math.round(rect.height));\r
      Object.assign(view, { width, height, left: rect.left, top: rect.top, ratio });\r
      canvas.width = Math.round(width * ratio);\r
      canvas.height = Math.round(height * ratio);\r
      rebuild();\r
      render(performance.now());\r
    };\r
\r
    const step = (dt, now) => {\r
      const s = settingsRef.current;\r
      const motion = reduced ? 0 : 1;\r
      const zeta = 1 - 0.85 * Math.min(1, Math.max(0, s.bounce));\r
      const omega = 4 / (zeta * Math.max(0.2, s.returnDuration));\r
      const stiffness = omega * omega;\r
      const damping = 2 * zeta * omega;\r
      const radius = Math.max(1, s.proximity);\r
      const speed = Math.hypot(pointer.vx, pointer.vy);\r
      const drive = s.mouseInteraction && pointer.inside ? 6500 * Math.tanh(speed / 900) * s.strength * motion : 0;\r
      const dirX = speed > 0.001 ? pointer.vx / speed : 0;\r
      const dirY = speed > 0.001 ? pointer.vy / speed : 0;\r
      const width = grid.cell * 1.4;\r
      const travel = 650;\r
      const active = shocks.map(shock => {\r
        const front = ((now - shock.start) / 1000) * travel;\r
        const power = smootherstep(1 - front / Math.max(1, s.shockRadius));\r
        return { ...shock, front, amplitude: power * s.shockStrength * grid.cell * 0.24 * motion };\r
      });\r
      const coupling = (Math.max(0, s.tension) * 900) ** 2 / (grid.cell * grid.cell);\r
      const viscosity = Math.sqrt(coupling) * 0.06;\r
      const limit = Math.sqrt(stiffness + 8 * coupling) + damping + 8 * viscosity;\r
      const steps = Math.min(24, Math.max(1, Math.ceil(dt / Math.min(1 / 120, 1.2 / limit))));\r
      const h = dt / steps;\r
      for (let i = 0; i < grid.count; i++) {\r
        const index = i * 2;\r
        const rx = rest[index];\r
        const ry = rest[index + 1];\r
        let ax = 0;\r
        let ay = 0;\r
        if (drive > 0) {\r
          const ex = rx + offset[index] - pointer.x;\r
          const ey = ry + offset[index + 1] - pointer.y;\r
          const distance = Math.hypot(ex, ey);\r
          if (distance < radius) {\r
            const weight = smootherstep(1 - distance / radius) * drive;\r
            const nx = distance > 0.001 ? ex / distance : 0;\r
            const ny = distance > 0.001 ? ey / distance : 0;\r
            ax += weight * (dirX + nx * 0.6);\r
            ay += weight * (dirY + ny * 0.6);\r
          }\r
        }\r
        let wx = 0;\r
        let wy = 0;\r
        let wvx = 0;\r
        let wvy = 0;\r
        for (const shock of active) {\r
          if (shock.amplitude <= 0) continue;\r
          const ex = rx - shock.x;\r
          const ey = ry - shock.y;\r
          const distance = Math.hypot(ex, ey);\r
          const u = (distance - shock.front) / width;\r
          if (Math.abs(u) < 3 && distance > 0.001) {\r
            const nx = ex / distance;\r
            const ny = ey / distance;\r
            const profile = Math.exp(-u * u);\r
            const push = shock.amplitude * profile;\r
            const rate = ((shock.amplitude * 2 * u * profile) / width) * travel;\r
            wx += nx * push;\r
            wy += ny * push;\r
            wvx += nx * rate;\r
            wvy += ny * rate;\r
            ax += nx * push * stiffness * 0.35;\r
            ay += ny * push * stiffness * 0.35;\r
          }\r
        }\r
        force[index] = ax;\r
        force[index + 1] = ay;\r
        const target = i * 4;\r
        wave[target] = wx;\r
        wave[target + 1] = wy;\r
        wave[target + 2] = wvx;\r
        wave[target + 3] = wvy;\r
      }\r
      const { cols, rows } = grid;\r
      const stride = cols * 2;\r
      for (let n = 0; n < steps; n++) {\r
        for (let row = 0; row < rows; row++) {\r
          for (let col = 0; col < cols; col++) {\r
            const index = (row * cols + col) * 2;\r
            let ax = force[index] - stiffness * offset[index] - damping * velocity[index];\r
            let ay = force[index + 1] - stiffness * offset[index + 1] - damping * velocity[index + 1];\r
            if (coupling > 0) {\r
              let lx = -4 * offset[index];\r
              let ly = -4 * offset[index + 1];\r
              let mx = -4 * velocity[index];\r
              let my = -4 * velocity[index + 1];\r
              if (col > 0) {\r
                lx += offset[index - 2];\r
                ly += offset[index - 1];\r
                mx += velocity[index - 2];\r
                my += velocity[index - 1];\r
              }\r
              if (col < cols - 1) {\r
                lx += offset[index + 2];\r
                ly += offset[index + 3];\r
                mx += velocity[index + 2];\r
                my += velocity[index + 3];\r
              }\r
              if (row > 0) {\r
                lx += offset[index - stride];\r
                ly += offset[index - stride + 1];\r
                mx += velocity[index - stride];\r
                my += velocity[index - stride + 1];\r
              }\r
              if (row < rows - 1) {\r
                lx += offset[index + stride];\r
                ly += offset[index + stride + 1];\r
                mx += velocity[index + stride];\r
                my += velocity[index + stride + 1];\r
              }\r
              ax += coupling * lx + viscosity * mx;\r
              ay += coupling * ly + viscosity * my;\r
            }\r
            next[index] = velocity[index] + ax * h;\r
            next[index + 1] = velocity[index + 1] + ay * h;\r
          }\r
        }\r
        for (let i = 0; i < offset.length; i++) {\r
          velocity[i] = next[i];\r
          offset[i] += velocity[i] * h;\r
        }\r
      }\r
      for (let i = 0; i < grid.count; i++) {\r
        const index = i * 2;\r
        const target = i * 4;\r
        energy[i] = Math.min(\r
          1,\r
          (Math.hypot(velocity[index] + wave[target + 2], velocity[index + 1] + wave[target + 3]) / 380) * 0.85 +\r
            (Math.hypot(offset[index] + wave[target], offset[index + 1] + wave[target + 1]) / (grid.cell * 2.2)) * 0.35\r
        );\r
      }\r
      for (let i = shocks.length - 1; i >= 0; i--) {\r
        if (active[i].front > s.shockRadius + width * 3) shocks.splice(i, 1);\r
      }\r
      const decay = 1 - Math.exp(-dt / 0.08);\r
      pointer.vx -= pointer.vx * decay;\r
      pointer.vy -= pointer.vy * decay;\r
      const presenceTarget = s.mouseInteraction && pointer.inside ? 1 : 0;\r
      pointer.presence += (presenceTarget - pointer.presence) * (1 - Math.exp(-dt / 0.2));\r
    };\r
\r
    const render = now => {\r
      const s = settingsRef.current;\r
      const radius = Math.max(1, s.proximity);\r
      const introAge = introStart === null ? Infinity : introStart < 0 ? 0 : (now - introStart) / 1000;\r
      const introFront = introAge * grid.reach * 1.25;\r
      const introBand = grid.cell * 4;\r
      for (let i = 0; i < grid.count; i++) {\r
        const index = i * 2;\r
        const source = i * 4;\r
        const x = rest[index] + offset[index] + wave[source];\r
        const y = rest[index + 1] + offset[index + 1] + wave[source + 1];\r
        let glowing = energy[i];\r
        if (pointer.presence > 0.001) {\r
          const distance = Math.hypot(x - pointer.x, y - pointer.y);\r
          if (distance < radius)\r
            glowing = Math.max(glowing, smootherstep(1 - distance / radius) * 0.4 * pointer.presence);\r
        }\r
        let scale = 1;\r
        if (introStart !== null) {\r
          const distance = Math.hypot(rest[index] - grid.centerX, rest[index + 1] - grid.centerY);\r
          const appear = Math.min(1, Math.max(0, (introFront - distance) / introBand));\r
          scale = appear >= 1 ? 1 : Math.max(0, backOut(appear));\r
          glowing = Math.max(glowing, Math.sin(appear * Math.PI) * 0.6);\r
        }\r
        const target = i * 6;\r
        instances[target] = x;\r
        instances[target + 1] = y;\r
        instances[target + 2] = velocity[index] + wave[source + 2];\r
        instances[target + 3] = velocity[index + 1] + wave[source + 3];\r
        instances[target + 4] = glowing;\r
        instances[target + 5] = scale;\r
      }\r
      const base = toRgb(s.baseColor);\r
      const accent = toRgb(s.activeColor);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      gl.useProgram(program);\r
      gl.uniform2f(uniforms.uResolution, view.width, view.height);\r
      gl.uniform1f(uniforms.uSize, Math.max(0.5, s.dotSize));\r
      gl.uniform1f(uniforms.uSwell, reduced ? 0 : Math.max(0, s.swell));\r
      gl.uniform1f(uniforms.uStretch, reduced ? 0 : Math.max(0, s.stretch));\r
      gl.uniform1f(uniforms.uGlow, Math.max(0, s.glow));\r
      gl.uniform3f(uniforms.uBase, base[0], base[1], base[2]);\r
      gl.uniform3f(uniforms.uActive, accent[0], accent[1], accent[2]);\r
      gl.uniform1f(uniforms.uOpacity, Math.min(1, Math.max(0, s.opacity)));\r
      gl.uniform1f(uniforms.uFade, Math.min(1, Math.max(0, s.fade)));\r
      gl.uniform1i(uniforms.uShape, s.shape === 'square' ? 1 : 0);\r
      gl.bindVertexArray(vao);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);\r
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, instances);\r
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, grid.count);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const settled = now => {\r
      if (shocks.length) return false;\r
      if (introStart !== null) {\r
        if (introStart < 0 || (now - introStart) / 1000 < 1.6) return false;\r
        introStart = null;\r
      }\r
      if (Math.abs(pointer.vx) + Math.abs(pointer.vy) > 1) return false;\r
      const presenceTarget = settingsRef.current.mouseInteraction && pointer.inside ? 1 : 0;\r
      if (Math.abs(presenceTarget - pointer.presence) > 0.002) return false;\r
      for (let i = 0; i < offset.length; i++) {\r
        if (Math.abs(offset[i]) > 0.02 || Math.abs(velocity[i]) > 0.5) return false;\r
      }\r
      return true;\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (settingsRef.current.paused || !visible) return;\r
      if (introStart !== null && introStart < 0) introStart = now;\r
      const dt = Math.min(0.05, (now - last) / 1000 || 0);\r
      last = now;\r
      step(dt, now);\r
      render(now);\r
      if (!settled(now)) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (raf || settingsRef.current.paused || !visible) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const locate = event => {\r
      const rect = canvas.getBoundingClientRect();\r
      view.left = rect.left;\r
      view.top = rect.top;\r
      return [event.clientX - rect.left, event.clientY - rect.top];\r
    };\r
\r
    const onMove = event => {\r
      if (!settingsRef.current.mouseInteraction) return;\r
      const [x, y] = locate(event);\r
      const inside = x >= 0 && y >= 0 && x <= view.width && y <= view.height;\r
      const time = event.timeStamp || performance.now();\r
      if (inside && pointer.inside && pointer.time) {\r
        const elapsed = Math.max(4, time - pointer.time) / 1000;\r
        const vx = (x - pointer.x) / elapsed;\r
        const vy = (y - pointer.y) / elapsed;\r
        pointer.vx += (vx - pointer.vx) * 0.6;\r
        pointer.vy += (vy - pointer.vy) * 0.6;\r
      } else {\r
        pointer.vx = 0;\r
        pointer.vy = 0;\r
      }\r
      pointer.x = x;\r
      pointer.y = y;\r
      pointer.time = time;\r
      if (inside !== pointer.inside || inside) {\r
        pointer.inside = inside;\r
        wake();\r
      }\r
    };\r
\r
    const onLeave = () => {\r
      pointer.inside = false;\r
      pointer.time = 0;\r
      wake();\r
    };\r
\r
    const onOut = event => {\r
      if (!event.relatedTarget) onLeave();\r
    };\r
\r
    const onDown = event => {\r
      if (!settingsRef.current.clickShock || reduced) return;\r
      const [x, y] = locate(event);\r
      if (x < 0 || y < 0 || x > view.width || y > view.height) return;\r
      shocks.push({ x, y, start: performance.now() });\r
      if (shocks.length > 6) shocks.shift();\r
      wake();\r
    };\r
\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    window.addEventListener('pointerdown', onDown, { passive: true });\r
    window.addEventListener('pointerout', onOut);\r
    window.addEventListener('blur', onLeave);\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      resize();\r
      wake();\r
    });\r
    resizeObserver.observe(canvas);\r
\r
    const visibilityObserver = new IntersectionObserver(([entry]) => {\r
      visible = entry.isIntersecting;\r
      if (visible) wake();\r
    });\r
    visibilityObserver.observe(canvas);\r
\r
    const onVisibility = () => {\r
      if (document.hidden) {\r
        cancelAnimationFrame(raf);\r
        raf = 0;\r
      } else {\r
        wake();\r
      }\r
    };\r
    document.addEventListener('visibilitychange', onVisibility);\r
\r
    resize();\r
    wake();\r
\r
    engineRef.current = {\r
      rebuild: () => {\r
        rebuild();\r
        render(performance.now());\r
        wake();\r
      },\r
      refresh: () => {\r
        render(performance.now());\r
        wake();\r
      }\r
    };\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      resizeObserver.disconnect();\r
      visibilityObserver.disconnect();\r
      window.removeEventListener('pointermove', onMove);\r
      window.removeEventListener('pointerdown', onDown);\r
      window.removeEventListener('pointerout', onOut);\r
      window.removeEventListener('blur', onLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteBuffer(cornerBuffer);\r
      gl.deleteBuffer(instanceBuffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(program);\r
      engineRef.current = null;\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    engineRef.current?.rebuild();\r
  }, [dotSize, gap]);\r
\r
  useEffect(() => {\r
    engineRef.current?.refresh();\r
  }, [baseColor, activeColor, swell, stretch, glow, shape, fade, opacity, paused, proximity, mouseInteraction]);\r
\r
  return (\r
    <div className={\`relative h-full w-full \${className}\`.trim()} style={style}>\r
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 block h-full w-full" />\r
    </div>\r
  );\r
};\r
\r
export default DotGrid;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties } from 'react';\r
\r
import './DotGrid.css';\r
\r
const VERTEX = \`#version 300 es\r
precision highp float;\r
\r
layout(location = 0) in vec2 aCorner;\r
layout(location = 1) in vec4 aMotion;\r
layout(location = 2) in vec2 aState;\r
\r
uniform vec2 uResolution;\r
uniform float uSize;\r
uniform float uSwell;\r
uniform float uStretch;\r
uniform float uGlow;\r
\r
out vec2 vLocal;\r
out vec2 vPoint;\r
out float vLength;\r
out float vRadius;\r
out float vEnergy;\r
\r
void main() {\r
  float energy = aState.x;\r
  float radius = 0.5 * uSize * aState.y * (1.0 + uSwell * energy);\r
  float speed = length(aMotion.zw);\r
  float angle = speed > 0.001 ? atan(aMotion.w, aMotion.z) : 0.0;\r
  float axis = floor(angle / 1.5707963 + 0.5) * 1.5707963;\r
  angle = axis + (angle - axis) * smoothstep(8.0, 70.0, speed);\r
  vec2 dir = vec2(cos(angle), sin(angle));\r
  float halfLength = min(uSize * 2.0, speed * uStretch * 0.02);\r
  float pad = radius * (1.0 + uGlow * energy * 2.5) + 2.0;\r
  vec2 local = aCorner * vec2(halfLength + pad, pad);\r
  vec2 point = aMotion.xy + dir * local.x + vec2(-dir.y, dir.x) * local.y;\r
  vLocal = local;\r
  vPoint = point;\r
  vLength = halfLength;\r
  vRadius = radius;\r
  vEnergy = energy;\r
  vec2 clip = point / uResolution * 2.0 - 1.0;\r
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);\r
}\r
\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
\r
in vec2 vLocal;\r
in vec2 vPoint;\r
in float vLength;\r
in float vRadius;\r
in float vEnergy;\r
\r
uniform vec2 uResolution;\r
uniform vec3 uBase;\r
uniform vec3 uActive;\r
uniform float uGlow;\r
uniform float uOpacity;\r
uniform float uFade;\r
uniform int uShape;\r
\r
out vec4 outColor;\r
\r
float smootherstep01(float t) {\r
  t = clamp(t, 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  float d;\r
  if (uShape == 1) {\r
    float corner = vRadius * 0.3;\r
    vec2 q = abs(vLocal) - vec2(vLength + vRadius, vRadius) + corner;\r
    d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - corner;\r
  } else {\r
    d = length(vec2(max(abs(vLocal.x) - vLength, 0.0), vLocal.y)) - vRadius;\r
  }\r
  float aa = max(fwidth(d), 0.0001);\r
  float body = clamp(0.5 - d / aa, 0.0, 1.0);\r
  float halo = uGlow * vEnergy * 0.5 * exp(-max(d, 0.0) / max(vRadius * 1.3, 0.6));\r
  float alpha = body + (1.0 - body) * halo;\r
  vec3 color = mix(uBase, uActive, clamp(vEnergy * 1.2, 0.0, 1.0));\r
  float fade = 1.0;\r
  if (uFade > 0.0) {\r
    vec2 edge = min(vPoint, uResolution - vPoint) / (uFade * 0.4 * min(uResolution.x, uResolution.y));\r
    fade = smootherstep01(edge.x) * smootherstep01(edge.y);\r
  }\r
  alpha *= uOpacity * fade;\r
  outColor = vec4(color * alpha, alpha);\r
}\r
\`;\r
\r
type Shape = 'circle' | 'square';\r
\r
interface DotGridProps {\r
  dotSize?: number;\r
  gap?: number;\r
  baseColor?: string;\r
  activeColor?: string;\r
  proximity?: number;\r
  strength?: number;\r
  bounce?: number;\r
  tension?: number;\r
  returnDuration?: number;\r
  shockRadius?: number;\r
  shockStrength?: number;\r
  swell?: number;\r
  stretch?: number;\r
  glow?: number;\r
  shape?: Shape;\r
  fade?: number;\r
  opacity?: number;\r
  intro?: boolean;\r
  mouseInteraction?: boolean;\r
  clickShock?: boolean;\r
  paused?: boolean;\r
  dpr?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Shock {\r
  x: number;\r
  y: number;\r
  start: number;\r
}\r
\r
const toRgb = (color: string): [number, number, number] => {\r
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(color).trim());\r
  if (!match) return [1, 1, 1];\r
  const hex = match[1].length === 3 ? match[1].replace(/./g, digit => digit + digit) : match[1];\r
  return [0, 2, 4].map(index => parseInt(hex.slice(index, index + 2), 16) / 255) as [number, number, number];\r
};\r
\r
const smootherstep = (t: number) => {\r
  const x = Math.min(1, Math.max(0, t));\r
  return x * x * x * (x * (x * 6 - 15) + 10);\r
};\r
\r
const backOut = (t: number) => {\r
  const s = 1.9;\r
  const x = t - 1;\r
  return 1 + x * x * ((s + 1) * x + s);\r
};\r
\r
const compile = (gl: WebGL2RenderingContext, type: number, source: string) => {\r
  const shader = gl.createShader(type) as WebGLShader;\r
  gl.shaderSource(shader, source);\r
  gl.compileShader(shader);\r
  return shader;\r
};\r
\r
const DotGrid = ({\r
  dotSize = 5,\r
  gap = 18,\r
  baseColor = '#3a3446',\r
  activeColor = '#ffffff',\r
  proximity = 140,\r
  strength = 1,\r
  bounce = 0.6,\r
  tension = 0.4,\r
  returnDuration = 0.8,\r
  shockRadius = 320,\r
  shockStrength = 5,\r
  swell = 0.8,\r
  stretch = 0.5,\r
  glow = 0.5,\r
  shape = 'circle',\r
  fade = 0,\r
  opacity = 1,\r
  intro = true,\r
  mouseInteraction = true,\r
  clickShock = true,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  style\r
}: DotGridProps) => {\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const engineRef = useRef<{ rebuild: () => void; refresh: () => void } | null>(null);\r
  const settings = {\r
    dotSize,\r
    gap,\r
    baseColor,\r
    activeColor,\r
    proximity,\r
    strength,\r
    bounce,\r
    tension,\r
    returnDuration,\r
    shockRadius,\r
    shockStrength,\r
    swell,\r
    stretch,\r
    glow,\r
    shape,\r
    fade,\r
    opacity,\r
    intro,\r
    mouseInteraction,\r
    clickShock,\r
    paused,\r
    dpr\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const canvas = canvasRef.current;\r
    if (!canvas) return;\r
    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });\r
    if (!gl) return;\r
\r
    const program = gl.createProgram() as WebGLProgram;\r
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));\r
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));\r
    gl.linkProgram(program);\r
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;\r
\r
    const uniforms: Record<string, WebGLUniformLocation | null> = {};\r
    for (const name of [\r
      'uResolution',\r
      'uSize',\r
      'uSwell',\r
      'uStretch',\r
      'uGlow',\r
      'uBase',\r
      'uActive',\r
      'uOpacity',\r
      'uFade',\r
      'uShape'\r
    ]) {\r
      uniforms[name] = gl.getUniformLocation(program, name);\r
    }\r
\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    const cornerBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    const instanceBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);\r
    gl.enableVertexAttribArray(1);\r
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 24, 0);\r
    gl.vertexAttribDivisor(1, 1);\r
    gl.enableVertexAttribArray(2);\r
    gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 24, 16);\r
    gl.vertexAttribDivisor(2, 1);\r
    gl.bindVertexArray(null);\r
\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
    const view = { width: 0, height: 0, left: 0, top: 0, ratio: 1 };\r
    const grid = { count: 0, cols: 1, rows: 1, cell: 1, centerX: 0, centerY: 0, reach: 1 };\r
    let rest = new Float32Array(0);\r
    let offset = new Float32Array(0);\r
    let velocity = new Float32Array(0);\r
    let force = new Float32Array(0);\r
    let next = new Float32Array(0);\r
    let wave = new Float32Array(0);\r
    let energy = new Float32Array(0);\r
    let instances = new Float32Array(0);\r
    const pointer = { x: 0, y: 0, vx: 0, vy: 0, time: 0, inside: false, presence: 0 };\r
    const shocks: Shock[] = [];\r
    let introStart: number | null = settingsRef.current.intro && !reduced ? -1 : null;\r
    let visible = true;\r
    let raf = 0;\r
    let last = 0;\r
\r
    const rebuild = () => {\r
      const { dotSize: size, gap: spacing } = settingsRef.current;\r
      const cell = Math.max(2, size + spacing);\r
      const cols = Math.max(1, Math.floor((view.width + spacing) / cell));\r
      const rows = Math.max(1, Math.floor((view.height + spacing) / cell));\r
      const startX = (view.width - (cols * cell - spacing)) / 2 + size / 2;\r
      const startY = (view.height - (rows * cell - spacing)) / 2 + size / 2;\r
      const count = cols * rows;\r
      rest = new Float32Array(count * 2);\r
      offset = new Float32Array(count * 2);\r
      velocity = new Float32Array(count * 2);\r
      force = new Float32Array(count * 2);\r
      next = new Float32Array(count * 2);\r
      wave = new Float32Array(count * 4);\r
      energy = new Float32Array(count);\r
      instances = new Float32Array(count * 6);\r
      for (let row = 0; row < rows; row++) {\r
        for (let col = 0; col < cols; col++) {\r
          const index = (row * cols + col) * 2;\r
          rest[index] = startX + col * cell;\r
          rest[index + 1] = startY + row * cell;\r
        }\r
      }\r
      Object.assign(grid, {\r
        count,\r
        cols,\r
        rows,\r
        cell,\r
        centerX: view.width / 2,\r
        centerY: view.height / 2,\r
        reach: Math.hypot(view.width, view.height) / 2\r
      });\r
      gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, instances.byteLength, gl.DYNAMIC_DRAW);\r
    };\r
\r
    const resize = () => {\r
      const rect = canvas.getBoundingClientRect();\r
      const ratio = Math.min(settingsRef.current.dpr ?? window.devicePixelRatio ?? 1, 2);\r
      const width = Math.max(1, Math.round(rect.width));\r
      const height = Math.max(1, Math.round(rect.height));\r
      Object.assign(view, { width, height, left: rect.left, top: rect.top, ratio });\r
      canvas.width = Math.round(width * ratio);\r
      canvas.height = Math.round(height * ratio);\r
      rebuild();\r
      render(performance.now());\r
    };\r
\r
    const step = (dt: number, now: number) => {\r
      const s = settingsRef.current;\r
      const motion = reduced ? 0 : 1;\r
      const zeta = 1 - 0.85 * Math.min(1, Math.max(0, s.bounce));\r
      const omega = 4 / (zeta * Math.max(0.2, s.returnDuration));\r
      const stiffness = omega * omega;\r
      const damping = 2 * zeta * omega;\r
      const radius = Math.max(1, s.proximity);\r
      const speed = Math.hypot(pointer.vx, pointer.vy);\r
      const drive = s.mouseInteraction && pointer.inside ? 6500 * Math.tanh(speed / 900) * s.strength * motion : 0;\r
      const dirX = speed > 0.001 ? pointer.vx / speed : 0;\r
      const dirY = speed > 0.001 ? pointer.vy / speed : 0;\r
      const width = grid.cell * 1.4;\r
      const travel = 650;\r
      const active = shocks.map(shock => {\r
        const front = ((now - shock.start) / 1000) * travel;\r
        const power = smootherstep(1 - front / Math.max(1, s.shockRadius));\r
        return { ...shock, front, amplitude: power * s.shockStrength * grid.cell * 0.24 * motion };\r
      });\r
      const coupling = (Math.max(0, s.tension) * 900) ** 2 / (grid.cell * grid.cell);\r
      const viscosity = Math.sqrt(coupling) * 0.06;\r
      const limit = Math.sqrt(stiffness + 8 * coupling) + damping + 8 * viscosity;\r
      const steps = Math.min(24, Math.max(1, Math.ceil(dt / Math.min(1 / 120, 1.2 / limit))));\r
      const h = dt / steps;\r
      for (let i = 0; i < grid.count; i++) {\r
        const index = i * 2;\r
        const rx = rest[index];\r
        const ry = rest[index + 1];\r
        let ax = 0;\r
        let ay = 0;\r
        if (drive > 0) {\r
          const ex = rx + offset[index] - pointer.x;\r
          const ey = ry + offset[index + 1] - pointer.y;\r
          const distance = Math.hypot(ex, ey);\r
          if (distance < radius) {\r
            const weight = smootherstep(1 - distance / radius) * drive;\r
            const nx = distance > 0.001 ? ex / distance : 0;\r
            const ny = distance > 0.001 ? ey / distance : 0;\r
            ax += weight * (dirX + nx * 0.6);\r
            ay += weight * (dirY + ny * 0.6);\r
          }\r
        }\r
        let wx = 0;\r
        let wy = 0;\r
        let wvx = 0;\r
        let wvy = 0;\r
        for (const shock of active) {\r
          if (shock.amplitude <= 0) continue;\r
          const ex = rx - shock.x;\r
          const ey = ry - shock.y;\r
          const distance = Math.hypot(ex, ey);\r
          const u = (distance - shock.front) / width;\r
          if (Math.abs(u) < 3 && distance > 0.001) {\r
            const nx = ex / distance;\r
            const ny = ey / distance;\r
            const profile = Math.exp(-u * u);\r
            const push = shock.amplitude * profile;\r
            const rate = ((shock.amplitude * 2 * u * profile) / width) * travel;\r
            wx += nx * push;\r
            wy += ny * push;\r
            wvx += nx * rate;\r
            wvy += ny * rate;\r
            ax += nx * push * stiffness * 0.35;\r
            ay += ny * push * stiffness * 0.35;\r
          }\r
        }\r
        force[index] = ax;\r
        force[index + 1] = ay;\r
        const target = i * 4;\r
        wave[target] = wx;\r
        wave[target + 1] = wy;\r
        wave[target + 2] = wvx;\r
        wave[target + 3] = wvy;\r
      }\r
      const { cols, rows } = grid;\r
      const stride = cols * 2;\r
      for (let n = 0; n < steps; n++) {\r
        for (let row = 0; row < rows; row++) {\r
          for (let col = 0; col < cols; col++) {\r
            const index = (row * cols + col) * 2;\r
            let ax = force[index] - stiffness * offset[index] - damping * velocity[index];\r
            let ay = force[index + 1] - stiffness * offset[index + 1] - damping * velocity[index + 1];\r
            if (coupling > 0) {\r
              let lx = -4 * offset[index];\r
              let ly = -4 * offset[index + 1];\r
              let mx = -4 * velocity[index];\r
              let my = -4 * velocity[index + 1];\r
              if (col > 0) {\r
                lx += offset[index - 2];\r
                ly += offset[index - 1];\r
                mx += velocity[index - 2];\r
                my += velocity[index - 1];\r
              }\r
              if (col < cols - 1) {\r
                lx += offset[index + 2];\r
                ly += offset[index + 3];\r
                mx += velocity[index + 2];\r
                my += velocity[index + 3];\r
              }\r
              if (row > 0) {\r
                lx += offset[index - stride];\r
                ly += offset[index - stride + 1];\r
                mx += velocity[index - stride];\r
                my += velocity[index - stride + 1];\r
              }\r
              if (row < rows - 1) {\r
                lx += offset[index + stride];\r
                ly += offset[index + stride + 1];\r
                mx += velocity[index + stride];\r
                my += velocity[index + stride + 1];\r
              }\r
              ax += coupling * lx + viscosity * mx;\r
              ay += coupling * ly + viscosity * my;\r
            }\r
            next[index] = velocity[index] + ax * h;\r
            next[index + 1] = velocity[index + 1] + ay * h;\r
          }\r
        }\r
        for (let i = 0; i < offset.length; i++) {\r
          velocity[i] = next[i];\r
          offset[i] += velocity[i] * h;\r
        }\r
      }\r
      for (let i = 0; i < grid.count; i++) {\r
        const index = i * 2;\r
        const target = i * 4;\r
        energy[i] = Math.min(\r
          1,\r
          (Math.hypot(velocity[index] + wave[target + 2], velocity[index + 1] + wave[target + 3]) / 380) * 0.85 +\r
            (Math.hypot(offset[index] + wave[target], offset[index + 1] + wave[target + 1]) / (grid.cell * 2.2)) * 0.35\r
        );\r
      }\r
      for (let i = shocks.length - 1; i >= 0; i--) {\r
        if (active[i].front > s.shockRadius + width * 3) shocks.splice(i, 1);\r
      }\r
      const decay = 1 - Math.exp(-dt / 0.08);\r
      pointer.vx -= pointer.vx * decay;\r
      pointer.vy -= pointer.vy * decay;\r
      const presenceTarget = s.mouseInteraction && pointer.inside ? 1 : 0;\r
      pointer.presence += (presenceTarget - pointer.presence) * (1 - Math.exp(-dt / 0.2));\r
    };\r
\r
    const render = (now: number) => {\r
      const s = settingsRef.current;\r
      const radius = Math.max(1, s.proximity);\r
      const introAge = introStart === null ? Infinity : introStart < 0 ? 0 : (now - introStart) / 1000;\r
      const introFront = introAge * grid.reach * 1.25;\r
      const introBand = grid.cell * 4;\r
      for (let i = 0; i < grid.count; i++) {\r
        const index = i * 2;\r
        const source = i * 4;\r
        const x = rest[index] + offset[index] + wave[source];\r
        const y = rest[index + 1] + offset[index + 1] + wave[source + 1];\r
        let glowing = energy[i];\r
        if (pointer.presence > 0.001) {\r
          const distance = Math.hypot(x - pointer.x, y - pointer.y);\r
          if (distance < radius)\r
            glowing = Math.max(glowing, smootherstep(1 - distance / radius) * 0.4 * pointer.presence);\r
        }\r
        let scale = 1;\r
        if (introStart !== null) {\r
          const distance = Math.hypot(rest[index] - grid.centerX, rest[index + 1] - grid.centerY);\r
          const appear = Math.min(1, Math.max(0, (introFront - distance) / introBand));\r
          scale = appear >= 1 ? 1 : Math.max(0, backOut(appear));\r
          glowing = Math.max(glowing, Math.sin(appear * Math.PI) * 0.6);\r
        }\r
        const target = i * 6;\r
        instances[target] = x;\r
        instances[target + 1] = y;\r
        instances[target + 2] = velocity[index] + wave[source + 2];\r
        instances[target + 3] = velocity[index + 1] + wave[source + 3];\r
        instances[target + 4] = glowing;\r
        instances[target + 5] = scale;\r
      }\r
      const base = toRgb(s.baseColor);\r
      const accent = toRgb(s.activeColor);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      gl.useProgram(program);\r
      gl.uniform2f(uniforms.uResolution, view.width, view.height);\r
      gl.uniform1f(uniforms.uSize, Math.max(0.5, s.dotSize));\r
      gl.uniform1f(uniforms.uSwell, reduced ? 0 : Math.max(0, s.swell));\r
      gl.uniform1f(uniforms.uStretch, reduced ? 0 : Math.max(0, s.stretch));\r
      gl.uniform1f(uniforms.uGlow, Math.max(0, s.glow));\r
      gl.uniform3f(uniforms.uBase, base[0], base[1], base[2]);\r
      gl.uniform3f(uniforms.uActive, accent[0], accent[1], accent[2]);\r
      gl.uniform1f(uniforms.uOpacity, Math.min(1, Math.max(0, s.opacity)));\r
      gl.uniform1f(uniforms.uFade, Math.min(1, Math.max(0, s.fade)));\r
      gl.uniform1i(uniforms.uShape, s.shape === 'square' ? 1 : 0);\r
      gl.bindVertexArray(vao);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);\r
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, instances);\r
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, grid.count);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const settled = (now: number) => {\r
      if (shocks.length) return false;\r
      if (introStart !== null) {\r
        if (introStart < 0 || (now - introStart) / 1000 < 1.6) return false;\r
        introStart = null;\r
      }\r
      if (Math.abs(pointer.vx) + Math.abs(pointer.vy) > 1) return false;\r
      const presenceTarget = settingsRef.current.mouseInteraction && pointer.inside ? 1 : 0;\r
      if (Math.abs(presenceTarget - pointer.presence) > 0.002) return false;\r
      for (let i = 0; i < offset.length; i++) {\r
        if (Math.abs(offset[i]) > 0.02 || Math.abs(velocity[i]) > 0.5) return false;\r
      }\r
      return true;\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (settingsRef.current.paused || !visible) return;\r
      if (introStart !== null && introStart < 0) introStart = now;\r
      const dt = Math.min(0.05, (now - last) / 1000 || 0);\r
      last = now;\r
      step(dt, now);\r
      render(now);\r
      if (!settled(now)) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (raf || settingsRef.current.paused || !visible) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const locate = (event: PointerEvent): [number, number] => {\r
      const rect = canvas.getBoundingClientRect();\r
      view.left = rect.left;\r
      view.top = rect.top;\r
      return [event.clientX - rect.left, event.clientY - rect.top];\r
    };\r
\r
    const onMove = (event: PointerEvent) => {\r
      if (!settingsRef.current.mouseInteraction) return;\r
      const [x, y] = locate(event);\r
      const inside = x >= 0 && y >= 0 && x <= view.width && y <= view.height;\r
      const time = event.timeStamp || performance.now();\r
      if (inside && pointer.inside && pointer.time) {\r
        const elapsed = Math.max(4, time - pointer.time) / 1000;\r
        const vx = (x - pointer.x) / elapsed;\r
        const vy = (y - pointer.y) / elapsed;\r
        pointer.vx += (vx - pointer.vx) * 0.6;\r
        pointer.vy += (vy - pointer.vy) * 0.6;\r
      } else {\r
        pointer.vx = 0;\r
        pointer.vy = 0;\r
      }\r
      pointer.x = x;\r
      pointer.y = y;\r
      pointer.time = time;\r
      if (inside !== pointer.inside || inside) {\r
        pointer.inside = inside;\r
        wake();\r
      }\r
    };\r
\r
    const onLeave = () => {\r
      pointer.inside = false;\r
      pointer.time = 0;\r
      wake();\r
    };\r
\r
    const onOut = (event: PointerEvent) => {\r
      if (!event.relatedTarget) onLeave();\r
    };\r
\r
    const onDown = (event: PointerEvent) => {\r
      if (!settingsRef.current.clickShock || reduced) return;\r
      const [x, y] = locate(event);\r
      if (x < 0 || y < 0 || x > view.width || y > view.height) return;\r
      shocks.push({ x, y, start: performance.now() });\r
      if (shocks.length > 6) shocks.shift();\r
      wake();\r
    };\r
\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    window.addEventListener('pointerdown', onDown, { passive: true });\r
    window.addEventListener('pointerout', onOut);\r
    window.addEventListener('blur', onLeave);\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      resize();\r
      wake();\r
    });\r
    resizeObserver.observe(canvas);\r
\r
    const visibilityObserver = new IntersectionObserver(([entry]) => {\r
      visible = entry.isIntersecting;\r
      if (visible) wake();\r
    });\r
    visibilityObserver.observe(canvas);\r
\r
    const onVisibility = () => {\r
      if (document.hidden) {\r
        cancelAnimationFrame(raf);\r
        raf = 0;\r
      } else {\r
        wake();\r
      }\r
    };\r
    document.addEventListener('visibilitychange', onVisibility);\r
\r
    resize();\r
    wake();\r
\r
    engineRef.current = {\r
      rebuild: () => {\r
        rebuild();\r
        render(performance.now());\r
        wake();\r
      },\r
      refresh: () => {\r
        render(performance.now());\r
        wake();\r
      }\r
    };\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      resizeObserver.disconnect();\r
      visibilityObserver.disconnect();\r
      window.removeEventListener('pointermove', onMove);\r
      window.removeEventListener('pointerdown', onDown);\r
      window.removeEventListener('pointerout', onOut);\r
      window.removeEventListener('blur', onLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteBuffer(cornerBuffer);\r
      gl.deleteBuffer(instanceBuffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(program);\r
      engineRef.current = null;\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    engineRef.current?.rebuild();\r
  }, [dotSize, gap]);\r
\r
  useEffect(() => {\r
    engineRef.current?.refresh();\r
  }, [baseColor, activeColor, swell, stretch, glow, shape, fade, opacity, paused, proximity, mouseInteraction]);\r
\r
  return (\r
    <div className={\`dot-grid \${className}\`.trim()} style={style}>\r
      <canvas ref={canvasRef} className="dot-grid__canvas" />\r
    </div>\r
  );\r
};\r
\r
export default DotGrid;\r
`,o=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties } from 'react';\r
\r
const VERTEX = \`#version 300 es\r
precision highp float;\r
\r
layout(location = 0) in vec2 aCorner;\r
layout(location = 1) in vec4 aMotion;\r
layout(location = 2) in vec2 aState;\r
\r
uniform vec2 uResolution;\r
uniform float uSize;\r
uniform float uSwell;\r
uniform float uStretch;\r
uniform float uGlow;\r
\r
out vec2 vLocal;\r
out vec2 vPoint;\r
out float vLength;\r
out float vRadius;\r
out float vEnergy;\r
\r
void main() {\r
  float energy = aState.x;\r
  float radius = 0.5 * uSize * aState.y * (1.0 + uSwell * energy);\r
  float speed = length(aMotion.zw);\r
  float angle = speed > 0.001 ? atan(aMotion.w, aMotion.z) : 0.0;\r
  float axis = floor(angle / 1.5707963 + 0.5) * 1.5707963;\r
  angle = axis + (angle - axis) * smoothstep(8.0, 70.0, speed);\r
  vec2 dir = vec2(cos(angle), sin(angle));\r
  float halfLength = min(uSize * 2.0, speed * uStretch * 0.02);\r
  float pad = radius * (1.0 + uGlow * energy * 2.5) + 2.0;\r
  vec2 local = aCorner * vec2(halfLength + pad, pad);\r
  vec2 point = aMotion.xy + dir * local.x + vec2(-dir.y, dir.x) * local.y;\r
  vLocal = local;\r
  vPoint = point;\r
  vLength = halfLength;\r
  vRadius = radius;\r
  vEnergy = energy;\r
  vec2 clip = point / uResolution * 2.0 - 1.0;\r
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);\r
}\r
\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
\r
in vec2 vLocal;\r
in vec2 vPoint;\r
in float vLength;\r
in float vRadius;\r
in float vEnergy;\r
\r
uniform vec2 uResolution;\r
uniform vec3 uBase;\r
uniform vec3 uActive;\r
uniform float uGlow;\r
uniform float uOpacity;\r
uniform float uFade;\r
uniform int uShape;\r
\r
out vec4 outColor;\r
\r
float smootherstep01(float t) {\r
  t = clamp(t, 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  float d;\r
  if (uShape == 1) {\r
    float corner = vRadius * 0.3;\r
    vec2 q = abs(vLocal) - vec2(vLength + vRadius, vRadius) + corner;\r
    d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - corner;\r
  } else {\r
    d = length(vec2(max(abs(vLocal.x) - vLength, 0.0), vLocal.y)) - vRadius;\r
  }\r
  float aa = max(fwidth(d), 0.0001);\r
  float body = clamp(0.5 - d / aa, 0.0, 1.0);\r
  float halo = uGlow * vEnergy * 0.5 * exp(-max(d, 0.0) / max(vRadius * 1.3, 0.6));\r
  float alpha = body + (1.0 - body) * halo;\r
  vec3 color = mix(uBase, uActive, clamp(vEnergy * 1.2, 0.0, 1.0));\r
  float fade = 1.0;\r
  if (uFade > 0.0) {\r
    vec2 edge = min(vPoint, uResolution - vPoint) / (uFade * 0.4 * min(uResolution.x, uResolution.y));\r
    fade = smootherstep01(edge.x) * smootherstep01(edge.y);\r
  }\r
  alpha *= uOpacity * fade;\r
  outColor = vec4(color * alpha, alpha);\r
}\r
\`;\r
\r
type Shape = 'circle' | 'square';\r
\r
interface DotGridProps {\r
  dotSize?: number;\r
  gap?: number;\r
  baseColor?: string;\r
  activeColor?: string;\r
  proximity?: number;\r
  strength?: number;\r
  bounce?: number;\r
  tension?: number;\r
  returnDuration?: number;\r
  shockRadius?: number;\r
  shockStrength?: number;\r
  swell?: number;\r
  stretch?: number;\r
  glow?: number;\r
  shape?: Shape;\r
  fade?: number;\r
  opacity?: number;\r
  intro?: boolean;\r
  mouseInteraction?: boolean;\r
  clickShock?: boolean;\r
  paused?: boolean;\r
  dpr?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Shock {\r
  x: number;\r
  y: number;\r
  start: number;\r
}\r
\r
const toRgb = (color: string): [number, number, number] => {\r
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(color).trim());\r
  if (!match) return [1, 1, 1];\r
  const hex = match[1].length === 3 ? match[1].replace(/./g, digit => digit + digit) : match[1];\r
  return [0, 2, 4].map(index => parseInt(hex.slice(index, index + 2), 16) / 255) as [number, number, number];\r
};\r
\r
const smootherstep = (t: number) => {\r
  const x = Math.min(1, Math.max(0, t));\r
  return x * x * x * (x * (x * 6 - 15) + 10);\r
};\r
\r
const backOut = (t: number) => {\r
  const s = 1.9;\r
  const x = t - 1;\r
  return 1 + x * x * ((s + 1) * x + s);\r
};\r
\r
const compile = (gl: WebGL2RenderingContext, type: number, source: string) => {\r
  const shader = gl.createShader(type) as WebGLShader;\r
  gl.shaderSource(shader, source);\r
  gl.compileShader(shader);\r
  return shader;\r
};\r
\r
const DotGrid = ({\r
  dotSize = 5,\r
  gap = 18,\r
  baseColor = '#3a3446',\r
  activeColor = '#ffffff',\r
  proximity = 140,\r
  strength = 1,\r
  bounce = 0.6,\r
  tension = 0.4,\r
  returnDuration = 0.8,\r
  shockRadius = 320,\r
  shockStrength = 5,\r
  swell = 0.8,\r
  stretch = 0.5,\r
  glow = 0.5,\r
  shape = 'circle',\r
  fade = 0,\r
  opacity = 1,\r
  intro = true,\r
  mouseInteraction = true,\r
  clickShock = true,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  style\r
}: DotGridProps) => {\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const engineRef = useRef<{ rebuild: () => void; refresh: () => void } | null>(null);\r
  const settings = {\r
    dotSize,\r
    gap,\r
    baseColor,\r
    activeColor,\r
    proximity,\r
    strength,\r
    bounce,\r
    tension,\r
    returnDuration,\r
    shockRadius,\r
    shockStrength,\r
    swell,\r
    stretch,\r
    glow,\r
    shape,\r
    fade,\r
    opacity,\r
    intro,\r
    mouseInteraction,\r
    clickShock,\r
    paused,\r
    dpr\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const canvas = canvasRef.current;\r
    if (!canvas) return;\r
    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });\r
    if (!gl) return;\r
\r
    const program = gl.createProgram() as WebGLProgram;\r
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));\r
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));\r
    gl.linkProgram(program);\r
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;\r
\r
    const uniforms: Record<string, WebGLUniformLocation | null> = {};\r
    for (const name of [\r
      'uResolution',\r
      'uSize',\r
      'uSwell',\r
      'uStretch',\r
      'uGlow',\r
      'uBase',\r
      'uActive',\r
      'uOpacity',\r
      'uFade',\r
      'uShape'\r
    ]) {\r
      uniforms[name] = gl.getUniformLocation(program, name);\r
    }\r
\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    const cornerBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    const instanceBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);\r
    gl.enableVertexAttribArray(1);\r
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 24, 0);\r
    gl.vertexAttribDivisor(1, 1);\r
    gl.enableVertexAttribArray(2);\r
    gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 24, 16);\r
    gl.vertexAttribDivisor(2, 1);\r
    gl.bindVertexArray(null);\r
\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
    const view = { width: 0, height: 0, left: 0, top: 0, ratio: 1 };\r
    const grid = { count: 0, cols: 1, rows: 1, cell: 1, centerX: 0, centerY: 0, reach: 1 };\r
    let rest = new Float32Array(0);\r
    let offset = new Float32Array(0);\r
    let velocity = new Float32Array(0);\r
    let force = new Float32Array(0);\r
    let next = new Float32Array(0);\r
    let wave = new Float32Array(0);\r
    let energy = new Float32Array(0);\r
    let instances = new Float32Array(0);\r
    const pointer = { x: 0, y: 0, vx: 0, vy: 0, time: 0, inside: false, presence: 0 };\r
    const shocks: Shock[] = [];\r
    let introStart: number | null = settingsRef.current.intro && !reduced ? -1 : null;\r
    let visible = true;\r
    let raf = 0;\r
    let last = 0;\r
\r
    const rebuild = () => {\r
      const { dotSize: size, gap: spacing } = settingsRef.current;\r
      const cell = Math.max(2, size + spacing);\r
      const cols = Math.max(1, Math.floor((view.width + spacing) / cell));\r
      const rows = Math.max(1, Math.floor((view.height + spacing) / cell));\r
      const startX = (view.width - (cols * cell - spacing)) / 2 + size / 2;\r
      const startY = (view.height - (rows * cell - spacing)) / 2 + size / 2;\r
      const count = cols * rows;\r
      rest = new Float32Array(count * 2);\r
      offset = new Float32Array(count * 2);\r
      velocity = new Float32Array(count * 2);\r
      force = new Float32Array(count * 2);\r
      next = new Float32Array(count * 2);\r
      wave = new Float32Array(count * 4);\r
      energy = new Float32Array(count);\r
      instances = new Float32Array(count * 6);\r
      for (let row = 0; row < rows; row++) {\r
        for (let col = 0; col < cols; col++) {\r
          const index = (row * cols + col) * 2;\r
          rest[index] = startX + col * cell;\r
          rest[index + 1] = startY + row * cell;\r
        }\r
      }\r
      Object.assign(grid, {\r
        count,\r
        cols,\r
        rows,\r
        cell,\r
        centerX: view.width / 2,\r
        centerY: view.height / 2,\r
        reach: Math.hypot(view.width, view.height) / 2\r
      });\r
      gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, instances.byteLength, gl.DYNAMIC_DRAW);\r
    };\r
\r
    const resize = () => {\r
      const rect = canvas.getBoundingClientRect();\r
      const ratio = Math.min(settingsRef.current.dpr ?? window.devicePixelRatio ?? 1, 2);\r
      const width = Math.max(1, Math.round(rect.width));\r
      const height = Math.max(1, Math.round(rect.height));\r
      Object.assign(view, { width, height, left: rect.left, top: rect.top, ratio });\r
      canvas.width = Math.round(width * ratio);\r
      canvas.height = Math.round(height * ratio);\r
      rebuild();\r
      render(performance.now());\r
    };\r
\r
    const step = (dt: number, now: number) => {\r
      const s = settingsRef.current;\r
      const motion = reduced ? 0 : 1;\r
      const zeta = 1 - 0.85 * Math.min(1, Math.max(0, s.bounce));\r
      const omega = 4 / (zeta * Math.max(0.2, s.returnDuration));\r
      const stiffness = omega * omega;\r
      const damping = 2 * zeta * omega;\r
      const radius = Math.max(1, s.proximity);\r
      const speed = Math.hypot(pointer.vx, pointer.vy);\r
      const drive = s.mouseInteraction && pointer.inside ? 6500 * Math.tanh(speed / 900) * s.strength * motion : 0;\r
      const dirX = speed > 0.001 ? pointer.vx / speed : 0;\r
      const dirY = speed > 0.001 ? pointer.vy / speed : 0;\r
      const width = grid.cell * 1.4;\r
      const travel = 650;\r
      const active = shocks.map(shock => {\r
        const front = ((now - shock.start) / 1000) * travel;\r
        const power = smootherstep(1 - front / Math.max(1, s.shockRadius));\r
        return { ...shock, front, amplitude: power * s.shockStrength * grid.cell * 0.24 * motion };\r
      });\r
      const coupling = (Math.max(0, s.tension) * 900) ** 2 / (grid.cell * grid.cell);\r
      const viscosity = Math.sqrt(coupling) * 0.06;\r
      const limit = Math.sqrt(stiffness + 8 * coupling) + damping + 8 * viscosity;\r
      const steps = Math.min(24, Math.max(1, Math.ceil(dt / Math.min(1 / 120, 1.2 / limit))));\r
      const h = dt / steps;\r
      for (let i = 0; i < grid.count; i++) {\r
        const index = i * 2;\r
        const rx = rest[index];\r
        const ry = rest[index + 1];\r
        let ax = 0;\r
        let ay = 0;\r
        if (drive > 0) {\r
          const ex = rx + offset[index] - pointer.x;\r
          const ey = ry + offset[index + 1] - pointer.y;\r
          const distance = Math.hypot(ex, ey);\r
          if (distance < radius) {\r
            const weight = smootherstep(1 - distance / radius) * drive;\r
            const nx = distance > 0.001 ? ex / distance : 0;\r
            const ny = distance > 0.001 ? ey / distance : 0;\r
            ax += weight * (dirX + nx * 0.6);\r
            ay += weight * (dirY + ny * 0.6);\r
          }\r
        }\r
        let wx = 0;\r
        let wy = 0;\r
        let wvx = 0;\r
        let wvy = 0;\r
        for (const shock of active) {\r
          if (shock.amplitude <= 0) continue;\r
          const ex = rx - shock.x;\r
          const ey = ry - shock.y;\r
          const distance = Math.hypot(ex, ey);\r
          const u = (distance - shock.front) / width;\r
          if (Math.abs(u) < 3 && distance > 0.001) {\r
            const nx = ex / distance;\r
            const ny = ey / distance;\r
            const profile = Math.exp(-u * u);\r
            const push = shock.amplitude * profile;\r
            const rate = ((shock.amplitude * 2 * u * profile) / width) * travel;\r
            wx += nx * push;\r
            wy += ny * push;\r
            wvx += nx * rate;\r
            wvy += ny * rate;\r
            ax += nx * push * stiffness * 0.35;\r
            ay += ny * push * stiffness * 0.35;\r
          }\r
        }\r
        force[index] = ax;\r
        force[index + 1] = ay;\r
        const target = i * 4;\r
        wave[target] = wx;\r
        wave[target + 1] = wy;\r
        wave[target + 2] = wvx;\r
        wave[target + 3] = wvy;\r
      }\r
      const { cols, rows } = grid;\r
      const stride = cols * 2;\r
      for (let n = 0; n < steps; n++) {\r
        for (let row = 0; row < rows; row++) {\r
          for (let col = 0; col < cols; col++) {\r
            const index = (row * cols + col) * 2;\r
            let ax = force[index] - stiffness * offset[index] - damping * velocity[index];\r
            let ay = force[index + 1] - stiffness * offset[index + 1] - damping * velocity[index + 1];\r
            if (coupling > 0) {\r
              let lx = -4 * offset[index];\r
              let ly = -4 * offset[index + 1];\r
              let mx = -4 * velocity[index];\r
              let my = -4 * velocity[index + 1];\r
              if (col > 0) {\r
                lx += offset[index - 2];\r
                ly += offset[index - 1];\r
                mx += velocity[index - 2];\r
                my += velocity[index - 1];\r
              }\r
              if (col < cols - 1) {\r
                lx += offset[index + 2];\r
                ly += offset[index + 3];\r
                mx += velocity[index + 2];\r
                my += velocity[index + 3];\r
              }\r
              if (row > 0) {\r
                lx += offset[index - stride];\r
                ly += offset[index - stride + 1];\r
                mx += velocity[index - stride];\r
                my += velocity[index - stride + 1];\r
              }\r
              if (row < rows - 1) {\r
                lx += offset[index + stride];\r
                ly += offset[index + stride + 1];\r
                mx += velocity[index + stride];\r
                my += velocity[index + stride + 1];\r
              }\r
              ax += coupling * lx + viscosity * mx;\r
              ay += coupling * ly + viscosity * my;\r
            }\r
            next[index] = velocity[index] + ax * h;\r
            next[index + 1] = velocity[index + 1] + ay * h;\r
          }\r
        }\r
        for (let i = 0; i < offset.length; i++) {\r
          velocity[i] = next[i];\r
          offset[i] += velocity[i] * h;\r
        }\r
      }\r
      for (let i = 0; i < grid.count; i++) {\r
        const index = i * 2;\r
        const target = i * 4;\r
        energy[i] = Math.min(\r
          1,\r
          (Math.hypot(velocity[index] + wave[target + 2], velocity[index + 1] + wave[target + 3]) / 380) * 0.85 +\r
            (Math.hypot(offset[index] + wave[target], offset[index + 1] + wave[target + 1]) / (grid.cell * 2.2)) * 0.35\r
        );\r
      }\r
      for (let i = shocks.length - 1; i >= 0; i--) {\r
        if (active[i].front > s.shockRadius + width * 3) shocks.splice(i, 1);\r
      }\r
      const decay = 1 - Math.exp(-dt / 0.08);\r
      pointer.vx -= pointer.vx * decay;\r
      pointer.vy -= pointer.vy * decay;\r
      const presenceTarget = s.mouseInteraction && pointer.inside ? 1 : 0;\r
      pointer.presence += (presenceTarget - pointer.presence) * (1 - Math.exp(-dt / 0.2));\r
    };\r
\r
    const render = (now: number) => {\r
      const s = settingsRef.current;\r
      const radius = Math.max(1, s.proximity);\r
      const introAge = introStart === null ? Infinity : introStart < 0 ? 0 : (now - introStart) / 1000;\r
      const introFront = introAge * grid.reach * 1.25;\r
      const introBand = grid.cell * 4;\r
      for (let i = 0; i < grid.count; i++) {\r
        const index = i * 2;\r
        const source = i * 4;\r
        const x = rest[index] + offset[index] + wave[source];\r
        const y = rest[index + 1] + offset[index + 1] + wave[source + 1];\r
        let glowing = energy[i];\r
        if (pointer.presence > 0.001) {\r
          const distance = Math.hypot(x - pointer.x, y - pointer.y);\r
          if (distance < radius)\r
            glowing = Math.max(glowing, smootherstep(1 - distance / radius) * 0.4 * pointer.presence);\r
        }\r
        let scale = 1;\r
        if (introStart !== null) {\r
          const distance = Math.hypot(rest[index] - grid.centerX, rest[index + 1] - grid.centerY);\r
          const appear = Math.min(1, Math.max(0, (introFront - distance) / introBand));\r
          scale = appear >= 1 ? 1 : Math.max(0, backOut(appear));\r
          glowing = Math.max(glowing, Math.sin(appear * Math.PI) * 0.6);\r
        }\r
        const target = i * 6;\r
        instances[target] = x;\r
        instances[target + 1] = y;\r
        instances[target + 2] = velocity[index] + wave[source + 2];\r
        instances[target + 3] = velocity[index + 1] + wave[source + 3];\r
        instances[target + 4] = glowing;\r
        instances[target + 5] = scale;\r
      }\r
      const base = toRgb(s.baseColor);\r
      const accent = toRgb(s.activeColor);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      gl.useProgram(program);\r
      gl.uniform2f(uniforms.uResolution, view.width, view.height);\r
      gl.uniform1f(uniforms.uSize, Math.max(0.5, s.dotSize));\r
      gl.uniform1f(uniforms.uSwell, reduced ? 0 : Math.max(0, s.swell));\r
      gl.uniform1f(uniforms.uStretch, reduced ? 0 : Math.max(0, s.stretch));\r
      gl.uniform1f(uniforms.uGlow, Math.max(0, s.glow));\r
      gl.uniform3f(uniforms.uBase, base[0], base[1], base[2]);\r
      gl.uniform3f(uniforms.uActive, accent[0], accent[1], accent[2]);\r
      gl.uniform1f(uniforms.uOpacity, Math.min(1, Math.max(0, s.opacity)));\r
      gl.uniform1f(uniforms.uFade, Math.min(1, Math.max(0, s.fade)));\r
      gl.uniform1i(uniforms.uShape, s.shape === 'square' ? 1 : 0);\r
      gl.bindVertexArray(vao);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);\r
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, instances);\r
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, grid.count);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const settled = (now: number) => {\r
      if (shocks.length) return false;\r
      if (introStart !== null) {\r
        if (introStart < 0 || (now - introStart) / 1000 < 1.6) return false;\r
        introStart = null;\r
      }\r
      if (Math.abs(pointer.vx) + Math.abs(pointer.vy) > 1) return false;\r
      const presenceTarget = settingsRef.current.mouseInteraction && pointer.inside ? 1 : 0;\r
      if (Math.abs(presenceTarget - pointer.presence) > 0.002) return false;\r
      for (let i = 0; i < offset.length; i++) {\r
        if (Math.abs(offset[i]) > 0.02 || Math.abs(velocity[i]) > 0.5) return false;\r
      }\r
      return true;\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (settingsRef.current.paused || !visible) return;\r
      if (introStart !== null && introStart < 0) introStart = now;\r
      const dt = Math.min(0.05, (now - last) / 1000 || 0);\r
      last = now;\r
      step(dt, now);\r
      render(now);\r
      if (!settled(now)) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (raf || settingsRef.current.paused || !visible) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const locate = (event: PointerEvent): [number, number] => {\r
      const rect = canvas.getBoundingClientRect();\r
      view.left = rect.left;\r
      view.top = rect.top;\r
      return [event.clientX - rect.left, event.clientY - rect.top];\r
    };\r
\r
    const onMove = (event: PointerEvent) => {\r
      if (!settingsRef.current.mouseInteraction) return;\r
      const [x, y] = locate(event);\r
      const inside = x >= 0 && y >= 0 && x <= view.width && y <= view.height;\r
      const time = event.timeStamp || performance.now();\r
      if (inside && pointer.inside && pointer.time) {\r
        const elapsed = Math.max(4, time - pointer.time) / 1000;\r
        const vx = (x - pointer.x) / elapsed;\r
        const vy = (y - pointer.y) / elapsed;\r
        pointer.vx += (vx - pointer.vx) * 0.6;\r
        pointer.vy += (vy - pointer.vy) * 0.6;\r
      } else {\r
        pointer.vx = 0;\r
        pointer.vy = 0;\r
      }\r
      pointer.x = x;\r
      pointer.y = y;\r
      pointer.time = time;\r
      if (inside !== pointer.inside || inside) {\r
        pointer.inside = inside;\r
        wake();\r
      }\r
    };\r
\r
    const onLeave = () => {\r
      pointer.inside = false;\r
      pointer.time = 0;\r
      wake();\r
    };\r
\r
    const onOut = (event: PointerEvent) => {\r
      if (!event.relatedTarget) onLeave();\r
    };\r
\r
    const onDown = (event: PointerEvent) => {\r
      if (!settingsRef.current.clickShock || reduced) return;\r
      const [x, y] = locate(event);\r
      if (x < 0 || y < 0 || x > view.width || y > view.height) return;\r
      shocks.push({ x, y, start: performance.now() });\r
      if (shocks.length > 6) shocks.shift();\r
      wake();\r
    };\r
\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    window.addEventListener('pointerdown', onDown, { passive: true });\r
    window.addEventListener('pointerout', onOut);\r
    window.addEventListener('blur', onLeave);\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      resize();\r
      wake();\r
    });\r
    resizeObserver.observe(canvas);\r
\r
    const visibilityObserver = new IntersectionObserver(([entry]) => {\r
      visible = entry.isIntersecting;\r
      if (visible) wake();\r
    });\r
    visibilityObserver.observe(canvas);\r
\r
    const onVisibility = () => {\r
      if (document.hidden) {\r
        cancelAnimationFrame(raf);\r
        raf = 0;\r
      } else {\r
        wake();\r
      }\r
    };\r
    document.addEventListener('visibilitychange', onVisibility);\r
\r
    resize();\r
    wake();\r
\r
    engineRef.current = {\r
      rebuild: () => {\r
        rebuild();\r
        render(performance.now());\r
        wake();\r
      },\r
      refresh: () => {\r
        render(performance.now());\r
        wake();\r
      }\r
    };\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      resizeObserver.disconnect();\r
      visibilityObserver.disconnect();\r
      window.removeEventListener('pointermove', onMove);\r
      window.removeEventListener('pointerdown', onDown);\r
      window.removeEventListener('pointerout', onOut);\r
      window.removeEventListener('blur', onLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteBuffer(cornerBuffer);\r
      gl.deleteBuffer(instanceBuffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(program);\r
      engineRef.current = null;\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    engineRef.current?.rebuild();\r
  }, [dotSize, gap]);\r
\r
  useEffect(() => {\r
    engineRef.current?.refresh();\r
  }, [baseColor, activeColor, swell, stretch, glow, shape, fade, opacity, paused, proximity, mouseInteraction]);\r
\r
  return (\r
    <div className={\`relative h-full w-full \${className}\`.trim()} style={style}>\r
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 block h-full w-full" />\r
    </div>\r
  );\r
};\r
\r
export default DotGrid;\r
`,i={usage:`import DotGrid from './DotGrid';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <DotGrid
    baseColor="#3a3446"
    activeColor="#ffffff"
    shape="circle"
    dotSize={5}
    gap={18}
    proximity={140}
    strength={1}
    bounce={0.6}
    tension={0.4}
    returnDuration={0.8}
    shockRadius={320}
    shockStrength={5}
    swell={0.8}
    stretch={0.5}
    glow={0.5}
    fade={0}
    intro={true}
  />
</div>`,code:n,css:r,tailwind:e,tsCode:t,tsTailwind:o};export{i as dotGrid};
