const r=`'use client';\r
\r
import { useEffect, useRef, useState } from 'react';\r
\r
import './LightPillar.css';\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const MARCH = \`#version 300 es\r
precision highp float;\r
uniform float uTime;\r
uniform vec2 uResolution;\r
uniform vec2 uTarget;\r
uniform vec2 uRot;\r
uniform vec2 uPillarRot;\r
uniform vec2 uWave;\r
uniform float uShift;\r
uniform float uPillarWidth;\r
uniform float uPillarHeight;\r
uniform int uDetail;\r
uniform vec3 uTopColor;\r
uniform vec3 uBottomColor;\r
uniform float uGlowAmount;\r
uniform float uWidthNorm;\r
out vec4 outColor;\r
\r
void main() {\r
  vec2 vUv = gl_FragCoord.xy / uTarget;\r
  vec2 uv = (vUv * 2.0 - 1.0) * vec2(uResolution.x / uResolution.y, 1.0);\r
  uv.x -= uShift;\r
  uv = vec2(uPillarRot.x * uv.x - uPillarRot.y * uv.y, uPillarRot.y * uv.x + uPillarRot.x * uv.y);\r
\r
  vec3 ro = vec3(0.0, 0.0, -10.0);\r
  vec3 rd = normalize(vec3(uv, 1.0));\r
  vec3 origin = vec3(uRot.x * ro.x - uRot.y * ro.z, ro.y, uRot.y * ro.x + uRot.x * ro.z);\r
  vec3 dir = vec3(uRot.x * rd.x - uRot.y * rd.z, rd.y, uRot.y * rd.x + uRot.x * rd.z);\r
\r
  float glow = 0.0;\r
  float lift = 0.0;\r
  float t = 0.1;\r
  for (int i = 0; i < 80; i++) {\r
    vec3 p = origin + dir * t;\r
    vec3 q = p;\r
    q.y = p.y * uPillarHeight + uTime;\r
\r
    float freq = 1.0;\r
    float amp = 1.0;\r
    for (int j = 0; j < 6; j++) {\r
      if (j >= uDetail) break;\r
      q.xz = vec2(uWave.y * q.x - uWave.x * q.z, uWave.x * q.x + uWave.y * q.z);\r
      q += cos(q.zxy * freq - uTime * float(j) * 2.0) * amp;\r
      freq *= 2.0;\r
      amp *= 0.5;\r
    }\r
\r
    float d = length(cos(q.xz)) - 0.2;\r
    float bound = length(p.xz) - uPillarWidth;\r
    float h = max(4.0 - abs(d - bound), 0.0);\r
    d = max(d, bound) + h * h * 0.015625;\r
    d = abs(d) * 0.15 + 0.01;\r
\r
    float weight = 1.0 / d;\r
    glow += weight;\r
    lift += clamp((15.0 - p.y) / 30.0, 0.0, 1.0) * weight;\r
\r
    t += d;\r
    if (t > 50.0) break;\r
  }\r
\r
  vec3 col = tanh((uBottomColor * glow + (uTopColor - uBottomColor) * lift) * uGlowAmount / uWidthNorm);\r
  float peak = max(col.r, max(col.g, col.b));\r
  outColor = vec4(col, smoothstep(0.62, 1.0, peak));\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uField;\r
uniform vec2 uFieldSize;\r
uniform vec2 uView;\r
uniform vec2 uAspect;\r
uniform vec2 uPillarRot;\r
uniform float uShift;\r
uniform float uIntensity;\r
uniform float uNoiseIntensity;\r
uniform float uLightMode;\r
uniform float uNeutral;\r
uniform float uBloom;\r
uniform float uFade;\r
uniform float uReveal;\r
uniform float uFlare;\r
uniform vec4 uPulses[3];\r
out vec4 outColor;\r
\r
vec3 tap(vec2 uv) {\r
  return textureLod(uField, uv, 0.0).rgb;\r
}\r
\r
vec3 bicubic(vec2 uv) {\r
  vec2 position = uv * uFieldSize;\r
  vec2 center = floor(position - 0.5) + 0.5;\r
  vec2 f = position - center;\r
  vec2 w0 = f * (-0.5 + f * (1.0 - 0.5 * f));\r
  vec2 w1 = 1.0 + f * f * (-2.5 + 1.5 * f);\r
  vec2 w2 = f * (0.5 + f * (2.0 - 1.5 * f));\r
  vec2 w3 = f * f * (-0.5 + 0.5 * f);\r
  vec2 w12 = w1 + w2;\r
  vec2 t0 = (center - 1.0) / uFieldSize;\r
  vec2 t3 = (center + 2.0) / uFieldSize;\r
  vec2 t12 = (center + w2 / w12) / uFieldSize;\r
  vec3 result = vec3(0.0);\r
  result += tap(vec2(t0.x, t0.y)) * w0.x * w0.y;\r
  result += tap(vec2(t12.x, t0.y)) * w12.x * w0.y;\r
  result += tap(vec2(t3.x, t0.y)) * w3.x * w0.y;\r
  result += tap(vec2(t0.x, t12.y)) * w0.x * w12.y;\r
  result += tap(vec2(t12.x, t12.y)) * w12.x * w12.y;\r
  result += tap(vec2(t3.x, t12.y)) * w3.x * w12.y;\r
  result += tap(vec2(t0.x, t3.y)) * w0.x * w3.y;\r
  result += tap(vec2(t12.x, t3.y)) * w12.x * w3.y;\r
  result += tap(vec2(t3.x, t3.y)) * w3.x * w3.y;\r
  return max(result, 0.0);\r
}\r
\r
float smootherstep01(float t) {\r
  t = clamp(t, 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uView;\r
  vec3 col = bicubic(uv);\r
\r
  if (uBloom > 0.0) {\r
    vec4 l3 = textureLod(uField, uv, 3.0);\r
    vec4 l4 = textureLod(uField, uv, 4.0);\r
    vec4 l5 = textureLod(uField, uv, 5.0);\r
    vec4 l6 = textureLod(uField, uv, 6.0);\r
    float halo = l3.a * 0.3 + l4.a * 0.3 + l5.a * 0.25 + l6.a * 0.15;\r
    vec3 tint = l4.rgb + l5.rgb;\r
    tint /= max(max(tint.r, max(tint.g, tint.b)), 0.001);\r
    vec3 glow = clamp(tint * halo * uBloom * 1.1, 0.0, 1.0);\r
    col = 1.0 - (1.0 - clamp(col, 0.0, 1.0)) * (1.0 - glow);\r
  }\r
\r
  vec2 p = (uv * 2.0 - 1.0) * uAspect;\r
  p.x -= uShift;\r
  float axis = uPillarRot.y * p.x + uPillarRot.x * p.y;\r
\r
  float boost = 0.0;\r
  for (int i = 0; i < 3; i++) {\r
    vec4 pulse = uPulses[i];\r
    if (pulse.y <= 0.0) continue;\r
    float offset = (axis - pulse.x) / 0.24;\r
    boost += exp(-offset * offset) * pulse.y;\r
  }\r
  float head = (axis - uReveal + 0.35) / 0.3;\r
  boost += exp(-head * head) * uFlare;\r
  float lum = max(col.r, max(col.g, col.b));\r
  col += mix(col, vec3(lum), 0.45) * boost * 1.8;\r
\r
  col -= fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) / 15.0 * uNoiseIntensity;\r
  vec3 result = clamp(col * uIntensity, 0.0, 1.0);\r
\r
  float mask = smoothstep(uReveal, uReveal - 0.9, axis);\r
  float edge = uFade * 0.5;\r
  if (edge > 0.0) {\r
    mask *= smootherstep01(uv.x / edge) * smootherstep01((1.0 - uv.x) / edge);\r
    mask *= smootherstep01(uv.y / edge) * smootherstep01((1.0 - uv.y) / edge);\r
  }\r
\r
  if (uLightMode > 0.5) {\r
    float energy = max(result.r, max(result.g, result.b));\r
    vec3 hue = result / max(energy, 0.001);\r
    float coverage = smoothstep(0.025, 0.95, energy);\r
    hue = pow(clamp(hue, 0.0, 1.0), vec3(1.25));\r
    vec3 tinted = mix(vec3(1.0), hue, coverage * 0.94 * mask);\r
    vec3 ink = vec3(1.0) - pow(result, vec3(1.6)) * 0.85 * mask;\r
    result = mix(tinted, ink, uNeutral);\r
  } else {\r
    result *= mask;\r
  }\r
  outColor = vec4(result, 1.0);\r
}\`;\r
\r
const QUALITY = { low: 0.35, medium: 0.5, high: 0.6 };\r
const INTRO_SECONDS = 2.1;\r
const PULSE_LIFE = 1.4;\r
const MIN_SCALE = 0.25;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
const easeOut = t => 1 - Math.pow(1 - t, 3);\r
const ease = t => t * t * t * (t * (t * 6 - 15) + 10);\r
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
const link = (gl, fragmentSource) => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);\r
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
    if (info) uniforms[info.name.replace(/\\[0\\]$/, '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const LightPillar = ({\r
  topColor = '#5227FF',\r
  bottomColor = '#FF9FFC',\r
  intensity = 1.0,\r
  rotationSpeed = 0.3,\r
  flow = 1,\r
  interactive = true,\r
  clickPulse = true,\r
  glowAmount = 0.002,\r
  bloom = 0.5,\r
  pillarWidth = 3.0,\r
  pillarHeight = 0.4,\r
  pillarRotation = 25,\r
  twist = 0.4,\r
  detail = 4,\r
  noiseIntensity = 0.5,\r
  fade = 0,\r
  intro = true,\r
  mixBlendMode = 'screen',\r
  quality = 'high',\r
  resolution,\r
  lightMode = false,\r
  paused = false,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settingsRef = useRef(null);\r
  const [generation, setGeneration] = useState(0);\r
  settingsRef.current = {\r
    topColor: String(topColor),\r
    bottomColor: String(bottomColor),\r
    intensity: Math.max(0, intensity),\r
    rotationSpeed,\r
    flow,\r
    interactive,\r
    clickPulse,\r
    glowAmount: Math.max(0, glowAmount),\r
    bloom: Math.max(0, bloom),\r
    pillarWidth: Math.max(0.05, pillarWidth),\r
    pillarHeight,\r
    pillarRotation,\r
    twist,\r
    detail: Math.round(clamp(detail, 1, 6)),\r
    noiseIntensity: Math.max(0, noiseIntensity),\r
    fade: clamp(fade, 0, 1),\r
    intro,\r
    scale: clamp(resolution ?? QUALITY[quality] ?? QUALITY.high, MIN_SCALE, 2),\r
    lightMode,\r
    paused\r
  };\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    const gl = canvas?.getContext('webgl2', {\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false,\r
      powerPreference: 'high-performance'\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const floatTargets = !!gl.getExtension('EXT_color_buffer_float');\r
    const marchProgram = link(gl, MARCH);\r
    const compositeProgram = link(gl, COMPOSITE);\r
    if (!marchProgram || !compositeProgram) return undefined;\r
\r
    const onContextLost = event => {\r
      event.preventDefault();\r
    };\r
    const onContextRestored = () => setGeneration(value => value + 1);\r
    canvas.addEventListener('webglcontextlost', onContextLost);\r
    canvas.addEventListener('webglcontextrestored', onContextRestored);\r
\r
    const buffer = gl.createBuffer();\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    let texture = null;\r
    const framebuffer = gl.createFramebuffer();\r
    const target = { width: 0, height: 0 };\r
    const sizeTarget = (width, height) => {\r
      if (target.width === width && target.height === height) return;\r
      target.width = width;\r
      target.height = height;\r
      if (texture) gl.deleteTexture(texture);\r
      texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      const levels = Math.floor(Math.log2(Math.max(width, height))) + 1;\r
      gl.texStorage2D(gl.TEXTURE_2D, levels, floatTargets ? gl.RGBA16F : gl.RGBA8, width, height);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
    };\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const colorCache = new Map();\r
    const toRgb = value => {\r
      if (colorCache.has(value)) return colorCache.get(value);\r
      let rgb = [1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#ffffff';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      colorCache.set(value, rgb);\r
      return rgb;\r
    };\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1, ratio: 1 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const pulses = [];\r
    const pulseData = new Float32Array(12);\r
    const state = {\r
      clock: 0,\r
      intro: settingsRef.current.intro && !reduce ? 0 : 1,\r
      touch: 0,\r
      spin: 0,\r
      lean: 0,\r
      shift: 0,\r
      governor: 1,\r
      slow: 0,\r
      quick: 0\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const axisAt = (x, y, angle) => {\r
      const aspect = view.width / view.height;\r
      const px = ((x / view.width) * 2 - 1) * aspect - state.shift;\r
      const py = 1 - (y / view.height) * 2;\r
      return Math.sin(angle) * px + Math.cos(angle) * py;\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const scale = Math.max(MIN_SCALE, s.scale * state.governor);\r
      const fieldWidth = Math.max(1, Math.round(view.width * scale));\r
      const fieldHeight = Math.max(1, Math.round(view.height * scale));\r
      sizeTarget(fieldWidth, fieldHeight);\r
\r
      const grow = ease(state.intro);\r
      const rise = easeOut(state.intro);\r
      const tilt = ((s.pillarRotation + state.lean) * Math.PI) / 180;\r
      const angle = state.clock * 0.3 + state.spin;\r
      const width = s.pillarWidth * (0.3 + 0.7 * grow);\r
\r
      gl.bindVertexArray(vao);\r
      const m = marchProgram.uniforms;\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.viewport(0, 0, target.width, target.height);\r
      gl.useProgram(marchProgram.program);\r
      gl.uniform1f(m.uTime, state.clock * s.flow);\r
      gl.uniform2f(m.uResolution, view.width, view.height);\r
      gl.uniform2f(m.uTarget, target.width, target.height);\r
      gl.uniform2f(m.uRot, Math.cos(angle), Math.sin(angle));\r
      gl.uniform2f(m.uPillarRot, Math.cos(tilt), Math.sin(tilt));\r
      gl.uniform2f(m.uWave, Math.sin(s.twist), Math.cos(s.twist));\r
      gl.uniform1f(m.uShift, state.shift);\r
      gl.uniform1f(m.uPillarWidth, width);\r
      gl.uniform1f(m.uPillarHeight, s.pillarHeight);\r
      gl.uniform1i(m.uDetail, s.detail);\r
      gl.uniform3fv(m.uTopColor, toRgb(s.topColor));\r
      gl.uniform3fv(m.uBottomColor, toRgb(s.bottomColor));\r
      gl.uniform1f(m.uGlowAmount, s.glowAmount);\r
      gl.uniform1f(m.uWidthNorm, width / 3);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      if (s.bloom > 0) gl.generateMipmap(gl.TEXTURE_2D);\r
\r
      pulseData.fill(0);\r
      pulses.forEach((pulse, index) => {\r
        pulseData.set([pulse.axis + pulse.age * 1.7, Math.exp(-pulse.age / (PULSE_LIFE * 0.45)), 0, 0], index * 4);\r
      });\r
\r
      const c = compositeProgram.uniforms;\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(compositeProgram.program);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.uniform1i(c.uField, 0);\r
      gl.uniform2f(c.uFieldSize, target.width, target.height);\r
      gl.uniform2f(c.uView, canvas.width, canvas.height);\r
      gl.uniform2f(c.uAspect, view.width / view.height, 1);\r
      gl.uniform2f(c.uPillarRot, Math.cos(tilt), Math.sin(tilt));\r
      gl.uniform1f(c.uShift, state.shift);\r
      gl.uniform1f(c.uIntensity, s.intensity * (0.15 + 0.85 * rise) * (1 + 0.12 * state.touch));\r
      gl.uniform1f(c.uNoiseIntensity, s.noiseIntensity);\r
      gl.uniform1f(c.uLightMode, s.lightMode ? 1 : 0);\r
      const chroma = rgb => Math.max(...rgb) - Math.min(...rgb);\r
      const vivid = Math.max(chroma(toRgb(s.topColor)), chroma(toRgb(s.bottomColor)));\r
      gl.uniform1f(c.uNeutral, 1 - clamp((vivid - 0.08) / 0.12, 0, 1));\r
      gl.uniform1f(c.uBloom, s.bloom);\r
      gl.uniform1f(c.uFade, s.fade);\r
      const span = view.width / view.height + 1.2;\r
      gl.uniform1f(c.uReveal, state.intro >= 1 ? 1e4 : -span + rise * (span * 2 + 1.2));\r
      gl.uniform1f(c.uFlare, state.intro >= 1 ? 0 : (1 - rise) * 1.3 * Math.min(1, state.intro * 8));\r
      gl.uniform4fv(c.uPulses, pulseData);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const tune = dt => {\r
      if (dt > 1 / 40) {\r
        state.slow += 1;\r
        state.quick = 0;\r
      } else if (dt < 1 / 55) {\r
        state.quick += 1;\r
        state.slow = 0;\r
      }\r
      if (state.slow > 20) {\r
        state.governor = Math.max(0.5, state.governor * 0.85);\r
        state.slow = 0;\r
      } else if (state.quick > 180 && state.governor < 1) {\r
        state.governor = Math.min(1, state.governor * 1.1);\r
        state.quick = 0;\r
      }\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      if (last) tune((now - last) / 1000);\r
      last = now;\r
      const running = !s.paused && !reduce && s.rotationSpeed !== 0;\r
      if (running) state.clock += dt * 0.96 * s.rotationSpeed;\r
      if (!s.intro || reduce) state.intro = 1;\r
      else if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / INTRO_SECONDS);\r
\r
      const engaged = s.interactive && pointer.inside && !reduce;\r
      const aim = engaged ? pointer.x / view.width - 0.5 : 0;\r
      const follow = 1 - Math.exp(-dt * 2.4);\r
      state.spin += (aim * 1.4 - state.spin) * follow;\r
      state.lean += (aim * 9 - state.lean) * follow;\r
      state.shift += (aim * 0.35 * (view.width / view.height) - state.shift) * follow;\r
      state.touch += ((engaged ? 1 : 0) - state.touch) * (1 - Math.exp(-dt * 3));\r
\r
      for (let i = pulses.length - 1; i >= 0; i--) {\r
        pulses[i].age += dt;\r
        if (pulses[i].age > PULSE_LIFE * 2.2) pulses.splice(i, 1);\r
      }\r
\r
      render();\r
\r
      const settling =\r
        state.intro < 1 ||\r
        pulses.length > 0 ||\r
        Math.abs(aim * 1.4 - state.spin) > 0.0005 ||\r
        Math.abs((engaged ? 1 : 0) - state.touch) > 0.002;\r
      if (running || settling) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const resize = () => {\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const ratio = Math.min(window.devicePixelRatio || 1, 2);\r
      view.width = width;\r
      view.height = height;\r
      view.ratio = ratio;\r
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      if (!raf) render();\r
      wake();\r
    };\r
\r
    const locate = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };\r
    };\r
\r
    const onPointerMove = event => {\r
      const point = locate(event);\r
      pointer.x = point.x;\r
      pointer.y = point.y;\r
      pointer.inside = point.inside;\r
      wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      if (!s.clickPulse || reduce) return;\r
      const point = locate(event);\r
      if (!point.inside) return;\r
      const tilt = ((s.pillarRotation + state.lean) * Math.PI) / 180;\r
      pulses.push({ axis: axisAt(point.x, point.y, tilt), age: 0 });\r
      if (pulses.length > 3) pulses.shift();\r
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
    resize();\r
\r
    wakeRef.current = () => {\r
      if (!raf) render();\r
      wake();\r
    };\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      canvas.removeEventListener('webglcontextlost', onContextLost);\r
      canvas.removeEventListener('webglcontextrestored', onContextRestored);\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      if (texture) gl.deleteTexture(texture);\r
      gl.deleteFramebuffer(framebuffer);\r
      gl.deleteProgram(marchProgram.program);\r
      gl.deleteProgram(compositeProgram.program);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      if (!gl.isContextLost()) gl.getExtension('WEBGL_lose_context')?.loseContext();\r
    };\r
  }, [generation]);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div\r
      ref={containerRef}\r
      className={\`light-pillar-container\${className ? \` \${className}\` : ''}\`}\r
      style={{ mixBlendMode, ...style }}\r
    >\r
      <canvas ref={canvasRef} className="light-pillar-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default LightPillar;\r
`,n=`.light-pillar-container {\r
  position: absolute;\r
  top: 0;\r
  left: 0;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.light-pillar-canvas {\r
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
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const MARCH = \`#version 300 es\r
precision highp float;\r
uniform float uTime;\r
uniform vec2 uResolution;\r
uniform vec2 uTarget;\r
uniform vec2 uRot;\r
uniform vec2 uPillarRot;\r
uniform vec2 uWave;\r
uniform float uShift;\r
uniform float uPillarWidth;\r
uniform float uPillarHeight;\r
uniform int uDetail;\r
uniform vec3 uTopColor;\r
uniform vec3 uBottomColor;\r
uniform float uGlowAmount;\r
uniform float uWidthNorm;\r
out vec4 outColor;\r
\r
void main() {\r
  vec2 vUv = gl_FragCoord.xy / uTarget;\r
  vec2 uv = (vUv * 2.0 - 1.0) * vec2(uResolution.x / uResolution.y, 1.0);\r
  uv.x -= uShift;\r
  uv = vec2(uPillarRot.x * uv.x - uPillarRot.y * uv.y, uPillarRot.y * uv.x + uPillarRot.x * uv.y);\r
\r
  vec3 ro = vec3(0.0, 0.0, -10.0);\r
  vec3 rd = normalize(vec3(uv, 1.0));\r
  vec3 origin = vec3(uRot.x * ro.x - uRot.y * ro.z, ro.y, uRot.y * ro.x + uRot.x * ro.z);\r
  vec3 dir = vec3(uRot.x * rd.x - uRot.y * rd.z, rd.y, uRot.y * rd.x + uRot.x * rd.z);\r
\r
  float glow = 0.0;\r
  float lift = 0.0;\r
  float t = 0.1;\r
  for (int i = 0; i < 80; i++) {\r
    vec3 p = origin + dir * t;\r
    vec3 q = p;\r
    q.y = p.y * uPillarHeight + uTime;\r
\r
    float freq = 1.0;\r
    float amp = 1.0;\r
    for (int j = 0; j < 6; j++) {\r
      if (j >= uDetail) break;\r
      q.xz = vec2(uWave.y * q.x - uWave.x * q.z, uWave.x * q.x + uWave.y * q.z);\r
      q += cos(q.zxy * freq - uTime * float(j) * 2.0) * amp;\r
      freq *= 2.0;\r
      amp *= 0.5;\r
    }\r
\r
    float d = length(cos(q.xz)) - 0.2;\r
    float bound = length(p.xz) - uPillarWidth;\r
    float h = max(4.0 - abs(d - bound), 0.0);\r
    d = max(d, bound) + h * h * 0.015625;\r
    d = abs(d) * 0.15 + 0.01;\r
\r
    float weight = 1.0 / d;\r
    glow += weight;\r
    lift += clamp((15.0 - p.y) / 30.0, 0.0, 1.0) * weight;\r
\r
    t += d;\r
    if (t > 50.0) break;\r
  }\r
\r
  vec3 col = tanh((uBottomColor * glow + (uTopColor - uBottomColor) * lift) * uGlowAmount / uWidthNorm);\r
  float peak = max(col.r, max(col.g, col.b));\r
  outColor = vec4(col, smoothstep(0.62, 1.0, peak));\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uField;\r
uniform vec2 uFieldSize;\r
uniform vec2 uView;\r
uniform vec2 uAspect;\r
uniform vec2 uPillarRot;\r
uniform float uShift;\r
uniform float uIntensity;\r
uniform float uNoiseIntensity;\r
uniform float uLightMode;\r
uniform float uNeutral;\r
uniform float uBloom;\r
uniform float uFade;\r
uniform float uReveal;\r
uniform float uFlare;\r
uniform vec4 uPulses[3];\r
out vec4 outColor;\r
\r
vec3 tap(vec2 uv) {\r
  return textureLod(uField, uv, 0.0).rgb;\r
}\r
\r
vec3 bicubic(vec2 uv) {\r
  vec2 position = uv * uFieldSize;\r
  vec2 center = floor(position - 0.5) + 0.5;\r
  vec2 f = position - center;\r
  vec2 w0 = f * (-0.5 + f * (1.0 - 0.5 * f));\r
  vec2 w1 = 1.0 + f * f * (-2.5 + 1.5 * f);\r
  vec2 w2 = f * (0.5 + f * (2.0 - 1.5 * f));\r
  vec2 w3 = f * f * (-0.5 + 0.5 * f);\r
  vec2 w12 = w1 + w2;\r
  vec2 t0 = (center - 1.0) / uFieldSize;\r
  vec2 t3 = (center + 2.0) / uFieldSize;\r
  vec2 t12 = (center + w2 / w12) / uFieldSize;\r
  vec3 result = vec3(0.0);\r
  result += tap(vec2(t0.x, t0.y)) * w0.x * w0.y;\r
  result += tap(vec2(t12.x, t0.y)) * w12.x * w0.y;\r
  result += tap(vec2(t3.x, t0.y)) * w3.x * w0.y;\r
  result += tap(vec2(t0.x, t12.y)) * w0.x * w12.y;\r
  result += tap(vec2(t12.x, t12.y)) * w12.x * w12.y;\r
  result += tap(vec2(t3.x, t12.y)) * w3.x * w12.y;\r
  result += tap(vec2(t0.x, t3.y)) * w0.x * w3.y;\r
  result += tap(vec2(t12.x, t3.y)) * w12.x * w3.y;\r
  result += tap(vec2(t3.x, t3.y)) * w3.x * w3.y;\r
  return max(result, 0.0);\r
}\r
\r
float smootherstep01(float t) {\r
  t = clamp(t, 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uView;\r
  vec3 col = bicubic(uv);\r
\r
  if (uBloom > 0.0) {\r
    vec4 l3 = textureLod(uField, uv, 3.0);\r
    vec4 l4 = textureLod(uField, uv, 4.0);\r
    vec4 l5 = textureLod(uField, uv, 5.0);\r
    vec4 l6 = textureLod(uField, uv, 6.0);\r
    float halo = l3.a * 0.3 + l4.a * 0.3 + l5.a * 0.25 + l6.a * 0.15;\r
    vec3 tint = l4.rgb + l5.rgb;\r
    tint /= max(max(tint.r, max(tint.g, tint.b)), 0.001);\r
    vec3 glow = clamp(tint * halo * uBloom * 1.1, 0.0, 1.0);\r
    col = 1.0 - (1.0 - clamp(col, 0.0, 1.0)) * (1.0 - glow);\r
  }\r
\r
  vec2 p = (uv * 2.0 - 1.0) * uAspect;\r
  p.x -= uShift;\r
  float axis = uPillarRot.y * p.x + uPillarRot.x * p.y;\r
\r
  float boost = 0.0;\r
  for (int i = 0; i < 3; i++) {\r
    vec4 pulse = uPulses[i];\r
    if (pulse.y <= 0.0) continue;\r
    float offset = (axis - pulse.x) / 0.24;\r
    boost += exp(-offset * offset) * pulse.y;\r
  }\r
  float head = (axis - uReveal + 0.35) / 0.3;\r
  boost += exp(-head * head) * uFlare;\r
  float lum = max(col.r, max(col.g, col.b));\r
  col += mix(col, vec3(lum), 0.45) * boost * 1.8;\r
\r
  col -= fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) / 15.0 * uNoiseIntensity;\r
  vec3 result = clamp(col * uIntensity, 0.0, 1.0);\r
\r
  float mask = smoothstep(uReveal, uReveal - 0.9, axis);\r
  float edge = uFade * 0.5;\r
  if (edge > 0.0) {\r
    mask *= smootherstep01(uv.x / edge) * smootherstep01((1.0 - uv.x) / edge);\r
    mask *= smootherstep01(uv.y / edge) * smootherstep01((1.0 - uv.y) / edge);\r
  }\r
\r
  if (uLightMode > 0.5) {\r
    float energy = max(result.r, max(result.g, result.b));\r
    vec3 hue = result / max(energy, 0.001);\r
    float coverage = smoothstep(0.025, 0.95, energy);\r
    hue = pow(clamp(hue, 0.0, 1.0), vec3(1.25));\r
    vec3 tinted = mix(vec3(1.0), hue, coverage * 0.94 * mask);\r
    vec3 ink = vec3(1.0) - pow(result, vec3(1.6)) * 0.85 * mask;\r
    result = mix(tinted, ink, uNeutral);\r
  } else {\r
    result *= mask;\r
  }\r
  outColor = vec4(result, 1.0);\r
}\`;\r
\r
const QUALITY = { low: 0.35, medium: 0.5, high: 0.6 };\r
const INTRO_SECONDS = 2.1;\r
const PULSE_LIFE = 1.4;\r
const MIN_SCALE = 0.25;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
const easeOut = t => 1 - Math.pow(1 - t, 3);\r
const ease = t => t * t * t * (t * (t * 6 - 15) + 10);\r
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
const link = (gl, fragmentSource) => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);\r
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
    if (info) uniforms[info.name.replace(/\\[0\\]$/, '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const LightPillar = ({\r
  topColor = '#5227FF',\r
  bottomColor = '#FF9FFC',\r
  intensity = 1.0,\r
  rotationSpeed = 0.3,\r
  flow = 1,\r
  interactive = true,\r
  clickPulse = true,\r
  glowAmount = 0.002,\r
  bloom = 0.5,\r
  pillarWidth = 3.0,\r
  pillarHeight = 0.4,\r
  pillarRotation = 25,\r
  twist = 0.4,\r
  detail = 4,\r
  noiseIntensity = 0.5,\r
  fade = 0,\r
  intro = true,\r
  mixBlendMode = 'screen',\r
  quality = 'high',\r
  resolution,\r
  lightMode = false,\r
  paused = false,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settingsRef = useRef(null);\r
  const [generation, setGeneration] = useState(0);\r
  settingsRef.current = {\r
    topColor: String(topColor),\r
    bottomColor: String(bottomColor),\r
    intensity: Math.max(0, intensity),\r
    rotationSpeed,\r
    flow,\r
    interactive,\r
    clickPulse,\r
    glowAmount: Math.max(0, glowAmount),\r
    bloom: Math.max(0, bloom),\r
    pillarWidth: Math.max(0.05, pillarWidth),\r
    pillarHeight,\r
    pillarRotation,\r
    twist,\r
    detail: Math.round(clamp(detail, 1, 6)),\r
    noiseIntensity: Math.max(0, noiseIntensity),\r
    fade: clamp(fade, 0, 1),\r
    intro,\r
    scale: clamp(resolution ?? QUALITY[quality] ?? QUALITY.high, MIN_SCALE, 2),\r
    lightMode,\r
    paused\r
  };\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    const gl = canvas?.getContext('webgl2', {\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false,\r
      powerPreference: 'high-performance'\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const floatTargets = !!gl.getExtension('EXT_color_buffer_float');\r
    const marchProgram = link(gl, MARCH);\r
    const compositeProgram = link(gl, COMPOSITE);\r
    if (!marchProgram || !compositeProgram) return undefined;\r
\r
    const onContextLost = event => {\r
      event.preventDefault();\r
    };\r
    const onContextRestored = () => setGeneration(value => value + 1);\r
    canvas.addEventListener('webglcontextlost', onContextLost);\r
    canvas.addEventListener('webglcontextrestored', onContextRestored);\r
\r
    const buffer = gl.createBuffer();\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    let texture = null;\r
    const framebuffer = gl.createFramebuffer();\r
    const target = { width: 0, height: 0 };\r
    const sizeTarget = (width, height) => {\r
      if (target.width === width && target.height === height) return;\r
      target.width = width;\r
      target.height = height;\r
      if (texture) gl.deleteTexture(texture);\r
      texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      const levels = Math.floor(Math.log2(Math.max(width, height))) + 1;\r
      gl.texStorage2D(gl.TEXTURE_2D, levels, floatTargets ? gl.RGBA16F : gl.RGBA8, width, height);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
    };\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const colorCache = new Map();\r
    const toRgb = value => {\r
      if (colorCache.has(value)) return colorCache.get(value);\r
      let rgb = [1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#ffffff';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      colorCache.set(value, rgb);\r
      return rgb;\r
    };\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1, ratio: 1 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const pulses = [];\r
    const pulseData = new Float32Array(12);\r
    const state = {\r
      clock: 0,\r
      intro: settingsRef.current.intro && !reduce ? 0 : 1,\r
      touch: 0,\r
      spin: 0,\r
      lean: 0,\r
      shift: 0,\r
      governor: 1,\r
      slow: 0,\r
      quick: 0\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const axisAt = (x, y, angle) => {\r
      const aspect = view.width / view.height;\r
      const px = ((x / view.width) * 2 - 1) * aspect - state.shift;\r
      const py = 1 - (y / view.height) * 2;\r
      return Math.sin(angle) * px + Math.cos(angle) * py;\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const scale = Math.max(MIN_SCALE, s.scale * state.governor);\r
      const fieldWidth = Math.max(1, Math.round(view.width * scale));\r
      const fieldHeight = Math.max(1, Math.round(view.height * scale));\r
      sizeTarget(fieldWidth, fieldHeight);\r
\r
      const grow = ease(state.intro);\r
      const rise = easeOut(state.intro);\r
      const tilt = ((s.pillarRotation + state.lean) * Math.PI) / 180;\r
      const angle = state.clock * 0.3 + state.spin;\r
      const width = s.pillarWidth * (0.3 + 0.7 * grow);\r
\r
      gl.bindVertexArray(vao);\r
      const m = marchProgram.uniforms;\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.viewport(0, 0, target.width, target.height);\r
      gl.useProgram(marchProgram.program);\r
      gl.uniform1f(m.uTime, state.clock * s.flow);\r
      gl.uniform2f(m.uResolution, view.width, view.height);\r
      gl.uniform2f(m.uTarget, target.width, target.height);\r
      gl.uniform2f(m.uRot, Math.cos(angle), Math.sin(angle));\r
      gl.uniform2f(m.uPillarRot, Math.cos(tilt), Math.sin(tilt));\r
      gl.uniform2f(m.uWave, Math.sin(s.twist), Math.cos(s.twist));\r
      gl.uniform1f(m.uShift, state.shift);\r
      gl.uniform1f(m.uPillarWidth, width);\r
      gl.uniform1f(m.uPillarHeight, s.pillarHeight);\r
      gl.uniform1i(m.uDetail, s.detail);\r
      gl.uniform3fv(m.uTopColor, toRgb(s.topColor));\r
      gl.uniform3fv(m.uBottomColor, toRgb(s.bottomColor));\r
      gl.uniform1f(m.uGlowAmount, s.glowAmount);\r
      gl.uniform1f(m.uWidthNorm, width / 3);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      if (s.bloom > 0) gl.generateMipmap(gl.TEXTURE_2D);\r
\r
      pulseData.fill(0);\r
      pulses.forEach((pulse, index) => {\r
        pulseData.set([pulse.axis + pulse.age * 1.7, Math.exp(-pulse.age / (PULSE_LIFE * 0.45)), 0, 0], index * 4);\r
      });\r
\r
      const c = compositeProgram.uniforms;\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(compositeProgram.program);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.uniform1i(c.uField, 0);\r
      gl.uniform2f(c.uFieldSize, target.width, target.height);\r
      gl.uniform2f(c.uView, canvas.width, canvas.height);\r
      gl.uniform2f(c.uAspect, view.width / view.height, 1);\r
      gl.uniform2f(c.uPillarRot, Math.cos(tilt), Math.sin(tilt));\r
      gl.uniform1f(c.uShift, state.shift);\r
      gl.uniform1f(c.uIntensity, s.intensity * (0.15 + 0.85 * rise) * (1 + 0.12 * state.touch));\r
      gl.uniform1f(c.uNoiseIntensity, s.noiseIntensity);\r
      gl.uniform1f(c.uLightMode, s.lightMode ? 1 : 0);\r
      const chroma = rgb => Math.max(...rgb) - Math.min(...rgb);\r
      const vivid = Math.max(chroma(toRgb(s.topColor)), chroma(toRgb(s.bottomColor)));\r
      gl.uniform1f(c.uNeutral, 1 - clamp((vivid - 0.08) / 0.12, 0, 1));\r
      gl.uniform1f(c.uBloom, s.bloom);\r
      gl.uniform1f(c.uFade, s.fade);\r
      const span = view.width / view.height + 1.2;\r
      gl.uniform1f(c.uReveal, state.intro >= 1 ? 1e4 : -span + rise * (span * 2 + 1.2));\r
      gl.uniform1f(c.uFlare, state.intro >= 1 ? 0 : (1 - rise) * 1.3 * Math.min(1, state.intro * 8));\r
      gl.uniform4fv(c.uPulses, pulseData);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const tune = dt => {\r
      if (dt > 1 / 40) {\r
        state.slow += 1;\r
        state.quick = 0;\r
      } else if (dt < 1 / 55) {\r
        state.quick += 1;\r
        state.slow = 0;\r
      }\r
      if (state.slow > 20) {\r
        state.governor = Math.max(0.5, state.governor * 0.85);\r
        state.slow = 0;\r
      } else if (state.quick > 180 && state.governor < 1) {\r
        state.governor = Math.min(1, state.governor * 1.1);\r
        state.quick = 0;\r
      }\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      if (last) tune((now - last) / 1000);\r
      last = now;\r
      const running = !s.paused && !reduce && s.rotationSpeed !== 0;\r
      if (running) state.clock += dt * 0.96 * s.rotationSpeed;\r
      if (!s.intro || reduce) state.intro = 1;\r
      else if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / INTRO_SECONDS);\r
\r
      const engaged = s.interactive && pointer.inside && !reduce;\r
      const aim = engaged ? pointer.x / view.width - 0.5 : 0;\r
      const follow = 1 - Math.exp(-dt * 2.4);\r
      state.spin += (aim * 1.4 - state.spin) * follow;\r
      state.lean += (aim * 9 - state.lean) * follow;\r
      state.shift += (aim * 0.35 * (view.width / view.height) - state.shift) * follow;\r
      state.touch += ((engaged ? 1 : 0) - state.touch) * (1 - Math.exp(-dt * 3));\r
\r
      for (let i = pulses.length - 1; i >= 0; i--) {\r
        pulses[i].age += dt;\r
        if (pulses[i].age > PULSE_LIFE * 2.2) pulses.splice(i, 1);\r
      }\r
\r
      render();\r
\r
      const settling =\r
        state.intro < 1 ||\r
        pulses.length > 0 ||\r
        Math.abs(aim * 1.4 - state.spin) > 0.0005 ||\r
        Math.abs((engaged ? 1 : 0) - state.touch) > 0.002;\r
      if (running || settling) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const resize = () => {\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const ratio = Math.min(window.devicePixelRatio || 1, 2);\r
      view.width = width;\r
      view.height = height;\r
      view.ratio = ratio;\r
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      if (!raf) render();\r
      wake();\r
    };\r
\r
    const locate = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };\r
    };\r
\r
    const onPointerMove = event => {\r
      const point = locate(event);\r
      pointer.x = point.x;\r
      pointer.y = point.y;\r
      pointer.inside = point.inside;\r
      wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      if (!s.clickPulse || reduce) return;\r
      const point = locate(event);\r
      if (!point.inside) return;\r
      const tilt = ((s.pillarRotation + state.lean) * Math.PI) / 180;\r
      pulses.push({ axis: axisAt(point.x, point.y, tilt), age: 0 });\r
      if (pulses.length > 3) pulses.shift();\r
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
    resize();\r
\r
    wakeRef.current = () => {\r
      if (!raf) render();\r
      wake();\r
    };\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      canvas.removeEventListener('webglcontextlost', onContextLost);\r
      canvas.removeEventListener('webglcontextrestored', onContextRestored);\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      if (texture) gl.deleteTexture(texture);\r
      gl.deleteFramebuffer(framebuffer);\r
      gl.deleteProgram(marchProgram.program);\r
      gl.deleteProgram(compositeProgram.program);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      if (!gl.isContextLost()) gl.getExtension('WEBGL_lose_context')?.loseContext();\r
    };\r
  }, [generation]);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div\r
      ref={containerRef}\r
      className={\`absolute top-0 left-0 w-full h-full overflow-hidden \${className}\`}\r
      style={{ mixBlendMode, ...style }}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default LightPillar;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, useState, type CSSProperties } from 'react';\r
\r
import './LightPillar.css';\r
\r
export interface LightPillarProps {\r
  topColor?: string;\r
  bottomColor?: string;\r
  intensity?: number;\r
  rotationSpeed?: number;\r
  flow?: number;\r
  interactive?: boolean;\r
  clickPulse?: boolean;\r
  glowAmount?: number;\r
  bloom?: number;\r
  pillarWidth?: number;\r
  pillarHeight?: number;\r
  pillarRotation?: number;\r
  twist?: number;\r
  detail?: number;\r
  noiseIntensity?: number;\r
  fade?: number;\r
  intro?: boolean;\r
  mixBlendMode?: CSSProperties['mixBlendMode'];\r
  quality?: 'low' | 'medium' | 'high';\r
  resolution?: number;\r
  lightMode?: boolean;\r
  paused?: boolean;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Settings {\r
  topColor: string;\r
  bottomColor: string;\r
  intensity: number;\r
  rotationSpeed: number;\r
  flow: number;\r
  interactive: boolean;\r
  clickPulse: boolean;\r
  glowAmount: number;\r
  bloom: number;\r
  pillarWidth: number;\r
  pillarHeight: number;\r
  pillarRotation: number;\r
  twist: number;\r
  detail: number;\r
  noiseIntensity: number;\r
  fade: number;\r
  intro: boolean;\r
  scale: number;\r
  lightMode: boolean;\r
  paused: boolean;\r
}\r
\r
type Uniforms = Record<string, WebGLUniformLocation | null>;\r
\r
interface Program {\r
  program: WebGLProgram;\r
  uniforms: Uniforms;\r
}\r
\r
interface Pulse {\r
  axis: number;\r
  age: number;\r
}\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const MARCH = \`#version 300 es\r
precision highp float;\r
uniform float uTime;\r
uniform vec2 uResolution;\r
uniform vec2 uTarget;\r
uniform vec2 uRot;\r
uniform vec2 uPillarRot;\r
uniform vec2 uWave;\r
uniform float uShift;\r
uniform float uPillarWidth;\r
uniform float uPillarHeight;\r
uniform int uDetail;\r
uniform vec3 uTopColor;\r
uniform vec3 uBottomColor;\r
uniform float uGlowAmount;\r
uniform float uWidthNorm;\r
out vec4 outColor;\r
\r
void main() {\r
  vec2 vUv = gl_FragCoord.xy / uTarget;\r
  vec2 uv = (vUv * 2.0 - 1.0) * vec2(uResolution.x / uResolution.y, 1.0);\r
  uv.x -= uShift;\r
  uv = vec2(uPillarRot.x * uv.x - uPillarRot.y * uv.y, uPillarRot.y * uv.x + uPillarRot.x * uv.y);\r
\r
  vec3 ro = vec3(0.0, 0.0, -10.0);\r
  vec3 rd = normalize(vec3(uv, 1.0));\r
  vec3 origin = vec3(uRot.x * ro.x - uRot.y * ro.z, ro.y, uRot.y * ro.x + uRot.x * ro.z);\r
  vec3 dir = vec3(uRot.x * rd.x - uRot.y * rd.z, rd.y, uRot.y * rd.x + uRot.x * rd.z);\r
\r
  float glow = 0.0;\r
  float lift = 0.0;\r
  float t = 0.1;\r
  for (int i = 0; i < 80; i++) {\r
    vec3 p = origin + dir * t;\r
    vec3 q = p;\r
    q.y = p.y * uPillarHeight + uTime;\r
\r
    float freq = 1.0;\r
    float amp = 1.0;\r
    for (int j = 0; j < 6; j++) {\r
      if (j >= uDetail) break;\r
      q.xz = vec2(uWave.y * q.x - uWave.x * q.z, uWave.x * q.x + uWave.y * q.z);\r
      q += cos(q.zxy * freq - uTime * float(j) * 2.0) * amp;\r
      freq *= 2.0;\r
      amp *= 0.5;\r
    }\r
\r
    float d = length(cos(q.xz)) - 0.2;\r
    float bound = length(p.xz) - uPillarWidth;\r
    float h = max(4.0 - abs(d - bound), 0.0);\r
    d = max(d, bound) + h * h * 0.015625;\r
    d = abs(d) * 0.15 + 0.01;\r
\r
    float weight = 1.0 / d;\r
    glow += weight;\r
    lift += clamp((15.0 - p.y) / 30.0, 0.0, 1.0) * weight;\r
\r
    t += d;\r
    if (t > 50.0) break;\r
  }\r
\r
  vec3 col = tanh((uBottomColor * glow + (uTopColor - uBottomColor) * lift) * uGlowAmount / uWidthNorm);\r
  float peak = max(col.r, max(col.g, col.b));\r
  outColor = vec4(col, smoothstep(0.62, 1.0, peak));\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uField;\r
uniform vec2 uFieldSize;\r
uniform vec2 uView;\r
uniform vec2 uAspect;\r
uniform vec2 uPillarRot;\r
uniform float uShift;\r
uniform float uIntensity;\r
uniform float uNoiseIntensity;\r
uniform float uLightMode;\r
uniform float uNeutral;\r
uniform float uBloom;\r
uniform float uFade;\r
uniform float uReveal;\r
uniform float uFlare;\r
uniform vec4 uPulses[3];\r
out vec4 outColor;\r
\r
vec3 tap(vec2 uv) {\r
  return textureLod(uField, uv, 0.0).rgb;\r
}\r
\r
vec3 bicubic(vec2 uv) {\r
  vec2 position = uv * uFieldSize;\r
  vec2 center = floor(position - 0.5) + 0.5;\r
  vec2 f = position - center;\r
  vec2 w0 = f * (-0.5 + f * (1.0 - 0.5 * f));\r
  vec2 w1 = 1.0 + f * f * (-2.5 + 1.5 * f);\r
  vec2 w2 = f * (0.5 + f * (2.0 - 1.5 * f));\r
  vec2 w3 = f * f * (-0.5 + 0.5 * f);\r
  vec2 w12 = w1 + w2;\r
  vec2 t0 = (center - 1.0) / uFieldSize;\r
  vec2 t3 = (center + 2.0) / uFieldSize;\r
  vec2 t12 = (center + w2 / w12) / uFieldSize;\r
  vec3 result = vec3(0.0);\r
  result += tap(vec2(t0.x, t0.y)) * w0.x * w0.y;\r
  result += tap(vec2(t12.x, t0.y)) * w12.x * w0.y;\r
  result += tap(vec2(t3.x, t0.y)) * w3.x * w0.y;\r
  result += tap(vec2(t0.x, t12.y)) * w0.x * w12.y;\r
  result += tap(vec2(t12.x, t12.y)) * w12.x * w12.y;\r
  result += tap(vec2(t3.x, t12.y)) * w3.x * w12.y;\r
  result += tap(vec2(t0.x, t3.y)) * w0.x * w3.y;\r
  result += tap(vec2(t12.x, t3.y)) * w12.x * w3.y;\r
  result += tap(vec2(t3.x, t3.y)) * w3.x * w3.y;\r
  return max(result, 0.0);\r
}\r
\r
float smootherstep01(float t) {\r
  t = clamp(t, 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uView;\r
  vec3 col = bicubic(uv);\r
\r
  if (uBloom > 0.0) {\r
    vec4 l3 = textureLod(uField, uv, 3.0);\r
    vec4 l4 = textureLod(uField, uv, 4.0);\r
    vec4 l5 = textureLod(uField, uv, 5.0);\r
    vec4 l6 = textureLod(uField, uv, 6.0);\r
    float halo = l3.a * 0.3 + l4.a * 0.3 + l5.a * 0.25 + l6.a * 0.15;\r
    vec3 tint = l4.rgb + l5.rgb;\r
    tint /= max(max(tint.r, max(tint.g, tint.b)), 0.001);\r
    vec3 glow = clamp(tint * halo * uBloom * 1.1, 0.0, 1.0);\r
    col = 1.0 - (1.0 - clamp(col, 0.0, 1.0)) * (1.0 - glow);\r
  }\r
\r
  vec2 p = (uv * 2.0 - 1.0) * uAspect;\r
  p.x -= uShift;\r
  float axis = uPillarRot.y * p.x + uPillarRot.x * p.y;\r
\r
  float boost = 0.0;\r
  for (int i = 0; i < 3; i++) {\r
    vec4 pulse = uPulses[i];\r
    if (pulse.y <= 0.0) continue;\r
    float offset = (axis - pulse.x) / 0.24;\r
    boost += exp(-offset * offset) * pulse.y;\r
  }\r
  float head = (axis - uReveal + 0.35) / 0.3;\r
  boost += exp(-head * head) * uFlare;\r
  float lum = max(col.r, max(col.g, col.b));\r
  col += mix(col, vec3(lum), 0.45) * boost * 1.8;\r
\r
  col -= fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) / 15.0 * uNoiseIntensity;\r
  vec3 result = clamp(col * uIntensity, 0.0, 1.0);\r
\r
  float mask = smoothstep(uReveal, uReveal - 0.9, axis);\r
  float edge = uFade * 0.5;\r
  if (edge > 0.0) {\r
    mask *= smootherstep01(uv.x / edge) * smootherstep01((1.0 - uv.x) / edge);\r
    mask *= smootherstep01(uv.y / edge) * smootherstep01((1.0 - uv.y) / edge);\r
  }\r
\r
  if (uLightMode > 0.5) {\r
    float energy = max(result.r, max(result.g, result.b));\r
    vec3 hue = result / max(energy, 0.001);\r
    float coverage = smoothstep(0.025, 0.95, energy);\r
    hue = pow(clamp(hue, 0.0, 1.0), vec3(1.25));\r
    vec3 tinted = mix(vec3(1.0), hue, coverage * 0.94 * mask);\r
    vec3 ink = vec3(1.0) - pow(result, vec3(1.6)) * 0.85 * mask;\r
    result = mix(tinted, ink, uNeutral);\r
  } else {\r
    result *= mask;\r
  }\r
  outColor = vec4(result, 1.0);\r
}\`;\r
\r
const QUALITY: Record<string, number> = { low: 0.35, medium: 0.5, high: 0.6 };\r
const INTRO_SECONDS = 2.1;\r
const PULSE_LIFE = 1.4;\r
const MIN_SCALE = 0.25;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);\r
const ease = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);\r
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
const link = (gl: WebGL2RenderingContext, fragmentSource: string): Program | null => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);\r
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
  const uniforms: Uniforms = {};\r
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
  for (let i = 0; i < count; i++) {\r
    const info = gl.getActiveUniform(program, i);\r
    if (info) uniforms[info.name.replace(/\\[0\\]$/, '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const LightPillar = ({\r
  topColor = '#5227FF',\r
  bottomColor = '#FF9FFC',\r
  intensity = 1.0,\r
  rotationSpeed = 0.3,\r
  flow = 1,\r
  interactive = true,\r
  clickPulse = true,\r
  glowAmount = 0.002,\r
  bloom = 0.5,\r
  pillarWidth = 3.0,\r
  pillarHeight = 0.4,\r
  pillarRotation = 25,\r
  twist = 0.4,\r
  detail = 4,\r
  noiseIntensity = 0.5,\r
  fade = 0,\r
  intro = true,\r
  mixBlendMode = 'screen',\r
  quality = 'high',\r
  resolution,\r
  lightMode = false,\r
  paused = false,\r
  className = '',\r
  style\r
}: LightPillarProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settingsRef = useRef<Settings>(null as unknown as Settings);\r
  const [generation, setGeneration] = useState(0);\r
  settingsRef.current = {\r
    topColor: String(topColor),\r
    bottomColor: String(bottomColor),\r
    intensity: Math.max(0, intensity),\r
    rotationSpeed,\r
    flow,\r
    interactive,\r
    clickPulse,\r
    glowAmount: Math.max(0, glowAmount),\r
    bloom: Math.max(0, bloom),\r
    pillarWidth: Math.max(0.05, pillarWidth),\r
    pillarHeight,\r
    pillarRotation,\r
    twist,\r
    detail: Math.round(clamp(detail, 1, 6)),\r
    noiseIntensity: Math.max(0, noiseIntensity),\r
    fade: clamp(fade, 0, 1),\r
    intro,\r
    scale: clamp(resolution ?? QUALITY[quality] ?? QUALITY.high, MIN_SCALE, 2),\r
    lightMode,\r
    paused\r
  };\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    const gl = canvas?.getContext('webgl2', {\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false,\r
      powerPreference: 'high-performance'\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const floatTargets = !!gl.getExtension('EXT_color_buffer_float');\r
    const marchProgram = link(gl, MARCH);\r
    const compositeProgram = link(gl, COMPOSITE);\r
    if (!marchProgram || !compositeProgram) return undefined;\r
\r
    const onContextLost = (event: Event) => {\r
      event.preventDefault();\r
    };\r
    const onContextRestored = () => setGeneration(value => value + 1);\r
    canvas.addEventListener('webglcontextlost', onContextLost);\r
    canvas.addEventListener('webglcontextrestored', onContextRestored);\r
\r
    const buffer = gl.createBuffer();\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    let texture: WebGLTexture | null = null;\r
    const framebuffer = gl.createFramebuffer();\r
    const target = { width: 0, height: 0 };\r
    const sizeTarget = (width: number, height: number) => {\r
      if (target.width === width && target.height === height) return;\r
      target.width = width;\r
      target.height = height;\r
      if (texture) gl.deleteTexture(texture);\r
      texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      const levels = Math.floor(Math.log2(Math.max(width, height))) + 1;\r
      gl.texStorage2D(gl.TEXTURE_2D, levels, floatTargets ? gl.RGBA16F : gl.RGBA8, width, height);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
    };\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const colorCache = new Map<string, number[]>();\r
    const toRgb = (value: string): number[] => {\r
      if (colorCache.has(value)) return colorCache.get(value) as number[];\r
      let rgb = [1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#ffffff';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      colorCache.set(value, rgb);\r
      return rgb;\r
    };\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1, ratio: 1 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const pulses: Pulse[] = [];\r
    const pulseData = new Float32Array(12);\r
    const state = {\r
      clock: 0,\r
      intro: settingsRef.current.intro && !reduce ? 0 : 1,\r
      touch: 0,\r
      spin: 0,\r
      lean: 0,\r
      shift: 0,\r
      governor: 1,\r
      slow: 0,\r
      quick: 0\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const axisAt = (x: number, y: number, angle: number) => {\r
      const aspect = view.width / view.height;\r
      const px = ((x / view.width) * 2 - 1) * aspect - state.shift;\r
      const py = 1 - (y / view.height) * 2;\r
      return Math.sin(angle) * px + Math.cos(angle) * py;\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const scale = Math.max(MIN_SCALE, s.scale * state.governor);\r
      const fieldWidth = Math.max(1, Math.round(view.width * scale));\r
      const fieldHeight = Math.max(1, Math.round(view.height * scale));\r
      sizeTarget(fieldWidth, fieldHeight);\r
\r
      const grow = ease(state.intro);\r
      const rise = easeOut(state.intro);\r
      const tilt = ((s.pillarRotation + state.lean) * Math.PI) / 180;\r
      const angle = state.clock * 0.3 + state.spin;\r
      const width = s.pillarWidth * (0.3 + 0.7 * grow);\r
\r
      gl.bindVertexArray(vao);\r
      const m = marchProgram.uniforms;\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.viewport(0, 0, target.width, target.height);\r
      gl.useProgram(marchProgram.program);\r
      gl.uniform1f(m.uTime, state.clock * s.flow);\r
      gl.uniform2f(m.uResolution, view.width, view.height);\r
      gl.uniform2f(m.uTarget, target.width, target.height);\r
      gl.uniform2f(m.uRot, Math.cos(angle), Math.sin(angle));\r
      gl.uniform2f(m.uPillarRot, Math.cos(tilt), Math.sin(tilt));\r
      gl.uniform2f(m.uWave, Math.sin(s.twist), Math.cos(s.twist));\r
      gl.uniform1f(m.uShift, state.shift);\r
      gl.uniform1f(m.uPillarWidth, width);\r
      gl.uniform1f(m.uPillarHeight, s.pillarHeight);\r
      gl.uniform1i(m.uDetail, s.detail);\r
      gl.uniform3fv(m.uTopColor, toRgb(s.topColor));\r
      gl.uniform3fv(m.uBottomColor, toRgb(s.bottomColor));\r
      gl.uniform1f(m.uGlowAmount, s.glowAmount);\r
      gl.uniform1f(m.uWidthNorm, width / 3);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      if (s.bloom > 0) gl.generateMipmap(gl.TEXTURE_2D);\r
\r
      pulseData.fill(0);\r
      pulses.forEach((pulse, index) => {\r
        pulseData.set([pulse.axis + pulse.age * 1.7, Math.exp(-pulse.age / (PULSE_LIFE * 0.45)), 0, 0], index * 4);\r
      });\r
\r
      const c = compositeProgram.uniforms;\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(compositeProgram.program);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.uniform1i(c.uField, 0);\r
      gl.uniform2f(c.uFieldSize, target.width, target.height);\r
      gl.uniform2f(c.uView, canvas.width, canvas.height);\r
      gl.uniform2f(c.uAspect, view.width / view.height, 1);\r
      gl.uniform2f(c.uPillarRot, Math.cos(tilt), Math.sin(tilt));\r
      gl.uniform1f(c.uShift, state.shift);\r
      gl.uniform1f(c.uIntensity, s.intensity * (0.15 + 0.85 * rise) * (1 + 0.12 * state.touch));\r
      gl.uniform1f(c.uNoiseIntensity, s.noiseIntensity);\r
      gl.uniform1f(c.uLightMode, s.lightMode ? 1 : 0);\r
      const chroma = (rgb: number[]) => Math.max(...rgb) - Math.min(...rgb);\r
      const vivid = Math.max(chroma(toRgb(s.topColor)), chroma(toRgb(s.bottomColor)));\r
      gl.uniform1f(c.uNeutral, 1 - clamp((vivid - 0.08) / 0.12, 0, 1));\r
      gl.uniform1f(c.uBloom, s.bloom);\r
      gl.uniform1f(c.uFade, s.fade);\r
      const span = view.width / view.height + 1.2;\r
      gl.uniform1f(c.uReveal, state.intro >= 1 ? 1e4 : -span + rise * (span * 2 + 1.2));\r
      gl.uniform1f(c.uFlare, state.intro >= 1 ? 0 : (1 - rise) * 1.3 * Math.min(1, state.intro * 8));\r
      gl.uniform4fv(c.uPulses, pulseData);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const tune = (dt: number) => {\r
      if (dt > 1 / 40) {\r
        state.slow += 1;\r
        state.quick = 0;\r
      } else if (dt < 1 / 55) {\r
        state.quick += 1;\r
        state.slow = 0;\r
      }\r
      if (state.slow > 20) {\r
        state.governor = Math.max(0.5, state.governor * 0.85);\r
        state.slow = 0;\r
      } else if (state.quick > 180 && state.governor < 1) {\r
        state.governor = Math.min(1, state.governor * 1.1);\r
        state.quick = 0;\r
      }\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      if (last) tune((now - last) / 1000);\r
      last = now;\r
      const running = !s.paused && !reduce && s.rotationSpeed !== 0;\r
      if (running) state.clock += dt * 0.96 * s.rotationSpeed;\r
      if (!s.intro || reduce) state.intro = 1;\r
      else if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / INTRO_SECONDS);\r
\r
      const engaged = s.interactive && pointer.inside && !reduce;\r
      const aim = engaged ? pointer.x / view.width - 0.5 : 0;\r
      const follow = 1 - Math.exp(-dt * 2.4);\r
      state.spin += (aim * 1.4 - state.spin) * follow;\r
      state.lean += (aim * 9 - state.lean) * follow;\r
      state.shift += (aim * 0.35 * (view.width / view.height) - state.shift) * follow;\r
      state.touch += ((engaged ? 1 : 0) - state.touch) * (1 - Math.exp(-dt * 3));\r
\r
      for (let i = pulses.length - 1; i >= 0; i--) {\r
        pulses[i].age += dt;\r
        if (pulses[i].age > PULSE_LIFE * 2.2) pulses.splice(i, 1);\r
      }\r
\r
      render();\r
\r
      const settling =\r
        state.intro < 1 ||\r
        pulses.length > 0 ||\r
        Math.abs(aim * 1.4 - state.spin) > 0.0005 ||\r
        Math.abs((engaged ? 1 : 0) - state.touch) > 0.002;\r
      if (running || settling) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const resize = () => {\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const ratio = Math.min(window.devicePixelRatio || 1, 2);\r
      view.width = width;\r
      view.height = height;\r
      view.ratio = ratio;\r
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      if (!raf) render();\r
      wake();\r
    };\r
\r
    const locate = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const point = locate(event);\r
      pointer.x = point.x;\r
      pointer.y = point.y;\r
      pointer.inside = point.inside;\r
      wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      if (!s.clickPulse || reduce) return;\r
      const point = locate(event);\r
      if (!point.inside) return;\r
      const tilt = ((s.pillarRotation + state.lean) * Math.PI) / 180;\r
      pulses.push({ axis: axisAt(point.x, point.y, tilt), age: 0 });\r
      if (pulses.length > 3) pulses.shift();\r
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
    resize();\r
\r
    wakeRef.current = () => {\r
      if (!raf) render();\r
      wake();\r
    };\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      canvas.removeEventListener('webglcontextlost', onContextLost);\r
      canvas.removeEventListener('webglcontextrestored', onContextRestored);\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      if (texture) gl.deleteTexture(texture);\r
      gl.deleteFramebuffer(framebuffer);\r
      gl.deleteProgram(marchProgram.program);\r
      gl.deleteProgram(compositeProgram.program);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      if (!gl.isContextLost()) gl.getExtension('WEBGL_lose_context')?.loseContext();\r
    };\r
  }, [generation]);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div\r
      ref={containerRef}\r
      className={\`light-pillar-container\${className ? \` \${className}\` : ''}\`}\r
      style={{ mixBlendMode, ...style }}\r
    >\r
      <canvas ref={canvasRef} className="light-pillar-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default LightPillar;\r
`,o=`'use client';\r
\r
import { useEffect, useRef, useState, type CSSProperties } from 'react';\r
\r
export interface LightPillarProps {\r
  topColor?: string;\r
  bottomColor?: string;\r
  intensity?: number;\r
  rotationSpeed?: number;\r
  flow?: number;\r
  interactive?: boolean;\r
  clickPulse?: boolean;\r
  glowAmount?: number;\r
  bloom?: number;\r
  pillarWidth?: number;\r
  pillarHeight?: number;\r
  pillarRotation?: number;\r
  twist?: number;\r
  detail?: number;\r
  noiseIntensity?: number;\r
  fade?: number;\r
  intro?: boolean;\r
  mixBlendMode?: CSSProperties['mixBlendMode'];\r
  quality?: 'low' | 'medium' | 'high';\r
  resolution?: number;\r
  lightMode?: boolean;\r
  paused?: boolean;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Settings {\r
  topColor: string;\r
  bottomColor: string;\r
  intensity: number;\r
  rotationSpeed: number;\r
  flow: number;\r
  interactive: boolean;\r
  clickPulse: boolean;\r
  glowAmount: number;\r
  bloom: number;\r
  pillarWidth: number;\r
  pillarHeight: number;\r
  pillarRotation: number;\r
  twist: number;\r
  detail: number;\r
  noiseIntensity: number;\r
  fade: number;\r
  intro: boolean;\r
  scale: number;\r
  lightMode: boolean;\r
  paused: boolean;\r
}\r
\r
type Uniforms = Record<string, WebGLUniformLocation | null>;\r
\r
interface Program {\r
  program: WebGLProgram;\r
  uniforms: Uniforms;\r
}\r
\r
interface Pulse {\r
  axis: number;\r
  age: number;\r
}\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const MARCH = \`#version 300 es\r
precision highp float;\r
uniform float uTime;\r
uniform vec2 uResolution;\r
uniform vec2 uTarget;\r
uniform vec2 uRot;\r
uniform vec2 uPillarRot;\r
uniform vec2 uWave;\r
uniform float uShift;\r
uniform float uPillarWidth;\r
uniform float uPillarHeight;\r
uniform int uDetail;\r
uniform vec3 uTopColor;\r
uniform vec3 uBottomColor;\r
uniform float uGlowAmount;\r
uniform float uWidthNorm;\r
out vec4 outColor;\r
\r
void main() {\r
  vec2 vUv = gl_FragCoord.xy / uTarget;\r
  vec2 uv = (vUv * 2.0 - 1.0) * vec2(uResolution.x / uResolution.y, 1.0);\r
  uv.x -= uShift;\r
  uv = vec2(uPillarRot.x * uv.x - uPillarRot.y * uv.y, uPillarRot.y * uv.x + uPillarRot.x * uv.y);\r
\r
  vec3 ro = vec3(0.0, 0.0, -10.0);\r
  vec3 rd = normalize(vec3(uv, 1.0));\r
  vec3 origin = vec3(uRot.x * ro.x - uRot.y * ro.z, ro.y, uRot.y * ro.x + uRot.x * ro.z);\r
  vec3 dir = vec3(uRot.x * rd.x - uRot.y * rd.z, rd.y, uRot.y * rd.x + uRot.x * rd.z);\r
\r
  float glow = 0.0;\r
  float lift = 0.0;\r
  float t = 0.1;\r
  for (int i = 0; i < 80; i++) {\r
    vec3 p = origin + dir * t;\r
    vec3 q = p;\r
    q.y = p.y * uPillarHeight + uTime;\r
\r
    float freq = 1.0;\r
    float amp = 1.0;\r
    for (int j = 0; j < 6; j++) {\r
      if (j >= uDetail) break;\r
      q.xz = vec2(uWave.y * q.x - uWave.x * q.z, uWave.x * q.x + uWave.y * q.z);\r
      q += cos(q.zxy * freq - uTime * float(j) * 2.0) * amp;\r
      freq *= 2.0;\r
      amp *= 0.5;\r
    }\r
\r
    float d = length(cos(q.xz)) - 0.2;\r
    float bound = length(p.xz) - uPillarWidth;\r
    float h = max(4.0 - abs(d - bound), 0.0);\r
    d = max(d, bound) + h * h * 0.015625;\r
    d = abs(d) * 0.15 + 0.01;\r
\r
    float weight = 1.0 / d;\r
    glow += weight;\r
    lift += clamp((15.0 - p.y) / 30.0, 0.0, 1.0) * weight;\r
\r
    t += d;\r
    if (t > 50.0) break;\r
  }\r
\r
  vec3 col = tanh((uBottomColor * glow + (uTopColor - uBottomColor) * lift) * uGlowAmount / uWidthNorm);\r
  float peak = max(col.r, max(col.g, col.b));\r
  outColor = vec4(col, smoothstep(0.62, 1.0, peak));\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uField;\r
uniform vec2 uFieldSize;\r
uniform vec2 uView;\r
uniform vec2 uAspect;\r
uniform vec2 uPillarRot;\r
uniform float uShift;\r
uniform float uIntensity;\r
uniform float uNoiseIntensity;\r
uniform float uLightMode;\r
uniform float uNeutral;\r
uniform float uBloom;\r
uniform float uFade;\r
uniform float uReveal;\r
uniform float uFlare;\r
uniform vec4 uPulses[3];\r
out vec4 outColor;\r
\r
vec3 tap(vec2 uv) {\r
  return textureLod(uField, uv, 0.0).rgb;\r
}\r
\r
vec3 bicubic(vec2 uv) {\r
  vec2 position = uv * uFieldSize;\r
  vec2 center = floor(position - 0.5) + 0.5;\r
  vec2 f = position - center;\r
  vec2 w0 = f * (-0.5 + f * (1.0 - 0.5 * f));\r
  vec2 w1 = 1.0 + f * f * (-2.5 + 1.5 * f);\r
  vec2 w2 = f * (0.5 + f * (2.0 - 1.5 * f));\r
  vec2 w3 = f * f * (-0.5 + 0.5 * f);\r
  vec2 w12 = w1 + w2;\r
  vec2 t0 = (center - 1.0) / uFieldSize;\r
  vec2 t3 = (center + 2.0) / uFieldSize;\r
  vec2 t12 = (center + w2 / w12) / uFieldSize;\r
  vec3 result = vec3(0.0);\r
  result += tap(vec2(t0.x, t0.y)) * w0.x * w0.y;\r
  result += tap(vec2(t12.x, t0.y)) * w12.x * w0.y;\r
  result += tap(vec2(t3.x, t0.y)) * w3.x * w0.y;\r
  result += tap(vec2(t0.x, t12.y)) * w0.x * w12.y;\r
  result += tap(vec2(t12.x, t12.y)) * w12.x * w12.y;\r
  result += tap(vec2(t3.x, t12.y)) * w3.x * w12.y;\r
  result += tap(vec2(t0.x, t3.y)) * w0.x * w3.y;\r
  result += tap(vec2(t12.x, t3.y)) * w12.x * w3.y;\r
  result += tap(vec2(t3.x, t3.y)) * w3.x * w3.y;\r
  return max(result, 0.0);\r
}\r
\r
float smootherstep01(float t) {\r
  t = clamp(t, 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uView;\r
  vec3 col = bicubic(uv);\r
\r
  if (uBloom > 0.0) {\r
    vec4 l3 = textureLod(uField, uv, 3.0);\r
    vec4 l4 = textureLod(uField, uv, 4.0);\r
    vec4 l5 = textureLod(uField, uv, 5.0);\r
    vec4 l6 = textureLod(uField, uv, 6.0);\r
    float halo = l3.a * 0.3 + l4.a * 0.3 + l5.a * 0.25 + l6.a * 0.15;\r
    vec3 tint = l4.rgb + l5.rgb;\r
    tint /= max(max(tint.r, max(tint.g, tint.b)), 0.001);\r
    vec3 glow = clamp(tint * halo * uBloom * 1.1, 0.0, 1.0);\r
    col = 1.0 - (1.0 - clamp(col, 0.0, 1.0)) * (1.0 - glow);\r
  }\r
\r
  vec2 p = (uv * 2.0 - 1.0) * uAspect;\r
  p.x -= uShift;\r
  float axis = uPillarRot.y * p.x + uPillarRot.x * p.y;\r
\r
  float boost = 0.0;\r
  for (int i = 0; i < 3; i++) {\r
    vec4 pulse = uPulses[i];\r
    if (pulse.y <= 0.0) continue;\r
    float offset = (axis - pulse.x) / 0.24;\r
    boost += exp(-offset * offset) * pulse.y;\r
  }\r
  float head = (axis - uReveal + 0.35) / 0.3;\r
  boost += exp(-head * head) * uFlare;\r
  float lum = max(col.r, max(col.g, col.b));\r
  col += mix(col, vec3(lum), 0.45) * boost * 1.8;\r
\r
  col -= fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) / 15.0 * uNoiseIntensity;\r
  vec3 result = clamp(col * uIntensity, 0.0, 1.0);\r
\r
  float mask = smoothstep(uReveal, uReveal - 0.9, axis);\r
  float edge = uFade * 0.5;\r
  if (edge > 0.0) {\r
    mask *= smootherstep01(uv.x / edge) * smootherstep01((1.0 - uv.x) / edge);\r
    mask *= smootherstep01(uv.y / edge) * smootherstep01((1.0 - uv.y) / edge);\r
  }\r
\r
  if (uLightMode > 0.5) {\r
    float energy = max(result.r, max(result.g, result.b));\r
    vec3 hue = result / max(energy, 0.001);\r
    float coverage = smoothstep(0.025, 0.95, energy);\r
    hue = pow(clamp(hue, 0.0, 1.0), vec3(1.25));\r
    vec3 tinted = mix(vec3(1.0), hue, coverage * 0.94 * mask);\r
    vec3 ink = vec3(1.0) - pow(result, vec3(1.6)) * 0.85 * mask;\r
    result = mix(tinted, ink, uNeutral);\r
  } else {\r
    result *= mask;\r
  }\r
  outColor = vec4(result, 1.0);\r
}\`;\r
\r
const QUALITY: Record<string, number> = { low: 0.35, medium: 0.5, high: 0.6 };\r
const INTRO_SECONDS = 2.1;\r
const PULSE_LIFE = 1.4;\r
const MIN_SCALE = 0.25;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);\r
const ease = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);\r
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
const link = (gl: WebGL2RenderingContext, fragmentSource: string): Program | null => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);\r
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
  const uniforms: Uniforms = {};\r
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
  for (let i = 0; i < count; i++) {\r
    const info = gl.getActiveUniform(program, i);\r
    if (info) uniforms[info.name.replace(/\\[0\\]$/, '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const LightPillar = ({\r
  topColor = '#5227FF',\r
  bottomColor = '#FF9FFC',\r
  intensity = 1.0,\r
  rotationSpeed = 0.3,\r
  flow = 1,\r
  interactive = true,\r
  clickPulse = true,\r
  glowAmount = 0.002,\r
  bloom = 0.5,\r
  pillarWidth = 3.0,\r
  pillarHeight = 0.4,\r
  pillarRotation = 25,\r
  twist = 0.4,\r
  detail = 4,\r
  noiseIntensity = 0.5,\r
  fade = 0,\r
  intro = true,\r
  mixBlendMode = 'screen',\r
  quality = 'high',\r
  resolution,\r
  lightMode = false,\r
  paused = false,\r
  className = '',\r
  style\r
}: LightPillarProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settingsRef = useRef<Settings>(null as unknown as Settings);\r
  const [generation, setGeneration] = useState(0);\r
  settingsRef.current = {\r
    topColor: String(topColor),\r
    bottomColor: String(bottomColor),\r
    intensity: Math.max(0, intensity),\r
    rotationSpeed,\r
    flow,\r
    interactive,\r
    clickPulse,\r
    glowAmount: Math.max(0, glowAmount),\r
    bloom: Math.max(0, bloom),\r
    pillarWidth: Math.max(0.05, pillarWidth),\r
    pillarHeight,\r
    pillarRotation,\r
    twist,\r
    detail: Math.round(clamp(detail, 1, 6)),\r
    noiseIntensity: Math.max(0, noiseIntensity),\r
    fade: clamp(fade, 0, 1),\r
    intro,\r
    scale: clamp(resolution ?? QUALITY[quality] ?? QUALITY.high, MIN_SCALE, 2),\r
    lightMode,\r
    paused\r
  };\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    const gl = canvas?.getContext('webgl2', {\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false,\r
      powerPreference: 'high-performance'\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const floatTargets = !!gl.getExtension('EXT_color_buffer_float');\r
    const marchProgram = link(gl, MARCH);\r
    const compositeProgram = link(gl, COMPOSITE);\r
    if (!marchProgram || !compositeProgram) return undefined;\r
\r
    const onContextLost = (event: Event) => {\r
      event.preventDefault();\r
    };\r
    const onContextRestored = () => setGeneration(value => value + 1);\r
    canvas.addEventListener('webglcontextlost', onContextLost);\r
    canvas.addEventListener('webglcontextrestored', onContextRestored);\r
\r
    const buffer = gl.createBuffer();\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    let texture: WebGLTexture | null = null;\r
    const framebuffer = gl.createFramebuffer();\r
    const target = { width: 0, height: 0 };\r
    const sizeTarget = (width: number, height: number) => {\r
      if (target.width === width && target.height === height) return;\r
      target.width = width;\r
      target.height = height;\r
      if (texture) gl.deleteTexture(texture);\r
      texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      const levels = Math.floor(Math.log2(Math.max(width, height))) + 1;\r
      gl.texStorage2D(gl.TEXTURE_2D, levels, floatTargets ? gl.RGBA16F : gl.RGBA8, width, height);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
    };\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const colorCache = new Map<string, number[]>();\r
    const toRgb = (value: string): number[] => {\r
      if (colorCache.has(value)) return colorCache.get(value) as number[];\r
      let rgb = [1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#ffffff';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      colorCache.set(value, rgb);\r
      return rgb;\r
    };\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1, ratio: 1 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const pulses: Pulse[] = [];\r
    const pulseData = new Float32Array(12);\r
    const state = {\r
      clock: 0,\r
      intro: settingsRef.current.intro && !reduce ? 0 : 1,\r
      touch: 0,\r
      spin: 0,\r
      lean: 0,\r
      shift: 0,\r
      governor: 1,\r
      slow: 0,\r
      quick: 0\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const axisAt = (x: number, y: number, angle: number) => {\r
      const aspect = view.width / view.height;\r
      const px = ((x / view.width) * 2 - 1) * aspect - state.shift;\r
      const py = 1 - (y / view.height) * 2;\r
      return Math.sin(angle) * px + Math.cos(angle) * py;\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const scale = Math.max(MIN_SCALE, s.scale * state.governor);\r
      const fieldWidth = Math.max(1, Math.round(view.width * scale));\r
      const fieldHeight = Math.max(1, Math.round(view.height * scale));\r
      sizeTarget(fieldWidth, fieldHeight);\r
\r
      const grow = ease(state.intro);\r
      const rise = easeOut(state.intro);\r
      const tilt = ((s.pillarRotation + state.lean) * Math.PI) / 180;\r
      const angle = state.clock * 0.3 + state.spin;\r
      const width = s.pillarWidth * (0.3 + 0.7 * grow);\r
\r
      gl.bindVertexArray(vao);\r
      const m = marchProgram.uniforms;\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.viewport(0, 0, target.width, target.height);\r
      gl.useProgram(marchProgram.program);\r
      gl.uniform1f(m.uTime, state.clock * s.flow);\r
      gl.uniform2f(m.uResolution, view.width, view.height);\r
      gl.uniform2f(m.uTarget, target.width, target.height);\r
      gl.uniform2f(m.uRot, Math.cos(angle), Math.sin(angle));\r
      gl.uniform2f(m.uPillarRot, Math.cos(tilt), Math.sin(tilt));\r
      gl.uniform2f(m.uWave, Math.sin(s.twist), Math.cos(s.twist));\r
      gl.uniform1f(m.uShift, state.shift);\r
      gl.uniform1f(m.uPillarWidth, width);\r
      gl.uniform1f(m.uPillarHeight, s.pillarHeight);\r
      gl.uniform1i(m.uDetail, s.detail);\r
      gl.uniform3fv(m.uTopColor, toRgb(s.topColor));\r
      gl.uniform3fv(m.uBottomColor, toRgb(s.bottomColor));\r
      gl.uniform1f(m.uGlowAmount, s.glowAmount);\r
      gl.uniform1f(m.uWidthNorm, width / 3);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      if (s.bloom > 0) gl.generateMipmap(gl.TEXTURE_2D);\r
\r
      pulseData.fill(0);\r
      pulses.forEach((pulse, index) => {\r
        pulseData.set([pulse.axis + pulse.age * 1.7, Math.exp(-pulse.age / (PULSE_LIFE * 0.45)), 0, 0], index * 4);\r
      });\r
\r
      const c = compositeProgram.uniforms;\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(compositeProgram.program);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.uniform1i(c.uField, 0);\r
      gl.uniform2f(c.uFieldSize, target.width, target.height);\r
      gl.uniform2f(c.uView, canvas.width, canvas.height);\r
      gl.uniform2f(c.uAspect, view.width / view.height, 1);\r
      gl.uniform2f(c.uPillarRot, Math.cos(tilt), Math.sin(tilt));\r
      gl.uniform1f(c.uShift, state.shift);\r
      gl.uniform1f(c.uIntensity, s.intensity * (0.15 + 0.85 * rise) * (1 + 0.12 * state.touch));\r
      gl.uniform1f(c.uNoiseIntensity, s.noiseIntensity);\r
      gl.uniform1f(c.uLightMode, s.lightMode ? 1 : 0);\r
      const chroma = (rgb: number[]) => Math.max(...rgb) - Math.min(...rgb);\r
      const vivid = Math.max(chroma(toRgb(s.topColor)), chroma(toRgb(s.bottomColor)));\r
      gl.uniform1f(c.uNeutral, 1 - clamp((vivid - 0.08) / 0.12, 0, 1));\r
      gl.uniform1f(c.uBloom, s.bloom);\r
      gl.uniform1f(c.uFade, s.fade);\r
      const span = view.width / view.height + 1.2;\r
      gl.uniform1f(c.uReveal, state.intro >= 1 ? 1e4 : -span + rise * (span * 2 + 1.2));\r
      gl.uniform1f(c.uFlare, state.intro >= 1 ? 0 : (1 - rise) * 1.3 * Math.min(1, state.intro * 8));\r
      gl.uniform4fv(c.uPulses, pulseData);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const tune = (dt: number) => {\r
      if (dt > 1 / 40) {\r
        state.slow += 1;\r
        state.quick = 0;\r
      } else if (dt < 1 / 55) {\r
        state.quick += 1;\r
        state.slow = 0;\r
      }\r
      if (state.slow > 20) {\r
        state.governor = Math.max(0.5, state.governor * 0.85);\r
        state.slow = 0;\r
      } else if (state.quick > 180 && state.governor < 1) {\r
        state.governor = Math.min(1, state.governor * 1.1);\r
        state.quick = 0;\r
      }\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      if (last) tune((now - last) / 1000);\r
      last = now;\r
      const running = !s.paused && !reduce && s.rotationSpeed !== 0;\r
      if (running) state.clock += dt * 0.96 * s.rotationSpeed;\r
      if (!s.intro || reduce) state.intro = 1;\r
      else if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / INTRO_SECONDS);\r
\r
      const engaged = s.interactive && pointer.inside && !reduce;\r
      const aim = engaged ? pointer.x / view.width - 0.5 : 0;\r
      const follow = 1 - Math.exp(-dt * 2.4);\r
      state.spin += (aim * 1.4 - state.spin) * follow;\r
      state.lean += (aim * 9 - state.lean) * follow;\r
      state.shift += (aim * 0.35 * (view.width / view.height) - state.shift) * follow;\r
      state.touch += ((engaged ? 1 : 0) - state.touch) * (1 - Math.exp(-dt * 3));\r
\r
      for (let i = pulses.length - 1; i >= 0; i--) {\r
        pulses[i].age += dt;\r
        if (pulses[i].age > PULSE_LIFE * 2.2) pulses.splice(i, 1);\r
      }\r
\r
      render();\r
\r
      const settling =\r
        state.intro < 1 ||\r
        pulses.length > 0 ||\r
        Math.abs(aim * 1.4 - state.spin) > 0.0005 ||\r
        Math.abs((engaged ? 1 : 0) - state.touch) > 0.002;\r
      if (running || settling) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const resize = () => {\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const ratio = Math.min(window.devicePixelRatio || 1, 2);\r
      view.width = width;\r
      view.height = height;\r
      view.ratio = ratio;\r
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      if (!raf) render();\r
      wake();\r
    };\r
\r
    const locate = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const point = locate(event);\r
      pointer.x = point.x;\r
      pointer.y = point.y;\r
      pointer.inside = point.inside;\r
      wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      if (!s.clickPulse || reduce) return;\r
      const point = locate(event);\r
      if (!point.inside) return;\r
      const tilt = ((s.pillarRotation + state.lean) * Math.PI) / 180;\r
      pulses.push({ axis: axisAt(point.x, point.y, tilt), age: 0 });\r
      if (pulses.length > 3) pulses.shift();\r
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
    resize();\r
\r
    wakeRef.current = () => {\r
      if (!raf) render();\r
      wake();\r
    };\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      canvas.removeEventListener('webglcontextlost', onContextLost);\r
      canvas.removeEventListener('webglcontextrestored', onContextRestored);\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      if (texture) gl.deleteTexture(texture);\r
      gl.deleteFramebuffer(framebuffer);\r
      gl.deleteProgram(marchProgram.program);\r
      gl.deleteProgram(compositeProgram.program);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      if (!gl.isContextLost()) gl.getExtension('WEBGL_lose_context')?.loseContext();\r
    };\r
  }, [generation]);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div\r
      ref={containerRef}\r
      className={\`absolute top-0 left-0 w-full h-full overflow-hidden \${className}\`}\r
      style={{ mixBlendMode, ...style }}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default LightPillar;\r
`,i={usage:`import LightPillar from './LightPillar';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <LightPillar
    topColor="#5227FF"
    bottomColor="#FF9FFC"
    intensity={1}
    glowAmount={0.002}
    bloom={0.5}
    pillarWidth={3}
    pillarHeight={0.4}
    pillarRotation={25}
    rotationSpeed={0.3}
    interactive
    clickPulse
    intro
    quality="high"
    mixBlendMode="screen"
  />
</div>`,code:r,css:n,tailwind:e,tsCode:t,tsTailwind:o};export{i as lightPillar};
