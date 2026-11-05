const r=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
import './PixelBlast.css';\r
\r
const MAX_CLICKS = 10;\r
const INTRO_SECONDS = 1.8;\r
const SHAPES = { square: 0, circle: 1, triangle: 2, diamond: 3, cross: 4, ring: 5 };\r
const HOVERS = { none: 0, grow: 1, reveal: 2 };\r
const bayer2 = (x, y) => (Math.floor(x) / 2 + Math.floor(y) * Math.floor(y) * 0.75) % 1;\r
const bayer8 = (x, y) => (bayer2(x / 4, y / 4) * 0.25 + bayer2(x / 2, y / 2)) * 0.25 + bayer2(x, y);\r
const BAYER_TABLE = Array.from({ length: 64 }, (_, i) => bayer8(i % 8, Math.floor(i / 8)).toFixed(6)).join(', ');\r
const RANGE_MIN = -6;\r
const RANGE_MAX = 10;\r
\r
const VERTEX = \`#version 300 es\r
void main() {\r
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\r
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const PACKING = \`\r
const float RANGE_MIN = \${RANGE_MIN.toFixed(1)};\r
const float RANGE_MAX = \${RANGE_MAX.toFixed(1)};\r
\r
vec2 pack16(float value) {\r
  float x = floor(clamp((value - RANGE_MIN) / (RANGE_MAX - RANGE_MIN), 0.0, 1.0) * 65535.0 + 0.5);\r
  float hi = floor(x / 256.0);\r
  return vec2(hi, x - hi * 256.0) / 255.0;\r
}\r
\r
float unpack16(vec2 c) {\r
  float x = floor(c.x * 255.0 + 0.5) * 256.0 + floor(c.y * 255.0 + 0.5);\r
  return RANGE_MIN + x / 65535.0 * (RANGE_MAX - RANGE_MIN);\r
}\r
\`;\r
\r
const CELL_FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
\r
uniform vec2 uResolution;\r
uniform float uTime;\r
uniform float uPixelSize;\r
uniform float uScale;\r
uniform float uDensity;\r
uniform int uEnableRipples;\r
uniform float uRippleSpeed;\r
uniform float uRippleThickness;\r
uniform float uRippleIntensity;\r
uniform vec2 uClickPos[\${MAX_CLICKS}];\r
uniform float uClickAge[\${MAX_CLICKS}];\r
uniform ivec2 uOrigin;\r
uniform vec2 uDrift;\r
uniform int uHover;\r
uniform vec2 uMouse;\r
uniform float uMouseRadius;\r
uniform float uMousePresence;\r
uniform float uIntro;\r
uniform sampler2D uPrev;\r
uniform float uDecay;\r
uniform float uFresh;\r
\r
out vec4 outCell;\r
\${PACKING}\r
float hash11(float n) { return fract(sin(n) * 43758.5453); }\r
\r
float vnoise(vec3 p) {\r
  vec3 ip = floor(p);\r
  vec3 fp = fract(p);\r
  float n000 = hash11(dot(ip + vec3(0.0, 0.0, 0.0), vec3(1.0, 57.0, 113.0)));\r
  float n100 = hash11(dot(ip + vec3(1.0, 0.0, 0.0), vec3(1.0, 57.0, 113.0)));\r
  float n010 = hash11(dot(ip + vec3(0.0, 1.0, 0.0), vec3(1.0, 57.0, 113.0)));\r
  float n110 = hash11(dot(ip + vec3(1.0, 1.0, 0.0), vec3(1.0, 57.0, 113.0)));\r
  float n001 = hash11(dot(ip + vec3(0.0, 0.0, 1.0), vec3(1.0, 57.0, 113.0)));\r
  float n101 = hash11(dot(ip + vec3(1.0, 0.0, 1.0), vec3(1.0, 57.0, 113.0)));\r
  float n011 = hash11(dot(ip + vec3(0.0, 1.0, 1.0), vec3(1.0, 57.0, 113.0)));\r
  float n111 = hash11(dot(ip + vec3(1.0, 1.0, 1.0), vec3(1.0, 57.0, 113.0)));\r
  vec3 w = fp * fp * fp * (fp * (fp * 6.0 - 15.0) + 10.0);\r
  float x00 = mix(n000, n100, w.x);\r
  float x10 = mix(n010, n110, w.x);\r
  float x01 = mix(n001, n101, w.x);\r
  float x11 = mix(n011, n111, w.x);\r
  float y0 = mix(x00, x10, w.y);\r
  float y1 = mix(x01, x11, w.y);\r
  return mix(y0, y1, w.z) * 2.0 - 1.0;\r
}\r
\r
float fbm2(vec2 uv, float t) {\r
  vec3 p = vec3(uv * uScale, t);\r
  float amp = 1.0;\r
  float freq = 1.0;\r
  float sum = 1.0;\r
  for (int i = 0; i < 5; ++i) {\r
    sum += amp * vnoise(p * freq);\r
    freq *= 1.25;\r
    amp *= 1.0;\r
  }\r
  return sum * 0.5 + 0.5;\r
}\r
\r
void main() {\r
  ivec2 texel = ivec2(gl_FragCoord.xy);\r
  float aspectRatio = uResolution.x / uResolution.y;\r
  float cellPixelSize = 8.0 * uPixelSize;\r
  vec2 cellId = vec2(texel + uOrigin);\r
  vec2 cellCoord = cellId * cellPixelSize;\r
  vec2 uv = cellCoord / uResolution * vec2(aspectRatio, 1.0);\r
\r
  float base = fbm2(uv + uDrift, uTime * 0.05);\r
  base = base * 0.5 - 0.65;\r
  float feed = base + (uDensity - 0.5) * 0.3;\r
  if (uEnableRipples == 1) {\r
    for (int i = 0; i < \${MAX_CLICKS}; ++i) {\r
      vec2 pos = uClickPos[i];\r
      if (pos.x < 0.0) continue;\r
      vec2 cuv = (((pos - uResolution * 0.5 - cellPixelSize * 0.5) / uResolution)) * vec2(aspectRatio, 1.0);\r
      float t = max(uClickAge[i], 0.0);\r
      float r = distance(uv, cuv);\r
      float waveR = uRippleSpeed * t;\r
      float ring = exp(-pow((r - waveR) / uRippleThickness, 2.0));\r
      float atten = exp(-1.0 * t) * exp(-10.0 * r);\r
      feed = max(feed, ring * atten * uRippleIntensity);\r
    }\r
  }\r
\r
  if (uIntro < 1.0) {\r
    vec2 center = (-cellPixelSize * 0.5 / uResolution) * vec2(aspectRatio, 1.0);\r
    float reach = length(vec2(aspectRatio, 1.0)) * 0.5 + 0.2;\r
    float eased = 1.0 - pow(1.0 - uIntro, 2.4);\r
    float front = eased * reach;\r
    float r = distance(uv, center);\r
    float shown = smoothstep(front + 0.04, front - 0.06, r);\r
    float ring = exp(-pow((r - front) / 0.07, 2.0)) * (1.0 - uIntro);\r
    feed = mix(-1.0, feed, shown);\r
    feed = max(feed, ring * 1.4);\r
  }\r
\r
  float brush = 0.0;\r
  if (uHover > 0) {\r
    vec2 d = (cellCoord + cellPixelSize * 0.5 + uResolution * 0.5 - uMouse) / max(uMouseRadius, 1.0);\r
    brush = exp(-dot(d, d)) * uMousePresence;\r
  }\r
  vec4 prev = texelFetch(uPrev, texel, 0) * (1.0 - uFresh);\r
  float trail = max(brush, max(prev.a * uDecay - 1.0 / 255.0, 0.0));\r
  if (uHover == 2) feed += trail * 0.9;\r
\r
  outCell = vec4(pack16(feed), clamp((feed + 0.5) * 0.5, 0.0, 1.0), trail);\r
}\`;\r
\r
const MAIN_FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
\r
uniform vec3 uColor;\r
uniform vec3 uAccent;\r
uniform vec2 uResolution;\r
uniform float uTime;\r
uniform float uClock;\r
uniform float uPixelSize;\r
uniform float uPixelJitter;\r
uniform float uEdgeFade;\r
uniform int uShapeType;\r
uniform sampler2D uCells;\r
uniform ivec2 uOrigin;\r
uniform ivec2 uCellCount;\r
uniform float uSoftness;\r
uniform float uSmoothing;\r
uniform float uGlow;\r
uniform float uTwinkle;\r
uniform float uLightMode;\r
uniform float uTransparent;\r
uniform float uNoise;\r
uniform int uHover;\r
uniform mat3 uPlane;\r
uniform float uTilted;\r
\r
out vec4 fragColor;\r
\${PACKING}\r
const float BAYER[64] = float[64](\${BAYER_TABLE});\r
\r
vec2 gDx;\r
vec2 gDy;\r
\r
float aaFrom(vec2 grad) {\r
  return abs(dot(grad, gDx)) + abs(dot(grad, gDy));\r
}\r
\r
float maskSquare(vec2 p, float cov, float soft) {\r
  if (soft <= 0.0) return cov;\r
  float side = 0.5 * sqrt(clamp(cov, 0.0, 1.0));\r
  vec2 c = p - 0.5;\r
  vec2 q = abs(c) - side;\r
  float d = max(q.x, q.y);\r
  vec2 grad = q.x > q.y ? vec2(sign(c.x), 0.0) : vec2(0.0, sign(c.y));\r
  float aa = max(aaFrom(grad), 1e-4);\r
  return 1.0 - smoothstep(-aa * 0.5, aa * 0.5, d);\r
}\r
\r
float maskCircle(vec2 p, float cov) {\r
  float r = sqrt(cov) * 0.25;\r
  vec2 c = p - 0.5;\r
  float len = length(c);\r
  float d = len - r;\r
  float aa = 0.5 * aaFrom(c / max(len, 1e-5));\r
  return cov * (1.0 - smoothstep(-aa, aa, d * 2.0));\r
}\r
\r
float maskTriangle(vec2 p, vec2 id, float cov) {\r
  bool flip = mod(id.x + id.y, 2.0) > 0.5;\r
  if (flip) p.x = 1.0 - p.x;\r
  float r = sqrt(cov);\r
  float d = p.y - r * (1.0 - p.x);\r
  float aa = max(aaFrom(vec2(flip ? -r : r, 1.0)), 1e-4);\r
  return cov * clamp(0.5 - d / aa, 0.0, 1.0);\r
}\r
\r
float maskDiamond(vec2 p, float cov) {\r
  float r = sqrt(cov) * 0.564;\r
  return step(abs(p.x - 0.49) + abs(p.y - 0.49), r);\r
}\r
\r
float maskCross(vec2 p, float cov) {\r
  float s = sqrt(clamp(cov, 0.0, 1.0));\r
  vec2 c = p - 0.5;\r
  vec2 q = abs(c);\r
  float arm = 0.42 * s;\r
  float bar = 0.13 * s + 0.02;\r
  float a1 = max(q.x - arm, q.y - bar);\r
  float a2 = max(q.x - bar, q.y - arm);\r
  float d = min(a1, a2);\r
  bool horizontal = a1 < a2 ? q.x - arm > q.y - bar : q.x - bar > q.y - arm;\r
  vec2 grad = horizontal ? vec2(sign(c.x), 0.0) : vec2(0.0, sign(c.y));\r
  float aa = max(aaFrom(grad), 1e-4);\r
  return 1.0 - smoothstep(-aa * 0.5, aa * 0.5, d);\r
}\r
\r
float maskRing(vec2 p, float cov) {\r
  float s = sqrt(clamp(cov, 0.0, 1.0));\r
  vec2 c = p - 0.5;\r
  float len = length(c);\r
  float d = abs(len - 0.3 * s) - 0.09 * s;\r
  vec2 grad = sign(len - 0.3 * s) * c / max(len, 1e-5);\r
  float aa = max(aaFrom(grad), 1e-4);\r
  return 1.0 - smoothstep(-aa * 0.5, aa * 0.5, d);\r
}\r
\r
float hash(vec2 p) {\r
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);\r
}\r
\r
void main() {\r
  float pixelSize = uPixelSize;\r
  vec2 screen = gl_FragCoord.xy;\r
  vec4 empty = uTransparent < 0.5 ? vec4(vec3(uLightMode > 0.5 ? 1.0 : 0.0), 1.0) : vec4(0.0);\r
\r
  float lod = 0.0;\r
  float depthFade = 1.0;\r
  if (uTilted > 0.5) {\r
    vec3 plane = uPlane * vec3(screen.x, uResolution.y - screen.y, 1.0);\r
    screen = vec2(plane.x, uResolution.y * plane.z - plane.y) / max(plane.z, 1e-4);\r
    float footprint = length(fwidth(screen));\r
    lod = smoothstep(0.3, 0.85, footprint / pixelSize);\r
    depthFade = (1.0 - smoothstep(0.45, 1.0, footprint / (8.0 * pixelSize))) * step(0.0, plane.z);\r
  }\r
\r
  vec2 fragCoord = screen - uResolution * 0.5;\r
  gDx = dFdx(fragCoord) / pixelSize;\r
  gDy = dFdy(fragCoord) / pixelSize;\r
  if (depthFade <= 0.0) {\r
    fragColor = empty;\r
    return;\r
  }\r
\r
  float cellPixelSize = 8.0 * pixelSize;\r
  vec2 cellId = floor(fragCoord / cellPixelSize);\r
  ivec2 texel = clamp(ivec2(cellId) - uOrigin, ivec2(0), uCellCount - 1);\r
  vec2 smoothAt = (fragCoord / cellPixelSize - vec2(uOrigin)) / vec2(uCellCount);\r
  vec4 blended = texture(uCells, smoothAt);\r
  float smoothFeed = blended.b * 2.0 - 0.5;\r
  float feed = smoothFeed;\r
  float trail = uHover == 1 ? blended.a : 0.0;\r
  if (uSmoothing < 1.0) {\r
    vec4 cell = texelFetch(uCells, texel, 0);\r
    feed = mix(unpack16(cell.rg), smoothFeed, uSmoothing);\r
    if (uHover == 1) trail = mix(cell.a, blended.a, uSmoothing);\r
  }\r
\r
  if (feed < -0.12 * uSoftness && smoothFeed < 0.2 && (lod <= 0.0 || smoothFeed <= 0.0)) {\r
    fragColor = empty;\r
    return;\r
  }\r
\r
  vec2 pixelId = floor(fragCoord / pixelSize);\r
  vec2 pixelUV = fragCoord / pixelSize - pixelId;\r
  ivec2 cellBits = ivec2(mod(pixelId, 8.0));\r
  float bayer = BAYER[cellBits.y * 8 + cellBits.x] - 0.5;\r
  float margin = feed + bayer - 0.5;\r
  float bw = uSoftness > 0.0 ? smoothstep(-0.12 * uSoftness, 0.12 * uSoftness, margin) : step(0.0, margin);\r
\r
  float h = uPixelJitter > 0.0 || uTwinkle > 0.0 ? fract(sin(dot(pixelId, vec2(127.1, 311.7))) * 43758.5453) : 0.5;\r
  float jitterScale = 1.0 + (h - 0.5) * uPixelJitter;\r
  float heat = max(trail, clamp((feed - 1.0) * 2.5, 0.0, 1.0) * min(uGlow * 2.0, 1.0));\r
  float coverage = bw * jitterScale * (1.0 + heat * 0.35);\r
  float M;\r
  float area;\r
  if (uShapeType == 1) {\r
    M = maskCircle(pixelUV, coverage);\r
    area = 0.196;\r
  } else if (uShapeType == 2) {\r
    M = maskTriangle(pixelUV, pixelId, coverage);\r
    area = 0.5;\r
  } else if (uShapeType == 3) {\r
    M = maskDiamond(pixelUV, coverage);\r
    area = 0.62;\r
  } else if (uShapeType == 4) {\r
    M = maskCross(pixelUV, coverage);\r
    area = 0.41;\r
  } else if (uShapeType == 5) {\r
    M = maskRing(pixelUV, coverage);\r
    area = 0.41;\r
  } else {\r
    M = maskSquare(pixelUV, coverage, uSoftness);\r
    area = 1.0;\r
  }\r
  if (lod > 0.0) {\r
    float average = clamp(smoothFeed, 0.0, 1.0) * area * (1.0 + heat * 0.35);\r
    M = mix(M, average, lod);\r
  }\r
\r
  if (uTwinkle > 0.0) {\r
    float rate = 1.5 + 3.0 * fract(h * 7.31);\r
    float wave = 0.5 + 0.5 * sin(uClock * rate + h * 37.0);\r
    M *= 1.0 - uTwinkle * 0.55 * wave * wave;\r
  }\r
\r
  float density = clamp(smoothFeed, 0.0, 1.0);\r
  float glow = 0.0;\r
  if (uGlow > 0.0) {\r
    float bloom = smoothstep(0.2, 1.0, density);\r
    glow = bloom * bloom * uGlow * (uLightMode > 0.5 ? 0.12 : 0.22) * depthFade;\r
  }\r
\r
  float fade = depthFade;\r
  if (uEdgeFade > 0.0) {\r
    vec2 norm = gl_FragCoord.xy / uResolution;\r
    vec2 edgeA = clamp(norm / uEdgeFade, 0.0, 1.0);\r
    vec2 edgeB = clamp((1.0 - norm) / uEdgeFade, 0.0, 1.0);\r
    vec2 sa = edgeA * edgeA * edgeA * (edgeA * (edgeA * 6.0 - 15.0) + 10.0);\r
    vec2 sb = edgeB * edgeB * edgeB * (edgeB * (edgeB * 6.0 - 15.0) + 10.0);\r
    fade *= sa.x * sa.y * sb.x * sb.y;\r
  }\r
  M = clamp(M, 0.0, 1.0) * fade;\r
  glow *= fade;\r
\r
  float hot = clamp(heat, 0.0, 1.0);\r
  float tone = smoothstep(0.3, 1.0, density) * 0.85;\r
  vec3 color = mix(uColor, uAccent, max(tone, hot));\r
  vec3 lit = uLightMode > 0.5 ? color * (1.0 - 0.35 * hot) : mix(color, vec3(1.0), 0.45 * hot);\r
  if (uNoise > 0.0) {\r
    float n = hash(floor(gl_FragCoord.xy) + floor(uTime * 60.0));\r
    lit = clamp(lit + (n - 0.5) * uNoise, 0.0, 1.0);\r
  }\r
\r
  vec3 haze = uLightMode > 0.5 ? mix(color, vec3(1.0), 0.35) : color;\r
  float alpha = M + glow * (1.0 - M);\r
  vec3 premul = lit * M + haze * glow * (1.0 - M);\r
  if (uTransparent < 0.5) {\r
    vec3 paper = vec3(uLightMode > 0.5 ? 1.0 : 0.0);\r
    fragColor = vec4(premul + paper * (1.0 - alpha), 1.0);\r
    return;\r
  }\r
  fragColor = vec4(premul, alpha);\r
}\`;\r
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
const colorCache = new Map();\r
\r
const hexToRgb = hex => {\r
  const key = String(hex);\r
  const cached = colorCache.get(key);\r
  if (cached) return cached;\r
  const rgb = parseHex(hex);\r
  if (colorCache.size > 64) colorCache.clear();\r
  colorCache.set(key, rgb);\r
  return rgb;\r
};\r
\r
const parseHex = hex => {\r
  let h = String(hex || '#ffffff')\r
    .replace('#', '')\r
    .trim();\r
  if (h.length === 3 || h.length === 4)\r
    h = h\r
      .slice(0, 3)\r
      .split('')\r
      .map(c => c + c)\r
      .join('');\r
  const num = parseInt(h.slice(0, 6), 16);\r
  if (Number.isNaN(num)) return [1, 1, 1];\r
  return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];\r
};\r
\r
const randomFloat = () => {\r
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {\r
    const u32 = new Uint32Array(1);\r
    window.crypto.getRandomValues(u32);\r
    return u32[0] / 0xffffffff;\r
  }\r
  return Math.random();\r
};\r
\r
const invert3 = m => {\r
  const [a, b, c, d, e, f, g, h, i] = m;\r
  const A = e * i - f * h;\r
  const B = -(d * i - f * g);\r
  const C = d * h - e * g;\r
  const det = a * A + b * B + c * C || 1;\r
  return [\r
    A / det,\r
    -(b * i - c * h) / det,\r
    (b * f - c * e) / det,\r
    B / det,\r
    (a * i - c * g) / det,\r
    -(a * f - c * d) / det,\r
    C / det,\r
    -(a * h - b * g) / det,\r
    (a * e - b * d) / det\r
  ];\r
};\r
\r
const multiply3 = (x, y) => {\r
  const out = new Array(9);\r
  for (let r = 0; r < 3; r++) {\r
    for (let c = 0; c < 3; c++) {\r
      out[r * 3 + c] = x[r * 3] * y[c] + x[r * 3 + 1] * y[3 + c] + x[r * 3 + 2] * y[6 + c];\r
    }\r
  }\r
  return out;\r
};\r
\r
const planeFor = (tiltX, tiltY, width, height) => {\r
  const ax = (tiltX * Math.PI) / 180;\r
  const ay = (tiltY * Math.PI) / 180;\r
  const depth = Math.max(width, height) * 1.25;\r
  const cx = width / 2;\r
  const cy = height / 2;\r
  const tilt = [\r
    Math.cos(ay),\r
    0,\r
    0,\r
    Math.sin(ax) * Math.sin(ay),\r
    Math.cos(ax),\r
    0,\r
    (Math.sin(ay) * Math.cos(ax)) / depth,\r
    -Math.sin(ax) / depth,\r
    1\r
  ];\r
  const forward = multiply3(multiply3([1, 0, cx, 0, 1, cy, 0, 0, 1], tilt), [1, 0, -cx, 0, 1, -cy, 0, 0, 1]);\r
  return invert3(forward);\r
};\r
\r
const PixelBlast = ({\r
  variant = 'square',\r
  pixelSize = 3,\r
  color = '#B497CF',\r
  accentColor,\r
  className,\r
  style,\r
  patternScale = 2,\r
  patternDensity = 1,\r
  pixelSizeJitter = 0,\r
  enableRipples = true,\r
  rippleIntensityScale = 1,\r
  rippleThickness = 0.1,\r
  rippleSpeed = 0.3,\r
  autoPauseOffscreen = true,\r
  speed = 0.5,\r
  transparent = true,\r
  edgeFade = 0.5,\r
  noiseAmount = 0,\r
  softness = 0.6,\r
  smoothing = 1,\r
  glow = 0.4,\r
  twinkle = 0.25,\r
  drift = 0.2,\r
  driftAngle = 30,\r
  hoverEffect = 'reveal',\r
  hoverRadius = 140,\r
  autoRipple = 0,\r
  tiltX = 0,\r
  tiltY = 0,\r
  intro = true,\r
  variation,\r
  lightMode = false,\r
  dpr\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settings = {\r
    variant: SHAPES[variant] ?? 0,\r
    pixelSize: Math.max(0.5, pixelSize),\r
    color,\r
    accentColor: accentColor || color,\r
    patternScale,\r
    patternDensity,\r
    pixelSizeJitter,\r
    enableRipples,\r
    rippleIntensityScale,\r
    rippleThickness: Math.max(0.001, rippleThickness),\r
    rippleSpeed,\r
    autoPauseOffscreen,\r
    speed,\r
    transparent,\r
    edgeFade: clamp(edgeFade, 0, 1),\r
    noiseAmount,\r
    softness: clamp(softness, 0, 1),\r
    smoothing: clamp(smoothing, 0, 1),\r
    glow: clamp(glow, 0, 2),\r
    twinkle: clamp(twinkle, 0, 1),\r
    drift,\r
    driftAngle,\r
    hoverEffect: HOVERS[hoverEffect] ?? 0,\r
    hoverRadius: Math.max(10, hoverRadius),\r
    autoRipple: Math.max(0, autoRipple),\r
    tiltX: clamp(tiltX, -70, 70),\r
    tiltY: clamp(tiltY, -70, 70),\r
    intro,\r
    variation,\r
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
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
    const cellShader = link(gl, CELL_FRAGMENT);\r
    const mainShader = link(gl, MAIN_FRAGMENT);\r
    if (!cellShader || !mainShader) return undefined;\r
    const cu = cellShader.uniforms;\r
    const mu = mainShader.uniforms;\r
    const vao = gl.createVertexArray();\r
\r
    const makeTexture = filter => {\r
      const texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
      return texture;\r
    };\r
    const targets = [0, 1].map(() => {\r
      const texture = makeTexture(gl.LINEAR);\r
      const framebuffer = gl.createFramebuffer();\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
      return { texture, framebuffer };\r
    });\r
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1, ratio: 1, plane: null, tiltKey: '' };\r
    const cells = { x: 0, y: 0, w: 1, h: 1, key: '' };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const mouse = { x: 0, y: 0, ready: false };\r
    const clickPos = new Float32Array(MAX_CLICKS * 2).fill(-1);\r
    const clickAt = new Float32Array(MAX_CLICKS);\r
    const clickAge = new Float32Array(MAX_CLICKS);\r
    let clickIndex = 0;\r
    let current = 0;\r
    let fresh = true;\r
    const seedOffset = settingsRef.current.variation;\r
    const timeOffset = typeof seedOffset === 'number' ? seedOffset * 37 : randomFloat() * 1000;\r
    let elapsed = 0;\r
    let clock = 0;\r
    let presence = 0;\r
    let driftX = 0;\r
    let driftY = 0;\r
    let introClock = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let nextAuto = 1.2;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let quiet = 0;\r
\r
    const patternTime = s => timeOffset + elapsed * s.speed;\r
\r
    const layoutCells = s => {\r
      const ps = s.pixelSize * view.ratio;\r
      const cps = 8 * ps;\r
      const w = canvas.width;\r
      const h = canvas.height;\r
      let minX = -w / 2;\r
      let maxX = w / 2;\r
      let minY = -h / 2;\r
      let maxY = h / 2;\r
      if (view.plane) {\r
        const corners = [\r
          [0, 0],\r
          [w, 0],\r
          [0, h],\r
          [w, h],\r
          [w / 2, 0],\r
          [w / 2, h],\r
          [0, h / 2],\r
          [w, h / 2]\r
        ];\r
        minX = Infinity;\r
        maxX = -Infinity;\r
        minY = Infinity;\r
        maxY = -Infinity;\r
        for (const [x, y] of corners) {\r
          const [qx, qy] = toPlane(x, y);\r
          if (qx < -1e5) continue;\r
          minX = Math.min(minX, qx - w / 2);\r
          maxX = Math.max(maxX, qx - w / 2);\r
          minY = Math.min(minY, qy - h / 2);\r
          maxY = Math.max(maxY, qy - h / 2);\r
        }\r
        if (!Number.isFinite(minX)) {\r
          minX = -w / 2;\r
          maxX = w / 2;\r
          minY = -h / 2;\r
          maxY = h / 2;\r
        }\r
      }\r
      const pad = cps;\r
      const x0 = Math.floor((minX - pad) / cps);\r
      const x1 = Math.floor((maxX + pad) / cps);\r
      const y0 = Math.floor((minY - pad) / cps);\r
      const y1 = Math.floor((maxY + pad) / cps);\r
      const width = Math.max(1, Math.min(2048, x1 - x0 + 1));\r
      const height = Math.max(1, Math.min(2048, y1 - y0 + 1));\r
      const key = \`\${x0}:\${y0}:\${width}:\${height}\`;\r
      if (key === cells.key) return;\r
      cells.key = key;\r
      cells.x = x0;\r
      cells.y = y0;\r
      cells.w = width;\r
      cells.h = height;\r
      for (const target of targets) {\r
        gl.bindTexture(gl.TEXTURE_2D, target.texture);\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
      }\r
      fresh = true;\r
    };\r
\r
    const planeClicks = new Float32Array(MAX_CLICKS * 2);\r
\r
    const stepCells = (s, decay) => {\r
      for (let k = 0; k < MAX_CLICKS; k++) {\r
        if (clickPos[k * 2] < 0) {\r
          planeClicks[k * 2] = -1;\r
          planeClicks[k * 2 + 1] = -1;\r
          continue;\r
        }\r
        const [px, py] = toPlane(clickPos[k * 2], clickPos[k * 2 + 1]);\r
        planeClicks[k * 2] = Math.max(px, 0);\r
        planeClicks[k * 2 + 1] = py;\r
      }\r
      const [mx, my] = toPlane(mouse.x, mouse.y);\r
      const source = targets[current];\r
      const target = targets[1 - current];\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);\r
      gl.viewport(0, 0, cells.w, cells.h);\r
      gl.disable(gl.BLEND);\r
      gl.useProgram(cellShader.program);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, source.texture);\r
      gl.uniform1i(cu.uPrev, 0);\r
      gl.uniform2f(cu.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(cu.uTime, patternTime(s));\r
      gl.uniform1f(cu.uPixelSize, s.pixelSize * view.ratio);\r
      gl.uniform1f(cu.uScale, s.patternScale);\r
      gl.uniform1f(cu.uDensity, s.patternDensity);\r
      gl.uniform1i(cu.uEnableRipples, s.enableRipples ? 1 : 0);\r
      gl.uniform1f(cu.uRippleSpeed, s.rippleSpeed);\r
      gl.uniform1f(cu.uRippleThickness, s.rippleThickness);\r
      gl.uniform1f(cu.uRippleIntensity, s.rippleIntensityScale);\r
      gl.uniform2fv(cu.uClickPos, planeClicks);\r
      gl.uniform1fv(cu.uClickAge, clickAge);\r
      gl.uniform2i(cu.uOrigin, cells.x, cells.y);\r
      gl.uniform2f(cu.uDrift, driftX, driftY);\r
      gl.uniform1i(cu.uHover, s.hoverEffect);\r
      gl.uniform2f(cu.uMouse, mx, my);\r
      gl.uniform1f(cu.uMouseRadius, s.hoverRadius * view.ratio);\r
      gl.uniform1f(cu.uMousePresence, presence);\r
      gl.uniform1f(cu.uIntro, introClock);\r
      gl.uniform1f(cu.uDecay, decay);\r
      gl.uniform1f(cu.uFresh, fresh ? 1 : 0);\r
      gl.bindVertexArray(vao);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      current = 1 - current;\r
      fresh = false;\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.useProgram(mainShader.program);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, targets[current].texture);\r
      gl.uniform1i(mu.uCells, 0);\r
      gl.uniform3fv(mu.uColor, hexToRgb(s.color));\r
      gl.uniform3fv(mu.uAccent, hexToRgb(s.accentColor));\r
      gl.uniform2f(mu.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(mu.uTime, patternTime(s));\r
      gl.uniform1f(mu.uClock, clock);\r
      gl.uniform1f(mu.uPixelSize, s.pixelSize * view.ratio);\r
      gl.uniform1f(mu.uPixelJitter, s.pixelSizeJitter);\r
      gl.uniform1f(mu.uEdgeFade, s.edgeFade);\r
      gl.uniform1i(mu.uShapeType, s.variant);\r
      gl.uniform2i(mu.uOrigin, cells.x, cells.y);\r
      gl.uniform2i(mu.uCellCount, cells.w, cells.h);\r
      gl.uniform1f(mu.uSoftness, s.softness);\r
      gl.uniform1f(mu.uSmoothing, s.smoothing);\r
      gl.uniform1f(mu.uGlow, s.glow);\r
      gl.uniform1f(mu.uTwinkle, reduce ? 0 : s.twinkle);\r
      gl.uniform1f(mu.uLightMode, s.lightMode ? 1 : 0);\r
      gl.uniform1f(mu.uTransparent, s.transparent ? 1 : 0);\r
      gl.uniform1f(mu.uNoise, s.noiseAmount);\r
      gl.uniform1i(mu.uHover, s.hoverEffect);\r
      gl.uniform1f(mu.uTilted, view.plane ? 1 : 0);\r
      if (view.plane) {\r
        const m = view.plane;\r
        gl.uniformMatrix3fv(mu.uPlane, false, [m[0], m[3], m[6], m[1], m[4], m[7], m[2], m[5], m[8]]);\r
      }\r
      gl.bindVertexArray(vao);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const toPlane = (x, y) => {\r
      const m = view.plane;\r
      if (!m) return [x, y];\r
      const h = canvas.height;\r
      const cy = h - y;\r
      const z = m[6] * x + m[7] * cy + m[8];\r
      if (z <= 1e-4) return [-1e6, -1e6];\r
      return [(m[0] * x + m[1] * cy + m[2]) / z, h - (m[3] * x + m[4] * cy + m[5]) / z];\r
    };\r
\r
    const updatePlane = s => {\r
      view.plane = s.tiltX || s.tiltY ? planeFor(s.tiltX, s.tiltY, canvas.width, canvas.height) : null;\r
      view.tiltKey = \`\${s.tiltX}:\${s.tiltY}:\${canvas.width}:\${canvas.height}\`;\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      view.width = Math.max(1, container.clientWidth);\r
      view.height = Math.max(1, container.clientHeight);\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(view.width * view.ratio));\r
      canvas.height = Math.max(1, Math.round(view.height * view.ratio));\r
      if (!mouse.ready) {\r
        mouse.ready = true;\r
        mouse.x = canvas.width / 2;\r
        mouse.y = canvas.height / 2;\r
      }\r
      updatePlane(s);\r
      layoutCells(s);\r
      stepCells(s, 0);\r
      draw();\r
      wake();\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      const s = settingsRef.current;\r
      if (!visible && s.autoPauseOffscreen) return;\r
      if (document.hidden) return;\r
      const dt = last ? clamp((now - last) / 1000, 0, 1 / 20) : 0;\r
      last = now;\r
      if (!reduce) elapsed += dt;\r
      clock += dt;\r
      if (!reduce && s.drift) {\r
        const angle = (s.driftAngle * Math.PI) / 180;\r
        driftX += Math.cos(angle) * s.drift * dt * 0.05;\r
        driftY += Math.sin(angle) * s.drift * dt * 0.05;\r
      }\r
      if (!reduce && s.enableRipples && s.autoRipple > 0 && introClock >= 1) {\r
        nextAuto -= dt;\r
        if (nextAuto <= 0) {\r
          nextAuto = s.autoRipple * (0.7 + Math.random() * 0.6);\r
          addRipple((0.15 + Math.random() * 0.7) * view.width, (0.15 + Math.random() * 0.7) * view.height);\r
        }\r
      }\r
      for (let k = 0; k < MAX_CLICKS; k++) clickAge[k] = (clock - clickAt[k]) * 0.5;\r
      const targetX = pointer.x * view.ratio;\r
      const targetY = (view.height - pointer.y) * view.ratio;\r
      const follow = 1 - Math.exp(-dt / 0.08);\r
      if (pointer.inside) {\r
        mouse.x += (targetX - mouse.x) * follow;\r
        mouse.y += (targetY - mouse.y) * follow;\r
      }\r
      presence += ((pointer.inside ? 1 : 0) - presence) * (1 - Math.exp(-dt / 0.25));\r
      const key = \`\${s.tiltX}:\${s.tiltY}:\${canvas.width}:\${canvas.height}\`;\r
      if (key !== view.tiltKey) updatePlane(s);\r
      layoutCells(s);\r
      const decay = s.hoverEffect ? Math.exp(-dt / 0.45) : 0;\r
      stepCells(s, decay);\r
      draw();\r
      if (introClock < 1) introClock = Math.min(1, introClock + dt / INTRO_SECONDS);\r
      let busy = !reduce && (s.speed !== 0 || s.drift !== 0 || s.twinkle > 0 || (s.autoRipple > 0 && s.enableRipples));\r
      busy = busy || introClock < 1 || presence > 0.001;\r
      for (let k = 0; k < MAX_CLICKS; k++) busy = busy || (clickPos[k * 2] >= 0 && clickAge[k] < 8);\r
      quiet = busy ? 0 : quiet + dt;\r
      if (quiet < 1.5) raf = requestAnimationFrame(frame);\r
    };\r
\r
    function wake() {\r
      quiet = 0;\r
      if (!raf && (visible || !settingsRef.current.autoPauseOffscreen) && !document.hidden) {\r
        last = 0;\r
        raf = requestAnimationFrame(frame);\r
      }\r
    }\r
\r
    const locate = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };\r
    };\r
\r
    const onPointerMove = event => {\r
      const { x, y, inside } = locate(event);\r
      const was = pointer.inside;\r
      pointer.inside = inside;\r
      if (inside) {\r
        pointer.x = x;\r
        pointer.y = y;\r
        if (!was) {\r
          mouse.x = x * view.ratio;\r
          mouse.y = (view.height - y) * view.ratio;\r
        }\r
      }\r
      if (inside || was) wake();\r
    };\r
\r
    function addRipple(x, y) {\r
      clickPos[clickIndex * 2] = x * view.ratio;\r
      clickPos[clickIndex * 2 + 1] = (view.height - y) * view.ratio;\r
      clickAt[clickIndex] = clock;\r
      clickIndex = (clickIndex + 1) % MAX_CLICKS;\r
      wake();\r
    }\r
\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      const { x, y, inside } = locate(event);\r
      if (!inside || reduce || !s.enableRipples) return;\r
      addRipple(x, y);\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
    const onVisibility = () => wake();\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(container);\r
    const intersection = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible) wake();\r
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
      for (const target of targets) {\r
        gl.deleteTexture(target.texture);\r
        gl.deleteFramebuffer(target.framebuffer);\r
      }\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(cellShader.program);\r
      gl.deleteProgram(mainShader.program);\r
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
      className={\`pixel-blast-container\${className ? \` \${className}\` : ''}\`}\r
      style={style}\r
      aria-label="PixelBlast interactive background"\r
    >\r
      <canvas ref={canvasRef} className="pixel-blast-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default PixelBlast;\r
`,n=`.pixel-blast-container {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.pixel-blast-canvas {\r
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
const MAX_CLICKS = 10;\r
const INTRO_SECONDS = 1.8;\r
const SHAPES = { square: 0, circle: 1, triangle: 2, diamond: 3, cross: 4, ring: 5 };\r
const HOVERS = { none: 0, grow: 1, reveal: 2 };\r
const bayer2 = (x, y) => (Math.floor(x) / 2 + Math.floor(y) * Math.floor(y) * 0.75) % 1;\r
const bayer8 = (x, y) => (bayer2(x / 4, y / 4) * 0.25 + bayer2(x / 2, y / 2)) * 0.25 + bayer2(x, y);\r
const BAYER_TABLE = Array.from({ length: 64 }, (_, i) => bayer8(i % 8, Math.floor(i / 8)).toFixed(6)).join(', ');\r
const RANGE_MIN = -6;\r
const RANGE_MAX = 10;\r
\r
const VERTEX = \`#version 300 es\r
void main() {\r
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\r
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const PACKING = \`\r
const float RANGE_MIN = \${RANGE_MIN.toFixed(1)};\r
const float RANGE_MAX = \${RANGE_MAX.toFixed(1)};\r
\r
vec2 pack16(float value) {\r
  float x = floor(clamp((value - RANGE_MIN) / (RANGE_MAX - RANGE_MIN), 0.0, 1.0) * 65535.0 + 0.5);\r
  float hi = floor(x / 256.0);\r
  return vec2(hi, x - hi * 256.0) / 255.0;\r
}\r
\r
float unpack16(vec2 c) {\r
  float x = floor(c.x * 255.0 + 0.5) * 256.0 + floor(c.y * 255.0 + 0.5);\r
  return RANGE_MIN + x / 65535.0 * (RANGE_MAX - RANGE_MIN);\r
}\r
\`;\r
\r
const CELL_FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
\r
uniform vec2 uResolution;\r
uniform float uTime;\r
uniform float uPixelSize;\r
uniform float uScale;\r
uniform float uDensity;\r
uniform int uEnableRipples;\r
uniform float uRippleSpeed;\r
uniform float uRippleThickness;\r
uniform float uRippleIntensity;\r
uniform vec2 uClickPos[\${MAX_CLICKS}];\r
uniform float uClickAge[\${MAX_CLICKS}];\r
uniform ivec2 uOrigin;\r
uniform vec2 uDrift;\r
uniform int uHover;\r
uniform vec2 uMouse;\r
uniform float uMouseRadius;\r
uniform float uMousePresence;\r
uniform float uIntro;\r
uniform sampler2D uPrev;\r
uniform float uDecay;\r
uniform float uFresh;\r
\r
out vec4 outCell;\r
\${PACKING}\r
float hash11(float n) { return fract(sin(n) * 43758.5453); }\r
\r
float vnoise(vec3 p) {\r
  vec3 ip = floor(p);\r
  vec3 fp = fract(p);\r
  float n000 = hash11(dot(ip + vec3(0.0, 0.0, 0.0), vec3(1.0, 57.0, 113.0)));\r
  float n100 = hash11(dot(ip + vec3(1.0, 0.0, 0.0), vec3(1.0, 57.0, 113.0)));\r
  float n010 = hash11(dot(ip + vec3(0.0, 1.0, 0.0), vec3(1.0, 57.0, 113.0)));\r
  float n110 = hash11(dot(ip + vec3(1.0, 1.0, 0.0), vec3(1.0, 57.0, 113.0)));\r
  float n001 = hash11(dot(ip + vec3(0.0, 0.0, 1.0), vec3(1.0, 57.0, 113.0)));\r
  float n101 = hash11(dot(ip + vec3(1.0, 0.0, 1.0), vec3(1.0, 57.0, 113.0)));\r
  float n011 = hash11(dot(ip + vec3(0.0, 1.0, 1.0), vec3(1.0, 57.0, 113.0)));\r
  float n111 = hash11(dot(ip + vec3(1.0, 1.0, 1.0), vec3(1.0, 57.0, 113.0)));\r
  vec3 w = fp * fp * fp * (fp * (fp * 6.0 - 15.0) + 10.0);\r
  float x00 = mix(n000, n100, w.x);\r
  float x10 = mix(n010, n110, w.x);\r
  float x01 = mix(n001, n101, w.x);\r
  float x11 = mix(n011, n111, w.x);\r
  float y0 = mix(x00, x10, w.y);\r
  float y1 = mix(x01, x11, w.y);\r
  return mix(y0, y1, w.z) * 2.0 - 1.0;\r
}\r
\r
float fbm2(vec2 uv, float t) {\r
  vec3 p = vec3(uv * uScale, t);\r
  float amp = 1.0;\r
  float freq = 1.0;\r
  float sum = 1.0;\r
  for (int i = 0; i < 5; ++i) {\r
    sum += amp * vnoise(p * freq);\r
    freq *= 1.25;\r
    amp *= 1.0;\r
  }\r
  return sum * 0.5 + 0.5;\r
}\r
\r
void main() {\r
  ivec2 texel = ivec2(gl_FragCoord.xy);\r
  float aspectRatio = uResolution.x / uResolution.y;\r
  float cellPixelSize = 8.0 * uPixelSize;\r
  vec2 cellId = vec2(texel + uOrigin);\r
  vec2 cellCoord = cellId * cellPixelSize;\r
  vec2 uv = cellCoord / uResolution * vec2(aspectRatio, 1.0);\r
\r
  float base = fbm2(uv + uDrift, uTime * 0.05);\r
  base = base * 0.5 - 0.65;\r
  float feed = base + (uDensity - 0.5) * 0.3;\r
  if (uEnableRipples == 1) {\r
    for (int i = 0; i < \${MAX_CLICKS}; ++i) {\r
      vec2 pos = uClickPos[i];\r
      if (pos.x < 0.0) continue;\r
      vec2 cuv = (((pos - uResolution * 0.5 - cellPixelSize * 0.5) / uResolution)) * vec2(aspectRatio, 1.0);\r
      float t = max(uClickAge[i], 0.0);\r
      float r = distance(uv, cuv);\r
      float waveR = uRippleSpeed * t;\r
      float ring = exp(-pow((r - waveR) / uRippleThickness, 2.0));\r
      float atten = exp(-1.0 * t) * exp(-10.0 * r);\r
      feed = max(feed, ring * atten * uRippleIntensity);\r
    }\r
  }\r
\r
  if (uIntro < 1.0) {\r
    vec2 center = (-cellPixelSize * 0.5 / uResolution) * vec2(aspectRatio, 1.0);\r
    float reach = length(vec2(aspectRatio, 1.0)) * 0.5 + 0.2;\r
    float eased = 1.0 - pow(1.0 - uIntro, 2.4);\r
    float front = eased * reach;\r
    float r = distance(uv, center);\r
    float shown = smoothstep(front + 0.04, front - 0.06, r);\r
    float ring = exp(-pow((r - front) / 0.07, 2.0)) * (1.0 - uIntro);\r
    feed = mix(-1.0, feed, shown);\r
    feed = max(feed, ring * 1.4);\r
  }\r
\r
  float brush = 0.0;\r
  if (uHover > 0) {\r
    vec2 d = (cellCoord + cellPixelSize * 0.5 + uResolution * 0.5 - uMouse) / max(uMouseRadius, 1.0);\r
    brush = exp(-dot(d, d)) * uMousePresence;\r
  }\r
  vec4 prev = texelFetch(uPrev, texel, 0) * (1.0 - uFresh);\r
  float trail = max(brush, max(prev.a * uDecay - 1.0 / 255.0, 0.0));\r
  if (uHover == 2) feed += trail * 0.9;\r
\r
  outCell = vec4(pack16(feed), clamp((feed + 0.5) * 0.5, 0.0, 1.0), trail);\r
}\`;\r
\r
const MAIN_FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
\r
uniform vec3 uColor;\r
uniform vec3 uAccent;\r
uniform vec2 uResolution;\r
uniform float uTime;\r
uniform float uClock;\r
uniform float uPixelSize;\r
uniform float uPixelJitter;\r
uniform float uEdgeFade;\r
uniform int uShapeType;\r
uniform sampler2D uCells;\r
uniform ivec2 uOrigin;\r
uniform ivec2 uCellCount;\r
uniform float uSoftness;\r
uniform float uSmoothing;\r
uniform float uGlow;\r
uniform float uTwinkle;\r
uniform float uLightMode;\r
uniform float uTransparent;\r
uniform float uNoise;\r
uniform int uHover;\r
uniform mat3 uPlane;\r
uniform float uTilted;\r
\r
out vec4 fragColor;\r
\${PACKING}\r
const float BAYER[64] = float[64](\${BAYER_TABLE});\r
\r
vec2 gDx;\r
vec2 gDy;\r
\r
float aaFrom(vec2 grad) {\r
  return abs(dot(grad, gDx)) + abs(dot(grad, gDy));\r
}\r
\r
float maskSquare(vec2 p, float cov, float soft) {\r
  if (soft <= 0.0) return cov;\r
  float side = 0.5 * sqrt(clamp(cov, 0.0, 1.0));\r
  vec2 c = p - 0.5;\r
  vec2 q = abs(c) - side;\r
  float d = max(q.x, q.y);\r
  vec2 grad = q.x > q.y ? vec2(sign(c.x), 0.0) : vec2(0.0, sign(c.y));\r
  float aa = max(aaFrom(grad), 1e-4);\r
  return 1.0 - smoothstep(-aa * 0.5, aa * 0.5, d);\r
}\r
\r
float maskCircle(vec2 p, float cov) {\r
  float r = sqrt(cov) * 0.25;\r
  vec2 c = p - 0.5;\r
  float len = length(c);\r
  float d = len - r;\r
  float aa = 0.5 * aaFrom(c / max(len, 1e-5));\r
  return cov * (1.0 - smoothstep(-aa, aa, d * 2.0));\r
}\r
\r
float maskTriangle(vec2 p, vec2 id, float cov) {\r
  bool flip = mod(id.x + id.y, 2.0) > 0.5;\r
  if (flip) p.x = 1.0 - p.x;\r
  float r = sqrt(cov);\r
  float d = p.y - r * (1.0 - p.x);\r
  float aa = max(aaFrom(vec2(flip ? -r : r, 1.0)), 1e-4);\r
  return cov * clamp(0.5 - d / aa, 0.0, 1.0);\r
}\r
\r
float maskDiamond(vec2 p, float cov) {\r
  float r = sqrt(cov) * 0.564;\r
  return step(abs(p.x - 0.49) + abs(p.y - 0.49), r);\r
}\r
\r
float maskCross(vec2 p, float cov) {\r
  float s = sqrt(clamp(cov, 0.0, 1.0));\r
  vec2 c = p - 0.5;\r
  vec2 q = abs(c);\r
  float arm = 0.42 * s;\r
  float bar = 0.13 * s + 0.02;\r
  float a1 = max(q.x - arm, q.y - bar);\r
  float a2 = max(q.x - bar, q.y - arm);\r
  float d = min(a1, a2);\r
  bool horizontal = a1 < a2 ? q.x - arm > q.y - bar : q.x - bar > q.y - arm;\r
  vec2 grad = horizontal ? vec2(sign(c.x), 0.0) : vec2(0.0, sign(c.y));\r
  float aa = max(aaFrom(grad), 1e-4);\r
  return 1.0 - smoothstep(-aa * 0.5, aa * 0.5, d);\r
}\r
\r
float maskRing(vec2 p, float cov) {\r
  float s = sqrt(clamp(cov, 0.0, 1.0));\r
  vec2 c = p - 0.5;\r
  float len = length(c);\r
  float d = abs(len - 0.3 * s) - 0.09 * s;\r
  vec2 grad = sign(len - 0.3 * s) * c / max(len, 1e-5);\r
  float aa = max(aaFrom(grad), 1e-4);\r
  return 1.0 - smoothstep(-aa * 0.5, aa * 0.5, d);\r
}\r
\r
float hash(vec2 p) {\r
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);\r
}\r
\r
void main() {\r
  float pixelSize = uPixelSize;\r
  vec2 screen = gl_FragCoord.xy;\r
  vec4 empty = uTransparent < 0.5 ? vec4(vec3(uLightMode > 0.5 ? 1.0 : 0.0), 1.0) : vec4(0.0);\r
\r
  float lod = 0.0;\r
  float depthFade = 1.0;\r
  if (uTilted > 0.5) {\r
    vec3 plane = uPlane * vec3(screen.x, uResolution.y - screen.y, 1.0);\r
    screen = vec2(plane.x, uResolution.y * plane.z - plane.y) / max(plane.z, 1e-4);\r
    float footprint = length(fwidth(screen));\r
    lod = smoothstep(0.3, 0.85, footprint / pixelSize);\r
    depthFade = (1.0 - smoothstep(0.45, 1.0, footprint / (8.0 * pixelSize))) * step(0.0, plane.z);\r
  }\r
\r
  vec2 fragCoord = screen - uResolution * 0.5;\r
  gDx = dFdx(fragCoord) / pixelSize;\r
  gDy = dFdy(fragCoord) / pixelSize;\r
  if (depthFade <= 0.0) {\r
    fragColor = empty;\r
    return;\r
  }\r
\r
  float cellPixelSize = 8.0 * pixelSize;\r
  vec2 cellId = floor(fragCoord / cellPixelSize);\r
  ivec2 texel = clamp(ivec2(cellId) - uOrigin, ivec2(0), uCellCount - 1);\r
  vec2 smoothAt = (fragCoord / cellPixelSize - vec2(uOrigin)) / vec2(uCellCount);\r
  vec4 blended = texture(uCells, smoothAt);\r
  float smoothFeed = blended.b * 2.0 - 0.5;\r
  float feed = smoothFeed;\r
  float trail = uHover == 1 ? blended.a : 0.0;\r
  if (uSmoothing < 1.0) {\r
    vec4 cell = texelFetch(uCells, texel, 0);\r
    feed = mix(unpack16(cell.rg), smoothFeed, uSmoothing);\r
    if (uHover == 1) trail = mix(cell.a, blended.a, uSmoothing);\r
  }\r
\r
  if (feed < -0.12 * uSoftness && smoothFeed < 0.2 && (lod <= 0.0 || smoothFeed <= 0.0)) {\r
    fragColor = empty;\r
    return;\r
  }\r
\r
  vec2 pixelId = floor(fragCoord / pixelSize);\r
  vec2 pixelUV = fragCoord / pixelSize - pixelId;\r
  ivec2 cellBits = ivec2(mod(pixelId, 8.0));\r
  float bayer = BAYER[cellBits.y * 8 + cellBits.x] - 0.5;\r
  float margin = feed + bayer - 0.5;\r
  float bw = uSoftness > 0.0 ? smoothstep(-0.12 * uSoftness, 0.12 * uSoftness, margin) : step(0.0, margin);\r
\r
  float h = uPixelJitter > 0.0 || uTwinkle > 0.0 ? fract(sin(dot(pixelId, vec2(127.1, 311.7))) * 43758.5453) : 0.5;\r
  float jitterScale = 1.0 + (h - 0.5) * uPixelJitter;\r
  float heat = max(trail, clamp((feed - 1.0) * 2.5, 0.0, 1.0) * min(uGlow * 2.0, 1.0));\r
  float coverage = bw * jitterScale * (1.0 + heat * 0.35);\r
  float M;\r
  float area;\r
  if (uShapeType == 1) {\r
    M = maskCircle(pixelUV, coverage);\r
    area = 0.196;\r
  } else if (uShapeType == 2) {\r
    M = maskTriangle(pixelUV, pixelId, coverage);\r
    area = 0.5;\r
  } else if (uShapeType == 3) {\r
    M = maskDiamond(pixelUV, coverage);\r
    area = 0.62;\r
  } else if (uShapeType == 4) {\r
    M = maskCross(pixelUV, coverage);\r
    area = 0.41;\r
  } else if (uShapeType == 5) {\r
    M = maskRing(pixelUV, coverage);\r
    area = 0.41;\r
  } else {\r
    M = maskSquare(pixelUV, coverage, uSoftness);\r
    area = 1.0;\r
  }\r
  if (lod > 0.0) {\r
    float average = clamp(smoothFeed, 0.0, 1.0) * area * (1.0 + heat * 0.35);\r
    M = mix(M, average, lod);\r
  }\r
\r
  if (uTwinkle > 0.0) {\r
    float rate = 1.5 + 3.0 * fract(h * 7.31);\r
    float wave = 0.5 + 0.5 * sin(uClock * rate + h * 37.0);\r
    M *= 1.0 - uTwinkle * 0.55 * wave * wave;\r
  }\r
\r
  float density = clamp(smoothFeed, 0.0, 1.0);\r
  float glow = 0.0;\r
  if (uGlow > 0.0) {\r
    float bloom = smoothstep(0.2, 1.0, density);\r
    glow = bloom * bloom * uGlow * (uLightMode > 0.5 ? 0.12 : 0.22) * depthFade;\r
  }\r
\r
  float fade = depthFade;\r
  if (uEdgeFade > 0.0) {\r
    vec2 norm = gl_FragCoord.xy / uResolution;\r
    vec2 edgeA = clamp(norm / uEdgeFade, 0.0, 1.0);\r
    vec2 edgeB = clamp((1.0 - norm) / uEdgeFade, 0.0, 1.0);\r
    vec2 sa = edgeA * edgeA * edgeA * (edgeA * (edgeA * 6.0 - 15.0) + 10.0);\r
    vec2 sb = edgeB * edgeB * edgeB * (edgeB * (edgeB * 6.0 - 15.0) + 10.0);\r
    fade *= sa.x * sa.y * sb.x * sb.y;\r
  }\r
  M = clamp(M, 0.0, 1.0) * fade;\r
  glow *= fade;\r
\r
  float hot = clamp(heat, 0.0, 1.0);\r
  float tone = smoothstep(0.3, 1.0, density) * 0.85;\r
  vec3 color = mix(uColor, uAccent, max(tone, hot));\r
  vec3 lit = uLightMode > 0.5 ? color * (1.0 - 0.35 * hot) : mix(color, vec3(1.0), 0.45 * hot);\r
  if (uNoise > 0.0) {\r
    float n = hash(floor(gl_FragCoord.xy) + floor(uTime * 60.0));\r
    lit = clamp(lit + (n - 0.5) * uNoise, 0.0, 1.0);\r
  }\r
\r
  vec3 haze = uLightMode > 0.5 ? mix(color, vec3(1.0), 0.35) : color;\r
  float alpha = M + glow * (1.0 - M);\r
  vec3 premul = lit * M + haze * glow * (1.0 - M);\r
  if (uTransparent < 0.5) {\r
    vec3 paper = vec3(uLightMode > 0.5 ? 1.0 : 0.0);\r
    fragColor = vec4(premul + paper * (1.0 - alpha), 1.0);\r
    return;\r
  }\r
  fragColor = vec4(premul, alpha);\r
}\`;\r
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
const colorCache = new Map();\r
\r
const hexToRgb = hex => {\r
  const key = String(hex);\r
  const cached = colorCache.get(key);\r
  if (cached) return cached;\r
  const rgb = parseHex(hex);\r
  if (colorCache.size > 64) colorCache.clear();\r
  colorCache.set(key, rgb);\r
  return rgb;\r
};\r
\r
const parseHex = hex => {\r
  let h = String(hex || '#ffffff')\r
    .replace('#', '')\r
    .trim();\r
  if (h.length === 3 || h.length === 4)\r
    h = h\r
      .slice(0, 3)\r
      .split('')\r
      .map(c => c + c)\r
      .join('');\r
  const num = parseInt(h.slice(0, 6), 16);\r
  if (Number.isNaN(num)) return [1, 1, 1];\r
  return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];\r
};\r
\r
const randomFloat = () => {\r
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {\r
    const u32 = new Uint32Array(1);\r
    window.crypto.getRandomValues(u32);\r
    return u32[0] / 0xffffffff;\r
  }\r
  return Math.random();\r
};\r
\r
const invert3 = m => {\r
  const [a, b, c, d, e, f, g, h, i] = m;\r
  const A = e * i - f * h;\r
  const B = -(d * i - f * g);\r
  const C = d * h - e * g;\r
  const det = a * A + b * B + c * C || 1;\r
  return [\r
    A / det,\r
    -(b * i - c * h) / det,\r
    (b * f - c * e) / det,\r
    B / det,\r
    (a * i - c * g) / det,\r
    -(a * f - c * d) / det,\r
    C / det,\r
    -(a * h - b * g) / det,\r
    (a * e - b * d) / det\r
  ];\r
};\r
\r
const multiply3 = (x, y) => {\r
  const out = new Array(9);\r
  for (let r = 0; r < 3; r++) {\r
    for (let c = 0; c < 3; c++) {\r
      out[r * 3 + c] = x[r * 3] * y[c] + x[r * 3 + 1] * y[3 + c] + x[r * 3 + 2] * y[6 + c];\r
    }\r
  }\r
  return out;\r
};\r
\r
const planeFor = (tiltX, tiltY, width, height) => {\r
  const ax = (tiltX * Math.PI) / 180;\r
  const ay = (tiltY * Math.PI) / 180;\r
  const depth = Math.max(width, height) * 1.25;\r
  const cx = width / 2;\r
  const cy = height / 2;\r
  const tilt = [\r
    Math.cos(ay),\r
    0,\r
    0,\r
    Math.sin(ax) * Math.sin(ay),\r
    Math.cos(ax),\r
    0,\r
    (Math.sin(ay) * Math.cos(ax)) / depth,\r
    -Math.sin(ax) / depth,\r
    1\r
  ];\r
  const forward = multiply3(multiply3([1, 0, cx, 0, 1, cy, 0, 0, 1], tilt), [1, 0, -cx, 0, 1, -cy, 0, 0, 1]);\r
  return invert3(forward);\r
};\r
\r
const PixelBlast = ({\r
  variant = 'square',\r
  pixelSize = 3,\r
  color = '#B497CF',\r
  accentColor,\r
  className,\r
  style,\r
  patternScale = 2,\r
  patternDensity = 1,\r
  pixelSizeJitter = 0,\r
  enableRipples = true,\r
  rippleIntensityScale = 1,\r
  rippleThickness = 0.1,\r
  rippleSpeed = 0.3,\r
  autoPauseOffscreen = true,\r
  speed = 0.5,\r
  transparent = true,\r
  edgeFade = 0.5,\r
  noiseAmount = 0,\r
  softness = 0.6,\r
  smoothing = 1,\r
  glow = 0.4,\r
  twinkle = 0.25,\r
  drift = 0.2,\r
  driftAngle = 30,\r
  hoverEffect = 'reveal',\r
  hoverRadius = 140,\r
  autoRipple = 0,\r
  tiltX = 0,\r
  tiltY = 0,\r
  intro = true,\r
  variation,\r
  lightMode = false,\r
  dpr\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settings = {\r
    variant: SHAPES[variant] ?? 0,\r
    pixelSize: Math.max(0.5, pixelSize),\r
    color,\r
    accentColor: accentColor || color,\r
    patternScale,\r
    patternDensity,\r
    pixelSizeJitter,\r
    enableRipples,\r
    rippleIntensityScale,\r
    rippleThickness: Math.max(0.001, rippleThickness),\r
    rippleSpeed,\r
    autoPauseOffscreen,\r
    speed,\r
    transparent,\r
    edgeFade: clamp(edgeFade, 0, 1),\r
    noiseAmount,\r
    softness: clamp(softness, 0, 1),\r
    smoothing: clamp(smoothing, 0, 1),\r
    glow: clamp(glow, 0, 2),\r
    twinkle: clamp(twinkle, 0, 1),\r
    drift,\r
    driftAngle,\r
    hoverEffect: HOVERS[hoverEffect] ?? 0,\r
    hoverRadius: Math.max(10, hoverRadius),\r
    autoRipple: Math.max(0, autoRipple),\r
    tiltX: clamp(tiltX, -70, 70),\r
    tiltY: clamp(tiltY, -70, 70),\r
    intro,\r
    variation,\r
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
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
    const cellShader = link(gl, CELL_FRAGMENT);\r
    const mainShader = link(gl, MAIN_FRAGMENT);\r
    if (!cellShader || !mainShader) return undefined;\r
    const cu = cellShader.uniforms;\r
    const mu = mainShader.uniforms;\r
    const vao = gl.createVertexArray();\r
\r
    const makeTexture = filter => {\r
      const texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
      return texture;\r
    };\r
    const targets = [0, 1].map(() => {\r
      const texture = makeTexture(gl.LINEAR);\r
      const framebuffer = gl.createFramebuffer();\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
      return { texture, framebuffer };\r
    });\r
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1, ratio: 1, plane: null, tiltKey: '' };\r
    const cells = { x: 0, y: 0, w: 1, h: 1, key: '' };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const mouse = { x: 0, y: 0, ready: false };\r
    const clickPos = new Float32Array(MAX_CLICKS * 2).fill(-1);\r
    const clickAt = new Float32Array(MAX_CLICKS);\r
    const clickAge = new Float32Array(MAX_CLICKS);\r
    let clickIndex = 0;\r
    let current = 0;\r
    let fresh = true;\r
    const seedOffset = settingsRef.current.variation;\r
    const timeOffset = typeof seedOffset === 'number' ? seedOffset * 37 : randomFloat() * 1000;\r
    let elapsed = 0;\r
    let clock = 0;\r
    let presence = 0;\r
    let driftX = 0;\r
    let driftY = 0;\r
    let introClock = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let nextAuto = 1.2;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let quiet = 0;\r
\r
    const patternTime = s => timeOffset + elapsed * s.speed;\r
\r
    const layoutCells = s => {\r
      const ps = s.pixelSize * view.ratio;\r
      const cps = 8 * ps;\r
      const w = canvas.width;\r
      const h = canvas.height;\r
      let minX = -w / 2;\r
      let maxX = w / 2;\r
      let minY = -h / 2;\r
      let maxY = h / 2;\r
      if (view.plane) {\r
        const corners = [\r
          [0, 0],\r
          [w, 0],\r
          [0, h],\r
          [w, h],\r
          [w / 2, 0],\r
          [w / 2, h],\r
          [0, h / 2],\r
          [w, h / 2]\r
        ];\r
        minX = Infinity;\r
        maxX = -Infinity;\r
        minY = Infinity;\r
        maxY = -Infinity;\r
        for (const [x, y] of corners) {\r
          const [qx, qy] = toPlane(x, y);\r
          if (qx < -1e5) continue;\r
          minX = Math.min(minX, qx - w / 2);\r
          maxX = Math.max(maxX, qx - w / 2);\r
          minY = Math.min(minY, qy - h / 2);\r
          maxY = Math.max(maxY, qy - h / 2);\r
        }\r
        if (!Number.isFinite(minX)) {\r
          minX = -w / 2;\r
          maxX = w / 2;\r
          minY = -h / 2;\r
          maxY = h / 2;\r
        }\r
      }\r
      const pad = cps;\r
      const x0 = Math.floor((minX - pad) / cps);\r
      const x1 = Math.floor((maxX + pad) / cps);\r
      const y0 = Math.floor((minY - pad) / cps);\r
      const y1 = Math.floor((maxY + pad) / cps);\r
      const width = Math.max(1, Math.min(2048, x1 - x0 + 1));\r
      const height = Math.max(1, Math.min(2048, y1 - y0 + 1));\r
      const key = \`\${x0}:\${y0}:\${width}:\${height}\`;\r
      if (key === cells.key) return;\r
      cells.key = key;\r
      cells.x = x0;\r
      cells.y = y0;\r
      cells.w = width;\r
      cells.h = height;\r
      for (const target of targets) {\r
        gl.bindTexture(gl.TEXTURE_2D, target.texture);\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
      }\r
      fresh = true;\r
    };\r
\r
    const planeClicks = new Float32Array(MAX_CLICKS * 2);\r
\r
    const stepCells = (s, decay) => {\r
      for (let k = 0; k < MAX_CLICKS; k++) {\r
        if (clickPos[k * 2] < 0) {\r
          planeClicks[k * 2] = -1;\r
          planeClicks[k * 2 + 1] = -1;\r
          continue;\r
        }\r
        const [px, py] = toPlane(clickPos[k * 2], clickPos[k * 2 + 1]);\r
        planeClicks[k * 2] = Math.max(px, 0);\r
        planeClicks[k * 2 + 1] = py;\r
      }\r
      const [mx, my] = toPlane(mouse.x, mouse.y);\r
      const source = targets[current];\r
      const target = targets[1 - current];\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);\r
      gl.viewport(0, 0, cells.w, cells.h);\r
      gl.disable(gl.BLEND);\r
      gl.useProgram(cellShader.program);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, source.texture);\r
      gl.uniform1i(cu.uPrev, 0);\r
      gl.uniform2f(cu.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(cu.uTime, patternTime(s));\r
      gl.uniform1f(cu.uPixelSize, s.pixelSize * view.ratio);\r
      gl.uniform1f(cu.uScale, s.patternScale);\r
      gl.uniform1f(cu.uDensity, s.patternDensity);\r
      gl.uniform1i(cu.uEnableRipples, s.enableRipples ? 1 : 0);\r
      gl.uniform1f(cu.uRippleSpeed, s.rippleSpeed);\r
      gl.uniform1f(cu.uRippleThickness, s.rippleThickness);\r
      gl.uniform1f(cu.uRippleIntensity, s.rippleIntensityScale);\r
      gl.uniform2fv(cu.uClickPos, planeClicks);\r
      gl.uniform1fv(cu.uClickAge, clickAge);\r
      gl.uniform2i(cu.uOrigin, cells.x, cells.y);\r
      gl.uniform2f(cu.uDrift, driftX, driftY);\r
      gl.uniform1i(cu.uHover, s.hoverEffect);\r
      gl.uniform2f(cu.uMouse, mx, my);\r
      gl.uniform1f(cu.uMouseRadius, s.hoverRadius * view.ratio);\r
      gl.uniform1f(cu.uMousePresence, presence);\r
      gl.uniform1f(cu.uIntro, introClock);\r
      gl.uniform1f(cu.uDecay, decay);\r
      gl.uniform1f(cu.uFresh, fresh ? 1 : 0);\r
      gl.bindVertexArray(vao);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      current = 1 - current;\r
      fresh = false;\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.useProgram(mainShader.program);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, targets[current].texture);\r
      gl.uniform1i(mu.uCells, 0);\r
      gl.uniform3fv(mu.uColor, hexToRgb(s.color));\r
      gl.uniform3fv(mu.uAccent, hexToRgb(s.accentColor));\r
      gl.uniform2f(mu.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(mu.uTime, patternTime(s));\r
      gl.uniform1f(mu.uClock, clock);\r
      gl.uniform1f(mu.uPixelSize, s.pixelSize * view.ratio);\r
      gl.uniform1f(mu.uPixelJitter, s.pixelSizeJitter);\r
      gl.uniform1f(mu.uEdgeFade, s.edgeFade);\r
      gl.uniform1i(mu.uShapeType, s.variant);\r
      gl.uniform2i(mu.uOrigin, cells.x, cells.y);\r
      gl.uniform2i(mu.uCellCount, cells.w, cells.h);\r
      gl.uniform1f(mu.uSoftness, s.softness);\r
      gl.uniform1f(mu.uSmoothing, s.smoothing);\r
      gl.uniform1f(mu.uGlow, s.glow);\r
      gl.uniform1f(mu.uTwinkle, reduce ? 0 : s.twinkle);\r
      gl.uniform1f(mu.uLightMode, s.lightMode ? 1 : 0);\r
      gl.uniform1f(mu.uTransparent, s.transparent ? 1 : 0);\r
      gl.uniform1f(mu.uNoise, s.noiseAmount);\r
      gl.uniform1i(mu.uHover, s.hoverEffect);\r
      gl.uniform1f(mu.uTilted, view.plane ? 1 : 0);\r
      if (view.plane) {\r
        const m = view.plane;\r
        gl.uniformMatrix3fv(mu.uPlane, false, [m[0], m[3], m[6], m[1], m[4], m[7], m[2], m[5], m[8]]);\r
      }\r
      gl.bindVertexArray(vao);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const toPlane = (x, y) => {\r
      const m = view.plane;\r
      if (!m) return [x, y];\r
      const h = canvas.height;\r
      const cy = h - y;\r
      const z = m[6] * x + m[7] * cy + m[8];\r
      if (z <= 1e-4) return [-1e6, -1e6];\r
      return [(m[0] * x + m[1] * cy + m[2]) / z, h - (m[3] * x + m[4] * cy + m[5]) / z];\r
    };\r
\r
    const updatePlane = s => {\r
      view.plane = s.tiltX || s.tiltY ? planeFor(s.tiltX, s.tiltY, canvas.width, canvas.height) : null;\r
      view.tiltKey = \`\${s.tiltX}:\${s.tiltY}:\${canvas.width}:\${canvas.height}\`;\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      view.width = Math.max(1, container.clientWidth);\r
      view.height = Math.max(1, container.clientHeight);\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(view.width * view.ratio));\r
      canvas.height = Math.max(1, Math.round(view.height * view.ratio));\r
      if (!mouse.ready) {\r
        mouse.ready = true;\r
        mouse.x = canvas.width / 2;\r
        mouse.y = canvas.height / 2;\r
      }\r
      updatePlane(s);\r
      layoutCells(s);\r
      stepCells(s, 0);\r
      draw();\r
      wake();\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      const s = settingsRef.current;\r
      if (!visible && s.autoPauseOffscreen) return;\r
      if (document.hidden) return;\r
      const dt = last ? clamp((now - last) / 1000, 0, 1 / 20) : 0;\r
      last = now;\r
      if (!reduce) elapsed += dt;\r
      clock += dt;\r
      if (!reduce && s.drift) {\r
        const angle = (s.driftAngle * Math.PI) / 180;\r
        driftX += Math.cos(angle) * s.drift * dt * 0.05;\r
        driftY += Math.sin(angle) * s.drift * dt * 0.05;\r
      }\r
      if (!reduce && s.enableRipples && s.autoRipple > 0 && introClock >= 1) {\r
        nextAuto -= dt;\r
        if (nextAuto <= 0) {\r
          nextAuto = s.autoRipple * (0.7 + Math.random() * 0.6);\r
          addRipple((0.15 + Math.random() * 0.7) * view.width, (0.15 + Math.random() * 0.7) * view.height);\r
        }\r
      }\r
      for (let k = 0; k < MAX_CLICKS; k++) clickAge[k] = (clock - clickAt[k]) * 0.5;\r
      const targetX = pointer.x * view.ratio;\r
      const targetY = (view.height - pointer.y) * view.ratio;\r
      const follow = 1 - Math.exp(-dt / 0.08);\r
      if (pointer.inside) {\r
        mouse.x += (targetX - mouse.x) * follow;\r
        mouse.y += (targetY - mouse.y) * follow;\r
      }\r
      presence += ((pointer.inside ? 1 : 0) - presence) * (1 - Math.exp(-dt / 0.25));\r
      const key = \`\${s.tiltX}:\${s.tiltY}:\${canvas.width}:\${canvas.height}\`;\r
      if (key !== view.tiltKey) updatePlane(s);\r
      layoutCells(s);\r
      const decay = s.hoverEffect ? Math.exp(-dt / 0.45) : 0;\r
      stepCells(s, decay);\r
      draw();\r
      if (introClock < 1) introClock = Math.min(1, introClock + dt / INTRO_SECONDS);\r
      let busy = !reduce && (s.speed !== 0 || s.drift !== 0 || s.twinkle > 0 || (s.autoRipple > 0 && s.enableRipples));\r
      busy = busy || introClock < 1 || presence > 0.001;\r
      for (let k = 0; k < MAX_CLICKS; k++) busy = busy || (clickPos[k * 2] >= 0 && clickAge[k] < 8);\r
      quiet = busy ? 0 : quiet + dt;\r
      if (quiet < 1.5) raf = requestAnimationFrame(frame);\r
    };\r
\r
    function wake() {\r
      quiet = 0;\r
      if (!raf && (visible || !settingsRef.current.autoPauseOffscreen) && !document.hidden) {\r
        last = 0;\r
        raf = requestAnimationFrame(frame);\r
      }\r
    }\r
\r
    const locate = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };\r
    };\r
\r
    const onPointerMove = event => {\r
      const { x, y, inside } = locate(event);\r
      const was = pointer.inside;\r
      pointer.inside = inside;\r
      if (inside) {\r
        pointer.x = x;\r
        pointer.y = y;\r
        if (!was) {\r
          mouse.x = x * view.ratio;\r
          mouse.y = (view.height - y) * view.ratio;\r
        }\r
      }\r
      if (inside || was) wake();\r
    };\r
\r
    function addRipple(x, y) {\r
      clickPos[clickIndex * 2] = x * view.ratio;\r
      clickPos[clickIndex * 2 + 1] = (view.height - y) * view.ratio;\r
      clickAt[clickIndex] = clock;\r
      clickIndex = (clickIndex + 1) % MAX_CLICKS;\r
      wake();\r
    }\r
\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      const { x, y, inside } = locate(event);\r
      if (!inside || reduce || !s.enableRipples) return;\r
      addRipple(x, y);\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
    const onVisibility = () => wake();\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(container);\r
    const intersection = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible) wake();\r
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
      for (const target of targets) {\r
        gl.deleteTexture(target.texture);\r
        gl.deleteFramebuffer(target.framebuffer);\r
      }\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(cellShader.program);\r
      gl.deleteProgram(mainShader.program);\r
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
      aria-label="PixelBlast interactive background"\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default PixelBlast;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties } from 'react';\r
import './PixelBlast.css';\r
\r
export type PixelBlastVariant = 'square' | 'circle' | 'triangle' | 'diamond' | 'cross' | 'ring';\r
export type PixelBlastHoverEffect = 'reveal' | 'grow' | 'none';\r
\r
export interface PixelBlastProps {\r
  variant?: PixelBlastVariant;\r
  pixelSize?: number;\r
  color?: string;\r
  accentColor?: string;\r
  className?: string;\r
  style?: CSSProperties;\r
  patternScale?: number;\r
  patternDensity?: number;\r
  pixelSizeJitter?: number;\r
  enableRipples?: boolean;\r
  rippleIntensityScale?: number;\r
  rippleThickness?: number;\r
  rippleSpeed?: number;\r
  autoPauseOffscreen?: boolean;\r
  speed?: number;\r
  transparent?: boolean;\r
  edgeFade?: number;\r
  noiseAmount?: number;\r
  softness?: number;\r
  smoothing?: number;\r
  glow?: number;\r
  twinkle?: number;\r
  drift?: number;\r
  driftAngle?: number;\r
  hoverEffect?: PixelBlastHoverEffect;\r
  hoverRadius?: number;\r
  autoRipple?: number;\r
  tiltX?: number;\r
  tiltY?: number;\r
  intro?: boolean;\r
  variation?: number;\r
  lightMode?: boolean;\r
  dpr?: number;\r
}\r
\r
type Settings = {\r
  variant: number;\r
  pixelSize: number;\r
  color: string;\r
  accentColor: string;\r
  patternScale: number;\r
  patternDensity: number;\r
  pixelSizeJitter: number;\r
  enableRipples: boolean;\r
  rippleIntensityScale: number;\r
  rippleThickness: number;\r
  rippleSpeed: number;\r
  autoPauseOffscreen: boolean;\r
  speed: number;\r
  transparent: boolean;\r
  edgeFade: number;\r
  noiseAmount: number;\r
  softness: number;\r
  smoothing: number;\r
  glow: number;\r
  twinkle: number;\r
  drift: number;\r
  driftAngle: number;\r
  hoverEffect: number;\r
  hoverRadius: number;\r
  autoRipple: number;\r
  tiltX: number;\r
  tiltY: number;\r
  intro: boolean;\r
  variation?: number;\r
  lightMode: boolean;\r
  dpr?: number;\r
};\r
\r
type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };\r
\r
const MAX_CLICKS = 10;\r
const INTRO_SECONDS = 1.8;\r
const SHAPES: Record<string, number> = { square: 0, circle: 1, triangle: 2, diamond: 3, cross: 4, ring: 5 };\r
const HOVERS: Record<string, number> = { none: 0, grow: 1, reveal: 2 };\r
const bayer2 = (x: number, y: number): number => (Math.floor(x) / 2 + Math.floor(y) * Math.floor(y) * 0.75) % 1;\r
const bayer8 = (x: number, y: number): number =>\r
  (bayer2(x / 4, y / 4) * 0.25 + bayer2(x / 2, y / 2)) * 0.25 + bayer2(x, y);\r
const BAYER_TABLE = Array.from({ length: 64 }, (_, i) => bayer8(i % 8, Math.floor(i / 8)).toFixed(6)).join(', ');\r
const RANGE_MIN = -6;\r
const RANGE_MAX = 10;\r
\r
const VERTEX = \`#version 300 es\r
void main() {\r
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\r
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const PACKING = \`\r
const float RANGE_MIN = \${RANGE_MIN.toFixed(1)};\r
const float RANGE_MAX = \${RANGE_MAX.toFixed(1)};\r
\r
vec2 pack16(float value) {\r
  float x = floor(clamp((value - RANGE_MIN) / (RANGE_MAX - RANGE_MIN), 0.0, 1.0) * 65535.0 + 0.5);\r
  float hi = floor(x / 256.0);\r
  return vec2(hi, x - hi * 256.0) / 255.0;\r
}\r
\r
float unpack16(vec2 c) {\r
  float x = floor(c.x * 255.0 + 0.5) * 256.0 + floor(c.y * 255.0 + 0.5);\r
  return RANGE_MIN + x / 65535.0 * (RANGE_MAX - RANGE_MIN);\r
}\r
\`;\r
\r
const CELL_FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
\r
uniform vec2 uResolution;\r
uniform float uTime;\r
uniform float uPixelSize;\r
uniform float uScale;\r
uniform float uDensity;\r
uniform int uEnableRipples;\r
uniform float uRippleSpeed;\r
uniform float uRippleThickness;\r
uniform float uRippleIntensity;\r
uniform vec2 uClickPos[\${MAX_CLICKS}];\r
uniform float uClickAge[\${MAX_CLICKS}];\r
uniform ivec2 uOrigin;\r
uniform vec2 uDrift;\r
uniform int uHover;\r
uniform vec2 uMouse;\r
uniform float uMouseRadius;\r
uniform float uMousePresence;\r
uniform float uIntro;\r
uniform sampler2D uPrev;\r
uniform float uDecay;\r
uniform float uFresh;\r
\r
out vec4 outCell;\r
\${PACKING}\r
float hash11(float n) { return fract(sin(n) * 43758.5453); }\r
\r
float vnoise(vec3 p) {\r
  vec3 ip = floor(p);\r
  vec3 fp = fract(p);\r
  float n000 = hash11(dot(ip + vec3(0.0, 0.0, 0.0), vec3(1.0, 57.0, 113.0)));\r
  float n100 = hash11(dot(ip + vec3(1.0, 0.0, 0.0), vec3(1.0, 57.0, 113.0)));\r
  float n010 = hash11(dot(ip + vec3(0.0, 1.0, 0.0), vec3(1.0, 57.0, 113.0)));\r
  float n110 = hash11(dot(ip + vec3(1.0, 1.0, 0.0), vec3(1.0, 57.0, 113.0)));\r
  float n001 = hash11(dot(ip + vec3(0.0, 0.0, 1.0), vec3(1.0, 57.0, 113.0)));\r
  float n101 = hash11(dot(ip + vec3(1.0, 0.0, 1.0), vec3(1.0, 57.0, 113.0)));\r
  float n011 = hash11(dot(ip + vec3(0.0, 1.0, 1.0), vec3(1.0, 57.0, 113.0)));\r
  float n111 = hash11(dot(ip + vec3(1.0, 1.0, 1.0), vec3(1.0, 57.0, 113.0)));\r
  vec3 w = fp * fp * fp * (fp * (fp * 6.0 - 15.0) + 10.0);\r
  float x00 = mix(n000, n100, w.x);\r
  float x10 = mix(n010, n110, w.x);\r
  float x01 = mix(n001, n101, w.x);\r
  float x11 = mix(n011, n111, w.x);\r
  float y0 = mix(x00, x10, w.y);\r
  float y1 = mix(x01, x11, w.y);\r
  return mix(y0, y1, w.z) * 2.0 - 1.0;\r
}\r
\r
float fbm2(vec2 uv, float t) {\r
  vec3 p = vec3(uv * uScale, t);\r
  float amp = 1.0;\r
  float freq = 1.0;\r
  float sum = 1.0;\r
  for (int i = 0; i < 5; ++i) {\r
    sum += amp * vnoise(p * freq);\r
    freq *= 1.25;\r
    amp *= 1.0;\r
  }\r
  return sum * 0.5 + 0.5;\r
}\r
\r
void main() {\r
  ivec2 texel = ivec2(gl_FragCoord.xy);\r
  float aspectRatio = uResolution.x / uResolution.y;\r
  float cellPixelSize = 8.0 * uPixelSize;\r
  vec2 cellId = vec2(texel + uOrigin);\r
  vec2 cellCoord = cellId * cellPixelSize;\r
  vec2 uv = cellCoord / uResolution * vec2(aspectRatio, 1.0);\r
\r
  float base = fbm2(uv + uDrift, uTime * 0.05);\r
  base = base * 0.5 - 0.65;\r
  float feed = base + (uDensity - 0.5) * 0.3;\r
  if (uEnableRipples == 1) {\r
    for (int i = 0; i < \${MAX_CLICKS}; ++i) {\r
      vec2 pos = uClickPos[i];\r
      if (pos.x < 0.0) continue;\r
      vec2 cuv = (((pos - uResolution * 0.5 - cellPixelSize * 0.5) / uResolution)) * vec2(aspectRatio, 1.0);\r
      float t = max(uClickAge[i], 0.0);\r
      float r = distance(uv, cuv);\r
      float waveR = uRippleSpeed * t;\r
      float ring = exp(-pow((r - waveR) / uRippleThickness, 2.0));\r
      float atten = exp(-1.0 * t) * exp(-10.0 * r);\r
      feed = max(feed, ring * atten * uRippleIntensity);\r
    }\r
  }\r
\r
  if (uIntro < 1.0) {\r
    vec2 center = (-cellPixelSize * 0.5 / uResolution) * vec2(aspectRatio, 1.0);\r
    float reach = length(vec2(aspectRatio, 1.0)) * 0.5 + 0.2;\r
    float eased = 1.0 - pow(1.0 - uIntro, 2.4);\r
    float front = eased * reach;\r
    float r = distance(uv, center);\r
    float shown = smoothstep(front + 0.04, front - 0.06, r);\r
    float ring = exp(-pow((r - front) / 0.07, 2.0)) * (1.0 - uIntro);\r
    feed = mix(-1.0, feed, shown);\r
    feed = max(feed, ring * 1.4);\r
  }\r
\r
  float brush = 0.0;\r
  if (uHover > 0) {\r
    vec2 d = (cellCoord + cellPixelSize * 0.5 + uResolution * 0.5 - uMouse) / max(uMouseRadius, 1.0);\r
    brush = exp(-dot(d, d)) * uMousePresence;\r
  }\r
  vec4 prev = texelFetch(uPrev, texel, 0) * (1.0 - uFresh);\r
  float trail = max(brush, max(prev.a * uDecay - 1.0 / 255.0, 0.0));\r
  if (uHover == 2) feed += trail * 0.9;\r
\r
  outCell = vec4(pack16(feed), clamp((feed + 0.5) * 0.5, 0.0, 1.0), trail);\r
}\`;\r
\r
const MAIN_FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
\r
uniform vec3 uColor;\r
uniform vec3 uAccent;\r
uniform vec2 uResolution;\r
uniform float uTime;\r
uniform float uClock;\r
uniform float uPixelSize;\r
uniform float uPixelJitter;\r
uniform float uEdgeFade;\r
uniform int uShapeType;\r
uniform sampler2D uCells;\r
uniform ivec2 uOrigin;\r
uniform ivec2 uCellCount;\r
uniform float uSoftness;\r
uniform float uSmoothing;\r
uniform float uGlow;\r
uniform float uTwinkle;\r
uniform float uLightMode;\r
uniform float uTransparent;\r
uniform float uNoise;\r
uniform int uHover;\r
uniform mat3 uPlane;\r
uniform float uTilted;\r
\r
out vec4 fragColor;\r
\${PACKING}\r
const float BAYER[64] = float[64](\${BAYER_TABLE});\r
\r
vec2 gDx;\r
vec2 gDy;\r
\r
float aaFrom(vec2 grad) {\r
  return abs(dot(grad, gDx)) + abs(dot(grad, gDy));\r
}\r
\r
float maskSquare(vec2 p, float cov, float soft) {\r
  if (soft <= 0.0) return cov;\r
  float side = 0.5 * sqrt(clamp(cov, 0.0, 1.0));\r
  vec2 c = p - 0.5;\r
  vec2 q = abs(c) - side;\r
  float d = max(q.x, q.y);\r
  vec2 grad = q.x > q.y ? vec2(sign(c.x), 0.0) : vec2(0.0, sign(c.y));\r
  float aa = max(aaFrom(grad), 1e-4);\r
  return 1.0 - smoothstep(-aa * 0.5, aa * 0.5, d);\r
}\r
\r
float maskCircle(vec2 p, float cov) {\r
  float r = sqrt(cov) * 0.25;\r
  vec2 c = p - 0.5;\r
  float len = length(c);\r
  float d = len - r;\r
  float aa = 0.5 * aaFrom(c / max(len, 1e-5));\r
  return cov * (1.0 - smoothstep(-aa, aa, d * 2.0));\r
}\r
\r
float maskTriangle(vec2 p, vec2 id, float cov) {\r
  bool flip = mod(id.x + id.y, 2.0) > 0.5;\r
  if (flip) p.x = 1.0 - p.x;\r
  float r = sqrt(cov);\r
  float d = p.y - r * (1.0 - p.x);\r
  float aa = max(aaFrom(vec2(flip ? -r : r, 1.0)), 1e-4);\r
  return cov * clamp(0.5 - d / aa, 0.0, 1.0);\r
}\r
\r
float maskDiamond(vec2 p, float cov) {\r
  float r = sqrt(cov) * 0.564;\r
  return step(abs(p.x - 0.49) + abs(p.y - 0.49), r);\r
}\r
\r
float maskCross(vec2 p, float cov) {\r
  float s = sqrt(clamp(cov, 0.0, 1.0));\r
  vec2 c = p - 0.5;\r
  vec2 q = abs(c);\r
  float arm = 0.42 * s;\r
  float bar = 0.13 * s + 0.02;\r
  float a1 = max(q.x - arm, q.y - bar);\r
  float a2 = max(q.x - bar, q.y - arm);\r
  float d = min(a1, a2);\r
  bool horizontal = a1 < a2 ? q.x - arm > q.y - bar : q.x - bar > q.y - arm;\r
  vec2 grad = horizontal ? vec2(sign(c.x), 0.0) : vec2(0.0, sign(c.y));\r
  float aa = max(aaFrom(grad), 1e-4);\r
  return 1.0 - smoothstep(-aa * 0.5, aa * 0.5, d);\r
}\r
\r
float maskRing(vec2 p, float cov) {\r
  float s = sqrt(clamp(cov, 0.0, 1.0));\r
  vec2 c = p - 0.5;\r
  float len = length(c);\r
  float d = abs(len - 0.3 * s) - 0.09 * s;\r
  vec2 grad = sign(len - 0.3 * s) * c / max(len, 1e-5);\r
  float aa = max(aaFrom(grad), 1e-4);\r
  return 1.0 - smoothstep(-aa * 0.5, aa * 0.5, d);\r
}\r
\r
float hash(vec2 p) {\r
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);\r
}\r
\r
void main() {\r
  float pixelSize = uPixelSize;\r
  vec2 screen = gl_FragCoord.xy;\r
  vec4 empty = uTransparent < 0.5 ? vec4(vec3(uLightMode > 0.5 ? 1.0 : 0.0), 1.0) : vec4(0.0);\r
\r
  float lod = 0.0;\r
  float depthFade = 1.0;\r
  if (uTilted > 0.5) {\r
    vec3 plane = uPlane * vec3(screen.x, uResolution.y - screen.y, 1.0);\r
    screen = vec2(plane.x, uResolution.y * plane.z - plane.y) / max(plane.z, 1e-4);\r
    float footprint = length(fwidth(screen));\r
    lod = smoothstep(0.3, 0.85, footprint / pixelSize);\r
    depthFade = (1.0 - smoothstep(0.45, 1.0, footprint / (8.0 * pixelSize))) * step(0.0, plane.z);\r
  }\r
\r
  vec2 fragCoord = screen - uResolution * 0.5;\r
  gDx = dFdx(fragCoord) / pixelSize;\r
  gDy = dFdy(fragCoord) / pixelSize;\r
  if (depthFade <= 0.0) {\r
    fragColor = empty;\r
    return;\r
  }\r
\r
  float cellPixelSize = 8.0 * pixelSize;\r
  vec2 cellId = floor(fragCoord / cellPixelSize);\r
  ivec2 texel = clamp(ivec2(cellId) - uOrigin, ivec2(0), uCellCount - 1);\r
  vec2 smoothAt = (fragCoord / cellPixelSize - vec2(uOrigin)) / vec2(uCellCount);\r
  vec4 blended = texture(uCells, smoothAt);\r
  float smoothFeed = blended.b * 2.0 - 0.5;\r
  float feed = smoothFeed;\r
  float trail = uHover == 1 ? blended.a : 0.0;\r
  if (uSmoothing < 1.0) {\r
    vec4 cell = texelFetch(uCells, texel, 0);\r
    feed = mix(unpack16(cell.rg), smoothFeed, uSmoothing);\r
    if (uHover == 1) trail = mix(cell.a, blended.a, uSmoothing);\r
  }\r
\r
  if (feed < -0.12 * uSoftness && smoothFeed < 0.2 && (lod <= 0.0 || smoothFeed <= 0.0)) {\r
    fragColor = empty;\r
    return;\r
  }\r
\r
  vec2 pixelId = floor(fragCoord / pixelSize);\r
  vec2 pixelUV = fragCoord / pixelSize - pixelId;\r
  ivec2 cellBits = ivec2(mod(pixelId, 8.0));\r
  float bayer = BAYER[cellBits.y * 8 + cellBits.x] - 0.5;\r
  float margin = feed + bayer - 0.5;\r
  float bw = uSoftness > 0.0 ? smoothstep(-0.12 * uSoftness, 0.12 * uSoftness, margin) : step(0.0, margin);\r
\r
  float h = uPixelJitter > 0.0 || uTwinkle > 0.0 ? fract(sin(dot(pixelId, vec2(127.1, 311.7))) * 43758.5453) : 0.5;\r
  float jitterScale = 1.0 + (h - 0.5) * uPixelJitter;\r
  float heat = max(trail, clamp((feed - 1.0) * 2.5, 0.0, 1.0) * min(uGlow * 2.0, 1.0));\r
  float coverage = bw * jitterScale * (1.0 + heat * 0.35);\r
  float M;\r
  float area;\r
  if (uShapeType == 1) {\r
    M = maskCircle(pixelUV, coverage);\r
    area = 0.196;\r
  } else if (uShapeType == 2) {\r
    M = maskTriangle(pixelUV, pixelId, coverage);\r
    area = 0.5;\r
  } else if (uShapeType == 3) {\r
    M = maskDiamond(pixelUV, coverage);\r
    area = 0.62;\r
  } else if (uShapeType == 4) {\r
    M = maskCross(pixelUV, coverage);\r
    area = 0.41;\r
  } else if (uShapeType == 5) {\r
    M = maskRing(pixelUV, coverage);\r
    area = 0.41;\r
  } else {\r
    M = maskSquare(pixelUV, coverage, uSoftness);\r
    area = 1.0;\r
  }\r
  if (lod > 0.0) {\r
    float average = clamp(smoothFeed, 0.0, 1.0) * area * (1.0 + heat * 0.35);\r
    M = mix(M, average, lod);\r
  }\r
\r
  if (uTwinkle > 0.0) {\r
    float rate = 1.5 + 3.0 * fract(h * 7.31);\r
    float wave = 0.5 + 0.5 * sin(uClock * rate + h * 37.0);\r
    M *= 1.0 - uTwinkle * 0.55 * wave * wave;\r
  }\r
\r
  float density = clamp(smoothFeed, 0.0, 1.0);\r
  float glow = 0.0;\r
  if (uGlow > 0.0) {\r
    float bloom = smoothstep(0.2, 1.0, density);\r
    glow = bloom * bloom * uGlow * (uLightMode > 0.5 ? 0.12 : 0.22) * depthFade;\r
  }\r
\r
  float fade = depthFade;\r
  if (uEdgeFade > 0.0) {\r
    vec2 norm = gl_FragCoord.xy / uResolution;\r
    vec2 edgeA = clamp(norm / uEdgeFade, 0.0, 1.0);\r
    vec2 edgeB = clamp((1.0 - norm) / uEdgeFade, 0.0, 1.0);\r
    vec2 sa = edgeA * edgeA * edgeA * (edgeA * (edgeA * 6.0 - 15.0) + 10.0);\r
    vec2 sb = edgeB * edgeB * edgeB * (edgeB * (edgeB * 6.0 - 15.0) + 10.0);\r
    fade *= sa.x * sa.y * sb.x * sb.y;\r
  }\r
  M = clamp(M, 0.0, 1.0) * fade;\r
  glow *= fade;\r
\r
  float hot = clamp(heat, 0.0, 1.0);\r
  float tone = smoothstep(0.3, 1.0, density) * 0.85;\r
  vec3 color = mix(uColor, uAccent, max(tone, hot));\r
  vec3 lit = uLightMode > 0.5 ? color * (1.0 - 0.35 * hot) : mix(color, vec3(1.0), 0.45 * hot);\r
  if (uNoise > 0.0) {\r
    float n = hash(floor(gl_FragCoord.xy) + floor(uTime * 60.0));\r
    lit = clamp(lit + (n - 0.5) * uNoise, 0.0, 1.0);\r
  }\r
\r
  vec3 haze = uLightMode > 0.5 ? mix(color, vec3(1.0), 0.35) : color;\r
  float alpha = M + glow * (1.0 - M);\r
  vec3 premul = lit * M + haze * glow * (1.0 - M);\r
  if (uTransparent < 0.5) {\r
    vec3 paper = vec3(uLightMode > 0.5 ? 1.0 : 0.0);\r
    fragColor = vec4(premul + paper * (1.0 - alpha), 1.0);\r
    return;\r
  }\r
  fragColor = vec4(premul, alpha);\r
}\`;\r
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
const colorCache = new Map<string, number[]>();\r
\r
const hexToRgb = (hex: string): number[] => {\r
  const key = String(hex);\r
  const cached = colorCache.get(key);\r
  if (cached) return cached;\r
  const rgb = parseHex(hex);\r
  if (colorCache.size > 64) colorCache.clear();\r
  colorCache.set(key, rgb);\r
  return rgb;\r
};\r
\r
const parseHex = (hex: string): number[] => {\r
  let h = String(hex || '#ffffff')\r
    .replace('#', '')\r
    .trim();\r
  if (h.length === 3 || h.length === 4)\r
    h = h\r
      .slice(0, 3)\r
      .split('')\r
      .map(c => c + c)\r
      .join('');\r
  const num = parseInt(h.slice(0, 6), 16);\r
  if (Number.isNaN(num)) return [1, 1, 1];\r
  return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];\r
};\r
\r
const randomFloat = () => {\r
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {\r
    const u32 = new Uint32Array(1);\r
    window.crypto.getRandomValues(u32);\r
    return u32[0] / 0xffffffff;\r
  }\r
  return Math.random();\r
};\r
\r
const invert3 = (m: number[]): number[] => {\r
  const [a, b, c, d, e, f, g, h, i] = m;\r
  const A = e * i - f * h;\r
  const B = -(d * i - f * g);\r
  const C = d * h - e * g;\r
  const det = a * A + b * B + c * C || 1;\r
  return [\r
    A / det,\r
    -(b * i - c * h) / det,\r
    (b * f - c * e) / det,\r
    B / det,\r
    (a * i - c * g) / det,\r
    -(a * f - c * d) / det,\r
    C / det,\r
    -(a * h - b * g) / det,\r
    (a * e - b * d) / det\r
  ];\r
};\r
\r
const multiply3 = (x: number[], y: number[]): number[] => {\r
  const out: number[] = new Array(9);\r
  for (let r = 0; r < 3; r++) {\r
    for (let c = 0; c < 3; c++) {\r
      out[r * 3 + c] = x[r * 3] * y[c] + x[r * 3 + 1] * y[3 + c] + x[r * 3 + 2] * y[6 + c];\r
    }\r
  }\r
  return out;\r
};\r
\r
const planeFor = (tiltX: number, tiltY: number, width: number, height: number) => {\r
  const ax = (tiltX * Math.PI) / 180;\r
  const ay = (tiltY * Math.PI) / 180;\r
  const depth = Math.max(width, height) * 1.25;\r
  const cx = width / 2;\r
  const cy = height / 2;\r
  const tilt = [\r
    Math.cos(ay),\r
    0,\r
    0,\r
    Math.sin(ax) * Math.sin(ay),\r
    Math.cos(ax),\r
    0,\r
    (Math.sin(ay) * Math.cos(ax)) / depth,\r
    -Math.sin(ax) / depth,\r
    1\r
  ];\r
  const forward = multiply3(multiply3([1, 0, cx, 0, 1, cy, 0, 0, 1], tilt), [1, 0, -cx, 0, 1, -cy, 0, 0, 1]);\r
  return invert3(forward);\r
};\r
\r
const PixelBlast = ({\r
  variant = 'square',\r
  pixelSize = 3,\r
  color = '#B497CF',\r
  accentColor,\r
  className,\r
  style,\r
  patternScale = 2,\r
  patternDensity = 1,\r
  pixelSizeJitter = 0,\r
  enableRipples = true,\r
  rippleIntensityScale = 1,\r
  rippleThickness = 0.1,\r
  rippleSpeed = 0.3,\r
  autoPauseOffscreen = true,\r
  speed = 0.5,\r
  transparent = true,\r
  edgeFade = 0.5,\r
  noiseAmount = 0,\r
  softness = 0.6,\r
  smoothing = 1,\r
  glow = 0.4,\r
  twinkle = 0.25,\r
  drift = 0.2,\r
  driftAngle = 30,\r
  hoverEffect = 'reveal',\r
  hoverRadius = 140,\r
  autoRipple = 0,\r
  tiltX = 0,\r
  tiltY = 0,\r
  intro = true,\r
  variation,\r
  lightMode = false,\r
  dpr\r
}: PixelBlastProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings: Settings = {\r
    variant: SHAPES[variant] ?? 0,\r
    pixelSize: Math.max(0.5, pixelSize),\r
    color,\r
    accentColor: accentColor || color,\r
    patternScale,\r
    patternDensity,\r
    pixelSizeJitter,\r
    enableRipples,\r
    rippleIntensityScale,\r
    rippleThickness: Math.max(0.001, rippleThickness),\r
    rippleSpeed,\r
    autoPauseOffscreen,\r
    speed,\r
    transparent,\r
    edgeFade: clamp(edgeFade, 0, 1),\r
    noiseAmount,\r
    softness: clamp(softness, 0, 1),\r
    smoothing: clamp(smoothing, 0, 1),\r
    glow: clamp(glow, 0, 2),\r
    twinkle: clamp(twinkle, 0, 1),\r
    drift,\r
    driftAngle,\r
    hoverEffect: HOVERS[hoverEffect] ?? 0,\r
    hoverRadius: Math.max(10, hoverRadius),\r
    autoRipple: Math.max(0, autoRipple),\r
    tiltX: clamp(tiltX, -70, 70),\r
    tiltY: clamp(tiltY, -70, 70),\r
    intro,\r
    variation,\r
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
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
    const cellShader = link(gl, CELL_FRAGMENT);\r
    const mainShader = link(gl, MAIN_FRAGMENT);\r
    if (!cellShader || !mainShader) return undefined;\r
    const cu = cellShader.uniforms;\r
    const mu = mainShader.uniforms;\r
    const vao = gl.createVertexArray();\r
\r
    const makeTexture = (filter: number) => {\r
      const texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
      return texture;\r
    };\r
    const targets = [0, 1].map(() => {\r
      const texture = makeTexture(gl.LINEAR);\r
      const framebuffer = gl.createFramebuffer();\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
      return { texture, framebuffer };\r
    });\r
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view: { width: number; height: number; ratio: number; plane: number[] | null; tiltKey: string } = {\r
      width: 1,\r
      height: 1,\r
      ratio: 1,\r
      plane: null,\r
      tiltKey: ''\r
    };\r
    const cells = { x: 0, y: 0, w: 1, h: 1, key: '' };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const mouse = { x: 0, y: 0, ready: false };\r
    const clickPos = new Float32Array(MAX_CLICKS * 2).fill(-1);\r
    const clickAt = new Float32Array(MAX_CLICKS);\r
    const clickAge = new Float32Array(MAX_CLICKS);\r
    let clickIndex = 0;\r
    let current = 0;\r
    let fresh = true;\r
    const seedOffset = settingsRef.current.variation;\r
    const timeOffset = typeof seedOffset === 'number' ? seedOffset * 37 : randomFloat() * 1000;\r
    let elapsed = 0;\r
    let clock = 0;\r
    let presence = 0;\r
    let driftX = 0;\r
    let driftY = 0;\r
    let introClock = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let nextAuto = 1.2;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let quiet = 0;\r
\r
    const patternTime = (s: Settings) => timeOffset + elapsed * s.speed;\r
\r
    const layoutCells = (s: Settings) => {\r
      const ps = s.pixelSize * view.ratio;\r
      const cps = 8 * ps;\r
      const w = canvas.width;\r
      const h = canvas.height;\r
      let minX = -w / 2;\r
      let maxX = w / 2;\r
      let minY = -h / 2;\r
      let maxY = h / 2;\r
      if (view.plane) {\r
        const corners = [\r
          [0, 0],\r
          [w, 0],\r
          [0, h],\r
          [w, h],\r
          [w / 2, 0],\r
          [w / 2, h],\r
          [0, h / 2],\r
          [w, h / 2]\r
        ];\r
        minX = Infinity;\r
        maxX = -Infinity;\r
        minY = Infinity;\r
        maxY = -Infinity;\r
        for (const [x, y] of corners) {\r
          const [qx, qy] = toPlane(x, y);\r
          if (qx < -1e5) continue;\r
          minX = Math.min(minX, qx - w / 2);\r
          maxX = Math.max(maxX, qx - w / 2);\r
          minY = Math.min(minY, qy - h / 2);\r
          maxY = Math.max(maxY, qy - h / 2);\r
        }\r
        if (!Number.isFinite(minX)) {\r
          minX = -w / 2;\r
          maxX = w / 2;\r
          minY = -h / 2;\r
          maxY = h / 2;\r
        }\r
      }\r
      const pad = cps;\r
      const x0 = Math.floor((minX - pad) / cps);\r
      const x1 = Math.floor((maxX + pad) / cps);\r
      const y0 = Math.floor((minY - pad) / cps);\r
      const y1 = Math.floor((maxY + pad) / cps);\r
      const width = Math.max(1, Math.min(2048, x1 - x0 + 1));\r
      const height = Math.max(1, Math.min(2048, y1 - y0 + 1));\r
      const key = \`\${x0}:\${y0}:\${width}:\${height}\`;\r
      if (key === cells.key) return;\r
      cells.key = key;\r
      cells.x = x0;\r
      cells.y = y0;\r
      cells.w = width;\r
      cells.h = height;\r
      for (const target of targets) {\r
        gl.bindTexture(gl.TEXTURE_2D, target.texture);\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
      }\r
      fresh = true;\r
    };\r
\r
    const planeClicks = new Float32Array(MAX_CLICKS * 2);\r
\r
    const stepCells = (s: Settings, decay: number) => {\r
      for (let k = 0; k < MAX_CLICKS; k++) {\r
        if (clickPos[k * 2] < 0) {\r
          planeClicks[k * 2] = -1;\r
          planeClicks[k * 2 + 1] = -1;\r
          continue;\r
        }\r
        const [px, py] = toPlane(clickPos[k * 2], clickPos[k * 2 + 1]);\r
        planeClicks[k * 2] = Math.max(px, 0);\r
        planeClicks[k * 2 + 1] = py;\r
      }\r
      const [mx, my] = toPlane(mouse.x, mouse.y);\r
      const source = targets[current];\r
      const target = targets[1 - current];\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);\r
      gl.viewport(0, 0, cells.w, cells.h);\r
      gl.disable(gl.BLEND);\r
      gl.useProgram(cellShader.program);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, source.texture);\r
      gl.uniform1i(cu.uPrev, 0);\r
      gl.uniform2f(cu.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(cu.uTime, patternTime(s));\r
      gl.uniform1f(cu.uPixelSize, s.pixelSize * view.ratio);\r
      gl.uniform1f(cu.uScale, s.patternScale);\r
      gl.uniform1f(cu.uDensity, s.patternDensity);\r
      gl.uniform1i(cu.uEnableRipples, s.enableRipples ? 1 : 0);\r
      gl.uniform1f(cu.uRippleSpeed, s.rippleSpeed);\r
      gl.uniform1f(cu.uRippleThickness, s.rippleThickness);\r
      gl.uniform1f(cu.uRippleIntensity, s.rippleIntensityScale);\r
      gl.uniform2fv(cu.uClickPos, planeClicks);\r
      gl.uniform1fv(cu.uClickAge, clickAge);\r
      gl.uniform2i(cu.uOrigin, cells.x, cells.y);\r
      gl.uniform2f(cu.uDrift, driftX, driftY);\r
      gl.uniform1i(cu.uHover, s.hoverEffect);\r
      gl.uniform2f(cu.uMouse, mx, my);\r
      gl.uniform1f(cu.uMouseRadius, s.hoverRadius * view.ratio);\r
      gl.uniform1f(cu.uMousePresence, presence);\r
      gl.uniform1f(cu.uIntro, introClock);\r
      gl.uniform1f(cu.uDecay, decay);\r
      gl.uniform1f(cu.uFresh, fresh ? 1 : 0);\r
      gl.bindVertexArray(vao);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      current = 1 - current;\r
      fresh = false;\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.useProgram(mainShader.program);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, targets[current].texture);\r
      gl.uniform1i(mu.uCells, 0);\r
      gl.uniform3fv(mu.uColor, hexToRgb(s.color));\r
      gl.uniform3fv(mu.uAccent, hexToRgb(s.accentColor));\r
      gl.uniform2f(mu.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(mu.uTime, patternTime(s));\r
      gl.uniform1f(mu.uClock, clock);\r
      gl.uniform1f(mu.uPixelSize, s.pixelSize * view.ratio);\r
      gl.uniform1f(mu.uPixelJitter, s.pixelSizeJitter);\r
      gl.uniform1f(mu.uEdgeFade, s.edgeFade);\r
      gl.uniform1i(mu.uShapeType, s.variant);\r
      gl.uniform2i(mu.uOrigin, cells.x, cells.y);\r
      gl.uniform2i(mu.uCellCount, cells.w, cells.h);\r
      gl.uniform1f(mu.uSoftness, s.softness);\r
      gl.uniform1f(mu.uSmoothing, s.smoothing);\r
      gl.uniform1f(mu.uGlow, s.glow);\r
      gl.uniform1f(mu.uTwinkle, reduce ? 0 : s.twinkle);\r
      gl.uniform1f(mu.uLightMode, s.lightMode ? 1 : 0);\r
      gl.uniform1f(mu.uTransparent, s.transparent ? 1 : 0);\r
      gl.uniform1f(mu.uNoise, s.noiseAmount);\r
      gl.uniform1i(mu.uHover, s.hoverEffect);\r
      gl.uniform1f(mu.uTilted, view.plane ? 1 : 0);\r
      if (view.plane) {\r
        const m = view.plane;\r
        gl.uniformMatrix3fv(mu.uPlane, false, [m[0], m[3], m[6], m[1], m[4], m[7], m[2], m[5], m[8]]);\r
      }\r
      gl.bindVertexArray(vao);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const toPlane = (x: number, y: number): number[] => {\r
      const m = view.plane;\r
      if (!m) return [x, y];\r
      const h = canvas.height;\r
      const cy = h - y;\r
      const z = m[6] * x + m[7] * cy + m[8];\r
      if (z <= 1e-4) return [-1e6, -1e6];\r
      return [(m[0] * x + m[1] * cy + m[2]) / z, h - (m[3] * x + m[4] * cy + m[5]) / z];\r
    };\r
\r
    const updatePlane = (s: Settings) => {\r
      view.plane = s.tiltX || s.tiltY ? planeFor(s.tiltX, s.tiltY, canvas.width, canvas.height) : null;\r
      view.tiltKey = \`\${s.tiltX}:\${s.tiltY}:\${canvas.width}:\${canvas.height}\`;\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      view.width = Math.max(1, container.clientWidth);\r
      view.height = Math.max(1, container.clientHeight);\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(view.width * view.ratio));\r
      canvas.height = Math.max(1, Math.round(view.height * view.ratio));\r
      if (!mouse.ready) {\r
        mouse.ready = true;\r
        mouse.x = canvas.width / 2;\r
        mouse.y = canvas.height / 2;\r
      }\r
      updatePlane(s);\r
      layoutCells(s);\r
      stepCells(s, 0);\r
      draw();\r
      wake();\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      const s = settingsRef.current;\r
      if (!visible && s.autoPauseOffscreen) return;\r
      if (document.hidden) return;\r
      const dt = last ? clamp((now - last) / 1000, 0, 1 / 20) : 0;\r
      last = now;\r
      if (!reduce) elapsed += dt;\r
      clock += dt;\r
      if (!reduce && s.drift) {\r
        const angle = (s.driftAngle * Math.PI) / 180;\r
        driftX += Math.cos(angle) * s.drift * dt * 0.05;\r
        driftY += Math.sin(angle) * s.drift * dt * 0.05;\r
      }\r
      if (!reduce && s.enableRipples && s.autoRipple > 0 && introClock >= 1) {\r
        nextAuto -= dt;\r
        if (nextAuto <= 0) {\r
          nextAuto = s.autoRipple * (0.7 + Math.random() * 0.6);\r
          addRipple((0.15 + Math.random() * 0.7) * view.width, (0.15 + Math.random() * 0.7) * view.height);\r
        }\r
      }\r
      for (let k = 0; k < MAX_CLICKS; k++) clickAge[k] = (clock - clickAt[k]) * 0.5;\r
      const targetX = pointer.x * view.ratio;\r
      const targetY = (view.height - pointer.y) * view.ratio;\r
      const follow = 1 - Math.exp(-dt / 0.08);\r
      if (pointer.inside) {\r
        mouse.x += (targetX - mouse.x) * follow;\r
        mouse.y += (targetY - mouse.y) * follow;\r
      }\r
      presence += ((pointer.inside ? 1 : 0) - presence) * (1 - Math.exp(-dt / 0.25));\r
      const key = \`\${s.tiltX}:\${s.tiltY}:\${canvas.width}:\${canvas.height}\`;\r
      if (key !== view.tiltKey) updatePlane(s);\r
      layoutCells(s);\r
      const decay = s.hoverEffect ? Math.exp(-dt / 0.45) : 0;\r
      stepCells(s, decay);\r
      draw();\r
      if (introClock < 1) introClock = Math.min(1, introClock + dt / INTRO_SECONDS);\r
      let busy = !reduce && (s.speed !== 0 || s.drift !== 0 || s.twinkle > 0 || (s.autoRipple > 0 && s.enableRipples));\r
      busy = busy || introClock < 1 || presence > 0.001;\r
      for (let k = 0; k < MAX_CLICKS; k++) busy = busy || (clickPos[k * 2] >= 0 && clickAge[k] < 8);\r
      quiet = busy ? 0 : quiet + dt;\r
      if (quiet < 1.5) raf = requestAnimationFrame(frame);\r
    };\r
\r
    function wake() {\r
      quiet = 0;\r
      if (!raf && (visible || !settingsRef.current.autoPauseOffscreen) && !document.hidden) {\r
        last = 0;\r
        raf = requestAnimationFrame(frame);\r
      }\r
    }\r
\r
    const locate = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const { x, y, inside } = locate(event);\r
      const was = pointer.inside;\r
      pointer.inside = inside;\r
      if (inside) {\r
        pointer.x = x;\r
        pointer.y = y;\r
        if (!was) {\r
          mouse.x = x * view.ratio;\r
          mouse.y = (view.height - y) * view.ratio;\r
        }\r
      }\r
      if (inside || was) wake();\r
    };\r
\r
    function addRipple(x: number, y: number) {\r
      clickPos[clickIndex * 2] = x * view.ratio;\r
      clickPos[clickIndex * 2 + 1] = (view.height - y) * view.ratio;\r
      clickAt[clickIndex] = clock;\r
      clickIndex = (clickIndex + 1) % MAX_CLICKS;\r
      wake();\r
    }\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      const { x, y, inside } = locate(event);\r
      if (!inside || reduce || !s.enableRipples) return;\r
      addRipple(x, y);\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
    const onVisibility = () => wake();\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(container);\r
    const intersection = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible) wake();\r
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
      for (const target of targets) {\r
        gl.deleteTexture(target.texture);\r
        gl.deleteFramebuffer(target.framebuffer);\r
      }\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(cellShader.program);\r
      gl.deleteProgram(mainShader.program);\r
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
      className={\`pixel-blast-container\${className ? \` \${className}\` : ''}\`}\r
      style={style}\r
      aria-label="PixelBlast interactive background"\r
    >\r
      <canvas ref={canvasRef} className="pixel-blast-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default PixelBlast;\r
`,o=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties } from 'react';\r
\r
export type PixelBlastVariant = 'square' | 'circle' | 'triangle' | 'diamond' | 'cross' | 'ring';\r
export type PixelBlastHoverEffect = 'reveal' | 'grow' | 'none';\r
\r
export interface PixelBlastProps {\r
  variant?: PixelBlastVariant;\r
  pixelSize?: number;\r
  color?: string;\r
  accentColor?: string;\r
  className?: string;\r
  style?: CSSProperties;\r
  patternScale?: number;\r
  patternDensity?: number;\r
  pixelSizeJitter?: number;\r
  enableRipples?: boolean;\r
  rippleIntensityScale?: number;\r
  rippleThickness?: number;\r
  rippleSpeed?: number;\r
  autoPauseOffscreen?: boolean;\r
  speed?: number;\r
  transparent?: boolean;\r
  edgeFade?: number;\r
  noiseAmount?: number;\r
  softness?: number;\r
  smoothing?: number;\r
  glow?: number;\r
  twinkle?: number;\r
  drift?: number;\r
  driftAngle?: number;\r
  hoverEffect?: PixelBlastHoverEffect;\r
  hoverRadius?: number;\r
  autoRipple?: number;\r
  tiltX?: number;\r
  tiltY?: number;\r
  intro?: boolean;\r
  variation?: number;\r
  lightMode?: boolean;\r
  dpr?: number;\r
}\r
\r
type Settings = {\r
  variant: number;\r
  pixelSize: number;\r
  color: string;\r
  accentColor: string;\r
  patternScale: number;\r
  patternDensity: number;\r
  pixelSizeJitter: number;\r
  enableRipples: boolean;\r
  rippleIntensityScale: number;\r
  rippleThickness: number;\r
  rippleSpeed: number;\r
  autoPauseOffscreen: boolean;\r
  speed: number;\r
  transparent: boolean;\r
  edgeFade: number;\r
  noiseAmount: number;\r
  softness: number;\r
  smoothing: number;\r
  glow: number;\r
  twinkle: number;\r
  drift: number;\r
  driftAngle: number;\r
  hoverEffect: number;\r
  hoverRadius: number;\r
  autoRipple: number;\r
  tiltX: number;\r
  tiltY: number;\r
  intro: boolean;\r
  variation?: number;\r
  lightMode: boolean;\r
  dpr?: number;\r
};\r
\r
type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };\r
\r
const MAX_CLICKS = 10;\r
const INTRO_SECONDS = 1.8;\r
const SHAPES: Record<string, number> = { square: 0, circle: 1, triangle: 2, diamond: 3, cross: 4, ring: 5 };\r
const HOVERS: Record<string, number> = { none: 0, grow: 1, reveal: 2 };\r
const bayer2 = (x: number, y: number): number => (Math.floor(x) / 2 + Math.floor(y) * Math.floor(y) * 0.75) % 1;\r
const bayer8 = (x: number, y: number): number =>\r
  (bayer2(x / 4, y / 4) * 0.25 + bayer2(x / 2, y / 2)) * 0.25 + bayer2(x, y);\r
