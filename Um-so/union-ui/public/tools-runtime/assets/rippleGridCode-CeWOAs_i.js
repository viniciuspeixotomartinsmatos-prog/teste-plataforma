const n=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
import './RippleGrid.css';\r
\r
const MAX_RIPPLES = 12;\r
const VARIANTS = { lines: 0, dots: 1, cross: 2 };\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform vec2 uView;\r
uniform float uRatio;\r
uniform float uCell;\r
uniform float uLineWidth;\r
uniform float uGlow;\r
uniform float uTilt;\r
uniform float uFocal;\r
uniform vec2 uTurn;\r
uniform vec4 uRipples[\${MAX_RIPPLES}];\r
uniform int uRippleCount;\r
uniform float uWaveLength;\r
uniform float uWaveSpeed;\r
uniform float uStrength;\r
uniform vec3 uPointer;\r
uniform vec3 uColor;\r
uniform vec3 uInk;\r
uniform float uPresence;\r
uniform float uReveal;\r
uniform float uFade;\r
uniform float uOpacity;\r
uniform float uLightMode;\r
uniform int uVariant;\r
out vec4 outColor;\r
\r
float smootherstep(float edge, float x) {\r
  float t = clamp(x / max(edge, 0.0001), 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
void main() {\r
  vec2 css = gl_FragCoord.xy / uRatio;\r
  vec2 screen = vec2(css.x - uView.x * 0.5, uView.y * 0.5 - css.y);\r
  vec2 plane = screen;\r
  float horizon = 1.0;\r
  if (uTilt > 0.0001) {\r
    float depth = uFocal + screen.y * tan(uTilt);\r
    horizon = smoothstep(0.0, uFocal * 0.35, depth);\r
    float scale = uFocal / max(depth, 0.001);\r
    plane = vec2(screen.x * scale, screen.y * scale / cos(uTilt));\r
  }\r
\r
  vec2 push = vec2(0.0);\r
  float lift = 0.0;\r
  for (int i = 0; i < \${MAX_RIPPLES}; i++) {\r
    if (i >= uRippleCount) break;\r
    vec4 ripple = uRipples[i];\r
    vec2 delta = plane - ripple.xy;\r
    float dist = length(delta);\r
    float x = (dist - ripple.z * uWaveSpeed) / uWaveLength;\r
    float packet = exp(-x * x * 1.8);\r
    float spread = 1.0 / (1.0 + dist / (uWaveLength * 5.0));\r
    float calm = smoothstep(0.0, uWaveLength * 0.9, dist);\r
    float wave = sin(x * 6.28318) * packet * spread * calm * ripple.w;\r
    push += (dist > 0.001 ? delta / dist : vec2(0.0)) * wave;\r
    lift += wave;\r
  }\r
\r
  vec2 bent = plane + push * uStrength * uCell * 0.22;\r
  vec2 grid = mat2(uTurn.x, uTurn.y, -uTurn.y, uTurn.x) * bent / uCell;\r
  vec2 fw = max(fwidth(grid), vec2(0.00001));\r
  vec2 offset = abs(fract(grid - 0.5) - 0.5);\r
  vec2 dist = offset / fw;\r
  float width = max(uLineWidth * uRatio, 1.0);\r
  float thin = min(uLineWidth * uRatio, 1.0);\r
  float shape = 0.0;\r
  float edge = min(dist.x, dist.y);\r
  if (uVariant == 1) {\r
    edge = length(dist);\r
    shape = (1.0 - smoothstep(width * 1.7 - 0.5, width * 1.7 + 0.5, edge)) * thin * 1.8;\r
  } else if (uVariant == 2) {\r
    float arm = 0.16;\r
    vec2 cover = (1.0 - smoothstep(width * 0.5 - 0.5, width * 0.5 + 0.5, dist)) * thin;\r
    vec2 reach = 1.0 - smoothstep(arm - fw * 0.5, arm + fw * 0.5, offset);\r
    shape = max(cover.x * reach.y, cover.y * reach.x);\r
    edge = max(min(dist.x, dist.y), length(max(offset - arm, 0.0) / fw));\r
  } else {\r
    vec2 cover = (1.0 - smoothstep(width * 0.5 - 0.5, width * 0.5 + 0.5, dist)) * thin;\r
    shape = max(cover.x, cover.y);\r
  }\r
  float halo = exp(-edge / (uRatio * 2.4)) * uGlow;\r
  float far = 1.0 - smoothstep(0.18, 0.5, max(fw.x, fw.y));\r
\r
  vec2 toPointer = (plane - uPointer.xy) / (uCell * 3.2);\r
  float near = uPointer.z * exp(-dot(toPointer, toPointer));\r
  float shine = max(1.0 + lift * 3.4 * uStrength, 0.25) * (1.0 + near * 1.6);\r
\r
  float radius = length(plane);\r
  float reveal = 1.0 - smoothstep(uReveal - uCell * 4.0, uReveal, radius);\r
  vec2 uv = gl_FragCoord.xy / (uView * uRatio);\r
  float edgeFade = uFade * 0.5;\r
  float mask = smootherstep(edgeFade, uv.x) * smootherstep(edgeFade, 1.0 - uv.x) * smootherstep(edgeFade, uv.y) * smootherstep(edgeFade, 1.0 - uv.y);\r
  mask *= horizon * far * reveal * uPresence * uOpacity;\r
\r
  float level = (shape * 0.26 + halo * 0.1) * shine * mask;\r
  float dither = (hash(gl_FragCoord.xy) - 0.5) / 255.0;\r
  if (uLightMode > 0.5) {\r
    float alpha = clamp(level * 1.2 + dither, 0.0, 1.0);\r
    outColor = vec4(uInk * alpha, alpha);\r
  } else {\r
    float alpha = clamp(level + dither, 0.0, 1.0);\r
    vec3 color = mix(uColor, vec3(1.0), clamp(level - 0.7, 0.0, 1.0));\r
    outColor = vec4(color * alpha, alpha);\r
  }\r
}\`;\r
\r
const INTRO_SECONDS = 1.6;\r
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
  gl.bindAttribLocation(program, 0, 'aPosition');\r
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
    if (info) uniforms[info.name.replace('[0]', '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
export const RippleGrid = ({\r
  color = '#ffffff',\r
  variant = 'lines',\r
  cellSize = 48,\r
  lineWidth = 1,\r
  glow = 0.6,\r
  rippleStrength = 1,\r
  rippleSpeed = 1,\r
  rippleSize = 1,\r
  autoRipple = 'center',\r
  rippleInterval = 2.6,\r
  tilt = 0,\r
  rotation = 0,\r
  mouseInteraction = true,\r
  clickRipple = true,\r
  intro = true,\r
  fade = 0.5,\r
  opacity = 1,\r
  lightMode = false,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  ...rest\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settings = {\r
    color: String(color),\r
    variant: VARIANTS[variant] ?? 0,\r
    cellSize: Math.max(8, cellSize),\r
    lineWidth: Math.max(0.25, lineWidth),\r
    glow: Math.max(0, glow),\r
    rippleStrength: Math.max(0, rippleStrength),\r
    rippleSpeed: Math.max(0.05, rippleSpeed),\r
    rippleSize: Math.max(0.2, rippleSize),\r
    autoRipple,\r
    rippleInterval: Math.max(0.3, rippleInterval),\r
    tilt: clamp(tilt, 0, 80),\r
    rotation,\r
    mouseInteraction,\r
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
    const buffer = gl.createBuffer();\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const colorCache = new Map();\r
    const toLinear = value => {\r
      if (colorCache.has(value)) return colorCache.get(value);\r
      let rgb = [1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#ffffff';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r, g, b].map(v => Math.pow(v / 255, 2.2));\r
      }\r
      colorCache.set(value, rgb);\r
      return rgb;\r
    };\r
\r
    const view = { width: 1, height: 1, ratio: 1 };\r
    const pointer = { x: 0, y: 0, inside: false, planeX: 0, planeY: 0, lastX: 0, lastY: 0, travel: 0 };\r
    const state = { clock: 0, intro: settingsRef.current.intro && !reduce ? 0 : 1, glow: 0, nextAuto: 0.4 };\r
    const ripples = [];\r
    const packed = new Float32Array(MAX_RIPPLES * 4);\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const focalOf = () => view.height * 1.15;\r
\r
    const toPlane = (x, y) => {\r
      const s = settingsRef.current;\r
      const sx = x - view.width / 2;\r
      const sy = y - view.height / 2;\r
      const tilt = (s.tilt * Math.PI) / 180;\r
      if (tilt <= 0.0001) return [sx, sy];\r
      const focal = focalOf();\r
      const depth = focal + sy * Math.tan(tilt);\r
      if (depth <= focal * 0.05) return null;\r
      const scale = focal / depth;\r
      return [sx * scale, (sy * scale) / Math.cos(tilt)];\r
    };\r
\r
    const spawn = (x, y, strength) => {\r
      ripples.push({ x, y, born: state.clock, strength });\r
      if (ripples.length > MAX_RIPPLES) ripples.shift();\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const presence = state.intro * state.intro * (3 - 2 * state.intro);\r
      const waveLength = s.cellSize * 2.4 * s.rippleSize;\r
      const waveSpeed = 240 * s.rippleSpeed;\r
      let count = 0;\r
      for (let i = ripples.length - 1; i >= 0 && count < MAX_RIPPLES; i--) {\r
        const r = ripples[i];\r
        const age = state.clock - r.born;\r
        packed[count * 4] = r.x;\r
        packed[count * 4 + 1] = r.y;\r
        packed[count * 4 + 2] = age;\r
        packed[count * 4 + 3] = r.strength * Math.exp(-age * 0.55);\r
        count++;\r
      }\r
      const angle = (s.rotation * Math.PI) / 180;\r
      const tint = toLinear(s.color);\r
      const tone = 0.2126 * tint[0] + 0.7152 * tint[1] + 0.0722 * tint[2];\r
      const depth = Math.min(1, 0.12 / Math.max(tone, 0.001));\r
      const ink = tint.map(v => Math.pow(Math.min(1, v * depth), 1 / 2.2));\r
      const diagonal = Math.hypot(view.width, view.height);\r
\r
      gl.bindVertexArray(vao);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(program.program);\r
      gl.uniform2f(u.uView, view.width, view.height);\r
      gl.uniform1f(u.uRatio, view.ratio);\r
      gl.uniform1f(u.uCell, s.cellSize);\r
      gl.uniform1f(u.uLineWidth, s.lineWidth);\r
      gl.uniform1f(u.uGlow, s.glow);\r
      gl.uniform1f(u.uTilt, (s.tilt * Math.PI) / 180);\r
      gl.uniform1f(u.uFocal, focalOf());\r
      gl.uniform2f(u.uTurn, Math.cos(angle), Math.sin(angle));\r
      gl.uniform4fv(u.uRipples, packed);\r
      gl.uniform1i(u.uRippleCount, count);\r
      gl.uniform1f(u.uWaveLength, waveLength);\r
      gl.uniform1f(u.uWaveSpeed, waveSpeed);\r
      gl.uniform1f(u.uStrength, s.rippleStrength);\r
      gl.uniform3f(u.uPointer, pointer.planeX, pointer.planeY, state.glow);\r
      gl.uniform3fv(\r
        u.uColor,\r
        tint.map(v => Math.pow(v, 1 / 2.2))\r
      );\r
      gl.uniform3fv(u.uInk, ink);\r
      gl.uniform1f(u.uPresence, Math.min(1, presence * 1.6));\r
      gl.uniform1f(u.uReveal, s.intro && !reduce ? presence * diagonal * 1.4 + s.cellSize * 4 : 1e6);\r
      gl.uniform1f(u.uFade, s.fade);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.uniform1f(u.uLightMode, s.lightMode ? 1 : 0);\r
      gl.uniform1i(u.uVariant, s.variant);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const moving = !s.paused && !reduce;\r
      if (moving) state.clock += dt;\r
      if (!s.intro || reduce) state.intro = 1;\r
      else if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / INTRO_SECONDS);\r
\r
      if (moving && s.autoRipple !== 'none' && state.clock >= state.nextAuto) {\r
        if (s.autoRipple === 'random') {\r
          const spot = toPlane(Math.random() * view.width, view.height * (0.2 + Math.random() * 0.7));\r
          if (spot) spawn(spot[0], spot[1], 0.75);\r
        } else {\r
          spawn(0, 0, 1);\r
        }\r
        state.nextAuto = state.clock + s.rippleInterval;\r
      }\r
      const lifetime = 9 / Math.max(0.2, s.rippleSpeed);\r
      while (ripples.length && state.clock - ripples[0].born > lifetime) ripples.shift();\r
\r
      const engaged = s.mouseInteraction && pointer.inside && !reduce;\r
      state.glow += ((engaged ? 1 : 0) - state.glow) * (1 - Math.exp(-dt * (engaged ? 6 : 2.5)));\r
      render();\r
\r
      const settling = state.intro < 1 || Math.abs((engaged ? 1 : 0) - state.glow) > 0.002;\r
      if (moving || settling) raf = requestAnimationFrame(frame);\r
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
      if (!raf) render();\r
      wake();\r
    };\r
\r
    const onPointerMove = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      const spot = pointer.inside ? toPlane(x, y) : null;\r
      if (spot) {\r
        const s = settingsRef.current;\r
        const step = Math.hypot(spot[0] - pointer.planeX, spot[1] - pointer.planeY);\r
        pointer.planeX = spot[0];\r
        pointer.planeY = spot[1];\r
        if (s.mouseInteraction && !reduce && step < s.cellSize * 6) {\r
          pointer.travel += step;\r
          if (pointer.travel > s.cellSize * 1.6) {\r
            pointer.travel = 0;\r
            spawn(spot[0], spot[1], 0.32);\r
          }\r
        }\r
      } else {\r
        pointer.inside = false;\r
      }\r
      pointer.x = x;\r
      pointer.y = y;\r
      wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      if (!s.clickRipple || reduce) return;\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;\r
      const spot = toPlane(x, y);\r
      if (spot) spawn(spot[0], spot[1], 1.2);\r
      wake();\r
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
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    if (settingsRef.current.intro && !reduce) spawn(0, 0, 1.1);\r
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
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteProgram(program.program);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div ref={containerRef} className={\`ripple-grid-container\${className ? \` \${className}\` : ''}\`} {...rest}>\r
      <canvas ref={canvasRef} className="ripple-grid-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default RippleGrid;\r
`,r=`.ripple-grid-container {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.ripple-grid-canvas {\r
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
const MAX_RIPPLES = 12;\r
const VARIANTS = { lines: 0, dots: 1, cross: 2 };\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform vec2 uView;\r
uniform float uRatio;\r
uniform float uCell;\r
uniform float uLineWidth;\r
uniform float uGlow;\r
uniform float uTilt;\r
uniform float uFocal;\r
uniform vec2 uTurn;\r
uniform vec4 uRipples[\${MAX_RIPPLES}];\r
uniform int uRippleCount;\r
uniform float uWaveLength;\r
uniform float uWaveSpeed;\r
uniform float uStrength;\r
uniform vec3 uPointer;\r
uniform vec3 uColor;\r
uniform vec3 uInk;\r
uniform float uPresence;\r
uniform float uReveal;\r
uniform float uFade;\r
uniform float uOpacity;\r
uniform float uLightMode;\r
uniform int uVariant;\r
out vec4 outColor;\r
\r
float smootherstep(float edge, float x) {\r
  float t = clamp(x / max(edge, 0.0001), 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
void main() {\r
  vec2 css = gl_FragCoord.xy / uRatio;\r
  vec2 screen = vec2(css.x - uView.x * 0.5, uView.y * 0.5 - css.y);\r
  vec2 plane = screen;\r
  float horizon = 1.0;\r
  if (uTilt > 0.0001) {\r
    float depth = uFocal + screen.y * tan(uTilt);\r
    horizon = smoothstep(0.0, uFocal * 0.35, depth);\r
    float scale = uFocal / max(depth, 0.001);\r
    plane = vec2(screen.x * scale, screen.y * scale / cos(uTilt));\r
  }\r
\r
  vec2 push = vec2(0.0);\r
  float lift = 0.0;\r
  for (int i = 0; i < \${MAX_RIPPLES}; i++) {\r
    if (i >= uRippleCount) break;\r
    vec4 ripple = uRipples[i];\r
    vec2 delta = plane - ripple.xy;\r
    float dist = length(delta);\r
    float x = (dist - ripple.z * uWaveSpeed) / uWaveLength;\r
    float packet = exp(-x * x * 1.8);\r
    float spread = 1.0 / (1.0 + dist / (uWaveLength * 5.0));\r
    float calm = smoothstep(0.0, uWaveLength * 0.9, dist);\r
    float wave = sin(x * 6.28318) * packet * spread * calm * ripple.w;\r
    push += (dist > 0.001 ? delta / dist : vec2(0.0)) * wave;\r
    lift += wave;\r
  }\r
\r
  vec2 bent = plane + push * uStrength * uCell * 0.22;\r
  vec2 grid = mat2(uTurn.x, uTurn.y, -uTurn.y, uTurn.x) * bent / uCell;\r
  vec2 fw = max(fwidth(grid), vec2(0.00001));\r
  vec2 offset = abs(fract(grid - 0.5) - 0.5);\r
  vec2 dist = offset / fw;\r
  float width = max(uLineWidth * uRatio, 1.0);\r
  float thin = min(uLineWidth * uRatio, 1.0);\r
  float shape = 0.0;\r
  float edge = min(dist.x, dist.y);\r
  if (uVariant == 1) {\r
    edge = length(dist);\r
    shape = (1.0 - smoothstep(width * 1.7 - 0.5, width * 1.7 + 0.5, edge)) * thin * 1.8;\r
  } else if (uVariant == 2) {\r
    float arm = 0.16;\r
    vec2 cover = (1.0 - smoothstep(width * 0.5 - 0.5, width * 0.5 + 0.5, dist)) * thin;\r
    vec2 reach = 1.0 - smoothstep(arm - fw * 0.5, arm + fw * 0.5, offset);\r
    shape = max(cover.x * reach.y, cover.y * reach.x);\r
    edge = max(min(dist.x, dist.y), length(max(offset - arm, 0.0) / fw));\r
  } else {\r
    vec2 cover = (1.0 - smoothstep(width * 0.5 - 0.5, width * 0.5 + 0.5, dist)) * thin;\r
    shape = max(cover.x, cover.y);\r
  }\r
  float halo = exp(-edge / (uRatio * 2.4)) * uGlow;\r
  float far = 1.0 - smoothstep(0.18, 0.5, max(fw.x, fw.y));\r
\r
  vec2 toPointer = (plane - uPointer.xy) / (uCell * 3.2);\r
  float near = uPointer.z * exp(-dot(toPointer, toPointer));\r
  float shine = max(1.0 + lift * 3.4 * uStrength, 0.25) * (1.0 + near * 1.6);\r
\r
  float radius = length(plane);\r
  float reveal = 1.0 - smoothstep(uReveal - uCell * 4.0, uReveal, radius);\r
  vec2 uv = gl_FragCoord.xy / (uView * uRatio);\r
  float edgeFade = uFade * 0.5;\r
  float mask = smootherstep(edgeFade, uv.x) * smootherstep(edgeFade, 1.0 - uv.x) * smootherstep(edgeFade, uv.y) * smootherstep(edgeFade, 1.0 - uv.y);\r
  mask *= horizon * far * reveal * uPresence * uOpacity;\r
\r
  float level = (shape * 0.26 + halo * 0.1) * shine * mask;\r
  float dither = (hash(gl_FragCoord.xy) - 0.5) / 255.0;\r
  if (uLightMode > 0.5) {\r
    float alpha = clamp(level * 1.2 + dither, 0.0, 1.0);\r
    outColor = vec4(uInk * alpha, alpha);\r
  } else {\r
    float alpha = clamp(level + dither, 0.0, 1.0);\r
    vec3 color = mix(uColor, vec3(1.0), clamp(level - 0.7, 0.0, 1.0));\r
    outColor = vec4(color * alpha, alpha);\r
  }\r
}\`;\r
\r
const INTRO_SECONDS = 1.6;\r
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
  gl.bindAttribLocation(program, 0, 'aPosition');\r
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
    if (info) uniforms[info.name.replace('[0]', '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
export const RippleGrid = ({\r
  color = '#ffffff',\r
  variant = 'lines',\r
  cellSize = 48,\r
  lineWidth = 1,\r
  glow = 0.6,\r
  rippleStrength = 1,\r
  rippleSpeed = 1,\r
  rippleSize = 1,\r
  autoRipple = 'center',\r
  rippleInterval = 2.6,\r
  tilt = 0,\r
  rotation = 0,\r
  mouseInteraction = true,\r
  clickRipple = true,\r
  intro = true,\r
  fade = 0.5,\r
  opacity = 1,\r
  lightMode = false,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  ...rest\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settings = {\r
    color: String(color),\r
    variant: VARIANTS[variant] ?? 0,\r
    cellSize: Math.max(8, cellSize),\r
    lineWidth: Math.max(0.25, lineWidth),\r
    glow: Math.max(0, glow),\r
    rippleStrength: Math.max(0, rippleStrength),\r
    rippleSpeed: Math.max(0.05, rippleSpeed),\r
    rippleSize: Math.max(0.2, rippleSize),\r
    autoRipple,\r
    rippleInterval: Math.max(0.3, rippleInterval),\r
    tilt: clamp(tilt, 0, 80),\r
    rotation,\r
    mouseInteraction,\r
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
    const buffer = gl.createBuffer();\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const colorCache = new Map();\r
    const toLinear = value => {\r
      if (colorCache.has(value)) return colorCache.get(value);\r
      let rgb = [1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#ffffff';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r, g, b].map(v => Math.pow(v / 255, 2.2));\r
      }\r
      colorCache.set(value, rgb);\r
      return rgb;\r
    };\r
\r
    const view = { width: 1, height: 1, ratio: 1 };\r
    const pointer = { x: 0, y: 0, inside: false, planeX: 0, planeY: 0, lastX: 0, lastY: 0, travel: 0 };\r
    const state = { clock: 0, intro: settingsRef.current.intro && !reduce ? 0 : 1, glow: 0, nextAuto: 0.4 };\r
    const ripples = [];\r
    const packed = new Float32Array(MAX_RIPPLES * 4);\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const focalOf = () => view.height * 1.15;\r
\r
    const toPlane = (x, y) => {\r
      const s = settingsRef.current;\r
      const sx = x - view.width / 2;\r
      const sy = y - view.height / 2;\r
      const tilt = (s.tilt * Math.PI) / 180;\r
      if (tilt <= 0.0001) return [sx, sy];\r
      const focal = focalOf();\r
      const depth = focal + sy * Math.tan(tilt);\r
      if (depth <= focal * 0.05) return null;\r
      const scale = focal / depth;\r
      return [sx * scale, (sy * scale) / Math.cos(tilt)];\r
    };\r
\r
    const spawn = (x, y, strength) => {\r
      ripples.push({ x, y, born: state.clock, strength });\r
      if (ripples.length > MAX_RIPPLES) ripples.shift();\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const presence = state.intro * state.intro * (3 - 2 * state.intro);\r
      const waveLength = s.cellSize * 2.4 * s.rippleSize;\r
      const waveSpeed = 240 * s.rippleSpeed;\r
      let count = 0;\r
      for (let i = ripples.length - 1; i >= 0 && count < MAX_RIPPLES; i--) {\r
        const r = ripples[i];\r
        const age = state.clock - r.born;\r
        packed[count * 4] = r.x;\r
        packed[count * 4 + 1] = r.y;\r
        packed[count * 4 + 2] = age;\r
        packed[count * 4 + 3] = r.strength * Math.exp(-age * 0.55);\r
        count++;\r
      }\r
      const angle = (s.rotation * Math.PI) / 180;\r
      const tint = toLinear(s.color);\r
      const tone = 0.2126 * tint[0] + 0.7152 * tint[1] + 0.0722 * tint[2];\r
      const depth = Math.min(1, 0.12 / Math.max(tone, 0.001));\r
      const ink = tint.map(v => Math.pow(Math.min(1, v * depth), 1 / 2.2));\r
      const diagonal = Math.hypot(view.width, view.height);\r
\r
      gl.bindVertexArray(vao);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(program.program);\r
      gl.uniform2f(u.uView, view.width, view.height);\r
      gl.uniform1f(u.uRatio, view.ratio);\r
      gl.uniform1f(u.uCell, s.cellSize);\r
      gl.uniform1f(u.uLineWidth, s.lineWidth);\r
      gl.uniform1f(u.uGlow, s.glow);\r
      gl.uniform1f(u.uTilt, (s.tilt * Math.PI) / 180);\r
      gl.uniform1f(u.uFocal, focalOf());\r
      gl.uniform2f(u.uTurn, Math.cos(angle), Math.sin(angle));\r
      gl.uniform4fv(u.uRipples, packed);\r
      gl.uniform1i(u.uRippleCount, count);\r
      gl.uniform1f(u.uWaveLength, waveLength);\r
      gl.uniform1f(u.uWaveSpeed, waveSpeed);\r
      gl.uniform1f(u.uStrength, s.rippleStrength);\r
      gl.uniform3f(u.uPointer, pointer.planeX, pointer.planeY, state.glow);\r
      gl.uniform3fv(\r
        u.uColor,\r
        tint.map(v => Math.pow(v, 1 / 2.2))\r
      );\r
      gl.uniform3fv(u.uInk, ink);\r
      gl.uniform1f(u.uPresence, Math.min(1, presence * 1.6));\r
      gl.uniform1f(u.uReveal, s.intro && !reduce ? presence * diagonal * 1.4 + s.cellSize * 4 : 1e6);\r
      gl.uniform1f(u.uFade, s.fade);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.uniform1f(u.uLightMode, s.lightMode ? 1 : 0);\r
      gl.uniform1i(u.uVariant, s.variant);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const moving = !s.paused && !reduce;\r
      if (moving) state.clock += dt;\r
      if (!s.intro || reduce) state.intro = 1;\r
      else if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / INTRO_SECONDS);\r
\r
      if (moving && s.autoRipple !== 'none' && state.clock >= state.nextAuto) {\r
        if (s.autoRipple === 'random') {\r
          const spot = toPlane(Math.random() * view.width, view.height * (0.2 + Math.random() * 0.7));\r
          if (spot) spawn(spot[0], spot[1], 0.75);\r
        } else {\r
          spawn(0, 0, 1);\r
        }\r
        state.nextAuto = state.clock + s.rippleInterval;\r
      }\r
      const lifetime = 9 / Math.max(0.2, s.rippleSpeed);\r
      while (ripples.length && state.clock - ripples[0].born > lifetime) ripples.shift();\r
\r
      const engaged = s.mouseInteraction && pointer.inside && !reduce;\r
      state.glow += ((engaged ? 1 : 0) - state.glow) * (1 - Math.exp(-dt * (engaged ? 6 : 2.5)));\r
      render();\r
\r
      const settling = state.intro < 1 || Math.abs((engaged ? 1 : 0) - state.glow) > 0.002;\r
      if (moving || settling) raf = requestAnimationFrame(frame);\r
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
      if (!raf) render();\r
      wake();\r
    };\r
\r
    const onPointerMove = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      const spot = pointer.inside ? toPlane(x, y) : null;\r
      if (spot) {\r
        const s = settingsRef.current;\r
        const step = Math.hypot(spot[0] - pointer.planeX, spot[1] - pointer.planeY);\r
        pointer.planeX = spot[0];\r
        pointer.planeY = spot[1];\r
        if (s.mouseInteraction && !reduce && step < s.cellSize * 6) {\r
          pointer.travel += step;\r
          if (pointer.travel > s.cellSize * 1.6) {\r
            pointer.travel = 0;\r
            spawn(spot[0], spot[1], 0.32);\r
          }\r
        }\r
      } else {\r
        pointer.inside = false;\r
      }\r
      pointer.x = x;\r
      pointer.y = y;\r
      wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      if (!s.clickRipple || reduce) return;\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;\r
      const spot = toPlane(x, y);\r
      if (spot) spawn(spot[0], spot[1], 1.2);\r
      wake();\r
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
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    if (settingsRef.current.intro && !reduce) spawn(0, 0, 1.1);\r
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
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteProgram(program.program);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
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
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default RippleGrid;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, type HTMLAttributes } from 'react';\r
import './RippleGrid.css';\r
\r
export type RippleGridVariant = 'lines' | 'dots' | 'cross';\r
export type RippleGridAutoRipple = 'center' | 'random' | 'none';\r
\r
export interface RippleGridProps extends HTMLAttributes<HTMLDivElement> {\r
  color?: string;\r
  variant?: RippleGridVariant;\r
  cellSize?: number;\r
  lineWidth?: number;\r
  glow?: number;\r
  rippleStrength?: number;\r
  rippleSpeed?: number;\r
  rippleSize?: number;\r
  autoRipple?: RippleGridAutoRipple;\r
  rippleInterval?: number;\r
  tilt?: number;\r
  rotation?: number;\r
  mouseInteraction?: boolean;\r
  clickRipple?: boolean;\r
  intro?: boolean;\r
  fade?: number;\r
  opacity?: number;\r
  lightMode?: boolean;\r
  paused?: boolean;\r
  dpr?: number;\r
}\r
\r
type Settings = {\r
  color: string;\r
  variant: number;\r
  cellSize: number;\r
  lineWidth: number;\r
  glow: number;\r
  rippleStrength: number;\r
  rippleSpeed: number;\r
  rippleSize: number;\r
  autoRipple: RippleGridAutoRipple;\r
  rippleInterval: number;\r
  tilt: number;\r
  rotation: number;\r
  mouseInteraction: boolean;\r
  clickRipple: boolean;\r
  intro: boolean;\r
  fade: number;\r
  opacity: number;\r
  lightMode: boolean;\r
  paused: boolean;\r
  dpr?: number;\r
};\r
\r
type Ripple = { x: number; y: number; born: number; strength: number };\r
\r
type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };\r
\r
const MAX_RIPPLES = 12;\r
const VARIANTS: Record<string, number> = { lines: 0, dots: 1, cross: 2 };\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform vec2 uView;\r
uniform float uRatio;\r
uniform float uCell;\r
uniform float uLineWidth;\r
uniform float uGlow;\r
uniform float uTilt;\r
uniform float uFocal;\r
uniform vec2 uTurn;\r
uniform vec4 uRipples[\${MAX_RIPPLES}];\r
uniform int uRippleCount;\r
uniform float uWaveLength;\r
uniform float uWaveSpeed;\r
uniform float uStrength;\r
uniform vec3 uPointer;\r
uniform vec3 uColor;\r
uniform vec3 uInk;\r
uniform float uPresence;\r
uniform float uReveal;\r
uniform float uFade;\r
uniform float uOpacity;\r
uniform float uLightMode;\r
uniform int uVariant;\r
out vec4 outColor;\r
\r
float smootherstep(float edge, float x) {\r
  float t = clamp(x / max(edge, 0.0001), 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
void main() {\r
  vec2 css = gl_FragCoord.xy / uRatio;\r
  vec2 screen = vec2(css.x - uView.x * 0.5, uView.y * 0.5 - css.y);\r
  vec2 plane = screen;\r
  float horizon = 1.0;\r
  if (uTilt > 0.0001) {\r
    float depth = uFocal + screen.y * tan(uTilt);\r
    horizon = smoothstep(0.0, uFocal * 0.35, depth);\r
    float scale = uFocal / max(depth, 0.001);\r
    plane = vec2(screen.x * scale, screen.y * scale / cos(uTilt));\r
  }\r
\r
  vec2 push = vec2(0.0);\r
  float lift = 0.0;\r
  for (int i = 0; i < \${MAX_RIPPLES}; i++) {\r
    if (i >= uRippleCount) break;\r
    vec4 ripple = uRipples[i];\r
    vec2 delta = plane - ripple.xy;\r
    float dist = length(delta);\r
    float x = (dist - ripple.z * uWaveSpeed) / uWaveLength;\r
    float packet = exp(-x * x * 1.8);\r
    float spread = 1.0 / (1.0 + dist / (uWaveLength * 5.0));\r
    float calm = smoothstep(0.0, uWaveLength * 0.9, dist);\r
    float wave = sin(x * 6.28318) * packet * spread * calm * ripple.w;\r
    push += (dist > 0.001 ? delta / dist : vec2(0.0)) * wave;\r
    lift += wave;\r
  }\r
\r
  vec2 bent = plane + push * uStrength * uCell * 0.22;\r
  vec2 grid = mat2(uTurn.x, uTurn.y, -uTurn.y, uTurn.x) * bent / uCell;\r
  vec2 fw = max(fwidth(grid), vec2(0.00001));\r
  vec2 offset = abs(fract(grid - 0.5) - 0.5);\r
  vec2 dist = offset / fw;\r
  float width = max(uLineWidth * uRatio, 1.0);\r
  float thin = min(uLineWidth * uRatio, 1.0);\r
  float shape = 0.0;\r
  float edge = min(dist.x, dist.y);\r
  if (uVariant == 1) {\r
    edge = length(dist);\r
    shape = (1.0 - smoothstep(width * 1.7 - 0.5, width * 1.7 + 0.5, edge)) * thin * 1.8;\r
  } else if (uVariant == 2) {\r
    float arm = 0.16;\r
    vec2 cover = (1.0 - smoothstep(width * 0.5 - 0.5, width * 0.5 + 0.5, dist)) * thin;\r
    vec2 reach = 1.0 - smoothstep(arm - fw * 0.5, arm + fw * 0.5, offset);\r
    shape = max(cover.x * reach.y, cover.y * reach.x);\r
    edge = max(min(dist.x, dist.y), length(max(offset - arm, 0.0) / fw));\r
  } else {\r
    vec2 cover = (1.0 - smoothstep(width * 0.5 - 0.5, width * 0.5 + 0.5, dist)) * thin;\r
    shape = max(cover.x, cover.y);\r
  }\r
  float halo = exp(-edge / (uRatio * 2.4)) * uGlow;\r
  float far = 1.0 - smoothstep(0.18, 0.5, max(fw.x, fw.y));\r
\r
  vec2 toPointer = (plane - uPointer.xy) / (uCell * 3.2);\r
  float near = uPointer.z * exp(-dot(toPointer, toPointer));\r
  float shine = max(1.0 + lift * 3.4 * uStrength, 0.25) * (1.0 + near * 1.6);\r
\r
  float radius = length(plane);\r
  float reveal = 1.0 - smoothstep(uReveal - uCell * 4.0, uReveal, radius);\r
  vec2 uv = gl_FragCoord.xy / (uView * uRatio);\r
  float edgeFade = uFade * 0.5;\r
  float mask = smootherstep(edgeFade, uv.x) * smootherstep(edgeFade, 1.0 - uv.x) * smootherstep(edgeFade, uv.y) * smootherstep(edgeFade, 1.0 - uv.y);\r
  mask *= horizon * far * reveal * uPresence * uOpacity;\r
\r
  float level = (shape * 0.26 + halo * 0.1) * shine * mask;\r
  float dither = (hash(gl_FragCoord.xy) - 0.5) / 255.0;\r
  if (uLightMode > 0.5) {\r
    float alpha = clamp(level * 1.2 + dither, 0.0, 1.0);\r
    outColor = vec4(uInk * alpha, alpha);\r
  } else {\r
    float alpha = clamp(level + dither, 0.0, 1.0);\r
    vec3 color = mix(uColor, vec3(1.0), clamp(level - 0.7, 0.0, 1.0));\r
    outColor = vec4(color * alpha, alpha);\r
  }\r
}\`;\r
\r
const INTRO_SECONDS = 1.6;\r
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
  gl.bindAttribLocation(program, 0, 'aPosition');\r
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
    if (info) uniforms[info.name.replace('[0]', '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
export const RippleGrid = ({\r
  color = '#ffffff',\r
  variant = 'lines',\r
  cellSize = 48,\r
  lineWidth = 1,\r
  glow = 0.6,\r
  rippleStrength = 1,\r
  rippleSpeed = 1,\r
  rippleSize = 1,\r
  autoRipple = 'center',\r
  rippleInterval = 2.6,\r
  tilt = 0,\r
  rotation = 0,\r
  mouseInteraction = true,\r
  clickRipple = true,\r
  intro = true,\r
  fade = 0.5,\r
  opacity = 1,\r
  lightMode = false,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  ...rest\r
}: RippleGridProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings: Settings = {\r
    color: String(color),\r
    variant: VARIANTS[variant] ?? 0,\r
    cellSize: Math.max(8, cellSize),\r
    lineWidth: Math.max(0.25, lineWidth),\r
    glow: Math.max(0, glow),\r
    rippleStrength: Math.max(0, rippleStrength),\r
    rippleSpeed: Math.max(0.05, rippleSpeed),\r
    rippleSize: Math.max(0.2, rippleSize),\r
    autoRipple,\r
    rippleInterval: Math.max(0.3, rippleInterval),\r
    tilt: clamp(tilt, 0, 80),\r
    rotation,\r
    mouseInteraction,\r
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
    const buffer = gl.createBuffer();\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const colorCache = new Map<string, number[]>();\r
    const toLinear = (value: string): number[] => {\r
      const cached = colorCache.get(value);\r
      if (cached) return cached;\r
      let rgb = [1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#ffffff';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r, g, b].map(v => Math.pow(v / 255, 2.2));\r
      }\r
      colorCache.set(value, rgb);\r
      return rgb;\r
    };\r
\r
    const view = { width: 1, height: 1, ratio: 1 };\r
    const pointer = { x: 0, y: 0, inside: false, planeX: 0, planeY: 0, lastX: 0, lastY: 0, travel: 0 };\r
    const state = { clock: 0, intro: settingsRef.current.intro && !reduce ? 0 : 1, glow: 0, nextAuto: 0.4 };\r
    const ripples: Ripple[] = [];\r
    const packed = new Float32Array(MAX_RIPPLES * 4);\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const focalOf = () => view.height * 1.15;\r
\r
    const toPlane = (x: number, y: number): [number, number] | null => {\r
      const s = settingsRef.current;\r
      const sx = x - view.width / 2;\r
      const sy = y - view.height / 2;\r
      const tilt = (s.tilt * Math.PI) / 180;\r
      if (tilt <= 0.0001) return [sx, sy];\r
      const focal = focalOf();\r
      const depth = focal + sy * Math.tan(tilt);\r
      if (depth <= focal * 0.05) return null;\r
      const scale = focal / depth;\r
      return [sx * scale, (sy * scale) / Math.cos(tilt)];\r
    };\r
\r
    const spawn = (x: number, y: number, strength: number) => {\r
      ripples.push({ x, y, born: state.clock, strength });\r
      if (ripples.length > MAX_RIPPLES) ripples.shift();\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const presence = state.intro * state.intro * (3 - 2 * state.intro);\r
      const waveLength = s.cellSize * 2.4 * s.rippleSize;\r
      const waveSpeed = 240 * s.rippleSpeed;\r
      let count = 0;\r
      for (let i = ripples.length - 1; i >= 0 && count < MAX_RIPPLES; i--) {\r
        const r = ripples[i];\r
        const age = state.clock - r.born;\r
        packed[count * 4] = r.x;\r
        packed[count * 4 + 1] = r.y;\r
        packed[count * 4 + 2] = age;\r
        packed[count * 4 + 3] = r.strength * Math.exp(-age * 0.55);\r
        count++;\r
      }\r
      const angle = (s.rotation * Math.PI) / 180;\r
      const tint = toLinear(s.color);\r
      const tone = 0.2126 * tint[0] + 0.7152 * tint[1] + 0.0722 * tint[2];\r
      const depth = Math.min(1, 0.12 / Math.max(tone, 0.001));\r
      const ink = tint.map(v => Math.pow(Math.min(1, v * depth), 1 / 2.2));\r
      const diagonal = Math.hypot(view.width, view.height);\r
\r
      gl.bindVertexArray(vao);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(program.program);\r
      gl.uniform2f(u.uView, view.width, view.height);\r
      gl.uniform1f(u.uRatio, view.ratio);\r
      gl.uniform1f(u.uCell, s.cellSize);\r
      gl.uniform1f(u.uLineWidth, s.lineWidth);\r
      gl.uniform1f(u.uGlow, s.glow);\r
      gl.uniform1f(u.uTilt, (s.tilt * Math.PI) / 180);\r
      gl.uniform1f(u.uFocal, focalOf());\r
      gl.uniform2f(u.uTurn, Math.cos(angle), Math.sin(angle));\r
      gl.uniform4fv(u.uRipples, packed);\r
      gl.uniform1i(u.uRippleCount, count);\r
      gl.uniform1f(u.uWaveLength, waveLength);\r
      gl.uniform1f(u.uWaveSpeed, waveSpeed);\r
      gl.uniform1f(u.uStrength, s.rippleStrength);\r
      gl.uniform3f(u.uPointer, pointer.planeX, pointer.planeY, state.glow);\r
      gl.uniform3fv(\r
        u.uColor,\r
        tint.map(v => Math.pow(v, 1 / 2.2))\r
      );\r
      gl.uniform3fv(u.uInk, ink);\r
      gl.uniform1f(u.uPresence, Math.min(1, presence * 1.6));\r
      gl.uniform1f(u.uReveal, s.intro && !reduce ? presence * diagonal * 1.4 + s.cellSize * 4 : 1e6);\r
      gl.uniform1f(u.uFade, s.fade);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.uniform1f(u.uLightMode, s.lightMode ? 1 : 0);\r
      gl.uniform1i(u.uVariant, s.variant);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const moving = !s.paused && !reduce;\r
      if (moving) state.clock += dt;\r
      if (!s.intro || reduce) state.intro = 1;\r
      else if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / INTRO_SECONDS);\r
\r
      if (moving && s.autoRipple !== 'none' && state.clock >= state.nextAuto) {\r
        if (s.autoRipple === 'random') {\r
          const spot = toPlane(Math.random() * view.width, view.height * (0.2 + Math.random() * 0.7));\r
          if (spot) spawn(spot[0], spot[1], 0.75);\r
        } else {\r
          spawn(0, 0, 1);\r
        }\r
        state.nextAuto = state.clock + s.rippleInterval;\r
      }\r
      const lifetime = 9 / Math.max(0.2, s.rippleSpeed);\r
      while (ripples.length && state.clock - ripples[0].born > lifetime) ripples.shift();\r
\r
      const engaged = s.mouseInteraction && pointer.inside && !reduce;\r
      state.glow += ((engaged ? 1 : 0) - state.glow) * (1 - Math.exp(-dt * (engaged ? 6 : 2.5)));\r
      render();\r
\r
      const settling = state.intro < 1 || Math.abs((engaged ? 1 : 0) - state.glow) > 0.002;\r
      if (moving || settling) raf = requestAnimationFrame(frame);\r
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
      if (!raf) render();\r
      wake();\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      const spot = pointer.inside ? toPlane(x, y) : null;\r
      if (spot) {\r
        const s = settingsRef.current;\r
        const step = Math.hypot(spot[0] - pointer.planeX, spot[1] - pointer.planeY);\r
        pointer.planeX = spot[0];\r
        pointer.planeY = spot[1];\r
        if (s.mouseInteraction && !reduce && step < s.cellSize * 6) {\r
          pointer.travel += step;\r
          if (pointer.travel > s.cellSize * 1.6) {\r
            pointer.travel = 0;\r
            spawn(spot[0], spot[1], 0.32);\r
          }\r
        }\r
      } else {\r
        pointer.inside = false;\r
      }\r
      pointer.x = x;\r
      pointer.y = y;\r
      wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      if (!s.clickRipple || reduce) return;\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;\r
      const spot = toPlane(x, y);\r
      if (spot) spawn(spot[0], spot[1], 1.2);\r
      wake();\r
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
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    if (settingsRef.current.intro && !reduce) spawn(0, 0, 1.1);\r
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
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteProgram(program.program);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div ref={containerRef} className={\`ripple-grid-container\${className ? \` \${className}\` : ''}\`} {...rest}>\r
      <canvas ref={canvasRef} className="ripple-grid-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default RippleGrid;\r
`,o=`'use client';\r
\r
import { useEffect, useRef, type HTMLAttributes } from 'react';\r
\r
export type RippleGridVariant = 'lines' | 'dots' | 'cross';\r
export type RippleGridAutoRipple = 'center' | 'random' | 'none';\r
\r
export interface RippleGridProps extends HTMLAttributes<HTMLDivElement> {\r
  color?: string;\r
  variant?: RippleGridVariant;\r
  cellSize?: number;\r
  lineWidth?: number;\r
  glow?: number;\r
  rippleStrength?: number;\r
  rippleSpeed?: number;\r
  rippleSize?: number;\r
  autoRipple?: RippleGridAutoRipple;\r
  rippleInterval?: number;\r
  tilt?: number;\r
  rotation?: number;\r
  mouseInteraction?: boolean;\r
  clickRipple?: boolean;\r
  intro?: boolean;\r
  fade?: number;\r
  opacity?: number;\r
  lightMode?: boolean;\r
  paused?: boolean;\r
  dpr?: number;\r
}\r
\r
type Settings = {\r
  color: string;\r
  variant: number;\r
  cellSize: number;\r
  lineWidth: number;\r
  glow: number;\r
  rippleStrength: number;\r
  rippleSpeed: number;\r
  rippleSize: number;\r
  autoRipple: RippleGridAutoRipple;\r
  rippleInterval: number;\r
  tilt: number;\r
  rotation: number;\r
  mouseInteraction: boolean;\r
  clickRipple: boolean;\r
  intro: boolean;\r
  fade: number;\r
  opacity: number;\r
  lightMode: boolean;\r
  paused: boolean;\r
  dpr?: number;\r
};\r
\r
type Ripple = { x: number; y: number; born: number; strength: number };\r
\r
type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };\r
\r
const MAX_RIPPLES = 12;\r
const VARIANTS: Record<string, number> = { lines: 0, dots: 1, cross: 2 };\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform vec2 uView;\r
uniform float uRatio;\r
uniform float uCell;\r
uniform float uLineWidth;\r
uniform float uGlow;\r
uniform float uTilt;\r
uniform float uFocal;\r
uniform vec2 uTurn;\r
uniform vec4 uRipples[\${MAX_RIPPLES}];\r
uniform int uRippleCount;\r
uniform float uWaveLength;\r
uniform float uWaveSpeed;\r
uniform float uStrength;\r
uniform vec3 uPointer;\r
uniform vec3 uColor;\r
uniform vec3 uInk;\r
uniform float uPresence;\r
uniform float uReveal;\r
uniform float uFade;\r
uniform float uOpacity;\r
uniform float uLightMode;\r
uniform int uVariant;\r
out vec4 outColor;\r
\r
float smootherstep(float edge, float x) {\r
  float t = clamp(x / max(edge, 0.0001), 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
void main() {\r
  vec2 css = gl_FragCoord.xy / uRatio;\r
  vec2 screen = vec2(css.x - uView.x * 0.5, uView.y * 0.5 - css.y);\r
  vec2 plane = screen;\r
  float horizon = 1.0;\r
  if (uTilt > 0.0001) {\r
    float depth = uFocal + screen.y * tan(uTilt);\r
    horizon = smoothstep(0.0, uFocal * 0.35, depth);\r
    float scale = uFocal / max(depth, 0.001);\r
    plane = vec2(screen.x * scale, screen.y * scale / cos(uTilt));\r
  }\r
\r
  vec2 push = vec2(0.0);\r
  float lift = 0.0;\r
  for (int i = 0; i < \${MAX_RIPPLES}; i++) {\r
    if (i >= uRippleCount) break;\r
    vec4 ripple = uRipples[i];\r
    vec2 delta = plane - ripple.xy;\r
    float dist = length(delta);\r
    float x = (dist - ripple.z * uWaveSpeed) / uWaveLength;\r
    float packet = exp(-x * x * 1.8);\r
    float spread = 1.0 / (1.0 + dist / (uWaveLength * 5.0));\r
    float calm = smoothstep(0.0, uWaveLength * 0.9, dist);\r
    float wave = sin(x * 6.28318) * packet * spread * calm * ripple.w;\r
    push += (dist > 0.001 ? delta / dist : vec2(0.0)) * wave;\r
    lift += wave;\r
  }\r
\r
  vec2 bent = plane + push * uStrength * uCell * 0.22;\r
  vec2 grid = mat2(uTurn.x, uTurn.y, -uTurn.y, uTurn.x) * bent / uCell;\r
  vec2 fw = max(fwidth(grid), vec2(0.00001));\r
  vec2 offset = abs(fract(grid - 0.5) - 0.5);\r
  vec2 dist = offset / fw;\r
  float width = max(uLineWidth * uRatio, 1.0);\r
  float thin = min(uLineWidth * uRatio, 1.0);\r
  float shape = 0.0;\r
  float edge = min(dist.x, dist.y);\r
  if (uVariant == 1) {\r
    edge = length(dist);\r
    shape = (1.0 - smoothstep(width * 1.7 - 0.5, width * 1.7 + 0.5, edge)) * thin * 1.8;\r
  } else if (uVariant == 2) {\r
    float arm = 0.16;\r
    vec2 cover = (1.0 - smoothstep(width * 0.5 - 0.5, width * 0.5 + 0.5, dist)) * thin;\r
    vec2 reach = 1.0 - smoothstep(arm - fw * 0.5, arm + fw * 0.5, offset);\r
    shape = max(cover.x * reach.y, cover.y * reach.x);\r
    edge = max(min(dist.x, dist.y), length(max(offset - arm, 0.0) / fw));\r
  } else {\r
    vec2 cover = (1.0 - smoothstep(width * 0.5 - 0.5, width * 0.5 + 0.5, dist)) * thin;\r
    shape = max(cover.x, cover.y);\r
  }\r
  float halo = exp(-edge / (uRatio * 2.4)) * uGlow;\r
  float far = 1.0 - smoothstep(0.18, 0.5, max(fw.x, fw.y));\r
\r
  vec2 toPointer = (plane - uPointer.xy) / (uCell * 3.2);\r
  float near = uPointer.z * exp(-dot(toPointer, toPointer));\r
  float shine = max(1.0 + lift * 3.4 * uStrength, 0.25) * (1.0 + near * 1.6);\r
\r
  float radius = length(plane);\r
  float reveal = 1.0 - smoothstep(uReveal - uCell * 4.0, uReveal, radius);\r
  vec2 uv = gl_FragCoord.xy / (uView * uRatio);\r
  float edgeFade = uFade * 0.5;\r
  float mask = smootherstep(edgeFade, uv.x) * smootherstep(edgeFade, 1.0 - uv.x) * smootherstep(edgeFade, uv.y) * smootherstep(edgeFade, 1.0 - uv.y);\r
  mask *= horizon * far * reveal * uPresence * uOpacity;\r
\r
  float level = (shape * 0.26 + halo * 0.1) * shine * mask;\r
  float dither = (hash(gl_FragCoord.xy) - 0.5) / 255.0;\r
  if (uLightMode > 0.5) {\r
    float alpha = clamp(level * 1.2 + dither, 0.0, 1.0);\r
    outColor = vec4(uInk * alpha, alpha);\r
  } else {\r
    float alpha = clamp(level + dither, 0.0, 1.0);\r
    vec3 color = mix(uColor, vec3(1.0), clamp(level - 0.7, 0.0, 1.0));\r
    outColor = vec4(color * alpha, alpha);\r
  }\r
}\`;\r
\r
const INTRO_SECONDS = 1.6;\r
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
  gl.bindAttribLocation(program, 0, 'aPosition');\r
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
    if (info) uniforms[info.name.replace('[0]', '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
export const RippleGrid = ({\r
  color = '#ffffff',\r
  variant = 'lines',\r
  cellSize = 48,\r
  lineWidth = 1,\r
  glow = 0.6,\r
  rippleStrength = 1,\r
  rippleSpeed = 1,\r
  rippleSize = 1,\r
  autoRipple = 'center',\r
  rippleInterval = 2.6,\r
  tilt = 0,\r
  rotation = 0,\r
  mouseInteraction = true,\r
  clickRipple = true,\r
  intro = true,\r
  fade = 0.5,\r
  opacity = 1,\r
  lightMode = false,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  ...rest\r
}: RippleGridProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings: Settings = {\r
    color: String(color),\r
    variant: VARIANTS[variant] ?? 0,\r
    cellSize: Math.max(8, cellSize),\r
    lineWidth: Math.max(0.25, lineWidth),\r
    glow: Math.max(0, glow),\r
    rippleStrength: Math.max(0, rippleStrength),\r
    rippleSpeed: Math.max(0.05, rippleSpeed),\r
    rippleSize: Math.max(0.2, rippleSize),\r
    autoRipple,\r
    rippleInterval: Math.max(0.3, rippleInterval),\r
    tilt: clamp(tilt, 0, 80),\r
    rotation,\r
    mouseInteraction,\r
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
    const buffer = gl.createBuffer();\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const colorCache = new Map<string, number[]>();\r
    const toLinear = (value: string): number[] => {\r
      const cached = colorCache.get(value);\r
      if (cached) return cached;\r
      let rgb = [1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#ffffff';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r, g, b].map(v => Math.pow(v / 255, 2.2));\r
      }\r
      colorCache.set(value, rgb);\r
      return rgb;\r
    };\r
\r
    const view = { width: 1, height: 1, ratio: 1 };\r
    const pointer = { x: 0, y: 0, inside: false, planeX: 0, planeY: 0, lastX: 0, lastY: 0, travel: 0 };\r
    const state = { clock: 0, intro: settingsRef.current.intro && !reduce ? 0 : 1, glow: 0, nextAuto: 0.4 };\r
    const ripples: Ripple[] = [];\r
    const packed = new Float32Array(MAX_RIPPLES * 4);\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const focalOf = () => view.height * 1.15;\r
\r
    const toPlane = (x: number, y: number): [number, number] | null => {\r
      const s = settingsRef.current;\r
      const sx = x - view.width / 2;\r
      const sy = y - view.height / 2;\r
      const tilt = (s.tilt * Math.PI) / 180;\r
      if (tilt <= 0.0001) return [sx, sy];\r
      const focal = focalOf();\r
      const depth = focal + sy * Math.tan(tilt);\r
      if (depth <= focal * 0.05) return null;\r
      const scale = focal / depth;\r
      return [sx * scale, (sy * scale) / Math.cos(tilt)];\r
    };\r
\r
    const spawn = (x: number, y: number, strength: number) => {\r
      ripples.push({ x, y, born: state.clock, strength });\r
      if (ripples.length > MAX_RIPPLES) ripples.shift();\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const presence = state.intro * state.intro * (3 - 2 * state.intro);\r
      const waveLength = s.cellSize * 2.4 * s.rippleSize;\r
      const waveSpeed = 240 * s.rippleSpeed;\r
      let count = 0;\r
      for (let i = ripples.length - 1; i >= 0 && count < MAX_RIPPLES; i--) {\r
        const r = ripples[i];\r
        const age = state.clock - r.born;\r
        packed[count * 4] = r.x;\r
        packed[count * 4 + 1] = r.y;\r
        packed[count * 4 + 2] = age;\r
        packed[count * 4 + 3] = r.strength * Math.exp(-age * 0.55);\r
        count++;\r
      }\r
      const angle = (s.rotation * Math.PI) / 180;\r
      const tint = toLinear(s.color);\r
      const tone = 0.2126 * tint[0] + 0.7152 * tint[1] + 0.0722 * tint[2];\r
      const depth = Math.min(1, 0.12 / Math.max(tone, 0.001));\r
      const ink = tint.map(v => Math.pow(Math.min(1, v * depth), 1 / 2.2));\r
      const diagonal = Math.hypot(view.width, view.height);\r
\r
      gl.bindVertexArray(vao);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(program.program);\r
      gl.uniform2f(u.uView, view.width, view.height);\r
      gl.uniform1f(u.uRatio, view.ratio);\r
      gl.uniform1f(u.uCell, s.cellSize);\r
      gl.uniform1f(u.uLineWidth, s.lineWidth);\r
      gl.uniform1f(u.uGlow, s.glow);\r
      gl.uniform1f(u.uTilt, (s.tilt * Math.PI) / 180);\r
      gl.uniform1f(u.uFocal, focalOf());\r
      gl.uniform2f(u.uTurn, Math.cos(angle), Math.sin(angle));\r
      gl.uniform4fv(u.uRipples, packed);\r
      gl.uniform1i(u.uRippleCount, count);\r
      gl.uniform1f(u.uWaveLength, waveLength);\r
      gl.uniform1f(u.uWaveSpeed, waveSpeed);\r
      gl.uniform1f(u.uStrength, s.rippleStrength);\r
      gl.uniform3f(u.uPointer, pointer.planeX, pointer.planeY, state.glow);\r
      gl.uniform3fv(\r
        u.uColor,\r
        tint.map(v => Math.pow(v, 1 / 2.2))\r
      );\r
      gl.uniform3fv(u.uInk, ink);\r
      gl.uniform1f(u.uPresence, Math.min(1, presence * 1.6));\r
      gl.uniform1f(u.uReveal, s.intro && !reduce ? presence * diagonal * 1.4 + s.cellSize * 4 : 1e6);\r
      gl.uniform1f(u.uFade, s.fade);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.uniform1f(u.uLightMode, s.lightMode ? 1 : 0);\r
      gl.uniform1i(u.uVariant, s.variant);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const moving = !s.paused && !reduce;\r
      if (moving) state.clock += dt;\r
      if (!s.intro || reduce) state.intro = 1;\r
      else if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / INTRO_SECONDS);\r
\r
      if (moving && s.autoRipple !== 'none' && state.clock >= state.nextAuto) {\r
        if (s.autoRipple === 'random') {\r
          const spot = toPlane(Math.random() * view.width, view.height * (0.2 + Math.random() * 0.7));\r
          if (spot) spawn(spot[0], spot[1], 0.75);\r
        } else {\r
          spawn(0, 0, 1);\r
        }\r
        state.nextAuto = state.clock + s.rippleInterval;\r
      }\r
      const lifetime = 9 / Math.max(0.2, s.rippleSpeed);\r
      while (ripples.length && state.clock - ripples[0].born > lifetime) ripples.shift();\r
\r
      const engaged = s.mouseInteraction && pointer.inside && !reduce;\r
      state.glow += ((engaged ? 1 : 0) - state.glow) * (1 - Math.exp(-dt * (engaged ? 6 : 2.5)));\r
      render();\r
\r
      const settling = state.intro < 1 || Math.abs((engaged ? 1 : 0) - state.glow) > 0.002;\r
      if (moving || settling) raf = requestAnimationFrame(frame);\r
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
      if (!raf) render();\r
      wake();\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      const spot = pointer.inside ? toPlane(x, y) : null;\r
      if (spot) {\r
        const s = settingsRef.current;\r
        const step = Math.hypot(spot[0] - pointer.planeX, spot[1] - pointer.planeY);\r
        pointer.planeX = spot[0];\r
        pointer.planeY = spot[1];\r
        if (s.mouseInteraction && !reduce && step < s.cellSize * 6) {\r
          pointer.travel += step;\r
          if (pointer.travel > s.cellSize * 1.6) {\r
            pointer.travel = 0;\r
            spawn(spot[0], spot[1], 0.32);\r
          }\r
        }\r
      } else {\r
        pointer.inside = false;\r
      }\r
      pointer.x = x;\r
      pointer.y = y;\r
      wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      if (!s.clickRipple || reduce) return;\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;\r
      const spot = toPlane(x, y);\r
      if (spot) spawn(spot[0], spot[1], 1.2);\r
      wake();\r
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
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    if (settingsRef.current.intro && !reduce) spawn(0, 0, 1.1);\r
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
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteProgram(program.program);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
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
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default RippleGrid;\r
`,i={usage:`import RippleGrid from './RippleGrid';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <RippleGrid color="#ffffff" cellSize={48} rippleStrength={1} autoRipple="center" />
</div>`,code:n,css:r,tailwind:e,tsCode:t,tsTailwind:o};export{i as rippleGrid};
