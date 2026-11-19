const r=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
import './AcidSquares.css';\r
\r
const MAX_RIPPLES = 8;\r
const MESH = { low: 150, medium: 210, high: 280 };\r
const AREA = [-42, -76, 84, 94];\r
const MAX_RENDER_DIM = 2400;\r
const INTRO_SECONDS = 3;\r
const REVEAL_SECONDS = 2.6;\r
const REVEAL_REACH = 19;\r
const ORIGIN = [0, -3];\r
const HOVER_EFFECTS = { press: 1, lift: -1, none: 0 };\r
const LIGHTING = {\r
  split: [\r
    [7, 4.2, -4, 4, 4],\r
    [-8, 3.6, 3, 4, 4]\r
  ],\r
  backlit: [\r
    [6, 1.6, -15, 5, 3],\r
    [-7, 1.4, -13, 5, 3]\r
  ],\r
  overhead: [\r
    [3, 7.5, -4, 3, 3],\r
    [-3, 7, -1, 3, 3]\r
  ]\r
};\r
const DEG = Math.PI / 180;\r
\r
const FIELD = \`\r
uniform vec4 uRipples[\${MAX_RIPPLES}];\r
uniform vec4 uWave;\r
uniform float uSquare;\r
uniform float uClock;\r
uniform vec4 uSwell;\r
uniform vec4 uHover;\r
uniform vec4 uIntro;\r
\r
float reachOf(vec2 delta, out vec2 grad) {\r
  vec2 a = abs(delta);\r
  vec2 dir = vec2(delta.x < 0.0 ? -1.0 : 1.0, delta.y < 0.0 ? -1.0 : 1.0);\r
  float round_ = length(delta);\r
  vec2 roundGrad = delta / max(round_, 1e-4);\r
  float m = max(max(a.x, a.y), 1e-4);\r
  vec2 k = a / m;\r
  vec2 k3 = k * k * k;\r
  float sum = dot(k3, k);\r
  float root = sqrt(sqrt(sum));\r
  float square = m * root;\r
  vec2 squareGrad = dir * k3 / (root * root * root);\r
  float d = mix(round_, square, uSquare);\r
  vec2 g = mix(roundGrad, squareGrad, uSquare);\r
  float soft = sqrt(d * d + 0.36);\r
  grad = g * d / soft;\r
  return soft - 0.6;\r
}\r
\r
vec3 field(vec2 p) {\r
  float t = uSwell.w;\r
  float f = uSwell.y;\r
  vec2 k1 = vec2(0.19, 0.11) * f;\r
  vec2 k2 = vec2(-0.09, 0.23) * f;\r
  vec2 k3 = vec2(0.29, -0.17) * f;\r
  float a1 = dot(p, k1) + t * 0.55;\r
  float a2 = dot(p, k2) - t * 0.42 + 1.3;\r
  float a3 = dot(p, k3) + t * 0.74 + 2.1;\r
  float h = 0.55 * sin(a1) + 0.4 * sin(a2) + 0.22 * sin(a3);\r
  vec2 g = 0.55 * cos(a1) * k1 + 0.4 * cos(a2) * k2 + 0.22 * cos(a3) * k3;\r
  h *= uSwell.x;\r
  g *= uSwell.x;\r
  vec2 dg;\r
  for (int i = 0; i < \${MAX_RIPPLES}; i++) {\r
    vec4 r = uRipples[i];\r
    if (r.w <= 0.0) continue;\r
    float age = uClock - r.z;\r
    if (age <= 0.0) continue;\r
    float d = reachOf(p - r.xy, dg);\r
    float radius = age * uWave.y;\r
    float x = (d - radius) / uWave.z;\r
    float life = clamp(1.0 - radius / uWave.w, 0.0, 1.0);\r
    float strength = r.w * uWave.x * life * life * smoothstep(0.0, 1.5, radius);\r
    float bump = exp(-x * x);\r
    h += bump * strength;\r
    g += -2.0 * x * bump * strength / uWave.z * dg;\r
  }\r
  if (uIntro.w > 0.0) {\r
    float d = reachOf(p - uIntro.xy, dg);\r
    float x = (d - uIntro.z) / 2.2;\r
    float bump = exp(-x * x) * uIntro.w;\r
    h += bump;\r
    g += -2.0 * x * bump / 2.2 * dg;\r
  }\r
  vec2 hd = p - uHover.xy;\r
  float hr = max(uHover.z, 1e-3);\r
  float hover = exp(-dot(hd, hd) / (hr * hr)) * uHover.w;\r
  h -= hover;\r
  g += 2.0 * hd / (hr * hr) * hover;\r
  return vec3(h, g);\r
}\r
\`;\r
\r
const VERTEX = \`#version 300 es\r
precision highp float;\r
\${FIELD}\r
layout(location = 0) in vec2 aGrid;\r
uniform mat4 uViewProj;\r
uniform vec4 uArea;\r
out vec2 vGround;\r
out vec3 vWorld;\r
void main() {\r
  vec2 ground = uArea.xy + aGrid * uArea.zw;\r
  vec3 f = field(ground);\r
  vWorld = vec3(ground.x, f.x, ground.y);\r
  vGround = ground;\r
  gl_Position = uViewProj * vec4(vWorld, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
\${FIELD}\r
uniform vec3 uEye;\r
uniform vec3 uColor;\r
uniform vec3 uAccent;\r
uniform vec3 uSecond;\r
uniform vec3 uLightA;\r
uniform vec3 uLightB;\r
uniform float uTile;\r
uniform float uAngle;\r
uniform float uGap;\r
uniform float uRound;\r
uniform float uSoftness;\r
uniform float uBulge;\r
uniform float uGloss;\r
uniform vec2 uRange;\r
uniform float uBrightness;\r
uniform float uGrain;\r
uniform float uGrainScale;\r
uniform float uLightMode;\r
uniform float uOpacity;\r
uniform vec4 uReveal;\r
uniform vec2 uView;\r
uniform float uFade;\r
uniform float uFrame;\r
in vec2 vGround;\r
in vec3 vWorld;\r
out vec4 outColor;\r
\r
float smoother(float x) {\r
  x = clamp(x, 0.0, 1.0);\r
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);\r
}\r
\r
float hash(vec3 p) {\r
  p = fract(p * 0.1031);\r
  p += dot(p, p.zyx + 31.32);\r
  return fract((p.x + p.y) * p.z);\r
}\r
\r
void main() {\r
  vec3 f = field(vGround);\r
  vec3 n0 = normalize(vec3(-f.y, 1.0, -f.z));\r
  vec3 tx = normalize(vec3(1.0, f.y, 0.0));\r
  vec3 tz = normalize(cross(tx, n0));\r
  tx = normalize(cross(n0, tz));\r
\r
  float c = cos(uAngle);\r
  float s = sin(uAngle);\r
  mat2 toTile = mat2(c, -s, s, c);\r
  vec2 q = toTile * vGround / uTile;\r
  vec2 cell = floor(q);\r
  vec2 local = q - cell - 0.5;\r
  float footprint = max(length(fwidth(q)), 1e-5);\r
\r
  float on = 1.0;\r
  if (uReveal.w < 1.0) {\r
    vec2 centre = transpose(toTile) * (cell + 0.5) * uTile;\r
    vec2 dg;\r
    float d = reachOf(centre - uReveal.xy, dg);\r
    float delay = hash(vec3(cell, 7.0)) * 1.1;\r
    on = max(smoother((uReveal.z - d - delay) / 1.6), uReveal.w);\r
  }\r
\r
  float half_ = (0.5 - uGap * 0.5) * mix(0.62, 1.0, on);\r
  float radius = min(uRound * half_, half_);\r
  vec2 dd = abs(local) - (half_ - radius);\r
  float d = length(max(dd, 0.0)) + min(max(dd.x, dd.y), 0.0) - radius;\r
  vec2 outward = dd.x > 0.0 || dd.y > 0.0 ? normalize(max(dd, 0.0) * sign(local)) : (dd.x > dd.y ? vec2(sign(local.x), 0.0) : vec2(0.0, sign(local.y)));\r
\r
  float bevelWidth = max(mix(0.04, 0.42, uSoftness) * half_, footprint * 1.5);\r
  float edge = clamp((d + bevelWidth) / bevelWidth, 0.0, 1.0);\r
  float dome = uBulge * 0.5 * length(local) / max(half_, 1e-3);\r
  float theta = edge * edge * mix(0.7, 1.35, uSoftness) + dome;\r
  vec2 outwardGround = transpose(toTile) * outward;\r
  vec2 domeGround = transpose(toTile) * (local / max(length(local), 1e-4));\r
  vec3 bend = normalize(tx * mix(domeGround.x, outwardGround.x, edge) + tz * mix(domeGround.y, outwardGround.y, edge));\r
  float crowd = smoothstep(0.08, 0.3, footprint);\r
  theta *= 1.0 - crowd;\r
  vec3 n = normalize(n0 * cos(theta) + bend * sin(theta));\r
\r
  float inside = 1.0 - smoothstep(-footprint * 0.75, footprint * 0.75, d);\r
  float area = (2.0 * half_) * (2.0 * half_) - (4.0 - 3.14159) * radius * radius;\r
  inside = mix(inside, area, crowd) * on;\r
\r
  vec3 toEye = uEye - vWorld;\r
  float dist = length(toEye);\r
  vec3 v = toEye / dist;\r
  vec3 la = uLightA - vWorld;\r
  vec3 lb = uLightB - vWorld;\r
  float da = length(la);\r
  float db = length(lb);\r
  la /= da;\r
  lb /= db;\r
  float fa = 1.0 / (1.0 + da * da * 0.02);\r
  float fb = 1.0 / (1.0 + db * db * 0.02);\r
\r
  float ndv = clamp(dot(n, v), 0.0, 1.0);\r
  float fresnel = 0.04 + 0.96 * pow(1.0 - ndv, 5.0);\r
  vec3 ha = normalize(la + v);\r
  vec3 hb = normalize(lb + v);\r
  float shine = mix(10.0, 90.0, uGloss);\r
  float norm = (shine + 8.0) / 60.0;\r
  float specA = pow(max(dot(n, ha), 0.0), shine) * norm;\r
  float specB = pow(max(dot(n, hb), 0.0), shine) * norm;\r
  float sheenA = pow(max(dot(n, ha), 0.0), 8.0);\r
  float sheenB = pow(max(dot(n, hb), 0.0), 8.0);\r
  float diffA = max(dot(n, la), 0.0);\r
  float diffB = max(dot(n, lb), 0.0);\r
  vec3 r = reflect(-v, n);\r
  float rim = exp((dot(r, normalize(vec3(0.15, 0.55, -1.0))) - 1.0) * 6.0);\r
  float occlusion = mix(1.0, 0.35, edge * edge);\r
  float edgeLight = edge * edge;\r
\r
  vec3 color;\r
  float alpha;\r
  if (uLightMode > 0.5) {\r
    float luma = dot(uColor, vec3(0.299, 0.587, 0.114));\r
    vec3 body = mix(vec3(luma), uColor, 0.5) * 0.96;\r
    vec3 keyDir = normalize(vec3(-0.35, 0.85, 0.45));\r
    float shade = clamp(dot(n, keyDir) * 0.6 + 0.5, 0.0, 1.0);\r
    float wa = clamp(diffA * fa * 9.0, 0.0, 1.0);\r
    float wb = clamp(diffB * fb * 9.0, 0.0, 1.0);\r
    vec3 hue = (uAccent * wa + uSecond * wb) / max(wa + wb, 1e-3);\r
    vec3 lit = body * mix(vec3(1.0), hue, clamp(wa + wb, 0.0, 1.0) * 0.42) * mix(0.7, 1.05, shade);\r
    lit += vec3(1.0) * (specA * fa + specB * fb) * 2.4 * uGloss;\r
    lit *= mix(1.0, 0.8, edgeLight * (1.0 - crowd));\r
    color = lit;\r
    alpha = inside;\r
  } else {\r
    float luma = dot(uColor, vec3(0.299, 0.587, 0.114));\r
    vec3 body = mix(vec3(luma), uColor, 0.35) + vec3(0.02);\r
    vec3 lit = body * 0.25;\r
    lit += body * (uAccent * diffA * fa + uSecond * diffB * fb) * 14.0;\r
    lit += uAccent * (specA * (0.55 + 1.6 * edgeLight) + sheenA * 0.3) * fa * 9.0 * uGloss;\r
    lit += uSecond * (specB * (0.55 + 1.6 * edgeLight) + sheenB * 0.3) * fb * 9.0 * uGloss;\r
    lit += mix(uSecond, vec3(1.0), 0.4) * rim * fresnel * 0.35 * uGloss;\r
    lit *= occlusion;\r
    color = lit * inside;\r
    alpha = inside;\r
  }\r
\r
  float fade = 1.0 - smoother((dist - uRange.x) / max(uRange.y - uRange.x, 1e-3));\r
  alpha *= fade * uOpacity;\r
  color *= uBrightness;\r
  if (uLightMode < 0.5) color = 1.0 - exp(-color * 1.1);\r
\r
  vec2 grainCell = floor(gl_FragCoord.xy / uGrainScale);\r
  float grain = hash(vec3(grainCell, uFrame)) + hash(vec3(grainCell + 17.0, uFrame + 3.0)) - 1.0;\r
  float lum = dot(color, vec3(0.299, 0.587, 0.114));\r
  color += grain * uGrain * (uLightMode > 0.5 ? 0.6 : 0.25 + 0.75 * sqrt(clamp(lum, 0.0, 1.0)));\r
  color = clamp(color, 0.0, 1.0);\r
\r
  vec2 uv = gl_FragCoord.xy / uView;\r
  float edgeFade = max(uFade * 0.5, 1e-4);\r
  float mask = uFade > 0.0 ? smoother(uv.x / edgeFade) * smoother((1.0 - uv.x) / edgeFade) * smoother(uv.y / edgeFade) * smoother((1.0 - uv.y) / edgeFade) : 1.0;\r
  alpha *= mask;\r
  outColor = vec4(color * alpha, alpha);\r
}\`;\r
\r
const UNIFORMS = [\r
  'uRipples',\r
  'uWave',\r
  'uSquare',\r
  'uClock',\r
  'uSwell',\r
  'uHover',\r
  'uIntro',\r
  'uViewProj',\r
  'uArea',\r
  'uEye',\r
  'uColor',\r
  'uAccent',\r
  'uSecond',\r
  'uLightA',\r
  'uLightB',\r
  'uTile',\r
  'uAngle',\r
  'uGap',\r
  'uRound',\r
  'uSoftness',\r
  'uBulge',\r
  'uGloss',\r
  'uRange',\r
  'uBrightness',\r
  'uGrain',\r
  'uGrainScale',\r
  'uLightMode',\r
  'uOpacity',\r
  'uReveal',\r
  'uView',\r
  'uFade',\r
  'uFrame'\r
];\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const ease = x => {\r
  const t = clamp(x, 0, 1);\r
  return 1 - (1 - t) * (1 - t) * (1 - t);\r
};\r
\r
const glide = x => {\r
  const t = clamp(x, 0, 1);\r
  return t * t * t * (t * (t * 6 - 15) + 10);\r
};\r
\r
const smoothstep = (a, b, x) => {\r
  const t = clamp((x - a) / (b - a), 0, 1);\r
  return t * t * (3 - 2 * t);\r
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
  gl.linkProgram(program);\r
  gl.deleteShader(vertex);\r
  gl.deleteShader(fragment);\r
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {\r
    gl.deleteProgram(program);\r
    return null;\r
  }\r
  const uniforms = {};\r
  for (const name of UNIFORMS) uniforms[name] = gl.getUniformLocation(program, name);\r
  return { program, uniforms };\r
};\r
\r
const perspective = (fov, aspect, near, far) => {\r
  const f = 1 / Math.tan(fov / 2);\r
  const nf = 1 / (near - far);\r
  return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];\r
};\r
\r
const lookAt = (eye, target) => {\r
  let zx = eye[0] - target[0];\r
  let zy = eye[1] - target[1];\r
  let zz = eye[2] - target[2];\r
  let len = Math.hypot(zx, zy, zz) || 1;\r
  zx /= len;\r
  zy /= len;\r
  zz /= len;\r
  let xx = zz;\r
  let xz = -zx;\r
  len = Math.hypot(xx, xz) || 1;\r
  xx /= len;\r
  xz /= len;\r
  const yx = zy * xz;\r
  const yy = zz * xx - zx * xz;\r
  const yz = -zy * xx;\r
  return [\r
    xx,\r
    yx,\r
    zx,\r
    0,\r
    0,\r
    yy,\r
    zy,\r
    0,\r
    xz,\r
    yz,\r
    zz,\r
    0,\r
    -(xx * eye[0] + xz * eye[2]),\r
    -(yx * eye[0] + yy * eye[1] + yz * eye[2]),\r
    -(zx * eye[0] + zy * eye[1] + zz * eye[2]),\r
    1\r
  ];\r
};\r
\r
const multiply = (a, b) => {\r
  const out = new Array(16);\r
  for (let col = 0; col < 4; col += 1) {\r
    for (let row = 0; row < 4; row += 1) {\r
      out[col * 4 + row] =\r
        a[row] * b[col * 4] + a[4 + row] * b[col * 4 + 1] + a[8 + row] * b[col * 4 + 2] + a[12 + row] * b[col * 4 + 3];\r
    }\r
  }\r
  return out;\r
};\r
\r
const invert = a => {\r
  const b00 = a[0] * a[5] - a[1] * a[4];\r
  const b01 = a[0] * a[6] - a[2] * a[4];\r
  const b02 = a[0] * a[7] - a[3] * a[4];\r
  const b03 = a[1] * a[6] - a[2] * a[5];\r
  const b04 = a[1] * a[7] - a[3] * a[5];\r
  const b05 = a[2] * a[7] - a[3] * a[6];\r
  const b06 = a[8] * a[13] - a[9] * a[12];\r
  const b07 = a[8] * a[14] - a[10] * a[12];\r
  const b08 = a[8] * a[15] - a[11] * a[12];\r
  const b09 = a[9] * a[14] - a[10] * a[13];\r
  const b10 = a[9] * a[15] - a[11] * a[13];\r
  const b11 = a[10] * a[15] - a[11] * a[14];\r
  const det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;\r
  const k = det ? 1 / det : 0;\r
  return [\r
    (a[5] * b11 - a[6] * b10 + a[7] * b09) * k,\r
    (a[2] * b10 - a[1] * b11 - a[3] * b09) * k,\r
    (a[13] * b05 - a[14] * b04 + a[15] * b03) * k,\r
    (a[10] * b04 - a[9] * b05 - a[11] * b03) * k,\r
    (a[6] * b08 - a[4] * b11 - a[7] * b07) * k,\r
    (a[0] * b11 - a[2] * b08 + a[3] * b07) * k,\r
    (a[14] * b02 - a[12] * b05 - a[15] * b01) * k,\r
    (a[8] * b05 - a[10] * b02 + a[11] * b01) * k,\r
    (a[4] * b10 - a[5] * b08 + a[7] * b06) * k,\r
    (a[1] * b08 - a[0] * b10 - a[3] * b06) * k,\r
    (a[12] * b04 - a[13] * b02 + a[15] * b00) * k,\r
    (a[9] * b02 - a[8] * b04 - a[11] * b00) * k,\r
    (a[5] * b07 - a[4] * b09 - a[6] * b06) * k,\r
    (a[0] * b09 - a[1] * b07 + a[2] * b06) * k,\r
    (a[13] * b01 - a[12] * b03 - a[14] * b00) * k,\r
    (a[8] * b03 - a[9] * b01 + a[10] * b00) * k\r
  ];\r
};\r
\r
const AcidSquares = ({\r
  color = '#120f17',\r
  accentColor = '#ff4fb8',\r
  secondaryColor = '#3b6bff',\r
  tileSize = 1,\r
  gap = 0.12,\r
  roundness = 0.25,\r
  softness = 0.5,\r
  bulge = 0.3,\r
  rotation = 35,\r
  gloss = 0.6,\r
  waves = 1,\r
  waveScale = 1,\r
  speed = 0.6,\r
  shape = 'square',\r
  pulse = 1,\r
  pulseSpeed = 0.45,\r
  pulseSpacing = 1,\r
  pulseWidth = 1,\r
  pulseOrigin = 'center',\r
  brightness = 1,\r
  lighting = 'split',\r
  tilt = 0.7,\r
  zoom = 1,\r
  depth = 10,\r
  grain = 0.12,\r
  fade = 0,\r
  opacity = 1,\r
  intro = true,\r
  mouseInteraction = true,\r
  hoverEffect = 'press',\r
  mouseStrength = 1,\r
  mouseRadius = 0.35,\r
  pulseOnClick = true,\r
  detail = 'medium',\r
  lightMode = false,\r
  paused = false,\r
  dpr,\r
  ...rest\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settings = {\r
    color: String(color),\r
    accentColor: String(accentColor),\r
    secondaryColor: String(secondaryColor),\r
    tileSize: clamp(tileSize, 0.2, 5),\r
    gap: clamp(gap, 0, 0.6),\r
    roundness: clamp(roundness, 0, 1),\r
    softness: clamp(softness, 0, 1),\r
    bulge: clamp(bulge, 0, 1.5),\r
    rotation: rotation * DEG,\r
    gloss: clamp(gloss, 0, 1),\r
    waves: Math.max(0, waves),\r
    waveScale: clamp(waveScale, 0.1, 5),\r
    speed: Math.max(0, speed),\r
    square: shape === 'round' ? 0 : 1,\r
    pulse: Math.max(0, pulse),\r
    pulseSpeed: Math.max(0, pulseSpeed),\r
    pulseSpacing: clamp(pulseSpacing, 0.2, 6),\r
    pulseWidth: clamp(pulseWidth, 0.1, 5),\r
    randomOrigin: pulseOrigin === 'random',\r
    brightness: Math.max(0, brightness),\r
    lights: LIGHTING[lighting] || LIGHTING.split,\r
    tilt: clamp(tilt, 0, 1),\r
    zoom: clamp(zoom, 0.3, 4),\r
    depth: clamp(depth, 2, 40),\r
    grain: Math.max(0, grain),\r
    fade: clamp(fade, 0, 1),\r
    opacity: clamp(opacity, 0, 1),\r
    intro,\r
    mouseInteraction,\r
    hover: HOVER_EFFECTS[hoverEffect] ?? 1,\r
    mouseStrength: Math.max(0, mouseStrength),\r
    mouseRadius: clamp(mouseRadius, 0.02, 2),\r
    pulseOnClick,\r
    mesh: MESH[detail] || MESH.medium,\r
    lightMode,\r
    paused,\r
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
      antialias: true,\r
      depth: true,\r
      stencil: false\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const surface = link(gl, VERTEX, FRAGMENT);\r
    if (!surface) return undefined;\r
\r
    const vao = gl.createVertexArray();\r
    const gridBuffer = gl.createBuffer();\r
    const indexBuffer = gl.createBuffer();\r
    let meshSize = 0;\r
    let indexCount = 0;\r
    const buildMesh = size => {\r
      if (size === meshSize) return;\r
      meshSize = size;\r
      const points = new Float32Array((size + 1) * (size + 1) * 2);\r
      let o = 0;\r
      for (let j = 0; j <= size; j += 1) {\r
        for (let i = 0; i <= size; i += 1) {\r
          points[o] = i / size;\r
          points[o + 1] = j / size;\r
          o += 2;\r
        }\r
      }\r
      const indices = new Uint32Array(size * size * 6);\r
      o = 0;\r
      for (let j = 0; j < size; j += 1) {\r
        for (let i = 0; i < size; i += 1) {\r
          const a = j * (size + 1) + i;\r
          const b = a + 1;\r
          const c = a + size + 1;\r
          const d = c + 1;\r
          indices[o] = a;\r
          indices[o + 1] = c;\r
          indices[o + 2] = b;\r
          indices[o + 3] = b;\r
          indices[o + 4] = c;\r
          indices[o + 5] = d;\r
          o += 6;\r
        }\r
      }\r
      indexCount = indices.length;\r
      gl.bindVertexArray(vao);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, gridBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);\r
      gl.enableVertexAttribArray(0);\r
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);\r
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const probe = document.createElement('canvas');\r
    probe.width = 1;\r
    probe.height = 1;\r
    const probeContext = probe.getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const state = {\r
      clock: 0,\r
      swell: 0,\r
      lights: 0,\r
      frame: 0,\r
      nextRipple: 1.2,\r
      ripples: [],\r
      intro: settingsRef.current.intro && !reduce ? 0 : INTRO_SECONDS,\r
      width: 1,\r
      height: 1,\r
      colorKey: '',\r
      color: [0.07, 0.06, 0.09],\r
      accent: [1, 0.31, 0.72],\r
      second: [0.23, 0.42, 1],\r
      pointer: { x: 0, y: 0, inside: false },\r
      hover: { x: 0, z: 0, vx: 0, vz: 0, presence: 0, placed: false },\r
      look: { x: 0, y: 0, vx: 0, vy: 0 },\r
      seed: 1,\r
      camera: null\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let alive = true;\r
\r
    const toRgb = (value, fallback) => {\r
      if (!probeContext || !value) return fallback;\r
      const css = /^[0-9a-f]{3,8}$/i.test(value) ? \`#\${value}\` : value;\r
      probeContext.clearRect(0, 0, 1, 1);\r
      probeContext.fillStyle = '#000000';\r
      probeContext.fillStyle = css;\r
      probeContext.fillRect(0, 0, 1, 1);\r
      const [r, g, b] = probeContext.getImageData(0, 0, 1, 1).data;\r
      return [r / 255, g / 255, b / 255];\r
    };\r
\r
    const resolveColors = s => {\r
      const key = \`\${s.color}|\${s.accentColor}|\${s.secondaryColor}\`;\r
      if (key === state.colorKey) return;\r
      state.colorKey = key;\r
      state.color = toRgb(s.color, [0.07, 0.06, 0.09]);\r
      state.accent = toRgb(s.accentColor, [1, 0.31, 0.72]);\r
      state.second = toRgb(s.secondaryColor, [0.23, 0.42, 1]);\r
    };\r
\r
    const random = () => {\r
      state.seed = (state.seed * 16807) % 2147483647;\r
      return (state.seed - 1) / 2147483646;\r
    };\r
\r
    const cameraFor = s => {\r
      const aspect = state.width / Math.max(state.height, 1);\r
      const distance = 8 / s.zoom;\r
      const yaw = state.look.x * 0.16;\r
      const pitch = 1.5 - s.tilt * 1.26 + state.look.y * 0.05;\r
      const target = [ORIGIN[0], 0, ORIGIN[1]];\r
      const eye = [\r
        target[0] + Math.sin(yaw) * Math.cos(pitch) * distance,\r
        target[1] + Math.sin(pitch) * distance,\r
        target[2] + Math.cos(yaw) * Math.cos(pitch) * distance\r
      ];\r
      const projection = perspective(0.8, aspect, 0.1, 400);\r
      const view = lookAt(eye, target);\r
      const viewProj = multiply(projection, view);\r
      return { eye, target, viewProj, inverse: invert(viewProj), distance };\r
    };\r
\r
    const rippleData = new Float32Array(MAX_RIPPLES * 4);\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      buildMesh(s.mesh);\r
      resolveColors(s);\r
      const camera = cameraFor(s);\r
      state.camera = camera;\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clearDepth(1);\r
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);\r
      gl.enable(gl.DEPTH_TEST);\r
      gl.depthFunc(gl.LEQUAL);\r
      gl.useProgram(surface.program);\r
      const u = surface.uniforms;\r
      rippleData.fill(0);\r
      state.ripples.forEach((ripple, index) => {\r
        rippleData[index * 4] = ripple.x;\r
        rippleData[index * 4 + 1] = ripple.z;\r
        rippleData[index * 4 + 2] = ripple.start;\r
        rippleData[index * 4 + 3] = ripple.strength;\r
      });\r
      const introAge = state.intro;\r
      const revealing = introAge < INTRO_SECONDS;\r
      const revealRadius = glide(introAge / REVEAL_SECONDS) * REVEAL_REACH;\r
      const settle = ease(introAge / INTRO_SECONDS);\r
      gl.uniform4fv(u.uRipples, rippleData);\r
      gl.uniform4f(u.uWave, 0.55 * s.pulse, 3 * Math.max(s.pulseSpeed, 0.05) + 1.2, 1.6 * s.pulseWidth, 46);\r
      gl.uniform1f(u.uSquare, s.square);\r
      gl.uniform1f(u.uClock, state.clock);\r
      gl.uniform4f(u.uSwell, 1.3 * s.waves * (0.25 + 0.75 * settle), 1.9 / s.waveScale, 0, state.swell);\r
      gl.uniform4f(\r
        u.uHover,\r
        state.hover.x,\r
        state.hover.z,\r
        (3 * s.mouseRadius) / 0.35,\r
        0.7 * state.hover.presence * s.mouseStrength * s.hover\r
      );\r
      gl.uniform4f(\r
        u.uIntro,\r
        ORIGIN[0],\r
        ORIGIN[1],\r
        revealRadius,\r
        revealing ? 0.9 * (1 - smoothstep(0.55, 1, introAge / INTRO_SECONDS)) : 0\r
      );\r
      gl.uniformMatrix4fv(u.uViewProj, false, camera.viewProj);\r
      gl.uniform4f(u.uArea, AREA[0] + ORIGIN[0], AREA[1] + ORIGIN[1], AREA[2], AREA[3]);\r
      gl.uniform3f(u.uEye, camera.eye[0], camera.eye[1], camera.eye[2]);\r
      gl.uniform3f(u.uColor, state.color[0], state.color[1], state.color[2]);\r
      gl.uniform3f(u.uAccent, state.accent[0], state.accent[1], state.accent[2]);\r
      gl.uniform3f(u.uSecond, state.second[0], state.second[1], state.second[2]);\r
      const orbit = state.lights;\r
      const reach = camera.distance / 8;\r
      const lightLevel = 0.35 + 0.65 * settle;\r
      const [first, second] = s.lights;\r
      gl.uniform3f(\r
        u.uLightA,\r
        camera.target[0] + (first[0] + Math.sin(orbit * 0.7) * first[3]) * reach,\r
        first[1] * reach * lightLevel + 0.6,\r
        camera.target[2] + (first[2] + Math.cos(orbit * 0.5) * first[4]) * reach\r
      );\r
      gl.uniform3f(\r
        u.uLightB,\r
        camera.target[0] + (second[0] + Math.cos(orbit * 0.6) * second[3]) * reach,\r
        second[1] * reach * lightLevel + 0.6,\r
        camera.target[2] + (second[2] + Math.sin(orbit * 0.45) * second[4]) * reach\r
      );\r
      gl.uniform1f(u.uTile, 1.2 * s.tileSize);\r
      gl.uniform1f(u.uAngle, s.rotation);\r
      gl.uniform1f(u.uGap, s.gap);\r
      gl.uniform1f(u.uRound, s.roundness);\r
      gl.uniform1f(u.uSoftness, s.softness);\r
      gl.uniform1f(u.uBulge, s.bulge);\r
      gl.uniform1f(u.uGloss, s.gloss);\r
      const far = Math.min(s.depth * 3.2 * reach, AREA[3] * 0.62);\r
      gl.uniform2f(u.uRange, far * 0.5, far);\r
      gl.uniform1f(u.uBrightness, s.brightness);\r
      const pixelRatio = canvas.height / Math.max(state.height, 1);\r
      gl.uniform1f(u.uGrain, s.grain);\r
      gl.uniform1f(u.uGrainScale, Math.max(1, pixelRatio));\r
      gl.uniform1f(u.uLightMode, s.lightMode ? 1 : 0);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.uniform4f(u.uReveal, ORIGIN[0], ORIGIN[1], revealRadius, revealing ? 0 : 1);\r
      gl.uniform2f(u.uView, canvas.width, canvas.height);\r
      gl.uniform1f(u.uFade, s.fade);\r
      gl.uniform1f(u.uFrame, state.frame % 977);\r
      gl.bindVertexArray(vao);\r
      gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_INT, 0);\r
      gl.bindVertexArray(null);\r
      gl.disable(gl.DEPTH_TEST);\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const baseDpr = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      const longest = Math.max(width, height) * baseDpr;\r
      const ratio = longest > MAX_RENDER_DIM ? (baseDpr * MAX_RENDER_DIM) / longest : baseDpr;\r
      const pixelWidth = Math.max(1, Math.round(width * ratio));\r
      const pixelHeight = Math.max(1, Math.round(height * ratio));\r
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {\r
        canvas.width = pixelWidth;\r
        canvas.height = pixelHeight;\r
      }\r
      state.width = width;\r
      state.height = height;\r
      render();\r
    };\r
\r
    const groundPoint = (px, py) => {\r
      const camera = state.camera;\r
      if (!camera) return null;\r
      const nx = (px / state.width) * 2 - 1;\r
      const ny = 1 - (py / state.height) * 2;\r
      const m = camera.inverse;\r
      const fx = m[0] * nx + m[4] * ny + m[8] + m[12];\r
      const fy = m[1] * nx + m[5] * ny + m[9] + m[13];\r
      const fz = m[2] * nx + m[6] * ny + m[10] + m[14];\r
      const fw = m[3] * nx + m[7] * ny + m[11] + m[15];\r
      const dx = fx / fw - camera.eye[0];\r
      const dy = fy / fw - camera.eye[1];\r
      const dz = fz / fw - camera.eye[2];\r
      if (dy >= -1e-4) return null;\r
      const t = -camera.eye[1] / dy;\r
      return { x: camera.eye[0] + dx * t, z: camera.eye[2] + dz * t };\r
    };\r
\r
    const spawn = (x, z, strength) => {\r
      state.ripples.push({ x, z, start: state.clock, strength });\r
      while (state.ripples.length > MAX_RIPPLES) state.ripples.shift();\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!alive || !visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const moving = !s.paused && !reduce;\r
      if (moving) {\r
        state.frame += 1;\r
        state.clock += dt;\r
        state.intro += dt;\r
        state.swell += dt * s.speed;\r
        state.lights += dt * s.speed * 0.6;\r
        const travel = 3 * Math.max(s.pulseSpeed, 0.05) + 1.2;\r
        const interval = (10 * s.pulseSpacing) / travel;\r
        if (s.pulse > 0 && state.clock >= state.nextRipple) {\r
          if (s.randomOrigin) {\r
            const spot = groundPoint((0.15 + random() * 0.7) * state.width, (0.25 + random() * 0.6) * state.height);\r
            if (spot) spawn(spot.x, spot.z, 1);\r
          } else {\r
            spawn(ORIGIN[0], ORIGIN[1], 1);\r
          }\r
          state.nextRipple = state.clock + interval * (s.randomOrigin ? 0.6 : 1);\r
        }\r
        const lifetime = 46 / travel + 1;\r
        state.ripples = state.ripples.filter(ripple => state.clock - ripple.start < lifetime);\r
      } else if (state.intro < INTRO_SECONDS) {\r
        state.intro = INTRO_SECONDS;\r
      }\r
\r
      const { pointer, hover, look } = state;\r
      const active = s.mouseInteraction && pointer.inside && !reduce;\r
      const spot = active && s.hover !== 0 ? groundPoint(pointer.x, pointer.y) : null;\r
      if (spot) {\r
        if (!hover.placed) {\r
          hover.x = spot.x;\r
          hover.z = spot.z;\r
          hover.vx = 0;\r
          hover.vz = 0;\r
          hover.placed = true;\r
        }\r
        hover.vx += (90 * (spot.x - hover.x) - 19 * hover.vx) * dt;\r
        hover.vz += (90 * (spot.z - hover.z) - 19 * hover.vz) * dt;\r
        hover.x += hover.vx * dt;\r
        hover.z += hover.vz * dt;\r
      }\r
      const goal = spot ? 1 : 0;\r
      hover.presence += (goal - hover.presence) * (1 - Math.exp(-dt / (goal > hover.presence ? 0.35 : 0.6)));\r
      if (!spot && hover.presence < 0.001) hover.placed = false;\r
      const lookX = active ? (pointer.x / state.width - 0.5) * 0.5 : 0;\r
      const lookY = active ? (0.5 - pointer.y / state.height) * 0.5 : 0;\r
      look.vx += (30 * (lookX - look.x) - 11 * look.vx) * dt;\r
      look.vy += (30 * (lookY - look.y) - 11 * look.vy) * dt;\r
      look.x += look.vx * dt;\r
      look.y += look.vy * dt;\r
\r
      render();\r
      const settling =\r
        Math.abs(goal - hover.presence) > 0.002 ||\r
        Math.hypot(hover.vx, hover.vz) > 0.01 ||\r
        Math.abs(lookX - look.x) > 0.0002 ||\r
        Math.abs(lookY - look.y) > 0.0002;\r
      if (moving || settling) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!raf && alive && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const onPointerMove = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      state.pointer.x = x;\r
      state.pointer.y = y;\r
      state.pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      if (!s.mouseInteraction || !s.pulseOnClick || event.button !== 0 || reduce) return;\r
      if (\r
        event.target instanceof Element &&\r
        event.target.closest('a, button, input, textarea, select, label, [role="button"]')\r
      )\r
        return;\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;\r
      const spot = groundPoint(x, y);\r
      if (spot) spawn(spot.x, spot.z, 1.15);\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      state.pointer.inside = false;\r
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
    window.addEventListener('pointerdown', onPointerDown);\r
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
    wake();\r
\r
    wakeRef.current = () => {\r
      if (!raf) render();\r
      wake();\r
    };\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteBuffer(gridBuffer);\r
      gl.deleteBuffer(indexBuffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(surface.program);\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  const { className = '', ...attributes } = rest;\r
\r
  return (\r
    <div ref={containerRef} className={\`acid-squares-container\${className ? \` \${className}\` : ''}\`} {...attributes}>\r
      <canvas ref={canvasRef} className="acid-squares-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default AcidSquares;\r
`,n=`.acid-squares-container {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.acid-squares-canvas {\r
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
const MAX_RIPPLES = 8;\r
const MESH = { low: 150, medium: 210, high: 280 };\r
const AREA = [-42, -76, 84, 94];\r
const MAX_RENDER_DIM = 2400;\r
const INTRO_SECONDS = 3;\r
const REVEAL_SECONDS = 2.6;\r
const REVEAL_REACH = 19;\r
const ORIGIN = [0, -3];\r
const HOVER_EFFECTS = { press: 1, lift: -1, none: 0 };\r
const LIGHTING = {\r
  split: [\r
    [7, 4.2, -4, 4, 4],\r
    [-8, 3.6, 3, 4, 4]\r
  ],\r
  backlit: [\r
    [6, 1.6, -15, 5, 3],\r
    [-7, 1.4, -13, 5, 3]\r
  ],\r
  overhead: [\r
    [3, 7.5, -4, 3, 3],\r
    [-3, 7, -1, 3, 3]\r
  ]\r
};\r
const DEG = Math.PI / 180;\r
\r
const FIELD = \`\r
uniform vec4 uRipples[\${MAX_RIPPLES}];\r
uniform vec4 uWave;\r
uniform float uSquare;\r
uniform float uClock;\r
uniform vec4 uSwell;\r
uniform vec4 uHover;\r
uniform vec4 uIntro;\r
\r
float reachOf(vec2 delta, out vec2 grad) {\r
  vec2 a = abs(delta);\r
  vec2 dir = vec2(delta.x < 0.0 ? -1.0 : 1.0, delta.y < 0.0 ? -1.0 : 1.0);\r
  float round_ = length(delta);\r
  vec2 roundGrad = delta / max(round_, 1e-4);\r
  float m = max(max(a.x, a.y), 1e-4);\r
  vec2 k = a / m;\r
  vec2 k3 = k * k * k;\r
  float sum = dot(k3, k);\r
  float root = sqrt(sqrt(sum));\r
  float square = m * root;\r
  vec2 squareGrad = dir * k3 / (root * root * root);\r
  float d = mix(round_, square, uSquare);\r
  vec2 g = mix(roundGrad, squareGrad, uSquare);\r
  float soft = sqrt(d * d + 0.36);\r
  grad = g * d / soft;\r
  return soft - 0.6;\r
}\r
\r
vec3 field(vec2 p) {\r
  float t = uSwell.w;\r
  float f = uSwell.y;\r
  vec2 k1 = vec2(0.19, 0.11) * f;\r
  vec2 k2 = vec2(-0.09, 0.23) * f;\r
  vec2 k3 = vec2(0.29, -0.17) * f;\r
  float a1 = dot(p, k1) + t * 0.55;\r
  float a2 = dot(p, k2) - t * 0.42 + 1.3;\r
  float a3 = dot(p, k3) + t * 0.74 + 2.1;\r
  float h = 0.55 * sin(a1) + 0.4 * sin(a2) + 0.22 * sin(a3);\r
  vec2 g = 0.55 * cos(a1) * k1 + 0.4 * cos(a2) * k2 + 0.22 * cos(a3) * k3;\r
  h *= uSwell.x;\r
  g *= uSwell.x;\r
  vec2 dg;\r
  for (int i = 0; i < \${MAX_RIPPLES}; i++) {\r
    vec4 r = uRipples[i];\r
    if (r.w <= 0.0) continue;\r
    float age = uClock - r.z;\r
    if (age <= 0.0) continue;\r
    float d = reachOf(p - r.xy, dg);\r
    float radius = age * uWave.y;\r
    float x = (d - radius) / uWave.z;\r
    float life = clamp(1.0 - radius / uWave.w, 0.0, 1.0);\r
    float strength = r.w * uWave.x * life * life * smoothstep(0.0, 1.5, radius);\r
    float bump = exp(-x * x);\r
    h += bump * strength;\r
    g += -2.0 * x * bump * strength / uWave.z * dg;\r
  }\r
  if (uIntro.w > 0.0) {\r
    float d = reachOf(p - uIntro.xy, dg);\r
    float x = (d - uIntro.z) / 2.2;\r
    float bump = exp(-x * x) * uIntro.w;\r
    h += bump;\r
    g += -2.0 * x * bump / 2.2 * dg;\r
  }\r
  vec2 hd = p - uHover.xy;\r
  float hr = max(uHover.z, 1e-3);\r
  float hover = exp(-dot(hd, hd) / (hr * hr)) * uHover.w;\r
  h -= hover;\r
  g += 2.0 * hd / (hr * hr) * hover;\r
  return vec3(h, g);\r
}\r
\`;\r
\r
const VERTEX = \`#version 300 es\r
precision highp float;\r
\${FIELD}\r
layout(location = 0) in vec2 aGrid;\r
uniform mat4 uViewProj;\r
uniform vec4 uArea;\r
out vec2 vGround;\r
out vec3 vWorld;\r
void main() {\r
  vec2 ground = uArea.xy + aGrid * uArea.zw;\r
  vec3 f = field(ground);\r
  vWorld = vec3(ground.x, f.x, ground.y);\r
  vGround = ground;\r
  gl_Position = uViewProj * vec4(vWorld, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
\${FIELD}\r
uniform vec3 uEye;\r
uniform vec3 uColor;\r
uniform vec3 uAccent;\r
uniform vec3 uSecond;\r
uniform vec3 uLightA;\r
uniform vec3 uLightB;\r
uniform float uTile;\r
uniform float uAngle;\r
uniform float uGap;\r
uniform float uRound;\r
uniform float uSoftness;\r
uniform float uBulge;\r
uniform float uGloss;\r
uniform vec2 uRange;\r
uniform float uBrightness;\r
uniform float uGrain;\r
uniform float uGrainScale;\r
uniform float uLightMode;\r
uniform float uOpacity;\r
uniform vec4 uReveal;\r
uniform vec2 uView;\r
uniform float uFade;\r
uniform float uFrame;\r
in vec2 vGround;\r
in vec3 vWorld;\r
out vec4 outColor;\r
\r
float smoother(float x) {\r
  x = clamp(x, 0.0, 1.0);\r
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);\r
}\r
\r
float hash(vec3 p) {\r
  p = fract(p * 0.1031);\r
  p += dot(p, p.zyx + 31.32);\r
  return fract((p.x + p.y) * p.z);\r
}\r
\r
void main() {\r
  vec3 f = field(vGround);\r
  vec3 n0 = normalize(vec3(-f.y, 1.0, -f.z));\r
  vec3 tx = normalize(vec3(1.0, f.y, 0.0));\r
  vec3 tz = normalize(cross(tx, n0));\r
  tx = normalize(cross(n0, tz));\r
\r
  float c = cos(uAngle);\r
  float s = sin(uAngle);\r
  mat2 toTile = mat2(c, -s, s, c);\r
  vec2 q = toTile * vGround / uTile;\r
  vec2 cell = floor(q);\r
  vec2 local = q - cell - 0.5;\r
  float footprint = max(length(fwidth(q)), 1e-5);\r
\r
  float on = 1.0;\r
  if (uReveal.w < 1.0) {\r
    vec2 centre = transpose(toTile) * (cell + 0.5) * uTile;\r
    vec2 dg;\r
    float d = reachOf(centre - uReveal.xy, dg);\r
    float delay = hash(vec3(cell, 7.0)) * 1.1;\r
    on = max(smoother((uReveal.z - d - delay) / 1.6), uReveal.w);\r
  }\r
\r
  float half_ = (0.5 - uGap * 0.5) * mix(0.62, 1.0, on);\r
  float radius = min(uRound * half_, half_);\r
  vec2 dd = abs(local) - (half_ - radius);\r
  float d = length(max(dd, 0.0)) + min(max(dd.x, dd.y), 0.0) - radius;\r
  vec2 outward = dd.x > 0.0 || dd.y > 0.0 ? normalize(max(dd, 0.0) * sign(local)) : (dd.x > dd.y ? vec2(sign(local.x), 0.0) : vec2(0.0, sign(local.y)));\r
\r
  float bevelWidth = max(mix(0.04, 0.42, uSoftness) * half_, footprint * 1.5);\r
  float edge = clamp((d + bevelWidth) / bevelWidth, 0.0, 1.0);\r
  float dome = uBulge * 0.5 * length(local) / max(half_, 1e-3);\r
  float theta = edge * edge * mix(0.7, 1.35, uSoftness) + dome;\r
  vec2 outwardGround = transpose(toTile) * outward;\r
  vec2 domeGround = transpose(toTile) * (local / max(length(local), 1e-4));\r
  vec3 bend = normalize(tx * mix(domeGround.x, outwardGround.x, edge) + tz * mix(domeGround.y, outwardGround.y, edge));\r
  float crowd = smoothstep(0.08, 0.3, footprint);\r
  theta *= 1.0 - crowd;\r
  vec3 n = normalize(n0 * cos(theta) + bend * sin(theta));\r
\r
  float inside = 1.0 - smoothstep(-footprint * 0.75, footprint * 0.75, d);\r
  float area = (2.0 * half_) * (2.0 * half_) - (4.0 - 3.14159) * radius * radius;\r
  inside = mix(inside, area, crowd) * on;\r
\r
  vec3 toEye = uEye - vWorld;\r
  float dist = length(toEye);\r
  vec3 v = toEye / dist;\r
  vec3 la = uLightA - vWorld;\r
  vec3 lb = uLightB - vWorld;\r
  float da = length(la);\r
  float db = length(lb);\r
  la /= da;\r
  lb /= db;\r
  float fa = 1.0 / (1.0 + da * da * 0.02);\r
  float fb = 1.0 / (1.0 + db * db * 0.02);\r
\r
  float ndv = clamp(dot(n, v), 0.0, 1.0);\r
  float fresnel = 0.04 + 0.96 * pow(1.0 - ndv, 5.0);\r
  vec3 ha = normalize(la + v);\r
  vec3 hb = normalize(lb + v);\r
  float shine = mix(10.0, 90.0, uGloss);\r
  float norm = (shine + 8.0) / 60.0;\r
  float specA = pow(max(dot(n, ha), 0.0), shine) * norm;\r
  float specB = pow(max(dot(n, hb), 0.0), shine) * norm;\r
  float sheenA = pow(max(dot(n, ha), 0.0), 8.0);\r
  float sheenB = pow(max(dot(n, hb), 0.0), 8.0);\r
  float diffA = max(dot(n, la), 0.0);\r
  float diffB = max(dot(n, lb), 0.0);\r
  vec3 r = reflect(-v, n);\r
  float rim = exp((dot(r, normalize(vec3(0.15, 0.55, -1.0))) - 1.0) * 6.0);\r
  float occlusion = mix(1.0, 0.35, edge * edge);\r
  float edgeLight = edge * edge;\r
\r
  vec3 color;\r
  float alpha;\r
  if (uLightMode > 0.5) {\r
    float luma = dot(uColor, vec3(0.299, 0.587, 0.114));\r
    vec3 body = mix(vec3(luma), uColor, 0.5) * 0.96;\r
    vec3 keyDir = normalize(vec3(-0.35, 0.85, 0.45));\r
    float shade = clamp(dot(n, keyDir) * 0.6 + 0.5, 0.0, 1.0);\r
    float wa = clamp(diffA * fa * 9.0, 0.0, 1.0);\r
    float wb = clamp(diffB * fb * 9.0, 0.0, 1.0);\r
    vec3 hue = (uAccent * wa + uSecond * wb) / max(wa + wb, 1e-3);\r
    vec3 lit = body * mix(vec3(1.0), hue, clamp(wa + wb, 0.0, 1.0) * 0.42) * mix(0.7, 1.05, shade);\r
    lit += vec3(1.0) * (specA * fa + specB * fb) * 2.4 * uGloss;\r
    lit *= mix(1.0, 0.8, edgeLight * (1.0 - crowd));\r
    color = lit;\r
    alpha = inside;\r
  } else {\r
    float luma = dot(uColor, vec3(0.299, 0.587, 0.114));\r
    vec3 body = mix(vec3(luma), uColor, 0.35) + vec3(0.02);\r
    vec3 lit = body * 0.25;\r
    lit += body * (uAccent * diffA * fa + uSecond * diffB * fb) * 14.0;\r
    lit += uAccent * (specA * (0.55 + 1.6 * edgeLight) + sheenA * 0.3) * fa * 9.0 * uGloss;\r
    lit += uSecond * (specB * (0.55 + 1.6 * edgeLight) + sheenB * 0.3) * fb * 9.0 * uGloss;\r
    lit += mix(uSecond, vec3(1.0), 0.4) * rim * fresnel * 0.35 * uGloss;\r
    lit *= occlusion;\r
    color = lit * inside;\r
    alpha = inside;\r
  }\r
\r
  float fade = 1.0 - smoother((dist - uRange.x) / max(uRange.y - uRange.x, 1e-3));\r
  alpha *= fade * uOpacity;\r
  color *= uBrightness;\r
  if (uLightMode < 0.5) color = 1.0 - exp(-color * 1.1);\r
\r
  vec2 grainCell = floor(gl_FragCoord.xy / uGrainScale);\r
  float grain = hash(vec3(grainCell, uFrame)) + hash(vec3(grainCell + 17.0, uFrame + 3.0)) - 1.0;\r
  float lum = dot(color, vec3(0.299, 0.587, 0.114));\r
  color += grain * uGrain * (uLightMode > 0.5 ? 0.6 : 0.25 + 0.75 * sqrt(clamp(lum, 0.0, 1.0)));\r
  color = clamp(color, 0.0, 1.0);\r
\r
  vec2 uv = gl_FragCoord.xy / uView;\r
  float edgeFade = max(uFade * 0.5, 1e-4);\r
  float mask = uFade > 0.0 ? smoother(uv.x / edgeFade) * smoother((1.0 - uv.x) / edgeFade) * smoother(uv.y / edgeFade) * smoother((1.0 - uv.y) / edgeFade) : 1.0;\r
  alpha *= mask;\r
  outColor = vec4(color * alpha, alpha);\r
}\`;\r
\r
const UNIFORMS = [\r
  'uRipples',\r
  'uWave',\r
  'uSquare',\r
  'uClock',\r
  'uSwell',\r
  'uHover',\r
  'uIntro',\r
  'uViewProj',\r
  'uArea',\r
  'uEye',\r
  'uColor',\r
  'uAccent',\r
  'uSecond',\r
  'uLightA',\r
  'uLightB',\r
  'uTile',\r
  'uAngle',\r
  'uGap',\r
  'uRound',\r
  'uSoftness',\r
  'uBulge',\r
  'uGloss',\r
  'uRange',\r
  'uBrightness',\r
  'uGrain',\r
  'uGrainScale',\r
  'uLightMode',\r
  'uOpacity',\r
  'uReveal',\r
  'uView',\r
  'uFade',\r
  'uFrame'\r
];\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const ease = x => {\r
  const t = clamp(x, 0, 1);\r
  return 1 - (1 - t) * (1 - t) * (1 - t);\r
};\r
\r
const glide = x => {\r
  const t = clamp(x, 0, 1);\r
  return t * t * t * (t * (t * 6 - 15) + 10);\r
};\r
\r
const smoothstep = (a, b, x) => {\r
  const t = clamp((x - a) / (b - a), 0, 1);\r
  return t * t * (3 - 2 * t);\r
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
  gl.linkProgram(program);\r
  gl.deleteShader(vertex);\r
  gl.deleteShader(fragment);\r
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {\r
    gl.deleteProgram(program);\r
    return null;\r
  }\r
  const uniforms = {};\r
  for (const name of UNIFORMS) uniforms[name] = gl.getUniformLocation(program, name);\r
  return { program, uniforms };\r
};\r
\r
const perspective = (fov, aspect, near, far) => {\r
  const f = 1 / Math.tan(fov / 2);\r
  const nf = 1 / (near - far);\r
  return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];\r
};\r
\r
const lookAt = (eye, target) => {\r
  let zx = eye[0] - target[0];\r
  let zy = eye[1] - target[1];\r
  let zz = eye[2] - target[2];\r
  let len = Math.hypot(zx, zy, zz) || 1;\r
  zx /= len;\r
  zy /= len;\r
  zz /= len;\r
  let xx = zz;\r
  let xz = -zx;\r
  len = Math.hypot(xx, xz) || 1;\r
  xx /= len;\r
  xz /= len;\r
  const yx = zy * xz;\r
  const yy = zz * xx - zx * xz;\r
  const yz = -zy * xx;\r
  return [\r
    xx,\r
    yx,\r
    zx,\r
    0,\r
    0,\r
    yy,\r
    zy,\r
    0,\r
    xz,\r
    yz,\r
    zz,\r
    0,\r
    -(xx * eye[0] + xz * eye[2]),\r
    -(yx * eye[0] + yy * eye[1] + yz * eye[2]),\r
    -(zx * eye[0] + zy * eye[1] + zz * eye[2]),\r
    1\r
  ];\r
};\r
\r
const multiply = (a, b) => {\r
  const out = new Array(16);\r
  for (let col = 0; col < 4; col += 1) {\r
    for (let row = 0; row < 4; row += 1) {\r
      out[col * 4 + row] =\r
        a[row] * b[col * 4] + a[4 + row] * b[col * 4 + 1] + a[8 + row] * b[col * 4 + 2] + a[12 + row] * b[col * 4 + 3];\r
    }\r
  }\r
  return out;\r
};\r
\r
const invert = a => {\r
  const b00 = a[0] * a[5] - a[1] * a[4];\r
  const b01 = a[0] * a[6] - a[2] * a[4];\r
  const b02 = a[0] * a[7] - a[3] * a[4];\r
  const b03 = a[1] * a[6] - a[2] * a[5];\r
  const b04 = a[1] * a[7] - a[3] * a[5];\r
  const b05 = a[2] * a[7] - a[3] * a[6];\r
  const b06 = a[8] * a[13] - a[9] * a[12];\r
  const b07 = a[8] * a[14] - a[10] * a[12];\r
  const b08 = a[8] * a[15] - a[11] * a[12];\r
  const b09 = a[9] * a[14] - a[10] * a[13];\r
  const b10 = a[9] * a[15] - a[11] * a[13];\r
  const b11 = a[10] * a[15] - a[11] * a[14];\r
  const det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;\r
  const k = det ? 1 / det : 0;\r
  return [\r
    (a[5] * b11 - a[6] * b10 + a[7] * b09) * k,\r
    (a[2] * b10 - a[1] * b11 - a[3] * b09) * k,\r
    (a[13] * b05 - a[14] * b04 + a[15] * b03) * k,\r
    (a[10] * b04 - a[9] * b05 - a[11] * b03) * k,\r
    (a[6] * b08 - a[4] * b11 - a[7] * b07) * k,\r
    (a[0] * b11 - a[2] * b08 + a[3] * b07) * k,\r
    (a[14] * b02 - a[12] * b05 - a[15] * b01) * k,\r
    (a[8] * b05 - a[10] * b02 + a[11] * b01) * k,\r
    (a[4] * b10 - a[5] * b08 + a[7] * b06) * k,\r
    (a[1] * b08 - a[0] * b10 - a[3] * b06) * k,\r
    (a[12] * b04 - a[13] * b02 + a[15] * b00) * k,\r
    (a[9] * b02 - a[8] * b04 - a[11] * b00) * k,\r
    (a[5] * b07 - a[4] * b09 - a[6] * b06) * k,\r
    (a[0] * b09 - a[1] * b07 + a[2] * b06) * k,\r
    (a[13] * b01 - a[12] * b03 - a[14] * b00) * k,\r
    (a[8] * b03 - a[9] * b01 + a[10] * b00) * k\r
  ];\r
};\r
\r
const AcidSquares = ({\r
  color = '#120f17',\r
  accentColor = '#ff4fb8',\r
  secondaryColor = '#3b6bff',\r
  tileSize = 1,\r
  gap = 0.12,\r
  roundness = 0.25,\r
  softness = 0.5,\r
  bulge = 0.3,\r
  rotation = 35,\r
  gloss = 0.6,\r
  waves = 1,\r
  waveScale = 1,\r
  speed = 0.6,\r
  shape = 'square',\r
  pulse = 1,\r
  pulseSpeed = 0.45,\r
  pulseSpacing = 1,\r
  pulseWidth = 1,\r
  pulseOrigin = 'center',\r
  brightness = 1,\r
  lighting = 'split',\r
  tilt = 0.7,\r
  zoom = 1,\r
  depth = 10,\r
  grain = 0.12,\r
  fade = 0,\r
  opacity = 1,\r
  intro = true,\r
  mouseInteraction = true,\r
  hoverEffect = 'press',\r
  mouseStrength = 1,\r
  mouseRadius = 0.35,\r
  pulseOnClick = true,\r
  detail = 'medium',\r
  lightMode = false,\r
  paused = false,\r
  dpr,\r
  ...rest\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settings = {\r
    color: String(color),\r
    accentColor: String(accentColor),\r
    secondaryColor: String(secondaryColor),\r
    tileSize: clamp(tileSize, 0.2, 5),\r
    gap: clamp(gap, 0, 0.6),\r
    roundness: clamp(roundness, 0, 1),\r
    softness: clamp(softness, 0, 1),\r
    bulge: clamp(bulge, 0, 1.5),\r
    rotation: rotation * DEG,\r
    gloss: clamp(gloss, 0, 1),\r
    waves: Math.max(0, waves),\r
    waveScale: clamp(waveScale, 0.1, 5),\r
    speed: Math.max(0, speed),\r
    square: shape === 'round' ? 0 : 1,\r
    pulse: Math.max(0, pulse),\r
    pulseSpeed: Math.max(0, pulseSpeed),\r
    pulseSpacing: clamp(pulseSpacing, 0.2, 6),\r
    pulseWidth: clamp(pulseWidth, 0.1, 5),\r
    randomOrigin: pulseOrigin === 'random',\r
    brightness: Math.max(0, brightness),\r
    lights: LIGHTING[lighting] || LIGHTING.split,\r
    tilt: clamp(tilt, 0, 1),\r
    zoom: clamp(zoom, 0.3, 4),\r
    depth: clamp(depth, 2, 40),\r
    grain: Math.max(0, grain),\r
    fade: clamp(fade, 0, 1),\r
    opacity: clamp(opacity, 0, 1),\r
    intro,\r
    mouseInteraction,\r
    hover: HOVER_EFFECTS[hoverEffect] ?? 1,\r
    mouseStrength: Math.max(0, mouseStrength),\r
    mouseRadius: clamp(mouseRadius, 0.02, 2),\r
    pulseOnClick,\r
    mesh: MESH[detail] || MESH.medium,\r
    lightMode,\r
    paused,\r
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
      antialias: true,\r
      depth: true,\r
      stencil: false\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const surface = link(gl, VERTEX, FRAGMENT);\r
    if (!surface) return undefined;\r
\r
    const vao = gl.createVertexArray();\r
    const gridBuffer = gl.createBuffer();\r
    const indexBuffer = gl.createBuffer();\r
    let meshSize = 0;\r
    let indexCount = 0;\r
    const buildMesh = size => {\r
      if (size === meshSize) return;\r
      meshSize = size;\r
      const points = new Float32Array((size + 1) * (size + 1) * 2);\r
      let o = 0;\r
      for (let j = 0; j <= size; j += 1) {\r
        for (let i = 0; i <= size; i += 1) {\r
          points[o] = i / size;\r
          points[o + 1] = j / size;\r
          o += 2;\r
        }\r
      }\r
      const indices = new Uint32Array(size * size * 6);\r
      o = 0;\r
      for (let j = 0; j < size; j += 1) {\r
        for (let i = 0; i < size; i += 1) {\r
          const a = j * (size + 1) + i;\r
          const b = a + 1;\r
          const c = a + size + 1;\r
          const d = c + 1;\r
          indices[o] = a;\r
          indices[o + 1] = c;\r
          indices[o + 2] = b;\r
          indices[o + 3] = b;\r
          indices[o + 4] = c;\r
          indices[o + 5] = d;\r
          o += 6;\r
        }\r
      }\r
      indexCount = indices.length;\r
      gl.bindVertexArray(vao);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, gridBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);\r
      gl.enableVertexAttribArray(0);\r
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);\r
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const probe = document.createElement('canvas');\r
    probe.width = 1;\r
    probe.height = 1;\r
    const probeContext = probe.getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const state = {\r
      clock: 0,\r
      swell: 0,\r
      lights: 0,\r
      frame: 0,\r
      nextRipple: 1.2,\r
      ripples: [],\r
      intro: settingsRef.current.intro && !reduce ? 0 : INTRO_SECONDS,\r
      width: 1,\r
      height: 1,\r
      colorKey: '',\r
      color: [0.07, 0.06, 0.09],\r
      accent: [1, 0.31, 0.72],\r
      second: [0.23, 0.42, 1],\r
      pointer: { x: 0, y: 0, inside: false },\r
      hover: { x: 0, z: 0, vx: 0, vz: 0, presence: 0, placed: false },\r
      look: { x: 0, y: 0, vx: 0, vy: 0 },\r
      seed: 1,\r
      camera: null\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let alive = true;\r
\r
    const toRgb = (value, fallback) => {\r
      if (!probeContext || !value) return fallback;\r
      const css = /^[0-9a-f]{3,8}$/i.test(value) ? \`#\${value}\` : value;\r
      probeContext.clearRect(0, 0, 1, 1);\r
      probeContext.fillStyle = '#000000';\r
      probeContext.fillStyle = css;\r
      probeContext.fillRect(0, 0, 1, 1);\r
      const [r, g, b] = probeContext.getImageData(0, 0, 1, 1).data;\r
      return [r / 255, g / 255, b / 255];\r
    };\r
\r
    const resolveColors = s => {\r
      const key = \`\${s.color}|\${s.accentColor}|\${s.secondaryColor}\`;\r
      if (key === state.colorKey) return;\r
      state.colorKey = key;\r
      state.color = toRgb(s.color, [0.07, 0.06, 0.09]);\r
      state.accent = toRgb(s.accentColor, [1, 0.31, 0.72]);\r
      state.second = toRgb(s.secondaryColor, [0.23, 0.42, 1]);\r
    };\r
\r
    const random = () => {\r
      state.seed = (state.seed * 16807) % 2147483647;\r
      return (state.seed - 1) / 2147483646;\r
    };\r
\r
    const cameraFor = s => {\r
      const aspect = state.width / Math.max(state.height, 1);\r
      const distance = 8 / s.zoom;\r
      const yaw = state.look.x * 0.16;\r
      const pitch = 1.5 - s.tilt * 1.26 + state.look.y * 0.05;\r
      const target = [ORIGIN[0], 0, ORIGIN[1]];\r
      const eye = [\r
        target[0] + Math.sin(yaw) * Math.cos(pitch) * distance,\r
        target[1] + Math.sin(pitch) * distance,\r
        target[2] + Math.cos(yaw) * Math.cos(pitch) * distance\r
      ];\r
      const projection = perspective(0.8, aspect, 0.1, 400);\r
      const view = lookAt(eye, target);\r
      const viewProj = multiply(projection, view);\r
      return { eye, target, viewProj, inverse: invert(viewProj), distance };\r
    };\r
\r
    const rippleData = new Float32Array(MAX_RIPPLES * 4);\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      buildMesh(s.mesh);\r
      resolveColors(s);\r
      const camera = cameraFor(s);\r
      state.camera = camera;\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clearDepth(1);\r
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);\r
      gl.enable(gl.DEPTH_TEST);\r
      gl.depthFunc(gl.LEQUAL);\r
      gl.useProgram(surface.program);\r
      const u = surface.uniforms;\r
      rippleData.fill(0);\r
      state.ripples.forEach((ripple, index) => {\r
        rippleData[index * 4] = ripple.x;\r
        rippleData[index * 4 + 1] = ripple.z;\r
        rippleData[index * 4 + 2] = ripple.start;\r
        rippleData[index * 4 + 3] = ripple.strength;\r
      });\r
      const introAge = state.intro;\r
      const revealing = introAge < INTRO_SECONDS;\r
      const revealRadius = glide(introAge / REVEAL_SECONDS) * REVEAL_REACH;\r
      const settle = ease(introAge / INTRO_SECONDS);\r
      gl.uniform4fv(u.uRipples, rippleData);\r
      gl.uniform4f(u.uWave, 0.55 * s.pulse, 3 * Math.max(s.pulseSpeed, 0.05) + 1.2, 1.6 * s.pulseWidth, 46);\r
      gl.uniform1f(u.uSquare, s.square);\r
      gl.uniform1f(u.uClock, state.clock);\r
      gl.uniform4f(u.uSwell, 1.3 * s.waves * (0.25 + 0.75 * settle), 1.9 / s.waveScale, 0, state.swell);\r
      gl.uniform4f(\r
        u.uHover,\r
        state.hover.x,\r
        state.hover.z,\r
        (3 * s.mouseRadius) / 0.35,\r
        0.7 * state.hover.presence * s.mouseStrength * s.hover\r
      );\r
      gl.uniform4f(\r
        u.uIntro,\r
        ORIGIN[0],\r
        ORIGIN[1],\r
        revealRadius,\r
        revealing ? 0.9 * (1 - smoothstep(0.55, 1, introAge / INTRO_SECONDS)) : 0\r
      );\r
      gl.uniformMatrix4fv(u.uViewProj, false, camera.viewProj);\r
      gl.uniform4f(u.uArea, AREA[0] + ORIGIN[0], AREA[1] + ORIGIN[1], AREA[2], AREA[3]);\r
      gl.uniform3f(u.uEye, camera.eye[0], camera.eye[1], camera.eye[2]);\r
      gl.uniform3f(u.uColor, state.color[0], state.color[1], state.color[2]);\r
      gl.uniform3f(u.uAccent, state.accent[0], state.accent[1], state.accent[2]);\r
      gl.uniform3f(u.uSecond, state.second[0], state.second[1], state.second[2]);\r
      const orbit = state.lights;\r
      const reach = camera.distance / 8;\r
      const lightLevel = 0.35 + 0.65 * settle;\r
      const [first, second] = s.lights;\r
      gl.uniform3f(\r
        u.uLightA,\r
        camera.target[0] + (first[0] + Math.sin(orbit * 0.7) * first[3]) * reach,\r
        first[1] * reach * lightLevel + 0.6,\r
        camera.target[2] + (first[2] + Math.cos(orbit * 0.5) * first[4]) * reach\r
      );\r
      gl.uniform3f(\r
        u.uLightB,\r
        camera.target[0] + (second[0] + Math.cos(orbit * 0.6) * second[3]) * reach,\r
        second[1] * reach * lightLevel + 0.6,\r
        camera.target[2] + (second[2] + Math.sin(orbit * 0.45) * second[4]) * reach\r
      );\r
      gl.uniform1f(u.uTile, 1.2 * s.tileSize);\r
      gl.uniform1f(u.uAngle, s.rotation);\r
      gl.uniform1f(u.uGap, s.gap);\r
      gl.uniform1f(u.uRound, s.roundness);\r
      gl.uniform1f(u.uSoftness, s.softness);\r
      gl.uniform1f(u.uBulge, s.bulge);\r
      gl.uniform1f(u.uGloss, s.gloss);\r
      const far = Math.min(s.depth * 3.2 * reach, AREA[3] * 0.62);\r
      gl.uniform2f(u.uRange, far * 0.5, far);\r
      gl.uniform1f(u.uBrightness, s.brightness);\r
      const pixelRatio = canvas.height / Math.max(state.height, 1);\r
      gl.uniform1f(u.uGrain, s.grain);\r
      gl.uniform1f(u.uGrainScale, Math.max(1, pixelRatio));\r
      gl.uniform1f(u.uLightMode, s.lightMode ? 1 : 0);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.uniform4f(u.uReveal, ORIGIN[0], ORIGIN[1], revealRadius, revealing ? 0 : 1);\r
      gl.uniform2f(u.uView, canvas.width, canvas.height);\r
      gl.uniform1f(u.uFade, s.fade);\r
      gl.uniform1f(u.uFrame, state.frame % 977);\r
      gl.bindVertexArray(vao);\r
      gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_INT, 0);\r
      gl.bindVertexArray(null);\r
      gl.disable(gl.DEPTH_TEST);\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const baseDpr = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      const longest = Math.max(width, height) * baseDpr;\r
      const ratio = longest > MAX_RENDER_DIM ? (baseDpr * MAX_RENDER_DIM) / longest : baseDpr;\r
      const pixelWidth = Math.max(1, Math.round(width * ratio));\r
      const pixelHeight = Math.max(1, Math.round(height * ratio));\r
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {\r
        canvas.width = pixelWidth;\r
        canvas.height = pixelHeight;\r
      }\r
      state.width = width;\r
      state.height = height;\r
      render();\r
    };\r
\r
    const groundPoint = (px, py) => {\r
      const camera = state.camera;\r
      if (!camera) return null;\r
      const nx = (px / state.width) * 2 - 1;\r
      const ny = 1 - (py / state.height) * 2;\r
      const m = camera.inverse;\r
      const fx = m[0] * nx + m[4] * ny + m[8] + m[12];\r
      const fy = m[1] * nx + m[5] * ny + m[9] + m[13];\r
      const fz = m[2] * nx + m[6] * ny + m[10] + m[14];\r
      const fw = m[3] * nx + m[7] * ny + m[11] + m[15];\r
      const dx = fx / fw - camera.eye[0];\r
      const dy = fy / fw - camera.eye[1];\r
      const dz = fz / fw - camera.eye[2];\r
      if (dy >= -1e-4) return null;\r
      const t = -camera.eye[1] / dy;\r
      return { x: camera.eye[0] + dx * t, z: camera.eye[2] + dz * t };\r
    };\r
\r
    const spawn = (x, z, strength) => {\r
      state.ripples.push({ x, z, start: state.clock, strength });\r
      while (state.ripples.length > MAX_RIPPLES) state.ripples.shift();\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!alive || !visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const moving = !s.paused && !reduce;\r
      if (moving) {\r
        state.frame += 1;\r
        state.clock += dt;\r
        state.intro += dt;\r
        state.swell += dt * s.speed;\r
        state.lights += dt * s.speed * 0.6;\r
        const travel = 3 * Math.max(s.pulseSpeed, 0.05) + 1.2;\r
        const interval = (10 * s.pulseSpacing) / travel;\r
        if (s.pulse > 0 && state.clock >= state.nextRipple) {\r
          if (s.randomOrigin) {\r
            const spot = groundPoint((0.15 + random() * 0.7) * state.width, (0.25 + random() * 0.6) * state.height);\r
            if (spot) spawn(spot.x, spot.z, 1);\r
          } else {\r
            spawn(ORIGIN[0], ORIGIN[1], 1);\r
          }\r
          state.nextRipple = state.clock + interval * (s.randomOrigin ? 0.6 : 1);\r
        }\r
        const lifetime = 46 / travel + 1;\r
        state.ripples = state.ripples.filter(ripple => state.clock - ripple.start < lifetime);\r
      } else if (state.intro < INTRO_SECONDS) {\r
        state.intro = INTRO_SECONDS;\r
      }\r
\r
      const { pointer, hover, look } = state;\r
      const active = s.mouseInteraction && pointer.inside && !reduce;\r
      const spot = active && s.hover !== 0 ? groundPoint(pointer.x, pointer.y) : null;\r
      if (spot) {\r
        if (!hover.placed) {\r
          hover.x = spot.x;\r
          hover.z = spot.z;\r
          hover.vx = 0;\r
          hover.vz = 0;\r
          hover.placed = true;\r
        }\r
        hover.vx += (90 * (spot.x - hover.x) - 19 * hover.vx) * dt;\r
        hover.vz += (90 * (spot.z - hover.z) - 19 * hover.vz) * dt;\r
        hover.x += hover.vx * dt;\r
        hover.z += hover.vz * dt;\r
      }\r
      const goal = spot ? 1 : 0;\r
      hover.presence += (goal - hover.presence) * (1 - Math.exp(-dt / (goal > hover.presence ? 0.35 : 0.6)));\r
      if (!spot && hover.presence < 0.001) hover.placed = false;\r
      const lookX = active ? (pointer.x / state.width - 0.5) * 0.5 : 0;\r
      const lookY = active ? (0.5 - pointer.y / state.height) * 0.5 : 0;\r
      look.vx += (30 * (lookX - look.x) - 11 * look.vx) * dt;\r
      look.vy += (30 * (lookY - look.y) - 11 * look.vy) * dt;\r
      look.x += look.vx * dt;\r
      look.y += look.vy * dt;\r
\r
      render();\r
      const settling =\r
        Math.abs(goal - hover.presence) > 0.002 ||\r
        Math.hypot(hover.vx, hover.vz) > 0.01 ||\r
        Math.abs(lookX - look.x) > 0.0002 ||\r
        Math.abs(lookY - look.y) > 0.0002;\r
      if (moving || settling) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!raf && alive && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const onPointerMove = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      state.pointer.x = x;\r
      state.pointer.y = y;\r
      state.pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      if (!s.mouseInteraction || !s.pulseOnClick || event.button !== 0 || reduce) return;\r
      if (\r
        event.target instanceof Element &&\r
        event.target.closest('a, button, input, textarea, select, label, [role="button"]')\r
      )\r
        return;\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;\r
      const spot = groundPoint(x, y);\r
      if (spot) spawn(spot.x, spot.z, 1.15);\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      state.pointer.inside = false;\r
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
    window.addEventListener('pointerdown', onPointerDown);\r
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
    wake();\r
\r
    wakeRef.current = () => {\r
      if (!raf) render();\r
      wake();\r
    };\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteBuffer(gridBuffer);\r
      gl.deleteBuffer(indexBuffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(surface.program);\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  const { className = '', ...attributes } = rest;\r
\r
  return (\r
    <div\r
      ref={containerRef}\r
      className={['relative h-full w-full overflow-hidden', className].filter(Boolean).join(' ')}\r
      {...attributes}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default AcidSquares;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, type HTMLAttributes } from 'react';\r
\r
import './AcidSquares.css';\r
\r
export type AcidSquaresShape = 'square' | 'round';\r
\r
export type AcidSquaresDetail = 'low' | 'medium' | 'high';\r
\r
export type AcidSquaresLighting = 'split' | 'backlit' | 'overhead';\r
\r
export type AcidSquaresHoverEffect = 'press' | 'lift' | 'none';\r
\r
export type AcidSquaresPulseOrigin = 'center' | 'random';\r
\r
export interface AcidSquaresProps extends HTMLAttributes<HTMLDivElement> {\r
  color?: string;\r
  accentColor?: string;\r
  secondaryColor?: string;\r
  tileSize?: number;\r
  gap?: number;\r
  roundness?: number;\r
  softness?: number;\r
  bulge?: number;\r
  rotation?: number;\r
  gloss?: number;\r
  waves?: number;\r
  waveScale?: number;\r
  speed?: number;\r
  shape?: AcidSquaresShape;\r
  pulse?: number;\r
  pulseSpeed?: number;\r
  pulseSpacing?: number;\r
  pulseWidth?: number;\r
  pulseOrigin?: AcidSquaresPulseOrigin;\r
  brightness?: number;\r
  lighting?: AcidSquaresLighting;\r
  tilt?: number;\r
  zoom?: number;\r
  depth?: number;\r
  grain?: number;\r
  fade?: number;\r
  opacity?: number;\r
  intro?: boolean;\r
  mouseInteraction?: boolean;\r
  hoverEffect?: AcidSquaresHoverEffect;\r
  mouseStrength?: number;\r
  mouseRadius?: number;\r
  pulseOnClick?: boolean;\r
  detail?: AcidSquaresDetail;\r
  lightMode?: boolean;\r
  paused?: boolean;\r
  dpr?: number;\r
}\r
\r
type Light = [number, number, number, number, number];\r
\r
type Settings = {\r
  color: string;\r
  accentColor: string;\r
  secondaryColor: string;\r
  tileSize: number;\r
  gap: number;\r
  roundness: number;\r
  softness: number;\r
  bulge: number;\r
  rotation: number;\r
  gloss: number;\r
  waves: number;\r
  waveScale: number;\r
  speed: number;\r
  square: number;\r
  pulse: number;\r
  pulseSpeed: number;\r
  pulseSpacing: number;\r
  pulseWidth: number;\r
  randomOrigin: boolean;\r
  brightness: number;\r
  lights: Light[];\r
  tilt: number;\r
  zoom: number;\r
  depth: number;\r
  grain: number;\r
  fade: number;\r
  opacity: number;\r
  intro: boolean;\r
  mouseInteraction: boolean;\r
  hover: number;\r
  mouseStrength: number;\r
  mouseRadius: number;\r
  pulseOnClick: boolean;\r
  mesh: number;\r
  lightMode: boolean;\r
  paused: boolean;\r
  dpr?: number;\r
};\r
\r
type Surface = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };\r
\r
type Ripple = { x: number; z: number; start: number; strength: number };\r
\r
type Camera = { eye: number[]; target: number[]; viewProj: number[]; inverse: number[]; distance: number };\r
\r
const MAX_RIPPLES = 8;\r
const MESH: Record<AcidSquaresDetail, number> = { low: 150, medium: 210, high: 280 };\r
const AREA = [-42, -76, 84, 94];\r
const MAX_RENDER_DIM = 2400;\r
const INTRO_SECONDS = 3;\r
const REVEAL_SECONDS = 2.6;\r
const REVEAL_REACH = 19;\r
const ORIGIN = [0, -3];\r
const HOVER_EFFECTS: Record<AcidSquaresHoverEffect, number> = { press: 1, lift: -1, none: 0 };\r
const LIGHTING: Record<AcidSquaresLighting, Light[]> = {\r
  split: [\r
    [7, 4.2, -4, 4, 4],\r
    [-8, 3.6, 3, 4, 4]\r
  ],\r
  backlit: [\r
    [6, 1.6, -15, 5, 3],\r
    [-7, 1.4, -13, 5, 3]\r
  ],\r
  overhead: [\r
    [3, 7.5, -4, 3, 3],\r
    [-3, 7, -1, 3, 3]\r
  ]\r
};\r
const DEG = Math.PI / 180;\r
\r
const FIELD = \`\r
uniform vec4 uRipples[\${MAX_RIPPLES}];\r
uniform vec4 uWave;\r
uniform float uSquare;\r
uniform float uClock;\r
uniform vec4 uSwell;\r
uniform vec4 uHover;\r
uniform vec4 uIntro;\r
\r
float reachOf(vec2 delta, out vec2 grad) {\r
  vec2 a = abs(delta);\r
  vec2 dir = vec2(delta.x < 0.0 ? -1.0 : 1.0, delta.y < 0.0 ? -1.0 : 1.0);\r
  float round_ = length(delta);\r
  vec2 roundGrad = delta / max(round_, 1e-4);\r
  float m = max(max(a.x, a.y), 1e-4);\r
  vec2 k = a / m;\r
  vec2 k3 = k * k * k;\r
  float sum = dot(k3, k);\r
  float root = sqrt(sqrt(sum));\r
  float square = m * root;\r
  vec2 squareGrad = dir * k3 / (root * root * root);\r
  float d = mix(round_, square, uSquare);\r
  vec2 g = mix(roundGrad, squareGrad, uSquare);\r
  float soft = sqrt(d * d + 0.36);\r
  grad = g * d / soft;\r
  return soft - 0.6;\r
}\r
\r
vec3 field(vec2 p) {\r
  float t = uSwell.w;\r
  float f = uSwell.y;\r
  vec2 k1 = vec2(0.19, 0.11) * f;\r
  vec2 k2 = vec2(-0.09, 0.23) * f;\r
  vec2 k3 = vec2(0.29, -0.17) * f;\r
  float a1 = dot(p, k1) + t * 0.55;\r
  float a2 = dot(p, k2) - t * 0.42 + 1.3;\r
  float a3 = dot(p, k3) + t * 0.74 + 2.1;\r
  float h = 0.55 * sin(a1) + 0.4 * sin(a2) + 0.22 * sin(a3);\r
  vec2 g = 0.55 * cos(a1) * k1 + 0.4 * cos(a2) * k2 + 0.22 * cos(a3) * k3;\r
  h *= uSwell.x;\r
  g *= uSwell.x;\r
  vec2 dg;\r
  for (int i = 0; i < \${MAX_RIPPLES}; i++) {\r
    vec4 r = uRipples[i];\r
    if (r.w <= 0.0) continue;\r
    float age = uClock - r.z;\r
    if (age <= 0.0) continue;\r
    float d = reachOf(p - r.xy, dg);\r
    float radius = age * uWave.y;\r
    float x = (d - radius) / uWave.z;\r
    float life = clamp(1.0 - radius / uWave.w, 0.0, 1.0);\r
    float strength = r.w * uWave.x * life * life * smoothstep(0.0, 1.5, radius);\r
    float bump = exp(-x * x);\r
    h += bump * strength;\r
    g += -2.0 * x * bump * strength / uWave.z * dg;\r
  }\r
  if (uIntro.w > 0.0) {\r
    float d = reachOf(p - uIntro.xy, dg);\r
    float x = (d - uIntro.z) / 2.2;\r
    float bump = exp(-x * x) * uIntro.w;\r
    h += bump;\r
    g += -2.0 * x * bump / 2.2 * dg;\r
  }\r
  vec2 hd = p - uHover.xy;\r
  float hr = max(uHover.z, 1e-3);\r
  float hover = exp(-dot(hd, hd) / (hr * hr)) * uHover.w;\r
  h -= hover;\r
  g += 2.0 * hd / (hr * hr) * hover;\r
  return vec3(h, g);\r
}\r
\`;\r
\r
const VERTEX = \`#version 300 es\r
precision highp float;\r
\${FIELD}\r
layout(location = 0) in vec2 aGrid;\r
uniform mat4 uViewProj;\r
uniform vec4 uArea;\r
out vec2 vGround;\r
out vec3 vWorld;\r
void main() {\r
  vec2 ground = uArea.xy + aGrid * uArea.zw;\r
  vec3 f = field(ground);\r
  vWorld = vec3(ground.x, f.x, ground.y);\r
  vGround = ground;\r
  gl_Position = uViewProj * vec4(vWorld, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
\${FIELD}\r
uniform vec3 uEye;\r
uniform vec3 uColor;\r
uniform vec3 uAccent;\r
uniform vec3 uSecond;\r
uniform vec3 uLightA;\r
uniform vec3 uLightB;\r
uniform float uTile;\r
uniform float uAngle;\r
uniform float uGap;\r
uniform float uRound;\r
uniform float uSoftness;\r
uniform float uBulge;\r
uniform float uGloss;\r
uniform vec2 uRange;\r
uniform float uBrightness;\r
uniform float uGrain;\r
uniform float uGrainScale;\r
uniform float uLightMode;\r
uniform float uOpacity;\r
uniform vec4 uReveal;\r
uniform vec2 uView;\r
uniform float uFade;\r
uniform float uFrame;\r
in vec2 vGround;\r
in vec3 vWorld;\r
out vec4 outColor;\r
\r
float smoother(float x) {\r
  x = clamp(x, 0.0, 1.0);\r
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);\r
}\r
\r
float hash(vec3 p) {\r
  p = fract(p * 0.1031);\r
  p += dot(p, p.zyx + 31.32);\r
  return fract((p.x + p.y) * p.z);\r
}\r
\r
void main() {\r
  vec3 f = field(vGround);\r
  vec3 n0 = normalize(vec3(-f.y, 1.0, -f.z));\r
  vec3 tx = normalize(vec3(1.0, f.y, 0.0));\r
  vec3 tz = normalize(cross(tx, n0));\r
  tx = normalize(cross(n0, tz));\r
\r
  float c = cos(uAngle);\r
  float s = sin(uAngle);\r
  mat2 toTile = mat2(c, -s, s, c);\r
  vec2 q = toTile * vGround / uTile;\r
  vec2 cell = floor(q);\r
  vec2 local = q - cell - 0.5;\r
  float footprint = max(length(fwidth(q)), 1e-5);\r
\r
  float on = 1.0;\r
  if (uReveal.w < 1.0) {\r
    vec2 centre = transpose(toTile) * (cell + 0.5) * uTile;\r
    vec2 dg;\r
    float d = reachOf(centre - uReveal.xy, dg);\r
    float delay = hash(vec3(cell, 7.0)) * 1.1;\r
    on = max(smoother((uReveal.z - d - delay) / 1.6), uReveal.w);\r
  }\r
\r
  float half_ = (0.5 - uGap * 0.5) * mix(0.62, 1.0, on);\r
  float radius = min(uRound * half_, half_);\r
  vec2 dd = abs(local) - (half_ - radius);\r
  float d = length(max(dd, 0.0)) + min(max(dd.x, dd.y), 0.0) - radius;\r
  vec2 outward = dd.x > 0.0 || dd.y > 0.0 ? normalize(max(dd, 0.0) * sign(local)) : (dd.x > dd.y ? vec2(sign(local.x), 0.0) : vec2(0.0, sign(local.y)));\r
\r
  float bevelWidth = max(mix(0.04, 0.42, uSoftness) * half_, footprint * 1.5);\r
  float edge = clamp((d + bevelWidth) / bevelWidth, 0.0, 1.0);\r
  float dome = uBulge * 0.5 * length(local) / max(half_, 1e-3);\r
  float theta = edge * edge * mix(0.7, 1.35, uSoftness) + dome;\r
  vec2 outwardGround = transpose(toTile) * outward;\r
  vec2 domeGround = transpose(toTile) * (local / max(length(local), 1e-4));\r
  vec3 bend = normalize(tx * mix(domeGround.x, outwardGround.x, edge) + tz * mix(domeGround.y, outwardGround.y, edge));\r
  float crowd = smoothstep(0.08, 0.3, footprint);\r
  theta *= 1.0 - crowd;\r
  vec3 n = normalize(n0 * cos(theta) + bend * sin(theta));\r
\r
  float inside = 1.0 - smoothstep(-footprint * 0.75, footprint * 0.75, d);\r
  float area = (2.0 * half_) * (2.0 * half_) - (4.0 - 3.14159) * radius * radius;\r
  inside = mix(inside, area, crowd) * on;\r
\r
  vec3 toEye = uEye - vWorld;\r
  float dist = length(toEye);\r
  vec3 v = toEye / dist;\r
  vec3 la = uLightA - vWorld;\r
  vec3 lb = uLightB - vWorld;\r
  float da = length(la);\r
  float db = length(lb);\r
  la /= da;\r
  lb /= db;\r
  float fa = 1.0 / (1.0 + da * da * 0.02);\r
  float fb = 1.0 / (1.0 + db * db * 0.02);\r
\r
  float ndv = clamp(dot(n, v), 0.0, 1.0);\r
  float fresnel = 0.04 + 0.96 * pow(1.0 - ndv, 5.0);\r
  vec3 ha = normalize(la + v);\r
  vec3 hb = normalize(lb + v);\r
  float shine = mix(10.0, 90.0, uGloss);\r
  float norm = (shine + 8.0) / 60.0;\r
  float specA = pow(max(dot(n, ha), 0.0), shine) * norm;\r
  float specB = pow(max(dot(n, hb), 0.0), shine) * norm;\r
  float sheenA = pow(max(dot(n, ha), 0.0), 8.0);\r
  float sheenB = pow(max(dot(n, hb), 0.0), 8.0);\r
  float diffA = max(dot(n, la), 0.0);\r
  float diffB = max(dot(n, lb), 0.0);\r
  vec3 r = reflect(-v, n);\r
  float rim = exp((dot(r, normalize(vec3(0.15, 0.55, -1.0))) - 1.0) * 6.0);\r
  float occlusion = mix(1.0, 0.35, edge * edge);\r
  float edgeLight = edge * edge;\r
\r
  vec3 color;\r
  float alpha;\r
  if (uLightMode > 0.5) {\r
    float luma = dot(uColor, vec3(0.299, 0.587, 0.114));\r
    vec3 body = mix(vec3(luma), uColor, 0.5) * 0.96;\r
    vec3 keyDir = normalize(vec3(-0.35, 0.85, 0.45));\r
    float shade = clamp(dot(n, keyDir) * 0.6 + 0.5, 0.0, 1.0);\r
    float wa = clamp(diffA * fa * 9.0, 0.0, 1.0);\r
    float wb = clamp(diffB * fb * 9.0, 0.0, 1.0);\r
    vec3 hue = (uAccent * wa + uSecond * wb) / max(wa + wb, 1e-3);\r
    vec3 lit = body * mix(vec3(1.0), hue, clamp(wa + wb, 0.0, 1.0) * 0.42) * mix(0.7, 1.05, shade);\r
    lit += vec3(1.0) * (specA * fa + specB * fb) * 2.4 * uGloss;\r
    lit *= mix(1.0, 0.8, edgeLight * (1.0 - crowd));\r
    color = lit;\r
    alpha = inside;\r
  } else {\r
    float luma = dot(uColor, vec3(0.299, 0.587, 0.114));\r
    vec3 body = mix(vec3(luma), uColor, 0.35) + vec3(0.02);\r
    vec3 lit = body * 0.25;\r
    lit += body * (uAccent * diffA * fa + uSecond * diffB * fb) * 14.0;\r
    lit += uAccent * (specA * (0.55 + 1.6 * edgeLight) + sheenA * 0.3) * fa * 9.0 * uGloss;\r
    lit += uSecond * (specB * (0.55 + 1.6 * edgeLight) + sheenB * 0.3) * fb * 9.0 * uGloss;\r
    lit += mix(uSecond, vec3(1.0), 0.4) * rim * fresnel * 0.35 * uGloss;\r
    lit *= occlusion;\r
    color = lit * inside;\r
    alpha = inside;\r
  }\r
\r
  float fade = 1.0 - smoother((dist - uRange.x) / max(uRange.y - uRange.x, 1e-3));\r
  alpha *= fade * uOpacity;\r
  color *= uBrightness;\r
  if (uLightMode < 0.5) color = 1.0 - exp(-color * 1.1);\r
\r
  vec2 grainCell = floor(gl_FragCoord.xy / uGrainScale);\r
  float grain = hash(vec3(grainCell, uFrame)) + hash(vec3(grainCell + 17.0, uFrame + 3.0)) - 1.0;\r
  float lum = dot(color, vec3(0.299, 0.587, 0.114));\r
  color += grain * uGrain * (uLightMode > 0.5 ? 0.6 : 0.25 + 0.75 * sqrt(clamp(lum, 0.0, 1.0)));\r
  color = clamp(color, 0.0, 1.0);\r
\r
  vec2 uv = gl_FragCoord.xy / uView;\r
  float edgeFade = max(uFade * 0.5, 1e-4);\r
  float mask = uFade > 0.0 ? smoother(uv.x / edgeFade) * smoother((1.0 - uv.x) / edgeFade) * smoother(uv.y / edgeFade) * smoother((1.0 - uv.y) / edgeFade) : 1.0;\r
  alpha *= mask;\r
  outColor = vec4(color * alpha, alpha);\r
}\`;\r
\r
const UNIFORMS = [\r
  'uRipples',\r
  'uWave',\r
  'uSquare',\r
  'uClock',\r
  'uSwell',\r
  'uHover',\r
  'uIntro',\r
  'uViewProj',\r
  'uArea',\r
  'uEye',\r
  'uColor',\r
  'uAccent',\r
  'uSecond',\r
  'uLightA',\r
  'uLightB',\r
  'uTile',\r
  'uAngle',\r
  'uGap',\r
  'uRound',\r
  'uSoftness',\r
  'uBulge',\r
  'uGloss',\r
  'uRange',\r
  'uBrightness',\r
  'uGrain',\r
  'uGrainScale',\r
  'uLightMode',\r
  'uOpacity',\r
  'uReveal',\r
  'uView',\r
  'uFade',\r
  'uFrame'\r
];\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const ease = (x: number) => {\r
  const t = clamp(x, 0, 1);\r
  return 1 - (1 - t) * (1 - t) * (1 - t);\r
};\r
\r
const glide = (x: number) => {\r
  const t = clamp(x, 0, 1);\r
  return t * t * t * (t * (t * 6 - 15) + 10);\r
};\r
\r
const smoothstep = (a: number, b: number, x: number) => {\r
  const t = clamp((x - a) / (b - a), 0, 1);\r
  return t * t * (3 - 2 * t);\r
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
const link = (gl: WebGL2RenderingContext, vertexSource: string, fragmentSource: string): Surface | null => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);\r
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
  for (const name of UNIFORMS) uniforms[name] = gl.getUniformLocation(program, name);\r
  return { program, uniforms };\r
};\r
\r
const perspective = (fov: number, aspect: number, near: number, far: number) => {\r
  const f = 1 / Math.tan(fov / 2);\r
  const nf = 1 / (near - far);\r
  return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];\r
};\r
\r
const lookAt = (eye: number[], target: number[]) => {\r
  let zx = eye[0] - target[0];\r
  let zy = eye[1] - target[1];\r
  let zz = eye[2] - target[2];\r
  let len = Math.hypot(zx, zy, zz) || 1;\r
  zx /= len;\r
  zy /= len;\r
  zz /= len;\r
  let xx = zz;\r
  let xz = -zx;\r
  len = Math.hypot(xx, xz) || 1;\r
  xx /= len;\r
  xz /= len;\r
  const yx = zy * xz;\r
  const yy = zz * xx - zx * xz;\r
  const yz = -zy * xx;\r
  return [\r
    xx,\r
    yx,\r
    zx,\r
    0,\r
    0,\r
    yy,\r
    zy,\r
    0,\r
    xz,\r
    yz,\r
    zz,\r
    0,\r
    -(xx * eye[0] + xz * eye[2]),\r
    -(yx * eye[0] + yy * eye[1] + yz * eye[2]),\r
    -(zx * eye[0] + zy * eye[1] + zz * eye[2]),\r
    1\r
  ];\r
};\r
\r
const multiply = (a: number[], b: number[]) => {\r
  const out: number[] = new Array(16);\r
  for (let col = 0; col < 4; col += 1) {\r
    for (let row = 0; row < 4; row += 1) {\r
      out[col * 4 + row] =\r
        a[row] * b[col * 4] + a[4 + row] * b[col * 4 + 1] + a[8 + row] * b[col * 4 + 2] + a[12 + row] * b[col * 4 + 3];\r
    }\r
  }\r
  return out;\r
};\r
\r
const invert = (a: number[]) => {\r
  const b00 = a[0] * a[5] - a[1] * a[4];\r
  const b01 = a[0] * a[6] - a[2] * a[4];\r
  const b02 = a[0] * a[7] - a[3] * a[4];\r
  const b03 = a[1] * a[6] - a[2] * a[5];\r
  const b04 = a[1] * a[7] - a[3] * a[5];\r
  const b05 = a[2] * a[7] - a[3] * a[6];\r
  const b06 = a[8] * a[13] - a[9] * a[12];\r
  const b07 = a[8] * a[14] - a[10] * a[12];\r
  const b08 = a[8] * a[15] - a[11] * a[12];\r
  const b09 = a[9] * a[14] - a[10] * a[13];\r
  const b10 = a[9] * a[15] - a[11] * a[13];\r
  const b11 = a[10] * a[15] - a[11] * a[14];\r
  const det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;\r
  const k = det ? 1 / det : 0;\r
  return [\r
    (a[5] * b11 - a[6] * b10 + a[7] * b09) * k,\r
    (a[2] * b10 - a[1] * b11 - a[3] * b09) * k,\r
    (a[13] * b05 - a[14] * b04 + a[15] * b03) * k,\r
    (a[10] * b04 - a[9] * b05 - a[11] * b03) * k,\r
    (a[6] * b08 - a[4] * b11 - a[7] * b07) * k,\r
    (a[0] * b11 - a[2] * b08 + a[3] * b07) * k,\r
    (a[14] * b02 - a[12] * b05 - a[15] * b01) * k,\r
    (a[8] * b05 - a[10] * b02 + a[11] * b01) * k,\r
    (a[4] * b10 - a[5] * b08 + a[7] * b06) * k,\r
    (a[1] * b08 - a[0] * b10 - a[3] * b06) * k,\r
    (a[12] * b04 - a[13] * b02 + a[15] * b00) * k,\r
    (a[9] * b02 - a[8] * b04 - a[11] * b00) * k,\r
    (a[5] * b07 - a[4] * b09 - a[6] * b06) * k,\r
    (a[0] * b09 - a[1] * b07 + a[2] * b06) * k,\r
    (a[13] * b01 - a[12] * b03 - a[14] * b00) * k,\r
    (a[8] * b03 - a[9] * b01 + a[10] * b00) * k\r
  ];\r
};\r
\r
const AcidSquares = ({\r
  color = '#120f17',\r
  accentColor = '#ff4fb8',\r
  secondaryColor = '#3b6bff',\r
  tileSize = 1,\r
  gap = 0.12,\r
  roundness = 0.25,\r
  softness = 0.5,\r
  bulge = 0.3,\r
  rotation = 35,\r
  gloss = 0.6,\r
  waves = 1,\r
  waveScale = 1,\r
  speed = 0.6,\r
  shape = 'square',\r
  pulse = 1,\r
  pulseSpeed = 0.45,\r
  pulseSpacing = 1,\r
  pulseWidth = 1,\r
  pulseOrigin = 'center',\r
  brightness = 1,\r
  lighting = 'split',\r
  tilt = 0.7,\r
  zoom = 1,\r
  depth = 10,\r
  grain = 0.12,\r
  fade = 0,\r
  opacity = 1,\r
  intro = true,\r
  mouseInteraction = true,\r
  hoverEffect = 'press',\r
  mouseStrength = 1,\r
  mouseRadius = 0.35,\r
  pulseOnClick = true,\r
  detail = 'medium',\r
  lightMode = false,\r
  paused = false,\r
  dpr,\r
  ...rest\r
}: AcidSquaresProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings: Settings = {\r
    color: String(color),\r
    accentColor: String(accentColor),\r
    secondaryColor: String(secondaryColor),\r
    tileSize: clamp(tileSize, 0.2, 5),\r
    gap: clamp(gap, 0, 0.6),\r
    roundness: clamp(roundness, 0, 1),\r
    softness: clamp(softness, 0, 1),\r
    bulge: clamp(bulge, 0, 1.5),\r
    rotation: rotation * DEG,\r
    gloss: clamp(gloss, 0, 1),\r
    waves: Math.max(0, waves),\r
    waveScale: clamp(waveScale, 0.1, 5),\r
    speed: Math.max(0, speed),\r
    square: shape === 'round' ? 0 : 1,\r
    pulse: Math.max(0, pulse),\r
    pulseSpeed: Math.max(0, pulseSpeed),\r
    pulseSpacing: clamp(pulseSpacing, 0.2, 6),\r
    pulseWidth: clamp(pulseWidth, 0.1, 5),\r
    randomOrigin: pulseOrigin === 'random',\r
    brightness: Math.max(0, brightness),\r
    lights: LIGHTING[lighting] || LIGHTING.split,\r
    tilt: clamp(tilt, 0, 1),\r
    zoom: clamp(zoom, 0.3, 4),\r
    depth: clamp(depth, 2, 40),\r
    grain: Math.max(0, grain),\r
    fade: clamp(fade, 0, 1),\r
    opacity: clamp(opacity, 0, 1),\r
    intro,\r
    mouseInteraction,\r
    hover: HOVER_EFFECTS[hoverEffect] ?? 1,\r
    mouseStrength: Math.max(0, mouseStrength),\r
    mouseRadius: clamp(mouseRadius, 0.02, 2),\r
    pulseOnClick,\r
    mesh: MESH[detail] || MESH.medium,\r
    lightMode,\r
    paused,\r
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
      antialias: true,\r
      depth: true,\r
      stencil: false\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const surface = link(gl, VERTEX, FRAGMENT);\r
    if (!surface) return undefined;\r
\r
    const vao = gl.createVertexArray();\r
    const gridBuffer = gl.createBuffer();\r
    const indexBuffer = gl.createBuffer();\r
    let meshSize = 0;\r
    let indexCount = 0;\r
    const buildMesh = (size: number) => {\r
      if (size === meshSize) return;\r
      meshSize = size;\r
      const points = new Float32Array((size + 1) * (size + 1) * 2);\r
      let o = 0;\r
      for (let j = 0; j <= size; j += 1) {\r
        for (let i = 0; i <= size; i += 1) {\r
          points[o] = i / size;\r
          points[o + 1] = j / size;\r
          o += 2;\r
        }\r
      }\r
      const indices = new Uint32Array(size * size * 6);\r
      o = 0;\r
      for (let j = 0; j < size; j += 1) {\r
        for (let i = 0; i < size; i += 1) {\r
          const a = j * (size + 1) + i;\r
          const b = a + 1;\r
          const c = a + size + 1;\r
          const d = c + 1;\r
          indices[o] = a;\r
          indices[o + 1] = c;\r
          indices[o + 2] = b;\r
          indices[o + 3] = b;\r
          indices[o + 4] = c;\r
          indices[o + 5] = d;\r
          o += 6;\r
        }\r
      }\r
      indexCount = indices.length;\r
      gl.bindVertexArray(vao);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, gridBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);\r
      gl.enableVertexAttribArray(0);\r
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);\r
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const probe = document.createElement('canvas');\r
    probe.width = 1;\r
    probe.height = 1;\r
    const probeContext = probe.getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const state = {\r
      clock: 0,\r
      swell: 0,\r
      lights: 0,\r
      frame: 0,\r
      nextRipple: 1.2,\r
      ripples: [] as Ripple[],\r
      intro: settingsRef.current.intro && !reduce ? 0 : INTRO_SECONDS,\r
      width: 1,\r
      height: 1,\r
      colorKey: '',\r
      color: [0.07, 0.06, 0.09] as number[],\r
      accent: [1, 0.31, 0.72] as number[],\r
      second: [0.23, 0.42, 1] as number[],\r
      pointer: { x: 0, y: 0, inside: false },\r
      hover: { x: 0, z: 0, vx: 0, vz: 0, presence: 0, placed: false },\r
      look: { x: 0, y: 0, vx: 0, vy: 0 },\r
      seed: 1,\r
      camera: null as Camera | null\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let alive = true;\r
\r
    const toRgb = (value: string, fallback: number[]): number[] => {\r
      if (!probeContext || !value) return fallback;\r
      const css = /^[0-9a-f]{3,8}$/i.test(value) ? \`#\${value}\` : value;\r
      probeContext.clearRect(0, 0, 1, 1);\r
      probeContext.fillStyle = '#000000';\r
      probeContext.fillStyle = css;\r
      probeContext.fillRect(0, 0, 1, 1);\r
      const [r, g, b] = probeContext.getImageData(0, 0, 1, 1).data;\r
      return [r / 255, g / 255, b / 255];\r
    };\r
\r
    const resolveColors = (s: Settings) => {\r
      const key = \`\${s.color}|\${s.accentColor}|\${s.secondaryColor}\`;\r
      if (key === state.colorKey) return;\r
      state.colorKey = key;\r
      state.color = toRgb(s.color, [0.07, 0.06, 0.09]);\r
      state.accent = toRgb(s.accentColor, [1, 0.31, 0.72]);\r
      state.second = toRgb(s.secondaryColor, [0.23, 0.42, 1]);\r
    };\r
\r
    const random = () => {\r
      state.seed = (state.seed * 16807) % 2147483647;\r
      return (state.seed - 1) / 2147483646;\r
    };\r
\r
    const cameraFor = (s: Settings): Camera => {\r
      const aspect = state.width / Math.max(state.height, 1);\r
      const distance = 8 / s.zoom;\r
      const yaw = state.look.x * 0.16;\r
      const pitch = 1.5 - s.tilt * 1.26 + state.look.y * 0.05;\r
      const target = [ORIGIN[0], 0, ORIGIN[1]];\r
      const eye = [\r
        target[0] + Math.sin(yaw) * Math.cos(pitch) * distance,\r
        target[1] + Math.sin(pitch) * distance,\r
        target[2] + Math.cos(yaw) * Math.cos(pitch) * distance\r
      ];\r
      const projection = perspective(0.8, aspect, 0.1, 400);\r
      const view = lookAt(eye, target);\r
      const viewProj = multiply(projection, view);\r
      return { eye, target, viewProj, inverse: invert(viewProj), distance };\r
    };\r
\r
    const rippleData = new Float32Array(MAX_RIPPLES * 4);\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      buildMesh(s.mesh);\r
      resolveColors(s);\r
      const camera = cameraFor(s);\r
      state.camera = camera;\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clearDepth(1);\r
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);\r
      gl.enable(gl.DEPTH_TEST);\r
      gl.depthFunc(gl.LEQUAL);\r
      gl.useProgram(surface.program);\r
      const u = surface.uniforms;\r
      rippleData.fill(0);\r
      state.ripples.forEach((ripple, index) => {\r
        rippleData[index * 4] = ripple.x;\r
        rippleData[index * 4 + 1] = ripple.z;\r
        rippleData[index * 4 + 2] = ripple.start;\r
        rippleData[index * 4 + 3] = ripple.strength;\r
      });\r
      const introAge = state.intro;\r
      const revealing = introAge < INTRO_SECONDS;\r
      const revealRadius = glide(introAge / REVEAL_SECONDS) * REVEAL_REACH;\r
      const settle = ease(introAge / INTRO_SECONDS);\r
      gl.uniform4fv(u.uRipples, rippleData);\r
      gl.uniform4f(u.uWave, 0.55 * s.pulse, 3 * Math.max(s.pulseSpeed, 0.05) + 1.2, 1.6 * s.pulseWidth, 46);\r
      gl.uniform1f(u.uSquare, s.square);\r
      gl.uniform1f(u.uClock, state.clock);\r
      gl.uniform4f(u.uSwell, 1.3 * s.waves * (0.25 + 0.75 * settle), 1.9 / s.waveScale, 0, state.swell);\r
      gl.uniform4f(\r
        u.uHover,\r
        state.hover.x,\r
        state.hover.z,\r
        (3 * s.mouseRadius) / 0.35,\r
        0.7 * state.hover.presence * s.mouseStrength * s.hover\r
      );\r
      gl.uniform4f(\r
        u.uIntro,\r
        ORIGIN[0],\r
        ORIGIN[1],\r
        revealRadius,\r
        revealing ? 0.9 * (1 - smoothstep(0.55, 1, introAge / INTRO_SECONDS)) : 0\r
      );\r
      gl.uniformMatrix4fv(u.uViewProj, false, camera.viewProj);\r
      gl.uniform4f(u.uArea, AREA[0] + ORIGIN[0], AREA[1] + ORIGIN[1], AREA[2], AREA[3]);\r
      gl.uniform3f(u.uEye, camera.eye[0], camera.eye[1], camera.eye[2]);\r
      gl.uniform3f(u.uColor, state.color[0], state.color[1], state.color[2]);\r
      gl.uniform3f(u.uAccent, state.accent[0], state.accent[1], state.accent[2]);\r
      gl.uniform3f(u.uSecond, state.second[0], state.second[1], state.second[2]);\r
      const orbit = state.lights;\r
      const reach = camera.distance / 8;\r
      const lightLevel = 0.35 + 0.65 * settle;\r
      const [first, second] = s.lights;\r
      gl.uniform3f(\r
        u.uLightA,\r
        camera.target[0] + (first[0] + Math.sin(orbit * 0.7) * first[3]) * reach,\r
        first[1] * reach * lightLevel + 0.6,\r
        camera.target[2] + (first[2] + Math.cos(orbit * 0.5) * first[4]) * reach\r
      );\r
      gl.uniform3f(\r
        u.uLightB,\r
        camera.target[0] + (second[0] + Math.cos(orbit * 0.6) * second[3]) * reach,\r
        second[1] * reach * lightLevel + 0.6,\r
        camera.target[2] + (second[2] + Math.sin(orbit * 0.45) * second[4]) * reach\r
      );\r
      gl.uniform1f(u.uTile, 1.2 * s.tileSize);\r
      gl.uniform1f(u.uAngle, s.rotation);\r
      gl.uniform1f(u.uGap, s.gap);\r
      gl.uniform1f(u.uRound, s.roundness);\r
      gl.uniform1f(u.uSoftness, s.softness);\r
      gl.uniform1f(u.uBulge, s.bulge);\r
      gl.uniform1f(u.uGloss, s.gloss);\r
      const far = Math.min(s.depth * 3.2 * reach, AREA[3] * 0.62);\r
      gl.uniform2f(u.uRange, far * 0.5, far);\r
      gl.uniform1f(u.uBrightness, s.brightness);\r
      const pixelRatio = canvas.height / Math.max(state.height, 1);\r
      gl.uniform1f(u.uGrain, s.grain);\r
      gl.uniform1f(u.uGrainScale, Math.max(1, pixelRatio));\r
      gl.uniform1f(u.uLightMode, s.lightMode ? 1 : 0);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.uniform4f(u.uReveal, ORIGIN[0], ORIGIN[1], revealRadius, revealing ? 0 : 1);\r
      gl.uniform2f(u.uView, canvas.width, canvas.height);\r
      gl.uniform1f(u.uFade, s.fade);\r
      gl.uniform1f(u.uFrame, state.frame % 977);\r
      gl.bindVertexArray(vao);\r
      gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_INT, 0);\r
      gl.bindVertexArray(null);\r
      gl.disable(gl.DEPTH_TEST);\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const baseDpr = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      const longest = Math.max(width, height) * baseDpr;\r
      const ratio = longest > MAX_RENDER_DIM ? (baseDpr * MAX_RENDER_DIM) / longest : baseDpr;\r
      const pixelWidth = Math.max(1, Math.round(width * ratio));\r
      const pixelHeight = Math.max(1, Math.round(height * ratio));\r
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {\r
        canvas.width = pixelWidth;\r
        canvas.height = pixelHeight;\r
      }\r
      state.width = width;\r
      state.height = height;\r
      render();\r
    };\r
\r
    const groundPoint = (px: number, py: number) => {\r
      const camera = state.camera;\r
      if (!camera) return null;\r
      const nx = (px / state.width) * 2 - 1;\r
      const ny = 1 - (py / state.height) * 2;\r
      const m = camera.inverse;\r
      const fx = m[0] * nx + m[4] * ny + m[8] + m[12];\r
      const fy = m[1] * nx + m[5] * ny + m[9] + m[13];\r
      const fz = m[2] * nx + m[6] * ny + m[10] + m[14];\r
      const fw = m[3] * nx + m[7] * ny + m[11] + m[15];\r
      const dx = fx / fw - camera.eye[0];\r
      const dy = fy / fw - camera.eye[1];\r
      const dz = fz / fw - camera.eye[2];\r
      if (dy >= -1e-4) return null;\r
      const t = -camera.eye[1] / dy;\r
      return { x: camera.eye[0] + dx * t, z: camera.eye[2] + dz * t };\r
    };\r
\r
    const spawn = (x: number, z: number, strength: number) => {\r
      state.ripples.push({ x, z, start: state.clock, strength });\r
      while (state.ripples.length > MAX_RIPPLES) state.ripples.shift();\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!alive || !visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const moving = !s.paused && !reduce;\r
      if (moving) {\r
        state.frame += 1;\r
        state.clock += dt;\r
        state.intro += dt;\r
        state.swell += dt * s.speed;\r
        state.lights += dt * s.speed * 0.6;\r
        const travel = 3 * Math.max(s.pulseSpeed, 0.05) + 1.2;\r
        const interval = (10 * s.pulseSpacing) / travel;\r
        if (s.pulse > 0 && state.clock >= state.nextRipple) {\r
          if (s.randomOrigin) {\r
            const spot = groundPoint((0.15 + random() * 0.7) * state.width, (0.25 + random() * 0.6) * state.height);\r
            if (spot) spawn(spot.x, spot.z, 1);\r
          } else {\r
            spawn(ORIGIN[0], ORIGIN[1], 1);\r
          }\r
          state.nextRipple = state.clock + interval * (s.randomOrigin ? 0.6 : 1);\r
        }\r
        const lifetime = 46 / travel + 1;\r
        state.ripples = state.ripples.filter(ripple => state.clock - ripple.start < lifetime);\r
      } else if (state.intro < INTRO_SECONDS) {\r
        state.intro = INTRO_SECONDS;\r
      }\r
\r
      const { pointer, hover, look } = state;\r
      const active = s.mouseInteraction && pointer.inside && !reduce;\r
      const spot = active && s.hover !== 0 ? groundPoint(pointer.x, pointer.y) : null;\r
      if (spot) {\r
        if (!hover.placed) {\r
          hover.x = spot.x;\r
          hover.z = spot.z;\r
          hover.vx = 0;\r
          hover.vz = 0;\r
          hover.placed = true;\r
        }\r
        hover.vx += (90 * (spot.x - hover.x) - 19 * hover.vx) * dt;\r
        hover.vz += (90 * (spot.z - hover.z) - 19 * hover.vz) * dt;\r
        hover.x += hover.vx * dt;\r
        hover.z += hover.vz * dt;\r
      }\r
      const goal = spot ? 1 : 0;\r
      hover.presence += (goal - hover.presence) * (1 - Math.exp(-dt / (goal > hover.presence ? 0.35 : 0.6)));\r
      if (!spot && hover.presence < 0.001) hover.placed = false;\r
      const lookX = active ? (pointer.x / state.width - 0.5) * 0.5 : 0;\r
      const lookY = active ? (0.5 - pointer.y / state.height) * 0.5 : 0;\r
      look.vx += (30 * (lookX - look.x) - 11 * look.vx) * dt;\r
      look.vy += (30 * (lookY - look.y) - 11 * look.vy) * dt;\r
      look.x += look.vx * dt;\r
      look.y += look.vy * dt;\r
\r
      render();\r
      const settling =\r
        Math.abs(goal - hover.presence) > 0.002 ||\r
        Math.hypot(hover.vx, hover.vz) > 0.01 ||\r
        Math.abs(lookX - look.x) > 0.0002 ||\r
        Math.abs(lookY - look.y) > 0.0002;\r
      if (moving || settling) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!raf && alive && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      state.pointer.x = x;\r
      state.pointer.y = y;\r
      state.pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      if (!s.mouseInteraction || !s.pulseOnClick || event.button !== 0 || reduce) return;\r
      if (\r
        event.target instanceof Element &&\r
        event.target.closest('a, button, input, textarea, select, label, [role="button"]')\r
      )\r
        return;\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;\r
      const spot = groundPoint(x, y);\r
      if (spot) spawn(spot.x, spot.z, 1.15);\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      state.pointer.inside = false;\r
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
    window.addEventListener('pointerdown', onPointerDown);\r
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
    wake();\r
\r
    wakeRef.current = () => {\r
      if (!raf) render();\r
      wake();\r
    };\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteBuffer(gridBuffer);\r
      gl.deleteBuffer(indexBuffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(surface.program);\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  const { className = '', ...attributes } = rest;\r
\r
  return (\r
    <div ref={containerRef} className={\`acid-squares-container\${className ? \` \${className}\` : ''}\`} {...attributes}>\r
      <canvas ref={canvasRef} className="acid-squares-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default AcidSquares;\r
`,o=`'use client';\r
\r
import { useEffect, useRef, type HTMLAttributes } from 'react';\r
\r
export type AcidSquaresShape = 'square' | 'round';\r
\r
export type AcidSquaresDetail = 'low' | 'medium' | 'high';\r
\r
export type AcidSquaresLighting = 'split' | 'backlit' | 'overhead';\r
\r
export type AcidSquaresHoverEffect = 'press' | 'lift' | 'none';\r
\r
export type AcidSquaresPulseOrigin = 'center' | 'random';\r
\r
export interface AcidSquaresProps extends HTMLAttributes<HTMLDivElement> {\r
  color?: string;\r
  accentColor?: string;\r
  secondaryColor?: string;\r
  tileSize?: number;\r
  gap?: number;\r
  roundness?: number;\r
  softness?: number;\r
  bulge?: number;\r
  rotation?: number;\r
  gloss?: number;\r
  waves?: number;\r
  waveScale?: number;\r
  speed?: number;\r
  shape?: AcidSquaresShape;\r
  pulse?: number;\r
  pulseSpeed?: number;\r
  pulseSpacing?: number;\r
  pulseWidth?: number;\r
  pulseOrigin?: AcidSquaresPulseOrigin;\r
  brightness?: number;\r
  lighting?: AcidSquaresLighting;\r
  tilt?: number;\r
  zoom?: number;\r
  depth?: number;\r
  grain?: number;\r
  fade?: number;\r
  opacity?: number;\r
  intro?: boolean;\r
  mouseInteraction?: boolean;\r
  hoverEffect?: AcidSquaresHoverEffect;\r
  mouseStrength?: number;\r
  mouseRadius?: number;\r
  pulseOnClick?: boolean;\r
  detail?: AcidSquaresDetail;\r
  lightMode?: boolean;\r
  paused?: boolean;\r
  dpr?: number;\r
}\r
\r
type Light = [number, number, number, number, number];\r
\r
type Settings = {\r
  color: string;\r
  accentColor: string;\r
  secondaryColor: string;\r
  tileSize: number;\r
  gap: number;\r
  roundness: number;\r
  softness: number;\r
  bulge: number;\r
  rotation: number;\r
  gloss: number;\r
  waves: number;\r
  waveScale: number;\r
  speed: number;\r
  square: number;\r
  pulse: number;\r
  pulseSpeed: number;\r
  pulseSpacing: number;\r
  pulseWidth: number;\r
  randomOrigin: boolean;\r
  brightness: number;\r
  lights: Light[];\r
  tilt: number;\r
  zoom: number;\r
  depth: number;\r
  grain: number;\r
  fade: number;\r
  opacity: number;\r
  intro: boolean;\r
  mouseInteraction: boolean;\r
  hover: number;\r
  mouseStrength: number;\r
  mouseRadius: number;\r
  pulseOnClick: boolean;\r
  mesh: number;\r
  lightMode: boolean;\r
  paused: boolean;\r
  dpr?: number;\r
};\r
\r
type Surface = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };\r
\r
type Ripple = { x: number; z: number; start: number; strength: number };\r
\r
type Camera = { eye: number[]; target: number[]; viewProj: number[]; inverse: number[]; distance: number };\r
\r
const MAX_RIPPLES = 8;\r
const MESH: Record<AcidSquaresDetail, number> = { low: 150, medium: 210, high: 280 };\r
const AREA = [-42, -76, 84, 94];\r
const MAX_RENDER_DIM = 2400;\r
const INTRO_SECONDS = 3;\r
const REVEAL_SECONDS = 2.6;\r
const REVEAL_REACH = 19;\r
const ORIGIN = [0, -3];\r
const HOVER_EFFECTS: Record<AcidSquaresHoverEffect, number> = { press: 1, lift: -1, none: 0 };\r
const LIGHTING: Record<AcidSquaresLighting, Light[]> = {\r
  split: [\r
    [7, 4.2, -4, 4, 4],\r
    [-8, 3.6, 3, 4, 4]\r
  ],\r
  backlit: [\r
    [6, 1.6, -15, 5, 3],\r
    [-7, 1.4, -13, 5, 3]\r
  ],\r
  overhead: [\r
    [3, 7.5, -4, 3, 3],\r
    [-3, 7, -1, 3, 3]\r
  ]\r
};\r
const DEG = Math.PI / 180;\r
\r
const FIELD = \`\r
uniform vec4 uRipples[\${MAX_RIPPLES}];\r
uniform vec4 uWave;\r
uniform float uSquare;\r
uniform float uClock;\r
uniform vec4 uSwell;\r
uniform vec4 uHover;\r
uniform vec4 uIntro;\r
\r
float reachOf(vec2 delta, out vec2 grad) {\r
  vec2 a = abs(delta);\r
  vec2 dir = vec2(delta.x < 0.0 ? -1.0 : 1.0, delta.y < 0.0 ? -1.0 : 1.0);\r
  float round_ = length(delta);\r
  vec2 roundGrad = delta / max(round_, 1e-4);\r
  float m = max(max(a.x, a.y), 1e-4);\r
  vec2 k = a / m;\r
  vec2 k3 = k * k * k;\r
  float sum = dot(k3, k);\r
  float root = sqrt(sqrt(sum));\r
  float square = m * root;\r
  vec2 squareGrad = dir * k3 / (root * root * root);\r
  float d = mix(round_, square, uSquare);\r
  vec2 g = mix(roundGrad, squareGrad, uSquare);\r
  float soft = sqrt(d * d + 0.36);\r
  grad = g * d / soft;\r
  return soft - 0.6;\r
}\r
\r
vec3 field(vec2 p) {\r
  float t = uSwell.w;\r
  float f = uSwell.y;\r
  vec2 k1 = vec2(0.19, 0.11) * f;\r
  vec2 k2 = vec2(-0.09, 0.23) * f;\r
  vec2 k3 = vec2(0.29, -0.17) * f;\r
  float a1 = dot(p, k1) + t * 0.55;\r
  float a2 = dot(p, k2) - t * 0.42 + 1.3;\r
  float a3 = dot(p, k3) + t * 0.74 + 2.1;\r
  float h = 0.55 * sin(a1) + 0.4 * sin(a2) + 0.22 * sin(a3);\r
  vec2 g = 0.55 * cos(a1) * k1 + 0.4 * cos(a2) * k2 + 0.22 * cos(a3) * k3;\r
  h *= uSwell.x;\r
  g *= uSwell.x;\r
  vec2 dg;\r
  for (int i = 0; i < \${MAX_RIPPLES}; i++) {\r
    vec4 r = uRipples[i];\r
    if (r.w <= 0.0) continue;\r
    float age = uClock - r.z;\r
    if (age <= 0.0) continue;\r
    float d = reachOf(p - r.xy, dg);\r
    float radius = age * uWave.y;\r
    float x = (d - radius) / uWave.z;\r
    float life = clamp(1.0 - radius / uWave.w, 0.0, 1.0);\r
    float strength = r.w * uWave.x * life * life * smoothstep(0.0, 1.5, radius);\r
    float bump = exp(-x * x);\r
    h += bump * strength;\r
    g += -2.0 * x * bump * strength / uWave.z * dg;\r
  }\r
  if (uIntro.w > 0.0) {\r
    float d = reachOf(p - uIntro.xy, dg);\r
    float x = (d - uIntro.z) / 2.2;\r
    float bump = exp(-x * x) * uIntro.w;\r
    h += bump;\r
    g += -2.0 * x * bump / 2.2 * dg;\r
  }\r
  vec2 hd = p - uHover.xy;\r
  float hr = max(uHover.z, 1e-3);\r
  float hover = exp(-dot(hd, hd) / (hr * hr)) * uHover.w;\r
  h -= hover;\r
  g += 2.0 * hd / (hr * hr) * hover;\r
  return vec3(h, g);\r
}\r
\`;\r
\r
const VERTEX = \`#version 300 es\r
precision highp float;\r
\${FIELD}\r
layout(location = 0) in vec2 aGrid;\r
uniform mat4 uViewProj;\r
uniform vec4 uArea;\r
out vec2 vGround;\r
out vec3 vWorld;\r
void main() {\r
  vec2 ground = uArea.xy + aGrid * uArea.zw;\r
  vec3 f = field(ground);\r
  vWorld = vec3(ground.x, f.x, ground.y);\r
  vGround = ground;\r
  gl_Position = uViewProj * vec4(vWorld, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
\${FIELD}\r
uniform vec3 uEye;\r
uniform vec3 uColor;\r
uniform vec3 uAccent;\r
uniform vec3 uSecond;\r
uniform vec3 uLightA;\r
uniform vec3 uLightB;\r
uniform float uTile;\r
uniform float uAngle;\r
uniform float uGap;\r
uniform float uRound;\r
uniform float uSoftness;\r
uniform float uBulge;\r
uniform float uGloss;\r
uniform vec2 uRange;\r
uniform float uBrightness;\r
uniform float uGrain;\r
uniform float uGrainScale;\r
uniform float uLightMode;\r
uniform float uOpacity;\r
uniform vec4 uReveal;\r
uniform vec2 uView;\r
uniform float uFade;\r
uniform float uFrame;\r
in vec2 vGround;\r
in vec3 vWorld;\r
out vec4 outColor;\r
\r
float smoother(float x) {\r
  x = clamp(x, 0.0, 1.0);\r
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);\r
}\r
\r
float hash(vec3 p) {\r
  p = fract(p * 0.1031);\r
  p += dot(p, p.zyx + 31.32);\r
  return fract((p.x + p.y) * p.z);\r
}\r
\r
void main() {\r
  vec3 f = field(vGround);\r
  vec3 n0 = normalize(vec3(-f.y, 1.0, -f.z));\r
  vec3 tx = normalize(vec3(1.0, f.y, 0.0));\r
  vec3 tz = normalize(cross(tx, n0));\r
  tx = normalize(cross(n0, tz));\r
\r
  float c = cos(uAngle);\r
  float s = sin(uAngle);\r
  mat2 toTile = mat2(c, -s, s, c);\r
  vec2 q = toTile * vGround / uTile;\r
  vec2 cell = floor(q);\r
  vec2 local = q - cell - 0.5;\r
  float footprint = max(length(fwidth(q)), 1e-5);\r
\r
  float on = 1.0;\r
  if (uReveal.w < 1.0) {\r
    vec2 centre = transpose(toTile) * (cell + 0.5) * uTile;\r
    vec2 dg;\r
    float d = reachOf(centre - uReveal.xy, dg);\r
    float delay = hash(vec3(cell, 7.0)) * 1.1;\r
    on = max(smoother((uReveal.z - d - delay) / 1.6), uReveal.w);\r
  }\r
\r
  float half_ = (0.5 - uGap * 0.5) * mix(0.62, 1.0, on);\r
  float radius = min(uRound * half_, half_);\r
  vec2 dd = abs(local) - (half_ - radius);\r
  float d = length(max(dd, 0.0)) + min(max(dd.x, dd.y), 0.0) - radius;\r
  vec2 outward = dd.x > 0.0 || dd.y > 0.0 ? normalize(max(dd, 0.0) * sign(local)) : (dd.x > dd.y ? vec2(sign(local.x), 0.0) : vec2(0.0, sign(local.y)));\r
\r
  float bevelWidth = max(mix(0.04, 0.42, uSoftness) * half_, footprint * 1.5);\r
  float edge = clamp((d + bevelWidth) / bevelWidth, 0.0, 1.0);\r
  float dome = uBulge * 0.5 * length(local) / max(half_, 1e-3);\r
  float theta = edge * edge * mix(0.7, 1.35, uSoftness) + dome;\r
  vec2 outwardGround = transpose(toTile) * outward;\r
  vec2 domeGround = transpose(toTile) * (local / max(length(local), 1e-4));\r
  vec3 bend = normalize(tx * mix(domeGround.x, outwardGround.x, edge) + tz * mix(domeGround.y, outwardGround.y, edge));\r
  float crowd = smoothstep(0.08, 0.3, footprint);\r
  theta *= 1.0 - crowd;\r
  vec3 n = normalize(n0 * cos(theta) + bend * sin(theta));\r
\r
  float inside = 1.0 - smoothstep(-footprint * 0.75, footprint * 0.75, d);\r
  float area = (2.0 * half_) * (2.0 * half_) - (4.0 - 3.14159) * radius * radius;\r
  inside = mix(inside, area, crowd) * on;\r
\r
  vec3 toEye = uEye - vWorld;\r
  float dist = length(toEye);\r
  vec3 v = toEye / dist;\r
  vec3 la = uLightA - vWorld;\r
  vec3 lb = uLightB - vWorld;\r
  float da = length(la);\r
  float db = length(lb);\r
  la /= da;\r
  lb /= db;\r
  float fa = 1.0 / (1.0 + da * da * 0.02);\r
  float fb = 1.0 / (1.0 + db * db * 0.02);\r
\r
  float ndv = clamp(dot(n, v), 0.0, 1.0);\r
  float fresnel = 0.04 + 0.96 * pow(1.0 - ndv, 5.0);\r
  vec3 ha = normalize(la + v);\r
  vec3 hb = normalize(lb + v);\r
  float shine = mix(10.0, 90.0, uGloss);\r
  float norm = (shine + 8.0) / 60.0;\r
  float specA = pow(max(dot(n, ha), 0.0), shine) * norm;\r
  float specB = pow(max(dot(n, hb), 0.0), shine) * norm;\r
  float sheenA = pow(max(dot(n, ha), 0.0), 8.0);\r
  float sheenB = pow(max(dot(n, hb), 0.0), 8.0);\r
  float diffA = max(dot(n, la), 0.0);\r
  float diffB = max(dot(n, lb), 0.0);\r
  vec3 r = reflect(-v, n);\r
  float rim = exp((dot(r, normalize(vec3(0.15, 0.55, -1.0))) - 1.0) * 6.0);\r
  float occlusion = mix(1.0, 0.35, edge * edge);\r
  float edgeLight = edge * edge;\r
\r
  vec3 color;\r
  float alpha;\r
  if (uLightMode > 0.5) {\r
    float luma = dot(uColor, vec3(0.299, 0.587, 0.114));\r
    vec3 body = mix(vec3(luma), uColor, 0.5) * 0.96;\r
    vec3 keyDir = normalize(vec3(-0.35, 0.85, 0.45));\r
    float shade = clamp(dot(n, keyDir) * 0.6 + 0.5, 0.0, 1.0);\r
    float wa = clamp(diffA * fa * 9.0, 0.0, 1.0);\r
    float wb = clamp(diffB * fb * 9.0, 0.0, 1.0);\r
    vec3 hue = (uAccent * wa + uSecond * wb) / max(wa + wb, 1e-3);\r
    vec3 lit = body * mix(vec3(1.0), hue, clamp(wa + wb, 0.0, 1.0) * 0.42) * mix(0.7, 1.05, shade);\r
    lit += vec3(1.0) * (specA * fa + specB * fb) * 2.4 * uGloss;\r
    lit *= mix(1.0, 0.8, edgeLight * (1.0 - crowd));\r
    color = lit;\r
    alpha = inside;\r
  } else {\r
    float luma = dot(uColor, vec3(0.299, 0.587, 0.114));\r
    vec3 body = mix(vec3(luma), uColor, 0.35) + vec3(0.02);\r
    vec3 lit = body * 0.25;\r
    lit += body * (uAccent * diffA * fa + uSecond * diffB * fb) * 14.0;\r
    lit += uAccent * (specA * (0.55 + 1.6 * edgeLight) + sheenA * 0.3) * fa * 9.0 * uGloss;\r
    lit += uSecond * (specB * (0.55 + 1.6 * edgeLight) + sheenB * 0.3) * fb * 9.0 * uGloss;\r
    lit += mix(uSecond, vec3(1.0), 0.4) * rim * fresnel * 0.35 * uGloss;\r
    lit *= occlusion;\r
    color = lit * inside;\r
    alpha = inside;\r
  }\r
\r
  float fade = 1.0 - smoother((dist - uRange.x) / max(uRange.y - uRange.x, 1e-3));\r
  alpha *= fade * uOpacity;\r
  color *= uBrightness;\r
  if (uLightMode < 0.5) color = 1.0 - exp(-color * 1.1);\r
\r
  vec2 grainCell = floor(gl_FragCoord.xy / uGrainScale);\r
  float grain = hash(vec3(grainCell, uFrame)) + hash(vec3(grainCell + 17.0, uFrame + 3.0)) - 1.0;\r
  float lum = dot(color, vec3(0.299, 0.587, 0.114));\r
  color += grain * uGrain * (uLightMode > 0.5 ? 0.6 : 0.25 + 0.75 * sqrt(clamp(lum, 0.0, 1.0)));\r
  color = clamp(color, 0.0, 1.0);\r
\r
  vec2 uv = gl_FragCoord.xy / uView;\r
  float edgeFade = max(uFade * 0.5, 1e-4);\r
  float mask = uFade > 0.0 ? smoother(uv.x / edgeFade) * smoother((1.0 - uv.x) / edgeFade) * smoother(uv.y / edgeFade) * smoother((1.0 - uv.y) / edgeFade) : 1.0;\r
  alpha *= mask;\r
  outColor = vec4(color * alpha, alpha);\r
}\`;\r
\r
const UNIFORMS = [\r
  'uRipples',\r
  'uWave',\r
  'uSquare',\r
  'uClock',\r
  'uSwell',\r
  'uHover',\r
  'uIntro',\r
  'uViewProj',\r
  'uArea',\r
  'uEye',\r
  'uColor',\r
  'uAccent',\r
  'uSecond',\r
  'uLightA',\r
  'uLightB',\r
  'uTile',\r
  'uAngle',\r
  'uGap',\r
  'uRound',\r
  'uSoftness',\r
  'uBulge',\r
  'uGloss',\r
  'uRange',\r
  'uBrightness',\r
  'uGrain',\r
  'uGrainScale',\r
  'uLightMode',\r
  'uOpacity',\r
  'uReveal',\r
  'uView',\r
  'uFade',\r
  'uFrame'\r
];\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const ease = (x: number) => {\r
  const t = clamp(x, 0, 1);\r
  return 1 - (1 - t) * (1 - t) * (1 - t);\r
};\r
\r
const glide = (x: number) => {\r
  const t = clamp(x, 0, 1);\r
  return t * t * t * (t * (t * 6 - 15) + 10);\r
};\r
\r
const smoothstep = (a: number, b: number, x: number) => {\r
  const t = clamp((x - a) / (b - a), 0, 1);\r
  return t * t * (3 - 2 * t);\r
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
const link = (gl: WebGL2RenderingContext, vertexSource: string, fragmentSource: string): Surface | null => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);\r
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
  for (const name of UNIFORMS) uniforms[name] = gl.getUniformLocation(program, name);\r
  return { program, uniforms };\r
};\r
\r
const perspective = (fov: number, aspect: number, near: number, far: number) => {\r
  const f = 1 / Math.tan(fov / 2);\r
  const nf = 1 / (near - far);\r
  return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];\r
};\r
\r
const lookAt = (eye: number[], target: number[]) => {\r
  let zx = eye[0] - target[0];\r
  let zy = eye[1] - target[1];\r
  let zz = eye[2] - target[2];\r
  let len = Math.hypot(zx, zy, zz) || 1;\r
  zx /= len;\r
  zy /= len;\r
  zz /= len;\r
  let xx = zz;\r
  let xz = -zx;\r
  len = Math.hypot(xx, xz) || 1;\r
  xx /= len;\r
  xz /= len;\r
  const yx = zy * xz;\r
  const yy = zz * xx - zx * xz;\r
  const yz = -zy * xx;\r
  return [\r
    xx,\r
    yx,\r
    zx,\r
    0,\r
    0,\r
    yy,\r
    zy,\r
    0,\r
    xz,\r
    yz,\r
    zz,\r
    0,\r
    -(xx * eye[0] + xz * eye[2]),\r
    -(yx * eye[0] + yy * eye[1] + yz * eye[2]),\r
    -(zx * eye[0] + zy * eye[1] + zz * eye[2]),\r
    1\r
  ];\r
};\r
\r
const multiply = (a: number[], b: number[]) => {\r
  const out: number[] = new Array(16);\r
  for (let col = 0; col < 4; col += 1) {\r
    for (let row = 0; row < 4; row += 1) {\r
      out[col * 4 + row] =\r
        a[row] * b[col * 4] + a[4 + row] * b[col * 4 + 1] + a[8 + row] * b[col * 4 + 2] + a[12 + row] * b[col * 4 + 3];\r
    }\r
  }\r
  return out;\r
};\r
\r
const invert = (a: number[]) => {\r
  const b00 = a[0] * a[5] - a[1] * a[4];\r
  const b01 = a[0] * a[6] - a[2] * a[4];\r
  const b02 = a[0] * a[7] - a[3] * a[4];\r
  const b03 = a[1] * a[6] - a[2] * a[5];\r
  const b04 = a[1] * a[7] - a[3] * a[5];\r
  const b05 = a[2] * a[7] - a[3] * a[6];\r
  const b06 = a[8] * a[13] - a[9] * a[12];\r
  const b07 = a[8] * a[14] - a[10] * a[12];\r
  const b08 = a[8] * a[15] - a[11] * a[12];\r
  const b09 = a[9] * a[14] - a[10] * a[13];\r
  const b10 = a[9] * a[15] - a[11] * a[13];\r
  const b11 = a[10] * a[15] - a[11] * a[14];\r
  const det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;\r
  const k = det ? 1 / det : 0;\r
  return [\r
    (a[5] * b11 - a[6] * b10 + a[7] * b09) * k,\r
    (a[2] * b10 - a[1] * b11 - a[3] * b09) * k,\r
    (a[13] * b05 - a[14] * b04 + a[15] * b03) * k,\r
    (a[10] * b04 - a[9] * b05 - a[11] * b03) * k,\r
    (a[6] * b08 - a[4] * b11 - a[7] * b07) * k,\r
    (a[0] * b11 - a[2] * b08 + a[3] * b07) * k,\r
    (a[14] * b02 - a[12] * b05 - a[15] * b01) * k,\r
    (a[8] * b05 - a[10] * b02 + a[11] * b01) * k,\r
    (a[4] * b10 - a[5] * b08 + a[7] * b06) * k,\r
    (a[1] * b08 - a[0] * b10 - a[3] * b06) * k,\r
    (a[12] * b04 - a[13] * b02 + a[15] * b00) * k,\r
    (a[9] * b02 - a[8] * b04 - a[11] * b00) * k,\r
    (a[5] * b07 - a[4] * b09 - a[6] * b06) * k,\r
    (a[0] * b09 - a[1] * b07 + a[2] * b06) * k,\r
    (a[13] * b01 - a[12] * b03 - a[14] * b00) * k,\r
    (a[8] * b03 - a[9] * b01 + a[10] * b00) * k\r
  ];\r
};\r
\r
const AcidSquares = ({\r
  color = '#120f17',\r
  accentColor = '#ff4fb8',\r
  secondaryColor = '#3b6bff',\r
  tileSize = 1,\r
  gap = 0.12,\r
  roundness = 0.25,\r
  softness = 0.5,\r
  bulge = 0.3,\r
  rotation = 35,\r
  gloss = 0.6,\r
  waves = 1,\r
  waveScale = 1,\r
  speed = 0.6,\r
  shape = 'square',\r
  pulse = 1,\r
  pulseSpeed = 0.45,\r
  pulseSpacing = 1,\r
  pulseWidth = 1,\r
  pulseOrigin = 'center',\r
  brightness = 1,\r
  lighting = 'split',\r
  tilt = 0.7,\r
  zoom = 1,\r
  depth = 10,\r
  grain = 0.12,\r
  fade = 0,\r
  opacity = 1,\r
  intro = true,\r
  mouseInteraction = true,\r
  hoverEffect = 'press',\r
  mouseStrength = 1,\r
  mouseRadius = 0.35,\r
  pulseOnClick = true,\r
  detail = 'medium',\r
  lightMode = false,\r
  paused = false,\r
  dpr,\r
  ...rest\r
}: AcidSquaresProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings: Settings = {\r
    color: String(color),\r
    accentColor: String(accentColor),\r
    secondaryColor: String(secondaryColor),\r
    tileSize: clamp(tileSize, 0.2, 5),\r
    gap: clamp(gap, 0, 0.6),\r
    roundness: clamp(roundness, 0, 1),\r
    softness: clamp(softness, 0, 1),\r
    bulge: clamp(bulge, 0, 1.5),\r
    rotation: rotation * DEG,\r
    gloss: clamp(gloss, 0, 1),\r
    waves: Math.max(0, waves),\r
    waveScale: clamp(waveScale, 0.1, 5),\r
    speed: Math.max(0, speed),\r
    square: shape === 'round' ? 0 : 1,\r
    pulse: Math.max(0, pulse),\r
    pulseSpeed: Math.max(0, pulseSpeed),\r
    pulseSpacing: clamp(pulseSpacing, 0.2, 6),\r
    pulseWidth: clamp(pulseWidth, 0.1, 5),\r
    randomOrigin: pulseOrigin === 'random',\r
    brightness: Math.max(0, brightness),\r
    lights: LIGHTING[lighting] || LIGHTING.split,\r
    tilt: clamp(tilt, 0, 1),\r
    zoom: clamp(zoom, 0.3, 4),\r
    depth: clamp(depth, 2, 40),\r
    grain: Math.max(0, grain),\r
    fade: clamp(fade, 0, 1),\r
    opacity: clamp(opacity, 0, 1),\r
    intro,\r
    mouseInteraction,\r
    hover: HOVER_EFFECTS[hoverEffect] ?? 1,\r
    mouseStrength: Math.max(0, mouseStrength),\r
    mouseRadius: clamp(mouseRadius, 0.02, 2),\r
    pulseOnClick,\r
    mesh: MESH[detail] || MESH.medium,\r
    lightMode,\r
    paused,\r
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
      antialias: true,\r
      depth: true,\r
      stencil: false\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const surface = link(gl, VERTEX, FRAGMENT);\r
    if (!surface) return undefined;\r
\r
    const vao = gl.createVertexArray();\r
    const gridBuffer = gl.createBuffer();\r
    const indexBuffer = gl.createBuffer();\r
    let meshSize = 0;\r
    let indexCount = 0;\r
    const buildMesh = (size: number) => {\r
      if (size === meshSize) return;\r
      meshSize = size;\r
      const points = new Float32Array((size + 1) * (size + 1) * 2);\r
      let o = 0;\r
      for (let j = 0; j <= size; j += 1) {\r
        for (let i = 0; i <= size; i += 1) {\r
          points[o] = i / size;\r
          points[o + 1] = j / size;\r
          o += 2;\r
        }\r
      }\r
      const indices = new Uint32Array(size * size * 6);\r
      o = 0;\r
      for (let j = 0; j < size; j += 1) {\r
        for (let i = 0; i < size; i += 1) {\r
          const a = j * (size + 1) + i;\r
          const b = a + 1;\r
          const c = a + size + 1;\r
          const d = c + 1;\r
          indices[o] = a;\r
          indices[o + 1] = c;\r
          indices[o + 2] = b;\r
          indices[o + 3] = b;\r
          indices[o + 4] = c;\r
          indices[o + 5] = d;\r
          o += 6;\r
        }\r
      }\r
      indexCount = indices.length;\r
      gl.bindVertexArray(vao);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, gridBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);\r
      gl.enableVertexAttribArray(0);\r
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);\r
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const probe = document.createElement('canvas');\r
    probe.width = 1;\r
    probe.height = 1;\r
    const probeContext = probe.getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const state = {\r
      clock: 0,\r
      swell: 0,\r
      lights: 0,\r
      frame: 0,\r
      nextRipple: 1.2,\r
      ripples: [] as Ripple[],\r
      intro: settingsRef.current.intro && !reduce ? 0 : INTRO_SECONDS,\r
      width: 1,\r
      height: 1,\r
      colorKey: '',\r
      color: [0.07, 0.06, 0.09] as number[],\r
      accent: [1, 0.31, 0.72] as number[],\r
      second: [0.23, 0.42, 1] as number[],\r
      pointer: { x: 0, y: 0, inside: false },\r
      hover: { x: 0, z: 0, vx: 0, vz: 0, presence: 0, placed: false },\r
      look: { x: 0, y: 0, vx: 0, vy: 0 },\r
      seed: 1,\r
      camera: null as Camera | null\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let alive = true;\r
\r
    const toRgb = (value: string, fallback: number[]): number[] => {\r
      if (!probeContext || !value) return fallback;\r
      const css = /^[0-9a-f]{3,8}$/i.test(value) ? \`#\${value}\` : value;\r
      probeContext.clearRect(0, 0, 1, 1);\r
      probeContext.fillStyle = '#000000';\r
      probeContext.fillStyle = css;\r
      probeContext.fillRect(0, 0, 1, 1);\r
      const [r, g, b] = probeContext.getImageData(0, 0, 1, 1).data;\r
      return [r / 255, g / 255, b / 255];\r
    };\r
\r
    const resolveColors = (s: Settings) => {\r
      const key = \`\${s.color}|\${s.accentColor}|\${s.secondaryColor}\`;\r
      if (key === state.colorKey) return;\r
      state.colorKey = key;\r
      state.color = toRgb(s.color, [0.07, 0.06, 0.09]);\r
      state.accent = toRgb(s.accentColor, [1, 0.31, 0.72]);\r
      state.second = toRgb(s.secondaryColor, [0.23, 0.42, 1]);\r
    };\r
\r
    const random = () => {\r
      state.seed = (state.seed * 16807) % 2147483647;\r
      return (state.seed - 1) / 2147483646;\r
    };\r
\r
    const cameraFor = (s: Settings): Camera => {\r
      const aspect = state.width / Math.max(state.height, 1);\r
      const distance = 8 / s.zoom;\r
      const yaw = state.look.x * 0.16;\r
      const pitch = 1.5 - s.tilt * 1.26 + state.look.y * 0.05;\r
      const target = [ORIGIN[0], 0, ORIGIN[1]];\r
      const eye = [\r
        target[0] + Math.sin(yaw) * Math.cos(pitch) * distance,\r
        target[1] + Math.sin(pitch) * distance,\r
        target[2] + Math.cos(yaw) * Math.cos(pitch) * distance\r
      ];\r
      const projection = perspective(0.8, aspect, 0.1, 400);\r
      const view = lookAt(eye, target);\r
      const viewProj = multiply(projection, view);\r
      return { eye, target, viewProj, inverse: invert(viewProj), distance };\r
    };\r
\r
    const rippleData = new Float32Array(MAX_RIPPLES * 4);\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      buildMesh(s.mesh);\r
      resolveColors(s);\r
      const camera = cameraFor(s);\r
      state.camera = camera;\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clearDepth(1);\r
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);\r
      gl.enable(gl.DEPTH_TEST);\r
      gl.depthFunc(gl.LEQUAL);\r
      gl.useProgram(surface.program);\r
      const u = surface.uniforms;\r
      rippleData.fill(0);\r
      state.ripples.forEach((ripple, index) => {\r
        rippleData[index * 4] = ripple.x;\r
        rippleData[index * 4 + 1] = ripple.z;\r
        rippleData[index * 4 + 2] = ripple.start;\r
        rippleData[index * 4 + 3] = ripple.strength;\r
      });\r
      const introAge = state.intro;\r
      const revealing = introAge < INTRO_SECONDS;\r
      const revealRadius = glide(introAge / REVEAL_SECONDS) * REVEAL_REACH;\r
      const settle = ease(introAge / INTRO_SECONDS);\r
      gl.uniform4fv(u.uRipples, rippleData);\r
      gl.uniform4f(u.uWave, 0.55 * s.pulse, 3 * Math.max(s.pulseSpeed, 0.05) + 1.2, 1.6 * s.pulseWidth, 46);\r
      gl.uniform1f(u.uSquare, s.square);\r
      gl.uniform1f(u.uClock, state.clock);\r
      gl.uniform4f(u.uSwell, 1.3 * s.waves * (0.25 + 0.75 * settle), 1.9 / s.waveScale, 0, state.swell);\r
      gl.uniform4f(\r
        u.uHover,\r
        state.hover.x,\r
        state.hover.z,\r
        (3 * s.mouseRadius) / 0.35,\r
        0.7 * state.hover.presence * s.mouseStrength * s.hover\r
      );\r
      gl.uniform4f(\r
        u.uIntro,\r
        ORIGIN[0],\r
        ORIGIN[1],\r
        revealRadius,\r
        revealing ? 0.9 * (1 - smoothstep(0.55, 1, introAge / INTRO_SECONDS)) : 0\r
      );\r
      gl.uniformMatrix4fv(u.uViewProj, false, camera.viewProj);\r
      gl.uniform4f(u.uArea, AREA[0] + ORIGIN[0], AREA[1] + ORIGIN[1], AREA[2], AREA[3]);\r
      gl.uniform3f(u.uEye, camera.eye[0], camera.eye[1], camera.eye[2]);\r
      gl.uniform3f(u.uColor, state.color[0], state.color[1], state.color[2]);\r
      gl.uniform3f(u.uAccent, state.accent[0], state.accent[1], state.accent[2]);\r
      gl.uniform3f(u.uSecond, state.second[0], state.second[1], state.second[2]);\r
      const orbit = state.lights;\r
      const reach = camera.distance / 8;\r
      const lightLevel = 0.35 + 0.65 * settle;\r
      const [first, second] = s.lights;\r
      gl.uniform3f(\r
        u.uLightA,\r
        camera.target[0] + (first[0] + Math.sin(orbit * 0.7) * first[3]) * reach,\r
        first[1] * reach * lightLevel + 0.6,\r
        camera.target[2] + (first[2] + Math.cos(orbit * 0.5) * first[4]) * reach\r
      );\r
      gl.uniform3f(\r
        u.uLightB,\r
        camera.target[0] + (second[0] + Math.cos(orbit * 0.6) * second[3]) * reach,\r
        second[1] * reach * lightLevel + 0.6,\r
        camera.target[2] + (second[2] + Math.sin(orbit * 0.45) * second[4]) * reach\r
      );\r
      gl.uniform1f(u.uTile, 1.2 * s.tileSize);\r
      gl.uniform1f(u.uAngle, s.rotation);\r
      gl.uniform1f(u.uGap, s.gap);\r
      gl.uniform1f(u.uRound, s.roundness);\r
      gl.uniform1f(u.uSoftness, s.softness);\r
      gl.uniform1f(u.uBulge, s.bulge);\r
      gl.uniform1f(u.uGloss, s.gloss);\r
      const far = Math.min(s.depth * 3.2 * reach, AREA[3] * 0.62);\r
      gl.uniform2f(u.uRange, far * 0.5, far);\r
      gl.uniform1f(u.uBrightness, s.brightness);\r
      const pixelRatio = canvas.height / Math.max(state.height, 1);\r
      gl.uniform1f(u.uGrain, s.grain);\r
      gl.uniform1f(u.uGrainScale, Math.max(1, pixelRatio));\r
      gl.uniform1f(u.uLightMode, s.lightMode ? 1 : 0);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.uniform4f(u.uReveal, ORIGIN[0], ORIGIN[1], revealRadius, revealing ? 0 : 1);\r
      gl.uniform2f(u.uView, canvas.width, canvas.height);\r
      gl.uniform1f(u.uFade, s.fade);\r
      gl.uniform1f(u.uFrame, state.frame % 977);\r
      gl.bindVertexArray(vao);\r
      gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_INT, 0);\r
      gl.bindVertexArray(null);\r
      gl.disable(gl.DEPTH_TEST);\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const baseDpr = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      const longest = Math.max(width, height) * baseDpr;\r
      const ratio = longest > MAX_RENDER_DIM ? (baseDpr * MAX_RENDER_DIM) / longest : baseDpr;\r
      const pixelWidth = Math.max(1, Math.round(width * ratio));\r
      const pixelHeight = Math.max(1, Math.round(height * ratio));\r
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {\r
        canvas.width = pixelWidth;\r
        canvas.height = pixelHeight;\r
      }\r
      state.width = width;\r
      state.height = height;\r
      render();\r
    };\r
\r
    const groundPoint = (px: number, py: number) => {\r
      const camera = state.camera;\r
      if (!camera) return null;\r
      const nx = (px / state.width) * 2 - 1;\r
      const ny = 1 - (py / state.height) * 2;\r
      const m = camera.inverse;\r
      const fx = m[0] * nx + m[4] * ny + m[8] + m[12];\r
      const fy = m[1] * nx + m[5] * ny + m[9] + m[13];\r
      const fz = m[2] * nx + m[6] * ny + m[10] + m[14];\r
      const fw = m[3] * nx + m[7] * ny + m[11] + m[15];\r
      const dx = fx / fw - camera.eye[0];\r
      const dy = fy / fw - camera.eye[1];\r
      const dz = fz / fw - camera.eye[2];\r
      if (dy >= -1e-4) return null;\r
      const t = -camera.eye[1] / dy;\r
      return { x: camera.eye[0] + dx * t, z: camera.eye[2] + dz * t };\r
    };\r
\r
    const spawn = (x: number, z: number, strength: number) => {\r
      state.ripples.push({ x, z, start: state.clock, strength });\r
      while (state.ripples.length > MAX_RIPPLES) state.ripples.shift();\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!alive || !visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const moving = !s.paused && !reduce;\r
      if (moving) {\r
        state.frame += 1;\r
        state.clock += dt;\r
        state.intro += dt;\r
        state.swell += dt * s.speed;\r
        state.lights += dt * s.speed * 0.6;\r
        const travel = 3 * Math.max(s.pulseSpeed, 0.05) + 1.2;\r
        const interval = (10 * s.pulseSpacing) / travel;\r
        if (s.pulse > 0 && state.clock >= state.nextRipple) {\r
          if (s.randomOrigin) {\r
            const spot = groundPoint((0.15 + random() * 0.7) * state.width, (0.25 + random() * 0.6) * state.height);\r
            if (spot) spawn(spot.x, spot.z, 1);\r
          } else {\r
            spawn(ORIGIN[0], ORIGIN[1], 1);\r
          }\r
          state.nextRipple = state.clock + interval * (s.randomOrigin ? 0.6 : 1);\r
        }\r
        const lifetime = 46 / travel + 1;\r
        state.ripples = state.ripples.filter(ripple => state.clock - ripple.start < lifetime);\r
      } else if (state.intro < INTRO_SECONDS) {\r
        state.intro = INTRO_SECONDS;\r
      }\r
\r
      const { pointer, hover, look } = state;\r
      const active = s.mouseInteraction && pointer.inside && !reduce;\r
      const spot = active && s.hover !== 0 ? groundPoint(pointer.x, pointer.y) : null;\r
      if (spot) {\r
        if (!hover.placed) {\r
          hover.x = spot.x;\r
          hover.z = spot.z;\r
          hover.vx = 0;\r
          hover.vz = 0;\r
          hover.placed = true;\r
        }\r
        hover.vx += (90 * (spot.x - hover.x) - 19 * hover.vx) * dt;\r
        hover.vz += (90 * (spot.z - hover.z) - 19 * hover.vz) * dt;\r
        hover.x += hover.vx * dt;\r
        hover.z += hover.vz * dt;\r
      }\r
      const goal = spot ? 1 : 0;\r
      hover.presence += (goal - hover.presence) * (1 - Math.exp(-dt / (goal > hover.presence ? 0.35 : 0.6)));\r
      if (!spot && hover.presence < 0.001) hover.placed = false;\r
      const lookX = active ? (pointer.x / state.width - 0.5) * 0.5 : 0;\r
      const lookY = active ? (0.5 - pointer.y / state.height) * 0.5 : 0;\r
      look.vx += (30 * (lookX - look.x) - 11 * look.vx) * dt;\r
      look.vy += (30 * (lookY - look.y) - 11 * look.vy) * dt;\r
      look.x += look.vx * dt;\r
      look.y += look.vy * dt;\r
\r
      render();\r
      const settling =\r
        Math.abs(goal - hover.presence) > 0.002 ||\r
        Math.hypot(hover.vx, hover.vz) > 0.01 ||\r
        Math.abs(lookX - look.x) > 0.0002 ||\r
        Math.abs(lookY - look.y) > 0.0002;\r
      if (moving || settling) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!raf && alive && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      state.pointer.x = x;\r
      state.pointer.y = y;\r
      state.pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      if (!s.mouseInteraction || !s.pulseOnClick || event.button !== 0 || reduce) return;\r
      if (\r
        event.target instanceof Element &&\r
        event.target.closest('a, button, input, textarea, select, label, [role="button"]')\r
      )\r
        return;\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;\r
      const spot = groundPoint(x, y);\r
      if (spot) spawn(spot.x, spot.z, 1.15);\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      state.pointer.inside = false;\r
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
    window.addEventListener('pointerdown', onPointerDown);\r
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
    wake();\r
\r
    wakeRef.current = () => {\r
      if (!raf) render();\r
      wake();\r
    };\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteBuffer(gridBuffer);\r
      gl.deleteBuffer(indexBuffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(surface.program);\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  const { className = '', ...attributes } = rest;\r
\r
  return (\r
    <div\r
      ref={containerRef}\r
      className={['relative h-full w-full overflow-hidden', className].filter(Boolean).join(' ')}\r
      {...attributes}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default AcidSquares;\r
`,a={usage:`import AcidSquares from './AcidSquares';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <AcidSquares
    color="#120f17"
    accentColor="#ff4fb8"
    secondaryColor="#3b6bff"
    tileSize={1}
    gap={0.12}
    roundness={0.25}
    rotation={35}
    waves={1}
    pulse={1}
    lighting="split"
    tilt={0.7}
    grain={0.12}
    intro={true}
    mouseInteraction={true}
  />
</div>`,code:r,css:n,tailwind:e,tsCode:t,tsTailwind:o};export{a as acidSquares};
