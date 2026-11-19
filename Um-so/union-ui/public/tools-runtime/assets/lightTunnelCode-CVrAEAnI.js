const n=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
import './LightTunnel.css';\r
\r
const INTRO_SECONDS = 1.8;\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform vec2 uResolution;\r
uniform vec2 uCenter;\r
uniform float uScale;\r
uniform float uRatio;\r
uniform float uTime;\r
uniform float uDrift;\r
uniform vec2 uSteer;\r
uniform float uBend;\r
uniform float uCount;\r
uniform float uSwing;\r
uniform float uWave;\r
uniform float uWidth;\r
uniform float uPulseWidth;\r
uniform float uHead;\r
uniform float uTail;\r
uniform float uChance;\r
uniform float uSpacing;\r
uniform float uPulseSpeed;\r
uniform float uFlow;\r
uniform float uHalo;\r
uniform float uGlow;\r
uniform float uBrightness;\r
uniform float uVariance;\r
uniform float uBody;\r
uniform float uFadeNear;\r
uniform float uFadeFar;\r
uniform vec3 uCable;\r
uniform vec3 uPulse;\r
uniform vec3 uTunnel;\r
uniform vec3 uSurge;\r
uniform float uReveal;\r
uniform float uGrain;\r
uniform float uSeed;\r
uniform float uLight;\r
uniform float uOpacity;\r
out vec4 outColor;\r
\r
const float TAU = 6.2831853;\r
\r
vec3 inkOf(vec3 color, float depthOfInk) {\r
  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));\r
  float peak = max(color.r, max(color.g, color.b));\r
  float chroma = (peak - min(color.r, min(color.g, color.b))) / max(peak, 0.001);\r
  return color * min(1.0, mix(depthOfInk, depthOfInk * 1.7, chroma) / max(luma, 0.001));\r
}\r
\r
float hash(float n) {\r
  return fract(sin(n * 127.1 + uSeed * 311.7) * 43758.5453);\r
}\r
\r
vec2 bendAt(float depth) {\r
  float reach = 1.0 - exp(-max(depth, 0.0) * 0.55);\r
  vec2 wobble = vec2(sin(uDrift * 0.37 + depth * 0.31), cos(uDrift * 0.29 + depth * 0.23)) * uBend;\r
  return (wobble + uSteer) * reach;\r
}\r
\r
void main() {\r
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution - uCenter) / uScale;\r
  float depth = -log(max(length(p), 1e-5));\r
  vec2 q = p;\r
  for (int i = 0; i < 4; i++) {\r
    q = p - bendAt(depth);\r
    depth = -log(max(length(q), 1e-5));\r
  }\r
  float r = length(q);\r
  float px = r * uScale;\r
  float turn = atan(q.y, q.x) / TAU;\r
  float s = turn - uSwing - uWave * sin(depth * 1.2 + uDrift * 0.5);\r
  float cell = floor(s * uCount);\r
  float spacing = TAU * px / uCount;\r
  float near = smoothstep(0.55, 1.25, r);\r
  float width = uWidth * (1.0 + near * 1.2);\r
  float soft = uRatio * (0.55 + near * 0.9);\r
  float tight = uRatio * uHalo * (1.0 + near);\r
  float wide = tight * 4.5;\r
\r
  float lines = 0.0;\r
  float body = 0.0;\r
  vec3 glow = vec3(0.0);\r
  float strokes = 0.0;\r
  for (int k = -3; k <= 3; k++) {\r
    float i = cell + float(k);\r
    float id = mod(i, uCount);\r
    float h1 = hash(id);\r
    float h2 = hash(id + 17.0);\r
    float h3 = hash(id + 41.0);\r
    float h4 = hash(id + 73.0);\r
    float center = (i + 0.5 + (h1 - 0.5) * 0.55) / uCount;\r
    center += 0.12 * sin(depth * (0.8 + h2 * 0.9) + uDrift * (0.4 + h3 * 0.5) + h4 * TAU) / uCount;\r
    float d = abs(s - center) * TAU * px;\r
    float shade = 1.0 + uVariance * (h3 - 0.5) * 0.9;\r
    float reach = smoothstep(spacing * 2.4, spacing * 1.4, d);\r
\r
    lines += smoothstep(width + soft, width - soft, d) * shade;\r
    body += exp(-d / max(spacing * 0.22, 0.001)) * shade * reach;\r
\r
    float x = depth * uSpacing + uTime * uPulseSpeed * (0.55 + h2 * 0.6) * uFlow + h4 * 7.0;\r
    float lead = (fract(x) - 0.5) / uSpacing * uFlow;\r
    float lit = step(hash(id * 3.7 + floor(x) * 13.1), uChance);\r
    float limit = 0.5 / uSpacing;\r
    float head = exp(-pow(max(-lead, 0.0) / uHead, 2.0)) * smoothstep(-limit, -limit * 0.8, lead);\r
    float tail = exp(-max(lead, 0.0) / uTail) * smoothstep(limit, limit * 0.55, lead);\r
    float pulse = (lead < 0.0 ? head : tail) * lit;\r
    float ring = uSurge.y * exp(-pow((depth - uSurge.x) / uSurge.z, 2.0));\r
    pulse = max(pulse, ring);\r
    float hot = pulse * (lead < 0.0 ? 1.0 : exp(-max(lead, 0.0) / (uTail * 0.35)));\r
\r
    float core = uPulseWidth * width + 0.35 * uRatio;\r
    float stroke = smoothstep(core + soft, core - soft, d);\r
    float bloom = (exp(-d / tight) * 0.7 + exp(-d / wide) * 0.18) * uGlow * reach;\r
    vec3 tint = mix(uPulse, vec3(1.0), hot * 0.55 * (1.0 - uLight));\r
    glow += tint * pulse * (stroke * 1.5 + bloom) * shade;\r
    strokes += pulse * stroke * shade;\r
  }\r
\r
  float lod = smoothstep(4.0, 1.2, spacing);\r
  float average = min(2.0 * uWidth / max(spacing, 0.001), 1.0);\r
  lines = mix(lines, average, lod);\r
  glow = mix(glow, uPulse * average * 0.6 * uChance, lod);\r
  strokes = mix(strokes, average * 0.6 * uChance, lod);\r
  body = mix(body, 1.0, lod) * uBody;\r
\r
  float rr = r * 0.25;\r
  float fade = smoothstep(0.0, uFadeNear, rr) * smoothstep(uFadeFar, uFadeFar * 0.55, rr);\r
  fade *= smoothstep(uReveal - 0.6, uReveal, depth);\r
\r
  float grain = 1.0;\r
  if (uGrain > 0.0) {\r
    grain += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + uTime * 7.0) * 43758.5453) - 0.5) * uGrain * 4.0;\r
  }\r
\r
  if (uLight > 0.5) {\r
    float hairline = clamp(lines * 0.26 + body * 0.2, 0.0, 1.0);\r
    float stroke = clamp(strokes * 1.6, 0.0, 1.0);\r
    float haze = clamp(length(glow) * 0.12, 0.0, 0.25);\r
    float ink = clamp(hairline + stroke + haze, 0.0, 1.0) * fade * uOpacity * grain;\r
    vec3 tone = mix(inkOf(uCable, 0.3), inkOf(uPulse, 0.16), clamp(stroke + haze * 2.0, 0.0, 1.0));\r
    tone = mix(tone, inkOf(uTunnel, 0.3), clamp(body * uBody, 0.0, 1.0) * 0.5);\r
    outColor = vec4(tone * ink, ink);\r
    return;\r
  }\r
