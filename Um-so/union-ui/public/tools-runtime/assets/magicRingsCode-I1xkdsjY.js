const n=`'use client';\r
\r
import { useEffect, useRef, useState } from 'react';\r
import './MagicRings.css';\r
\r
const MAX_RINGS = 12;\r
const MAX_BURSTS = 3;\r
const SLOTS = MAX_RINGS + MAX_BURSTS;\r
\r
const SEGMENTS = 128;\r
\r
const FULLSCREEN = \`\r
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));\r
void main() {\r
  gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);\r
}\`;\r
\r
const STRIP = \`\r
layout(location = 0) in vec2 aSegment;\r
uniform mat3 uForward;\r
uniform vec2 uResolution;\r
uniform float uUnit;\r
uniform vec2 uCenter;\r
uniform vec4 uShape[SLOTS];\r
uniform vec4 uFrame[SLOTS];\r
uniform float uReach;\r
uniform float uSplit;\r
flat out int vSlot;\r
out vec2 vPlane;\r
void main() {\r
  vec4 shape = uShape[gl_InstanceID];\r
  vec2 origin = uCenter + uFrame[gl_InstanceID].xy;\r
  float angle = aSegment.x * 6.2831853;\r
  vec2 direction = vec2(cos(angle), sin(angle));\r
  vec3 inner = uForward * vec3(origin + direction * shape.x, 1.0);\r
  vec3 outer = uForward * vec3(origin + direction * (shape.x + 0.01), 1.0);\r
  float pixels = length(outer.xy / outer.z - inner.xy / inner.z) * 100.0 * uUnit;\r
  float band = uReach / max(pixels, 1e-3) + uSplit * shape.x;\r
  vec2 plane = origin + direction * max(shape.x + aSegment.y * band, 0.0);\r
  vec3 screen = uForward * vec3(plane, 1.0);\r
  gl_Position = vec4(screen.xy * (2.0 * uUnit / uResolution), 0.0, screen.z);\r
  vPlane = plane;\r
  vSlot = gl_InstanceID;\r
}\`;\r
\r
const COMMON = \`\r
uniform vec2 uResolution;\r
uniform vec2 uScale;\r
uniform float uUnit;\r
uniform mat3 uInverse;\r
uniform vec2 uCenter;\r
uniform int uCount;\r
uniform vec4 uShape[SLOTS];\r
uniform vec4 uFrame[SLOTS];\r
uniform vec4 uTint[SLOTS];\r
uniform vec4 uHover;\r
uniform vec2 uBounds;\r
uniform float uSplit;\r
uniform float uOpacity;\r
\r
out vec4 fragColor;\r
\r
float hash(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * 0.1031);\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.x + q.y) * q.z);\r
}\r
\r
float angleOf(vec2 v) {\r
  vec2 a = abs(v);\r
  float t = min(a.x, a.y) / max(max(a.x, a.y), 1e-6);\r
  float r = t * (0.5 + 0.1738 * (1.0 - t));\r
  return a.y > a.x ? 1.0 - r : r;\r
}\r
\r
float nearness(vec2 plane) {\r
  vec2 offset = plane - uHover.xy;\r
  return uHover.z * exp(-dot(offset, offset) * uHover.w);\r
}\r
\r
vec3 prismOf(vec3 tint) {\r
  return mix(tint, vec3(dot(tint, vec3(0.3333))), 0.65) * 0.85;\r
}\r
\r
vec4 toneMap(vec3 light) {\r
  float peak = max(max(light.r, light.g), light.b);\r
  if (peak <= 0.0) return vec4(0.0);\r
  float level = 1.0 - exp(-peak);\r
  vec3 color = mix(light * (level / peak), vec3(level), smoothstep(1.4, 3.6, peak) * 0.4);\r
  return vec4(color, level);\r
}\r
\`;\r
\r
const GLOW = \`\r
uniform vec4 uHalo;\r
uniform vec3 uRange;\r
\r
float haloOf(float d) {\r
  float fall = exp(-d * uHalo.y);\r
  float tight = fall * fall;\r
  tight *= tight;\r
  float window = clamp(1.0 - (d - uRange.x) * uRange.y, 0.0, 1.0);\r
  return (uHalo.z * tight + uHalo.w * fall) * window * window;\r
}\r
\r
void main() {\r
  vec3 projected = uInverse * vec3((gl_FragCoord.xy * uScale - 0.5 * uResolution) / uUnit, 1.0);\r
  vec2 plane = projected.xy / projected.z;\r
  vec2 base = plane - uCenter;\r
  float reach = length(base);\r
  if (projected.z <= 0.0 || reach < uBounds.x || reach > uBounds.y) {\r
    fragColor = vec4(0.0);\r
    return;\r
  }\r
  float boost = 1.0 + 1.6 * nearness(plane);\r
  float limit = uRange.z + uSplit;\r
  vec3 light = vec3(0.0);\r
  float alpha = 0.0;\r
\r
  for (int i = 0; i < SLOTS; i++) {\r
    if (i >= uCount) break;\r
    vec4 shape = uShape[i];\r
    vec4 frame = uFrame[i];\r
    vec2 w = base - frame.xy;\r
    float len = length(w);\r
    float d = abs(len - shape.x);\r
    if (d > limit) continue;\r
    float a = angleOf(vec2(dot(w, frame.zw), frame.z * w.y - frame.w * w.x));\r
    if (a > shape.w) continue;\r
    float energy = shape.y * max(exp(-shape.z * a * a * a) - 0.002, 0.0) * boost;\r
    vec3 tint = uTint[i].rgb;\r
#ifdef PRISM\r
    float offset = uSplit * shape.x;\r
    vec3 halo = vec3(haloOf(abs(len - shape.x - offset)), haloOf(d), haloOf(abs(len - shape.x + offset)));\r
#else\r
    vec3 halo = vec3(haloOf(d));\r
#endif\r
#ifdef LIGHT\r
    float layer = clamp(energy * dot(halo, vec3(0.3333)), 0.0, 1.0);\r
    light = tint * layer + light * (1.0 - layer);\r
    alpha = layer + alpha * (1.0 - layer);\r
#else\r
#ifdef PRISM\r
    tint = prismOf(tint);\r
#endif\r
    light += tint * energy * halo;\r
#endif\r
  }\r
#ifdef LIGHT\r
  fragColor = vec4(light, alpha);\r
#elif defined(PACKED)\r
  fragColor = vec4(1.0 - exp(-light), 1.0);\r
#else\r
  fragColor = vec4(light, 1.0);\r
#endif\r
}\`;\r
\r
const COMPOSE = \`\r
uniform sampler2D uGlow;\r
uniform float uGrain;\r
uniform float uTime;\r
\r
void main() {\r
  vec4 glow = texture(uGlow, gl_FragCoord.xy / uResolution);\r
  float grain = 1.0;\r
  if (uGrain > 0.0) grain += uGrain * (hash(gl_FragCoord.xy + fract(uTime * 7.31) * 413.0) - 0.5) * 1.8;\r
  float dither = (hash(gl_FragCoord.xy) - 0.5) / 255.0;\r
#ifdef LIGHT\r
  float alpha = clamp(glow.a * grain, 0.0, 1.0);\r
  if (alpha <= 0.0) {\r
    fragColor = vec4(0.0);\r
    return;\r
  }\r
  vec3 ink = glow.rgb * grain;\r
  alpha = clamp(alpha + dither, 0.0, 1.0);\r
  fragColor = vec4(min(ink, vec3(alpha)), alpha) * uOpacity;\r
#else\r
#ifdef PACKED\r
  vec3 light = -log(1.0 - min(glow.rgb, vec3(0.9995))) * grain;\r
#else\r
  vec3 light = glow.rgb * grain;\r
#endif\r
  vec4 color = toneMap(light);\r
  if (color.a <= 0.0) {\r
    fragColor = vec4(0.0);\r
    return;\r
  }\r
  float alpha = clamp(color.a + dither, 0.0, 1.0);\r
  fragColor = vec4(min(color.rgb, vec3(alpha)), alpha) * uOpacity;\r
#endif\r
}\`;\r
\r
const LINE = \`\r
flat in int vSlot;\r
in vec2 vPlane;\r
uniform float uWidth;\r
\r
float coverage(float pixels, float halfWidth) {\r
  return clamp(max(halfWidth, 0.5) - pixels + 0.5, 0.0, 1.0) * min(halfWidth * 2.0, 1.0);\r
}\r
\r
void main() {\r
  vec4 shape = uShape[vSlot];\r
  vec4 frame = uFrame[vSlot];\r
  vec4 tint = uTint[vSlot];\r
  vec2 w = vPlane - uCenter - frame.xy;\r
  float len = length(w);\r
  float stretch = 1.0 / max(length(vec2(dFdx(len), dFdy(len))), 1e-6);\r
  float a = angleOf(vec2(dot(w, frame.zw), frame.z * w.y - frame.w * w.x));\r
  float near = nearness(vPlane);\r
  float energy = shape.y * max(exp(-shape.z * a * a * a) - 0.002, 0.0) * (1.0 + 1.6 * near) * step(a, shape.w);\r
  float halfWidth = uWidth * (1.0 + 0.45 * near) * max(1.0 - a, 0.5) * tint.w;\r
  float pixels = abs(len - shape.x) * stretch;\r
#ifdef PRISM\r
  float offset = uSplit * shape.x;\r
  vec3 core = vec3(\r
    coverage(abs(len - shape.x - offset) * stretch, halfWidth),\r
    coverage(pixels, halfWidth),\r
    coverage(abs(len - shape.x + offset) * stretch, halfWidth)\r
  );\r
#else\r
  vec3 core = vec3(coverage(pixels, halfWidth));\r
#endif\r
#ifdef LIGHT\r
  float hot = core.g * clamp(1.0 - pixels / max(halfWidth * 0.35, 0.3), 0.0, 1.0);\r
  float layer = energy * max(max(core.r, core.g), core.b);\r
  if (layer <= 0.0) discard;\r
#ifdef PRISM\r
  vec3 color = clamp(1.0 - (1.0 - tint.rgb) * core * 1.4, 0.0, 1.0);\r
#else\r
  vec3 color = tint.rgb;\r
#endif\r
  color = mix(color, vec3(1.0), hot * 0.7);\r
  fragColor = vec4(color * layer, layer) * uOpacity;\r
#else\r
#ifdef PRISM\r
  vec4 color = toneMap(prismOf(tint.rgb) * energy * core * 1.7);\r
#else\r
  vec4 color = toneMap(tint.rgb * energy * core * 1.7);\r
#endif\r
  if (color.a <= 0.0) discard;\r
  fragColor = color * uOpacity;\r
#endif\r
}\`;\r
\r
const shaderSource = (body, flags) =>\r
  [\r
    '#version 300 es',\r
    'precision highp float;',\r
    \`#define SLOTS \${SLOTS}\`,\r
    ...flags.map(flag => \`#define \${flag}\`),\r
    body\r
  ].join('\\n');\r
\r
const FRAGMENTS = { glow: GLOW, compose: COMPOSE, line: LINE };\r
\r
const MOTIONS = ['pulse', 'ripple', 'breathe'];\r
const CYCLE = 3.45;\r
const STAGGER = 0.5;\r
const DEPTH = 2.6;\r
const BURST_LIFE = 1.1;\r
const BURST_SPEED = 0.9;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const smoothstep = (from, to, value) => {\r
  const t = clamp((value - from) / (to - from), 0, 1);\r
  return t * t * (3 - 2 * t);\r
};\r
\r
const pulseLife = t => Math.min(smoothstep(0, 0.7, t), 1 - smoothstep(0.5, 3.25, t));\r
\r
const toLinear = channel => (channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4));\r
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
  if (typeof document !== 'undefined') {\r
    const context = document.createElement('canvas').getContext('2d');\r
    if (context) {\r
      context.fillStyle = '#000000';\r
      context.fillStyle = text;\r
      const normal = String(context.fillStyle);\r
      if (normal !== '#000000' || /^(#0{3}|#0{6}|black)$/i.test(text)) return parseColor(normal);\r
    }\r
  }\r
  return [0.66, 0.33, 0.97];\r
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
const link = (gl, vertexSource, fragmentSource) => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);\r
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
    if (info) uniforms[info.name.replace(/\\[0\\]$/, '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const invert = m => {\r
  const [a, b, c, d, e, f, g, h, i] = m;\r
  const A = e * i - f * h;\r
  const B = f * g - d * i;\r
  const C = d * h - e * g;\r
  const det = a * A + b * B + c * C;\r
  return [A, c * h - b * i, b * f - c * e, B, a * i - c * g, c * d - a * f, C, b * g - a * h, a * e - b * d].map(\r
    value => value / det\r
  );\r
};\r
\r
const planeFor = (tiltX, tiltY) => {\r
  const ax = (tiltX * Math.PI) / 180;\r
  const ay = (tiltY * Math.PI) / 180;\r
  const cx = Math.cos(ax);\r
  const sx = Math.sin(ax);\r
  const cy = Math.cos(ay);\r
  const sy = Math.sin(ay);\r
  const forward = [cy, sy * sx, 0, 0, cx, 0, (sy * cx) / DEPTH, -sx / DEPTH, 1];\r
  return { forward, inverse: invert(forward) };\r
};\r
\r
const project = (m, x, y) => {\r
  const w = m[6] * x + m[7] * y + m[8];\r
  return [(m[0] * x + m[1] * y + m[2]) / w, (m[3] * x + m[4] * y + m[5]) / w, w];\r
};\r
\r
const MagicRings = ({\r
  color = '#A855F7',\r
  colorTwo = '#6366F1',\r
  ringCount = 6,\r
  motion = 'pulse',\r
  speed = 1,\r
  lineThickness = 2,\r
  glow = 1,\r
  baseRadius = 0.35,\r
  radiusStep = 0.1,\r
  expansion = 0.1,\r
  taper = 1.5,\r
  rotation = 0,\r
  spin = 0,\r
  tilt = 0,\r
  dispersion = 0,\r
  grain = 0,\r
  opacity = 1,\r
  followMouse = false,\r
  mouseInfluence = 0.2,\r
  hoverScale = 1.2,\r
  hoverIntensity = 1,\r
  parallax = 0.05,\r
  clickBurst = true,\r
  intro = true,\r
  theme = 'dark',\r
  maxDevicePixelRatio = 2,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const [generation, setGeneration] = useState(0);\r
\r
  const light = theme === 'light';\r
  const first = parseColor(color);\r
  const second = parseColor(colorTwo);\r
  const settings = {\r
    color: light ? first : first.map(toLinear),\r
    colorTwo: light ? second : second.map(toLinear),\r
    ringCount: clamp(Math.round(ringCount), 1, MAX_RINGS),\r
    motion: MOTIONS.includes(motion) ? motion : 'pulse',\r
    speed: Math.max(0, speed),\r
    lineThickness: Math.max(0.25, lineThickness),\r
    glow: clamp(glow, 0, 3),\r
    baseRadius: Math.max(0.01, baseRadius),\r
    radiusStep: Math.max(0, radiusStep),\r
    expansion,\r
    taper: Math.max(0.5, taper),\r
    rotation: (rotation * Math.PI) / 180,\r
    spin,\r
    tilt: clamp(tilt, -80, 80),\r
    dispersion: clamp(dispersion, 0, 1),\r
    grain: clamp(grain, 0, 1),\r
    opacity: clamp(opacity, 0, 1),\r
    followMouse,\r
    mouseInfluence,\r
    hoverScale: Math.max(0.5, hoverScale),\r
    hoverIntensity: Math.max(0, hoverIntensity),\r
    parallax,\r
    clickBurst,\r
    intro,\r
    light,\r
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
      powerPreference: 'default'\r
    });\r
    if (!gl) return;\r
    const programs = new Map();\r
    const programFor = (name, flags) => {\r
      const key = \`\${name}|\${flags.join(',')}\`;\r
      if (!programs.has(key)) {\r
        const vertex = shaderSource(name === 'line' ? STRIP : FULLSCREEN, flags);\r
        programs.set(key, link(gl, vertex, shaderSource(\`\${COMMON}\${FRAGMENTS[name]}\`, flags)));\r
      }\r
      return programs.get(key);\r
    };\r
    if (!programFor('glow', []) || !programFor('compose', []) || !programFor('line', [])) return;\r
\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
    const vao = gl.createVertexArray();\r
    const stripVao = gl.createVertexArray();\r
    const stripBuffer = gl.createBuffer();\r
    const strip = new Float32Array((SEGMENTS + 1) * 4);\r
    for (let index = 0; index <= SEGMENTS; index++) {\r
      strip.set([index / SEGMENTS, -1, index / SEGMENTS, 1], index * 4);\r
    }\r
    gl.bindVertexArray(stripVao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, stripBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, strip, gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    gl.bindVertexArray(null);\r
    const glowTexture = gl.createTexture();\r
    const glowBuffer = gl.createFramebuffer();\r
    const glowSize = { width: 0, height: 0 };\r
    let floatGlow = Boolean(gl.getExtension('EXT_color_buffer_float'));\r
    const shape = new Float32Array(SLOTS * 4);\r
    const frameData = new Float32Array(SLOTS * 4);\r
    const tints = new Float32Array(SLOTS * 4);\r
    const size = { width: 1, height: 1, ratio: 1, unit: 1 };\r
    const pointer = { x: 0, y: 0, inside: false, touch: false };\r
    const spring = { x: 0, y: 0, vx: 0, vy: 0, hover: 0, hoverVelocity: 0 };\r
    const bursts = [];\r
    let introLive = settingsRef.current.intro && settingsRef.current.speed > 0 && !reduced && generation === 0;\r
    let time = introLive ? 0 : 1.6;\r
    let clock = 0;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let pageVisible = document.visibilityState !== 'hidden';\r
    let lost = false;\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const rect = container.getBoundingClientRect();\r
      const ratio = Math.min(window.devicePixelRatio || 1, s.maxRatio);\r
      const width = Math.max(1, Math.round(rect.width * ratio));\r
      const height = Math.max(1, Math.round(rect.height * ratio));\r
      if (canvas.width !== width || canvas.height !== height) {\r
        canvas.width = width;\r
        canvas.height = height;\r
      }\r
      Object.assign(size, { width, height, ratio, unit: Math.max(1, Math.min(width, height)) });\r
      const glowWidth = Math.max(1, Math.ceil(width / 2));\r
      const glowHeight = Math.max(1, Math.ceil(height / 2));\r
      if (glowSize.width === glowWidth && glowSize.height === glowHeight) return;\r
      Object.assign(glowSize, { width: glowWidth, height: glowHeight });\r
      const allocate = useFloat => {\r
        gl.bindTexture(gl.TEXTURE_2D, glowTexture);\r
        gl.texImage2D(\r
          gl.TEXTURE_2D,\r
          0,\r
          useFloat ? gl.RGBA16F : gl.RGBA8,\r
          glowWidth,\r
          glowHeight,\r
          0,\r
          gl.RGBA,\r
          useFloat ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE,\r
          null\r
        );\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, glowBuffer);\r
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, glowTexture, 0);\r
        const complete = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
        return complete;\r
      };\r
      if (!allocate(floatGlow)) {\r
        floatGlow = false;\r
        allocate(false);\r
      }\r
    };\r
\r
    const ringState = (s, index, count) => {\r
      const mix = count > 1 ? index / (count - 1) : 0;\r
      if (s.motion === 'ripple') {\r
        const span = count * s.radiusStep + s.expansion;\r
        const period = CYCLE * Math.max(1, count) * 0.32;\r
        const phase = time / period + index / count;\r
        const progress = phase - Math.floor(phase);\r
        const born = time - progress * period >= -1e-4 || !introLive;\r
        const life = born ? smoothstep(0, 0.12, progress) * (1 - smoothstep(0.62, 1, progress)) : 0;\r
        const position = progress * Math.max(1, count - 1);\r
        return { radius: s.baseRadius + progress * span, life, virtual: position, mix: progress, opening: 1 };\r
      }\r
      if (s.motion === 'breathe') {\r
        const wave = Math.sin((time / 4) * Math.PI * 2 - index * 0.55);\r
        const rise = introLive ? smoothstep(index * 0.12, index * 0.12 + 0.9, time) : 1;\r
        return {\r
          radius: s.baseRadius + index * s.radiusStep + s.expansion * 0.5 * (1 + wave),\r
          life: (0.78 + 0.22 * wave) * rise,\r
          virtual: index,\r
          mix,\r
          opening: 1\r
        };\r
      }\r
      const local = time - index * STAGGER;\r
      const t = ((local % CYCLE) + CYCLE) % CYCLE;\r
      const life = introLive && local < 0 ? 0 : pulseLife(t);\r
      return {\r
        radius: s.baseRadius + index * s.radiusStep + (1 - Math.pow(1 - t / CYCLE, 2)) * s.expansion,\r
        life,\r
        virtual: index,\r
        mix,\r
        opening: introLive && local < CYCLE ? smoothstep(0, 0.9, local) : 1\r
      };\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const count = s.ringCount;\r
      const hover = spring.hover;\r
      const still = reduced ? 0 : 1;\r
      const scale = 1 + (s.hoverScale - 1) * hover * still;\r
      const mouseX = spring.x * still;\r
      const mouseY = spring.y * still;\r
      const leanX = s.tilt - mouseY * s.parallax * 260;\r
      const leanY = mouseX * s.parallax * 260;\r
      const view = planeFor(leanX, leanY);\r
      const center = s.followMouse ? [mouseX * s.mouseInfluence, mouseY * s.mouseInfluence] : [0, 0];\r
      const spinBase = s.spin * time * 0.6;\r
\r
      let slots = 0;\r
      let lowest = Infinity;\r
      let highest = 0;\r
      let shiftMax = 0;\r
      const place = (radius, life, cut, angle, shiftX, shiftY, mix, width) => {\r
        if (life <= 0.002) return;\r
        const gain = 10 * radius * cut * cut * cut;\r
        shape.set([radius, life, gain, gain > 6.2 ? Math.cbrt(6.2 / gain) : 2], slots * 4);\r
        frameData.set([shiftX, shiftY, Math.cos(angle), Math.sin(angle)], slots * 4);\r
        tints.set(\r
          [\r
            s.color[0] + (s.colorTwo[0] - s.color[0]) * mix,\r
            s.color[1] + (s.colorTwo[1] - s.color[1]) * mix,\r
            s.color[2] + (s.colorTwo[2] - s.color[2]) * mix,\r
            width\r
          ],\r
          slots * 4\r
        );\r
        lowest = Math.min(lowest, radius);\r
        highest = Math.max(highest, radius);\r
        shiftMax = Math.max(shiftMax, Math.hypot(shiftX, shiftY));\r
        slots++;\r
      };\r
\r
      for (let index = 0; index < count; index++) {\r
        const state = ringState(s, index, count);\r
        let radius = state.radius * scale;\r
        let life = state.life;\r
        for (const burst of bursts) {\r
          const age = clock - burst.start;\r
          const wave = (burst.radius + age * BURST_SPEED) * scale;\r
          const fade = Math.pow(Math.max(0, 1 - age / BURST_LIFE), 1.5);\r
          const gap = (wave - radius) / 0.08;\r
          radius += 0.04 * Math.exp(-gap * gap) * fade;\r
          life = Math.min(1.6, life + 0.9 * Math.exp(-gap * gap * 1.6) * fade);\r
        }\r
        const cut = Math.pow(s.taper, state.virtual) / Math.max(0.08, state.opening);\r
        const angle = s.rotation + spinBase * (index % 2 ? -1 : 1) * (1 + index * 0.15);\r
        place(radius, life, cut, angle, index * s.parallax * mouseX, index * s.parallax * mouseY, state.mix, 1);\r
      }\r
      for (const burst of bursts) {\r
        const age = clock - burst.start;\r
        const fade = Math.pow(Math.max(0, 1 - age / BURST_LIFE), 1.5);\r
        const radius = (burst.radius + age * BURST_SPEED) * scale;\r
        place(radius, 1.5 * fade, 0.85, s.rotation, 0, 0, clamp(age / BURST_LIFE, 0, 1), 1.15);\r
      }\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      if (!slots) return;\r
\r
      const flags = [];\r
      if (s.light) flags.push('LIGHT');\r
      if (s.dispersion > 0) flags.push('PRISM');\r
      if (!floatGlow) flags.push('PACKED');\r
      const glowProgram = programFor('glow', flags);\r
      const composeProgram = programFor('compose', flags);\r
      const lineProgram = programFor('line', flags);\r
      if (!glowProgram || !composeProgram || !lineProgram) return;\r
\r
      const glowScale = (s.light ? 0.3 : 1) * (1 - s.dispersion * 0.45);\r
      const outer = 0.012 + 0.033 * s.glow;\r
      const innerAmount = 0.5 * Math.min(1, s.glow) * glowScale;\r
      const outerAmount = 0.9 * s.glow * glowScale;\r
      const range = outer * 4.5 + 0.008;\r
      const split = s.dispersion * 0.03;\r
      const margin = range + split * highest + shiftMax + 0.01;\r
      const width = s.lineThickness * size.ratio;\r
      const reach = width * (1 + 0.45 * s.hoverIntensity) * 1.15 + 1.5;\r
      const cursor = project(view.inverse, pointer.x, pointer.y);\r
\r
      const shared = program => {\r
        const u = program.uniforms;\r
        gl.useProgram(program.program);\r
        gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
        gl.uniform1f(u.uUnit, size.unit);\r
        gl.uniform2f(u.uCenter, center[0], center[1]);\r
        gl.uniform1i(u.uCount, slots);\r
        gl.uniform4fv(u.uShape, shape);\r
        gl.uniform4fv(u.uFrame, frameData);\r
        gl.uniform4fv(u.uTint, tints);\r
        gl.uniform4f(u.uHover, cursor[0] - center[0], cursor[1] - center[1], hover * s.hoverIntensity, 1 / 0.03);\r
        gl.uniform1f(u.uSplit, split);\r
        gl.uniform1f(u.uOpacity, s.opacity);\r
        return u;\r
      };\r
\r
      gl.bindVertexArray(vao);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, glowBuffer);\r
      gl.viewport(0, 0, glowSize.width, glowSize.height);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      const glowUniforms = shared(glowProgram);\r
      gl.uniform2f(glowUniforms.uScale, canvas.width / glowSize.width, canvas.height / glowSize.height);\r
      gl.uniformMatrix3fv(glowUniforms.uInverse, true, view.inverse);\r
      gl.uniform2f(glowUniforms.uBounds, Math.max(0, lowest - margin), highest + margin);\r
      gl.uniform4f(glowUniforms.uHalo, 0, 1 / outer, innerAmount, outerAmount);\r
      gl.uniform3f(glowUniforms.uRange, range * 0.45, 1 / (range * 0.55), range);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      const composeUniforms = shared(composeProgram);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, glowTexture);\r
      gl.uniform1i(composeUniforms.uGlow, 0);\r
      gl.uniform1f(composeUniforms.uGrain, s.grain);\r
      gl.uniform1f(composeUniforms.uTime, clock);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      const lineUniforms = shared(lineProgram);\r
      gl.uniformMatrix3fv(lineUniforms.uForward, true, view.forward);\r
      gl.uniform1f(lineUniforms.uReach, reach);\r
      gl.uniform1f(lineUniforms.uWidth, width);\r
      gl.enable(gl.BLEND);\r
      if (s.light) gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      else gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_COLOR, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      gl.bindVertexArray(stripVao);\r
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, (SEGMENTS + 1) * 2, slots);\r
      gl.disable(gl.BLEND);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (lost) return;\r
      const s = settingsRef.current;\r
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05);\r
      last = Math.max(last, now);\r
      clock += dt;\r
      if (!reduced) time += dt * s.speed;\r
\r
      const targetX = pointer.inside ? pointer.x / Math.max(1e-6, size.width / size.unit) : 0;\r
      const targetY = pointer.inside ? pointer.y / Math.max(1e-6, size.height / size.unit) : 0;\r
      const stiffness = 70;\r
      const damping = 2 * Math.sqrt(stiffness) * 0.9;\r
      const steps = Math.max(1, Math.ceil(dt / (1 / 240)));\r
      const h = dt / steps;\r
      for (let step = 0; step < steps; step++) {\r
        spring.vx += (stiffness * (targetX - spring.x) - damping * spring.vx) * h;\r
        spring.vy += (stiffness * (targetY - spring.y) - damping * spring.vy) * h;\r
        spring.x += spring.vx * h;\r
        spring.y += spring.vy * h;\r
        const hoverTarget = pointer.inside ? 1 : 0;\r
        spring.hoverVelocity += (40 * (hoverTarget - spring.hover) - 2 * Math.sqrt(40) * spring.hoverVelocity) * h;\r
        spring.hover += spring.hoverVelocity * h;\r
      }\r
\r
      for (let index = bursts.length - 1; index >= 0; index--) {\r
        if (clock - bursts[index].start > BURST_LIFE) bursts.splice(index, 1);\r
      }\r
      if (introLive && time > (s.ringCount + 2) * STAGGER + CYCLE) introLive = false;\r
\r
      render();\r
\r
      const settling =\r
        Math.abs(spring.vx) + Math.abs(spring.vy) + Math.abs(spring.hoverVelocity) > 1e-4 ||\r
        Math.abs((pointer.inside ? 1 : 0) - spring.hover) > 1e-3;\r
      const busy = (s.speed > 0 && !reduced) || settling || bursts.length > 0 || introLive;\r
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
      const inside =\r
        event.clientX >= rect.left &&\r
        event.clientX <= rect.right &&\r
        event.clientY >= rect.top &&\r
        event.clientY <= rect.bottom;\r
      const unit = Math.max(1, Math.min(rect.width, rect.height));\r
      return {\r
        x: (event.clientX - rect.left - rect.width / 2) / unit,\r
        y: (rect.top + rect.height / 2 - event.clientY) / unit,\r
        inside\r
      };\r
    };\r
\r
    const onPointerMove = event => {\r
      if (event.pointerType === 'touch' && !pointer.touch) return;\r
      const spot = locate(event);\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = spot.inside;\r
      wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      const spot = locate(event);\r
      if (!spot.inside) return;\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = true;\r
      pointer.touch = event.pointerType === 'touch';\r
      const s = settingsRef.current;\r
      if (s.clickBurst && !reduced) {\r
        bursts.push({ start: clock, radius: Math.max(0.04, s.baseRadius * 0.45) });\r
        if (bursts.length > MAX_BURSTS) bursts.shift();\r
      }\r
      wake();\r
    };\r
\r
    const onPointerUp = event => {\r
      if (event.pointerType !== 'touch') return;\r
      pointer.touch = false;\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
    const onLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
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
        gl.deleteVertexArray(vao);\r
        gl.deleteTexture(glowTexture);\r
        gl.deleteFramebuffer(glowBuffer);\r
        programs.forEach(entry => entry && gl.deleteProgram(entry.program));\r
        gl.deleteVertexArray(stripVao);\r
        gl.deleteBuffer(stripBuffer);\r
      }\r
    };\r
  }, [generation]);\r
\r
  return (\r
    <div ref={containerRef} className={\`magic-rings\${className ? \` \${className}\` : ''}\`} style={style}>\r
      <canvas ref={canvasRef} className="magic-rings__canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default MagicRings;\r
`,r=`.magic-rings {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.magic-rings__canvas {\r
  position: absolute;\r
  inset: 0;\r
  display: block;\r
  width: 100%;\r
  height: 100%;\r
  pointer-events: none;\r
}\r
`,e=`'use client';\r
\r
import { useEffect, useRef, useState } from 'react';\r
\r
const MAX_RINGS = 12;\r
const MAX_BURSTS = 3;\r
const SLOTS = MAX_RINGS + MAX_BURSTS;\r
\r
const SEGMENTS = 128;\r
\r
const FULLSCREEN = \`\r
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));\r
void main() {\r
  gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);\r
}\`;\r
\r
const STRIP = \`\r
layout(location = 0) in vec2 aSegment;\r
uniform mat3 uForward;\r
uniform vec2 uResolution;\r
uniform float uUnit;\r
uniform vec2 uCenter;\r
uniform vec4 uShape[SLOTS];\r
uniform vec4 uFrame[SLOTS];\r
uniform float uReach;\r
uniform float uSplit;\r
flat out int vSlot;\r
out vec2 vPlane;\r
void main() {\r
  vec4 shape = uShape[gl_InstanceID];\r
  vec2 origin = uCenter + uFrame[gl_InstanceID].xy;\r
  float angle = aSegment.x * 6.2831853;\r
  vec2 direction = vec2(cos(angle), sin(angle));\r
  vec3 inner = uForward * vec3(origin + direction * shape.x, 1.0);\r
  vec3 outer = uForward * vec3(origin + direction * (shape.x + 0.01), 1.0);\r
  float pixels = length(outer.xy / outer.z - inner.xy / inner.z) * 100.0 * uUnit;\r
  float band = uReach / max(pixels, 1e-3) + uSplit * shape.x;\r
  vec2 plane = origin + direction * max(shape.x + aSegment.y * band, 0.0);\r
  vec3 screen = uForward * vec3(plane, 1.0);\r
  gl_Position = vec4(screen.xy * (2.0 * uUnit / uResolution), 0.0, screen.z);\r
  vPlane = plane;\r
  vSlot = gl_InstanceID;\r
}\`;\r
\r
const COMMON = \`\r
uniform vec2 uResolution;\r
uniform vec2 uScale;\r
uniform float uUnit;\r
uniform mat3 uInverse;\r
uniform vec2 uCenter;\r
uniform int uCount;\r
uniform vec4 uShape[SLOTS];\r
uniform vec4 uFrame[SLOTS];\r
uniform vec4 uTint[SLOTS];\r
uniform vec4 uHover;\r
uniform vec2 uBounds;\r
uniform float uSplit;\r
uniform float uOpacity;\r
\r
out vec4 fragColor;\r
\r
float hash(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * 0.1031);\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.x + q.y) * q.z);\r
}\r
\r
float angleOf(vec2 v) {\r
  vec2 a = abs(v);\r
  float t = min(a.x, a.y) / max(max(a.x, a.y), 1e-6);\r
  float r = t * (0.5 + 0.1738 * (1.0 - t));\r
  return a.y > a.x ? 1.0 - r : r;\r
}\r
\r
float nearness(vec2 plane) {\r
  vec2 offset = plane - uHover.xy;\r
  return uHover.z * exp(-dot(offset, offset) * uHover.w);\r
}\r
\r
vec3 prismOf(vec3 tint) {\r
  return mix(tint, vec3(dot(tint, vec3(0.3333))), 0.65) * 0.85;\r
}\r
\r
vec4 toneMap(vec3 light) {\r
  float peak = max(max(light.r, light.g), light.b);\r
  if (peak <= 0.0) return vec4(0.0);\r
  float level = 1.0 - exp(-peak);\r
  vec3 color = mix(light * (level / peak), vec3(level), smoothstep(1.4, 3.6, peak) * 0.4);\r
  return vec4(color, level);\r
}\r
\`;\r
\r
const GLOW = \`\r
uniform vec4 uHalo;\r
uniform vec3 uRange;\r
\r
float haloOf(float d) {\r
  float fall = exp(-d * uHalo.y);\r
  float tight = fall * fall;\r
  tight *= tight;\r
  float window = clamp(1.0 - (d - uRange.x) * uRange.y, 0.0, 1.0);\r
  return (uHalo.z * tight + uHalo.w * fall) * window * window;\r
}\r
\r
void main() {\r
  vec3 projected = uInverse * vec3((gl_FragCoord.xy * uScale - 0.5 * uResolution) / uUnit, 1.0);\r
  vec2 plane = projected.xy / projected.z;\r
  vec2 base = plane - uCenter;\r
  float reach = length(base);\r
  if (projected.z <= 0.0 || reach < uBounds.x || reach > uBounds.y) {\r
    fragColor = vec4(0.0);\r
    return;\r
  }\r
  float boost = 1.0 + 1.6 * nearness(plane);\r
  float limit = uRange.z + uSplit;\r
  vec3 light = vec3(0.0);\r
  float alpha = 0.0;\r
\r
  for (int i = 0; i < SLOTS; i++) {\r
    if (i >= uCount) break;\r
    vec4 shape = uShape[i];\r
    vec4 frame = uFrame[i];\r
    vec2 w = base - frame.xy;\r
    float len = length(w);\r
    float d = abs(len - shape.x);\r
    if (d > limit) continue;\r
    float a = angleOf(vec2(dot(w, frame.zw), frame.z * w.y - frame.w * w.x));\r
    if (a > shape.w) continue;\r
    float energy = shape.y * max(exp(-shape.z * a * a * a) - 0.002, 0.0) * boost;\r
    vec3 tint = uTint[i].rgb;\r
#ifdef PRISM\r
    float offset = uSplit * shape.x;\r
    vec3 halo = vec3(haloOf(abs(len - shape.x - offset)), haloOf(d), haloOf(abs(len - shape.x + offset)));\r
#else\r
    vec3 halo = vec3(haloOf(d));\r
#endif\r
#ifdef LIGHT\r
    float layer = clamp(energy * dot(halo, vec3(0.3333)), 0.0, 1.0);\r
    light = tint * layer + light * (1.0 - layer);\r
    alpha = layer + alpha * (1.0 - layer);\r
#else\r
#ifdef PRISM\r
    tint = prismOf(tint);\r
#endif\r
    light += tint * energy * halo;\r
#endif\r
  }\r
#ifdef LIGHT\r
  fragColor = vec4(light, alpha);\r
#elif defined(PACKED)\r
  fragColor = vec4(1.0 - exp(-light), 1.0);\r
#else\r
  fragColor = vec4(light, 1.0);\r
#endif\r
}\`;\r
\r
const COMPOSE = \`\r
uniform sampler2D uGlow;\r
uniform float uGrain;\r
uniform float uTime;\r
\r
void main() {\r
  vec4 glow = texture(uGlow, gl_FragCoord.xy / uResolution);\r
  float grain = 1.0;\r
  if (uGrain > 0.0) grain += uGrain * (hash(gl_FragCoord.xy + fract(uTime * 7.31) * 413.0) - 0.5) * 1.8;\r
  float dither = (hash(gl_FragCoord.xy) - 0.5) / 255.0;\r
#ifdef LIGHT\r
  float alpha = clamp(glow.a * grain, 0.0, 1.0);\r
  if (alpha <= 0.0) {\r
    fragColor = vec4(0.0);\r
    return;\r
  }\r
  vec3 ink = glow.rgb * grain;\r
  alpha = clamp(alpha + dither, 0.0, 1.0);\r
  fragColor = vec4(min(ink, vec3(alpha)), alpha) * uOpacity;\r
#else\r
#ifdef PACKED\r
  vec3 light = -log(1.0 - min(glow.rgb, vec3(0.9995))) * grain;\r
#else\r
  vec3 light = glow.rgb * grain;\r
#endif\r
  vec4 color = toneMap(light);\r
  if (color.a <= 0.0) {\r
    fragColor = vec4(0.0);\r
    return;\r
  }\r
  float alpha = clamp(color.a + dither, 0.0, 1.0);\r
  fragColor = vec4(min(color.rgb, vec3(alpha)), alpha) * uOpacity;\r
#endif\r
}\`;\r
\r
const LINE = \`\r
flat in int vSlot;\r
in vec2 vPlane;\r
uniform float uWidth;\r
\r
float coverage(float pixels, float halfWidth) {\r
  return clamp(max(halfWidth, 0.5) - pixels + 0.5, 0.0, 1.0) * min(halfWidth * 2.0, 1.0);\r
}\r
\r
void main() {\r
  vec4 shape = uShape[vSlot];\r
  vec4 frame = uFrame[vSlot];\r
  vec4 tint = uTint[vSlot];\r
  vec2 w = vPlane - uCenter - frame.xy;\r
  float len = length(w);\r
  float stretch = 1.0 / max(length(vec2(dFdx(len), dFdy(len))), 1e-6);\r
  float a = angleOf(vec2(dot(w, frame.zw), frame.z * w.y - frame.w * w.x));\r
  float near = nearness(vPlane);\r
  float energy = shape.y * max(exp(-shape.z * a * a * a) - 0.002, 0.0) * (1.0 + 1.6 * near) * step(a, shape.w);\r
  float halfWidth = uWidth * (1.0 + 0.45 * near) * max(1.0 - a, 0.5) * tint.w;\r
  float pixels = abs(len - shape.x) * stretch;\r
#ifdef PRISM\r
  float offset = uSplit * shape.x;\r
  vec3 core = vec3(\r
    coverage(abs(len - shape.x - offset) * stretch, halfWidth),\r
    coverage(pixels, halfWidth),\r
    coverage(abs(len - shape.x + offset) * stretch, halfWidth)\r
  );\r
#else\r
  vec3 core = vec3(coverage(pixels, halfWidth));\r
#endif\r
#ifdef LIGHT\r
  float hot = core.g * clamp(1.0 - pixels / max(halfWidth * 0.35, 0.3), 0.0, 1.0);\r
  float layer = energy * max(max(core.r, core.g), core.b);\r
  if (layer <= 0.0) discard;\r
#ifdef PRISM\r
  vec3 color = clamp(1.0 - (1.0 - tint.rgb) * core * 1.4, 0.0, 1.0);\r
#else\r
  vec3 color = tint.rgb;\r
#endif\r
  color = mix(color, vec3(1.0), hot * 0.7);\r
  fragColor = vec4(color * layer, layer) * uOpacity;\r
#else\r
#ifdef PRISM\r
  vec4 color = toneMap(prismOf(tint.rgb) * energy * core * 1.7);\r
#else\r
  vec4 color = toneMap(tint.rgb * energy * core * 1.7);\r
#endif\r
  if (color.a <= 0.0) discard;\r
  fragColor = color * uOpacity;\r
#endif\r
}\`;\r
\r
const shaderSource = (body, flags) =>\r
  [\r
    '#version 300 es',\r
    'precision highp float;',\r
    \`#define SLOTS \${SLOTS}\`,\r
    ...flags.map(flag => \`#define \${flag}\`),\r
    body\r
  ].join('\\n');\r
\r
const FRAGMENTS = { glow: GLOW, compose: COMPOSE, line: LINE };\r
\r
const MOTIONS = ['pulse', 'ripple', 'breathe'];\r
const CYCLE = 3.45;\r
const STAGGER = 0.5;\r
const DEPTH = 2.6;\r
const BURST_LIFE = 1.1;\r
const BURST_SPEED = 0.9;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const smoothstep = (from, to, value) => {\r
  const t = clamp((value - from) / (to - from), 0, 1);\r
  return t * t * (3 - 2 * t);\r
};\r
\r
const pulseLife = t => Math.min(smoothstep(0, 0.7, t), 1 - smoothstep(0.5, 3.25, t));\r
\r
const toLinear = channel => (channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4));\r
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
  if (typeof document !== 'undefined') {\r
    const context = document.createElement('canvas').getContext('2d');\r
    if (context) {\r
      context.fillStyle = '#000000';\r
      context.fillStyle = text;\r
      const normal = String(context.fillStyle);\r
      if (normal !== '#000000' || /^(#0{3}|#0{6}|black)$/i.test(text)) return parseColor(normal);\r
    }\r
  }\r
  return [0.66, 0.33, 0.97];\r
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
const link = (gl, vertexSource, fragmentSource) => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);\r
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
    if (info) uniforms[info.name.replace(/\\[0\\]$/, '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const invert = m => {\r
  const [a, b, c, d, e, f, g, h, i] = m;\r
  const A = e * i - f * h;\r
  const B = f * g - d * i;\r
  const C = d * h - e * g;\r
  const det = a * A + b * B + c * C;\r
  return [A, c * h - b * i, b * f - c * e, B, a * i - c * g, c * d - a * f, C, b * g - a * h, a * e - b * d].map(\r
    value => value / det\r
  );\r
};\r
\r
const planeFor = (tiltX, tiltY) => {\r
  const ax = (tiltX * Math.PI) / 180;\r
  const ay = (tiltY * Math.PI) / 180;\r
  const cx = Math.cos(ax);\r
  const sx = Math.sin(ax);\r
  const cy = Math.cos(ay);\r
  const sy = Math.sin(ay);\r
  const forward = [cy, sy * sx, 0, 0, cx, 0, (sy * cx) / DEPTH, -sx / DEPTH, 1];\r
  return { forward, inverse: invert(forward) };\r
};\r
\r
const project = (m, x, y) => {\r
  const w = m[6] * x + m[7] * y + m[8];\r
  return [(m[0] * x + m[1] * y + m[2]) / w, (m[3] * x + m[4] * y + m[5]) / w, w];\r
};\r
\r
const MagicRings = ({\r
  color = '#A855F7',\r
  colorTwo = '#6366F1',\r
  ringCount = 6,\r
  motion = 'pulse',\r
  speed = 1,\r
  lineThickness = 2,\r
  glow = 1,\r
  baseRadius = 0.35,\r
  radiusStep = 0.1,\r
  expansion = 0.1,\r
  taper = 1.5,\r
  rotation = 0,\r
  spin = 0,\r
  tilt = 0,\r
  dispersion = 0,\r
  grain = 0,\r
  opacity = 1,\r
  followMouse = false,\r
  mouseInfluence = 0.2,\r
  hoverScale = 1.2,\r
  hoverIntensity = 1,\r
  parallax = 0.05,\r
  clickBurst = true,\r
  intro = true,\r
  theme = 'dark',\r
  maxDevicePixelRatio = 2,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const [generation, setGeneration] = useState(0);\r
\r
  const light = theme === 'light';\r
  const first = parseColor(color);\r
  const second = parseColor(colorTwo);\r
  const settings = {\r
    color: light ? first : first.map(toLinear),\r
    colorTwo: light ? second : second.map(toLinear),\r
    ringCount: clamp(Math.round(ringCount), 1, MAX_RINGS),\r
    motion: MOTIONS.includes(motion) ? motion : 'pulse',\r
    speed: Math.max(0, speed),\r
    lineThickness: Math.max(0.25, lineThickness),\r
    glow: clamp(glow, 0, 3),\r
    baseRadius: Math.max(0.01, baseRadius),\r
    radiusStep: Math.max(0, radiusStep),\r
    expansion,\r
    taper: Math.max(0.5, taper),\r
    rotation: (rotation * Math.PI) / 180,\r
    spin,\r
    tilt: clamp(tilt, -80, 80),\r
    dispersion: clamp(dispersion, 0, 1),\r
    grain: clamp(grain, 0, 1),\r
    opacity: clamp(opacity, 0, 1),\r
    followMouse,\r
    mouseInfluence,\r
    hoverScale: Math.max(0.5, hoverScale),\r
    hoverIntensity: Math.max(0, hoverIntensity),\r
    parallax,\r
    clickBurst,\r
    intro,\r
    light,\r
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
      powerPreference: 'default'\r
    });\r
    if (!gl) return;\r
    const programs = new Map();\r
    const programFor = (name, flags) => {\r
      const key = \`\${name}|\${flags.join(',')}\`;\r
      if (!programs.has(key)) {\r
        const vertex = shaderSource(name === 'line' ? STRIP : FULLSCREEN, flags);\r
        programs.set(key, link(gl, vertex, shaderSource(\`\${COMMON}\${FRAGMENTS[name]}\`, flags)));\r
      }\r
      return programs.get(key);\r
    };\r
    if (!programFor('glow', []) || !programFor('compose', []) || !programFor('line', [])) return;\r
\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
    const vao = gl.createVertexArray();\r
    const stripVao = gl.createVertexArray();\r
    const stripBuffer = gl.createBuffer();\r
    const strip = new Float32Array((SEGMENTS + 1) * 4);\r
    for (let index = 0; index <= SEGMENTS; index++) {\r
      strip.set([index / SEGMENTS, -1, index / SEGMENTS, 1], index * 4);\r
    }\r
    gl.bindVertexArray(stripVao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, stripBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, strip, gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    gl.bindVertexArray(null);\r
    const glowTexture = gl.createTexture();\r
    const glowBuffer = gl.createFramebuffer();\r
    const glowSize = { width: 0, height: 0 };\r
    let floatGlow = Boolean(gl.getExtension('EXT_color_buffer_float'));\r
    const shape = new Float32Array(SLOTS * 4);\r
    const frameData = new Float32Array(SLOTS * 4);\r
    const tints = new Float32Array(SLOTS * 4);\r
    const size = { width: 1, height: 1, ratio: 1, unit: 1 };\r
    const pointer = { x: 0, y: 0, inside: false, touch: false };\r
    const spring = { x: 0, y: 0, vx: 0, vy: 0, hover: 0, hoverVelocity: 0 };\r
    const bursts = [];\r
    let introLive = settingsRef.current.intro && settingsRef.current.speed > 0 && !reduced && generation === 0;\r
    let time = introLive ? 0 : 1.6;\r
    let clock = 0;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let pageVisible = document.visibilityState !== 'hidden';\r
    let lost = false;\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const rect = container.getBoundingClientRect();\r
      const ratio = Math.min(window.devicePixelRatio || 1, s.maxRatio);\r
      const width = Math.max(1, Math.round(rect.width * ratio));\r
      const height = Math.max(1, Math.round(rect.height * ratio));\r
      if (canvas.width !== width || canvas.height !== height) {\r
        canvas.width = width;\r
        canvas.height = height;\r
      }\r
      Object.assign(size, { width, height, ratio, unit: Math.max(1, Math.min(width, height)) });\r
      const glowWidth = Math.max(1, Math.ceil(width / 2));\r
      const glowHeight = Math.max(1, Math.ceil(height / 2));\r
      if (glowSize.width === glowWidth && glowSize.height === glowHeight) return;\r
      Object.assign(glowSize, { width: glowWidth, height: glowHeight });\r
      const allocate = useFloat => {\r
        gl.bindTexture(gl.TEXTURE_2D, glowTexture);\r
        gl.texImage2D(\r
          gl.TEXTURE_2D,\r
          0,\r
          useFloat ? gl.RGBA16F : gl.RGBA8,\r
          glowWidth,\r
          glowHeight,\r
          0,\r
          gl.RGBA,\r
          useFloat ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE,\r
          null\r
        );\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, glowBuffer);\r
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, glowTexture, 0);\r
        const complete = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
        return complete;\r
      };\r
      if (!allocate(floatGlow)) {\r
        floatGlow = false;\r
        allocate(false);\r
      }\r
    };\r
\r
    const ringState = (s, index, count) => {\r
      const mix = count > 1 ? index / (count - 1) : 0;\r
      if (s.motion === 'ripple') {\r
        const span = count * s.radiusStep + s.expansion;\r
        const period = CYCLE * Math.max(1, count) * 0.32;\r
        const phase = time / period + index / count;\r
        const progress = phase - Math.floor(phase);\r
        const born = time - progress * period >= -1e-4 || !introLive;\r
        const life = born ? smoothstep(0, 0.12, progress) * (1 - smoothstep(0.62, 1, progress)) : 0;\r
        const position = progress * Math.max(1, count - 1);\r
        return { radius: s.baseRadius + progress * span, life, virtual: position, mix: progress, opening: 1 };\r
      }\r
      if (s.motion === 'breathe') {\r
        const wave = Math.sin((time / 4) * Math.PI * 2 - index * 0.55);\r
        const rise = introLive ? smoothstep(index * 0.12, index * 0.12 + 0.9, time) : 1;\r
        return {\r
          radius: s.baseRadius + index * s.radiusStep + s.expansion * 0.5 * (1 + wave),\r
          life: (0.78 + 0.22 * wave) * rise,\r
          virtual: index,\r
          mix,\r
          opening: 1\r
        };\r
      }\r
      const local = time - index * STAGGER;\r
      const t = ((local % CYCLE) + CYCLE) % CYCLE;\r
      const life = introLive && local < 0 ? 0 : pulseLife(t);\r
      return {\r
        radius: s.baseRadius + index * s.radiusStep + (1 - Math.pow(1 - t / CYCLE, 2)) * s.expansion,\r
        life,\r
        virtual: index,\r
        mix,\r
        opening: introLive && local < CYCLE ? smoothstep(0, 0.9, local) : 1\r
      };\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const count = s.ringCount;\r
      const hover = spring.hover;\r
      const still = reduced ? 0 : 1;\r
      const scale = 1 + (s.hoverScale - 1) * hover * still;\r
      const mouseX = spring.x * still;\r
      const mouseY = spring.y * still;\r
      const leanX = s.tilt - mouseY * s.parallax * 260;\r
      const leanY = mouseX * s.parallax * 260;\r
      const view = planeFor(leanX, leanY);\r
      const center = s.followMouse ? [mouseX * s.mouseInfluence, mouseY * s.mouseInfluence] : [0, 0];\r
      const spinBase = s.spin * time * 0.6;\r
\r
      let slots = 0;\r
      let lowest = Infinity;\r
      let highest = 0;\r
      let shiftMax = 0;\r
      const place = (radius, life, cut, angle, shiftX, shiftY, mix, width) => {\r
        if (life <= 0.002) return;\r
        const gain = 10 * radius * cut * cut * cut;\r
        shape.set([radius, life, gain, gain > 6.2 ? Math.cbrt(6.2 / gain) : 2], slots * 4);\r
        frameData.set([shiftX, shiftY, Math.cos(angle), Math.sin(angle)], slots * 4);\r
        tints.set(\r
          [\r
            s.color[0] + (s.colorTwo[0] - s.color[0]) * mix,\r
            s.color[1] + (s.colorTwo[1] - s.color[1]) * mix,\r
            s.color[2] + (s.colorTwo[2] - s.color[2]) * mix,\r
            width\r
          ],\r
          slots * 4\r
        );\r
        lowest = Math.min(lowest, radius);\r
        highest = Math.max(highest, radius);\r
        shiftMax = Math.max(shiftMax, Math.hypot(shiftX, shiftY));\r
        slots++;\r
      };\r
\r
      for (let index = 0; index < count; index++) {\r
        const state = ringState(s, index, count);\r
        let radius = state.radius * scale;\r
        let life = state.life;\r
        for (const burst of bursts) {\r
          const age = clock - burst.start;\r
          const wave = (burst.radius + age * BURST_SPEED) * scale;\r
          const fade = Math.pow(Math.max(0, 1 - age / BURST_LIFE), 1.5);\r
          const gap = (wave - radius) / 0.08;\r
          radius += 0.04 * Math.exp(-gap * gap) * fade;\r
          life = Math.min(1.6, life + 0.9 * Math.exp(-gap * gap * 1.6) * fade);\r
        }\r
        const cut = Math.pow(s.taper, state.virtual) / Math.max(0.08, state.opening);\r
        const angle = s.rotation + spinBase * (index % 2 ? -1 : 1) * (1 + index * 0.15);\r
        place(radius, life, cut, angle, index * s.parallax * mouseX, index * s.parallax * mouseY, state.mix, 1);\r
      }\r
      for (const burst of bursts) {\r
        const age = clock - burst.start;\r
        const fade = Math.pow(Math.max(0, 1 - age / BURST_LIFE), 1.5);\r
        const radius = (burst.radius + age * BURST_SPEED) * scale;\r
        place(radius, 1.5 * fade, 0.85, s.rotation, 0, 0, clamp(age / BURST_LIFE, 0, 1), 1.15);\r
      }\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      if (!slots) return;\r
\r
      const flags = [];\r
      if (s.light) flags.push('LIGHT');\r
      if (s.dispersion > 0) flags.push('PRISM');\r
      if (!floatGlow) flags.push('PACKED');\r
      const glowProgram = programFor('glow', flags);\r
      const composeProgram = programFor('compose', flags);\r
      const lineProgram = programFor('line', flags);\r
      if (!glowProgram || !composeProgram || !lineProgram) return;\r
\r
      const glowScale = (s.light ? 0.3 : 1) * (1 - s.dispersion * 0.45);\r
      const outer = 0.012 + 0.033 * s.glow;\r
      const innerAmount = 0.5 * Math.min(1, s.glow) * glowScale;\r
      const outerAmount = 0.9 * s.glow * glowScale;\r
      const range = outer * 4.5 + 0.008;\r
      const split = s.dispersion * 0.03;\r
      const margin = range + split * highest + shiftMax + 0.01;\r
      const width = s.lineThickness * size.ratio;\r
      const reach = width * (1 + 0.45 * s.hoverIntensity) * 1.15 + 1.5;\r
      const cursor = project(view.inverse, pointer.x, pointer.y);\r
\r
      const shared = program => {\r
        const u = program.uniforms;\r
        gl.useProgram(program.program);\r
        gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
        gl.uniform1f(u.uUnit, size.unit);\r
        gl.uniform2f(u.uCenter, center[0], center[1]);\r
        gl.uniform1i(u.uCount, slots);\r
        gl.uniform4fv(u.uShape, shape);\r
        gl.uniform4fv(u.uFrame, frameData);\r
        gl.uniform4fv(u.uTint, tints);\r
        gl.uniform4f(u.uHover, cursor[0] - center[0], cursor[1] - center[1], hover * s.hoverIntensity, 1 / 0.03);\r
        gl.uniform1f(u.uSplit, split);\r
        gl.uniform1f(u.uOpacity, s.opacity);\r
        return u;\r
      };\r
\r
      gl.bindVertexArray(vao);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, glowBuffer);\r
      gl.viewport(0, 0, glowSize.width, glowSize.height);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      const glowUniforms = shared(glowProgram);\r
      gl.uniform2f(glowUniforms.uScale, canvas.width / glowSize.width, canvas.height / glowSize.height);\r
      gl.uniformMatrix3fv(glowUniforms.uInverse, true, view.inverse);\r
      gl.uniform2f(glowUniforms.uBounds, Math.max(0, lowest - margin), highest + margin);\r
      gl.uniform4f(glowUniforms.uHalo, 0, 1 / outer, innerAmount, outerAmount);\r
      gl.uniform3f(glowUniforms.uRange, range * 0.45, 1 / (range * 0.55), range);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      const composeUniforms = shared(composeProgram);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, glowTexture);\r
      gl.uniform1i(composeUniforms.uGlow, 0);\r
      gl.uniform1f(composeUniforms.uGrain, s.grain);\r
      gl.uniform1f(composeUniforms.uTime, clock);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      const lineUniforms = shared(lineProgram);\r
      gl.uniformMatrix3fv(lineUniforms.uForward, true, view.forward);\r
      gl.uniform1f(lineUniforms.uReach, reach);\r
      gl.uniform1f(lineUniforms.uWidth, width);\r
      gl.enable(gl.BLEND);\r
      if (s.light) gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      else gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_COLOR, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      gl.bindVertexArray(stripVao);\r
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, (SEGMENTS + 1) * 2, slots);\r
      gl.disable(gl.BLEND);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (lost) return;\r
      const s = settingsRef.current;\r
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05);\r
      last = Math.max(last, now);\r
      clock += dt;\r
      if (!reduced) time += dt * s.speed;\r
\r
      const targetX = pointer.inside ? pointer.x / Math.max(1e-6, size.width / size.unit) : 0;\r
      const targetY = pointer.inside ? pointer.y / Math.max(1e-6, size.height / size.unit) : 0;\r
      const stiffness = 70;\r
      const damping = 2 * Math.sqrt(stiffness) * 0.9;\r
      const steps = Math.max(1, Math.ceil(dt / (1 / 240)));\r
      const h = dt / steps;\r
      for (let step = 0; step < steps; step++) {\r
        spring.vx += (stiffness * (targetX - spring.x) - damping * spring.vx) * h;\r
        spring.vy += (stiffness * (targetY - spring.y) - damping * spring.vy) * h;\r
        spring.x += spring.vx * h;\r
        spring.y += spring.vy * h;\r
        const hoverTarget = pointer.inside ? 1 : 0;\r
        spring.hoverVelocity += (40 * (hoverTarget - spring.hover) - 2 * Math.sqrt(40) * spring.hoverVelocity) * h;\r
        spring.hover += spring.hoverVelocity * h;\r
      }\r
\r
      for (let index = bursts.length - 1; index >= 0; index--) {\r
        if (clock - bursts[index].start > BURST_LIFE) bursts.splice(index, 1);\r
      }\r
      if (introLive && time > (s.ringCount + 2) * STAGGER + CYCLE) introLive = false;\r
\r
      render();\r
\r
      const settling =\r
        Math.abs(spring.vx) + Math.abs(spring.vy) + Math.abs(spring.hoverVelocity) > 1e-4 ||\r
        Math.abs((pointer.inside ? 1 : 0) - spring.hover) > 1e-3;\r
      const busy = (s.speed > 0 && !reduced) || settling || bursts.length > 0 || introLive;\r
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
      const inside =\r
        event.clientX >= rect.left &&\r
        event.clientX <= rect.right &&\r
        event.clientY >= rect.top &&\r
        event.clientY <= rect.bottom;\r
      const unit = Math.max(1, Math.min(rect.width, rect.height));\r
      return {\r
        x: (event.clientX - rect.left - rect.width / 2) / unit,\r
        y: (rect.top + rect.height / 2 - event.clientY) / unit,\r
        inside\r
      };\r
    };\r
\r
    const onPointerMove = event => {\r
      if (event.pointerType === 'touch' && !pointer.touch) return;\r
      const spot = locate(event);\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = spot.inside;\r
      wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      const spot = locate(event);\r
      if (!spot.inside) return;\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = true;\r
      pointer.touch = event.pointerType === 'touch';\r
      const s = settingsRef.current;\r
      if (s.clickBurst && !reduced) {\r
        bursts.push({ start: clock, radius: Math.max(0.04, s.baseRadius * 0.45) });\r
        if (bursts.length > MAX_BURSTS) bursts.shift();\r
      }\r
      wake();\r
    };\r
\r
    const onPointerUp = event => {\r
      if (event.pointerType !== 'touch') return;\r
      pointer.touch = false;\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
    const onLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
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
        gl.deleteVertexArray(vao);\r
        gl.deleteTexture(glowTexture);\r
        gl.deleteFramebuffer(glowBuffer);\r
        programs.forEach(entry => entry && gl.deleteProgram(entry.program));\r
        gl.deleteVertexArray(stripVao);\r
        gl.deleteBuffer(stripBuffer);\r
      }\r
    };\r
  }, [generation]);\r
\r
  return (\r
    <div ref={containerRef} className={\`relative h-full w-full overflow-hidden \${className}\`.trim()} style={style}>\r
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default MagicRings;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, useState, type CSSProperties } from 'react';\r
import './MagicRings.css';\r
\r
type Motion = 'pulse' | 'ripple' | 'breathe';\r
type Pass = 'glow' | 'compose' | 'line';\r
type Matrix = number[];\r
\r
export interface MagicRingsProps {\r
  color?: string;\r
  colorTwo?: string;\r
  ringCount?: number;\r
  motion?: Motion;\r
  speed?: number;\r
  lineThickness?: number;\r
  glow?: number;\r
  baseRadius?: number;\r
  radiusStep?: number;\r
  expansion?: number;\r
  taper?: number;\r
  rotation?: number;\r
  spin?: number;\r
  tilt?: number;\r
  dispersion?: number;\r
  grain?: number;\r
  opacity?: number;\r
  followMouse?: boolean;\r
  mouseInfluence?: number;\r
  hoverScale?: number;\r
  hoverIntensity?: number;\r
  parallax?: number;\r
  clickBurst?: boolean;\r
  intro?: boolean;\r
  theme?: 'dark' | 'light';\r
  maxDevicePixelRatio?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Settings {\r
  color: number[];\r
  colorTwo: number[];\r
  ringCount: number;\r
  motion: Motion;\r
  speed: number;\r
  lineThickness: number;\r
  glow: number;\r
  baseRadius: number;\r
  radiusStep: number;\r
  expansion: number;\r
  taper: number;\r
  rotation: number;\r
  spin: number;\r
  tilt: number;\r
  dispersion: number;\r
  grain: number;\r
  opacity: number;\r
  followMouse: boolean;\r
  mouseInfluence: number;\r
  hoverScale: number;\r
  hoverIntensity: number;\r
  parallax: number;\r
  clickBurst: boolean;\r
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
interface RingState {\r
  radius: number;\r
  life: number;\r
  virtual: number;\r
  mix: number;\r
  opening: number;\r
}\r
\r
interface Burst {\r
  start: number;\r
  radius: number;\r
}\r
\r
const MAX_RINGS = 12;\r
const MAX_BURSTS = 3;\r
const SLOTS = MAX_RINGS + MAX_BURSTS;\r
\r
const SEGMENTS = 128;\r
\r
const FULLSCREEN = \`\r
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));\r
void main() {\r
  gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);\r
}\`;\r
\r
const STRIP = \`\r
layout(location = 0) in vec2 aSegment;\r
uniform mat3 uForward;\r
uniform vec2 uResolution;\r
uniform float uUnit;\r
uniform vec2 uCenter;\r
uniform vec4 uShape[SLOTS];\r
uniform vec4 uFrame[SLOTS];\r
uniform float uReach;\r
uniform float uSplit;\r
flat out int vSlot;\r
out vec2 vPlane;\r
void main() {\r
  vec4 shape = uShape[gl_InstanceID];\r
  vec2 origin = uCenter + uFrame[gl_InstanceID].xy;\r
  float angle = aSegment.x * 6.2831853;\r
  vec2 direction = vec2(cos(angle), sin(angle));\r
  vec3 inner = uForward * vec3(origin + direction * shape.x, 1.0);\r
  vec3 outer = uForward * vec3(origin + direction * (shape.x + 0.01), 1.0);\r
  float pixels = length(outer.xy / outer.z - inner.xy / inner.z) * 100.0 * uUnit;\r
  float band = uReach / max(pixels, 1e-3) + uSplit * shape.x;\r
  vec2 plane = origin + direction * max(shape.x + aSegment.y * band, 0.0);\r
  vec3 screen = uForward * vec3(plane, 1.0);\r
  gl_Position = vec4(screen.xy * (2.0 * uUnit / uResolution), 0.0, screen.z);\r
  vPlane = plane;\r
  vSlot = gl_InstanceID;\r
}\`;\r
\r
const COMMON = \`\r
uniform vec2 uResolution;\r
uniform vec2 uScale;\r
uniform float uUnit;\r
uniform mat3 uInverse;\r
uniform vec2 uCenter;\r
uniform int uCount;\r
uniform vec4 uShape[SLOTS];\r
uniform vec4 uFrame[SLOTS];\r
uniform vec4 uTint[SLOTS];\r
uniform vec4 uHover;\r
uniform vec2 uBounds;\r
uniform float uSplit;\r
uniform float uOpacity;\r
\r
out vec4 fragColor;\r
\r
float hash(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * 0.1031);\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.x + q.y) * q.z);\r
}\r
\r
float angleOf(vec2 v) {\r
  vec2 a = abs(v);\r
  float t = min(a.x, a.y) / max(max(a.x, a.y), 1e-6);\r
  float r = t * (0.5 + 0.1738 * (1.0 - t));\r
  return a.y > a.x ? 1.0 - r : r;\r
}\r
\r
float nearness(vec2 plane) {\r
  vec2 offset = plane - uHover.xy;\r
  return uHover.z * exp(-dot(offset, offset) * uHover.w);\r
}\r
\r
vec3 prismOf(vec3 tint) {\r
  return mix(tint, vec3(dot(tint, vec3(0.3333))), 0.65) * 0.85;\r
}\r
\r
vec4 toneMap(vec3 light) {\r
  float peak = max(max(light.r, light.g), light.b);\r
  if (peak <= 0.0) return vec4(0.0);\r
  float level = 1.0 - exp(-peak);\r
  vec3 color = mix(light * (level / peak), vec3(level), smoothstep(1.4, 3.6, peak) * 0.4);\r
  return vec4(color, level);\r
}\r
\`;\r
\r
const GLOW = \`\r
uniform vec4 uHalo;\r
uniform vec3 uRange;\r
\r
float haloOf(float d) {\r
  float fall = exp(-d * uHalo.y);\r
  float tight = fall * fall;\r
  tight *= tight;\r
  float window = clamp(1.0 - (d - uRange.x) * uRange.y, 0.0, 1.0);\r
  return (uHalo.z * tight + uHalo.w * fall) * window * window;\r
}\r
\r
void main() {\r
  vec3 projected = uInverse * vec3((gl_FragCoord.xy * uScale - 0.5 * uResolution) / uUnit, 1.0);\r
  vec2 plane = projected.xy / projected.z;\r
  vec2 base = plane - uCenter;\r
  float reach = length(base);\r
  if (projected.z <= 0.0 || reach < uBounds.x || reach > uBounds.y) {\r
    fragColor = vec4(0.0);\r
    return;\r
  }\r
  float boost = 1.0 + 1.6 * nearness(plane);\r
  float limit = uRange.z + uSplit;\r
  vec3 light = vec3(0.0);\r
  float alpha = 0.0;\r
\r
  for (int i = 0; i < SLOTS; i++) {\r
    if (i >= uCount) break;\r
    vec4 shape = uShape[i];\r
    vec4 frame = uFrame[i];\r
    vec2 w = base - frame.xy;\r
    float len = length(w);\r
    float d = abs(len - shape.x);\r
    if (d > limit) continue;\r
    float a = angleOf(vec2(dot(w, frame.zw), frame.z * w.y - frame.w * w.x));\r
    if (a > shape.w) continue;\r
    float energy = shape.y * max(exp(-shape.z * a * a * a) - 0.002, 0.0) * boost;\r
    vec3 tint = uTint[i].rgb;\r
#ifdef PRISM\r
    float offset = uSplit * shape.x;\r
    vec3 halo = vec3(haloOf(abs(len - shape.x - offset)), haloOf(d), haloOf(abs(len - shape.x + offset)));\r
#else\r
    vec3 halo = vec3(haloOf(d));\r
#endif\r
#ifdef LIGHT\r
    float layer = clamp(energy * dot(halo, vec3(0.3333)), 0.0, 1.0);\r
    light = tint * layer + light * (1.0 - layer);\r
    alpha = layer + alpha * (1.0 - layer);\r
#else\r
#ifdef PRISM\r
    tint = prismOf(tint);\r
#endif\r
    light += tint * energy * halo;\r
#endif\r
  }\r
#ifdef LIGHT\r
  fragColor = vec4(light, alpha);\r
#elif defined(PACKED)\r
  fragColor = vec4(1.0 - exp(-light), 1.0);\r
#else\r
  fragColor = vec4(light, 1.0);\r
#endif\r
}\`;\r
\r
const COMPOSE = \`\r
uniform sampler2D uGlow;\r
uniform float uGrain;\r
uniform float uTime;\r
\r
void main() {\r
  vec4 glow = texture(uGlow, gl_FragCoord.xy / uResolution);\r
  float grain = 1.0;\r
  if (uGrain > 0.0) grain += uGrain * (hash(gl_FragCoord.xy + fract(uTime * 7.31) * 413.0) - 0.5) * 1.8;\r
  float dither = (hash(gl_FragCoord.xy) - 0.5) / 255.0;\r
#ifdef LIGHT\r
  float alpha = clamp(glow.a * grain, 0.0, 1.0);\r
  if (alpha <= 0.0) {\r
    fragColor = vec4(0.0);\r
    return;\r
  }\r
  vec3 ink = glow.rgb * grain;\r
  alpha = clamp(alpha + dither, 0.0, 1.0);\r
  fragColor = vec4(min(ink, vec3(alpha)), alpha) * uOpacity;\r
#else\r
#ifdef PACKED\r
  vec3 light = -log(1.0 - min(glow.rgb, vec3(0.9995))) * grain;\r
#else\r
  vec3 light = glow.rgb * grain;\r
#endif\r
  vec4 color = toneMap(light);\r
  if (color.a <= 0.0) {\r
    fragColor = vec4(0.0);\r
    return;\r
  }\r
  float alpha = clamp(color.a + dither, 0.0, 1.0);\r
  fragColor = vec4(min(color.rgb, vec3(alpha)), alpha) * uOpacity;\r
#endif\r
}\`;\r
\r
const LINE = \`\r
flat in int vSlot;\r
in vec2 vPlane;\r
uniform float uWidth;\r
\r
float coverage(float pixels, float halfWidth) {\r
  return clamp(max(halfWidth, 0.5) - pixels + 0.5, 0.0, 1.0) * min(halfWidth * 2.0, 1.0);\r
}\r
\r
void main() {\r
  vec4 shape = uShape[vSlot];\r
  vec4 frame = uFrame[vSlot];\r
  vec4 tint = uTint[vSlot];\r
  vec2 w = vPlane - uCenter - frame.xy;\r
  float len = length(w);\r
  float stretch = 1.0 / max(length(vec2(dFdx(len), dFdy(len))), 1e-6);\r
  float a = angleOf(vec2(dot(w, frame.zw), frame.z * w.y - frame.w * w.x));\r
  float near = nearness(vPlane);\r
  float energy = shape.y * max(exp(-shape.z * a * a * a) - 0.002, 0.0) * (1.0 + 1.6 * near) * step(a, shape.w);\r
  float halfWidth = uWidth * (1.0 + 0.45 * near) * max(1.0 - a, 0.5) * tint.w;\r
  float pixels = abs(len - shape.x) * stretch;\r
#ifdef PRISM\r
  float offset = uSplit * shape.x;\r
  vec3 core = vec3(\r
    coverage(abs(len - shape.x - offset) * stretch, halfWidth),\r
    coverage(pixels, halfWidth),\r
    coverage(abs(len - shape.x + offset) * stretch, halfWidth)\r
  );\r
#else\r
  vec3 core = vec3(coverage(pixels, halfWidth));\r
#endif\r
#ifdef LIGHT\r
  float hot = core.g * clamp(1.0 - pixels / max(halfWidth * 0.35, 0.3), 0.0, 1.0);\r
  float layer = energy * max(max(core.r, core.g), core.b);\r
  if (layer <= 0.0) discard;\r
#ifdef PRISM\r
  vec3 color = clamp(1.0 - (1.0 - tint.rgb) * core * 1.4, 0.0, 1.0);\r
#else\r
  vec3 color = tint.rgb;\r
#endif\r
  color = mix(color, vec3(1.0), hot * 0.7);\r
  fragColor = vec4(color * layer, layer) * uOpacity;\r
#else\r
#ifdef PRISM\r
  vec4 color = toneMap(prismOf(tint.rgb) * energy * core * 1.7);\r
#else\r
  vec4 color = toneMap(tint.rgb * energy * core * 1.7);\r
#endif\r
  if (color.a <= 0.0) discard;\r
  fragColor = color * uOpacity;\r
#endif\r
}\`;\r
\r
const shaderSource = (body: string, flags: string[]) =>\r
  [\r
    '#version 300 es',\r
    'precision highp float;',\r
    \`#define SLOTS \${SLOTS}\`,\r
    ...flags.map(flag => \`#define \${flag}\`),\r
    body\r
  ].join('\\n');\r
\r
const FRAGMENTS: Record<Pass, string> = { glow: GLOW, compose: COMPOSE, line: LINE };\r
\r
const MOTIONS: Motion[] = ['pulse', 'ripple', 'breathe'];\r
const CYCLE = 3.45;\r
const STAGGER = 0.5;\r
const DEPTH = 2.6;\r
const BURST_LIFE = 1.1;\r
const BURST_SPEED = 0.9;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const smoothstep = (from: number, to: number, value: number) => {\r
  const t = clamp((value - from) / (to - from), 0, 1);\r
  return t * t * (3 - 2 * t);\r
};\r
\r
const pulseLife = (t: number) => Math.min(smoothstep(0, 0.7, t), 1 - smoothstep(0.5, 3.25, t));\r
\r
const toLinear = (channel: number) => (channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4));\r
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
  if (typeof document !== 'undefined') {\r
    const context = document.createElement('canvas').getContext('2d');\r
    if (context) {\r
      context.fillStyle = '#000000';\r
      context.fillStyle = text;\r
      const normal = String(context.fillStyle);\r
      if (normal !== '#000000' || /^(#0{3}|#0{6}|black)$/i.test(text)) return parseColor(normal);\r
    }\r
  }\r
  return [0.66, 0.33, 0.97];\r
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
const link = (gl: WebGL2RenderingContext, vertexSource: string, fragmentSource: string): Program | null => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);\r
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
    if (info) uniforms[info.name.replace(/\\[0\\]$/, '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const invert = (m: Matrix): Matrix => {\r
  const [a, b, c, d, e, f, g, h, i] = m;\r
  const A = e * i - f * h;\r
  const B = f * g - d * i;\r
  const C = d * h - e * g;\r
  const det = a * A + b * B + c * C;\r
  return [A, c * h - b * i, b * f - c * e, B, a * i - c * g, c * d - a * f, C, b * g - a * h, a * e - b * d].map(\r
    value => value / det\r
  );\r
};\r
\r
const planeFor = (tiltX: number, tiltY: number) => {\r
  const ax = (tiltX * Math.PI) / 180;\r
  const ay = (tiltY * Math.PI) / 180;\r
  const cx = Math.cos(ax);\r
  const sx = Math.sin(ax);\r
  const cy = Math.cos(ay);\r
  const sy = Math.sin(ay);\r
  const forward = [cy, sy * sx, 0, 0, cx, 0, (sy * cx) / DEPTH, -sx / DEPTH, 1];\r
  return { forward, inverse: invert(forward) };\r
};\r
\r
const project = (m: Matrix, x: number, y: number) => {\r
  const w = m[6] * x + m[7] * y + m[8];\r
  return [(m[0] * x + m[1] * y + m[2]) / w, (m[3] * x + m[4] * y + m[5]) / w, w];\r
};\r
\r
const MagicRings = ({\r
  color = '#A855F7',\r
  colorTwo = '#6366F1',\r
  ringCount = 6,\r
  motion = 'pulse',\r
  speed = 1,\r
  lineThickness = 2,\r
  glow = 1,\r
  baseRadius = 0.35,\r
  radiusStep = 0.1,\r
  expansion = 0.1,\r
  taper = 1.5,\r
  rotation = 0,\r
  spin = 0,\r
  tilt = 0,\r
  dispersion = 0,\r
  grain = 0,\r
  opacity = 1,\r
  followMouse = false,\r
  mouseInfluence = 0.2,\r
  hoverScale = 1.2,\r
  hoverIntensity = 1,\r
  parallax = 0.05,\r
  clickBurst = true,\r
  intro = true,\r
  theme = 'dark',\r
  maxDevicePixelRatio = 2,\r
  className = '',\r
  style\r
}: MagicRingsProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const [generation, setGeneration] = useState(0);\r
\r
  const light = theme === 'light';\r
  const first = parseColor(color);\r
  const second = parseColor(colorTwo);\r
  const settings: Settings = {\r
    color: light ? first : first.map(toLinear),\r
    colorTwo: light ? second : second.map(toLinear),\r
    ringCount: clamp(Math.round(ringCount), 1, MAX_RINGS),\r
    motion: MOTIONS.includes(motion) ? motion : 'pulse',\r
    speed: Math.max(0, speed),\r
    lineThickness: Math.max(0.25, lineThickness),\r
    glow: clamp(glow, 0, 3),\r
    baseRadius: Math.max(0.01, baseRadius),\r
    radiusStep: Math.max(0, radiusStep),\r
    expansion,\r
    taper: Math.max(0.5, taper),\r
    rotation: (rotation * Math.PI) / 180,\r
    spin,\r
    tilt: clamp(tilt, -80, 80),\r
    dispersion: clamp(dispersion, 0, 1),\r
    grain: clamp(grain, 0, 1),\r
    opacity: clamp(opacity, 0, 1),\r
    followMouse,\r
    mouseInfluence,\r
    hoverScale: Math.max(0.5, hoverScale),\r
    hoverIntensity: Math.max(0, hoverIntensity),\r
    parallax,\r
    clickBurst,\r
    intro,\r
    light,\r
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
      powerPreference: 'default'\r
    });\r
    if (!gl) return;\r
    const programs = new Map<string, Program | null>();\r
    const programFor = (name: Pass, flags: string[]) => {\r
      const key = \`\${name}|\${flags.join(',')}\`;\r
      if (!programs.has(key)) {\r
        const vertex = shaderSource(name === 'line' ? STRIP : FULLSCREEN, flags);\r
        programs.set(key, link(gl, vertex, shaderSource(\`\${COMMON}\${FRAGMENTS[name]}\`, flags)));\r
      }\r
      return programs.get(key);\r
    };\r
    if (!programFor('glow', []) || !programFor('compose', []) || !programFor('line', [])) return;\r
\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
    const vao = gl.createVertexArray();\r
    const stripVao = gl.createVertexArray();\r
    const stripBuffer = gl.createBuffer();\r
    const strip = new Float32Array((SEGMENTS + 1) * 4);\r
    for (let index = 0; index <= SEGMENTS; index++) {\r
      strip.set([index / SEGMENTS, -1, index / SEGMENTS, 1], index * 4);\r
    }\r
    gl.bindVertexArray(stripVao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, stripBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, strip, gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    gl.bindVertexArray(null);\r
    const glowTexture = gl.createTexture();\r
    const glowBuffer = gl.createFramebuffer();\r
    const glowSize = { width: 0, height: 0 };\r
    let floatGlow = Boolean(gl.getExtension('EXT_color_buffer_float'));\r
    const shape = new Float32Array(SLOTS * 4);\r
    const frameData = new Float32Array(SLOTS * 4);\r
    const tints = new Float32Array(SLOTS * 4);\r
    const size = { width: 1, height: 1, ratio: 1, unit: 1 };\r
    const pointer = { x: 0, y: 0, inside: false, touch: false };\r
    const spring = { x: 0, y: 0, vx: 0, vy: 0, hover: 0, hoverVelocity: 0 };\r
    const bursts: Burst[] = [];\r
    let introLive = settingsRef.current.intro && settingsRef.current.speed > 0 && !reduced && generation === 0;\r
    let time = introLive ? 0 : 1.6;\r
    let clock = 0;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let pageVisible = document.visibilityState !== 'hidden';\r
    let lost = false;\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const rect = container.getBoundingClientRect();\r
      const ratio = Math.min(window.devicePixelRatio || 1, s.maxRatio);\r
      const width = Math.max(1, Math.round(rect.width * ratio));\r
      const height = Math.max(1, Math.round(rect.height * ratio));\r
      if (canvas.width !== width || canvas.height !== height) {\r
        canvas.width = width;\r
        canvas.height = height;\r
      }\r
      Object.assign(size, { width, height, ratio, unit: Math.max(1, Math.min(width, height)) });\r
      const glowWidth = Math.max(1, Math.ceil(width / 2));\r
      const glowHeight = Math.max(1, Math.ceil(height / 2));\r
      if (glowSize.width === glowWidth && glowSize.height === glowHeight) return;\r
      Object.assign(glowSize, { width: glowWidth, height: glowHeight });\r
      const allocate = (useFloat: boolean) => {\r
        gl.bindTexture(gl.TEXTURE_2D, glowTexture);\r
        gl.texImage2D(\r
          gl.TEXTURE_2D,\r
          0,\r
          useFloat ? gl.RGBA16F : gl.RGBA8,\r
          glowWidth,\r
          glowHeight,\r
          0,\r
          gl.RGBA,\r
          useFloat ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE,\r
          null\r
        );\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, glowBuffer);\r
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, glowTexture, 0);\r
        const complete = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
        return complete;\r
      };\r
      if (!allocate(floatGlow)) {\r
        floatGlow = false;\r
        allocate(false);\r
      }\r
    };\r
\r
    const ringState = (s: Settings, index: number, count: number): RingState => {\r
      const mix = count > 1 ? index / (count - 1) : 0;\r
      if (s.motion === 'ripple') {\r
        const span = count * s.radiusStep + s.expansion;\r
        const period = CYCLE * Math.max(1, count) * 0.32;\r
        const phase = time / period + index / count;\r
        const progress = phase - Math.floor(phase);\r
        const born = time - progress * period >= -1e-4 || !introLive;\r
        const life = born ? smoothstep(0, 0.12, progress) * (1 - smoothstep(0.62, 1, progress)) : 0;\r
        const position = progress * Math.max(1, count - 1);\r
        return { radius: s.baseRadius + progress * span, life, virtual: position, mix: progress, opening: 1 };\r
      }\r
      if (s.motion === 'breathe') {\r
        const wave = Math.sin((time / 4) * Math.PI * 2 - index * 0.55);\r
        const rise = introLive ? smoothstep(index * 0.12, index * 0.12 + 0.9, time) : 1;\r
        return {\r
          radius: s.baseRadius + index * s.radiusStep + s.expansion * 0.5 * (1 + wave),\r
          life: (0.78 + 0.22 * wave) * rise,\r
          virtual: index,\r
          mix,\r
          opening: 1\r
        };\r
      }\r
      const local = time - index * STAGGER;\r
      const t = ((local % CYCLE) + CYCLE) % CYCLE;\r
      const life = introLive && local < 0 ? 0 : pulseLife(t);\r
      return {\r
        radius: s.baseRadius + index * s.radiusStep + (1 - Math.pow(1 - t / CYCLE, 2)) * s.expansion,\r
        life,\r
        virtual: index,\r
        mix,\r
        opening: introLive && local < CYCLE ? smoothstep(0, 0.9, local) : 1\r
      };\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const count = s.ringCount;\r
      const hover = spring.hover;\r
      const still = reduced ? 0 : 1;\r
      const scale = 1 + (s.hoverScale - 1) * hover * still;\r
      const mouseX = spring.x * still;\r
      const mouseY = spring.y * still;\r
      const leanX = s.tilt - mouseY * s.parallax * 260;\r
      const leanY = mouseX * s.parallax * 260;\r
      const view = planeFor(leanX, leanY);\r
      const center = s.followMouse ? [mouseX * s.mouseInfluence, mouseY * s.mouseInfluence] : [0, 0];\r
      const spinBase = s.spin * time * 0.6;\r
\r
      let slots = 0;\r
      let lowest = Infinity;\r
      let highest = 0;\r
      let shiftMax = 0;\r
      const place = (\r
        radius: number,\r
        life: number,\r
        cut: number,\r
        angle: number,\r
        shiftX: number,\r
        shiftY: number,\r
        mix: number,\r
        width: number\r
      ) => {\r
        if (life <= 0.002) return;\r
        const gain = 10 * radius * cut * cut * cut;\r
        shape.set([radius, life, gain, gain > 6.2 ? Math.cbrt(6.2 / gain) : 2], slots * 4);\r
        frameData.set([shiftX, shiftY, Math.cos(angle), Math.sin(angle)], slots * 4);\r
        tints.set(\r
          [\r
            s.color[0] + (s.colorTwo[0] - s.color[0]) * mix,\r
            s.color[1] + (s.colorTwo[1] - s.color[1]) * mix,\r
            s.color[2] + (s.colorTwo[2] - s.color[2]) * mix,\r
            width\r
          ],\r
          slots * 4\r
        );\r
        lowest = Math.min(lowest, radius);\r
        highest = Math.max(highest, radius);\r
        shiftMax = Math.max(shiftMax, Math.hypot(shiftX, shiftY));\r
        slots++;\r
      };\r
\r
      for (let index = 0; index < count; index++) {\r
        const state = ringState(s, index, count);\r
        let radius = state.radius * scale;\r
        let life = state.life;\r
        for (const burst of bursts) {\r
          const age = clock - burst.start;\r
          const wave = (burst.radius + age * BURST_SPEED) * scale;\r
          const fade = Math.pow(Math.max(0, 1 - age / BURST_LIFE), 1.5);\r
          const gap = (wave - radius) / 0.08;\r
          radius += 0.04 * Math.exp(-gap * gap) * fade;\r
          life = Math.min(1.6, life + 0.9 * Math.exp(-gap * gap * 1.6) * fade);\r
        }\r
        const cut = Math.pow(s.taper, state.virtual) / Math.max(0.08, state.opening);\r
        const angle = s.rotation + spinBase * (index % 2 ? -1 : 1) * (1 + index * 0.15);\r
        place(radius, life, cut, angle, index * s.parallax * mouseX, index * s.parallax * mouseY, state.mix, 1);\r
      }\r
      for (const burst of bursts) {\r
        const age = clock - burst.start;\r
        const fade = Math.pow(Math.max(0, 1 - age / BURST_LIFE), 1.5);\r
        const radius = (burst.radius + age * BURST_SPEED) * scale;\r
        place(radius, 1.5 * fade, 0.85, s.rotation, 0, 0, clamp(age / BURST_LIFE, 0, 1), 1.15);\r
      }\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      if (!slots) return;\r
\r
      const flags: string[] = [];\r
      if (s.light) flags.push('LIGHT');\r
      if (s.dispersion > 0) flags.push('PRISM');\r
      if (!floatGlow) flags.push('PACKED');\r
      const glowProgram = programFor('glow', flags);\r
      const composeProgram = programFor('compose', flags);\r
      const lineProgram = programFor('line', flags);\r
      if (!glowProgram || !composeProgram || !lineProgram) return;\r
\r
      const glowScale = (s.light ? 0.3 : 1) * (1 - s.dispersion * 0.45);\r
      const outer = 0.012 + 0.033 * s.glow;\r
      const innerAmount = 0.5 * Math.min(1, s.glow) * glowScale;\r
      const outerAmount = 0.9 * s.glow * glowScale;\r
      const range = outer * 4.5 + 0.008;\r
      const split = s.dispersion * 0.03;\r
      const margin = range + split * highest + shiftMax + 0.01;\r
      const width = s.lineThickness * size.ratio;\r
      const reach = width * (1 + 0.45 * s.hoverIntensity) * 1.15 + 1.5;\r
      const cursor = project(view.inverse, pointer.x, pointer.y);\r
\r
      const shared = (program: Program) => {\r
        const u = program.uniforms;\r
        gl.useProgram(program.program);\r
        gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
        gl.uniform1f(u.uUnit, size.unit);\r
        gl.uniform2f(u.uCenter, center[0], center[1]);\r
        gl.uniform1i(u.uCount, slots);\r
        gl.uniform4fv(u.uShape, shape);\r
        gl.uniform4fv(u.uFrame, frameData);\r
        gl.uniform4fv(u.uTint, tints);\r
        gl.uniform4f(u.uHover, cursor[0] - center[0], cursor[1] - center[1], hover * s.hoverIntensity, 1 / 0.03);\r
        gl.uniform1f(u.uSplit, split);\r
        gl.uniform1f(u.uOpacity, s.opacity);\r
        return u;\r
      };\r
\r
      gl.bindVertexArray(vao);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, glowBuffer);\r
      gl.viewport(0, 0, glowSize.width, glowSize.height);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      const glowUniforms = shared(glowProgram);\r
      gl.uniform2f(glowUniforms.uScale, canvas.width / glowSize.width, canvas.height / glowSize.height);\r
      gl.uniformMatrix3fv(glowUniforms.uInverse, true, view.inverse);\r
      gl.uniform2f(glowUniforms.uBounds, Math.max(0, lowest - margin), highest + margin);\r
      gl.uniform4f(glowUniforms.uHalo, 0, 1 / outer, innerAmount, outerAmount);\r
      gl.uniform3f(glowUniforms.uRange, range * 0.45, 1 / (range * 0.55), range);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      const composeUniforms = shared(composeProgram);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, glowTexture);\r
      gl.uniform1i(composeUniforms.uGlow, 0);\r
      gl.uniform1f(composeUniforms.uGrain, s.grain);\r
      gl.uniform1f(composeUniforms.uTime, clock);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      const lineUniforms = shared(lineProgram);\r
      gl.uniformMatrix3fv(lineUniforms.uForward, true, view.forward);\r
      gl.uniform1f(lineUniforms.uReach, reach);\r
      gl.uniform1f(lineUniforms.uWidth, width);\r
      gl.enable(gl.BLEND);\r
      if (s.light) gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      else gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_COLOR, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      gl.bindVertexArray(stripVao);\r
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, (SEGMENTS + 1) * 2, slots);\r
      gl.disable(gl.BLEND);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (lost) return;\r
      const s = settingsRef.current;\r
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05);\r
      last = Math.max(last, now);\r
      clock += dt;\r
      if (!reduced) time += dt * s.speed;\r
\r
      const targetX = pointer.inside ? pointer.x / Math.max(1e-6, size.width / size.unit) : 0;\r
      const targetY = pointer.inside ? pointer.y / Math.max(1e-6, size.height / size.unit) : 0;\r
      const stiffness = 70;\r
      const damping = 2 * Math.sqrt(stiffness) * 0.9;\r
      const steps = Math.max(1, Math.ceil(dt / (1 / 240)));\r
      const h = dt / steps;\r
      for (let step = 0; step < steps; step++) {\r
        spring.vx += (stiffness * (targetX - spring.x) - damping * spring.vx) * h;\r
        spring.vy += (stiffness * (targetY - spring.y) - damping * spring.vy) * h;\r
        spring.x += spring.vx * h;\r
        spring.y += spring.vy * h;\r
        const hoverTarget = pointer.inside ? 1 : 0;\r
        spring.hoverVelocity += (40 * (hoverTarget - spring.hover) - 2 * Math.sqrt(40) * spring.hoverVelocity) * h;\r
        spring.hover += spring.hoverVelocity * h;\r
      }\r
\r
      for (let index = bursts.length - 1; index >= 0; index--) {\r
        if (clock - bursts[index].start > BURST_LIFE) bursts.splice(index, 1);\r
      }\r
      if (introLive && time > (s.ringCount + 2) * STAGGER + CYCLE) introLive = false;\r
\r
      render();\r
\r
      const settling =\r
        Math.abs(spring.vx) + Math.abs(spring.vy) + Math.abs(spring.hoverVelocity) > 1e-4 ||\r
        Math.abs((pointer.inside ? 1 : 0) - spring.hover) > 1e-3;\r
      const busy = (s.speed > 0 && !reduced) || settling || bursts.length > 0 || introLive;\r
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
      const inside =\r
        event.clientX >= rect.left &&\r
        event.clientX <= rect.right &&\r
        event.clientY >= rect.top &&\r
        event.clientY <= rect.bottom;\r
      const unit = Math.max(1, Math.min(rect.width, rect.height));\r
      return {\r
        x: (event.clientX - rect.left - rect.width / 2) / unit,\r
        y: (rect.top + rect.height / 2 - event.clientY) / unit,\r
        inside\r
      };\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      if (event.pointerType === 'touch' && !pointer.touch) return;\r
      const spot = locate(event);\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = spot.inside;\r
      wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const spot = locate(event);\r
      if (!spot.inside) return;\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = true;\r
      pointer.touch = event.pointerType === 'touch';\r
      const s = settingsRef.current;\r
      if (s.clickBurst && !reduced) {\r
        bursts.push({ start: clock, radius: Math.max(0.04, s.baseRadius * 0.45) });\r
        if (bursts.length > MAX_BURSTS) bursts.shift();\r
      }\r
      wake();\r
    };\r
\r
    const onPointerUp = (event: PointerEvent) => {\r
      if (event.pointerType !== 'touch') return;\r
      pointer.touch = false;\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
    const onLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
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
        gl.deleteVertexArray(vao);\r
        gl.deleteTexture(glowTexture);\r
        gl.deleteFramebuffer(glowBuffer);\r
        programs.forEach(entry => entry && gl.deleteProgram(entry.program));\r
        gl.deleteVertexArray(stripVao);\r
        gl.deleteBuffer(stripBuffer);\r
      }\r
    };\r
  }, [generation]);\r
\r
  return (\r
    <div ref={containerRef} className={\`magic-rings\${className ? \` \${className}\` : ''}\`} style={style}>\r
      <canvas ref={canvasRef} className="magic-rings__canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default MagicRings;\r
`,o=`'use client';\r
\r
import { useEffect, useRef, useState, type CSSProperties } from 'react';\r
\r
type Motion = 'pulse' | 'ripple' | 'breathe';\r
type Pass = 'glow' | 'compose' | 'line';\r
type Matrix = number[];\r
\r
export interface MagicRingsProps {\r
  color?: string;\r
  colorTwo?: string;\r
  ringCount?: number;\r
  motion?: Motion;\r
  speed?: number;\r
  lineThickness?: number;\r
  glow?: number;\r
  baseRadius?: number;\r
  radiusStep?: number;\r
  expansion?: number;\r
  taper?: number;\r
  rotation?: number;\r
  spin?: number;\r
  tilt?: number;\r
  dispersion?: number;\r
  grain?: number;\r
  opacity?: number;\r
  followMouse?: boolean;\r
  mouseInfluence?: number;\r
  hoverScale?: number;\r
  hoverIntensity?: number;\r
  parallax?: number;\r
  clickBurst?: boolean;\r
  intro?: boolean;\r
  theme?: 'dark' | 'light';\r
  maxDevicePixelRatio?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Settings {\r
  color: number[];\r
  colorTwo: number[];\r
  ringCount: number;\r
  motion: Motion;\r
  speed: number;\r
  lineThickness: number;\r
  glow: number;\r
  baseRadius: number;\r
  radiusStep: number;\r
  expansion: number;\r
  taper: number;\r
  rotation: number;\r
  spin: number;\r
  tilt: number;\r
  dispersion: number;\r
  grain: number;\r
  opacity: number;\r
  followMouse: boolean;\r
  mouseInfluence: number;\r
  hoverScale: number;\r
  hoverIntensity: number;\r
  parallax: number;\r
  clickBurst: boolean;\r
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
interface RingState {\r
  radius: number;\r
  life: number;\r
  virtual: number;\r
  mix: number;\r
  opening: number;\r
}\r
\r
interface Burst {\r
  start: number;\r
  radius: number;\r
}\r
\r
const MAX_RINGS = 12;\r
const MAX_BURSTS = 3;\r
const SLOTS = MAX_RINGS + MAX_BURSTS;\r
\r
const SEGMENTS = 128;\r
\r
const FULLSCREEN = \`\r
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));\r
void main() {\r
  gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);\r
}\`;\r
\r
const STRIP = \`\r
layout(location = 0) in vec2 aSegment;\r
uniform mat3 uForward;\r
uniform vec2 uResolution;\r
uniform float uUnit;\r
uniform vec2 uCenter;\r
uniform vec4 uShape[SLOTS];\r
uniform vec4 uFrame[SLOTS];\r
uniform float uReach;\r
uniform float uSplit;\r
flat out int vSlot;\r
out vec2 vPlane;\r
void main() {\r
  vec4 shape = uShape[gl_InstanceID];\r
  vec2 origin = uCenter + uFrame[gl_InstanceID].xy;\r
  float angle = aSegment.x * 6.2831853;\r
  vec2 direction = vec2(cos(angle), sin(angle));\r
  vec3 inner = uForward * vec3(origin + direction * shape.x, 1.0);\r
  vec3 outer = uForward * vec3(origin + direction * (shape.x + 0.01), 1.0);\r
  float pixels = length(outer.xy / outer.z - inner.xy / inner.z) * 100.0 * uUnit;\r
  float band = uReach / max(pixels, 1e-3) + uSplit * shape.x;\r
  vec2 plane = origin + direction * max(shape.x + aSegment.y * band, 0.0);\r
  vec3 screen = uForward * vec3(plane, 1.0);\r
  gl_Position = vec4(screen.xy * (2.0 * uUnit / uResolution), 0.0, screen.z);\r
  vPlane = plane;\r
  vSlot = gl_InstanceID;\r
}\`;\r
\r
const COMMON = \`\r
uniform vec2 uResolution;\r
uniform vec2 uScale;\r
uniform float uUnit;\r
uniform mat3 uInverse;\r
uniform vec2 uCenter;\r
uniform int uCount;\r
uniform vec4 uShape[SLOTS];\r
uniform vec4 uFrame[SLOTS];\r
uniform vec4 uTint[SLOTS];\r
uniform vec4 uHover;\r
uniform vec2 uBounds;\r
uniform float uSplit;\r
uniform float uOpacity;\r
\r
out vec4 fragColor;\r
\r
float hash(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * 0.1031);\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.x + q.y) * q.z);\r
}\r
\r
float angleOf(vec2 v) {\r
  vec2 a = abs(v);\r
  float t = min(a.x, a.y) / max(max(a.x, a.y), 1e-6);\r
  float r = t * (0.5 + 0.1738 * (1.0 - t));\r
  return a.y > a.x ? 1.0 - r : r;\r
}\r
\r
float nearness(vec2 plane) {\r
  vec2 offset = plane - uHover.xy;\r
  return uHover.z * exp(-dot(offset, offset) * uHover.w);\r
}\r
\r
vec3 prismOf(vec3 tint) {\r
  return mix(tint, vec3(dot(tint, vec3(0.3333))), 0.65) * 0.85;\r
}\r
\r
vec4 toneMap(vec3 light) {\r
  float peak = max(max(light.r, light.g), light.b);\r
  if (peak <= 0.0) return vec4(0.0);\r
  float level = 1.0 - exp(-peak);\r
  vec3 color = mix(light * (level / peak), vec3(level), smoothstep(1.4, 3.6, peak) * 0.4);\r
  return vec4(color, level);\r
}\r
\`;\r
\r
const GLOW = \`\r
uniform vec4 uHalo;\r
uniform vec3 uRange;\r
\r
float haloOf(float d) {\r
  float fall = exp(-d * uHalo.y);\r
  float tight = fall * fall;\r
  tight *= tight;\r
  float window = clamp(1.0 - (d - uRange.x) * uRange.y, 0.0, 1.0);\r
  return (uHalo.z * tight + uHalo.w * fall) * window * window;\r
}\r
\r
void main() {\r
  vec3 projected = uInverse * vec3((gl_FragCoord.xy * uScale - 0.5 * uResolution) / uUnit, 1.0);\r
  vec2 plane = projected.xy / projected.z;\r
  vec2 base = plane - uCenter;\r
  float reach = length(base);\r
  if (projected.z <= 0.0 || reach < uBounds.x || reach > uBounds.y) {\r
    fragColor = vec4(0.0);\r
    return;\r
  }\r
  float boost = 1.0 + 1.6 * nearness(plane);\r
  float limit = uRange.z + uSplit;\r
  vec3 light = vec3(0.0);\r
  float alpha = 0.0;\r
\r
  for (int i = 0; i < SLOTS; i++) {\r
    if (i >= uCount) break;\r
    vec4 shape = uShape[i];\r
    vec4 frame = uFrame[i];\r
    vec2 w = base - frame.xy;\r
    float len = length(w);\r
    float d = abs(len - shape.x);\r
    if (d > limit) continue;\r
    float a = angleOf(vec2(dot(w, frame.zw), frame.z * w.y - frame.w * w.x));\r
    if (a > shape.w) continue;\r
    float energy = shape.y * max(exp(-shape.z * a * a * a) - 0.002, 0.0) * boost;\r
    vec3 tint = uTint[i].rgb;\r
#ifdef PRISM\r
    float offset = uSplit * shape.x;\r
    vec3 halo = vec3(haloOf(abs(len - shape.x - offset)), haloOf(d), haloOf(abs(len - shape.x + offset)));\r
#else\r
    vec3 halo = vec3(haloOf(d));\r
#endif\r
#ifdef LIGHT\r
    float layer = clamp(energy * dot(halo, vec3(0.3333)), 0.0, 1.0);\r
    light = tint * layer + light * (1.0 - layer);\r
    alpha = layer + alpha * (1.0 - layer);\r
#else\r
#ifdef PRISM\r
    tint = prismOf(tint);\r
#endif\r
    light += tint * energy * halo;\r
#endif\r
  }\r
#ifdef LIGHT\r
  fragColor = vec4(light, alpha);\r
#elif defined(PACKED)\r
  fragColor = vec4(1.0 - exp(-light), 1.0);\r
#else\r
  fragColor = vec4(light, 1.0);\r
#endif\r
}\`;\r
\r
const COMPOSE = \`\r
uniform sampler2D uGlow;\r
uniform float uGrain;\r
uniform float uTime;\r
\r
void main() {\r
  vec4 glow = texture(uGlow, gl_FragCoord.xy / uResolution);\r
  float grain = 1.0;\r
  if (uGrain > 0.0) grain += uGrain * (hash(gl_FragCoord.xy + fract(uTime * 7.31) * 413.0) - 0.5) * 1.8;\r
  float dither = (hash(gl_FragCoord.xy) - 0.5) / 255.0;\r
#ifdef LIGHT\r
  float alpha = clamp(glow.a * grain, 0.0, 1.0);\r
  if (alpha <= 0.0) {\r
    fragColor = vec4(0.0);\r
    return;\r
  }\r
  vec3 ink = glow.rgb * grain;\r
  alpha = clamp(alpha + dither, 0.0, 1.0);\r
  fragColor = vec4(min(ink, vec3(alpha)), alpha) * uOpacity;\r
#else\r
#ifdef PACKED\r
  vec3 light = -log(1.0 - min(glow.rgb, vec3(0.9995))) * grain;\r
#else\r
  vec3 light = glow.rgb * grain;\r
#endif\r
  vec4 color = toneMap(light);\r
  if (color.a <= 0.0) {\r
    fragColor = vec4(0.0);\r
    return;\r
  }\r
  float alpha = clamp(color.a + dither, 0.0, 1.0);\r
  fragColor = vec4(min(color.rgb, vec3(alpha)), alpha) * uOpacity;\r
#endif\r
}\`;\r
\r
const LINE = \`\r
flat in int vSlot;\r
in vec2 vPlane;\r
uniform float uWidth;\r
\r
float coverage(float pixels, float halfWidth) {\r
  return clamp(max(halfWidth, 0.5) - pixels + 0.5, 0.0, 1.0) * min(halfWidth * 2.0, 1.0);\r
}\r
\r
void main() {\r
  vec4 shape = uShape[vSlot];\r
  vec4 frame = uFrame[vSlot];\r
  vec4 tint = uTint[vSlot];\r
  vec2 w = vPlane - uCenter - frame.xy;\r
  float len = length(w);\r
  float stretch = 1.0 / max(length(vec2(dFdx(len), dFdy(len))), 1e-6);\r
  float a = angleOf(vec2(dot(w, frame.zw), frame.z * w.y - frame.w * w.x));\r
  float near = nearness(vPlane);\r
  float energy = shape.y * max(exp(-shape.z * a * a * a) - 0.002, 0.0) * (1.0 + 1.6 * near) * step(a, shape.w);\r
  float halfWidth = uWidth * (1.0 + 0.45 * near) * max(1.0 - a, 0.5) * tint.w;\r
  float pixels = abs(len - shape.x) * stretch;\r
#ifdef PRISM\r
  float offset = uSplit * shape.x;\r
  vec3 core = vec3(\r
    coverage(abs(len - shape.x - offset) * stretch, halfWidth),\r
    coverage(pixels, halfWidth),\r
    coverage(abs(len - shape.x + offset) * stretch, halfWidth)\r
  );\r
#else\r
  vec3 core = vec3(coverage(pixels, halfWidth));\r
#endif\r
#ifdef LIGHT\r
  float hot = core.g * clamp(1.0 - pixels / max(halfWidth * 0.35, 0.3), 0.0, 1.0);\r
  float layer = energy * max(max(core.r, core.g), core.b);\r
  if (layer <= 0.0) discard;\r
#ifdef PRISM\r
  vec3 color = clamp(1.0 - (1.0 - tint.rgb) * core * 1.4, 0.0, 1.0);\r
#else\r
  vec3 color = tint.rgb;\r
#endif\r
  color = mix(color, vec3(1.0), hot * 0.7);\r
  fragColor = vec4(color * layer, layer) * uOpacity;\r
#else\r
#ifdef PRISM\r
  vec4 color = toneMap(prismOf(tint.rgb) * energy * core * 1.7);\r
#else\r
  vec4 color = toneMap(tint.rgb * energy * core * 1.7);\r
#endif\r
  if (color.a <= 0.0) discard;\r
  fragColor = color * uOpacity;\r
#endif\r
}\`;\r
\r
const shaderSource = (body: string, flags: string[]) =>\r
  [\r
    '#version 300 es',\r
    'precision highp float;',\r
    \`#define SLOTS \${SLOTS}\`,\r
    ...flags.map(flag => \`#define \${flag}\`),\r
    body\r
  ].join('\\n');\r
\r
const FRAGMENTS: Record<Pass, string> = { glow: GLOW, compose: COMPOSE, line: LINE };\r
\r
const MOTIONS: Motion[] = ['pulse', 'ripple', 'breathe'];\r
const CYCLE = 3.45;\r
const STAGGER = 0.5;\r
const DEPTH = 2.6;\r
const BURST_LIFE = 1.1;\r
const BURST_SPEED = 0.9;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const smoothstep = (from: number, to: number, value: number) => {\r
  const t = clamp((value - from) / (to - from), 0, 1);\r
  return t * t * (3 - 2 * t);\r
};\r
\r
const pulseLife = (t: number) => Math.min(smoothstep(0, 0.7, t), 1 - smoothstep(0.5, 3.25, t));\r
\r
const toLinear = (channel: number) => (channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4));\r
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
  if (typeof document !== 'undefined') {\r
    const context = document.createElement('canvas').getContext('2d');\r
    if (context) {\r
      context.fillStyle = '#000000';\r
      context.fillStyle = text;\r
      const normal = String(context.fillStyle);\r
      if (normal !== '#000000' || /^(#0{3}|#0{6}|black)$/i.test(text)) return parseColor(normal);\r
    }\r
  }\r
  return [0.66, 0.33, 0.97];\r
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
const link = (gl: WebGL2RenderingContext, vertexSource: string, fragmentSource: string): Program | null => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);\r
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
    if (info) uniforms[info.name.replace(/\\[0\\]$/, '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const invert = (m: Matrix): Matrix => {\r
  const [a, b, c, d, e, f, g, h, i] = m;\r
  const A = e * i - f * h;\r
  const B = f * g - d * i;\r
  const C = d * h - e * g;\r
  const det = a * A + b * B + c * C;\r
  return [A, c * h - b * i, b * f - c * e, B, a * i - c * g, c * d - a * f, C, b * g - a * h, a * e - b * d].map(\r
    value => value / det\r
  );\r
};\r
\r
const planeFor = (tiltX: number, tiltY: number) => {\r
  const ax = (tiltX * Math.PI) / 180;\r
  const ay = (tiltY * Math.PI) / 180;\r
  const cx = Math.cos(ax);\r
  const sx = Math.sin(ax);\r
  const cy = Math.cos(ay);\r
  const sy = Math.sin(ay);\r
  const forward = [cy, sy * sx, 0, 0, cx, 0, (sy * cx) / DEPTH, -sx / DEPTH, 1];\r
  return { forward, inverse: invert(forward) };\r
};\r
\r
const project = (m: Matrix, x: number, y: number) => {\r
  const w = m[6] * x + m[7] * y + m[8];\r
  return [(m[0] * x + m[1] * y + m[2]) / w, (m[3] * x + m[4] * y + m[5]) / w, w];\r
};\r
\r
const MagicRings = ({\r
  color = '#A855F7',\r
  colorTwo = '#6366F1',\r
  ringCount = 6,\r
  motion = 'pulse',\r
  speed = 1,\r
  lineThickness = 2,\r
  glow = 1,\r
  baseRadius = 0.35,\r
  radiusStep = 0.1,\r
  expansion = 0.1,\r
  taper = 1.5,\r
  rotation = 0,\r
  spin = 0,\r
  tilt = 0,\r
  dispersion = 0,\r
  grain = 0,\r
  opacity = 1,\r
  followMouse = false,\r
  mouseInfluence = 0.2,\r
  hoverScale = 1.2,\r
  hoverIntensity = 1,\r
  parallax = 0.05,\r
  clickBurst = true,\r
  intro = true,\r
  theme = 'dark',\r
  maxDevicePixelRatio = 2,\r
  className = '',\r
  style\r
}: MagicRingsProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const [generation, setGeneration] = useState(0);\r
\r
  const light = theme === 'light';\r
  const first = parseColor(color);\r
  const second = parseColor(colorTwo);\r
  const settings: Settings = {\r
    color: light ? first : first.map(toLinear),\r
    colorTwo: light ? second : second.map(toLinear),\r
    ringCount: clamp(Math.round(ringCount), 1, MAX_RINGS),\r
    motion: MOTIONS.includes(motion) ? motion : 'pulse',\r
    speed: Math.max(0, speed),\r
    lineThickness: Math.max(0.25, lineThickness),\r
    glow: clamp(glow, 0, 3),\r
    baseRadius: Math.max(0.01, baseRadius),\r
    radiusStep: Math.max(0, radiusStep),\r
    expansion,\r
    taper: Math.max(0.5, taper),\r
    rotation: (rotation * Math.PI) / 180,\r
    spin,\r
    tilt: clamp(tilt, -80, 80),\r
    dispersion: clamp(dispersion, 0, 1),\r
    grain: clamp(grain, 0, 1),\r
    opacity: clamp(opacity, 0, 1),\r
    followMouse,\r
    mouseInfluence,\r
    hoverScale: Math.max(0.5, hoverScale),\r
    hoverIntensity: Math.max(0, hoverIntensity),\r
    parallax,\r
    clickBurst,\r
    intro,\r
    light,\r
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
      powerPreference: 'default'\r
    });\r
    if (!gl) return;\r
    const programs = new Map<string, Program | null>();\r
    const programFor = (name: Pass, flags: string[]) => {\r
      const key = \`\${name}|\${flags.join(',')}\`;\r
      if (!programs.has(key)) {\r
        const vertex = shaderSource(name === 'line' ? STRIP : FULLSCREEN, flags);\r
        programs.set(key, link(gl, vertex, shaderSource(\`\${COMMON}\${FRAGMENTS[name]}\`, flags)));\r
      }\r
      return programs.get(key);\r
    };\r
    if (!programFor('glow', []) || !programFor('compose', []) || !programFor('line', [])) return;\r
\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
    const vao = gl.createVertexArray();\r
    const stripVao = gl.createVertexArray();\r
    const stripBuffer = gl.createBuffer();\r
    const strip = new Float32Array((SEGMENTS + 1) * 4);\r
    for (let index = 0; index <= SEGMENTS; index++) {\r
      strip.set([index / SEGMENTS, -1, index / SEGMENTS, 1], index * 4);\r
    }\r
    gl.bindVertexArray(stripVao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, stripBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, strip, gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    gl.bindVertexArray(null);\r
    const glowTexture = gl.createTexture();\r
    const glowBuffer = gl.createFramebuffer();\r
    const glowSize = { width: 0, height: 0 };\r
    let floatGlow = Boolean(gl.getExtension('EXT_color_buffer_float'));\r
    const shape = new Float32Array(SLOTS * 4);\r
    const frameData = new Float32Array(SLOTS * 4);\r
    const tints = new Float32Array(SLOTS * 4);\r
    const size = { width: 1, height: 1, ratio: 1, unit: 1 };\r
    const pointer = { x: 0, y: 0, inside: false, touch: false };\r
    const spring = { x: 0, y: 0, vx: 0, vy: 0, hover: 0, hoverVelocity: 0 };\r
    const bursts: Burst[] = [];\r
    let introLive = settingsRef.current.intro && settingsRef.current.speed > 0 && !reduced && generation === 0;\r
    let time = introLive ? 0 : 1.6;\r
    let clock = 0;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let pageVisible = document.visibilityState !== 'hidden';\r
    let lost = false;\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const rect = container.getBoundingClientRect();\r
      const ratio = Math.min(window.devicePixelRatio || 1, s.maxRatio);\r
      const width = Math.max(1, Math.round(rect.width * ratio));\r
      const height = Math.max(1, Math.round(rect.height * ratio));\r
      if (canvas.width !== width || canvas.height !== height) {\r
        canvas.width = width;\r
        canvas.height = height;\r
      }\r
      Object.assign(size, { width, height, ratio, unit: Math.max(1, Math.min(width, height)) });\r
      const glowWidth = Math.max(1, Math.ceil(width / 2));\r
      const glowHeight = Math.max(1, Math.ceil(height / 2));\r
      if (glowSize.width === glowWidth && glowSize.height === glowHeight) return;\r
      Object.assign(glowSize, { width: glowWidth, height: glowHeight });\r
      const allocate = (useFloat: boolean) => {\r
        gl.bindTexture(gl.TEXTURE_2D, glowTexture);\r
        gl.texImage2D(\r
          gl.TEXTURE_2D,\r
          0,\r
          useFloat ? gl.RGBA16F : gl.RGBA8,\r
          glowWidth,\r
          glowHeight,\r
          0,\r
          gl.RGBA,\r
          useFloat ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE,\r
          null\r
        );\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, glowBuffer);\r
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, glowTexture, 0);\r
        const complete = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
        return complete;\r
      };\r
      if (!allocate(floatGlow)) {\r
        floatGlow = false;\r
        allocate(false);\r
      }\r
    };\r
\r
    const ringState = (s: Settings, index: number, count: number): RingState => {\r
      const mix = count > 1 ? index / (count - 1) : 0;\r
      if (s.motion === 'ripple') {\r
        const span = count * s.radiusStep + s.expansion;\r
        const period = CYCLE * Math.max(1, count) * 0.32;\r
        const phase = time / period + index / count;\r
        const progress = phase - Math.floor(phase);\r
        const born = time - progress * period >= -1e-4 || !introLive;\r
        const life = born ? smoothstep(0, 0.12, progress) * (1 - smoothstep(0.62, 1, progress)) : 0;\r
        const position = progress * Math.max(1, count - 1);\r
        return { radius: s.baseRadius + progress * span, life, virtual: position, mix: progress, opening: 1 };\r
      }\r
      if (s.motion === 'breathe') {\r
        const wave = Math.sin((time / 4) * Math.PI * 2 - index * 0.55);\r
        const rise = introLive ? smoothstep(index * 0.12, index * 0.12 + 0.9, time) : 1;\r
        return {\r
          radius: s.baseRadius + index * s.radiusStep + s.expansion * 0.5 * (1 + wave),\r
          life: (0.78 + 0.22 * wave) * rise,\r
          virtual: index,\r
          mix,\r
          opening: 1\r
        };\r
      }\r
      const local = time - index * STAGGER;\r
      const t = ((local % CYCLE) + CYCLE) % CYCLE;\r
      const life = introLive && local < 0 ? 0 : pulseLife(t);\r
      return {\r
        radius: s.baseRadius + index * s.radiusStep + (1 - Math.pow(1 - t / CYCLE, 2)) * s.expansion,\r
        life,\r
        virtual: index,\r
        mix,\r
        opening: introLive && local < CYCLE ? smoothstep(0, 0.9, local) : 1\r
      };\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const count = s.ringCount;\r
      const hover = spring.hover;\r
      const still = reduced ? 0 : 1;\r
      const scale = 1 + (s.hoverScale - 1) * hover * still;\r
      const mouseX = spring.x * still;\r
      const mouseY = spring.y * still;\r
      const leanX = s.tilt - mouseY * s.parallax * 260;\r
      const leanY = mouseX * s.parallax * 260;\r
      const view = planeFor(leanX, leanY);\r
      const center = s.followMouse ? [mouseX * s.mouseInfluence, mouseY * s.mouseInfluence] : [0, 0];\r
      const spinBase = s.spin * time * 0.6;\r
\r
      let slots = 0;\r
      let lowest = Infinity;\r
      let highest = 0;\r
      let shiftMax = 0;\r
      const place = (\r
        radius: number,\r
        life: number,\r
        cut: number,\r
        angle: number,\r
        shiftX: number,\r
        shiftY: number,\r
        mix: number,\r
        width: number\r
      ) => {\r
        if (life <= 0.002) return;\r
        const gain = 10 * radius * cut * cut * cut;\r
        shape.set([radius, life, gain, gain > 6.2 ? Math.cbrt(6.2 / gain) : 2], slots * 4);\r
        frameData.set([shiftX, shiftY, Math.cos(angle), Math.sin(angle)], slots * 4);\r
        tints.set(\r
          [\r
            s.color[0] + (s.colorTwo[0] - s.color[0]) * mix,\r
            s.color[1] + (s.colorTwo[1] - s.color[1]) * mix,\r
            s.color[2] + (s.colorTwo[2] - s.color[2]) * mix,\r
            width\r
          ],\r
          slots * 4\r
        );\r
        lowest = Math.min(lowest, radius);\r
        highest = Math.max(highest, radius);\r
        shiftMax = Math.max(shiftMax, Math.hypot(shiftX, shiftY));\r
        slots++;\r
      };\r
\r
      for (let index = 0; index < count; index++) {\r
        const state = ringState(s, index, count);\r
        let radius = state.radius * scale;\r
        let life = state.life;\r
        for (const burst of bursts) {\r
          const age = clock - burst.start;\r
          const wave = (burst.radius + age * BURST_SPEED) * scale;\r
          const fade = Math.pow(Math.max(0, 1 - age / BURST_LIFE), 1.5);\r
          const gap = (wave - radius) / 0.08;\r
          radius += 0.04 * Math.exp(-gap * gap) * fade;\r
          life = Math.min(1.6, life + 0.9 * Math.exp(-gap * gap * 1.6) * fade);\r
        }\r
        const cut = Math.pow(s.taper, state.virtual) / Math.max(0.08, state.opening);\r
        const angle = s.rotation + spinBase * (index % 2 ? -1 : 1) * (1 + index * 0.15);\r
        place(radius, life, cut, angle, index * s.parallax * mouseX, index * s.parallax * mouseY, state.mix, 1);\r
      }\r
      for (const burst of bursts) {\r
        const age = clock - burst.start;\r
        const fade = Math.pow(Math.max(0, 1 - age / BURST_LIFE), 1.5);\r
        const radius = (burst.radius + age * BURST_SPEED) * scale;\r
        place(radius, 1.5 * fade, 0.85, s.rotation, 0, 0, clamp(age / BURST_LIFE, 0, 1), 1.15);\r
      }\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      if (!slots) return;\r
\r
      const flags: string[] = [];\r
      if (s.light) flags.push('LIGHT');\r
      if (s.dispersion > 0) flags.push('PRISM');\r
      if (!floatGlow) flags.push('PACKED');\r
      const glowProgram = programFor('glow', flags);\r
      const composeProgram = programFor('compose', flags);\r
      const lineProgram = programFor('line', flags);\r
      if (!glowProgram || !composeProgram || !lineProgram) return;\r
\r
      const glowScale = (s.light ? 0.3 : 1) * (1 - s.dispersion * 0.45);\r
      const outer = 0.012 + 0.033 * s.glow;\r
      const innerAmount = 0.5 * Math.min(1, s.glow) * glowScale;\r
      const outerAmount = 0.9 * s.glow * glowScale;\r
      const range = outer * 4.5 + 0.008;\r
      const split = s.dispersion * 0.03;\r
      const margin = range + split * highest + shiftMax + 0.01;\r
      const width = s.lineThickness * size.ratio;\r
      const reach = width * (1 + 0.45 * s.hoverIntensity) * 1.15 + 1.5;\r
      const cursor = project(view.inverse, pointer.x, pointer.y);\r
\r
      const shared = (program: Program) => {\r
        const u = program.uniforms;\r
        gl.useProgram(program.program);\r
        gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
        gl.uniform1f(u.uUnit, size.unit);\r
        gl.uniform2f(u.uCenter, center[0], center[1]);\r
        gl.uniform1i(u.uCount, slots);\r
        gl.uniform4fv(u.uShape, shape);\r
        gl.uniform4fv(u.uFrame, frameData);\r
        gl.uniform4fv(u.uTint, tints);\r
        gl.uniform4f(u.uHover, cursor[0] - center[0], cursor[1] - center[1], hover * s.hoverIntensity, 1 / 0.03);\r
        gl.uniform1f(u.uSplit, split);\r
        gl.uniform1f(u.uOpacity, s.opacity);\r
        return u;\r
      };\r
\r
      gl.bindVertexArray(vao);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, glowBuffer);\r
      gl.viewport(0, 0, glowSize.width, glowSize.height);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      const glowUniforms = shared(glowProgram);\r
      gl.uniform2f(glowUniforms.uScale, canvas.width / glowSize.width, canvas.height / glowSize.height);\r
      gl.uniformMatrix3fv(glowUniforms.uInverse, true, view.inverse);\r
      gl.uniform2f(glowUniforms.uBounds, Math.max(0, lowest - margin), highest + margin);\r
      gl.uniform4f(glowUniforms.uHalo, 0, 1 / outer, innerAmount, outerAmount);\r
      gl.uniform3f(glowUniforms.uRange, range * 0.45, 1 / (range * 0.55), range);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      const composeUniforms = shared(composeProgram);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, glowTexture);\r
      gl.uniform1i(composeUniforms.uGlow, 0);\r
      gl.uniform1f(composeUniforms.uGrain, s.grain);\r
      gl.uniform1f(composeUniforms.uTime, clock);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      const lineUniforms = shared(lineProgram);\r
      gl.uniformMatrix3fv(lineUniforms.uForward, true, view.forward);\r
      gl.uniform1f(lineUniforms.uReach, reach);\r
      gl.uniform1f(lineUniforms.uWidth, width);\r
      gl.enable(gl.BLEND);\r
      if (s.light) gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      else gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_COLOR, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      gl.bindVertexArray(stripVao);\r
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, (SEGMENTS + 1) * 2, slots);\r
      gl.disable(gl.BLEND);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (lost) return;\r
      const s = settingsRef.current;\r
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05);\r
      last = Math.max(last, now);\r
      clock += dt;\r
      if (!reduced) time += dt * s.speed;\r
\r
      const targetX = pointer.inside ? pointer.x / Math.max(1e-6, size.width / size.unit) : 0;\r
      const targetY = pointer.inside ? pointer.y / Math.max(1e-6, size.height / size.unit) : 0;\r
      const stiffness = 70;\r
      const damping = 2 * Math.sqrt(stiffness) * 0.9;\r
      const steps = Math.max(1, Math.ceil(dt / (1 / 240)));\r
      const h = dt / steps;\r
      for (let step = 0; step < steps; step++) {\r
        spring.vx += (stiffness * (targetX - spring.x) - damping * spring.vx) * h;\r
        spring.vy += (stiffness * (targetY - spring.y) - damping * spring.vy) * h;\r
        spring.x += spring.vx * h;\r
        spring.y += spring.vy * h;\r
        const hoverTarget = pointer.inside ? 1 : 0;\r
        spring.hoverVelocity += (40 * (hoverTarget - spring.hover) - 2 * Math.sqrt(40) * spring.hoverVelocity) * h;\r
        spring.hover += spring.hoverVelocity * h;\r
      }\r
\r
      for (let index = bursts.length - 1; index >= 0; index--) {\r
        if (clock - bursts[index].start > BURST_LIFE) bursts.splice(index, 1);\r
      }\r
      if (introLive && time > (s.ringCount + 2) * STAGGER + CYCLE) introLive = false;\r
\r
      render();\r
\r
      const settling =\r
        Math.abs(spring.vx) + Math.abs(spring.vy) + Math.abs(spring.hoverVelocity) > 1e-4 ||\r
        Math.abs((pointer.inside ? 1 : 0) - spring.hover) > 1e-3;\r
      const busy = (s.speed > 0 && !reduced) || settling || bursts.length > 0 || introLive;\r
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
      const inside =\r
        event.clientX >= rect.left &&\r
        event.clientX <= rect.right &&\r
        event.clientY >= rect.top &&\r
        event.clientY <= rect.bottom;\r
      const unit = Math.max(1, Math.min(rect.width, rect.height));\r
      return {\r
        x: (event.clientX - rect.left - rect.width / 2) / unit,\r
        y: (rect.top + rect.height / 2 - event.clientY) / unit,\r
        inside\r
      };\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      if (event.pointerType === 'touch' && !pointer.touch) return;\r
      const spot = locate(event);\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = spot.inside;\r
      wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const spot = locate(event);\r
      if (!spot.inside) return;\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = true;\r
      pointer.touch = event.pointerType === 'touch';\r
      const s = settingsRef.current;\r
      if (s.clickBurst && !reduced) {\r
        bursts.push({ start: clock, radius: Math.max(0.04, s.baseRadius * 0.45) });\r
        if (bursts.length > MAX_BURSTS) bursts.shift();\r
      }\r
      wake();\r
    };\r
\r
    const onPointerUp = (event: PointerEvent) => {\r
      if (event.pointerType !== 'touch') return;\r
      pointer.touch = false;\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
    const onLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
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
        gl.deleteVertexArray(vao);\r
        gl.deleteTexture(glowTexture);\r
        gl.deleteFramebuffer(glowBuffer);\r
        programs.forEach(entry => entry && gl.deleteProgram(entry.program));\r
        gl.deleteVertexArray(stripVao);\r
        gl.deleteBuffer(stripBuffer);\r
      }\r
    };\r
  }, [generation]);\r
\r
  return (\r
    <div ref={containerRef} className={\`relative h-full w-full overflow-hidden \${className}\`.trim()} style={style}>\r
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default MagicRings;\r
`,a={usage:`import MagicRings from './MagicRings';

<div style={{ width: '100%', height: '500px', position: 'relative' }}>
  <MagicRings
    color="#A855F7"
    colorTwo="#6366F1"
    motion="pulse"
    ringCount={6}
    speed={1}
    lineThickness={2}
    glow={1}
    hoverScale={1.2}
    clickBurst={true}
  />
</div>`,code:n,css:r,tailwind:e,tsCode:t,tsTailwind:o};export{a as magicRings};
