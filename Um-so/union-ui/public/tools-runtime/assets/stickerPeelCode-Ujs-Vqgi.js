const r=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
import './StickerPeel.css';\r
\r
const GRID = 96;\r
const PAD = 0.18;\r
const MAX_TEXTURE = 1024;\r
const MASK_SIZE = 96;\r
const LIGHT_HEIGHT = 260;\r
const FINISHES = { gloss: 0, matte: 1, holo: 2 };\r
let stack = 1;\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aGrid;\r
uniform vec2 uCanvas;\r
uniform vec2 uMesh;\r
uniform vec2 uCenter;\r
uniform vec2 uDir;\r
uniform float uFold;\r
uniform float uRadius;\r
uniform float uAngle;\r
uniform float uScale;\r
uniform float uLift;\r
uniform int uPass;\r
uniform vec2 uShadowOffset;\r
uniform vec2 uShadowSlope;\r
out vec2 vUv;\r
out float vFold;\r
out vec3 vNormal;\r
out vec3 vPos;\r
out float vHeight;\r
out float vCurl;\r
const float PI = 3.14159265;\r
\r
void main() {\r
  vec2 local = (aGrid - 0.5) * uMesh;\r
  float s = dot(local, uDir);\r
  float d = uFold - s;\r
  vec3 normal = vec3(0.0, 0.0, 1.0);\r
  float z = 0.0;\r
  vec2 p = local;\r
  if (d > 0.0) {\r
    float theta = d / uRadius;\r
    float along = uFold + d - PI * uRadius;\r
    z = 2.0 * uRadius;\r
    normal = vec3(0.0, 0.0, -1.0);\r
    if (theta < PI) {\r
      along = uFold - uRadius * sin(theta);\r
      z = uRadius * (1.0 - cos(theta));\r
      normal = vec3(uDir * sin(theta), cos(theta));\r
    }\r
    p += (along - s) * uDir;\r
  }\r
  float c = cos(uAngle);\r
  float sn = sin(uAngle);\r
  vec2 turned = vec2(c * p.x - sn * p.y, sn * p.x + c * p.y) * uScale;\r
  vNormal = vec3(c * normal.x - sn * normal.y, sn * normal.x + c * normal.y, normal.z);\r
  vUv = aGrid;\r
  vFold = d;\r
  vCurl = z * uScale;\r
  float height = z * uScale + uLift;\r
  vec2 screen = uCenter + turned;\r
  float depth = 0.0;\r
  if (uPass == 0 || uPass == 2) {\r
    vHeight = uPass == 0 ? height : z * uScale;\r
    screen += uShadowOffset + uShadowSlope * vHeight;\r
  } else {\r
    vHeight = height;\r
    depth = clamp(-height / 1000.0, -1.0, 1.0);\r
  }\r
  vPos = vec3(uCenter + turned, height);\r
  gl_Position = vec4(screen.x / uCanvas.x * 2.0 - 1.0, 1.0 - screen.y / uCanvas.y * 2.0, depth, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform sampler2D uImage;\r
uniform int uPass;\r
uniform int uFinish;\r
uniform vec3 uBack;\r
uniform vec3 uLight;\r
uniform float uShine;\r
uniform float uShadow;\r
uniform float uTexel;\r
uniform float uLod;\r
uniform float uRadius;\r
uniform vec2 uGlint;\r
in vec2 vUv;\r
in float vFold;\r
in vec3 vNormal;\r
in vec3 vPos;\r
in float vHeight;\r
in float vCurl;\r
out vec4 outColor;\r
\r
float hash(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * 0.1031);\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.x + q.y) * q.z);\r
}\r
\r
vec3 spectrum(float t) {\r
  t = fract(t) * 6.0;\r
  vec3 a = vec3(1.0, 0.478, 0.46);\r
  vec3 b = vec3(1.0, 0.928, 0.38);\r
  vec3 c = vec3(0.659, 1.0, 0.38);\r
  vec3 d = vec3(0.52, 1.0, 0.968);\r
  vec3 e = vec3(0.48, 0.584, 1.0);\r
  vec3 f = vec3(0.68, 0.52, 1.0);\r
  if (t < 1.0) return mix(a, b, t);\r
  if (t < 2.0) return mix(b, c, t - 1.0);\r
  if (t < 3.0) return mix(c, d, t - 2.0);\r
  if (t < 4.0) return mix(d, e, t - 3.0);\r
  if (t < 5.0) return mix(e, f, t - 4.0);\r
  return mix(f, a, t - 5.0);\r
}\r
\r
float bars(float t) {\r
  t = fract(t) * 12.0;\r
  if (t < 3.8) return mix(0.08, 0.6, t / 3.8);\r
  if (t < 4.5) return mix(0.6, 0.72, (t - 3.8) / 0.7);\r
  if (t < 5.2) return mix(0.72, 0.6, (t - 4.5) / 0.7);\r
  if (t < 10.0) return mix(0.6, 0.08, (t - 5.2) / 4.8);\r
  return 0.08;\r
}\r
\r
void main() {\r
  if (uPass == 0) {\r
    float alpha;\r
    if (vFold > 0.0) {\r
      alpha = textureLod(uImage, vUv, log2(max(1.5 * uTexel, 1.0))).a * (1.0 - smoothstep(0.0, uRadius, vCurl));\r
    } else {\r
      alpha = textureLod(uImage, vUv, log2(max((1.2 + vHeight * 0.55) * uTexel, 1.0))).a;\r
    }\r
    outColor = vec4(0.0, 0.0, 0.0, alpha * uShadow / (1.0 + vHeight * 0.03));\r
    return;\r
  }\r
  if (uPass == 2) {\r
    if (vFold <= 0.0) discard;\r
    float alpha = textureLod(uImage, vUv, log2(max(uTexel, 1.0))).a * smoothstep(0.0, uRadius, vCurl);\r
    outColor = vec4(alpha);\r
    return;\r
  }\r
  if (uPass == 1 && vFold > 0.0) discard;\r
  if (uPass == 3 && vFold <= 0.0) discard;\r
  vec4 art = textureLod(uImage, vUv, uLod);\r
  if (art.a < 0.004) discard;\r
  bool front = vNormal.z >= 0.0;\r
  vec3 n = normalize(front ? vNormal : -vNormal);\r
  vec3 toLight = normalize(uLight - vPos);\r
  vec3 halfway = normalize(toLight + vec3(0.0, 0.0, 1.0));\r
  float diffuse = max(dot(n, toLight), 0.0);\r
  float nh = max(dot(n, halfway), 0.0);\r
  vec3 key = normalize(vec3(-0.45, -0.6, 0.66));\r
  float shade = clamp(0.5 + 0.25 * dot(n, key) / key.z + 0.25 * n.z, 0.5, front ? 1.0 : 1.08);\r
  if (uPass == 1) shade = 1.0;\r
  vec3 color;\r
  if (!front) {\r
    float grain = hash(floor(vUv * 700.0)) * 0.06 - 0.03;\r
    color = uBack * (0.7 + 0.3 * diffuse + grain) * art.a + vec3(pow(nh, 24.0) * 0.2 * uShine) * art.a;\r
  } else if (uFinish == 1) {\r
    color = art.rgb * (0.8 + 0.22 * diffuse) + vec3(pow(nh, 8.0) * 0.08 * uShine) * art.a;\r
  } else if (uFinish == 2) {\r
    vec3 albedo = art.rgb / art.a;\r
    float lum = dot(albedo, vec3(0.299, 0.587, 0.114));\r
    float foil = smoothstep(0.5, 0.92, lum);\r
    vec2 q = vUv - uGlint;\r
    float near = exp(-dot(q, q) * 3.0);\r
    float tilt = dot(n.xy, vec2(0.6, 0.8)) * 1.6;\r
    vec3 rainbow = spectrum((vUv.x + vUv.y) * 0.85 - (uGlint.x + uGlint.y) * 1.2 + tilt);\r
    float streak = bars((vUv.x - vUv.y) * 2.6 + uGlint.x * 1.8 - uGlint.y * 0.6 + tilt * 0.5);\r
    float band = smoothstep(0.32, 0.7, streak);\r
    vec3 silver = vec3(0.8, 0.82, 0.86) * (0.88 + 0.16 * diffuse);\r
    vec3 film = mix(silver, rainbow * 1.08, clamp(band * (0.55 + 0.45 * near) + 0.18 * near, 0.0, 1.0));\r
    vec3 ink = albedo * (0.86 + 0.14 * diffuse) + rainbow * band * 0.22 * (0.4 + 0.6 * near);\r
    vec3 base = mix(albedo * (0.86 + 0.14 * diffuse), mix(ink, film, foil), uShine * 0.6 + 0.4);\r
    vec2 cell = floor(vUv * 180.0);\r
    vec2 jitter = vec2(hash(cell), hash(cell + 7.3)) * 0.6 + 0.2;\r
    float dist = length(fract(vUv * 180.0) - jitter);\r
    vec3 facet = normalize(vec3(vec2(hash(cell + 2.1), hash(cell + 5.7)) * 2.0 - 1.0, 1.6));\r
    float glint = pow(max(dot(facet, halfway), 0.0), 60.0) * smoothstep(0.32, 0.05, dist) * step(0.55, hash(cell + 3.1)) * (0.15 + 0.85 * foil);\r
    color = (base + spectrum(hash(cell) + uGlint.x) * glint * 1.6 * uShine + vec3(pow(nh, 140.0) * 0.4 * uShine)) * art.a;\r
  } else {\r
    color = art.rgb * (0.86 + 0.16 * diffuse) + vec3(pow(nh, 220.0) * 0.4 + pow(nh, 24.0) * 0.03) * uShine * art.a;\r
  }\r
  float bend = uPass == 3 ? smoothstep(0.0, uRadius * 0.6, vCurl) : 0.0;\r
  float glare = pow(max(dot(n, normalize(key + vec3(0.0, 0.0, 1.0))), 0.0), 28.0) * bend * (0.18 + 0.3 * uShine);\r
  outColor = vec4(min(color * shade + vec3(glare) * art.a, vec3(art.a)), art.a);\r
}\`;\r
\r
const POST_VERTEX = \`#version 300 es\r
out vec2 vUv;\r
void main() {\r
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\r
  vUv = p;\r
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const POST_FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uSource;\r
uniform vec2 uStep;\r
uniform float uSigma;\r
uniform float uStrength;\r
uniform int uMode;\r
in vec2 vUv;\r
out vec4 outColor;\r
\r
void main() {\r
  if (uMode == 1) {\r
    outColor = vec4(0.0, 0.0, 0.0, texture(uSource, vUv).a * uStrength);\r
    return;\r
  }\r
  vec4 sum = vec4(0.0);\r
  float total = 0.0;\r
  for (int i = -8; i <= 8; i++) {\r
    float offset = float(i);\r
    float weight = exp(-0.5 * offset * offset / (uSigma * uSigma));\r
    sum += texture(uSource, vUv + uStep * offset) * weight;\r
    total += weight;\r
  }\r
  outColor = sum / total;\r
}\`;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
const wrapAngle = angle => Math.atan2(Math.sin(angle), Math.cos(angle));\r
const toRadians = degrees => (degrees * Math.PI) / 180;\r
\r
const spring = (state, key, target, frequency, damping, dt) => {\r
  const omega = 2 * Math.PI * frequency;\r
  const velocity = \`\${key}V\`;\r
  state[velocity] += (omega * omega * (target - state[key]) - 2 * damping * omega * state[velocity]) * dt;\r
  state[key] += state[velocity] * dt;\r
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
const link = (gl, vertexSource, fragmentSource) => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);\r
  const program = gl.createProgram();\r
  if (!vertex || !fragment || !program) return null;\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
  gl.bindAttribLocation(program, 0, 'aGrid');\r
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
    if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const convexHull = points => {\r
  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);\r
  if (sorted.length < 3) return sorted;\r
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);\r
  const lower = [];\r
  sorted.forEach(point => {\r
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) lower.pop();\r
    lower.push(point);\r
  });\r
  const upper = [];\r
  for (let i = sorted.length - 1; i >= 0; i--) {\r
    const point = sorted[i];\r
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) upper.pop();\r
    upper.push(point);\r
  }\r
  return lower.slice(0, -1).concat(upper.slice(0, -1));\r
};\r
\r
const StickerPeel = ({\r
  imageSrc,\r
  width = 200,\r
  rotate = 0,\r
  peelDirection = 0,\r
  peelBackHoverPct = 25,\r
  peelBackActivePct = 40,\r
  curlRadius = 12,\r
  finish = 'gloss',\r
  backColor = '#d4d4d8',\r
  lightingIntensity = 0.5,\r
  shadowIntensity = 0.6,\r
  followPointer = true,\r
  draggable = true,\r
  swing = 1,\r
  friction = 0.5,\r
  bounce = 0.35,\r
  intro = true,\r
  initialPosition = 'center',\r
  onDragStart,\r
  onDragEnd,\r
  dpr,\r
  className = '',\r
  style,\r
  ...rest\r
}) => {\r
  const rootRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const hitRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settings = {\r
    imageSrc,\r
    width: Math.max(16, width),\r
    rotate: toRadians(rotate),\r
    peelDirection: toRadians(peelDirection),\r
    hoverPeel: clamp(peelBackHoverPct, 0, 100) / 100,\r
    activePeel: clamp(peelBackActivePct, 0, 100) / 100,\r
    curlRadius: Math.max(2, curlRadius),\r
    finish: FINISHES[finish] ?? 0,\r
    backColor,\r
    lighting: clamp(lightingIntensity, 0, 1),\r
    shadow: clamp(shadowIntensity, 0, 1),\r
    followPointer,\r
    draggable,\r
    swing: clamp(swing, 0, 3),\r
    friction: clamp(friction, 0, 1),\r
    bounce: clamp(bounce, 0, 1),\r
    intro,\r
    initialPosition,\r
    onDragStart,\r
    onDragEnd,\r
    dpr\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    const canvas = canvasRef.current;\r
    const hit = hitRef.current;\r
    const parent = root?.parentElement;\r
    const gl = canvas?.getContext('webgl2', {\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: true,\r
      depth: true,\r
      stencil: false\r
    });\r
    if (!root || !canvas || !hit || !parent || !gl) return undefined;\r
\r
    const program = link(gl, VERTEX, FRAGMENT);\r
    const post = link(gl, POST_VERTEX, POST_FRAGMENT);\r
    if (!program || !post) return undefined;\r
    const u = program.uniforms;\r
    const pu = post.uniforms;\r
    const targets = [0, 1].map(() => {\r
      const target = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, target);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      const buffer = gl.createFramebuffer();\r
      return { texture: target, buffer, width: 0, height: 0 };\r
    });\r
    const sizeTargets = () => {\r
      const width = Math.max(1, Math.round(view.size / 2));\r
      const height = width;\r
      targets.forEach(target => {\r
        if (target.width === width && target.height === height) return;\r
        target.width = width;\r
        target.height = height;\r
        gl.bindTexture(gl.TEXTURE_2D, target.texture);\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.buffer);\r
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target.texture, 0);\r
      });\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
    };\r
\r
    const vertices = new Float32Array((GRID + 1) * (GRID + 1) * 2);\r
    for (let y = 0; y <= GRID; y++) {\r
      for (let x = 0; x <= GRID; x++) {\r
        const i = (y * (GRID + 1) + x) * 2;\r
        vertices[i] = x / GRID;\r
        vertices[i + 1] = y / GRID;\r
      }\r
    }\r
    const indices = new Uint16Array(GRID * GRID * 6);\r
    let cursor = 0;\r
    for (let y = 0; y < GRID; y++) {\r
      for (let x = 0; x < GRID; x++) {\r
        const a = y * (GRID + 1) + x;\r
        const b = a + 1;\r
        const c = a + GRID + 1;\r
        const d = c + 1;\r
        indices.set([a, b, d, a, d, c], cursor);\r
        cursor += 6;\r
      }\r
    }\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    const vertexBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    const indexBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);\r
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);\r
\r
    const texture = gl.createTexture();\r
    const scratch = document.createElement('canvas');\r
    const scratchContext = scratch.getContext('2d', { willReadFrequently: true });\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const colorCache = new Map();\r
    const parse = value => {\r
      const key = String(value);\r
      const cached = colorCache.get(key);\r
      if (cached) return cached;\r
      let rgb = [0.83, 0.83, 0.85];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#d4d4d8';\r
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
    const sticker = { ready: false, aspect: 1, meshX: 1, meshY: 1, texel: 1, mask: null, maskW: 1, maskH: 1, hull: [] };\r
    const view = { ratio: 1, size: 1, density: 0 };\r
    const bounds = { width: 1, height: 1 };\r
    const state = {\r
      x: 0,\r
      y: 0,\r
      vx: 0,\r
      vy: 0,\r
      placed: false,\r
      swing: 0,\r
      swingV: 0,\r
      peel: 0,\r
      peelV: 0,\r
      lift: 0,\r
      liftV: 0,\r
      dir: settingsRef.current.peelDirection,\r
      hover: false,\r
      local: { x: 0, y: 0 },\r
      press: null,\r
      pivotV: { x: 0, y: 0 },\r
      light: { x: 0, y: 0, z: LIGHT_HEIGHT },\r
      pointer: { x: 0, y: 0, inside: false },\r
      intro: settingsRef.current.intro && !reduce ? 0 : 1\r
    };\r
    if (state.intro < 1) {\r
      state.lift = 1.5;\r
      state.peel = 0.3;\r
      state.swing = 0.1;\r
      state.dir += 0.6;\r
    }\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let loadedSrc = null;\r
    let alive = true;\r
\r
    const height = () => settingsRef.current.width * sticker.aspect;\r
\r
    const extentAlong = (dx, dy) => {\r
      const s = settingsRef.current;\r
      const w = s.width;\r
      const h = height();\r
      if (!sticker.hull.length) {\r
        const half = (Math.abs(dx) * w + Math.abs(dy) * h) / 2;\r
        return [-half, half];\r
      }\r
      let min = Infinity;\r
      let max = -Infinity;\r
      sticker.hull.forEach(([px, py]) => {\r
        const value = px * w * dx + py * h * dy;\r
        if (value < min) min = value;\r
        if (value > max) max = value;\r
      });\r
      return [min, max];\r
    };\r
\r
    const load = src => {\r
      loadedSrc = src;\r
      sticker.ready = false;\r
      if (!src) return;\r
      const image = new Image();\r
      image.crossOrigin = 'anonymous';\r
      image.decoding = 'async';\r
      image.onload = () => {\r
        if (!alive || loadedSrc !== src || !scratchContext) return;\r
        const iw = image.naturalWidth || 1;\r
        const ih = image.naturalHeight || 1;\r
        const fit = Math.min(1, MAX_TEXTURE / (Math.max(iw, ih) * (1 + 2 * PAD)));\r
        const w = Math.max(1, Math.round(iw * fit));\r
        const h = Math.max(1, Math.round(ih * fit));\r
        const padX = Math.round(w * PAD);\r
        const padY = Math.round(h * PAD);\r
        scratch.width = w + padX * 2;\r
        scratch.height = h + padY * 2;\r
        scratchContext.clearRect(0, 0, scratch.width, scratch.height);\r
        scratchContext.drawImage(image, padX, padY, w, h);\r
        gl.bindTexture(gl.TEXTURE_2D, texture);\r
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, scratch);\r
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);\r
        gl.generateMipmap(gl.TEXTURE_2D);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
        sticker.aspect = ih / iw;\r
        sticker.meshX = scratch.width / w;\r
        sticker.meshY = scratch.height / h;\r
        sticker.texel = scratch.width;\r
        const maskW = Math.max(8, Math.round(MASK_SIZE * Math.min(1, iw / ih)));\r
        const maskH = Math.max(8, Math.round(MASK_SIZE * Math.min(1, ih / iw)));\r
        scratch.width = maskW;\r
        scratch.height = maskH;\r
        scratchContext.clearRect(0, 0, maskW, maskH);\r
        scratchContext.drawImage(image, 0, 0, maskW, maskH);\r
        const pixels = scratchContext.getImageData(0, 0, maskW, maskH).data;\r
        const mask = new Uint8Array(maskW * maskH).fill(255);\r
        const queue = [];\r
        const visit = (x, y) => {\r
          const i = y * maskW + x;\r
          if (mask[i] === 0 || pixels[i * 4 + 3] > 100) return;\r
          mask[i] = 0;\r
          queue.push(i);\r
        };\r
        for (let x = 0; x < maskW; x++) {\r
          visit(x, 0);\r
          visit(x, maskH - 1);\r
        }\r
        for (let y = 0; y < maskH; y++) {\r
          visit(0, y);\r
          visit(maskW - 1, y);\r
        }\r
        while (queue.length) {\r
          const i = queue.pop();\r
          const x = i % maskW;\r
          const y = (i - x) / maskW;\r
          if (x > 0) visit(x - 1, y);\r
          if (x < maskW - 1) visit(x + 1, y);\r
          if (y > 0) visit(x, y - 1);\r
          if (y < maskH - 1) visit(x, y + 1);\r
        }\r
        const points = [];\r
        for (let y = 0; y < maskH; y++) {\r
          for (let x = 0; x < maskW; x++) {\r
            if (pixels[(y * maskW + x) * 4 + 3] > 127) points.push([(x + 0.5) / maskW - 0.5, (y + 0.5) / maskH - 0.5]);\r
          }\r
        }\r
        sticker.mask = mask;\r
        sticker.maskW = maskW;\r
        sticker.maskH = maskH;\r
        sticker.hull = convexHull(points);\r
        sticker.ready = true;\r
        layout();\r
        wake();\r
      };\r
      image.src = src;\r
    };\r
\r
    const layout = () => {\r
      const s = settingsRef.current;\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      bounds.width = Math.max(1, parent.clientWidth);\r
      bounds.height = Math.max(1, parent.clientHeight);\r
      const h = height();\r
      const size = Math.ceil(Math.hypot(s.width, h) * 1.16 + 2 * (36 + s.curlRadius));\r
      if (size !== view.size || view.ratio !== view.density) {\r
        view.size = size;\r
        view.density = view.ratio;\r
        root.style.width = \`\${size}px\`;\r
        root.style.height = \`\${size}px\`;\r
        canvas.width = Math.round(size * view.ratio);\r
        canvas.height = Math.round(size * view.ratio);\r
      }\r
      hit.style.width = \`\${s.width}px\`;\r
      hit.style.height = \`\${h}px\`;\r
      if (!state.placed) {\r
        const start = s.initialPosition;\r
        const offset = start && typeof start === 'object' ? start : { x: 0, y: 0 };\r
        state.x = bounds.width / 2 + (offset.x || 0);\r
        state.y = bounds.height / 2 + (offset.y || 0);\r
        state.light = { x: state.x - s.width * 0.45, y: state.y - h * 0.9, z: LIGHT_HEIGHT * 1.6 };\r
        state.placed = true;\r
      }\r
      confine();\r
    };\r
\r
    const reach = () => {\r
      const s = settingsRef.current;\r
      const angle = s.rotate + state.swing;\r
      const grow = 1 + 0.07 * Math.max(0, state.lift);\r
      const w = (s.width / 2) * grow;\r
      const h = (height() / 2) * grow;\r
      const c = Math.abs(Math.cos(angle));\r
      const sn = Math.abs(Math.sin(angle));\r
      return { x: w * c + h * sn, y: w * sn + h * c };\r
    };\r
\r
    const confine = () => {\r
      const s = settingsRef.current;\r
      const half = reach();\r
      const minX = Math.min(half.x, bounds.width / 2);\r
      const maxX = Math.max(bounds.width - half.x, bounds.width / 2);\r
      const minY = Math.min(half.y, bounds.height / 2);\r
      const maxY = Math.max(bounds.height - half.y, bounds.height / 2);\r
      if (state.x < minX) {\r
        state.x = minX;\r
        if (state.vx < 0) state.vx = -state.vx * s.bounce;\r
      } else if (state.x > maxX) {\r
        state.x = maxX;\r
        if (state.vx > 0) state.vx = -state.vx * s.bounce;\r
      }\r
      if (state.y < minY) {\r
        state.y = minY;\r
        if (state.vy < 0) state.vy = -state.vy * s.bounce;\r
      } else if (state.y > maxY) {\r
        state.y = maxY;\r
        if (state.vy > 0) state.vy = -state.vy * s.bounce;\r
      }\r
    };\r
\r
    const toParent = event => {\r
      const rect = parent.getBoundingClientRect();\r
      return { x: event.clientX - rect.left - parent.clientLeft, y: event.clientY - rect.top - parent.clientTop };\r
    };\r
\r
    const toLocal = point => {\r
      const s = settingsRef.current;\r
      const angle = -(s.rotate + state.swing);\r
      const scale = 1 + 0.07 * Math.max(0, state.lift);\r
      const dx = point.x - state.x;\r
      const dy = point.y - state.y;\r
      return {\r
        x: (Math.cos(angle) * dx - Math.sin(angle) * dy) / scale,\r
        y: (Math.sin(angle) * dx + Math.cos(angle) * dy) / scale\r
      };\r
    };\r
\r
    const solid = local => {\r
      if (!sticker.mask) return false;\r
      const s = settingsRef.current;\r
      const mx = Math.floor((local.x / s.width + 0.5) * sticker.maskW);\r
      const my = Math.floor((local.y / height() + 0.5) * sticker.maskH);\r
      if (mx < 0 || my < 0 || mx >= sticker.maskW || my >= sticker.maskH) return false;\r
      return sticker.mask[my * sticker.maskW + mx] > 100;\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      const size = view.size;\r
      root.style.transform = \`translate3d(\${state.x - size / 2}px, \${state.y - size / 2}px, 0)\`;\r
      const angle = s.rotate + state.swing;\r
      const scale = 1 + 0.07 * Math.max(0, state.lift);\r
      hit.style.transform = \`translate(-50%, -50%) rotate(\${angle}rad) scale(\${scale})\`;\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clearDepth(1);\r
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);\r
      if (!sticker.ready) return;\r
      const w = s.width;\r
      const h = height();\r
      const dx = -Math.sin(state.dir);\r
      const dy = Math.cos(state.dir);\r
      const [start, end] = extentAlong(dx, dy);\r
      const peel = clamp(state.peel, 0, 1);\r
      const fold = start + peel * (end - start);\r
      const lift = Math.max(0, state.lift);\r
      const center = size / 2;\r
      const count = GRID * GRID * 6;\r
      const peeled = peel > 0.001;\r
      gl.useProgram(program.program);\r
      gl.bindVertexArray(vao);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.uniform1i(u.uImage, 0);\r
      gl.uniform2f(u.uCanvas, size, size);\r
      gl.uniform2f(u.uMesh, w * sticker.meshX, h * sticker.meshY);\r
      gl.uniform2f(u.uCenter, center, center);\r
      gl.uniform2f(u.uDir, dx, dy);\r
      gl.uniform1f(u.uFold, fold);\r
      gl.uniform1f(u.uRadius, s.curlRadius);\r
      gl.uniform1f(u.uAngle, angle);\r
      gl.uniform1f(u.uScale, scale);\r
      gl.uniform1f(u.uLift, lift * 26);\r
      gl.uniform2f(u.uShadowOffset, 1.2, 2.4);\r
      gl.uniform2f(u.uShadowSlope, 0.28, 0.55);\r
      gl.uniform1i(u.uFinish, s.finish);\r
      gl.uniform3fv(u.uBack, parse(s.backColor));\r
      gl.uniform3f(u.uLight, state.light.x - (state.x - center), state.light.y - (state.y - center), state.light.z);\r
      gl.uniform1f(u.uShine, s.lighting);\r
      gl.uniform1f(u.uShadow, s.shadow * 0.55);\r
      gl.uniform1f(u.uTexel, sticker.texel / (w * sticker.meshX));\r
      gl.uniform1f(u.uLod, Math.max(0, Math.log2(sticker.texel / (w * sticker.meshX * scale * view.ratio))));\r
      const glint = toLocal(state.light);\r
      gl.uniform2f(u.uGlint, glint.x / (w * sticker.meshX) + 0.5, glint.y / (h * sticker.meshY) + 0.5);\r
      gl.disable(gl.DEPTH_TEST);\r
      if (peeled) {\r
        sizeTargets();\r
        const [first, second] = targets;\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, first.buffer);\r
        gl.viewport(0, 0, first.width, first.height);\r
        gl.clear(gl.COLOR_BUFFER_BIT);\r
        gl.disable(gl.BLEND);\r
        gl.uniform1i(u.uPass, 2);\r
        gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);\r
        gl.useProgram(post.program);\r
        gl.uniform1i(pu.uSource, 1);\r
        gl.uniform1i(pu.uMode, 0);\r
        gl.uniform1f(pu.uSigma, Math.min(4, (2.5 + s.curlRadius * 0.15) / 2));\r
        gl.activeTexture(gl.TEXTURE1);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, second.buffer);\r
        gl.bindTexture(gl.TEXTURE_2D, first.texture);\r
        gl.uniform2f(pu.uStep, 1 / first.width, 0);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, first.buffer);\r
        gl.bindTexture(gl.TEXTURE_2D, second.texture);\r
        gl.uniform2f(pu.uStep, 0, 1 / first.height);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
        gl.viewport(0, 0, canvas.width, canvas.height);\r
        gl.useProgram(program.program);\r
        gl.activeTexture(gl.TEXTURE0);\r
      }\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      gl.uniform1i(u.uPass, 0);\r
      gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);\r
      gl.uniform1i(u.uPass, 1);\r
      gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);\r
      if (peeled) {\r
        gl.useProgram(post.program);\r
        gl.activeTexture(gl.TEXTURE1);\r
        gl.bindTexture(gl.TEXTURE_2D, targets[0].texture);\r
        gl.uniform1i(pu.uMode, 1);\r
        gl.uniform1f(pu.uStrength, s.shadow * 0.6);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
        gl.useProgram(program.program);\r
        gl.activeTexture(gl.TEXTURE0);\r
        gl.enable(gl.DEPTH_TEST);\r
        gl.depthFunc(gl.LESS);\r
        gl.uniform1i(u.uPass, 3);\r
        gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);\r
        gl.disable(gl.DEPTH_TEST);\r
      }\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.001, 1 / 30) : 1 / 60;\r
      last = now;\r
      if (s.imageSrc !== loadedSrc) load(s.imageSrc);\r
      const h = height();\r
      if (state.intro < 1 && sticker.ready) state.intro = Math.min(1, state.intro + dt / 1.1);\r
      const press = state.press;\r
      const drag = press && press.moving ? press : null;\r
      if (drag) {\r
        const target = drag.pointer;\r
        const prev = drag.pivot;\r
        const smoothing = 1 - Math.exp(-dt / 0.045);\r
        const vx = state.pivotV.x + ((target.x - prev.x) / dt - state.pivotV.x) * smoothing;\r
        const vy = state.pivotV.y + ((target.y - prev.y) / dt - state.pivotV.y) * smoothing;\r
        const ax = (vx - state.pivotV.x) / dt;\r
        const ay = (vy - state.pivotV.y) / dt;\r
        state.pivotV.x = vx;\r
        state.pivotV.y = vy;\r
        drag.pivot = { x: target.x, y: target.y };\r
        const angle = s.rotate + state.swing;\r
        const rx = -(Math.cos(angle) * drag.grab.x - Math.sin(angle) * drag.grab.y);\r
        const ry = -(Math.sin(angle) * drag.grab.x + Math.cos(angle) * drag.grab.y);\r
        const inertia = (s.width * s.width + h * h) / 12 + rx * rx + ry * ry;\r
        const torque = (rx * -clamp(ay, -24000, 24000) - ry * -clamp(ax, -24000, 24000)) / inertia;\r
        const omega = 2 * Math.PI * 1.5;\r
        state.swingV += (torque * 1.1 * s.swing - omega * omega * state.swing - 2 * 0.45 * omega * state.swingV) * dt;\r
        state.swing = clamp(state.swing + state.swingV * dt, -1.2, 1.2);\r
        const turned = s.rotate + state.swing;\r
        const grip = 1 + 0.07 * Math.max(0, state.lift);\r
        state.x = target.x - (Math.cos(turned) * drag.grab.x - Math.sin(turned) * drag.grab.y) * grip;\r
        state.y = target.y - (Math.sin(turned) * drag.grab.x + Math.cos(turned) * drag.grab.y) * grip;\r
        confine();\r
      } else {\r
        spring(state, 'swing', 0, 1.4, 0.32, dt);\r
        const decay = Math.exp(-dt * (1.5 + 9 * s.friction));\r
        state.vx *= decay;\r
        state.vy *= decay;\r
        if (Math.hypot(state.vx, state.vy) < 4) {\r
          state.vx = 0;\r
          state.vy = 0;\r
        }\r
        state.x += state.vx * dt;\r
        state.y += state.vy * dt;\r
        confine();\r
      }\r
      const introHold = state.intro < 0.2;\r
      const peelTarget = introHold ? 0.3 : press ? s.activePeel : state.hover ? s.hoverPeel : 0;\r
      spring(state, 'peel', peelTarget, press || state.hover ? 3 : 3.6, press || state.hover ? 0.7 : 0.62, dt);\r
      spring(state, 'lift', drag ? 1 : 0, 3.2, 0.55, dt);\r
      let dirTarget = s.peelDirection;\r
      if (press && Math.hypot(press.grab.x, press.grab.y) > Math.min(s.width, h) * 0.12) {\r
        dirTarget = Math.atan2(press.grab.x, -press.grab.y);\r
      } else if (\r
        s.followPointer &&\r
        state.hover &&\r
        Math.hypot(state.local.x, state.local.y) > Math.min(s.width, h) * 0.12\r
      ) {\r
        dirTarget = Math.atan2(state.local.x, -state.local.y);\r
      }\r
      if (!introHold) state.dir += wrapAngle(dirTarget - state.dir) * (1 - Math.exp(-dt / 0.12));\r
      const lightTarget = state.pointer.inside\r
        ? { x: state.pointer.x, y: state.pointer.y, z: LIGHT_HEIGHT }\r
        : { x: state.x - s.width * 0.45, y: state.y - h * 0.9, z: LIGHT_HEIGHT * 1.6 };\r
      const follow = 1 - Math.exp(-dt / 0.08);\r
      state.light.x += (lightTarget.x - state.light.x) * follow;\r
      state.light.y += (lightTarget.y - state.light.y) * follow;\r
      state.light.z += (lightTarget.z - state.light.z) * follow;\r
      canvas.style.opacity = String(clamp(state.intro / 0.12, 0, 1));\r
      draw();\r
      const moving =\r
        (state.intro < 1 && sticker.ready) ||\r
        press ||\r
        Math.abs(state.peel - peelTarget) > 0.0005 ||\r
        Math.abs(state.peelV) > 0.0005 ||\r
        Math.abs(state.lift - (drag ? 1 : 0)) > 0.0005 ||\r
        Math.abs(state.liftV) > 0.0005 ||\r
        Math.abs(state.swing) > 0.0005 ||\r
        Math.abs(state.swingV) > 0.0005 ||\r
        state.vx !== 0 ||\r
        state.vy !== 0 ||\r
        Math.abs(wrapAngle(dirTarget - state.dir)) > 0.002 ||\r
        Math.hypot(lightTarget.x - state.light.x, lightTarget.y - state.light.y, lightTarget.z - state.light.z) > 0.5;\r
      if (moving) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    function wake() {\r
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    }\r
\r
    const updateHover = event => {\r
      const point = toParent(event);\r
      state.local = toLocal(point);\r
      const over = solid(state.local);\r
      if (over !== state.hover) state.hover = over;\r
      hit.style.cursor = over && settingsRef.current.draggable ? (state.press ? 'grabbing' : 'grab') : '';\r
    };\r
\r
    const onPointerMove = event => {\r
      const point = toParent(event);\r
      state.pointer.x = point.x;\r
      state.pointer.y = point.y;\r
      state.pointer.inside = point.x >= 0 && point.y >= 0 && point.x <= bounds.width && point.y <= bounds.height;\r
      wake();\r
    };\r
\r
    const onHitMove = event => {\r
      const press = state.press;\r
      if (!press) {\r
        updateHover(event);\r
      } else if (press.id === event.pointerId) {\r
        const point = toParent(event);\r
        press.pointer = point;\r
        if (!press.moving && Math.hypot(point.x - press.origin.x, point.y - press.origin.y) > 3) {\r
          press.moving = settingsRef.current.draggable;\r
          if (press.moving) settingsRef.current.onDragStart?.();\r
        }\r
        press.samples.push({ x: point.x, y: point.y, t: performance.now() });\r
        if (press.samples.length > 8) press.samples.shift();\r
      }\r
      wake();\r
    };\r
\r
    const onHitLeave = () => {\r
      if (state.press) return;\r
      state.hover = false;\r
      hit.style.cursor = '';\r
      wake();\r
    };\r
\r
    const onHitDown = event => {\r
      const s = settingsRef.current;\r
      if (event.button !== 0 || !sticker.ready) return;\r
      updateHover(event);\r
      if (!state.hover) return;\r
      const point = toParent(event);\r
      state.press = {\r
        id: event.pointerId,\r
        grab: toLocal(point),\r
        origin: point,\r
        pointer: point,\r
        pivot: point,\r
        moving: false,\r
        samples: []\r
      };\r
      state.pivotV = { x: 0, y: 0 };\r
      state.vx = 0;\r
      state.vy = 0;\r
      hit.setPointerCapture?.(event.pointerId);\r
      if (s.draggable) {\r
        hit.style.cursor = 'grabbing';\r
        stack += 1;\r
        root.style.zIndex = String(stack);\r
      }\r
      event.preventDefault();\r
      wake();\r
    };\r
\r
    const onHitUp = event => {\r
      const press = state.press;\r
      if (!press || press.id !== event.pointerId) return;\r
      state.press = null;\r
      if (hit.hasPointerCapture?.(event.pointerId)) hit.releasePointerCapture(event.pointerId);\r
      const now = performance.now();\r
      const recent = press.samples.filter(sample => now - sample.t < 90);\r
      if (press.moving && recent.length > 1 && !reduce) {\r
        const a = recent[0];\r
        const b = recent[recent.length - 1];\r
        const span = Math.max(b.t - a.t, 16) / 1000;\r
        const speed = 2600;\r
        state.vx = clamp((b.x - a.x) / span, -speed, speed);\r
        state.vy = clamp((b.y - a.y) / span, -speed, speed);\r
      }\r
      updateHover(event);\r
      if (event.pointerType !== 'mouse') state.hover = false;\r
      if (press.moving) settingsRef.current.onDragEnd?.();\r
      wake();\r
    };\r
\r
    const onLeaveWindow = () => {\r
      state.pointer.inside = false;\r
      wake();\r
    };\r
\r
    const onVisibility = () => {\r
      last = 0;\r
      wake();\r
    };\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      layout();\r
      wake();\r
    });\r
    resizeObserver.observe(parent);\r
    const intersection = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible) {\r
        last = 0;\r
        wake();\r
      }\r
    });\r
    intersection.observe(parent);\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onLeaveWindow);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    hit.addEventListener('pointermove', onHitMove);\r
    hit.addEventListener('pointerleave', onHitLeave);\r
    hit.addEventListener('pointerdown', onHitDown);\r
    hit.addEventListener('pointerup', onHitUp);\r
    hit.addEventListener('pointercancel', onHitUp);\r
    load(settingsRef.current.imageSrc);\r
    layout();\r
    wakeRef.current = () => {\r
      layout();\r
      wake();\r
    };\r
    wake();\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      document.documentElement.removeEventListener('pointerleave', onLeaveWindow);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      hit.removeEventListener('pointermove', onHitMove);\r
      hit.removeEventListener('pointerleave', onHitLeave);\r
      hit.removeEventListener('pointerdown', onHitDown);\r
      hit.removeEventListener('pointerup', onHitUp);\r
      hit.removeEventListener('pointercancel', onHitUp);\r
      gl.deleteTexture(texture);\r
      targets.forEach(target => {\r
        gl.deleteTexture(target.texture);\r
        gl.deleteFramebuffer(target.buffer);\r
      });\r
      gl.deleteProgram(post.program);\r
      gl.deleteBuffer(vertexBuffer);\r
      gl.deleteBuffer(indexBuffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(program.program);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div ref={rootRef} className={\`sticker-peel\${className ? \` \${className}\` : ''}\`} style={style} {...rest}>\r
      <canvas ref={canvasRef} className="sticker-peel-canvas" aria-hidden="true" />\r
      <div ref={hitRef} className="sticker-peel-hit" />\r
    </div>\r
  );\r
};\r
\r
export default StickerPeel;\r
`,n=`.sticker-peel {\r
  position: absolute;\r
  left: 0;\r
  top: 0;\r
  pointer-events: none;\r
  will-change: transform;\r
}\r
\r
.sticker-peel-canvas {\r
  display: block;\r
  width: 100%;\r
  height: 100%;\r
  pointer-events: none;\r
}\r
\r
.sticker-peel-hit {\r
  position: absolute;\r
  left: 50%;\r
  top: 50%;\r
  pointer-events: auto;\r
  touch-action: none;\r
  user-select: none;\r
  -webkit-user-select: none;\r
  -webkit-touch-callout: none;\r
  -webkit-tap-highlight-color: transparent;\r
}\r
`,e=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
const GRID = 96;\r
const PAD = 0.18;\r
const MAX_TEXTURE = 1024;\r
const MASK_SIZE = 96;\r
const LIGHT_HEIGHT = 260;\r
const FINISHES = { gloss: 0, matte: 1, holo: 2 };\r
let stack = 1;\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aGrid;\r
uniform vec2 uCanvas;\r
uniform vec2 uMesh;\r
uniform vec2 uCenter;\r
uniform vec2 uDir;\r
uniform float uFold;\r
uniform float uRadius;\r
uniform float uAngle;\r
uniform float uScale;\r
uniform float uLift;\r
uniform int uPass;\r
uniform vec2 uShadowOffset;\r
uniform vec2 uShadowSlope;\r
out vec2 vUv;\r
out float vFold;\r
out vec3 vNormal;\r
out vec3 vPos;\r
out float vHeight;\r
out float vCurl;\r
const float PI = 3.14159265;\r
\r
void main() {\r
  vec2 local = (aGrid - 0.5) * uMesh;\r
  float s = dot(local, uDir);\r
  float d = uFold - s;\r
  vec3 normal = vec3(0.0, 0.0, 1.0);\r
  float z = 0.0;\r
  vec2 p = local;\r
  if (d > 0.0) {\r
    float theta = d / uRadius;\r
    float along = uFold + d - PI * uRadius;\r
    z = 2.0 * uRadius;\r
    normal = vec3(0.0, 0.0, -1.0);\r
    if (theta < PI) {\r
      along = uFold - uRadius * sin(theta);\r
      z = uRadius * (1.0 - cos(theta));\r
      normal = vec3(uDir * sin(theta), cos(theta));\r
    }\r
    p += (along - s) * uDir;\r
  }\r
  float c = cos(uAngle);\r
  float sn = sin(uAngle);\r
  vec2 turned = vec2(c * p.x - sn * p.y, sn * p.x + c * p.y) * uScale;\r
  vNormal = vec3(c * normal.x - sn * normal.y, sn * normal.x + c * normal.y, normal.z);\r
  vUv = aGrid;\r
  vFold = d;\r
  vCurl = z * uScale;\r
  float height = z * uScale + uLift;\r
  vec2 screen = uCenter + turned;\r
  float depth = 0.0;\r
  if (uPass == 0 || uPass == 2) {\r
    vHeight = uPass == 0 ? height : z * uScale;\r
    screen += uShadowOffset + uShadowSlope * vHeight;\r
  } else {\r
    vHeight = height;\r
    depth = clamp(-height / 1000.0, -1.0, 1.0);\r
  }\r
  vPos = vec3(uCenter + turned, height);\r
  gl_Position = vec4(screen.x / uCanvas.x * 2.0 - 1.0, 1.0 - screen.y / uCanvas.y * 2.0, depth, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform sampler2D uImage;\r
uniform int uPass;\r
uniform int uFinish;\r
uniform vec3 uBack;\r
uniform vec3 uLight;\r
uniform float uShine;\r
uniform float uShadow;\r
uniform float uTexel;\r
uniform float uLod;\r
uniform float uRadius;\r
uniform vec2 uGlint;\r
in vec2 vUv;\r
in float vFold;\r
in vec3 vNormal;\r
in vec3 vPos;\r
in float vHeight;\r
in float vCurl;\r
out vec4 outColor;\r
\r
float hash(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * 0.1031);\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.x + q.y) * q.z);\r
}\r
\r
vec3 spectrum(float t) {\r
  t = fract(t) * 6.0;\r
  vec3 a = vec3(1.0, 0.478, 0.46);\r
  vec3 b = vec3(1.0, 0.928, 0.38);\r
  vec3 c = vec3(0.659, 1.0, 0.38);\r
  vec3 d = vec3(0.52, 1.0, 0.968);\r
  vec3 e = vec3(0.48, 0.584, 1.0);\r
  vec3 f = vec3(0.68, 0.52, 1.0);\r
  if (t < 1.0) return mix(a, b, t);\r
  if (t < 2.0) return mix(b, c, t - 1.0);\r
  if (t < 3.0) return mix(c, d, t - 2.0);\r
  if (t < 4.0) return mix(d, e, t - 3.0);\r
  if (t < 5.0) return mix(e, f, t - 4.0);\r
  return mix(f, a, t - 5.0);\r
}\r
\r
float bars(float t) {\r
  t = fract(t) * 12.0;\r
  if (t < 3.8) return mix(0.08, 0.6, t / 3.8);\r
  if (t < 4.5) return mix(0.6, 0.72, (t - 3.8) / 0.7);\r
  if (t < 5.2) return mix(0.72, 0.6, (t - 4.5) / 0.7);\r
  if (t < 10.0) return mix(0.6, 0.08, (t - 5.2) / 4.8);\r
  return 0.08;\r
}\r
\r
void main() {\r
  if (uPass == 0) {\r
    float alpha;\r
    if (vFold > 0.0) {\r
      alpha = textureLod(uImage, vUv, log2(max(1.5 * uTexel, 1.0))).a * (1.0 - smoothstep(0.0, uRadius, vCurl));\r
    } else {\r
      alpha = textureLod(uImage, vUv, log2(max((1.2 + vHeight * 0.55) * uTexel, 1.0))).a;\r
    }\r
    outColor = vec4(0.0, 0.0, 0.0, alpha * uShadow / (1.0 + vHeight * 0.03));\r
    return;\r
  }\r
  if (uPass == 2) {\r
    if (vFold <= 0.0) discard;\r
    float alpha = textureLod(uImage, vUv, log2(max(uTexel, 1.0))).a * smoothstep(0.0, uRadius, vCurl);\r
    outColor = vec4(alpha);\r
    return;\r
  }\r
  if (uPass == 1 && vFold > 0.0) discard;\r
  if (uPass == 3 && vFold <= 0.0) discard;\r
  vec4 art = textureLod(uImage, vUv, uLod);\r
  if (art.a < 0.004) discard;\r
  bool front = vNormal.z >= 0.0;\r
  vec3 n = normalize(front ? vNormal : -vNormal);\r
  vec3 toLight = normalize(uLight - vPos);\r
  vec3 halfway = normalize(toLight + vec3(0.0, 0.0, 1.0));\r
  float diffuse = max(dot(n, toLight), 0.0);\r
  float nh = max(dot(n, halfway), 0.0);\r
  vec3 key = normalize(vec3(-0.45, -0.6, 0.66));\r
  float shade = clamp(0.5 + 0.25 * dot(n, key) / key.z + 0.25 * n.z, 0.5, front ? 1.0 : 1.08);\r
  if (uPass == 1) shade = 1.0;\r
  vec3 color;\r
  if (!front) {\r
    float grain = hash(floor(vUv * 700.0)) * 0.06 - 0.03;\r
    color = uBack * (0.7 + 0.3 * diffuse + grain) * art.a + vec3(pow(nh, 24.0) * 0.2 * uShine) * art.a;\r
  } else if (uFinish == 1) {\r
    color = art.rgb * (0.8 + 0.22 * diffuse) + vec3(pow(nh, 8.0) * 0.08 * uShine) * art.a;\r
  } else if (uFinish == 2) {\r
    vec3 albedo = art.rgb / art.a;\r
    float lum = dot(albedo, vec3(0.299, 0.587, 0.114));\r
    float foil = smoothstep(0.5, 0.92, lum);\r
    vec2 q = vUv - uGlint;\r
    float near = exp(-dot(q, q) * 3.0);\r
    float tilt = dot(n.xy, vec2(0.6, 0.8)) * 1.6;\r
    vec3 rainbow = spectrum((vUv.x + vUv.y) * 0.85 - (uGlint.x + uGlint.y) * 1.2 + tilt);\r
    float streak = bars((vUv.x - vUv.y) * 2.6 + uGlint.x * 1.8 - uGlint.y * 0.6 + tilt * 0.5);\r
    float band = smoothstep(0.32, 0.7, streak);\r
    vec3 silver = vec3(0.8, 0.82, 0.86) * (0.88 + 0.16 * diffuse);\r
    vec3 film = mix(silver, rainbow * 1.08, clamp(band * (0.55 + 0.45 * near) + 0.18 * near, 0.0, 1.0));\r
    vec3 ink = albedo * (0.86 + 0.14 * diffuse) + rainbow * band * 0.22 * (0.4 + 0.6 * near);\r
    vec3 base = mix(albedo * (0.86 + 0.14 * diffuse), mix(ink, film, foil), uShine * 0.6 + 0.4);\r
    vec2 cell = floor(vUv * 180.0);\r
    vec2 jitter = vec2(hash(cell), hash(cell + 7.3)) * 0.6 + 0.2;\r
    float dist = length(fract(vUv * 180.0) - jitter);\r
    vec3 facet = normalize(vec3(vec2(hash(cell + 2.1), hash(cell + 5.7)) * 2.0 - 1.0, 1.6));\r
    float glint = pow(max(dot(facet, halfway), 0.0), 60.0) * smoothstep(0.32, 0.05, dist) * step(0.55, hash(cell + 3.1)) * (0.15 + 0.85 * foil);\r
    color = (base + spectrum(hash(cell) + uGlint.x) * glint * 1.6 * uShine + vec3(pow(nh, 140.0) * 0.4 * uShine)) * art.a;\r
  } else {\r
    color = art.rgb * (0.86 + 0.16 * diffuse) + vec3(pow(nh, 220.0) * 0.4 + pow(nh, 24.0) * 0.03) * uShine * art.a;\r
  }\r
  float bend = uPass == 3 ? smoothstep(0.0, uRadius * 0.6, vCurl) : 0.0;\r
  float glare = pow(max(dot(n, normalize(key + vec3(0.0, 0.0, 1.0))), 0.0), 28.0) * bend * (0.18 + 0.3 * uShine);\r
  outColor = vec4(min(color * shade + vec3(glare) * art.a, vec3(art.a)), art.a);\r
}\`;\r
\r
const POST_VERTEX = \`#version 300 es\r
out vec2 vUv;\r
void main() {\r
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\r
  vUv = p;\r
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const POST_FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uSource;\r
uniform vec2 uStep;\r
uniform float uSigma;\r
uniform float uStrength;\r
uniform int uMode;\r
in vec2 vUv;\r
out vec4 outColor;\r
\r
void main() {\r
  if (uMode == 1) {\r
    outColor = vec4(0.0, 0.0, 0.0, texture(uSource, vUv).a * uStrength);\r
    return;\r
  }\r
  vec4 sum = vec4(0.0);\r
  float total = 0.0;\r
  for (int i = -8; i <= 8; i++) {\r
    float offset = float(i);\r
    float weight = exp(-0.5 * offset * offset / (uSigma * uSigma));\r
    sum += texture(uSource, vUv + uStep * offset) * weight;\r
    total += weight;\r
  }\r
  outColor = sum / total;\r
}\`;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
const wrapAngle = angle => Math.atan2(Math.sin(angle), Math.cos(angle));\r
const toRadians = degrees => (degrees * Math.PI) / 180;\r
\r
const spring = (state, key, target, frequency, damping, dt) => {\r
  const omega = 2 * Math.PI * frequency;\r
  const velocity = \`\${key}V\`;\r
  state[velocity] += (omega * omega * (target - state[key]) - 2 * damping * omega * state[velocity]) * dt;\r
  state[key] += state[velocity] * dt;\r
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
const link = (gl, vertexSource, fragmentSource) => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);\r
  const program = gl.createProgram();\r
  if (!vertex || !fragment || !program) return null;\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
  gl.bindAttribLocation(program, 0, 'aGrid');\r
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
    if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const convexHull = points => {\r
  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);\r
  if (sorted.length < 3) return sorted;\r
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);\r
  const lower = [];\r
  sorted.forEach(point => {\r
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) lower.pop();\r
    lower.push(point);\r
  });\r
  const upper = [];\r
  for (let i = sorted.length - 1; i >= 0; i--) {\r
    const point = sorted[i];\r
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) upper.pop();\r
    upper.push(point);\r
  }\r
  return lower.slice(0, -1).concat(upper.slice(0, -1));\r
};\r
\r
const StickerPeel = ({\r
  imageSrc,\r
  width = 200,\r
  rotate = 0,\r
  peelDirection = 0,\r
  peelBackHoverPct = 25,\r
  peelBackActivePct = 40,\r
  curlRadius = 12,\r
  finish = 'gloss',\r
  backColor = '#d4d4d8',\r
  lightingIntensity = 0.5,\r
  shadowIntensity = 0.6,\r
  followPointer = true,\r
  draggable = true,\r
  swing = 1,\r
  friction = 0.5,\r
  bounce = 0.35,\r
  intro = true,\r
  initialPosition = 'center',\r
  onDragStart,\r
  onDragEnd,\r
  dpr,\r
  className = '',\r
  style,\r
  ...rest\r
}) => {\r
  const rootRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const hitRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settings = {\r
    imageSrc,\r
    width: Math.max(16, width),\r
    rotate: toRadians(rotate),\r
    peelDirection: toRadians(peelDirection),\r
    hoverPeel: clamp(peelBackHoverPct, 0, 100) / 100,\r
    activePeel: clamp(peelBackActivePct, 0, 100) / 100,\r
    curlRadius: Math.max(2, curlRadius),\r
    finish: FINISHES[finish] ?? 0,\r
    backColor,\r
    lighting: clamp(lightingIntensity, 0, 1),\r
    shadow: clamp(shadowIntensity, 0, 1),\r
    followPointer,\r
    draggable,\r
    swing: clamp(swing, 0, 3),\r
    friction: clamp(friction, 0, 1),\r
    bounce: clamp(bounce, 0, 1),\r
    intro,\r
    initialPosition,\r
    onDragStart,\r
    onDragEnd,\r
    dpr\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    const canvas = canvasRef.current;\r
    const hit = hitRef.current;\r
    const parent = root?.parentElement;\r
    const gl = canvas?.getContext('webgl2', {\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: true,\r
      depth: true,\r
      stencil: false\r
    });\r
    if (!root || !canvas || !hit || !parent || !gl) return undefined;\r
\r
    const program = link(gl, VERTEX, FRAGMENT);\r
    const post = link(gl, POST_VERTEX, POST_FRAGMENT);\r
    if (!program || !post) return undefined;\r
    const u = program.uniforms;\r
    const pu = post.uniforms;\r
    const targets = [0, 1].map(() => {\r
      const target = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, target);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      const buffer = gl.createFramebuffer();\r
      return { texture: target, buffer, width: 0, height: 0 };\r
    });\r
    const sizeTargets = () => {\r
      const width = Math.max(1, Math.round(view.size / 2));\r
      const height = width;\r
      targets.forEach(target => {\r
        if (target.width === width && target.height === height) return;\r
        target.width = width;\r
        target.height = height;\r
        gl.bindTexture(gl.TEXTURE_2D, target.texture);\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.buffer);\r
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target.texture, 0);\r
      });\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
    };\r
\r
    const vertices = new Float32Array((GRID + 1) * (GRID + 1) * 2);\r
    for (let y = 0; y <= GRID; y++) {\r
      for (let x = 0; x <= GRID; x++) {\r
        const i = (y * (GRID + 1) + x) * 2;\r
        vertices[i] = x / GRID;\r
        vertices[i + 1] = y / GRID;\r
      }\r
    }\r
    const indices = new Uint16Array(GRID * GRID * 6);\r
    let cursor = 0;\r
    for (let y = 0; y < GRID; y++) {\r
      for (let x = 0; x < GRID; x++) {\r
        const a = y * (GRID + 1) + x;\r
        const b = a + 1;\r
        const c = a + GRID + 1;\r
        const d = c + 1;\r
        indices.set([a, b, d, a, d, c], cursor);\r
        cursor += 6;\r
      }\r
    }\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    const vertexBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    const indexBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);\r
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);\r
\r
    const texture = gl.createTexture();\r
    const scratch = document.createElement('canvas');\r
    const scratchContext = scratch.getContext('2d', { willReadFrequently: true });\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const colorCache = new Map();\r
    const parse = value => {\r
      const key = String(value);\r
      const cached = colorCache.get(key);\r
      if (cached) return cached;\r
      let rgb = [0.83, 0.83, 0.85];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#d4d4d8';\r
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
    const sticker = { ready: false, aspect: 1, meshX: 1, meshY: 1, texel: 1, mask: null, maskW: 1, maskH: 1, hull: [] };\r
    const view = { ratio: 1, size: 1, density: 0 };\r
    const bounds = { width: 1, height: 1 };\r
    const state = {\r
      x: 0,\r
      y: 0,\r
      vx: 0,\r
      vy: 0,\r
      placed: false,\r
      swing: 0,\r
      swingV: 0,\r
      peel: 0,\r
      peelV: 0,\r
      lift: 0,\r
      liftV: 0,\r
      dir: settingsRef.current.peelDirection,\r
      hover: false,\r
      local: { x: 0, y: 0 },\r
      press: null,\r
      pivotV: { x: 0, y: 0 },\r
      light: { x: 0, y: 0, z: LIGHT_HEIGHT },\r
      pointer: { x: 0, y: 0, inside: false },\r
      intro: settingsRef.current.intro && !reduce ? 0 : 1\r
    };\r
    if (state.intro < 1) {\r
      state.lift = 1.5;\r
      state.peel = 0.3;\r
      state.swing = 0.1;\r
      state.dir += 0.6;\r
    }\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let loadedSrc = null;\r
    let alive = true;\r
\r
    const height = () => settingsRef.current.width * sticker.aspect;\r
\r
    const extentAlong = (dx, dy) => {\r
      const s = settingsRef.current;\r
      const w = s.width;\r
      const h = height();\r
      if (!sticker.hull.length) {\r
        const half = (Math.abs(dx) * w + Math.abs(dy) * h) / 2;\r
        return [-half, half];\r
      }\r
      let min = Infinity;\r
      let max = -Infinity;\r
      sticker.hull.forEach(([px, py]) => {\r
        const value = px * w * dx + py * h * dy;\r
        if (value < min) min = value;\r
        if (value > max) max = value;\r
      });\r
      return [min, max];\r
    };\r
\r
    const load = src => {\r
      loadedSrc = src;\r
      sticker.ready = false;\r
      if (!src) return;\r
      const image = new Image();\r
      image.crossOrigin = 'anonymous';\r
      image.decoding = 'async';\r
      image.onload = () => {\r
        if (!alive || loadedSrc !== src || !scratchContext) return;\r
        const iw = image.naturalWidth || 1;\r
        const ih = image.naturalHeight || 1;\r
        const fit = Math.min(1, MAX_TEXTURE / (Math.max(iw, ih) * (1 + 2 * PAD)));\r
        const w = Math.max(1, Math.round(iw * fit));\r
        const h = Math.max(1, Math.round(ih * fit));\r
        const padX = Math.round(w * PAD);\r
        const padY = Math.round(h * PAD);\r
        scratch.width = w + padX * 2;\r
        scratch.height = h + padY * 2;\r
        scratchContext.clearRect(0, 0, scratch.width, scratch.height);\r
        scratchContext.drawImage(image, padX, padY, w, h);\r
        gl.bindTexture(gl.TEXTURE_2D, texture);\r
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, scratch);\r
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);\r
        gl.generateMipmap(gl.TEXTURE_2D);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
        sticker.aspect = ih / iw;\r
        sticker.meshX = scratch.width / w;\r
        sticker.meshY = scratch.height / h;\r
        sticker.texel = scratch.width;\r
        const maskW = Math.max(8, Math.round(MASK_SIZE * Math.min(1, iw / ih)));\r
        const maskH = Math.max(8, Math.round(MASK_SIZE * Math.min(1, ih / iw)));\r
        scratch.width = maskW;\r
        scratch.height = maskH;\r
        scratchContext.clearRect(0, 0, maskW, maskH);\r
        scratchContext.drawImage(image, 0, 0, maskW, maskH);\r
        const pixels = scratchContext.getImageData(0, 0, maskW, maskH).data;\r
        const mask = new Uint8Array(maskW * maskH).fill(255);\r
        const queue = [];\r
        const visit = (x, y) => {\r
          const i = y * maskW + x;\r
          if (mask[i] === 0 || pixels[i * 4 + 3] > 100) return;\r
          mask[i] = 0;\r
          queue.push(i);\r
        };\r
        for (let x = 0; x < maskW; x++) {\r
          visit(x, 0);\r
          visit(x, maskH - 1);\r
        }\r
        for (let y = 0; y < maskH; y++) {\r
          visit(0, y);\r
          visit(maskW - 1, y);\r
        }\r
        while (queue.length) {\r
          const i = queue.pop();\r
          const x = i % maskW;\r
          const y = (i - x) / maskW;\r
          if (x > 0) visit(x - 1, y);\r
          if (x < maskW - 1) visit(x + 1, y);\r
          if (y > 0) visit(x, y - 1);\r
          if (y < maskH - 1) visit(x, y + 1);\r
        }\r
        const points = [];\r
        for (let y = 0; y < maskH; y++) {\r
          for (let x = 0; x < maskW; x++) {\r
            if (pixels[(y * maskW + x) * 4 + 3] > 127) points.push([(x + 0.5) / maskW - 0.5, (y + 0.5) / maskH - 0.5]);\r
          }\r
        }\r
        sticker.mask = mask;\r
        sticker.maskW = maskW;\r
        sticker.maskH = maskH;\r
        sticker.hull = convexHull(points);\r
        sticker.ready = true;\r
        layout();\r
        wake();\r
      };\r
      image.src = src;\r
    };\r
\r
    const layout = () => {\r
      const s = settingsRef.current;\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      bounds.width = Math.max(1, parent.clientWidth);\r
      bounds.height = Math.max(1, parent.clientHeight);\r
      const h = height();\r
      const size = Math.ceil(Math.hypot(s.width, h) * 1.16 + 2 * (36 + s.curlRadius));\r
      if (size !== view.size || view.ratio !== view.density) {\r
        view.size = size;\r
        view.density = view.ratio;\r
        root.style.width = \`\${size}px\`;\r
        root.style.height = \`\${size}px\`;\r
        canvas.width = Math.round(size * view.ratio);\r
        canvas.height = Math.round(size * view.ratio);\r
      }\r
      hit.style.width = \`\${s.width}px\`;\r
      hit.style.height = \`\${h}px\`;\r
      if (!state.placed) {\r
        const start = s.initialPosition;\r
        const offset = start && typeof start === 'object' ? start : { x: 0, y: 0 };\r
        state.x = bounds.width / 2 + (offset.x || 0);\r
        state.y = bounds.height / 2 + (offset.y || 0);\r
        state.light = { x: state.x - s.width * 0.45, y: state.y - h * 0.9, z: LIGHT_HEIGHT * 1.6 };\r
        state.placed = true;\r
      }\r
      confine();\r
    };\r
\r
    const reach = () => {\r
      const s = settingsRef.current;\r
      const angle = s.rotate + state.swing;\r
      const grow = 1 + 0.07 * Math.max(0, state.lift);\r
      const w = (s.width / 2) * grow;\r
      const h = (height() / 2) * grow;\r
      const c = Math.abs(Math.cos(angle));\r
      const sn = Math.abs(Math.sin(angle));\r
      return { x: w * c + h * sn, y: w * sn + h * c };\r
    };\r
\r
    const confine = () => {\r
      const s = settingsRef.current;\r
      const half = reach();\r
      const minX = Math.min(half.x, bounds.width / 2);\r
      const maxX = Math.max(bounds.width - half.x, bounds.width / 2);\r
      const minY = Math.min(half.y, bounds.height / 2);\r
      const maxY = Math.max(bounds.height - half.y, bounds.height / 2);\r
      if (state.x < minX) {\r
        state.x = minX;\r
        if (state.vx < 0) state.vx = -state.vx * s.bounce;\r
      } else if (state.x > maxX) {\r
        state.x = maxX;\r
        if (state.vx > 0) state.vx = -state.vx * s.bounce;\r
      }\r
      if (state.y < minY) {\r
        state.y = minY;\r
        if (state.vy < 0) state.vy = -state.vy * s.bounce;\r
      } else if (state.y > maxY) {\r
        state.y = maxY;\r
        if (state.vy > 0) state.vy = -state.vy * s.bounce;\r
      }\r
    };\r
\r
    const toParent = event => {\r
      const rect = parent.getBoundingClientRect();\r
      return { x: event.clientX - rect.left - parent.clientLeft, y: event.clientY - rect.top - parent.clientTop };\r
    };\r
\r
    const toLocal = point => {\r
      const s = settingsRef.current;\r
      const angle = -(s.rotate + state.swing);\r
      const scale = 1 + 0.07 * Math.max(0, state.lift);\r
      const dx = point.x - state.x;\r
      const dy = point.y - state.y;\r
      return {\r
        x: (Math.cos(angle) * dx - Math.sin(angle) * dy) / scale,\r
        y: (Math.sin(angle) * dx + Math.cos(angle) * dy) / scale\r
      };\r
    };\r
\r
    const solid = local => {\r
      if (!sticker.mask) return false;\r
      const s = settingsRef.current;\r
      const mx = Math.floor((local.x / s.width + 0.5) * sticker.maskW);\r
      const my = Math.floor((local.y / height() + 0.5) * sticker.maskH);\r
      if (mx < 0 || my < 0 || mx >= sticker.maskW || my >= sticker.maskH) return false;\r
      return sticker.mask[my * sticker.maskW + mx] > 100;\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      const size = view.size;\r
      root.style.transform = \`translate3d(\${state.x - size / 2}px, \${state.y - size / 2}px, 0)\`;\r
      const angle = s.rotate + state.swing;\r
      const scale = 1 + 0.07 * Math.max(0, state.lift);\r
      hit.style.transform = \`translate(-50%, -50%) rotate(\${angle}rad) scale(\${scale})\`;\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clearDepth(1);\r
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);\r
      if (!sticker.ready) return;\r
      const w = s.width;\r
      const h = height();\r
      const dx = -Math.sin(state.dir);\r
      const dy = Math.cos(state.dir);\r
      const [start, end] = extentAlong(dx, dy);\r
      const peel = clamp(state.peel, 0, 1);\r
      const fold = start + peel * (end - start);\r
      const lift = Math.max(0, state.lift);\r
      const center = size / 2;\r
      const count = GRID * GRID * 6;\r
      const peeled = peel > 0.001;\r
      gl.useProgram(program.program);\r
      gl.bindVertexArray(vao);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.uniform1i(u.uImage, 0);\r
      gl.uniform2f(u.uCanvas, size, size);\r
      gl.uniform2f(u.uMesh, w * sticker.meshX, h * sticker.meshY);\r
      gl.uniform2f(u.uCenter, center, center);\r
      gl.uniform2f(u.uDir, dx, dy);\r
      gl.uniform1f(u.uFold, fold);\r
      gl.uniform1f(u.uRadius, s.curlRadius);\r
      gl.uniform1f(u.uAngle, angle);\r
      gl.uniform1f(u.uScale, scale);\r
      gl.uniform1f(u.uLift, lift * 26);\r
      gl.uniform2f(u.uShadowOffset, 1.2, 2.4);\r
      gl.uniform2f(u.uShadowSlope, 0.28, 0.55);\r
      gl.uniform1i(u.uFinish, s.finish);\r
      gl.uniform3fv(u.uBack, parse(s.backColor));\r
      gl.uniform3f(u.uLight, state.light.x - (state.x - center), state.light.y - (state.y - center), state.light.z);\r
      gl.uniform1f(u.uShine, s.lighting);\r
      gl.uniform1f(u.uShadow, s.shadow * 0.55);\r
      gl.uniform1f(u.uTexel, sticker.texel / (w * sticker.meshX));\r
      gl.uniform1f(u.uLod, Math.max(0, Math.log2(sticker.texel / (w * sticker.meshX * scale * view.ratio))));\r
      const glint = toLocal(state.light);\r
      gl.uniform2f(u.uGlint, glint.x / (w * sticker.meshX) + 0.5, glint.y / (h * sticker.meshY) + 0.5);\r
      gl.disable(gl.DEPTH_TEST);\r
      if (peeled) {\r
        sizeTargets();\r
        const [first, second] = targets;\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, first.buffer);\r
        gl.viewport(0, 0, first.width, first.height);\r
        gl.clear(gl.COLOR_BUFFER_BIT);\r
        gl.disable(gl.BLEND);\r
        gl.uniform1i(u.uPass, 2);\r
        gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);\r
        gl.useProgram(post.program);\r
        gl.uniform1i(pu.uSource, 1);\r
        gl.uniform1i(pu.uMode, 0);\r
        gl.uniform1f(pu.uSigma, Math.min(4, (2.5 + s.curlRadius * 0.15) / 2));\r
        gl.activeTexture(gl.TEXTURE1);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, second.buffer);\r
        gl.bindTexture(gl.TEXTURE_2D, first.texture);\r
        gl.uniform2f(pu.uStep, 1 / first.width, 0);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, first.buffer);\r
        gl.bindTexture(gl.TEXTURE_2D, second.texture);\r
        gl.uniform2f(pu.uStep, 0, 1 / first.height);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
        gl.viewport(0, 0, canvas.width, canvas.height);\r
        gl.useProgram(program.program);\r
        gl.activeTexture(gl.TEXTURE0);\r
      }\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      gl.uniform1i(u.uPass, 0);\r
      gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);\r
      gl.uniform1i(u.uPass, 1);\r
      gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);\r
      if (peeled) {\r
        gl.useProgram(post.program);\r
        gl.activeTexture(gl.TEXTURE1);\r
        gl.bindTexture(gl.TEXTURE_2D, targets[0].texture);\r
        gl.uniform1i(pu.uMode, 1);\r
        gl.uniform1f(pu.uStrength, s.shadow * 0.6);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
        gl.useProgram(program.program);\r
        gl.activeTexture(gl.TEXTURE0);\r
        gl.enable(gl.DEPTH_TEST);\r
        gl.depthFunc(gl.LESS);\r
        gl.uniform1i(u.uPass, 3);\r
        gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);\r
        gl.disable(gl.DEPTH_TEST);\r
      }\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.001, 1 / 30) : 1 / 60;\r
      last = now;\r
      if (s.imageSrc !== loadedSrc) load(s.imageSrc);\r
      const h = height();\r
      if (state.intro < 1 && sticker.ready) state.intro = Math.min(1, state.intro + dt / 1.1);\r
      const press = state.press;\r
      const drag = press && press.moving ? press : null;\r
      if (drag) {\r
        const target = drag.pointer;\r
        const prev = drag.pivot;\r
        const smoothing = 1 - Math.exp(-dt / 0.045);\r
        const vx = state.pivotV.x + ((target.x - prev.x) / dt - state.pivotV.x) * smoothing;\r
        const vy = state.pivotV.y + ((target.y - prev.y) / dt - state.pivotV.y) * smoothing;\r
        const ax = (vx - state.pivotV.x) / dt;\r
        const ay = (vy - state.pivotV.y) / dt;\r
        state.pivotV.x = vx;\r
        state.pivotV.y = vy;\r
        drag.pivot = { x: target.x, y: target.y };\r
        const angle = s.rotate + state.swing;\r
        const rx = -(Math.cos(angle) * drag.grab.x - Math.sin(angle) * drag.grab.y);\r
        const ry = -(Math.sin(angle) * drag.grab.x + Math.cos(angle) * drag.grab.y);\r
        const inertia = (s.width * s.width + h * h) / 12 + rx * rx + ry * ry;\r
        const torque = (rx * -clamp(ay, -24000, 24000) - ry * -clamp(ax, -24000, 24000)) / inertia;\r
        const omega = 2 * Math.PI * 1.5;\r
        state.swingV += (torque * 1.1 * s.swing - omega * omega * state.swing - 2 * 0.45 * omega * state.swingV) * dt;\r
        state.swing = clamp(state.swing + state.swingV * dt, -1.2, 1.2);\r
        const turned = s.rotate + state.swing;\r
        const grip = 1 + 0.07 * Math.max(0, state.lift);\r
        state.x = target.x - (Math.cos(turned) * drag.grab.x - Math.sin(turned) * drag.grab.y) * grip;\r
        state.y = target.y - (Math.sin(turned) * drag.grab.x + Math.cos(turned) * drag.grab.y) * grip;\r
        confine();\r
      } else {\r
        spring(state, 'swing', 0, 1.4, 0.32, dt);\r
        const decay = Math.exp(-dt * (1.5 + 9 * s.friction));\r
        state.vx *= decay;\r
        state.vy *= decay;\r
        if (Math.hypot(state.vx, state.vy) < 4) {\r
          state.vx = 0;\r
          state.vy = 0;\r
        }\r
        state.x += state.vx * dt;\r
        state.y += state.vy * dt;\r
        confine();\r
      }\r
      const introHold = state.intro < 0.2;\r
      const peelTarget = introHold ? 0.3 : press ? s.activePeel : state.hover ? s.hoverPeel : 0;\r
      spring(state, 'peel', peelTarget, press || state.hover ? 3 : 3.6, press || state.hover ? 0.7 : 0.62, dt);\r
      spring(state, 'lift', drag ? 1 : 0, 3.2, 0.55, dt);\r
      let dirTarget = s.peelDirection;\r
      if (press && Math.hypot(press.grab.x, press.grab.y) > Math.min(s.width, h) * 0.12) {\r
        dirTarget = Math.atan2(press.grab.x, -press.grab.y);\r
      } else if (\r
        s.followPointer &&\r
        state.hover &&\r
        Math.hypot(state.local.x, state.local.y) > Math.min(s.width, h) * 0.12\r
      ) {\r
        dirTarget = Math.atan2(state.local.x, -state.local.y);\r
      }\r
      if (!introHold) state.dir += wrapAngle(dirTarget - state.dir) * (1 - Math.exp(-dt / 0.12));\r
      const lightTarget = state.pointer.inside\r
        ? { x: state.pointer.x, y: state.pointer.y, z: LIGHT_HEIGHT }\r
        : { x: state.x - s.width * 0.45, y: state.y - h * 0.9, z: LIGHT_HEIGHT * 1.6 };\r
      const follow = 1 - Math.exp(-dt / 0.08);\r
      state.light.x += (lightTarget.x - state.light.x) * follow;\r
      state.light.y += (lightTarget.y - state.light.y) * follow;\r
      state.light.z += (lightTarget.z - state.light.z) * follow;\r
      canvas.style.opacity = String(clamp(state.intro / 0.12, 0, 1));\r
      draw();\r
      const moving =\r
        (state.intro < 1 && sticker.ready) ||\r
        press ||\r
        Math.abs(state.peel - peelTarget) > 0.0005 ||\r
        Math.abs(state.peelV) > 0.0005 ||\r
        Math.abs(state.lift - (drag ? 1 : 0)) > 0.0005 ||\r
        Math.abs(state.liftV) > 0.0005 ||\r
        Math.abs(state.swing) > 0.0005 ||\r
        Math.abs(state.swingV) > 0.0005 ||\r
        state.vx !== 0 ||\r
        state.vy !== 0 ||\r
        Math.abs(wrapAngle(dirTarget - state.dir)) > 0.002 ||\r
        Math.hypot(lightTarget.x - state.light.x, lightTarget.y - state.light.y, lightTarget.z - state.light.z) > 0.5;\r
      if (moving) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    function wake() {\r
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    }\r
\r
    const updateHover = event => {\r
      const point = toParent(event);\r
      state.local = toLocal(point);\r
      const over = solid(state.local);\r
      if (over !== state.hover) state.hover = over;\r
      hit.style.cursor = over && settingsRef.current.draggable ? (state.press ? 'grabbing' : 'grab') : '';\r
    };\r
\r
    const onPointerMove = event => {\r
      const point = toParent(event);\r
      state.pointer.x = point.x;\r
      state.pointer.y = point.y;\r
      state.pointer.inside = point.x >= 0 && point.y >= 0 && point.x <= bounds.width && point.y <= bounds.height;\r
      wake();\r
    };\r
\r
    const onHitMove = event => {\r
      const press = state.press;\r
      if (!press) {\r
        updateHover(event);\r
      } else if (press.id === event.pointerId) {\r
        const point = toParent(event);\r
        press.pointer = point;\r
        if (!press.moving && Math.hypot(point.x - press.origin.x, point.y - press.origin.y) > 3) {\r
          press.moving = settingsRef.current.draggable;\r
          if (press.moving) settingsRef.current.onDragStart?.();\r
        }\r
        press.samples.push({ x: point.x, y: point.y, t: performance.now() });\r
        if (press.samples.length > 8) press.samples.shift();\r
      }\r
      wake();\r
    };\r
\r
    const onHitLeave = () => {\r
      if (state.press) return;\r
      state.hover = false;\r
      hit.style.cursor = '';\r
      wake();\r
    };\r
\r
    const onHitDown = event => {\r
      const s = settingsRef.current;\r
      if (event.button !== 0 || !sticker.ready) return;\r
      updateHover(event);\r
      if (!state.hover) return;\r
      const point = toParent(event);\r
      state.press = {\r
        id: event.pointerId,\r
        grab: toLocal(point),\r
        origin: point,\r
        pointer: point,\r
        pivot: point,\r
        moving: false,\r
        samples: []\r
      };\r
      state.pivotV = { x: 0, y: 0 };\r
      state.vx = 0;\r
      state.vy = 0;\r
      hit.setPointerCapture?.(event.pointerId);\r
      if (s.draggable) {\r
        hit.style.cursor = 'grabbing';\r
        stack += 1;\r
        root.style.zIndex = String(stack);\r
      }\r
      event.preventDefault();\r
      wake();\r
    };\r
\r
    const onHitUp = event => {\r
      const press = state.press;\r
      if (!press || press.id !== event.pointerId) return;\r
      state.press = null;\r
      if (hit.hasPointerCapture?.(event.pointerId)) hit.releasePointerCapture(event.pointerId);\r
      const now = performance.now();\r
      const recent = press.samples.filter(sample => now - sample.t < 90);\r
      if (press.moving && recent.length > 1 && !reduce) {\r
        const a = recent[0];\r
        const b = recent[recent.length - 1];\r
        const span = Math.max(b.t - a.t, 16) / 1000;\r
        const speed = 2600;\r
        state.vx = clamp((b.x - a.x) / span, -speed, speed);\r
        state.vy = clamp((b.y - a.y) / span, -speed, speed);\r
      }\r
      updateHover(event);\r
      if (event.pointerType !== 'mouse') state.hover = false;\r
      if (press.moving) settingsRef.current.onDragEnd?.();\r
      wake();\r
    };\r
\r
    const onLeaveWindow = () => {\r
      state.pointer.inside = false;\r
      wake();\r
    };\r
\r
    const onVisibility = () => {\r
      last = 0;\r
      wake();\r
    };\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      layout();\r
      wake();\r
    });\r
    resizeObserver.observe(parent);\r
    const intersection = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible) {\r
        last = 0;\r
        wake();\r
      }\r
    });\r
    intersection.observe(parent);\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onLeaveWindow);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    hit.addEventListener('pointermove', onHitMove);\r
    hit.addEventListener('pointerleave', onHitLeave);\r
    hit.addEventListener('pointerdown', onHitDown);\r
    hit.addEventListener('pointerup', onHitUp);\r
    hit.addEventListener('pointercancel', onHitUp);\r
    load(settingsRef.current.imageSrc);\r
    layout();\r
    wakeRef.current = () => {\r
      layout();\r
      wake();\r
    };\r
    wake();\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      document.documentElement.removeEventListener('pointerleave', onLeaveWindow);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      hit.removeEventListener('pointermove', onHitMove);\r
      hit.removeEventListener('pointerleave', onHitLeave);\r
      hit.removeEventListener('pointerdown', onHitDown);\r
      hit.removeEventListener('pointerup', onHitUp);\r
      hit.removeEventListener('pointercancel', onHitUp);\r
      gl.deleteTexture(texture);\r
      targets.forEach(target => {\r
        gl.deleteTexture(target.texture);\r
        gl.deleteFramebuffer(target.buffer);\r
      });\r
      gl.deleteProgram(post.program);\r
      gl.deleteBuffer(vertexBuffer);\r
      gl.deleteBuffer(indexBuffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(program.program);\r
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
      ref={rootRef}\r
      className={['pointer-events-none absolute left-0 top-0 will-change-transform', className]\r
        .filter(Boolean)\r
        .join(' ')}\r
      style={style}\r
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className="pointer-events-none block h-full w-full" aria-hidden="true" />\r
      <div\r
        ref={hitRef}\r
        className="pointer-events-auto absolute left-1/2 top-1/2 touch-none select-none [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none]"\r
      />\r
    </div>\r
  );\r
};\r
\r
export default StickerPeel;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties, type HTMLAttributes } from 'react';\r
import './StickerPeel.css';\r
\r
export type StickerFinish = 'gloss' | 'matte' | 'holo';\r
\r
export interface StickerPeelProps\r
  extends Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'draggable' | 'onDragStart' | 'onDragEnd'> {\r
  imageSrc: string;\r
  width?: number;\r
  rotate?: number;\r
  peelDirection?: number;\r
  peelBackHoverPct?: number;\r
  peelBackActivePct?: number;\r
  curlRadius?: number;\r
  finish?: StickerFinish;\r
  backColor?: string;\r
  lightingIntensity?: number;\r
  shadowIntensity?: number;\r
  followPointer?: boolean;\r
  draggable?: boolean;\r
  swing?: number;\r
  friction?: number;\r
  bounce?: number;\r
  intro?: boolean;\r
  initialPosition?: 'center' | { x: number; y: number };\r
  onDragStart?: () => void;\r
  onDragEnd?: () => void;\r
  dpr?: number;\r
  style?: CSSProperties;\r
}\r
\r
type Settings = {\r
  imageSrc: string;\r
  width: number;\r
  rotate: number;\r
  peelDirection: number;\r
  hoverPeel: number;\r
  activePeel: number;\r
  curlRadius: number;\r
  finish: number;\r
  backColor: string;\r
  lighting: number;\r
  shadow: number;\r
  followPointer: boolean;\r
  draggable: boolean;\r
  swing: number;\r
  friction: number;\r
  bounce: number;\r
  intro: boolean;\r
  initialPosition: 'center' | { x: number; y: number };\r
  onDragStart?: () => void;\r
  onDragEnd?: () => void;\r
  dpr?: number;\r
};\r
\r
type Point = { x: number; y: number };\r
\r
type SpringState = Record<'swing' | 'swingV' | 'peel' | 'peelV' | 'lift' | 'liftV', number>;\r
\r
type Press = {\r
  id: number;\r
  grab: Point;\r
  origin: Point;\r
  pointer: Point;\r
  pivot: Point;\r
  moving: boolean;\r
  samples: { x: number; y: number; t: number }[];\r
};\r
\r
type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };\r
\r
type Target = { texture: WebGLTexture; buffer: WebGLFramebuffer; width: number; height: number };\r
\r
const GRID = 96;\r
const PAD = 0.18;\r
const MAX_TEXTURE = 1024;\r
const MASK_SIZE = 96;\r
const LIGHT_HEIGHT = 260;\r
const FINISHES = { gloss: 0, matte: 1, holo: 2 };\r
let stack = 1;\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aGrid;\r
uniform vec2 uCanvas;\r
uniform vec2 uMesh;\r
uniform vec2 uCenter;\r
uniform vec2 uDir;\r
uniform float uFold;\r
uniform float uRadius;\r
uniform float uAngle;\r
uniform float uScale;\r
uniform float uLift;\r
uniform int uPass;\r
uniform vec2 uShadowOffset;\r
uniform vec2 uShadowSlope;\r
out vec2 vUv;\r
out float vFold;\r
out vec3 vNormal;\r
out vec3 vPos;\r
out float vHeight;\r
out float vCurl;\r
const float PI = 3.14159265;\r
\r
void main() {\r
  vec2 local = (aGrid - 0.5) * uMesh;\r
  float s = dot(local, uDir);\r
  float d = uFold - s;\r
  vec3 normal = vec3(0.0, 0.0, 1.0);\r
  float z = 0.0;\r
  vec2 p = local;\r
  if (d > 0.0) {\r
    float theta = d / uRadius;\r
    float along = uFold + d - PI * uRadius;\r
    z = 2.0 * uRadius;\r
    normal = vec3(0.0, 0.0, -1.0);\r
    if (theta < PI) {\r
      along = uFold - uRadius * sin(theta);\r
      z = uRadius * (1.0 - cos(theta));\r
      normal = vec3(uDir * sin(theta), cos(theta));\r
    }\r
    p += (along - s) * uDir;\r
  }\r
  float c = cos(uAngle);\r
  float sn = sin(uAngle);\r
  vec2 turned = vec2(c * p.x - sn * p.y, sn * p.x + c * p.y) * uScale;\r
  vNormal = vec3(c * normal.x - sn * normal.y, sn * normal.x + c * normal.y, normal.z);\r
  vUv = aGrid;\r
  vFold = d;\r
  vCurl = z * uScale;\r
  float height = z * uScale + uLift;\r
  vec2 screen = uCenter + turned;\r
  float depth = 0.0;\r
  if (uPass == 0 || uPass == 2) {\r
    vHeight = uPass == 0 ? height : z * uScale;\r
    screen += uShadowOffset + uShadowSlope * vHeight;\r
  } else {\r
    vHeight = height;\r
    depth = clamp(-height / 1000.0, -1.0, 1.0);\r
  }\r
  vPos = vec3(uCenter + turned, height);\r
  gl_Position = vec4(screen.x / uCanvas.x * 2.0 - 1.0, 1.0 - screen.y / uCanvas.y * 2.0, depth, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform sampler2D uImage;\r
uniform int uPass;\r
uniform int uFinish;\r
uniform vec3 uBack;\r
uniform vec3 uLight;\r
uniform float uShine;\r
uniform float uShadow;\r
uniform float uTexel;\r
uniform float uLod;\r
uniform float uRadius;\r
uniform vec2 uGlint;\r
in vec2 vUv;\r
in float vFold;\r
in vec3 vNormal;\r
in vec3 vPos;\r
in float vHeight;\r
in float vCurl;\r
out vec4 outColor;\r
\r
float hash(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * 0.1031);\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.x + q.y) * q.z);\r
}\r
\r
vec3 spectrum(float t) {\r
  t = fract(t) * 6.0;\r
  vec3 a = vec3(1.0, 0.478, 0.46);\r
  vec3 b = vec3(1.0, 0.928, 0.38);\r
  vec3 c = vec3(0.659, 1.0, 0.38);\r
  vec3 d = vec3(0.52, 1.0, 0.968);\r
  vec3 e = vec3(0.48, 0.584, 1.0);\r
  vec3 f = vec3(0.68, 0.52, 1.0);\r
  if (t < 1.0) return mix(a, b, t);\r
  if (t < 2.0) return mix(b, c, t - 1.0);\r
  if (t < 3.0) return mix(c, d, t - 2.0);\r
  if (t < 4.0) return mix(d, e, t - 3.0);\r
  if (t < 5.0) return mix(e, f, t - 4.0);\r
  return mix(f, a, t - 5.0);\r
}\r
\r
float bars(float t) {\r
  t = fract(t) * 12.0;\r
  if (t < 3.8) return mix(0.08, 0.6, t / 3.8);\r
  if (t < 4.5) return mix(0.6, 0.72, (t - 3.8) / 0.7);\r
  if (t < 5.2) return mix(0.72, 0.6, (t - 4.5) / 0.7);\r
  if (t < 10.0) return mix(0.6, 0.08, (t - 5.2) / 4.8);\r
  return 0.08;\r
}\r
\r
void main() {\r
  if (uPass == 0) {\r
    float alpha;\r
    if (vFold > 0.0) {\r
      alpha = textureLod(uImage, vUv, log2(max(1.5 * uTexel, 1.0))).a * (1.0 - smoothstep(0.0, uRadius, vCurl));\r
    } else {\r
      alpha = textureLod(uImage, vUv, log2(max((1.2 + vHeight * 0.55) * uTexel, 1.0))).a;\r
    }\r
    outColor = vec4(0.0, 0.0, 0.0, alpha * uShadow / (1.0 + vHeight * 0.03));\r
    return;\r
  }\r
  if (uPass == 2) {\r
    if (vFold <= 0.0) discard;\r
    float alpha = textureLod(uImage, vUv, log2(max(uTexel, 1.0))).a * smoothstep(0.0, uRadius, vCurl);\r
    outColor = vec4(alpha);\r
    return;\r
  }\r
  if (uPass == 1 && vFold > 0.0) discard;\r
  if (uPass == 3 && vFold <= 0.0) discard;\r
  vec4 art = textureLod(uImage, vUv, uLod);\r
  if (art.a < 0.004) discard;\r
  bool front = vNormal.z >= 0.0;\r
  vec3 n = normalize(front ? vNormal : -vNormal);\r
  vec3 toLight = normalize(uLight - vPos);\r
  vec3 halfway = normalize(toLight + vec3(0.0, 0.0, 1.0));\r
  float diffuse = max(dot(n, toLight), 0.0);\r
  float nh = max(dot(n, halfway), 0.0);\r
  vec3 key = normalize(vec3(-0.45, -0.6, 0.66));\r
  float shade = clamp(0.5 + 0.25 * dot(n, key) / key.z + 0.25 * n.z, 0.5, front ? 1.0 : 1.08);\r
  if (uPass == 1) shade = 1.0;\r
  vec3 color;\r
  if (!front) {\r
    float grain = hash(floor(vUv * 700.0)) * 0.06 - 0.03;\r
    color = uBack * (0.7 + 0.3 * diffuse + grain) * art.a + vec3(pow(nh, 24.0) * 0.2 * uShine) * art.a;\r
  } else if (uFinish == 1) {\r
    color = art.rgb * (0.8 + 0.22 * diffuse) + vec3(pow(nh, 8.0) * 0.08 * uShine) * art.a;\r
  } else if (uFinish == 2) {\r
    vec3 albedo = art.rgb / art.a;\r
    float lum = dot(albedo, vec3(0.299, 0.587, 0.114));\r
    float foil = smoothstep(0.5, 0.92, lum);\r
    vec2 q = vUv - uGlint;\r
    float near = exp(-dot(q, q) * 3.0);\r
    float tilt = dot(n.xy, vec2(0.6, 0.8)) * 1.6;\r
    vec3 rainbow = spectrum((vUv.x + vUv.y) * 0.85 - (uGlint.x + uGlint.y) * 1.2 + tilt);\r
    float streak = bars((vUv.x - vUv.y) * 2.6 + uGlint.x * 1.8 - uGlint.y * 0.6 + tilt * 0.5);\r
    float band = smoothstep(0.32, 0.7, streak);\r
    vec3 silver = vec3(0.8, 0.82, 0.86) * (0.88 + 0.16 * diffuse);\r
    vec3 film = mix(silver, rainbow * 1.08, clamp(band * (0.55 + 0.45 * near) + 0.18 * near, 0.0, 1.0));\r
    vec3 ink = albedo * (0.86 + 0.14 * diffuse) + rainbow * band * 0.22 * (0.4 + 0.6 * near);\r
    vec3 base = mix(albedo * (0.86 + 0.14 * diffuse), mix(ink, film, foil), uShine * 0.6 + 0.4);\r
    vec2 cell = floor(vUv * 180.0);\r
    vec2 jitter = vec2(hash(cell), hash(cell + 7.3)) * 0.6 + 0.2;\r
    float dist = length(fract(vUv * 180.0) - jitter);\r
    vec3 facet = normalize(vec3(vec2(hash(cell + 2.1), hash(cell + 5.7)) * 2.0 - 1.0, 1.6));\r
    float glint = pow(max(dot(facet, halfway), 0.0), 60.0) * smoothstep(0.32, 0.05, dist) * step(0.55, hash(cell + 3.1)) * (0.15 + 0.85 * foil);\r
    color = (base + spectrum(hash(cell) + uGlint.x) * glint * 1.6 * uShine + vec3(pow(nh, 140.0) * 0.4 * uShine)) * art.a;\r
  } else {\r
    color = art.rgb * (0.86 + 0.16 * diffuse) + vec3(pow(nh, 220.0) * 0.4 + pow(nh, 24.0) * 0.03) * uShine * art.a;\r
  }\r
  float bend = uPass == 3 ? smoothstep(0.0, uRadius * 0.6, vCurl) : 0.0;\r
  float glare = pow(max(dot(n, normalize(key + vec3(0.0, 0.0, 1.0))), 0.0), 28.0) * bend * (0.18 + 0.3 * uShine);\r
  outColor = vec4(min(color * shade + vec3(glare) * art.a, vec3(art.a)), art.a);\r
}\`;\r
\r
const POST_VERTEX = \`#version 300 es\r
out vec2 vUv;\r
void main() {\r
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\r
  vUv = p;\r
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const POST_FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uSource;\r
uniform vec2 uStep;\r
uniform float uSigma;\r
uniform float uStrength;\r
uniform int uMode;\r
in vec2 vUv;\r
out vec4 outColor;\r
\r
void main() {\r
  if (uMode == 1) {\r
    outColor = vec4(0.0, 0.0, 0.0, texture(uSource, vUv).a * uStrength);\r
    return;\r
  }\r
  vec4 sum = vec4(0.0);\r
  float total = 0.0;\r
  for (int i = -8; i <= 8; i++) {\r
    float offset = float(i);\r
    float weight = exp(-0.5 * offset * offset / (uSigma * uSigma));\r
    sum += texture(uSource, vUv + uStep * offset) * weight;\r
    total += weight;\r
  }\r
  outColor = sum / total;\r
}\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
const wrapAngle = (angle: number) => Math.atan2(Math.sin(angle), Math.cos(angle));\r
const toRadians = (degrees: number) => (degrees * Math.PI) / 180;\r
\r
const spring = (\r
  state: SpringState,\r
  key: 'swing' | 'peel' | 'lift',\r
  target: number,\r
  frequency: number,\r
  damping: number,\r
  dt: number\r
) => {\r
  const omega = 2 * Math.PI * frequency;\r
  const velocity = \`\${key}V\` as 'swingV' | 'peelV' | 'liftV';\r
  state[velocity] += (omega * omega * (target - state[key]) - 2 * damping * omega * state[velocity]) * dt;\r
  state[key] += state[velocity] * dt;\r
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
const link = (gl: WebGL2RenderingContext, vertexSource: string, fragmentSource: string): Program | null => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);\r
  const program = gl.createProgram();\r
  if (!vertex || !fragment || !program) return null;\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
  gl.bindAttribLocation(program, 0, 'aGrid');\r
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
    if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const convexHull = (points: [number, number][]) => {\r
  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);\r
  if (sorted.length < 3) return sorted;\r
  const cross = (o: [number, number], a: [number, number], b: [number, number]) =>\r
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);\r
  const lower: [number, number][] = [];\r
  sorted.forEach(point => {\r
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) lower.pop();\r
    lower.push(point);\r
  });\r
  const upper: [number, number][] = [];\r
  for (let i = sorted.length - 1; i >= 0; i--) {\r
    const point = sorted[i];\r
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) upper.pop();\r
    upper.push(point);\r
  }\r
  return lower.slice(0, -1).concat(upper.slice(0, -1));\r
};\r
\r
const StickerPeel = ({\r
  imageSrc,\r
  width = 200,\r
  rotate = 0,\r
  peelDirection = 0,\r
  peelBackHoverPct = 25,\r
  peelBackActivePct = 40,\r
  curlRadius = 12,\r
  finish = 'gloss',\r
  backColor = '#d4d4d8',\r
  lightingIntensity = 0.5,\r
  shadowIntensity = 0.6,\r
  followPointer = true,\r
  draggable = true,\r
  swing = 1,\r
  friction = 0.5,\r
  bounce = 0.35,\r
  intro = true,\r
  initialPosition = 'center',\r
  onDragStart,\r
  onDragEnd,\r
  dpr,\r
  className = '',\r
  style,\r
  ...rest\r
}: StickerPeelProps) => {\r
  const rootRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const hitRef = useRef<HTMLDivElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings: Settings = {\r
    imageSrc,\r
    width: Math.max(16, width),\r
    rotate: toRadians(rotate),\r
    peelDirection: toRadians(peelDirection),\r
    hoverPeel: clamp(peelBackHoverPct, 0, 100) / 100,\r
    activePeel: clamp(peelBackActivePct, 0, 100) / 100,\r
    curlRadius: Math.max(2, curlRadius),\r
    finish: FINISHES[finish] ?? 0,\r
    backColor,\r
    lighting: clamp(lightingIntensity, 0, 1),\r
    shadow: clamp(shadowIntensity, 0, 1),\r
    followPointer,\r
    draggable,\r
    swing: clamp(swing, 0, 3),\r
    friction: clamp(friction, 0, 1),\r
    bounce: clamp(bounce, 0, 1),\r
    intro,\r
    initialPosition,\r
    onDragStart,\r
    onDragEnd,\r
    dpr\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    const canvas = canvasRef.current;\r
    const hit = hitRef.current;\r
    const parent = root?.parentElement;\r
    const gl = canvas?.getContext('webgl2', {\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: true,\r
      depth: true,\r
      stencil: false\r
    });\r
    if (!root || !canvas || !hit || !parent || !gl) return undefined;\r
\r
    const program = link(gl, VERTEX, FRAGMENT);\r
    const post = link(gl, POST_VERTEX, POST_FRAGMENT);\r
    if (!program || !post) return undefined;\r
    const u = program.uniforms;\r
    const pu = post.uniforms;\r
    const targets: Target[] = [0, 1].map(() => {\r
      const target = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, target);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      const buffer = gl.createFramebuffer();\r
      return { texture: target, buffer, width: 0, height: 0 };\r
    });\r
    const sizeTargets = () => {\r
      const width = Math.max(1, Math.round(view.size / 2));\r
      const height = width;\r
      targets.forEach(target => {\r
        if (target.width === width && target.height === height) return;\r
        target.width = width;\r
        target.height = height;\r
        gl.bindTexture(gl.TEXTURE_2D, target.texture);\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.buffer);\r
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target.texture, 0);\r
      });\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
    };\r
\r
    const vertices = new Float32Array((GRID + 1) * (GRID + 1) * 2);\r
    for (let y = 0; y <= GRID; y++) {\r
      for (let x = 0; x <= GRID; x++) {\r
        const i = (y * (GRID + 1) + x) * 2;\r
        vertices[i] = x / GRID;\r
        vertices[i + 1] = y / GRID;\r
      }\r
    }\r
    const indices = new Uint16Array(GRID * GRID * 6);\r
    let cursor = 0;\r
    for (let y = 0; y < GRID; y++) {\r
      for (let x = 0; x < GRID; x++) {\r
        const a = y * (GRID + 1) + x;\r
        const b = a + 1;\r
        const c = a + GRID + 1;\r
        const d = c + 1;\r
        indices.set([a, b, d, a, d, c], cursor);\r
        cursor += 6;\r
      }\r
    }\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    const vertexBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    const indexBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);\r
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);\r
\r
    const texture = gl.createTexture();\r
    const scratch = document.createElement('canvas');\r
    const scratchContext = scratch.getContext('2d', { willReadFrequently: true });\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const colorCache = new Map<string, number[]>();\r
    const parse = (value: string): number[] => {\r
      const key = String(value);\r
      const cached = colorCache.get(key);\r
      if (cached) return cached;\r
      let rgb = [0.83, 0.83, 0.85];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#d4d4d8';\r
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
    const sticker: {\r
      ready: boolean;\r
      aspect: number;\r
      meshX: number;\r
      meshY: number;\r
      texel: number;\r
      mask: Uint8Array | null;\r
      maskW: number;\r
      maskH: number;\r
      hull: [number, number][];\r
    } = { ready: false, aspect: 1, meshX: 1, meshY: 1, texel: 1, mask: null, maskW: 1, maskH: 1, hull: [] };\r
    const view = { ratio: 1, size: 1, density: 0 };\r
    const bounds = { width: 1, height: 1 };\r
    const state = {\r
      x: 0,\r
      y: 0,\r
      vx: 0,\r
      vy: 0,\r
      placed: false,\r
      swing: 0,\r
      swingV: 0,\r
      peel: 0,\r
      peelV: 0,\r
      lift: 0,\r
      liftV: 0,\r
      dir: settingsRef.current.peelDirection,\r
      hover: false,\r
      local: { x: 0, y: 0 },\r
      press: null as Press | null,\r
      pivotV: { x: 0, y: 0 },\r
      light: { x: 0, y: 0, z: LIGHT_HEIGHT },\r
      pointer: { x: 0, y: 0, inside: false },\r
      intro: settingsRef.current.intro && !reduce ? 0 : 1\r
    };\r
    if (state.intro < 1) {\r
      state.lift = 1.5;\r
      state.peel = 0.3;\r
      state.swing = 0.1;\r
      state.dir += 0.6;\r
    }\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let loadedSrc: string | null = null;\r
    let alive = true;\r
\r
    const height = () => settingsRef.current.width * sticker.aspect;\r
\r
    const extentAlong = (dx: number, dy: number): [number, number] => {\r
      const s = settingsRef.current;\r
      const w = s.width;\r
      const h = height();\r
      if (!sticker.hull.length) {\r
        const half = (Math.abs(dx) * w + Math.abs(dy) * h) / 2;\r
        return [-half, half];\r
      }\r
      let min = Infinity;\r
      let max = -Infinity;\r
      sticker.hull.forEach(([px, py]) => {\r
        const value = px * w * dx + py * h * dy;\r
        if (value < min) min = value;\r
        if (value > max) max = value;\r
      });\r
      return [min, max];\r
    };\r
\r
    const load = (src: string) => {\r
      loadedSrc = src;\r
      sticker.ready = false;\r
      if (!src) return;\r
      const image = new Image();\r
      image.crossOrigin = 'anonymous';\r
      image.decoding = 'async';\r
      image.onload = () => {\r
        if (!alive || loadedSrc !== src || !scratchContext) return;\r
        const iw = image.naturalWidth || 1;\r
        const ih = image.naturalHeight || 1;\r
        const fit = Math.min(1, MAX_TEXTURE / (Math.max(iw, ih) * (1 + 2 * PAD)));\r
        const w = Math.max(1, Math.round(iw * fit));\r
        const h = Math.max(1, Math.round(ih * fit));\r
        const padX = Math.round(w * PAD);\r
        const padY = Math.round(h * PAD);\r
        scratch.width = w + padX * 2;\r
        scratch.height = h + padY * 2;\r
        scratchContext.clearRect(0, 0, scratch.width, scratch.height);\r
        scratchContext.drawImage(image, padX, padY, w, h);\r
        gl.bindTexture(gl.TEXTURE_2D, texture);\r
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, scratch);\r
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);\r
        gl.generateMipmap(gl.TEXTURE_2D);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
        sticker.aspect = ih / iw;\r
        sticker.meshX = scratch.width / w;\r
        sticker.meshY = scratch.height / h;\r
        sticker.texel = scratch.width;\r
        const maskW = Math.max(8, Math.round(MASK_SIZE * Math.min(1, iw / ih)));\r
        const maskH = Math.max(8, Math.round(MASK_SIZE * Math.min(1, ih / iw)));\r
        scratch.width = maskW;\r
        scratch.height = maskH;\r
        scratchContext.clearRect(0, 0, maskW, maskH);\r
        scratchContext.drawImage(image, 0, 0, maskW, maskH);\r
        const pixels = scratchContext.getImageData(0, 0, maskW, maskH).data;\r
        const mask = new Uint8Array(maskW * maskH).fill(255);\r
        const queue: number[] = [];\r
        const visit = (x: number, y: number) => {\r
          const i = y * maskW + x;\r
          if (mask[i] === 0 || pixels[i * 4 + 3] > 100) return;\r
          mask[i] = 0;\r
          queue.push(i);\r
        };\r
        for (let x = 0; x < maskW; x++) {\r
          visit(x, 0);\r
          visit(x, maskH - 1);\r
        }\r
        for (let y = 0; y < maskH; y++) {\r
          visit(0, y);\r
          visit(maskW - 1, y);\r
        }\r
        while (queue.length) {\r
          const i = queue.pop() as number;\r
          const x = i % maskW;\r
          const y = (i - x) / maskW;\r
          if (x > 0) visit(x - 1, y);\r
          if (x < maskW - 1) visit(x + 1, y);\r
          if (y > 0) visit(x, y - 1);\r
          if (y < maskH - 1) visit(x, y + 1);\r
        }\r
        const points: [number, number][] = [];\r
        for (let y = 0; y < maskH; y++) {\r
          for (let x = 0; x < maskW; x++) {\r
            if (pixels[(y * maskW + x) * 4 + 3] > 127) points.push([(x + 0.5) / maskW - 0.5, (y + 0.5) / maskH - 0.5]);\r
          }\r
        }\r
        sticker.mask = mask;\r
        sticker.maskW = maskW;\r
        sticker.maskH = maskH;\r
        sticker.hull = convexHull(points);\r
        sticker.ready = true;\r
        layout();\r
        wake();\r
      };\r
      image.src = src;\r
    };\r
\r
    const layout = () => {\r
      const s = settingsRef.current;\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      bounds.width = Math.max(1, parent.clientWidth);\r
      bounds.height = Math.max(1, parent.clientHeight);\r
      const h = height();\r
      const size = Math.ceil(Math.hypot(s.width, h) * 1.16 + 2 * (36 + s.curlRadius));\r
      if (size !== view.size || view.ratio !== view.density) {\r
        view.size = size;\r
        view.density = view.ratio;\r
        root.style.width = \`\${size}px\`;\r
        root.style.height = \`\${size}px\`;\r
        canvas.width = Math.round(size * view.ratio);\r
        canvas.height = Math.round(size * view.ratio);\r
      }\r
      hit.style.width = \`\${s.width}px\`;\r
      hit.style.height = \`\${h}px\`;\r
      if (!state.placed) {\r
        const start = s.initialPosition;\r
        const offset = start && typeof start === 'object' ? start : { x: 0, y: 0 };\r
        state.x = bounds.width / 2 + (offset.x || 0);\r
        state.y = bounds.height / 2 + (offset.y || 0);\r
        state.light = { x: state.x - s.width * 0.45, y: state.y - h * 0.9, z: LIGHT_HEIGHT * 1.6 };\r
        state.placed = true;\r
      }\r
      confine();\r
    };\r
\r
    const reach = () => {\r
      const s = settingsRef.current;\r
      const angle = s.rotate + state.swing;\r
      const grow = 1 + 0.07 * Math.max(0, state.lift);\r
      const w = (s.width / 2) * grow;\r
      const h = (height() / 2) * grow;\r
      const c = Math.abs(Math.cos(angle));\r
      const sn = Math.abs(Math.sin(angle));\r
      return { x: w * c + h * sn, y: w * sn + h * c };\r
    };\r
\r
    const confine = () => {\r
      const s = settingsRef.current;\r
      const half = reach();\r
      const minX = Math.min(half.x, bounds.width / 2);\r
      const maxX = Math.max(bounds.width - half.x, bounds.width / 2);\r
      const minY = Math.min(half.y, bounds.height / 2);\r
      const maxY = Math.max(bounds.height - half.y, bounds.height / 2);\r
      if (state.x < minX) {\r
        state.x = minX;\r
        if (state.vx < 0) state.vx = -state.vx * s.bounce;\r
      } else if (state.x > maxX) {\r
        state.x = maxX;\r
        if (state.vx > 0) state.vx = -state.vx * s.bounce;\r
      }\r
      if (state.y < minY) {\r
        state.y = minY;\r
        if (state.vy < 0) state.vy = -state.vy * s.bounce;\r
      } else if (state.y > maxY) {\r
        state.y = maxY;\r
        if (state.vy > 0) state.vy = -state.vy * s.bounce;\r
      }\r
    };\r
\r
    const toParent = (event: PointerEvent): Point => {\r
      const rect = parent.getBoundingClientRect();\r
      return { x: event.clientX - rect.left - parent.clientLeft, y: event.clientY - rect.top - parent.clientTop };\r
    };\r
\r
    const toLocal = (point: Point): Point => {\r
      const s = settingsRef.current;\r
      const angle = -(s.rotate + state.swing);\r
      const scale = 1 + 0.07 * Math.max(0, state.lift);\r
      const dx = point.x - state.x;\r
      const dy = point.y - state.y;\r
      return {\r
        x: (Math.cos(angle) * dx - Math.sin(angle) * dy) / scale,\r
        y: (Math.sin(angle) * dx + Math.cos(angle) * dy) / scale\r
      };\r
    };\r
\r
    const solid = (local: Point) => {\r
      if (!sticker.mask) return false;\r
      const s = settingsRef.current;\r
      const mx = Math.floor((local.x / s.width + 0.5) * sticker.maskW);\r
      const my = Math.floor((local.y / height() + 0.5) * sticker.maskH);\r
      if (mx < 0 || my < 0 || mx >= sticker.maskW || my >= sticker.maskH) return false;\r
      return sticker.mask[my * sticker.maskW + mx] > 100;\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      const size = view.size;\r
      root.style.transform = \`translate3d(\${state.x - size / 2}px, \${state.y - size / 2}px, 0)\`;\r
      const angle = s.rotate + state.swing;\r
      const scale = 1 + 0.07 * Math.max(0, state.lift);\r
      hit.style.transform = \`translate(-50%, -50%) rotate(\${angle}rad) scale(\${scale})\`;\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clearDepth(1);\r
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);\r
      if (!sticker.ready) return;\r
      const w = s.width;\r
      const h = height();\r
      const dx = -Math.sin(state.dir);\r
      const dy = Math.cos(state.dir);\r
      const [start, end] = extentAlong(dx, dy);\r
      const peel = clamp(state.peel, 0, 1);\r
      const fold = start + peel * (end - start);\r
      const lift = Math.max(0, state.lift);\r
      const center = size / 2;\r
      const count = GRID * GRID * 6;\r
      const peeled = peel > 0.001;\r
      gl.useProgram(program.program);\r
      gl.bindVertexArray(vao);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.uniform1i(u.uImage, 0);\r
      gl.uniform2f(u.uCanvas, size, size);\r
      gl.uniform2f(u.uMesh, w * sticker.meshX, h * sticker.meshY);\r
      gl.uniform2f(u.uCenter, center, center);\r
      gl.uniform2f(u.uDir, dx, dy);\r
      gl.uniform1f(u.uFold, fold);\r
      gl.uniform1f(u.uRadius, s.curlRadius);\r
      gl.uniform1f(u.uAngle, angle);\r
      gl.uniform1f(u.uScale, scale);\r
      gl.uniform1f(u.uLift, lift * 26);\r
      gl.uniform2f(u.uShadowOffset, 1.2, 2.4);\r
      gl.uniform2f(u.uShadowSlope, 0.28, 0.55);\r
      gl.uniform1i(u.uFinish, s.finish);\r
      gl.uniform3fv(u.uBack, parse(s.backColor));\r
      gl.uniform3f(u.uLight, state.light.x - (state.x - center), state.light.y - (state.y - center), state.light.z);\r
      gl.uniform1f(u.uShine, s.lighting);\r
      gl.uniform1f(u.uShadow, s.shadow * 0.55);\r
      gl.uniform1f(u.uTexel, sticker.texel / (w * sticker.meshX));\r
      gl.uniform1f(u.uLod, Math.max(0, Math.log2(sticker.texel / (w * sticker.meshX * scale * view.ratio))));\r
      const glint = toLocal(state.light);\r
      gl.uniform2f(u.uGlint, glint.x / (w * sticker.meshX) + 0.5, glint.y / (h * sticker.meshY) + 0.5);\r
      gl.disable(gl.DEPTH_TEST);\r
      if (peeled) {\r
        sizeTargets();\r
        const [first, second] = targets;\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, first.buffer);\r
        gl.viewport(0, 0, first.width, first.height);\r
        gl.clear(gl.COLOR_BUFFER_BIT);\r
        gl.disable(gl.BLEND);\r
        gl.uniform1i(u.uPass, 2);\r
        gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);\r
        gl.useProgram(post.program);\r
        gl.uniform1i(pu.uSource, 1);\r
        gl.uniform1i(pu.uMode, 0);\r
        gl.uniform1f(pu.uSigma, Math.min(4, (2.5 + s.curlRadius * 0.15) / 2));\r
        gl.activeTexture(gl.TEXTURE1);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, second.buffer);\r
        gl.bindTexture(gl.TEXTURE_2D, first.texture);\r
        gl.uniform2f(pu.uStep, 1 / first.width, 0);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, first.buffer);\r
        gl.bindTexture(gl.TEXTURE_2D, second.texture);\r
        gl.uniform2f(pu.uStep, 0, 1 / first.height);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
        gl.viewport(0, 0, canvas.width, canvas.height);\r
        gl.useProgram(program.program);\r
        gl.activeTexture(gl.TEXTURE0);\r
      }\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      gl.uniform1i(u.uPass, 0);\r
      gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);\r
      gl.uniform1i(u.uPass, 1);\r
      gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);\r
      if (peeled) {\r
        gl.useProgram(post.program);\r
        gl.activeTexture(gl.TEXTURE1);\r
        gl.bindTexture(gl.TEXTURE_2D, targets[0].texture);\r
        gl.uniform1i(pu.uMode, 1);\r
        gl.uniform1f(pu.uStrength, s.shadow * 0.6);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
        gl.useProgram(program.program);\r
        gl.activeTexture(gl.TEXTURE0);\r
        gl.enable(gl.DEPTH_TEST);\r
        gl.depthFunc(gl.LESS);\r
        gl.uniform1i(u.uPass, 3);\r
        gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);\r
        gl.disable(gl.DEPTH_TEST);\r
      }\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.001, 1 / 30) : 1 / 60;\r
      last = now;\r
      if (s.imageSrc !== loadedSrc) load(s.imageSrc);\r
      const h = height();\r
      if (state.intro < 1 && sticker.ready) state.intro = Math.min(1, state.intro + dt / 1.1);\r
      const press = state.press;\r
      const drag = press && press.moving ? press : null;\r
      if (drag) {\r
        const target = drag.pointer;\r
        const prev = drag.pivot;\r
        const smoothing = 1 - Math.exp(-dt / 0.045);\r
        const vx = state.pivotV.x + ((target.x - prev.x) / dt - state.pivotV.x) * smoothing;\r
        const vy = state.pivotV.y + ((target.y - prev.y) / dt - state.pivotV.y) * smoothing;\r
        const ax = (vx - state.pivotV.x) / dt;\r
        const ay = (vy - state.pivotV.y) / dt;\r
        state.pivotV.x = vx;\r
        state.pivotV.y = vy;\r
        drag.pivot = { x: target.x, y: target.y };\r
        const angle = s.rotate + state.swing;\r
        const rx = -(Math.cos(angle) * drag.grab.x - Math.sin(angle) * drag.grab.y);\r
        const ry = -(Math.sin(angle) * drag.grab.x + Math.cos(angle) * drag.grab.y);\r
        const inertia = (s.width * s.width + h * h) / 12 + rx * rx + ry * ry;\r
        const torque = (rx * -clamp(ay, -24000, 24000) - ry * -clamp(ax, -24000, 24000)) / inertia;\r
        const omega = 2 * Math.PI * 1.5;\r
        state.swingV += (torque * 1.1 * s.swing - omega * omega * state.swing - 2 * 0.45 * omega * state.swingV) * dt;\r
        state.swing = clamp(state.swing + state.swingV * dt, -1.2, 1.2);\r
        const turned = s.rotate + state.swing;\r
        const grip = 1 + 0.07 * Math.max(0, state.lift);\r
        state.x = target.x - (Math.cos(turned) * drag.grab.x - Math.sin(turned) * drag.grab.y) * grip;\r
        state.y = target.y - (Math.sin(turned) * drag.grab.x + Math.cos(turned) * drag.grab.y) * grip;\r
        confine();\r
      } else {\r
        spring(state, 'swing', 0, 1.4, 0.32, dt);\r
        const decay = Math.exp(-dt * (1.5 + 9 * s.friction));\r
        state.vx *= decay;\r
        state.vy *= decay;\r
        if (Math.hypot(state.vx, state.vy) < 4) {\r
          state.vx = 0;\r
          state.vy = 0;\r
        }\r
        state.x += state.vx * dt;\r
        state.y += state.vy * dt;\r
        confine();\r
      }\r
      const introHold = state.intro < 0.2;\r
      const peelTarget = introHold ? 0.3 : press ? s.activePeel : state.hover ? s.hoverPeel : 0;\r
      spring(state, 'peel', peelTarget, press || state.hover ? 3 : 3.6, press || state.hover ? 0.7 : 0.62, dt);\r
      spring(state, 'lift', drag ? 1 : 0, 3.2, 0.55, dt);\r
      let dirTarget = s.peelDirection;\r
      if (press && Math.hypot(press.grab.x, press.grab.y) > Math.min(s.width, h) * 0.12) {\r
        dirTarget = Math.atan2(press.grab.x, -press.grab.y);\r
      } else if (\r
        s.followPointer &&\r
        state.hover &&\r
        Math.hypot(state.local.x, state.local.y) > Math.min(s.width, h) * 0.12\r
      ) {\r
        dirTarget = Math.atan2(state.local.x, -state.local.y);\r
      }\r
      if (!introHold) state.dir += wrapAngle(dirTarget - state.dir) * (1 - Math.exp(-dt / 0.12));\r
      const lightTarget = state.pointer.inside\r
        ? { x: state.pointer.x, y: state.pointer.y, z: LIGHT_HEIGHT }\r
        : { x: state.x - s.width * 0.45, y: state.y - h * 0.9, z: LIGHT_HEIGHT * 1.6 };\r
      const follow = 1 - Math.exp(-dt / 0.08);\r
      state.light.x += (lightTarget.x - state.light.x) * follow;\r
      state.light.y += (lightTarget.y - state.light.y) * follow;\r
      state.light.z += (lightTarget.z - state.light.z) * follow;\r
      canvas.style.opacity = String(clamp(state.intro / 0.12, 0, 1));\r
      draw();\r
      const moving =\r
        (state.intro < 1 && sticker.ready) ||\r
        press ||\r
        Math.abs(state.peel - peelTarget) > 0.0005 ||\r
        Math.abs(state.peelV) > 0.0005 ||\r
        Math.abs(state.lift - (drag ? 1 : 0)) > 0.0005 ||\r
        Math.abs(state.liftV) > 0.0005 ||\r
        Math.abs(state.swing) > 0.0005 ||\r
        Math.abs(state.swingV) > 0.0005 ||\r
        state.vx !== 0 ||\r
        state.vy !== 0 ||\r
        Math.abs(wrapAngle(dirTarget - state.dir)) > 0.002 ||\r
        Math.hypot(lightTarget.x - state.light.x, lightTarget.y - state.light.y, lightTarget.z - state.light.z) > 0.5;\r
      if (moving) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    function wake() {\r
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    }\r
\r
    const updateHover = (event: PointerEvent) => {\r
      const point = toParent(event);\r
      state.local = toLocal(point);\r
      const over = solid(state.local);\r
      if (over !== state.hover) state.hover = over;\r
      hit.style.cursor = over && settingsRef.current.draggable ? (state.press ? 'grabbing' : 'grab') : '';\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const point = toParent(event);\r
      state.pointer.x = point.x;\r
      state.pointer.y = point.y;\r
      state.pointer.inside = point.x >= 0 && point.y >= 0 && point.x <= bounds.width && point.y <= bounds.height;\r
      wake();\r
    };\r
\r
    const onHitMove = (event: PointerEvent) => {\r
      const press = state.press;\r
      if (!press) {\r
        updateHover(event);\r
      } else if (press.id === event.pointerId) {\r
        const point = toParent(event);\r
        press.pointer = point;\r
        if (!press.moving && Math.hypot(point.x - press.origin.x, point.y - press.origin.y) > 3) {\r
          press.moving = settingsRef.current.draggable;\r
          if (press.moving) settingsRef.current.onDragStart?.();\r
        }\r
        press.samples.push({ x: point.x, y: point.y, t: performance.now() });\r
        if (press.samples.length > 8) press.samples.shift();\r
      }\r
      wake();\r
    };\r
\r
    const onHitLeave = () => {\r
      if (state.press) return;\r
      state.hover = false;\r
      hit.style.cursor = '';\r
      wake();\r
    };\r
\r
    const onHitDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      if (event.button !== 0 || !sticker.ready) return;\r
      updateHover(event);\r
      if (!state.hover) return;\r
      const point = toParent(event);\r
      state.press = {\r
        id: event.pointerId,\r
        grab: toLocal(point),\r
        origin: point,\r
        pointer: point,\r
        pivot: point,\r
        moving: false,\r
        samples: []\r
      };\r
      state.pivotV = { x: 0, y: 0 };\r
      state.vx = 0;\r
      state.vy = 0;\r
      hit.setPointerCapture?.(event.pointerId);\r
      if (s.draggable) {\r
        hit.style.cursor = 'grabbing';\r
        stack += 1;\r
        root.style.zIndex = String(stack);\r
      }\r
      event.preventDefault();\r
      wake();\r
    };\r
\r
    const onHitUp = (event: PointerEvent) => {\r
      const press = state.press;\r
      if (!press || press.id !== event.pointerId) return;\r
      state.press = null;\r
      if (hit.hasPointerCapture?.(event.pointerId)) hit.releasePointerCapture(event.pointerId);\r
      const now = performance.now();\r
      const recent = press.samples.filter(sample => now - sample.t < 90);\r
      if (press.moving && recent.length > 1 && !reduce) {\r
        const a = recent[0];\r
        const b = recent[recent.length - 1];\r
        const span = Math.max(b.t - a.t, 16) / 1000;\r
        const speed = 2600;\r
        state.vx = clamp((b.x - a.x) / span, -speed, speed);\r
        state.vy = clamp((b.y - a.y) / span, -speed, speed);\r
      }\r
      updateHover(event);\r
      if (event.pointerType !== 'mouse') state.hover = false;\r
      if (press.moving) settingsRef.current.onDragEnd?.();\r
      wake();\r
    };\r
\r
    const onLeaveWindow = () => {\r
      state.pointer.inside = false;\r
      wake();\r
    };\r
\r
    const onVisibility = () => {\r
      last = 0;\r
      wake();\r
    };\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      layout();\r
      wake();\r
    });\r
    resizeObserver.observe(parent);\r
    const intersection = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible) {\r
        last = 0;\r
        wake();\r
      }\r
    });\r
    intersection.observe(parent);\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onLeaveWindow);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    hit.addEventListener('pointermove', onHitMove);\r
    hit.addEventListener('pointerleave', onHitLeave);\r
    hit.addEventListener('pointerdown', onHitDown);\r
    hit.addEventListener('pointerup', onHitUp);\r
    hit.addEventListener('pointercancel', onHitUp);\r
    load(settingsRef.current.imageSrc);\r
    layout();\r
    wakeRef.current = () => {\r
      layout();\r
      wake();\r
    };\r
    wake();\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      document.documentElement.removeEventListener('pointerleave', onLeaveWindow);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      hit.removeEventListener('pointermove', onHitMove);\r
      hit.removeEventListener('pointerleave', onHitLeave);\r
      hit.removeEventListener('pointerdown', onHitDown);\r
      hit.removeEventListener('pointerup', onHitUp);\r
      hit.removeEventListener('pointercancel', onHitUp);\r
      gl.deleteTexture(texture);\r
      targets.forEach(target => {\r
        gl.deleteTexture(target.texture);\r
        gl.deleteFramebuffer(target.buffer);\r
      });\r
      gl.deleteProgram(post.program);\r
      gl.deleteBuffer(vertexBuffer);\r
      gl.deleteBuffer(indexBuffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(program.program);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div ref={rootRef} className={\`sticker-peel\${className ? \` \${className}\` : ''}\`} style={style} {...rest}>\r
      <canvas ref={canvasRef} className="sticker-peel-canvas" aria-hidden="true" />\r
      <div ref={hitRef} className="sticker-peel-hit" />\r
    </div>\r
  );\r
};\r
\r
export default StickerPeel;\r
`,a=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties, type HTMLAttributes } from 'react';\r
\r
export type StickerFinish = 'gloss' | 'matte' | 'holo';\r
\r
export interface StickerPeelProps\r
  extends Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'draggable' | 'onDragStart' | 'onDragEnd'> {\r
  imageSrc: string;\r
  width?: number;\r
  rotate?: number;\r
  peelDirection?: number;\r
  peelBackHoverPct?: number;\r
  peelBackActivePct?: number;\r
  curlRadius?: number;\r
  finish?: StickerFinish;\r
  backColor?: string;\r
  lightingIntensity?: number;\r
  shadowIntensity?: number;\r
  followPointer?: boolean;\r
  draggable?: boolean;\r
  swing?: number;\r
  friction?: number;\r
  bounce?: number;\r
  intro?: boolean;\r
  initialPosition?: 'center' | { x: number; y: number };\r
  onDragStart?: () => void;\r
  onDragEnd?: () => void;\r
  dpr?: number;\r
  style?: CSSProperties;\r
}\r
\r
type Settings = {\r
  imageSrc: string;\r
  width: number;\r
  rotate: number;\r
  peelDirection: number;\r
  hoverPeel: number;\r
  activePeel: number;\r
  curlRadius: number;\r
  finish: number;\r
  backColor: string;\r
  lighting: number;\r
  shadow: number;\r
  followPointer: boolean;\r
  draggable: boolean;\r
  swing: number;\r
  friction: number;\r
  bounce: number;\r
  intro: boolean;\r
  initialPosition: 'center' | { x: number; y: number };\r
  onDragStart?: () => void;\r
  onDragEnd?: () => void;\r
  dpr?: number;\r
};\r
\r
type Point = { x: number; y: number };\r
\r
type SpringState = Record<'swing' | 'swingV' | 'peel' | 'peelV' | 'lift' | 'liftV', number>;\r
\r
type Press = {\r
  id: number;\r
  grab: Point;\r
  origin: Point;\r
  pointer: Point;\r
  pivot: Point;\r
  moving: boolean;\r
  samples: { x: number; y: number; t: number }[];\r
};\r
\r
type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };\r
\r
type Target = { texture: WebGLTexture; buffer: WebGLFramebuffer; width: number; height: number };\r
\r
const GRID = 96;\r
const PAD = 0.18;\r
const MAX_TEXTURE = 1024;\r
const MASK_SIZE = 96;\r
const LIGHT_HEIGHT = 260;\r
const FINISHES = { gloss: 0, matte: 1, holo: 2 };\r
let stack = 1;\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aGrid;\r
uniform vec2 uCanvas;\r
uniform vec2 uMesh;\r
uniform vec2 uCenter;\r
uniform vec2 uDir;\r
uniform float uFold;\r
uniform float uRadius;\r
uniform float uAngle;\r
uniform float uScale;\r
uniform float uLift;\r
uniform int uPass;\r
uniform vec2 uShadowOffset;\r
uniform vec2 uShadowSlope;\r
out vec2 vUv;\r
out float vFold;\r
out vec3 vNormal;\r
out vec3 vPos;\r
out float vHeight;\r
out float vCurl;\r
const float PI = 3.14159265;\r
\r
void main() {\r
  vec2 local = (aGrid - 0.5) * uMesh;\r
  float s = dot(local, uDir);\r
  float d = uFold - s;\r
  vec3 normal = vec3(0.0, 0.0, 1.0);\r
  float z = 0.0;\r
  vec2 p = local;\r
  if (d > 0.0) {\r
    float theta = d / uRadius;\r
    float along = uFold + d - PI * uRadius;\r
    z = 2.0 * uRadius;\r
    normal = vec3(0.0, 0.0, -1.0);\r
    if (theta < PI) {\r
      along = uFold - uRadius * sin(theta);\r
      z = uRadius * (1.0 - cos(theta));\r
      normal = vec3(uDir * sin(theta), cos(theta));\r
    }\r
    p += (along - s) * uDir;\r
  }\r
  float c = cos(uAngle);\r
  float sn = sin(uAngle);\r
  vec2 turned = vec2(c * p.x - sn * p.y, sn * p.x + c * p.y) * uScale;\r
  vNormal = vec3(c * normal.x - sn * normal.y, sn * normal.x + c * normal.y, normal.z);\r
  vUv = aGrid;\r
  vFold = d;\r
  vCurl = z * uScale;\r
  float height = z * uScale + uLift;\r
  vec2 screen = uCenter + turned;\r
  float depth = 0.0;\r
  if (uPass == 0 || uPass == 2) {\r
    vHeight = uPass == 0 ? height : z * uScale;\r
    screen += uShadowOffset + uShadowSlope * vHeight;\r
  } else {\r
    vHeight = height;\r
    depth = clamp(-height / 1000.0, -1.0, 1.0);\r
  }\r
  vPos = vec3(uCenter + turned, height);\r
  gl_Position = vec4(screen.x / uCanvas.x * 2.0 - 1.0, 1.0 - screen.y / uCanvas.y * 2.0, depth, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform sampler2D uImage;\r
uniform int uPass;\r
uniform int uFinish;\r
uniform vec3 uBack;\r
uniform vec3 uLight;\r
uniform float uShine;\r
uniform float uShadow;\r
uniform float uTexel;\r
uniform float uLod;\r
uniform float uRadius;\r
uniform vec2 uGlint;\r
in vec2 vUv;\r
in float vFold;\r
in vec3 vNormal;\r
in vec3 vPos;\r
in float vHeight;\r
in float vCurl;\r
out vec4 outColor;\r
\r
float hash(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * 0.1031);\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.x + q.y) * q.z);\r
}\r
\r
vec3 spectrum(float t) {\r
  t = fract(t) * 6.0;\r
  vec3 a = vec3(1.0, 0.478, 0.46);\r
  vec3 b = vec3(1.0, 0.928, 0.38);\r
  vec3 c = vec3(0.659, 1.0, 0.38);\r
  vec3 d = vec3(0.52, 1.0, 0.968);\r
  vec3 e = vec3(0.48, 0.584, 1.0);\r
  vec3 f = vec3(0.68, 0.52, 1.0);\r
  if (t < 1.0) return mix(a, b, t);\r
  if (t < 2.0) return mix(b, c, t - 1.0);\r
  if (t < 3.0) return mix(c, d, t - 2.0);\r
  if (t < 4.0) return mix(d, e, t - 3.0);\r
  if (t < 5.0) return mix(e, f, t - 4.0);\r
  return mix(f, a, t - 5.0);\r
}\r
\r
float bars(float t) {\r
  t = fract(t) * 12.0;\r
  if (t < 3.8) return mix(0.08, 0.6, t / 3.8);\r
  if (t < 4.5) return mix(0.6, 0.72, (t - 3.8) / 0.7);\r
  if (t < 5.2) return mix(0.72, 0.6, (t - 4.5) / 0.7);\r
  if (t < 10.0) return mix(0.6, 0.08, (t - 5.2) / 4.8);\r
  return 0.08;\r
}\r
\r
void main() {\r
  if (uPass == 0) {\r
    float alpha;\r
    if (vFold > 0.0) {\r
      alpha = textureLod(uImage, vUv, log2(max(1.5 * uTexel, 1.0))).a * (1.0 - smoothstep(0.0, uRadius, vCurl));\r
    } else {\r
      alpha = textureLod(uImage, vUv, log2(max((1.2 + vHeight * 0.55) * uTexel, 1.0))).a;\r
    }\r
    outColor = vec4(0.0, 0.0, 0.0, alpha * uShadow / (1.0 + vHeight * 0.03));\r
    return;\r
  }\r
  if (uPass == 2) {\r
    if (vFold <= 0.0) discard;\r
    float alpha = textureLod(uImage, vUv, log2(max(uTexel, 1.0))).a * smoothstep(0.0, uRadius, vCurl);\r
    outColor = vec4(alpha);\r
    return;\r
  }\r
  if (uPass == 1 && vFold > 0.0) discard;\r
  if (uPass == 3 && vFold <= 0.0) discard;\r
  vec4 art = textureLod(uImage, vUv, uLod);\r
  if (art.a < 0.004) discard;\r
  bool front = vNormal.z >= 0.0;\r
  vec3 n = normalize(front ? vNormal : -vNormal);\r
  vec3 toLight = normalize(uLight - vPos);\r
  vec3 halfway = normalize(toLight + vec3(0.0, 0.0, 1.0));\r
  float diffuse = max(dot(n, toLight), 0.0);\r
  float nh = max(dot(n, halfway), 0.0);\r
  vec3 key = normalize(vec3(-0.45, -0.6, 0.66));\r
  float shade = clamp(0.5 + 0.25 * dot(n, key) / key.z + 0.25 * n.z, 0.5, front ? 1.0 : 1.08);\r
  if (uPass == 1) shade = 1.0;\r
  vec3 color;\r
  if (!front) {\r
    float grain = hash(floor(vUv * 700.0)) * 0.06 - 0.03;\r
    color = uBack * (0.7 + 0.3 * diffuse + grain) * art.a + vec3(pow(nh, 24.0) * 0.2 * uShine) * art.a;\r
  } else if (uFinish == 1) {\r
    color = art.rgb * (0.8 + 0.22 * diffuse) + vec3(pow(nh, 8.0) * 0.08 * uShine) * art.a;\r
  } else if (uFinish == 2) {\r
    vec3 albedo = art.rgb / art.a;\r
    float lum = dot(albedo, vec3(0.299, 0.587, 0.114));\r
    float foil = smoothstep(0.5, 0.92, lum);\r
    vec2 q = vUv - uGlint;\r
    float near = exp(-dot(q, q) * 3.0);\r
    float tilt = dot(n.xy, vec2(0.6, 0.8)) * 1.6;\r
    vec3 rainbow = spectrum((vUv.x + vUv.y) * 0.85 - (uGlint.x + uGlint.y) * 1.2 + tilt);\r
    float streak = bars((vUv.x - vUv.y) * 2.6 + uGlint.x * 1.8 - uGlint.y * 0.6 + tilt * 0.5);\r
    float band = smoothstep(0.32, 0.7, streak);\r
    vec3 silver = vec3(0.8, 0.82, 0.86) * (0.88 + 0.16 * diffuse);\r
    vec3 film = mix(silver, rainbow * 1.08, clamp(band * (0.55 + 0.45 * near) + 0.18 * near, 0.0, 1.0));\r
    vec3 ink = albedo * (0.86 + 0.14 * diffuse) + rainbow * band * 0.22 * (0.4 + 0.6 * near);\r
    vec3 base = mix(albedo * (0.86 + 0.14 * diffuse), mix(ink, film, foil), uShine * 0.6 + 0.4);\r
    vec2 cell = floor(vUv * 180.0);\r
    vec2 jitter = vec2(hash(cell), hash(cell + 7.3)) * 0.6 + 0.2;\r
    float dist = length(fract(vUv * 180.0) - jitter);\r
    vec3 facet = normalize(vec3(vec2(hash(cell + 2.1), hash(cell + 5.7)) * 2.0 - 1.0, 1.6));\r
    float glint = pow(max(dot(facet, halfway), 0.0), 60.0) * smoothstep(0.32, 0.05, dist) * step(0.55, hash(cell + 3.1)) * (0.15 + 0.85 * foil);\r
    color = (base + spectrum(hash(cell) + uGlint.x) * glint * 1.6 * uShine + vec3(pow(nh, 140.0) * 0.4 * uShine)) * art.a;\r
  } else {\r
    color = art.rgb * (0.86 + 0.16 * diffuse) + vec3(pow(nh, 220.0) * 0.4 + pow(nh, 24.0) * 0.03) * uShine * art.a;\r
  }\r
  float bend = uPass == 3 ? smoothstep(0.0, uRadius * 0.6, vCurl) : 0.0;\r
  float glare = pow(max(dot(n, normalize(key + vec3(0.0, 0.0, 1.0))), 0.0), 28.0) * bend * (0.18 + 0.3 * uShine);\r
  outColor = vec4(min(color * shade + vec3(glare) * art.a, vec3(art.a)), art.a);\r
}\`;\r
\r
const POST_VERTEX = \`#version 300 es\r
out vec2 vUv;\r
void main() {\r
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\r
  vUv = p;\r
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const POST_FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uSource;\r
uniform vec2 uStep;\r
uniform float uSigma;\r
uniform float uStrength;\r
uniform int uMode;\r
in vec2 vUv;\r
out vec4 outColor;\r
\r
void main() {\r
  if (uMode == 1) {\r
    outColor = vec4(0.0, 0.0, 0.0, texture(uSource, vUv).a * uStrength);\r
    return;\r
  }\r
  vec4 sum = vec4(0.0);\r
  float total = 0.0;\r
  for (int i = -8; i <= 8; i++) {\r
    float offset = float(i);\r
    float weight = exp(-0.5 * offset * offset / (uSigma * uSigma));\r
    sum += texture(uSource, vUv + uStep * offset) * weight;\r
    total += weight;\r
  }\r
  outColor = sum / total;\r
}\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
const wrapAngle = (angle: number) => Math.atan2(Math.sin(angle), Math.cos(angle));\r
const toRadians = (degrees: number) => (degrees * Math.PI) / 180;\r
\r
const spring = (\r
  state: SpringState,\r
  key: 'swing' | 'peel' | 'lift',\r
  target: number,\r
  frequency: number,\r
  damping: number,\r
  dt: number\r
) => {\r
  const omega = 2 * Math.PI * frequency;\r
  const velocity = \`\${key}V\` as 'swingV' | 'peelV' | 'liftV';\r
  state[velocity] += (omega * omega * (target - state[key]) - 2 * damping * omega * state[velocity]) * dt;\r
  state[key] += state[velocity] * dt;\r
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
const link = (gl: WebGL2RenderingContext, vertexSource: string, fragmentSource: string): Program | null => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);\r
  const program = gl.createProgram();\r
  if (!vertex || !fragment || !program) return null;\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
  gl.bindAttribLocation(program, 0, 'aGrid');\r
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
    if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const convexHull = (points: [number, number][]) => {\r
  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);\r
  if (sorted.length < 3) return sorted;\r
  const cross = (o: [number, number], a: [number, number], b: [number, number]) =>\r
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);\r
  const lower: [number, number][] = [];\r
  sorted.forEach(point => {\r
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) lower.pop();\r
    lower.push(point);\r
  });\r
  const upper: [number, number][] = [];\r
  for (let i = sorted.length - 1; i >= 0; i--) {\r
    const point = sorted[i];\r
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) upper.pop();\r
    upper.push(point);\r
  }\r
  return lower.slice(0, -1).concat(upper.slice(0, -1));\r
};\r
\r
const StickerPeel = ({\r
  imageSrc,\r
  width = 200,\r
  rotate = 0,\r
  peelDirection = 0,\r
  peelBackHoverPct = 25,\r
  peelBackActivePct = 40,\r
  curlRadius = 12,\r
  finish = 'gloss',\r
  backColor = '#d4d4d8',\r
  lightingIntensity = 0.5,\r
  shadowIntensity = 0.6,\r
  followPointer = true,\r
  draggable = true,\r
  swing = 1,\r
  friction = 0.5,\r
  bounce = 0.35,\r
  intro = true,\r
  initialPosition = 'center',\r
  onDragStart,\r
  onDragEnd,\r
  dpr,\r
  className = '',\r
  style,\r
  ...rest\r
}: StickerPeelProps) => {\r
  const rootRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const hitRef = useRef<HTMLDivElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings: Settings = {\r
    imageSrc,\r
    width: Math.max(16, width),\r
    rotate: toRadians(rotate),\r
    peelDirection: toRadians(peelDirection),\r
    hoverPeel: clamp(peelBackHoverPct, 0, 100) / 100,\r
    activePeel: clamp(peelBackActivePct, 0, 100) / 100,\r
    curlRadius: Math.max(2, curlRadius),\r
    finish: FINISHES[finish] ?? 0,\r
    backColor,\r
    lighting: clamp(lightingIntensity, 0, 1),\r
    shadow: clamp(shadowIntensity, 0, 1),\r
    followPointer,\r
    draggable,\r
    swing: clamp(swing, 0, 3),\r
    friction: clamp(friction, 0, 1),\r
    bounce: clamp(bounce, 0, 1),\r
    intro,\r
    initialPosition,\r
    onDragStart,\r
    onDragEnd,\r
    dpr\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    const canvas = canvasRef.current;\r
    const hit = hitRef.current;\r
    const parent = root?.parentElement;\r
    const gl = canvas?.getContext('webgl2', {\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: true,\r
      depth: true,\r
      stencil: false\r
    });\r
    if (!root || !canvas || !hit || !parent || !gl) return undefined;\r
\r
    const program = link(gl, VERTEX, FRAGMENT);\r
    const post = link(gl, POST_VERTEX, POST_FRAGMENT);\r
    if (!program || !post) return undefined;\r
    const u = program.uniforms;\r
    const pu = post.uniforms;\r
    const targets: Target[] = [0, 1].map(() => {\r
      const target = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, target);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      const buffer = gl.createFramebuffer();\r
      return { texture: target, buffer, width: 0, height: 0 };\r
    });\r
    const sizeTargets = () => {\r
      const width = Math.max(1, Math.round(view.size / 2));\r
      const height = width;\r
      targets.forEach(target => {\r
        if (target.width === width && target.height === height) return;\r
        target.width = width;\r
        target.height = height;\r
        gl.bindTexture(gl.TEXTURE_2D, target.texture);\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.buffer);\r
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target.texture, 0);\r
      });\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
    };\r
\r
    const vertices = new Float32Array((GRID + 1) * (GRID + 1) * 2);\r
    for (let y = 0; y <= GRID; y++) {\r
      for (let x = 0; x <= GRID; x++) {\r
        const i = (y * (GRID + 1) + x) * 2;\r
        vertices[i] = x / GRID;\r
        vertices[i + 1] = y / GRID;\r
      }\r
    }\r
    const indices = new Uint16Array(GRID * GRID * 6);\r
    let cursor = 0;\r
    for (let y = 0; y < GRID; y++) {\r
      for (let x = 0; x < GRID; x++) {\r
        const a = y * (GRID + 1) + x;\r
        const b = a + 1;\r
        const c = a + GRID + 1;\r
        const d = c + 1;\r
        indices.set([a, b, d, a, d, c], cursor);\r
        cursor += 6;\r
      }\r
    }\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    const vertexBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    const indexBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);\r
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);\r
\r
    const texture = gl.createTexture();\r
    const scratch = document.createElement('canvas');\r
    const scratchContext = scratch.getContext('2d', { willReadFrequently: true });\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const colorCache = new Map<string, number[]>();\r
    const parse = (value: string): number[] => {\r
      const key = String(value);\r
      const cached = colorCache.get(key);\r
      if (cached) return cached;\r
      let rgb = [0.83, 0.83, 0.85];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#d4d4d8';\r
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
    const sticker: {\r
      ready: boolean;\r
      aspect: number;\r
      meshX: number;\r
      meshY: number;\r
      texel: number;\r
      mask: Uint8Array | null;\r
      maskW: number;\r
      maskH: number;\r
      hull: [number, number][];\r
    } = { ready: false, aspect: 1, meshX: 1, meshY: 1, texel: 1, mask: null, maskW: 1, maskH: 1, hull: [] };\r
    const view = { ratio: 1, size: 1, density: 0 };\r
    const bounds = { width: 1, height: 1 };\r
    const state = {\r
      x: 0,\r
      y: 0,\r
      vx: 0,\r
      vy: 0,\r
      placed: false,\r
      swing: 0,\r
      swingV: 0,\r
      peel: 0,\r
      peelV: 0,\r
      lift: 0,\r
      liftV: 0,\r
      dir: settingsRef.current.peelDirection,\r
      hover: false,\r
      local: { x: 0, y: 0 },\r
      press: null as Press | null,\r
      pivotV: { x: 0, y: 0 },\r
      light: { x: 0, y: 0, z: LIGHT_HEIGHT },\r
      pointer: { x: 0, y: 0, inside: false },\r
      intro: settingsRef.current.intro && !reduce ? 0 : 1\r
    };\r
    if (state.intro < 1) {\r
      state.lift = 1.5;\r
      state.peel = 0.3;\r
      state.swing = 0.1;\r
      state.dir += 0.6;\r
    }\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let loadedSrc: string | null = null;\r
    let alive = true;\r
\r
    const height = () => settingsRef.current.width * sticker.aspect;\r
\r
    const extentAlong = (dx: number, dy: number): [number, number] => {\r
      const s = settingsRef.current;\r
      const w = s.width;\r
      const h = height();\r
      if (!sticker.hull.length) {\r
        const half = (Math.abs(dx) * w + Math.abs(dy) * h) / 2;\r
        return [-half, half];\r
      }\r
      let min = Infinity;\r
      let max = -Infinity;\r
      sticker.hull.forEach(([px, py]) => {\r
        const value = px * w * dx + py * h * dy;\r
        if (value < min) min = value;\r
        if (value > max) max = value;\r
      });\r
      return [min, max];\r
    };\r
\r
    const load = (src: string) => {\r
      loadedSrc = src;\r
      sticker.ready = false;\r
      if (!src) return;\r
      const image = new Image();\r
      image.crossOrigin = 'anonymous';\r
      image.decoding = 'async';\r
      image.onload = () => {\r
        if (!alive || loadedSrc !== src || !scratchContext) return;\r
        const iw = image.naturalWidth || 1;\r
        const ih = image.naturalHeight || 1;\r
        const fit = Math.min(1, MAX_TEXTURE / (Math.max(iw, ih) * (1 + 2 * PAD)));\r
        const w = Math.max(1, Math.round(iw * fit));\r
        const h = Math.max(1, Math.round(ih * fit));\r
        const padX = Math.round(w * PAD);\r
        const padY = Math.round(h * PAD);\r
        scratch.width = w + padX * 2;\r
        scratch.height = h + padY * 2;\r
        scratchContext.clearRect(0, 0, scratch.width, scratch.height);\r
        scratchContext.drawImage(image, padX, padY, w, h);\r
        gl.bindTexture(gl.TEXTURE_2D, texture);\r
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, scratch);\r
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);\r
        gl.generateMipmap(gl.TEXTURE_2D);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
        sticker.aspect = ih / iw;\r
        sticker.meshX = scratch.width / w;\r
        sticker.meshY = scratch.height / h;\r
        sticker.texel = scratch.width;\r
        const maskW = Math.max(8, Math.round(MASK_SIZE * Math.min(1, iw / ih)));\r
        const maskH = Math.max(8, Math.round(MASK_SIZE * Math.min(1, ih / iw)));\r
        scratch.width = maskW;\r
        scratch.height = maskH;\r
        scratchContext.clearRect(0, 0, maskW, maskH);\r
        scratchContext.drawImage(image, 0, 0, maskW, maskH);\r
        const pixels = scratchContext.getImageData(0, 0, maskW, maskH).data;\r
        const mask = new Uint8Array(maskW * maskH).fill(255);\r
        const queue: number[] = [];\r
        const visit = (x: number, y: number) => {\r
          const i = y * maskW + x;\r
          if (mask[i] === 0 || pixels[i * 4 + 3] > 100) return;\r
          mask[i] = 0;\r
          queue.push(i);\r
        };\r
        for (let x = 0; x < maskW; x++) {\r
          visit(x, 0);\r
          visit(x, maskH - 1);\r
        }\r
        for (let y = 0; y < maskH; y++) {\r
          visit(0, y);\r
          visit(maskW - 1, y);\r
        }\r
        while (queue.length) {\r
          const i = queue.pop() as number;\r
          const x = i % maskW;\r
          const y = (i - x) / maskW;\r
          if (x > 0) visit(x - 1, y);\r
          if (x < maskW - 1) visit(x + 1, y);\r
          if (y > 0) visit(x, y - 1);\r
          if (y < maskH - 1) visit(x, y + 1);\r
        }\r
        const points: [number, number][] = [];\r
        for (let y = 0; y < maskH; y++) {\r
          for (let x = 0; x < maskW; x++) {\r
            if (pixels[(y * maskW + x) * 4 + 3] > 127) points.push([(x + 0.5) / maskW - 0.5, (y + 0.5) / maskH - 0.5]);\r
          }\r
        }\r
        sticker.mask = mask;\r
        sticker.maskW = maskW;\r
        sticker.maskH = maskH;\r
        sticker.hull = convexHull(points);\r
        sticker.ready = true;\r
        layout();\r
        wake();\r
      };\r
      image.src = src;\r
    };\r
\r
    const layout = () => {\r
      const s = settingsRef.current;\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      bounds.width = Math.max(1, parent.clientWidth);\r
      bounds.height = Math.max(1, parent.clientHeight);\r
      const h = height();\r
      const size = Math.ceil(Math.hypot(s.width, h) * 1.16 + 2 * (36 + s.curlRadius));\r
      if (size !== view.size || view.ratio !== view.density) {\r
        view.size = size;\r
        view.density = view.ratio;\r
        root.style.width = \`\${size}px\`;\r
        root.style.height = \`\${size}px\`;\r
        canvas.width = Math.round(size * view.ratio);\r
        canvas.height = Math.round(size * view.ratio);\r
      }\r
      hit.style.width = \`\${s.width}px\`;\r
      hit.style.height = \`\${h}px\`;\r
      if (!state.placed) {\r
        const start = s.initialPosition;\r
        const offset = start && typeof start === 'object' ? start : { x: 0, y: 0 };\r
        state.x = bounds.width / 2 + (offset.x || 0);\r
        state.y = bounds.height / 2 + (offset.y || 0);\r
        state.light = { x: state.x - s.width * 0.45, y: state.y - h * 0.9, z: LIGHT_HEIGHT * 1.6 };\r
        state.placed = true;\r
      }\r
      confine();\r
    };\r
\r
    const reach = () => {\r
      const s = settingsRef.current;\r
      const angle = s.rotate + state.swing;\r
      const grow = 1 + 0.07 * Math.max(0, state.lift);\r
      const w = (s.width / 2) * grow;\r
      const h = (height() / 2) * grow;\r
      const c = Math.abs(Math.cos(angle));\r
      const sn = Math.abs(Math.sin(angle));\r
      return { x: w * c + h * sn, y: w * sn + h * c };\r
    };\r
\r
    const confine = () => {\r
      const s = settingsRef.current;\r
      const half = reach();\r
      const minX = Math.min(half.x, bounds.width / 2);\r
      const maxX = Math.max(bounds.width - half.x, bounds.width / 2);\r
      const minY = Math.min(half.y, bounds.height / 2);\r
      const maxY = Math.max(bounds.height - half.y, bounds.height / 2);\r
      if (state.x < minX) {\r
        state.x = minX;\r
        if (state.vx < 0) state.vx = -state.vx * s.bounce;\r
      } else if (state.x > maxX) {\r
        state.x = maxX;\r
        if (state.vx > 0) state.vx = -state.vx * s.bounce;\r
      }\r
      if (state.y < minY) {\r
        state.y = minY;\r
        if (state.vy < 0) state.vy = -state.vy * s.bounce;\r
      } else if (state.y > maxY) {\r
        state.y = maxY;\r
        if (state.vy > 0) state.vy = -state.vy * s.bounce;\r
      }\r
    };\r
\r
    const toParent = (event: PointerEvent): Point => {\r
      const rect = parent.getBoundingClientRect();\r
      return { x: event.clientX - rect.left - parent.clientLeft, y: event.clientY - rect.top - parent.clientTop };\r
    };\r
\r
    const toLocal = (point: Point): Point => {\r
      const s = settingsRef.current;\r
      const angle = -(s.rotate + state.swing);\r
      const scale = 1 + 0.07 * Math.max(0, state.lift);\r
      const dx = point.x - state.x;\r
      const dy = point.y - state.y;\r
      return {\r
        x: (Math.cos(angle) * dx - Math.sin(angle) * dy) / scale,\r
        y: (Math.sin(angle) * dx + Math.cos(angle) * dy) / scale\r
      };\r
    };\r
\r
    const solid = (local: Point) => {\r
      if (!sticker.mask) return false;\r
      const s = settingsRef.current;\r
      const mx = Math.floor((local.x / s.width + 0.5) * sticker.maskW);\r
      const my = Math.floor((local.y / height() + 0.5) * sticker.maskH);\r
      if (mx < 0 || my < 0 || mx >= sticker.maskW || my >= sticker.maskH) return false;\r
      return sticker.mask[my * sticker.maskW + mx] > 100;\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      const size = view.size;\r
      root.style.transform = \`translate3d(\${state.x - size / 2}px, \${state.y - size / 2}px, 0)\`;\r
      const angle = s.rotate + state.swing;\r
      const scale = 1 + 0.07 * Math.max(0, state.lift);\r
      hit.style.transform = \`translate(-50%, -50%) rotate(\${angle}rad) scale(\${scale})\`;\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clearDepth(1);\r
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);\r
      if (!sticker.ready) return;\r
      const w = s.width;\r
      const h = height();\r
      const dx = -Math.sin(state.dir);\r
      const dy = Math.cos(state.dir);\r
      const [start, end] = extentAlong(dx, dy);\r
      const peel = clamp(state.peel, 0, 1);\r
      const fold = start + peel * (end - start);\r
      const lift = Math.max(0, state.lift);\r
      const center = size / 2;\r
      const count = GRID * GRID * 6;\r
      const peeled = peel > 0.001;\r
      gl.useProgram(program.program);\r
      gl.bindVertexArray(vao);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.uniform1i(u.uImage, 0);\r
      gl.uniform2f(u.uCanvas, size, size);\r
      gl.uniform2f(u.uMesh, w * sticker.meshX, h * sticker.meshY);\r
      gl.uniform2f(u.uCenter, center, center);\r
      gl.uniform2f(u.uDir, dx, dy);\r
      gl.uniform1f(u.uFold, fold);\r
      gl.uniform1f(u.uRadius, s.curlRadius);\r
      gl.uniform1f(u.uAngle, angle);\r
      gl.uniform1f(u.uScale, scale);\r
      gl.uniform1f(u.uLift, lift * 26);\r
      gl.uniform2f(u.uShadowOffset, 1.2, 2.4);\r
      gl.uniform2f(u.uShadowSlope, 0.28, 0.55);\r
      gl.uniform1i(u.uFinish, s.finish);\r
      gl.uniform3fv(u.uBack, parse(s.backColor));\r
      gl.uniform3f(u.uLight, state.light.x - (state.x - center), state.light.y - (state.y - center), state.light.z);\r
      gl.uniform1f(u.uShine, s.lighting);\r
      gl.uniform1f(u.uShadow, s.shadow * 0.55);\r
      gl.uniform1f(u.uTexel, sticker.texel / (w * sticker.meshX));\r
      gl.uniform1f(u.uLod, Math.max(0, Math.log2(sticker.texel / (w * sticker.meshX * scale * view.ratio))));\r
      const glint = toLocal(state.light);\r
      gl.uniform2f(u.uGlint, glint.x / (w * sticker.meshX) + 0.5, glint.y / (h * sticker.meshY) + 0.5);\r
      gl.disable(gl.DEPTH_TEST);\r
      if (peeled) {\r
        sizeTargets();\r
        const [first, second] = targets;\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, first.buffer);\r
        gl.viewport(0, 0, first.width, first.height);\r
        gl.clear(gl.COLOR_BUFFER_BIT);\r
        gl.disable(gl.BLEND);\r
        gl.uniform1i(u.uPass, 2);\r
        gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);\r
        gl.useProgram(post.program);\r
        gl.uniform1i(pu.uSource, 1);\r
        gl.uniform1i(pu.uMode, 0);\r
        gl.uniform1f(pu.uSigma, Math.min(4, (2.5 + s.curlRadius * 0.15) / 2));\r
        gl.activeTexture(gl.TEXTURE1);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, second.buffer);\r
        gl.bindTexture(gl.TEXTURE_2D, first.texture);\r
        gl.uniform2f(pu.uStep, 1 / first.width, 0);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, first.buffer);\r
        gl.bindTexture(gl.TEXTURE_2D, second.texture);\r
        gl.uniform2f(pu.uStep, 0, 1 / first.height);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
        gl.viewport(0, 0, canvas.width, canvas.height);\r
        gl.useProgram(program.program);\r
        gl.activeTexture(gl.TEXTURE0);\r
      }\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      gl.uniform1i(u.uPass, 0);\r
      gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);\r
      gl.uniform1i(u.uPass, 1);\r
      gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);\r
      if (peeled) {\r
        gl.useProgram(post.program);\r
        gl.activeTexture(gl.TEXTURE1);\r
        gl.bindTexture(gl.TEXTURE_2D, targets[0].texture);\r
        gl.uniform1i(pu.uMode, 1);\r
        gl.uniform1f(pu.uStrength, s.shadow * 0.6);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
        gl.useProgram(program.program);\r
        gl.activeTexture(gl.TEXTURE0);\r
        gl.enable(gl.DEPTH_TEST);\r
        gl.depthFunc(gl.LESS);\r
        gl.uniform1i(u.uPass, 3);\r
        gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);\r
        gl.disable(gl.DEPTH_TEST);\r
      }\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.001, 1 / 30) : 1 / 60;\r
      last = now;\r
      if (s.imageSrc !== loadedSrc) load(s.imageSrc);\r
      const h = height();\r
      if (state.intro < 1 && sticker.ready) state.intro = Math.min(1, state.intro + dt / 1.1);\r
      const press = state.press;\r
      const drag = press && press.moving ? press : null;\r
      if (drag) {\r
        const target = drag.pointer;\r
        const prev = drag.pivot;\r
        const smoothing = 1 - Math.exp(-dt / 0.045);\r
        const vx = state.pivotV.x + ((target.x - prev.x) / dt - state.pivotV.x) * smoothing;\r
        const vy = state.pivotV.y + ((target.y - prev.y) / dt - state.pivotV.y) * smoothing;\r
        const ax = (vx - state.pivotV.x) / dt;\r
        const ay = (vy - state.pivotV.y) / dt;\r
        state.pivotV.x = vx;\r
        state.pivotV.y = vy;\r
        drag.pivot = { x: target.x, y: target.y };\r
        const angle = s.rotate + state.swing;\r
        const rx = -(Math.cos(angle) * drag.grab.x - Math.sin(angle) * drag.grab.y);\r
        const ry = -(Math.sin(angle) * drag.grab.x + Math.cos(angle) * drag.grab.y);\r
        const inertia = (s.width * s.width + h * h) / 12 + rx * rx + ry * ry;\r
        const torque = (rx * -clamp(ay, -24000, 24000) - ry * -clamp(ax, -24000, 24000)) / inertia;\r
        const omega = 2 * Math.PI * 1.5;\r
        state.swingV += (torque * 1.1 * s.swing - omega * omega * state.swing - 2 * 0.45 * omega * state.swingV) * dt;\r
        state.swing = clamp(state.swing + state.swingV * dt, -1.2, 1.2);\r
        const turned = s.rotate + state.swing;\r
        const grip = 1 + 0.07 * Math.max(0, state.lift);\r
        state.x = target.x - (Math.cos(turned) * drag.grab.x - Math.sin(turned) * drag.grab.y) * grip;\r
        state.y = target.y - (Math.sin(turned) * drag.grab.x + Math.cos(turned) * drag.grab.y) * grip;\r
        confine();\r
      } else {\r
        spring(state, 'swing', 0, 1.4, 0.32, dt);\r
        const decay = Math.exp(-dt * (1.5 + 9 * s.friction));\r
        state.vx *= decay;\r
        state.vy *= decay;\r
        if (Math.hypot(state.vx, state.vy) < 4) {\r
          state.vx = 0;\r
          state.vy = 0;\r
        }\r
        state.x += state.vx * dt;\r
        state.y += state.vy * dt;\r
        confine();\r
      }\r
      const introHold = state.intro < 0.2;\r
      const peelTarget = introHold ? 0.3 : press ? s.activePeel : state.hover ? s.hoverPeel : 0;\r
      spring(state, 'peel', peelTarget, press || state.hover ? 3 : 3.6, press || state.hover ? 0.7 : 0.62, dt);\r
      spring(state, 'lift', drag ? 1 : 0, 3.2, 0.55, dt);\r
      let dirTarget = s.peelDirection;\r
      if (press && Math.hypot(press.grab.x, press.grab.y) > Math.min(s.width, h) * 0.12) {\r
        dirTarget = Math.atan2(press.grab.x, -press.grab.y);\r
      } else if (\r
        s.followPointer &&\r
        state.hover &&\r
        Math.hypot(state.local.x, state.local.y) > Math.min(s.width, h) * 0.12\r
      ) {\r
        dirTarget = Math.atan2(state.local.x, -state.local.y);\r
      }\r
      if (!introHold) state.dir += wrapAngle(dirTarget - state.dir) * (1 - Math.exp(-dt / 0.12));\r
      const lightTarget = state.pointer.inside\r
        ? { x: state.pointer.x, y: state.pointer.y, z: LIGHT_HEIGHT }\r
        : { x: state.x - s.width * 0.45, y: state.y - h * 0.9, z: LIGHT_HEIGHT * 1.6 };\r
      const follow = 1 - Math.exp(-dt / 0.08);\r
      state.light.x += (lightTarget.x - state.light.x) * follow;\r
      state.light.y += (lightTarget.y - state.light.y) * follow;\r
      state.light.z += (lightTarget.z - state.light.z) * follow;\r
      canvas.style.opacity = String(clamp(state.intro / 0.12, 0, 1));\r
      draw();\r
      const moving =\r
        (state.intro < 1 && sticker.ready) ||\r
        press ||\r
        Math.abs(state.peel - peelTarget) > 0.0005 ||\r
        Math.abs(state.peelV) > 0.0005 ||\r
        Math.abs(state.lift - (drag ? 1 : 0)) > 0.0005 ||\r
        Math.abs(state.liftV) > 0.0005 ||\r
        Math.abs(state.swing) > 0.0005 ||\r
        Math.abs(state.swingV) > 0.0005 ||\r
        state.vx !== 0 ||\r
        state.vy !== 0 ||\r
        Math.abs(wrapAngle(dirTarget - state.dir)) > 0.002 ||\r
        Math.hypot(lightTarget.x - state.light.x, lightTarget.y - state.light.y, lightTarget.z - state.light.z) > 0.5;\r
      if (moving) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    function wake() {\r
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    }\r
\r
    const updateHover = (event: PointerEvent) => {\r
      const point = toParent(event);\r
      state.local = toLocal(point);\r
      const over = solid(state.local);\r
      if (over !== state.hover) state.hover = over;\r
      hit.style.cursor = over && settingsRef.current.draggable ? (state.press ? 'grabbing' : 'grab') : '';\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const point = toParent(event);\r
      state.pointer.x = point.x;\r
      state.pointer.y = point.y;\r
      state.pointer.inside = point.x >= 0 && point.y >= 0 && point.x <= bounds.width && point.y <= bounds.height;\r
      wake();\r
    };\r
\r
    const onHitMove = (event: PointerEvent) => {\r
      const press = state.press;\r
      if (!press) {\r
        updateHover(event);\r
      } else if (press.id === event.pointerId) {\r
        const point = toParent(event);\r
        press.pointer = point;\r
        if (!press.moving && Math.hypot(point.x - press.origin.x, point.y - press.origin.y) > 3) {\r
          press.moving = settingsRef.current.draggable;\r
          if (press.moving) settingsRef.current.onDragStart?.();\r
        }\r
        press.samples.push({ x: point.x, y: point.y, t: performance.now() });\r
        if (press.samples.length > 8) press.samples.shift();\r
      }\r
      wake();\r
    };\r
\r
    const onHitLeave = () => {\r
      if (state.press) return;\r
      state.hover = false;\r
      hit.style.cursor = '';\r
      wake();\r
    };\r
\r
    const onHitDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      if (event.button !== 0 || !sticker.ready) return;\r
      updateHover(event);\r
      if (!state.hover) return;\r
      const point = toParent(event);\r
      state.press = {\r
        id: event.pointerId,\r
        grab: toLocal(point),\r
        origin: point,\r
        pointer: point,\r
        pivot: point,\r
        moving: false,\r
        samples: []\r
      };\r
      state.pivotV = { x: 0, y: 0 };\r
      state.vx = 0;\r
      state.vy = 0;\r
      hit.setPointerCapture?.(event.pointerId);\r
      if (s.draggable) {\r
        hit.style.cursor = 'grabbing';\r
        stack += 1;\r
        root.style.zIndex = String(stack);\r
      }\r
      event.preventDefault();\r
      wake();\r
    };\r
\r
    const onHitUp = (event: PointerEvent) => {\r
      const press = state.press;\r
      if (!press || press.id !== event.pointerId) return;\r
      state.press = null;\r
      if (hit.hasPointerCapture?.(event.pointerId)) hit.releasePointerCapture(event.pointerId);\r
      const now = performance.now();\r
      const recent = press.samples.filter(sample => now - sample.t < 90);\r
      if (press.moving && recent.length > 1 && !reduce) {\r
        const a = recent[0];\r
        const b = recent[recent.length - 1];\r
        const span = Math.max(b.t - a.t, 16) / 1000;\r
        const speed = 2600;\r
        state.vx = clamp((b.x - a.x) / span, -speed, speed);\r
        state.vy = clamp((b.y - a.y) / span, -speed, speed);\r
      }\r
      updateHover(event);\r
      if (event.pointerType !== 'mouse') state.hover = false;\r
      if (press.moving) settingsRef.current.onDragEnd?.();\r
      wake();\r
    };\r
\r
    const onLeaveWindow = () => {\r
      state.pointer.inside = false;\r
      wake();\r
    };\r
\r
    const onVisibility = () => {\r
      last = 0;\r
      wake();\r
    };\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      layout();\r
      wake();\r
    });\r
    resizeObserver.observe(parent);\r
    const intersection = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible) {\r
        last = 0;\r
        wake();\r
      }\r
    });\r
    intersection.observe(parent);\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onLeaveWindow);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    hit.addEventListener('pointermove', onHitMove);\r
    hit.addEventListener('pointerleave', onHitLeave);\r
    hit.addEventListener('pointerdown', onHitDown);\r
    hit.addEventListener('pointerup', onHitUp);\r
    hit.addEventListener('pointercancel', onHitUp);\r
    load(settingsRef.current.imageSrc);\r
    layout();\r
    wakeRef.current = () => {\r
      layout();\r
      wake();\r
    };\r
    wake();\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      document.documentElement.removeEventListener('pointerleave', onLeaveWindow);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      hit.removeEventListener('pointermove', onHitMove);\r
      hit.removeEventListener('pointerleave', onHitLeave);\r
      hit.removeEventListener('pointerdown', onHitDown);\r
      hit.removeEventListener('pointerup', onHitUp);\r
      hit.removeEventListener('pointercancel', onHitUp);\r
      gl.deleteTexture(texture);\r
      targets.forEach(target => {\r
        gl.deleteTexture(target.texture);\r
        gl.deleteFramebuffer(target.buffer);\r
      });\r
      gl.deleteProgram(post.program);\r
      gl.deleteBuffer(vertexBuffer);\r
      gl.deleteBuffer(indexBuffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(program.program);\r
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
      ref={rootRef}\r
      className={['pointer-events-none absolute left-0 top-0 will-change-transform', className]\r
        .filter(Boolean)\r
        .join(' ')}\r
      style={style}\r
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className="pointer-events-none block h-full w-full" aria-hidden="true" />\r
      <div\r
        ref={hitRef}\r
        className="pointer-events-auto absolute left-1/2 top-1/2 touch-none select-none [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none]"\r
      />\r
    </div>\r
  );\r
};\r
\r
export default StickerPeel;\r
`,s={usage:`import StickerPeel from './StickerPeel'
import logo from './assets/sticker.png'

<div style={{ position: 'relative', width: '100%', height: '400px' }}>
  <StickerPeel
    imageSrc={logo}
    width={200}
    finish="gloss"
    peelBackHoverPct={25}
    peelBackActivePct={40}
  />
</div>`,code:r,css:n,tailwind:e,tsCode:t,tsTailwind:a};export{s as stickerPeel};
