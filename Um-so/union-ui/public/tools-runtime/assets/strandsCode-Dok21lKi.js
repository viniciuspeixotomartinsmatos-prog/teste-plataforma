const r=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
import './Strands.css';\r
\r
const MAX_COLORS = 8;\r
const ROLES = 7;\r
\r
const VERT = \`#version 300 es\r
in vec2 position;\r
void main() {\r
  gl_Position = vec4(position, 0.0, 1.0);\r
}\r
\`;\r
\r
const FRAG = \`#version 300 es\r
precision highp float;\r
\r
uniform vec2 uResolution;\r
uniform vec3 uMotion;\r
uniform float uLevel;\r
uniform vec3 uColors[8];\r
uniform int uCount;\r
uniform float uAmplitude;\r
uniform float uWaviness;\r
uniform float uThickness;\r
uniform float uGlow;\r
uniform float uTaper;\r
uniform float uSpread;\r
uniform float uHueShift;\r
uniform float uIntensity;\r
uniform float uSaturation;\r
uniform float uScale;\r
uniform float uGlass;\r
uniform float uRadius;\r
uniform float uRefraction;\r
uniform float uDispersion;\r
uniform float uRim;\r
uniform vec2 uLean;\r
uniform float uIntro;\r
uniform float uPulse;\r
uniform float uLight;\r
uniform float uOpacity;\r
\r
out vec4 fragColor;\r
\r
const int NB = 10;\r
const float PI = 3.14159265;\r
\r
vec3 hueRotate(vec3 c, float a) {\r
  const mat3 toYiq = mat3(0.299, 0.596, 0.211, 0.587, -0.274, -0.523, 0.114, -0.322, 0.312);\r
  const mat3 toRgb = mat3(1.0, 1.0, 1.0, 0.956, -0.272, -1.106, 0.621, -0.647, 1.703);\r
  vec3 yiq = toYiq * c;\r
  float ca = cos(a);\r
  float sa = sin(a);\r
  yiq.yz = mat2(ca, sa, -sa, ca) * yiq.yz;\r
  return max(toRgb * yiq, 0.0);\r
}\r
\r
vec3 grade(vec3 c) {\r
  float g = dot(c, vec3(0.2126, 0.7152, 0.0722));\r
  c = clamp(mix(vec3(g), c, 1.5 * uSaturation), 0.0, 1.0);\r
  return hueRotate(c, uHueShift * 6.2831853);\r
}\r
\r
vec3 lightInk(vec3 L, float halo, vec3 body) {\r
  vec3 Lg = grade(L);\r
  float lum = dot(Lg, vec3(0.2126, 0.7152, 0.0722));\r
  float cov = 1.0 - exp(-lum * 2.6);\r
  vec3 hue = Lg / max(max(Lg.r, max(Lg.g, Lg.b)), 1e-4);\r
  float white = pow(clamp(min(hue.r, min(hue.g, hue.b)), 0.0, 1.0), 1.4);\r
  vec3 ink = pow(hue, vec3(2.2)) * 0.88;\r
  float coreAmt = white * smoothstep(0.05, 2.2, lum) * 0.92;\r
  vec3 cream = mix(mix(uColors[3], vec3(1.0), 0.3), vec3(1.0, 0.985, 0.95), smoothstep(1.2, 3.5, lum));\r
  vec3 c = mix(body, vec3(0.66, 0.69, 0.76), halo * 0.32);\r
  c = mix(c, ink, cov * (1.0 - white));\r
  return mix(c, cream, clamp(coreAmt, 0.0, 1.0));\r
}\r
\r
float sstep(float a, float b, float x) {\r
  float t = clamp((x - a) / (b - a), 0.0, 1.0);\r
  return t * t * (3.0 - 2.0 * t);\r
}\r
\r
float erfa(float x) {\r
  float a = abs(x);\r
  float t = 1.0 / (1.0 + 0.3275911 * a);\r
  float y = 1.0 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * exp(-a * a);\r
  return x < 0.0 ? -y : y;\r
}\r
\r
vec3 grad4(vec3 c0, vec3 c1, vec3 c2, vec3 c3, float p1, float p2, float f) {\r
  vec3 c = mix(c0, c1, sstep(0.0, p1, f));\r
  c = mix(c, c2, sstep(p1, p2, f));\r
  return mix(c, c3, sstep(p2, 1.0, f));\r
}\r
\r
float smaxk(float a, float b, float k) {\r
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);\r
  return mix(a, b, h) + k * h * (1.0 - h);\r
}\r
\r
vec2 sheetW(float tt, float H, float sig, float sigB, float ridges) {\r
  float ew = 0.04 * uThickness;\r
  float res0;\r
  float res1;\r
  for (int pass = 0; pass < 2; pass++) {\r
    float sg = pass == 0 ? sig : sigB;\r
    float fill = 0.5 * (erfa(tt / sg) - erfa((tt - H) / sg)) / H;\r
    float se = sqrt(sg * sg + 0.25 * ew * ew * H * H);\r
    float de = (tt - H + 0.5 * ew * H) / se;\r
    float eg = exp(-de * de) / (se * 1.7724539);\r
    float rgw = sqrt(sg * sg + 0.0025 * H * H);\r
    float d1 = (tt - 0.45 * H) / rgw;\r
    float d2 = (tt - 0.241 * H) / rgw;\r
    float rid = 0.04 * (exp(-d1 * d1) * step(1.5, ridges) + 0.7 * exp(-d2 * d2) * step(2.5, ridges)) / (rgw * 1.7724539);\r
    float v = 0.6 * fill * (1.0 - 0.55 * uLight) + (1.6 * ew * 0.886 * eg + rid) * (1.0 + 1.3 * uLight);\r
    if (pass == 0) res0 = v;\r
    else res1 = v;\r
  }\r
  return vec2(res0, res1);\r
}\r
\r
float axis(float x) {\r
  float a = uAmplitude;\r
  return -0.2318 + uLean.y * 0.06 + (-0.2394 + uLean.x * 0.1) * x + 0.2815 * a * x * x + 0.3368 * a * x * x * x;\r
}\r
\r
float softp(float z) {\r
  return 0.03 * log(1.0 + exp(clamp(z / 0.03, -60.0, 60.0)));\r
}\r
\r
vec3 light(vec2 u, float fp, float bend, float level, out float halo) {\r
  float amp = level < 0.65 ? mix(0.25, 1.0, sstep(0.0, 0.65, level)) : mix(1.0, 1.12, (level - 0.65) / 0.35);\r
  float grow = clamp((amp - 0.25) / 0.75, 0.0, 1.25);\r
  float x = u.x / uScale;\r
  float uy = u.y;\r
  float ya = axis(x);\r
  float taper = max(uTaper, 0.05);\r
  float bx = 0.0437 + uMotion.z + uLean.x * 0.08;\r
  float bump = exp(-pow((x - bx) / (0.6879 * taper), 2.0));\r
  float hW = 0.02 + softp(-0.12 + 0.5324 * uAmplitude * grow * uMotion.y * bump - 0.02);\r
  float k = 1.0 * uWaviness;\r
  float cphi = cos(0.5 * PI + k * (x + 0.0664) + uMotion.x);\r
  float envC = (0.0886 + 0.3 * exp(-pow((x - 0.0634) / 0.6873, 2.0))) * uSpread * grow;\r
  float hC = -envC * tanh(cphi / 0.6);\r
  float th = 0.051 * uThickness * exp(-pow(cphi / 0.5, 2.0));\r
  float sig = sqrt(pow(0.005 + 0.05 * bend, 2.0) + fp * fp + th * th);\r
  float sigB = sqrt(0.0064 * max(uGlow, 0.05) * max(uGlow, 0.05) + fp * fp + th * th);\r
  float mend = exp(-pow(abs((x + 0.0421) / (0.4235 * taper)), 2.2689));\r
  vec3 red = uColors[0];\r
  vec3 orange = uColors[1];\r
  vec3 amber = uColors[2];\r
  vec3 warmWhite = uColors[3];\r
  vec3 cyan = uColors[4];\r
  vec3 blue = uColors[5];\r
  vec3 deep = uColors[6];\r
  vec3 orangeEdge = orange * vec3(1.0, 0.85, 0.77);\r
  vec3 coolCore = mix(warmWhite, vec3(1.0, 1.0, 0.7), 0.6);\r
  vec3 mint = clamp(mix(cyan, warmWhite, 0.35) * vec3(0.92, 1.05, 0.95), 0.0, 1.0);\r
  float ridges = float(uCount);\r
  float glow = max(uGlow, 0.0);\r
  vec3 L = vec3(0.0);\r
  vec3 Lb = vec3(0.0);\r
  {\r
    float H = max(abs(hW), 1e-4);\r
    float tt = uy - ya;\r
    vec2 w = sheetW(tt, H, sig, sigB, ridges);\r
    float f = clamp(tt / H, 0.0, 1.0);\r
    vec3 c = grad4(warmWhite, amber, orange, orangeEdge, 0.2351, 0.5643, f);\r
    c = mix(c, red, sstep(0.75, 1.0, f) * sstep(0.196, 0.3376, hW));\r
    vec3 mean = (grad4(warmWhite, amber, orange, orangeEdge, 0.2351, 0.5643, 0.1) + grad4(warmWhite, amber, orange, orangeEdge, 0.2351, 0.5643, 0.35) + grad4(warmWhite, amber, orange, orangeEdge, 0.2351, 0.5643, 0.6) + grad4(warmWhite, amber, orange, orangeEdge, 0.2351, 0.5643, 0.9)) * 0.25;\r
    L += mix(c, mean, sstep(0.3, 1.2, sig / H)) * (w.x * 0.2101 * mend);\r
    Lb += mix(c, mean, sstep(0.3, 1.2, sigB / H)) * (w.y * 0.2101 * mend);\r
  }\r
  {\r
    float H = max(abs(hC), 1e-4);\r
    float tt = (uy - ya) * (hC >= 0.0 ? 1.0 : -1.0);\r
    vec2 w = sheetW(tt, H, sig, sigB, 1.0);\r
    float f = clamp(tt / H, 0.0, 1.0);\r
    vec3 c = grad4(coolCore, cyan, blue, deep, 0.15, 0.7931, f);\r
    vec3 mean = (grad4(coolCore, cyan, blue, deep, 0.15, 0.7931, 0.1) + grad4(coolCore, cyan, blue, deep, 0.15, 0.7931, 0.35) + grad4(coolCore, cyan, blue, deep, 0.15, 0.7931, 0.6) + grad4(coolCore, cyan, blue, deep, 0.15, 0.7931, 0.9)) * 0.25;\r
    L += mix(c, mean, sstep(0.3, 1.2, sig / H)) * (w.x * 0.28 * mend);\r
    Lb += mix(c, mean, sstep(0.3, 1.2, sigB / H)) * (w.y * 0.28 * mend);\r
  }\r
  vec3 G = vec3(0.0);\r
  float wh = sqrt(0.0256 + envC * envC * cphi * cphi);\r
  float dg = (uy - ya) / wh;\r
  G += vec3(1.0, 0.97, 0.92) * (exp(-dg * dg) * 0.0315 / wh * mend * glow);\r
  float nx = -0.0664 - uMotion.x / k + 0.2168;\r
  float bxx = (x - nx) / 0.1849;\r
  float byy = (uy - axis(nx) - 0.0333) / (0.0544 * mix(0.7, 1.0, min(amp, 1.0)));\r
  G += mint * (exp(-bxx * bxx - byy * byy) * 1.4 * glow * sstep(0.0, 0.6, amp));\r
  float hb = (uy - ya - 0.3 * hW) / (0.07 + 0.45 * hW + 0.3 * envC);\r
  halo = exp(-hb * hb) * mend * smoothstep(0.0, 0.3, uIntro);\r
  vec3 total = L + 0.16 * glow * Lb + 1.16 * G;\r
  return total * 2.4 * uIntensity * smoothstep(0.0, 0.3, uIntro) * sstep(uIntro * 1.6, uIntro * 1.6 - 0.5, abs(x));\r
}\r
\r
vec2 remap(vec2 p, float f, out float r, out float bend) {\r
  r = min(length(p), 0.9995);\r
  bend = pow(r, 5.17);\r
  float k = clamp(uRefraction, 0.0, 1.8);\r
  float sc = (1.0 - 0.278 * k * (1.0 - bend)) * (1.0 - 0.632 * k * bend) / (1.0 - 0.278 * k);\r
  return p * sc * f;\r
}\r
\r
void main() {\r
  vec2 res = uResolution;\r
  vec2 p = (gl_FragCoord.xy - 0.5 * res) / min(res.x, res.y);\r
  float level = clamp(uLevel, 0.0, 1.0);\r
  float appear = smoothstep(0.0, 0.35, uIntro);\r
\r
  if (uGlass > 0.5) {\r
    float R = uRadius * mix(0.94, 1.0, uIntro) * (1.0 + 0.03 * uPulse);\r
    float px = 1.0 / (min(res.x, res.y) * R);\r
    vec2 pc = p / R;\r
    float rho = length(pc);\r
    if (rho > 1.0 + 2.0 * px) {\r
      float sh = uLight * 0.07 * exp(-pow((rho - 0.985) / 0.07, 2.0)) * smoothstep(-0.6, 0.4, -pc.y) * appear * uOpacity;\r
      fragColor = vec4(0.0, 0.0, 0.0, sh);\r
      return;\r
    }\r
    float r;\r
    float bend;\r
    vec2 u = remap(pc, 1.0, r, bend);\r
    float fp = 0.5 * max(length(dFdx(u)), length(dFdy(u)));\r
    float halo;\r
    float skip;\r
    vec3 L = light(u, fp, bend, level, halo);\r
    float ca = 0.02 * uDispersion * bend;\r
    if (ca > 0.0015) {\r
      float r2;\r
      float b2;\r
      L.r = light(remap(pc, 1.0 - ca, r2, b2), fp, bend, level, skip).r;\r
      L.b = light(remap(pc, 1.0 + ca, r2, b2), fp, bend, level, skip).b;\r
    }\r
    vec3 col = 1.0 - exp(-L);\r
    vec2 d = pc / max(rho, 1e-6);\r
    float key = 0.4 * pow(max(0.0, d.x * 0.94 - d.y * 0.34), 6.0) + 0.2 * pow(max(0.0, -d.x * 0.5 + d.y * 0.87), 6.0);\r
    float ring = exp(-pow((r - 0.985) / 0.011, 2.0));\r
    float hzk = 0.25 + 0.7 * pow(max(0.0, -d.x * 0.6 + d.y * 0.8), 2.0) + pow(max(0.0, d.x * 0.8 - d.y * 0.6), 2.0);\r
    float haze = exp(-pow((1.0 - r) / 0.09, 2.0)) * hzk * 0.13 * uRim;\r
    vec3 orb;\r
    if (uLight > 0.5) {\r
      float lz = dot(d * r, vec2(-0.55, 0.83));\r
      vec3 body = mix(vec3(0.885, 0.893, 0.915), vec3(0.972, 0.975, 0.983), 0.5 + 0.5 * lz);\r
      float fres = smoothstep(0.8, 1.0, r);\r
      body = mix(body, vec3(0.82, 0.83, 0.86), fres * fres * 0.5);\r
      orb = lightInk(L, halo, body);\r
      float spec = exp(-pow((r - 0.955) / 0.03, 2.0)) * pow(max(0.0, dot(d, vec2(-0.55, 0.83))), 3.0);\r
      orb = mix(orb, vec3(1.0), clamp(spec * 0.85 * uRim + haze * 0.6, 0.0, 1.0));\r
      float edge = exp(-pow((1.0 - r) / (0.01 + 1.2 * px), 2.0));\r
      orb *= 1.0 - 0.12 * edge;\r
    } else {\r
      orb = vec3(0.04) + col * (1.0 + 0.1 * bend * uRim) + ring * key * uRim * (1.0 + 0.4 * level) + haze * vec3(1.0, 1.02, 1.04);\r
      orb = grade(clamp(orb, 0.0, 1.0));\r
    }\r
    float inside = clamp((1.0 - rho) / px + 0.5, 0.0, 1.0) * appear;\r
    vec3 rgb = orb * inside;\r
    fragColor = vec4(rgb, max(inside * mix(0.92, 1.0, uLight), max(max(rgb.r, rgb.g), rgb.b))) * uOpacity;\r
  } else {\r
    float span = 0.5 * res.x / min(res.x, res.y);\r
    vec2 u = p * (0.78 / span) + vec2(0.0, -0.15);\r
    float fp = 0.5 * max(length(dFdx(u)), length(dFdy(u)));\r
    float halo;\r
    float fade = sstep(0.82, 0.55, abs(u.x));\r
    vec3 L = light(u, fp, 0.0, level, halo) * fade;\r
    vec3 col = grade(1.0 - exp(-L)) * appear;\r
    if (uLight > 0.5) {\r
      vec3 c = lightInk(L, halo * fade * 0.6, vec3(1.0));\r
      float a = clamp(1.0 - min(c.r, min(c.g, c.b)), 0.0, 1.0) * appear;\r
      fragColor = vec4((c - (1.0 - a)) * appear, a) * uOpacity;\r
    } else {\r
      fragColor = vec4(col, max(max(col.r, col.g), col.b)) * uOpacity;\r
    }\r
  }\r
}\r
\`;\r
\r
const hexToRgb = hex => {\r
  let h = String(hex).replace('#', '').trim();\r
  if (h.length === 3) h = h.replace(/(.)/g, '$1$1');\r
  const v = parseInt(h.slice(0, 6), 16);\r
  if (!isFinite(v)) return [1, 1, 1];\r
  return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];\r
};\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const compile = (gl, type, source) => {\r
  const shader = gl.createShader(type);\r
  gl.shaderSource(shader, source);\r
  gl.compileShader(shader);\r
  return shader;\r
};\r
\r
const createProgram = gl => {\r
  const program = gl.createProgram();\r
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));\r
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));\r
  gl.bindAttribLocation(program, 0, 'position');\r
  gl.linkProgram(program);\r
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;\r
  return program;\r
};\r
\r
const smooth = (a, b, x) => {\r
  const k = Math.min(1, Math.max(0, (x - a) / (b - a)));\r
  return k * k * (3 - 2 * k);\r
};\r
\r
const speech = t => {\r
  const phrase = smooth(-0.8, -0.3, 0.6 * Math.sin(t * 2.7) + 0.5 * Math.sin(t * 1.53 + 1.2));\r
  const syllable = Math.max(0, Math.sin(t * 17 + 1.6 * Math.sin(t * 5.3)));\r
  const stress = 0.6 + 0.4 * Math.sin(t * 3.7 + 0.7);\r
  return phrase * (0.35 + 0.65 * syllable) * (0.25 + stress);\r
};\r
\r
const DEFAULT_COLORS = ['#d95b56', '#ba5046', '#ffa24c', '#ffe0b3', '#93f1ff', '#3569fa', '#193d9b'];\r
\r
export default function Strands({\r
  colors = DEFAULT_COLORS,\r
  count = 3,\r
  speed = 1,\r
  amplitude = 1,\r
  waviness = 1,\r
  thickness = 1,\r
  glow = 1,\r
  taper = 1,\r
  spread = 1,\r
  hueShift = 0,\r
  intensity = 1,\r
  saturation = 1,\r
  opacity = 1,\r
  scale = 1,\r
  glass = true,\r
  refraction = 1,\r
  dispersion = 1,\r
  glassSize = 1,\r
  rim = 1,\r
  energy = 0.65,\r
  listening = false,\r
  level,\r
  interactive = true,\r
  clickPulse = true,\r
  intro = true,\r
  lightMode = false,\r
  maxDevicePixelRatio = 2,\r
  className = '',\r
  style\r
}) {\r
  const containerRef = useRef(null);\r
  const propsRef = useRef(null);\r
  propsRef.current = {\r
    colors,\r
    count,\r
    speed,\r
    amplitude,\r
    waviness,\r
    thickness,\r
    glow,\r
    taper,\r
    spread,\r
    hueShift,\r
    intensity,\r
    saturation,\r
    opacity,\r
    scale,\r
    glass,\r
    refraction,\r
    dispersion,\r
    glassSize,\r
    rim,\r
    energy,\r
    listening,\r
    level,\r
    interactive,\r
    clickPulse,\r
    intro,\r
    lightMode,\r
    maxDevicePixelRatio\r
  };\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    if (!container) return;\r
    const canvas = document.createElement('canvas');\r
    canvas.style.display = 'block';\r
    canvas.style.width = '100%';\r
    canvas.style.height = '100%';\r
    canvas.setAttribute('aria-hidden', 'true');\r
    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });\r
    if (!gl) return;\r
    container.appendChild(canvas);\r
\r
    let program = null;\r
    let buffer = null;\r
    let loc = {};\r
    const names = [\r
      'uResolution',\r
      'uMotion',\r
      'uLevel',\r
      'uColors',\r
      'uCount',\r
      'uAmplitude',\r
      'uWaviness',\r
      'uThickness',\r
      'uGlow',\r
      'uTaper',\r
      'uSpread',\r
      'uHueShift',\r
      'uIntensity',\r
      'uSaturation',\r
      'uScale',\r
      'uGlass',\r
      'uRadius',\r
      'uRefraction',\r
      'uDispersion',\r
      'uRim',\r
      'uLean',\r
      'uIntro',\r
      'uPulse',\r
      'uLight',\r
      'uOpacity'\r
    ];\r
    const setup = () => {\r
      const next = createProgram(gl);\r
      if (!next) return false;\r
      program = next;\r
      buffer = gl.createBuffer();\r
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
      gl.enableVertexAttribArray(0);\r
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
      gl.useProgram(next);\r
      loc = Object.fromEntries(names.map(name => [name, gl.getUniformLocation(next, name)]));\r
      gl.disable(gl.BLEND);\r
      gl.clearColor(0, 0, 0, 0);\r
      return true;\r
    };\r
    if (!setup()) {\r
      canvas.remove();\r
      return;\r
    }\r
\r
    const query =\r
      typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;\r
    const st = {\r
      clock: 0,\r
      pace: 0,\r
      activity: 0,\r
      hover: 0,\r
      hoverTarget: 0,\r
      burst: 0,\r
      lean: [0, 0],\r
      leanTarget: [0, 0],\r
      pulse: 0,\r
      pulseV: 0,\r
      introStart: -1,\r
      intro: propsRef.current.intro ? 0 : 1,\r
      visible: typeof IntersectionObserver === 'undefined',\r
      lost: false,\r
      raf: 0,\r
      last: 0,\r
      width: 0,\r
      height: 0,\r
      speechT: 0,\r
      paletteKey: '',\r
      palette: { flat: new Float32Array(MAX_COLORS * 3), count: 1 }\r
    };\r
\r
    const resize = () => {\r
      const dpr = Math.min(window.devicePixelRatio || 1, Math.max(0.5, propsRef.current.maxDevicePixelRatio));\r
      const w = Math.max(1, Math.round(container.clientWidth * dpr));\r
      const h = Math.max(1, Math.round(container.clientHeight * dpr));\r
      if (w !== st.width || h !== st.height) {\r
        st.width = w;\r
        st.height = h;\r
        canvas.width = w;\r
        canvas.height = h;\r
      }\r
    };\r
\r
    const updatePalette = list => {\r
      const key = list.join(',');\r
      if (key === st.paletteKey) return;\r
      st.paletteKey = key;\r
      const rgb = (list.length ? list : DEFAULT_COLORS).slice(0, MAX_COLORS).map(hexToRgb);\r
      const flat = new Float32Array(MAX_COLORS * 3);\r
      for (let i = 0; i < ROLES; i++) {\r
        const t = rgb.length > 1 ? (i / (ROLES - 1)) * (rgb.length - 1) : 0;\r
        const a = Math.floor(t);\r
        const b = Math.min(a + 1, rgb.length - 1);\r
        const f = t - a;\r
        flat.set(\r
          rgb[a].map((c, k) => c + (rgb[b][k] - c) * f),\r
          i * 3\r
        );\r
      }\r
      st.palette = { flat, count: ROLES };\r
    };\r
\r
    const draw = () => {\r
      if (st.lost || !program) return;\r
      const p = propsRef.current;\r
      updatePalette(Array.isArray(p.colors) ? p.colors : []);\r
      gl.viewport(0, 0, st.width, st.height);\r
      gl.uniform2f(loc.uResolution, st.width, st.height);\r
      const c = st.clock;\r
      const sway = 0.75 + 0.45 * st.pace;\r
      gl.uniform3f(\r
        loc.uMotion,\r
        (0.26 * Math.sin(0.53 * c) + 0.1 * Math.sin(1.19 * c + 1.3)) * sway,\r
        1 + (0.06 * Math.sin(0.71 * c) + 0.035 * Math.sin(1.37 * c + 0.4)) * sway,\r
        0.06 * Math.sin(0.41 * c + 2) * sway\r
      );\r
      gl.uniform1f(loc.uLevel, clamp(st.activity, 0, 1));\r
      gl.uniform3fv(loc.uColors, st.palette.flat);\r
      gl.uniform1i(loc.uCount, clamp(Math.round(p.count), 1, 3));\r
      gl.uniform1f(loc.uAmplitude, p.amplitude);\r
      gl.uniform1f(loc.uWaviness, p.waviness);\r
      gl.uniform1f(loc.uThickness, p.thickness);\r
      gl.uniform1f(loc.uGlow, p.glow);\r
      gl.uniform1f(loc.uTaper, Math.max(0.05, p.taper));\r
      gl.uniform1f(loc.uSpread, p.spread);\r
      gl.uniform1f(loc.uHueShift, p.hueShift);\r
      gl.uniform1f(loc.uIntensity, p.intensity);\r
      gl.uniform1f(loc.uSaturation, p.saturation);\r
      gl.uniform1f(loc.uScale, Math.max(0.05, p.scale));\r
      gl.uniform1f(loc.uGlass, p.glass ? 1 : 0);\r
      gl.uniform1f(loc.uRadius, 0.42 * p.glassSize);\r
      gl.uniform1f(loc.uRefraction, p.refraction);\r
      gl.uniform1f(loc.uDispersion, p.dispersion);\r
      gl.uniform1f(loc.uRim, p.rim);\r
      gl.uniform2f(loc.uLean, st.lean[0], st.lean[1]);\r
      gl.uniform1f(loc.uIntro, st.intro);\r
      gl.uniform1f(loc.uPulse, st.pulse);\r
      gl.uniform1f(loc.uLight, p.lightMode ? 1 : 0);\r
      gl.uniform1f(loc.uOpacity, p.opacity);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = now => {\r
      st.raf = 0;\r
      const p = propsRef.current;\r
      const dt = st.last ? clamp((now - st.last) / 1000, 0, 0.05) : 0;\r
      st.last = now;\r
      const reduced = !!query?.matches;\r
      if (st.introStart < 0 && st.visible) st.introStart = now;\r
      if (p.intro && !reduced && st.introStart >= 0) {\r
        const t = clamp((now - st.introStart) / 1400, 0, 1);\r
        st.intro = 1 - Math.pow(1 - t, 3);\r
      } else {\r
        st.intro = 1;\r
      }\r
      st.hover += (st.hoverTarget - st.hover) * (1 - Math.exp(-dt / (st.hoverTarget > st.hover ? 0.25 : 0.6)));\r
      for (let i = 0; i < 2; i++) st.lean[i] += (st.leanTarget[i] - st.lean[i]) * (1 - Math.exp(-dt / 0.35));\r
      st.pulseV += (-170 * st.pulse - 14 * st.pulseV) * dt;\r
      st.pulse += st.pulseV * dt;\r
      st.burst *= Math.exp(-dt / 0.45);\r
      if (p.listening && !reduced) st.speechT += dt;\r
      const voice =\r
        typeof p.level === 'number' ? clamp(p.level, 0, 1) : p.listening && !reduced ? speech(st.speechT) : 0;\r
      const target = Math.min(1.2, Math.max(clamp(p.energy, 0, 1), voice) + st.hover * 0.18 + st.burst);\r
      st.activity += (target - st.activity) * (1 - Math.exp(-dt / (target > st.activity ? 0.12 : 0.4)));\r
      st.pace += (Math.min(1, st.activity) - st.pace) * (1 - Math.exp(-dt / 0.8));\r
      if (!reduced) {\r
        st.clock += dt * p.speed * (0.6 + 1.6 * st.pace);\r
      }\r
      draw();\r
      const settled =\r
        reduced &&\r
        Math.abs(st.activity - target) < 1e-3 &&\r
        Math.abs(st.pulse) < 1e-3 &&\r
        Math.abs(st.pulseV) < 1e-3 &&\r
        st.burst < 1e-3 &&\r
        Math.abs(st.hover - st.hoverTarget) < 1e-3 &&\r
        Math.abs(st.lean[0] - st.leanTarget[0]) < 1e-3 &&\r
        Math.abs(st.lean[1] - st.leanTarget[1]) < 1e-3;\r
      if (st.visible && !document.hidden && !st.lost && !settled) st.raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (!st.raf && st.visible && !st.lost) {\r
        st.last = 0;\r
        st.raf = requestAnimationFrame(frame);\r
      }\r
    };\r
\r
    const local = e => {\r
      const r = container.getBoundingClientRect();\r
      const m = Math.min(r.width, r.height) || 1;\r
      return [(e.clientX - r.left - r.width / 2) / (m / 2), (e.clientY - r.top - r.height / 2) / (m / 2)];\r
    };\r
\r
    const onMove = e => {\r
      if (!propsRef.current.interactive) return;\r
      const [x, y] = local(e);\r
      st.hoverTarget = clamp(1.6 - Math.hypot(x, y), 0, 1);\r
      st.leanTarget = [clamp(x, -1.2, 1.2) * 0.8, clamp(-y, -1.2, 1.2) * 0.8];\r
      wake();\r
    };\r
\r
    const onLeave = () => {\r
      st.hoverTarget = 0;\r
      st.leanTarget = [0, 0];\r
      wake();\r
    };\r
\r
    const onDown = () => {\r
      if (!propsRef.current.clickPulse) return;\r
      st.pulseV += 5;\r
      st.burst = Math.min(1.2, st.burst + 0.9);\r
      wake();\r
    };\r
\r
    const onLost = e => {\r
      e.preventDefault();\r
      st.lost = true;\r
      if (st.raf) cancelAnimationFrame(st.raf);\r
      st.raf = 0;\r
    };\r
\r
    const onRestored = () => {\r
      st.lost = false;\r
      if (setup()) wake();\r
    };\r
\r
    canvas.addEventListener('webglcontextlost', onLost);\r
    canvas.addEventListener('webglcontextrestored', onRestored);\r
    container.addEventListener('pointermove', onMove);\r
    container.addEventListener('pointerleave', onLeave);\r
    container.addEventListener('pointerdown', onDown);\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      resize();\r
      draw();\r
    });\r
    resizeObserver.observe(container);\r
    resize();\r
\r
    let intersection = null;\r
    if (typeof IntersectionObserver !== 'undefined') {\r
      intersection = new IntersectionObserver(entries => {\r
        st.visible = entries[entries.length - 1].isIntersecting;\r
        if (st.visible) wake();\r
      });\r
      intersection.observe(container);\r
    }\r
    const onVisibility = () => {\r
      if (!document.hidden) wake();\r
    };\r
    document.addEventListener('visibilitychange', onVisibility);\r
    wake();\r
\r
    return () => {\r
      if (st.raf) cancelAnimationFrame(st.raf);\r
      canvas.removeEventListener('webglcontextlost', onLost);\r
      canvas.removeEventListener('webglcontextrestored', onRestored);\r
      container.removeEventListener('pointermove', onMove);\r
      container.removeEventListener('pointerleave', onLeave);\r
      container.removeEventListener('pointerdown', onDown);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      resizeObserver.disconnect();\r
      intersection?.disconnect();\r
      if (program) gl.deleteProgram(program);\r
      if (buffer) gl.deleteBuffer(buffer);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
      canvas.remove();\r
    };\r
  }, []);\r
\r
  return <div ref={containerRef} className={\`strands-container \${className}\`.trim()} style={style} />;\r
}\r
`,n=`.strands-container {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  background: transparent;\r
  -webkit-tap-highlight-color: transparent;\r
}\r
\r
.strands-container canvas {\r
  display: block;\r
  width: 100%;\r
  height: 100%;\r
}\r
`,e=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
const MAX_COLORS = 8;\r
const ROLES = 7;\r
\r
const VERT = \`#version 300 es\r
in vec2 position;\r
void main() {\r
  gl_Position = vec4(position, 0.0, 1.0);\r
}\r
\`;\r
\r
const FRAG = \`#version 300 es\r
precision highp float;\r
\r
uniform vec2 uResolution;\r
uniform vec3 uMotion;\r
uniform float uLevel;\r
uniform vec3 uColors[8];\r
uniform int uCount;\r
uniform float uAmplitude;\r
uniform float uWaviness;\r
uniform float uThickness;\r
uniform float uGlow;\r
uniform float uTaper;\r
uniform float uSpread;\r
uniform float uHueShift;\r
uniform float uIntensity;\r
uniform float uSaturation;\r
uniform float uScale;\r
uniform float uGlass;\r
uniform float uRadius;\r
uniform float uRefraction;\r
uniform float uDispersion;\r
uniform float uRim;\r
uniform vec2 uLean;\r
uniform float uIntro;\r
uniform float uPulse;\r
uniform float uLight;\r
uniform float uOpacity;\r
\r
out vec4 fragColor;\r
\r
const int NB = 10;\r
const float PI = 3.14159265;\r
\r
vec3 hueRotate(vec3 c, float a) {\r
  const mat3 toYiq = mat3(0.299, 0.596, 0.211, 0.587, -0.274, -0.523, 0.114, -0.322, 0.312);\r
  const mat3 toRgb = mat3(1.0, 1.0, 1.0, 0.956, -0.272, -1.106, 0.621, -0.647, 1.703);\r
  vec3 yiq = toYiq * c;\r
  float ca = cos(a);\r
  float sa = sin(a);\r
  yiq.yz = mat2(ca, sa, -sa, ca) * yiq.yz;\r
  return max(toRgb * yiq, 0.0);\r
}\r
\r
vec3 grade(vec3 c) {\r
  float g = dot(c, vec3(0.2126, 0.7152, 0.0722));\r
  c = clamp(mix(vec3(g), c, 1.5 * uSaturation), 0.0, 1.0);\r
  return hueRotate(c, uHueShift * 6.2831853);\r
}\r
\r
vec3 lightInk(vec3 L, float halo, vec3 body) {\r
  vec3 Lg = grade(L);\r
  float lum = dot(Lg, vec3(0.2126, 0.7152, 0.0722));\r
  float cov = 1.0 - exp(-lum * 2.6);\r
  vec3 hue = Lg / max(max(Lg.r, max(Lg.g, Lg.b)), 1e-4);\r
  float white = pow(clamp(min(hue.r, min(hue.g, hue.b)), 0.0, 1.0), 1.4);\r
  vec3 ink = pow(hue, vec3(2.2)) * 0.88;\r
  float coreAmt = white * smoothstep(0.05, 2.2, lum) * 0.92;\r
  vec3 cream = mix(mix(uColors[3], vec3(1.0), 0.3), vec3(1.0, 0.985, 0.95), smoothstep(1.2, 3.5, lum));\r
  vec3 c = mix(body, vec3(0.66, 0.69, 0.76), halo * 0.32);\r
  c = mix(c, ink, cov * (1.0 - white));\r
  return mix(c, cream, clamp(coreAmt, 0.0, 1.0));\r
}\r
\r
float sstep(float a, float b, float x) {\r
  float t = clamp((x - a) / (b - a), 0.0, 1.0);\r
  return t * t * (3.0 - 2.0 * t);\r
}\r
\r
float erfa(float x) {\r
  float a = abs(x);\r
  float t = 1.0 / (1.0 + 0.3275911 * a);\r
  float y = 1.0 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * exp(-a * a);\r
  return x < 0.0 ? -y : y;\r
}\r
\r
vec3 grad4(vec3 c0, vec3 c1, vec3 c2, vec3 c3, float p1, float p2, float f) {\r
  vec3 c = mix(c0, c1, sstep(0.0, p1, f));\r
  c = mix(c, c2, sstep(p1, p2, f));\r
  return mix(c, c3, sstep(p2, 1.0, f));\r
}\r
\r
float smaxk(float a, float b, float k) {\r
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);\r
  return mix(a, b, h) + k * h * (1.0 - h);\r
}\r
\r
vec2 sheetW(float tt, float H, float sig, float sigB, float ridges) {\r
  float ew = 0.04 * uThickness;\r
  float res0;\r
  float res1;\r
  for (int pass = 0; pass < 2; pass++) {\r
    float sg = pass == 0 ? sig : sigB;\r
    float fill = 0.5 * (erfa(tt / sg) - erfa((tt - H) / sg)) / H;\r
    float se = sqrt(sg * sg + 0.25 * ew * ew * H * H);\r
    float de = (tt - H + 0.5 * ew * H) / se;\r
    float eg = exp(-de * de) / (se * 1.7724539);\r
    float rgw = sqrt(sg * sg + 0.0025 * H * H);\r
    float d1 = (tt - 0.45 * H) / rgw;\r
    float d2 = (tt - 0.241 * H) / rgw;\r
    float rid = 0.04 * (exp(-d1 * d1) * step(1.5, ridges) + 0.7 * exp(-d2 * d2) * step(2.5, ridges)) / (rgw * 1.7724539);\r
    float v = 0.6 * fill * (1.0 - 0.55 * uLight) + (1.6 * ew * 0.886 * eg + rid) * (1.0 + 1.3 * uLight);\r
    if (pass == 0) res0 = v;\r
    else res1 = v;\r
  }\r
  return vec2(res0, res1);\r
}\r
\r
float axis(float x) {\r
  float a = uAmplitude;\r
  return -0.2318 + uLean.y * 0.06 + (-0.2394 + uLean.x * 0.1) * x + 0.2815 * a * x * x + 0.3368 * a * x * x * x;\r
}\r
\r
float softp(float z) {\r
  return 0.03 * log(1.0 + exp(clamp(z / 0.03, -60.0, 60.0)));\r
}\r
\r
vec3 light(vec2 u, float fp, float bend, float level, out float halo) {\r
  float amp = level < 0.65 ? mix(0.25, 1.0, sstep(0.0, 0.65, level)) : mix(1.0, 1.12, (level - 0.65) / 0.35);\r
  float grow = clamp((amp - 0.25) / 0.75, 0.0, 1.25);\r
  float x = u.x / uScale;\r
  float uy = u.y;\r
  float ya = axis(x);\r
  float taper = max(uTaper, 0.05);\r
  float bx = 0.0437 + uMotion.z + uLean.x * 0.08;\r
  float bump = exp(-pow((x - bx) / (0.6879 * taper), 2.0));\r
  float hW = 0.02 + softp(-0.12 + 0.5324 * uAmplitude * grow * uMotion.y * bump - 0.02);\r
  float k = 1.0 * uWaviness;\r
  float cphi = cos(0.5 * PI + k * (x + 0.0664) + uMotion.x);\r
  float envC = (0.0886 + 0.3 * exp(-pow((x - 0.0634) / 0.6873, 2.0))) * uSpread * grow;\r
  float hC = -envC * tanh(cphi / 0.6);\r
  float th = 0.051 * uThickness * exp(-pow(cphi / 0.5, 2.0));\r
  float sig = sqrt(pow(0.005 + 0.05 * bend, 2.0) + fp * fp + th * th);\r
  float sigB = sqrt(0.0064 * max(uGlow, 0.05) * max(uGlow, 0.05) + fp * fp + th * th);\r
  float mend = exp(-pow(abs((x + 0.0421) / (0.4235 * taper)), 2.2689));\r
  vec3 red = uColors[0];\r
  vec3 orange = uColors[1];\r
  vec3 amber = uColors[2];\r
  vec3 warmWhite = uColors[3];\r
  vec3 cyan = uColors[4];\r
  vec3 blue = uColors[5];\r
  vec3 deep = uColors[6];\r
  vec3 orangeEdge = orange * vec3(1.0, 0.85, 0.77);\r
  vec3 coolCore = mix(warmWhite, vec3(1.0, 1.0, 0.7), 0.6);\r
  vec3 mint = clamp(mix(cyan, warmWhite, 0.35) * vec3(0.92, 1.05, 0.95), 0.0, 1.0);\r
  float ridges = float(uCount);\r
  float glow = max(uGlow, 0.0);\r
  vec3 L = vec3(0.0);\r
  vec3 Lb = vec3(0.0);\r
  {\r
    float H = max(abs(hW), 1e-4);\r
    float tt = uy - ya;\r
    vec2 w = sheetW(tt, H, sig, sigB, ridges);\r
    float f = clamp(tt / H, 0.0, 1.0);\r
    vec3 c = grad4(warmWhite, amber, orange, orangeEdge, 0.2351, 0.5643, f);\r
    c = mix(c, red, sstep(0.75, 1.0, f) * sstep(0.196, 0.3376, hW));\r
    vec3 mean = (grad4(warmWhite, amber, orange, orangeEdge, 0.2351, 0.5643, 0.1) + grad4(warmWhite, amber, orange, orangeEdge, 0.2351, 0.5643, 0.35) + grad4(warmWhite, amber, orange, orangeEdge, 0.2351, 0.5643, 0.6) + grad4(warmWhite, amber, orange, orangeEdge, 0.2351, 0.5643, 0.9)) * 0.25;\r
    L += mix(c, mean, sstep(0.3, 1.2, sig / H)) * (w.x * 0.2101 * mend);\r
    Lb += mix(c, mean, sstep(0.3, 1.2, sigB / H)) * (w.y * 0.2101 * mend);\r
  }\r
  {\r
    float H = max(abs(hC), 1e-4);\r
    float tt = (uy - ya) * (hC >= 0.0 ? 1.0 : -1.0);\r
    vec2 w = sheetW(tt, H, sig, sigB, 1.0);\r
    float f = clamp(tt / H, 0.0, 1.0);\r
    vec3 c = grad4(coolCore, cyan, blue, deep, 0.15, 0.7931, f);\r
    vec3 mean = (grad4(coolCore, cyan, blue, deep, 0.15, 0.7931, 0.1) + grad4(coolCore, cyan, blue, deep, 0.15, 0.7931, 0.35) + grad4(coolCore, cyan, blue, deep, 0.15, 0.7931, 0.6) + grad4(coolCore, cyan, blue, deep, 0.15, 0.7931, 0.9)) * 0.25;\r
    L += mix(c, mean, sstep(0.3, 1.2, sig / H)) * (w.x * 0.28 * mend);\r
    Lb += mix(c, mean, sstep(0.3, 1.2, sigB / H)) * (w.y * 0.28 * mend);\r
  }\r
  vec3 G = vec3(0.0);\r
  float wh = sqrt(0.0256 + envC * envC * cphi * cphi);\r
  float dg = (uy - ya) / wh;\r
  G += vec3(1.0, 0.97, 0.92) * (exp(-dg * dg) * 0.0315 / wh * mend * glow);\r
  float nx = -0.0664 - uMotion.x / k + 0.2168;\r
  float bxx = (x - nx) / 0.1849;\r
  float byy = (uy - axis(nx) - 0.0333) / (0.0544 * mix(0.7, 1.0, min(amp, 1.0)));\r
  G += mint * (exp(-bxx * bxx - byy * byy) * 1.4 * glow * sstep(0.0, 0.6, amp));\r
  float hb = (uy - ya - 0.3 * hW) / (0.07 + 0.45 * hW + 0.3 * envC);\r
  halo = exp(-hb * hb) * mend * smoothstep(0.0, 0.3, uIntro);\r
  vec3 total = L + 0.16 * glow * Lb + 1.16 * G;\r
  return total * 2.4 * uIntensity * smoothstep(0.0, 0.3, uIntro) * sstep(uIntro * 1.6, uIntro * 1.6 - 0.5, abs(x));\r
}\r
\r
vec2 remap(vec2 p, float f, out float r, out float bend) {\r
  r = min(length(p), 0.9995);\r
  bend = pow(r, 5.17);\r
  float k = clamp(uRefraction, 0.0, 1.8);\r
  float sc = (1.0 - 0.278 * k * (1.0 - bend)) * (1.0 - 0.632 * k * bend) / (1.0 - 0.278 * k);\r
  return p * sc * f;\r
}\r
\r
void main() {\r
  vec2 res = uResolution;\r
  vec2 p = (gl_FragCoord.xy - 0.5 * res) / min(res.x, res.y);\r
  float level = clamp(uLevel, 0.0, 1.0);\r
  float appear = smoothstep(0.0, 0.35, uIntro);\r
\r
  if (uGlass > 0.5) {\r
    float R = uRadius * mix(0.94, 1.0, uIntro) * (1.0 + 0.03 * uPulse);\r
    float px = 1.0 / (min(res.x, res.y) * R);\r
    vec2 pc = p / R;\r
    float rho = length(pc);\r
    if (rho > 1.0 + 2.0 * px) {\r
      float sh = uLight * 0.07 * exp(-pow((rho - 0.985) / 0.07, 2.0)) * smoothstep(-0.6, 0.4, -pc.y) * appear * uOpacity;\r
      fragColor = vec4(0.0, 0.0, 0.0, sh);\r
      return;\r
    }\r
    float r;\r
    float bend;\r
    vec2 u = remap(pc, 1.0, r, bend);\r
    float fp = 0.5 * max(length(dFdx(u)), length(dFdy(u)));\r
    float halo;\r
    float skip;\r
    vec3 L = light(u, fp, bend, level, halo);\r
    float ca = 0.02 * uDispersion * bend;\r
    if (ca > 0.0015) {\r
      float r2;\r
      float b2;\r
      L.r = light(remap(pc, 1.0 - ca, r2, b2), fp, bend, level, skip).r;\r
      L.b = light(remap(pc, 1.0 + ca, r2, b2), fp, bend, level, skip).b;\r
    }\r
    vec3 col = 1.0 - exp(-L);\r
    vec2 d = pc / max(rho, 1e-6);\r
    float key = 0.4 * pow(max(0.0, d.x * 0.94 - d.y * 0.34), 6.0) + 0.2 * pow(max(0.0, -d.x * 0.5 + d.y * 0.87), 6.0);\r
    float ring = exp(-pow((r - 0.985) / 0.011, 2.0));\r
    float hzk = 0.25 + 0.7 * pow(max(0.0, -d.x * 0.6 + d.y * 0.8), 2.0) + pow(max(0.0, d.x * 0.8 - d.y * 0.6), 2.0);\r
    float haze = exp(-pow((1.0 - r) / 0.09, 2.0)) * hzk * 0.13 * uRim;\r
    vec3 orb;\r
    if (uLight > 0.5) {\r
      float lz = dot(d * r, vec2(-0.55, 0.83));\r
      vec3 body = mix(vec3(0.885, 0.893, 0.915), vec3(0.972, 0.975, 0.983), 0.5 + 0.5 * lz);\r
      float fres = smoothstep(0.8, 1.0, r);\r
      body = mix(body, vec3(0.82, 0.83, 0.86), fres * fres * 0.5);\r
      orb = lightInk(L, halo, body);\r
      float spec = exp(-pow((r - 0.955) / 0.03, 2.0)) * pow(max(0.0, dot(d, vec2(-0.55, 0.83))), 3.0);\r
      orb = mix(orb, vec3(1.0), clamp(spec * 0.85 * uRim + haze * 0.6, 0.0, 1.0));\r
      float edge = exp(-pow((1.0 - r) / (0.01 + 1.2 * px), 2.0));\r
      orb *= 1.0 - 0.12 * edge;\r
    } else {\r
      orb = vec3(0.04) + col * (1.0 + 0.1 * bend * uRim) + ring * key * uRim * (1.0 + 0.4 * level) + haze * vec3(1.0, 1.02, 1.04);\r
      orb = grade(clamp(orb, 0.0, 1.0));\r
    }\r
    float inside = clamp((1.0 - rho) / px + 0.5, 0.0, 1.0) * appear;\r
    vec3 rgb = orb * inside;\r
    fragColor = vec4(rgb, max(inside * mix(0.92, 1.0, uLight), max(max(rgb.r, rgb.g), rgb.b))) * uOpacity;\r
  } else {\r
    float span = 0.5 * res.x / min(res.x, res.y);\r
    vec2 u = p * (0.78 / span) + vec2(0.0, -0.15);\r
    float fp = 0.5 * max(length(dFdx(u)), length(dFdy(u)));\r
    float halo;\r
    float fade = sstep(0.82, 0.55, abs(u.x));\r
    vec3 L = light(u, fp, 0.0, level, halo) * fade;\r
    vec3 col = grade(1.0 - exp(-L)) * appear;\r
    if (uLight > 0.5) {\r
      vec3 c = lightInk(L, halo * fade * 0.6, vec3(1.0));\r
      float a = clamp(1.0 - min(c.r, min(c.g, c.b)), 0.0, 1.0) * appear;\r
      fragColor = vec4((c - (1.0 - a)) * appear, a) * uOpacity;\r
    } else {\r
      fragColor = vec4(col, max(max(col.r, col.g), col.b)) * uOpacity;\r
    }\r
  }\r
}\r
\`;\r
\r
const hexToRgb = hex => {\r
  let h = String(hex).replace('#', '').trim();\r
  if (h.length === 3) h = h.replace(/(.)/g, '$1$1');\r
  const v = parseInt(h.slice(0, 6), 16);\r
  if (!isFinite(v)) return [1, 1, 1];\r
  return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];\r
};\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const compile = (gl, type, source) => {\r
  const shader = gl.createShader(type);\r
  gl.shaderSource(shader, source);\r
  gl.compileShader(shader);\r
  return shader;\r
};\r
\r
const createProgram = gl => {\r
  const program = gl.createProgram();\r
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));\r
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));\r
  gl.bindAttribLocation(program, 0, 'position');\r
  gl.linkProgram(program);\r
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;\r
  return program;\r
};\r
\r
const smooth = (a, b, x) => {\r
  const k = Math.min(1, Math.max(0, (x - a) / (b - a)));\r
  return k * k * (3 - 2 * k);\r
};\r
\r
const speech = t => {\r
  const phrase = smooth(-0.8, -0.3, 0.6 * Math.sin(t * 2.7) + 0.5 * Math.sin(t * 1.53 + 1.2));\r
  const syllable = Math.max(0, Math.sin(t * 17 + 1.6 * Math.sin(t * 5.3)));\r
  const stress = 0.6 + 0.4 * Math.sin(t * 3.7 + 0.7);\r
  return phrase * (0.35 + 0.65 * syllable) * (0.25 + stress);\r
};\r
\r
const DEFAULT_COLORS = ['#d95b56', '#ba5046', '#ffa24c', '#ffe0b3', '#93f1ff', '#3569fa', '#193d9b'];\r
\r
export default function Strands({\r
  colors = DEFAULT_COLORS,\r
  count = 3,\r
  speed = 1,\r
  amplitude = 1,\r
  waviness = 1,\r
  thickness = 1,\r
  glow = 1,\r
  taper = 1,\r
  spread = 1,\r
  hueShift = 0,\r
  intensity = 1,\r
  saturation = 1,\r
  opacity = 1,\r
  scale = 1,\r
  glass = true,\r
  refraction = 1,\r
  dispersion = 1,\r
  glassSize = 1,\r
  rim = 1,\r
  energy = 0.65,\r
  listening = false,\r
  level,\r
  interactive = true,\r
  clickPulse = true,\r
  intro = true,\r
  lightMode = false,\r
  maxDevicePixelRatio = 2,\r
  className = '',\r
  style\r
}) {\r
  const containerRef = useRef(null);\r
  const propsRef = useRef(null);\r
  propsRef.current = {\r
    colors,\r
    count,\r
    speed,\r
    amplitude,\r
    waviness,\r
    thickness,\r
    glow,\r
    taper,\r
    spread,\r
    hueShift,\r
    intensity,\r
    saturation,\r
    opacity,\r
    scale,\r
    glass,\r
    refraction,\r
    dispersion,\r
    glassSize,\r
    rim,\r
    energy,\r
    listening,\r
    level,\r
    interactive,\r
    clickPulse,\r
    intro,\r
    lightMode,\r
    maxDevicePixelRatio\r
  };\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    if (!container) return;\r
    const canvas = document.createElement('canvas');\r
    canvas.style.display = 'block';\r
    canvas.style.width = '100%';\r
    canvas.style.height = '100%';\r
    canvas.setAttribute('aria-hidden', 'true');\r
    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });\r
    if (!gl) return;\r
    container.appendChild(canvas);\r
\r
    let program = null;\r
    let buffer = null;\r
    let loc = {};\r
    const names = [\r
      'uResolution',\r
      'uMotion',\r
      'uLevel',\r
      'uColors',\r
      'uCount',\r
      'uAmplitude',\r
      'uWaviness',\r
      'uThickness',\r
      'uGlow',\r
      'uTaper',\r
      'uSpread',\r
      'uHueShift',\r
      'uIntensity',\r
      'uSaturation',\r
      'uScale',\r
      'uGlass',\r
      'uRadius',\r
      'uRefraction',\r
      'uDispersion',\r
      'uRim',\r
      'uLean',\r
      'uIntro',\r
      'uPulse',\r
      'uLight',\r
      'uOpacity'\r
    ];\r
    const setup = () => {\r
      const next = createProgram(gl);\r
      if (!next) return false;\r
      program = next;\r
      buffer = gl.createBuffer();\r
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
      gl.enableVertexAttribArray(0);\r
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
      gl.useProgram(next);\r
      loc = Object.fromEntries(names.map(name => [name, gl.getUniformLocation(next, name)]));\r
      gl.disable(gl.BLEND);\r
      gl.clearColor(0, 0, 0, 0);\r
      return true;\r
    };\r
    if (!setup()) {\r
      canvas.remove();\r
      return;\r
    }\r
\r
    const query =\r
      typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;\r
    const st = {\r
      clock: 0,\r
      pace: 0,\r
      activity: 0,\r
      hover: 0,\r
      hoverTarget: 0,\r
      burst: 0,\r
      lean: [0, 0],\r
      leanTarget: [0, 0],\r
      pulse: 0,\r
      pulseV: 0,\r
      introStart: -1,\r
      intro: propsRef.current.intro ? 0 : 1,\r
      visible: typeof IntersectionObserver === 'undefined',\r
      lost: false,\r
      raf: 0,\r
      last: 0,\r
      width: 0,\r
      height: 0,\r
      speechT: 0,\r
      paletteKey: '',\r
      palette: { flat: new Float32Array(MAX_COLORS * 3), count: 1 }\r
    };\r
\r
    const resize = () => {\r
      const dpr = Math.min(window.devicePixelRatio || 1, Math.max(0.5, propsRef.current.maxDevicePixelRatio));\r
      const w = Math.max(1, Math.round(container.clientWidth * dpr));\r
      const h = Math.max(1, Math.round(container.clientHeight * dpr));\r
      if (w !== st.width || h !== st.height) {\r
        st.width = w;\r
        st.height = h;\r
        canvas.width = w;\r
        canvas.height = h;\r
      }\r
    };\r
\r
    const updatePalette = list => {\r
      const key = list.join(',');\r
      if (key === st.paletteKey) return;\r
      st.paletteKey = key;\r
      const rgb = (list.length ? list : DEFAULT_COLORS).slice(0, MAX_COLORS).map(hexToRgb);\r
      const flat = new Float32Array(MAX_COLORS * 3);\r
      for (let i = 0; i < ROLES; i++) {\r
        const t = rgb.length > 1 ? (i / (ROLES - 1)) * (rgb.length - 1) : 0;\r
        const a = Math.floor(t);\r
        const b = Math.min(a + 1, rgb.length - 1);\r
        const f = t - a;\r
        flat.set(\r
          rgb[a].map((c, k) => c + (rgb[b][k] - c) * f),\r
          i * 3\r
        );\r
      }\r
      st.palette = { flat, count: ROLES };\r
    };\r
\r
    const draw = () => {\r
      if (st.lost || !program) return;\r
      const p = propsRef.current;\r
      updatePalette(Array.isArray(p.colors) ? p.colors : []);\r
      gl.viewport(0, 0, st.width, st.height);\r
      gl.uniform2f(loc.uResolution, st.width, st.height);\r
      const c = st.clock;\r
      const sway = 0.75 + 0.45 * st.pace;\r
      gl.uniform3f(\r
        loc.uMotion,\r
        (0.26 * Math.sin(0.53 * c) + 0.1 * Math.sin(1.19 * c + 1.3)) * sway,\r
        1 + (0.06 * Math.sin(0.71 * c) + 0.035 * Math.sin(1.37 * c + 0.4)) * sway,\r
        0.06 * Math.sin(0.41 * c + 2) * sway\r
      );\r
      gl.uniform1f(loc.uLevel, clamp(st.activity, 0, 1));\r
      gl.uniform3fv(loc.uColors, st.palette.flat);\r
      gl.uniform1i(loc.uCount, clamp(Math.round(p.count), 1, 3));\r
      gl.uniform1f(loc.uAmplitude, p.amplitude);\r
      gl.uniform1f(loc.uWaviness, p.waviness);\r
      gl.uniform1f(loc.uThickness, p.thickness);\r
      gl.uniform1f(loc.uGlow, p.glow);\r
      gl.uniform1f(loc.uTaper, Math.max(0.05, p.taper));\r
      gl.uniform1f(loc.uSpread, p.spread);\r
      gl.uniform1f(loc.uHueShift, p.hueShift);\r
      gl.uniform1f(loc.uIntensity, p.intensity);\r
      gl.uniform1f(loc.uSaturation, p.saturation);\r
      gl.uniform1f(loc.uScale, Math.max(0.05, p.scale));\r
      gl.uniform1f(loc.uGlass, p.glass ? 1 : 0);\r
      gl.uniform1f(loc.uRadius, 0.42 * p.glassSize);\r
      gl.uniform1f(loc.uRefraction, p.refraction);\r
      gl.uniform1f(loc.uDispersion, p.dispersion);\r
      gl.uniform1f(loc.uRim, p.rim);\r
      gl.uniform2f(loc.uLean, st.lean[0], st.lean[1]);\r
      gl.uniform1f(loc.uIntro, st.intro);\r
      gl.uniform1f(loc.uPulse, st.pulse);\r
      gl.uniform1f(loc.uLight, p.lightMode ? 1 : 0);\r
      gl.uniform1f(loc.uOpacity, p.opacity);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = now => {\r
      st.raf = 0;\r
      const p = propsRef.current;\r
      const dt = st.last ? clamp((now - st.last) / 1000, 0, 0.05) : 0;\r
      st.last = now;\r
      const reduced = !!query?.matches;\r
      if (st.introStart < 0 && st.visible) st.introStart = now;\r
      if (p.intro && !reduced && st.introStart >= 0) {\r
        const t = clamp((now - st.introStart) / 1400, 0, 1);\r
        st.intro = 1 - Math.pow(1 - t, 3);\r
      } else {\r
        st.intro = 1;\r
      }\r
      st.hover += (st.hoverTarget - st.hover) * (1 - Math.exp(-dt / (st.hoverTarget > st.hover ? 0.25 : 0.6)));\r
      for (let i = 0; i < 2; i++) st.lean[i] += (st.leanTarget[i] - st.lean[i]) * (1 - Math.exp(-dt / 0.35));\r
      st.pulseV += (-170 * st.pulse - 14 * st.pulseV) * dt;\r
      st.pulse += st.pulseV * dt;\r
      st.burst *= Math.exp(-dt / 0.45);\r
      if (p.listening && !reduced) st.speechT += dt;\r
      const voice =\r
        typeof p.level === 'number' ? clamp(p.level, 0, 1) : p.listening && !reduced ? speech(st.speechT) : 0;\r
      const target = Math.min(1.2, Math.max(clamp(p.energy, 0, 1), voice) + st.hover * 0.18 + st.burst);\r
      st.activity += (target - st.activity) * (1 - Math.exp(-dt / (target > st.activity ? 0.12 : 0.4)));\r
      st.pace += (Math.min(1, st.activity) - st.pace) * (1 - Math.exp(-dt / 0.8));\r
      if (!reduced) {\r
        st.clock += dt * p.speed * (0.6 + 1.6 * st.pace);\r
      }\r
      draw();\r
      const settled =\r
        reduced &&\r
        Math.abs(st.activity - target) < 1e-3 &&\r
        Math.abs(st.pulse) < 1e-3 &&\r
        Math.abs(st.pulseV) < 1e-3 &&\r
        st.burst < 1e-3 &&\r
        Math.abs(st.hover - st.hoverTarget) < 1e-3 &&\r
        Math.abs(st.lean[0] - st.leanTarget[0]) < 1e-3 &&\r
        Math.abs(st.lean[1] - st.leanTarget[1]) < 1e-3;\r
      if (st.visible && !document.hidden && !st.lost && !settled) st.raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (!st.raf && st.visible && !st.lost) {\r
        st.last = 0;\r
        st.raf = requestAnimationFrame(frame);\r
      }\r
    };\r
\r
    const local = e => {\r
      const r = container.getBoundingClientRect();\r
      const m = Math.min(r.width, r.height) || 1;\r
      return [(e.clientX - r.left - r.width / 2) / (m / 2), (e.clientY - r.top - r.height / 2) / (m / 2)];\r
    };\r
\r
    const onMove = e => {\r
      if (!propsRef.current.interactive) return;\r
      const [x, y] = local(e);\r
      st.hoverTarget = clamp(1.6 - Math.hypot(x, y), 0, 1);\r
      st.leanTarget = [clamp(x, -1.2, 1.2) * 0.8, clamp(-y, -1.2, 1.2) * 0.8];\r
      wake();\r
    };\r
\r
    const onLeave = () => {\r
      st.hoverTarget = 0;\r
      st.leanTarget = [0, 0];\r
      wake();\r
    };\r
\r
    const onDown = () => {\r
      if (!propsRef.current.clickPulse) return;\r
      st.pulseV += 5;\r
      st.burst = Math.min(1.2, st.burst + 0.9);\r
      wake();\r
    };\r
\r
    const onLost = e => {\r
      e.preventDefault();\r
      st.lost = true;\r
      if (st.raf) cancelAnimationFrame(st.raf);\r
      st.raf = 0;\r
    };\r
\r
    const onRestored = () => {\r
      st.lost = false;\r
      if (setup()) wake();\r
    };\r
\r
    canvas.addEventListener('webglcontextlost', onLost);\r
    canvas.addEventListener('webglcontextrestored', onRestored);\r
    container.addEventListener('pointermove', onMove);\r
    container.addEventListener('pointerleave', onLeave);\r
    container.addEventListener('pointerdown', onDown);\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      resize();\r
      draw();\r
    });\r
    resizeObserver.observe(container);\r
    resize();\r
\r
    let intersection = null;\r
    if (typeof IntersectionObserver !== 'undefined') {\r
      intersection = new IntersectionObserver(entries => {\r
        st.visible = entries[entries.length - 1].isIntersecting;\r
        if (st.visible) wake();\r
      });\r
      intersection.observe(container);\r
    }\r
    const onVisibility = () => {\r
      if (!document.hidden) wake();\r
    };\r
    document.addEventListener('visibilitychange', onVisibility);\r
    wake();\r
\r
    return () => {\r
      if (st.raf) cancelAnimationFrame(st.raf);\r
      canvas.removeEventListener('webglcontextlost', onLost);\r
      canvas.removeEventListener('webglcontextrestored', onRestored);\r
      container.removeEventListener('pointermove', onMove);\r
      container.removeEventListener('pointerleave', onLeave);\r
      container.removeEventListener('pointerdown', onDown);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      resizeObserver.disconnect();\r
      intersection?.disconnect();\r
      if (program) gl.deleteProgram(program);\r
      if (buffer) gl.deleteBuffer(buffer);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
      canvas.remove();\r
    };\r
  }, []);\r
\r
  return (\r
    <div\r
      ref={containerRef}\r
      className={\`relative h-full w-full bg-transparent [-webkit-tap-highlight-color:transparent] \${className}\`.trim()}\r
      style={style}\r
    />\r
  );\r
}\r
`,t=`'use client';\r
\r
import React, { useEffect, useRef } from 'react';\r
import './Strands.css';\r
\r
interface StrandsProps {\r
  colors?: string[];\r
  count?: number;\r
  speed?: number;\r
  amplitude?: number;\r
  waviness?: number;\r
  thickness?: number;\r
  glow?: number;\r
  taper?: number;\r
  spread?: number;\r
  hueShift?: number;\r
  intensity?: number;\r
  saturation?: number;\r
  opacity?: number;\r
  scale?: number;\r
  glass?: boolean;\r
  refraction?: number;\r
  dispersion?: number;\r
  glassSize?: number;\r
  rim?: number;\r
  energy?: number;\r
  listening?: boolean;\r
  level?: number;\r
  interactive?: boolean;\r
  clickPulse?: boolean;\r
  intro?: boolean;\r
  lightMode?: boolean;\r
  maxDevicePixelRatio?: number;\r
  className?: string;\r
  style?: React.CSSProperties;\r
}\r
\r
interface StrandsConfig {\r
  colors: string[];\r
  count: number;\r
  speed: number;\r
  amplitude: number;\r
  waviness: number;\r
  thickness: number;\r
  glow: number;\r
  taper: number;\r
  spread: number;\r
  hueShift: number;\r
  intensity: number;\r
  saturation: number;\r
  opacity: number;\r
  scale: number;\r
  glass: boolean;\r
  refraction: number;\r
  dispersion: number;\r
  glassSize: number;\r
  rim: number;\r
  energy: number;\r
  listening: boolean;\r
  level?: number;\r
  interactive: boolean;\r
  clickPulse: boolean;\r
  intro: boolean;\r
  lightMode: boolean;\r
  maxDevicePixelRatio: number;\r
}\r
\r
const MAX_COLORS = 8;\r
const ROLES = 7;\r
\r
const VERT = \`#version 300 es\r
in vec2 position;\r
void main() {\r
  gl_Position = vec4(position, 0.0, 1.0);\r
}\r
\`;\r
\r
const FRAG = \`#version 300 es\r
precision highp float;\r
\r
uniform vec2 uResolution;\r
uniform vec3 uMotion;\r
uniform float uLevel;\r
uniform vec3 uColors[8];\r
uniform int uCount;\r
uniform float uAmplitude;\r
uniform float uWaviness;\r
uniform float uThickness;\r
uniform float uGlow;\r
uniform float uTaper;\r
uniform float uSpread;\r
uniform float uHueShift;\r
uniform float uIntensity;\r
uniform float uSaturation;\r
uniform float uScale;\r
uniform float uGlass;\r
uniform float uRadius;\r
uniform float uRefraction;\r
uniform float uDispersion;\r
uniform float uRim;\r
uniform vec2 uLean;\r
uniform float uIntro;\r
uniform float uPulse;\r
uniform float uLight;\r
uniform float uOpacity;\r
\r
out vec4 fragColor;\r
\r
const int NB = 10;\r
const float PI = 3.14159265;\r
\r
vec3 hueRotate(vec3 c, float a) {\r
  const mat3 toYiq = mat3(0.299, 0.596, 0.211, 0.587, -0.274, -0.523, 0.114, -0.322, 0.312);\r
  const mat3 toRgb = mat3(1.0, 1.0, 1.0, 0.956, -0.272, -1.106, 0.621, -0.647, 1.703);\r
  vec3 yiq = toYiq * c;\r
  float ca = cos(a);\r
  float sa = sin(a);\r
  yiq.yz = mat2(ca, sa, -sa, ca) * yiq.yz;\r
  return max(toRgb * yiq, 0.0);\r
}\r
\r
vec3 grade(vec3 c) {\r
  float g = dot(c, vec3(0.2126, 0.7152, 0.0722));\r
  c = clamp(mix(vec3(g), c, 1.5 * uSaturation), 0.0, 1.0);\r
  return hueRotate(c, uHueShift * 6.2831853);\r
}\r
\r
vec3 lightInk(vec3 L, float halo, vec3 body) {\r
  vec3 Lg = grade(L);\r
  float lum = dot(Lg, vec3(0.2126, 0.7152, 0.0722));\r
  float cov = 1.0 - exp(-lum * 2.6);\r
  vec3 hue = Lg / max(max(Lg.r, max(Lg.g, Lg.b)), 1e-4);\r
  float white = pow(clamp(min(hue.r, min(hue.g, hue.b)), 0.0, 1.0), 1.4);\r
  vec3 ink = pow(hue, vec3(2.2)) * 0.88;\r
  float coreAmt = white * smoothstep(0.05, 2.2, lum) * 0.92;\r
  vec3 cream = mix(mix(uColors[3], vec3(1.0), 0.3), vec3(1.0, 0.985, 0.95), smoothstep(1.2, 3.5, lum));\r
  vec3 c = mix(body, vec3(0.66, 0.69, 0.76), halo * 0.32);\r
  c = mix(c, ink, cov * (1.0 - white));\r
  return mix(c, cream, clamp(coreAmt, 0.0, 1.0));\r
}\r
\r
float sstep(float a, float b, float x) {\r
  float t = clamp((x - a) / (b - a), 0.0, 1.0);\r
  return t * t * (3.0 - 2.0 * t);\r
}\r
\r
float erfa(float x) {\r
  float a = abs(x);\r
  float t = 1.0 / (1.0 + 0.3275911 * a);\r
  float y = 1.0 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * exp(-a * a);\r
  return x < 0.0 ? -y : y;\r
}\r
\r
vec3 grad4(vec3 c0, vec3 c1, vec3 c2, vec3 c3, float p1, float p2, float f) {\r
  vec3 c = mix(c0, c1, sstep(0.0, p1, f));\r
  c = mix(c, c2, sstep(p1, p2, f));\r
  return mix(c, c3, sstep(p2, 1.0, f));\r
}\r
\r
float smaxk(float a, float b, float k) {\r
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);\r
  return mix(a, b, h) + k * h * (1.0 - h);\r
}\r
\r
vec2 sheetW(float tt, float H, float sig, float sigB, float ridges) {\r
  float ew = 0.04 * uThickness;\r
  float res0;\r
  float res1;\r
  for (int pass = 0; pass < 2; pass++) {\r
    float sg = pass == 0 ? sig : sigB;\r
    float fill = 0.5 * (erfa(tt / sg) - erfa((tt - H) / sg)) / H;\r
    float se = sqrt(sg * sg + 0.25 * ew * ew * H * H);\r
    float de = (tt - H + 0.5 * ew * H) / se;\r
    float eg = exp(-de * de) / (se * 1.7724539);\r
    float rgw = sqrt(sg * sg + 0.0025 * H * H);\r
    float d1 = (tt - 0.45 * H) / rgw;\r
    float d2 = (tt - 0.241 * H) / rgw;\r
    float rid = 0.04 * (exp(-d1 * d1) * step(1.5, ridges) + 0.7 * exp(-d2 * d2) * step(2.5, ridges)) / (rgw * 1.7724539);\r
    float v = 0.6 * fill * (1.0 - 0.55 * uLight) + (1.6 * ew * 0.886 * eg + rid) * (1.0 + 1.3 * uLight);\r
    if (pass == 0) res0 = v;\r
    else res1 = v;\r
  }\r
  return vec2(res0, res1);\r
}\r
\r
float axis(float x) {\r
  float a = uAmplitude;\r
  return -0.2318 + uLean.y * 0.06 + (-0.2394 + uLean.x * 0.1) * x + 0.2815 * a * x * x + 0.3368 * a * x * x * x;\r
}\r
\r
float softp(float z) {\r
  return 0.03 * log(1.0 + exp(clamp(z / 0.03, -60.0, 60.0)));\r
}\r
\r
vec3 light(vec2 u, float fp, float bend, float level, out float halo) {\r
  float amp = level < 0.65 ? mix(0.25, 1.0, sstep(0.0, 0.65, level)) : mix(1.0, 1.12, (level - 0.65) / 0.35);\r
  float grow = clamp((amp - 0.25) / 0.75, 0.0, 1.25);\r
  float x = u.x / uScale;\r
  float uy = u.y;\r
  float ya = axis(x);\r
  float taper = max(uTaper, 0.05);\r
  float bx = 0.0437 + uMotion.z + uLean.x * 0.08;\r
  float bump = exp(-pow((x - bx) / (0.6879 * taper), 2.0));\r
  float hW = 0.02 + softp(-0.12 + 0.5324 * uAmplitude * grow * uMotion.y * bump - 0.02);\r
  float k = 1.0 * uWaviness;\r
  float cphi = cos(0.5 * PI + k * (x + 0.0664) + uMotion.x);\r
  float envC = (0.0886 + 0.3 * exp(-pow((x - 0.0634) / 0.6873, 2.0))) * uSpread * grow;\r
  float hC = -envC * tanh(cphi / 0.6);\r
  float th = 0.051 * uThickness * exp(-pow(cphi / 0.5, 2.0));\r
  float sig = sqrt(pow(0.005 + 0.05 * bend, 2.0) + fp * fp + th * th);\r
  float sigB = sqrt(0.0064 * max(uGlow, 0.05) * max(uGlow, 0.05) + fp * fp + th * th);\r
  float mend = exp(-pow(abs((x + 0.0421) / (0.4235 * taper)), 2.2689));\r
  vec3 red = uColors[0];\r
  vec3 orange = uColors[1];\r
  vec3 amber = uColors[2];\r
  vec3 warmWhite = uColors[3];\r
  vec3 cyan = uColors[4];\r
  vec3 blue = uColors[5];\r
  vec3 deep = uColors[6];\r
  vec3 orangeEdge = orange * vec3(1.0, 0.85, 0.77);\r
  vec3 coolCore = mix(warmWhite, vec3(1.0, 1.0, 0.7), 0.6);\r
  vec3 mint = clamp(mix(cyan, warmWhite, 0.35) * vec3(0.92, 1.05, 0.95), 0.0, 1.0);\r
  float ridges = float(uCount);\r
  float glow = max(uGlow, 0.0);\r
  vec3 L = vec3(0.0);\r
  vec3 Lb = vec3(0.0);\r
  {\r
    float H = max(abs(hW), 1e-4);\r
    float tt = uy - ya;\r
    vec2 w = sheetW(tt, H, sig, sigB, ridges);\r
    float f = clamp(tt / H, 0.0, 1.0);\r
    vec3 c = grad4(warmWhite, amber, orange, orangeEdge, 0.2351, 0.5643, f);\r
    c = mix(c, red, sstep(0.75, 1.0, f) * sstep(0.196, 0.3376, hW));\r
    vec3 mean = (grad4(warmWhite, amber, orange, orangeEdge, 0.2351, 0.5643, 0.1) + grad4(warmWhite, amber, orange, orangeEdge, 0.2351, 0.5643, 0.35) + grad4(warmWhite, amber, orange, orangeEdge, 0.2351, 0.5643, 0.6) + grad4(warmWhite, amber, orange, orangeEdge, 0.2351, 0.5643, 0.9)) * 0.25;\r
    L += mix(c, mean, sstep(0.3, 1.2, sig / H)) * (w.x * 0.2101 * mend);\r
    Lb += mix(c, mean, sstep(0.3, 1.2, sigB / H)) * (w.y * 0.2101 * mend);\r
  }\r
  {\r
    float H = max(abs(hC), 1e-4);\r
    float tt = (uy - ya) * (hC >= 0.0 ? 1.0 : -1.0);\r
    vec2 w = sheetW(tt, H, sig, sigB, 1.0);\r
    float f = clamp(tt / H, 0.0, 1.0);\r
    vec3 c = grad4(coolCore, cyan, blue, deep, 0.15, 0.7931, f);\r
    vec3 mean = (grad4(coolCore, cyan, blue, deep, 0.15, 0.7931, 0.1) + grad4(coolCore, cyan, blue, deep, 0.15, 0.7931, 0.35) + grad4(coolCore, cyan, blue, deep, 0.15, 0.7931, 0.6) + grad4(coolCore, cyan, blue, deep, 0.15, 0.7931, 0.9)) * 0.25;\r
    L += mix(c, mean, sstep(0.3, 1.2, sig / H)) * (w.x * 0.28 * mend);\r
    Lb += mix(c, mean, sstep(0.3, 1.2, sigB / H)) * (w.y * 0.28 * mend);\r
  }\r
  vec3 G = vec3(0.0);\r
  float wh = sqrt(0.0256 + envC * envC * cphi * cphi);\r
  float dg = (uy - ya) / wh;\r
  G += vec3(1.0, 0.97, 0.92) * (exp(-dg * dg) * 0.0315 / wh * mend * glow);\r
  float nx = -0.0664 - uMotion.x / k + 0.2168;\r
  float bxx = (x - nx) / 0.1849;\r
  float byy = (uy - axis(nx) - 0.0333) / (0.0544 * mix(0.7, 1.0, min(amp, 1.0)));\r
  G += mint * (exp(-bxx * bxx - byy * byy) * 1.4 * glow * sstep(0.0, 0.6, amp));\r
  float hb = (uy - ya - 0.3 * hW) / (0.07 + 0.45 * hW + 0.3 * envC);\r
  halo = exp(-hb * hb) * mend * smoothstep(0.0, 0.3, uIntro);\r
  vec3 total = L + 0.16 * glow * Lb + 1.16 * G;\r
  return total * 2.4 * uIntensity * smoothstep(0.0, 0.3, uIntro) * sstep(uIntro * 1.6, uIntro * 1.6 - 0.5, abs(x));\r
}\r
\r
vec2 remap(vec2 p, float f, out float r, out float bend) {\r
  r = min(length(p), 0.9995);\r
  bend = pow(r, 5.17);\r
  float k = clamp(uRefraction, 0.0, 1.8);\r
  float sc = (1.0 - 0.278 * k * (1.0 - bend)) * (1.0 - 0.632 * k * bend) / (1.0 - 0.278 * k);\r
  return p * sc * f;\r
}\r
\r
void main() {\r
  vec2 res = uResolution;\r
  vec2 p = (gl_FragCoord.xy - 0.5 * res) / min(res.x, res.y);\r
  float level = clamp(uLevel, 0.0, 1.0);\r
  float appear = smoothstep(0.0, 0.35, uIntro);\r
\r
  if (uGlass > 0.5) {\r
    float R = uRadius * mix(0.94, 1.0, uIntro) * (1.0 + 0.03 * uPulse);\r
    float px = 1.0 / (min(res.x, res.y) * R);\r
    vec2 pc = p / R;\r
    float rho = length(pc);\r
    if (rho > 1.0 + 2.0 * px) {\r
      float sh = uLight * 0.07 * exp(-pow((rho - 0.985) / 0.07, 2.0)) * smoothstep(-0.6, 0.4, -pc.y) * appear * uOpacity;\r
      fragColor = vec4(0.0, 0.0, 0.0, sh);\r
      return;\r
    }\r
    float r;\r
    float bend;\r
    vec2 u = remap(pc, 1.0, r, bend);\r
    float fp = 0.5 * max(length(dFdx(u)), length(dFdy(u)));\r
    float halo;\r
    float skip;\r
    vec3 L = light(u, fp, bend, level, halo);\r
    float ca = 0.02 * uDispersion * bend;\r
    if (ca > 0.0015) {\r
      float r2;\r
      float b2;\r
      L.r = light(remap(pc, 1.0 - ca, r2, b2), fp, bend, level, skip).r;\r
      L.b = light(remap(pc, 1.0 + ca, r2, b2), fp, bend, level, skip).b;\r
    }\r
    vec3 col = 1.0 - exp(-L);\r
    vec2 d = pc / max(rho, 1e-6);\r
    float key = 0.4 * pow(max(0.0, d.x * 0.94 - d.y * 0.34), 6.0) + 0.2 * pow(max(0.0, -d.x * 0.5 + d.y * 0.87), 6.0);\r
    float ring = exp(-pow((r - 0.985) / 0.011, 2.0));\r
    float hzk = 0.25 + 0.7 * pow(max(0.0, -d.x * 0.6 + d.y * 0.8), 2.0) + pow(max(0.0, d.x * 0.8 - d.y * 0.6), 2.0);\r
    float haze = exp(-pow((1.0 - r) / 0.09, 2.0)) * hzk * 0.13 * uRim;\r
    vec3 orb;\r
    if (uLight > 0.5) {\r
      float lz = dot(d * r, vec2(-0.55, 0.83));\r
      vec3 body = mix(vec3(0.885, 0.893, 0.915), vec3(0.972, 0.975, 0.983), 0.5 + 0.5 * lz);\r
      float fres = smoothstep(0.8, 1.0, r);\r
      body = mix(body, vec3(0.82, 0.83, 0.86), fres * fres * 0.5);\r
      orb = lightInk(L, halo, body);\r
      float spec = exp(-pow((r - 0.955) / 0.03, 2.0)) * pow(max(0.0, dot(d, vec2(-0.55, 0.83))), 3.0);\r
      orb = mix(orb, vec3(1.0), clamp(spec * 0.85 * uRim + haze * 0.6, 0.0, 1.0));\r
      float edge = exp(-pow((1.0 - r) / (0.01 + 1.2 * px), 2.0));\r
      orb *= 1.0 - 0.12 * edge;\r
    } else {\r
      orb = vec3(0.04) + col * (1.0 + 0.1 * bend * uRim) + ring * key * uRim * (1.0 + 0.4 * level) + haze * vec3(1.0, 1.02, 1.04);\r
      orb = grade(clamp(orb, 0.0, 1.0));\r
    }\r
    float inside = clamp((1.0 - rho) / px + 0.5, 0.0, 1.0) * appear;\r
    vec3 rgb = orb * inside;\r
    fragColor = vec4(rgb, max(inside * mix(0.92, 1.0, uLight), max(max(rgb.r, rgb.g), rgb.b))) * uOpacity;\r
  } else {\r
    float span = 0.5 * res.x / min(res.x, res.y);\r
    vec2 u = p * (0.78 / span) + vec2(0.0, -0.15);\r
    float fp = 0.5 * max(length(dFdx(u)), length(dFdy(u)));\r
    float halo;\r
    float fade = sstep(0.82, 0.55, abs(u.x));\r
    vec3 L = light(u, fp, 0.0, level, halo) * fade;\r
    vec3 col = grade(1.0 - exp(-L)) * appear;\r
    if (uLight > 0.5) {\r
      vec3 c = lightInk(L, halo * fade * 0.6, vec3(1.0));\r
      float a = clamp(1.0 - min(c.r, min(c.g, c.b)), 0.0, 1.0) * appear;\r
      fragColor = vec4((c - (1.0 - a)) * appear, a) * uOpacity;\r
    } else {\r
      fragColor = vec4(col, max(max(col.r, col.g), col.b)) * uOpacity;\r
    }\r
  }\r
}\r
\`;\r
\r
const hexToRgb = (hex: string): [number, number, number] => {\r
  let h = String(hex).replace('#', '').trim();\r
  if (h.length === 3) h = h.replace(/(.)/g, '$1$1');\r
  const v = parseInt(h.slice(0, 6), 16);\r
  if (!isFinite(v)) return [1, 1, 1];\r
  return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];\r
};\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const compile = (gl: WebGL2RenderingContext, type: number, source: string) => {\r
  const shader = gl.createShader(type) as WebGLShader;\r
  gl.shaderSource(shader, source);\r
  gl.compileShader(shader);\r
  return shader;\r
};\r
\r
const createProgram = (gl: WebGL2RenderingContext) => {\r
  const program = gl.createProgram() as WebGLProgram;\r
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));\r
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));\r
  gl.bindAttribLocation(program, 0, 'position');\r
  gl.linkProgram(program);\r
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;\r
  return program;\r
};\r
\r
const smooth = (a: number, b: number, x: number) => {\r
  const k = Math.min(1, Math.max(0, (x - a) / (b - a)));\r
  return k * k * (3 - 2 * k);\r
};\r
\r
const speech = (t: number) => {\r
  const phrase = smooth(-0.8, -0.3, 0.6 * Math.sin(t * 2.7) + 0.5 * Math.sin(t * 1.53 + 1.2));\r
  const syllable = Math.max(0, Math.sin(t * 17 + 1.6 * Math.sin(t * 5.3)));\r
  const stress = 0.6 + 0.4 * Math.sin(t * 3.7 + 0.7);\r
  return phrase * (0.35 + 0.65 * syllable) * (0.25 + stress);\r
};\r
\r
const DEFAULT_COLORS = ['#d95b56', '#ba5046', '#ffa24c', '#ffe0b3', '#93f1ff', '#3569fa', '#193d9b'];\r
\r
export default function Strands({\r
  colors = DEFAULT_COLORS,\r
  count = 3,\r
  speed = 1,\r
  amplitude = 1,\r
  waviness = 1,\r
  thickness = 1,\r
  glow = 1,\r
  taper = 1,\r
  spread = 1,\r
  hueShift = 0,\r
  intensity = 1,\r
  saturation = 1,\r
  opacity = 1,\r
  scale = 1,\r
  glass = true,\r
  refraction = 1,\r
  dispersion = 1,\r
  glassSize = 1,\r
  rim = 1,\r
  energy = 0.65,\r
  listening = false,\r
  level,\r
  interactive = true,\r
  clickPulse = true,\r
  intro = true,\r
  lightMode = false,\r
  maxDevicePixelRatio = 2,\r
  className = '',\r
  style\r
}: StrandsProps) {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const propsRef = useRef<StrandsConfig>({} as StrandsConfig);\r
  propsRef.current = {\r
    colors,\r
    count,\r
    speed,\r
    amplitude,\r
    waviness,\r
    thickness,\r
    glow,\r
    taper,\r
    spread,\r
    hueShift,\r
    intensity,\r
    saturation,\r
    opacity,\r
    scale,\r
    glass,\r
    refraction,\r
    dispersion,\r
    glassSize,\r
    rim,\r
    energy,\r
    listening,\r
    level,\r
    interactive,\r
    clickPulse,\r
    intro,\r
    lightMode,\r
    maxDevicePixelRatio\r
  };\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    if (!container) return;\r
    const canvas = document.createElement('canvas');\r
    canvas.style.display = 'block';\r
    canvas.style.width = '100%';\r
    canvas.style.height = '100%';\r
    canvas.setAttribute('aria-hidden', 'true');\r
    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });\r
    if (!gl) return;\r
    container.appendChild(canvas);\r
\r
    let program: WebGLProgram | null = null;\r
    let buffer: WebGLBuffer | null = null;\r
    let loc: Record<string, WebGLUniformLocation | null> = {};\r
    const names = [\r
      'uResolution',\r
      'uMotion',\r
      'uLevel',\r
      'uColors',\r
      'uCount',\r
      'uAmplitude',\r
      'uWaviness',\r
      'uThickness',\r
      'uGlow',\r
      'uTaper',\r
      'uSpread',\r
      'uHueShift',\r
      'uIntensity',\r
      'uSaturation',\r
      'uScale',\r
      'uGlass',\r
      'uRadius',\r
      'uRefraction',\r
      'uDispersion',\r
      'uRim',\r
      'uLean',\r
      'uIntro',\r
      'uPulse',\r
      'uLight',\r
      'uOpacity'\r
    ];\r
    const setup = () => {\r
      const next = createProgram(gl);\r
      if (!next) return false;\r
      program = next;\r
      buffer = gl.createBuffer();\r
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
      gl.enableVertexAttribArray(0);\r
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
      gl.useProgram(next);\r
      loc = Object.fromEntries(names.map(name => [name, gl.getUniformLocation(next, name)]));\r
      gl.disable(gl.BLEND);\r
      gl.clearColor(0, 0, 0, 0);\r
      return true;\r
    };\r
    if (!setup()) {\r
      canvas.remove();\r
      return;\r
    }\r
\r
    const query =\r
      typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;\r
    const st = {\r
      clock: 0,\r
      pace: 0,\r
      activity: 0,\r
      hover: 0,\r
      hoverTarget: 0,\r
      burst: 0,\r
      lean: [0, 0] as number[],\r
      leanTarget: [0, 0] as number[],\r
      pulse: 0,\r
      pulseV: 0,\r
      introStart: -1,\r
      intro: propsRef.current.intro ? 0 : 1,\r
      visible: typeof IntersectionObserver === 'undefined',\r
      lost: false,\r
      raf: 0,\r
      last: 0,\r
      width: 0,\r
      height: 0,\r
      speechT: 0,\r
      paletteKey: '',\r
      palette: { flat: new Float32Array(MAX_COLORS * 3), count: 1 }\r
    };\r
\r
    const resize = () => {\r
      const dpr = Math.min(window.devicePixelRatio || 1, Math.max(0.5, propsRef.current.maxDevicePixelRatio));\r
      const w = Math.max(1, Math.round(container.clientWidth * dpr));\r
      const h = Math.max(1, Math.round(container.clientHeight * dpr));\r
      if (w !== st.width || h !== st.height) {\r
        st.width = w;\r
        st.height = h;\r
        canvas.width = w;\r
        canvas.height = h;\r
      }\r
    };\r
\r
    const updatePalette = (list: string[]) => {\r
      const key = list.join(',');\r
      if (key === st.paletteKey) return;\r
      st.paletteKey = key;\r
      const rgb = (list.length ? list : DEFAULT_COLORS).slice(0, MAX_COLORS).map(hexToRgb);\r
      const flat = new Float32Array(MAX_COLORS * 3);\r
      for (let i = 0; i < ROLES; i++) {\r
        const t = rgb.length > 1 ? (i / (ROLES - 1)) * (rgb.length - 1) : 0;\r
        const a = Math.floor(t);\r
        const b = Math.min(a + 1, rgb.length - 1);\r
        const f = t - a;\r
        flat.set(\r
          rgb[a].map((c, k) => c + (rgb[b][k] - c) * f),\r
          i * 3\r
        );\r
      }\r
      st.palette = { flat, count: ROLES };\r
    };\r
\r
    const draw = () => {\r
      if (st.lost || !program) return;\r
      const p = propsRef.current;\r
      updatePalette(Array.isArray(p.colors) ? p.colors : []);\r
      gl.viewport(0, 0, st.width, st.height);\r
      gl.uniform2f(loc.uResolution, st.width, st.height);\r
      const c = st.clock;\r
      const sway = 0.75 + 0.45 * st.pace;\r
      gl.uniform3f(\r
        loc.uMotion,\r
        (0.26 * Math.sin(0.53 * c) + 0.1 * Math.sin(1.19 * c + 1.3)) * sway,\r
        1 + (0.06 * Math.sin(0.71 * c) + 0.035 * Math.sin(1.37 * c + 0.4)) * sway,\r
        0.06 * Math.sin(0.41 * c + 2) * sway\r
      );\r
      gl.uniform1f(loc.uLevel, clamp(st.activity, 0, 1));\r
      gl.uniform3fv(loc.uColors, st.palette.flat);\r
      gl.uniform1i(loc.uCount, clamp(Math.round(p.count), 1, 3));\r
      gl.uniform1f(loc.uAmplitude, p.amplitude);\r
      gl.uniform1f(loc.uWaviness, p.waviness);\r
      gl.uniform1f(loc.uThickness, p.thickness);\r
      gl.uniform1f(loc.uGlow, p.glow);\r
      gl.uniform1f(loc.uTaper, Math.max(0.05, p.taper));\r
      gl.uniform1f(loc.uSpread, p.spread);\r
      gl.uniform1f(loc.uHueShift, p.hueShift);\r
      gl.uniform1f(loc.uIntensity, p.intensity);\r
      gl.uniform1f(loc.uSaturation, p.saturation);\r
      gl.uniform1f(loc.uScale, Math.max(0.05, p.scale));\r
      gl.uniform1f(loc.uGlass, p.glass ? 1 : 0);\r
      gl.uniform1f(loc.uRadius, 0.42 * p.glassSize);\r
      gl.uniform1f(loc.uRefraction, p.refraction);\r
      gl.uniform1f(loc.uDispersion, p.dispersion);\r
      gl.uniform1f(loc.uRim, p.rim);\r
      gl.uniform2f(loc.uLean, st.lean[0], st.lean[1]);\r
      gl.uniform1f(loc.uIntro, st.intro);\r
      gl.uniform1f(loc.uPulse, st.pulse);\r
      gl.uniform1f(loc.uLight, p.lightMode ? 1 : 0);\r
      gl.uniform1f(loc.uOpacity, p.opacity);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = (now: number) => {\r
      st.raf = 0;\r
      const p = propsRef.current;\r
      const dt = st.last ? clamp((now - st.last) / 1000, 0, 0.05) : 0;\r
      st.last = now;\r
      const reduced = !!query?.matches;\r
      if (st.introStart < 0 && st.visible) st.introStart = now;\r
      if (p.intro && !reduced && st.introStart >= 0) {\r
        const t = clamp((now - st.introStart) / 1400, 0, 1);\r
        st.intro = 1 - Math.pow(1 - t, 3);\r
      } else {\r
        st.intro = 1;\r
      }\r
      st.hover += (st.hoverTarget - st.hover) * (1 - Math.exp(-dt / (st.hoverTarget > st.hover ? 0.25 : 0.6)));\r
      for (let i = 0; i < 2; i++) st.lean[i] += (st.leanTarget[i] - st.lean[i]) * (1 - Math.exp(-dt / 0.35));\r
      st.pulseV += (-170 * st.pulse - 14 * st.pulseV) * dt;\r
      st.pulse += st.pulseV * dt;\r
      st.burst *= Math.exp(-dt / 0.45);\r
      if (p.listening && !reduced) st.speechT += dt;\r
      const voice =\r
        typeof p.level === 'number' ? clamp(p.level, 0, 1) : p.listening && !reduced ? speech(st.speechT) : 0;\r
      const target = Math.min(1.2, Math.max(clamp(p.energy, 0, 1), voice) + st.hover * 0.18 + st.burst);\r
      st.activity += (target - st.activity) * (1 - Math.exp(-dt / (target > st.activity ? 0.12 : 0.4)));\r
      st.pace += (Math.min(1, st.activity) - st.pace) * (1 - Math.exp(-dt / 0.8));\r
      if (!reduced) {\r
        st.clock += dt * p.speed * (0.6 + 1.6 * st.pace);\r
      }\r
      draw();\r
      const settled =\r
        reduced &&\r
        Math.abs(st.activity - target) < 1e-3 &&\r
        Math.abs(st.pulse) < 1e-3 &&\r
        Math.abs(st.pulseV) < 1e-3 &&\r
        st.burst < 1e-3 &&\r
        Math.abs(st.hover - st.hoverTarget) < 1e-3 &&\r
        Math.abs(st.lean[0] - st.leanTarget[0]) < 1e-3 &&\r
        Math.abs(st.lean[1] - st.leanTarget[1]) < 1e-3;\r
      if (st.visible && !document.hidden && !st.lost && !settled) st.raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (!st.raf && st.visible && !st.lost) {\r
        st.last = 0;\r
        st.raf = requestAnimationFrame(frame);\r
      }\r
    };\r
\r
    const local = (e: PointerEvent): [number, number] => {\r
      const r = container.getBoundingClientRect();\r
      const m = Math.min(r.width, r.height) || 1;\r
      return [(e.clientX - r.left - r.width / 2) / (m / 2), (e.clientY - r.top - r.height / 2) / (m / 2)];\r
    };\r
\r
    const onMove = (e: PointerEvent) => {\r
      if (!propsRef.current.interactive) return;\r
      const [x, y] = local(e);\r
      st.hoverTarget = clamp(1.6 - Math.hypot(x, y), 0, 1);\r
      st.leanTarget = [clamp(x, -1.2, 1.2) * 0.8, clamp(-y, -1.2, 1.2) * 0.8];\r
      wake();\r
    };\r
\r
    const onLeave = () => {\r
      st.hoverTarget = 0;\r
      st.leanTarget = [0, 0];\r
      wake();\r
    };\r
\r
    const onDown = () => {\r
      if (!propsRef.current.clickPulse) return;\r
      st.pulseV += 5;\r
      st.burst = Math.min(1.2, st.burst + 0.9);\r
      wake();\r
    };\r
\r
    const onLost = (e: Event) => {\r
      e.preventDefault();\r
      st.lost = true;\r
      if (st.raf) cancelAnimationFrame(st.raf);\r
      st.raf = 0;\r
    };\r
\r
    const onRestored = () => {\r
      st.lost = false;\r
      if (setup()) wake();\r
    };\r
\r
    canvas.addEventListener('webglcontextlost', onLost);\r
    canvas.addEventListener('webglcontextrestored', onRestored);\r
    container.addEventListener('pointermove', onMove);\r
    container.addEventListener('pointerleave', onLeave);\r
    container.addEventListener('pointerdown', onDown);\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      resize();\r
      draw();\r
    });\r
    resizeObserver.observe(container);\r
    resize();\r
\r
    let intersection: IntersectionObserver | null = null;\r
    if (typeof IntersectionObserver !== 'undefined') {\r
      intersection = new IntersectionObserver(entries => {\r
        st.visible = entries[entries.length - 1].isIntersecting;\r
        if (st.visible) wake();\r
      });\r
      intersection.observe(container);\r
    }\r
    const onVisibility = () => {\r
      if (!document.hidden) wake();\r
    };\r
    document.addEventListener('visibilitychange', onVisibility);\r
    wake();\r
\r
    return () => {\r
      if (st.raf) cancelAnimationFrame(st.raf);\r
      canvas.removeEventListener('webglcontextlost', onLost);\r
      canvas.removeEventListener('webglcontextrestored', onRestored);\r
      container.removeEventListener('pointermove', onMove);\r
      container.removeEventListener('pointerleave', onLeave);\r
      container.removeEventListener('pointerdown', onDown);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      resizeObserver.disconnect();\r
      intersection?.disconnect();\r
      if (program) gl.deleteProgram(program);\r
      if (buffer) gl.deleteBuffer(buffer);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
      canvas.remove();\r
    };\r
  }, []);\r
\r
  return <div ref={containerRef} className={\`strands-container \${className}\`.trim()} style={style} />;\r
}\r
`,a=`'use client';\r
\r
import React, { useEffect, useRef } from 'react';\r
\r
interface StrandsProps {\r
  colors?: string[];\r
  count?: number;\r
  speed?: number;\r
  amplitude?: number;\r
  waviness?: number;\r
  thickness?: number;\r
  glow?: number;\r
  taper?: number;\r
  spread?: number;\r
  hueShift?: number;\r
  intensity?: number;\r
  saturation?: number;\r
  opacity?: number;\r
  scale?: number;\r
  glass?: boolean;\r
  refraction?: number;\r
  dispersion?: number;\r
  glassSize?: number;\r
  rim?: number;\r
  energy?: number;\r
  listening?: boolean;\r
  level?: number;\r
  interactive?: boolean;\r
  clickPulse?: boolean;\r
  intro?: boolean;\r
  lightMode?: boolean;\r
  maxDevicePixelRatio?: number;\r
  className?: string;\r
  style?: React.CSSProperties;\r
}\r
\r
interface StrandsConfig {\r
  colors: string[];\r
  count: number;\r
  speed: number;\r
  amplitude: number;\r
  waviness: number;\r
  thickness: number;\r
  glow: number;\r
  taper: number;\r
  spread: number;\r
  hueShift: number;\r
  intensity: number;\r
  saturation: number;\r
  opacity: number;\r
  scale: number;\r
  glass: boolean;\r
  refraction: number;\r
  dispersion: number;\r
  glassSize: number;\r
  rim: number;\r
  energy: number;\r
  listening: boolean;\r
  level?: number;\r
  interactive: boolean;\r
  clickPulse: boolean;\r
  intro: boolean;\r
  lightMode: boolean;\r
  maxDevicePixelRatio: number;\r
}\r
\r
const MAX_COLORS = 8;\r
const ROLES = 7;\r
\r
const VERT = \`#version 300 es\r
in vec2 position;\r
void main() {\r
  gl_Position = vec4(position, 0.0, 1.0);\r
}\r
\`;\r
\r
const FRAG = \`#version 300 es\r
precision highp float;\r
\r
uniform vec2 uResolution;\r
uniform vec3 uMotion;\r
uniform float uLevel;\r
uniform vec3 uColors[8];\r
uniform int uCount;\r
uniform float uAmplitude;\r
uniform float uWaviness;\r
uniform float uThickness;\r
uniform float uGlow;\r
uniform float uTaper;\r
uniform float uSpread;\r
uniform float uHueShift;\r
uniform float uIntensity;\r
uniform float uSaturation;\r
uniform float uScale;\r
uniform float uGlass;\r
uniform float uRadius;\r
uniform float uRefraction;\r
uniform float uDispersion;\r
uniform float uRim;\r
uniform vec2 uLean;\r
uniform float uIntro;\r
uniform float uPulse;\r
uniform float uLight;\r
uniform float uOpacity;\r
\r
out vec4 fragColor;\r
\r
const int NB = 10;\r
const float PI = 3.14159265;\r
\r
vec3 hueRotate(vec3 c, float a) {\r
  const mat3 toYiq = mat3(0.299, 0.596, 0.211, 0.587, -0.274, -0.523, 0.114, -0.322, 0.312);\r
  const mat3 toRgb = mat3(1.0, 1.0, 1.0, 0.956, -0.272, -1.106, 0.621, -0.647, 1.703);\r
  vec3 yiq = toYiq * c;\r
  float ca = cos(a);\r
  float sa = sin(a);\r
  yiq.yz = mat2(ca, sa, -sa, ca) * yiq.yz;\r
  return max(toRgb * yiq, 0.0);\r
}\r
\r
vec3 grade(vec3 c) {\r
  float g = dot(c, vec3(0.2126, 0.7152, 0.0722));\r
  c = clamp(mix(vec3(g), c, 1.5 * uSaturation), 0.0, 1.0);\r
  return hueRotate(c, uHueShift * 6.2831853);\r
}\r
\r
vec3 lightInk(vec3 L, float halo, vec3 body) {\r
  vec3 Lg = grade(L);\r
  float lum = dot(Lg, vec3(0.2126, 0.7152, 0.0722));\r
  float cov = 1.0 - exp(-lum * 2.6);\r
  vec3 hue = Lg / max(max(Lg.r, max(Lg.g, Lg.b)), 1e-4);\r
  float white = pow(clamp(min(hue.r, min(hue.g, hue.b)), 0.0, 1.0), 1.4);\r
  vec3 ink = pow(hue, vec3(2.2)) * 0.88;\r
  float coreAmt = white * smoothstep(0.05, 2.2, lum) * 0.92;\r
  vec3 cream = mix(mix(uColors[3], vec3(1.0), 0.3), vec3(1.0, 0.985, 0.95), smoothstep(1.2, 3.5, lum));\r
  vec3 c = mix(body, vec3(0.66, 0.69, 0.76), halo * 0.32);\r
  c = mix(c, ink, cov * (1.0 - white));\r
  return mix(c, cream, clamp(coreAmt, 0.0, 1.0));\r
}\r
\r
float sstep(float a, float b, float x) {\r
  float t = clamp((x - a) / (b - a), 0.0, 1.0);\r
  return t * t * (3.0 - 2.0 * t);\r
}\r
\r
float erfa(float x) {\r
  float a = abs(x);\r
  float t = 1.0 / (1.0 + 0.3275911 * a);\r
  float y = 1.0 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * exp(-a * a);\r
  return x < 0.0 ? -y : y;\r
}\r
\r
vec3 grad4(vec3 c0, vec3 c1, vec3 c2, vec3 c3, float p1, float p2, float f) {\r
  vec3 c = mix(c0, c1, sstep(0.0, p1, f));\r
  c = mix(c, c2, sstep(p1, p2, f));\r
  return mix(c, c3, sstep(p2, 1.0, f));\r
}\r
\r
float smaxk(float a, float b, float k) {\r
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);\r
  return mix(a, b, h) + k * h * (1.0 - h);\r
}\r
\r
vec2 sheetW(float tt, float H, float sig, float sigB, float ridges) {\r
  float ew = 0.04 * uThickness;\r
  float res0;\r
  float res1;\r
  for (int pass = 0; pass < 2; pass++) {\r
    float sg = pass == 0 ? sig : sigB;\r
    float fill = 0.5 * (erfa(tt / sg) - erfa((tt - H) / sg)) / H;\r
    float se = sqrt(sg * sg + 0.25 * ew * ew * H * H);\r
    float de = (tt - H + 0.5 * ew * H) / se;\r
    float eg = exp(-de * de) / (se * 1.7724539);\r
    float rgw = sqrt(sg * sg + 0.0025 * H * H);\r
    float d1 = (tt - 0.45 * H) / rgw;\r
    float d2 = (tt - 0.241 * H) / rgw;\r
    float rid = 0.04 * (exp(-d1 * d1) * step(1.5, ridges) + 0.7 * exp(-d2 * d2) * step(2.5, ridges)) / (rgw * 1.7724539);\r
    float v = 0.6 * fill * (1.0 - 0.55 * uLight) + (1.6 * ew * 0.886 * eg + rid) * (1.0 + 1.3 * uLight);\r
    if (pass == 0) res0 = v;\r
    else res1 = v;\r
  }\r
  return vec2(res0, res1);\r
}\r
\r
float axis(float x) {\r
  float a = uAmplitude;\r
  return -0.2318 + uLean.y * 0.06 + (-0.2394 + uLean.x * 0.1) * x + 0.2815 * a * x * x + 0.3368 * a * x * x * x;\r
}\r
\r
float softp(float z) {\r
  return 0.03 * log(1.0 + exp(clamp(z / 0.03, -60.0, 60.0)));\r
}\r
\r
vec3 light(vec2 u, float fp, float bend, float level, out float halo) {\r
  float amp = level < 0.65 ? mix(0.25, 1.0, sstep(0.0, 0.65, level)) : mix(1.0, 1.12, (level - 0.65) / 0.35);\r
  float grow = clamp((amp - 0.25) / 0.75, 0.0, 1.25);\r
  float x = u.x / uScale;\r
  float uy = u.y;\r
  float ya = axis(x);\r
  float taper = max(uTaper, 0.05);\r
  float bx = 0.0437 + uMotion.z + uLean.x * 0.08;\r
  float bump = exp(-pow((x - bx) / (0.6879 * taper), 2.0));\r
  float hW = 0.02 + softp(-0.12 + 0.5324 * uAmplitude * grow * uMotion.y * bump - 0.02);\r
  float k = 1.0 * uWaviness;\r
  float cphi = cos(0.5 * PI + k * (x + 0.0664) + uMotion.x);\r
  float envC = (0.0886 + 0.3 * exp(-pow((x - 0.0634) / 0.6873, 2.0))) * uSpread * grow;\r
  float hC = -envC * tanh(cphi / 0.6);\r
  float th = 0.051 * uThickness * exp(-pow(cphi / 0.5, 2.0));\r
  float sig = sqrt(pow(0.005 + 0.05 * bend, 2.0) + fp * fp + th * th);\r
  float sigB = sqrt(0.0064 * max(uGlow, 0.05) * max(uGlow, 0.05) + fp * fp + th * th);\r
  float mend = exp(-pow(abs((x + 0.0421) / (0.4235 * taper)), 2.2689));\r
  vec3 red = uColors[0];\r
  vec3 orange = uColors[1];\r
  vec3 amber = uColors[2];\r
  vec3 warmWhite = uColors[3];\r
  vec3 cyan = uColors[4];\r
  vec3 blue = uColors[5];\r
  vec3 deep = uColors[6];\r
  vec3 orangeEdge = orange * vec3(1.0, 0.85, 0.77);\r
  vec3 coolCore = mix(warmWhite, vec3(1.0, 1.0, 0.7), 0.6);\r
  vec3 mint = clamp(mix(cyan, warmWhite, 0.35) * vec3(0.92, 1.05, 0.95), 0.0, 1.0);\r
  float ridges = float(uCount);\r
  float glow = max(uGlow, 0.0);\r
  vec3 L = vec3(0.0);\r
  vec3 Lb = vec3(0.0);\r
  {\r
    float H = max(abs(hW), 1e-4);\r
    float tt = uy - ya;\r
    vec2 w = sheetW(tt, H, sig, sigB, ridges);\r
    float f = clamp(tt / H, 0.0, 1.0);\r
    vec3 c = grad4(warmWhite, amber, orange, orangeEdge, 0.2351, 0.5643, f);\r
    c = mix(c, red, sstep(0.75, 1.0, f) * sstep(0.196, 0.3376, hW));\r
    vec3 mean = (grad4(warmWhite, amber, orange, orangeEdge, 0.2351, 0.5643, 0.1) + grad4(warmWhite, amber, orange, orangeEdge, 0.2351, 0.5643, 0.35) + grad4(warmWhite, amber, orange, orangeEdge, 0.2351, 0.5643, 0.6) + grad4(warmWhite, amber, orange, orangeEdge, 0.2351, 0.5643, 0.9)) * 0.25;\r
    L += mix(c, mean, sstep(0.3, 1.2, sig / H)) * (w.x * 0.2101 * mend);\r
    Lb += mix(c, mean, sstep(0.3, 1.2, sigB / H)) * (w.y * 0.2101 * mend);\r
  }\r
  {\r
    float H = max(abs(hC), 1e-4);\r
    float tt = (uy - ya) * (hC >= 0.0 ? 1.0 : -1.0);\r
    vec2 w = sheetW(tt, H, sig, sigB, 1.0);\r
    float f = clamp(tt / H, 0.0, 1.0);\r
    vec3 c = grad4(coolCore, cyan, blue, deep, 0.15, 0.7931, f);\r
    vec3 mean = (grad4(coolCore, cyan, blue, deep, 0.15, 0.7931, 0.1) + grad4(coolCore, cyan, blue, deep, 0.15, 0.7931, 0.35) + grad4(coolCore, cyan, blue, deep, 0.15, 0.7931, 0.6) + grad4(coolCore, cyan, blue, deep, 0.15, 0.7931, 0.9)) * 0.25;\r
    L += mix(c, mean, sstep(0.3, 1.2, sig / H)) * (w.x * 0.28 * mend);\r
    Lb += mix(c, mean, sstep(0.3, 1.2, sigB / H)) * (w.y * 0.28 * mend);\r
  }\r
  vec3 G = vec3(0.0);\r
  float wh = sqrt(0.0256 + envC * envC * cphi * cphi);\r
  float dg = (uy - ya) / wh;\r
  G += vec3(1.0, 0.97, 0.92) * (exp(-dg * dg) * 0.0315 / wh * mend * glow);\r
  float nx = -0.0664 - uMotion.x / k + 0.2168;\r
  float bxx = (x - nx) / 0.1849;\r
  float byy = (uy - axis(nx) - 0.0333) / (0.0544 * mix(0.7, 1.0, min(amp, 1.0)));\r
  G += mint * (exp(-bxx * bxx - byy * byy) * 1.4 * glow * sstep(0.0, 0.6, amp));\r
  float hb = (uy - ya - 0.3 * hW) / (0.07 + 0.45 * hW + 0.3 * envC);\r
  halo = exp(-hb * hb) * mend * smoothstep(0.0, 0.3, uIntro);\r
  vec3 total = L + 0.16 * glow * Lb + 1.16 * G;\r
  return total * 2.4 * uIntensity * smoothstep(0.0, 0.3, uIntro) * sstep(uIntro * 1.6, uIntro * 1.6 - 0.5, abs(x));\r
}\r
\r
vec2 remap(vec2 p, float f, out float r, out float bend) {\r
  r = min(length(p), 0.9995);\r
  bend = pow(r, 5.17);\r
  float k = clamp(uRefraction, 0.0, 1.8);\r
  float sc = (1.0 - 0.278 * k * (1.0 - bend)) * (1.0 - 0.632 * k * bend) / (1.0 - 0.278 * k);\r
  return p * sc * f;\r
}\r
\r
void main() {\r
  vec2 res = uResolution;\r
  vec2 p = (gl_FragCoord.xy - 0.5 * res) / min(res.x, res.y);\r
  float level = clamp(uLevel, 0.0, 1.0);\r
  float appear = smoothstep(0.0, 0.35, uIntro);\r
\r
  if (uGlass > 0.5) {\r
    float R = uRadius * mix(0.94, 1.0, uIntro) * (1.0 + 0.03 * uPulse);\r
    float px = 1.0 / (min(res.x, res.y) * R);\r
    vec2 pc = p / R;\r
    float rho = length(pc);\r
    if (rho > 1.0 + 2.0 * px) {\r
      float sh = uLight * 0.07 * exp(-pow((rho - 0.985) / 0.07, 2.0)) * smoothstep(-0.6, 0.4, -pc.y) * appear * uOpacity;\r
      fragColor = vec4(0.0, 0.0, 0.0, sh);\r
      return;\r
    }\r
    float r;\r
    float bend;\r
    vec2 u = remap(pc, 1.0, r, bend);\r
    float fp = 0.5 * max(length(dFdx(u)), length(dFdy(u)));\r
    float halo;\r
    float skip;\r
    vec3 L = light(u, fp, bend, level, halo);\r
    float ca = 0.02 * uDispersion * bend;\r
    if (ca > 0.0015) {\r
      float r2;\r
      float b2;\r
      L.r = light(remap(pc, 1.0 - ca, r2, b2), fp, bend, level, skip).r;\r
      L.b = light(remap(pc, 1.0 + ca, r2, b2), fp, bend, level, skip).b;\r
    }\r
    vec3 col = 1.0 - exp(-L);\r
    vec2 d = pc / max(rho, 1e-6);\r
    float key = 0.4 * pow(max(0.0, d.x * 0.94 - d.y * 0.34), 6.0) + 0.2 * pow(max(0.0, -d.x * 0.5 + d.y * 0.87), 6.0);\r
    float ring = exp(-pow((r - 0.985) / 0.011, 2.0));\r
    float hzk = 0.25 + 0.7 * pow(max(0.0, -d.x * 0.6 + d.y * 0.8), 2.0) + pow(max(0.0, d.x * 0.8 - d.y * 0.6), 2.0);\r
    float haze = exp(-pow((1.0 - r) / 0.09, 2.0)) * hzk * 0.13 * uRim;\r
    vec3 orb;\r
    if (uLight > 0.5) {\r
      float lz = dot(d * r, vec2(-0.55, 0.83));\r
      vec3 body = mix(vec3(0.885, 0.893, 0.915), vec3(0.972, 0.975, 0.983), 0.5 + 0.5 * lz);\r
      float fres = smoothstep(0.8, 1.0, r);\r
      body = mix(body, vec3(0.82, 0.83, 0.86), fres * fres * 0.5);\r
      orb = lightInk(L, halo, body);\r
      float spec = exp(-pow((r - 0.955) / 0.03, 2.0)) * pow(max(0.0, dot(d, vec2(-0.55, 0.83))), 3.0);\r
      orb = mix(orb, vec3(1.0), clamp(spec * 0.85 * uRim + haze * 0.6, 0.0, 1.0));\r
      float edge = exp(-pow((1.0 - r) / (0.01 + 1.2 * px), 2.0));\r
      orb *= 1.0 - 0.12 * edge;\r
    } else {\r
      orb = vec3(0.04) + col * (1.0 + 0.1 * bend * uRim) + ring * key * uRim * (1.0 + 0.4 * level) + haze * vec3(1.0, 1.02, 1.04);\r
      orb = grade(clamp(orb, 0.0, 1.0));\r
    }\r
    float inside = clamp((1.0 - rho) / px + 0.5, 0.0, 1.0) * appear;\r
    vec3 rgb = orb * inside;\r
    fragColor = vec4(rgb, max(inside * mix(0.92, 1.0, uLight), max(max(rgb.r, rgb.g), rgb.b))) * uOpacity;\r
  } else {\r
    float span = 0.5 * res.x / min(res.x, res.y);\r
    vec2 u = p * (0.78 / span) + vec2(0.0, -0.15);\r
    float fp = 0.5 * max(length(dFdx(u)), length(dFdy(u)));\r
    float halo;\r
    float fade = sstep(0.82, 0.55, abs(u.x));\r
    vec3 L = light(u, fp, 0.0, level, halo) * fade;\r
    vec3 col = grade(1.0 - exp(-L)) * appear;\r
    if (uLight > 0.5) {\r
      vec3 c = lightInk(L, halo * fade * 0.6, vec3(1.0));\r
      float a = clamp(1.0 - min(c.r, min(c.g, c.b)), 0.0, 1.0) * appear;\r
      fragColor = vec4((c - (1.0 - a)) * appear, a) * uOpacity;\r
    } else {\r
      fragColor = vec4(col, max(max(col.r, col.g), col.b)) * uOpacity;\r
    }\r
  }\r
}\r
\`;\r
\r
const hexToRgb = (hex: string): [number, number, number] => {\r
  let h = String(hex).replace('#', '').trim();\r
  if (h.length === 3) h = h.replace(/(.)/g, '$1$1');\r
  const v = parseInt(h.slice(0, 6), 16);\r
  if (!isFinite(v)) return [1, 1, 1];\r
  return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];\r
};\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const compile = (gl: WebGL2RenderingContext, type: number, source: string) => {\r
  const shader = gl.createShader(type) as WebGLShader;\r
  gl.shaderSource(shader, source);\r
  gl.compileShader(shader);\r
  return shader;\r
};\r
\r
const createProgram = (gl: WebGL2RenderingContext) => {\r
  const program = gl.createProgram() as WebGLProgram;\r
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));\r
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));\r
  gl.bindAttribLocation(program, 0, 'position');\r
  gl.linkProgram(program);\r
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;\r
  return program;\r
};\r
\r
const smooth = (a: number, b: number, x: number) => {\r
  const k = Math.min(1, Math.max(0, (x - a) / (b - a)));\r
  return k * k * (3 - 2 * k);\r
};\r
\r
const speech = (t: number) => {\r
  const phrase = smooth(-0.8, -0.3, 0.6 * Math.sin(t * 2.7) + 0.5 * Math.sin(t * 1.53 + 1.2));\r
  const syllable = Math.max(0, Math.sin(t * 17 + 1.6 * Math.sin(t * 5.3)));\r
  const stress = 0.6 + 0.4 * Math.sin(t * 3.7 + 0.7);\r
  return phrase * (0.35 + 0.65 * syllable) * (0.25 + stress);\r
};\r
\r
const DEFAULT_COLORS = ['#d95b56', '#ba5046', '#ffa24c', '#ffe0b3', '#93f1ff', '#3569fa', '#193d9b'];\r
\r
export default function Strands({\r
  colors = DEFAULT_COLORS,\r
  count = 3,\r
  speed = 1,\r
  amplitude = 1,\r
  waviness = 1,\r
  thickness = 1,\r
  glow = 1,\r
  taper = 1,\r
  spread = 1,\r
  hueShift = 0,\r
  intensity = 1,\r
  saturation = 1,\r
  opacity = 1,\r
  scale = 1,\r
  glass = true,\r
  refraction = 1,\r
  dispersion = 1,\r
  glassSize = 1,\r
  rim = 1,\r
  energy = 0.65,\r
  listening = false,\r
  level,\r
  interactive = true,\r
  clickPulse = true,\r
  intro = true,\r
  lightMode = false,\r
  maxDevicePixelRatio = 2,\r
  className = '',\r
  style\r
}: StrandsProps) {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const propsRef = useRef<StrandsConfig>({} as StrandsConfig);\r
  propsRef.current = {\r
    colors,\r
    count,\r
    speed,\r
    amplitude,\r
    waviness,\r
    thickness,\r
    glow,\r
    taper,\r
    spread,\r
    hueShift,\r
    intensity,\r
    saturation,\r
    opacity,\r
    scale,\r
    glass,\r
    refraction,\r
    dispersion,\r
    glassSize,\r
    rim,\r
    energy,\r
    listening,\r
    level,\r
    interactive,\r
    clickPulse,\r
    intro,\r
    lightMode,\r
    maxDevicePixelRatio\r
  };\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    if (!container) return;\r
    const canvas = document.createElement('canvas');\r
    canvas.style.display = 'block';\r
    canvas.style.width = '100%';\r
    canvas.style.height = '100%';\r
    canvas.setAttribute('aria-hidden', 'true');\r
    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });\r
    if (!gl) return;\r
    container.appendChild(canvas);\r
\r
    let program: WebGLProgram | null = null;\r
    let buffer: WebGLBuffer | null = null;\r
    let loc: Record<string, WebGLUniformLocation | null> = {};\r
    const names = [\r
      'uResolution',\r
      'uMotion',\r
      'uLevel',\r
      'uColors',\r
      'uCount',\r
      'uAmplitude',\r
      'uWaviness',\r
      'uThickness',\r
      'uGlow',\r
      'uTaper',\r
      'uSpread',\r
      'uHueShift',\r
      'uIntensity',\r
      'uSaturation',\r
      'uScale',\r
      'uGlass',\r
      'uRadius',\r
      'uRefraction',\r
      'uDispersion',\r
      'uRim',\r
      'uLean',\r
      'uIntro',\r
      'uPulse',\r
      'uLight',\r
      'uOpacity'\r
    ];\r
    const setup = () => {\r
      const next = createProgram(gl);\r
      if (!next) return false;\r
      program = next;\r
      buffer = gl.createBuffer();\r
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
      gl.enableVertexAttribArray(0);\r
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
      gl.useProgram(next);\r
      loc = Object.fromEntries(names.map(name => [name, gl.getUniformLocation(next, name)]));\r
      gl.disable(gl.BLEND);\r
      gl.clearColor(0, 0, 0, 0);\r
      return true;\r
    };\r
    if (!setup()) {\r
      canvas.remove();\r
      return;\r
    }\r
\r
    const query =\r
      typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;\r
    const st = {\r
      clock: 0,\r
      pace: 0,\r
      activity: 0,\r
      hover: 0,\r
      hoverTarget: 0,\r
      burst: 0,\r
      lean: [0, 0] as number[],\r
      leanTarget: [0, 0] as number[],\r
      pulse: 0,\r
      pulseV: 0,\r
      introStart: -1,\r
      intro: propsRef.current.intro ? 0 : 1,\r
      visible: typeof IntersectionObserver === 'undefined',\r
      lost: false,\r
      raf: 0,\r
      last: 0,\r
      width: 0,\r
      height: 0,\r
      speechT: 0,\r
      paletteKey: '',\r
      palette: { flat: new Float32Array(MAX_COLORS * 3), count: 1 }\r
    };\r
\r
    const resize = () => {\r
      const dpr = Math.min(window.devicePixelRatio || 1, Math.max(0.5, propsRef.current.maxDevicePixelRatio));\r
      const w = Math.max(1, Math.round(container.clientWidth * dpr));\r
      const h = Math.max(1, Math.round(container.clientHeight * dpr));\r
      if (w !== st.width || h !== st.height) {\r
        st.width = w;\r
        st.height = h;\r
        canvas.width = w;\r
        canvas.height = h;\r
      }\r
    };\r
\r
    const updatePalette = (list: string[]) => {\r
      const key = list.join(',');\r
      if (key === st.paletteKey) return;\r
      st.paletteKey = key;\r
      const rgb = (list.length ? list : DEFAULT_COLORS).slice(0, MAX_COLORS).map(hexToRgb);\r
      const flat = new Float32Array(MAX_COLORS * 3);\r
      for (let i = 0; i < ROLES; i++) {\r
        const t = rgb.length > 1 ? (i / (ROLES - 1)) * (rgb.length - 1) : 0;\r
        const a = Math.floor(t);\r
        const b = Math.min(a + 1, rgb.length - 1);\r
        const f = t - a;\r
        flat.set(\r
          rgb[a].map((c, k) => c + (rgb[b][k] - c) * f),\r
          i * 3\r
        );\r
      }\r
      st.palette = { flat, count: ROLES };\r
    };\r
\r
    const draw = () => {\r
      if (st.lost || !program) return;\r
      const p = propsRef.current;\r
      updatePalette(Array.isArray(p.colors) ? p.colors : []);\r
      gl.viewport(0, 0, st.width, st.height);\r
      gl.uniform2f(loc.uResolution, st.width, st.height);\r
      const c = st.clock;\r
      const sway = 0.75 + 0.45 * st.pace;\r
      gl.uniform3f(\r
        loc.uMotion,\r
        (0.26 * Math.sin(0.53 * c) + 0.1 * Math.sin(1.19 * c + 1.3)) * sway,\r
        1 + (0.06 * Math.sin(0.71 * c) + 0.035 * Math.sin(1.37 * c + 0.4)) * sway,\r
        0.06 * Math.sin(0.41 * c + 2) * sway\r
      );\r
      gl.uniform1f(loc.uLevel, clamp(st.activity, 0, 1));\r
      gl.uniform3fv(loc.uColors, st.palette.flat);\r
      gl.uniform1i(loc.uCount, clamp(Math.round(p.count), 1, 3));\r
      gl.uniform1f(loc.uAmplitude, p.amplitude);\r
      gl.uniform1f(loc.uWaviness, p.waviness);\r
      gl.uniform1f(loc.uThickness, p.thickness);\r
      gl.uniform1f(loc.uGlow, p.glow);\r
      gl.uniform1f(loc.uTaper, Math.max(0.05, p.taper));\r
      gl.uniform1f(loc.uSpread, p.spread);\r
      gl.uniform1f(loc.uHueShift, p.hueShift);\r
      gl.uniform1f(loc.uIntensity, p.intensity);\r
      gl.uniform1f(loc.uSaturation, p.saturation);\r
      gl.uniform1f(loc.uScale, Math.max(0.05, p.scale));\r
      gl.uniform1f(loc.uGlass, p.glass ? 1 : 0);\r
      gl.uniform1f(loc.uRadius, 0.42 * p.glassSize);\r
      gl.uniform1f(loc.uRefraction, p.refraction);\r
      gl.uniform1f(loc.uDispersion, p.dispersion);\r
      gl.uniform1f(loc.uRim, p.rim);\r
      gl.uniform2f(loc.uLean, st.lean[0], st.lean[1]);\r
      gl.uniform1f(loc.uIntro, st.intro);\r
      gl.uniform1f(loc.uPulse, st.pulse);\r
      gl.uniform1f(loc.uLight, p.lightMode ? 1 : 0);\r
      gl.uniform1f(loc.uOpacity, p.opacity);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = (now: number) => {\r
      st.raf = 0;\r
      const p = propsRef.current;\r
      const dt = st.last ? clamp((now - st.last) / 1000, 0, 0.05) : 0;\r
      st.last = now;\r
      const reduced = !!query?.matches;\r
      if (st.introStart < 0 && st.visible) st.introStart = now;\r
      if (p.intro && !reduced && st.introStart >= 0) {\r
        const t = clamp((now - st.introStart) / 1400, 0, 1);\r
        st.intro = 1 - Math.pow(1 - t, 3);\r
      } else {\r
        st.intro = 1;\r
      }\r
      st.hover += (st.hoverTarget - st.hover) * (1 - Math.exp(-dt / (st.hoverTarget > st.hover ? 0.25 : 0.6)));\r
      for (let i = 0; i < 2; i++) st.lean[i] += (st.leanTarget[i] - st.lean[i]) * (1 - Math.exp(-dt / 0.35));\r
      st.pulseV += (-170 * st.pulse - 14 * st.pulseV) * dt;\r
      st.pulse += st.pulseV * dt;\r
      st.burst *= Math.exp(-dt / 0.45);\r
      if (p.listening && !reduced) st.speechT += dt;\r
      const voice =\r
        typeof p.level === 'number' ? clamp(p.level, 0, 1) : p.listening && !reduced ? speech(st.speechT) : 0;\r
      const target = Math.min(1.2, Math.max(clamp(p.energy, 0, 1), voice) + st.hover * 0.18 + st.burst);\r
      st.activity += (target - st.activity) * (1 - Math.exp(-dt / (target > st.activity ? 0.12 : 0.4)));\r
      st.pace += (Math.min(1, st.activity) - st.pace) * (1 - Math.exp(-dt / 0.8));\r
      if (!reduced) {\r
        st.clock += dt * p.speed * (0.6 + 1.6 * st.pace);\r
      }\r
      draw();\r
      const settled =\r
        reduced &&\r
        Math.abs(st.activity - target) < 1e-3 &&\r
        Math.abs(st.pulse) < 1e-3 &&\r
        Math.abs(st.pulseV) < 1e-3 &&\r
        st.burst < 1e-3 &&\r
        Math.abs(st.hover - st.hoverTarget) < 1e-3 &&\r
        Math.abs(st.lean[0] - st.leanTarget[0]) < 1e-3 &&\r
        Math.abs(st.lean[1] - st.leanTarget[1]) < 1e-3;\r
      if (st.visible && !document.hidden && !st.lost && !settled) st.raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (!st.raf && st.visible && !st.lost) {\r
        st.last = 0;\r
        st.raf = requestAnimationFrame(frame);\r
      }\r
    };\r
\r
    const local = (e: PointerEvent): [number, number] => {\r
      const r = container.getBoundingClientRect();\r
      const m = Math.min(r.width, r.height) || 1;\r
      return [(e.clientX - r.left - r.width / 2) / (m / 2), (e.clientY - r.top - r.height / 2) / (m / 2)];\r
    };\r
\r
    const onMove = (e: PointerEvent) => {\r
      if (!propsRef.current.interactive) return;\r
      const [x, y] = local(e);\r
      st.hoverTarget = clamp(1.6 - Math.hypot(x, y), 0, 1);\r
      st.leanTarget = [clamp(x, -1.2, 1.2) * 0.8, clamp(-y, -1.2, 1.2) * 0.8];\r
      wake();\r
    };\r
\r
    const onLeave = () => {\r
      st.hoverTarget = 0;\r
      st.leanTarget = [0, 0];\r
      wake();\r
    };\r
\r
    const onDown = () => {\r
      if (!propsRef.current.clickPulse) return;\r
      st.pulseV += 5;\r
      st.burst = Math.min(1.2, st.burst + 0.9);\r
      wake();\r
    };\r
\r
    const onLost = (e: Event) => {\r
      e.preventDefault();\r
      st.lost = true;\r
      if (st.raf) cancelAnimationFrame(st.raf);\r
      st.raf = 0;\r
    };\r
\r
    const onRestored = () => {\r
      st.lost = false;\r
      if (setup()) wake();\r
    };\r
\r
    canvas.addEventListener('webglcontextlost', onLost);\r
    canvas.addEventListener('webglcontextrestored', onRestored);\r
    container.addEventListener('pointermove', onMove);\r
    container.addEventListener('pointerleave', onLeave);\r
    container.addEventListener('pointerdown', onDown);\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      resize();\r
      draw();\r
    });\r
    resizeObserver.observe(container);\r
    resize();\r
\r
    let intersection: IntersectionObserver | null = null;\r
    if (typeof IntersectionObserver !== 'undefined') {\r
      intersection = new IntersectionObserver(entries => {\r
        st.visible = entries[entries.length - 1].isIntersecting;\r
        if (st.visible) wake();\r
      });\r
      intersection.observe(container);\r
    }\r
    const onVisibility = () => {\r
      if (!document.hidden) wake();\r
    };\r
    document.addEventListener('visibilitychange', onVisibility);\r
    wake();\r
\r
    return () => {\r
      if (st.raf) cancelAnimationFrame(st.raf);\r
      canvas.removeEventListener('webglcontextlost', onLost);\r
      canvas.removeEventListener('webglcontextrestored', onRestored);\r
      container.removeEventListener('pointermove', onMove);\r
      container.removeEventListener('pointerleave', onLeave);\r
      container.removeEventListener('pointerdown', onDown);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      resizeObserver.disconnect();\r
      intersection?.disconnect();\r
      if (program) gl.deleteProgram(program);\r
      if (buffer) gl.deleteBuffer(buffer);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
      canvas.remove();\r
    };\r
  }, []);\r
\r
  return (\r
    <div\r
      ref={containerRef}\r
      className={\`relative h-full w-full bg-transparent [-webkit-tap-highlight-color:transparent] \${className}\`.trim()}\r
      style={style}\r
    />\r
  );\r
}\r
`,o={dependencies:"",usage:`import Strands from './Strands';

<div style={{ width: '100%', height: '480px', position: 'relative' }}>
  <Strands />
</div>

<div style={{ width: '100%', height: '480px', position: 'relative' }}>
  <Strands listening />
</div>

<div style={{ width: '100%', height: '480px', position: 'relative' }}>
  <Strands level={micLevel} />
</div>

<div style={{ width: '100%', height: '320px', position: 'relative' }}>
  <Strands glass={false} energy={0.6} />
</div>`,code:r,css:n,tailwind:e,tsCode:t,tsTailwind:a};export{o as strands};