\r
  vec3 light = (uCable * lines * 0.12 + uTunnel * body * 0.35 + glow) * uBrightness * fade * grain;\r
  vec3 mapped = (1.0 - exp(-light * 1.4)) * uOpacity;\r
  outColor = vec4(mapped, max(mapped.r, max(mapped.g, mapped.b)));\r
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
    if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const LightTunnel = ({\r
  cableColor = '#ffffff',\r
  pulseColor = '#ffffff',\r
  tunnelColor = '#ffffff',\r
  tunnelOpacity = 0,\r
  speed = 0.1,\r
  flowDirection = 'inward',\r
  pulseSpeed = 2,\r
  pulseLength = 0.28,\r
  pulseBlend = 0.6,\r
  pulseWidth = 1,\r
  pulseDensity = 0.5,\r
  cableCount = 56,\r
  thickness = 0.35,\r
  rimWidth = 0.15,\r
  waviness = 0.3,\r
  sway = 0.5,\r
  bend = 0.4,\r
  size = 1,\r
  centerX = 0,\r
  centerY = 0,\r
  glow = 1,\r
  fadeNear = 0.5,\r
  fadeFar = 2,\r
  brightness = 1,\r
  colorVariance = true,\r
  grain = false,\r
  grainIntensity = 0.05,\r
  opacity = 1,\r
  mouseInteraction = true,\r
  mouseStrength = 0.1,\r
  clickSurge = true,\r
  intro = true,\r
  variation = 0,\r
  lightMode = false,\r
  dpr,\r
  className = '',\r
  style,\r
  ...rest\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settings = {\r
    cableColor,\r
    pulseColor,\r
    tunnelColor,\r
    tunnelOpacity: clamp(tunnelOpacity, 0, 1),\r
    speed: Math.max(0, speed),\r
    flow: flowDirection === 'outward' ? 1 : -1,\r
    pulseSpeed: Math.max(0, pulseSpeed),\r
    pulseLength: clamp(pulseLength, 0.02, 1),\r
    pulseBlend: clamp(pulseBlend, 0, 1),\r
    pulseWidth: clamp(pulseWidth, 0.1, 3),\r
    pulseDensity: clamp(pulseDensity, 0, 1),\r
    cableCount: clamp(Math.round(cableCount), 4, 200),\r
    thickness: clamp(thickness, 0.05, 2),\r
    rimWidth: clamp(rimWidth, 0, 1),\r
    waviness: Math.max(0, waviness),\r
    sway: Math.max(0, sway),\r
    bend: Math.max(0, bend),\r
    size: Math.max(0.05, size),\r
    centerX,\r
    centerY,\r
    glow: Math.max(0, glow),\r
    fadeNear: Math.max(0.001, fadeNear),\r
    fadeFar: Math.max(0.01, fadeFar),\r
    brightness: Math.max(0, brightness),\r
    colorVariance,\r
    grain,\r
    grainIntensity: Math.max(0, grainIntensity),\r
    opacity: clamp(opacity, 0, 1),\r
    mouseInteraction,\r
    mouseStrength: Math.max(0, mouseStrength),\r
    clickSurge,\r
    intro,\r
    variation,\r
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
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const steer = { x: 0, y: 0 };\r
    const surge = { age: 10 };\r
    let time = 0;\r
    let drift = 0;\r
    let reveal = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const width = canvas.width;\r
      const height = canvas.height;\r
      const ratio = width / Math.max(1, container.clientWidth);\r
      const minSide = Math.min(width, height);\r
      const flow = s.flow;\r
      const span = 3.4;\r
      const travel = surge.age * 2.6;\r
      const surgeDepth = flow > 0 ? span - travel : -0.6 + travel;\r
      const surgeLevel = surge.age < 2.4 ? Math.min(1, surge.age / 0.12) * Math.exp(-surge.age * 1.1) : 0;\r
      const eased = reveal * reveal * (3 - 2 * reveal);\r
      gl.viewport(0, 0, width, height);\r
      gl.useProgram(program.program);\r
      gl.bindVertexArray(vao);\r
      gl.uniform2f(u.uResolution, width, height);\r
      gl.uniform2f(u.uCenter, s.centerX * minSide, s.centerY * minSide);\r
      gl.uniform1f(u.uScale, minSide * 0.5 * s.size);\r
      gl.uniform1f(u.uRatio, ratio);\r
      gl.uniform1f(u.uTime, time);\r
      gl.uniform1f(u.uDrift, drift);\r
      gl.uniform2f(u.uSteer, steer.x, steer.y);\r
      gl.uniform1f(u.uBend, s.bend * 0.45);\r
      gl.uniform1f(u.uCount, s.cableCount);\r
      gl.uniform1f(u.uSwing, (Math.sin(drift * 0.9) * s.sway * 0.5) / (Math.PI * 2));\r
      gl.uniform1f(u.uWave, s.waviness * 0.15);\r
      gl.uniform1f(u.uWidth, (0.25 + s.thickness * 1.5) * ratio);\r
      gl.uniform1f(u.uPulseWidth, 0.6 + s.pulseWidth * 0.9);\r
      const length = s.pulseLength * 1.2;\r
      gl.uniform1f(u.uHead, length * (0.08 + s.pulseBlend * 0.22));\r
      gl.uniform1f(u.uTail, length * (0.5 + s.pulseBlend * 0.7));\r
      gl.uniform1f(u.uChance, s.pulseDensity);\r
      gl.uniform1f(u.uSpacing, 0.4);\r
      gl.uniform1f(u.uPulseSpeed, s.pulseSpeed * 4);\r
      gl.uniform1f(u.uFlow, flow);\r
      gl.uniform1f(u.uHalo, 1.2 + s.rimWidth * 8);\r
      gl.uniform1f(u.uGlow, s.glow);\r
      gl.uniform1f(u.uBrightness, s.brightness);\r
      gl.uniform1f(u.uVariance, s.colorVariance ? 1 : 0);\r
      gl.uniform1f(u.uBody, s.tunnelOpacity);\r
      gl.uniform1f(u.uFadeNear, s.fadeNear);\r
      gl.uniform1f(u.uFadeFar, s.fadeFar);\r
      gl.uniform3fv(u.uCable, parse(s.cableColor, [1, 1, 1]));\r
      gl.uniform3fv(u.uPulse, parse(s.pulseColor, [1, 1, 1]));\r
      gl.uniform3fv(u.uTunnel, parse(s.tunnelColor, [1, 1, 1]));\r
      gl.uniform3f(u.uSurge, surgeDepth, surgeLevel, 0.22);\r
      gl.uniform1f(u.uReveal, 1.7 - eased * 3.6);\r
      gl.uniform1f(u.uGrain, s.grain ? s.grainIntensity : 0);\r
      gl.uniform1f(u.uSeed, s.variation);\r
      gl.uniform1f(u.uLight, s.lightMode ? 1 : 0);\r
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
      const motion = reduce ? 0 : 1;\r
      time += dt * s.speed * motion;\r
      drift += dt * (s.speed + 0.2) * motion;\r
      surge.age += dt;\r
      if (s.intro && !reduce && reveal < 1) reveal = Math.min(1, reveal + dt / INTRO_SECONDS);\r
      else if (!s.intro || reduce) reveal = 1;\r
\r
      const engaged = s.mouseInteraction && pointer.inside && !reduce;\r
      const reach = s.mouseStrength * 2.5;\r
      const target = engaged ? [pointer.x * reach, pointer.y * reach] : [0, 0];\r
      const follow = 1 - Math.exp(-dt / 0.6);\r
      steer.x += (target[0] - steer.x) * follow;\r
      steer.y += (target[1] - steer.y) * follow;\r
\r
      render();\r
      const settled = Math.abs(target[0] - steer.x) < 0.0005 && Math.abs(target[1] - steer.y) < 0.0005;\r
      const busy = motion > 0 || !settled || reveal < 1 || surge.age < 2.4;\r
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
      pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      const scale = Math.min(rect.width, rect.height) * 0.5;\r
      pointer.x = (x - rect.width / 2) / Math.max(1, scale);\r
      pointer.y = (rect.height / 2 - y) / Math.max(1, scale);\r
    };\r
\r
    const onPointerMove = event => {\r
      locate(event);\r
      wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      locate(event);\r
      if (!pointer.inside || !settingsRef.current.clickSurge || reduce) return;\r
      surge.age = 0;\r
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
      className={\`light-tunnel-container\${className ? \` \${className}\` : ''}\`}\r
      style={style}\r
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className="light-tunnel-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default LightTunnel;\r
`,r=`.light-tunnel-container {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.light-tunnel-canvas {\r
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
const INTRO_SECONDS = 1.8;\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform vec2 uResolution;\r
uniform vec2 uCenter;\r
uniform float uScale;\r
uniform float uRatio;\r
uniform float uTime;\r
uniform float uDrift;\r
uniform vec2 uSteer;\r
uniform float uBend;\r
uniform float uCount;\r
uniform float uSwing;\r
uniform float uWave;\r
uniform float uWidth;\r
uniform float uPulseWidth;\r
uniform float uHead;\r
uniform float uTail;\r
uniform float uChance;\r
uniform float uSpacing;\r
uniform float uPulseSpeed;\r
uniform float uFlow;\r
uniform float uHalo;\r
uniform float uGlow;\r
uniform float uBrightness;\r
uniform float uVariance;\r
uniform float uBody;\r
uniform float uFadeNear;\r
uniform float uFadeFar;\r
uniform vec3 uCable;\r
uniform vec3 uPulse;\r
uniform vec3 uTunnel;\r
uniform vec3 uSurge;\r
uniform float uReveal;\r
uniform float uGrain;\r
uniform float uSeed;\r
uniform float uLight;\r
uniform float uOpacity;\r
out vec4 outColor;\r
\r
const float TAU = 6.2831853;\r
\r
vec3 inkOf(vec3 color, float depthOfInk) {\r
  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));\r
  float peak = max(color.r, max(color.g, color.b));\r
  float chroma = (peak - min(color.r, min(color.g, color.b))) / max(peak, 0.001);\r
  return color * min(1.0, mix(depthOfInk, depthOfInk * 1.7, chroma) / max(luma, 0.001));\r
}\r
\r
float hash(float n) {\r
  return fract(sin(n * 127.1 + uSeed * 311.7) * 43758.5453);\r
}\r
\r
vec2 bendAt(float depth) {\r
  float reach = 1.0 - exp(-max(depth, 0.0) * 0.55);\r
  vec2 wobble = vec2(sin(uDrift * 0.37 + depth * 0.31), cos(uDrift * 0.29 + depth * 0.23)) * uBend;\r
  return (wobble + uSteer) * reach;\r
}\r
\r
void main() {\r
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution - uCenter) / uScale;\r
  float depth = -log(max(length(p), 1e-5));\r
  vec2 q = p;\r
  for (int i = 0; i < 4; i++) {\r
    q = p - bendAt(depth);\r
    depth = -log(max(length(q), 1e-5));\r
  }\r
  float r = length(q);\r
  float px = r * uScale;\r
  float turn = atan(q.y, q.x) / TAU;\r
  float s = turn - uSwing - uWave * sin(depth * 1.2 + uDrift * 0.5);\r
  float cell = floor(s * uCount);\r
  float spacing = TAU * px / uCount;\r
  float near = smoothstep(0.55, 1.25, r);\r
  float width = uWidth * (1.0 + near * 1.2);\r
  float soft = uRatio * (0.55 + near * 0.9);\r
  float tight = uRatio * uHalo * (1.0 + near);\r
  float wide = tight * 4.5;\r
\r
  float lines = 0.0;\r
  float body = 0.0;\r
  vec3 glow = vec3(0.0);\r
  float strokes = 0.0;\r
  for (int k = -3; k <= 3; k++) {\r
    float i = cell + float(k);\r
    float id = mod(i, uCount);\r
    float h1 = hash(id);\r
    float h2 = hash(id + 17.0);\r
    float h3 = hash(id + 41.0);\r
    float h4 = hash(id + 73.0);\r
    float center = (i + 0.5 + (h1 - 0.5) * 0.55) / uCount;\r
    center += 0.12 * sin(depth * (0.8 + h2 * 0.9) + uDrift * (0.4 + h3 * 0.5) + h4 * TAU) / uCount;\r
    float d = abs(s - center) * TAU * px;\r
    float shade = 1.0 + uVariance * (h3 - 0.5) * 0.9;\r
    float reach = smoothstep(spacing * 2.4, spacing * 1.4, d);\r
\r
    lines += smoothstep(width + soft, width - soft, d) * shade;\r
    body += exp(-d / max(spacing * 0.22, 0.001)) * shade * reach;\r
\r
    float x = depth * uSpacing + uTime * uPulseSpeed * (0.55 + h2 * 0.6) * uFlow + h4 * 7.0;\r
    float lead = (fract(x) - 0.5) / uSpacing * uFlow;\r
    float lit = step(hash(id * 3.7 + floor(x) * 13.1), uChance);\r
    float limit = 0.5 / uSpacing;\r
    float head = exp(-pow(max(-lead, 0.0) / uHead, 2.0)) * smoothstep(-limit, -limit * 0.8, lead);\r
    float tail = exp(-max(lead, 0.0) / uTail) * smoothstep(limit, limit * 0.55, lead);\r
    float pulse = (lead < 0.0 ? head : tail) * lit;\r
    float ring = uSurge.y * exp(-pow((depth - uSurge.x) / uSurge.z, 2.0));\r
    pulse = max(pulse, ring);\r
    float hot = pulse * (lead < 0.0 ? 1.0 : exp(-max(lead, 0.0) / (uTail * 0.35)));\r
\r
    float core = uPulseWidth * width + 0.35 * uRatio;\r
    float stroke = smoothstep(core + soft, core - soft, d);\r
    float bloom = (exp(-d / tight) * 0.7 + exp(-d / wide) * 0.18) * uGlow * reach;\r
    vec3 tint = mix(uPulse, vec3(1.0), hot * 0.55 * (1.0 - uLight));\r
    glow += tint * pulse * (stroke * 1.5 + bloom) * shade;\r
    strokes += pulse * stroke * shade;\r
  }\r
\r
  float lod = smoothstep(4.0, 1.2, spacing);\r
  float average = min(2.0 * uWidth / max(spacing, 0.001), 1.0);\r
  lines = mix(lines, average, lod);\r
  glow = mix(glow, uPulse * average * 0.6 * uChance, lod);\r
  strokes = mix(strokes, average * 0.6 * uChance, lod);\r
  body = mix(body, 1.0, lod) * uBody;\r
\r
  float rr = r * 0.25;\r
  float fade = smoothstep(0.0, uFadeNear, rr) * smoothstep(uFadeFar, uFadeFar * 0.55, rr);\r
  fade *= smoothstep(uReveal - 0.6, uReveal, depth);\r
\r
  float grain = 1.0;\r
  if (uGrain > 0.0) {\r
    grain += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + uTime * 7.0) * 43758.5453) - 0.5) * uGrain * 4.0;\r
  }\r
\r
  if (uLight > 0.5) {\r
    float hairline = clamp(lines * 0.26 + body * 0.2, 0.0, 1.0);\r
    float stroke = clamp(strokes * 1.6, 0.0, 1.0);\r
    float haze = clamp(length(glow) * 0.12, 0.0, 0.25);\r
    float ink = clamp(hairline + stroke + haze, 0.0, 1.0) * fade * uOpacity * grain;\r
    vec3 tone = mix(inkOf(uCable, 0.3), inkOf(uPulse, 0.16), clamp(stroke + haze * 2.0, 0.0, 1.0));\r
    tone = mix(tone, inkOf(uTunnel, 0.3), clamp(body * uBody, 0.0, 1.0) * 0.5);\r
    outColor = vec4(tone * ink, ink);\r
    return;\r
  }\r
\r
  vec3 light = (uCable * lines * 0.12 + uTunnel * body * 0.35 + glow) * uBrightness * fade * grain;\r
  vec3 mapped = (1.0 - exp(-light * 1.4)) * uOpacity;\r
  outColor = vec4(mapped, max(mapped.r, max(mapped.g, mapped.b)));\r
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
    if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const LightTunnel = ({\r
  cableColor = '#ffffff',\r
  pulseColor = '#ffffff',\r
  tunnelColor = '#ffffff',\r
  tunnelOpacity = 0,\r
  speed = 0.1,\r
  flowDirection = 'inward',\r
  pulseSpeed = 2,\r
  pulseLength = 0.28,\r
  pulseBlend = 0.6,\r
  pulseWidth = 1,\r
  pulseDensity = 0.5,\r
  cableCount = 56,\r
  thickness = 0.35,\r
  rimWidth = 0.15,\r
  waviness = 0.3,\r
  sway = 0.5,\r
  bend = 0.4,\r
  size = 1,\r
  centerX = 0,\r
  centerY = 0,\r
  glow = 1,\r
  fadeNear = 0.5,\r
  fadeFar = 2,\r
  brightness = 1,\r
  colorVariance = true,\r
  grain = false,\r
  grainIntensity = 0.05,\r
  opacity = 1,\r
  mouseInteraction = true,\r
  mouseStrength = 0.1,\r
  clickSurge = true,\r
  intro = true,\r
  variation = 0,\r
  lightMode = false,\r
  dpr,\r
  className = '',\r
  style,\r
  ...rest\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settings = {\r
    cableColor,\r
    pulseColor,\r
    tunnelColor,\r
    tunnelOpacity: clamp(tunnelOpacity, 0, 1),\r
    speed: Math.max(0, speed),\r
    flow: flowDirection === 'outward' ? 1 : -1,\r
    pulseSpeed: Math.max(0, pulseSpeed),\r
    pulseLength: clamp(pulseLength, 0.02, 1),\r
    pulseBlend: clamp(pulseBlend, 0, 1),\r
    pulseWidth: clamp(pulseWidth, 0.1, 3),\r
    pulseDensity: clamp(pulseDensity, 0, 1),\r
    cableCount: clamp(Math.round(cableCount), 4, 200),\r
    thickness: clamp(thickness, 0.05, 2),\r
    rimWidth: clamp(rimWidth, 0, 1),\r
    waviness: Math.max(0, waviness),\r
    sway: Math.max(0, sway),\r
    bend: Math.max(0, bend),\r
    size: Math.max(0.05, size),\r
    centerX,\r
    centerY,\r
    glow: Math.max(0, glow),\r
    fadeNear: Math.max(0.001, fadeNear),\r
    fadeFar: Math.max(0.01, fadeFar),\r
    brightness: Math.max(0, brightness),\r
    colorVariance,\r
    grain,\r
    grainIntensity: Math.max(0, grainIntensity),\r
    opacity: clamp(opacity, 0, 1),\r
    mouseInteraction,\r
    mouseStrength: Math.max(0, mouseStrength),\r
    clickSurge,\r
    intro,\r
    variation,\r
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
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const steer = { x: 0, y: 0 };\r
    const surge = { age: 10 };\r
    let time = 0;\r
    let drift = 0;\r
    let reveal = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const width = canvas.width;\r
      const height = canvas.height;\r
      const ratio = width / Math.max(1, container.clientWidth);\r
      const minSide = Math.min(width, height);\r
      const flow = s.flow;\r
      const span = 3.4;\r
      const travel = surge.age * 2.6;\r
      const surgeDepth = flow > 0 ? span - travel : -0.6 + travel;\r
      const surgeLevel = surge.age < 2.4 ? Math.min(1, surge.age / 0.12) * Math.exp(-surge.age * 1.1) : 0;\r
      const eased = reveal * reveal * (3 - 2 * reveal);\r
      gl.viewport(0, 0, width, height);\r
      gl.useProgram(program.program);\r
      gl.bindVertexArray(vao);\r
      gl.uniform2f(u.uResolution, width, height);\r
      gl.uniform2f(u.uCenter, s.centerX * minSide, s.centerY * minSide);\r
      gl.uniform1f(u.uScale, minSide * 0.5 * s.size);\r
      gl.uniform1f(u.uRatio, ratio);\r
      gl.uniform1f(u.uTime, time);\r
      gl.uniform1f(u.uDrift, drift);\r
      gl.uniform2f(u.uSteer, steer.x, steer.y);\r
      gl.uniform1f(u.uBend, s.bend * 0.45);\r
      gl.uniform1f(u.uCount, s.cableCount);\r
      gl.uniform1f(u.uSwing, (Math.sin(drift * 0.9) * s.sway * 0.5) / (Math.PI * 2));\r
      gl.uniform1f(u.uWave, s.waviness * 0.15);\r
      gl.uniform1f(u.uWidth, (0.25 + s.thickness * 1.5) * ratio);\r
      gl.uniform1f(u.uPulseWidth, 0.6 + s.pulseWidth * 0.9);\r
      const length = s.pulseLength * 1.2;\r
      gl.uniform1f(u.uHead, length * (0.08 + s.pulseBlend * 0.22));\r
      gl.uniform1f(u.uTail, length * (0.5 + s.pulseBlend * 0.7));\r
      gl.uniform1f(u.uChance, s.pulseDensity);\r
      gl.uniform1f(u.uSpacing, 0.4);\r
      gl.uniform1f(u.uPulseSpeed, s.pulseSpeed * 4);\r
      gl.uniform1f(u.uFlow, flow);\r
      gl.uniform1f(u.uHalo, 1.2 + s.rimWidth * 8);\r
      gl.uniform1f(u.uGlow, s.glow);\r
      gl.uniform1f(u.uBrightness, s.brightness);\r
      gl.uniform1f(u.uVariance, s.colorVariance ? 1 : 0);\r
      gl.uniform1f(u.uBody, s.tunnelOpacity);\r
      gl.uniform1f(u.uFadeNear, s.fadeNear);\r
      gl.uniform1f(u.uFadeFar, s.fadeFar);\r
      gl.uniform3fv(u.uCable, parse(s.cableColor, [1, 1, 1]));\r
      gl.uniform3fv(u.uPulse, parse(s.pulseColor, [1, 1, 1]));\r
      gl.uniform3fv(u.uTunnel, parse(s.tunnelColor, [1, 1, 1]));\r
      gl.uniform3f(u.uSurge, surgeDepth, surgeLevel, 0.22);\r
      gl.uniform1f(u.uReveal, 1.7 - eased * 3.6);\r
      gl.uniform1f(u.uGrain, s.grain ? s.grainIntensity : 0);\r
      gl.uniform1f(u.uSeed, s.variation);\r
      gl.uniform1f(u.uLight, s.lightMode ? 1 : 0);\r
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
      const motion = reduce ? 0 : 1;\r
      time += dt * s.speed * motion;\r
      drift += dt * (s.speed + 0.2) * motion;\r
      surge.age += dt;\r
      if (s.intro && !reduce && reveal < 1) reveal = Math.min(1, reveal + dt / INTRO_SECONDS);\r
      else if (!s.intro || reduce) reveal = 1;\r
\r
      const engaged = s.mouseInteraction && pointer.inside && !reduce;\r
      const reach = s.mouseStrength * 2.5;\r
      const target = engaged ? [pointer.x * reach, pointer.y * reach] : [0, 0];\r
      const follow = 1 - Math.exp(-dt / 0.6);\r
      steer.x += (target[0] - steer.x) * follow;\r
      steer.y += (target[1] - steer.y) * follow;\r
\r
      render();\r
      const settled = Math.abs(target[0] - steer.x) < 0.0005 && Math.abs(target[1] - steer.y) < 0.0005;\r
      const busy = motion > 0 || !settled || reveal < 1 || surge.age < 2.4;\r
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
      pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      const scale = Math.min(rect.width, rect.height) * 0.5;\r
      pointer.x = (x - rect.width / 2) / Math.max(1, scale);\r
      pointer.y = (rect.height / 2 - y) / Math.max(1, scale);\r
    };\r
\r
    const onPointerMove = event => {\r
      locate(event);\r
      wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      locate(event);\r
      if (!pointer.inside || !settingsRef.current.clickSurge || reduce) return;\r
      surge.age = 0;\r
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
      style={style}\r
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default LightTunnel;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, type HTMLAttributes } from 'react';\r
import './LightTunnel.css';\r
\r
export type FlowDirection = 'inward' | 'outward';\r
\r
export interface LightTunnelProps extends HTMLAttributes<HTMLDivElement> {\r
  cableColor?: string;\r
  pulseColor?: string;\r
  tunnelColor?: string;\r
  tunnelOpacity?: number;\r
  speed?: number;\r
  flowDirection?: FlowDirection;\r
  pulseSpeed?: number;\r
  pulseLength?: number;\r
  pulseBlend?: number;\r
  pulseWidth?: number;\r
  pulseDensity?: number;\r
  cableCount?: number;\r
  thickness?: number;\r
  rimWidth?: number;\r
  waviness?: number;\r
  sway?: number;\r
  bend?: number;\r
  size?: number;\r
  centerX?: number;\r
  centerY?: number;\r
  glow?: number;\r
  fadeNear?: number;\r
  fadeFar?: number;\r
  brightness?: number;\r
  colorVariance?: boolean;\r
  grain?: boolean;\r
  grainIntensity?: number;\r
  opacity?: number;\r
  mouseInteraction?: boolean;\r
  mouseStrength?: number;\r
  clickSurge?: boolean;\r
  intro?: boolean;\r
  variation?: number;\r
  lightMode?: boolean;\r
  dpr?: number;\r
}\r
\r
type Settings = {\r
  cableColor: string;\r
  pulseColor: string;\r
  tunnelColor: string;\r
  tunnelOpacity: number;\r
  speed: number;\r
  flow: number;\r
  pulseSpeed: number;\r
  pulseLength: number;\r
  pulseBlend: number;\r
  pulseWidth: number;\r
  pulseDensity: number;\r
  cableCount: number;\r
  thickness: number;\r
  rimWidth: number;\r
  waviness: number;\r
  sway: number;\r
  bend: number;\r
  size: number;\r
  centerX: number;\r
  centerY: number;\r
  glow: number;\r
  fadeNear: number;\r
  fadeFar: number;\r
  brightness: number;\r
  colorVariance: boolean;\r
  grain: boolean;\r
  grainIntensity: number;\r
  opacity: number;\r
  mouseInteraction: boolean;\r
  mouseStrength: number;\r
  clickSurge: boolean;\r
  intro: boolean;\r
  variation: number;\r
  lightMode: boolean;\r
  dpr?: number;\r
};\r
\r
type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };\r
\r
const INTRO_SECONDS = 1.8;\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform vec2 uResolution;\r
uniform vec2 uCenter;\r
uniform float uScale;\r
uniform float uRatio;\r
uniform float uTime;\r
uniform float uDrift;\r
uniform vec2 uSteer;\r
uniform float uBend;\r
uniform float uCount;\r
uniform float uSwing;\r
uniform float uWave;\r
uniform float uWidth;\r
uniform float uPulseWidth;\r
uniform float uHead;\r
uniform float uTail;\r
uniform float uChance;\r
uniform float uSpacing;\r
uniform float uPulseSpeed;\r
uniform float uFlow;\r
uniform float uHalo;\r
uniform float uGlow;\r
uniform float uBrightness;\r
uniform float uVariance;\r
uniform float uBody;\r
uniform float uFadeNear;\r
uniform float uFadeFar;\r
uniform vec3 uCable;\r
uniform vec3 uPulse;\r
uniform vec3 uTunnel;\r
uniform vec3 uSurge;\r
uniform float uReveal;\r
uniform float uGrain;\r
uniform float uSeed;\r
uniform float uLight;\r
uniform float uOpacity;\r
out vec4 outColor;\r
\r
const float TAU = 6.2831853;\r
\r
vec3 inkOf(vec3 color, float depthOfInk) {\r
  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));\r
  float peak = max(color.r, max(color.g, color.b));\r
  float chroma = (peak - min(color.r, min(color.g, color.b))) / max(peak, 0.001);\r
  return color * min(1.0, mix(depthOfInk, depthOfInk * 1.7, chroma) / max(luma, 0.001));\r
}\r
\r
float hash(float n) {\r
  return fract(sin(n * 127.1 + uSeed * 311.7) * 43758.5453);\r
}\r
\r
vec2 bendAt(float depth) {\r
  float reach = 1.0 - exp(-max(depth, 0.0) * 0.55);\r
  vec2 wobble = vec2(sin(uDrift * 0.37 + depth * 0.31), cos(uDrift * 0.29 + depth * 0.23)) * uBend;\r
  return (wobble + uSteer) * reach;\r
}\r
\r
void main() {\r
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution - uCenter) / uScale;\r
  float depth = -log(max(length(p), 1e-5));\r
  vec2 q = p;\r
  for (int i = 0; i < 4; i++) {\r
    q = p - bendAt(depth);\r
    depth = -log(max(length(q), 1e-5));\r
  }\r
  float r = length(q);\r
  float px = r * uScale;\r
  float turn = atan(q.y, q.x) / TAU;\r
  float s = turn - uSwing - uWave * sin(depth * 1.2 + uDrift * 0.5);\r
  float cell = floor(s * uCount);\r
  float spacing = TAU * px / uCount;\r
  float near = smoothstep(0.55, 1.25, r);\r
  float width = uWidth * (1.0 + near * 1.2);\r
  float soft = uRatio * (0.55 + near * 0.9);\r
  float tight = uRatio * uHalo * (1.0 + near);\r
  float wide = tight * 4.5;\r
\r
  float lines = 0.0;\r
  float body = 0.0;\r
  vec3 glow = vec3(0.0);\r
  float strokes = 0.0;\r
  for (int k = -3; k <= 3; k++) {\r
    float i = cell + float(k);\r
    float id = mod(i, uCount);\r
    float h1 = hash(id);\r
    float h2 = hash(id + 17.0);\r
    float h3 = hash(id + 41.0);\r
    float h4 = hash(id + 73.0);\r
    float center = (i + 0.5 + (h1 - 0.5) * 0.55) / uCount;\r
    center += 0.12 * sin(depth * (0.8 + h2 * 0.9) + uDrift * (0.4 + h3 * 0.5) + h4 * TAU) / uCount;\r
    float d = abs(s - center) * TAU * px;\r
    float shade = 1.0 + uVariance * (h3 - 0.5) * 0.9;\r
    float reach = smoothstep(spacing * 2.4, spacing * 1.4, d);\r
\r
    lines += smoothstep(width + soft, width - soft, d) * shade;\r
    body += exp(-d / max(spacing * 0.22, 0.001)) * shade * reach;\r
\r
    float x = depth * uSpacing + uTime * uPulseSpeed * (0.55 + h2 * 0.6) * uFlow + h4 * 7.0;\r
    float lead = (fract(x) - 0.5) / uSpacing * uFlow;\r
    float lit = step(hash(id * 3.7 + floor(x) * 13.1), uChance);\r
    float limit = 0.5 / uSpacing;\r
    float head = exp(-pow(max(-lead, 0.0) / uHead, 2.0)) * smoothstep(-limit, -limit * 0.8, lead);\r
    float tail = exp(-max(lead, 0.0) / uTail) * smoothstep(limit, limit * 0.55, lead);\r
    float pulse = (lead < 0.0 ? head : tail) * lit;\r
    float ring = uSurge.y * exp(-pow((depth - uSurge.x) / uSurge.z, 2.0));\r
    pulse = max(pulse, ring);\r
    float hot = pulse * (lead < 0.0 ? 1.0 : exp(-max(lead, 0.0) / (uTail * 0.35)));\r
\r
    float core = uPulseWidth * width + 0.35 * uRatio;\r
    float stroke = smoothstep(core + soft, core - soft, d);\r
    float bloom = (exp(-d / tight) * 0.7 + exp(-d / wide) * 0.18) * uGlow * reach;\r
    vec3 tint = mix(uPulse, vec3(1.0), hot * 0.55 * (1.0 - uLight));\r
    glow += tint * pulse * (stroke * 1.5 + bloom) * shade;\r
    strokes += pulse * stroke * shade;\r
  }\r
\r
  float lod = smoothstep(4.0, 1.2, spacing);\r
  float average = min(2.0 * uWidth / max(spacing, 0.001), 1.0);\r
  lines = mix(lines, average, lod);\r
  glow = mix(glow, uPulse * average * 0.6 * uChance, lod);\r
  strokes = mix(strokes, average * 0.6 * uChance, lod);\r
  body = mix(body, 1.0, lod) * uBody;\r
\r
  float rr = r * 0.25;\r
  float fade = smoothstep(0.0, uFadeNear, rr) * smoothstep(uFadeFar, uFadeFar * 0.55, rr);\r
  fade *= smoothstep(uReveal - 0.6, uReveal, depth);\r
\r
  float grain = 1.0;\r
  if (uGrain > 0.0) {\r
    grain += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + uTime * 7.0) * 43758.5453) - 0.5) * uGrain * 4.0;\r
  }\r
\r
  if (uLight > 0.5) {\r
    float hairline = clamp(lines * 0.26 + body * 0.2, 0.0, 1.0);\r
    float stroke = clamp(strokes * 1.6, 0.0, 1.0);\r
    float haze = clamp(length(glow) * 0.12, 0.0, 0.25);\r
    float ink = clamp(hairline + stroke + haze, 0.0, 1.0) * fade * uOpacity * grain;\r
    vec3 tone = mix(inkOf(uCable, 0.3), inkOf(uPulse, 0.16), clamp(stroke + haze * 2.0, 0.0, 1.0));\r
    tone = mix(tone, inkOf(uTunnel, 0.3), clamp(body * uBody, 0.0, 1.0) * 0.5);\r
    outColor = vec4(tone * ink, ink);\r
    return;\r
  }\r
\r
  vec3 light = (uCable * lines * 0.12 + uTunnel * body * 0.35 + glow) * uBrightness * fade * grain;\r
  vec3 mapped = (1.0 - exp(-light * 1.4)) * uOpacity;\r
  outColor = vec4(mapped, max(mapped.r, max(mapped.g, mapped.b)));\r
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
    if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const LightTunnel = ({\r
  cableColor = '#ffffff',\r
  pulseColor = '#ffffff',\r
  tunnelColor = '#ffffff',\r
  tunnelOpacity = 0,\r
  speed = 0.1,\r
  flowDirection = 'inward',\r
  pulseSpeed = 2,\r
  pulseLength = 0.28,\r
  pulseBlend = 0.6,\r
  pulseWidth = 1,\r
  pulseDensity = 0.5,\r
  cableCount = 56,\r
  thickness = 0.35,\r
  rimWidth = 0.15,\r
  waviness = 0.3,\r
  sway = 0.5,\r
  bend = 0.4,\r
  size = 1,\r
  centerX = 0,\r
  centerY = 0,\r
  glow = 1,\r
  fadeNear = 0.5,\r
  fadeFar = 2,\r
  brightness = 1,\r
  colorVariance = true,\r
  grain = false,\r
  grainIntensity = 0.05,\r
  opacity = 1,\r
  mouseInteraction = true,\r
  mouseStrength = 0.1,\r
  clickSurge = true,\r
  intro = true,\r
  variation = 0,\r
  lightMode = false,\r
  dpr,\r
  className = '',\r
  style,\r
  ...rest\r
}: LightTunnelProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings: Settings = {\r
    cableColor,\r
    pulseColor,\r
    tunnelColor,\r
    tunnelOpacity: clamp(tunnelOpacity, 0, 1),\r
    speed: Math.max(0, speed),\r
    flow: flowDirection === 'outward' ? 1 : -1,\r
    pulseSpeed: Math.max(0, pulseSpeed),\r
    pulseLength: clamp(pulseLength, 0.02, 1),\r
    pulseBlend: clamp(pulseBlend, 0, 1),\r
    pulseWidth: clamp(pulseWidth, 0.1, 3),\r
    pulseDensity: clamp(pulseDensity, 0, 1),\r
    cableCount: clamp(Math.round(cableCount), 4, 200),\r
    thickness: clamp(thickness, 0.05, 2),\r
    rimWidth: clamp(rimWidth, 0, 1),\r
    waviness: Math.max(0, waviness),\r
    sway: Math.max(0, sway),\r
    bend: Math.max(0, bend),\r
    size: Math.max(0.05, size),\r
    centerX,\r
    centerY,\r
    glow: Math.max(0, glow),\r
    fadeNear: Math.max(0.001, fadeNear),\r
    fadeFar: Math.max(0.01, fadeFar),\r
    brightness: Math.max(0, brightness),\r
    colorVariance,\r
    grain,\r
    grainIntensity: Math.max(0, grainIntensity),\r
    opacity: clamp(opacity, 0, 1),\r
    mouseInteraction,\r
    mouseStrength: Math.max(0, mouseStrength),\r
    clickSurge,\r
    intro,\r
    variation,\r
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
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const steer = { x: 0, y: 0 };\r
    const surge = { age: 10 };\r
    let time = 0;\r
    let drift = 0;\r
    let reveal = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const width = canvas.width;\r
      const height = canvas.height;\r
      const ratio = width / Math.max(1, container.clientWidth);\r
      const minSide = Math.min(width, height);\r
      const flow = s.flow;\r
      const span = 3.4;\r
      const travel = surge.age * 2.6;\r
      const surgeDepth = flow > 0 ? span - travel : -0.6 + travel;\r
      const surgeLevel = surge.age < 2.4 ? Math.min(1, surge.age / 0.12) * Math.exp(-surge.age * 1.1) : 0;\r
      const eased = reveal * reveal * (3 - 2 * reveal);\r
      gl.viewport(0, 0, width, height);\r
      gl.useProgram(program.program);\r
      gl.bindVertexArray(vao);\r
      gl.uniform2f(u.uResolution, width, height);\r
      gl.uniform2f(u.uCenter, s.centerX * minSide, s.centerY * minSide);\r
      gl.uniform1f(u.uScale, minSide * 0.5 * s.size);\r
      gl.uniform1f(u.uRatio, ratio);\r
      gl.uniform1f(u.uTime, time);\r
      gl.uniform1f(u.uDrift, drift);\r
      gl.uniform2f(u.uSteer, steer.x, steer.y);\r
      gl.uniform1f(u.uBend, s.bend * 0.45);\r
      gl.uniform1f(u.uCount, s.cableCount);\r
      gl.uniform1f(u.uSwing, (Math.sin(drift * 0.9) * s.sway * 0.5) / (Math.PI * 2));\r
      gl.uniform1f(u.uWave, s.waviness * 0.15);\r
      gl.uniform1f(u.uWidth, (0.25 + s.thickness * 1.5) * ratio);\r
      gl.uniform1f(u.uPulseWidth, 0.6 + s.pulseWidth * 0.9);\r
      const length = s.pulseLength * 1.2;\r
      gl.uniform1f(u.uHead, length * (0.08 + s.pulseBlend * 0.22));\r
      gl.uniform1f(u.uTail, length * (0.5 + s.pulseBlend * 0.7));\r
      gl.uniform1f(u.uChance, s.pulseDensity);\r
      gl.uniform1f(u.uSpacing, 0.4);\r
      gl.uniform1f(u.uPulseSpeed, s.pulseSpeed * 4);\r
      gl.uniform1f(u.uFlow, flow);\r
      gl.uniform1f(u.uHalo, 1.2 + s.rimWidth * 8);\r
      gl.uniform1f(u.uGlow, s.glow);\r
      gl.uniform1f(u.uBrightness, s.brightness);\r
      gl.uniform1f(u.uVariance, s.colorVariance ? 1 : 0);\r
      gl.uniform1f(u.uBody, s.tunnelOpacity);\r
      gl.uniform1f(u.uFadeNear, s.fadeNear);\r
      gl.uniform1f(u.uFadeFar, s.fadeFar);\r
      gl.uniform3fv(u.uCable, parse(s.cableColor, [1, 1, 1]));\r
      gl.uniform3fv(u.uPulse, parse(s.pulseColor, [1, 1, 1]));\r
      gl.uniform3fv(u.uTunnel, parse(s.tunnelColor, [1, 1, 1]));\r
      gl.uniform3f(u.uSurge, surgeDepth, surgeLevel, 0.22);\r
      gl.uniform1f(u.uReveal, 1.7 - eased * 3.6);\r
      gl.uniform1f(u.uGrain, s.grain ? s.grainIntensity : 0);\r
      gl.uniform1f(u.uSeed, s.variation);\r
      gl.uniform1f(u.uLight, s.lightMode ? 1 : 0);\r
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
      const motion = reduce ? 0 : 1;\r
      time += dt * s.speed * motion;\r
      drift += dt * (s.speed + 0.2) * motion;\r
      surge.age += dt;\r
      if (s.intro && !reduce && reveal < 1) reveal = Math.min(1, reveal + dt / INTRO_SECONDS);\r
      else if (!s.intro || reduce) reveal = 1;\r
\r
      const engaged = s.mouseInteraction && pointer.inside && !reduce;\r
      const reach = s.mouseStrength * 2.5;\r
      const target = engaged ? [pointer.x * reach, pointer.y * reach] : [0, 0];\r
      const follow = 1 - Math.exp(-dt / 0.6);\r
      steer.x += (target[0] - steer.x) * follow;\r
      steer.y += (target[1] - steer.y) * follow;\r
\r
      render();\r
      const settled = Math.abs(target[0] - steer.x) < 0.0005 && Math.abs(target[1] - steer.y) < 0.0005;\r
      const busy = motion > 0 || !settled || reveal < 1 || surge.age < 2.4;\r
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
      pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      const scale = Math.min(rect.width, rect.height) * 0.5;\r
      pointer.x = (x - rect.width / 2) / Math.max(1, scale);\r
      pointer.y = (rect.height / 2 - y) / Math.max(1, scale);\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      locate(event);\r
      wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      locate(event);\r
      if (!pointer.inside || !settingsRef.current.clickSurge || reduce) return;\r
      surge.age = 0;\r
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
      className={\`light-tunnel-container\${className ? \` \${className}\` : ''}\`}\r
      style={style}\r
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className="light-tunnel-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default LightTunnel;\r
`,o=`'use client';\r
\r
import { useEffect, useRef, type HTMLAttributes } from 'react';\r
\r
export type FlowDirection = 'inward' | 'outward';\r
\r
export interface LightTunnelProps extends HTMLAttributes<HTMLDivElement> {\r
  cableColor?: string;\r
  pulseColor?: string;\r
  tunnelColor?: string;\r
  tunnelOpacity?: number;\r
  speed?: number;\r
  flowDirection?: FlowDirection;\r
  pulseSpeed?: number;\r
  pulseLength?: number;\r
  pulseBlend?: number;\r
  pulseWidth?: number;\r
  pulseDensity?: number;\r
  cableCount?: number;\r
  thickness?: number;\r
  rimWidth?: number;\r
  waviness?: number;\r
  sway?: number;\r
  bend?: number;\r
  size?: number;\r
  centerX?: number;\r
  centerY?: number;\r
  glow?: number;\r
  fadeNear?: number;\r
  fadeFar?: number;\r
  brightness?: number;\r
  colorVariance?: boolean;\r
  grain?: boolean;\r
  grainIntensity?: number;\r
  opacity?: number;\r
  mouseInteraction?: boolean;\r
  mouseStrength?: number;\r
  clickSurge?: boolean;\r
  intro?: boolean;\r
  variation?: number;\r
  lightMode?: boolean;\r
  dpr?: number;\r
}\r
\r
type Settings = {\r
  cableColor: string;\r
  pulseColor: string;\r
  tunnelColor: string;\r
  tunnelOpacity: number;\r
  speed: number;\r
  flow: number;\r
  pulseSpeed: number;\r
  pulseLength: number;\r
  pulseBlend: number;\r
  pulseWidth: number;\r
  pulseDensity: number;\r
  cableCount: number;\r
  thickness: number;\r
  rimWidth: number;\r
  waviness: number;\r
  sway: number;\r
  bend: number;\r
  size: number;\r
  centerX: number;\r
  centerY: number;\r
  glow: number;\r
  fadeNear: number;\r
  fadeFar: number;\r
  brightness: number;\r
  colorVariance: boolean;\r
  grain: boolean;\r
  grainIntensity: number;\r
  opacity: number;\r
  mouseInteraction: boolean;\r
  mouseStrength: number;\r
  clickSurge: boolean;\r
  intro: boolean;\r
  variation: number;\r
  lightMode: boolean;\r
  dpr?: number;\r
};\r
\r
type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };\r
\r
const INTRO_SECONDS = 1.8;\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform vec2 uResolution;\r
uniform vec2 uCenter;\r
uniform float uScale;\r
uniform float uRatio;\r
uniform float uTime;\r
uniform float uDrift;\r
uniform vec2 uSteer;\r
uniform float uBend;\r
uniform float uCount;\r
uniform float uSwing;\r
uniform float uWave;\r
uniform float uWidth;\r
uniform float uPulseWidth;\r
uniform float uHead;\r
uniform float uTail;\r
uniform float uChance;\r
uniform float uSpacing;\r
uniform float uPulseSpeed;\r
uniform float uFlow;\r
uniform float uHalo;\r
uniform float uGlow;\r
uniform float uBrightness;\r
uniform float uVariance;\r
uniform float uBody;\r
uniform float uFadeNear;\r
uniform float uFadeFar;\r
uniform vec3 uCable;\r
uniform vec3 uPulse;\r
uniform vec3 uTunnel;\r
uniform vec3 uSurge;\r
uniform float uReveal;\r
uniform float uGrain;\r
uniform float uSeed;\r
uniform float uLight;\r
uniform float uOpacity;\r
out vec4 outColor;\r
\r
const float TAU = 6.2831853;\r
\r
vec3 inkOf(vec3 color, float depthOfInk) {\r
  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));\r
  float peak = max(color.r, max(color.g, color.b));\r
  float chroma = (peak - min(color.r, min(color.g, color.b))) / max(peak, 0.001);\r
  return color * min(1.0, mix(depthOfInk, depthOfInk * 1.7, chroma) / max(luma, 0.001));\r
}\r
\r
float hash(float n) {\r
  return fract(sin(n * 127.1 + uSeed * 311.7) * 43758.5453);\r
}\r
\r
vec2 bendAt(float depth) {\r
  float reach = 1.0 - exp(-max(depth, 0.0) * 0.55);\r
  vec2 wobble = vec2(sin(uDrift * 0.37 + depth * 0.31), cos(uDrift * 0.29 + depth * 0.23)) * uBend;\r
  return (wobble + uSteer) * reach;\r
}\r
\r
void main() {\r
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution - uCenter) / uScale;\r
  float depth = -log(max(length(p), 1e-5));\r
  vec2 q = p;\r
  for (int i = 0; i < 4; i++) {\r
    q = p - bendAt(depth);\r
    depth = -log(max(length(q), 1e-5));\r
  }\r
  float r = length(q);\r
  float px = r * uScale;\r
  float turn = atan(q.y, q.x) / TAU;\r
  float s = turn - uSwing - uWave * sin(depth * 1.2 + uDrift * 0.5);\r
  float cell = floor(s * uCount);\r
  float spacing = TAU * px / uCount;\r
  float near = smoothstep(0.55, 1.25, r);\r
  float width = uWidth * (1.0 + near * 1.2);\r
  float soft = uRatio * (0.55 + near * 0.9);\r
  float tight = uRatio * uHalo * (1.0 + near);\r
  float wide = tight * 4.5;\r
\r
  float lines = 0.0;\r
  float body = 0.0;\r
  vec3 glow = vec3(0.0);\r
  float strokes = 0.0;\r
  for (int k = -3; k <= 3; k++) {\r
    float i = cell + float(k);\r
    float id = mod(i, uCount);\r
    float h1 = hash(id);\r
    float h2 = hash(id + 17.0);\r
    float h3 = hash(id + 41.0);\r
    float h4 = hash(id + 73.0);\r
    float center = (i + 0.5 + (h1 - 0.5) * 0.55) / uCount;\r
    center += 0.12 * sin(depth * (0.8 + h2 * 0.9) + uDrift * (0.4 + h3 * 0.5) + h4 * TAU) / uCount;\r
    float d = abs(s - center) * TAU * px;\r
    float shade = 1.0 + uVariance * (h3 - 0.5) * 0.9;\r
    float reach = smoothstep(spacing * 2.4, spacing * 1.4, d);\r
\r
    lines += smoothstep(width + soft, width - soft, d) * shade;\r
    body += exp(-d / max(spacing * 0.22, 0.001)) * shade * reach;\r
\r
    float x = depth * uSpacing + uTime * uPulseSpeed * (0.55 + h2 * 0.6) * uFlow + h4 * 7.0;\r
    float lead = (fract(x) - 0.5) / uSpacing * uFlow;\r
    float lit = step(hash(id * 3.7 + floor(x) * 13.1), uChance);\r
    float limit = 0.5 / uSpacing;\r
    float head = exp(-pow(max(-lead, 0.0) / uHead, 2.0)) * smoothstep(-limit, -limit * 0.8, lead);\r
    float tail = exp(-max(lead, 0.0) / uTail) * smoothstep(limit, limit * 0.55, lead);\r
    float pulse = (lead < 0.0 ? head : tail) * lit;\r
    float ring = uSurge.y * exp(-pow((depth - uSurge.x) / uSurge.z, 2.0));\r
    pulse = max(pulse, ring);\r
    float hot = pulse * (lead < 0.0 ? 1.0 : exp(-max(lead, 0.0) / (uTail * 0.35)));\r
\r
    float core = uPulseWidth * width + 0.35 * uRatio;\r
    float stroke = smoothstep(core + soft, core - soft, d);\r
    float bloom = (exp(-d / tight) * 0.7 + exp(-d / wide) * 0.18) * uGlow * reach;\r
    vec3 tint = mix(uPulse, vec3(1.0), hot * 0.55 * (1.0 - uLight));\r
    glow += tint * pulse * (stroke * 1.5 + bloom) * shade;\r
    strokes += pulse * stroke * shade;\r
  }\r
\r
  float lod = smoothstep(4.0, 1.2, spacing);\r
  float average = min(2.0 * uWidth / max(spacing, 0.001), 1.0);\r
  lines = mix(lines, average, lod);\r
  glow = mix(glow, uPulse * average * 0.6 * uChance, lod);\r
  strokes = mix(strokes, average * 0.6 * uChance, lod);\r
  body = mix(body, 1.0, lod) * uBody;\r
\r
  float rr = r * 0.25;\r
  float fade = smoothstep(0.0, uFadeNear, rr) * smoothstep(uFadeFar, uFadeFar * 0.55, rr);\r
  fade *= smoothstep(uReveal - 0.6, uReveal, depth);\r
\r
  float grain = 1.0;\r
  if (uGrain > 0.0) {\r
    grain += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + uTime * 7.0) * 43758.5453) - 0.5) * uGrain * 4.0;\r
  }\r
\r
  if (uLight > 0.5) {\r
    float hairline = clamp(lines * 0.26 + body * 0.2, 0.0, 1.0);\r
    float stroke = clamp(strokes * 1.6, 0.0, 1.0);\r
    float haze = clamp(length(glow) * 0.12, 0.0, 0.25);\r
    float ink = clamp(hairline + stroke + haze, 0.0, 1.0) * fade * uOpacity * grain;\r
    vec3 tone = mix(inkOf(uCable, 0.3), inkOf(uPulse, 0.16), clamp(stroke + haze * 2.0, 0.0, 1.0));\r
    tone = mix(tone, inkOf(uTunnel, 0.3), clamp(body * uBody, 0.0, 1.0) * 0.5);\r
    outColor = vec4(tone * ink, ink);\r
    return;\r
  }\r
\r
  vec3 light = (uCable * lines * 0.12 + uTunnel * body * 0.35 + glow) * uBrightness * fade * grain;\r
  vec3 mapped = (1.0 - exp(-light * 1.4)) * uOpacity;\r
  outColor = vec4(mapped, max(mapped.r, max(mapped.g, mapped.b)));\r
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
    if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const LightTunnel = ({\r
  cableColor = '#ffffff',\r
  pulseColor = '#ffffff',\r
  tunnelColor = '#ffffff',\r
  tunnelOpacity = 0,\r
  speed = 0.1,\r
  flowDirection = 'inward',\r
  pulseSpeed = 2,\r
  pulseLength = 0.28,\r
  pulseBlend = 0.6,\r
  pulseWidth = 1,\r
  pulseDensity = 0.5,\r
  cableCount = 56,\r
  thickness = 0.35,\r
  rimWidth = 0.15,\r
  waviness = 0.3,\r
  sway = 0.5,\r
  bend = 0.4,\r
  size = 1,\r
  centerX = 0,\r
  centerY = 0,\r
  glow = 1,\r
  fadeNear = 0.5,\r
  fadeFar = 2,\r
  brightness = 1,\r
  colorVariance = true,\r
  grain = false,\r
  grainIntensity = 0.05,\r
  opacity = 1,\r
  mouseInteraction = true,\r
  mouseStrength = 0.1,\r
  clickSurge = true,\r
  intro = true,\r
  variation = 0,\r
  lightMode = false,\r
  dpr,\r
  className = '',\r
  style,\r
  ...rest\r
}: LightTunnelProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings: Settings = {\r
    cableColor,\r
    pulseColor,\r
    tunnelColor,\r
    tunnelOpacity: clamp(tunnelOpacity, 0, 1),\r
    speed: Math.max(0, speed),\r
    flow: flowDirection === 'outward' ? 1 : -1,\r
    pulseSpeed: Math.max(0, pulseSpeed),\r
    pulseLength: clamp(pulseLength, 0.02, 1),\r
    pulseBlend: clamp(pulseBlend, 0, 1),\r
    pulseWidth: clamp(pulseWidth, 0.1, 3),\r
    pulseDensity: clamp(pulseDensity, 0, 1),\r
    cableCount: clamp(Math.round(cableCount), 4, 200),\r
    thickness: clamp(thickness, 0.05, 2),\r
    rimWidth: clamp(rimWidth, 0, 1),\r
    waviness: Math.max(0, waviness),\r
    sway: Math.max(0, sway),\r
    bend: Math.max(0, bend),\r
    size: Math.max(0.05, size),\r
    centerX,\r
    centerY,\r
    glow: Math.max(0, glow),\r
    fadeNear: Math.max(0.001, fadeNear),\r
    fadeFar: Math.max(0.01, fadeFar),\r
    brightness: Math.max(0, brightness),\r
    colorVariance,\r
    grain,\r
    grainIntensity: Math.max(0, grainIntensity),\r
    opacity: clamp(opacity, 0, 1),\r
    mouseInteraction,\r
    mouseStrength: Math.max(0, mouseStrength),\r
    clickSurge,\r
    intro,\r
    variation,\r
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
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const steer = { x: 0, y: 0 };\r
    const surge = { age: 10 };\r
    let time = 0;\r
    let drift = 0;\r
    let reveal = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const width = canvas.width;\r
      const height = canvas.height;\r
      const ratio = width / Math.max(1, container.clientWidth);\r
      const minSide = Math.min(width, height);\r
      const flow = s.flow;\r
      const span = 3.4;\r
      const travel = surge.age * 2.6;\r
      const surgeDepth = flow > 0 ? span - travel : -0.6 + travel;\r
      const surgeLevel = surge.age < 2.4 ? Math.min(1, surge.age / 0.12) * Math.exp(-surge.age * 1.1) : 0;\r
      const eased = reveal * reveal * (3 - 2 * reveal);\r
      gl.viewport(0, 0, width, height);\r
      gl.useProgram(program.program);\r
      gl.bindVertexArray(vao);\r
      gl.uniform2f(u.uResolution, width, height);\r
      gl.uniform2f(u.uCenter, s.centerX * minSide, s.centerY * minSide);\r
      gl.uniform1f(u.uScale, minSide * 0.5 * s.size);\r
      gl.uniform1f(u.uRatio, ratio);\r
      gl.uniform1f(u.uTime, time);\r
      gl.uniform1f(u.uDrift, drift);\r
      gl.uniform2f(u.uSteer, steer.x, steer.y);\r
      gl.uniform1f(u.uBend, s.bend * 0.45);\r
      gl.uniform1f(u.uCount, s.cableCount);\r
      gl.uniform1f(u.uSwing, (Math.sin(drift * 0.9) * s.sway * 0.5) / (Math.PI * 2));\r
      gl.uniform1f(u.uWave, s.waviness * 0.15);\r
      gl.uniform1f(u.uWidth, (0.25 + s.thickness * 1.5) * ratio);\r
      gl.uniform1f(u.uPulseWidth, 0.6 + s.pulseWidth * 0.9);\r
      const length = s.pulseLength * 1.2;\r
      gl.uniform1f(u.uHead, length * (0.08 + s.pulseBlend * 0.22));\r
      gl.uniform1f(u.uTail, length * (0.5 + s.pulseBlend * 0.7));\r
      gl.uniform1f(u.uChance, s.pulseDensity);\r
      gl.uniform1f(u.uSpacing, 0.4);\r
      gl.uniform1f(u.uPulseSpeed, s.pulseSpeed * 4);\r
      gl.uniform1f(u.uFlow, flow);\r
      gl.uniform1f(u.uHalo, 1.2 + s.rimWidth * 8);\r
      gl.uniform1f(u.uGlow, s.glow);\r
      gl.uniform1f(u.uBrightness, s.brightness);\r
      gl.uniform1f(u.uVariance, s.colorVariance ? 1 : 0);\r
      gl.uniform1f(u.uBody, s.tunnelOpacity);\r
      gl.uniform1f(u.uFadeNear, s.fadeNear);\r
      gl.uniform1f(u.uFadeFar, s.fadeFar);\r
      gl.uniform3fv(u.uCable, parse(s.cableColor, [1, 1, 1]));\r
      gl.uniform3fv(u.uPulse, parse(s.pulseColor, [1, 1, 1]));\r
      gl.uniform3fv(u.uTunnel, parse(s.tunnelColor, [1, 1, 1]));\r
      gl.uniform3f(u.uSurge, surgeDepth, surgeLevel, 0.22);\r
      gl.uniform1f(u.uReveal, 1.7 - eased * 3.6);\r
      gl.uniform1f(u.uGrain, s.grain ? s.grainIntensity : 0);\r
      gl.uniform1f(u.uSeed, s.variation);\r
      gl.uniform1f(u.uLight, s.lightMode ? 1 : 0);\r
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
      const motion = reduce ? 0 : 1;\r
      time += dt * s.speed * motion;\r
      drift += dt * (s.speed + 0.2) * motion;\r
      surge.age += dt;\r
      if (s.intro && !reduce && reveal < 1) reveal = Math.min(1, reveal + dt / INTRO_SECONDS);\r
      else if (!s.intro || reduce) reveal = 1;\r
\r
      const engaged = s.mouseInteraction && pointer.inside && !reduce;\r
      const reach = s.mouseStrength * 2.5;\r
      const target = engaged ? [pointer.x * reach, pointer.y * reach] : [0, 0];\r
      const follow = 1 - Math.exp(-dt / 0.6);\r
      steer.x += (target[0] - steer.x) * follow;\r
      steer.y += (target[1] - steer.y) * follow;\r
\r
      render();\r
      const settled = Math.abs(target[0] - steer.x) < 0.0005 && Math.abs(target[1] - steer.y) < 0.0005;\r
      const busy = motion > 0 || !settled || reveal < 1 || surge.age < 2.4;\r
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
      pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      const scale = Math.min(rect.width, rect.height) * 0.5;\r
      pointer.x = (x - rect.width / 2) / Math.max(1, scale);\r
      pointer.y = (rect.height / 2 - y) / Math.max(1, scale);\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      locate(event);\r
      wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      locate(event);\r
      if (!pointer.inside || !settingsRef.current.clickSurge || reduce) return;\r
      surge.age = 0;\r
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
      style={style}\r
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default LightTunnel;\r
`,a={usage:`import LightTunnel from './LightTunnel';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <LightTunnel
    cableColor="#ffffff"
    pulseColor="#ffffff"
    cableCount={56}
    pulseDensity={0.5}
    flowDirection="inward"
    mouseInteraction
    clickSurge
  />
</div>`,code:n,css:r,tailwind:e,tsCode:t,tsTailwind:o};export{a as lightTunnel};
