const r=`'use client';\r
\r
import { useEffect, useRef, useState } from 'react';\r
import './GhostCursor.css';\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
out vec2 vUv;\r
void main() {\r
  vUv = aPosition * 0.5 + 0.5;\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const NOISE = \`\r
vec2 hash2(vec2 p) {\r
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.103, 0.0973));\r
  p3 += dot(p3, p3.yzx + 33.33);\r
  return fract((p3.xx + p3.yz) * p3.zy) * 2.0 - 1.0;\r
}\r
\r
vec3 gradientNoise(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = fract(p);\r
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);\r
  vec2 du = 30.0 * f * f * (f * (f - 2.0) + 1.0);\r
  vec2 ga = hash2(i);\r
  vec2 gb = hash2(i + vec2(1.0, 0.0));\r
  vec2 gc = hash2(i + vec2(0.0, 1.0));\r
  vec2 gd = hash2(i + vec2(1.0, 1.0));\r
  float va = dot(ga, f);\r
  float vb = dot(gb, f - vec2(1.0, 0.0));\r
  float vc = dot(gc, f - vec2(0.0, 1.0));\r
  float vd = dot(gd, f - vec2(1.0, 1.0));\r
  float k = va - vb - vc + vd;\r
  float value = va + u.x * (vb - va) + u.y * (vc - va) + u.x * u.y * k;\r
  vec2 slope = ga + u.x * (gb - ga) + u.y * (gc - ga) + u.x * u.y * (ga - gb - gc + gd) + du * (u.yx * k + vec2(vb, vc) - va);\r
  return vec3(value, slope);\r
}\r
\`;\r
\r
const SIM = \`#version 300 es\r
precision highp float;\r
in vec2 vUv;\r
out vec4 fragColor;\r
uniform sampler2D uState;\r
uniform vec2 uSize;\r
uniform float uDt;\r
uniform float uTime;\r
uniform float uDecay;\r
uniform float uDrag;\r
uniform vec2 uDrift;\r
uniform float uTurbulence;\r
uniform float uSwirl;\r
uniform vec2 uFrom;\r
uniform vec2 uTo;\r
uniform float uRadius;\r
uniform float uTrail;\r
uniform float uIdle;\r
uniform vec2 uVelocity;\r
uniform vec4 uPuff;\r
\${NOISE}\r
float erf(float x) {\r
  float x2 = x * x;\r
  return sign(x) * sqrt(1.0 - exp(-x2 * (1.2732395 + 0.147 * x2) / (1.0 + 0.147 * x2)));\r
}\r
vec2 curl(vec2 p) {\r
  vec3 a = gradientNoise(p * uSwirl + vec2(uTime * 0.11, -uTime * 0.07));\r
  vec3 b = gradientNoise(p * uSwirl * 2.03 + vec2(-uTime * 0.13, uTime * 0.09) + 17.3);\r
  vec2 g = a.yz + b.yz * 0.5;\r
  return vec2(g.y, -g.x);\r
}\r
vec4 fetch(vec2 p) {\r
  if (p.x < 0.0 || p.y < 0.0 || p.x > uSize.x || p.y > uSize.y) return vec4(0.0);\r
  return texture(uState, p / uSize);\r
}\r
void main() {\r
  vec2 p = gl_FragCoord.xy;\r
  vec4 here = texture(uState, vUv);\r
  vec2 flow = here.gb + curl(p) * uTurbulence + uDrift;\r
  vec4 state = fetch(p - flow * uDt);\r
  float density = state.r * uDecay;\r
  vec2 velocity = state.gb * uDrag;\r
\r
  float sigma = max(uRadius, 0.5);\r
  vec2 ab = uTo - uFrom;\r
  float len = length(ab);\r
  float trail = 0.0;\r
  if (len > 0.25) {\r
    vec2 dir = ab / len;\r
    vec2 ap = p - uFrom;\r
    float along = dot(ap, dir);\r
    float across = dot(ap, vec2(-dir.y, dir.x));\r
    float k = 1.4142136 * sigma;\r
    trail = exp(-across * across / (2.0 * sigma * sigma)) * 0.5 * (erf(along / k) - erf((along - len) / k));\r
  }\r
  vec2 dh = p - uTo;\r
  float head = exp(-dot(dh, dh) / (2.0 * sigma * sigma));\r
  density += uTrail * trail + uIdle * uDt * head;\r
  velocity += (uVelocity - velocity) * clamp(trail * 0.65, 0.0, 1.0);\r
\r
  if (uPuff.w > 0.0) {\r
    vec2 d = p - uPuff.xy;\r
    float r2 = dot(d, d);\r
    float g = exp(-r2 / (2.0 * uPuff.z * uPuff.z));\r
    density += uPuff.w * g;\r
    velocity += (r2 > 0.0001 ? d / sqrt(r2) : vec2(0.0)) * g * uPuff.w * uPuff.z * 2.2;\r
  }\r
\r
  fragColor = vec4(clamp(density, 0.0, 6.0), velocity, 1.0);\r
}\`;\r
\r
const SHADE = \`#version 300 es\r
precision highp float;\r
in vec2 vUv;\r
out vec4 fragColor;\r
uniform sampler2D uState;\r
uniform vec2 uSimSize;\r
uniform vec2 uView;\r
uniform vec2 uHead;\r
uniform float uHeadSize;\r
uniform float uHeadAmount;\r
uniform float uTime;\r
uniform vec3 uColor;\r
uniform float uDetail;\r
uniform float uNoiseScale;\r
uniform vec2 uFlow;\r
uniform float uBrightness;\r
uniform float uTheme;\r
\r
float hash(vec2 p) {\r
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);\r
  p3 += dot(p3, p3.yzx + 33.33);\r
  return fract((p3.x + p3.y) * p3.z);\r
}\r
float noise(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = fract(p);\r
  f = f * f * (3.0 - 2.0 * f);\r
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);\r
}\r
float fbm(vec2 p) {\r
  float v = 0.0;\r
  float a = 0.5;\r
  mat2 m = mat2(0.8776, 0.4794, -0.4794, 0.8776);\r
  for (int i = 0; i < 4; i++) {\r
    v += a * noise(p);\r
    p = m * p * 2.0;\r
    a *= 0.5;\r
  }\r
  return v;\r
}\r
float fbm5(vec2 p) {\r
  float v = 0.0;\r
  float a = 0.5;\r
  mat2 m = mat2(0.8776, 0.4794, -0.4794, 0.8776);\r
  for (int i = 0; i < 5; i++) {\r
    v += a * noise(p);\r
    p = m * p * 2.0;\r
    a *= 0.52;\r
  }\r
  return v;\r
}\r
vec4 cubic(sampler2D tex, vec2 uv, vec2 size) {\r
  vec2 st = uv * size - 0.5;\r
  vec2 i = floor(st);\r
  vec2 f = st - i;\r
  vec2 f2 = f * f;\r
  vec2 f3 = f2 * f;\r
  vec2 w0 = (1.0 - 3.0 * f + 3.0 * f2 - f3) / 6.0;\r
  vec2 w1 = (4.0 - 6.0 * f2 + 3.0 * f3) / 6.0;\r
  vec2 w2 = (1.0 + 3.0 * f + 3.0 * f2 - 3.0 * f3) / 6.0;\r
  vec2 w3 = f3 / 6.0;\r
  vec2 g0 = w0 + w1;\r
  vec2 g1 = w2 + w3;\r
  vec2 c0 = (i + 0.5 + w1 / g0 - 1.0) / size;\r
  vec2 c1 = (i + 0.5 + w3 / g1 + 1.0) / size;\r
  vec4 a = texture(tex, c0) * g0.x + texture(tex, vec2(c1.x, c0.y)) * g1.x;\r
  vec4 b = texture(tex, vec2(c0.x, c1.y)) * g0.x + texture(tex, c1) * g1.x;\r
  return a * g0.y + b * g1.y;\r
}\r
float field(vec2 uv, vec2 p) {\r
  vec2 d = p - uHead;\r
  return cubic(uState, uv, uSimSize).r + uHeadAmount * exp(-dot(d, d) / (2.0 * uHeadSize * uHeadSize));\r
}\r
void main() {\r
  vec2 p = vUv * uView;\r
  float density = field(vUv, p);\r
  if (density < 0.002) {\r
    fragColor = vec4(0.0);\r
    return;\r
  }\r
  vec2 step = vec2(1.5) / uSimSize;\r
  float dx = field(vUv + vec2(step.x, 0.0), p + vec2(step.x * uView.x, 0.0)) - field(vUv - vec2(step.x, 0.0), p - vec2(step.x * uView.x, 0.0));\r
  float dy = field(vUv + vec2(0.0, step.y), p + vec2(0.0, step.y * uView.y)) - field(vUv - vec2(0.0, step.y), p - vec2(0.0, step.y * uView.y));\r
\r
  vec2 n = (p + uFlow) * uNoiseScale;\r
  float t = uTime;\r
  vec2 q = vec2(fbm(n + t * 0.1), fbm(n + vec2(5.2, 1.3) + t * 0.1));\r
  vec2 r = vec2(fbm(n + q * 1.8 + vec2(1.7, 9.2) + t * 0.15), fbm(n + q * 1.8 + vec2(8.3, 2.8) + t * 0.15));\r
  float smoke = fbm5(n + r * 1.1);\r
  float wisp = pow(smoothstep(0.18, 0.82, smoke), 2.0) * 2.8;\r
  float body = density * mix(1.0, wisp, uDetail);\r
  float cloud = body * smoothstep(0.0, 0.32, body) * 1.15;\r
  if (cloud <= 0.0) {\r
    fragColor = vec4(0.0);\r
    return;\r
  }\r
\r
  vec3 normal = normalize(vec3(-dx * 2.2, -dy * 2.2, 1.0) + vec3((q - 0.5) * 0.35 * uDetail, 0.0));\r
  float light = 0.7 + 0.5 * max(dot(normal, normalize(vec3(-0.35, 0.55, 0.75))), 0.0);\r
  float core = smoothstep(0.7, 2.2, cloud);\r
\r
  vec3 tint = mix(uColor * light, mix(uColor, vec3(1.0), 0.55) * light, core);\r
  vec3 ink = mix(uColor, uColor * 0.78, core * 0.6) * (1.12 - 0.12 * light);\r
  vec3 color = mix(tint * uBrightness, ink, uTheme) * cloud;\r
  fragColor = vec4(color, cloud);\r
}\`;\r
\r
const DOWN = \`#version 300 es\r
precision highp float;\r
in vec2 vUv;\r
out vec4 fragColor;\r
uniform sampler2D uSource;\r
uniform vec2 uTexel;\r
uniform float uThreshold;\r
void main() {\r
  vec4 a = texture(uSource, vUv + uTexel * vec2(-0.5, -0.5));\r
  vec4 b = texture(uSource, vUv + uTexel * vec2(0.5, -0.5));\r
  vec4 c = texture(uSource, vUv + uTexel * vec2(-0.5, 0.5));\r
  vec4 d = texture(uSource, vUv + uTexel * vec2(0.5, 0.5));\r
  vec4 color = (a + b + c + d) * 0.25;\r
  float peak = max(color.r, max(color.g, color.b));\r
  float keep = peak > 0.0 ? max(peak - uThreshold, 0.0) / peak : 0.0;\r
  fragColor = color * keep;\r
}\`;\r
\r
const BLUR = \`#version 300 es\r
precision highp float;\r
in vec2 vUv;\r
out vec4 fragColor;\r
uniform sampler2D uSource;\r
uniform vec2 uDirection;\r
void main() {\r
  vec4 color = texture(uSource, vUv) * 0.181862;\r
  color += (texture(uSource, vUv + uDirection * 1.423135) + texture(uSource, vUv - uDirection * 1.423135)) * 0.284316;\r
  color += (texture(uSource, vUv + uDirection * 3.326702) + texture(uSource, vUv - uDirection * 3.326702)) * 0.106598;\r
  color += (texture(uSource, vUv + uDirection * 5.242989) + texture(uSource, vUv - uDirection * 5.242989)) * 0.018156;\r
  fragColor = color;\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
in vec2 vUv;\r
out vec4 fragColor;\r
uniform sampler2D uShade;\r
uniform sampler2D uBloom0;\r
uniform sampler2D uBloom1;\r
uniform sampler2D uBloom2;\r
uniform vec2 uShadeSize;\r
uniform vec3 uWeights;\r
uniform float uBloom;\r
uniform float uPresence;\r
uniform float uGrain;\r
uniform float uEdge;\r
uniform float uTime;\r
uniform float uTheme;\r
uniform vec3 uColor;\r
\r
float hash(vec2 p) {\r
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);\r
  p3 += dot(p3, p3.yzx + 33.33);\r
  return fract((p3.x + p3.y) * p3.z);\r
}\r
vec4 cubic(sampler2D tex, vec2 uv, vec2 size) {\r
  vec2 st = uv * size - 0.5;\r
  vec2 i = floor(st);\r
  vec2 f = st - i;\r
  vec2 f2 = f * f;\r
  vec2 f3 = f2 * f;\r
  vec2 w0 = (1.0 - 3.0 * f + 3.0 * f2 - f3) / 6.0;\r
  vec2 w1 = (4.0 - 6.0 * f2 + 3.0 * f3) / 6.0;\r
  vec2 w2 = (1.0 + 3.0 * f + 3.0 * f2 - 3.0 * f3) / 6.0;\r
  vec2 w3 = f3 / 6.0;\r
  vec2 g0 = w0 + w1;\r
  vec2 g1 = w2 + w3;\r
  vec2 c0 = (i + 0.5 + w1 / g0 - 1.0) / size;\r
  vec2 c1 = (i + 0.5 + w3 / g1 + 1.0) / size;\r
  vec4 a = texture(tex, c0) * g0.x + texture(tex, vec2(c1.x, c0.y)) * g1.x;\r
  vec4 b = texture(tex, vec2(c0.x, c1.y)) * g0.x + texture(tex, c1) * g1.x;\r
  return a * g0.y + b * g1.y;\r
}\r
void main() {\r
  vec4 shade = cubic(uShade, vUv, uShadeSize);\r
  vec4 bloom = texture(uBloom0, vUv) * uWeights.x + texture(uBloom1, vUv) * uWeights.y + texture(uBloom2, vUv) * uWeights.z;\r
  vec2 edge = min(vUv, 1.0 - vUv);\r
  float vignette = mix(1.0 - uEdge, 1.0, clamp(min(edge.x, edge.y) * 2.0, 0.0, 1.0));\r
  float fade = uPresence * vignette;\r
  float grain = hash(gl_FragCoord.xy + fract(uTime * 7.13) * 91.7) - 0.5;\r
  if (uTheme > 0.5) {\r
    float coverage = 1.0 - exp(-(shade.a + bloom.a * uBloom * 0.6) * 0.95);\r
    coverage = clamp(coverage * fade * (1.0 + grain * uGrain * 2.0), 0.0, 1.0);\r
    vec3 pigment = shade.a > 0.0001 ? clamp(shade.rgb / shade.a, 0.0, 1.0) : uColor;\r
    fragColor = vec4(pow(pigment, vec3(1.0 / 2.2)) * coverage, coverage);\r
    return;\r
  }\r
  vec3 color = (shade.rgb + bloom.rgb * uBloom) * fade;\r
  color = pow(1.0 - exp(-color * 0.95), vec3(1.0 / 2.2));\r
  color += color * grain * uGrain * 2.0;\r
  color = clamp(color + (hash(gl_FragCoord.xy * 1.37) - 0.5) / 255.0, 0.0, 1.0);\r
  fragColor = vec4(color, max(color.r, max(color.g, color.b)));\r
}\`;\r
\r
const INTRO_MS = 1900;\r
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
  return [0.706, 0.592, 0.812];\r
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
  gl.bindAttribLocation(program, 0, 'aPosition');\r
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
const GhostCursor = ({\r
  color = '#B497CF',\r
  brightness = 1,\r
  size = 80,\r
  trailLength = 50,\r
  inertia = 0.5,\r
  turbulence = 0.5,\r
  drift = 0.3,\r
  detail = 1,\r
  grainIntensity = 0.05,\r
  bloomStrength = 0.6,\r
  bloomRadius = 1,\r
  bloomThreshold = 0.025,\r
  edgeIntensity = 0,\r
  clickPuff = true,\r
  intro = true,\r
  theme = 'dark',\r
  mixBlendMode,\r
  fadeDelayMs,\r
  fadeDurationMs,\r
  maxDevicePixelRatio = 2,\r
  targetPixels,\r
  zIndex = 10,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const [generation, setGeneration] = useState(0);\r
  const [touch] = useState(\r
    () => typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)\r
  );\r
\r
  const light = theme === 'light';\r
  const settings = {\r
    color: parseColor(color).map(channel => Math.pow(channel, 2.2)),\r
    brightness: Math.max(0, brightness),\r
    size: Math.max(8, size),\r
    trail: clamp(trailLength, 1, 200),\r
    inertia: clamp(inertia, 0, 0.99),\r
    turbulence: clamp(turbulence, 0, 2),\r
    drift,\r
    detail: clamp(detail, 0, 1),\r
    grain: clamp(grainIntensity, 0, 1),\r
    bloom: Math.max(0, bloomStrength),\r
    bloomRadius: clamp(bloomRadius, 0, 3),\r
    threshold: Math.max(0, bloomThreshold),\r
    edge: clamp(edgeIntensity, 0, 1),\r
    clickPuff,\r
    intro,\r
    theme: light ? 1 : 0,\r
    fadeDelay: Math.max(0, fadeDelayMs ?? (touch ? 500 : 1000)),\r
    fadeDuration: Math.max(1, fadeDurationMs ?? (touch ? 1000 : 1500)),\r
    maxRatio: clamp(maxDevicePixelRatio, 0.25, 3),\r
    budget: Math.max(5e4, targetPixels ?? (touch ? 3e5 : 6e5))\r
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
    const parent = container?.parentElement;\r
    if (!container || !canvas || !parent) return;\r
\r
    const previousPosition = parent.style.position;\r
    const reposition = getComputedStyle(parent).position === 'static';\r
    if (reposition) parent.style.position = 'relative';\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
\r
    const gl = canvas.getContext('webgl2', {\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false,\r
      powerPreference: 'default'\r
    });\r
    if (!gl || !gl.getExtension('EXT_color_buffer_float')) {\r
      if (reposition) parent.style.position = previousPosition;\r
      return;\r
    }\r
    const linked = [link(gl, SIM), link(gl, SHADE), link(gl, DOWN), link(gl, BLUR), link(gl, COMPOSITE)];\r
    const [simProgram, shadeProgram, downProgram, blurProgram, compositeProgram] = linked;\r
    if (!simProgram || !shadeProgram || !downProgram || !blurProgram || !compositeProgram) {\r
      for (const item of linked) if (item) gl.deleteProgram(item.program);\r
      if (reposition) parent.style.position = previousPosition;\r
      return;\r
    }\r
    const programs = {\r
      sim: simProgram,\r
      shade: shadeProgram,\r
      down: downProgram,\r
      blur: blurProgram,\r
      composite: compositeProgram\r
    };\r
\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    const buffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    gl.disable(gl.BLEND);\r
    gl.disable(gl.DEPTH_TEST);\r
\r
    const createTarget = () => {\r
      const texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      const framebuffer = gl.createFramebuffer();\r
      return { texture, framebuffer, width: 0, height: 0 };\r
    };\r
\r
    const allocate = (target, width, height) => {\r
      if (target.width === width && target.height === height) return false;\r
      target.width = width;\r
      target.height = height;\r
      gl.bindTexture(gl.TEXTURE_2D, target.texture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.HALF_FLOAT, null);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target.texture, 0);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      return true;\r
    };\r
\r
    const sims = [createTarget(), createTarget()];\r
    const shade = createTarget();\r
    const downs = [createTarget(), createTarget(), createTarget()];\r
    const blurs = [createTarget(), createTarget(), createTarget()];\r
\r
    const pass = (target, program) => {\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.framebuffer : null);\r
      gl.viewport(0, 0, target ? target.width : canvas.width, target ? target.height : canvas.height);\r
      gl.useProgram(program.program);\r
      return program.uniforms;\r
    };\r
\r
    const bind = (unit, texture) => {\r
      gl.activeTexture(gl.TEXTURE0 + unit);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
    };\r
\r
    const view = { width: 1, height: 1, ratio: 1, sim: 0.25, shade: 1 };\r
    const ghost = { x: 0, y: 0, vx: 0, vy: 0, px: 0, py: 0, ready: false };\r
    const pointer = { x: 0, y: 0, inside: false, moved: -1e9 };\r
    const flow = { y: 0 };\r
    const puffs = [];\r
    let presence = 0;\r
    let current = 0;\r
    let raf = 0;\r
    let last = 0;\r
    let clock = 0;\r
    let visible = true;\r
    let pageVisible = document.visibilityState !== 'hidden';\r
    let lost = false;\r
    let dirty = true;\r
    let introLive = settingsRef.current.intro && !reduced && generation === 0;\r
    let introStart = -1;\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const rect = container.getBoundingClientRect();\r
      const width = Math.max(1, Math.round(rect.width));\r
      const height = Math.max(1, Math.round(rect.height));\r
      const ratio = Math.min(window.devicePixelRatio || 1, s.maxRatio);\r
      view.width = width;\r
      view.height = height;\r
      view.ratio = ratio;\r
      const cw = Math.max(1, Math.round(width * ratio));\r
      const ch = Math.max(1, Math.round(height * ratio));\r
      if (canvas.width !== cw || canvas.height !== ch) {\r
        canvas.width = cw;\r
        canvas.height = ch;\r
      }\r
      view.shade = Math.min(1, Math.sqrt(s.budget / (width * height)));\r
      const sw = Math.max(8, Math.round(width * view.shade));\r
      const sh = Math.max(8, Math.round(height * view.shade));\r
      allocate(shade, sw, sh);\r
      let w = Math.max(4, Math.round(sw / 2));\r
      let h = Math.max(4, Math.round(sh / 2));\r
      for (let i = 0; i < 3; i++) {\r
        allocate(downs[i], w, h);\r
        allocate(blurs[i], w, h);\r
        w = Math.max(2, Math.round(w / 2));\r
        h = Math.max(2, Math.round(h / 2));\r
      }\r
      view.sim = Math.min(0.35, 220 / Math.max(width, height));\r
      const simW = Math.max(16, Math.round(width * view.sim));\r
      const simH = Math.max(16, Math.round(height * view.sim));\r
      allocate(sims[0], simW, simH);\r
      allocate(sims[1], simW, simH);\r
      dirty = true;\r
    };\r
\r
    const simulate = (dt, active) => {\r
      const s = settingsRef.current;\r
      const src = sims[current];\r
      const dst = sims[1 - current];\r
      const scale = view.sim;\r
      const sigma = s.size * scale * 0.3;\r
      const decay = Math.exp(-dt / (0.12 + s.trail * 0.022));\r
      const u = pass(dst, programs.sim);\r
      bind(0, src.texture);\r
      gl.uniform1i(u.uState, 0);\r
      gl.uniform2f(u.uSize, dst.width, dst.height);\r
      gl.uniform1f(u.uDt, dt);\r
      gl.uniform1f(u.uTime, clock);\r
      gl.uniform1f(u.uDecay, decay);\r
      gl.uniform1f(u.uDrag, Math.exp(-dt * 2.4));\r
      gl.uniform2f(u.uDrift, 0, s.drift * 110 * scale);\r
      gl.uniform1f(u.uTurbulence, s.turbulence * 70 * scale);\r
      gl.uniform1f(u.uSwirl, 1 / Math.max(1, s.size * scale * 2.2));\r
      gl.uniform2f(u.uFrom, ghost.px * scale, (view.height - ghost.py) * scale);\r
      gl.uniform2f(u.uTo, ghost.x * scale, (view.height - ghost.y) * scale);\r
      gl.uniform1f(u.uRadius, sigma);\r
      gl.uniform1f(u.uTrail, active ? 0.42 * presence : 0);\r
      gl.uniform1f(u.uIdle, active ? 0.22 * presence : 0);\r
      gl.uniform2f(u.uVelocity, ghost.vx * scale * 0.5, -ghost.vy * scale * 0.5);\r
      const puff = puffs.shift();\r
      if (puff) {\r
        gl.uniform4f(u.uPuff, puff.x * scale, (view.height - puff.y) * scale, sigma * 1.4, 0.9);\r
      } else {\r
        gl.uniform4f(u.uPuff, 0, 0, 1, 0);\r
      }\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      current = 1 - current;\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      let u = pass(shade, programs.shade);\r
      bind(0, sims[current].texture);\r
      gl.uniform1i(u.uState, 0);\r
      gl.uniform2f(u.uSimSize, sims[current].width, sims[current].height);\r
      gl.uniform2f(u.uView, view.width, view.height);\r
      gl.uniform2f(u.uHead, ghost.x, view.height - ghost.y);\r
      gl.uniform1f(u.uHeadSize, s.size * 0.38);\r
      gl.uniform1f(u.uHeadAmount, ghost.ready ? 0.8 * presence : 0);\r
      gl.uniform1f(u.uTime, clock);\r
      gl.uniform3fv(u.uColor, s.color);\r
      gl.uniform1f(u.uDetail, s.detail);\r
      gl.uniform1f(u.uNoiseScale, 2.4 / Math.max(20, s.size * 2.6));\r
      gl.uniform2f(u.uFlow, 0, flow.y);\r
      gl.uniform1f(u.uBrightness, s.brightness);\r
      gl.uniform1f(u.uTheme, s.theme);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      let source = shade;\r
      for (let i = 0; i < 3; i++) {\r
        u = pass(downs[i], programs.down);\r
        bind(0, source.texture);\r
        gl.uniform1i(u.uSource, 0);\r
        gl.uniform2f(u.uTexel, 1 / source.width, 1 / source.height);\r
        gl.uniform1f(u.uThreshold, i === 0 ? s.threshold : 0);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
        u = pass(blurs[i], programs.blur);\r
        bind(0, downs[i].texture);\r
        gl.uniform1i(u.uSource, 0);\r
        gl.uniform2f(u.uDirection, 1 / downs[i].width, 0);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
        u = pass(downs[i], programs.blur);\r
        bind(0, blurs[i].texture);\r
        gl.uniform1i(u.uSource, 0);\r
        gl.uniform2f(u.uDirection, 0, 1 / blurs[i].height);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
        source = downs[i];\r
      }\r
\r
      u = pass(null, programs.composite);\r
      bind(0, shade.texture);\r
      bind(1, downs[0].texture);\r
      bind(2, downs[1].texture);\r
      bind(3, downs[2].texture);\r
      gl.uniform1i(u.uShade, 0);\r
      gl.uniform1i(u.uBloom0, 1);\r
      gl.uniform1i(u.uBloom1, 2);\r
      gl.uniform1i(u.uBloom2, 3);\r
      gl.uniform2f(u.uShadeSize, shade.width, shade.height);\r
      const spread = s.bloomRadius;\r
      gl.uniform3f(u.uWeights, 1, 0.6 + 0.4 * spread, 0.25 + 0.75 * Math.min(1, spread * spread * 0.5));\r
      gl.uniform1f(u.uBloom, s.bloom);\r
      gl.uniform1f(u.uPresence, presence);\r
      gl.uniform1f(u.uGrain, s.grain);\r
      gl.uniform1f(u.uEdge, s.edge);\r
      gl.uniform1f(u.uTime, clock);\r
      gl.uniform1f(u.uTheme, s.theme);\r
      gl.uniform3fv(u.uColor, s.color);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (lost) return;\r
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05);\r
      last = Math.max(last, now);\r
      clock += dt;\r
      const s = settingsRef.current;\r
      if (dirty) resize();\r
      dirty = false;\r
\r
      if (introLive) {\r
        if (introStart < 0) introStart = now + 280;\r
        const t = (now - introStart) / INTRO_MS;\r
        if (t >= 0) {\r
          const e = t < 1 ? t * t * (3 - 2 * t) : 1;\r
          const x = view.width * (0.16 + 0.44 * e + 0.05 * Math.sin(e * Math.PI));\r
          const y = view.height * (0.7 - 0.24 * e - 0.1 * Math.sin(e * Math.PI * 2));\r
          if (!ghost.ready) {\r
            ghost.x = ghost.px = x;\r
            ghost.y = ghost.py = y;\r
            ghost.vx = ghost.vy = 0;\r
            ghost.ready = true;\r
          }\r
          pointer.x = x;\r
          pointer.y = y;\r
          pointer.inside = true;\r
          pointer.moved = now;\r
          if (t >= 1) introLive = false;\r
        }\r
      }\r
\r
      const idle = now - pointer.moved;\r
      const target = !ghost.ready ? 0 : idle < s.fadeDelay ? 1 : Math.max(0, 1 - (idle - s.fadeDelay) / s.fadeDuration);\r
      presence += (target - presence) * (1 - Math.exp(-dt / (target > presence ? 0.12 : 0.08)));\r
      if (Math.abs(target - presence) < 0.002) presence = target;\r
\r
      ghost.px = ghost.x;\r
      ghost.py = ghost.y;\r
      if (ghost.ready) {\r
        if (pointer.inside) {\r
          const stiffness = 520 * Math.pow(1 - s.inertia, 2) + 26;\r
          const damping = 2 * Math.sqrt(stiffness) * 0.92;\r
          const steps = Math.max(1, Math.ceil(dt / (1 / 240)));\r
          const h = dt / steps;\r
          for (let i = 0; i < steps; i++) {\r
            ghost.vx += (stiffness * (pointer.x - ghost.x) - damping * ghost.vx) * h;\r
            ghost.vy += (stiffness * (pointer.y - ghost.y) - damping * ghost.vy) * h;\r
            ghost.x += ghost.vx * h;\r
            ghost.y += ghost.vy * h;\r
          }\r
        } else {\r
          const glide = Math.pow(s.inertia, dt * 60);\r
          ghost.vx *= glide;\r
          ghost.vy *= glide;\r
          ghost.x += ghost.vx * dt;\r
          ghost.y += ghost.vy * dt;\r
        }\r
      }\r
      flow.y -= s.drift * 110 * dt;\r
\r
      simulate(dt, presence > 0.01);\r
      render();\r
\r
      const busy = introLive || target > 0 || presence > 0.001 || puffs.length > 0;\r
      if (!busy) {\r
        for (const target of sims) {\r
          gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);\r
          gl.clearColor(0, 0, 0, 0);\r
          gl.clear(gl.COLOR_BUFFER_BIT);\r
        }\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
        gl.viewport(0, 0, canvas.width, canvas.height);\r
        gl.clearColor(0, 0, 0, 0);\r
        gl.clear(gl.COLOR_BUFFER_BIT);\r
        return;\r
      }\r
      if (visible && pageVisible) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (raf || lost || !visible || !pageVisible) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
    wakeRef.current = wake;\r
\r
    const locate = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };\r
    };\r
\r
    const onPointerMove = event => {\r
      const spot = locate(event);\r
      if (spot.inside) introLive = false;\r
      if (!spot.inside) {\r
        if (pointer.inside) onLeave();\r
        return;\r
      }\r
      if (!pointer.inside && !ghost.ready) {\r
        ghost.x = ghost.px = spot.x;\r
        ghost.y = ghost.py = spot.y;\r
        ghost.vx = ghost.vy = 0;\r
        ghost.ready = true;\r
      } else if (!pointer.inside && presence < 0.05) {\r
        ghost.x = ghost.px = spot.x;\r
        ghost.y = ghost.py = spot.y;\r
        ghost.vx = ghost.vy = 0;\r
      }\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = true;\r
      pointer.moved = performance.now();\r
      wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      const spot = locate(event);\r
      if (!spot.inside) return;\r
      onPointerMove(event);\r
      if (settingsRef.current.clickPuff) {\r
        puffs.push({ x: spot.x, y: spot.y });\r
        wake();\r
      }\r
    };\r
\r
    const onLeave = () => {\r
      const now = performance.now();\r
      if (pointer.inside && now - pointer.moved < settingsRef.current.fadeDelay) pointer.moved = now;\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
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
      dirty = true;\r
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
    if (introLive) wake();\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      canvas.removeEventListener('webglcontextlost', onLost);\r
      canvas.removeEventListener('webglcontextrestored', onRestored);\r
      if (!gl.isContextLost()) {\r
        for (const target of [...sims, shade, ...downs, ...blurs]) {\r
          gl.deleteFramebuffer(target.framebuffer);\r
          gl.deleteTexture(target.texture);\r
        }\r
        gl.deleteBuffer(buffer);\r
        gl.deleteVertexArray(vao);\r
        for (const item of Object.values(programs)) gl.deleteProgram(item.program);\r
      }\r
      if (reposition) parent.style.position = previousPosition;\r
    };\r
  }, [generation]);\r
\r
  const blend = mixBlendMode ?? (light ? 'normal' : 'screen');\r
\r
  return (\r
    <div ref={containerRef} className={\`ghost-cursor \${className}\`.trim()} style={{ zIndex, ...style }}>\r
      <canvas ref={canvasRef} className="ghost-cursor__canvas" style={{ mixBlendMode: blend }} aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default GhostCursor;\r
`,n=`.ghost-cursor {\r
  position: absolute;\r
  inset: 0;\r
  overflow: hidden;\r
  pointer-events: none;\r
}\r
\r
.ghost-cursor__canvas {\r
  position: absolute;\r
  inset: 0;\r
  display: block;\r
  width: 100%;\r
  height: 100%;\r
}\r
`,e=`'use client';\r
\r
import { useEffect, useRef, useState } from 'react';\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
out vec2 vUv;\r
void main() {\r
  vUv = aPosition * 0.5 + 0.5;\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const NOISE = \`\r
vec2 hash2(vec2 p) {\r
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.103, 0.0973));\r
  p3 += dot(p3, p3.yzx + 33.33);\r
  return fract((p3.xx + p3.yz) * p3.zy) * 2.0 - 1.0;\r
}\r
\r
vec3 gradientNoise(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = fract(p);\r
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);\r
  vec2 du = 30.0 * f * f * (f * (f - 2.0) + 1.0);\r
  vec2 ga = hash2(i);\r
  vec2 gb = hash2(i + vec2(1.0, 0.0));\r
  vec2 gc = hash2(i + vec2(0.0, 1.0));\r
  vec2 gd = hash2(i + vec2(1.0, 1.0));\r
  float va = dot(ga, f);\r
  float vb = dot(gb, f - vec2(1.0, 0.0));\r
  float vc = dot(gc, f - vec2(0.0, 1.0));\r
  float vd = dot(gd, f - vec2(1.0, 1.0));\r
  float k = va - vb - vc + vd;\r
  float value = va + u.x * (vb - va) + u.y * (vc - va) + u.x * u.y * k;\r
  vec2 slope = ga + u.x * (gb - ga) + u.y * (gc - ga) + u.x * u.y * (ga - gb - gc + gd) + du * (u.yx * k + vec2(vb, vc) - va);\r
  return vec3(value, slope);\r
}\r
\`;\r
\r
const SIM = \`#version 300 es\r
precision highp float;\r
in vec2 vUv;\r
out vec4 fragColor;\r
uniform sampler2D uState;\r
uniform vec2 uSize;\r
uniform float uDt;\r
uniform float uTime;\r
uniform float uDecay;\r
uniform float uDrag;\r
uniform vec2 uDrift;\r
uniform float uTurbulence;\r
uniform float uSwirl;\r
uniform vec2 uFrom;\r
uniform vec2 uTo;\r
uniform float uRadius;\r
uniform float uTrail;\r
uniform float uIdle;\r
uniform vec2 uVelocity;\r
uniform vec4 uPuff;\r
\${NOISE}\r
float erf(float x) {\r
  float x2 = x * x;\r
  return sign(x) * sqrt(1.0 - exp(-x2 * (1.2732395 + 0.147 * x2) / (1.0 + 0.147 * x2)));\r
}\r
vec2 curl(vec2 p) {\r
  vec3 a = gradientNoise(p * uSwirl + vec2(uTime * 0.11, -uTime * 0.07));\r
  vec3 b = gradientNoise(p * uSwirl * 2.03 + vec2(-uTime * 0.13, uTime * 0.09) + 17.3);\r
  vec2 g = a.yz + b.yz * 0.5;\r
  return vec2(g.y, -g.x);\r
}\r
vec4 fetch(vec2 p) {\r
  if (p.x < 0.0 || p.y < 0.0 || p.x > uSize.x || p.y > uSize.y) return vec4(0.0);\r
  return texture(uState, p / uSize);\r
}\r
void main() {\r
  vec2 p = gl_FragCoord.xy;\r
  vec4 here = texture(uState, vUv);\r
  vec2 flow = here.gb + curl(p) * uTurbulence + uDrift;\r
  vec4 state = fetch(p - flow * uDt);\r
  float density = state.r * uDecay;\r
  vec2 velocity = state.gb * uDrag;\r
\r
  float sigma = max(uRadius, 0.5);\r
  vec2 ab = uTo - uFrom;\r
  float len = length(ab);\r
  float trail = 0.0;\r
  if (len > 0.25) {\r
    vec2 dir = ab / len;\r
    vec2 ap = p - uFrom;\r
    float along = dot(ap, dir);\r
    float across = dot(ap, vec2(-dir.y, dir.x));\r
    float k = 1.4142136 * sigma;\r
    trail = exp(-across * across / (2.0 * sigma * sigma)) * 0.5 * (erf(along / k) - erf((along - len) / k));\r
  }\r
  vec2 dh = p - uTo;\r
  float head = exp(-dot(dh, dh) / (2.0 * sigma * sigma));\r
  density += uTrail * trail + uIdle * uDt * head;\r
  velocity += (uVelocity - velocity) * clamp(trail * 0.65, 0.0, 1.0);\r
\r
  if (uPuff.w > 0.0) {\r
    vec2 d = p - uPuff.xy;\r
    float r2 = dot(d, d);\r
    float g = exp(-r2 / (2.0 * uPuff.z * uPuff.z));\r
    density += uPuff.w * g;\r
    velocity += (r2 > 0.0001 ? d / sqrt(r2) : vec2(0.0)) * g * uPuff.w * uPuff.z * 2.2;\r
  }\r
\r
  fragColor = vec4(clamp(density, 0.0, 6.0), velocity, 1.0);\r
}\`;\r
\r
const SHADE = \`#version 300 es\r
precision highp float;\r
in vec2 vUv;\r
out vec4 fragColor;\r
uniform sampler2D uState;\r
uniform vec2 uSimSize;\r
uniform vec2 uView;\r
uniform vec2 uHead;\r
uniform float uHeadSize;\r
uniform float uHeadAmount;\r
uniform float uTime;\r
uniform vec3 uColor;\r
uniform float uDetail;\r
uniform float uNoiseScale;\r
uniform vec2 uFlow;\r
uniform float uBrightness;\r
uniform float uTheme;\r
\r
float hash(vec2 p) {\r
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);\r
  p3 += dot(p3, p3.yzx + 33.33);\r
  return fract((p3.x + p3.y) * p3.z);\r
}\r
float noise(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = fract(p);\r
  f = f * f * (3.0 - 2.0 * f);\r
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);\r
}\r
float fbm(vec2 p) {\r
  float v = 0.0;\r
  float a = 0.5;\r
  mat2 m = mat2(0.8776, 0.4794, -0.4794, 0.8776);\r
  for (int i = 0; i < 4; i++) {\r
    v += a * noise(p);\r
    p = m * p * 2.0;\r
    a *= 0.5;\r
  }\r
  return v;\r
}\r
float fbm5(vec2 p) {\r
  float v = 0.0;\r
  float a = 0.5;\r
  mat2 m = mat2(0.8776, 0.4794, -0.4794, 0.8776);\r
  for (int i = 0; i < 5; i++) {\r
    v += a * noise(p);\r
    p = m * p * 2.0;\r
    a *= 0.52;\r
  }\r
  return v;\r
}\r
vec4 cubic(sampler2D tex, vec2 uv, vec2 size) {\r
  vec2 st = uv * size - 0.5;\r
  vec2 i = floor(st);\r
  vec2 f = st - i;\r
  vec2 f2 = f * f;\r
  vec2 f3 = f2 * f;\r
  vec2 w0 = (1.0 - 3.0 * f + 3.0 * f2 - f3) / 6.0;\r
  vec2 w1 = (4.0 - 6.0 * f2 + 3.0 * f3) / 6.0;\r
  vec2 w2 = (1.0 + 3.0 * f + 3.0 * f2 - 3.0 * f3) / 6.0;\r
  vec2 w3 = f3 / 6.0;\r
  vec2 g0 = w0 + w1;\r
  vec2 g1 = w2 + w3;\r
  vec2 c0 = (i + 0.5 + w1 / g0 - 1.0) / size;\r
  vec2 c1 = (i + 0.5 + w3 / g1 + 1.0) / size;\r
  vec4 a = texture(tex, c0) * g0.x + texture(tex, vec2(c1.x, c0.y)) * g1.x;\r
  vec4 b = texture(tex, vec2(c0.x, c1.y)) * g0.x + texture(tex, c1) * g1.x;\r
  return a * g0.y + b * g1.y;\r
}\r
float field(vec2 uv, vec2 p) {\r
  vec2 d = p - uHead;\r
  return cubic(uState, uv, uSimSize).r + uHeadAmount * exp(-dot(d, d) / (2.0 * uHeadSize * uHeadSize));\r
}\r
void main() {\r
  vec2 p = vUv * uView;\r
  float density = field(vUv, p);\r
  if (density < 0.002) {\r
    fragColor = vec4(0.0);\r
    return;\r
  }\r
  vec2 step = vec2(1.5) / uSimSize;\r
  float dx = field(vUv + vec2(step.x, 0.0), p + vec2(step.x * uView.x, 0.0)) - field(vUv - vec2(step.x, 0.0), p - vec2(step.x * uView.x, 0.0));\r
  float dy = field(vUv + vec2(0.0, step.y), p + vec2(0.0, step.y * uView.y)) - field(vUv - vec2(0.0, step.y), p - vec2(0.0, step.y * uView.y));\r
\r
  vec2 n = (p + uFlow) * uNoiseScale;\r
  float t = uTime;\r
  vec2 q = vec2(fbm(n + t * 0.1), fbm(n + vec2(5.2, 1.3) + t * 0.1));\r
  vec2 r = vec2(fbm(n + q * 1.8 + vec2(1.7, 9.2) + t * 0.15), fbm(n + q * 1.8 + vec2(8.3, 2.8) + t * 0.15));\r
  float smoke = fbm5(n + r * 1.1);\r
  float wisp = pow(smoothstep(0.18, 0.82, smoke), 2.0) * 2.8;\r
  float body = density * mix(1.0, wisp, uDetail);\r
  float cloud = body * smoothstep(0.0, 0.32, body) * 1.15;\r
  if (cloud <= 0.0) {\r
    fragColor = vec4(0.0);\r
    return;\r
  }\r
\r
  vec3 normal = normalize(vec3(-dx * 2.2, -dy * 2.2, 1.0) + vec3((q - 0.5) * 0.35 * uDetail, 0.0));\r
  float light = 0.7 + 0.5 * max(dot(normal, normalize(vec3(-0.35, 0.55, 0.75))), 0.0);\r
  float core = smoothstep(0.7, 2.2, cloud);\r
\r
  vec3 tint = mix(uColor * light, mix(uColor, vec3(1.0), 0.55) * light, core);\r
  vec3 ink = mix(uColor, uColor * 0.78, core * 0.6) * (1.12 - 0.12 * light);\r
  vec3 color = mix(tint * uBrightness, ink, uTheme) * cloud;\r
  fragColor = vec4(color, cloud);\r
}\`;\r
\r
const DOWN = \`#version 300 es\r
precision highp float;\r
in vec2 vUv;\r
out vec4 fragColor;\r
uniform sampler2D uSource;\r
uniform vec2 uTexel;\r
uniform float uThreshold;\r
void main() {\r
  vec4 a = texture(uSource, vUv + uTexel * vec2(-0.5, -0.5));\r
  vec4 b = texture(uSource, vUv + uTexel * vec2(0.5, -0.5));\r
  vec4 c = texture(uSource, vUv + uTexel * vec2(-0.5, 0.5));\r
  vec4 d = texture(uSource, vUv + uTexel * vec2(0.5, 0.5));\r
  vec4 color = (a + b + c + d) * 0.25;\r
  float peak = max(color.r, max(color.g, color.b));\r
  float keep = peak > 0.0 ? max(peak - uThreshold, 0.0) / peak : 0.0;\r
  fragColor = color * keep;\r
}\`;\r
\r
const BLUR = \`#version 300 es\r
precision highp float;\r
in vec2 vUv;\r
out vec4 fragColor;\r
uniform sampler2D uSource;\r
uniform vec2 uDirection;\r
void main() {\r
  vec4 color = texture(uSource, vUv) * 0.181862;\r
  color += (texture(uSource, vUv + uDirection * 1.423135) + texture(uSource, vUv - uDirection * 1.423135)) * 0.284316;\r
  color += (texture(uSource, vUv + uDirection * 3.326702) + texture(uSource, vUv - uDirection * 3.326702)) * 0.106598;\r
  color += (texture(uSource, vUv + uDirection * 5.242989) + texture(uSource, vUv - uDirection * 5.242989)) * 0.018156;\r
  fragColor = color;\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
in vec2 vUv;\r
out vec4 fragColor;\r
uniform sampler2D uShade;\r
uniform sampler2D uBloom0;\r
uniform sampler2D uBloom1;\r
uniform sampler2D uBloom2;\r
uniform vec2 uShadeSize;\r
uniform vec3 uWeights;\r
uniform float uBloom;\r
uniform float uPresence;\r
uniform float uGrain;\r
uniform float uEdge;\r
uniform float uTime;\r
uniform float uTheme;\r
uniform vec3 uColor;\r
\r
float hash(vec2 p) {\r
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);\r
  p3 += dot(p3, p3.yzx + 33.33);\r
  return fract((p3.x + p3.y) * p3.z);\r
}\r
vec4 cubic(sampler2D tex, vec2 uv, vec2 size) {\r
  vec2 st = uv * size - 0.5;\r
  vec2 i = floor(st);\r
  vec2 f = st - i;\r
  vec2 f2 = f * f;\r
  vec2 f3 = f2 * f;\r
  vec2 w0 = (1.0 - 3.0 * f + 3.0 * f2 - f3) / 6.0;\r
  vec2 w1 = (4.0 - 6.0 * f2 + 3.0 * f3) / 6.0;\r
  vec2 w2 = (1.0 + 3.0 * f + 3.0 * f2 - 3.0 * f3) / 6.0;\r
  vec2 w3 = f3 / 6.0;\r
  vec2 g0 = w0 + w1;\r
  vec2 g1 = w2 + w3;\r
  vec2 c0 = (i + 0.5 + w1 / g0 - 1.0) / size;\r
  vec2 c1 = (i + 0.5 + w3 / g1 + 1.0) / size;\r
  vec4 a = texture(tex, c0) * g0.x + texture(tex, vec2(c1.x, c0.y)) * g1.x;\r
  vec4 b = texture(tex, vec2(c0.x, c1.y)) * g0.x + texture(tex, c1) * g1.x;\r
  return a * g0.y + b * g1.y;\r
}\r
void main() {\r
  vec4 shade = cubic(uShade, vUv, uShadeSize);\r
  vec4 bloom = texture(uBloom0, vUv) * uWeights.x + texture(uBloom1, vUv) * uWeights.y + texture(uBloom2, vUv) * uWeights.z;\r
  vec2 edge = min(vUv, 1.0 - vUv);\r
  float vignette = mix(1.0 - uEdge, 1.0, clamp(min(edge.x, edge.y) * 2.0, 0.0, 1.0));\r
  float fade = uPresence * vignette;\r
  float grain = hash(gl_FragCoord.xy + fract(uTime * 7.13) * 91.7) - 0.5;\r
  if (uTheme > 0.5) {\r
    float coverage = 1.0 - exp(-(shade.a + bloom.a * uBloom * 0.6) * 0.95);\r
    coverage = clamp(coverage * fade * (1.0 + grain * uGrain * 2.0), 0.0, 1.0);\r
    vec3 pigment = shade.a > 0.0001 ? clamp(shade.rgb / shade.a, 0.0, 1.0) : uColor;\r
    fragColor = vec4(pow(pigment, vec3(1.0 / 2.2)) * coverage, coverage);\r
    return;\r
  }\r
  vec3 color = (shade.rgb + bloom.rgb * uBloom) * fade;\r
  color = pow(1.0 - exp(-color * 0.95), vec3(1.0 / 2.2));\r
  color += color * grain * uGrain * 2.0;\r
  color = clamp(color + (hash(gl_FragCoord.xy * 1.37) - 0.5) / 255.0, 0.0, 1.0);\r
  fragColor = vec4(color, max(color.r, max(color.g, color.b)));\r
}\`;\r
\r
const INTRO_MS = 1900;\r
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
  return [0.706, 0.592, 0.812];\r
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
  gl.bindAttribLocation(program, 0, 'aPosition');\r
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
const GhostCursor = ({\r
  color = '#B497CF',\r
  brightness = 1,\r
  size = 80,\r
  trailLength = 50,\r
  inertia = 0.5,\r
  turbulence = 0.5,\r
  drift = 0.3,\r
  detail = 1,\r
  grainIntensity = 0.05,\r
  bloomStrength = 0.6,\r
  bloomRadius = 1,\r
  bloomThreshold = 0.025,\r
  edgeIntensity = 0,\r
  clickPuff = true,\r
  intro = true,\r
  theme = 'dark',\r
  mixBlendMode,\r
  fadeDelayMs,\r
  fadeDurationMs,\r
  maxDevicePixelRatio = 2,\r
  targetPixels,\r
  zIndex = 10,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const [generation, setGeneration] = useState(0);\r
  const [touch] = useState(\r
    () => typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)\r
  );\r
\r
  const light = theme === 'light';\r
  const settings = {\r
    color: parseColor(color).map(channel => Math.pow(channel, 2.2)),\r
    brightness: Math.max(0, brightness),\r
    size: Math.max(8, size),\r
    trail: clamp(trailLength, 1, 200),\r
    inertia: clamp(inertia, 0, 0.99),\r
    turbulence: clamp(turbulence, 0, 2),\r
    drift,\r
    detail: clamp(detail, 0, 1),\r
    grain: clamp(grainIntensity, 0, 1),\r
    bloom: Math.max(0, bloomStrength),\r
    bloomRadius: clamp(bloomRadius, 0, 3),\r
    threshold: Math.max(0, bloomThreshold),\r
    edge: clamp(edgeIntensity, 0, 1),\r
    clickPuff,\r
    intro,\r
    theme: light ? 1 : 0,\r
    fadeDelay: Math.max(0, fadeDelayMs ?? (touch ? 500 : 1000)),\r
    fadeDuration: Math.max(1, fadeDurationMs ?? (touch ? 1000 : 1500)),\r
    maxRatio: clamp(maxDevicePixelRatio, 0.25, 3),\r
    budget: Math.max(5e4, targetPixels ?? (touch ? 3e5 : 6e5))\r
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
    const parent = container?.parentElement;\r
    if (!container || !canvas || !parent) return;\r
\r
    const previousPosition = parent.style.position;\r
    const reposition = getComputedStyle(parent).position === 'static';\r
    if (reposition) parent.style.position = 'relative';\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
\r
    const gl = canvas.getContext('webgl2', {\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false,\r
      powerPreference: 'default'\r
    });\r
    if (!gl || !gl.getExtension('EXT_color_buffer_float')) {\r
      if (reposition) parent.style.position = previousPosition;\r
      return;\r
    }\r
    const linked = [link(gl, SIM), link(gl, SHADE), link(gl, DOWN), link(gl, BLUR), link(gl, COMPOSITE)];\r
    const [simProgram, shadeProgram, downProgram, blurProgram, compositeProgram] = linked;\r
    if (!simProgram || !shadeProgram || !downProgram || !blurProgram || !compositeProgram) {\r
      for (const item of linked) if (item) gl.deleteProgram(item.program);\r
      if (reposition) parent.style.position = previousPosition;\r
      return;\r
    }\r
    const programs = {\r
      sim: simProgram,\r
      shade: shadeProgram,\r
      down: downProgram,\r
      blur: blurProgram,\r
      composite: compositeProgram\r
    };\r
\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    const buffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    gl.disable(gl.BLEND);\r
    gl.disable(gl.DEPTH_TEST);\r
\r
    const createTarget = () => {\r
      const texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      const framebuffer = gl.createFramebuffer();\r
      return { texture, framebuffer, width: 0, height: 0 };\r
    };\r
\r
    const allocate = (target, width, height) => {\r
      if (target.width === width && target.height === height) return false;\r
      target.width = width;\r
      target.height = height;\r
      gl.bindTexture(gl.TEXTURE_2D, target.texture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.HALF_FLOAT, null);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target.texture, 0);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      return true;\r
    };\r
\r
    const sims = [createTarget(), createTarget()];\r
    const shade = createTarget();\r
    const downs = [createTarget(), createTarget(), createTarget()];\r
    const blurs = [createTarget(), createTarget(), createTarget()];\r
\r
    const pass = (target, program) => {\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.framebuffer : null);\r
      gl.viewport(0, 0, target ? target.width : canvas.width, target ? target.height : canvas.height);\r
      gl.useProgram(program.program);\r
      return program.uniforms;\r
    };\r
\r
    const bind = (unit, texture) => {\r
      gl.activeTexture(gl.TEXTURE0 + unit);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
    };\r
\r
    const view = { width: 1, height: 1, ratio: 1, sim: 0.25, shade: 1 };\r
    const ghost = { x: 0, y: 0, vx: 0, vy: 0, px: 0, py: 0, ready: false };\r
    const pointer = { x: 0, y: 0, inside: false, moved: -1e9 };\r
    const flow = { y: 0 };\r
    const puffs = [];\r
    let presence = 0;\r
    let current = 0;\r
    let raf = 0;\r
    let last = 0;\r
    let clock = 0;\r
    let visible = true;\r
    let pageVisible = document.visibilityState !== 'hidden';\r
    let lost = false;\r
    let dirty = true;\r
    let introLive = settingsRef.current.intro && !reduced && generation === 0;\r
    let introStart = -1;\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const rect = container.getBoundingClientRect();\r
      const width = Math.max(1, Math.round(rect.width));\r
      const height = Math.max(1, Math.round(rect.height));\r
      const ratio = Math.min(window.devicePixelRatio || 1, s.maxRatio);\r
      view.width = width;\r
      view.height = height;\r
      view.ratio = ratio;\r
      const cw = Math.max(1, Math.round(width * ratio));\r
      const ch = Math.max(1, Math.round(height * ratio));\r
      if (canvas.width !== cw || canvas.height !== ch) {\r
        canvas.width = cw;\r
        canvas.height = ch;\r
      }\r
      view.shade = Math.min(1, Math.sqrt(s.budget / (width * height)));\r
      const sw = Math.max(8, Math.round(width * view.shade));\r
      const sh = Math.max(8, Math.round(height * view.shade));\r
      allocate(shade, sw, sh);\r
      let w = Math.max(4, Math.round(sw / 2));\r
      let h = Math.max(4, Math.round(sh / 2));\r
      for (let i = 0; i < 3; i++) {\r
        allocate(downs[i], w, h);\r
        allocate(blurs[i], w, h);\r
        w = Math.max(2, Math.round(w / 2));\r
        h = Math.max(2, Math.round(h / 2));\r
      }\r
      view.sim = Math.min(0.35, 220 / Math.max(width, height));\r
      const simW = Math.max(16, Math.round(width * view.sim));\r
      const simH = Math.max(16, Math.round(height * view.sim));\r
      allocate(sims[0], simW, simH);\r
      allocate(sims[1], simW, simH);\r
      dirty = true;\r
    };\r
\r
    const simulate = (dt, active) => {\r
      const s = settingsRef.current;\r
      const src = sims[current];\r
      const dst = sims[1 - current];\r
      const scale = view.sim;\r
      const sigma = s.size * scale * 0.3;\r
      const decay = Math.exp(-dt / (0.12 + s.trail * 0.022));\r
      const u = pass(dst, programs.sim);\r
      bind(0, src.texture);\r
      gl.uniform1i(u.uState, 0);\r
      gl.uniform2f(u.uSize, dst.width, dst.height);\r
      gl.uniform1f(u.uDt, dt);\r
      gl.uniform1f(u.uTime, clock);\r
      gl.uniform1f(u.uDecay, decay);\r
      gl.uniform1f(u.uDrag, Math.exp(-dt * 2.4));\r
      gl.uniform2f(u.uDrift, 0, s.drift * 110 * scale);\r
      gl.uniform1f(u.uTurbulence, s.turbulence * 70 * scale);\r
      gl.uniform1f(u.uSwirl, 1 / Math.max(1, s.size * scale * 2.2));\r
      gl.uniform2f(u.uFrom, ghost.px * scale, (view.height - ghost.py) * scale);\r
      gl.uniform2f(u.uTo, ghost.x * scale, (view.height - ghost.y) * scale);\r
      gl.uniform1f(u.uRadius, sigma);\r
      gl.uniform1f(u.uTrail, active ? 0.42 * presence : 0);\r
      gl.uniform1f(u.uIdle, active ? 0.22 * presence : 0);\r
      gl.uniform2f(u.uVelocity, ghost.vx * scale * 0.5, -ghost.vy * scale * 0.5);\r
      const puff = puffs.shift();\r
      if (puff) {\r
        gl.uniform4f(u.uPuff, puff.x * scale, (view.height - puff.y) * scale, sigma * 1.4, 0.9);\r
      } else {\r
        gl.uniform4f(u.uPuff, 0, 0, 1, 0);\r
      }\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      current = 1 - current;\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      let u = pass(shade, programs.shade);\r
      bind(0, sims[current].texture);\r
      gl.uniform1i(u.uState, 0);\r
      gl.uniform2f(u.uSimSize, sims[current].width, sims[current].height);\r
      gl.uniform2f(u.uView, view.width, view.height);\r
      gl.uniform2f(u.uHead, ghost.x, view.height - ghost.y);\r
      gl.uniform1f(u.uHeadSize, s.size * 0.38);\r
      gl.uniform1f(u.uHeadAmount, ghost.ready ? 0.8 * presence : 0);\r
      gl.uniform1f(u.uTime, clock);\r
      gl.uniform3fv(u.uColor, s.color);\r
      gl.uniform1f(u.uDetail, s.detail);\r
      gl.uniform1f(u.uNoiseScale, 2.4 / Math.max(20, s.size * 2.6));\r
      gl.uniform2f(u.uFlow, 0, flow.y);\r
      gl.uniform1f(u.uBrightness, s.brightness);\r
      gl.uniform1f(u.uTheme, s.theme);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      let source = shade;\r
      for (let i = 0; i < 3; i++) {\r
        u = pass(downs[i], programs.down);\r
        bind(0, source.texture);\r
        gl.uniform1i(u.uSource, 0);\r
        gl.uniform2f(u.uTexel, 1 / source.width, 1 / source.height);\r
        gl.uniform1f(u.uThreshold, i === 0 ? s.threshold : 0);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
        u = pass(blurs[i], programs.blur);\r
        bind(0, downs[i].texture);\r
        gl.uniform1i(u.uSource, 0);\r
        gl.uniform2f(u.uDirection, 1 / downs[i].width, 0);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
        u = pass(downs[i], programs.blur);\r
        bind(0, blurs[i].texture);\r
        gl.uniform1i(u.uSource, 0);\r
        gl.uniform2f(u.uDirection, 0, 1 / blurs[i].height);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
        source = downs[i];\r
      }\r
\r
      u = pass(null, programs.composite);\r
      bind(0, shade.texture);\r
      bind(1, downs[0].texture);\r
      bind(2, downs[1].texture);\r
      bind(3, downs[2].texture);\r
      gl.uniform1i(u.uShade, 0);\r
      gl.uniform1i(u.uBloom0, 1);\r
      gl.uniform1i(u.uBloom1, 2);\r
      gl.uniform1i(u.uBloom2, 3);\r
      gl.uniform2f(u.uShadeSize, shade.width, shade.height);\r
      const spread = s.bloomRadius;\r
      gl.uniform3f(u.uWeights, 1, 0.6 + 0.4 * spread, 0.25 + 0.75 * Math.min(1, spread * spread * 0.5));\r
      gl.uniform1f(u.uBloom, s.bloom);\r
      gl.uniform1f(u.uPresence, presence);\r
      gl.uniform1f(u.uGrain, s.grain);\r
      gl.uniform1f(u.uEdge, s.edge);\r
      gl.uniform1f(u.uTime, clock);\r
      gl.uniform1f(u.uTheme, s.theme);\r
      gl.uniform3fv(u.uColor, s.color);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (lost) return;\r
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05);\r
      last = Math.max(last, now);\r
      clock += dt;\r
      const s = settingsRef.current;\r
      if (dirty) resize();\r
      dirty = false;\r
\r
      if (introLive) {\r
        if (introStart < 0) introStart = now + 280;\r
        const t = (now - introStart) / INTRO_MS;\r
        if (t >= 0) {\r
          const e = t < 1 ? t * t * (3 - 2 * t) : 1;\r
          const x = view.width * (0.16 + 0.44 * e + 0.05 * Math.sin(e * Math.PI));\r
          const y = view.height * (0.7 - 0.24 * e - 0.1 * Math.sin(e * Math.PI * 2));\r
          if (!ghost.ready) {\r
            ghost.x = ghost.px = x;\r
            ghost.y = ghost.py = y;\r
            ghost.vx = ghost.vy = 0;\r
            ghost.ready = true;\r
          }\r
          pointer.x = x;\r
          pointer.y = y;\r
          pointer.inside = true;\r
          pointer.moved = now;\r
          if (t >= 1) introLive = false;\r
        }\r
      }\r
\r
      const idle = now - pointer.moved;\r
      const target = !ghost.ready ? 0 : idle < s.fadeDelay ? 1 : Math.max(0, 1 - (idle - s.fadeDelay) / s.fadeDuration);\r
      presence += (target - presence) * (1 - Math.exp(-dt / (target > presence ? 0.12 : 0.08)));\r
      if (Math.abs(target - presence) < 0.002) presence = target;\r
\r
      ghost.px = ghost.x;\r
      ghost.py = ghost.y;\r
      if (ghost.ready) {\r
        if (pointer.inside) {\r
          const stiffness = 520 * Math.pow(1 - s.inertia, 2) + 26;\r
          const damping = 2 * Math.sqrt(stiffness) * 0.92;\r
          const steps = Math.max(1, Math.ceil(dt / (1 / 240)));\r
          const h = dt / steps;\r
          for (let i = 0; i < steps; i++) {\r
            ghost.vx += (stiffness * (pointer.x - ghost.x) - damping * ghost.vx) * h;\r
            ghost.vy += (stiffness * (pointer.y - ghost.y) - damping * ghost.vy) * h;\r
            ghost.x += ghost.vx * h;\r
            ghost.y += ghost.vy * h;\r
          }\r
        } else {\r
          const glide = Math.pow(s.inertia, dt * 60);\r
          ghost.vx *= glide;\r
          ghost.vy *= glide;\r
          ghost.x += ghost.vx * dt;\r
          ghost.y += ghost.vy * dt;\r
        }\r
      }\r
      flow.y -= s.drift * 110 * dt;\r
\r
      simulate(dt, presence > 0.01);\r
      render();\r
\r
      const busy = introLive || target > 0 || presence > 0.001 || puffs.length > 0;\r
      if (!busy) {\r
        for (const target of sims) {\r
          gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);\r
          gl.clearColor(0, 0, 0, 0);\r
          gl.clear(gl.COLOR_BUFFER_BIT);\r
        }\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
        gl.viewport(0, 0, canvas.width, canvas.height);\r
        gl.clearColor(0, 0, 0, 0);\r
        gl.clear(gl.COLOR_BUFFER_BIT);\r
        return;\r
      }\r
      if (visible && pageVisible) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (raf || lost || !visible || !pageVisible) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
    wakeRef.current = wake;\r
\r
    const locate = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };\r
    };\r
\r
    const onPointerMove = event => {\r
      const spot = locate(event);\r
      if (spot.inside) introLive = false;\r
      if (!spot.inside) {\r
        if (pointer.inside) onLeave();\r
        return;\r
      }\r
      if (!pointer.inside && !ghost.ready) {\r
        ghost.x = ghost.px = spot.x;\r
        ghost.y = ghost.py = spot.y;\r
        ghost.vx = ghost.vy = 0;\r
        ghost.ready = true;\r
      } else if (!pointer.inside && presence < 0.05) {\r
        ghost.x = ghost.px = spot.x;\r
        ghost.y = ghost.py = spot.y;\r
        ghost.vx = ghost.vy = 0;\r
      }\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = true;\r
      pointer.moved = performance.now();\r
      wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      const spot = locate(event);\r
      if (!spot.inside) return;\r
      onPointerMove(event);\r
      if (settingsRef.current.clickPuff) {\r
        puffs.push({ x: spot.x, y: spot.y });\r
        wake();\r
      }\r
    };\r
\r
    const onLeave = () => {\r
      const now = performance.now();\r
      if (pointer.inside && now - pointer.moved < settingsRef.current.fadeDelay) pointer.moved = now;\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
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
      dirty = true;\r
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
    if (introLive) wake();\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      canvas.removeEventListener('webglcontextlost', onLost);\r
      canvas.removeEventListener('webglcontextrestored', onRestored);\r
      if (!gl.isContextLost()) {\r
        for (const target of [...sims, shade, ...downs, ...blurs]) {\r
          gl.deleteFramebuffer(target.framebuffer);\r
          gl.deleteTexture(target.texture);\r
        }\r
        gl.deleteBuffer(buffer);\r
        gl.deleteVertexArray(vao);\r
        for (const item of Object.values(programs)) gl.deleteProgram(item.program);\r
      }\r
      if (reposition) parent.style.position = previousPosition;\r
    };\r
  }, [generation]);\r
\r
  const blend = mixBlendMode ?? (light ? 'normal' : 'screen');\r
\r
  return (\r
    <div\r
      ref={containerRef}\r
      className={\`pointer-events-none absolute inset-0 overflow-hidden \${className}\`.trim()}\r
      style={{ zIndex, ...style }}\r
    >\r
      <canvas\r
        ref={canvasRef}\r
        className="absolute inset-0 block h-full w-full"\r
        style={{ mixBlendMode: blend }}\r
        aria-hidden="true"\r
      />\r
    </div>\r
  );\r
};\r
\r
export default GhostCursor;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, useState, type CSSProperties } from 'react';\r
import './GhostCursor.css';\r
\r
export interface GhostCursorProps {\r
  color?: string;\r
  brightness?: number;\r
  size?: number;\r
  trailLength?: number;\r
  inertia?: number;\r
  turbulence?: number;\r
  drift?: number;\r
  detail?: number;\r
  grainIntensity?: number;\r
  bloomStrength?: number;\r
  bloomRadius?: number;\r
  bloomThreshold?: number;\r
  edgeIntensity?: number;\r
  clickPuff?: boolean;\r
  intro?: boolean;\r
  theme?: 'dark' | 'light';\r
  mixBlendMode?: CSSProperties['mixBlendMode'];\r
  fadeDelayMs?: number;\r
  fadeDurationMs?: number;\r
  maxDevicePixelRatio?: number;\r
  targetPixels?: number;\r
  zIndex?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Settings {\r
  color: number[];\r
  brightness: number;\r
  size: number;\r
  trail: number;\r
  inertia: number;\r
  turbulence: number;\r
  drift: number;\r
  detail: number;\r
  grain: number;\r
  bloom: number;\r
  bloomRadius: number;\r
  threshold: number;\r
  edge: number;\r
  clickPuff: boolean;\r
  intro: boolean;\r
  theme: number;\r
  fadeDelay: number;\r
  fadeDuration: number;\r
  maxRatio: number;\r
  budget: number;\r
}\r
\r
type Uniforms = Record<string, WebGLUniformLocation | null>;\r
\r
interface Program {\r
  program: WebGLProgram;\r
  uniforms: Uniforms;\r
}\r
\r
interface Target {\r
  texture: WebGLTexture | null;\r
  framebuffer: WebGLFramebuffer | null;\r
  width: number;\r
  height: number;\r
}\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
out vec2 vUv;\r
void main() {\r
  vUv = aPosition * 0.5 + 0.5;\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const NOISE = \`\r
vec2 hash2(vec2 p) {\r
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.103, 0.0973));\r
  p3 += dot(p3, p3.yzx + 33.33);\r
  return fract((p3.xx + p3.yz) * p3.zy) * 2.0 - 1.0;\r
}\r
\r
vec3 gradientNoise(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = fract(p);\r
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);\r
  vec2 du = 30.0 * f * f * (f * (f - 2.0) + 1.0);\r
  vec2 ga = hash2(i);\r
  vec2 gb = hash2(i + vec2(1.0, 0.0));\r
  vec2 gc = hash2(i + vec2(0.0, 1.0));\r
  vec2 gd = hash2(i + vec2(1.0, 1.0));\r
  float va = dot(ga, f);\r
  float vb = dot(gb, f - vec2(1.0, 0.0));\r
  float vc = dot(gc, f - vec2(0.0, 1.0));\r
  float vd = dot(gd, f - vec2(1.0, 1.0));\r
  float k = va - vb - vc + vd;\r
  float value = va + u.x * (vb - va) + u.y * (vc - va) + u.x * u.y * k;\r
  vec2 slope = ga + u.x * (gb - ga) + u.y * (gc - ga) + u.x * u.y * (ga - gb - gc + gd) + du * (u.yx * k + vec2(vb, vc) - va);\r
  return vec3(value, slope);\r
}\r
\`;\r
\r
const SIM = \`#version 300 es\r
precision highp float;\r
in vec2 vUv;\r
out vec4 fragColor;\r
uniform sampler2D uState;\r
uniform vec2 uSize;\r
uniform float uDt;\r
uniform float uTime;\r
uniform float uDecay;\r
uniform float uDrag;\r
uniform vec2 uDrift;\r
uniform float uTurbulence;\r
uniform float uSwirl;\r
uniform vec2 uFrom;\r
uniform vec2 uTo;\r
uniform float uRadius;\r
uniform float uTrail;\r
uniform float uIdle;\r
uniform vec2 uVelocity;\r
uniform vec4 uPuff;\r
\${NOISE}\r
float erf(float x) {\r
  float x2 = x * x;\r
  return sign(x) * sqrt(1.0 - exp(-x2 * (1.2732395 + 0.147 * x2) / (1.0 + 0.147 * x2)));\r
}\r
vec2 curl(vec2 p) {\r
  vec3 a = gradientNoise(p * uSwirl + vec2(uTime * 0.11, -uTime * 0.07));\r
  vec3 b = gradientNoise(p * uSwirl * 2.03 + vec2(-uTime * 0.13, uTime * 0.09) + 17.3);\r
  vec2 g = a.yz + b.yz * 0.5;\r
  return vec2(g.y, -g.x);\r
}\r
vec4 fetch(vec2 p) {\r
  if (p.x < 0.0 || p.y < 0.0 || p.x > uSize.x || p.y > uSize.y) return vec4(0.0);\r
  return texture(uState, p / uSize);\r
}\r
void main() {\r
  vec2 p = gl_FragCoord.xy;\r
  vec4 here = texture(uState, vUv);\r
  vec2 flow = here.gb + curl(p) * uTurbulence + uDrift;\r
  vec4 state = fetch(p - flow * uDt);\r
  float density = state.r * uDecay;\r
  vec2 velocity = state.gb * uDrag;\r
\r
  float sigma = max(uRadius, 0.5);\r
  vec2 ab = uTo - uFrom;\r
  float len = length(ab);\r
  float trail = 0.0;\r
  if (len > 0.25) {\r
    vec2 dir = ab / len;\r
    vec2 ap = p - uFrom;\r
    float along = dot(ap, dir);\r
    float across = dot(ap, vec2(-dir.y, dir.x));\r
    float k = 1.4142136 * sigma;\r
    trail = exp(-across * across / (2.0 * sigma * sigma)) * 0.5 * (erf(along / k) - erf((along - len) / k));\r
  }\r
  vec2 dh = p - uTo;\r
  float head = exp(-dot(dh, dh) / (2.0 * sigma * sigma));\r
  density += uTrail * trail + uIdle * uDt * head;\r
  velocity += (uVelocity - velocity) * clamp(trail * 0.65, 0.0, 1.0);\r
\r
  if (uPuff.w > 0.0) {\r
    vec2 d = p - uPuff.xy;\r
    float r2 = dot(d, d);\r
    float g = exp(-r2 / (2.0 * uPuff.z * uPuff.z));\r
    density += uPuff.w * g;\r
    velocity += (r2 > 0.0001 ? d / sqrt(r2) : vec2(0.0)) * g * uPuff.w * uPuff.z * 2.2;\r
  }\r
\r
  fragColor = vec4(clamp(density, 0.0, 6.0), velocity, 1.0);\r
}\`;\r
\r
const SHADE = \`#version 300 es\r
precision highp float;\r
in vec2 vUv;\r
out vec4 fragColor;\r
uniform sampler2D uState;\r
uniform vec2 uSimSize;\r
uniform vec2 uView;\r
uniform vec2 uHead;\r
uniform float uHeadSize;\r
uniform float uHeadAmount;\r
uniform float uTime;\r
uniform vec3 uColor;\r
uniform float uDetail;\r
uniform float uNoiseScale;\r
uniform vec2 uFlow;\r
uniform float uBrightness;\r
uniform float uTheme;\r
\r
float hash(vec2 p) {\r
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);\r
  p3 += dot(p3, p3.yzx + 33.33);\r
  return fract((p3.x + p3.y) * p3.z);\r
}\r
float noise(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = fract(p);\r
  f = f * f * (3.0 - 2.0 * f);\r
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);\r
}\r
float fbm(vec2 p) {\r
  float v = 0.0;\r
  float a = 0.5;\r
  mat2 m = mat2(0.8776, 0.4794, -0.4794, 0.8776);\r
  for (int i = 0; i < 4; i++) {\r
    v += a * noise(p);\r
    p = m * p * 2.0;\r
    a *= 0.5;\r
  }\r
  return v;\r
}\r
float fbm5(vec2 p) {\r
  float v = 0.0;\r
  float a = 0.5;\r
  mat2 m = mat2(0.8776, 0.4794, -0.4794, 0.8776);\r
  for (int i = 0; i < 5; i++) {\r
    v += a * noise(p);\r
    p = m * p * 2.0;\r
    a *= 0.52;\r
  }\r
  return v;\r
}\r
vec4 cubic(sampler2D tex, vec2 uv, vec2 size) {\r
  vec2 st = uv * size - 0.5;\r
  vec2 i = floor(st);\r
  vec2 f = st - i;\r
  vec2 f2 = f * f;\r
  vec2 f3 = f2 * f;\r
  vec2 w0 = (1.0 - 3.0 * f + 3.0 * f2 - f3) / 6.0;\r
  vec2 w1 = (4.0 - 6.0 * f2 + 3.0 * f3) / 6.0;\r
  vec2 w2 = (1.0 + 3.0 * f + 3.0 * f2 - 3.0 * f3) / 6.0;\r
  vec2 w3 = f3 / 6.0;\r
  vec2 g0 = w0 + w1;\r
  vec2 g1 = w2 + w3;\r
  vec2 c0 = (i + 0.5 + w1 / g0 - 1.0) / size;\r
  vec2 c1 = (i + 0.5 + w3 / g1 + 1.0) / size;\r
  vec4 a = texture(tex, c0) * g0.x + texture(tex, vec2(c1.x, c0.y)) * g1.x;\r
  vec4 b = texture(tex, vec2(c0.x, c1.y)) * g0.x + texture(tex, c1) * g1.x;\r
  return a * g0.y + b * g1.y;\r
}\r
float field(vec2 uv, vec2 p) {\r
  vec2 d = p - uHead;\r
  return cubic(uState, uv, uSimSize).r + uHeadAmount * exp(-dot(d, d) / (2.0 * uHeadSize * uHeadSize));\r
}\r
void main() {\r
  vec2 p = vUv * uView;\r
  float density = field(vUv, p);\r
  if (density < 0.002) {\r
    fragColor = vec4(0.0);\r
    return;\r
  }\r
  vec2 step = vec2(1.5) / uSimSize;\r
  float dx = field(vUv + vec2(step.x, 0.0), p + vec2(step.x * uView.x, 0.0)) - field(vUv - vec2(step.x, 0.0), p - vec2(step.x * uView.x, 0.0));\r
  float dy = field(vUv + vec2(0.0, step.y), p + vec2(0.0, step.y * uView.y)) - field(vUv - vec2(0.0, step.y), p - vec2(0.0, step.y * uView.y));\r
\r
  vec2 n = (p + uFlow) * uNoiseScale;\r
  float t = uTime;\r
  vec2 q = vec2(fbm(n + t * 0.1), fbm(n + vec2(5.2, 1.3) + t * 0.1));\r
  vec2 r = vec2(fbm(n + q * 1.8 + vec2(1.7, 9.2) + t * 0.15), fbm(n + q * 1.8 + vec2(8.3, 2.8) + t * 0.15));\r
  float smoke = fbm5(n + r * 1.1);\r
  float wisp = pow(smoothstep(0.18, 0.82, smoke), 2.0) * 2.8;\r
  float body = density * mix(1.0, wisp, uDetail);\r
  float cloud = body * smoothstep(0.0, 0.32, body) * 1.15;\r
  if (cloud <= 0.0) {\r
    fragColor = vec4(0.0);\r
    return;\r
  }\r
\r
  vec3 normal = normalize(vec3(-dx * 2.2, -dy * 2.2, 1.0) + vec3((q - 0.5) * 0.35 * uDetail, 0.0));\r
  float light = 0.7 + 0.5 * max(dot(normal, normalize(vec3(-0.35, 0.55, 0.75))), 0.0);\r
  float core = smoothstep(0.7, 2.2, cloud);\r
\r
  vec3 tint = mix(uColor * light, mix(uColor, vec3(1.0), 0.55) * light, core);\r
  vec3 ink = mix(uColor, uColor * 0.78, core * 0.6) * (1.12 - 0.12 * light);\r
  vec3 color = mix(tint * uBrightness, ink, uTheme) * cloud;\r
  fragColor = vec4(color, cloud);\r
}\`;\r
\r
const DOWN = \`#version 300 es\r
precision highp float;\r
in vec2 vUv;\r
out vec4 fragColor;\r
uniform sampler2D uSource;\r
uniform vec2 uTexel;\r
uniform float uThreshold;\r
void main() {\r
  vec4 a = texture(uSource, vUv + uTexel * vec2(-0.5, -0.5));\r
  vec4 b = texture(uSource, vUv + uTexel * vec2(0.5, -0.5));\r
  vec4 c = texture(uSource, vUv + uTexel * vec2(-0.5, 0.5));\r
  vec4 d = texture(uSource, vUv + uTexel * vec2(0.5, 0.5));\r
  vec4 color = (a + b + c + d) * 0.25;\r
  float peak = max(color.r, max(color.g, color.b));\r
  float keep = peak > 0.0 ? max(peak - uThreshold, 0.0) / peak : 0.0;\r
  fragColor = color * keep;\r
}\`;\r
\r
const BLUR = \`#version 300 es\r
precision highp float;\r
in vec2 vUv;\r
out vec4 fragColor;\r
uniform sampler2D uSource;\r
uniform vec2 uDirection;\r
void main() {\r
  vec4 color = texture(uSource, vUv) * 0.181862;\r
  color += (texture(uSource, vUv + uDirection * 1.423135) + texture(uSource, vUv - uDirection * 1.423135)) * 0.284316;\r
  color += (texture(uSource, vUv + uDirection * 3.326702) + texture(uSource, vUv - uDirection * 3.326702)) * 0.106598;\r
  color += (texture(uSource, vUv + uDirection * 5.242989) + texture(uSource, vUv - uDirection * 5.242989)) * 0.018156;\r
  fragColor = color;\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
in vec2 vUv;\r
out vec4 fragColor;\r
uniform sampler2D uShade;\r
uniform sampler2D uBloom0;\r
uniform sampler2D uBloom1;\r
uniform sampler2D uBloom2;\r
uniform vec2 uShadeSize;\r
uniform vec3 uWeights;\r
uniform float uBloom;\r
uniform float uPresence;\r
uniform float uGrain;\r
uniform float uEdge;\r
uniform float uTime;\r
uniform float uTheme;\r
uniform vec3 uColor;\r
\r
float hash(vec2 p) {\r
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);\r
  p3 += dot(p3, p3.yzx + 33.33);\r
  return fract((p3.x + p3.y) * p3.z);\r
}\r
vec4 cubic(sampler2D tex, vec2 uv, vec2 size) {\r
  vec2 st = uv * size - 0.5;\r
  vec2 i = floor(st);\r
  vec2 f = st - i;\r
  vec2 f2 = f * f;\r
  vec2 f3 = f2 * f;\r
  vec2 w0 = (1.0 - 3.0 * f + 3.0 * f2 - f3) / 6.0;\r
  vec2 w1 = (4.0 - 6.0 * f2 + 3.0 * f3) / 6.0;\r
  vec2 w2 = (1.0 + 3.0 * f + 3.0 * f2 - 3.0 * f3) / 6.0;\r
  vec2 w3 = f3 / 6.0;\r
  vec2 g0 = w0 + w1;\r
  vec2 g1 = w2 + w3;\r
  vec2 c0 = (i + 0.5 + w1 / g0 - 1.0) / size;\r
  vec2 c1 = (i + 0.5 + w3 / g1 + 1.0) / size;\r
  vec4 a = texture(tex, c0) * g0.x + texture(tex, vec2(c1.x, c0.y)) * g1.x;\r
  vec4 b = texture(tex, vec2(c0.x, c1.y)) * g0.x + texture(tex, c1) * g1.x;\r
  return a * g0.y + b * g1.y;\r
}\r
void main() {\r
  vec4 shade = cubic(uShade, vUv, uShadeSize);\r
  vec4 bloom = texture(uBloom0, vUv) * uWeights.x + texture(uBloom1, vUv) * uWeights.y + texture(uBloom2, vUv) * uWeights.z;\r
  vec2 edge = min(vUv, 1.0 - vUv);\r
  float vignette = mix(1.0 - uEdge, 1.0, clamp(min(edge.x, edge.y) * 2.0, 0.0, 1.0));\r
  float fade = uPresence * vignette;\r
  float grain = hash(gl_FragCoord.xy + fract(uTime * 7.13) * 91.7) - 0.5;\r
  if (uTheme > 0.5) {\r
    float coverage = 1.0 - exp(-(shade.a + bloom.a * uBloom * 0.6) * 0.95);\r
    coverage = clamp(coverage * fade * (1.0 + grain * uGrain * 2.0), 0.0, 1.0);\r
    vec3 pigment = shade.a > 0.0001 ? clamp(shade.rgb / shade.a, 0.0, 1.0) : uColor;\r
    fragColor = vec4(pow(pigment, vec3(1.0 / 2.2)) * coverage, coverage);\r
    return;\r
  }\r
  vec3 color = (shade.rgb + bloom.rgb * uBloom) * fade;\r
  color = pow(1.0 - exp(-color * 0.95), vec3(1.0 / 2.2));\r
  color += color * grain * uGrain * 2.0;\r
  color = clamp(color + (hash(gl_FragCoord.xy * 1.37) - 0.5) / 255.0, 0.0, 1.0);\r
  fragColor = vec4(color, max(color.r, max(color.g, color.b)));\r
}\`;\r
\r
const INTRO_MS = 1900;\r
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
  return [0.706, 0.592, 0.812];\r
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
  gl.bindAttribLocation(program, 0, 'aPosition');\r
  gl.linkProgram(program);\r
  gl.deleteShader(vertex);\r
  gl.deleteShader(fragment);\r
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {\r
    console.error(gl.getProgramInfoLog(program));\r
    gl.deleteProgram(program);\r
    return null;\r
  }\r
  const uniforms: Uniforms = {};\r
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
  for (let index = 0; index < count; index++) {\r
    const info = gl.getActiveUniform(program, index);\r
    if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const GhostCursor = ({\r
  color = '#B497CF',\r
  brightness = 1,\r
  size = 80,\r
  trailLength = 50,\r
  inertia = 0.5,\r
  turbulence = 0.5,\r
  drift = 0.3,\r
  detail = 1,\r
  grainIntensity = 0.05,\r
  bloomStrength = 0.6,\r
  bloomRadius = 1,\r
  bloomThreshold = 0.025,\r
  edgeIntensity = 0,\r
  clickPuff = true,\r
  intro = true,\r
  theme = 'dark',\r
  mixBlendMode,\r
  fadeDelayMs,\r
  fadeDurationMs,\r
  maxDevicePixelRatio = 2,\r
  targetPixels,\r
  zIndex = 10,\r
  className = '',\r
  style\r
}: GhostCursorProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const [generation, setGeneration] = useState(0);\r
  const [touch] = useState(\r
    () => typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)\r
  );\r
\r
  const light = theme === 'light';\r
  const settings: Settings = {\r
    color: parseColor(color).map(channel => Math.pow(channel, 2.2)),\r
    brightness: Math.max(0, brightness),\r
    size: Math.max(8, size),\r
    trail: clamp(trailLength, 1, 200),\r
    inertia: clamp(inertia, 0, 0.99),\r
    turbulence: clamp(turbulence, 0, 2),\r
    drift,\r
    detail: clamp(detail, 0, 1),\r
    grain: clamp(grainIntensity, 0, 1),\r
    bloom: Math.max(0, bloomStrength),\r
    bloomRadius: clamp(bloomRadius, 0, 3),\r
    threshold: Math.max(0, bloomThreshold),\r
    edge: clamp(edgeIntensity, 0, 1),\r
    clickPuff,\r
    intro,\r
    theme: light ? 1 : 0,\r
    fadeDelay: Math.max(0, fadeDelayMs ?? (touch ? 500 : 1000)),\r
    fadeDuration: Math.max(1, fadeDurationMs ?? (touch ? 1000 : 1500)),\r
    maxRatio: clamp(maxDevicePixelRatio, 0.25, 3),\r
    budget: Math.max(5e4, targetPixels ?? (touch ? 3e5 : 6e5))\r
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
    const parent = container?.parentElement;\r
    if (!container || !canvas || !parent) return;\r
\r
    const previousPosition = parent.style.position;\r
    const reposition = getComputedStyle(parent).position === 'static';\r
    if (reposition) parent.style.position = 'relative';\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
\r
    const gl = canvas.getContext('webgl2', {\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false,\r
      powerPreference: 'default'\r
    });\r
    if (!gl || !gl.getExtension('EXT_color_buffer_float')) {\r
      if (reposition) parent.style.position = previousPosition;\r
      return;\r
    }\r
    const linked = [link(gl, SIM), link(gl, SHADE), link(gl, DOWN), link(gl, BLUR), link(gl, COMPOSITE)];\r
    const [simProgram, shadeProgram, downProgram, blurProgram, compositeProgram] = linked;\r
    if (!simProgram || !shadeProgram || !downProgram || !blurProgram || !compositeProgram) {\r
      for (const item of linked) if (item) gl.deleteProgram(item.program);\r
      if (reposition) parent.style.position = previousPosition;\r
      return;\r
    }\r
    const programs = {\r
      sim: simProgram,\r
      shade: shadeProgram,\r
      down: downProgram,\r
      blur: blurProgram,\r
      composite: compositeProgram\r
    };\r
\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    const buffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    gl.disable(gl.BLEND);\r
    gl.disable(gl.DEPTH_TEST);\r
\r
    const createTarget = (): Target => {\r
      const texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      const framebuffer = gl.createFramebuffer();\r
      return { texture, framebuffer, width: 0, height: 0 };\r
    };\r
\r
    const allocate = (target: Target, width: number, height: number) => {\r
      if (target.width === width && target.height === height) return false;\r
      target.width = width;\r
      target.height = height;\r
      gl.bindTexture(gl.TEXTURE_2D, target.texture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.HALF_FLOAT, null);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target.texture, 0);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      return true;\r
    };\r
\r
    const sims = [createTarget(), createTarget()];\r
    const shade = createTarget();\r
    const downs = [createTarget(), createTarget(), createTarget()];\r
    const blurs = [createTarget(), createTarget(), createTarget()];\r
\r
    const pass = (target: Target | null, program: Program) => {\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.framebuffer : null);\r
      gl.viewport(0, 0, target ? target.width : canvas.width, target ? target.height : canvas.height);\r
      gl.useProgram(program.program);\r
      return program.uniforms;\r
    };\r
\r
    const bind = (unit: number, texture: WebGLTexture | null) => {\r
      gl.activeTexture(gl.TEXTURE0 + unit);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
    };\r
\r
    const view = { width: 1, height: 1, ratio: 1, sim: 0.25, shade: 1 };\r
    const ghost = { x: 0, y: 0, vx: 0, vy: 0, px: 0, py: 0, ready: false };\r
    const pointer = { x: 0, y: 0, inside: false, moved: -1e9 };\r
    const flow = { y: 0 };\r
    const puffs: { x: number; y: number }[] = [];\r
    let presence = 0;\r
    let current = 0;\r
    let raf = 0;\r
    let last = 0;\r
    let clock = 0;\r
    let visible = true;\r
    let pageVisible = document.visibilityState !== 'hidden';\r
    let lost = false;\r
    let dirty = true;\r
    let introLive = settingsRef.current.intro && !reduced && generation === 0;\r
    let introStart = -1;\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const rect = container.getBoundingClientRect();\r
      const width = Math.max(1, Math.round(rect.width));\r
      const height = Math.max(1, Math.round(rect.height));\r
      const ratio = Math.min(window.devicePixelRatio || 1, s.maxRatio);\r
      view.width = width;\r
      view.height = height;\r
      view.ratio = ratio;\r
      const cw = Math.max(1, Math.round(width * ratio));\r
      const ch = Math.max(1, Math.round(height * ratio));\r
      if (canvas.width !== cw || canvas.height !== ch) {\r
        canvas.width = cw;\r
        canvas.height = ch;\r
      }\r
      view.shade = Math.min(1, Math.sqrt(s.budget / (width * height)));\r
      const sw = Math.max(8, Math.round(width * view.shade));\r
      const sh = Math.max(8, Math.round(height * view.shade));\r
      allocate(shade, sw, sh);\r
      let w = Math.max(4, Math.round(sw / 2));\r
      let h = Math.max(4, Math.round(sh / 2));\r
      for (let i = 0; i < 3; i++) {\r
        allocate(downs[i], w, h);\r
        allocate(blurs[i], w, h);\r
        w = Math.max(2, Math.round(w / 2));\r
        h = Math.max(2, Math.round(h / 2));\r
      }\r
      view.sim = Math.min(0.35, 220 / Math.max(width, height));\r
      const simW = Math.max(16, Math.round(width * view.sim));\r
      const simH = Math.max(16, Math.round(height * view.sim));\r
      allocate(sims[0], simW, simH);\r
      allocate(sims[1], simW, simH);\r
      dirty = true;\r
    };\r
\r
    const simulate = (dt: number, active: boolean) => {\r
      const s = settingsRef.current;\r
      const src = sims[current];\r
      const dst = sims[1 - current];\r
      const scale = view.sim;\r
      const sigma = s.size * scale * 0.3;\r
      const decay = Math.exp(-dt / (0.12 + s.trail * 0.022));\r
      const u = pass(dst, programs.sim);\r
      bind(0, src.texture);\r
      gl.uniform1i(u.uState, 0);\r
      gl.uniform2f(u.uSize, dst.width, dst.height);\r
      gl.uniform1f(u.uDt, dt);\r
      gl.uniform1f(u.uTime, clock);\r
      gl.uniform1f(u.uDecay, decay);\r
      gl.uniform1f(u.uDrag, Math.exp(-dt * 2.4));\r
      gl.uniform2f(u.uDrift, 0, s.drift * 110 * scale);\r
      gl.uniform1f(u.uTurbulence, s.turbulence * 70 * scale);\r
      gl.uniform1f(u.uSwirl, 1 / Math.max(1, s.size * scale * 2.2));\r
      gl.uniform2f(u.uFrom, ghost.px * scale, (view.height - ghost.py) * scale);\r
      gl.uniform2f(u.uTo, ghost.x * scale, (view.height - ghost.y) * scale);\r
      gl.uniform1f(u.uRadius, sigma);\r
      gl.uniform1f(u.uTrail, active ? 0.42 * presence : 0);\r
      gl.uniform1f(u.uIdle, active ? 0.22 * presence : 0);\r
      gl.uniform2f(u.uVelocity, ghost.vx * scale * 0.5, -ghost.vy * scale * 0.5);\r
      const puff = puffs.shift();\r
      if (puff) {\r
        gl.uniform4f(u.uPuff, puff.x * scale, (view.height - puff.y) * scale, sigma * 1.4, 0.9);\r
      } else {\r
        gl.uniform4f(u.uPuff, 0, 0, 1, 0);\r
      }\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      current = 1 - current;\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      let u = pass(shade, programs.shade);\r
      bind(0, sims[current].texture);\r
      gl.uniform1i(u.uState, 0);\r
      gl.uniform2f(u.uSimSize, sims[current].width, sims[current].height);\r
      gl.uniform2f(u.uView, view.width, view.height);\r
      gl.uniform2f(u.uHead, ghost.x, view.height - ghost.y);\r
      gl.uniform1f(u.uHeadSize, s.size * 0.38);\r
      gl.uniform1f(u.uHeadAmount, ghost.ready ? 0.8 * presence : 0);\r
      gl.uniform1f(u.uTime, clock);\r
      gl.uniform3fv(u.uColor, s.color);\r
      gl.uniform1f(u.uDetail, s.detail);\r
      gl.uniform1f(u.uNoiseScale, 2.4 / Math.max(20, s.size * 2.6));\r
      gl.uniform2f(u.uFlow, 0, flow.y);\r
      gl.uniform1f(u.uBrightness, s.brightness);\r
      gl.uniform1f(u.uTheme, s.theme);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      let source = shade;\r
      for (let i = 0; i < 3; i++) {\r
        u = pass(downs[i], programs.down);\r
        bind(0, source.texture);\r
        gl.uniform1i(u.uSource, 0);\r
        gl.uniform2f(u.uTexel, 1 / source.width, 1 / source.height);\r
        gl.uniform1f(u.uThreshold, i === 0 ? s.threshold : 0);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
        u = pass(blurs[i], programs.blur);\r
        bind(0, downs[i].texture);\r
        gl.uniform1i(u.uSource, 0);\r
        gl.uniform2f(u.uDirection, 1 / downs[i].width, 0);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
        u = pass(downs[i], programs.blur);\r
        bind(0, blurs[i].texture);\r
        gl.uniform1i(u.uSource, 0);\r
        gl.uniform2f(u.uDirection, 0, 1 / blurs[i].height);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
        source = downs[i];\r
      }\r
\r
      u = pass(null, programs.composite);\r
      bind(0, shade.texture);\r
      bind(1, downs[0].texture);\r
      bind(2, downs[1].texture);\r
      bind(3, downs[2].texture);\r
      gl.uniform1i(u.uShade, 0);\r
      gl.uniform1i(u.uBloom0, 1);\r
      gl.uniform1i(u.uBloom1, 2);\r
      gl.uniform1i(u.uBloom2, 3);\r
      gl.uniform2f(u.uShadeSize, shade.width, shade.height);\r
      const spread = s.bloomRadius;\r
      gl.uniform3f(u.uWeights, 1, 0.6 + 0.4 * spread, 0.25 + 0.75 * Math.min(1, spread * spread * 0.5));\r
      gl.uniform1f(u.uBloom, s.bloom);\r
      gl.uniform1f(u.uPresence, presence);\r
      gl.uniform1f(u.uGrain, s.grain);\r
      gl.uniform1f(u.uEdge, s.edge);\r
      gl.uniform1f(u.uTime, clock);\r
      gl.uniform1f(u.uTheme, s.theme);\r
      gl.uniform3fv(u.uColor, s.color);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (lost) return;\r
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05);\r
      last = Math.max(last, now);\r
      clock += dt;\r
      const s = settingsRef.current;\r
      if (dirty) resize();\r
      dirty = false;\r
\r
      if (introLive) {\r
        if (introStart < 0) introStart = now + 280;\r
        const t = (now - introStart) / INTRO_MS;\r
        if (t >= 0) {\r
          const e = t < 1 ? t * t * (3 - 2 * t) : 1;\r
          const x = view.width * (0.16 + 0.44 * e + 0.05 * Math.sin(e * Math.PI));\r
          const y = view.height * (0.7 - 0.24 * e - 0.1 * Math.sin(e * Math.PI * 2));\r
          if (!ghost.ready) {\r
            ghost.x = ghost.px = x;\r
            ghost.y = ghost.py = y;\r
            ghost.vx = ghost.vy = 0;\r
            ghost.ready = true;\r
          }\r
          pointer.x = x;\r
          pointer.y = y;\r
          pointer.inside = true;\r
          pointer.moved = now;\r
          if (t >= 1) introLive = false;\r
        }\r
      }\r
\r
      const idle = now - pointer.moved;\r
      const target = !ghost.ready ? 0 : idle < s.fadeDelay ? 1 : Math.max(0, 1 - (idle - s.fadeDelay) / s.fadeDuration);\r
      presence += (target - presence) * (1 - Math.exp(-dt / (target > presence ? 0.12 : 0.08)));\r
      if (Math.abs(target - presence) < 0.002) presence = target;\r
\r
      ghost.px = ghost.x;\r
      ghost.py = ghost.y;\r
      if (ghost.ready) {\r
        if (pointer.inside) {\r
          const stiffness = 520 * Math.pow(1 - s.inertia, 2) + 26;\r
          const damping = 2 * Math.sqrt(stiffness) * 0.92;\r
          const steps = Math.max(1, Math.ceil(dt / (1 / 240)));\r
          const h = dt / steps;\r
          for (let i = 0; i < steps; i++) {\r
            ghost.vx += (stiffness * (pointer.x - ghost.x) - damping * ghost.vx) * h;\r
            ghost.vy += (stiffness * (pointer.y - ghost.y) - damping * ghost.vy) * h;\r
            ghost.x += ghost.vx * h;\r
            ghost.y += ghost.vy * h;\r
          }\r
        } else {\r
          const glide = Math.pow(s.inertia, dt * 60);\r
          ghost.vx *= glide;\r
          ghost.vy *= glide;\r
          ghost.x += ghost.vx * dt;\r
          ghost.y += ghost.vy * dt;\r
        }\r
      }\r
      flow.y -= s.drift * 110 * dt;\r
\r
      simulate(dt, presence > 0.01);\r
      render();\r
\r
      const busy = introLive || target > 0 || presence > 0.001 || puffs.length > 0;\r
      if (!busy) {\r
        for (const target of sims) {\r
          gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);\r
          gl.clearColor(0, 0, 0, 0);\r
          gl.clear(gl.COLOR_BUFFER_BIT);\r
        }\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
        gl.viewport(0, 0, canvas.width, canvas.height);\r
        gl.clearColor(0, 0, 0, 0);\r
        gl.clear(gl.COLOR_BUFFER_BIT);\r
        return;\r
      }\r
      if (visible && pageVisible) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (raf || lost || !visible || !pageVisible) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
    wakeRef.current = wake;\r
\r
    const locate = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const spot = locate(event);\r
      if (spot.inside) introLive = false;\r
      if (!spot.inside) {\r
        if (pointer.inside) onLeave();\r
        return;\r
      }\r
      if (!pointer.inside && !ghost.ready) {\r
        ghost.x = ghost.px = spot.x;\r
        ghost.y = ghost.py = spot.y;\r
        ghost.vx = ghost.vy = 0;\r
        ghost.ready = true;\r
      } else if (!pointer.inside && presence < 0.05) {\r
        ghost.x = ghost.px = spot.x;\r
        ghost.y = ghost.py = spot.y;\r
        ghost.vx = ghost.vy = 0;\r
      }\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = true;\r
      pointer.moved = performance.now();\r
      wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const spot = locate(event);\r
      if (!spot.inside) return;\r
      onPointerMove(event);\r
      if (settingsRef.current.clickPuff) {\r
        puffs.push({ x: spot.x, y: spot.y });\r
        wake();\r
      }\r
    };\r
\r
    const onLeave = () => {\r
      const now = performance.now();\r
      if (pointer.inside && now - pointer.moved < settingsRef.current.fadeDelay) pointer.moved = now;\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
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
      dirty = true;\r
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
    if (introLive) wake();\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      canvas.removeEventListener('webglcontextlost', onLost);\r
      canvas.removeEventListener('webglcontextrestored', onRestored);\r
      if (!gl.isContextLost()) {\r
        for (const target of [...sims, shade, ...downs, ...blurs]) {\r
          gl.deleteFramebuffer(target.framebuffer);\r
          gl.deleteTexture(target.texture);\r
        }\r
        gl.deleteBuffer(buffer);\r
        gl.deleteVertexArray(vao);\r
        for (const item of Object.values(programs)) gl.deleteProgram(item.program);\r
      }\r
      if (reposition) parent.style.position = previousPosition;\r
    };\r
  }, [generation]);\r
\r
  const blend = mixBlendMode ?? (light ? 'normal' : 'screen');\r
\r
  return (\r
    <div ref={containerRef} className={\`ghost-cursor \${className}\`.trim()} style={{ zIndex, ...style }}>\r
      <canvas ref={canvasRef} className="ghost-cursor__canvas" style={{ mixBlendMode: blend }} aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default GhostCursor;\r
`,o=`'use client';\r
\r
import { useEffect, useRef, useState, type CSSProperties } from 'react';\r
export interface GhostCursorProps {\r
  color?: string;\r
  brightness?: number;\r
  size?: number;\r
  trailLength?: number;\r
  inertia?: number;\r
  turbulence?: number;\r
  drift?: number;\r
  detail?: number;\r
  grainIntensity?: number;\r
  bloomStrength?: number;\r
  bloomRadius?: number;\r
  bloomThreshold?: number;\r
  edgeIntensity?: number;\r
  clickPuff?: boolean;\r
  intro?: boolean;\r
  theme?: 'dark' | 'light';\r
  mixBlendMode?: CSSProperties['mixBlendMode'];\r
  fadeDelayMs?: number;\r
  fadeDurationMs?: number;\r
  maxDevicePixelRatio?: number;\r
  targetPixels?: number;\r
  zIndex?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Settings {\r
  color: number[];\r
  brightness: number;\r
  size: number;\r
  trail: number;\r
  inertia: number;\r
  turbulence: number;\r
  drift: number;\r
  detail: number;\r
  grain: number;\r
  bloom: number;\r
  bloomRadius: number;\r
  threshold: number;\r
  edge: number;\r
  clickPuff: boolean;\r
  intro: boolean;\r
  theme: number;\r
  fadeDelay: number;\r
  fadeDuration: number;\r
  maxRatio: number;\r
  budget: number;\r
}\r
\r
type Uniforms = Record<string, WebGLUniformLocation | null>;\r
\r
interface Program {\r
  program: WebGLProgram;\r
  uniforms: Uniforms;\r
}\r
\r
interface Target {\r
  texture: WebGLTexture | null;\r
  framebuffer: WebGLFramebuffer | null;\r
  width: number;\r
  height: number;\r
}\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
out vec2 vUv;\r
void main() {\r
  vUv = aPosition * 0.5 + 0.5;\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const NOISE = \`\r
vec2 hash2(vec2 p) {\r
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.103, 0.0973));\r
  p3 += dot(p3, p3.yzx + 33.33);\r
  return fract((p3.xx + p3.yz) * p3.zy) * 2.0 - 1.0;\r
}\r
\r
vec3 gradientNoise(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = fract(p);\r
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);\r
  vec2 du = 30.0 * f * f * (f * (f - 2.0) + 1.0);\r
  vec2 ga = hash2(i);\r
  vec2 gb = hash2(i + vec2(1.0, 0.0));\r
  vec2 gc = hash2(i + vec2(0.0, 1.0));\r
  vec2 gd = hash2(i + vec2(1.0, 1.0));\r
  float va = dot(ga, f);\r
  float vb = dot(gb, f - vec2(1.0, 0.0));\r
  float vc = dot(gc, f - vec2(0.0, 1.0));\r
  float vd = dot(gd, f - vec2(1.0, 1.0));\r
  float k = va - vb - vc + vd;\r
  float value = va + u.x * (vb - va) + u.y * (vc - va) + u.x * u.y * k;\r
  vec2 slope = ga + u.x * (gb - ga) + u.y * (gc - ga) + u.x * u.y * (ga - gb - gc + gd) + du * (u.yx * k + vec2(vb, vc) - va);\r
  return vec3(value, slope);\r
}\r
\`;\r
\r
const SIM = \`#version 300 es\r
precision highp float;\r
in vec2 vUv;\r
out vec4 fragColor;\r
uniform sampler2D uState;\r
uniform vec2 uSize;\r
uniform float uDt;\r
uniform float uTime;\r
uniform float uDecay;\r
uniform float uDrag;\r
uniform vec2 uDrift;\r
uniform float uTurbulence;\r
uniform float uSwirl;\r
uniform vec2 uFrom;\r
uniform vec2 uTo;\r
uniform float uRadius;\r
uniform float uTrail;\r
uniform float uIdle;\r
uniform vec2 uVelocity;\r
uniform vec4 uPuff;\r
\${NOISE}\r
float erf(float x) {\r
  float x2 = x * x;\r
  return sign(x) * sqrt(1.0 - exp(-x2 * (1.2732395 + 0.147 * x2) / (1.0 + 0.147 * x2)));\r
}\r
vec2 curl(vec2 p) {\r
  vec3 a = gradientNoise(p * uSwirl + vec2(uTime * 0.11, -uTime * 0.07));\r
  vec3 b = gradientNoise(p * uSwirl * 2.03 + vec2(-uTime * 0.13, uTime * 0.09) + 17.3);\r
  vec2 g = a.yz + b.yz * 0.5;\r
  return vec2(g.y, -g.x);\r
}\r
vec4 fetch(vec2 p) {\r
  if (p.x < 0.0 || p.y < 0.0 || p.x > uSize.x || p.y > uSize.y) return vec4(0.0);\r
  return texture(uState, p / uSize);\r
}\r
void main() {\r
  vec2 p = gl_FragCoord.xy;\r
  vec4 here = texture(uState, vUv);\r
  vec2 flow = here.gb + curl(p) * uTurbulence + uDrift;\r
  vec4 state = fetch(p - flow * uDt);\r
  float density = state.r * uDecay;\r
  vec2 velocity = state.gb * uDrag;\r
\r
  float sigma = max(uRadius, 0.5);\r
  vec2 ab = uTo - uFrom;\r
  float len = length(ab);\r
  float trail = 0.0;\r
  if (len > 0.25) {\r
    vec2 dir = ab / len;\r
    vec2 ap = p - uFrom;\r
    float along = dot(ap, dir);\r
    float across = dot(ap, vec2(-dir.y, dir.x));\r
    float k = 1.4142136 * sigma;\r
    trail = exp(-across * across / (2.0 * sigma * sigma)) * 0.5 * (erf(along / k) - erf((along - len) / k));\r
  }\r
  vec2 dh = p - uTo;\r
  float head = exp(-dot(dh, dh) / (2.0 * sigma * sigma));\r
  density += uTrail * trail + uIdle * uDt * head;\r
  velocity += (uVelocity - velocity) * clamp(trail * 0.65, 0.0, 1.0);\r
\r
  if (uPuff.w > 0.0) {\r
    vec2 d = p - uPuff.xy;\r
    float r2 = dot(d, d);\r
    float g = exp(-r2 / (2.0 * uPuff.z * uPuff.z));\r
    density += uPuff.w * g;\r
    velocity += (r2 > 0.0001 ? d / sqrt(r2) : vec2(0.0)) * g * uPuff.w * uPuff.z * 2.2;\r
  }\r
\r
  fragColor = vec4(clamp(density, 0.0, 6.0), velocity, 1.0);\r
}\`;\r
\r
const SHADE = \`#version 300 es\r
precision highp float;\r
in vec2 vUv;\r
out vec4 fragColor;\r
uniform sampler2D uState;\r
uniform vec2 uSimSize;\r
uniform vec2 uView;\r
uniform vec2 uHead;\r
uniform float uHeadSize;\r
uniform float uHeadAmount;\r
uniform float uTime;\r
uniform vec3 uColor;\r
uniform float uDetail;\r
uniform float uNoiseScale;\r
uniform vec2 uFlow;\r
uniform float uBrightness;\r
uniform float uTheme;\r
\r
float hash(vec2 p) {\r
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);\r
  p3 += dot(p3, p3.yzx + 33.33);\r
  return fract((p3.x + p3.y) * p3.z);\r
}\r
float noise(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = fract(p);\r
  f = f * f * (3.0 - 2.0 * f);\r
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);\r
}\r
float fbm(vec2 p) {\r
  float v = 0.0;\r
  float a = 0.5;\r
  mat2 m = mat2(0.8776, 0.4794, -0.4794, 0.8776);\r
  for (int i = 0; i < 4; i++) {\r
    v += a * noise(p);\r
    p = m * p * 2.0;\r
    a *= 0.5;\r
  }\r
  return v;\r
}\r
float fbm5(vec2 p) {\r
  float v = 0.0;\r
  float a = 0.5;\r
  mat2 m = mat2(0.8776, 0.4794, -0.4794, 0.8776);\r
  for (int i = 0; i < 5; i++) {\r
    v += a * noise(p);\r
    p = m * p * 2.0;\r
    a *= 0.52;\r
  }\r
  return v;\r
}\r
vec4 cubic(sampler2D tex, vec2 uv, vec2 size) {\r
  vec2 st = uv * size - 0.5;\r
  vec2 i = floor(st);\r
  vec2 f = st - i;\r
  vec2 f2 = f * f;\r
  vec2 f3 = f2 * f;\r
  vec2 w0 = (1.0 - 3.0 * f + 3.0 * f2 - f3) / 6.0;\r
  vec2 w1 = (4.0 - 6.0 * f2 + 3.0 * f3) / 6.0;\r
  vec2 w2 = (1.0 + 3.0 * f + 3.0 * f2 - 3.0 * f3) / 6.0;\r
  vec2 w3 = f3 / 6.0;\r
  vec2 g0 = w0 + w1;\r
  vec2 g1 = w2 + w3;\r
  vec2 c0 = (i + 0.5 + w1 / g0 - 1.0) / size;\r
  vec2 c1 = (i + 0.5 + w3 / g1 + 1.0) / size;\r
  vec4 a = texture(tex, c0) * g0.x + texture(tex, vec2(c1.x, c0.y)) * g1.x;\r
  vec4 b = texture(tex, vec2(c0.x, c1.y)) * g0.x + texture(tex, c1) * g1.x;\r
  return a * g0.y + b * g1.y;\r
}\r
float field(vec2 uv, vec2 p) {\r
  vec2 d = p - uHead;\r
  return cubic(uState, uv, uSimSize).r + uHeadAmount * exp(-dot(d, d) / (2.0 * uHeadSize * uHeadSize));\r
}\r
void main() {\r
  vec2 p = vUv * uView;\r
  float density = field(vUv, p);\r
  if (density < 0.002) {\r
    fragColor = vec4(0.0);\r
    return;\r
  }\r
  vec2 step = vec2(1.5) / uSimSize;\r
  float dx = field(vUv + vec2(step.x, 0.0), p + vec2(step.x * uView.x, 0.0)) - field(vUv - vec2(step.x, 0.0), p - vec2(step.x * uView.x, 0.0));\r
  float dy = field(vUv + vec2(0.0, step.y), p + vec2(0.0, step.y * uView.y)) - field(vUv - vec2(0.0, step.y), p - vec2(0.0, step.y * uView.y));\r
\r
  vec2 n = (p + uFlow) * uNoiseScale;\r
  float t = uTime;\r
  vec2 q = vec2(fbm(n + t * 0.1), fbm(n + vec2(5.2, 1.3) + t * 0.1));\r
  vec2 r = vec2(fbm(n + q * 1.8 + vec2(1.7, 9.2) + t * 0.15), fbm(n + q * 1.8 + vec2(8.3, 2.8) + t * 0.15));\r
  float smoke = fbm5(n + r * 1.1);\r
  float wisp = pow(smoothstep(0.18, 0.82, smoke), 2.0) * 2.8;\r
  float body = density * mix(1.0, wisp, uDetail);\r
  float cloud = body * smoothstep(0.0, 0.32, body) * 1.15;\r
  if (cloud <= 0.0) {\r
    fragColor = vec4(0.0);\r
    return;\r
  }\r
\r
  vec3 normal = normalize(vec3(-dx * 2.2, -dy * 2.2, 1.0) + vec3((q - 0.5) * 0.35 * uDetail, 0.0));\r
  float light = 0.7 + 0.5 * max(dot(normal, normalize(vec3(-0.35, 0.55, 0.75))), 0.0);\r
  float core = smoothstep(0.7, 2.2, cloud);\r
\r
  vec3 tint = mix(uColor * light, mix(uColor, vec3(1.0), 0.55) * light, core);\r
  vec3 ink = mix(uColor, uColor * 0.78, core * 0.6) * (1.12 - 0.12 * light);\r
  vec3 color = mix(tint * uBrightness, ink, uTheme) * cloud;\r
  fragColor = vec4(color, cloud);\r
}\`;\r
\r
const DOWN = \`#version 300 es\r
precision highp float;\r
in vec2 vUv;\r
out vec4 fragColor;\r
uniform sampler2D uSource;\r
uniform vec2 uTexel;\r
uniform float uThreshold;\r
void main() {\r
  vec4 a = texture(uSource, vUv + uTexel * vec2(-0.5, -0.5));\r
  vec4 b = texture(uSource, vUv + uTexel * vec2(0.5, -0.5));\r
  vec4 c = texture(uSource, vUv + uTexel * vec2(-0.5, 0.5));\r
  vec4 d = texture(uSource, vUv + uTexel * vec2(0.5, 0.5));\r
  vec4 color = (a + b + c + d) * 0.25;\r
  float peak = max(color.r, max(color.g, color.b));\r
  float keep = peak > 0.0 ? max(peak - uThreshold, 0.0) / peak : 0.0;\r
  fragColor = color * keep;\r
}\`;\r
\r
const BLUR = \`#version 300 es\r
precision highp float;\r
in vec2 vUv;\r
out vec4 fragColor;\r
uniform sampler2D uSource;\r
uniform vec2 uDirection;\r
void main() {\r
  vec4 color = texture(uSource, vUv) * 0.181862;\r
  color += (texture(uSource, vUv + uDirection * 1.423135) + texture(uSource, vUv - uDirection * 1.423135)) * 0.284316;\r
  color += (texture(uSource, vUv + uDirection * 3.326702) + texture(uSource, vUv - uDirection * 3.326702)) * 0.106598;\r
  color += (texture(uSource, vUv + uDirection * 5.242989) + texture(uSource, vUv - uDirection * 5.242989)) * 0.018156;\r
  fragColor = color;\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
in vec2 vUv;\r
out vec4 fragColor;\r
uniform sampler2D uShade;\r
uniform sampler2D uBloom0;\r
uniform sampler2D uBloom1;\r
uniform sampler2D uBloom2;\r
uniform vec2 uShadeSize;\r
uniform vec3 uWeights;\r
uniform float uBloom;\r
uniform float uPresence;\r
uniform float uGrain;\r
uniform float uEdge;\r
uniform float uTime;\r
uniform float uTheme;\r
uniform vec3 uColor;\r
\r
float hash(vec2 p) {\r
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);\r
  p3 += dot(p3, p3.yzx + 33.33);\r
  return fract((p3.x + p3.y) * p3.z);\r
}\r
vec4 cubic(sampler2D tex, vec2 uv, vec2 size) {\r
  vec2 st = uv * size - 0.5;\r
  vec2 i = floor(st);\r
  vec2 f = st - i;\r
  vec2 f2 = f * f;\r
  vec2 f3 = f2 * f;\r
  vec2 w0 = (1.0 - 3.0 * f + 3.0 * f2 - f3) / 6.0;\r
  vec2 w1 = (4.0 - 6.0 * f2 + 3.0 * f3) / 6.0;\r
  vec2 w2 = (1.0 + 3.0 * f + 3.0 * f2 - 3.0 * f3) / 6.0;\r
  vec2 w3 = f3 / 6.0;\r
  vec2 g0 = w0 + w1;\r
  vec2 g1 = w2 + w3;\r
  vec2 c0 = (i + 0.5 + w1 / g0 - 1.0) / size;\r
  vec2 c1 = (i + 0.5 + w3 / g1 + 1.0) / size;\r
  vec4 a = texture(tex, c0) * g0.x + texture(tex, vec2(c1.x, c0.y)) * g1.x;\r
  vec4 b = texture(tex, vec2(c0.x, c1.y)) * g0.x + texture(tex, c1) * g1.x;\r
  return a * g0.y + b * g1.y;\r
}\r
void main() {\r
  vec4 shade = cubic(uShade, vUv, uShadeSize);\r
  vec4 bloom = texture(uBloom0, vUv) * uWeights.x + texture(uBloom1, vUv) * uWeights.y + texture(uBloom2, vUv) * uWeights.z;\r
  vec2 edge = min(vUv, 1.0 - vUv);\r
  float vignette = mix(1.0 - uEdge, 1.0, clamp(min(edge.x, edge.y) * 2.0, 0.0, 1.0));\r
  float fade = uPresence * vignette;\r
  float grain = hash(gl_FragCoord.xy + fract(uTime * 7.13) * 91.7) - 0.5;\r
  if (uTheme > 0.5) {\r
    float coverage = 1.0 - exp(-(shade.a + bloom.a * uBloom * 0.6) * 0.95);\r
    coverage = clamp(coverage * fade * (1.0 + grain * uGrain * 2.0), 0.0, 1.0);\r
    vec3 pigment = shade.a > 0.0001 ? clamp(shade.rgb / shade.a, 0.0, 1.0) : uColor;\r
    fragColor = vec4(pow(pigment, vec3(1.0 / 2.2)) * coverage, coverage);\r
    return;\r
  }\r
  vec3 color = (shade.rgb + bloom.rgb * uBloom) * fade;\r
  color = pow(1.0 - exp(-color * 0.95), vec3(1.0 / 2.2));\r
  color += color * grain * uGrain * 2.0;\r
  color = clamp(color + (hash(gl_FragCoord.xy * 1.37) - 0.5) / 255.0, 0.0, 1.0);\r
  fragColor = vec4(color, max(color.r, max(color.g, color.b)));\r
}\`;\r
\r
const INTRO_MS = 1900;\r
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
  return [0.706, 0.592, 0.812];\r
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
  gl.bindAttribLocation(program, 0, 'aPosition');\r
  gl.linkProgram(program);\r
  gl.deleteShader(vertex);\r
  gl.deleteShader(fragment);\r
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {\r
    console.error(gl.getProgramInfoLog(program));\r
    gl.deleteProgram(program);\r
    return null;\r
  }\r
  const uniforms: Uniforms = {};\r
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
  for (let index = 0; index < count; index++) {\r
    const info = gl.getActiveUniform(program, index);\r
    if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const GhostCursor = ({\r
  color = '#B497CF',\r
  brightness = 1,\r
  size = 80,\r
  trailLength = 50,\r
  inertia = 0.5,\r
  turbulence = 0.5,\r
  drift = 0.3,\r
  detail = 1,\r
  grainIntensity = 0.05,\r
  bloomStrength = 0.6,\r
  bloomRadius = 1,\r
  bloomThreshold = 0.025,\r
  edgeIntensity = 0,\r
  clickPuff = true,\r
  intro = true,\r
  theme = 'dark',\r
  mixBlendMode,\r
  fadeDelayMs,\r
  fadeDurationMs,\r
  maxDevicePixelRatio = 2,\r
  targetPixels,\r
  zIndex = 10,\r
  className = '',\r
  style\r
}: GhostCursorProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const [generation, setGeneration] = useState(0);\r
  const [touch] = useState(\r
    () => typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)\r
  );\r
\r
  const light = theme === 'light';\r
  const settings: Settings = {\r
    color: parseColor(color).map(channel => Math.pow(channel, 2.2)),\r
    brightness: Math.max(0, brightness),\r
    size: Math.max(8, size),\r
    trail: clamp(trailLength, 1, 200),\r
    inertia: clamp(inertia, 0, 0.99),\r
    turbulence: clamp(turbulence, 0, 2),\r
    drift,\r
    detail: clamp(detail, 0, 1),\r
    grain: clamp(grainIntensity, 0, 1),\r
    bloom: Math.max(0, bloomStrength),\r
    bloomRadius: clamp(bloomRadius, 0, 3),\r
    threshold: Math.max(0, bloomThreshold),\r
    edge: clamp(edgeIntensity, 0, 1),\r
    clickPuff,\r
    intro,\r
    theme: light ? 1 : 0,\r
    fadeDelay: Math.max(0, fadeDelayMs ?? (touch ? 500 : 1000)),\r
    fadeDuration: Math.max(1, fadeDurationMs ?? (touch ? 1000 : 1500)),\r
    maxRatio: clamp(maxDevicePixelRatio, 0.25, 3),\r
    budget: Math.max(5e4, targetPixels ?? (touch ? 3e5 : 6e5))\r
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
    const parent = container?.parentElement;\r
    if (!container || !canvas || !parent) return;\r
\r
    const previousPosition = parent.style.position;\r
    const reposition = getComputedStyle(parent).position === 'static';\r
    if (reposition) parent.style.position = 'relative';\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
\r
    const gl = canvas.getContext('webgl2', {\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false,\r
      powerPreference: 'default'\r
    });\r
    if (!gl || !gl.getExtension('EXT_color_buffer_float')) {\r
      if (reposition) parent.style.position = previousPosition;\r
      return;\r
    }\r
    const linked = [link(gl, SIM), link(gl, SHADE), link(gl, DOWN), link(gl, BLUR), link(gl, COMPOSITE)];\r
    const [simProgram, shadeProgram, downProgram, blurProgram, compositeProgram] = linked;\r
    if (!simProgram || !shadeProgram || !downProgram || !blurProgram || !compositeProgram) {\r
      for (const item of linked) if (item) gl.deleteProgram(item.program);\r
      if (reposition) parent.style.position = previousPosition;\r
      return;\r
    }\r
    const programs = {\r
      sim: simProgram,\r
      shade: shadeProgram,\r
      down: downProgram,\r
      blur: blurProgram,\r
      composite: compositeProgram\r
    };\r
\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    const buffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    gl.disable(gl.BLEND);\r
    gl.disable(gl.DEPTH_TEST);\r
\r
    const createTarget = (): Target => {\r
      const texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      const framebuffer = gl.createFramebuffer();\r
      return { texture, framebuffer, width: 0, height: 0 };\r
    };\r
\r
    const allocate = (target: Target, width: number, height: number) => {\r
      if (target.width === width && target.height === height) return false;\r
      target.width = width;\r
      target.height = height;\r
      gl.bindTexture(gl.TEXTURE_2D, target.texture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.HALF_FLOAT, null);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target.texture, 0);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      return true;\r
    };\r
\r
    const sims = [createTarget(), createTarget()];\r
    const shade = createTarget();\r
    const downs = [createTarget(), createTarget(), createTarget()];\r
    const blurs = [createTarget(), createTarget(), createTarget()];\r
\r
    const pass = (target: Target | null, program: Program) => {\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.framebuffer : null);\r
      gl.viewport(0, 0, target ? target.width : canvas.width, target ? target.height : canvas.height);\r
      gl.useProgram(program.program);\r
      return program.uniforms;\r
    };\r
\r
    const bind = (unit: number, texture: WebGLTexture | null) => {\r
      gl.activeTexture(gl.TEXTURE0 + unit);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
    };\r
\r
    const view = { width: 1, height: 1, ratio: 1, sim: 0.25, shade: 1 };\r
    const ghost = { x: 0, y: 0, vx: 0, vy: 0, px: 0, py: 0, ready: false };\r
    const pointer = { x: 0, y: 0, inside: false, moved: -1e9 };\r
    const flow = { y: 0 };\r
    const puffs: { x: number; y: number }[] = [];\r
    let presence = 0;\r
    let current = 0;\r
    let raf = 0;\r
    let last = 0;\r
    let clock = 0;\r
    let visible = true;\r
    let pageVisible = document.visibilityState !== 'hidden';\r
    let lost = false;\r
    let dirty = true;\r
    let introLive = settingsRef.current.intro && !reduced && generation === 0;\r
    let introStart = -1;\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const rect = container.getBoundingClientRect();\r
      const width = Math.max(1, Math.round(rect.width));\r
      const height = Math.max(1, Math.round(rect.height));\r
      const ratio = Math.min(window.devicePixelRatio || 1, s.maxRatio);\r
      view.width = width;\r
      view.height = height;\r
      view.ratio = ratio;\r
      const cw = Math.max(1, Math.round(width * ratio));\r
      const ch = Math.max(1, Math.round(height * ratio));\r
      if (canvas.width !== cw || canvas.height !== ch) {\r
        canvas.width = cw;\r
        canvas.height = ch;\r
      }\r
      view.shade = Math.min(1, Math.sqrt(s.budget / (width * height)));\r
      const sw = Math.max(8, Math.round(width * view.shade));\r
      const sh = Math.max(8, Math.round(height * view.shade));\r
      allocate(shade, sw, sh);\r
      let w = Math.max(4, Math.round(sw / 2));\r
      let h = Math.max(4, Math.round(sh / 2));\r
      for (let i = 0; i < 3; i++) {\r
        allocate(downs[i], w, h);\r
        allocate(blurs[i], w, h);\r
        w = Math.max(2, Math.round(w / 2));\r
        h = Math.max(2, Math.round(h / 2));\r
      }\r
      view.sim = Math.min(0.35, 220 / Math.max(width, height));\r
      const simW = Math.max(16, Math.round(width * view.sim));\r
      const simH = Math.max(16, Math.round(height * view.sim));\r
      allocate(sims[0], simW, simH);\r
      allocate(sims[1], simW, simH);\r
      dirty = true;\r
    };\r
\r
    const simulate = (dt: number, active: boolean) => {\r
      const s = settingsRef.current;\r
      const src = sims[current];\r
      const dst = sims[1 - current];\r
      const scale = view.sim;\r
      const sigma = s.size * scale * 0.3;\r
      const decay = Math.exp(-dt / (0.12 + s.trail * 0.022));\r
      const u = pass(dst, programs.sim);\r
      bind(0, src.texture);\r
      gl.uniform1i(u.uState, 0);\r
      gl.uniform2f(u.uSize, dst.width, dst.height);\r
      gl.uniform1f(u.uDt, dt);\r
      gl.uniform1f(u.uTime, clock);\r
      gl.uniform1f(u.uDecay, decay);\r
      gl.uniform1f(u.uDrag, Math.exp(-dt * 2.4));\r
      gl.uniform2f(u.uDrift, 0, s.drift * 110 * scale);\r
      gl.uniform1f(u.uTurbulence, s.turbulence * 70 * scale);\r
      gl.uniform1f(u.uSwirl, 1 / Math.max(1, s.size * scale * 2.2));\r
      gl.uniform2f(u.uFrom, ghost.px * scale, (view.height - ghost.py) * scale);\r
      gl.uniform2f(u.uTo, ghost.x * scale, (view.height - ghost.y) * scale);\r
      gl.uniform1f(u.uRadius, sigma);\r
      gl.uniform1f(u.uTrail, active ? 0.42 * presence : 0);\r
      gl.uniform1f(u.uIdle, active ? 0.22 * presence : 0);\r
      gl.uniform2f(u.uVelocity, ghost.vx * scale * 0.5, -ghost.vy * scale * 0.5);\r
      const puff = puffs.shift();\r
      if (puff) {\r
        gl.uniform4f(u.uPuff, puff.x * scale, (view.height - puff.y) * scale, sigma * 1.4, 0.9);\r
      } else {\r
        gl.uniform4f(u.uPuff, 0, 0, 1, 0);\r
      }\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      current = 1 - current;\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      let u = pass(shade, programs.shade);\r
      bind(0, sims[current].texture);\r
      gl.uniform1i(u.uState, 0);\r
      gl.uniform2f(u.uSimSize, sims[current].width, sims[current].height);\r
      gl.uniform2f(u.uView, view.width, view.height);\r
      gl.uniform2f(u.uHead, ghost.x, view.height - ghost.y);\r
      gl.uniform1f(u.uHeadSize, s.size * 0.38);\r
      gl.uniform1f(u.uHeadAmount, ghost.ready ? 0.8 * presence : 0);\r
      gl.uniform1f(u.uTime, clock);\r
      gl.uniform3fv(u.uColor, s.color);\r
      gl.uniform1f(u.uDetail, s.detail);\r
      gl.uniform1f(u.uNoiseScale, 2.4 / Math.max(20, s.size * 2.6));\r
      gl.uniform2f(u.uFlow, 0, flow.y);\r
      gl.uniform1f(u.uBrightness, s.brightness);\r
      gl.uniform1f(u.uTheme, s.theme);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      let source = shade;\r
      for (let i = 0; i < 3; i++) {\r
        u = pass(downs[i], programs.down);\r
        bind(0, source.texture);\r
        gl.uniform1i(u.uSource, 0);\r
        gl.uniform2f(u.uTexel, 1 / source.width, 1 / source.height);\r
        gl.uniform1f(u.uThreshold, i === 0 ? s.threshold : 0);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
        u = pass(blurs[i], programs.blur);\r
        bind(0, downs[i].texture);\r
        gl.uniform1i(u.uSource, 0);\r
        gl.uniform2f(u.uDirection, 1 / downs[i].width, 0);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
        u = pass(downs[i], programs.blur);\r
        bind(0, blurs[i].texture);\r
        gl.uniform1i(u.uSource, 0);\r
        gl.uniform2f(u.uDirection, 0, 1 / blurs[i].height);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
        source = downs[i];\r
      }\r
\r
      u = pass(null, programs.composite);\r
      bind(0, shade.texture);\r
      bind(1, downs[0].texture);\r
      bind(2, downs[1].texture);\r
      bind(3, downs[2].texture);\r
      gl.uniform1i(u.uShade, 0);\r
      gl.uniform1i(u.uBloom0, 1);\r
      gl.uniform1i(u.uBloom1, 2);\r
      gl.uniform1i(u.uBloom2, 3);\r
      gl.uniform2f(u.uShadeSize, shade.width, shade.height);\r
      const spread = s.bloomRadius;\r
      gl.uniform3f(u.uWeights, 1, 0.6 + 0.4 * spread, 0.25 + 0.75 * Math.min(1, spread * spread * 0.5));\r
      gl.uniform1f(u.uBloom, s.bloom);\r
      gl.uniform1f(u.uPresence, presence);\r
      gl.uniform1f(u.uGrain, s.grain);\r
      gl.uniform1f(u.uEdge, s.edge);\r
      gl.uniform1f(u.uTime, clock);\r
      gl.uniform1f(u.uTheme, s.theme);\r
      gl.uniform3fv(u.uColor, s.color);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (lost) return;\r
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05);\r
      last = Math.max(last, now);\r
      clock += dt;\r
      const s = settingsRef.current;\r
      if (dirty) resize();\r
      dirty = false;\r
\r
      if (introLive) {\r
        if (introStart < 0) introStart = now + 280;\r
        const t = (now - introStart) / INTRO_MS;\r
        if (t >= 0) {\r
          const e = t < 1 ? t * t * (3 - 2 * t) : 1;\r
          const x = view.width * (0.16 + 0.44 * e + 0.05 * Math.sin(e * Math.PI));\r
          const y = view.height * (0.7 - 0.24 * e - 0.1 * Math.sin(e * Math.PI * 2));\r
          if (!ghost.ready) {\r
            ghost.x = ghost.px = x;\r
            ghost.y = ghost.py = y;\r
            ghost.vx = ghost.vy = 0;\r
            ghost.ready = true;\r
          }\r
          pointer.x = x;\r
          pointer.y = y;\r
          pointer.inside = true;\r
          pointer.moved = now;\r
          if (t >= 1) introLive = false;\r
        }\r
      }\r
\r
      const idle = now - pointer.moved;\r
      const target = !ghost.ready ? 0 : idle < s.fadeDelay ? 1 : Math.max(0, 1 - (idle - s.fadeDelay) / s.fadeDuration);\r
      presence += (target - presence) * (1 - Math.exp(-dt / (target > presence ? 0.12 : 0.08)));\r
      if (Math.abs(target - presence) < 0.002) presence = target;\r
\r
      ghost.px = ghost.x;\r
      ghost.py = ghost.y;\r
      if (ghost.ready) {\r
        if (pointer.inside) {\r
          const stiffness = 520 * Math.pow(1 - s.inertia, 2) + 26;\r
          const damping = 2 * Math.sqrt(stiffness) * 0.92;\r
          const steps = Math.max(1, Math.ceil(dt / (1 / 240)));\r
          const h = dt / steps;\r
          for (let i = 0; i < steps; i++) {\r
            ghost.vx += (stiffness * (pointer.x - ghost.x) - damping * ghost.vx) * h;\r
            ghost.vy += (stiffness * (pointer.y - ghost.y) - damping * ghost.vy) * h;\r
            ghost.x += ghost.vx * h;\r
            ghost.y += ghost.vy * h;\r
          }\r
        } else {\r
          const glide = Math.pow(s.inertia, dt * 60);\r
          ghost.vx *= glide;\r
          ghost.vy *= glide;\r
          ghost.x += ghost.vx * dt;\r
          ghost.y += ghost.vy * dt;\r
        }\r
      }\r
      flow.y -= s.drift * 110 * dt;\r
\r
      simulate(dt, presence > 0.01);\r
      render();\r
\r
      const busy = introLive || target > 0 || presence > 0.001 || puffs.length > 0;\r
      if (!busy) {\r
        for (const target of sims) {\r
          gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);\r
          gl.clearColor(0, 0, 0, 0);\r
          gl.clear(gl.COLOR_BUFFER_BIT);\r
        }\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
        gl.viewport(0, 0, canvas.width, canvas.height);\r
        gl.clearColor(0, 0, 0, 0);\r
        gl.clear(gl.COLOR_BUFFER_BIT);\r
        return;\r
      }\r
      if (visible && pageVisible) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (raf || lost || !visible || !pageVisible) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
    wakeRef.current = wake;\r
\r
    const locate = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const spot = locate(event);\r
      if (spot.inside) introLive = false;\r
      if (!spot.inside) {\r
        if (pointer.inside) onLeave();\r
        return;\r
      }\r
      if (!pointer.inside && !ghost.ready) {\r
        ghost.x = ghost.px = spot.x;\r
        ghost.y = ghost.py = spot.y;\r
        ghost.vx = ghost.vy = 0;\r
        ghost.ready = true;\r
      } else if (!pointer.inside && presence < 0.05) {\r
        ghost.x = ghost.px = spot.x;\r
        ghost.y = ghost.py = spot.y;\r
        ghost.vx = ghost.vy = 0;\r
      }\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = true;\r
      pointer.moved = performance.now();\r
      wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const spot = locate(event);\r
      if (!spot.inside) return;\r
      onPointerMove(event);\r
      if (settingsRef.current.clickPuff) {\r
        puffs.push({ x: spot.x, y: spot.y });\r
        wake();\r
      }\r
    };\r
\r
    const onLeave = () => {\r
      const now = performance.now();\r
      if (pointer.inside && now - pointer.moved < settingsRef.current.fadeDelay) pointer.moved = now;\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
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
      dirty = true;\r
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
    if (introLive) wake();\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      canvas.removeEventListener('webglcontextlost', onLost);\r
      canvas.removeEventListener('webglcontextrestored', onRestored);\r
      if (!gl.isContextLost()) {\r
        for (const target of [...sims, shade, ...downs, ...blurs]) {\r
          gl.deleteFramebuffer(target.framebuffer);\r
          gl.deleteTexture(target.texture);\r
        }\r
        gl.deleteBuffer(buffer);\r
        gl.deleteVertexArray(vao);\r
        for (const item of Object.values(programs)) gl.deleteProgram(item.program);\r
      }\r
      if (reposition) parent.style.position = previousPosition;\r
    };\r
  }, [generation]);\r
\r
  const blend = mixBlendMode ?? (light ? 'normal' : 'screen');\r
\r
  return (\r
    <div\r
      ref={containerRef}\r
      className={\`pointer-events-none absolute inset-0 overflow-hidden \${className}\`.trim()}\r
      style={{ zIndex, ...style }}\r
    >\r
      <canvas\r
        ref={canvasRef}\r
        className="absolute inset-0 block h-full w-full"\r
        style={{ mixBlendMode: blend }}\r
        aria-hidden="true"\r
      />\r
    </div>\r
  );\r
};\r
\r
export default GhostCursor;\r
`,i={usage:`import GhostCursor from './GhostCursor';

<div style={{ height: 600, position: 'relative' }}>
  <GhostCursor
    color="#B497CF"
    size={80}
    trailLength={50}
    inertia={0.5}
    turbulence={0.5}
    drift={0.3}
    bloomStrength={0.6}
    grainIntensity={0.05}
  />
</div>`,code:r,css:n,tailwind:e,tsCode:t,tsTailwind:o};export{i as ghostCursor};
