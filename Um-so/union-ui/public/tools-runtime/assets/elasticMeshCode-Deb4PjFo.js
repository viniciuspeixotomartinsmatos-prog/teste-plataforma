const r=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
import './ElasticMesh.css';\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
in vec2 aRest;\r
in vec4 aStrain;\r
in vec3 aDent;\r
uniform vec2 uViewport;\r
uniform vec2 uOffset;\r
out vec2 vRest;\r
out vec4 vStrain;\r
out vec3 vDent;\r
void main() {\r
  vRest = aRest;\r
  vStrain = aStrain;\r
  vDent = aDent;\r
  vec2 clip = (aPosition + uOffset) / uViewport * 2.0 - 1.0;\r
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);\r
}\`;\r
\r
const SHADOW = \`#version 300 es\r
precision highp float;\r
in vec2 vRest;\r
in vec4 vStrain;\r
in vec3 vDent;\r
uniform sampler2D uField;\r
uniform vec3 uShadowColor;\r
uniform float uShadow;\r
uniform vec4 uParts[64];\r
uniform float uClock;\r
\r
float arrival(float delay) {\r
  float t = max(uClock - delay, 0.0);\r
  float omega = 15.0;\r
  float zeta = 0.38;\r
  float damped = omega * sqrt(1.0 - zeta * zeta);\r
  return 1.0 - exp(-zeta * omega * t) * (cos(damped * t) + zeta * omega / damped * sin(damped * t));\r
}\r
\r
float owner(vec2 rest) {\r
  ivec2 size = textureSize(uField, 0);\r
  ivec2 texel = clamp(ivec2(rest * vec2(size)), ivec2(0), size - 1);\r
  return floor(texelFetch(uField, texel, 0).w + 0.5);\r
}\r
\r
vec3 settle(vec2 rest) {\r
  if (uClock > 9.0) return vec3(rest, 1.0);\r
  float id = owner(rest);\r
  if (id < 0.5 || id > 64.5) return vec3(rest, 1.0);\r
  vec4 part = uParts[int(id) - 1];\r
  float presence = arrival(part.z);\r
  float size = max(mix(0.5, 1.0, presence), 0.05);\r
  vec2 moved = part.xy + (rest - part.xy) / size;\r
  return vec3(moved, presence * step(abs(owner(moved) - id), 0.5));\r
}\r
out vec4 outColor;\r
void main() {\r
  vec3 arrived = settle(vRest);\r
  float shade = texture(uField, arrived.xy).z * uShadow * clamp(arrived.z, 0.0, 1.0) * (1.0 - 0.35 * clamp(vDent.x, 0.0, 1.0));\r
  outColor = vec4(uShadowColor * shade, shade);\r
}\`;\r
\r
const SURFACE = \`#version 300 es\r
precision highp float;\r
in vec2 vRest;\r
in vec4 vStrain;\r
in vec3 vDent;\r
uniform sampler2D uField;\r
uniform sampler2D uSlope;\r
uniform sampler2D uPaint;\r
uniform vec3 uColor;\r
uniform float uPaintMix;\r
uniform float uMaterial;\r
uniform float uLight;\r
uniform float uInflate;\r
uniform mat3 uTurn;\r
uniform vec4 uParts[64];\r
uniform float uClock;\r
out vec4 outColor;\r
\r
float arrival(float delay) {\r
  float t = max(uClock - delay, 0.0);\r
  float omega = 15.0;\r
  float zeta = 0.38;\r
  float damped = omega * sqrt(1.0 - zeta * zeta);\r
  return 1.0 - exp(-zeta * omega * t) * (cos(damped * t) + zeta * omega / damped * sin(damped * t));\r
}\r
\r
float owner(vec2 rest) {\r
  ivec2 size = textureSize(uField, 0);\r
  ivec2 texel = clamp(ivec2(rest * vec2(size)), ivec2(0), size - 1);\r
  return floor(texelFetch(uField, texel, 0).w + 0.5);\r
}\r
\r
vec3 settle(vec2 rest) {\r
  if (uClock > 9.0) return vec3(rest, 1.0);\r
  float id = owner(rest);\r
  if (id < 0.5 || id > 64.5) return vec3(rest, 1.0);\r
  vec4 part = uParts[int(id) - 1];\r
  float presence = arrival(part.z);\r
  float size = max(mix(0.5, 1.0, presence), 0.05);\r
  vec2 moved = part.xy + (rest - part.xy) / size;\r
  return vec3(moved, presence * step(abs(owner(moved) - id), 0.5));\r
}\r
vec4 cubic(float v) {\r
  vec4 n = vec4(1.0, 2.0, 3.0, 4.0) - v;\r
  vec4 s = n * n * n;\r
  float x = s.x;\r
  float y = s.y - 4.0 * s.x;\r
  float z = s.z - 4.0 * s.y + 6.0 * s.x;\r
  return vec4(x, y, z, 6.0 - x - y - z) / 6.0;\r
}\r
\r
vec2 smoothSlope(vec2 uv) {\r
  vec2 size = vec2(textureSize(uSlope, 0));\r
  vec2 cell = uv * size - 0.5;\r
  vec2 f = fract(cell);\r
  cell -= f;\r
  vec4 xc = cubic(f.x);\r
  vec4 yc = cubic(f.y);\r
  vec4 corner = cell.xxyy + vec2(-0.5, 1.5).xyxy;\r
  vec4 sum = vec4(xc.xz + xc.yw, yc.xz + yc.yw);\r
  vec4 offset = (corner + vec4(xc.yw, yc.yw) / sum) / size.xxyy;\r
  vec2 a = texture(uSlope, offset.xz).xy;\r
  vec2 b = texture(uSlope, offset.yz).xy;\r
  vec2 c = texture(uSlope, offset.xw).xy;\r
  vec2 d = texture(uSlope, offset.yw).xy;\r
  float sx = sum.x / (sum.x + sum.y);\r
  float sy = sum.z / (sum.z + sum.w);\r
  return mix(mix(d, c, sx), mix(b, a, sx), sy);\r
}\r
\r
float panel(vec3 r, vec3 center, vec2 size, float soft) {\r
  vec3 forward = normalize(center);\r
  vec3 side = normalize(cross(vec3(0.0, 1.0, 0.0), forward));\r
  vec3 lift = cross(forward, side);\r
  float facing = dot(r, forward);\r
  vec2 local = vec2(dot(r, side), dot(r, lift)) / max(facing, 0.1);\r
  vec2 q = abs(local) - size;\r
  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);\r
  return smoothstep(soft, -soft, d) * smoothstep(0.05, 0.3, facing);\r
}\r
\r
vec3 studio(vec3 r, float blur) {\r
  float y = r.y;\r
  vec3 skyLow = mix(vec3(0.92, 0.95, 1.0), vec3(1.0), uLight);\r
  vec3 skyHigh = mix(vec3(0.1, 0.11, 0.14), vec3(0.62, 0.64, 0.7), uLight);\r
  vec3 groundNear = mix(vec3(0.12, 0.11, 0.1), vec3(0.3, 0.29, 0.28), uLight);\r
  vec3 groundFar = mix(vec3(0.005), vec3(0.1), uLight);\r
  vec3 sky = mix(skyLow, skyHigh, smoothstep(0.0, 0.75, y));\r
  vec3 ground = mix(groundNear, groundFar, smoothstep(0.0, -0.4, y));\r
  float edge = 0.004 + blur;\r
  vec3 c = mix(ground, sky, smoothstep(-edge, edge, y));\r
  float glow = 0.035 + blur;\r
  c += vec3(2.2) * exp(-pow((y - 0.02) / glow, 2.0)) * (0.035 / glow);\r
  c += vec3(7.0) * panel(r, vec3(-0.55, 0.55, 0.62), vec2(0.36, 0.2), 0.025 + blur);\r
  c += vec3(4.5) * panel(r, vec3(0.9, 0.18, 0.4), vec2(0.045, 0.85), 0.01 + blur) * (0.045 / (0.045 + blur));\r
  c += vec3(3.2) * panel(r, vec3(-0.95, 0.1, 0.32), vec2(0.035, 0.7), 0.01 + blur) * (0.035 / (0.035 + blur));\r
  c += vec3(2.4) * panel(r, vec3(0.0, 0.92, 0.38), vec2(1.1, 0.045), 0.01 + blur) * (0.045 / (0.045 + blur));\r
  return c;\r
}\r
\r
vec3 tone(vec3 x) {\r
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);\r
}\r
\r
void main() {\r
  vec3 arrived = settle(vRest);\r
  vec2 rest = arrived.xy;\r
  float presence = arrived.z;\r
  vec4 field = texture(uField, rest);\r
  float edge = field.y;\r
  float edgeWidth = max(fwidth(edge), 0.0001);\r
  if (edge < -3.0 * edgeWidth || presence <= 0.001) discard;\r
  float cover = clamp(edge / edgeWidth + 0.5, 0.0, 1.0);\r
\r
  vec2 slope = smoothSlope(rest);\r
  mat2 strain = mat2(vStrain.xy, vStrain.zw);\r
  float area = max(determinant(strain), 0.2);\r
  float lift = uInflate * presence * inversesqrt(area);\r
  float keep = clamp(1.0 - vDent.x, 0.15, 1.6);\r
  vec2 restGradient = (slope * keep - field.x * vDent.yz) * lift;\r
  vec2 gradient = inverse(transpose(strain)) * restGradient;\r
  vec3 normal = normalize(vec3(-gradient.x, gradient.y, 1.0));\r
  float depth = field.x * keep * lift;\r
\r
  vec3 turned = uTurn * normal;\r
  vec3 reflected = uTurn * reflect(vec3(0.0, 0.0, -1.0), normal);\r
  float footprint = length(fwidth(reflected));\r
  float facing = max(normal.z, 0.0);\r
  float fresnel = pow(1.0 - facing, 5.0);\r
  vec3 lightDir = normalize(vec3(-0.5, 0.62, 0.62));\r
  float wrap = max((dot(turned, lightDir) + 0.45) / 1.45, 0.0);\r
  float key = max(dot(turned, lightDir), 0.0);\r
  float occlusion = mix(0.55, 1.0, smoothstep(0.0, 12.0, depth));\r
\r
  vec3 paint = texture(uPaint, rest).rgb;\r
  vec3 base = mix(uColor, paint, uPaintMix);\r
  vec3 color;\r
  if (uMaterial < 0.5) {\r
    vec3 env = studio(reflected, 0.04 + footprint * 0.6);\r
    float reflectance = 0.045 + 0.955 * fresnel;\r
    vec3 deep = base * base * 0.55;\r
    vec3 body = mix(deep, base * 1.08, wrap) * occlusion;\r
    body += base * pow(1.0 - facing, 2.0) * 0.18;\r
    color = body * (1.0 - reflectance) + tone(env * reflectance * 0.9);\r
  } else if (uMaterial < 1.5) {\r
    vec3 env = studio(reflected, footprint * 0.6);\r
    vec3 tint = mix(vec3(1.0), base, 0.6) * 0.92;\r
    vec3 reflectance = tint + (1.0 - tint) * fresnel;\r
    color = tone(env * reflectance * mix(0.55, 1.0, occlusion) * 1.1);\r
  } else if (uMaterial < 2.5) {\r
    vec3 env = studio(reflected, 0.03 + footprint * 0.6);\r
    float core = smoothstep(0.0, 1.0, facing);\r
    vec3 glow = mix(base * base * 0.35, min(base * 1.45 + 0.08, vec3(1.0)), core * core);\r
    vec3 body = glow * mix(0.7, 1.0, occlusion) + base * wrap * 0.18;\r
    float reflectance = 0.03 + 0.97 * fresnel;\r
    color = body * (1.0 - reflectance) + tone(env * reflectance * 0.85);\r
  } else {\r
    vec3 env = studio(reflected, 0.35 + footprint * 0.6);\r
    vec3 body = base * (0.3 + 0.7 * wrap) * mix(0.68, 1.0, occlusion);\r
    body += base * key * 0.12;\r
    color = body + tone(env * (0.012 + 0.18 * fresnel)) * 0.5;\r
  }\r
  float alpha = cover * smoothstep(0.0, 0.18, presence);\r
  outColor = vec4(color * alpha, alpha);\r
}\`;\r
\r
const MATERIALS = { balloon: 0, chrome: 1, jelly: 2, clay: 3 };\r
const MAX_FIELD = 720;\r
const MAX_NODES = 5200;\r
const STEP = 1 / 480;\r
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
  gl.bindAttribLocation(program, 1, 'aRest');\r
  gl.bindAttribLocation(program, 2, 'aStrain');\r
  gl.bindAttribLocation(program, 3, 'aDent');\r
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
const distance1d = (f, n, d, v, z) => {\r
  let k = 0;\r
  v[0] = 0;\r
  z[0] = -Infinity;\r
  z[1] = Infinity;\r
  for (let q = 1; q < n; q++) {\r
    let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);\r
    while (s <= z[k]) {\r
      k--;\r
      s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);\r
    }\r
    k++;\r
    v[k] = q;\r
    z[k] = s;\r
    z[k + 1] = Infinity;\r
  }\r
  k = 0;\r
  for (let q = 0; q < n; q++) {\r
    while (z[k + 1] < q) k++;\r
    d[q] = (q - v[k]) * (q - v[k]) + f[v[k]];\r
  }\r
};\r
\r
const distanceField = (grid, width, height) => {\r
  const n = Math.max(width, height);\r
  const f = new Float64Array(n);\r
  const d = new Float64Array(n);\r
  const v = new Int32Array(n);\r
  const z = new Float64Array(n + 1);\r
  for (let x = 0; x < width; x++) {\r
    for (let y = 0; y < height; y++) f[y] = grid[y * width + x];\r
    distance1d(f, height, d, v, z);\r
    for (let y = 0; y < height; y++) grid[y * width + x] = d[y];\r
  }\r
  for (let y = 0; y < height; y++) {\r
    for (let x = 0; x < width; x++) f[x] = grid[y * width + x];\r
    distance1d(f, width, d, v, z);\r
    for (let x = 0; x < width; x++) grid[y * width + x] = Math.sqrt(d[x]);\r
  }\r
  return grid;\r
};\r
\r
const nearestLabels = (labels, width, height) => {\r
  const far = 1e20;\r
  const column = new Float64Array(width * height);\r
  const site = new Int32Array(width * height);\r
  for (let x = 0; x < width; x++) {\r
    let last = -1;\r
    for (let y = 0; y < height; y++) {\r
      const i = y * width + x;\r
      if (labels[i]) last = y;\r
      site[i] = last;\r
      column[i] = last >= 0 ? (y - last) * (y - last) : far;\r
    }\r
    last = -1;\r
    for (let y = height - 1; y >= 0; y--) {\r
      const i = y * width + x;\r
      if (labels[i]) last = y;\r
      if (last >= 0 && (last - y) * (last - y) < column[i]) {\r
        column[i] = (last - y) * (last - y);\r
        site[i] = last;\r
      }\r
    }\r
  }\r
  const out = new Float32Array(width * height);\r
  const f = new Float64Array(width);\r
  const v = new Int32Array(width);\r
  const z = new Float64Array(width + 1);\r
  for (let y = 0; y < height; y++) {\r
    for (let x = 0; x < width; x++) f[x] = column[y * width + x];\r
    let k = 0;\r
    v[0] = 0;\r
    z[0] = -Infinity;\r
    z[1] = Infinity;\r
    for (let q = 1; q < width; q++) {\r
      let cut = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);\r
      while (cut <= z[k]) {\r
        k--;\r
        cut = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);\r
      }\r
      k++;\r
      v[k] = q;\r
      z[k] = cut;\r
      z[k + 1] = Infinity;\r
    }\r
    k = 0;\r
    for (let x = 0; x < width; x++) {\r
      while (z[k + 1] < x) k++;\r
      const sx = v[k];\r
      const sy = site[y * width + sx];\r
      out[y * width + x] = sy >= 0 ? labels[sy * width + sx] : 0;\r
    }\r
  }\r
  return out;\r
};\r
\r
const inflateField = (mask, width, height) => {\r
  const levels = [{ width, height, mask }];\r
  while (Math.max(levels[levels.length - 1].width, levels[levels.length - 1].height) > 48) {\r
    const prev = levels[levels.length - 1];\r
    const w = Math.ceil(prev.width / 2);\r
    const h = Math.ceil(prev.height / 2);\r
    const next = new Float32Array(w * h);\r
    for (let y = 0; y < h; y++) {\r
      for (let x = 0; x < w; x++) {\r
        let sum = 0;\r
        let count = 0;\r
        for (let dy = 0; dy < 2; dy++) {\r
          for (let dx = 0; dx < 2; dx++) {\r
            const sx = x * 2 + dx;\r
            const sy = y * 2 + dy;\r
            if (sx < prev.width && sy < prev.height) {\r
              sum += prev.mask[sy * prev.width + sx];\r
              count++;\r
            }\r
          }\r
        }\r
        next[y * w + x] = sum / count;\r
      }\r
    }\r
    levels.push({ width: w, height: h, mask: next });\r
  }\r
\r
  let solution = null;\r
  for (let level = levels.length - 1; level >= 0; level--) {\r
    const { width: w, height: h, mask: m } = levels[level];\r
    const current = new Float32Array(w * h);\r
    if (solution) {\r
      const pw = levels[level + 1].width;\r
      const ph = levels[level + 1].height;\r
      for (let y = 0; y < h; y++) {\r
        for (let x = 0; x < w; x++) {\r
          const fx = clamp((x + 0.5) / 2 - 0.5, 0, pw - 1);\r
          const fy = clamp((y + 0.5) / 2 - 0.5, 0, ph - 1);\r
          const x0 = Math.floor(fx);\r
          const y0 = Math.floor(fy);\r
          const x1 = Math.min(pw - 1, x0 + 1);\r
          const y1 = Math.min(ph - 1, y0 + 1);\r
          const tx = fx - x0;\r
          const ty = fy - y0;\r
          const top = solution[y0 * pw + x0] * (1 - tx) + solution[y0 * pw + x1] * tx;\r
          const bottom = solution[y1 * pw + x0] * (1 - tx) + solution[y1 * pw + x1] * tx;\r
          current[y * w + x] = top * (1 - ty) + bottom * ty;\r
        }\r
      }\r
    }\r
    const source = 4 ** level;\r
    const iterations = level === levels.length - 1 ? 300 : 60;\r
    for (let iteration = 0; iteration < iterations; iteration++) {\r
      for (let y = 0; y < h; y++) {\r
        for (let x = 0; x < w; x++) {\r
          const i = y * w + x;\r
          if (m[i] < 0.5) {\r
            current[i] = 0;\r
            continue;\r
          }\r
          const l = x > 0 ? current[i - 1] : 0;\r
          const r = x < w - 1 ? current[i + 1] : 0;\r
          const u = y > 0 ? current[i - w] : 0;\r
          const d = y < h - 1 ? current[i + w] : 0;\r
          current[i] += ((l + r + u + d + source) * 0.25 - current[i]) * 1.85;\r
        }\r
      }\r
    }\r
    solution = current;\r
  }\r
  return solution;\r
};\r
\r
const blurField = (source, width, height, radius) => {\r
  const r = Math.max(1, Math.round(radius));\r
  const sigma = r / 2.5;\r
  const kernel = [];\r
  let total = 0;\r
  for (let i = -r; i <= r; i++) {\r
    const weight = Math.exp(-(i * i) / (2 * sigma * sigma));\r
    kernel.push(weight);\r
    total += weight;\r
  }\r
  for (let i = 0; i < kernel.length; i++) kernel[i] /= total;\r
  const temp = new Float32Array(width * height);\r
  const out = new Float32Array(width * height);\r
  for (let y = 0; y < height; y++) {\r
    for (let x = 0; x < width; x++) {\r
      let sum = 0;\r
      for (let i = -r; i <= r; i++) sum += source[y * width + clamp(x + i, 0, width - 1)] * kernel[i + r];\r
      temp[y * width + x] = sum;\r
    }\r
  }\r
  for (let y = 0; y < height; y++) {\r
    for (let x = 0; x < width; x++) {\r
      let sum = 0;\r
      for (let i = -r; i <= r; i++) sum += temp[clamp(y + i, 0, height - 1) * width + x] * kernel[i + r];\r
      out[y * width + x] = sum;\r
    }\r
  }\r
  return out;\r
};\r
\r
const ElasticMesh = ({\r
  text = 'Squish',\r
  src = '',\r
  fontFamily = 'system-ui, sans-serif',\r
  fontWeight = 900,\r
  color = '#3b5bff',\r
  imageColors = true,\r
  material = 'balloon',\r
  inflate = 1,\r
  stiffness = 0.5,\r
  wobble = 0.6,\r
  grabRadius = 70,\r
  stretch = 0.5,\r
  press = 0.5,\r
  shadow = 0.5,\r
  intro = true,\r
  theme = 'dark',\r
  dpr,\r
  className = '',\r
  style,\r
  ...rest\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const contentRef = useRef(null);\r
  const settings = {\r
    text: String(text),\r
    src: String(src || ''),\r
    fontFamily: String(fontFamily),\r
    fontWeight,\r
    color: String(color),\r
    imageColors,\r
    material: MATERIALS[material] ?? 0,\r
    inflate: clamp(inflate, 0.1, 3),\r
    stiffness: clamp(stiffness, 0, 1),\r
    wobble: clamp(wobble, 0, 1),\r
    grabRadius: clamp(grabRadius, 10, 400),\r
    stretch: clamp(stretch, 0, 1),\r
    press: clamp(press, 0, 1),\r
    shadow: clamp(shadow, 0, 1),\r
    intro,\r
    light: theme === 'light',\r
    dpr\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
  const contentKey = \`\${settings.text}|\${settings.src}|\${settings.fontFamily}|\${settings.fontWeight}\`;\r
  const builtRef = useRef(contentKey);\r
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
    const surfaceProgram = link(gl, SURFACE);\r
    const shadowProgram = link(gl, SHADOW);\r
    if (!surfaceProgram || !shadowProgram) return undefined;\r
    const surface = locate(gl, surfaceProgram, [\r
      'uViewport',\r
      'uOffset',\r
      'uField',\r
      'uPaint',\r
      'uSlope',\r
      'uColor',\r
      'uPaintMix',\r
      'uMaterial',\r
      'uLight',\r
      'uInflate',\r
      'uTurn',\r
      'uClock',\r
      'uParts'\r
    ]);\r
    const shade = locate(gl, shadowProgram, [\r
      'uViewport',\r
      'uOffset',\r
      'uField',\r
      'uShadowColor',\r
      'uShadow',\r
      'uClock',\r
      'uParts'\r
    ]);\r
\r
    const fieldTexture = gl.createTexture();\r
    const paintTexture = gl.createTexture();\r
    const slopeTexture = gl.createTexture();\r
    for (const texture of [fieldTexture, paintTexture, slopeTexture]) {\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));\r
    }\r
\r
    const vao = gl.createVertexArray();\r
    const restBuffer = gl.createBuffer();\r
    const dynamicBuffer = gl.createBuffer();\r
    const indexBuffer = gl.createBuffer();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, restBuffer);\r
    gl.enableVertexAttribArray(1);\r
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, dynamicBuffer);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 36, 0);\r
    gl.enableVertexAttribArray(2);\r
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 36, 8);\r
    gl.enableVertexAttribArray(3);\r
    gl.vertexAttribPointer(3, 3, gl.FLOAT, false, 36, 24);\r
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);\r
    gl.bindVertexArray(null);\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const partData = new Float32Array(256);\r
    const turnMatrix = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);\r
    const mesh = {\r
      cols: 0,\r
      rows: 0,\r
      spacing: 1,\r
      count: 0,\r
      indices: 0,\r
      restX: new Float32Array(0),\r
      restY: new Float32Array(0),\r
      x: new Float32Array(0),\r
      y: new Float32Array(0),\r
      vx: new Float32Array(0),\r
      vy: new Float32Array(0),\r
      dent: new Float32Array(0),\r
      dentV: new Float32Array(0),\r
      grip: new Float32Array(0),\r
      gripX: new Float32Array(0),\r
      gripY: new Float32Array(0),\r
      active: new Uint8Array(0),\r
      neighbors: new Int32Array(0),\r
      dynamic: new Float32Array(0),\r
      anchorX: new Float32Array(0),\r
      anchorY: new Float32Array(0),\r
      indexType: gl.UNSIGNED_SHORT,\r
      activeCount: 0,\r
      width: 1,\r
      height: 1\r
    };\r
    const state = {\r
      width: 1,\r
      height: 1,\r
      ready: false,\r
      fieldWidth: 1,\r
      fieldHeight: 1,\r
      fieldScale: 1,\r
      sdf: new Float32Array(0),\r
      parts: [],\r
      clock: settingsRef.current.intro && !reduce ? 0 : 10,\r
      colorKey: '',\r
      color: [0.31, 0.42, 1],\r
      pointer: { x: 0, y: 0, inside: false, down: false, startX: 0, startY: 0, startTime: 0, dragging: false },\r
      hover: { x: 0, y: 0, vx: 0, vy: 0, power: 0 },\r
      turn: { x: 0, y: 0, vx: 0, vy: 0 },\r
      accumulator: 0,\r
      energy: 1,\r
      buildToken: 0\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let alive = true;\r
    let resizeTimer = 0;\r
\r
    const toRgb = value => {\r
      if (!probe || !value) return [0.31, 0.42, 1];\r
      probe.fillStyle = '#000000';\r
      probe.fillStyle = /^[0-9a-f]{3,8}$/i.test(value) ? \`#\${value}\` : value;\r
      probe.fillRect(0, 0, 1, 1);\r
      const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
      return [r / 255, g / 255, b / 255];\r
    };\r
\r
    const sampleSdf = (px, py) => {\r
      const fx = clamp(Math.round(px * state.fieldScale), 0, state.fieldWidth - 1);\r
      const fy = clamp(Math.round(py * state.fieldScale), 0, state.fieldHeight - 1);\r
      return state.sdf[fy * state.fieldWidth + fx] || -1e6;\r
    };\r
\r
    const buildMesh = () => {\r
      const { width, height } = state;\r
      const spacing = Math.max(7, Math.sqrt((width * height) / MAX_NODES));\r
      const cols = Math.ceil(width / spacing) + 1;\r
      const rows = Math.ceil(height / spacing) + 1;\r
      const count = cols * rows;\r
      const sx = width / (cols - 1);\r
      const sy = height / (rows - 1);\r
      mesh.cols = cols;\r
      mesh.rows = rows;\r
      mesh.width = width;\r
      mesh.height = height;\r
      mesh.spacing = (sx + sy) / 2;\r
      mesh.count = count;\r
      mesh.restX = new Float32Array(count);\r
      mesh.restY = new Float32Array(count);\r
      mesh.x = new Float32Array(count);\r
      mesh.y = new Float32Array(count);\r
      mesh.vx = new Float32Array(count);\r
      mesh.vy = new Float32Array(count);\r
      mesh.dent = new Float32Array(count);\r
      mesh.dentV = new Float32Array(count);\r
      mesh.grip = new Float32Array(count);\r
      mesh.gripX = new Float32Array(count);\r
      mesh.gripY = new Float32Array(count);\r
      mesh.active = new Uint8Array(count);\r
      mesh.dynamic = new Float32Array(count * 9);\r
      const rest = new Float32Array(count * 2);\r
      const reach = -2.5 * mesh.spacing;\r
      for (let j = 0; j < rows; j++) {\r
        for (let i = 0; i < cols; i++) {\r
          const k = j * cols + i;\r
          const px = i * sx;\r
          const py = j * sy;\r
          mesh.restX[k] = px;\r
          mesh.restY[k] = py;\r
          mesh.x[k] = px;\r
          mesh.y[k] = py;\r
          rest[k * 2] = px / width;\r
          rest[k * 2 + 1] = py / height;\r
          mesh.active[k] = state.ready && sampleSdf(px, py) > reach ? 1 : 0;\r
        }\r
      }\r
      const neighbors = new Int32Array(count * 8).fill(-1);\r
      const offsets = [\r
        [-1, 0],\r
        [1, 0],\r
        [0, -1],\r
        [0, 1],\r
        [-1, -1],\r
        [1, -1],\r
        [-1, 1],\r
        [1, 1]\r
      ];\r
      for (let j = 0; j < rows; j++) {\r
        for (let i = 0; i < cols; i++) {\r
          const k = j * cols + i;\r
          if (!mesh.active[k]) continue;\r
          offsets.forEach(([di, dj], n) => {\r
            const ni = i + di;\r
            const nj = j + dj;\r
            if (ni < 0 || nj < 0 || ni >= cols || nj >= rows) return;\r
            const nk = nj * cols + ni;\r
            if (mesh.active[nk]) neighbors[k * 8 + n] = nk;\r
          });\r
        }\r
      }\r
      mesh.neighbors = neighbors;\r
      mesh.activeCount = mesh.active.reduce((total, flag) => total + flag, 0);\r
      const margin = -(Math.min(width, height) * 0.14 + mesh.spacing * 3);\r
      const near = new Uint8Array(count);\r
      for (let k = 0; k < count; k++) near[k] = state.ready && sampleSdf(mesh.restX[k], mesh.restY[k]) > margin ? 1 : 0;\r
      const quads = [];\r
      for (let j = 0; j < rows - 1; j++) {\r
        for (let i = 0; i < cols - 1; i++) {\r
          const a = j * cols + i;\r
          const b = a + 1;\r
          const c = a + cols;\r
          const d = c + 1;\r
          if (near[a] || near[b] || near[c] || near[d]) quads.push(a, c, b, b, c, d);\r
        }\r
      }\r
      const indexData = count > 65535 ? new Uint32Array(quads) : new Uint16Array(quads);\r
      mesh.indexType = count > 65535 ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;\r
      mesh.indices = quads.length;\r
      gl.bindBuffer(gl.ARRAY_BUFFER, restBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, rest, gl.STATIC_DRAW);\r
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);\r
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexData, gl.STATIC_DRAW);\r
      writeDynamic();\r
    };\r
\r
    const writeDynamic = () => {\r
      const { cols, rows, x, y, dent, dynamic, spacing } = mesh;\r
      const sx = mesh.width / Math.max(1, cols - 1);\r
      const sy = mesh.height / Math.max(1, rows - 1);\r
      for (let j = 0; j < rows; j++) {\r
        for (let i = 0; i < cols; i++) {\r
          const k = j * cols + i;\r
          const l = i > 0 ? k - 1 : k;\r
          const r = i < cols - 1 ? k + 1 : k;\r
          const u = j > 0 ? k - cols : k;\r
          const d = j < rows - 1 ? k + cols : k;\r
          const spanX = (r - l) * sx || spacing;\r
          const spanY = ((d - u) / cols) * sy || spacing;\r
          const o = k * 9;\r
          dynamic[o] = x[k];\r
          dynamic[o + 1] = y[k];\r
          dynamic[o + 2] = (x[r] - x[l]) / spanX;\r
          dynamic[o + 3] = (y[r] - y[l]) / spanX;\r
          dynamic[o + 4] = (x[d] - x[u]) / spanY;\r
          dynamic[o + 5] = (y[d] - y[u]) / spanY;\r
          dynamic[o + 6] = dent[k];\r
          dynamic[o + 7] = (dent[r] - dent[l]) / spanX;\r
          dynamic[o + 8] = (dent[d] - dent[u]) / spanY;\r
        }\r
      }\r
      gl.bindBuffer(gl.ARRAY_BUFFER, dynamicBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, dynamic, gl.DYNAMIC_DRAW);\r
    };\r
\r
    const rasterize = async () => {\r
      const s = settingsRef.current;\r
      const token = ++state.buildToken;\r
      const { width, height } = state;\r
      const scale = Math.min(1, MAX_FIELD / Math.max(width, height));\r
      const fw = Math.max(8, Math.round(width * scale));\r
      const fh = Math.max(8, Math.round(height * scale));\r
      const canvas2d = document.createElement('canvas');\r
      canvas2d.width = fw;\r
      canvas2d.height = fh;\r
      const ctx = canvas2d.getContext('2d', { willReadFrequently: true });\r
      if (!ctx) return;\r
      let drawn = false;\r
      if (s.src) {\r
        const image = new Image();\r
        image.crossOrigin = 'anonymous';\r
        image.decoding = 'async';\r
        image.src = s.src;\r
        try {\r
          await image.decode();\r
        } catch {\r
          return;\r
        }\r
        if (token !== state.buildToken) return;\r
        const fit = Math.min((fw * 0.78) / image.naturalWidth, (fh * 0.74) / image.naturalHeight);\r
        const w = image.naturalWidth * fit;\r
        const h = image.naturalHeight * fit;\r
        ctx.drawImage(image, (fw - w) / 2, (fh - h) / 2, w, h);\r
        drawn = true;\r
      } else {\r
        const family = s.fontFamily;\r
        const weight = s.fontWeight;\r
        if (document.fonts) await document.fonts.load(\`\${weight} 100px \${family}\`).catch(() => null);\r
        if (token !== state.buildToken) return;\r
        const lines = s.text.split('\\n');\r
        ctx.font = \`\${weight} 100px \${family}\`;\r
        let widest = 1;\r
        let ascent = 0;\r
        let descent = 0;\r
        for (const line of lines) {\r
          const m = ctx.measureText(line || ' ');\r
          widest = Math.max(widest, m.actualBoundingBoxLeft + m.actualBoundingBoxRight);\r
          ascent = Math.max(ascent, m.actualBoundingBoxAscent);\r
          descent = Math.max(descent, m.actualBoundingBoxDescent);\r
        }\r
        const lineHeight = 100 * 1.02;\r
        const blockHeight = ascent + descent + lineHeight * (lines.length - 1);\r
        const size = Math.min((fw * 0.8) / widest, (fh * 0.7) / blockHeight) * 100;\r
        ctx.font = \`\${weight} \${size}px \${family}\`;\r
        ctx.fillStyle = '#ffffff';\r
        ctx.textAlign = 'center';\r
        ctx.textBaseline = 'alphabetic';\r
        const k = size / 100;\r
        const top = (fh - blockHeight * k) / 2 + ascent * k;\r
        lines.forEach((line, index) => {\r
          const m = ctx.measureText(line || ' ');\r
          const shift = (m.actualBoundingBoxLeft - m.actualBoundingBoxRight) / 2;\r
          ctx.fillText(line, fw / 2 + shift, top + index * lineHeight * k);\r
        });\r
        drawn = true;\r
      }\r
      if (!drawn || token !== state.buildToken) return;\r
\r
      const pixels = ctx.getImageData(0, 0, fw, fh).data;\r
      const count = fw * fh;\r
      const mask = new Float32Array(count);\r
      const inside = new Float64Array(count);\r
      const outside = new Float64Array(count);\r
      for (let i = 0; i < count; i++) {\r
        const a = pixels[i * 4 + 3] / 255;\r
        mask[i] = a;\r
        inside[i] = a > 0.5 ? 1e10 : 0;\r
        outside[i] = a > 0.5 ? 0 : 1e10;\r
      }\r
      distanceField(inside, fw, fh);\r
      distanceField(outside, fw, fh);\r
      const binary = new Float32Array(count);\r
      const signed = new Float32Array(count);\r
      for (let i = 0; i < count; i++) {\r
        binary[i] = mask[i] > 0.5 ? 1 : 0;\r
        signed[i] =\r
          mask[i] > 0.02 && mask[i] < 0.98 ? mask[i] - 0.5 : inside[i] > 0 ? inside[i] - 0.5 : 0.5 - outside[i];\r
      }\r
      const labels = new Int32Array(count);\r
      const parts = [];\r
      const queue = new Int32Array(count);\r
      for (let start = 0; start < count; start++) {\r
        if (!binary[start] || labels[start]) continue;\r
        const id = parts.length + 1;\r
        let head = 0;\r
        let tail = 0;\r
        let sumX = 0;\r
        let sumY = 0;\r
        let minX = Infinity;\r
        queue[tail++] = start;\r
        labels[start] = id;\r
        while (head < tail) {\r
          const i = queue[head++];\r
          const x = i % fw;\r
          const y = (i - x) / fw;\r
          sumX += x;\r
          sumY += y;\r
          if (x < minX) minX = x;\r
          if (x > 0 && binary[i - 1] && !labels[i - 1]) {\r
            labels[i - 1] = id;\r
            queue[tail++] = i - 1;\r
          }\r
          if (x < fw - 1 && binary[i + 1] && !labels[i + 1]) {\r
            labels[i + 1] = id;\r
            queue[tail++] = i + 1;\r
          }\r
          if (y > 0 && binary[i - fw] && !labels[i - fw]) {\r
            labels[i - fw] = id;\r
            queue[tail++] = i - fw;\r
          }\r
          if (y < fh - 1 && binary[i + fw] && !labels[i + fw]) {\r
            labels[i + fw] = id;\r
            queue[tail++] = i + fw;\r
          }\r
        }\r
        parts.push({ x: sumX / tail / scale, y: sumY / tail / scale, left: minX, size: tail, delay: 0 });\r
      }\r
      const order = [...parts].sort((a, b) => a.left - b.left);\r
      const gap = order.length > 1 ? Math.min(0.07, 0.5 / (order.length - 1)) : 0;\r
      order.forEach((part, rank) => {\r
        part.delay = rank * gap;\r
      });\r
      const owners = parts.length <= 64 ? nearestLabels(labels, fw, fh) : new Float32Array(count);\r
      const solution = blurField(inflateField(binary, fw, fh), fw, fh, 2);\r
      const edges = blurField(signed, fw, fh, 2);\r
      const shadowMask = blurField(binary, fw, fh, Math.max(4, Math.min(fw, fh) * 0.045));\r
      const field = new Float32Array(count * 4);\r
      const sdf = new Float32Array(count);\r
      const heights = new Float32Array(count);\r
      for (let i = 0; i < count; i++) {\r
        const distance = edges[i] / scale;\r
        sdf[i] = distance;\r
        heights[i] = Math.sqrt(Math.max(0, 2 * solution[i])) / scale;\r
        field[i * 4] = heights[i];\r
        field[i * 4 + 1] = distance;\r
        field[i * 4 + 2] = shadowMask[i];\r
        field[i * 4 + 3] = owners[i];\r
      }\r
      const slopes = new Float32Array(count * 2);\r
      for (let y = 0; y < fh; y++) {\r
        for (let x = 0; x < fw; x++) {\r
          const i = y * fw + x;\r
          let gx = (heights[y * fw + Math.min(fw - 1, x + 1)] - heights[y * fw + Math.max(0, x - 1)]) * 0.5 * scale;\r
          let gy = (heights[Math.min(fh - 1, y + 1) * fw + x] - heights[Math.max(0, y - 1) * fw + x]) * 0.5 * scale;\r
          const steep = Math.hypot(gx, gy);\r
          if (steep > 7) {\r
            gx *= 7 / steep;\r
            gy *= 7 / steep;\r
          }\r
          slopes[i * 2] = gx;\r
          slopes[i * 2 + 1] = gy;\r
        }\r
      }\r
      gl.bindTexture(gl.TEXTURE_2D, fieldTexture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, fw, fh, 0, gl.RGBA, gl.FLOAT, field);\r
      gl.bindTexture(gl.TEXTURE_2D, slopeTexture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG16F, fw, fh, 0, gl.RG, gl.FLOAT, slopes);\r
      gl.bindTexture(gl.TEXTURE_2D, paintTexture);\r
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas2d);\r
      state.fieldWidth = fw;\r
      state.fieldHeight = fh;\r
      state.fieldScale = scale;\r
      state.sdf = sdf;\r
      state.parts = parts;\r
      partData.fill(0);\r
      parts.slice(0, 64).forEach((part, index) => {\r
        partData[index * 4] = part.x / width;\r
        partData[index * 4 + 1] = part.y / height;\r
        partData[index * 4 + 2] = part.delay;\r
      });\r
      state.ready = true;\r
      buildMesh();\r
      wake();\r
    };\r
\r
    const solve = (dt, s) => {\r
      const { count, x, y, vx, vy, restX, restY, dent, dentV, active, neighbors, grip, gripX, gripY, spacing } = mesh;\r
      const firm = 0.4 + s.stiffness * 1.2;\r
      const anchor = 350 * firm * firm;\r
      const couple = anchor * (52 / Math.sqrt(firm) / spacing) ** 2;\r
      const ratio = reduce ? 0.8 : 0.5 - s.wobble * 0.42;\r
      const damping = 2 * ratio * Math.sqrt(anchor);\r
      const dentAnchor = anchor * 1.4;\r
      const dentCouple = dentAnchor * (18 / spacing) ** 2;\r
      const dentDamping = 2 * (ratio + 0.06) * Math.sqrt(dentAnchor);\r
      const gripStiffness = anchor * 30;\r
      const gripDamping = 1.2 * Math.sqrt(gripStiffness);\r
      const brush = state.pointer.dragging ? 0 : 10;\r
      const hover = state.hover;\r
      const pressRadius = s.grabRadius * 0.32;\r
      const pressInv = 1 / (2 * pressRadius * pressRadius);\r
      const pressPower = hover.power * s.press;\r
      const pressDepth = state.pointer.dragging ? 1.6 : 1;\r
      let energy = 0;\r
      for (let k = 0; k < count; k++) {\r
        if (!active[k]) continue;\r
        const ux = x[k] - restX[k];\r
        const uy = y[k] - restY[k];\r
        let ax = -anchor * ux - damping * vx[k];\r
        let ay = -anchor * uy - damping * vy[k];\r
        let ad = -dentAnchor * dent[k] - dentDamping * dentV[k];\r
        const base = k * 8;\r
        for (let n = 0; n < 8; n++) {\r
          const m = neighbors[base + n];\r
          if (m < 0) continue;\r
          const weight = n < 4 ? 1 : 0.5;\r
          ax += couple * weight * (x[m] - restX[m] - ux);\r
          ay += couple * weight * (y[m] - restY[m] - uy);\r
          ad += dentCouple * weight * (dent[m] - dent[k]);\r
        }\r
        if (pressPower > 0.001) {\r
          const dx = x[k] - hover.x;\r
          const dy = y[k] - hover.y;\r
          const falloff = Math.exp(-(dx * dx + dy * dy) * pressInv);\r
          ad += dentAnchor * 2.6 * pressDepth * pressPower * falloff;\r
          ax += (anchor * 0.3 * dx + brush * hover.vx) * pressPower * falloff;\r
          ay += (anchor * 0.3 * dy + brush * hover.vy) * pressPower * falloff;\r
        }\r
        if (grip[k] > 0) {\r
          ax += grip[k] * (gripStiffness * (gripX[k] - x[k]) - gripDamping * vx[k]);\r
          ay += grip[k] * (gripStiffness * (gripY[k] - y[k]) - gripDamping * vy[k]);\r
        }\r
        vx[k] += ax * dt;\r
        vy[k] += ay * dt;\r
        dentV[k] += ad * dt;\r
        energy += Math.abs(vx[k]) + Math.abs(vy[k]) + Math.abs(dentV[k]) * spacing;\r
      }\r
      for (let k = 0; k < count; k++) {\r
        if (!active[k]) continue;\r
        x[k] += vx[k] * dt;\r
        y[k] += vy[k] * dt;\r
        dent[k] = clamp(dent[k] + dentV[k] * dt, -0.6, 0.85);\r
      }\r
      return energy;\r
    };\r
\r
    const updateGrip = s => {\r
      const { pointer } = state;\r
      const { count, grip, gripX, gripY } = mesh;\r
      if (!pointer.dragging) return;\r
      const limit = Math.max(20, Math.min(state.width, state.height) * (0.08 + s.stretch * 0.32));\r
      const dx = pointer.x - pointer.startX;\r
      const dy = pointer.y - pointer.startY;\r
      const length = Math.hypot(dx, dy);\r
      const eased = length > 0 ? (limit * Math.tanh(length / limit)) / length : 0;\r
      for (let k = 0; k < count; k++) {\r
        if (grip[k] <= 0) continue;\r
        gripX[k] = mesh.anchorX[k] + dx * eased;\r
        gripY[k] = mesh.anchorY[k] + dy * eased;\r
      }\r
    };\r
\r
    const grab = (px, py, s) => {\r
      const { count, x, y, grip, active } = mesh;\r
      const radius = s.grabRadius * 0.3;\r
      const inv = 1 / (2 * radius * radius);\r
      mesh.anchorX = new Float32Array(count);\r
      mesh.anchorY = new Float32Array(count);\r
      let total = 0;\r
      for (let k = 0; k < count; k++) {\r
        if (!active[k]) continue;\r
        const dx = x[k] - px;\r
        const dy = y[k] - py;\r
        const weight = Math.exp(-(dx * dx + dy * dy) * inv);\r
        grip[k] = weight > 0.03 ? weight : 0;\r
        mesh.anchorX[k] = x[k];\r
        mesh.anchorY[k] = y[k];\r
        total += grip[k];\r
      }\r
      return total > 0;\r
    };\r
\r
    const release = () => {\r
      mesh.grip.fill(0);\r
      state.pointer.dragging = false;\r
    };\r
\r
    const poke = (px, py, s) => {\r
      const { count, x, y, vx, vy, dentV, active } = mesh;\r
      const radius = s.grabRadius;\r
      const inv = 1 / (2 * radius * radius);\r
      const strength = 0.4 + s.press;\r
      for (let k = 0; k < count; k++) {\r
        if (!active[k]) continue;\r
        const dx = x[k] - px;\r
        const dy = y[k] - py;\r
        const falloff = Math.exp(-(dx * dx + dy * dy) * inv);\r
        dentV[k] += 9 * strength * falloff;\r
        vx[k] += dx * 9 * strength * falloff;\r
        vy[k] += dy * 9 * strength * falloff;\r
      }\r
    };\r
\r
    const onSurface = (px, py) => {\r
      const { cols, rows, x, y, active, spacing } = mesh;\r
      let best = Infinity;\r
      let bestK = -1;\r
      const range = Math.ceil(80 / spacing);\r
      const ci = clamp(Math.round(px / (mesh.width / Math.max(1, cols - 1))), 0, cols - 1);\r
      const cj = clamp(Math.round(py / (mesh.height / Math.max(1, rows - 1))), 0, rows - 1);\r
      for (let j = Math.max(0, cj - range); j <= Math.min(rows - 1, cj + range); j++) {\r
        for (let i = Math.max(0, ci - range); i <= Math.min(cols - 1, ci + range); i++) {\r
          const k = j * cols + i;\r
          if (!active[k]) continue;\r
          const d = Math.hypot(x[k] - px, y[k] - py);\r
          if (d < best) {\r
            best = d;\r
            bestK = k;\r
          }\r
        }\r
      }\r
      if (bestK < 0) return false;\r
      return sampleSdf(mesh.restX[bestK] + (px - x[bestK]), mesh.restY[bestK] + (py - y[bestK])) > -4;\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      if (width !== state.width || height !== state.height) {\r
        const first = !state.ready && !state.buildToken;\r
        state.width = width;\r
        state.height = height;\r
        window.clearTimeout(resizeTimer);\r
        if (first) rasterize();\r
        else resizeTimer = window.setTimeout(rasterize, 160);\r
      }\r
      wake();\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const colorKey = s.color;\r
      if (colorKey !== state.colorKey) {\r
        state.colorKey = colorKey;\r
        state.color = toRgb(s.color);\r
      }\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      if (!state.ready || !mesh.indices) return;\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      gl.bindVertexArray(vao);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, fieldTexture);\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.bindTexture(gl.TEXTURE_2D, paintTexture);\r
      gl.activeTexture(gl.TEXTURE2);\r
      gl.bindTexture(gl.TEXTURE_2D, slopeTexture);\r
\r
      if (s.shadow > 0) {\r
        gl.useProgram(shadowProgram);\r
        gl.uniform2f(shade.uViewport, mesh.width, mesh.height);\r
        const drop = Math.min(mesh.width, mesh.height) * 0.035 * s.inflate;\r
        gl.uniform2f(shade.uOffset, drop * 0.25, drop);\r
        gl.uniform1i(shade.uField, 0);\r
        if (s.light) gl.uniform3f(shade.uShadowColor, 0.08, 0.08, 0.14);\r
        else gl.uniform3f(shade.uShadowColor, 0, 0, 0);\r
        gl.uniform1f(shade.uShadow, s.shadow * (s.light ? 0.35 : 0.7));\r
        gl.uniform1f(shade.uClock, state.clock);\r
        gl.uniform4fv(shade.uParts, partData);\r
        gl.drawElements(gl.TRIANGLES, mesh.indices, mesh.indexType, 0);\r
      }\r
\r
      gl.useProgram(surfaceProgram);\r
      gl.uniform2f(surface.uViewport, mesh.width, mesh.height);\r
      gl.uniform2f(surface.uOffset, 0, 0);\r
      gl.uniform1i(surface.uField, 0);\r
      gl.uniform1i(surface.uPaint, 1);\r
      gl.uniform1i(surface.uSlope, 2);\r
      const yaw = state.turn.x;\r
      const pitch = state.turn.y;\r
      const cy = Math.cos(yaw);\r
      const sy = Math.sin(yaw);\r
      const cp = Math.cos(pitch);\r
      const sp = Math.sin(pitch);\r
      turnMatrix[0] = cy;\r
      turnMatrix[1] = sy * sp;\r
      turnMatrix[2] = -sy * cp;\r
      turnMatrix[3] = 0;\r
      turnMatrix[4] = cp;\r
      turnMatrix[5] = sp;\r
      turnMatrix[6] = sy;\r
      turnMatrix[7] = -cy * sp;\r
      turnMatrix[8] = cy * cp;\r
      gl.uniformMatrix3fv(surface.uTurn, false, turnMatrix);\r
      gl.uniform3f(surface.uColor, state.color[0], state.color[1], state.color[2]);\r
      gl.uniform1f(surface.uPaintMix, s.src && s.imageColors ? 1 : 0);\r
      gl.uniform1f(surface.uMaterial, s.material);\r
      gl.uniform1f(surface.uLight, s.light ? 1 : 0);\r
      gl.uniform1f(surface.uInflate, s.inflate);\r
      gl.uniform1f(surface.uClock, state.clock);\r
      gl.uniform4fv(surface.uParts, partData);\r
      gl.drawElements(gl.TRIANGLES, mesh.indices, mesh.indexType, 0);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!alive || !visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
\r
      if (reduce || !s.intro) state.clock = 10;\r
      else if (state.ready && state.clock < 10) state.clock = state.clock + dt > 1.8 ? 10 : state.clock + dt;\r
\r
      const hover = state.hover;\r
      const pointer = state.pointer;\r
      const pressing =\r
        state.ready && (pointer.dragging || (pointer.inside && !pointer.down && onSurface(pointer.x, pointer.y)));\r
      const follow = 1 - Math.exp(-dt / 0.05);\r
      const nextX = hover.x + (pointer.x - hover.x) * follow;\r
      const nextY = hover.y + (pointer.y - hover.y) * follow;\r
      const blend = 1 - Math.exp(-dt / 0.04);\r
      hover.vx += ((nextX - hover.x) / Math.max(dt, 0.001) - hover.vx) * blend;\r
      hover.vy += ((nextY - hover.y) / Math.max(dt, 0.001) - hover.vy) * blend;\r
      hover.x = nextX;\r
      hover.y = nextY;\r
      const goal = pressing ? 1 : 0;\r
      hover.power += (goal - hover.power) * (1 - Math.exp(-dt / (pressing ? 0.12 : 0.25)));\r
\r
      const turn = state.turn;\r
      const aimX = pointer.inside && !reduce ? (pointer.x / Math.max(1, mesh.width) - 0.5) * 0.7 : 0;\r
      const aimY = pointer.inside && !reduce ? (pointer.y / Math.max(1, mesh.height) - 0.5) * 0.4 : 0;\r
      turn.vx += (28 * (aimX - turn.x) - 10 * turn.vx) * dt;\r
      turn.vy += (28 * (aimY - turn.y) - 10 * turn.vy) * dt;\r
      turn.x += turn.vx * dt;\r
      turn.y += turn.vy * dt;\r
      const turning =\r
        Math.abs(aimX - turn.x) > 0.0005 ||\r
        Math.abs(aimY - turn.y) > 0.0005 ||\r
        Math.abs(turn.vx) > 0.001 ||\r
        Math.abs(turn.vy) > 0.001;\r
\r
      let energy = 0;\r
      if (state.ready) {\r
        updateGrip(s);\r
        state.accumulator += dt;\r
        let steps = 0;\r
        while (state.accumulator >= STEP && steps < 40) {\r
          energy = solve(STEP, s);\r
          state.accumulator -= STEP;\r
          steps++;\r
        }\r
        if (steps === 40) state.accumulator = 0;\r
        writeDynamic();\r
      }\r
      state.energy = energy;\r
      render();\r
\r
      const settling =\r
        !state.ready ||\r
        state.clock < 10 ||\r
        Math.abs(goal - hover.power) > 0.002 ||\r
        turning ||\r
        Math.hypot(pointer.x - hover.x, pointer.y - hover.y) > 0.1 ||\r
        pointer.dragging ||\r
        energy > 0.05 * Math.max(1, mesh.activeCount);\r
      if (settling) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!raf && alive && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const locatePointer = event => {\r
      const rect = container.getBoundingClientRect();\r
      state.pointer.x = event.clientX - rect.left;\r
      state.pointer.y = event.clientY - rect.top;\r
      state.pointer.inside =\r
        state.pointer.x >= 0 && state.pointer.y >= 0 && state.pointer.x <= rect.width && state.pointer.y <= rect.height;\r
    };\r
\r
    const onPointerMove = event => {\r
      locatePointer(event);\r
      wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      locatePointer(event);\r
      if (!state.ready || !onSurface(state.pointer.x, state.pointer.y)) return;\r
      const s = settingsRef.current;\r
      state.pointer.down = true;\r
      state.pointer.startX = state.pointer.x;\r
      state.pointer.startY = state.pointer.y;\r
      state.pointer.startTime = performance.now();\r
      state.pointer.dragging = grab(state.pointer.x, state.pointer.y, s);\r
      container.setPointerCapture?.(event.pointerId);\r
      wake();\r
    };\r
\r
    const onPointerUp = event => {\r
      if (!state.pointer.down) return;\r
      locatePointer(event);\r
      const s = settingsRef.current;\r
      const moved = Math.hypot(state.pointer.x - state.pointer.startX, state.pointer.y - state.pointer.startY);\r
      const quick = performance.now() - state.pointer.startTime < 260;\r
      release();\r
      if (moved < 8 && quick) poke(state.pointer.x, state.pointer.y, s);\r
      state.pointer.down = false;\r
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
    container.addEventListener('pointerdown', onPointerDown);\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerup', onPointerUp);\r
    window.addEventListener('pointercancel', onPointerUp);\r
    container.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
\r
    contentRef.current = () => {\r
      state.ready = false;\r
      state.clock = settingsRef.current.intro && !reduce ? 0 : 10;\r
      rasterize();\r
    };\r
    wakeRef.current = () => {\r
      if (!raf) render();\r
      wake();\r
    };\r
\r
    return () => {\r
      alive = false;\r
      state.buildToken++;\r
      cancelAnimationFrame(raf);\r
      window.clearTimeout(resizeTimer);\r
      wakeRef.current = null;\r
      contentRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      container.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerup', onPointerUp);\r
      window.removeEventListener('pointercancel', onPointerUp);\r
      container.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteBuffer(restBuffer);\r
      gl.deleteBuffer(dynamicBuffer);\r
      gl.deleteBuffer(indexBuffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteTexture(fieldTexture);\r
      gl.deleteTexture(paintTexture);\r
      gl.deleteTexture(slopeTexture);\r
      gl.deleteProgram(surfaceProgram);\r
      gl.deleteProgram(shadowProgram);\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    if (builtRef.current === contentKey) return;\r
    builtRef.current = contentKey;\r
    contentRef.current?.();\r
  }, [contentKey]);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div\r
      ref={containerRef}\r
      className={\`elastic-mesh\${className ? \` \${className}\` : ''}\`}\r
      style={style}\r
      role="img"\r
      aria-label={settings.src ? 'Elastic logo' : settings.text}\r
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className="elastic-mesh-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default ElasticMesh;\r
`,n=`.elastic-mesh {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
  touch-action: pan-y;\r
  user-select: none;\r
  -webkit-user-select: none;\r
}\r
\r
.elastic-mesh-canvas {\r
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
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
in vec2 aRest;\r
in vec4 aStrain;\r
in vec3 aDent;\r
uniform vec2 uViewport;\r
uniform vec2 uOffset;\r
out vec2 vRest;\r
out vec4 vStrain;\r
out vec3 vDent;\r
void main() {\r
  vRest = aRest;\r
  vStrain = aStrain;\r
  vDent = aDent;\r
  vec2 clip = (aPosition + uOffset) / uViewport * 2.0 - 1.0;\r
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);\r
}\`;\r
\r
const SHADOW = \`#version 300 es\r
precision highp float;\r
in vec2 vRest;\r
in vec4 vStrain;\r
in vec3 vDent;\r
uniform sampler2D uField;\r
uniform vec3 uShadowColor;\r
uniform float uShadow;\r
uniform vec4 uParts[64];\r
uniform float uClock;\r
\r
float arrival(float delay) {\r
  float t = max(uClock - delay, 0.0);\r
  float omega = 15.0;\r
  float zeta = 0.38;\r
  float damped = omega * sqrt(1.0 - zeta * zeta);\r
  return 1.0 - exp(-zeta * omega * t) * (cos(damped * t) + zeta * omega / damped * sin(damped * t));\r
}\r
\r
float owner(vec2 rest) {\r
  ivec2 size = textureSize(uField, 0);\r
  ivec2 texel = clamp(ivec2(rest * vec2(size)), ivec2(0), size - 1);\r
  return floor(texelFetch(uField, texel, 0).w + 0.5);\r
}\r
\r
vec3 settle(vec2 rest) {\r
  if (uClock > 9.0) return vec3(rest, 1.0);\r
  float id = owner(rest);\r
  if (id < 0.5 || id > 64.5) return vec3(rest, 1.0);\r
  vec4 part = uParts[int(id) - 1];\r
  float presence = arrival(part.z);\r
  float size = max(mix(0.5, 1.0, presence), 0.05);\r
  vec2 moved = part.xy + (rest - part.xy) / size;\r
  return vec3(moved, presence * step(abs(owner(moved) - id), 0.5));\r
}\r
out vec4 outColor;\r
void main() {\r
  vec3 arrived = settle(vRest);\r
  float shade = texture(uField, arrived.xy).z * uShadow * clamp(arrived.z, 0.0, 1.0) * (1.0 - 0.35 * clamp(vDent.x, 0.0, 1.0));\r
  outColor = vec4(uShadowColor * shade, shade);\r
}\`;\r
\r
const SURFACE = \`#version 300 es\r
precision highp float;\r
in vec2 vRest;\r
in vec4 vStrain;\r
in vec3 vDent;\r
uniform sampler2D uField;\r
uniform sampler2D uSlope;\r
uniform sampler2D uPaint;\r
uniform vec3 uColor;\r
uniform float uPaintMix;\r
uniform float uMaterial;\r
uniform float uLight;\r
uniform float uInflate;\r
uniform mat3 uTurn;\r
uniform vec4 uParts[64];\r
uniform float uClock;\r
out vec4 outColor;\r
\r
float arrival(float delay) {\r
  float t = max(uClock - delay, 0.0);\r
  float omega = 15.0;\r
  float zeta = 0.38;\r
  float damped = omega * sqrt(1.0 - zeta * zeta);\r
  return 1.0 - exp(-zeta * omega * t) * (cos(damped * t) + zeta * omega / damped * sin(damped * t));\r
}\r
\r
float owner(vec2 rest) {\r
  ivec2 size = textureSize(uField, 0);\r
  ivec2 texel = clamp(ivec2(rest * vec2(size)), ivec2(0), size - 1);\r
  return floor(texelFetch(uField, texel, 0).w + 0.5);\r
}\r
\r
vec3 settle(vec2 rest) {\r
  if (uClock > 9.0) return vec3(rest, 1.0);\r
  float id = owner(rest);\r
  if (id < 0.5 || id > 64.5) return vec3(rest, 1.0);\r
  vec4 part = uParts[int(id) - 1];\r
  float presence = arrival(part.z);\r
  float size = max(mix(0.5, 1.0, presence), 0.05);\r
  vec2 moved = part.xy + (rest - part.xy) / size;\r
  return vec3(moved, presence * step(abs(owner(moved) - id), 0.5));\r
}\r
vec4 cubic(float v) {\r
  vec4 n = vec4(1.0, 2.0, 3.0, 4.0) - v;\r
  vec4 s = n * n * n;\r
  float x = s.x;\r
  float y = s.y - 4.0 * s.x;\r
  float z = s.z - 4.0 * s.y + 6.0 * s.x;\r
  return vec4(x, y, z, 6.0 - x - y - z) / 6.0;\r
}\r
\r
vec2 smoothSlope(vec2 uv) {\r
  vec2 size = vec2(textureSize(uSlope, 0));\r
  vec2 cell = uv * size - 0.5;\r
  vec2 f = fract(cell);\r
  cell -= f;\r
  vec4 xc = cubic(f.x);\r
  vec4 yc = cubic(f.y);\r
  vec4 corner = cell.xxyy + vec2(-0.5, 1.5).xyxy;\r
  vec4 sum = vec4(xc.xz + xc.yw, yc.xz + yc.yw);\r
  vec4 offset = (corner + vec4(xc.yw, yc.yw) / sum) / size.xxyy;\r
  vec2 a = texture(uSlope, offset.xz).xy;\r
  vec2 b = texture(uSlope, offset.yz).xy;\r
  vec2 c = texture(uSlope, offset.xw).xy;\r
  vec2 d = texture(uSlope, offset.yw).xy;\r
  float sx = sum.x / (sum.x + sum.y);\r
  float sy = sum.z / (sum.z + sum.w);\r
  return mix(mix(d, c, sx), mix(b, a, sx), sy);\r
}\r
\r
float panel(vec3 r, vec3 center, vec2 size, float soft) {\r
  vec3 forward = normalize(center);\r
  vec3 side = normalize(cross(vec3(0.0, 1.0, 0.0), forward));\r
  vec3 lift = cross(forward, side);\r
  float facing = dot(r, forward);\r
  vec2 local = vec2(dot(r, side), dot(r, lift)) / max(facing, 0.1);\r
  vec2 q = abs(local) - size;\r
  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);\r
  return smoothstep(soft, -soft, d) * smoothstep(0.05, 0.3, facing);\r
}\r
\r
vec3 studio(vec3 r, float blur) {\r
  float y = r.y;\r
  vec3 skyLow = mix(vec3(0.92, 0.95, 1.0), vec3(1.0), uLight);\r
  vec3 skyHigh = mix(vec3(0.1, 0.11, 0.14), vec3(0.62, 0.64, 0.7), uLight);\r
  vec3 groundNear = mix(vec3(0.12, 0.11, 0.1), vec3(0.3, 0.29, 0.28), uLight);\r
  vec3 groundFar = mix(vec3(0.005), vec3(0.1), uLight);\r
  vec3 sky = mix(skyLow, skyHigh, smoothstep(0.0, 0.75, y));\r
  vec3 ground = mix(groundNear, groundFar, smoothstep(0.0, -0.4, y));\r
  float edge = 0.004 + blur;\r
  vec3 c = mix(ground, sky, smoothstep(-edge, edge, y));\r
  float glow = 0.035 + blur;\r
  c += vec3(2.2) * exp(-pow((y - 0.02) / glow, 2.0)) * (0.035 / glow);\r
  c += vec3(7.0) * panel(r, vec3(-0.55, 0.55, 0.62), vec2(0.36, 0.2), 0.025 + blur);\r
  c += vec3(4.5) * panel(r, vec3(0.9, 0.18, 0.4), vec2(0.045, 0.85), 0.01 + blur) * (0.045 / (0.045 + blur));\r
  c += vec3(3.2) * panel(r, vec3(-0.95, 0.1, 0.32), vec2(0.035, 0.7), 0.01 + blur) * (0.035 / (0.035 + blur));\r
  c += vec3(2.4) * panel(r, vec3(0.0, 0.92, 0.38), vec2(1.1, 0.045), 0.01 + blur) * (0.045 / (0.045 + blur));\r
  return c;\r
}\r
\r
vec3 tone(vec3 x) {\r
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);\r
}\r
\r
void main() {\r
  vec3 arrived = settle(vRest);\r
  vec2 rest = arrived.xy;\r
  float presence = arrived.z;\r
  vec4 field = texture(uField, rest);\r
  float edge = field.y;\r
  float edgeWidth = max(fwidth(edge), 0.0001);\r
  if (edge < -3.0 * edgeWidth || presence <= 0.001) discard;\r
  float cover = clamp(edge / edgeWidth + 0.5, 0.0, 1.0);\r
\r
  vec2 slope = smoothSlope(rest);\r
  mat2 strain = mat2(vStrain.xy, vStrain.zw);\r
  float area = max(determinant(strain), 0.2);\r
  float lift = uInflate * presence * inversesqrt(area);\r
  float keep = clamp(1.0 - vDent.x, 0.15, 1.6);\r
  vec2 restGradient = (slope * keep - field.x * vDent.yz) * lift;\r
  vec2 gradient = inverse(transpose(strain)) * restGradient;\r
  vec3 normal = normalize(vec3(-gradient.x, gradient.y, 1.0));\r
  float depth = field.x * keep * lift;\r
\r
  vec3 turned = uTurn * normal;\r
  vec3 reflected = uTurn * reflect(vec3(0.0, 0.0, -1.0), normal);\r
  float footprint = length(fwidth(reflected));\r
  float facing = max(normal.z, 0.0);\r
  float fresnel = pow(1.0 - facing, 5.0);\r
  vec3 lightDir = normalize(vec3(-0.5, 0.62, 0.62));\r
  float wrap = max((dot(turned, lightDir) + 0.45) / 1.45, 0.0);\r
  float key = max(dot(turned, lightDir), 0.0);\r
  float occlusion = mix(0.55, 1.0, smoothstep(0.0, 12.0, depth));\r
\r
  vec3 paint = texture(uPaint, rest).rgb;\r
  vec3 base = mix(uColor, paint, uPaintMix);\r
  vec3 color;\r
  if (uMaterial < 0.5) {\r
    vec3 env = studio(reflected, 0.04 + footprint * 0.6);\r
    float reflectance = 0.045 + 0.955 * fresnel;\r
    vec3 deep = base * base * 0.55;\r
    vec3 body = mix(deep, base * 1.08, wrap) * occlusion;\r
    body += base * pow(1.0 - facing, 2.0) * 0.18;\r
    color = body * (1.0 - reflectance) + tone(env * reflectance * 0.9);\r
  } else if (uMaterial < 1.5) {\r
    vec3 env = studio(reflected, footprint * 0.6);\r
    vec3 tint = mix(vec3(1.0), base, 0.6) * 0.92;\r
    vec3 reflectance = tint + (1.0 - tint) * fresnel;\r
    color = tone(env * reflectance * mix(0.55, 1.0, occlusion) * 1.1);\r
  } else if (uMaterial < 2.5) {\r
    vec3 env = studio(reflected, 0.03 + footprint * 0.6);\r
    float core = smoothstep(0.0, 1.0, facing);\r
    vec3 glow = mix(base * base * 0.35, min(base * 1.45 + 0.08, vec3(1.0)), core * core);\r
    vec3 body = glow * mix(0.7, 1.0, occlusion) + base * wrap * 0.18;\r
    float reflectance = 0.03 + 0.97 * fresnel;\r
    color = body * (1.0 - reflectance) + tone(env * reflectance * 0.85);\r
  } else {\r
    vec3 env = studio(reflected, 0.35 + footprint * 0.6);\r
    vec3 body = base * (0.3 + 0.7 * wrap) * mix(0.68, 1.0, occlusion);\r
    body += base * key * 0.12;\r
    color = body + tone(env * (0.012 + 0.18 * fresnel)) * 0.5;\r
  }\r
  float alpha = cover * smoothstep(0.0, 0.18, presence);\r
  outColor = vec4(color * alpha, alpha);\r
}\`;\r
\r
const MATERIALS = { balloon: 0, chrome: 1, jelly: 2, clay: 3 };\r
const MAX_FIELD = 720;\r
const MAX_NODES = 5200;\r
const STEP = 1 / 480;\r
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
  gl.bindAttribLocation(program, 1, 'aRest');\r
  gl.bindAttribLocation(program, 2, 'aStrain');\r
  gl.bindAttribLocation(program, 3, 'aDent');\r
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
const distance1d = (f, n, d, v, z) => {\r
  let k = 0;\r
  v[0] = 0;\r
  z[0] = -Infinity;\r
  z[1] = Infinity;\r
  for (let q = 1; q < n; q++) {\r
    let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);\r
    while (s <= z[k]) {\r
      k--;\r
      s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);\r
    }\r
    k++;\r
    v[k] = q;\r
    z[k] = s;\r
    z[k + 1] = Infinity;\r
  }\r
  k = 0;\r
  for (let q = 0; q < n; q++) {\r
    while (z[k + 1] < q) k++;\r
    d[q] = (q - v[k]) * (q - v[k]) + f[v[k]];\r
  }\r
};\r
\r
const distanceField = (grid, width, height) => {\r
  const n = Math.max(width, height);\r
  const f = new Float64Array(n);\r
  const d = new Float64Array(n);\r
  const v = new Int32Array(n);\r
  const z = new Float64Array(n + 1);\r
  for (let x = 0; x < width; x++) {\r
    for (let y = 0; y < height; y++) f[y] = grid[y * width + x];\r
    distance1d(f, height, d, v, z);\r
    for (let y = 0; y < height; y++) grid[y * width + x] = d[y];\r
  }\r
  for (let y = 0; y < height; y++) {\r
    for (let x = 0; x < width; x++) f[x] = grid[y * width + x];\r
    distance1d(f, width, d, v, z);\r
    for (let x = 0; x < width; x++) grid[y * width + x] = Math.sqrt(d[x]);\r
  }\r
  return grid;\r
};\r
\r
const nearestLabels = (labels, width, height) => {\r
  const far = 1e20;\r
  const column = new Float64Array(width * height);\r
  const site = new Int32Array(width * height);\r
  for (let x = 0; x < width; x++) {\r
    let last = -1;\r
    for (let y = 0; y < height; y++) {\r
      const i = y * width + x;\r
      if (labels[i]) last = y;\r
      site[i] = last;\r
      column[i] = last >= 0 ? (y - last) * (y - last) : far;\r
    }\r
    last = -1;\r
    for (let y = height - 1; y >= 0; y--) {\r
      const i = y * width + x;\r
      if (labels[i]) last = y;\r
      if (last >= 0 && (last - y) * (last - y) < column[i]) {\r
        column[i] = (last - y) * (last - y);\r
        site[i] = last;\r
      }\r
    }\r
  }\r
  const out = new Float32Array(width * height);\r
  const f = new Float64Array(width);\r
  const v = new Int32Array(width);\r
  const z = new Float64Array(width + 1);\r
  for (let y = 0; y < height; y++) {\r
    for (let x = 0; x < width; x++) f[x] = column[y * width + x];\r
    let k = 0;\r
    v[0] = 0;\r
    z[0] = -Infinity;\r
    z[1] = Infinity;\r
    for (let q = 1; q < width; q++) {\r
      let cut = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);\r
      while (cut <= z[k]) {\r
        k--;\r
        cut = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);\r
      }\r
      k++;\r
      v[k] = q;\r
      z[k] = cut;\r
      z[k + 1] = Infinity;\r
    }\r
    k = 0;\r
    for (let x = 0; x < width; x++) {\r
      while (z[k + 1] < x) k++;\r
      const sx = v[k];\r
      const sy = site[y * width + sx];\r
      out[y * width + x] = sy >= 0 ? labels[sy * width + sx] : 0;\r
    }\r
  }\r
  return out;\r
};\r
\r
const inflateField = (mask, width, height) => {\r
  const levels = [{ width, height, mask }];\r
  while (Math.max(levels[levels.length - 1].width, levels[levels.length - 1].height) > 48) {\r
    const prev = levels[levels.length - 1];\r
    const w = Math.ceil(prev.width / 2);\r
    const h = Math.ceil(prev.height / 2);\r
    const next = new Float32Array(w * h);\r
    for (let y = 0; y < h; y++) {\r
      for (let x = 0; x < w; x++) {\r
        let sum = 0;\r
        let count = 0;\r
        for (let dy = 0; dy < 2; dy++) {\r
          for (let dx = 0; dx < 2; dx++) {\r
            const sx = x * 2 + dx;\r
            const sy = y * 2 + dy;\r
            if (sx < prev.width && sy < prev.height) {\r
              sum += prev.mask[sy * prev.width + sx];\r
              count++;\r
            }\r
          }\r
        }\r
        next[y * w + x] = sum / count;\r
      }\r
    }\r
    levels.push({ width: w, height: h, mask: next });\r
  }\r
\r
  let solution = null;\r
  for (let level = levels.length - 1; level >= 0; level--) {\r
    const { width: w, height: h, mask: m } = levels[level];\r
    const current = new Float32Array(w * h);\r
    if (solution) {\r
      const pw = levels[level + 1].width;\r
      const ph = levels[level + 1].height;\r
      for (let y = 0; y < h; y++) {\r
        for (let x = 0; x < w; x++) {\r
          const fx = clamp((x + 0.5) / 2 - 0.5, 0, pw - 1);\r
          const fy = clamp((y + 0.5) / 2 - 0.5, 0, ph - 1);\r
          const x0 = Math.floor(fx);\r
          const y0 = Math.floor(fy);\r
          const x1 = Math.min(pw - 1, x0 + 1);\r
          const y1 = Math.min(ph - 1, y0 + 1);\r
          const tx = fx - x0;\r
          const ty = fy - y0;\r
          const top = solution[y0 * pw + x0] * (1 - tx) + solution[y0 * pw + x1] * tx;\r
          const bottom = solution[y1 * pw + x0] * (1 - tx) + solution[y1 * pw + x1] * tx;\r
          current[y * w + x] = top * (1 - ty) + bottom * ty;\r
        }\r
      }\r
    }\r
    const source = 4 ** level;\r
    const iterations = level === levels.length - 1 ? 300 : 60;\r
    for (let iteration = 0; iteration < iterations; iteration++) {\r
      for (let y = 0; y < h; y++) {\r
        for (let x = 0; x < w; x++) {\r
          const i = y * w + x;\r
          if (m[i] < 0.5) {\r
            current[i] = 0;\r
            continue;\r
          }\r
          const l = x > 0 ? current[i - 1] : 0;\r
          const r = x < w - 1 ? current[i + 1] : 0;\r
          const u = y > 0 ? current[i - w] : 0;\r
          const d = y < h - 1 ? current[i + w] : 0;\r
          current[i] += ((l + r + u + d + source) * 0.25 - current[i]) * 1.85;\r
        }\r
      }\r
    }\r
    solution = current;\r
  }\r
  return solution;\r
};\r
\r
const blurField = (source, width, height, radius) => {\r
  const r = Math.max(1, Math.round(radius));\r
  const sigma = r / 2.5;\r
  const kernel = [];\r
  let total = 0;\r
  for (let i = -r; i <= r; i++) {\r
    const weight = Math.exp(-(i * i) / (2 * sigma * sigma));\r
    kernel.push(weight);\r
    total += weight;\r
  }\r
  for (let i = 0; i < kernel.length; i++) kernel[i] /= total;\r
  const temp = new Float32Array(width * height);\r
  const out = new Float32Array(width * height);\r
  for (let y = 0; y < height; y++) {\r
    for (let x = 0; x < width; x++) {\r
      let sum = 0;\r
      for (let i = -r; i <= r; i++) sum += source[y * width + clamp(x + i, 0, width - 1)] * kernel[i + r];\r
      temp[y * width + x] = sum;\r
    }\r
  }\r
  for (let y = 0; y < height; y++) {\r
    for (let x = 0; x < width; x++) {\r
      let sum = 0;\r
      for (let i = -r; i <= r; i++) sum += temp[clamp(y + i, 0, height - 1) * width + x] * kernel[i + r];\r
      out[y * width + x] = sum;\r
    }\r
  }\r
  return out;\r
};\r
\r
const ElasticMesh = ({\r
  text = 'Squish',\r
  src = '',\r
  fontFamily = 'system-ui, sans-serif',\r
  fontWeight = 900,\r
  color = '#3b5bff',\r
  imageColors = true,\r
  material = 'balloon',\r
  inflate = 1,\r
  stiffness = 0.5,\r
  wobble = 0.6,\r
  grabRadius = 70,\r
  stretch = 0.5,\r
  press = 0.5,\r
  shadow = 0.5,\r
  intro = true,\r
  theme = 'dark',\r
  dpr,\r
  className = '',\r
  style,\r
  ...rest\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const contentRef = useRef(null);\r
  const settings = {\r
    text: String(text),\r
    src: String(src || ''),\r
    fontFamily: String(fontFamily),\r
    fontWeight,\r
    color: String(color),\r
    imageColors,\r
    material: MATERIALS[material] ?? 0,\r
    inflate: clamp(inflate, 0.1, 3),\r
    stiffness: clamp(stiffness, 0, 1),\r
    wobble: clamp(wobble, 0, 1),\r
    grabRadius: clamp(grabRadius, 10, 400),\r
    stretch: clamp(stretch, 0, 1),\r
    press: clamp(press, 0, 1),\r
    shadow: clamp(shadow, 0, 1),\r
    intro,\r
    light: theme === 'light',\r
    dpr\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
  const contentKey = \`\${settings.text}|\${settings.src}|\${settings.fontFamily}|\${settings.fontWeight}\`;\r
  const builtRef = useRef(contentKey);\r
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
    const surfaceProgram = link(gl, SURFACE);\r
    const shadowProgram = link(gl, SHADOW);\r
    if (!surfaceProgram || !shadowProgram) return undefined;\r
    const surface = locate(gl, surfaceProgram, [\r
      'uViewport',\r
      'uOffset',\r
      'uField',\r
      'uPaint',\r
      'uSlope',\r
      'uColor',\r
      'uPaintMix',\r
      'uMaterial',\r
      'uLight',\r
      'uInflate',\r
      'uTurn',\r
      'uClock',\r
      'uParts'\r
    ]);\r
    const shade = locate(gl, shadowProgram, [\r
      'uViewport',\r
      'uOffset',\r
      'uField',\r
      'uShadowColor',\r
      'uShadow',\r
      'uClock',\r
      'uParts'\r
    ]);\r
\r
    const fieldTexture = gl.createTexture();\r
    const paintTexture = gl.createTexture();\r
    const slopeTexture = gl.createTexture();\r
    for (const texture of [fieldTexture, paintTexture, slopeTexture]) {\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));\r
    }\r
\r
    const vao = gl.createVertexArray();\r
    const restBuffer = gl.createBuffer();\r
    const dynamicBuffer = gl.createBuffer();\r
    const indexBuffer = gl.createBuffer();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, restBuffer);\r
    gl.enableVertexAttribArray(1);\r
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, dynamicBuffer);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 36, 0);\r
    gl.enableVertexAttribArray(2);\r
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 36, 8);\r
    gl.enableVertexAttribArray(3);\r
    gl.vertexAttribPointer(3, 3, gl.FLOAT, false, 36, 24);\r
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);\r
    gl.bindVertexArray(null);\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const partData = new Float32Array(256);\r
    const turnMatrix = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);\r
    const mesh = {\r
      cols: 0,\r
      rows: 0,\r
      spacing: 1,\r
      count: 0,\r
      indices: 0,\r
      restX: new Float32Array(0),\r
      restY: new Float32Array(0),\r
      x: new Float32Array(0),\r
      y: new Float32Array(0),\r
      vx: new Float32Array(0),\r
      vy: new Float32Array(0),\r
      dent: new Float32Array(0),\r
      dentV: new Float32Array(0),\r
      grip: new Float32Array(0),\r
      gripX: new Float32Array(0),\r
      gripY: new Float32Array(0),\r
      active: new Uint8Array(0),\r
      neighbors: new Int32Array(0),\r
      dynamic: new Float32Array(0),\r
      anchorX: new Float32Array(0),\r
      anchorY: new Float32Array(0),\r
      indexType: gl.UNSIGNED_SHORT,\r
      activeCount: 0,\r
      width: 1,\r
      height: 1\r
    };\r
    const state = {\r
      width: 1,\r
      height: 1,\r
      ready: false,\r
      fieldWidth: 1,\r
      fieldHeight: 1,\r
      fieldScale: 1,\r
      sdf: new Float32Array(0),\r
      parts: [],\r
      clock: settingsRef.current.intro && !reduce ? 0 : 10,\r
      colorKey: '',\r
      color: [0.31, 0.42, 1],\r
      pointer: { x: 0, y: 0, inside: false, down: false, startX: 0, startY: 0, startTime: 0, dragging: false },\r
      hover: { x: 0, y: 0, vx: 0, vy: 0, power: 0 },\r
      turn: { x: 0, y: 0, vx: 0, vy: 0 },\r
      accumulator: 0,\r
      energy: 1,\r
      buildToken: 0\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let alive = true;\r
    let resizeTimer = 0;\r
\r
    const toRgb = value => {\r
      if (!probe || !value) return [0.31, 0.42, 1];\r
      probe.fillStyle = '#000000';\r
      probe.fillStyle = /^[0-9a-f]{3,8}$/i.test(value) ? \`#\${value}\` : value;\r
      probe.fillRect(0, 0, 1, 1);\r
      const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
      return [r / 255, g / 255, b / 255];\r
    };\r
\r
    const sampleSdf = (px, py) => {\r
      const fx = clamp(Math.round(px * state.fieldScale), 0, state.fieldWidth - 1);\r
      const fy = clamp(Math.round(py * state.fieldScale), 0, state.fieldHeight - 1);\r
      return state.sdf[fy * state.fieldWidth + fx] || -1e6;\r
    };\r
\r
    const buildMesh = () => {\r
      const { width, height } = state;\r
      const spacing = Math.max(7, Math.sqrt((width * height) / MAX_NODES));\r
      const cols = Math.ceil(width / spacing) + 1;\r
      const rows = Math.ceil(height / spacing) + 1;\r
      const count = cols * rows;\r
      const sx = width / (cols - 1);\r
      const sy = height / (rows - 1);\r
      mesh.cols = cols;\r
      mesh.rows = rows;\r
      mesh.width = width;\r
      mesh.height = height;\r
      mesh.spacing = (sx + sy) / 2;\r
      mesh.count = count;\r
      mesh.restX = new Float32Array(count);\r
      mesh.restY = new Float32Array(count);\r
      mesh.x = new Float32Array(count);\r
      mesh.y = new Float32Array(count);\r
      mesh.vx = new Float32Array(count);\r
      mesh.vy = new Float32Array(count);\r
      mesh.dent = new Float32Array(count);\r
      mesh.dentV = new Float32Array(count);\r
      mesh.grip = new Float32Array(count);\r
      mesh.gripX = new Float32Array(count);\r
      mesh.gripY = new Float32Array(count);\r
      mesh.active = new Uint8Array(count);\r
      mesh.dynamic = new Float32Array(count * 9);\r
      const rest = new Float32Array(count * 2);\r
      const reach = -2.5 * mesh.spacing;\r
      for (let j = 0; j < rows; j++) {\r
        for (let i = 0; i < cols; i++) {\r
          const k = j * cols + i;\r
          const px = i * sx;\r
          const py = j * sy;\r
          mesh.restX[k] = px;\r
          mesh.restY[k] = py;\r
          mesh.x[k] = px;\r
          mesh.y[k] = py;\r
          rest[k * 2] = px / width;\r
          rest[k * 2 + 1] = py / height;\r
          mesh.active[k] = state.ready && sampleSdf(px, py) > reach ? 1 : 0;\r
        }\r
      }\r
      const neighbors = new Int32Array(count * 8).fill(-1);\r
      const offsets = [\r
        [-1, 0],\r
        [1, 0],\r
        [0, -1],\r
        [0, 1],\r
        [-1, -1],\r
        [1, -1],\r
        [-1, 1],\r
        [1, 1]\r
      ];\r
      for (let j = 0; j < rows; j++) {\r
        for (let i = 0; i < cols; i++) {\r
          const k = j * cols + i;\r
          if (!mesh.active[k]) continue;\r
          offsets.forEach(([di, dj], n) => {\r
            const ni = i + di;\r
            const nj = j + dj;\r
            if (ni < 0 || nj < 0 || ni >= cols || nj >= rows) return;\r
            const nk = nj * cols + ni;\r
            if (mesh.active[nk]) neighbors[k * 8 + n] = nk;\r
          });\r
        }\r
      }\r
      mesh.neighbors = neighbors;\r
      mesh.activeCount = mesh.active.reduce((total, flag) => total + flag, 0);\r
      const margin = -(Math.min(width, height) * 0.14 + mesh.spacing * 3);\r
      const near = new Uint8Array(count);\r
      for (let k = 0; k < count; k++) near[k] = state.ready && sampleSdf(mesh.restX[k], mesh.restY[k]) > margin ? 1 : 0;\r
      const quads = [];\r
      for (let j = 0; j < rows - 1; j++) {\r
        for (let i = 0; i < cols - 1; i++) {\r
          const a = j * cols + i;\r
          const b = a + 1;\r
          const c = a + cols;\r
          const d = c + 1;\r
          if (near[a] || near[b] || near[c] || near[d]) quads.push(a, c, b, b, c, d);\r
        }\r
      }\r
      const indexData = count > 65535 ? new Uint32Array(quads) : new Uint16Array(quads);\r
      mesh.indexType = count > 65535 ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;\r
      mesh.indices = quads.length;\r
      gl.bindBuffer(gl.ARRAY_BUFFER, restBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, rest, gl.STATIC_DRAW);\r
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);\r
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexData, gl.STATIC_DRAW);\r
      writeDynamic();\r
    };\r
\r
    const writeDynamic = () => {\r
      const { cols, rows, x, y, dent, dynamic, spacing } = mesh;\r
      const sx = mesh.width / Math.max(1, cols - 1);\r
      const sy = mesh.height / Math.max(1, rows - 1);\r
      for (let j = 0; j < rows; j++) {\r
        for (let i = 0; i < cols; i++) {\r
          const k = j * cols + i;\r
          const l = i > 0 ? k - 1 : k;\r
          const r = i < cols - 1 ? k + 1 : k;\r
          const u = j > 0 ? k - cols : k;\r
          const d = j < rows - 1 ? k + cols : k;\r
          const spanX = (r - l) * sx || spacing;\r
          const spanY = ((d - u) / cols) * sy || spacing;\r
          const o = k * 9;\r
          dynamic[o] = x[k];\r
          dynamic[o + 1] = y[k];\r
          dynamic[o + 2] = (x[r] - x[l]) / spanX;\r
          dynamic[o + 3] = (y[r] - y[l]) / spanX;\r
          dynamic[o + 4] = (x[d] - x[u]) / spanY;\r
          dynamic[o + 5] = (y[d] - y[u]) / spanY;\r
          dynamic[o + 6] = dent[k];\r
          dynamic[o + 7] = (dent[r] - dent[l]) / spanX;\r
          dynamic[o + 8] = (dent[d] - dent[u]) / spanY;\r
        }\r
      }\r
      gl.bindBuffer(gl.ARRAY_BUFFER, dynamicBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, dynamic, gl.DYNAMIC_DRAW);\r
    };\r
\r
    const rasterize = async () => {\r
      const s = settingsRef.current;\r
      const token = ++state.buildToken;\r
      const { width, height } = state;\r
      const scale = Math.min(1, MAX_FIELD / Math.max(width, height));\r
      const fw = Math.max(8, Math.round(width * scale));\r
      const fh = Math.max(8, Math.round(height * scale));\r
      const canvas2d = document.createElement('canvas');\r
      canvas2d.width = fw;\r
      canvas2d.height = fh;\r
      const ctx = canvas2d.getContext('2d', { willReadFrequently: true });\r
      if (!ctx) return;\r
      let drawn = false;\r
      if (s.src) {\r
        const image = new Image();\r
        image.crossOrigin = 'anonymous';\r
        image.decoding = 'async';\r
        image.src = s.src;\r
        try {\r
          await image.decode();\r
        } catch {\r
          return;\r
        }\r
        if (token !== state.buildToken) return;\r
        const fit = Math.min((fw * 0.78) / image.naturalWidth, (fh * 0.74) / image.naturalHeight);\r
        const w = image.naturalWidth * fit;\r
        const h = image.naturalHeight * fit;\r
        ctx.drawImage(image, (fw - w) / 2, (fh - h) / 2, w, h);\r
        drawn = true;\r
      } else {\r
        const family = s.fontFamily;\r
        const weight = s.fontWeight;\r
        if (document.fonts) await document.fonts.load(\`\${weight} 100px \${family}\`).catch(() => null);\r
        if (token !== state.buildToken) return;\r
        const lines = s.text.split('\\n');\r
        ctx.font = \`\${weight} 100px \${family}\`;\r
        let widest = 1;\r
        let ascent = 0;\r
        let descent = 0;\r
        for (const line of lines) {\r
          const m = ctx.measureText(line || ' ');\r
          widest = Math.max(widest, m.actualBoundingBoxLeft + m.actualBoundingBoxRight);\r
          ascent = Math.max(ascent, m.actualBoundingBoxAscent);\r
          descent = Math.max(descent, m.actualBoundingBoxDescent);\r
        }\r
        const lineHeight = 100 * 1.02;\r
        const blockHeight = ascent + descent + lineHeight * (lines.length - 1);\r
        const size = Math.min((fw * 0.8) / widest, (fh * 0.7) / blockHeight) * 100;\r
        ctx.font = \`\${weight} \${size}px \${family}\`;\r
        ctx.fillStyle = '#ffffff';\r
        ctx.textAlign = 'center';\r
        ctx.textBaseline = 'alphabetic';\r
        const k = size / 100;\r
        const top = (fh - blockHeight * k) / 2 + ascent * k;\r
        lines.forEach((line, index) => {\r
          const m = ctx.measureText(line || ' ');\r
          const shift = (m.actualBoundingBoxLeft - m.actualBoundingBoxRight) / 2;\r
          ctx.fillText(line, fw / 2 + shift, top + index * lineHeight * k);\r
        });\r
        drawn = true;\r
      }\r
      if (!drawn || token !== state.buildToken) return;\r
\r
      const pixels = ctx.getImageData(0, 0, fw, fh).data;\r
      const count = fw * fh;\r
      const mask = new Float32Array(count);\r
      const inside = new Float64Array(count);\r
      const outside = new Float64Array(count);\r
      for (let i = 0; i < count; i++) {\r
        const a = pixels[i * 4 + 3] / 255;\r
        mask[i] = a;\r
        inside[i] = a > 0.5 ? 1e10 : 0;\r
        outside[i] = a > 0.5 ? 0 : 1e10;\r
      }\r
      distanceField(inside, fw, fh);\r
      distanceField(outside, fw, fh);\r
      const binary = new Float32Array(count);\r
      const signed = new Float32Array(count);\r
      for (let i = 0; i < count; i++) {\r
        binary[i] = mask[i] > 0.5 ? 1 : 0;\r
        signed[i] =\r
          mask[i] > 0.02 && mask[i] < 0.98 ? mask[i] - 0.5 : inside[i] > 0 ? inside[i] - 0.5 : 0.5 - outside[i];\r
      }\r
      const labels = new Int32Array(count);\r
      const parts = [];\r
      const queue = new Int32Array(count);\r
      for (let start = 0; start < count; start++) {\r
        if (!binary[start] || labels[start]) continue;\r
        const id = parts.length + 1;\r
        let head = 0;\r
        let tail = 0;\r
        let sumX = 0;\r
        let sumY = 0;\r
        let minX = Infinity;\r
        queue[tail++] = start;\r
        labels[start] = id;\r
        while (head < tail) {\r
          const i = queue[head++];\r
          const x = i % fw;\r
          const y = (i - x) / fw;\r
          sumX += x;\r
          sumY += y;\r
          if (x < minX) minX = x;\r
          if (x > 0 && binary[i - 1] && !labels[i - 1]) {\r
            labels[i - 1] = id;\r
            queue[tail++] = i - 1;\r
          }\r
          if (x < fw - 1 && binary[i + 1] && !labels[i + 1]) {\r
            labels[i + 1] = id;\r
            queue[tail++] = i + 1;\r
          }\r
          if (y > 0 && binary[i - fw] && !labels[i - fw]) {\r
            labels[i - fw] = id;\r
            queue[tail++] = i - fw;\r
          }\r
          if (y < fh - 1 && binary[i + fw] && !labels[i + fw]) {\r
            labels[i + fw] = id;\r
            queue[tail++] = i + fw;\r
          }\r
        }\r
        parts.push({ x: sumX / tail / scale, y: sumY / tail / scale, left: minX, size: tail, delay: 0 });\r
      }\r
      const order = [...parts].sort((a, b) => a.left - b.left);\r
      const gap = order.length > 1 ? Math.min(0.07, 0.5 / (order.length - 1)) : 0;\r
      order.forEach((part, rank) => {\r
        part.delay = rank * gap;\r
      });\r
      const owners = parts.length <= 64 ? nearestLabels(labels, fw, fh) : new Float32Array(count);\r
      const solution = blurField(inflateField(binary, fw, fh), fw, fh, 2);\r
      const edges = blurField(signed, fw, fh, 2);\r
      const shadowMask = blurField(binary, fw, fh, Math.max(4, Math.min(fw, fh) * 0.045));\r
      const field = new Float32Array(count * 4);\r
      const sdf = new Float32Array(count);\r
      const heights = new Float32Array(count);\r
      for (let i = 0; i < count; i++) {\r
        const distance = edges[i] / scale;\r
        sdf[i] = distance;\r
        heights[i] = Math.sqrt(Math.max(0, 2 * solution[i])) / scale;\r
        field[i * 4] = heights[i];\r
        field[i * 4 + 1] = distance;\r
        field[i * 4 + 2] = shadowMask[i];\r
        field[i * 4 + 3] = owners[i];\r
      }\r
      const slopes = new Float32Array(count * 2);\r
      for (let y = 0; y < fh; y++) {\r
        for (let x = 0; x < fw; x++) {\r
          const i = y * fw + x;\r
          let gx = (heights[y * fw + Math.min(fw - 1, x + 1)] - heights[y * fw + Math.max(0, x - 1)]) * 0.5 * scale;\r
          let gy = (heights[Math.min(fh - 1, y + 1) * fw + x] - heights[Math.max(0, y - 1) * fw + x]) * 0.5 * scale;\r
          const steep = Math.hypot(gx, gy);\r
          if (steep > 7) {\r
            gx *= 7 / steep;\r
            gy *= 7 / steep;\r
          }\r
          slopes[i * 2] = gx;\r
          slopes[i * 2 + 1] = gy;\r
        }\r
      }\r
      gl.bindTexture(gl.TEXTURE_2D, fieldTexture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, fw, fh, 0, gl.RGBA, gl.FLOAT, field);\r
      gl.bindTexture(gl.TEXTURE_2D, slopeTexture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG16F, fw, fh, 0, gl.RG, gl.FLOAT, slopes);\r
      gl.bindTexture(gl.TEXTURE_2D, paintTexture);\r
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas2d);\r
      state.fieldWidth = fw;\r
      state.fieldHeight = fh;\r
      state.fieldScale = scale;\r
      state.sdf = sdf;\r
      state.parts = parts;\r
      partData.fill(0);\r
      parts.slice(0, 64).forEach((part, index) => {\r
        partData[index * 4] = part.x / width;\r
        partData[index * 4 + 1] = part.y / height;\r
        partData[index * 4 + 2] = part.delay;\r
      });\r
      state.ready = true;\r
      buildMesh();\r
      wake();\r
    };\r
\r
    const solve = (dt, s) => {\r
      const { count, x, y, vx, vy, restX, restY, dent, dentV, active, neighbors, grip, gripX, gripY, spacing } = mesh;\r
      const firm = 0.4 + s.stiffness * 1.2;\r
      const anchor = 350 * firm * firm;\r
      const couple = anchor * (52 / Math.sqrt(firm) / spacing) ** 2;\r
      const ratio = reduce ? 0.8 : 0.5 - s.wobble * 0.42;\r
      const damping = 2 * ratio * Math.sqrt(anchor);\r
      const dentAnchor = anchor * 1.4;\r
      const dentCouple = dentAnchor * (18 / spacing) ** 2;\r
      const dentDamping = 2 * (ratio + 0.06) * Math.sqrt(dentAnchor);\r
      const gripStiffness = anchor * 30;\r
      const gripDamping = 1.2 * Math.sqrt(gripStiffness);\r
      const brush = state.pointer.dragging ? 0 : 10;\r
      const hover = state.hover;\r
      const pressRadius = s.grabRadius * 0.32;\r
      const pressInv = 1 / (2 * pressRadius * pressRadius);\r
      const pressPower = hover.power * s.press;\r
      const pressDepth = state.pointer.dragging ? 1.6 : 1;\r
      let energy = 0;\r
      for (let k = 0; k < count; k++) {\r
        if (!active[k]) continue;\r
        const ux = x[k] - restX[k];\r
        const uy = y[k] - restY[k];\r
        let ax = -anchor * ux - damping * vx[k];\r
        let ay = -anchor * uy - damping * vy[k];\r
        let ad = -dentAnchor * dent[k] - dentDamping * dentV[k];\r
        const base = k * 8;\r
        for (let n = 0; n < 8; n++) {\r
          const m = neighbors[base + n];\r
          if (m < 0) continue;\r
          const weight = n < 4 ? 1 : 0.5;\r
          ax += couple * weight * (x[m] - restX[m] - ux);\r
          ay += couple * weight * (y[m] - restY[m] - uy);\r
          ad += dentCouple * weight * (dent[m] - dent[k]);\r
        }\r
        if (pressPower > 0.001) {\r
          const dx = x[k] - hover.x;\r
          const dy = y[k] - hover.y;\r
          const falloff = Math.exp(-(dx * dx + dy * dy) * pressInv);\r
          ad += dentAnchor * 2.6 * pressDepth * pressPower * falloff;\r
          ax += (anchor * 0.3 * dx + brush * hover.vx) * pressPower * falloff;\r
          ay += (anchor * 0.3 * dy + brush * hover.vy) * pressPower * falloff;\r
        }\r
        if (grip[k] > 0) {\r
          ax += grip[k] * (gripStiffness * (gripX[k] - x[k]) - gripDamping * vx[k]);\r
          ay += grip[k] * (gripStiffness * (gripY[k] - y[k]) - gripDamping * vy[k]);\r
        }\r
        vx[k] += ax * dt;\r
        vy[k] += ay * dt;\r
        dentV[k] += ad * dt;\r
        energy += Math.abs(vx[k]) + Math.abs(vy[k]) + Math.abs(dentV[k]) * spacing;\r
      }\r
      for (let k = 0; k < count; k++) {\r
        if (!active[k]) continue;\r
        x[k] += vx[k] * dt;\r
        y[k] += vy[k] * dt;\r
        dent[k] = clamp(dent[k] + dentV[k] * dt, -0.6, 0.85);\r
      }\r
      return energy;\r
    };\r
\r
    const updateGrip = s => {\r
      const { pointer } = state;\r
      const { count, grip, gripX, gripY } = mesh;\r
      if (!pointer.dragging) return;\r
      const limit = Math.max(20, Math.min(state.width, state.height) * (0.08 + s.stretch * 0.32));\r
      const dx = pointer.x - pointer.startX;\r
      const dy = pointer.y - pointer.startY;\r
      const length = Math.hypot(dx, dy);\r
      const eased = length > 0 ? (limit * Math.tanh(length / limit)) / length : 0;\r
      for (let k = 0; k < count; k++) {\r
        if (grip[k] <= 0) continue;\r
        gripX[k] = mesh.anchorX[k] + dx * eased;\r
        gripY[k] = mesh.anchorY[k] + dy * eased;\r
      }\r
    };\r
\r
    const grab = (px, py, s) => {\r
      const { count, x, y, grip, active } = mesh;\r
      const radius = s.grabRadius * 0.3;\r
      const inv = 1 / (2 * radius * radius);\r
      mesh.anchorX = new Float32Array(count);\r
      mesh.anchorY = new Float32Array(count);\r
      let total = 0;\r
      for (let k = 0; k < count; k++) {\r
        if (!active[k]) continue;\r
        const dx = x[k] - px;\r
        const dy = y[k] - py;\r
        const weight = Math.exp(-(dx * dx + dy * dy) * inv);\r
        grip[k] = weight > 0.03 ? weight : 0;\r
        mesh.anchorX[k] = x[k];\r
        mesh.anchorY[k] = y[k];\r
        total += grip[k];\r
      }\r
      return total > 0;\r
    };\r
\r
    const release = () => {\r
      mesh.grip.fill(0);\r
      state.pointer.dragging = false;\r
    };\r
\r
    const poke = (px, py, s) => {\r
      const { count, x, y, vx, vy, dentV, active } = mesh;\r
      const radius = s.grabRadius;\r
      const inv = 1 / (2 * radius * radius);\r
      const strength = 0.4 + s.press;\r
      for (let k = 0; k < count; k++) {\r
        if (!active[k]) continue;\r
        const dx = x[k] - px;\r
        const dy = y[k] - py;\r
        const falloff = Math.exp(-(dx * dx + dy * dy) * inv);\r
        dentV[k] += 9 * strength * falloff;\r
        vx[k] += dx * 9 * strength * falloff;\r
        vy[k] += dy * 9 * strength * falloff;\r
      }\r
    };\r
\r
    const onSurface = (px, py) => {\r
      const { cols, rows, x, y, active, spacing } = mesh;\r
      let best = Infinity;\r
      let bestK = -1;\r
      const range = Math.ceil(80 / spacing);\r
      const ci = clamp(Math.round(px / (mesh.width / Math.max(1, cols - 1))), 0, cols - 1);\r
      const cj = clamp(Math.round(py / (mesh.height / Math.max(1, rows - 1))), 0, rows - 1);\r
      for (let j = Math.max(0, cj - range); j <= Math.min(rows - 1, cj + range); j++) {\r
        for (let i = Math.max(0, ci - range); i <= Math.min(cols - 1, ci + range); i++) {\r
          const k = j * cols + i;\r
          if (!active[k]) continue;\r
          const d = Math.hypot(x[k] - px, y[k] - py);\r
          if (d < best) {\r
            best = d;\r
            bestK = k;\r
          }\r
        }\r
      }\r
      if (bestK < 0) return false;\r
      return sampleSdf(mesh.restX[bestK] + (px - x[bestK]), mesh.restY[bestK] + (py - y[bestK])) > -4;\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      if (width !== state.width || height !== state.height) {\r
        const first = !state.ready && !state.buildToken;\r
        state.width = width;\r
        state.height = height;\r
        window.clearTimeout(resizeTimer);\r
        if (first) rasterize();\r
        else resizeTimer = window.setTimeout(rasterize, 160);\r
      }\r
      wake();\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const colorKey = s.color;\r
      if (colorKey !== state.colorKey) {\r
        state.colorKey = colorKey;\r
        state.color = toRgb(s.color);\r
      }\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      if (!state.ready || !mesh.indices) return;\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      gl.bindVertexArray(vao);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, fieldTexture);\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.bindTexture(gl.TEXTURE_2D, paintTexture);\r
      gl.activeTexture(gl.TEXTURE2);\r
      gl.bindTexture(gl.TEXTURE_2D, slopeTexture);\r
\r
      if (s.shadow > 0) {\r
        gl.useProgram(shadowProgram);\r
        gl.uniform2f(shade.uViewport, mesh.width, mesh.height);\r
        const drop = Math.min(mesh.width, mesh.height) * 0.035 * s.inflate;\r
        gl.uniform2f(shade.uOffset, drop * 0.25, drop);\r
        gl.uniform1i(shade.uField, 0);\r
        if (s.light) gl.uniform3f(shade.uShadowColor, 0.08, 0.08, 0.14);\r
        else gl.uniform3f(shade.uShadowColor, 0, 0, 0);\r
        gl.uniform1f(shade.uShadow, s.shadow * (s.light ? 0.35 : 0.7));\r
        gl.uniform1f(shade.uClock, state.clock);\r
        gl.uniform4fv(shade.uParts, partData);\r
        gl.drawElements(gl.TRIANGLES, mesh.indices, mesh.indexType, 0);\r
      }\r
\r
      gl.useProgram(surfaceProgram);\r
      gl.uniform2f(surface.uViewport, mesh.width, mesh.height);\r
      gl.uniform2f(surface.uOffset, 0, 0);\r
      gl.uniform1i(surface.uField, 0);\r
      gl.uniform1i(surface.uPaint, 1);\r
      gl.uniform1i(surface.uSlope, 2);\r
      const yaw = state.turn.x;\r
      const pitch = state.turn.y;\r
      const cy = Math.cos(yaw);\r
      const sy = Math.sin(yaw);\r
      const cp = Math.cos(pitch);\r
      const sp = Math.sin(pitch);\r
      turnMatrix[0] = cy;\r
      turnMatrix[1] = sy * sp;\r
      turnMatrix[2] = -sy * cp;\r
      turnMatrix[3] = 0;\r
      turnMatrix[4] = cp;\r
      turnMatrix[5] = sp;\r
      turnMatrix[6] = sy;\r
      turnMatrix[7] = -cy * sp;\r
      turnMatrix[8] = cy * cp;\r
      gl.uniformMatrix3fv(surface.uTurn, false, turnMatrix);\r
      gl.uniform3f(surface.uColor, state.color[0], state.color[1], state.color[2]);\r
      gl.uniform1f(surface.uPaintMix, s.src && s.imageColors ? 1 : 0);\r
      gl.uniform1f(surface.uMaterial, s.material);\r
      gl.uniform1f(surface.uLight, s.light ? 1 : 0);\r
      gl.uniform1f(surface.uInflate, s.inflate);\r
      gl.uniform1f(surface.uClock, state.clock);\r
      gl.uniform4fv(surface.uParts, partData);\r
      gl.drawElements(gl.TRIANGLES, mesh.indices, mesh.indexType, 0);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!alive || !visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
\r
      if (reduce || !s.intro) state.clock = 10;\r
      else if (state.ready && state.clock < 10) state.clock = state.clock + dt > 1.8 ? 10 : state.clock + dt;\r
\r
      const hover = state.hover;\r
      const pointer = state.pointer;\r
      const pressing =\r
        state.ready && (pointer.dragging || (pointer.inside && !pointer.down && onSurface(pointer.x, pointer.y)));\r
      const follow = 1 - Math.exp(-dt / 0.05);\r
      const nextX = hover.x + (pointer.x - hover.x) * follow;\r
      const nextY = hover.y + (pointer.y - hover.y) * follow;\r
      const blend = 1 - Math.exp(-dt / 0.04);\r
      hover.vx += ((nextX - hover.x) / Math.max(dt, 0.001) - hover.vx) * blend;\r
      hover.vy += ((nextY - hover.y) / Math.max(dt, 0.001) - hover.vy) * blend;\r
      hover.x = nextX;\r
      hover.y = nextY;\r
      const goal = pressing ? 1 : 0;\r
      hover.power += (goal - hover.power) * (1 - Math.exp(-dt / (pressing ? 0.12 : 0.25)));\r
\r
      const turn = state.turn;\r
      const aimX = pointer.inside && !reduce ? (pointer.x / Math.max(1, mesh.width) - 0.5) * 0.7 : 0;\r
      const aimY = pointer.inside && !reduce ? (pointer.y / Math.max(1, mesh.height) - 0.5) * 0.4 : 0;\r
      turn.vx += (28 * (aimX - turn.x) - 10 * turn.vx) * dt;\r
      turn.vy += (28 * (aimY - turn.y) - 10 * turn.vy) * dt;\r
      turn.x += turn.vx * dt;\r
      turn.y += turn.vy * dt;\r
      const turning =\r
        Math.abs(aimX - turn.x) > 0.0005 ||\r
        Math.abs(aimY - turn.y) > 0.0005 ||\r
        Math.abs(turn.vx) > 0.001 ||\r
        Math.abs(turn.vy) > 0.001;\r
\r
      let energy = 0;\r
      if (state.ready) {\r
        updateGrip(s);\r
        state.accumulator += dt;\r
        let steps = 0;\r
        while (state.accumulator >= STEP && steps < 40) {\r
          energy = solve(STEP, s);\r
          state.accumulator -= STEP;\r
          steps++;\r
        }\r
        if (steps === 40) state.accumulator = 0;\r
        writeDynamic();\r
      }\r
      state.energy = energy;\r
      render();\r
\r
      const settling =\r
        !state.ready ||\r
        state.clock < 10 ||\r
        Math.abs(goal - hover.power) > 0.002 ||\r
        turning ||\r
        Math.hypot(pointer.x - hover.x, pointer.y - hover.y) > 0.1 ||\r
        pointer.dragging ||\r
        energy > 0.05 * Math.max(1, mesh.activeCount);\r
      if (settling) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!raf && alive && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const locatePointer = event => {\r
      const rect = container.getBoundingClientRect();\r
      state.pointer.x = event.clientX - rect.left;\r
      state.pointer.y = event.clientY - rect.top;\r
      state.pointer.inside =\r
        state.pointer.x >= 0 && state.pointer.y >= 0 && state.pointer.x <= rect.width && state.pointer.y <= rect.height;\r
    };\r
\r
    const onPointerMove = event => {\r
      locatePointer(event);\r
      wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      locatePointer(event);\r
      if (!state.ready || !onSurface(state.pointer.x, state.pointer.y)) return;\r
      const s = settingsRef.current;\r
      state.pointer.down = true;\r
      state.pointer.startX = state.pointer.x;\r
      state.pointer.startY = state.pointer.y;\r
      state.pointer.startTime = performance.now();\r
      state.pointer.dragging = grab(state.pointer.x, state.pointer.y, s);\r
      container.setPointerCapture?.(event.pointerId);\r
      wake();\r
    };\r
\r
    const onPointerUp = event => {\r
      if (!state.pointer.down) return;\r
      locatePointer(event);\r
      const s = settingsRef.current;\r
      const moved = Math.hypot(state.pointer.x - state.pointer.startX, state.pointer.y - state.pointer.startY);\r
      const quick = performance.now() - state.pointer.startTime < 260;\r
      release();\r
      if (moved < 8 && quick) poke(state.pointer.x, state.pointer.y, s);\r
      state.pointer.down = false;\r
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
    container.addEventListener('pointerdown', onPointerDown);\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerup', onPointerUp);\r
    window.addEventListener('pointercancel', onPointerUp);\r
    container.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
\r
    contentRef.current = () => {\r
      state.ready = false;\r
      state.clock = settingsRef.current.intro && !reduce ? 0 : 10;\r
      rasterize();\r
    };\r
    wakeRef.current = () => {\r
      if (!raf) render();\r
      wake();\r
    };\r
\r
    return () => {\r
      alive = false;\r
      state.buildToken++;\r
      cancelAnimationFrame(raf);\r
      window.clearTimeout(resizeTimer);\r
      wakeRef.current = null;\r
      contentRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      container.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerup', onPointerUp);\r
      window.removeEventListener('pointercancel', onPointerUp);\r
      container.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteBuffer(restBuffer);\r
      gl.deleteBuffer(dynamicBuffer);\r
      gl.deleteBuffer(indexBuffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteTexture(fieldTexture);\r
      gl.deleteTexture(paintTexture);\r
      gl.deleteTexture(slopeTexture);\r
      gl.deleteProgram(surfaceProgram);\r
      gl.deleteProgram(shadowProgram);\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    if (builtRef.current === contentKey) return;\r
    builtRef.current = contentKey;\r
    contentRef.current?.();\r
  }, [contentKey]);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div\r
      ref={containerRef}\r
      className={['relative h-full w-full touch-pan-y select-none overflow-hidden', className]\r
        .filter(Boolean)\r
        .join(' ')}\r
      style={style}\r
      role="img"\r
      aria-label={settings.src ? 'Elastic logo' : settings.text}\r
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default ElasticMesh;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties, type HTMLAttributes } from 'react';\r
\r
import './ElasticMesh.css';\r
\r
export type ElasticMeshMaterial = 'balloon' | 'chrome' | 'jelly' | 'clay';\r
\r
export interface ElasticMeshProps extends HTMLAttributes<HTMLDivElement> {\r
  text?: string;\r
  src?: string;\r
  fontFamily?: string;\r
  fontWeight?: number | string;\r
  color?: string;\r
  imageColors?: boolean;\r
  material?: ElasticMeshMaterial;\r
  inflate?: number;\r
  stiffness?: number;\r
  wobble?: number;\r
  grabRadius?: number;\r
  stretch?: number;\r
  press?: number;\r
  shadow?: number;\r
  intro?: boolean;\r
  theme?: 'dark' | 'light';\r
  dpr?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
type Settings = {\r
  text: string;\r
  src: string;\r
  fontFamily: string;\r
  fontWeight: number | string;\r
  color: string;\r
  imageColors: boolean;\r
  material: number;\r
  inflate: number;\r
  stiffness: number;\r
  wobble: number;\r
  grabRadius: number;\r
  stretch: number;\r
  press: number;\r
  shadow: number;\r
  intro: boolean;\r
  light: boolean;\r
  dpr?: number;\r
};\r
\r
type Part = { x: number; y: number; left: number; size: number; delay: number };\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
in vec2 aRest;\r
in vec4 aStrain;\r
in vec3 aDent;\r
uniform vec2 uViewport;\r
uniform vec2 uOffset;\r
out vec2 vRest;\r
out vec4 vStrain;\r
out vec3 vDent;\r
void main() {\r
  vRest = aRest;\r
  vStrain = aStrain;\r
  vDent = aDent;\r
  vec2 clip = (aPosition + uOffset) / uViewport * 2.0 - 1.0;\r
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);\r
}\`;\r
\r
const SHADOW = \`#version 300 es\r
precision highp float;\r
in vec2 vRest;\r
in vec4 vStrain;\r
in vec3 vDent;\r
uniform sampler2D uField;\r
uniform vec3 uShadowColor;\r
uniform float uShadow;\r
uniform vec4 uParts[64];\r
uniform float uClock;\r
\r
float arrival(float delay) {\r
  float t = max(uClock - delay, 0.0);\r
  float omega = 15.0;\r
  float zeta = 0.38;\r
  float damped = omega * sqrt(1.0 - zeta * zeta);\r
  return 1.0 - exp(-zeta * omega * t) * (cos(damped * t) + zeta * omega / damped * sin(damped * t));\r
}\r
\r
float owner(vec2 rest) {\r
  ivec2 size = textureSize(uField, 0);\r
  ivec2 texel = clamp(ivec2(rest * vec2(size)), ivec2(0), size - 1);\r
  return floor(texelFetch(uField, texel, 0).w + 0.5);\r
}\r
\r
vec3 settle(vec2 rest) {\r
  if (uClock > 9.0) return vec3(rest, 1.0);\r
  float id = owner(rest);\r
  if (id < 0.5 || id > 64.5) return vec3(rest, 1.0);\r
  vec4 part = uParts[int(id) - 1];\r
  float presence = arrival(part.z);\r
  float size = max(mix(0.5, 1.0, presence), 0.05);\r
  vec2 moved = part.xy + (rest - part.xy) / size;\r
  return vec3(moved, presence * step(abs(owner(moved) - id), 0.5));\r
}\r
out vec4 outColor;\r
void main() {\r
  vec3 arrived = settle(vRest);\r
  float shade = texture(uField, arrived.xy).z * uShadow * clamp(arrived.z, 0.0, 1.0) * (1.0 - 0.35 * clamp(vDent.x, 0.0, 1.0));\r
  outColor = vec4(uShadowColor * shade, shade);\r
}\`;\r
\r
const SURFACE = \`#version 300 es\r
precision highp float;\r
in vec2 vRest;\r
in vec4 vStrain;\r
in vec3 vDent;\r
uniform sampler2D uField;\r
uniform sampler2D uSlope;\r
uniform sampler2D uPaint;\r
uniform vec3 uColor;\r
uniform float uPaintMix;\r
uniform float uMaterial;\r
uniform float uLight;\r
uniform float uInflate;\r
uniform mat3 uTurn;\r
uniform vec4 uParts[64];\r
uniform float uClock;\r
out vec4 outColor;\r
\r
float arrival(float delay) {\r
  float t = max(uClock - delay, 0.0);\r
  float omega = 15.0;\r
  float zeta = 0.38;\r
  float damped = omega * sqrt(1.0 - zeta * zeta);\r
  return 1.0 - exp(-zeta * omega * t) * (cos(damped * t) + zeta * omega / damped * sin(damped * t));\r
}\r
\r
float owner(vec2 rest) {\r
  ivec2 size = textureSize(uField, 0);\r
  ivec2 texel = clamp(ivec2(rest * vec2(size)), ivec2(0), size - 1);\r
  return floor(texelFetch(uField, texel, 0).w + 0.5);\r
}\r
\r
vec3 settle(vec2 rest) {\r
  if (uClock > 9.0) return vec3(rest, 1.0);\r
  float id = owner(rest);\r
  if (id < 0.5 || id > 64.5) return vec3(rest, 1.0);\r
  vec4 part = uParts[int(id) - 1];\r
  float presence = arrival(part.z);\r
  float size = max(mix(0.5, 1.0, presence), 0.05);\r
  vec2 moved = part.xy + (rest - part.xy) / size;\r
  return vec3(moved, presence * step(abs(owner(moved) - id), 0.5));\r
}\r
vec4 cubic(float v) {\r
  vec4 n = vec4(1.0, 2.0, 3.0, 4.0) - v;\r
  vec4 s = n * n * n;\r
  float x = s.x;\r
  float y = s.y - 4.0 * s.x;\r
  float z = s.z - 4.0 * s.y + 6.0 * s.x;\r
  return vec4(x, y, z, 6.0 - x - y - z) / 6.0;\r
}\r
\r
vec2 smoothSlope(vec2 uv) {\r
  vec2 size = vec2(textureSize(uSlope, 0));\r
  vec2 cell = uv * size - 0.5;\r
  vec2 f = fract(cell);\r
  cell -= f;\r
  vec4 xc = cubic(f.x);\r
  vec4 yc = cubic(f.y);\r
  vec4 corner = cell.xxyy + vec2(-0.5, 1.5).xyxy;\r
  vec4 sum = vec4(xc.xz + xc.yw, yc.xz + yc.yw);\r
  vec4 offset = (corner + vec4(xc.yw, yc.yw) / sum) / size.xxyy;\r
  vec2 a = texture(uSlope, offset.xz).xy;\r
  vec2 b = texture(uSlope, offset.yz).xy;\r
  vec2 c = texture(uSlope, offset.xw).xy;\r
  vec2 d = texture(uSlope, offset.yw).xy;\r
  float sx = sum.x / (sum.x + sum.y);\r
  float sy = sum.z / (sum.z + sum.w);\r
  return mix(mix(d, c, sx), mix(b, a, sx), sy);\r
}\r
\r
float panel(vec3 r, vec3 center, vec2 size, float soft) {\r
  vec3 forward = normalize(center);\r
  vec3 side = normalize(cross(vec3(0.0, 1.0, 0.0), forward));\r
  vec3 lift = cross(forward, side);\r
  float facing = dot(r, forward);\r
  vec2 local = vec2(dot(r, side), dot(r, lift)) / max(facing, 0.1);\r
  vec2 q = abs(local) - size;\r
  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);\r
  return smoothstep(soft, -soft, d) * smoothstep(0.05, 0.3, facing);\r
}\r
\r
vec3 studio(vec3 r, float blur) {\r
  float y = r.y;\r
  vec3 skyLow = mix(vec3(0.92, 0.95, 1.0), vec3(1.0), uLight);\r
  vec3 skyHigh = mix(vec3(0.1, 0.11, 0.14), vec3(0.62, 0.64, 0.7), uLight);\r
  vec3 groundNear = mix(vec3(0.12, 0.11, 0.1), vec3(0.3, 0.29, 0.28), uLight);\r
  vec3 groundFar = mix(vec3(0.005), vec3(0.1), uLight);\r
  vec3 sky = mix(skyLow, skyHigh, smoothstep(0.0, 0.75, y));\r
  vec3 ground = mix(groundNear, groundFar, smoothstep(0.0, -0.4, y));\r
  float edge = 0.004 + blur;\r
  vec3 c = mix(ground, sky, smoothstep(-edge, edge, y));\r
  float glow = 0.035 + blur;\r
  c += vec3(2.2) * exp(-pow((y - 0.02) / glow, 2.0)) * (0.035 / glow);\r
  c += vec3(7.0) * panel(r, vec3(-0.55, 0.55, 0.62), vec2(0.36, 0.2), 0.025 + blur);\r
  c += vec3(4.5) * panel(r, vec3(0.9, 0.18, 0.4), vec2(0.045, 0.85), 0.01 + blur) * (0.045 / (0.045 + blur));\r
  c += vec3(3.2) * panel(r, vec3(-0.95, 0.1, 0.32), vec2(0.035, 0.7), 0.01 + blur) * (0.035 / (0.035 + blur));\r
  c += vec3(2.4) * panel(r, vec3(0.0, 0.92, 0.38), vec2(1.1, 0.045), 0.01 + blur) * (0.045 / (0.045 + blur));\r
  return c;\r
}\r
\r
vec3 tone(vec3 x) {\r
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);\r
}\r
\r
void main() {\r
  vec3 arrived = settle(vRest);\r
  vec2 rest = arrived.xy;\r
  float presence = arrived.z;\r
  vec4 field = texture(uField, rest);\r
  float edge = field.y;\r
  float edgeWidth = max(fwidth(edge), 0.0001);\r
  if (edge < -3.0 * edgeWidth || presence <= 0.001) discard;\r
  float cover = clamp(edge / edgeWidth + 0.5, 0.0, 1.0);\r
\r
  vec2 slope = smoothSlope(rest);\r
  mat2 strain = mat2(vStrain.xy, vStrain.zw);\r
  float area = max(determinant(strain), 0.2);\r
  float lift = uInflate * presence * inversesqrt(area);\r
  float keep = clamp(1.0 - vDent.x, 0.15, 1.6);\r
  vec2 restGradient = (slope * keep - field.x * vDent.yz) * lift;\r
  vec2 gradient = inverse(transpose(strain)) * restGradient;\r
  vec3 normal = normalize(vec3(-gradient.x, gradient.y, 1.0));\r
  float depth = field.x * keep * lift;\r
\r
  vec3 turned = uTurn * normal;\r
  vec3 reflected = uTurn * reflect(vec3(0.0, 0.0, -1.0), normal);\r
  float footprint = length(fwidth(reflected));\r
  float facing = max(normal.z, 0.0);\r
  float fresnel = pow(1.0 - facing, 5.0);\r
  vec3 lightDir = normalize(vec3(-0.5, 0.62, 0.62));\r
  float wrap = max((dot(turned, lightDir) + 0.45) / 1.45, 0.0);\r
  float key = max(dot(turned, lightDir), 0.0);\r
  float occlusion = mix(0.55, 1.0, smoothstep(0.0, 12.0, depth));\r
\r
  vec3 paint = texture(uPaint, rest).rgb;\r
  vec3 base = mix(uColor, paint, uPaintMix);\r
  vec3 color;\r
  if (uMaterial < 0.5) {\r
    vec3 env = studio(reflected, 0.04 + footprint * 0.6);\r
    float reflectance = 0.045 + 0.955 * fresnel;\r
    vec3 deep = base * base * 0.55;\r
    vec3 body = mix(deep, base * 1.08, wrap) * occlusion;\r
    body += base * pow(1.0 - facing, 2.0) * 0.18;\r
    color = body * (1.0 - reflectance) + tone(env * reflectance * 0.9);\r
  } else if (uMaterial < 1.5) {\r
    vec3 env = studio(reflected, footprint * 0.6);\r
    vec3 tint = mix(vec3(1.0), base, 0.6) * 0.92;\r
    vec3 reflectance = tint + (1.0 - tint) * fresnel;\r
    color = tone(env * reflectance * mix(0.55, 1.0, occlusion) * 1.1);\r
  } else if (uMaterial < 2.5) {\r
    vec3 env = studio(reflected, 0.03 + footprint * 0.6);\r
    float core = smoothstep(0.0, 1.0, facing);\r
    vec3 glow = mix(base * base * 0.35, min(base * 1.45 + 0.08, vec3(1.0)), core * core);\r
    vec3 body = glow * mix(0.7, 1.0, occlusion) + base * wrap * 0.18;\r
    float reflectance = 0.03 + 0.97 * fresnel;\r
    color = body * (1.0 - reflectance) + tone(env * reflectance * 0.85);\r
  } else {\r
    vec3 env = studio(reflected, 0.35 + footprint * 0.6);\r
    vec3 body = base * (0.3 + 0.7 * wrap) * mix(0.68, 1.0, occlusion);\r
    body += base * key * 0.12;\r
    color = body + tone(env * (0.012 + 0.18 * fresnel)) * 0.5;\r
  }\r
  float alpha = cover * smoothstep(0.0, 0.18, presence);\r
  outColor = vec4(color * alpha, alpha);\r
}\`;\r
\r
const MATERIALS: Record<string, number> = { balloon: 0, chrome: 1, jelly: 2, clay: 3 };\r
const MAX_FIELD = 720;\r
const MAX_NODES = 5200;\r
const STEP = 1 / 480;\r
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
  gl.bindAttribLocation(program, 1, 'aRest');\r
  gl.bindAttribLocation(program, 2, 'aStrain');\r
  gl.bindAttribLocation(program, 3, 'aDent');\r
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
const distance1d = (f: Float64Array, n: number, d: Float64Array, v: Int32Array, z: Float64Array) => {\r
  let k = 0;\r
  v[0] = 0;\r
  z[0] = -Infinity;\r
  z[1] = Infinity;\r
  for (let q = 1; q < n; q++) {\r
    let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);\r
    while (s <= z[k]) {\r
      k--;\r
      s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);\r
    }\r
    k++;\r
    v[k] = q;\r
    z[k] = s;\r
    z[k + 1] = Infinity;\r
  }\r
  k = 0;\r
  for (let q = 0; q < n; q++) {\r
    while (z[k + 1] < q) k++;\r
    d[q] = (q - v[k]) * (q - v[k]) + f[v[k]];\r
  }\r
};\r
\r
const distanceField = (grid: Float64Array, width: number, height: number) => {\r
  const n = Math.max(width, height);\r
  const f = new Float64Array(n);\r
  const d = new Float64Array(n);\r
  const v = new Int32Array(n);\r
  const z = new Float64Array(n + 1);\r
  for (let x = 0; x < width; x++) {\r
    for (let y = 0; y < height; y++) f[y] = grid[y * width + x];\r
    distance1d(f, height, d, v, z);\r
    for (let y = 0; y < height; y++) grid[y * width + x] = d[y];\r
  }\r
  for (let y = 0; y < height; y++) {\r
    for (let x = 0; x < width; x++) f[x] = grid[y * width + x];\r
    distance1d(f, width, d, v, z);\r
    for (let x = 0; x < width; x++) grid[y * width + x] = Math.sqrt(d[x]);\r
  }\r
  return grid;\r
};\r
\r
const nearestLabels = (labels: Int32Array, width: number, height: number) => {\r
  const far = 1e20;\r
  const column = new Float64Array(width * height);\r
  const site = new Int32Array(width * height);\r
  for (let x = 0; x < width; x++) {\r
    let last = -1;\r
    for (let y = 0; y < height; y++) {\r
      const i = y * width + x;\r
      if (labels[i]) last = y;\r
      site[i] = last;\r
      column[i] = last >= 0 ? (y - last) * (y - last) : far;\r
    }\r
    last = -1;\r
    for (let y = height - 1; y >= 0; y--) {\r
      const i = y * width + x;\r
      if (labels[i]) last = y;\r
      if (last >= 0 && (last - y) * (last - y) < column[i]) {\r
        column[i] = (last - y) * (last - y);\r
        site[i] = last;\r
      }\r
    }\r
  }\r
  const out = new Float32Array(width * height);\r
  const f = new Float64Array(width);\r
  const v = new Int32Array(width);\r
  const z = new Float64Array(width + 1);\r
  for (let y = 0; y < height; y++) {\r
    for (let x = 0; x < width; x++) f[x] = column[y * width + x];\r
    let k = 0;\r
    v[0] = 0;\r
    z[0] = -Infinity;\r
    z[1] = Infinity;\r
    for (let q = 1; q < width; q++) {\r
      let cut = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);\r
      while (cut <= z[k]) {\r
        k--;\r
        cut = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);\r
      }\r
      k++;\r
      v[k] = q;\r
      z[k] = cut;\r
      z[k + 1] = Infinity;\r
    }\r
    k = 0;\r
    for (let x = 0; x < width; x++) {\r
      while (z[k + 1] < x) k++;\r
      const sx = v[k];\r
      const sy = site[y * width + sx];\r
      out[y * width + x] = sy >= 0 ? labels[sy * width + sx] : 0;\r
    }\r
  }\r
  return out;\r
};\r
\r
const inflateField = (mask: Float32Array, width: number, height: number) => {\r
  const levels = [{ width, height, mask }];\r
  while (Math.max(levels[levels.length - 1].width, levels[levels.length - 1].height) > 48) {\r
    const prev = levels[levels.length - 1];\r
    const w = Math.ceil(prev.width / 2);\r
    const h = Math.ceil(prev.height / 2);\r
    const next = new Float32Array(w * h);\r
    for (let y = 0; y < h; y++) {\r
      for (let x = 0; x < w; x++) {\r
        let sum = 0;\r
        let count = 0;\r
        for (let dy = 0; dy < 2; dy++) {\r
          for (let dx = 0; dx < 2; dx++) {\r
            const sx = x * 2 + dx;\r
            const sy = y * 2 + dy;\r
            if (sx < prev.width && sy < prev.height) {\r
              sum += prev.mask[sy * prev.width + sx];\r
              count++;\r
            }\r
          }\r
        }\r
        next[y * w + x] = sum / count;\r
      }\r
    }\r
    levels.push({ width: w, height: h, mask: next });\r
  }\r
\r
  let solution: Float32Array | null = null;\r
  for (let level = levels.length - 1; level >= 0; level--) {\r
    const { width: w, height: h, mask: m } = levels[level];\r
    const current = new Float32Array(w * h);\r
    if (solution) {\r
      const pw = levels[level + 1].width;\r
      const ph = levels[level + 1].height;\r
      for (let y = 0; y < h; y++) {\r
        for (let x = 0; x < w; x++) {\r
          const fx = clamp((x + 0.5) / 2 - 0.5, 0, pw - 1);\r
          const fy = clamp((y + 0.5) / 2 - 0.5, 0, ph - 1);\r
          const x0 = Math.floor(fx);\r
          const y0 = Math.floor(fy);\r
          const x1 = Math.min(pw - 1, x0 + 1);\r
          const y1 = Math.min(ph - 1, y0 + 1);\r
          const tx = fx - x0;\r
          const ty = fy - y0;\r
          const top = solution[y0 * pw + x0] * (1 - tx) + solution[y0 * pw + x1] * tx;\r
          const bottom = solution[y1 * pw + x0] * (1 - tx) + solution[y1 * pw + x1] * tx;\r
          current[y * w + x] = top * (1 - ty) + bottom * ty;\r
        }\r
      }\r
    }\r
    const source = 4 ** level;\r
    const iterations = level === levels.length - 1 ? 300 : 60;\r
    for (let iteration = 0; iteration < iterations; iteration++) {\r
      for (let y = 0; y < h; y++) {\r
        for (let x = 0; x < w; x++) {\r
          const i = y * w + x;\r
          if (m[i] < 0.5) {\r
            current[i] = 0;\r
            continue;\r
          }\r
          const l = x > 0 ? current[i - 1] : 0;\r
          const r = x < w - 1 ? current[i + 1] : 0;\r
          const u = y > 0 ? current[i - w] : 0;\r
          const d = y < h - 1 ? current[i + w] : 0;\r
          current[i] += ((l + r + u + d + source) * 0.25 - current[i]) * 1.85;\r
        }\r
      }\r
    }\r
    solution = current;\r
  }\r
  return solution as Float32Array;\r
};\r
\r
const blurField = (source: ArrayLike<number>, width: number, height: number, radius: number) => {\r
  const r = Math.max(1, Math.round(radius));\r
  const sigma = r / 2.5;\r
  const kernel: number[] = [];\r
  let total = 0;\r
  for (let i = -r; i <= r; i++) {\r
    const weight = Math.exp(-(i * i) / (2 * sigma * sigma));\r
    kernel.push(weight);\r
    total += weight;\r
  }\r
  for (let i = 0; i < kernel.length; i++) kernel[i] /= total;\r
  const temp = new Float32Array(width * height);\r
  const out = new Float32Array(width * height);\r
  for (let y = 0; y < height; y++) {\r
    for (let x = 0; x < width; x++) {\r
      let sum = 0;\r
      for (let i = -r; i <= r; i++) sum += source[y * width + clamp(x + i, 0, width - 1)] * kernel[i + r];\r
      temp[y * width + x] = sum;\r
    }\r
  }\r
  for (let y = 0; y < height; y++) {\r
    for (let x = 0; x < width; x++) {\r
      let sum = 0;\r
      for (let i = -r; i <= r; i++) sum += temp[clamp(y + i, 0, height - 1) * width + x] * kernel[i + r];\r
      out[y * width + x] = sum;\r
    }\r
  }\r
  return out;\r
};\r
\r
const ElasticMesh = ({\r
  text = 'Squish',\r
  src = '',\r
  fontFamily = 'system-ui, sans-serif',\r
  fontWeight = 900,\r
  color = '#3b5bff',\r
  imageColors = true,\r
  material = 'balloon',\r
  inflate = 1,\r
  stiffness = 0.5,\r
  wobble = 0.6,\r
  grabRadius = 70,\r
  stretch = 0.5,\r
  press = 0.5,\r
  shadow = 0.5,\r
  intro = true,\r
  theme = 'dark',\r
  dpr,\r
  className = '',\r
  style,\r
  ...rest\r
}: ElasticMeshProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const contentRef = useRef<(() => void) | null>(null);\r
  const settings: Settings = {\r
    text: String(text),\r
    src: String(src || ''),\r
    fontFamily: String(fontFamily),\r
    fontWeight,\r
    color: String(color),\r
    imageColors,\r
    material: MATERIALS[material] ?? 0,\r
    inflate: clamp(inflate, 0.1, 3),\r
    stiffness: clamp(stiffness, 0, 1),\r
    wobble: clamp(wobble, 0, 1),\r
    grabRadius: clamp(grabRadius, 10, 400),\r
    stretch: clamp(stretch, 0, 1),\r
    press: clamp(press, 0, 1),\r
    shadow: clamp(shadow, 0, 1),\r
    intro,\r
    light: theme === 'light',\r
    dpr\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
  const contentKey = \`\${settings.text}|\${settings.src}|\${settings.fontFamily}|\${settings.fontWeight}\`;\r
  const builtRef = useRef(contentKey);\r
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
    const surfaceProgram = link(gl, SURFACE);\r
    const shadowProgram = link(gl, SHADOW);\r
    if (!surfaceProgram || !shadowProgram) return undefined;\r
    const surface = locate(gl, surfaceProgram, [\r
      'uViewport',\r
      'uOffset',\r
      'uField',\r
      'uPaint',\r
      'uSlope',\r
      'uColor',\r
      'uPaintMix',\r
      'uMaterial',\r
      'uLight',\r
      'uInflate',\r
      'uTurn',\r
      'uClock',\r
      'uParts'\r
    ]);\r
    const shade = locate(gl, shadowProgram, [\r
      'uViewport',\r
      'uOffset',\r
      'uField',\r
      'uShadowColor',\r
      'uShadow',\r
      'uClock',\r
      'uParts'\r
    ]);\r
\r
    const fieldTexture = gl.createTexture();\r
    const paintTexture = gl.createTexture();\r
    const slopeTexture = gl.createTexture();\r
    for (const texture of [fieldTexture, paintTexture, slopeTexture]) {\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));\r
    }\r
\r
    const vao = gl.createVertexArray();\r
    const restBuffer = gl.createBuffer();\r
    const dynamicBuffer = gl.createBuffer();\r
    const indexBuffer = gl.createBuffer();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, restBuffer);\r
    gl.enableVertexAttribArray(1);\r
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, dynamicBuffer);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 36, 0);\r
    gl.enableVertexAttribArray(2);\r
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 36, 8);\r
    gl.enableVertexAttribArray(3);\r
    gl.vertexAttribPointer(3, 3, gl.FLOAT, false, 36, 24);\r
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);\r
    gl.bindVertexArray(null);\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const partData = new Float32Array(256);\r
    const turnMatrix = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);\r
    const mesh = {\r
      cols: 0,\r
      rows: 0,\r
      spacing: 1,\r
      count: 0,\r
      indices: 0,\r
      restX: new Float32Array(0),\r
      restY: new Float32Array(0),\r
      x: new Float32Array(0),\r
      y: new Float32Array(0),\r
      vx: new Float32Array(0),\r
      vy: new Float32Array(0),\r
      dent: new Float32Array(0),\r
      dentV: new Float32Array(0),\r
      grip: new Float32Array(0),\r
      gripX: new Float32Array(0),\r
      gripY: new Float32Array(0),\r
      active: new Uint8Array(0),\r
      neighbors: new Int32Array(0),\r
      dynamic: new Float32Array(0),\r
      anchorX: new Float32Array(0),\r
      anchorY: new Float32Array(0),\r
      indexType: gl.UNSIGNED_SHORT as number,\r
      activeCount: 0,\r
      width: 1,\r
      height: 1\r
    };\r
    const state = {\r
      width: 1,\r
      height: 1,\r
      ready: false,\r
      fieldWidth: 1,\r
      fieldHeight: 1,\r
      fieldScale: 1,\r
      sdf: new Float32Array(0),\r
      parts: [] as Part[],\r
      clock: settingsRef.current.intro && !reduce ? 0 : 10,\r
      colorKey: '',\r
      color: [0.31, 0.42, 1],\r
      pointer: { x: 0, y: 0, inside: false, down: false, startX: 0, startY: 0, startTime: 0, dragging: false },\r
      hover: { x: 0, y: 0, vx: 0, vy: 0, power: 0 },\r
      turn: { x: 0, y: 0, vx: 0, vy: 0 },\r
      accumulator: 0,\r
      energy: 1,\r
      buildToken: 0\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let alive = true;\r
    let resizeTimer = 0;\r
\r
    const toRgb = (value: string): number[] => {\r
      if (!probe || !value) return [0.31, 0.42, 1];\r
      probe.fillStyle = '#000000';\r
      probe.fillStyle = /^[0-9a-f]{3,8}$/i.test(value) ? \`#\${value}\` : value;\r
      probe.fillRect(0, 0, 1, 1);\r
      const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
      return [r / 255, g / 255, b / 255];\r
    };\r
\r
    const sampleSdf = (px: number, py: number) => {\r
      const fx = clamp(Math.round(px * state.fieldScale), 0, state.fieldWidth - 1);\r
      const fy = clamp(Math.round(py * state.fieldScale), 0, state.fieldHeight - 1);\r
      return state.sdf[fy * state.fieldWidth + fx] || -1e6;\r
    };\r
\r
    const buildMesh = () => {\r
      const { width, height } = state;\r
      const spacing = Math.max(7, Math.sqrt((width * height) / MAX_NODES));\r
      const cols = Math.ceil(width / spacing) + 1;\r
      const rows = Math.ceil(height / spacing) + 1;\r
      const count = cols * rows;\r
      const sx = width / (cols - 1);\r
      const sy = height / (rows - 1);\r
      mesh.cols = cols;\r
      mesh.rows = rows;\r
      mesh.width = width;\r
      mesh.height = height;\r
      mesh.spacing = (sx + sy) / 2;\r
      mesh.count = count;\r
      mesh.restX = new Float32Array(count);\r
      mesh.restY = new Float32Array(count);\r
      mesh.x = new Float32Array(count);\r
      mesh.y = new Float32Array(count);\r
      mesh.vx = new Float32Array(count);\r
      mesh.vy = new Float32Array(count);\r
      mesh.dent = new Float32Array(count);\r
      mesh.dentV = new Float32Array(count);\r
      mesh.grip = new Float32Array(count);\r
      mesh.gripX = new Float32Array(count);\r
      mesh.gripY = new Float32Array(count);\r
      mesh.active = new Uint8Array(count);\r
      mesh.dynamic = new Float32Array(count * 9);\r
      const rest = new Float32Array(count * 2);\r
      const reach = -2.5 * mesh.spacing;\r
      for (let j = 0; j < rows; j++) {\r
        for (let i = 0; i < cols; i++) {\r
          const k = j * cols + i;\r
          const px = i * sx;\r
          const py = j * sy;\r
          mesh.restX[k] = px;\r
          mesh.restY[k] = py;\r
          mesh.x[k] = px;\r
          mesh.y[k] = py;\r
          rest[k * 2] = px / width;\r
          rest[k * 2 + 1] = py / height;\r
          mesh.active[k] = state.ready && sampleSdf(px, py) > reach ? 1 : 0;\r
        }\r
      }\r
      const neighbors = new Int32Array(count * 8).fill(-1);\r
      const offsets = [\r
        [-1, 0],\r
        [1, 0],\r
        [0, -1],\r
        [0, 1],\r
        [-1, -1],\r
        [1, -1],\r
        [-1, 1],\r
        [1, 1]\r
      ];\r
      for (let j = 0; j < rows; j++) {\r
        for (let i = 0; i < cols; i++) {\r
          const k = j * cols + i;\r
          if (!mesh.active[k]) continue;\r
          offsets.forEach(([di, dj], n) => {\r
            const ni = i + di;\r
            const nj = j + dj;\r
            if (ni < 0 || nj < 0 || ni >= cols || nj >= rows) return;\r
            const nk = nj * cols + ni;\r
            if (mesh.active[nk]) neighbors[k * 8 + n] = nk;\r
          });\r
        }\r
      }\r
      mesh.neighbors = neighbors;\r
      mesh.activeCount = mesh.active.reduce((total, flag) => total + flag, 0);\r
      const margin = -(Math.min(width, height) * 0.14 + mesh.spacing * 3);\r
      const near = new Uint8Array(count);\r
      for (let k = 0; k < count; k++) near[k] = state.ready && sampleSdf(mesh.restX[k], mesh.restY[k]) > margin ? 1 : 0;\r
      const quads: number[] = [];\r
      for (let j = 0; j < rows - 1; j++) {\r
        for (let i = 0; i < cols - 1; i++) {\r
          const a = j * cols + i;\r
          const b = a + 1;\r
          const c = a + cols;\r
          const d = c + 1;\r
          if (near[a] || near[b] || near[c] || near[d]) quads.push(a, c, b, b, c, d);\r
        }\r
      }\r
      const indexData = count > 65535 ? new Uint32Array(quads) : new Uint16Array(quads);\r
      mesh.indexType = count > 65535 ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;\r
      mesh.indices = quads.length;\r
      gl.bindBuffer(gl.ARRAY_BUFFER, restBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, rest, gl.STATIC_DRAW);\r
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);\r
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexData, gl.STATIC_DRAW);\r
      writeDynamic();\r
    };\r
\r
    const writeDynamic = () => {\r
      const { cols, rows, x, y, dent, dynamic, spacing } = mesh;\r
      const sx = mesh.width / Math.max(1, cols - 1);\r
      const sy = mesh.height / Math.max(1, rows - 1);\r
      for (let j = 0; j < rows; j++) {\r
        for (let i = 0; i < cols; i++) {\r
          const k = j * cols + i;\r
          const l = i > 0 ? k - 1 : k;\r
          const r = i < cols - 1 ? k + 1 : k;\r
          const u = j > 0 ? k - cols : k;\r
          const d = j < rows - 1 ? k + cols : k;\r
          const spanX = (r - l) * sx || spacing;\r
          const spanY = ((d - u) / cols) * sy || spacing;\r
          const o = k * 9;\r
          dynamic[o] = x[k];\r
          dynamic[o + 1] = y[k];\r
          dynamic[o + 2] = (x[r] - x[l]) / spanX;\r
          dynamic[o + 3] = (y[r] - y[l]) / spanX;\r
          dynamic[o + 4] = (x[d] - x[u]) / spanY;\r
          dynamic[o + 5] = (y[d] - y[u]) / spanY;\r
          dynamic[o + 6] = dent[k];\r
          dynamic[o + 7] = (dent[r] - dent[l]) / spanX;\r
          dynamic[o + 8] = (dent[d] - dent[u]) / spanY;\r
        }\r
      }\r
      gl.bindBuffer(gl.ARRAY_BUFFER, dynamicBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, dynamic, gl.DYNAMIC_DRAW);\r
    };\r
\r
    const rasterize = async () => {\r
      const s = settingsRef.current;\r
      const token = ++state.buildToken;\r
      const { width, height } = state;\r
      const scale = Math.min(1, MAX_FIELD / Math.max(width, height));\r
      const fw = Math.max(8, Math.round(width * scale));\r
      const fh = Math.max(8, Math.round(height * scale));\r
      const canvas2d = document.createElement('canvas');\r
      canvas2d.width = fw;\r
      canvas2d.height = fh;\r
      const ctx = canvas2d.getContext('2d', { willReadFrequently: true });\r
      if (!ctx) return;\r
      let drawn = false;\r
      if (s.src) {\r
        const image = new Image();\r
        image.crossOrigin = 'anonymous';\r
        image.decoding = 'async';\r
        image.src = s.src;\r
        try {\r
          await image.decode();\r
        } catch {\r
          return;\r
        }\r
        if (token !== state.buildToken) return;\r
        const fit = Math.min((fw * 0.78) / image.naturalWidth, (fh * 0.74) / image.naturalHeight);\r
        const w = image.naturalWidth * fit;\r
        const h = image.naturalHeight * fit;\r
        ctx.drawImage(image, (fw - w) / 2, (fh - h) / 2, w, h);\r
        drawn = true;\r
      } else {\r
        const family = s.fontFamily;\r
        const weight = s.fontWeight;\r
        if (document.fonts) await document.fonts.load(\`\${weight} 100px \${family}\`).catch(() => null);\r
        if (token !== state.buildToken) return;\r
        const lines = s.text.split('\\n');\r
        ctx.font = \`\${weight} 100px \${family}\`;\r
        let widest = 1;\r
        let ascent = 0;\r
        let descent = 0;\r
        for (const line of lines) {\r
          const m = ctx.measureText(line || ' ');\r
          widest = Math.max(widest, m.actualBoundingBoxLeft + m.actualBoundingBoxRight);\r
          ascent = Math.max(ascent, m.actualBoundingBoxAscent);\r
          descent = Math.max(descent, m.actualBoundingBoxDescent);\r
        }\r
        const lineHeight = 100 * 1.02;\r
        const blockHeight = ascent + descent + lineHeight * (lines.length - 1);\r
        const size = Math.min((fw * 0.8) / widest, (fh * 0.7) / blockHeight) * 100;\r
        ctx.font = \`\${weight} \${size}px \${family}\`;\r
        ctx.fillStyle = '#ffffff';\r
        ctx.textAlign = 'center';\r
        ctx.textBaseline = 'alphabetic';\r
        const k = size / 100;\r
        const top = (fh - blockHeight * k) / 2 + ascent * k;\r
        lines.forEach((line, index) => {\r
          const m = ctx.measureText(line || ' ');\r
          const shift = (m.actualBoundingBoxLeft - m.actualBoundingBoxRight) / 2;\r
          ctx.fillText(line, fw / 2 + shift, top + index * lineHeight * k);\r
        });\r
        drawn = true;\r
      }\r
      if (!drawn || token !== state.buildToken) return;\r
\r
      const pixels = ctx.getImageData(0, 0, fw, fh).data;\r
      const count = fw * fh;\r
      const mask = new Float32Array(count);\r
      const inside = new Float64Array(count);\r
      const outside = new Float64Array(count);\r
      for (let i = 0; i < count; i++) {\r
        const a = pixels[i * 4 + 3] / 255;\r
        mask[i] = a;\r
        inside[i] = a > 0.5 ? 1e10 : 0;\r
        outside[i] = a > 0.5 ? 0 : 1e10;\r
      }\r
      distanceField(inside, fw, fh);\r
      distanceField(outside, fw, fh);\r
      const binary = new Float32Array(count);\r
      const signed = new Float32Array(count);\r
      for (let i = 0; i < count; i++) {\r
        binary[i] = mask[i] > 0.5 ? 1 : 0;\r
        signed[i] =\r
          mask[i] > 0.02 && mask[i] < 0.98 ? mask[i] - 0.5 : inside[i] > 0 ? inside[i] - 0.5 : 0.5 - outside[i];\r
      }\r
      const labels = new Int32Array(count);\r
      const parts: Part[] = [];\r
      const queue = new Int32Array(count);\r
      for (let start = 0; start < count; start++) {\r
        if (!binary[start] || labels[start]) continue;\r
        const id = parts.length + 1;\r
        let head = 0;\r
        let tail = 0;\r
        let sumX = 0;\r
        let sumY = 0;\r
        let minX = Infinity;\r
        queue[tail++] = start;\r
        labels[start] = id;\r
        while (head < tail) {\r
          const i = queue[head++];\r
          const x = i % fw;\r
          const y = (i - x) / fw;\r
          sumX += x;\r
          sumY += y;\r
          if (x < minX) minX = x;\r
          if (x > 0 && binary[i - 1] && !labels[i - 1]) {\r
            labels[i - 1] = id;\r
            queue[tail++] = i - 1;\r
          }\r
          if (x < fw - 1 && binary[i + 1] && !labels[i + 1]) {\r
            labels[i + 1] = id;\r
            queue[tail++] = i + 1;\r
          }\r
          if (y > 0 && binary[i - fw] && !labels[i - fw]) {\r
            labels[i - fw] = id;\r
            queue[tail++] = i - fw;\r
          }\r
          if (y < fh - 1 && binary[i + fw] && !labels[i + fw]) {\r
            labels[i + fw] = id;\r
            queue[tail++] = i + fw;\r
          }\r
        }\r
        parts.push({ x: sumX / tail / scale, y: sumY / tail / scale, left: minX, size: tail, delay: 0 });\r
      }\r
      const order = [...parts].sort((a, b) => a.left - b.left);\r
      const gap = order.length > 1 ? Math.min(0.07, 0.5 / (order.length - 1)) : 0;\r
      order.forEach((part, rank) => {\r
        part.delay = rank * gap;\r
      });\r
      const owners = parts.length <= 64 ? nearestLabels(labels, fw, fh) : new Float32Array(count);\r
      const solution = blurField(inflateField(binary, fw, fh), fw, fh, 2);\r
      const edges = blurField(signed, fw, fh, 2);\r
      const shadowMask = blurField(binary, fw, fh, Math.max(4, Math.min(fw, fh) * 0.045));\r
      const field = new Float32Array(count * 4);\r
      const sdf = new Float32Array(count);\r
      const heights = new Float32Array(count);\r
      for (let i = 0; i < count; i++) {\r
        const distance = edges[i] / scale;\r
        sdf[i] = distance;\r
        heights[i] = Math.sqrt(Math.max(0, 2 * solution[i])) / scale;\r
        field[i * 4] = heights[i];\r
        field[i * 4 + 1] = distance;\r
        field[i * 4 + 2] = shadowMask[i];\r
        field[i * 4 + 3] = owners[i];\r
      }\r
      const slopes = new Float32Array(count * 2);\r
      for (let y = 0; y < fh; y++) {\r
        for (let x = 0; x < fw; x++) {\r
          const i = y * fw + x;\r
          let gx = (heights[y * fw + Math.min(fw - 1, x + 1)] - heights[y * fw + Math.max(0, x - 1)]) * 0.5 * scale;\r
          let gy = (heights[Math.min(fh - 1, y + 1) * fw + x] - heights[Math.max(0, y - 1) * fw + x]) * 0.5 * scale;\r
          const steep = Math.hypot(gx, gy);\r
          if (steep > 7) {\r
            gx *= 7 / steep;\r
            gy *= 7 / steep;\r
          }\r
          slopes[i * 2] = gx;\r
          slopes[i * 2 + 1] = gy;\r
        }\r
      }\r
      gl.bindTexture(gl.TEXTURE_2D, fieldTexture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, fw, fh, 0, gl.RGBA, gl.FLOAT, field);\r
      gl.bindTexture(gl.TEXTURE_2D, slopeTexture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG16F, fw, fh, 0, gl.RG, gl.FLOAT, slopes);\r
      gl.bindTexture(gl.TEXTURE_2D, paintTexture);\r
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas2d);\r
      state.fieldWidth = fw;\r
      state.fieldHeight = fh;\r
      state.fieldScale = scale;\r
      state.sdf = sdf;\r
      state.parts = parts;\r
      partData.fill(0);\r
      parts.slice(0, 64).forEach((part, index) => {\r
        partData[index * 4] = part.x / width;\r
        partData[index * 4 + 1] = part.y / height;\r
        partData[index * 4 + 2] = part.delay;\r
      });\r
      state.ready = true;\r
      buildMesh();\r
      wake();\r
    };\r
\r
    const solve = (dt: number, s: Settings) => {\r
      const { count, x, y, vx, vy, restX, restY, dent, dentV, active, neighbors, grip, gripX, gripY, spacing } = mesh;\r
      const firm = 0.4 + s.stiffness * 1.2;\r
      const anchor = 350 * firm * firm;\r
      const couple = anchor * (52 / Math.sqrt(firm) / spacing) ** 2;\r
      const ratio = reduce ? 0.8 : 0.5 - s.wobble * 0.42;\r
      const damping = 2 * ratio * Math.sqrt(anchor);\r
      const dentAnchor = anchor * 1.4;\r
      const dentCouple = dentAnchor * (18 / spacing) ** 2;\r
      const dentDamping = 2 * (ratio + 0.06) * Math.sqrt(dentAnchor);\r
      const gripStiffness = anchor * 30;\r
      const gripDamping = 1.2 * Math.sqrt(gripStiffness);\r
      const brush = state.pointer.dragging ? 0 : 10;\r
      const hover = state.hover;\r
      const pressRadius = s.grabRadius * 0.32;\r
      const pressInv = 1 / (2 * pressRadius * pressRadius);\r
      const pressPower = hover.power * s.press;\r
      const pressDepth = state.pointer.dragging ? 1.6 : 1;\r
      let energy = 0;\r
      for (let k = 0; k < count; k++) {\r
        if (!active[k]) continue;\r
        const ux = x[k] - restX[k];\r
        const uy = y[k] - restY[k];\r
        let ax = -anchor * ux - damping * vx[k];\r
        let ay = -anchor * uy - damping * vy[k];\r
        let ad = -dentAnchor * dent[k] - dentDamping * dentV[k];\r
        const base = k * 8;\r
        for (let n = 0; n < 8; n++) {\r
          const m = neighbors[base + n];\r
          if (m < 0) continue;\r
          const weight = n < 4 ? 1 : 0.5;\r
          ax += couple * weight * (x[m] - restX[m] - ux);\r
          ay += couple * weight * (y[m] - restY[m] - uy);\r
          ad += dentCouple * weight * (dent[m] - dent[k]);\r
        }\r
        if (pressPower > 0.001) {\r
          const dx = x[k] - hover.x;\r
          const dy = y[k] - hover.y;\r
          const falloff = Math.exp(-(dx * dx + dy * dy) * pressInv);\r
          ad += dentAnchor * 2.6 * pressDepth * pressPower * falloff;\r
          ax += (anchor * 0.3 * dx + brush * hover.vx) * pressPower * falloff;\r
          ay += (anchor * 0.3 * dy + brush * hover.vy) * pressPower * falloff;\r
        }\r
        if (grip[k] > 0) {\r
          ax += grip[k] * (gripStiffness * (gripX[k] - x[k]) - gripDamping * vx[k]);\r
          ay += grip[k] * (gripStiffness * (gripY[k] - y[k]) - gripDamping * vy[k]);\r
        }\r
        vx[k] += ax * dt;\r
        vy[k] += ay * dt;\r
        dentV[k] += ad * dt;\r
        energy += Math.abs(vx[k]) + Math.abs(vy[k]) + Math.abs(dentV[k]) * spacing;\r
      }\r
      for (let k = 0; k < count; k++) {\r
        if (!active[k]) continue;\r
        x[k] += vx[k] * dt;\r
        y[k] += vy[k] * dt;\r
        dent[k] = clamp(dent[k] + dentV[k] * dt, -0.6, 0.85);\r
      }\r
      return energy;\r
    };\r
\r
    const updateGrip = (s: Settings) => {\r
      const { pointer } = state;\r
      const { count, grip, gripX, gripY } = mesh;\r
      if (!pointer.dragging) return;\r
      const limit = Math.max(20, Math.min(state.width, state.height) * (0.08 + s.stretch * 0.32));\r
      const dx = pointer.x - pointer.startX;\r
      const dy = pointer.y - pointer.startY;\r
      const length = Math.hypot(dx, dy);\r
      const eased = length > 0 ? (limit * Math.tanh(length / limit)) / length : 0;\r
      for (let k = 0; k < count; k++) {\r
        if (grip[k] <= 0) continue;\r
        gripX[k] = mesh.anchorX[k] + dx * eased;\r
        gripY[k] = mesh.anchorY[k] + dy * eased;\r
      }\r
    };\r
\r
    const grab = (px: number, py: number, s: Settings) => {\r
      const { count, x, y, grip, active } = mesh;\r
      const radius = s.grabRadius * 0.3;\r
      const inv = 1 / (2 * radius * radius);\r
      mesh.anchorX = new Float32Array(count);\r
      mesh.anchorY = new Float32Array(count);\r
      let total = 0;\r
      for (let k = 0; k < count; k++) {\r
        if (!active[k]) continue;\r
        const dx = x[k] - px;\r
        const dy = y[k] - py;\r
        const weight = Math.exp(-(dx * dx + dy * dy) * inv);\r
        grip[k] = weight > 0.03 ? weight : 0;\r
        mesh.anchorX[k] = x[k];\r
        mesh.anchorY[k] = y[k];\r
        total += grip[k];\r
      }\r
      return total > 0;\r
    };\r
\r
    const release = () => {\r
      mesh.grip.fill(0);\r
      state.pointer.dragging = false;\r
    };\r
\r
    const poke = (px: number, py: number, s: Settings) => {\r
      const { count, x, y, vx, vy, dentV, active } = mesh;\r
      const radius = s.grabRadius;\r
      const inv = 1 / (2 * radius * radius);\r
      const strength = 0.4 + s.press;\r
      for (let k = 0; k < count; k++) {\r
        if (!active[k]) continue;\r
        const dx = x[k] - px;\r
        const dy = y[k] - py;\r
        const falloff = Math.exp(-(dx * dx + dy * dy) * inv);\r
        dentV[k] += 9 * strength * falloff;\r
        vx[k] += dx * 9 * strength * falloff;\r
        vy[k] += dy * 9 * strength * falloff;\r
      }\r
    };\r
\r
    const onSurface = (px: number, py: number) => {\r
      const { cols, rows, x, y, active, spacing } = mesh;\r
      let best = Infinity;\r
      let bestK = -1;\r
      const range = Math.ceil(80 / spacing);\r
      const ci = clamp(Math.round(px / (mesh.width / Math.max(1, cols - 1))), 0, cols - 1);\r
      const cj = clamp(Math.round(py / (mesh.height / Math.max(1, rows - 1))), 0, rows - 1);\r
      for (let j = Math.max(0, cj - range); j <= Math.min(rows - 1, cj + range); j++) {\r
        for (let i = Math.max(0, ci - range); i <= Math.min(cols - 1, ci + range); i++) {\r
          const k = j * cols + i;\r
          if (!active[k]) continue;\r
          const d = Math.hypot(x[k] - px, y[k] - py);\r
          if (d < best) {\r
            best = d;\r
            bestK = k;\r
          }\r
        }\r
      }\r
      if (bestK < 0) return false;\r
      return sampleSdf(mesh.restX[bestK] + (px - x[bestK]), mesh.restY[bestK] + (py - y[bestK])) > -4;\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      if (width !== state.width || height !== state.height) {\r
        const first = !state.ready && !state.buildToken;\r
        state.width = width;\r
        state.height = height;\r
        window.clearTimeout(resizeTimer);\r
        if (first) rasterize();\r
        else resizeTimer = window.setTimeout(rasterize, 160);\r
      }\r
      wake();\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const colorKey = s.color;\r
      if (colorKey !== state.colorKey) {\r
        state.colorKey = colorKey;\r
        state.color = toRgb(s.color);\r
      }\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      if (!state.ready || !mesh.indices) return;\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      gl.bindVertexArray(vao);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, fieldTexture);\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.bindTexture(gl.TEXTURE_2D, paintTexture);\r
      gl.activeTexture(gl.TEXTURE2);\r
      gl.bindTexture(gl.TEXTURE_2D, slopeTexture);\r
\r
      if (s.shadow > 0) {\r
        gl.useProgram(shadowProgram);\r
        gl.uniform2f(shade.uViewport, mesh.width, mesh.height);\r
        const drop = Math.min(mesh.width, mesh.height) * 0.035 * s.inflate;\r
        gl.uniform2f(shade.uOffset, drop * 0.25, drop);\r
        gl.uniform1i(shade.uField, 0);\r
        if (s.light) gl.uniform3f(shade.uShadowColor, 0.08, 0.08, 0.14);\r
        else gl.uniform3f(shade.uShadowColor, 0, 0, 0);\r
        gl.uniform1f(shade.uShadow, s.shadow * (s.light ? 0.35 : 0.7));\r
        gl.uniform1f(shade.uClock, state.clock);\r
        gl.uniform4fv(shade.uParts, partData);\r
        gl.drawElements(gl.TRIANGLES, mesh.indices, mesh.indexType, 0);\r
      }\r
\r
      gl.useProgram(surfaceProgram);\r
      gl.uniform2f(surface.uViewport, mesh.width, mesh.height);\r
      gl.uniform2f(surface.uOffset, 0, 0);\r
      gl.uniform1i(surface.uField, 0);\r
      gl.uniform1i(surface.uPaint, 1);\r
      gl.uniform1i(surface.uSlope, 2);\r
      const yaw = state.turn.x;\r
      const pitch = state.turn.y;\r
      const cy = Math.cos(yaw);\r
      const sy = Math.sin(yaw);\r
      const cp = Math.cos(pitch);\r
      const sp = Math.sin(pitch);\r
      turnMatrix[0] = cy;\r
      turnMatrix[1] = sy * sp;\r
      turnMatrix[2] = -sy * cp;\r
      turnMatrix[3] = 0;\r
      turnMatrix[4] = cp;\r
      turnMatrix[5] = sp;\r
      turnMatrix[6] = sy;\r
      turnMatrix[7] = -cy * sp;\r
      turnMatrix[8] = cy * cp;\r
      gl.uniformMatrix3fv(surface.uTurn, false, turnMatrix);\r
      gl.uniform3f(surface.uColor, state.color[0], state.color[1], state.color[2]);\r
      gl.uniform1f(surface.uPaintMix, s.src && s.imageColors ? 1 : 0);\r
      gl.uniform1f(surface.uMaterial, s.material);\r
      gl.uniform1f(surface.uLight, s.light ? 1 : 0);\r
      gl.uniform1f(surface.uInflate, s.inflate);\r
      gl.uniform1f(surface.uClock, state.clock);\r
      gl.uniform4fv(surface.uParts, partData);\r
      gl.drawElements(gl.TRIANGLES, mesh.indices, mesh.indexType, 0);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!alive || !visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
\r
      if (reduce || !s.intro) state.clock = 10;\r
      else if (state.ready && state.clock < 10) state.clock = state.clock + dt > 1.8 ? 10 : state.clock + dt;\r
\r
      const hover = state.hover;\r
      const pointer = state.pointer;\r
      const pressing =\r
        state.ready && (pointer.dragging || (pointer.inside && !pointer.down && onSurface(pointer.x, pointer.y)));\r
      const follow = 1 - Math.exp(-dt / 0.05);\r
      const nextX = hover.x + (pointer.x - hover.x) * follow;\r
      const nextY = hover.y + (pointer.y - hover.y) * follow;\r
      const blend = 1 - Math.exp(-dt / 0.04);\r
      hover.vx += ((nextX - hover.x) / Math.max(dt, 0.001) - hover.vx) * blend;\r
      hover.vy += ((nextY - hover.y) / Math.max(dt, 0.001) - hover.vy) * blend;\r
      hover.x = nextX;\r
      hover.y = nextY;\r
      const goal = pressing ? 1 : 0;\r
      hover.power += (goal - hover.power) * (1 - Math.exp(-dt / (pressing ? 0.12 : 0.25)));\r
\r
      const turn = state.turn;\r
      const aimX = pointer.inside && !reduce ? (pointer.x / Math.max(1, mesh.width) - 0.5) * 0.7 : 0;\r
      const aimY = pointer.inside && !reduce ? (pointer.y / Math.max(1, mesh.height) - 0.5) * 0.4 : 0;\r
      turn.vx += (28 * (aimX - turn.x) - 10 * turn.vx) * dt;\r
      turn.vy += (28 * (aimY - turn.y) - 10 * turn.vy) * dt;\r
      turn.x += turn.vx * dt;\r
      turn.y += turn.vy * dt;\r
      const turning =\r
        Math.abs(aimX - turn.x) > 0.0005 ||\r
        Math.abs(aimY - turn.y) > 0.0005 ||\r
        Math.abs(turn.vx) > 0.001 ||\r
        Math.abs(turn.vy) > 0.001;\r
\r
      let energy = 0;\r
      if (state.ready) {\r
        updateGrip(s);\r
        state.accumulator += dt;\r
        let steps = 0;\r
        while (state.accumulator >= STEP && steps < 40) {\r
          energy = solve(STEP, s);\r
          state.accumulator -= STEP;\r
          steps++;\r
        }\r
        if (steps === 40) state.accumulator = 0;\r
        writeDynamic();\r
      }\r
      state.energy = energy;\r
      render();\r
\r
      const settling =\r
        !state.ready ||\r
        state.clock < 10 ||\r
        Math.abs(goal - hover.power) > 0.002 ||\r
        turning ||\r
        Math.hypot(pointer.x - hover.x, pointer.y - hover.y) > 0.1 ||\r
        pointer.dragging ||\r
        energy > 0.05 * Math.max(1, mesh.activeCount);\r
      if (settling) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!raf && alive && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const locatePointer = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      state.pointer.x = event.clientX - rect.left;\r
      state.pointer.y = event.clientY - rect.top;\r
      state.pointer.inside =\r
        state.pointer.x >= 0 && state.pointer.y >= 0 && state.pointer.x <= rect.width && state.pointer.y <= rect.height;\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      locatePointer(event);\r
      wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      locatePointer(event);\r
      if (!state.ready || !onSurface(state.pointer.x, state.pointer.y)) return;\r
      const s = settingsRef.current;\r
      state.pointer.down = true;\r
      state.pointer.startX = state.pointer.x;\r
      state.pointer.startY = state.pointer.y;\r
      state.pointer.startTime = performance.now();\r
      state.pointer.dragging = grab(state.pointer.x, state.pointer.y, s);\r
      container.setPointerCapture?.(event.pointerId);\r
      wake();\r
    };\r
\r
    const onPointerUp = (event: PointerEvent) => {\r
      if (!state.pointer.down) return;\r
      locatePointer(event);\r
      const s = settingsRef.current;\r
      const moved = Math.hypot(state.pointer.x - state.pointer.startX, state.pointer.y - state.pointer.startY);\r
      const quick = performance.now() - state.pointer.startTime < 260;\r
      release();\r
      if (moved < 8 && quick) poke(state.pointer.x, state.pointer.y, s);\r
      state.pointer.down = false;\r
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
    container.addEventListener('pointerdown', onPointerDown);\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerup', onPointerUp);\r
    window.addEventListener('pointercancel', onPointerUp);\r
    container.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
\r
    contentRef.current = () => {\r
      state.ready = false;\r
      state.clock = settingsRef.current.intro && !reduce ? 0 : 10;\r
      rasterize();\r
    };\r
    wakeRef.current = () => {\r
      if (!raf) render();\r
      wake();\r
    };\r
\r
    return () => {\r
      alive = false;\r
      state.buildToken++;\r
      cancelAnimationFrame(raf);\r
      window.clearTimeout(resizeTimer);\r
      wakeRef.current = null;\r
      contentRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      container.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerup', onPointerUp);\r
      window.removeEventListener('pointercancel', onPointerUp);\r
      container.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteBuffer(restBuffer);\r
      gl.deleteBuffer(dynamicBuffer);\r
      gl.deleteBuffer(indexBuffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteTexture(fieldTexture);\r
      gl.deleteTexture(paintTexture);\r
      gl.deleteTexture(slopeTexture);\r
      gl.deleteProgram(surfaceProgram);\r
      gl.deleteProgram(shadowProgram);\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    if (builtRef.current === contentKey) return;\r
    builtRef.current = contentKey;\r
    contentRef.current?.();\r
  }, [contentKey]);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div\r
      ref={containerRef}\r
      className={\`elastic-mesh\${className ? \` \${className}\` : ''}\`}\r
      style={style}\r
      role="img"\r
      aria-label={settings.src ? 'Elastic logo' : settings.text}\r
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className="elastic-mesh-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default ElasticMesh;\r
`,a=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties, type HTMLAttributes } from 'react';\r
\r
export type ElasticMeshMaterial = 'balloon' | 'chrome' | 'jelly' | 'clay';\r
\r
export interface ElasticMeshProps extends HTMLAttributes<HTMLDivElement> {\r
  text?: string;\r
  src?: string;\r
  fontFamily?: string;\r
  fontWeight?: number | string;\r
  color?: string;\r
  imageColors?: boolean;\r
  material?: ElasticMeshMaterial;\r
  inflate?: number;\r
  stiffness?: number;\r
  wobble?: number;\r
  grabRadius?: number;\r
  stretch?: number;\r
  press?: number;\r
  shadow?: number;\r
  intro?: boolean;\r
  theme?: 'dark' | 'light';\r
  dpr?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
type Settings = {\r
  text: string;\r
  src: string;\r
  fontFamily: string;\r
  fontWeight: number | string;\r
  color: string;\r
  imageColors: boolean;\r
  material: number;\r
  inflate: number;\r
  stiffness: number;\r
  wobble: number;\r
  grabRadius: number;\r
  stretch: number;\r
  press: number;\r
  shadow: number;\r
  intro: boolean;\r
  light: boolean;\r
  dpr?: number;\r
};\r
\r
type Part = { x: number; y: number; left: number; size: number; delay: number };\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
in vec2 aRest;\r
in vec4 aStrain;\r
in vec3 aDent;\r
uniform vec2 uViewport;\r
uniform vec2 uOffset;\r
out vec2 vRest;\r
out vec4 vStrain;\r
out vec3 vDent;\r
void main() {\r
  vRest = aRest;\r
  vStrain = aStrain;\r
  vDent = aDent;\r
  vec2 clip = (aPosition + uOffset) / uViewport * 2.0 - 1.0;\r
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);\r
}\`;\r
\r
const SHADOW = \`#version 300 es\r
precision highp float;\r
in vec2 vRest;\r
in vec4 vStrain;\r
in vec3 vDent;\r
uniform sampler2D uField;\r
uniform vec3 uShadowColor;\r
uniform float uShadow;\r
uniform vec4 uParts[64];\r
uniform float uClock;\r
\r
float arrival(float delay) {\r
  float t = max(uClock - delay, 0.0);\r
  float omega = 15.0;\r
  float zeta = 0.38;\r
  float damped = omega * sqrt(1.0 - zeta * zeta);\r
  return 1.0 - exp(-zeta * omega * t) * (cos(damped * t) + zeta * omega / damped * sin(damped * t));\r
}\r
\r
float owner(vec2 rest) {\r
  ivec2 size = textureSize(uField, 0);\r
  ivec2 texel = clamp(ivec2(rest * vec2(size)), ivec2(0), size - 1);\r
  return floor(texelFetch(uField, texel, 0).w + 0.5);\r
}\r
\r
vec3 settle(vec2 rest) {\r
  if (uClock > 9.0) return vec3(rest, 1.0);\r
  float id = owner(rest);\r
  if (id < 0.5 || id > 64.5) return vec3(rest, 1.0);\r
  vec4 part = uParts[int(id) - 1];\r
  float presence = arrival(part.z);\r
  float size = max(mix(0.5, 1.0, presence), 0.05);\r
  vec2 moved = part.xy + (rest - part.xy) / size;\r
  return vec3(moved, presence * step(abs(owner(moved) - id), 0.5));\r
}\r
out vec4 outColor;\r
void main() {\r
  vec3 arrived = settle(vRest);\r
  float shade = texture(uField, arrived.xy).z * uShadow * clamp(arrived.z, 0.0, 1.0) * (1.0 - 0.35 * clamp(vDent.x, 0.0, 1.0));\r
  outColor = vec4(uShadowColor * shade, shade);\r
}\`;\r
\r
const SURFACE = \`#version 300 es\r
precision highp float;\r
in vec2 vRest;\r
in vec4 vStrain;\r
in vec3 vDent;\r
uniform sampler2D uField;\r
uniform sampler2D uSlope;\r
uniform sampler2D uPaint;\r
uniform vec3 uColor;\r
uniform float uPaintMix;\r
uniform float uMaterial;\r
uniform float uLight;\r
uniform float uInflate;\r
uniform mat3 uTurn;\r
uniform vec4 uParts[64];\r
uniform float uClock;\r
out vec4 outColor;\r
\r
float arrival(float delay) {\r
  float t = max(uClock - delay, 0.0);\r
  float omega = 15.0;\r
  float zeta = 0.38;\r
  float damped = omega * sqrt(1.0 - zeta * zeta);\r
  return 1.0 - exp(-zeta * omega * t) * (cos(damped * t) + zeta * omega / damped * sin(damped * t));\r
}\r
\r
float owner(vec2 rest) {\r
  ivec2 size = textureSize(uField, 0);\r
  ivec2 texel = clamp(ivec2(rest * vec2(size)), ivec2(0), size - 1);\r
  return floor(texelFetch(uField, texel, 0).w + 0.5);\r
}\r
\r
vec3 settle(vec2 rest) {\r
  if (uClock > 9.0) return vec3(rest, 1.0);\r
  float id = owner(rest);\r
  if (id < 0.5 || id > 64.5) return vec3(rest, 1.0);\r
  vec4 part = uParts[int(id) - 1];\r
  float presence = arrival(part.z);\r
  float size = max(mix(0.5, 1.0, presence), 0.05);\r
  vec2 moved = part.xy + (rest - part.xy) / size;\r
  return vec3(moved, presence * step(abs(owner(moved) - id), 0.5));\r
}\r
vec4 cubic(float v) {\r
  vec4 n = vec4(1.0, 2.0, 3.0, 4.0) - v;\r
  vec4 s = n * n * n;\r
  float x = s.x;\r
  float y = s.y - 4.0 * s.x;\r
  float z = s.z - 4.0 * s.y + 6.0 * s.x;\r
  return vec4(x, y, z, 6.0 - x - y - z) / 6.0;\r
}\r
\r
vec2 smoothSlope(vec2 uv) {\r
  vec2 size = vec2(textureSize(uSlope, 0));\r
  vec2 cell = uv * size - 0.5;\r
  vec2 f = fract(cell);\r
  cell -= f;\r
  vec4 xc = cubic(f.x);\r
  vec4 yc = cubic(f.y);\r
  vec4 corner = cell.xxyy + vec2(-0.5, 1.5).xyxy;\r
  vec4 sum = vec4(xc.xz + xc.yw, yc.xz + yc.yw);\r
  vec4 offset = (corner + vec4(xc.yw, yc.yw) / sum) / size.xxyy;\r
  vec2 a = texture(uSlope, offset.xz).xy;\r
  vec2 b = texture(uSlope, offset.yz).xy;\r
  vec2 c = texture(uSlope, offset.xw).xy;\r
  vec2 d = texture(uSlope, offset.yw).xy;\r
  float sx = sum.x / (sum.x + sum.y);\r
  float sy = sum.z / (sum.z + sum.w);\r
  return mix(mix(d, c, sx), mix(b, a, sx), sy);\r
}\r
\r
float panel(vec3 r, vec3 center, vec2 size, float soft) {\r
  vec3 forward = normalize(center);\r
  vec3 side = normalize(cross(vec3(0.0, 1.0, 0.0), forward));\r
  vec3 lift = cross(forward, side);\r
  float facing = dot(r, forward);\r
  vec2 local = vec2(dot(r, side), dot(r, lift)) / max(facing, 0.1);\r
  vec2 q = abs(local) - size;\r
  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);\r
  return smoothstep(soft, -soft, d) * smoothstep(0.05, 0.3, facing);\r
}\r
\r
vec3 studio(vec3 r, float blur) {\r
  float y = r.y;\r
  vec3 skyLow = mix(vec3(0.92, 0.95, 1.0), vec3(1.0), uLight);\r
  vec3 skyHigh = mix(vec3(0.1, 0.11, 0.14), vec3(0.62, 0.64, 0.7), uLight);\r
  vec3 groundNear = mix(vec3(0.12, 0.11, 0.1), vec3(0.3, 0.29, 0.28), uLight);\r
  vec3 groundFar = mix(vec3(0.005), vec3(0.1), uLight);\r
  vec3 sky = mix(skyLow, skyHigh, smoothstep(0.0, 0.75, y));\r
  vec3 ground = mix(groundNear, groundFar, smoothstep(0.0, -0.4, y));\r
  float edge = 0.004 + blur;\r
  vec3 c = mix(ground, sky, smoothstep(-edge, edge, y));\r
  float glow = 0.035 + blur;\r
  c += vec3(2.2) * exp(-pow((y - 0.02) / glow, 2.0)) * (0.035 / glow);\r
  c += vec3(7.0) * panel(r, vec3(-0.55, 0.55, 0.62), vec2(0.36, 0.2), 0.025 + blur);\r
  c += vec3(4.5) * panel(r, vec3(0.9, 0.18, 0.4), vec2(0.045, 0.85), 0.01 + blur) * (0.045 / (0.045 + blur));\r
  c += vec3(3.2) * panel(r, vec3(-0.95, 0.1, 0.32), vec2(0.035, 0.7), 0.01 + blur) * (0.035 / (0.035 + blur));\r
  c += vec3(2.4) * panel(r, vec3(0.0, 0.92, 0.38), vec2(1.1, 0.045), 0.01 + blur) * (0.045 / (0.045 + blur));\r
  return c;\r
}\r
\r
vec3 tone(vec3 x) {\r
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);\r
}\r
\r
void main() {\r
  vec3 arrived = settle(vRest);\r
  vec2 rest = arrived.xy;\r
  float presence = arrived.z;\r
  vec4 field = texture(uField, rest);\r
  float edge = field.y;\r
  float edgeWidth = max(fwidth(edge), 0.0001);\r
  if (edge < -3.0 * edgeWidth || presence <= 0.001) discard;\r
  float cover = clamp(edge / edgeWidth + 0.5, 0.0, 1.0);\r
\r
  vec2 slope = smoothSlope(rest);\r
  mat2 strain = mat2(vStrain.xy, vStrain.zw);\r
  float area = max(determinant(strain), 0.2);\r
  float lift = uInflate * presence * inversesqrt(area);\r
  float keep = clamp(1.0 - vDent.x, 0.15, 1.6);\r
  vec2 restGradient = (slope * keep - field.x * vDent.yz) * lift;\r
  vec2 gradient = inverse(transpose(strain)) * restGradient;\r
  vec3 normal = normalize(vec3(-gradient.x, gradient.y, 1.0));\r
  float depth = field.x * keep * lift;\r
\r
  vec3 turned = uTurn * normal;\r
  vec3 reflected = uTurn * reflect(vec3(0.0, 0.0, -1.0), normal);\r
  float footprint = length(fwidth(reflected));\r
  float facing = max(normal.z, 0.0);\r
  float fresnel = pow(1.0 - facing, 5.0);\r
  vec3 lightDir = normalize(vec3(-0.5, 0.62, 0.62));\r
  float wrap = max((dot(turned, lightDir) + 0.45) / 1.45, 0.0);\r
  float key = max(dot(turned, lightDir), 0.0);\r
  float occlusion = mix(0.55, 1.0, smoothstep(0.0, 12.0, depth));\r
\r
  vec3 paint = texture(uPaint, rest).rgb;\r
  vec3 base = mix(uColor, paint, uPaintMix);\r
  vec3 color;\r
  if (uMaterial < 0.5) {\r
    vec3 env = studio(reflected, 0.04 + footprint * 0.6);\r
    float reflectance = 0.045 + 0.955 * fresnel;\r
    vec3 deep = base * base * 0.55;\r
    vec3 body = mix(deep, base * 1.08, wrap) * occlusion;\r
    body += base * pow(1.0 - facing, 2.0) * 0.18;\r
    color = body * (1.0 - reflectance) + tone(env * reflectance * 0.9);\r
  } else if (uMaterial < 1.5) {\r
    vec3 env = studio(reflected, footprint * 0.6);\r
    vec3 tint = mix(vec3(1.0), base, 0.6) * 0.92;\r
    vec3 reflectance = tint + (1.0 - tint) * fresnel;\r
    color = tone(env * reflectance * mix(0.55, 1.0, occlusion) * 1.1);\r
  } else if (uMaterial < 2.5) {\r
    vec3 env = studio(reflected, 0.03 + footprint * 0.6);\r
    float core = smoothstep(0.0, 1.0, facing);\r
    vec3 glow = mix(base * base * 0.35, min(base * 1.45 + 0.08, vec3(1.0)), core * core);\r
    vec3 body = glow * mix(0.7, 1.0, occlusion) + base * wrap * 0.18;\r
    float reflectance = 0.03 + 0.97 * fresnel;\r
    color = body * (1.0 - reflectance) + tone(env * reflectance * 0.85);\r
  } else {\r
    vec3 env = studio(reflected, 0.35 + footprint * 0.6);\r
    vec3 body = base * (0.3 + 0.7 * wrap) * mix(0.68, 1.0, occlusion);\r
    body += base * key * 0.12;\r
    color = body + tone(env * (0.012 + 0.18 * fresnel)) * 0.5;\r
  }\r
  float alpha = cover * smoothstep(0.0, 0.18, presence);\r
  outColor = vec4(color * alpha, alpha);\r
}\`;\r
\r
const MATERIALS: Record<string, number> = { balloon: 0, chrome: 1, jelly: 2, clay: 3 };\r
const MAX_FIELD = 720;\r
const MAX_NODES = 5200;\r
const STEP = 1 / 480;\r
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
  gl.bindAttribLocation(program, 1, 'aRest');\r
  gl.bindAttribLocation(program, 2, 'aStrain');\r
  gl.bindAttribLocation(program, 3, 'aDent');\r
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
const distance1d = (f: Float64Array, n: number, d: Float64Array, v: Int32Array, z: Float64Array) => {\r
  let k = 0;\r
  v[0] = 0;\r
  z[0] = -Infinity;\r
  z[1] = Infinity;\r
  for (let q = 1; q < n; q++) {\r
    let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);\r
    while (s <= z[k]) {\r
      k--;\r
      s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);\r
    }\r
    k++;\r
    v[k] = q;\r
    z[k] = s;\r
    z[k + 1] = Infinity;\r
  }\r
  k = 0;\r
  for (let q = 0; q < n; q++) {\r
    while (z[k + 1] < q) k++;\r
    d[q] = (q - v[k]) * (q - v[k]) + f[v[k]];\r
  }\r
};\r
\r
const distanceField = (grid: Float64Array, width: number, height: number) => {\r
  const n = Math.max(width, height);\r
  const f = new Float64Array(n);\r
  const d = new Float64Array(n);\r
  const v = new Int32Array(n);\r
  const z = new Float64Array(n + 1);\r
  for (let x = 0; x < width; x++) {\r
    for (let y = 0; y < height; y++) f[y] = grid[y * width + x];\r
    distance1d(f, height, d, v, z);\r
    for (let y = 0; y < height; y++) grid[y * width + x] = d[y];\r
  }\r
  for (let y = 0; y < height; y++) {\r
    for (let x = 0; x < width; x++) f[x] = grid[y * width + x];\r
    distance1d(f, width, d, v, z);\r
    for (let x = 0; x < width; x++) grid[y * width + x] = Math.sqrt(d[x]);\r
  }\r
  return grid;\r
};\r
\r
const nearestLabels = (labels: Int32Array, width: number, height: number) => {\r
  const far = 1e20;\r
  const column = new Float64Array(width * height);\r
  const site = new Int32Array(width * height);\r
  for (let x = 0; x < width; x++) {\r
    let last = -1;\r
    for (let y = 0; y < height; y++) {\r
      const i = y * width + x;\r
      if (labels[i]) last = y;\r
      site[i] = last;\r
      column[i] = last >= 0 ? (y - last) * (y - last) : far;\r
    }\r
    last = -1;\r
    for (let y = height - 1; y >= 0; y--) {\r
      const i = y * width + x;\r
      if (labels[i]) last = y;\r
      if (last >= 0 && (last - y) * (last - y) < column[i]) {\r
        column[i] = (last - y) * (last - y);\r
        site[i] = last;\r
      }\r
    }\r
  }\r
  const out = new Float32Array(width * height);\r
  const f = new Float64Array(width);\r
  const v = new Int32Array(width);\r
  const z = new Float64Array(width + 1);\r
  for (let y = 0; y < height; y++) {\r
    for (let x = 0; x < width; x++) f[x] = column[y * width + x];\r
    let k = 0;\r
    v[0] = 0;\r
    z[0] = -Infinity;\r
    z[1] = Infinity;\r
    for (let q = 1; q < width; q++) {\r
      let cut = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);\r
      while (cut <= z[k]) {\r
        k--;\r
        cut = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);\r
      }\r
      k++;\r
      v[k] = q;\r
      z[k] = cut;\r
      z[k + 1] = Infinity;\r
    }\r
    k = 0;\r
    for (let x = 0; x < width; x++) {\r
      while (z[k + 1] < x) k++;\r
      const sx = v[k];\r
      const sy = site[y * width + sx];\r
      out[y * width + x] = sy >= 0 ? labels[sy * width + sx] : 0;\r
    }\r
  }\r
  return out;\r
};\r
\r
const inflateField = (mask: Float32Array, width: number, height: number) => {\r
  const levels = [{ width, height, mask }];\r
  while (Math.max(levels[levels.length - 1].width, levels[levels.length - 1].height) > 48) {\r
    const prev = levels[levels.length - 1];\r
    const w = Math.ceil(prev.width / 2);\r
    const h = Math.ceil(prev.height / 2);\r
    const next = new Float32Array(w * h);\r
    for (let y = 0; y < h; y++) {\r
      for (let x = 0; x < w; x++) {\r
        let sum = 0;\r
        let count = 0;\r
        for (let dy = 0; dy < 2; dy++) {\r
          for (let dx = 0; dx < 2; dx++) {\r
            const sx = x * 2 + dx;\r
            const sy = y * 2 + dy;\r
            if (sx < prev.width && sy < prev.height) {\r
              sum += prev.mask[sy * prev.width + sx];\r
              count++;\r
            }\r
          }\r
        }\r
        next[y * w + x] = sum / count;\r
      }\r
    }\r
    levels.push({ width: w, height: h, mask: next });\r
  }\r
\r
  let solution: Float32Array | null = null;\r
  for (let level = levels.length - 1; level >= 0; level--) {\r
    const { width: w, height: h, mask: m } = levels[level];\r
    const current = new Float32Array(w * h);\r
    if (solution) {\r
      const pw = levels[level + 1].width;\r
      const ph = levels[level + 1].height;\r
      for (let y = 0; y < h; y++) {\r
        for (let x = 0; x < w; x++) {\r
          const fx = clamp((x + 0.5) / 2 - 0.5, 0, pw - 1);\r
          const fy = clamp((y + 0.5) / 2 - 0.5, 0, ph - 1);\r
          const x0 = Math.floor(fx);\r
          const y0 = Math.floor(fy);\r
          const x1 = Math.min(pw - 1, x0 + 1);\r
          const y1 = Math.min(ph - 1, y0 + 1);\r
          const tx = fx - x0;\r
          const ty = fy - y0;\r
          const top = solution[y0 * pw + x0] * (1 - tx) + solution[y0 * pw + x1] * tx;\r
          const bottom = solution[y1 * pw + x0] * (1 - tx) + solution[y1 * pw + x1] * tx;\r
          current[y * w + x] = top * (1 - ty) + bottom * ty;\r
        }\r
      }\r
    }\r
    const source = 4 ** level;\r
    const iterations = level === levels.length - 1 ? 300 : 60;\r
    for (let iteration = 0; iteration < iterations; iteration++) {\r
      for (let y = 0; y < h; y++) {\r
        for (let x = 0; x < w; x++) {\r
          const i = y * w + x;\r
          if (m[i] < 0.5) {\r
            current[i] = 0;\r
            continue;\r
          }\r
          const l = x > 0 ? current[i - 1] : 0;\r
          const r = x < w - 1 ? current[i + 1] : 0;\r
          const u = y > 0 ? current[i - w] : 0;\r
          const d = y < h - 1 ? current[i + w] : 0;\r
          current[i] += ((l + r + u + d + source) * 0.25 - current[i]) * 1.85;\r
        }\r
      }\r
    }\r
    solution = current;\r
  }\r
  return solution as Float32Array;\r
};\r
\r
const blurField = (source: ArrayLike<number>, width: number, height: number, radius: number) => {\r
  const r = Math.max(1, Math.round(radius));\r
  const sigma = r / 2.5;\r
  const kernel: number[] = [];\r
  let total = 0;\r
  for (let i = -r; i <= r; i++) {\r
    const weight = Math.exp(-(i * i) / (2 * sigma * sigma));\r
    kernel.push(weight);\r
    total += weight;\r
  }\r
  for (let i = 0; i < kernel.length; i++) kernel[i] /= total;\r
  const temp = new Float32Array(width * height);\r
  const out = new Float32Array(width * height);\r
  for (let y = 0; y < height; y++) {\r
    for (let x = 0; x < width; x++) {\r
      let sum = 0;\r
      for (let i = -r; i <= r; i++) sum += source[y * width + clamp(x + i, 0, width - 1)] * kernel[i + r];\r
      temp[y * width + x] = sum;\r
    }\r
  }\r
  for (let y = 0; y < height; y++) {\r
    for (let x = 0; x < width; x++) {\r
      let sum = 0;\r
      for (let i = -r; i <= r; i++) sum += temp[clamp(y + i, 0, height - 1) * width + x] * kernel[i + r];\r
      out[y * width + x] = sum;\r
    }\r
  }\r
  return out;\r
};\r
\r
const ElasticMesh = ({\r
  text = 'Squish',\r
  src = '',\r
  fontFamily = 'system-ui, sans-serif',\r
  fontWeight = 900,\r
  color = '#3b5bff',\r
  imageColors = true,\r
  material = 'balloon',\r
  inflate = 1,\r
  stiffness = 0.5,\r
  wobble = 0.6,\r
  grabRadius = 70,\r
  stretch = 0.5,\r
  press = 0.5,\r
  shadow = 0.5,\r
  intro = true,\r
  theme = 'dark',\r
  dpr,\r
  className = '',\r
  style,\r
  ...rest\r
}: ElasticMeshProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const contentRef = useRef<(() => void) | null>(null);\r
  const settings: Settings = {\r
    text: String(text),\r
    src: String(src || ''),\r
    fontFamily: String(fontFamily),\r
    fontWeight,\r
    color: String(color),\r
    imageColors,\r
    material: MATERIALS[material] ?? 0,\r
    inflate: clamp(inflate, 0.1, 3),\r
    stiffness: clamp(stiffness, 0, 1),\r
    wobble: clamp(wobble, 0, 1),\r
    grabRadius: clamp(grabRadius, 10, 400),\r
    stretch: clamp(stretch, 0, 1),\r
    press: clamp(press, 0, 1),\r
    shadow: clamp(shadow, 0, 1),\r
    intro,\r
    light: theme === 'light',\r
    dpr\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
  const contentKey = \`\${settings.text}|\${settings.src}|\${settings.fontFamily}|\${settings.fontWeight}\`;\r
  const builtRef = useRef(contentKey);\r
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
    const surfaceProgram = link(gl, SURFACE);\r
    const shadowProgram = link(gl, SHADOW);\r
    if (!surfaceProgram || !shadowProgram) return undefined;\r
    const surface = locate(gl, surfaceProgram, [\r
      'uViewport',\r
      'uOffset',\r
      'uField',\r
      'uPaint',\r
      'uSlope',\r
      'uColor',\r
      'uPaintMix',\r
      'uMaterial',\r
      'uLight',\r
      'uInflate',\r
      'uTurn',\r
      'uClock',\r
      'uParts'\r
    ]);\r
    const shade = locate(gl, shadowProgram, [\r
      'uViewport',\r
      'uOffset',\r
      'uField',\r
      'uShadowColor',\r
      'uShadow',\r
      'uClock',\r
      'uParts'\r
    ]);\r
\r
    const fieldTexture = gl.createTexture();\r
    const paintTexture = gl.createTexture();\r
    const slopeTexture = gl.createTexture();\r
    for (const texture of [fieldTexture, paintTexture, slopeTexture]) {\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));\r
    }\r
\r
    const vao = gl.createVertexArray();\r
    const restBuffer = gl.createBuffer();\r
    const dynamicBuffer = gl.createBuffer();\r
    const indexBuffer = gl.createBuffer();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, restBuffer);\r
    gl.enableVertexAttribArray(1);\r
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, dynamicBuffer);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 36, 0);\r
    gl.enableVertexAttribArray(2);\r
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 36, 8);\r
    gl.enableVertexAttribArray(3);\r
    gl.vertexAttribPointer(3, 3, gl.FLOAT, false, 36, 24);\r
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);\r
    gl.bindVertexArray(null);\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const partData = new Float32Array(256);\r
    const turnMatrix = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);\r
    const mesh = {\r
      cols: 0,\r
      rows: 0,\r
      spacing: 1,\r
      count: 0,\r
      indices: 0,\r
      restX: new Float32Array(0),\r
      restY: new Float32Array(0),\r
      x: new Float32Array(0),\r
      y: new Float32Array(0),\r
      vx: new Float32Array(0),\r
      vy: new Float32Array(0),\r
      dent: new Float32Array(0),\r
      dentV: new Float32Array(0),\r
      grip: new Float32Array(0),\r
      gripX: new Float32Array(0),\r
      gripY: new Float32Array(0),\r
      active: new Uint8Array(0),\r
      neighbors: new Int32Array(0),\r
      dynamic: new Float32Array(0),\r
      anchorX: new Float32Array(0),\r
      anchorY: new Float32Array(0),\r
      indexType: gl.UNSIGNED_SHORT as number,\r
      activeCount: 0,\r
      width: 1,\r
      height: 1\r
    };\r
    const state = {\r
      width: 1,\r
      height: 1,\r
      ready: false,\r
      fieldWidth: 1,\r
      fieldHeight: 1,\r
      fieldScale: 1,\r
      sdf: new Float32Array(0),\r
      parts: [] as Part[],\r
      clock: settingsRef.current.intro && !reduce ? 0 : 10,\r
      colorKey: '',\r
      color: [0.31, 0.42, 1],\r
      pointer: { x: 0, y: 0, inside: false, down: false, startX: 0, startY: 0, startTime: 0, dragging: false },\r
      hover: { x: 0, y: 0, vx: 0, vy: 0, power: 0 },\r
      turn: { x: 0, y: 0, vx: 0, vy: 0 },\r
      accumulator: 0,\r
      energy: 1,\r
      buildToken: 0\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let alive = true;\r
    let resizeTimer = 0;\r
\r
    const toRgb = (value: string): number[] => {\r
      if (!probe || !value) return [0.31, 0.42, 1];\r
      probe.fillStyle = '#000000';\r
      probe.fillStyle = /^[0-9a-f]{3,8}$/i.test(value) ? \`#\${value}\` : value;\r
      probe.fillRect(0, 0, 1, 1);\r
      const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
      return [r / 255, g / 255, b / 255];\r
    };\r
\r
    const sampleSdf = (px: number, py: number) => {\r
      const fx = clamp(Math.round(px * state.fieldScale), 0, state.fieldWidth - 1);\r
      const fy = clamp(Math.round(py * state.fieldScale), 0, state.fieldHeight - 1);\r
      return state.sdf[fy * state.fieldWidth + fx] || -1e6;\r
    };\r
\r
    const buildMesh = () => {\r
      const { width, height } = state;\r
      const spacing = Math.max(7, Math.sqrt((width * height) / MAX_NODES));\r
      const cols = Math.ceil(width / spacing) + 1;\r
      const rows = Math.ceil(height / spacing) + 1;\r
      const count = cols * rows;\r
      const sx = width / (cols - 1);\r
      const sy = height / (rows - 1);\r
      mesh.cols = cols;\r
      mesh.rows = rows;\r
      mesh.width = width;\r
      mesh.height = height;\r
      mesh.spacing = (sx + sy) / 2;\r
      mesh.count = count;\r
      mesh.restX = new Float32Array(count);\r
      mesh.restY = new Float32Array(count);\r
      mesh.x = new Float32Array(count);\r
      mesh.y = new Float32Array(count);\r
      mesh.vx = new Float32Array(count);\r
      mesh.vy = new Float32Array(count);\r
      mesh.dent = new Float32Array(count);\r
      mesh.dentV = new Float32Array(count);\r
      mesh.grip = new Float32Array(count);\r
      mesh.gripX = new Float32Array(count);\r
      mesh.gripY = new Float32Array(count);\r
      mesh.active = new Uint8Array(count);\r
      mesh.dynamic = new Float32Array(count * 9);\r
      const rest = new Float32Array(count * 2);\r
      const reach = -2.5 * mesh.spacing;\r
      for (let j = 0; j < rows; j++) {\r
        for (let i = 0; i < cols; i++) {\r
          const k = j * cols + i;\r
          const px = i * sx;\r
          const py = j * sy;\r
          mesh.restX[k] = px;\r
          mesh.restY[k] = py;\r
          mesh.x[k] = px;\r
          mesh.y[k] = py;\r
          rest[k * 2] = px / width;\r
          rest[k * 2 + 1] = py / height;\r
          mesh.active[k] = state.ready && sampleSdf(px, py) > reach ? 1 : 0;\r
        }\r
      }\r
      const neighbors = new Int32Array(count * 8).fill(-1);\r
      const offsets = [\r
        [-1, 0],\r
        [1, 0],\r
        [0, -1],\r
        [0, 1],\r
        [-1, -1],\r
        [1, -1],\r
        [-1, 1],\r
        [1, 1]\r
      ];\r
      for (let j = 0; j < rows; j++) {\r
        for (let i = 0; i < cols; i++) {\r
          const k = j * cols + i;\r
          if (!mesh.active[k]) continue;\r
          offsets.forEach(([di, dj], n) => {\r
            const ni = i + di;\r
            const nj = j + dj;\r
            if (ni < 0 || nj < 0 || ni >= cols || nj >= rows) return;\r
            const nk = nj * cols + ni;\r
            if (mesh.active[nk]) neighbors[k * 8 + n] = nk;\r
          });\r
        }\r
      }\r
      mesh.neighbors = neighbors;\r
      mesh.activeCount = mesh.active.reduce((total, flag) => total + flag, 0);\r
      const margin = -(Math.min(width, height) * 0.14 + mesh.spacing * 3);\r
      const near = new Uint8Array(count);\r
      for (let k = 0; k < count; k++) near[k] = state.ready && sampleSdf(mesh.restX[k], mesh.restY[k]) > margin ? 1 : 0;\r
      const quads: number[] = [];\r
      for (let j = 0; j < rows - 1; j++) {\r
        for (let i = 0; i < cols - 1; i++) {\r
          const a = j * cols + i;\r
          const b = a + 1;\r
          const c = a + cols;\r
          const d = c + 1;\r
          if (near[a] || near[b] || near[c] || near[d]) quads.push(a, c, b, b, c, d);\r
        }\r
      }\r
      const indexData = count > 65535 ? new Uint32Array(quads) : new Uint16Array(quads);\r
      mesh.indexType = count > 65535 ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;\r
      mesh.indices = quads.length;\r
      gl.bindBuffer(gl.ARRAY_BUFFER, restBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, rest, gl.STATIC_DRAW);\r
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);\r
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexData, gl.STATIC_DRAW);\r
      writeDynamic();\r
    };\r
\r
    const writeDynamic = () => {\r
      const { cols, rows, x, y, dent, dynamic, spacing } = mesh;\r
      const sx = mesh.width / Math.max(1, cols - 1);\r
      const sy = mesh.height / Math.max(1, rows - 1);\r
      for (let j = 0; j < rows; j++) {\r
        for (let i = 0; i < cols; i++) {\r
          const k = j * cols + i;\r
          const l = i > 0 ? k - 1 : k;\r
          const r = i < cols - 1 ? k + 1 : k;\r
          const u = j > 0 ? k - cols : k;\r
          const d = j < rows - 1 ? k + cols : k;\r
          const spanX = (r - l) * sx || spacing;\r
          const spanY = ((d - u) / cols) * sy || spacing;\r
          const o = k * 9;\r
          dynamic[o] = x[k];\r
          dynamic[o + 1] = y[k];\r
          dynamic[o + 2] = (x[r] - x[l]) / spanX;\r
          dynamic[o + 3] = (y[r] - y[l]) / spanX;\r
          dynamic[o + 4] = (x[d] - x[u]) / spanY;\r
          dynamic[o + 5] = (y[d] - y[u]) / spanY;\r
          dynamic[o + 6] = dent[k];\r
          dynamic[o + 7] = (dent[r] - dent[l]) / spanX;\r
          dynamic[o + 8] = (dent[d] - dent[u]) / spanY;\r
        }\r
      }\r
      gl.bindBuffer(gl.ARRAY_BUFFER, dynamicBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, dynamic, gl.DYNAMIC_DRAW);\r
    };\r
\r
    const rasterize = async () => {\r
      const s = settingsRef.current;\r
      const token = ++state.buildToken;\r
      const { width, height } = state;\r
      const scale = Math.min(1, MAX_FIELD / Math.max(width, height));\r
      const fw = Math.max(8, Math.round(width * scale));\r
      const fh = Math.max(8, Math.round(height * scale));\r
      const canvas2d = document.createElement('canvas');\r
      canvas2d.width = fw;\r
      canvas2d.height = fh;\r
      const ctx = canvas2d.getContext('2d', { willReadFrequently: true });\r
      if (!ctx) return;\r
      let drawn = false;\r
      if (s.src) {\r
        const image = new Image();\r
        image.crossOrigin = 'anonymous';\r
        image.decoding = 'async';\r
        image.src = s.src;\r
        try {\r
          await image.decode();\r
        } catch {\r
          return;\r
        }\r
        if (token !== state.buildToken) return;\r
        const fit = Math.min((fw * 0.78) / image.naturalWidth, (fh * 0.74) / image.naturalHeight);\r
        const w = image.naturalWidth * fit;\r
        const h = image.naturalHeight * fit;\r
        ctx.drawImage(image, (fw - w) / 2, (fh - h) / 2, w, h);\r
        drawn = true;\r
      } else {\r
        const family = s.fontFamily;\r
        const weight = s.fontWeight;\r
        if (document.fonts) await document.fonts.load(\`\${weight} 100px \${family}\`).catch(() => null);\r
        if (token !== state.buildToken) return;\r
        const lines = s.text.split('\\n');\r
        ctx.font = \`\${weight} 100px \${family}\`;\r
        let widest = 1;\r
        let ascent = 0;\r
        let descent = 0;\r
        for (const line of lines) {\r
          const m = ctx.measureText(line || ' ');\r
          widest = Math.max(widest, m.actualBoundingBoxLeft + m.actualBoundingBoxRight);\r
          ascent = Math.max(ascent, m.actualBoundingBoxAscent);\r
          descent = Math.max(descent, m.actualBoundingBoxDescent);\r
        }\r
        const lineHeight = 100 * 1.02;\r
        const blockHeight = ascent + descent + lineHeight * (lines.length - 1);\r
        const size = Math.min((fw * 0.8) / widest, (fh * 0.7) / blockHeight) * 100;\r
        ctx.font = \`\${weight} \${size}px \${family}\`;\r
        ctx.fillStyle = '#ffffff';\r
        ctx.textAlign = 'center';\r
        ctx.textBaseline = 'alphabetic';\r
        const k = size / 100;\r
        const top = (fh - blockHeight * k) / 2 + ascent * k;\r
        lines.forEach((line, index) => {\r
          const m = ctx.measureText(line || ' ');\r
          const shift = (m.actualBoundingBoxLeft - m.actualBoundingBoxRight) / 2;\r
          ctx.fillText(line, fw / 2 + shift, top + index * lineHeight * k);\r
        });\r
        drawn = true;\r
      }\r
      if (!drawn || token !== state.buildToken) return;\r
\r
      const pixels = ctx.getImageData(0, 0, fw, fh).data;\r
      const count = fw * fh;\r
      const mask = new Float32Array(count);\r
      const inside = new Float64Array(count);\r
      const outside = new Float64Array(count);\r
      for (let i = 0; i < count; i++) {\r
        const a = pixels[i * 4 + 3] / 255;\r
        mask[i] = a;\r
        inside[i] = a > 0.5 ? 1e10 : 0;\r
        outside[i] = a > 0.5 ? 0 : 1e10;\r
      }\r
      distanceField(inside, fw, fh);\r
      distanceField(outside, fw, fh);\r
      const binary = new Float32Array(count);\r
      const signed = new Float32Array(count);\r
      for (let i = 0; i < count; i++) {\r
        binary[i] = mask[i] > 0.5 ? 1 : 0;\r
        signed[i] =\r
          mask[i] > 0.02 && mask[i] < 0.98 ? mask[i] - 0.5 : inside[i] > 0 ? inside[i] - 0.5 : 0.5 - outside[i];\r
      }\r
      const labels = new Int32Array(count);\r
      const parts: Part[] = [];\r
      const queue = new Int32Array(count);\r
      for (let start = 0; start < count; start++) {\r
        if (!binary[start] || labels[start]) continue;\r
        const id = parts.length + 1;\r
        let head = 0;\r
        let tail = 0;\r
        let sumX = 0;\r
        let sumY = 0;\r
        let minX = Infinity;\r
        queue[tail++] = start;\r
        labels[start] = id;\r
        while (head < tail) {\r
          const i = queue[head++];\r
          const x = i % fw;\r
          const y = (i - x) / fw;\r
          sumX += x;\r
          sumY += y;\r
          if (x < minX) minX = x;\r
          if (x > 0 && binary[i - 1] && !labels[i - 1]) {\r
            labels[i - 1] = id;\r
            queue[tail++] = i - 1;\r
          }\r
          if (x < fw - 1 && binary[i + 1] && !labels[i + 1]) {\r
            labels[i + 1] = id;\r
            queue[tail++] = i + 1;\r
          }\r
          if (y > 0 && binary[i - fw] && !labels[i - fw]) {\r
            labels[i - fw] = id;\r
            queue[tail++] = i - fw;\r
          }\r
          if (y < fh - 1 && binary[i + fw] && !labels[i + fw]) {\r
            labels[i + fw] = id;\r
            queue[tail++] = i + fw;\r
          }\r
        }\r
        parts.push({ x: sumX / tail / scale, y: sumY / tail / scale, left: minX, size: tail, delay: 0 });\r
      }\r
      const order = [...parts].sort((a, b) => a.left - b.left);\r
      const gap = order.length > 1 ? Math.min(0.07, 0.5 / (order.length - 1)) : 0;\r
      order.forEach((part, rank) => {\r
        part.delay = rank * gap;\r
      });\r
      const owners = parts.length <= 64 ? nearestLabels(labels, fw, fh) : new Float32Array(count);\r
      const solution = blurField(inflateField(binary, fw, fh), fw, fh, 2);\r
      const edges = blurField(signed, fw, fh, 2);\r
      const shadowMask = blurField(binary, fw, fh, Math.max(4, Math.min(fw, fh) * 0.045));\r
      const field = new Float32Array(count * 4);\r
      const sdf = new Float32Array(count);\r
      const heights = new Float32Array(count);\r
      for (let i = 0; i < count; i++) {\r
        const distance = edges[i] / scale;\r
        sdf[i] = distance;\r
        heights[i] = Math.sqrt(Math.max(0, 2 * solution[i])) / scale;\r
        field[i * 4] = heights[i];\r
        field[i * 4 + 1] = distance;\r
        field[i * 4 + 2] = shadowMask[i];\r
        field[i * 4 + 3] = owners[i];\r
      }\r
      const slopes = new Float32Array(count * 2);\r
      for (let y = 0; y < fh; y++) {\r
        for (let x = 0; x < fw; x++) {\r
          const i = y * fw + x;\r
          let gx = (heights[y * fw + Math.min(fw - 1, x + 1)] - heights[y * fw + Math.max(0, x - 1)]) * 0.5 * scale;\r
          let gy = (heights[Math.min(fh - 1, y + 1) * fw + x] - heights[Math.max(0, y - 1) * fw + x]) * 0.5 * scale;\r
          const steep = Math.hypot(gx, gy);\r
          if (steep > 7) {\r
            gx *= 7 / steep;\r
            gy *= 7 / steep;\r
          }\r
          slopes[i * 2] = gx;\r
          slopes[i * 2 + 1] = gy;\r
        }\r
      }\r
      gl.bindTexture(gl.TEXTURE_2D, fieldTexture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, fw, fh, 0, gl.RGBA, gl.FLOAT, field);\r
      gl.bindTexture(gl.TEXTURE_2D, slopeTexture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG16F, fw, fh, 0, gl.RG, gl.FLOAT, slopes);\r
      gl.bindTexture(gl.TEXTURE_2D, paintTexture);\r
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas2d);\r
      state.fieldWidth = fw;\r
      state.fieldHeight = fh;\r
      state.fieldScale = scale;\r
      state.sdf = sdf;\r
      state.parts = parts;\r
      partData.fill(0);\r
      parts.slice(0, 64).forEach((part, index) => {\r
        partData[index * 4] = part.x / width;\r
        partData[index * 4 + 1] = part.y / height;\r
        partData[index * 4 + 2] = part.delay;\r
      });\r
      state.ready = true;\r
      buildMesh();\r
      wake();\r
    };\r
\r
    const solve = (dt: number, s: Settings) => {\r
      const { count, x, y, vx, vy, restX, restY, dent, dentV, active, neighbors, grip, gripX, gripY, spacing } = mesh;\r
      const firm = 0.4 + s.stiffness * 1.2;\r
      const anchor = 350 * firm * firm;\r
      const couple = anchor * (52 / Math.sqrt(firm) / spacing) ** 2;\r
      const ratio = reduce ? 0.8 : 0.5 - s.wobble * 0.42;\r
      const damping = 2 * ratio * Math.sqrt(anchor);\r
      const dentAnchor = anchor * 1.4;\r
      const dentCouple = dentAnchor * (18 / spacing) ** 2;\r
      const dentDamping = 2 * (ratio + 0.06) * Math.sqrt(dentAnchor);\r
      const gripStiffness = anchor * 30;\r
      const gripDamping = 1.2 * Math.sqrt(gripStiffness);\r
      const brush = state.pointer.dragging ? 0 : 10;\r
      const hover = state.hover;\r
      const pressRadius = s.grabRadius * 0.32;\r
      const pressInv = 1 / (2 * pressRadius * pressRadius);\r
      const pressPower = hover.power * s.press;\r
      const pressDepth = state.pointer.dragging ? 1.6 : 1;\r
      let energy = 0;\r
      for (let k = 0; k < count; k++) {\r
        if (!active[k]) continue;\r
        const ux = x[k] - restX[k];\r
        const uy = y[k] - restY[k];\r
        let ax = -anchor * ux - damping * vx[k];\r
        let ay = -anchor * uy - damping * vy[k];\r
        let ad = -dentAnchor * dent[k] - dentDamping * dentV[k];\r
        const base = k * 8;\r
        for (let n = 0; n < 8; n++) {\r
          const m = neighbors[base + n];\r
          if (m < 0) continue;\r
          const weight = n < 4 ? 1 : 0.5;\r
          ax += couple * weight * (x[m] - restX[m] - ux);\r
          ay += couple * weight * (y[m] - restY[m] - uy);\r
          ad += dentCouple * weight * (dent[m] - dent[k]);\r
        }\r
        if (pressPower > 0.001) {\r
          const dx = x[k] - hover.x;\r
          const dy = y[k] - hover.y;\r
          const falloff = Math.exp(-(dx * dx + dy * dy) * pressInv);\r
          ad += dentAnchor * 2.6 * pressDepth * pressPower * falloff;\r
          ax += (anchor * 0.3 * dx + brush * hover.vx) * pressPower * falloff;\r
          ay += (anchor * 0.3 * dy + brush * hover.vy) * pressPower * falloff;\r
        }\r
        if (grip[k] > 0) {\r
          ax += grip[k] * (gripStiffness * (gripX[k] - x[k]) - gripDamping * vx[k]);\r
          ay += grip[k] * (gripStiffness * (gripY[k] - y[k]) - gripDamping * vy[k]);\r
        }\r
        vx[k] += ax * dt;\r
        vy[k] += ay * dt;\r
        dentV[k] += ad * dt;\r
        energy += Math.abs(vx[k]) + Math.abs(vy[k]) + Math.abs(dentV[k]) * spacing;\r
      }\r
      for (let k = 0; k < count; k++) {\r
        if (!active[k]) continue;\r
        x[k] += vx[k] * dt;\r
        y[k] += vy[k] * dt;\r
        dent[k] = clamp(dent[k] + dentV[k] * dt, -0.6, 0.85);\r
      }\r
      return energy;\r
    };\r
\r
    const updateGrip = (s: Settings) => {\r
      const { pointer } = state;\r
      const { count, grip, gripX, gripY } = mesh;\r
      if (!pointer.dragging) return;\r
      const limit = Math.max(20, Math.min(state.width, state.height) * (0.08 + s.stretch * 0.32));\r
      const dx = pointer.x - pointer.startX;\r
      const dy = pointer.y - pointer.startY;\r
      const length = Math.hypot(dx, dy);\r
      const eased = length > 0 ? (limit * Math.tanh(length / limit)) / length : 0;\r
      for (let k = 0; k < count; k++) {\r
        if (grip[k] <= 0) continue;\r
        gripX[k] = mesh.anchorX[k] + dx * eased;\r
        gripY[k] = mesh.anchorY[k] + dy * eased;\r
      }\r
    };\r
\r
    const grab = (px: number, py: number, s: Settings) => {\r
      const { count, x, y, grip, active } = mesh;\r
      const radius = s.grabRadius * 0.3;\r
      const inv = 1 / (2 * radius * radius);\r
      mesh.anchorX = new Float32Array(count);\r
      mesh.anchorY = new Float32Array(count);\r
      let total = 0;\r
      for (let k = 0; k < count; k++) {\r
        if (!active[k]) continue;\r
        const dx = x[k] - px;\r
        const dy = y[k] - py;\r
        const weight = Math.exp(-(dx * dx + dy * dy) * inv);\r
        grip[k] = weight > 0.03 ? weight : 0;\r
        mesh.anchorX[k] = x[k];\r
        mesh.anchorY[k] = y[k];\r
        total += grip[k];\r
      }\r
      return total > 0;\r
    };\r
\r
    const release = () => {\r
      mesh.grip.fill(0);\r
      state.pointer.dragging = false;\r
    };\r
\r
    const poke = (px: number, py: number, s: Settings) => {\r
      const { count, x, y, vx, vy, dentV, active } = mesh;\r
      const radius = s.grabRadius;\r
      const inv = 1 / (2 * radius * radius);\r
      const strength = 0.4 + s.press;\r
      for (let k = 0; k < count; k++) {\r
        if (!active[k]) continue;\r
        const dx = x[k] - px;\r
        const dy = y[k] - py;\r
        const falloff = Math.exp(-(dx * dx + dy * dy) * inv);\r
        dentV[k] += 9 * strength * falloff;\r
        vx[k] += dx * 9 * strength * falloff;\r
        vy[k] += dy * 9 * strength * falloff;\r
      }\r
    };\r
\r
    const onSurface = (px: number, py: number) => {\r
      const { cols, rows, x, y, active, spacing } = mesh;\r
      let best = Infinity;\r
      let bestK = -1;\r
      const range = Math.ceil(80 / spacing);\r
      const ci = clamp(Math.round(px / (mesh.width / Math.max(1, cols - 1))), 0, cols - 1);\r
      const cj = clamp(Math.round(py / (mesh.height / Math.max(1, rows - 1))), 0, rows - 1);\r
      for (let j = Math.max(0, cj - range); j <= Math.min(rows - 1, cj + range); j++) {\r
        for (let i = Math.max(0, ci - range); i <= Math.min(cols - 1, ci + range); i++) {\r
          const k = j * cols + i;\r
          if (!active[k]) continue;\r
          const d = Math.hypot(x[k] - px, y[k] - py);\r
          if (d < best) {\r
            best = d;\r
            bestK = k;\r
          }\r
        }\r
      }\r
      if (bestK < 0) return false;\r
      return sampleSdf(mesh.restX[bestK] + (px - x[bestK]), mesh.restY[bestK] + (py - y[bestK])) > -4;\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      if (width !== state.width || height !== state.height) {\r
        const first = !state.ready && !state.buildToken;\r
        state.width = width;\r
        state.height = height;\r
        window.clearTimeout(resizeTimer);\r
        if (first) rasterize();\r
        else resizeTimer = window.setTimeout(rasterize, 160);\r
      }\r
      wake();\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const colorKey = s.color;\r
      if (colorKey !== state.colorKey) {\r
        state.colorKey = colorKey;\r
        state.color = toRgb(s.color);\r
      }\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      if (!state.ready || !mesh.indices) return;\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      gl.bindVertexArray(vao);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, fieldTexture);\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.bindTexture(gl.TEXTURE_2D, paintTexture);\r
      gl.activeTexture(gl.TEXTURE2);\r
      gl.bindTexture(gl.TEXTURE_2D, slopeTexture);\r
\r
      if (s.shadow > 0) {\r
        gl.useProgram(shadowProgram);\r
        gl.uniform2f(shade.uViewport, mesh.width, mesh.height);\r
        const drop = Math.min(mesh.width, mesh.height) * 0.035 * s.inflate;\r
        gl.uniform2f(shade.uOffset, drop * 0.25, drop);\r
        gl.uniform1i(shade.uField, 0);\r
        if (s.light) gl.uniform3f(shade.uShadowColor, 0.08, 0.08, 0.14);\r
        else gl.uniform3f(shade.uShadowColor, 0, 0, 0);\r
        gl.uniform1f(shade.uShadow, s.shadow * (s.light ? 0.35 : 0.7));\r
        gl.uniform1f(shade.uClock, state.clock);\r
        gl.uniform4fv(shade.uParts, partData);\r
        gl.drawElements(gl.TRIANGLES, mesh.indices, mesh.indexType, 0);\r
      }\r
\r
      gl.useProgram(surfaceProgram);\r
      gl.uniform2f(surface.uViewport, mesh.width, mesh.height);\r
      gl.uniform2f(surface.uOffset, 0, 0);\r
      gl.uniform1i(surface.uField, 0);\r
      gl.uniform1i(surface.uPaint, 1);\r
      gl.uniform1i(surface.uSlope, 2);\r
      const yaw = state.turn.x;\r
      const pitch = state.turn.y;\r
      const cy = Math.cos(yaw);\r
      const sy = Math.sin(yaw);\r
      const cp = Math.cos(pitch);\r
      const sp = Math.sin(pitch);\r
      turnMatrix[0] = cy;\r
      turnMatrix[1] = sy * sp;\r
      turnMatrix[2] = -sy * cp;\r
      turnMatrix[3] = 0;\r
      turnMatrix[4] = cp;\r
      turnMatrix[5] = sp;\r
      turnMatrix[6] = sy;\r
      turnMatrix[7] = -cy * sp;\r
      turnMatrix[8] = cy * cp;\r
      gl.uniformMatrix3fv(surface.uTurn, false, turnMatrix);\r
      gl.uniform3f(surface.uColor, state.color[0], state.color[1], state.color[2]);\r
      gl.uniform1f(surface.uPaintMix, s.src && s.imageColors ? 1 : 0);\r
      gl.uniform1f(surface.uMaterial, s.material);\r
      gl.uniform1f(surface.uLight, s.light ? 1 : 0);\r
      gl.uniform1f(surface.uInflate, s.inflate);\r
      gl.uniform1f(surface.uClock, state.clock);\r
      gl.uniform4fv(surface.uParts, partData);\r
      gl.drawElements(gl.TRIANGLES, mesh.indices, mesh.indexType, 0);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!alive || !visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
\r
      if (reduce || !s.intro) state.clock = 10;\r
      else if (state.ready && state.clock < 10) state.clock = state.clock + dt > 1.8 ? 10 : state.clock + dt;\r
\r
      const hover = state.hover;\r
      const pointer = state.pointer;\r
      const pressing =\r
        state.ready && (pointer.dragging || (pointer.inside && !pointer.down && onSurface(pointer.x, pointer.y)));\r
      const follow = 1 - Math.exp(-dt / 0.05);\r
      const nextX = hover.x + (pointer.x - hover.x) * follow;\r
      const nextY = hover.y + (pointer.y - hover.y) * follow;\r
      const blend = 1 - Math.exp(-dt / 0.04);\r
      hover.vx += ((nextX - hover.x) / Math.max(dt, 0.001) - hover.vx) * blend;\r
      hover.vy += ((nextY - hover.y) / Math.max(dt, 0.001) - hover.vy) * blend;\r
      hover.x = nextX;\r
      hover.y = nextY;\r
      const goal = pressing ? 1 : 0;\r
      hover.power += (goal - hover.power) * (1 - Math.exp(-dt / (pressing ? 0.12 : 0.25)));\r
\r
      const turn = state.turn;\r
      const aimX = pointer.inside && !reduce ? (pointer.x / Math.max(1, mesh.width) - 0.5) * 0.7 : 0;\r
      const aimY = pointer.inside && !reduce ? (pointer.y / Math.max(1, mesh.height) - 0.5) * 0.4 : 0;\r
      turn.vx += (28 * (aimX - turn.x) - 10 * turn.vx) * dt;\r
      turn.vy += (28 * (aimY - turn.y) - 10 * turn.vy) * dt;\r
      turn.x += turn.vx * dt;\r
      turn.y += turn.vy * dt;\r
      const turning =\r
        Math.abs(aimX - turn.x) > 0.0005 ||\r
        Math.abs(aimY - turn.y) > 0.0005 ||\r
        Math.abs(turn.vx) > 0.001 ||\r
        Math.abs(turn.vy) > 0.001;\r
\r
      let energy = 0;\r
      if (state.ready) {\r
        updateGrip(s);\r
        state.accumulator += dt;\r
        let steps = 0;\r
        while (state.accumulator >= STEP && steps < 40) {\r
          energy = solve(STEP, s);\r
          state.accumulator -= STEP;\r
          steps++;\r
        }\r
        if (steps === 40) state.accumulator = 0;\r
        writeDynamic();\r
      }\r
      state.energy = energy;\r
      render();\r
\r
      const settling =\r
        !state.ready ||\r
        state.clock < 10 ||\r
        Math.abs(goal - hover.power) > 0.002 ||\r
        turning ||\r
        Math.hypot(pointer.x - hover.x, pointer.y - hover.y) > 0.1 ||\r
        pointer.dragging ||\r
        energy > 0.05 * Math.max(1, mesh.activeCount);\r
      if (settling) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!raf && alive && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const locatePointer = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      state.pointer.x = event.clientX - rect.left;\r
      state.pointer.y = event.clientY - rect.top;\r
      state.pointer.inside =\r
        state.pointer.x >= 0 && state.pointer.y >= 0 && state.pointer.x <= rect.width && state.pointer.y <= rect.height;\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      locatePointer(event);\r
      wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      locatePointer(event);\r
      if (!state.ready || !onSurface(state.pointer.x, state.pointer.y)) return;\r
      const s = settingsRef.current;\r
      state.pointer.down = true;\r
      state.pointer.startX = state.pointer.x;\r
      state.pointer.startY = state.pointer.y;\r
      state.pointer.startTime = performance.now();\r
      state.pointer.dragging = grab(state.pointer.x, state.pointer.y, s);\r
      container.setPointerCapture?.(event.pointerId);\r
      wake();\r
    };\r
\r
    const onPointerUp = (event: PointerEvent) => {\r
      if (!state.pointer.down) return;\r
      locatePointer(event);\r
      const s = settingsRef.current;\r
      const moved = Math.hypot(state.pointer.x - state.pointer.startX, state.pointer.y - state.pointer.startY);\r
      const quick = performance.now() - state.pointer.startTime < 260;\r
      release();\r
      if (moved < 8 && quick) poke(state.pointer.x, state.pointer.y, s);\r
      state.pointer.down = false;\r
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
    container.addEventListener('pointerdown', onPointerDown);\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerup', onPointerUp);\r
    window.addEventListener('pointercancel', onPointerUp);\r
    container.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
\r
    contentRef.current = () => {\r
      state.ready = false;\r
      state.clock = settingsRef.current.intro && !reduce ? 0 : 10;\r
      rasterize();\r
    };\r
    wakeRef.current = () => {\r
      if (!raf) render();\r
      wake();\r
    };\r
\r
    return () => {\r
      alive = false;\r
      state.buildToken++;\r
      cancelAnimationFrame(raf);\r
      window.clearTimeout(resizeTimer);\r
      wakeRef.current = null;\r
      contentRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      container.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerup', onPointerUp);\r
      window.removeEventListener('pointercancel', onPointerUp);\r
      container.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteBuffer(restBuffer);\r
      gl.deleteBuffer(dynamicBuffer);\r
      gl.deleteBuffer(indexBuffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteTexture(fieldTexture);\r
      gl.deleteTexture(paintTexture);\r
      gl.deleteTexture(slopeTexture);\r
      gl.deleteProgram(surfaceProgram);\r
      gl.deleteProgram(shadowProgram);\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    if (builtRef.current === contentKey) return;\r
    builtRef.current = contentKey;\r
    contentRef.current?.();\r
  }, [contentKey]);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div\r
      ref={containerRef}\r
      className={['relative h-full w-full touch-pan-y select-none overflow-hidden', className]\r
        .filter(Boolean)\r
        .join(' ')}\r
      style={style}\r
      role="img"\r
      aria-label={settings.src ? 'Elastic logo' : settings.text}\r
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default ElasticMesh;\r
`,s={usage:`import ElasticMesh from './ElasticMesh';

<div style={{ width: '100%', height: '500px', position: 'relative' }}>
  <ElasticMesh
    text="Squish"
    material="balloon"
    color="#3b5bff"
    inflate={1}
    stiffness={0.5}
    wobble={0.6}
    theme="dark"
  />
</div>

<div style={{ width: '100%', height: '500px', position: 'relative' }}>
  <ElasticMesh src="/logo.svg" material="chrome" imageColors={false} />
</div>`,code:r,css:n,tailwind:e,tsCode:t,tsTailwind:a};export{s as elasticMesh};
