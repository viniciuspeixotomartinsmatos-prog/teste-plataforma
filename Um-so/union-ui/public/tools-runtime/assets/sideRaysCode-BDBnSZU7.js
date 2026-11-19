const n=`'use client';\r
\r
import { useEffect, useRef, useState } from 'react';\r
import './SideRays.css';\r
\r
const PIXEL_BUDGET = 2.4e6;\r
const TAU = Math.PI * 2;\r
\r
const ORIGINS = {\r
  'top-right': { flipX: 0, flipY: 0, side: 0 },\r
  'top-left': { flipX: 1, flipY: 0, side: 0 },\r
  'bottom-right': { flipX: 0, flipY: 1, side: 0 },\r
  'bottom-left': { flipX: 1, flipY: 1, side: 0 },\r
  right: { flipX: 0, flipY: 0, side: 1 },\r
  left: { flipX: 1, flipY: 0, side: 1 }\r
};\r
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
uniform float uTime;\r
uniform vec3 uColorA;\r
uniform vec3 uColorB;\r
uniform float uBlend;\r
uniform float uIntensity;\r
uniform float uSpread;\r
uniform float uDensity;\r
uniform float uSharpness;\r
uniform float uFalloff;\r
uniform float uGlow;\r
uniform float uSaturation;\r
uniform float uDust;\r
uniform float uOpacity;\r
uniform float uReveal;\r
uniform float uLight;\r
uniform vec3 uFrame;\r
uniform float uAim;\r
uniform vec3 uFocus;\r
uniform float uSway;\r
out vec4 fragColor;\r
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
  float a = hash(i);\r
  float b = hash(i + vec2(1.0, 0.0));\r
  float c = hash(i + vec2(0.0, 1.0));\r
  float d = hash(i + vec2(1.0, 1.0));\r
  return mix(mix(a, b, w.x), mix(c, d, w.x), w.y);\r
}\r
\r
float shafts(float u, float t, float seed, float aa) {\r
  float sway = (0.4 * sin(t * 0.31 + seed) + 0.24 * sin(t * 0.17 + seed * 2.3)) * uSway;\r
  float n = 0.7 * noise(vec2(u + sway + seed, t * 0.3)) + 0.3 * noise(vec2(u * 2.4 + sway * 1.5 + seed * 1.7, t * 0.45 + 3.0));\r
  float width = mix(0.5, 0.1, uSharpness);\r
  float s = mix(smoothstep(0.5 - width, 0.5 + width, n), 0.5, aa);\r
  return mix(0.05, 1.0, s);\r
}\r
\r
float motes(vec2 p, float cell, float t, float seed) {\r
  p += vec2(t * 0.021, -t * 0.013) + seed * 7.31;\r
  vec2 grid = p / cell;\r
  vec2 id = floor(grid);\r
  vec2 f = grid - id;\r
  float h = hash(id + seed);\r
  if (h > 0.5) return 0.0;\r
  vec2 center = 0.25 + 0.5 * vec2(hash(id + 1.7 + seed), hash(id + 3.1 + seed));\r
  center += 0.1 * vec2(sin(t * 0.7 + h * 31.0), cos(t * 0.6 + h * 23.0));\r
  float size = mix(0.035, 0.09, hash(id + 5.3 + seed));\r
  float edge = length(fwidth(grid)) * 0.7;\r
  float twinkle = 0.55 + 0.45 * sin(t * 1.9 + h * 41.0);\r
  return (1.0 - smoothstep(size - edge, size + edge, length(f - center))) * twinkle;\r
}\r
\r
void main() {\r
  float aspect = uResolution.x / uResolution.y;\r
  vec2 q = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;\r
  if (uFrame.x > 0.5) q.x = -q.x;\r
  if (uFrame.y > 0.5) q.y = -q.y;\r
  vec2 source = uFrame.z > 0.5 ? vec2(aspect * 0.5 + 0.42, 0.3) : vec2(aspect * 0.5 + 0.1, 0.62);\r
  float heading = (uFrame.z > 0.5 ? 3.42 : -2.48) + uAim + 0.035 * sin(uTime * 0.21) * uSway;\r
  vec2 v = q - source;\r
  float r = length(v);\r
  float angle = mod(atan(v.y, v.x) - heading + 3.14159265, 6.28318531) - 3.14159265;\r
  float t = uTime;\r
  float u = angle * uDensity;\r
  float aa = smoothstep(0.12, 0.45, fwidth(u));\r
  float offset = uSpread * 0.22;\r
  float fanA = exp(-pow((angle + offset) / uSpread, 2.0) * 1.4);\r
  float fanB = exp(-pow((angle - offset) / (uSpread * 1.15), 2.0) * 1.4);\r
  float focus = 1.0 + uFocus.z * exp(-pow((angle - uFocus.x) / uFocus.y, 2.0));\r
  float lightA = fanA * shafts(u, t, 0.0, aa) * focus;\r
  float lightB = fanB * shafts(u * 0.83, t * 0.6, 17.0, aa) * focus;\r
  float reach = 1.0 / (1.0 + pow(r / 0.4, uFalloff));\r
  vec3 glowColor = mix(uColorA, uColorB, uBlend);\r
  vec3 light = (uColorA * lightA * (1.0 - uBlend) + uColorB * lightB * uBlend) * 2.0 * reach;\r
  light += glowColor * uGlow * exp(-pow(r / 0.4, 2.0));\r
  if (uDust > 0.0) {\r
    float sparkle = motes(q, 0.06, t, 0.0) + 0.7 * motes(q, 0.038, t * 0.8, 9.0);\r
    light += mix(glowColor, vec3(1.0), 0.6) * sparkle * (lightA + lightB) * reach * uDust * 2.5;\r
  }\r
  light *= uIntensity * (1.0 - smoothstep(uReveal * 2.6 - 0.45, uReveal * 2.6, r)) * smoothstep(0.0, 0.35, uReveal);\r
  float gray = dot(light, vec3(0.2126, 0.7152, 0.0722));\r
  light = max(mix(vec3(gray), light, uSaturation), 0.0);\r
  float peak = max(light.r, max(light.g, light.b));\r
  float grain = (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;\r
  if (uLight > 0.5) {\r
    vec3 ink = pow(light / max(peak, 1e-4), vec3(2.0)) * 0.75;\r
    float alpha = clamp(pow(1.0 - exp(-peak * 2.6), 2.5) * 0.9 * uOpacity + grain, 0.0, 1.0);\r
    fragColor = vec4(pow(ink, vec3(1.0 / 2.2)) * alpha, alpha);\r
    return;\r
  }\r
  float mapped = 1.0 - exp(-peak);\r
  vec3 tone = light * (mapped / max(peak, 1e-4));\r
  tone = mix(tone, vec3(mapped), smoothstep(0.7, 1.0, mapped) * 0.55);\r
  vec3 shown = clamp(tone * uOpacity, 0.0, 1.0);\r
  float alpha = max(shown.r, max(shown.g, shown.b));\r
  vec3 color = clamp(shown * alpha + grain, 0.0, 1.0);\r
  fragColor = vec4(min(color, vec3(alpha)), alpha);\r
}\`;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const wrapAngle = angle => ((((angle + Math.PI) % TAU) + TAU) % TAU) - Math.PI;\r
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
const geometryFor = (frame, aspect) => ({\r
  source: frame.side ? [aspect * 0.5 + 0.42, 0.3] : [aspect * 0.5 + 0.1, 0.62],\r
  heading: frame.side ? 3.42 : -2.48\r
});\r
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
    if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const SideRays = ({\r
  rayColor1 = '#FFC46B',\r
  rayColor2 = '#96c8ff',\r
  blend = 0.6,\r
  origin = 'top-right',\r
  speed = 2.5,\r
  intensity = 2,\r
  spread = 2,\r
  density = 5,\r
  sharpness = 0.5,\r
  tilt = 0,\r
  falloff = 1.6,\r
  glow = 1,\r
  saturation = 1,\r
  dust = 0,\r
  followMouse = true,\r
  mouseInfluence = 0.5,\r
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
    colorA: parseColor(rayColor1),\r
    colorB: parseColor(rayColor2),\r
    blend: clamp(blend, 0, 1),\r
    frame: ORIGINS[origin] ?? ORIGINS['top-right'],\r
    speed: Math.max(0, speed) * 0.4,\r
    intensity: Math.max(0, intensity) * 0.75,\r
    spread: clamp(spread, 0.1, 8) * 0.225,\r
    density: clamp(density, 1, 40),\r
    sharpness: clamp(sharpness, 0, 1),\r
    tilt: (clamp(tilt, -180, 180) * Math.PI) / 180,\r
    falloff: clamp(falloff, 0.2, 6),\r
    glow: Math.max(0, glow) * 1.2,\r
    saturation: Math.max(0, saturation),\r
    dust: clamp(dust, 0, 1),\r
    followMouse,\r
    mouseInfluence: clamp(mouseInfluence, 0, 1),\r
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
    const size = { width: 1, height: 1 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const aim = { value: 0, velocity: 0 };\r
    const focus = { angle: 0, strength: 0 };\r
    let time = Math.random() * 100;\r
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
    };\r
\r
    const pointerAngle = s => {\r
      let x = (pointer.x - size.width / 2) / size.height;\r
      let y = (size.height / 2 - pointer.y) / size.height;\r
      if (s.frame.flipX) x = -x;\r
      if (s.frame.flipY) y = -y;\r
      const { source, heading } = geometryFor(s.frame, size.width / size.height);\r
      return wrapAngle(Math.atan2(y - source[1], x - source[0]) - heading - s.tilt);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (lost) return;\r
      const s = settingsRef.current;\r
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05);\r
      last = Math.max(last, now);\r
      time += dt * s.speed * (reduced ? 0.3 : 1);\r
      if (reveal < 1) reveal = Math.min(1, reveal + dt / 1.6);\r
\r
      const tracking = s.followMouse && pointer.inside && !reduced;\r
      const pointed = tracking ? pointerAngle(s) : 0;\r
      const target = tracking ? clamp(pointed, -s.spread, s.spread) * s.mouseInfluence : 0;\r
      const focusTarget = tracking ? s.mouseInfluence : 0;\r
      const ease = 1 - Math.exp(-dt * 6);\r
      if (tracking) focus.angle += (clamp(pointed - aim.value, -s.spread * 1.5, s.spread * 1.5) - focus.angle) * ease;\r
      focus.strength += (focusTarget - focus.strength) * ease;\r
      const stiffness = 18;\r
      const damping = 2 * Math.sqrt(stiffness);\r
      aim.velocity += ((target - aim.value) * stiffness - aim.velocity * damping) * dt;\r
      aim.value += aim.velocity * dt;\r
\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(shader.program);\r
      gl.bindVertexArray(vao);\r
      const u = shader.uniforms;\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(u.uTime, time);\r
      gl.uniform3f(u.uColorA, s.colorA[0], s.colorA[1], s.colorA[2]);\r
      gl.uniform3f(u.uColorB, s.colorB[0], s.colorB[1], s.colorB[2]);\r
      gl.uniform1f(u.uBlend, s.blend);\r
      gl.uniform1f(u.uIntensity, s.intensity);\r
      gl.uniform1f(u.uSpread, s.spread);\r
      gl.uniform1f(u.uDensity, s.density);\r
      gl.uniform1f(u.uSharpness, s.sharpness);\r
      gl.uniform1f(u.uFalloff, s.falloff);\r
      gl.uniform1f(u.uGlow, s.glow);\r
      gl.uniform1f(u.uSaturation, s.saturation);\r
      gl.uniform1f(u.uDust, s.dust);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.uniform1f(u.uReveal, 1 - Math.pow(1 - reveal, 3));\r
      gl.uniform1f(u.uLight, s.light ? 1 : 0);\r
      gl.uniform3f(u.uFrame, s.frame.flipX, s.frame.flipY, s.frame.side);\r
      gl.uniform1f(u.uAim, s.tilt + aim.value);\r
      gl.uniform3f(u.uFocus, focus.angle, Math.max(0.06, s.spread * 0.25), focus.strength * 1.4);\r
      gl.uniform1f(u.uSway, reduced ? 0 : 1);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      const settling =\r
        Math.abs(target - aim.value) > 1e-4 ||\r
        Math.abs(aim.velocity) > 1e-4 ||\r
        Math.abs(focusTarget - focus.strength) > 1e-3;\r
      const busy = (s.speed > 0 && !reduced) || reveal < 1 || settling;\r
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
    const onPointerMove = event => {\r
      const rect = container.getBoundingClientRect();\r
      pointer.x = event.clientX - rect.left;\r
      pointer.y = event.clientY - rect.top;\r
      pointer.inside =\r
        event.clientX >= rect.left &&\r
        event.clientX <= rect.right &&\r
        event.clientY >= rect.top &&\r
        event.clientY <= rect.bottom;\r
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
    <div ref={containerRef} className={\`side-rays\${className ? \` \${className}\` : ''}\`} style={style}>\r
      <canvas ref={canvasRef} className="side-rays__canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default SideRays;\r
`,r=`.side-rays {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
  pointer-events: none;\r
}\r
\r
.side-rays__canvas {\r
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
const TAU = Math.PI * 2;\r
\r
const ORIGINS = {\r
  'top-right': { flipX: 0, flipY: 0, side: 0 },\r
  'top-left': { flipX: 1, flipY: 0, side: 0 },\r
  'bottom-right': { flipX: 0, flipY: 1, side: 0 },\r
  'bottom-left': { flipX: 1, flipY: 1, side: 0 },\r
  right: { flipX: 0, flipY: 0, side: 1 },\r
  left: { flipX: 1, flipY: 0, side: 1 }\r
};\r
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
uniform float uTime;\r
uniform vec3 uColorA;\r
uniform vec3 uColorB;\r
uniform float uBlend;\r
uniform float uIntensity;\r
uniform float uSpread;\r
uniform float uDensity;\r
uniform float uSharpness;\r
uniform float uFalloff;\r
uniform float uGlow;\r
uniform float uSaturation;\r
uniform float uDust;\r
uniform float uOpacity;\r
uniform float uReveal;\r
uniform float uLight;\r
uniform vec3 uFrame;\r
uniform float uAim;\r
uniform vec3 uFocus;\r
uniform float uSway;\r
out vec4 fragColor;\r
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
  float a = hash(i);\r
  float b = hash(i + vec2(1.0, 0.0));\r
  float c = hash(i + vec2(0.0, 1.0));\r
  float d = hash(i + vec2(1.0, 1.0));\r
  return mix(mix(a, b, w.x), mix(c, d, w.x), w.y);\r
}\r
\r
float shafts(float u, float t, float seed, float aa) {\r
  float sway = (0.4 * sin(t * 0.31 + seed) + 0.24 * sin(t * 0.17 + seed * 2.3)) * uSway;\r
  float n = 0.7 * noise(vec2(u + sway + seed, t * 0.3)) + 0.3 * noise(vec2(u * 2.4 + sway * 1.5 + seed * 1.7, t * 0.45 + 3.0));\r
  float width = mix(0.5, 0.1, uSharpness);\r
  float s = mix(smoothstep(0.5 - width, 0.5 + width, n), 0.5, aa);\r
  return mix(0.05, 1.0, s);\r
}\r
\r
float motes(vec2 p, float cell, float t, float seed) {\r
  p += vec2(t * 0.021, -t * 0.013) + seed * 7.31;\r
  vec2 grid = p / cell;\r
  vec2 id = floor(grid);\r
  vec2 f = grid - id;\r
  float h = hash(id + seed);\r
  if (h > 0.5) return 0.0;\r
  vec2 center = 0.25 + 0.5 * vec2(hash(id + 1.7 + seed), hash(id + 3.1 + seed));\r
  center += 0.1 * vec2(sin(t * 0.7 + h * 31.0), cos(t * 0.6 + h * 23.0));\r
  float size = mix(0.035, 0.09, hash(id + 5.3 + seed));\r
  float edge = length(fwidth(grid)) * 0.7;\r
  float twinkle = 0.55 + 0.45 * sin(t * 1.9 + h * 41.0);\r
  return (1.0 - smoothstep(size - edge, size + edge, length(f - center))) * twinkle;\r
}\r
\r
void main() {\r
  float aspect = uResolution.x / uResolution.y;\r
  vec2 q = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;\r
  if (uFrame.x > 0.5) q.x = -q.x;\r
  if (uFrame.y > 0.5) q.y = -q.y;\r
  vec2 source = uFrame.z > 0.5 ? vec2(aspect * 0.5 + 0.42, 0.3) : vec2(aspect * 0.5 + 0.1, 0.62);\r
  float heading = (uFrame.z > 0.5 ? 3.42 : -2.48) + uAim + 0.035 * sin(uTime * 0.21) * uSway;\r
  vec2 v = q - source;\r
  float r = length(v);\r
  float angle = mod(atan(v.y, v.x) - heading + 3.14159265, 6.28318531) - 3.14159265;\r
  float t = uTime;\r
  float u = angle * uDensity;\r
  float aa = smoothstep(0.12, 0.45, fwidth(u));\r
  float offset = uSpread * 0.22;\r
  float fanA = exp(-pow((angle + offset) / uSpread, 2.0) * 1.4);\r
  float fanB = exp(-pow((angle - offset) / (uSpread * 1.15), 2.0) * 1.4);\r
  float focus = 1.0 + uFocus.z * exp(-pow((angle - uFocus.x) / uFocus.y, 2.0));\r
  float lightA = fanA * shafts(u, t, 0.0, aa) * focus;\r
  float lightB = fanB * shafts(u * 0.83, t * 0.6, 17.0, aa) * focus;\r
  float reach = 1.0 / (1.0 + pow(r / 0.4, uFalloff));\r
  vec3 glowColor = mix(uColorA, uColorB, uBlend);\r
  vec3 light = (uColorA * lightA * (1.0 - uBlend) + uColorB * lightB * uBlend) * 2.0 * reach;\r
  light += glowColor * uGlow * exp(-pow(r / 0.4, 2.0));\r
  if (uDust > 0.0) {\r
    float sparkle = motes(q, 0.06, t, 0.0) + 0.7 * motes(q, 0.038, t * 0.8, 9.0);\r
    light += mix(glowColor, vec3(1.0), 0.6) * sparkle * (lightA + lightB) * reach * uDust * 2.5;\r
  }\r
  light *= uIntensity * (1.0 - smoothstep(uReveal * 2.6 - 0.45, uReveal * 2.6, r)) * smoothstep(0.0, 0.35, uReveal);\r
  float gray = dot(light, vec3(0.2126, 0.7152, 0.0722));\r
  light = max(mix(vec3(gray), light, uSaturation), 0.0);\r
  float peak = max(light.r, max(light.g, light.b));\r
  float grain = (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;\r
  if (uLight > 0.5) {\r
    vec3 ink = pow(light / max(peak, 1e-4), vec3(2.0)) * 0.75;\r
    float alpha = clamp(pow(1.0 - exp(-peak * 2.6), 2.5) * 0.9 * uOpacity + grain, 0.0, 1.0);\r
    fragColor = vec4(pow(ink, vec3(1.0 / 2.2)) * alpha, alpha);\r
    return;\r
  }\r
  float mapped = 1.0 - exp(-peak);\r
  vec3 tone = light * (mapped / max(peak, 1e-4));\r
  tone = mix(tone, vec3(mapped), smoothstep(0.7, 1.0, mapped) * 0.55);\r
  vec3 shown = clamp(tone * uOpacity, 0.0, 1.0);\r
  float alpha = max(shown.r, max(shown.g, shown.b));\r
  vec3 color = clamp(shown * alpha + grain, 0.0, 1.0);\r
  fragColor = vec4(min(color, vec3(alpha)), alpha);\r
}\`;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const wrapAngle = angle => ((((angle + Math.PI) % TAU) + TAU) % TAU) - Math.PI;\r
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
const geometryFor = (frame, aspect) => ({\r
  source: frame.side ? [aspect * 0.5 + 0.42, 0.3] : [aspect * 0.5 + 0.1, 0.62],\r
  heading: frame.side ? 3.42 : -2.48\r
});\r
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
    if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const SideRays = ({\r
  rayColor1 = '#FFC46B',\r
  rayColor2 = '#96c8ff',\r
  blend = 0.6,\r
  origin = 'top-right',\r
  speed = 2.5,\r
  intensity = 2,\r
  spread = 2,\r
  density = 5,\r
  sharpness = 0.5,\r
  tilt = 0,\r
  falloff = 1.6,\r
  glow = 1,\r
  saturation = 1,\r
  dust = 0,\r
  followMouse = true,\r
  mouseInfluence = 0.5,\r
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
    colorA: parseColor(rayColor1),\r
    colorB: parseColor(rayColor2),\r
    blend: clamp(blend, 0, 1),\r
    frame: ORIGINS[origin] ?? ORIGINS['top-right'],\r
    speed: Math.max(0, speed) * 0.4,\r
    intensity: Math.max(0, intensity) * 0.75,\r
    spread: clamp(spread, 0.1, 8) * 0.225,\r
    density: clamp(density, 1, 40),\r
    sharpness: clamp(sharpness, 0, 1),\r
    tilt: (clamp(tilt, -180, 180) * Math.PI) / 180,\r
    falloff: clamp(falloff, 0.2, 6),\r
    glow: Math.max(0, glow) * 1.2,\r
    saturation: Math.max(0, saturation),\r
    dust: clamp(dust, 0, 1),\r
    followMouse,\r
    mouseInfluence: clamp(mouseInfluence, 0, 1),\r
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
    const size = { width: 1, height: 1 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const aim = { value: 0, velocity: 0 };\r
    const focus = { angle: 0, strength: 0 };\r
    let time = Math.random() * 100;\r
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
    };\r
\r
    const pointerAngle = s => {\r
      let x = (pointer.x - size.width / 2) / size.height;\r
      let y = (size.height / 2 - pointer.y) / size.height;\r
      if (s.frame.flipX) x = -x;\r
      if (s.frame.flipY) y = -y;\r
      const { source, heading } = geometryFor(s.frame, size.width / size.height);\r
      return wrapAngle(Math.atan2(y - source[1], x - source[0]) - heading - s.tilt);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (lost) return;\r
      const s = settingsRef.current;\r
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05);\r
      last = Math.max(last, now);\r
      time += dt * s.speed * (reduced ? 0.3 : 1);\r
      if (reveal < 1) reveal = Math.min(1, reveal + dt / 1.6);\r
\r
      const tracking = s.followMouse && pointer.inside && !reduced;\r
      const pointed = tracking ? pointerAngle(s) : 0;\r
      const target = tracking ? clamp(pointed, -s.spread, s.spread) * s.mouseInfluence : 0;\r
      const focusTarget = tracking ? s.mouseInfluence : 0;\r
      const ease = 1 - Math.exp(-dt * 6);\r
      if (tracking) focus.angle += (clamp(pointed - aim.value, -s.spread * 1.5, s.spread * 1.5) - focus.angle) * ease;\r
      focus.strength += (focusTarget - focus.strength) * ease;\r
      const stiffness = 18;\r
      const damping = 2 * Math.sqrt(stiffness);\r
      aim.velocity += ((target - aim.value) * stiffness - aim.velocity * damping) * dt;\r
      aim.value += aim.velocity * dt;\r
\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(shader.program);\r
      gl.bindVertexArray(vao);\r
      const u = shader.uniforms;\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(u.uTime, time);\r
      gl.uniform3f(u.uColorA, s.colorA[0], s.colorA[1], s.colorA[2]);\r
      gl.uniform3f(u.uColorB, s.colorB[0], s.colorB[1], s.colorB[2]);\r
      gl.uniform1f(u.uBlend, s.blend);\r
      gl.uniform1f(u.uIntensity, s.intensity);\r
      gl.uniform1f(u.uSpread, s.spread);\r
      gl.uniform1f(u.uDensity, s.density);\r
      gl.uniform1f(u.uSharpness, s.sharpness);\r
      gl.uniform1f(u.uFalloff, s.falloff);\r
      gl.uniform1f(u.uGlow, s.glow);\r
      gl.uniform1f(u.uSaturation, s.saturation);\r
      gl.uniform1f(u.uDust, s.dust);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.uniform1f(u.uReveal, 1 - Math.pow(1 - reveal, 3));\r
      gl.uniform1f(u.uLight, s.light ? 1 : 0);\r
      gl.uniform3f(u.uFrame, s.frame.flipX, s.frame.flipY, s.frame.side);\r
      gl.uniform1f(u.uAim, s.tilt + aim.value);\r
      gl.uniform3f(u.uFocus, focus.angle, Math.max(0.06, s.spread * 0.25), focus.strength * 1.4);\r
      gl.uniform1f(u.uSway, reduced ? 0 : 1);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      const settling =\r
        Math.abs(target - aim.value) > 1e-4 ||\r
        Math.abs(aim.velocity) > 1e-4 ||\r
        Math.abs(focusTarget - focus.strength) > 1e-3;\r
      const busy = (s.speed > 0 && !reduced) || reveal < 1 || settling;\r
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
    const onPointerMove = event => {\r
      const rect = container.getBoundingClientRect();\r
      pointer.x = event.clientX - rect.left;\r
      pointer.y = event.clientY - rect.top;\r
      pointer.inside =\r
        event.clientX >= rect.left &&\r
        event.clientX <= rect.right &&\r
        event.clientY >= rect.top &&\r
        event.clientY <= rect.bottom;\r
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
    <div\r
      ref={containerRef}\r
      className={\`pointer-events-none relative h-full w-full overflow-hidden \${className}\`.trim()}\r
      style={style}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default SideRays;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, useState, type CSSProperties } from 'react';\r
import './SideRays.css';\r
\r
type Origin = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'right' | 'left';\r
\r
export interface SideRaysProps {\r
  rayColor1?: string;\r
  rayColor2?: string;\r
  blend?: number;\r
  origin?: Origin;\r
  speed?: number;\r
  intensity?: number;\r
  spread?: number;\r
  density?: number;\r
  sharpness?: number;\r
  tilt?: number;\r
  falloff?: number;\r
  glow?: number;\r
  saturation?: number;\r
  dust?: number;\r
  followMouse?: boolean;\r
  mouseInfluence?: number;\r
  intro?: boolean;\r
  lightMode?: boolean;\r
  opacity?: number;\r
  maxDevicePixelRatio?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Frame {\r
  flipX: number;\r
  flipY: number;\r
  side: number;\r
}\r
\r
interface Settings {\r
  colorA: number[];\r
  colorB: number[];\r
  blend: number;\r
  frame: Frame;\r
  speed: number;\r
  intensity: number;\r
  spread: number;\r
  density: number;\r
  sharpness: number;\r
  tilt: number;\r
  falloff: number;\r
  glow: number;\r
  saturation: number;\r
  dust: number;\r
  followMouse: boolean;\r
  mouseInfluence: number;\r
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
const PIXEL_BUDGET = 2.4e6;\r
const TAU = Math.PI * 2;\r
\r
const ORIGINS: Record<Origin, Frame> = {\r
  'top-right': { flipX: 0, flipY: 0, side: 0 },\r
  'top-left': { flipX: 1, flipY: 0, side: 0 },\r
  'bottom-right': { flipX: 0, flipY: 1, side: 0 },\r
  'bottom-left': { flipX: 1, flipY: 1, side: 0 },\r
  right: { flipX: 0, flipY: 0, side: 1 },\r
  left: { flipX: 1, flipY: 0, side: 1 }\r
};\r
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
uniform float uTime;\r
uniform vec3 uColorA;\r
uniform vec3 uColorB;\r
uniform float uBlend;\r
uniform float uIntensity;\r
uniform float uSpread;\r
uniform float uDensity;\r
uniform float uSharpness;\r
uniform float uFalloff;\r
uniform float uGlow;\r
uniform float uSaturation;\r
uniform float uDust;\r
uniform float uOpacity;\r
uniform float uReveal;\r
uniform float uLight;\r
uniform vec3 uFrame;\r
uniform float uAim;\r
uniform vec3 uFocus;\r
uniform float uSway;\r
out vec4 fragColor;\r
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
  float a = hash(i);\r
  float b = hash(i + vec2(1.0, 0.0));\r
  float c = hash(i + vec2(0.0, 1.0));\r
  float d = hash(i + vec2(1.0, 1.0));\r
  return mix(mix(a, b, w.x), mix(c, d, w.x), w.y);\r
}\r
\r
float shafts(float u, float t, float seed, float aa) {\r
  float sway = (0.4 * sin(t * 0.31 + seed) + 0.24 * sin(t * 0.17 + seed * 2.3)) * uSway;\r
  float n = 0.7 * noise(vec2(u + sway + seed, t * 0.3)) + 0.3 * noise(vec2(u * 2.4 + sway * 1.5 + seed * 1.7, t * 0.45 + 3.0));\r
  float width = mix(0.5, 0.1, uSharpness);\r
  float s = mix(smoothstep(0.5 - width, 0.5 + width, n), 0.5, aa);\r
  return mix(0.05, 1.0, s);\r
}\r
\r
float motes(vec2 p, float cell, float t, float seed) {\r
  p += vec2(t * 0.021, -t * 0.013) + seed * 7.31;\r
  vec2 grid = p / cell;\r
  vec2 id = floor(grid);\r
  vec2 f = grid - id;\r
  float h = hash(id + seed);\r
  if (h > 0.5) return 0.0;\r
  vec2 center = 0.25 + 0.5 * vec2(hash(id + 1.7 + seed), hash(id + 3.1 + seed));\r
  center += 0.1 * vec2(sin(t * 0.7 + h * 31.0), cos(t * 0.6 + h * 23.0));\r
  float size = mix(0.035, 0.09, hash(id + 5.3 + seed));\r
  float edge = length(fwidth(grid)) * 0.7;\r
  float twinkle = 0.55 + 0.45 * sin(t * 1.9 + h * 41.0);\r
  return (1.0 - smoothstep(size - edge, size + edge, length(f - center))) * twinkle;\r
}\r
\r
void main() {\r
  float aspect = uResolution.x / uResolution.y;\r
  vec2 q = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;\r
  if (uFrame.x > 0.5) q.x = -q.x;\r
  if (uFrame.y > 0.5) q.y = -q.y;\r
  vec2 source = uFrame.z > 0.5 ? vec2(aspect * 0.5 + 0.42, 0.3) : vec2(aspect * 0.5 + 0.1, 0.62);\r
  float heading = (uFrame.z > 0.5 ? 3.42 : -2.48) + uAim + 0.035 * sin(uTime * 0.21) * uSway;\r
  vec2 v = q - source;\r
  float r = length(v);\r
  float angle = mod(atan(v.y, v.x) - heading + 3.14159265, 6.28318531) - 3.14159265;\r
  float t = uTime;\r
  float u = angle * uDensity;\r
  float aa = smoothstep(0.12, 0.45, fwidth(u));\r
  float offset = uSpread * 0.22;\r
  float fanA = exp(-pow((angle + offset) / uSpread, 2.0) * 1.4);\r
  float fanB = exp(-pow((angle - offset) / (uSpread * 1.15), 2.0) * 1.4);\r
  float focus = 1.0 + uFocus.z * exp(-pow((angle - uFocus.x) / uFocus.y, 2.0));\r
  float lightA = fanA * shafts(u, t, 0.0, aa) * focus;\r
  float lightB = fanB * shafts(u * 0.83, t * 0.6, 17.0, aa) * focus;\r
  float reach = 1.0 / (1.0 + pow(r / 0.4, uFalloff));\r
  vec3 glowColor = mix(uColorA, uColorB, uBlend);\r
  vec3 light = (uColorA * lightA * (1.0 - uBlend) + uColorB * lightB * uBlend) * 2.0 * reach;\r
  light += glowColor * uGlow * exp(-pow(r / 0.4, 2.0));\r
  if (uDust > 0.0) {\r
    float sparkle = motes(q, 0.06, t, 0.0) + 0.7 * motes(q, 0.038, t * 0.8, 9.0);\r
    light += mix(glowColor, vec3(1.0), 0.6) * sparkle * (lightA + lightB) * reach * uDust * 2.5;\r
  }\r
  light *= uIntensity * (1.0 - smoothstep(uReveal * 2.6 - 0.45, uReveal * 2.6, r)) * smoothstep(0.0, 0.35, uReveal);\r
  float gray = dot(light, vec3(0.2126, 0.7152, 0.0722));\r
  light = max(mix(vec3(gray), light, uSaturation), 0.0);\r
  float peak = max(light.r, max(light.g, light.b));\r
  float grain = (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;\r
  if (uLight > 0.5) {\r
    vec3 ink = pow(light / max(peak, 1e-4), vec3(2.0)) * 0.75;\r
    float alpha = clamp(pow(1.0 - exp(-peak * 2.6), 2.5) * 0.9 * uOpacity + grain, 0.0, 1.0);\r
    fragColor = vec4(pow(ink, vec3(1.0 / 2.2)) * alpha, alpha);\r
    return;\r
  }\r
  float mapped = 1.0 - exp(-peak);\r
  vec3 tone = light * (mapped / max(peak, 1e-4));\r
  tone = mix(tone, vec3(mapped), smoothstep(0.7, 1.0, mapped) * 0.55);\r
  vec3 shown = clamp(tone * uOpacity, 0.0, 1.0);\r
  float alpha = max(shown.r, max(shown.g, shown.b));\r
  vec3 color = clamp(shown * alpha + grain, 0.0, 1.0);\r
  fragColor = vec4(min(color, vec3(alpha)), alpha);\r
}\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const wrapAngle = (angle: number) => ((((angle + Math.PI) % TAU) + TAU) % TAU) - Math.PI;\r
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
const geometryFor = (frame: Frame, aspect: number) => ({\r
  source: frame.side ? [aspect * 0.5 + 0.42, 0.3] : [aspect * 0.5 + 0.1, 0.62],\r
  heading: frame.side ? 3.42 : -2.48\r
});\r
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
    if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const SideRays = ({\r
  rayColor1 = '#FFC46B',\r
  rayColor2 = '#96c8ff',\r
  blend = 0.6,\r
  origin = 'top-right',\r
  speed = 2.5,\r
  intensity = 2,\r
  spread = 2,\r
  density = 5,\r
  sharpness = 0.5,\r
  tilt = 0,\r
  falloff = 1.6,\r
  glow = 1,\r
  saturation = 1,\r
  dust = 0,\r
  followMouse = true,\r
  mouseInfluence = 0.5,\r
  intro = true,\r
  lightMode = false,\r
  opacity = 1,\r
  maxDevicePixelRatio = 2,\r
  className = '',\r
  style\r
}: SideRaysProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const [generation, setGeneration] = useState(0);\r
\r
  const settings: Settings = {\r
    colorA: parseColor(rayColor1),\r
    colorB: parseColor(rayColor2),\r
    blend: clamp(blend, 0, 1),\r
    frame: ORIGINS[origin] ?? ORIGINS['top-right'],\r
    speed: Math.max(0, speed) * 0.4,\r
    intensity: Math.max(0, intensity) * 0.75,\r
    spread: clamp(spread, 0.1, 8) * 0.225,\r
    density: clamp(density, 1, 40),\r
    sharpness: clamp(sharpness, 0, 1),\r
    tilt: (clamp(tilt, -180, 180) * Math.PI) / 180,\r
    falloff: clamp(falloff, 0.2, 6),\r
    glow: Math.max(0, glow) * 1.2,\r
    saturation: Math.max(0, saturation),\r
    dust: clamp(dust, 0, 1),\r
    followMouse,\r
    mouseInfluence: clamp(mouseInfluence, 0, 1),\r
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
    const size = { width: 1, height: 1 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const aim = { value: 0, velocity: 0 };\r
    const focus = { angle: 0, strength: 0 };\r
    let time = Math.random() * 100;\r
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
    };\r
\r
    const pointerAngle = (s: Settings) => {\r
      let x = (pointer.x - size.width / 2) / size.height;\r
      let y = (size.height / 2 - pointer.y) / size.height;\r
      if (s.frame.flipX) x = -x;\r
      if (s.frame.flipY) y = -y;\r
      const { source, heading } = geometryFor(s.frame, size.width / size.height);\r
      return wrapAngle(Math.atan2(y - source[1], x - source[0]) - heading - s.tilt);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (lost) return;\r
      const s = settingsRef.current;\r
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05);\r
      last = Math.max(last, now);\r
      time += dt * s.speed * (reduced ? 0.3 : 1);\r
      if (reveal < 1) reveal = Math.min(1, reveal + dt / 1.6);\r
\r
      const tracking = s.followMouse && pointer.inside && !reduced;\r
      const pointed = tracking ? pointerAngle(s) : 0;\r
      const target = tracking ? clamp(pointed, -s.spread, s.spread) * s.mouseInfluence : 0;\r
      const focusTarget = tracking ? s.mouseInfluence : 0;\r
      const ease = 1 - Math.exp(-dt * 6);\r
      if (tracking) focus.angle += (clamp(pointed - aim.value, -s.spread * 1.5, s.spread * 1.5) - focus.angle) * ease;\r
      focus.strength += (focusTarget - focus.strength) * ease;\r
      const stiffness = 18;\r
      const damping = 2 * Math.sqrt(stiffness);\r
      aim.velocity += ((target - aim.value) * stiffness - aim.velocity * damping) * dt;\r
      aim.value += aim.velocity * dt;\r
\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(shader.program);\r
      gl.bindVertexArray(vao);\r
      const u = shader.uniforms;\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(u.uTime, time);\r
      gl.uniform3f(u.uColorA, s.colorA[0], s.colorA[1], s.colorA[2]);\r
      gl.uniform3f(u.uColorB, s.colorB[0], s.colorB[1], s.colorB[2]);\r
      gl.uniform1f(u.uBlend, s.blend);\r
      gl.uniform1f(u.uIntensity, s.intensity);\r
      gl.uniform1f(u.uSpread, s.spread);\r
      gl.uniform1f(u.uDensity, s.density);\r
      gl.uniform1f(u.uSharpness, s.sharpness);\r
      gl.uniform1f(u.uFalloff, s.falloff);\r
      gl.uniform1f(u.uGlow, s.glow);\r
      gl.uniform1f(u.uSaturation, s.saturation);\r
      gl.uniform1f(u.uDust, s.dust);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.uniform1f(u.uReveal, 1 - Math.pow(1 - reveal, 3));\r
      gl.uniform1f(u.uLight, s.light ? 1 : 0);\r
      gl.uniform3f(u.uFrame, s.frame.flipX, s.frame.flipY, s.frame.side);\r
      gl.uniform1f(u.uAim, s.tilt + aim.value);\r
      gl.uniform3f(u.uFocus, focus.angle, Math.max(0.06, s.spread * 0.25), focus.strength * 1.4);\r
      gl.uniform1f(u.uSway, reduced ? 0 : 1);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      const settling =\r
        Math.abs(target - aim.value) > 1e-4 ||\r
        Math.abs(aim.velocity) > 1e-4 ||\r
        Math.abs(focusTarget - focus.strength) > 1e-3;\r
      const busy = (s.speed > 0 && !reduced) || reveal < 1 || settling;\r
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
    const onPointerMove = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      pointer.x = event.clientX - rect.left;\r
      pointer.y = event.clientY - rect.top;\r
      pointer.inside =\r
        event.clientX >= rect.left &&\r
        event.clientX <= rect.right &&\r
        event.clientY >= rect.top &&\r
        event.clientY <= rect.bottom;\r
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
    <div ref={containerRef} className={\`side-rays\${className ? \` \${className}\` : ''}\`} style={style}>\r
      <canvas ref={canvasRef} className="side-rays__canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default SideRays;\r
`,o=`'use client';\r
\r
import { useEffect, useRef, useState, type CSSProperties } from 'react';\r
\r
type Origin = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'right' | 'left';\r
\r
export interface SideRaysProps {\r
  rayColor1?: string;\r
  rayColor2?: string;\r
  blend?: number;\r
  origin?: Origin;\r
  speed?: number;\r
  intensity?: number;\r
  spread?: number;\r
  density?: number;\r
  sharpness?: number;\r
  tilt?: number;\r
  falloff?: number;\r
  glow?: number;\r
  saturation?: number;\r
  dust?: number;\r
  followMouse?: boolean;\r
  mouseInfluence?: number;\r
  intro?: boolean;\r
  lightMode?: boolean;\r
  opacity?: number;\r
  maxDevicePixelRatio?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Frame {\r
  flipX: number;\r
  flipY: number;\r
  side: number;\r
}\r
\r
interface Settings {\r
  colorA: number[];\r
  colorB: number[];\r
  blend: number;\r
  frame: Frame;\r
  speed: number;\r
  intensity: number;\r
  spread: number;\r
  density: number;\r
  sharpness: number;\r
  tilt: number;\r
  falloff: number;\r
  glow: number;\r
  saturation: number;\r
  dust: number;\r
  followMouse: boolean;\r
  mouseInfluence: number;\r
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
const PIXEL_BUDGET = 2.4e6;\r
const TAU = Math.PI * 2;\r
\r
const ORIGINS: Record<Origin, Frame> = {\r
  'top-right': { flipX: 0, flipY: 0, side: 0 },\r
  'top-left': { flipX: 1, flipY: 0, side: 0 },\r
  'bottom-right': { flipX: 0, flipY: 1, side: 0 },\r
  'bottom-left': { flipX: 1, flipY: 1, side: 0 },\r
  right: { flipX: 0, flipY: 0, side: 1 },\r
  left: { flipX: 1, flipY: 0, side: 1 }\r
};\r
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
uniform float uTime;\r
uniform vec3 uColorA;\r
uniform vec3 uColorB;\r
uniform float uBlend;\r
uniform float uIntensity;\r
uniform float uSpread;\r
uniform float uDensity;\r
uniform float uSharpness;\r
uniform float uFalloff;\r
uniform float uGlow;\r
uniform float uSaturation;\r
uniform float uDust;\r
uniform float uOpacity;\r
uniform float uReveal;\r
uniform float uLight;\r
uniform vec3 uFrame;\r
uniform float uAim;\r
uniform vec3 uFocus;\r
uniform float uSway;\r
out vec4 fragColor;\r
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
  float a = hash(i);\r
  float b = hash(i + vec2(1.0, 0.0));\r
  float c = hash(i + vec2(0.0, 1.0));\r
  float d = hash(i + vec2(1.0, 1.0));\r
  return mix(mix(a, b, w.x), mix(c, d, w.x), w.y);\r
}\r
\r
float shafts(float u, float t, float seed, float aa) {\r
  float sway = (0.4 * sin(t * 0.31 + seed) + 0.24 * sin(t * 0.17 + seed * 2.3)) * uSway;\r
  float n = 0.7 * noise(vec2(u + sway + seed, t * 0.3)) + 0.3 * noise(vec2(u * 2.4 + sway * 1.5 + seed * 1.7, t * 0.45 + 3.0));\r
  float width = mix(0.5, 0.1, uSharpness);\r
  float s = mix(smoothstep(0.5 - width, 0.5 + width, n), 0.5, aa);\r
  return mix(0.05, 1.0, s);\r
}\r
\r
float motes(vec2 p, float cell, float t, float seed) {\r
  p += vec2(t * 0.021, -t * 0.013) + seed * 7.31;\r
  vec2 grid = p / cell;\r
  vec2 id = floor(grid);\r
  vec2 f = grid - id;\r
  float h = hash(id + seed);\r
  if (h > 0.5) return 0.0;\r
  vec2 center = 0.25 + 0.5 * vec2(hash(id + 1.7 + seed), hash(id + 3.1 + seed));\r
  center += 0.1 * vec2(sin(t * 0.7 + h * 31.0), cos(t * 0.6 + h * 23.0));\r
  float size = mix(0.035, 0.09, hash(id + 5.3 + seed));\r
  float edge = length(fwidth(grid)) * 0.7;\r
  float twinkle = 0.55 + 0.45 * sin(t * 1.9 + h * 41.0);\r
  return (1.0 - smoothstep(size - edge, size + edge, length(f - center))) * twinkle;\r
}\r
\r
void main() {\r
  float aspect = uResolution.x / uResolution.y;\r
  vec2 q = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;\r
  if (uFrame.x > 0.5) q.x = -q.x;\r
  if (uFrame.y > 0.5) q.y = -q.y;\r
  vec2 source = uFrame.z > 0.5 ? vec2(aspect * 0.5 + 0.42, 0.3) : vec2(aspect * 0.5 + 0.1, 0.62);\r
  float heading = (uFrame.z > 0.5 ? 3.42 : -2.48) + uAim + 0.035 * sin(uTime * 0.21) * uSway;\r
  vec2 v = q - source;\r
  float r = length(v);\r
  float angle = mod(atan(v.y, v.x) - heading + 3.14159265, 6.28318531) - 3.14159265;\r
  float t = uTime;\r
  float u = angle * uDensity;\r
  float aa = smoothstep(0.12, 0.45, fwidth(u));\r
  float offset = uSpread * 0.22;\r
  float fanA = exp(-pow((angle + offset) / uSpread, 2.0) * 1.4);\r
  float fanB = exp(-pow((angle - offset) / (uSpread * 1.15), 2.0) * 1.4);\r
  float focus = 1.0 + uFocus.z * exp(-pow((angle - uFocus.x) / uFocus.y, 2.0));\r
  float lightA = fanA * shafts(u, t, 0.0, aa) * focus;\r
  float lightB = fanB * shafts(u * 0.83, t * 0.6, 17.0, aa) * focus;\r
  float reach = 1.0 / (1.0 + pow(r / 0.4, uFalloff));\r
  vec3 glowColor = mix(uColorA, uColorB, uBlend);\r
  vec3 light = (uColorA * lightA * (1.0 - uBlend) + uColorB * lightB * uBlend) * 2.0 * reach;\r
  light += glowColor * uGlow * exp(-pow(r / 0.4, 2.0));\r
  if (uDust > 0.0) {\r
    float sparkle = motes(q, 0.06, t, 0.0) + 0.7 * motes(q, 0.038, t * 0.8, 9.0);\r
    light += mix(glowColor, vec3(1.0), 0.6) * sparkle * (lightA + lightB) * reach * uDust * 2.5;\r
  }\r
  light *= uIntensity * (1.0 - smoothstep(uReveal * 2.6 - 0.45, uReveal * 2.6, r)) * smoothstep(0.0, 0.35, uReveal);\r
  float gray = dot(light, vec3(0.2126, 0.7152, 0.0722));\r
  light = max(mix(vec3(gray), light, uSaturation), 0.0);\r
  float peak = max(light.r, max(light.g, light.b));\r
  float grain = (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;\r
  if (uLight > 0.5) {\r
    vec3 ink = pow(light / max(peak, 1e-4), vec3(2.0)) * 0.75;\r
    float alpha = clamp(pow(1.0 - exp(-peak * 2.6), 2.5) * 0.9 * uOpacity + grain, 0.0, 1.0);\r
    fragColor = vec4(pow(ink, vec3(1.0 / 2.2)) * alpha, alpha);\r
    return;\r
  }\r
  float mapped = 1.0 - exp(-peak);\r
  vec3 tone = light * (mapped / max(peak, 1e-4));\r
  tone = mix(tone, vec3(mapped), smoothstep(0.7, 1.0, mapped) * 0.55);\r
  vec3 shown = clamp(tone * uOpacity, 0.0, 1.0);\r
  float alpha = max(shown.r, max(shown.g, shown.b));\r
  vec3 color = clamp(shown * alpha + grain, 0.0, 1.0);\r
  fragColor = vec4(min(color, vec3(alpha)), alpha);\r
}\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const wrapAngle = (angle: number) => ((((angle + Math.PI) % TAU) + TAU) % TAU) - Math.PI;\r
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
const geometryFor = (frame: Frame, aspect: number) => ({\r
  source: frame.side ? [aspect * 0.5 + 0.42, 0.3] : [aspect * 0.5 + 0.1, 0.62],\r
  heading: frame.side ? 3.42 : -2.48\r
});\r
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
    if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const SideRays = ({\r
  rayColor1 = '#FFC46B',\r
  rayColor2 = '#96c8ff',\r
  blend = 0.6,\r
  origin = 'top-right',\r
  speed = 2.5,\r
  intensity = 2,\r
  spread = 2,\r
  density = 5,\r
  sharpness = 0.5,\r
  tilt = 0,\r
  falloff = 1.6,\r
  glow = 1,\r
  saturation = 1,\r
  dust = 0,\r
  followMouse = true,\r
  mouseInfluence = 0.5,\r
  intro = true,\r
  lightMode = false,\r
  opacity = 1,\r
  maxDevicePixelRatio = 2,\r
  className = '',\r
  style\r
}: SideRaysProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const [generation, setGeneration] = useState(0);\r
\r
  const settings: Settings = {\r
    colorA: parseColor(rayColor1),\r
    colorB: parseColor(rayColor2),\r
    blend: clamp(blend, 0, 1),\r
    frame: ORIGINS[origin] ?? ORIGINS['top-right'],\r
    speed: Math.max(0, speed) * 0.4,\r
    intensity: Math.max(0, intensity) * 0.75,\r
    spread: clamp(spread, 0.1, 8) * 0.225,\r
    density: clamp(density, 1, 40),\r
    sharpness: clamp(sharpness, 0, 1),\r
    tilt: (clamp(tilt, -180, 180) * Math.PI) / 180,\r
    falloff: clamp(falloff, 0.2, 6),\r
    glow: Math.max(0, glow) * 1.2,\r
    saturation: Math.max(0, saturation),\r
    dust: clamp(dust, 0, 1),\r
    followMouse,\r
    mouseInfluence: clamp(mouseInfluence, 0, 1),\r
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
    const size = { width: 1, height: 1 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const aim = { value: 0, velocity: 0 };\r
    const focus = { angle: 0, strength: 0 };\r
    let time = Math.random() * 100;\r
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
    };\r
\r
    const pointerAngle = (s: Settings) => {\r
      let x = (pointer.x - size.width / 2) / size.height;\r
      let y = (size.height / 2 - pointer.y) / size.height;\r
      if (s.frame.flipX) x = -x;\r
      if (s.frame.flipY) y = -y;\r
      const { source, heading } = geometryFor(s.frame, size.width / size.height);\r
      return wrapAngle(Math.atan2(y - source[1], x - source[0]) - heading - s.tilt);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (lost) return;\r
      const s = settingsRef.current;\r
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05);\r
      last = Math.max(last, now);\r
      time += dt * s.speed * (reduced ? 0.3 : 1);\r
      if (reveal < 1) reveal = Math.min(1, reveal + dt / 1.6);\r
\r
      const tracking = s.followMouse && pointer.inside && !reduced;\r
      const pointed = tracking ? pointerAngle(s) : 0;\r
      const target = tracking ? clamp(pointed, -s.spread, s.spread) * s.mouseInfluence : 0;\r
      const focusTarget = tracking ? s.mouseInfluence : 0;\r
      const ease = 1 - Math.exp(-dt * 6);\r
      if (tracking) focus.angle += (clamp(pointed - aim.value, -s.spread * 1.5, s.spread * 1.5) - focus.angle) * ease;\r
      focus.strength += (focusTarget - focus.strength) * ease;\r
      const stiffness = 18;\r
      const damping = 2 * Math.sqrt(stiffness);\r
      aim.velocity += ((target - aim.value) * stiffness - aim.velocity * damping) * dt;\r
      aim.value += aim.velocity * dt;\r
\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(shader.program);\r
      gl.bindVertexArray(vao);\r
      const u = shader.uniforms;\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(u.uTime, time);\r
      gl.uniform3f(u.uColorA, s.colorA[0], s.colorA[1], s.colorA[2]);\r
      gl.uniform3f(u.uColorB, s.colorB[0], s.colorB[1], s.colorB[2]);\r
      gl.uniform1f(u.uBlend, s.blend);\r
      gl.uniform1f(u.uIntensity, s.intensity);\r
      gl.uniform1f(u.uSpread, s.spread);\r
      gl.uniform1f(u.uDensity, s.density);\r
      gl.uniform1f(u.uSharpness, s.sharpness);\r
      gl.uniform1f(u.uFalloff, s.falloff);\r
      gl.uniform1f(u.uGlow, s.glow);\r
      gl.uniform1f(u.uSaturation, s.saturation);\r
      gl.uniform1f(u.uDust, s.dust);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.uniform1f(u.uReveal, 1 - Math.pow(1 - reveal, 3));\r
      gl.uniform1f(u.uLight, s.light ? 1 : 0);\r
      gl.uniform3f(u.uFrame, s.frame.flipX, s.frame.flipY, s.frame.side);\r
      gl.uniform1f(u.uAim, s.tilt + aim.value);\r
      gl.uniform3f(u.uFocus, focus.angle, Math.max(0.06, s.spread * 0.25), focus.strength * 1.4);\r
      gl.uniform1f(u.uSway, reduced ? 0 : 1);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      const settling =\r
        Math.abs(target - aim.value) > 1e-4 ||\r
        Math.abs(aim.velocity) > 1e-4 ||\r
        Math.abs(focusTarget - focus.strength) > 1e-3;\r
      const busy = (s.speed > 0 && !reduced) || reveal < 1 || settling;\r
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
    const onPointerMove = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      pointer.x = event.clientX - rect.left;\r
      pointer.y = event.clientY - rect.top;\r
      pointer.inside =\r
        event.clientX >= rect.left &&\r
        event.clientX <= rect.right &&\r
        event.clientY >= rect.top &&\r
        event.clientY <= rect.bottom;\r
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
    <div\r
      ref={containerRef}\r
      className={\`pointer-events-none relative h-full w-full overflow-hidden \${className}\`.trim()}\r
      style={style}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default SideRays;\r
`,a={usage:`import SideRays from './SideRays';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <SideRays
    rayColor1="#FFC46B"
    rayColor2="#96c8ff"
    origin="top-right"
    speed={2.5}
    intensity={2}
    spread={2}
    density={5}
    followMouse={true}
  />
</div>`,code:n,css:r,tailwind:e,tsCode:t,tsTailwind:o};export{a as sideRays};
