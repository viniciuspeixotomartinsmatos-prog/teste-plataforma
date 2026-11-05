const r=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
import './HalftoneReveal.css';\r
\r
const DEFAULT_SRC = 'https://images.unsplash.com/photo-1693250707557-a846a014b321?q=80&w=1400&auto=format&fit=crop';\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const MASK = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uPrevious;\r
uniform vec2 uTexture;\r
uniform vec2 uView;\r
uniform vec2 uFrom;\r
uniform vec2 uTo;\r
uniform float uRadius;\r
uniform float uSoftness;\r
uniform float uStrength;\r
uniform float uFade;\r
out vec4 outColor;\r
\r
float segment(vec2 p, vec2 a, vec2 b) {\r
  vec2 ab = b - a;\r
  float h = clamp(dot(p - a, ab) / max(dot(ab, ab), 0.0001), 0.0, 1.0);\r
  return length(p - a - ab * h);\r
}\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uTexture;\r
  vec2 p = vec2(uv.x, 1.0 - uv.y) * uView;\r
  float trail = max(texture(uPrevious, uv).r - uFade, 0.0);\r
  float band = max(uRadius * uSoftness, 1.0);\r
  float brush = clamp((uRadius - segment(p, uFrom, uTo)) / band, 0.0, 1.0);\r
  brush = brush * brush * (3.0 - 2.0 * brush);\r
  outColor = vec4(max(trail, brush * uStrength), 0.0, 0.0, 1.0);\r
}\`;\r
\r
const VIEW = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uImage;\r
uniform sampler2D uMask;\r
uniform vec2 uResolution;\r
uniform vec2 uView;\r
uniform float uDpr;\r
uniform vec4 uFrame;\r
uniform float uTexels;\r
uniform float uMode;\r
uniform float uShape;\r
uniform float uCell;\r
uniform float uAngle;\r
uniform float uScale;\r
uniform vec3 uInk;\r
uniform vec3 uAccent;\r
uniform vec3 uPaper;\r
uniform float uContrast;\r
uniform float uBrightness;\r
uniform float uInvert;\r
uniform float uRough;\r
uniform float uShift;\r
uniform vec3 uMatte;\r
uniform float uKey;\r
uniform float uReverse;\r
uniform float uIntro;\r
uniform vec4 uBursts[4];\r
uniform float uBurstWidth;\r
out vec4 outColor;\r
\r
const vec3 LUMA = vec3(0.2126, 0.7152, 0.0722);\r
const vec3 CYAN = vec3(0.0, 0.64, 0.93);\r
const vec3 MAGENTA = vec3(0.92, 0.07, 0.56);\r
const vec3 YELLOW = vec3(1.0, 0.91, 0.0);\r
const vec3 KEY = vec3(0.11, 0.1, 0.12);\r
const vec3 RED = vec3(1.0, 0.16, 0.12);\r
const vec3 GREEN = vec3(0.12, 1.0, 0.3);\r
const vec3 BLUE = vec3(0.16, 0.32, 1.0);\r
\r
mat2 rotate(float a) {\r
  float c = cos(a);\r
  float s = sin(a);\r
  return mat2(c, -s, s, c);\r
}\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
float noise(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = fract(p);\r
  f = f * f * (3.0 - 2.0 * f);\r
  float a = hash(i);\r
  float b = hash(i + vec2(1.0, 0.0));\r
  float c = hash(i + vec2(0.0, 1.0));\r
  float d = hash(i + vec2(1.0, 1.0));\r
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);\r
}\r
\r
vec4 photo(vec2 p, float lod, float margin) {\r
  vec2 uv = (p - uFrame.xy) / uFrame.zw;\r
  vec4 c = textureLod(uImage, clamp(uv, 0.0, 1.0), lod);\r
  vec2 slack = margin * uCell / uFrame.zw;\r
  vec2 inside = step(-slack, uv) * step(uv, 1.0 + slack);\r
  float keep = inside.x * inside.y * c.a;\r
  keep *= mix(1.0, smoothstep(0.05, 0.2, distance(c.rgb, uMatte)), uKey);\r
  return vec4(c.rgb, keep);\r
}\r
\r
float grade(float v) {\r
  v = clamp((v - 0.5) * uContrast + 0.5 + uBrightness, 0.0, 1.0);\r
  return mix(v, 1.0 - v, uInvert);\r
}\r
\r
vec3 gradeColor(vec3 c) {\r
  return vec3(grade(c.r), grade(c.g), grade(c.b));\r
}\r
\r
vec3 tone(vec3 c) {\r
  return pow(max(c, 0.0), vec3(1.5));\r
}\r
\r
float press(float t, float alpha) {\r
  return (0.05 + clamp(t, 0.0, 1.0) * 0.89) * alpha;\r
}\r
\r
float plate(float t, float alpha) {\r
  return (0.02 + clamp(t, 0.0, 1.0) * 0.92) * alpha;\r
}\r
\r
vec3 decode(vec3 c) {\r
  return pow(max(c, 0.0), vec3(2.2));\r
}\r
\r
vec4 separate(vec3 color) {\r
  vec3 target = clamp(tone(gradeColor(color)) / max(tone(uPaper), vec3(0.02)), 0.0, 1.0);\r
  vec3 absorbC = 1.0 - decode(CYAN);\r
  vec3 absorbM = 1.0 - decode(MAGENTA);\r
  vec3 absorbY = 1.0 - decode(YELLOW);\r
  float bright = pow(max(max(target.r, target.g), target.b), 0.4545);\r
  float key = pow(clamp(1.0 - bright / 0.62, 0.0, 1.0), 1.4) * 0.95;\r
  vec3 rest = clamp(target / max(1.0 - key * (1.0 - decode(KEY)), vec3(0.03)), 0.0, 1.0);\r
  vec3 a = 1.0 - rest;\r
  for (int i = 0; i < 3; i++) {\r
    vec3 tc = 1.0 - a.x * absorbC;\r
    vec3 tm = 1.0 - a.y * absorbM;\r
    vec3 ty = 1.0 - a.z * absorbY;\r
    mat3 slope = mat3(-absorbC * tm * ty, -absorbM * tc * ty, -absorbY * tc * tm);\r
    if (abs(determinant(slope)) < 1e-6) break;\r
    a = clamp(a - inverse(slope) * (tc * tm * ty - rest), 0.0, 1.0);\r
  }\r
  return vec4(a, key);\r
}\r
\r
vec3 emit(vec3 color) {\r
  vec3 target = max(tone(gradeColor(color)) - tone(uPaper), 0.0);\r
  mat3 lights = mat3(decode(RED), decode(GREEN), decode(BLUE));\r
  return clamp(inverse(lights) * target, 0.0, 1.0);\r
}\r
\r
float metric(vec2 f) {\r
  if (uShape < 0.5) return length(f);\r
  if (uShape < 1.5) return length(f * vec2(0.8, 1.15));\r
  if (uShape < 2.5) return max(abs(f.x), abs(f.y));\r
  if (uShape < 3.5) return abs(f.x) + abs(f.y);\r
  if (uShape < 4.5) return abs(f.y);\r
  return min(abs(f.x), abs(f.y));\r
}\r
\r
float reach(float t) {\r
  t = clamp(t, 0.0, 1.0);\r
  if (uShape < 0.5) return t < 0.785 ? sqrt(t / 3.14159) : mix(0.5, 0.72, (t - 0.785) / 0.215);\r
  if (uShape < 1.5) return t < 0.7 ? sqrt(t * 0.92 / 3.14159) : mix(0.4497, 0.72, (t - 0.7) / 0.3);\r
  if (uShape < 2.5) return 0.5 * sqrt(t) + 0.02 * t;\r
  if (uShape < 3.5) return t < 0.5 ? sqrt(t * 0.5) : 1.0 - sqrt((1.0 - t) * 0.5);\r
  if (uShape < 4.5) return 0.52 * t;\r
  return (1.0 - sqrt(1.0 - t)) * 0.5 + 0.02 * t;\r
}\r
\r
vec2 center(vec2 p, float angle) {\r
  vec2 q = rotate(angle) * p / uCell;\r
  vec2 c = floor(q) + 0.5;\r
  if (uShape > 3.5 && uShape < 4.5) c.x = q.x;\r
  return rotate(-angle) * c * uCell;\r
}\r
\r
float dots(vec2 p, float angle, float t, float seed, float grow) {\r
  vec2 q = rotate(angle) * p / uCell;\r
  float d = metric(fract(q) - 0.5);\r
  d += (noise(p * 0.42 + seed * 17.0) - 0.5) * uRough * 0.18;\r
  float r = reach(t) * uScale * grow;\r
  float w = max(fwidth(d), 0.0001) * 0.75;\r
  return smoothstep(r + w, r - w, d) * clamp(r / (w * 2.0), 0.0, 1.0);\r
}\r
\r
float coverage(vec4 image) {\r
  float shade = dot(tone(gradeColor(image.rgb)), LUMA);\r
  float paper = dot(tone(uPaper), LUMA);\r
  float span = dot(tone(uInk), LUMA) - paper;\r
  float t = abs(span) < 0.02 ? 1.0 - shade : (shade - paper) / span;\r
  return press(t, image.a);\r
}\r
\r
float burst(vec2 p) {\r
  float value = 0.0;\r
  for (int i = 0; i < 4; i++) {\r
    vec4 b = uBursts[i];\r
    if (b.w <= 0.0) continue;\r
    float offset = distance(p, b.xy) - b.z;\r
    float edge = offset > 0.0 ? offset / (uBurstWidth * 0.35) : -offset / uBurstWidth;\r
    value = max(value, clamp(1.0 - edge, 0.0, 1.0) * b.w);\r
  }\r
  return value;\r
}\r
\r
void main() {\r
  vec2 p = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y) / uDpr;\r
  float lod = log2(max(uCell * uTexels, 1.0));\r
  float base = uAngle;\r
  vec2 drift = vec2(uShift, uShift * -0.6);\r
\r
  vec2 field = p / max(uView.x, uView.y) - uView / max(uView.x, uView.y) * 0.5;\r
  float delay = length(field) * 1.15 + hash(floor(p / uCell)) * 0.06;\r
  float grow = smoothstep(0.0, 1.0, clamp((uIntro * 1.7 - delay) / 0.45, 0.0, 1.0));\r
\r
  vec3 print = uPaper;\r
  if (uMode < 0.5) {\r
    float k = dots(p, base, coverage(photo(center(p, base), lod, 0.5)), 0.0, grow);\r
    print = mix(uPaper, uInk, k);\r
  } else if (uMode < 1.5) {\r
    float second = base + 0.5236;\r
    float tA = coverage(photo(center(p, base), lod, 0.5));\r
    float tB = coverage(photo(center(p + drift, second) - drift, lod, 0.5));\r
    float kA = dots(p, base, pow(tA, 1.9), 0.0, grow);\r
    float kB = dots(p + drift, second, clamp(tB * 1.3, 0.0, 1.0) * 0.8, 1.0, grow);\r
    if (dot(uPaper, LUMA) > 0.5) {\r
      print = uPaper * mix(vec3(1.0), uAccent, kB) * mix(vec3(1.0), uInk, kA);\r
    } else {\r
      print = min(uPaper + uAccent * kB + uInk * kA, vec3(1.0));\r
    }\r
  } else if (dot(uPaper, LUMA) > 0.5) {\r
    float ac = base - 0.5236;\r
    float am = base + 0.5236;\r
    float ay = base - 0.7854;\r
    vec4 sc = photo(center(p + drift, ac) - drift, lod, 0.5);\r
    vec4 sm = photo(center(p - drift, am) + drift, lod, 0.5);\r
    vec4 sy = photo(center(p + drift.yx, ay) - drift.yx, lod, 0.5);\r
    vec4 sk = photo(center(p, base), lod, 0.5);\r
    float kc = sc.a > 0.0 ? dots(p + drift, ac, plate(separate(sc.rgb).x, sc.a), 1.0, grow) : 0.0;\r
    float km = sm.a > 0.0 ? dots(p - drift, am, plate(separate(sm.rgb).y, sm.a), 2.0, grow) : 0.0;\r
    float ky = sy.a > 0.0 ? dots(p + drift.yx, ay, plate(separate(sy.rgb).z, sy.a), 3.0, grow) : 0.0;\r
    float kk = sk.a > 0.0 ? dots(p, base, plate(separate(sk.rgb).w, sk.a), 4.0, grow) : 0.0;\r
    print = uPaper;\r
    print *= mix(vec3(1.0), CYAN, kc);\r
    print *= mix(vec3(1.0), MAGENTA, km);\r
    print *= mix(vec3(1.0), YELLOW, ky);\r
    print *= mix(vec3(1.0), KEY, kk);\r
  } else {\r
    float ar = base - 0.5236;\r
    float ag = base + 0.5236;\r
    vec4 sr = photo(center(p + drift, ar) - drift, lod, 0.5);\r
    vec4 sg = photo(center(p - drift, ag) + drift, lod, 0.5);\r
    vec4 sb = photo(center(p, base), lod, 0.5);\r
    float kr = dots(p + drift, ar, plate(emit(sr.rgb).x, sr.a), 1.0, grow);\r
    float kg = dots(p - drift, ag, plate(emit(sg.rgb).y, sg.a), 2.0, grow);\r
    float kb = dots(p, base, plate(emit(sb.rgb).z, sb.a), 3.0, grow);\r
    print = min(uPaper + RED * kr + GREEN * kg + BLUE * kb, vec3(1.0));\r
  }\r
\r
  vec2 maskUv = vec2(p.x / uView.x, 1.0 - p.y / uView.y);\r
  float shown = max(texture(uMask, maskUv).r, burst(p));\r
  shown = mix(shown, 1.0 - shown, uReverse);\r
  shown = shown * shown * (3.0 - 2.0 * shown);\r
  vec2 q = rotate(base) * p / uCell;\r
  float d = metric(fract(q) - 0.5);\r
  float r = reach(1.0) * 1.08 * shown;\r
  float w = max(fwidth(d), 0.0001) * 0.75;\r
  float k = smoothstep(r + w, r - w, d) * clamp(r / (w * 2.0), 0.0, 1.0);\r
  vec4 sharp = photo(p, 0.0, 0.0);\r
  vec3 real = mix(uPaper, sharp.rgb, sharp.a);\r
  outColor = vec4(mix(print, real, k), 1.0);\r
}\`;\r
\r
const MODES = { mono: 0, duotone: 1, color: 2 };\r
const SHAPES = { dot: 0, ellipse: 1, square: 2, diamond: 3, line: 4, cross: 5 };\r
const MAX_BURSTS = 4;\r
const BURST_SECONDS = 1.3;\r
const INTRO_SECONDS = 1.4;\r
const MASK_SCALE = 0.5;\r
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
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;\r
  gl.deleteProgram(program);\r
  return null;\r
};\r
\r
const locate = (gl, program, names) => {\r
  const result = {};\r
  for (const name of names) result[name] = gl.getUniformLocation(program, name);\r
  return result;\r
};\r
\r
const wanderAt = (t, w, h) => [\r
  w * (0.5 + 0.32 * Math.sin(t * 0.53) + 0.08 * Math.sin(t * 1.31 + 0.6)),\r
  h * (0.5 + 0.27 * Math.sin(t * 0.71 + 1.1) + 0.07 * Math.cos(t * 1.57))\r
];\r
\r
const measureEdge = (context, image) => {\r
  const size = 32;\r
  context.canvas.width = size;\r
  context.canvas.height = size;\r
  context.clearRect(0, 0, size, size);\r
  context.drawImage(image, 0, 0, size, size);\r
  const data = context.getImageData(0, 0, size, size).data;\r
  const sum = [0, 0, 0];\r
  const squares = [0, 0, 0];\r
  let count = 0;\r
  let clear = 0;\r
  for (let y = 0; y < size; y++) {\r
    for (let x = 0; x < size; x++) {\r
      if (x > 0 && y > 0 && x < size - 1 && y < size - 1) continue;\r
      const i = (y * size + x) * 4;\r
      if (data[i + 3] < 250) clear++;\r
      for (let c = 0; c < 3; c++) {\r
        const v = data[i + c] / 255;\r
        sum[c] += v;\r
        squares[c] += v * v;\r
      }\r
      count++;\r
    }\r
  }\r
  const matte = [sum[0] / count, sum[1] / count, sum[2] / count];\r
  const spread =\r
    matte.reduce((total, mean, c) => total + Math.sqrt(Math.max(0, squares[c] / count - mean * mean)), 0) / 3;\r
  return { matte, plain: clear < count * 0.5 && spread < 0.06 };\r
};\r
\r
const HalftoneReveal = ({\r
  src = DEFAULT_SRC,\r
  fit = 'cover',\r
  mode = 'mono',\r
  shape = 'dot',\r
  cellSize = 6,\r
  angle = 45,\r
  dotScale = 1,\r
  inkColor = '#120f17',\r
  accentColor = '#ff4f2a',\r
  paperColor = '#ffffff',\r
  contrast = 1.1,\r
  brightness = 0,\r
  invert = false,\r
  roughness = 0,\r
  misregistration = 0,\r
  revealRadius = 160,\r
  softness = 0.6,\r
  linger = 1.2,\r
  reverse = false,\r
  wander = false,\r
  clickBurst = true,\r
  intro = true,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settings = {\r
    fit,\r
    mode: MODES[mode] ?? 0,\r
    shape: SHAPES[shape] ?? 0,\r
    cellSize: clamp(cellSize, 2, 80),\r
    angle,\r
    dotScale: clamp(dotScale, 0.2, 2),\r
    inkColor: String(inkColor),\r
    accentColor: String(accentColor),\r
    paperColor: String(paperColor),\r
    contrast,\r
    brightness,\r
    invert,\r
    roughness: clamp(roughness, 0, 1),\r
    misregistration: clamp(misregistration, 0, 1),\r
    revealRadius: Math.max(0, revealRadius),\r
    softness: clamp(softness, 0, 1),\r
    linger: Math.max(0, linger),\r
    reverse,\r
    wander,\r
    clickBurst,\r
    intro\r
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
      stencil: false,\r
      preserveDrawingBuffer: false\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const maskProgram = link(gl, MASK);\r
    const viewProgram = link(gl, VIEW);\r
    if (!maskProgram || !viewProgram) return undefined;\r
    const maskUniforms = locate(gl, maskProgram, [\r
      'uPrevious',\r
      'uTexture',\r
      'uView',\r
      'uFrom',\r
      'uTo',\r
      'uRadius',\r
      'uSoftness',\r
      'uStrength',\r
      'uFade'\r
    ]);\r
    const viewUniforms = locate(gl, viewProgram, [\r
      'uImage',\r
      'uMask',\r
      'uResolution',\r
      'uView',\r
      'uDpr',\r
      'uFrame',\r
      'uTexels',\r
      'uMode',\r
      'uShape',\r
      'uCell',\r
      'uAngle',\r
      'uScale',\r
      'uInk',\r
      'uAccent',\r
      'uPaper',\r
      'uContrast',\r
      'uBrightness',\r
      'uInvert',\r
      'uRough',\r
      'uShift',\r
      'uMatte',\r
      'uKey',\r
      'uReverse',\r
      'uIntro',\r
      'uBursts',\r
      'uBurstWidth'\r
    ]);\r
\r
    const vao = gl.createVertexArray();\r
    const buffer = gl.createBuffer();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    gl.bindVertexArray(null);\r
\r
    const floatMask = !!gl.getExtension('EXT_color_buffer_float');\r
    const imageTexture = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, imageTexture);\r
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
\r
    const createMask = (width, height) => {\r
      const texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      if (floatMask) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.HALF_FLOAT, null);\r
      else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
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
      return { texture, framebuffer, width, height };\r
    };\r
    const destroyMask = target => {\r
      gl.deleteFramebuffer(target.framebuffer);\r
      gl.deleteTexture(target.texture);\r
    };\r
    let masks = [createMask(2, 2), createMask(2, 2)];\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const colorCache = new Map();\r
    const bursts = [];\r
    const burstData = new Float32Array(MAX_BURSTS * 4);\r
    const pointer = { x: 0, y: 0, inside: false, fresh: true, placed: false };\r
    const brush = { x: 0, y: 0, px: 0, py: 0 };\r
    const state = {\r
      width: 1,\r
      height: 1,\r
      dpr: 1,\r
      image: null,\r
      matte: [0, 0, 0],\r
      key: 0,\r
      introStart: 0,\r
      presence: 0,\r
      drift: 0,\r
      trailUntil: 0\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let alive = true;\r
\r
    const toRgb = value => {\r
      if (colorCache.has(value)) return colorCache.get(value);\r
      let rgb = [0, 0, 0];\r
      if (probe && value) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#000000';\r
        probe.fillStyle = /^[0-9a-f]{3,8}$/i.test(value) ? \`#\${value}\` : value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      colorCache.set(value, rgb);\r
      return rgb;\r
    };\r
\r
    const frameRect = s => {\r
      const { image, width, height } = state;\r
      if (!image) return [0, 0, width, height];\r
      const scale = (s.fit === 'cover' ? Math.max : Math.min)(width / image.naturalWidth, height / image.naturalHeight);\r
      const w = image.naturalWidth * scale;\r
      const h = image.naturalHeight * scale;\r
      return [(width - w) / 2, (height - h) / 2, w, h];\r
    };\r
\r
    const resize = () => {\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const dpr = Math.min(window.devicePixelRatio || 1, 2);\r
      state.width = width;\r
      state.height = height;\r
      state.dpr = dpr;\r
      canvas.width = Math.max(1, Math.round(width * dpr));\r
      canvas.height = Math.max(1, Math.round(height * dpr));\r
      const mw = Math.max(2, Math.round(width * MASK_SCALE));\r
      const mh = Math.max(2, Math.round(height * MASK_SCALE));\r
      if (mw !== masks[0].width || mh !== masks[0].height) {\r
        masks.forEach(destroyMask);\r
        masks = [createMask(mw, mh), createMask(mw, mh)];\r
      }\r
      if (!pointer.placed) {\r
        pointer.x = width / 2;\r
        pointer.y = height / 2;\r
      }\r
      wake();\r
    };\r
\r
    const drawMask = (s, dt) => {\r
      const minimum = floatMask ? 0 : 1.5 / 255;\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, masks[1].framebuffer);\r
      gl.viewport(0, 0, masks[1].width, masks[1].height);\r
      gl.useProgram(maskProgram);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, masks[0].texture);\r
      gl.uniform1i(maskUniforms.uPrevious, 0);\r
      gl.uniform2f(maskUniforms.uTexture, masks[1].width, masks[1].height);\r
      gl.uniform2f(maskUniforms.uView, state.width, state.height);\r
      gl.uniform2f(maskUniforms.uFrom, brush.px, brush.py);\r
      gl.uniform2f(maskUniforms.uTo, brush.x, brush.y);\r
      gl.uniform1f(maskUniforms.uRadius, s.revealRadius * (0.45 + 0.55 * state.presence));\r
      gl.uniform1f(maskUniforms.uSoftness, s.softness);\r
      gl.uniform1f(maskUniforms.uStrength, state.presence);\r
      gl.uniform1f(maskUniforms.uFade, Math.max(s.linger > 0 ? dt / s.linger : 1, minimum));\r
      gl.bindVertexArray(vao);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      masks.reverse();\r
    };\r
\r
    const drawView = (s, now) => {\r
      const [fx, fy, fw, fh] = frameRect(s);\r
      const image = state.image;\r
      const intro = !image ? 0 : !s.intro || reduce ? 1 : Math.min(1, (now - state.introStart) / 1000 / INTRO_SECONDS);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(viewProgram);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, imageTexture);\r
      gl.uniform1i(viewUniforms.uImage, 0);\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.bindTexture(gl.TEXTURE_2D, masks[0].texture);\r
      gl.uniform1i(viewUniforms.uMask, 1);\r
      gl.uniform2f(viewUniforms.uResolution, canvas.width, canvas.height);\r
      gl.uniform2f(viewUniforms.uView, state.width, state.height);\r
      gl.uniform1f(viewUniforms.uDpr, canvas.width / state.width);\r
      gl.uniform4f(viewUniforms.uFrame, fx, fy, fw, fh);\r
      gl.uniform1f(viewUniforms.uTexels, image ? image.naturalWidth / fw : 1);\r
      gl.uniform1f(viewUniforms.uMode, s.mode);\r
      gl.uniform1f(viewUniforms.uShape, s.shape);\r
      gl.uniform1f(viewUniforms.uCell, s.cellSize);\r
      gl.uniform1f(viewUniforms.uAngle, (s.angle * Math.PI) / 180);\r
      gl.uniform1f(viewUniforms.uScale, s.dotScale);\r
      gl.uniform3fv(viewUniforms.uInk, toRgb(s.inkColor));\r
      gl.uniform3fv(viewUniforms.uAccent, toRgb(s.accentColor));\r
      gl.uniform3fv(viewUniforms.uPaper, toRgb(s.paperColor));\r
      gl.uniform1f(viewUniforms.uContrast, s.contrast);\r
      gl.uniform1f(viewUniforms.uBrightness, s.brightness);\r
      gl.uniform1f(viewUniforms.uInvert, s.invert ? 1 : 0);\r
      gl.uniform1f(viewUniforms.uRough, s.roughness);\r
      gl.uniform1f(viewUniforms.uShift, s.misregistration * s.cellSize * 0.35);\r
      gl.uniform3fv(viewUniforms.uMatte, state.matte);\r
      gl.uniform1f(viewUniforms.uKey, state.key);\r
      gl.uniform1f(viewUniforms.uReverse, s.reverse ? 1 : 0);\r
      gl.uniform1f(viewUniforms.uIntro, 1 - (1 - intro) * (1 - intro));\r
      gl.uniform4fv(viewUniforms.uBursts, burstData);\r
      gl.uniform1f(viewUniforms.uBurstWidth, Math.max(60, s.revealRadius * 0.9));\r
      gl.bindVertexArray(vao);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindVertexArray(null);\r
      return intro;\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!alive || !visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, Math.max(0, (now - last) / 1000)) : 1 / 60;\r
      last = now;\r
\r
      const wandering = s.wander && !reduce;\r
      let targetX = pointer.x;\r
      let targetY = pointer.y;\r
      if (!pointer.inside && wandering) {\r
        state.drift = Math.min(1, state.drift + dt / 1.2);\r
        const [wx, wy] = wanderAt(now / 1000, state.width, state.height);\r
        const k = state.drift * state.drift * (3 - 2 * state.drift);\r
        targetX += (wx - targetX) * k;\r
        targetY += (wy - targetY) * k;\r
      } else {\r
        state.drift = 0;\r
      }\r
      const engaged = pointer.inside || wandering;\r
      state.presence += ((engaged ? 1 : 0) - state.presence) * (1 - Math.exp(-dt / 0.16));\r
      if (pointer.fresh) {\r
        brush.x = brush.px = targetX;\r
        brush.y = brush.py = targetY;\r
        pointer.fresh = false;\r
      } else {\r
        const follow = 1 - Math.exp(-dt / 0.035);\r
        brush.x += (targetX - brush.x) * follow;\r
        brush.y += (targetY - brush.y) * follow;\r
      }\r
\r
      burstData.fill(0);\r
      for (let i = bursts.length - 1; i >= 0; i--) {\r
        if ((now - bursts[i].start) / 1000 >= BURST_SECONDS) bursts.splice(i, 1);\r
      }\r
      bursts.forEach((b, i) => {\r
        const k = Math.max(0, (now - b.start) / 1000 / BURST_SECONDS);\r
        const reach = Math.hypot(Math.max(b.x, state.width - b.x), Math.max(b.y, state.height - b.y)) + 80;\r
        burstData[i * 4] = b.x;\r
        burstData[i * 4 + 1] = b.y;\r
        burstData[i * 4 + 2] = reach * Math.sin((k * Math.PI) / 2);\r
        burstData[i * 4 + 3] = 1 - k * k * k;\r
      });\r
\r
      if (state.presence > 0.002) state.trailUntil = now + s.linger * 1000 + 200;\r
      drawMask(s, dt);\r
      brush.px = brush.x;\r
      brush.py = brush.y;\r
      const intro = drawView(s, now);\r
\r
      const busy =\r
        engaged || state.presence > 0.002 || bursts.length > 0 || now < state.trailUntil || (state.image && intro < 1);\r
      if (busy) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!raf && alive && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const image = new Image();\r
    image.crossOrigin = 'anonymous';\r
    image.decoding = 'async';\r
    image.onload = () => {\r
      if (!alive) return;\r
      gl.bindTexture(gl.TEXTURE_2D, imageTexture);\r
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);\r
      gl.generateMipmap(gl.TEXTURE_2D);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);\r
      const sampler = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
      if (sampler) {\r
        try {\r
          const edge = measureEdge(sampler, image);\r
          state.matte = edge.matte;\r
          state.key = edge.plain ? 1 : 0;\r
        } catch {\r
          state.key = 0;\r
        }\r
      }\r
      state.image = image;\r
      state.introStart = performance.now();\r
      wake();\r
    };\r
    image.src = src;\r
\r
    const locatePointer = event => {\r
      const rect = container.getBoundingClientRect();\r
      pointer.x = event.clientX - rect.left;\r
      pointer.y = event.clientY - rect.top;\r
      pointer.placed = true;\r
    };\r
    const onMove = event => {\r
      locatePointer(event);\r
      if (!pointer.inside) {\r
        pointer.inside = true;\r
        pointer.fresh = true;\r
      }\r
      wake();\r
    };\r
    const onLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
    const onDown = event => {\r
      onMove(event);\r
      if (!settingsRef.current.clickBurst || (event.pointerType === 'mouse' && event.button !== 0)) return;\r
      bursts.push({ x: pointer.x, y: pointer.y, start: performance.now() });\r
      if (bursts.length > MAX_BURSTS) bursts.shift();\r
    };\r
    const onVisibility = () => {\r
      last = 0;\r
      wake();\r
    };\r
\r
    container.addEventListener('pointermove', onMove, { passive: true });\r
    container.addEventListener('pointerenter', onMove, { passive: true });\r
    container.addEventListener('pointerdown', onDown, { passive: true });\r
    container.addEventListener('pointerleave', onLeave, { passive: true });\r
    container.addEventListener('pointercancel', onLeave, { passive: true });\r
    document.addEventListener('visibilitychange', onVisibility);\r
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
    resize();\r
\r
    wakeRef.current = () => {\r
      if (!raf && alive && visible) {\r
        drawView(settingsRef.current, performance.now());\r
        wake();\r
      }\r
    };\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      image.onload = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      container.removeEventListener('pointermove', onMove);\r
      container.removeEventListener('pointerenter', onMove);\r
      container.removeEventListener('pointerdown', onDown);\r
      container.removeEventListener('pointerleave', onLeave);\r
      container.removeEventListener('pointercancel', onLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      masks.forEach(destroyMask);\r
      gl.deleteTexture(imageTexture);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(maskProgram);\r
      gl.deleteProgram(viewProgram);\r
    };\r
  }, [src]);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div ref={containerRef} className={\`halftone-reveal\${className ? \` \${className}\` : ''}\`} style={style}>\r
      <canvas ref={canvasRef} className="halftone-reveal-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default HalftoneReveal;\r
`,n=`.halftone-reveal {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.halftone-reveal-canvas {\r
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
const DEFAULT_SRC = 'https://images.unsplash.com/photo-1693250707557-a846a014b321?q=80&w=1400&auto=format&fit=crop';\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const MASK = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uPrevious;\r
uniform vec2 uTexture;\r
uniform vec2 uView;\r
uniform vec2 uFrom;\r
uniform vec2 uTo;\r
uniform float uRadius;\r
uniform float uSoftness;\r
uniform float uStrength;\r
uniform float uFade;\r
out vec4 outColor;\r
\r
float segment(vec2 p, vec2 a, vec2 b) {\r
  vec2 ab = b - a;\r
  float h = clamp(dot(p - a, ab) / max(dot(ab, ab), 0.0001), 0.0, 1.0);\r
  return length(p - a - ab * h);\r
}\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uTexture;\r
  vec2 p = vec2(uv.x, 1.0 - uv.y) * uView;\r
  float trail = max(texture(uPrevious, uv).r - uFade, 0.0);\r
  float band = max(uRadius * uSoftness, 1.0);\r
  float brush = clamp((uRadius - segment(p, uFrom, uTo)) / band, 0.0, 1.0);\r
  brush = brush * brush * (3.0 - 2.0 * brush);\r
  outColor = vec4(max(trail, brush * uStrength), 0.0, 0.0, 1.0);\r
}\`;\r
\r
const VIEW = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uImage;\r
uniform sampler2D uMask;\r
uniform vec2 uResolution;\r
uniform vec2 uView;\r
uniform float uDpr;\r
uniform vec4 uFrame;\r
uniform float uTexels;\r
uniform float uMode;\r
uniform float uShape;\r
uniform float uCell;\r
uniform float uAngle;\r
uniform float uScale;\r
uniform vec3 uInk;\r
uniform vec3 uAccent;\r
uniform vec3 uPaper;\r
uniform float uContrast;\r
uniform float uBrightness;\r
uniform float uInvert;\r
uniform float uRough;\r
uniform float uShift;\r
uniform vec3 uMatte;\r
uniform float uKey;\r
uniform float uReverse;\r
uniform float uIntro;\r
uniform vec4 uBursts[4];\r
uniform float uBurstWidth;\r
out vec4 outColor;\r
\r
const vec3 LUMA = vec3(0.2126, 0.7152, 0.0722);\r
const vec3 CYAN = vec3(0.0, 0.64, 0.93);\r
const vec3 MAGENTA = vec3(0.92, 0.07, 0.56);\r
const vec3 YELLOW = vec3(1.0, 0.91, 0.0);\r
const vec3 KEY = vec3(0.11, 0.1, 0.12);\r
const vec3 RED = vec3(1.0, 0.16, 0.12);\r
const vec3 GREEN = vec3(0.12, 1.0, 0.3);\r
const vec3 BLUE = vec3(0.16, 0.32, 1.0);\r
\r
mat2 rotate(float a) {\r
  float c = cos(a);\r
  float s = sin(a);\r
  return mat2(c, -s, s, c);\r
}\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
float noise(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = fract(p);\r
  f = f * f * (3.0 - 2.0 * f);\r
  float a = hash(i);\r
  float b = hash(i + vec2(1.0, 0.0));\r
  float c = hash(i + vec2(0.0, 1.0));\r
  float d = hash(i + vec2(1.0, 1.0));\r
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);\r
}\r
\r
vec4 photo(vec2 p, float lod, float margin) {\r
  vec2 uv = (p - uFrame.xy) / uFrame.zw;\r
  vec4 c = textureLod(uImage, clamp(uv, 0.0, 1.0), lod);\r
  vec2 slack = margin * uCell / uFrame.zw;\r
  vec2 inside = step(-slack, uv) * step(uv, 1.0 + slack);\r
  float keep = inside.x * inside.y * c.a;\r
  keep *= mix(1.0, smoothstep(0.05, 0.2, distance(c.rgb, uMatte)), uKey);\r
  return vec4(c.rgb, keep);\r
}\r
\r
float grade(float v) {\r
  v = clamp((v - 0.5) * uContrast + 0.5 + uBrightness, 0.0, 1.0);\r
  return mix(v, 1.0 - v, uInvert);\r
}\r
\r
vec3 gradeColor(vec3 c) {\r
  return vec3(grade(c.r), grade(c.g), grade(c.b));\r
}\r
\r
vec3 tone(vec3 c) {\r
  return pow(max(c, 0.0), vec3(1.5));\r
}\r
\r
float press(float t, float alpha) {\r
  return (0.05 + clamp(t, 0.0, 1.0) * 0.89) * alpha;\r
}\r
\r
float plate(float t, float alpha) {\r
  return (0.02 + clamp(t, 0.0, 1.0) * 0.92) * alpha;\r
}\r
\r
vec3 decode(vec3 c) {\r
  return pow(max(c, 0.0), vec3(2.2));\r
}\r
\r
vec4 separate(vec3 color) {\r
  vec3 target = clamp(tone(gradeColor(color)) / max(tone(uPaper), vec3(0.02)), 0.0, 1.0);\r
  vec3 absorbC = 1.0 - decode(CYAN);\r
  vec3 absorbM = 1.0 - decode(MAGENTA);\r
  vec3 absorbY = 1.0 - decode(YELLOW);\r
  float bright = pow(max(max(target.r, target.g), target.b), 0.4545);\r
  float key = pow(clamp(1.0 - bright / 0.62, 0.0, 1.0), 1.4) * 0.95;\r
  vec3 rest = clamp(target / max(1.0 - key * (1.0 - decode(KEY)), vec3(0.03)), 0.0, 1.0);\r
  vec3 a = 1.0 - rest;\r
  for (int i = 0; i < 3; i++) {\r
    vec3 tc = 1.0 - a.x * absorbC;\r
    vec3 tm = 1.0 - a.y * absorbM;\r
    vec3 ty = 1.0 - a.z * absorbY;\r
    mat3 slope = mat3(-absorbC * tm * ty, -absorbM * tc * ty, -absorbY * tc * tm);\r
    if (abs(determinant(slope)) < 1e-6) break;\r
    a = clamp(a - inverse(slope) * (tc * tm * ty - rest), 0.0, 1.0);\r
  }\r
  return vec4(a, key);\r
}\r
\r
vec3 emit(vec3 color) {\r
  vec3 target = max(tone(gradeColor(color)) - tone(uPaper), 0.0);\r
  mat3 lights = mat3(decode(RED), decode(GREEN), decode(BLUE));\r
  return clamp(inverse(lights) * target, 0.0, 1.0);\r
}\r
\r
float metric(vec2 f) {\r
  if (uShape < 0.5) return length(f);\r
  if (uShape < 1.5) return length(f * vec2(0.8, 1.15));\r
  if (uShape < 2.5) return max(abs(f.x), abs(f.y));\r
  if (uShape < 3.5) return abs(f.x) + abs(f.y);\r
  if (uShape < 4.5) return abs(f.y);\r
  return min(abs(f.x), abs(f.y));\r
}\r
\r
float reach(float t) {\r
  t = clamp(t, 0.0, 1.0);\r
  if (uShape < 0.5) return t < 0.785 ? sqrt(t / 3.14159) : mix(0.5, 0.72, (t - 0.785) / 0.215);\r
  if (uShape < 1.5) return t < 0.7 ? sqrt(t * 0.92 / 3.14159) : mix(0.4497, 0.72, (t - 0.7) / 0.3);\r
  if (uShape < 2.5) return 0.5 * sqrt(t) + 0.02 * t;\r
  if (uShape < 3.5) return t < 0.5 ? sqrt(t * 0.5) : 1.0 - sqrt((1.0 - t) * 0.5);\r
  if (uShape < 4.5) return 0.52 * t;\r
  return (1.0 - sqrt(1.0 - t)) * 0.5 + 0.02 * t;\r
}\r
\r
vec2 center(vec2 p, float angle) {\r
  vec2 q = rotate(angle) * p / uCell;\r
  vec2 c = floor(q) + 0.5;\r
  if (uShape > 3.5 && uShape < 4.5) c.x = q.x;\r
  return rotate(-angle) * c * uCell;\r
}\r
\r
float dots(vec2 p, float angle, float t, float seed, float grow) {\r
  vec2 q = rotate(angle) * p / uCell;\r
  float d = metric(fract(q) - 0.5);\r
  d += (noise(p * 0.42 + seed * 17.0) - 0.5) * uRough * 0.18;\r
  float r = reach(t) * uScale * grow;\r
  float w = max(fwidth(d), 0.0001) * 0.75;\r
  return smoothstep(r + w, r - w, d) * clamp(r / (w * 2.0), 0.0, 1.0);\r
}\r
\r
float coverage(vec4 image) {\r
  float shade = dot(tone(gradeColor(image.rgb)), LUMA);\r
  float paper = dot(tone(uPaper), LUMA);\r
  float span = dot(tone(uInk), LUMA) - paper;\r
  float t = abs(span) < 0.02 ? 1.0 - shade : (shade - paper) / span;\r
  return press(t, image.a);\r
}\r
\r
float burst(vec2 p) {\r
  float value = 0.0;\r
  for (int i = 0; i < 4; i++) {\r
    vec4 b = uBursts[i];\r
    if (b.w <= 0.0) continue;\r
    float offset = distance(p, b.xy) - b.z;\r
    float edge = offset > 0.0 ? offset / (uBurstWidth * 0.35) : -offset / uBurstWidth;\r
    value = max(value, clamp(1.0 - edge, 0.0, 1.0) * b.w);\r
  }\r
  return value;\r
}\r
\r
void main() {\r
  vec2 p = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y) / uDpr;\r
  float lod = log2(max(uCell * uTexels, 1.0));\r
  float base = uAngle;\r
  vec2 drift = vec2(uShift, uShift * -0.6);\r
\r
  vec2 field = p / max(uView.x, uView.y) - uView / max(uView.x, uView.y) * 0.5;\r
  float delay = length(field) * 1.15 + hash(floor(p / uCell)) * 0.06;\r
  float grow = smoothstep(0.0, 1.0, clamp((uIntro * 1.7 - delay) / 0.45, 0.0, 1.0));\r
\r
  vec3 print = uPaper;\r
  if (uMode < 0.5) {\r
    float k = dots(p, base, coverage(photo(center(p, base), lod, 0.5)), 0.0, grow);\r
    print = mix(uPaper, uInk, k);\r
  } else if (uMode < 1.5) {\r
    float second = base + 0.5236;\r
    float tA = coverage(photo(center(p, base), lod, 0.5));\r
    float tB = coverage(photo(center(p + drift, second) - drift, lod, 0.5));\r
    float kA = dots(p, base, pow(tA, 1.9), 0.0, grow);\r
    float kB = dots(p + drift, second, clamp(tB * 1.3, 0.0, 1.0) * 0.8, 1.0, grow);\r
    if (dot(uPaper, LUMA) > 0.5) {\r
      print = uPaper * mix(vec3(1.0), uAccent, kB) * mix(vec3(1.0), uInk, kA);\r
    } else {\r
      print = min(uPaper + uAccent * kB + uInk * kA, vec3(1.0));\r
    }\r
  } else if (dot(uPaper, LUMA) > 0.5) {\r
    float ac = base - 0.5236;\r
    float am = base + 0.5236;\r
    float ay = base - 0.7854;\r
    vec4 sc = photo(center(p + drift, ac) - drift, lod, 0.5);\r
    vec4 sm = photo(center(p - drift, am) + drift, lod, 0.5);\r
    vec4 sy = photo(center(p + drift.yx, ay) - drift.yx, lod, 0.5);\r
    vec4 sk = photo(center(p, base), lod, 0.5);\r
    float kc = sc.a > 0.0 ? dots(p + drift, ac, plate(separate(sc.rgb).x, sc.a), 1.0, grow) : 0.0;\r
    float km = sm.a > 0.0 ? dots(p - drift, am, plate(separate(sm.rgb).y, sm.a), 2.0, grow) : 0.0;\r
    float ky = sy.a > 0.0 ? dots(p + drift.yx, ay, plate(separate(sy.rgb).z, sy.a), 3.0, grow) : 0.0;\r
    float kk = sk.a > 0.0 ? dots(p, base, plate(separate(sk.rgb).w, sk.a), 4.0, grow) : 0.0;\r
    print = uPaper;\r
    print *= mix(vec3(1.0), CYAN, kc);\r
    print *= mix(vec3(1.0), MAGENTA, km);\r
    print *= mix(vec3(1.0), YELLOW, ky);\r
    print *= mix(vec3(1.0), KEY, kk);\r
  } else {\r
    float ar = base - 0.5236;\r
    float ag = base + 0.5236;\r
    vec4 sr = photo(center(p + drift, ar) - drift, lod, 0.5);\r
    vec4 sg = photo(center(p - drift, ag) + drift, lod, 0.5);\r
    vec4 sb = photo(center(p, base), lod, 0.5);\r
    float kr = dots(p + drift, ar, plate(emit(sr.rgb).x, sr.a), 1.0, grow);\r
    float kg = dots(p - drift, ag, plate(emit(sg.rgb).y, sg.a), 2.0, grow);\r
    float kb = dots(p, base, plate(emit(sb.rgb).z, sb.a), 3.0, grow);\r
    print = min(uPaper + RED * kr + GREEN * kg + BLUE * kb, vec3(1.0));\r
  }\r
\r
  vec2 maskUv = vec2(p.x / uView.x, 1.0 - p.y / uView.y);\r
  float shown = max(texture(uMask, maskUv).r, burst(p));\r
  shown = mix(shown, 1.0 - shown, uReverse);\r
  shown = shown * shown * (3.0 - 2.0 * shown);\r
  vec2 q = rotate(base) * p / uCell;\r
  float d = metric(fract(q) - 0.5);\r
  float r = reach(1.0) * 1.08 * shown;\r
  float w = max(fwidth(d), 0.0001) * 0.75;\r
  float k = smoothstep(r + w, r - w, d) * clamp(r / (w * 2.0), 0.0, 1.0);\r
  vec4 sharp = photo(p, 0.0, 0.0);\r
  vec3 real = mix(uPaper, sharp.rgb, sharp.a);\r
  outColor = vec4(mix(print, real, k), 1.0);\r
}\`;\r
\r
const MODES = { mono: 0, duotone: 1, color: 2 };\r
const SHAPES = { dot: 0, ellipse: 1, square: 2, diamond: 3, line: 4, cross: 5 };\r
const MAX_BURSTS = 4;\r
const BURST_SECONDS = 1.3;\r
const INTRO_SECONDS = 1.4;\r
const MASK_SCALE = 0.5;\r
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
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;\r
  gl.deleteProgram(program);\r
  return null;\r
};\r
\r
const locate = (gl, program, names) => {\r
  const result = {};\r
  for (const name of names) result[name] = gl.getUniformLocation(program, name);\r
  return result;\r
};\r
\r
const wanderAt = (t, w, h) => [\r
  w * (0.5 + 0.32 * Math.sin(t * 0.53) + 0.08 * Math.sin(t * 1.31 + 0.6)),\r
  h * (0.5 + 0.27 * Math.sin(t * 0.71 + 1.1) + 0.07 * Math.cos(t * 1.57))\r
];\r
\r
const measureEdge = (context, image) => {\r
  const size = 32;\r
  context.canvas.width = size;\r
  context.canvas.height = size;\r
  context.clearRect(0, 0, size, size);\r
  context.drawImage(image, 0, 0, size, size);\r
  const data = context.getImageData(0, 0, size, size).data;\r
  const sum = [0, 0, 0];\r
  const squares = [0, 0, 0];\r
  let count = 0;\r
  let clear = 0;\r
  for (let y = 0; y < size; y++) {\r
    for (let x = 0; x < size; x++) {\r
      if (x > 0 && y > 0 && x < size - 1 && y < size - 1) continue;\r
      const i = (y * size + x) * 4;\r
      if (data[i + 3] < 250) clear++;\r
      for (let c = 0; c < 3; c++) {\r
        const v = data[i + c] / 255;\r
        sum[c] += v;\r
        squares[c] += v * v;\r
      }\r
      count++;\r
    }\r
  }\r
  const matte = [sum[0] / count, sum[1] / count, sum[2] / count];\r
  const spread =\r
    matte.reduce((total, mean, c) => total + Math.sqrt(Math.max(0, squares[c] / count - mean * mean)), 0) / 3;\r
  return { matte, plain: clear < count * 0.5 && spread < 0.06 };\r
};\r
\r
const HalftoneReveal = ({\r
  src = DEFAULT_SRC,\r
  fit = 'cover',\r
  mode = 'mono',\r
  shape = 'dot',\r
  cellSize = 6,\r
  angle = 45,\r
  dotScale = 1,\r
  inkColor = '#120f17',\r
  accentColor = '#ff4f2a',\r
  paperColor = '#ffffff',\r
  contrast = 1.1,\r
  brightness = 0,\r
  invert = false,\r
  roughness = 0,\r
  misregistration = 0,\r
  revealRadius = 160,\r
  softness = 0.6,\r
  linger = 1.2,\r
  reverse = false,\r
  wander = false,\r
  clickBurst = true,\r
  intro = true,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settings = {\r
    fit,\r
    mode: MODES[mode] ?? 0,\r
    shape: SHAPES[shape] ?? 0,\r
    cellSize: clamp(cellSize, 2, 80),\r
    angle,\r
    dotScale: clamp(dotScale, 0.2, 2),\r
    inkColor: String(inkColor),\r
    accentColor: String(accentColor),\r
    paperColor: String(paperColor),\r
    contrast,\r
    brightness,\r
    invert,\r
    roughness: clamp(roughness, 0, 1),\r
    misregistration: clamp(misregistration, 0, 1),\r
    revealRadius: Math.max(0, revealRadius),\r
    softness: clamp(softness, 0, 1),\r
    linger: Math.max(0, linger),\r
    reverse,\r
    wander,\r
    clickBurst,\r
    intro\r
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
      stencil: false,\r
      preserveDrawingBuffer: false\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const maskProgram = link(gl, MASK);\r
    const viewProgram = link(gl, VIEW);\r
    if (!maskProgram || !viewProgram) return undefined;\r
    const maskUniforms = locate(gl, maskProgram, [\r
      'uPrevious',\r
      'uTexture',\r
      'uView',\r
      'uFrom',\r
      'uTo',\r
      'uRadius',\r
      'uSoftness',\r
      'uStrength',\r
      'uFade'\r
    ]);\r
    const viewUniforms = locate(gl, viewProgram, [\r
      'uImage',\r
      'uMask',\r
      'uResolution',\r
      'uView',\r
      'uDpr',\r
      'uFrame',\r
      'uTexels',\r
      'uMode',\r
      'uShape',\r
      'uCell',\r
      'uAngle',\r
      'uScale',\r
      'uInk',\r
      'uAccent',\r
      'uPaper',\r
      'uContrast',\r
      'uBrightness',\r
      'uInvert',\r
      'uRough',\r
      'uShift',\r
      'uMatte',\r
      'uKey',\r
      'uReverse',\r
      'uIntro',\r
      'uBursts',\r
      'uBurstWidth'\r
    ]);\r
\r
    const vao = gl.createVertexArray();\r
    const buffer = gl.createBuffer();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    gl.bindVertexArray(null);\r
\r
    const floatMask = !!gl.getExtension('EXT_color_buffer_float');\r
    const imageTexture = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, imageTexture);\r
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
\r
    const createMask = (width, height) => {\r
      const texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      if (floatMask) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.HALF_FLOAT, null);\r
      else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
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
      return { texture, framebuffer, width, height };\r
    };\r
    const destroyMask = target => {\r
      gl.deleteFramebuffer(target.framebuffer);\r
      gl.deleteTexture(target.texture);\r
    };\r
    let masks = [createMask(2, 2), createMask(2, 2)];\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const colorCache = new Map();\r
    const bursts = [];\r
    const burstData = new Float32Array(MAX_BURSTS * 4);\r
    const pointer = { x: 0, y: 0, inside: false, fresh: true, placed: false };\r
    const brush = { x: 0, y: 0, px: 0, py: 0 };\r
    const state = {\r
      width: 1,\r
      height: 1,\r
      dpr: 1,\r
      image: null,\r
      matte: [0, 0, 0],\r
      key: 0,\r
      introStart: 0,\r
      presence: 0,\r
      drift: 0,\r
      trailUntil: 0\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let alive = true;\r
\r
    const toRgb = value => {\r
      if (colorCache.has(value)) return colorCache.get(value);\r
      let rgb = [0, 0, 0];\r
      if (probe && value) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#000000';\r
        probe.fillStyle = /^[0-9a-f]{3,8}$/i.test(value) ? \`#\${value}\` : value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      colorCache.set(value, rgb);\r
      return rgb;\r
    };\r
\r
    const frameRect = s => {\r
      const { image, width, height } = state;\r
      if (!image) return [0, 0, width, height];\r
      const scale = (s.fit === 'cover' ? Math.max : Math.min)(width / image.naturalWidth, height / image.naturalHeight);\r
      const w = image.naturalWidth * scale;\r
      const h = image.naturalHeight * scale;\r
      return [(width - w) / 2, (height - h) / 2, w, h];\r
    };\r
\r
    const resize = () => {\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const dpr = Math.min(window.devicePixelRatio || 1, 2);\r
      state.width = width;\r
      state.height = height;\r
      state.dpr = dpr;\r
      canvas.width = Math.max(1, Math.round(width * dpr));\r
      canvas.height = Math.max(1, Math.round(height * dpr));\r
      const mw = Math.max(2, Math.round(width * MASK_SCALE));\r
      const mh = Math.max(2, Math.round(height * MASK_SCALE));\r
      if (mw !== masks[0].width || mh !== masks[0].height) {\r
        masks.forEach(destroyMask);\r
        masks = [createMask(mw, mh), createMask(mw, mh)];\r
      }\r
      if (!pointer.placed) {\r
        pointer.x = width / 2;\r
        pointer.y = height / 2;\r
      }\r
      wake();\r
    };\r
\r
    const drawMask = (s, dt) => {\r
      const minimum = floatMask ? 0 : 1.5 / 255;\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, masks[1].framebuffer);\r
      gl.viewport(0, 0, masks[1].width, masks[1].height);\r
      gl.useProgram(maskProgram);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, masks[0].texture);\r
      gl.uniform1i(maskUniforms.uPrevious, 0);\r
      gl.uniform2f(maskUniforms.uTexture, masks[1].width, masks[1].height);\r
      gl.uniform2f(maskUniforms.uView, state.width, state.height);\r
      gl.uniform2f(maskUniforms.uFrom, brush.px, brush.py);\r
      gl.uniform2f(maskUniforms.uTo, brush.x, brush.y);\r
      gl.uniform1f(maskUniforms.uRadius, s.revealRadius * (0.45 + 0.55 * state.presence));\r
      gl.uniform1f(maskUniforms.uSoftness, s.softness);\r
      gl.uniform1f(maskUniforms.uStrength, state.presence);\r
      gl.uniform1f(maskUniforms.uFade, Math.max(s.linger > 0 ? dt / s.linger : 1, minimum));\r
      gl.bindVertexArray(vao);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      masks.reverse();\r
    };\r
\r
    const drawView = (s, now) => {\r
      const [fx, fy, fw, fh] = frameRect(s);\r
      const image = state.image;\r
      const intro = !image ? 0 : !s.intro || reduce ? 1 : Math.min(1, (now - state.introStart) / 1000 / INTRO_SECONDS);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(viewProgram);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, imageTexture);\r
      gl.uniform1i(viewUniforms.uImage, 0);\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.bindTexture(gl.TEXTURE_2D, masks[0].texture);\r
      gl.uniform1i(viewUniforms.uMask, 1);\r
      gl.uniform2f(viewUniforms.uResolution, canvas.width, canvas.height);\r
      gl.uniform2f(viewUniforms.uView, state.width, state.height);\r
      gl.uniform1f(viewUniforms.uDpr, canvas.width / state.width);\r
      gl.uniform4f(viewUniforms.uFrame, fx, fy, fw, fh);\r
      gl.uniform1f(viewUniforms.uTexels, image ? image.naturalWidth / fw : 1);\r
      gl.uniform1f(viewUniforms.uMode, s.mode);\r
      gl.uniform1f(viewUniforms.uShape, s.shape);\r
      gl.uniform1f(viewUniforms.uCell, s.cellSize);\r
      gl.uniform1f(viewUniforms.uAngle, (s.angle * Math.PI) / 180);\r
      gl.uniform1f(viewUniforms.uScale, s.dotScale);\r
      gl.uniform3fv(viewUniforms.uInk, toRgb(s.inkColor));\r
      gl.uniform3fv(viewUniforms.uAccent, toRgb(s.accentColor));\r
      gl.uniform3fv(viewUniforms.uPaper, toRgb(s.paperColor));\r
      gl.uniform1f(viewUniforms.uContrast, s.contrast);\r
      gl.uniform1f(viewUniforms.uBrightness, s.brightness);\r
      gl.uniform1f(viewUniforms.uInvert, s.invert ? 1 : 0);\r
      gl.uniform1f(viewUniforms.uRough, s.roughness);\r
      gl.uniform1f(viewUniforms.uShift, s.misregistration * s.cellSize * 0.35);\r
      gl.uniform3fv(viewUniforms.uMatte, state.matte);\r
      gl.uniform1f(viewUniforms.uKey, state.key);\r
      gl.uniform1f(viewUniforms.uReverse, s.reverse ? 1 : 0);\r
      gl.uniform1f(viewUniforms.uIntro, 1 - (1 - intro) * (1 - intro));\r
      gl.uniform4fv(viewUniforms.uBursts, burstData);\r
      gl.uniform1f(viewUniforms.uBurstWidth, Math.max(60, s.revealRadius * 0.9));\r
      gl.bindVertexArray(vao);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindVertexArray(null);\r
      return intro;\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!alive || !visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, Math.max(0, (now - last) / 1000)) : 1 / 60;\r
      last = now;\r
\r
      const wandering = s.wander && !reduce;\r
      let targetX = pointer.x;\r
      let targetY = pointer.y;\r
      if (!pointer.inside && wandering) {\r
        state.drift = Math.min(1, state.drift + dt / 1.2);\r
        const [wx, wy] = wanderAt(now / 1000, state.width, state.height);\r
        const k = state.drift * state.drift * (3 - 2 * state.drift);\r
        targetX += (wx - targetX) * k;\r
        targetY += (wy - targetY) * k;\r
      } else {\r
        state.drift = 0;\r
      }\r
      const engaged = pointer.inside || wandering;\r
      state.presence += ((engaged ? 1 : 0) - state.presence) * (1 - Math.exp(-dt / 0.16));\r
      if (pointer.fresh) {\r
        brush.x = brush.px = targetX;\r
        brush.y = brush.py = targetY;\r
        pointer.fresh = false;\r
      } else {\r
        const follow = 1 - Math.exp(-dt / 0.035);\r
        brush.x += (targetX - brush.x) * follow;\r
        brush.y += (targetY - brush.y) * follow;\r
      }\r
\r
      burstData.fill(0);\r
      for (let i = bursts.length - 1; i >= 0; i--) {\r
        if ((now - bursts[i].start) / 1000 >= BURST_SECONDS) bursts.splice(i, 1);\r
      }\r
      bursts.forEach((b, i) => {\r
        const k = Math.max(0, (now - b.start) / 1000 / BURST_SECONDS);\r
        const reach = Math.hypot(Math.max(b.x, state.width - b.x), Math.max(b.y, state.height - b.y)) + 80;\r
        burstData[i * 4] = b.x;\r
        burstData[i * 4 + 1] = b.y;\r
        burstData[i * 4 + 2] = reach * Math.sin((k * Math.PI) / 2);\r
        burstData[i * 4 + 3] = 1 - k * k * k;\r
      });\r
\r
      if (state.presence > 0.002) state.trailUntil = now + s.linger * 1000 + 200;\r
      drawMask(s, dt);\r
      brush.px = brush.x;\r
      brush.py = brush.y;\r
      const intro = drawView(s, now);\r
\r
      const busy =\r
        engaged || state.presence > 0.002 || bursts.length > 0 || now < state.trailUntil || (state.image && intro < 1);\r
      if (busy) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!raf && alive && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const image = new Image();\r
    image.crossOrigin = 'anonymous';\r
    image.decoding = 'async';\r
    image.onload = () => {\r
      if (!alive) return;\r
      gl.bindTexture(gl.TEXTURE_2D, imageTexture);\r
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);\r
      gl.generateMipmap(gl.TEXTURE_2D);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);\r
      const sampler = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
      if (sampler) {\r
        try {\r
          const edge = measureEdge(sampler, image);\r
          state.matte = edge.matte;\r
          state.key = edge.plain ? 1 : 0;\r
        } catch {\r
          state.key = 0;\r
        }\r
      }\r
      state.image = image;\r
      state.introStart = performance.now();\r
      wake();\r
    };\r
    image.src = src;\r
\r
    const locatePointer = event => {\r
      const rect = container.getBoundingClientRect();\r
      pointer.x = event.clientX - rect.left;\r
      pointer.y = event.clientY - rect.top;\r
      pointer.placed = true;\r
    };\r
    const onMove = event => {\r
      locatePointer(event);\r
      if (!pointer.inside) {\r
        pointer.inside = true;\r
        pointer.fresh = true;\r
      }\r
      wake();\r
    };\r
    const onLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
    const onDown = event => {\r
      onMove(event);\r
      if (!settingsRef.current.clickBurst || (event.pointerType === 'mouse' && event.button !== 0)) return;\r
      bursts.push({ x: pointer.x, y: pointer.y, start: performance.now() });\r
      if (bursts.length > MAX_BURSTS) bursts.shift();\r
    };\r
    const onVisibility = () => {\r
      last = 0;\r
      wake();\r
    };\r
\r
    container.addEventListener('pointermove', onMove, { passive: true });\r
    container.addEventListener('pointerenter', onMove, { passive: true });\r
    container.addEventListener('pointerdown', onDown, { passive: true });\r
    container.addEventListener('pointerleave', onLeave, { passive: true });\r
    container.addEventListener('pointercancel', onLeave, { passive: true });\r
    document.addEventListener('visibilitychange', onVisibility);\r
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
    resize();\r
\r
    wakeRef.current = () => {\r
      if (!raf && alive && visible) {\r
        drawView(settingsRef.current, performance.now());\r
        wake();\r
      }\r
    };\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      image.onload = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      container.removeEventListener('pointermove', onMove);\r
      container.removeEventListener('pointerenter', onMove);\r
      container.removeEventListener('pointerdown', onDown);\r
      container.removeEventListener('pointerleave', onLeave);\r
      container.removeEventListener('pointercancel', onLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      masks.forEach(destroyMask);\r
      gl.deleteTexture(imageTexture);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(maskProgram);\r
      gl.deleteProgram(viewProgram);\r
    };\r
  }, [src]);\r
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
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default HalftoneReveal;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties } from 'react';\r
\r
import './HalftoneReveal.css';\r
\r
const DEFAULT_SRC = 'https://images.unsplash.com/photo-1693250707557-a846a014b321?q=80&w=1400&auto=format&fit=crop';\r
\r
export type HalftoneRevealMode = 'mono' | 'duotone' | 'color';\r
\r
export type HalftoneRevealShape = 'dot' | 'ellipse' | 'square' | 'diamond' | 'line' | 'cross';\r
\r
export interface HalftoneRevealProps {\r
  src?: string;\r
  fit?: 'contain' | 'cover';\r
  mode?: HalftoneRevealMode;\r
  shape?: HalftoneRevealShape;\r
  cellSize?: number;\r
  angle?: number;\r
  dotScale?: number;\r
  inkColor?: string;\r
  accentColor?: string;\r
  paperColor?: string;\r
  contrast?: number;\r
  brightness?: number;\r
  invert?: boolean;\r
  roughness?: number;\r
  misregistration?: number;\r
  revealRadius?: number;\r
  softness?: number;\r
  linger?: number;\r
  reverse?: boolean;\r
  wander?: boolean;\r
  clickBurst?: boolean;\r
  intro?: boolean;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
type Settings = {\r
  fit: 'contain' | 'cover';\r
  mode: number;\r
  shape: number;\r
  cellSize: number;\r
  angle: number;\r
  dotScale: number;\r
  inkColor: string;\r
  accentColor: string;\r
  paperColor: string;\r
  contrast: number;\r
  brightness: number;\r
  invert: boolean;\r
  roughness: number;\r
  misregistration: number;\r
  revealRadius: number;\r
  softness: number;\r
  linger: number;\r
  reverse: boolean;\r
  wander: boolean;\r
  clickBurst: boolean;\r
  intro: boolean;\r
};\r
\r
type MaskTarget = { texture: WebGLTexture | null; framebuffer: WebGLFramebuffer | null; width: number; height: number };\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const MASK = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uPrevious;\r
uniform vec2 uTexture;\r
uniform vec2 uView;\r
uniform vec2 uFrom;\r
uniform vec2 uTo;\r
uniform float uRadius;\r
uniform float uSoftness;\r
uniform float uStrength;\r
uniform float uFade;\r
out vec4 outColor;\r
\r
float segment(vec2 p, vec2 a, vec2 b) {\r
  vec2 ab = b - a;\r
  float h = clamp(dot(p - a, ab) / max(dot(ab, ab), 0.0001), 0.0, 1.0);\r
  return length(p - a - ab * h);\r
}\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uTexture;\r
  vec2 p = vec2(uv.x, 1.0 - uv.y) * uView;\r
  float trail = max(texture(uPrevious, uv).r - uFade, 0.0);\r
  float band = max(uRadius * uSoftness, 1.0);\r
  float brush = clamp((uRadius - segment(p, uFrom, uTo)) / band, 0.0, 1.0);\r
  brush = brush * brush * (3.0 - 2.0 * brush);\r
  outColor = vec4(max(trail, brush * uStrength), 0.0, 0.0, 1.0);\r
}\`;\r
\r
const VIEW = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uImage;\r
uniform sampler2D uMask;\r
uniform vec2 uResolution;\r
uniform vec2 uView;\r
uniform float uDpr;\r
uniform vec4 uFrame;\r
uniform float uTexels;\r
uniform float uMode;\r
uniform float uShape;\r
uniform float uCell;\r
uniform float uAngle;\r
uniform float uScale;\r
uniform vec3 uInk;\r
uniform vec3 uAccent;\r
uniform vec3 uPaper;\r
uniform float uContrast;\r
uniform float uBrightness;\r
uniform float uInvert;\r
uniform float uRough;\r
uniform float uShift;\r
uniform vec3 uMatte;\r
uniform float uKey;\r
uniform float uReverse;\r
uniform float uIntro;\r
uniform vec4 uBursts[4];\r
uniform float uBurstWidth;\r
out vec4 outColor;\r
\r
const vec3 LUMA = vec3(0.2126, 0.7152, 0.0722);\r
const vec3 CYAN = vec3(0.0, 0.64, 0.93);\r
const vec3 MAGENTA = vec3(0.92, 0.07, 0.56);\r
const vec3 YELLOW = vec3(1.0, 0.91, 0.0);\r
const vec3 KEY = vec3(0.11, 0.1, 0.12);\r
const vec3 RED = vec3(1.0, 0.16, 0.12);\r
const vec3 GREEN = vec3(0.12, 1.0, 0.3);\r
const vec3 BLUE = vec3(0.16, 0.32, 1.0);\r
\r
mat2 rotate(float a) {\r
  float c = cos(a);\r
  float s = sin(a);\r
  return mat2(c, -s, s, c);\r
}\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
float noise(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = fract(p);\r
  f = f * f * (3.0 - 2.0 * f);\r
  float a = hash(i);\r
  float b = hash(i + vec2(1.0, 0.0));\r
  float c = hash(i + vec2(0.0, 1.0));\r
  float d = hash(i + vec2(1.0, 1.0));\r
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);\r
}\r
\r
vec4 photo(vec2 p, float lod, float margin) {\r
  vec2 uv = (p - uFrame.xy) / uFrame.zw;\r
  vec4 c = textureLod(uImage, clamp(uv, 0.0, 1.0), lod);\r
  vec2 slack = margin * uCell / uFrame.zw;\r
  vec2 inside = step(-slack, uv) * step(uv, 1.0 + slack);\r
  float keep = inside.x * inside.y * c.a;\r
  keep *= mix(1.0, smoothstep(0.05, 0.2, distance(c.rgb, uMatte)), uKey);\r
  return vec4(c.rgb, keep);\r
}\r
\r
float grade(float v) {\r
  v = clamp((v - 0.5) * uContrast + 0.5 + uBrightness, 0.0, 1.0);\r
  return mix(v, 1.0 - v, uInvert);\r
}\r
\r
vec3 gradeColor(vec3 c) {\r
  return vec3(grade(c.r), grade(c.g), grade(c.b));\r
}\r
\r
vec3 tone(vec3 c) {\r
  return pow(max(c, 0.0), vec3(1.5));\r
}\r
\r
float press(float t, float alpha) {\r
  return (0.05 + clamp(t, 0.0, 1.0) * 0.89) * alpha;\r
}\r
\r
float plate(float t, float alpha) {\r
  return (0.02 + clamp(t, 0.0, 1.0) * 0.92) * alpha;\r
}\r
\r
vec3 decode(vec3 c) {\r
  return pow(max(c, 0.0), vec3(2.2));\r
}\r
\r
vec4 separate(vec3 color) {\r
  vec3 target = clamp(tone(gradeColor(color)) / max(tone(uPaper), vec3(0.02)), 0.0, 1.0);\r
  vec3 absorbC = 1.0 - decode(CYAN);\r
  vec3 absorbM = 1.0 - decode(MAGENTA);\r
  vec3 absorbY = 1.0 - decode(YELLOW);\r
  float bright = pow(max(max(target.r, target.g), target.b), 0.4545);\r
  float key = pow(clamp(1.0 - bright / 0.62, 0.0, 1.0), 1.4) * 0.95;\r
  vec3 rest = clamp(target / max(1.0 - key * (1.0 - decode(KEY)), vec3(0.03)), 0.0, 1.0);\r
  vec3 a = 1.0 - rest;\r
  for (int i = 0; i < 3; i++) {\r
    vec3 tc = 1.0 - a.x * absorbC;\r
    vec3 tm = 1.0 - a.y * absorbM;\r
    vec3 ty = 1.0 - a.z * absorbY;\r
    mat3 slope = mat3(-absorbC * tm * ty, -absorbM * tc * ty, -absorbY * tc * tm);\r
    if (abs(determinant(slope)) < 1e-6) break;\r
    a = clamp(a - inverse(slope) * (tc * tm * ty - rest), 0.0, 1.0);\r
  }\r
  return vec4(a, key);\r
}\r
\r
vec3 emit(vec3 color) {\r
  vec3 target = max(tone(gradeColor(color)) - tone(uPaper), 0.0);\r
  mat3 lights = mat3(decode(RED), decode(GREEN), decode(BLUE));\r
  return clamp(inverse(lights) * target, 0.0, 1.0);\r
}\r
\r
float metric(vec2 f) {\r
  if (uShape < 0.5) return length(f);\r
  if (uShape < 1.5) return length(f * vec2(0.8, 1.15));\r
  if (uShape < 2.5) return max(abs(f.x), abs(f.y));\r
  if (uShape < 3.5) return abs(f.x) + abs(f.y);\r
  if (uShape < 4.5) return abs(f.y);\r
  return min(abs(f.x), abs(f.y));\r
}\r
\r
float reach(float t) {\r
  t = clamp(t, 0.0, 1.0);\r
  if (uShape < 0.5) return t < 0.785 ? sqrt(t / 3.14159) : mix(0.5, 0.72, (t - 0.785) / 0.215);\r
  if (uShape < 1.5) return t < 0.7 ? sqrt(t * 0.92 / 3.14159) : mix(0.4497, 0.72, (t - 0.7) / 0.3);\r
  if (uShape < 2.5) return 0.5 * sqrt(t) + 0.02 * t;\r
  if (uShape < 3.5) return t < 0.5 ? sqrt(t * 0.5) : 1.0 - sqrt((1.0 - t) * 0.5);\r
  if (uShape < 4.5) return 0.52 * t;\r
  return (1.0 - sqrt(1.0 - t)) * 0.5 + 0.02 * t;\r
}\r
\r
vec2 center(vec2 p, float angle) {\r
  vec2 q = rotate(angle) * p / uCell;\r
  vec2 c = floor(q) + 0.5;\r
  if (uShape > 3.5 && uShape < 4.5) c.x = q.x;\r
  return rotate(-angle) * c * uCell;\r
}\r
\r
float dots(vec2 p, float angle, float t, float seed, float grow) {\r
  vec2 q = rotate(angle) * p / uCell;\r
  float d = metric(fract(q) - 0.5);\r
  d += (noise(p * 0.42 + seed * 17.0) - 0.5) * uRough * 0.18;\r
  float r = reach(t) * uScale * grow;\r
  float w = max(fwidth(d), 0.0001) * 0.75;\r
  return smoothstep(r + w, r - w, d) * clamp(r / (w * 2.0), 0.0, 1.0);\r
}\r
\r
float coverage(vec4 image) {\r
  float shade = dot(tone(gradeColor(image.rgb)), LUMA);\r
  float paper = dot(tone(uPaper), LUMA);\r
  float span = dot(tone(uInk), LUMA) - paper;\r
  float t = abs(span) < 0.02 ? 1.0 - shade : (shade - paper) / span;\r
  return press(t, image.a);\r
}\r
\r
float burst(vec2 p) {\r
  float value = 0.0;\r
  for (int i = 0; i < 4; i++) {\r
    vec4 b = uBursts[i];\r
    if (b.w <= 0.0) continue;\r
    float offset = distance(p, b.xy) - b.z;\r
    float edge = offset > 0.0 ? offset / (uBurstWidth * 0.35) : -offset / uBurstWidth;\r
    value = max(value, clamp(1.0 - edge, 0.0, 1.0) * b.w);\r
  }\r
  return value;\r
}\r
\r
void main() {\r
  vec2 p = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y) / uDpr;\r
  float lod = log2(max(uCell * uTexels, 1.0));\r
  float base = uAngle;\r
  vec2 drift = vec2(uShift, uShift * -0.6);\r
\r
  vec2 field = p / max(uView.x, uView.y) - uView / max(uView.x, uView.y) * 0.5;\r
  float delay = length(field) * 1.15 + hash(floor(p / uCell)) * 0.06;\r
  float grow = smoothstep(0.0, 1.0, clamp((uIntro * 1.7 - delay) / 0.45, 0.0, 1.0));\r
\r
  vec3 print = uPaper;\r
  if (uMode < 0.5) {\r
    float k = dots(p, base, coverage(photo(center(p, base), lod, 0.5)), 0.0, grow);\r
    print = mix(uPaper, uInk, k);\r
  } else if (uMode < 1.5) {\r
    float second = base + 0.5236;\r
    float tA = coverage(photo(center(p, base), lod, 0.5));\r
    float tB = coverage(photo(center(p + drift, second) - drift, lod, 0.5));\r
    float kA = dots(p, base, pow(tA, 1.9), 0.0, grow);\r
    float kB = dots(p + drift, second, clamp(tB * 1.3, 0.0, 1.0) * 0.8, 1.0, grow);\r
    if (dot(uPaper, LUMA) > 0.5) {\r
      print = uPaper * mix(vec3(1.0), uAccent, kB) * mix(vec3(1.0), uInk, kA);\r
    } else {\r
      print = min(uPaper + uAccent * kB + uInk * kA, vec3(1.0));\r
    }\r
  } else if (dot(uPaper, LUMA) > 0.5) {\r
    float ac = base - 0.5236;\r
    float am = base + 0.5236;\r
    float ay = base - 0.7854;\r
    vec4 sc = photo(center(p + drift, ac) - drift, lod, 0.5);\r
    vec4 sm = photo(center(p - drift, am) + drift, lod, 0.5);\r
    vec4 sy = photo(center(p + drift.yx, ay) - drift.yx, lod, 0.5);\r
    vec4 sk = photo(center(p, base), lod, 0.5);\r
    float kc = sc.a > 0.0 ? dots(p + drift, ac, plate(separate(sc.rgb).x, sc.a), 1.0, grow) : 0.0;\r
    float km = sm.a > 0.0 ? dots(p - drift, am, plate(separate(sm.rgb).y, sm.a), 2.0, grow) : 0.0;\r
    float ky = sy.a > 0.0 ? dots(p + drift.yx, ay, plate(separate(sy.rgb).z, sy.a), 3.0, grow) : 0.0;\r
    float kk = sk.a > 0.0 ? dots(p, base, plate(separate(sk.rgb).w, sk.a), 4.0, grow) : 0.0;\r
    print = uPaper;\r
    print *= mix(vec3(1.0), CYAN, kc);\r
    print *= mix(vec3(1.0), MAGENTA, km);\r
    print *= mix(vec3(1.0), YELLOW, ky);\r
    print *= mix(vec3(1.0), KEY, kk);\r
  } else {\r
    float ar = base - 0.5236;\r
    float ag = base + 0.5236;\r
    vec4 sr = photo(center(p + drift, ar) - drift, lod, 0.5);\r
    vec4 sg = photo(center(p - drift, ag) + drift, lod, 0.5);\r
    vec4 sb = photo(center(p, base), lod, 0.5);\r
    float kr = dots(p + drift, ar, plate(emit(sr.rgb).x, sr.a), 1.0, grow);\r
    float kg = dots(p - drift, ag, plate(emit(sg.rgb).y, sg.a), 2.0, grow);\r
    float kb = dots(p, base, plate(emit(sb.rgb).z, sb.a), 3.0, grow);\r
    print = min(uPaper + RED * kr + GREEN * kg + BLUE * kb, vec3(1.0));\r
  }\r
\r
  vec2 maskUv = vec2(p.x / uView.x, 1.0 - p.y / uView.y);\r
  float shown = max(texture(uMask, maskUv).r, burst(p));\r
  shown = mix(shown, 1.0 - shown, uReverse);\r
  shown = shown * shown * (3.0 - 2.0 * shown);\r
  vec2 q = rotate(base) * p / uCell;\r
  float d = metric(fract(q) - 0.5);\r
  float r = reach(1.0) * 1.08 * shown;\r
  float w = max(fwidth(d), 0.0001) * 0.75;\r
  float k = smoothstep(r + w, r - w, d) * clamp(r / (w * 2.0), 0.0, 1.0);\r
  vec4 sharp = photo(p, 0.0, 0.0);\r
  vec3 real = mix(uPaper, sharp.rgb, sharp.a);\r
  outColor = vec4(mix(print, real, k), 1.0);\r
}\`;\r
\r
const MODES: Record<string, number> = { mono: 0, duotone: 1, color: 2 };\r
const SHAPES: Record<string, number> = { dot: 0, ellipse: 1, square: 2, diamond: 3, line: 4, cross: 5 };\r
const MAX_BURSTS = 4;\r
const BURST_SECONDS = 1.3;\r
const INTRO_SECONDS = 1.4;\r
const MASK_SCALE = 0.5;\r
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
const link = (gl: WebGL2RenderingContext, fragmentSource: string) => {\r
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
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;\r
  gl.deleteProgram(program);\r
  return null;\r
};\r
\r
const locate = (gl: WebGL2RenderingContext, program: WebGLProgram, names: string[]) => {\r
  const result: Record<string, WebGLUniformLocation | null> = {};\r
  for (const name of names) result[name] = gl.getUniformLocation(program, name);\r
  return result;\r
};\r
\r
const wanderAt = (t: number, w: number, h: number): [number, number] => [\r
  w * (0.5 + 0.32 * Math.sin(t * 0.53) + 0.08 * Math.sin(t * 1.31 + 0.6)),\r
  h * (0.5 + 0.27 * Math.sin(t * 0.71 + 1.1) + 0.07 * Math.cos(t * 1.57))\r
];\r
\r
const measureEdge = (context: CanvasRenderingContext2D, image: HTMLImageElement) => {\r
  const size = 32;\r
  context.canvas.width = size;\r
  context.canvas.height = size;\r
  context.clearRect(0, 0, size, size);\r
  context.drawImage(image, 0, 0, size, size);\r
  const data = context.getImageData(0, 0, size, size).data;\r
  const sum: number[] = [0, 0, 0];\r
  const squares: number[] = [0, 0, 0];\r
  let count = 0;\r
  let clear = 0;\r
  for (let y = 0; y < size; y++) {\r
    for (let x = 0; x < size; x++) {\r
      if (x > 0 && y > 0 && x < size - 1 && y < size - 1) continue;\r
      const i = (y * size + x) * 4;\r
      if (data[i + 3] < 250) clear++;\r
      for (let c = 0; c < 3; c++) {\r
        const v = data[i + c] / 255;\r
        sum[c] += v;\r
        squares[c] += v * v;\r
      }\r
      count++;\r
    }\r
  }\r
  const matte = [sum[0] / count, sum[1] / count, sum[2] / count];\r
  const spread =\r
    matte.reduce((total, mean, c) => total + Math.sqrt(Math.max(0, squares[c] / count - mean * mean)), 0) / 3;\r
  return { matte, plain: clear < count * 0.5 && spread < 0.06 };\r
};\r
\r
const HalftoneReveal = ({\r
  src = DEFAULT_SRC,\r
  fit = 'cover',\r
  mode = 'mono',\r
  shape = 'dot',\r
  cellSize = 6,\r
  angle = 45,\r
  dotScale = 1,\r
  inkColor = '#120f17',\r
  accentColor = '#ff4f2a',\r
  paperColor = '#ffffff',\r
  contrast = 1.1,\r
  brightness = 0,\r
  invert = false,\r
  roughness = 0,\r
  misregistration = 0,\r
  revealRadius = 160,\r
  softness = 0.6,\r
  linger = 1.2,\r
  reverse = false,\r
  wander = false,\r
  clickBurst = true,\r
  intro = true,\r
  className = '',\r
  style\r
}: HalftoneRevealProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings: Settings = {\r
    fit,\r
    mode: MODES[mode] ?? 0,\r
    shape: SHAPES[shape] ?? 0,\r
    cellSize: clamp(cellSize, 2, 80),\r
    angle,\r
    dotScale: clamp(dotScale, 0.2, 2),\r
    inkColor: String(inkColor),\r
    accentColor: String(accentColor),\r
    paperColor: String(paperColor),\r
    contrast,\r
    brightness,\r
    invert,\r
    roughness: clamp(roughness, 0, 1),\r
    misregistration: clamp(misregistration, 0, 1),\r
    revealRadius: Math.max(0, revealRadius),\r
    softness: clamp(softness, 0, 1),\r
    linger: Math.max(0, linger),\r
    reverse,\r
    wander,\r
    clickBurst,\r
    intro\r
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
      stencil: false,\r
      preserveDrawingBuffer: false\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const maskProgram = link(gl, MASK);\r
    const viewProgram = link(gl, VIEW);\r
    if (!maskProgram || !viewProgram) return undefined;\r
    const maskUniforms = locate(gl, maskProgram, [\r
      'uPrevious',\r
      'uTexture',\r
      'uView',\r
      'uFrom',\r
      'uTo',\r
      'uRadius',\r
      'uSoftness',\r
      'uStrength',\r
      'uFade'\r
    ]);\r
    const viewUniforms = locate(gl, viewProgram, [\r
      'uImage',\r
      'uMask',\r
      'uResolution',\r
      'uView',\r
      'uDpr',\r
      'uFrame',\r
      'uTexels',\r
      'uMode',\r
      'uShape',\r
      'uCell',\r
      'uAngle',\r
      'uScale',\r
      'uInk',\r
      'uAccent',\r
      'uPaper',\r
      'uContrast',\r
      'uBrightness',\r
      'uInvert',\r
      'uRough',\r
      'uShift',\r
      'uMatte',\r
      'uKey',\r
      'uReverse',\r
      'uIntro',\r
      'uBursts',\r
      'uBurstWidth'\r
    ]);\r
\r
    const vao = gl.createVertexArray();\r
    const buffer = gl.createBuffer();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    gl.bindVertexArray(null);\r
\r
    const floatMask = !!gl.getExtension('EXT_color_buffer_float');\r
    const imageTexture = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, imageTexture);\r
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
\r
    const createMask = (width: number, height: number): MaskTarget => {\r
      const texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      if (floatMask) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.HALF_FLOAT, null);\r
      else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
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
      return { texture, framebuffer, width, height };\r
    };\r
    const destroyMask = (target: MaskTarget) => {\r
      gl.deleteFramebuffer(target.framebuffer);\r
      gl.deleteTexture(target.texture);\r
    };\r
    let masks = [createMask(2, 2), createMask(2, 2)];\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const colorCache = new Map<string, number[]>();\r
    const bursts: { x: number; y: number; start: number }[] = [];\r
    const burstData = new Float32Array(MAX_BURSTS * 4);\r
    const pointer = { x: 0, y: 0, inside: false, fresh: true, placed: false };\r
    const brush = { x: 0, y: 0, px: 0, py: 0 };\r
    const state = {\r
      width: 1,\r
      height: 1,\r
      dpr: 1,\r
      image: null as HTMLImageElement | null,\r
      matte: [0, 0, 0] as number[],\r
      key: 0,\r
      introStart: 0,\r
      presence: 0,\r
      drift: 0,\r
      trailUntil: 0\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let alive = true;\r
\r
    const toRgb = (value: string): number[] => {\r
      const cached = colorCache.get(value);\r
      if (cached) return cached;\r
      let rgb = [0, 0, 0];\r
      if (probe && value) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#000000';\r
        probe.fillStyle = /^[0-9a-f]{3,8}$/i.test(value) ? \`#\${value}\` : value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      colorCache.set(value, rgb);\r
      return rgb;\r
    };\r
\r
    const frameRect = (s: Settings) => {\r
      const { image, width, height } = state;\r
      if (!image) return [0, 0, width, height];\r
      const scale = (s.fit === 'cover' ? Math.max : Math.min)(width / image.naturalWidth, height / image.naturalHeight);\r
      const w = image.naturalWidth * scale;\r
      const h = image.naturalHeight * scale;\r
      return [(width - w) / 2, (height - h) / 2, w, h];\r
    };\r
\r
    const resize = () => {\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const dpr = Math.min(window.devicePixelRatio || 1, 2);\r
      state.width = width;\r
      state.height = height;\r
      state.dpr = dpr;\r
      canvas.width = Math.max(1, Math.round(width * dpr));\r
      canvas.height = Math.max(1, Math.round(height * dpr));\r
      const mw = Math.max(2, Math.round(width * MASK_SCALE));\r
      const mh = Math.max(2, Math.round(height * MASK_SCALE));\r
      if (mw !== masks[0].width || mh !== masks[0].height) {\r
        masks.forEach(destroyMask);\r
        masks = [createMask(mw, mh), createMask(mw, mh)];\r
      }\r
      if (!pointer.placed) {\r
        pointer.x = width / 2;\r
        pointer.y = height / 2;\r
      }\r
      wake();\r
    };\r
\r
    const drawMask = (s: Settings, dt: number) => {\r
      const minimum = floatMask ? 0 : 1.5 / 255;\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, masks[1].framebuffer);\r
      gl.viewport(0, 0, masks[1].width, masks[1].height);\r
      gl.useProgram(maskProgram);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, masks[0].texture);\r
      gl.uniform1i(maskUniforms.uPrevious, 0);\r
      gl.uniform2f(maskUniforms.uTexture, masks[1].width, masks[1].height);\r
      gl.uniform2f(maskUniforms.uView, state.width, state.height);\r
      gl.uniform2f(maskUniforms.uFrom, brush.px, brush.py);\r
      gl.uniform2f(maskUniforms.uTo, brush.x, brush.y);\r
      gl.uniform1f(maskUniforms.uRadius, s.revealRadius * (0.45 + 0.55 * state.presence));\r
      gl.uniform1f(maskUniforms.uSoftness, s.softness);\r
      gl.uniform1f(maskUniforms.uStrength, state.presence);\r
      gl.uniform1f(maskUniforms.uFade, Math.max(s.linger > 0 ? dt / s.linger : 1, minimum));\r
      gl.bindVertexArray(vao);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      masks.reverse();\r
    };\r
\r
    const drawView = (s: Settings, now: number) => {\r
      const [fx, fy, fw, fh] = frameRect(s);\r
      const image = state.image;\r
      const intro = !image ? 0 : !s.intro || reduce ? 1 : Math.min(1, (now - state.introStart) / 1000 / INTRO_SECONDS);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(viewProgram);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, imageTexture);\r
      gl.uniform1i(viewUniforms.uImage, 0);\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.bindTexture(gl.TEXTURE_2D, masks[0].texture);\r
      gl.uniform1i(viewUniforms.uMask, 1);\r
      gl.uniform2f(viewUniforms.uResolution, canvas.width, canvas.height);\r
      gl.uniform2f(viewUniforms.uView, state.width, state.height);\r
      gl.uniform1f(viewUniforms.uDpr, canvas.width / state.width);\r
      gl.uniform4f(viewUniforms.uFrame, fx, fy, fw, fh);\r
      gl.uniform1f(viewUniforms.uTexels, image ? image.naturalWidth / fw : 1);\r
      gl.uniform1f(viewUniforms.uMode, s.mode);\r
      gl.uniform1f(viewUniforms.uShape, s.shape);\r
      gl.uniform1f(viewUniforms.uCell, s.cellSize);\r
      gl.uniform1f(viewUniforms.uAngle, (s.angle * Math.PI) / 180);\r
      gl.uniform1f(viewUniforms.uScale, s.dotScale);\r
      gl.uniform3fv(viewUniforms.uInk, toRgb(s.inkColor));\r
      gl.uniform3fv(viewUniforms.uAccent, toRgb(s.accentColor));\r
      gl.uniform3fv(viewUniforms.uPaper, toRgb(s.paperColor));\r
      gl.uniform1f(viewUniforms.uContrast, s.contrast);\r
      gl.uniform1f(viewUniforms.uBrightness, s.brightness);\r
      gl.uniform1f(viewUniforms.uInvert, s.invert ? 1 : 0);\r
      gl.uniform1f(viewUniforms.uRough, s.roughness);\r
      gl.uniform1f(viewUniforms.uShift, s.misregistration * s.cellSize * 0.35);\r
      gl.uniform3fv(viewUniforms.uMatte, state.matte);\r
      gl.uniform1f(viewUniforms.uKey, state.key);\r
      gl.uniform1f(viewUniforms.uReverse, s.reverse ? 1 : 0);\r
      gl.uniform1f(viewUniforms.uIntro, 1 - (1 - intro) * (1 - intro));\r
      gl.uniform4fv(viewUniforms.uBursts, burstData);\r
      gl.uniform1f(viewUniforms.uBurstWidth, Math.max(60, s.revealRadius * 0.9));\r
      gl.bindVertexArray(vao);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindVertexArray(null);\r
      return intro;\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!alive || !visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, Math.max(0, (now - last) / 1000)) : 1 / 60;\r
      last = now;\r
\r
      const wandering = s.wander && !reduce;\r
      let targetX = pointer.x;\r
      let targetY = pointer.y;\r
      if (!pointer.inside && wandering) {\r
        state.drift = Math.min(1, state.drift + dt / 1.2);\r
        const [wx, wy] = wanderAt(now / 1000, state.width, state.height);\r
        const k = state.drift * state.drift * (3 - 2 * state.drift);\r
        targetX += (wx - targetX) * k;\r
        targetY += (wy - targetY) * k;\r
      } else {\r
        state.drift = 0;\r
      }\r
      const engaged = pointer.inside || wandering;\r
      state.presence += ((engaged ? 1 : 0) - state.presence) * (1 - Math.exp(-dt / 0.16));\r
      if (pointer.fresh) {\r
        brush.x = brush.px = targetX;\r
        brush.y = brush.py = targetY;\r
        pointer.fresh = false;\r
      } else {\r
        const follow = 1 - Math.exp(-dt / 0.035);\r
        brush.x += (targetX - brush.x) * follow;\r
        brush.y += (targetY - brush.y) * follow;\r
      }\r
\r
      burstData.fill(0);\r
      for (let i = bursts.length - 1; i >= 0; i--) {\r
        if ((now - bursts[i].start) / 1000 >= BURST_SECONDS) bursts.splice(i, 1);\r
      }\r
      bursts.forEach((b, i) => {\r
        const k = Math.max(0, (now - b.start) / 1000 / BURST_SECONDS);\r
        const reach = Math.hypot(Math.max(b.x, state.width - b.x), Math.max(b.y, state.height - b.y)) + 80;\r
        burstData[i * 4] = b.x;\r
        burstData[i * 4 + 1] = b.y;\r
        burstData[i * 4 + 2] = reach * Math.sin((k * Math.PI) / 2);\r
        burstData[i * 4 + 3] = 1 - k * k * k;\r
      });\r
\r
      if (state.presence > 0.002) state.trailUntil = now + s.linger * 1000 + 200;\r
      drawMask(s, dt);\r
      brush.px = brush.x;\r
      brush.py = brush.y;\r
      const intro = drawView(s, now);\r
\r
      const busy =\r
        engaged || state.presence > 0.002 || bursts.length > 0 || now < state.trailUntil || (state.image && intro < 1);\r
      if (busy) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!raf && alive && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const image = new Image();\r
    image.crossOrigin = 'anonymous';\r
    image.decoding = 'async';\r
    image.onload = () => {\r
      if (!alive) return;\r
      gl.bindTexture(gl.TEXTURE_2D, imageTexture);\r
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);\r
      gl.generateMipmap(gl.TEXTURE_2D);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);\r
      const sampler = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
      if (sampler) {\r
        try {\r
          const edge = measureEdge(sampler, image);\r
          state.matte = edge.matte;\r
          state.key = edge.plain ? 1 : 0;\r
        } catch {\r
          state.key = 0;\r
        }\r
      }\r
      state.image = image;\r
      state.introStart = performance.now();\r
      wake();\r
    };\r
    image.src = src;\r
\r
    const locatePointer = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      pointer.x = event.clientX - rect.left;\r
      pointer.y = event.clientY - rect.top;\r
      pointer.placed = true;\r
    };\r
    const onMove = (event: PointerEvent) => {\r
      locatePointer(event);\r
      if (!pointer.inside) {\r
        pointer.inside = true;\r
        pointer.fresh = true;\r
      }\r
      wake();\r
    };\r
    const onLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
    const onDown = (event: PointerEvent) => {\r
      onMove(event);\r
      if (!settingsRef.current.clickBurst || (event.pointerType === 'mouse' && event.button !== 0)) return;\r
      bursts.push({ x: pointer.x, y: pointer.y, start: performance.now() });\r
      if (bursts.length > MAX_BURSTS) bursts.shift();\r
    };\r
    const onVisibility = () => {\r
      last = 0;\r
      wake();\r
    };\r
\r
    container.addEventListener('pointermove', onMove, { passive: true });\r
    container.addEventListener('pointerenter', onMove, { passive: true });\r
    container.addEventListener('pointerdown', onDown, { passive: true });\r
    container.addEventListener('pointerleave', onLeave, { passive: true });\r
    container.addEventListener('pointercancel', onLeave, { passive: true });\r
    document.addEventListener('visibilitychange', onVisibility);\r
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
    resize();\r
\r
    wakeRef.current = () => {\r
      if (!raf && alive && visible) {\r
        drawView(settingsRef.current, performance.now());\r
        wake();\r
      }\r
    };\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      image.onload = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      container.removeEventListener('pointermove', onMove);\r
      container.removeEventListener('pointerenter', onMove);\r
      container.removeEventListener('pointerdown', onDown);\r
      container.removeEventListener('pointerleave', onLeave);\r
      container.removeEventListener('pointercancel', onLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      masks.forEach(destroyMask);\r
      gl.deleteTexture(imageTexture);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(maskProgram);\r
      gl.deleteProgram(viewProgram);\r
    };\r
  }, [src]);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div ref={containerRef} className={\`halftone-reveal\${className ? \` \${className}\` : ''}\`} style={style}>\r
      <canvas ref={canvasRef} className="halftone-reveal-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default HalftoneReveal;\r
`,a=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties } from 'react';\r
\r
const DEFAULT_SRC = 'https://images.unsplash.com/photo-1693250707557-a846a014b321?q=80&w=1400&auto=format&fit=crop';\r
\r
export type HalftoneRevealMode = 'mono' | 'duotone' | 'color';\r
\r
export type HalftoneRevealShape = 'dot' | 'ellipse' | 'square' | 'diamond' | 'line' | 'cross';\r
\r
export interface HalftoneRevealProps {\r
  src?: string;\r
  fit?: 'contain' | 'cover';\r
  mode?: HalftoneRevealMode;\r
  shape?: HalftoneRevealShape;\r
  cellSize?: number;\r
  angle?: number;\r
  dotScale?: number;\r
  inkColor?: string;\r
  accentColor?: string;\r
  paperColor?: string;\r
  contrast?: number;\r
  brightness?: number;\r
  invert?: boolean;\r
  roughness?: number;\r
  misregistration?: number;\r
  revealRadius?: number;\r
  softness?: number;\r
  linger?: number;\r
  reverse?: boolean;\r
  wander?: boolean;\r
  clickBurst?: boolean;\r
  intro?: boolean;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
type Settings = {\r
  fit: 'contain' | 'cover';\r
  mode: number;\r
  shape: number;\r
  cellSize: number;\r
  angle: number;\r
  dotScale: number;\r
  inkColor: string;\r
  accentColor: string;\r
  paperColor: string;\r
  contrast: number;\r
  brightness: number;\r
  invert: boolean;\r
  roughness: number;\r
  misregistration: number;\r
  revealRadius: number;\r
  softness: number;\r
  linger: number;\r
  reverse: boolean;\r
  wander: boolean;\r
  clickBurst: boolean;\r
  intro: boolean;\r
};\r
\r
type MaskTarget = { texture: WebGLTexture | null; framebuffer: WebGLFramebuffer | null; width: number; height: number };\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const MASK = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uPrevious;\r
uniform vec2 uTexture;\r
uniform vec2 uView;\r
uniform vec2 uFrom;\r
uniform vec2 uTo;\r
uniform float uRadius;\r
uniform float uSoftness;\r
uniform float uStrength;\r
uniform float uFade;\r
out vec4 outColor;\r
\r
float segment(vec2 p, vec2 a, vec2 b) {\r
  vec2 ab = b - a;\r
  float h = clamp(dot(p - a, ab) / max(dot(ab, ab), 0.0001), 0.0, 1.0);\r
  return length(p - a - ab * h);\r
}\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uTexture;\r
  vec2 p = vec2(uv.x, 1.0 - uv.y) * uView;\r
  float trail = max(texture(uPrevious, uv).r - uFade, 0.0);\r
  float band = max(uRadius * uSoftness, 1.0);\r
  float brush = clamp((uRadius - segment(p, uFrom, uTo)) / band, 0.0, 1.0);\r
  brush = brush * brush * (3.0 - 2.0 * brush);\r
  outColor = vec4(max(trail, brush * uStrength), 0.0, 0.0, 1.0);\r
}\`;\r
\r
const VIEW = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uImage;\r
uniform sampler2D uMask;\r
uniform vec2 uResolution;\r
uniform vec2 uView;\r
uniform float uDpr;\r
uniform vec4 uFrame;\r
uniform float uTexels;\r
uniform float uMode;\r
uniform float uShape;\r
uniform float uCell;\r
uniform float uAngle;\r
uniform float uScale;\r
uniform vec3 uInk;\r
uniform vec3 uAccent;\r
uniform vec3 uPaper;\r
uniform float uContrast;\r
uniform float uBrightness;\r
uniform float uInvert;\r
uniform float uRough;\r
uniform float uShift;\r
uniform vec3 uMatte;\r
uniform float uKey;\r
uniform float uReverse;\r
uniform float uIntro;\r
uniform vec4 uBursts[4];\r
uniform float uBurstWidth;\r
out vec4 outColor;\r
\r
const vec3 LUMA = vec3(0.2126, 0.7152, 0.0722);\r
const vec3 CYAN = vec3(0.0, 0.64, 0.93);\r
const vec3 MAGENTA = vec3(0.92, 0.07, 0.56);\r
const vec3 YELLOW = vec3(1.0, 0.91, 0.0);\r
const vec3 KEY = vec3(0.11, 0.1, 0.12);\r
const vec3 RED = vec3(1.0, 0.16, 0.12);\r
const vec3 GREEN = vec3(0.12, 1.0, 0.3);\r
const vec3 BLUE = vec3(0.16, 0.32, 1.0);\r
\r
mat2 rotate(float a) {\r
  float c = cos(a);\r
  float s = sin(a);\r
  return mat2(c, -s, s, c);\r
}\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
float noise(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = fract(p);\r
  f = f * f * (3.0 - 2.0 * f);\r
  float a = hash(i);\r
  float b = hash(i + vec2(1.0, 0.0));\r
  float c = hash(i + vec2(0.0, 1.0));\r
  float d = hash(i + vec2(1.0, 1.0));\r
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);\r
}\r
\r
vec4 photo(vec2 p, float lod, float margin) {\r
  vec2 uv = (p - uFrame.xy) / uFrame.zw;\r
  vec4 c = textureLod(uImage, clamp(uv, 0.0, 1.0), lod);\r
  vec2 slack = margin * uCell / uFrame.zw;\r
  vec2 inside = step(-slack, uv) * step(uv, 1.0 + slack);\r
  float keep = inside.x * inside.y * c.a;\r
  keep *= mix(1.0, smoothstep(0.05, 0.2, distance(c.rgb, uMatte)), uKey);\r
  return vec4(c.rgb, keep);\r
}\r
\r
float grade(float v) {\r
  v = clamp((v - 0.5) * uContrast + 0.5 + uBrightness, 0.0, 1.0);\r
  return mix(v, 1.0 - v, uInvert);\r
}\r
\r
vec3 gradeColor(vec3 c) {\r
  return vec3(grade(c.r), grade(c.g), grade(c.b));\r
}\r
\r
vec3 tone(vec3 c) {\r
  return pow(max(c, 0.0), vec3(1.5));\r
}\r
\r
float press(float t, float alpha) {\r
  return (0.05 + clamp(t, 0.0, 1.0) * 0.89) * alpha;\r
}\r
\r
float plate(float t, float alpha) {\r
  return (0.02 + clamp(t, 0.0, 1.0) * 0.92) * alpha;\r
}\r
\r
vec3 decode(vec3 c) {\r
  return pow(max(c, 0.0), vec3(2.2));\r
}\r
\r
vec4 separate(vec3 color) {\r
  vec3 target = clamp(tone(gradeColor(color)) / max(tone(uPaper), vec3(0.02)), 0.0, 1.0);\r
  vec3 absorbC = 1.0 - decode(CYAN);\r
  vec3 absorbM = 1.0 - decode(MAGENTA);\r
  vec3 absorbY = 1.0 - decode(YELLOW);\r
  float bright = pow(max(max(target.r, target.g), target.b), 0.4545);\r
  float key = pow(clamp(1.0 - bright / 0.62, 0.0, 1.0), 1.4) * 0.95;\r
  vec3 rest = clamp(target / max(1.0 - key * (1.0 - decode(KEY)), vec3(0.03)), 0.0, 1.0);\r
  vec3 a = 1.0 - rest;\r
  for (int i = 0; i < 3; i++) {\r
    vec3 tc = 1.0 - a.x * absorbC;\r
    vec3 tm = 1.0 - a.y * absorbM;\r
    vec3 ty = 1.0 - a.z * absorbY;\r
    mat3 slope = mat3(-absorbC * tm * ty, -absorbM * tc * ty, -absorbY * tc * tm);\r
    if (abs(determinant(slope)) < 1e-6) break;\r
    a = clamp(a - inverse(slope) * (tc * tm * ty - rest), 0.0, 1.0);\r
  }\r
  return vec4(a, key);\r
}\r
\r
vec3 emit(vec3 color) {\r
  vec3 target = max(tone(gradeColor(color)) - tone(uPaper), 0.0);\r
  mat3 lights = mat3(decode(RED), decode(GREEN), decode(BLUE));\r
  return clamp(inverse(lights) * target, 0.0, 1.0);\r
}\r
\r
float metric(vec2 f) {\r
  if (uShape < 0.5) return length(f);\r
  if (uShape < 1.5) return length(f * vec2(0.8, 1.15));\r
  if (uShape < 2.5) return max(abs(f.x), abs(f.y));\r
  if (uShape < 3.5) return abs(f.x) + abs(f.y);\r
  if (uShape < 4.5) return abs(f.y);\r
  return min(abs(f.x), abs(f.y));\r
}\r
\r
float reach(float t) {\r
  t = clamp(t, 0.0, 1.0);\r
  if (uShape < 0.5) return t < 0.785 ? sqrt(t / 3.14159) : mix(0.5, 0.72, (t - 0.785) / 0.215);\r
  if (uShape < 1.5) return t < 0.7 ? sqrt(t * 0.92 / 3.14159) : mix(0.4497, 0.72, (t - 0.7) / 0.3);\r
  if (uShape < 2.5) return 0.5 * sqrt(t) + 0.02 * t;\r
  if (uShape < 3.5) return t < 0.5 ? sqrt(t * 0.5) : 1.0 - sqrt((1.0 - t) * 0.5);\r
  if (uShape < 4.5) return 0.52 * t;\r
  return (1.0 - sqrt(1.0 - t)) * 0.5 + 0.02 * t;\r
}\r
\r
vec2 center(vec2 p, float angle) {\r
  vec2 q = rotate(angle) * p / uCell;\r
  vec2 c = floor(q) + 0.5;\r
  if (uShape > 3.5 && uShape < 4.5) c.x = q.x;\r
  return rotate(-angle) * c * uCell;\r
}\r
\r
float dots(vec2 p, float angle, float t, float seed, float grow) {\r
  vec2 q = rotate(angle) * p / uCell;\r
  float d = metric(fract(q) - 0.5);\r
  d += (noise(p * 0.42 + seed * 17.0) - 0.5) * uRough * 0.18;\r
  float r = reach(t) * uScale * grow;\r
  float w = max(fwidth(d), 0.0001) * 0.75;\r
  return smoothstep(r + w, r - w, d) * clamp(r / (w * 2.0), 0.0, 1.0);\r
}\r
\r
float coverage(vec4 image) {\r
  float shade = dot(tone(gradeColor(image.rgb)), LUMA);\r
  float paper = dot(tone(uPaper), LUMA);\r
  float span = dot(tone(uInk), LUMA) - paper;\r
  float t = abs(span) < 0.02 ? 1.0 - shade : (shade - paper) / span;\r
  return press(t, image.a);\r
}\r
\r
float burst(vec2 p) {\r
  float value = 0.0;\r
  for (int i = 0; i < 4; i++) {\r
    vec4 b = uBursts[i];\r
    if (b.w <= 0.0) continue;\r
    float offset = distance(p, b.xy) - b.z;\r
    float edge = offset > 0.0 ? offset / (uBurstWidth * 0.35) : -offset / uBurstWidth;\r
    value = max(value, clamp(1.0 - edge, 0.0, 1.0) * b.w);\r
  }\r
  return value;\r
}\r
\r
void main() {\r
  vec2 p = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y) / uDpr;\r
  float lod = log2(max(uCell * uTexels, 1.0));\r
  float base = uAngle;\r
  vec2 drift = vec2(uShift, uShift * -0.6);\r
\r
  vec2 field = p / max(uView.x, uView.y) - uView / max(uView.x, uView.y) * 0.5;\r
  float delay = length(field) * 1.15 + hash(floor(p / uCell)) * 0.06;\r
  float grow = smoothstep(0.0, 1.0, clamp((uIntro * 1.7 - delay) / 0.45, 0.0, 1.0));\r
\r
  vec3 print = uPaper;\r
  if (uMode < 0.5) {\r
    float k = dots(p, base, coverage(photo(center(p, base), lod, 0.5)), 0.0, grow);\r
    print = mix(uPaper, uInk, k);\r
  } else if (uMode < 1.5) {\r
    float second = base + 0.5236;\r
    float tA = coverage(photo(center(p, base), lod, 0.5));\r
    float tB = coverage(photo(center(p + drift, second) - drift, lod, 0.5));\r
    float kA = dots(p, base, pow(tA, 1.9), 0.0, grow);\r
    float kB = dots(p + drift, second, clamp(tB * 1.3, 0.0, 1.0) * 0.8, 1.0, grow);\r
    if (dot(uPaper, LUMA) > 0.5) {\r
      print = uPaper * mix(vec3(1.0), uAccent, kB) * mix(vec3(1.0), uInk, kA);\r
    } else {\r
      print = min(uPaper + uAccent * kB + uInk * kA, vec3(1.0));\r
    }\r
  } else if (dot(uPaper, LUMA) > 0.5) {\r
    float ac = base - 0.5236;\r
    float am = base + 0.5236;\r
    float ay = base - 0.7854;\r
    vec4 sc = photo(center(p + drift, ac) - drift, lod, 0.5);\r
    vec4 sm = photo(center(p - drift, am) + drift, lod, 0.5);\r
    vec4 sy = photo(center(p + drift.yx, ay) - drift.yx, lod, 0.5);\r
    vec4 sk = photo(center(p, base), lod, 0.5);\r
    float kc = sc.a > 0.0 ? dots(p + drift, ac, plate(separate(sc.rgb).x, sc.a), 1.0, grow) : 0.0;\r
    float km = sm.a > 0.0 ? dots(p - drift, am, plate(separate(sm.rgb).y, sm.a), 2.0, grow) : 0.0;\r
    float ky = sy.a > 0.0 ? dots(p + drift.yx, ay, plate(separate(sy.rgb).z, sy.a), 3.0, grow) : 0.0;\r
    float kk = sk.a > 0.0 ? dots(p, base, plate(separate(sk.rgb).w, sk.a), 4.0, grow) : 0.0;\r
    print = uPaper;\r
    print *= mix(vec3(1.0), CYAN, kc);\r
    print *= mix(vec3(1.0), MAGENTA, km);\r
    print *= mix(vec3(1.0), YELLOW, ky);\r
    print *= mix(vec3(1.0), KEY, kk);\r
  } else {\r
    float ar = base - 0.5236;\r
    float ag = base + 0.5236;\r
    vec4 sr = photo(center(p + drift, ar) - drift, lod, 0.5);\r
    vec4 sg = photo(center(p - drift, ag) + drift, lod, 0.5);\r
    vec4 sb = photo(center(p, base), lod, 0.5);\r
    float kr = dots(p + drift, ar, plate(emit(sr.rgb).x, sr.a), 1.0, grow);\r
    float kg = dots(p - drift, ag, plate(emit(sg.rgb).y, sg.a), 2.0, grow);\r
    float kb = dots(p, base, plate(emit(sb.rgb).z, sb.a), 3.0, grow);\r
    print = min(uPaper + RED * kr + GREEN * kg + BLUE * kb, vec3(1.0));\r
  }\r
\r
  vec2 maskUv = vec2(p.x / uView.x, 1.0 - p.y / uView.y);\r
  float shown = max(texture(uMask, maskUv).r, burst(p));\r
  shown = mix(shown, 1.0 - shown, uReverse);\r
  shown = shown * shown * (3.0 - 2.0 * shown);\r
  vec2 q = rotate(base) * p / uCell;\r
  float d = metric(fract(q) - 0.5);\r
  float r = reach(1.0) * 1.08 * shown;\r
  float w = max(fwidth(d), 0.0001) * 0.75;\r
  float k = smoothstep(r + w, r - w, d) * clamp(r / (w * 2.0), 0.0, 1.0);\r
  vec4 sharp = photo(p, 0.0, 0.0);\r
  vec3 real = mix(uPaper, sharp.rgb, sharp.a);\r
  outColor = vec4(mix(print, real, k), 1.0);\r
}\`;\r
\r
const MODES: Record<string, number> = { mono: 0, duotone: 1, color: 2 };\r
const SHAPES: Record<string, number> = { dot: 0, ellipse: 1, square: 2, diamond: 3, line: 4, cross: 5 };\r
const MAX_BURSTS = 4;\r
const BURST_SECONDS = 1.3;\r
const INTRO_SECONDS = 1.4;\r
const MASK_SCALE = 0.5;\r
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
const link = (gl: WebGL2RenderingContext, fragmentSource: string) => {\r
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
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;\r
  gl.deleteProgram(program);\r
  return null;\r
};\r
\r
const locate = (gl: WebGL2RenderingContext, program: WebGLProgram, names: string[]) => {\r
  const result: Record<string, WebGLUniformLocation | null> = {};\r
  for (const name of names) result[name] = gl.getUniformLocation(program, name);\r
  return result;\r
};\r
\r
const wanderAt = (t: number, w: number, h: number): [number, number] => [\r
  w * (0.5 + 0.32 * Math.sin(t * 0.53) + 0.08 * Math.sin(t * 1.31 + 0.6)),\r
  h * (0.5 + 0.27 * Math.sin(t * 0.71 + 1.1) + 0.07 * Math.cos(t * 1.57))\r
];\r
\r
const measureEdge = (context: CanvasRenderingContext2D, image: HTMLImageElement) => {\r
  const size = 32;\r
  context.canvas.width = size;\r
  context.canvas.height = size;\r
  context.clearRect(0, 0, size, size);\r
  context.drawImage(image, 0, 0, size, size);\r
  const data = context.getImageData(0, 0, size, size).data;\r
  const sum: number[] = [0, 0, 0];\r
  const squares: number[] = [0, 0, 0];\r
  let count = 0;\r
  let clear = 0;\r
  for (let y = 0; y < size; y++) {\r
    for (let x = 0; x < size; x++) {\r
      if (x > 0 && y > 0 && x < size - 1 && y < size - 1) continue;\r
      const i = (y * size + x) * 4;\r
      if (data[i + 3] < 250) clear++;\r
      for (let c = 0; c < 3; c++) {\r
        const v = data[i + c] / 255;\r
        sum[c] += v;\r
        squares[c] += v * v;\r
      }\r
      count++;\r
    }\r
  }\r
  const matte = [sum[0] / count, sum[1] / count, sum[2] / count];\r
  const spread =\r
    matte.reduce((total, mean, c) => total + Math.sqrt(Math.max(0, squares[c] / count - mean * mean)), 0) / 3;\r
  return { matte, plain: clear < count * 0.5 && spread < 0.06 };\r
};\r
\r
const HalftoneReveal = ({\r
  src = DEFAULT_SRC,\r
  fit = 'cover',\r
  mode = 'mono',\r
  shape = 'dot',\r
  cellSize = 6,\r
  angle = 45,\r
  dotScale = 1,\r
  inkColor = '#120f17',\r
  accentColor = '#ff4f2a',\r
  paperColor = '#ffffff',\r
  contrast = 1.1,\r
  brightness = 0,\r
  invert = false,\r
  roughness = 0,\r
  misregistration = 0,\r
  revealRadius = 160,\r
  softness = 0.6,\r
  linger = 1.2,\r
  reverse = false,\r
  wander = false,\r
  clickBurst = true,\r
  intro = true,\r
  className = '',\r
  style\r
}: HalftoneRevealProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings: Settings = {\r
    fit,\r
    mode: MODES[mode] ?? 0,\r
    shape: SHAPES[shape] ?? 0,\r
    cellSize: clamp(cellSize, 2, 80),\r
    angle,\r
    dotScale: clamp(dotScale, 0.2, 2),\r
    inkColor: String(inkColor),\r
    accentColor: String(accentColor),\r
    paperColor: String(paperColor),\r
    contrast,\r
    brightness,\r
    invert,\r
    roughness: clamp(roughness, 0, 1),\r
    misregistration: clamp(misregistration, 0, 1),\r
    revealRadius: Math.max(0, revealRadius),\r
    softness: clamp(softness, 0, 1),\r
    linger: Math.max(0, linger),\r
    reverse,\r
    wander,\r
    clickBurst,\r
    intro\r
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
      stencil: false,\r
      preserveDrawingBuffer: false\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const maskProgram = link(gl, MASK);\r
    const viewProgram = link(gl, VIEW);\r
    if (!maskProgram || !viewProgram) return undefined;\r
    const maskUniforms = locate(gl, maskProgram, [\r
      'uPrevious',\r
      'uTexture',\r
      'uView',\r
      'uFrom',\r
      'uTo',\r
      'uRadius',\r
      'uSoftness',\r
      'uStrength',\r
      'uFade'\r
    ]);\r
    const viewUniforms = locate(gl, viewProgram, [\r
      'uImage',\r
      'uMask',\r
      'uResolution',\r
      'uView',\r
      'uDpr',\r
      'uFrame',\r
      'uTexels',\r
      'uMode',\r
      'uShape',\r
      'uCell',\r
      'uAngle',\r
      'uScale',\r
      'uInk',\r
      'uAccent',\r
      'uPaper',\r
      'uContrast',\r
      'uBrightness',\r
      'uInvert',\r
      'uRough',\r
      'uShift',\r
      'uMatte',\r
      'uKey',\r
      'uReverse',\r
      'uIntro',\r
      'uBursts',\r
      'uBurstWidth'\r
    ]);\r
\r
    const vao = gl.createVertexArray();\r
    const buffer = gl.createBuffer();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    gl.bindVertexArray(null);\r
\r
    const floatMask = !!gl.getExtension('EXT_color_buffer_float');\r
    const imageTexture = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, imageTexture);\r
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
\r
    const createMask = (width: number, height: number): MaskTarget => {\r
      const texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      if (floatMask) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.HALF_FLOAT, null);\r
      else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
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
      return { texture, framebuffer, width, height };\r
    };\r
    const destroyMask = (target: MaskTarget) => {\r
      gl.deleteFramebuffer(target.framebuffer);\r
      gl.deleteTexture(target.texture);\r
    };\r
    let masks = [createMask(2, 2), createMask(2, 2)];\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const colorCache = new Map<string, number[]>();\r
    const bursts: { x: number; y: number; start: number }[] = [];\r
    const burstData = new Float32Array(MAX_BURSTS * 4);\r
    const pointer = { x: 0, y: 0, inside: false, fresh: true, placed: false };\r
    const brush = { x: 0, y: 0, px: 0, py: 0 };\r
    const state = {\r
      width: 1,\r
      height: 1,\r
      dpr: 1,\r
      image: null as HTMLImageElement | null,\r
      matte: [0, 0, 0] as number[],\r
      key: 0,\r
      introStart: 0,\r
      presence: 0,\r
      drift: 0,\r
      trailUntil: 0\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let alive = true;\r
\r
    const toRgb = (value: string): number[] => {\r
      const cached = colorCache.get(value);\r
      if (cached) return cached;\r
      let rgb = [0, 0, 0];\r
      if (probe && value) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#000000';\r
        probe.fillStyle = /^[0-9a-f]{3,8}$/i.test(value) ? \`#\${value}\` : value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      colorCache.set(value, rgb);\r
      return rgb;\r
    };\r
\r
    const frameRect = (s: Settings) => {\r
      const { image, width, height } = state;\r
      if (!image) return [0, 0, width, height];\r
      const scale = (s.fit === 'cover' ? Math.max : Math.min)(width / image.naturalWidth, height / image.naturalHeight);\r
      const w = image.naturalWidth * scale;\r
      const h = image.naturalHeight * scale;\r
      return [(width - w) / 2, (height - h) / 2, w, h];\r
    };\r
\r
    const resize = () => {\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const dpr = Math.min(window.devicePixelRatio || 1, 2);\r
      state.width = width;\r
      state.height = height;\r
      state.dpr = dpr;\r
      canvas.width = Math.max(1, Math.round(width * dpr));\r
      canvas.height = Math.max(1, Math.round(height * dpr));\r
      const mw = Math.max(2, Math.round(width * MASK_SCALE));\r
      const mh = Math.max(2, Math.round(height * MASK_SCALE));\r
      if (mw !== masks[0].width || mh !== masks[0].height) {\r
        masks.forEach(destroyMask);\r
        masks = [createMask(mw, mh), createMask(mw, mh)];\r
      }\r
      if (!pointer.placed) {\r
        pointer.x = width / 2;\r
        pointer.y = height / 2;\r
      }\r
      wake();\r
    };\r
\r
    const drawMask = (s: Settings, dt: number) => {\r
      const minimum = floatMask ? 0 : 1.5 / 255;\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, masks[1].framebuffer);\r
      gl.viewport(0, 0, masks[1].width, masks[1].height);\r
      gl.useProgram(maskProgram);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, masks[0].texture);\r
      gl.uniform1i(maskUniforms.uPrevious, 0);\r
      gl.uniform2f(maskUniforms.uTexture, masks[1].width, masks[1].height);\r
      gl.uniform2f(maskUniforms.uView, state.width, state.height);\r
      gl.uniform2f(maskUniforms.uFrom, brush.px, brush.py);\r
      gl.uniform2f(maskUniforms.uTo, brush.x, brush.y);\r
      gl.uniform1f(maskUniforms.uRadius, s.revealRadius * (0.45 + 0.55 * state.presence));\r
      gl.uniform1f(maskUniforms.uSoftness, s.softness);\r
      gl.uniform1f(maskUniforms.uStrength, state.presence);\r
      gl.uniform1f(maskUniforms.uFade, Math.max(s.linger > 0 ? dt / s.linger : 1, minimum));\r
      gl.bindVertexArray(vao);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      masks.reverse();\r
    };\r
\r
    const drawView = (s: Settings, now: number) => {\r
      const [fx, fy, fw, fh] = frameRect(s);\r
      const image = state.image;\r
      const intro = !image ? 0 : !s.intro || reduce ? 1 : Math.min(1, (now - state.introStart) / 1000 / INTRO_SECONDS);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(viewProgram);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, imageTexture);\r
      gl.uniform1i(viewUniforms.uImage, 0);\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.bindTexture(gl.TEXTURE_2D, masks[0].texture);\r
      gl.uniform1i(viewUniforms.uMask, 1);\r
      gl.uniform2f(viewUniforms.uResolution, canvas.width, canvas.height);\r
      gl.uniform2f(viewUniforms.uView, state.width, state.height);\r
      gl.uniform1f(viewUniforms.uDpr, canvas.width / state.width);\r
      gl.uniform4f(viewUniforms.uFrame, fx, fy, fw, fh);\r
      gl.uniform1f(viewUniforms.uTexels, image ? image.naturalWidth / fw : 1);\r
      gl.uniform1f(viewUniforms.uMode, s.mode);\r
      gl.uniform1f(viewUniforms.uShape, s.shape);\r
      gl.uniform1f(viewUniforms.uCell, s.cellSize);\r
      gl.uniform1f(viewUniforms.uAngle, (s.angle * Math.PI) / 180);\r
      gl.uniform1f(viewUniforms.uScale, s.dotScale);\r
      gl.uniform3fv(viewUniforms.uInk, toRgb(s.inkColor));\r
      gl.uniform3fv(viewUniforms.uAccent, toRgb(s.accentColor));\r
      gl.uniform3fv(viewUniforms.uPaper, toRgb(s.paperColor));\r
      gl.uniform1f(viewUniforms.uContrast, s.contrast);\r
      gl.uniform1f(viewUniforms.uBrightness, s.brightness);\r
      gl.uniform1f(viewUniforms.uInvert, s.invert ? 1 : 0);\r
      gl.uniform1f(viewUniforms.uRough, s.roughness);\r
      gl.uniform1f(viewUniforms.uShift, s.misregistration * s.cellSize * 0.35);\r
      gl.uniform3fv(viewUniforms.uMatte, state.matte);\r
      gl.uniform1f(viewUniforms.uKey, state.key);\r
      gl.uniform1f(viewUniforms.uReverse, s.reverse ? 1 : 0);\r
      gl.uniform1f(viewUniforms.uIntro, 1 - (1 - intro) * (1 - intro));\r
      gl.uniform4fv(viewUniforms.uBursts, burstData);\r
      gl.uniform1f(viewUniforms.uBurstWidth, Math.max(60, s.revealRadius * 0.9));\r
      gl.bindVertexArray(vao);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindVertexArray(null);\r
      return intro;\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!alive || !visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, Math.max(0, (now - last) / 1000)) : 1 / 60;\r
      last = now;\r
\r
      const wandering = s.wander && !reduce;\r
      let targetX = pointer.x;\r
      let targetY = pointer.y;\r
      if (!pointer.inside && wandering) {\r
        state.drift = Math.min(1, state.drift + dt / 1.2);\r
        const [wx, wy] = wanderAt(now / 1000, state.width, state.height);\r
        const k = state.drift * state.drift * (3 - 2 * state.drift);\r
        targetX += (wx - targetX) * k;\r
        targetY += (wy - targetY) * k;\r
      } else {\r
        state.drift = 0;\r
      }\r
      const engaged = pointer.inside || wandering;\r
      state.presence += ((engaged ? 1 : 0) - state.presence) * (1 - Math.exp(-dt / 0.16));\r
      if (pointer.fresh) {\r
        brush.x = brush.px = targetX;\r
        brush.y = brush.py = targetY;\r
        pointer.fresh = false;\r
      } else {\r
        const follow = 1 - Math.exp(-dt / 0.035);\r
        brush.x += (targetX - brush.x) * follow;\r
        brush.y += (targetY - brush.y) * follow;\r
      }\r
\r
      burstData.fill(0);\r
      for (let i = bursts.length - 1; i >= 0; i--) {\r
        if ((now - bursts[i].start) / 1000 >= BURST_SECONDS) bursts.splice(i, 1);\r
      }\r
      bursts.forEach((b, i) => {\r
        const k = Math.max(0, (now - b.start) / 1000 / BURST_SECONDS);\r
        const reach = Math.hypot(Math.max(b.x, state.width - b.x), Math.max(b.y, state.height - b.y)) + 80;\r
        burstData[i * 4] = b.x;\r
        burstData[i * 4 + 1] = b.y;\r
        burstData[i * 4 + 2] = reach * Math.sin((k * Math.PI) / 2);\r
        burstData[i * 4 + 3] = 1 - k * k * k;\r
      });\r
\r
      if (state.presence > 0.002) state.trailUntil = now + s.linger * 1000 + 200;\r
      drawMask(s, dt);\r
      brush.px = brush.x;\r
      brush.py = brush.y;\r
      const intro = drawView(s, now);\r
\r
      const busy =\r
        engaged || state.presence > 0.002 || bursts.length > 0 || now < state.trailUntil || (state.image && intro < 1);\r
      if (busy) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!raf && alive && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const image = new Image();\r
    image.crossOrigin = 'anonymous';\r
    image.decoding = 'async';\r
    image.onload = () => {\r
      if (!alive) return;\r
      gl.bindTexture(gl.TEXTURE_2D, imageTexture);\r
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);\r
      gl.generateMipmap(gl.TEXTURE_2D);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);\r
      const sampler = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
      if (sampler) {\r
        try {\r
          const edge = measureEdge(sampler, image);\r
          state.matte = edge.matte;\r
          state.key = edge.plain ? 1 : 0;\r
        } catch {\r
          state.key = 0;\r
        }\r
      }\r
      state.image = image;\r
      state.introStart = performance.now();\r
      wake();\r
    };\r
    image.src = src;\r
\r
    const locatePointer = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      pointer.x = event.clientX - rect.left;\r
      pointer.y = event.clientY - rect.top;\r
      pointer.placed = true;\r
    };\r
    const onMove = (event: PointerEvent) => {\r
      locatePointer(event);\r
      if (!pointer.inside) {\r
        pointer.inside = true;\r
        pointer.fresh = true;\r
      }\r
      wake();\r
    };\r
    const onLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
    const onDown = (event: PointerEvent) => {\r
      onMove(event);\r
      if (!settingsRef.current.clickBurst || (event.pointerType === 'mouse' && event.button !== 0)) return;\r
      bursts.push({ x: pointer.x, y: pointer.y, start: performance.now() });\r
      if (bursts.length > MAX_BURSTS) bursts.shift();\r
    };\r
    const onVisibility = () => {\r
      last = 0;\r
      wake();\r
    };\r
\r
    container.addEventListener('pointermove', onMove, { passive: true });\r
    container.addEventListener('pointerenter', onMove, { passive: true });\r
    container.addEventListener('pointerdown', onDown, { passive: true });\r
    container.addEventListener('pointerleave', onLeave, { passive: true });\r
    container.addEventListener('pointercancel', onLeave, { passive: true });\r
    document.addEventListener('visibilitychange', onVisibility);\r
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
    resize();\r
\r
    wakeRef.current = () => {\r
      if (!raf && alive && visible) {\r
        drawView(settingsRef.current, performance.now());\r
        wake();\r
      }\r
    };\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      image.onload = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      container.removeEventListener('pointermove', onMove);\r
      container.removeEventListener('pointerenter', onMove);\r
      container.removeEventListener('pointerdown', onDown);\r
      container.removeEventListener('pointerleave', onLeave);\r
      container.removeEventListener('pointercancel', onLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      masks.forEach(destroyMask);\r
      gl.deleteTexture(imageTexture);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(maskProgram);\r
      gl.deleteProgram(viewProgram);\r
    };\r
  }, [src]);\r
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
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default HalftoneReveal;\r
`,o={usage:`import HalftoneReveal from './HalftoneReveal';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <HalftoneReveal
    src="https://images.unsplash.com/photo-1693250707557-a846a014b321?q=80&w=1400&auto=format&fit=crop"
    mode="mono"
    shape="dot"
    cellSize={6}
    angle={45}
    inkColor="#120f17"
    paperColor="#ffffff"
    revealRadius={160}
  />
</div>`,code:r,css:n,tailwind:e,tsCode:t,tsTailwind:a};export{o as halftoneReveal};
