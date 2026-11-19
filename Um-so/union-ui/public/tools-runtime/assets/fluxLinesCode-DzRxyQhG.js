const n=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
import './FluxLines.css';\r
\r
const MAX_COLORS = 8;\r
const INTRO_SECONDS = 1.8;\r
const FLOW = { up: [0, 1], down: [0, -1], left: [-1, 0], right: [1, 0] };\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const FIELD = \`\r
float hash(vec3 p3) {\r
  p3 = fract(p3 * 0.1031);\r
  p3 += dot(p3, p3.zyx + 33.33);\r
  return fract((p3.x + p3.y) * p3.z);\r
}\r
\r
float smin(float a, float b, float k) {\r
  float r = exp2(-a / k) + exp2(-b / k);\r
  return -k * log2(r);\r
}\r
\r
float sinlerp(float a, float b, float w) {\r
  return mix(a, b, (sin(w * 3.14159265 - 3.14159265 / 2.0) + 1.0) / 2.0);\r
}\r
\r
float vn(vec2 p, float s, float seed) {\r
  vec2 cellp = floor(p / s);\r
  vec2 relp = mod(p, s);\r
  float g1 = hash(vec3(cellp, seed));\r
  float g2 = hash(vec3(cellp.x + 1.0, cellp.y, seed));\r
  float g3 = hash(vec3(cellp.x + 1.0, cellp.y + 1.0, seed));\r
  float g4 = hash(vec3(cellp.x, cellp.y + 1.0, seed));\r
  float bx = sinlerp(g1, g2, relp.x / s);\r
  float tx = sinlerp(g4, g3, relp.x / s);\r
  return sinlerp(bx, tx, relp.y / s);\r
}\r
\r
float dbn(vec2 p, float s, float seed) {\r
  float o = s / 2.0;\r
  float n0 = vn(p, s, seed);\r
  float n1 = vn(p + vec2(o, o), s, seed + 0.1);\r
  float n2 = vn(p + vec2(-o, o), s, seed + 0.2);\r
  float n3 = vn(p + vec2(o, -o), s, seed + 0.3);\r
  float n4 = vn(p + vec2(-o, -o), s, seed + 0.4);\r
  return (2.0 * n0 + 1.5 * n1 + 1.25 * n2 + 1.125 * n3 + n4) / 7.0;\r
}\r
\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform vec2 uResolution;\r
uniform float uTime;\r
uniform vec2 uFlow;\r
uniform float uSpeed;\r
uniform float uScale;\r
uniform float uTurbulence;\r
uniform float uFluidity;\r
uniform float uRimWidth;\r
uniform float uSharpness;\r
uniform float uShimmer;\r
uniform float uGlow;\r
uniform float uLine;\r
uniform float uMaxHalf;\r
uniform vec3 uColors[\${MAX_COLORS}];\r
uniform int uColorCount;\r
uniform vec4 uMagnet;\r
uniform vec4 uSwirl;\r
uniform float uReveal;\r
uniform float uLight;\r
uniform float uOpaque;\r
uniform vec3 uBackground;\r
uniform float uOpacity;\r
out vec4 outColor;\r
\${FIELD}\r
\r
vec3 palette(float h) {\r
  float x = clamp(h, 0.0, 1.0) * float(uColorCount - 1);\r
  int i = int(floor(x));\r
  int j = min(i + 1, uColorCount - 1);\r
  return mix(uColors[i], uColors[j], smoothstep(0.0, 1.0, x - float(i)));\r
}\r
\r
void main() {\r
  float ref = 700.0 / max(uScale, 0.05);\r
  vec2 frag = gl_FragCoord.xy;\r
  vec2 toMagnet = (frag - uMagnet.xy) / uResolution.y;\r
  float pull = uMagnet.z * exp(-dot(toMagnet, toMagnet) / (uMagnet.w * uMagnet.w));\r
  if (pull > 0.001) {\r
    float angle = pull * 0.55;\r
    float c = cos(angle);\r
    float s = sin(angle);\r
    frag = uMagnet.xy + mat2(c, s, -s, c) * (frag - uMagnet.xy);\r
  }\r
  if (uSwirl.w > 0.0) {\r
    vec2 d = frag - uSwirl.xy;\r
    float reach = uSwirl.z;\r
    float angle = uSwirl.w * exp(-dot(d, d) / (reach * reach));\r
    float c = cos(angle);\r
    float s = sin(angle);\r
    frag = uSwirl.xy + mat2(c, s, -s, c) * d;\r
  }\r
  vec2 p = frag / uResolution.y * ref;\r
\r
  float spd = 200.0 * uSpeed;\r
  float t = uTime;\r
  vec2 dir = uFlow;\r
  vec2 perp = vec2(-dir.y, dir.x);\r
  float distort1 = vn(p + perp * (t * spd), 60.0, 10.0) * 50.0 * uTurbulence;\r
  float distort2 = vn(p - perp * (t * spd), 120.0, 15.0) * 100.0 * uTurbulence;\r
  float peaks = dbn(p + distort1 + dir * (t * spd * 0.5), 40.0, 1.0);\r
  float peaks2 = dbn(p + distort2 - dir * (t * spd * 0.5), 40.0, 0.0);\r
  float field = smin(peaks, peaks2, max(uFluidity, 0.001));\r
\r
  float slope = length(vec2(dFdx(field), dFdy(field)));\r
  float gap = abs(field - 0.4);\r
  float pixels = gap / max(slope, 1e-6);\r
  float halfBand = max(uRimWidth, 0.001) * 0.5;\r
  float across = max(gap / halfBand, pixels / uMaxHalf);\r
  float band = 5.0 * uRimWidth * (1.0 - across);\r
  float reveal = smoothstep(0.2, 0.85, pull);\r
  float shimmer = vn(p + dir * (t * spd * 0.5), 60.0, 12.0) * uShimmer * (1.0 - reveal * 0.75);\r
  float lit = clamp(band - shimmer, 0.0, 1.0);\r
  float glow = pow(lit, uSharpness) * uGlow * (1.0 + reveal * 0.25);\r
  float core = uLine > 0.0 ? smoothstep(uLine + 0.75, uLine - 0.75, pixels) * max(smoothstep(0.08, 0.6, glow), reveal) : 0.0;\r
  float shine = clamp(glow, 0.0, 1.0);\r
  float energy = max(shine * shine, core * 0.85) * uReveal;\r
\r
  float h = clamp(0.5 + (peaks - peaks2) * 0.8, 0.0, 1.0);\r
  vec3 tint = palette(h);\r
\r
  if (uLight > 0.5) {\r
    float chroma = max(tint.r, max(tint.g, tint.b)) - min(tint.r, min(tint.g, tint.b));\r
    vec3 ink = mix(vec3(0.07, 0.07, 0.08), tint * 0.55, clamp(chroma * 1.6, 0.0, 1.0));\r
    float cover = energy * uOpacity;\r
    outColor = uOpaque > 0.5 ? vec4(mix(uBackground, ink, cover), 1.0) : vec4(ink * cover, cover);\r
    return;\r
  }\r
\r
  vec3 light = tint * energy * uOpacity;\r
  outColor = uOpaque > 0.5 ? vec4(uBackground + light, 1.0) : vec4(light, max(light.r, max(light.g, light.b)));\r
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
const FluxLines = ({\r
  colors = ['#ffffff', '#ffffff', '#ffffff'],\r
  speed = 0.5,\r
  scale = 1.6,\r
  turbulence = 1,\r
  fluidity = 0.1,\r
  rimWidth = 0.2,\r
  sharpness = 2.5,\r
  shimmer = 1.5,\r
  glow = 2,\r
  lineWidth = 1,\r
  flowDirection = 'down',\r
  opacity = 1,\r
  mouseInteraction = true,\r
  mouseStrength = 1,\r
  mouseRadius = 0.35,\r
  mouseDampening = 0.15,\r
  clickSwirl = true,\r
  intro = true,\r
  lightMode = false,\r
  transparent = true,\r
  backgroundColor,\r
  paused = false,\r
  dpr,\r
  mixBlendMode,\r
  className = '',\r
  style,\r
  ...rest\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settings = {\r
    colors: Array.isArray(colors) && colors.length ? colors.slice(0, MAX_COLORS) : ['#ffffff'],\r
    speed,\r
    scale: Math.max(0.05, scale),\r
    turbulence,\r
    fluidity: Math.max(0.001, fluidity),\r
    rimWidth: Math.max(0.001, rimWidth),\r
    sharpness: Math.max(0.1, sharpness),\r
    shimmer: Math.max(0, shimmer),\r
    glow: Math.max(0, glow),\r
    lineWidth: Math.max(0, lineWidth),\r
    flow: FLOW[flowDirection] ?? FLOW.down,\r
    opacity: clamp(opacity, 0, 1),\r
    mouseInteraction,\r
    mouseStrength: Math.max(0, mouseStrength),\r
    mouseRadius: Math.max(0.01, mouseRadius),\r
    mouseDampening: Math.max(0, mouseDampening),\r
    clickSwirl,\r
    intro,\r
    lightMode,\r
    transparent,\r
    backgroundColor,\r
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
    const cache = new Map();\r
    const parse = (value, fallback) => {\r
      if (!value) return fallback;\r
      const key = String(value);\r
      if (cache.has(key)) return cache.get(key);\r
      let rgb = fallback;\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#000000';\r
        probe.fillStyle = key;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      cache.set(key, rgb);\r
      return rgb;\r
    };\r
    const palette = new Float32Array(MAX_COLORS * 3);\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const magnet = { x: 0, y: 0, active: 0 };\r
    const swirl = { x: 0, y: 0, age: 10 };\r
    let time = 0;\r
    let reveal = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const ratio = canvas.width / Math.max(1, container.clientWidth);\r
      s.colors.forEach((value, index) => palette.set(parse(value, [1, 1, 1]), index * 3));\r
      const intro = Math.min(1, reveal);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(program.program);\r
      gl.bindVertexArray(vao);\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(u.uTime, time);\r
      gl.uniform2f(u.uFlow, s.flow[0], s.flow[1]);\r
      gl.uniform1f(u.uSpeed, s.speed);\r
      gl.uniform1f(u.uScale, s.scale);\r
      gl.uniform1f(u.uTurbulence, s.turbulence);\r
      gl.uniform1f(u.uFluidity, s.fluidity);\r
      gl.uniform1f(u.uRimWidth, s.rimWidth);\r
      gl.uniform1f(u.uSharpness, s.sharpness);\r
      gl.uniform1f(u.uShimmer, s.shimmer);\r
      gl.uniform1f(u.uGlow, s.glow);\r
      gl.uniform1f(u.uLine, s.lineWidth * ratio * 0.5);\r
      gl.uniform1f(u.uMaxHalf, 28 * ratio);\r
      gl.uniform3fv(u.uColors, palette);\r
      gl.uniform1i(u.uColorCount, s.colors.length);\r
      gl.uniform4f(u.uMagnet, magnet.x, magnet.y, magnet.active * s.mouseStrength, s.mouseRadius);\r
      const age = swirl.age;\r
      const twist = 1.9 * Math.min(1, age / 0.23) * Math.exp(-Math.max(0, age - 0.23) * 1.1);\r
      gl.uniform4f(u.uSwirl, swirl.x, swirl.y, canvas.height * 0.22 * (1 + age * 0.5), age < 6 ? twist : 0);\r
      gl.uniform1f(u.uReveal, intro * intro * (3 - 2 * intro));\r
      gl.uniform1f(u.uLight, s.lightMode ? 1 : 0);\r
      gl.uniform1f(u.uOpaque, s.transparent ? 0 : 1);\r
      gl.uniform3fv(u.uBackground, parse(s.backgroundColor, s.lightMode ? [1, 1, 1] : [0.0706, 0.0588, 0.0902]));\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.0005, 0.05) : 1 / 60;\r
      last = now;\r
      const motion = s.paused || reduce ? 0 : 1;\r
      time += dt * motion;\r
      swirl.age += dt;\r
      if (s.intro && !reduce && reveal < 1) reveal = Math.min(1, reveal + dt / INTRO_SECONDS);\r
      else if (!s.intro || reduce) reveal = 1;\r
\r
      const engaged = s.mouseInteraction && pointer.inside;\r
      const follow = s.mouseDampening > 0 ? 1 - Math.exp(-dt / s.mouseDampening) : 1;\r
      if (engaged) {\r
        magnet.x += (pointer.x - magnet.x) * follow;\r
        magnet.y += (pointer.y - magnet.y) * follow;\r
      }\r
      const target = engaged ? 1 : 0;\r
      magnet.active += (target - magnet.active) * (1 - Math.exp(-dt / 0.3));\r
      if (Math.abs(target - magnet.active) < 0.001) magnet.active = target;\r
\r
      render();\r
      const busy = motion > 0 || magnet.active !== target || reveal < 1 || swirl.age < 6;\r
      if (busy) raf = requestAnimationFrame(frame);\r
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
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      render();\r
      wake();\r
    };\r
\r
    const locate = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      const ratio = canvas.width / Math.max(1, rect.width);\r
      pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      pointer.x = x * ratio;\r
      pointer.y = (rect.height - y) * ratio;\r
    };\r
\r
    const onPointerMove = event => {\r
      const wasInside = pointer.inside;\r
      locate(event);\r
      if (pointer.inside && !wasInside && magnet.active < 0.05) {\r
        magnet.x = pointer.x;\r
        magnet.y = pointer.y;\r
      }\r
      wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      onPointerMove(event);\r
      if (!pointer.inside || !settingsRef.current.clickSwirl || reduce) return;\r
      swirl.x = pointer.x;\r
      swirl.y = pointer.y;\r
      swirl.age = 0;\r
      wake();\r
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
      className={\`flux-lines-container\${className ? \` \${className}\` : ''}\`}\r
      style={mixBlendMode ? { ...style, mixBlendMode } : style}\r
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className="flux-lines-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default FluxLines;\r
`,r=`.flux-lines-container {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.flux-lines-canvas {\r
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
const MAX_COLORS = 8;\r
const INTRO_SECONDS = 1.8;\r
const FLOW = { up: [0, 1], down: [0, -1], left: [-1, 0], right: [1, 0] };\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const FIELD = \`\r
float hash(vec3 p3) {\r
  p3 = fract(p3 * 0.1031);\r
  p3 += dot(p3, p3.zyx + 33.33);\r
  return fract((p3.x + p3.y) * p3.z);\r
}\r
\r
float smin(float a, float b, float k) {\r
  float r = exp2(-a / k) + exp2(-b / k);\r
  return -k * log2(r);\r
}\r
\r
float sinlerp(float a, float b, float w) {\r
  return mix(a, b, (sin(w * 3.14159265 - 3.14159265 / 2.0) + 1.0) / 2.0);\r
}\r
\r
float vn(vec2 p, float s, float seed) {\r
  vec2 cellp = floor(p / s);\r
  vec2 relp = mod(p, s);\r
  float g1 = hash(vec3(cellp, seed));\r
  float g2 = hash(vec3(cellp.x + 1.0, cellp.y, seed));\r
  float g3 = hash(vec3(cellp.x + 1.0, cellp.y + 1.0, seed));\r
  float g4 = hash(vec3(cellp.x, cellp.y + 1.0, seed));\r
  float bx = sinlerp(g1, g2, relp.x / s);\r
  float tx = sinlerp(g4, g3, relp.x / s);\r
  return sinlerp(bx, tx, relp.y / s);\r
}\r
\r
float dbn(vec2 p, float s, float seed) {\r
  float o = s / 2.0;\r
  float n0 = vn(p, s, seed);\r
  float n1 = vn(p + vec2(o, o), s, seed + 0.1);\r
  float n2 = vn(p + vec2(-o, o), s, seed + 0.2);\r
  float n3 = vn(p + vec2(o, -o), s, seed + 0.3);\r
  float n4 = vn(p + vec2(-o, -o), s, seed + 0.4);\r
  return (2.0 * n0 + 1.5 * n1 + 1.25 * n2 + 1.125 * n3 + n4) / 7.0;\r
}\r
\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform vec2 uResolution;\r
uniform float uTime;\r
uniform vec2 uFlow;\r
uniform float uSpeed;\r
uniform float uScale;\r
uniform float uTurbulence;\r
uniform float uFluidity;\r
uniform float uRimWidth;\r
uniform float uSharpness;\r
uniform float uShimmer;\r
uniform float uGlow;\r
uniform float uLine;\r
uniform float uMaxHalf;\r
uniform vec3 uColors[\${MAX_COLORS}];\r
uniform int uColorCount;\r
uniform vec4 uMagnet;\r
uniform vec4 uSwirl;\r
uniform float uReveal;\r
uniform float uLight;\r
uniform float uOpaque;\r
uniform vec3 uBackground;\r
uniform float uOpacity;\r
out vec4 outColor;\r
\${FIELD}\r
\r
vec3 palette(float h) {\r
  float x = clamp(h, 0.0, 1.0) * float(uColorCount - 1);\r
  int i = int(floor(x));\r
  int j = min(i + 1, uColorCount - 1);\r
  return mix(uColors[i], uColors[j], smoothstep(0.0, 1.0, x - float(i)));\r
}\r
\r
void main() {\r
  float ref = 700.0 / max(uScale, 0.05);\r
  vec2 frag = gl_FragCoord.xy;\r
  vec2 toMagnet = (frag - uMagnet.xy) / uResolution.y;\r
  float pull = uMagnet.z * exp(-dot(toMagnet, toMagnet) / (uMagnet.w * uMagnet.w));\r
  if (pull > 0.001) {\r
    float angle = pull * 0.55;\r
    float c = cos(angle);\r
    float s = sin(angle);\r
    frag = uMagnet.xy + mat2(c, s, -s, c) * (frag - uMagnet.xy);\r
  }\r
  if (uSwirl.w > 0.0) {\r
    vec2 d = frag - uSwirl.xy;\r
    float reach = uSwirl.z;\r
    float angle = uSwirl.w * exp(-dot(d, d) / (reach * reach));\r
    float c = cos(angle);\r
    float s = sin(angle);\r
    frag = uSwirl.xy + mat2(c, s, -s, c) * d;\r
  }\r
  vec2 p = frag / uResolution.y * ref;\r
\r
  float spd = 200.0 * uSpeed;\r
  float t = uTime;\r
  vec2 dir = uFlow;\r
  vec2 perp = vec2(-dir.y, dir.x);\r
  float distort1 = vn(p + perp * (t * spd), 60.0, 10.0) * 50.0 * uTurbulence;\r
  float distort2 = vn(p - perp * (t * spd), 120.0, 15.0) * 100.0 * uTurbulence;\r
  float peaks = dbn(p + distort1 + dir * (t * spd * 0.5), 40.0, 1.0);\r
  float peaks2 = dbn(p + distort2 - dir * (t * spd * 0.5), 40.0, 0.0);\r
  float field = smin(peaks, peaks2, max(uFluidity, 0.001));\r
\r
  float slope = length(vec2(dFdx(field), dFdy(field)));\r
  float gap = abs(field - 0.4);\r
  float pixels = gap / max(slope, 1e-6);\r
  float halfBand = max(uRimWidth, 0.001) * 0.5;\r
  float across = max(gap / halfBand, pixels / uMaxHalf);\r
  float band = 5.0 * uRimWidth * (1.0 - across);\r
  float reveal = smoothstep(0.2, 0.85, pull);\r
  float shimmer = vn(p + dir * (t * spd * 0.5), 60.0, 12.0) * uShimmer * (1.0 - reveal * 0.75);\r
  float lit = clamp(band - shimmer, 0.0, 1.0);\r
  float glow = pow(lit, uSharpness) * uGlow * (1.0 + reveal * 0.25);\r
  float core = uLine > 0.0 ? smoothstep(uLine + 0.75, uLine - 0.75, pixels) * max(smoothstep(0.08, 0.6, glow), reveal) : 0.0;\r
  float shine = clamp(glow, 0.0, 1.0);\r
  float energy = max(shine * shine, core * 0.85) * uReveal;\r
\r
  float h = clamp(0.5 + (peaks - peaks2) * 0.8, 0.0, 1.0);\r
  vec3 tint = palette(h);\r
\r
  if (uLight > 0.5) {\r
    float chroma = max(tint.r, max(tint.g, tint.b)) - min(tint.r, min(tint.g, tint.b));\r
    vec3 ink = mix(vec3(0.07, 0.07, 0.08), tint * 0.55, clamp(chroma * 1.6, 0.0, 1.0));\r
    float cover = energy * uOpacity;\r
    outColor = uOpaque > 0.5 ? vec4(mix(uBackground, ink, cover), 1.0) : vec4(ink * cover, cover);\r
    return;\r
  }\r
\r
  vec3 light = tint * energy * uOpacity;\r
  outColor = uOpaque > 0.5 ? vec4(uBackground + light, 1.0) : vec4(light, max(light.r, max(light.g, light.b)));\r
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
const FluxLines = ({\r
  colors = ['#ffffff', '#ffffff', '#ffffff'],\r
  speed = 0.5,\r
  scale = 1.6,\r
  turbulence = 1,\r
  fluidity = 0.1,\r
  rimWidth = 0.2,\r
  sharpness = 2.5,\r
  shimmer = 1.5,\r
  glow = 2,\r
  lineWidth = 1,\r
  flowDirection = 'down',\r
  opacity = 1,\r
  mouseInteraction = true,\r
  mouseStrength = 1,\r
  mouseRadius = 0.35,\r
  mouseDampening = 0.15,\r
  clickSwirl = true,\r
  intro = true,\r
  lightMode = false,\r
  transparent = true,\r
  backgroundColor,\r
  paused = false,\r
  dpr,\r
  mixBlendMode,\r
  className = '',\r
  style,\r
  ...rest\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settings = {\r
    colors: Array.isArray(colors) && colors.length ? colors.slice(0, MAX_COLORS) : ['#ffffff'],\r
    speed,\r
    scale: Math.max(0.05, scale),\r
    turbulence,\r
    fluidity: Math.max(0.001, fluidity),\r
    rimWidth: Math.max(0.001, rimWidth),\r
    sharpness: Math.max(0.1, sharpness),\r
    shimmer: Math.max(0, shimmer),\r
    glow: Math.max(0, glow),\r
    lineWidth: Math.max(0, lineWidth),\r
    flow: FLOW[flowDirection] ?? FLOW.down,\r
    opacity: clamp(opacity, 0, 1),\r
    mouseInteraction,\r
    mouseStrength: Math.max(0, mouseStrength),\r
    mouseRadius: Math.max(0.01, mouseRadius),\r
    mouseDampening: Math.max(0, mouseDampening),\r
    clickSwirl,\r
    intro,\r
    lightMode,\r
    transparent,\r
    backgroundColor,\r
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
    const cache = new Map();\r
    const parse = (value, fallback) => {\r
      if (!value) return fallback;\r
      const key = String(value);\r
      if (cache.has(key)) return cache.get(key);\r
      let rgb = fallback;\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#000000';\r
        probe.fillStyle = key;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      cache.set(key, rgb);\r
      return rgb;\r
    };\r
    const palette = new Float32Array(MAX_COLORS * 3);\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const magnet = { x: 0, y: 0, active: 0 };\r
    const swirl = { x: 0, y: 0, age: 10 };\r
    let time = 0;\r
    let reveal = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const ratio = canvas.width / Math.max(1, container.clientWidth);\r
      s.colors.forEach((value, index) => palette.set(parse(value, [1, 1, 1]), index * 3));\r
      const intro = Math.min(1, reveal);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(program.program);\r
      gl.bindVertexArray(vao);\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(u.uTime, time);\r
      gl.uniform2f(u.uFlow, s.flow[0], s.flow[1]);\r
      gl.uniform1f(u.uSpeed, s.speed);\r
      gl.uniform1f(u.uScale, s.scale);\r
      gl.uniform1f(u.uTurbulence, s.turbulence);\r
      gl.uniform1f(u.uFluidity, s.fluidity);\r
      gl.uniform1f(u.uRimWidth, s.rimWidth);\r
      gl.uniform1f(u.uSharpness, s.sharpness);\r
      gl.uniform1f(u.uShimmer, s.shimmer);\r
      gl.uniform1f(u.uGlow, s.glow);\r
      gl.uniform1f(u.uLine, s.lineWidth * ratio * 0.5);\r
      gl.uniform1f(u.uMaxHalf, 28 * ratio);\r
      gl.uniform3fv(u.uColors, palette);\r
      gl.uniform1i(u.uColorCount, s.colors.length);\r
      gl.uniform4f(u.uMagnet, magnet.x, magnet.y, magnet.active * s.mouseStrength, s.mouseRadius);\r
      const age = swirl.age;\r
      const twist = 1.9 * Math.min(1, age / 0.23) * Math.exp(-Math.max(0, age - 0.23) * 1.1);\r
      gl.uniform4f(u.uSwirl, swirl.x, swirl.y, canvas.height * 0.22 * (1 + age * 0.5), age < 6 ? twist : 0);\r
      gl.uniform1f(u.uReveal, intro * intro * (3 - 2 * intro));\r
      gl.uniform1f(u.uLight, s.lightMode ? 1 : 0);\r
      gl.uniform1f(u.uOpaque, s.transparent ? 0 : 1);\r
      gl.uniform3fv(u.uBackground, parse(s.backgroundColor, s.lightMode ? [1, 1, 1] : [0.0706, 0.0588, 0.0902]));\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.0005, 0.05) : 1 / 60;\r
      last = now;\r
      const motion = s.paused || reduce ? 0 : 1;\r
      time += dt * motion;\r
      swirl.age += dt;\r
      if (s.intro && !reduce && reveal < 1) reveal = Math.min(1, reveal + dt / INTRO_SECONDS);\r
      else if (!s.intro || reduce) reveal = 1;\r
\r
      const engaged = s.mouseInteraction && pointer.inside;\r
      const follow = s.mouseDampening > 0 ? 1 - Math.exp(-dt / s.mouseDampening) : 1;\r
      if (engaged) {\r
        magnet.x += (pointer.x - magnet.x) * follow;\r
        magnet.y += (pointer.y - magnet.y) * follow;\r
      }\r
      const target = engaged ? 1 : 0;\r
      magnet.active += (target - magnet.active) * (1 - Math.exp(-dt / 0.3));\r
      if (Math.abs(target - magnet.active) < 0.001) magnet.active = target;\r
\r
      render();\r
      const busy = motion > 0 || magnet.active !== target || reveal < 1 || swirl.age < 6;\r
      if (busy) raf = requestAnimationFrame(frame);\r
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
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      render();\r
      wake();\r
    };\r
\r
    const locate = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      const ratio = canvas.width / Math.max(1, rect.width);\r
      pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      pointer.x = x * ratio;\r
      pointer.y = (rect.height - y) * ratio;\r
    };\r
\r
    const onPointerMove = event => {\r
      const wasInside = pointer.inside;\r
      locate(event);\r
      if (pointer.inside && !wasInside && magnet.active < 0.05) {\r
        magnet.x = pointer.x;\r
        magnet.y = pointer.y;\r
      }\r
      wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      onPointerMove(event);\r
      if (!pointer.inside || !settingsRef.current.clickSwirl || reduce) return;\r
      swirl.x = pointer.x;\r
      swirl.y = pointer.y;\r
      swirl.age = 0;\r
      wake();\r
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
      style={mixBlendMode ? { ...style, mixBlendMode } : style}\r
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default FluxLines;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties, type HTMLAttributes } from 'react';\r
import './FluxLines.css';\r
\r
export type FluxLinesFlow = 'up' | 'down' | 'left' | 'right';\r
\r
export interface FluxLinesProps extends HTMLAttributes<HTMLDivElement> {\r
  colors?: string[];\r
  speed?: number;\r
  scale?: number;\r
  turbulence?: number;\r
  fluidity?: number;\r
  rimWidth?: number;\r
  sharpness?: number;\r
  shimmer?: number;\r
  glow?: number;\r
  lineWidth?: number;\r
  flowDirection?: FluxLinesFlow;\r
  opacity?: number;\r
  mouseInteraction?: boolean;\r
  mouseStrength?: number;\r
  mouseRadius?: number;\r
  mouseDampening?: number;\r
  clickSwirl?: boolean;\r
  intro?: boolean;\r
  lightMode?: boolean;\r
  transparent?: boolean;\r
  backgroundColor?: string;\r
  paused?: boolean;\r
  dpr?: number;\r
  mixBlendMode?: CSSProperties['mixBlendMode'];\r
}\r
\r
type Settings = {\r
  colors: string[];\r
  speed: number;\r
  scale: number;\r
  turbulence: number;\r
  fluidity: number;\r
  rimWidth: number;\r
  sharpness: number;\r
  shimmer: number;\r
  glow: number;\r
  lineWidth: number;\r
  flow: number[];\r
  opacity: number;\r
  mouseInteraction: boolean;\r
  mouseStrength: number;\r
  mouseRadius: number;\r
  mouseDampening: number;\r
  clickSwirl: boolean;\r
  intro: boolean;\r
  lightMode: boolean;\r
  transparent: boolean;\r
  backgroundColor?: string;\r
  paused: boolean;\r
  dpr?: number;\r
};\r
\r
type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };\r
\r
const MAX_COLORS = 8;\r
const INTRO_SECONDS = 1.8;\r
const FLOW: Record<string, number[]> = { up: [0, 1], down: [0, -1], left: [-1, 0], right: [1, 0] };\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const FIELD = \`\r
float hash(vec3 p3) {\r
  p3 = fract(p3 * 0.1031);\r
  p3 += dot(p3, p3.zyx + 33.33);\r
  return fract((p3.x + p3.y) * p3.z);\r
}\r
\r
float smin(float a, float b, float k) {\r
  float r = exp2(-a / k) + exp2(-b / k);\r
  return -k * log2(r);\r
}\r
\r
float sinlerp(float a, float b, float w) {\r
  return mix(a, b, (sin(w * 3.14159265 - 3.14159265 / 2.0) + 1.0) / 2.0);\r
}\r
\r
float vn(vec2 p, float s, float seed) {\r
  vec2 cellp = floor(p / s);\r
  vec2 relp = mod(p, s);\r
  float g1 = hash(vec3(cellp, seed));\r
  float g2 = hash(vec3(cellp.x + 1.0, cellp.y, seed));\r
  float g3 = hash(vec3(cellp.x + 1.0, cellp.y + 1.0, seed));\r
  float g4 = hash(vec3(cellp.x, cellp.y + 1.0, seed));\r
  float bx = sinlerp(g1, g2, relp.x / s);\r
  float tx = sinlerp(g4, g3, relp.x / s);\r
  return sinlerp(bx, tx, relp.y / s);\r
}\r
\r
float dbn(vec2 p, float s, float seed) {\r
  float o = s / 2.0;\r
  float n0 = vn(p, s, seed);\r
  float n1 = vn(p + vec2(o, o), s, seed + 0.1);\r
  float n2 = vn(p + vec2(-o, o), s, seed + 0.2);\r
  float n3 = vn(p + vec2(o, -o), s, seed + 0.3);\r
  float n4 = vn(p + vec2(-o, -o), s, seed + 0.4);\r
  return (2.0 * n0 + 1.5 * n1 + 1.25 * n2 + 1.125 * n3 + n4) / 7.0;\r
}\r
\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform vec2 uResolution;\r
uniform float uTime;\r
uniform vec2 uFlow;\r
uniform float uSpeed;\r
uniform float uScale;\r
uniform float uTurbulence;\r
uniform float uFluidity;\r
uniform float uRimWidth;\r
uniform float uSharpness;\r
uniform float uShimmer;\r
uniform float uGlow;\r
uniform float uLine;\r
uniform float uMaxHalf;\r
uniform vec3 uColors[\${MAX_COLORS}];\r
uniform int uColorCount;\r
uniform vec4 uMagnet;\r
uniform vec4 uSwirl;\r
uniform float uReveal;\r
uniform float uLight;\r
uniform float uOpaque;\r
uniform vec3 uBackground;\r
uniform float uOpacity;\r
out vec4 outColor;\r
\${FIELD}\r
\r
vec3 palette(float h) {\r
  float x = clamp(h, 0.0, 1.0) * float(uColorCount - 1);\r
  int i = int(floor(x));\r
  int j = min(i + 1, uColorCount - 1);\r
  return mix(uColors[i], uColors[j], smoothstep(0.0, 1.0, x - float(i)));\r
}\r
\r
void main() {\r
  float ref = 700.0 / max(uScale, 0.05);\r
  vec2 frag = gl_FragCoord.xy;\r
  vec2 toMagnet = (frag - uMagnet.xy) / uResolution.y;\r
  float pull = uMagnet.z * exp(-dot(toMagnet, toMagnet) / (uMagnet.w * uMagnet.w));\r
  if (pull > 0.001) {\r
    float angle = pull * 0.55;\r
    float c = cos(angle);\r
    float s = sin(angle);\r
    frag = uMagnet.xy + mat2(c, s, -s, c) * (frag - uMagnet.xy);\r
  }\r
  if (uSwirl.w > 0.0) {\r
    vec2 d = frag - uSwirl.xy;\r
    float reach = uSwirl.z;\r
    float angle = uSwirl.w * exp(-dot(d, d) / (reach * reach));\r
    float c = cos(angle);\r
    float s = sin(angle);\r
    frag = uSwirl.xy + mat2(c, s, -s, c) * d;\r
  }\r
  vec2 p = frag / uResolution.y * ref;\r
\r
  float spd = 200.0 * uSpeed;\r
  float t = uTime;\r
  vec2 dir = uFlow;\r
  vec2 perp = vec2(-dir.y, dir.x);\r
  float distort1 = vn(p + perp * (t * spd), 60.0, 10.0) * 50.0 * uTurbulence;\r
  float distort2 = vn(p - perp * (t * spd), 120.0, 15.0) * 100.0 * uTurbulence;\r
  float peaks = dbn(p + distort1 + dir * (t * spd * 0.5), 40.0, 1.0);\r
  float peaks2 = dbn(p + distort2 - dir * (t * spd * 0.5), 40.0, 0.0);\r
  float field = smin(peaks, peaks2, max(uFluidity, 0.001));\r
\r
  float slope = length(vec2(dFdx(field), dFdy(field)));\r
  float gap = abs(field - 0.4);\r
  float pixels = gap / max(slope, 1e-6);\r
  float halfBand = max(uRimWidth, 0.001) * 0.5;\r
  float across = max(gap / halfBand, pixels / uMaxHalf);\r
  float band = 5.0 * uRimWidth * (1.0 - across);\r
  float reveal = smoothstep(0.2, 0.85, pull);\r
  float shimmer = vn(p + dir * (t * spd * 0.5), 60.0, 12.0) * uShimmer * (1.0 - reveal * 0.75);\r
  float lit = clamp(band - shimmer, 0.0, 1.0);\r
  float glow = pow(lit, uSharpness) * uGlow * (1.0 + reveal * 0.25);\r
  float core = uLine > 0.0 ? smoothstep(uLine + 0.75, uLine - 0.75, pixels) * max(smoothstep(0.08, 0.6, glow), reveal) : 0.0;\r
  float shine = clamp(glow, 0.0, 1.0);\r
  float energy = max(shine * shine, core * 0.85) * uReveal;\r
\r
  float h = clamp(0.5 + (peaks - peaks2) * 0.8, 0.0, 1.0);\r
  vec3 tint = palette(h);\r
\r
  if (uLight > 0.5) {\r
    float chroma = max(tint.r, max(tint.g, tint.b)) - min(tint.r, min(tint.g, tint.b));\r
    vec3 ink = mix(vec3(0.07, 0.07, 0.08), tint * 0.55, clamp(chroma * 1.6, 0.0, 1.0));\r
    float cover = energy * uOpacity;\r
    outColor = uOpaque > 0.5 ? vec4(mix(uBackground, ink, cover), 1.0) : vec4(ink * cover, cover);\r
    return;\r
  }\r
\r
  vec3 light = tint * energy * uOpacity;\r
  outColor = uOpaque > 0.5 ? vec4(uBackground + light, 1.0) : vec4(light, max(light.r, max(light.g, light.b)));\r
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
const FluxLines = ({\r
  colors = ['#ffffff', '#ffffff', '#ffffff'],\r
  speed = 0.5,\r
  scale = 1.6,\r
  turbulence = 1,\r
  fluidity = 0.1,\r
  rimWidth = 0.2,\r
  sharpness = 2.5,\r
  shimmer = 1.5,\r
  glow = 2,\r
  lineWidth = 1,\r
  flowDirection = 'down',\r
  opacity = 1,\r
  mouseInteraction = true,\r
  mouseStrength = 1,\r
  mouseRadius = 0.35,\r
  mouseDampening = 0.15,\r
  clickSwirl = true,\r
  intro = true,\r
  lightMode = false,\r
  transparent = true,\r
  backgroundColor,\r
  paused = false,\r
  dpr,\r
  mixBlendMode,\r
  className = '',\r
  style,\r
  ...rest\r
}: FluxLinesProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings: Settings = {\r
    colors: Array.isArray(colors) && colors.length ? colors.slice(0, MAX_COLORS) : ['#ffffff'],\r
    speed,\r
    scale: Math.max(0.05, scale),\r
    turbulence,\r
    fluidity: Math.max(0.001, fluidity),\r
    rimWidth: Math.max(0.001, rimWidth),\r
    sharpness: Math.max(0.1, sharpness),\r
    shimmer: Math.max(0, shimmer),\r
    glow: Math.max(0, glow),\r
    lineWidth: Math.max(0, lineWidth),\r
    flow: FLOW[flowDirection] ?? FLOW.down,\r
    opacity: clamp(opacity, 0, 1),\r
    mouseInteraction,\r
    mouseStrength: Math.max(0, mouseStrength),\r
    mouseRadius: Math.max(0.01, mouseRadius),\r
    mouseDampening: Math.max(0, mouseDampening),\r
    clickSwirl,\r
    intro,\r
    lightMode,\r
    transparent,\r
    backgroundColor,\r
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
    const cache = new Map<string, number[]>();\r
    const parse = (value: string | undefined, fallback: number[]): number[] => {\r
      if (!value) return fallback;\r
      const key = String(value);\r
      const cached = cache.get(key);\r
      if (cached) return cached;\r
      let rgb = fallback;\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#000000';\r
        probe.fillStyle = key;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      cache.set(key, rgb);\r
      return rgb;\r
    };\r
    const palette = new Float32Array(MAX_COLORS * 3);\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const magnet = { x: 0, y: 0, active: 0 };\r
    const swirl = { x: 0, y: 0, age: 10 };\r
    let time = 0;\r
    let reveal = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const ratio = canvas.width / Math.max(1, container.clientWidth);\r
      s.colors.forEach((value, index) => palette.set(parse(value, [1, 1, 1]), index * 3));\r
      const intro = Math.min(1, reveal);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(program.program);\r
      gl.bindVertexArray(vao);\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(u.uTime, time);\r
      gl.uniform2f(u.uFlow, s.flow[0], s.flow[1]);\r
      gl.uniform1f(u.uSpeed, s.speed);\r
      gl.uniform1f(u.uScale, s.scale);\r
      gl.uniform1f(u.uTurbulence, s.turbulence);\r
      gl.uniform1f(u.uFluidity, s.fluidity);\r
      gl.uniform1f(u.uRimWidth, s.rimWidth);\r
      gl.uniform1f(u.uSharpness, s.sharpness);\r
      gl.uniform1f(u.uShimmer, s.shimmer);\r
      gl.uniform1f(u.uGlow, s.glow);\r
      gl.uniform1f(u.uLine, s.lineWidth * ratio * 0.5);\r
      gl.uniform1f(u.uMaxHalf, 28 * ratio);\r
      gl.uniform3fv(u.uColors, palette);\r
      gl.uniform1i(u.uColorCount, s.colors.length);\r
      gl.uniform4f(u.uMagnet, magnet.x, magnet.y, magnet.active * s.mouseStrength, s.mouseRadius);\r
      const age = swirl.age;\r
      const twist = 1.9 * Math.min(1, age / 0.23) * Math.exp(-Math.max(0, age - 0.23) * 1.1);\r
      gl.uniform4f(u.uSwirl, swirl.x, swirl.y, canvas.height * 0.22 * (1 + age * 0.5), age < 6 ? twist : 0);\r
      gl.uniform1f(u.uReveal, intro * intro * (3 - 2 * intro));\r
      gl.uniform1f(u.uLight, s.lightMode ? 1 : 0);\r
      gl.uniform1f(u.uOpaque, s.transparent ? 0 : 1);\r
      gl.uniform3fv(u.uBackground, parse(s.backgroundColor, s.lightMode ? [1, 1, 1] : [0.0706, 0.0588, 0.0902]));\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.0005, 0.05) : 1 / 60;\r
      last = now;\r
      const motion = s.paused || reduce ? 0 : 1;\r
      time += dt * motion;\r
      swirl.age += dt;\r
      if (s.intro && !reduce && reveal < 1) reveal = Math.min(1, reveal + dt / INTRO_SECONDS);\r
      else if (!s.intro || reduce) reveal = 1;\r
\r
      const engaged = s.mouseInteraction && pointer.inside;\r
      const follow = s.mouseDampening > 0 ? 1 - Math.exp(-dt / s.mouseDampening) : 1;\r
      if (engaged) {\r
        magnet.x += (pointer.x - magnet.x) * follow;\r
        magnet.y += (pointer.y - magnet.y) * follow;\r
      }\r
      const target = engaged ? 1 : 0;\r
      magnet.active += (target - magnet.active) * (1 - Math.exp(-dt / 0.3));\r
      if (Math.abs(target - magnet.active) < 0.001) magnet.active = target;\r
\r
      render();\r
      const busy = motion > 0 || magnet.active !== target || reveal < 1 || swirl.age < 6;\r
      if (busy) raf = requestAnimationFrame(frame);\r
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
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      render();\r
      wake();\r
    };\r
\r
    const locate = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      const ratio = canvas.width / Math.max(1, rect.width);\r
      pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      pointer.x = x * ratio;\r
      pointer.y = (rect.height - y) * ratio;\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const wasInside = pointer.inside;\r
      locate(event);\r
      if (pointer.inside && !wasInside && magnet.active < 0.05) {\r
        magnet.x = pointer.x;\r
        magnet.y = pointer.y;\r
      }\r
      wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      onPointerMove(event);\r
      if (!pointer.inside || !settingsRef.current.clickSwirl || reduce) return;\r
      swirl.x = pointer.x;\r
      swirl.y = pointer.y;\r
      swirl.age = 0;\r
      wake();\r
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
      className={\`flux-lines-container\${className ? \` \${className}\` : ''}\`}\r
      style={mixBlendMode ? { ...style, mixBlendMode } : style}\r
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className="flux-lines-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default FluxLines;\r
`,o=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties, type HTMLAttributes } from 'react';\r
\r
export type FluxLinesFlow = 'up' | 'down' | 'left' | 'right';\r
\r
export interface FluxLinesProps extends HTMLAttributes<HTMLDivElement> {\r
  colors?: string[];\r
  speed?: number;\r
  scale?: number;\r
  turbulence?: number;\r
  fluidity?: number;\r
  rimWidth?: number;\r
  sharpness?: number;\r
  shimmer?: number;\r
  glow?: number;\r
  lineWidth?: number;\r
  flowDirection?: FluxLinesFlow;\r
  opacity?: number;\r
  mouseInteraction?: boolean;\r
  mouseStrength?: number;\r
  mouseRadius?: number;\r
  mouseDampening?: number;\r
  clickSwirl?: boolean;\r
  intro?: boolean;\r
  lightMode?: boolean;\r
  transparent?: boolean;\r
  backgroundColor?: string;\r
  paused?: boolean;\r
  dpr?: number;\r
  mixBlendMode?: CSSProperties['mixBlendMode'];\r
}\r
\r
type Settings = {\r
  colors: string[];\r
  speed: number;\r
  scale: number;\r
  turbulence: number;\r
  fluidity: number;\r
  rimWidth: number;\r
  sharpness: number;\r
  shimmer: number;\r
  glow: number;\r
  lineWidth: number;\r
  flow: number[];\r
  opacity: number;\r
  mouseInteraction: boolean;\r
  mouseStrength: number;\r
  mouseRadius: number;\r
  mouseDampening: number;\r
  clickSwirl: boolean;\r
  intro: boolean;\r
  lightMode: boolean;\r
  transparent: boolean;\r
  backgroundColor?: string;\r
  paused: boolean;\r
  dpr?: number;\r
};\r
\r
type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };\r
\r
const MAX_COLORS = 8;\r
const INTRO_SECONDS = 1.8;\r
const FLOW: Record<string, number[]> = { up: [0, 1], down: [0, -1], left: [-1, 0], right: [1, 0] };\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const FIELD = \`\r
float hash(vec3 p3) {\r
  p3 = fract(p3 * 0.1031);\r
  p3 += dot(p3, p3.zyx + 33.33);\r
  return fract((p3.x + p3.y) * p3.z);\r
}\r
\r
float smin(float a, float b, float k) {\r
  float r = exp2(-a / k) + exp2(-b / k);\r
  return -k * log2(r);\r
}\r
\r
float sinlerp(float a, float b, float w) {\r
  return mix(a, b, (sin(w * 3.14159265 - 3.14159265 / 2.0) + 1.0) / 2.0);\r
}\r
\r
float vn(vec2 p, float s, float seed) {\r
  vec2 cellp = floor(p / s);\r
  vec2 relp = mod(p, s);\r
  float g1 = hash(vec3(cellp, seed));\r
  float g2 = hash(vec3(cellp.x + 1.0, cellp.y, seed));\r
  float g3 = hash(vec3(cellp.x + 1.0, cellp.y + 1.0, seed));\r
  float g4 = hash(vec3(cellp.x, cellp.y + 1.0, seed));\r
  float bx = sinlerp(g1, g2, relp.x / s);\r
  float tx = sinlerp(g4, g3, relp.x / s);\r
  return sinlerp(bx, tx, relp.y / s);\r
}\r
\r
float dbn(vec2 p, float s, float seed) {\r
  float o = s / 2.0;\r
  float n0 = vn(p, s, seed);\r
  float n1 = vn(p + vec2(o, o), s, seed + 0.1);\r
  float n2 = vn(p + vec2(-o, o), s, seed + 0.2);\r
  float n3 = vn(p + vec2(o, -o), s, seed + 0.3);\r
  float n4 = vn(p + vec2(-o, -o), s, seed + 0.4);\r
  return (2.0 * n0 + 1.5 * n1 + 1.25 * n2 + 1.125 * n3 + n4) / 7.0;\r
}\r
\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform vec2 uResolution;\r
uniform float uTime;\r
uniform vec2 uFlow;\r
uniform float uSpeed;\r
uniform float uScale;\r
uniform float uTurbulence;\r
uniform float uFluidity;\r
uniform float uRimWidth;\r
uniform float uSharpness;\r
uniform float uShimmer;\r
uniform float uGlow;\r
uniform float uLine;\r
uniform float uMaxHalf;\r
uniform vec3 uColors[\${MAX_COLORS}];\r
uniform int uColorCount;\r
uniform vec4 uMagnet;\r
uniform vec4 uSwirl;\r
uniform float uReveal;\r
uniform float uLight;\r
uniform float uOpaque;\r
uniform vec3 uBackground;\r
uniform float uOpacity;\r
out vec4 outColor;\r
\${FIELD}\r
\r
vec3 palette(float h) {\r
  float x = clamp(h, 0.0, 1.0) * float(uColorCount - 1);\r
  int i = int(floor(x));\r
  int j = min(i + 1, uColorCount - 1);\r
  return mix(uColors[i], uColors[j], smoothstep(0.0, 1.0, x - float(i)));\r
}\r
\r
void main() {\r
  float ref = 700.0 / max(uScale, 0.05);\r
  vec2 frag = gl_FragCoord.xy;\r
  vec2 toMagnet = (frag - uMagnet.xy) / uResolution.y;\r
  float pull = uMagnet.z * exp(-dot(toMagnet, toMagnet) / (uMagnet.w * uMagnet.w));\r
  if (pull > 0.001) {\r
    float angle = pull * 0.55;\r
    float c = cos(angle);\r
    float s = sin(angle);\r
    frag = uMagnet.xy + mat2(c, s, -s, c) * (frag - uMagnet.xy);\r
  }\r
  if (uSwirl.w > 0.0) {\r
    vec2 d = frag - uSwirl.xy;\r
    float reach = uSwirl.z;\r
    float angle = uSwirl.w * exp(-dot(d, d) / (reach * reach));\r
    float c = cos(angle);\r
    float s = sin(angle);\r
    frag = uSwirl.xy + mat2(c, s, -s, c) * d;\r
  }\r
  vec2 p = frag / uResolution.y * ref;\r
\r
  float spd = 200.0 * uSpeed;\r
  float t = uTime;\r
  vec2 dir = uFlow;\r
  vec2 perp = vec2(-dir.y, dir.x);\r
  float distort1 = vn(p + perp * (t * spd), 60.0, 10.0) * 50.0 * uTurbulence;\r
  float distort2 = vn(p - perp * (t * spd), 120.0, 15.0) * 100.0 * uTurbulence;\r
  float peaks = dbn(p + distort1 + dir * (t * spd * 0.5), 40.0, 1.0);\r
  float peaks2 = dbn(p + distort2 - dir * (t * spd * 0.5), 40.0, 0.0);\r
  float field = smin(peaks, peaks2, max(uFluidity, 0.001));\r
\r
  float slope = length(vec2(dFdx(field), dFdy(field)));\r
  float gap = abs(field - 0.4);\r
  float pixels = gap / max(slope, 1e-6);\r
  float halfBand = max(uRimWidth, 0.001) * 0.5;\r
  float across = max(gap / halfBand, pixels / uMaxHalf);\r
  float band = 5.0 * uRimWidth * (1.0 - across);\r
  float reveal = smoothstep(0.2, 0.85, pull);\r
  float shimmer = vn(p + dir * (t * spd * 0.5), 60.0, 12.0) * uShimmer * (1.0 - reveal * 0.75);\r
  float lit = clamp(band - shimmer, 0.0, 1.0);\r
  float glow = pow(lit, uSharpness) * uGlow * (1.0 + reveal * 0.25);\r
  float core = uLine > 0.0 ? smoothstep(uLine + 0.75, uLine - 0.75, pixels) * max(smoothstep(0.08, 0.6, glow), reveal) : 0.0;\r
  float shine = clamp(glow, 0.0, 1.0);\r
  float energy = max(shine * shine, core * 0.85) * uReveal;\r
\r
  float h = clamp(0.5 + (peaks - peaks2) * 0.8, 0.0, 1.0);\r
  vec3 tint = palette(h);\r
\r
  if (uLight > 0.5) {\r
    float chroma = max(tint.r, max(tint.g, tint.b)) - min(tint.r, min(tint.g, tint.b));\r
    vec3 ink = mix(vec3(0.07, 0.07, 0.08), tint * 0.55, clamp(chroma * 1.6, 0.0, 1.0));\r
    float cover = energy * uOpacity;\r
    outColor = uOpaque > 0.5 ? vec4(mix(uBackground, ink, cover), 1.0) : vec4(ink * cover, cover);\r
    return;\r
  }\r
\r
  vec3 light = tint * energy * uOpacity;\r
  outColor = uOpaque > 0.5 ? vec4(uBackground + light, 1.0) : vec4(light, max(light.r, max(light.g, light.b)));\r
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
const FluxLines = ({\r
  colors = ['#ffffff', '#ffffff', '#ffffff'],\r
  speed = 0.5,\r
  scale = 1.6,\r
  turbulence = 1,\r
  fluidity = 0.1,\r
  rimWidth = 0.2,\r
  sharpness = 2.5,\r
  shimmer = 1.5,\r
  glow = 2,\r
  lineWidth = 1,\r
  flowDirection = 'down',\r
  opacity = 1,\r
  mouseInteraction = true,\r
  mouseStrength = 1,\r
  mouseRadius = 0.35,\r
  mouseDampening = 0.15,\r
  clickSwirl = true,\r
  intro = true,\r
  lightMode = false,\r
  transparent = true,\r
  backgroundColor,\r
  paused = false,\r
  dpr,\r
  mixBlendMode,\r
  className = '',\r
  style,\r
  ...rest\r
}: FluxLinesProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings: Settings = {\r
    colors: Array.isArray(colors) && colors.length ? colors.slice(0, MAX_COLORS) : ['#ffffff'],\r
    speed,\r
    scale: Math.max(0.05, scale),\r
    turbulence,\r
    fluidity: Math.max(0.001, fluidity),\r
    rimWidth: Math.max(0.001, rimWidth),\r
    sharpness: Math.max(0.1, sharpness),\r
    shimmer: Math.max(0, shimmer),\r
    glow: Math.max(0, glow),\r
    lineWidth: Math.max(0, lineWidth),\r
    flow: FLOW[flowDirection] ?? FLOW.down,\r
    opacity: clamp(opacity, 0, 1),\r
    mouseInteraction,\r
    mouseStrength: Math.max(0, mouseStrength),\r
    mouseRadius: Math.max(0.01, mouseRadius),\r
    mouseDampening: Math.max(0, mouseDampening),\r
    clickSwirl,\r
    intro,\r
    lightMode,\r
    transparent,\r
    backgroundColor,\r
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
    const cache = new Map<string, number[]>();\r
    const parse = (value: string | undefined, fallback: number[]): number[] => {\r
      if (!value) return fallback;\r
      const key = String(value);\r
      const cached = cache.get(key);\r
      if (cached) return cached;\r
      let rgb = fallback;\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#000000';\r
        probe.fillStyle = key;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      cache.set(key, rgb);\r
      return rgb;\r
    };\r
    const palette = new Float32Array(MAX_COLORS * 3);\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const magnet = { x: 0, y: 0, active: 0 };\r
    const swirl = { x: 0, y: 0, age: 10 };\r
    let time = 0;\r
    let reveal = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const ratio = canvas.width / Math.max(1, container.clientWidth);\r
      s.colors.forEach((value, index) => palette.set(parse(value, [1, 1, 1]), index * 3));\r
      const intro = Math.min(1, reveal);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(program.program);\r
      gl.bindVertexArray(vao);\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(u.uTime, time);\r
      gl.uniform2f(u.uFlow, s.flow[0], s.flow[1]);\r
      gl.uniform1f(u.uSpeed, s.speed);\r
      gl.uniform1f(u.uScale, s.scale);\r
      gl.uniform1f(u.uTurbulence, s.turbulence);\r
      gl.uniform1f(u.uFluidity, s.fluidity);\r
      gl.uniform1f(u.uRimWidth, s.rimWidth);\r
      gl.uniform1f(u.uSharpness, s.sharpness);\r
      gl.uniform1f(u.uShimmer, s.shimmer);\r
      gl.uniform1f(u.uGlow, s.glow);\r
      gl.uniform1f(u.uLine, s.lineWidth * ratio * 0.5);\r
      gl.uniform1f(u.uMaxHalf, 28 * ratio);\r
      gl.uniform3fv(u.uColors, palette);\r
      gl.uniform1i(u.uColorCount, s.colors.length);\r
      gl.uniform4f(u.uMagnet, magnet.x, magnet.y, magnet.active * s.mouseStrength, s.mouseRadius);\r
      const age = swirl.age;\r
      const twist = 1.9 * Math.min(1, age / 0.23) * Math.exp(-Math.max(0, age - 0.23) * 1.1);\r
      gl.uniform4f(u.uSwirl, swirl.x, swirl.y, canvas.height * 0.22 * (1 + age * 0.5), age < 6 ? twist : 0);\r
      gl.uniform1f(u.uReveal, intro * intro * (3 - 2 * intro));\r
      gl.uniform1f(u.uLight, s.lightMode ? 1 : 0);\r
      gl.uniform1f(u.uOpaque, s.transparent ? 0 : 1);\r
      gl.uniform3fv(u.uBackground, parse(s.backgroundColor, s.lightMode ? [1, 1, 1] : [0.0706, 0.0588, 0.0902]));\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.0005, 0.05) : 1 / 60;\r
      last = now;\r
      const motion = s.paused || reduce ? 0 : 1;\r
      time += dt * motion;\r
      swirl.age += dt;\r
      if (s.intro && !reduce && reveal < 1) reveal = Math.min(1, reveal + dt / INTRO_SECONDS);\r
      else if (!s.intro || reduce) reveal = 1;\r
\r
      const engaged = s.mouseInteraction && pointer.inside;\r
      const follow = s.mouseDampening > 0 ? 1 - Math.exp(-dt / s.mouseDampening) : 1;\r
      if (engaged) {\r
        magnet.x += (pointer.x - magnet.x) * follow;\r
        magnet.y += (pointer.y - magnet.y) * follow;\r
      }\r
      const target = engaged ? 1 : 0;\r
      magnet.active += (target - magnet.active) * (1 - Math.exp(-dt / 0.3));\r
      if (Math.abs(target - magnet.active) < 0.001) magnet.active = target;\r
\r
      render();\r
      const busy = motion > 0 || magnet.active !== target || reveal < 1 || swirl.age < 6;\r
      if (busy) raf = requestAnimationFrame(frame);\r
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
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      render();\r
      wake();\r
    };\r
\r
    const locate = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      const ratio = canvas.width / Math.max(1, rect.width);\r
      pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      pointer.x = x * ratio;\r
      pointer.y = (rect.height - y) * ratio;\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const wasInside = pointer.inside;\r
      locate(event);\r
      if (pointer.inside && !wasInside && magnet.active < 0.05) {\r
        magnet.x = pointer.x;\r
        magnet.y = pointer.y;\r
      }\r
      wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      onPointerMove(event);\r
      if (!pointer.inside || !settingsRef.current.clickSwirl || reduce) return;\r
      swirl.x = pointer.x;\r
      swirl.y = pointer.y;\r
      swirl.age = 0;\r
      wake();\r
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
      style={mixBlendMode ? { ...style, mixBlendMode } : style}\r
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default FluxLines;\r
`,a={usage:`import FluxLines from './FluxLines';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <FluxLines
    colors={['#ffffff', '#ffffff', '#ffffff']}
    glow={2}
    rimWidth={0.2}
    lineWidth={1}
    flowDirection="down"
    mouseInteraction
    clickSwirl
  />
</div>`,code:n,css:r,tailwind:e,tsCode:t,tsTailwind:o};export{a as fluxLines};
