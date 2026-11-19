const r=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
import './CursorGrid.css';\r
\r
const INTRO_SECONDS = 1.4;\r
const STYLES = { lines: 0, dashed: 1, dots: 2, crosses: 3 };\r
\r
const FALLOFF_CURVES = {\r
  linear: t => t,\r
  smooth: t => t * t * (3 - 2 * t),\r
  sharp: t => t * t * t\r
};\r
\r
const VERTEX = \`#version 300 es\r
void main() {\r
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\r
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
\r
uniform vec2 uResolution;\r
uniform vec2 uOffset;\r
uniform float uCellSize;\r
uniform sampler2D uState;\r
uniform ivec2 uCells;\r
uniform vec3 uColor;\r
uniform vec3 uGridColor;\r
uniform float uLineWidth;\r
uniform float uMaxOpacity;\r
uniform float uFillOpacity;\r
uniform float uGridOpacity;\r
uniform float uCellRadius;\r
uniform float uCellGap;\r
uniform int uGridStyle;\r
uniform vec2 uMouse;\r
uniform float uRadius;\r
uniform float uSpotlight;\r
uniform float uPresence;\r
uniform float uEdgeFade;\r
uniform float uReveal;\r
\r
out vec4 outColor;\r
\r
float level(vec2 cell) {\r
  if (cell.x < 0.0 || cell.y < 0.0 || cell.x >= float(uCells.x) || cell.y >= float(uCells.y)) return 0.0;\r
  float v = texelFetch(uState, ivec2(cell), 0).r;\r
  return v * v * (3.0 - 2.0 * v);\r
}\r
\r
float line(float d, float width) {\r
  float w = max(width, 1.0);\r
  return clamp(w * 0.5 + 0.5 - d, 0.0, 1.0) * (width / w);\r
}\r
\r
float roundBox(vec2 p, vec2 b, float r) {\r
  vec2 q = abs(p) - b + r;\r
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;\r
}\r
\r
void main() {\r
  vec2 pos = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);\r
  vec2 g = (pos - uOffset) / uCellSize;\r
  vec2 cell = floor(g);\r
  vec2 f = g - cell;\r
  vec2 edge = min(f, 1.0 - f) * uCellSize;\r
\r
  float vx = line(edge.x, uLineWidth);\r
  float vy = line(edge.y, uLineWidth);\r
  if (uGridStyle == 1) {\r
    float dash = uCellSize / 6.0;\r
    vx *= step(0.5, fract((pos.y - uOffset.y) / dash + 0.25));\r
    vy *= step(0.5, fract((pos.x - uOffset.x) / dash + 0.25));\r
  } else if (uGridStyle == 2) {\r
    float r = max(uLineWidth * 1.25, 1.2);\r
    float d = length(edge);\r
    vx = clamp(r + 0.5 - d, 0.0, 1.0);\r
    vy = 0.0;\r
  } else if (uGridStyle == 3) {\r
    float arm = uCellSize * 0.1 + uLineWidth;\r
    vx *= step(edge.y, arm);\r
    vy *= step(edge.x, arm);\r
  }\r
  float mark = max(vx, vy);\r
\r
  vec2 toMouse = pos - uMouse;\r
  float spot = exp(-dot(toMouse, toMouse) / max(uRadius * uRadius, 1.0) * 1.6) * uSpotlight * uPresence;\r
\r
  vec2 center = uResolution * 0.5;\r
  float reach = length(center);\r
  float shown = smoothstep(uReveal * (reach + uCellSize * 2.0), uReveal * (reach + uCellSize * 2.0) - uCellSize * 2.0, length(pos - center));\r
  shown = uReveal >= 1.0 ? 1.0 : shown;\r
\r
  float fade = 1.0;\r
  if (uEdgeFade > 0.0) {\r
    vec2 norm = pos / uResolution;\r
    vec2 a = clamp(norm / uEdgeFade, 0.0, 1.0);\r
    vec2 b = clamp((1.0 - norm) / uEdgeFade, 0.0, 1.0);\r
    vec2 sa = a * a * a * (a * (a * 6.0 - 15.0) + 10.0);\r
    vec2 sb = b * b * b * (b * (b * 6.0 - 15.0) + 10.0);\r
    fade = sa.x * sa.y * sb.x * sb.y;\r
  }\r
\r
  float own = level(cell);\r
  float gridAlpha = mark * min(uGridOpacity + spot * 0.45, 1.0) * fade * shown;\r
  float litAlpha = 0.0;\r
  float fillAlpha = 0.0;\r
\r
  if (uCellGap <= 0.0 && uCellRadius <= 0.0) {\r
    vec2 side = step(0.5, f) * 2.0 - 1.0;\r
    float nx = level(cell + vec2(side.x, 0.0));\r
    float ny = level(cell + vec2(0.0, side.y));\r
    float nc = level(cell + side);\r
    float ex = max(own, nx);\r
    float ey = max(own, ny);\r
    float joint = max(max(ex, ey), nc);\r
    float lit;\r
    if (uGridStyle == 2) lit = vx * joint;\r
    else if (uGridStyle == 3) lit = max(vx * (edge.y < uLineWidth ? joint : ex), vy * (edge.x < uLineWidth ? joint : ey));\r
    else lit = max(vx * (edge.y < uLineWidth ? joint : ex), vy * (edge.x < uLineWidth ? joint : ey));\r
    litAlpha = lit * uMaxOpacity;\r
    fillAlpha = own * uFillOpacity;\r
  } else if (own > 0.0) {\r
    vec2 local = (f - 0.5) * uCellSize;\r
    float halfSize = uCellSize * 0.5 - max(uCellGap, 0.0);\r
    float radius = min(uCellRadius, halfSize);\r
    float sd = roundBox(local, vec2(halfSize), radius);\r
    float inside = clamp(0.5 - sd, 0.0, 1.0);\r
    float border = line(abs(sd + uLineWidth * 0.5), uLineWidth) * inside;\r
    litAlpha = border * own * uMaxOpacity;\r
    fillAlpha = inside * own * uFillOpacity;\r
  }\r
  litAlpha *= fade;\r
  fillAlpha *= fade;\r
\r
  float cellAlpha = clamp(max(litAlpha, fillAlpha), 0.0, 1.0);\r
  float alpha = cellAlpha + gridAlpha * (1.0 - cellAlpha);\r
  vec3 premul = uColor * cellAlpha + uGridColor * gridAlpha * (1.0 - cellAlpha);\r
  outColor = vec4(premul, alpha);\r
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
const colorCache = new Map();\r
\r
const parseHex = hex => {\r
  let h = String(hex || '#ffffff')\r
    .replace('#', '')\r
    .trim();\r
  if (h.length === 3 || h.length === 4)\r
    h = h\r
      .slice(0, 3)\r
      .split('')\r
      .map(c => c + c)\r
      .join('');\r
  const num = parseInt(h.slice(0, 6), 16);\r
  if (Number.isNaN(num)) return [1, 1, 1];\r
  return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];\r
};\r
\r
const hexToRgb = hex => {\r
  const key = String(hex);\r
  const cached = colorCache.get(key);\r
  if (cached) return cached;\r
  const rgb = parseHex(hex);\r
  if (colorCache.size > 64) colorCache.clear();\r
  colorCache.set(key, rgb);\r
  return rgb;\r
};\r
\r
const CursorGrid = ({\r
  cellSize = 60,\r
  color,\r
  gridColor,\r
  radius = 140,\r
  falloff = 'smooth',\r
  highlight = 'area',\r
  holdTime = 400,\r
  fadeDuration = 800,\r
  lineWidth = 1,\r
  maxOpacity = 1,\r
  fillOpacity = 0.06,\r
  gridOpacity = 0.08,\r
  gridStyle = 'lines',\r
  cellRadius = 0,\r
  cellGap = 0,\r
  spotlight = 0.6,\r
  clickPulse = true,\r
  pulseSpeed = 600,\r
  ambient = 0,\r
  edgeFade = 0.2,\r
  intro = true,\r
  lightMode = false,\r
  dpr,\r
  children,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const ink = lightMode ? '#18181b' : '#ffffff';\r
  const settings = {\r
    cellSize: Math.max(8, cellSize),\r
    color: color || ink,\r
    gridColor: gridColor || ink,\r
    radius: Math.max(1, radius),\r
    falloff,\r
    highlight,\r
    holdTime: Math.max(0, holdTime),\r
    fadeDuration: Math.max(16, fadeDuration),\r
    lineWidth: Math.max(0.25, lineWidth),\r
    maxOpacity: clamp(maxOpacity, 0, 1),\r
    fillOpacity: clamp(fillOpacity, 0, 1),\r
    gridOpacity: clamp(gridOpacity, 0, 1),\r
    gridStyle: STYLES[gridStyle] ?? 0,\r
    cellRadius: Math.max(0, cellRadius),\r
    cellGap: Math.max(0, cellGap),\r
    spotlight: clamp(spotlight, 0, 1),\r
    clickPulse,\r
    pulseSpeed: Math.max(1, pulseSpeed),\r
    ambient: clamp(ambient, 0, 1),\r
    edgeFade: clamp(edgeFade, 0, 0.5),\r
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
    const shader = link(gl);\r
    if (!shader) return undefined;\r
    const u = shader.uniforms;\r
    const vao = gl.createVertexArray();\r
    const stateTexture = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, stateTexture);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1, ratio: 1, cellSize: 0 };\r
    const grid = { cols: 0, rows: 0, offX: 0, offY: 0 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const mouse = { x: 0, y: 0 };\r
    const pulses = [];\r
    let levels = new Float32Array(0);\r
    let waves = new Float32Array(0);\r
    let targets = new Float32Array(0);\r
    let touched = new Float32Array(0);\r
    let pixels = new Uint8Array(0);\r
    let presence = 0;\r
    let clock = 0;\r
    let introClock = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let dirty = true;\r
\r
    const rebuild = () => {\r
      const s = settingsRef.current;\r
      view.width = Math.max(1, container.clientWidth);\r
      view.height = Math.max(1, container.clientHeight);\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(view.width * view.ratio));\r
      canvas.height = Math.max(1, Math.round(view.height * view.ratio));\r
      const size = s.cellSize;\r
      const cols = Math.ceil(view.width / size) + 1;\r
      const rows = Math.ceil(view.height / size) + 1;\r
      const resized = cols !== grid.cols || rows !== grid.rows || size !== view.cellSize;\r
      grid.cols = cols;\r
      grid.rows = rows;\r
      grid.offX = (view.width - cols * size) / 2;\r
      grid.offY = (view.height - rows * size) / 2;\r
      view.cellSize = size;\r
      if (resized) {\r
        levels = new Float32Array(cols * rows);\r
        waves = new Float32Array(cols * rows);\r
        targets = new Float32Array(cols * rows);\r
        touched = new Float32Array(cols * rows).fill(-1e9);\r
        pixels = new Uint8Array(cols * rows);\r
        gl.bindTexture(gl.TEXTURE_2D, stateTexture);\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, cols, rows, 0, gl.RED, gl.UNSIGNED_BYTE, pixels);\r
      }\r
      dirty = true;\r
    };\r
\r
    const light = (index, value) => {\r
      if (value > targets[index]) targets[index] = value;\r
      touched[index] = clock;\r
    };\r
\r
    const energize = (x, y) => {\r
      const s = settingsRef.current;\r
      const size = s.cellSize;\r
      if (s.highlight === 'cell') {\r
        const col = Math.floor((x - grid.offX) / size);\r
        const row = Math.floor((y - grid.offY) / size);\r
        if (col >= 0 && row >= 0 && col < grid.cols && row < grid.rows) light(row * grid.cols + col, 1);\r
        return;\r
      }\r
      const r = s.radius;\r
      const ease = FALLOFF_CURVES[s.falloff] ?? FALLOFF_CURVES.linear;\r
      const minCol = Math.max(0, Math.floor((x - r - grid.offX) / size));\r
      const maxCol = Math.min(grid.cols - 1, Math.floor((x + r - grid.offX) / size));\r
      const minRow = Math.max(0, Math.floor((y - r - grid.offY) / size));\r
      const maxRow = Math.min(grid.rows - 1, Math.floor((y + r - grid.offY) / size));\r
      for (let row = minRow; row <= maxRow; row++) {\r
        for (let col = minCol; col <= maxCol; col++) {\r
          const cx = grid.offX + col * size + size / 2;\r
          const cy = grid.offY + row * size + size / 2;\r
          const dist = Math.hypot(cx - x, cy - y);\r
          if (dist > r) continue;\r
          const value = ease(1 - dist / r);\r
          if (value > 0) light(row * grid.cols + col, value);\r
        }\r
      }\r
    };\r
\r
    const sweepPulses = s => {\r
      const size = s.cellSize;\r
      const ahead = size * 0.6;\r
      const behind = size * 1.4;\r
      const far = Math.hypot(view.width, view.height);\r
      waves.fill(0);\r
      for (let k = pulses.length - 1; k >= 0; k--) {\r
        const pulse = pulses[k];\r
        const ringR = (clock - pulse.t0) * s.pulseSpeed;\r
        if (ringR - behind * 2 > far) {\r
          pulses.splice(k, 1);\r
          continue;\r
        }\r
        if (ringR < 0) continue;\r
        const envelope = pulse.strength * Math.pow(Math.max(0, 1 - ringR / (far + behind)), 0.6);\r
        const outer = ringR + ahead * 2;\r
        const minCol = Math.max(0, Math.floor((pulse.x - outer - grid.offX) / size));\r
        const maxCol = Math.min(grid.cols - 1, Math.floor((pulse.x + outer - grid.offX) / size));\r
        const minRow = Math.max(0, Math.floor((pulse.y - outer - grid.offY) / size));\r
        const maxRow = Math.min(grid.rows - 1, Math.floor((pulse.y + outer - grid.offY) / size));\r
        for (let row = minRow; row <= maxRow; row++) {\r
          for (let col = minCol; col <= maxCol; col++) {\r
            const cx = grid.offX + col * size + size / 2;\r
            const cy = grid.offY + row * size + size / 2;\r
            const off = Math.hypot(cx - pulse.x, cy - pulse.y) - ringR;\r
            if (off > ahead * 2 || off < -behind * 2) continue;\r
            const t = off > 0 ? off / ahead : off / behind;\r
            const value = envelope * Math.exp(-t * t);\r
            const index = row * grid.cols + col;\r
            if (value > waves[index]) waves[index] = value;\r
          }\r
        }\r
      }\r
      dirty = true;\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      const ratio = view.ratio;\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.useProgram(shader.program);\r
      gl.bindVertexArray(vao);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, stateTexture);\r
      if (dirty) {\r
        for (let i = 0; i < levels.length; i++)\r
          pixels[i] = Math.round(clamp(Math.max(levels[i], waves[i]), 0, 1) * 255);\r
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, grid.cols, grid.rows, gl.RED, gl.UNSIGNED_BYTE, pixels);\r
        dirty = false;\r
      }\r
      const lineDevice = s.lineWidth * ratio;\r
      const snap = Math.round(lineDevice) % 2 === 1 ? 0.5 : 0;\r
      gl.uniform1i(u.uState, 0);\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform2f(u.uOffset, Math.round(grid.offX * ratio) + snap, Math.round(grid.offY * ratio) + snap);\r
      gl.uniform1f(u.uCellSize, s.cellSize * ratio);\r
      gl.uniform2i(u.uCells, grid.cols, grid.rows);\r
      gl.uniform3fv(u.uColor, hexToRgb(s.color));\r
      gl.uniform3fv(u.uGridColor, hexToRgb(s.gridColor));\r
      gl.uniform1f(u.uLineWidth, lineDevice);\r
      gl.uniform1f(u.uMaxOpacity, s.maxOpacity);\r
      gl.uniform1f(u.uFillOpacity, s.fillOpacity);\r
      gl.uniform1f(u.uGridOpacity, s.gridOpacity);\r
      gl.uniform1f(u.uCellRadius, s.cellRadius * ratio);\r
      gl.uniform1f(u.uCellGap, s.cellGap * ratio);\r
      gl.uniform1i(u.uGridStyle, s.gridStyle);\r
      gl.uniform2f(u.uMouse, mouse.x * ratio, mouse.y * ratio);\r
      gl.uniform1f(u.uRadius, s.radius * ratio);\r
      gl.uniform1f(u.uSpotlight, s.spotlight);\r
      gl.uniform1f(u.uPresence, presence);\r
      gl.uniform1f(u.uEdgeFade, s.edgeFade);\r
      gl.uniform1f(u.uReveal, introClock >= 1 ? 1 : 1 - Math.pow(1 - introClock, 2.2));\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0, 1 / 20) : 1 / 60;\r
      last = now;\r
      clock += dt;\r
      if (introClock < 1) introClock = Math.min(1, introClock + dt / INTRO_SECONDS);\r
\r
      const follow = 1 - Math.exp(-dt / 0.07);\r
      mouse.x += (pointer.x - mouse.x) * follow;\r
      mouse.y += (pointer.y - mouse.y) * follow;\r
      const presenceGoal = pointer.inside ? 1 : 0;\r
      presence += (presenceGoal - presence) * (1 - Math.exp(-dt / 0.25));\r
\r
      if (s.ambient > 0 && !reduce && levels.length) {\r
        const chance = s.ambient * dt * levels.length * 0.04;\r
        let spawns = Math.floor(chance) + (Math.random() < chance % 1 ? 1 : 0);\r
        while (spawns-- > 0) light(Math.floor(Math.random() * levels.length), 0.25 + Math.random() * 0.45);\r
      }\r
      if (pulses.length) sweepPulses(s);\r
      else if (waves.length && waves.some(value => value > 0)) {\r
        waves.fill(0);\r
        dirty = true;\r
      }\r
\r
      const holdSeconds = s.holdTime / 1000;\r
      const fadeStep = dt / (s.fadeDuration / 1000);\r
      const attack = 1 - Math.exp(-dt / 0.045);\r
      let active = pulses.length > 0 || introClock < 1 || Math.abs(presence - presenceGoal) > 0.002;\r
      for (let i = 0; i < levels.length; i++) {\r
        let target = targets[i];\r
        if (target <= 0 && levels[i] <= 0) continue;\r
        if (clock - touched[i] > holdSeconds) target = Math.max(0, target - fadeStep);\r
        targets[i] = target;\r
        const before = levels[i];\r
        const next = target > before ? before + (target - before) * attack : target;\r
        levels[i] = next < 0.002 ? 0 : next;\r
        if (levels[i] !== before) dirty = true;\r
        if (levels[i] > 0 || targets[i] > 0) active = true;\r
      }\r
      if (Math.abs(mouse.x - pointer.x) + Math.abs(mouse.y - pointer.y) > 0.05 && presence > 0.002) active = true;\r
      if (s.ambient > 0 && !reduce) active = true;\r
\r
      draw();\r
      if (active) raf = requestAnimationFrame(frame);\r
    };\r
\r
    function wake() {\r
      if (!raf && visible && !document.hidden) {\r
        last = 0;\r
        raf = requestAnimationFrame(frame);\r
      }\r
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
      const was = pointer.inside;\r
      pointer.inside = inside;\r
      if (!inside) {\r
        if (was) wake();\r
        return;\r
      }\r
      pointer.x = x;\r
      pointer.y = y;\r
      if (!was) {\r
        mouse.x = x;\r
        mouse.y = y;\r
      }\r
      energize(x, y);\r
      wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      const { x, y, inside } = locate(event);\r
      if (!inside || !s.clickPulse || reduce) return;\r
      pulses.push({ x, y, t0: clock, strength: 1 });\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
    const onVisibility = () => wake();\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      rebuild();\r
      draw();\r
      wake();\r
    });\r
    resizeObserver.observe(container);\r
    const intersection = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible) wake();\r
    });\r
    intersection.observe(container);\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    rebuild();\r
    if (introClock < 1) pulses.push({ x: view.width / 2, y: view.height / 2, t0: 0.15, strength: 0.6 });\r
    draw();\r
    wake();\r
    wakeRef.current = () => {\r
      const s = settingsRef.current;\r
      if (s.cellSize !== view.cellSize) rebuild();\r
      dirty = true;\r
      draw();\r
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
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteTexture(stateTexture);\r
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
    <div ref={containerRef} className={\`cursor-grid\${className ? \` \${className}\` : ''}\`} style={style}>\r
      <canvas ref={canvasRef} className="cursor-grid__canvas" aria-hidden="true" />\r
      {children ? <div className="cursor-grid__content">{children}</div> : null}\r
    </div>\r
  );\r
};\r
\r
export default CursorGrid;\r
`,e=`.cursor-grid {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.cursor-grid__canvas {\r
  position: absolute;\r
  inset: 0;\r
  display: block;\r
  width: 100%;\r
  height: 100%;\r
  pointer-events: none;\r
}\r
\r
.cursor-grid__content {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
}\r
`,n=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
const INTRO_SECONDS = 1.4;\r
const STYLES = { lines: 0, dashed: 1, dots: 2, crosses: 3 };\r
\r
const FALLOFF_CURVES = {\r
  linear: t => t,\r
  smooth: t => t * t * (3 - 2 * t),\r
  sharp: t => t * t * t\r
};\r
\r
const VERTEX = \`#version 300 es\r
void main() {\r
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\r
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
\r
uniform vec2 uResolution;\r
uniform vec2 uOffset;\r
uniform float uCellSize;\r
uniform sampler2D uState;\r
uniform ivec2 uCells;\r
uniform vec3 uColor;\r
uniform vec3 uGridColor;\r
uniform float uLineWidth;\r
uniform float uMaxOpacity;\r
uniform float uFillOpacity;\r
uniform float uGridOpacity;\r
uniform float uCellRadius;\r
uniform float uCellGap;\r
uniform int uGridStyle;\r
uniform vec2 uMouse;\r
uniform float uRadius;\r
uniform float uSpotlight;\r
uniform float uPresence;\r
uniform float uEdgeFade;\r
uniform float uReveal;\r
\r
out vec4 outColor;\r
\r
float level(vec2 cell) {\r
  if (cell.x < 0.0 || cell.y < 0.0 || cell.x >= float(uCells.x) || cell.y >= float(uCells.y)) return 0.0;\r
  float v = texelFetch(uState, ivec2(cell), 0).r;\r
  return v * v * (3.0 - 2.0 * v);\r
}\r
\r
float line(float d, float width) {\r
  float w = max(width, 1.0);\r
  return clamp(w * 0.5 + 0.5 - d, 0.0, 1.0) * (width / w);\r
}\r
\r
float roundBox(vec2 p, vec2 b, float r) {\r
  vec2 q = abs(p) - b + r;\r
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;\r
}\r
\r
void main() {\r
  vec2 pos = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);\r
  vec2 g = (pos - uOffset) / uCellSize;\r
  vec2 cell = floor(g);\r
  vec2 f = g - cell;\r
  vec2 edge = min(f, 1.0 - f) * uCellSize;\r
\r
  float vx = line(edge.x, uLineWidth);\r
  float vy = line(edge.y, uLineWidth);\r
  if (uGridStyle == 1) {\r
    float dash = uCellSize / 6.0;\r
    vx *= step(0.5, fract((pos.y - uOffset.y) / dash + 0.25));\r
    vy *= step(0.5, fract((pos.x - uOffset.x) / dash + 0.25));\r
  } else if (uGridStyle == 2) {\r
    float r = max(uLineWidth * 1.25, 1.2);\r
    float d = length(edge);\r
    vx = clamp(r + 0.5 - d, 0.0, 1.0);\r
    vy = 0.0;\r
  } else if (uGridStyle == 3) {\r
    float arm = uCellSize * 0.1 + uLineWidth;\r
    vx *= step(edge.y, arm);\r
    vy *= step(edge.x, arm);\r
  }\r
  float mark = max(vx, vy);\r
\r
  vec2 toMouse = pos - uMouse;\r
  float spot = exp(-dot(toMouse, toMouse) / max(uRadius * uRadius, 1.0) * 1.6) * uSpotlight * uPresence;\r
\r
  vec2 center = uResolution * 0.5;\r
  float reach = length(center);\r
  float shown = smoothstep(uReveal * (reach + uCellSize * 2.0), uReveal * (reach + uCellSize * 2.0) - uCellSize * 2.0, length(pos - center));\r
  shown = uReveal >= 1.0 ? 1.0 : shown;\r
\r
  float fade = 1.0;\r
  if (uEdgeFade > 0.0) {\r
    vec2 norm = pos / uResolution;\r
    vec2 a = clamp(norm / uEdgeFade, 0.0, 1.0);\r
    vec2 b = clamp((1.0 - norm) / uEdgeFade, 0.0, 1.0);\r
    vec2 sa = a * a * a * (a * (a * 6.0 - 15.0) + 10.0);\r
    vec2 sb = b * b * b * (b * (b * 6.0 - 15.0) + 10.0);\r
    fade = sa.x * sa.y * sb.x * sb.y;\r
  }\r
\r
  float own = level(cell);\r
  float gridAlpha = mark * min(uGridOpacity + spot * 0.45, 1.0) * fade * shown;\r
  float litAlpha = 0.0;\r
  float fillAlpha = 0.0;\r
\r
  if (uCellGap <= 0.0 && uCellRadius <= 0.0) {\r
    vec2 side = step(0.5, f) * 2.0 - 1.0;\r
    float nx = level(cell + vec2(side.x, 0.0));\r
    float ny = level(cell + vec2(0.0, side.y));\r
    float nc = level(cell + side);\r
    float ex = max(own, nx);\r
    float ey = max(own, ny);\r
    float joint = max(max(ex, ey), nc);\r
    float lit;\r
    if (uGridStyle == 2) lit = vx * joint;\r
    else if (uGridStyle == 3) lit = max(vx * (edge.y < uLineWidth ? joint : ex), vy * (edge.x < uLineWidth ? joint : ey));\r
    else lit = max(vx * (edge.y < uLineWidth ? joint : ex), vy * (edge.x < uLineWidth ? joint : ey));\r
    litAlpha = lit * uMaxOpacity;\r
    fillAlpha = own * uFillOpacity;\r
  } else if (own > 0.0) {\r
    vec2 local = (f - 0.5) * uCellSize;\r
    float halfSize = uCellSize * 0.5 - max(uCellGap, 0.0);\r
    float radius = min(uCellRadius, halfSize);\r
    float sd = roundBox(local, vec2(halfSize), radius);\r
    float inside = clamp(0.5 - sd, 0.0, 1.0);\r
    float border = line(abs(sd + uLineWidth * 0.5), uLineWidth) * inside;\r
    litAlpha = border * own * uMaxOpacity;\r
    fillAlpha = inside * own * uFillOpacity;\r
  }\r
  litAlpha *= fade;\r
  fillAlpha *= fade;\r
\r
  float cellAlpha = clamp(max(litAlpha, fillAlpha), 0.0, 1.0);\r
  float alpha = cellAlpha + gridAlpha * (1.0 - cellAlpha);\r
  vec3 premul = uColor * cellAlpha + uGridColor * gridAlpha * (1.0 - cellAlpha);\r
  outColor = vec4(premul, alpha);\r
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
const colorCache = new Map();\r
\r
const parseHex = hex => {\r
  let h = String(hex || '#ffffff')\r
    .replace('#', '')\r
    .trim();\r
  if (h.length === 3 || h.length === 4)\r
    h = h\r
      .slice(0, 3)\r
      .split('')\r
      .map(c => c + c)\r
      .join('');\r
  const num = parseInt(h.slice(0, 6), 16);\r
  if (Number.isNaN(num)) return [1, 1, 1];\r
  return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];\r
};\r
\r
const hexToRgb = hex => {\r
  const key = String(hex);\r
  const cached = colorCache.get(key);\r
  if (cached) return cached;\r
  const rgb = parseHex(hex);\r
  if (colorCache.size > 64) colorCache.clear();\r
  colorCache.set(key, rgb);\r
  return rgb;\r
};\r
\r
const CursorGrid = ({\r
  cellSize = 60,\r
  color,\r
  gridColor,\r
  radius = 140,\r
  falloff = 'smooth',\r
  highlight = 'area',\r
  holdTime = 400,\r
  fadeDuration = 800,\r
  lineWidth = 1,\r
  maxOpacity = 1,\r
  fillOpacity = 0.06,\r
  gridOpacity = 0.08,\r
  gridStyle = 'lines',\r
  cellRadius = 0,\r
  cellGap = 0,\r
  spotlight = 0.6,\r
  clickPulse = true,\r
  pulseSpeed = 600,\r
  ambient = 0,\r
  edgeFade = 0.2,\r
  intro = true,\r
  lightMode = false,\r
  dpr,\r
  children,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const ink = lightMode ? '#18181b' : '#ffffff';\r
  const settings = {\r
    cellSize: Math.max(8, cellSize),\r
    color: color || ink,\r
    gridColor: gridColor || ink,\r
    radius: Math.max(1, radius),\r
    falloff,\r
    highlight,\r
    holdTime: Math.max(0, holdTime),\r
    fadeDuration: Math.max(16, fadeDuration),\r
    lineWidth: Math.max(0.25, lineWidth),\r
    maxOpacity: clamp(maxOpacity, 0, 1),\r
    fillOpacity: clamp(fillOpacity, 0, 1),\r
    gridOpacity: clamp(gridOpacity, 0, 1),\r
    gridStyle: STYLES[gridStyle] ?? 0,\r
    cellRadius: Math.max(0, cellRadius),\r
    cellGap: Math.max(0, cellGap),\r
    spotlight: clamp(spotlight, 0, 1),\r
    clickPulse,\r
    pulseSpeed: Math.max(1, pulseSpeed),\r
    ambient: clamp(ambient, 0, 1),\r
    edgeFade: clamp(edgeFade, 0, 0.5),\r
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
    const shader = link(gl);\r
    if (!shader) return undefined;\r
    const u = shader.uniforms;\r
    const vao = gl.createVertexArray();\r
    const stateTexture = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, stateTexture);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1, ratio: 1, cellSize: 0 };\r
    const grid = { cols: 0, rows: 0, offX: 0, offY: 0 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const mouse = { x: 0, y: 0 };\r
    const pulses = [];\r
    let levels = new Float32Array(0);\r
    let waves = new Float32Array(0);\r
    let targets = new Float32Array(0);\r
    let touched = new Float32Array(0);\r
    let pixels = new Uint8Array(0);\r
    let presence = 0;\r
    let clock = 0;\r
    let introClock = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let dirty = true;\r
\r
    const rebuild = () => {\r
      const s = settingsRef.current;\r
      view.width = Math.max(1, container.clientWidth);\r
      view.height = Math.max(1, container.clientHeight);\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(view.width * view.ratio));\r
      canvas.height = Math.max(1, Math.round(view.height * view.ratio));\r
      const size = s.cellSize;\r
      const cols = Math.ceil(view.width / size) + 1;\r
      const rows = Math.ceil(view.height / size) + 1;\r
      const resized = cols !== grid.cols || rows !== grid.rows || size !== view.cellSize;\r
      grid.cols = cols;\r
      grid.rows = rows;\r
      grid.offX = (view.width - cols * size) / 2;\r
      grid.offY = (view.height - rows * size) / 2;\r
      view.cellSize = size;\r
      if (resized) {\r
        levels = new Float32Array(cols * rows);\r
        waves = new Float32Array(cols * rows);\r
        targets = new Float32Array(cols * rows);\r
        touched = new Float32Array(cols * rows).fill(-1e9);\r
        pixels = new Uint8Array(cols * rows);\r
        gl.bindTexture(gl.TEXTURE_2D, stateTexture);\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, cols, rows, 0, gl.RED, gl.UNSIGNED_BYTE, pixels);\r
      }\r
      dirty = true;\r
    };\r
\r
    const light = (index, value) => {\r
      if (value > targets[index]) targets[index] = value;\r
      touched[index] = clock;\r
    };\r
\r
    const energize = (x, y) => {\r
      const s = settingsRef.current;\r
      const size = s.cellSize;\r
      if (s.highlight === 'cell') {\r
        const col = Math.floor((x - grid.offX) / size);\r
        const row = Math.floor((y - grid.offY) / size);\r
        if (col >= 0 && row >= 0 && col < grid.cols && row < grid.rows) light(row * grid.cols + col, 1);\r
        return;\r
      }\r
      const r = s.radius;\r
      const ease = FALLOFF_CURVES[s.falloff] ?? FALLOFF_CURVES.linear;\r
      const minCol = Math.max(0, Math.floor((x - r - grid.offX) / size));\r
      const maxCol = Math.min(grid.cols - 1, Math.floor((x + r - grid.offX) / size));\r
      const minRow = Math.max(0, Math.floor((y - r - grid.offY) / size));\r
      const maxRow = Math.min(grid.rows - 1, Math.floor((y + r - grid.offY) / size));\r
      for (let row = minRow; row <= maxRow; row++) {\r
        for (let col = minCol; col <= maxCol; col++) {\r
          const cx = grid.offX + col * size + size / 2;\r
          const cy = grid.offY + row * size + size / 2;\r
          const dist = Math.hypot(cx - x, cy - y);\r
          if (dist > r) continue;\r
          const value = ease(1 - dist / r);\r
          if (value > 0) light(row * grid.cols + col, value);\r
        }\r
      }\r
    };\r
\r
    const sweepPulses = s => {\r
      const size = s.cellSize;\r
      const ahead = size * 0.6;\r
      const behind = size * 1.4;\r
      const far = Math.hypot(view.width, view.height);\r
      waves.fill(0);\r
      for (let k = pulses.length - 1; k >= 0; k--) {\r
        const pulse = pulses[k];\r
        const ringR = (clock - pulse.t0) * s.pulseSpeed;\r
        if (ringR - behind * 2 > far) {\r
          pulses.splice(k, 1);\r
          continue;\r
        }\r
        if (ringR < 0) continue;\r
        const envelope = pulse.strength * Math.pow(Math.max(0, 1 - ringR / (far + behind)), 0.6);\r
        const outer = ringR + ahead * 2;\r
        const minCol = Math.max(0, Math.floor((pulse.x - outer - grid.offX) / size));\r
        const maxCol = Math.min(grid.cols - 1, Math.floor((pulse.x + outer - grid.offX) / size));\r
        const minRow = Math.max(0, Math.floor((pulse.y - outer - grid.offY) / size));\r
        const maxRow = Math.min(grid.rows - 1, Math.floor((pulse.y + outer - grid.offY) / size));\r
        for (let row = minRow; row <= maxRow; row++) {\r
          for (let col = minCol; col <= maxCol; col++) {\r
            const cx = grid.offX + col * size + size / 2;\r
            const cy = grid.offY + row * size + size / 2;\r
            const off = Math.hypot(cx - pulse.x, cy - pulse.y) - ringR;\r
            if (off > ahead * 2 || off < -behind * 2) continue;\r
            const t = off > 0 ? off / ahead : off / behind;\r
            const value = envelope * Math.exp(-t * t);\r
            const index = row * grid.cols + col;\r
            if (value > waves[index]) waves[index] = value;\r
          }\r
        }\r
      }\r
      dirty = true;\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      const ratio = view.ratio;\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.useProgram(shader.program);\r
      gl.bindVertexArray(vao);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, stateTexture);\r
      if (dirty) {\r
        for (let i = 0; i < levels.length; i++)\r
          pixels[i] = Math.round(clamp(Math.max(levels[i], waves[i]), 0, 1) * 255);\r
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, grid.cols, grid.rows, gl.RED, gl.UNSIGNED_BYTE, pixels);\r
        dirty = false;\r
      }\r
      const lineDevice = s.lineWidth * ratio;\r
      const snap = Math.round(lineDevice) % 2 === 1 ? 0.5 : 0;\r
      gl.uniform1i(u.uState, 0);\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform2f(u.uOffset, Math.round(grid.offX * ratio) + snap, Math.round(grid.offY * ratio) + snap);\r
      gl.uniform1f(u.uCellSize, s.cellSize * ratio);\r
      gl.uniform2i(u.uCells, grid.cols, grid.rows);\r
      gl.uniform3fv(u.uColor, hexToRgb(s.color));\r
      gl.uniform3fv(u.uGridColor, hexToRgb(s.gridColor));\r
      gl.uniform1f(u.uLineWidth, lineDevice);\r
      gl.uniform1f(u.uMaxOpacity, s.maxOpacity);\r
      gl.uniform1f(u.uFillOpacity, s.fillOpacity);\r
      gl.uniform1f(u.uGridOpacity, s.gridOpacity);\r
      gl.uniform1f(u.uCellRadius, s.cellRadius * ratio);\r
      gl.uniform1f(u.uCellGap, s.cellGap * ratio);\r
      gl.uniform1i(u.uGridStyle, s.gridStyle);\r
      gl.uniform2f(u.uMouse, mouse.x * ratio, mouse.y * ratio);\r
      gl.uniform1f(u.uRadius, s.radius * ratio);\r
      gl.uniform1f(u.uSpotlight, s.spotlight);\r
      gl.uniform1f(u.uPresence, presence);\r
      gl.uniform1f(u.uEdgeFade, s.edgeFade);\r
      gl.uniform1f(u.uReveal, introClock >= 1 ? 1 : 1 - Math.pow(1 - introClock, 2.2));\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0, 1 / 20) : 1 / 60;\r
      last = now;\r
      clock += dt;\r
      if (introClock < 1) introClock = Math.min(1, introClock + dt / INTRO_SECONDS);\r
\r
      const follow = 1 - Math.exp(-dt / 0.07);\r
      mouse.x += (pointer.x - mouse.x) * follow;\r
      mouse.y += (pointer.y - mouse.y) * follow;\r
      const presenceGoal = pointer.inside ? 1 : 0;\r
      presence += (presenceGoal - presence) * (1 - Math.exp(-dt / 0.25));\r
\r
      if (s.ambient > 0 && !reduce && levels.length) {\r
        const chance = s.ambient * dt * levels.length * 0.04;\r
        let spawns = Math.floor(chance) + (Math.random() < chance % 1 ? 1 : 0);\r
        while (spawns-- > 0) light(Math.floor(Math.random() * levels.length), 0.25 + Math.random() * 0.45);\r
      }\r
      if (pulses.length) sweepPulses(s);\r
      else if (waves.length && waves.some(value => value > 0)) {\r
        waves.fill(0);\r
        dirty = true;\r
      }\r
\r
      const holdSeconds = s.holdTime / 1000;\r
      const fadeStep = dt / (s.fadeDuration / 1000);\r
      const attack = 1 - Math.exp(-dt / 0.045);\r
      let active = pulses.length > 0 || introClock < 1 || Math.abs(presence - presenceGoal) > 0.002;\r
      for (let i = 0; i < levels.length; i++) {\r
        let target = targets[i];\r
        if (target <= 0 && levels[i] <= 0) continue;\r
        if (clock - touched[i] > holdSeconds) target = Math.max(0, target - fadeStep);\r
        targets[i] = target;\r
        const before = levels[i];\r
        const next = target > before ? before + (target - before) * attack : target;\r
        levels[i] = next < 0.002 ? 0 : next;\r
        if (levels[i] !== before) dirty = true;\r
        if (levels[i] > 0 || targets[i] > 0) active = true;\r
      }\r
      if (Math.abs(mouse.x - pointer.x) + Math.abs(mouse.y - pointer.y) > 0.05 && presence > 0.002) active = true;\r
      if (s.ambient > 0 && !reduce) active = true;\r
\r
      draw();\r
      if (active) raf = requestAnimationFrame(frame);\r
    };\r
\r
    function wake() {\r
      if (!raf && visible && !document.hidden) {\r
        last = 0;\r
        raf = requestAnimationFrame(frame);\r
      }\r
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
      const was = pointer.inside;\r
      pointer.inside = inside;\r
      if (!inside) {\r
        if (was) wake();\r
        return;\r
      }\r
      pointer.x = x;\r
      pointer.y = y;\r
      if (!was) {\r
        mouse.x = x;\r
        mouse.y = y;\r
      }\r
      energize(x, y);\r
      wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      const { x, y, inside } = locate(event);\r
      if (!inside || !s.clickPulse || reduce) return;\r
      pulses.push({ x, y, t0: clock, strength: 1 });\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
    const onVisibility = () => wake();\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      rebuild();\r
      draw();\r
      wake();\r
    });\r
    resizeObserver.observe(container);\r
    const intersection = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible) wake();\r
    });\r
    intersection.observe(container);\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    rebuild();\r
    if (introClock < 1) pulses.push({ x: view.width / 2, y: view.height / 2, t0: 0.15, strength: 0.6 });\r
    draw();\r
    wake();\r
    wakeRef.current = () => {\r
      const s = settingsRef.current;\r
      if (s.cellSize !== view.cellSize) rebuild();\r
      dirty = true;\r
      draw();\r
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
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteTexture(stateTexture);\r
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
    >\r
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 block h-full w-full" aria-hidden="true" />\r
      {children ? <div className="relative h-full w-full">{children}</div> : null}\r
    </div>\r
  );\r
};\r
\r
export default CursorGrid;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';\r
import './CursorGrid.css';\r
\r
export type CursorGridFalloff = 'linear' | 'smooth' | 'sharp';\r
export type CursorGridHighlight = 'area' | 'cell';\r
export type CursorGridStyle = 'lines' | 'dashed' | 'dots' | 'crosses';\r
\r
export interface CursorGridProps {\r
  cellSize?: number;\r
  color?: string;\r
  gridColor?: string;\r
  radius?: number;\r
  falloff?: CursorGridFalloff;\r
  highlight?: CursorGridHighlight;\r
  holdTime?: number;\r
  fadeDuration?: number;\r
  lineWidth?: number;\r
  maxOpacity?: number;\r
  fillOpacity?: number;\r
  gridOpacity?: number;\r
  gridStyle?: CursorGridStyle;\r
  cellRadius?: number;\r
  cellGap?: number;\r
  spotlight?: number;\r
  clickPulse?: boolean;\r
  pulseSpeed?: number;\r
  ambient?: number;\r
  edgeFade?: number;\r
  intro?: boolean;\r
  lightMode?: boolean;\r
  dpr?: number;\r
  children?: ReactNode;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
type Settings = {\r
  cellSize: number;\r
  color: string;\r
  gridColor: string;\r
  radius: number;\r
  falloff: CursorGridFalloff;\r
  highlight: CursorGridHighlight;\r
  holdTime: number;\r
  fadeDuration: number;\r
  lineWidth: number;\r
  maxOpacity: number;\r
  fillOpacity: number;\r
  gridOpacity: number;\r
  gridStyle: number;\r
  cellRadius: number;\r
  cellGap: number;\r
  spotlight: number;\r
  clickPulse: boolean;\r
  pulseSpeed: number;\r
  ambient: number;\r
  edgeFade: number;\r
  intro: boolean;\r
  dpr?: number;\r
};\r
\r
type Pulse = { x: number; y: number; t0: number; strength: number };\r
\r
type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };\r
\r
const INTRO_SECONDS = 1.4;\r
const STYLES: Record<string, number> = { lines: 0, dashed: 1, dots: 2, crosses: 3 };\r
\r
const FALLOFF_CURVES: Record<string, (t: number) => number> = {\r
  linear: t => t,\r
  smooth: t => t * t * (3 - 2 * t),\r
  sharp: t => t * t * t\r
};\r
\r
const VERTEX = \`#version 300 es\r
void main() {\r
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\r
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
\r
uniform vec2 uResolution;\r
uniform vec2 uOffset;\r
uniform float uCellSize;\r
uniform sampler2D uState;\r
uniform ivec2 uCells;\r
uniform vec3 uColor;\r
uniform vec3 uGridColor;\r
uniform float uLineWidth;\r
uniform float uMaxOpacity;\r
uniform float uFillOpacity;\r
uniform float uGridOpacity;\r
uniform float uCellRadius;\r
uniform float uCellGap;\r
uniform int uGridStyle;\r
uniform vec2 uMouse;\r
uniform float uRadius;\r
uniform float uSpotlight;\r
uniform float uPresence;\r
uniform float uEdgeFade;\r
uniform float uReveal;\r
\r
out vec4 outColor;\r
\r
float level(vec2 cell) {\r
  if (cell.x < 0.0 || cell.y < 0.0 || cell.x >= float(uCells.x) || cell.y >= float(uCells.y)) return 0.0;\r
  float v = texelFetch(uState, ivec2(cell), 0).r;\r
  return v * v * (3.0 - 2.0 * v);\r
}\r
\r
float line(float d, float width) {\r
  float w = max(width, 1.0);\r
  return clamp(w * 0.5 + 0.5 - d, 0.0, 1.0) * (width / w);\r
}\r
\r
float roundBox(vec2 p, vec2 b, float r) {\r
  vec2 q = abs(p) - b + r;\r
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;\r
}\r
\r
void main() {\r
  vec2 pos = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);\r
  vec2 g = (pos - uOffset) / uCellSize;\r
  vec2 cell = floor(g);\r
  vec2 f = g - cell;\r
  vec2 edge = min(f, 1.0 - f) * uCellSize;\r
\r
  float vx = line(edge.x, uLineWidth);\r
  float vy = line(edge.y, uLineWidth);\r
  if (uGridStyle == 1) {\r
    float dash = uCellSize / 6.0;\r
    vx *= step(0.5, fract((pos.y - uOffset.y) / dash + 0.25));\r
    vy *= step(0.5, fract((pos.x - uOffset.x) / dash + 0.25));\r
  } else if (uGridStyle == 2) {\r
    float r = max(uLineWidth * 1.25, 1.2);\r
    float d = length(edge);\r
    vx = clamp(r + 0.5 - d, 0.0, 1.0);\r
    vy = 0.0;\r
  } else if (uGridStyle == 3) {\r
    float arm = uCellSize * 0.1 + uLineWidth;\r
    vx *= step(edge.y, arm);\r
    vy *= step(edge.x, arm);\r
  }\r
  float mark = max(vx, vy);\r
\r
  vec2 toMouse = pos - uMouse;\r
  float spot = exp(-dot(toMouse, toMouse) / max(uRadius * uRadius, 1.0) * 1.6) * uSpotlight * uPresence;\r
\r
  vec2 center = uResolution * 0.5;\r
  float reach = length(center);\r
  float shown = smoothstep(uReveal * (reach + uCellSize * 2.0), uReveal * (reach + uCellSize * 2.0) - uCellSize * 2.0, length(pos - center));\r
  shown = uReveal >= 1.0 ? 1.0 : shown;\r
\r
  float fade = 1.0;\r
  if (uEdgeFade > 0.0) {\r
    vec2 norm = pos / uResolution;\r
    vec2 a = clamp(norm / uEdgeFade, 0.0, 1.0);\r
    vec2 b = clamp((1.0 - norm) / uEdgeFade, 0.0, 1.0);\r
    vec2 sa = a * a * a * (a * (a * 6.0 - 15.0) + 10.0);\r
    vec2 sb = b * b * b * (b * (b * 6.0 - 15.0) + 10.0);\r
    fade = sa.x * sa.y * sb.x * sb.y;\r
  }\r
\r
  float own = level(cell);\r
  float gridAlpha = mark * min(uGridOpacity + spot * 0.45, 1.0) * fade * shown;\r
  float litAlpha = 0.0;\r
  float fillAlpha = 0.0;\r
\r
  if (uCellGap <= 0.0 && uCellRadius <= 0.0) {\r
    vec2 side = step(0.5, f) * 2.0 - 1.0;\r
    float nx = level(cell + vec2(side.x, 0.0));\r
    float ny = level(cell + vec2(0.0, side.y));\r
    float nc = level(cell + side);\r
    float ex = max(own, nx);\r
    float ey = max(own, ny);\r
    float joint = max(max(ex, ey), nc);\r
    float lit;\r
    if (uGridStyle == 2) lit = vx * joint;\r
    else if (uGridStyle == 3) lit = max(vx * (edge.y < uLineWidth ? joint : ex), vy * (edge.x < uLineWidth ? joint : ey));\r
    else lit = max(vx * (edge.y < uLineWidth ? joint : ex), vy * (edge.x < uLineWidth ? joint : ey));\r
    litAlpha = lit * uMaxOpacity;\r
    fillAlpha = own * uFillOpacity;\r
  } else if (own > 0.0) {\r
    vec2 local = (f - 0.5) * uCellSize;\r
    float halfSize = uCellSize * 0.5 - max(uCellGap, 0.0);\r
    float radius = min(uCellRadius, halfSize);\r
    float sd = roundBox(local, vec2(halfSize), radius);\r
    float inside = clamp(0.5 - sd, 0.0, 1.0);\r
    float border = line(abs(sd + uLineWidth * 0.5), uLineWidth) * inside;\r
    litAlpha = border * own * uMaxOpacity;\r
    fillAlpha = inside * own * uFillOpacity;\r
  }\r
  litAlpha *= fade;\r
  fillAlpha *= fade;\r
\r
  float cellAlpha = clamp(max(litAlpha, fillAlpha), 0.0, 1.0);\r
  float alpha = cellAlpha + gridAlpha * (1.0 - cellAlpha);\r
  vec3 premul = uColor * cellAlpha + uGridColor * gridAlpha * (1.0 - cellAlpha);\r
  outColor = vec4(premul, alpha);\r
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
const colorCache = new Map<string, number[]>();\r
\r
const parseHex = (hex: string): number[] => {\r
  let h = String(hex || '#ffffff')\r
    .replace('#', '')\r
    .trim();\r
  if (h.length === 3 || h.length === 4)\r
    h = h\r
      .slice(0, 3)\r
      .split('')\r
      .map(c => c + c)\r
      .join('');\r
  const num = parseInt(h.slice(0, 6), 16);\r
  if (Number.isNaN(num)) return [1, 1, 1];\r
  return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];\r
};\r
\r
const hexToRgb = (hex: string): number[] => {\r
  const key = String(hex);\r
  const cached = colorCache.get(key);\r
  if (cached) return cached;\r
  const rgb = parseHex(hex);\r
  if (colorCache.size > 64) colorCache.clear();\r
  colorCache.set(key, rgb);\r
  return rgb;\r
};\r
\r
const CursorGrid = ({\r
  cellSize = 60,\r
  color,\r
  gridColor,\r
  radius = 140,\r
  falloff = 'smooth',\r
  highlight = 'area',\r
  holdTime = 400,\r
  fadeDuration = 800,\r
  lineWidth = 1,\r
  maxOpacity = 1,\r
  fillOpacity = 0.06,\r
  gridOpacity = 0.08,\r
  gridStyle = 'lines',\r
  cellRadius = 0,\r
  cellGap = 0,\r
  spotlight = 0.6,\r
  clickPulse = true,\r
  pulseSpeed = 600,\r
  ambient = 0,\r
  edgeFade = 0.2,\r
  intro = true,\r
  lightMode = false,\r
  dpr,\r
  children,\r
  className = '',\r
  style\r
}: CursorGridProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const ink = lightMode ? '#18181b' : '#ffffff';\r
  const settings: Settings = {\r
    cellSize: Math.max(8, cellSize),\r
    color: color || ink,\r
    gridColor: gridColor || ink,\r
    radius: Math.max(1, radius),\r
    falloff,\r
    highlight,\r
    holdTime: Math.max(0, holdTime),\r
    fadeDuration: Math.max(16, fadeDuration),\r
    lineWidth: Math.max(0.25, lineWidth),\r
    maxOpacity: clamp(maxOpacity, 0, 1),\r
    fillOpacity: clamp(fillOpacity, 0, 1),\r
    gridOpacity: clamp(gridOpacity, 0, 1),\r
    gridStyle: STYLES[gridStyle] ?? 0,\r
    cellRadius: Math.max(0, cellRadius),\r
    cellGap: Math.max(0, cellGap),\r
    spotlight: clamp(spotlight, 0, 1),\r
    clickPulse,\r
    pulseSpeed: Math.max(1, pulseSpeed),\r
    ambient: clamp(ambient, 0, 1),\r
    edgeFade: clamp(edgeFade, 0, 0.5),\r
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
    const shader = link(gl);\r
    if (!shader) return undefined;\r
    const u = shader.uniforms;\r
    const vao = gl.createVertexArray();\r
    const stateTexture = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, stateTexture);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1, ratio: 1, cellSize: 0 };\r
    const grid = { cols: 0, rows: 0, offX: 0, offY: 0 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const mouse = { x: 0, y: 0 };\r
    const pulses: Pulse[] = [];\r
    let levels = new Float32Array(0);\r
    let waves = new Float32Array(0);\r
    let targets = new Float32Array(0);\r
    let touched = new Float32Array(0);\r
    let pixels = new Uint8Array(0);\r
    let presence = 0;\r
    let clock = 0;\r
    let introClock = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let dirty = true;\r
\r
    const rebuild = () => {\r
      const s = settingsRef.current;\r
      view.width = Math.max(1, container.clientWidth);\r
      view.height = Math.max(1, container.clientHeight);\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(view.width * view.ratio));\r
      canvas.height = Math.max(1, Math.round(view.height * view.ratio));\r
      const size = s.cellSize;\r
      const cols = Math.ceil(view.width / size) + 1;\r
      const rows = Math.ceil(view.height / size) + 1;\r
      const resized = cols !== grid.cols || rows !== grid.rows || size !== view.cellSize;\r
      grid.cols = cols;\r
      grid.rows = rows;\r
      grid.offX = (view.width - cols * size) / 2;\r
      grid.offY = (view.height - rows * size) / 2;\r
      view.cellSize = size;\r
      if (resized) {\r
        levels = new Float32Array(cols * rows);\r
        waves = new Float32Array(cols * rows);\r
        targets = new Float32Array(cols * rows);\r
        touched = new Float32Array(cols * rows).fill(-1e9);\r
        pixels = new Uint8Array(cols * rows);\r
        gl.bindTexture(gl.TEXTURE_2D, stateTexture);\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, cols, rows, 0, gl.RED, gl.UNSIGNED_BYTE, pixels);\r
      }\r
      dirty = true;\r
    };\r
\r
    const light = (index: number, value: number) => {\r
      if (value > targets[index]) targets[index] = value;\r
      touched[index] = clock;\r
    };\r
\r
    const energize = (x: number, y: number) => {\r
      const s = settingsRef.current;\r
      const size = s.cellSize;\r
      if (s.highlight === 'cell') {\r
        const col = Math.floor((x - grid.offX) / size);\r
        const row = Math.floor((y - grid.offY) / size);\r
        if (col >= 0 && row >= 0 && col < grid.cols && row < grid.rows) light(row * grid.cols + col, 1);\r
        return;\r
      }\r
      const r = s.radius;\r
      const ease = FALLOFF_CURVES[s.falloff] ?? FALLOFF_CURVES.linear;\r
      const minCol = Math.max(0, Math.floor((x - r - grid.offX) / size));\r
      const maxCol = Math.min(grid.cols - 1, Math.floor((x + r - grid.offX) / size));\r
      const minRow = Math.max(0, Math.floor((y - r - grid.offY) / size));\r
      const maxRow = Math.min(grid.rows - 1, Math.floor((y + r - grid.offY) / size));\r
      for (let row = minRow; row <= maxRow; row++) {\r
        for (let col = minCol; col <= maxCol; col++) {\r
          const cx = grid.offX + col * size + size / 2;\r
          const cy = grid.offY + row * size + size / 2;\r
          const dist = Math.hypot(cx - x, cy - y);\r
          if (dist > r) continue;\r
          const value = ease(1 - dist / r);\r
          if (value > 0) light(row * grid.cols + col, value);\r
        }\r
      }\r
    };\r
\r
    const sweepPulses = (s: Settings) => {\r
      const size = s.cellSize;\r
      const ahead = size * 0.6;\r
      const behind = size * 1.4;\r
      const far = Math.hypot(view.width, view.height);\r
      waves.fill(0);\r
      for (let k = pulses.length - 1; k >= 0; k--) {\r
        const pulse = pulses[k];\r
        const ringR = (clock - pulse.t0) * s.pulseSpeed;\r
        if (ringR - behind * 2 > far) {\r
          pulses.splice(k, 1);\r
          continue;\r
        }\r
        if (ringR < 0) continue;\r
        const envelope = pulse.strength * Math.pow(Math.max(0, 1 - ringR / (far + behind)), 0.6);\r
        const outer = ringR + ahead * 2;\r
        const minCol = Math.max(0, Math.floor((pulse.x - outer - grid.offX) / size));\r
        const maxCol = Math.min(grid.cols - 1, Math.floor((pulse.x + outer - grid.offX) / size));\r
        const minRow = Math.max(0, Math.floor((pulse.y - outer - grid.offY) / size));\r
        const maxRow = Math.min(grid.rows - 1, Math.floor((pulse.y + outer - grid.offY) / size));\r
        for (let row = minRow; row <= maxRow; row++) {\r
          for (let col = minCol; col <= maxCol; col++) {\r
            const cx = grid.offX + col * size + size / 2;\r
            const cy = grid.offY + row * size + size / 2;\r
            const off = Math.hypot(cx - pulse.x, cy - pulse.y) - ringR;\r
            if (off > ahead * 2 || off < -behind * 2) continue;\r
            const t = off > 0 ? off / ahead : off / behind;\r
            const value = envelope * Math.exp(-t * t);\r
            const index = row * grid.cols + col;\r
            if (value > waves[index]) waves[index] = value;\r
          }\r
        }\r
      }\r
      dirty = true;\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      const ratio = view.ratio;\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.useProgram(shader.program);\r
      gl.bindVertexArray(vao);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, stateTexture);\r
      if (dirty) {\r
        for (let i = 0; i < levels.length; i++)\r
          pixels[i] = Math.round(clamp(Math.max(levels[i], waves[i]), 0, 1) * 255);\r
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, grid.cols, grid.rows, gl.RED, gl.UNSIGNED_BYTE, pixels);\r
        dirty = false;\r
      }\r
      const lineDevice = s.lineWidth * ratio;\r
      const snap = Math.round(lineDevice) % 2 === 1 ? 0.5 : 0;\r
      gl.uniform1i(u.uState, 0);\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform2f(u.uOffset, Math.round(grid.offX * ratio) + snap, Math.round(grid.offY * ratio) + snap);\r
      gl.uniform1f(u.uCellSize, s.cellSize * ratio);\r
      gl.uniform2i(u.uCells, grid.cols, grid.rows);\r
      gl.uniform3fv(u.uColor, hexToRgb(s.color));\r
      gl.uniform3fv(u.uGridColor, hexToRgb(s.gridColor));\r
      gl.uniform1f(u.uLineWidth, lineDevice);\r
      gl.uniform1f(u.uMaxOpacity, s.maxOpacity);\r
      gl.uniform1f(u.uFillOpacity, s.fillOpacity);\r
      gl.uniform1f(u.uGridOpacity, s.gridOpacity);\r
      gl.uniform1f(u.uCellRadius, s.cellRadius * ratio);\r
      gl.uniform1f(u.uCellGap, s.cellGap * ratio);\r
      gl.uniform1i(u.uGridStyle, s.gridStyle);\r
      gl.uniform2f(u.uMouse, mouse.x * ratio, mouse.y * ratio);\r
      gl.uniform1f(u.uRadius, s.radius * ratio);\r
      gl.uniform1f(u.uSpotlight, s.spotlight);\r
      gl.uniform1f(u.uPresence, presence);\r
      gl.uniform1f(u.uEdgeFade, s.edgeFade);\r
      gl.uniform1f(u.uReveal, introClock >= 1 ? 1 : 1 - Math.pow(1 - introClock, 2.2));\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0, 1 / 20) : 1 / 60;\r
      last = now;\r
      clock += dt;\r
      if (introClock < 1) introClock = Math.min(1, introClock + dt / INTRO_SECONDS);\r
\r
      const follow = 1 - Math.exp(-dt / 0.07);\r
      mouse.x += (pointer.x - mouse.x) * follow;\r
      mouse.y += (pointer.y - mouse.y) * follow;\r
      const presenceGoal = pointer.inside ? 1 : 0;\r
      presence += (presenceGoal - presence) * (1 - Math.exp(-dt / 0.25));\r
\r
      if (s.ambient > 0 && !reduce && levels.length) {\r
        const chance = s.ambient * dt * levels.length * 0.04;\r
        let spawns = Math.floor(chance) + (Math.random() < chance % 1 ? 1 : 0);\r
        while (spawns-- > 0) light(Math.floor(Math.random() * levels.length), 0.25 + Math.random() * 0.45);\r
      }\r
      if (pulses.length) sweepPulses(s);\r
      else if (waves.length && waves.some(value => value > 0)) {\r
        waves.fill(0);\r
        dirty = true;\r
      }\r
\r
      const holdSeconds = s.holdTime / 1000;\r
      const fadeStep = dt / (s.fadeDuration / 1000);\r
      const attack = 1 - Math.exp(-dt / 0.045);\r
      let active = pulses.length > 0 || introClock < 1 || Math.abs(presence - presenceGoal) > 0.002;\r
      for (let i = 0; i < levels.length; i++) {\r
        let target = targets[i];\r
        if (target <= 0 && levels[i] <= 0) continue;\r
        if (clock - touched[i] > holdSeconds) target = Math.max(0, target - fadeStep);\r
        targets[i] = target;\r
        const before = levels[i];\r
        const next = target > before ? before + (target - before) * attack : target;\r
        levels[i] = next < 0.002 ? 0 : next;\r
        if (levels[i] !== before) dirty = true;\r
        if (levels[i] > 0 || targets[i] > 0) active = true;\r
      }\r
      if (Math.abs(mouse.x - pointer.x) + Math.abs(mouse.y - pointer.y) > 0.05 && presence > 0.002) active = true;\r
      if (s.ambient > 0 && !reduce) active = true;\r
\r
      draw();\r
      if (active) raf = requestAnimationFrame(frame);\r
    };\r
\r
    function wake() {\r
      if (!raf && visible && !document.hidden) {\r
        last = 0;\r
        raf = requestAnimationFrame(frame);\r
      }\r
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
      const was = pointer.inside;\r
      pointer.inside = inside;\r
      if (!inside) {\r
        if (was) wake();\r
        return;\r
      }\r
      pointer.x = x;\r
      pointer.y = y;\r
      if (!was) {\r
        mouse.x = x;\r
        mouse.y = y;\r
      }\r
      energize(x, y);\r
      wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      const { x, y, inside } = locate(event);\r
      if (!inside || !s.clickPulse || reduce) return;\r
      pulses.push({ x, y, t0: clock, strength: 1 });\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
    const onVisibility = () => wake();\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      rebuild();\r
      draw();\r
      wake();\r
    });\r
    resizeObserver.observe(container);\r
    const intersection = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible) wake();\r
    });\r
    intersection.observe(container);\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    rebuild();\r
    if (introClock < 1) pulses.push({ x: view.width / 2, y: view.height / 2, t0: 0.15, strength: 0.6 });\r
    draw();\r
    wake();\r
    wakeRef.current = () => {\r
      const s = settingsRef.current;\r
      if (s.cellSize !== view.cellSize) rebuild();\r
      dirty = true;\r
      draw();\r
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
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteTexture(stateTexture);\r
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
    <div ref={containerRef} className={\`cursor-grid\${className ? \` \${className}\` : ''}\`} style={style}>\r
      <canvas ref={canvasRef} className="cursor-grid__canvas" aria-hidden="true" />\r
      {children ? <div className="cursor-grid__content">{children}</div> : null}\r
    </div>\r
  );\r
};\r
\r
export default CursorGrid;\r
`,i=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';\r
\r
export type CursorGridFalloff = 'linear' | 'smooth' | 'sharp';\r
export type CursorGridHighlight = 'area' | 'cell';\r
export type CursorGridStyle = 'lines' | 'dashed' | 'dots' | 'crosses';\r
\r
export interface CursorGridProps {\r
  cellSize?: number;\r
  color?: string;\r
  gridColor?: string;\r
  radius?: number;\r
  falloff?: CursorGridFalloff;\r
  highlight?: CursorGridHighlight;\r
  holdTime?: number;\r
  fadeDuration?: number;\r
  lineWidth?: number;\r
  maxOpacity?: number;\r
  fillOpacity?: number;\r
  gridOpacity?: number;\r
  gridStyle?: CursorGridStyle;\r
  cellRadius?: number;\r
  cellGap?: number;\r
  spotlight?: number;\r
  clickPulse?: boolean;\r
  pulseSpeed?: number;\r
  ambient?: number;\r
  edgeFade?: number;\r
  intro?: boolean;\r
  lightMode?: boolean;\r
  dpr?: number;\r
  children?: ReactNode;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
type Settings = {\r
  cellSize: number;\r
  color: string;\r
  gridColor: string;\r
  radius: number;\r
  falloff: CursorGridFalloff;\r
  highlight: CursorGridHighlight;\r
  holdTime: number;\r
  fadeDuration: number;\r
  lineWidth: number;\r
  maxOpacity: number;\r
  fillOpacity: number;\r
  gridOpacity: number;\r
  gridStyle: number;\r
  cellRadius: number;\r
  cellGap: number;\r
  spotlight: number;\r
  clickPulse: boolean;\r
  pulseSpeed: number;\r
  ambient: number;\r
  edgeFade: number;\r
  intro: boolean;\r
  dpr?: number;\r
};\r
\r
type Pulse = { x: number; y: number; t0: number; strength: number };\r
\r
type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };\r
\r
const INTRO_SECONDS = 1.4;\r
const STYLES: Record<string, number> = { lines: 0, dashed: 1, dots: 2, crosses: 3 };\r
\r
const FALLOFF_CURVES: Record<string, (t: number) => number> = {\r
  linear: t => t,\r
  smooth: t => t * t * (3 - 2 * t),\r
  sharp: t => t * t * t\r
};\r
\r
const VERTEX = \`#version 300 es\r
void main() {\r
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\r
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
\r
uniform vec2 uResolution;\r
uniform vec2 uOffset;\r
uniform float uCellSize;\r
uniform sampler2D uState;\r
uniform ivec2 uCells;\r
uniform vec3 uColor;\r
uniform vec3 uGridColor;\r
uniform float uLineWidth;\r
uniform float uMaxOpacity;\r
uniform float uFillOpacity;\r
uniform float uGridOpacity;\r
uniform float uCellRadius;\r
uniform float uCellGap;\r
uniform int uGridStyle;\r
uniform vec2 uMouse;\r
uniform float uRadius;\r
uniform float uSpotlight;\r
uniform float uPresence;\r
uniform float uEdgeFade;\r
uniform float uReveal;\r
\r
out vec4 outColor;\r
\r
float level(vec2 cell) {\r
  if (cell.x < 0.0 || cell.y < 0.0 || cell.x >= float(uCells.x) || cell.y >= float(uCells.y)) return 0.0;\r
  float v = texelFetch(uState, ivec2(cell), 0).r;\r
  return v * v * (3.0 - 2.0 * v);\r
}\r
\r
float line(float d, float width) {\r
  float w = max(width, 1.0);\r
  return clamp(w * 0.5 + 0.5 - d, 0.0, 1.0) * (width / w);\r
}\r
\r
float roundBox(vec2 p, vec2 b, float r) {\r
  vec2 q = abs(p) - b + r;\r
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;\r
}\r
\r
void main() {\r
  vec2 pos = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);\r
  vec2 g = (pos - uOffset) / uCellSize;\r
  vec2 cell = floor(g);\r
  vec2 f = g - cell;\r
  vec2 edge = min(f, 1.0 - f) * uCellSize;\r
\r
  float vx = line(edge.x, uLineWidth);\r
  float vy = line(edge.y, uLineWidth);\r
  if (uGridStyle == 1) {\r
    float dash = uCellSize / 6.0;\r
    vx *= step(0.5, fract((pos.y - uOffset.y) / dash + 0.25));\r
    vy *= step(0.5, fract((pos.x - uOffset.x) / dash + 0.25));\r
  } else if (uGridStyle == 2) {\r
    float r = max(uLineWidth * 1.25, 1.2);\r
    float d = length(edge);\r
    vx = clamp(r + 0.5 - d, 0.0, 1.0);\r
    vy = 0.0;\r
  } else if (uGridStyle == 3) {\r
    float arm = uCellSize * 0.1 + uLineWidth;\r
    vx *= step(edge.y, arm);\r
    vy *= step(edge.x, arm);\r
  }\r
  float mark = max(vx, vy);\r
\r
  vec2 toMouse = pos - uMouse;\r
  float spot = exp(-dot(toMouse, toMouse) / max(uRadius * uRadius, 1.0) * 1.6) * uSpotlight * uPresence;\r
\r
  vec2 center = uResolution * 0.5;\r
  float reach = length(center);\r
  float shown = smoothstep(uReveal * (reach + uCellSize * 2.0), uReveal * (reach + uCellSize * 2.0) - uCellSize * 2.0, length(pos - center));\r
  shown = uReveal >= 1.0 ? 1.0 : shown;\r
\r
  float fade = 1.0;\r
  if (uEdgeFade > 0.0) {\r
    vec2 norm = pos / uResolution;\r
    vec2 a = clamp(norm / uEdgeFade, 0.0, 1.0);\r
    vec2 b = clamp((1.0 - norm) / uEdgeFade, 0.0, 1.0);\r
    vec2 sa = a * a * a * (a * (a * 6.0 - 15.0) + 10.0);\r
    vec2 sb = b * b * b * (b * (b * 6.0 - 15.0) + 10.0);\r
    fade = sa.x * sa.y * sb.x * sb.y;\r
  }\r
\r
  float own = level(cell);\r
  float gridAlpha = mark * min(uGridOpacity + spot * 0.45, 1.0) * fade * shown;\r
  float litAlpha = 0.0;\r
  float fillAlpha = 0.0;\r
\r
  if (uCellGap <= 0.0 && uCellRadius <= 0.0) {\r
    vec2 side = step(0.5, f) * 2.0 - 1.0;\r
    float nx = level(cell + vec2(side.x, 0.0));\r
    float ny = level(cell + vec2(0.0, side.y));\r
    float nc = level(cell + side);\r
    float ex = max(own, nx);\r
    float ey = max(own, ny);\r
    float joint = max(max(ex, ey), nc);\r
    float lit;\r
    if (uGridStyle == 2) lit = vx * joint;\r
    else if (uGridStyle == 3) lit = max(vx * (edge.y < uLineWidth ? joint : ex), vy * (edge.x < uLineWidth ? joint : ey));\r
    else lit = max(vx * (edge.y < uLineWidth ? joint : ex), vy * (edge.x < uLineWidth ? joint : ey));\r
    litAlpha = lit * uMaxOpacity;\r
    fillAlpha = own * uFillOpacity;\r
  } else if (own > 0.0) {\r
    vec2 local = (f - 0.5) * uCellSize;\r
    float halfSize = uCellSize * 0.5 - max(uCellGap, 0.0);\r
    float radius = min(uCellRadius, halfSize);\r
    float sd = roundBox(local, vec2(halfSize), radius);\r
    float inside = clamp(0.5 - sd, 0.0, 1.0);\r
    float border = line(abs(sd + uLineWidth * 0.5), uLineWidth) * inside;\r
    litAlpha = border * own * uMaxOpacity;\r
    fillAlpha = inside * own * uFillOpacity;\r
  }\r
  litAlpha *= fade;\r
  fillAlpha *= fade;\r
\r
  float cellAlpha = clamp(max(litAlpha, fillAlpha), 0.0, 1.0);\r
  float alpha = cellAlpha + gridAlpha * (1.0 - cellAlpha);\r
  vec3 premul = uColor * cellAlpha + uGridColor * gridAlpha * (1.0 - cellAlpha);\r
  outColor = vec4(premul, alpha);\r
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
const colorCache = new Map<string, number[]>();\r
\r
const parseHex = (hex: string): number[] => {\r
  let h = String(hex || '#ffffff')\r
    .replace('#', '')\r
    .trim();\r
  if (h.length === 3 || h.length === 4)\r
    h = h\r
      .slice(0, 3)\r
      .split('')\r
      .map(c => c + c)\r
      .join('');\r
  const num = parseInt(h.slice(0, 6), 16);\r
  if (Number.isNaN(num)) return [1, 1, 1];\r
  return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];\r
};\r
\r
const hexToRgb = (hex: string): number[] => {\r
  const key = String(hex);\r
  const cached = colorCache.get(key);\r
  if (cached) return cached;\r
  const rgb = parseHex(hex);\r
  if (colorCache.size > 64) colorCache.clear();\r
  colorCache.set(key, rgb);\r
  return rgb;\r
};\r
\r
const CursorGrid = ({\r
  cellSize = 60,\r
  color,\r
  gridColor,\r
  radius = 140,\r
  falloff = 'smooth',\r
  highlight = 'area',\r
  holdTime = 400,\r
  fadeDuration = 800,\r
  lineWidth = 1,\r
  maxOpacity = 1,\r
  fillOpacity = 0.06,\r
  gridOpacity = 0.08,\r
  gridStyle = 'lines',\r
  cellRadius = 0,\r
  cellGap = 0,\r
  spotlight = 0.6,\r
  clickPulse = true,\r
  pulseSpeed = 600,\r
  ambient = 0,\r
  edgeFade = 0.2,\r
  intro = true,\r
  lightMode = false,\r
  dpr,\r
  children,\r
  className = '',\r
  style\r
}: CursorGridProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const ink = lightMode ? '#18181b' : '#ffffff';\r
  const settings: Settings = {\r
    cellSize: Math.max(8, cellSize),\r
    color: color || ink,\r
    gridColor: gridColor || ink,\r
    radius: Math.max(1, radius),\r
    falloff,\r
    highlight,\r
    holdTime: Math.max(0, holdTime),\r
    fadeDuration: Math.max(16, fadeDuration),\r
    lineWidth: Math.max(0.25, lineWidth),\r
    maxOpacity: clamp(maxOpacity, 0, 1),\r
    fillOpacity: clamp(fillOpacity, 0, 1),\r
    gridOpacity: clamp(gridOpacity, 0, 1),\r
    gridStyle: STYLES[gridStyle] ?? 0,\r
    cellRadius: Math.max(0, cellRadius),\r
    cellGap: Math.max(0, cellGap),\r
    spotlight: clamp(spotlight, 0, 1),\r
    clickPulse,\r
    pulseSpeed: Math.max(1, pulseSpeed),\r
    ambient: clamp(ambient, 0, 1),\r
    edgeFade: clamp(edgeFade, 0, 0.5),\r
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
    const shader = link(gl);\r
    if (!shader) return undefined;\r
    const u = shader.uniforms;\r
    const vao = gl.createVertexArray();\r
    const stateTexture = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, stateTexture);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1, ratio: 1, cellSize: 0 };\r
    const grid = { cols: 0, rows: 0, offX: 0, offY: 0 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const mouse = { x: 0, y: 0 };\r
    const pulses: Pulse[] = [];\r
    let levels = new Float32Array(0);\r
    let waves = new Float32Array(0);\r
    let targets = new Float32Array(0);\r
    let touched = new Float32Array(0);\r
    let pixels = new Uint8Array(0);\r
    let presence = 0;\r
    let clock = 0;\r
    let introClock = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let dirty = true;\r
\r
    const rebuild = () => {\r
      const s = settingsRef.current;\r
      view.width = Math.max(1, container.clientWidth);\r
      view.height = Math.max(1, container.clientHeight);\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(view.width * view.ratio));\r
      canvas.height = Math.max(1, Math.round(view.height * view.ratio));\r
      const size = s.cellSize;\r
      const cols = Math.ceil(view.width / size) + 1;\r
      const rows = Math.ceil(view.height / size) + 1;\r
      const resized = cols !== grid.cols || rows !== grid.rows || size !== view.cellSize;\r
      grid.cols = cols;\r
      grid.rows = rows;\r
      grid.offX = (view.width - cols * size) / 2;\r
      grid.offY = (view.height - rows * size) / 2;\r
      view.cellSize = size;\r
      if (resized) {\r
        levels = new Float32Array(cols * rows);\r
        waves = new Float32Array(cols * rows);\r
        targets = new Float32Array(cols * rows);\r
        touched = new Float32Array(cols * rows).fill(-1e9);\r
        pixels = new Uint8Array(cols * rows);\r
        gl.bindTexture(gl.TEXTURE_2D, stateTexture);\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, cols, rows, 0, gl.RED, gl.UNSIGNED_BYTE, pixels);\r
      }\r
      dirty = true;\r
    };\r
\r
    const light = (index: number, value: number) => {\r
      if (value > targets[index]) targets[index] = value;\r
      touched[index] = clock;\r
    };\r
\r
    const energize = (x: number, y: number) => {\r
      const s = settingsRef.current;\r
      const size = s.cellSize;\r
      if (s.highlight === 'cell') {\r
        const col = Math.floor((x - grid.offX) / size);\r
        const row = Math.floor((y - grid.offY) / size);\r
        if (col >= 0 && row >= 0 && col < grid.cols && row < grid.rows) light(row * grid.cols + col, 1);\r
        return;\r
      }\r
      const r = s.radius;\r
      const ease = FALLOFF_CURVES[s.falloff] ?? FALLOFF_CURVES.linear;\r
      const minCol = Math.max(0, Math.floor((x - r - grid.offX) / size));\r
      const maxCol = Math.min(grid.cols - 1, Math.floor((x + r - grid.offX) / size));\r
      const minRow = Math.max(0, Math.floor((y - r - grid.offY) / size));\r
      const maxRow = Math.min(grid.rows - 1, Math.floor((y + r - grid.offY) / size));\r
      for (let row = minRow; row <= maxRow; row++) {\r
        for (let col = minCol; col <= maxCol; col++) {\r
          const cx = grid.offX + col * size + size / 2;\r
          const cy = grid.offY + row * size + size / 2;\r
          const dist = Math.hypot(cx - x, cy - y);\r
          if (dist > r) continue;\r
          const value = ease(1 - dist / r);\r
          if (value > 0) light(row * grid.cols + col, value);\r
        }\r
      }\r
    };\r
\r
    const sweepPulses = (s: Settings) => {\r
      const size = s.cellSize;\r
      const ahead = size * 0.6;\r
      const behind = size * 1.4;\r
      const far = Math.hypot(view.width, view.height);\r
      waves.fill(0);\r
      for (let k = pulses.length - 1; k >= 0; k--) {\r
        const pulse = pulses[k];\r
        const ringR = (clock - pulse.t0) * s.pulseSpeed;\r
        if (ringR - behind * 2 > far) {\r
          pulses.splice(k, 1);\r
          continue;\r
        }\r
        if (ringR < 0) continue;\r
        const envelope = pulse.strength * Math.pow(Math.max(0, 1 - ringR / (far + behind)), 0.6);\r
        const outer = ringR + ahead * 2;\r
        const minCol = Math.max(0, Math.floor((pulse.x - outer - grid.offX) / size));\r
        const maxCol = Math.min(grid.cols - 1, Math.floor((pulse.x + outer - grid.offX) / size));\r
        const minRow = Math.max(0, Math.floor((pulse.y - outer - grid.offY) / size));\r
        const maxRow = Math.min(grid.rows - 1, Math.floor((pulse.y + outer - grid.offY) / size));\r
        for (let row = minRow; row <= maxRow; row++) {\r
          for (let col = minCol; col <= maxCol; col++) {\r
            const cx = grid.offX + col * size + size / 2;\r
            const cy = grid.offY + row * size + size / 2;\r
            const off = Math.hypot(cx - pulse.x, cy - pulse.y) - ringR;\r
            if (off > ahead * 2 || off < -behind * 2) continue;\r
            const t = off > 0 ? off / ahead : off / behind;\r
            const value = envelope * Math.exp(-t * t);\r
            const index = row * grid.cols + col;\r
            if (value > waves[index]) waves[index] = value;\r
          }\r
        }\r
      }\r
      dirty = true;\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      const ratio = view.ratio;\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.useProgram(shader.program);\r
      gl.bindVertexArray(vao);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, stateTexture);\r
      if (dirty) {\r
        for (let i = 0; i < levels.length; i++)\r
          pixels[i] = Math.round(clamp(Math.max(levels[i], waves[i]), 0, 1) * 255);\r
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, grid.cols, grid.rows, gl.RED, gl.UNSIGNED_BYTE, pixels);\r
        dirty = false;\r
      }\r
      const lineDevice = s.lineWidth * ratio;\r
      const snap = Math.round(lineDevice) % 2 === 1 ? 0.5 : 0;\r
      gl.uniform1i(u.uState, 0);\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform2f(u.uOffset, Math.round(grid.offX * ratio) + snap, Math.round(grid.offY * ratio) + snap);\r
      gl.uniform1f(u.uCellSize, s.cellSize * ratio);\r
      gl.uniform2i(u.uCells, grid.cols, grid.rows);\r
      gl.uniform3fv(u.uColor, hexToRgb(s.color));\r
      gl.uniform3fv(u.uGridColor, hexToRgb(s.gridColor));\r
      gl.uniform1f(u.uLineWidth, lineDevice);\r
      gl.uniform1f(u.uMaxOpacity, s.maxOpacity);\r
      gl.uniform1f(u.uFillOpacity, s.fillOpacity);\r
      gl.uniform1f(u.uGridOpacity, s.gridOpacity);\r
      gl.uniform1f(u.uCellRadius, s.cellRadius * ratio);\r
      gl.uniform1f(u.uCellGap, s.cellGap * ratio);\r
      gl.uniform1i(u.uGridStyle, s.gridStyle);\r
      gl.uniform2f(u.uMouse, mouse.x * ratio, mouse.y * ratio);\r
      gl.uniform1f(u.uRadius, s.radius * ratio);\r
      gl.uniform1f(u.uSpotlight, s.spotlight);\r
      gl.uniform1f(u.uPresence, presence);\r
      gl.uniform1f(u.uEdgeFade, s.edgeFade);\r
      gl.uniform1f(u.uReveal, introClock >= 1 ? 1 : 1 - Math.pow(1 - introClock, 2.2));\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0, 1 / 20) : 1 / 60;\r
      last = now;\r
      clock += dt;\r
      if (introClock < 1) introClock = Math.min(1, introClock + dt / INTRO_SECONDS);\r
\r
      const follow = 1 - Math.exp(-dt / 0.07);\r
      mouse.x += (pointer.x - mouse.x) * follow;\r
      mouse.y += (pointer.y - mouse.y) * follow;\r
      const presenceGoal = pointer.inside ? 1 : 0;\r
      presence += (presenceGoal - presence) * (1 - Math.exp(-dt / 0.25));\r
\r
      if (s.ambient > 0 && !reduce && levels.length) {\r
        const chance = s.ambient * dt * levels.length * 0.04;\r
        let spawns = Math.floor(chance) + (Math.random() < chance % 1 ? 1 : 0);\r
        while (spawns-- > 0) light(Math.floor(Math.random() * levels.length), 0.25 + Math.random() * 0.45);\r
      }\r
      if (pulses.length) sweepPulses(s);\r
      else if (waves.length && waves.some(value => value > 0)) {\r
        waves.fill(0);\r
        dirty = true;\r
      }\r
\r
      const holdSeconds = s.holdTime / 1000;\r
      const fadeStep = dt / (s.fadeDuration / 1000);\r
      const attack = 1 - Math.exp(-dt / 0.045);\r
      let active = pulses.length > 0 || introClock < 1 || Math.abs(presence - presenceGoal) > 0.002;\r
      for (let i = 0; i < levels.length; i++) {\r
        let target = targets[i];\r
        if (target <= 0 && levels[i] <= 0) continue;\r
        if (clock - touched[i] > holdSeconds) target = Math.max(0, target - fadeStep);\r
        targets[i] = target;\r
        const before = levels[i];\r
        const next = target > before ? before + (target - before) * attack : target;\r
        levels[i] = next < 0.002 ? 0 : next;\r
        if (levels[i] !== before) dirty = true;\r
        if (levels[i] > 0 || targets[i] > 0) active = true;\r
      }\r
      if (Math.abs(mouse.x - pointer.x) + Math.abs(mouse.y - pointer.y) > 0.05 && presence > 0.002) active = true;\r
      if (s.ambient > 0 && !reduce) active = true;\r
\r
      draw();\r
      if (active) raf = requestAnimationFrame(frame);\r
    };\r
\r
    function wake() {\r
      if (!raf && visible && !document.hidden) {\r
        last = 0;\r
        raf = requestAnimationFrame(frame);\r
      }\r
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
      const was = pointer.inside;\r
      pointer.inside = inside;\r
      if (!inside) {\r
        if (was) wake();\r
        return;\r
      }\r
      pointer.x = x;\r
      pointer.y = y;\r
      if (!was) {\r
        mouse.x = x;\r
        mouse.y = y;\r
      }\r
      energize(x, y);\r
      wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      const { x, y, inside } = locate(event);\r
      if (!inside || !s.clickPulse || reduce) return;\r
      pulses.push({ x, y, t0: clock, strength: 1 });\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
    const onVisibility = () => wake();\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      rebuild();\r
      draw();\r
      wake();\r
    });\r
    resizeObserver.observe(container);\r
    const intersection = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible) wake();\r
    });\r
    intersection.observe(container);\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    rebuild();\r
    if (introClock < 1) pulses.push({ x: view.width / 2, y: view.height / 2, t0: 0.15, strength: 0.6 });\r
    draw();\r
    wake();\r
    wakeRef.current = () => {\r
      const s = settingsRef.current;\r
      if (s.cellSize !== view.cellSize) rebuild();\r
      dirty = true;\r
      draw();\r
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
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteTexture(stateTexture);\r
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
    >\r
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 block h-full w-full" aria-hidden="true" />\r
      {children ? <div className="relative h-full w-full">{children}</div> : null}\r
    </div>\r
  );\r
};\r
\r
export default CursorGrid;\r
`,l={usage:`import CursorGrid from './CursorGrid';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <CursorGrid
    cellSize={60}
    color="#ffffff"
    highlight="area"
    gridStyle="lines"
    radius={140}
    holdTime={400}
    fadeDuration={800}
    fillOpacity={0.06}
    gridOpacity={0.08}
    spotlight={0.6}
    clickPulse
  >
    {/* Your content here */}
  </CursorGrid>
</div>`,code:r,css:e,tailwind:n,tsCode:t,tsTailwind:i};export{l as cursorGrid};
