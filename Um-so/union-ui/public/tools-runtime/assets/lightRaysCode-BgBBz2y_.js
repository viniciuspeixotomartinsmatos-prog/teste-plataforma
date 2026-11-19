const n=`'use client';\r
\r
import { useEffect, useRef, useState } from 'react';\r
import './LightRays.css';\r
\r
const PIXEL_BUDGET = 2.4e6;\r
const MAX_PULSES = 4;\r
\r
const ORIGINS = {\r
  'top-left': { anchor: [0, -0.2], dir: [0, 1] },\r
  'top-center': { anchor: [0.5, -0.2], dir: [0, 1] },\r
  'top-right': { anchor: [1, -0.2], dir: [0, 1] },\r
  left: { anchor: [-0.2, 0.5], dir: [1, 0] },\r
  right: { anchor: [1.2, 0.5], dir: [-1, 0] },\r
  'bottom-left': { anchor: [0, 1.2], dir: [0, -1] },\r
  'bottom-center': { anchor: [0.5, 1.2], dir: [0, -1] },\r
  'bottom-right': { anchor: [1, 1.2], dir: [0, -1] }\r
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
uniform float uScale;\r
uniform float uTime;\r
uniform vec2 uSource;\r
uniform vec2 uAim;\r
uniform float uReach;\r
uniform vec3 uColor;\r
uniform float uSpread;\r
uniform float uLength;\r
uniform float uFade;\r
uniform float uSaturation;\r
uniform float uPulsating;\r
uniform float uNoise;\r
uniform float uDistortion;\r
uniform float uDensity;\r
uniform float uSharpness;\r
uniform float uGlow;\r
uniform float uHaze;\r
uniform float uAtmosphere;\r
uniform float uIntensity;\r
uniform vec4 uShadow;\r
uniform vec4 uPulses[\${MAX_PULSES}];\r
uniform vec2 uIntro;\r
uniform float uLight;\r
uniform float uOpacity;\r
out vec4 fragColor;\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
float valueNoise(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = p - i;\r
  vec2 w = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);\r
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), w.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), w.x), w.y);\r
}\r
\r
float shape(float strength, float width) {\r
  float edge = max(mix(0.5, 0.08, uSharpness), width);\r
  return mix(strength, smoothstep(0.62 - edge, 0.62 + edge, strength), uSharpness);\r
}\r
\r
void main() {\r
  vec2 coord = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y) / uScale;\r
  vec2 delta = coord - uSource;\r
  float distance = length(delta);\r
  vec2 dir = delta / max(distance, 1e-4);\r
  float cosAngle = dot(dir, uAim);\r
  float angle = cosAngle + uDistortion * sin(uTime * 2.0 + distance * 0.02) * 0.2;\r
  float slope = fwidth(angle);\r
  float depth = distance / uReach;\r
\r
  float source = exp(-depth * depth * 9.0) * 0.9 + exp(-depth * 3.2) * 0.25;\r
  float glowLight = uGlow * source * smoothstep(-0.2, 0.6, cosAngle);\r
  float spread = pow(max(angle, 0.0), 1.0 / uSpread);\r
  float lengthFalloff = clamp(1.0 - distance / (uReach * uLength), 0.0, 1.0);\r
  float fadeFalloff = clamp(1.0 - distance / (uReach * uFade), 0.5, 1.0);\r
  float envelope = spread * lengthFalloff * fadeFalloff;\r
  float reveal = uIntensity * uIntro.y * (1.0 - smoothstep(uIntro.x - 0.35, uIntro.x, depth));\r
  if ((envelope * 1.6 + glowLight) * reveal < 0.0015) {\r
    fragColor = vec4(0.0);\r
    return;\r
  }\r
\r
  float phaseA = angle * 36.2214 * uDensity + uTime * 1.5;\r
  float phaseB = -angle * 21.11349 * uDensity + uTime * 1.5;\r
  float phaseC = angle * 22.3991 * uDensity + uTime * 1.1;\r
  float phaseD = -angle * 18.0234 * uDensity + uTime * 1.1;\r
  float strengthA = clamp(0.75 + 0.15 * sin(phaseA) + 0.2 * cos(phaseB), 0.0, 1.0);\r
  float strengthB = clamp(0.75 + 0.15 * sin(phaseC) + 0.2 * cos(phaseD), 0.0, 1.0);\r
  float widthA = abs(0.15 * 36.2214 * cos(phaseA) + 0.2 * 21.11349 * sin(phaseB)) * uDensity * slope;\r
  float widthB = abs(0.15 * 22.3991 * cos(phaseC) + 0.2 * 18.0234 * sin(phaseD)) * uDensity * slope;\r
  float pulseA = uPulsating > 0.5 ? 0.8 + 0.2 * sin(uTime * 4.5) : 1.0;\r
  float pulseB = uPulsating > 0.5 ? 0.8 + 0.2 * sin(uTime * 3.3) : 1.0;\r
  float rayLight = envelope * (0.5 * shape(strengthA, widthA) * pulseA + 0.4 * shape(strengthB, widthB) * pulseB);\r
\r
  if (uHaze > 0.0) {\r
    float around = atan(uAim.x * dir.y - uAim.y * dir.x, cosAngle);\r
    vec2 drift = vec2(around * 2.2 + uTime * 0.035, depth * 2.6 - uTime * 0.11);\r
    float fog = 0.65 * valueNoise(drift * vec2(3.0, 1.0)) + 0.35 * valueNoise(drift * vec2(7.0, 2.3) + 4.1);\r
    rayLight *= mix(1.0, 0.25 + 1.2 * fog, uHaze);\r
  }\r
\r
  if (uShadow.z > 0.0) {\r
    vec2 toCursor = uShadow.xy - uSource;\r
    float cursorDistance = length(toCursor);\r
    float along = dot(delta, toCursor) / max(cursorDistance * cursorDistance, 1e-4);\r
    float side = abs(delta.x * toCursor.y - delta.y * toCursor.x) / max(cursorDistance, 1e-4);\r
    float trail = max(along - 1.0, 0.0);\r
    float width = uShadow.w * along + 0.22 * trail * cursorDistance;\r
    float behind = smoothstep(0.97, 1.25, along) * exp(-trail * 1.1);\r
    float shade = (1.0 - smoothstep(width * 0.3, width * 1.6, side)) * behind;\r
    rayLight *= 1.0 - uShadow.z * 0.62 * shade;\r
  }\r
\r
  float boost = 0.0;\r
  for (int i = 0; i < \${MAX_PULSES}; i++) {\r
    vec4 wave = uPulses[i];\r
    if (wave.z <= 0.0) continue;\r
    float x = (depth - wave.x) / wave.y;\r
    boost += wave.z * exp(-x * x);\r
  }\r
  float light = (rayLight * (1.0 + boost) + glowLight) * reveal;\r
\r
  if (uNoise > 0.0) {\r
    float n = fract(sin(dot(coord * 0.02 + uTime * 0.1, vec2(12.9898, 78.233))) * 43758.5453123);\r
    light *= 1.0 - uNoise + uNoise * n;\r
  }\r
\r
  float near = clamp(1.2 - distance / (uResolution.y / uScale), 0.0, 1.0);\r
  vec3 tint = mix(vec3(0.9), vec3(0.1, 0.3, 0.5) + near * vec3(0.8, 0.6, 0.5), uAtmosphere);\r
  float gray = dot(tint, vec3(0.299, 0.587, 0.114));\r
  vec3 hue = max(mix(vec3(gray), tint, uSaturation), 0.0) * uColor;\r
\r
  float grain = (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;\r
  if (uLight > 0.5) {\r
    vec3 color = hue * light;\r
    float energy = max(color.r, max(color.g, color.b));\r
    vec3 tone = clamp(1.0 - (1.0 - hue / max(max(hue.r, max(hue.g, hue.b)), 1e-4)) * 1.8, 0.0, 1.0);\r
    float warm = clamp((min(tone.r, tone.g) - tone.b) * 2.0, 0.0, 1.0);\r
    vec3 ink = tone * (mix(0.66, 0.94, warm) - 0.1 * smoothstep(0.4, 1.2, energy));\r
    float density = clamp(0.82 * (1.0 - exp(-1.5 * energy * energy)) * uOpacity + grain, 0.0, 1.0);\r
    fragColor = vec4(ink * density, density);\r
    return;\r
  }\r
  float level = light < 0.75 ? light : 0.75 + 0.25 * (1.0 - exp(-(light - 0.75) / 0.25));\r
  float top = max(hue.r, max(hue.g, hue.b));\r
  hue = mix(hue, vec3(top), smoothstep(0.8, 1.0, level) * 0.45);\r
  vec3 shown = clamp(hue * level, 0.0, 1.0) * level;\r
  fragColor = vec4(clamp(shown + grain, 0.0, level) * uOpacity, level * uOpacity);\r
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
  return null;\r
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
const smoother = t => {\r
  const x = clamp(t, 0, 1);\r
  return x * x * x * (x * (x * 6 - 15) + 10);\r
};\r
\r
const LightRays = ({\r
  raysOrigin = 'top-center',\r
  raysColor = '#ffffff',\r
  raysSpeed = 1,\r
  lightSpread = 0.5,\r
  rayLength = 3,\r
  rayDensity = 1,\r
  tilt = 0,\r
  raySharpness = 0.35,\r
  glow = 0.6,\r
  haze = 0.25,\r
  atmosphere = 1,\r
  intensity = 1,\r
  pulsating = false,\r
  fadeDistance = 1,\r
  saturation = 1,\r
  followMouse = true,\r
  mouseInfluence = 0.1,\r
  cursorShadow = true,\r
  clickPulse = true,\r
  noiseAmount = 0,\r
  distortion = 0,\r
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
    origin: ORIGINS[raysOrigin] || ORIGINS['top-center'],\r
    color: parseColor(raysColor) || [1, 1, 1],\r
    speed: Math.max(0, raysSpeed),\r
    spread: Math.max(0.001, lightSpread),\r
    length: Math.max(0.01, rayLength),\r
    density: clamp(rayDensity, 0.1, 6),\r
    tilt: (clamp(tilt, -90, 90) * Math.PI) / 180,\r
    sharpness: clamp(raySharpness, 0, 1),\r
    glow: Math.max(0, glow),\r
    haze: clamp(haze, 0, 1),\r
    atmosphere: clamp(atmosphere, 0, 1),\r
    intensity: Math.max(0, intensity),\r
    pulsating,\r
    fade: Math.max(0.01, fadeDistance),\r
    saturation: Math.max(0, saturation),\r
    follow: followMouse,\r
    influence: clamp(mouseInfluence, 0, 1),\r
    cursorShadow,\r
    clickPulse,\r
    noise: clamp(noiseAmount, 0, 1),\r
    distortion,\r
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
    const pointer = { x: 0.5, y: 0.5, inside: false, seen: false };\r
    const aim = { x: 0.5, y: 0.5 };\r
    const shade = { x: 0.5, y: 0.5, presence: 0 };\r
    const pulses = [];\r
    const pulseData = new Float32Array(MAX_PULSES * 4);\r
    let time = 0;\r
    let opening = settingsRef.current.intro && !reduced && generation === 0 ? 0 : 1;\r
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
      const detail = s.density * (0.35 + 0.65 * s.sharpness);\r
      const sampling = Math.max(clamp(0.35 + 0.3 * detail, 0.5, 2), s.noise > 0 ? 1 : 0);\r
      const ratio = Math.min(\r
        window.devicePixelRatio || 1,\r
        s.maxRatio,\r
        sampling,\r
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
    const frame = now => {\r
      raf = 0;\r
      if (lost) return;\r
      const s = settingsRef.current;\r
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05);\r
      last = Math.max(last, now);\r
      time += dt * s.speed * (reduced ? 0.35 : 1);\r
      if (opening < 1) opening = Math.min(1, opening + dt / 1.8);\r
\r
      const steer = 1 - Math.exp(-dt / 0.2);\r
      const aimX = s.follow && pointer.seen ? pointer.x : 0.5;\r
      const aimY = s.follow && pointer.seen ? pointer.y : 0.5;\r
      aim.x += (aimX - aim.x) * steer;\r
      aim.y += (aimY - aim.y) * steer;\r
      const glide = 1 - Math.exp(-dt / 0.08);\r
      shade.x += (pointer.x - shade.x) * glide;\r
      shade.y += (pointer.y - shade.y) * glide;\r
      const shading = pointer.inside && s.cursorShadow && !reduced;\r
      shade.presence += ((shading ? 1 : 0) - shade.presence) * (1 - Math.exp(-dt / (shading ? 0.25 : 0.5)));\r
\r
      for (let index = pulses.length - 1; index >= 0; index--) {\r
        pulses[index].age += dt;\r
        if (pulses[index].age >= 2) pulses.splice(index, 1);\r
      }\r
      pulseData.fill(0);\r
      pulses.forEach((pulse, index) => {\r
        const t = pulse.age;\r
        pulseData[index * 4] = 0.05 + t * 1.05;\r
        pulseData[index * 4 + 1] = 0.14 + t * 0.14;\r
        pulseData[index * 4 + 2] = 0.9 * smoother(t / 0.15) * (1 - smoother(t / 2));\r
      });\r
\r
      const width = size.width;\r
      const height = size.height;\r
      const sourceX = s.origin.anchor[0] * width;\r
      const sourceY = s.origin.anchor[1] * height;\r
      const cos = Math.cos(s.tilt);\r
      const sin = Math.sin(s.tilt);\r
      let dirX = s.origin.dir[0] * cos - s.origin.dir[1] * sin;\r
      let dirY = s.origin.dir[0] * sin + s.origin.dir[1] * cos;\r
      if (s.follow && s.influence > 0) {\r
        const mx = aim.x * width - sourceX;\r
        const my = aim.y * height - sourceY;\r
        const ml = Math.hypot(mx, my) || 1;\r
        const bx = dirX + (mx / ml - dirX) * s.influence;\r
        const by = dirY + (my / ml - dirY) * s.influence;\r
        const bl = Math.hypot(bx, by) || 1;\r
        dirX = bx / bl;\r
        dirY = by / bl;\r
      }\r
      const eased = 1 - Math.pow(1 - opening, 3);\r
\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.useProgram(shader.program);\r
      gl.bindVertexArray(vao);\r
      const u = shader.uniforms;\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(u.uScale, size.ratio);\r
      gl.uniform1f(u.uTime, time);\r
      gl.uniform2f(u.uSource, sourceX, sourceY);\r
      gl.uniform2f(u.uAim, dirX, dirY);\r
      gl.uniform1f(u.uReach, Math.max(width, height));\r
      gl.uniform3f(u.uColor, s.color[0], s.color[1], s.color[2]);\r
      gl.uniform1f(u.uSpread, s.spread);\r
      gl.uniform1f(u.uLength, s.length);\r
      gl.uniform1f(u.uFade, s.fade);\r
      gl.uniform1f(u.uSaturation, s.saturation);\r
      gl.uniform1f(u.uPulsating, s.pulsating ? 1 : 0);\r
      gl.uniform1f(u.uNoise, s.noise);\r
      gl.uniform1f(u.uDistortion, s.distortion);\r
      gl.uniform1f(u.uDensity, s.density);\r
      gl.uniform1f(u.uSharpness, s.sharpness);\r
      gl.uniform1f(u.uGlow, s.glow);\r
      gl.uniform1f(u.uHaze, s.haze);\r
      gl.uniform1f(u.uAtmosphere, s.atmosphere);\r
      gl.uniform1f(u.uIntensity, s.intensity);\r
      gl.uniform4f(u.uShadow, shade.x * width, shade.y * height, shade.presence, 16);\r
      gl.uniform4fv(u.uPulses, pulseData);\r
      gl.uniform2f(u.uIntro, eased * 2.6, smoother(opening / 0.5));\r
      gl.uniform1f(u.uLight, s.light ? 1 : 0);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      const settling =\r
        Math.abs(aim.x - aimX) > 1e-4 ||\r
        Math.abs(aim.y - aimY) > 1e-4 ||\r
        (shade.presence > 1e-3 && Math.abs(shade.x - pointer.x) + Math.abs(shade.y - pointer.y) > 1e-4) ||\r
        Math.abs((shading ? 1 : 0) - shade.presence) > 1e-3 ||\r
        pulses.length > 0;\r
      const busy = s.speed > 0 || opening < 1 || settling;\r
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
        x: (event.clientX - rect.left) / Math.max(1, rect.width),\r
        y: (event.clientY - rect.top) / Math.max(1, rect.height),\r
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
      if (!pointer.inside && spot.inside) {\r
        shade.x = spot.x;\r
        shade.y = spot.y;\r
      }\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = spot.inside;\r
      pointer.seen = true;\r
      wake();\r
    };\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      const spot = locate(event);\r
      if (!spot.inside || !s.clickPulse || reduced) return;\r
      pulses.push({ age: 0 });\r
      if (pulses.length > MAX_PULSES) pulses.shift();\r
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
    <div ref={containerRef} className={\`light-rays\${className ? \` \${className}\` : ''}\`} style={style}>\r
      <canvas ref={canvasRef} className="light-rays__canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default LightRays;\r
`,r=`.light-rays {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
  pointer-events: none;\r
}\r
\r
.light-rays__canvas {\r
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
const MAX_PULSES = 4;\r
\r
const ORIGINS = {\r
  'top-left': { anchor: [0, -0.2], dir: [0, 1] },\r
  'top-center': { anchor: [0.5, -0.2], dir: [0, 1] },\r
  'top-right': { anchor: [1, -0.2], dir: [0, 1] },\r
  left: { anchor: [-0.2, 0.5], dir: [1, 0] },\r
  right: { anchor: [1.2, 0.5], dir: [-1, 0] },\r
  'bottom-left': { anchor: [0, 1.2], dir: [0, -1] },\r
  'bottom-center': { anchor: [0.5, 1.2], dir: [0, -1] },\r
  'bottom-right': { anchor: [1, 1.2], dir: [0, -1] }\r
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
uniform float uScale;\r
uniform float uTime;\r
uniform vec2 uSource;\r
uniform vec2 uAim;\r
uniform float uReach;\r
uniform vec3 uColor;\r
uniform float uSpread;\r
uniform float uLength;\r
uniform float uFade;\r
uniform float uSaturation;\r
uniform float uPulsating;\r
uniform float uNoise;\r
uniform float uDistortion;\r
uniform float uDensity;\r
uniform float uSharpness;\r
uniform float uGlow;\r
uniform float uHaze;\r
uniform float uAtmosphere;\r
uniform float uIntensity;\r
uniform vec4 uShadow;\r
uniform vec4 uPulses[\${MAX_PULSES}];\r
uniform vec2 uIntro;\r
uniform float uLight;\r
uniform float uOpacity;\r
out vec4 fragColor;\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
float valueNoise(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = p - i;\r
  vec2 w = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);\r
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), w.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), w.x), w.y);\r
}\r
\r
float shape(float strength, float width) {\r
  float edge = max(mix(0.5, 0.08, uSharpness), width);\r
  return mix(strength, smoothstep(0.62 - edge, 0.62 + edge, strength), uSharpness);\r
}\r
\r
void main() {\r
  vec2 coord = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y) / uScale;\r
  vec2 delta = coord - uSource;\r
  float distance = length(delta);\r
  vec2 dir = delta / max(distance, 1e-4);\r
  float cosAngle = dot(dir, uAim);\r
  float angle = cosAngle + uDistortion * sin(uTime * 2.0 + distance * 0.02) * 0.2;\r
  float slope = fwidth(angle);\r
  float depth = distance / uReach;\r
\r
  float source = exp(-depth * depth * 9.0) * 0.9 + exp(-depth * 3.2) * 0.25;\r
  float glowLight = uGlow * source * smoothstep(-0.2, 0.6, cosAngle);\r
  float spread = pow(max(angle, 0.0), 1.0 / uSpread);\r
  float lengthFalloff = clamp(1.0 - distance / (uReach * uLength), 0.0, 1.0);\r
  float fadeFalloff = clamp(1.0 - distance / (uReach * uFade), 0.5, 1.0);\r
  float envelope = spread * lengthFalloff * fadeFalloff;\r
  float reveal = uIntensity * uIntro.y * (1.0 - smoothstep(uIntro.x - 0.35, uIntro.x, depth));\r
  if ((envelope * 1.6 + glowLight) * reveal < 0.0015) {\r
    fragColor = vec4(0.0);\r
    return;\r
  }\r
\r
  float phaseA = angle * 36.2214 * uDensity + uTime * 1.5;\r
  float phaseB = -angle * 21.11349 * uDensity + uTime * 1.5;\r
  float phaseC = angle * 22.3991 * uDensity + uTime * 1.1;\r
  float phaseD = -angle * 18.0234 * uDensity + uTime * 1.1;\r
  float strengthA = clamp(0.75 + 0.15 * sin(phaseA) + 0.2 * cos(phaseB), 0.0, 1.0);\r
  float strengthB = clamp(0.75 + 0.15 * sin(phaseC) + 0.2 * cos(phaseD), 0.0, 1.0);\r
  float widthA = abs(0.15 * 36.2214 * cos(phaseA) + 0.2 * 21.11349 * sin(phaseB)) * uDensity * slope;\r
  float widthB = abs(0.15 * 22.3991 * cos(phaseC) + 0.2 * 18.0234 * sin(phaseD)) * uDensity * slope;\r
  float pulseA = uPulsating > 0.5 ? 0.8 + 0.2 * sin(uTime * 4.5) : 1.0;\r
  float pulseB = uPulsating > 0.5 ? 0.8 + 0.2 * sin(uTime * 3.3) : 1.0;\r
  float rayLight = envelope * (0.5 * shape(strengthA, widthA) * pulseA + 0.4 * shape(strengthB, widthB) * pulseB);\r
\r
  if (uHaze > 0.0) {\r
    float around = atan(uAim.x * dir.y - uAim.y * dir.x, cosAngle);\r
    vec2 drift = vec2(around * 2.2 + uTime * 0.035, depth * 2.6 - uTime * 0.11);\r
    float fog = 0.65 * valueNoise(drift * vec2(3.0, 1.0)) + 0.35 * valueNoise(drift * vec2(7.0, 2.3) + 4.1);\r
    rayLight *= mix(1.0, 0.25 + 1.2 * fog, uHaze);\r
  }\r
\r
  if (uShadow.z > 0.0) {\r
    vec2 toCursor = uShadow.xy - uSource;\r
    float cursorDistance = length(toCursor);\r
    float along = dot(delta, toCursor) / max(cursorDistance * cursorDistance, 1e-4);\r
    float side = abs(delta.x * toCursor.y - delta.y * toCursor.x) / max(cursorDistance, 1e-4);\r
    float trail = max(along - 1.0, 0.0);\r
    float width = uShadow.w * along + 0.22 * trail * cursorDistance;\r
    float behind = smoothstep(0.97, 1.25, along) * exp(-trail * 1.1);\r
    float shade = (1.0 - smoothstep(width * 0.3, width * 1.6, side)) * behind;\r
    rayLight *= 1.0 - uShadow.z * 0.62 * shade;\r
  }\r
\r
  float boost = 0.0;\r
  for (int i = 0; i < \${MAX_PULSES}; i++) {\r
    vec4 wave = uPulses[i];\r
    if (wave.z <= 0.0) continue;\r
    float x = (depth - wave.x) / wave.y;\r
    boost += wave.z * exp(-x * x);\r
  }\r
  float light = (rayLight * (1.0 + boost) + glowLight) * reveal;\r
\r
  if (uNoise > 0.0) {\r
    float n = fract(sin(dot(coord * 0.02 + uTime * 0.1, vec2(12.9898, 78.233))) * 43758.5453123);\r
    light *= 1.0 - uNoise + uNoise * n;\r
  }\r
\r
  float near = clamp(1.2 - distance / (uResolution.y / uScale), 0.0, 1.0);\r
  vec3 tint = mix(vec3(0.9), vec3(0.1, 0.3, 0.5) + near * vec3(0.8, 0.6, 0.5), uAtmosphere);\r
  float gray = dot(tint, vec3(0.299, 0.587, 0.114));\r
  vec3 hue = max(mix(vec3(gray), tint, uSaturation), 0.0) * uColor;\r
\r
  float grain = (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;\r
  if (uLight > 0.5) {\r
    vec3 color = hue * light;\r
    float energy = max(color.r, max(color.g, color.b));\r
    vec3 tone = clamp(1.0 - (1.0 - hue / max(max(hue.r, max(hue.g, hue.b)), 1e-4)) * 1.8, 0.0, 1.0);\r
    float warm = clamp((min(tone.r, tone.g) - tone.b) * 2.0, 0.0, 1.0);\r
    vec3 ink = tone * (mix(0.66, 0.94, warm) - 0.1 * smoothstep(0.4, 1.2, energy));\r
    float density = clamp(0.82 * (1.0 - exp(-1.5 * energy * energy)) * uOpacity + grain, 0.0, 1.0);\r
    fragColor = vec4(ink * density, density);\r
    return;\r
  }\r
  float level = light < 0.75 ? light : 0.75 + 0.25 * (1.0 - exp(-(light - 0.75) / 0.25));\r
  float top = max(hue.r, max(hue.g, hue.b));\r
  hue = mix(hue, vec3(top), smoothstep(0.8, 1.0, level) * 0.45);\r
  vec3 shown = clamp(hue * level, 0.0, 1.0) * level;\r
  fragColor = vec4(clamp(shown + grain, 0.0, level) * uOpacity, level * uOpacity);\r
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
  return null;\r
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
const smoother = t => {\r
  const x = clamp(t, 0, 1);\r
  return x * x * x * (x * (x * 6 - 15) + 10);\r
};\r
\r
const LightRays = ({\r
  raysOrigin = 'top-center',\r
  raysColor = '#ffffff',\r
  raysSpeed = 1,\r
  lightSpread = 0.5,\r
  rayLength = 3,\r
  rayDensity = 1,\r
  tilt = 0,\r
  raySharpness = 0.35,\r
  glow = 0.6,\r
  haze = 0.25,\r
  atmosphere = 1,\r
  intensity = 1,\r
  pulsating = false,\r
  fadeDistance = 1,\r
  saturation = 1,\r
  followMouse = true,\r
  mouseInfluence = 0.1,\r
  cursorShadow = true,\r
  clickPulse = true,\r
  noiseAmount = 0,\r
  distortion = 0,\r
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
    origin: ORIGINS[raysOrigin] || ORIGINS['top-center'],\r
    color: parseColor(raysColor) || [1, 1, 1],\r
    speed: Math.max(0, raysSpeed),\r
    spread: Math.max(0.001, lightSpread),\r
    length: Math.max(0.01, rayLength),\r
    density: clamp(rayDensity, 0.1, 6),\r
    tilt: (clamp(tilt, -90, 90) * Math.PI) / 180,\r
    sharpness: clamp(raySharpness, 0, 1),\r
    glow: Math.max(0, glow),\r
    haze: clamp(haze, 0, 1),\r
    atmosphere: clamp(atmosphere, 0, 1),\r
    intensity: Math.max(0, intensity),\r
    pulsating,\r
    fade: Math.max(0.01, fadeDistance),\r
    saturation: Math.max(0, saturation),\r
    follow: followMouse,\r
    influence: clamp(mouseInfluence, 0, 1),\r
    cursorShadow,\r
    clickPulse,\r
    noise: clamp(noiseAmount, 0, 1),\r
    distortion,\r
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
    const pointer = { x: 0.5, y: 0.5, inside: false, seen: false };\r
    const aim = { x: 0.5, y: 0.5 };\r
    const shade = { x: 0.5, y: 0.5, presence: 0 };\r
    const pulses = [];\r
    const pulseData = new Float32Array(MAX_PULSES * 4);\r
    let time = 0;\r
    let opening = settingsRef.current.intro && !reduced && generation === 0 ? 0 : 1;\r
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
      const detail = s.density * (0.35 + 0.65 * s.sharpness);\r
      const sampling = Math.max(clamp(0.35 + 0.3 * detail, 0.5, 2), s.noise > 0 ? 1 : 0);\r
      const ratio = Math.min(\r
        window.devicePixelRatio || 1,\r
        s.maxRatio,\r
        sampling,\r
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
    const frame = now => {\r
      raf = 0;\r
      if (lost) return;\r
      const s = settingsRef.current;\r
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05);\r
      last = Math.max(last, now);\r
      time += dt * s.speed * (reduced ? 0.35 : 1);\r
      if (opening < 1) opening = Math.min(1, opening + dt / 1.8);\r
\r
      const steer = 1 - Math.exp(-dt / 0.2);\r
      const aimX = s.follow && pointer.seen ? pointer.x : 0.5;\r
      const aimY = s.follow && pointer.seen ? pointer.y : 0.5;\r
      aim.x += (aimX - aim.x) * steer;\r
      aim.y += (aimY - aim.y) * steer;\r
      const glide = 1 - Math.exp(-dt / 0.08);\r
      shade.x += (pointer.x - shade.x) * glide;\r
      shade.y += (pointer.y - shade.y) * glide;\r
      const shading = pointer.inside && s.cursorShadow && !reduced;\r
      shade.presence += ((shading ? 1 : 0) - shade.presence) * (1 - Math.exp(-dt / (shading ? 0.25 : 0.5)));\r
\r
      for (let index = pulses.length - 1; index >= 0; index--) {\r
        pulses[index].age += dt;\r
        if (pulses[index].age >= 2) pulses.splice(index, 1);\r
      }\r
      pulseData.fill(0);\r
      pulses.forEach((pulse, index) => {\r
        const t = pulse.age;\r
        pulseData[index * 4] = 0.05 + t * 1.05;\r
        pulseData[index * 4 + 1] = 0.14 + t * 0.14;\r
        pulseData[index * 4 + 2] = 0.9 * smoother(t / 0.15) * (1 - smoother(t / 2));\r
      });\r
\r
      const width = size.width;\r
      const height = size.height;\r
      const sourceX = s.origin.anchor[0] * width;\r
      const sourceY = s.origin.anchor[1] * height;\r
      const cos = Math.cos(s.tilt);\r
      const sin = Math.sin(s.tilt);\r
      let dirX = s.origin.dir[0] * cos - s.origin.dir[1] * sin;\r
      let dirY = s.origin.dir[0] * sin + s.origin.dir[1] * cos;\r
      if (s.follow && s.influence > 0) {\r
        const mx = aim.x * width - sourceX;\r
        const my = aim.y * height - sourceY;\r
        const ml = Math.hypot(mx, my) || 1;\r
        const bx = dirX + (mx / ml - dirX) * s.influence;\r
        const by = dirY + (my / ml - dirY) * s.influence;\r
        const bl = Math.hypot(bx, by) || 1;\r
        dirX = bx / bl;\r
        dirY = by / bl;\r
      }\r
      const eased = 1 - Math.pow(1 - opening, 3);\r
\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.useProgram(shader.program);\r
      gl.bindVertexArray(vao);\r
      const u = shader.uniforms;\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(u.uScale, size.ratio);\r
      gl.uniform1f(u.uTime, time);\r
      gl.uniform2f(u.uSource, sourceX, sourceY);\r
      gl.uniform2f(u.uAim, dirX, dirY);\r
      gl.uniform1f(u.uReach, Math.max(width, height));\r
      gl.uniform3f(u.uColor, s.color[0], s.color[1], s.color[2]);\r
      gl.uniform1f(u.uSpread, s.spread);\r
      gl.uniform1f(u.uLength, s.length);\r
      gl.uniform1f(u.uFade, s.fade);\r
      gl.uniform1f(u.uSaturation, s.saturation);\r
      gl.uniform1f(u.uPulsating, s.pulsating ? 1 : 0);\r
      gl.uniform1f(u.uNoise, s.noise);\r
      gl.uniform1f(u.uDistortion, s.distortion);\r
      gl.uniform1f(u.uDensity, s.density);\r
      gl.uniform1f(u.uSharpness, s.sharpness);\r
      gl.uniform1f(u.uGlow, s.glow);\r
      gl.uniform1f(u.uHaze, s.haze);\r
      gl.uniform1f(u.uAtmosphere, s.atmosphere);\r
      gl.uniform1f(u.uIntensity, s.intensity);\r
      gl.uniform4f(u.uShadow, shade.x * width, shade.y * height, shade.presence, 16);\r
      gl.uniform4fv(u.uPulses, pulseData);\r
      gl.uniform2f(u.uIntro, eased * 2.6, smoother(opening / 0.5));\r
      gl.uniform1f(u.uLight, s.light ? 1 : 0);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      const settling =\r
        Math.abs(aim.x - aimX) > 1e-4 ||\r
        Math.abs(aim.y - aimY) > 1e-4 ||\r
        (shade.presence > 1e-3 && Math.abs(shade.x - pointer.x) + Math.abs(shade.y - pointer.y) > 1e-4) ||\r
        Math.abs((shading ? 1 : 0) - shade.presence) > 1e-3 ||\r
        pulses.length > 0;\r
      const busy = s.speed > 0 || opening < 1 || settling;\r
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
        x: (event.clientX - rect.left) / Math.max(1, rect.width),\r
        y: (event.clientY - rect.top) / Math.max(1, rect.height),\r
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
      if (!pointer.inside && spot.inside) {\r
        shade.x = spot.x;\r
        shade.y = spot.y;\r
      }\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = spot.inside;\r
      pointer.seen = true;\r
      wake();\r
    };\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      const spot = locate(event);\r
      if (!spot.inside || !s.clickPulse || reduced) return;\r
      pulses.push({ age: 0 });\r
      if (pulses.length > MAX_PULSES) pulses.shift();\r
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
export default LightRays;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, useState, type CSSProperties } from 'react';\r
import './LightRays.css';\r
\r
export type RaysOrigin =\r
  | 'top-center'\r
  | 'top-left'\r
  | 'top-right'\r
  | 'right'\r
  | 'left'\r
  | 'bottom-center'\r
  | 'bottom-right'\r
  | 'bottom-left';\r
\r
export interface LightRaysProps {\r
  raysOrigin?: RaysOrigin;\r
  raysColor?: string;\r
  raysSpeed?: number;\r
  lightSpread?: number;\r
  rayLength?: number;\r
  rayDensity?: number;\r
  tilt?: number;\r
  raySharpness?: number;\r
  glow?: number;\r
  haze?: number;\r
  atmosphere?: number;\r
  intensity?: number;\r
  pulsating?: boolean;\r
  fadeDistance?: number;\r
  saturation?: number;\r
  followMouse?: boolean;\r
  mouseInfluence?: number;\r
  cursorShadow?: boolean;\r
  clickPulse?: boolean;\r
  noiseAmount?: number;\r
  distortion?: number;\r
  intro?: boolean;\r
  lightMode?: boolean;\r
  opacity?: number;\r
  maxDevicePixelRatio?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Origin {\r
  anchor: number[];\r
  dir: number[];\r
}\r
\r
interface Settings {\r
  origin: Origin;\r
  color: number[];\r
  speed: number;\r
  spread: number;\r
  length: number;\r
  density: number;\r
  tilt: number;\r
  sharpness: number;\r
  glow: number;\r
  haze: number;\r
  atmosphere: number;\r
  intensity: number;\r
  pulsating: boolean;\r
  fade: number;\r
  saturation: number;\r
  follow: boolean;\r
  influence: number;\r
  cursorShadow: boolean;\r
  clickPulse: boolean;\r
  noise: number;\r
  distortion: number;\r
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
const MAX_PULSES = 4;\r
\r
const ORIGINS: Record<RaysOrigin, Origin> = {\r
  'top-left': { anchor: [0, -0.2], dir: [0, 1] },\r
  'top-center': { anchor: [0.5, -0.2], dir: [0, 1] },\r
  'top-right': { anchor: [1, -0.2], dir: [0, 1] },\r
  left: { anchor: [-0.2, 0.5], dir: [1, 0] },\r
  right: { anchor: [1.2, 0.5], dir: [-1, 0] },\r
  'bottom-left': { anchor: [0, 1.2], dir: [0, -1] },\r
  'bottom-center': { anchor: [0.5, 1.2], dir: [0, -1] },\r
  'bottom-right': { anchor: [1, 1.2], dir: [0, -1] }\r
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
uniform float uScale;\r
uniform float uTime;\r
uniform vec2 uSource;\r
uniform vec2 uAim;\r
uniform float uReach;\r
uniform vec3 uColor;\r
uniform float uSpread;\r
uniform float uLength;\r
uniform float uFade;\r
uniform float uSaturation;\r
uniform float uPulsating;\r
uniform float uNoise;\r
uniform float uDistortion;\r
uniform float uDensity;\r
uniform float uSharpness;\r
uniform float uGlow;\r
uniform float uHaze;\r
uniform float uAtmosphere;\r
uniform float uIntensity;\r
uniform vec4 uShadow;\r
uniform vec4 uPulses[\${MAX_PULSES}];\r
uniform vec2 uIntro;\r
uniform float uLight;\r
uniform float uOpacity;\r
out vec4 fragColor;\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
float valueNoise(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = p - i;\r
  vec2 w = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);\r
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), w.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), w.x), w.y);\r
}\r
\r
float shape(float strength, float width) {\r
  float edge = max(mix(0.5, 0.08, uSharpness), width);\r
  return mix(strength, smoothstep(0.62 - edge, 0.62 + edge, strength), uSharpness);\r
}\r
\r
void main() {\r
  vec2 coord = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y) / uScale;\r
  vec2 delta = coord - uSource;\r
  float distance = length(delta);\r
  vec2 dir = delta / max(distance, 1e-4);\r
  float cosAngle = dot(dir, uAim);\r
  float angle = cosAngle + uDistortion * sin(uTime * 2.0 + distance * 0.02) * 0.2;\r
  float slope = fwidth(angle);\r
  float depth = distance / uReach;\r
\r
  float source = exp(-depth * depth * 9.0) * 0.9 + exp(-depth * 3.2) * 0.25;\r
  float glowLight = uGlow * source * smoothstep(-0.2, 0.6, cosAngle);\r
  float spread = pow(max(angle, 0.0), 1.0 / uSpread);\r
  float lengthFalloff = clamp(1.0 - distance / (uReach * uLength), 0.0, 1.0);\r
  float fadeFalloff = clamp(1.0 - distance / (uReach * uFade), 0.5, 1.0);\r
  float envelope = spread * lengthFalloff * fadeFalloff;\r
  float reveal = uIntensity * uIntro.y * (1.0 - smoothstep(uIntro.x - 0.35, uIntro.x, depth));\r
  if ((envelope * 1.6 + glowLight) * reveal < 0.0015) {\r
    fragColor = vec4(0.0);\r
    return;\r
  }\r
\r
  float phaseA = angle * 36.2214 * uDensity + uTime * 1.5;\r
  float phaseB = -angle * 21.11349 * uDensity + uTime * 1.5;\r
  float phaseC = angle * 22.3991 * uDensity + uTime * 1.1;\r
  float phaseD = -angle * 18.0234 * uDensity + uTime * 1.1;\r
  float strengthA = clamp(0.75 + 0.15 * sin(phaseA) + 0.2 * cos(phaseB), 0.0, 1.0);\r
  float strengthB = clamp(0.75 + 0.15 * sin(phaseC) + 0.2 * cos(phaseD), 0.0, 1.0);\r
  float widthA = abs(0.15 * 36.2214 * cos(phaseA) + 0.2 * 21.11349 * sin(phaseB)) * uDensity * slope;\r
  float widthB = abs(0.15 * 22.3991 * cos(phaseC) + 0.2 * 18.0234 * sin(phaseD)) * uDensity * slope;\r
  float pulseA = uPulsating > 0.5 ? 0.8 + 0.2 * sin(uTime * 4.5) : 1.0;\r
  float pulseB = uPulsating > 0.5 ? 0.8 + 0.2 * sin(uTime * 3.3) : 1.0;\r
  float rayLight = envelope * (0.5 * shape(strengthA, widthA) * pulseA + 0.4 * shape(strengthB, widthB) * pulseB);\r
\r
  if (uHaze > 0.0) {\r
    float around = atan(uAim.x * dir.y - uAim.y * dir.x, cosAngle);\r
    vec2 drift = vec2(around * 2.2 + uTime * 0.035, depth * 2.6 - uTime * 0.11);\r
    float fog = 0.65 * valueNoise(drift * vec2(3.0, 1.0)) + 0.35 * valueNoise(drift * vec2(7.0, 2.3) + 4.1);\r
    rayLight *= mix(1.0, 0.25 + 1.2 * fog, uHaze);\r
  }\r
\r
  if (uShadow.z > 0.0) {\r
    vec2 toCursor = uShadow.xy - uSource;\r
    float cursorDistance = length(toCursor);\r
    float along = dot(delta, toCursor) / max(cursorDistance * cursorDistance, 1e-4);\r
    float side = abs(delta.x * toCursor.y - delta.y * toCursor.x) / max(cursorDistance, 1e-4);\r
    float trail = max(along - 1.0, 0.0);\r
    float width = uShadow.w * along + 0.22 * trail * cursorDistance;\r
    float behind = smoothstep(0.97, 1.25, along) * exp(-trail * 1.1);\r
    float shade = (1.0 - smoothstep(width * 0.3, width * 1.6, side)) * behind;\r
    rayLight *= 1.0 - uShadow.z * 0.62 * shade;\r
  }\r
\r
  float boost = 0.0;\r
  for (int i = 0; i < \${MAX_PULSES}; i++) {\r
    vec4 wave = uPulses[i];\r
    if (wave.z <= 0.0) continue;\r
    float x = (depth - wave.x) / wave.y;\r
    boost += wave.z * exp(-x * x);\r
  }\r
  float light = (rayLight * (1.0 + boost) + glowLight) * reveal;\r
\r
  if (uNoise > 0.0) {\r
    float n = fract(sin(dot(coord * 0.02 + uTime * 0.1, vec2(12.9898, 78.233))) * 43758.5453123);\r
    light *= 1.0 - uNoise + uNoise * n;\r
  }\r
\r
  float near = clamp(1.2 - distance / (uResolution.y / uScale), 0.0, 1.0);\r
  vec3 tint = mix(vec3(0.9), vec3(0.1, 0.3, 0.5) + near * vec3(0.8, 0.6, 0.5), uAtmosphere);\r
  float gray = dot(tint, vec3(0.299, 0.587, 0.114));\r
  vec3 hue = max(mix(vec3(gray), tint, uSaturation), 0.0) * uColor;\r
\r
  float grain = (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;\r
  if (uLight > 0.5) {\r
    vec3 color = hue * light;\r
    float energy = max(color.r, max(color.g, color.b));\r
    vec3 tone = clamp(1.0 - (1.0 - hue / max(max(hue.r, max(hue.g, hue.b)), 1e-4)) * 1.8, 0.0, 1.0);\r
    float warm = clamp((min(tone.r, tone.g) - tone.b) * 2.0, 0.0, 1.0);\r
    vec3 ink = tone * (mix(0.66, 0.94, warm) - 0.1 * smoothstep(0.4, 1.2, energy));\r
    float density = clamp(0.82 * (1.0 - exp(-1.5 * energy * energy)) * uOpacity + grain, 0.0, 1.0);\r
    fragColor = vec4(ink * density, density);\r
    return;\r
  }\r
  float level = light < 0.75 ? light : 0.75 + 0.25 * (1.0 - exp(-(light - 0.75) / 0.25));\r
  float top = max(hue.r, max(hue.g, hue.b));\r
  hue = mix(hue, vec3(top), smoothstep(0.8, 1.0, level) * 0.45);\r
  vec3 shown = clamp(hue * level, 0.0, 1.0) * level;\r
  fragColor = vec4(clamp(shown + grain, 0.0, level) * uOpacity, level * uOpacity);\r
}\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const parseColor = (value: string): number[] | null => {\r
  const text = String(value || '').trim();\r
  const hex = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text);\r
  if (hex) {\r
    const full = hex[1].length === 3 ? hex[1].replace(/./g, digit => digit + digit) : hex[1];\r
    return [0, 2, 4].map(index => parseInt(full.slice(index, index + 2), 16) / 255);\r
  }\r
  const rgb = /^rgba?\\(\\s*([\\d.]+)[\\s,]+([\\d.]+)[\\s,]+([\\d.]+)/i.exec(text);\r
  if (rgb) return [rgb[1], rgb[2], rgb[3]].map(channel => clamp(parseFloat(channel) / 255, 0, 1));\r
  return null;\r
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
const smoother = (t: number) => {\r
  const x = clamp(t, 0, 1);\r
  return x * x * x * (x * (x * 6 - 15) + 10);\r
};\r
\r
const LightRays = ({\r
  raysOrigin = 'top-center',\r
  raysColor = '#ffffff',\r
  raysSpeed = 1,\r
  lightSpread = 0.5,\r
  rayLength = 3,\r
  rayDensity = 1,\r
  tilt = 0,\r
  raySharpness = 0.35,\r
  glow = 0.6,\r
  haze = 0.25,\r
  atmosphere = 1,\r
  intensity = 1,\r
  pulsating = false,\r
  fadeDistance = 1,\r
  saturation = 1,\r
  followMouse = true,\r
  mouseInfluence = 0.1,\r
  cursorShadow = true,\r
  clickPulse = true,\r
  noiseAmount = 0,\r
  distortion = 0,\r
  intro = true,\r
  lightMode = false,\r
  opacity = 1,\r
  maxDevicePixelRatio = 2,\r
  className = '',\r
  style\r
}: LightRaysProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const [generation, setGeneration] = useState(0);\r
\r
  const settings: Settings = {\r
    origin: ORIGINS[raysOrigin] || ORIGINS['top-center'],\r
    color: parseColor(raysColor) || [1, 1, 1],\r
    speed: Math.max(0, raysSpeed),\r
    spread: Math.max(0.001, lightSpread),\r
    length: Math.max(0.01, rayLength),\r
    density: clamp(rayDensity, 0.1, 6),\r
    tilt: (clamp(tilt, -90, 90) * Math.PI) / 180,\r
    sharpness: clamp(raySharpness, 0, 1),\r
    glow: Math.max(0, glow),\r
    haze: clamp(haze, 0, 1),\r
    atmosphere: clamp(atmosphere, 0, 1),\r
    intensity: Math.max(0, intensity),\r
    pulsating,\r
    fade: Math.max(0.01, fadeDistance),\r
    saturation: Math.max(0, saturation),\r
    follow: followMouse,\r
    influence: clamp(mouseInfluence, 0, 1),\r
    cursorShadow,\r
    clickPulse,\r
    noise: clamp(noiseAmount, 0, 1),\r
    distortion,\r
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
    const pointer = { x: 0.5, y: 0.5, inside: false, seen: false };\r
    const aim = { x: 0.5, y: 0.5 };\r
    const shade = { x: 0.5, y: 0.5, presence: 0 };\r
    const pulses: { age: number }[] = [];\r
    const pulseData = new Float32Array(MAX_PULSES * 4);\r
    let time = 0;\r
    let opening = settingsRef.current.intro && !reduced && generation === 0 ? 0 : 1;\r
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
      const detail = s.density * (0.35 + 0.65 * s.sharpness);\r
      const sampling = Math.max(clamp(0.35 + 0.3 * detail, 0.5, 2), s.noise > 0 ? 1 : 0);\r
      const ratio = Math.min(\r
        window.devicePixelRatio || 1,\r
        s.maxRatio,\r
        sampling,\r
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
    const frame = (now: number) => {\r
      raf = 0;\r
      if (lost) return;\r
      const s = settingsRef.current;\r
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05);\r
      last = Math.max(last, now);\r
      time += dt * s.speed * (reduced ? 0.35 : 1);\r
      if (opening < 1) opening = Math.min(1, opening + dt / 1.8);\r
\r
      const steer = 1 - Math.exp(-dt / 0.2);\r
      const aimX = s.follow && pointer.seen ? pointer.x : 0.5;\r
      const aimY = s.follow && pointer.seen ? pointer.y : 0.5;\r
      aim.x += (aimX - aim.x) * steer;\r
      aim.y += (aimY - aim.y) * steer;\r
      const glide = 1 - Math.exp(-dt / 0.08);\r
      shade.x += (pointer.x - shade.x) * glide;\r
      shade.y += (pointer.y - shade.y) * glide;\r
      const shading = pointer.inside && s.cursorShadow && !reduced;\r
      shade.presence += ((shading ? 1 : 0) - shade.presence) * (1 - Math.exp(-dt / (shading ? 0.25 : 0.5)));\r
\r
      for (let index = pulses.length - 1; index >= 0; index--) {\r
        pulses[index].age += dt;\r
        if (pulses[index].age >= 2) pulses.splice(index, 1);\r
      }\r
      pulseData.fill(0);\r
      pulses.forEach((pulse, index) => {\r
        const t = pulse.age;\r
        pulseData[index * 4] = 0.05 + t * 1.05;\r
        pulseData[index * 4 + 1] = 0.14 + t * 0.14;\r
        pulseData[index * 4 + 2] = 0.9 * smoother(t / 0.15) * (1 - smoother(t / 2));\r
      });\r
\r
      const width = size.width;\r
      const height = size.height;\r
      const sourceX = s.origin.anchor[0] * width;\r
      const sourceY = s.origin.anchor[1] * height;\r
      const cos = Math.cos(s.tilt);\r
      const sin = Math.sin(s.tilt);\r
      let dirX = s.origin.dir[0] * cos - s.origin.dir[1] * sin;\r
      let dirY = s.origin.dir[0] * sin + s.origin.dir[1] * cos;\r
      if (s.follow && s.influence > 0) {\r
        const mx = aim.x * width - sourceX;\r
        const my = aim.y * height - sourceY;\r
        const ml = Math.hypot(mx, my) || 1;\r
        const bx = dirX + (mx / ml - dirX) * s.influence;\r
        const by = dirY + (my / ml - dirY) * s.influence;\r
        const bl = Math.hypot(bx, by) || 1;\r
        dirX = bx / bl;\r
        dirY = by / bl;\r
      }\r
      const eased = 1 - Math.pow(1 - opening, 3);\r
\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.useProgram(shader.program);\r
      gl.bindVertexArray(vao);\r
      const u = shader.uniforms;\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(u.uScale, size.ratio);\r
      gl.uniform1f(u.uTime, time);\r
      gl.uniform2f(u.uSource, sourceX, sourceY);\r
      gl.uniform2f(u.uAim, dirX, dirY);\r
      gl.uniform1f(u.uReach, Math.max(width, height));\r
      gl.uniform3f(u.uColor, s.color[0], s.color[1], s.color[2]);\r
      gl.uniform1f(u.uSpread, s.spread);\r
      gl.uniform1f(u.uLength, s.length);\r
      gl.uniform1f(u.uFade, s.fade);\r
      gl.uniform1f(u.uSaturation, s.saturation);\r
      gl.uniform1f(u.uPulsating, s.pulsating ? 1 : 0);\r
      gl.uniform1f(u.uNoise, s.noise);\r
      gl.uniform1f(u.uDistortion, s.distortion);\r
      gl.uniform1f(u.uDensity, s.density);\r
      gl.uniform1f(u.uSharpness, s.sharpness);\r
      gl.uniform1f(u.uGlow, s.glow);\r
      gl.uniform1f(u.uHaze, s.haze);\r
      gl.uniform1f(u.uAtmosphere, s.atmosphere);\r
      gl.uniform1f(u.uIntensity, s.intensity);\r
      gl.uniform4f(u.uShadow, shade.x * width, shade.y * height, shade.presence, 16);\r
      gl.uniform4fv(u.uPulses, pulseData);\r
      gl.uniform2f(u.uIntro, eased * 2.6, smoother(opening / 0.5));\r
      gl.uniform1f(u.uLight, s.light ? 1 : 0);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      const settling =\r
        Math.abs(aim.x - aimX) > 1e-4 ||\r
        Math.abs(aim.y - aimY) > 1e-4 ||\r
        (shade.presence > 1e-3 && Math.abs(shade.x - pointer.x) + Math.abs(shade.y - pointer.y) > 1e-4) ||\r
        Math.abs((shading ? 1 : 0) - shade.presence) > 1e-3 ||\r
        pulses.length > 0;\r
      const busy = s.speed > 0 || opening < 1 || settling;\r
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
        x: (event.clientX - rect.left) / Math.max(1, rect.width),\r
        y: (event.clientY - rect.top) / Math.max(1, rect.height),\r
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
      if (!pointer.inside && spot.inside) {\r
        shade.x = spot.x;\r
        shade.y = spot.y;\r
      }\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = spot.inside;\r
      pointer.seen = true;\r
      wake();\r
    };\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      const spot = locate(event);\r
      if (!spot.inside || !s.clickPulse || reduced) return;\r
      pulses.push({ age: 0 });\r
      if (pulses.length > MAX_PULSES) pulses.shift();\r
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
    <div ref={containerRef} className={\`light-rays\${className ? \` \${className}\` : ''}\`} style={style}>\r
      <canvas ref={canvasRef} className="light-rays__canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default LightRays;\r
`,o=`'use client';\r
\r
import { useEffect, useRef, useState, type CSSProperties } from 'react';\r
\r
export type RaysOrigin =\r
  | 'top-center'\r
  | 'top-left'\r
  | 'top-right'\r
  | 'right'\r
  | 'left'\r
  | 'bottom-center'\r
  | 'bottom-right'\r
  | 'bottom-left';\r
\r
export interface LightRaysProps {\r
  raysOrigin?: RaysOrigin;\r
  raysColor?: string;\r
  raysSpeed?: number;\r
  lightSpread?: number;\r
  rayLength?: number;\r
  rayDensity?: number;\r
  tilt?: number;\r
  raySharpness?: number;\r
  glow?: number;\r
  haze?: number;\r
  atmosphere?: number;\r
  intensity?: number;\r
  pulsating?: boolean;\r
  fadeDistance?: number;\r
  saturation?: number;\r
  followMouse?: boolean;\r
  mouseInfluence?: number;\r
  cursorShadow?: boolean;\r
  clickPulse?: boolean;\r
  noiseAmount?: number;\r
  distortion?: number;\r
  intro?: boolean;\r
  lightMode?: boolean;\r
  opacity?: number;\r
  maxDevicePixelRatio?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Origin {\r
  anchor: number[];\r
  dir: number[];\r
}\r
\r
interface Settings {\r
  origin: Origin;\r
  color: number[];\r
  speed: number;\r
  spread: number;\r
  length: number;\r
  density: number;\r
  tilt: number;\r
  sharpness: number;\r
  glow: number;\r
  haze: number;\r
  atmosphere: number;\r
  intensity: number;\r
  pulsating: boolean;\r
  fade: number;\r
  saturation: number;\r
  follow: boolean;\r
  influence: number;\r
  cursorShadow: boolean;\r
  clickPulse: boolean;\r
  noise: number;\r
  distortion: number;\r
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
const MAX_PULSES = 4;\r
\r
const ORIGINS: Record<RaysOrigin, Origin> = {\r
  'top-left': { anchor: [0, -0.2], dir: [0, 1] },\r
  'top-center': { anchor: [0.5, -0.2], dir: [0, 1] },\r
  'top-right': { anchor: [1, -0.2], dir: [0, 1] },\r
  left: { anchor: [-0.2, 0.5], dir: [1, 0] },\r
  right: { anchor: [1.2, 0.5], dir: [-1, 0] },\r
  'bottom-left': { anchor: [0, 1.2], dir: [0, -1] },\r
  'bottom-center': { anchor: [0.5, 1.2], dir: [0, -1] },\r
  'bottom-right': { anchor: [1, 1.2], dir: [0, -1] }\r
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
uniform float uScale;\r
uniform float uTime;\r
uniform vec2 uSource;\r
uniform vec2 uAim;\r
uniform float uReach;\r
uniform vec3 uColor;\r
uniform float uSpread;\r
uniform float uLength;\r
uniform float uFade;\r
uniform float uSaturation;\r
uniform float uPulsating;\r
uniform float uNoise;\r
uniform float uDistortion;\r
uniform float uDensity;\r
uniform float uSharpness;\r
uniform float uGlow;\r
uniform float uHaze;\r
uniform float uAtmosphere;\r
uniform float uIntensity;\r
uniform vec4 uShadow;\r
uniform vec4 uPulses[\${MAX_PULSES}];\r
uniform vec2 uIntro;\r
uniform float uLight;\r
uniform float uOpacity;\r
out vec4 fragColor;\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
float valueNoise(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = p - i;\r
  vec2 w = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);\r
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), w.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), w.x), w.y);\r
}\r
\r
float shape(float strength, float width) {\r
  float edge = max(mix(0.5, 0.08, uSharpness), width);\r
  return mix(strength, smoothstep(0.62 - edge, 0.62 + edge, strength), uSharpness);\r
}\r
\r
void main() {\r
  vec2 coord = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y) / uScale;\r
  vec2 delta = coord - uSource;\r
  float distance = length(delta);\r
  vec2 dir = delta / max(distance, 1e-4);\r
  float cosAngle = dot(dir, uAim);\r
  float angle = cosAngle + uDistortion * sin(uTime * 2.0 + distance * 0.02) * 0.2;\r
  float slope = fwidth(angle);\r
  float depth = distance / uReach;\r
\r
  float source = exp(-depth * depth * 9.0) * 0.9 + exp(-depth * 3.2) * 0.25;\r
  float glowLight = uGlow * source * smoothstep(-0.2, 0.6, cosAngle);\r
  float spread = pow(max(angle, 0.0), 1.0 / uSpread);\r
  float lengthFalloff = clamp(1.0 - distance / (uReach * uLength), 0.0, 1.0);\r
  float fadeFalloff = clamp(1.0 - distance / (uReach * uFade), 0.5, 1.0);\r
  float envelope = spread * lengthFalloff * fadeFalloff;\r
  float reveal = uIntensity * uIntro.y * (1.0 - smoothstep(uIntro.x - 0.35, uIntro.x, depth));\r
  if ((envelope * 1.6 + glowLight) * reveal < 0.0015) {\r
    fragColor = vec4(0.0);\r
    return;\r
  }\r
\r
  float phaseA = angle * 36.2214 * uDensity + uTime * 1.5;\r
  float phaseB = -angle * 21.11349 * uDensity + uTime * 1.5;\r
  float phaseC = angle * 22.3991 * uDensity + uTime * 1.1;\r
  float phaseD = -angle * 18.0234 * uDensity + uTime * 1.1;\r
  float strengthA = clamp(0.75 + 0.15 * sin(phaseA) + 0.2 * cos(phaseB), 0.0, 1.0);\r
  float strengthB = clamp(0.75 + 0.15 * sin(phaseC) + 0.2 * cos(phaseD), 0.0, 1.0);\r
  float widthA = abs(0.15 * 36.2214 * cos(phaseA) + 0.2 * 21.11349 * sin(phaseB)) * uDensity * slope;\r
  float widthB = abs(0.15 * 22.3991 * cos(phaseC) + 0.2 * 18.0234 * sin(phaseD)) * uDensity * slope;\r
  float pulseA = uPulsating > 0.5 ? 0.8 + 0.2 * sin(uTime * 4.5) : 1.0;\r
  float pulseB = uPulsating > 0.5 ? 0.8 + 0.2 * sin(uTime * 3.3) : 1.0;\r
  float rayLight = envelope * (0.5 * shape(strengthA, widthA) * pulseA + 0.4 * shape(strengthB, widthB) * pulseB);\r
\r
  if (uHaze > 0.0) {\r
    float around = atan(uAim.x * dir.y - uAim.y * dir.x, cosAngle);\r
    vec2 drift = vec2(around * 2.2 + uTime * 0.035, depth * 2.6 - uTime * 0.11);\r
    float fog = 0.65 * valueNoise(drift * vec2(3.0, 1.0)) + 0.35 * valueNoise(drift * vec2(7.0, 2.3) + 4.1);\r
    rayLight *= mix(1.0, 0.25 + 1.2 * fog, uHaze);\r
  }\r
\r
  if (uShadow.z > 0.0) {\r
    vec2 toCursor = uShadow.xy - uSource;\r
    float cursorDistance = length(toCursor);\r
    float along = dot(delta, toCursor) / max(cursorDistance * cursorDistance, 1e-4);\r
    float side = abs(delta.x * toCursor.y - delta.y * toCursor.x) / max(cursorDistance, 1e-4);\r
    float trail = max(along - 1.0, 0.0);\r
    float width = uShadow.w * along + 0.22 * trail * cursorDistance;\r
    float behind = smoothstep(0.97, 1.25, along) * exp(-trail * 1.1);\r
    float shade = (1.0 - smoothstep(width * 0.3, width * 1.6, side)) * behind;\r
    rayLight *= 1.0 - uShadow.z * 0.62 * shade;\r
  }\r
\r
  float boost = 0.0;\r
  for (int i = 0; i < \${MAX_PULSES}; i++) {\r
    vec4 wave = uPulses[i];\r
    if (wave.z <= 0.0) continue;\r
    float x = (depth - wave.x) / wave.y;\r
    boost += wave.z * exp(-x * x);\r
  }\r
  float light = (rayLight * (1.0 + boost) + glowLight) * reveal;\r
\r
  if (uNoise > 0.0) {\r
    float n = fract(sin(dot(coord * 0.02 + uTime * 0.1, vec2(12.9898, 78.233))) * 43758.5453123);\r
    light *= 1.0 - uNoise + uNoise * n;\r
  }\r
\r
  float near = clamp(1.2 - distance / (uResolution.y / uScale), 0.0, 1.0);\r
  vec3 tint = mix(vec3(0.9), vec3(0.1, 0.3, 0.5) + near * vec3(0.8, 0.6, 0.5), uAtmosphere);\r
  float gray = dot(tint, vec3(0.299, 0.587, 0.114));\r
  vec3 hue = max(mix(vec3(gray), tint, uSaturation), 0.0) * uColor;\r
\r
  float grain = (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;\r
  if (uLight > 0.5) {\r
    vec3 color = hue * light;\r
    float energy = max(color.r, max(color.g, color.b));\r
    vec3 tone = clamp(1.0 - (1.0 - hue / max(max(hue.r, max(hue.g, hue.b)), 1e-4)) * 1.8, 0.0, 1.0);\r
    float warm = clamp((min(tone.r, tone.g) - tone.b) * 2.0, 0.0, 1.0);\r
    vec3 ink = tone * (mix(0.66, 0.94, warm) - 0.1 * smoothstep(0.4, 1.2, energy));\r
    float density = clamp(0.82 * (1.0 - exp(-1.5 * energy * energy)) * uOpacity + grain, 0.0, 1.0);\r
    fragColor = vec4(ink * density, density);\r
    return;\r
  }\r
  float level = light < 0.75 ? light : 0.75 + 0.25 * (1.0 - exp(-(light - 0.75) / 0.25));\r
  float top = max(hue.r, max(hue.g, hue.b));\r
  hue = mix(hue, vec3(top), smoothstep(0.8, 1.0, level) * 0.45);\r
  vec3 shown = clamp(hue * level, 0.0, 1.0) * level;\r
  fragColor = vec4(clamp(shown + grain, 0.0, level) * uOpacity, level * uOpacity);\r
}\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const parseColor = (value: string): number[] | null => {\r
  const text = String(value || '').trim();\r
  const hex = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text);\r
  if (hex) {\r
    const full = hex[1].length === 3 ? hex[1].replace(/./g, digit => digit + digit) : hex[1];\r
    return [0, 2, 4].map(index => parseInt(full.slice(index, index + 2), 16) / 255);\r
  }\r
  const rgb = /^rgba?\\(\\s*([\\d.]+)[\\s,]+([\\d.]+)[\\s,]+([\\d.]+)/i.exec(text);\r
  if (rgb) return [rgb[1], rgb[2], rgb[3]].map(channel => clamp(parseFloat(channel) / 255, 0, 1));\r
  return null;\r
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
const smoother = (t: number) => {\r
  const x = clamp(t, 0, 1);\r
  return x * x * x * (x * (x * 6 - 15) + 10);\r
};\r
\r
const LightRays = ({\r
  raysOrigin = 'top-center',\r
  raysColor = '#ffffff',\r
  raysSpeed = 1,\r
  lightSpread = 0.5,\r
  rayLength = 3,\r
  rayDensity = 1,\r
  tilt = 0,\r
  raySharpness = 0.35,\r
  glow = 0.6,\r
  haze = 0.25,\r
  atmosphere = 1,\r
  intensity = 1,\r
  pulsating = false,\r
  fadeDistance = 1,\r
  saturation = 1,\r
  followMouse = true,\r
  mouseInfluence = 0.1,\r
  cursorShadow = true,\r
  clickPulse = true,\r
  noiseAmount = 0,\r
  distortion = 0,\r
  intro = true,\r
  lightMode = false,\r
  opacity = 1,\r
  maxDevicePixelRatio = 2,\r
  className = '',\r
  style\r
}: LightRaysProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const [generation, setGeneration] = useState(0);\r
\r
  const settings: Settings = {\r
    origin: ORIGINS[raysOrigin] || ORIGINS['top-center'],\r
    color: parseColor(raysColor) || [1, 1, 1],\r
    speed: Math.max(0, raysSpeed),\r
    spread: Math.max(0.001, lightSpread),\r
    length: Math.max(0.01, rayLength),\r
    density: clamp(rayDensity, 0.1, 6),\r
    tilt: (clamp(tilt, -90, 90) * Math.PI) / 180,\r
    sharpness: clamp(raySharpness, 0, 1),\r
    glow: Math.max(0, glow),\r
    haze: clamp(haze, 0, 1),\r
    atmosphere: clamp(atmosphere, 0, 1),\r
    intensity: Math.max(0, intensity),\r
    pulsating,\r
    fade: Math.max(0.01, fadeDistance),\r
    saturation: Math.max(0, saturation),\r
    follow: followMouse,\r
    influence: clamp(mouseInfluence, 0, 1),\r
    cursorShadow,\r
    clickPulse,\r
    noise: clamp(noiseAmount, 0, 1),\r
    distortion,\r
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
    const pointer = { x: 0.5, y: 0.5, inside: false, seen: false };\r
    const aim = { x: 0.5, y: 0.5 };\r
    const shade = { x: 0.5, y: 0.5, presence: 0 };\r
    const pulses: { age: number }[] = [];\r
    const pulseData = new Float32Array(MAX_PULSES * 4);\r
    let time = 0;\r
    let opening = settingsRef.current.intro && !reduced && generation === 0 ? 0 : 1;\r
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
      const detail = s.density * (0.35 + 0.65 * s.sharpness);\r
      const sampling = Math.max(clamp(0.35 + 0.3 * detail, 0.5, 2), s.noise > 0 ? 1 : 0);\r
      const ratio = Math.min(\r
        window.devicePixelRatio || 1,\r
        s.maxRatio,\r
        sampling,\r
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
    const frame = (now: number) => {\r
      raf = 0;\r
      if (lost) return;\r
      const s = settingsRef.current;\r
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05);\r
      last = Math.max(last, now);\r
      time += dt * s.speed * (reduced ? 0.35 : 1);\r
      if (opening < 1) opening = Math.min(1, opening + dt / 1.8);\r
\r
      const steer = 1 - Math.exp(-dt / 0.2);\r
      const aimX = s.follow && pointer.seen ? pointer.x : 0.5;\r
      const aimY = s.follow && pointer.seen ? pointer.y : 0.5;\r
      aim.x += (aimX - aim.x) * steer;\r
      aim.y += (aimY - aim.y) * steer;\r
      const glide = 1 - Math.exp(-dt / 0.08);\r
      shade.x += (pointer.x - shade.x) * glide;\r
      shade.y += (pointer.y - shade.y) * glide;\r
      const shading = pointer.inside && s.cursorShadow && !reduced;\r
      shade.presence += ((shading ? 1 : 0) - shade.presence) * (1 - Math.exp(-dt / (shading ? 0.25 : 0.5)));\r
\r
      for (let index = pulses.length - 1; index >= 0; index--) {\r
        pulses[index].age += dt;\r
        if (pulses[index].age >= 2) pulses.splice(index, 1);\r
      }\r
      pulseData.fill(0);\r
      pulses.forEach((pulse, index) => {\r
        const t = pulse.age;\r
        pulseData[index * 4] = 0.05 + t * 1.05;\r
        pulseData[index * 4 + 1] = 0.14 + t * 0.14;\r
        pulseData[index * 4 + 2] = 0.9 * smoother(t / 0.15) * (1 - smoother(t / 2));\r
      });\r
\r
      const width = size.width;\r
      const height = size.height;\r
      const sourceX = s.origin.anchor[0] * width;\r
      const sourceY = s.origin.anchor[1] * height;\r
      const cos = Math.cos(s.tilt);\r
      const sin = Math.sin(s.tilt);\r
      let dirX = s.origin.dir[0] * cos - s.origin.dir[1] * sin;\r
      let dirY = s.origin.dir[0] * sin + s.origin.dir[1] * cos;\r
      if (s.follow && s.influence > 0) {\r
        const mx = aim.x * width - sourceX;\r
        const my = aim.y * height - sourceY;\r
        const ml = Math.hypot(mx, my) || 1;\r
        const bx = dirX + (mx / ml - dirX) * s.influence;\r
        const by = dirY + (my / ml - dirY) * s.influence;\r
        const bl = Math.hypot(bx, by) || 1;\r
        dirX = bx / bl;\r
        dirY = by / bl;\r
      }\r
      const eased = 1 - Math.pow(1 - opening, 3);\r
\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.useProgram(shader.program);\r
      gl.bindVertexArray(vao);\r
      const u = shader.uniforms;\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(u.uScale, size.ratio);\r
      gl.uniform1f(u.uTime, time);\r
      gl.uniform2f(u.uSource, sourceX, sourceY);\r
      gl.uniform2f(u.uAim, dirX, dirY);\r
      gl.uniform1f(u.uReach, Math.max(width, height));\r
      gl.uniform3f(u.uColor, s.color[0], s.color[1], s.color[2]);\r
      gl.uniform1f(u.uSpread, s.spread);\r
      gl.uniform1f(u.uLength, s.length);\r
      gl.uniform1f(u.uFade, s.fade);\r
      gl.uniform1f(u.uSaturation, s.saturation);\r
      gl.uniform1f(u.uPulsating, s.pulsating ? 1 : 0);\r
      gl.uniform1f(u.uNoise, s.noise);\r
      gl.uniform1f(u.uDistortion, s.distortion);\r
      gl.uniform1f(u.uDensity, s.density);\r
      gl.uniform1f(u.uSharpness, s.sharpness);\r
      gl.uniform1f(u.uGlow, s.glow);\r
      gl.uniform1f(u.uHaze, s.haze);\r
      gl.uniform1f(u.uAtmosphere, s.atmosphere);\r
      gl.uniform1f(u.uIntensity, s.intensity);\r
      gl.uniform4f(u.uShadow, shade.x * width, shade.y * height, shade.presence, 16);\r
      gl.uniform4fv(u.uPulses, pulseData);\r
      gl.uniform2f(u.uIntro, eased * 2.6, smoother(opening / 0.5));\r
      gl.uniform1f(u.uLight, s.light ? 1 : 0);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      const settling =\r
        Math.abs(aim.x - aimX) > 1e-4 ||\r
        Math.abs(aim.y - aimY) > 1e-4 ||\r
        (shade.presence > 1e-3 && Math.abs(shade.x - pointer.x) + Math.abs(shade.y - pointer.y) > 1e-4) ||\r
        Math.abs((shading ? 1 : 0) - shade.presence) > 1e-3 ||\r
        pulses.length > 0;\r
      const busy = s.speed > 0 || opening < 1 || settling;\r
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
        x: (event.clientX - rect.left) / Math.max(1, rect.width),\r
        y: (event.clientY - rect.top) / Math.max(1, rect.height),\r
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
      if (!pointer.inside && spot.inside) {\r
        shade.x = spot.x;\r
        shade.y = spot.y;\r
      }\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = spot.inside;\r
      pointer.seen = true;\r
      wake();\r
    };\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      const spot = locate(event);\r
      if (!spot.inside || !s.clickPulse || reduced) return;\r
      pulses.push({ age: 0 });\r
      if (pulses.length > MAX_PULSES) pulses.shift();\r
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
export default LightRays;\r
`,i={dependencies:"",usage:`import LightRays from './LightRays';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <LightRays
    raysOrigin="top-center"
    raysColor="#ffffff"
    raysSpeed={1}
    lightSpread={0.5}
    rayLength={3}
    glow={0.6}
    haze={0.25}
    followMouse
    mouseInfluence={0.1}
  />
</div>`,code:n,css:r,tailwind:e,tsCode:t,tsTailwind:o};export{i as lightRays};
