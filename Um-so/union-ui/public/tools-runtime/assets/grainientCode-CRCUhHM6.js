const n=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
import './Grainient.css';\r
\r
const MAX_COLORS = 8;\r
const MAX_STIRS = 24;\r
const MAX_TWIRLS = 4;\r
const STIR_LIFE = 1.3;\r
const STIR_STEP = 0.06;\r
const TWIRL_LIFE = 2.6;\r
const INTRO_SECONDS = 1.6;\r
const DEFAULT_COLORS = ['#120f17', '#2a0f0a', '#9a3412', '#f97316', '#fed7aa'];\r
const TYPES = { linear: 0, radial: 1 };\r
const LIFT = 0.2;\r
\r
const VERTEX = \`#version 300 es\r
out vec2 vUv;\r
void main() {\r
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\r
  vUv = p;\r
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const FIELD = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform float uAspect;\r
uniform float uTime;\r
uniform vec3 uRamp[8];\r
uniform int uCount;\r
uniform int uType;\r
uniform vec2 uDir;\r
uniform float uExtent;\r
uniform float uBands;\r
uniform float uSoftness;\r
uniform float uFlow;\r
uniform float uScale;\r
uniform float uSilk;\r
uniform vec4 uStir[24];\r
uniform float uStirWeight[24];\r
uniform vec4 uTwirl[4];\r
uniform vec2 uSeed;\r
uniform float uContrast;\r
uniform float uSaturation;\r
uniform float uSettle;\r
uniform float uReveal;\r
in vec2 vUv;\r
out vec4 outColor;\r
\r
vec2 hash2(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.103, 0.0973));\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.xx + q.yz) * q.zy) * 2.0 - 1.0;\r
}\r
\r
float noise(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = fract(p);\r
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);\r
  float a = dot(hash2(i), f);\r
  float b = dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));\r
  float c = dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));\r
  float d = dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));\r
  return 0.5 + 0.5 * mix(mix(a, b, u.x), mix(c, d, u.x), u.y);\r
}\r
\r
vec2 drift(vec2 p, float t) {\r
  vec2 w1 = vec2(\r
    noise(p * 0.85 + vec2(t * 0.11, t * 0.07)),\r
    noise(p * 0.85 + vec2(4.1, 1.7) - vec2(t * 0.08, t * 0.12))\r
  );\r
  vec2 w2 = vec2(\r
    noise(p * 1.55 + w1 * 1.8 + vec2(1.3, 7.1) + t * 0.05),\r
    noise(p * 1.55 + w1 * 1.8 + vec2(6.4, 2.2) - t * 0.06)\r
  );\r
  return (w1 - 0.5) * 1.1 + (w2 - 0.5) * 0.55;\r
}\r
\r
vec2 warp(vec2 p) {\r
  vec2 q = p / uScale;\r
  if (uType == 1) {\r
    float turn = uTime * 0.35;\r
    q = mat2(cos(turn), sin(turn), -sin(turn), cos(turn)) * q;\r
  } else {\r
    q += vec2(-uDir.y, uDir.x) * uTime * 0.45;\r
  }\r
  return p + drift(q + uSeed, uTime) * uFlow * uScale * uSettle;\r
}\r
\r
float coord(vec2 p) {\r
  vec2 w = warp(p);\r
  return uType == 1 ? 1.0 - length(w) * 1.1 : dot(w, uDir) / uExtent + 0.5;\r
}\r
\r
vec3 labToRgb(vec3 lab) {\r
  float l = lab.x + 0.3963377774 * lab.y + 0.2158037573 * lab.z;\r
  float m = lab.x - 0.1055613458 * lab.y - 0.0638541728 * lab.z;\r
  float s = lab.x - 0.0894841775 * lab.y - 1.2914855480 * lab.z;\r
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
vec3 encode(vec3 c) {\r
  c = clamp(c, 0.0, 1.0);\r
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));\r
}\r
\r
void main() {\r
  vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);\r
  for (int i = 0; i < 24; i++) {\r
    float w = uStirWeight[i];\r
    if (w <= 0.0) continue;\r
    vec2 d = p - uStir[i].xy;\r
    p -= uStir[i].zw * w * exp(-dot(d, d) / 0.045);\r
  }\r
  for (int i = 0; i < 4; i++) {\r
    float angle = uTwirl[i].z;\r
    if (angle == 0.0) continue;\r
    vec2 d = p - uTwirl[i].xy;\r
    float a = angle * exp(-dot(d, d) / (uTwirl[i].w * uTwirl[i].w));\r
    float c = cos(a);\r
    float s = sin(a);\r
    p = uTwirl[i].xy + mat2(c, -s, s, c) * d;\r
  }\r
  float raw = coord(p);\r
  float s = raw;\r
  if (uBands > 1.0) {\r
    s *= uBands;\r
    float cycle = floor(s);\r
    s = fract(s);\r
    if (mod(cycle, 2.0) > 0.5) s = 1.0 - s;\r
  }\r
  s = clamp(s, 0.0, 1.0);\r
  float scaled = s * float(uCount - 1);\r
  int index = int(min(floor(scaled), float(uCount - 2)));\r
  float f = scaled - float(index);\r
  float edge = max(uSoftness * 0.5, fwidth(scaled) * 0.75);\r
  float shaped = smoothstep(0.5 - edge, 0.5 + edge, f);\r
  vec3 from = uRamp[0];\r
  vec3 to = uRamp[1];\r
  for (int i = 0; i < 7; i++) {\r
    if (i == index) {\r
      from = uRamp[i];\r
      to = uRamp[i + 1];\r
    }\r
  }\r
  vec3 lab = mix(from, to, shaped);\r
  if (uSilk > 0.0) {\r
    vec2 grad = vec2(coord(p + vec2(0.004, 0.0)) - raw, coord(p + vec2(0.0, 0.004)) - raw) / 0.004;\r
    vec2 slope = grad * sin(3.14159265 * clamp(raw, 0.0, 1.0) * uBands) * uSilk * 4.0;\r
    vec3 normal = normalize(vec3(-slope, 1.0));\r
    vec3 light = normalize(vec3(-uDir.y, uDir.x, 1.2));\r
    float diffuse = dot(normal, light) - light.z;\r
    lab = uRamp[0] + (lab - uRamp[0]) * (1.0 + (diffuse * 0.35 + max(diffuse, 0.0) * diffuse * 0.6) * uSilk);\r
  }\r
  lab = mix(uRamp[0], lab, smoothstep(0.0, 1.0, uReveal * 1.5 - length(vUv - 0.5) * 0.6));\r
  lab.x = (lab.x - 0.55) * uContrast + 0.55;\r
  lab.yz *= uSaturation;\r
  outColor = vec4(encode(labToRgb(lab)), 1.0);\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uField;\r
uniform float uGrain;\r
uniform float uGrainSize;\r
uniform float uFrame;\r
in vec2 vUv;\r
out vec4 outColor;\r
\r
float hash(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * 0.1031);\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.x + q.y) * q.z);\r
}\r
\r
float clump(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = fract(p);\r
  vec2 u = f * f * (3.0 - 2.0 * f);\r
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);\r
}\r
\r
void main() {\r
  vec3 color = texture(uField, vUv).rgb;\r
  vec2 pixel = gl_FragCoord.xy + uFrame * vec2(17.0, 59.0);\r
  float fine = hash(pixel) + hash(pixel + 7.13) - 1.0;\r
  float coarse = (clump(pixel / max(uGrainSize, 1.0)) - 0.5) * 2.0;\r
  float grain = mix(fine, coarse, clamp(uGrainSize - 1.0, 0.0, 1.0) * 0.8);\r
  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));\r
  color += grain * uGrain * (0.45 + 2.2 * luma * (1.0 - luma));\r
  outColor = vec4(clamp(color, 0.0, 1.0), 1.0);\r
}\`;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const toLinear = value => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);\r
\r
const toLab = ([r, g, b]) => {\r
  const lr = toLinear(r);\r
  const lg = toLinear(g);\r
  const lb = toLinear(b);\r
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);\r
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);\r
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);\r
  return [\r
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,\r
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,\r
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s\r
  ];\r
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
const link = (gl, fragmentSource) => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);\r
  const program = gl.createProgram();\r
  if (!vertex || !fragment || !program) return null;\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
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
    if (!info) continue;\r
    const name = info.name.replace(/\\[0\\]$/, '');\r
    uniforms[name] = gl.getUniformLocation(program, name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const Grainient = ({\r
  colors = DEFAULT_COLORS,\r
  type = 'linear',\r
  angle = 55,\r
  bands = 1,\r
  speed = 1,\r
  flow = 0.8,\r
  scale = 1,\r
  softness = 1,\r
  silk = 0.35,\r
  grainAmount = 0.08,\r
  grainSize = 1.2,\r
  grainAnimated = true,\r
  contrast = 1,\r
  saturation = 1,\r
  variation = 0,\r
  interactive = true,\r
  stir = 1,\r
  clickSwirl = true,\r
  intro = true,\r
  lightMode = false,\r
  dpr,\r
  className = '',\r
  style,\r
  ...rest\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const palette = (Array.isArray(colors) && colors.length ? colors : DEFAULT_COLORS).slice(0, MAX_COLORS);\r
  const settings = {\r
    colors: palette.length > 1 ? palette : [palette[0], palette[0]],\r
    type: TYPES[type] ?? 0,\r
    angle,\r
    bands: clamp(bands, 1, 8),\r
    speed: Math.max(0, speed),\r
    flow: clamp(flow, 0, 3),\r
    scale: clamp(scale, 0.25, 3),\r
    softness: clamp(softness, 0, 1),\r
    silk: clamp(silk, 0, 1),\r
    grainAmount: clamp(grainAmount, 0, 0.5),\r
    grainSize: clamp(grainSize, 0.5, 4),\r
    grainAnimated,\r
    contrast: clamp(contrast, 0.2, 2),\r
    saturation: clamp(saturation, 0, 2),\r
    variation: Math.max(0, variation),\r
    interactive,\r
    stir: clamp(stir, 0, 2),\r
    clickSwirl,\r
    intro,\r
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
      alpha: false,\r
      antialias: false,\r
      depth: false,\r
      stencil: false\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const field = link(gl, FIELD);\r
    const composite = link(gl, COMPOSITE);\r
    if (!field || !composite) return undefined;\r
    const fu = field.uniforms;\r
    const cu = composite.uniforms;\r
    const vao = gl.createVertexArray();\r
    const target = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, target);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    const buffer = gl.createFramebuffer();\r
    const fieldSize = { width: 0, height: 0 };\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const colorCache = new Map();\r
    const parse = value => {\r
      const key = String(value);\r
      const cached = colorCache.get(key);\r
      if (cached) return cached;\r
      let rgb = [0, 0, 0];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#000000';\r
        probe.fillStyle = key;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      colorCache.set(key, rgb);\r
      return rgb;\r
    };\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1, ratio: 1 };\r
    const ramp = new Float32Array(MAX_COLORS * 3);\r
    const stirs = new Float32Array(MAX_STIRS * 4);\r
    const stirWeights = new Float32Array(MAX_STIRS);\r
    const twirls = new Float32Array(MAX_TWIRLS * 4);\r
    const trail = [];\r
    const spins = [];\r
    const pointer = { x: 0.5, y: 0.5, sx: 0.5, sy: 0.5, vx: 0, inside: false, fresh: true };\r
    let paletteKey = '';\r
    let time = 0;\r
    let introClock = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let frameSeed = 0;\r
    let grainClock = 0;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const syncPalette = () => {\r
      const s = settingsRef.current;\r
      const key = \`\${s.colors.join(',')}|\${s.lightMode}\`;\r
      if (key === paletteKey) return;\r
      paletteKey = key;\r
      const labs = s.colors.map(color => toLab(parse(color)));\r
      if (!s.lightMode) {\r
        labs.forEach((lab, i) => ramp.set(lab, i * 3));\r
      } else {\r
        const blank = labs.map(([L]) => Math.abs(L - labs[0][0]) < 0.1);\r
        const tints = labs.filter((_, i) => !blank[i]).reverse();\r
        labs.forEach((_, i) => {\r
          const [L, a, b] = blank[i] ? [1, 0, 0] : tints.shift();\r
          ramp.set([L + (1 - L) * LIFT, a * (1 - LIFT), b * (1 - LIFT)], i * 3);\r
        });\r
      }\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      const aspect = view.width / view.height;\r
      syncPalette();\r
      gl.bindVertexArray(vao);\r
      gl.disable(gl.BLEND);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);\r
      gl.viewport(0, 0, fieldSize.width, fieldSize.height);\r
      gl.useProgram(field.program);\r
      gl.uniform1f(fu.uAspect, aspect);\r
      gl.uniform1f(fu.uTime, time);\r
      gl.uniform3fv(fu.uRamp, ramp);\r
      gl.uniform1i(fu.uCount, s.colors.length);\r
      const radians = (s.angle * Math.PI) / 180;\r
      gl.uniform1i(fu.uType, s.type);\r
      gl.uniform2f(fu.uDir, Math.sin(radians), Math.cos(radians));\r
      gl.uniform1f(fu.uExtent, aspect * Math.abs(Math.sin(radians)) + Math.abs(Math.cos(radians)));\r
      gl.uniform1f(fu.uBands, s.bands);\r
      gl.uniform1f(fu.uSoftness, s.softness);\r
      gl.uniform1f(fu.uFlow, s.flow);\r
      gl.uniform1f(fu.uScale, s.scale);\r
      gl.uniform1f(fu.uSilk, s.silk);\r
      gl.uniform4fv(fu.uStir, stirs);\r
      gl.uniform1fv(fu.uStirWeight, stirWeights);\r
      gl.uniform4fv(fu.uTwirl, twirls);\r
      gl.uniform2f(fu.uSeed, s.variation * 3.17, s.variation * 1.91);\r
      gl.uniform1f(fu.uContrast, s.contrast);\r
      gl.uniform1f(fu.uSaturation, s.saturation);\r
      gl.uniform1f(fu.uSettle, introClock * introClock * (3 - 2 * introClock));\r
      gl.uniform1f(fu.uReveal, introClock);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(composite.program);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, target);\r
      gl.uniform1i(cu.uField, 0);\r
      gl.uniform1f(cu.uGrain, s.grainAmount);\r
      gl.uniform1f(cu.uGrainSize, s.grainSize * view.ratio);\r
      gl.uniform1f(cu.uFrame, frameSeed);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      view.width = Math.max(1, container.clientWidth);\r
      view.height = Math.max(1, container.clientHeight);\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(view.width * view.ratio));\r
      canvas.height = Math.max(1, Math.round(view.height * view.ratio));\r
      const width = Math.max(1, Math.round(canvas.width / 2));\r
      const height = Math.max(1, Math.round(canvas.height / 2));\r
      if (width !== fieldSize.width || height !== fieldSize.height) {\r
        fieldSize.width = width;\r
        fieldSize.height = height;\r
        gl.bindTexture(gl.TEXTURE_2D, target);\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);\r
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target, 0);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      }\r
      draw();\r
      wake();\r
    };\r
\r
    const updateTouches = (dt, aspect) => {\r
      const s = settingsRef.current;\r
      const follow = 1 - Math.exp(-dt / 0.06);\r
      const px = pointer.sx;\r
      const py = pointer.sy;\r
      pointer.sx += (pointer.x - pointer.sx) * follow;\r
      pointer.sy += (pointer.y - pointer.sy) * follow;\r
      const vx = ((pointer.sx - px) / dt) * aspect;\r
      const vy = (pointer.sy - py) / dt;\r
      pointer.vx = vx;\r
      const head = trail[0];\r
      trail.forEach(sample => {\r
        if (sample.done) sample.age += dt;\r
      });\r
      if (s.interactive && pointer.inside && Math.hypot(vx, vy) > 0.02 && !reduce) {\r
        if (!head || head.done) {\r
          trail.unshift({ x: 0, y: 0, vx: 0, vy: 0, age: 0, grow: 0, done: false });\r
          if (trail.length > MAX_STIRS) trail.pop();\r
        }\r
        const live = trail[0];\r
        live.x = (pointer.sx - 0.5) * aspect;\r
        live.y = pointer.sy - 0.5;\r
        live.vx = vx;\r
        live.vy = vy;\r
        live.grow = Math.min(1, live.grow + dt / STIR_STEP);\r
        live.done = live.grow >= 1;\r
      } else if (head) {\r
        head.done = true;\r
      }\r
      while (trail.length && trail[trail.length - 1].age > STIR_LIFE) trail.pop();\r
      for (let i = 0; i < MAX_STIRS; i++) {\r
        const sample = trail[i];\r
        if (!sample) {\r
          stirWeights[i] = 0;\r
          continue;\r
        }\r
        const fade = 1 - sample.age / STIR_LIFE;\r
        const cap = Math.min(1, 2.2 / Math.max(Math.hypot(sample.vx, sample.vy), 0.001));\r
        stirs.set([sample.x, sample.y, sample.vx * cap, sample.vy * cap], i * 4);\r
        stirWeights[i] = fade * fade * sample.grow * s.stir * 0.05;\r
      }\r
      spins.forEach(spin => {\r
        spin.age += dt;\r
      });\r
      while (spins.length && spins[spins.length - 1].age > TWIRL_LIFE) spins.pop();\r
      for (let i = 0; i < MAX_TWIRLS; i++) {\r
        const spin = spins[i];\r
        if (!spin) {\r
          twirls[i * 4 + 2] = 0;\r
          continue;\r
        }\r
        const k = spin.age / TWIRL_LIFE;\r
        const envelope = Math.min(1, spin.age / 0.18) * (1 - k) * (1 - k);\r
        twirls.set([spin.x, spin.y, spin.direction * 2.4 * envelope, 0.16 + 0.1 * Math.min(1, spin.age / 0.5)], i * 4);\r
      }\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.001, 0.05) : 1 / 60;\r
      last = now;\r
      if (!reduce) time += dt * s.speed * 0.16;\r
      if (introClock < 1) introClock = Math.min(1, introClock + dt / INTRO_SECONDS);\r
      grainClock += dt;\r
      if (s.grainAnimated && !reduce && grainClock > 1 / 24) {\r
        grainClock = 0;\r
        frameSeed = (frameSeed + 1) % 97;\r
      }\r
      updateTouches(dt, view.width / view.height);\r
      draw();\r
      const busy =\r
        (!reduce && (s.speed > 0 || s.grainAnimated)) || introClock < 1 || trail.length > 0 || spins.length > 0;\r
      if (busy) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    function wake() {\r
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    }\r
\r
    const locate = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = (event.clientX - rect.left) / Math.max(1, rect.width);\r
      const y = 1 - (event.clientY - rect.top) / Math.max(1, rect.height);\r
      pointer.inside = x >= 0 && x <= 1 && y >= 0 && y <= 1;\r
      pointer.x = x;\r
      pointer.y = y;\r
      if (pointer.fresh || !pointer.inside) {\r
        pointer.sx = x;\r
        pointer.sy = y;\r
        pointer.fresh = false;\r
      }\r
    };\r
\r
    const onPointerMove = event => {\r
      locate(event);\r
      if (pointer.inside || trail.length) wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      locate(event);\r
      const s = settingsRef.current;\r
      if (!pointer.inside || !s.clickSwirl || reduce) return;\r
      spins.unshift({\r
        x: (pointer.x - 0.5) * (view.width / view.height),\r
        y: pointer.y - 0.5,\r
        age: 0,\r
        direction: pointer.vx < 0 ? 1 : -1\r
      });\r
      if (spins.length > MAX_TWIRLS) spins.pop();\r
      wake();\r
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
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
    wakeRef.current = wake;\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteTexture(target);\r
      gl.deleteFramebuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(field.program);\r
      gl.deleteProgram(composite.program);\r
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
      className={\`grainient-container\${className ? \` \${className}\` : ''}\`}\r
      style={style}\r
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className="grainient-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Grainient;\r
`,r=`.grainient-container {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.grainient-canvas {\r
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
const MAX_COLORS = 8;\r
const MAX_STIRS = 24;\r
const MAX_TWIRLS = 4;\r
const STIR_LIFE = 1.3;\r
const STIR_STEP = 0.06;\r
const TWIRL_LIFE = 2.6;\r
const INTRO_SECONDS = 1.6;\r
const DEFAULT_COLORS = ['#120f17', '#2a0f0a', '#9a3412', '#f97316', '#fed7aa'];\r
const TYPES = { linear: 0, radial: 1 };\r
const LIFT = 0.2;\r
\r
const VERTEX = \`#version 300 es\r
out vec2 vUv;\r
void main() {\r
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\r
  vUv = p;\r
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const FIELD = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform float uAspect;\r
uniform float uTime;\r
uniform vec3 uRamp[8];\r
uniform int uCount;\r
uniform int uType;\r
uniform vec2 uDir;\r
uniform float uExtent;\r
uniform float uBands;\r
uniform float uSoftness;\r
uniform float uFlow;\r
uniform float uScale;\r
uniform float uSilk;\r
uniform vec4 uStir[24];\r
uniform float uStirWeight[24];\r
uniform vec4 uTwirl[4];\r
uniform vec2 uSeed;\r
uniform float uContrast;\r
uniform float uSaturation;\r
uniform float uSettle;\r
uniform float uReveal;\r
in vec2 vUv;\r
out vec4 outColor;\r
\r
vec2 hash2(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.103, 0.0973));\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.xx + q.yz) * q.zy) * 2.0 - 1.0;\r
}\r
\r
float noise(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = fract(p);\r
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);\r
  float a = dot(hash2(i), f);\r
  float b = dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));\r
  float c = dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));\r
  float d = dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));\r
  return 0.5 + 0.5 * mix(mix(a, b, u.x), mix(c, d, u.x), u.y);\r
}\r
\r
vec2 drift(vec2 p, float t) {\r
  vec2 w1 = vec2(\r
    noise(p * 0.85 + vec2(t * 0.11, t * 0.07)),\r
    noise(p * 0.85 + vec2(4.1, 1.7) - vec2(t * 0.08, t * 0.12))\r
  );\r
  vec2 w2 = vec2(\r
    noise(p * 1.55 + w1 * 1.8 + vec2(1.3, 7.1) + t * 0.05),\r
    noise(p * 1.55 + w1 * 1.8 + vec2(6.4, 2.2) - t * 0.06)\r
  );\r
  return (w1 - 0.5) * 1.1 + (w2 - 0.5) * 0.55;\r
}\r
\r
vec2 warp(vec2 p) {\r
  vec2 q = p / uScale;\r
  if (uType == 1) {\r
    float turn = uTime * 0.35;\r
    q = mat2(cos(turn), sin(turn), -sin(turn), cos(turn)) * q;\r
  } else {\r
    q += vec2(-uDir.y, uDir.x) * uTime * 0.45;\r
  }\r
  return p + drift(q + uSeed, uTime) * uFlow * uScale * uSettle;\r
}\r
\r
float coord(vec2 p) {\r
  vec2 w = warp(p);\r
  return uType == 1 ? 1.0 - length(w) * 1.1 : dot(w, uDir) / uExtent + 0.5;\r
}\r
\r
vec3 labToRgb(vec3 lab) {\r
  float l = lab.x + 0.3963377774 * lab.y + 0.2158037573 * lab.z;\r
  float m = lab.x - 0.1055613458 * lab.y - 0.0638541728 * lab.z;\r
  float s = lab.x - 0.0894841775 * lab.y - 1.2914855480 * lab.z;\r
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
vec3 encode(vec3 c) {\r
  c = clamp(c, 0.0, 1.0);\r
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));\r
}\r
\r
void main() {\r
  vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);\r
  for (int i = 0; i < 24; i++) {\r
    float w = uStirWeight[i];\r
    if (w <= 0.0) continue;\r
    vec2 d = p - uStir[i].xy;\r
    p -= uStir[i].zw * w * exp(-dot(d, d) / 0.045);\r
  }\r
  for (int i = 0; i < 4; i++) {\r
    float angle = uTwirl[i].z;\r
    if (angle == 0.0) continue;\r
    vec2 d = p - uTwirl[i].xy;\r
    float a = angle * exp(-dot(d, d) / (uTwirl[i].w * uTwirl[i].w));\r
    float c = cos(a);\r
    float s = sin(a);\r
    p = uTwirl[i].xy + mat2(c, -s, s, c) * d;\r
  }\r
  float raw = coord(p);\r
  float s = raw;\r
  if (uBands > 1.0) {\r
    s *= uBands;\r
    float cycle = floor(s);\r
    s = fract(s);\r
    if (mod(cycle, 2.0) > 0.5) s = 1.0 - s;\r
  }\r
  s = clamp(s, 0.0, 1.0);\r
  float scaled = s * float(uCount - 1);\r
  int index = int(min(floor(scaled), float(uCount - 2)));\r
  float f = scaled - float(index);\r
  float edge = max(uSoftness * 0.5, fwidth(scaled) * 0.75);\r
  float shaped = smoothstep(0.5 - edge, 0.5 + edge, f);\r
  vec3 from = uRamp[0];\r
  vec3 to = uRamp[1];\r
  for (int i = 0; i < 7; i++) {\r
    if (i == index) {\r
      from = uRamp[i];\r
      to = uRamp[i + 1];\r
    }\r
  }\r
  vec3 lab = mix(from, to, shaped);\r
  if (uSilk > 0.0) {\r
    vec2 grad = vec2(coord(p + vec2(0.004, 0.0)) - raw, coord(p + vec2(0.0, 0.004)) - raw) / 0.004;\r
    vec2 slope = grad * sin(3.14159265 * clamp(raw, 0.0, 1.0) * uBands) * uSilk * 4.0;\r
    vec3 normal = normalize(vec3(-slope, 1.0));\r
    vec3 light = normalize(vec3(-uDir.y, uDir.x, 1.2));\r
    float diffuse = dot(normal, light) - light.z;\r
    lab = uRamp[0] + (lab - uRamp[0]) * (1.0 + (diffuse * 0.35 + max(diffuse, 0.0) * diffuse * 0.6) * uSilk);\r
  }\r
  lab = mix(uRamp[0], lab, smoothstep(0.0, 1.0, uReveal * 1.5 - length(vUv - 0.5) * 0.6));\r
  lab.x = (lab.x - 0.55) * uContrast + 0.55;\r
  lab.yz *= uSaturation;\r
  outColor = vec4(encode(labToRgb(lab)), 1.0);\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uField;\r
uniform float uGrain;\r
uniform float uGrainSize;\r
uniform float uFrame;\r
in vec2 vUv;\r
out vec4 outColor;\r
\r
float hash(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * 0.1031);\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.x + q.y) * q.z);\r
}\r
\r
float clump(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = fract(p);\r
  vec2 u = f * f * (3.0 - 2.0 * f);\r
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);\r
}\r
\r
void main() {\r
  vec3 color = texture(uField, vUv).rgb;\r
  vec2 pixel = gl_FragCoord.xy + uFrame * vec2(17.0, 59.0);\r
  float fine = hash(pixel) + hash(pixel + 7.13) - 1.0;\r
  float coarse = (clump(pixel / max(uGrainSize, 1.0)) - 0.5) * 2.0;\r
  float grain = mix(fine, coarse, clamp(uGrainSize - 1.0, 0.0, 1.0) * 0.8);\r
  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));\r
  color += grain * uGrain * (0.45 + 2.2 * luma * (1.0 - luma));\r
  outColor = vec4(clamp(color, 0.0, 1.0), 1.0);\r
}\`;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const toLinear = value => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);\r
\r
const toLab = ([r, g, b]) => {\r
  const lr = toLinear(r);\r
  const lg = toLinear(g);\r
  const lb = toLinear(b);\r
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);\r
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);\r
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);\r
  return [\r
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,\r
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,\r
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s\r
  ];\r
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
const link = (gl, fragmentSource) => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);\r
  const program = gl.createProgram();\r
  if (!vertex || !fragment || !program) return null;\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
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
    if (!info) continue;\r
    const name = info.name.replace(/\\[0\\]$/, '');\r
    uniforms[name] = gl.getUniformLocation(program, name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const Grainient = ({\r
  colors = DEFAULT_COLORS,\r
  type = 'linear',\r
  angle = 55,\r
  bands = 1,\r
  speed = 1,\r
  flow = 0.8,\r
  scale = 1,\r
  softness = 1,\r
  silk = 0.35,\r
  grainAmount = 0.08,\r
  grainSize = 1.2,\r
  grainAnimated = true,\r
  contrast = 1,\r
  saturation = 1,\r
  variation = 0,\r
  interactive = true,\r
  stir = 1,\r
  clickSwirl = true,\r
  intro = true,\r
  lightMode = false,\r
  dpr,\r
  className = '',\r
  style,\r
  ...rest\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const palette = (Array.isArray(colors) && colors.length ? colors : DEFAULT_COLORS).slice(0, MAX_COLORS);\r
  const settings = {\r
    colors: palette.length > 1 ? palette : [palette[0], palette[0]],\r
    type: TYPES[type] ?? 0,\r
    angle,\r
    bands: clamp(bands, 1, 8),\r
    speed: Math.max(0, speed),\r
    flow: clamp(flow, 0, 3),\r
    scale: clamp(scale, 0.25, 3),\r
    softness: clamp(softness, 0, 1),\r
    silk: clamp(silk, 0, 1),\r
    grainAmount: clamp(grainAmount, 0, 0.5),\r
    grainSize: clamp(grainSize, 0.5, 4),\r
    grainAnimated,\r
    contrast: clamp(contrast, 0.2, 2),\r
    saturation: clamp(saturation, 0, 2),\r
    variation: Math.max(0, variation),\r
    interactive,\r
    stir: clamp(stir, 0, 2),\r
    clickSwirl,\r
    intro,\r
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
      alpha: false,\r
      antialias: false,\r
      depth: false,\r
      stencil: false\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const field = link(gl, FIELD);\r
    const composite = link(gl, COMPOSITE);\r
    if (!field || !composite) return undefined;\r
    const fu = field.uniforms;\r
    const cu = composite.uniforms;\r
    const vao = gl.createVertexArray();\r
    const target = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, target);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    const buffer = gl.createFramebuffer();\r
    const fieldSize = { width: 0, height: 0 };\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const colorCache = new Map();\r
    const parse = value => {\r
      const key = String(value);\r
      const cached = colorCache.get(key);\r
      if (cached) return cached;\r
      let rgb = [0, 0, 0];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#000000';\r
        probe.fillStyle = key;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      colorCache.set(key, rgb);\r
      return rgb;\r
    };\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1, ratio: 1 };\r
    const ramp = new Float32Array(MAX_COLORS * 3);\r
    const stirs = new Float32Array(MAX_STIRS * 4);\r
    const stirWeights = new Float32Array(MAX_STIRS);\r
    const twirls = new Float32Array(MAX_TWIRLS * 4);\r
    const trail = [];\r
    const spins = [];\r
    const pointer = { x: 0.5, y: 0.5, sx: 0.5, sy: 0.5, vx: 0, inside: false, fresh: true };\r
    let paletteKey = '';\r
    let time = 0;\r
    let introClock = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let frameSeed = 0;\r
    let grainClock = 0;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const syncPalette = () => {\r
      const s = settingsRef.current;\r
      const key = \`\${s.colors.join(',')}|\${s.lightMode}\`;\r
      if (key === paletteKey) return;\r
      paletteKey = key;\r
      const labs = s.colors.map(color => toLab(parse(color)));\r
      if (!s.lightMode) {\r
        labs.forEach((lab, i) => ramp.set(lab, i * 3));\r
      } else {\r
        const blank = labs.map(([L]) => Math.abs(L - labs[0][0]) < 0.1);\r
        const tints = labs.filter((_, i) => !blank[i]).reverse();\r
        labs.forEach((_, i) => {\r
          const [L, a, b] = blank[i] ? [1, 0, 0] : tints.shift();\r
          ramp.set([L + (1 - L) * LIFT, a * (1 - LIFT), b * (1 - LIFT)], i * 3);\r
        });\r
      }\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      const aspect = view.width / view.height;\r
      syncPalette();\r
      gl.bindVertexArray(vao);\r
      gl.disable(gl.BLEND);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);\r
      gl.viewport(0, 0, fieldSize.width, fieldSize.height);\r
      gl.useProgram(field.program);\r
      gl.uniform1f(fu.uAspect, aspect);\r
      gl.uniform1f(fu.uTime, time);\r
      gl.uniform3fv(fu.uRamp, ramp);\r
      gl.uniform1i(fu.uCount, s.colors.length);\r
      const radians = (s.angle * Math.PI) / 180;\r
      gl.uniform1i(fu.uType, s.type);\r
      gl.uniform2f(fu.uDir, Math.sin(radians), Math.cos(radians));\r
      gl.uniform1f(fu.uExtent, aspect * Math.abs(Math.sin(radians)) + Math.abs(Math.cos(radians)));\r
      gl.uniform1f(fu.uBands, s.bands);\r
      gl.uniform1f(fu.uSoftness, s.softness);\r
      gl.uniform1f(fu.uFlow, s.flow);\r
      gl.uniform1f(fu.uScale, s.scale);\r
      gl.uniform1f(fu.uSilk, s.silk);\r
      gl.uniform4fv(fu.uStir, stirs);\r
      gl.uniform1fv(fu.uStirWeight, stirWeights);\r
      gl.uniform4fv(fu.uTwirl, twirls);\r
      gl.uniform2f(fu.uSeed, s.variation * 3.17, s.variation * 1.91);\r
      gl.uniform1f(fu.uContrast, s.contrast);\r
      gl.uniform1f(fu.uSaturation, s.saturation);\r
      gl.uniform1f(fu.uSettle, introClock * introClock * (3 - 2 * introClock));\r
      gl.uniform1f(fu.uReveal, introClock);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(composite.program);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, target);\r
      gl.uniform1i(cu.uField, 0);\r
      gl.uniform1f(cu.uGrain, s.grainAmount);\r
      gl.uniform1f(cu.uGrainSize, s.grainSize * view.ratio);\r
      gl.uniform1f(cu.uFrame, frameSeed);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      view.width = Math.max(1, container.clientWidth);\r
      view.height = Math.max(1, container.clientHeight);\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(view.width * view.ratio));\r
      canvas.height = Math.max(1, Math.round(view.height * view.ratio));\r
      const width = Math.max(1, Math.round(canvas.width / 2));\r
      const height = Math.max(1, Math.round(canvas.height / 2));\r
      if (width !== fieldSize.width || height !== fieldSize.height) {\r
        fieldSize.width = width;\r
        fieldSize.height = height;\r
        gl.bindTexture(gl.TEXTURE_2D, target);\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);\r
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target, 0);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      }\r
      draw();\r
      wake();\r
    };\r
\r
    const updateTouches = (dt, aspect) => {\r
      const s = settingsRef.current;\r
      const follow = 1 - Math.exp(-dt / 0.06);\r
      const px = pointer.sx;\r
      const py = pointer.sy;\r
      pointer.sx += (pointer.x - pointer.sx) * follow;\r
      pointer.sy += (pointer.y - pointer.sy) * follow;\r
      const vx = ((pointer.sx - px) / dt) * aspect;\r
      const vy = (pointer.sy - py) / dt;\r
      pointer.vx = vx;\r
      const head = trail[0];\r
      trail.forEach(sample => {\r
        if (sample.done) sample.age += dt;\r
      });\r
      if (s.interactive && pointer.inside && Math.hypot(vx, vy) > 0.02 && !reduce) {\r
        if (!head || head.done) {\r
          trail.unshift({ x: 0, y: 0, vx: 0, vy: 0, age: 0, grow: 0, done: false });\r
          if (trail.length > MAX_STIRS) trail.pop();\r
        }\r
        const live = trail[0];\r
        live.x = (pointer.sx - 0.5) * aspect;\r
        live.y = pointer.sy - 0.5;\r
        live.vx = vx;\r
        live.vy = vy;\r
        live.grow = Math.min(1, live.grow + dt / STIR_STEP);\r
        live.done = live.grow >= 1;\r
      } else if (head) {\r
        head.done = true;\r
      }\r
      while (trail.length && trail[trail.length - 1].age > STIR_LIFE) trail.pop();\r
      for (let i = 0; i < MAX_STIRS; i++) {\r
        const sample = trail[i];\r
        if (!sample) {\r
          stirWeights[i] = 0;\r
          continue;\r
        }\r
        const fade = 1 - sample.age / STIR_LIFE;\r
        const cap = Math.min(1, 2.2 / Math.max(Math.hypot(sample.vx, sample.vy), 0.001));\r
        stirs.set([sample.x, sample.y, sample.vx * cap, sample.vy * cap], i * 4);\r
        stirWeights[i] = fade * fade * sample.grow * s.stir * 0.05;\r
      }\r
      spins.forEach(spin => {\r
        spin.age += dt;\r
      });\r
      while (spins.length && spins[spins.length - 1].age > TWIRL_LIFE) spins.pop();\r
      for (let i = 0; i < MAX_TWIRLS; i++) {\r
        const spin = spins[i];\r
        if (!spin) {\r
          twirls[i * 4 + 2] = 0;\r
          continue;\r
        }\r
        const k = spin.age / TWIRL_LIFE;\r
        const envelope = Math.min(1, spin.age / 0.18) * (1 - k) * (1 - k);\r
        twirls.set([spin.x, spin.y, spin.direction * 2.4 * envelope, 0.16 + 0.1 * Math.min(1, spin.age / 0.5)], i * 4);\r
      }\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.001, 0.05) : 1 / 60;\r
      last = now;\r
      if (!reduce) time += dt * s.speed * 0.16;\r
      if (introClock < 1) introClock = Math.min(1, introClock + dt / INTRO_SECONDS);\r
      grainClock += dt;\r
      if (s.grainAnimated && !reduce && grainClock > 1 / 24) {\r
        grainClock = 0;\r
        frameSeed = (frameSeed + 1) % 97;\r
      }\r
      updateTouches(dt, view.width / view.height);\r
      draw();\r
      const busy =\r
        (!reduce && (s.speed > 0 || s.grainAnimated)) || introClock < 1 || trail.length > 0 || spins.length > 0;\r
      if (busy) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    function wake() {\r
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    }\r
\r
    const locate = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = (event.clientX - rect.left) / Math.max(1, rect.width);\r
      const y = 1 - (event.clientY - rect.top) / Math.max(1, rect.height);\r
      pointer.inside = x >= 0 && x <= 1 && y >= 0 && y <= 1;\r
      pointer.x = x;\r
      pointer.y = y;\r
      if (pointer.fresh || !pointer.inside) {\r
        pointer.sx = x;\r
        pointer.sy = y;\r
        pointer.fresh = false;\r
      }\r
    };\r
\r
    const onPointerMove = event => {\r
      locate(event);\r
      if (pointer.inside || trail.length) wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      locate(event);\r
      const s = settingsRef.current;\r
      if (!pointer.inside || !s.clickSwirl || reduce) return;\r
      spins.unshift({\r
        x: (pointer.x - 0.5) * (view.width / view.height),\r
        y: pointer.y - 0.5,\r
        age: 0,\r
        direction: pointer.vx < 0 ? 1 : -1\r
      });\r
      if (spins.length > MAX_TWIRLS) spins.pop();\r
      wake();\r
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
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
    wakeRef.current = wake;\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteTexture(target);\r
      gl.deleteFramebuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(field.program);\r
      gl.deleteProgram(composite.program);\r
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
export default Grainient;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties, type HTMLAttributes } from 'react';\r
import './Grainient.css';\r
\r
export type GrainientType = 'linear' | 'radial';\r
\r
export interface GrainientProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {\r
  colors?: string[];\r
  type?: GrainientType;\r
  angle?: number;\r
  bands?: number;\r
  speed?: number;\r
  flow?: number;\r
  scale?: number;\r
  softness?: number;\r
  silk?: number;\r
  grainAmount?: number;\r
  grainSize?: number;\r
  grainAnimated?: boolean;\r
  contrast?: number;\r
  saturation?: number;\r
  variation?: number;\r
  interactive?: boolean;\r
  stir?: number;\r
  clickSwirl?: boolean;\r
  intro?: boolean;\r
  lightMode?: boolean;\r
  dpr?: number;\r
  style?: CSSProperties;\r
}\r
\r
type Settings = {\r
  colors: string[];\r
  type: number;\r
  angle: number;\r
  bands: number;\r
  speed: number;\r
  flow: number;\r
  scale: number;\r
  softness: number;\r
  silk: number;\r
  grainAmount: number;\r
  grainSize: number;\r
  grainAnimated: boolean;\r
  contrast: number;\r
  saturation: number;\r
  variation: number;\r
  interactive: boolean;\r
  stir: number;\r
  clickSwirl: boolean;\r
  intro: boolean;\r
  lightMode: boolean;\r
  dpr?: number;\r
};\r
\r
type Sample = { x: number; y: number; vx: number; vy: number; age: number; grow: number; done: boolean };\r
\r
type Spin = { x: number; y: number; age: number; direction: number };\r
\r
type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };\r
\r
const MAX_COLORS = 8;\r
const MAX_STIRS = 24;\r
const MAX_TWIRLS = 4;\r
const STIR_LIFE = 1.3;\r
const STIR_STEP = 0.06;\r
const TWIRL_LIFE = 2.6;\r
const INTRO_SECONDS = 1.6;\r
const DEFAULT_COLORS = ['#120f17', '#2a0f0a', '#9a3412', '#f97316', '#fed7aa'];\r
const TYPES: Record<string, number> = { linear: 0, radial: 1 };\r
const LIFT = 0.2;\r
\r
const VERTEX = \`#version 300 es\r
out vec2 vUv;\r
void main() {\r
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\r
  vUv = p;\r
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const FIELD = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform float uAspect;\r
uniform float uTime;\r
uniform vec3 uRamp[8];\r
uniform int uCount;\r
uniform int uType;\r
uniform vec2 uDir;\r
uniform float uExtent;\r
uniform float uBands;\r
uniform float uSoftness;\r
uniform float uFlow;\r
uniform float uScale;\r
uniform float uSilk;\r
uniform vec4 uStir[24];\r
uniform float uStirWeight[24];\r
uniform vec4 uTwirl[4];\r
uniform vec2 uSeed;\r
uniform float uContrast;\r
uniform float uSaturation;\r
uniform float uSettle;\r
uniform float uReveal;\r
in vec2 vUv;\r
out vec4 outColor;\r
\r
vec2 hash2(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.103, 0.0973));\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.xx + q.yz) * q.zy) * 2.0 - 1.0;\r
}\r
\r
float noise(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = fract(p);\r
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);\r
  float a = dot(hash2(i), f);\r
  float b = dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));\r
  float c = dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));\r
  float d = dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));\r
  return 0.5 + 0.5 * mix(mix(a, b, u.x), mix(c, d, u.x), u.y);\r
}\r
\r
vec2 drift(vec2 p, float t) {\r
  vec2 w1 = vec2(\r
    noise(p * 0.85 + vec2(t * 0.11, t * 0.07)),\r
    noise(p * 0.85 + vec2(4.1, 1.7) - vec2(t * 0.08, t * 0.12))\r
  );\r
  vec2 w2 = vec2(\r
    noise(p * 1.55 + w1 * 1.8 + vec2(1.3, 7.1) + t * 0.05),\r
    noise(p * 1.55 + w1 * 1.8 + vec2(6.4, 2.2) - t * 0.06)\r
  );\r
  return (w1 - 0.5) * 1.1 + (w2 - 0.5) * 0.55;\r
}\r
\r
vec2 warp(vec2 p) {\r
  vec2 q = p / uScale;\r
  if (uType == 1) {\r
    float turn = uTime * 0.35;\r
    q = mat2(cos(turn), sin(turn), -sin(turn), cos(turn)) * q;\r
  } else {\r
    q += vec2(-uDir.y, uDir.x) * uTime * 0.45;\r
  }\r
  return p + drift(q + uSeed, uTime) * uFlow * uScale * uSettle;\r
}\r
\r
float coord(vec2 p) {\r
  vec2 w = warp(p);\r
  return uType == 1 ? 1.0 - length(w) * 1.1 : dot(w, uDir) / uExtent + 0.5;\r
}\r
\r
vec3 labToRgb(vec3 lab) {\r
  float l = lab.x + 0.3963377774 * lab.y + 0.2158037573 * lab.z;\r
  float m = lab.x - 0.1055613458 * lab.y - 0.0638541728 * lab.z;\r
  float s = lab.x - 0.0894841775 * lab.y - 1.2914855480 * lab.z;\r
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
vec3 encode(vec3 c) {\r
  c = clamp(c, 0.0, 1.0);\r
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));\r
}\r
\r
void main() {\r
  vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);\r
  for (int i = 0; i < 24; i++) {\r
    float w = uStirWeight[i];\r
    if (w <= 0.0) continue;\r
    vec2 d = p - uStir[i].xy;\r
    p -= uStir[i].zw * w * exp(-dot(d, d) / 0.045);\r
  }\r
  for (int i = 0; i < 4; i++) {\r
    float angle = uTwirl[i].z;\r
    if (angle == 0.0) continue;\r
    vec2 d = p - uTwirl[i].xy;\r
    float a = angle * exp(-dot(d, d) / (uTwirl[i].w * uTwirl[i].w));\r
    float c = cos(a);\r
    float s = sin(a);\r
    p = uTwirl[i].xy + mat2(c, -s, s, c) * d;\r
  }\r
  float raw = coord(p);\r
  float s = raw;\r
  if (uBands > 1.0) {\r
    s *= uBands;\r
    float cycle = floor(s);\r
    s = fract(s);\r
    if (mod(cycle, 2.0) > 0.5) s = 1.0 - s;\r
  }\r
  s = clamp(s, 0.0, 1.0);\r
  float scaled = s * float(uCount - 1);\r
  int index = int(min(floor(scaled), float(uCount - 2)));\r
  float f = scaled - float(index);\r
  float edge = max(uSoftness * 0.5, fwidth(scaled) * 0.75);\r
  float shaped = smoothstep(0.5 - edge, 0.5 + edge, f);\r
  vec3 from = uRamp[0];\r
  vec3 to = uRamp[1];\r
  for (int i = 0; i < 7; i++) {\r
    if (i == index) {\r
      from = uRamp[i];\r
      to = uRamp[i + 1];\r
    }\r
  }\r
  vec3 lab = mix(from, to, shaped);\r
  if (uSilk > 0.0) {\r
    vec2 grad = vec2(coord(p + vec2(0.004, 0.0)) - raw, coord(p + vec2(0.0, 0.004)) - raw) / 0.004;\r
    vec2 slope = grad * sin(3.14159265 * clamp(raw, 0.0, 1.0) * uBands) * uSilk * 4.0;\r
    vec3 normal = normalize(vec3(-slope, 1.0));\r
    vec3 light = normalize(vec3(-uDir.y, uDir.x, 1.2));\r
    float diffuse = dot(normal, light) - light.z;\r
    lab = uRamp[0] + (lab - uRamp[0]) * (1.0 + (diffuse * 0.35 + max(diffuse, 0.0) * diffuse * 0.6) * uSilk);\r
  }\r
  lab = mix(uRamp[0], lab, smoothstep(0.0, 1.0, uReveal * 1.5 - length(vUv - 0.5) * 0.6));\r
  lab.x = (lab.x - 0.55) * uContrast + 0.55;\r
  lab.yz *= uSaturation;\r
  outColor = vec4(encode(labToRgb(lab)), 1.0);\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uField;\r
uniform float uGrain;\r
uniform float uGrainSize;\r
uniform float uFrame;\r
in vec2 vUv;\r
out vec4 outColor;\r
\r
float hash(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * 0.1031);\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.x + q.y) * q.z);\r
}\r
\r
float clump(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = fract(p);\r
  vec2 u = f * f * (3.0 - 2.0 * f);\r
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);\r
}\r
\r
void main() {\r
  vec3 color = texture(uField, vUv).rgb;\r
  vec2 pixel = gl_FragCoord.xy + uFrame * vec2(17.0, 59.0);\r
  float fine = hash(pixel) + hash(pixel + 7.13) - 1.0;\r
  float coarse = (clump(pixel / max(uGrainSize, 1.0)) - 0.5) * 2.0;\r
  float grain = mix(fine, coarse, clamp(uGrainSize - 1.0, 0.0, 1.0) * 0.8);\r
  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));\r
  color += grain * uGrain * (0.45 + 2.2 * luma * (1.0 - luma));\r
  outColor = vec4(clamp(color, 0.0, 1.0), 1.0);\r
}\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const toLinear = (value: number) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);\r
\r
const toLab = ([r, g, b]: number[]): number[] => {\r
  const lr = toLinear(r);\r
  const lg = toLinear(g);\r
  const lb = toLinear(b);\r
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);\r
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);\r
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);\r
  return [\r
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,\r
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,\r
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s\r
  ];\r
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
const link = (gl: WebGL2RenderingContext, fragmentSource: string): Program | null => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);\r
  const program = gl.createProgram();\r
  if (!vertex || !fragment || !program) return null;\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
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
    if (!info) continue;\r
    const name = info.name.replace(/\\[0\\]$/, '');\r
    uniforms[name] = gl.getUniformLocation(program, name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const Grainient = ({\r
  colors = DEFAULT_COLORS,\r
  type = 'linear',\r
  angle = 55,\r
  bands = 1,\r
  speed = 1,\r
  flow = 0.8,\r
  scale = 1,\r
  softness = 1,\r
  silk = 0.35,\r
  grainAmount = 0.08,\r
  grainSize = 1.2,\r
  grainAnimated = true,\r
  contrast = 1,\r
  saturation = 1,\r
  variation = 0,\r
  interactive = true,\r
  stir = 1,\r
  clickSwirl = true,\r
  intro = true,\r
  lightMode = false,\r
  dpr,\r
  className = '',\r
  style,\r
  ...rest\r
}: GrainientProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const palette = (Array.isArray(colors) && colors.length ? colors : DEFAULT_COLORS).slice(0, MAX_COLORS);\r
  const settings: Settings = {\r
    colors: palette.length > 1 ? palette : [palette[0], palette[0]],\r
    type: TYPES[type] ?? 0,\r
    angle,\r
    bands: clamp(bands, 1, 8),\r
    speed: Math.max(0, speed),\r
    flow: clamp(flow, 0, 3),\r
    scale: clamp(scale, 0.25, 3),\r
    softness: clamp(softness, 0, 1),\r
    silk: clamp(silk, 0, 1),\r
    grainAmount: clamp(grainAmount, 0, 0.5),\r
    grainSize: clamp(grainSize, 0.5, 4),\r
    grainAnimated,\r
    contrast: clamp(contrast, 0.2, 2),\r
    saturation: clamp(saturation, 0, 2),\r
    variation: Math.max(0, variation),\r
    interactive,\r
    stir: clamp(stir, 0, 2),\r
    clickSwirl,\r
    intro,\r
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
      alpha: false,\r
      antialias: false,\r
      depth: false,\r
      stencil: false\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const field = link(gl, FIELD);\r
    const composite = link(gl, COMPOSITE);\r
    if (!field || !composite) return undefined;\r
    const fu = field.uniforms;\r
    const cu = composite.uniforms;\r
    const vao = gl.createVertexArray();\r
    const target = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, target);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    const buffer = gl.createFramebuffer();\r
    const fieldSize = { width: 0, height: 0 };\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const colorCache = new Map<string, number[]>();\r
    const parse = (value: string): number[] => {\r
      const key = String(value);\r
      const cached = colorCache.get(key);\r
      if (cached) return cached;\r
      let rgb = [0, 0, 0];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#000000';\r
        probe.fillStyle = key;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      colorCache.set(key, rgb);\r
      return rgb;\r
    };\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1, ratio: 1 };\r
    const ramp = new Float32Array(MAX_COLORS * 3);\r
    const stirs = new Float32Array(MAX_STIRS * 4);\r
    const stirWeights = new Float32Array(MAX_STIRS);\r
    const twirls = new Float32Array(MAX_TWIRLS * 4);\r
    const trail: Sample[] = [];\r
    const spins: Spin[] = [];\r
    const pointer = { x: 0.5, y: 0.5, sx: 0.5, sy: 0.5, vx: 0, inside: false, fresh: true };\r
    let paletteKey = '';\r
    let time = 0;\r
    let introClock = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let frameSeed = 0;\r
    let grainClock = 0;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const syncPalette = () => {\r
      const s = settingsRef.current;\r
      const key = \`\${s.colors.join(',')}|\${s.lightMode}\`;\r
      if (key === paletteKey) return;\r
      paletteKey = key;\r
      const labs = s.colors.map(color => toLab(parse(color)));\r
      if (!s.lightMode) {\r
        labs.forEach((lab, i) => ramp.set(lab, i * 3));\r
      } else {\r
        const blank = labs.map(([L]) => Math.abs(L - labs[0][0]) < 0.1);\r
        const tints = labs.filter((_, i) => !blank[i]).reverse();\r
        labs.forEach((_, i) => {\r
          const [L, a, b] = blank[i] ? [1, 0, 0] : (tints.shift() as number[]);\r
          ramp.set([L + (1 - L) * LIFT, a * (1 - LIFT), b * (1 - LIFT)], i * 3);\r
        });\r
      }\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      const aspect = view.width / view.height;\r
      syncPalette();\r
      gl.bindVertexArray(vao);\r
      gl.disable(gl.BLEND);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);\r
      gl.viewport(0, 0, fieldSize.width, fieldSize.height);\r
      gl.useProgram(field.program);\r
      gl.uniform1f(fu.uAspect, aspect);\r
      gl.uniform1f(fu.uTime, time);\r
      gl.uniform3fv(fu.uRamp, ramp);\r
      gl.uniform1i(fu.uCount, s.colors.length);\r
      const radians = (s.angle * Math.PI) / 180;\r
      gl.uniform1i(fu.uType, s.type);\r
      gl.uniform2f(fu.uDir, Math.sin(radians), Math.cos(radians));\r
      gl.uniform1f(fu.uExtent, aspect * Math.abs(Math.sin(radians)) + Math.abs(Math.cos(radians)));\r
      gl.uniform1f(fu.uBands, s.bands);\r
      gl.uniform1f(fu.uSoftness, s.softness);\r
      gl.uniform1f(fu.uFlow, s.flow);\r
      gl.uniform1f(fu.uScale, s.scale);\r
      gl.uniform1f(fu.uSilk, s.silk);\r
      gl.uniform4fv(fu.uStir, stirs);\r
      gl.uniform1fv(fu.uStirWeight, stirWeights);\r
      gl.uniform4fv(fu.uTwirl, twirls);\r
      gl.uniform2f(fu.uSeed, s.variation * 3.17, s.variation * 1.91);\r
      gl.uniform1f(fu.uContrast, s.contrast);\r
      gl.uniform1f(fu.uSaturation, s.saturation);\r
      gl.uniform1f(fu.uSettle, introClock * introClock * (3 - 2 * introClock));\r
      gl.uniform1f(fu.uReveal, introClock);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(composite.program);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, target);\r
      gl.uniform1i(cu.uField, 0);\r
      gl.uniform1f(cu.uGrain, s.grainAmount);\r
      gl.uniform1f(cu.uGrainSize, s.grainSize * view.ratio);\r
      gl.uniform1f(cu.uFrame, frameSeed);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      view.width = Math.max(1, container.clientWidth);\r
      view.height = Math.max(1, container.clientHeight);\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(view.width * view.ratio));\r
      canvas.height = Math.max(1, Math.round(view.height * view.ratio));\r
      const width = Math.max(1, Math.round(canvas.width / 2));\r
      const height = Math.max(1, Math.round(canvas.height / 2));\r
      if (width !== fieldSize.width || height !== fieldSize.height) {\r
        fieldSize.width = width;\r
        fieldSize.height = height;\r
        gl.bindTexture(gl.TEXTURE_2D, target);\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);\r
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target, 0);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      }\r
      draw();\r
      wake();\r
    };\r
\r
    const updateTouches = (dt: number, aspect: number) => {\r
      const s = settingsRef.current;\r
      const follow = 1 - Math.exp(-dt / 0.06);\r
      const px = pointer.sx;\r
      const py = pointer.sy;\r
      pointer.sx += (pointer.x - pointer.sx) * follow;\r
      pointer.sy += (pointer.y - pointer.sy) * follow;\r
      const vx = ((pointer.sx - px) / dt) * aspect;\r
      const vy = (pointer.sy - py) / dt;\r
      pointer.vx = vx;\r
      const head = trail[0];\r
      trail.forEach(sample => {\r
        if (sample.done) sample.age += dt;\r
      });\r
      if (s.interactive && pointer.inside && Math.hypot(vx, vy) > 0.02 && !reduce) {\r
        if (!head || head.done) {\r
          trail.unshift({ x: 0, y: 0, vx: 0, vy: 0, age: 0, grow: 0, done: false });\r
          if (trail.length > MAX_STIRS) trail.pop();\r
        }\r
        const live = trail[0];\r
        live.x = (pointer.sx - 0.5) * aspect;\r
        live.y = pointer.sy - 0.5;\r
        live.vx = vx;\r
        live.vy = vy;\r
        live.grow = Math.min(1, live.grow + dt / STIR_STEP);\r
        live.done = live.grow >= 1;\r
      } else if (head) {\r
        head.done = true;\r
      }\r
      while (trail.length && trail[trail.length - 1].age > STIR_LIFE) trail.pop();\r
      for (let i = 0; i < MAX_STIRS; i++) {\r
        const sample = trail[i];\r
        if (!sample) {\r
          stirWeights[i] = 0;\r
          continue;\r
        }\r
        const fade = 1 - sample.age / STIR_LIFE;\r
        const cap = Math.min(1, 2.2 / Math.max(Math.hypot(sample.vx, sample.vy), 0.001));\r
        stirs.set([sample.x, sample.y, sample.vx * cap, sample.vy * cap], i * 4);\r
        stirWeights[i] = fade * fade * sample.grow * s.stir * 0.05;\r
      }\r
      spins.forEach(spin => {\r
        spin.age += dt;\r
      });\r
      while (spins.length && spins[spins.length - 1].age > TWIRL_LIFE) spins.pop();\r
      for (let i = 0; i < MAX_TWIRLS; i++) {\r
        const spin = spins[i];\r
        if (!spin) {\r
          twirls[i * 4 + 2] = 0;\r
          continue;\r
        }\r
        const k = spin.age / TWIRL_LIFE;\r
        const envelope = Math.min(1, spin.age / 0.18) * (1 - k) * (1 - k);\r
        twirls.set([spin.x, spin.y, spin.direction * 2.4 * envelope, 0.16 + 0.1 * Math.min(1, spin.age / 0.5)], i * 4);\r
      }\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.001, 0.05) : 1 / 60;\r
      last = now;\r
      if (!reduce) time += dt * s.speed * 0.16;\r
      if (introClock < 1) introClock = Math.min(1, introClock + dt / INTRO_SECONDS);\r
      grainClock += dt;\r
      if (s.grainAnimated && !reduce && grainClock > 1 / 24) {\r
        grainClock = 0;\r
        frameSeed = (frameSeed + 1) % 97;\r
      }\r
      updateTouches(dt, view.width / view.height);\r
      draw();\r
      const busy =\r
        (!reduce && (s.speed > 0 || s.grainAnimated)) || introClock < 1 || trail.length > 0 || spins.length > 0;\r
      if (busy) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    function wake() {\r
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    }\r
\r
    const locate = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = (event.clientX - rect.left) / Math.max(1, rect.width);\r
      const y = 1 - (event.clientY - rect.top) / Math.max(1, rect.height);\r
      pointer.inside = x >= 0 && x <= 1 && y >= 0 && y <= 1;\r
      pointer.x = x;\r
      pointer.y = y;\r
      if (pointer.fresh || !pointer.inside) {\r
        pointer.sx = x;\r
        pointer.sy = y;\r
        pointer.fresh = false;\r
      }\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      locate(event);\r
      if (pointer.inside || trail.length) wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      locate(event);\r
      const s = settingsRef.current;\r
      if (!pointer.inside || !s.clickSwirl || reduce) return;\r
      spins.unshift({\r
        x: (pointer.x - 0.5) * (view.width / view.height),\r
        y: pointer.y - 0.5,\r
        age: 0,\r
        direction: pointer.vx < 0 ? 1 : -1\r
      });\r
      if (spins.length > MAX_TWIRLS) spins.pop();\r
      wake();\r
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
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
    wakeRef.current = wake;\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteTexture(target);\r
      gl.deleteFramebuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(field.program);\r
      gl.deleteProgram(composite.program);\r
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
      className={\`grainient-container\${className ? \` \${className}\` : ''}\`}\r
      style={style}\r
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className="grainient-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Grainient;\r
`,i=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties, type HTMLAttributes } from 'react';\r
\r
export type GrainientType = 'linear' | 'radial';\r
\r
export interface GrainientProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {\r
  colors?: string[];\r
  type?: GrainientType;\r
  angle?: number;\r
  bands?: number;\r
  speed?: number;\r
  flow?: number;\r
  scale?: number;\r
  softness?: number;\r
  silk?: number;\r
  grainAmount?: number;\r
  grainSize?: number;\r
  grainAnimated?: boolean;\r
  contrast?: number;\r
  saturation?: number;\r
  variation?: number;\r
  interactive?: boolean;\r
  stir?: number;\r
  clickSwirl?: boolean;\r
  intro?: boolean;\r
  lightMode?: boolean;\r
  dpr?: number;\r
  style?: CSSProperties;\r
}\r
\r
type Settings = {\r
  colors: string[];\r
  type: number;\r
  angle: number;\r
  bands: number;\r
  speed: number;\r
  flow: number;\r
  scale: number;\r
  softness: number;\r
  silk: number;\r
  grainAmount: number;\r
  grainSize: number;\r
  grainAnimated: boolean;\r
  contrast: number;\r
  saturation: number;\r
  variation: number;\r
  interactive: boolean;\r
  stir: number;\r
  clickSwirl: boolean;\r
  intro: boolean;\r
  lightMode: boolean;\r
  dpr?: number;\r
};\r
\r
type Sample = { x: number; y: number; vx: number; vy: number; age: number; grow: number; done: boolean };\r
\r
type Spin = { x: number; y: number; age: number; direction: number };\r
\r
type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };\r
\r
const MAX_COLORS = 8;\r
const MAX_STIRS = 24;\r
const MAX_TWIRLS = 4;\r
const STIR_LIFE = 1.3;\r
const STIR_STEP = 0.06;\r
const TWIRL_LIFE = 2.6;\r
const INTRO_SECONDS = 1.6;\r
const DEFAULT_COLORS = ['#120f17', '#2a0f0a', '#9a3412', '#f97316', '#fed7aa'];\r
const TYPES: Record<string, number> = { linear: 0, radial: 1 };\r
const LIFT = 0.2;\r
\r
const VERTEX = \`#version 300 es\r
out vec2 vUv;\r
void main() {\r
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\r
  vUv = p;\r
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const FIELD = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform float uAspect;\r
uniform float uTime;\r
uniform vec3 uRamp[8];\r
uniform int uCount;\r
uniform int uType;\r
uniform vec2 uDir;\r
uniform float uExtent;\r
uniform float uBands;\r
uniform float uSoftness;\r
uniform float uFlow;\r
uniform float uScale;\r
uniform float uSilk;\r
uniform vec4 uStir[24];\r
uniform float uStirWeight[24];\r
uniform vec4 uTwirl[4];\r
uniform vec2 uSeed;\r
uniform float uContrast;\r
uniform float uSaturation;\r
uniform float uSettle;\r
uniform float uReveal;\r
in vec2 vUv;\r
out vec4 outColor;\r
\r
vec2 hash2(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.103, 0.0973));\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.xx + q.yz) * q.zy) * 2.0 - 1.0;\r
}\r
\r
float noise(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = fract(p);\r
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);\r
  float a = dot(hash2(i), f);\r
  float b = dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));\r
  float c = dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));\r
  float d = dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));\r
  return 0.5 + 0.5 * mix(mix(a, b, u.x), mix(c, d, u.x), u.y);\r
}\r
\r
vec2 drift(vec2 p, float t) {\r
  vec2 w1 = vec2(\r
    noise(p * 0.85 + vec2(t * 0.11, t * 0.07)),\r
    noise(p * 0.85 + vec2(4.1, 1.7) - vec2(t * 0.08, t * 0.12))\r
  );\r
  vec2 w2 = vec2(\r
    noise(p * 1.55 + w1 * 1.8 + vec2(1.3, 7.1) + t * 0.05),\r
    noise(p * 1.55 + w1 * 1.8 + vec2(6.4, 2.2) - t * 0.06)\r
  );\r
  return (w1 - 0.5) * 1.1 + (w2 - 0.5) * 0.55;\r
}\r
\r
vec2 warp(vec2 p) {\r
  vec2 q = p / uScale;\r
  if (uType == 1) {\r
    float turn = uTime * 0.35;\r
    q = mat2(cos(turn), sin(turn), -sin(turn), cos(turn)) * q;\r
  } else {\r
    q += vec2(-uDir.y, uDir.x) * uTime * 0.45;\r
  }\r
  return p + drift(q + uSeed, uTime) * uFlow * uScale * uSettle;\r
}\r
\r
float coord(vec2 p) {\r
  vec2 w = warp(p);\r
  return uType == 1 ? 1.0 - length(w) * 1.1 : dot(w, uDir) / uExtent + 0.5;\r
}\r
\r
vec3 labToRgb(vec3 lab) {\r
  float l = lab.x + 0.3963377774 * lab.y + 0.2158037573 * lab.z;\r
  float m = lab.x - 0.1055613458 * lab.y - 0.0638541728 * lab.z;\r
  float s = lab.x - 0.0894841775 * lab.y - 1.2914855480 * lab.z;\r
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
vec3 encode(vec3 c) {\r
  c = clamp(c, 0.0, 1.0);\r
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));\r
}\r
\r
void main() {\r
  vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);\r
  for (int i = 0; i < 24; i++) {\r
    float w = uStirWeight[i];\r
    if (w <= 0.0) continue;\r
    vec2 d = p - uStir[i].xy;\r
    p -= uStir[i].zw * w * exp(-dot(d, d) / 0.045);\r
  }\r
  for (int i = 0; i < 4; i++) {\r
    float angle = uTwirl[i].z;\r
    if (angle == 0.0) continue;\r
    vec2 d = p - uTwirl[i].xy;\r
    float a = angle * exp(-dot(d, d) / (uTwirl[i].w * uTwirl[i].w));\r
    float c = cos(a);\r
    float s = sin(a);\r
    p = uTwirl[i].xy + mat2(c, -s, s, c) * d;\r
  }\r
  float raw = coord(p);\r
  float s = raw;\r
  if (uBands > 1.0) {\r
    s *= uBands;\r
    float cycle = floor(s);\r
    s = fract(s);\r
    if (mod(cycle, 2.0) > 0.5) s = 1.0 - s;\r
  }\r
  s = clamp(s, 0.0, 1.0);\r
  float scaled = s * float(uCount - 1);\r
  int index = int(min(floor(scaled), float(uCount - 2)));\r
  float f = scaled - float(index);\r
  float edge = max(uSoftness * 0.5, fwidth(scaled) * 0.75);\r
  float shaped = smoothstep(0.5 - edge, 0.5 + edge, f);\r
  vec3 from = uRamp[0];\r
  vec3 to = uRamp[1];\r
  for (int i = 0; i < 7; i++) {\r
    if (i == index) {\r
      from = uRamp[i];\r
      to = uRamp[i + 1];\r
    }\r
  }\r
  vec3 lab = mix(from, to, shaped);\r
  if (uSilk > 0.0) {\r
    vec2 grad = vec2(coord(p + vec2(0.004, 0.0)) - raw, coord(p + vec2(0.0, 0.004)) - raw) / 0.004;\r
    vec2 slope = grad * sin(3.14159265 * clamp(raw, 0.0, 1.0) * uBands) * uSilk * 4.0;\r
    vec3 normal = normalize(vec3(-slope, 1.0));\r
    vec3 light = normalize(vec3(-uDir.y, uDir.x, 1.2));\r
    float diffuse = dot(normal, light) - light.z;\r
    lab = uRamp[0] + (lab - uRamp[0]) * (1.0 + (diffuse * 0.35 + max(diffuse, 0.0) * diffuse * 0.6) * uSilk);\r
  }\r
  lab = mix(uRamp[0], lab, smoothstep(0.0, 1.0, uReveal * 1.5 - length(vUv - 0.5) * 0.6));\r
  lab.x = (lab.x - 0.55) * uContrast + 0.55;\r
  lab.yz *= uSaturation;\r
  outColor = vec4(encode(labToRgb(lab)), 1.0);\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uField;\r
uniform float uGrain;\r
uniform float uGrainSize;\r
uniform float uFrame;\r
in vec2 vUv;\r
out vec4 outColor;\r
\r
float hash(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * 0.1031);\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.x + q.y) * q.z);\r
}\r
\r
float clump(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = fract(p);\r
  vec2 u = f * f * (3.0 - 2.0 * f);\r
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);\r
}\r
\r
void main() {\r
  vec3 color = texture(uField, vUv).rgb;\r
  vec2 pixel = gl_FragCoord.xy + uFrame * vec2(17.0, 59.0);\r
  float fine = hash(pixel) + hash(pixel + 7.13) - 1.0;\r
  float coarse = (clump(pixel / max(uGrainSize, 1.0)) - 0.5) * 2.0;\r
  float grain = mix(fine, coarse, clamp(uGrainSize - 1.0, 0.0, 1.0) * 0.8);\r
  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));\r
  color += grain * uGrain * (0.45 + 2.2 * luma * (1.0 - luma));\r
  outColor = vec4(clamp(color, 0.0, 1.0), 1.0);\r
}\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const toLinear = (value: number) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);\r
\r
const toLab = ([r, g, b]: number[]): number[] => {\r
  const lr = toLinear(r);\r
  const lg = toLinear(g);\r
  const lb = toLinear(b);\r
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);\r
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);\r
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);\r
  return [\r
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,\r
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,\r
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s\r
  ];\r
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
const link = (gl: WebGL2RenderingContext, fragmentSource: string): Program | null => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);\r
  const program = gl.createProgram();\r
  if (!vertex || !fragment || !program) return null;\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
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
    if (!info) continue;\r
    const name = info.name.replace(/\\[0\\]$/, '');\r
    uniforms[name] = gl.getUniformLocation(program, name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const Grainient = ({\r
  colors = DEFAULT_COLORS,\r
  type = 'linear',\r
  angle = 55,\r
  bands = 1,\r
  speed = 1,\r
  flow = 0.8,\r
  scale = 1,\r
  softness = 1,\r
  silk = 0.35,\r
  grainAmount = 0.08,\r
  grainSize = 1.2,\r
  grainAnimated = true,\r
  contrast = 1,\r
  saturation = 1,\r
  variation = 0,\r
  interactive = true,\r
  stir = 1,\r
  clickSwirl = true,\r
  intro = true,\r
  lightMode = false,\r
  dpr,\r
  className = '',\r
  style,\r
  ...rest\r
}: GrainientProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const palette = (Array.isArray(colors) && colors.length ? colors : DEFAULT_COLORS).slice(0, MAX_COLORS);\r
  const settings: Settings = {\r
    colors: palette.length > 1 ? palette : [palette[0], palette[0]],\r
    type: TYPES[type] ?? 0,\r
    angle,\r
    bands: clamp(bands, 1, 8),\r
    speed: Math.max(0, speed),\r
    flow: clamp(flow, 0, 3),\r
    scale: clamp(scale, 0.25, 3),\r
    softness: clamp(softness, 0, 1),\r
    silk: clamp(silk, 0, 1),\r
    grainAmount: clamp(grainAmount, 0, 0.5),\r
    grainSize: clamp(grainSize, 0.5, 4),\r
    grainAnimated,\r
    contrast: clamp(contrast, 0.2, 2),\r
    saturation: clamp(saturation, 0, 2),\r
    variation: Math.max(0, variation),\r
    interactive,\r
    stir: clamp(stir, 0, 2),\r
    clickSwirl,\r
    intro,\r
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
      alpha: false,\r
      antialias: false,\r
      depth: false,\r
      stencil: false\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const field = link(gl, FIELD);\r
    const composite = link(gl, COMPOSITE);\r
    if (!field || !composite) return undefined;\r
    const fu = field.uniforms;\r
    const cu = composite.uniforms;\r
    const vao = gl.createVertexArray();\r
    const target = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, target);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    const buffer = gl.createFramebuffer();\r
    const fieldSize = { width: 0, height: 0 };\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const colorCache = new Map<string, number[]>();\r
    const parse = (value: string): number[] => {\r
      const key = String(value);\r
      const cached = colorCache.get(key);\r
      if (cached) return cached;\r
      let rgb = [0, 0, 0];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#000000';\r
        probe.fillStyle = key;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      colorCache.set(key, rgb);\r
      return rgb;\r
    };\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1, ratio: 1 };\r
    const ramp = new Float32Array(MAX_COLORS * 3);\r
    const stirs = new Float32Array(MAX_STIRS * 4);\r
    const stirWeights = new Float32Array(MAX_STIRS);\r
    const twirls = new Float32Array(MAX_TWIRLS * 4);\r
    const trail: Sample[] = [];\r
    const spins: Spin[] = [];\r
    const pointer = { x: 0.5, y: 0.5, sx: 0.5, sy: 0.5, vx: 0, inside: false, fresh: true };\r
    let paletteKey = '';\r
    let time = 0;\r
    let introClock = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let frameSeed = 0;\r
    let grainClock = 0;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const syncPalette = () => {\r
      const s = settingsRef.current;\r
      const key = \`\${s.colors.join(',')}|\${s.lightMode}\`;\r
      if (key === paletteKey) return;\r
      paletteKey = key;\r
      const labs = s.colors.map(color => toLab(parse(color)));\r
      if (!s.lightMode) {\r
        labs.forEach((lab, i) => ramp.set(lab, i * 3));\r
      } else {\r
        const blank = labs.map(([L]) => Math.abs(L - labs[0][0]) < 0.1);\r
        const tints = labs.filter((_, i) => !blank[i]).reverse();\r
        labs.forEach((_, i) => {\r
          const [L, a, b] = blank[i] ? [1, 0, 0] : (tints.shift() as number[]);\r
          ramp.set([L + (1 - L) * LIFT, a * (1 - LIFT), b * (1 - LIFT)], i * 3);\r
        });\r
      }\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      const aspect = view.width / view.height;\r
      syncPalette();\r
      gl.bindVertexArray(vao);\r
      gl.disable(gl.BLEND);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);\r
      gl.viewport(0, 0, fieldSize.width, fieldSize.height);\r
      gl.useProgram(field.program);\r
      gl.uniform1f(fu.uAspect, aspect);\r
      gl.uniform1f(fu.uTime, time);\r
      gl.uniform3fv(fu.uRamp, ramp);\r
      gl.uniform1i(fu.uCount, s.colors.length);\r
      const radians = (s.angle * Math.PI) / 180;\r
      gl.uniform1i(fu.uType, s.type);\r
      gl.uniform2f(fu.uDir, Math.sin(radians), Math.cos(radians));\r
      gl.uniform1f(fu.uExtent, aspect * Math.abs(Math.sin(radians)) + Math.abs(Math.cos(radians)));\r
      gl.uniform1f(fu.uBands, s.bands);\r
      gl.uniform1f(fu.uSoftness, s.softness);\r
      gl.uniform1f(fu.uFlow, s.flow);\r
      gl.uniform1f(fu.uScale, s.scale);\r
      gl.uniform1f(fu.uSilk, s.silk);\r
      gl.uniform4fv(fu.uStir, stirs);\r
      gl.uniform1fv(fu.uStirWeight, stirWeights);\r
      gl.uniform4fv(fu.uTwirl, twirls);\r
      gl.uniform2f(fu.uSeed, s.variation * 3.17, s.variation * 1.91);\r
      gl.uniform1f(fu.uContrast, s.contrast);\r
      gl.uniform1f(fu.uSaturation, s.saturation);\r
      gl.uniform1f(fu.uSettle, introClock * introClock * (3 - 2 * introClock));\r
      gl.uniform1f(fu.uReveal, introClock);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(composite.program);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, target);\r
      gl.uniform1i(cu.uField, 0);\r
      gl.uniform1f(cu.uGrain, s.grainAmount);\r
      gl.uniform1f(cu.uGrainSize, s.grainSize * view.ratio);\r
      gl.uniform1f(cu.uFrame, frameSeed);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      view.width = Math.max(1, container.clientWidth);\r
      view.height = Math.max(1, container.clientHeight);\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(view.width * view.ratio));\r
      canvas.height = Math.max(1, Math.round(view.height * view.ratio));\r
      const width = Math.max(1, Math.round(canvas.width / 2));\r
      const height = Math.max(1, Math.round(canvas.height / 2));\r
      if (width !== fieldSize.width || height !== fieldSize.height) {\r
        fieldSize.width = width;\r
        fieldSize.height = height;\r
        gl.bindTexture(gl.TEXTURE_2D, target);\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);\r
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target, 0);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      }\r
      draw();\r
      wake();\r
    };\r
\r
    const updateTouches = (dt: number, aspect: number) => {\r
      const s = settingsRef.current;\r
      const follow = 1 - Math.exp(-dt / 0.06);\r
      const px = pointer.sx;\r
      const py = pointer.sy;\r
      pointer.sx += (pointer.x - pointer.sx) * follow;\r
      pointer.sy += (pointer.y - pointer.sy) * follow;\r
      const vx = ((pointer.sx - px) / dt) * aspect;\r
      const vy = (pointer.sy - py) / dt;\r
      pointer.vx = vx;\r
      const head = trail[0];\r
      trail.forEach(sample => {\r
        if (sample.done) sample.age += dt;\r
      });\r
      if (s.interactive && pointer.inside && Math.hypot(vx, vy) > 0.02 && !reduce) {\r
        if (!head || head.done) {\r
          trail.unshift({ x: 0, y: 0, vx: 0, vy: 0, age: 0, grow: 0, done: false });\r
          if (trail.length > MAX_STIRS) trail.pop();\r
        }\r
        const live = trail[0];\r
        live.x = (pointer.sx - 0.5) * aspect;\r
        live.y = pointer.sy - 0.5;\r
        live.vx = vx;\r
        live.vy = vy;\r
        live.grow = Math.min(1, live.grow + dt / STIR_STEP);\r
        live.done = live.grow >= 1;\r
      } else if (head) {\r
        head.done = true;\r
      }\r
      while (trail.length && trail[trail.length - 1].age > STIR_LIFE) trail.pop();\r
      for (let i = 0; i < MAX_STIRS; i++) {\r
        const sample = trail[i];\r
        if (!sample) {\r
          stirWeights[i] = 0;\r
          continue;\r
        }\r
        const fade = 1 - sample.age / STIR_LIFE;\r
        const cap = Math.min(1, 2.2 / Math.max(Math.hypot(sample.vx, sample.vy), 0.001));\r
        stirs.set([sample.x, sample.y, sample.vx * cap, sample.vy * cap], i * 4);\r
        stirWeights[i] = fade * fade * sample.grow * s.stir * 0.05;\r
      }\r
      spins.forEach(spin => {\r
        spin.age += dt;\r
      });\r
      while (spins.length && spins[spins.length - 1].age > TWIRL_LIFE) spins.pop();\r
      for (let i = 0; i < MAX_TWIRLS; i++) {\r
        const spin = spins[i];\r
        if (!spin) {\r
          twirls[i * 4 + 2] = 0;\r
          continue;\r
        }\r
        const k = spin.age / TWIRL_LIFE;\r
        const envelope = Math.min(1, spin.age / 0.18) * (1 - k) * (1 - k);\r
        twirls.set([spin.x, spin.y, spin.direction * 2.4 * envelope, 0.16 + 0.1 * Math.min(1, spin.age / 0.5)], i * 4);\r
      }\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.001, 0.05) : 1 / 60;\r
      last = now;\r
      if (!reduce) time += dt * s.speed * 0.16;\r
      if (introClock < 1) introClock = Math.min(1, introClock + dt / INTRO_SECONDS);\r
      grainClock += dt;\r
      if (s.grainAnimated && !reduce && grainClock > 1 / 24) {\r
        grainClock = 0;\r
        frameSeed = (frameSeed + 1) % 97;\r
      }\r
      updateTouches(dt, view.width / view.height);\r
      draw();\r
      const busy =\r
        (!reduce && (s.speed > 0 || s.grainAnimated)) || introClock < 1 || trail.length > 0 || spins.length > 0;\r
      if (busy) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    function wake() {\r
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    }\r
\r
    const locate = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = (event.clientX - rect.left) / Math.max(1, rect.width);\r
      const y = 1 - (event.clientY - rect.top) / Math.max(1, rect.height);\r
      pointer.inside = x >= 0 && x <= 1 && y >= 0 && y <= 1;\r
      pointer.x = x;\r
      pointer.y = y;\r
      if (pointer.fresh || !pointer.inside) {\r
        pointer.sx = x;\r
        pointer.sy = y;\r
        pointer.fresh = false;\r
      }\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      locate(event);\r
      if (pointer.inside || trail.length) wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      locate(event);\r
      const s = settingsRef.current;\r
      if (!pointer.inside || !s.clickSwirl || reduce) return;\r
      spins.unshift({\r
        x: (pointer.x - 0.5) * (view.width / view.height),\r
        y: pointer.y - 0.5,\r
        age: 0,\r
        direction: pointer.vx < 0 ? 1 : -1\r
      });\r
      if (spins.length > MAX_TWIRLS) spins.pop();\r
      wake();\r
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
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
    wakeRef.current = wake;\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteTexture(target);\r
      gl.deleteFramebuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(field.program);\r
      gl.deleteProgram(composite.program);\r
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
export default Grainient;\r
`,a={usage:`import Grainient from './Grainient';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <Grainient
    colors={['#120f17', '#2a0f0a', '#9a3412', '#f97316', '#fed7aa']}
    angle={55}
    flow={0.8}
    silk={0.35}
    grainAmount={0.08}
  />
</div>`,code:n,css:r,tailwind:e,tsCode:t,tsTailwind:i};export{a as grainient};
