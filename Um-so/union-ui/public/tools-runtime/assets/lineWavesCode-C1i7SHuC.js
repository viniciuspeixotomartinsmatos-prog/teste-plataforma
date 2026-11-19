const n=`'use client';\r
\r
import { useEffect, useRef, useState } from 'react';\r
import './LineWaves.css';\r
\r
const PIXEL_BUDGET = 2.4e6;\r
const MAX_RIPPLES = 4;\r
\r
const VERTEX = \`#version 300 es\r
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));\r
void main() {\r
  gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform vec2 uResolution;\r
uniform float uPixel;\r
uniform float uTime;\r
uniform float uLines;\r
uniform float uWidth;\r
uniform float uGlow;\r
uniform float uBrightness;\r
uniform float uHighlight;\r
uniform float uHighlightWidth;\r
uniform float uWarp;\r
uniform float uScale;\r
uniform float uRotation;\r
uniform vec3 uColor1;\r
uniform vec3 uColor2;\r
uniform vec3 uColor3;\r
uniform float uCycle;\r
uniform float uEdge;\r
uniform vec4 uMouse;\r
uniform vec4 uRipples[\${MAX_RIPPLES}];\r
uniform float uReveal;\r
uniform float uLight;\r
uniform float uOpacity;\r
out vec4 fragColor;\r
\r
vec2 rotate(vec2 p, float a) {\r
  float c = cos(a);\r
  float s = sin(a);\r
  return vec2(c * p.x - s * p.y, s * p.x + c * p.y);\r
}\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
float noise(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = p - i;\r
  vec2 w = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);\r
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), w.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), w.x), w.y);\r
}\r
\r
float smootherstep(float edge0, float edge1, float x) {\r
  float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
float bend(vec2 p, float t) {\r
  vec2 q = p * 2.0 / uScale;\r
  float w = 0.6 * sin(q.x * 0.55 + t * 0.4 + 0.6 * sin(q.y * 0.9 - t * 0.28));\r
  w += 0.21 * sin(q.x * 1.3 - t * 0.33 + q.y * 0.8 + 1.3);\r
  w += 0.12 * sin(q.y * 2.3 + q.x * 0.9 - t * 0.37 + 0.4);\r
  return w * uWarp * uScale * 0.46;\r
}\r
\r
float river(vec2 p, float y, float t) {\r
  float drift = 0.7 * (0.18 * sin(p.x * 1.6 - t * 0.33 + 0.7) + 0.1 * sin(p.x * 3.1 + t * 0.21));\r
  float center = 0.5 * (0.2 * sin(t * 0.17) + 0.08 * sin(t * 0.29 + 1.3));\r
  float width = 0.13 * uHighlightWidth;\r
  float near = (y - center - drift) / width;\r
  float far = (y + 0.22 * sin(t * 0.13 + 2.0) - drift * 0.6 + 0.3) / (width * 0.55);\r
  return max(exp(-near * near), exp(-far * far) * 0.7);\r
}\r
\r
vec3 palette(float x) {\r
  x = fract(x) * 3.0;\r
  if (x < 1.0) return mix(uColor1, uColor2, smoothstep(0.0, 1.0, x));\r
  if (x < 2.0) return mix(uColor2, uColor3, smoothstep(1.0, 2.0, x));\r
  return mix(uColor3, uColor1, smoothstep(2.0, 3.0, x));\r
}\r
\r
void main() {\r
  float aspect = uResolution.x / uResolution.y;\r
  vec2 uv = gl_FragCoord.xy / uResolution;\r
  vec2 p = rotate((gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y, uRotation);\r
  float t = uTime;\r
\r
  vec2 mouse = rotate(uMouse.xy, uRotation);\r
  vec2 toMouse = p - mouse;\r
  float lens = exp(-dot(toMouse, toMouse) / (uMouse.w * uMouse.w));\r
  p.y -= (p.y - mouse.y) * lens * uMouse.z;\r
\r
  float ring = 0.0;\r
  for (int i = 0; i < \${MAX_RIPPLES}; i++) {\r
    vec4 ripple = uRipples[i];\r
    if (ripple.w <= 0.0) continue;\r
    float x = (length(p - rotate(ripple.xy, uRotation)) - ripple.z * 0.6) / 0.08;\r
    float fade = exp(-ripple.z * 1.3) * smoothstep(0.0, 0.12, ripple.z);\r
    float bump = exp(-x * x);\r
    p.y -= x * bump * 0.07 * fade;\r
    ring += bump * fade;\r
  }\r
\r
  float w = bend(p, t);\r
  float y = p.y + w;\r
  float phi = y * uLines;\r
  float fw = max(fwidth(phi), 1e-5);\r
  float crowd = smoothstep(0.18, 0.5, fw);\r
\r
  float fold = smoothstep(1.3, 2.2, fw * uResolution.y / uLines);\r
  float shimmer = mix(1.0, smoothstep(0.15, 0.85, noise(vec2(y * 1.6 + t * 0.07, p.x * 0.55 - t * 0.22))), 0.5);\r
  float lit = max(river(p, y, t), fold * 0.9) * shimmer;\r
  float light = mix(1.0, 0.07 + 0.93 * lit, uHighlight);\r
  light += (1.0 - light) * min(lens * step(0.0001, uMouse.z) * 0.9 + ring * 0.6, 1.0);\r
\r
  float dist = abs(fract(phi + 0.5) - 0.5) / fw;\r
  float width = uWidth * uPixel * (1.0 + mix(1.5, 0.6, uLight) * lit * uHighlight);\r
  float cover = clamp(min(dist + width * 0.5, 0.5) - max(dist - width * 0.5, -0.5), 0.0, 1.0);\r
  cover = mix(cover, min(width * fw, 1.0), crowd);\r
  float halo = exp(-dist / (2.2 * uPixel)) * (1.0 - crowd) * uGlow;\r
  float thread = mix(1.0, 0.55 + 0.45 * hash(vec2(floor(phi + 0.5), 7.3)), 0.45 * (1.0 - crowd));\r
\r
  float span = 0.5 * sqrt(aspect * aspect + 1.0);\r
  float sweep = -span + (2.0 * span + 0.6) * uReveal;\r
  float reveal = 1.0 - smoothstep(sweep - 0.6, sweep, p.x);\r
\r
  float edge = 1.0;\r
  if (uEdge > 0.0) {\r
    float ex = min(uv.x, 1.0 - uv.x) * aspect;\r
    float ey = min(uv.y, 1.0 - uv.y);\r
    edge = smootherstep(0.0, uEdge * 0.5, ex) * smootherstep(0.0, uEdge * 0.5, ey);\r
  }\r
\r
  vec3 tint = palette(y * 0.3 + p.x * 0.2 + uCycle);\r
  float grain = (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;\r
\r
  if (uLight > 0.5) {\r
    float low = min(tint.r, min(tint.g, tint.b));\r
    float chroma = max(tint.r, max(tint.g, tint.b)) - low;\r
    vec3 hue = (tint - low) / max(chroma, 1e-3);\r
    vec3 ink = mix(vec3(0.08), hue * 0.56 + 0.06, smoothstep(0.04, 0.2, chroma));\r
    float alpha = (cover + halo * 0.35) * thread * light * uBrightness * reveal * edge * 0.78 * uOpacity;\r
    alpha = clamp(alpha + grain, 0.0, 1.0);\r
    fragColor = vec4(ink * alpha, alpha);\r
    return;\r
  }\r
\r
  float strength = (cover + halo) * thread * light * uBrightness * reveal * edge;\r
  vec3 color = clamp(tint * strength * uOpacity, 0.0, 1.0);\r
  float alpha = max(color.r, max(color.g, color.b));\r
  color = clamp(color + grain, 0.0, 1.0);\r
  fragColor = vec4(min(color, vec3(alpha)), alpha);\r
}\`;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
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
  return [1, 1, 1];\r
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
const link = gl => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
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
    if (info) uniforms[info.name.replace(/\\[0\\]$/, '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const LineWaves = ({\r
  color1 = '#ffffff',\r
  color2 = '#ffffff',\r
  color3 = '#ffffff',\r
  colorCycleSpeed = 1,\r
  speed = 0.3,\r
  lineCount = 72,\r
  lineWidth = 1.3,\r
  glow = 0.6,\r
  brightness = 1,\r
  highlight = 1,\r
  highlightWidth = 1,\r
  warpIntensity = 1,\r
  warpScale = 1,\r
  rotation = -33,\r
  edgeFade = 0,\r
  enableMouseInteraction = true,\r
  mouseInfluence = 2,\r
  clickRipple = true,\r
  intro = true,\r
  lightMode = false,\r
  opacity = 1,\r
  maxDevicePixelRatio = 2,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const [generation, setGeneration] = useState(0);\r
\r
  const settings = {\r
    color1: parseColor(color1),\r
    color2: parseColor(color2),\r
    color3: parseColor(color3),\r
    cycleSpeed: colorCycleSpeed,\r
    speed: Math.max(0, speed),\r
    lines: clamp(lineCount, 2, 400),\r
    width: clamp(lineWidth, 0.25, 12),\r
    glow: Math.max(0, glow),\r
    brightness: Math.max(0, brightness),\r
    highlight: clamp(highlight, 0, 1),\r
    highlightWidth: clamp(highlightWidth, 0.2, 5),\r
    warp: clamp(warpIntensity, 0, 3),\r
    scale: clamp(warpScale, 0.2, 4),\r
    rotation: (rotation * Math.PI) / 180,\r
    edge: clamp(edgeFade, 0, 1),\r
    mouse: enableMouseInteraction,\r
    influence: clamp(mouseInfluence, 0, 3),\r
    clickRipple,\r
    intro,\r
    light: lightMode,\r
    opacity: clamp(opacity, 0, 1),\r
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
    const shader = gl ? link(gl) : null;\r
    if (!gl || !shader) return;\r
\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
    const vao = gl.createVertexArray();\r
    const size = { width: 1, height: 1, ratio: 1 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const lens = { x: 0, y: 0, presence: 0, ready: false };\r
    const ripples = [];\r
    const rippleData = new Float32Array(MAX_RIPPLES * 4);\r
    let time = Math.random() * 60;\r
    let cycle = 0;\r
    let reveal = settingsRef.current.intro && !reduced && generation === 0 ? 0 : 1;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let pageVisible = document.visibilityState !== 'hidden';\r
    let lost = false;\r
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
      size.ratio = width / cssWidth;\r
    };\r
\r
    const toField = (x, y) => [(x - size.width / 2) / size.height, (size.height / 2 - y) / size.height];\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (lost) return;\r
      const s = settingsRef.current;\r
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05);\r
      last = Math.max(last, now);\r
      time += dt * s.speed * 2.5 * (reduced ? 0.25 : 1);\r
      cycle += dt * s.speed * s.cycleSpeed * 0.05;\r
      if (reveal < 1) reveal = Math.min(1, reveal + dt / 1.8);\r
\r
      const tracking = s.mouse && pointer.inside && !reduced;\r
      if (tracking) {\r
        const [x, y] = toField(pointer.x, pointer.y);\r
        if (!lens.ready) {\r
          lens.x = x;\r
          lens.y = y;\r
          lens.ready = true;\r
        }\r
        const follow = 1 - Math.exp(-dt * 10);\r
        lens.x += (x - lens.x) * follow;\r
        lens.y += (y - lens.y) * follow;\r
      }\r
      const presence = tracking ? 1 : 0;\r
      lens.presence += (presence - lens.presence) * (1 - Math.exp(-dt * 5));\r
      if (lens.presence < 0.002 && !tracking) lens.ready = false;\r
\r
      for (let index = ripples.length - 1; index >= 0; index--) {\r
        ripples[index].age += dt;\r
        if (ripples[index].age > 2.6) ripples.splice(index, 1);\r
      }\r
      rippleData.fill(0);\r
      ripples.forEach((ripple, index) => {\r
        rippleData[index * 4] = ripple.x;\r
        rippleData[index * 4 + 1] = ripple.y;\r
        rippleData[index * 4 + 2] = ripple.age;\r
        rippleData[index * 4 + 3] = 1;\r
      });\r
\r
      const eased = 1 - Math.pow(1 - reveal, 3);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(shader.program);\r
      gl.bindVertexArray(vao);\r
      const u = shader.uniforms;\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(u.uPixel, size.ratio);\r
      gl.uniform1f(u.uTime, time);\r
      gl.uniform1f(u.uLines, s.lines);\r
      gl.uniform1f(u.uWidth, s.width);\r
      gl.uniform1f(u.uGlow, s.glow);\r
      gl.uniform1f(u.uBrightness, s.brightness);\r
      gl.uniform1f(u.uHighlight, s.highlight);\r
      gl.uniform1f(u.uHighlightWidth, s.highlightWidth);\r
      gl.uniform1f(u.uWarp, s.warp * (0.25 + 0.75 * eased));\r
      gl.uniform1f(u.uScale, s.scale);\r
      gl.uniform1f(u.uRotation, s.rotation);\r
      gl.uniform3f(u.uColor1, s.color1[0], s.color1[1], s.color1[2]);\r
      gl.uniform3f(u.uColor2, s.color2[0], s.color2[1], s.color2[2]);\r
      gl.uniform3f(u.uColor3, s.color3[0], s.color3[1], s.color3[2]);\r
      gl.uniform1f(u.uCycle, cycle);\r
      gl.uniform1f(u.uEdge, s.edge);\r
      gl.uniform4f(u.uMouse, lens.x, lens.y, lens.presence * s.influence * 0.16, 0.2);\r
      gl.uniform4fv(u.uRipples, rippleData);\r
      gl.uniform1f(u.uReveal, eased);\r
      gl.uniform1f(u.uLight, s.light ? 1 : 0);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      const settling = Math.abs(presence - lens.presence) > 0.002;\r
      const busy = (s.speed > 0 && !reduced) || reveal < 1 || settling || ripples.length > 0 || tracking;\r
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
        y: event.clientY - rect.top,\r
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
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = spot.inside;\r
      wake();\r
    };\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      const spot = locate(event);\r
      if (!spot.inside || !s.clickRipple || reduced) return;\r
      const [x, y] = toField(spot.x, spot.y);\r
      ripples.push({ x, y, age: 0 });\r
      if (ripples.length > MAX_RIPPLES) ripples.shift();\r
      wake();\r
    };\r
    const onLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
    const onPointerUp = event => {\r
      if (event.pointerType !== 'mouse') onLeave();\r
    };\r
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
        gl.deleteVertexArray(vao);\r
        gl.deleteProgram(shader.program);\r
      }\r
    };\r
  }, [generation]);\r
\r
  return (\r
    <div ref={containerRef} className={\`line-waves\${className ? \` \${className}\` : ''}\`} style={style}>\r
      <canvas ref={canvasRef} className="line-waves__canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default LineWaves;\r
`,r=`.line-waves {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.line-waves__canvas {\r
  position: absolute;\r
  inset: 0;\r
  display: block;\r
  width: 100%;\r
  height: 100%;\r
}\r
`,e=`'use client';\r
\r
import { useEffect, useRef, useState } from 'react';\r
\r
const PIXEL_BUDGET = 2.4e6;\r
const MAX_RIPPLES = 4;\r
\r
const VERTEX = \`#version 300 es\r
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));\r
void main() {\r
  gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform vec2 uResolution;\r
uniform float uPixel;\r
uniform float uTime;\r
uniform float uLines;\r
uniform float uWidth;\r
uniform float uGlow;\r
uniform float uBrightness;\r
uniform float uHighlight;\r
uniform float uHighlightWidth;\r
uniform float uWarp;\r
uniform float uScale;\r
uniform float uRotation;\r
uniform vec3 uColor1;\r
uniform vec3 uColor2;\r
uniform vec3 uColor3;\r
uniform float uCycle;\r
uniform float uEdge;\r
uniform vec4 uMouse;\r
uniform vec4 uRipples[\${MAX_RIPPLES}];\r
uniform float uReveal;\r
uniform float uLight;\r
uniform float uOpacity;\r
out vec4 fragColor;\r
\r
vec2 rotate(vec2 p, float a) {\r
  float c = cos(a);\r
  float s = sin(a);\r
  return vec2(c * p.x - s * p.y, s * p.x + c * p.y);\r
}\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
float noise(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = p - i;\r
  vec2 w = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);\r
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), w.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), w.x), w.y);\r
}\r
\r
float smootherstep(float edge0, float edge1, float x) {\r
  float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
float bend(vec2 p, float t) {\r
  vec2 q = p * 2.0 / uScale;\r
  float w = 0.6 * sin(q.x * 0.55 + t * 0.4 + 0.6 * sin(q.y * 0.9 - t * 0.28));\r
  w += 0.21 * sin(q.x * 1.3 - t * 0.33 + q.y * 0.8 + 1.3);\r
  w += 0.12 * sin(q.y * 2.3 + q.x * 0.9 - t * 0.37 + 0.4);\r
  return w * uWarp * uScale * 0.46;\r
}\r
\r
float river(vec2 p, float y, float t) {\r
  float drift = 0.7 * (0.18 * sin(p.x * 1.6 - t * 0.33 + 0.7) + 0.1 * sin(p.x * 3.1 + t * 0.21));\r
  float center = 0.5 * (0.2 * sin(t * 0.17) + 0.08 * sin(t * 0.29 + 1.3));\r
  float width = 0.13 * uHighlightWidth;\r
  float near = (y - center - drift) / width;\r
  float far = (y + 0.22 * sin(t * 0.13 + 2.0) - drift * 0.6 + 0.3) / (width * 0.55);\r
  return max(exp(-near * near), exp(-far * far) * 0.7);\r
}\r
\r
vec3 palette(float x) {\r
  x = fract(x) * 3.0;\r
  if (x < 1.0) return mix(uColor1, uColor2, smoothstep(0.0, 1.0, x));\r
  if (x < 2.0) return mix(uColor2, uColor3, smoothstep(1.0, 2.0, x));\r
  return mix(uColor3, uColor1, smoothstep(2.0, 3.0, x));\r
}\r
\r
void main() {\r
  float aspect = uResolution.x / uResolution.y;\r
  vec2 uv = gl_FragCoord.xy / uResolution;\r
  vec2 p = rotate((gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y, uRotation);\r
  float t = uTime;\r
\r
  vec2 mouse = rotate(uMouse.xy, uRotation);\r
  vec2 toMouse = p - mouse;\r
  float lens = exp(-dot(toMouse, toMouse) / (uMouse.w * uMouse.w));\r
  p.y -= (p.y - mouse.y) * lens * uMouse.z;\r
\r
  float ring = 0.0;\r
  for (int i = 0; i < \${MAX_RIPPLES}; i++) {\r
    vec4 ripple = uRipples[i];\r
    if (ripple.w <= 0.0) continue;\r
    float x = (length(p - rotate(ripple.xy, uRotation)) - ripple.z * 0.6) / 0.08;\r
    float fade = exp(-ripple.z * 1.3) * smoothstep(0.0, 0.12, ripple.z);\r
    float bump = exp(-x * x);\r
    p.y -= x * bump * 0.07 * fade;\r
    ring += bump * fade;\r
  }\r
\r
  float w = bend(p, t);\r
  float y = p.y + w;\r
  float phi = y * uLines;\r
  float fw = max(fwidth(phi), 1e-5);\r
  float crowd = smoothstep(0.18, 0.5, fw);\r
\r
  float fold = smoothstep(1.3, 2.2, fw * uResolution.y / uLines);\r
  float shimmer = mix(1.0, smoothstep(0.15, 0.85, noise(vec2(y * 1.6 + t * 0.07, p.x * 0.55 - t * 0.22))), 0.5);\r
  float lit = max(river(p, y, t), fold * 0.9) * shimmer;\r
  float light = mix(1.0, 0.07 + 0.93 * lit, uHighlight);\r
  light += (1.0 - light) * min(lens * step(0.0001, uMouse.z) * 0.9 + ring * 0.6, 1.0);\r
\r
  float dist = abs(fract(phi + 0.5) - 0.5) / fw;\r
  float width = uWidth * uPixel * (1.0 + mix(1.5, 0.6, uLight) * lit * uHighlight);\r
  float cover = clamp(min(dist + width * 0.5, 0.5) - max(dist - width * 0.5, -0.5), 0.0, 1.0);\r
  cover = mix(cover, min(width * fw, 1.0), crowd);\r
  float halo = exp(-dist / (2.2 * uPixel)) * (1.0 - crowd) * uGlow;\r
  float thread = mix(1.0, 0.55 + 0.45 * hash(vec2(floor(phi + 0.5), 7.3)), 0.45 * (1.0 - crowd));\r
\r
  float span = 0.5 * sqrt(aspect * aspect + 1.0);\r
  float sweep = -span + (2.0 * span + 0.6) * uReveal;\r
  float reveal = 1.0 - smoothstep(sweep - 0.6, sweep, p.x);\r
\r
  float edge = 1.0;\r
  if (uEdge > 0.0) {\r
    float ex = min(uv.x, 1.0 - uv.x) * aspect;\r
    float ey = min(uv.y, 1.0 - uv.y);\r
    edge = smootherstep(0.0, uEdge * 0.5, ex) * smootherstep(0.0, uEdge * 0.5, ey);\r
  }\r
\r
  vec3 tint = palette(y * 0.3 + p.x * 0.2 + uCycle);\r
  float grain = (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;\r
\r
  if (uLight > 0.5) {\r
    float low = min(tint.r, min(tint.g, tint.b));\r
    float chroma = max(tint.r, max(tint.g, tint.b)) - low;\r
    vec3 hue = (tint - low) / max(chroma, 1e-3);\r
    vec3 ink = mix(vec3(0.08), hue * 0.56 + 0.06, smoothstep(0.04, 0.2, chroma));\r
    float alpha = (cover + halo * 0.35) * thread * light * uBrightness * reveal * edge * 0.78 * uOpacity;\r
    alpha = clamp(alpha + grain, 0.0, 1.0);\r
    fragColor = vec4(ink * alpha, alpha);\r
    return;\r
  }\r
\r
  float strength = (cover + halo) * thread * light * uBrightness * reveal * edge;\r
  vec3 color = clamp(tint * strength * uOpacity, 0.0, 1.0);\r
  float alpha = max(color.r, max(color.g, color.b));\r
  color = clamp(color + grain, 0.0, 1.0);\r
  fragColor = vec4(min(color, vec3(alpha)), alpha);\r
}\`;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
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
  return [1, 1, 1];\r
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
const link = gl => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
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
    if (info) uniforms[info.name.replace(/\\[0\\]$/, '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const LineWaves = ({\r
  color1 = '#ffffff',\r
  color2 = '#ffffff',\r
  color3 = '#ffffff',\r
  colorCycleSpeed = 1,\r
  speed = 0.3,\r
  lineCount = 72,\r
  lineWidth = 1.3,\r
  glow = 0.6,\r
  brightness = 1,\r
  highlight = 1,\r
  highlightWidth = 1,\r
  warpIntensity = 1,\r
  warpScale = 1,\r
  rotation = -33,\r
  edgeFade = 0,\r
  enableMouseInteraction = true,\r
  mouseInfluence = 2,\r
  clickRipple = true,\r
  intro = true,\r
  lightMode = false,\r
  opacity = 1,\r
  maxDevicePixelRatio = 2,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const [generation, setGeneration] = useState(0);\r
\r
  const settings = {\r
    color1: parseColor(color1),\r
    color2: parseColor(color2),\r
    color3: parseColor(color3),\r
    cycleSpeed: colorCycleSpeed,\r
    speed: Math.max(0, speed),\r
    lines: clamp(lineCount, 2, 400),\r
    width: clamp(lineWidth, 0.25, 12),\r
    glow: Math.max(0, glow),\r
    brightness: Math.max(0, brightness),\r
    highlight: clamp(highlight, 0, 1),\r
    highlightWidth: clamp(highlightWidth, 0.2, 5),\r
    warp: clamp(warpIntensity, 0, 3),\r
    scale: clamp(warpScale, 0.2, 4),\r
    rotation: (rotation * Math.PI) / 180,\r
    edge: clamp(edgeFade, 0, 1),\r
    mouse: enableMouseInteraction,\r
    influence: clamp(mouseInfluence, 0, 3),\r
    clickRipple,\r
    intro,\r
    light: lightMode,\r
    opacity: clamp(opacity, 0, 1),\r
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
    const shader = gl ? link(gl) : null;\r
    if (!gl || !shader) return;\r
\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
    const vao = gl.createVertexArray();\r
    const size = { width: 1, height: 1, ratio: 1 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const lens = { x: 0, y: 0, presence: 0, ready: false };\r
    const ripples = [];\r
    const rippleData = new Float32Array(MAX_RIPPLES * 4);\r
    let time = Math.random() * 60;\r
    let cycle = 0;\r
    let reveal = settingsRef.current.intro && !reduced && generation === 0 ? 0 : 1;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let pageVisible = document.visibilityState !== 'hidden';\r
    let lost = false;\r
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
      size.ratio = width / cssWidth;\r
    };\r
\r
    const toField = (x, y) => [(x - size.width / 2) / size.height, (size.height / 2 - y) / size.height];\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (lost) return;\r
      const s = settingsRef.current;\r
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05);\r
      last = Math.max(last, now);\r
      time += dt * s.speed * 2.5 * (reduced ? 0.25 : 1);\r
      cycle += dt * s.speed * s.cycleSpeed * 0.05;\r
      if (reveal < 1) reveal = Math.min(1, reveal + dt / 1.8);\r
\r
      const tracking = s.mouse && pointer.inside && !reduced;\r
      if (tracking) {\r
        const [x, y] = toField(pointer.x, pointer.y);\r
        if (!lens.ready) {\r
          lens.x = x;\r
          lens.y = y;\r
          lens.ready = true;\r
        }\r
        const follow = 1 - Math.exp(-dt * 10);\r
        lens.x += (x - lens.x) * follow;\r
        lens.y += (y - lens.y) * follow;\r
      }\r
      const presence = tracking ? 1 : 0;\r
      lens.presence += (presence - lens.presence) * (1 - Math.exp(-dt * 5));\r
      if (lens.presence < 0.002 && !tracking) lens.ready = false;\r
\r
      for (let index = ripples.length - 1; index >= 0; index--) {\r
        ripples[index].age += dt;\r
        if (ripples[index].age > 2.6) ripples.splice(index, 1);\r
      }\r
      rippleData.fill(0);\r
      ripples.forEach((ripple, index) => {\r
        rippleData[index * 4] = ripple.x;\r
        rippleData[index * 4 + 1] = ripple.y;\r
        rippleData[index * 4 + 2] = ripple.age;\r
        rippleData[index * 4 + 3] = 1;\r
      });\r
\r
      const eased = 1 - Math.pow(1 - reveal, 3);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(shader.program);\r
      gl.bindVertexArray(vao);\r
      const u = shader.uniforms;\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(u.uPixel, size.ratio);\r
      gl.uniform1f(u.uTime, time);\r
      gl.uniform1f(u.uLines, s.lines);\r
      gl.uniform1f(u.uWidth, s.width);\r
      gl.uniform1f(u.uGlow, s.glow);\r
      gl.uniform1f(u.uBrightness, s.brightness);\r
      gl.uniform1f(u.uHighlight, s.highlight);\r
      gl.uniform1f(u.uHighlightWidth, s.highlightWidth);\r
      gl.uniform1f(u.uWarp, s.warp * (0.25 + 0.75 * eased));\r
      gl.uniform1f(u.uScale, s.scale);\r
      gl.uniform1f(u.uRotation, s.rotation);\r
      gl.uniform3f(u.uColor1, s.color1[0], s.color1[1], s.color1[2]);\r
      gl.uniform3f(u.uColor2, s.color2[0], s.color2[1], s.color2[2]);\r
      gl.uniform3f(u.uColor3, s.color3[0], s.color3[1], s.color3[2]);\r
      gl.uniform1f(u.uCycle, cycle);\r
      gl.uniform1f(u.uEdge, s.edge);\r
      gl.uniform4f(u.uMouse, lens.x, lens.y, lens.presence * s.influence * 0.16, 0.2);\r
      gl.uniform4fv(u.uRipples, rippleData);\r
      gl.uniform1f(u.uReveal, eased);\r
      gl.uniform1f(u.uLight, s.light ? 1 : 0);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      const settling = Math.abs(presence - lens.presence) > 0.002;\r
      const busy = (s.speed > 0 && !reduced) || reveal < 1 || settling || ripples.length > 0 || tracking;\r
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
        y: event.clientY - rect.top,\r
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
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = spot.inside;\r
      wake();\r
    };\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      const spot = locate(event);\r
      if (!spot.inside || !s.clickRipple || reduced) return;\r
      const [x, y] = toField(spot.x, spot.y);\r
      ripples.push({ x, y, age: 0 });\r
      if (ripples.length > MAX_RIPPLES) ripples.shift();\r
      wake();\r
    };\r
    const onLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
    const onPointerUp = event => {\r
      if (event.pointerType !== 'mouse') onLeave();\r
    };\r
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
        gl.deleteVertexArray(vao);\r
        gl.deleteProgram(shader.program);\r
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
export default LineWaves;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, useState, type CSSProperties } from 'react';\r
import './LineWaves.css';\r
\r
export interface LineWavesProps {\r
  color1?: string;\r
  color2?: string;\r
  color3?: string;\r
  colorCycleSpeed?: number;\r
  speed?: number;\r
  lineCount?: number;\r
  lineWidth?: number;\r
  glow?: number;\r
  brightness?: number;\r
  highlight?: number;\r
  highlightWidth?: number;\r
  warpIntensity?: number;\r
  warpScale?: number;\r
  rotation?: number;\r
  edgeFade?: number;\r
  enableMouseInteraction?: boolean;\r
  mouseInfluence?: number;\r
  clickRipple?: boolean;\r
  intro?: boolean;\r
  lightMode?: boolean;\r
  opacity?: number;\r
  maxDevicePixelRatio?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Settings {\r
  color1: number[];\r
  color2: number[];\r
  color3: number[];\r
  cycleSpeed: number;\r
  speed: number;\r
  lines: number;\r
  width: number;\r
  glow: number;\r
  brightness: number;\r
  highlight: number;\r
  highlightWidth: number;\r
  warp: number;\r
  scale: number;\r
  rotation: number;\r
  edge: number;\r
  mouse: boolean;\r
  influence: number;\r
  clickRipple: boolean;\r
  intro: boolean;\r
  light: boolean;\r
  opacity: number;\r
  maxRatio: number;\r
}\r
\r
interface Program {\r
  program: WebGLProgram;\r
  uniforms: Record<string, WebGLUniformLocation | null>;\r
}\r
\r
interface Ripple {\r
  x: number;\r
  y: number;\r
  age: number;\r
}\r
\r
const PIXEL_BUDGET = 2.4e6;\r
const MAX_RIPPLES = 4;\r
\r
const VERTEX = \`#version 300 es\r
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));\r
void main() {\r
  gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform vec2 uResolution;\r
uniform float uPixel;\r
uniform float uTime;\r
uniform float uLines;\r
uniform float uWidth;\r
uniform float uGlow;\r
uniform float uBrightness;\r
uniform float uHighlight;\r
uniform float uHighlightWidth;\r
uniform float uWarp;\r
uniform float uScale;\r
uniform float uRotation;\r
uniform vec3 uColor1;\r
uniform vec3 uColor2;\r
uniform vec3 uColor3;\r
uniform float uCycle;\r
uniform float uEdge;\r
uniform vec4 uMouse;\r
uniform vec4 uRipples[\${MAX_RIPPLES}];\r
uniform float uReveal;\r
uniform float uLight;\r
uniform float uOpacity;\r
out vec4 fragColor;\r
\r
vec2 rotate(vec2 p, float a) {\r
  float c = cos(a);\r
  float s = sin(a);\r
  return vec2(c * p.x - s * p.y, s * p.x + c * p.y);\r
}\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
float noise(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = p - i;\r
  vec2 w = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);\r
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), w.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), w.x), w.y);\r
}\r
\r
float smootherstep(float edge0, float edge1, float x) {\r
  float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
float bend(vec2 p, float t) {\r
  vec2 q = p * 2.0 / uScale;\r
  float w = 0.6 * sin(q.x * 0.55 + t * 0.4 + 0.6 * sin(q.y * 0.9 - t * 0.28));\r
  w += 0.21 * sin(q.x * 1.3 - t * 0.33 + q.y * 0.8 + 1.3);\r
  w += 0.12 * sin(q.y * 2.3 + q.x * 0.9 - t * 0.37 + 0.4);\r
  return w * uWarp * uScale * 0.46;\r
}\r
\r
float river(vec2 p, float y, float t) {\r
  float drift = 0.7 * (0.18 * sin(p.x * 1.6 - t * 0.33 + 0.7) + 0.1 * sin(p.x * 3.1 + t * 0.21));\r
  float center = 0.5 * (0.2 * sin(t * 0.17) + 0.08 * sin(t * 0.29 + 1.3));\r
  float width = 0.13 * uHighlightWidth;\r
  float near = (y - center - drift) / width;\r
  float far = (y + 0.22 * sin(t * 0.13 + 2.0) - drift * 0.6 + 0.3) / (width * 0.55);\r
  return max(exp(-near * near), exp(-far * far) * 0.7);\r
}\r
\r
vec3 palette(float x) {\r
  x = fract(x) * 3.0;\r
  if (x < 1.0) return mix(uColor1, uColor2, smoothstep(0.0, 1.0, x));\r
  if (x < 2.0) return mix(uColor2, uColor3, smoothstep(1.0, 2.0, x));\r
  return mix(uColor3, uColor1, smoothstep(2.0, 3.0, x));\r
}\r
\r
void main() {\r
  float aspect = uResolution.x / uResolution.y;\r
  vec2 uv = gl_FragCoord.xy / uResolution;\r
  vec2 p = rotate((gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y, uRotation);\r
  float t = uTime;\r
\r
  vec2 mouse = rotate(uMouse.xy, uRotation);\r
  vec2 toMouse = p - mouse;\r
  float lens = exp(-dot(toMouse, toMouse) / (uMouse.w * uMouse.w));\r
  p.y -= (p.y - mouse.y) * lens * uMouse.z;\r
\r
  float ring = 0.0;\r
  for (int i = 0; i < \${MAX_RIPPLES}; i++) {\r
    vec4 ripple = uRipples[i];\r
    if (ripple.w <= 0.0) continue;\r
    float x = (length(p - rotate(ripple.xy, uRotation)) - ripple.z * 0.6) / 0.08;\r
    float fade = exp(-ripple.z * 1.3) * smoothstep(0.0, 0.12, ripple.z);\r
    float bump = exp(-x * x);\r
    p.y -= x * bump * 0.07 * fade;\r
    ring += bump * fade;\r
  }\r
\r
  float w = bend(p, t);\r
  float y = p.y + w;\r
  float phi = y * uLines;\r
  float fw = max(fwidth(phi), 1e-5);\r
  float crowd = smoothstep(0.18, 0.5, fw);\r
\r
  float fold = smoothstep(1.3, 2.2, fw * uResolution.y / uLines);\r
  float shimmer = mix(1.0, smoothstep(0.15, 0.85, noise(vec2(y * 1.6 + t * 0.07, p.x * 0.55 - t * 0.22))), 0.5);\r
  float lit = max(river(p, y, t), fold * 0.9) * shimmer;\r
  float light = mix(1.0, 0.07 + 0.93 * lit, uHighlight);\r
  light += (1.0 - light) * min(lens * step(0.0001, uMouse.z) * 0.9 + ring * 0.6, 1.0);\r
\r
  float dist = abs(fract(phi + 0.5) - 0.5) / fw;\r
  float width = uWidth * uPixel * (1.0 + mix(1.5, 0.6, uLight) * lit * uHighlight);\r
  float cover = clamp(min(dist + width * 0.5, 0.5) - max(dist - width * 0.5, -0.5), 0.0, 1.0);\r
  cover = mix(cover, min(width * fw, 1.0), crowd);\r
  float halo = exp(-dist / (2.2 * uPixel)) * (1.0 - crowd) * uGlow;\r
  float thread = mix(1.0, 0.55 + 0.45 * hash(vec2(floor(phi + 0.5), 7.3)), 0.45 * (1.0 - crowd));\r
\r
  float span = 0.5 * sqrt(aspect * aspect + 1.0);\r
  float sweep = -span + (2.0 * span + 0.6) * uReveal;\r
  float reveal = 1.0 - smoothstep(sweep - 0.6, sweep, p.x);\r
\r
  float edge = 1.0;\r
  if (uEdge > 0.0) {\r
    float ex = min(uv.x, 1.0 - uv.x) * aspect;\r
    float ey = min(uv.y, 1.0 - uv.y);\r
    edge = smootherstep(0.0, uEdge * 0.5, ex) * smootherstep(0.0, uEdge * 0.5, ey);\r
  }\r
\r
  vec3 tint = palette(y * 0.3 + p.x * 0.2 + uCycle);\r
  float grain = (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;\r
\r
  if (uLight > 0.5) {\r
    float low = min(tint.r, min(tint.g, tint.b));\r
    float chroma = max(tint.r, max(tint.g, tint.b)) - low;\r
    vec3 hue = (tint - low) / max(chroma, 1e-3);\r
    vec3 ink = mix(vec3(0.08), hue * 0.56 + 0.06, smoothstep(0.04, 0.2, chroma));\r
    float alpha = (cover + halo * 0.35) * thread * light * uBrightness * reveal * edge * 0.78 * uOpacity;\r
    alpha = clamp(alpha + grain, 0.0, 1.0);\r
    fragColor = vec4(ink * alpha, alpha);\r
    return;\r
  }\r
\r
  float strength = (cover + halo) * thread * light * uBrightness * reveal * edge;\r
  vec3 color = clamp(tint * strength * uOpacity, 0.0, 1.0);\r
  float alpha = max(color.r, max(color.g, color.b));\r
  color = clamp(color + grain, 0.0, 1.0);\r
  fragColor = vec4(min(color, vec3(alpha)), alpha);\r
}\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const parseColor = (value: string): number[] => {\r
  const text = String(value || '').trim();\r
  const hex = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text);\r
  if (hex) {\r
    const full = hex[1].length === 3 ? hex[1].replace(/./g, digit => digit + digit) : hex[1];\r
    return [0, 2, 4].map(index => parseInt(full.slice(index, index + 2), 16) / 255);\r
  }\r
  const rgb = /^rgba?\\(\\s*([\\d.]+)[\\s,]+([\\d.]+)[\\s,]+([\\d.]+)/i.exec(text);\r
  if (rgb) return [rgb[1], rgb[2], rgb[3]].map(channel => clamp(parseFloat(channel) / 255, 0, 1));\r
  return [1, 1, 1];\r
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
const link = (gl: WebGL2RenderingContext): Program | null => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
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
    if (info) uniforms[info.name.replace(/\\[0\\]$/, '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const LineWaves = ({\r
  color1 = '#ffffff',\r
  color2 = '#ffffff',\r
  color3 = '#ffffff',\r
  colorCycleSpeed = 1,\r
  speed = 0.3,\r
  lineCount = 72,\r
  lineWidth = 1.3,\r
  glow = 0.6,\r
  brightness = 1,\r
  highlight = 1,\r
  highlightWidth = 1,\r
  warpIntensity = 1,\r
  warpScale = 1,\r
  rotation = -33,\r
  edgeFade = 0,\r
  enableMouseInteraction = true,\r
  mouseInfluence = 2,\r
  clickRipple = true,\r
  intro = true,\r
  lightMode = false,\r
  opacity = 1,\r
  maxDevicePixelRatio = 2,\r
  className = '',\r
  style\r
}: LineWavesProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const [generation, setGeneration] = useState(0);\r
\r
  const settings: Settings = {\r
    color1: parseColor(color1),\r
    color2: parseColor(color2),\r
    color3: parseColor(color3),\r
    cycleSpeed: colorCycleSpeed,\r
    speed: Math.max(0, speed),\r
    lines: clamp(lineCount, 2, 400),\r
    width: clamp(lineWidth, 0.25, 12),\r
    glow: Math.max(0, glow),\r
    brightness: Math.max(0, brightness),\r
    highlight: clamp(highlight, 0, 1),\r
    highlightWidth: clamp(highlightWidth, 0.2, 5),\r
    warp: clamp(warpIntensity, 0, 3),\r
    scale: clamp(warpScale, 0.2, 4),\r
    rotation: (rotation * Math.PI) / 180,\r
    edge: clamp(edgeFade, 0, 1),\r
    mouse: enableMouseInteraction,\r
    influence: clamp(mouseInfluence, 0, 3),\r
    clickRipple,\r
    intro,\r
    light: lightMode,\r
    opacity: clamp(opacity, 0, 1),\r
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
    const shader = gl ? link(gl) : null;\r
    if (!gl || !shader) return;\r
\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
    const vao = gl.createVertexArray();\r
    const size = { width: 1, height: 1, ratio: 1 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const lens = { x: 0, y: 0, presence: 0, ready: false };\r
    const ripples: Ripple[] = [];\r
    const rippleData = new Float32Array(MAX_RIPPLES * 4);\r
    let time = Math.random() * 60;\r
    let cycle = 0;\r
    let reveal = settingsRef.current.intro && !reduced && generation === 0 ? 0 : 1;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let pageVisible = document.visibilityState !== 'hidden';\r
    let lost = false;\r
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
      size.ratio = width / cssWidth;\r
    };\r
\r
    const toField = (x: number, y: number) => [(x - size.width / 2) / size.height, (size.height / 2 - y) / size.height];\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (lost) return;\r
      const s = settingsRef.current;\r
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05);\r
      last = Math.max(last, now);\r
      time += dt * s.speed * 2.5 * (reduced ? 0.25 : 1);\r
      cycle += dt * s.speed * s.cycleSpeed * 0.05;\r
      if (reveal < 1) reveal = Math.min(1, reveal + dt / 1.8);\r
\r
      const tracking = s.mouse && pointer.inside && !reduced;\r
      if (tracking) {\r
        const [x, y] = toField(pointer.x, pointer.y);\r
        if (!lens.ready) {\r
          lens.x = x;\r
          lens.y = y;\r
          lens.ready = true;\r
        }\r
        const follow = 1 - Math.exp(-dt * 10);\r
        lens.x += (x - lens.x) * follow;\r
        lens.y += (y - lens.y) * follow;\r
      }\r
      const presence = tracking ? 1 : 0;\r
      lens.presence += (presence - lens.presence) * (1 - Math.exp(-dt * 5));\r
      if (lens.presence < 0.002 && !tracking) lens.ready = false;\r
\r
      for (let index = ripples.length - 1; index >= 0; index--) {\r
        ripples[index].age += dt;\r
        if (ripples[index].age > 2.6) ripples.splice(index, 1);\r
      }\r
      rippleData.fill(0);\r
      ripples.forEach((ripple, index) => {\r
        rippleData[index * 4] = ripple.x;\r
        rippleData[index * 4 + 1] = ripple.y;\r
        rippleData[index * 4 + 2] = ripple.age;\r
        rippleData[index * 4 + 3] = 1;\r
      });\r
\r
      const eased = 1 - Math.pow(1 - reveal, 3);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(shader.program);\r
      gl.bindVertexArray(vao);\r
      const u = shader.uniforms;\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(u.uPixel, size.ratio);\r
      gl.uniform1f(u.uTime, time);\r
      gl.uniform1f(u.uLines, s.lines);\r
      gl.uniform1f(u.uWidth, s.width);\r
      gl.uniform1f(u.uGlow, s.glow);\r
      gl.uniform1f(u.uBrightness, s.brightness);\r
      gl.uniform1f(u.uHighlight, s.highlight);\r
      gl.uniform1f(u.uHighlightWidth, s.highlightWidth);\r
      gl.uniform1f(u.uWarp, s.warp * (0.25 + 0.75 * eased));\r
      gl.uniform1f(u.uScale, s.scale);\r
      gl.uniform1f(u.uRotation, s.rotation);\r
      gl.uniform3f(u.uColor1, s.color1[0], s.color1[1], s.color1[2]);\r
      gl.uniform3f(u.uColor2, s.color2[0], s.color2[1], s.color2[2]);\r
      gl.uniform3f(u.uColor3, s.color3[0], s.color3[1], s.color3[2]);\r
      gl.uniform1f(u.uCycle, cycle);\r
      gl.uniform1f(u.uEdge, s.edge);\r
      gl.uniform4f(u.uMouse, lens.x, lens.y, lens.presence * s.influence * 0.16, 0.2);\r
      gl.uniform4fv(u.uRipples, rippleData);\r
      gl.uniform1f(u.uReveal, eased);\r
      gl.uniform1f(u.uLight, s.light ? 1 : 0);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      const settling = Math.abs(presence - lens.presence) > 0.002;\r
      const busy = (s.speed > 0 && !reduced) || reveal < 1 || settling || ripples.length > 0 || tracking;\r
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
        y: event.clientY - rect.top,\r
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
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = spot.inside;\r
      wake();\r
    };\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      const spot = locate(event);\r
      if (!spot.inside || !s.clickRipple || reduced) return;\r
      const [x, y] = toField(spot.x, spot.y);\r
      ripples.push({ x, y, age: 0 });\r
      if (ripples.length > MAX_RIPPLES) ripples.shift();\r
      wake();\r
    };\r
    const onLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
    const onPointerUp = (event: PointerEvent) => {\r
      if (event.pointerType !== 'mouse') onLeave();\r
    };\r
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
        gl.deleteVertexArray(vao);\r
        gl.deleteProgram(shader.program);\r
      }\r
    };\r
  }, [generation]);\r
\r
  return (\r
    <div ref={containerRef} className={\`line-waves\${className ? \` \${className}\` : ''}\`} style={style}>\r
      <canvas ref={canvasRef} className="line-waves__canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default LineWaves;\r
`,o=`'use client';\r
\r
import { useEffect, useRef, useState, type CSSProperties } from 'react';\r
\r
export interface LineWavesProps {\r
  color1?: string;\r
  color2?: string;\r
  color3?: string;\r
  colorCycleSpeed?: number;\r
  speed?: number;\r
  lineCount?: number;\r
  lineWidth?: number;\r
  glow?: number;\r
  brightness?: number;\r
  highlight?: number;\r
  highlightWidth?: number;\r
  warpIntensity?: number;\r
  warpScale?: number;\r
  rotation?: number;\r
  edgeFade?: number;\r
  enableMouseInteraction?: boolean;\r
  mouseInfluence?: number;\r
  clickRipple?: boolean;\r
  intro?: boolean;\r
  lightMode?: boolean;\r
  opacity?: number;\r
  maxDevicePixelRatio?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Settings {\r
  color1: number[];\r
  color2: number[];\r
  color3: number[];\r
  cycleSpeed: number;\r
  speed: number;\r
  lines: number;\r
  width: number;\r
  glow: number;\r
  brightness: number;\r
  highlight: number;\r
  highlightWidth: number;\r
  warp: number;\r
  scale: number;\r
  rotation: number;\r
  edge: number;\r
  mouse: boolean;\r
  influence: number;\r
  clickRipple: boolean;\r
  intro: boolean;\r
  light: boolean;\r
  opacity: number;\r
  maxRatio: number;\r
}\r
\r
interface Program {\r
  program: WebGLProgram;\r
  uniforms: Record<string, WebGLUniformLocation | null>;\r
}\r
\r
interface Ripple {\r
  x: number;\r
  y: number;\r
  age: number;\r
}\r
\r
const PIXEL_BUDGET = 2.4e6;\r
const MAX_RIPPLES = 4;\r
\r
const VERTEX = \`#version 300 es\r
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));\r
void main() {\r
  gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform vec2 uResolution;\r
uniform float uPixel;\r
uniform float uTime;\r
uniform float uLines;\r
uniform float uWidth;\r
uniform float uGlow;\r
uniform float uBrightness;\r
uniform float uHighlight;\r
uniform float uHighlightWidth;\r
uniform float uWarp;\r
uniform float uScale;\r
uniform float uRotation;\r
uniform vec3 uColor1;\r
uniform vec3 uColor2;\r
uniform vec3 uColor3;\r
uniform float uCycle;\r
uniform float uEdge;\r
uniform vec4 uMouse;\r
uniform vec4 uRipples[\${MAX_RIPPLES}];\r
uniform float uReveal;\r
uniform float uLight;\r
uniform float uOpacity;\r
out vec4 fragColor;\r
\r
vec2 rotate(vec2 p, float a) {\r
  float c = cos(a);\r
  float s = sin(a);\r
  return vec2(c * p.x - s * p.y, s * p.x + c * p.y);\r
}\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
float noise(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = p - i;\r
  vec2 w = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);\r
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), w.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), w.x), w.y);\r
}\r
\r
float smootherstep(float edge0, float edge1, float x) {\r
  float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
float bend(vec2 p, float t) {\r
  vec2 q = p * 2.0 / uScale;\r
  float w = 0.6 * sin(q.x * 0.55 + t * 0.4 + 0.6 * sin(q.y * 0.9 - t * 0.28));\r
  w += 0.21 * sin(q.x * 1.3 - t * 0.33 + q.y * 0.8 + 1.3);\r
  w += 0.12 * sin(q.y * 2.3 + q.x * 0.9 - t * 0.37 + 0.4);\r
  return w * uWarp * uScale * 0.46;\r
}\r
\r
float river(vec2 p, float y, float t) {\r
  float drift = 0.7 * (0.18 * sin(p.x * 1.6 - t * 0.33 + 0.7) + 0.1 * sin(p.x * 3.1 + t * 0.21));\r
  float center = 0.5 * (0.2 * sin(t * 0.17) + 0.08 * sin(t * 0.29 + 1.3));\r
  float width = 0.13 * uHighlightWidth;\r
  float near = (y - center - drift) / width;\r
  float far = (y + 0.22 * sin(t * 0.13 + 2.0) - drift * 0.6 + 0.3) / (width * 0.55);\r
  return max(exp(-near * near), exp(-far * far) * 0.7);\r
}\r
\r
vec3 palette(float x) {\r
  x = fract(x) * 3.0;\r
  if (x < 1.0) return mix(uColor1, uColor2, smoothstep(0.0, 1.0, x));\r
  if (x < 2.0) return mix(uColor2, uColor3, smoothstep(1.0, 2.0, x));\r
  return mix(uColor3, uColor1, smoothstep(2.0, 3.0, x));\r
}\r
\r
void main() {\r
  float aspect = uResolution.x / uResolution.y;\r
  vec2 uv = gl_FragCoord.xy / uResolution;\r
  vec2 p = rotate((gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y, uRotation);\r
  float t = uTime;\r
\r
  vec2 mouse = rotate(uMouse.xy, uRotation);\r
  vec2 toMouse = p - mouse;\r
  float lens = exp(-dot(toMouse, toMouse) / (uMouse.w * uMouse.w));\r
  p.y -= (p.y - mouse.y) * lens * uMouse.z;\r
\r
  float ring = 0.0;\r
  for (int i = 0; i < \${MAX_RIPPLES}; i++) {\r
    vec4 ripple = uRipples[i];\r
    if (ripple.w <= 0.0) continue;\r
    float x = (length(p - rotate(ripple.xy, uRotation)) - ripple.z * 0.6) / 0.08;\r
    float fade = exp(-ripple.z * 1.3) * smoothstep(0.0, 0.12, ripple.z);\r
    float bump = exp(-x * x);\r
    p.y -= x * bump * 0.07 * fade;\r
    ring += bump * fade;\r
  }\r
\r
  float w = bend(p, t);\r
  float y = p.y + w;\r
  float phi = y * uLines;\r
  float fw = max(fwidth(phi), 1e-5);\r
  float crowd = smoothstep(0.18, 0.5, fw);\r
\r
  float fold = smoothstep(1.3, 2.2, fw * uResolution.y / uLines);\r
  float shimmer = mix(1.0, smoothstep(0.15, 0.85, noise(vec2(y * 1.6 + t * 0.07, p.x * 0.55 - t * 0.22))), 0.5);\r
  float lit = max(river(p, y, t), fold * 0.9) * shimmer;\r
  float light = mix(1.0, 0.07 + 0.93 * lit, uHighlight);\r
  light += (1.0 - light) * min(lens * step(0.0001, uMouse.z) * 0.9 + ring * 0.6, 1.0);\r
\r
  float dist = abs(fract(phi + 0.5) - 0.5) / fw;\r
  float width = uWidth * uPixel * (1.0 + mix(1.5, 0.6, uLight) * lit * uHighlight);\r
  float cover = clamp(min(dist + width * 0.5, 0.5) - max(dist - width * 0.5, -0.5), 0.0, 1.0);\r
  cover = mix(cover, min(width * fw, 1.0), crowd);\r
  float halo = exp(-dist / (2.2 * uPixel)) * (1.0 - crowd) * uGlow;\r
  float thread = mix(1.0, 0.55 + 0.45 * hash(vec2(floor(phi + 0.5), 7.3)), 0.45 * (1.0 - crowd));\r
\r
  float span = 0.5 * sqrt(aspect * aspect + 1.0);\r
  float sweep = -span + (2.0 * span + 0.6) * uReveal;\r
  float reveal = 1.0 - smoothstep(sweep - 0.6, sweep, p.x);\r
\r
  float edge = 1.0;\r
  if (uEdge > 0.0) {\r
    float ex = min(uv.x, 1.0 - uv.x) * aspect;\r
    float ey = min(uv.y, 1.0 - uv.y);\r
    edge = smootherstep(0.0, uEdge * 0.5, ex) * smootherstep(0.0, uEdge * 0.5, ey);\r
  }\r
\r
  vec3 tint = palette(y * 0.3 + p.x * 0.2 + uCycle);\r
  float grain = (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;\r
\r
  if (uLight > 0.5) {\r
    float low = min(tint.r, min(tint.g, tint.b));\r
    float chroma = max(tint.r, max(tint.g, tint.b)) - low;\r
    vec3 hue = (tint - low) / max(chroma, 1e-3);\r
    vec3 ink = mix(vec3(0.08), hue * 0.56 + 0.06, smoothstep(0.04, 0.2, chroma));\r
    float alpha = (cover + halo * 0.35) * thread * light * uBrightness * reveal * edge * 0.78 * uOpacity;\r
    alpha = clamp(alpha + grain, 0.0, 1.0);\r
    fragColor = vec4(ink * alpha, alpha);\r
    return;\r
  }\r
\r
  float strength = (cover + halo) * thread * light * uBrightness * reveal * edge;\r
  vec3 color = clamp(tint * strength * uOpacity, 0.0, 1.0);\r
  float alpha = max(color.r, max(color.g, color.b));\r
  color = clamp(color + grain, 0.0, 1.0);\r
  fragColor = vec4(min(color, vec3(alpha)), alpha);\r
}\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const parseColor = (value: string): number[] => {\r
  const text = String(value || '').trim();\r
  const hex = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text);\r
  if (hex) {\r
    const full = hex[1].length === 3 ? hex[1].replace(/./g, digit => digit + digit) : hex[1];\r
    return [0, 2, 4].map(index => parseInt(full.slice(index, index + 2), 16) / 255);\r
  }\r
  const rgb = /^rgba?\\(\\s*([\\d.]+)[\\s,]+([\\d.]+)[\\s,]+([\\d.]+)/i.exec(text);\r
  if (rgb) return [rgb[1], rgb[2], rgb[3]].map(channel => clamp(parseFloat(channel) / 255, 0, 1));\r
  return [1, 1, 1];\r
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
const link = (gl: WebGL2RenderingContext): Program | null => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
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
    if (info) uniforms[info.name.replace(/\\[0\\]$/, '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const LineWaves = ({\r
  color1 = '#ffffff',\r
  color2 = '#ffffff',\r
  color3 = '#ffffff',\r
  colorCycleSpeed = 1,\r
  speed = 0.3,\r
  lineCount = 72,\r
  lineWidth = 1.3,\r
  glow = 0.6,\r
  brightness = 1,\r
  highlight = 1,\r
  highlightWidth = 1,\r
  warpIntensity = 1,\r
  warpScale = 1,\r
  rotation = -33,\r
  edgeFade = 0,\r
  enableMouseInteraction = true,\r
  mouseInfluence = 2,\r
  clickRipple = true,\r
  intro = true,\r
  lightMode = false,\r
  opacity = 1,\r
  maxDevicePixelRatio = 2,\r
  className = '',\r
  style\r
}: LineWavesProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const [generation, setGeneration] = useState(0);\r
\r
  const settings: Settings = {\r
    color1: parseColor(color1),\r
    color2: parseColor(color2),\r
    color3: parseColor(color3),\r
    cycleSpeed: colorCycleSpeed,\r
    speed: Math.max(0, speed),\r
    lines: clamp(lineCount, 2, 400),\r
    width: clamp(lineWidth, 0.25, 12),\r
    glow: Math.max(0, glow),\r
    brightness: Math.max(0, brightness),\r
    highlight: clamp(highlight, 0, 1),\r
    highlightWidth: clamp(highlightWidth, 0.2, 5),\r
    warp: clamp(warpIntensity, 0, 3),\r
    scale: clamp(warpScale, 0.2, 4),\r
    rotation: (rotation * Math.PI) / 180,\r
    edge: clamp(edgeFade, 0, 1),\r
    mouse: enableMouseInteraction,\r
    influence: clamp(mouseInfluence, 0, 3),\r
    clickRipple,\r
    intro,\r
    light: lightMode,\r
    opacity: clamp(opacity, 0, 1),\r
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
    const shader = gl ? link(gl) : null;\r
    if (!gl || !shader) return;\r
\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
    const vao = gl.createVertexArray();\r
    const size = { width: 1, height: 1, ratio: 1 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const lens = { x: 0, y: 0, presence: 0, ready: false };\r
    const ripples: Ripple[] = [];\r
    const rippleData = new Float32Array(MAX_RIPPLES * 4);\r
    let time = Math.random() * 60;\r
    let cycle = 0;\r
    let reveal = settingsRef.current.intro && !reduced && generation === 0 ? 0 : 1;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let pageVisible = document.visibilityState !== 'hidden';\r
    let lost = false;\r
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
      size.ratio = width / cssWidth;\r
    };\r
\r
    const toField = (x: number, y: number) => [(x - size.width / 2) / size.height, (size.height / 2 - y) / size.height];\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (lost) return;\r
      const s = settingsRef.current;\r
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05);\r
      last = Math.max(last, now);\r
      time += dt * s.speed * 2.5 * (reduced ? 0.25 : 1);\r
      cycle += dt * s.speed * s.cycleSpeed * 0.05;\r
      if (reveal < 1) reveal = Math.min(1, reveal + dt / 1.8);\r
\r
      const tracking = s.mouse && pointer.inside && !reduced;\r
      if (tracking) {\r
        const [x, y] = toField(pointer.x, pointer.y);\r
        if (!lens.ready) {\r
          lens.x = x;\r
          lens.y = y;\r
          lens.ready = true;\r
        }\r
        const follow = 1 - Math.exp(-dt * 10);\r
        lens.x += (x - lens.x) * follow;\r
        lens.y += (y - lens.y) * follow;\r
      }\r
      const presence = tracking ? 1 : 0;\r
      lens.presence += (presence - lens.presence) * (1 - Math.exp(-dt * 5));\r
      if (lens.presence < 0.002 && !tracking) lens.ready = false;\r
\r
      for (let index = ripples.length - 1; index >= 0; index--) {\r
        ripples[index].age += dt;\r
        if (ripples[index].age > 2.6) ripples.splice(index, 1);\r
      }\r
      rippleData.fill(0);\r
      ripples.forEach((ripple, index) => {\r
        rippleData[index * 4] = ripple.x;\r
        rippleData[index * 4 + 1] = ripple.y;\r
        rippleData[index * 4 + 2] = ripple.age;\r
        rippleData[index * 4 + 3] = 1;\r
      });\r
\r
      const eased = 1 - Math.pow(1 - reveal, 3);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(shader.program);\r
      gl.bindVertexArray(vao);\r
      const u = shader.uniforms;\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(u.uPixel, size.ratio);\r
      gl.uniform1f(u.uTime, time);\r
      gl.uniform1f(u.uLines, s.lines);\r
      gl.uniform1f(u.uWidth, s.width);\r
      gl.uniform1f(u.uGlow, s.glow);\r
      gl.uniform1f(u.uBrightness, s.brightness);\r
      gl.uniform1f(u.uHighlight, s.highlight);\r
      gl.uniform1f(u.uHighlightWidth, s.highlightWidth);\r
      gl.uniform1f(u.uWarp, s.warp * (0.25 + 0.75 * eased));\r
      gl.uniform1f(u.uScale, s.scale);\r
      gl.uniform1f(u.uRotation, s.rotation);\r
      gl.uniform3f(u.uColor1, s.color1[0], s.color1[1], s.color1[2]);\r
      gl.uniform3f(u.uColor2, s.color2[0], s.color2[1], s.color2[2]);\r
      gl.uniform3f(u.uColor3, s.color3[0], s.color3[1], s.color3[2]);\r
      gl.uniform1f(u.uCycle, cycle);\r
      gl.uniform1f(u.uEdge, s.edge);\r
      gl.uniform4f(u.uMouse, lens.x, lens.y, lens.presence * s.influence * 0.16, 0.2);\r
      gl.uniform4fv(u.uRipples, rippleData);\r
      gl.uniform1f(u.uReveal, eased);\r
      gl.uniform1f(u.uLight, s.light ? 1 : 0);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      const settling = Math.abs(presence - lens.presence) > 0.002;\r
      const busy = (s.speed > 0 && !reduced) || reveal < 1 || settling || ripples.length > 0 || tracking;\r
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
        y: event.clientY - rect.top,\r
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
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = spot.inside;\r
      wake();\r
    };\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      const spot = locate(event);\r
      if (!spot.inside || !s.clickRipple || reduced) return;\r
      const [x, y] = toField(spot.x, spot.y);\r
      ripples.push({ x, y, age: 0 });\r
      if (ripples.length > MAX_RIPPLES) ripples.shift();\r
      wake();\r
    };\r
    const onLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
    const onPointerUp = (event: PointerEvent) => {\r
      if (event.pointerType !== 'mouse') onLeave();\r
    };\r
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
        gl.deleteVertexArray(vao);\r
        gl.deleteProgram(shader.program);\r
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
export default LineWaves;\r
`,i={usage:`import LineWaves from './LineWaves';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <LineWaves
    color1="#ffffff"
    color2="#ffffff"
    color3="#ffffff"
    speed={0.3}
    lineCount={72}
    lineWidth={1.3}
    highlight={1}
    warpIntensity={1}
    rotation={-33}
    enableMouseInteraction={true}
  />
</div>`,code:n,css:r,tailwind:e,tsCode:t,tsTailwind:o};export{i as lineWaves};
