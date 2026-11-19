const n=`'use client';\r
\r
import { useEffect, useRef, useState } from 'react';\r
import './SoftAurora.css';\r
\r
const MAX_PULSES = 4;\r
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
uniform float uFlow;\r
uniform float uHue;\r
uniform float uScale;\r
uniform float uBrightness;\r
uniform vec3 uColor1;\r
uniform vec3 uColor2;\r
uniform float uNoiseFreq;\r
uniform float uNoiseAmp;\r
uniform float uBandHeight;\r
uniform float uBandSpread;\r
uniform float uOctaveDecay;\r
uniform float uLayerOffset;\r
uniform vec2 uShift;\r
uniform vec4 uCursor;\r
uniform vec4 uPulses[\${MAX_PULSES}];\r
uniform float uSpectrum;\r
uniform float uTilt;\r
uniform vec3 uIntro;\r
uniform float uLightMode;\r
uniform float uOpacity;\r
out vec4 fragColor;\r
\r
#define TAU 6.28318\r
\r
vec3 gradientHash(vec3 p) {\r
  p = vec3(\r
    dot(p, vec3(127.1, 311.7, 234.6)),\r
    dot(p, vec3(269.5, 183.3, 198.3)),\r
    dot(p, vec3(169.5, 283.3, 156.9))\r
  );\r
  vec3 h = fract(sin(p) * 43758.5453123);\r
  float phi = acos(2.0 * h.x - 1.0);\r
  float theta = TAU * h.y;\r
  return vec3(cos(theta) * sin(phi), sin(theta) * cos(phi), cos(phi));\r
}\r
\r
float quinticSmooth(float t) {\r
  float t2 = t * t;\r
  float t3 = t * t2;\r
  return 6.0 * t3 * t2 - 15.0 * t2 * t2 + 10.0 * t3;\r
}\r
\r
vec3 cosineGradient(float t, vec3 a, vec3 b, vec3 c, vec3 d) {\r
  return a + b * cos(TAU * (c * t + d));\r
}\r
\r
float perlin3D(float amplitude, float frequency, float px, float py, float pz) {\r
  float x = px * frequency;\r
  float y = py * frequency;\r
\r
  float fx = floor(x);\r
  float fy = floor(y);\r
  float fz = floor(pz);\r
  float cx = ceil(x);\r
  float cy = ceil(y);\r
  float cz = ceil(pz);\r
\r
  vec3 g000 = gradientHash(vec3(fx, fy, fz));\r
  vec3 g100 = gradientHash(vec3(cx, fy, fz));\r
  vec3 g010 = gradientHash(vec3(fx, cy, fz));\r
  vec3 g110 = gradientHash(vec3(cx, cy, fz));\r
  vec3 g001 = gradientHash(vec3(fx, fy, cz));\r
  vec3 g101 = gradientHash(vec3(cx, fy, cz));\r
  vec3 g011 = gradientHash(vec3(fx, cy, cz));\r
  vec3 g111 = gradientHash(vec3(cx, cy, cz));\r
\r
  float d000 = dot(g000, vec3(x - fx, y - fy, pz - fz));\r
  float d100 = dot(g100, vec3(x - cx, y - fy, pz - fz));\r
  float d010 = dot(g010, vec3(x - fx, y - cy, pz - fz));\r
  float d110 = dot(g110, vec3(x - cx, y - cy, pz - fz));\r
  float d001 = dot(g001, vec3(x - fx, y - fy, pz - cz));\r
  float d101 = dot(g101, vec3(x - cx, y - fy, pz - cz));\r
  float d011 = dot(g011, vec3(x - fx, y - cy, pz - cz));\r
  float d111 = dot(g111, vec3(x - cx, y - cy, pz - cz));\r
\r
  float sx = quinticSmooth(x - fx);\r
  float sy = quinticSmooth(y - fy);\r
  float sz = quinticSmooth(pz - fz);\r
\r
  float lx00 = mix(d000, d100, sx);\r
  float lx10 = mix(d010, d110, sx);\r
  float lx01 = mix(d001, d101, sx);\r
  float lx11 = mix(d011, d111, sx);\r
\r
  float ly0 = mix(lx00, lx10, sy);\r
  float ly1 = mix(lx01, lx11, sy);\r
\r
  return amplitude * mix(ly0, ly1, sz);\r
}\r
\r
float auroraGlow(float t, vec2 uv, float bend) {\r
  float noiseVal = 0.0;\r
  float freq = uNoiseFreq;\r
  float amp = uNoiseAmp;\r
  vec2 samplePos = uv * uScale;\r
\r
  for (float i = 0.0; i < 3.0; i += 1.0) {\r
    noiseVal += perlin3D(amp, freq, samplePos.x, samplePos.y, t);\r
    amp *= uOctaveDecay;\r
    freq *= 2.0;\r
  }\r
\r
  float yBand = uv.y * 10.0 - (uBandHeight + bend) * 10.0;\r
  return 0.3 * max(exp(uBandSpread * (1.0 - 1.1 * uIntro.y * abs(noiseVal * uIntro.z + yBand))), 0.0);\r
}\r
\r
vec2 turn(vec2 p, vec2 center) {\r
  float c = cos(uTilt);\r
  float s = sin(uTilt);\r
  vec2 d = p - center;\r
  return center + vec2(c * d.x - s * d.y, s * d.x + c * d.y);\r
}\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uResolution.xy;\r
  vec2 center = vec2(0.5 * uResolution.x / uResolution.y, 0.5);\r
  vec2 screen = turn(gl_FragCoord.xy / uResolution.y, center);\r
  vec2 cursor = turn(uCursor.xy, center);\r
  vec2 field = screen + uShift;\r
  float t = 0.4 * uFlow;\r
\r
  float reach = exp(-pow((screen.x - cursor.x) / 0.32, 2.0)) * uCursor.z;\r
  float gap = cursor.y + uShift.y - uBandHeight;\r
  float near = exp(-gap * gap / 0.16);\r
  float bend = reach * gap * near * 0.55;\r
\r
  float pulse = 0.0;\r
  for (int i = 0; i < \${MAX_PULSES}; i++) {\r
    vec4 wave = uPulses[i];\r
    if (wave.z <= 0.0) continue;\r
    float x = (abs(screen.x - turn(wave.xy, center).x) - wave.w * 0.55) / (0.1 + wave.w * 0.06);\r
    pulse += wave.z * exp(-x * x);\r
  }\r
  float boost = (1.0 + reach * near * 0.25 + pulse * 0.65) * uIntro.x;\r
\r
  float glow1 = auroraGlow(t, field, bend) * boost;\r
  float glow2 = auroraGlow(t + uLayerOffset, field, bend) * boost;\r
  vec3 gradient1 = mix(vec3(1.0), cosineGradient(uv.x + uHue * 0.2, vec3(0.5), vec3(0.5), vec3(1.0), vec3(0.3, 0.20, 0.20)), uSpectrum);\r
  vec3 gradient2 = mix(vec3(1.0), cosineGradient(uv.x + uHue * 0.1, vec3(0.5), vec3(0.5), vec3(2.0, 1.0, 0.0), vec3(0.5, 0.20, 0.25)), uSpectrum);\r
\r
  vec3 col = 0.99 * glow1 * gradient1 * uColor1;\r
  col += 0.99 * glow2 * gradient2 * uColor2;\r
  col *= uBrightness;\r
\r
  float grain = (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;\r
  if (uLightMode > 0.5) {\r
    float energy = max(col.r, max(col.g, col.b));\r
    vec3 hue = clamp(col / max(energy, 1e-4), 0.0, 1.0);\r
    vec3 average = (glow1 * uColor1 + glow2 * uColor2) / max(glow1 + glow2, 1e-4);\r
    float top = max(average.r, max(average.g, average.b));\r
    float spread = top - min(average.r, min(average.g, average.b));\r
    float core = smoothstep(0.55, 1.6, energy);\r
    float depth = 1.25 + 0.45 * core;\r
    vec3 tint = mix(average * 0.82, pow(average / max(top, 1e-4), vec3(depth + 0.6)), smoothstep(0.04, 0.2, spread));\r
    float vivid = smoothstep(0.12, 0.55, 1.0 - min(hue.r, min(hue.g, hue.b))) * smoothstep(0.04, 0.2, spread);\r
    vec3 ink = mix(tint, pow(hue, vec3(depth)), vivid) * mix(0.93, 0.8, core);\r
    float density = 0.88 * (1.0 - exp(-1.9 * pow(energy, 1.7)));\r
    density = clamp(density * uOpacity + grain, 0.0, 1.0);\r
    fragColor = vec4(ink * density, density);\r
  } else {\r
    float alpha = clamp(length(col), 0.0, 1.0);\r
    vec3 color = clamp(col, 0.0, 1.0);\r
    fragColor = vec4(clamp(color * alpha + grain, 0.0, alpha) * uOpacity, alpha * uOpacity);\r
  }\r
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
const SoftAurora = ({\r
  speed = 0.6,\r
  scale = 1.5,\r
  brightness = 1.0,\r
  color1 = '#f7f7f7',\r
  color2 = '#e100ff',\r
  noiseFrequency = 2.5,\r
  noiseAmplitude = 1.0,\r
  bandHeight = 0.5,\r
  bandSpread = 1.0,\r
  octaveDecay = 0.1,\r
  layerOffset = 0,\r
  colorSpeed = 1.0,\r
  spectrum = 1,\r
  tilt = 0,\r
  enableMouseInteraction = true,\r
  mouseInfluence = 0.25,\r
  clickPulse = true,\r
  intro = true,\r
  lightMode = false,\r
  opacity = 1,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const [generation, setGeneration] = useState(0);\r
\r
  const settings = {\r
    speed: Math.max(0, speed),\r
    scale: Math.max(0.01, scale),\r
    brightness: Math.max(0, brightness),\r
    color1: parseColor(color1) || [0.969, 0.969, 0.969],\r
    color2: parseColor(color2) || [0.882, 0, 1],\r
    noiseFrequency: Math.max(0.01, noiseFrequency),\r
    noiseAmplitude: Math.max(0, noiseAmplitude),\r
    bandHeight,\r
    bandSpread: Math.max(0, bandSpread),\r
    octaveDecay: Math.max(0, octaveDecay),\r
    layerOffset,\r
    colorSpeed,\r
    spectrum: clamp(spectrum, 0, 1),\r
    tilt: (clamp(tilt, -90, 90) * Math.PI) / 180,\r
    mouse: enableMouseInteraction,\r
    influence: Math.max(0, mouseInfluence),\r
    clickPulse,\r
    intro,\r
    light: lightMode,\r
    opacity: clamp(opacity, 0, 1)\r
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
    const pointer = { x: 0.5, y: 0.5, inside: false };\r
    const mouse = { x: 0.5, y: 0.5, presence: 0 };\r
    const pulses = [];\r
    const pulseData = new Float32Array(MAX_PULSES * 4);\r
    let flow = 0;\r
    let hue = 0;\r
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
      const ratio = clamp(0.35 + 0.04 * s.noiseFrequency * s.scale, 0.5, 1);\r
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
    const frame = now => {\r
      raf = 0;\r
      if (lost) return;\r
      const s = settingsRef.current;\r
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05);\r
      last = Math.max(last, now);\r
      const pace = reduced ? 0.35 : 1;\r
      flow += dt * s.speed * pace;\r
      hue += dt * s.speed * s.colorSpeed * pace;\r
      if (opening < 1) opening = Math.min(1, opening + dt / 2);\r
\r
      const tracking = s.mouse && pointer.inside;\r
      const follow = 1 - Math.exp(-dt / 0.325);\r
      mouse.x += ((tracking ? pointer.x : 0.5) - mouse.x) * follow;\r
      mouse.y += ((tracking ? pointer.y : 0.5) - mouse.y) * follow;\r
      mouse.presence += ((tracking ? 1 : 0) - mouse.presence) * (1 - Math.exp(-dt / (tracking ? 0.45 : 0.8)));\r
\r
      for (let index = pulses.length - 1; index >= 0; index--) {\r
        pulses[index].age += dt;\r
        if (pulses[index].age >= 2.6) pulses.splice(index, 1);\r
      }\r
      pulseData.fill(0);\r
      pulses.forEach((pulse, index) => {\r
        pulseData[index * 4] = pulse.x;\r
        pulseData[index * 4 + 1] = pulse.y;\r
        pulseData[index * 4 + 2] = smoother(pulse.age / 0.18) * (1 - smoother((pulse.age - 0.18) / 2.42));\r
        pulseData[index * 4 + 3] = pulse.age;\r
      });\r
\r
      const eased = 1 - Math.pow(1 - opening, 3);\r
      const aspect = size.width / size.height;\r
      const strength = Math.min(1, s.influence * 4) * mouse.presence;\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.useProgram(shader.program);\r
      gl.bindVertexArray(vao);\r
      const u = shader.uniforms;\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(u.uFlow, flow);\r
      gl.uniform1f(u.uHue, hue);\r
      gl.uniform1f(u.uScale, s.scale);\r
      gl.uniform1f(u.uBrightness, s.brightness);\r
      gl.uniform3f(u.uColor1, s.color1[0], s.color1[1], s.color1[2]);\r
      gl.uniform3f(u.uColor2, s.color2[0], s.color2[1], s.color2[2]);\r
      gl.uniform1f(u.uNoiseFreq, s.noiseFrequency);\r
      gl.uniform1f(u.uNoiseAmp, s.noiseAmplitude);\r
      gl.uniform1f(u.uBandHeight, s.bandHeight);\r
      gl.uniform1f(u.uBandSpread, s.bandSpread);\r
      gl.uniform1f(u.uOctaveDecay, s.octaveDecay);\r
      gl.uniform1f(u.uLayerOffset, s.layerOffset);\r
      gl.uniform2f(\r
        u.uShift,\r
        (mouse.x - 0.5) * s.influence * (s.mouse ? 1 : 0),\r
        (mouse.y - 0.5) * s.influence * (s.mouse ? 1 : 0)\r
      );\r
      gl.uniform4f(u.uCursor, mouse.x * aspect, mouse.y, strength, 0);\r
      gl.uniform4fv(u.uPulses, pulseData);\r
      gl.uniform1f(u.uSpectrum, s.spectrum);\r
      gl.uniform1f(u.uTilt, s.tilt);\r
      gl.uniform3f(u.uIntro, smoother(opening / 0.7), 1 + 3 * (1 - eased) * (1 - eased), 0.25 + 0.75 * eased);\r
      gl.uniform1f(u.uLightMode, s.light ? 1 : 0);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      const settling =\r
        Math.abs(mouse.x - (tracking ? pointer.x : 0.5)) > 1e-4 ||\r
        Math.abs(mouse.y - (tracking ? pointer.y : 0.5)) > 1e-4 ||\r
        Math.abs((tracking ? 1 : 0) - mouse.presence) > 1e-3 ||\r
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
        y: 1 - (event.clientY - rect.top) / Math.max(1, rect.height),\r
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
      if (!spot.inside || !s.clickPulse || reduced) return;\r
      pulses.push({ x: spot.x * (size.width / size.height), y: spot.y, age: 0 });\r
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
    <div ref={containerRef} className={\`soft-aurora\${className ? \` \${className}\` : ''}\`} style={style}>\r
      <canvas ref={canvasRef} className="soft-aurora__canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default SoftAurora;\r
`,e=`.soft-aurora {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.soft-aurora__canvas {\r
  position: absolute;\r
  inset: 0;\r
  display: block;\r
  width: 100%;\r
  height: 100%;\r
}\r
`,r=`'use client';\r
\r
import { useEffect, useRef, useState } from 'react';\r
\r
const MAX_PULSES = 4;\r
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
uniform float uFlow;\r
uniform float uHue;\r
uniform float uScale;\r
uniform float uBrightness;\r
uniform vec3 uColor1;\r
uniform vec3 uColor2;\r
uniform float uNoiseFreq;\r
uniform float uNoiseAmp;\r
uniform float uBandHeight;\r
uniform float uBandSpread;\r
uniform float uOctaveDecay;\r
uniform float uLayerOffset;\r
uniform vec2 uShift;\r
uniform vec4 uCursor;\r
uniform vec4 uPulses[\${MAX_PULSES}];\r
uniform float uSpectrum;\r
uniform float uTilt;\r
uniform vec3 uIntro;\r
uniform float uLightMode;\r
uniform float uOpacity;\r
out vec4 fragColor;\r
\r
#define TAU 6.28318\r
\r
vec3 gradientHash(vec3 p) {\r
  p = vec3(\r
    dot(p, vec3(127.1, 311.7, 234.6)),\r
    dot(p, vec3(269.5, 183.3, 198.3)),\r
    dot(p, vec3(169.5, 283.3, 156.9))\r
  );\r
  vec3 h = fract(sin(p) * 43758.5453123);\r
  float phi = acos(2.0 * h.x - 1.0);\r
  float theta = TAU * h.y;\r
  return vec3(cos(theta) * sin(phi), sin(theta) * cos(phi), cos(phi));\r
}\r
\r
float quinticSmooth(float t) {\r
  float t2 = t * t;\r
  float t3 = t * t2;\r
  return 6.0 * t3 * t2 - 15.0 * t2 * t2 + 10.0 * t3;\r
}\r
\r
vec3 cosineGradient(float t, vec3 a, vec3 b, vec3 c, vec3 d) {\r
  return a + b * cos(TAU * (c * t + d));\r
}\r
\r
float perlin3D(float amplitude, float frequency, float px, float py, float pz) {\r
  float x = px * frequency;\r
  float y = py * frequency;\r
\r
  float fx = floor(x);\r
  float fy = floor(y);\r
  float fz = floor(pz);\r
  float cx = ceil(x);\r
  float cy = ceil(y);\r
  float cz = ceil(pz);\r
\r
  vec3 g000 = gradientHash(vec3(fx, fy, fz));\r
  vec3 g100 = gradientHash(vec3(cx, fy, fz));\r
  vec3 g010 = gradientHash(vec3(fx, cy, fz));\r
  vec3 g110 = gradientHash(vec3(cx, cy, fz));\r
  vec3 g001 = gradientHash(vec3(fx, fy, cz));\r
  vec3 g101 = gradientHash(vec3(cx, fy, cz));\r
  vec3 g011 = gradientHash(vec3(fx, cy, cz));\r
  vec3 g111 = gradientHash(vec3(cx, cy, cz));\r
\r
  float d000 = dot(g000, vec3(x - fx, y - fy, pz - fz));\r
  float d100 = dot(g100, vec3(x - cx, y - fy, pz - fz));\r
  float d010 = dot(g010, vec3(x - fx, y - cy, pz - fz));\r
  float d110 = dot(g110, vec3(x - cx, y - cy, pz - fz));\r
  float d001 = dot(g001, vec3(x - fx, y - fy, pz - cz));\r
  float d101 = dot(g101, vec3(x - cx, y - fy, pz - cz));\r
  float d011 = dot(g011, vec3(x - fx, y - cy, pz - cz));\r
  float d111 = dot(g111, vec3(x - cx, y - cy, pz - cz));\r
\r
  float sx = quinticSmooth(x - fx);\r
  float sy = quinticSmooth(y - fy);\r
  float sz = quinticSmooth(pz - fz);\r
\r
  float lx00 = mix(d000, d100, sx);\r
  float lx10 = mix(d010, d110, sx);\r
  float lx01 = mix(d001, d101, sx);\r
  float lx11 = mix(d011, d111, sx);\r
\r
  float ly0 = mix(lx00, lx10, sy);\r
  float ly1 = mix(lx01, lx11, sy);\r
\r
  return amplitude * mix(ly0, ly1, sz);\r
}\r
\r
float auroraGlow(float t, vec2 uv, float bend) {\r
  float noiseVal = 0.0;\r
  float freq = uNoiseFreq;\r
  float amp = uNoiseAmp;\r
  vec2 samplePos = uv * uScale;\r
\r
  for (float i = 0.0; i < 3.0; i += 1.0) {\r
    noiseVal += perlin3D(amp, freq, samplePos.x, samplePos.y, t);\r
    amp *= uOctaveDecay;\r
    freq *= 2.0;\r
  }\r
\r
  float yBand = uv.y * 10.0 - (uBandHeight + bend) * 10.0;\r
  return 0.3 * max(exp(uBandSpread * (1.0 - 1.1 * uIntro.y * abs(noiseVal * uIntro.z + yBand))), 0.0);\r
}\r
\r
vec2 turn(vec2 p, vec2 center) {\r
  float c = cos(uTilt);\r
  float s = sin(uTilt);\r
  vec2 d = p - center;\r
  return center + vec2(c * d.x - s * d.y, s * d.x + c * d.y);\r
}\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uResolution.xy;\r
  vec2 center = vec2(0.5 * uResolution.x / uResolution.y, 0.5);\r
  vec2 screen = turn(gl_FragCoord.xy / uResolution.y, center);\r
  vec2 cursor = turn(uCursor.xy, center);\r
  vec2 field = screen + uShift;\r
  float t = 0.4 * uFlow;\r
\r
  float reach = exp(-pow((screen.x - cursor.x) / 0.32, 2.0)) * uCursor.z;\r
  float gap = cursor.y + uShift.y - uBandHeight;\r
  float near = exp(-gap * gap / 0.16);\r
  float bend = reach * gap * near * 0.55;\r
\r
  float pulse = 0.0;\r
  for (int i = 0; i < \${MAX_PULSES}; i++) {\r
    vec4 wave = uPulses[i];\r
    if (wave.z <= 0.0) continue;\r
    float x = (abs(screen.x - turn(wave.xy, center).x) - wave.w * 0.55) / (0.1 + wave.w * 0.06);\r
    pulse += wave.z * exp(-x * x);\r
  }\r
  float boost = (1.0 + reach * near * 0.25 + pulse * 0.65) * uIntro.x;\r
\r
  float glow1 = auroraGlow(t, field, bend) * boost;\r
  float glow2 = auroraGlow(t + uLayerOffset, field, bend) * boost;\r
  vec3 gradient1 = mix(vec3(1.0), cosineGradient(uv.x + uHue * 0.2, vec3(0.5), vec3(0.5), vec3(1.0), vec3(0.3, 0.20, 0.20)), uSpectrum);\r
  vec3 gradient2 = mix(vec3(1.0), cosineGradient(uv.x + uHue * 0.1, vec3(0.5), vec3(0.5), vec3(2.0, 1.0, 0.0), vec3(0.5, 0.20, 0.25)), uSpectrum);\r
\r
  vec3 col = 0.99 * glow1 * gradient1 * uColor1;\r
  col += 0.99 * glow2 * gradient2 * uColor2;\r
  col *= uBrightness;\r
\r
  float grain = (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;\r
  if (uLightMode > 0.5) {\r
    float energy = max(col.r, max(col.g, col.b));\r
    vec3 hue = clamp(col / max(energy, 1e-4), 0.0, 1.0);\r
    vec3 average = (glow1 * uColor1 + glow2 * uColor2) / max(glow1 + glow2, 1e-4);\r
    float top = max(average.r, max(average.g, average.b));\r
    float spread = top - min(average.r, min(average.g, average.b));\r
    float core = smoothstep(0.55, 1.6, energy);\r
    float depth = 1.25 + 0.45 * core;\r
    vec3 tint = mix(average * 0.82, pow(average / max(top, 1e-4), vec3(depth + 0.6)), smoothstep(0.04, 0.2, spread));\r
    float vivid = smoothstep(0.12, 0.55, 1.0 - min(hue.r, min(hue.g, hue.b))) * smoothstep(0.04, 0.2, spread);\r
    vec3 ink = mix(tint, pow(hue, vec3(depth)), vivid) * mix(0.93, 0.8, core);\r
    float density = 0.88 * (1.0 - exp(-1.9 * pow(energy, 1.7)));\r
    density = clamp(density * uOpacity + grain, 0.0, 1.0);\r
    fragColor = vec4(ink * density, density);\r
  } else {\r
    float alpha = clamp(length(col), 0.0, 1.0);\r
    vec3 color = clamp(col, 0.0, 1.0);\r
    fragColor = vec4(clamp(color * alpha + grain, 0.0, alpha) * uOpacity, alpha * uOpacity);\r
  }\r
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
const SoftAurora = ({\r
  speed = 0.6,\r
  scale = 1.5,\r
  brightness = 1.0,\r
  color1 = '#f7f7f7',\r
  color2 = '#e100ff',\r
  noiseFrequency = 2.5,\r
  noiseAmplitude = 1.0,\r
  bandHeight = 0.5,\r
  bandSpread = 1.0,\r
  octaveDecay = 0.1,\r
  layerOffset = 0,\r
  colorSpeed = 1.0,\r
  spectrum = 1,\r
  tilt = 0,\r
  enableMouseInteraction = true,\r
  mouseInfluence = 0.25,\r
  clickPulse = true,\r
  intro = true,\r
  lightMode = false,\r
  opacity = 1,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const [generation, setGeneration] = useState(0);\r
\r
  const settings = {\r
    speed: Math.max(0, speed),\r
    scale: Math.max(0.01, scale),\r
    brightness: Math.max(0, brightness),\r
    color1: parseColor(color1) || [0.969, 0.969, 0.969],\r
    color2: parseColor(color2) || [0.882, 0, 1],\r
    noiseFrequency: Math.max(0.01, noiseFrequency),\r
    noiseAmplitude: Math.max(0, noiseAmplitude),\r
    bandHeight,\r
    bandSpread: Math.max(0, bandSpread),\r
    octaveDecay: Math.max(0, octaveDecay),\r
    layerOffset,\r
    colorSpeed,\r
    spectrum: clamp(spectrum, 0, 1),\r
    tilt: (clamp(tilt, -90, 90) * Math.PI) / 180,\r
    mouse: enableMouseInteraction,\r
    influence: Math.max(0, mouseInfluence),\r
    clickPulse,\r
    intro,\r
    light: lightMode,\r
    opacity: clamp(opacity, 0, 1)\r
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
    const pointer = { x: 0.5, y: 0.5, inside: false };\r
    const mouse = { x: 0.5, y: 0.5, presence: 0 };\r
    const pulses = [];\r
    const pulseData = new Float32Array(MAX_PULSES * 4);\r
    let flow = 0;\r
    let hue = 0;\r
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
      const ratio = clamp(0.35 + 0.04 * s.noiseFrequency * s.scale, 0.5, 1);\r
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
    const frame = now => {\r
      raf = 0;\r
      if (lost) return;\r
      const s = settingsRef.current;\r
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05);\r
      last = Math.max(last, now);\r
      const pace = reduced ? 0.35 : 1;\r
      flow += dt * s.speed * pace;\r
      hue += dt * s.speed * s.colorSpeed * pace;\r
      if (opening < 1) opening = Math.min(1, opening + dt / 2);\r
\r
      const tracking = s.mouse && pointer.inside;\r
      const follow = 1 - Math.exp(-dt / 0.325);\r
      mouse.x += ((tracking ? pointer.x : 0.5) - mouse.x) * follow;\r
      mouse.y += ((tracking ? pointer.y : 0.5) - mouse.y) * follow;\r
      mouse.presence += ((tracking ? 1 : 0) - mouse.presence) * (1 - Math.exp(-dt / (tracking ? 0.45 : 0.8)));\r
\r
      for (let index = pulses.length - 1; index >= 0; index--) {\r
        pulses[index].age += dt;\r
        if (pulses[index].age >= 2.6) pulses.splice(index, 1);\r
      }\r
      pulseData.fill(0);\r
      pulses.forEach((pulse, index) => {\r
        pulseData[index * 4] = pulse.x;\r
        pulseData[index * 4 + 1] = pulse.y;\r
        pulseData[index * 4 + 2] = smoother(pulse.age / 0.18) * (1 - smoother((pulse.age - 0.18) / 2.42));\r
        pulseData[index * 4 + 3] = pulse.age;\r
      });\r
\r
      const eased = 1 - Math.pow(1 - opening, 3);\r
      const aspect = size.width / size.height;\r
      const strength = Math.min(1, s.influence * 4) * mouse.presence;\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.useProgram(shader.program);\r
      gl.bindVertexArray(vao);\r
      const u = shader.uniforms;\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(u.uFlow, flow);\r
      gl.uniform1f(u.uHue, hue);\r
      gl.uniform1f(u.uScale, s.scale);\r
      gl.uniform1f(u.uBrightness, s.brightness);\r
      gl.uniform3f(u.uColor1, s.color1[0], s.color1[1], s.color1[2]);\r
      gl.uniform3f(u.uColor2, s.color2[0], s.color2[1], s.color2[2]);\r
      gl.uniform1f(u.uNoiseFreq, s.noiseFrequency);\r
      gl.uniform1f(u.uNoiseAmp, s.noiseAmplitude);\r
      gl.uniform1f(u.uBandHeight, s.bandHeight);\r
      gl.uniform1f(u.uBandSpread, s.bandSpread);\r
      gl.uniform1f(u.uOctaveDecay, s.octaveDecay);\r
      gl.uniform1f(u.uLayerOffset, s.layerOffset);\r
      gl.uniform2f(\r
        u.uShift,\r
        (mouse.x - 0.5) * s.influence * (s.mouse ? 1 : 0),\r
        (mouse.y - 0.5) * s.influence * (s.mouse ? 1 : 0)\r
      );\r
      gl.uniform4f(u.uCursor, mouse.x * aspect, mouse.y, strength, 0);\r
      gl.uniform4fv(u.uPulses, pulseData);\r
      gl.uniform1f(u.uSpectrum, s.spectrum);\r
      gl.uniform1f(u.uTilt, s.tilt);\r
      gl.uniform3f(u.uIntro, smoother(opening / 0.7), 1 + 3 * (1 - eased) * (1 - eased), 0.25 + 0.75 * eased);\r
      gl.uniform1f(u.uLightMode, s.light ? 1 : 0);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      const settling =\r
        Math.abs(mouse.x - (tracking ? pointer.x : 0.5)) > 1e-4 ||\r
        Math.abs(mouse.y - (tracking ? pointer.y : 0.5)) > 1e-4 ||\r
        Math.abs((tracking ? 1 : 0) - mouse.presence) > 1e-3 ||\r
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
        y: 1 - (event.clientY - rect.top) / Math.max(1, rect.height),\r
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
      if (!spot.inside || !s.clickPulse || reduced) return;\r
      pulses.push({ x: spot.x * (size.width / size.height), y: spot.y, age: 0 });\r
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
    <div ref={containerRef} className={\`relative h-full w-full overflow-hidden \${className}\`.trim()} style={style}>\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default SoftAurora;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, useState, type CSSProperties } from 'react';\r
import './SoftAurora.css';\r
\r
export interface SoftAuroraProps {\r
  speed?: number;\r
  scale?: number;\r
  brightness?: number;\r
  color1?: string;\r
  color2?: string;\r
  noiseFrequency?: number;\r
  noiseAmplitude?: number;\r
  bandHeight?: number;\r
  bandSpread?: number;\r
  octaveDecay?: number;\r
  layerOffset?: number;\r
  colorSpeed?: number;\r
  spectrum?: number;\r
  tilt?: number;\r
  enableMouseInteraction?: boolean;\r
  mouseInfluence?: number;\r
  clickPulse?: boolean;\r
  intro?: boolean;\r
  lightMode?: boolean;\r
  opacity?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Settings {\r
  speed: number;\r
  scale: number;\r
  brightness: number;\r
  color1: number[];\r
  color2: number[];\r
  noiseFrequency: number;\r
  noiseAmplitude: number;\r
  bandHeight: number;\r
  bandSpread: number;\r
  octaveDecay: number;\r
  layerOffset: number;\r
  colorSpeed: number;\r
  spectrum: number;\r
  tilt: number;\r
  mouse: boolean;\r
  influence: number;\r
  clickPulse: boolean;\r
  intro: boolean;\r
  light: boolean;\r
  opacity: number;\r
}\r
\r
interface Program {\r
  program: WebGLProgram;\r
  uniforms: Record<string, WebGLUniformLocation | null>;\r
}\r
\r
interface Pulse {\r
  x: number;\r
  y: number;\r
  age: number;\r
}\r
\r
const MAX_PULSES = 4;\r
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
uniform float uFlow;\r
uniform float uHue;\r
uniform float uScale;\r
uniform float uBrightness;\r
uniform vec3 uColor1;\r
uniform vec3 uColor2;\r
uniform float uNoiseFreq;\r
uniform float uNoiseAmp;\r
uniform float uBandHeight;\r
uniform float uBandSpread;\r
uniform float uOctaveDecay;\r
uniform float uLayerOffset;\r
uniform vec2 uShift;\r
uniform vec4 uCursor;\r
uniform vec4 uPulses[\${MAX_PULSES}];\r
uniform float uSpectrum;\r
uniform float uTilt;\r
uniform vec3 uIntro;\r
uniform float uLightMode;\r
uniform float uOpacity;\r
out vec4 fragColor;\r
\r
#define TAU 6.28318\r
\r
vec3 gradientHash(vec3 p) {\r
  p = vec3(\r
    dot(p, vec3(127.1, 311.7, 234.6)),\r
    dot(p, vec3(269.5, 183.3, 198.3)),\r
    dot(p, vec3(169.5, 283.3, 156.9))\r
  );\r
  vec3 h = fract(sin(p) * 43758.5453123);\r
  float phi = acos(2.0 * h.x - 1.0);\r
  float theta = TAU * h.y;\r
  return vec3(cos(theta) * sin(phi), sin(theta) * cos(phi), cos(phi));\r
}\r
\r
float quinticSmooth(float t) {\r
  float t2 = t * t;\r
  float t3 = t * t2;\r
  return 6.0 * t3 * t2 - 15.0 * t2 * t2 + 10.0 * t3;\r
}\r
\r
vec3 cosineGradient(float t, vec3 a, vec3 b, vec3 c, vec3 d) {\r
  return a + b * cos(TAU * (c * t + d));\r
}\r
\r
float perlin3D(float amplitude, float frequency, float px, float py, float pz) {\r
  float x = px * frequency;\r
  float y = py * frequency;\r
\r
  float fx = floor(x);\r
  float fy = floor(y);\r
  float fz = floor(pz);\r
  float cx = ceil(x);\r
  float cy = ceil(y);\r
  float cz = ceil(pz);\r
\r
  vec3 g000 = gradientHash(vec3(fx, fy, fz));\r
  vec3 g100 = gradientHash(vec3(cx, fy, fz));\r
  vec3 g010 = gradientHash(vec3(fx, cy, fz));\r
  vec3 g110 = gradientHash(vec3(cx, cy, fz));\r
  vec3 g001 = gradientHash(vec3(fx, fy, cz));\r
  vec3 g101 = gradientHash(vec3(cx, fy, cz));\r
  vec3 g011 = gradientHash(vec3(fx, cy, cz));\r
  vec3 g111 = gradientHash(vec3(cx, cy, cz));\r
\r
  float d000 = dot(g000, vec3(x - fx, y - fy, pz - fz));\r
  float d100 = dot(g100, vec3(x - cx, y - fy, pz - fz));\r
  float d010 = dot(g010, vec3(x - fx, y - cy, pz - fz));\r
  float d110 = dot(g110, vec3(x - cx, y - cy, pz - fz));\r
  float d001 = dot(g001, vec3(x - fx, y - fy, pz - cz));\r
  float d101 = dot(g101, vec3(x - cx, y - fy, pz - cz));\r
  float d011 = dot(g011, vec3(x - fx, y - cy, pz - cz));\r
  float d111 = dot(g111, vec3(x - cx, y - cy, pz - cz));\r
\r
  float sx = quinticSmooth(x - fx);\r
  float sy = quinticSmooth(y - fy);\r
  float sz = quinticSmooth(pz - fz);\r
\r
  float lx00 = mix(d000, d100, sx);\r
  float lx10 = mix(d010, d110, sx);\r
  float lx01 = mix(d001, d101, sx);\r
  float lx11 = mix(d011, d111, sx);\r
\r
  float ly0 = mix(lx00, lx10, sy);\r
  float ly1 = mix(lx01, lx11, sy);\r
\r
  return amplitude * mix(ly0, ly1, sz);\r
}\r
\r
float auroraGlow(float t, vec2 uv, float bend) {\r
  float noiseVal = 0.0;\r
  float freq = uNoiseFreq;\r
  float amp = uNoiseAmp;\r
  vec2 samplePos = uv * uScale;\r
\r
  for (float i = 0.0; i < 3.0; i += 1.0) {\r
    noiseVal += perlin3D(amp, freq, samplePos.x, samplePos.y, t);\r
    amp *= uOctaveDecay;\r
    freq *= 2.0;\r
  }\r
\r
  float yBand = uv.y * 10.0 - (uBandHeight + bend) * 10.0;\r
  return 0.3 * max(exp(uBandSpread * (1.0 - 1.1 * uIntro.y * abs(noiseVal * uIntro.z + yBand))), 0.0);\r
}\r
\r
vec2 turn(vec2 p, vec2 center) {\r
  float c = cos(uTilt);\r
  float s = sin(uTilt);\r
  vec2 d = p - center;\r
  return center + vec2(c * d.x - s * d.y, s * d.x + c * d.y);\r
}\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uResolution.xy;\r
  vec2 center = vec2(0.5 * uResolution.x / uResolution.y, 0.5);\r
  vec2 screen = turn(gl_FragCoord.xy / uResolution.y, center);\r
  vec2 cursor = turn(uCursor.xy, center);\r
  vec2 field = screen + uShift;\r
  float t = 0.4 * uFlow;\r
\r
  float reach = exp(-pow((screen.x - cursor.x) / 0.32, 2.0)) * uCursor.z;\r
  float gap = cursor.y + uShift.y - uBandHeight;\r
  float near = exp(-gap * gap / 0.16);\r
  float bend = reach * gap * near * 0.55;\r
\r
  float pulse = 0.0;\r
  for (int i = 0; i < \${MAX_PULSES}; i++) {\r
    vec4 wave = uPulses[i];\r
    if (wave.z <= 0.0) continue;\r
    float x = (abs(screen.x - turn(wave.xy, center).x) - wave.w * 0.55) / (0.1 + wave.w * 0.06);\r
    pulse += wave.z * exp(-x * x);\r
  }\r
  float boost = (1.0 + reach * near * 0.25 + pulse * 0.65) * uIntro.x;\r
\r
  float glow1 = auroraGlow(t, field, bend) * boost;\r
  float glow2 = auroraGlow(t + uLayerOffset, field, bend) * boost;\r
  vec3 gradient1 = mix(vec3(1.0), cosineGradient(uv.x + uHue * 0.2, vec3(0.5), vec3(0.5), vec3(1.0), vec3(0.3, 0.20, 0.20)), uSpectrum);\r
  vec3 gradient2 = mix(vec3(1.0), cosineGradient(uv.x + uHue * 0.1, vec3(0.5), vec3(0.5), vec3(2.0, 1.0, 0.0), vec3(0.5, 0.20, 0.25)), uSpectrum);\r
\r
  vec3 col = 0.99 * glow1 * gradient1 * uColor1;\r
  col += 0.99 * glow2 * gradient2 * uColor2;\r
  col *= uBrightness;\r
\r
  float grain = (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;\r
  if (uLightMode > 0.5) {\r
    float energy = max(col.r, max(col.g, col.b));\r
    vec3 hue = clamp(col / max(energy, 1e-4), 0.0, 1.0);\r
    vec3 average = (glow1 * uColor1 + glow2 * uColor2) / max(glow1 + glow2, 1e-4);\r
    float top = max(average.r, max(average.g, average.b));\r
    float spread = top - min(average.r, min(average.g, average.b));\r
    float core = smoothstep(0.55, 1.6, energy);\r
    float depth = 1.25 + 0.45 * core;\r
    vec3 tint = mix(average * 0.82, pow(average / max(top, 1e-4), vec3(depth + 0.6)), smoothstep(0.04, 0.2, spread));\r
    float vivid = smoothstep(0.12, 0.55, 1.0 - min(hue.r, min(hue.g, hue.b))) * smoothstep(0.04, 0.2, spread);\r
    vec3 ink = mix(tint, pow(hue, vec3(depth)), vivid) * mix(0.93, 0.8, core);\r
    float density = 0.88 * (1.0 - exp(-1.9 * pow(energy, 1.7)));\r
    density = clamp(density * uOpacity + grain, 0.0, 1.0);\r
    fragColor = vec4(ink * density, density);\r
  } else {\r
    float alpha = clamp(length(col), 0.0, 1.0);\r
    vec3 color = clamp(col, 0.0, 1.0);\r
    fragColor = vec4(clamp(color * alpha + grain, 0.0, alpha) * uOpacity, alpha * uOpacity);\r
  }\r
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
const SoftAurora = ({\r
  speed = 0.6,\r
  scale = 1.5,\r
  brightness = 1.0,\r
  color1 = '#f7f7f7',\r
  color2 = '#e100ff',\r
  noiseFrequency = 2.5,\r
  noiseAmplitude = 1.0,\r
  bandHeight = 0.5,\r
  bandSpread = 1.0,\r
  octaveDecay = 0.1,\r
  layerOffset = 0,\r
  colorSpeed = 1.0,\r
  spectrum = 1,\r
  tilt = 0,\r
  enableMouseInteraction = true,\r
  mouseInfluence = 0.25,\r
  clickPulse = true,\r
  intro = true,\r
  lightMode = false,\r
  opacity = 1,\r
  className = '',\r
  style\r
}: SoftAuroraProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const [generation, setGeneration] = useState(0);\r
\r
  const settings: Settings = {\r
    speed: Math.max(0, speed),\r
    scale: Math.max(0.01, scale),\r
    brightness: Math.max(0, brightness),\r
    color1: parseColor(color1) || [0.969, 0.969, 0.969],\r
    color2: parseColor(color2) || [0.882, 0, 1],\r
    noiseFrequency: Math.max(0.01, noiseFrequency),\r
    noiseAmplitude: Math.max(0, noiseAmplitude),\r
    bandHeight,\r
    bandSpread: Math.max(0, bandSpread),\r
    octaveDecay: Math.max(0, octaveDecay),\r
    layerOffset,\r
    colorSpeed,\r
    spectrum: clamp(spectrum, 0, 1),\r
    tilt: (clamp(tilt, -90, 90) * Math.PI) / 180,\r
    mouse: enableMouseInteraction,\r
    influence: Math.max(0, mouseInfluence),\r
    clickPulse,\r
    intro,\r
    light: lightMode,\r
    opacity: clamp(opacity, 0, 1)\r
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
    const pointer = { x: 0.5, y: 0.5, inside: false };\r
    const mouse = { x: 0.5, y: 0.5, presence: 0 };\r
    const pulses: Pulse[] = [];\r
    const pulseData = new Float32Array(MAX_PULSES * 4);\r
    let flow = 0;\r
    let hue = 0;\r
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
      const ratio = clamp(0.35 + 0.04 * s.noiseFrequency * s.scale, 0.5, 1);\r
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
    const frame = (now: number) => {\r
      raf = 0;\r
      if (lost) return;\r
      const s = settingsRef.current;\r
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05);\r
      last = Math.max(last, now);\r
      const pace = reduced ? 0.35 : 1;\r
      flow += dt * s.speed * pace;\r
      hue += dt * s.speed * s.colorSpeed * pace;\r
      if (opening < 1) opening = Math.min(1, opening + dt / 2);\r
\r
      const tracking = s.mouse && pointer.inside;\r
      const follow = 1 - Math.exp(-dt / 0.325);\r
      mouse.x += ((tracking ? pointer.x : 0.5) - mouse.x) * follow;\r
      mouse.y += ((tracking ? pointer.y : 0.5) - mouse.y) * follow;\r
      mouse.presence += ((tracking ? 1 : 0) - mouse.presence) * (1 - Math.exp(-dt / (tracking ? 0.45 : 0.8)));\r
\r
      for (let index = pulses.length - 1; index >= 0; index--) {\r
        pulses[index].age += dt;\r
        if (pulses[index].age >= 2.6) pulses.splice(index, 1);\r
      }\r
      pulseData.fill(0);\r
      pulses.forEach((pulse, index) => {\r
        pulseData[index * 4] = pulse.x;\r
        pulseData[index * 4 + 1] = pulse.y;\r
        pulseData[index * 4 + 2] = smoother(pulse.age / 0.18) * (1 - smoother((pulse.age - 0.18) / 2.42));\r
        pulseData[index * 4 + 3] = pulse.age;\r
      });\r
\r
      const eased = 1 - Math.pow(1 - opening, 3);\r
      const aspect = size.width / size.height;\r
      const strength = Math.min(1, s.influence * 4) * mouse.presence;\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.useProgram(shader.program);\r
      gl.bindVertexArray(vao);\r
      const u = shader.uniforms;\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(u.uFlow, flow);\r
      gl.uniform1f(u.uHue, hue);\r
      gl.uniform1f(u.uScale, s.scale);\r
      gl.uniform1f(u.uBrightness, s.brightness);\r
      gl.uniform3f(u.uColor1, s.color1[0], s.color1[1], s.color1[2]);\r
      gl.uniform3f(u.uColor2, s.color2[0], s.color2[1], s.color2[2]);\r
      gl.uniform1f(u.uNoiseFreq, s.noiseFrequency);\r
      gl.uniform1f(u.uNoiseAmp, s.noiseAmplitude);\r
      gl.uniform1f(u.uBandHeight, s.bandHeight);\r
      gl.uniform1f(u.uBandSpread, s.bandSpread);\r
      gl.uniform1f(u.uOctaveDecay, s.octaveDecay);\r
      gl.uniform1f(u.uLayerOffset, s.layerOffset);\r
      gl.uniform2f(\r
        u.uShift,\r
        (mouse.x - 0.5) * s.influence * (s.mouse ? 1 : 0),\r
        (mouse.y - 0.5) * s.influence * (s.mouse ? 1 : 0)\r
      );\r
      gl.uniform4f(u.uCursor, mouse.x * aspect, mouse.y, strength, 0);\r
      gl.uniform4fv(u.uPulses, pulseData);\r
      gl.uniform1f(u.uSpectrum, s.spectrum);\r
      gl.uniform1f(u.uTilt, s.tilt);\r
      gl.uniform3f(u.uIntro, smoother(opening / 0.7), 1 + 3 * (1 - eased) * (1 - eased), 0.25 + 0.75 * eased);\r
      gl.uniform1f(u.uLightMode, s.light ? 1 : 0);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      const settling =\r
        Math.abs(mouse.x - (tracking ? pointer.x : 0.5)) > 1e-4 ||\r
        Math.abs(mouse.y - (tracking ? pointer.y : 0.5)) > 1e-4 ||\r
        Math.abs((tracking ? 1 : 0) - mouse.presence) > 1e-3 ||\r
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
        y: 1 - (event.clientY - rect.top) / Math.max(1, rect.height),\r
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
      if (!spot.inside || !s.clickPulse || reduced) return;\r
      pulses.push({ x: spot.x * (size.width / size.height), y: spot.y, age: 0 });\r
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
    <div ref={containerRef} className={\`soft-aurora\${className ? \` \${className}\` : ''}\`} style={style}>\r
      <canvas ref={canvasRef} className="soft-aurora__canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default SoftAurora;\r
`,o=`'use client';\r
\r
import { useEffect, useRef, useState, type CSSProperties } from 'react';\r
\r
export interface SoftAuroraProps {\r
  speed?: number;\r
  scale?: number;\r
  brightness?: number;\r
  color1?: string;\r
  color2?: string;\r
  noiseFrequency?: number;\r
  noiseAmplitude?: number;\r
  bandHeight?: number;\r
  bandSpread?: number;\r
  octaveDecay?: number;\r
  layerOffset?: number;\r
  colorSpeed?: number;\r
  spectrum?: number;\r
  tilt?: number;\r
  enableMouseInteraction?: boolean;\r
  mouseInfluence?: number;\r
  clickPulse?: boolean;\r
  intro?: boolean;\r
  lightMode?: boolean;\r
  opacity?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Settings {\r
  speed: number;\r
  scale: number;\r
  brightness: number;\r
  color1: number[];\r
  color2: number[];\r
  noiseFrequency: number;\r
  noiseAmplitude: number;\r
  bandHeight: number;\r
  bandSpread: number;\r
  octaveDecay: number;\r
  layerOffset: number;\r
  colorSpeed: number;\r
  spectrum: number;\r
  tilt: number;\r
  mouse: boolean;\r
  influence: number;\r
  clickPulse: boolean;\r
  intro: boolean;\r
  light: boolean;\r
  opacity: number;\r
}\r
\r
interface Program {\r
  program: WebGLProgram;\r
  uniforms: Record<string, WebGLUniformLocation | null>;\r
}\r
\r
interface Pulse {\r
  x: number;\r
  y: number;\r
  age: number;\r
}\r
\r
const MAX_PULSES = 4;\r
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
uniform float uFlow;\r
uniform float uHue;\r
uniform float uScale;\r
uniform float uBrightness;\r
uniform vec3 uColor1;\r
uniform vec3 uColor2;\r
uniform float uNoiseFreq;\r
uniform float uNoiseAmp;\r
uniform float uBandHeight;\r
uniform float uBandSpread;\r
uniform float uOctaveDecay;\r
uniform float uLayerOffset;\r
uniform vec2 uShift;\r
uniform vec4 uCursor;\r
uniform vec4 uPulses[\${MAX_PULSES}];\r
uniform float uSpectrum;\r
uniform float uTilt;\r
uniform vec3 uIntro;\r
uniform float uLightMode;\r
uniform float uOpacity;\r
out vec4 fragColor;\r
\r
#define TAU 6.28318\r
\r
vec3 gradientHash(vec3 p) {\r
  p = vec3(\r
    dot(p, vec3(127.1, 311.7, 234.6)),\r
    dot(p, vec3(269.5, 183.3, 198.3)),\r
    dot(p, vec3(169.5, 283.3, 156.9))\r
  );\r
  vec3 h = fract(sin(p) * 43758.5453123);\r
  float phi = acos(2.0 * h.x - 1.0);\r
  float theta = TAU * h.y;\r
  return vec3(cos(theta) * sin(phi), sin(theta) * cos(phi), cos(phi));\r
}\r
\r
float quinticSmooth(float t) {\r
  float t2 = t * t;\r
  float t3 = t * t2;\r
  return 6.0 * t3 * t2 - 15.0 * t2 * t2 + 10.0 * t3;\r
}\r
\r
vec3 cosineGradient(float t, vec3 a, vec3 b, vec3 c, vec3 d) {\r
  return a + b * cos(TAU * (c * t + d));\r
}\r
\r
float perlin3D(float amplitude, float frequency, float px, float py, float pz) {\r
  float x = px * frequency;\r
  float y = py * frequency;\r
\r
  float fx = floor(x);\r
  float fy = floor(y);\r
  float fz = floor(pz);\r
  float cx = ceil(x);\r
  float cy = ceil(y);\r
  float cz = ceil(pz);\r
\r
  vec3 g000 = gradientHash(vec3(fx, fy, fz));\r
  vec3 g100 = gradientHash(vec3(cx, fy, fz));\r
  vec3 g010 = gradientHash(vec3(fx, cy, fz));\r
  vec3 g110 = gradientHash(vec3(cx, cy, fz));\r
  vec3 g001 = gradientHash(vec3(fx, fy, cz));\r
  vec3 g101 = gradientHash(vec3(cx, fy, cz));\r
  vec3 g011 = gradientHash(vec3(fx, cy, cz));\r
  vec3 g111 = gradientHash(vec3(cx, cy, cz));\r
\r
  float d000 = dot(g000, vec3(x - fx, y - fy, pz - fz));\r
  float d100 = dot(g100, vec3(x - cx, y - fy, pz - fz));\r
  float d010 = dot(g010, vec3(x - fx, y - cy, pz - fz));\r
  float d110 = dot(g110, vec3(x - cx, y - cy, pz - fz));\r
  float d001 = dot(g001, vec3(x - fx, y - fy, pz - cz));\r
  float d101 = dot(g101, vec3(x - cx, y - fy, pz - cz));\r
  float d011 = dot(g011, vec3(x - fx, y - cy, pz - cz));\r
  float d111 = dot(g111, vec3(x - cx, y - cy, pz - cz));\r
\r
  float sx = quinticSmooth(x - fx);\r
  float sy = quinticSmooth(y - fy);\r
  float sz = quinticSmooth(pz - fz);\r
\r
  float lx00 = mix(d000, d100, sx);\r
  float lx10 = mix(d010, d110, sx);\r
  float lx01 = mix(d001, d101, sx);\r
  float lx11 = mix(d011, d111, sx);\r
\r
  float ly0 = mix(lx00, lx10, sy);\r
  float ly1 = mix(lx01, lx11, sy);\r
\r
  return amplitude * mix(ly0, ly1, sz);\r
}\r
\r
float auroraGlow(float t, vec2 uv, float bend) {\r
  float noiseVal = 0.0;\r
  float freq = uNoiseFreq;\r
  float amp = uNoiseAmp;\r
  vec2 samplePos = uv * uScale;\r
\r
  for (float i = 0.0; i < 3.0; i += 1.0) {\r
    noiseVal += perlin3D(amp, freq, samplePos.x, samplePos.y, t);\r
    amp *= uOctaveDecay;\r
    freq *= 2.0;\r
  }\r
\r
  float yBand = uv.y * 10.0 - (uBandHeight + bend) * 10.0;\r
  return 0.3 * max(exp(uBandSpread * (1.0 - 1.1 * uIntro.y * abs(noiseVal * uIntro.z + yBand))), 0.0);\r
}\r
\r
vec2 turn(vec2 p, vec2 center) {\r
  float c = cos(uTilt);\r
  float s = sin(uTilt);\r
  vec2 d = p - center;\r
  return center + vec2(c * d.x - s * d.y, s * d.x + c * d.y);\r
}\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uResolution.xy;\r
  vec2 center = vec2(0.5 * uResolution.x / uResolution.y, 0.5);\r
  vec2 screen = turn(gl_FragCoord.xy / uResolution.y, center);\r
  vec2 cursor = turn(uCursor.xy, center);\r
  vec2 field = screen + uShift;\r
  float t = 0.4 * uFlow;\r
\r
  float reach = exp(-pow((screen.x - cursor.x) / 0.32, 2.0)) * uCursor.z;\r
  float gap = cursor.y + uShift.y - uBandHeight;\r
  float near = exp(-gap * gap / 0.16);\r
  float bend = reach * gap * near * 0.55;\r
\r
  float pulse = 0.0;\r
  for (int i = 0; i < \${MAX_PULSES}; i++) {\r
    vec4 wave = uPulses[i];\r
    if (wave.z <= 0.0) continue;\r
    float x = (abs(screen.x - turn(wave.xy, center).x) - wave.w * 0.55) / (0.1 + wave.w * 0.06);\r
    pulse += wave.z * exp(-x * x);\r
  }\r
  float boost = (1.0 + reach * near * 0.25 + pulse * 0.65) * uIntro.x;\r
\r
  float glow1 = auroraGlow(t, field, bend) * boost;\r
  float glow2 = auroraGlow(t + uLayerOffset, field, bend) * boost;\r
  vec3 gradient1 = mix(vec3(1.0), cosineGradient(uv.x + uHue * 0.2, vec3(0.5), vec3(0.5), vec3(1.0), vec3(0.3, 0.20, 0.20)), uSpectrum);\r
  vec3 gradient2 = mix(vec3(1.0), cosineGradient(uv.x + uHue * 0.1, vec3(0.5), vec3(0.5), vec3(2.0, 1.0, 0.0), vec3(0.5, 0.20, 0.25)), uSpectrum);\r
\r
  vec3 col = 0.99 * glow1 * gradient1 * uColor1;\r
  col += 0.99 * glow2 * gradient2 * uColor2;\r
  col *= uBrightness;\r
\r
  float grain = (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;\r
  if (uLightMode > 0.5) {\r
    float energy = max(col.r, max(col.g, col.b));\r
    vec3 hue = clamp(col / max(energy, 1e-4), 0.0, 1.0);\r
    vec3 average = (glow1 * uColor1 + glow2 * uColor2) / max(glow1 + glow2, 1e-4);\r
    float top = max(average.r, max(average.g, average.b));\r
    float spread = top - min(average.r, min(average.g, average.b));\r
    float core = smoothstep(0.55, 1.6, energy);\r
    float depth = 1.25 + 0.45 * core;\r
    vec3 tint = mix(average * 0.82, pow(average / max(top, 1e-4), vec3(depth + 0.6)), smoothstep(0.04, 0.2, spread));\r
    float vivid = smoothstep(0.12, 0.55, 1.0 - min(hue.r, min(hue.g, hue.b))) * smoothstep(0.04, 0.2, spread);\r
    vec3 ink = mix(tint, pow(hue, vec3(depth)), vivid) * mix(0.93, 0.8, core);\r
    float density = 0.88 * (1.0 - exp(-1.9 * pow(energy, 1.7)));\r
    density = clamp(density * uOpacity + grain, 0.0, 1.0);\r
    fragColor = vec4(ink * density, density);\r
  } else {\r
    float alpha = clamp(length(col), 0.0, 1.0);\r
    vec3 color = clamp(col, 0.0, 1.0);\r
    fragColor = vec4(clamp(color * alpha + grain, 0.0, alpha) * uOpacity, alpha * uOpacity);\r
  }\r
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
const SoftAurora = ({\r
  speed = 0.6,\r
  scale = 1.5,\r
  brightness = 1.0,\r
  color1 = '#f7f7f7',\r
  color2 = '#e100ff',\r
  noiseFrequency = 2.5,\r
  noiseAmplitude = 1.0,\r
  bandHeight = 0.5,\r
  bandSpread = 1.0,\r
  octaveDecay = 0.1,\r
  layerOffset = 0,\r
  colorSpeed = 1.0,\r
  spectrum = 1,\r
  tilt = 0,\r
  enableMouseInteraction = true,\r
  mouseInfluence = 0.25,\r
  clickPulse = true,\r
  intro = true,\r
  lightMode = false,\r
  opacity = 1,\r
  className = '',\r
  style\r
}: SoftAuroraProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const [generation, setGeneration] = useState(0);\r
\r
  const settings: Settings = {\r
    speed: Math.max(0, speed),\r
    scale: Math.max(0.01, scale),\r
    brightness: Math.max(0, brightness),\r
    color1: parseColor(color1) || [0.969, 0.969, 0.969],\r
    color2: parseColor(color2) || [0.882, 0, 1],\r
    noiseFrequency: Math.max(0.01, noiseFrequency),\r
    noiseAmplitude: Math.max(0, noiseAmplitude),\r
    bandHeight,\r
    bandSpread: Math.max(0, bandSpread),\r
    octaveDecay: Math.max(0, octaveDecay),\r
    layerOffset,\r
    colorSpeed,\r
    spectrum: clamp(spectrum, 0, 1),\r
    tilt: (clamp(tilt, -90, 90) * Math.PI) / 180,\r
    mouse: enableMouseInteraction,\r
    influence: Math.max(0, mouseInfluence),\r
    clickPulse,\r
    intro,\r
    light: lightMode,\r
    opacity: clamp(opacity, 0, 1)\r
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
    const pointer = { x: 0.5, y: 0.5, inside: false };\r
    const mouse = { x: 0.5, y: 0.5, presence: 0 };\r
    const pulses: Pulse[] = [];\r
    const pulseData = new Float32Array(MAX_PULSES * 4);\r
    let flow = 0;\r
    let hue = 0;\r
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
      const ratio = clamp(0.35 + 0.04 * s.noiseFrequency * s.scale, 0.5, 1);\r
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
    const frame = (now: number) => {\r
      raf = 0;\r
      if (lost) return;\r
      const s = settingsRef.current;\r
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05);\r
      last = Math.max(last, now);\r
      const pace = reduced ? 0.35 : 1;\r
      flow += dt * s.speed * pace;\r
      hue += dt * s.speed * s.colorSpeed * pace;\r
      if (opening < 1) opening = Math.min(1, opening + dt / 2);\r
\r
      const tracking = s.mouse && pointer.inside;\r
      const follow = 1 - Math.exp(-dt / 0.325);\r
      mouse.x += ((tracking ? pointer.x : 0.5) - mouse.x) * follow;\r
      mouse.y += ((tracking ? pointer.y : 0.5) - mouse.y) * follow;\r
      mouse.presence += ((tracking ? 1 : 0) - mouse.presence) * (1 - Math.exp(-dt / (tracking ? 0.45 : 0.8)));\r
\r
      for (let index = pulses.length - 1; index >= 0; index--) {\r
        pulses[index].age += dt;\r
        if (pulses[index].age >= 2.6) pulses.splice(index, 1);\r
      }\r
      pulseData.fill(0);\r
      pulses.forEach((pulse, index) => {\r
        pulseData[index * 4] = pulse.x;\r
        pulseData[index * 4 + 1] = pulse.y;\r
        pulseData[index * 4 + 2] = smoother(pulse.age / 0.18) * (1 - smoother((pulse.age - 0.18) / 2.42));\r
        pulseData[index * 4 + 3] = pulse.age;\r
      });\r
\r
      const eased = 1 - Math.pow(1 - opening, 3);\r
      const aspect = size.width / size.height;\r
      const strength = Math.min(1, s.influence * 4) * mouse.presence;\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.useProgram(shader.program);\r
      gl.bindVertexArray(vao);\r
      const u = shader.uniforms;\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(u.uFlow, flow);\r
      gl.uniform1f(u.uHue, hue);\r
      gl.uniform1f(u.uScale, s.scale);\r
      gl.uniform1f(u.uBrightness, s.brightness);\r
      gl.uniform3f(u.uColor1, s.color1[0], s.color1[1], s.color1[2]);\r
      gl.uniform3f(u.uColor2, s.color2[0], s.color2[1], s.color2[2]);\r
      gl.uniform1f(u.uNoiseFreq, s.noiseFrequency);\r
      gl.uniform1f(u.uNoiseAmp, s.noiseAmplitude);\r
      gl.uniform1f(u.uBandHeight, s.bandHeight);\r
      gl.uniform1f(u.uBandSpread, s.bandSpread);\r
      gl.uniform1f(u.uOctaveDecay, s.octaveDecay);\r
      gl.uniform1f(u.uLayerOffset, s.layerOffset);\r
      gl.uniform2f(\r
        u.uShift,\r
        (mouse.x - 0.5) * s.influence * (s.mouse ? 1 : 0),\r
        (mouse.y - 0.5) * s.influence * (s.mouse ? 1 : 0)\r
      );\r
      gl.uniform4f(u.uCursor, mouse.x * aspect, mouse.y, strength, 0);\r
      gl.uniform4fv(u.uPulses, pulseData);\r
      gl.uniform1f(u.uSpectrum, s.spectrum);\r
      gl.uniform1f(u.uTilt, s.tilt);\r
      gl.uniform3f(u.uIntro, smoother(opening / 0.7), 1 + 3 * (1 - eased) * (1 - eased), 0.25 + 0.75 * eased);\r
      gl.uniform1f(u.uLightMode, s.light ? 1 : 0);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      const settling =\r
        Math.abs(mouse.x - (tracking ? pointer.x : 0.5)) > 1e-4 ||\r
        Math.abs(mouse.y - (tracking ? pointer.y : 0.5)) > 1e-4 ||\r
        Math.abs((tracking ? 1 : 0) - mouse.presence) > 1e-3 ||\r
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
        y: 1 - (event.clientY - rect.top) / Math.max(1, rect.height),\r
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
      if (!spot.inside || !s.clickPulse || reduced) return;\r
      pulses.push({ x: spot.x * (size.width / size.height), y: spot.y, age: 0 });\r
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
    <div ref={containerRef} className={\`relative h-full w-full overflow-hidden \${className}\`.trim()} style={style}>\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default SoftAurora;\r
`,a={dependencies:"",usage:`import SoftAurora from './SoftAurora';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <SoftAurora
    speed={0.6}
    scale={1.5}
    brightness={1}
    color1="#f7f7f7"
    color2="#e100ff"
    bandHeight={0.5}
    bandSpread={1}
    enableMouseInteraction
    mouseInfluence={0.25}
  />
</div>`,code:n,css:e,tailwind:r,tsCode:t,tsTailwind:o};export{a as softAurora};