const BAYER_TABLE = Array.from({ length: 64 }, (_, i) => bayer8(i % 8, Math.floor(i / 8)).toFixed(6)).join(', ');\r
const RANGE_MIN = -6;\r
const RANGE_MAX = 10;\r
\r
const VERTEX = \`#version 300 es\r
void main() {\r
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\r
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const PACKING = \`\r
const float RANGE_MIN = \${RANGE_MIN.toFixed(1)};\r
const float RANGE_MAX = \${RANGE_MAX.toFixed(1)};\r
\r
vec2 pack16(float value) {\r
  float x = floor(clamp((value - RANGE_MIN) / (RANGE_MAX - RANGE_MIN), 0.0, 1.0) * 65535.0 + 0.5);\r
  float hi = floor(x / 256.0);\r
  return vec2(hi, x - hi * 256.0) / 255.0;\r
}\r
\r
float unpack16(vec2 c) {\r
  float x = floor(c.x * 255.0 + 0.5) * 256.0 + floor(c.y * 255.0 + 0.5);\r
  return RANGE_MIN + x / 65535.0 * (RANGE_MAX - RANGE_MIN);\r
}\r
\`;\r
\r
const CELL_FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
\r
uniform vec2 uResolution;\r
uniform float uTime;\r
uniform float uPixelSize;\r
uniform float uScale;\r
uniform float uDensity;\r
uniform int uEnableRipples;\r
uniform float uRippleSpeed;\r
uniform float uRippleThickness;\r
uniform float uRippleIntensity;\r
uniform vec2 uClickPos[\${MAX_CLICKS}];\r
uniform float uClickAge[\${MAX_CLICKS}];\r
uniform ivec2 uOrigin;\r
uniform vec2 uDrift;\r
uniform int uHover;\r
uniform vec2 uMouse;\r
uniform float uMouseRadius;\r
uniform float uMousePresence;\r
uniform float uIntro;\r
uniform sampler2D uPrev;\r
uniform float uDecay;\r
uniform float uFresh;\r
\r
out vec4 outCell;\r
\${PACKING}\r
float hash11(float n) { return fract(sin(n) * 43758.5453); }\r
\r
float vnoise(vec3 p) {\r
  vec3 ip = floor(p);\r
  vec3 fp = fract(p);\r
  float n000 = hash11(dot(ip + vec3(0.0, 0.0, 0.0), vec3(1.0, 57.0, 113.0)));\r
  float n100 = hash11(dot(ip + vec3(1.0, 0.0, 0.0), vec3(1.0, 57.0, 113.0)));\r
  float n010 = hash11(dot(ip + vec3(0.0, 1.0, 0.0), vec3(1.0, 57.0, 113.0)));\r
  float n110 = hash11(dot(ip + vec3(1.0, 1.0, 0.0), vec3(1.0, 57.0, 113.0)));\r
  float n001 = hash11(dot(ip + vec3(0.0, 0.0, 1.0), vec3(1.0, 57.0, 113.0)));\r
  float n101 = hash11(dot(ip + vec3(1.0, 0.0, 1.0), vec3(1.0, 57.0, 113.0)));\r
  float n011 = hash11(dot(ip + vec3(0.0, 1.0, 1.0), vec3(1.0, 57.0, 113.0)));\r
  float n111 = hash11(dot(ip + vec3(1.0, 1.0, 1.0), vec3(1.0, 57.0, 113.0)));\r
  vec3 w = fp * fp * fp * (fp * (fp * 6.0 - 15.0) + 10.0);\r
  float x00 = mix(n000, n100, w.x);\r
  float x10 = mix(n010, n110, w.x);\r
  float x01 = mix(n001, n101, w.x);\r
  float x11 = mix(n011, n111, w.x);\r
  float y0 = mix(x00, x10, w.y);\r
  float y1 = mix(x01, x11, w.y);\r
  return mix(y0, y1, w.z) * 2.0 - 1.0;\r
}\r
\r
float fbm2(vec2 uv, float t) {\r
  vec3 p = vec3(uv * uScale, t);\r
  float amp = 1.0;\r
  float freq = 1.0;\r
  float sum = 1.0;\r
  for (int i = 0; i < 5; ++i) {\r
    sum += amp * vnoise(p * freq);\r
    freq *= 1.25;\r
    amp *= 1.0;\r
  }\r
  return sum * 0.5 + 0.5;\r
}\r
\r
void main() {\r
  ivec2 texel = ivec2(gl_FragCoord.xy);\r
  float aspectRatio = uResolution.x / uResolution.y;\r
  float cellPixelSize = 8.0 * uPixelSize;\r
  vec2 cellId = vec2(texel + uOrigin);\r
  vec2 cellCoord = cellId * cellPixelSize;\r
  vec2 uv = cellCoord / uResolution * vec2(aspectRatio, 1.0);\r
\r
  float base = fbm2(uv + uDrift, uTime * 0.05);\r
  base = base * 0.5 - 0.65;\r
  float feed = base + (uDensity - 0.5) * 0.3;\r
  if (uEnableRipples == 1) {\r
    for (int i = 0; i < \${MAX_CLICKS}; ++i) {\r
      vec2 pos = uClickPos[i];\r
      if (pos.x < 0.0) continue;\r
      vec2 cuv = (((pos - uResolution * 0.5 - cellPixelSize * 0.5) / uResolution)) * vec2(aspectRatio, 1.0);\r
      float t = max(uClickAge[i], 0.0);\r
      float r = distance(uv, cuv);\r
      float waveR = uRippleSpeed * t;\r
      float ring = exp(-pow((r - waveR) / uRippleThickness, 2.0));\r
      float atten = exp(-1.0 * t) * exp(-10.0 * r);\r
      feed = max(feed, ring * atten * uRippleIntensity);\r
    }\r
  }\r
\r
  if (uIntro < 1.0) {\r
    vec2 center = (-cellPixelSize * 0.5 / uResolution) * vec2(aspectRatio, 1.0);\r
    float reach = length(vec2(aspectRatio, 1.0)) * 0.5 + 0.2;\r
    float eased = 1.0 - pow(1.0 - uIntro, 2.4);\r
    float front = eased * reach;\r
    float r = distance(uv, center);\r
    float shown = smoothstep(front + 0.04, front - 0.06, r);\r
    float ring = exp(-pow((r - front) / 0.07, 2.0)) * (1.0 - uIntro);\r
    feed = mix(-1.0, feed, shown);\r
    feed = max(feed, ring * 1.4);\r
  }\r
\r
  float brush = 0.0;\r
  if (uHover > 0) {\r
    vec2 d = (cellCoord + cellPixelSize * 0.5 + uResolution * 0.5 - uMouse) / max(uMouseRadius, 1.0);\r
    brush = exp(-dot(d, d)) * uMousePresence;\r
  }\r
  vec4 prev = texelFetch(uPrev, texel, 0) * (1.0 - uFresh);\r
  float trail = max(brush, max(prev.a * uDecay - 1.0 / 255.0, 0.0));\r
  if (uHover == 2) feed += trail * 0.9;\r
\r
  outCell = vec4(pack16(feed), clamp((feed + 0.5) * 0.5, 0.0, 1.0), trail);\r
}\`;\r
\r
const MAIN_FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
\r
uniform vec3 uColor;\r
uniform vec3 uAccent;\r
uniform vec2 uResolution;\r
uniform float uTime;\r
uniform float uClock;\r
uniform float uPixelSize;\r
uniform float uPixelJitter;\r
uniform float uEdgeFade;\r
uniform int uShapeType;\r
uniform sampler2D uCells;\r
uniform ivec2 uOrigin;\r
uniform ivec2 uCellCount;\r
uniform float uSoftness;\r
uniform float uSmoothing;\r
uniform float uGlow;\r
uniform float uTwinkle;\r
uniform float uLightMode;\r
uniform float uTransparent;\r
uniform float uNoise;\r
uniform int uHover;\r
uniform mat3 uPlane;\r
uniform float uTilted;\r
\r
out vec4 fragColor;\r
\${PACKING}\r
const float BAYER[64] = float[64](\${BAYER_TABLE});\r
\r
vec2 gDx;\r
vec2 gDy;\r
\r
float aaFrom(vec2 grad) {\r
  return abs(dot(grad, gDx)) + abs(dot(grad, gDy));\r
}\r
\r
float maskSquare(vec2 p, float cov, float soft) {\r
  if (soft <= 0.0) return cov;\r
  float side = 0.5 * sqrt(clamp(cov, 0.0, 1.0));\r
  vec2 c = p - 0.5;\r
  vec2 q = abs(c) - side;\r
  float d = max(q.x, q.y);\r
  vec2 grad = q.x > q.y ? vec2(sign(c.x), 0.0) : vec2(0.0, sign(c.y));\r
  float aa = max(aaFrom(grad), 1e-4);\r
  return 1.0 - smoothstep(-aa * 0.5, aa * 0.5, d);\r
}\r
\r
float maskCircle(vec2 p, float cov) {\r
  float r = sqrt(cov) * 0.25;\r
  vec2 c = p - 0.5;\r
  float len = length(c);\r
  float d = len - r;\r
  float aa = 0.5 * aaFrom(c / max(len, 1e-5));\r
  return cov * (1.0 - smoothstep(-aa, aa, d * 2.0));\r
}\r
\r
float maskTriangle(vec2 p, vec2 id, float cov) {\r
  bool flip = mod(id.x + id.y, 2.0) > 0.5;\r
  if (flip) p.x = 1.0 - p.x;\r
  float r = sqrt(cov);\r
  float d = p.y - r * (1.0 - p.x);\r
  float aa = max(aaFrom(vec2(flip ? -r : r, 1.0)), 1e-4);\r
  return cov * clamp(0.5 - d / aa, 0.0, 1.0);\r
}\r
\r
float maskDiamond(vec2 p, float cov) {\r
  float r = sqrt(cov) * 0.564;\r
  return step(abs(p.x - 0.49) + abs(p.y - 0.49), r);\r
}\r
\r
float maskCross(vec2 p, float cov) {\r
  float s = sqrt(clamp(cov, 0.0, 1.0));\r
  vec2 c = p - 0.5;\r
  vec2 q = abs(c);\r
  float arm = 0.42 * s;\r
  float bar = 0.13 * s + 0.02;\r
  float a1 = max(q.x - arm, q.y - bar);\r
  float a2 = max(q.x - bar, q.y - arm);\r
  float d = min(a1, a2);\r
  bool horizontal = a1 < a2 ? q.x - arm > q.y - bar : q.x - bar > q.y - arm;\r
  vec2 grad = horizontal ? vec2(sign(c.x), 0.0) : vec2(0.0, sign(c.y));\r
  float aa = max(aaFrom(grad), 1e-4);\r
  return 1.0 - smoothstep(-aa * 0.5, aa * 0.5, d);\r
}\r
\r
float maskRing(vec2 p, float cov) {\r
  float s = sqrt(clamp(cov, 0.0, 1.0));\r
  vec2 c = p - 0.5;\r
  float len = length(c);\r
  float d = abs(len - 0.3 * s) - 0.09 * s;\r
  vec2 grad = sign(len - 0.3 * s) * c / max(len, 1e-5);\r
  float aa = max(aaFrom(grad), 1e-4);\r
  return 1.0 - smoothstep(-aa * 0.5, aa * 0.5, d);\r
}\r
\r
float hash(vec2 p) {\r
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);\r
}\r
\r
void main() {\r
  float pixelSize = uPixelSize;\r
  vec2 screen = gl_FragCoord.xy;\r
  vec4 empty = uTransparent < 0.5 ? vec4(vec3(uLightMode > 0.5 ? 1.0 : 0.0), 1.0) : vec4(0.0);\r
\r
  float lod = 0.0;\r
  float depthFade = 1.0;\r
  if (uTilted > 0.5) {\r
    vec3 plane = uPlane * vec3(screen.x, uResolution.y - screen.y, 1.0);\r
    screen = vec2(plane.x, uResolution.y * plane.z - plane.y) / max(plane.z, 1e-4);\r
    float footprint = length(fwidth(screen));\r
    lod = smoothstep(0.3, 0.85, footprint / pixelSize);\r
    depthFade = (1.0 - smoothstep(0.45, 1.0, footprint / (8.0 * pixelSize))) * step(0.0, plane.z);\r
  }\r
\r
  vec2 fragCoord = screen - uResolution * 0.5;\r
  gDx = dFdx(fragCoord) / pixelSize;\r
  gDy = dFdy(fragCoord) / pixelSize;\r
  if (depthFade <= 0.0) {\r
    fragColor = empty;\r
    return;\r
  }\r
\r
  float cellPixelSize = 8.0 * pixelSize;\r
  vec2 cellId = floor(fragCoord / cellPixelSize);\r
  ivec2 texel = clamp(ivec2(cellId) - uOrigin, ivec2(0), uCellCount - 1);\r
  vec2 smoothAt = (fragCoord / cellPixelSize - vec2(uOrigin)) / vec2(uCellCount);\r
  vec4 blended = texture(uCells, smoothAt);\r
  float smoothFeed = blended.b * 2.0 - 0.5;\r
  float feed = smoothFeed;\r
  float trail = uHover == 1 ? blended.a : 0.0;\r
  if (uSmoothing < 1.0) {\r
    vec4 cell = texelFetch(uCells, texel, 0);\r
    feed = mix(unpack16(cell.rg), smoothFeed, uSmoothing);\r
    if (uHover == 1) trail = mix(cell.a, blended.a, uSmoothing);\r
  }\r
\r
  if (feed < -0.12 * uSoftness && smoothFeed < 0.2 && (lod <= 0.0 || smoothFeed <= 0.0)) {\r
    fragColor = empty;\r
    return;\r
  }\r
\r
  vec2 pixelId = floor(fragCoord / pixelSize);\r
  vec2 pixelUV = fragCoord / pixelSize - pixelId;\r
  ivec2 cellBits = ivec2(mod(pixelId, 8.0));\r
  float bayer = BAYER[cellBits.y * 8 + cellBits.x] - 0.5;\r
  float margin = feed + bayer - 0.5;\r
  float bw = uSoftness > 0.0 ? smoothstep(-0.12 * uSoftness, 0.12 * uSoftness, margin) : step(0.0, margin);\r
\r
  float h = uPixelJitter > 0.0 || uTwinkle > 0.0 ? fract(sin(dot(pixelId, vec2(127.1, 311.7))) * 43758.5453) : 0.5;\r
  float jitterScale = 1.0 + (h - 0.5) * uPixelJitter;\r
  float heat = max(trail, clamp((feed - 1.0) * 2.5, 0.0, 1.0) * min(uGlow * 2.0, 1.0));\r
  float coverage = bw * jitterScale * (1.0 + heat * 0.35);\r
  float M;\r
  float area;\r
  if (uShapeType == 1) {\r
    M = maskCircle(pixelUV, coverage);\r
    area = 0.196;\r
  } else if (uShapeType == 2) {\r
    M = maskTriangle(pixelUV, pixelId, coverage);\r
    area = 0.5;\r
  } else if (uShapeType == 3) {\r
    M = maskDiamond(pixelUV, coverage);\r
    area = 0.62;\r
  } else if (uShapeType == 4) {\r
    M = maskCross(pixelUV, coverage);\r
    area = 0.41;\r
  } else if (uShapeType == 5) {\r
    M = maskRing(pixelUV, coverage);\r
    area = 0.41;\r
  } else {\r
    M = maskSquare(pixelUV, coverage, uSoftness);\r
    area = 1.0;\r
  }\r
  if (lod > 0.0) {\r
    float average = clamp(smoothFeed, 0.0, 1.0) * area * (1.0 + heat * 0.35);\r
    M = mix(M, average, lod);\r
  }\r
\r
  if (uTwinkle > 0.0) {\r
    float rate = 1.5 + 3.0 * fract(h * 7.31);\r
    float wave = 0.5 + 0.5 * sin(uClock * rate + h * 37.0);\r
    M *= 1.0 - uTwinkle * 0.55 * wave * wave;\r
  }\r
\r
  float density = clamp(smoothFeed, 0.0, 1.0);\r
  float glow = 0.0;\r
  if (uGlow > 0.0) {\r
    float bloom = smoothstep(0.2, 1.0, density);\r
    glow = bloom * bloom * uGlow * (uLightMode > 0.5 ? 0.12 : 0.22) * depthFade;\r
  }\r
\r
  float fade = depthFade;\r
  if (uEdgeFade > 0.0) {\r
    vec2 norm = gl_FragCoord.xy / uResolution;\r
    vec2 edgeA = clamp(norm / uEdgeFade, 0.0, 1.0);\r
    vec2 edgeB = clamp((1.0 - norm) / uEdgeFade, 0.0, 1.0);\r
    vec2 sa = edgeA * edgeA * edgeA * (edgeA * (edgeA * 6.0 - 15.0) + 10.0);\r
    vec2 sb = edgeB * edgeB * edgeB * (edgeB * (edgeB * 6.0 - 15.0) + 10.0);\r
    fade *= sa.x * sa.y * sb.x * sb.y;\r
  }\r
  M = clamp(M, 0.0, 1.0) * fade;\r
  glow *= fade;\r
\r
  float hot = clamp(heat, 0.0, 1.0);\r
  float tone = smoothstep(0.3, 1.0, density) * 0.85;\r
  vec3 color = mix(uColor, uAccent, max(tone, hot));\r
  vec3 lit = uLightMode > 0.5 ? color * (1.0 - 0.35 * hot) : mix(color, vec3(1.0), 0.45 * hot);\r
  if (uNoise > 0.0) {\r
    float n = hash(floor(gl_FragCoord.xy) + floor(uTime * 60.0));\r
    lit = clamp(lit + (n - 0.5) * uNoise, 0.0, 1.0);\r
  }\r
\r
  vec3 haze = uLightMode > 0.5 ? mix(color, vec3(1.0), 0.35) : color;\r
  float alpha = M + glow * (1.0 - M);\r
  vec3 premul = lit * M + haze * glow * (1.0 - M);\r
  if (uTransparent < 0.5) {\r
    vec3 paper = vec3(uLightMode > 0.5 ? 1.0 : 0.0);\r
    fragColor = vec4(premul + paper * (1.0 - alpha), 1.0);\r
    return;\r
  }\r
  fragColor = vec4(premul, alpha);\r
}\`;\r
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
const colorCache = new Map<string, number[]>();\r
\r
const hexToRgb = (hex: string): number[] => {\r
  const key = String(hex);\r
  const cached = colorCache.get(key);\r
  if (cached) return cached;\r
  const rgb = parseHex(hex);\r
  if (colorCache.size > 64) colorCache.clear();\r
  colorCache.set(key, rgb);\r
  return rgb;\r
};\r
\r
const parseHex = (hex: string): number[] => {\r
  let h = String(hex || '#ffffff')\r
    .replace('#', '')\r
    .trim();\r
  if (h.length === 3 || h.length === 4)\r
    h = h\r
      .slice(0, 3)\r
      .split('')\r
      .map(c => c + c)\r
      .join('');\r
  const num = parseInt(h.slice(0, 6), 16);\r
  if (Number.isNaN(num)) return [1, 1, 1];\r
  return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];\r
};\r
\r
const randomFloat = () => {\r
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {\r
    const u32 = new Uint32Array(1);\r
    window.crypto.getRandomValues(u32);\r
    return u32[0] / 0xffffffff;\r
  }\r
  return Math.random();\r
};\r
\r
const invert3 = (m: number[]): number[] => {\r
  const [a, b, c, d, e, f, g, h, i] = m;\r
  const A = e * i - f * h;\r
  const B = -(d * i - f * g);\r
  const C = d * h - e * g;\r
  const det = a * A + b * B + c * C || 1;\r
  return [\r
    A / det,\r
    -(b * i - c * h) / det,\r
    (b * f - c * e) / det,\r
    B / det,\r
    (a * i - c * g) / det,\r
    -(a * f - c * d) / det,\r
    C / det,\r
    -(a * h - b * g) / det,\r
    (a * e - b * d) / det\r
  ];\r
};\r
\r
const multiply3 = (x: number[], y: number[]): number[] => {\r
  const out: number[] = new Array(9);\r
  for (let r = 0; r < 3; r++) {\r
    for (let c = 0; c < 3; c++) {\r
      out[r * 3 + c] = x[r * 3] * y[c] + x[r * 3 + 1] * y[3 + c] + x[r * 3 + 2] * y[6 + c];\r
    }\r
  }\r
  return out;\r
};\r
\r
const planeFor = (tiltX: number, tiltY: number, width: number, height: number) => {\r
  const ax = (tiltX * Math.PI) / 180;\r
  const ay = (tiltY * Math.PI) / 180;\r
  const depth = Math.max(width, height) * 1.25;\r
  const cx = width / 2;\r
  const cy = height / 2;\r
  const tilt = [\r
    Math.cos(ay),\r
    0,\r
    0,\r
    Math.sin(ax) * Math.sin(ay),\r
    Math.cos(ax),\r
    0,\r
    (Math.sin(ay) * Math.cos(ax)) / depth,\r
    -Math.sin(ax) / depth,\r
    1\r
  ];\r
  const forward = multiply3(multiply3([1, 0, cx, 0, 1, cy, 0, 0, 1], tilt), [1, 0, -cx, 0, 1, -cy, 0, 0, 1]);\r
  return invert3(forward);\r
};\r
\r
const PixelBlast = ({\r
  variant = 'square',\r
  pixelSize = 3,\r
  color = '#B497CF',\r
  accentColor,\r
  className,\r
  style,\r
  patternScale = 2,\r
  patternDensity = 1,\r
  pixelSizeJitter = 0,\r
  enableRipples = true,\r
  rippleIntensityScale = 1,\r
  rippleThickness = 0.1,\r
  rippleSpeed = 0.3,\r
  autoPauseOffscreen = true,\r
  speed = 0.5,\r
  transparent = true,\r
  edgeFade = 0.5,\r
  noiseAmount = 0,\r
  softness = 0.6,\r
  smoothing = 1,\r
  glow = 0.4,\r
  twinkle = 0.25,\r
  drift = 0.2,\r
  driftAngle = 30,\r
  hoverEffect = 'reveal',\r
  hoverRadius = 140,\r
  autoRipple = 0,\r
  tiltX = 0,\r
  tiltY = 0,\r
  intro = true,\r
  variation,\r
  lightMode = false,\r
  dpr\r
}: PixelBlastProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings: Settings = {\r
    variant: SHAPES[variant] ?? 0,\r
    pixelSize: Math.max(0.5, pixelSize),\r
    color,\r
    accentColor: accentColor || color,\r
    patternScale,\r
    patternDensity,\r
    pixelSizeJitter,\r
    enableRipples,\r
    rippleIntensityScale,\r
    rippleThickness: Math.max(0.001, rippleThickness),\r
    rippleSpeed,\r
    autoPauseOffscreen,\r
    speed,\r
    transparent,\r
    edgeFade: clamp(edgeFade, 0, 1),\r
    noiseAmount,\r
    softness: clamp(softness, 0, 1),\r
    smoothing: clamp(smoothing, 0, 1),\r
    glow: clamp(glow, 0, 2),\r
    twinkle: clamp(twinkle, 0, 1),\r
    drift,\r
    driftAngle,\r
    hoverEffect: HOVERS[hoverEffect] ?? 0,\r
    hoverRadius: Math.max(10, hoverRadius),\r
    autoRipple: Math.max(0, autoRipple),\r
    tiltX: clamp(tiltX, -70, 70),\r
    tiltY: clamp(tiltY, -70, 70),\r
    intro,\r
    variation,\r
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
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
    const cellShader = link(gl, CELL_FRAGMENT);\r
    const mainShader = link(gl, MAIN_FRAGMENT);\r
    if (!cellShader || !mainShader) return undefined;\r
    const cu = cellShader.uniforms;\r
    const mu = mainShader.uniforms;\r
    const vao = gl.createVertexArray();\r
\r
    const makeTexture = (filter: number) => {\r
      const texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
      return texture;\r
    };\r
    const targets = [0, 1].map(() => {\r
      const texture = makeTexture(gl.LINEAR);\r
      const framebuffer = gl.createFramebuffer();\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
      return { texture, framebuffer };\r
    });\r
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view: { width: number; height: number; ratio: number; plane: number[] | null; tiltKey: string } = {\r
      width: 1,\r
      height: 1,\r
      ratio: 1,\r
      plane: null,\r
      tiltKey: ''\r
    };\r
    const cells = { x: 0, y: 0, w: 1, h: 1, key: '' };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const mouse = { x: 0, y: 0, ready: false };\r
    const clickPos = new Float32Array(MAX_CLICKS * 2).fill(-1);\r
    const clickAt = new Float32Array(MAX_CLICKS);\r
    const clickAge = new Float32Array(MAX_CLICKS);\r
    let clickIndex = 0;\r
    let current = 0;\r
    let fresh = true;\r
    const seedOffset = settingsRef.current.variation;\r
    const timeOffset = typeof seedOffset === 'number' ? seedOffset * 37 : randomFloat() * 1000;\r
    let elapsed = 0;\r
    let clock = 0;\r
    let presence = 0;\r
    let driftX = 0;\r
    let driftY = 0;\r
    let introClock = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let nextAuto = 1.2;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let quiet = 0;\r
\r
    const patternTime = (s: Settings) => timeOffset + elapsed * s.speed;\r
\r
    const layoutCells = (s: Settings) => {\r
      const ps = s.pixelSize * view.ratio;\r
      const cps = 8 * ps;\r
      const w = canvas.width;\r
      const h = canvas.height;\r
      let minX = -w / 2;\r
      let maxX = w / 2;\r
      let minY = -h / 2;\r
      let maxY = h / 2;\r
      if (view.plane) {\r
        const corners = [\r
          [0, 0],\r
          [w, 0],\r
          [0, h],\r
          [w, h],\r
          [w / 2, 0],\r
          [w / 2, h],\r
          [0, h / 2],\r
          [w, h / 2]\r
        ];\r
        minX = Infinity;\r
        maxX = -Infinity;\r
        minY = Infinity;\r
        maxY = -Infinity;\r
        for (const [x, y] of corners) {\r
          const [qx, qy] = toPlane(x, y);\r
          if (qx < -1e5) continue;\r
          minX = Math.min(minX, qx - w / 2);\r
          maxX = Math.max(maxX, qx - w / 2);\r
          minY = Math.min(minY, qy - h / 2);\r
          maxY = Math.max(maxY, qy - h / 2);\r
        }\r
        if (!Number.isFinite(minX)) {\r
          minX = -w / 2;\r
          maxX = w / 2;\r
          minY = -h / 2;\r
          maxY = h / 2;\r
        }\r
      }\r
      const pad = cps;\r
      const x0 = Math.floor((minX - pad) / cps);\r
      const x1 = Math.floor((maxX + pad) / cps);\r
      const y0 = Math.floor((minY - pad) / cps);\r
      const y1 = Math.floor((maxY + pad) / cps);\r
      const width = Math.max(1, Math.min(2048, x1 - x0 + 1));\r
      const height = Math.max(1, Math.min(2048, y1 - y0 + 1));\r
      const key = \`\${x0}:\${y0}:\${width}:\${height}\`;\r
      if (key === cells.key) return;\r
      cells.key = key;\r
      cells.x = x0;\r
      cells.y = y0;\r
      cells.w = width;\r
      cells.h = height;\r
      for (const target of targets) {\r
        gl.bindTexture(gl.TEXTURE_2D, target.texture);\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
      }\r
      fresh = true;\r
    };\r
\r
    const planeClicks = new Float32Array(MAX_CLICKS * 2);\r
\r
    const stepCells = (s: Settings, decay: number) => {\r
      for (let k = 0; k < MAX_CLICKS; k++) {\r
        if (clickPos[k * 2] < 0) {\r
          planeClicks[k * 2] = -1;\r
          planeClicks[k * 2 + 1] = -1;\r
          continue;\r
        }\r
        const [px, py] = toPlane(clickPos[k * 2], clickPos[k * 2 + 1]);\r
        planeClicks[k * 2] = Math.max(px, 0);\r
        planeClicks[k * 2 + 1] = py;\r
      }\r
      const [mx, my] = toPlane(mouse.x, mouse.y);\r
      const source = targets[current];\r
      const target = targets[1 - current];\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);\r
      gl.viewport(0, 0, cells.w, cells.h);\r
      gl.disable(gl.BLEND);\r
      gl.useProgram(cellShader.program);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, source.texture);\r
      gl.uniform1i(cu.uPrev, 0);\r
      gl.uniform2f(cu.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(cu.uTime, patternTime(s));\r
      gl.uniform1f(cu.uPixelSize, s.pixelSize * view.ratio);\r
      gl.uniform1f(cu.uScale, s.patternScale);\r
      gl.uniform1f(cu.uDensity, s.patternDensity);\r
      gl.uniform1i(cu.uEnableRipples, s.enableRipples ? 1 : 0);\r
      gl.uniform1f(cu.uRippleSpeed, s.rippleSpeed);\r
      gl.uniform1f(cu.uRippleThickness, s.rippleThickness);\r
      gl.uniform1f(cu.uRippleIntensity, s.rippleIntensityScale);\r
      gl.uniform2fv(cu.uClickPos, planeClicks);\r
      gl.uniform1fv(cu.uClickAge, clickAge);\r
      gl.uniform2i(cu.uOrigin, cells.x, cells.y);\r
      gl.uniform2f(cu.uDrift, driftX, driftY);\r
      gl.uniform1i(cu.uHover, s.hoverEffect);\r
      gl.uniform2f(cu.uMouse, mx, my);\r
      gl.uniform1f(cu.uMouseRadius, s.hoverRadius * view.ratio);\r
      gl.uniform1f(cu.uMousePresence, presence);\r
      gl.uniform1f(cu.uIntro, introClock);\r
      gl.uniform1f(cu.uDecay, decay);\r
      gl.uniform1f(cu.uFresh, fresh ? 1 : 0);\r
      gl.bindVertexArray(vao);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      current = 1 - current;\r
      fresh = false;\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.useProgram(mainShader.program);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, targets[current].texture);\r
      gl.uniform1i(mu.uCells, 0);\r
      gl.uniform3fv(mu.uColor, hexToRgb(s.color));\r
      gl.uniform3fv(mu.uAccent, hexToRgb(s.accentColor));\r
      gl.uniform2f(mu.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(mu.uTime, patternTime(s));\r
      gl.uniform1f(mu.uClock, clock);\r
      gl.uniform1f(mu.uPixelSize, s.pixelSize * view.ratio);\r
      gl.uniform1f(mu.uPixelJitter, s.pixelSizeJitter);\r
      gl.uniform1f(mu.uEdgeFade, s.edgeFade);\r
      gl.uniform1i(mu.uShapeType, s.variant);\r
      gl.uniform2i(mu.uOrigin, cells.x, cells.y);\r
      gl.uniform2i(mu.uCellCount, cells.w, cells.h);\r
      gl.uniform1f(mu.uSoftness, s.softness);\r
      gl.uniform1f(mu.uSmoothing, s.smoothing);\r
      gl.uniform1f(mu.uGlow, s.glow);\r
      gl.uniform1f(mu.uTwinkle, reduce ? 0 : s.twinkle);\r
      gl.uniform1f(mu.uLightMode, s.lightMode ? 1 : 0);\r
      gl.uniform1f(mu.uTransparent, s.transparent ? 1 : 0);\r
      gl.uniform1f(mu.uNoise, s.noiseAmount);\r
      gl.uniform1i(mu.uHover, s.hoverEffect);\r
      gl.uniform1f(mu.uTilted, view.plane ? 1 : 0);\r
      if (view.plane) {\r
        const m = view.plane;\r
        gl.uniformMatrix3fv(mu.uPlane, false, [m[0], m[3], m[6], m[1], m[4], m[7], m[2], m[5], m[8]]);\r
      }\r
      gl.bindVertexArray(vao);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const toPlane = (x: number, y: number): number[] => {\r
      const m = view.plane;\r
      if (!m) return [x, y];\r
      const h = canvas.height;\r
      const cy = h - y;\r
      const z = m[6] * x + m[7] * cy + m[8];\r
      if (z <= 1e-4) return [-1e6, -1e6];\r
      return [(m[0] * x + m[1] * cy + m[2]) / z, h - (m[3] * x + m[4] * cy + m[5]) / z];\r
    };\r
\r
    const updatePlane = (s: Settings) => {\r
      view.plane = s.tiltX || s.tiltY ? planeFor(s.tiltX, s.tiltY, canvas.width, canvas.height) : null;\r
      view.tiltKey = \`\${s.tiltX}:\${s.tiltY}:\${canvas.width}:\${canvas.height}\`;\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      view.width = Math.max(1, container.clientWidth);\r
      view.height = Math.max(1, container.clientHeight);\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(view.width * view.ratio));\r
      canvas.height = Math.max(1, Math.round(view.height * view.ratio));\r
      if (!mouse.ready) {\r
        mouse.ready = true;\r
        mouse.x = canvas.width / 2;\r
        mouse.y = canvas.height / 2;\r
      }\r
      updatePlane(s);\r
      layoutCells(s);\r
      stepCells(s, 0);\r
      draw();\r
      wake();\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      const s = settingsRef.current;\r
      if (!visible && s.autoPauseOffscreen) return;\r
      if (document.hidden) return;\r
      const dt = last ? clamp((now - last) / 1000, 0, 1 / 20) : 0;\r
      last = now;\r
      if (!reduce) elapsed += dt;\r
      clock += dt;\r
      if (!reduce && s.drift) {\r
        const angle = (s.driftAngle * Math.PI) / 180;\r
        driftX += Math.cos(angle) * s.drift * dt * 0.05;\r
        driftY += Math.sin(angle) * s.drift * dt * 0.05;\r
      }\r
      if (!reduce && s.enableRipples && s.autoRipple > 0 && introClock >= 1) {\r
        nextAuto -= dt;\r
        if (nextAuto <= 0) {\r
          nextAuto = s.autoRipple * (0.7 + Math.random() * 0.6);\r
          addRipple((0.15 + Math.random() * 0.7) * view.width, (0.15 + Math.random() * 0.7) * view.height);\r
        }\r
      }\r
      for (let k = 0; k < MAX_CLICKS; k++) clickAge[k] = (clock - clickAt[k]) * 0.5;\r
      const targetX = pointer.x * view.ratio;\r
      const targetY = (view.height - pointer.y) * view.ratio;\r
      const follow = 1 - Math.exp(-dt / 0.08);\r
      if (pointer.inside) {\r
        mouse.x += (targetX - mouse.x) * follow;\r
        mouse.y += (targetY - mouse.y) * follow;\r
      }\r
      presence += ((pointer.inside ? 1 : 0) - presence) * (1 - Math.exp(-dt / 0.25));\r
      const key = \`\${s.tiltX}:\${s.tiltY}:\${canvas.width}:\${canvas.height}\`;\r
      if (key !== view.tiltKey) updatePlane(s);\r
      layoutCells(s);\r
      const decay = s.hoverEffect ? Math.exp(-dt / 0.45) : 0;\r
      stepCells(s, decay);\r
      draw();\r
      if (introClock < 1) introClock = Math.min(1, introClock + dt / INTRO_SECONDS);\r
      let busy = !reduce && (s.speed !== 0 || s.drift !== 0 || s.twinkle > 0 || (s.autoRipple > 0 && s.enableRipples));\r
      busy = busy || introClock < 1 || presence > 0.001;\r
      for (let k = 0; k < MAX_CLICKS; k++) busy = busy || (clickPos[k * 2] >= 0 && clickAge[k] < 8);\r
      quiet = busy ? 0 : quiet + dt;\r
      if (quiet < 1.5) raf = requestAnimationFrame(frame);\r
    };\r
\r
    function wake() {\r
      quiet = 0;\r
      if (!raf && (visible || !settingsRef.current.autoPauseOffscreen) && !document.hidden) {\r
        last = 0;\r
        raf = requestAnimationFrame(frame);\r
      }\r
    }\r
\r
    const locate = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const { x, y, inside } = locate(event);\r
      const was = pointer.inside;\r
      pointer.inside = inside;\r
      if (inside) {\r
        pointer.x = x;\r
        pointer.y = y;\r
        if (!was) {\r
          mouse.x = x * view.ratio;\r
          mouse.y = (view.height - y) * view.ratio;\r
        }\r
      }\r
      if (inside || was) wake();\r
    };\r
\r
    function addRipple(x: number, y: number) {\r
      clickPos[clickIndex * 2] = x * view.ratio;\r
      clickPos[clickIndex * 2 + 1] = (view.height - y) * view.ratio;\r
      clickAt[clickIndex] = clock;\r
      clickIndex = (clickIndex + 1) % MAX_CLICKS;\r
      wake();\r
    }\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      const { x, y, inside } = locate(event);\r
      if (!inside || reduce || !s.enableRipples) return;\r
      addRipple(x, y);\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
    const onVisibility = () => wake();\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(container);\r
    const intersection = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible) wake();\r
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
      for (const target of targets) {\r
        gl.deleteTexture(target.texture);\r
        gl.deleteFramebuffer(target.framebuffer);\r
      }\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(cellShader.program);\r
      gl.deleteProgram(mainShader.program);\r
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
      aria-label="PixelBlast interactive background"\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default PixelBlast;\r
`,i={usage:`import PixelBlast from './PixelBlast';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <PixelBlast
    variant="square"
    pixelSize={3}
    color="#B497CF"
    patternScale={2}
    patternDensity={1}
    softness={0.6}
    glow={0.4}
    twinkle={0.25}
    drift={0.2}
    hoverEffect="reveal"
    enableRipples
    edgeFade={0.25}
  />
</div>`,code:r,css:n,tailwind:e,tsCode:t,tsTailwind:o};export{i as pixelBlast};
