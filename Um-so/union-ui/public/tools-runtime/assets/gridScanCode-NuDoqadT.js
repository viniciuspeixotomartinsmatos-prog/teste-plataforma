const r=`'use client';\r
\r
import { useEffect, useRef, useState } from 'react';\r
import './GridScan.css';\r
\r
const MAX_PINGS = 4;\r
const PING_LIFE = 2.4;\r
const INTRO_SECONDS = 2.2;\r
const EYE_DISTANCE = 1.25;\r
const FACE_API_URL = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js';\r
const MODELS_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@0.22.2/weights';\r
const STYLES = { solid: 0, dashed: 1, dotted: 2 };\r
\r
const VERTEX = \`#version 300 es\r
out vec2 vUv;\r
void main() {\r
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\r
  vUv = p;\r
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const ROOM = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform float uAspect;\r
uniform float uPixel;\r
uniform vec3 uEye;\r
uniform float uDepth;\r
uniform vec3 uCell;\r
uniform float uThick;\r
uniform float uDot;\r
uniform int uStyle;\r
uniform vec3 uLineColor;\r
uniform vec3 uScanColor;\r
uniform vec3 uCoreColor;\r
uniform float uFade;\r
uniform float uScanZ;\r
uniform float uScanDir;\r
uniform float uScanAlpha;\r
uniform float uScanWidth;\r
uniform float uTrail;\r
uniform float uReveal;\r
uniform float uPoints;\r
uniform float uReflect;\r
uniform float uHaze;\r
uniform float uShade;\r
uniform float uLight;\r
uniform vec4 uPing[4];\r
uniform float uPingAlpha[4];\r
uniform vec4 uHover;\r
uniform float uTime;\r
in vec2 vUv;\r
layout(location = 0) out vec4 outColor;\r
layout(location = 1) out vec4 outGlow;\r
\r
struct Light {\r
  float grid;\r
  float fade;\r
  float core;\r
  float trail;\r
  float spill;\r
  float ping;\r
  float wake;\r
  float reveal;\r
};\r
\r
float hash(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * 0.1031);\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.x + q.y) * q.z);\r
}\r
\r
vec2 hash2(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.103, 0.0973));\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.xx + q.yz) * q.zy);\r
}\r
\r
float lines(float across, float along, float period, float dash, float fa, float fb) {\r
  float u = across / period;\r
  float du = fa / period;\r
  float d = abs(fract(u + 0.5) - 0.5) / max(du, 1e-5);\r
  float dense = smoothstep(0.1, 0.4, du);\r
  if (uStyle == 2) {\r
    float c = along / dash * 5.0;\r
    float dc = fb / dash * 5.0;\r
    float e = abs(fract(c + 0.5) - 0.5) / max(dc, 1e-5);\r
    float cov = clamp(uThick + 1.0 - length(vec2(d, e)), 0.0, 1.0);\r
    float mean = min(1.0, 3.1416 * (uThick + 0.5) * (uThick + 0.5) * du * dc);\r
    return mix(cov, mean, max(dense, smoothstep(0.1, 0.4, dc)));\r
  }\r
  float cov = clamp(uThick + 0.5 - d, 0.0, 1.0);\r
  float mean = min(1.0, 2.0 * uThick * du);\r
  if (uStyle == 1) {\r
    float c = along / dash * 4.0;\r
    float dc = fb / dash * 4.0;\r
    float e = abs(fract(c + 0.5) - 0.5);\r
    float m = clamp((0.25 - e) / max(dc, 1e-5) + 0.5, 0.0, 1.0);\r
    cov *= mix(m, 0.5, smoothstep(0.1, 0.4, dc));\r
    mean *= 0.5;\r
  }\r
  return mix(cov, mean, dense);\r
}\r
\r
float depthFade(float z) {\r
  float n = clamp(z / uDepth, 0.0, 1.0);\r
  return mix(1.0, (exp(-3.0 * n) - 0.0497871) / 0.9502129, uFade);\r
}\r
\r
vec3 project(vec3 eye, vec3 o, int face, float plane) {\r
  vec3 d = o - eye;\r
  float t = face == 0 ? (plane - o.x) / d.x : (face == 1 ? (plane - o.y) / d.y : (plane - o.z) / d.z);\r
  return o + d * t;\r
}\r
\r
void trace(vec3 o, vec3 d, out int face, out float plane, out vec3 h) {\r
  float sx = d.x > 0.0 ? 0.5 * uAspect : -0.5 * uAspect;\r
  float sy = d.y > 0.0 ? 0.5 : -0.5;\r
  float tx = abs(d.x) > 1e-6 ? (sx - o.x) / d.x : 1e9;\r
  float ty = abs(d.y) > 1e-6 ? (sy - o.y) / d.y : 1e9;\r
  float t = (uDepth - o.z) / d.z;\r
  face = 2;\r
  plane = uDepth;\r
  if (tx < t) {\r
    face = 0;\r
    plane = sx;\r
    t = tx;\r
  }\r
  if (ty < t) {\r
    face = 1;\r
    plane = sy;\r
    t = ty;\r
  }\r
  h = o + d * t;\r
}\r
\r
vec2 faceUv(vec3 h, int face) {\r
  if (face == 0) return vec2(h.z, h.y + 0.5);\r
  if (face == 1) return vec2(h.x + 0.5 * uAspect, h.z);\r
  return vec2(h.x + 0.5 * uAspect, h.y + 0.5);\r
}\r
\r
Light illuminate(vec3 h, int face, vec2 uv, vec2 foot, float blur) {\r
  Light l;\r
  vec2 cell = face == 0 ? uCell.zy : (face == 1 ? uCell.xz : uCell.xy);\r
  vec2 f = foot * blur;\r
  float minor = max(lines(uv.x, uv.y, cell.x, cell.y, f.x, f.y), lines(uv.y, uv.x, cell.y, cell.x, f.y, f.x));\r
  float major = max(\r
    lines(uv.x, uv.y, cell.x * 4.0, cell.y, f.x, f.y),\r
    lines(uv.y, uv.x, cell.y * 4.0, cell.x, f.y, f.x)\r
  );\r
  l.grid = max(minor * 0.75, major) / blur;\r
  float z = h.z;\r
  l.fade = depthFade(z);\r
  l.reveal = smoothstep(uReveal, uReveal - 0.2, z);\r
  float zFoot = face == 0 ? f.x : (face == 1 ? f.y : 0.0);\r
  float width = max(uScanWidth, zFoot * 1.1);\r
  float dz = z - uScanZ;\r
  l.core = exp(-dz * dz / (width * width)) * (face == 2 ? 0.45 : 1.0) * uScanAlpha;\r
  float behind = -dz * uScanDir;\r
  l.trail = exp(-max(behind, 0.0) / uTrail) * smoothstep(-width, width * 0.5, behind) * uScanAlpha;\r
  l.spill = exp(-dz * dz / 0.05) * uScanAlpha;\r
  l.ping = 0.0;\r
  l.wake = 0.0;\r
  for (int i = 0; i < 4; i++) {\r
    float alpha = uPingAlpha[i];\r
    if (alpha <= 0.0) continue;\r
    float dist = length(h - uPing[i].xyz) - uPing[i].w;\r
    l.ping += exp(-dist * dist / 0.0012) * alpha;\r
    l.wake += exp(min(dist, 0.0) / 0.22) * smoothstep(0.03, -0.03, dist) * alpha;\r
  }\r
  return l;\r
}\r
\r
void over(inout vec4 acc, vec3 color, float alpha) {\r
  alpha = clamp(alpha, 0.0, 1.0);\r
  acc = vec4(color * alpha, alpha) + acc * (1.0 - alpha);\r
}\r
\r
void paint(inout vec4 color, inout float energy, Light l, float gain, float lift, float hover) {\r
  float base = l.grid * l.fade * l.reveal * lift;\r
  float far = l.fade * l.reveal * gain;\r
  float lit = l.grid * (l.core * 1.2 + l.trail * 0.75 + l.ping * 1.4 + l.wake * 0.5 + hover * 0.5) * far;\r
  float sheen = (l.core * 0.14 + l.spill * 0.05 + l.trail * 0.03 + l.ping * 0.2 + l.wake * 0.04) * far;\r
  float laser = (l.core + l.ping * 0.35) * far;\r
  over(color, uLineColor, base);\r
  over(color, uScanColor, sheen);\r
  over(color, uScanColor, lit);\r
  over(color, uCoreColor, laser * 0.9);\r
  energy += laser * 0.9 + lit * 0.5;\r
}\r
\r
void main() {\r
  vec3 p = vec3((vUv.x - 0.5) * uAspect, vUv.y - 0.5, 0.0);\r
  vec3 d = p - uEye;\r
  int face;\r
  float plane;\r
  vec3 h;\r
  trace(p, d, face, plane, h);\r
  vec3 hx = project(uEye, p + vec3(uPixel, 0.0, 0.0), face, plane);\r
  vec3 hy = project(uEye, p + vec3(0.0, uPixel, 0.0), face, plane);\r
  vec2 uv = faceUv(h, face);\r
  vec2 ux = faceUv(hx, face) - uv;\r
  vec2 uy = faceUv(hy, face) - uv;\r
  vec2 foot = vec2(length(vec2(ux.x, uy.x)), length(vec2(ux.y, uy.y)));\r
  Light l = illuminate(h, face, uv, foot, 1.0);\r
\r
  vec4 color = vec4(0.0);\r
  float energy = 0.0;\r
\r
  if (uShade > 0.0) {\r
    vec2 gaps = face == 0\r
      ? vec2(0.5 - abs(h.y), uDepth - h.z)\r
      : (face == 1 ? vec2(0.5 * uAspect - abs(h.x), uDepth - h.z) : vec2(0.5 * uAspect - abs(h.x), 0.5 - abs(h.y)));\r
    vec2 crease = 1.0 - exp(-max(gaps, 0.0) / 0.16);\r
    float occlusion = crease.x * crease.y;\r
    float lamp = 1.0 / (1.0 + h.z * h.z * 0.9);\r
    float tilt = face == 1 ? (plane < 0.0 ? 1.1 : 0.85) : (face == 2 ? 0.8 : 1.0);\r
    float glowSpill = (l.spill * 0.5 + l.trail * 0.12) * l.reveal * l.fade;\r
    if (uLight > 0.5) {\r
      float shadow = (1.0 - lamp * tilt) * 0.09 + (1.0 - occlusion) * 0.2;\r
      over(color, vec3(0.0), shadow * uShade * l.reveal * l.fade);\r
    } else {\r
      over(color, vec3(1.0), lamp * tilt * occlusion * 0.11 * uShade * l.reveal * l.fade);\r
    }\r
    over(color, uScanColor, glowSpill * uShade * occlusion * 0.35);\r
  }\r
\r
  if (face == 1 && plane < 0.0 && uReflect > 0.0) {\r
    vec3 mirror = vec3(uEye.x, -1.0 - uEye.y, uEye.z);\r
    vec3 r = h - mirror;\r
    int face2;\r
    float plane2;\r
    vec3 h2;\r
    trace(h, r, face2, plane2, h2);\r
    vec2 uv2 = faceUv(h2, face2);\r
    vec2 ux2 = faceUv(project(mirror, hx, face2, plane2), face2) - uv2;\r
    vec2 uy2 = faceUv(project(mirror, hy, face2, plane2), face2) - uv2;\r
    vec2 foot2 = vec2(length(vec2(ux2.x, uy2.x)), length(vec2(ux2.y, uy2.y)));\r
    float travel = length(h2 - h);\r
    Light m = illuminate(h2, face2, uv2, foot2, 1.0 + travel * 4.0);\r
    m.reveal *= l.reveal;\r
    float grazing = 1.0 - normalize(r).y;\r
    float gain = (0.3 + 0.7 * grazing * grazing * grazing * grazing) * uReflect * exp(-travel * 1.1) * (uLight > 0.5 ? 0.6 : 1.0);\r
    float reflected = 0.0;\r
    paint(color, reflected, m, gain, 0.0, 0.0);\r
    energy += reflected * 0.6;\r
  }\r
\r
  vec3 near = h - uHover.xyz;\r
  float hover = exp(-dot(near, near) / 0.08) * uHover.w;\r
  paint(color, energy, l, 1.0, 1.0, hover);\r
\r
  if (uPoints > 0.5) {\r
    vec2 cell = face == 0 ? uCell.zy : (face == 1 ? uCell.xz : uCell.xy);\r
    vec2 spacing = cell / 2.5;\r
    vec2 q = uv / spacing;\r
    vec2 id = floor(q);\r
    vec2 seed = id + vec2(float(face) * 13.7 + plane * 5.3, float(face) * 3.1);\r
    vec2 delta = (q - id - (0.2 + 0.6 * hash2(seed))) * spacing;\r
    float det = ux.x * uy.y - ux.y * uy.x;\r
    vec2 s = vec2(delta.x * uy.y - delta.y * uy.x, ux.x * delta.y - ux.y * delta.x) / det;\r
    float radius = uDot * mix(1.0, 0.55, clamp(h.z / uDepth, 0.0, 1.0));\r
    float spot = clamp(radius + 0.5 - length(s), 0.0, 1.0);\r
    float gap = min(spacing.x / foot.x, spacing.y / foot.y);\r
    float r = hash(seed + 7.7);\r
    float flicker = 0.75 + 0.25 * sin(uTime * (3.0 + r * 5.0) + r * 40.0);\r
    float dots = spot * smoothstep(5.0, 10.0, gap) * smoothstep(0.25, 0.6, r) * (0.3 + 0.7 * r * r) * flicker;\r
    float hot = l.core * 2.5 + l.ping * 1.6;\r
    float warm = l.trail * l.trail * 1.3 + l.wake * 0.6 + hover * 1.3;\r
    float spark = dots * (hot + warm) * l.fade * l.reveal;\r
    over(color, mix(uScanColor, uCoreColor, clamp(hot / max(hot + warm, 1e-4), 0.0, 1.0)), spark);\r
    energy += spark * 0.9;\r
  }\r
\r
  if (uHaze > 0.0 && uScanAlpha > 0.0 && uScanZ > 0.0 && h.z > uScanZ) {\r
    vec3 c = p + d * (uScanZ / d.z);\r
    float grain = hash(floor(c.xy * 180.0) + floor(uTime * 24.0) * 7.0);\r
    float edge = min(0.5 * uAspect - abs(c.x), 0.5 - abs(c.y));\r
    float rim = exp(-edge / 0.06);\r
    float veil = uHaze * uScanAlpha * (0.45 + 0.9 * grain) * (0.55 + rim * 1.6);\r
    over(color, uScanColor, veil * depthFade(uScanZ) * l.reveal);\r
  }\r
\r
  energy = clamp(energy, 0.0, 1.0);\r
  outColor = color;\r
  outGlow = vec4(uScanColor * energy, energy);\r
}\`;\r
\r
const DOWN = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uSource;\r
uniform vec2 uTexel;\r
in vec2 vUv;\r
out vec4 outColor;\r
void main() {\r
  vec2 o = uTexel;\r
  outColor = 0.25 * (\r
    texture(uSource, vUv + vec2(-o.x, -o.y)) +\r
    texture(uSource, vUv + vec2(o.x, -o.y)) +\r
    texture(uSource, vUv + vec2(-o.x, o.y)) +\r
    texture(uSource, vUv + vec2(o.x, o.y))\r
  );\r
}\`;\r
\r
const BLUR = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uSource;\r
uniform vec2 uStep;\r
in vec2 vUv;\r
out vec4 outColor;\r
void main() {\r
  vec4 sum = texture(uSource, vUv) * 0.1964825501511404;\r
  sum += (texture(uSource, vUv + uStep * 1.411764705882353) + texture(uSource, vUv - uStep * 1.411764705882353)) * 0.2969069646728344;\r
  sum += (texture(uSource, vUv + uStep * 3.2941176470588234) + texture(uSource, vUv - uStep * 3.2941176470588234)) * 0.09447039785044732;\r
  sum += (texture(uSource, vUv + uStep * 5.176470588235294) + texture(uSource, vUv - uStep * 5.176470588235294)) * 0.010381362401148057;\r
  outColor = sum;\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uScene;\r
uniform sampler2D uBloom;\r
uniform float uGlow;\r
in vec2 vUv;\r
out vec4 outColor;\r
float hash(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * 0.1031);\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.x + q.y) * q.z);\r
}\r
void main() {\r
  vec4 scene = texture(uScene, vUv);\r
  vec4 bloom = texture(uBloom, vUv) * uGlow;\r
  bloom.a = min(bloom.a, 1.0);\r
  bloom.rgb = min(bloom.rgb, vec3(bloom.a));\r
  vec4 color = scene + bloom * (1.0 - scene.a);\r
  float noise = (hash(gl_FragCoord.xy) - 0.5) / 255.0;\r
  color.a = clamp(color.a + noise, 0.0, 1.0);\r
  color.rgb = clamp(color.rgb + noise, vec3(0.0), vec3(color.a));\r
  outColor = color;\r
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
const createTarget = gl => {\r
  const texture = gl.createTexture();\r
  gl.bindTexture(gl.TEXTURE_2D, texture);\r
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
  return { texture, width: 0, height: 0 };\r
};\r
\r
const sizeTarget = (gl, target, width, height) => {\r
  if (target.width === width && target.height === height) return;\r
  target.width = width;\r
  target.height = height;\r
  gl.bindTexture(gl.TEXTURE_2D, target.texture);\r
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
};\r
\r
let faceApiLoader = null;\r
\r
const loadFaceApi = () => {\r
  if (window.faceapi) return Promise.resolve(window.faceapi);\r
  if (!faceApiLoader) {\r
    faceApiLoader = new Promise((resolve, reject) => {\r
      const script = document.createElement('script');\r
      script.src = FACE_API_URL;\r
      script.async = true;\r
      script.onload = () => (window.faceapi ? resolve(window.faceapi) : reject(new Error('face-api.js')));\r
      script.onerror = () => {\r
        faceApiLoader = null;\r
        reject(new Error('face-api.js'));\r
      };\r
      document.head.appendChild(script);\r
    });\r
  }\r
  return faceApiLoader;\r
};\r
\r
const STATUS_LABELS = {\r
  loading: 'Loading face tracking',\r
  searching: 'Looking for a face',\r
  tracking: 'Tracking',\r
  blocked: 'Camera unavailable'\r
};\r
\r
export const GridScan = ({\r
  linesColor,\r
  scanColor,\r
  cells = 8,\r
  lineThickness = 1,\r
  lineStyle = 'solid',\r
  depth = 3,\r
  depthFade = 0.6,\r
  parallax = 1,\r
  points = true,\r
  reflection = 0.35,\r
  shading = 0.7,\r
  scanDirection = 'forward',\r
  scanDuration = 2.4,\r
  scanDelay = 1.6,\r
  scanWidth = 1,\r
  trail = 0.5,\r
  glow = 0.6,\r
  autoScan = true,\r
  interactive = true,\r
  clickEffect = 'ping',\r
  enableWebcam = false,\r
  showPreview = false,\r
  modelsPath = MODELS_URL,\r
  enableGyro = false,\r
  intro = true,\r
  lightMode = false,\r
  dpr,\r
  className = '',\r
  style,\r
  ...rest\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const videoRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const headRef = useRef(null);\r
  const [status, setStatus] = useState('loading');\r
  const settings = {\r
    linesColor: linesColor ?? (lightMode ? '#d4d4d8' : '#4d4757'),\r
    scanColor: scanColor ?? (lightMode ? '#0284c7' : '#7dd3fc'),\r
    cells: clamp(cells, 2, 40),\r
    thickness: clamp(lineThickness, 0.5, 4),\r
    style: STYLES[lineStyle] ?? 0,\r
    depth: clamp(depth, 0.5, 12),\r
    depthFade: clamp(depthFade, 0, 1),\r
    parallax: clamp(parallax, 0, 3),\r
    points,\r
    reflection: clamp(reflection, 0, 1),\r
    shading: clamp(shading, 0, 1),\r
    direction: scanDirection,\r
    duration: clamp(scanDuration, 0.3, 20),\r
    delay: clamp(scanDelay, 0, 30),\r
    scanWidth: clamp(scanWidth, 0.2, 5),\r
    trail: clamp(trail, 0, 1),\r
    glow: clamp(glow, 0, 1.5),\r
    autoScan,\r
    interactive,\r
    clickEffect,\r
    enableGyro,\r
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
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const room = link(gl, ROOM);\r
    const down = link(gl, DOWN);\r
    const blur = link(gl, BLUR);\r
    const composite = link(gl, COMPOSITE);\r
    if (!room || !down || !blur || !composite) return undefined;\r
    const vao = gl.createVertexArray();\r
    const scene = createTarget(gl);\r
    const light = createTarget(gl);\r
    const bloomA = createTarget(gl);\r
    const bloomB = createTarget(gl);\r
    const sceneBuffer = gl.createFramebuffer();\r
    const bloomBufferA = gl.createFramebuffer();\r
    const bloomBufferB = gl.createFramebuffer();\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const colorCache = new Map();\r
    const parse = value => {\r
      const key = String(value);\r
      const cached = colorCache.get(key);\r
      if (cached) return cached;\r
      let rgb = [1, 1, 1];\r
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
    const eye = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, f: EYE_DISTANCE, vf: 0, tf: EYE_DISTANCE };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const look = { x: 0, y: 0, held: false };\r
    const tilt = { gamma: 0, beta: 0, ready: false, asked: false };\r
    const hover = { x: 0, y: 0, z: 0, strength: 0, ready: false };\r
    const scan = { z: 0, dir: 1, alpha: 0, start: 0, sweeps: 0, waiting: false };\r
    const pings = [];\r
    const pingData = new Float32Array(MAX_PINGS * 4);\r
    const pingAlpha = new Float32Array(MAX_PINGS);\r
    let time = 0;\r
    let introClock = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let leaveTimer = 0;\r
\r
    const roomSize = () => {\r
      const s = settingsRef.current;\r
      const aspect = view.width / view.height;\r
      const cy = 1 / Math.round(s.cells);\r
      const cx = aspect / Math.max(1, Math.round(aspect / cy));\r
      const roomDepth = Math.max(cy, Math.round(s.depth / cy) * cy);\r
      return { aspect, cx, cy, roomDepth };\r
    };\r
\r
    const castRay = (u, v) => {\r
      const { aspect, roomDepth } = roomSize();\r
      const px = (u - 0.5) * aspect;\r
      const py = v - 0.5;\r
      const dx = px - eye.x;\r
      const dy = py - eye.y;\r
      const dz = eye.f;\r
      const sx = dx > 0 ? 0.5 * aspect : -0.5 * aspect;\r
      const sy = dy > 0 ? 0.5 : -0.5;\r
      let t = roomDepth / dz;\r
      if (Math.abs(dx) > 1e-6) t = Math.min(t, (sx - px) / dx);\r
      if (Math.abs(dy) > 1e-6) t = Math.min(t, (sy - py) / dy);\r
      return { x: px + dx * t, y: py + dy * t, z: dz * t };\r
    };\r
\r
    const startSweep = s => {\r
      scan.dir = s.direction === 'backward' || (s.direction === 'pingpong' && scan.sweeps % 2 === 1) ? -1 : 1;\r
      scan.start = time;\r
      scan.waiting = false;\r
      scan.sweeps += 1;\r
    };\r
\r
    const updateScan = (s, roomDepth) => {\r
      if (introClock < 1) {\r
        const k = introClock;\r
        scan.dir = 1;\r
        scan.z = k * (roomDepth + 0.4) - 0.2;\r
        scan.alpha = Math.min(1, k * 6) * (1 - Math.max(0, k - 0.85) / 0.15);\r
        return;\r
      }\r
      if (scan.sweeps === 0 && !scan.waiting) {\r
        scan.waiting = true;\r
        scan.start = time;\r
        scan.alpha = 0;\r
      }\r
      if (scan.waiting) {\r
        scan.alpha = 0;\r
        if (s.autoScan && !reduce && time - scan.start >= s.delay) startSweep(s);\r
        return;\r
      }\r
      const k = (time - scan.start) / s.duration;\r
      if (k >= 1) {\r
        scan.waiting = true;\r
        scan.start = time;\r
        scan.alpha = 0;\r
        return;\r
      }\r
      const travel = k * (roomDepth + 0.3) - 0.15;\r
      scan.z = scan.dir > 0 ? travel : roomDepth - travel;\r
      scan.alpha = Math.min(1, k / 0.12) * Math.min(1, (1 - k) / 0.12);\r
    };\r
\r
    const updateEye = dt => {\r
      const steps = Math.max(1, Math.ceil(dt / (1 / 120)));\r
      const h = dt / steps;\r
      for (let i = 0; i < steps; i++) {\r
        eye.vx += ((eye.tx - eye.x) * 42 - eye.vx * 11) * h;\r
        eye.vy += ((eye.ty - eye.y) * 42 - eye.vy * 11) * h;\r
        eye.vf += ((eye.tf - eye.f) * 42 - eye.vf * 11) * h;\r
        eye.x += eye.vx * h;\r
        eye.y += eye.vy * h;\r
        eye.f += eye.vf * h;\r
      }\r
    };\r
\r
    const setLook = (nx, ny, held) => {\r
      look.x = clamp(nx, -1, 1);\r
      look.y = clamp(ny, -1, 1);\r
      look.held = held;\r
    };\r
\r
    const aimEye = s => {\r
      const aspect = view.width / view.height;\r
      const drift = reduce ? 0 : 1;\r
      const nx = look.held ? look.x : (Math.sin(time * 0.21) * 0.2 + Math.sin(time * 0.083 + 1.3) * 0.12) * drift;\r
      const ny = look.held ? look.y : Math.sin(time * 0.17 + 2.1) * 0.16 * drift;\r
      eye.tx = nx * s.parallax * 0.22 * aspect;\r
      eye.ty = ny * s.parallax * 0.22;\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      view.width = Math.max(1, container.clientWidth);\r
      view.height = Math.max(1, container.clientHeight);\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(view.width * view.ratio));\r
      canvas.height = Math.max(1, Math.round(view.height * view.ratio));\r
      sizeTarget(gl, scene, canvas.width, canvas.height);\r
      sizeTarget(gl, light, canvas.width, canvas.height);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, sceneBuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, scene.texture, 0);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, light.texture, 0);\r
      const bw = Math.max(1, Math.round(canvas.width / 4));\r
      const bh = Math.max(1, Math.round(canvas.height / 4));\r
      sizeTarget(gl, bloomA, bw, bh);\r
      sizeTarget(gl, bloomB, bw, bh);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, bloomBufferA);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, bloomA.texture, 0);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, bloomBufferB);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, bloomB.texture, 0);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      draw();\r
      wake();\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      const { aspect, cx, cy, roomDepth } = roomSize();\r
      const lineRgb = parse(s.linesColor);\r
      const scanRgb = parse(s.scanColor);\r
      const coreRgb = s.lightMode ? scanRgb : scanRgb.map(c => c + (1 - c) * 0.65);\r
      const ru = room.uniforms;\r
      gl.bindVertexArray(vao);\r
      gl.disable(gl.BLEND);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, sceneBuffer);\r
      gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(room.program);\r
      gl.uniform1f(ru.uAspect, aspect);\r
      gl.uniform1f(ru.uPixel, 1 / canvas.height);\r
      gl.uniform3f(ru.uEye, eye.x, eye.y, -eye.f);\r
      gl.uniform1f(ru.uDepth, roomDepth);\r
      gl.uniform3f(ru.uCell, cx, cy, cy);\r
      gl.uniform1f(ru.uThick, s.thickness * view.ratio * 0.5);\r
      gl.uniform1f(ru.uDot, 1.8 * view.ratio);\r
      gl.uniform1i(ru.uStyle, s.style);\r
      gl.uniform3fv(ru.uLineColor, lineRgb);\r
      gl.uniform3fv(ru.uScanColor, scanRgb);\r
      gl.uniform3fv(ru.uCoreColor, coreRgb);\r
      gl.uniform1f(ru.uFade, s.depthFade);\r
      gl.uniform1f(ru.uScanZ, scan.z);\r
      gl.uniform1f(ru.uScanDir, scan.dir);\r
      gl.uniform1f(ru.uScanAlpha, scan.alpha);\r
      gl.uniform1f(ru.uScanWidth, 0.006 * s.scanWidth);\r
      gl.uniform1f(ru.uTrail, 0.04 + s.trail * 1.1);\r
      gl.uniform1f(ru.uReveal, introClock < 1 ? scan.z + 0.05 : 1e4);\r
      gl.uniform1f(ru.uPoints, s.points ? 1 : 0);\r
      gl.uniform1f(ru.uReflect, s.reflection);\r
      gl.uniform1f(ru.uHaze, s.lightMode ? 0.03 : 0.05);\r
      gl.uniform1f(ru.uShade, s.shading);\r
      gl.uniform1f(ru.uLight, s.lightMode ? 1 : 0);\r
      gl.uniform4fv(ru.uPing, pingData);\r
      gl.uniform1fv(ru.uPingAlpha, pingAlpha);\r
      gl.uniform4f(ru.uHover, hover.x, hover.y, hover.z, hover.strength);\r
      gl.uniform1f(ru.uTime, time);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      const glowing = s.glow > 0;\r
      if (glowing) {\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, bloomBufferA);\r
        gl.viewport(0, 0, bloomA.width, bloomA.height);\r
        gl.useProgram(down.program);\r
        gl.activeTexture(gl.TEXTURE0);\r
        gl.bindTexture(gl.TEXTURE_2D, light.texture);\r
        gl.uniform1i(down.uniforms.uSource, 0);\r
        gl.uniform2f(down.uniforms.uTexel, 1 / light.width, 1 / light.height);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
        const spread = (2.2 * view.ratio) / 2;\r
        gl.useProgram(blur.program);\r
        gl.uniform1i(blur.uniforms.uSource, 0);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, bloomBufferB);\r
        gl.bindTexture(gl.TEXTURE_2D, bloomA.texture);\r
        gl.uniform2f(blur.uniforms.uStep, spread / bloomA.width, 0);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, bloomBufferA);\r
        gl.bindTexture(gl.TEXTURE_2D, bloomB.texture);\r
        gl.uniform2f(blur.uniforms.uStep, 0, spread / bloomA.height);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      }\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(composite.program);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, scene.texture);\r
      gl.uniform1i(composite.uniforms.uScene, 0);\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.bindTexture(gl.TEXTURE_2D, bloomA.texture);\r
      gl.uniform1i(composite.uniforms.uBloom, 1);\r
      gl.uniform1f(composite.uniforms.uGlow, glowing ? s.glow * (s.lightMode ? 0.8 : 1.6) : 0);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.activeTexture(gl.TEXTURE0);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.001, 0.05) : 1 / 60;\r
      last = now;\r
      time += dt;\r
      if (introClock < 1) introClock = Math.min(1, introClock + dt / INTRO_SECONDS);\r
      const { roomDepth } = roomSize();\r
      updateScan(s, roomDepth);\r
      aimEye(s);\r
      updateEye(dt);\r
\r
      const aim = s.interactive && pointer.inside && !reduce ? 1 : 0;\r
      if (aim) {\r
        const target = castRay(pointer.x, pointer.y);\r
        if (!hover.ready) Object.assign(hover, target, { ready: true });\r
        const follow = 1 - Math.exp(-dt / 0.08);\r
        hover.x += (target.x - hover.x) * follow;\r
        hover.y += (target.y - hover.y) * follow;\r
        hover.z += (target.z - hover.z) * follow;\r
      }\r
      hover.strength += (aim - hover.strength) * (1 - Math.exp(-dt / 0.25));\r
      if (!aim && hover.strength < 0.01) hover.ready = false;\r
\r
      for (let i = pings.length - 1; i >= 0; i--) {\r
        pings[i].age += dt;\r
        if (pings[i].age > PING_LIFE) pings.splice(i, 1);\r
      }\r
      for (let i = 0; i < MAX_PINGS; i++) {\r
        const ping = pings[i];\r
        if (!ping) {\r
          pingAlpha[i] = 0;\r
          continue;\r
        }\r
        const k = ping.age / PING_LIFE;\r
        pingData.set([ping.x, ping.y, ping.z, ping.age * 1.15], i * 4);\r
        pingAlpha[i] = Math.min(1, ping.age / 0.05) * (1 - k) * (1 - k);\r
      }\r
\r
      draw();\r
\r
      const settling =\r
        Math.abs(eye.tx - eye.x) + Math.abs(eye.ty - eye.y) + Math.abs(eye.tf - eye.f) > 1e-4 ||\r
        Math.abs(eye.vx) + Math.abs(eye.vy) + Math.abs(eye.vf) > 1e-4;\r
      const busy =\r
        introClock < 1 ||\r
        (!reduce && s.autoScan) ||\r
        !scan.waiting ||\r
        pings.length > 0 ||\r
        settling ||\r
        hover.strength > 0.002 ||\r
        (!reduce && s.parallax > 0 && !look.held) ||\r
        (s.points && !reduce && scan.alpha > 0);\r
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
      const u = (event.clientX - rect.left) / Math.max(1, rect.width);\r
      const v = 1 - (event.clientY - rect.top) / Math.max(1, rect.height);\r
      return { u, v, inside: u >= 0 && u <= 1 && v >= 0 && v <= 1 };\r
    };\r
\r
    const onPointerMove = event => {\r
      const s = settingsRef.current;\r
      const { u, v, inside } = locate(event);\r
      pointer.x = u;\r
      pointer.y = v;\r
      const was = pointer.inside;\r
      pointer.inside = inside;\r
      if (inside) {\r
        window.clearTimeout(leaveTimer);\r
        leaveTimer = 0;\r
        if (!headRef.current?.active && s.interactive && !reduce) setLook(u * 2 - 1, v * 2 - 1, true);\r
        wake();\r
      } else if (was && !leaveTimer) {\r
        leaveTimer = window.setTimeout(() => {\r
          leaveTimer = 0;\r
          if (!headRef.current?.active) look.held = false;\r
          wake();\r
        }, 220);\r
        wake();\r
      }\r
    };\r
\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      const { u, v, inside } = locate(event);\r
      if (!inside || reduce || s.clickEffect === 'none') return;\r
      if (s.clickEffect === 'scan') {\r
        if (introClock >= 1) startSweep(s);\r
      } else {\r
        const hit = castRay(u, v);\r
        pings.unshift({ ...hit, age: 0 });\r
        if (pings.length > MAX_PINGS) pings.pop();\r
      }\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      if (!headRef.current?.active) look.held = false;\r
      wake();\r
    };\r
\r
    const onOrientation = event => {\r
      const s = settingsRef.current;\r
      if (!s.enableGyro || headRef.current?.active || reduce || event.gamma === null || event.beta === null) return;\r
      if (!tilt.ready) Object.assign(tilt, { gamma: event.gamma, beta: event.beta, ready: true });\r
      setLook((event.gamma - tilt.gamma) / 25, (event.beta - tilt.beta) / -25, true);\r
      wake();\r
    };\r
\r
    const onClick = () => {\r
      const s = settingsRef.current;\r
      const request = window.DeviceOrientationEvent?.requestPermission;\r
      if (!s.enableGyro || tilt.asked || typeof request !== 'function') return;\r
      tilt.asked = true;\r
      request.call(window.DeviceOrientationEvent).catch(() => {});\r
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
    window.addEventListener('deviceorientation', onOrientation);\r
    window.addEventListener('click', onClick);\r
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    headRef.current = {\r
      active: false,\r
      move: (nx, ny, near) => {\r
        if (reduce) return;\r
        setLook(nx * 1.3, ny * 1.3, true);\r
        eye.tf = EYE_DISTANCE * clamp(near, 0.6, 1.6);\r
        wake();\r
      },\r
      release: () => {\r
        eye.tf = EYE_DISTANCE;\r
        look.held = false;\r
        wake();\r
      }\r
    };\r
    resize();\r
    wakeRef.current = wake;\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      window.clearTimeout(leaveTimer);\r
      wakeRef.current = null;\r
      headRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('deviceorientation', onOrientation);\r
      window.removeEventListener('click', onClick);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      [scene, light, bloomA, bloomB].forEach(target => gl.deleteTexture(target.texture));\r
      [sceneBuffer, bloomBufferA, bloomBufferB].forEach(buffer => gl.deleteFramebuffer(buffer));\r
      gl.deleteVertexArray(vao);\r
      [room, down, blur, composite].forEach(item => gl.deleteProgram(item.program));\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  useEffect(() => {\r
    if (!enableWebcam) return undefined;\r
    const video = videoRef.current;\r
    if (!video) return undefined;\r
    let stopped = false;\r
    let stream = null;\r
    let timer = 0;\r
    let lost = 0;\r
    const smooth = { x: 0, y: 0, near: 1, ready: false };\r
    setStatus('loading');\r
\r
    const run = async () => {\r
      try {\r
        const faceapi = await loadFaceApi();\r
        await faceapi.nets.tinyFaceDetector.loadFromUri(modelsPath);\r
        if (stopped) return;\r
        stream = await navigator.mediaDevices.getUserMedia({\r
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },\r
          audio: false\r
        });\r
        if (stopped) {\r
          stream.getTracks().forEach(track => track.stop());\r
          return;\r
        }\r
        video.srcObject = stream;\r
        await video.play();\r
        setStatus('searching');\r
        const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.45 });\r
        const detect = async () => {\r
          if (stopped) return;\r
          let result = null;\r
          try {\r
            result = await faceapi.detectSingleFace(video, options);\r
          } catch {\r
            result = null;\r
          }\r
          if (stopped) return;\r
          const head = headRef.current;\r
          if (result && head) {\r
            const box = result.box;\r
            const vw = video.videoWidth || 1;\r
            const vh = video.videoHeight || 1;\r
            const x = -((box.x + box.width / 2) / vw - 0.5) * 2;\r
            const y = -((box.y + box.height / 2) / vh - 0.5) * 2;\r
            const near = 0.32 / Math.max(0.08, box.width / vw);\r
            const k = smooth.ready ? 0.45 : 1;\r
            smooth.x += (x - smooth.x) * k;\r
            smooth.y += (y - smooth.y) * k;\r
            smooth.near += (near - smooth.near) * k;\r
            smooth.ready = true;\r
            lost = 0;\r
            head.active = true;\r
            head.move(smooth.x, smooth.y, smooth.near);\r
            setStatus('tracking');\r
          } else if (head && ++lost > 12 && head.active) {\r
            head.active = false;\r
            smooth.ready = false;\r
            head.release();\r
            setStatus('searching');\r
          }\r
          timer = window.setTimeout(detect, 40);\r
        };\r
        detect();\r
      } catch {\r
        if (!stopped) setStatus('blocked');\r
      }\r
    };\r
    run();\r
\r
    return () => {\r
      stopped = true;\r
      window.clearTimeout(timer);\r
      stream?.getTracks().forEach(track => track.stop());\r
      video.srcObject = null;\r
      const head = headRef.current;\r
      if (head?.active) {\r
        head.active = false;\r
        head.release();\r
      }\r
    };\r
  }, [enableWebcam, modelsPath]);\r
\r
  return (\r
    <div ref={containerRef} className={\`grid-scan\${className ? \` \${className}\` : ''}\`} style={style} {...rest}>\r
      <canvas ref={canvasRef} className="grid-scan-canvas" aria-hidden="true" />\r
      {enableWebcam && (\r
        <div className={showPreview ? 'grid-scan-preview' : 'grid-scan-hidden'}>\r
          <video ref={videoRef} className="grid-scan-video" muted playsInline />\r
          {showPreview && <span className="grid-scan-status">{STATUS_LABELS[status]}</span>}\r
        </div>\r
      )}\r
    </div>\r
  );\r
};\r
\r
export default GridScan;\r
`,n=`.grid-scan {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.grid-scan-canvas {\r
  position: absolute;\r
  inset: 0;\r
  display: block;\r
  width: 100%;\r
  height: 100%;\r
}\r
\r
.grid-scan-preview {\r
  position: absolute;\r
  right: 12px;\r
  bottom: 12px;\r
  width: 168px;\r
  aspect-ratio: 4 / 3;\r
  overflow: hidden;\r
  border-radius: 14px;\r
  background: #0b0b0e;\r
  box-shadow:\r
    0 0 0 1px rgba(255, 255, 255, 0.08),\r
    0 8px 24px rgba(0, 0, 0, 0.35);\r
  pointer-events: none;\r
}\r
\r
.grid-scan-video {\r
  display: block;\r
  width: 100%;\r
  height: 100%;\r
  object-fit: cover;\r
  transform: scaleX(-1);\r
}\r
\r
.grid-scan-status {\r
  position: absolute;\r
  left: 8px;\r
  bottom: 8px;\r
  padding: 3px 8px;\r
  border-radius: 8px;\r
  background: rgba(10, 10, 12, 0.6);\r
  color: #ffffff;\r
  font:\r
    500 11px/1.4 system-ui,\r
    -apple-system,\r
    sans-serif;\r
  backdrop-filter: blur(8px);\r
}\r
\r
.grid-scan-hidden {\r
  position: absolute;\r
  width: 1px;\r
  height: 1px;\r
  overflow: hidden;\r
  opacity: 0;\r
  pointer-events: none;\r
}\r
`,e=`'use client';\r
\r
import { useEffect, useRef, useState } from 'react';\r
\r
const MAX_PINGS = 4;\r
const PING_LIFE = 2.4;\r
const INTRO_SECONDS = 2.2;\r
const EYE_DISTANCE = 1.25;\r
const FACE_API_URL = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js';\r
const MODELS_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@0.22.2/weights';\r
const STYLES = { solid: 0, dashed: 1, dotted: 2 };\r
\r
const VERTEX = \`#version 300 es\r
out vec2 vUv;\r
void main() {\r
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\r
  vUv = p;\r
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const ROOM = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform float uAspect;\r
uniform float uPixel;\r
uniform vec3 uEye;\r
uniform float uDepth;\r
uniform vec3 uCell;\r
uniform float uThick;\r
uniform float uDot;\r
uniform int uStyle;\r
uniform vec3 uLineColor;\r
uniform vec3 uScanColor;\r
uniform vec3 uCoreColor;\r
uniform float uFade;\r
uniform float uScanZ;\r
uniform float uScanDir;\r
uniform float uScanAlpha;\r
uniform float uScanWidth;\r
uniform float uTrail;\r
uniform float uReveal;\r
uniform float uPoints;\r
uniform float uReflect;\r
uniform float uHaze;\r
uniform float uShade;\r
uniform float uLight;\r
uniform vec4 uPing[4];\r
uniform float uPingAlpha[4];\r
uniform vec4 uHover;\r
uniform float uTime;\r
in vec2 vUv;\r
layout(location = 0) out vec4 outColor;\r
layout(location = 1) out vec4 outGlow;\r
\r
struct Light {\r
  float grid;\r
  float fade;\r
  float core;\r
  float trail;\r
  float spill;\r
  float ping;\r
  float wake;\r
  float reveal;\r
};\r
\r
float hash(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * 0.1031);\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.x + q.y) * q.z);\r
}\r
\r
vec2 hash2(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.103, 0.0973));\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.xx + q.yz) * q.zy);\r
}\r
\r
float lines(float across, float along, float period, float dash, float fa, float fb) {\r
  float u = across / period;\r
  float du = fa / period;\r
  float d = abs(fract(u + 0.5) - 0.5) / max(du, 1e-5);\r
  float dense = smoothstep(0.1, 0.4, du);\r
  if (uStyle == 2) {\r
    float c = along / dash * 5.0;\r
    float dc = fb / dash * 5.0;\r
    float e = abs(fract(c + 0.5) - 0.5) / max(dc, 1e-5);\r
    float cov = clamp(uThick + 1.0 - length(vec2(d, e)), 0.0, 1.0);\r
    float mean = min(1.0, 3.1416 * (uThick + 0.5) * (uThick + 0.5) * du * dc);\r
    return mix(cov, mean, max(dense, smoothstep(0.1, 0.4, dc)));\r
  }\r
  float cov = clamp(uThick + 0.5 - d, 0.0, 1.0);\r
  float mean = min(1.0, 2.0 * uThick * du);\r
  if (uStyle == 1) {\r
    float c = along / dash * 4.0;\r
    float dc = fb / dash * 4.0;\r
    float e = abs(fract(c + 0.5) - 0.5);\r
    float m = clamp((0.25 - e) / max(dc, 1e-5) + 0.5, 0.0, 1.0);\r
    cov *= mix(m, 0.5, smoothstep(0.1, 0.4, dc));\r
    mean *= 0.5;\r
  }\r
  return mix(cov, mean, dense);\r
}\r
\r
float depthFade(float z) {\r
  float n = clamp(z / uDepth, 0.0, 1.0);\r
  return mix(1.0, (exp(-3.0 * n) - 0.0497871) / 0.9502129, uFade);\r
}\r
\r
vec3 project(vec3 eye, vec3 o, int face, float plane) {\r
  vec3 d = o - eye;\r
  float t = face == 0 ? (plane - o.x) / d.x : (face == 1 ? (plane - o.y) / d.y : (plane - o.z) / d.z);\r
  return o + d * t;\r
}\r
\r
void trace(vec3 o, vec3 d, out int face, out float plane, out vec3 h) {\r
  float sx = d.x > 0.0 ? 0.5 * uAspect : -0.5 * uAspect;\r
  float sy = d.y > 0.0 ? 0.5 : -0.5;\r
  float tx = abs(d.x) > 1e-6 ? (sx - o.x) / d.x : 1e9;\r
  float ty = abs(d.y) > 1e-6 ? (sy - o.y) / d.y : 1e9;\r
  float t = (uDepth - o.z) / d.z;\r
  face = 2;\r
  plane = uDepth;\r
  if (tx < t) {\r
    face = 0;\r
    plane = sx;\r
    t = tx;\r
  }\r
  if (ty < t) {\r
    face = 1;\r
    plane = sy;\r
    t = ty;\r
  }\r
  h = o + d * t;\r
}\r
\r
vec2 faceUv(vec3 h, int face) {\r
  if (face == 0) return vec2(h.z, h.y + 0.5);\r
  if (face == 1) return vec2(h.x + 0.5 * uAspect, h.z);\r
  return vec2(h.x + 0.5 * uAspect, h.y + 0.5);\r
}\r
\r
Light illuminate(vec3 h, int face, vec2 uv, vec2 foot, float blur) {\r
  Light l;\r
  vec2 cell = face == 0 ? uCell.zy : (face == 1 ? uCell.xz : uCell.xy);\r
  vec2 f = foot * blur;\r
  float minor = max(lines(uv.x, uv.y, cell.x, cell.y, f.x, f.y), lines(uv.y, uv.x, cell.y, cell.x, f.y, f.x));\r
  float major = max(\r
    lines(uv.x, uv.y, cell.x * 4.0, cell.y, f.x, f.y),\r
    lines(uv.y, uv.x, cell.y * 4.0, cell.x, f.y, f.x)\r
  );\r
  l.grid = max(minor * 0.75, major) / blur;\r
  float z = h.z;\r
  l.fade = depthFade(z);\r
  l.reveal = smoothstep(uReveal, uReveal - 0.2, z);\r
  float zFoot = face == 0 ? f.x : (face == 1 ? f.y : 0.0);\r
  float width = max(uScanWidth, zFoot * 1.1);\r
  float dz = z - uScanZ;\r
  l.core = exp(-dz * dz / (width * width)) * (face == 2 ? 0.45 : 1.0) * uScanAlpha;\r
  float behind = -dz * uScanDir;\r
  l.trail = exp(-max(behind, 0.0) / uTrail) * smoothstep(-width, width * 0.5, behind) * uScanAlpha;\r
  l.spill = exp(-dz * dz / 0.05) * uScanAlpha;\r
  l.ping = 0.0;\r
  l.wake = 0.0;\r
  for (int i = 0; i < 4; i++) {\r
    float alpha = uPingAlpha[i];\r
    if (alpha <= 0.0) continue;\r
    float dist = length(h - uPing[i].xyz) - uPing[i].w;\r
    l.ping += exp(-dist * dist / 0.0012) * alpha;\r
    l.wake += exp(min(dist, 0.0) / 0.22) * smoothstep(0.03, -0.03, dist) * alpha;\r
  }\r
  return l;\r
}\r
\r
void over(inout vec4 acc, vec3 color, float alpha) {\r
  alpha = clamp(alpha, 0.0, 1.0);\r
  acc = vec4(color * alpha, alpha) + acc * (1.0 - alpha);\r
}\r
\r
void paint(inout vec4 color, inout float energy, Light l, float gain, float lift, float hover) {\r
  float base = l.grid * l.fade * l.reveal * lift;\r
  float far = l.fade * l.reveal * gain;\r
  float lit = l.grid * (l.core * 1.2 + l.trail * 0.75 + l.ping * 1.4 + l.wake * 0.5 + hover * 0.5) * far;\r
  float sheen = (l.core * 0.14 + l.spill * 0.05 + l.trail * 0.03 + l.ping * 0.2 + l.wake * 0.04) * far;\r
  float laser = (l.core + l.ping * 0.35) * far;\r
  over(color, uLineColor, base);\r
  over(color, uScanColor, sheen);\r
  over(color, uScanColor, lit);\r
  over(color, uCoreColor, laser * 0.9);\r
  energy += laser * 0.9 + lit * 0.5;\r
}\r
\r
void main() {\r
  vec3 p = vec3((vUv.x - 0.5) * uAspect, vUv.y - 0.5, 0.0);\r
  vec3 d = p - uEye;\r
  int face;\r
  float plane;\r
  vec3 h;\r
  trace(p, d, face, plane, h);\r
  vec3 hx = project(uEye, p + vec3(uPixel, 0.0, 0.0), face, plane);\r
  vec3 hy = project(uEye, p + vec3(0.0, uPixel, 0.0), face, plane);\r
  vec2 uv = faceUv(h, face);\r
  vec2 ux = faceUv(hx, face) - uv;\r
  vec2 uy = faceUv(hy, face) - uv;\r
  vec2 foot = vec2(length(vec2(ux.x, uy.x)), length(vec2(ux.y, uy.y)));\r
  Light l = illuminate(h, face, uv, foot, 1.0);\r
\r
  vec4 color = vec4(0.0);\r
  float energy = 0.0;\r
\r
  if (uShade > 0.0) {\r
    vec2 gaps = face == 0\r
      ? vec2(0.5 - abs(h.y), uDepth - h.z)\r
      : (face == 1 ? vec2(0.5 * uAspect - abs(h.x), uDepth - h.z) : vec2(0.5 * uAspect - abs(h.x), 0.5 - abs(h.y)));\r
    vec2 crease = 1.0 - exp(-max(gaps, 0.0) / 0.16);\r
    float occlusion = crease.x * crease.y;\r
    float lamp = 1.0 / (1.0 + h.z * h.z * 0.9);\r
    float tilt = face == 1 ? (plane < 0.0 ? 1.1 : 0.85) : (face == 2 ? 0.8 : 1.0);\r
    float glowSpill = (l.spill * 0.5 + l.trail * 0.12) * l.reveal * l.fade;\r
    if (uLight > 0.5) {\r
      float shadow = (1.0 - lamp * tilt) * 0.09 + (1.0 - occlusion) * 0.2;\r
      over(color, vec3(0.0), shadow * uShade * l.reveal * l.fade);\r
    } else {\r
      over(color, vec3(1.0), lamp * tilt * occlusion * 0.11 * uShade * l.reveal * l.fade);\r
    }\r
    over(color, uScanColor, glowSpill * uShade * occlusion * 0.35);\r
  }\r
\r
  if (face == 1 && plane < 0.0 && uReflect > 0.0) {\r
    vec3 mirror = vec3(uEye.x, -1.0 - uEye.y, uEye.z);\r
    vec3 r = h - mirror;\r
    int face2;\r
    float plane2;\r
    vec3 h2;\r
    trace(h, r, face2, plane2, h2);\r
    vec2 uv2 = faceUv(h2, face2);\r
    vec2 ux2 = faceUv(project(mirror, hx, face2, plane2), face2) - uv2;\r
    vec2 uy2 = faceUv(project(mirror, hy, face2, plane2), face2) - uv2;\r
    vec2 foot2 = vec2(length(vec2(ux2.x, uy2.x)), length(vec2(ux2.y, uy2.y)));\r
    float travel = length(h2 - h);\r
    Light m = illuminate(h2, face2, uv2, foot2, 1.0 + travel * 4.0);\r
    m.reveal *= l.reveal;\r
    float grazing = 1.0 - normalize(r).y;\r
    float gain = (0.3 + 0.7 * grazing * grazing * grazing * grazing) * uReflect * exp(-travel * 1.1) * (uLight > 0.5 ? 0.6 : 1.0);\r
    float reflected = 0.0;\r
    paint(color, reflected, m, gain, 0.0, 0.0);\r
    energy += reflected * 0.6;\r
  }\r
\r
  vec3 near = h - uHover.xyz;\r
  float hover = exp(-dot(near, near) / 0.08) * uHover.w;\r
  paint(color, energy, l, 1.0, 1.0, hover);\r
\r
  if (uPoints > 0.5) {\r
    vec2 cell = face == 0 ? uCell.zy : (face == 1 ? uCell.xz : uCell.xy);\r
    vec2 spacing = cell / 2.5;\r
    vec2 q = uv / spacing;\r
    vec2 id = floor(q);\r
    vec2 seed = id + vec2(float(face) * 13.7 + plane * 5.3, float(face) * 3.1);\r
    vec2 delta = (q - id - (0.2 + 0.6 * hash2(seed))) * spacing;\r
    float det = ux.x * uy.y - ux.y * uy.x;\r
    vec2 s = vec2(delta.x * uy.y - delta.y * uy.x, ux.x * delta.y - ux.y * delta.x) / det;\r
    float radius = uDot * mix(1.0, 0.55, clamp(h.z / uDepth, 0.0, 1.0));\r
    float spot = clamp(radius + 0.5 - length(s), 0.0, 1.0);\r
    float gap = min(spacing.x / foot.x, spacing.y / foot.y);\r
    float r = hash(seed + 7.7);\r
    float flicker = 0.75 + 0.25 * sin(uTime * (3.0 + r * 5.0) + r * 40.0);\r
    float dots = spot * smoothstep(5.0, 10.0, gap) * smoothstep(0.25, 0.6, r) * (0.3 + 0.7 * r * r) * flicker;\r
    float hot = l.core * 2.5 + l.ping * 1.6;\r
    float warm = l.trail * l.trail * 1.3 + l.wake * 0.6 + hover * 1.3;\r
    float spark = dots * (hot + warm) * l.fade * l.reveal;\r
    over(color, mix(uScanColor, uCoreColor, clamp(hot / max(hot + warm, 1e-4), 0.0, 1.0)), spark);\r
    energy += spark * 0.9;\r
  }\r
\r
  if (uHaze > 0.0 && uScanAlpha > 0.0 && uScanZ > 0.0 && h.z > uScanZ) {\r
    vec3 c = p + d * (uScanZ / d.z);\r
    float grain = hash(floor(c.xy * 180.0) + floor(uTime * 24.0) * 7.0);\r
    float edge = min(0.5 * uAspect - abs(c.x), 0.5 - abs(c.y));\r
    float rim = exp(-edge / 0.06);\r
    float veil = uHaze * uScanAlpha * (0.45 + 0.9 * grain) * (0.55 + rim * 1.6);\r
    over(color, uScanColor, veil * depthFade(uScanZ) * l.reveal);\r
  }\r
\r
  energy = clamp(energy, 0.0, 1.0);\r
  outColor = color;\r
  outGlow = vec4(uScanColor * energy, energy);\r
}\`;\r
\r
const DOWN = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uSource;\r
uniform vec2 uTexel;\r
in vec2 vUv;\r
out vec4 outColor;\r
void main() {\r
  vec2 o = uTexel;\r
  outColor = 0.25 * (\r
    texture(uSource, vUv + vec2(-o.x, -o.y)) +\r
    texture(uSource, vUv + vec2(o.x, -o.y)) +\r
    texture(uSource, vUv + vec2(-o.x, o.y)) +\r
    texture(uSource, vUv + vec2(o.x, o.y))\r
  );\r
}\`;\r
\r
const BLUR = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uSource;\r
uniform vec2 uStep;\r
in vec2 vUv;\r
out vec4 outColor;\r
void main() {\r
  vec4 sum = texture(uSource, vUv) * 0.1964825501511404;\r
  sum += (texture(uSource, vUv + uStep * 1.411764705882353) + texture(uSource, vUv - uStep * 1.411764705882353)) * 0.2969069646728344;\r
  sum += (texture(uSource, vUv + uStep * 3.2941176470588234) + texture(uSource, vUv - uStep * 3.2941176470588234)) * 0.09447039785044732;\r
  sum += (texture(uSource, vUv + uStep * 5.176470588235294) + texture(uSource, vUv - uStep * 5.176470588235294)) * 0.010381362401148057;\r
  outColor = sum;\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uScene;\r
uniform sampler2D uBloom;\r
uniform float uGlow;\r
in vec2 vUv;\r
out vec4 outColor;\r
float hash(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * 0.1031);\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.x + q.y) * q.z);\r
}\r
void main() {\r
  vec4 scene = texture(uScene, vUv);\r
  vec4 bloom = texture(uBloom, vUv) * uGlow;\r
  bloom.a = min(bloom.a, 1.0);\r
  bloom.rgb = min(bloom.rgb, vec3(bloom.a));\r
  vec4 color = scene + bloom * (1.0 - scene.a);\r
  float noise = (hash(gl_FragCoord.xy) - 0.5) / 255.0;\r
  color.a = clamp(color.a + noise, 0.0, 1.0);\r
  color.rgb = clamp(color.rgb + noise, vec3(0.0), vec3(color.a));\r
  outColor = color;\r
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
const createTarget = gl => {\r
  const texture = gl.createTexture();\r
  gl.bindTexture(gl.TEXTURE_2D, texture);\r
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
  return { texture, width: 0, height: 0 };\r
};\r
\r
const sizeTarget = (gl, target, width, height) => {\r
  if (target.width === width && target.height === height) return;\r
  target.width = width;\r
  target.height = height;\r
  gl.bindTexture(gl.TEXTURE_2D, target.texture);\r
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
};\r
\r
let faceApiLoader = null;\r
\r
const loadFaceApi = () => {\r
  if (window.faceapi) return Promise.resolve(window.faceapi);\r
  if (!faceApiLoader) {\r
    faceApiLoader = new Promise((resolve, reject) => {\r
      const script = document.createElement('script');\r
      script.src = FACE_API_URL;\r
      script.async = true;\r
      script.onload = () => (window.faceapi ? resolve(window.faceapi) : reject(new Error('face-api.js')));\r
      script.onerror = () => {\r
        faceApiLoader = null;\r
        reject(new Error('face-api.js'));\r
      };\r
      document.head.appendChild(script);\r
    });\r
  }\r
  return faceApiLoader;\r
};\r
\r
const STATUS_LABELS = {\r
  loading: 'Loading face tracking',\r
  searching: 'Looking for a face',\r
  tracking: 'Tracking',\r
  blocked: 'Camera unavailable'\r
};\r
\r
export const GridScan = ({\r
  linesColor,\r
  scanColor,\r
  cells = 8,\r
  lineThickness = 1,\r
  lineStyle = 'solid',\r
  depth = 3,\r
  depthFade = 0.6,\r
  parallax = 1,\r
  points = true,\r
  reflection = 0.35,\r
  shading = 0.7,\r
  scanDirection = 'forward',\r
  scanDuration = 2.4,\r
  scanDelay = 1.6,\r
  scanWidth = 1,\r
  trail = 0.5,\r
  glow = 0.6,\r
  autoScan = true,\r
  interactive = true,\r
  clickEffect = 'ping',\r
  enableWebcam = false,\r
  showPreview = false,\r
  modelsPath = MODELS_URL,\r
  enableGyro = false,\r
  intro = true,\r
  lightMode = false,\r
  dpr,\r
  className = '',\r
  style,\r
  ...rest\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const videoRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const headRef = useRef(null);\r
  const [status, setStatus] = useState('loading');\r
  const settings = {\r
    linesColor: linesColor ?? (lightMode ? '#d4d4d8' : '#4d4757'),\r
    scanColor: scanColor ?? (lightMode ? '#0284c7' : '#7dd3fc'),\r
    cells: clamp(cells, 2, 40),\r
    thickness: clamp(lineThickness, 0.5, 4),\r
    style: STYLES[lineStyle] ?? 0,\r
    depth: clamp(depth, 0.5, 12),\r
    depthFade: clamp(depthFade, 0, 1),\r
    parallax: clamp(parallax, 0, 3),\r
    points,\r
    reflection: clamp(reflection, 0, 1),\r
    shading: clamp(shading, 0, 1),\r
    direction: scanDirection,\r
    duration: clamp(scanDuration, 0.3, 20),\r
    delay: clamp(scanDelay, 0, 30),\r
    scanWidth: clamp(scanWidth, 0.2, 5),\r
    trail: clamp(trail, 0, 1),\r
    glow: clamp(glow, 0, 1.5),\r
    autoScan,\r
    interactive,\r
    clickEffect,\r
    enableGyro,\r
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
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const room = link(gl, ROOM);\r
    const down = link(gl, DOWN);\r
    const blur = link(gl, BLUR);\r
    const composite = link(gl, COMPOSITE);\r
    if (!room || !down || !blur || !composite) return undefined;\r
    const vao = gl.createVertexArray();\r
    const scene = createTarget(gl);\r
    const light = createTarget(gl);\r
    const bloomA = createTarget(gl);\r
    const bloomB = createTarget(gl);\r
    const sceneBuffer = gl.createFramebuffer();\r
    const bloomBufferA = gl.createFramebuffer();\r
    const bloomBufferB = gl.createFramebuffer();\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const colorCache = new Map();\r
    const parse = value => {\r
      const key = String(value);\r
      const cached = colorCache.get(key);\r
      if (cached) return cached;\r
      let rgb = [1, 1, 1];\r
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
    const eye = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, f: EYE_DISTANCE, vf: 0, tf: EYE_DISTANCE };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const look = { x: 0, y: 0, held: false };\r
    const tilt = { gamma: 0, beta: 0, ready: false, asked: false };\r
    const hover = { x: 0, y: 0, z: 0, strength: 0, ready: false };\r
    const scan = { z: 0, dir: 1, alpha: 0, start: 0, sweeps: 0, waiting: false };\r
    const pings = [];\r
    const pingData = new Float32Array(MAX_PINGS * 4);\r
    const pingAlpha = new Float32Array(MAX_PINGS);\r
    let time = 0;\r
    let introClock = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let leaveTimer = 0;\r
\r
    const roomSize = () => {\r
      const s = settingsRef.current;\r
      const aspect = view.width / view.height;\r
      const cy = 1 / Math.round(s.cells);\r
      const cx = aspect / Math.max(1, Math.round(aspect / cy));\r
      const roomDepth = Math.max(cy, Math.round(s.depth / cy) * cy);\r
      return { aspect, cx, cy, roomDepth };\r
    };\r
\r
    const castRay = (u, v) => {\r
      const { aspect, roomDepth } = roomSize();\r
      const px = (u - 0.5) * aspect;\r
      const py = v - 0.5;\r
      const dx = px - eye.x;\r
      const dy = py - eye.y;\r
      const dz = eye.f;\r
      const sx = dx > 0 ? 0.5 * aspect : -0.5 * aspect;\r
      const sy = dy > 0 ? 0.5 : -0.5;\r
      let t = roomDepth / dz;\r
      if (Math.abs(dx) > 1e-6) t = Math.min(t, (sx - px) / dx);\r
      if (Math.abs(dy) > 1e-6) t = Math.min(t, (sy - py) / dy);\r
      return { x: px + dx * t, y: py + dy * t, z: dz * t };\r
    };\r
\r
    const startSweep = s => {\r
      scan.dir = s.direction === 'backward' || (s.direction === 'pingpong' && scan.sweeps % 2 === 1) ? -1 : 1;\r
      scan.start = time;\r
      scan.waiting = false;\r
      scan.sweeps += 1;\r
    };\r
\r
    const updateScan = (s, roomDepth) => {\r
      if (introClock < 1) {\r
        const k = introClock;\r
        scan.dir = 1;\r
        scan.z = k * (roomDepth + 0.4) - 0.2;\r
        scan.alpha = Math.min(1, k * 6) * (1 - Math.max(0, k - 0.85) / 0.15);\r
        return;\r
      }\r
      if (scan.sweeps === 0 && !scan.waiting) {\r
        scan.waiting = true;\r
        scan.start = time;\r
        scan.alpha = 0;\r
      }\r
      if (scan.waiting) {\r
        scan.alpha = 0;\r
        if (s.autoScan && !reduce && time - scan.start >= s.delay) startSweep(s);\r
        return;\r
      }\r
      const k = (time - scan.start) / s.duration;\r
      if (k >= 1) {\r
        scan.waiting = true;\r
        scan.start = time;\r
        scan.alpha = 0;\r
        return;\r
      }\r
      const travel = k * (roomDepth + 0.3) - 0.15;\r
      scan.z = scan.dir > 0 ? travel : roomDepth - travel;\r
      scan.alpha = Math.min(1, k / 0.12) * Math.min(1, (1 - k) / 0.12);\r
    };\r
\r
    const updateEye = dt => {\r
      const steps = Math.max(1, Math.ceil(dt / (1 / 120)));\r
      const h = dt / steps;\r
      for (let i = 0; i < steps; i++) {\r
        eye.vx += ((eye.tx - eye.x) * 42 - eye.vx * 11) * h;\r
        eye.vy += ((eye.ty - eye.y) * 42 - eye.vy * 11) * h;\r
        eye.vf += ((eye.tf - eye.f) * 42 - eye.vf * 11) * h;\r
        eye.x += eye.vx * h;\r
        eye.y += eye.vy * h;\r
        eye.f += eye.vf * h;\r
      }\r
    };\r
\r
    const setLook = (nx, ny, held) => {\r
      look.x = clamp(nx, -1, 1);\r
      look.y = clamp(ny, -1, 1);\r
      look.held = held;\r
    };\r
\r
    const aimEye = s => {\r
      const aspect = view.width / view.height;\r
      const drift = reduce ? 0 : 1;\r
      const nx = look.held ? look.x : (Math.sin(time * 0.21) * 0.2 + Math.sin(time * 0.083 + 1.3) * 0.12) * drift;\r
      const ny = look.held ? look.y : Math.sin(time * 0.17 + 2.1) * 0.16 * drift;\r
      eye.tx = nx * s.parallax * 0.22 * aspect;\r
      eye.ty = ny * s.parallax * 0.22;\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      view.width = Math.max(1, container.clientWidth);\r
      view.height = Math.max(1, container.clientHeight);\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(view.width * view.ratio));\r
      canvas.height = Math.max(1, Math.round(view.height * view.ratio));\r
      sizeTarget(gl, scene, canvas.width, canvas.height);\r
      sizeTarget(gl, light, canvas.width, canvas.height);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, sceneBuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, scene.texture, 0);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, light.texture, 0);\r
      const bw = Math.max(1, Math.round(canvas.width / 4));\r
      const bh = Math.max(1, Math.round(canvas.height / 4));\r
      sizeTarget(gl, bloomA, bw, bh);\r
      sizeTarget(gl, bloomB, bw, bh);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, bloomBufferA);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, bloomA.texture, 0);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, bloomBufferB);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, bloomB.texture, 0);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      draw();\r
      wake();\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      const { aspect, cx, cy, roomDepth } = roomSize();\r
      const lineRgb = parse(s.linesColor);\r
      const scanRgb = parse(s.scanColor);\r
      const coreRgb = s.lightMode ? scanRgb : scanRgb.map(c => c + (1 - c) * 0.65);\r
      const ru = room.uniforms;\r
      gl.bindVertexArray(vao);\r
      gl.disable(gl.BLEND);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, sceneBuffer);\r
      gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(room.program);\r
      gl.uniform1f(ru.uAspect, aspect);\r
      gl.uniform1f(ru.uPixel, 1 / canvas.height);\r
      gl.uniform3f(ru.uEye, eye.x, eye.y, -eye.f);\r
      gl.uniform1f(ru.uDepth, roomDepth);\r
      gl.uniform3f(ru.uCell, cx, cy, cy);\r
      gl.uniform1f(ru.uThick, s.thickness * view.ratio * 0.5);\r
      gl.uniform1f(ru.uDot, 1.8 * view.ratio);\r
      gl.uniform1i(ru.uStyle, s.style);\r
      gl.uniform3fv(ru.uLineColor, lineRgb);\r
      gl.uniform3fv(ru.uScanColor, scanRgb);\r
      gl.uniform3fv(ru.uCoreColor, coreRgb);\r
      gl.uniform1f(ru.uFade, s.depthFade);\r
      gl.uniform1f(ru.uScanZ, scan.z);\r
      gl.uniform1f(ru.uScanDir, scan.dir);\r
      gl.uniform1f(ru.uScanAlpha, scan.alpha);\r
      gl.uniform1f(ru.uScanWidth, 0.006 * s.scanWidth);\r
      gl.uniform1f(ru.uTrail, 0.04 + s.trail * 1.1);\r
      gl.uniform1f(ru.uReveal, introClock < 1 ? scan.z + 0.05 : 1e4);\r
      gl.uniform1f(ru.uPoints, s.points ? 1 : 0);\r
      gl.uniform1f(ru.uReflect, s.reflection);\r
      gl.uniform1f(ru.uHaze, s.lightMode ? 0.03 : 0.05);\r
      gl.uniform1f(ru.uShade, s.shading);\r
      gl.uniform1f(ru.uLight, s.lightMode ? 1 : 0);\r
      gl.uniform4fv(ru.uPing, pingData);\r
      gl.uniform1fv(ru.uPingAlpha, pingAlpha);\r
      gl.uniform4f(ru.uHover, hover.x, hover.y, hover.z, hover.strength);\r
      gl.uniform1f(ru.uTime, time);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      const glowing = s.glow > 0;\r
      if (glowing) {\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, bloomBufferA);\r
        gl.viewport(0, 0, bloomA.width, bloomA.height);\r
        gl.useProgram(down.program);\r
        gl.activeTexture(gl.TEXTURE0);\r
        gl.bindTexture(gl.TEXTURE_2D, light.texture);\r
        gl.uniform1i(down.uniforms.uSource, 0);\r
        gl.uniform2f(down.uniforms.uTexel, 1 / light.width, 1 / light.height);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
        const spread = (2.2 * view.ratio) / 2;\r
        gl.useProgram(blur.program);\r
        gl.uniform1i(blur.uniforms.uSource, 0);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, bloomBufferB);\r
        gl.bindTexture(gl.TEXTURE_2D, bloomA.texture);\r
        gl.uniform2f(blur.uniforms.uStep, spread / bloomA.width, 0);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, bloomBufferA);\r
        gl.bindTexture(gl.TEXTURE_2D, bloomB.texture);\r
        gl.uniform2f(blur.uniforms.uStep, 0, spread / bloomA.height);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      }\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(composite.program);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, scene.texture);\r
      gl.uniform1i(composite.uniforms.uScene, 0);\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.bindTexture(gl.TEXTURE_2D, bloomA.texture);\r
      gl.uniform1i(composite.uniforms.uBloom, 1);\r
      gl.uniform1f(composite.uniforms.uGlow, glowing ? s.glow * (s.lightMode ? 0.8 : 1.6) : 0);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.activeTexture(gl.TEXTURE0);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.001, 0.05) : 1 / 60;\r
      last = now;\r
      time += dt;\r
      if (introClock < 1) introClock = Math.min(1, introClock + dt / INTRO_SECONDS);\r
      const { roomDepth } = roomSize();\r
      updateScan(s, roomDepth);\r
      aimEye(s);\r
      updateEye(dt);\r
\r
      const aim = s.interactive && pointer.inside && !reduce ? 1 : 0;\r
      if (aim) {\r
        const target = castRay(pointer.x, pointer.y);\r
        if (!hover.ready) Object.assign(hover, target, { ready: true });\r
        const follow = 1 - Math.exp(-dt / 0.08);\r
        hover.x += (target.x - hover.x) * follow;\r
        hover.y += (target.y - hover.y) * follow;\r
        hover.z += (target.z - hover.z) * follow;\r
      }\r
      hover.strength += (aim - hover.strength) * (1 - Math.exp(-dt / 0.25));\r
      if (!aim && hover.strength < 0.01) hover.ready = false;\r
\r
      for (let i = pings.length - 1; i >= 0; i--) {\r
        pings[i].age += dt;\r
        if (pings[i].age > PING_LIFE) pings.splice(i, 1);\r
      }\r
      for (let i = 0; i < MAX_PINGS; i++) {\r
        const ping = pings[i];\r
        if (!ping) {\r
          pingAlpha[i] = 0;\r
          continue;\r
        }\r
        const k = ping.age / PING_LIFE;\r
        pingData.set([ping.x, ping.y, ping.z, ping.age * 1.15], i * 4);\r
        pingAlpha[i] = Math.min(1, ping.age / 0.05) * (1 - k) * (1 - k);\r
      }\r
\r
      draw();\r
\r
      const settling =\r
        Math.abs(eye.tx - eye.x) + Math.abs(eye.ty - eye.y) + Math.abs(eye.tf - eye.f) > 1e-4 ||\r
        Math.abs(eye.vx) + Math.abs(eye.vy) + Math.abs(eye.vf) > 1e-4;\r
      const busy =\r
        introClock < 1 ||\r
        (!reduce && s.autoScan) ||\r
        !scan.waiting ||\r
        pings.length > 0 ||\r
        settling ||\r
        hover.strength > 0.002 ||\r
        (!reduce && s.parallax > 0 && !look.held) ||\r
        (s.points && !reduce && scan.alpha > 0);\r
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
      const u = (event.clientX - rect.left) / Math.max(1, rect.width);\r
      const v = 1 - (event.clientY - rect.top) / Math.max(1, rect.height);\r
      return { u, v, inside: u >= 0 && u <= 1 && v >= 0 && v <= 1 };\r
    };\r
\r
    const onPointerMove = event => {\r
      const s = settingsRef.current;\r
      const { u, v, inside } = locate(event);\r
      pointer.x = u;\r
      pointer.y = v;\r
      const was = pointer.inside;\r
      pointer.inside = inside;\r
      if (inside) {\r
        window.clearTimeout(leaveTimer);\r
        leaveTimer = 0;\r
        if (!headRef.current?.active && s.interactive && !reduce) setLook(u * 2 - 1, v * 2 - 1, true);\r
        wake();\r
      } else if (was && !leaveTimer) {\r
        leaveTimer = window.setTimeout(() => {\r
          leaveTimer = 0;\r
          if (!headRef.current?.active) look.held = false;\r
          wake();\r
        }, 220);\r
        wake();\r
      }\r
    };\r
\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      const { u, v, inside } = locate(event);\r
      if (!inside || reduce || s.clickEffect === 'none') return;\r
      if (s.clickEffect === 'scan') {\r
        if (introClock >= 1) startSweep(s);\r
      } else {\r
        const hit = castRay(u, v);\r
        pings.unshift({ ...hit, age: 0 });\r
        if (pings.length > MAX_PINGS) pings.pop();\r
      }\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      if (!headRef.current?.active) look.held = false;\r
      wake();\r
    };\r
\r
    const onOrientation = event => {\r
      const s = settingsRef.current;\r
      if (!s.enableGyro || headRef.current?.active || reduce || event.gamma === null || event.beta === null) return;\r
      if (!tilt.ready) Object.assign(tilt, { gamma: event.gamma, beta: event.beta, ready: true });\r
      setLook((event.gamma - tilt.gamma) / 25, (event.beta - tilt.beta) / -25, true);\r
      wake();\r
    };\r
\r
    const onClick = () => {\r
      const s = settingsRef.current;\r
      const request = window.DeviceOrientationEvent?.requestPermission;\r
      if (!s.enableGyro || tilt.asked || typeof request !== 'function') return;\r
      tilt.asked = true;\r
      request.call(window.DeviceOrientationEvent).catch(() => {});\r
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
    window.addEventListener('deviceorientation', onOrientation);\r
    window.addEventListener('click', onClick);\r
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    headRef.current = {\r
      active: false,\r
      move: (nx, ny, near) => {\r
        if (reduce) return;\r
        setLook(nx * 1.3, ny * 1.3, true);\r
        eye.tf = EYE_DISTANCE * clamp(near, 0.6, 1.6);\r
        wake();\r
      },\r
      release: () => {\r
        eye.tf = EYE_DISTANCE;\r
        look.held = false;\r
        wake();\r
      }\r
    };\r
    resize();\r
    wakeRef.current = wake;\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      window.clearTimeout(leaveTimer);\r
      wakeRef.current = null;\r
      headRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('deviceorientation', onOrientation);\r
      window.removeEventListener('click', onClick);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      [scene, light, bloomA, bloomB].forEach(target => gl.deleteTexture(target.texture));\r
      [sceneBuffer, bloomBufferA, bloomBufferB].forEach(buffer => gl.deleteFramebuffer(buffer));\r
      gl.deleteVertexArray(vao);\r
      [room, down, blur, composite].forEach(item => gl.deleteProgram(item.program));\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  useEffect(() => {\r
    if (!enableWebcam) return undefined;\r
    const video = videoRef.current;\r
    if (!video) return undefined;\r
    let stopped = false;\r
    let stream = null;\r
    let timer = 0;\r
    let lost = 0;\r
    const smooth = { x: 0, y: 0, near: 1, ready: false };\r
    setStatus('loading');\r
\r
    const run = async () => {\r
      try {\r
        const faceapi = await loadFaceApi();\r
        await faceapi.nets.tinyFaceDetector.loadFromUri(modelsPath);\r
        if (stopped) return;\r
        stream = await navigator.mediaDevices.getUserMedia({\r
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },\r
          audio: false\r
        });\r
        if (stopped) {\r
          stream.getTracks().forEach(track => track.stop());\r
          return;\r
        }\r
        video.srcObject = stream;\r
        await video.play();\r
        setStatus('searching');\r
        const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.45 });\r
        const detect = async () => {\r
          if (stopped) return;\r
          let result = null;\r
          try {\r
            result = await faceapi.detectSingleFace(video, options);\r
          } catch {\r
            result = null;\r
          }\r
          if (stopped) return;\r
          const head = headRef.current;\r
          if (result && head) {\r
            const box = result.box;\r
            const vw = video.videoWidth || 1;\r
            const vh = video.videoHeight || 1;\r
            const x = -((box.x + box.width / 2) / vw - 0.5) * 2;\r
            const y = -((box.y + box.height / 2) / vh - 0.5) * 2;\r
            const near = 0.32 / Math.max(0.08, box.width / vw);\r
            const k = smooth.ready ? 0.45 : 1;\r
            smooth.x += (x - smooth.x) * k;\r
            smooth.y += (y - smooth.y) * k;\r
            smooth.near += (near - smooth.near) * k;\r
            smooth.ready = true;\r
            lost = 0;\r
            head.active = true;\r
            head.move(smooth.x, smooth.y, smooth.near);\r
            setStatus('tracking');\r
          } else if (head && ++lost > 12 && head.active) {\r
            head.active = false;\r
            smooth.ready = false;\r
            head.release();\r
            setStatus('searching');\r
          }\r
          timer = window.setTimeout(detect, 40);\r
        };\r
        detect();\r
      } catch {\r
        if (!stopped) setStatus('blocked');\r
      }\r
    };\r
    run();\r
\r
    return () => {\r
      stopped = true;\r
      window.clearTimeout(timer);\r
      stream?.getTracks().forEach(track => track.stop());\r
      video.srcObject = null;\r
      const head = headRef.current;\r
      if (head?.active) {\r
        head.active = false;\r
        head.release();\r
      }\r
    };\r
  }, [enableWebcam, modelsPath]);\r
\r
  return (\r
    <div\r
      ref={containerRef}\r
      className={['relative h-full w-full overflow-hidden', className].filter(Boolean).join(' ')}\r
      style={style}\r
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
      {enableWebcam && (\r
        <div\r
          className={\r
            showPreview\r
              ? 'pointer-events-none absolute bottom-3 right-3 aspect-[4/3] w-[168px] overflow-hidden rounded-[14px] bg-[#0b0b0e] shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_24px_rgba(0,0,0,0.35)]'\r
              : 'pointer-events-none absolute h-px w-px overflow-hidden opacity-0'\r
          }\r
        >\r
          <video ref={videoRef} className="block h-full w-full -scale-x-100 object-cover" muted playsInline />\r
          {showPreview && (\r
            <span className="absolute bottom-2 left-2 rounded-lg bg-[rgba(10,10,12,0.6)] px-2 py-[3px] font-sans text-[11px] font-medium leading-[1.4] text-white backdrop-blur-sm">\r
              {STATUS_LABELS[status]}\r
            </span>\r
          )}\r
        </div>\r
      )}\r
    </div>\r
  );\r
};\r
\r
export default GridScan;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, useState, type CSSProperties, type HTMLAttributes } from 'react';\r
import './GridScan.css';\r
\r
export type GridScanLineStyle = 'solid' | 'dashed' | 'dotted';\r
\r
export type GridScanDirection = 'forward' | 'backward' | 'pingpong';\r
\r
export type GridScanClickEffect = 'ping' | 'scan' | 'none';\r
\r
export interface GridScanProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {\r
  linesColor?: string;\r
  scanColor?: string;\r
  cells?: number;\r
  lineThickness?: number;\r
  lineStyle?: GridScanLineStyle;\r
  depth?: number;\r
  depthFade?: number;\r
  parallax?: number;\r
  points?: boolean;\r
  reflection?: number;\r
  shading?: number;\r
  scanDirection?: GridScanDirection;\r
  scanDuration?: number;\r
  scanDelay?: number;\r
  scanWidth?: number;\r
  trail?: number;\r
  glow?: number;\r
  autoScan?: boolean;\r
  interactive?: boolean;\r
  clickEffect?: GridScanClickEffect;\r
  enableWebcam?: boolean;\r
  showPreview?: boolean;\r
  modelsPath?: string;\r
  enableGyro?: boolean;\r
  intro?: boolean;\r
  lightMode?: boolean;\r
  dpr?: number;\r
  style?: CSSProperties;\r
}\r
\r
type Settings = {\r
  linesColor: string;\r
  scanColor: string;\r
  cells: number;\r
  thickness: number;\r
  style: number;\r
  depth: number;\r
  depthFade: number;\r
  parallax: number;\r
  points: boolean;\r
  reflection: number;\r
  shading: number;\r
  direction: GridScanDirection;\r
  duration: number;\r
  delay: number;\r
  scanWidth: number;\r
  trail: number;\r
  glow: number;\r
  autoScan: boolean;\r
  interactive: boolean;\r
  clickEffect: GridScanClickEffect;\r
  enableGyro: boolean;\r
  intro: boolean;\r
  lightMode: boolean;\r
  dpr?: number;\r
};\r
\r
type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };\r
\r
type Target = { texture: WebGLTexture | null; width: number; height: number };\r
\r
type Ping = { x: number; y: number; z: number; age: number };\r
\r
type Head = { active: boolean; move: (nx: number, ny: number, near: number) => void; release: () => void };\r
\r
type Status = 'loading' | 'searching' | 'tracking' | 'blocked';\r
\r
type FaceApi = {\r
  nets: { tinyFaceDetector: { loadFromUri: (url: string) => Promise<void> } };\r
  TinyFaceDetectorOptions: new (options: { inputSize: number; scoreThreshold: number }) => unknown;\r
  detectSingleFace: (\r
    input: HTMLVideoElement,\r
    options: unknown\r
  ) => PromiseLike<{ box: { x: number; y: number; width: number; height: number } } | undefined>;\r
};\r
\r
type FaceScope = { faceapi?: FaceApi };\r
\r
const MAX_PINGS = 4;\r
const PING_LIFE = 2.4;\r
const INTRO_SECONDS = 2.2;\r
const EYE_DISTANCE = 1.25;\r
const FACE_API_URL = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js';\r
const MODELS_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@0.22.2/weights';\r
const STYLES: Record<string, number> = { solid: 0, dashed: 1, dotted: 2 };\r
\r
const VERTEX = \`#version 300 es\r
out vec2 vUv;\r
void main() {\r
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\r
  vUv = p;\r
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const ROOM = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform float uAspect;\r
uniform float uPixel;\r
uniform vec3 uEye;\r
uniform float uDepth;\r
uniform vec3 uCell;\r
uniform float uThick;\r
uniform float uDot;\r
uniform int uStyle;\r
uniform vec3 uLineColor;\r
uniform vec3 uScanColor;\r
uniform vec3 uCoreColor;\r
uniform float uFade;\r
uniform float uScanZ;\r
uniform float uScanDir;\r
uniform float uScanAlpha;\r
uniform float uScanWidth;\r
uniform float uTrail;\r
uniform float uReveal;\r
uniform float uPoints;\r
uniform float uReflect;\r
uniform float uHaze;\r
uniform float uShade;\r
uniform float uLight;\r
uniform vec4 uPing[4];\r
uniform float uPingAlpha[4];\r
uniform vec4 uHover;\r
uniform float uTime;\r
in vec2 vUv;\r
layout(location = 0) out vec4 outColor;\r
layout(location = 1) out vec4 outGlow;\r
\r
struct Light {\r
  float grid;\r
  float fade;\r
  float core;\r
  float trail;\r
  float spill;\r
  float ping;\r
  float wake;\r
  float reveal;\r
};\r
\r
float hash(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * 0.1031);\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.x + q.y) * q.z);\r
}\r
\r
vec2 hash2(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.103, 0.0973));\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.xx + q.yz) * q.zy);\r
}\r
\r
float lines(float across, float along, float period, float dash, float fa, float fb) {\r
  float u = across / period;\r
  float du = fa / period;\r
  float d = abs(fract(u + 0.5) - 0.5) / max(du, 1e-5);\r
  float dense = smoothstep(0.1, 0.4, du);\r
  if (uStyle == 2) {\r
    float c = along / dash * 5.0;\r
    float dc = fb / dash * 5.0;\r
    float e = abs(fract(c + 0.5) - 0.5) / max(dc, 1e-5);\r
    float cov = clamp(uThick + 1.0 - length(vec2(d, e)), 0.0, 1.0);\r
    float mean = min(1.0, 3.1416 * (uThick + 0.5) * (uThick + 0.5) * du * dc);\r
    return mix(cov, mean, max(dense, smoothstep(0.1, 0.4, dc)));\r
  }\r
  float cov = clamp(uThick + 0.5 - d, 0.0, 1.0);\r
  float mean = min(1.0, 2.0 * uThick * du);\r
  if (uStyle == 1) {\r
    float c = along / dash * 4.0;\r
    float dc = fb / dash * 4.0;\r
    float e = abs(fract(c + 0.5) - 0.5);\r
    float m = clamp((0.25 - e) / max(dc, 1e-5) + 0.5, 0.0, 1.0);\r
    cov *= mix(m, 0.5, smoothstep(0.1, 0.4, dc));\r
    mean *= 0.5;\r
  }\r
  return mix(cov, mean, dense);\r
}\r
\r
float depthFade(float z) {\r
  float n = clamp(z / uDepth, 0.0, 1.0);\r
  return mix(1.0, (exp(-3.0 * n) - 0.0497871) / 0.9502129, uFade);\r
}\r
\r
vec3 project(vec3 eye, vec3 o, int face, float plane) {\r
  vec3 d = o - eye;\r
  float t = face == 0 ? (plane - o.x) / d.x : (face == 1 ? (plane - o.y) / d.y : (plane - o.z) / d.z);\r
  return o + d * t;\r
}\r
\r
void trace(vec3 o, vec3 d, out int face, out float plane, out vec3 h) {\r
  float sx = d.x > 0.0 ? 0.5 * uAspect : -0.5 * uAspect;\r
  float sy = d.y > 0.0 ? 0.5 : -0.5;\r
  float tx = abs(d.x) > 1e-6 ? (sx - o.x) / d.x : 1e9;\r
  float ty = abs(d.y) > 1e-6 ? (sy - o.y) / d.y : 1e9;\r
  float t = (uDepth - o.z) / d.z;\r
  face = 2;\r
  plane = uDepth;\r
  if (tx < t) {\r
    face = 0;\r
    plane = sx;\r
    t = tx;\r
  }\r
  if (ty < t) {\r
    face = 1;\r
    plane = sy;\r
    t = ty;\r
  }\r
  h = o + d * t;\r
}\r
\r
vec2 faceUv(vec3 h, int face) {\r
  if (face == 0) return vec2(h.z, h.y + 0.5);\r
  if (face == 1) return vec2(h.x + 0.5 * uAspect, h.z);\r
  return vec2(h.x + 0.5 * uAspect, h.y + 0.5);\r
}\r
\r
Light illuminate(vec3 h, int face, vec2 uv, vec2 foot, float blur) {\r
  Light l;\r
  vec2 cell = face == 0 ? uCell.zy : (face == 1 ? uCell.xz : uCell.xy);\r
  vec2 f = foot * blur;\r
  float minor = max(lines(uv.x, uv.y, cell.x, cell.y, f.x, f.y), lines(uv.y, uv.x, cell.y, cell.x, f.y, f.x));\r
  float major = max(\r
    lines(uv.x, uv.y, cell.x * 4.0, cell.y, f.x, f.y),\r
    lines(uv.y, uv.x, cell.y * 4.0, cell.x, f.y, f.x)\r
  );\r
  l.grid = max(minor * 0.75, major) / blur;\r
  float z = h.z;\r
  l.fade = depthFade(z);\r
  l.reveal = smoothstep(uReveal, uReveal - 0.2, z);\r
  float zFoot = face == 0 ? f.x : (face == 1 ? f.y : 0.0);\r
  float width = max(uScanWidth, zFoot * 1.1);\r
  float dz = z - uScanZ;\r
  l.core = exp(-dz * dz / (width * width)) * (face == 2 ? 0.45 : 1.0) * uScanAlpha;\r
  float behind = -dz * uScanDir;\r
  l.trail = exp(-max(behind, 0.0) / uTrail) * smoothstep(-width, width * 0.5, behind) * uScanAlpha;\r
  l.spill = exp(-dz * dz / 0.05) * uScanAlpha;\r
  l.ping = 0.0;\r
  l.wake = 0.0;\r
  for (int i = 0; i < 4; i++) {\r
    float alpha = uPingAlpha[i];\r
    if (alpha <= 0.0) continue;\r
    float dist = length(h - uPing[i].xyz) - uPing[i].w;\r
    l.ping += exp(-dist * dist / 0.0012) * alpha;\r
    l.wake += exp(min(dist, 0.0) / 0.22) * smoothstep(0.03, -0.03, dist) * alpha;\r
  }\r
  return l;\r
}\r
\r
void over(inout vec4 acc, vec3 color, float alpha) {\r
  alpha = clamp(alpha, 0.0, 1.0);\r
  acc = vec4(color * alpha, alpha) + acc * (1.0 - alpha);\r
}\r
\r
void paint(inout vec4 color, inout float energy, Light l, float gain, float lift, float hover) {\r
  float base = l.grid * l.fade * l.reveal * lift;\r
  float far = l.fade * l.reveal * gain;\r
  float lit = l.grid * (l.core * 1.2 + l.trail * 0.75 + l.ping * 1.4 + l.wake * 0.5 + hover * 0.5) * far;\r
  float sheen = (l.core * 0.14 + l.spill * 0.05 + l.trail * 0.03 + l.ping * 0.2 + l.wake * 0.04) * far;\r
  float laser = (l.core + l.ping * 0.35) * far;\r
  over(color, uLineColor, base);\r
  over(color, uScanColor, sheen);\r
  over(color, uScanColor, lit);\r
  over(color, uCoreColor, laser * 0.9);\r
  energy += laser * 0.9 + lit * 0.5;\r
}\r
\r
void main() {\r
  vec3 p = vec3((vUv.x - 0.5) * uAspect, vUv.y - 0.5, 0.0);\r
  vec3 d = p - uEye;\r
  int face;\r
  float plane;\r
  vec3 h;\r
  trace(p, d, face, plane, h);\r
  vec3 hx = project(uEye, p + vec3(uPixel, 0.0, 0.0), face, plane);\r
  vec3 hy = project(uEye, p + vec3(0.0, uPixel, 0.0), face, plane);\r
  vec2 uv = faceUv(h, face);\r
  vec2 ux = faceUv(hx, face) - uv;\r
  vec2 uy = faceUv(hy, face) - uv;\r
  vec2 foot = vec2(length(vec2(ux.x, uy.x)), length(vec2(ux.y, uy.y)));\r
  Light l = illuminate(h, face, uv, foot, 1.0);\r
\r
  vec4 color = vec4(0.0);\r
  float energy = 0.0;\r
\r
  if (uShade > 0.0) {\r
    vec2 gaps = face == 0\r
      ? vec2(0.5 - abs(h.y), uDepth - h.z)\r
      : (face == 1 ? vec2(0.5 * uAspect - abs(h.x), uDepth - h.z) : vec2(0.5 * uAspect - abs(h.x), 0.5 - abs(h.y)));\r
    vec2 crease = 1.0 - exp(-max(gaps, 0.0) / 0.16);\r
    float occlusion = crease.x * crease.y;\r
    float lamp = 1.0 / (1.0 + h.z * h.z * 0.9);\r
    float tilt = face == 1 ? (plane < 0.0 ? 1.1 : 0.85) : (face == 2 ? 0.8 : 1.0);\r
    float glowSpill = (l.spill * 0.5 + l.trail * 0.12) * l.reveal * l.fade;\r
    if (uLight > 0.5) {\r
      float shadow = (1.0 - lamp * tilt) * 0.09 + (1.0 - occlusion) * 0.2;\r
      over(color, vec3(0.0), shadow * uShade * l.reveal * l.fade);\r
    } else {\r
      over(color, vec3(1.0), lamp * tilt * occlusion * 0.11 * uShade * l.reveal * l.fade);\r
    }\r
    over(color, uScanColor, glowSpill * uShade * occlusion * 0.35);\r
  }\r
\r
  if (face == 1 && plane < 0.0 && uReflect > 0.0) {\r
    vec3 mirror = vec3(uEye.x, -1.0 - uEye.y, uEye.z);\r
    vec3 r = h - mirror;\r
    int face2;\r
    float plane2;\r
    vec3 h2;\r
    trace(h, r, face2, plane2, h2);\r
    vec2 uv2 = faceUv(h2, face2);\r
    vec2 ux2 = faceUv(project(mirror, hx, face2, plane2), face2) - uv2;\r
    vec2 uy2 = faceUv(project(mirror, hy, face2, plane2), face2) - uv2;\r
    vec2 foot2 = vec2(length(vec2(ux2.x, uy2.x)), length(vec2(ux2.y, uy2.y)));\r
    float travel = length(h2 - h);\r
    Light m = illuminate(h2, face2, uv2, foot2, 1.0 + travel * 4.0);\r
    m.reveal *= l.reveal;\r
    float grazing = 1.0 - normalize(r).y;\r
    float gain = (0.3 + 0.7 * grazing * grazing * grazing * grazing) * uReflect * exp(-travel * 1.1) * (uLight > 0.5 ? 0.6 : 1.0);\r
    float reflected = 0.0;\r
    paint(color, reflected, m, gain, 0.0, 0.0);\r
    energy += reflected * 0.6;\r
  }\r
\r
  vec3 near = h - uHover.xyz;\r
  float hover = exp(-dot(near, near) / 0.08) * uHover.w;\r
  paint(color, energy, l, 1.0, 1.0, hover);\r
\r
  if (uPoints > 0.5) {\r
    vec2 cell = face == 0 ? uCell.zy : (face == 1 ? uCell.xz : uCell.xy);\r
    vec2 spacing = cell / 2.5;\r
    vec2 q = uv / spacing;\r
    vec2 id = floor(q);\r
    vec2 seed = id + vec2(float(face) * 13.7 + plane * 5.3, float(face) * 3.1);\r
    vec2 delta = (q - id - (0.2 + 0.6 * hash2(seed))) * spacing;\r
    float det = ux.x * uy.y - ux.y * uy.x;\r
    vec2 s = vec2(delta.x * uy.y - delta.y * uy.x, ux.x * delta.y - ux.y * delta.x) / det;\r
    float radius = uDot * mix(1.0, 0.55, clamp(h.z / uDepth, 0.0, 1.0));\r
    float spot = clamp(radius + 0.5 - length(s), 0.0, 1.0);\r
    float gap = min(spacing.x / foot.x, spacing.y / foot.y);\r
    float r = hash(seed + 7.7);\r
    float flicker = 0.75 + 0.25 * sin(uTime * (3.0 + r * 5.0) + r * 40.0);\r
    float dots = spot * smoothstep(5.0, 10.0, gap) * smoothstep(0.25, 0.6, r) * (0.3 + 0.7 * r * r) * flicker;\r
    float hot = l.core * 2.5 + l.ping * 1.6;\r
    float warm = l.trail * l.trail * 1.3 + l.wake * 0.6 + hover * 1.3;\r
    float spark = dots * (hot + warm) * l.fade * l.reveal;\r
    over(color, mix(uScanColor, uCoreColor, clamp(hot / max(hot + warm, 1e-4), 0.0, 1.0)), spark);\r
    energy += spark * 0.9;\r
  }\r
\r
  if (uHaze > 0.0 && uScanAlpha > 0.0 && uScanZ > 0.0 && h.z > uScanZ) {\r
    vec3 c = p + d * (uScanZ / d.z);\r
    float grain = hash(floor(c.xy * 180.0) + floor(uTime * 24.0) * 7.0);\r
    float edge = min(0.5 * uAspect - abs(c.x), 0.5 - abs(c.y));\r
    float rim = exp(-edge / 0.06);\r
    float veil = uHaze * uScanAlpha * (0.45 + 0.9 * grain) * (0.55 + rim * 1.6);\r
    over(color, uScanColor, veil * depthFade(uScanZ) * l.reveal);\r
  }\r
\r
  energy = clamp(energy, 0.0, 1.0);\r
  outColor = color;\r
  outGlow = vec4(uScanColor * energy, energy);\r
}\`;\r
\r
const DOWN = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uSource;\r
uniform vec2 uTexel;\r
in vec2 vUv;\r
out vec4 outColor;\r
void main() {\r
  vec2 o = uTexel;\r
  outColor = 0.25 * (\r
    texture(uSource, vUv + vec2(-o.x, -o.y)) +\r
    texture(uSource, vUv + vec2(o.x, -o.y)) +\r
    texture(uSource, vUv + vec2(-o.x, o.y)) +\r
    texture(uSource, vUv + vec2(o.x, o.y))\r
  );\r
}\`;\r
\r
const BLUR = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uSource;\r
uniform vec2 uStep;\r
in vec2 vUv;\r
out vec4 outColor;\r
void main() {\r
  vec4 sum = texture(uSource, vUv) * 0.1964825501511404;\r
  sum += (texture(uSource, vUv + uStep * 1.411764705882353) + texture(uSource, vUv - uStep * 1.411764705882353)) * 0.2969069646728344;\r
  sum += (texture(uSource, vUv + uStep * 3.2941176470588234) + texture(uSource, vUv - uStep * 3.2941176470588234)) * 0.09447039785044732;\r
  sum += (texture(uSource, vUv + uStep * 5.176470588235294) + texture(uSource, vUv - uStep * 5.176470588235294)) * 0.010381362401148057;\r
  outColor = sum;\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uScene;\r
uniform sampler2D uBloom;\r
uniform float uGlow;\r
in vec2 vUv;\r
out vec4 outColor;\r
float hash(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * 0.1031);\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.x + q.y) * q.z);\r
}\r
void main() {\r
  vec4 scene = texture(uScene, vUv);\r
  vec4 bloom = texture(uBloom, vUv) * uGlow;\r
  bloom.a = min(bloom.a, 1.0);\r
  bloom.rgb = min(bloom.rgb, vec3(bloom.a));\r
  vec4 color = scene + bloom * (1.0 - scene.a);\r
  float noise = (hash(gl_FragCoord.xy) - 0.5) / 255.0;\r
  color.a = clamp(color.a + noise, 0.0, 1.0);\r
  color.rgb = clamp(color.rgb + noise, vec3(0.0), vec3(color.a));\r
  outColor = color;\r
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
const createTarget = (gl: WebGL2RenderingContext): Target => {\r
  const texture = gl.createTexture();\r
  gl.bindTexture(gl.TEXTURE_2D, texture);\r
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
  return { texture, width: 0, height: 0 };\r
};\r
\r
const sizeTarget = (gl: WebGL2RenderingContext, target: Target, width: number, height: number) => {\r
  if (target.width === width && target.height === height) return;\r
  target.width = width;\r
  target.height = height;\r
  gl.bindTexture(gl.TEXTURE_2D, target.texture);\r
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
};\r
\r
let faceApiLoader: Promise<FaceApi> | null = null;\r
\r
const loadFaceApi = () => {\r
  const scope = window as unknown as FaceScope;\r
  if (scope.faceapi) return Promise.resolve(scope.faceapi);\r
  if (!faceApiLoader) {\r
    faceApiLoader = new Promise<FaceApi>((resolve, reject) => {\r
      const script = document.createElement('script');\r
      script.src = FACE_API_URL;\r
      script.async = true;\r
      script.onload = () => (scope.faceapi ? resolve(scope.faceapi) : reject(new Error('face-api.js')));\r
      script.onerror = () => {\r
        faceApiLoader = null;\r
        reject(new Error('face-api.js'));\r
      };\r
      document.head.appendChild(script);\r
    });\r
  }\r
  return faceApiLoader;\r
};\r
\r
const STATUS_LABELS: Record<Status, string> = {\r
  loading: 'Loading face tracking',\r
  searching: 'Looking for a face',\r
  tracking: 'Tracking',\r
  blocked: 'Camera unavailable'\r
};\r
\r
export const GridScan = ({\r
  linesColor,\r
  scanColor,\r
  cells = 8,\r
  lineThickness = 1,\r
  lineStyle = 'solid',\r
  depth = 3,\r
  depthFade = 0.6,\r
  parallax = 1,\r
  points = true,\r
  reflection = 0.35,\r
  shading = 0.7,\r
  scanDirection = 'forward',\r
  scanDuration = 2.4,\r
  scanDelay = 1.6,\r
  scanWidth = 1,\r
  trail = 0.5,\r
  glow = 0.6,\r
  autoScan = true,\r
  interactive = true,\r
  clickEffect = 'ping',\r
  enableWebcam = false,\r
  showPreview = false,\r
  modelsPath = MODELS_URL,\r
  enableGyro = false,\r
  intro = true,\r
  lightMode = false,\r
  dpr,\r
  className = '',\r
  style,\r
  ...rest\r
}: GridScanProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const videoRef = useRef<HTMLVideoElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const headRef = useRef<Head | null>(null);\r
  const [status, setStatus] = useState<Status>('loading');\r
  const settings: Settings = {\r
    linesColor: linesColor ?? (lightMode ? '#d4d4d8' : '#4d4757'),\r
    scanColor: scanColor ?? (lightMode ? '#0284c7' : '#7dd3fc'),\r
    cells: clamp(cells, 2, 40),\r
    thickness: clamp(lineThickness, 0.5, 4),\r
    style: STYLES[lineStyle] ?? 0,\r
    depth: clamp(depth, 0.5, 12),\r
    depthFade: clamp(depthFade, 0, 1),\r
    parallax: clamp(parallax, 0, 3),\r
    points,\r
    reflection: clamp(reflection, 0, 1),\r
    shading: clamp(shading, 0, 1),\r
    direction: scanDirection,\r
    duration: clamp(scanDuration, 0.3, 20),\r
    delay: clamp(scanDelay, 0, 30),\r
    scanWidth: clamp(scanWidth, 0.2, 5),\r
    trail: clamp(trail, 0, 1),\r
    glow: clamp(glow, 0, 1.5),\r
    autoScan,\r
    interactive,\r
    clickEffect,\r
    enableGyro,\r
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
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const room = link(gl, ROOM);\r
    const down = link(gl, DOWN);\r
    const blur = link(gl, BLUR);\r
    const composite = link(gl, COMPOSITE);\r
    if (!room || !down || !blur || !composite) return undefined;\r
    const vao = gl.createVertexArray();\r
    const scene = createTarget(gl);\r
    const light = createTarget(gl);\r
    const bloomA = createTarget(gl);\r
    const bloomB = createTarget(gl);\r
    const sceneBuffer = gl.createFramebuffer();\r
    const bloomBufferA = gl.createFramebuffer();\r
    const bloomBufferB = gl.createFramebuffer();\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const colorCache = new Map<string, number[]>();\r
    const parse = (value: string): number[] => {\r
      const key = String(value);\r
      const cached = colorCache.get(key);\r
      if (cached) return cached;\r
      let rgb = [1, 1, 1];\r
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
    const eye = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, f: EYE_DISTANCE, vf: 0, tf: EYE_DISTANCE };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const look = { x: 0, y: 0, held: false };\r
    const tilt = { gamma: 0, beta: 0, ready: false, asked: false };\r
    const hover = { x: 0, y: 0, z: 0, strength: 0, ready: false };\r
    const scan = { z: 0, dir: 1, alpha: 0, start: 0, sweeps: 0, waiting: false };\r
    const pings: Ping[] = [];\r
    const pingData = new Float32Array(MAX_PINGS * 4);\r
    const pingAlpha = new Float32Array(MAX_PINGS);\r
    let time = 0;\r
    let introClock = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let leaveTimer = 0;\r
\r
    const roomSize = () => {\r
      const s = settingsRef.current;\r
      const aspect = view.width / view.height;\r
      const cy = 1 / Math.round(s.cells);\r
      const cx = aspect / Math.max(1, Math.round(aspect / cy));\r
      const roomDepth = Math.max(cy, Math.round(s.depth / cy) * cy);\r
      return { aspect, cx, cy, roomDepth };\r
    };\r
\r
    const castRay = (u: number, v: number) => {\r
      const { aspect, roomDepth } = roomSize();\r
      const px = (u - 0.5) * aspect;\r
      const py = v - 0.5;\r
      const dx = px - eye.x;\r
      const dy = py - eye.y;\r
      const dz = eye.f;\r
      const sx = dx > 0 ? 0.5 * aspect : -0.5 * aspect;\r
      const sy = dy > 0 ? 0.5 : -0.5;\r
      let t = roomDepth / dz;\r
      if (Math.abs(dx) > 1e-6) t = Math.min(t, (sx - px) / dx);\r
      if (Math.abs(dy) > 1e-6) t = Math.min(t, (sy - py) / dy);\r
      return { x: px + dx * t, y: py + dy * t, z: dz * t };\r
    };\r
\r
    const startSweep = (s: Settings) => {\r
      scan.dir = s.direction === 'backward' || (s.direction === 'pingpong' && scan.sweeps % 2 === 1) ? -1 : 1;\r
      scan.start = time;\r
      scan.waiting = false;\r
      scan.sweeps += 1;\r
    };\r
\r
    const updateScan = (s: Settings, roomDepth: number) => {\r
      if (introClock < 1) {\r
        const k = introClock;\r
        scan.dir = 1;\r
        scan.z = k * (roomDepth + 0.4) - 0.2;\r
        scan.alpha = Math.min(1, k * 6) * (1 - Math.max(0, k - 0.85) / 0.15);\r
        return;\r
      }\r
      if (scan.sweeps === 0 && !scan.waiting) {\r
        scan.waiting = true;\r
        scan.start = time;\r
        scan.alpha = 0;\r
      }\r
      if (scan.waiting) {\r
        scan.alpha = 0;\r
        if (s.autoScan && !reduce && time - scan.start >= s.delay) startSweep(s);\r
        return;\r
      }\r
      const k = (time - scan.start) / s.duration;\r
      if (k >= 1) {\r
        scan.waiting = true;\r
        scan.start = time;\r
        scan.alpha = 0;\r
        return;\r
      }\r
      const travel = k * (roomDepth + 0.3) - 0.15;\r
      scan.z = scan.dir > 0 ? travel : roomDepth - travel;\r
      scan.alpha = Math.min(1, k / 0.12) * Math.min(1, (1 - k) / 0.12);\r
    };\r
\r
    const updateEye = (dt: number) => {\r
      const steps = Math.max(1, Math.ceil(dt / (1 / 120)));\r
      const h = dt / steps;\r
      for (let i = 0; i < steps; i++) {\r
        eye.vx += ((eye.tx - eye.x) * 42 - eye.vx * 11) * h;\r
        eye.vy += ((eye.ty - eye.y) * 42 - eye.vy * 11) * h;\r
        eye.vf += ((eye.tf - eye.f) * 42 - eye.vf * 11) * h;\r
        eye.x += eye.vx * h;\r
        eye.y += eye.vy * h;\r
        eye.f += eye.vf * h;\r
      }\r
    };\r
\r
    const setLook = (nx: number, ny: number, held: boolean) => {\r
      look.x = clamp(nx, -1, 1);\r
      look.y = clamp(ny, -1, 1);\r
      look.held = held;\r
    };\r
\r
    const aimEye = (s: Settings) => {\r
      const aspect = view.width / view.height;\r
      const drift = reduce ? 0 : 1;\r
      const nx = look.held ? look.x : (Math.sin(time * 0.21) * 0.2 + Math.sin(time * 0.083 + 1.3) * 0.12) * drift;\r
      const ny = look.held ? look.y : Math.sin(time * 0.17 + 2.1) * 0.16 * drift;\r
      eye.tx = nx * s.parallax * 0.22 * aspect;\r
      eye.ty = ny * s.parallax * 0.22;\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      view.width = Math.max(1, container.clientWidth);\r
      view.height = Math.max(1, container.clientHeight);\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(view.width * view.ratio));\r
      canvas.height = Math.max(1, Math.round(view.height * view.ratio));\r
      sizeTarget(gl, scene, canvas.width, canvas.height);\r
      sizeTarget(gl, light, canvas.width, canvas.height);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, sceneBuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, scene.texture, 0);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, light.texture, 0);\r
      const bw = Math.max(1, Math.round(canvas.width / 4));\r
      const bh = Math.max(1, Math.round(canvas.height / 4));\r
      sizeTarget(gl, bloomA, bw, bh);\r
      sizeTarget(gl, bloomB, bw, bh);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, bloomBufferA);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, bloomA.texture, 0);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, bloomBufferB);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, bloomB.texture, 0);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      draw();\r
      wake();\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      const { aspect, cx, cy, roomDepth } = roomSize();\r
      const lineRgb = parse(s.linesColor);\r
      const scanRgb = parse(s.scanColor);\r
      const coreRgb = s.lightMode ? scanRgb : scanRgb.map(c => c + (1 - c) * 0.65);\r
      const ru = room.uniforms;\r
      gl.bindVertexArray(vao);\r
      gl.disable(gl.BLEND);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, sceneBuffer);\r
      gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(room.program);\r
      gl.uniform1f(ru.uAspect, aspect);\r
      gl.uniform1f(ru.uPixel, 1 / canvas.height);\r
      gl.uniform3f(ru.uEye, eye.x, eye.y, -eye.f);\r
      gl.uniform1f(ru.uDepth, roomDepth);\r
      gl.uniform3f(ru.uCell, cx, cy, cy);\r
      gl.uniform1f(ru.uThick, s.thickness * view.ratio * 0.5);\r
      gl.uniform1f(ru.uDot, 1.8 * view.ratio);\r
      gl.uniform1i(ru.uStyle, s.style);\r
      gl.uniform3fv(ru.uLineColor, lineRgb);\r
      gl.uniform3fv(ru.uScanColor, scanRgb);\r
      gl.uniform3fv(ru.uCoreColor, coreRgb);\r
      gl.uniform1f(ru.uFade, s.depthFade);\r
      gl.uniform1f(ru.uScanZ, scan.z);\r
      gl.uniform1f(ru.uScanDir, scan.dir);\r
      gl.uniform1f(ru.uScanAlpha, scan.alpha);\r
      gl.uniform1f(ru.uScanWidth, 0.006 * s.scanWidth);\r
      gl.uniform1f(ru.uTrail, 0.04 + s.trail * 1.1);\r
      gl.uniform1f(ru.uReveal, introClock < 1 ? scan.z + 0.05 : 1e4);\r
      gl.uniform1f(ru.uPoints, s.points ? 1 : 0);\r
      gl.uniform1f(ru.uReflect, s.reflection);\r
      gl.uniform1f(ru.uHaze, s.lightMode ? 0.03 : 0.05);\r
      gl.uniform1f(ru.uShade, s.shading);\r
      gl.uniform1f(ru.uLight, s.lightMode ? 1 : 0);\r
      gl.uniform4fv(ru.uPing, pingData);\r
      gl.uniform1fv(ru.uPingAlpha, pingAlpha);\r
      gl.uniform4f(ru.uHover, hover.x, hover.y, hover.z, hover.strength);\r
      gl.uniform1f(ru.uTime, time);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      const glowing = s.glow > 0;\r
      if (glowing) {\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, bloomBufferA);\r
        gl.viewport(0, 0, bloomA.width, bloomA.height);\r
        gl.useProgram(down.program);\r
        gl.activeTexture(gl.TEXTURE0);\r
        gl.bindTexture(gl.TEXTURE_2D, light.texture);\r
        gl.uniform1i(down.uniforms.uSource, 0);\r
        gl.uniform2f(down.uniforms.uTexel, 1 / light.width, 1 / light.height);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
        const spread = (2.2 * view.ratio) / 2;\r
        gl.useProgram(blur.program);\r
        gl.uniform1i(blur.uniforms.uSource, 0);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, bloomBufferB);\r
        gl.bindTexture(gl.TEXTURE_2D, bloomA.texture);\r
        gl.uniform2f(blur.uniforms.uStep, spread / bloomA.width, 0);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, bloomBufferA);\r
        gl.bindTexture(gl.TEXTURE_2D, bloomB.texture);\r
        gl.uniform2f(blur.uniforms.uStep, 0, spread / bloomA.height);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      }\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(composite.program);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, scene.texture);\r
      gl.uniform1i(composite.uniforms.uScene, 0);\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.bindTexture(gl.TEXTURE_2D, bloomA.texture);\r
      gl.uniform1i(composite.uniforms.uBloom, 1);\r
      gl.uniform1f(composite.uniforms.uGlow, glowing ? s.glow * (s.lightMode ? 0.8 : 1.6) : 0);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.activeTexture(gl.TEXTURE0);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.001, 0.05) : 1 / 60;\r
      last = now;\r
      time += dt;\r
      if (introClock < 1) introClock = Math.min(1, introClock + dt / INTRO_SECONDS);\r
      const { roomDepth } = roomSize();\r
      updateScan(s, roomDepth);\r
      aimEye(s);\r
      updateEye(dt);\r
\r
      const aim = s.interactive && pointer.inside && !reduce ? 1 : 0;\r
      if (aim) {\r
        const target = castRay(pointer.x, pointer.y);\r
        if (!hover.ready) Object.assign(hover, target, { ready: true });\r
        const follow = 1 - Math.exp(-dt / 0.08);\r
        hover.x += (target.x - hover.x) * follow;\r
        hover.y += (target.y - hover.y) * follow;\r
        hover.z += (target.z - hover.z) * follow;\r
      }\r
      hover.strength += (aim - hover.strength) * (1 - Math.exp(-dt / 0.25));\r
      if (!aim && hover.strength < 0.01) hover.ready = false;\r
\r
      for (let i = pings.length - 1; i >= 0; i--) {\r
        pings[i].age += dt;\r
        if (pings[i].age > PING_LIFE) pings.splice(i, 1);\r
      }\r
      for (let i = 0; i < MAX_PINGS; i++) {\r
        const ping = pings[i];\r
        if (!ping) {\r
          pingAlpha[i] = 0;\r
          continue;\r
        }\r
        const k = ping.age / PING_LIFE;\r
        pingData.set([ping.x, ping.y, ping.z, ping.age * 1.15], i * 4);\r
        pingAlpha[i] = Math.min(1, ping.age / 0.05) * (1 - k) * (1 - k);\r
      }\r
\r
      draw();\r
\r
      const settling =\r
        Math.abs(eye.tx - eye.x) + Math.abs(eye.ty - eye.y) + Math.abs(eye.tf - eye.f) > 1e-4 ||\r
        Math.abs(eye.vx) + Math.abs(eye.vy) + Math.abs(eye.vf) > 1e-4;\r
      const busy =\r
        introClock < 1 ||\r
        (!reduce && s.autoScan) ||\r
        !scan.waiting ||\r
        pings.length > 0 ||\r
        settling ||\r
        hover.strength > 0.002 ||\r
        (!reduce && s.parallax > 0 && !look.held) ||\r
        (s.points && !reduce && scan.alpha > 0);\r
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
      const u = (event.clientX - rect.left) / Math.max(1, rect.width);\r
      const v = 1 - (event.clientY - rect.top) / Math.max(1, rect.height);\r
      return { u, v, inside: u >= 0 && u <= 1 && v >= 0 && v <= 1 };\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      const { u, v, inside } = locate(event);\r
      pointer.x = u;\r
      pointer.y = v;\r
      const was = pointer.inside;\r
      pointer.inside = inside;\r
      if (inside) {\r
        window.clearTimeout(leaveTimer);\r
        leaveTimer = 0;\r
        if (!headRef.current?.active && s.interactive && !reduce) setLook(u * 2 - 1, v * 2 - 1, true);\r
        wake();\r
      } else if (was && !leaveTimer) {\r
        leaveTimer = window.setTimeout(() => {\r
          leaveTimer = 0;\r
          if (!headRef.current?.active) look.held = false;\r
          wake();\r
        }, 220);\r
        wake();\r
      }\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      const { u, v, inside } = locate(event);\r
      if (!inside || reduce || s.clickEffect === 'none') return;\r
      if (s.clickEffect === 'scan') {\r
        if (introClock >= 1) startSweep(s);\r
      } else {\r
        const hit = castRay(u, v);\r
        pings.unshift({ ...hit, age: 0 });\r
        if (pings.length > MAX_PINGS) pings.pop();\r
      }\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      if (!headRef.current?.active) look.held = false;\r
      wake();\r
    };\r
\r
    const onOrientation = (event: DeviceOrientationEvent) => {\r
      const s = settingsRef.current;\r
      if (!s.enableGyro || headRef.current?.active || reduce || event.gamma === null || event.beta === null) return;\r
      if (!tilt.ready) Object.assign(tilt, { gamma: event.gamma, beta: event.beta, ready: true });\r
      setLook((event.gamma - tilt.gamma) / 25, (event.beta - tilt.beta) / -25, true);\r
      wake();\r
    };\r
\r
    const onClick = () => {\r
      const s = settingsRef.current;\r
      const request = (\r
        window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> } | undefined\r
      )?.requestPermission;\r
      if (!s.enableGyro || tilt.asked || typeof request !== 'function') return;\r
      tilt.asked = true;\r
      request.call(window.DeviceOrientationEvent).catch(() => {});\r
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
    window.addEventListener('deviceorientation', onOrientation);\r
    window.addEventListener('click', onClick);\r
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    headRef.current = {\r
      active: false,\r
      move: (nx, ny, near) => {\r
        if (reduce) return;\r
        setLook(nx * 1.3, ny * 1.3, true);\r
        eye.tf = EYE_DISTANCE * clamp(near, 0.6, 1.6);\r
        wake();\r
      },\r
      release: () => {\r
        eye.tf = EYE_DISTANCE;\r
        look.held = false;\r
        wake();\r
      }\r
    };\r
    resize();\r
    wakeRef.current = wake;\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      window.clearTimeout(leaveTimer);\r
      wakeRef.current = null;\r
      headRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('deviceorientation', onOrientation);\r
      window.removeEventListener('click', onClick);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      [scene, light, bloomA, bloomB].forEach(target => gl.deleteTexture(target.texture));\r
      [sceneBuffer, bloomBufferA, bloomBufferB].forEach(buffer => gl.deleteFramebuffer(buffer));\r
      gl.deleteVertexArray(vao);\r
      [room, down, blur, composite].forEach(item => gl.deleteProgram(item.program));\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  useEffect(() => {\r
    if (!enableWebcam) return undefined;\r
    const video = videoRef.current;\r
    if (!video) return undefined;\r
    let stopped = false;\r
    let stream: MediaStream | null = null;\r
    let timer = 0;\r
    let lost = 0;\r
    const smooth = { x: 0, y: 0, near: 1, ready: false };\r
    setStatus('loading');\r
\r
    const run = async () => {\r
      try {\r
        const faceapi = await loadFaceApi();\r
        await faceapi.nets.tinyFaceDetector.loadFromUri(modelsPath);\r
        if (stopped) return;\r
        stream = await navigator.mediaDevices.getUserMedia({\r
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },\r
          audio: false\r
        });\r
        if (stopped) {\r
          stream.getTracks().forEach(track => track.stop());\r
          return;\r
        }\r
        video.srcObject = stream;\r
        await video.play();\r
        setStatus('searching');\r
        const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.45 });\r
        const detect = async () => {\r
          if (stopped) return;\r
          let result = null;\r
          try {\r
            result = await faceapi.detectSingleFace(video, options);\r
          } catch {\r
            result = null;\r
          }\r
          if (stopped) return;\r
          const head = headRef.current;\r
          if (result && head) {\r
            const box = result.box;\r
            const vw = video.videoWidth || 1;\r
            const vh = video.videoHeight || 1;\r
            const x = -((box.x + box.width / 2) / vw - 0.5) * 2;\r
            const y = -((box.y + box.height / 2) / vh - 0.5) * 2;\r
            const near = 0.32 / Math.max(0.08, box.width / vw);\r
            const k = smooth.ready ? 0.45 : 1;\r
            smooth.x += (x - smooth.x) * k;\r
            smooth.y += (y - smooth.y) * k;\r
            smooth.near += (near - smooth.near) * k;\r
            smooth.ready = true;\r
            lost = 0;\r
            head.active = true;\r
            head.move(smooth.x, smooth.y, smooth.near);\r
            setStatus('tracking');\r
          } else if (head && ++lost > 12 && head.active) {\r
            head.active = false;\r
            smooth.ready = false;\r
            head.release();\r
            setStatus('searching');\r
          }\r
          timer = window.setTimeout(detect, 40);\r
        };\r
        detect();\r
      } catch {\r
        if (!stopped) setStatus('blocked');\r
      }\r
    };\r
    run();\r
\r
    return () => {\r
      stopped = true;\r
      window.clearTimeout(timer);\r
      stream?.getTracks().forEach(track => track.stop());\r
      video.srcObject = null;\r
      const head = headRef.current;\r
      if (head?.active) {\r
        head.active = false;\r
        head.release();\r
      }\r
    };\r
  }, [enableWebcam, modelsPath]);\r
\r
  return (\r
    <div ref={containerRef} className={\`grid-scan\${className ? \` \${className}\` : ''}\`} style={style} {...rest}>\r
      <canvas ref={canvasRef} className="grid-scan-canvas" aria-hidden="true" />\r
      {enableWebcam && (\r
        <div className={showPreview ? 'grid-scan-preview' : 'grid-scan-hidden'}>\r
          <video ref={videoRef} className="grid-scan-video" muted playsInline />\r
          {showPreview && <span className="grid-scan-status">{STATUS_LABELS[status]}</span>}\r
        </div>\r
      )}\r
    </div>\r
  );\r
};\r
\r
export default GridScan;\r
`,o=`'use client';\r
\r
import { useEffect, useRef, useState, type CSSProperties, type HTMLAttributes } from 'react';\r
\r
export type GridScanLineStyle = 'solid' | 'dashed' | 'dotted';\r
\r
export type GridScanDirection = 'forward' | 'backward' | 'pingpong';\r
\r
export type GridScanClickEffect = 'ping' | 'scan' | 'none';\r
\r
export interface GridScanProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {\r
  linesColor?: string;\r
  scanColor?: string;\r
  cells?: number;\r
  lineThickness?: number;\r
  lineStyle?: GridScanLineStyle;\r
  depth?: number;\r
  depthFade?: number;\r
  parallax?: number;\r
  points?: boolean;\r
  reflection?: number;\r
  shading?: number;\r
  scanDirection?: GridScanDirection;\r
  scanDuration?: number;\r
  scanDelay?: number;\r
  scanWidth?: number;\r
  trail?: number;\r
  glow?: number;\r
  autoScan?: boolean;\r
  interactive?: boolean;\r
  clickEffect?: GridScanClickEffect;\r
  enableWebcam?: boolean;\r
  showPreview?: boolean;\r
  modelsPath?: string;\r
  enableGyro?: boolean;\r
  intro?: boolean;\r
  lightMode?: boolean;\r
  dpr?: number;\r
  style?: CSSProperties;\r
}\r
\r
type Settings = {\r
  linesColor: string;\r
  scanColor: string;\r
  cells: number;\r
  thickness: number;\r
  style: number;\r
  depth: number;\r
  depthFade: number;\r
  parallax: number;\r
  points: boolean;\r
  reflection: number;\r
  shading: number;\r
  direction: GridScanDirection;\r
  duration: number;\r
  delay: number;\r
  scanWidth: number;\r
  trail: number;\r
  glow: number;\r
  autoScan: boolean;\r
  interactive: boolean;\r
  clickEffect: GridScanClickEffect;\r
  enableGyro: boolean;\r
  intro: boolean;\r
  lightMode: boolean;\r
  dpr?: number;\r
};\r
\r
type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };\r
\r
type Target = { texture: WebGLTexture | null; width: number; height: number };\r
\r
type Ping = { x: number; y: number; z: number; age: number };\r
\r
type Head = { active: boolean; move: (nx: number, ny: number, near: number) => void; release: () => void };\r
\r
type Status = 'loading' | 'searching' | 'tracking' | 'blocked';\r
\r
type FaceApi = {\r
  nets: { tinyFaceDetector: { loadFromUri: (url: string) => Promise<void> } };\r
  TinyFaceDetectorOptions: new (options: { inputSize: number; scoreThreshold: number }) => unknown;\r
  detectSingleFace: (\r
    input: HTMLVideoElement,\r
    options: unknown\r
  ) => PromiseLike<{ box: { x: number; y: number; width: number; height: number } } | undefined>;\r
};\r
\r
type FaceScope = { faceapi?: FaceApi };\r
\r
const MAX_PINGS = 4;\r
const PING_LIFE = 2.4;\r
const INTRO_SECONDS = 2.2;\r
const EYE_DISTANCE = 1.25;\r
const FACE_API_URL = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js';\r
const MODELS_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@0.22.2/weights';\r
const STYLES: Record<string, number> = { solid: 0, dashed: 1, dotted: 2 };\r
\r
const VERTEX = \`#version 300 es\r
out vec2 vUv;\r
void main() {\r
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\r
  vUv = p;\r
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const ROOM = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform float uAspect;\r
uniform float uPixel;\r
uniform vec3 uEye;\r
uniform float uDepth;\r
uniform vec3 uCell;\r
uniform float uThick;\r
uniform float uDot;\r
uniform int uStyle;\r
uniform vec3 uLineColor;\r
uniform vec3 uScanColor;\r
uniform vec3 uCoreColor;\r
uniform float uFade;\r
uniform float uScanZ;\r
uniform float uScanDir;\r
uniform float uScanAlpha;\r
uniform float uScanWidth;\r
uniform float uTrail;\r
uniform float uReveal;\r
uniform float uPoints;\r
uniform float uReflect;\r
uniform float uHaze;\r
uniform float uShade;\r
uniform float uLight;\r
uniform vec4 uPing[4];\r
uniform float uPingAlpha[4];\r
uniform vec4 uHover;\r
uniform float uTime;\r
in vec2 vUv;\r
layout(location = 0) out vec4 outColor;\r
layout(location = 1) out vec4 outGlow;\r
\r
struct Light {\r
  float grid;\r
  float fade;\r
  float core;\r
  float trail;\r
  float spill;\r
  float ping;\r
  float wake;\r
  float reveal;\r
};\r
\r
float hash(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * 0.1031);\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.x + q.y) * q.z);\r
}\r
\r
vec2 hash2(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.103, 0.0973));\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.xx + q.yz) * q.zy);\r
}\r
\r
float lines(float across, float along, float period, float dash, float fa, float fb) {\r
  float u = across / period;\r
  float du = fa / period;\r
  float d = abs(fract(u + 0.5) - 0.5) / max(du, 1e-5);\r
  float dense = smoothstep(0.1, 0.4, du);\r
  if (uStyle == 2) {\r
    float c = along / dash * 5.0;\r
    float dc = fb / dash * 5.0;\r
    float e = abs(fract(c + 0.5) - 0.5) / max(dc, 1e-5);\r
    float cov = clamp(uThick + 1.0 - length(vec2(d, e)), 0.0, 1.0);\r
    float mean = min(1.0, 3.1416 * (uThick + 0.5) * (uThick + 0.5) * du * dc);\r
    return mix(cov, mean, max(dense, smoothstep(0.1, 0.4, dc)));\r
  }\r
  float cov = clamp(uThick + 0.5 - d, 0.0, 1.0);\r
  float mean = min(1.0, 2.0 * uThick * du);\r
  if (uStyle == 1) {\r
    float c = along / dash * 4.0;\r
    float dc = fb / dash * 4.0;\r
    float e = abs(fract(c + 0.5) - 0.5);\r
    float m = clamp((0.25 - e) / max(dc, 1e-5) + 0.5, 0.0, 1.0);\r
    cov *= mix(m, 0.5, smoothstep(0.1, 0.4, dc));\r
    mean *= 0.5;\r
  }\r
  return mix(cov, mean, dense);\r
}\r
\r
float depthFade(float z) {\r
  float n = clamp(z / uDepth, 0.0, 1.0);\r
  return mix(1.0, (exp(-3.0 * n) - 0.0497871) / 0.9502129, uFade);\r
}\r
\r
vec3 project(vec3 eye, vec3 o, int face, float plane) {\r
  vec3 d = o - eye;\r
  float t = face == 0 ? (plane - o.x) / d.x : (face == 1 ? (plane - o.y) / d.y : (plane - o.z) / d.z);\r
  return o + d * t;\r
}\r
\r
void trace(vec3 o, vec3 d, out int face, out float plane, out vec3 h) {\r
  float sx = d.x > 0.0 ? 0.5 * uAspect : -0.5 * uAspect;\r
  float sy = d.y > 0.0 ? 0.5 : -0.5;\r
  float tx = abs(d.x) > 1e-6 ? (sx - o.x) / d.x : 1e9;\r
  float ty = abs(d.y) > 1e-6 ? (sy - o.y) / d.y : 1e9;\r
  float t = (uDepth - o.z) / d.z;\r
  face = 2;\r
  plane = uDepth;\r
  if (tx < t) {\r
    face = 0;\r
    plane = sx;\r
    t = tx;\r
  }\r
  if (ty < t) {\r
    face = 1;\r
    plane = sy;\r
    t = ty;\r
  }\r
  h = o + d * t;\r
}\r
\r
vec2 faceUv(vec3 h, int face) {\r
  if (face == 0) return vec2(h.z, h.y + 0.5);\r
  if (face == 1) return vec2(h.x + 0.5 * uAspect, h.z);\r
  return vec2(h.x + 0.5 * uAspect, h.y + 0.5);\r
}\r
\r
Light illuminate(vec3 h, int face, vec2 uv, vec2 foot, float blur) {\r
  Light l;\r
  vec2 cell = face == 0 ? uCell.zy : (face == 1 ? uCell.xz : uCell.xy);\r
  vec2 f = foot * blur;\r
  float minor = max(lines(uv.x, uv.y, cell.x, cell.y, f.x, f.y), lines(uv.y, uv.x, cell.y, cell.x, f.y, f.x));\r
  float major = max(\r
    lines(uv.x, uv.y, cell.x * 4.0, cell.y, f.x, f.y),\r
    lines(uv.y, uv.x, cell.y * 4.0, cell.x, f.y, f.x)\r
  );\r
  l.grid = max(minor * 0.75, major) / blur;\r
  float z = h.z;\r
  l.fade = depthFade(z);\r
  l.reveal = smoothstep(uReveal, uReveal - 0.2, z);\r
  float zFoot = face == 0 ? f.x : (face == 1 ? f.y : 0.0);\r
  float width = max(uScanWidth, zFoot * 1.1);\r
  float dz = z - uScanZ;\r
  l.core = exp(-dz * dz / (width * width)) * (face == 2 ? 0.45 : 1.0) * uScanAlpha;\r
  float behind = -dz * uScanDir;\r
  l.trail = exp(-max(behind, 0.0) / uTrail) * smoothstep(-width, width * 0.5, behind) * uScanAlpha;\r
  l.spill = exp(-dz * dz / 0.05) * uScanAlpha;\r
  l.ping = 0.0;\r
  l.wake = 0.0;\r
  for (int i = 0; i < 4; i++) {\r
    float alpha = uPingAlpha[i];\r
    if (alpha <= 0.0) continue;\r
    float dist = length(h - uPing[i].xyz) - uPing[i].w;\r
    l.ping += exp(-dist * dist / 0.0012) * alpha;\r
    l.wake += exp(min(dist, 0.0) / 0.22) * smoothstep(0.03, -0.03, dist) * alpha;\r
  }\r
  return l;\r
}\r
\r
void over(inout vec4 acc, vec3 color, float alpha) {\r
  alpha = clamp(alpha, 0.0, 1.0);\r
  acc = vec4(color * alpha, alpha) + acc * (1.0 - alpha);\r
}\r
\r
void paint(inout vec4 color, inout float energy, Light l, float gain, float lift, float hover) {\r
  float base = l.grid * l.fade * l.reveal * lift;\r
  float far = l.fade * l.reveal * gain;\r
  float lit = l.grid * (l.core * 1.2 + l.trail * 0.75 + l.ping * 1.4 + l.wake * 0.5 + hover * 0.5) * far;\r
  float sheen = (l.core * 0.14 + l.spill * 0.05 + l.trail * 0.03 + l.ping * 0.2 + l.wake * 0.04) * far;\r
  float laser = (l.core + l.ping * 0.35) * far;\r
  over(color, uLineColor, base);\r
  over(color, uScanColor, sheen);\r
  over(color, uScanColor, lit);\r
  over(color, uCoreColor, laser * 0.9);\r
  energy += laser * 0.9 + lit * 0.5;\r
}\r
\r
void main() {\r
  vec3 p = vec3((vUv.x - 0.5) * uAspect, vUv.y - 0.5, 0.0);\r
  vec3 d = p - uEye;\r
  int face;\r
  float plane;\r
  vec3 h;\r
  trace(p, d, face, plane, h);\r
  vec3 hx = project(uEye, p + vec3(uPixel, 0.0, 0.0), face, plane);\r
  vec3 hy = project(uEye, p + vec3(0.0, uPixel, 0.0), face, plane);\r
  vec2 uv = faceUv(h, face);\r
  vec2 ux = faceUv(hx, face) - uv;\r
  vec2 uy = faceUv(hy, face) - uv;\r
  vec2 foot = vec2(length(vec2(ux.x, uy.x)), length(vec2(ux.y, uy.y)));\r
  Light l = illuminate(h, face, uv, foot, 1.0);\r
\r
  vec4 color = vec4(0.0);\r
  float energy = 0.0;\r
\r
  if (uShade > 0.0) {\r
    vec2 gaps = face == 0\r
      ? vec2(0.5 - abs(h.y), uDepth - h.z)\r
      : (face == 1 ? vec2(0.5 * uAspect - abs(h.x), uDepth - h.z) : vec2(0.5 * uAspect - abs(h.x), 0.5 - abs(h.y)));\r
    vec2 crease = 1.0 - exp(-max(gaps, 0.0) / 0.16);\r
    float occlusion = crease.x * crease.y;\r
    float lamp = 1.0 / (1.0 + h.z * h.z * 0.9);\r
    float tilt = face == 1 ? (plane < 0.0 ? 1.1 : 0.85) : (face == 2 ? 0.8 : 1.0);\r
    float glowSpill = (l.spill * 0.5 + l.trail * 0.12) * l.reveal * l.fade;\r
    if (uLight > 0.5) {\r
      float shadow = (1.0 - lamp * tilt) * 0.09 + (1.0 - occlusion) * 0.2;\r
      over(color, vec3(0.0), shadow * uShade * l.reveal * l.fade);\r
    } else {\r
      over(color, vec3(1.0), lamp * tilt * occlusion * 0.11 * uShade * l.reveal * l.fade);\r
    }\r
    over(color, uScanColor, glowSpill * uShade * occlusion * 0.35);\r
  }\r
\r
  if (face == 1 && plane < 0.0 && uReflect > 0.0) {\r
    vec3 mirror = vec3(uEye.x, -1.0 - uEye.y, uEye.z);\r
    vec3 r = h - mirror;\r
    int face2;\r
    float plane2;\r
    vec3 h2;\r
    trace(h, r, face2, plane2, h2);\r
    vec2 uv2 = faceUv(h2, face2);\r
    vec2 ux2 = faceUv(project(mirror, hx, face2, plane2), face2) - uv2;\r
    vec2 uy2 = faceUv(project(mirror, hy, face2, plane2), face2) - uv2;\r
    vec2 foot2 = vec2(length(vec2(ux2.x, uy2.x)), length(vec2(ux2.y, uy2.y)));\r
    float travel = length(h2 - h);\r
    Light m = illuminate(h2, face2, uv2, foot2, 1.0 + travel * 4.0);\r
    m.reveal *= l.reveal;\r
    float grazing = 1.0 - normalize(r).y;\r
    float gain = (0.3 + 0.7 * grazing * grazing * grazing * grazing) * uReflect * exp(-travel * 1.1) * (uLight > 0.5 ? 0.6 : 1.0);\r
    float reflected = 0.0;\r
    paint(color, reflected, m, gain, 0.0, 0.0);\r
    energy += reflected * 0.6;\r
  }\r
\r
  vec3 near = h - uHover.xyz;\r
  float hover = exp(-dot(near, near) / 0.08) * uHover.w;\r
  paint(color, energy, l, 1.0, 1.0, hover);\r
\r
  if (uPoints > 0.5) {\r
    vec2 cell = face == 0 ? uCell.zy : (face == 1 ? uCell.xz : uCell.xy);\r
    vec2 spacing = cell / 2.5;\r
    vec2 q = uv / spacing;\r
    vec2 id = floor(q);\r
    vec2 seed = id + vec2(float(face) * 13.7 + plane * 5.3, float(face) * 3.1);\r
    vec2 delta = (q - id - (0.2 + 0.6 * hash2(seed))) * spacing;\r
    float det = ux.x * uy.y - ux.y * uy.x;\r
    vec2 s = vec2(delta.x * uy.y - delta.y * uy.x, ux.x * delta.y - ux.y * delta.x) / det;\r
    float radius = uDot * mix(1.0, 0.55, clamp(h.z / uDepth, 0.0, 1.0));\r
    float spot = clamp(radius + 0.5 - length(s), 0.0, 1.0);\r
    float gap = min(spacing.x / foot.x, spacing.y / foot.y);\r
    float r = hash(seed + 7.7);\r
    float flicker = 0.75 + 0.25 * sin(uTime * (3.0 + r * 5.0) + r * 40.0);\r
    float dots = spot * smoothstep(5.0, 10.0, gap) * smoothstep(0.25, 0.6, r) * (0.3 + 0.7 * r * r) * flicker;\r
    float hot = l.core * 2.5 + l.ping * 1.6;\r
    float warm = l.trail * l.trail * 1.3 + l.wake * 0.6 + hover * 1.3;\r
    float spark = dots * (hot + warm) * l.fade * l.reveal;\r
    over(color, mix(uScanColor, uCoreColor, clamp(hot / max(hot + warm, 1e-4), 0.0, 1.0)), spark);\r
    energy += spark * 0.9;\r
  }\r
\r
  if (uHaze > 0.0 && uScanAlpha > 0.0 && uScanZ > 0.0 && h.z > uScanZ) {\r
    vec3 c = p + d * (uScanZ / d.z);\r
    float grain = hash(floor(c.xy * 180.0) + floor(uTime * 24.0) * 7.0);\r
    float edge = min(0.5 * uAspect - abs(c.x), 0.5 - abs(c.y));\r
    float rim = exp(-edge / 0.06);\r
    float veil = uHaze * uScanAlpha * (0.45 + 0.9 * grain) * (0.55 + rim * 1.6);\r
    over(color, uScanColor, veil * depthFade(uScanZ) * l.reveal);\r
  }\r
\r
  energy = clamp(energy, 0.0, 1.0);\r
  outColor = color;\r
  outGlow = vec4(uScanColor * energy, energy);\r
}\`;\r
\r
const DOWN = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uSource;\r
uniform vec2 uTexel;\r
in vec2 vUv;\r
out vec4 outColor;\r
void main() {\r
  vec2 o = uTexel;\r
  outColor = 0.25 * (\r
    texture(uSource, vUv + vec2(-o.x, -o.y)) +\r
    texture(uSource, vUv + vec2(o.x, -o.y)) +\r
    texture(uSource, vUv + vec2(-o.x, o.y)) +\r
    texture(uSource, vUv + vec2(o.x, o.y))\r
  );\r
}\`;\r
\r
const BLUR = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uSource;\r
uniform vec2 uStep;\r
in vec2 vUv;\r
out vec4 outColor;\r
void main() {\r
  vec4 sum = texture(uSource, vUv) * 0.1964825501511404;\r
  sum += (texture(uSource, vUv + uStep * 1.411764705882353) + texture(uSource, vUv - uStep * 1.411764705882353)) * 0.2969069646728344;\r
  sum += (texture(uSource, vUv + uStep * 3.2941176470588234) + texture(uSource, vUv - uStep * 3.2941176470588234)) * 0.09447039785044732;\r
  sum += (texture(uSource, vUv + uStep * 5.176470588235294) + texture(uSource, vUv - uStep * 5.176470588235294)) * 0.010381362401148057;\r
  outColor = sum;\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uScene;\r
uniform sampler2D uBloom;\r
uniform float uGlow;\r
in vec2 vUv;\r
out vec4 outColor;\r
float hash(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * 0.1031);\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.x + q.y) * q.z);\r
}\r
void main() {\r
  vec4 scene = texture(uScene, vUv);\r
  vec4 bloom = texture(uBloom, vUv) * uGlow;\r
  bloom.a = min(bloom.a, 1.0);\r
  bloom.rgb = min(bloom.rgb, vec3(bloom.a));\r
  vec4 color = scene + bloom * (1.0 - scene.a);\r
  float noise = (hash(gl_FragCoord.xy) - 0.5) / 255.0;\r
  color.a = clamp(color.a + noise, 0.0, 1.0);\r
  color.rgb = clamp(color.rgb + noise, vec3(0.0), vec3(color.a));\r
  outColor = color;\r
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
const createTarget = (gl: WebGL2RenderingContext): Target => {\r
  const texture = gl.createTexture();\r
  gl.bindTexture(gl.TEXTURE_2D, texture);\r
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
  return { texture, width: 0, height: 0 };\r
};\r
\r
const sizeTarget = (gl: WebGL2RenderingContext, target: Target, width: number, height: number) => {\r
  if (target.width === width && target.height === height) return;\r
  target.width = width;\r
  target.height = height;\r
  gl.bindTexture(gl.TEXTURE_2D, target.texture);\r
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
};\r
\r
let faceApiLoader: Promise<FaceApi> | null = null;\r
\r
const loadFaceApi = () => {\r
  const scope = window as unknown as FaceScope;\r
  if (scope.faceapi) return Promise.resolve(scope.faceapi);\r
  if (!faceApiLoader) {\r
    faceApiLoader = new Promise<FaceApi>((resolve, reject) => {\r
      const script = document.createElement('script');\r
      script.src = FACE_API_URL;\r
      script.async = true;\r
      script.onload = () => (scope.faceapi ? resolve(scope.faceapi) : reject(new Error('face-api.js')));\r
      script.onerror = () => {\r
        faceApiLoader = null;\r
        reject(new Error('face-api.js'));\r
      };\r
      document.head.appendChild(script);\r
    });\r
  }\r
  return faceApiLoader;\r
};\r
\r
const STATUS_LABELS: Record<Status, string> = {\r
  loading: 'Loading face tracking',\r
  searching: 'Looking for a face',\r
  tracking: 'Tracking',\r
  blocked: 'Camera unavailable'\r
};\r
\r
export const GridScan = ({\r
  linesColor,\r
  scanColor,\r
  cells = 8,\r
  lineThickness = 1,\r
  lineStyle = 'solid',\r
  depth = 3,\r
  depthFade = 0.6,\r
  parallax = 1,\r
  points = true,\r
  reflection = 0.35,\r
  shading = 0.7,\r
  scanDirection = 'forward',\r
  scanDuration = 2.4,\r
  scanDelay = 1.6,\r
  scanWidth = 1,\r
  trail = 0.5,\r
  glow = 0.6,\r
  autoScan = true,\r
  interactive = true,\r
  clickEffect = 'ping',\r
  enableWebcam = false,\r
  showPreview = false,\r
  modelsPath = MODELS_URL,\r
  enableGyro = false,\r
  intro = true,\r
  lightMode = false,\r
  dpr,\r
  className = '',\r
  style,\r
  ...rest\r
}: GridScanProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const videoRef = useRef<HTMLVideoElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const headRef = useRef<Head | null>(null);\r
  const [status, setStatus] = useState<Status>('loading');\r
  const settings: Settings = {\r
    linesColor: linesColor ?? (lightMode ? '#d4d4d8' : '#4d4757'),\r
    scanColor: scanColor ?? (lightMode ? '#0284c7' : '#7dd3fc'),\r
    cells: clamp(cells, 2, 40),\r
    thickness: clamp(lineThickness, 0.5, 4),\r
    style: STYLES[lineStyle] ?? 0,\r
    depth: clamp(depth, 0.5, 12),\r
    depthFade: clamp(depthFade, 0, 1),\r
    parallax: clamp(parallax, 0, 3),\r
    points,\r
    reflection: clamp(reflection, 0, 1),\r
    shading: clamp(shading, 0, 1),\r
    direction: scanDirection,\r
    duration: clamp(scanDuration, 0.3, 20),\r
    delay: clamp(scanDelay, 0, 30),\r
    scanWidth: clamp(scanWidth, 0.2, 5),\r
    trail: clamp(trail, 0, 1),\r
    glow: clamp(glow, 0, 1.5),\r
    autoScan,\r
    interactive,\r
    clickEffect,\r
    enableGyro,\r
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
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const room = link(gl, ROOM);\r
    const down = link(gl, DOWN);\r
    const blur = link(gl, BLUR);\r
    const composite = link(gl, COMPOSITE);\r
    if (!room || !down || !blur || !composite) return undefined;\r
    const vao = gl.createVertexArray();\r
    const scene = createTarget(gl);\r
    const light = createTarget(gl);\r
    const bloomA = createTarget(gl);\r
    const bloomB = createTarget(gl);\r
    const sceneBuffer = gl.createFramebuffer();\r
    const bloomBufferA = gl.createFramebuffer();\r
    const bloomBufferB = gl.createFramebuffer();\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const colorCache = new Map<string, number[]>();\r
    const parse = (value: string): number[] => {\r
      const key = String(value);\r
      const cached = colorCache.get(key);\r
      if (cached) return cached;\r
      let rgb = [1, 1, 1];\r
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
    const eye = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, f: EYE_DISTANCE, vf: 0, tf: EYE_DISTANCE };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const look = { x: 0, y: 0, held: false };\r
    const tilt = { gamma: 0, beta: 0, ready: false, asked: false };\r
    const hover = { x: 0, y: 0, z: 0, strength: 0, ready: false };\r
    const scan = { z: 0, dir: 1, alpha: 0, start: 0, sweeps: 0, waiting: false };\r
    const pings: Ping[] = [];\r
    const pingData = new Float32Array(MAX_PINGS * 4);\r
    const pingAlpha = new Float32Array(MAX_PINGS);\r
    let time = 0;\r
    let introClock = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let leaveTimer = 0;\r
\r
    const roomSize = () => {\r
      const s = settingsRef.current;\r
      const aspect = view.width / view.height;\r
      const cy = 1 / Math.round(s.cells);\r
      const cx = aspect / Math.max(1, Math.round(aspect / cy));\r
      const roomDepth = Math.max(cy, Math.round(s.depth / cy) * cy);\r
      return { aspect, cx, cy, roomDepth };\r
    };\r
\r
    const castRay = (u: number, v: number) => {\r
      const { aspect, roomDepth } = roomSize();\r
      const px = (u - 0.5) * aspect;\r
      const py = v - 0.5;\r
      const dx = px - eye.x;\r
      const dy = py - eye.y;\r
      const dz = eye.f;\r
      const sx = dx > 0 ? 0.5 * aspect : -0.5 * aspect;\r
      const sy = dy > 0 ? 0.5 : -0.5;\r
      let t = roomDepth / dz;\r
      if (Math.abs(dx) > 1e-6) t = Math.min(t, (sx - px) / dx);\r
      if (Math.abs(dy) > 1e-6) t = Math.min(t, (sy - py) / dy);\r
      return { x: px + dx * t, y: py + dy * t, z: dz * t };\r
    };\r
\r
    const startSweep = (s: Settings) => {\r
      scan.dir = s.direction === 'backward' || (s.direction === 'pingpong' && scan.sweeps % 2 === 1) ? -1 : 1;\r
      scan.start = time;\r
      scan.waiting = false;\r
      scan.sweeps += 1;\r
    };\r
\r
    const updateScan = (s: Settings, roomDepth: number) => {\r
      if (introClock < 1) {\r
        const k = introClock;\r
        scan.dir = 1;\r
        scan.z = k * (roomDepth + 0.4) - 0.2;\r
        scan.alpha = Math.min(1, k * 6) * (1 - Math.max(0, k - 0.85) / 0.15);\r
        return;\r
      }\r
      if (scan.sweeps === 0 && !scan.waiting) {\r
        scan.waiting = true;\r
        scan.start = time;\r
        scan.alpha = 0;\r
      }\r
      if (scan.waiting) {\r
        scan.alpha = 0;\r
        if (s.autoScan && !reduce && time - scan.start >= s.delay) startSweep(s);\r
        return;\r
      }\r
      const k = (time - scan.start) / s.duration;\r
      if (k >= 1) {\r
        scan.waiting = true;\r
        scan.start = time;\r
        scan.alpha = 0;\r
        return;\r
      }\r
      const travel = k * (roomDepth + 0.3) - 0.15;\r
      scan.z = scan.dir > 0 ? travel : roomDepth - travel;\r
      scan.alpha = Math.min(1, k / 0.12) * Math.min(1, (1 - k) / 0.12);\r
    };\r
\r
    const updateEye = (dt: number) => {\r
      const steps = Math.max(1, Math.ceil(dt / (1 / 120)));\r
      const h = dt / steps;\r
      for (let i = 0; i < steps; i++) {\r
        eye.vx += ((eye.tx - eye.x) * 42 - eye.vx * 11) * h;\r
        eye.vy += ((eye.ty - eye.y) * 42 - eye.vy * 11) * h;\r
        eye.vf += ((eye.tf - eye.f) * 42 - eye.vf * 11) * h;\r
        eye.x += eye.vx * h;\r
        eye.y += eye.vy * h;\r
        eye.f += eye.vf * h;\r
      }\r
    };\r
\r
    const setLook = (nx: number, ny: number, held: boolean) => {\r
      look.x = clamp(nx, -1, 1);\r
      look.y = clamp(ny, -1, 1);\r
      look.held = held;\r
    };\r
\r
    const aimEye = (s: Settings) => {\r
      const aspect = view.width / view.height;\r
      const drift = reduce ? 0 : 1;\r
      const nx = look.held ? look.x : (Math.sin(time * 0.21) * 0.2 + Math.sin(time * 0.083 + 1.3) * 0.12) * drift;\r
      const ny = look.held ? look.y : Math.sin(time * 0.17 + 2.1) * 0.16 * drift;\r
      eye.tx = nx * s.parallax * 0.22 * aspect;\r
      eye.ty = ny * s.parallax * 0.22;\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      view.width = Math.max(1, container.clientWidth);\r
      view.height = Math.max(1, container.clientHeight);\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(view.width * view.ratio));\r
      canvas.height = Math.max(1, Math.round(view.height * view.ratio));\r
      sizeTarget(gl, scene, canvas.width, canvas.height);\r
      sizeTarget(gl, light, canvas.width, canvas.height);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, sceneBuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, scene.texture, 0);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, light.texture, 0);\r
      const bw = Math.max(1, Math.round(canvas.width / 4));\r
      const bh = Math.max(1, Math.round(canvas.height / 4));\r
      sizeTarget(gl, bloomA, bw, bh);\r
      sizeTarget(gl, bloomB, bw, bh);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, bloomBufferA);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, bloomA.texture, 0);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, bloomBufferB);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, bloomB.texture, 0);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      draw();\r
      wake();\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      const { aspect, cx, cy, roomDepth } = roomSize();\r
      const lineRgb = parse(s.linesColor);\r
      const scanRgb = parse(s.scanColor);\r
      const coreRgb = s.lightMode ? scanRgb : scanRgb.map(c => c + (1 - c) * 0.65);\r
      const ru = room.uniforms;\r
      gl.bindVertexArray(vao);\r
      gl.disable(gl.BLEND);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, sceneBuffer);\r
      gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(room.program);\r
      gl.uniform1f(ru.uAspect, aspect);\r
      gl.uniform1f(ru.uPixel, 1 / canvas.height);\r
      gl.uniform3f(ru.uEye, eye.x, eye.y, -eye.f);\r
      gl.uniform1f(ru.uDepth, roomDepth);\r
      gl.uniform3f(ru.uCell, cx, cy, cy);\r
      gl.uniform1f(ru.uThick, s.thickness * view.ratio * 0.5);\r
      gl.uniform1f(ru.uDot, 1.8 * view.ratio);\r
      gl.uniform1i(ru.uStyle, s.style);\r
      gl.uniform3fv(ru.uLineColor, lineRgb);\r
      gl.uniform3fv(ru.uScanColor, scanRgb);\r
      gl.uniform3fv(ru.uCoreColor, coreRgb);\r
      gl.uniform1f(ru.uFade, s.depthFade);\r
      gl.uniform1f(ru.uScanZ, scan.z);\r
      gl.uniform1f(ru.uScanDir, scan.dir);\r
      gl.uniform1f(ru.uScanAlpha, scan.alpha);\r
      gl.uniform1f(ru.uScanWidth, 0.006 * s.scanWidth);\r
      gl.uniform1f(ru.uTrail, 0.04 + s.trail * 1.1);\r
      gl.uniform1f(ru.uReveal, introClock < 1 ? scan.z + 0.05 : 1e4);\r
      gl.uniform1f(ru.uPoints, s.points ? 1 : 0);\r
      gl.uniform1f(ru.uReflect, s.reflection);\r
      gl.uniform1f(ru.uHaze, s.lightMode ? 0.03 : 0.05);\r
      gl.uniform1f(ru.uShade, s.shading);\r
      gl.uniform1f(ru.uLight, s.lightMode ? 1 : 0);\r
      gl.uniform4fv(ru.uPing, pingData);\r
      gl.uniform1fv(ru.uPingAlpha, pingAlpha);\r
      gl.uniform4f(ru.uHover, hover.x, hover.y, hover.z, hover.strength);\r
      gl.uniform1f(ru.uTime, time);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      const glowing = s.glow > 0;\r
      if (glowing) {\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, bloomBufferA);\r
        gl.viewport(0, 0, bloomA.width, bloomA.height);\r
        gl.useProgram(down.program);\r
        gl.activeTexture(gl.TEXTURE0);\r
        gl.bindTexture(gl.TEXTURE_2D, light.texture);\r
        gl.uniform1i(down.uniforms.uSource, 0);\r
        gl.uniform2f(down.uniforms.uTexel, 1 / light.width, 1 / light.height);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
        const spread = (2.2 * view.ratio) / 2;\r
        gl.useProgram(blur.program);\r
        gl.uniform1i(blur.uniforms.uSource, 0);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, bloomBufferB);\r
        gl.bindTexture(gl.TEXTURE_2D, bloomA.texture);\r
        gl.uniform2f(blur.uniforms.uStep, spread / bloomA.width, 0);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, bloomBufferA);\r
        gl.bindTexture(gl.TEXTURE_2D, bloomB.texture);\r
        gl.uniform2f(blur.uniforms.uStep, 0, spread / bloomA.height);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      }\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(composite.program);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, scene.texture);\r
      gl.uniform1i(composite.uniforms.uScene, 0);\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.bindTexture(gl.TEXTURE_2D, bloomA.texture);\r
      gl.uniform1i(composite.uniforms.uBloom, 1);\r
      gl.uniform1f(composite.uniforms.uGlow, glowing ? s.glow * (s.lightMode ? 0.8 : 1.6) : 0);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.activeTexture(gl.TEXTURE0);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.001, 0.05) : 1 / 60;\r
      last = now;\r
      time += dt;\r
      if (introClock < 1) introClock = Math.min(1, introClock + dt / INTRO_SECONDS);\r
      const { roomDepth } = roomSize();\r
      updateScan(s, roomDepth);\r
      aimEye(s);\r
      updateEye(dt);\r
\r
      const aim = s.interactive && pointer.inside && !reduce ? 1 : 0;\r
      if (aim) {\r
        const target = castRay(pointer.x, pointer.y);\r
        if (!hover.ready) Object.assign(hover, target, { ready: true });\r
        const follow = 1 - Math.exp(-dt / 0.08);\r
        hover.x += (target.x - hover.x) * follow;\r
        hover.y += (target.y - hover.y) * follow;\r
        hover.z += (target.z - hover.z) * follow;\r
      }\r
      hover.strength += (aim - hover.strength) * (1 - Math.exp(-dt / 0.25));\r
      if (!aim && hover.strength < 0.01) hover.ready = false;\r
\r
      for (let i = pings.length - 1; i >= 0; i--) {\r
        pings[i].age += dt;\r
        if (pings[i].age > PING_LIFE) pings.splice(i, 1);\r
      }\r
      for (let i = 0; i < MAX_PINGS; i++) {\r
        const ping = pings[i];\r
        if (!ping) {\r
          pingAlpha[i] = 0;\r
          continue;\r
        }\r
        const k = ping.age / PING_LIFE;\r
        pingData.set([ping.x, ping.y, ping.z, ping.age * 1.15], i * 4);\r
        pingAlpha[i] = Math.min(1, ping.age / 0.05) * (1 - k) * (1 - k);\r
      }\r
\r
      draw();\r
\r
      const settling =\r
        Math.abs(eye.tx - eye.x) + Math.abs(eye.ty - eye.y) + Math.abs(eye.tf - eye.f) > 1e-4 ||\r
        Math.abs(eye.vx) + Math.abs(eye.vy) + Math.abs(eye.vf) > 1e-4;\r
      const busy =\r
        introClock < 1 ||\r
        (!reduce && s.autoScan) ||\r
        !scan.waiting ||\r
        pings.length > 0 ||\r
        settling ||\r
        hover.strength > 0.002 ||\r
        (!reduce && s.parallax > 0 && !look.held) ||\r
        (s.points && !reduce && scan.alpha > 0);\r
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
      const u = (event.clientX - rect.left) / Math.max(1, rect.width);\r
      const v = 1 - (event.clientY - rect.top) / Math.max(1, rect.height);\r
      return { u, v, inside: u >= 0 && u <= 1 && v >= 0 && v <= 1 };\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      const { u, v, inside } = locate(event);\r
      pointer.x = u;\r
      pointer.y = v;\r
      const was = pointer.inside;\r
      pointer.inside = inside;\r
      if (inside) {\r
        window.clearTimeout(leaveTimer);\r
        leaveTimer = 0;\r
        if (!headRef.current?.active && s.interactive && !reduce) setLook(u * 2 - 1, v * 2 - 1, true);\r
        wake();\r
      } else if (was && !leaveTimer) {\r
        leaveTimer = window.setTimeout(() => {\r
          leaveTimer = 0;\r
          if (!headRef.current?.active) look.held = false;\r
          wake();\r
        }, 220);\r
        wake();\r
      }\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      const { u, v, inside } = locate(event);\r
      if (!inside || reduce || s.clickEffect === 'none') return;\r
      if (s.clickEffect === 'scan') {\r
        if (introClock >= 1) startSweep(s);\r
      } else {\r
        const hit = castRay(u, v);\r
        pings.unshift({ ...hit, age: 0 });\r
        if (pings.length > MAX_PINGS) pings.pop();\r
      }\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      if (!headRef.current?.active) look.held = false;\r
      wake();\r
    };\r
\r
    const onOrientation = (event: DeviceOrientationEvent) => {\r
      const s = settingsRef.current;\r
      if (!s.enableGyro || headRef.current?.active || reduce || event.gamma === null || event.beta === null) return;\r
      if (!tilt.ready) Object.assign(tilt, { gamma: event.gamma, beta: event.beta, ready: true });\r
      setLook((event.gamma - tilt.gamma) / 25, (event.beta - tilt.beta) / -25, true);\r
      wake();\r
    };\r
\r
    const onClick = () => {\r
      const s = settingsRef.current;\r
      const request = (\r
        window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> } | undefined\r
      )?.requestPermission;\r
      if (!s.enableGyro || tilt.asked || typeof request !== 'function') return;\r
      tilt.asked = true;\r
      request.call(window.DeviceOrientationEvent).catch(() => {});\r
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
    window.addEventListener('deviceorientation', onOrientation);\r
    window.addEventListener('click', onClick);\r
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    headRef.current = {\r
      active: false,\r
      move: (nx, ny, near) => {\r
        if (reduce) return;\r
        setLook(nx * 1.3, ny * 1.3, true);\r
        eye.tf = EYE_DISTANCE * clamp(near, 0.6, 1.6);\r
        wake();\r
      },\r
      release: () => {\r
        eye.tf = EYE_DISTANCE;\r
        look.held = false;\r
        wake();\r
      }\r
    };\r
    resize();\r
    wakeRef.current = wake;\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      window.clearTimeout(leaveTimer);\r
      wakeRef.current = null;\r
      headRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('deviceorientation', onOrientation);\r
      window.removeEventListener('click', onClick);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      [scene, light, bloomA, bloomB].forEach(target => gl.deleteTexture(target.texture));\r
      [sceneBuffer, bloomBufferA, bloomBufferB].forEach(buffer => gl.deleteFramebuffer(buffer));\r
      gl.deleteVertexArray(vao);\r
      [room, down, blur, composite].forEach(item => gl.deleteProgram(item.program));\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  useEffect(() => {\r
    if (!enableWebcam) return undefined;\r
    const video = videoRef.current;\r
    if (!video) return undefined;\r
    let stopped = false;\r
    let stream: MediaStream | null = null;\r
    let timer = 0;\r
    let lost = 0;\r
    const smooth = { x: 0, y: 0, near: 1, ready: false };\r
    setStatus('loading');\r
\r
    const run = async () => {\r
      try {\r
        const faceapi = await loadFaceApi();\r
        await faceapi.nets.tinyFaceDetector.loadFromUri(modelsPath);\r
        if (stopped) return;\r
        stream = await navigator.mediaDevices.getUserMedia({\r
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },\r
          audio: false\r
        });\r
        if (stopped) {\r
          stream.getTracks().forEach(track => track.stop());\r
          return;\r
        }\r
        video.srcObject = stream;\r
        await video.play();\r
        setStatus('searching');\r
        const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.45 });\r
        const detect = async () => {\r
          if (stopped) return;\r
          let result = null;\r
          try {\r
            result = await faceapi.detectSingleFace(video, options);\r
          } catch {\r
            result = null;\r
          }\r
          if (stopped) return;\r
          const head = headRef.current;\r
          if (result && head) {\r
            const box = result.box;\r
            const vw = video.videoWidth || 1;\r
            const vh = video.videoHeight || 1;\r
            const x = -((box.x + box.width / 2) / vw - 0.5) * 2;\r
            const y = -((box.y + box.height / 2) / vh - 0.5) * 2;\r
            const near = 0.32 / Math.max(0.08, box.width / vw);\r
            const k = smooth.ready ? 0.45 : 1;\r
            smooth.x += (x - smooth.x) * k;\r
            smooth.y += (y - smooth.y) * k;\r
            smooth.near += (near - smooth.near) * k;\r
            smooth.ready = true;\r
            lost = 0;\r
            head.active = true;\r
            head.move(smooth.x, smooth.y, smooth.near);\r
            setStatus('tracking');\r
          } else if (head && ++lost > 12 && head.active) {\r
            head.active = false;\r
            smooth.ready = false;\r
            head.release();\r
            setStatus('searching');\r
          }\r
          timer = window.setTimeout(detect, 40);\r
        };\r
        detect();\r
      } catch {\r
        if (!stopped) setStatus('blocked');\r
      }\r
    };\r
    run();\r
\r
    return () => {\r
      stopped = true;\r
      window.clearTimeout(timer);\r
      stream?.getTracks().forEach(track => track.stop());\r
      video.srcObject = null;\r
      const head = headRef.current;\r
      if (head?.active) {\r
        head.active = false;\r
        head.release();\r
      }\r
    };\r
  }, [enableWebcam, modelsPath]);\r
\r
  return (\r
    <div\r
      ref={containerRef}\r
      className={['relative h-full w-full overflow-hidden', className].filter(Boolean).join(' ')}\r
      style={style}\r
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
      {enableWebcam && (\r
        <div\r
          className={\r
            showPreview\r
              ? 'pointer-events-none absolute bottom-3 right-3 aspect-[4/3] w-[168px] overflow-hidden rounded-[14px] bg-[#0b0b0e] shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_24px_rgba(0,0,0,0.35)]'\r
              : 'pointer-events-none absolute h-px w-px overflow-hidden opacity-0'\r
          }\r
        >\r
          <video ref={videoRef} className="block h-full w-full -scale-x-100 object-cover" muted playsInline />\r
          {showPreview && (\r
            <span className="absolute bottom-2 left-2 rounded-lg bg-[rgba(10,10,12,0.6)] px-2 py-[3px] font-sans text-[11px] font-medium leading-[1.4] text-white backdrop-blur-sm">\r
              {STATUS_LABELS[status]}\r
            </span>\r
          )}\r
        </div>\r
      )}\r
    </div>\r
  );\r
};\r
\r
export default GridScan;\r
`,a={usage:`import GridScan from './GridScan';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <GridScan
    linesColor="#4d4757"
    scanColor="#7dd3fc"
    cells={8}
    depth={3}
    scanDuration={2.4}
    scanDelay={1.6}
    clickEffect="ping"
  />
</div>`,code:r,css:n,tailwind:e,tsCode:t,tsTailwind:o};export{a as gridScan};
