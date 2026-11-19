const r=`'use client';\r
\r
import { useEffect, useRef, useState } from 'react';\r
import './ElectricBorder.css';\r
\r
const ARCS = 4;\r
const PULSES = 3;\r
const MARGIN = 64;\r
const PIXEL_BUDGET = 3e6;\r
const SURGE_SPEED = 560;\r
const HALF_PI = Math.PI / 2;\r
\r
const VERTEX = \`#version 300 es\r
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));\r
void main() {\r
  gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
\r
uniform vec2 uSize;\r
uniform float uRatio;\r
uniform vec2 uCenter;\r
uniform vec2 uHalf;\r
uniform float uRadius;\r
uniform vec3 uParam;\r
uniform float uPerimeter;\r
uniform vec4 uCells;\r
uniform vec2 uSoft;\r
uniform float uTime;\r
uniform float uPower;\r
uniform float uReveal;\r
uniform vec3 uHover;\r
uniform float uHoverRadius;\r
uniform vec4 uPulses[\${PULSES}];\r
uniform vec3 uCore;\r
uniform vec3 uGlowColor;\r
uniform float uIntensity;\r
uniform float uGlow;\r
uniform float uThickness;\r
uniform float uStrands;\r
uniform float uChaos;\r
uniform float uSpread;\r
uniform float uFlicker;\r
uniform float uInk;\r
uniform vec4 uArcEnds[\${ARCS}];\r
uniform vec4 uArcShape[\${ARCS}];\r
\r
out vec4 fragColor;\r
\r
uint scramble(uint x) {\r
  x ^= x >> 16u;\r
  x *= 0x7feb352du;\r
  x ^= x >> 15u;\r
  x *= 0x846ca68bu;\r
  x ^= x >> 16u;\r
  return x;\r
}\r
\r
vec2 slant(uint x, uint y, uint seed) {\r
  uint h = scramble(x * 0x8da6b343u + y * 0xd8163841u + seed * 0xcb1ab31fu);\r
  return vec2(uvec2(h, h >> 8u) & 255u) / 127.5 - 1.0;\r
}\r
\r
vec2 ring(vec2 p, float period, uint seed) {\r
  vec2 i = floor(p);\r
  vec2 f = p - i;\r
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);\r
  float du = 30.0 * f.x * f.x * (f.x * (f.x - 2.0) + 1.0);\r
  uint x0 = uint(mod(i.x, period));\r
  uint x1 = uint(mod(i.x + 1.0, period));\r
  uint y0 = uint(i.y + 65536.0);\r
  vec2 ga = slant(x0, y0, seed);\r
  vec2 gb = slant(x1, y0, seed);\r
  vec2 gc = slant(x0, y0 + 1u, seed);\r
  vec2 gd = slant(x1, y0 + 1u, seed);\r
  float va = dot(ga, f);\r
  float vb = dot(gb, f - vec2(1.0, 0.0));\r
  float vc = dot(gc, f - vec2(0.0, 1.0));\r
  float vd = dot(gd, f - vec2(1.0, 1.0));\r
  float k = va - vb - vc + vd;\r
  float value = va + u.x * (vb - va) + u.y * (vc - va) + u.x * u.y * k;\r
  float gx = ga.x + u.x * (gb.x - ga.x) + u.y * (gc.x - ga.x) + u.x * u.y * (ga.x - gb.x - gc.x + gd.x);\r
  return vec2(value, gx + du * (vb - va + u.y * k));\r
}\r
\r
float wobble(float x, uint seed) {\r
  return ring(vec2(x, 0.5), 1048576.0, seed).x;\r
}\r
\r
vec2 frameAt(vec2 p) {\r
  vec2 inner = max(uHalf - uRadius, 0.0);\r
  vec2 q = abs(p) - inner;\r
  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - uRadius;\r
  float quarter = uPerimeter * 0.25;\r
  vec2 v = abs(p) - uParam.xy;\r
  float t;\r
  if (v.x > 0.0 && v.y > 0.0) t = uParam.x + uParam.z * atan(v.x, v.y);\r
  else if (v.x > v.y) t = uParam.x + 1.5707963 * uParam.z + uParam.y - abs(p.y);\r
  else t = abs(p.x);\r
  t = clamp(t, 0.0, quarter);\r
  float s = p.x >= 0.0 ? (p.y < 0.0 ? t : 2.0 * quarter - t) : (p.y < 0.0 ? 4.0 * quarter - t : 2.0 * quarter + t);\r
  return vec2(s, d);\r
}\r
\r
vec2 glowShape(float line, float spread, float w) {\r
  float x = abs(line);\r
  float y = abs(spread);\r
  return vec2(exp(-x * x / (w * w * 0.5)) + exp(-y / (w * 2.2)) * 0.6, exp(-y / (w * 4.5)) * 0.5);\r
}\r
\r
void addArc(vec2 p, vec4 ends, vec4 info, float t, inout vec3 light, inout float energy, inout float hot) {\r
  if (info.y < 0.002) return;\r
  vec2 ab = ends.zw - ends.xy;\r
  float len = max(length(ab), 1.0);\r
  vec2 dir = ab / len;\r
  vec2 rel = p - ends.xy;\r
  float along = dot(rel, dir);\r
  float side = dot(rel, vec2(-dir.y, dir.x));\r
  float margin = abs(info.x) + (0.6 + uChaos) * (2.0 + len * 0.08) + uThickness * 12.0 + 10.0;\r
  if (along < -margin || along > len + margin || abs(side) > margin) return;\r
  float u = clamp(along / len, 0.0, 1.0);\r
  float taper = sin(3.14159265 * u);\r
  float settle = smoothstep(0.0, 0.15, u) * smoothstep(1.0, 0.85, u);\r
  float bendSlope = 3.14159265 / len * cos(3.14159265 * u) * settle;\r
  float beyond = max(-along, 0.0) + max(along - len, 0.0);\r
  for (int c = 0; c < 2; c++) {\r
    uint seed = uint(info.z * 131.0) + uint(c) * 29u + 7u;\r
    float jag = 0.0;\r
    float jagSlope = 0.0;\r
    float wave = max(len * 0.3, 14.0);\r
    float weight = (0.6 + uChaos) * (1.5 + len * 0.05) * (c == 0 ? 1.0 : 1.5);\r
    for (int o = 0; o < 3; o++) {\r
      vec2 n = ring(vec2(along / wave + info.z * 3.0, t * (1.4 + float(o) * 1.1)), 1048576.0, seed + uint(o));\r
      jag += n.x * weight;\r
      jagSlope += n.y * weight / wave;\r
      wave *= 0.42;\r
      weight *= 0.4;\r
    }\r
    float offset = (info.x + jag) * taper;\r
    float offsetSlope = (info.x + jag) * bendSlope + jagSlope * taper * settle;\r
    float across = (side - offset) / sqrt(1.0 + offsetSlope * offsetSlope);\r
    float gap = length(vec2(beyond, across));\r
    float w = uThickness * (c == 0 ? 0.9 : 0.6);\r
    vec2 g = glowShape(gap, gap, w);\r
    float k = info.y * (c == 0 ? 1.0 : 0.45);\r
    light += (uCore * g.x + uGlowColor * g.y * uGlow) * k;\r
    energy += (g.x + g.y * uGlow) * k;\r
    hot += exp(-gap * gap / (w * w * 0.16)) * k * (c == 0 ? 1.0 : 0.0);\r
  }\r
}\r
\r
void main() {\r
  vec2 p = vec2(gl_FragCoord.x / uRatio, uSize.y - gl_FragCoord.y / uRatio);\r
  vec2 frame = frameAt(p - uCenter);\r
  float s = frame.x;\r
  float d = frame.y;\r
  float t = uTime;\r
  vec3 light = vec3(0.0);\r
  float energy = 0.0;\r
  float hot = 0.0;\r
\r
  float along = min(s, uPerimeter - s);\r
  float front = uReveal * (uPerimeter * 0.5 + 80.0);\r
  float shown = smoothstep(front, front - 70.0, along) * uPower;\r
  float flare = uReveal < 1.0 ? exp(-pow((along - front + 30.0) / 26.0, 2.0)) * uPower : 0.0;\r
\r
  vec2 toHover = p - uHover.xy;\r
  float heat = uHover.z * exp(-dot(toHover, toHover) / (uHoverRadius * uHoverRadius));\r
  float surge = 0.0;\r
  for (int i = 0; i < \${PULSES}; i++) {\r
    vec4 pulse = uPulses[i];\r
    if (pulse.z <= 0.0) continue;\r
    float gap = abs(s - pulse.x);\r
    gap = min(gap, uPerimeter - gap);\r
    float wave = (gap - pulse.y * \${SURGE_SPEED}.0) / 46.0;\r
    surge += exp(-wave * wave) * pulse.z * exp(-pulse.y * 1.2);\r
  }\r
  heat = min(heat * 0.7 + surge * 0.8 + flare * 0.6, 1.2);\r
  vec2 inset = min(p, uSize - p);\r
  float frameFade = smoothstep(0.0, 14.0, min(inset.x, inset.y));\r
\r
  float edge = abs(d);\r
  float inward = d < 0.0 ? exp(d / 14.0) : 1.0;\r
  float bloom = (exp(-edge / 3.0) * 0.1 + exp(-edge / 16.0) * 0.05 * inward) * uGlow * (1.0 + heat * 0.6) * shown;\r
  light += uGlowColor * bloom;\r
  energy += bloom;\r
\r
  float bendAmp = uSpread * 16.0 * (1.0 + heat * 0.35);\r
  float rippleAmp = uSpread * 6.0 * (1.0 + heat * 0.3);\r
  float crinkleAmp = uChaos * 4.5 * (1.0 + heat * 0.3);\r
  float squeeze = min(1.0, 34.0 / max((bendAmp + rippleAmp) * 1.6 + crinkleAmp, 1e-3));\r
  bendAmp *= squeeze;\r
  rippleAmp *= squeeze;\r
  crinkleAmp *= squeeze;\r
  float reach = (bendAmp * 1.9 + rippleAmp + crinkleAmp * 1.6) * 1.3 + uThickness * 14.0 + 8.0;\r
  if (edge < reach && shown > 0.0) {\r
    float fade = smoothstep(reach, reach * 0.55, edge);\r
    float count = min(uStrands + heat * 1.2, 6.0);\r
    float slopeScale = 1.0 / uPerimeter;\r
    for (int i = 0; i < 6; i++) {\r
      float fi = float(i);\r
      if (fi >= ceil(count)) break;\r
      float present = clamp(count - fi, 0.0, 1.0);\r
      uint seed = uint(i) * 7u + 3u;\r
      float lead = i == 0 ? 1.0 : 0.0;\r
      float range = mix(1.35 + fi * 0.18, 0.7, lead);\r
      float x = s * slopeScale;\r
      vec2 a = ring(vec2(x * uCells.x, t * 0.7 + fi * 3.1), uCells.x, seed);\r
      vec2 b = ring(vec2(x * uCells.y, t * 1.9 + fi * 1.7), uCells.y, seed + 1u);\r
      vec2 c = ring(vec2(x * uCells.z, t * 4.6 + fi * 0.9), uCells.z, seed + 2u);\r
      vec2 e = ring(vec2(x * uCells.w, t * 6.8), uCells.w, seed + 3u);\r
      float offset = (a.x * bendAmp + b.x * rippleAmp) * range + (c.x + e.x * 0.35) * crinkleAmp;\r
      float slope =\r
        ((a.y * uCells.x * bendAmp + b.y * uCells.y * rippleAmp) * range +\r
          (c.y * uCells.z + e.y * 0.35 * uCells.w) * crinkleAmp) *\r
        slopeScale;\r
      float drift = lead > 0.5 ? 0.0 : wobble(fi * 7.3, seed + 9u) * 2.5 * uSpread;\r
      offset += drift;\r
      float across = (d - offset) / sqrt(1.0 + slope * slope);\r
      float spread = d - a.x * bendAmp * range - drift;\r
      float swell = 0.5 + 0.5 * ring(vec2(x * uSoft.y, t * 2.0 + fi * 5.1), uSoft.y, seed + 8u).x;\r
      float w = uThickness * mix(0.55, 1.0, lead) * (0.5 + swell);\r
      float vis = mix(0.3 + 0.45 * smoothstep(-0.25, 0.2, ring(vec2(x * uSoft.x, t * 0.5 + fi * 3.7), uSoft.x, seed + 5u).x), 1.0, lead);\r
      float spark = 1.0 - uFlicker * 0.3 * (0.5 + 0.5 * wobble(t * 13.0 + fi * 2.3, seed + 6u));\r
      float weight = max(vis, heat * 0.6) * spark * fade * present * (0.7 + 0.6 * swell);\r
      vec2 g = glowShape(across, spread, w) * weight;\r
      g.y *= inward;\r
      float haze = uGlow * (1.0 + heat * 0.5) * (1.0 - uInk * 0.7);\r
      light += uCore * g.x + uGlowColor * g.y * haze;\r
      energy += g.x + g.y * haze;\r
      hot += exp(-across * across / (w * w * 0.16)) * lead * weight;\r
    }\r
    light *= shown;\r
    energy *= shown;\r
    hot *= shown;\r
  }\r
\r
  for (int i = 0; i < \${ARCS}; i++) addArc(p, uArcEnds[i], uArcShape[i], t, light, energy, hot);\r
\r
  float breath = 1.0 + uFlicker * 0.5 * wobble(t * 4.6 + 7.0, 3u);\r
  float gain = uIntensity * breath * (1.0 + heat * 0.25) * 1.4;\r
  light *= frameFade;\r
  energy *= frameFade;\r
  hot *= frameFade;\r
  float alpha = 1.0 - exp(-energy * gain);\r
  vec3 color = mix(1.0 - exp(-light * gain), alpha * light / max(energy, 1e-4), uInk);\r
  color = mix(color, vec3(alpha), clamp(hot, 0.0, 1.0) * uInk * 0.85);\r
  float grain = (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;\r
  alpha = clamp(alpha + grain, 0.0, 1.0);\r
  fragColor = vec4(clamp(color + grain, 0.0, alpha), alpha);\r
}\`;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const parseColor = value => {\r
  const text = String(value || '').trim();\r
  const hex = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text);\r
  if (hex) {\r
    const full = hex[1].length === 3 ? hex[1].replace(/./g, digit => digit + digit) : hex[1];\r
    return [0, 2, 4].map(index => parseInt(full.slice(index, index + 2), 16) / 255);\r
  }\r
  const rgb = /^rgba?\\(\\s*([\\d.]+)[\\s,]+([\\d.]+)[\\s,]+([\\d.]+)/i.exec(text);\r
  if (rgb) return [rgb[1], rgb[2], rgb[3]].map(channel => clamp(parseFloat(channel) / 255, 0, 1));\r
  if (typeof document !== 'undefined') {\r
    const context = document.createElement('canvas').getContext('2d');\r
    if (context) {\r
      context.fillStyle = '#000000';\r
      context.fillStyle = text;\r
      const normal = String(context.fillStyle);\r
      if (normal !== '#000000' || /^(#0{3}|#0{6}|black)$/i.test(text)) return parseColor(normal);\r
    }\r
  }\r
  return [0.49, 0.98, 1];\r
};\r
\r
const compile = (gl, type, source) => {\r
  const shader = gl.createShader(type);\r
  if (!shader) return null;\r
  gl.shaderSource(shader, source);\r
  gl.compileShader(shader);\r
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {\r
    console.error(gl.getShaderInfoLog(shader));\r
    gl.deleteShader(shader);\r
    return null;\r
  }\r
  return shader;\r
};\r
\r
const link = gl => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
  const program = vertex && fragment ? gl.createProgram() : null;\r
  if (!vertex || !fragment || !program) {\r
    if (vertex) gl.deleteShader(vertex);\r
    if (fragment) gl.deleteShader(fragment);\r
    return null;\r
  }\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
  gl.linkProgram(program);\r
  gl.deleteShader(vertex);\r
  gl.deleteShader(fragment);\r
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {\r
    console.error(gl.getProgramInfoLog(program));\r
    gl.deleteProgram(program);\r
    return null;\r
  }\r
  const uniforms = {};\r
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
  for (let index = 0; index < count; index++) {\r
    const info = gl.getActiveUniform(program, index);\r
    if (info) uniforms[info.name.replace(/\\[0\\]$/, '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const roundBox = (x, y, hx, hy, r) => {\r
  const qx = Math.abs(x) - (hx - r);\r
  const qy = Math.abs(y) - (hy - r);\r
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;\r
};\r
\r
const pathOf = (width, height, radius, offset) => {\r
  const hx = Math.max(1, width / 2 + offset);\r
  const hy = Math.max(1, height / 2 + offset);\r
  const r = clamp(radius + offset, 0, Math.min(hx, hy));\r
  const vr = Math.min(r + 48, Math.min(hx, hy));\r
  const ax = hx - vr;\r
  const ay = hy - vr;\r
  const quarter = ax + ay + HALF_PI * vr;\r
  return { hx, hy, r, vr, ax, ay, quarter, perimeter: quarter * 4 };\r
};\r
\r
const pointOn = (path, s) => {\r
  const { hx, hy, r, vr, ax, ay, quarter, perimeter } = path;\r
  const u = ((s % perimeter) + perimeter) % perimeter;\r
  const part = Math.min(3, Math.floor(u / quarter));\r
  const rest = u - part * quarter;\r
  const local = part % 2 ? quarter - rest : rest;\r
  let x;\r
  let y;\r
  if (local <= ax) {\r
    x = local;\r
    y = -hy;\r
  } else if (local <= ax + HALF_PI * vr) {\r
    const angle = vr > 0 ? (local - ax) / vr : 0;\r
    const dx = Math.sin(angle);\r
    const dy = -Math.cos(angle);\r
    let low = 0;\r
    let high = vr + r + 2;\r
    for (let step = 0; step < 18; step++) {\r
      const mid = (low + high) / 2;\r
      if (roundBox(ax + dx * mid, -ay + dy * mid, hx, hy, r) < 0) low = mid;\r
      else high = mid;\r
    }\r
    x = ax + dx * low;\r
    y = -ay + dy * low;\r
  } else {\r
    x = hx;\r
    y = -ay + (local - ax - HALF_PI * vr);\r
  }\r
  const flipX = part >= 2 ? -1 : 1;\r
  const flipY = part === 1 || part === 2 ? -1 : 1;\r
  const px = x * flipX;\r
  const py = y * flipY;\r
  const nx = roundBox(px + 0.5, py, hx, hy, r) - roundBox(px - 0.5, py, hx, hy, r);\r
  const ny = roundBox(px, py + 0.5, hx, hy, r) - roundBox(px, py - 0.5, hx, hy, r);\r
  const length = Math.hypot(nx, ny) || 1;\r
  return { x: px, y: py, nx: nx / length, ny: ny / length };\r
};\r
\r
const nearestOn = (path, x, y) => {\r
  const { ax, ay, vr, quarter } = path;\r
  const qx = Math.abs(x) - ax;\r
  const qy = Math.abs(y) - ay;\r
  let t;\r
  if (qx > 0 && qy > 0) t = ax + vr * Math.atan2(qx, qy);\r
  else if (qx > qy) t = ax + HALF_PI * vr + ay - Math.abs(y);\r
  else t = Math.abs(x);\r
  t = clamp(t, 0, quarter);\r
  if (x >= 0) return y < 0 ? t : 2 * quarter - t;\r
  return y < 0 ? 4 * quarter - t : 2 * quarter + t;\r
};\r
\r
const ElectricBorder = ({\r
  children,\r
  color = '#7df9ff',\r
  glowColor,\r
  speed = 1,\r
  chaos = 0.5,\r
  spread = 0.6,\r
  thickness = 1.5,\r
  strands = 3,\r
  glow = 0.6,\r
  intensity = 0.8,\r
  arcs = 1,\r
  flicker = 0.5,\r
  borderRadius = 24,\r
  offset = 0,\r
  active = true,\r
  intro = true,\r
  interactive = true,\r
  cursorRadius = 90,\r
  theme = 'dark',\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const [generation, setGeneration] = useState(0);\r
\r
  const base = parseColor(color);\r
  const settings = {\r
    core: base.map(channel => channel + (1 - channel) * 0.55),\r
    glowColor: glowColor ? parseColor(glowColor) : base,\r
    speed: Math.max(0, speed),\r
    chaos: clamp(chaos, 0, 2),\r
    spread: clamp(spread, 0, 2),\r
    thickness: Math.max(0.25, thickness),\r
    strands: clamp(Math.round(strands), 1, 6),\r
    glow: clamp(glow, 0, 3),\r
    intensity: Math.max(0, intensity),\r
    arcs: Math.max(0, arcs),\r
    flicker: clamp(flicker, 0, 1),\r
    borderRadius: Math.max(0, borderRadius),\r
    offset,\r
    active,\r
    intro,\r
    interactive,\r
    cursorRadius: Math.max(1, cursorRadius),\r
    light: theme === 'light'\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    if (!container || !canvas) return;\r
\r
    const gl = canvas.getContext('webgl2', {\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false,\r
      powerPreference: 'default'\r
    });\r
    const program = gl ? link(gl) : null;\r
    if (!gl || !program) return;\r
\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
    const vao = gl.createVertexArray();\r
    const arcEnds = new Float32Array(ARCS * 4);\r
    const arcShape = new Float32Array(ARCS * 4);\r
    const pulseData = new Float32Array(PULSES * 4);\r
    const size = { width: 1, height: 1, ratio: 1 };\r
    const pointer = { x: 0, y: 0, over: false, near: false };\r
    const hover = { x: 0, y: 0, vx: 0, vy: 0, power: 0 };\r
    const sparks = [];\r
    const pulses = [];\r
    const first = settingsRef.current;\r
    let power = first.active && !(first.intro && !reduced && generation === 0) ? 1 : 0;\r
    let reveal = power;\r
    let wasActive = first.active;\r
    let ink = first.light ? 1 : 0;\r
    let path = pathOf(1, 1, 0, 0);\r
    let time = Math.random() * 100;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let pageVisible = document.visibilityState !== 'hidden';\r
    let lost = false;\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const width = Math.max(1, container.offsetWidth);\r
      const height = Math.max(1, container.offsetHeight);\r
      const canvasWidth = width + MARGIN * 2;\r
      const canvasHeight = height + MARGIN * 2;\r
      const ratio = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(PIXEL_BUDGET / (canvasWidth * canvasHeight)));\r
      const pixelWidth = Math.max(1, Math.round(canvasWidth * ratio));\r
      const pixelHeight = Math.max(1, Math.round(canvasHeight * ratio));\r
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {\r
        canvas.width = pixelWidth;\r
        canvas.height = pixelHeight;\r
      }\r
      canvas.style.width = \`\${canvasWidth}px\`;\r
      canvas.style.height = \`\${canvasHeight}px\`;\r
      Object.assign(size, { width, height, ratio: pixelWidth / canvasWidth });\r
      path = pathOf(width, height, s.borderRadius, s.offset);\r
    };\r
\r
    const spawnArc = (now, near) => {\r
      const span = Math.min(path.perimeter * 0.3, 60 + Math.random() * 90);\r
      const start = near ?? Math.random() * path.perimeter;\r
      const from = start - span * (0.2 + Math.random() * 0.6);\r
      const to = from + span;\r
      const a = pointOn(path, from);\r
      const b = pointOn(path, to);\r
      const mid = pointOn(path, (from + to) / 2);\r
      const dx = b.x - a.x;\r
      const dy = b.y - a.y;\r
      const length = Math.hypot(dx, dy) || 1;\r
      const side = (-dy / length) * mid.nx + (dx / length) * mid.ny;\r
      const bow = Math.min(MARGIN - 30, length * (0.14 + Math.random() * 0.16) + 5);\r
      return {\r
        ax: a.x,\r
        ay: a.y,\r
        bx: b.x,\r
        by: b.y,\r
        bow: side >= 0 ? bow : -bow,\r
        seed: 1 + Math.random() * 60,\r
        born: now,\r
        life: 0.35 + Math.random() * 0.45\r
      };\r
    };\r
\r
    const render = (s, heatPower) => {\r
      const u = program.uniforms;\r
      const width = size.width + MARGIN * 2;\r
      const height = size.height + MARGIN * 2;\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      if (power <= 0.001 && !sparks.length) return;\r
      gl.useProgram(program.program);\r
      gl.uniform2f(u.uSize, width, height);\r
      gl.uniform1f(u.uRatio, size.ratio);\r
      gl.uniform2f(u.uCenter, width / 2, height / 2);\r
      gl.uniform2f(u.uHalf, path.hx, path.hy);\r
      gl.uniform1f(u.uRadius, path.r);\r
      gl.uniform3f(u.uParam, path.ax, path.ay, path.vr);\r
      gl.uniform1f(u.uPerimeter, path.perimeter);\r
      gl.uniform4f(\r
        u.uCells,\r
        Math.max(1, Math.round(path.perimeter / 75)),\r
        Math.max(2, Math.round(path.perimeter / 25)),\r
        Math.max(3, Math.round(path.perimeter / 9)),\r
        Math.max(4, Math.round(path.perimeter / 4))\r
      );\r
      gl.uniform2f(\r
        u.uSoft,\r
        Math.max(1, Math.round(path.perimeter / 150)),\r
        Math.max(1, Math.round(path.perimeter / 50))\r
      );\r
      gl.uniform1f(u.uTime, time);\r
      gl.uniform1f(u.uPower, power * power * (3 - 2 * power));\r
      gl.uniform1f(u.uReveal, reveal);\r
      gl.uniform3f(u.uHover, hover.x + MARGIN, hover.y + MARGIN, heatPower);\r
      gl.uniform1f(u.uHoverRadius, s.cursorRadius);\r
      gl.uniform4fv(u.uPulses, pulseData);\r
      gl.uniform3fv(u.uCore, s.core);\r
      gl.uniform3fv(u.uGlowColor, s.glowColor);\r
      gl.uniform1f(u.uIntensity, s.intensity);\r
      gl.uniform1f(u.uGlow, s.glow);\r
      gl.uniform1f(u.uThickness, s.thickness);\r
      gl.uniform1f(u.uStrands, s.strands);\r
      gl.uniform1f(u.uChaos, s.chaos);\r
      gl.uniform1f(u.uSpread, s.spread);\r
      gl.uniform1f(u.uFlicker, reduced ? 0 : s.flicker);\r
      gl.uniform1f(u.uInk, ink);\r
      gl.uniform4fv(u.uArcEnds, arcEnds);\r
      gl.uniform4fv(u.uArcShape, arcShape);\r
      gl.bindVertexArray(vao);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (lost) return;\r
      const s = settingsRef.current;\r
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05);\r
      last = Math.max(last, now);\r
      const motion = reduced ? 0.2 : 1;\r
      time += dt * s.speed * motion;\r
\r
      if (s.active && !wasActive) reveal = 0;\r
      wasActive = s.active;\r
      power += ((s.active ? 1 : 0) - power) * (1 - Math.exp(-dt / (s.active ? 0.28 : 0.4)));\r
      if (s.active) reveal = reduced ? 1 : Math.min(1, reveal + dt / 0.9);\r
      ink += ((s.light ? 1 : 0) - ink) * (1 - Math.exp(-dt / 0.25));\r
\r
      const engaged = s.interactive && pointer.near && s.active;\r
      if (engaged && hover.power < 0.01) {\r
        hover.x = pointer.x;\r
        hover.y = pointer.y;\r
        hover.vx = 0;\r
        hover.vy = 0;\r
      }\r
      hover.vx += ((pointer.x - hover.x) * 120 - hover.vx * 19) * dt;\r
      hover.vy += ((pointer.y - hover.y) * 120 - hover.vy * 19) * dt;\r
      hover.x += hover.vx * dt;\r
      hover.y += hover.vy * dt;\r
      hover.power += ((engaged ? 1 : 0) - hover.power) * (1 - Math.exp(-dt / (engaged ? 0.3 : 0.55)));\r
\r
      for (let index = sparks.length - 1; index >= 0; index--) {\r
        if (time - sparks[index].born > sparks[index].life) sparks.splice(index, 1);\r
      }\r
      if (!reduced && s.active && reveal >= 1 && s.arcs > 0 && sparks.length < ARCS) {\r
        const chance = dt * s.speed * s.arcs;\r
        if (Math.random() < chance * 5 * hover.power) {\r
          sparks.push(spawnArc(time, nearestOn(path, hover.x - size.width / 2, hover.y - size.height / 2)));\r
        } else if (Math.random() < chance * (0.6 + path.perimeter / 2400)) {\r
          sparks.push(spawnArc(time, null));\r
        }\r
      }\r
      const fit = power * power * (3 - 2 * power);\r
      for (let index = 0; index < ARCS; index++) {\r
        const o = index * 4;\r
        const spark = sparks[index];\r
        if (!spark) {\r
          arcShape[o + 1] = 0;\r
          continue;\r
        }\r
        const k = clamp((time - spark.born) / spark.life, 0, 1);\r
        arcEnds[o] = spark.ax + size.width / 2 + MARGIN;\r
        arcEnds[o + 1] = spark.ay + size.height / 2 + MARGIN;\r
        arcEnds[o + 2] = spark.bx + size.width / 2 + MARGIN;\r
        arcEnds[o + 3] = spark.by + size.height / 2 + MARGIN;\r
        arcShape[o] = spark.bow;\r
        arcShape[o + 1] = Math.sin(Math.PI * k) * fit;\r
        arcShape[o + 2] = spark.seed;\r
      }\r
\r
      for (let index = pulses.length - 1; index >= 0; index--) {\r
        if (now - pulses[index].born > 2200) pulses.splice(index, 1);\r
      }\r
      for (let index = 0; index < PULSES; index++) {\r
        const o = index * 4;\r
        const pulse = pulses[index];\r
        if (!pulse) {\r
          pulseData[o + 2] = 0;\r
          continue;\r
        }\r
        pulseData[o] = pulse.s;\r
        pulseData[o + 1] = (now - pulse.born) / 1000;\r
        pulseData[o + 2] = 1;\r
      }\r
\r
      render(s, hover.power * (s.interactive ? 1 : 0));\r
\r
      const busy = power > 0.002 || s.active || sparks.length > 0;\r
      if (busy && visible && pageVisible) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (raf || lost || !visible || !pageVisible) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
    wakeRef.current = () => {\r
      resize();\r
      wake();\r
    };\r
\r
    const locate = event => {\r
      const rect = container.getBoundingClientRect();\r
      pointer.x = event.clientX - rect.left;\r
      pointer.y = event.clientY - rect.top;\r
      pointer.over = pointer.x >= 0 && pointer.y >= 0 && pointer.x <= rect.width && pointer.y <= rect.height;\r
      pointer.near =\r
        pointer.x >= -MARGIN / 2 &&\r
        pointer.y >= -MARGIN / 2 &&\r
        pointer.x <= rect.width + MARGIN / 2 &&\r
        pointer.y <= rect.height + MARGIN / 2;\r
    };\r
\r
    const onPointerMove = event => {\r
      locate(event);\r
      if (pointer.near) wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      locate(event);\r
      const s = settingsRef.current;\r
      if (!pointer.over || !s.interactive || !s.active || reduced) return;\r
      const along = nearestOn(path, pointer.x - size.width / 2, pointer.y - size.height / 2);\r
      pulses.push({ s: along, born: performance.now() });\r
      if (pulses.length > PULSES) pulses.shift();\r
      if (sparks.length < ARCS) sparks.push(spawnArc(time, along));\r
      wake();\r
    };\r
\r
    const onLeave = () => {\r
      pointer.over = false;\r
      pointer.near = false;\r
    };\r
\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onLeave);\r
\r
    const onLost = event => {\r
      event.preventDefault();\r
      lost = true;\r
      cancelAnimationFrame(raf);\r
      raf = 0;\r
    };\r
    const onRestored = () => setGeneration(value => value + 1);\r
    canvas.addEventListener('webglcontextlost', onLost);\r
    canvas.addEventListener('webglcontextrestored', onRestored);\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      resize();\r
      wake();\r
    });\r
    resizeObserver.observe(container);\r
\r
    const intersection = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      wake();\r
    });\r
    intersection.observe(container);\r
\r
    const onVisibility = () => {\r
      pageVisible = document.visibilityState !== 'hidden';\r
      wake();\r
    };\r
    document.addEventListener('visibilitychange', onVisibility);\r
\r
    resize();\r
    wake();\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      canvas.removeEventListener('webglcontextlost', onLost);\r
      canvas.removeEventListener('webglcontextrestored', onRestored);\r
      if (!gl.isContextLost()) {\r
        gl.deleteVertexArray(vao);\r
        gl.deleteProgram(program.program);\r
      }\r
    };\r
  }, [generation]);\r
\r
  return (\r
    <div\r
      ref={containerRef}\r
      className={\`electric-border\${className ? \` \${className}\` : ''}\`}\r
      style={{ borderRadius, ...style }}\r
    >\r
      {children}\r
      <canvas\r
        ref={canvasRef}\r
        className="electric-border__canvas"\r
        style={{ top: -MARGIN, left: -MARGIN }}\r
        aria-hidden="true"\r
      />\r
    </div>\r
  );\r
};\r
\r
export default ElectricBorder;\r
`,n=`.electric-border {\r
  position: relative;\r
  isolation: isolate;\r
}\r
\r
.electric-border__canvas {\r
  position: absolute;\r
  z-index: 1;\r
  display: block;\r
  pointer-events: none;\r
}\r
`,e=`'use client';\r
\r
import { useEffect, useRef, useState } from 'react';\r
\r
const ARCS = 4;\r
const PULSES = 3;\r
const MARGIN = 64;\r
const PIXEL_BUDGET = 3e6;\r
const SURGE_SPEED = 560;\r
const HALF_PI = Math.PI / 2;\r
\r
const VERTEX = \`#version 300 es\r
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));\r
void main() {\r
  gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
\r
uniform vec2 uSize;\r
uniform float uRatio;\r
uniform vec2 uCenter;\r
uniform vec2 uHalf;\r
uniform float uRadius;\r
uniform vec3 uParam;\r
uniform float uPerimeter;\r
uniform vec4 uCells;\r
uniform vec2 uSoft;\r
uniform float uTime;\r
uniform float uPower;\r
uniform float uReveal;\r
uniform vec3 uHover;\r
uniform float uHoverRadius;\r
uniform vec4 uPulses[\${PULSES}];\r
uniform vec3 uCore;\r
uniform vec3 uGlowColor;\r
uniform float uIntensity;\r
uniform float uGlow;\r
uniform float uThickness;\r
uniform float uStrands;\r
uniform float uChaos;\r
uniform float uSpread;\r
uniform float uFlicker;\r
uniform float uInk;\r
uniform vec4 uArcEnds[\${ARCS}];\r
uniform vec4 uArcShape[\${ARCS}];\r
\r
out vec4 fragColor;\r
\r
uint scramble(uint x) {\r
  x ^= x >> 16u;\r
  x *= 0x7feb352du;\r
  x ^= x >> 15u;\r
  x *= 0x846ca68bu;\r
  x ^= x >> 16u;\r
  return x;\r
}\r
\r
vec2 slant(uint x, uint y, uint seed) {\r
  uint h = scramble(x * 0x8da6b343u + y * 0xd8163841u + seed * 0xcb1ab31fu);\r
  return vec2(uvec2(h, h >> 8u) & 255u) / 127.5 - 1.0;\r
}\r
\r
vec2 ring(vec2 p, float period, uint seed) {\r
  vec2 i = floor(p);\r
  vec2 f = p - i;\r
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);\r
  float du = 30.0 * f.x * f.x * (f.x * (f.x - 2.0) + 1.0);\r
  uint x0 = uint(mod(i.x, period));\r
  uint x1 = uint(mod(i.x + 1.0, period));\r
  uint y0 = uint(i.y + 65536.0);\r
  vec2 ga = slant(x0, y0, seed);\r
  vec2 gb = slant(x1, y0, seed);\r
  vec2 gc = slant(x0, y0 + 1u, seed);\r
  vec2 gd = slant(x1, y0 + 1u, seed);\r
  float va = dot(ga, f);\r
  float vb = dot(gb, f - vec2(1.0, 0.0));\r
  float vc = dot(gc, f - vec2(0.0, 1.0));\r
  float vd = dot(gd, f - vec2(1.0, 1.0));\r
  float k = va - vb - vc + vd;\r
  float value = va + u.x * (vb - va) + u.y * (vc - va) + u.x * u.y * k;\r
  float gx = ga.x + u.x * (gb.x - ga.x) + u.y * (gc.x - ga.x) + u.x * u.y * (ga.x - gb.x - gc.x + gd.x);\r
  return vec2(value, gx + du * (vb - va + u.y * k));\r
}\r
\r
float wobble(float x, uint seed) {\r
  return ring(vec2(x, 0.5), 1048576.0, seed).x;\r
}\r
\r
vec2 frameAt(vec2 p) {\r
  vec2 inner = max(uHalf - uRadius, 0.0);\r
  vec2 q = abs(p) - inner;\r
  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - uRadius;\r
  float quarter = uPerimeter * 0.25;\r
  vec2 v = abs(p) - uParam.xy;\r
  float t;\r
  if (v.x > 0.0 && v.y > 0.0) t = uParam.x + uParam.z * atan(v.x, v.y);\r
  else if (v.x > v.y) t = uParam.x + 1.5707963 * uParam.z + uParam.y - abs(p.y);\r
  else t = abs(p.x);\r
  t = clamp(t, 0.0, quarter);\r
  float s = p.x >= 0.0 ? (p.y < 0.0 ? t : 2.0 * quarter - t) : (p.y < 0.0 ? 4.0 * quarter - t : 2.0 * quarter + t);\r
  return vec2(s, d);\r
}\r
\r
vec2 glowShape(float line, float spread, float w) {\r
  float x = abs(line);\r
  float y = abs(spread);\r
  return vec2(exp(-x * x / (w * w * 0.5)) + exp(-y / (w * 2.2)) * 0.6, exp(-y / (w * 4.5)) * 0.5);\r
}\r
\r
void addArc(vec2 p, vec4 ends, vec4 info, float t, inout vec3 light, inout float energy, inout float hot) {\r
  if (info.y < 0.002) return;\r
  vec2 ab = ends.zw - ends.xy;\r
  float len = max(length(ab), 1.0);\r
  vec2 dir = ab / len;\r
  vec2 rel = p - ends.xy;\r
  float along = dot(rel, dir);\r
  float side = dot(rel, vec2(-dir.y, dir.x));\r
  float margin = abs(info.x) + (0.6 + uChaos) * (2.0 + len * 0.08) + uThickness * 12.0 + 10.0;\r
  if (along < -margin || along > len + margin || abs(side) > margin) return;\r
  float u = clamp(along / len, 0.0, 1.0);\r
  float taper = sin(3.14159265 * u);\r
  float settle = smoothstep(0.0, 0.15, u) * smoothstep(1.0, 0.85, u);\r
  float bendSlope = 3.14159265 / len * cos(3.14159265 * u) * settle;\r
  float beyond = max(-along, 0.0) + max(along - len, 0.0);\r
  for (int c = 0; c < 2; c++) {\r
    uint seed = uint(info.z * 131.0) + uint(c) * 29u + 7u;\r
    float jag = 0.0;\r
    float jagSlope = 0.0;\r
    float wave = max(len * 0.3, 14.0);\r
    float weight = (0.6 + uChaos) * (1.5 + len * 0.05) * (c == 0 ? 1.0 : 1.5);\r
    for (int o = 0; o < 3; o++) {\r
      vec2 n = ring(vec2(along / wave + info.z * 3.0, t * (1.4 + float(o) * 1.1)), 1048576.0, seed + uint(o));\r
      jag += n.x * weight;\r
      jagSlope += n.y * weight / wave;\r
      wave *= 0.42;\r
      weight *= 0.4;\r
    }\r
    float offset = (info.x + jag) * taper;\r
    float offsetSlope = (info.x + jag) * bendSlope + jagSlope * taper * settle;\r
    float across = (side - offset) / sqrt(1.0 + offsetSlope * offsetSlope);\r
    float gap = length(vec2(beyond, across));\r
    float w = uThickness * (c == 0 ? 0.9 : 0.6);\r
    vec2 g = glowShape(gap, gap, w);\r
    float k = info.y * (c == 0 ? 1.0 : 0.45);\r
    light += (uCore * g.x + uGlowColor * g.y * uGlow) * k;\r
    energy += (g.x + g.y * uGlow) * k;\r
    hot += exp(-gap * gap / (w * w * 0.16)) * k * (c == 0 ? 1.0 : 0.0);\r
  }\r
}\r
\r
void main() {\r
  vec2 p = vec2(gl_FragCoord.x / uRatio, uSize.y - gl_FragCoord.y / uRatio);\r
  vec2 frame = frameAt(p - uCenter);\r
  float s = frame.x;\r
  float d = frame.y;\r
  float t = uTime;\r
  vec3 light = vec3(0.0);\r
  float energy = 0.0;\r
  float hot = 0.0;\r
\r
  float along = min(s, uPerimeter - s);\r
  float front = uReveal * (uPerimeter * 0.5 + 80.0);\r
  float shown = smoothstep(front, front - 70.0, along) * uPower;\r
  float flare = uReveal < 1.0 ? exp(-pow((along - front + 30.0) / 26.0, 2.0)) * uPower : 0.0;\r
\r
  vec2 toHover = p - uHover.xy;\r
  float heat = uHover.z * exp(-dot(toHover, toHover) / (uHoverRadius * uHoverRadius));\r
  float surge = 0.0;\r
  for (int i = 0; i < \${PULSES}; i++) {\r
    vec4 pulse = uPulses[i];\r
    if (pulse.z <= 0.0) continue;\r
    float gap = abs(s - pulse.x);\r
    gap = min(gap, uPerimeter - gap);\r
    float wave = (gap - pulse.y * \${SURGE_SPEED}.0) / 46.0;\r
    surge += exp(-wave * wave) * pulse.z * exp(-pulse.y * 1.2);\r
  }\r
  heat = min(heat * 0.7 + surge * 0.8 + flare * 0.6, 1.2);\r
  vec2 inset = min(p, uSize - p);\r
  float frameFade = smoothstep(0.0, 14.0, min(inset.x, inset.y));\r
\r
  float edge = abs(d);\r
  float inward = d < 0.0 ? exp(d / 14.0) : 1.0;\r
  float bloom = (exp(-edge / 3.0) * 0.1 + exp(-edge / 16.0) * 0.05 * inward) * uGlow * (1.0 + heat * 0.6) * shown;\r
  light += uGlowColor * bloom;\r
  energy += bloom;\r
\r
  float bendAmp = uSpread * 16.0 * (1.0 + heat * 0.35);\r
  float rippleAmp = uSpread * 6.0 * (1.0 + heat * 0.3);\r
  float crinkleAmp = uChaos * 4.5 * (1.0 + heat * 0.3);\r
  float squeeze = min(1.0, 34.0 / max((bendAmp + rippleAmp) * 1.6 + crinkleAmp, 1e-3));\r
  bendAmp *= squeeze;\r
  rippleAmp *= squeeze;\r
  crinkleAmp *= squeeze;\r
  float reach = (bendAmp * 1.9 + rippleAmp + crinkleAmp * 1.6) * 1.3 + uThickness * 14.0 + 8.0;\r
  if (edge < reach && shown > 0.0) {\r
    float fade = smoothstep(reach, reach * 0.55, edge);\r
    float count = min(uStrands + heat * 1.2, 6.0);\r
    float slopeScale = 1.0 / uPerimeter;\r
    for (int i = 0; i < 6; i++) {\r
      float fi = float(i);\r
      if (fi >= ceil(count)) break;\r
      float present = clamp(count - fi, 0.0, 1.0);\r
      uint seed = uint(i) * 7u + 3u;\r
      float lead = i == 0 ? 1.0 : 0.0;\r
      float range = mix(1.35 + fi * 0.18, 0.7, lead);\r
      float x = s * slopeScale;\r
      vec2 a = ring(vec2(x * uCells.x, t * 0.7 + fi * 3.1), uCells.x, seed);\r
      vec2 b = ring(vec2(x * uCells.y, t * 1.9 + fi * 1.7), uCells.y, seed + 1u);\r
      vec2 c = ring(vec2(x * uCells.z, t * 4.6 + fi * 0.9), uCells.z, seed + 2u);\r
      vec2 e = ring(vec2(x * uCells.w, t * 6.8), uCells.w, seed + 3u);\r
      float offset = (a.x * bendAmp + b.x * rippleAmp) * range + (c.x + e.x * 0.35) * crinkleAmp;\r
      float slope =\r
        ((a.y * uCells.x * bendAmp + b.y * uCells.y * rippleAmp) * range +\r
          (c.y * uCells.z + e.y * 0.35 * uCells.w) * crinkleAmp) *\r
        slopeScale;\r
      float drift = lead > 0.5 ? 0.0 : wobble(fi * 7.3, seed + 9u) * 2.5 * uSpread;\r
      offset += drift;\r
      float across = (d - offset) / sqrt(1.0 + slope * slope);\r
      float spread = d - a.x * bendAmp * range - drift;\r
      float swell = 0.5 + 0.5 * ring(vec2(x * uSoft.y, t * 2.0 + fi * 5.1), uSoft.y, seed + 8u).x;\r
      float w = uThickness * mix(0.55, 1.0, lead) * (0.5 + swell);\r
      float vis = mix(0.3 + 0.45 * smoothstep(-0.25, 0.2, ring(vec2(x * uSoft.x, t * 0.5 + fi * 3.7), uSoft.x, seed + 5u).x), 1.0, lead);\r
      float spark = 1.0 - uFlicker * 0.3 * (0.5 + 0.5 * wobble(t * 13.0 + fi * 2.3, seed + 6u));\r
      float weight = max(vis, heat * 0.6) * spark * fade * present * (0.7 + 0.6 * swell);\r
      vec2 g = glowShape(across, spread, w) * weight;\r
      g.y *= inward;\r
      float haze = uGlow * (1.0 + heat * 0.5) * (1.0 - uInk * 0.7);\r
      light += uCore * g.x + uGlowColor * g.y * haze;\r
      energy += g.x + g.y * haze;\r
      hot += exp(-across * across / (w * w * 0.16)) * lead * weight;\r
    }\r
    light *= shown;\r
    energy *= shown;\r
    hot *= shown;\r
  }\r
\r
  for (int i = 0; i < \${ARCS}; i++) addArc(p, uArcEnds[i], uArcShape[i], t, light, energy, hot);\r
\r
  float breath = 1.0 + uFlicker * 0.5 * wobble(t * 4.6 + 7.0, 3u);\r
  float gain = uIntensity * breath * (1.0 + heat * 0.25) * 1.4;\r
  light *= frameFade;\r
  energy *= frameFade;\r
  hot *= frameFade;\r
  float alpha = 1.0 - exp(-energy * gain);\r
  vec3 color = mix(1.0 - exp(-light * gain), alpha * light / max(energy, 1e-4), uInk);\r
  color = mix(color, vec3(alpha), clamp(hot, 0.0, 1.0) * uInk * 0.85);\r
  float grain = (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;\r
  alpha = clamp(alpha + grain, 0.0, 1.0);\r
  fragColor = vec4(clamp(color + grain, 0.0, alpha), alpha);\r
}\`;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const parseColor = value => {\r
  const text = String(value || '').trim();\r
  const hex = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text);\r
  if (hex) {\r
    const full = hex[1].length === 3 ? hex[1].replace(/./g, digit => digit + digit) : hex[1];\r
    return [0, 2, 4].map(index => parseInt(full.slice(index, index + 2), 16) / 255);\r
  }\r
  const rgb = /^rgba?\\(\\s*([\\d.]+)[\\s,]+([\\d.]+)[\\s,]+([\\d.]+)/i.exec(text);\r
  if (rgb) return [rgb[1], rgb[2], rgb[3]].map(channel => clamp(parseFloat(channel) / 255, 0, 1));\r
  if (typeof document !== 'undefined') {\r
    const context = document.createElement('canvas').getContext('2d');\r
    if (context) {\r
      context.fillStyle = '#000000';\r
      context.fillStyle = text;\r
      const normal = String(context.fillStyle);\r
      if (normal !== '#000000' || /^(#0{3}|#0{6}|black)$/i.test(text)) return parseColor(normal);\r
    }\r
  }\r
  return [0.49, 0.98, 1];\r
};\r
\r
const compile = (gl, type, source) => {\r
  const shader = gl.createShader(type);\r
  if (!shader) return null;\r
  gl.shaderSource(shader, source);\r
  gl.compileShader(shader);\r
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {\r
    console.error(gl.getShaderInfoLog(shader));\r
    gl.deleteShader(shader);\r
    return null;\r
  }\r
  return shader;\r
};\r
\r
const link = gl => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
  const program = vertex && fragment ? gl.createProgram() : null;\r
  if (!vertex || !fragment || !program) {\r
    if (vertex) gl.deleteShader(vertex);\r
    if (fragment) gl.deleteShader(fragment);\r
    return null;\r
  }\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
  gl.linkProgram(program);\r
  gl.deleteShader(vertex);\r
  gl.deleteShader(fragment);\r
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {\r
    console.error(gl.getProgramInfoLog(program));\r
    gl.deleteProgram(program);\r
    return null;\r
  }\r
  const uniforms = {};\r
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
  for (let index = 0; index < count; index++) {\r
    const info = gl.getActiveUniform(program, index);\r
    if (info) uniforms[info.name.replace(/\\[0\\]$/, '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const roundBox = (x, y, hx, hy, r) => {\r
  const qx = Math.abs(x) - (hx - r);\r
  const qy = Math.abs(y) - (hy - r);\r
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;\r
};\r
\r
const pathOf = (width, height, radius, offset) => {\r
  const hx = Math.max(1, width / 2 + offset);\r
  const hy = Math.max(1, height / 2 + offset);\r
  const r = clamp(radius + offset, 0, Math.min(hx, hy));\r
  const vr = Math.min(r + 48, Math.min(hx, hy));\r
  const ax = hx - vr;\r
  const ay = hy - vr;\r
  const quarter = ax + ay + HALF_PI * vr;\r
  return { hx, hy, r, vr, ax, ay, quarter, perimeter: quarter * 4 };\r
};\r
\r
const pointOn = (path, s) => {\r
  const { hx, hy, r, vr, ax, ay, quarter, perimeter } = path;\r
  const u = ((s % perimeter) + perimeter) % perimeter;\r
  const part = Math.min(3, Math.floor(u / quarter));\r
  const rest = u - part * quarter;\r
  const local = part % 2 ? quarter - rest : rest;\r
  let x;\r
  let y;\r
  if (local <= ax) {\r
    x = local;\r
    y = -hy;\r
  } else if (local <= ax + HALF_PI * vr) {\r
    const angle = vr > 0 ? (local - ax) / vr : 0;\r
    const dx = Math.sin(angle);\r
    const dy = -Math.cos(angle);\r
    let low = 0;\r
    let high = vr + r + 2;\r
    for (let step = 0; step < 18; step++) {\r
      const mid = (low + high) / 2;\r
      if (roundBox(ax + dx * mid, -ay + dy * mid, hx, hy, r) < 0) low = mid;\r
      else high = mid;\r
    }\r
    x = ax + dx * low;\r
    y = -ay + dy * low;\r
  } else {\r
    x = hx;\r
    y = -ay + (local - ax - HALF_PI * vr);\r
  }\r
  const flipX = part >= 2 ? -1 : 1;\r
  const flipY = part === 1 || part === 2 ? -1 : 1;\r
  const px = x * flipX;\r
  const py = y * flipY;\r
  const nx = roundBox(px + 0.5, py, hx, hy, r) - roundBox(px - 0.5, py, hx, hy, r);\r
  const ny = roundBox(px, py + 0.5, hx, hy, r) - roundBox(px, py - 0.5, hx, hy, r);\r
  const length = Math.hypot(nx, ny) || 1;\r
  return { x: px, y: py, nx: nx / length, ny: ny / length };\r
};\r
\r
const nearestOn = (path, x, y) => {\r
  const { ax, ay, vr, quarter } = path;\r
  const qx = Math.abs(x) - ax;\r
  const qy = Math.abs(y) - ay;\r
  let t;\r
  if (qx > 0 && qy > 0) t = ax + vr * Math.atan2(qx, qy);\r
  else if (qx > qy) t = ax + HALF_PI * vr + ay - Math.abs(y);\r
  else t = Math.abs(x);\r
  t = clamp(t, 0, quarter);\r
  if (x >= 0) return y < 0 ? t : 2 * quarter - t;\r
  return y < 0 ? 4 * quarter - t : 2 * quarter + t;\r
};\r
\r
const ElectricBorder = ({\r
  children,\r
  color = '#7df9ff',\r
  glowColor,\r
  speed = 1,\r
  chaos = 0.5,\r
  spread = 0.6,\r
  thickness = 1.5,\r
  strands = 3,\r
  glow = 0.6,\r
  intensity = 0.8,\r
  arcs = 1,\r
  flicker = 0.5,\r
  borderRadius = 24,\r
  offset = 0,\r
  active = true,\r
  intro = true,\r
  interactive = true,\r
  cursorRadius = 90,\r
  theme = 'dark',\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const [generation, setGeneration] = useState(0);\r
\r
  const base = parseColor(color);\r
  const settings = {\r
    core: base.map(channel => channel + (1 - channel) * 0.55),\r
    glowColor: glowColor ? parseColor(glowColor) : base,\r
    speed: Math.max(0, speed),\r
    chaos: clamp(chaos, 0, 2),\r
    spread: clamp(spread, 0, 2),\r
    thickness: Math.max(0.25, thickness),\r
    strands: clamp(Math.round(strands), 1, 6),\r
    glow: clamp(glow, 0, 3),\r
    intensity: Math.max(0, intensity),\r
    arcs: Math.max(0, arcs),\r
    flicker: clamp(flicker, 0, 1),\r
    borderRadius: Math.max(0, borderRadius),\r
    offset,\r
    active,\r
    intro,\r
    interactive,\r
    cursorRadius: Math.max(1, cursorRadius),\r
    light: theme === 'light'\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    if (!container || !canvas) return;\r
\r
    const gl = canvas.getContext('webgl2', {\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false,\r
      powerPreference: 'default'\r
    });\r
    const program = gl ? link(gl) : null;\r
    if (!gl || !program) return;\r
\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
    const vao = gl.createVertexArray();\r
    const arcEnds = new Float32Array(ARCS * 4);\r
    const arcShape = new Float32Array(ARCS * 4);\r
    const pulseData = new Float32Array(PULSES * 4);\r
    const size = { width: 1, height: 1, ratio: 1 };\r
    const pointer = { x: 0, y: 0, over: false, near: false };\r
    const hover = { x: 0, y: 0, vx: 0, vy: 0, power: 0 };\r
    const sparks = [];\r
    const pulses = [];\r
    const first = settingsRef.current;\r
    let power = first.active && !(first.intro && !reduced && generation === 0) ? 1 : 0;\r
    let reveal = power;\r
    let wasActive = first.active;\r
    let ink = first.light ? 1 : 0;\r
    let path = pathOf(1, 1, 0, 0);\r
    let time = Math.random() * 100;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let pageVisible = document.visibilityState !== 'hidden';\r
    let lost = false;\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const width = Math.max(1, container.offsetWidth);\r
      const height = Math.max(1, container.offsetHeight);\r
      const canvasWidth = width + MARGIN * 2;\r
      const canvasHeight = height + MARGIN * 2;\r
      const ratio = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(PIXEL_BUDGET / (canvasWidth * canvasHeight)));\r
      const pixelWidth = Math.max(1, Math.round(canvasWidth * ratio));\r
      const pixelHeight = Math.max(1, Math.round(canvasHeight * ratio));\r
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {\r
        canvas.width = pixelWidth;\r
        canvas.height = pixelHeight;\r
      }\r
      canvas.style.width = \`\${canvasWidth}px\`;\r
      canvas.style.height = \`\${canvasHeight}px\`;\r
      Object.assign(size, { width, height, ratio: pixelWidth / canvasWidth });\r
      path = pathOf(width, height, s.borderRadius, s.offset);\r
    };\r
\r
    const spawnArc = (now, near) => {\r
      const span = Math.min(path.perimeter * 0.3, 60 + Math.random() * 90);\r
      const start = near ?? Math.random() * path.perimeter;\r
      const from = start - span * (0.2 + Math.random() * 0.6);\r
      const to = from + span;\r
      const a = pointOn(path, from);\r
      const b = pointOn(path, to);\r
      const mid = pointOn(path, (from + to) / 2);\r
      const dx = b.x - a.x;\r
      const dy = b.y - a.y;\r
      const length = Math.hypot(dx, dy) || 1;\r
      const side = (-dy / length) * mid.nx + (dx / length) * mid.ny;\r
      const bow = Math.min(MARGIN - 30, length * (0.14 + Math.random() * 0.16) + 5);\r
      return {\r
        ax: a.x,\r
        ay: a.y,\r
        bx: b.x,\r
        by: b.y,\r
        bow: side >= 0 ? bow : -bow,\r
        seed: 1 + Math.random() * 60,\r
        born: now,\r
        life: 0.35 + Math.random() * 0.45\r
      };\r
    };\r
\r
    const render = (s, heatPower) => {\r
      const u = program.uniforms;\r
      const width = size.width + MARGIN * 2;\r
      const height = size.height + MARGIN * 2;\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      if (power <= 0.001 && !sparks.length) return;\r
      gl.useProgram(program.program);\r
      gl.uniform2f(u.uSize, width, height);\r
      gl.uniform1f(u.uRatio, size.ratio);\r
      gl.uniform2f(u.uCenter, width / 2, height / 2);\r
      gl.uniform2f(u.uHalf, path.hx, path.hy);\r
      gl.uniform1f(u.uRadius, path.r);\r
      gl.uniform3f(u.uParam, path.ax, path.ay, path.vr);\r
      gl.uniform1f(u.uPerimeter, path.perimeter);\r
      gl.uniform4f(\r
        u.uCells,\r
        Math.max(1, Math.round(path.perimeter / 75)),\r
        Math.max(2, Math.round(path.perimeter / 25)),\r
        Math.max(3, Math.round(path.perimeter / 9)),\r
        Math.max(4, Math.round(path.perimeter / 4))\r
      );\r
      gl.uniform2f(\r
        u.uSoft,\r
        Math.max(1, Math.round(path.perimeter / 150)),\r
        Math.max(1, Math.round(path.perimeter / 50))\r
      );\r
      gl.uniform1f(u.uTime, time);\r
      gl.uniform1f(u.uPower, power * power * (3 - 2 * power));\r
      gl.uniform1f(u.uReveal, reveal);\r
      gl.uniform3f(u.uHover, hover.x + MARGIN, hover.y + MARGIN, heatPower);\r
      gl.uniform1f(u.uHoverRadius, s.cursorRadius);\r
      gl.uniform4fv(u.uPulses, pulseData);\r
      gl.uniform3fv(u.uCore, s.core);\r
      gl.uniform3fv(u.uGlowColor, s.glowColor);\r
      gl.uniform1f(u.uIntensity, s.intensity);\r
      gl.uniform1f(u.uGlow, s.glow);\r
      gl.uniform1f(u.uThickness, s.thickness);\r
      gl.uniform1f(u.uStrands, s.strands);\r
      gl.uniform1f(u.uChaos, s.chaos);\r
      gl.uniform1f(u.uSpread, s.spread);\r
      gl.uniform1f(u.uFlicker, reduced ? 0 : s.flicker);\r
      gl.uniform1f(u.uInk, ink);\r
      gl.uniform4fv(u.uArcEnds, arcEnds);\r
      gl.uniform4fv(u.uArcShape, arcShape);\r
      gl.bindVertexArray(vao);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (lost) return;\r
      const s = settingsRef.current;\r
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05);\r
      last = Math.max(last, now);\r
      const motion = reduced ? 0.2 : 1;\r
      time += dt * s.speed * motion;\r
\r
      if (s.active && !wasActive) reveal = 0;\r
      wasActive = s.active;\r
      power += ((s.active ? 1 : 0) - power) * (1 - Math.exp(-dt / (s.active ? 0.28 : 0.4)));\r
      if (s.active) reveal = reduced ? 1 : Math.min(1, reveal + dt / 0.9);\r
      ink += ((s.light ? 1 : 0) - ink) * (1 - Math.exp(-dt / 0.25));\r
\r
      const engaged = s.interactive && pointer.near && s.active;\r
      if (engaged && hover.power < 0.01) {\r
        hover.x = pointer.x;\r
        hover.y = pointer.y;\r
        hover.vx = 0;\r
        hover.vy = 0;\r
      }\r
      hover.vx += ((pointer.x - hover.x) * 120 - hover.vx * 19) * dt;\r
      hover.vy += ((pointer.y - hover.y) * 120 - hover.vy * 19) * dt;\r
      hover.x += hover.vx * dt;\r
      hover.y += hover.vy * dt;\r
      hover.power += ((engaged ? 1 : 0) - hover.power) * (1 - Math.exp(-dt / (engaged ? 0.3 : 0.55)));\r
\r
      for (let index = sparks.length - 1; index >= 0; index--) {\r
        if (time - sparks[index].born > sparks[index].life) sparks.splice(index, 1);\r
      }\r
      if (!reduced && s.active && reveal >= 1 && s.arcs > 0 && sparks.length < ARCS) {\r
        const chance = dt * s.speed * s.arcs;\r
        if (Math.random() < chance * 5 * hover.power) {\r
          sparks.push(spawnArc(time, nearestOn(path, hover.x - size.width / 2, hover.y - size.height / 2)));\r
        } else if (Math.random() < chance * (0.6 + path.perimeter / 2400)) {\r
          sparks.push(spawnArc(time, null));\r
        }\r
      }\r
      const fit = power * power * (3 - 2 * power);\r
      for (let index = 0; index < ARCS; index++) {\r
        const o = index * 4;\r
        const spark = sparks[index];\r
        if (!spark) {\r
          arcShape[o + 1] = 0;\r
          continue;\r
        }\r
        const k = clamp((time - spark.born) / spark.life, 0, 1);\r
        arcEnds[o] = spark.ax + size.width / 2 + MARGIN;\r
        arcEnds[o + 1] = spark.ay + size.height / 2 + MARGIN;\r
        arcEnds[o + 2] = spark.bx + size.width / 2 + MARGIN;\r
        arcEnds[o + 3] = spark.by + size.height / 2 + MARGIN;\r
        arcShape[o] = spark.bow;\r
        arcShape[o + 1] = Math.sin(Math.PI * k) * fit;\r
        arcShape[o + 2] = spark.seed;\r
      }\r
\r
      for (let index = pulses.length - 1; index >= 0; index--) {\r
        if (now - pulses[index].born > 2200) pulses.splice(index, 1);\r
      }\r
      for (let index = 0; index < PULSES; index++) {\r
        const o = index * 4;\r
        const pulse = pulses[index];\r
        if (!pulse) {\r
          pulseData[o + 2] = 0;\r
          continue;\r
        }\r
        pulseData[o] = pulse.s;\r
        pulseData[o + 1] = (now - pulse.born) / 1000;\r
        pulseData[o + 2] = 1;\r
      }\r
\r
      render(s, hover.power * (s.interactive ? 1 : 0));\r
\r
      const busy = power > 0.002 || s.active || sparks.length > 0;\r
      if (busy && visible && pageVisible) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (raf || lost || !visible || !pageVisible) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
    wakeRef.current = () => {\r
      resize();\r
      wake();\r
    };\r
\r
    const locate = event => {\r
      const rect = container.getBoundingClientRect();\r
      pointer.x = event.clientX - rect.left;\r
      pointer.y = event.clientY - rect.top;\r
      pointer.over = pointer.x >= 0 && pointer.y >= 0 && pointer.x <= rect.width && pointer.y <= rect.height;\r
      pointer.near =\r
        pointer.x >= -MARGIN / 2 &&\r
        pointer.y >= -MARGIN / 2 &&\r
        pointer.x <= rect.width + MARGIN / 2 &&\r
        pointer.y <= rect.height + MARGIN / 2;\r
    };\r
\r
    const onPointerMove = event => {\r
      locate(event);\r
      if (pointer.near) wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      locate(event);\r
      const s = settingsRef.current;\r
      if (!pointer.over || !s.interactive || !s.active || reduced) return;\r
      const along = nearestOn(path, pointer.x - size.width / 2, pointer.y - size.height / 2);\r
      pulses.push({ s: along, born: performance.now() });\r
      if (pulses.length > PULSES) pulses.shift();\r
      if (sparks.length < ARCS) sparks.push(spawnArc(time, along));\r
      wake();\r
    };\r
\r
    const onLeave = () => {\r
      pointer.over = false;\r
      pointer.near = false;\r
    };\r
\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onLeave);\r
\r
    const onLost = event => {\r
      event.preventDefault();\r
      lost = true;\r
      cancelAnimationFrame(raf);\r
      raf = 0;\r
    };\r
    const onRestored = () => setGeneration(value => value + 1);\r
    canvas.addEventListener('webglcontextlost', onLost);\r
    canvas.addEventListener('webglcontextrestored', onRestored);\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      resize();\r
      wake();\r
    });\r
    resizeObserver.observe(container);\r
\r
    const intersection = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      wake();\r
    });\r
    intersection.observe(container);\r
\r
    const onVisibility = () => {\r
      pageVisible = document.visibilityState !== 'hidden';\r
      wake();\r
    };\r
    document.addEventListener('visibilitychange', onVisibility);\r
\r
    resize();\r
    wake();\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      canvas.removeEventListener('webglcontextlost', onLost);\r
      canvas.removeEventListener('webglcontextrestored', onRestored);\r
      if (!gl.isContextLost()) {\r
        gl.deleteVertexArray(vao);\r
        gl.deleteProgram(program.program);\r
      }\r
    };\r
  }, [generation]);\r
\r
  return (\r
    <div ref={containerRef} className={\`relative isolate \${className}\`.trim()} style={{ borderRadius, ...style }}>\r
      {children}\r
      <canvas\r
        ref={canvasRef}\r
        className="pointer-events-none absolute z-[1] block"\r
        style={{ top: -MARGIN, left: -MARGIN }}\r
        aria-hidden="true"\r
      />\r
    </div>\r
  );\r
};\r
\r
export default ElectricBorder;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';\r
import './ElectricBorder.css';\r
\r
export interface ElectricBorderProps {\r
  children?: ReactNode;\r
  color?: string;\r
  glowColor?: string;\r
  speed?: number;\r
  chaos?: number;\r
  spread?: number;\r
  thickness?: number;\r
  strands?: number;\r
  glow?: number;\r
  intensity?: number;\r
  arcs?: number;\r
  flicker?: number;\r
  borderRadius?: number;\r
  offset?: number;\r
  active?: boolean;\r
  intro?: boolean;\r
  interactive?: boolean;\r
  cursorRadius?: number;\r
  theme?: 'dark' | 'light';\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Settings {\r
  core: number[];\r
  glowColor: number[];\r
  speed: number;\r
  chaos: number;\r
  spread: number;\r
  thickness: number;\r
  strands: number;\r
  glow: number;\r
  intensity: number;\r
  arcs: number;\r
  flicker: number;\r
  borderRadius: number;\r
  offset: number;\r
  active: boolean;\r
  intro: boolean;\r
  interactive: boolean;\r
  cursorRadius: number;\r
  light: boolean;\r
}\r
\r
interface Program {\r
  program: WebGLProgram;\r
  uniforms: Record<string, WebGLUniformLocation | null>;\r
}\r
\r
interface BorderPath {\r
  hx: number;\r
  hy: number;\r
  r: number;\r
  vr: number;\r
  ax: number;\r
  ay: number;\r
  quarter: number;\r
  perimeter: number;\r
}\r
\r
interface Spark {\r
  ax: number;\r
  ay: number;\r
  bx: number;\r
  by: number;\r
  bow: number;\r
  seed: number;\r
  born: number;\r
  life: number;\r
}\r
\r
interface Pulse {\r
  s: number;\r
  born: number;\r
}\r
\r
const ARCS = 4;\r
const PULSES = 3;\r
const MARGIN = 64;\r
const PIXEL_BUDGET = 3e6;\r
const SURGE_SPEED = 560;\r
const HALF_PI = Math.PI / 2;\r
\r
const VERTEX = \`#version 300 es\r
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));\r
void main() {\r
  gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
\r
uniform vec2 uSize;\r
uniform float uRatio;\r
uniform vec2 uCenter;\r
uniform vec2 uHalf;\r
uniform float uRadius;\r
uniform vec3 uParam;\r
uniform float uPerimeter;\r
uniform vec4 uCells;\r
uniform vec2 uSoft;\r
uniform float uTime;\r
uniform float uPower;\r
uniform float uReveal;\r
uniform vec3 uHover;\r
uniform float uHoverRadius;\r
uniform vec4 uPulses[\${PULSES}];\r
uniform vec3 uCore;\r
uniform vec3 uGlowColor;\r
uniform float uIntensity;\r
uniform float uGlow;\r
uniform float uThickness;\r
uniform float uStrands;\r
uniform float uChaos;\r
uniform float uSpread;\r
uniform float uFlicker;\r
uniform float uInk;\r
uniform vec4 uArcEnds[\${ARCS}];\r
uniform vec4 uArcShape[\${ARCS}];\r
\r
out vec4 fragColor;\r
\r
uint scramble(uint x) {\r
  x ^= x >> 16u;\r
  x *= 0x7feb352du;\r
  x ^= x >> 15u;\r
  x *= 0x846ca68bu;\r
  x ^= x >> 16u;\r
  return x;\r
}\r
\r
vec2 slant(uint x, uint y, uint seed) {\r
  uint h = scramble(x * 0x8da6b343u + y * 0xd8163841u + seed * 0xcb1ab31fu);\r
  return vec2(uvec2(h, h >> 8u) & 255u) / 127.5 - 1.0;\r
}\r
\r
vec2 ring(vec2 p, float period, uint seed) {\r
  vec2 i = floor(p);\r
  vec2 f = p - i;\r
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);\r
  float du = 30.0 * f.x * f.x * (f.x * (f.x - 2.0) + 1.0);\r
  uint x0 = uint(mod(i.x, period));\r
  uint x1 = uint(mod(i.x + 1.0, period));\r
  uint y0 = uint(i.y + 65536.0);\r
  vec2 ga = slant(x0, y0, seed);\r
  vec2 gb = slant(x1, y0, seed);\r
  vec2 gc = slant(x0, y0 + 1u, seed);\r
  vec2 gd = slant(x1, y0 + 1u, seed);\r
  float va = dot(ga, f);\r
  float vb = dot(gb, f - vec2(1.0, 0.0));\r
  float vc = dot(gc, f - vec2(0.0, 1.0));\r
  float vd = dot(gd, f - vec2(1.0, 1.0));\r
  float k = va - vb - vc + vd;\r
  float value = va + u.x * (vb - va) + u.y * (vc - va) + u.x * u.y * k;\r
  float gx = ga.x + u.x * (gb.x - ga.x) + u.y * (gc.x - ga.x) + u.x * u.y * (ga.x - gb.x - gc.x + gd.x);\r
  return vec2(value, gx + du * (vb - va + u.y * k));\r
}\r
\r
float wobble(float x, uint seed) {\r
  return ring(vec2(x, 0.5), 1048576.0, seed).x;\r
}\r
\r
vec2 frameAt(vec2 p) {\r
  vec2 inner = max(uHalf - uRadius, 0.0);\r
  vec2 q = abs(p) - inner;\r
  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - uRadius;\r
  float quarter = uPerimeter * 0.25;\r
  vec2 v = abs(p) - uParam.xy;\r
  float t;\r
  if (v.x > 0.0 && v.y > 0.0) t = uParam.x + uParam.z * atan(v.x, v.y);\r
  else if (v.x > v.y) t = uParam.x + 1.5707963 * uParam.z + uParam.y - abs(p.y);\r
  else t = abs(p.x);\r
  t = clamp(t, 0.0, quarter);\r
  float s = p.x >= 0.0 ? (p.y < 0.0 ? t : 2.0 * quarter - t) : (p.y < 0.0 ? 4.0 * quarter - t : 2.0 * quarter + t);\r
  return vec2(s, d);\r
}\r
\r
vec2 glowShape(float line, float spread, float w) {\r
  float x = abs(line);\r
  float y = abs(spread);\r
  return vec2(exp(-x * x / (w * w * 0.5)) + exp(-y / (w * 2.2)) * 0.6, exp(-y / (w * 4.5)) * 0.5);\r
}\r
\r
void addArc(vec2 p, vec4 ends, vec4 info, float t, inout vec3 light, inout float energy, inout float hot) {\r
  if (info.y < 0.002) return;\r
  vec2 ab = ends.zw - ends.xy;\r
  float len = max(length(ab), 1.0);\r
  vec2 dir = ab / len;\r
  vec2 rel = p - ends.xy;\r
  float along = dot(rel, dir);\r
  float side = dot(rel, vec2(-dir.y, dir.x));\r
  float margin = abs(info.x) + (0.6 + uChaos) * (2.0 + len * 0.08) + uThickness * 12.0 + 10.0;\r
  if (along < -margin || along > len + margin || abs(side) > margin) return;\r
  float u = clamp(along / len, 0.0, 1.0);\r
  float taper = sin(3.14159265 * u);\r
  float settle = smoothstep(0.0, 0.15, u) * smoothstep(1.0, 0.85, u);\r
  float bendSlope = 3.14159265 / len * cos(3.14159265 * u) * settle;\r
  float beyond = max(-along, 0.0) + max(along - len, 0.0);\r
  for (int c = 0; c < 2; c++) {\r
    uint seed = uint(info.z * 131.0) + uint(c) * 29u + 7u;\r
    float jag = 0.0;\r
    float jagSlope = 0.0;\r
    float wave = max(len * 0.3, 14.0);\r
    float weight = (0.6 + uChaos) * (1.5 + len * 0.05) * (c == 0 ? 1.0 : 1.5);\r
    for (int o = 0; o < 3; o++) {\r
      vec2 n = ring(vec2(along / wave + info.z * 3.0, t * (1.4 + float(o) * 1.1)), 1048576.0, seed + uint(o));\r
      jag += n.x * weight;\r
      jagSlope += n.y * weight / wave;\r
      wave *= 0.42;\r
      weight *= 0.4;\r
    }\r
    float offset = (info.x + jag) * taper;\r
    float offsetSlope = (info.x + jag) * bendSlope + jagSlope * taper * settle;\r
    float across = (side - offset) / sqrt(1.0 + offsetSlope * offsetSlope);\r
    float gap = length(vec2(beyond, across));\r
    float w = uThickness * (c == 0 ? 0.9 : 0.6);\r
    vec2 g = glowShape(gap, gap, w);\r
    float k = info.y * (c == 0 ? 1.0 : 0.45);\r
    light += (uCore * g.x + uGlowColor * g.y * uGlow) * k;\r
    energy += (g.x + g.y * uGlow) * k;\r
    hot += exp(-gap * gap / (w * w * 0.16)) * k * (c == 0 ? 1.0 : 0.0);\r
  }\r
}\r
\r
void main() {\r
  vec2 p = vec2(gl_FragCoord.x / uRatio, uSize.y - gl_FragCoord.y / uRatio);\r
  vec2 frame = frameAt(p - uCenter);\r
  float s = frame.x;\r
  float d = frame.y;\r
  float t = uTime;\r
  vec3 light = vec3(0.0);\r
  float energy = 0.0;\r
  float hot = 0.0;\r
\r
  float along = min(s, uPerimeter - s);\r
  float front = uReveal * (uPerimeter * 0.5 + 80.0);\r
  float shown = smoothstep(front, front - 70.0, along) * uPower;\r
  float flare = uReveal < 1.0 ? exp(-pow((along - front + 30.0) / 26.0, 2.0)) * uPower : 0.0;\r
\r
  vec2 toHover = p - uHover.xy;\r
  float heat = uHover.z * exp(-dot(toHover, toHover) / (uHoverRadius * uHoverRadius));\r
  float surge = 0.0;\r
  for (int i = 0; i < \${PULSES}; i++) {\r
    vec4 pulse = uPulses[i];\r
    if (pulse.z <= 0.0) continue;\r
    float gap = abs(s - pulse.x);\r
    gap = min(gap, uPerimeter - gap);\r
    float wave = (gap - pulse.y * \${SURGE_SPEED}.0) / 46.0;\r
    surge += exp(-wave * wave) * pulse.z * exp(-pulse.y * 1.2);\r
  }\r
  heat = min(heat * 0.7 + surge * 0.8 + flare * 0.6, 1.2);\r
  vec2 inset = min(p, uSize - p);\r
  float frameFade = smoothstep(0.0, 14.0, min(inset.x, inset.y));\r
\r
  float edge = abs(d);\r
  float inward = d < 0.0 ? exp(d / 14.0) : 1.0;\r
  float bloom = (exp(-edge / 3.0) * 0.1 + exp(-edge / 16.0) * 0.05 * inward) * uGlow * (1.0 + heat * 0.6) * shown;\r
  light += uGlowColor * bloom;\r
  energy += bloom;\r
\r
  float bendAmp = uSpread * 16.0 * (1.0 + heat * 0.35);\r
  float rippleAmp = uSpread * 6.0 * (1.0 + heat * 0.3);\r
  float crinkleAmp = uChaos * 4.5 * (1.0 + heat * 0.3);\r
  float squeeze = min(1.0, 34.0 / max((bendAmp + rippleAmp) * 1.6 + crinkleAmp, 1e-3));\r
  bendAmp *= squeeze;\r
  rippleAmp *= squeeze;\r
  crinkleAmp *= squeeze;\r
  float reach = (bendAmp * 1.9 + rippleAmp + crinkleAmp * 1.6) * 1.3 + uThickness * 14.0 + 8.0;\r
  if (edge < reach && shown > 0.0) {\r
    float fade = smoothstep(reach, reach * 0.55, edge);\r
    float count = min(uStrands + heat * 1.2, 6.0);\r
    float slopeScale = 1.0 / uPerimeter;\r
    for (int i = 0; i < 6; i++) {\r
      float fi = float(i);\r
      if (fi >= ceil(count)) break;\r
      float present = clamp(count - fi, 0.0, 1.0);\r
      uint seed = uint(i) * 7u + 3u;\r
      float lead = i == 0 ? 1.0 : 0.0;\r
      float range = mix(1.35 + fi * 0.18, 0.7, lead);\r
      float x = s * slopeScale;\r
      vec2 a = ring(vec2(x * uCells.x, t * 0.7 + fi * 3.1), uCells.x, seed);\r
      vec2 b = ring(vec2(x * uCells.y, t * 1.9 + fi * 1.7), uCells.y, seed + 1u);\r
      vec2 c = ring(vec2(x * uCells.z, t * 4.6 + fi * 0.9), uCells.z, seed + 2u);\r
      vec2 e = ring(vec2(x * uCells.w, t * 6.8), uCells.w, seed + 3u);\r
      float offset = (a.x * bendAmp + b.x * rippleAmp) * range + (c.x + e.x * 0.35) * crinkleAmp;\r
      float slope =\r
        ((a.y * uCells.x * bendAmp + b.y * uCells.y * rippleAmp) * range +\r
          (c.y * uCells.z + e.y * 0.35 * uCells.w) * crinkleAmp) *\r
        slopeScale;\r
      float drift = lead > 0.5 ? 0.0 : wobble(fi * 7.3, seed + 9u) * 2.5 * uSpread;\r
      offset += drift;\r
      float across = (d - offset) / sqrt(1.0 + slope * slope);\r
      float spread = d - a.x * bendAmp * range - drift;\r
      float swell = 0.5 + 0.5 * ring(vec2(x * uSoft.y, t * 2.0 + fi * 5.1), uSoft.y, seed + 8u).x;\r
      float w = uThickness * mix(0.55, 1.0, lead) * (0.5 + swell);\r
      float vis = mix(0.3 + 0.45 * smoothstep(-0.25, 0.2, ring(vec2(x * uSoft.x, t * 0.5 + fi * 3.7), uSoft.x, seed + 5u).x), 1.0, lead);\r
      float spark = 1.0 - uFlicker * 0.3 * (0.5 + 0.5 * wobble(t * 13.0 + fi * 2.3, seed + 6u));\r
      float weight = max(vis, heat * 0.6) * spark * fade * present * (0.7 + 0.6 * swell);\r
      vec2 g = glowShape(across, spread, w) * weight;\r
      g.y *= inward;\r
      float haze = uGlow * (1.0 + heat * 0.5) * (1.0 - uInk * 0.7);\r
      light += uCore * g.x + uGlowColor * g.y * haze;\r
      energy += g.x + g.y * haze;\r
      hot += exp(-across * across / (w * w * 0.16)) * lead * weight;\r
    }\r
    light *= shown;\r
    energy *= shown;\r
    hot *= shown;\r
  }\r
\r
  for (int i = 0; i < \${ARCS}; i++) addArc(p, uArcEnds[i], uArcShape[i], t, light, energy, hot);\r
\r
  float breath = 1.0 + uFlicker * 0.5 * wobble(t * 4.6 + 7.0, 3u);\r
  float gain = uIntensity * breath * (1.0 + heat * 0.25) * 1.4;\r
  light *= frameFade;\r
  energy *= frameFade;\r
  hot *= frameFade;\r
  float alpha = 1.0 - exp(-energy * gain);\r
  vec3 color = mix(1.0 - exp(-light * gain), alpha * light / max(energy, 1e-4), uInk);\r
  color = mix(color, vec3(alpha), clamp(hot, 0.0, 1.0) * uInk * 0.85);\r
  float grain = (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;\r
  alpha = clamp(alpha + grain, 0.0, 1.0);\r
  fragColor = vec4(clamp(color + grain, 0.0, alpha), alpha);\r
}\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const parseColor = (value: string): number[] => {\r
  const text = String(value || '').trim();\r
  const hex = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text);\r
  if (hex) {\r
    const full = hex[1].length === 3 ? hex[1].replace(/./g, digit => digit + digit) : hex[1];\r
    return [0, 2, 4].map(index => parseInt(full.slice(index, index + 2), 16) / 255);\r
  }\r
  const rgb = /^rgba?\\(\\s*([\\d.]+)[\\s,]+([\\d.]+)[\\s,]+([\\d.]+)/i.exec(text);\r
  if (rgb) return [rgb[1], rgb[2], rgb[3]].map(channel => clamp(parseFloat(channel) / 255, 0, 1));\r
  if (typeof document !== 'undefined') {\r
    const context = document.createElement('canvas').getContext('2d');\r
    if (context) {\r
      context.fillStyle = '#000000';\r
      context.fillStyle = text;\r
      const normal = String(context.fillStyle);\r
      if (normal !== '#000000' || /^(#0{3}|#0{6}|black)$/i.test(text)) return parseColor(normal);\r
    }\r
  }\r
  return [0.49, 0.98, 1];\r
};\r
\r
const compile = (gl: WebGL2RenderingContext, type: number, source: string) => {\r
  const shader = gl.createShader(type);\r
  if (!shader) return null;\r
  gl.shaderSource(shader, source);\r
  gl.compileShader(shader);\r
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {\r
    console.error(gl.getShaderInfoLog(shader));\r
    gl.deleteShader(shader);\r
    return null;\r
  }\r
  return shader;\r
};\r
\r
const link = (gl: WebGL2RenderingContext): Program | null => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
  const program = vertex && fragment ? gl.createProgram() : null;\r
  if (!vertex || !fragment || !program) {\r
    if (vertex) gl.deleteShader(vertex);\r
    if (fragment) gl.deleteShader(fragment);\r
    return null;\r
  }\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
  gl.linkProgram(program);\r
  gl.deleteShader(vertex);\r
  gl.deleteShader(fragment);\r
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {\r
    console.error(gl.getProgramInfoLog(program));\r
    gl.deleteProgram(program);\r
    return null;\r
  }\r
  const uniforms: Program['uniforms'] = {};\r
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
  for (let index = 0; index < count; index++) {\r
    const info = gl.getActiveUniform(program, index);\r
    if (info) uniforms[info.name.replace(/\\[0\\]$/, '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const roundBox = (x: number, y: number, hx: number, hy: number, r: number) => {\r
  const qx = Math.abs(x) - (hx - r);\r
  const qy = Math.abs(y) - (hy - r);\r
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;\r
};\r
\r
const pathOf = (width: number, height: number, radius: number, offset: number): BorderPath => {\r
  const hx = Math.max(1, width / 2 + offset);\r
  const hy = Math.max(1, height / 2 + offset);\r
  const r = clamp(radius + offset, 0, Math.min(hx, hy));\r
  const vr = Math.min(r + 48, Math.min(hx, hy));\r
  const ax = hx - vr;\r
  const ay = hy - vr;\r
  const quarter = ax + ay + HALF_PI * vr;\r
  return { hx, hy, r, vr, ax, ay, quarter, perimeter: quarter * 4 };\r
};\r
\r
const pointOn = (path: BorderPath, s: number) => {\r
  const { hx, hy, r, vr, ax, ay, quarter, perimeter } = path;\r
  const u = ((s % perimeter) + perimeter) % perimeter;\r
  const part = Math.min(3, Math.floor(u / quarter));\r
  const rest = u - part * quarter;\r
  const local = part % 2 ? quarter - rest : rest;\r
  let x;\r
  let y;\r
  if (local <= ax) {\r
    x = local;\r
    y = -hy;\r
  } else if (local <= ax + HALF_PI * vr) {\r
    const angle = vr > 0 ? (local - ax) / vr : 0;\r
    const dx = Math.sin(angle);\r
    const dy = -Math.cos(angle);\r
    let low = 0;\r
    let high = vr + r + 2;\r
    for (let step = 0; step < 18; step++) {\r
      const mid = (low + high) / 2;\r
      if (roundBox(ax + dx * mid, -ay + dy * mid, hx, hy, r) < 0) low = mid;\r
      else high = mid;\r
    }\r
    x = ax + dx * low;\r
    y = -ay + dy * low;\r
  } else {\r
    x = hx;\r
    y = -ay + (local - ax - HALF_PI * vr);\r
  }\r
  const flipX = part >= 2 ? -1 : 1;\r
  const flipY = part === 1 || part === 2 ? -1 : 1;\r
  const px = x * flipX;\r
  const py = y * flipY;\r
  const nx = roundBox(px + 0.5, py, hx, hy, r) - roundBox(px - 0.5, py, hx, hy, r);\r
  const ny = roundBox(px, py + 0.5, hx, hy, r) - roundBox(px, py - 0.5, hx, hy, r);\r
  const length = Math.hypot(nx, ny) || 1;\r
  return { x: px, y: py, nx: nx / length, ny: ny / length };\r
};\r
\r
const nearestOn = (path: BorderPath, x: number, y: number) => {\r
  const { ax, ay, vr, quarter } = path;\r
  const qx = Math.abs(x) - ax;\r
  const qy = Math.abs(y) - ay;\r
  let t;\r
  if (qx > 0 && qy > 0) t = ax + vr * Math.atan2(qx, qy);\r
  else if (qx > qy) t = ax + HALF_PI * vr + ay - Math.abs(y);\r
  else t = Math.abs(x);\r
  t = clamp(t, 0, quarter);\r
  if (x >= 0) return y < 0 ? t : 2 * quarter - t;\r
  return y < 0 ? 4 * quarter - t : 2 * quarter + t;\r
};\r
\r
const ElectricBorder = ({\r
  children,\r
  color = '#7df9ff',\r
  glowColor,\r
  speed = 1,\r
  chaos = 0.5,\r
  spread = 0.6,\r
  thickness = 1.5,\r
  strands = 3,\r
  glow = 0.6,\r
  intensity = 0.8,\r
  arcs = 1,\r
  flicker = 0.5,\r
  borderRadius = 24,\r
  offset = 0,\r
  active = true,\r
  intro = true,\r
  interactive = true,\r
  cursorRadius = 90,\r
  theme = 'dark',\r
  className = '',\r
  style\r
}: ElectricBorderProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const [generation, setGeneration] = useState(0);\r
\r
  const base = parseColor(color);\r
  const settings: Settings = {\r
    core: base.map(channel => channel + (1 - channel) * 0.55),\r
    glowColor: glowColor ? parseColor(glowColor) : base,\r
    speed: Math.max(0, speed),\r
    chaos: clamp(chaos, 0, 2),\r
    spread: clamp(spread, 0, 2),\r
    thickness: Math.max(0.25, thickness),\r
    strands: clamp(Math.round(strands), 1, 6),\r
    glow: clamp(glow, 0, 3),\r
    intensity: Math.max(0, intensity),\r
    arcs: Math.max(0, arcs),\r
    flicker: clamp(flicker, 0, 1),\r
    borderRadius: Math.max(0, borderRadius),\r
    offset,\r
    active,\r
    intro,\r
    interactive,\r
    cursorRadius: Math.max(1, cursorRadius),\r
    light: theme === 'light'\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    if (!container || !canvas) return;\r
\r
    const gl = canvas.getContext('webgl2', {\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false,\r
      powerPreference: 'default'\r
    });\r
    const program = gl ? link(gl) : null;\r
    if (!gl || !program) return;\r
\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
    const vao = gl.createVertexArray();\r
    const arcEnds = new Float32Array(ARCS * 4);\r
    const arcShape = new Float32Array(ARCS * 4);\r
    const pulseData = new Float32Array(PULSES * 4);\r
    const size = { width: 1, height: 1, ratio: 1 };\r
    const pointer = { x: 0, y: 0, over: false, near: false };\r
    const hover = { x: 0, y: 0, vx: 0, vy: 0, power: 0 };\r
    const sparks: Spark[] = [];\r
    const pulses: Pulse[] = [];\r
    const first = settingsRef.current;\r
    let power = first.active && !(first.intro && !reduced && generation === 0) ? 1 : 0;\r
    let reveal = power;\r
    let wasActive = first.active;\r
    let ink = first.light ? 1 : 0;\r
    let path = pathOf(1, 1, 0, 0);\r
    let time = Math.random() * 100;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let pageVisible = document.visibilityState !== 'hidden';\r
    let lost = false;\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const width = Math.max(1, container.offsetWidth);\r
      const height = Math.max(1, container.offsetHeight);\r
      const canvasWidth = width + MARGIN * 2;\r
      const canvasHeight = height + MARGIN * 2;\r
      const ratio = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(PIXEL_BUDGET / (canvasWidth * canvasHeight)));\r
      const pixelWidth = Math.max(1, Math.round(canvasWidth * ratio));\r
      const pixelHeight = Math.max(1, Math.round(canvasHeight * ratio));\r
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {\r
        canvas.width = pixelWidth;\r
        canvas.height = pixelHeight;\r
      }\r
      canvas.style.width = \`\${canvasWidth}px\`;\r
      canvas.style.height = \`\${canvasHeight}px\`;\r
      Object.assign(size, { width, height, ratio: pixelWidth / canvasWidth });\r
      path = pathOf(width, height, s.borderRadius, s.offset);\r
    };\r
\r
    const spawnArc = (now: number, near: number | null): Spark => {\r
      const span = Math.min(path.perimeter * 0.3, 60 + Math.random() * 90);\r
      const start = near ?? Math.random() * path.perimeter;\r
      const from = start - span * (0.2 + Math.random() * 0.6);\r
      const to = from + span;\r
      const a = pointOn(path, from);\r
      const b = pointOn(path, to);\r
      const mid = pointOn(path, (from + to) / 2);\r
      const dx = b.x - a.x;\r
      const dy = b.y - a.y;\r
      const length = Math.hypot(dx, dy) || 1;\r
      const side = (-dy / length) * mid.nx + (dx / length) * mid.ny;\r
      const bow = Math.min(MARGIN - 30, length * (0.14 + Math.random() * 0.16) + 5);\r
      return {\r
        ax: a.x,\r
        ay: a.y,\r
        bx: b.x,\r
        by: b.y,\r
        bow: side >= 0 ? bow : -bow,\r
        seed: 1 + Math.random() * 60,\r
        born: now,\r
        life: 0.35 + Math.random() * 0.45\r
      };\r
    };\r
\r
    const render = (s: Settings, heatPower: number) => {\r
      const u = program.uniforms;\r
      const width = size.width + MARGIN * 2;\r
      const height = size.height + MARGIN * 2;\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      if (power <= 0.001 && !sparks.length) return;\r
      gl.useProgram(program.program);\r
      gl.uniform2f(u.uSize, width, height);\r
      gl.uniform1f(u.uRatio, size.ratio);\r
      gl.uniform2f(u.uCenter, width / 2, height / 2);\r
      gl.uniform2f(u.uHalf, path.hx, path.hy);\r
      gl.uniform1f(u.uRadius, path.r);\r
      gl.uniform3f(u.uParam, path.ax, path.ay, path.vr);\r
      gl.uniform1f(u.uPerimeter, path.perimeter);\r
      gl.uniform4f(\r
        u.uCells,\r
        Math.max(1, Math.round(path.perimeter / 75)),\r
        Math.max(2, Math.round(path.perimeter / 25)),\r
        Math.max(3, Math.round(path.perimeter / 9)),\r
        Math.max(4, Math.round(path.perimeter / 4))\r
      );\r
      gl.uniform2f(\r
        u.uSoft,\r
        Math.max(1, Math.round(path.perimeter / 150)),\r
        Math.max(1, Math.round(path.perimeter / 50))\r
      );\r
      gl.uniform1f(u.uTime, time);\r
      gl.uniform1f(u.uPower, power * power * (3 - 2 * power));\r
      gl.uniform1f(u.uReveal, reveal);\r
      gl.uniform3f(u.uHover, hover.x + MARGIN, hover.y + MARGIN, heatPower);\r
      gl.uniform1f(u.uHoverRadius, s.cursorRadius);\r
      gl.uniform4fv(u.uPulses, pulseData);\r
      gl.uniform3fv(u.uCore, s.core);\r
      gl.uniform3fv(u.uGlowColor, s.glowColor);\r
      gl.uniform1f(u.uIntensity, s.intensity);\r
      gl.uniform1f(u.uGlow, s.glow);\r
      gl.uniform1f(u.uThickness, s.thickness);\r
      gl.uniform1f(u.uStrands, s.strands);\r
      gl.uniform1f(u.uChaos, s.chaos);\r
      gl.uniform1f(u.uSpread, s.spread);\r
      gl.uniform1f(u.uFlicker, reduced ? 0 : s.flicker);\r
      gl.uniform1f(u.uInk, ink);\r
      gl.uniform4fv(u.uArcEnds, arcEnds);\r
      gl.uniform4fv(u.uArcShape, arcShape);\r
      gl.bindVertexArray(vao);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (lost) return;\r
      const s = settingsRef.current;\r
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05);\r
      last = Math.max(last, now);\r
      const motion = reduced ? 0.2 : 1;\r
      time += dt * s.speed * motion;\r
\r
      if (s.active && !wasActive) reveal = 0;\r
      wasActive = s.active;\r
      power += ((s.active ? 1 : 0) - power) * (1 - Math.exp(-dt / (s.active ? 0.28 : 0.4)));\r
      if (s.active) reveal = reduced ? 1 : Math.min(1, reveal + dt / 0.9);\r
      ink += ((s.light ? 1 : 0) - ink) * (1 - Math.exp(-dt / 0.25));\r
\r
      const engaged = s.interactive && pointer.near && s.active;\r
      if (engaged && hover.power < 0.01) {\r
        hover.x = pointer.x;\r
        hover.y = pointer.y;\r
        hover.vx = 0;\r
        hover.vy = 0;\r
      }\r
      hover.vx += ((pointer.x - hover.x) * 120 - hover.vx * 19) * dt;\r
      hover.vy += ((pointer.y - hover.y) * 120 - hover.vy * 19) * dt;\r
      hover.x += hover.vx * dt;\r
      hover.y += hover.vy * dt;\r
      hover.power += ((engaged ? 1 : 0) - hover.power) * (1 - Math.exp(-dt / (engaged ? 0.3 : 0.55)));\r
\r
      for (let index = sparks.length - 1; index >= 0; index--) {\r
        if (time - sparks[index].born > sparks[index].life) sparks.splice(index, 1);\r
      }\r
      if (!reduced && s.active && reveal >= 1 && s.arcs > 0 && sparks.length < ARCS) {\r
        const chance = dt * s.speed * s.arcs;\r
        if (Math.random() < chance * 5 * hover.power) {\r
          sparks.push(spawnArc(time, nearestOn(path, hover.x - size.width / 2, hover.y - size.height / 2)));\r
        } else if (Math.random() < chance * (0.6 + path.perimeter / 2400)) {\r
          sparks.push(spawnArc(time, null));\r
        }\r
      }\r
      const fit = power * power * (3 - 2 * power);\r
      for (let index = 0; index < ARCS; index++) {\r
        const o = index * 4;\r
        const spark = sparks[index];\r
        if (!spark) {\r
          arcShape[o + 1] = 0;\r
          continue;\r
        }\r
        const k = clamp((time - spark.born) / spark.life, 0, 1);\r
        arcEnds[o] = spark.ax + size.width / 2 + MARGIN;\r
        arcEnds[o + 1] = spark.ay + size.height / 2 + MARGIN;\r
        arcEnds[o + 2] = spark.bx + size.width / 2 + MARGIN;\r
        arcEnds[o + 3] = spark.by + size.height / 2 + MARGIN;\r
        arcShape[o] = spark.bow;\r
        arcShape[o + 1] = Math.sin(Math.PI * k) * fit;\r
        arcShape[o + 2] = spark.seed;\r
      }\r
\r
      for (let index = pulses.length - 1; index >= 0; index--) {\r
        if (now - pulses[index].born > 2200) pulses.splice(index, 1);\r
      }\r
      for (let index = 0; index < PULSES; index++) {\r
        const o = index * 4;\r
        const pulse = pulses[index];\r
        if (!pulse) {\r
          pulseData[o + 2] = 0;\r
          continue;\r
        }\r
        pulseData[o] = pulse.s;\r
        pulseData[o + 1] = (now - pulse.born) / 1000;\r
        pulseData[o + 2] = 1;\r
      }\r
\r
      render(s, hover.power * (s.interactive ? 1 : 0));\r
\r
      const busy = power > 0.002 || s.active || sparks.length > 0;\r
      if (busy && visible && pageVisible) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (raf || lost || !visible || !pageVisible) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
    wakeRef.current = () => {\r
      resize();\r
      wake();\r
    };\r
\r
    const locate = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      pointer.x = event.clientX - rect.left;\r
      pointer.y = event.clientY - rect.top;\r
      pointer.over = pointer.x >= 0 && pointer.y >= 0 && pointer.x <= rect.width && pointer.y <= rect.height;\r
      pointer.near =\r
        pointer.x >= -MARGIN / 2 &&\r
        pointer.y >= -MARGIN / 2 &&\r
        pointer.x <= rect.width + MARGIN / 2 &&\r
        pointer.y <= rect.height + MARGIN / 2;\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      locate(event);\r
      if (pointer.near) wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      locate(event);\r
      const s = settingsRef.current;\r
      if (!pointer.over || !s.interactive || !s.active || reduced) return;\r
      const along = nearestOn(path, pointer.x - size.width / 2, pointer.y - size.height / 2);\r
      pulses.push({ s: along, born: performance.now() });\r
      if (pulses.length > PULSES) pulses.shift();\r
      if (sparks.length < ARCS) sparks.push(spawnArc(time, along));\r
      wake();\r
    };\r
\r
    const onLeave = () => {\r
      pointer.over = false;\r
      pointer.near = false;\r
    };\r
\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onLeave);\r
\r
    const onLost = (event: Event) => {\r
      event.preventDefault();\r
      lost = true;\r
      cancelAnimationFrame(raf);\r
      raf = 0;\r
    };\r
    const onRestored = () => setGeneration(value => value + 1);\r
    canvas.addEventListener('webglcontextlost', onLost);\r
    canvas.addEventListener('webglcontextrestored', onRestored);\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      resize();\r
      wake();\r
    });\r
    resizeObserver.observe(container);\r
\r
    const intersection = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      wake();\r
    });\r
    intersection.observe(container);\r
\r
    const onVisibility = () => {\r
      pageVisible = document.visibilityState !== 'hidden';\r
      wake();\r
    };\r
    document.addEventListener('visibilitychange', onVisibility);\r
\r
    resize();\r
    wake();\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      canvas.removeEventListener('webglcontextlost', onLost);\r
      canvas.removeEventListener('webglcontextrestored', onRestored);\r
      if (!gl.isContextLost()) {\r
        gl.deleteVertexArray(vao);\r
        gl.deleteProgram(program.program);\r
      }\r
    };\r
  }, [generation]);\r
\r
  return (\r
    <div\r
      ref={containerRef}\r
      className={\`electric-border\${className ? \` \${className}\` : ''}\`}\r
      style={{ borderRadius, ...style }}\r
    >\r
      {children}\r
      <canvas\r
        ref={canvasRef}\r
        className="electric-border__canvas"\r
        style={{ top: -MARGIN, left: -MARGIN }}\r
        aria-hidden="true"\r
      />\r
    </div>\r
  );\r
};\r
\r
export default ElectricBorder;\r
`,a=`'use client';\r
\r
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';\r
\r
export interface ElectricBorderProps {\r
  children?: ReactNode;\r
  color?: string;\r
  glowColor?: string;\r
  speed?: number;\r
  chaos?: number;\r
  spread?: number;\r
  thickness?: number;\r
  strands?: number;\r
  glow?: number;\r
  intensity?: number;\r
  arcs?: number;\r
  flicker?: number;\r
  borderRadius?: number;\r
  offset?: number;\r
  active?: boolean;\r
  intro?: boolean;\r
  interactive?: boolean;\r
  cursorRadius?: number;\r
  theme?: 'dark' | 'light';\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Settings {\r
  core: number[];\r
  glowColor: number[];\r
  speed: number;\r
  chaos: number;\r
  spread: number;\r
  thickness: number;\r
  strands: number;\r
  glow: number;\r
  intensity: number;\r
  arcs: number;\r
  flicker: number;\r
  borderRadius: number;\r
  offset: number;\r
  active: boolean;\r
  intro: boolean;\r
  interactive: boolean;\r
  cursorRadius: number;\r
  light: boolean;\r
}\r
\r
interface Program {\r
  program: WebGLProgram;\r
  uniforms: Record<string, WebGLUniformLocation | null>;\r
}\r
\r
interface BorderPath {\r
  hx: number;\r
  hy: number;\r
  r: number;\r
  vr: number;\r
  ax: number;\r
  ay: number;\r
  quarter: number;\r
  perimeter: number;\r
}\r
\r
interface Spark {\r
  ax: number;\r
  ay: number;\r
  bx: number;\r
  by: number;\r
  bow: number;\r
  seed: number;\r
  born: number;\r
  life: number;\r
}\r
\r
interface Pulse {\r
  s: number;\r
  born: number;\r
}\r
\r
const ARCS = 4;\r
const PULSES = 3;\r
const MARGIN = 64;\r
const PIXEL_BUDGET = 3e6;\r
const SURGE_SPEED = 560;\r
const HALF_PI = Math.PI / 2;\r
\r
const VERTEX = \`#version 300 es\r
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));\r
void main() {\r
  gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
\r
uniform vec2 uSize;\r
uniform float uRatio;\r
uniform vec2 uCenter;\r
uniform vec2 uHalf;\r
uniform float uRadius;\r
uniform vec3 uParam;\r
uniform float uPerimeter;\r
uniform vec4 uCells;\r
uniform vec2 uSoft;\r
uniform float uTime;\r
uniform float uPower;\r
uniform float uReveal;\r
uniform vec3 uHover;\r
uniform float uHoverRadius;\r
uniform vec4 uPulses[\${PULSES}];\r
uniform vec3 uCore;\r
uniform vec3 uGlowColor;\r
uniform float uIntensity;\r
uniform float uGlow;\r
uniform float uThickness;\r
uniform float uStrands;\r
uniform float uChaos;\r
uniform float uSpread;\r
uniform float uFlicker;\r
uniform float uInk;\r
uniform vec4 uArcEnds[\${ARCS}];\r
uniform vec4 uArcShape[\${ARCS}];\r
\r
out vec4 fragColor;\r
\r
uint scramble(uint x) {\r
  x ^= x >> 16u;\r
  x *= 0x7feb352du;\r
  x ^= x >> 15u;\r
  x *= 0x846ca68bu;\r
  x ^= x >> 16u;\r
  return x;\r
}\r
\r
vec2 slant(uint x, uint y, uint seed) {\r
  uint h = scramble(x * 0x8da6b343u + y * 0xd8163841u + seed * 0xcb1ab31fu);\r
  return vec2(uvec2(h, h >> 8u) & 255u) / 127.5 - 1.0;\r
}\r
\r
vec2 ring(vec2 p, float period, uint seed) {\r
  vec2 i = floor(p);\r
  vec2 f = p - i;\r
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);\r
  float du = 30.0 * f.x * f.x * (f.x * (f.x - 2.0) + 1.0);\r
  uint x0 = uint(mod(i.x, period));\r
  uint x1 = uint(mod(i.x + 1.0, period));\r
  uint y0 = uint(i.y + 65536.0);\r
  vec2 ga = slant(x0, y0, seed);\r
  vec2 gb = slant(x1, y0, seed);\r
  vec2 gc = slant(x0, y0 + 1u, seed);\r
  vec2 gd = slant(x1, y0 + 1u, seed);\r
  float va = dot(ga, f);\r
  float vb = dot(gb, f - vec2(1.0, 0.0));\r
  float vc = dot(gc, f - vec2(0.0, 1.0));\r
  float vd = dot(gd, f - vec2(1.0, 1.0));\r
  float k = va - vb - vc + vd;\r
  float value = va + u.x * (vb - va) + u.y * (vc - va) + u.x * u.y * k;\r
  float gx = ga.x + u.x * (gb.x - ga.x) + u.y * (gc.x - ga.x) + u.x * u.y * (ga.x - gb.x - gc.x + gd.x);\r
  return vec2(value, gx + du * (vb - va + u.y * k));\r
}\r
\r
float wobble(float x, uint seed) {\r
  return ring(vec2(x, 0.5), 1048576.0, seed).x;\r
}\r
\r
vec2 frameAt(vec2 p) {\r
  vec2 inner = max(uHalf - uRadius, 0.0);\r
  vec2 q = abs(p) - inner;\r
  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - uRadius;\r
  float quarter = uPerimeter * 0.25;\r
  vec2 v = abs(p) - uParam.xy;\r
  float t;\r
  if (v.x > 0.0 && v.y > 0.0) t = uParam.x + uParam.z * atan(v.x, v.y);\r
  else if (v.x > v.y) t = uParam.x + 1.5707963 * uParam.z + uParam.y - abs(p.y);\r
  else t = abs(p.x);\r
  t = clamp(t, 0.0, quarter);\r
  float s = p.x >= 0.0 ? (p.y < 0.0 ? t : 2.0 * quarter - t) : (p.y < 0.0 ? 4.0 * quarter - t : 2.0 * quarter + t);\r
  return vec2(s, d);\r
}\r
\r
vec2 glowShape(float line, float spread, float w) {\r
  float x = abs(line);\r
  float y = abs(spread);\r
  return vec2(exp(-x * x / (w * w * 0.5)) + exp(-y / (w * 2.2)) * 0.6, exp(-y / (w * 4.5)) * 0.5);\r
}\r
\r
void addArc(vec2 p, vec4 ends, vec4 info, float t, inout vec3 light, inout float energy, inout float hot) {\r
  if (info.y < 0.002) return;\r
  vec2 ab = ends.zw - ends.xy;\r
  float len = max(length(ab), 1.0);\r
  vec2 dir = ab / len;\r
  vec2 rel = p - ends.xy;\r
  float along = dot(rel, dir);\r
  float side = dot(rel, vec2(-dir.y, dir.x));\r
  float margin = abs(info.x) + (0.6 + uChaos) * (2.0 + len * 0.08) + uThickness * 12.0 + 10.0;\r
  if (along < -margin || along > len + margin || abs(side) > margin) return;\r
  float u = clamp(along / len, 0.0, 1.0);\r
  float taper = sin(3.14159265 * u);\r
  float settle = smoothstep(0.0, 0.15, u) * smoothstep(1.0, 0.85, u);\r
  float bendSlope = 3.14159265 / len * cos(3.14159265 * u) * settle;\r
  float beyond = max(-along, 0.0) + max(along - len, 0.0);\r
  for (int c = 0; c < 2; c++) {\r
    uint seed = uint(info.z * 131.0) + uint(c) * 29u + 7u;\r
    float jag = 0.0;\r
    float jagSlope = 0.0;\r
    float wave = max(len * 0.3, 14.0);\r
    float weight = (0.6 + uChaos) * (1.5 + len * 0.05) * (c == 0 ? 1.0 : 1.5);\r
    for (int o = 0; o < 3; o++) {\r
      vec2 n = ring(vec2(along / wave + info.z * 3.0, t * (1.4 + float(o) * 1.1)), 1048576.0, seed + uint(o));\r
      jag += n.x * weight;\r
      jagSlope += n.y * weight / wave;\r
      wave *= 0.42;\r
      weight *= 0.4;\r
    }\r
    float offset = (info.x + jag) * taper;\r
    float offsetSlope = (info.x + jag) * bendSlope + jagSlope * taper * settle;\r
    float across = (side - offset) / sqrt(1.0 + offsetSlope * offsetSlope);\r
    float gap = length(vec2(beyond, across));\r
    float w = uThickness * (c == 0 ? 0.9 : 0.6);\r
    vec2 g = glowShape(gap, gap, w);\r
    float k = info.y * (c == 0 ? 1.0 : 0.45);\r
    light += (uCore * g.x + uGlowColor * g.y * uGlow) * k;\r
    energy += (g.x + g.y * uGlow) * k;\r
    hot += exp(-gap * gap / (w * w * 0.16)) * k * (c == 0 ? 1.0 : 0.0);\r
  }\r
}\r
\r
void main() {\r
  vec2 p = vec2(gl_FragCoord.x / uRatio, uSize.y - gl_FragCoord.y / uRatio);\r
  vec2 frame = frameAt(p - uCenter);\r
  float s = frame.x;\r
  float d = frame.y;\r
  float t = uTime;\r
  vec3 light = vec3(0.0);\r
  float energy = 0.0;\r
  float hot = 0.0;\r
\r
  float along = min(s, uPerimeter - s);\r
  float front = uReveal * (uPerimeter * 0.5 + 80.0);\r
  float shown = smoothstep(front, front - 70.0, along) * uPower;\r
  float flare = uReveal < 1.0 ? exp(-pow((along - front + 30.0) / 26.0, 2.0)) * uPower : 0.0;\r
\r
  vec2 toHover = p - uHover.xy;\r
  float heat = uHover.z * exp(-dot(toHover, toHover) / (uHoverRadius * uHoverRadius));\r
  float surge = 0.0;\r
  for (int i = 0; i < \${PULSES}; i++) {\r
    vec4 pulse = uPulses[i];\r
    if (pulse.z <= 0.0) continue;\r
    float gap = abs(s - pulse.x);\r
    gap = min(gap, uPerimeter - gap);\r
    float wave = (gap - pulse.y * \${SURGE_SPEED}.0) / 46.0;\r
    surge += exp(-wave * wave) * pulse.z * exp(-pulse.y * 1.2);\r
  }\r
  heat = min(heat * 0.7 + surge * 0.8 + flare * 0.6, 1.2);\r
  vec2 inset = min(p, uSize - p);\r
  float frameFade = smoothstep(0.0, 14.0, min(inset.x, inset.y));\r
\r
  float edge = abs(d);\r
  float inward = d < 0.0 ? exp(d / 14.0) : 1.0;\r
  float bloom = (exp(-edge / 3.0) * 0.1 + exp(-edge / 16.0) * 0.05 * inward) * uGlow * (1.0 + heat * 0.6) * shown;\r
  light += uGlowColor * bloom;\r
  energy += bloom;\r
\r
  float bendAmp = uSpread * 16.0 * (1.0 + heat * 0.35);\r
  float rippleAmp = uSpread * 6.0 * (1.0 + heat * 0.3);\r
  float crinkleAmp = uChaos * 4.5 * (1.0 + heat * 0.3);\r
  float squeeze = min(1.0, 34.0 / max((bendAmp + rippleAmp) * 1.6 + crinkleAmp, 1e-3));\r
  bendAmp *= squeeze;\r
  rippleAmp *= squeeze;\r
  crinkleAmp *= squeeze;\r
  float reach = (bendAmp * 1.9 + rippleAmp + crinkleAmp * 1.6) * 1.3 + uThickness * 14.0 + 8.0;\r
  if (edge < reach && shown > 0.0) {\r
    float fade = smoothstep(reach, reach * 0.55, edge);\r
    float count = min(uStrands + heat * 1.2, 6.0);\r
    float slopeScale = 1.0 / uPerimeter;\r
    for (int i = 0; i < 6; i++) {\r
      float fi = float(i);\r
      if (fi >= ceil(count)) break;\r
      float present = clamp(count - fi, 0.0, 1.0);\r
      uint seed = uint(i) * 7u + 3u;\r
      float lead = i == 0 ? 1.0 : 0.0;\r
      float range = mix(1.35 + fi * 0.18, 0.7, lead);\r
      float x = s * slopeScale;\r
      vec2 a = ring(vec2(x * uCells.x, t * 0.7 + fi * 3.1), uCells.x, seed);\r
      vec2 b = ring(vec2(x * uCells.y, t * 1.9 + fi * 1.7), uCells.y, seed + 1u);\r
      vec2 c = ring(vec2(x * uCells.z, t * 4.6 + fi * 0.9), uCells.z, seed + 2u);\r
      vec2 e = ring(vec2(x * uCells.w, t * 6.8), uCells.w, seed + 3u);\r
      float offset = (a.x * bendAmp + b.x * rippleAmp) * range + (c.x + e.x * 0.35) * crinkleAmp;\r
      float slope =\r
        ((a.y * uCells.x * bendAmp + b.y * uCells.y * rippleAmp) * range +\r
          (c.y * uCells.z + e.y * 0.35 * uCells.w) * crinkleAmp) *\r
        slopeScale;\r
      float drift = lead > 0.5 ? 0.0 : wobble(fi * 7.3, seed + 9u) * 2.5 * uSpread;\r
      offset += drift;\r
      float across = (d - offset) / sqrt(1.0 + slope * slope);\r
      float spread = d - a.x * bendAmp * range - drift;\r
      float swell = 0.5 + 0.5 * ring(vec2(x * uSoft.y, t * 2.0 + fi * 5.1), uSoft.y, seed + 8u).x;\r
      float w = uThickness * mix(0.55, 1.0, lead) * (0.5 + swell);\r
      float vis = mix(0.3 + 0.45 * smoothstep(-0.25, 0.2, ring(vec2(x * uSoft.x, t * 0.5 + fi * 3.7), uSoft.x, seed + 5u).x), 1.0, lead);\r
      float spark = 1.0 - uFlicker * 0.3 * (0.5 + 0.5 * wobble(t * 13.0 + fi * 2.3, seed + 6u));\r
      float weight = max(vis, heat * 0.6) * spark * fade * present * (0.7 + 0.6 * swell);\r
      vec2 g = glowShape(across, spread, w) * weight;\r
      g.y *= inward;\r
      float haze = uGlow * (1.0 + heat * 0.5) * (1.0 - uInk * 0.7);\r
      light += uCore * g.x + uGlowColor * g.y * haze;\r
      energy += g.x + g.y * haze;\r
      hot += exp(-across * across / (w * w * 0.16)) * lead * weight;\r
    }\r
    light *= shown;\r
    energy *= shown;\r
    hot *= shown;\r
  }\r
\r
  for (int i = 0; i < \${ARCS}; i++) addArc(p, uArcEnds[i], uArcShape[i], t, light, energy, hot);\r
\r
  float breath = 1.0 + uFlicker * 0.5 * wobble(t * 4.6 + 7.0, 3u);\r
  float gain = uIntensity * breath * (1.0 + heat * 0.25) * 1.4;\r
  light *= frameFade;\r
  energy *= frameFade;\r
  hot *= frameFade;\r
  float alpha = 1.0 - exp(-energy * gain);\r
  vec3 color = mix(1.0 - exp(-light * gain), alpha * light / max(energy, 1e-4), uInk);\r
  color = mix(color, vec3(alpha), clamp(hot, 0.0, 1.0) * uInk * 0.85);\r
  float grain = (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;\r
  alpha = clamp(alpha + grain, 0.0, 1.0);\r
  fragColor = vec4(clamp(color + grain, 0.0, alpha), alpha);\r
}\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const parseColor = (value: string): number[] => {\r
  const text = String(value || '').trim();\r
  const hex = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text);\r
  if (hex) {\r
    const full = hex[1].length === 3 ? hex[1].replace(/./g, digit => digit + digit) : hex[1];\r
    return [0, 2, 4].map(index => parseInt(full.slice(index, index + 2), 16) / 255);\r
  }\r
  const rgb = /^rgba?\\(\\s*([\\d.]+)[\\s,]+([\\d.]+)[\\s,]+([\\d.]+)/i.exec(text);\r
  if (rgb) return [rgb[1], rgb[2], rgb[3]].map(channel => clamp(parseFloat(channel) / 255, 0, 1));\r
  if (typeof document !== 'undefined') {\r
    const context = document.createElement('canvas').getContext('2d');\r
    if (context) {\r
      context.fillStyle = '#000000';\r
      context.fillStyle = text;\r
      const normal = String(context.fillStyle);\r
      if (normal !== '#000000' || /^(#0{3}|#0{6}|black)$/i.test(text)) return parseColor(normal);\r
    }\r
  }\r
  return [0.49, 0.98, 1];\r
};\r
\r
const compile = (gl: WebGL2RenderingContext, type: number, source: string) => {\r
  const shader = gl.createShader(type);\r
  if (!shader) return null;\r
  gl.shaderSource(shader, source);\r
  gl.compileShader(shader);\r
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {\r
    console.error(gl.getShaderInfoLog(shader));\r
    gl.deleteShader(shader);\r
    return null;\r
  }\r
  return shader;\r
};\r
\r
const link = (gl: WebGL2RenderingContext): Program | null => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
  const program = vertex && fragment ? gl.createProgram() : null;\r
  if (!vertex || !fragment || !program) {\r
    if (vertex) gl.deleteShader(vertex);\r
    if (fragment) gl.deleteShader(fragment);\r
    return null;\r
  }\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
  gl.linkProgram(program);\r
  gl.deleteShader(vertex);\r
  gl.deleteShader(fragment);\r
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {\r
    console.error(gl.getProgramInfoLog(program));\r
    gl.deleteProgram(program);\r
    return null;\r
  }\r
  const uniforms: Program['uniforms'] = {};\r
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
  for (let index = 0; index < count; index++) {\r
    const info = gl.getActiveUniform(program, index);\r
    if (info) uniforms[info.name.replace(/\\[0\\]$/, '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const roundBox = (x: number, y: number, hx: number, hy: number, r: number) => {\r
  const qx = Math.abs(x) - (hx - r);\r
  const qy = Math.abs(y) - (hy - r);\r
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;\r
};\r
\r
const pathOf = (width: number, height: number, radius: number, offset: number): BorderPath => {\r
  const hx = Math.max(1, width / 2 + offset);\r
  const hy = Math.max(1, height / 2 + offset);\r
  const r = clamp(radius + offset, 0, Math.min(hx, hy));\r
  const vr = Math.min(r + 48, Math.min(hx, hy));\r
  const ax = hx - vr;\r
  const ay = hy - vr;\r
  const quarter = ax + ay + HALF_PI * vr;\r
  return { hx, hy, r, vr, ax, ay, quarter, perimeter: quarter * 4 };\r
};\r
\r
const pointOn = (path: BorderPath, s: number) => {\r
  const { hx, hy, r, vr, ax, ay, quarter, perimeter } = path;\r
  const u = ((s % perimeter) + perimeter) % perimeter;\r
  const part = Math.min(3, Math.floor(u / quarter));\r
  const rest = u - part * quarter;\r
  const local = part % 2 ? quarter - rest : rest;\r
  let x;\r
  let y;\r
  if (local <= ax) {\r
    x = local;\r
    y = -hy;\r
  } else if (local <= ax + HALF_PI * vr) {\r
    const angle = vr > 0 ? (local - ax) / vr : 0;\r
    const dx = Math.sin(angle);\r
    const dy = -Math.cos(angle);\r
    let low = 0;\r
    let high = vr + r + 2;\r
    for (let step = 0; step < 18; step++) {\r
      const mid = (low + high) / 2;\r
      if (roundBox(ax + dx * mid, -ay + dy * mid, hx, hy, r) < 0) low = mid;\r
      else high = mid;\r
    }\r
    x = ax + dx * low;\r
    y = -ay + dy * low;\r
  } else {\r
    x = hx;\r
    y = -ay + (local - ax - HALF_PI * vr);\r
  }\r
  const flipX = part >= 2 ? -1 : 1;\r
  const flipY = part === 1 || part === 2 ? -1 : 1;\r
  const px = x * flipX;\r
  const py = y * flipY;\r
  const nx = roundBox(px + 0.5, py, hx, hy, r) - roundBox(px - 0.5, py, hx, hy, r);\r
  const ny = roundBox(px, py + 0.5, hx, hy, r) - roundBox(px, py - 0.5, hx, hy, r);\r
  const length = Math.hypot(nx, ny) || 1;\r
  return { x: px, y: py, nx: nx / length, ny: ny / length };\r
};\r
\r
const nearestOn = (path: BorderPath, x: number, y: number) => {\r
  const { ax, ay, vr, quarter } = path;\r
  const qx = Math.abs(x) - ax;\r
  const qy = Math.abs(y) - ay;\r
  let t;\r
  if (qx > 0 && qy > 0) t = ax + vr * Math.atan2(qx, qy);\r
  else if (qx > qy) t = ax + HALF_PI * vr + ay - Math.abs(y);\r
  else t = Math.abs(x);\r
  t = clamp(t, 0, quarter);\r
  if (x >= 0) return y < 0 ? t : 2 * quarter - t;\r
  return y < 0 ? 4 * quarter - t : 2 * quarter + t;\r
};\r
\r
const ElectricBorder = ({\r
  children,\r
  color = '#7df9ff',\r
  glowColor,\r
  speed = 1,\r
  chaos = 0.5,\r
  spread = 0.6,\r
  thickness = 1.5,\r
  strands = 3,\r
  glow = 0.6,\r
  intensity = 0.8,\r
  arcs = 1,\r
  flicker = 0.5,\r
  borderRadius = 24,\r
  offset = 0,\r
  active = true,\r
  intro = true,\r
  interactive = true,\r
  cursorRadius = 90,\r
  theme = 'dark',\r
  className = '',\r
  style\r
}: ElectricBorderProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const [generation, setGeneration] = useState(0);\r
\r
  const base = parseColor(color);\r
  const settings: Settings = {\r
    core: base.map(channel => channel + (1 - channel) * 0.55),\r
    glowColor: glowColor ? parseColor(glowColor) : base,\r
    speed: Math.max(0, speed),\r
    chaos: clamp(chaos, 0, 2),\r
    spread: clamp(spread, 0, 2),\r
    thickness: Math.max(0.25, thickness),\r
    strands: clamp(Math.round(strands), 1, 6),\r
    glow: clamp(glow, 0, 3),\r
    intensity: Math.max(0, intensity),\r
    arcs: Math.max(0, arcs),\r
    flicker: clamp(flicker, 0, 1),\r
    borderRadius: Math.max(0, borderRadius),\r
    offset,\r
    active,\r
    intro,\r
    interactive,\r
    cursorRadius: Math.max(1, cursorRadius),\r
    light: theme === 'light'\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    if (!container || !canvas) return;\r
\r
    const gl = canvas.getContext('webgl2', {\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false,\r
      powerPreference: 'default'\r
    });\r
    const program = gl ? link(gl) : null;\r
    if (!gl || !program) return;\r
\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
    const vao = gl.createVertexArray();\r
    const arcEnds = new Float32Array(ARCS * 4);\r
    const arcShape = new Float32Array(ARCS * 4);\r
    const pulseData = new Float32Array(PULSES * 4);\r
    const size = { width: 1, height: 1, ratio: 1 };\r
    const pointer = { x: 0, y: 0, over: false, near: false };\r
    const hover = { x: 0, y: 0, vx: 0, vy: 0, power: 0 };\r
    const sparks: Spark[] = [];\r
    const pulses: Pulse[] = [];\r
    const first = settingsRef.current;\r
    let power = first.active && !(first.intro && !reduced && generation === 0) ? 1 : 0;\r
    let reveal = power;\r
    let wasActive = first.active;\r
    let ink = first.light ? 1 : 0;\r
    let path = pathOf(1, 1, 0, 0);\r
    let time = Math.random() * 100;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let pageVisible = document.visibilityState !== 'hidden';\r
    let lost = false;\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const width = Math.max(1, container.offsetWidth);\r
      const height = Math.max(1, container.offsetHeight);\r
      const canvasWidth = width + MARGIN * 2;\r
      const canvasHeight = height + MARGIN * 2;\r
      const ratio = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(PIXEL_BUDGET / (canvasWidth * canvasHeight)));\r
      const pixelWidth = Math.max(1, Math.round(canvasWidth * ratio));\r
      const pixelHeight = Math.max(1, Math.round(canvasHeight * ratio));\r
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {\r
        canvas.width = pixelWidth;\r
        canvas.height = pixelHeight;\r
      }\r
      canvas.style.width = \`\${canvasWidth}px\`;\r
      canvas.style.height = \`\${canvasHeight}px\`;\r
      Object.assign(size, { width, height, ratio: pixelWidth / canvasWidth });\r
      path = pathOf(width, height, s.borderRadius, s.offset);\r
    };\r
\r
    const spawnArc = (now: number, near: number | null): Spark => {\r
      const span = Math.min(path.perimeter * 0.3, 60 + Math.random() * 90);\r
      const start = near ?? Math.random() * path.perimeter;\r
      const from = start - span * (0.2 + Math.random() * 0.6);\r
      const to = from + span;\r
      const a = pointOn(path, from);\r
      const b = pointOn(path, to);\r
      const mid = pointOn(path, (from + to) / 2);\r
      const dx = b.x - a.x;\r
      const dy = b.y - a.y;\r
      const length = Math.hypot(dx, dy) || 1;\r
      const side = (-dy / length) * mid.nx + (dx / length) * mid.ny;\r
      const bow = Math.min(MARGIN - 30, length * (0.14 + Math.random() * 0.16) + 5);\r
      return {\r
        ax: a.x,\r
        ay: a.y,\r
        bx: b.x,\r
        by: b.y,\r
        bow: side >= 0 ? bow : -bow,\r
        seed: 1 + Math.random() * 60,\r
        born: now,\r
        life: 0.35 + Math.random() * 0.45\r
      };\r
    };\r
\r
    const render = (s: Settings, heatPower: number) => {\r
      const u = program.uniforms;\r
      const width = size.width + MARGIN * 2;\r
      const height = size.height + MARGIN * 2;\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      if (power <= 0.001 && !sparks.length) return;\r
      gl.useProgram(program.program);\r
      gl.uniform2f(u.uSize, width, height);\r
      gl.uniform1f(u.uRatio, size.ratio);\r
      gl.uniform2f(u.uCenter, width / 2, height / 2);\r
      gl.uniform2f(u.uHalf, path.hx, path.hy);\r
      gl.uniform1f(u.uRadius, path.r);\r
      gl.uniform3f(u.uParam, path.ax, path.ay, path.vr);\r
      gl.uniform1f(u.uPerimeter, path.perimeter);\r
      gl.uniform4f(\r
        u.uCells,\r
        Math.max(1, Math.round(path.perimeter / 75)),\r
        Math.max(2, Math.round(path.perimeter / 25)),\r
        Math.max(3, Math.round(path.perimeter / 9)),\r
        Math.max(4, Math.round(path.perimeter / 4))\r
      );\r
      gl.uniform2f(\r
        u.uSoft,\r
        Math.max(1, Math.round(path.perimeter / 150)),\r
        Math.max(1, Math.round(path.perimeter / 50))\r
      );\r
      gl.uniform1f(u.uTime, time);\r
      gl.uniform1f(u.uPower, power * power * (3 - 2 * power));\r
      gl.uniform1f(u.uReveal, reveal);\r
      gl.uniform3f(u.uHover, hover.x + MARGIN, hover.y + MARGIN, heatPower);\r
      gl.uniform1f(u.uHoverRadius, s.cursorRadius);\r
      gl.uniform4fv(u.uPulses, pulseData);\r
      gl.uniform3fv(u.uCore, s.core);\r
      gl.uniform3fv(u.uGlowColor, s.glowColor);\r
      gl.uniform1f(u.uIntensity, s.intensity);\r
      gl.uniform1f(u.uGlow, s.glow);\r
      gl.uniform1f(u.uThickness, s.thickness);\r
      gl.uniform1f(u.uStrands, s.strands);\r
      gl.uniform1f(u.uChaos, s.chaos);\r
      gl.uniform1f(u.uSpread, s.spread);\r
      gl.uniform1f(u.uFlicker, reduced ? 0 : s.flicker);\r
      gl.uniform1f(u.uInk, ink);\r
      gl.uniform4fv(u.uArcEnds, arcEnds);\r
      gl.uniform4fv(u.uArcShape, arcShape);\r
      gl.bindVertexArray(vao);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (lost) return;\r
      const s = settingsRef.current;\r
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05);\r
      last = Math.max(last, now);\r
      const motion = reduced ? 0.2 : 1;\r
      time += dt * s.speed * motion;\r
\r
      if (s.active && !wasActive) reveal = 0;\r
      wasActive = s.active;\r
      power += ((s.active ? 1 : 0) - power) * (1 - Math.exp(-dt / (s.active ? 0.28 : 0.4)));\r
      if (s.active) reveal = reduced ? 1 : Math.min(1, reveal + dt / 0.9);\r
      ink += ((s.light ? 1 : 0) - ink) * (1 - Math.exp(-dt / 0.25));\r
\r
      const engaged = s.interactive && pointer.near && s.active;\r
      if (engaged && hover.power < 0.01) {\r
        hover.x = pointer.x;\r
        hover.y = pointer.y;\r
        hover.vx = 0;\r
        hover.vy = 0;\r
      }\r
      hover.vx += ((pointer.x - hover.x) * 120 - hover.vx * 19) * dt;\r
      hover.vy += ((pointer.y - hover.y) * 120 - hover.vy * 19) * dt;\r
      hover.x += hover.vx * dt;\r
      hover.y += hover.vy * dt;\r
      hover.power += ((engaged ? 1 : 0) - hover.power) * (1 - Math.exp(-dt / (engaged ? 0.3 : 0.55)));\r
\r
      for (let index = sparks.length - 1; index >= 0; index--) {\r
        if (time - sparks[index].born > sparks[index].life) sparks.splice(index, 1);\r
      }\r
      if (!reduced && s.active && reveal >= 1 && s.arcs > 0 && sparks.length < ARCS) {\r
        const chance = dt * s.speed * s.arcs;\r
        if (Math.random() < chance * 5 * hover.power) {\r
          sparks.push(spawnArc(time, nearestOn(path, hover.x - size.width / 2, hover.y - size.height / 2)));\r
        } else if (Math.random() < chance * (0.6 + path.perimeter / 2400)) {\r
          sparks.push(spawnArc(time, null));\r
        }\r
      }\r
      const fit = power * power * (3 - 2 * power);\r
      for (let index = 0; index < ARCS; index++) {\r
        const o = index * 4;\r
        const spark = sparks[index];\r
        if (!spark) {\r
          arcShape[o + 1] = 0;\r
          continue;\r
        }\r
        const k = clamp((time - spark.born) / spark.life, 0, 1);\r
        arcEnds[o] = spark.ax + size.width / 2 + MARGIN;\r
        arcEnds[o + 1] = spark.ay + size.height / 2 + MARGIN;\r
        arcEnds[o + 2] = spark.bx + size.width / 2 + MARGIN;\r
        arcEnds[o + 3] = spark.by + size.height / 2 + MARGIN;\r
        arcShape[o] = spark.bow;\r
        arcShape[o + 1] = Math.sin(Math.PI * k) * fit;\r
        arcShape[o + 2] = spark.seed;\r
      }\r
\r
      for (let index = pulses.length - 1; index >= 0; index--) {\r
        if (now - pulses[index].born > 2200) pulses.splice(index, 1);\r
      }\r
      for (let index = 0; index < PULSES; index++) {\r
        const o = index * 4;\r
        const pulse = pulses[index];\r
        if (!pulse) {\r
          pulseData[o + 2] = 0;\r
          continue;\r
        }\r
        pulseData[o] = pulse.s;\r
        pulseData[o + 1] = (now - pulse.born) / 1000;\r
        pulseData[o + 2] = 1;\r
      }\r
\r
      render(s, hover.power * (s.interactive ? 1 : 0));\r
\r
      const busy = power > 0.002 || s.active || sparks.length > 0;\r
      if (busy && visible && pageVisible) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (raf || lost || !visible || !pageVisible) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
    wakeRef.current = () => {\r
      resize();\r
      wake();\r
    };\r
\r
    const locate = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      pointer.x = event.clientX - rect.left;\r
      pointer.y = event.clientY - rect.top;\r
      pointer.over = pointer.x >= 0 && pointer.y >= 0 && pointer.x <= rect.width && pointer.y <= rect.height;\r
      pointer.near =\r
        pointer.x >= -MARGIN / 2 &&\r
        pointer.y >= -MARGIN / 2 &&\r
        pointer.x <= rect.width + MARGIN / 2 &&\r
        pointer.y <= rect.height + MARGIN / 2;\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      locate(event);\r
      if (pointer.near) wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      locate(event);\r
      const s = settingsRef.current;\r
      if (!pointer.over || !s.interactive || !s.active || reduced) return;\r
      const along = nearestOn(path, pointer.x - size.width / 2, pointer.y - size.height / 2);\r
      pulses.push({ s: along, born: performance.now() });\r
      if (pulses.length > PULSES) pulses.shift();\r
      if (sparks.length < ARCS) sparks.push(spawnArc(time, along));\r
      wake();\r
    };\r
\r
    const onLeave = () => {\r
      pointer.over = false;\r
      pointer.near = false;\r
    };\r
\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onLeave);\r
\r
    const onLost = (event: Event) => {\r
      event.preventDefault();\r
      lost = true;\r
      cancelAnimationFrame(raf);\r
      raf = 0;\r
    };\r
    const onRestored = () => setGeneration(value => value + 1);\r
    canvas.addEventListener('webglcontextlost', onLost);\r
    canvas.addEventListener('webglcontextrestored', onRestored);\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      resize();\r
      wake();\r
    });\r
    resizeObserver.observe(container);\r
\r
    const intersection = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      wake();\r
    });\r
    intersection.observe(container);\r
\r
    const onVisibility = () => {\r
      pageVisible = document.visibilityState !== 'hidden';\r
      wake();\r
    };\r
    document.addEventListener('visibilitychange', onVisibility);\r
\r
    resize();\r
    wake();\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      canvas.removeEventListener('webglcontextlost', onLost);\r
      canvas.removeEventListener('webglcontextrestored', onRestored);\r
      if (!gl.isContextLost()) {\r
        gl.deleteVertexArray(vao);\r
        gl.deleteProgram(program.program);\r
      }\r
    };\r
  }, [generation]);\r
\r
  return (\r
    <div ref={containerRef} className={\`relative isolate \${className}\`.trim()} style={{ borderRadius, ...style }}>\r
      {children}\r
      <canvas\r
        ref={canvasRef}\r
        className="pointer-events-none absolute z-[1] block"\r
        style={{ top: -MARGIN, left: -MARGIN }}\r
        aria-hidden="true"\r
      />\r
    </div>\r
  );\r
};\r
\r
export default ElectricBorder;\r
`,o={usage:`import ElectricBorder from './ElectricBorder';

<ElectricBorder
  color="#7df9ff"
  speed={1}
  chaos={0.5}
  spread={0.6}
  strands={3}
  thickness={1.5}
  borderRadius={24}
>
  <div style={{ width: 300, height: 360, borderRadius: 24 }}>
    Your content
  </div>
</ElectricBorder>`,code:r,css:n,tailwind:e,tsCode:t,tsTailwind:a};export{o as electricBorder};
