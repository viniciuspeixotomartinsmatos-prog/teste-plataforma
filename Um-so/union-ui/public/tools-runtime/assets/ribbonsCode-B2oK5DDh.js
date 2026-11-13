const n=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
import './Ribbons.css';\r
\r
const POINTS = 50;\r
const DETAIL = 4;\r
const SAMPLES = (POINTS - 1) * DETAIL + 1;\r
const STRIDE = 6;\r
const STEP = 1 / 120;\r
const SHAPES = { lens: 0, comet: 1, even: 2 };\r
const DEFAULT_COLORS = ['#3847ff', '#7c84ff', '#c7cbff'];\r
\r
const VERTEX = \`#version 300 es\r
in vec2 a_position;\r
in vec4 a_shape;\r
uniform vec2 u_resolution;\r
out vec4 v_shape;\r
void main() {\r
  v_shape = a_shape;\r
  vec2 clip = a_position / u_resolution * 2.0 - 1.0;\r
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);\r
}\r
\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform vec3 u_color;\r
uniform float u_opacity;\r
uniform float u_fade;\r
uniform float u_softness;\r
in vec4 v_shape;\r
out vec4 outColor;\r
\r
void main() {\r
  float halfWidth = v_shape.y;\r
  float dist = abs(v_shape.x) * v_shape.z;\r
  float edge = max(halfWidth, 0.5);\r
  float soft = u_softness * edge;\r
  float alpha = 1.0 - smoothstep(edge - soft - 0.6, edge + 0.6, dist);\r
  alpha *= clamp(halfWidth / 0.5, 0.0, 1.0);\r
  alpha *= mix(1.0, 1.0 - smoothstep(0.0, 1.0, v_shape.w), u_fade);\r
  alpha *= u_opacity;\r
  if (alpha <= 0.002) discard;\r
  outColor = vec4(u_color * alpha, alpha);\r
}\r
\`;\r
\r
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);\r
\r
const smoothstep = (edge0, edge1, value) => {\r
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);\r
  return t * t * (3 - 2 * t);\r
};\r
\r
const hash = value => {\r
  const s = Math.sin(value * 127.1 + 311.7) * 43758.5453;\r
  return s - Math.floor(s);\r
};\r
\r
const parseColor = (() => {\r
  let context = null;\r
  return (value, fallback) => {\r
    if (typeof document === 'undefined') return fallback;\r
    if (!context) {\r
      const canvas = document.createElement('canvas');\r
      canvas.width = 1;\r
      canvas.height = 1;\r
      context = canvas.getContext('2d', { willReadFrequently: true });\r
    }\r
    if (!context) return fallback;\r
    context.clearRect(0, 0, 1, 1);\r
    context.fillStyle = '#000';\r
    context.fillStyle = value;\r
    context.fillRect(0, 0, 1, 1);\r
    const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;\r
    return [r / 255, g / 255, b / 255, a / 255];\r
  };\r
})();\r
\r
const profile = (shape, u) => {\r
  if (shape === 1) return (1 - u) ** 1.2 * Math.sqrt(smoothstep(0, 0.1, u));\r
  if (shape === 2) return Math.sqrt(smoothstep(0, 0.06, u) * smoothstep(0, 0.06, 1 - u));\r
  const d = (u - 0.5) * 2;\r
  return 1 - 0.9 * d * d;\r
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
const createRibbon = (index, x, y) => {\r
  const points = new Float32Array(POINTS * 2);\r
  for (let i = 0; i < POINTS; i++) {\r
    points[i * 2] = x;\r
    points[i * 2 + 1] = y;\r
  }\r
  return {\r
    x,\r
    y,\r
    vx: 0,\r
    vy: 0,\r
    points,\r
    pull: 0.35 + 1.3 * hash(index + 3),\r
    drag: 0.9 + 0.2 * hash(index + 5),\r
    width: 0.95 + 0.1 * hash(index + 7),\r
    lift: hash(index + 13) - 0.5,\r
    nudge: hash(index + 17) - 0.5,\r
    phase: hash(index + 19) * Math.PI * 2\r
  };\r
};\r
\r
export default function Ribbons({\r
  colors = DEFAULT_COLORS,\r
  thickness = 30,\r
  length = 1.4,\r
  spread = 18,\r
  stiffness = 0.5,\r
  bounce = 0.5,\r
  shape = 'lens',\r
  wave = 0,\r
  softness = 0,\r
  fade = false,\r
  opacity = 1,\r
  backgroundColor = 'transparent',\r
  dpr,\r
  className = '',\r
  style\r
}) {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const engineRef = useRef(null);\r
  const settingsRef = useRef(null);\r
\r
  const palette = (colors?.length ? colors : DEFAULT_COLORS).slice(0, 12);\r
\r
  settingsRef.current = {\r
    colors: palette.map(color => parseColor(color, [1, 1, 1, 1])),\r
    back: parseColor(backgroundColor, [0, 0, 0, 0]),\r
    thickness: Math.max(1, thickness),\r
    length: clamp(length, 0.1, 5),\r
    spread: Math.max(0, spread),\r
    stiffness: clamp(stiffness, 0, 1),\r
    bounce: clamp(bounce, 0, 1),\r
    shape: SHAPES[shape] ?? 0,\r
    wave: clamp(wave, 0, 1),\r
    softness: clamp(softness, 0, 1),\r
    fade,\r
    opacity: clamp(opacity, 0, 1),\r
    dpr\r
  };\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    if (!container || !canvas) return undefined;\r
    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });\r
    if (!gl) return undefined;\r
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
    const program = gl.createProgram();\r
    if (!vertex || !fragment || !program) return undefined;\r
    gl.attachShader(program, vertex);\r
    gl.attachShader(program, fragment);\r
    gl.linkProgram(program);\r
    gl.deleteShader(vertex);\r
    gl.deleteShader(fragment);\r
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return undefined;\r
    gl.useProgram(program);\r
\r
    const uniforms = {};\r
    const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
    for (let i = 0; i < uniformCount; i++) {\r
      const info = gl.getActiveUniform(program, i);\r
      if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
    }\r
\r
    const vao = gl.createVertexArray();\r
    const buffer = gl.createBuffer();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    const position = gl.getAttribLocation(program, 'a_position');\r
    const shapeAttribute = gl.getAttribLocation(program, 'a_shape');\r
    gl.enableVertexAttribArray(position);\r
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, STRIDE * 4, 0);\r
    gl.enableVertexAttribArray(shapeAttribute);\r
    gl.vertexAttribPointer(shapeAttribute, 4, gl.FLOAT, false, STRIDE * 4, 8);\r
    gl.enable(gl.BLEND);\r
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
\r
    const pointX = new Float32Array(POINTS);\r
    const pointY = new Float32Array(POINTS);\r
    const spacing = new Float32Array(POINTS);\r
    const sampleX = new Float32Array(SAMPLES);\r
    const sampleY = new Float32Array(SAMPLES);\r
    const sampleSpacing = new Float32Array(SAMPLES);\r
    let vertices = new Float32Array(0);\r
\r
    const state = {\r
      alive: true,\r
      raf: 0,\r
      last: 0,\r
      time: 0,\r
      visible: true,\r
      width: 1,\r
      height: 1,\r
      ribbons: [],\r
      mouseX: 0,\r
      mouseY: 0,\r
      placed: false,\r
      accumulator: 0\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const ratio = s.dpr ?? Math.min(window.devicePixelRatio || 1, 2);\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      state.width = width;\r
      state.height = height;\r
      if (!state.placed) {\r
        state.mouseX = width / 2;\r
        state.mouseY = height / 2;\r
      }\r
      const pixelWidth = Math.max(1, Math.round(width * ratio));\r
      const pixelHeight = Math.max(1, Math.round(height * ratio));\r
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {\r
        canvas.width = pixelWidth;\r
        canvas.height = pixelHeight;\r
      }\r
    };\r
\r
    const syncRibbons = () => {\r
      const count = settingsRef.current.colors.length;\r
      while (state.ribbons.length < count) {\r
        const anchor = state.ribbons[state.ribbons.length - 1];\r
        state.ribbons.push(createRibbon(state.ribbons.length, anchor?.x ?? state.mouseX, anchor?.y ?? state.mouseY));\r
      }\r
      state.ribbons.length = count;\r
    };\r
\r
    const simulate = dt => {\r
      const s = settingsRef.current;\r
      const spring = 0.03 * 4 ** (2 * s.stiffness - 1);\r
      const zeta = clamp(0.3 ** (2 * s.bounce), 0.05, 1);\r
      const follow = 1 - 0.183 ** ((1 / s.length) * dt * 60);\r
      const count = state.ribbons.length;\r
      const center = (count - 1) / 2;\r
      for (let i = 0; i < count; i++) {\r
        const ribbon = state.ribbons[i];\r
        const omega = 60 * Math.sqrt(spring * ribbon.pull);\r
        const damping = 2 * zeta * 60 * Math.sqrt(spring) * ribbon.drag;\r
        const tx = state.mouseX + (i - center + ribbon.nudge * 0.2) * s.spread;\r
        const ty = state.mouseY + ribbon.lift * s.spread;\r
        ribbon.vx += (omega * omega * (tx - ribbon.x) - damping * ribbon.vx) * dt;\r
        ribbon.vy += (omega * omega * (ty - ribbon.y) - damping * ribbon.vy) * dt;\r
        ribbon.x += ribbon.vx * dt;\r
        ribbon.y += ribbon.vy * dt;\r
        const { points } = ribbon;\r
        points[0] = ribbon.x;\r
        points[1] = ribbon.y;\r
        for (let j = 1; j < POINTS; j++) {\r
          const p = j * 2;\r
          points[p] += (points[p - 2] - points[p]) * follow;\r
          points[p + 1] += (points[p - 1] - points[p + 1]) * follow;\r
        }\r
      }\r
    };\r
\r
    const build = (ribbon, out, offset) => {\r
      const s = settingsRef.current;\r
      const { points } = ribbon;\r
      let total = 0;\r
      for (let j = 0; j < POINTS; j++) {\r
        pointX[j] = points[j * 2];\r
        pointY[j] = points[j * 2 + 1];\r
        if (j > 0) total += Math.hypot(pointX[j] - pointX[j - 1], pointY[j] - pointY[j - 1]);\r
      }\r
      if (total < 0.5) return 0;\r
      for (let j = 0; j < POINTS; j++) {\r
        const prev = Math.max(j - 1, 0);\r
        const next = Math.min(j + 1, POINTS - 1);\r
        spacing[j] = Math.hypot(pointX[next] - pointX[prev], pointY[next] - pointY[prev]);\r
      }\r
      if (s.wave > 0) {\r
        const amplitude = s.wave * Math.min(s.thickness * 0.8, total * 0.07);\r
        let nx = 0;\r
        let ny = 0;\r
        for (let j = 0; j < POINTS; j++) {\r
          const prev = Math.max(j - 1, 0);\r
          const next = Math.min(j + 1, POINTS - 1);\r
          const dx = pointX[next] - pointX[prev];\r
          const dy = pointY[next] - pointY[prev];\r
          const len = Math.hypot(dx, dy);\r
          if (len > 1e-3) {\r
            nx = -dy / len;\r
            ny = dx / len;\r
          }\r
          const u = j / (POINTS - 1);\r
          const swing = Math.sin(u * Math.PI * 3 - state.time * 3.2 + ribbon.phase) * Math.sin(Math.PI * u) * amplitude;\r
          pointX[j] += nx * swing;\r
          pointY[j] += ny * swing;\r
        }\r
      }\r
\r
      let k = 0;\r
      for (let j = 0; j < POINTS - 1; j++) {\r
        const a = Math.max(j - 1, 0);\r
        const b = j;\r
        const c = j + 1;\r
        const d = Math.min(j + 2, POINTS - 1);\r
        for (let step = 0; step < DETAIL; step++) {\r
          const t = step / DETAIL;\r
          const t2 = t * t;\r
          const t3 = t2 * t;\r
          sampleX[k] =\r
            0.5 *\r
            (2 * pointX[b] +\r
              (pointX[c] - pointX[a]) * t +\r
              (2 * pointX[a] - 5 * pointX[b] + 4 * pointX[c] - pointX[d]) * t2 +\r
              (3 * pointX[b] - pointX[a] - 3 * pointX[c] + pointX[d]) * t3);\r
          sampleY[k] =\r
            0.5 *\r
            (2 * pointY[b] +\r
              (pointY[c] - pointY[a]) * t +\r
              (2 * pointY[a] - 5 * pointY[b] + 4 * pointY[c] - pointY[d]) * t2 +\r
              (3 * pointY[b] - pointY[a] - 3 * pointY[c] + pointY[d]) * t3);\r
          sampleSpacing[k] = spacing[j] + (spacing[j + 1] - spacing[j]) * t;\r
          k++;\r
        }\r
      }\r
      sampleX[k] = pointX[POINTS - 1];\r
      sampleY[k] = pointY[POINTS - 1];\r
      sampleSpacing[k] = spacing[POINTS - 1];\r
\r
      const half = s.thickness * 0.5 * ribbon.width * smoothstep(0, s.thickness * 1.5, total);\r
      let normalX = 0;\r
      let normalY = 1;\r
      let cursor = offset;\r
      for (let i = SAMPLES - 1; i >= 0; i--) {\r
        const prev = Math.max(i - 1, 0);\r
        const next = Math.min(i + 1, SAMPLES - 1);\r
        const dx = sampleX[next] - sampleX[prev];\r
        const dy = sampleY[next] - sampleY[prev];\r
        const len = Math.hypot(dx, dy);\r
        if (len > 1e-4) {\r
          normalX = -dy / len;\r
          normalY = dx / len;\r
        }\r
        const u = i / (SAMPLES - 1);\r
        const width = half * profile(s.shape, u) * smoothstep(0, 1.5, sampleSpacing[i]);\r
        const reach = width + 1.5;\r
        for (let side = -1; side <= 1; side += 2) {\r
          out[cursor++] = sampleX[i] + normalX * reach * side;\r
          out[cursor++] = sampleY[i] + normalY * reach * side;\r
          out[cursor++] = side;\r
          out[cursor++] = width;\r
          out[cursor++] = reach;\r
          out[cursor++] = u;\r
        }\r
      }\r
      return SAMPLES * 2;\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      resize();\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      const [r, g, b, a] = s.back;\r
      gl.clearColor(r * a, g * a, b * a, a);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      syncRibbons();\r
      const count = state.ribbons.length;\r
      const needed = count * SAMPLES * 2 * STRIDE;\r
      if (vertices.length < needed) vertices = new Float32Array(needed);\r
      const ranges = [];\r
      for (let i = 0; i < count; i++) {\r
        const offset = i * SAMPLES * 2 * STRIDE;\r
        ranges.push([offset / STRIDE, build(state.ribbons[i], vertices, offset)]);\r
      }\r
      gl.bindVertexArray(vao);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, vertices.subarray(0, needed), gl.DYNAMIC_DRAW);\r
      gl.uniform2f(uniforms.u_resolution, state.width, state.height);\r
      gl.uniform1f(uniforms.u_opacity, s.opacity);\r
      gl.uniform1f(uniforms.u_fade, s.fade ? 1 : 0);\r
      gl.uniform1f(uniforms.u_softness, s.softness);\r
      for (let i = 0; i < count; i++) {\r
        const [first, size] = ranges[i];\r
        if (!size) continue;\r
        gl.uniform3fv(uniforms.u_color, s.colors[i].slice(0, 3));\r
        gl.drawArrays(gl.TRIANGLE_STRIP, first, size);\r
      }\r
    };\r
\r
    const frame = now => {\r
      state.raf = 0;\r
      if (!state.alive) return;\r
      const dt = state.last ? Math.min(0.05, (now - state.last) / 1000) : 1 / 60;\r
      state.last = now;\r
      state.time += dt;\r
      syncRibbons();\r
      state.accumulator += dt;\r
      while (state.accumulator >= STEP) {\r
        simulate(STEP);\r
        state.accumulator -= STEP;\r
      }\r
      draw();\r
      if (state.visible) state.raf = requestAnimationFrame(frame);\r
      else state.last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!state.raf && state.alive && state.visible) state.raf = requestAnimationFrame(frame);\r
    };\r
\r
    const onMove = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;\r
      state.mouseX = x;\r
      state.mouseY = y;\r
      state.placed = true;\r
      wake();\r
    };\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      resize();\r
      draw();\r
    });\r
    resizeObserver.observe(container);\r
\r
    const visibility = new IntersectionObserver(entries => {\r
      state.visible = entries.some(entry => entry.isIntersecting);\r
      if (state.visible) wake();\r
    });\r
    visibility.observe(container);\r
\r
    const onLost = event => {\r
      event.preventDefault();\r
      state.alive = false;\r
      cancelAnimationFrame(state.raf);\r
    };\r
\r
    canvas.addEventListener('webglcontextlost', onLost);\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    window.addEventListener('pointerdown', onMove, { passive: true });\r
\r
    engineRef.current = {\r
      redraw: () => {\r
        draw();\r
        wake();\r
      }\r
    };\r
\r
    resize();\r
    syncRibbons();\r
    wake();\r
\r
    return () => {\r
      state.alive = false;\r
      cancelAnimationFrame(state.raf);\r
      resizeObserver.disconnect();\r
      visibility.disconnect();\r
      canvas.removeEventListener('webglcontextlost', onLost);\r
      window.removeEventListener('pointermove', onMove);\r
      window.removeEventListener('pointerdown', onMove);\r
      engineRef.current = null;\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(program);\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    engineRef.current?.redraw();\r
  });\r
\r
  return (\r
    <div ref={containerRef} className={\`ribbons \${className}\`.trim()} style={style}>\r
      <canvas ref={canvasRef} className="ribbons-canvas" />\r
    </div>\r
  );\r
}\r
`,r=`.ribbons {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  pointer-events: none;\r
}\r
\r
.ribbons-canvas {\r
  display: block;\r
  width: 100%;\r
  height: 100%;\r
}\r
`,e=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
const POINTS = 50;\r
const DETAIL = 4;\r
const SAMPLES = (POINTS - 1) * DETAIL + 1;\r
const STRIDE = 6;\r
const STEP = 1 / 120;\r
const SHAPES = { lens: 0, comet: 1, even: 2 };\r
const DEFAULT_COLORS = ['#3847ff', '#7c84ff', '#c7cbff'];\r
\r
const VERTEX = \`#version 300 es\r
in vec2 a_position;\r
in vec4 a_shape;\r
uniform vec2 u_resolution;\r
out vec4 v_shape;\r
void main() {\r
  v_shape = a_shape;\r
  vec2 clip = a_position / u_resolution * 2.0 - 1.0;\r
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);\r
}\r
\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform vec3 u_color;\r
uniform float u_opacity;\r
uniform float u_fade;\r
uniform float u_softness;\r
in vec4 v_shape;\r
out vec4 outColor;\r
\r
void main() {\r
  float halfWidth = v_shape.y;\r
  float dist = abs(v_shape.x) * v_shape.z;\r
  float edge = max(halfWidth, 0.5);\r
  float soft = u_softness * edge;\r
  float alpha = 1.0 - smoothstep(edge - soft - 0.6, edge + 0.6, dist);\r
  alpha *= clamp(halfWidth / 0.5, 0.0, 1.0);\r
  alpha *= mix(1.0, 1.0 - smoothstep(0.0, 1.0, v_shape.w), u_fade);\r
  alpha *= u_opacity;\r
  if (alpha <= 0.002) discard;\r
  outColor = vec4(u_color * alpha, alpha);\r
}\r
\`;\r
\r
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);\r
\r
const smoothstep = (edge0, edge1, value) => {\r
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);\r
  return t * t * (3 - 2 * t);\r
};\r
\r
const hash = value => {\r
  const s = Math.sin(value * 127.1 + 311.7) * 43758.5453;\r
  return s - Math.floor(s);\r
};\r
\r
const parseColor = (() => {\r
  let context = null;\r
  return (value, fallback) => {\r
    if (typeof document === 'undefined') return fallback;\r
    if (!context) {\r
      const canvas = document.createElement('canvas');\r
      canvas.width = 1;\r
      canvas.height = 1;\r
      context = canvas.getContext('2d', { willReadFrequently: true });\r
    }\r
    if (!context) return fallback;\r
    context.clearRect(0, 0, 1, 1);\r
    context.fillStyle = '#000';\r
    context.fillStyle = value;\r
    context.fillRect(0, 0, 1, 1);\r
    const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;\r
    return [r / 255, g / 255, b / 255, a / 255];\r
  };\r
})();\r
\r
const profile = (shape, u) => {\r
  if (shape === 1) return (1 - u) ** 1.2 * Math.sqrt(smoothstep(0, 0.1, u));\r
  if (shape === 2) return Math.sqrt(smoothstep(0, 0.06, u) * smoothstep(0, 0.06, 1 - u));\r
  const d = (u - 0.5) * 2;\r
  return 1 - 0.9 * d * d;\r
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
const createRibbon = (index, x, y) => {\r
  const points = new Float32Array(POINTS * 2);\r
  for (let i = 0; i < POINTS; i++) {\r
    points[i * 2] = x;\r
    points[i * 2 + 1] = y;\r
  }\r
  return {\r
    x,\r
    y,\r
    vx: 0,\r
    vy: 0,\r
    points,\r
    pull: 0.35 + 1.3 * hash(index + 3),\r
    drag: 0.9 + 0.2 * hash(index + 5),\r
    width: 0.95 + 0.1 * hash(index + 7),\r
    lift: hash(index + 13) - 0.5,\r
    nudge: hash(index + 17) - 0.5,\r
    phase: hash(index + 19) * Math.PI * 2\r
  };\r
};\r
\r
export default function Ribbons({\r
  colors = DEFAULT_COLORS,\r
  thickness = 30,\r
  length = 1.4,\r
  spread = 18,\r
  stiffness = 0.5,\r
  bounce = 0.5,\r
  shape = 'lens',\r
  wave = 0,\r
  softness = 0,\r
  fade = false,\r
  opacity = 1,\r
  backgroundColor = 'transparent',\r
  dpr,\r
  className = '',\r
  style\r
}) {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const engineRef = useRef(null);\r
  const settingsRef = useRef(null);\r
\r
  const palette = (colors?.length ? colors : DEFAULT_COLORS).slice(0, 12);\r
\r
  settingsRef.current = {\r
    colors: palette.map(color => parseColor(color, [1, 1, 1, 1])),\r
    back: parseColor(backgroundColor, [0, 0, 0, 0]),\r
    thickness: Math.max(1, thickness),\r
    length: clamp(length, 0.1, 5),\r
    spread: Math.max(0, spread),\r
    stiffness: clamp(stiffness, 0, 1),\r
    bounce: clamp(bounce, 0, 1),\r
    shape: SHAPES[shape] ?? 0,\r
    wave: clamp(wave, 0, 1),\r
    softness: clamp(softness, 0, 1),\r
    fade,\r
    opacity: clamp(opacity, 0, 1),\r
    dpr\r
  };\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    if (!container || !canvas) return undefined;\r
    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });\r
    if (!gl) return undefined;\r
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
    const program = gl.createProgram();\r
    if (!vertex || !fragment || !program) return undefined;\r
    gl.attachShader(program, vertex);\r
    gl.attachShader(program, fragment);\r
    gl.linkProgram(program);\r
    gl.deleteShader(vertex);\r
    gl.deleteShader(fragment);\r
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return undefined;\r
    gl.useProgram(program);\r
\r
    const uniforms = {};\r
    const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
    for (let i = 0; i < uniformCount; i++) {\r
      const info = gl.getActiveUniform(program, i);\r
      if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
    }\r
\r
    const vao = gl.createVertexArray();\r
    const buffer = gl.createBuffer();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    const position = gl.getAttribLocation(program, 'a_position');\r
    const shapeAttribute = gl.getAttribLocation(program, 'a_shape');\r
    gl.enableVertexAttribArray(position);\r
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, STRIDE * 4, 0);\r
    gl.enableVertexAttribArray(shapeAttribute);\r
    gl.vertexAttribPointer(shapeAttribute, 4, gl.FLOAT, false, STRIDE * 4, 8);\r
    gl.enable(gl.BLEND);\r
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
\r
    const pointX = new Float32Array(POINTS);\r
    const pointY = new Float32Array(POINTS);\r
    const spacing = new Float32Array(POINTS);\r
    const sampleX = new Float32Array(SAMPLES);\r
    const sampleY = new Float32Array(SAMPLES);\r
    const sampleSpacing = new Float32Array(SAMPLES);\r
    let vertices = new Float32Array(0);\r
\r
    const state = {\r
      alive: true,\r
      raf: 0,\r
      last: 0,\r
      time: 0,\r
      visible: true,\r
      width: 1,\r
      height: 1,\r
      ribbons: [],\r
      mouseX: 0,\r
      mouseY: 0,\r
      placed: false,\r
      accumulator: 0\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const ratio = s.dpr ?? Math.min(window.devicePixelRatio || 1, 2);\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      state.width = width;\r
      state.height = height;\r
      if (!state.placed) {\r
        state.mouseX = width / 2;\r
        state.mouseY = height / 2;\r
      }\r
      const pixelWidth = Math.max(1, Math.round(width * ratio));\r
      const pixelHeight = Math.max(1, Math.round(height * ratio));\r
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {\r
        canvas.width = pixelWidth;\r
        canvas.height = pixelHeight;\r
      }\r
    };\r
\r
    const syncRibbons = () => {\r
      const count = settingsRef.current.colors.length;\r
      while (state.ribbons.length < count) {\r
        const anchor = state.ribbons[state.ribbons.length - 1];\r
        state.ribbons.push(createRibbon(state.ribbons.length, anchor?.x ?? state.mouseX, anchor?.y ?? state.mouseY));\r
      }\r
      state.ribbons.length = count;\r
    };\r
\r
    const simulate = dt => {\r
      const s = settingsRef.current;\r
      const spring = 0.03 * 4 ** (2 * s.stiffness - 1);\r
      const zeta = clamp(0.3 ** (2 * s.bounce), 0.05, 1);\r
      const follow = 1 - 0.183 ** ((1 / s.length) * dt * 60);\r
      const count = state.ribbons.length;\r
      const center = (count - 1) / 2;\r
      for (let i = 0; i < count; i++) {\r
        const ribbon = state.ribbons[i];\r
        const omega = 60 * Math.sqrt(spring * ribbon.pull);\r
        const damping = 2 * zeta * 60 * Math.sqrt(spring) * ribbon.drag;\r
        const tx = state.mouseX + (i - center + ribbon.nudge * 0.2) * s.spread;\r
        const ty = state.mouseY + ribbon.lift * s.spread;\r
        ribbon.vx += (omega * omega * (tx - ribbon.x) - damping * ribbon.vx) * dt;\r
        ribbon.vy += (omega * omega * (ty - ribbon.y) - damping * ribbon.vy) * dt;\r
        ribbon.x += ribbon.vx * dt;\r
        ribbon.y += ribbon.vy * dt;\r
        const { points } = ribbon;\r
        points[0] = ribbon.x;\r
        points[1] = ribbon.y;\r
        for (let j = 1; j < POINTS; j++) {\r
          const p = j * 2;\r
          points[p] += (points[p - 2] - points[p]) * follow;\r
          points[p + 1] += (points[p - 1] - points[p + 1]) * follow;\r
        }\r
      }\r
    };\r
\r
    const build = (ribbon, out, offset) => {\r
      const s = settingsRef.current;\r
      const { points } = ribbon;\r
      let total = 0;\r
      for (let j = 0; j < POINTS; j++) {\r
        pointX[j] = points[j * 2];\r
        pointY[j] = points[j * 2 + 1];\r
        if (j > 0) total += Math.hypot(pointX[j] - pointX[j - 1], pointY[j] - pointY[j - 1]);\r
      }\r
      if (total < 0.5) return 0;\r
      for (let j = 0; j < POINTS; j++) {\r
        const prev = Math.max(j - 1, 0);\r
        const next = Math.min(j + 1, POINTS - 1);\r
        spacing[j] = Math.hypot(pointX[next] - pointX[prev], pointY[next] - pointY[prev]);\r
      }\r
      if (s.wave > 0) {\r
        const amplitude = s.wave * Math.min(s.thickness * 0.8, total * 0.07);\r
        let nx = 0;\r
        let ny = 0;\r
        for (let j = 0; j < POINTS; j++) {\r
          const prev = Math.max(j - 1, 0);\r
          const next = Math.min(j + 1, POINTS - 1);\r
          const dx = pointX[next] - pointX[prev];\r
          const dy = pointY[next] - pointY[prev];\r
          const len = Math.hypot(dx, dy);\r
          if (len > 1e-3) {\r
            nx = -dy / len;\r
            ny = dx / len;\r
          }\r
          const u = j / (POINTS - 1);\r
          const swing = Math.sin(u * Math.PI * 3 - state.time * 3.2 + ribbon.phase) * Math.sin(Math.PI * u) * amplitude;\r
          pointX[j] += nx * swing;\r
          pointY[j] += ny * swing;\r
        }\r
      }\r
\r
      let k = 0;\r
      for (let j = 0; j < POINTS - 1; j++) {\r
        const a = Math.max(j - 1, 0);\r
        const b = j;\r
        const c = j + 1;\r
        const d = Math.min(j + 2, POINTS - 1);\r
        for (let step = 0; step < DETAIL; step++) {\r
          const t = step / DETAIL;\r
          const t2 = t * t;\r
          const t3 = t2 * t;\r
          sampleX[k] =\r
            0.5 *\r
            (2 * pointX[b] +\r
              (pointX[c] - pointX[a]) * t +\r
              (2 * pointX[a] - 5 * pointX[b] + 4 * pointX[c] - pointX[d]) * t2 +\r
              (3 * pointX[b] - pointX[a] - 3 * pointX[c] + pointX[d]) * t3);\r
          sampleY[k] =\r
            0.5 *\r
            (2 * pointY[b] +\r
              (pointY[c] - pointY[a]) * t +\r
              (2 * pointY[a] - 5 * pointY[b] + 4 * pointY[c] - pointY[d]) * t2 +\r
              (3 * pointY[b] - pointY[a] - 3 * pointY[c] + pointY[d]) * t3);\r
          sampleSpacing[k] = spacing[j] + (spacing[j + 1] - spacing[j]) * t;\r
          k++;\r
        }\r
      }\r
      sampleX[k] = pointX[POINTS - 1];\r
      sampleY[k] = pointY[POINTS - 1];\r
      sampleSpacing[k] = spacing[POINTS - 1];\r
\r
      const half = s.thickness * 0.5 * ribbon.width * smoothstep(0, s.thickness * 1.5, total);\r
      let normalX = 0;\r
      let normalY = 1;\r
      let cursor = offset;\r
      for (let i = SAMPLES - 1; i >= 0; i--) {\r
        const prev = Math.max(i - 1, 0);\r
        const next = Math.min(i + 1, SAMPLES - 1);\r
        const dx = sampleX[next] - sampleX[prev];\r
        const dy = sampleY[next] - sampleY[prev];\r
        const len = Math.hypot(dx, dy);\r
        if (len > 1e-4) {\r
          normalX = -dy / len;\r
          normalY = dx / len;\r
        }\r
        const u = i / (SAMPLES - 1);\r
        const width = half * profile(s.shape, u) * smoothstep(0, 1.5, sampleSpacing[i]);\r
        const reach = width + 1.5;\r
        for (let side = -1; side <= 1; side += 2) {\r
          out[cursor++] = sampleX[i] + normalX * reach * side;\r
          out[cursor++] = sampleY[i] + normalY * reach * side;\r
          out[cursor++] = side;\r
          out[cursor++] = width;\r
          out[cursor++] = reach;\r
          out[cursor++] = u;\r
        }\r
      }\r
      return SAMPLES * 2;\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      resize();\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      const [r, g, b, a] = s.back;\r
      gl.clearColor(r * a, g * a, b * a, a);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      syncRibbons();\r
      const count = state.ribbons.length;\r
      const needed = count * SAMPLES * 2 * STRIDE;\r
      if (vertices.length < needed) vertices = new Float32Array(needed);\r
      const ranges = [];\r
      for (let i = 0; i < count; i++) {\r
        const offset = i * SAMPLES * 2 * STRIDE;\r
        ranges.push([offset / STRIDE, build(state.ribbons[i], vertices, offset)]);\r
      }\r
      gl.bindVertexArray(vao);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, vertices.subarray(0, needed), gl.DYNAMIC_DRAW);\r
      gl.uniform2f(uniforms.u_resolution, state.width, state.height);\r
      gl.uniform1f(uniforms.u_opacity, s.opacity);\r
      gl.uniform1f(uniforms.u_fade, s.fade ? 1 : 0);\r
      gl.uniform1f(uniforms.u_softness, s.softness);\r
      for (let i = 0; i < count; i++) {\r
        const [first, size] = ranges[i];\r
        if (!size) continue;\r
        gl.uniform3fv(uniforms.u_color, s.colors[i].slice(0, 3));\r
        gl.drawArrays(gl.TRIANGLE_STRIP, first, size);\r
      }\r
    };\r
\r
    const frame = now => {\r
      state.raf = 0;\r
      if (!state.alive) return;\r
      const dt = state.last ? Math.min(0.05, (now - state.last) / 1000) : 1 / 60;\r
      state.last = now;\r
      state.time += dt;\r
      syncRibbons();\r
      state.accumulator += dt;\r
      while (state.accumulator >= STEP) {\r
        simulate(STEP);\r
        state.accumulator -= STEP;\r
      }\r
      draw();\r
      if (state.visible) state.raf = requestAnimationFrame(frame);\r
      else state.last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!state.raf && state.alive && state.visible) state.raf = requestAnimationFrame(frame);\r
    };\r
\r
    const onMove = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;\r
      state.mouseX = x;\r
      state.mouseY = y;\r
      state.placed = true;\r
      wake();\r
    };\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      resize();\r
      draw();\r
    });\r
    resizeObserver.observe(container);\r
\r
    const visibility = new IntersectionObserver(entries => {\r
      state.visible = entries.some(entry => entry.isIntersecting);\r
      if (state.visible) wake();\r
    });\r
    visibility.observe(container);\r
\r
    const onLost = event => {\r
      event.preventDefault();\r
      state.alive = false;\r
      cancelAnimationFrame(state.raf);\r
    };\r
\r
    canvas.addEventListener('webglcontextlost', onLost);\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    window.addEventListener('pointerdown', onMove, { passive: true });\r
\r
    engineRef.current = {\r
      redraw: () => {\r
        draw();\r
        wake();\r
      }\r
    };\r
\r
    resize();\r
    syncRibbons();\r
    wake();\r
\r
    return () => {\r
      state.alive = false;\r
      cancelAnimationFrame(state.raf);\r
      resizeObserver.disconnect();\r
      visibility.disconnect();\r
      canvas.removeEventListener('webglcontextlost', onLost);\r
      window.removeEventListener('pointermove', onMove);\r
      window.removeEventListener('pointerdown', onMove);\r
      engineRef.current = null;\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(program);\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    engineRef.current?.redraw();\r
  });\r
\r
  return (\r
    <div ref={containerRef} className={\`pointer-events-none relative h-full w-full \${className}\`.trim()} style={style}>\r
      <canvas ref={canvasRef} className="block h-full w-full" />\r
    </div>\r
  );\r
}\r
`,t=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties } from 'react';\r
\r
import './Ribbons.css';\r
\r
export interface RibbonsProps {\r
  colors?: string[];\r
  thickness?: number;\r
  length?: number;\r
  spread?: number;\r
  stiffness?: number;\r
  bounce?: number;\r
  shape?: 'lens' | 'comet' | 'even';\r
  wave?: number;\r
  softness?: number;\r
  fade?: boolean;\r
  opacity?: number;\r
  backgroundColor?: string;\r
  dpr?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
type Rgba = number[];\r
\r
interface Settings {\r
  colors: Rgba[];\r
  back: Rgba;\r
  thickness: number;\r
  length: number;\r
  spread: number;\r
  stiffness: number;\r
  bounce: number;\r
  shape: number;\r
  wave: number;\r
  softness: number;\r
  fade: boolean;\r
  opacity: number;\r
  dpr?: number;\r
}\r
\r
interface Ribbon {\r
  x: number;\r
  y: number;\r
  vx: number;\r
  vy: number;\r
  points: Float32Array;\r
  pull: number;\r
  drag: number;\r
  width: number;\r
  lift: number;\r
  nudge: number;\r
  phase: number;\r
}\r
\r
interface Engine {\r
  redraw: () => void;\r
}\r
\r
const POINTS = 50;\r
const DETAIL = 4;\r
const SAMPLES = (POINTS - 1) * DETAIL + 1;\r
const STRIDE = 6;\r
const STEP = 1 / 120;\r
const SHAPES: Record<string, number> = { lens: 0, comet: 1, even: 2 };\r
const DEFAULT_COLORS = ['#3847ff', '#7c84ff', '#c7cbff'];\r
\r
const VERTEX = \`#version 300 es\r
in vec2 a_position;\r
in vec4 a_shape;\r
uniform vec2 u_resolution;\r
out vec4 v_shape;\r
void main() {\r
  v_shape = a_shape;\r
  vec2 clip = a_position / u_resolution * 2.0 - 1.0;\r
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);\r
}\r
\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform vec3 u_color;\r
uniform float u_opacity;\r
uniform float u_fade;\r
uniform float u_softness;\r
in vec4 v_shape;\r
out vec4 outColor;\r
\r
void main() {\r
  float halfWidth = v_shape.y;\r
  float dist = abs(v_shape.x) * v_shape.z;\r
  float edge = max(halfWidth, 0.5);\r
  float soft = u_softness * edge;\r
  float alpha = 1.0 - smoothstep(edge - soft - 0.6, edge + 0.6, dist);\r
  alpha *= clamp(halfWidth / 0.5, 0.0, 1.0);\r
  alpha *= mix(1.0, 1.0 - smoothstep(0.0, 1.0, v_shape.w), u_fade);\r
  alpha *= u_opacity;\r
  if (alpha <= 0.002) discard;\r
  outColor = vec4(u_color * alpha, alpha);\r
}\r
\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);\r
\r
const smoothstep = (edge0: number, edge1: number, value: number) => {\r
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);\r
  return t * t * (3 - 2 * t);\r
};\r
\r
const hash = (value: number) => {\r
  const s = Math.sin(value * 127.1 + 311.7) * 43758.5453;\r
  return s - Math.floor(s);\r
};\r
\r
const parseColor = (() => {\r
  let context: CanvasRenderingContext2D | null = null;\r
  return (value: string, fallback: Rgba): Rgba => {\r
    if (typeof document === 'undefined') return fallback;\r
    if (!context) {\r
      const canvas = document.createElement('canvas');\r
      canvas.width = 1;\r
      canvas.height = 1;\r
      context = canvas.getContext('2d', { willReadFrequently: true });\r
    }\r
    if (!context) return fallback;\r
    context.clearRect(0, 0, 1, 1);\r
    context.fillStyle = '#000';\r
    context.fillStyle = value;\r
    context.fillRect(0, 0, 1, 1);\r
    const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;\r
    return [r / 255, g / 255, b / 255, a / 255];\r
  };\r
})();\r
\r
const profile = (shape: number, u: number) => {\r
  if (shape === 1) return (1 - u) ** 1.2 * Math.sqrt(smoothstep(0, 0.1, u));\r
  if (shape === 2) return Math.sqrt(smoothstep(0, 0.06, u) * smoothstep(0, 0.06, 1 - u));\r
  const d = (u - 0.5) * 2;\r
  return 1 - 0.9 * d * d;\r
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
const createRibbon = (index: number, x: number, y: number): Ribbon => {\r
  const points = new Float32Array(POINTS * 2);\r
  for (let i = 0; i < POINTS; i++) {\r
    points[i * 2] = x;\r
    points[i * 2 + 1] = y;\r
  }\r
  return {\r
    x,\r
    y,\r
    vx: 0,\r
    vy: 0,\r
    points,\r
    pull: 0.35 + 1.3 * hash(index + 3),\r
    drag: 0.9 + 0.2 * hash(index + 5),\r
    width: 0.95 + 0.1 * hash(index + 7),\r
    lift: hash(index + 13) - 0.5,\r
    nudge: hash(index + 17) - 0.5,\r
    phase: hash(index + 19) * Math.PI * 2\r
  };\r
};\r
\r
export default function Ribbons({\r
  colors = DEFAULT_COLORS,\r
  thickness = 30,\r
  length = 1.4,\r
  spread = 18,\r
  stiffness = 0.5,\r
  bounce = 0.5,\r
  shape = 'lens',\r
  wave = 0,\r
  softness = 0,\r
  fade = false,\r
  opacity = 1,\r
  backgroundColor = 'transparent',\r
  dpr,\r
  className = '',\r
  style\r
}: RibbonsProps) {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const engineRef = useRef<Engine | null>(null);\r
  const settingsRef = useRef<Settings>(null as unknown as Settings);\r
\r
  const palette = (colors?.length ? colors : DEFAULT_COLORS).slice(0, 12);\r
\r
  settingsRef.current = {\r
    colors: palette.map(color => parseColor(color, [1, 1, 1, 1])),\r
    back: parseColor(backgroundColor, [0, 0, 0, 0]),\r
    thickness: Math.max(1, thickness),\r
    length: clamp(length, 0.1, 5),\r
    spread: Math.max(0, spread),\r
    stiffness: clamp(stiffness, 0, 1),\r
    bounce: clamp(bounce, 0, 1),\r
    shape: SHAPES[shape] ?? 0,\r
    wave: clamp(wave, 0, 1),\r
    softness: clamp(softness, 0, 1),\r
    fade,\r
    opacity: clamp(opacity, 0, 1),\r
    dpr\r
  };\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    if (!container || !canvas) return undefined;\r
    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });\r
    if (!gl) return undefined;\r
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
    const program = gl.createProgram();\r
    if (!vertex || !fragment || !program) return undefined;\r
    gl.attachShader(program, vertex);\r
    gl.attachShader(program, fragment);\r
    gl.linkProgram(program);\r
    gl.deleteShader(vertex);\r
    gl.deleteShader(fragment);\r
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return undefined;\r
    gl.useProgram(program);\r
\r
    const uniforms: Record<string, WebGLUniformLocation | null> = {};\r
    const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
    for (let i = 0; i < uniformCount; i++) {\r
      const info = gl.getActiveUniform(program, i);\r
      if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
    }\r
\r
    const vao = gl.createVertexArray();\r
    const buffer = gl.createBuffer();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    const position = gl.getAttribLocation(program, 'a_position');\r
    const shapeAttribute = gl.getAttribLocation(program, 'a_shape');\r
    gl.enableVertexAttribArray(position);\r
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, STRIDE * 4, 0);\r
    gl.enableVertexAttribArray(shapeAttribute);\r
    gl.vertexAttribPointer(shapeAttribute, 4, gl.FLOAT, false, STRIDE * 4, 8);\r
    gl.enable(gl.BLEND);\r
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
\r
    const pointX = new Float32Array(POINTS);\r
    const pointY = new Float32Array(POINTS);\r
    const spacing = new Float32Array(POINTS);\r
    const sampleX = new Float32Array(SAMPLES);\r
    const sampleY = new Float32Array(SAMPLES);\r
    const sampleSpacing = new Float32Array(SAMPLES);\r
    let vertices = new Float32Array(0);\r
\r
    const state = {\r
      alive: true,\r
      raf: 0,\r
      last: 0,\r
      time: 0,\r
      visible: true,\r
      width: 1,\r
      height: 1,\r
      ribbons: [] as Ribbon[],\r
      mouseX: 0,\r
      mouseY: 0,\r
      placed: false,\r
      accumulator: 0\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const ratio = s.dpr ?? Math.min(window.devicePixelRatio || 1, 2);\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      state.width = width;\r
      state.height = height;\r
      if (!state.placed) {\r
        state.mouseX = width / 2;\r
        state.mouseY = height / 2;\r
      }\r
      const pixelWidth = Math.max(1, Math.round(width * ratio));\r
      const pixelHeight = Math.max(1, Math.round(height * ratio));\r
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {\r
        canvas.width = pixelWidth;\r
        canvas.height = pixelHeight;\r
      }\r
    };\r
\r
    const syncRibbons = () => {\r
      const count = settingsRef.current.colors.length;\r
      while (state.ribbons.length < count) {\r
        const anchor = state.ribbons[state.ribbons.length - 1];\r
        state.ribbons.push(createRibbon(state.ribbons.length, anchor?.x ?? state.mouseX, anchor?.y ?? state.mouseY));\r
      }\r
      state.ribbons.length = count;\r
    };\r
\r
    const simulate = (dt: number) => {\r
      const s = settingsRef.current;\r
      const spring = 0.03 * 4 ** (2 * s.stiffness - 1);\r
      const zeta = clamp(0.3 ** (2 * s.bounce), 0.05, 1);\r
      const follow = 1 - 0.183 ** ((1 / s.length) * dt * 60);\r
      const count = state.ribbons.length;\r
      const center = (count - 1) / 2;\r
      for (let i = 0; i < count; i++) {\r
        const ribbon = state.ribbons[i];\r
        const omega = 60 * Math.sqrt(spring * ribbon.pull);\r
        const damping = 2 * zeta * 60 * Math.sqrt(spring) * ribbon.drag;\r
        const tx = state.mouseX + (i - center + ribbon.nudge * 0.2) * s.spread;\r
        const ty = state.mouseY + ribbon.lift * s.spread;\r
        ribbon.vx += (omega * omega * (tx - ribbon.x) - damping * ribbon.vx) * dt;\r
        ribbon.vy += (omega * omega * (ty - ribbon.y) - damping * ribbon.vy) * dt;\r
        ribbon.x += ribbon.vx * dt;\r
        ribbon.y += ribbon.vy * dt;\r
        const { points } = ribbon;\r
        points[0] = ribbon.x;\r
        points[1] = ribbon.y;\r
        for (let j = 1; j < POINTS; j++) {\r
          const p = j * 2;\r
          points[p] += (points[p - 2] - points[p]) * follow;\r
          points[p + 1] += (points[p - 1] - points[p + 1]) * follow;\r
        }\r
      }\r
    };\r
\r
    const build = (ribbon: Ribbon, out: Float32Array, offset: number) => {\r
      const s = settingsRef.current;\r
      const { points } = ribbon;\r
      let total = 0;\r
      for (let j = 0; j < POINTS; j++) {\r
        pointX[j] = points[j * 2];\r
        pointY[j] = points[j * 2 + 1];\r
        if (j > 0) total += Math.hypot(pointX[j] - pointX[j - 1], pointY[j] - pointY[j - 1]);\r
      }\r
      if (total < 0.5) return 0;\r
      for (let j = 0; j < POINTS; j++) {\r
        const prev = Math.max(j - 1, 0);\r
        const next = Math.min(j + 1, POINTS - 1);\r
        spacing[j] = Math.hypot(pointX[next] - pointX[prev], pointY[next] - pointY[prev]);\r
      }\r
      if (s.wave > 0) {\r
        const amplitude = s.wave * Math.min(s.thickness * 0.8, total * 0.07);\r
        let nx = 0;\r
        let ny = 0;\r
        for (let j = 0; j < POINTS; j++) {\r
          const prev = Math.max(j - 1, 0);\r
          const next = Math.min(j + 1, POINTS - 1);\r
          const dx = pointX[next] - pointX[prev];\r
          const dy = pointY[next] - pointY[prev];\r
          const len = Math.hypot(dx, dy);\r
          if (len > 1e-3) {\r
            nx = -dy / len;\r
            ny = dx / len;\r
          }\r
          const u = j / (POINTS - 1);\r
          const swing = Math.sin(u * Math.PI * 3 - state.time * 3.2 + ribbon.phase) * Math.sin(Math.PI * u) * amplitude;\r
          pointX[j] += nx * swing;\r
          pointY[j] += ny * swing;\r
        }\r
      }\r
\r
      let k = 0;\r
      for (let j = 0; j < POINTS - 1; j++) {\r
        const a = Math.max(j - 1, 0);\r
        const b = j;\r
        const c = j + 1;\r
        const d = Math.min(j + 2, POINTS - 1);\r
        for (let step = 0; step < DETAIL; step++) {\r
          const t = step / DETAIL;\r
          const t2 = t * t;\r
          const t3 = t2 * t;\r
          sampleX[k] =\r
            0.5 *\r
            (2 * pointX[b] +\r
              (pointX[c] - pointX[a]) * t +\r
              (2 * pointX[a] - 5 * pointX[b] + 4 * pointX[c] - pointX[d]) * t2 +\r
              (3 * pointX[b] - pointX[a] - 3 * pointX[c] + pointX[d]) * t3);\r
          sampleY[k] =\r
            0.5 *\r
            (2 * pointY[b] +\r
              (pointY[c] - pointY[a]) * t +\r
              (2 * pointY[a] - 5 * pointY[b] + 4 * pointY[c] - pointY[d]) * t2 +\r
              (3 * pointY[b] - pointY[a] - 3 * pointY[c] + pointY[d]) * t3);\r
          sampleSpacing[k] = spacing[j] + (spacing[j + 1] - spacing[j]) * t;\r
          k++;\r
        }\r
      }\r
      sampleX[k] = pointX[POINTS - 1];\r
      sampleY[k] = pointY[POINTS - 1];\r
      sampleSpacing[k] = spacing[POINTS - 1];\r
\r
      const half = s.thickness * 0.5 * ribbon.width * smoothstep(0, s.thickness * 1.5, total);\r
      let normalX = 0;\r
      let normalY = 1;\r
      let cursor = offset;\r
      for (let i = SAMPLES - 1; i >= 0; i--) {\r
        const prev = Math.max(i - 1, 0);\r
        const next = Math.min(i + 1, SAMPLES - 1);\r
        const dx = sampleX[next] - sampleX[prev];\r
        const dy = sampleY[next] - sampleY[prev];\r
        const len = Math.hypot(dx, dy);\r
        if (len > 1e-4) {\r
          normalX = -dy / len;\r
          normalY = dx / len;\r
        }\r
        const u = i / (SAMPLES - 1);\r
        const width = half * profile(s.shape, u) * smoothstep(0, 1.5, sampleSpacing[i]);\r
        const reach = width + 1.5;\r
        for (let side = -1; side <= 1; side += 2) {\r
          out[cursor++] = sampleX[i] + normalX * reach * side;\r
          out[cursor++] = sampleY[i] + normalY * reach * side;\r
          out[cursor++] = side;\r
          out[cursor++] = width;\r
          out[cursor++] = reach;\r
          out[cursor++] = u;\r
        }\r
      }\r
      return SAMPLES * 2;\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      resize();\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      const [r, g, b, a] = s.back;\r
      gl.clearColor(r * a, g * a, b * a, a);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      syncRibbons();\r
      const count = state.ribbons.length;\r
      const needed = count * SAMPLES * 2 * STRIDE;\r
      if (vertices.length < needed) vertices = new Float32Array(needed);\r
      const ranges: [number, number][] = [];\r
      for (let i = 0; i < count; i++) {\r
        const offset = i * SAMPLES * 2 * STRIDE;\r
        ranges.push([offset / STRIDE, build(state.ribbons[i], vertices, offset)]);\r
      }\r
      gl.bindVertexArray(vao);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, vertices.subarray(0, needed), gl.DYNAMIC_DRAW);\r
      gl.uniform2f(uniforms.u_resolution, state.width, state.height);\r
      gl.uniform1f(uniforms.u_opacity, s.opacity);\r
      gl.uniform1f(uniforms.u_fade, s.fade ? 1 : 0);\r
      gl.uniform1f(uniforms.u_softness, s.softness);\r
      for (let i = 0; i < count; i++) {\r
        const [first, size] = ranges[i];\r
        if (!size) continue;\r
        gl.uniform3fv(uniforms.u_color, s.colors[i].slice(0, 3));\r
        gl.drawArrays(gl.TRIANGLE_STRIP, first, size);\r
      }\r
    };\r
\r
    const frame = (now: number) => {\r
      state.raf = 0;\r
      if (!state.alive) return;\r
      const dt = state.last ? Math.min(0.05, (now - state.last) / 1000) : 1 / 60;\r
      state.last = now;\r
      state.time += dt;\r
      syncRibbons();\r
      state.accumulator += dt;\r
      while (state.accumulator >= STEP) {\r
        simulate(STEP);\r
        state.accumulator -= STEP;\r
      }\r
      draw();\r
      if (state.visible) state.raf = requestAnimationFrame(frame);\r
      else state.last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!state.raf && state.alive && state.visible) state.raf = requestAnimationFrame(frame);\r
    };\r
\r
    const onMove = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;\r
      state.mouseX = x;\r
      state.mouseY = y;\r
      state.placed = true;\r
      wake();\r
    };\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      resize();\r
      draw();\r
    });\r
    resizeObserver.observe(container);\r
\r
    const visibility = new IntersectionObserver(entries => {\r
      state.visible = entries.some(entry => entry.isIntersecting);\r
      if (state.visible) wake();\r
    });\r
    visibility.observe(container);\r
\r
    const onLost = (event: Event) => {\r
      event.preventDefault();\r
      state.alive = false;\r
      cancelAnimationFrame(state.raf);\r
    };\r
\r
    canvas.addEventListener('webglcontextlost', onLost);\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    window.addEventListener('pointerdown', onMove, { passive: true });\r
\r
    engineRef.current = {\r
      redraw: () => {\r
        draw();\r
        wake();\r
      }\r
    };\r
\r
    resize();\r
    syncRibbons();\r
    wake();\r
\r
    return () => {\r
      state.alive = false;\r
      cancelAnimationFrame(state.raf);\r
      resizeObserver.disconnect();\r
      visibility.disconnect();\r
      canvas.removeEventListener('webglcontextlost', onLost);\r
      window.removeEventListener('pointermove', onMove);\r
      window.removeEventListener('pointerdown', onMove);\r
      engineRef.current = null;\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(program);\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    engineRef.current?.redraw();\r
  });\r
\r
  return (\r
    <div ref={containerRef} className={\`ribbons \${className}\`.trim()} style={style}>\r
      <canvas ref={canvasRef} className="ribbons-canvas" />\r
    </div>\r
  );\r
}\r
`,o=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties } from 'react';\r
\r
export interface RibbonsProps {\r
  colors?: string[];\r
  thickness?: number;\r
  length?: number;\r
  spread?: number;\r
  stiffness?: number;\r
  bounce?: number;\r
  shape?: 'lens' | 'comet' | 'even';\r
  wave?: number;\r
  softness?: number;\r
  fade?: boolean;\r
  opacity?: number;\r
  backgroundColor?: string;\r
  dpr?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
type Rgba = number[];\r
\r
interface Settings {\r
  colors: Rgba[];\r
  back: Rgba;\r
  thickness: number;\r
  length: number;\r
  spread: number;\r
  stiffness: number;\r
  bounce: number;\r
  shape: number;\r
  wave: number;\r
  softness: number;\r
  fade: boolean;\r
  opacity: number;\r
  dpr?: number;\r
}\r
\r
interface Ribbon {\r
  x: number;\r
  y: number;\r
  vx: number;\r
  vy: number;\r
  points: Float32Array;\r
  pull: number;\r
  drag: number;\r
  width: number;\r
  lift: number;\r
  nudge: number;\r
  phase: number;\r
}\r
\r
interface Engine {\r
  redraw: () => void;\r
}\r
\r
const POINTS = 50;\r
const DETAIL = 4;\r
const SAMPLES = (POINTS - 1) * DETAIL + 1;\r
const STRIDE = 6;\r
const STEP = 1 / 120;\r
const SHAPES: Record<string, number> = { lens: 0, comet: 1, even: 2 };\r
const DEFAULT_COLORS = ['#3847ff', '#7c84ff', '#c7cbff'];\r
\r
const VERTEX = \`#version 300 es\r
in vec2 a_position;\r
in vec4 a_shape;\r
uniform vec2 u_resolution;\r
out vec4 v_shape;\r
void main() {\r
  v_shape = a_shape;\r
  vec2 clip = a_position / u_resolution * 2.0 - 1.0;\r
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);\r
}\r
\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform vec3 u_color;\r
uniform float u_opacity;\r
uniform float u_fade;\r
uniform float u_softness;\r
in vec4 v_shape;\r
out vec4 outColor;\r
\r
void main() {\r
  float halfWidth = v_shape.y;\r
  float dist = abs(v_shape.x) * v_shape.z;\r
  float edge = max(halfWidth, 0.5);\r
  float soft = u_softness * edge;\r
  float alpha = 1.0 - smoothstep(edge - soft - 0.6, edge + 0.6, dist);\r
  alpha *= clamp(halfWidth / 0.5, 0.0, 1.0);\r
  alpha *= mix(1.0, 1.0 - smoothstep(0.0, 1.0, v_shape.w), u_fade);\r
  alpha *= u_opacity;\r
  if (alpha <= 0.002) discard;\r
  outColor = vec4(u_color * alpha, alpha);\r
}\r
\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);\r
\r
const smoothstep = (edge0: number, edge1: number, value: number) => {\r
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);\r
  return t * t * (3 - 2 * t);\r
};\r
\r
const hash = (value: number) => {\r
  const s = Math.sin(value * 127.1 + 311.7) * 43758.5453;\r
  return s - Math.floor(s);\r
};\r
\r
const parseColor = (() => {\r
  let context: CanvasRenderingContext2D | null = null;\r
  return (value: string, fallback: Rgba): Rgba => {\r
    if (typeof document === 'undefined') return fallback;\r
    if (!context) {\r
      const canvas = document.createElement('canvas');\r
      canvas.width = 1;\r
      canvas.height = 1;\r
      context = canvas.getContext('2d', { willReadFrequently: true });\r
    }\r
    if (!context) return fallback;\r
    context.clearRect(0, 0, 1, 1);\r
    context.fillStyle = '#000';\r
    context.fillStyle = value;\r
    context.fillRect(0, 0, 1, 1);\r
    const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;\r
    return [r / 255, g / 255, b / 255, a / 255];\r
  };\r
})();\r
\r
const profile = (shape: number, u: number) => {\r
  if (shape === 1) return (1 - u) ** 1.2 * Math.sqrt(smoothstep(0, 0.1, u));\r
  if (shape === 2) return Math.sqrt(smoothstep(0, 0.06, u) * smoothstep(0, 0.06, 1 - u));\r
  const d = (u - 0.5) * 2;\r
  return 1 - 0.9 * d * d;\r
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
const createRibbon = (index: number, x: number, y: number): Ribbon => {\r
  const points = new Float32Array(POINTS * 2);\r
  for (let i = 0; i < POINTS; i++) {\r
    points[i * 2] = x;\r
    points[i * 2 + 1] = y;\r
  }\r
  return {\r
    x,\r
    y,\r
    vx: 0,\r
    vy: 0,\r
    points,\r
    pull: 0.35 + 1.3 * hash(index + 3),\r
    drag: 0.9 + 0.2 * hash(index + 5),\r
    width: 0.95 + 0.1 * hash(index + 7),\r
    lift: hash(index + 13) - 0.5,\r
    nudge: hash(index + 17) - 0.5,\r
    phase: hash(index + 19) * Math.PI * 2\r
  };\r
};\r
\r
export default function Ribbons({\r
  colors = DEFAULT_COLORS,\r
  thickness = 30,\r
  length = 1.4,\r
  spread = 18,\r
  stiffness = 0.5,\r
  bounce = 0.5,\r
  shape = 'lens',\r
  wave = 0,\r
  softness = 0,\r
  fade = false,\r
  opacity = 1,\r
  backgroundColor = 'transparent',\r
  dpr,\r
  className = '',\r
  style\r
}: RibbonsProps) {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const engineRef = useRef<Engine | null>(null);\r
  const settingsRef = useRef<Settings>(null as unknown as Settings);\r
\r
  const palette = (colors?.length ? colors : DEFAULT_COLORS).slice(0, 12);\r
\r
  settingsRef.current = {\r
    colors: palette.map(color => parseColor(color, [1, 1, 1, 1])),\r
    back: parseColor(backgroundColor, [0, 0, 0, 0]),\r
    thickness: Math.max(1, thickness),\r
    length: clamp(length, 0.1, 5),\r
    spread: Math.max(0, spread),\r
    stiffness: clamp(stiffness, 0, 1),\r
    bounce: clamp(bounce, 0, 1),\r
    shape: SHAPES[shape] ?? 0,\r
    wave: clamp(wave, 0, 1),\r
    softness: clamp(softness, 0, 1),\r
    fade,\r
    opacity: clamp(opacity, 0, 1),\r
    dpr\r
  };\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    if (!container || !canvas) return undefined;\r
    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });\r
    if (!gl) return undefined;\r
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
    const program = gl.createProgram();\r
    if (!vertex || !fragment || !program) return undefined;\r
    gl.attachShader(program, vertex);\r
    gl.attachShader(program, fragment);\r
    gl.linkProgram(program);\r
    gl.deleteShader(vertex);\r
    gl.deleteShader(fragment);\r
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return undefined;\r
    gl.useProgram(program);\r
\r
    const uniforms: Record<string, WebGLUniformLocation | null> = {};\r
    const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
    for (let i = 0; i < uniformCount; i++) {\r
      const info = gl.getActiveUniform(program, i);\r
      if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
    }\r
\r
    const vao = gl.createVertexArray();\r
    const buffer = gl.createBuffer();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    const position = gl.getAttribLocation(program, 'a_position');\r
    const shapeAttribute = gl.getAttribLocation(program, 'a_shape');\r
    gl.enableVertexAttribArray(position);\r
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, STRIDE * 4, 0);\r
    gl.enableVertexAttribArray(shapeAttribute);\r
    gl.vertexAttribPointer(shapeAttribute, 4, gl.FLOAT, false, STRIDE * 4, 8);\r
    gl.enable(gl.BLEND);\r
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
\r
    const pointX = new Float32Array(POINTS);\r
    const pointY = new Float32Array(POINTS);\r
    const spacing = new Float32Array(POINTS);\r
    const sampleX = new Float32Array(SAMPLES);\r
    const sampleY = new Float32Array(SAMPLES);\r
    const sampleSpacing = new Float32Array(SAMPLES);\r
    let vertices = new Float32Array(0);\r
\r
    const state = {\r
      alive: true,\r
      raf: 0,\r
      last: 0,\r
      time: 0,\r
      visible: true,\r
      width: 1,\r
      height: 1,\r
      ribbons: [] as Ribbon[],\r
      mouseX: 0,\r
      mouseY: 0,\r
      placed: false,\r
      accumulator: 0\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const ratio = s.dpr ?? Math.min(window.devicePixelRatio || 1, 2);\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      state.width = width;\r
      state.height = height;\r
      if (!state.placed) {\r
        state.mouseX = width / 2;\r
        state.mouseY = height / 2;\r
      }\r
      const pixelWidth = Math.max(1, Math.round(width * ratio));\r
      const pixelHeight = Math.max(1, Math.round(height * ratio));\r
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {\r
        canvas.width = pixelWidth;\r
        canvas.height = pixelHeight;\r
      }\r
    };\r
\r
    const syncRibbons = () => {\r
      const count = settingsRef.current.colors.length;\r
      while (state.ribbons.length < count) {\r
        const anchor = state.ribbons[state.ribbons.length - 1];\r
        state.ribbons.push(createRibbon(state.ribbons.length, anchor?.x ?? state.mouseX, anchor?.y ?? state.mouseY));\r
      }\r
      state.ribbons.length = count;\r
    };\r
\r
    const simulate = (dt: number) => {\r
      const s = settingsRef.current;\r
      const spring = 0.03 * 4 ** (2 * s.stiffness - 1);\r
      const zeta = clamp(0.3 ** (2 * s.bounce), 0.05, 1);\r
      const follow = 1 - 0.183 ** ((1 / s.length) * dt * 60);\r
      const count = state.ribbons.length;\r
      const center = (count - 1) / 2;\r
      for (let i = 0; i < count; i++) {\r
        const ribbon = state.ribbons[i];\r
        const omega = 60 * Math.sqrt(spring * ribbon.pull);\r
        const damping = 2 * zeta * 60 * Math.sqrt(spring) * ribbon.drag;\r
        const tx = state.mouseX + (i - center + ribbon.nudge * 0.2) * s.spread;\r
        const ty = state.mouseY + ribbon.lift * s.spread;\r
        ribbon.vx += (omega * omega * (tx - ribbon.x) - damping * ribbon.vx) * dt;\r
        ribbon.vy += (omega * omega * (ty - ribbon.y) - damping * ribbon.vy) * dt;\r
        ribbon.x += ribbon.vx * dt;\r
        ribbon.y += ribbon.vy * dt;\r
        const { points } = ribbon;\r
        points[0] = ribbon.x;\r
        points[1] = ribbon.y;\r
        for (let j = 1; j < POINTS; j++) {\r
          const p = j * 2;\r
          points[p] += (points[p - 2] - points[p]) * follow;\r
          points[p + 1] += (points[p - 1] - points[p + 1]) * follow;\r
        }\r
      }\r
    };\r
\r
    const build = (ribbon: Ribbon, out: Float32Array, offset: number) => {\r
      const s = settingsRef.current;\r
      const { points } = ribbon;\r
      let total = 0;\r
      for (let j = 0; j < POINTS; j++) {\r
        pointX[j] = points[j * 2];\r
        pointY[j] = points[j * 2 + 1];\r
        if (j > 0) total += Math.hypot(pointX[j] - pointX[j - 1], pointY[j] - pointY[j - 1]);\r
      }\r
      if (total < 0.5) return 0;\r
      for (let j = 0; j < POINTS; j++) {\r
        const prev = Math.max(j - 1, 0);\r
        const next = Math.min(j + 1, POINTS - 1);\r
        spacing[j] = Math.hypot(pointX[next] - pointX[prev], pointY[next] - pointY[prev]);\r
      }\r
      if (s.wave > 0) {\r
        const amplitude = s.wave * Math.min(s.thickness * 0.8, total * 0.07);\r
        let nx = 0;\r
        let ny = 0;\r
        for (let j = 0; j < POINTS; j++) {\r
          const prev = Math.max(j - 1, 0);\r
          const next = Math.min(j + 1, POINTS - 1);\r
          const dx = pointX[next] - pointX[prev];\r
          const dy = pointY[next] - pointY[prev];\r
          const len = Math.hypot(dx, dy);\r
          if (len > 1e-3) {\r
            nx = -dy / len;\r
            ny = dx / len;\r
          }\r
          const u = j / (POINTS - 1);\r
          const swing = Math.sin(u * Math.PI * 3 - state.time * 3.2 + ribbon.phase) * Math.sin(Math.PI * u) * amplitude;\r
          pointX[j] += nx * swing;\r
          pointY[j] += ny * swing;\r
        }\r
      }\r
\r
      let k = 0;\r
      for (let j = 0; j < POINTS - 1; j++) {\r
        const a = Math.max(j - 1, 0);\r
        const b = j;\r
        const c = j + 1;\r
        const d = Math.min(j + 2, POINTS - 1);\r
        for (let step = 0; step < DETAIL; step++) {\r
          const t = step / DETAIL;\r
          const t2 = t * t;\r
          const t3 = t2 * t;\r
          sampleX[k] =\r
            0.5 *\r
            (2 * pointX[b] +\r
              (pointX[c] - pointX[a]) * t +\r
              (2 * pointX[a] - 5 * pointX[b] + 4 * pointX[c] - pointX[d]) * t2 +\r
              (3 * pointX[b] - pointX[a] - 3 * pointX[c] + pointX[d]) * t3);\r
          sampleY[k] =\r
            0.5 *\r
            (2 * pointY[b] +\r
              (pointY[c] - pointY[a]) * t +\r
              (2 * pointY[a] - 5 * pointY[b] + 4 * pointY[c] - pointY[d]) * t2 +\r
              (3 * pointY[b] - pointY[a] - 3 * pointY[c] + pointY[d]) * t3);\r
          sampleSpacing[k] = spacing[j] + (spacing[j + 1] - spacing[j]) * t;\r
          k++;\r
        }\r
      }\r
      sampleX[k] = pointX[POINTS - 1];\r
      sampleY[k] = pointY[POINTS - 1];\r
      sampleSpacing[k] = spacing[POINTS - 1];\r
\r
      const half = s.thickness * 0.5 * ribbon.width * smoothstep(0, s.thickness * 1.5, total);\r
      let normalX = 0;\r
      let normalY = 1;\r
      let cursor = offset;\r
      for (let i = SAMPLES - 1; i >= 0; i--) {\r
        const prev = Math.max(i - 1, 0);\r
        const next = Math.min(i + 1, SAMPLES - 1);\r
        const dx = sampleX[next] - sampleX[prev];\r
        const dy = sampleY[next] - sampleY[prev];\r
        const len = Math.hypot(dx, dy);\r
        if (len > 1e-4) {\r
          normalX = -dy / len;\r
          normalY = dx / len;\r
        }\r
        const u = i / (SAMPLES - 1);\r
        const width = half * profile(s.shape, u) * smoothstep(0, 1.5, sampleSpacing[i]);\r
        const reach = width + 1.5;\r
        for (let side = -1; side <= 1; side += 2) {\r
          out[cursor++] = sampleX[i] + normalX * reach * side;\r
          out[cursor++] = sampleY[i] + normalY * reach * side;\r
          out[cursor++] = side;\r
          out[cursor++] = width;\r
          out[cursor++] = reach;\r
          out[cursor++] = u;\r
        }\r
      }\r
      return SAMPLES * 2;\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      resize();\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      const [r, g, b, a] = s.back;\r
      gl.clearColor(r * a, g * a, b * a, a);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      syncRibbons();\r
      const count = state.ribbons.length;\r
      const needed = count * SAMPLES * 2 * STRIDE;\r
      if (vertices.length < needed) vertices = new Float32Array(needed);\r
      const ranges: [number, number][] = [];\r
      for (let i = 0; i < count; i++) {\r
        const offset = i * SAMPLES * 2 * STRIDE;\r
        ranges.push([offset / STRIDE, build(state.ribbons[i], vertices, offset)]);\r
      }\r
      gl.bindVertexArray(vao);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, vertices.subarray(0, needed), gl.DYNAMIC_DRAW);\r
      gl.uniform2f(uniforms.u_resolution, state.width, state.height);\r
      gl.uniform1f(uniforms.u_opacity, s.opacity);\r
      gl.uniform1f(uniforms.u_fade, s.fade ? 1 : 0);\r
      gl.uniform1f(uniforms.u_softness, s.softness);\r
      for (let i = 0; i < count; i++) {\r
        const [first, size] = ranges[i];\r
        if (!size) continue;\r
        gl.uniform3fv(uniforms.u_color, s.colors[i].slice(0, 3));\r
        gl.drawArrays(gl.TRIANGLE_STRIP, first, size);\r
      }\r
    };\r
\r
    const frame = (now: number) => {\r
      state.raf = 0;\r
      if (!state.alive) return;\r
      const dt = state.last ? Math.min(0.05, (now - state.last) / 1000) : 1 / 60;\r
      state.last = now;\r
      state.time += dt;\r
      syncRibbons();\r
      state.accumulator += dt;\r
      while (state.accumulator >= STEP) {\r
        simulate(STEP);\r
        state.accumulator -= STEP;\r
      }\r
      draw();\r
      if (state.visible) state.raf = requestAnimationFrame(frame);\r
      else state.last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!state.raf && state.alive && state.visible) state.raf = requestAnimationFrame(frame);\r
    };\r
\r
    const onMove = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;\r
      state.mouseX = x;\r
      state.mouseY = y;\r
      state.placed = true;\r
      wake();\r
    };\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      resize();\r
      draw();\r
    });\r
    resizeObserver.observe(container);\r
\r
    const visibility = new IntersectionObserver(entries => {\r
      state.visible = entries.some(entry => entry.isIntersecting);\r
      if (state.visible) wake();\r
    });\r
    visibility.observe(container);\r
\r
    const onLost = (event: Event) => {\r
      event.preventDefault();\r
      state.alive = false;\r
      cancelAnimationFrame(state.raf);\r
    };\r
\r
    canvas.addEventListener('webglcontextlost', onLost);\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    window.addEventListener('pointerdown', onMove, { passive: true });\r
\r
    engineRef.current = {\r
      redraw: () => {\r
        draw();\r
        wake();\r
      }\r
    };\r
\r
    resize();\r
    syncRibbons();\r
    wake();\r
\r
    return () => {\r
      state.alive = false;\r
      cancelAnimationFrame(state.raf);\r
      resizeObserver.disconnect();\r
      visibility.disconnect();\r
      canvas.removeEventListener('webglcontextlost', onLost);\r
      window.removeEventListener('pointermove', onMove);\r
      window.removeEventListener('pointerdown', onMove);\r
      engineRef.current = null;\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(program);\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    engineRef.current?.redraw();\r
  });\r
\r
  return (\r
    <div ref={containerRef} className={\`pointer-events-none relative h-full w-full \${className}\`.trim()} style={style}>\r
      <canvas ref={canvasRef} className="block h-full w-full" />\r
    </div>\r
  );\r
}\r
`,s={usage:`import Ribbons from './Ribbons';

<div style={{ height: '500px', position: 'relative', overflow: 'hidden' }}>
  <Ribbons
    colors={['#3847ff', '#7c84ff', '#c7cbff']}
    thickness={30}
    length={1.4}
  />
</div>`,code:n,css:r,tailwind:e,tsCode:t,tsTailwind:o};export{s as ribbons};
