const r=`'use client';\r
\r
import { useEffect, useRef, useState } from 'react';\r
import './LiquidChrome.css';\r
\r
const PIXEL_BUDGET = 2.4e6;\r
const SIM_CELL = 4;\r
const SIM_STEP = 1 / 120;\r
\r
const VERTEX = \`#version 300 es\r
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));\r
void main() {\r
  gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);\r
}\`;\r
\r
const SIM = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uState;\r
uniform vec2 uSize;\r
uniform vec4 uStroke;\r
uniform vec2 uImpulse;\r
out vec4 fragColor;\r
\r
float segment(vec2 p, vec2 a, vec2 b) {\r
  vec2 ab = b - a;\r
  float t = clamp(dot(p - a, ab) / max(dot(ab, ab), 1e-4), 0.0, 1.0);\r
  return length(p - a - ab * t);\r
}\r
\r
void main() {\r
  vec2 texel = 1.0 / uSize;\r
  vec2 uv = gl_FragCoord.xy * texel;\r
  vec2 state = texture(uState, uv).rg;\r
  vec2 around =\r
    texture(uState, uv - vec2(texel.x, 0.0)).rg +\r
    texture(uState, uv + vec2(texel.x, 0.0)).rg +\r
    texture(uState, uv - vec2(0.0, texel.y)).rg +\r
    texture(uState, uv + vec2(0.0, texel.y)).rg -\r
    4.0 * state;\r
  float next = state.r + (state.r - state.g) * 0.982 + 0.3 * around.r + 0.08 * (around.r - around.g);\r
  next *= 0.998;\r
  if (uImpulse.x != 0.0) {\r
    float d = segment(gl_FragCoord.xy, uStroke.xy, uStroke.zw) / uImpulse.y;\r
    next += uImpulse.x * exp(-d * d);\r
  }\r
  fragColor = vec4(next, state.r, 0.0, 1.0);\r
}\`;\r
\r
const SLOPE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uState;\r
uniform vec2 uSize;\r
out vec4 fragColor;\r
\r
void main() {\r
  vec2 texel = 1.0 / uSize;\r
  vec2 uv = gl_FragCoord.xy * texel;\r
  float left = texture(uState, uv - vec2(texel.x, 0.0)).r;\r
  float right = texture(uState, uv + vec2(texel.x, 0.0)).r;\r
  float down = texture(uState, uv - vec2(0.0, texel.y)).r;\r
  float up = texture(uState, uv + vec2(0.0, texel.y)).r;\r
  fragColor = vec4((right - left) * 0.5, (up - down) * 0.5, 0.0, 1.0);\r
}\`;\r
\r
const CHROME = \`#version 300 es\r
precision highp float;\r
uniform vec2 uResolution;\r
uniform float uUnit;\r
uniform float uTime;\r
uniform float uAmplitude;\r
uniform vec2 uFrequency;\r
uniform float uDetail;\r
uniform float uSharpness;\r
uniform float uDepth;\r
uniform float uPresence;\r
uniform vec3 uTint;\r
uniform vec2 uShift;\r
uniform float uRoughness;\r
uniform float uExposure;\r
uniform float uLight;\r
uniform sampler2D uSlope;\r
uniform vec2 uSlopeSize;\r
uniform float uRipple;\r
out vec4 fragColor;\r
\r
vec2 slopeAt(vec2 uv) {\r
  vec2 st = uv * uSlopeSize - 0.5;\r
  vec2 i = floor(st);\r
  vec2 f = st - i;\r
  vec2 f2 = f * f;\r
  vec2 f3 = f2 * f;\r
  vec2 w0 = (-f3 + 3.0 * f2 - 3.0 * f + 1.0) / 6.0;\r
  vec2 w1 = (3.0 * f3 - 6.0 * f2 + 4.0) / 6.0;\r
  vec2 w2 = (-3.0 * f3 + 3.0 * f2 + 3.0 * f + 1.0) / 6.0;\r
  vec2 w3 = f3 / 6.0;\r
  vec2 g0 = w0 + w1;\r
  vec2 g1 = w2 + w3;\r
  vec2 h0 = (i - 0.5 + w1 / g0) / uSlopeSize;\r
  vec2 h1 = (i + 1.5 + w3 / g1) / uSlopeSize;\r
  vec2 a = texture(uSlope, vec2(h0.x, h0.y)).rg;\r
  vec2 b = texture(uSlope, vec2(h1.x, h0.y)).rg;\r
  vec2 c = texture(uSlope, vec2(h0.x, h1.y)).rg;\r
  vec2 d = texture(uSlope, vec2(h1.x, h1.y)).rg;\r
  return g0.y * (g0.x * a + g1.x * b) + g1.y * (g0.x * c + g1.x * d);\r
}\r
\r
float lamp(vec2 p, vec2 center, vec2 size, float soft) {\r
  vec2 grown = size + soft;\r
  vec2 q = (p - center) / grown;\r
  q *= q;\r
  float d = sqrt(sqrt(dot(q, q)));\r
  float edge = soft / min(grown.x, grown.y);\r
  float shape = (1.0 - smoothstep(1.0 - edge, 1.0 + edge, d)) * (1.0 - 0.45 * d * d);\r
  return shape * size.x * size.y / (grown.x * grown.y);\r
}\r
\r
vec3 studio(vec3 r, float blur) {\r
  vec2 p = r.xy / max(r.z + 1.0, 0.05);\r
  p += uShift * smoothstep(0.3, 1.0, length(p));\r
  float radius = length(p);\r
  float soft = 0.008 + blur;\r
  vec2 dir = p / max(radius, 1e-3);\r
  float key = lamp(p, vec2(-0.25, 0.42), vec2(0.3, 0.12), soft);\r
  float side = lamp(p, vec2(0.48, 0.12), vec2(0.06, 0.3), soft);\r
  float ground = lamp(p, vec2(-0.1, -0.55), vec2(0.45, 0.06), soft);\r
  float rise = smoothstep(-1.0, 1.0, dir.y);\r
  if (uLight > 0.5) {\r
    float edge = 0.008 + blur * 0.8;\r
    float lobe = smoothstep(0.15, 0.85, 0.5 + 0.5 * sin(atan(dir.y, dir.x) * 2.0 + 0.9));\r
    float tone = mix(2.4, 0.95, smoothstep(0.5 - edge, 1.0 + edge, radius));\r
    tone = mix(tone, 0.02, smoothstep(0.98 - edge, 1.12 + edge, radius));\r
    tone = mix(tone, mix(0.03, 0.3, lobe) * (0.8 + 0.4 * rise), smoothstep(1.15 - edge, 1.3 + edge, radius));\r
    float width = 0.035 + edge;\r
    tone += 2.4 * exp(-pow((radius - 1.4) / width, 2.0)) * min(1.0, 0.06 / width) * (0.6 + 0.4 * rise);\r
    return vec3(tone) * (1.0 - 0.5 * side) * (1.0 - 0.3 * ground) + 0.8 * key;\r
  }\r
  float width = 0.015 + soft * 2.0;\r
  float rim = exp(-abs(radius - 1.0) / width) * 0.031 / width * (0.8 + smoothstep(-0.5, 0.8, p.y));\r
  float band = 1.0 - 0.95 * smoothstep(1.04 - soft, 1.12 + soft, radius);\r
  float wall = smoothstep(1.25, 1.55, radius) * (0.6 + 0.4 * rise);\r
  float streak = smoothstep(0.2, 0.8, 0.5 + 0.5 * sin(atan(dir.y, dir.x) * 3.0 + 0.6));\r
  vec3 color = vec3(0.004, 0.004, 0.005) + 0.02 * smoothstep(-0.4, 0.6, p.y);\r
  color += vec3(1.0, 0.97, 0.94) * key * 4.0 + vec3(0.9, 0.95, 1.0) * side * 3.0 + ground * 1.2;\r
  color += vec3(1.0, 0.98, 0.95) * rim;\r
  color *= band;\r
  return color + vec3(mix(0.45, 1.8, streak)) * wall;\r
}\r
\r
vec3 shade(vec2 slope, vec3 v, float blur, vec3 f0) {\r
  float steep = length(slope);\r
  slope *= 3.0 * tanh(steep / 3.0) / max(steep, 1e-6);\r
  vec3 n = normalize(vec3(-slope, 1.0));\r
  vec3 r = reflect(v, n);\r
  float facing = clamp(dot(n, -v), 0.0, 1.0);\r
  return studio(r, blur) * (f0 + (1.0 - f0) * pow(1.0 - facing, 5.0));\r
}\r
\r
vec3 aces(vec3 x) {\r
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);\r
}\r
\r
void main() {\r
  vec2 frag = gl_FragCoord.xy;\r
  vec2 uv = (2.0 * frag - uResolution) / uUnit;\r
  vec2 p = uv;\r
  vec2 rowX = vec2(1.0, 0.0);\r
  vec2 rowY = vec2(0.0, 1.0);\r
  float amplitude = uAmplitude * uPresence;\r
  for (float i = 1.0; i < 9.0; i++) {\r
    if (i > uDetail) break;\r
    float a = amplitude / i;\r
    float soften = exp(0.3 - 0.3 * i);\r
    float argX = i * uFrequency.x * p.y + uTime;\r
    p.x += a * cos(argX);\r
    rowX -= a * sin(argX) * i * uFrequency.x * soften * rowY;\r
    float argY = i * uFrequency.y * p.x + uTime;\r
    p.y += a * cos(argY);\r
    rowY -= a * sin(argY) * i * uFrequency.y * soften * rowX;\r
  }\r
  float phase = uTime - p.x - p.y;\r
  vec2 field = -(rowX + rowY);\r
  float density = max(length(field), 1e-3);\r
  vec2 across = field / density;\r
  float k = uSharpness;\r
  float sn = sin(phase);\r
  float cs = cos(phase);\r
  float th = tanh(k * sn);\r
  float bevel = (1.0 - th * th) / tanh(k);\r
  float fade = smoothstep(3.0, 9.0, 3.14159 * uUnit / density);\r
  float weight = uDepth * uPresence * fade;\r
  vec2 slope = k * cs * bevel * weight * across + slopeAt(frag / uResolution) * uRipple;\r
  vec2 sweep = -k * bevel * (sn + 2.0 * k * cs * cs * th) * weight * density * 2.0 / uUnit * across;\r
  vec2 stepX = dFdx(slope);\r
  vec2 stepY = dFdy(slope);\r
  vec2 crease = dot(stepX, stepX) > dot(stepY, stepY) ? stepX : stepY;\r
  if (dot(crease, crease) > dot(sweep, sweep)) sweep = crease;\r
  float bend = length(sweep);\r
  float alpha = smoothstep(0.0, 0.1, length(slope));\r
  vec3 f0 = mix(vec3(1.0), uTint, smoothstep(0.05, 0.6, length(slope))) * 0.92;\r
  vec3 v = normalize(vec3(uv * 0.08, -1.0));\r
  float blur = uRoughness * 0.35;\r
  vec3 light;\r
  if (bend < 0.01) {\r
    light = shade(slope, v, blur + bend * 0.5, f0);\r
  } else {\r
    light = vec3(0.0);\r
    for (float t = -0.375; t < 0.4; t += 0.25) {\r
      light += shade(slope + sweep * t, v, blur + bend * 0.15, f0);\r
    }\r
    light *= 0.25;\r
  }\r
  vec3 color = pow(aces(light * uExposure), vec3(1.0 / 2.2));\r
  float grain = fract(52.9829189 * fract(dot(frag, vec2(0.06711056, 0.00583715))));\r
  color += (grain - 0.5) / 255.0;\r
  fragColor = vec4(clamp(color, 0.0, 1.0) * alpha, alpha);\r
}\`;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const parseColor = value => {\r
  if (Array.isArray(value)) return [0, 1, 2].map(index => clamp(Number(value[index]) || 0, 0, 1));\r
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
const link = (gl, fragmentSource) => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);\r
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
const LiquidChrome = ({\r
  color = '#ffffff',\r
  speed = 0.2,\r
  amplitude = 0.3,\r
  frequencyX = 3,\r
  frequencyY = 3,\r
  detail = 4,\r
  thickness = 1,\r
  depth = 1,\r
  roughness = 0.3,\r
  exposure = 1,\r
  interactive = true,\r
  rippleStrength = 1,\r
  rippleSize = 1,\r
  tilt = 1,\r
  intro = true,\r
  lightMode = false,\r
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
    tint: parseColor(color).map(channel => Math.pow(channel, 2.2)),\r
    speed: Math.max(0, speed),\r
    amplitude: clamp(amplitude, 0, 2),\r
    frequency: [Math.max(0.1, frequencyX), Math.max(0.1, frequencyY)],\r
    detail: clamp(Math.round(detail), 1, 8),\r
    thickness: clamp(thickness, 0.25, 4),\r
    depth: Math.max(0, depth),\r
    roughness: clamp(roughness, 0, 1),\r
    exposure: Math.max(0, exposure),\r
    interactive,\r
    rippleStrength: Math.max(0, rippleStrength),\r
    rippleSize: clamp(rippleSize, 0.2, 4),\r
    tilt: Math.max(0, tilt),\r
    intro,\r
    light: lightMode,\r
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
    const chrome = gl ? link(gl, CHROME) : null;\r
    if (!gl || !chrome) return;\r
    const fluid = Boolean(gl.getExtension('EXT_color_buffer_float'));\r
    const sim = fluid ? link(gl, SIM) : null;\r
    const slope = fluid ? link(gl, SLOPE) : null;\r
\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
    const vao = gl.createVertexArray();\r
    const grid = { width: 1, height: 1 };\r
    const targets = [];\r
    let slopeTarget = null;\r
    let current = 0;\r
    let unit = 1;\r
    const pointer = { x: 0, y: 0, inside: false, ready: false, nx: 0, ny: 0 };\r
    const view = { yaw: 0, pitch: 0, vyaw: 0, vpitch: 0 };\r
    const strokes = [];\r
    let time = Math.random() * 40;\r
    let presence = settingsRef.current.intro && !reduced && generation === 0 ? 0 : 1;\r
    let energy = 0;\r
    let accumulator = 0;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let pageVisible = document.visibilityState !== 'hidden';\r
    let lost = false;\r
\r
    const makeTarget = (width, height) => {\r
      const texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG16F, width, height, 0, gl.RG, gl.HALF_FLOAT, null);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      const framebuffer = gl.createFramebuffer();\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
      gl.clearColor(0, 0, 0, 1);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      return { texture, framebuffer };\r
    };\r
\r
    const dropTarget = target => {\r
      if (!target) return;\r
      gl.deleteTexture(target.texture);\r
      gl.deleteFramebuffer(target.framebuffer);\r
    };\r
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
      unit = Math.min(width, height);\r
      if (!fluid || !sim || !slope) return;\r
      const gridWidth = clamp(Math.round(cssWidth / SIM_CELL), 16, 512);\r
      const gridHeight = clamp(Math.round(cssHeight / SIM_CELL), 16, 512);\r
      if (gridWidth === grid.width && gridHeight === grid.height && targets.length) return;\r
      targets.forEach(dropTarget);\r
      targets.length = 0;\r
      dropTarget(slopeTarget);\r
      Object.assign(grid, { width: gridWidth, height: gridHeight });\r
      targets.push(makeTarget(gridWidth, gridHeight), makeTarget(gridWidth, gridHeight));\r
      slopeTarget = makeTarget(gridWidth, gridHeight);\r
    };\r
\r
    const simulate = steps => {\r
      if (!sim || !slope || !slopeTarget) return;\r
      gl.useProgram(sim.program);\r
      gl.viewport(0, 0, grid.width, grid.height);\r
      gl.uniform2f(sim.uniforms.uSize, grid.width, grid.height);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.uniform1i(sim.uniforms.uState, 0);\r
      for (let step = 0; step < steps; step++) {\r
        const stroke = step === 0 ? strokes.shift() : null;\r
        if (stroke) {\r
          gl.uniform4f(sim.uniforms.uStroke, stroke.ax, stroke.ay, stroke.bx, stroke.by);\r
          gl.uniform2f(sim.uniforms.uImpulse, stroke.strength, stroke.radius);\r
        } else {\r
          gl.uniform2f(sim.uniforms.uImpulse, 0, 1);\r
        }\r
        const source = targets[current];\r
        const destination = targets[1 - current];\r
        gl.bindTexture(gl.TEXTURE_2D, source.texture);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, destination.framebuffer);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
        current = 1 - current;\r
      }\r
      gl.useProgram(slope.program);\r
      gl.uniform2f(slope.uniforms.uSize, grid.width, grid.height);\r
      gl.uniform1i(slope.uniforms.uState, 0);\r
      gl.bindTexture(gl.TEXTURE_2D, targets[current].texture);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, slopeTarget.framebuffer);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const render = s => {\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      const u = chrome.uniforms;\r
      gl.useProgram(chrome.program);\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(u.uUnit, unit);\r
      gl.uniform1f(u.uTime, time);\r
      gl.uniform1f(u.uAmplitude, s.amplitude);\r
      gl.uniform2f(u.uFrequency, s.frequency[0], s.frequency[1]);\r
      gl.uniform1f(u.uDepth, s.depth);\r
      gl.uniform1f(u.uDetail, s.detail);\r
      gl.uniform1f(u.uSharpness, 5 / (3 * s.thickness));\r
      gl.uniform1f(u.uPresence, 1 - Math.pow(1 - presence, 3));\r
      gl.uniform3fv(u.uTint, s.tint);\r
      gl.uniform2f(u.uShift, view.yaw, view.pitch);\r
      gl.uniform1f(u.uRoughness, s.roughness);\r
      gl.uniform1f(u.uExposure, s.exposure);\r
      gl.uniform1f(u.uLight, s.light ? 1 : 0);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, slopeTarget ? slopeTarget.texture : null);\r
      gl.uniform1i(u.uSlope, 0);\r
      gl.uniform2f(u.uSlopeSize, grid.width, grid.height);\r
      gl.uniform1f(u.uRipple, slopeTarget ? s.rippleStrength * 2.2 : 0);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (lost) return;\r
      const s = settingsRef.current;\r
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05);\r
      last = Math.max(last, now);\r
      time += dt * s.speed * (reduced ? 0.25 : 1);\r
      presence = Math.min(1, presence + dt / 1.8);\r
\r
      const hovering = s.interactive && pointer.inside;\r
      const reach = reduced ? 0 : s.tilt;\r
      const targetYaw = (hovering ? pointer.nx * 0.35 : 0.22 * Math.sin(time * 1.3)) * reach;\r
      const targetPitch = (hovering ? -pointer.ny * 0.28 : 0.16 * Math.sin(time * 0.9 + 1.7)) * reach;\r
      const stiffness = 36;\r
      const damping = 2 * Math.sqrt(stiffness) * 0.95;\r
      view.vyaw += ((targetYaw - view.yaw) * stiffness - view.vyaw * damping) * dt;\r
      view.vpitch += ((targetPitch - view.pitch) * stiffness - view.vpitch * damping) * dt;\r
      view.yaw += view.vyaw * dt;\r
      view.pitch += view.vpitch * dt;\r
\r
      gl.bindVertexArray(vao);\r
      if (slopeTarget) {\r
        accumulator += dt;\r
        const steps = Math.min(4, Math.floor(accumulator / SIM_STEP));\r
        accumulator -= steps * SIM_STEP;\r
        if (steps > 0) {\r
          simulate(steps);\r
          energy = Math.max(0, energy * Math.pow(0.982, steps));\r
        }\r
      }\r
      render(s);\r
\r
      const settling =\r
        Math.abs(view.vyaw) + Math.abs(view.vpitch) > 1e-4 ||\r
        Math.abs(targetYaw - view.yaw) + Math.abs(targetPitch - view.pitch) > 1e-4;\r
      const busy = s.speed > 0 || presence < 1 || settling || energy > 0.002 || strokes.length > 0;\r
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
    const toGrid = (clientX, clientY) => {\r
      const rect = container.getBoundingClientRect();\r
      return {\r
        x: ((clientX - rect.left) / rect.width) * grid.width,\r
        y: (1 - (clientY - rect.top) / rect.height) * grid.height,\r
        nx: ((clientX - rect.left) / rect.width) * 2 - 1,\r
        ny: ((clientY - rect.top) / rect.height) * 2 - 1,\r
        inside: clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom\r
      };\r
    };\r
\r
    const push = (stroke, s) => {\r
      if (!slopeTarget || !s.interactive || reduced) return;\r
      strokes.push(stroke);\r
      if (strokes.length > 6) strokes.shift();\r
      energy = 1;\r
    };\r
\r
    const onPointerMove = event => {\r
      const s = settingsRef.current;\r
      const spot = toGrid(event.clientX, event.clientY);\r
      pointer.nx = clamp(spot.nx, -1, 1);\r
      pointer.ny = clamp(spot.ny, -1, 1);\r
      pointer.inside = spot.inside;\r
      if (spot.inside && pointer.ready) {\r
        const travel = Math.hypot(spot.x - pointer.x, spot.y - pointer.y);\r
        if (travel > 0.25) {\r
          push(\r
            {\r
              ax: pointer.x,\r
              ay: pointer.y,\r
              bx: spot.x,\r
              by: spot.y,\r
              strength: -Math.min(0.45, 0.04 + travel * 0.045) * s.rippleSize,\r
              radius: 4 * s.rippleSize\r
            },\r
            s\r
          );\r
        }\r
      }\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.ready = spot.inside;\r
      wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      const spot = toGrid(event.clientX, event.clientY);\r
      if (!spot.inside) return;\r
      push(\r
        { ax: spot.x, ay: spot.y, bx: spot.x, by: spot.y, strength: -1.6 * s.rippleSize, radius: 6 * s.rippleSize },\r
        s\r
      );\r
      wake();\r
    };\r
\r
    const onLeave = () => {\r
      pointer.inside = false;\r
      pointer.ready = false;\r
      wake();\r
    };\r
\r
    const onPointerUp = event => {\r
      if (event.pointerType !== 'mouse') onLeave();\r
    };\r
\r
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
        targets.forEach(dropTarget);\r
        dropTarget(slopeTarget);\r
        gl.deleteVertexArray(vao);\r
        gl.deleteProgram(chrome.program);\r
        if (sim) gl.deleteProgram(sim.program);\r
        if (slope) gl.deleteProgram(slope.program);\r
      }\r
    };\r
  }, [generation]);\r
\r
  return (\r
    <div ref={containerRef} className={\`liquid-chrome\${className ? \` \${className}\` : ''}\`} style={style}>\r
      <canvas ref={canvasRef} className="liquid-chrome__canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default LiquidChrome;\r
`,e=`.liquid-chrome {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.liquid-chrome__canvas {\r
  position: absolute;\r
  inset: 0;\r
  display: block;\r
  width: 100%;\r
  height: 100%;\r
}\r
`,n=`'use client';\r
\r
import { useEffect, useRef, useState } from 'react';\r
\r
const PIXEL_BUDGET = 2.4e6;\r
const SIM_CELL = 4;\r
const SIM_STEP = 1 / 120;\r
\r
const VERTEX = \`#version 300 es\r
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));\r
void main() {\r
  gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);\r
}\`;\r
\r
const SIM = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uState;\r
uniform vec2 uSize;\r
uniform vec4 uStroke;\r
uniform vec2 uImpulse;\r
out vec4 fragColor;\r
\r
float segment(vec2 p, vec2 a, vec2 b) {\r
  vec2 ab = b - a;\r
  float t = clamp(dot(p - a, ab) / max(dot(ab, ab), 1e-4), 0.0, 1.0);\r
  return length(p - a - ab * t);\r
}\r
\r
void main() {\r
  vec2 texel = 1.0 / uSize;\r
  vec2 uv = gl_FragCoord.xy * texel;\r
  vec2 state = texture(uState, uv).rg;\r
  vec2 around =\r
    texture(uState, uv - vec2(texel.x, 0.0)).rg +\r
    texture(uState, uv + vec2(texel.x, 0.0)).rg +\r
    texture(uState, uv - vec2(0.0, texel.y)).rg +\r
    texture(uState, uv + vec2(0.0, texel.y)).rg -\r
    4.0 * state;\r
  float next = state.r + (state.r - state.g) * 0.982 + 0.3 * around.r + 0.08 * (around.r - around.g);\r
  next *= 0.998;\r
  if (uImpulse.x != 0.0) {\r
    float d = segment(gl_FragCoord.xy, uStroke.xy, uStroke.zw) / uImpulse.y;\r
    next += uImpulse.x * exp(-d * d);\r
  }\r
  fragColor = vec4(next, state.r, 0.0, 1.0);\r
}\`;\r
\r
const SLOPE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uState;\r
uniform vec2 uSize;\r
out vec4 fragColor;\r
\r
void main() {\r
  vec2 texel = 1.0 / uSize;\r
  vec2 uv = gl_FragCoord.xy * texel;\r
  float left = texture(uState, uv - vec2(texel.x, 0.0)).r;\r
  float right = texture(uState, uv + vec2(texel.x, 0.0)).r;\r
  float down = texture(uState, uv - vec2(0.0, texel.y)).r;\r
  float up = texture(uState, uv + vec2(0.0, texel.y)).r;\r
  fragColor = vec4((right - left) * 0.5, (up - down) * 0.5, 0.0, 1.0);\r
}\`;\r
\r
const CHROME = \`#version 300 es\r
precision highp float;\r
uniform vec2 uResolution;\r
uniform float uUnit;\r
uniform float uTime;\r
uniform float uAmplitude;\r
uniform vec2 uFrequency;\r
uniform float uDetail;\r
uniform float uSharpness;\r
uniform float uDepth;\r
uniform float uPresence;\r
uniform vec3 uTint;\r
uniform vec2 uShift;\r
uniform float uRoughness;\r
uniform float uExposure;\r
uniform float uLight;\r
uniform sampler2D uSlope;\r
uniform vec2 uSlopeSize;\r
uniform float uRipple;\r
out vec4 fragColor;\r
\r
vec2 slopeAt(vec2 uv) {\r
  vec2 st = uv * uSlopeSize - 0.5;\r
  vec2 i = floor(st);\r
  vec2 f = st - i;\r
  vec2 f2 = f * f;\r
  vec2 f3 = f2 * f;\r
  vec2 w0 = (-f3 + 3.0 * f2 - 3.0 * f + 1.0) / 6.0;\r
  vec2 w1 = (3.0 * f3 - 6.0 * f2 + 4.0) / 6.0;\r
  vec2 w2 = (-3.0 * f3 + 3.0 * f2 + 3.0 * f + 1.0) / 6.0;\r
  vec2 w3 = f3 / 6.0;\r
  vec2 g0 = w0 + w1;\r
  vec2 g1 = w2 + w3;\r
  vec2 h0 = (i - 0.5 + w1 / g0) / uSlopeSize;\r
  vec2 h1 = (i + 1.5 + w3 / g1) / uSlopeSize;\r
  vec2 a = texture(uSlope, vec2(h0.x, h0.y)).rg;\r
  vec2 b = texture(uSlope, vec2(h1.x, h0.y)).rg;\r
  vec2 c = texture(uSlope, vec2(h0.x, h1.y)).rg;\r
  vec2 d = texture(uSlope, vec2(h1.x, h1.y)).rg;\r
  return g0.y * (g0.x * a + g1.x * b) + g1.y * (g0.x * c + g1.x * d);\r
}\r
\r
float lamp(vec2 p, vec2 center, vec2 size, float soft) {\r
  vec2 grown = size + soft;\r
  vec2 q = (p - center) / grown;\r
  q *= q;\r
  float d = sqrt(sqrt(dot(q, q)));\r
  float edge = soft / min(grown.x, grown.y);\r
  float shape = (1.0 - smoothstep(1.0 - edge, 1.0 + edge, d)) * (1.0 - 0.45 * d * d);\r
  return shape * size.x * size.y / (grown.x * grown.y);\r
}\r
\r
vec3 studio(vec3 r, float blur) {\r
  vec2 p = r.xy / max(r.z + 1.0, 0.05);\r
  p += uShift * smoothstep(0.3, 1.0, length(p));\r
  float radius = length(p);\r
  float soft = 0.008 + blur;\r
  vec2 dir = p / max(radius, 1e-3);\r
  float key = lamp(p, vec2(-0.25, 0.42), vec2(0.3, 0.12), soft);\r
  float side = lamp(p, vec2(0.48, 0.12), vec2(0.06, 0.3), soft);\r
  float ground = lamp(p, vec2(-0.1, -0.55), vec2(0.45, 0.06), soft);\r
  float rise = smoothstep(-1.0, 1.0, dir.y);\r
  if (uLight > 0.5) {\r
    float edge = 0.008 + blur * 0.8;\r
    float lobe = smoothstep(0.15, 0.85, 0.5 + 0.5 * sin(atan(dir.y, dir.x) * 2.0 + 0.9));\r
    float tone = mix(2.4, 0.95, smoothstep(0.5 - edge, 1.0 + edge, radius));\r
    tone = mix(tone, 0.02, smoothstep(0.98 - edge, 1.12 + edge, radius));\r
    tone = mix(tone, mix(0.03, 0.3, lobe) * (0.8 + 0.4 * rise), smoothstep(1.15 - edge, 1.3 + edge, radius));\r
    float width = 0.035 + edge;\r
    tone += 2.4 * exp(-pow((radius - 1.4) / width, 2.0)) * min(1.0, 0.06 / width) * (0.6 + 0.4 * rise);\r
    return vec3(tone) * (1.0 - 0.5 * side) * (1.0 - 0.3 * ground) + 0.8 * key;\r
  }\r
  float width = 0.015 + soft * 2.0;\r
  float rim = exp(-abs(radius - 1.0) / width) * 0.031 / width * (0.8 + smoothstep(-0.5, 0.8, p.y));\r
  float band = 1.0 - 0.95 * smoothstep(1.04 - soft, 1.12 + soft, radius);\r
  float wall = smoothstep(1.25, 1.55, radius) * (0.6 + 0.4 * rise);\r
  float streak = smoothstep(0.2, 0.8, 0.5 + 0.5 * sin(atan(dir.y, dir.x) * 3.0 + 0.6));\r
  vec3 color = vec3(0.004, 0.004, 0.005) + 0.02 * smoothstep(-0.4, 0.6, p.y);\r
  color += vec3(1.0, 0.97, 0.94) * key * 4.0 + vec3(0.9, 0.95, 1.0) * side * 3.0 + ground * 1.2;\r
  color += vec3(1.0, 0.98, 0.95) * rim;\r
  color *= band;\r
  return color + vec3(mix(0.45, 1.8, streak)) * wall;\r
}\r
\r
vec3 shade(vec2 slope, vec3 v, float blur, vec3 f0) {\r
  float steep = length(slope);\r
  slope *= 3.0 * tanh(steep / 3.0) / max(steep, 1e-6);\r
  vec3 n = normalize(vec3(-slope, 1.0));\r
  vec3 r = reflect(v, n);\r
  float facing = clamp(dot(n, -v), 0.0, 1.0);\r
  return studio(r, blur) * (f0 + (1.0 - f0) * pow(1.0 - facing, 5.0));\r
}\r
\r
vec3 aces(vec3 x) {\r
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);\r
}\r
\r
void main() {\r
  vec2 frag = gl_FragCoord.xy;\r
  vec2 uv = (2.0 * frag - uResolution) / uUnit;\r
  vec2 p = uv;\r
  vec2 rowX = vec2(1.0, 0.0);\r
  vec2 rowY = vec2(0.0, 1.0);\r
  float amplitude = uAmplitude * uPresence;\r
  for (float i = 1.0; i < 9.0; i++) {\r
    if (i > uDetail) break;\r
    float a = amplitude / i;\r
    float soften = exp(0.3 - 0.3 * i);\r
    float argX = i * uFrequency.x * p.y + uTime;\r
    p.x += a * cos(argX);\r
    rowX -= a * sin(argX) * i * uFrequency.x * soften * rowY;\r
    float argY = i * uFrequency.y * p.x + uTime;\r
    p.y += a * cos(argY);\r
    rowY -= a * sin(argY) * i * uFrequency.y * soften * rowX;\r
  }\r
  float phase = uTime - p.x - p.y;\r
  vec2 field = -(rowX + rowY);\r
  float density = max(length(field), 1e-3);\r
  vec2 across = field / density;\r
  float k = uSharpness;\r
  float sn = sin(phase);\r
  float cs = cos(phase);\r
  float th = tanh(k * sn);\r
  float bevel = (1.0 - th * th) / tanh(k);\r
  float fade = smoothstep(3.0, 9.0, 3.14159 * uUnit / density);\r
  float weight = uDepth * uPresence * fade;\r
  vec2 slope = k * cs * bevel * weight * across + slopeAt(frag / uResolution) * uRipple;\r
  vec2 sweep = -k * bevel * (sn + 2.0 * k * cs * cs * th) * weight * density * 2.0 / uUnit * across;\r
  vec2 stepX = dFdx(slope);\r
  vec2 stepY = dFdy(slope);\r
  vec2 crease = dot(stepX, stepX) > dot(stepY, stepY) ? stepX : stepY;\r
  if (dot(crease, crease) > dot(sweep, sweep)) sweep = crease;\r
  float bend = length(sweep);\r
  float alpha = smoothstep(0.0, 0.1, length(slope));\r
  vec3 f0 = mix(vec3(1.0), uTint, smoothstep(0.05, 0.6, length(slope))) * 0.92;\r
  vec3 v = normalize(vec3(uv * 0.08, -1.0));\r
  float blur = uRoughness * 0.35;\r
  vec3 light;\r
  if (bend < 0.01) {\r
    light = shade(slope, v, blur + bend * 0.5, f0);\r
  } else {\r
    light = vec3(0.0);\r
    for (float t = -0.375; t < 0.4; t += 0.25) {\r
      light += shade(slope + sweep * t, v, blur + bend * 0.15, f0);\r
    }\r
    light *= 0.25;\r
  }\r
  vec3 color = pow(aces(light * uExposure), vec3(1.0 / 2.2));\r
  float grain = fract(52.9829189 * fract(dot(frag, vec2(0.06711056, 0.00583715))));\r
  color += (grain - 0.5) / 255.0;\r
  fragColor = vec4(clamp(color, 0.0, 1.0) * alpha, alpha);\r
}\`;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const parseColor = value => {\r
  if (Array.isArray(value)) return [0, 1, 2].map(index => clamp(Number(value[index]) || 0, 0, 1));\r
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
const link = (gl, fragmentSource) => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);\r
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
const LiquidChrome = ({\r
  color = '#ffffff',\r
  speed = 0.2,\r
  amplitude = 0.3,\r
  frequencyX = 3,\r
  frequencyY = 3,\r
  detail = 4,\r
  thickness = 1,\r
  depth = 1,\r
  roughness = 0.3,\r
  exposure = 1,\r
  interactive = true,\r
  rippleStrength = 1,\r
  rippleSize = 1,\r
  tilt = 1,\r
  intro = true,\r
  lightMode = false,\r
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
    tint: parseColor(color).map(channel => Math.pow(channel, 2.2)),\r
    speed: Math.max(0, speed),\r
    amplitude: clamp(amplitude, 0, 2),\r
    frequency: [Math.max(0.1, frequencyX), Math.max(0.1, frequencyY)],\r
    detail: clamp(Math.round(detail), 1, 8),\r
    thickness: clamp(thickness, 0.25, 4),\r
    depth: Math.max(0, depth),\r
    roughness: clamp(roughness, 0, 1),\r
    exposure: Math.max(0, exposure),\r
    interactive,\r
    rippleStrength: Math.max(0, rippleStrength),\r
    rippleSize: clamp(rippleSize, 0.2, 4),\r
    tilt: Math.max(0, tilt),\r
    intro,\r
    light: lightMode,\r
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
    const chrome = gl ? link(gl, CHROME) : null;\r
    if (!gl || !chrome) return;\r
    const fluid = Boolean(gl.getExtension('EXT_color_buffer_float'));\r
    const sim = fluid ? link(gl, SIM) : null;\r
    const slope = fluid ? link(gl, SLOPE) : null;\r
\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
    const vao = gl.createVertexArray();\r
    const grid = { width: 1, height: 1 };\r
    const targets = [];\r
    let slopeTarget = null;\r
    let current = 0;\r
    let unit = 1;\r
    const pointer = { x: 0, y: 0, inside: false, ready: false, nx: 0, ny: 0 };\r
    const view = { yaw: 0, pitch: 0, vyaw: 0, vpitch: 0 };\r
    const strokes = [];\r
    let time = Math.random() * 40;\r
    let presence = settingsRef.current.intro && !reduced && generation === 0 ? 0 : 1;\r
    let energy = 0;\r
    let accumulator = 0;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let pageVisible = document.visibilityState !== 'hidden';\r
    let lost = false;\r
\r
    const makeTarget = (width, height) => {\r
      const texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG16F, width, height, 0, gl.RG, gl.HALF_FLOAT, null);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      const framebuffer = gl.createFramebuffer();\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
      gl.clearColor(0, 0, 0, 1);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      return { texture, framebuffer };\r
    };\r
\r
    const dropTarget = target => {\r
      if (!target) return;\r
      gl.deleteTexture(target.texture);\r
      gl.deleteFramebuffer(target.framebuffer);\r
    };\r
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
      unit = Math.min(width, height);\r
      if (!fluid || !sim || !slope) return;\r
      const gridWidth = clamp(Math.round(cssWidth / SIM_CELL), 16, 512);\r
      const gridHeight = clamp(Math.round(cssHeight / SIM_CELL), 16, 512);\r
      if (gridWidth === grid.width && gridHeight === grid.height && targets.length) return;\r
      targets.forEach(dropTarget);\r
      targets.length = 0;\r
      dropTarget(slopeTarget);\r
      Object.assign(grid, { width: gridWidth, height: gridHeight });\r
      targets.push(makeTarget(gridWidth, gridHeight), makeTarget(gridWidth, gridHeight));\r
      slopeTarget = makeTarget(gridWidth, gridHeight);\r
    };\r
\r
    const simulate = steps => {\r
      if (!sim || !slope || !slopeTarget) return;\r
      gl.useProgram(sim.program);\r
      gl.viewport(0, 0, grid.width, grid.height);\r
      gl.uniform2f(sim.uniforms.uSize, grid.width, grid.height);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.uniform1i(sim.uniforms.uState, 0);\r
      for (let step = 0; step < steps; step++) {\r
        const stroke = step === 0 ? strokes.shift() : null;\r
        if (stroke) {\r
          gl.uniform4f(sim.uniforms.uStroke, stroke.ax, stroke.ay, stroke.bx, stroke.by);\r
          gl.uniform2f(sim.uniforms.uImpulse, stroke.strength, stroke.radius);\r
        } else {\r
          gl.uniform2f(sim.uniforms.uImpulse, 0, 1);\r
        }\r
        const source = targets[current];\r
        const destination = targets[1 - current];\r
        gl.bindTexture(gl.TEXTURE_2D, source.texture);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, destination.framebuffer);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
        current = 1 - current;\r
      }\r
      gl.useProgram(slope.program);\r
      gl.uniform2f(slope.uniforms.uSize, grid.width, grid.height);\r
      gl.uniform1i(slope.uniforms.uState, 0);\r
      gl.bindTexture(gl.TEXTURE_2D, targets[current].texture);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, slopeTarget.framebuffer);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const render = s => {\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      const u = chrome.uniforms;\r
      gl.useProgram(chrome.program);\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(u.uUnit, unit);\r
      gl.uniform1f(u.uTime, time);\r
      gl.uniform1f(u.uAmplitude, s.amplitude);\r
      gl.uniform2f(u.uFrequency, s.frequency[0], s.frequency[1]);\r
      gl.uniform1f(u.uDepth, s.depth);\r
      gl.uniform1f(u.uDetail, s.detail);\r
      gl.uniform1f(u.uSharpness, 5 / (3 * s.thickness));\r
      gl.uniform1f(u.uPresence, 1 - Math.pow(1 - presence, 3));\r
      gl.uniform3fv(u.uTint, s.tint);\r
      gl.uniform2f(u.uShift, view.yaw, view.pitch);\r
      gl.uniform1f(u.uRoughness, s.roughness);\r
      gl.uniform1f(u.uExposure, s.exposure);\r
      gl.uniform1f(u.uLight, s.light ? 1 : 0);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, slopeTarget ? slopeTarget.texture : null);\r
      gl.uniform1i(u.uSlope, 0);\r
      gl.uniform2f(u.uSlopeSize, grid.width, grid.height);\r
      gl.uniform1f(u.uRipple, slopeTarget ? s.rippleStrength * 2.2 : 0);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (lost) return;\r
      const s = settingsRef.current;\r
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05);\r
      last = Math.max(last, now);\r
      time += dt * s.speed * (reduced ? 0.25 : 1);\r
      presence = Math.min(1, presence + dt / 1.8);\r
\r
      const hovering = s.interactive && pointer.inside;\r
      const reach = reduced ? 0 : s.tilt;\r
      const targetYaw = (hovering ? pointer.nx * 0.35 : 0.22 * Math.sin(time * 1.3)) * reach;\r
      const targetPitch = (hovering ? -pointer.ny * 0.28 : 0.16 * Math.sin(time * 0.9 + 1.7)) * reach;\r
      const stiffness = 36;\r
      const damping = 2 * Math.sqrt(stiffness) * 0.95;\r
      view.vyaw += ((targetYaw - view.yaw) * stiffness - view.vyaw * damping) * dt;\r
      view.vpitch += ((targetPitch - view.pitch) * stiffness - view.vpitch * damping) * dt;\r
      view.yaw += view.vyaw * dt;\r
      view.pitch += view.vpitch * dt;\r
\r
      gl.bindVertexArray(vao);\r
      if (slopeTarget) {\r
        accumulator += dt;\r
        const steps = Math.min(4, Math.floor(accumulator / SIM_STEP));\r
        accumulator -= steps * SIM_STEP;\r
        if (steps > 0) {\r
          simulate(steps);\r
          energy = Math.max(0, energy * Math.pow(0.982, steps));\r
        }\r
      }\r
      render(s);\r
\r
      const settling =\r
        Math.abs(view.vyaw) + Math.abs(view.vpitch) > 1e-4 ||\r
        Math.abs(targetYaw - view.yaw) + Math.abs(targetPitch - view.pitch) > 1e-4;\r
      const busy = s.speed > 0 || presence < 1 || settling || energy > 0.002 || strokes.length > 0;\r
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
    const toGrid = (clientX, clientY) => {\r
      const rect = container.getBoundingClientRect();\r
      return {\r
        x: ((clientX - rect.left) / rect.width) * grid.width,\r
        y: (1 - (clientY - rect.top) / rect.height) * grid.height,\r
        nx: ((clientX - rect.left) / rect.width) * 2 - 1,\r
        ny: ((clientY - rect.top) / rect.height) * 2 - 1,\r
        inside: clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom\r
      };\r
    };\r
\r
    const push = (stroke, s) => {\r
      if (!slopeTarget || !s.interactive || reduced) return;\r
      strokes.push(stroke);\r
      if (strokes.length > 6) strokes.shift();\r
      energy = 1;\r
    };\r
\r
    const onPointerMove = event => {\r
      const s = settingsRef.current;\r
      const spot = toGrid(event.clientX, event.clientY);\r
      pointer.nx = clamp(spot.nx, -1, 1);\r
      pointer.ny = clamp(spot.ny, -1, 1);\r
      pointer.inside = spot.inside;\r
      if (spot.inside && pointer.ready) {\r
        const travel = Math.hypot(spot.x - pointer.x, spot.y - pointer.y);\r
        if (travel > 0.25) {\r
          push(\r
            {\r
              ax: pointer.x,\r
              ay: pointer.y,\r
              bx: spot.x,\r
              by: spot.y,\r
              strength: -Math.min(0.45, 0.04 + travel * 0.045) * s.rippleSize,\r
              radius: 4 * s.rippleSize\r
            },\r
            s\r
          );\r
        }\r
      }\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.ready = spot.inside;\r
      wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      const spot = toGrid(event.clientX, event.clientY);\r
      if (!spot.inside) return;\r
      push(\r
        { ax: spot.x, ay: spot.y, bx: spot.x, by: spot.y, strength: -1.6 * s.rippleSize, radius: 6 * s.rippleSize },\r
        s\r
      );\r
      wake();\r
    };\r
\r
    const onLeave = () => {\r
      pointer.inside = false;\r
      pointer.ready = false;\r
      wake();\r
    };\r
\r
    const onPointerUp = event => {\r
      if (event.pointerType !== 'mouse') onLeave();\r
    };\r
\r
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
        targets.forEach(dropTarget);\r
        dropTarget(slopeTarget);\r
        gl.deleteVertexArray(vao);\r
        gl.deleteProgram(chrome.program);\r
        if (sim) gl.deleteProgram(sim.program);\r
        if (slope) gl.deleteProgram(slope.program);\r
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
export default LiquidChrome;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, useState, type CSSProperties } from 'react';\r
import './LiquidChrome.css';\r
\r
export interface LiquidChromeProps {\r
  color?: string | number[];\r
  speed?: number;\r
  amplitude?: number;\r
  frequencyX?: number;\r
  frequencyY?: number;\r
  detail?: number;\r
  thickness?: number;\r
  depth?: number;\r
  roughness?: number;\r
  exposure?: number;\r
  interactive?: boolean;\r
  rippleStrength?: number;\r
  rippleSize?: number;\r
  tilt?: number;\r
  intro?: boolean;\r
  lightMode?: boolean;\r
  maxDevicePixelRatio?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Settings {\r
  tint: number[];\r
  speed: number;\r
  amplitude: number;\r
  frequency: number[];\r
  detail: number;\r
  thickness: number;\r
  depth: number;\r
  roughness: number;\r
  exposure: number;\r
  interactive: boolean;\r
  rippleStrength: number;\r
  rippleSize: number;\r
  tilt: number;\r
  intro: boolean;\r
  light: boolean;\r
  maxRatio: number;\r
}\r
\r
interface Program {\r
  program: WebGLProgram;\r
  uniforms: Record<string, WebGLUniformLocation | null>;\r
}\r
\r
interface Target {\r
  texture: WebGLTexture | null;\r
  framebuffer: WebGLFramebuffer | null;\r
}\r
\r
interface Stroke {\r
  ax: number;\r
  ay: number;\r
  bx: number;\r
  by: number;\r
  strength: number;\r
  radius: number;\r
}\r
\r
const PIXEL_BUDGET = 2.4e6;\r
const SIM_CELL = 4;\r
const SIM_STEP = 1 / 120;\r
\r
const VERTEX = \`#version 300 es\r
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));\r
void main() {\r
  gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);\r
}\`;\r
\r
const SIM = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uState;\r
uniform vec2 uSize;\r
uniform vec4 uStroke;\r
uniform vec2 uImpulse;\r
out vec4 fragColor;\r
\r
float segment(vec2 p, vec2 a, vec2 b) {\r
  vec2 ab = b - a;\r
  float t = clamp(dot(p - a, ab) / max(dot(ab, ab), 1e-4), 0.0, 1.0);\r
  return length(p - a - ab * t);\r
}\r
\r
void main() {\r
  vec2 texel = 1.0 / uSize;\r
  vec2 uv = gl_FragCoord.xy * texel;\r
  vec2 state = texture(uState, uv).rg;\r
  vec2 around =\r
    texture(uState, uv - vec2(texel.x, 0.0)).rg +\r
    texture(uState, uv + vec2(texel.x, 0.0)).rg +\r
    texture(uState, uv - vec2(0.0, texel.y)).rg +\r
    texture(uState, uv + vec2(0.0, texel.y)).rg -\r
    4.0 * state;\r
  float next = state.r + (state.r - state.g) * 0.982 + 0.3 * around.r + 0.08 * (around.r - around.g);\r
  next *= 0.998;\r
  if (uImpulse.x != 0.0) {\r
    float d = segment(gl_FragCoord.xy, uStroke.xy, uStroke.zw) / uImpulse.y;\r
    next += uImpulse.x * exp(-d * d);\r
  }\r
  fragColor = vec4(next, state.r, 0.0, 1.0);\r
}\`;\r
\r
const SLOPE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uState;\r
uniform vec2 uSize;\r
out vec4 fragColor;\r
\r
void main() {\r
  vec2 texel = 1.0 / uSize;\r
  vec2 uv = gl_FragCoord.xy * texel;\r
  float left = texture(uState, uv - vec2(texel.x, 0.0)).r;\r
  float right = texture(uState, uv + vec2(texel.x, 0.0)).r;\r
  float down = texture(uState, uv - vec2(0.0, texel.y)).r;\r
  float up = texture(uState, uv + vec2(0.0, texel.y)).r;\r
  fragColor = vec4((right - left) * 0.5, (up - down) * 0.5, 0.0, 1.0);\r
}\`;\r
\r
const CHROME = \`#version 300 es\r
precision highp float;\r
uniform vec2 uResolution;\r
uniform float uUnit;\r
uniform float uTime;\r
uniform float uAmplitude;\r
uniform vec2 uFrequency;\r
uniform float uDetail;\r
uniform float uSharpness;\r
uniform float uDepth;\r
uniform float uPresence;\r
uniform vec3 uTint;\r
uniform vec2 uShift;\r
uniform float uRoughness;\r
uniform float uExposure;\r
uniform float uLight;\r
uniform sampler2D uSlope;\r
uniform vec2 uSlopeSize;\r
uniform float uRipple;\r
out vec4 fragColor;\r
\r
vec2 slopeAt(vec2 uv) {\r
  vec2 st = uv * uSlopeSize - 0.5;\r
  vec2 i = floor(st);\r
  vec2 f = st - i;\r
  vec2 f2 = f * f;\r
  vec2 f3 = f2 * f;\r
  vec2 w0 = (-f3 + 3.0 * f2 - 3.0 * f + 1.0) / 6.0;\r
  vec2 w1 = (3.0 * f3 - 6.0 * f2 + 4.0) / 6.0;\r
  vec2 w2 = (-3.0 * f3 + 3.0 * f2 + 3.0 * f + 1.0) / 6.0;\r
  vec2 w3 = f3 / 6.0;\r
  vec2 g0 = w0 + w1;\r
  vec2 g1 = w2 + w3;\r
  vec2 h0 = (i - 0.5 + w1 / g0) / uSlopeSize;\r
  vec2 h1 = (i + 1.5 + w3 / g1) / uSlopeSize;\r
  vec2 a = texture(uSlope, vec2(h0.x, h0.y)).rg;\r
  vec2 b = texture(uSlope, vec2(h1.x, h0.y)).rg;\r
  vec2 c = texture(uSlope, vec2(h0.x, h1.y)).rg;\r
  vec2 d = texture(uSlope, vec2(h1.x, h1.y)).rg;\r
  return g0.y * (g0.x * a + g1.x * b) + g1.y * (g0.x * c + g1.x * d);\r
}\r
\r
float lamp(vec2 p, vec2 center, vec2 size, float soft) {\r
  vec2 grown = size + soft;\r
  vec2 q = (p - center) / grown;\r
  q *= q;\r
  float d = sqrt(sqrt(dot(q, q)));\r
  float edge = soft / min(grown.x, grown.y);\r
  float shape = (1.0 - smoothstep(1.0 - edge, 1.0 + edge, d)) * (1.0 - 0.45 * d * d);\r
  return shape * size.x * size.y / (grown.x * grown.y);\r
}\r
\r
vec3 studio(vec3 r, float blur) {\r
  vec2 p = r.xy / max(r.z + 1.0, 0.05);\r
  p += uShift * smoothstep(0.3, 1.0, length(p));\r
  float radius = length(p);\r
  float soft = 0.008 + blur;\r
  vec2 dir = p / max(radius, 1e-3);\r
  float key = lamp(p, vec2(-0.25, 0.42), vec2(0.3, 0.12), soft);\r
  float side = lamp(p, vec2(0.48, 0.12), vec2(0.06, 0.3), soft);\r
  float ground = lamp(p, vec2(-0.1, -0.55), vec2(0.45, 0.06), soft);\r
  float rise = smoothstep(-1.0, 1.0, dir.y);\r
  if (uLight > 0.5) {\r
    float edge = 0.008 + blur * 0.8;\r
    float lobe = smoothstep(0.15, 0.85, 0.5 + 0.5 * sin(atan(dir.y, dir.x) * 2.0 + 0.9));\r
    float tone = mix(2.4, 0.95, smoothstep(0.5 - edge, 1.0 + edge, radius));\r
    tone = mix(tone, 0.02, smoothstep(0.98 - edge, 1.12 + edge, radius));\r
    tone = mix(tone, mix(0.03, 0.3, lobe) * (0.8 + 0.4 * rise), smoothstep(1.15 - edge, 1.3 + edge, radius));\r
    float width = 0.035 + edge;\r
    tone += 2.4 * exp(-pow((radius - 1.4) / width, 2.0)) * min(1.0, 0.06 / width) * (0.6 + 0.4 * rise);\r
    return vec3(tone) * (1.0 - 0.5 * side) * (1.0 - 0.3 * ground) + 0.8 * key;\r
  }\r
  float width = 0.015 + soft * 2.0;\r
  float rim = exp(-abs(radius - 1.0) / width) * 0.031 / width * (0.8 + smoothstep(-0.5, 0.8, p.y));\r
  float band = 1.0 - 0.95 * smoothstep(1.04 - soft, 1.12 + soft, radius);\r
  float wall = smoothstep(1.25, 1.55, radius) * (0.6 + 0.4 * rise);\r
  float streak = smoothstep(0.2, 0.8, 0.5 + 0.5 * sin(atan(dir.y, dir.x) * 3.0 + 0.6));\r
  vec3 color = vec3(0.004, 0.004, 0.005) + 0.02 * smoothstep(-0.4, 0.6, p.y);\r
  color += vec3(1.0, 0.97, 0.94) * key * 4.0 + vec3(0.9, 0.95, 1.0) * side * 3.0 + ground * 1.2;\r
  color += vec3(1.0, 0.98, 0.95) * rim;\r
  color *= band;\r
  return color + vec3(mix(0.45, 1.8, streak)) * wall;\r
}\r
\r
vec3 shade(vec2 slope, vec3 v, float blur, vec3 f0) {\r
  float steep = length(slope);\r
  slope *= 3.0 * tanh(steep / 3.0) / max(steep, 1e-6);\r
  vec3 n = normalize(vec3(-slope, 1.0));\r
  vec3 r = reflect(v, n);\r
  float facing = clamp(dot(n, -v), 0.0, 1.0);\r
  return studio(r, blur) * (f0 + (1.0 - f0) * pow(1.0 - facing, 5.0));\r
}\r
\r
vec3 aces(vec3 x) {\r
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);\r
}\r
\r
void main() {\r
  vec2 frag = gl_FragCoord.xy;\r
  vec2 uv = (2.0 * frag - uResolution) / uUnit;\r
  vec2 p = uv;\r
  vec2 rowX = vec2(1.0, 0.0);\r
  vec2 rowY = vec2(0.0, 1.0);\r
  float amplitude = uAmplitude * uPresence;\r
  for (float i = 1.0; i < 9.0; i++) {\r
    if (i > uDetail) break;\r
    float a = amplitude / i;\r
    float soften = exp(0.3 - 0.3 * i);\r
    float argX = i * uFrequency.x * p.y + uTime;\r
    p.x += a * cos(argX);\r
    rowX -= a * sin(argX) * i * uFrequency.x * soften * rowY;\r
    float argY = i * uFrequency.y * p.x + uTime;\r
    p.y += a * cos(argY);\r
    rowY -= a * sin(argY) * i * uFrequency.y * soften * rowX;\r
  }\r
  float phase = uTime - p.x - p.y;\r
  vec2 field = -(rowX + rowY);\r
  float density = max(length(field), 1e-3);\r
  vec2 across = field / density;\r
  float k = uSharpness;\r
  float sn = sin(phase);\r
  float cs = cos(phase);\r
  float th = tanh(k * sn);\r
  float bevel = (1.0 - th * th) / tanh(k);\r
  float fade = smoothstep(3.0, 9.0, 3.14159 * uUnit / density);\r
  float weight = uDepth * uPresence * fade;\r
  vec2 slope = k * cs * bevel * weight * across + slopeAt(frag / uResolution) * uRipple;\r
  vec2 sweep = -k * bevel * (sn + 2.0 * k * cs * cs * th) * weight * density * 2.0 / uUnit * across;\r
  vec2 stepX = dFdx(slope);\r
  vec2 stepY = dFdy(slope);\r
  vec2 crease = dot(stepX, stepX) > dot(stepY, stepY) ? stepX : stepY;\r
  if (dot(crease, crease) > dot(sweep, sweep)) sweep = crease;\r
  float bend = length(sweep);\r
  float alpha = smoothstep(0.0, 0.1, length(slope));\r
  vec3 f0 = mix(vec3(1.0), uTint, smoothstep(0.05, 0.6, length(slope))) * 0.92;\r
  vec3 v = normalize(vec3(uv * 0.08, -1.0));\r
  float blur = uRoughness * 0.35;\r
  vec3 light;\r
  if (bend < 0.01) {\r
    light = shade(slope, v, blur + bend * 0.5, f0);\r
  } else {\r
    light = vec3(0.0);\r
    for (float t = -0.375; t < 0.4; t += 0.25) {\r
      light += shade(slope + sweep * t, v, blur + bend * 0.15, f0);\r
    }\r
    light *= 0.25;\r
  }\r
  vec3 color = pow(aces(light * uExposure), vec3(1.0 / 2.2));\r
  float grain = fract(52.9829189 * fract(dot(frag, vec2(0.06711056, 0.00583715))));\r
  color += (grain - 0.5) / 255.0;\r
  fragColor = vec4(clamp(color, 0.0, 1.0) * alpha, alpha);\r
}\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const parseColor = (value: string | number[]): number[] => {\r
  if (Array.isArray(value)) return [0, 1, 2].map(index => clamp(Number(value[index]) || 0, 0, 1));\r
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
const link = (gl: WebGL2RenderingContext, fragmentSource: string): Program | null => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);\r
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
const LiquidChrome = ({\r
  color = '#ffffff',\r
  speed = 0.2,\r
  amplitude = 0.3,\r
  frequencyX = 3,\r
  frequencyY = 3,\r
  detail = 4,\r
  thickness = 1,\r
  depth = 1,\r
  roughness = 0.3,\r
  exposure = 1,\r
  interactive = true,\r
  rippleStrength = 1,\r
  rippleSize = 1,\r
  tilt = 1,\r
  intro = true,\r
  lightMode = false,\r
  maxDevicePixelRatio = 2,\r
  className = '',\r
  style\r
}: LiquidChromeProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const [generation, setGeneration] = useState(0);\r
\r
  const settings: Settings = {\r
    tint: parseColor(color).map(channel => Math.pow(channel, 2.2)),\r
    speed: Math.max(0, speed),\r
    amplitude: clamp(amplitude, 0, 2),\r
    frequency: [Math.max(0.1, frequencyX), Math.max(0.1, frequencyY)],\r
    detail: clamp(Math.round(detail), 1, 8),\r
    thickness: clamp(thickness, 0.25, 4),\r
    depth: Math.max(0, depth),\r
    roughness: clamp(roughness, 0, 1),\r
    exposure: Math.max(0, exposure),\r
    interactive,\r
    rippleStrength: Math.max(0, rippleStrength),\r
    rippleSize: clamp(rippleSize, 0.2, 4),\r
    tilt: Math.max(0, tilt),\r
    intro,\r
    light: lightMode,\r
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
    const chrome = gl ? link(gl, CHROME) : null;\r
    if (!gl || !chrome) return;\r
    const fluid = Boolean(gl.getExtension('EXT_color_buffer_float'));\r
    const sim = fluid ? link(gl, SIM) : null;\r
    const slope = fluid ? link(gl, SLOPE) : null;\r
\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
    const vao = gl.createVertexArray();\r
    const grid = { width: 1, height: 1 };\r
    const targets: Target[] = [];\r
    let slopeTarget: Target | null = null;\r
    let current = 0;\r
    let unit = 1;\r
    const pointer = { x: 0, y: 0, inside: false, ready: false, nx: 0, ny: 0 };\r
    const view = { yaw: 0, pitch: 0, vyaw: 0, vpitch: 0 };\r
    const strokes: Stroke[] = [];\r
    let time = Math.random() * 40;\r
    let presence = settingsRef.current.intro && !reduced && generation === 0 ? 0 : 1;\r
    let energy = 0;\r
    let accumulator = 0;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let pageVisible = document.visibilityState !== 'hidden';\r
    let lost = false;\r
\r
    const makeTarget = (width: number, height: number): Target => {\r
      const texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG16F, width, height, 0, gl.RG, gl.HALF_FLOAT, null);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      const framebuffer = gl.createFramebuffer();\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
      gl.clearColor(0, 0, 0, 1);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      return { texture, framebuffer };\r
    };\r
\r
    const dropTarget = (target: Target | null) => {\r
      if (!target) return;\r
      gl.deleteTexture(target.texture);\r
      gl.deleteFramebuffer(target.framebuffer);\r
    };\r
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
      unit = Math.min(width, height);\r
      if (!fluid || !sim || !slope) return;\r
      const gridWidth = clamp(Math.round(cssWidth / SIM_CELL), 16, 512);\r
      const gridHeight = clamp(Math.round(cssHeight / SIM_CELL), 16, 512);\r
      if (gridWidth === grid.width && gridHeight === grid.height && targets.length) return;\r
      targets.forEach(dropTarget);\r
      targets.length = 0;\r
      dropTarget(slopeTarget);\r
      Object.assign(grid, { width: gridWidth, height: gridHeight });\r
      targets.push(makeTarget(gridWidth, gridHeight), makeTarget(gridWidth, gridHeight));\r
      slopeTarget = makeTarget(gridWidth, gridHeight);\r
    };\r
\r
    const simulate = (steps: number) => {\r
      if (!sim || !slope || !slopeTarget) return;\r
      gl.useProgram(sim.program);\r
      gl.viewport(0, 0, grid.width, grid.height);\r
      gl.uniform2f(sim.uniforms.uSize, grid.width, grid.height);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.uniform1i(sim.uniforms.uState, 0);\r
      for (let step = 0; step < steps; step++) {\r
        const stroke = step === 0 ? strokes.shift() : null;\r
        if (stroke) {\r
          gl.uniform4f(sim.uniforms.uStroke, stroke.ax, stroke.ay, stroke.bx, stroke.by);\r
          gl.uniform2f(sim.uniforms.uImpulse, stroke.strength, stroke.radius);\r
        } else {\r
          gl.uniform2f(sim.uniforms.uImpulse, 0, 1);\r
        }\r
        const source = targets[current];\r
        const destination = targets[1 - current];\r
        gl.bindTexture(gl.TEXTURE_2D, source.texture);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, destination.framebuffer);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
        current = 1 - current;\r
      }\r
      gl.useProgram(slope.program);\r
      gl.uniform2f(slope.uniforms.uSize, grid.width, grid.height);\r
      gl.uniform1i(slope.uniforms.uState, 0);\r
      gl.bindTexture(gl.TEXTURE_2D, targets[current].texture);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, slopeTarget.framebuffer);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const render = (s: Settings) => {\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      const u = chrome.uniforms;\r
      gl.useProgram(chrome.program);\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(u.uUnit, unit);\r
      gl.uniform1f(u.uTime, time);\r
      gl.uniform1f(u.uAmplitude, s.amplitude);\r
      gl.uniform2f(u.uFrequency, s.frequency[0], s.frequency[1]);\r
      gl.uniform1f(u.uDepth, s.depth);\r
      gl.uniform1f(u.uDetail, s.detail);\r
      gl.uniform1f(u.uSharpness, 5 / (3 * s.thickness));\r
      gl.uniform1f(u.uPresence, 1 - Math.pow(1 - presence, 3));\r
      gl.uniform3fv(u.uTint, s.tint);\r
      gl.uniform2f(u.uShift, view.yaw, view.pitch);\r
      gl.uniform1f(u.uRoughness, s.roughness);\r
      gl.uniform1f(u.uExposure, s.exposure);\r
      gl.uniform1f(u.uLight, s.light ? 1 : 0);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, slopeTarget ? slopeTarget.texture : null);\r
      gl.uniform1i(u.uSlope, 0);\r
      gl.uniform2f(u.uSlopeSize, grid.width, grid.height);\r
      gl.uniform1f(u.uRipple, slopeTarget ? s.rippleStrength * 2.2 : 0);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (lost) return;\r
      const s = settingsRef.current;\r
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05);\r
      last = Math.max(last, now);\r
      time += dt * s.speed * (reduced ? 0.25 : 1);\r
      presence = Math.min(1, presence + dt / 1.8);\r
\r
      const hovering = s.interactive && pointer.inside;\r
      const reach = reduced ? 0 : s.tilt;\r
      const targetYaw = (hovering ? pointer.nx * 0.35 : 0.22 * Math.sin(time * 1.3)) * reach;\r
      const targetPitch = (hovering ? -pointer.ny * 0.28 : 0.16 * Math.sin(time * 0.9 + 1.7)) * reach;\r
      const stiffness = 36;\r
      const damping = 2 * Math.sqrt(stiffness) * 0.95;\r
      view.vyaw += ((targetYaw - view.yaw) * stiffness - view.vyaw * damping) * dt;\r
      view.vpitch += ((targetPitch - view.pitch) * stiffness - view.vpitch * damping) * dt;\r
      view.yaw += view.vyaw * dt;\r
      view.pitch += view.vpitch * dt;\r
\r
      gl.bindVertexArray(vao);\r
      if (slopeTarget) {\r
        accumulator += dt;\r
        const steps = Math.min(4, Math.floor(accumulator / SIM_STEP));\r
        accumulator -= steps * SIM_STEP;\r
        if (steps > 0) {\r
          simulate(steps);\r
          energy = Math.max(0, energy * Math.pow(0.982, steps));\r
        }\r
      }\r
      render(s);\r
\r
      const settling =\r
        Math.abs(view.vyaw) + Math.abs(view.vpitch) > 1e-4 ||\r
        Math.abs(targetYaw - view.yaw) + Math.abs(targetPitch - view.pitch) > 1e-4;\r
      const busy = s.speed > 0 || presence < 1 || settling || energy > 0.002 || strokes.length > 0;\r
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
    const toGrid = (clientX: number, clientY: number) => {\r
      const rect = container.getBoundingClientRect();\r
      return {\r
        x: ((clientX - rect.left) / rect.width) * grid.width,\r
        y: (1 - (clientY - rect.top) / rect.height) * grid.height,\r
        nx: ((clientX - rect.left) / rect.width) * 2 - 1,\r
        ny: ((clientY - rect.top) / rect.height) * 2 - 1,\r
        inside: clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom\r
      };\r
    };\r
\r
    const push = (stroke: Stroke, s: Settings) => {\r
      if (!slopeTarget || !s.interactive || reduced) return;\r
      strokes.push(stroke);\r
      if (strokes.length > 6) strokes.shift();\r
      energy = 1;\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      const spot = toGrid(event.clientX, event.clientY);\r
      pointer.nx = clamp(spot.nx, -1, 1);\r
      pointer.ny = clamp(spot.ny, -1, 1);\r
      pointer.inside = spot.inside;\r
      if (spot.inside && pointer.ready) {\r
        const travel = Math.hypot(spot.x - pointer.x, spot.y - pointer.y);\r
        if (travel > 0.25) {\r
          push(\r
            {\r
              ax: pointer.x,\r
              ay: pointer.y,\r
              bx: spot.x,\r
              by: spot.y,\r
              strength: -Math.min(0.45, 0.04 + travel * 0.045) * s.rippleSize,\r
              radius: 4 * s.rippleSize\r
            },\r
            s\r
          );\r
        }\r
      }\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.ready = spot.inside;\r
      wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      const spot = toGrid(event.clientX, event.clientY);\r
      if (!spot.inside) return;\r
      push(\r
        { ax: spot.x, ay: spot.y, bx: spot.x, by: spot.y, strength: -1.6 * s.rippleSize, radius: 6 * s.rippleSize },\r
        s\r
      );\r
      wake();\r
    };\r
\r
    const onLeave = () => {\r
      pointer.inside = false;\r
      pointer.ready = false;\r
      wake();\r
    };\r
\r
    const onPointerUp = (event: PointerEvent) => {\r
      if (event.pointerType !== 'mouse') onLeave();\r
    };\r
\r
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
        targets.forEach(dropTarget);\r
        dropTarget(slopeTarget);\r
        gl.deleteVertexArray(vao);\r
        gl.deleteProgram(chrome.program);\r
        if (sim) gl.deleteProgram(sim.program);\r
        if (slope) gl.deleteProgram(slope.program);\r
      }\r
    };\r
  }, [generation]);\r
\r
  return (\r
    <div ref={containerRef} className={\`liquid-chrome\${className ? \` \${className}\` : ''}\`} style={style}>\r
      <canvas ref={canvasRef} className="liquid-chrome__canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default LiquidChrome;\r
`,i=`'use client';\r
\r
import { useEffect, useRef, useState, type CSSProperties } from 'react';\r
\r
export interface LiquidChromeProps {\r
  color?: string | number[];\r
  speed?: number;\r
  amplitude?: number;\r
  frequencyX?: number;\r
  frequencyY?: number;\r
  detail?: number;\r
  thickness?: number;\r
  depth?: number;\r
  roughness?: number;\r
  exposure?: number;\r
  interactive?: boolean;\r
  rippleStrength?: number;\r
  rippleSize?: number;\r
  tilt?: number;\r
  intro?: boolean;\r
  lightMode?: boolean;\r
  maxDevicePixelRatio?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Settings {\r
  tint: number[];\r
  speed: number;\r
  amplitude: number;\r
  frequency: number[];\r
  detail: number;\r
  thickness: number;\r
  depth: number;\r
  roughness: number;\r
  exposure: number;\r
  interactive: boolean;\r
  rippleStrength: number;\r
  rippleSize: number;\r
  tilt: number;\r
  intro: boolean;\r
  light: boolean;\r
  maxRatio: number;\r
}\r
\r
interface Program {\r
  program: WebGLProgram;\r
  uniforms: Record<string, WebGLUniformLocation | null>;\r
}\r
\r
interface Target {\r
  texture: WebGLTexture | null;\r
  framebuffer: WebGLFramebuffer | null;\r
}\r
\r
interface Stroke {\r
  ax: number;\r
  ay: number;\r
  bx: number;\r
  by: number;\r
  strength: number;\r
  radius: number;\r
}\r
\r
const PIXEL_BUDGET = 2.4e6;\r
const SIM_CELL = 4;\r
const SIM_STEP = 1 / 120;\r
\r
const VERTEX = \`#version 300 es\r
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));\r
void main() {\r
  gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);\r
}\`;\r
\r
const SIM = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uState;\r
uniform vec2 uSize;\r
uniform vec4 uStroke;\r
uniform vec2 uImpulse;\r
out vec4 fragColor;\r
\r
float segment(vec2 p, vec2 a, vec2 b) {\r
  vec2 ab = b - a;\r
  float t = clamp(dot(p - a, ab) / max(dot(ab, ab), 1e-4), 0.0, 1.0);\r
  return length(p - a - ab * t);\r
}\r
\r
void main() {\r
  vec2 texel = 1.0 / uSize;\r
  vec2 uv = gl_FragCoord.xy * texel;\r
  vec2 state = texture(uState, uv).rg;\r
  vec2 around =\r
    texture(uState, uv - vec2(texel.x, 0.0)).rg +\r
    texture(uState, uv + vec2(texel.x, 0.0)).rg +\r
    texture(uState, uv - vec2(0.0, texel.y)).rg +\r
    texture(uState, uv + vec2(0.0, texel.y)).rg -\r
    4.0 * state;\r
  float next = state.r + (state.r - state.g) * 0.982 + 0.3 * around.r + 0.08 * (around.r - around.g);\r
  next *= 0.998;\r
  if (uImpulse.x != 0.0) {\r
    float d = segment(gl_FragCoord.xy, uStroke.xy, uStroke.zw) / uImpulse.y;\r
    next += uImpulse.x * exp(-d * d);\r
  }\r
  fragColor = vec4(next, state.r, 0.0, 1.0);\r
}\`;\r
\r
const SLOPE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uState;\r
uniform vec2 uSize;\r
out vec4 fragColor;\r
\r
void main() {\r
  vec2 texel = 1.0 / uSize;\r
  vec2 uv = gl_FragCoord.xy * texel;\r
  float left = texture(uState, uv - vec2(texel.x, 0.0)).r;\r
  float right = texture(uState, uv + vec2(texel.x, 0.0)).r;\r
  float down = texture(uState, uv - vec2(0.0, texel.y)).r;\r
  float up = texture(uState, uv + vec2(0.0, texel.y)).r;\r
  fragColor = vec4((right - left) * 0.5, (up - down) * 0.5, 0.0, 1.0);\r
}\`;\r
\r
const CHROME = \`#version 300 es\r
precision highp float;\r
uniform vec2 uResolution;\r
uniform float uUnit;\r
uniform float uTime;\r
uniform float uAmplitude;\r
uniform vec2 uFrequency;\r
uniform float uDetail;\r
uniform float uSharpness;\r
uniform float uDepth;\r
uniform float uPresence;\r
uniform vec3 uTint;\r
uniform vec2 uShift;\r
uniform float uRoughness;\r
uniform float uExposure;\r
uniform float uLight;\r
uniform sampler2D uSlope;\r
uniform vec2 uSlopeSize;\r
uniform float uRipple;\r
out vec4 fragColor;\r
\r
vec2 slopeAt(vec2 uv) {\r
  vec2 st = uv * uSlopeSize - 0.5;\r
  vec2 i = floor(st);\r
  vec2 f = st - i;\r
  vec2 f2 = f * f;\r
  vec2 f3 = f2 * f;\r
  vec2 w0 = (-f3 + 3.0 * f2 - 3.0 * f + 1.0) / 6.0;\r
  vec2 w1 = (3.0 * f3 - 6.0 * f2 + 4.0) / 6.0;\r
  vec2 w2 = (-3.0 * f3 + 3.0 * f2 + 3.0 * f + 1.0) / 6.0;\r
  vec2 w3 = f3 / 6.0;\r
  vec2 g0 = w0 + w1;\r
  vec2 g1 = w2 + w3;\r
  vec2 h0 = (i - 0.5 + w1 / g0) / uSlopeSize;\r
  vec2 h1 = (i + 1.5 + w3 / g1) / uSlopeSize;\r
  vec2 a = texture(uSlope, vec2(h0.x, h0.y)).rg;\r
  vec2 b = texture(uSlope, vec2(h1.x, h0.y)).rg;\r
  vec2 c = texture(uSlope, vec2(h0.x, h1.y)).rg;\r
  vec2 d = texture(uSlope, vec2(h1.x, h1.y)).rg;\r
  return g0.y * (g0.x * a + g1.x * b) + g1.y * (g0.x * c + g1.x * d);\r
}\r
\r
float lamp(vec2 p, vec2 center, vec2 size, float soft) {\r
  vec2 grown = size + soft;\r
  vec2 q = (p - center) / grown;\r
  q *= q;\r
  float d = sqrt(sqrt(dot(q, q)));\r
  float edge = soft / min(grown.x, grown.y);\r
  float shape = (1.0 - smoothstep(1.0 - edge, 1.0 + edge, d)) * (1.0 - 0.45 * d * d);\r
  return shape * size.x * size.y / (grown.x * grown.y);\r
}\r
\r
vec3 studio(vec3 r, float blur) {\r
  vec2 p = r.xy / max(r.z + 1.0, 0.05);\r
  p += uShift * smoothstep(0.3, 1.0, length(p));\r
  float radius = length(p);\r
  float soft = 0.008 + blur;\r
  vec2 dir = p / max(radius, 1e-3);\r
  float key = lamp(p, vec2(-0.25, 0.42), vec2(0.3, 0.12), soft);\r
  float side = lamp(p, vec2(0.48, 0.12), vec2(0.06, 0.3), soft);\r
  float ground = lamp(p, vec2(-0.1, -0.55), vec2(0.45, 0.06), soft);\r
  float rise = smoothstep(-1.0, 1.0, dir.y);\r
  if (uLight > 0.5) {\r
    float edge = 0.008 + blur * 0.8;\r
    float lobe = smoothstep(0.15, 0.85, 0.5 + 0.5 * sin(atan(dir.y, dir.x) * 2.0 + 0.9));\r
    float tone = mix(2.4, 0.95, smoothstep(0.5 - edge, 1.0 + edge, radius));\r
    tone = mix(tone, 0.02, smoothstep(0.98 - edge, 1.12 + edge, radius));\r
    tone = mix(tone, mix(0.03, 0.3, lobe) * (0.8 + 0.4 * rise), smoothstep(1.15 - edge, 1.3 + edge, radius));\r
    float width = 0.035 + edge;\r
    tone += 2.4 * exp(-pow((radius - 1.4) / width, 2.0)) * min(1.0, 0.06 / width) * (0.6 + 0.4 * rise);\r
    return vec3(tone) * (1.0 - 0.5 * side) * (1.0 - 0.3 * ground) + 0.8 * key;\r
  }\r
  float width = 0.015 + soft * 2.0;\r
  float rim = exp(-abs(radius - 1.0) / width) * 0.031 / width * (0.8 + smoothstep(-0.5, 0.8, p.y));\r
  float band = 1.0 - 0.95 * smoothstep(1.04 - soft, 1.12 + soft, radius);\r
  float wall = smoothstep(1.25, 1.55, radius) * (0.6 + 0.4 * rise);\r
  float streak = smoothstep(0.2, 0.8, 0.5 + 0.5 * sin(atan(dir.y, dir.x) * 3.0 + 0.6));\r
  vec3 color = vec3(0.004, 0.004, 0.005) + 0.02 * smoothstep(-0.4, 0.6, p.y);\r
  color += vec3(1.0, 0.97, 0.94) * key * 4.0 + vec3(0.9, 0.95, 1.0) * side * 3.0 + ground * 1.2;\r
  color += vec3(1.0, 0.98, 0.95) * rim;\r
  color *= band;\r
  return color + vec3(mix(0.45, 1.8, streak)) * wall;\r
}\r
\r
vec3 shade(vec2 slope, vec3 v, float blur, vec3 f0) {\r
  float steep = length(slope);\r
  slope *= 3.0 * tanh(steep / 3.0) / max(steep, 1e-6);\r
  vec3 n = normalize(vec3(-slope, 1.0));\r
  vec3 r = reflect(v, n);\r
  float facing = clamp(dot(n, -v), 0.0, 1.0);\r
  return studio(r, blur) * (f0 + (1.0 - f0) * pow(1.0 - facing, 5.0));\r
}\r
\r
vec3 aces(vec3 x) {\r
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);\r
}\r
\r
void main() {\r
  vec2 frag = gl_FragCoord.xy;\r
  vec2 uv = (2.0 * frag - uResolution) / uUnit;\r
  vec2 p = uv;\r
  vec2 rowX = vec2(1.0, 0.0);\r
  vec2 rowY = vec2(0.0, 1.0);\r
  float amplitude = uAmplitude * uPresence;\r
  for (float i = 1.0; i < 9.0; i++) {\r
    if (i > uDetail) break;\r
    float a = amplitude / i;\r
    float soften = exp(0.3 - 0.3 * i);\r
    float argX = i * uFrequency.x * p.y + uTime;\r
    p.x += a * cos(argX);\r
    rowX -= a * sin(argX) * i * uFrequency.x * soften * rowY;\r
    float argY = i * uFrequency.y * p.x + uTime;\r
    p.y += a * cos(argY);\r
    rowY -= a * sin(argY) * i * uFrequency.y * soften * rowX;\r
  }\r
  float phase = uTime - p.x - p.y;\r
  vec2 field = -(rowX + rowY);\r
  float density = max(length(field), 1e-3);\r
  vec2 across = field / density;\r
  float k = uSharpness;\r
  float sn = sin(phase);\r
  float cs = cos(phase);\r
  float th = tanh(k * sn);\r
  float bevel = (1.0 - th * th) / tanh(k);\r
  float fade = smoothstep(3.0, 9.0, 3.14159 * uUnit / density);\r
  float weight = uDepth * uPresence * fade;\r
  vec2 slope = k * cs * bevel * weight * across + slopeAt(frag / uResolution) * uRipple;\r
  vec2 sweep = -k * bevel * (sn + 2.0 * k * cs * cs * th) * weight * density * 2.0 / uUnit * across;\r
  vec2 stepX = dFdx(slope);\r
  vec2 stepY = dFdy(slope);\r
  vec2 crease = dot(stepX, stepX) > dot(stepY, stepY) ? stepX : stepY;\r
  if (dot(crease, crease) > dot(sweep, sweep)) sweep = crease;\r
  float bend = length(sweep);\r
  float alpha = smoothstep(0.0, 0.1, length(slope));\r
  vec3 f0 = mix(vec3(1.0), uTint, smoothstep(0.05, 0.6, length(slope))) * 0.92;\r
  vec3 v = normalize(vec3(uv * 0.08, -1.0));\r
  float blur = uRoughness * 0.35;\r
  vec3 light;\r
  if (bend < 0.01) {\r
    light = shade(slope, v, blur + bend * 0.5, f0);\r
  } else {\r
    light = vec3(0.0);\r
    for (float t = -0.375; t < 0.4; t += 0.25) {\r
      light += shade(slope + sweep * t, v, blur + bend * 0.15, f0);\r
    }\r
    light *= 0.25;\r
  }\r
  vec3 color = pow(aces(light * uExposure), vec3(1.0 / 2.2));\r
  float grain = fract(52.9829189 * fract(dot(frag, vec2(0.06711056, 0.00583715))));\r
  color += (grain - 0.5) / 255.0;\r
  fragColor = vec4(clamp(color, 0.0, 1.0) * alpha, alpha);\r
}\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const parseColor = (value: string | number[]): number[] => {\r
  if (Array.isArray(value)) return [0, 1, 2].map(index => clamp(Number(value[index]) || 0, 0, 1));\r
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
const link = (gl: WebGL2RenderingContext, fragmentSource: string): Program | null => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);\r
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
const LiquidChrome = ({\r
  color = '#ffffff',\r
  speed = 0.2,\r
  amplitude = 0.3,\r
  frequencyX = 3,\r
  frequencyY = 3,\r
  detail = 4,\r
  thickness = 1,\r
  depth = 1,\r
  roughness = 0.3,\r
  exposure = 1,\r
  interactive = true,\r
  rippleStrength = 1,\r
  rippleSize = 1,\r
  tilt = 1,\r
  intro = true,\r
  lightMode = false,\r
  maxDevicePixelRatio = 2,\r
  className = '',\r
  style\r
}: LiquidChromeProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const [generation, setGeneration] = useState(0);\r
\r
  const settings: Settings = {\r
    tint: parseColor(color).map(channel => Math.pow(channel, 2.2)),\r
    speed: Math.max(0, speed),\r
    amplitude: clamp(amplitude, 0, 2),\r
    frequency: [Math.max(0.1, frequencyX), Math.max(0.1, frequencyY)],\r
    detail: clamp(Math.round(detail), 1, 8),\r
    thickness: clamp(thickness, 0.25, 4),\r
    depth: Math.max(0, depth),\r
    roughness: clamp(roughness, 0, 1),\r
    exposure: Math.max(0, exposure),\r
    interactive,\r
    rippleStrength: Math.max(0, rippleStrength),\r
    rippleSize: clamp(rippleSize, 0.2, 4),\r
    tilt: Math.max(0, tilt),\r
    intro,\r
    light: lightMode,\r
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
    const chrome = gl ? link(gl, CHROME) : null;\r
    if (!gl || !chrome) return;\r
    const fluid = Boolean(gl.getExtension('EXT_color_buffer_float'));\r
    const sim = fluid ? link(gl, SIM) : null;\r
    const slope = fluid ? link(gl, SLOPE) : null;\r
\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
    const vao = gl.createVertexArray();\r
    const grid = { width: 1, height: 1 };\r
    const targets: Target[] = [];\r
    let slopeTarget: Target | null = null;\r
    let current = 0;\r
    let unit = 1;\r
    const pointer = { x: 0, y: 0, inside: false, ready: false, nx: 0, ny: 0 };\r
    const view = { yaw: 0, pitch: 0, vyaw: 0, vpitch: 0 };\r
    const strokes: Stroke[] = [];\r
    let time = Math.random() * 40;\r
    let presence = settingsRef.current.intro && !reduced && generation === 0 ? 0 : 1;\r
    let energy = 0;\r
    let accumulator = 0;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let pageVisible = document.visibilityState !== 'hidden';\r
    let lost = false;\r
\r
    const makeTarget = (width: number, height: number): Target => {\r
      const texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG16F, width, height, 0, gl.RG, gl.HALF_FLOAT, null);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      const framebuffer = gl.createFramebuffer();\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
      gl.clearColor(0, 0, 0, 1);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      return { texture, framebuffer };\r
    };\r
\r
    const dropTarget = (target: Target | null) => {\r
      if (!target) return;\r
      gl.deleteTexture(target.texture);\r
      gl.deleteFramebuffer(target.framebuffer);\r
    };\r
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
      unit = Math.min(width, height);\r
      if (!fluid || !sim || !slope) return;\r
      const gridWidth = clamp(Math.round(cssWidth / SIM_CELL), 16, 512);\r
      const gridHeight = clamp(Math.round(cssHeight / SIM_CELL), 16, 512);\r
      if (gridWidth === grid.width && gridHeight === grid.height && targets.length) return;\r
      targets.forEach(dropTarget);\r
      targets.length = 0;\r
      dropTarget(slopeTarget);\r
      Object.assign(grid, { width: gridWidth, height: gridHeight });\r
      targets.push(makeTarget(gridWidth, gridHeight), makeTarget(gridWidth, gridHeight));\r
      slopeTarget = makeTarget(gridWidth, gridHeight);\r
    };\r
\r
    const simulate = (steps: number) => {\r
      if (!sim || !slope || !slopeTarget) return;\r
      gl.useProgram(sim.program);\r
      gl.viewport(0, 0, grid.width, grid.height);\r
      gl.uniform2f(sim.uniforms.uSize, grid.width, grid.height);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.uniform1i(sim.uniforms.uState, 0);\r
      for (let step = 0; step < steps; step++) {\r
        const stroke = step === 0 ? strokes.shift() : null;\r
        if (stroke) {\r
          gl.uniform4f(sim.uniforms.uStroke, stroke.ax, stroke.ay, stroke.bx, stroke.by);\r
          gl.uniform2f(sim.uniforms.uImpulse, stroke.strength, stroke.radius);\r
        } else {\r
          gl.uniform2f(sim.uniforms.uImpulse, 0, 1);\r
        }\r
        const source = targets[current];\r
        const destination = targets[1 - current];\r
        gl.bindTexture(gl.TEXTURE_2D, source.texture);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, destination.framebuffer);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
        current = 1 - current;\r
      }\r
      gl.useProgram(slope.program);\r
      gl.uniform2f(slope.uniforms.uSize, grid.width, grid.height);\r
      gl.uniform1i(slope.uniforms.uState, 0);\r
      gl.bindTexture(gl.TEXTURE_2D, targets[current].texture);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, slopeTarget.framebuffer);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const render = (s: Settings) => {\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      const u = chrome.uniforms;\r
      gl.useProgram(chrome.program);\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(u.uUnit, unit);\r
      gl.uniform1f(u.uTime, time);\r
      gl.uniform1f(u.uAmplitude, s.amplitude);\r
      gl.uniform2f(u.uFrequency, s.frequency[0], s.frequency[1]);\r
      gl.uniform1f(u.uDepth, s.depth);\r
      gl.uniform1f(u.uDetail, s.detail);\r
      gl.uniform1f(u.uSharpness, 5 / (3 * s.thickness));\r
      gl.uniform1f(u.uPresence, 1 - Math.pow(1 - presence, 3));\r
      gl.uniform3fv(u.uTint, s.tint);\r
      gl.uniform2f(u.uShift, view.yaw, view.pitch);\r
      gl.uniform1f(u.uRoughness, s.roughness);\r
      gl.uniform1f(u.uExposure, s.exposure);\r
      gl.uniform1f(u.uLight, s.light ? 1 : 0);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, slopeTarget ? slopeTarget.texture : null);\r
      gl.uniform1i(u.uSlope, 0);\r
      gl.uniform2f(u.uSlopeSize, grid.width, grid.height);\r
      gl.uniform1f(u.uRipple, slopeTarget ? s.rippleStrength * 2.2 : 0);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (lost) return;\r
      const s = settingsRef.current;\r
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05);\r
      last = Math.max(last, now);\r
      time += dt * s.speed * (reduced ? 0.25 : 1);\r
      presence = Math.min(1, presence + dt / 1.8);\r
\r
      const hovering = s.interactive && pointer.inside;\r
      const reach = reduced ? 0 : s.tilt;\r
      const targetYaw = (hovering ? pointer.nx * 0.35 : 0.22 * Math.sin(time * 1.3)) * reach;\r
      const targetPitch = (hovering ? -pointer.ny * 0.28 : 0.16 * Math.sin(time * 0.9 + 1.7)) * reach;\r
      const stiffness = 36;\r
      const damping = 2 * Math.sqrt(stiffness) * 0.95;\r
      view.vyaw += ((targetYaw - view.yaw) * stiffness - view.vyaw * damping) * dt;\r
      view.vpitch += ((targetPitch - view.pitch) * stiffness - view.vpitch * damping) * dt;\r
      view.yaw += view.vyaw * dt;\r
      view.pitch += view.vpitch * dt;\r
\r
      gl.bindVertexArray(vao);\r
      if (slopeTarget) {\r
        accumulator += dt;\r
        const steps = Math.min(4, Math.floor(accumulator / SIM_STEP));\r
        accumulator -= steps * SIM_STEP;\r
        if (steps > 0) {\r
          simulate(steps);\r
          energy = Math.max(0, energy * Math.pow(0.982, steps));\r
        }\r
      }\r
      render(s);\r
\r
      const settling =\r
        Math.abs(view.vyaw) + Math.abs(view.vpitch) > 1e-4 ||\r
        Math.abs(targetYaw - view.yaw) + Math.abs(targetPitch - view.pitch) > 1e-4;\r
      const busy = s.speed > 0 || presence < 1 || settling || energy > 0.002 || strokes.length > 0;\r
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
    const toGrid = (clientX: number, clientY: number) => {\r
      const rect = container.getBoundingClientRect();\r
      return {\r
        x: ((clientX - rect.left) / rect.width) * grid.width,\r
        y: (1 - (clientY - rect.top) / rect.height) * grid.height,\r
        nx: ((clientX - rect.left) / rect.width) * 2 - 1,\r
        ny: ((clientY - rect.top) / rect.height) * 2 - 1,\r
        inside: clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom\r
      };\r
    };\r
\r
    const push = (stroke: Stroke, s: Settings) => {\r
      if (!slopeTarget || !s.interactive || reduced) return;\r
      strokes.push(stroke);\r
      if (strokes.length > 6) strokes.shift();\r
      energy = 1;\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      const spot = toGrid(event.clientX, event.clientY);\r
      pointer.nx = clamp(spot.nx, -1, 1);\r
      pointer.ny = clamp(spot.ny, -1, 1);\r
      pointer.inside = spot.inside;\r
      if (spot.inside && pointer.ready) {\r
        const travel = Math.hypot(spot.x - pointer.x, spot.y - pointer.y);\r
        if (travel > 0.25) {\r
          push(\r
            {\r
              ax: pointer.x,\r
              ay: pointer.y,\r
              bx: spot.x,\r
              by: spot.y,\r
              strength: -Math.min(0.45, 0.04 + travel * 0.045) * s.rippleSize,\r
              radius: 4 * s.rippleSize\r
            },\r
            s\r
          );\r
        }\r
      }\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.ready = spot.inside;\r
      wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      const spot = toGrid(event.clientX, event.clientY);\r
      if (!spot.inside) return;\r
      push(\r
        { ax: spot.x, ay: spot.y, bx: spot.x, by: spot.y, strength: -1.6 * s.rippleSize, radius: 6 * s.rippleSize },\r
        s\r
      );\r
      wake();\r
    };\r
\r
    const onLeave = () => {\r
      pointer.inside = false;\r
      pointer.ready = false;\r
      wake();\r
    };\r
\r
    const onPointerUp = (event: PointerEvent) => {\r
      if (event.pointerType !== 'mouse') onLeave();\r
    };\r
\r
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
        targets.forEach(dropTarget);\r
        dropTarget(slopeTarget);\r
        gl.deleteVertexArray(vao);\r
        gl.deleteProgram(chrome.program);\r
        if (sim) gl.deleteProgram(sim.program);\r
        if (slope) gl.deleteProgram(slope.program);\r
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
export default LiquidChrome;\r
`,o={usage:`import LiquidChrome from './LiquidChrome';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <LiquidChrome
    color="#ffffff"
    speed={0.2}
    amplitude={0.3}
    detail={4}
    thickness={1}
    interactive={true}
  />
</div>`,code:r,css:e,tailwind:n,tsCode:t,tsTailwind:i};export{o as liquidChrome};
