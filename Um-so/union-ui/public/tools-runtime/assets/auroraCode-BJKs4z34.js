const r=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
import './Aurora.css';\r
\r
const MAX_STOPS = 5;\r
const MAX_LAYERS = 3;\r
const INTRO_SECONDS = 2.4;\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform vec2 uResolution;\r
uniform float uTime;\r
uniform vec3 uStops[\${MAX_STOPS}];\r
uniform int uStopCount;\r
uniform float uAmplitude;\r
uniform float uBlend;\r
uniform float uHeight;\r
uniform float uScale;\r
uniform float uGlow;\r
uniform float uBrightness;\r
uniform int uLayers;\r
uniform float uFlip;\r
uniform vec3 uPointer;\r
uniform float uReveal;\r
uniform float uOpacity;\r
uniform float uLightMode;\r
out vec4 outColor;\r
\r
vec3 permute(vec3 x) {\r
  return mod(((x * 34.0) + 1.0) * x, 289.0);\r
}\r
\r
float snoise(vec2 v) {\r
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);\r
  vec2 i = floor(v + dot(v, C.yy));\r
  vec2 x0 = v - i + dot(i, C.xx);\r
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);\r
  vec4 x12 = x0.xyxy + C.xxzz;\r
  x12.xy -= i1;\r
  i = mod(i, 289.0);\r
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));\r
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);\r
  m = m * m;\r
  m = m * m;\r
  vec3 x = 2.0 * fract(p * C.www) - 1.0;\r
  vec3 h = abs(x) - 0.5;\r
  vec3 ox = floor(x + 0.5);\r
  vec3 a0 = x - ox;\r
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);\r
  vec3 g;\r
  g.x = a0.x * x0.x + h.x * x0.y;\r
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;\r
  return 130.0 * dot(m, g);\r
}\r
\r
float smootherstep(float edge0, float edge1, float x) {\r
  float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
vec3 oklabToLinear(vec3 c) {\r
  float l = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;\r
  float m = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;\r
  float s = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;\r
  l = l * l * l;\r
  m = m * m * m;\r
  s = s * s * s;\r
  return vec3(\r
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,\r
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,\r
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s\r
  );\r
}\r
\r
vec3 toSrgb(vec3 c) {\r
  c = clamp(c, 0.0, 1.0);\r
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));\r
}\r
\r
vec3 ramp(float t) {\r
  float x = clamp(t, 0.0, 1.0) * float(uStopCount - 1);\r
  int i = int(min(floor(x), float(uStopCount - 2)));\r
  float f = x - float(i);\r
  f = f * f * (3.0 - 2.0 * f);\r
  vec3 lch = mix(uStops[i], uStops[i + 1], f);\r
  lch.x = mix(lch.x, min(lch.x, 0.7), uLightMode);\r
  return toSrgb(oklabToLinear(vec3(lch.x, lch.y * cos(lch.z), lch.y * sin(lch.z))));\r
}\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
void main() {\r
  vec2 frag = gl_FragCoord.xy;\r
  float y = 1.0 - frag.y / uResolution.y;\r
  y = mix(y, 1.0 - y, uFlip);\r
  float u = frag.x / uResolution.x;\r
  float X = (frag.x - uResolution.x * 0.5) / uResolution.y;\r
  float t = uTime;\r
  float reach = uPointer.z * exp(-pow((X - uPointer.x) / 0.38, 2.0));\r
\r
  vec3 glow = vec3(0.0);\r
  float cover = 0.0;\r
  for (int k = 0; k < \${MAX_LAYERS}; k++) {\r
    if (k >= uLayers) break;\r
    float layer = float(k);\r
    float seed = layer * 13.7;\r
    float pace = t * (1.0 - layer * 0.18);\r
    float warp = snoise(vec2(X * 0.45 * uScale + pace * 0.02 + seed, pace * 0.05 + seed));\r
    float wave = snoise(vec2(X * 0.75 * uScale + warp * 0.35 - pace * 0.03 + seed, pace * 0.07 - seed)) * 0.72\r
      + snoise(vec2(X * 1.6 * uScale + warp * 0.5 + pace * 0.04 - seed, pace * 0.1 + seed * 0.5)) * 0.28;\r
    float hem = uHeight + layer * 0.07 + wave * 0.15 * uAmplitude;\r
    hem += reach * 0.08 * (layer < 0.5 ? 1.0 : 0.4);\r
    hem = mix(-0.25, hem, uReveal);\r
\r
    float soft = (0.04 + uBlend * 0.16) * (1.0 + layer * 0.9);\r
    float rise = hem - y;\r
    float low = -soft - uGlow * 0.14;\r
    float high = 0.26 + soft * 0.6;\r
    float body = pow(smootherstep(low, high, rise), 1.5 + uGlow * 0.6);\r
    float lobes = 0.86 + 0.14 * snoise(vec2(X * 0.9 * uScale - pace * 0.025 + seed, y * 0.3 + pace * 0.04));\r
    float alpha = body * lobes * (layer < 0.5 ? 1.0 : 0.32 / layer);\r
    alpha = clamp(alpha * (1.0 + reach * 0.25 * smootherstep(0.9, 0.0, abs(y - hem))), 0.0, 1.0);\r
\r
    vec3 tint = ramp(u + 0.05 * sin(pace * 0.08 + layer * 2.3) + layer * 0.1 + max(rise, 0.0) * 0.05);\r
    glow = 1.0 - (1.0 - glow) * (1.0 - tint * alpha);\r
    cover = 1.0 - (1.0 - cover) * (1.0 - alpha);\r
  }\r
\r
  float fade = smootherstep(0.0, 0.7, uReveal) * uOpacity;\r
  float strength = clamp(uBrightness, 0.0, 2.0);\r
  glow *= fade * min(strength, 1.0);\r
  cover *= fade * min(strength, 1.0);\r
  glow = 1.0 - pow(1.0 - glow, vec3(max(strength, 1.0)));\r
  float dither = (hash(frag) - 0.5) / 255.0;\r
\r
  if (uLightMode > 0.5) {\r
    vec3 tint = cover > 0.0001 ? glow / cover : vec3(0.0);\r
    cover *= smootherstep(0.0, 0.25, cover);\r
    float alpha = cover * 0.7;\r
    outColor = vec4(tint * alpha + dither, clamp(alpha + dither, 0.0, 1.0));\r
    return;\r
  }\r
  outColor = vec4(glow + dither, clamp(cover + dither, 0.0, 1.0));\r
}\`;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const toOklch = rgb => {\r
  const [r, g, b] = rgb.map(c => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));\r
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);\r
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);\r
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);\r
  const lab = [\r
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,\r
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,\r
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s\r
  ];\r
  return [lab[0], Math.hypot(lab[1], lab[2]), Math.atan2(lab[2], lab[1])];\r
};\r
\r
const unwrapHues = stops => {\r
  const known = stops.findIndex(stop => stop[1] > 0.02);\r
  const anchor = known === -1 ? 0 : stops[known][2];\r
  let previous = anchor;\r
  return stops.map(stop => {\r
    let hue = stop[1] > 0.02 ? stop[2] : previous;\r
    while (hue - previous > Math.PI) hue -= Math.PI * 2;\r
    while (hue - previous < -Math.PI) hue += Math.PI * 2;\r
    previous = hue;\r
    return [stop[0], stop[1], hue];\r
  });\r
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
const Aurora = ({\r
  colorStops = ['#5227FF', '#7cff67', '#5227FF'],\r
  amplitude = 1,\r
  blend = 0.5,\r
  speed = 1,\r
  time,\r
  height = 0.45,\r
  scale = 1,\r
  glow = 0.6,\r
  brightness = 1,\r
  layers = 1,\r
  direction = 'top',\r
  mouseInteraction = true,\r
  intro = true,\r
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
  const stops = (Array.isArray(colorStops) ? colorStops : []).filter(Boolean).map(String).slice(0, MAX_STOPS);\r
  const settings = {\r
    stops: stops.length >= 2 ? stops : stops.length === 1 ? [stops[0], stops[0]] : ['#5227FF', '#7cff67'],\r
    amplitude: Math.max(0, amplitude),\r
    blend: clamp(blend, 0, 1),\r
    speed,\r
    time,\r
    height: clamp(height, 0, 1),\r
    scale: Math.max(0.1, scale),\r
    glow: Math.max(0, glow),\r
    brightness: Math.max(0, brightness),\r
    layers: clamp(Math.round(layers), 1, MAX_LAYERS),\r
    flip: direction === 'bottom' ? 1 : 0,\r
    mouseInteraction,\r
    intro,\r
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
    const cache = new Map();\r
    const parse = value => {\r
      if (cache.has(value)) return cache.get(value);\r
      let rgb = [1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#ffffff';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      cache.set(value, rgb);\r
      return rgb;\r
    };\r
    const palette = new Float32Array(MAX_STOPS * 3);\r
\r
    const view = { width: 1, height: 1 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const state = {\r
      clock: 0,\r
      px: 0,\r
      py: 0.5,\r
      reach: 0,\r
      reveal: settingsRef.current.intro && !reduce ? 0 : 1\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      unwrapHues(s.stops.map(value => toOklch(parse(value)))).forEach((stop, index) => palette.set(stop, index * 3));\r
      const reveal = state.reveal;\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(program.program);\r
      gl.bindVertexArray(vao);\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(u.uTime, s.time !== undefined ? s.time * s.speed * 0.1 : state.clock);\r
      gl.uniform3fv(u.uStops, palette);\r
      gl.uniform1i(u.uStopCount, s.stops.length);\r
      gl.uniform1f(u.uAmplitude, s.amplitude);\r
      gl.uniform1f(u.uBlend, s.blend);\r
      gl.uniform1f(u.uHeight, s.height);\r
      gl.uniform1f(u.uScale, s.scale);\r
      gl.uniform1f(u.uGlow, s.glow);\r
      gl.uniform1f(u.uBrightness, s.brightness);\r
      gl.uniform1i(u.uLayers, s.layers);\r
      gl.uniform1f(u.uFlip, s.flip);\r
      gl.uniform3f(u.uPointer, state.px, state.py, state.reach);\r
      gl.uniform1f(u.uReveal, 1 - Math.pow(1 - reveal, 3));\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.uniform1f(u.uLightMode, s.lightMode ? 1 : 0);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.0005, 0.05) : 1 / 60;\r
      last = now;\r
      if (s.paused) {\r
        state.reveal = 1;\r
        render();\r
        last = 0;\r
        return;\r
      }\r
      const motion = reduce ? 0 : 1;\r
      state.clock += dt * s.speed * motion;\r
      const engaged = s.mouseInteraction && pointer.inside && !reduce;\r
      const follow = 1 - Math.exp(-dt / 0.6);\r
      if (engaged) {\r
        const tx = (pointer.x - view.width / 2) / view.height;\r
        const ty = s.flip ? 1 - pointer.y / view.height : pointer.y / view.height;\r
        state.px += (tx - state.px) * follow;\r
        state.py += (ty - state.py) * follow;\r
      }\r
      state.reach += ((engaged ? 1 : 0) - state.reach) * (1 - Math.exp(-dt / (engaged ? 0.9 : 1.4)));\r
      if (!s.intro || reduce) state.reveal = 1;\r
      else if (state.reveal < 1) state.reveal = Math.min(1, state.reveal + dt / INTRO_SECONDS);\r
      render();\r
      raf = requestAnimationFrame(frame);\r
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
      render();\r
      wake();\r
    };\r
\r
    const onPointerMove = event => {\r
      const rect = container.getBoundingClientRect();\r
      pointer.x = event.clientX - rect.left;\r
      pointer.y = event.clientY - rect.top;\r
      const wasInside = pointer.inside;\r
      pointer.inside = pointer.x >= 0 && pointer.y >= 0 && pointer.x <= rect.width && pointer.y <= rect.height;\r
      if (pointer.inside && !wasInside) {\r
        const s = settingsRef.current;\r
        state.px = (pointer.x - rect.width / 2) / Math.max(1, rect.height);\r
        state.py = s.flip ? 1 - pointer.y / Math.max(1, rect.height) : pointer.y / Math.max(1, rect.height);\r
      }\r
      if (!settingsRef.current.paused) wake();\r
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
    window.addEventListener('pointerdown', onPointerMove, { passive: true });\r
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
      window.removeEventListener('pointerdown', onPointerMove);\r
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
    <div ref={containerRef} className={\`aurora-container\${className ? \` \${className}\` : ''}\`} style={style}>\r
      <canvas ref={canvasRef} className="aurora-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Aurora;\r
`,n=`.aurora-container {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.aurora-canvas {\r
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
const MAX_STOPS = 5;\r
const MAX_LAYERS = 3;\r
const INTRO_SECONDS = 2.4;\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform vec2 uResolution;\r
uniform float uTime;\r
uniform vec3 uStops[\${MAX_STOPS}];\r
uniform int uStopCount;\r
uniform float uAmplitude;\r
uniform float uBlend;\r
uniform float uHeight;\r
uniform float uScale;\r
uniform float uGlow;\r
uniform float uBrightness;\r
uniform int uLayers;\r
uniform float uFlip;\r
uniform vec3 uPointer;\r
uniform float uReveal;\r
uniform float uOpacity;\r
uniform float uLightMode;\r
out vec4 outColor;\r
\r
vec3 permute(vec3 x) {\r
  return mod(((x * 34.0) + 1.0) * x, 289.0);\r
}\r
\r
float snoise(vec2 v) {\r
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);\r
  vec2 i = floor(v + dot(v, C.yy));\r
  vec2 x0 = v - i + dot(i, C.xx);\r
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);\r
  vec4 x12 = x0.xyxy + C.xxzz;\r
  x12.xy -= i1;\r
  i = mod(i, 289.0);\r
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));\r
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);\r
  m = m * m;\r
  m = m * m;\r
  vec3 x = 2.0 * fract(p * C.www) - 1.0;\r
  vec3 h = abs(x) - 0.5;\r
  vec3 ox = floor(x + 0.5);\r
  vec3 a0 = x - ox;\r
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);\r
  vec3 g;\r
  g.x = a0.x * x0.x + h.x * x0.y;\r
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;\r
  return 130.0 * dot(m, g);\r
}\r
\r
float smootherstep(float edge0, float edge1, float x) {\r
  float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
vec3 oklabToLinear(vec3 c) {\r
  float l = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;\r
  float m = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;\r
  float s = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;\r
  l = l * l * l;\r
  m = m * m * m;\r
  s = s * s * s;\r
  return vec3(\r
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,\r
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,\r
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s\r
  );\r
}\r
\r
vec3 toSrgb(vec3 c) {\r
  c = clamp(c, 0.0, 1.0);\r
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));\r
}\r
\r
vec3 ramp(float t) {\r
  float x = clamp(t, 0.0, 1.0) * float(uStopCount - 1);\r
  int i = int(min(floor(x), float(uStopCount - 2)));\r
  float f = x - float(i);\r
  f = f * f * (3.0 - 2.0 * f);\r
  vec3 lch = mix(uStops[i], uStops[i + 1], f);\r
  lch.x = mix(lch.x, min(lch.x, 0.7), uLightMode);\r
  return toSrgb(oklabToLinear(vec3(lch.x, lch.y * cos(lch.z), lch.y * sin(lch.z))));\r
}\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
void main() {\r
  vec2 frag = gl_FragCoord.xy;\r
  float y = 1.0 - frag.y / uResolution.y;\r
  y = mix(y, 1.0 - y, uFlip);\r
  float u = frag.x / uResolution.x;\r
  float X = (frag.x - uResolution.x * 0.5) / uResolution.y;\r
  float t = uTime;\r
  float reach = uPointer.z * exp(-pow((X - uPointer.x) / 0.38, 2.0));\r
\r
  vec3 glow = vec3(0.0);\r
  float cover = 0.0;\r
  for (int k = 0; k < \${MAX_LAYERS}; k++) {\r
    if (k >= uLayers) break;\r
    float layer = float(k);\r
    float seed = layer * 13.7;\r
    float pace = t * (1.0 - layer * 0.18);\r
    float warp = snoise(vec2(X * 0.45 * uScale + pace * 0.02 + seed, pace * 0.05 + seed));\r
    float wave = snoise(vec2(X * 0.75 * uScale + warp * 0.35 - pace * 0.03 + seed, pace * 0.07 - seed)) * 0.72\r
      + snoise(vec2(X * 1.6 * uScale + warp * 0.5 + pace * 0.04 - seed, pace * 0.1 + seed * 0.5)) * 0.28;\r
    float hem = uHeight + layer * 0.07 + wave * 0.15 * uAmplitude;\r
    hem += reach * 0.08 * (layer < 0.5 ? 1.0 : 0.4);\r
    hem = mix(-0.25, hem, uReveal);\r
\r
    float soft = (0.04 + uBlend * 0.16) * (1.0 + layer * 0.9);\r
    float rise = hem - y;\r
    float low = -soft - uGlow * 0.14;\r
    float high = 0.26 + soft * 0.6;\r
    float body = pow(smootherstep(low, high, rise), 1.5 + uGlow * 0.6);\r
    float lobes = 0.86 + 0.14 * snoise(vec2(X * 0.9 * uScale - pace * 0.025 + seed, y * 0.3 + pace * 0.04));\r
    float alpha = body * lobes * (layer < 0.5 ? 1.0 : 0.32 / layer);\r
    alpha = clamp(alpha * (1.0 + reach * 0.25 * smootherstep(0.9, 0.0, abs(y - hem))), 0.0, 1.0);\r
\r
    vec3 tint = ramp(u + 0.05 * sin(pace * 0.08 + layer * 2.3) + layer * 0.1 + max(rise, 0.0) * 0.05);\r
    glow = 1.0 - (1.0 - glow) * (1.0 - tint * alpha);\r
    cover = 1.0 - (1.0 - cover) * (1.0 - alpha);\r
  }\r
\r
  float fade = smootherstep(0.0, 0.7, uReveal) * uOpacity;\r
  float strength = clamp(uBrightness, 0.0, 2.0);\r
  glow *= fade * min(strength, 1.0);\r
  cover *= fade * min(strength, 1.0);\r
  glow = 1.0 - pow(1.0 - glow, vec3(max(strength, 1.0)));\r
  float dither = (hash(frag) - 0.5) / 255.0;\r
\r
  if (uLightMode > 0.5) {\r
    vec3 tint = cover > 0.0001 ? glow / cover : vec3(0.0);\r
    cover *= smootherstep(0.0, 0.25, cover);\r
    float alpha = cover * 0.7;\r
    outColor = vec4(tint * alpha + dither, clamp(alpha + dither, 0.0, 1.0));\r
    return;\r
  }\r
  outColor = vec4(glow + dither, clamp(cover + dither, 0.0, 1.0));\r
}\`;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const toOklch = rgb => {\r
  const [r, g, b] = rgb.map(c => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));\r
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);\r
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);\r
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);\r
  const lab = [\r
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,\r
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,\r
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s\r
  ];\r
  return [lab[0], Math.hypot(lab[1], lab[2]), Math.atan2(lab[2], lab[1])];\r
};\r
\r
const unwrapHues = stops => {\r
  const known = stops.findIndex(stop => stop[1] > 0.02);\r
  const anchor = known === -1 ? 0 : stops[known][2];\r
  let previous = anchor;\r
  return stops.map(stop => {\r
    let hue = stop[1] > 0.02 ? stop[2] : previous;\r
    while (hue - previous > Math.PI) hue -= Math.PI * 2;\r
    while (hue - previous < -Math.PI) hue += Math.PI * 2;\r
    previous = hue;\r
    return [stop[0], stop[1], hue];\r
  });\r
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
const Aurora = ({\r
  colorStops = ['#5227FF', '#7cff67', '#5227FF'],\r
  amplitude = 1,\r
  blend = 0.5,\r
  speed = 1,\r
  time,\r
  height = 0.45,\r
  scale = 1,\r
  glow = 0.6,\r
  brightness = 1,\r
  layers = 1,\r
  direction = 'top',\r
  mouseInteraction = true,\r
  intro = true,\r
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
  const stops = (Array.isArray(colorStops) ? colorStops : []).filter(Boolean).map(String).slice(0, MAX_STOPS);\r
  const settings = {\r
    stops: stops.length >= 2 ? stops : stops.length === 1 ? [stops[0], stops[0]] : ['#5227FF', '#7cff67'],\r
    amplitude: Math.max(0, amplitude),\r
    blend: clamp(blend, 0, 1),\r
    speed,\r
    time,\r
    height: clamp(height, 0, 1),\r
    scale: Math.max(0.1, scale),\r
    glow: Math.max(0, glow),\r
    brightness: Math.max(0, brightness),\r
    layers: clamp(Math.round(layers), 1, MAX_LAYERS),\r
    flip: direction === 'bottom' ? 1 : 0,\r
    mouseInteraction,\r
    intro,\r
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
    const cache = new Map();\r
    const parse = value => {\r
      if (cache.has(value)) return cache.get(value);\r
      let rgb = [1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#ffffff';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      cache.set(value, rgb);\r
      return rgb;\r
    };\r
    const palette = new Float32Array(MAX_STOPS * 3);\r
\r
    const view = { width: 1, height: 1 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const state = {\r
      clock: 0,\r
      px: 0,\r
      py: 0.5,\r
      reach: 0,\r
      reveal: settingsRef.current.intro && !reduce ? 0 : 1\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      unwrapHues(s.stops.map(value => toOklch(parse(value)))).forEach((stop, index) => palette.set(stop, index * 3));\r
      const reveal = state.reveal;\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(program.program);\r
      gl.bindVertexArray(vao);\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(u.uTime, s.time !== undefined ? s.time * s.speed * 0.1 : state.clock);\r
      gl.uniform3fv(u.uStops, palette);\r
      gl.uniform1i(u.uStopCount, s.stops.length);\r
      gl.uniform1f(u.uAmplitude, s.amplitude);\r
      gl.uniform1f(u.uBlend, s.blend);\r
      gl.uniform1f(u.uHeight, s.height);\r
      gl.uniform1f(u.uScale, s.scale);\r
      gl.uniform1f(u.uGlow, s.glow);\r
      gl.uniform1f(u.uBrightness, s.brightness);\r
      gl.uniform1i(u.uLayers, s.layers);\r
      gl.uniform1f(u.uFlip, s.flip);\r
      gl.uniform3f(u.uPointer, state.px, state.py, state.reach);\r
      gl.uniform1f(u.uReveal, 1 - Math.pow(1 - reveal, 3));\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.uniform1f(u.uLightMode, s.lightMode ? 1 : 0);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.0005, 0.05) : 1 / 60;\r
      last = now;\r
      if (s.paused) {\r
        state.reveal = 1;\r
        render();\r
        last = 0;\r
        return;\r
      }\r
      const motion = reduce ? 0 : 1;\r
      state.clock += dt * s.speed * motion;\r
      const engaged = s.mouseInteraction && pointer.inside && !reduce;\r
      const follow = 1 - Math.exp(-dt / 0.6);\r
      if (engaged) {\r
        const tx = (pointer.x - view.width / 2) / view.height;\r
        const ty = s.flip ? 1 - pointer.y / view.height : pointer.y / view.height;\r
        state.px += (tx - state.px) * follow;\r
        state.py += (ty - state.py) * follow;\r
      }\r
      state.reach += ((engaged ? 1 : 0) - state.reach) * (1 - Math.exp(-dt / (engaged ? 0.9 : 1.4)));\r
      if (!s.intro || reduce) state.reveal = 1;\r
      else if (state.reveal < 1) state.reveal = Math.min(1, state.reveal + dt / INTRO_SECONDS);\r
      render();\r
      raf = requestAnimationFrame(frame);\r
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
      render();\r
      wake();\r
    };\r
\r
    const onPointerMove = event => {\r
      const rect = container.getBoundingClientRect();\r
      pointer.x = event.clientX - rect.left;\r
      pointer.y = event.clientY - rect.top;\r
      const wasInside = pointer.inside;\r
      pointer.inside = pointer.x >= 0 && pointer.y >= 0 && pointer.x <= rect.width && pointer.y <= rect.height;\r
      if (pointer.inside && !wasInside) {\r
        const s = settingsRef.current;\r
        state.px = (pointer.x - rect.width / 2) / Math.max(1, rect.height);\r
        state.py = s.flip ? 1 - pointer.y / Math.max(1, rect.height) : pointer.y / Math.max(1, rect.height);\r
      }\r
      if (!settingsRef.current.paused) wake();\r
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
    window.addEventListener('pointerdown', onPointerMove, { passive: true });\r
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
      window.removeEventListener('pointerdown', onPointerMove);\r
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
      style={style}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Aurora;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties } from 'react';\r
import './Aurora.css';\r
\r
export interface AuroraProps {\r
  colorStops?: string[];\r
  amplitude?: number;\r
  blend?: number;\r
  speed?: number;\r
  time?: number;\r
  height?: number;\r
  scale?: number;\r
  glow?: number;\r
  brightness?: number;\r
  layers?: number;\r
  direction?: 'top' | 'bottom';\r
  mouseInteraction?: boolean;\r
  intro?: boolean;\r
  opacity?: number;\r
  lightMode?: boolean;\r
  paused?: boolean;\r
  dpr?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
type Settings = {\r
  stops: string[];\r
  amplitude: number;\r
  blend: number;\r
  speed: number;\r
  time?: number;\r
  height: number;\r
  scale: number;\r
  glow: number;\r
  brightness: number;\r
  layers: number;\r
  flip: number;\r
  mouseInteraction: boolean;\r
  intro: boolean;\r
  opacity: number;\r
  lightMode: boolean;\r
  paused: boolean;\r
  dpr?: number;\r
};\r
\r
type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };\r
\r
const MAX_STOPS = 5;\r
const MAX_LAYERS = 3;\r
const INTRO_SECONDS = 2.4;\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform vec2 uResolution;\r
uniform float uTime;\r
uniform vec3 uStops[\${MAX_STOPS}];\r
uniform int uStopCount;\r
uniform float uAmplitude;\r
uniform float uBlend;\r
uniform float uHeight;\r
uniform float uScale;\r
uniform float uGlow;\r
uniform float uBrightness;\r
uniform int uLayers;\r
uniform float uFlip;\r
uniform vec3 uPointer;\r
uniform float uReveal;\r
uniform float uOpacity;\r
uniform float uLightMode;\r
out vec4 outColor;\r
\r
vec3 permute(vec3 x) {\r
  return mod(((x * 34.0) + 1.0) * x, 289.0);\r
}\r
\r
float snoise(vec2 v) {\r
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);\r
  vec2 i = floor(v + dot(v, C.yy));\r
  vec2 x0 = v - i + dot(i, C.xx);\r
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);\r
  vec4 x12 = x0.xyxy + C.xxzz;\r
  x12.xy -= i1;\r
  i = mod(i, 289.0);\r
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));\r
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);\r
  m = m * m;\r
  m = m * m;\r
  vec3 x = 2.0 * fract(p * C.www) - 1.0;\r
  vec3 h = abs(x) - 0.5;\r
  vec3 ox = floor(x + 0.5);\r
  vec3 a0 = x - ox;\r
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);\r
  vec3 g;\r
  g.x = a0.x * x0.x + h.x * x0.y;\r
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;\r
  return 130.0 * dot(m, g);\r
}\r
\r
float smootherstep(float edge0, float edge1, float x) {\r
  float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
vec3 oklabToLinear(vec3 c) {\r
  float l = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;\r
  float m = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;\r
  float s = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;\r
  l = l * l * l;\r
  m = m * m * m;\r
  s = s * s * s;\r
  return vec3(\r
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,\r
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,\r
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s\r
  );\r
}\r
\r
vec3 toSrgb(vec3 c) {\r
  c = clamp(c, 0.0, 1.0);\r
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));\r
}\r
\r
vec3 ramp(float t) {\r
  float x = clamp(t, 0.0, 1.0) * float(uStopCount - 1);\r
  int i = int(min(floor(x), float(uStopCount - 2)));\r
  float f = x - float(i);\r
  f = f * f * (3.0 - 2.0 * f);\r
  vec3 lch = mix(uStops[i], uStops[i + 1], f);\r
  lch.x = mix(lch.x, min(lch.x, 0.7), uLightMode);\r
  return toSrgb(oklabToLinear(vec3(lch.x, lch.y * cos(lch.z), lch.y * sin(lch.z))));\r
}\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
void main() {\r
  vec2 frag = gl_FragCoord.xy;\r
  float y = 1.0 - frag.y / uResolution.y;\r
  y = mix(y, 1.0 - y, uFlip);\r
  float u = frag.x / uResolution.x;\r
  float X = (frag.x - uResolution.x * 0.5) / uResolution.y;\r
  float t = uTime;\r
  float reach = uPointer.z * exp(-pow((X - uPointer.x) / 0.38, 2.0));\r
\r
  vec3 glow = vec3(0.0);\r
  float cover = 0.0;\r
  for (int k = 0; k < \${MAX_LAYERS}; k++) {\r
    if (k >= uLayers) break;\r
    float layer = float(k);\r
    float seed = layer * 13.7;\r
    float pace = t * (1.0 - layer * 0.18);\r
    float warp = snoise(vec2(X * 0.45 * uScale + pace * 0.02 + seed, pace * 0.05 + seed));\r
    float wave = snoise(vec2(X * 0.75 * uScale + warp * 0.35 - pace * 0.03 + seed, pace * 0.07 - seed)) * 0.72\r
      + snoise(vec2(X * 1.6 * uScale + warp * 0.5 + pace * 0.04 - seed, pace * 0.1 + seed * 0.5)) * 0.28;\r
    float hem = uHeight + layer * 0.07 + wave * 0.15 * uAmplitude;\r
    hem += reach * 0.08 * (layer < 0.5 ? 1.0 : 0.4);\r
    hem = mix(-0.25, hem, uReveal);\r
\r
    float soft = (0.04 + uBlend * 0.16) * (1.0 + layer * 0.9);\r
    float rise = hem - y;\r
    float low = -soft - uGlow * 0.14;\r
    float high = 0.26 + soft * 0.6;\r
    float body = pow(smootherstep(low, high, rise), 1.5 + uGlow * 0.6);\r
    float lobes = 0.86 + 0.14 * snoise(vec2(X * 0.9 * uScale - pace * 0.025 + seed, y * 0.3 + pace * 0.04));\r
    float alpha = body * lobes * (layer < 0.5 ? 1.0 : 0.32 / layer);\r
    alpha = clamp(alpha * (1.0 + reach * 0.25 * smootherstep(0.9, 0.0, abs(y - hem))), 0.0, 1.0);\r
\r
    vec3 tint = ramp(u + 0.05 * sin(pace * 0.08 + layer * 2.3) + layer * 0.1 + max(rise, 0.0) * 0.05);\r
    glow = 1.0 - (1.0 - glow) * (1.0 - tint * alpha);\r
    cover = 1.0 - (1.0 - cover) * (1.0 - alpha);\r
  }\r
\r
  float fade = smootherstep(0.0, 0.7, uReveal) * uOpacity;\r
  float strength = clamp(uBrightness, 0.0, 2.0);\r
  glow *= fade * min(strength, 1.0);\r
  cover *= fade * min(strength, 1.0);\r
  glow = 1.0 - pow(1.0 - glow, vec3(max(strength, 1.0)));\r
  float dither = (hash(frag) - 0.5) / 255.0;\r
\r
  if (uLightMode > 0.5) {\r
    vec3 tint = cover > 0.0001 ? glow / cover : vec3(0.0);\r
    cover *= smootherstep(0.0, 0.25, cover);\r
    float alpha = cover * 0.7;\r
    outColor = vec4(tint * alpha + dither, clamp(alpha + dither, 0.0, 1.0));\r
    return;\r
  }\r
  outColor = vec4(glow + dither, clamp(cover + dither, 0.0, 1.0));\r
}\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const toOklch = (rgb: number[]): number[] => {\r
  const [r, g, b] = rgb.map(c => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));\r
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);\r
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);\r
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);\r
  const lab = [\r
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,\r
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,\r
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s\r
  ];\r
  return [lab[0], Math.hypot(lab[1], lab[2]), Math.atan2(lab[2], lab[1])];\r
};\r
\r
const unwrapHues = (stops: number[][]): number[][] => {\r
  const known = stops.findIndex(stop => stop[1] > 0.02);\r
  const anchor = known === -1 ? 0 : stops[known][2];\r
  let previous = anchor;\r
  return stops.map(stop => {\r
    let hue = stop[1] > 0.02 ? stop[2] : previous;\r
    while (hue - previous > Math.PI) hue -= Math.PI * 2;\r
    while (hue - previous < -Math.PI) hue += Math.PI * 2;\r
    previous = hue;\r
    return [stop[0], stop[1], hue];\r
  });\r
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
const Aurora = ({\r
  colorStops = ['#5227FF', '#7cff67', '#5227FF'],\r
  amplitude = 1,\r
  blend = 0.5,\r
  speed = 1,\r
  time,\r
  height = 0.45,\r
  scale = 1,\r
  glow = 0.6,\r
  brightness = 1,\r
  layers = 1,\r
  direction = 'top',\r
  mouseInteraction = true,\r
  intro = true,\r
  opacity = 1,\r
  lightMode = false,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  style\r
}: AuroraProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const stops = (Array.isArray(colorStops) ? colorStops : []).filter(Boolean).map(String).slice(0, MAX_STOPS);\r
  const settings: Settings = {\r
    stops: stops.length >= 2 ? stops : stops.length === 1 ? [stops[0], stops[0]] : ['#5227FF', '#7cff67'],\r
    amplitude: Math.max(0, amplitude),\r
    blend: clamp(blend, 0, 1),\r
    speed,\r
    time,\r
    height: clamp(height, 0, 1),\r
    scale: Math.max(0.1, scale),\r
    glow: Math.max(0, glow),\r
    brightness: Math.max(0, brightness),\r
    layers: clamp(Math.round(layers), 1, MAX_LAYERS),\r
    flip: direction === 'bottom' ? 1 : 0,\r
    mouseInteraction,\r
    intro,\r
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
    const cache = new Map<string, number[]>();\r
    const parse = (value: string): number[] => {\r
      const cached = cache.get(value);\r
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
      cache.set(value, rgb);\r
      return rgb;\r
    };\r
    const palette = new Float32Array(MAX_STOPS * 3);\r
\r
    const view = { width: 1, height: 1 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const state = {\r
      clock: 0,\r
      px: 0,\r
      py: 0.5,\r
      reach: 0,\r
      reveal: settingsRef.current.intro && !reduce ? 0 : 1\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      unwrapHues(s.stops.map(value => toOklch(parse(value)))).forEach((stop, index) => palette.set(stop, index * 3));\r
      const reveal = state.reveal;\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(program.program);\r
      gl.bindVertexArray(vao);\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(u.uTime, s.time !== undefined ? s.time * s.speed * 0.1 : state.clock);\r
      gl.uniform3fv(u.uStops, palette);\r
      gl.uniform1i(u.uStopCount, s.stops.length);\r
      gl.uniform1f(u.uAmplitude, s.amplitude);\r
      gl.uniform1f(u.uBlend, s.blend);\r
      gl.uniform1f(u.uHeight, s.height);\r
      gl.uniform1f(u.uScale, s.scale);\r
      gl.uniform1f(u.uGlow, s.glow);\r
      gl.uniform1f(u.uBrightness, s.brightness);\r
      gl.uniform1i(u.uLayers, s.layers);\r
      gl.uniform1f(u.uFlip, s.flip);\r
      gl.uniform3f(u.uPointer, state.px, state.py, state.reach);\r
      gl.uniform1f(u.uReveal, 1 - Math.pow(1 - reveal, 3));\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.uniform1f(u.uLightMode, s.lightMode ? 1 : 0);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.0005, 0.05) : 1 / 60;\r
      last = now;\r
      if (s.paused) {\r
        state.reveal = 1;\r
        render();\r
        last = 0;\r
        return;\r
      }\r
      const motion = reduce ? 0 : 1;\r
      state.clock += dt * s.speed * motion;\r
      const engaged = s.mouseInteraction && pointer.inside && !reduce;\r
      const follow = 1 - Math.exp(-dt / 0.6);\r
      if (engaged) {\r
        const tx = (pointer.x - view.width / 2) / view.height;\r
        const ty = s.flip ? 1 - pointer.y / view.height : pointer.y / view.height;\r
        state.px += (tx - state.px) * follow;\r
        state.py += (ty - state.py) * follow;\r
      }\r
      state.reach += ((engaged ? 1 : 0) - state.reach) * (1 - Math.exp(-dt / (engaged ? 0.9 : 1.4)));\r
      if (!s.intro || reduce) state.reveal = 1;\r
      else if (state.reveal < 1) state.reveal = Math.min(1, state.reveal + dt / INTRO_SECONDS);\r
      render();\r
      raf = requestAnimationFrame(frame);\r
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
      render();\r
      wake();\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      pointer.x = event.clientX - rect.left;\r
      pointer.y = event.clientY - rect.top;\r
      const wasInside = pointer.inside;\r
      pointer.inside = pointer.x >= 0 && pointer.y >= 0 && pointer.x <= rect.width && pointer.y <= rect.height;\r
      if (pointer.inside && !wasInside) {\r
        const s = settingsRef.current;\r
        state.px = (pointer.x - rect.width / 2) / Math.max(1, rect.height);\r
        state.py = s.flip ? 1 - pointer.y / Math.max(1, rect.height) : pointer.y / Math.max(1, rect.height);\r
      }\r
      if (!settingsRef.current.paused) wake();\r
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
    window.addEventListener('pointerdown', onPointerMove, { passive: true });\r
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
      window.removeEventListener('pointerdown', onPointerMove);\r
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
    <div ref={containerRef} className={\`aurora-container\${className ? \` \${className}\` : ''}\`} style={style}>\r
      <canvas ref={canvasRef} className="aurora-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Aurora;\r
`,o=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties } from 'react';\r
\r
export interface AuroraProps {\r
  colorStops?: string[];\r
  amplitude?: number;\r
  blend?: number;\r
  speed?: number;\r
  time?: number;\r
  height?: number;\r
  scale?: number;\r
  glow?: number;\r
  brightness?: number;\r
  layers?: number;\r
  direction?: 'top' | 'bottom';\r
  mouseInteraction?: boolean;\r
  intro?: boolean;\r
  opacity?: number;\r
  lightMode?: boolean;\r
  paused?: boolean;\r
  dpr?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
type Settings = {\r
  stops: string[];\r
  amplitude: number;\r
  blend: number;\r
  speed: number;\r
  time?: number;\r
  height: number;\r
  scale: number;\r
  glow: number;\r
  brightness: number;\r
  layers: number;\r
  flip: number;\r
  mouseInteraction: boolean;\r
  intro: boolean;\r
  opacity: number;\r
  lightMode: boolean;\r
  paused: boolean;\r
  dpr?: number;\r
};\r
\r
type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };\r
\r
const MAX_STOPS = 5;\r
const MAX_LAYERS = 3;\r
const INTRO_SECONDS = 2.4;\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform vec2 uResolution;\r
uniform float uTime;\r
uniform vec3 uStops[\${MAX_STOPS}];\r
uniform int uStopCount;\r
uniform float uAmplitude;\r
uniform float uBlend;\r
uniform float uHeight;\r
uniform float uScale;\r
uniform float uGlow;\r
uniform float uBrightness;\r
uniform int uLayers;\r
uniform float uFlip;\r
uniform vec3 uPointer;\r
uniform float uReveal;\r
uniform float uOpacity;\r
uniform float uLightMode;\r
out vec4 outColor;\r
\r
vec3 permute(vec3 x) {\r
  return mod(((x * 34.0) + 1.0) * x, 289.0);\r
}\r
\r
float snoise(vec2 v) {\r
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);\r
  vec2 i = floor(v + dot(v, C.yy));\r
  vec2 x0 = v - i + dot(i, C.xx);\r
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);\r
  vec4 x12 = x0.xyxy + C.xxzz;\r
  x12.xy -= i1;\r
  i = mod(i, 289.0);\r
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));\r
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);\r
  m = m * m;\r
  m = m * m;\r
  vec3 x = 2.0 * fract(p * C.www) - 1.0;\r
  vec3 h = abs(x) - 0.5;\r
  vec3 ox = floor(x + 0.5);\r
  vec3 a0 = x - ox;\r
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);\r
  vec3 g;\r
  g.x = a0.x * x0.x + h.x * x0.y;\r
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;\r
  return 130.0 * dot(m, g);\r
}\r
\r
float smootherstep(float edge0, float edge1, float x) {\r
  float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
vec3 oklabToLinear(vec3 c) {\r
  float l = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;\r
  float m = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;\r
  float s = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;\r
  l = l * l * l;\r
  m = m * m * m;\r
  s = s * s * s;\r
  return vec3(\r
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,\r
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,\r
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s\r
  );\r
}\r
\r
vec3 toSrgb(vec3 c) {\r
  c = clamp(c, 0.0, 1.0);\r
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));\r
}\r
\r
vec3 ramp(float t) {\r
  float x = clamp(t, 0.0, 1.0) * float(uStopCount - 1);\r
  int i = int(min(floor(x), float(uStopCount - 2)));\r
  float f = x - float(i);\r
  f = f * f * (3.0 - 2.0 * f);\r
  vec3 lch = mix(uStops[i], uStops[i + 1], f);\r
  lch.x = mix(lch.x, min(lch.x, 0.7), uLightMode);\r
  return toSrgb(oklabToLinear(vec3(lch.x, lch.y * cos(lch.z), lch.y * sin(lch.z))));\r
}\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
void main() {\r
  vec2 frag = gl_FragCoord.xy;\r
  float y = 1.0 - frag.y / uResolution.y;\r
  y = mix(y, 1.0 - y, uFlip);\r
  float u = frag.x / uResolution.x;\r
  float X = (frag.x - uResolution.x * 0.5) / uResolution.y;\r
  float t = uTime;\r
  float reach = uPointer.z * exp(-pow((X - uPointer.x) / 0.38, 2.0));\r
\r
  vec3 glow = vec3(0.0);\r
  float cover = 0.0;\r
  for (int k = 0; k < \${MAX_LAYERS}; k++) {\r
    if (k >= uLayers) break;\r
    float layer = float(k);\r
    float seed = layer * 13.7;\r
    float pace = t * (1.0 - layer * 0.18);\r
    float warp = snoise(vec2(X * 0.45 * uScale + pace * 0.02 + seed, pace * 0.05 + seed));\r
    float wave = snoise(vec2(X * 0.75 * uScale + warp * 0.35 - pace * 0.03 + seed, pace * 0.07 - seed)) * 0.72\r
      + snoise(vec2(X * 1.6 * uScale + warp * 0.5 + pace * 0.04 - seed, pace * 0.1 + seed * 0.5)) * 0.28;\r
    float hem = uHeight + layer * 0.07 + wave * 0.15 * uAmplitude;\r
    hem += reach * 0.08 * (layer < 0.5 ? 1.0 : 0.4);\r
    hem = mix(-0.25, hem, uReveal);\r
\r
    float soft = (0.04 + uBlend * 0.16) * (1.0 + layer * 0.9);\r
    float rise = hem - y;\r
    float low = -soft - uGlow * 0.14;\r
    float high = 0.26 + soft * 0.6;\r
    float body = pow(smootherstep(low, high, rise), 1.5 + uGlow * 0.6);\r
    float lobes = 0.86 + 0.14 * snoise(vec2(X * 0.9 * uScale - pace * 0.025 + seed, y * 0.3 + pace * 0.04));\r
    float alpha = body * lobes * (layer < 0.5 ? 1.0 : 0.32 / layer);\r
    alpha = clamp(alpha * (1.0 + reach * 0.25 * smootherstep(0.9, 0.0, abs(y - hem))), 0.0, 1.0);\r
\r
    vec3 tint = ramp(u + 0.05 * sin(pace * 0.08 + layer * 2.3) + layer * 0.1 + max(rise, 0.0) * 0.05);\r
    glow = 1.0 - (1.0 - glow) * (1.0 - tint * alpha);\r
    cover = 1.0 - (1.0 - cover) * (1.0 - alpha);\r
  }\r
\r
  float fade = smootherstep(0.0, 0.7, uReveal) * uOpacity;\r
  float strength = clamp(uBrightness, 0.0, 2.0);\r
  glow *= fade * min(strength, 1.0);\r
  cover *= fade * min(strength, 1.0);\r
  glow = 1.0 - pow(1.0 - glow, vec3(max(strength, 1.0)));\r
  float dither = (hash(frag) - 0.5) / 255.0;\r
\r
  if (uLightMode > 0.5) {\r
    vec3 tint = cover > 0.0001 ? glow / cover : vec3(0.0);\r
    cover *= smootherstep(0.0, 0.25, cover);\r
    float alpha = cover * 0.7;\r
    outColor = vec4(tint * alpha + dither, clamp(alpha + dither, 0.0, 1.0));\r
    return;\r
  }\r
  outColor = vec4(glow + dither, clamp(cover + dither, 0.0, 1.0));\r
}\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const toOklch = (rgb: number[]): number[] => {\r
  const [r, g, b] = rgb.map(c => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));\r
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);\r
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);\r
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);\r
  const lab = [\r
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,\r
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,\r
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s\r
  ];\r
  return [lab[0], Math.hypot(lab[1], lab[2]), Math.atan2(lab[2], lab[1])];\r
};\r
\r
const unwrapHues = (stops: number[][]): number[][] => {\r
  const known = stops.findIndex(stop => stop[1] > 0.02);\r
  const anchor = known === -1 ? 0 : stops[known][2];\r
  let previous = anchor;\r
  return stops.map(stop => {\r
    let hue = stop[1] > 0.02 ? stop[2] : previous;\r
    while (hue - previous > Math.PI) hue -= Math.PI * 2;\r
    while (hue - previous < -Math.PI) hue += Math.PI * 2;\r
    previous = hue;\r
    return [stop[0], stop[1], hue];\r
  });\r
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
const Aurora = ({\r
  colorStops = ['#5227FF', '#7cff67', '#5227FF'],\r
  amplitude = 1,\r
  blend = 0.5,\r
  speed = 1,\r
  time,\r
  height = 0.45,\r
  scale = 1,\r
  glow = 0.6,\r
  brightness = 1,\r
  layers = 1,\r
  direction = 'top',\r
  mouseInteraction = true,\r
  intro = true,\r
  opacity = 1,\r
  lightMode = false,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  style\r
}: AuroraProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const stops = (Array.isArray(colorStops) ? colorStops : []).filter(Boolean).map(String).slice(0, MAX_STOPS);\r
  const settings: Settings = {\r
    stops: stops.length >= 2 ? stops : stops.length === 1 ? [stops[0], stops[0]] : ['#5227FF', '#7cff67'],\r
    amplitude: Math.max(0, amplitude),\r
    blend: clamp(blend, 0, 1),\r
    speed,\r
    time,\r
    height: clamp(height, 0, 1),\r
    scale: Math.max(0.1, scale),\r
    glow: Math.max(0, glow),\r
    brightness: Math.max(0, brightness),\r
    layers: clamp(Math.round(layers), 1, MAX_LAYERS),\r
    flip: direction === 'bottom' ? 1 : 0,\r
    mouseInteraction,\r
    intro,\r
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
    const cache = new Map<string, number[]>();\r
    const parse = (value: string): number[] => {\r
      const cached = cache.get(value);\r
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
      cache.set(value, rgb);\r
      return rgb;\r
    };\r
    const palette = new Float32Array(MAX_STOPS * 3);\r
\r
    const view = { width: 1, height: 1 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const state = {\r
      clock: 0,\r
      px: 0,\r
      py: 0.5,\r
      reach: 0,\r
      reveal: settingsRef.current.intro && !reduce ? 0 : 1\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      unwrapHues(s.stops.map(value => toOklch(parse(value)))).forEach((stop, index) => palette.set(stop, index * 3));\r
      const reveal = state.reveal;\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(program.program);\r
      gl.bindVertexArray(vao);\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(u.uTime, s.time !== undefined ? s.time * s.speed * 0.1 : state.clock);\r
      gl.uniform3fv(u.uStops, palette);\r
      gl.uniform1i(u.uStopCount, s.stops.length);\r
      gl.uniform1f(u.uAmplitude, s.amplitude);\r
      gl.uniform1f(u.uBlend, s.blend);\r
      gl.uniform1f(u.uHeight, s.height);\r
      gl.uniform1f(u.uScale, s.scale);\r
      gl.uniform1f(u.uGlow, s.glow);\r
      gl.uniform1f(u.uBrightness, s.brightness);\r
      gl.uniform1i(u.uLayers, s.layers);\r
      gl.uniform1f(u.uFlip, s.flip);\r
      gl.uniform3f(u.uPointer, state.px, state.py, state.reach);\r
      gl.uniform1f(u.uReveal, 1 - Math.pow(1 - reveal, 3));\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.uniform1f(u.uLightMode, s.lightMode ? 1 : 0);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.0005, 0.05) : 1 / 60;\r
      last = now;\r
      if (s.paused) {\r
        state.reveal = 1;\r
        render();\r
        last = 0;\r
        return;\r
      }\r
      const motion = reduce ? 0 : 1;\r
      state.clock += dt * s.speed * motion;\r
      const engaged = s.mouseInteraction && pointer.inside && !reduce;\r
      const follow = 1 - Math.exp(-dt / 0.6);\r
      if (engaged) {\r
        const tx = (pointer.x - view.width / 2) / view.height;\r
        const ty = s.flip ? 1 - pointer.y / view.height : pointer.y / view.height;\r
        state.px += (tx - state.px) * follow;\r
        state.py += (ty - state.py) * follow;\r
      }\r
      state.reach += ((engaged ? 1 : 0) - state.reach) * (1 - Math.exp(-dt / (engaged ? 0.9 : 1.4)));\r
      if (!s.intro || reduce) state.reveal = 1;\r
      else if (state.reveal < 1) state.reveal = Math.min(1, state.reveal + dt / INTRO_SECONDS);\r
      render();\r
      raf = requestAnimationFrame(frame);\r
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
      render();\r
      wake();\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      pointer.x = event.clientX - rect.left;\r
      pointer.y = event.clientY - rect.top;\r
      const wasInside = pointer.inside;\r
      pointer.inside = pointer.x >= 0 && pointer.y >= 0 && pointer.x <= rect.width && pointer.y <= rect.height;\r
      if (pointer.inside && !wasInside) {\r
        const s = settingsRef.current;\r
        state.px = (pointer.x - rect.width / 2) / Math.max(1, rect.height);\r
        state.py = s.flip ? 1 - pointer.y / Math.max(1, rect.height) : pointer.y / Math.max(1, rect.height);\r
      }\r
      if (!settingsRef.current.paused) wake();\r
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
    window.addEventListener('pointerdown', onPointerMove, { passive: true });\r
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
      window.removeEventListener('pointerdown', onPointerMove);\r
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
      style={style}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Aurora;\r
`,a={usage:`import Aurora from './Aurora';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <Aurora
    colorStops={['#5227FF', '#7cff67', '#5227FF']}
    amplitude={1}
    blend={0.5}
    height={0.45}
    speed={1}
    glow={0.6}
  />
</div>`,code:r,css:n,tailwind:e,tsCode:t,tsTailwind:o};export{a as aurora};
