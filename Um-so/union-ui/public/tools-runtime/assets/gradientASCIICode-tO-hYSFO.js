const r=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
import './GradientASCII.css';\r
\r
const MAX_COLORS = 8;\r
const MAX_CLICKS = 4;\r
const MAX_TRAIL = 24;\r
const CLICK_LIFE = 1.2;\r
const TRAIL_LIFE = 0.7;\r
const TRAIL_STEP = 0.015;\r
const INTRO_SECONDS = 2.4;\r
const ATLAS_CELL_W = 60;\r
const ATLAS_CELL_H = 100;\r
const ATLAS_COLUMNS = 16;\r
const FONT_SCALE = 0.78;\r
const DEFAULT_COLORS = ['#1e3fd8', '#f6f8ff', '#a5d8ff', '#38bdf8'];\r
const DEFAULT_CHARACTERS = ' =+xX0S8#@';\r
const DEFAULT_FONT = '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';\r
const SHAPES = { horizon: 0, pinch: 1, rise: 2, eclipse: 3 };\r
const CLICK_EFFECTS = { none: 0, wave: 1, burst: 2 };\r
\r
const VERTEX = \`#version 300 es\r
out vec2 vUv;\r
void main() {\r
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\r
  vUv = p;\r
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const COMMON = \`\r
float hash12(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * 0.1031);\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.x + q.y) * q.z);\r
}\r
\`;\r
\r
const FIELD = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform float uAspect;\r
uniform float uTime;\r
uniform int uShape;\r
uniform vec3 uRamp[8];\r
uniform int uCount;\r
uniform float uScale;\r
uniform float uSoftness;\r
uniform float uFlow;\r
uniform vec2 uSeed;\r
uniform vec4 uTrail[24];\r
uniform float uRadius;\r
uniform vec4 uClicks[4];\r
uniform int uClickEffect;\r
uniform float uIntro;\r
uniform float uFrame;\r
in vec2 vUv;\r
layout(location = 0) out vec4 outColor;\r
layout(location = 1) out vec4 outAux;\r
\${COMMON}\r
vec2 hash22(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.103, 0.0973));\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.xx + q.yz) * q.zy) * 2.0 - 1.0;\r
}\r
\r
float noise(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = fract(p);\r
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);\r
  float a = dot(hash22(i), f);\r
  float b = dot(hash22(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));\r
  float c = dot(hash22(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));\r
  float d = dot(hash22(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));\r
  return 0.5 + 0.5 * mix(mix(a, b, u.x), mix(c, d, u.x), u.y);\r
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
vec3 horizon(vec2 p, float time, out float order) {\r
  float span = 0.5 * max(uAspect, 1.0);\r
  float x = p.x / span;\r
  float arch = -0.17 - 0.2 * x * x + 0.02 * sin(time * 0.6);\r
  float soft = mix(0.05, 0.22, uSoftness);\r
  float edge = p.y - arch;\r
  float rim = 0.38 * smoothstep(-soft, 0.42, edge);\r
  vec2 sun = vec2(0.08 * sin(time * 0.31) * span, 0.58);\r
  float spread = length((p - sun) / vec2(0.95 * span, 0.75));\r
  float sky = mix(0.55, 1.0, smoothstep(0.2, 0.95, spread));\r
  order = clamp(edge * 1.3, 0.0, 1.0);\r
  return vec3(rim, sky, smoothstep(0.18, 0.62, edge));\r
}\r
\r
vec3 pinch(vec2 p, float time, out float order) {\r
  float span = 0.5 * max(uAspect, 0.75);\r
  float x = p.x / span;\r
  float sway = 0.02 * sin(x * 1.7 + time * 0.55);\r
  float breathe = 1.0 + 0.06 * sin(time * 0.8);\r
  float width = (0.13 + 0.22 * x * x) * breathe * mix(0.85, 1.2, uSoftness);\r
  float y = abs(p.y - sway) / width;\r
  float t = exp(-pow(y, 2.2)) * (0.42 + 0.58 * exp(-x * x * 1.8));\r
  order = clamp(abs(p.y - sway) * 2.4 + abs(x) * 0.3, 0.0, 1.0);\r
  return vec3(t, t, 0.0);\r
}\r
\r
vec3 rise(vec2 p, float time, out float order) {\r
  float wide = max(uAspect, 0.9);\r
  vec2 center = vec2(0.05 * sin(time * 0.45) * wide, -0.7);\r
  vec2 radius = vec2(0.82 * wide, 0.64 * (1.0 + 0.04 * sin(time * 0.8)));\r
  float d = length((p - center) / radius);\r
  float soft = mix(0.6, 1.15, uSoftness);\r
  float t = clamp(pow(clamp(1.0 - d, 0.0, 1.0), soft) * 1.35, 0.0, 1.0);\r
  order = clamp((d - 0.2) * 1.3, 0.0, 1.0);\r
  return vec3(t, t, 0.0);\r
}\r
\r
vec3 eclipse(vec2 p, float time, out float order) {\r
  float fit = min(1.0, uAspect * 1.25);\r
  float r = 0.23 * fit * (1.0 + 0.015 * sin(time * 0.9));\r
  float angle = atan(p.y, p.x);\r
  float rays = noise(vec2(cos(angle), sin(angle)) * 2.2 + time * 0.08) * 0.8 + 0.6;\r
  float d = length(p) - r;\r
  float reach = mix(0.07, 0.15, uSoftness) * rays * fit;\r
  float t = smoothstep(-0.006, 0.006 + 0.02 * uSoftness, d) * exp(-max(d, 0.0) / reach);\r
  order = clamp(d * 2.0, 0.0, 1.0);\r
  return vec3(t, t, 0.0);\r
}\r
\r
vec4 tone(float t) {\r
  float x = smoothstep(0.3, 1.0, t) * float(uCount - 1);\r
  int index = int(floor(x));\r
  return vec4(mix(uRamp[index], uRamp[min(index + 1, uCount - 1)], fract(x)), smoothstep(0.0, 0.38, t));\r
}\r
\r
void main() {\r
  vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);\r
  float time = uTime;\r
  vec2 q = p / uScale;\r
  vec2 warp = vec2(\r
    noise(q * 1.6 + uSeed + vec2(0.0, time * 0.3)),\r
    noise(q * 1.6 + uSeed.yx + vec2(4.3, -time * 0.24))\r
  ) - 0.5;\r
  q += warp * uFlow * (uShape == 3 ? 0.04 : 0.18);\r
  float order = 0.0;\r
  vec3 shape;\r
  if (uShape == 0) shape = horizon(q, time, order);\r
  else if (uShape == 1) shape = pinch(q, time, order);\r
  else if (uShape == 2) shape = rise(q, time, order);\r
  else shape = eclipse(q, time, order);\r
\r
  float reveal = clamp((uIntro * 1.45 - order) / 0.45, 0.0, 1.0);\r
  reveal = reveal * reveal * (3.0 - 2.0 * reveal);\r
\r
  float scramble = 0.0;\r
  for (int i = 0; i < 24; i++) {\r
    vec4 point = uTrail[i];\r
    if (point.z <= 0.0) continue;\r
    vec2 d = p - point.xy;\r
    scramble = max(scramble, point.z * exp(-dot(d, d) / (uRadius * uRadius)));\r
  }\r
  for (int i = 0; i < 4; i++) {\r
    vec4 c = uClicks[i];\r
    if (c.w <= 0.0) continue;\r
    float d = length(p - c.xy);\r
    if (uClickEffect == 1) {\r
      scramble = max(scramble, exp(-pow((d - c.z * 0.75) / 0.06, 2.0)) * c.w);\r
    } else if (uClickEffect == 2) {\r
      float size = 0.08 + 0.22 * (1.0 - exp(-c.z * 5.0));\r
      scramble = max(scramble, (1.0 - smoothstep(size * 0.6, size, d)) * c.w);\r
    }\r
  }\r
  vec2 t = clamp(shape.xy * mix(0.7, 1.0, reveal), 0.0, 1.0);\r
  vec4 mixed = mix(tone(t.x), tone(t.y), shape.z);\r
  vec3 color = encode(labToRgb(mixed.rgb));\r
  float alpha = mixed.a * reveal;\r
  float dither = (hash12(gl_FragCoord.xy + uFrame * 13.7) - 0.5) / 255.0;\r
  outColor = clamp(vec4(color * alpha + dither, alpha + dither), 0.0, 1.0);\r
  outAux = vec4(reveal, scramble, 0.0, 1.0);\r
}\`;\r
\r
const GLYPHS = \`\r
uniform sampler2D uField;\r
uniform sampler2D uAux;\r
uniform sampler2D uAtlas;\r
uniform vec2 uResolution;\r
uniform vec2 uCell;\r
uniform vec2 uOffset;\r
uniform vec2 uAtlasGrid;\r
uniform float uCount;\r
uniform float uDensity;\r
uniform float uOpacity;\r
uniform float uFlicker;\r
uniform float uDepth;\r
uniform float uGlyphTime;\r
uniform float uSeedValue;\r
uniform float uLight;\r
\${COMMON}\r
float sampleGlyph(float index, vec2 local, vec2 coord, float soft) {\r
  float column = mod(index, uAtlasGrid.x);\r
  float row = floor(index / uAtlasGrid.x);\r
  vec2 atlasUv = vec2((column + local.x) / uAtlasGrid.x, (row + 1.0 - local.y) / uAtlasGrid.y);\r
  vec2 continuous = coord / uAtlasGrid;\r
  float scale = exp2(soft);\r
  return textureGrad(uAtlas, atlasUv, dFdx(continuous) * scale, dFdy(continuous) * scale).a;\r
}\r
\r
vec4 glyphAt(vec2 px) {\r
  vec2 coord = (px - uOffset) / uCell;\r
  vec2 cell = floor(coord);\r
  vec2 local = coord - cell;\r
  vec2 uv = clamp(((cell + 0.5) * uCell + uOffset) / uResolution, vec2(0.0), vec2(1.0));\r
  vec4 field = texture(uField, uv);\r
  vec4 aux = texture(uAux, uv);\r
  vec3 visible = uLight > 0.5 ? field.rgb + (1.0 - field.a) : field.rgb;\r
  float luma = dot(visible, vec3(0.2126, 0.7152, 0.0722));\r
  float value = uLight > 0.5 ? clamp((1.0 - luma) * 1.5, 0.0, 1.0) : luma;\r
  float pick = hash12(cell + uSeedValue * 7.31);\r
  float level = hash12(cell * 1.73 + 4.1 + uSeedValue);\r
  float tick = floor(uGlyphTime * 9.0 + level * 9.0);\r
  float wobble = (hash12(cell * 2.31 + tick * 17.7) - 0.5) * uFlicker * 0.4 + (level - 0.5) * 0.1;\r
  float tone = clamp(pow(value, 0.75) + wobble, 0.0, 1.0);\r
  float index = floor(tone * (uCount - 1.0) + 0.5);\r
  float decode = max(aux.g, 1.0 - aux.r);\r
  if (decode > 0.02) {\r
    float frame = floor(uGlyphTime * 20.0);\r
    if (hash12(cell * 3.7 + frame * 5.3) < decode * 1.25) index = 1.0 + floor(hash12(cell + frame * 1.37) * (uCount - 1.0));\r
  }\r
  float present = step(pick, uDensity * mix(1.0, 0.3 + tone * 1.1, 0.55));\r
  float cutoff = smoothstep(0.03, 0.1, value);\r
  float focus = step(hash12(cell * 0.71 + 9.2 + uSeedValue), uDepth);\r
  float coverage = sampleGlyph(index, local, coord, focus * 1.2);\r
  float alpha = uOpacity * present * cutoff * coverage * mix(1.0, 0.35 + 0.65 * level, 0.55) * (1.0 - focus * 0.5);\r
  if (uLight < 0.5) {\r
    vec3 light = field.rgb * 0.55 + vec3(0.03) * field.a;\r
    return vec4(light * alpha, 0.6 * field.a * alpha);\r
  }\r
  vec3 ink = visible * 0.8;\r
  return vec4(ink * alpha, alpha);\r
}\r
\`;\r
\r
const HALO = \`#version 300 es\r
precision highp float;\r
uniform float uDownscale;\r
in vec2 vUv;\r
out vec4 outColor;\r
\${GLYPHS}\r
void main() {\r
  outColor = glyphAt(gl_FragCoord.xy * uDownscale);\r
}\`;\r
\r
const BLUR = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uSource;\r
uniform vec2 uStep;\r
in vec2 vUv;\r
out vec4 outColor;\r
void main() {\r
  vec4 sum = texture(uSource, vUv) * 0.2270270270;\r
  sum += texture(uSource, vUv + uStep * 1.3846153846) * 0.3162162162;\r
  sum += texture(uSource, vUv - uStep * 1.3846153846) * 0.3162162162;\r
  sum += texture(uSource, vUv + uStep * 3.2307692308) * 0.0702702703;\r
  sum += texture(uSource, vUv - uStep * 3.2307692308) * 0.0702702703;\r
  outColor = sum;\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uHalo;\r
uniform float uGlow;\r
uniform float uGradient;\r
uniform float uGrain;\r
uniform float uFrame;\r
in vec2 vUv;\r
out vec4 outColor;\r
\${GLYPHS}\r
void main() {\r
  vec4 base = texture(uField, vUv) * uGradient;\r
  vec4 glyph = glyphAt(gl_FragCoord.xy);\r
  vec4 halo = texture(uHalo, vUv) * uGlow;\r
  vec4 color;\r
  if (uLight < 0.5) {\r
    color = base + glyph + halo;\r
  } else {\r
    color = glyph + base * (1.0 - glyph.a);\r
    color += halo * 0.6 * (1.0 - color.a);\r
  }\r
  float grain = (hash12(gl_FragCoord.xy + uFrame * vec2(17.0, 59.0)) + hash12(gl_FragCoord.xy * 1.31 + uFrame * 7.0) - 1.0) * uGrain;\r
  float body = clamp(color.a, 0.0, 1.0);\r
  color.rgb += grain * (0.25 + body) * 0.5;\r
  color.a = clamp(color.a, 0.0, 1.0);\r
  color.rgb = clamp(color.rgb, 0.0, color.a);\r
  outColor = color;\r
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
const createTarget = (gl, count) => {\r
  const textures = Array.from({ length: count }, () => {\r
    const texture = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, texture);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    return texture;\r
  });\r
  return { textures, framebuffer: gl.createFramebuffer(), width: 0, height: 0 };\r
};\r
\r
const sizeTarget = (gl, target, width, height) => {\r
  if (target.width === width && target.height === height) return;\r
  target.width = width;\r
  target.height = height;\r
  gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);\r
  target.textures.forEach((texture, i) => {\r
    gl.bindTexture(gl.TEXTURE_2D, texture);\r
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, texture, 0);\r
  });\r
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
};\r
\r
const buildAtlas = (gl, characters, fontFamily) => {\r
  const list = [...new Set([...characters].filter(char => char !== '\\n' && char !== '\\r'))];\r
  if (!list.length) list.push(' ');\r
  const font = \`300 \${Math.round(ATLAS_CELL_H * FONT_SCALE)}px \${fontFamily}\`;\r
  const columns = Math.min(ATLAS_COLUMNS, list.length);\r
  const rows = Math.ceil(list.length / columns);\r
  const canvas = document.createElement('canvas');\r
  canvas.width = ATLAS_CELL_W * columns;\r
  canvas.height = ATLAS_CELL_H * rows;\r
  const context = canvas.getContext('2d');\r
  if (context) {\r
    context.font = font;\r
    context.textAlign = 'center';\r
    context.textBaseline = 'middle';\r
    context.fillStyle = '#fff';\r
    list.forEach((char, index) => {\r
      const column = index % columns;\r
      const row = Math.floor(index / columns);\r
      context.fillText(char, column * ATLAS_CELL_W + ATLAS_CELL_W / 2, row * ATLAS_CELL_H + ATLAS_CELL_H / 2 + 3);\r
    });\r
  }\r
  const texture = gl.createTexture();\r
  gl.bindTexture(gl.TEXTURE_2D, texture);\r
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);\r
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, canvas);\r
  gl.generateMipmap(gl.TEXTURE_2D);\r
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);\r
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
  return { texture, count: list.length, grid: [columns, rows] };\r
};\r
\r
const GradientASCII = ({\r
  colors = DEFAULT_COLORS,\r
  shape = 'horizon',\r
  characters = DEFAULT_CHARACTERS,\r
  cellSize = 18,\r
  density = 0.8,\r
  glyphOpacity = 0.85,\r
  glow = 0.2,\r
  depthOfField = 0,\r
  flicker = 0.2,\r
  softness = 0.5,\r
  scale = 1,\r
  flow = 0.5,\r
  speed = 1,\r
  gradientOpacity = 0.9,\r
  grain = 0.08,\r
  variation = 0,\r
  mouseInteraction = true,\r
  scrambleRadius = 0.1,\r
  clickEffect = 'wave',\r
  intro = true,\r
  lightMode = false,\r
  fontFamily = DEFAULT_FONT,\r
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
    shape: SHAPES[shape] ?? 0,\r
    characters: characters || DEFAULT_CHARACTERS,\r
    cellSize: clamp(cellSize, 6, 64),\r
    density: clamp(density, 0, 1),\r
    glyphOpacity: clamp(glyphOpacity, 0, 1),\r
    glow: clamp(glow, 0, 2),\r
    depthOfField: clamp(depthOfField, 0, 1),\r
    flicker: clamp(flicker, 0, 1),\r
    softness: clamp(softness, 0, 1),\r
    scale: clamp(scale, 0.4, 2.5),\r
    flow: clamp(flow, 0, 2),\r
    speed: Math.max(0, speed),\r
    gradientOpacity: clamp(gradientOpacity, 0, 1),\r
    grain: clamp(grain, 0, 0.4),\r
    variation: Math.max(0, variation),\r
    mouseInteraction,\r
    scrambleRadius: clamp(scrambleRadius, 0.02, 0.4),\r
    clickEffect: CLICK_EFFECTS[clickEffect] ?? 1,\r
    intro,\r
    lightMode,\r
    fontFamily: fontFamily || DEFAULT_FONT,\r
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
    const field = link(gl, FIELD);\r
    const halo = link(gl, HALO);\r
    const blur = link(gl, BLUR);\r
    const composite = link(gl, COMPOSITE);\r
    if (!field || !halo || !blur || !composite) return undefined;\r
    const vao = gl.createVertexArray();\r
    const fieldTarget = createTarget(gl, 2);\r
    const haloA = createTarget(gl, 1);\r
    const haloB = createTarget(gl, 1);\r
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
    const clickData = new Float32Array(MAX_CLICKS * 4);\r
    const clicks = [];\r
    const trailData = new Float32Array(MAX_TRAIL * 4);\r
    const trail = [];\r
    const pointer = { x: 0, y: 0, inside: false };\r
    let atlas = null;\r
    let atlasKey = '';\r
    let paletteKey = '';\r
    let time = 0;\r
    let glyphTime = 0;\r
    let introClock = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let frameSeed = 0;\r
    let grainClock = 0;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let disposed = false;\r
\r
    const syncAtlas = () => {\r
      const s = settingsRef.current;\r
      const key = \`\${s.fontFamily}|\${s.characters}\`;\r
      if (key === atlasKey && atlas) return;\r
      atlasKey = key;\r
      if (atlas) gl.deleteTexture(atlas.texture);\r
      atlas = buildAtlas(gl, s.characters, s.fontFamily);\r
      document.fonts?.load?.(\`300 64px \${s.fontFamily}\`, s.characters).then(\r
        () => {\r
          if (disposed || atlasKey !== key) return;\r
          if (atlas) gl.deleteTexture(atlas.texture);\r
          atlas = buildAtlas(gl, s.characters, s.fontFamily);\r
          draw();\r
        },\r
        () => {}\r
      );\r
    };\r
\r
    const syncPalette = () => {\r
      const s = settingsRef.current;\r
      const key = s.colors.join(',');\r
      if (key === paletteKey) return;\r
      paletteKey = key;\r
      s.colors.forEach((color, i) => ramp.set(toLab(parse(color)), i * 3));\r
    };\r
\r
    const bindGlyphs = (program, width, height) => {\r
      if (!atlas) return;\r
      const s = settingsRef.current;\r
      const u = program.uniforms;\r
      const cellH = s.cellSize * view.ratio;\r
      const cellW = cellH * (ATLAS_CELL_W / ATLAS_CELL_H);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, fieldTarget.textures[0]);\r
      gl.uniform1i(u.uField, 0);\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.bindTexture(gl.TEXTURE_2D, fieldTarget.textures[1]);\r
      gl.uniform1i(u.uAux, 1);\r
      gl.activeTexture(gl.TEXTURE2);\r
      gl.bindTexture(gl.TEXTURE_2D, atlas.texture);\r
      gl.uniform1i(u.uAtlas, 2);\r
      gl.uniform2f(u.uResolution, width, height);\r
      gl.uniform2f(u.uCell, cellW, cellH);\r
      gl.uniform2f(\r
        u.uOffset,\r
        (width - Math.ceil(width / cellW) * cellW) / 2,\r
        (height - Math.ceil(height / cellH) * cellH) / 2\r
      );\r
      gl.uniform2f(u.uAtlasGrid, atlas.grid[0], atlas.grid[1]);\r
      gl.uniform1f(u.uCount, atlas.count);\r
      gl.uniform1f(u.uDensity, s.density);\r
      gl.uniform1f(u.uOpacity, s.glyphOpacity);\r
      gl.uniform1f(u.uFlicker, reduce ? 0 : s.flicker);\r
      gl.uniform1f(u.uDepth, s.depthOfField);\r
      gl.uniform1f(u.uGlyphTime, glyphTime);\r
      gl.uniform1f(u.uSeedValue, s.variation);\r
      gl.uniform1f(u.uLight, s.lightMode ? 1 : 0);\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      const aspect = view.width / view.height;\r
      syncAtlas();\r
      syncPalette();\r
      gl.bindVertexArray(vao);\r
      gl.disable(gl.BLEND);\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, fieldTarget.framebuffer);\r
      gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);\r
      gl.viewport(0, 0, fieldTarget.width, fieldTarget.height);\r
      gl.useProgram(field.program);\r
      const fu = field.uniforms;\r
      gl.uniform1f(fu.uAspect, aspect);\r
      gl.uniform1f(fu.uTime, time);\r
      gl.uniform1i(fu.uShape, s.shape);\r
      gl.uniform3fv(fu.uRamp, ramp);\r
      gl.uniform1i(fu.uCount, s.colors.length);\r
      gl.uniform1f(fu.uScale, s.scale);\r
      gl.uniform1f(fu.uSoftness, s.softness);\r
      gl.uniform1f(fu.uFlow, s.flow);\r
      gl.uniform2f(fu.uSeed, s.variation * 3.17, s.variation * 1.91);\r
      gl.uniform4fv(fu.uTrail, trailData);\r
      gl.uniform1f(fu.uRadius, s.scrambleRadius);\r
      gl.uniform4fv(fu.uClicks, clickData);\r
      gl.uniform1i(fu.uClickEffect, s.clickEffect);\r
      gl.uniform1f(fu.uIntro, introClock);\r
      gl.uniform1f(fu.uFrame, frameSeed);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      const glowing = s.glow > 0.001;\r
      if (glowing) {\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, haloA.framebuffer);\r
        gl.drawBuffers([gl.COLOR_ATTACHMENT0]);\r
        gl.viewport(0, 0, haloA.width, haloA.height);\r
        gl.useProgram(halo.program);\r
        bindGlyphs(halo, canvas.width, canvas.height);\r
        gl.uniform1f(halo.uniforms.uDownscale, canvas.width / haloA.width);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
        gl.useProgram(blur.program);\r
        gl.activeTexture(gl.TEXTURE0);\r
        gl.uniform1i(blur.uniforms.uSource, 0);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, haloB.framebuffer);\r
        gl.bindTexture(gl.TEXTURE_2D, haloA.textures[0]);\r
        gl.uniform2f(blur.uniforms.uStep, 1 / haloA.width, 0);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, haloA.framebuffer);\r
        gl.bindTexture(gl.TEXTURE_2D, haloB.textures[0]);\r
        gl.uniform2f(blur.uniforms.uStep, 0, 1 / haloA.height);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      }\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(composite.program);\r
      bindGlyphs(composite, canvas.width, canvas.height);\r
      const cu = composite.uniforms;\r
      gl.activeTexture(gl.TEXTURE3);\r
      gl.bindTexture(gl.TEXTURE_2D, haloA.textures[0]);\r
      gl.uniform1i(cu.uHalo, 3);\r
      gl.uniform1f(cu.uGlow, glowing ? s.glow : 0);\r
      gl.uniform1f(cu.uGradient, s.gradientOpacity);\r
      gl.uniform1f(cu.uGrain, s.grain);\r
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
      sizeTarget(\r
        gl,\r
        fieldTarget,\r
        Math.max(1, Math.round(canvas.width / 2)),\r
        Math.max(1, Math.round(canvas.height / 2))\r
      );\r
      const haloWidth = Math.max(1, Math.round(canvas.width / 4));\r
      const haloHeight = Math.max(1, Math.round(canvas.height / 4));\r
      sizeTarget(gl, haloA, haloWidth, haloHeight);\r
      sizeTarget(gl, haloB, haloWidth, haloHeight);\r
      draw();\r
      wake();\r
    };\r
\r
    const updateInput = dt => {\r
      trail.forEach(point => {\r
        point.age += dt;\r
      });\r
      while (trail.length && trail[trail.length - 1].age > TRAIL_LIFE) trail.pop();\r
      for (let i = 0; i < MAX_TRAIL; i++) {\r
        const point = trail[i];\r
        if (!point) {\r
          trailData[i * 4 + 2] = 0;\r
          continue;\r
        }\r
        const k = 1 - point.age / TRAIL_LIFE;\r
        trailData.set([point.x, point.y, k * k, 0], i * 4);\r
      }\r
      clicks.forEach(click => {\r
        click.age += dt;\r
      });\r
      while (clicks.length && clicks[clicks.length - 1].age > CLICK_LIFE) clicks.pop();\r
      for (let i = 0; i < MAX_CLICKS; i++) {\r
        const click = clicks[i];\r
        if (!click) {\r
          clickData[i * 4 + 3] = 0;\r
          continue;\r
        }\r
        const k = click.age / CLICK_LIFE;\r
        const envelope = Math.min(1, click.age / 0.08) * (1 - k) * (1 - k);\r
        clickData.set([click.x, click.y, click.age, envelope], i * 4);\r
      }\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (disposed || !visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.001, 0.05) : 1 / 60;\r
      last = now;\r
      if (!reduce) {\r
        time += dt * s.speed * 0.5;\r
        glyphTime += dt * Math.max(s.speed, 0.15);\r
      }\r
      if (introClock < 1) introClock = Math.min(1, introClock + dt / INTRO_SECONDS);\r
      grainClock += dt;\r
      if (!reduce && grainClock > 1 / 24) {\r
        grainClock = 0;\r
        frameSeed = (frameSeed + 1) % 97;\r
      }\r
      updateInput(dt);\r
      draw();\r
      const busy = !reduce || introClock < 1 || clicks.length > 0 || trail.length > 0;\r
      if (busy) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    function wake() {\r
      if (!raf && !disposed && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    }\r
\r
    const locate = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = (event.clientX - rect.left) / Math.max(1, rect.width);\r
      const y = 1 - (event.clientY - rect.top) / Math.max(1, rect.height);\r
      const aspect = rect.width / Math.max(1, rect.height);\r
      pointer.inside = x >= 0 && x <= 1 && y >= 0 && y <= 1;\r
      pointer.x = (x - 0.5) * aspect;\r
      pointer.y = y - 0.5;\r
    };\r
\r
    const onPointerMove = event => {\r
      locate(event);\r
      const s = settingsRef.current;\r
      if (!pointer.inside || !s.mouseInteraction || reduce) return;\r
      const head = trail[0];\r
      const gap = head ? Math.hypot(pointer.x - head.x, pointer.y - head.y) : Infinity;\r
      if (gap < TRAIL_STEP) return;\r
      if (head && head.age < 0.1) {\r
        const steps = Math.min(6, Math.floor(gap / (TRAIL_STEP * 2)));\r
        for (let i = 1; i <= steps; i++) {\r
          const k = i / (steps + 1);\r
          trail.unshift({ x: head.x + (pointer.x - head.x) * k, y: head.y + (pointer.y - head.y) * k, age: 0 });\r
        }\r
      }\r
      trail.unshift({ x: pointer.x, y: pointer.y, age: 0 });\r
      trail.length = Math.min(trail.length, MAX_TRAIL);\r
      wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      locate(event);\r
      const s = settingsRef.current;\r
      if (!pointer.inside || !s.clickEffect || reduce) return;\r
      clicks.unshift({ x: pointer.x, y: pointer.y, age: 0 });\r
      if (clicks.length > MAX_CLICKS) clicks.pop();\r
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
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
    wakeRef.current = wake;\r
\r
    return () => {\r
      disposed = true;\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      [fieldTarget, haloA, haloB].forEach(target => {\r
        target.textures.forEach(texture => gl.deleteTexture(texture));\r
        gl.deleteFramebuffer(target.framebuffer);\r
      });\r
      if (atlas) gl.deleteTexture(atlas.texture);\r
      gl.deleteVertexArray(vao);\r
      [field, halo, blur, composite].forEach(item => gl.deleteProgram(item.program));\r
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
      className={\`gradient-ascii-container\${className ? \` \${className}\` : ''}\`}\r
      style={style}\r
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className="gradient-ascii-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default GradientASCII;\r
`,n=`.gradient-ascii-container {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.gradient-ascii-canvas {\r
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
const MAX_CLICKS = 4;\r
const MAX_TRAIL = 24;\r
const CLICK_LIFE = 1.2;\r
const TRAIL_LIFE = 0.7;\r
const TRAIL_STEP = 0.015;\r
const INTRO_SECONDS = 2.4;\r
const ATLAS_CELL_W = 60;\r
const ATLAS_CELL_H = 100;\r
const ATLAS_COLUMNS = 16;\r
const FONT_SCALE = 0.78;\r
const DEFAULT_COLORS = ['#1e3fd8', '#f6f8ff', '#a5d8ff', '#38bdf8'];\r
const DEFAULT_CHARACTERS = ' =+xX0S8#@';\r
const DEFAULT_FONT = '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';\r
const SHAPES = { horizon: 0, pinch: 1, rise: 2, eclipse: 3 };\r
const CLICK_EFFECTS = { none: 0, wave: 1, burst: 2 };\r
\r
const VERTEX = \`#version 300 es\r
out vec2 vUv;\r
void main() {\r
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\r
  vUv = p;\r
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const COMMON = \`\r
float hash12(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * 0.1031);\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.x + q.y) * q.z);\r
}\r
\`;\r
\r
const FIELD = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform float uAspect;\r
uniform float uTime;\r
uniform int uShape;\r
uniform vec3 uRamp[8];\r
uniform int uCount;\r
uniform float uScale;\r
uniform float uSoftness;\r
uniform float uFlow;\r
uniform vec2 uSeed;\r
uniform vec4 uTrail[24];\r
uniform float uRadius;\r
uniform vec4 uClicks[4];\r
uniform int uClickEffect;\r
uniform float uIntro;\r
uniform float uFrame;\r
in vec2 vUv;\r
layout(location = 0) out vec4 outColor;\r
layout(location = 1) out vec4 outAux;\r
\${COMMON}\r
vec2 hash22(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.103, 0.0973));\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.xx + q.yz) * q.zy) * 2.0 - 1.0;\r
}\r
\r
float noise(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = fract(p);\r
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);\r
  float a = dot(hash22(i), f);\r
  float b = dot(hash22(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));\r
  float c = dot(hash22(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));\r
  float d = dot(hash22(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));\r
  return 0.5 + 0.5 * mix(mix(a, b, u.x), mix(c, d, u.x), u.y);\r
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
vec3 horizon(vec2 p, float time, out float order) {\r
  float span = 0.5 * max(uAspect, 1.0);\r
  float x = p.x / span;\r
  float arch = -0.17 - 0.2 * x * x + 0.02 * sin(time * 0.6);\r
  float soft = mix(0.05, 0.22, uSoftness);\r
  float edge = p.y - arch;\r
  float rim = 0.38 * smoothstep(-soft, 0.42, edge);\r
  vec2 sun = vec2(0.08 * sin(time * 0.31) * span, 0.58);\r
  float spread = length((p - sun) / vec2(0.95 * span, 0.75));\r
  float sky = mix(0.55, 1.0, smoothstep(0.2, 0.95, spread));\r
  order = clamp(edge * 1.3, 0.0, 1.0);\r
  return vec3(rim, sky, smoothstep(0.18, 0.62, edge));\r
}\r
\r
vec3 pinch(vec2 p, float time, out float order) {\r
  float span = 0.5 * max(uAspect, 0.75);\r
  float x = p.x / span;\r
  float sway = 0.02 * sin(x * 1.7 + time * 0.55);\r
  float breathe = 1.0 + 0.06 * sin(time * 0.8);\r
  float width = (0.13 + 0.22 * x * x) * breathe * mix(0.85, 1.2, uSoftness);\r
  float y = abs(p.y - sway) / width;\r
  float t = exp(-pow(y, 2.2)) * (0.42 + 0.58 * exp(-x * x * 1.8));\r
  order = clamp(abs(p.y - sway) * 2.4 + abs(x) * 0.3, 0.0, 1.0);\r
  return vec3(t, t, 0.0);\r
}\r
\r
vec3 rise(vec2 p, float time, out float order) {\r
  float wide = max(uAspect, 0.9);\r
  vec2 center = vec2(0.05 * sin(time * 0.45) * wide, -0.7);\r
  vec2 radius = vec2(0.82 * wide, 0.64 * (1.0 + 0.04 * sin(time * 0.8)));\r
  float d = length((p - center) / radius);\r
  float soft = mix(0.6, 1.15, uSoftness);\r
  float t = clamp(pow(clamp(1.0 - d, 0.0, 1.0), soft) * 1.35, 0.0, 1.0);\r
  order = clamp((d - 0.2) * 1.3, 0.0, 1.0);\r
  return vec3(t, t, 0.0);\r
}\r
\r
vec3 eclipse(vec2 p, float time, out float order) {\r
  float fit = min(1.0, uAspect * 1.25);\r
  float r = 0.23 * fit * (1.0 + 0.015 * sin(time * 0.9));\r
  float angle = atan(p.y, p.x);\r
  float rays = noise(vec2(cos(angle), sin(angle)) * 2.2 + time * 0.08) * 0.8 + 0.6;\r
  float d = length(p) - r;\r
  float reach = mix(0.07, 0.15, uSoftness) * rays * fit;\r
  float t = smoothstep(-0.006, 0.006 + 0.02 * uSoftness, d) * exp(-max(d, 0.0) / reach);\r
  order = clamp(d * 2.0, 0.0, 1.0);\r
  return vec3(t, t, 0.0);\r
}\r
\r
vec4 tone(float t) {\r
  float x = smoothstep(0.3, 1.0, t) * float(uCount - 1);\r
  int index = int(floor(x));\r
  return vec4(mix(uRamp[index], uRamp[min(index + 1, uCount - 1)], fract(x)), smoothstep(0.0, 0.38, t));\r
}\r
\r
void main() {\r
  vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);\r
  float time = uTime;\r
  vec2 q = p / uScale;\r
  vec2 warp = vec2(\r
    noise(q * 1.6 + uSeed + vec2(0.0, time * 0.3)),\r
    noise(q * 1.6 + uSeed.yx + vec2(4.3, -time * 0.24))\r
  ) - 0.5;\r
  q += warp * uFlow * (uShape == 3 ? 0.04 : 0.18);\r
  float order = 0.0;\r
  vec3 shape;\r
  if (uShape == 0) shape = horizon(q, time, order);\r
  else if (uShape == 1) shape = pinch(q, time, order);\r
  else if (uShape == 2) shape = rise(q, time, order);\r
  else shape = eclipse(q, time, order);\r
\r
  float reveal = clamp((uIntro * 1.45 - order) / 0.45, 0.0, 1.0);\r
  reveal = reveal * reveal * (3.0 - 2.0 * reveal);\r
\r
  float scramble = 0.0;\r
  for (int i = 0; i < 24; i++) {\r
    vec4 point = uTrail[i];\r
    if (point.z <= 0.0) continue;\r
    vec2 d = p - point.xy;\r
    scramble = max(scramble, point.z * exp(-dot(d, d) / (uRadius * uRadius)));\r
  }\r
  for (int i = 0; i < 4; i++) {\r
    vec4 c = uClicks[i];\r
    if (c.w <= 0.0) continue;\r
    float d = length(p - c.xy);\r
    if (uClickEffect == 1) {\r
      scramble = max(scramble, exp(-pow((d - c.z * 0.75) / 0.06, 2.0)) * c.w);\r
    } else if (uClickEffect == 2) {\r
      float size = 0.08 + 0.22 * (1.0 - exp(-c.z * 5.0));\r
      scramble = max(scramble, (1.0 - smoothstep(size * 0.6, size, d)) * c.w);\r
    }\r
  }\r
  vec2 t = clamp(shape.xy * mix(0.7, 1.0, reveal), 0.0, 1.0);\r
  vec4 mixed = mix(tone(t.x), tone(t.y), shape.z);\r
  vec3 color = encode(labToRgb(mixed.rgb));\r
  float alpha = mixed.a * reveal;\r
  float dither = (hash12(gl_FragCoord.xy + uFrame * 13.7) - 0.5) / 255.0;\r
  outColor = clamp(vec4(color * alpha + dither, alpha + dither), 0.0, 1.0);\r
  outAux = vec4(reveal, scramble, 0.0, 1.0);\r
}\`;\r
\r
const GLYPHS = \`\r
uniform sampler2D uField;\r
uniform sampler2D uAux;\r
uniform sampler2D uAtlas;\r
uniform vec2 uResolution;\r
uniform vec2 uCell;\r
uniform vec2 uOffset;\r
uniform vec2 uAtlasGrid;\r
uniform float uCount;\r
uniform float uDensity;\r
uniform float uOpacity;\r
uniform float uFlicker;\r
uniform float uDepth;\r
uniform float uGlyphTime;\r
uniform float uSeedValue;\r
uniform float uLight;\r
\${COMMON}\r
float sampleGlyph(float index, vec2 local, vec2 coord, float soft) {\r
  float column = mod(index, uAtlasGrid.x);\r
  float row = floor(index / uAtlasGrid.x);\r
  vec2 atlasUv = vec2((column + local.x) / uAtlasGrid.x, (row + 1.0 - local.y) / uAtlasGrid.y);\r
  vec2 continuous = coord / uAtlasGrid;\r
  float scale = exp2(soft);\r
  return textureGrad(uAtlas, atlasUv, dFdx(continuous) * scale, dFdy(continuous) * scale).a;\r
}\r
\r
vec4 glyphAt(vec2 px) {\r
  vec2 coord = (px - uOffset) / uCell;\r
  vec2 cell = floor(coord);\r
  vec2 local = coord - cell;\r
  vec2 uv = clamp(((cell + 0.5) * uCell + uOffset) / uResolution, vec2(0.0), vec2(1.0));\r
  vec4 field = texture(uField, uv);\r
  vec4 aux = texture(uAux, uv);\r
  vec3 visible = uLight > 0.5 ? field.rgb + (1.0 - field.a) : field.rgb;\r
  float luma = dot(visible, vec3(0.2126, 0.7152, 0.0722));\r
  float value = uLight > 0.5 ? clamp((1.0 - luma) * 1.5, 0.0, 1.0) : luma;\r
  float pick = hash12(cell + uSeedValue * 7.31);\r
  float level = hash12(cell * 1.73 + 4.1 + uSeedValue);\r
  float tick = floor(uGlyphTime * 9.0 + level * 9.0);\r
  float wobble = (hash12(cell * 2.31 + tick * 17.7) - 0.5) * uFlicker * 0.4 + (level - 0.5) * 0.1;\r
  float tone = clamp(pow(value, 0.75) + wobble, 0.0, 1.0);\r
  float index = floor(tone * (uCount - 1.0) + 0.5);\r
  float decode = max(aux.g, 1.0 - aux.r);\r
  if (decode > 0.02) {\r
    float frame = floor(uGlyphTime * 20.0);\r
    if (hash12(cell * 3.7 + frame * 5.3) < decode * 1.25) index = 1.0 + floor(hash12(cell + frame * 1.37) * (uCount - 1.0));\r
  }\r
  float present = step(pick, uDensity * mix(1.0, 0.3 + tone * 1.1, 0.55));\r
  float cutoff = smoothstep(0.03, 0.1, value);\r
  float focus = step(hash12(cell * 0.71 + 9.2 + uSeedValue), uDepth);\r
  float coverage = sampleGlyph(index, local, coord, focus * 1.2);\r
  float alpha = uOpacity * present * cutoff * coverage * mix(1.0, 0.35 + 0.65 * level, 0.55) * (1.0 - focus * 0.5);\r
  if (uLight < 0.5) {\r
    vec3 light = field.rgb * 0.55 + vec3(0.03) * field.a;\r
    return vec4(light * alpha, 0.6 * field.a * alpha);\r
  }\r
  vec3 ink = visible * 0.8;\r
  return vec4(ink * alpha, alpha);\r
}\r
\`;\r
\r
const HALO = \`#version 300 es\r
precision highp float;\r
uniform float uDownscale;\r
in vec2 vUv;\r
out vec4 outColor;\r
\${GLYPHS}\r
void main() {\r
  outColor = glyphAt(gl_FragCoord.xy * uDownscale);\r
}\`;\r
\r
const BLUR = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uSource;\r
uniform vec2 uStep;\r
in vec2 vUv;\r
out vec4 outColor;\r
void main() {\r
  vec4 sum = texture(uSource, vUv) * 0.2270270270;\r
  sum += texture(uSource, vUv + uStep * 1.3846153846) * 0.3162162162;\r
  sum += texture(uSource, vUv - uStep * 1.3846153846) * 0.3162162162;\r
  sum += texture(uSource, vUv + uStep * 3.2307692308) * 0.0702702703;\r
  sum += texture(uSource, vUv - uStep * 3.2307692308) * 0.0702702703;\r
  outColor = sum;\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uHalo;\r
uniform float uGlow;\r
uniform float uGradient;\r
uniform float uGrain;\r
uniform float uFrame;\r
in vec2 vUv;\r
out vec4 outColor;\r
\${GLYPHS}\r
void main() {\r
  vec4 base = texture(uField, vUv) * uGradient;\r
  vec4 glyph = glyphAt(gl_FragCoord.xy);\r
  vec4 halo = texture(uHalo, vUv) * uGlow;\r
  vec4 color;\r
  if (uLight < 0.5) {\r
    color = base + glyph + halo;\r
  } else {\r
    color = glyph + base * (1.0 - glyph.a);\r
    color += halo * 0.6 * (1.0 - color.a);\r
  }\r
  float grain = (hash12(gl_FragCoord.xy + uFrame * vec2(17.0, 59.0)) + hash12(gl_FragCoord.xy * 1.31 + uFrame * 7.0) - 1.0) * uGrain;\r
  float body = clamp(color.a, 0.0, 1.0);\r
  color.rgb += grain * (0.25 + body) * 0.5;\r
  color.a = clamp(color.a, 0.0, 1.0);\r
  color.rgb = clamp(color.rgb, 0.0, color.a);\r
  outColor = color;\r
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
const createTarget = (gl, count) => {\r
  const textures = Array.from({ length: count }, () => {\r
    const texture = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, texture);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    return texture;\r
  });\r
  return { textures, framebuffer: gl.createFramebuffer(), width: 0, height: 0 };\r
};\r
\r
const sizeTarget = (gl, target, width, height) => {\r
  if (target.width === width && target.height === height) return;\r
  target.width = width;\r
  target.height = height;\r
  gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);\r
  target.textures.forEach((texture, i) => {\r
    gl.bindTexture(gl.TEXTURE_2D, texture);\r
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, texture, 0);\r
  });\r
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
};\r
\r
const buildAtlas = (gl, characters, fontFamily) => {\r
  const list = [...new Set([...characters].filter(char => char !== '\\n' && char !== '\\r'))];\r
  if (!list.length) list.push(' ');\r
  const font = \`300 \${Math.round(ATLAS_CELL_H * FONT_SCALE)}px \${fontFamily}\`;\r
  const columns = Math.min(ATLAS_COLUMNS, list.length);\r
  const rows = Math.ceil(list.length / columns);\r
  const canvas = document.createElement('canvas');\r
  canvas.width = ATLAS_CELL_W * columns;\r
  canvas.height = ATLAS_CELL_H * rows;\r
  const context = canvas.getContext('2d');\r
  if (context) {\r
    context.font = font;\r
    context.textAlign = 'center';\r
    context.textBaseline = 'middle';\r
    context.fillStyle = '#fff';\r
    list.forEach((char, index) => {\r
      const column = index % columns;\r
      const row = Math.floor(index / columns);\r
      context.fillText(char, column * ATLAS_CELL_W + ATLAS_CELL_W / 2, row * ATLAS_CELL_H + ATLAS_CELL_H / 2 + 3);\r
    });\r
  }\r
  const texture = gl.createTexture();\r
  gl.bindTexture(gl.TEXTURE_2D, texture);\r
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);\r
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, canvas);\r
  gl.generateMipmap(gl.TEXTURE_2D);\r
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);\r
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
  return { texture, count: list.length, grid: [columns, rows] };\r
};\r
\r
const GradientASCII = ({\r
  colors = DEFAULT_COLORS,\r
  shape = 'horizon',\r
  characters = DEFAULT_CHARACTERS,\r
  cellSize = 18,\r
  density = 0.8,\r
  glyphOpacity = 0.85,\r
  glow = 0.2,\r
  depthOfField = 0,\r
  flicker = 0.2,\r
  softness = 0.5,\r
  scale = 1,\r
  flow = 0.5,\r
  speed = 1,\r
  gradientOpacity = 0.9,\r
  grain = 0.08,\r
  variation = 0,\r
  mouseInteraction = true,\r
  scrambleRadius = 0.1,\r
  clickEffect = 'wave',\r
  intro = true,\r
  lightMode = false,\r
  fontFamily = DEFAULT_FONT,\r
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
    shape: SHAPES[shape] ?? 0,\r
    characters: characters || DEFAULT_CHARACTERS,\r
    cellSize: clamp(cellSize, 6, 64),\r
    density: clamp(density, 0, 1),\r
    glyphOpacity: clamp(glyphOpacity, 0, 1),\r
    glow: clamp(glow, 0, 2),\r
    depthOfField: clamp(depthOfField, 0, 1),\r
    flicker: clamp(flicker, 0, 1),\r
    softness: clamp(softness, 0, 1),\r
    scale: clamp(scale, 0.4, 2.5),\r
    flow: clamp(flow, 0, 2),\r
    speed: Math.max(0, speed),\r
    gradientOpacity: clamp(gradientOpacity, 0, 1),\r
    grain: clamp(grain, 0, 0.4),\r
    variation: Math.max(0, variation),\r
    mouseInteraction,\r
    scrambleRadius: clamp(scrambleRadius, 0.02, 0.4),\r
    clickEffect: CLICK_EFFECTS[clickEffect] ?? 1,\r
    intro,\r
    lightMode,\r
    fontFamily: fontFamily || DEFAULT_FONT,\r
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
    const field = link(gl, FIELD);\r
    const halo = link(gl, HALO);\r
    const blur = link(gl, BLUR);\r
    const composite = link(gl, COMPOSITE);\r
    if (!field || !halo || !blur || !composite) return undefined;\r
    const vao = gl.createVertexArray();\r
    const fieldTarget = createTarget(gl, 2);\r
    const haloA = createTarget(gl, 1);\r
    const haloB = createTarget(gl, 1);\r
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
    const clickData = new Float32Array(MAX_CLICKS * 4);\r
    const clicks = [];\r
    const trailData = new Float32Array(MAX_TRAIL * 4);\r
    const trail = [];\r
    const pointer = { x: 0, y: 0, inside: false };\r
    let atlas = null;\r
    let atlasKey = '';\r
    let paletteKey = '';\r
    let time = 0;\r
    let glyphTime = 0;\r
    let introClock = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let frameSeed = 0;\r
    let grainClock = 0;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let disposed = false;\r
\r
    const syncAtlas = () => {\r
      const s = settingsRef.current;\r
      const key = \`\${s.fontFamily}|\${s.characters}\`;\r
      if (key === atlasKey && atlas) return;\r
      atlasKey = key;\r
      if (atlas) gl.deleteTexture(atlas.texture);\r
      atlas = buildAtlas(gl, s.characters, s.fontFamily);\r
      document.fonts?.load?.(\`300 64px \${s.fontFamily}\`, s.characters).then(\r
        () => {\r
          if (disposed || atlasKey !== key) return;\r
          if (atlas) gl.deleteTexture(atlas.texture);\r
          atlas = buildAtlas(gl, s.characters, s.fontFamily);\r
          draw();\r
        },\r
        () => {}\r
      );\r
    };\r
\r
    const syncPalette = () => {\r
      const s = settingsRef.current;\r
      const key = s.colors.join(',');\r
      if (key === paletteKey) return;\r
      paletteKey = key;\r
      s.colors.forEach((color, i) => ramp.set(toLab(parse(color)), i * 3));\r
    };\r
\r
    const bindGlyphs = (program, width, height) => {\r
      if (!atlas) return;\r
      const s = settingsRef.current;\r
      const u = program.uniforms;\r
      const cellH = s.cellSize * view.ratio;\r
      const cellW = cellH * (ATLAS_CELL_W / ATLAS_CELL_H);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, fieldTarget.textures[0]);\r
      gl.uniform1i(u.uField, 0);\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.bindTexture(gl.TEXTURE_2D, fieldTarget.textures[1]);\r
      gl.uniform1i(u.uAux, 1);\r
      gl.activeTexture(gl.TEXTURE2);\r
      gl.bindTexture(gl.TEXTURE_2D, atlas.texture);\r
      gl.uniform1i(u.uAtlas, 2);\r
      gl.uniform2f(u.uResolution, width, height);\r
      gl.uniform2f(u.uCell, cellW, cellH);\r
      gl.uniform2f(\r
        u.uOffset,\r
        (width - Math.ceil(width / cellW) * cellW) / 2,\r
        (height - Math.ceil(height / cellH) * cellH) / 2\r
      );\r
      gl.uniform2f(u.uAtlasGrid, atlas.grid[0], atlas.grid[1]);\r
      gl.uniform1f(u.uCount, atlas.count);\r
      gl.uniform1f(u.uDensity, s.density);\r
      gl.uniform1f(u.uOpacity, s.glyphOpacity);\r
      gl.uniform1f(u.uFlicker, reduce ? 0 : s.flicker);\r
      gl.uniform1f(u.uDepth, s.depthOfField);\r
      gl.uniform1f(u.uGlyphTime, glyphTime);\r
      gl.uniform1f(u.uSeedValue, s.variation);\r
      gl.uniform1f(u.uLight, s.lightMode ? 1 : 0);\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      const aspect = view.width / view.height;\r
      syncAtlas();\r
      syncPalette();\r
      gl.bindVertexArray(vao);\r
      gl.disable(gl.BLEND);\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, fieldTarget.framebuffer);\r
      gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);\r
      gl.viewport(0, 0, fieldTarget.width, fieldTarget.height);\r
      gl.useProgram(field.program);\r
      const fu = field.uniforms;\r
      gl.uniform1f(fu.uAspect, aspect);\r
      gl.uniform1f(fu.uTime, time);\r
      gl.uniform1i(fu.uShape, s.shape);\r
      gl.uniform3fv(fu.uRamp, ramp);\r
      gl.uniform1i(fu.uCount, s.colors.length);\r
      gl.uniform1f(fu.uScale, s.scale);\r
      gl.uniform1f(fu.uSoftness, s.softness);\r
      gl.uniform1f(fu.uFlow, s.flow);\r
      gl.uniform2f(fu.uSeed, s.variation * 3.17, s.variation * 1.91);\r
      gl.uniform4fv(fu.uTrail, trailData);\r
      gl.uniform1f(fu.uRadius, s.scrambleRadius);\r
      gl.uniform4fv(fu.uClicks, clickData);\r
      gl.uniform1i(fu.uClickEffect, s.clickEffect);\r
      gl.uniform1f(fu.uIntro, introClock);\r
      gl.uniform1f(fu.uFrame, frameSeed);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      const glowing = s.glow > 0.001;\r
      if (glowing) {\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, haloA.framebuffer);\r
        gl.drawBuffers([gl.COLOR_ATTACHMENT0]);\r
        gl.viewport(0, 0, haloA.width, haloA.height);\r
        gl.useProgram(halo.program);\r
        bindGlyphs(halo, canvas.width, canvas.height);\r
        gl.uniform1f(halo.uniforms.uDownscale, canvas.width / haloA.width);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
        gl.useProgram(blur.program);\r
        gl.activeTexture(gl.TEXTURE0);\r
        gl.uniform1i(blur.uniforms.uSource, 0);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, haloB.framebuffer);\r
        gl.bindTexture(gl.TEXTURE_2D, haloA.textures[0]);\r
        gl.uniform2f(blur.uniforms.uStep, 1 / haloA.width, 0);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, haloA.framebuffer);\r
        gl.bindTexture(gl.TEXTURE_2D, haloB.textures[0]);\r
        gl.uniform2f(blur.uniforms.uStep, 0, 1 / haloA.height);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      }\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(composite.program);\r
      bindGlyphs(composite, canvas.width, canvas.height);\r
      const cu = composite.uniforms;\r
      gl.activeTexture(gl.TEXTURE3);\r
      gl.bindTexture(gl.TEXTURE_2D, haloA.textures[0]);\r
      gl.uniform1i(cu.uHalo, 3);\r
      gl.uniform1f(cu.uGlow, glowing ? s.glow : 0);\r
      gl.uniform1f(cu.uGradient, s.gradientOpacity);\r
      gl.uniform1f(cu.uGrain, s.grain);\r
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
      sizeTarget(\r
        gl,\r
        fieldTarget,\r
        Math.max(1, Math.round(canvas.width / 2)),\r
        Math.max(1, Math.round(canvas.height / 2))\r
      );\r
      const haloWidth = Math.max(1, Math.round(canvas.width / 4));\r
      const haloHeight = Math.max(1, Math.round(canvas.height / 4));\r
      sizeTarget(gl, haloA, haloWidth, haloHeight);\r
      sizeTarget(gl, haloB, haloWidth, haloHeight);\r
      draw();\r
      wake();\r
    };\r
\r
    const updateInput = dt => {\r
      trail.forEach(point => {\r
        point.age += dt;\r
      });\r
      while (trail.length && trail[trail.length - 1].age > TRAIL_LIFE) trail.pop();\r
      for (let i = 0; i < MAX_TRAIL; i++) {\r
        const point = trail[i];\r
        if (!point) {\r
          trailData[i * 4 + 2] = 0;\r
          continue;\r
        }\r
        const k = 1 - point.age / TRAIL_LIFE;\r
        trailData.set([point.x, point.y, k * k, 0], i * 4);\r
      }\r
      clicks.forEach(click => {\r
        click.age += dt;\r
      });\r
      while (clicks.length && clicks[clicks.length - 1].age > CLICK_LIFE) clicks.pop();\r
      for (let i = 0; i < MAX_CLICKS; i++) {\r
        const click = clicks[i];\r
        if (!click) {\r
          clickData[i * 4 + 3] = 0;\r
          continue;\r
        }\r
        const k = click.age / CLICK_LIFE;\r
        const envelope = Math.min(1, click.age / 0.08) * (1 - k) * (1 - k);\r
        clickData.set([click.x, click.y, click.age, envelope], i * 4);\r
      }\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (disposed || !visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.001, 0.05) : 1 / 60;\r
      last = now;\r
      if (!reduce) {\r
        time += dt * s.speed * 0.5;\r
        glyphTime += dt * Math.max(s.speed, 0.15);\r
      }\r
      if (introClock < 1) introClock = Math.min(1, introClock + dt / INTRO_SECONDS);\r
      grainClock += dt;\r
      if (!reduce && grainClock > 1 / 24) {\r
        grainClock = 0;\r
        frameSeed = (frameSeed + 1) % 97;\r
      }\r
      updateInput(dt);\r
      draw();\r
      const busy = !reduce || introClock < 1 || clicks.length > 0 || trail.length > 0;\r
      if (busy) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    function wake() {\r
      if (!raf && !disposed && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    }\r
\r
    const locate = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = (event.clientX - rect.left) / Math.max(1, rect.width);\r
      const y = 1 - (event.clientY - rect.top) / Math.max(1, rect.height);\r
      const aspect = rect.width / Math.max(1, rect.height);\r
      pointer.inside = x >= 0 && x <= 1 && y >= 0 && y <= 1;\r
      pointer.x = (x - 0.5) * aspect;\r
      pointer.y = y - 0.5;\r
    };\r
\r
    const onPointerMove = event => {\r
      locate(event);\r
      const s = settingsRef.current;\r
      if (!pointer.inside || !s.mouseInteraction || reduce) return;\r
      const head = trail[0];\r
      const gap = head ? Math.hypot(pointer.x - head.x, pointer.y - head.y) : Infinity;\r
      if (gap < TRAIL_STEP) return;\r
      if (head && head.age < 0.1) {\r
        const steps = Math.min(6, Math.floor(gap / (TRAIL_STEP * 2)));\r
        for (let i = 1; i <= steps; i++) {\r
          const k = i / (steps + 1);\r
          trail.unshift({ x: head.x + (pointer.x - head.x) * k, y: head.y + (pointer.y - head.y) * k, age: 0 });\r
        }\r
      }\r
      trail.unshift({ x: pointer.x, y: pointer.y, age: 0 });\r
      trail.length = Math.min(trail.length, MAX_TRAIL);\r
      wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      locate(event);\r
      const s = settingsRef.current;\r
      if (!pointer.inside || !s.clickEffect || reduce) return;\r
      clicks.unshift({ x: pointer.x, y: pointer.y, age: 0 });\r
      if (clicks.length > MAX_CLICKS) clicks.pop();\r
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
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
    wakeRef.current = wake;\r
\r
    return () => {\r
      disposed = true;\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      [fieldTarget, haloA, haloB].forEach(target => {\r
        target.textures.forEach(texture => gl.deleteTexture(texture));\r
        gl.deleteFramebuffer(target.framebuffer);\r
      });\r
      if (atlas) gl.deleteTexture(atlas.texture);\r
      gl.deleteVertexArray(vao);\r
      [field, halo, blur, composite].forEach(item => gl.deleteProgram(item.program));\r
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
export default GradientASCII;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties, type HTMLAttributes } from 'react';\r
import './GradientASCII.css';\r
\r
export type GradientASCIIShape = 'horizon' | 'pinch' | 'rise' | 'eclipse';\r
\r
export type GradientASCIIClickEffect = 'wave' | 'burst' | 'none';\r
\r
export interface GradientASCIIProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {\r
  colors?: string[];\r
  shape?: GradientASCIIShape;\r
  characters?: string;\r
  cellSize?: number;\r
  density?: number;\r
  glyphOpacity?: number;\r
  glow?: number;\r
  depthOfField?: number;\r
  flicker?: number;\r
  softness?: number;\r
  scale?: number;\r
  flow?: number;\r
  speed?: number;\r
  gradientOpacity?: number;\r
  grain?: number;\r
  variation?: number;\r
  mouseInteraction?: boolean;\r
  scrambleRadius?: number;\r
  clickEffect?: GradientASCIIClickEffect;\r
  intro?: boolean;\r
  lightMode?: boolean;\r
  fontFamily?: string;\r
  dpr?: number;\r
  style?: CSSProperties;\r
}\r
\r
type Settings = {\r
  colors: string[];\r
  shape: number;\r
  characters: string;\r
  cellSize: number;\r
  density: number;\r
  glyphOpacity: number;\r
  glow: number;\r
  depthOfField: number;\r
  flicker: number;\r
  softness: number;\r
  scale: number;\r
  flow: number;\r
  speed: number;\r
  gradientOpacity: number;\r
  grain: number;\r
  variation: number;\r
  mouseInteraction: boolean;\r
  scrambleRadius: number;\r
  clickEffect: number;\r
  intro: boolean;\r
  lightMode: boolean;\r
  fontFamily: string;\r
  dpr?: number;\r
};\r
\r
type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };\r
\r
type Target = {\r
  textures: (WebGLTexture | null)[];\r
  framebuffer: WebGLFramebuffer | null;\r
  width: number;\r
  height: number;\r
};\r
\r
type Atlas = { texture: WebGLTexture | null; count: number; grid: number[] };\r
\r
type Point = { x: number; y: number; age: number };\r
\r
const MAX_COLORS = 8;\r
const MAX_CLICKS = 4;\r
const MAX_TRAIL = 24;\r
const CLICK_LIFE = 1.2;\r
const TRAIL_LIFE = 0.7;\r
const TRAIL_STEP = 0.015;\r
const INTRO_SECONDS = 2.4;\r
const ATLAS_CELL_W = 60;\r
const ATLAS_CELL_H = 100;\r
const ATLAS_COLUMNS = 16;\r
const FONT_SCALE = 0.78;\r
const DEFAULT_COLORS = ['#1e3fd8', '#f6f8ff', '#a5d8ff', '#38bdf8'];\r
const DEFAULT_CHARACTERS = ' =+xX0S8#@';\r
const DEFAULT_FONT = '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';\r
const SHAPES: Record<string, number> = { horizon: 0, pinch: 1, rise: 2, eclipse: 3 };\r
const CLICK_EFFECTS: Record<string, number> = { none: 0, wave: 1, burst: 2 };\r
\r
const VERTEX = \`#version 300 es\r
out vec2 vUv;\r
void main() {\r
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\r
  vUv = p;\r
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const COMMON = \`\r
float hash12(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * 0.1031);\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.x + q.y) * q.z);\r
}\r
\`;\r
\r
const FIELD = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform float uAspect;\r
uniform float uTime;\r
uniform int uShape;\r
uniform vec3 uRamp[8];\r
uniform int uCount;\r
uniform float uScale;\r
uniform float uSoftness;\r
uniform float uFlow;\r
uniform vec2 uSeed;\r
uniform vec4 uTrail[24];\r
uniform float uRadius;\r
uniform vec4 uClicks[4];\r
uniform int uClickEffect;\r
uniform float uIntro;\r
uniform float uFrame;\r
in vec2 vUv;\r
layout(location = 0) out vec4 outColor;\r
layout(location = 1) out vec4 outAux;\r
\${COMMON}\r
vec2 hash22(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.103, 0.0973));\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.xx + q.yz) * q.zy) * 2.0 - 1.0;\r
}\r
\r
float noise(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = fract(p);\r
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);\r
  float a = dot(hash22(i), f);\r
  float b = dot(hash22(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));\r
  float c = dot(hash22(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));\r
  float d = dot(hash22(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));\r
  return 0.5 + 0.5 * mix(mix(a, b, u.x), mix(c, d, u.x), u.y);\r
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
vec3 horizon(vec2 p, float time, out float order) {\r
  float span = 0.5 * max(uAspect, 1.0);\r
  float x = p.x / span;\r
  float arch = -0.17 - 0.2 * x * x + 0.02 * sin(time * 0.6);\r
  float soft = mix(0.05, 0.22, uSoftness);\r
  float edge = p.y - arch;\r
  float rim = 0.38 * smoothstep(-soft, 0.42, edge);\r
  vec2 sun = vec2(0.08 * sin(time * 0.31) * span, 0.58);\r
  float spread = length((p - sun) / vec2(0.95 * span, 0.75));\r
  float sky = mix(0.55, 1.0, smoothstep(0.2, 0.95, spread));\r
  order = clamp(edge * 1.3, 0.0, 1.0);\r
  return vec3(rim, sky, smoothstep(0.18, 0.62, edge));\r
}\r
\r
vec3 pinch(vec2 p, float time, out float order) {\r
  float span = 0.5 * max(uAspect, 0.75);\r
  float x = p.x / span;\r
  float sway = 0.02 * sin(x * 1.7 + time * 0.55);\r
  float breathe = 1.0 + 0.06 * sin(time * 0.8);\r
  float width = (0.13 + 0.22 * x * x) * breathe * mix(0.85, 1.2, uSoftness);\r
  float y = abs(p.y - sway) / width;\r
  float t = exp(-pow(y, 2.2)) * (0.42 + 0.58 * exp(-x * x * 1.8));\r
  order = clamp(abs(p.y - sway) * 2.4 + abs(x) * 0.3, 0.0, 1.0);\r
  return vec3(t, t, 0.0);\r
}\r
\r
vec3 rise(vec2 p, float time, out float order) {\r
  float wide = max(uAspect, 0.9);\r
  vec2 center = vec2(0.05 * sin(time * 0.45) * wide, -0.7);\r
  vec2 radius = vec2(0.82 * wide, 0.64 * (1.0 + 0.04 * sin(time * 0.8)));\r
  float d = length((p - center) / radius);\r
  float soft = mix(0.6, 1.15, uSoftness);\r
  float t = clamp(pow(clamp(1.0 - d, 0.0, 1.0), soft) * 1.35, 0.0, 1.0);\r
  order = clamp((d - 0.2) * 1.3, 0.0, 1.0);\r
  return vec3(t, t, 0.0);\r
}\r
\r
vec3 eclipse(vec2 p, float time, out float order) {\r
  float fit = min(1.0, uAspect * 1.25);\r
  float r = 0.23 * fit * (1.0 + 0.015 * sin(time * 0.9));\r
  float angle = atan(p.y, p.x);\r
  float rays = noise(vec2(cos(angle), sin(angle)) * 2.2 + time * 0.08) * 0.8 + 0.6;\r
  float d = length(p) - r;\r
  float reach = mix(0.07, 0.15, uSoftness) * rays * fit;\r
  float t = smoothstep(-0.006, 0.006 + 0.02 * uSoftness, d) * exp(-max(d, 0.0) / reach);\r
  order = clamp(d * 2.0, 0.0, 1.0);\r
  return vec3(t, t, 0.0);\r
}\r
\r
vec4 tone(float t) {\r
  float x = smoothstep(0.3, 1.0, t) * float(uCount - 1);\r
  int index = int(floor(x));\r
  return vec4(mix(uRamp[index], uRamp[min(index + 1, uCount - 1)], fract(x)), smoothstep(0.0, 0.38, t));\r
}\r
\r
void main() {\r
  vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);\r
  float time = uTime;\r
  vec2 q = p / uScale;\r
  vec2 warp = vec2(\r
    noise(q * 1.6 + uSeed + vec2(0.0, time * 0.3)),\r
    noise(q * 1.6 + uSeed.yx + vec2(4.3, -time * 0.24))\r
  ) - 0.5;\r
  q += warp * uFlow * (uShape == 3 ? 0.04 : 0.18);\r
  float order = 0.0;\r
  vec3 shape;\r
  if (uShape == 0) shape = horizon(q, time, order);\r
  else if (uShape == 1) shape = pinch(q, time, order);\r
  else if (uShape == 2) shape = rise(q, time, order);\r
  else shape = eclipse(q, time, order);\r
\r
  float reveal = clamp((uIntro * 1.45 - order) / 0.45, 0.0, 1.0);\r
  reveal = reveal * reveal * (3.0 - 2.0 * reveal);\r
\r
  float scramble = 0.0;\r
  for (int i = 0; i < 24; i++) {\r
    vec4 point = uTrail[i];\r
    if (point.z <= 0.0) continue;\r
    vec2 d = p - point.xy;\r
    scramble = max(scramble, point.z * exp(-dot(d, d) / (uRadius * uRadius)));\r
  }\r
  for (int i = 0; i < 4; i++) {\r
    vec4 c = uClicks[i];\r
    if (c.w <= 0.0) continue;\r
    float d = length(p - c.xy);\r
    if (uClickEffect == 1) {\r
      scramble = max(scramble, exp(-pow((d - c.z * 0.75) / 0.06, 2.0)) * c.w);\r
    } else if (uClickEffect == 2) {\r
      float size = 0.08 + 0.22 * (1.0 - exp(-c.z * 5.0));\r
      scramble = max(scramble, (1.0 - smoothstep(size * 0.6, size, d)) * c.w);\r
    }\r
  }\r
  vec2 t = clamp(shape.xy * mix(0.7, 1.0, reveal), 0.0, 1.0);\r
  vec4 mixed = mix(tone(t.x), tone(t.y), shape.z);\r
  vec3 color = encode(labToRgb(mixed.rgb));\r
  float alpha = mixed.a * reveal;\r
  float dither = (hash12(gl_FragCoord.xy + uFrame * 13.7) - 0.5) / 255.0;\r
  outColor = clamp(vec4(color * alpha + dither, alpha + dither), 0.0, 1.0);\r
  outAux = vec4(reveal, scramble, 0.0, 1.0);\r
}\`;\r
\r
const GLYPHS = \`\r
uniform sampler2D uField;\r
uniform sampler2D uAux;\r
uniform sampler2D uAtlas;\r
uniform vec2 uResolution;\r
uniform vec2 uCell;\r
uniform vec2 uOffset;\r
uniform vec2 uAtlasGrid;\r
uniform float uCount;\r
uniform float uDensity;\r
uniform float uOpacity;\r
uniform float uFlicker;\r
uniform float uDepth;\r
uniform float uGlyphTime;\r
uniform float uSeedValue;\r
uniform float uLight;\r
\${COMMON}\r
float sampleGlyph(float index, vec2 local, vec2 coord, float soft) {\r
  float column = mod(index, uAtlasGrid.x);\r
  float row = floor(index / uAtlasGrid.x);\r
  vec2 atlasUv = vec2((column + local.x) / uAtlasGrid.x, (row + 1.0 - local.y) / uAtlasGrid.y);\r
  vec2 continuous = coord / uAtlasGrid;\r
  float scale = exp2(soft);\r
  return textureGrad(uAtlas, atlasUv, dFdx(continuous) * scale, dFdy(continuous) * scale).a;\r
}\r
\r
vec4 glyphAt(vec2 px) {\r
  vec2 coord = (px - uOffset) / uCell;\r
  vec2 cell = floor(coord);\r
  vec2 local = coord - cell;\r
  vec2 uv = clamp(((cell + 0.5) * uCell + uOffset) / uResolution, vec2(0.0), vec2(1.0));\r
  vec4 field = texture(uField, uv);\r
  vec4 aux = texture(uAux, uv);\r
  vec3 visible = uLight > 0.5 ? field.rgb + (1.0 - field.a) : field.rgb;\r
  float luma = dot(visible, vec3(0.2126, 0.7152, 0.0722));\r
  float value = uLight > 0.5 ? clamp((1.0 - luma) * 1.5, 0.0, 1.0) : luma;\r
  float pick = hash12(cell + uSeedValue * 7.31);\r
  float level = hash12(cell * 1.73 + 4.1 + uSeedValue);\r
  float tick = floor(uGlyphTime * 9.0 + level * 9.0);\r
  float wobble = (hash12(cell * 2.31 + tick * 17.7) - 0.5) * uFlicker * 0.4 + (level - 0.5) * 0.1;\r
  float tone = clamp(pow(value, 0.75) + wobble, 0.0, 1.0);\r
  float index = floor(tone * (uCount - 1.0) + 0.5);\r
  float decode = max(aux.g, 1.0 - aux.r);\r
  if (decode > 0.02) {\r
    float frame = floor(uGlyphTime * 20.0);\r
    if (hash12(cell * 3.7 + frame * 5.3) < decode * 1.25) index = 1.0 + floor(hash12(cell + frame * 1.37) * (uCount - 1.0));\r
  }\r
  float present = step(pick, uDensity * mix(1.0, 0.3 + tone * 1.1, 0.55));\r
  float cutoff = smoothstep(0.03, 0.1, value);\r
  float focus = step(hash12(cell * 0.71 + 9.2 + uSeedValue), uDepth);\r
  float coverage = sampleGlyph(index, local, coord, focus * 1.2);\r
  float alpha = uOpacity * present * cutoff * coverage * mix(1.0, 0.35 + 0.65 * level, 0.55) * (1.0 - focus * 0.5);\r
  if (uLight < 0.5) {\r
    vec3 light = field.rgb * 0.55 + vec3(0.03) * field.a;\r
    return vec4(light * alpha, 0.6 * field.a * alpha);\r
  }\r
  vec3 ink = visible * 0.8;\r
  return vec4(ink * alpha, alpha);\r
}\r
\`;\r
\r
const HALO = \`#version 300 es\r
precision highp float;\r
uniform float uDownscale;\r
in vec2 vUv;\r
out vec4 outColor;\r
\${GLYPHS}\r
void main() {\r
  outColor = glyphAt(gl_FragCoord.xy * uDownscale);\r
}\`;\r
\r
const BLUR = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uSource;\r
uniform vec2 uStep;\r
in vec2 vUv;\r
out vec4 outColor;\r
void main() {\r
  vec4 sum = texture(uSource, vUv) * 0.2270270270;\r
  sum += texture(uSource, vUv + uStep * 1.3846153846) * 0.3162162162;\r
  sum += texture(uSource, vUv - uStep * 1.3846153846) * 0.3162162162;\r
  sum += texture(uSource, vUv + uStep * 3.2307692308) * 0.0702702703;\r
  sum += texture(uSource, vUv - uStep * 3.2307692308) * 0.0702702703;\r
  outColor = sum;\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uHalo;\r
uniform float uGlow;\r
uniform float uGradient;\r
uniform float uGrain;\r
uniform float uFrame;\r
in vec2 vUv;\r
out vec4 outColor;\r
\${GLYPHS}\r
void main() {\r
  vec4 base = texture(uField, vUv) * uGradient;\r
  vec4 glyph = glyphAt(gl_FragCoord.xy);\r
  vec4 halo = texture(uHalo, vUv) * uGlow;\r
  vec4 color;\r
  if (uLight < 0.5) {\r
    color = base + glyph + halo;\r
  } else {\r
    color = glyph + base * (1.0 - glyph.a);\r
    color += halo * 0.6 * (1.0 - color.a);\r
  }\r
  float grain = (hash12(gl_FragCoord.xy + uFrame * vec2(17.0, 59.0)) + hash12(gl_FragCoord.xy * 1.31 + uFrame * 7.0) - 1.0) * uGrain;\r
  float body = clamp(color.a, 0.0, 1.0);\r
  color.rgb += grain * (0.25 + body) * 0.5;\r
  color.a = clamp(color.a, 0.0, 1.0);\r
  color.rgb = clamp(color.rgb, 0.0, color.a);\r
  outColor = color;\r
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
const createTarget = (gl: WebGL2RenderingContext, count: number): Target => {\r
  const textures = Array.from({ length: count }, () => {\r
    const texture = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, texture);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    return texture;\r
  });\r
  return { textures, framebuffer: gl.createFramebuffer(), width: 0, height: 0 };\r
};\r
\r
const sizeTarget = (gl: WebGL2RenderingContext, target: Target, width: number, height: number) => {\r
  if (target.width === width && target.height === height) return;\r
  target.width = width;\r
  target.height = height;\r
  gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);\r
  target.textures.forEach((texture, i) => {\r
    gl.bindTexture(gl.TEXTURE_2D, texture);\r
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, texture, 0);\r
  });\r
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
};\r
\r
const buildAtlas = (gl: WebGL2RenderingContext, characters: string, fontFamily: string): Atlas => {\r
  const list = [...new Set([...characters].filter(char => char !== '\\n' && char !== '\\r'))];\r
  if (!list.length) list.push(' ');\r
  const font = \`300 \${Math.round(ATLAS_CELL_H * FONT_SCALE)}px \${fontFamily}\`;\r
  const columns = Math.min(ATLAS_COLUMNS, list.length);\r
  const rows = Math.ceil(list.length / columns);\r
  const canvas = document.createElement('canvas');\r
  canvas.width = ATLAS_CELL_W * columns;\r
  canvas.height = ATLAS_CELL_H * rows;\r
  const context = canvas.getContext('2d');\r
  if (context) {\r
    context.font = font;\r
    context.textAlign = 'center';\r
    context.textBaseline = 'middle';\r
    context.fillStyle = '#fff';\r
    list.forEach((char, index) => {\r
      const column = index % columns;\r
      const row = Math.floor(index / columns);\r
      context.fillText(char, column * ATLAS_CELL_W + ATLAS_CELL_W / 2, row * ATLAS_CELL_H + ATLAS_CELL_H / 2 + 3);\r
    });\r
  }\r
  const texture = gl.createTexture();\r
  gl.bindTexture(gl.TEXTURE_2D, texture);\r
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);\r
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, canvas);\r
  gl.generateMipmap(gl.TEXTURE_2D);\r
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);\r
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
  return { texture, count: list.length, grid: [columns, rows] };\r
};\r
\r
const GradientASCII = ({\r
  colors = DEFAULT_COLORS,\r
  shape = 'horizon',\r
  characters = DEFAULT_CHARACTERS,\r
  cellSize = 18,\r
  density = 0.8,\r
  glyphOpacity = 0.85,\r
  glow = 0.2,\r
  depthOfField = 0,\r
  flicker = 0.2,\r
  softness = 0.5,\r
  scale = 1,\r
  flow = 0.5,\r
  speed = 1,\r
  gradientOpacity = 0.9,\r
  grain = 0.08,\r
  variation = 0,\r
  mouseInteraction = true,\r
  scrambleRadius = 0.1,\r
  clickEffect = 'wave',\r
  intro = true,\r
  lightMode = false,\r
  fontFamily = DEFAULT_FONT,\r
  dpr,\r
  className = '',\r
  style,\r
  ...rest\r
}: GradientASCIIProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const palette = (Array.isArray(colors) && colors.length ? colors : DEFAULT_COLORS).slice(0, MAX_COLORS);\r
  const settings: Settings = {\r
    colors: palette.length > 1 ? palette : [palette[0], palette[0]],\r
    shape: SHAPES[shape] ?? 0,\r
    characters: characters || DEFAULT_CHARACTERS,\r
    cellSize: clamp(cellSize, 6, 64),\r
    density: clamp(density, 0, 1),\r
    glyphOpacity: clamp(glyphOpacity, 0, 1),\r
    glow: clamp(glow, 0, 2),\r
    depthOfField: clamp(depthOfField, 0, 1),\r
    flicker: clamp(flicker, 0, 1),\r
    softness: clamp(softness, 0, 1),\r
    scale: clamp(scale, 0.4, 2.5),\r
    flow: clamp(flow, 0, 2),\r
    speed: Math.max(0, speed),\r
    gradientOpacity: clamp(gradientOpacity, 0, 1),\r
    grain: clamp(grain, 0, 0.4),\r
    variation: Math.max(0, variation),\r
    mouseInteraction,\r
    scrambleRadius: clamp(scrambleRadius, 0.02, 0.4),\r
    clickEffect: CLICK_EFFECTS[clickEffect] ?? 1,\r
    intro,\r
    lightMode,\r
    fontFamily: fontFamily || DEFAULT_FONT,\r
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
    const field = link(gl, FIELD);\r
    const halo = link(gl, HALO);\r
    const blur = link(gl, BLUR);\r
    const composite = link(gl, COMPOSITE);\r
    if (!field || !halo || !blur || !composite) return undefined;\r
    const vao = gl.createVertexArray();\r
    const fieldTarget = createTarget(gl, 2);\r
    const haloA = createTarget(gl, 1);\r
    const haloB = createTarget(gl, 1);\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const colorCache = new Map<string, number[]>();\r
    const parse = (value: string): number[] => {\r
      const key = String(value);\r
      const cached = colorCache.get(key);\r
      if (cached) return cached;\r
      let rgb: number[] = [0, 0, 0];\r
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
    const clickData = new Float32Array(MAX_CLICKS * 4);\r
    const clicks: Point[] = [];\r
    const trailData = new Float32Array(MAX_TRAIL * 4);\r
    const trail: Point[] = [];\r
    const pointer = { x: 0, y: 0, inside: false };\r
    let atlas: Atlas | null = null;\r
    let atlasKey = '';\r
    let paletteKey = '';\r
    let time = 0;\r
    let glyphTime = 0;\r
    let introClock = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let frameSeed = 0;\r
    let grainClock = 0;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let disposed = false;\r
\r
    const syncAtlas = () => {\r
      const s = settingsRef.current;\r
      const key = \`\${s.fontFamily}|\${s.characters}\`;\r
      if (key === atlasKey && atlas) return;\r
      atlasKey = key;\r
      if (atlas) gl.deleteTexture(atlas.texture);\r
      atlas = buildAtlas(gl, s.characters, s.fontFamily);\r
      document.fonts?.load?.(\`300 64px \${s.fontFamily}\`, s.characters).then(\r
        () => {\r
          if (disposed || atlasKey !== key) return;\r
          if (atlas) gl.deleteTexture(atlas.texture);\r
          atlas = buildAtlas(gl, s.characters, s.fontFamily);\r
          draw();\r
        },\r
        () => {}\r
      );\r
    };\r
\r
    const syncPalette = () => {\r
      const s = settingsRef.current;\r
      const key = s.colors.join(',');\r
      if (key === paletteKey) return;\r
      paletteKey = key;\r
      s.colors.forEach((color, i) => ramp.set(toLab(parse(color)), i * 3));\r
    };\r
\r
    const bindGlyphs = (program: Program, width: number, height: number) => {\r
      if (!atlas) return;\r
      const s = settingsRef.current;\r
      const u = program.uniforms;\r
      const cellH = s.cellSize * view.ratio;\r
      const cellW = cellH * (ATLAS_CELL_W / ATLAS_CELL_H);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, fieldTarget.textures[0]);\r
      gl.uniform1i(u.uField, 0);\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.bindTexture(gl.TEXTURE_2D, fieldTarget.textures[1]);\r
      gl.uniform1i(u.uAux, 1);\r
      gl.activeTexture(gl.TEXTURE2);\r
      gl.bindTexture(gl.TEXTURE_2D, atlas.texture);\r
      gl.uniform1i(u.uAtlas, 2);\r
      gl.uniform2f(u.uResolution, width, height);\r
      gl.uniform2f(u.uCell, cellW, cellH);\r
      gl.uniform2f(\r
        u.uOffset,\r
        (width - Math.ceil(width / cellW) * cellW) / 2,\r
        (height - Math.ceil(height / cellH) * cellH) / 2\r
      );\r
      gl.uniform2f(u.uAtlasGrid, atlas.grid[0], atlas.grid[1]);\r
      gl.uniform1f(u.uCount, atlas.count);\r
      gl.uniform1f(u.uDensity, s.density);\r
      gl.uniform1f(u.uOpacity, s.glyphOpacity);\r
      gl.uniform1f(u.uFlicker, reduce ? 0 : s.flicker);\r
      gl.uniform1f(u.uDepth, s.depthOfField);\r
      gl.uniform1f(u.uGlyphTime, glyphTime);\r
      gl.uniform1f(u.uSeedValue, s.variation);\r
      gl.uniform1f(u.uLight, s.lightMode ? 1 : 0);\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      const aspect = view.width / view.height;\r
      syncAtlas();\r
      syncPalette();\r
      gl.bindVertexArray(vao);\r
      gl.disable(gl.BLEND);\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, fieldTarget.framebuffer);\r
      gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);\r
      gl.viewport(0, 0, fieldTarget.width, fieldTarget.height);\r
      gl.useProgram(field.program);\r
      const fu = field.uniforms;\r
      gl.uniform1f(fu.uAspect, aspect);\r
      gl.uniform1f(fu.uTime, time);\r
      gl.uniform1i(fu.uShape, s.shape);\r
      gl.uniform3fv(fu.uRamp, ramp);\r
      gl.uniform1i(fu.uCount, s.colors.length);\r
      gl.uniform1f(fu.uScale, s.scale);\r
      gl.uniform1f(fu.uSoftness, s.softness);\r
      gl.uniform1f(fu.uFlow, s.flow);\r
      gl.uniform2f(fu.uSeed, s.variation * 3.17, s.variation * 1.91);\r
      gl.uniform4fv(fu.uTrail, trailData);\r
      gl.uniform1f(fu.uRadius, s.scrambleRadius);\r
      gl.uniform4fv(fu.uClicks, clickData);\r
      gl.uniform1i(fu.uClickEffect, s.clickEffect);\r
      gl.uniform1f(fu.uIntro, introClock);\r
      gl.uniform1f(fu.uFrame, frameSeed);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      const glowing = s.glow > 0.001;\r
      if (glowing) {\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, haloA.framebuffer);\r
        gl.drawBuffers([gl.COLOR_ATTACHMENT0]);\r
        gl.viewport(0, 0, haloA.width, haloA.height);\r
        gl.useProgram(halo.program);\r
        bindGlyphs(halo, canvas.width, canvas.height);\r
        gl.uniform1f(halo.uniforms.uDownscale, canvas.width / haloA.width);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
        gl.useProgram(blur.program);\r
        gl.activeTexture(gl.TEXTURE0);\r
        gl.uniform1i(blur.uniforms.uSource, 0);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, haloB.framebuffer);\r
        gl.bindTexture(gl.TEXTURE_2D, haloA.textures[0]);\r
        gl.uniform2f(blur.uniforms.uStep, 1 / haloA.width, 0);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, haloA.framebuffer);\r
        gl.bindTexture(gl.TEXTURE_2D, haloB.textures[0]);\r
        gl.uniform2f(blur.uniforms.uStep, 0, 1 / haloA.height);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      }\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(composite.program);\r
      bindGlyphs(composite, canvas.width, canvas.height);\r
      const cu = composite.uniforms;\r
      gl.activeTexture(gl.TEXTURE3);\r
      gl.bindTexture(gl.TEXTURE_2D, haloA.textures[0]);\r
      gl.uniform1i(cu.uHalo, 3);\r
      gl.uniform1f(cu.uGlow, glowing ? s.glow : 0);\r
      gl.uniform1f(cu.uGradient, s.gradientOpacity);\r
      gl.uniform1f(cu.uGrain, s.grain);\r
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
      sizeTarget(\r
        gl,\r
        fieldTarget,\r
        Math.max(1, Math.round(canvas.width / 2)),\r
        Math.max(1, Math.round(canvas.height / 2))\r
      );\r
      const haloWidth = Math.max(1, Math.round(canvas.width / 4));\r
      const haloHeight = Math.max(1, Math.round(canvas.height / 4));\r
      sizeTarget(gl, haloA, haloWidth, haloHeight);\r
      sizeTarget(gl, haloB, haloWidth, haloHeight);\r
      draw();\r
      wake();\r
    };\r
\r
    const updateInput = (dt: number) => {\r
      trail.forEach(point => {\r
        point.age += dt;\r
      });\r
      while (trail.length && trail[trail.length - 1].age > TRAIL_LIFE) trail.pop();\r
      for (let i = 0; i < MAX_TRAIL; i++) {\r
        const point = trail[i];\r
        if (!point) {\r
          trailData[i * 4 + 2] = 0;\r
          continue;\r
        }\r
        const k = 1 - point.age / TRAIL_LIFE;\r
        trailData.set([point.x, point.y, k * k, 0], i * 4);\r
      }\r
      clicks.forEach(click => {\r
        click.age += dt;\r
      });\r
      while (clicks.length && clicks[clicks.length - 1].age > CLICK_LIFE) clicks.pop();\r
      for (let i = 0; i < MAX_CLICKS; i++) {\r
        const click = clicks[i];\r
        if (!click) {\r
          clickData[i * 4 + 3] = 0;\r
          continue;\r
        }\r
        const k = click.age / CLICK_LIFE;\r
        const envelope = Math.min(1, click.age / 0.08) * (1 - k) * (1 - k);\r
        clickData.set([click.x, click.y, click.age, envelope], i * 4);\r
      }\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (disposed || !visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.001, 0.05) : 1 / 60;\r
      last = now;\r
      if (!reduce) {\r
        time += dt * s.speed * 0.5;\r
        glyphTime += dt * Math.max(s.speed, 0.15);\r
      }\r
      if (introClock < 1) introClock = Math.min(1, introClock + dt / INTRO_SECONDS);\r
      grainClock += dt;\r
      if (!reduce && grainClock > 1 / 24) {\r
        grainClock = 0;\r
        frameSeed = (frameSeed + 1) % 97;\r
      }\r
      updateInput(dt);\r
      draw();\r
      const busy = !reduce || introClock < 1 || clicks.length > 0 || trail.length > 0;\r
      if (busy) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    function wake() {\r
      if (!raf && !disposed && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    }\r
\r
    const locate = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = (event.clientX - rect.left) / Math.max(1, rect.width);\r
      const y = 1 - (event.clientY - rect.top) / Math.max(1, rect.height);\r
      const aspect = rect.width / Math.max(1, rect.height);\r
      pointer.inside = x >= 0 && x <= 1 && y >= 0 && y <= 1;\r
      pointer.x = (x - 0.5) * aspect;\r
      pointer.y = y - 0.5;\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      locate(event);\r
      const s = settingsRef.current;\r
      if (!pointer.inside || !s.mouseInteraction || reduce) return;\r
      const head = trail[0];\r
      const gap = head ? Math.hypot(pointer.x - head.x, pointer.y - head.y) : Infinity;\r
      if (gap < TRAIL_STEP) return;\r
      if (head && head.age < 0.1) {\r
        const steps = Math.min(6, Math.floor(gap / (TRAIL_STEP * 2)));\r
        for (let i = 1; i <= steps; i++) {\r
          const k = i / (steps + 1);\r
          trail.unshift({ x: head.x + (pointer.x - head.x) * k, y: head.y + (pointer.y - head.y) * k, age: 0 });\r
        }\r
      }\r
      trail.unshift({ x: pointer.x, y: pointer.y, age: 0 });\r
      trail.length = Math.min(trail.length, MAX_TRAIL);\r
      wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      locate(event);\r
      const s = settingsRef.current;\r
      if (!pointer.inside || !s.clickEffect || reduce) return;\r
      clicks.unshift({ x: pointer.x, y: pointer.y, age: 0 });\r
      if (clicks.length > MAX_CLICKS) clicks.pop();\r
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
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
    wakeRef.current = wake;\r
\r
    return () => {\r
      disposed = true;\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      [fieldTarget, haloA, haloB].forEach(target => {\r
        target.textures.forEach(texture => gl.deleteTexture(texture));\r
        gl.deleteFramebuffer(target.framebuffer);\r
      });\r
      if (atlas) gl.deleteTexture(atlas.texture);\r
      gl.deleteVertexArray(vao);\r
      [field, halo, blur, composite].forEach(item => gl.deleteProgram(item.program));\r
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
      className={\`gradient-ascii-container\${className ? \` \${className}\` : ''}\`}\r
      style={style}\r
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className="gradient-ascii-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default GradientASCII;\r
`,l=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties, type HTMLAttributes } from 'react';\r
\r
export type GradientASCIIShape = 'horizon' | 'pinch' | 'rise' | 'eclipse';\r
\r
export type GradientASCIIClickEffect = 'wave' | 'burst' | 'none';\r
\r
export interface GradientASCIIProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {\r
  colors?: string[];\r
  shape?: GradientASCIIShape;\r
  characters?: string;\r
  cellSize?: number;\r
  density?: number;\r
  glyphOpacity?: number;\r
  glow?: number;\r
  depthOfField?: number;\r
  flicker?: number;\r
  softness?: number;\r
  scale?: number;\r
  flow?: number;\r
  speed?: number;\r
  gradientOpacity?: number;\r
  grain?: number;\r
  variation?: number;\r
  mouseInteraction?: boolean;\r
  scrambleRadius?: number;\r
  clickEffect?: GradientASCIIClickEffect;\r
  intro?: boolean;\r
  lightMode?: boolean;\r
  fontFamily?: string;\r
  dpr?: number;\r
  style?: CSSProperties;\r
}\r
\r
type Settings = {\r
  colors: string[];\r
  shape: number;\r
  characters: string;\r
  cellSize: number;\r
  density: number;\r
  glyphOpacity: number;\r
  glow: number;\r
  depthOfField: number;\r
  flicker: number;\r
  softness: number;\r
  scale: number;\r
  flow: number;\r
  speed: number;\r
  gradientOpacity: number;\r
  grain: number;\r
  variation: number;\r
  mouseInteraction: boolean;\r
  scrambleRadius: number;\r
  clickEffect: number;\r
  intro: boolean;\r
  lightMode: boolean;\r
  fontFamily: string;\r
  dpr?: number;\r
};\r
\r
type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };\r
\r
type Target = {\r
  textures: (WebGLTexture | null)[];\r
  framebuffer: WebGLFramebuffer | null;\r
  width: number;\r
  height: number;\r
};\r
\r
type Atlas = { texture: WebGLTexture | null; count: number; grid: number[] };\r
\r
type Point = { x: number; y: number; age: number };\r
\r
const MAX_COLORS = 8;\r
const MAX_CLICKS = 4;\r
const MAX_TRAIL = 24;\r
const CLICK_LIFE = 1.2;\r
const TRAIL_LIFE = 0.7;\r
const TRAIL_STEP = 0.015;\r
const INTRO_SECONDS = 2.4;\r
const ATLAS_CELL_W = 60;\r
const ATLAS_CELL_H = 100;\r
const ATLAS_COLUMNS = 16;\r
const FONT_SCALE = 0.78;\r
const DEFAULT_COLORS = ['#1e3fd8', '#f6f8ff', '#a5d8ff', '#38bdf8'];\r
const DEFAULT_CHARACTERS = ' =+xX0S8#@';\r
const DEFAULT_FONT = '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';\r
const SHAPES: Record<string, number> = { horizon: 0, pinch: 1, rise: 2, eclipse: 3 };\r
const CLICK_EFFECTS: Record<string, number> = { none: 0, wave: 1, burst: 2 };\r
\r
const VERTEX = \`#version 300 es\r
out vec2 vUv;\r
void main() {\r
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\r
  vUv = p;\r
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const COMMON = \`\r
float hash12(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * 0.1031);\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.x + q.y) * q.z);\r
}\r
\`;\r
\r
const FIELD = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform float uAspect;\r
uniform float uTime;\r
uniform int uShape;\r
uniform vec3 uRamp[8];\r
uniform int uCount;\r
uniform float uScale;\r
uniform float uSoftness;\r
uniform float uFlow;\r
uniform vec2 uSeed;\r
uniform vec4 uTrail[24];\r
uniform float uRadius;\r
uniform vec4 uClicks[4];\r
uniform int uClickEffect;\r
uniform float uIntro;\r
uniform float uFrame;\r
in vec2 vUv;\r
layout(location = 0) out vec4 outColor;\r
layout(location = 1) out vec4 outAux;\r
\${COMMON}\r
vec2 hash22(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.103, 0.0973));\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.xx + q.yz) * q.zy) * 2.0 - 1.0;\r
}\r
\r
float noise(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = fract(p);\r
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);\r
  float a = dot(hash22(i), f);\r
  float b = dot(hash22(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));\r
  float c = dot(hash22(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));\r
  float d = dot(hash22(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));\r
  return 0.5 + 0.5 * mix(mix(a, b, u.x), mix(c, d, u.x), u.y);\r
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
vec3 horizon(vec2 p, float time, out float order) {\r
  float span = 0.5 * max(uAspect, 1.0);\r
  float x = p.x / span;\r
  float arch = -0.17 - 0.2 * x * x + 0.02 * sin(time * 0.6);\r
  float soft = mix(0.05, 0.22, uSoftness);\r
  float edge = p.y - arch;\r
  float rim = 0.38 * smoothstep(-soft, 0.42, edge);\r
  vec2 sun = vec2(0.08 * sin(time * 0.31) * span, 0.58);\r
  float spread = length((p - sun) / vec2(0.95 * span, 0.75));\r
  float sky = mix(0.55, 1.0, smoothstep(0.2, 0.95, spread));\r
  order = clamp(edge * 1.3, 0.0, 1.0);\r
  return vec3(rim, sky, smoothstep(0.18, 0.62, edge));\r
}\r
\r
vec3 pinch(vec2 p, float time, out float order) {\r
  float span = 0.5 * max(uAspect, 0.75);\r
  float x = p.x / span;\r
  float sway = 0.02 * sin(x * 1.7 + time * 0.55);\r
  float breathe = 1.0 + 0.06 * sin(time * 0.8);\r
  float width = (0.13 + 0.22 * x * x) * breathe * mix(0.85, 1.2, uSoftness);\r
  float y = abs(p.y - sway) / width;\r
  float t = exp(-pow(y, 2.2)) * (0.42 + 0.58 * exp(-x * x * 1.8));\r
  order = clamp(abs(p.y - sway) * 2.4 + abs(x) * 0.3, 0.0, 1.0);\r
  return vec3(t, t, 0.0);\r
}\r
\r
vec3 rise(vec2 p, float time, out float order) {\r
  float wide = max(uAspect, 0.9);\r
  vec2 center = vec2(0.05 * sin(time * 0.45) * wide, -0.7);\r
  vec2 radius = vec2(0.82 * wide, 0.64 * (1.0 + 0.04 * sin(time * 0.8)));\r
  float d = length((p - center) / radius);\r
  float soft = mix(0.6, 1.15, uSoftness);\r
  float t = clamp(pow(clamp(1.0 - d, 0.0, 1.0), soft) * 1.35, 0.0, 1.0);\r
  order = clamp((d - 0.2) * 1.3, 0.0, 1.0);\r
  return vec3(t, t, 0.0);\r
}\r
\r
vec3 eclipse(vec2 p, float time, out float order) {\r
  float fit = min(1.0, uAspect * 1.25);\r
  float r = 0.23 * fit * (1.0 + 0.015 * sin(time * 0.9));\r
  float angle = atan(p.y, p.x);\r
  float rays = noise(vec2(cos(angle), sin(angle)) * 2.2 + time * 0.08) * 0.8 + 0.6;\r
  float d = length(p) - r;\r
  float reach = mix(0.07, 0.15, uSoftness) * rays * fit;\r
  float t = smoothstep(-0.006, 0.006 + 0.02 * uSoftness, d) * exp(-max(d, 0.0) / reach);\r
  order = clamp(d * 2.0, 0.0, 1.0);\r
  return vec3(t, t, 0.0);\r
}\r
\r
vec4 tone(float t) {\r
  float x = smoothstep(0.3, 1.0, t) * float(uCount - 1);\r
  int index = int(floor(x));\r
  return vec4(mix(uRamp[index], uRamp[min(index + 1, uCount - 1)], fract(x)), smoothstep(0.0, 0.38, t));\r
}\r
\r
void main() {\r
  vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);\r
  float time = uTime;\r
  vec2 q = p / uScale;\r
  vec2 warp = vec2(\r
    noise(q * 1.6 + uSeed + vec2(0.0, time * 0.3)),\r
    noise(q * 1.6 + uSeed.yx + vec2(4.3, -time * 0.24))\r
  ) - 0.5;\r
  q += warp * uFlow * (uShape == 3 ? 0.04 : 0.18);\r
  float order = 0.0;\r
  vec3 shape;\r
  if (uShape == 0) shape = horizon(q, time, order);\r
  else if (uShape == 1) shape = pinch(q, time, order);\r
  else if (uShape == 2) shape = rise(q, time, order);\r
  else shape = eclipse(q, time, order);\r
\r
  float reveal = clamp((uIntro * 1.45 - order) / 0.45, 0.0, 1.0);\r
  reveal = reveal * reveal * (3.0 - 2.0 * reveal);\r
\r
  float scramble = 0.0;\r
  for (int i = 0; i < 24; i++) {\r
    vec4 point = uTrail[i];\r
    if (point.z <= 0.0) continue;\r
    vec2 d = p - point.xy;\r
    scramble = max(scramble, point.z * exp(-dot(d, d) / (uRadius * uRadius)));\r
  }\r
  for (int i = 0; i < 4; i++) {\r
    vec4 c = uClicks[i];\r
    if (c.w <= 0.0) continue;\r
    float d = length(p - c.xy);\r
    if (uClickEffect == 1) {\r
      scramble = max(scramble, exp(-pow((d - c.z * 0.75) / 0.06, 2.0)) * c.w);\r
    } else if (uClickEffect == 2) {\r
      float size = 0.08 + 0.22 * (1.0 - exp(-c.z * 5.0));\r
      scramble = max(scramble, (1.0 - smoothstep(size * 0.6, size, d)) * c.w);\r
    }\r
  }\r
  vec2 t = clamp(shape.xy * mix(0.7, 1.0, reveal), 0.0, 1.0);\r
  vec4 mixed = mix(tone(t.x), tone(t.y), shape.z);\r
  vec3 color = encode(labToRgb(mixed.rgb));\r
  float alpha = mixed.a * reveal;\r
  float dither = (hash12(gl_FragCoord.xy + uFrame * 13.7) - 0.5) / 255.0;\r
  outColor = clamp(vec4(color * alpha + dither, alpha + dither), 0.0, 1.0);\r
  outAux = vec4(reveal, scramble, 0.0, 1.0);\r
}\`;\r
\r
const GLYPHS = \`\r
uniform sampler2D uField;\r
uniform sampler2D uAux;\r
uniform sampler2D uAtlas;\r
uniform vec2 uResolution;\r
uniform vec2 uCell;\r
uniform vec2 uOffset;\r
uniform vec2 uAtlasGrid;\r
uniform float uCount;\r
uniform float uDensity;\r
uniform float uOpacity;\r
uniform float uFlicker;\r
uniform float uDepth;\r
uniform float uGlyphTime;\r
uniform float uSeedValue;\r
uniform float uLight;\r
\${COMMON}\r
float sampleGlyph(float index, vec2 local, vec2 coord, float soft) {\r
  float column = mod(index, uAtlasGrid.x);\r
  float row = floor(index / uAtlasGrid.x);\r
  vec2 atlasUv = vec2((column + local.x) / uAtlasGrid.x, (row + 1.0 - local.y) / uAtlasGrid.y);\r
  vec2 continuous = coord / uAtlasGrid;\r
  float scale = exp2(soft);\r
  return textureGrad(uAtlas, atlasUv, dFdx(continuous) * scale, dFdy(continuous) * scale).a;\r
}\r
\r
vec4 glyphAt(vec2 px) {\r
  vec2 coord = (px - uOffset) / uCell;\r
  vec2 cell = floor(coord);\r
  vec2 local = coord - cell;\r
  vec2 uv = clamp(((cell + 0.5) * uCell + uOffset) / uResolution, vec2(0.0), vec2(1.0));\r
  vec4 field = texture(uField, uv);\r
  vec4 aux = texture(uAux, uv);\r
  vec3 visible = uLight > 0.5 ? field.rgb + (1.0 - field.a) : field.rgb;\r
  float luma = dot(visible, vec3(0.2126, 0.7152, 0.0722));\r
  float value = uLight > 0.5 ? clamp((1.0 - luma) * 1.5, 0.0, 1.0) : luma;\r
  float pick = hash12(cell + uSeedValue * 7.31);\r
  float level = hash12(cell * 1.73 + 4.1 + uSeedValue);\r
  float tick = floor(uGlyphTime * 9.0 + level * 9.0);\r
  float wobble = (hash12(cell * 2.31 + tick * 17.7) - 0.5) * uFlicker * 0.4 + (level - 0.5) * 0.1;\r
  float tone = clamp(pow(value, 0.75) + wobble, 0.0, 1.0);\r
  float index = floor(tone * (uCount - 1.0) + 0.5);\r
  float decode = max(aux.g, 1.0 - aux.r);\r
  if (decode > 0.02) {\r
    float frame = floor(uGlyphTime * 20.0);\r
    if (hash12(cell * 3.7 + frame * 5.3) < decode * 1.25) index = 1.0 + floor(hash12(cell + frame * 1.37) * (uCount - 1.0));\r
  }\r
  float present = step(pick, uDensity * mix(1.0, 0.3 + tone * 1.1, 0.55));\r
  float cutoff = smoothstep(0.03, 0.1, value);\r
  float focus = step(hash12(cell * 0.71 + 9.2 + uSeedValue), uDepth);\r
  float coverage = sampleGlyph(index, local, coord, focus * 1.2);\r
  float alpha = uOpacity * present * cutoff * coverage * mix(1.0, 0.35 + 0.65 * level, 0.55) * (1.0 - focus * 0.5);\r
  if (uLight < 0.5) {\r
    vec3 light = field.rgb * 0.55 + vec3(0.03) * field.a;\r
    return vec4(light * alpha, 0.6 * field.a * alpha);\r
  }\r
  vec3 ink = visible * 0.8;\r
  return vec4(ink * alpha, alpha);\r
}\r
\`;\r
\r
const HALO = \`#version 300 es\r
precision highp float;\r
uniform float uDownscale;\r
in vec2 vUv;\r
out vec4 outColor;\r
\${GLYPHS}\r
void main() {\r
  outColor = glyphAt(gl_FragCoord.xy * uDownscale);\r
}\`;\r
\r
const BLUR = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uSource;\r
uniform vec2 uStep;\r
in vec2 vUv;\r
out vec4 outColor;\r
void main() {\r
  vec4 sum = texture(uSource, vUv) * 0.2270270270;\r
  sum += texture(uSource, vUv + uStep * 1.3846153846) * 0.3162162162;\r
  sum += texture(uSource, vUv - uStep * 1.3846153846) * 0.3162162162;\r
  sum += texture(uSource, vUv + uStep * 3.2307692308) * 0.0702702703;\r
  sum += texture(uSource, vUv - uStep * 3.2307692308) * 0.0702702703;\r
  outColor = sum;\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uHalo;\r
uniform float uGlow;\r
uniform float uGradient;\r
uniform float uGrain;\r
uniform float uFrame;\r
in vec2 vUv;\r
out vec4 outColor;\r
\${GLYPHS}\r
void main() {\r
  vec4 base = texture(uField, vUv) * uGradient;\r
  vec4 glyph = glyphAt(gl_FragCoord.xy);\r
  vec4 halo = texture(uHalo, vUv) * uGlow;\r
  vec4 color;\r
  if (uLight < 0.5) {\r
    color = base + glyph + halo;\r
  } else {\r
    color = glyph + base * (1.0 - glyph.a);\r
    color += halo * 0.6 * (1.0 - color.a);\r
  }\r
  float grain = (hash12(gl_FragCoord.xy + uFrame * vec2(17.0, 59.0)) + hash12(gl_FragCoord.xy * 1.31 + uFrame * 7.0) - 1.0) * uGrain;\r
  float body = clamp(color.a, 0.0, 1.0);\r
  color.rgb += grain * (0.25 + body) * 0.5;\r
  color.a = clamp(color.a, 0.0, 1.0);\r
  color.rgb = clamp(color.rgb, 0.0, color.a);\r
  outColor = color;\r
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
const createTarget = (gl: WebGL2RenderingContext, count: number): Target => {\r
  const textures = Array.from({ length: count }, () => {\r
    const texture = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, texture);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    return texture;\r
  });\r
  return { textures, framebuffer: gl.createFramebuffer(), width: 0, height: 0 };\r
};\r
\r
const sizeTarget = (gl: WebGL2RenderingContext, target: Target, width: number, height: number) => {\r
  if (target.width === width && target.height === height) return;\r
  target.width = width;\r
  target.height = height;\r
  gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);\r
  target.textures.forEach((texture, i) => {\r
    gl.bindTexture(gl.TEXTURE_2D, texture);\r
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, texture, 0);\r
  });\r
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
};\r
\r
const buildAtlas = (gl: WebGL2RenderingContext, characters: string, fontFamily: string): Atlas => {\r
  const list = [...new Set([...characters].filter(char => char !== '\\n' && char !== '\\r'))];\r
  if (!list.length) list.push(' ');\r
  const font = \`300 \${Math.round(ATLAS_CELL_H * FONT_SCALE)}px \${fontFamily}\`;\r
  const columns = Math.min(ATLAS_COLUMNS, list.length);\r
  const rows = Math.ceil(list.length / columns);\r
  const canvas = document.createElement('canvas');\r
  canvas.width = ATLAS_CELL_W * columns;\r
  canvas.height = ATLAS_CELL_H * rows;\r
  const context = canvas.getContext('2d');\r
  if (context) {\r
    context.font = font;\r
    context.textAlign = 'center';\r
    context.textBaseline = 'middle';\r
    context.fillStyle = '#fff';\r
    list.forEach((char, index) => {\r
      const column = index % columns;\r
      const row = Math.floor(index / columns);\r
      context.fillText(char, column * ATLAS_CELL_W + ATLAS_CELL_W / 2, row * ATLAS_CELL_H + ATLAS_CELL_H / 2 + 3);\r
    });\r
  }\r
  const texture = gl.createTexture();\r
  gl.bindTexture(gl.TEXTURE_2D, texture);\r
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);\r
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, canvas);\r
  gl.generateMipmap(gl.TEXTURE_2D);\r
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);\r
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
  return { texture, count: list.length, grid: [columns, rows] };\r
};\r
\r
const GradientASCII = ({\r
  colors = DEFAULT_COLORS,\r
  shape = 'horizon',\r
  characters = DEFAULT_CHARACTERS,\r
  cellSize = 18,\r
  density = 0.8,\r
  glyphOpacity = 0.85,\r
  glow = 0.2,\r
  depthOfField = 0,\r
  flicker = 0.2,\r
  softness = 0.5,\r
  scale = 1,\r
  flow = 0.5,\r
  speed = 1,\r
  gradientOpacity = 0.9,\r
  grain = 0.08,\r
  variation = 0,\r
  mouseInteraction = true,\r
  scrambleRadius = 0.1,\r
  clickEffect = 'wave',\r
  intro = true,\r
  lightMode = false,\r
  fontFamily = DEFAULT_FONT,\r
  dpr,\r
  className = '',\r
  style,\r
  ...rest\r
}: GradientASCIIProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const palette = (Array.isArray(colors) && colors.length ? colors : DEFAULT_COLORS).slice(0, MAX_COLORS);\r
  const settings: Settings = {\r
    colors: palette.length > 1 ? palette : [palette[0], palette[0]],\r
    shape: SHAPES[shape] ?? 0,\r
    characters: characters || DEFAULT_CHARACTERS,\r
    cellSize: clamp(cellSize, 6, 64),\r
    density: clamp(density, 0, 1),\r
    glyphOpacity: clamp(glyphOpacity, 0, 1),\r
    glow: clamp(glow, 0, 2),\r
    depthOfField: clamp(depthOfField, 0, 1),\r
    flicker: clamp(flicker, 0, 1),\r
    softness: clamp(softness, 0, 1),\r
    scale: clamp(scale, 0.4, 2.5),\r
    flow: clamp(flow, 0, 2),\r
    speed: Math.max(0, speed),\r
    gradientOpacity: clamp(gradientOpacity, 0, 1),\r
    grain: clamp(grain, 0, 0.4),\r
    variation: Math.max(0, variation),\r
    mouseInteraction,\r
    scrambleRadius: clamp(scrambleRadius, 0.02, 0.4),\r
    clickEffect: CLICK_EFFECTS[clickEffect] ?? 1,\r
    intro,\r
    lightMode,\r
    fontFamily: fontFamily || DEFAULT_FONT,\r
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
    const field = link(gl, FIELD);\r
    const halo = link(gl, HALO);\r
    const blur = link(gl, BLUR);\r
    const composite = link(gl, COMPOSITE);\r
    if (!field || !halo || !blur || !composite) return undefined;\r
    const vao = gl.createVertexArray();\r
    const fieldTarget = createTarget(gl, 2);\r
    const haloA = createTarget(gl, 1);\r
    const haloB = createTarget(gl, 1);\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const colorCache = new Map<string, number[]>();\r
    const parse = (value: string): number[] => {\r
      const key = String(value);\r
      const cached = colorCache.get(key);\r
      if (cached) return cached;\r
      let rgb: number[] = [0, 0, 0];\r
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
    const clickData = new Float32Array(MAX_CLICKS * 4);\r
    const clicks: Point[] = [];\r
    const trailData = new Float32Array(MAX_TRAIL * 4);\r
    const trail: Point[] = [];\r
    const pointer = { x: 0, y: 0, inside: false };\r
    let atlas: Atlas | null = null;\r
    let atlasKey = '';\r
    let paletteKey = '';\r
    let time = 0;\r
    let glyphTime = 0;\r
    let introClock = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let frameSeed = 0;\r
    let grainClock = 0;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let disposed = false;\r
\r
    const syncAtlas = () => {\r
      const s = settingsRef.current;\r
      const key = \`\${s.fontFamily}|\${s.characters}\`;\r
      if (key === atlasKey && atlas) return;\r
      atlasKey = key;\r
      if (atlas) gl.deleteTexture(atlas.texture);\r
      atlas = buildAtlas(gl, s.characters, s.fontFamily);\r
      document.fonts?.load?.(\`300 64px \${s.fontFamily}\`, s.characters).then(\r
        () => {\r
          if (disposed || atlasKey !== key) return;\r
          if (atlas) gl.deleteTexture(atlas.texture);\r
          atlas = buildAtlas(gl, s.characters, s.fontFamily);\r
          draw();\r
        },\r
        () => {}\r
      );\r
    };\r
\r
    const syncPalette = () => {\r
      const s = settingsRef.current;\r
      const key = s.colors.join(',');\r
      if (key === paletteKey) return;\r
      paletteKey = key;\r
      s.colors.forEach((color, i) => ramp.set(toLab(parse(color)), i * 3));\r
    };\r
\r
    const bindGlyphs = (program: Program, width: number, height: number) => {\r
      if (!atlas) return;\r
      const s = settingsRef.current;\r
      const u = program.uniforms;\r
      const cellH = s.cellSize * view.ratio;\r
      const cellW = cellH * (ATLAS_CELL_W / ATLAS_CELL_H);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, fieldTarget.textures[0]);\r
      gl.uniform1i(u.uField, 0);\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.bindTexture(gl.TEXTURE_2D, fieldTarget.textures[1]);\r
      gl.uniform1i(u.uAux, 1);\r
      gl.activeTexture(gl.TEXTURE2);\r
      gl.bindTexture(gl.TEXTURE_2D, atlas.texture);\r
      gl.uniform1i(u.uAtlas, 2);\r
      gl.uniform2f(u.uResolution, width, height);\r
      gl.uniform2f(u.uCell, cellW, cellH);\r
      gl.uniform2f(\r
        u.uOffset,\r
        (width - Math.ceil(width / cellW) * cellW) / 2,\r
        (height - Math.ceil(height / cellH) * cellH) / 2\r
      );\r
      gl.uniform2f(u.uAtlasGrid, atlas.grid[0], atlas.grid[1]);\r
      gl.uniform1f(u.uCount, atlas.count);\r
      gl.uniform1f(u.uDensity, s.density);\r
      gl.uniform1f(u.uOpacity, s.glyphOpacity);\r
      gl.uniform1f(u.uFlicker, reduce ? 0 : s.flicker);\r
      gl.uniform1f(u.uDepth, s.depthOfField);\r
      gl.uniform1f(u.uGlyphTime, glyphTime);\r
      gl.uniform1f(u.uSeedValue, s.variation);\r
      gl.uniform1f(u.uLight, s.lightMode ? 1 : 0);\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      const aspect = view.width / view.height;\r
      syncAtlas();\r
      syncPalette();\r
      gl.bindVertexArray(vao);\r
      gl.disable(gl.BLEND);\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, fieldTarget.framebuffer);\r
      gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);\r
      gl.viewport(0, 0, fieldTarget.width, fieldTarget.height);\r
      gl.useProgram(field.program);\r
      const fu = field.uniforms;\r
      gl.uniform1f(fu.uAspect, aspect);\r
      gl.uniform1f(fu.uTime, time);\r
      gl.uniform1i(fu.uShape, s.shape);\r
      gl.uniform3fv(fu.uRamp, ramp);\r
      gl.uniform1i(fu.uCount, s.colors.length);\r
      gl.uniform1f(fu.uScale, s.scale);\r
      gl.uniform1f(fu.uSoftness, s.softness);\r
      gl.uniform1f(fu.uFlow, s.flow);\r
      gl.uniform2f(fu.uSeed, s.variation * 3.17, s.variation * 1.91);\r
      gl.uniform4fv(fu.uTrail, trailData);\r
      gl.uniform1f(fu.uRadius, s.scrambleRadius);\r
      gl.uniform4fv(fu.uClicks, clickData);\r
      gl.uniform1i(fu.uClickEffect, s.clickEffect);\r
      gl.uniform1f(fu.uIntro, introClock);\r
      gl.uniform1f(fu.uFrame, frameSeed);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      const glowing = s.glow > 0.001;\r
      if (glowing) {\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, haloA.framebuffer);\r
        gl.drawBuffers([gl.COLOR_ATTACHMENT0]);\r
        gl.viewport(0, 0, haloA.width, haloA.height);\r
        gl.useProgram(halo.program);\r
        bindGlyphs(halo, canvas.width, canvas.height);\r
        gl.uniform1f(halo.uniforms.uDownscale, canvas.width / haloA.width);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
        gl.useProgram(blur.program);\r
        gl.activeTexture(gl.TEXTURE0);\r
        gl.uniform1i(blur.uniforms.uSource, 0);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, haloB.framebuffer);\r
        gl.bindTexture(gl.TEXTURE_2D, haloA.textures[0]);\r
        gl.uniform2f(blur.uniforms.uStep, 1 / haloA.width, 0);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, haloA.framebuffer);\r
        gl.bindTexture(gl.TEXTURE_2D, haloB.textures[0]);\r
        gl.uniform2f(blur.uniforms.uStep, 0, 1 / haloA.height);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      }\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(composite.program);\r
      bindGlyphs(composite, canvas.width, canvas.height);\r
      const cu = composite.uniforms;\r
      gl.activeTexture(gl.TEXTURE3);\r
      gl.bindTexture(gl.TEXTURE_2D, haloA.textures[0]);\r
      gl.uniform1i(cu.uHalo, 3);\r
      gl.uniform1f(cu.uGlow, glowing ? s.glow : 0);\r
      gl.uniform1f(cu.uGradient, s.gradientOpacity);\r
      gl.uniform1f(cu.uGrain, s.grain);\r
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
      sizeTarget(\r
        gl,\r
        fieldTarget,\r
        Math.max(1, Math.round(canvas.width / 2)),\r
        Math.max(1, Math.round(canvas.height / 2))\r
      );\r
      const haloWidth = Math.max(1, Math.round(canvas.width / 4));\r
      const haloHeight = Math.max(1, Math.round(canvas.height / 4));\r
      sizeTarget(gl, haloA, haloWidth, haloHeight);\r
      sizeTarget(gl, haloB, haloWidth, haloHeight);\r
      draw();\r
      wake();\r
    };\r
\r
    const updateInput = (dt: number) => {\r
      trail.forEach(point => {\r
        point.age += dt;\r
      });\r
      while (trail.length && trail[trail.length - 1].age > TRAIL_LIFE) trail.pop();\r
      for (let i = 0; i < MAX_TRAIL; i++) {\r
        const point = trail[i];\r
        if (!point) {\r
          trailData[i * 4 + 2] = 0;\r
          continue;\r
        }\r
        const k = 1 - point.age / TRAIL_LIFE;\r
        trailData.set([point.x, point.y, k * k, 0], i * 4);\r
      }\r
      clicks.forEach(click => {\r
        click.age += dt;\r
      });\r
      while (clicks.length && clicks[clicks.length - 1].age > CLICK_LIFE) clicks.pop();\r
      for (let i = 0; i < MAX_CLICKS; i++) {\r
        const click = clicks[i];\r
        if (!click) {\r
          clickData[i * 4 + 3] = 0;\r
          continue;\r
        }\r
        const k = click.age / CLICK_LIFE;\r
        const envelope = Math.min(1, click.age / 0.08) * (1 - k) * (1 - k);\r
        clickData.set([click.x, click.y, click.age, envelope], i * 4);\r
      }\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (disposed || !visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.001, 0.05) : 1 / 60;\r
      last = now;\r
      if (!reduce) {\r
        time += dt * s.speed * 0.5;\r
        glyphTime += dt * Math.max(s.speed, 0.15);\r
      }\r
      if (introClock < 1) introClock = Math.min(1, introClock + dt / INTRO_SECONDS);\r
      grainClock += dt;\r
      if (!reduce && grainClock > 1 / 24) {\r
        grainClock = 0;\r
        frameSeed = (frameSeed + 1) % 97;\r
      }\r
      updateInput(dt);\r
      draw();\r
      const busy = !reduce || introClock < 1 || clicks.length > 0 || trail.length > 0;\r
      if (busy) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    function wake() {\r
      if (!raf && !disposed && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    }\r
\r
    const locate = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = (event.clientX - rect.left) / Math.max(1, rect.width);\r
      const y = 1 - (event.clientY - rect.top) / Math.max(1, rect.height);\r
      const aspect = rect.width / Math.max(1, rect.height);\r
      pointer.inside = x >= 0 && x <= 1 && y >= 0 && y <= 1;\r
      pointer.x = (x - 0.5) * aspect;\r
      pointer.y = y - 0.5;\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      locate(event);\r
      const s = settingsRef.current;\r
      if (!pointer.inside || !s.mouseInteraction || reduce) return;\r
      const head = trail[0];\r
      const gap = head ? Math.hypot(pointer.x - head.x, pointer.y - head.y) : Infinity;\r
      if (gap < TRAIL_STEP) return;\r
      if (head && head.age < 0.1) {\r
        const steps = Math.min(6, Math.floor(gap / (TRAIL_STEP * 2)));\r
        for (let i = 1; i <= steps; i++) {\r
          const k = i / (steps + 1);\r
          trail.unshift({ x: head.x + (pointer.x - head.x) * k, y: head.y + (pointer.y - head.y) * k, age: 0 });\r
        }\r
      }\r
      trail.unshift({ x: pointer.x, y: pointer.y, age: 0 });\r
      trail.length = Math.min(trail.length, MAX_TRAIL);\r
      wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      locate(event);\r
      const s = settingsRef.current;\r
      if (!pointer.inside || !s.clickEffect || reduce) return;\r
      clicks.unshift({ x: pointer.x, y: pointer.y, age: 0 });\r
      if (clicks.length > MAX_CLICKS) clicks.pop();\r
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
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
    wakeRef.current = wake;\r
\r
    return () => {\r
      disposed = true;\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      [fieldTarget, haloA, haloB].forEach(target => {\r
        target.textures.forEach(texture => gl.deleteTexture(texture));\r
        gl.deleteFramebuffer(target.framebuffer);\r
      });\r
      if (atlas) gl.deleteTexture(atlas.texture);\r
      gl.deleteVertexArray(vao);\r
      [field, halo, blur, composite].forEach(item => gl.deleteProgram(item.program));\r
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
export default GradientASCII;\r
`,a={usage:`import GradientASCII from './GradientASCII';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <GradientASCII
    colors={['#1e3fd8', '#f6f8ff', '#a5d8ff', '#38bdf8']}
    shape="horizon"
    characters=" =+xX0S8#@"
    cellSize={18}
    density={0.8}
  />
</div>`,code:r,css:n,tailwind:e,tsCode:t,tsTailwind:l};export{a as gradientASCII};
