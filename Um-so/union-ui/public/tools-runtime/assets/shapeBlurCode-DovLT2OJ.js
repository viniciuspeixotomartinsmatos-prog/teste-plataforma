const r=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
import './ShapeBlur.css';\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const SHAPE = \`#version 300 es\r
precision highp float;\r
uniform vec2 uResolution;\r
uniform float uDpr;\r
uniform int uShape;\r
uniform float uSides;\r
uniform vec2 uHalf;\r
uniform float uRadius;\r
uniform float uRound;\r
uniform sampler2D uFieldTexture;\r
uniform vec2 uField;\r
uniform float uThickness;\r
uniform float uFill;\r
uniform float uEchoes;\r
uniform float uSpacing;\r
uniform float uAngle;\r
out vec4 outColor;\r
\r
const float PI = 3.14159265;\r
\r
float sdRoundBox(vec2 p, vec2 b, float r) {\r
  vec2 q = abs(p) - b + r;\r
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;\r
}\r
\r
float sdPolygon(vec2 p, float r, float n) {\r
  float an = PI / n;\r
  vec2 acs = vec2(cos(an), sin(an));\r
  float bn = mod(atan(p.x, p.y), 2.0 * an) - an;\r
  p = length(p) * vec2(cos(bn), abs(sin(bn)));\r
  p -= r * acs;\r
  p.y += clamp(-p.y, 0.0, r * acs.y);\r
  return length(p) * sign(p.x);\r
}\r
\r
float sdStar(vec2 p, float r, float n, float m) {\r
  float an = PI / n;\r
  float en = PI / m;\r
  vec2 acs = vec2(cos(an), sin(an));\r
  vec2 ecs = vec2(cos(en), sin(en));\r
  float bn = mod(atan(p.x, p.y), 2.0 * an) - an;\r
  p = length(p) * vec2(cos(bn), abs(sin(bn)));\r
  p -= r * acs;\r
  p += ecs * clamp(-dot(p, ecs), 0.0, r * acs.y / ecs.y);\r
  return length(p) * sign(p.x);\r
}\r
\r
float shapeDistance(vec2 p) {\r
  if (uShape < 0) return 1e5;\r
  float c = cos(uAngle);\r
  float s = sin(uAngle);\r
  p = mat2(c, -s, s, c) * p;\r
  if (uShape == 0) return sdRoundBox(p, uHalf, uRound);\r
  if (uShape == 1) return length(p) - uRadius;\r
  if (uShape == 2) return sdPolygon(p, uRadius - uRound, uSides) - uRound;\r
  if (uShape == 3) return sdStar(p, uRadius - uRound, uSides, mix(2.0, uSides, 0.42)) - uRound;\r
  vec2 uv = p / (2.0 * uField.x) + 0.5;\r
  vec2 inside = clamp(uv, 0.0, 1.0);\r
  float d = texture(uFieldTexture, vec2(inside.x, 1.0 - inside.y)).r * uField.y;\r
  return d + length((uv - inside) * 2.0 * uField.x);\r
}\r
\r
void main() {\r
  vec2 p = gl_FragCoord.xy / uDpr - 0.5 * uResolution;\r
  float d = shapeDistance(p);\r
  float aa = 1.0 / uDpr;\r
  float hw = 0.5 * uThickness;\r
  float cover = uFill > 0.5 ? clamp(0.5 - d / aa, 0.0, 1.0) : 0.0;\r
  for (int i = 0; i < 24; i++) {\r
    if (float(i) >= uEchoes) break;\r
    if (uFill > 0.5 && i == 0) continue;\r
    float x = uFill > 0.5 ? d - float(i) * uSpacing : d + float(i) * uSpacing;\r
    cover = max(cover, clamp((hw - abs(x)) / aa + 0.5, 0.0, 1.0));\r
  }\r
  outColor = vec4(cover, 0.0, 0.0, 1.0);\r
}\`;\r
\r
const BLUR = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uSource;\r
uniform float uLod;\r
uniform vec2 uStep;\r
uniform vec2 uScale;\r
out vec4 outColor;\r
\r
void main() {\r
  vec2 size = vec2(textureSize(uSource, int(uLod)));\r
  vec2 center = gl_FragCoord.xy * uScale;\r
  float sum = textureLod(uSource, center / size, uLod).r * 6.0;\r
  sum += textureLod(uSource, (center - uStep) / size, uLod).r * 4.0;\r
  sum += textureLod(uSource, (center + uStep) / size, uLod).r * 4.0;\r
  sum += textureLod(uSource, (center - 2.0 * uStep) / size, uLod).r;\r
  sum += textureLod(uSource, (center + 2.0 * uStep) / size, uLod).r;\r
  outColor = vec4(sum / 16.0, 0.0, 0.0, 1.0);\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uPyramid;\r
uniform float uMaxLod;\r
uniform vec2 uResolution;\r
uniform float uDpr;\r
uniform float uThickness;\r
uniform float uFill;\r
uniform float uEchoes;\r
uniform float uSpacing;\r
uniform vec3 uColor;\r
uniform float uBackdrop;\r
uniform float uBlur;\r
uniform vec3 uLens;\r
uniform vec2 uLensShape;\r
uniform float uFocus;\r
uniform float uChroma;\r
out vec4 outColor;\r
\r
float bspline(vec2 uv, float lod) {\r
  vec2 size = vec2(textureSize(uPyramid, int(lod)));\r
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
  vec2 p0 = (i - 0.5 + w1 / g0) / size;\r
  vec2 p1 = (i + 1.5 + w3 / g1) / size;\r
  float a = textureLod(uPyramid, p0, lod).r;\r
  float b = textureLod(uPyramid, vec2(p1.x, p0.y), lod).r;\r
  float c = textureLod(uPyramid, vec2(p0.x, p1.y), lod).r;\r
  float d = textureLod(uPyramid, p1, lod).r;\r
  return g0.y * (g0.x * a + g1.x * b) + g1.y * (g0.x * c + g1.x * d);\r
}\r
\r
float blurred(vec2 uv, float sigma) {\r
  if (sigma <= 0.6) return textureLod(uPyramid, uv, 0.0).r;\r
  float lod = sigma < 1.7 ? (sigma - 0.6) / 1.1 : log2(sigma / 0.866);\r
  lod = clamp(lod, 0.0, uMaxLod);\r
  float base = floor(lod);\r
  float t = lod - base;\r
  float a = base < 0.5 ? textureLod(uPyramid, uv, 0.0).r : bspline(uv, base);\r
  if (t < 0.001) return a;\r
  return mix(a, bspline(uv, min(base + 1.0, uMaxLod)), t);\r
}\r
\r
void main() {\r
  vec2 texel = 1.0 / vec2(textureSize(uPyramid, 0));\r
  vec2 uv = gl_FragCoord.xy * texel;\r
  vec2 p = gl_FragCoord.xy / uDpr - 0.5 * uResolution;\r
  vec2 toLens = p - uLens.xy;\r
  float lensDistance = length(toLens);\r
  float lens = uLens.z * (1.0 - smoothstep(uLensShape.x * (1.0 - uLensShape.y), uLensShape.x, lensDistance));\r
  float amount = mix(lens, 1.0 - lens, uFocus);\r
  float sigma = uBlur * amount * uDpr;\r
  vec2 dir = lensDistance > 0.001 ? toLens / lensDistance : vec2(0.0);\r
  vec2 split = dir * uChroma * 0.3 * sigma * texel;\r
  vec3 cover = vec3(\r
    blurred(uv - split, sigma * (1.0 + uChroma * 0.25)),\r
    blurred(uv, sigma),\r
    blurred(uv + split, sigma * (1.0 - uChroma * 0.2))\r
  );\r
  if (uFill < 0.5) {\r
    float spread = sigma / uDpr;\r
    float reach = uEchoes > 1.5 ? min(spread, uSpacing) : spread;\r
    cover *= 1.0 + 0.6 * max(reach - 0.5, 0.0) / max(uThickness, 0.5);\r
  }\r
  cover = mix(cover, 0.85 + 0.15 * (1.0 - exp((0.85 - cover) / 0.15)), step(0.85, cover));\r
  float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;\r
  cover = clamp(cover + grain / 255.0, 0.0, 1.0);\r
  float alpha = max(max(cover.r, cover.g), cover.b);\r
  outColor = vec4(uColor * cover + (alpha - cover) * uBackdrop, alpha);\r
}\`;\r
\r
const SHAPES = ['rect', 'circle', 'polygon', 'star'];\r
const FIELD = 512;\r
const PAD = 0.35;\r
const FAR = 1e20;\r
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
const link = (gl, vertex, source) => {\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, source);\r
  const program = gl.createProgram();\r
  if (!fragment || !program) return null;\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
  gl.bindAttribLocation(program, 0, 'aPosition');\r
  gl.linkProgram(program);\r
  gl.deleteShader(fragment);\r
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;\r
  gl.deleteProgram(program);\r
  return null;\r
};\r
\r
const locate = (gl, program, names) => {\r
  const map = {};\r
  for (const name of names) map[name] = gl.getUniformLocation(program, name);\r
  return map;\r
};\r
\r
const sweep = (grid, offset, stride, length, f, v, z) => {\r
  for (let q = 0; q < length; q++) f[q] = grid[offset + q * stride];\r
  let k = 0;\r
  v[0] = 0;\r
  z[0] = -FAR;\r
  z[1] = FAR;\r
  for (let q = 1; q < length; q++) {\r
    let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * (q - v[k]));\r
    while (s <= z[k]) {\r
      k--;\r
      s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * (q - v[k]));\r
    }\r
    k++;\r
    v[k] = q;\r
    z[k] = s;\r
    z[k + 1] = FAR;\r
  }\r
  k = 0;\r
  for (let q = 0; q < length; q++) {\r
    while (z[k + 1] < q) k++;\r
    const gap = q - v[k];\r
    grid[offset + q * stride] = gap * gap + f[v[k]];\r
  }\r
};\r
\r
const distanceTransform = (grid, size) => {\r
  const f = new Float64Array(size);\r
  const v = new Int32Array(size);\r
  const z = new Float64Array(size + 1);\r
  for (let x = 0; x < size; x++) sweep(grid, x, size, size, f, v, z);\r
  for (let y = 0; y < size; y++) sweep(grid, y * size, 1, size, f, v, z);\r
};\r
\r
const buildField = image => {\r
  const raster = document.createElement('canvas');\r
  raster.width = FIELD;\r
  raster.height = FIELD;\r
  const ctx = raster.getContext('2d', { willReadFrequently: true });\r
  if (!ctx) return null;\r
  const width = image.naturalWidth || FIELD;\r
  const height = image.naturalHeight || FIELD;\r
  const scale = FIELD / (1 + PAD) / Math.max(width, height);\r
  ctx.drawImage(image, (FIELD - width * scale) / 2, (FIELD - height * scale) / 2, width * scale, height * scale);\r
  const pixels = ctx.getImageData(0, 0, FIELD, FIELD).data;\r
  const outside = new Float64Array(FIELD * FIELD);\r
  const inside = new Float64Array(FIELD * FIELD);\r
  for (let i = 0; i < FIELD * FIELD; i++) {\r
    const alpha = pixels[i * 4 + 3] / 255;\r
    const edge = 0.5 - alpha;\r
    outside[i] = alpha >= 0.999 ? 0 : alpha <= 0.001 ? FAR : edge > 0 ? edge * edge : 0;\r
    inside[i] = alpha >= 0.999 ? FAR : alpha <= 0.001 ? 0 : edge < 0 ? edge * edge : 0;\r
  }\r
  distanceTransform(outside, FIELD);\r
  distanceTransform(inside, FIELD);\r
  const field = new Float32Array(FIELD * FIELD);\r
  for (let i = 0; i < FIELD * FIELD; i++) field[i] = Math.sqrt(outside[i]) - Math.sqrt(inside[i]);\r
  return field;\r
};\r
\r
const ShapeBlur = ({\r
  shape = 'rect',\r
  src,\r
  sides = 6,\r
  size = 0.8,\r
  roundness = 0.2,\r
  thickness = 2,\r
  fill = false,\r
  echoes = 1,\r
  spacing = 12,\r
  color = '#ffffff',\r
  blur = 16,\r
  lensSize = 0.3,\r
  lensSoftness = 0.7,\r
  focus = false,\r
  chroma = 0.3,\r
  rotation = 0,\r
  spin = 0,\r
  idle = true,\r
  children,\r
  className = '',\r
  style\r
}) => {\r
  const rootRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const controlRef = useRef(null);\r
  const settings = {\r
    shape: Math.max(0, SHAPES.indexOf(shape)),\r
    src: src || '',\r
    sides: clamp(Math.round(sides), 3, 12),\r
    size: clamp(size, 0.05, 1),\r
    roundness: clamp(roundness, 0, 1),\r
    thickness: clamp(thickness, 0.5, 40),\r
    fill,\r
    echoes: clamp(Math.round(echoes), 1, 24),\r
    spacing: Math.max(1, spacing),\r
    color,\r
    blur: Math.max(0, blur),\r
    lensSize: clamp(lensSize, 0.02, 2),\r
    lensSoftness: clamp(lensSoftness, 0, 1),\r
    focus,\r
    chroma: clamp(chroma, 0, 1),\r
    rotation,\r
    spin,\r
    idle\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    const canvas = canvasRef.current;\r
    const gl = canvas?.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });\r
    if (!root || !canvas || !gl) return undefined;\r
\r
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
    if (!vertex) return undefined;\r
    const shapeProgram = link(gl, vertex, SHAPE);\r
    const blurProgram = link(gl, vertex, BLUR);\r
    const compositeProgram = link(gl, vertex, COMPOSITE);\r
    if (!shapeProgram || !blurProgram || !compositeProgram) return undefined;\r
\r
    const shapeUniforms = locate(gl, shapeProgram, [\r
      'uResolution',\r
      'uDpr',\r
      'uShape',\r
      'uSides',\r
      'uHalf',\r
      'uRadius',\r
      'uRound',\r
      'uFieldTexture',\r
      'uField',\r
      'uThickness',\r
      'uFill',\r
      'uEchoes',\r
      'uSpacing',\r
      'uAngle'\r
    ]);\r
    const blurUniforms = locate(gl, blurProgram, ['uSource', 'uLod', 'uStep', 'uScale']);\r
    const compositeUniforms = locate(gl, compositeProgram, [\r
      'uPyramid',\r
      'uMaxLod',\r
      'uResolution',\r
      'uDpr',\r
      'uThickness',\r
      'uFill',\r
      'uEchoes',\r
      'uSpacing',\r
      'uColor',\r
      'uBackdrop',\r
      'uBlur',\r
      'uLens',\r
      'uLensShape',\r
      'uFocus',\r
      'uChroma'\r
    ]);\r
\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    const buffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const precise = Boolean(gl.getExtension('EXT_color_buffer_float'));\r
    const format = precise ? gl.R16F : gl.R8;\r
    const framebuffer = gl.createFramebuffer();\r
\r
    const fieldTexture = gl.createTexture();\r
    gl.activeTexture(gl.TEXTURE0);\r
    gl.bindTexture(gl.TEXTURE_2D, fieldTexture);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, 1, 1, 0, gl.RED, gl.FLOAT, new Float32Array([1e4]));\r
\r
    const probe = document.createElement('canvas');\r
    probe.width = 1;\r
    probe.height = 1;\r
    const probeCtx = probe.getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const pointer = { x: 0, y: 0, active: false };\r
    const lens = { x: 0, y: 0, power: 0, placed: false };\r
    const pyramid = { texture: null, temps: [], sizes: [], levels: 0, key: '' };\r
    const state = {\r
      width: 1,\r
      height: 1,\r
      dpr: 1,\r
      time: 0,\r
      angle: 0,\r
      color: [1, 1, 1],\r
      backdrop: 0,\r
      colorKey: '',\r
      image: 'none',\r
      request: 0\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let alive = true;\r
\r
    const allocate = () => {\r
      if (pyramid.texture) gl.deleteTexture(pyramid.texture);\r
      pyramid.temps.forEach(texture => gl.deleteTexture(texture));\r
      const width = canvas.width;\r
      const height = canvas.height;\r
      pyramid.levels = Math.min(10, Math.floor(Math.log2(Math.max(width, height))) + 1);\r
      pyramid.sizes = [];\r
      for (let k = 0; k < pyramid.levels; k++) {\r
        pyramid.sizes.push([Math.max(1, width >> k), Math.max(1, height >> k)]);\r
      }\r
      const configure = () => {\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      };\r
      pyramid.texture = gl.createTexture();\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, pyramid.texture);\r
      gl.texStorage2D(gl.TEXTURE_2D, pyramid.levels, format, width, height);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);\r
      configure();\r
      pyramid.temps = [null];\r
      for (let k = 1; k < pyramid.levels; k++) {\r
        const texture = gl.createTexture();\r
        gl.bindTexture(gl.TEXTURE_2D, texture);\r
        gl.texStorage2D(gl.TEXTURE_2D, 1, format, pyramid.sizes[k][0], pyramid.sizes[k - 1][1]);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
        configure();\r
        pyramid.temps.push(texture);\r
      }\r
      pyramid.key = '';\r
    };\r
\r
    const resolveColor = value => {\r
      if (value === state.colorKey) return;\r
      state.colorKey = value;\r
      canvas.style.color = value;\r
      const computed = getComputedStyle(canvas).color;\r
      canvas.style.color = '';\r
      if (!probeCtx) return;\r
      probeCtx.clearRect(0, 0, 1, 1);\r
      probeCtx.fillStyle = computed;\r
      probeCtx.fillRect(0, 0, 1, 1);\r
      const [r, g, b] = probeCtx.getImageData(0, 0, 1, 1).data;\r
      state.color = [r / 255, g / 255, b / 255];\r
      state.backdrop = 0.2126 * state.color[0] + 0.7152 * state.color[1] + 0.0722 * state.color[2] < 0.5 ? 1 : 0;\r
    };\r
\r
    const wander = t => {\r
      const s = settingsRef.current;\r
      const minHalf = Math.min(state.width, state.height) / 2;\r
      const inset = (1 - s.size) * minHalf;\r
      const reachX = s.shape === 0 && !s.src ? state.width / 2 - inset : s.size * minHalf;\r
      const reachY = s.shape === 0 && !s.src ? state.height / 2 - inset : s.size * minHalf;\r
      return [\r
        reachX * (0.75 * Math.sin(t * 0.37) + 0.2 * Math.sin(t * 1.13 + 1.7)),\r
        reachY * (0.7 * Math.sin(t * 0.53 + 0.9) + 0.2 * Math.cos(t * 0.91 + 0.4))\r
      ];\r
    };\r
\r
    const drawShape = s => {\r
      const { width, height } = state;\r
      const minHalf = Math.min(width, height) / 2;\r
      const inset = (1 - s.size) * minHalf;\r
      const halfX = Math.max(1, width / 2 - inset);\r
      const halfY = Math.max(1, height / 2 - inset);\r
      const radius = s.size * minHalf;\r
      const fieldHalf = radius * (1 + PAD);\r
      let shapeIndex = s.shape;\r
      if (s.src) shapeIndex = state.image === 'ready' ? 4 : state.image === 'failed' ? s.shape : -1;\r
      const round =\r
        shapeIndex === 0\r
          ? s.roundness * Math.min(halfX, halfY)\r
          : s.roundness * radius * (shapeIndex === 3 ? 0.12 : 0.3);\r
      const angle = ((s.rotation + state.angle) * Math.PI) / 180;\r
      const key = [\r
        canvas.width,\r
        canvas.height,\r
        shapeIndex,\r
        s.sides,\r
        halfX,\r
        halfY,\r
        radius,\r
        round,\r
        s.thickness,\r
        s.fill,\r
        s.echoes,\r
        s.spacing,\r
        angle.toFixed(5)\r
      ].join('|');\r
      if (key === pyramid.key) return;\r
      pyramid.key = key;\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, pyramid.texture, 0);\r
      gl.viewport(0, 0, pyramid.sizes[0][0], pyramid.sizes[0][1]);\r
      gl.useProgram(shapeProgram);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, fieldTexture);\r
      gl.uniform1i(shapeUniforms.uFieldTexture, 0);\r
      gl.uniform2f(shapeUniforms.uResolution, width, height);\r
      gl.uniform1f(shapeUniforms.uDpr, state.dpr);\r
      gl.uniform1i(shapeUniforms.uShape, shapeIndex);\r
      gl.uniform1f(shapeUniforms.uSides, s.sides);\r
      gl.uniform2f(shapeUniforms.uHalf, halfX, halfY);\r
      gl.uniform1f(shapeUniforms.uRadius, radius);\r
      gl.uniform1f(shapeUniforms.uRound, round);\r
      gl.uniform2f(shapeUniforms.uField, fieldHalf, (2 * fieldHalf) / FIELD);\r
      gl.uniform1f(shapeUniforms.uThickness, s.thickness);\r
      gl.uniform1f(shapeUniforms.uFill, s.fill ? 1 : 0);\r
      gl.uniform1f(shapeUniforms.uEchoes, s.echoes);\r
      gl.uniform1f(shapeUniforms.uSpacing, s.spacing);\r
      gl.uniform1f(shapeUniforms.uAngle, angle);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      gl.useProgram(blurProgram);\r
      gl.uniform1i(blurUniforms.uSource, 0);\r
      for (let k = 1; k < pyramid.levels; k++) {\r
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, pyramid.temps[k], 0);\r
        gl.viewport(0, 0, pyramid.sizes[k][0], pyramid.sizes[k - 1][1]);\r
        gl.bindTexture(gl.TEXTURE_2D, pyramid.texture);\r
        gl.uniform1f(blurUniforms.uLod, k - 1);\r
        gl.uniform2f(blurUniforms.uStep, 1, 0);\r
        gl.uniform2f(blurUniforms.uScale, 2, 1);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, pyramid.texture, k);\r
        gl.viewport(0, 0, pyramid.sizes[k][0], pyramid.sizes[k][1]);\r
        gl.bindTexture(gl.TEXTURE_2D, pyramid.temps[k]);\r
        gl.uniform1f(blurUniforms.uLod, 0);\r
        gl.uniform2f(blurUniforms.uStep, 0, 1);\r
        gl.uniform2f(blurUniforms.uScale, 1, 2);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      }\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      if (!pyramid.texture) return;\r
      resolveColor(s.color);\r
      gl.bindVertexArray(vao);\r
      gl.disable(gl.BLEND);\r
      drawShape(s);\r
\r
      const { width, height } = state;\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(compositeProgram);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, pyramid.texture);\r
      gl.uniform1i(compositeUniforms.uPyramid, 0);\r
      gl.uniform1f(compositeUniforms.uMaxLod, pyramid.levels - 1);\r
      gl.uniform2f(compositeUniforms.uResolution, width, height);\r
      gl.uniform1f(compositeUniforms.uDpr, state.dpr);\r
      gl.uniform1f(compositeUniforms.uThickness, s.thickness);\r
      gl.uniform1f(compositeUniforms.uFill, s.fill ? 1 : 0);\r
      gl.uniform1f(compositeUniforms.uEchoes, s.echoes);\r
      gl.uniform1f(compositeUniforms.uSpacing, s.spacing);\r
      gl.uniform3f(compositeUniforms.uColor, state.color[0], state.color[1], state.color[2]);\r
      gl.uniform1f(compositeUniforms.uBackdrop, state.backdrop);\r
      gl.uniform1f(compositeUniforms.uBlur, s.blur);\r
      gl.uniform3f(compositeUniforms.uLens, lens.x, lens.y, lens.power);\r
      gl.uniform2f(compositeUniforms.uLensShape, s.lensSize * Math.min(width, height), s.lensSoftness);\r
      gl.uniform1f(compositeUniforms.uFocus, s.focus ? 1 : 0);\r
      gl.uniform1f(compositeUniforms.uChroma, s.chroma);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!alive || !visible) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      state.time += dt;\r
      if (!reduce) state.angle = (state.angle + s.spin * dt) % 360;\r
\r
      const drifting = !pointer.active && s.idle && !reduce;\r
      let targetX = lens.x;\r
      let targetY = lens.y;\r
      let targetPower = 0;\r
      if (pointer.active) {\r
        targetX = pointer.x;\r
        targetY = pointer.y;\r
        targetPower = 1;\r
      } else if (drifting) {\r
        [targetX, targetY] = wander(state.time);\r
        targetPower = 0.85;\r
      }\r
      if (!lens.placed) {\r
        lens.x = targetX;\r
        lens.y = targetY;\r
        lens.placed = true;\r
      }\r
      const follow = 1 - Math.exp(-dt * (pointer.active ? 10 : 3));\r
      lens.x += (targetX - lens.x) * follow;\r
      lens.y += (targetY - lens.y) * follow;\r
      lens.power += (targetPower - lens.power) * (1 - Math.exp(-dt * 4));\r
\r
      render();\r
\r
      const settled =\r
        Math.abs(targetX - lens.x) < 0.1 &&\r
        Math.abs(targetY - lens.y) < 0.1 &&\r
        Math.abs(targetPower - lens.power) < 0.002;\r
      if (!settled || drifting || (s.spin && !reduce)) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (raf || !alive || !visible) return;\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const load = value => {\r
      const request = ++state.request;\r
      state.image = value ? 'loading' : 'none';\r
      wake();\r
      if (!value) return;\r
      const image = new Image();\r
      image.crossOrigin = 'anonymous';\r
      image.onload = () => {\r
        if (!alive || request !== state.request) return;\r
        let field = null;\r
        try {\r
          field = buildField(image);\r
        } catch {\r
          field = null;\r
        }\r
        if (!field) {\r
          state.image = 'failed';\r
          wake();\r
          return;\r
        }\r
        gl.activeTexture(gl.TEXTURE0);\r
        gl.bindTexture(gl.TEXTURE_2D, fieldTexture);\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, FIELD, FIELD, 0, gl.RED, gl.FLOAT, field);\r
        state.image = 'ready';\r
        wake();\r
      };\r
      image.onerror = () => {\r
        if (!alive || request !== state.request) return;\r
        state.image = 'failed';\r
        wake();\r
      };\r
      image.src = value;\r
    };\r
\r
    const onPointerMove = event => {\r
      const rect = root.getBoundingClientRect();\r
      const margin = settingsRef.current.lensSize * Math.min(rect.width, rect.height);\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      pointer.active = x > -margin && y > -margin && x < rect.width + margin && y < rect.height + margin;\r
      pointer.x = x - rect.width / 2;\r
      pointer.y = rect.height / 2 - y;\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.active = false;\r
      wake();\r
    };\r
\r
    const resize = () => {\r
      state.dpr = Math.min(window.devicePixelRatio || 1, 2);\r
      state.width = Math.max(1, root.clientWidth);\r
      state.height = Math.max(1, root.clientHeight);\r
      canvas.width = Math.round(state.width * state.dpr);\r
      canvas.height = Math.round(state.height * state.dpr);\r
      allocate();\r
      render();\r
      wake();\r
    };\r
\r
    controlRef.current = { load, wake };\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(root);\r
    const visibility = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible) {\r
        last = 0;\r
        wake();\r
      }\r
    });\r
    visibility.observe(root);\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    resize();\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      controlRef.current = null;\r
      resizeObserver.disconnect();\r
      visibility.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      if (pyramid.texture) gl.deleteTexture(pyramid.texture);\r
      pyramid.temps.forEach(texture => gl.deleteTexture(texture));\r
      gl.deleteTexture(fieldTexture);\r
      gl.deleteFramebuffer(framebuffer);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(shapeProgram);\r
      gl.deleteProgram(blurProgram);\r
      gl.deleteProgram(compositeProgram);\r
      gl.deleteShader(vertex);\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    controlRef.current?.load(src || '');\r
  }, [src]);\r
\r
  useEffect(() => {\r
    controlRef.current?.wake();\r
  });\r
\r
  return (\r
    <div ref={rootRef} className={\`shape-blur\${className ? \` \${className}\` : ''}\`} style={style}>\r
      <canvas ref={canvasRef} className="shape-blur__canvas" aria-hidden="true" />\r
      {children && <div className="shape-blur__content">{children}</div>}\r
    </div>\r
  );\r
};\r
\r
export default ShapeBlur;\r
`,n=`.shape-blur {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
}\r
\r
.shape-blur__canvas {\r
  position: absolute;\r
  inset: 0;\r
  display: block;\r
  width: 100%;\r
  height: 100%;\r
  pointer-events: none;\r
}\r
\r
.shape-blur__content {\r
  position: relative;\r
  z-index: 1;\r
  display: flex;\r
  align-items: center;\r
  justify-content: center;\r
  width: 100%;\r
  height: 100%;\r
}\r
`,e=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
const ROOT = 'relative h-full w-full';\r
const CANVAS = 'pointer-events-none absolute inset-0 block h-full w-full';\r
const CONTENT = 'relative z-[1] flex h-full w-full items-center justify-center';\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const SHAPE = \`#version 300 es\r
precision highp float;\r
uniform vec2 uResolution;\r
uniform float uDpr;\r
uniform int uShape;\r
uniform float uSides;\r
uniform vec2 uHalf;\r
uniform float uRadius;\r
uniform float uRound;\r
uniform sampler2D uFieldTexture;\r
uniform vec2 uField;\r
uniform float uThickness;\r
uniform float uFill;\r
uniform float uEchoes;\r
uniform float uSpacing;\r
uniform float uAngle;\r
out vec4 outColor;\r
\r
const float PI = 3.14159265;\r
\r
float sdRoundBox(vec2 p, vec2 b, float r) {\r
  vec2 q = abs(p) - b + r;\r
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;\r
}\r
\r
float sdPolygon(vec2 p, float r, float n) {\r
  float an = PI / n;\r
  vec2 acs = vec2(cos(an), sin(an));\r
  float bn = mod(atan(p.x, p.y), 2.0 * an) - an;\r
  p = length(p) * vec2(cos(bn), abs(sin(bn)));\r
  p -= r * acs;\r
  p.y += clamp(-p.y, 0.0, r * acs.y);\r
  return length(p) * sign(p.x);\r
}\r
\r
float sdStar(vec2 p, float r, float n, float m) {\r
  float an = PI / n;\r
  float en = PI / m;\r
  vec2 acs = vec2(cos(an), sin(an));\r
  vec2 ecs = vec2(cos(en), sin(en));\r
  float bn = mod(atan(p.x, p.y), 2.0 * an) - an;\r
  p = length(p) * vec2(cos(bn), abs(sin(bn)));\r
  p -= r * acs;\r
  p += ecs * clamp(-dot(p, ecs), 0.0, r * acs.y / ecs.y);\r
  return length(p) * sign(p.x);\r
}\r
\r
float shapeDistance(vec2 p) {\r
  if (uShape < 0) return 1e5;\r
  float c = cos(uAngle);\r
  float s = sin(uAngle);\r
  p = mat2(c, -s, s, c) * p;\r
  if (uShape == 0) return sdRoundBox(p, uHalf, uRound);\r
  if (uShape == 1) return length(p) - uRadius;\r
  if (uShape == 2) return sdPolygon(p, uRadius - uRound, uSides) - uRound;\r
  if (uShape == 3) return sdStar(p, uRadius - uRound, uSides, mix(2.0, uSides, 0.42)) - uRound;\r
  vec2 uv = p / (2.0 * uField.x) + 0.5;\r
  vec2 inside = clamp(uv, 0.0, 1.0);\r
  float d = texture(uFieldTexture, vec2(inside.x, 1.0 - inside.y)).r * uField.y;\r
  return d + length((uv - inside) * 2.0 * uField.x);\r
}\r
\r
void main() {\r
  vec2 p = gl_FragCoord.xy / uDpr - 0.5 * uResolution;\r
  float d = shapeDistance(p);\r
  float aa = 1.0 / uDpr;\r
  float hw = 0.5 * uThickness;\r
  float cover = uFill > 0.5 ? clamp(0.5 - d / aa, 0.0, 1.0) : 0.0;\r
  for (int i = 0; i < 24; i++) {\r
    if (float(i) >= uEchoes) break;\r
    if (uFill > 0.5 && i == 0) continue;\r
    float x = uFill > 0.5 ? d - float(i) * uSpacing : d + float(i) * uSpacing;\r
    cover = max(cover, clamp((hw - abs(x)) / aa + 0.5, 0.0, 1.0));\r
  }\r
  outColor = vec4(cover, 0.0, 0.0, 1.0);\r
}\`;\r
\r
const BLUR = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uSource;\r
uniform float uLod;\r
uniform vec2 uStep;\r
uniform vec2 uScale;\r
out vec4 outColor;\r
\r
void main() {\r
  vec2 size = vec2(textureSize(uSource, int(uLod)));\r
  vec2 center = gl_FragCoord.xy * uScale;\r
  float sum = textureLod(uSource, center / size, uLod).r * 6.0;\r
  sum += textureLod(uSource, (center - uStep) / size, uLod).r * 4.0;\r
  sum += textureLod(uSource, (center + uStep) / size, uLod).r * 4.0;\r
  sum += textureLod(uSource, (center - 2.0 * uStep) / size, uLod).r;\r
  sum += textureLod(uSource, (center + 2.0 * uStep) / size, uLod).r;\r
  outColor = vec4(sum / 16.0, 0.0, 0.0, 1.0);\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uPyramid;\r
uniform float uMaxLod;\r
uniform vec2 uResolution;\r
uniform float uDpr;\r
uniform float uThickness;\r
uniform float uFill;\r
uniform float uEchoes;\r
uniform float uSpacing;\r
uniform vec3 uColor;\r
uniform float uBackdrop;\r
uniform float uBlur;\r
uniform vec3 uLens;\r
uniform vec2 uLensShape;\r
uniform float uFocus;\r
uniform float uChroma;\r
out vec4 outColor;\r
\r
float bspline(vec2 uv, float lod) {\r
  vec2 size = vec2(textureSize(uPyramid, int(lod)));\r
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
  vec2 p0 = (i - 0.5 + w1 / g0) / size;\r
  vec2 p1 = (i + 1.5 + w3 / g1) / size;\r
  float a = textureLod(uPyramid, p0, lod).r;\r
  float b = textureLod(uPyramid, vec2(p1.x, p0.y), lod).r;\r
  float c = textureLod(uPyramid, vec2(p0.x, p1.y), lod).r;\r
  float d = textureLod(uPyramid, p1, lod).r;\r
  return g0.y * (g0.x * a + g1.x * b) + g1.y * (g0.x * c + g1.x * d);\r
}\r
\r
float blurred(vec2 uv, float sigma) {\r
  if (sigma <= 0.6) return textureLod(uPyramid, uv, 0.0).r;\r
  float lod = sigma < 1.7 ? (sigma - 0.6) / 1.1 : log2(sigma / 0.866);\r
  lod = clamp(lod, 0.0, uMaxLod);\r
  float base = floor(lod);\r
  float t = lod - base;\r
  float a = base < 0.5 ? textureLod(uPyramid, uv, 0.0).r : bspline(uv, base);\r
  if (t < 0.001) return a;\r
  return mix(a, bspline(uv, min(base + 1.0, uMaxLod)), t);\r
}\r
\r
void main() {\r
  vec2 texel = 1.0 / vec2(textureSize(uPyramid, 0));\r
  vec2 uv = gl_FragCoord.xy * texel;\r
  vec2 p = gl_FragCoord.xy / uDpr - 0.5 * uResolution;\r
  vec2 toLens = p - uLens.xy;\r
  float lensDistance = length(toLens);\r
  float lens = uLens.z * (1.0 - smoothstep(uLensShape.x * (1.0 - uLensShape.y), uLensShape.x, lensDistance));\r
  float amount = mix(lens, 1.0 - lens, uFocus);\r
  float sigma = uBlur * amount * uDpr;\r
  vec2 dir = lensDistance > 0.001 ? toLens / lensDistance : vec2(0.0);\r
  vec2 split = dir * uChroma * 0.3 * sigma * texel;\r
  vec3 cover = vec3(\r
    blurred(uv - split, sigma * (1.0 + uChroma * 0.25)),\r
    blurred(uv, sigma),\r
    blurred(uv + split, sigma * (1.0 - uChroma * 0.2))\r
  );\r
  if (uFill < 0.5) {\r
    float spread = sigma / uDpr;\r
    float reach = uEchoes > 1.5 ? min(spread, uSpacing) : spread;\r
    cover *= 1.0 + 0.6 * max(reach - 0.5, 0.0) / max(uThickness, 0.5);\r
  }\r
  cover = mix(cover, 0.85 + 0.15 * (1.0 - exp((0.85 - cover) / 0.15)), step(0.85, cover));\r
  float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;\r
  cover = clamp(cover + grain / 255.0, 0.0, 1.0);\r
  float alpha = max(max(cover.r, cover.g), cover.b);\r
  outColor = vec4(uColor * cover + (alpha - cover) * uBackdrop, alpha);\r
}\`;\r
\r
const SHAPES = ['rect', 'circle', 'polygon', 'star'];\r
const FIELD = 512;\r
const PAD = 0.35;\r
const FAR = 1e20;\r
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
const link = (gl, vertex, source) => {\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, source);\r
  const program = gl.createProgram();\r
  if (!fragment || !program) return null;\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
  gl.bindAttribLocation(program, 0, 'aPosition');\r
  gl.linkProgram(program);\r
  gl.deleteShader(fragment);\r
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;\r
  gl.deleteProgram(program);\r
  return null;\r
};\r
\r
const locate = (gl, program, names) => {\r
  const map = {};\r
  for (const name of names) map[name] = gl.getUniformLocation(program, name);\r
  return map;\r
};\r
\r
const sweep = (grid, offset, stride, length, f, v, z) => {\r
  for (let q = 0; q < length; q++) f[q] = grid[offset + q * stride];\r
  let k = 0;\r
  v[0] = 0;\r
  z[0] = -FAR;\r
  z[1] = FAR;\r
  for (let q = 1; q < length; q++) {\r
    let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * (q - v[k]));\r
    while (s <= z[k]) {\r
      k--;\r
      s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * (q - v[k]));\r
    }\r
    k++;\r
    v[k] = q;\r
    z[k] = s;\r
    z[k + 1] = FAR;\r
  }\r
  k = 0;\r
  for (let q = 0; q < length; q++) {\r
    while (z[k + 1] < q) k++;\r
    const gap = q - v[k];\r
    grid[offset + q * stride] = gap * gap + f[v[k]];\r
  }\r
};\r
\r
const distanceTransform = (grid, size) => {\r
  const f = new Float64Array(size);\r
  const v = new Int32Array(size);\r
  const z = new Float64Array(size + 1);\r
  for (let x = 0; x < size; x++) sweep(grid, x, size, size, f, v, z);\r
  for (let y = 0; y < size; y++) sweep(grid, y * size, 1, size, f, v, z);\r
};\r
\r
const buildField = image => {\r
  const raster = document.createElement('canvas');\r
  raster.width = FIELD;\r
  raster.height = FIELD;\r
  const ctx = raster.getContext('2d', { willReadFrequently: true });\r
  if (!ctx) return null;\r
  const width = image.naturalWidth || FIELD;\r
  const height = image.naturalHeight || FIELD;\r
  const scale = FIELD / (1 + PAD) / Math.max(width, height);\r
  ctx.drawImage(image, (FIELD - width * scale) / 2, (FIELD - height * scale) / 2, width * scale, height * scale);\r
  const pixels = ctx.getImageData(0, 0, FIELD, FIELD).data;\r
  const outside = new Float64Array(FIELD * FIELD);\r
  const inside = new Float64Array(FIELD * FIELD);\r
  for (let i = 0; i < FIELD * FIELD; i++) {\r
    const alpha = pixels[i * 4 + 3] / 255;\r
    const edge = 0.5 - alpha;\r
    outside[i] = alpha >= 0.999 ? 0 : alpha <= 0.001 ? FAR : edge > 0 ? edge * edge : 0;\r
    inside[i] = alpha >= 0.999 ? FAR : alpha <= 0.001 ? 0 : edge < 0 ? edge * edge : 0;\r
  }\r
  distanceTransform(outside, FIELD);\r
  distanceTransform(inside, FIELD);\r
  const field = new Float32Array(FIELD * FIELD);\r
  for (let i = 0; i < FIELD * FIELD; i++) field[i] = Math.sqrt(outside[i]) - Math.sqrt(inside[i]);\r
  return field;\r
};\r
\r
const ShapeBlur = ({\r
  shape = 'rect',\r
  src,\r
  sides = 6,\r
  size = 0.8,\r
  roundness = 0.2,\r
  thickness = 2,\r
  fill = false,\r
  echoes = 1,\r
  spacing = 12,\r
  color = '#ffffff',\r
  blur = 16,\r
  lensSize = 0.3,\r
  lensSoftness = 0.7,\r
  focus = false,\r
  chroma = 0.3,\r
  rotation = 0,\r
  spin = 0,\r
  idle = true,\r
  children,\r
  className = '',\r
  style\r
}) => {\r
  const rootRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const controlRef = useRef(null);\r
  const settings = {\r
    shape: Math.max(0, SHAPES.indexOf(shape)),\r
    src: src || '',\r
    sides: clamp(Math.round(sides), 3, 12),\r
    size: clamp(size, 0.05, 1),\r
    roundness: clamp(roundness, 0, 1),\r
    thickness: clamp(thickness, 0.5, 40),\r
    fill,\r
    echoes: clamp(Math.round(echoes), 1, 24),\r
    spacing: Math.max(1, spacing),\r
    color,\r
    blur: Math.max(0, blur),\r
    lensSize: clamp(lensSize, 0.02, 2),\r
    lensSoftness: clamp(lensSoftness, 0, 1),\r
    focus,\r
    chroma: clamp(chroma, 0, 1),\r
    rotation,\r
    spin,\r
    idle\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    const canvas = canvasRef.current;\r
    const gl = canvas?.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });\r
    if (!root || !canvas || !gl) return undefined;\r
\r
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
    if (!vertex) return undefined;\r
    const shapeProgram = link(gl, vertex, SHAPE);\r
    const blurProgram = link(gl, vertex, BLUR);\r
    const compositeProgram = link(gl, vertex, COMPOSITE);\r
    if (!shapeProgram || !blurProgram || !compositeProgram) return undefined;\r
\r
    const shapeUniforms = locate(gl, shapeProgram, [\r
      'uResolution',\r
      'uDpr',\r
      'uShape',\r
      'uSides',\r
      'uHalf',\r
      'uRadius',\r
      'uRound',\r
      'uFieldTexture',\r
      'uField',\r
      'uThickness',\r
      'uFill',\r
      'uEchoes',\r
      'uSpacing',\r
      'uAngle'\r
    ]);\r
    const blurUniforms = locate(gl, blurProgram, ['uSource', 'uLod', 'uStep', 'uScale']);\r
    const compositeUniforms = locate(gl, compositeProgram, [\r
      'uPyramid',\r
      'uMaxLod',\r
      'uResolution',\r
      'uDpr',\r
      'uThickness',\r
      'uFill',\r
      'uEchoes',\r
      'uSpacing',\r
      'uColor',\r
      'uBackdrop',\r
      'uBlur',\r
      'uLens',\r
      'uLensShape',\r
      'uFocus',\r
      'uChroma'\r
    ]);\r
\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    const buffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const precise = Boolean(gl.getExtension('EXT_color_buffer_float'));\r
    const format = precise ? gl.R16F : gl.R8;\r
    const framebuffer = gl.createFramebuffer();\r
\r
    const fieldTexture = gl.createTexture();\r
    gl.activeTexture(gl.TEXTURE0);\r
    gl.bindTexture(gl.TEXTURE_2D, fieldTexture);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, 1, 1, 0, gl.RED, gl.FLOAT, new Float32Array([1e4]));\r
\r
    const probe = document.createElement('canvas');\r
    probe.width = 1;\r
    probe.height = 1;\r
    const probeCtx = probe.getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const pointer = { x: 0, y: 0, active: false };\r
    const lens = { x: 0, y: 0, power: 0, placed: false };\r
    const pyramid = { texture: null, temps: [], sizes: [], levels: 0, key: '' };\r
    const state = {\r
      width: 1,\r
      height: 1,\r
      dpr: 1,\r
      time: 0,\r
      angle: 0,\r
      color: [1, 1, 1],\r
      backdrop: 0,\r
      colorKey: '',\r
      image: 'none',\r
      request: 0\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let alive = true;\r
\r
    const allocate = () => {\r
      if (pyramid.texture) gl.deleteTexture(pyramid.texture);\r
      pyramid.temps.forEach(texture => gl.deleteTexture(texture));\r
      const width = canvas.width;\r
      const height = canvas.height;\r
      pyramid.levels = Math.min(10, Math.floor(Math.log2(Math.max(width, height))) + 1);\r
      pyramid.sizes = [];\r
      for (let k = 0; k < pyramid.levels; k++) {\r
        pyramid.sizes.push([Math.max(1, width >> k), Math.max(1, height >> k)]);\r
      }\r
      const configure = () => {\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      };\r
      pyramid.texture = gl.createTexture();\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, pyramid.texture);\r
      gl.texStorage2D(gl.TEXTURE_2D, pyramid.levels, format, width, height);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);\r
      configure();\r
      pyramid.temps = [null];\r
      for (let k = 1; k < pyramid.levels; k++) {\r
        const texture = gl.createTexture();\r
        gl.bindTexture(gl.TEXTURE_2D, texture);\r
        gl.texStorage2D(gl.TEXTURE_2D, 1, format, pyramid.sizes[k][0], pyramid.sizes[k - 1][1]);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
        configure();\r
        pyramid.temps.push(texture);\r
      }\r
      pyramid.key = '';\r
    };\r
\r
    const resolveColor = value => {\r
      if (value === state.colorKey) return;\r
      state.colorKey = value;\r
      canvas.style.color = value;\r
      const computed = getComputedStyle(canvas).color;\r
      canvas.style.color = '';\r
      if (!probeCtx) return;\r
      probeCtx.clearRect(0, 0, 1, 1);\r
      probeCtx.fillStyle = computed;\r
      probeCtx.fillRect(0, 0, 1, 1);\r
      const [r, g, b] = probeCtx.getImageData(0, 0, 1, 1).data;\r
      state.color = [r / 255, g / 255, b / 255];\r
      state.backdrop = 0.2126 * state.color[0] + 0.7152 * state.color[1] + 0.0722 * state.color[2] < 0.5 ? 1 : 0;\r
    };\r
\r
    const wander = t => {\r
      const s = settingsRef.current;\r
      const minHalf = Math.min(state.width, state.height) / 2;\r
      const inset = (1 - s.size) * minHalf;\r
      const reachX = s.shape === 0 && !s.src ? state.width / 2 - inset : s.size * minHalf;\r
      const reachY = s.shape === 0 && !s.src ? state.height / 2 - inset : s.size * minHalf;\r
      return [\r
        reachX * (0.75 * Math.sin(t * 0.37) + 0.2 * Math.sin(t * 1.13 + 1.7)),\r
        reachY * (0.7 * Math.sin(t * 0.53 + 0.9) + 0.2 * Math.cos(t * 0.91 + 0.4))\r
      ];\r
    };\r
\r
    const drawShape = s => {\r
      const { width, height } = state;\r
      const minHalf = Math.min(width, height) / 2;\r
      const inset = (1 - s.size) * minHalf;\r
      const halfX = Math.max(1, width / 2 - inset);\r
      const halfY = Math.max(1, height / 2 - inset);\r
      const radius = s.size * minHalf;\r
      const fieldHalf = radius * (1 + PAD);\r
      let shapeIndex = s.shape;\r
      if (s.src) shapeIndex = state.image === 'ready' ? 4 : state.image === 'failed' ? s.shape : -1;\r
      const round =\r
        shapeIndex === 0\r
          ? s.roundness * Math.min(halfX, halfY)\r
          : s.roundness * radius * (shapeIndex === 3 ? 0.12 : 0.3);\r
      const angle = ((s.rotation + state.angle) * Math.PI) / 180;\r
      const key = [\r
        canvas.width,\r
        canvas.height,\r
        shapeIndex,\r
        s.sides,\r
        halfX,\r
        halfY,\r
        radius,\r
        round,\r
        s.thickness,\r
        s.fill,\r
        s.echoes,\r
        s.spacing,\r
        angle.toFixed(5)\r
      ].join('|');\r
      if (key === pyramid.key) return;\r
      pyramid.key = key;\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, pyramid.texture, 0);\r
      gl.viewport(0, 0, pyramid.sizes[0][0], pyramid.sizes[0][1]);\r
      gl.useProgram(shapeProgram);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, fieldTexture);\r
      gl.uniform1i(shapeUniforms.uFieldTexture, 0);\r
      gl.uniform2f(shapeUniforms.uResolution, width, height);\r
      gl.uniform1f(shapeUniforms.uDpr, state.dpr);\r
      gl.uniform1i(shapeUniforms.uShape, shapeIndex);\r
      gl.uniform1f(shapeUniforms.uSides, s.sides);\r
      gl.uniform2f(shapeUniforms.uHalf, halfX, halfY);\r
      gl.uniform1f(shapeUniforms.uRadius, radius);\r
      gl.uniform1f(shapeUniforms.uRound, round);\r
      gl.uniform2f(shapeUniforms.uField, fieldHalf, (2 * fieldHalf) / FIELD);\r
      gl.uniform1f(shapeUniforms.uThickness, s.thickness);\r
      gl.uniform1f(shapeUniforms.uFill, s.fill ? 1 : 0);\r
      gl.uniform1f(shapeUniforms.uEchoes, s.echoes);\r
      gl.uniform1f(shapeUniforms.uSpacing, s.spacing);\r
      gl.uniform1f(shapeUniforms.uAngle, angle);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      gl.useProgram(blurProgram);\r
      gl.uniform1i(blurUniforms.uSource, 0);\r
      for (let k = 1; k < pyramid.levels; k++) {\r
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, pyramid.temps[k], 0);\r
        gl.viewport(0, 0, pyramid.sizes[k][0], pyramid.sizes[k - 1][1]);\r
        gl.bindTexture(gl.TEXTURE_2D, pyramid.texture);\r
        gl.uniform1f(blurUniforms.uLod, k - 1);\r
        gl.uniform2f(blurUniforms.uStep, 1, 0);\r
        gl.uniform2f(blurUniforms.uScale, 2, 1);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, pyramid.texture, k);\r
        gl.viewport(0, 0, pyramid.sizes[k][0], pyramid.sizes[k][1]);\r
        gl.bindTexture(gl.TEXTURE_2D, pyramid.temps[k]);\r
        gl.uniform1f(blurUniforms.uLod, 0);\r
        gl.uniform2f(blurUniforms.uStep, 0, 1);\r
        gl.uniform2f(blurUniforms.uScale, 1, 2);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      }\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      if (!pyramid.texture) return;\r
      resolveColor(s.color);\r
      gl.bindVertexArray(vao);\r
      gl.disable(gl.BLEND);\r
      drawShape(s);\r
\r
      const { width, height } = state;\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(compositeProgram);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, pyramid.texture);\r
      gl.uniform1i(compositeUniforms.uPyramid, 0);\r
      gl.uniform1f(compositeUniforms.uMaxLod, pyramid.levels - 1);\r
      gl.uniform2f(compositeUniforms.uResolution, width, height);\r
      gl.uniform1f(compositeUniforms.uDpr, state.dpr);\r
      gl.uniform1f(compositeUniforms.uThickness, s.thickness);\r
      gl.uniform1f(compositeUniforms.uFill, s.fill ? 1 : 0);\r
      gl.uniform1f(compositeUniforms.uEchoes, s.echoes);\r
      gl.uniform1f(compositeUniforms.uSpacing, s.spacing);\r
      gl.uniform3f(compositeUniforms.uColor, state.color[0], state.color[1], state.color[2]);\r
      gl.uniform1f(compositeUniforms.uBackdrop, state.backdrop);\r
      gl.uniform1f(compositeUniforms.uBlur, s.blur);\r
      gl.uniform3f(compositeUniforms.uLens, lens.x, lens.y, lens.power);\r
      gl.uniform2f(compositeUniforms.uLensShape, s.lensSize * Math.min(width, height), s.lensSoftness);\r
      gl.uniform1f(compositeUniforms.uFocus, s.focus ? 1 : 0);\r
      gl.uniform1f(compositeUniforms.uChroma, s.chroma);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!alive || !visible) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      state.time += dt;\r
      if (!reduce) state.angle = (state.angle + s.spin * dt) % 360;\r
\r
      const drifting = !pointer.active && s.idle && !reduce;\r
      let targetX = lens.x;\r
      let targetY = lens.y;\r
      let targetPower = 0;\r
      if (pointer.active) {\r
        targetX = pointer.x;\r
        targetY = pointer.y;\r
        targetPower = 1;\r
      } else if (drifting) {\r
        [targetX, targetY] = wander(state.time);\r
        targetPower = 0.85;\r
      }\r
      if (!lens.placed) {\r
        lens.x = targetX;\r
        lens.y = targetY;\r
        lens.placed = true;\r
      }\r
      const follow = 1 - Math.exp(-dt * (pointer.active ? 10 : 3));\r
      lens.x += (targetX - lens.x) * follow;\r
      lens.y += (targetY - lens.y) * follow;\r
      lens.power += (targetPower - lens.power) * (1 - Math.exp(-dt * 4));\r
\r
      render();\r
\r
      const settled =\r
        Math.abs(targetX - lens.x) < 0.1 &&\r
        Math.abs(targetY - lens.y) < 0.1 &&\r
        Math.abs(targetPower - lens.power) < 0.002;\r
      if (!settled || drifting || (s.spin && !reduce)) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (raf || !alive || !visible) return;\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const load = value => {\r
      const request = ++state.request;\r
      state.image = value ? 'loading' : 'none';\r
      wake();\r
      if (!value) return;\r
      const image = new Image();\r
      image.crossOrigin = 'anonymous';\r
      image.onload = () => {\r
        if (!alive || request !== state.request) return;\r
        let field = null;\r
        try {\r
          field = buildField(image);\r
        } catch {\r
          field = null;\r
        }\r
        if (!field) {\r
          state.image = 'failed';\r
          wake();\r
          return;\r
        }\r
        gl.activeTexture(gl.TEXTURE0);\r
        gl.bindTexture(gl.TEXTURE_2D, fieldTexture);\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, FIELD, FIELD, 0, gl.RED, gl.FLOAT, field);\r
        state.image = 'ready';\r
        wake();\r
      };\r
      image.onerror = () => {\r
        if (!alive || request !== state.request) return;\r
        state.image = 'failed';\r
        wake();\r
      };\r
      image.src = value;\r
    };\r
\r
    const onPointerMove = event => {\r
      const rect = root.getBoundingClientRect();\r
      const margin = settingsRef.current.lensSize * Math.min(rect.width, rect.height);\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      pointer.active = x > -margin && y > -margin && x < rect.width + margin && y < rect.height + margin;\r
      pointer.x = x - rect.width / 2;\r
      pointer.y = rect.height / 2 - y;\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.active = false;\r
      wake();\r
    };\r
\r
    const resize = () => {\r
      state.dpr = Math.min(window.devicePixelRatio || 1, 2);\r
      state.width = Math.max(1, root.clientWidth);\r
      state.height = Math.max(1, root.clientHeight);\r
      canvas.width = Math.round(state.width * state.dpr);\r
      canvas.height = Math.round(state.height * state.dpr);\r
      allocate();\r
      render();\r
      wake();\r
    };\r
\r
    controlRef.current = { load, wake };\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(root);\r
    const visibility = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible) {\r
        last = 0;\r
        wake();\r
      }\r
    });\r
    visibility.observe(root);\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    resize();\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      controlRef.current = null;\r
      resizeObserver.disconnect();\r
      visibility.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      if (pyramid.texture) gl.deleteTexture(pyramid.texture);\r
      pyramid.temps.forEach(texture => gl.deleteTexture(texture));\r
      gl.deleteTexture(fieldTexture);\r
      gl.deleteFramebuffer(framebuffer);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(shapeProgram);\r
      gl.deleteProgram(blurProgram);\r
      gl.deleteProgram(compositeProgram);\r
      gl.deleteShader(vertex);\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    controlRef.current?.load(src || '');\r
  }, [src]);\r
\r
  useEffect(() => {\r
    controlRef.current?.wake();\r
  });\r
\r
  return (\r
    <div ref={rootRef} className={\`\${ROOT}\${className ? \` \${className}\` : ''}\`} style={style}>\r
      <canvas ref={canvasRef} className={CANVAS} aria-hidden="true" />\r
      {children && <div className={CONTENT}>{children}</div>}\r
    </div>\r
  );\r
};\r
\r
export default ShapeBlur;\r
`,t=`'use client';\r
\r
import React, { useEffect, useRef } from 'react';\r
\r
import './ShapeBlur.css';\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const SHAPE = \`#version 300 es\r
precision highp float;\r
uniform vec2 uResolution;\r
uniform float uDpr;\r
uniform int uShape;\r
uniform float uSides;\r
uniform vec2 uHalf;\r
uniform float uRadius;\r
uniform float uRound;\r
uniform sampler2D uFieldTexture;\r
uniform vec2 uField;\r
uniform float uThickness;\r
uniform float uFill;\r
uniform float uEchoes;\r
uniform float uSpacing;\r
uniform float uAngle;\r
out vec4 outColor;\r
\r
const float PI = 3.14159265;\r
\r
float sdRoundBox(vec2 p, vec2 b, float r) {\r
  vec2 q = abs(p) - b + r;\r
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;\r
}\r
\r
float sdPolygon(vec2 p, float r, float n) {\r
  float an = PI / n;\r
  vec2 acs = vec2(cos(an), sin(an));\r
  float bn = mod(atan(p.x, p.y), 2.0 * an) - an;\r
  p = length(p) * vec2(cos(bn), abs(sin(bn)));\r
  p -= r * acs;\r
  p.y += clamp(-p.y, 0.0, r * acs.y);\r
  return length(p) * sign(p.x);\r
}\r
\r
float sdStar(vec2 p, float r, float n, float m) {\r
  float an = PI / n;\r
  float en = PI / m;\r
  vec2 acs = vec2(cos(an), sin(an));\r
  vec2 ecs = vec2(cos(en), sin(en));\r
  float bn = mod(atan(p.x, p.y), 2.0 * an) - an;\r
  p = length(p) * vec2(cos(bn), abs(sin(bn)));\r
  p -= r * acs;\r
  p += ecs * clamp(-dot(p, ecs), 0.0, r * acs.y / ecs.y);\r
  return length(p) * sign(p.x);\r
}\r
\r
float shapeDistance(vec2 p) {\r
  if (uShape < 0) return 1e5;\r
  float c = cos(uAngle);\r
  float s = sin(uAngle);\r
  p = mat2(c, -s, s, c) * p;\r
  if (uShape == 0) return sdRoundBox(p, uHalf, uRound);\r
  if (uShape == 1) return length(p) - uRadius;\r
  if (uShape == 2) return sdPolygon(p, uRadius - uRound, uSides) - uRound;\r
  if (uShape == 3) return sdStar(p, uRadius - uRound, uSides, mix(2.0, uSides, 0.42)) - uRound;\r
  vec2 uv = p / (2.0 * uField.x) + 0.5;\r
  vec2 inside = clamp(uv, 0.0, 1.0);\r
  float d = texture(uFieldTexture, vec2(inside.x, 1.0 - inside.y)).r * uField.y;\r
  return d + length((uv - inside) * 2.0 * uField.x);\r
}\r
\r
void main() {\r
  vec2 p = gl_FragCoord.xy / uDpr - 0.5 * uResolution;\r
  float d = shapeDistance(p);\r
  float aa = 1.0 / uDpr;\r
  float hw = 0.5 * uThickness;\r
  float cover = uFill > 0.5 ? clamp(0.5 - d / aa, 0.0, 1.0) : 0.0;\r
  for (int i = 0; i < 24; i++) {\r
    if (float(i) >= uEchoes) break;\r
    if (uFill > 0.5 && i == 0) continue;\r
    float x = uFill > 0.5 ? d - float(i) * uSpacing : d + float(i) * uSpacing;\r
    cover = max(cover, clamp((hw - abs(x)) / aa + 0.5, 0.0, 1.0));\r
  }\r
  outColor = vec4(cover, 0.0, 0.0, 1.0);\r
}\`;\r
\r
const BLUR = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uSource;\r
uniform float uLod;\r
uniform vec2 uStep;\r
uniform vec2 uScale;\r
out vec4 outColor;\r
\r
void main() {\r
  vec2 size = vec2(textureSize(uSource, int(uLod)));\r
  vec2 center = gl_FragCoord.xy * uScale;\r
  float sum = textureLod(uSource, center / size, uLod).r * 6.0;\r
  sum += textureLod(uSource, (center - uStep) / size, uLod).r * 4.0;\r
  sum += textureLod(uSource, (center + uStep) / size, uLod).r * 4.0;\r
  sum += textureLod(uSource, (center - 2.0 * uStep) / size, uLod).r;\r
  sum += textureLod(uSource, (center + 2.0 * uStep) / size, uLod).r;\r
  outColor = vec4(sum / 16.0, 0.0, 0.0, 1.0);\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uPyramid;\r
uniform float uMaxLod;\r
uniform vec2 uResolution;\r
uniform float uDpr;\r
uniform float uThickness;\r
uniform float uFill;\r
uniform float uEchoes;\r
uniform float uSpacing;\r
uniform vec3 uColor;\r
uniform float uBackdrop;\r
uniform float uBlur;\r
uniform vec3 uLens;\r
uniform vec2 uLensShape;\r
uniform float uFocus;\r
uniform float uChroma;\r
out vec4 outColor;\r
\r
float bspline(vec2 uv, float lod) {\r
  vec2 size = vec2(textureSize(uPyramid, int(lod)));\r
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
  vec2 p0 = (i - 0.5 + w1 / g0) / size;\r
  vec2 p1 = (i + 1.5 + w3 / g1) / size;\r
  float a = textureLod(uPyramid, p0, lod).r;\r
  float b = textureLod(uPyramid, vec2(p1.x, p0.y), lod).r;\r
  float c = textureLod(uPyramid, vec2(p0.x, p1.y), lod).r;\r
  float d = textureLod(uPyramid, p1, lod).r;\r
  return g0.y * (g0.x * a + g1.x * b) + g1.y * (g0.x * c + g1.x * d);\r
}\r
\r
float blurred(vec2 uv, float sigma) {\r
  if (sigma <= 0.6) return textureLod(uPyramid, uv, 0.0).r;\r
  float lod = sigma < 1.7 ? (sigma - 0.6) / 1.1 : log2(sigma / 0.866);\r
  lod = clamp(lod, 0.0, uMaxLod);\r
  float base = floor(lod);\r
  float t = lod - base;\r
  float a = base < 0.5 ? textureLod(uPyramid, uv, 0.0).r : bspline(uv, base);\r
  if (t < 0.001) return a;\r
  return mix(a, bspline(uv, min(base + 1.0, uMaxLod)), t);\r
}\r
\r
void main() {\r
  vec2 texel = 1.0 / vec2(textureSize(uPyramid, 0));\r
  vec2 uv = gl_FragCoord.xy * texel;\r
  vec2 p = gl_FragCoord.xy / uDpr - 0.5 * uResolution;\r
  vec2 toLens = p - uLens.xy;\r
  float lensDistance = length(toLens);\r
  float lens = uLens.z * (1.0 - smoothstep(uLensShape.x * (1.0 - uLensShape.y), uLensShape.x, lensDistance));\r
  float amount = mix(lens, 1.0 - lens, uFocus);\r
  float sigma = uBlur * amount * uDpr;\r
  vec2 dir = lensDistance > 0.001 ? toLens / lensDistance : vec2(0.0);\r
  vec2 split = dir * uChroma * 0.3 * sigma * texel;\r
  vec3 cover = vec3(\r
    blurred(uv - split, sigma * (1.0 + uChroma * 0.25)),\r
    blurred(uv, sigma),\r
    blurred(uv + split, sigma * (1.0 - uChroma * 0.2))\r
  );\r
  if (uFill < 0.5) {\r
    float spread = sigma / uDpr;\r
    float reach = uEchoes > 1.5 ? min(spread, uSpacing) : spread;\r
    cover *= 1.0 + 0.6 * max(reach - 0.5, 0.0) / max(uThickness, 0.5);\r
  }\r
  cover = mix(cover, 0.85 + 0.15 * (1.0 - exp((0.85 - cover) / 0.15)), step(0.85, cover));\r
  float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;\r
  cover = clamp(cover + grain / 255.0, 0.0, 1.0);\r
  float alpha = max(max(cover.r, cover.g), cover.b);\r
  outColor = vec4(uColor * cover + (alpha - cover) * uBackdrop, alpha);\r
}\`;\r
\r
export type ShapeBlurShape = 'rect' | 'circle' | 'polygon' | 'star';\r
\r
export interface ShapeBlurProps {\r
  shape?: ShapeBlurShape;\r
  src?: string;\r
  sides?: number;\r
  size?: number;\r
  roundness?: number;\r
  thickness?: number;\r
  fill?: boolean;\r
  echoes?: number;\r
  spacing?: number;\r
  color?: string;\r
  blur?: number;\r
  lensSize?: number;\r
  lensSoftness?: number;\r
  focus?: boolean;\r
  chroma?: number;\r
  rotation?: number;\r
  spin?: number;\r
  idle?: boolean;\r
  children?: React.ReactNode;\r
  className?: string;\r
  style?: React.CSSProperties;\r
}\r
\r
type Control = { load: (value: string) => void; wake: () => void };\r
\r
const SHAPES: ShapeBlurShape[] = ['rect', 'circle', 'polygon', 'star'];\r
const FIELD = 512;\r
const PAD = 0.35;\r
const FAR = 1e20;\r
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
const link = (gl: WebGL2RenderingContext, vertex: WebGLShader, source: string) => {\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, source);\r
  const program = gl.createProgram();\r
  if (!fragment || !program) return null;\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
  gl.bindAttribLocation(program, 0, 'aPosition');\r
  gl.linkProgram(program);\r
  gl.deleteShader(fragment);\r
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;\r
  gl.deleteProgram(program);\r
  return null;\r
};\r
\r
const locate = (gl: WebGL2RenderingContext, program: WebGLProgram, names: string[]) => {\r
  const map: Record<string, WebGLUniformLocation | null> = {};\r
  for (const name of names) map[name] = gl.getUniformLocation(program, name);\r
  return map;\r
};\r
\r
const sweep = (\r
  grid: Float64Array,\r
  offset: number,\r
  stride: number,\r
  length: number,\r
  f: Float64Array,\r
  v: Int32Array,\r
  z: Float64Array\r
) => {\r
  for (let q = 0; q < length; q++) f[q] = grid[offset + q * stride];\r
  let k = 0;\r
  v[0] = 0;\r
  z[0] = -FAR;\r
  z[1] = FAR;\r
  for (let q = 1; q < length; q++) {\r
    let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * (q - v[k]));\r
    while (s <= z[k]) {\r
      k--;\r
      s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * (q - v[k]));\r
    }\r
    k++;\r
    v[k] = q;\r
    z[k] = s;\r
    z[k + 1] = FAR;\r
  }\r
  k = 0;\r
  for (let q = 0; q < length; q++) {\r
    while (z[k + 1] < q) k++;\r
    const gap = q - v[k];\r
    grid[offset + q * stride] = gap * gap + f[v[k]];\r
  }\r
};\r
\r
const distanceTransform = (grid: Float64Array, size: number) => {\r
  const f = new Float64Array(size);\r
  const v = new Int32Array(size);\r
  const z = new Float64Array(size + 1);\r
  for (let x = 0; x < size; x++) sweep(grid, x, size, size, f, v, z);\r
  for (let y = 0; y < size; y++) sweep(grid, y * size, 1, size, f, v, z);\r
};\r
\r
const buildField = (image: HTMLImageElement) => {\r
  const raster = document.createElement('canvas');\r
  raster.width = FIELD;\r
  raster.height = FIELD;\r
  const ctx = raster.getContext('2d', { willReadFrequently: true });\r
  if (!ctx) return null;\r
  const width = image.naturalWidth || FIELD;\r
  const height = image.naturalHeight || FIELD;\r
  const scale = FIELD / (1 + PAD) / Math.max(width, height);\r
  ctx.drawImage(image, (FIELD - width * scale) / 2, (FIELD - height * scale) / 2, width * scale, height * scale);\r
  const pixels = ctx.getImageData(0, 0, FIELD, FIELD).data;\r
  const outside = new Float64Array(FIELD * FIELD);\r
  const inside = new Float64Array(FIELD * FIELD);\r
  for (let i = 0; i < FIELD * FIELD; i++) {\r
    const alpha = pixels[i * 4 + 3] / 255;\r
    const edge = 0.5 - alpha;\r
    outside[i] = alpha >= 0.999 ? 0 : alpha <= 0.001 ? FAR : edge > 0 ? edge * edge : 0;\r
    inside[i] = alpha >= 0.999 ? FAR : alpha <= 0.001 ? 0 : edge < 0 ? edge * edge : 0;\r
  }\r
  distanceTransform(outside, FIELD);\r
  distanceTransform(inside, FIELD);\r
  const field = new Float32Array(FIELD * FIELD);\r
  for (let i = 0; i < FIELD * FIELD; i++) field[i] = Math.sqrt(outside[i]) - Math.sqrt(inside[i]);\r
  return field;\r
};\r
\r
const ShapeBlur = ({\r
  shape = 'rect',\r
  src,\r
  sides = 6,\r
  size = 0.8,\r
  roundness = 0.2,\r
  thickness = 2,\r
  fill = false,\r
  echoes = 1,\r
  spacing = 12,\r
  color = '#ffffff',\r
  blur = 16,\r
  lensSize = 0.3,\r
  lensSoftness = 0.7,\r
  focus = false,\r
  chroma = 0.3,\r
  rotation = 0,\r
  spin = 0,\r
  idle = true,\r
  children,\r
  className = '',\r
  style\r
}: ShapeBlurProps) => {\r
  const rootRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const controlRef = useRef<Control | null>(null);\r
  const settings = {\r
    shape: Math.max(0, SHAPES.indexOf(shape)),\r
    src: src || '',\r
    sides: clamp(Math.round(sides), 3, 12),\r
    size: clamp(size, 0.05, 1),\r
    roundness: clamp(roundness, 0, 1),\r
    thickness: clamp(thickness, 0.5, 40),\r
    fill,\r
    echoes: clamp(Math.round(echoes), 1, 24),\r
    spacing: Math.max(1, spacing),\r
    color,\r
    blur: Math.max(0, blur),\r
    lensSize: clamp(lensSize, 0.02, 2),\r
    lensSoftness: clamp(lensSoftness, 0, 1),\r
    focus,\r
    chroma: clamp(chroma, 0, 1),\r
    rotation,\r
    spin,\r
    idle\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    const canvas = canvasRef.current;\r
    const gl = canvas?.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });\r
    if (!root || !canvas || !gl) return undefined;\r
\r
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
    if (!vertex) return undefined;\r
    const shapeProgram = link(gl, vertex, SHAPE);\r
    const blurProgram = link(gl, vertex, BLUR);\r
    const compositeProgram = link(gl, vertex, COMPOSITE);\r
    if (!shapeProgram || !blurProgram || !compositeProgram) return undefined;\r
\r
    const shapeUniforms = locate(gl, shapeProgram, [\r
      'uResolution',\r
      'uDpr',\r
      'uShape',\r
      'uSides',\r
      'uHalf',\r
      'uRadius',\r
      'uRound',\r
      'uFieldTexture',\r
      'uField',\r
      'uThickness',\r
      'uFill',\r
      'uEchoes',\r
      'uSpacing',\r
      'uAngle'\r
    ]);\r
    const blurUniforms = locate(gl, blurProgram, ['uSource', 'uLod', 'uStep', 'uScale']);\r
    const compositeUniforms = locate(gl, compositeProgram, [\r
      'uPyramid',\r
      'uMaxLod',\r
      'uResolution',\r
      'uDpr',\r
      'uThickness',\r
      'uFill',\r
      'uEchoes',\r
      'uSpacing',\r
      'uColor',\r
      'uBackdrop',\r
      'uBlur',\r
      'uLens',\r
      'uLensShape',\r
      'uFocus',\r
      'uChroma'\r
    ]);\r
\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    const buffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const precise = Boolean(gl.getExtension('EXT_color_buffer_float'));\r
    const format = precise ? gl.R16F : gl.R8;\r
    const framebuffer = gl.createFramebuffer();\r
\r
    const fieldTexture = gl.createTexture();\r
    gl.activeTexture(gl.TEXTURE0);\r
    gl.bindTexture(gl.TEXTURE_2D, fieldTexture);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, 1, 1, 0, gl.RED, gl.FLOAT, new Float32Array([1e4]));\r
\r
    const probe = document.createElement('canvas');\r
    probe.width = 1;\r
    probe.height = 1;\r
    const probeCtx = probe.getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const pointer = { x: 0, y: 0, active: false };\r
    const lens = { x: 0, y: 0, power: 0, placed: false };\r
    const pyramid = {\r
      texture: null as WebGLTexture | null,\r
      temps: [] as (WebGLTexture | null)[],\r
      sizes: [] as number[][],\r
      levels: 0,\r
      key: ''\r
    };\r
    const state = {\r
      width: 1,\r
      height: 1,\r
      dpr: 1,\r
      time: 0,\r
      angle: 0,\r
      color: [1, 1, 1] as number[],\r
      backdrop: 0,\r
      colorKey: '',\r
      image: 'none' as 'none' | 'loading' | 'ready' | 'failed',\r
      request: 0\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let alive = true;\r
\r
    const allocate = () => {\r
      if (pyramid.texture) gl.deleteTexture(pyramid.texture);\r
      pyramid.temps.forEach(texture => gl.deleteTexture(texture));\r
      const width = canvas.width;\r
      const height = canvas.height;\r
      pyramid.levels = Math.min(10, Math.floor(Math.log2(Math.max(width, height))) + 1);\r
      pyramid.sizes = [];\r
      for (let k = 0; k < pyramid.levels; k++) {\r
        pyramid.sizes.push([Math.max(1, width >> k), Math.max(1, height >> k)]);\r
      }\r
      const configure = () => {\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      };\r
      pyramid.texture = gl.createTexture();\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, pyramid.texture);\r
      gl.texStorage2D(gl.TEXTURE_2D, pyramid.levels, format, width, height);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);\r
      configure();\r
      pyramid.temps = [null];\r
      for (let k = 1; k < pyramid.levels; k++) {\r
        const texture = gl.createTexture();\r
        gl.bindTexture(gl.TEXTURE_2D, texture);\r
        gl.texStorage2D(gl.TEXTURE_2D, 1, format, pyramid.sizes[k][0], pyramid.sizes[k - 1][1]);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
        configure();\r
        pyramid.temps.push(texture);\r
      }\r
      pyramid.key = '';\r
    };\r
\r
    const resolveColor = (value: string) => {\r
      if (value === state.colorKey) return;\r
      state.colorKey = value;\r
      canvas.style.color = value;\r
      const computed = getComputedStyle(canvas).color;\r
      canvas.style.color = '';\r
      if (!probeCtx) return;\r
      probeCtx.clearRect(0, 0, 1, 1);\r
      probeCtx.fillStyle = computed;\r
      probeCtx.fillRect(0, 0, 1, 1);\r
      const [r, g, b] = probeCtx.getImageData(0, 0, 1, 1).data;\r
      state.color = [r / 255, g / 255, b / 255];\r
      state.backdrop = 0.2126 * state.color[0] + 0.7152 * state.color[1] + 0.0722 * state.color[2] < 0.5 ? 1 : 0;\r
    };\r
\r
    const wander = (t: number) => {\r
      const s = settingsRef.current;\r
      const minHalf = Math.min(state.width, state.height) / 2;\r
      const inset = (1 - s.size) * minHalf;\r
      const reachX = s.shape === 0 && !s.src ? state.width / 2 - inset : s.size * minHalf;\r
      const reachY = s.shape === 0 && !s.src ? state.height / 2 - inset : s.size * minHalf;\r
      return [\r
        reachX * (0.75 * Math.sin(t * 0.37) + 0.2 * Math.sin(t * 1.13 + 1.7)),\r
        reachY * (0.7 * Math.sin(t * 0.53 + 0.9) + 0.2 * Math.cos(t * 0.91 + 0.4))\r
      ];\r
    };\r
\r
    const drawShape = (s: typeof settings) => {\r
      const { width, height } = state;\r
      const minHalf = Math.min(width, height) / 2;\r
      const inset = (1 - s.size) * minHalf;\r
      const halfX = Math.max(1, width / 2 - inset);\r
      const halfY = Math.max(1, height / 2 - inset);\r
      const radius = s.size * minHalf;\r
      const fieldHalf = radius * (1 + PAD);\r
      let shapeIndex = s.shape;\r
      if (s.src) shapeIndex = state.image === 'ready' ? 4 : state.image === 'failed' ? s.shape : -1;\r
      const round =\r
        shapeIndex === 0\r
          ? s.roundness * Math.min(halfX, halfY)\r
          : s.roundness * radius * (shapeIndex === 3 ? 0.12 : 0.3);\r
      const angle = ((s.rotation + state.angle) * Math.PI) / 180;\r
      const key = [\r
        canvas.width,\r
        canvas.height,\r
        shapeIndex,\r
        s.sides,\r
        halfX,\r
        halfY,\r
        radius,\r
        round,\r
        s.thickness,\r
        s.fill,\r
        s.echoes,\r
        s.spacing,\r
        angle.toFixed(5)\r
      ].join('|');\r
      if (key === pyramid.key) return;\r
      pyramid.key = key;\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, pyramid.texture, 0);\r
      gl.viewport(0, 0, pyramid.sizes[0][0], pyramid.sizes[0][1]);\r
      gl.useProgram(shapeProgram);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, fieldTexture);\r
      gl.uniform1i(shapeUniforms.uFieldTexture, 0);\r
      gl.uniform2f(shapeUniforms.uResolution, width, height);\r
      gl.uniform1f(shapeUniforms.uDpr, state.dpr);\r
      gl.uniform1i(shapeUniforms.uShape, shapeIndex);\r
      gl.uniform1f(shapeUniforms.uSides, s.sides);\r
      gl.uniform2f(shapeUniforms.uHalf, halfX, halfY);\r
      gl.uniform1f(shapeUniforms.uRadius, radius);\r
      gl.uniform1f(shapeUniforms.uRound, round);\r
      gl.uniform2f(shapeUniforms.uField, fieldHalf, (2 * fieldHalf) / FIELD);\r
      gl.uniform1f(shapeUniforms.uThickness, s.thickness);\r
      gl.uniform1f(shapeUniforms.uFill, s.fill ? 1 : 0);\r
      gl.uniform1f(shapeUniforms.uEchoes, s.echoes);\r
      gl.uniform1f(shapeUniforms.uSpacing, s.spacing);\r
      gl.uniform1f(shapeUniforms.uAngle, angle);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      gl.useProgram(blurProgram);\r
      gl.uniform1i(blurUniforms.uSource, 0);\r
      for (let k = 1; k < pyramid.levels; k++) {\r
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, pyramid.temps[k], 0);\r
        gl.viewport(0, 0, pyramid.sizes[k][0], pyramid.sizes[k - 1][1]);\r
        gl.bindTexture(gl.TEXTURE_2D, pyramid.texture);\r
        gl.uniform1f(blurUniforms.uLod, k - 1);\r
        gl.uniform2f(blurUniforms.uStep, 1, 0);\r
        gl.uniform2f(blurUniforms.uScale, 2, 1);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, pyramid.texture, k);\r
        gl.viewport(0, 0, pyramid.sizes[k][0], pyramid.sizes[k][1]);\r
        gl.bindTexture(gl.TEXTURE_2D, pyramid.temps[k]);\r
        gl.uniform1f(blurUniforms.uLod, 0);\r
        gl.uniform2f(blurUniforms.uStep, 0, 1);\r
        gl.uniform2f(blurUniforms.uScale, 1, 2);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      }\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      if (!pyramid.texture) return;\r
      resolveColor(s.color);\r
      gl.bindVertexArray(vao);\r
      gl.disable(gl.BLEND);\r
      drawShape(s);\r
\r
      const { width, height } = state;\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(compositeProgram);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, pyramid.texture);\r
      gl.uniform1i(compositeUniforms.uPyramid, 0);\r
      gl.uniform1f(compositeUniforms.uMaxLod, pyramid.levels - 1);\r
      gl.uniform2f(compositeUniforms.uResolution, width, height);\r
      gl.uniform1f(compositeUniforms.uDpr, state.dpr);\r
      gl.uniform1f(compositeUniforms.uThickness, s.thickness);\r
      gl.uniform1f(compositeUniforms.uFill, s.fill ? 1 : 0);\r
      gl.uniform1f(compositeUniforms.uEchoes, s.echoes);\r
      gl.uniform1f(compositeUniforms.uSpacing, s.spacing);\r
      gl.uniform3f(compositeUniforms.uColor, state.color[0], state.color[1], state.color[2]);\r
      gl.uniform1f(compositeUniforms.uBackdrop, state.backdrop);\r
      gl.uniform1f(compositeUniforms.uBlur, s.blur);\r
      gl.uniform3f(compositeUniforms.uLens, lens.x, lens.y, lens.power);\r
      gl.uniform2f(compositeUniforms.uLensShape, s.lensSize * Math.min(width, height), s.lensSoftness);\r
      gl.uniform1f(compositeUniforms.uFocus, s.focus ? 1 : 0);\r
      gl.uniform1f(compositeUniforms.uChroma, s.chroma);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!alive || !visible) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      state.time += dt;\r
      if (!reduce) state.angle = (state.angle + s.spin * dt) % 360;\r
\r
      const drifting = !pointer.active && s.idle && !reduce;\r
      let targetX = lens.x;\r
      let targetY = lens.y;\r
      let targetPower = 0;\r
      if (pointer.active) {\r
        targetX = pointer.x;\r
        targetY = pointer.y;\r
        targetPower = 1;\r
      } else if (drifting) {\r
        [targetX, targetY] = wander(state.time);\r
        targetPower = 0.85;\r
      }\r
      if (!lens.placed) {\r
        lens.x = targetX;\r
        lens.y = targetY;\r
        lens.placed = true;\r
      }\r
      const follow = 1 - Math.exp(-dt * (pointer.active ? 10 : 3));\r
      lens.x += (targetX - lens.x) * follow;\r
      lens.y += (targetY - lens.y) * follow;\r
      lens.power += (targetPower - lens.power) * (1 - Math.exp(-dt * 4));\r
\r
      render();\r
\r
      const settled =\r
        Math.abs(targetX - lens.x) < 0.1 &&\r
        Math.abs(targetY - lens.y) < 0.1 &&\r
        Math.abs(targetPower - lens.power) < 0.002;\r
      if (!settled || drifting || (s.spin && !reduce)) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (raf || !alive || !visible) return;\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const load = (value: string) => {\r
      const request = ++state.request;\r
      state.image = value ? 'loading' : 'none';\r
      wake();\r
      if (!value) return;\r
      const image = new Image();\r
      image.crossOrigin = 'anonymous';\r
      image.onload = () => {\r
        if (!alive || request !== state.request) return;\r
        let field: Float32Array | null = null;\r
        try {\r
          field = buildField(image);\r
        } catch {\r
          field = null;\r
        }\r
        if (!field) {\r
          state.image = 'failed';\r
          wake();\r
          return;\r
        }\r
        gl.activeTexture(gl.TEXTURE0);\r
        gl.bindTexture(gl.TEXTURE_2D, fieldTexture);\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, FIELD, FIELD, 0, gl.RED, gl.FLOAT, field);\r
        state.image = 'ready';\r
        wake();\r
      };\r
      image.onerror = () => {\r
        if (!alive || request !== state.request) return;\r
        state.image = 'failed';\r
        wake();\r
      };\r
      image.src = value;\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const rect = root.getBoundingClientRect();\r
      const margin = settingsRef.current.lensSize * Math.min(rect.width, rect.height);\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      pointer.active = x > -margin && y > -margin && x < rect.width + margin && y < rect.height + margin;\r
      pointer.x = x - rect.width / 2;\r
      pointer.y = rect.height / 2 - y;\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.active = false;\r
      wake();\r
    };\r
\r
    const resize = () => {\r
      state.dpr = Math.min(window.devicePixelRatio || 1, 2);\r
      state.width = Math.max(1, root.clientWidth);\r
      state.height = Math.max(1, root.clientHeight);\r
      canvas.width = Math.round(state.width * state.dpr);\r
      canvas.height = Math.round(state.height * state.dpr);\r
      allocate();\r
      render();\r
      wake();\r
    };\r
\r
    controlRef.current = { load, wake };\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(root);\r
    const visibility = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible) {\r
        last = 0;\r
        wake();\r
      }\r
    });\r
    visibility.observe(root);\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    resize();\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      controlRef.current = null;\r
      resizeObserver.disconnect();\r
      visibility.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      if (pyramid.texture) gl.deleteTexture(pyramid.texture);\r
      pyramid.temps.forEach(texture => gl.deleteTexture(texture));\r
      gl.deleteTexture(fieldTexture);\r
      gl.deleteFramebuffer(framebuffer);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(shapeProgram);\r
      gl.deleteProgram(blurProgram);\r
      gl.deleteProgram(compositeProgram);\r
      gl.deleteShader(vertex);\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    controlRef.current?.load(src || '');\r
  }, [src]);\r
\r
  useEffect(() => {\r
    controlRef.current?.wake();\r
  });\r
\r
  return (\r
    <div ref={rootRef} className={\`shape-blur\${className ? \` \${className}\` : ''}\`} style={style}>\r
      <canvas ref={canvasRef} className="shape-blur__canvas" aria-hidden="true" />\r
      {children && <div className="shape-blur__content">{children}</div>}\r
    </div>\r
  );\r
};\r
\r
export default ShapeBlur;\r
`,a=`'use client';\r
\r
import React, { useEffect, useRef } from 'react';\r
\r
const ROOT = 'relative h-full w-full';\r
const CANVAS = 'pointer-events-none absolute inset-0 block h-full w-full';\r
const CONTENT = 'relative z-[1] flex h-full w-full items-center justify-center';\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const SHAPE = \`#version 300 es\r
precision highp float;\r
uniform vec2 uResolution;\r
uniform float uDpr;\r
uniform int uShape;\r
uniform float uSides;\r
uniform vec2 uHalf;\r
uniform float uRadius;\r
uniform float uRound;\r
uniform sampler2D uFieldTexture;\r
uniform vec2 uField;\r
uniform float uThickness;\r
uniform float uFill;\r
uniform float uEchoes;\r
uniform float uSpacing;\r
uniform float uAngle;\r
out vec4 outColor;\r
\r
const float PI = 3.14159265;\r
\r
float sdRoundBox(vec2 p, vec2 b, float r) {\r
  vec2 q = abs(p) - b + r;\r
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;\r
}\r
\r
float sdPolygon(vec2 p, float r, float n) {\r
  float an = PI / n;\r
  vec2 acs = vec2(cos(an), sin(an));\r
  float bn = mod(atan(p.x, p.y), 2.0 * an) - an;\r
  p = length(p) * vec2(cos(bn), abs(sin(bn)));\r
  p -= r * acs;\r
  p.y += clamp(-p.y, 0.0, r * acs.y);\r
  return length(p) * sign(p.x);\r
}\r
\r
float sdStar(vec2 p, float r, float n, float m) {\r
  float an = PI / n;\r
  float en = PI / m;\r
  vec2 acs = vec2(cos(an), sin(an));\r
  vec2 ecs = vec2(cos(en), sin(en));\r
  float bn = mod(atan(p.x, p.y), 2.0 * an) - an;\r
  p = length(p) * vec2(cos(bn), abs(sin(bn)));\r
  p -= r * acs;\r
  p += ecs * clamp(-dot(p, ecs), 0.0, r * acs.y / ecs.y);\r
  return length(p) * sign(p.x);\r
}\r
\r
float shapeDistance(vec2 p) {\r
  if (uShape < 0) return 1e5;\r
  float c = cos(uAngle);\r
  float s = sin(uAngle);\r
  p = mat2(c, -s, s, c) * p;\r
  if (uShape == 0) return sdRoundBox(p, uHalf, uRound);\r
  if (uShape == 1) return length(p) - uRadius;\r
  if (uShape == 2) return sdPolygon(p, uRadius - uRound, uSides) - uRound;\r
  if (uShape == 3) return sdStar(p, uRadius - uRound, uSides, mix(2.0, uSides, 0.42)) - uRound;\r
  vec2 uv = p / (2.0 * uField.x) + 0.5;\r
  vec2 inside = clamp(uv, 0.0, 1.0);\r
  float d = texture(uFieldTexture, vec2(inside.x, 1.0 - inside.y)).r * uField.y;\r
  return d + length((uv - inside) * 2.0 * uField.x);\r
}\r
\r
void main() {\r
  vec2 p = gl_FragCoord.xy / uDpr - 0.5 * uResolution;\r
  float d = shapeDistance(p);\r
  float aa = 1.0 / uDpr;\r
  float hw = 0.5 * uThickness;\r
  float cover = uFill > 0.5 ? clamp(0.5 - d / aa, 0.0, 1.0) : 0.0;\r
  for (int i = 0; i < 24; i++) {\r
    if (float(i) >= uEchoes) break;\r
    if (uFill > 0.5 && i == 0) continue;\r
    float x = uFill > 0.5 ? d - float(i) * uSpacing : d + float(i) * uSpacing;\r
    cover = max(cover, clamp((hw - abs(x)) / aa + 0.5, 0.0, 1.0));\r
  }\r
  outColor = vec4(cover, 0.0, 0.0, 1.0);\r
}\`;\r
\r
const BLUR = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uSource;\r
uniform float uLod;\r
uniform vec2 uStep;\r
uniform vec2 uScale;\r
out vec4 outColor;\r
\r
void main() {\r
  vec2 size = vec2(textureSize(uSource, int(uLod)));\r
  vec2 center = gl_FragCoord.xy * uScale;\r
  float sum = textureLod(uSource, center / size, uLod).r * 6.0;\r
  sum += textureLod(uSource, (center - uStep) / size, uLod).r * 4.0;\r
  sum += textureLod(uSource, (center + uStep) / size, uLod).r * 4.0;\r
  sum += textureLod(uSource, (center - 2.0 * uStep) / size, uLod).r;\r
  sum += textureLod(uSource, (center + 2.0 * uStep) / size, uLod).r;\r
  outColor = vec4(sum / 16.0, 0.0, 0.0, 1.0);\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uPyramid;\r
uniform float uMaxLod;\r
uniform vec2 uResolution;\r
uniform float uDpr;\r
uniform float uThickness;\r
uniform float uFill;\r
uniform float uEchoes;\r
uniform float uSpacing;\r
uniform vec3 uColor;\r
uniform float uBackdrop;\r
uniform float uBlur;\r
uniform vec3 uLens;\r
uniform vec2 uLensShape;\r
uniform float uFocus;\r
uniform float uChroma;\r
out vec4 outColor;\r
\r
float bspline(vec2 uv, float lod) {\r
  vec2 size = vec2(textureSize(uPyramid, int(lod)));\r
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
  vec2 p0 = (i - 0.5 + w1 / g0) / size;\r
  vec2 p1 = (i + 1.5 + w3 / g1) / size;\r
  float a = textureLod(uPyramid, p0, lod).r;\r
  float b = textureLod(uPyramid, vec2(p1.x, p0.y), lod).r;\r
  float c = textureLod(uPyramid, vec2(p0.x, p1.y), lod).r;\r
  float d = textureLod(uPyramid, p1, lod).r;\r
  return g0.y * (g0.x * a + g1.x * b) + g1.y * (g0.x * c + g1.x * d);\r
}\r
\r
float blurred(vec2 uv, float sigma) {\r
  if (sigma <= 0.6) return textureLod(uPyramid, uv, 0.0).r;\r
  float lod = sigma < 1.7 ? (sigma - 0.6) / 1.1 : log2(sigma / 0.866);\r
  lod = clamp(lod, 0.0, uMaxLod);\r
  float base = floor(lod);\r
  float t = lod - base;\r
  float a = base < 0.5 ? textureLod(uPyramid, uv, 0.0).r : bspline(uv, base);\r
  if (t < 0.001) return a;\r
  return mix(a, bspline(uv, min(base + 1.0, uMaxLod)), t);\r
}\r
\r
void main() {\r
  vec2 texel = 1.0 / vec2(textureSize(uPyramid, 0));\r
  vec2 uv = gl_FragCoord.xy * texel;\r
  vec2 p = gl_FragCoord.xy / uDpr - 0.5 * uResolution;\r
  vec2 toLens = p - uLens.xy;\r
  float lensDistance = length(toLens);\r
  float lens = uLens.z * (1.0 - smoothstep(uLensShape.x * (1.0 - uLensShape.y), uLensShape.x, lensDistance));\r
  float amount = mix(lens, 1.0 - lens, uFocus);\r
  float sigma = uBlur * amount * uDpr;\r
  vec2 dir = lensDistance > 0.001 ? toLens / lensDistance : vec2(0.0);\r
  vec2 split = dir * uChroma * 0.3 * sigma * texel;\r
  vec3 cover = vec3(\r
    blurred(uv - split, sigma * (1.0 + uChroma * 0.25)),\r
    blurred(uv, sigma),\r
    blurred(uv + split, sigma * (1.0 - uChroma * 0.2))\r
  );\r
  if (uFill < 0.5) {\r
    float spread = sigma / uDpr;\r
    float reach = uEchoes > 1.5 ? min(spread, uSpacing) : spread;\r
    cover *= 1.0 + 0.6 * max(reach - 0.5, 0.0) / max(uThickness, 0.5);\r
  }\r
  cover = mix(cover, 0.85 + 0.15 * (1.0 - exp((0.85 - cover) / 0.15)), step(0.85, cover));\r
  float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;\r
  cover = clamp(cover + grain / 255.0, 0.0, 1.0);\r
  float alpha = max(max(cover.r, cover.g), cover.b);\r
  outColor = vec4(uColor * cover + (alpha - cover) * uBackdrop, alpha);\r
}\`;\r
\r
export type ShapeBlurShape = 'rect' | 'circle' | 'polygon' | 'star';\r
\r
export interface ShapeBlurProps {\r
  shape?: ShapeBlurShape;\r
  src?: string;\r
  sides?: number;\r
  size?: number;\r
  roundness?: number;\r
  thickness?: number;\r
  fill?: boolean;\r
  echoes?: number;\r
  spacing?: number;\r
  color?: string;\r
  blur?: number;\r
  lensSize?: number;\r
  lensSoftness?: number;\r
  focus?: boolean;\r
  chroma?: number;\r
  rotation?: number;\r
  spin?: number;\r
  idle?: boolean;\r
  children?: React.ReactNode;\r
  className?: string;\r
  style?: React.CSSProperties;\r
}\r
\r
type Control = { load: (value: string) => void; wake: () => void };\r
\r
const SHAPES: ShapeBlurShape[] = ['rect', 'circle', 'polygon', 'star'];\r
const FIELD = 512;\r
const PAD = 0.35;\r
const FAR = 1e20;\r
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
const link = (gl: WebGL2RenderingContext, vertex: WebGLShader, source: string) => {\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, source);\r
  const program = gl.createProgram();\r
  if (!fragment || !program) return null;\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
  gl.bindAttribLocation(program, 0, 'aPosition');\r
  gl.linkProgram(program);\r
  gl.deleteShader(fragment);\r
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;\r
  gl.deleteProgram(program);\r
  return null;\r
};\r
\r
const locate = (gl: WebGL2RenderingContext, program: WebGLProgram, names: string[]) => {\r
  const map: Record<string, WebGLUniformLocation | null> = {};\r
  for (const name of names) map[name] = gl.getUniformLocation(program, name);\r
  return map;\r
};\r
\r
const sweep = (\r
  grid: Float64Array,\r
  offset: number,\r
  stride: number,\r
  length: number,\r
  f: Float64Array,\r
  v: Int32Array,\r
  z: Float64Array\r
) => {\r
  for (let q = 0; q < length; q++) f[q] = grid[offset + q * stride];\r
  let k = 0;\r
  v[0] = 0;\r
  z[0] = -FAR;\r
  z[1] = FAR;\r
  for (let q = 1; q < length; q++) {\r
    let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * (q - v[k]));\r
    while (s <= z[k]) {\r
      k--;\r
      s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * (q - v[k]));\r
    }\r
    k++;\r
    v[k] = q;\r
    z[k] = s;\r
    z[k + 1] = FAR;\r
  }\r
  k = 0;\r
  for (let q = 0; q < length; q++) {\r
    while (z[k + 1] < q) k++;\r
    const gap = q - v[k];\r
    grid[offset + q * stride] = gap * gap + f[v[k]];\r
  }\r
};\r
\r
const distanceTransform = (grid: Float64Array, size: number) => {\r
  const f = new Float64Array(size);\r
  const v = new Int32Array(size);\r
  const z = new Float64Array(size + 1);\r
  for (let x = 0; x < size; x++) sweep(grid, x, size, size, f, v, z);\r
  for (let y = 0; y < size; y++) sweep(grid, y * size, 1, size, f, v, z);\r
};\r
\r
const buildField = (image: HTMLImageElement) => {\r
  const raster = document.createElement('canvas');\r
  raster.width = FIELD;\r
  raster.height = FIELD;\r
  const ctx = raster.getContext('2d', { willReadFrequently: true });\r
  if (!ctx) return null;\r
  const width = image.naturalWidth || FIELD;\r
  const height = image.naturalHeight || FIELD;\r
  const scale = FIELD / (1 + PAD) / Math.max(width, height);\r
  ctx.drawImage(image, (FIELD - width * scale) / 2, (FIELD - height * scale) / 2, width * scale, height * scale);\r
  const pixels = ctx.getImageData(0, 0, FIELD, FIELD).data;\r
  const outside = new Float64Array(FIELD * FIELD);\r
  const inside = new Float64Array(FIELD * FIELD);\r
  for (let i = 0; i < FIELD * FIELD; i++) {\r
    const alpha = pixels[i * 4 + 3] / 255;\r
    const edge = 0.5 - alpha;\r
    outside[i] = alpha >= 0.999 ? 0 : alpha <= 0.001 ? FAR : edge > 0 ? edge * edge : 0;\r
    inside[i] = alpha >= 0.999 ? FAR : alpha <= 0.001 ? 0 : edge < 0 ? edge * edge : 0;\r
  }\r
  distanceTransform(outside, FIELD);\r
  distanceTransform(inside, FIELD);\r
  const field = new Float32Array(FIELD * FIELD);\r
  for (let i = 0; i < FIELD * FIELD; i++) field[i] = Math.sqrt(outside[i]) - Math.sqrt(inside[i]);\r
  return field;\r
};\r
\r
const ShapeBlur = ({\r
  shape = 'rect',\r
  src,\r
  sides = 6,\r
  size = 0.8,\r
  roundness = 0.2,\r
  thickness = 2,\r
  fill = false,\r
  echoes = 1,\r
  spacing = 12,\r
  color = '#ffffff',\r
  blur = 16,\r
  lensSize = 0.3,\r
  lensSoftness = 0.7,\r
  focus = false,\r
  chroma = 0.3,\r
  rotation = 0,\r
  spin = 0,\r
  idle = true,\r
  children,\r
  className = '',\r
  style\r
}: ShapeBlurProps) => {\r
  const rootRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const controlRef = useRef<Control | null>(null);\r
  const settings = {\r
    shape: Math.max(0, SHAPES.indexOf(shape)),\r
    src: src || '',\r
    sides: clamp(Math.round(sides), 3, 12),\r
    size: clamp(size, 0.05, 1),\r
    roundness: clamp(roundness, 0, 1),\r
    thickness: clamp(thickness, 0.5, 40),\r
    fill,\r
    echoes: clamp(Math.round(echoes), 1, 24),\r
    spacing: Math.max(1, spacing),\r
    color,\r
    blur: Math.max(0, blur),\r
    lensSize: clamp(lensSize, 0.02, 2),\r
    lensSoftness: clamp(lensSoftness, 0, 1),\r
    focus,\r
    chroma: clamp(chroma, 0, 1),\r
    rotation,\r
    spin,\r
    idle\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    const canvas = canvasRef.current;\r
    const gl = canvas?.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });\r
    if (!root || !canvas || !gl) return undefined;\r
\r
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
    if (!vertex) return undefined;\r
    const shapeProgram = link(gl, vertex, SHAPE);\r
    const blurProgram = link(gl, vertex, BLUR);\r
    const compositeProgram = link(gl, vertex, COMPOSITE);\r
    if (!shapeProgram || !blurProgram || !compositeProgram) return undefined;\r
\r
    const shapeUniforms = locate(gl, shapeProgram, [\r
      'uResolution',\r
      'uDpr',\r
      'uShape',\r
      'uSides',\r
      'uHalf',\r
      'uRadius',\r
      'uRound',\r
      'uFieldTexture',\r
      'uField',\r
      'uThickness',\r
      'uFill',\r
      'uEchoes',\r
      'uSpacing',\r
      'uAngle'\r
    ]);\r
    const blurUniforms = locate(gl, blurProgram, ['uSource', 'uLod', 'uStep', 'uScale']);\r
    const compositeUniforms = locate(gl, compositeProgram, [\r
      'uPyramid',\r
      'uMaxLod',\r
      'uResolution',\r
      'uDpr',\r
      'uThickness',\r
      'uFill',\r
      'uEchoes',\r
      'uSpacing',\r
      'uColor',\r
      'uBackdrop',\r
      'uBlur',\r
      'uLens',\r
      'uLensShape',\r
      'uFocus',\r
      'uChroma'\r
    ]);\r
\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    const buffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const precise = Boolean(gl.getExtension('EXT_color_buffer_float'));\r
    const format = precise ? gl.R16F : gl.R8;\r
    const framebuffer = gl.createFramebuffer();\r
\r
    const fieldTexture = gl.createTexture();\r
    gl.activeTexture(gl.TEXTURE0);\r
    gl.bindTexture(gl.TEXTURE_2D, fieldTexture);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, 1, 1, 0, gl.RED, gl.FLOAT, new Float32Array([1e4]));\r
\r
    const probe = document.createElement('canvas');\r
    probe.width = 1;\r
    probe.height = 1;\r
    const probeCtx = probe.getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const pointer = { x: 0, y: 0, active: false };\r
    const lens = { x: 0, y: 0, power: 0, placed: false };\r
    const pyramid = {\r
      texture: null as WebGLTexture | null,\r
      temps: [] as (WebGLTexture | null)[],\r
      sizes: [] as number[][],\r
      levels: 0,\r
      key: ''\r
    };\r
    const state = {\r
      width: 1,\r
      height: 1,\r
      dpr: 1,\r
      time: 0,\r
      angle: 0,\r
      color: [1, 1, 1] as number[],\r
      backdrop: 0,\r
      colorKey: '',\r
      image: 'none' as 'none' | 'loading' | 'ready' | 'failed',\r
      request: 0\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let alive = true;\r
\r
    const allocate = () => {\r
      if (pyramid.texture) gl.deleteTexture(pyramid.texture);\r
      pyramid.temps.forEach(texture => gl.deleteTexture(texture));\r
      const width = canvas.width;\r
      const height = canvas.height;\r
      pyramid.levels = Math.min(10, Math.floor(Math.log2(Math.max(width, height))) + 1);\r
      pyramid.sizes = [];\r
      for (let k = 0; k < pyramid.levels; k++) {\r
        pyramid.sizes.push([Math.max(1, width >> k), Math.max(1, height >> k)]);\r
      }\r
      const configure = () => {\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      };\r
      pyramid.texture = gl.createTexture();\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, pyramid.texture);\r
      gl.texStorage2D(gl.TEXTURE_2D, pyramid.levels, format, width, height);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);\r
      configure();\r
      pyramid.temps = [null];\r
      for (let k = 1; k < pyramid.levels; k++) {\r
        const texture = gl.createTexture();\r
        gl.bindTexture(gl.TEXTURE_2D, texture);\r
        gl.texStorage2D(gl.TEXTURE_2D, 1, format, pyramid.sizes[k][0], pyramid.sizes[k - 1][1]);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
        configure();\r
        pyramid.temps.push(texture);\r
      }\r
      pyramid.key = '';\r
    };\r
\r
    const resolveColor = (value: string) => {\r
      if (value === state.colorKey) return;\r
      state.colorKey = value;\r
      canvas.style.color = value;\r
      const computed = getComputedStyle(canvas).color;\r
      canvas.style.color = '';\r
      if (!probeCtx) return;\r
      probeCtx.clearRect(0, 0, 1, 1);\r
      probeCtx.fillStyle = computed;\r
      probeCtx.fillRect(0, 0, 1, 1);\r
      const [r, g, b] = probeCtx.getImageData(0, 0, 1, 1).data;\r
      state.color = [r / 255, g / 255, b / 255];\r
      state.backdrop = 0.2126 * state.color[0] + 0.7152 * state.color[1] + 0.0722 * state.color[2] < 0.5 ? 1 : 0;\r
    };\r
\r
    const wander = (t: number) => {\r
      const s = settingsRef.current;\r
      const minHalf = Math.min(state.width, state.height) / 2;\r
      const inset = (1 - s.size) * minHalf;\r
      const reachX = s.shape === 0 && !s.src ? state.width / 2 - inset : s.size * minHalf;\r
      const reachY = s.shape === 0 && !s.src ? state.height / 2 - inset : s.size * minHalf;\r
      return [\r
        reachX * (0.75 * Math.sin(t * 0.37) + 0.2 * Math.sin(t * 1.13 + 1.7)),\r
        reachY * (0.7 * Math.sin(t * 0.53 + 0.9) + 0.2 * Math.cos(t * 0.91 + 0.4))\r
      ];\r
    };\r
\r
    const drawShape = (s: typeof settings) => {\r
      const { width, height } = state;\r
      const minHalf = Math.min(width, height) / 2;\r
      const inset = (1 - s.size) * minHalf;\r
      const halfX = Math.max(1, width / 2 - inset);\r
      const halfY = Math.max(1, height / 2 - inset);\r
      const radius = s.size * minHalf;\r
      const fieldHalf = radius * (1 + PAD);\r
      let shapeIndex = s.shape;\r
      if (s.src) shapeIndex = state.image === 'ready' ? 4 : state.image === 'failed' ? s.shape : -1;\r
      const round =\r
        shapeIndex === 0\r
          ? s.roundness * Math.min(halfX, halfY)\r
          : s.roundness * radius * (shapeIndex === 3 ? 0.12 : 0.3);\r
      const angle = ((s.rotation + state.angle) * Math.PI) / 180;\r
      const key = [\r
        canvas.width,\r
        canvas.height,\r
        shapeIndex,\r
        s.sides,\r
        halfX,\r
        halfY,\r
        radius,\r
        round,\r
        s.thickness,\r
        s.fill,\r
        s.echoes,\r
        s.spacing,\r
        angle.toFixed(5)\r
      ].join('|');\r
      if (key === pyramid.key) return;\r
      pyramid.key = key;\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, pyramid.texture, 0);\r
      gl.viewport(0, 0, pyramid.sizes[0][0], pyramid.sizes[0][1]);\r
      gl.useProgram(shapeProgram);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, fieldTexture);\r
      gl.uniform1i(shapeUniforms.uFieldTexture, 0);\r
      gl.uniform2f(shapeUniforms.uResolution, width, height);\r
      gl.uniform1f(shapeUniforms.uDpr, state.dpr);\r
      gl.uniform1i(shapeUniforms.uShape, shapeIndex);\r
      gl.uniform1f(shapeUniforms.uSides, s.sides);\r
      gl.uniform2f(shapeUniforms.uHalf, halfX, halfY);\r
      gl.uniform1f(shapeUniforms.uRadius, radius);\r
      gl.uniform1f(shapeUniforms.uRound, round);\r
      gl.uniform2f(shapeUniforms.uField, fieldHalf, (2 * fieldHalf) / FIELD);\r
      gl.uniform1f(shapeUniforms.uThickness, s.thickness);\r
      gl.uniform1f(shapeUniforms.uFill, s.fill ? 1 : 0);\r
      gl.uniform1f(shapeUniforms.uEchoes, s.echoes);\r
      gl.uniform1f(shapeUniforms.uSpacing, s.spacing);\r
      gl.uniform1f(shapeUniforms.uAngle, angle);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      gl.useProgram(blurProgram);\r
      gl.uniform1i(blurUniforms.uSource, 0);\r
      for (let k = 1; k < pyramid.levels; k++) {\r
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, pyramid.temps[k], 0);\r
        gl.viewport(0, 0, pyramid.sizes[k][0], pyramid.sizes[k - 1][1]);\r
        gl.bindTexture(gl.TEXTURE_2D, pyramid.texture);\r
        gl.uniform1f(blurUniforms.uLod, k - 1);\r
        gl.uniform2f(blurUniforms.uStep, 1, 0);\r
        gl.uniform2f(blurUniforms.uScale, 2, 1);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, pyramid.texture, k);\r
        gl.viewport(0, 0, pyramid.sizes[k][0], pyramid.sizes[k][1]);\r
        gl.bindTexture(gl.TEXTURE_2D, pyramid.temps[k]);\r
        gl.uniform1f(blurUniforms.uLod, 0);\r
        gl.uniform2f(blurUniforms.uStep, 0, 1);\r
        gl.uniform2f(blurUniforms.uScale, 1, 2);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      }\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      if (!pyramid.texture) return;\r
      resolveColor(s.color);\r
      gl.bindVertexArray(vao);\r
      gl.disable(gl.BLEND);\r
      drawShape(s);\r
\r
      const { width, height } = state;\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(compositeProgram);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, pyramid.texture);\r
      gl.uniform1i(compositeUniforms.uPyramid, 0);\r
      gl.uniform1f(compositeUniforms.uMaxLod, pyramid.levels - 1);\r
      gl.uniform2f(compositeUniforms.uResolution, width, height);\r
      gl.uniform1f(compositeUniforms.uDpr, state.dpr);\r
      gl.uniform1f(compositeUniforms.uThickness, s.thickness);\r
      gl.uniform1f(compositeUniforms.uFill, s.fill ? 1 : 0);\r
      gl.uniform1f(compositeUniforms.uEchoes, s.echoes);\r
      gl.uniform1f(compositeUniforms.uSpacing, s.spacing);\r
      gl.uniform3f(compositeUniforms.uColor, state.color[0], state.color[1], state.color[2]);\r
      gl.uniform1f(compositeUniforms.uBackdrop, state.backdrop);\r
      gl.uniform1f(compositeUniforms.uBlur, s.blur);\r
      gl.uniform3f(compositeUniforms.uLens, lens.x, lens.y, lens.power);\r
      gl.uniform2f(compositeUniforms.uLensShape, s.lensSize * Math.min(width, height), s.lensSoftness);\r
      gl.uniform1f(compositeUniforms.uFocus, s.focus ? 1 : 0);\r
      gl.uniform1f(compositeUniforms.uChroma, s.chroma);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!alive || !visible) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      state.time += dt;\r
      if (!reduce) state.angle = (state.angle + s.spin * dt) % 360;\r
\r
      const drifting = !pointer.active && s.idle && !reduce;\r
      let targetX = lens.x;\r
      let targetY = lens.y;\r
      let targetPower = 0;\r
      if (pointer.active) {\r
        targetX = pointer.x;\r
        targetY = pointer.y;\r
        targetPower = 1;\r
      } else if (drifting) {\r
        [targetX, targetY] = wander(state.time);\r
        targetPower = 0.85;\r
      }\r
      if (!lens.placed) {\r
        lens.x = targetX;\r
        lens.y = targetY;\r
        lens.placed = true;\r
      }\r
      const follow = 1 - Math.exp(-dt * (pointer.active ? 10 : 3));\r
      lens.x += (targetX - lens.x) * follow;\r
      lens.y += (targetY - lens.y) * follow;\r
      lens.power += (targetPower - lens.power) * (1 - Math.exp(-dt * 4));\r
\r
      render();\r
\r
      const settled =\r
        Math.abs(targetX - lens.x) < 0.1 &&\r
        Math.abs(targetY - lens.y) < 0.1 &&\r
        Math.abs(targetPower - lens.power) < 0.002;\r
      if (!settled || drifting || (s.spin && !reduce)) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (raf || !alive || !visible) return;\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const load = (value: string) => {\r
      const request = ++state.request;\r
      state.image = value ? 'loading' : 'none';\r
      wake();\r
      if (!value) return;\r
      const image = new Image();\r
      image.crossOrigin = 'anonymous';\r
      image.onload = () => {\r
        if (!alive || request !== state.request) return;\r
        let field: Float32Array | null = null;\r
        try {\r
          field = buildField(image);\r
        } catch {\r
          field = null;\r
        }\r
        if (!field) {\r
          state.image = 'failed';\r
          wake();\r
          return;\r
        }\r
        gl.activeTexture(gl.TEXTURE0);\r
        gl.bindTexture(gl.TEXTURE_2D, fieldTexture);\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, FIELD, FIELD, 0, gl.RED, gl.FLOAT, field);\r
        state.image = 'ready';\r
        wake();\r
      };\r
      image.onerror = () => {\r
        if (!alive || request !== state.request) return;\r
        state.image = 'failed';\r
        wake();\r
      };\r
      image.src = value;\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const rect = root.getBoundingClientRect();\r
      const margin = settingsRef.current.lensSize * Math.min(rect.width, rect.height);\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      pointer.active = x > -margin && y > -margin && x < rect.width + margin && y < rect.height + margin;\r
      pointer.x = x - rect.width / 2;\r
      pointer.y = rect.height / 2 - y;\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.active = false;\r
      wake();\r
    };\r
\r
    const resize = () => {\r
      state.dpr = Math.min(window.devicePixelRatio || 1, 2);\r
      state.width = Math.max(1, root.clientWidth);\r
      state.height = Math.max(1, root.clientHeight);\r
      canvas.width = Math.round(state.width * state.dpr);\r
      canvas.height = Math.round(state.height * state.dpr);\r
      allocate();\r
      render();\r
      wake();\r
    };\r
\r
    controlRef.current = { load, wake };\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(root);\r
    const visibility = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible) {\r
        last = 0;\r
        wake();\r
      }\r
    });\r
    visibility.observe(root);\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    resize();\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      controlRef.current = null;\r
      resizeObserver.disconnect();\r
      visibility.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      if (pyramid.texture) gl.deleteTexture(pyramid.texture);\r
      pyramid.temps.forEach(texture => gl.deleteTexture(texture));\r
      gl.deleteTexture(fieldTexture);\r
      gl.deleteFramebuffer(framebuffer);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(shapeProgram);\r
      gl.deleteProgram(blurProgram);\r
      gl.deleteProgram(compositeProgram);\r
      gl.deleteShader(vertex);\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    controlRef.current?.load(src || '');\r
  }, [src]);\r
\r
  useEffect(() => {\r
    controlRef.current?.wake();\r
  });\r
\r
  return (\r
    <div ref={rootRef} className={\`\${ROOT}\${className ? \` \${className}\` : ''}\`} style={style}>\r
      <canvas ref={canvasRef} className={CANVAS} aria-hidden="true" />\r
      {children && <div className={CONTENT}>{children}</div>}\r
    </div>\r
  );\r
};\r
\r
export default ShapeBlur;\r
`,o={usage:`import ShapeBlur from './ShapeBlur';

<div style={{ position: 'relative', height: 500 }}>
  <ShapeBlur
    size={0.6}
    fill={true}
    color="#ffffff"
    blur={16}
    lensSize={0.3}
    lensSoftness={0.7}
    chroma={0.3}
    idle={true}
  />
</div>`,code:r,css:n,tailwind:e,tsCode:t,tsTailwind:a};export{o as shapeBlur};
