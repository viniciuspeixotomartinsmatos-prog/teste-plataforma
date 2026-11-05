const n=`'use client';\r
\r
import { useEffect, useMemo, useRef } from 'react';\r
import './WebThreads.css';\r
\r
const ROOT = 'web-threads-container';\r
const CANVAS = 'web-threads-canvas';\r
\r
const MAX_THREADS = 24;\r
const MAX_COLORS = 6;\r
const MAX_SURGES = 3;\r
const SURGE_SECONDS = 1.6;\r
const SURGE_STAGGER = 0.05;\r
const STROKE_SECONDS = 1.25;\r
const TAU = Math.PI * 2;\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform vec2 uResolution;\r
uniform float uPhase;\r
uniform float uClock;\r
uniform int uCount;\r
uniform float uFrequency;\r
uniform float uSpread;\r
uniform float uTaper;\r
uniform float uPosition;\r
uniform float uPinch;\r
uniform float uNodes;\r
uniform vec2 uAngle;\r
uniform float uGlow;\r
uniform float uFalloff;\r
uniform float uThickness;\r
uniform float uBrightness;\r
uniform float uOpacity;\r
uniform float uMirror;\r
uniform float uShimmer;\r
uniform float uDepth;\r
uniform float uPulses;\r
uniform float uFade;\r
uniform float uGrain;\r
uniform vec3 uColors[\${MAX_COLORS}];\r
uniform int uColorCount;\r
uniform vec3 uCore;\r
uniform vec3 uBackground;\r
uniform float uOpaque;\r
uniform float uLight;\r
uniform vec4 uIntro;\r
uniform float uFocus[\${MAX_THREADS}];\r
uniform vec2 uFocusState;\r
uniform vec4 uSurges[\${MAX_SURGES}];\r
out vec4 outColor;\r
\r
const float PI = 3.14159265;\r
const float TAU = 6.28318530;\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
float easeInOut(float t) {\r
  return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) * 0.5;\r
}\r
\r
vec3 palette(float t) {\r
  if (uColorCount <= 1) return uColors[0];\r
  float scaled = clamp(t, 0.0, 1.0) * float(uColorCount - 1);\r
  int index = int(min(floor(scaled), float(uColorCount - 2)));\r
  return mix(uColors[index], uColors[index + 1], scaled - float(index));\r
}\r
\r
vec2 envelope(float x) {\r
  float dx = x - uPinch;\r
  if (uNodes <= 1.0) return vec2(uSpread * abs(dx), uSpread * sign(dx));\r
  float k = PI * uNodes;\r
  float c = cos(k * (dx + 0.5));\r
  return vec2(uSpread * 0.5 * abs(c), -uSpread * 0.5 * k * sin(k * (dx + 0.5)) * sign(c));\r
}\r
\r
vec2 space(vec2 p, float aspect) {\r
  vec2 q = (p - 0.5) * vec2(aspect, 1.0);\r
  q = vec2(q.x * uAngle.x + q.y * uAngle.y, -q.x * uAngle.y + q.y * uAngle.x);\r
  return vec2(q.x / aspect + 0.5, q.y + 0.5);\r
}\r
\r
float hubAt(float x) {\r
  if (uNodes <= 1.0) return uPinch;\r
  float spacing = 1.0 / uNodes;\r
  return uPinch - 0.5 + (floor((x - uPinch + 0.5) / spacing) + 0.5) * spacing;\r
}\r
\r
vec3 thread(float x, float i, float n) {\r
  float lane = uNodes <= 1.0 ? x - uPinch : (x - uPinch + 0.5) * uNodes - 0.5;\r
  float side = uMirror > 0.5 ? (mod(floor(lane), 2.0) < 0.5 ? -1.0 : 1.0) : 1.0;\r
  vec2 env = envelope(x);\r
  float amp = 1.0 + i * uTaper;\r
  float shimmer = uShimmer > 0.5 ? sin(uClock * 1.7 + i * 1.3) * 0.35 : 0.0;\r
  float angle = x * uFrequency + (uPhase + i * TAU / max(n, 1.0)) * side + shimmer;\r
  float wave = sin(angle);\r
  float y = uPosition - env.x * amp * wave;\r
  float slope = -(env.y * amp * wave + env.x * amp * cos(angle) * uFrequency);\r
  return vec3(y, slope, angle);\r
}\r
\r
void main() {\r
  vec2 p = gl_FragCoord.xy / uResolution;\r
  float aspect = uResolution.x / uResolution.y;\r
  vec2 s = space(p, aspect);\r
  float x = s.x;\r
  float y = s.y;\r
  float n = float(uCount);\r
  float pixel = 1.0 / uResolution.y;\r
  float hub = hubAt(x);\r
  float presence = uFocusState.x;\r
  float settle = uFocusState.y;\r
\r
  vec3 color = vec3(0.0);\r
  float energy = 0.0;\r
  float ink = 0.0;\r
  vec3 inkColor = vec3(0.0);\r
\r
  for (int idx = 0; idx < \${MAX_THREADS}; idx++) {\r
    if (idx >= uCount) break;\r
    float i = float(idx);\r
    float ci = n > 1.0 ? i / (n - 1.0) : 0.0;\r
\r
    float head = 2.0;\r
    float bead = 0.0;\r
    float born = 1.0;\r
    if (uIntro.w > 0.5) {\r
      float progress = clamp((uIntro.x - i * uIntro.y) / uIntro.z, 0.0, 1.0);\r
      head = mix(-0.06, 1.06, easeInOut(progress));\r
      bead = sin(PI * progress);\r
      born = progress > 0.0 ? smoothstep(-0.05, 0.03, head) : 0.0;\r
    }\r
    if (born <= 0.0) continue;\r
\r
    bool tip = x > head;\r
    vec3 lead = bead > 0.0 || tip ? thread(head, i, n) : vec3(0.0);\r
    vec3 t = tip ? lead : thread(x, i, n);\r
\r
    float focus = uFocus[idx];\r
    float spot = tip ? head : x;\r
    float twist = uDepth * smoothstep(0.0, 0.07, abs(spot - hubAt(spot)));\r
    float depth = 0.5 + 0.5 * cos(t.z);\r
    float front = mix(1.0, 0.3 + 0.7 * depth, twist);\r
    float width = uThickness * mix(1.0, 0.55 + 0.7 * depth, twist) * (1.0 + 0.3 * focus * presence);\r
\r
    float d;\r
    if (tip) {\r
      float back = head - 0.02;\r
      vec2 a = vec2(back * aspect, thread(back, i, n).x);\r
      vec2 b = vec2(head * aspect, lead.x);\r
      vec2 pa = vec2(x * aspect, y) - a;\r
      vec2 ba = b - a;\r
      d = length(pa - ba * clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0));\r
    } else {\r
      float bend = t.y * smoothstep(0.0, 0.04, abs(x - hub));\r
      d = abs(y - t.x) / sqrt(1.0 + bend * bend / (aspect * aspect));\r
    }\r
    float g = uGlow / pow(max(d / width, pixel * 0.35), uFalloff) * front * born;\r
    float onLine = exp(-d / (width * 0.012));\r
\r
    if (bead > 0.0) {\r
      vec2 near = vec2((x - head) * aspect, y - lead.x);\r
      g *= 1.0 + bead * 1.6 * exp(-dot(near, near) / 0.0025);\r
    }\r
\r
    float light = 0.0;\r
    for (int k = 0; k < \${MAX_SURGES}; k++) {\r
      vec4 surge = uSurges[k];\r
      if (surge.w <= 0.0) continue;\r
      float progress = clamp((surge.y - i * \${SURGE_STAGGER.toFixed(3)}) / \${SURGE_SECONDS.toFixed(2)}, 0.0, 1.0);\r
      if (progress <= 0.0 || progress >= 1.0) continue;\r
      float lead = mix(surge.x, surge.z > 0.0 ? 1.12 : -0.12, easeInOut(progress));\r
      float along = (x - lead) * surge.z * aspect;\r
      float trail = along < 0.0 ? exp(along / 0.24) : exp(-along * along / 0.0009);\r
      light += trail * sin(PI * progress);\r
    }\r
    g *= 1.0 + light * (0.12 + 2.8 * onLine);\r
\r
    if (uPulses > 0.0) {\r
      float travel = abs(x - hub);\r
      float pulse = pow(0.5 + 0.5 * sin(travel * 16.0 + uClock * 2.2 + i * 1.9), 24.0);\r
      g *= 1.0 + uPulses * 5.0 * pulse * onLine;\r
    }\r
\r
    float sheen = pow(0.5 + 0.5 * sin(abs(x - hub) * 11.0 + uClock * 1.4), 10.0);\r
    float lift = focus * presence;\r
    g *= (1.0 - settle * (1.0 - focus)) * (1.0 + lift * (0.9 + 1.4 * sheen * onLine));\r
\r
    vec3 tint = mix(palette(ci), uCore, 0.3 * lift);\r
    color += g * tint;\r
    energy += g;\r
    float stroke = smoothstep(0.45, 1.3, g);\r
    inkColor += tint * stroke;\r
    ink += stroke;\r
  }\r
\r
  float fade = 1.0;\r
  if (uFade > 0.0) {\r
    float edge = min(x, 1.0 - x);\r
    float f = clamp(edge / max(uFade * 0.5, 0.001), 0.0, 1.0);\r
    fade = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);\r
  }\r
  float core = smoothstep(0.5, 2.2, energy);\r
  color = mix(color, uCore * energy, core * 0.5);\r
  color *= uBrightness * fade;\r
  float alpha = clamp(energy * fade, 0.0, 1.0) * uOpacity;\r
  float grain = (hash(gl_FragCoord.xy + fract(uClock) * 97.0) - 0.5) * uGrain;\r
\r
  if (uLight < 0.5) {\r
    vec3 rgb = max(color * alpha * (1.0 + grain * 2.0), 0.0);\r
    if (uOpaque > 0.5) {\r
      outColor = vec4(min(uBackground * (1.0 - alpha) + rgb, 1.0), 1.0);\r
    } else {\r
      outColor = vec4(rgb, alpha);\r
    }\r
  } else {\r
    ink *= fade;\r
    vec3 hue = ink > 0.0001 ? inkColor / ink : palette(0.5);\r
    float body = clamp(ink, 0.0, 1.0);\r
    float haze = clamp(1.0 - exp(-energy * fade * 0.3), 0.0, 1.0) * 0.12;\r
    float focal = smoothstep(2.0, 9.0, energy * fade) * 0.25;\r
    float cover = clamp((body * 0.9 + (haze + focal) * (1.0 - body)) * (1.0 + grain * 2.0), 0.0, 0.95) * uOpacity;\r
    vec3 stroke = hue;\r
    if (uOpaque > 0.5) {\r
      outColor = vec4(mix(uBackground, stroke, cover), 1.0);\r
    } else {\r
      outColor = vec4(stroke * cover, cover);\r
    }\r
  }\r
}\`;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const mod = (value, base) => ((value % base) + base) % base;\r
\r
let probe = null;\r
\r
const parseColor = (value, fallback) => {\r
  if (value === 'transparent') return null;\r
  if (typeof document === 'undefined') return fallback;\r
  if (!probe) probe = document.createElement('canvas').getContext('2d');\r
  if (!probe) return fallback;\r
  probe.fillStyle = '#000000';\r
  probe.fillStyle = value;\r
  const text = probe.fillStyle;\r
  if (text.startsWith('#')) {\r
    const hex = parseInt(text.slice(1), 16);\r
    return [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255];\r
  }\r
  const match = /rgba?\\(([\\d.]+),\\s*([\\d.]+),\\s*([\\d.]+)(?:,\\s*([\\d.]+))?/.exec(text);\r
  if (!match) return fallback;\r
  if (match[4] !== undefined && Number(match[4]) === 0) return null;\r
  return [Number(match[1]) / 255, Number(match[2]) / 255, Number(match[3]) / 255];\r
};\r
\r
const staggerFor = count => Math.min(0.12, 0.9 / Math.max(count - 1, 1));\r
\r
const toThreadSpace = (point, aspect, angle) => {\r
  const qx = (point[0] - 0.5) * aspect;\r
  const qy = 0.5 - point[1];\r
  const cos = Math.cos(angle);\r
  const sin = Math.sin(angle);\r
  return [(qx * cos + qy * sin) / aspect + 0.5, -qx * sin + qy * cos + 0.5];\r
};\r
\r
const threadY = (s, x, index, phase, clock) => {\r
  const lane = s.nodes <= 1 ? x - s.pinch : (x - s.pinch + 0.5) * s.nodes - 0.5;\r
  const side = s.mirror ? (mod(Math.floor(lane), 2) < 0.5 ? -1 : 1) : 1;\r
  const dx = x - s.pinch;\r
  const env =\r
    s.nodes <= 1 ? s.spread * Math.abs(dx) : s.spread * 0.5 * Math.abs(Math.cos(Math.PI * s.nodes * (dx + 0.5)));\r
  const shimmer = s.shimmer ? Math.sin(clock * 1.7 + index * 1.3) * 0.35 : 0;\r
  const angle = x * s.frequency + (phase + (index * TAU) / Math.max(s.count, 1)) * side + shimmer;\r
  return s.position - env * (1 + index * s.taper) * Math.sin(angle);\r
};\r
\r
const compile = (gl, type, source) => {\r
  const shader = gl.createShader(type);\r
  if (!shader) return null;\r
  gl.shaderSource(shader, source);\r
  gl.compileShader(shader);\r
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {\r
    gl.deleteShader(shader);\r
    return null;\r
  }\r
  return shader;\r
};\r
\r
const prefersReduced = () =>\r
  typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);\r
\r
export default function WebThreads({\r
  colors = ['#5227FF', '#FF9FFC'],\r
  coreColor = '#FFFFFF',\r
  backgroundColor = 'transparent',\r
  lightMode = false,\r
  threadCount = 6,\r
  speed = 0.2,\r
  frequency = 5,\r
  spread = 0.18,\r
  taper = 1,\r
  position = 0.5,\r
  pinch = 0.5,\r
  nodes = 1,\r
  angle = 0,\r
  glow = 0.02,\r
  falloff = 0.6,\r
  thickness = 1.1,\r
  brightness = 0.6,\r
  opacity = 1,\r
  depth = 0,\r
  pulses = 0,\r
  mirror = true,\r
  shimmer = false,\r
  fade = 0,\r
  grain = 0.05,\r
  intro = true,\r
  mouseInteraction = true,\r
  mouseStrength = 0.5,\r
  pulseOnClick = true,\r
  paused = false,\r
  dpr = 2,\r
  className = '',\r
  style\r
}) {\r
  const containerRef = useRef(null);\r
  const colorKey = colors.join('|');\r
  const palette = useMemo(\r
    () =>\r
      colorKey\r
        .split('|')\r
        .slice(0, MAX_COLORS)\r
        .map(value => parseColor(value, [1, 1, 1]) ?? [1, 1, 1]),\r
    [colorKey]\r
  );\r
  const core = useMemo(() => parseColor(coreColor, [1, 1, 1]) ?? [1, 1, 1], [coreColor]);\r
  const paper = useMemo(() => parseColor(backgroundColor, null), [backgroundColor]);\r
\r
  const settings = {\r
    palette: palette.length ? palette : [[1, 1, 1]],\r
    core,\r
    paper,\r
    lightMode,\r
    count: clamp(Math.round(threadCount), 1, MAX_THREADS),\r
    speed,\r
    frequency,\r
    spread,\r
    taper,\r
    position,\r
    pinch,\r
    nodes: clamp(Math.round(nodes), 1, 6),\r
    angle: (angle * Math.PI) / 180,\r
    glow: Math.max(0, glow),\r
    falloff: Math.max(0.05, falloff),\r
    thickness: Math.max(0.05, thickness),\r
    brightness: Math.max(0, brightness),\r
    opacity: clamp(opacity, 0, 1),\r
    depth: clamp(depth, 0, 1),\r
    pulses: Math.max(0, pulses),\r
    mirror,\r
    shimmer,\r
    fade: clamp(fade, 0, 1),\r
    grain: typeof grain === 'number' ? Math.max(0, grain) : grain ? 0.05 : 0,\r
    intro,\r
    mouseInteraction,\r
    mouseStrength: clamp(mouseStrength, 0, 1),\r
    pulseOnClick,\r
    paused,\r
    dpr: Math.max(0.5, dpr)\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    if (!container) return undefined;\r
    const canvas = document.createElement('canvas');\r
    canvas.className = CANVAS;\r
    container.appendChild(canvas);\r
    const gl = canvas.getContext('webgl2', {\r
      alpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false,\r
      premultipliedAlpha: true,\r
      powerPreference: 'high-performance'\r
    });\r
    if (!gl) {\r
      canvas.remove();\r
      return undefined;\r
    }\r
\r
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
    const program = gl.createProgram();\r
    if (!vertex || !fragment || !program) {\r
      canvas.remove();\r
      return undefined;\r
    }\r
    gl.attachShader(program, vertex);\r
    gl.attachShader(program, fragment);\r
    gl.bindAttribLocation(program, 0, 'aPosition');\r
    gl.linkProgram(program);\r
    gl.deleteShader(vertex);\r
    gl.deleteShader(fragment);\r
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {\r
      gl.deleteProgram(program);\r
      canvas.remove();\r
      return undefined;\r
    }\r
    const names = [\r
      'uResolution',\r
      'uPhase',\r
      'uClock',\r
      'uCount',\r
      'uFrequency',\r
      'uSpread',\r
      'uTaper',\r
      'uPosition',\r
      'uPinch',\r
      'uNodes',\r
      'uAngle',\r
      'uGlow',\r
      'uFalloff',\r
      'uThickness',\r
      'uBrightness',\r
      'uOpacity',\r
      'uMirror',\r
      'uShimmer',\r
      'uDepth',\r
      'uPulses',\r
      'uFade',\r
      'uGrain',\r
      'uColors',\r
      'uColorCount',\r
      'uCore',\r
      'uBackground',\r
      'uOpaque',\r
      'uLight',\r
      'uIntro',\r
      'uFocus',\r
      'uFocusState',\r
      'uSurges'\r
    ];\r
    const u = {};\r
    names.forEach(name => {\r
      u[name] = gl.getUniformLocation(program, name);\r
    });\r
\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    const buffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    gl.useProgram(program);\r
\r
    const colorData = new Float32Array(MAX_COLORS * 3);\r
    const surgeData = new Float32Array(MAX_SURGES * 4);\r
    const focus = new Float32Array(MAX_THREADS);\r
    const state = {\r
      width: 1,\r
      height: 1,\r
      phase: 0,\r
      clock: 0,\r
      last: 0,\r
      raf: 0,\r
      visible: false,\r
      introAt: -1,\r
      pointer: [0.5, 0.5],\r
      inside: false,\r
      presence: 0,\r
      settle: 0,\r
      target: -1,\r
      surges: [],\r
      quiet: 0,\r
      seen: null\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const ratio = Math.min(window.devicePixelRatio || 1, s.dpr);\r
      const width = Math.max(1, Math.round(container.clientWidth * ratio));\r
      const height = Math.max(1, Math.round(container.clientHeight * ratio));\r
      if (width === state.width && height === state.height) return;\r
      state.quiet = 0;\r
      state.width = width;\r
      state.height = height;\r
      canvas.width = width;\r
      canvas.height = height;\r
    };\r
\r
    const introLength = s => (s.count - 1) * staggerFor(s.count) + STROKE_SECONDS;\r
\r
    const updateFocus = (s, dt, reduced) => {\r
      const wanted = s.mouseInteraction && state.inside;\r
      if (wanted) {\r
        const aspect = state.width / Math.max(state.height, 1);\r
        const [cx, cy] = toThreadSpace(state.pointer, aspect, s.angle);\r
        let best = -1;\r
        let bestDistance = Infinity;\r
        for (let index = 0; index < s.count; index++) {\r
          const distance = Math.abs(threadY(s, cx, index, state.phase, reduced ? 0 : state.clock) - cy);\r
          const reach = index === state.target ? 0.11 : 0.085;\r
          if (distance < reach && distance < bestDistance) {\r
            best = index;\r
            bestDistance = distance;\r
          }\r
        }\r
        state.target = best;\r
      } else {\r
        state.target = -1;\r
      }\r
      const ease = 1 - Math.exp(-dt / 0.22);\r
      let strongest = 0;\r
      for (let index = 0; index < MAX_THREADS; index++) {\r
        const goal = index === state.target ? 1 : 0;\r
        focus[index] += (goal - focus[index]) * ease;\r
        strongest = Math.max(strongest, focus[index]);\r
      }\r
      state.presence += ((wanted ? 1 : 0) - state.presence) * (1 - Math.exp(-dt / 0.3));\r
      const settleGoal = s.mouseStrength * 0.65 * strongest * state.presence;\r
      state.settle += (settleGoal - state.settle) * (1 - Math.exp(-dt / 0.3));\r
      return strongest > 0.002 || state.presence > 0.002 || state.settle > 0.002;\r
    };\r
\r
    const render = reduced => {\r
      const s = settingsRef.current;\r
      const introClock = state.introAt < 0 ? 0 : state.clock - state.introAt;\r
      const introRunning = s.intro && !reduced && introClock < introLength(s);\r
      gl.viewport(0, 0, state.width, state.height);\r
      gl.uniform2f(u.uResolution, state.width, state.height);\r
      gl.uniform1f(u.uPhase, state.phase);\r
      gl.uniform1f(u.uClock, reduced ? 0 : state.clock);\r
      gl.uniform1i(u.uCount, s.count);\r
      gl.uniform1f(u.uFrequency, s.frequency);\r
      gl.uniform1f(u.uSpread, s.spread);\r
      gl.uniform1f(u.uTaper, s.taper);\r
      gl.uniform1f(u.uPosition, s.position);\r
      gl.uniform1f(u.uPinch, s.pinch);\r
      gl.uniform1f(u.uNodes, s.nodes);\r
      gl.uniform2f(u.uAngle, Math.cos(s.angle), Math.sin(s.angle));\r
      gl.uniform1f(u.uGlow, s.glow * Math.sqrt(6 / Math.max(s.count, 6)));\r
      gl.uniform1f(u.uFalloff, s.falloff);\r
      gl.uniform1f(u.uThickness, s.thickness);\r
      gl.uniform1f(u.uBrightness, s.brightness);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.uniform1f(u.uMirror, s.mirror ? 1 : 0);\r
      gl.uniform1f(u.uShimmer, s.shimmer && !reduced ? 1 : 0);\r
      gl.uniform1f(u.uDepth, s.depth);\r
      gl.uniform1f(u.uPulses, s.pulses);\r
      gl.uniform1f(u.uFade, s.fade);\r
      gl.uniform1f(u.uGrain, s.grain);\r
      colorData.fill(0);\r
      s.palette.slice(0, MAX_COLORS).forEach((rgb, index) => colorData.set(rgb, index * 3));\r
      gl.uniform3fv(u.uColors, colorData);\r
      gl.uniform1i(u.uColorCount, Math.min(s.palette.length, MAX_COLORS));\r
      gl.uniform3f(u.uCore, s.core[0], s.core[1], s.core[2]);\r
      const paperColor = s.paper ?? [0, 0, 0];\r
      gl.uniform3f(u.uBackground, paperColor[0], paperColor[1], paperColor[2]);\r
      gl.uniform1f(u.uOpaque, s.paper ? 1 : 0);\r
      gl.uniform1f(u.uLight, s.lightMode ? 1 : 0);\r
      gl.uniform4f(u.uIntro, introClock, staggerFor(s.count), STROKE_SECONDS, introRunning ? 1 : 0);\r
      gl.uniform1fv(u.uFocus, focus);\r
      gl.uniform2f(u.uFocusState, state.presence * (0.4 + 0.6 * s.mouseStrength), state.settle);\r
      surgeData.fill(0);\r
      state.surges.slice(-MAX_SURGES).forEach((surge, index) => {\r
        surgeData.set([surge.x, state.clock - surge.at, surge.direction, 1], index * 4);\r
      });\r
      gl.uniform4fv(u.uSurges, surgeData);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const tick = now => {\r
      state.raf = requestAnimationFrame(tick);\r
      if (!state.visible || document.hidden) {\r
        state.last = now;\r
        return;\r
      }\r
      const s = settingsRef.current;\r
      const dt = state.last ? Math.min((now - state.last) / 1000, 0.1) : 1 / 60;\r
      state.last = now;\r
      const reduced = prefersReduced();\r
      state.clock += dt;\r
      if (state.introAt < 0) state.introAt = state.clock;\r
      if (!s.paused && !reduced) state.phase += dt * s.speed;\r
      const focusing = updateFocus(s, dt, reduced);\r
      state.surges = state.surges.filter(\r
        surge => state.clock - surge.at < SURGE_SECONDS + (s.count - 1) * SURGE_STAGGER\r
      );\r
\r
      const still = s.paused || reduced;\r
      const transient =\r
        state.surges.length > 0 || (s.intro && !reduced && state.clock - state.introAt < introLength(s)) || focusing;\r
      if (state.seen !== s || transient || !still) state.quiet = 0;\r
      else state.quiet += 1;\r
      state.seen = s;\r
      if (state.quiet > 3) return;\r
\r
      resize();\r
      render(reduced);\r
    };\r
\r
    const local = event => {\r
      const rect = container.getBoundingClientRect();\r
      return {\r
        x: (event.clientX - rect.left) / Math.max(rect.width, 1),\r
        y: (event.clientY - rect.top) / Math.max(rect.height, 1),\r
        inside:\r
          event.clientX >= rect.left &&\r
          event.clientX <= rect.right &&\r
          event.clientY >= rect.top &&\r
          event.clientY <= rect.bottom\r
      };\r
    };\r
\r
    const onMove = event => {\r
      const point = local(event);\r
      state.inside = point.inside;\r
      if (point.inside) state.pointer = [point.x, point.y];\r
    };\r
\r
    const onLeave = () => {\r
      state.inside = false;\r
    };\r
\r
    const onDown = event => {\r
      const s = settingsRef.current;\r
      if (!s.pulseOnClick || event.button !== 0 || prefersReduced()) return;\r
      if (\r
        event.target instanceof Element &&\r
        event.target.closest('a, button, input, textarea, select, label, [role="button"]')\r
      )\r
        return;\r
      const point = local(event);\r
      if (!point.inside) return;\r
      const aspect = state.width / Math.max(state.height, 1);\r
      const [x] = toThreadSpace([point.x, point.y], aspect, s.angle);\r
      const direction = x <= s.pinch ? 1 : -1;\r
      state.surges.push({ x, direction, at: state.clock });\r
      if (state.surges.length > MAX_SURGES) state.surges.shift();\r
    };\r
\r
    const visibility = new IntersectionObserver(entries => {\r
      state.visible = entries.some(entry => entry.isIntersecting);\r
    });\r
    visibility.observe(container);\r
    const sizes = new ResizeObserver(resize);\r
    sizes.observe(container);\r
    resize();\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    window.addEventListener('pointerdown', onDown);\r
    document.documentElement.addEventListener('pointerleave', onLeave);\r
    state.raf = requestAnimationFrame(tick);\r
\r
    return () => {\r
      cancelAnimationFrame(state.raf);\r
      visibility.disconnect();\r
      sizes.disconnect();\r
      window.removeEventListener('pointermove', onMove);\r
      window.removeEventListener('pointerdown', onDown);\r
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
      gl.deleteProgram(program);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
      canvas.remove();\r
    };\r
  }, []);\r
\r
  return <div ref={containerRef} className={[ROOT, className].filter(Boolean).join(' ')} style={style} />;\r
}\r
`,r=`.web-threads-container {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.web-threads-canvas {\r
  position: absolute;\r
  inset: 0;\r
  display: block;\r
  width: 100%;\r
  height: 100%;\r
}\r
`,e=`'use client';\r
\r
import { useEffect, useMemo, useRef } from 'react';\r
\r
const ROOT = 'relative h-full w-full overflow-hidden';\r
const CANVAS = 'absolute inset-0 block h-full w-full';\r
\r
const MAX_THREADS = 24;\r
const MAX_COLORS = 6;\r
const MAX_SURGES = 3;\r
const SURGE_SECONDS = 1.6;\r
const SURGE_STAGGER = 0.05;\r
const STROKE_SECONDS = 1.25;\r
const TAU = Math.PI * 2;\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform vec2 uResolution;\r
uniform float uPhase;\r
uniform float uClock;\r
uniform int uCount;\r
uniform float uFrequency;\r
uniform float uSpread;\r
uniform float uTaper;\r
uniform float uPosition;\r
uniform float uPinch;\r
uniform float uNodes;\r
uniform vec2 uAngle;\r
uniform float uGlow;\r
uniform float uFalloff;\r
uniform float uThickness;\r
uniform float uBrightness;\r
uniform float uOpacity;\r
uniform float uMirror;\r
uniform float uShimmer;\r
uniform float uDepth;\r
uniform float uPulses;\r
uniform float uFade;\r
uniform float uGrain;\r
uniform vec3 uColors[\${MAX_COLORS}];\r
uniform int uColorCount;\r
uniform vec3 uCore;\r
uniform vec3 uBackground;\r
uniform float uOpaque;\r
uniform float uLight;\r
uniform vec4 uIntro;\r
uniform float uFocus[\${MAX_THREADS}];\r
uniform vec2 uFocusState;\r
uniform vec4 uSurges[\${MAX_SURGES}];\r
out vec4 outColor;\r
\r
const float PI = 3.14159265;\r
const float TAU = 6.28318530;\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
float easeInOut(float t) {\r
  return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) * 0.5;\r
}\r
\r
vec3 palette(float t) {\r
  if (uColorCount <= 1) return uColors[0];\r
  float scaled = clamp(t, 0.0, 1.0) * float(uColorCount - 1);\r
  int index = int(min(floor(scaled), float(uColorCount - 2)));\r
  return mix(uColors[index], uColors[index + 1], scaled - float(index));\r
}\r
\r
vec2 envelope(float x) {\r
  float dx = x - uPinch;\r
  if (uNodes <= 1.0) return vec2(uSpread * abs(dx), uSpread * sign(dx));\r
  float k = PI * uNodes;\r
  float c = cos(k * (dx + 0.5));\r
  return vec2(uSpread * 0.5 * abs(c), -uSpread * 0.5 * k * sin(k * (dx + 0.5)) * sign(c));\r
}\r
\r
vec2 space(vec2 p, float aspect) {\r
  vec2 q = (p - 0.5) * vec2(aspect, 1.0);\r
  q = vec2(q.x * uAngle.x + q.y * uAngle.y, -q.x * uAngle.y + q.y * uAngle.x);\r
  return vec2(q.x / aspect + 0.5, q.y + 0.5);\r
}\r
\r
float hubAt(float x) {\r
  if (uNodes <= 1.0) return uPinch;\r
  float spacing = 1.0 / uNodes;\r
  return uPinch - 0.5 + (floor((x - uPinch + 0.5) / spacing) + 0.5) * spacing;\r
}\r
\r
vec3 thread(float x, float i, float n) {\r
  float lane = uNodes <= 1.0 ? x - uPinch : (x - uPinch + 0.5) * uNodes - 0.5;\r
  float side = uMirror > 0.5 ? (mod(floor(lane), 2.0) < 0.5 ? -1.0 : 1.0) : 1.0;\r
  vec2 env = envelope(x);\r
  float amp = 1.0 + i * uTaper;\r
  float shimmer = uShimmer > 0.5 ? sin(uClock * 1.7 + i * 1.3) * 0.35 : 0.0;\r
  float angle = x * uFrequency + (uPhase + i * TAU / max(n, 1.0)) * side + shimmer;\r
  float wave = sin(angle);\r
  float y = uPosition - env.x * amp * wave;\r
  float slope = -(env.y * amp * wave + env.x * amp * cos(angle) * uFrequency);\r
  return vec3(y, slope, angle);\r
}\r
\r
void main() {\r
  vec2 p = gl_FragCoord.xy / uResolution;\r
  float aspect = uResolution.x / uResolution.y;\r
  vec2 s = space(p, aspect);\r
  float x = s.x;\r
  float y = s.y;\r
  float n = float(uCount);\r
  float pixel = 1.0 / uResolution.y;\r
  float hub = hubAt(x);\r
  float presence = uFocusState.x;\r
  float settle = uFocusState.y;\r
\r
  vec3 color = vec3(0.0);\r
  float energy = 0.0;\r
  float ink = 0.0;\r
  vec3 inkColor = vec3(0.0);\r
\r
  for (int idx = 0; idx < \${MAX_THREADS}; idx++) {\r
    if (idx >= uCount) break;\r
    float i = float(idx);\r
    float ci = n > 1.0 ? i / (n - 1.0) : 0.0;\r
\r
    float head = 2.0;\r
    float bead = 0.0;\r
    float born = 1.0;\r
    if (uIntro.w > 0.5) {\r
      float progress = clamp((uIntro.x - i * uIntro.y) / uIntro.z, 0.0, 1.0);\r
      head = mix(-0.06, 1.06, easeInOut(progress));\r
      bead = sin(PI * progress);\r
      born = progress > 0.0 ? smoothstep(-0.05, 0.03, head) : 0.0;\r
    }\r
    if (born <= 0.0) continue;\r
\r
    bool tip = x > head;\r
    vec3 lead = bead > 0.0 || tip ? thread(head, i, n) : vec3(0.0);\r
    vec3 t = tip ? lead : thread(x, i, n);\r
\r
    float focus = uFocus[idx];\r
    float spot = tip ? head : x;\r
    float twist = uDepth * smoothstep(0.0, 0.07, abs(spot - hubAt(spot)));\r
    float depth = 0.5 + 0.5 * cos(t.z);\r
    float front = mix(1.0, 0.3 + 0.7 * depth, twist);\r
    float width = uThickness * mix(1.0, 0.55 + 0.7 * depth, twist) * (1.0 + 0.3 * focus * presence);\r
\r
    float d;\r
    if (tip) {\r
      float back = head - 0.02;\r
      vec2 a = vec2(back * aspect, thread(back, i, n).x);\r
      vec2 b = vec2(head * aspect, lead.x);\r
      vec2 pa = vec2(x * aspect, y) - a;\r
      vec2 ba = b - a;\r
      d = length(pa - ba * clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0));\r
    } else {\r
      float bend = t.y * smoothstep(0.0, 0.04, abs(x - hub));\r
      d = abs(y - t.x) / sqrt(1.0 + bend * bend / (aspect * aspect));\r
    }\r
    float g = uGlow / pow(max(d / width, pixel * 0.35), uFalloff) * front * born;\r
    float onLine = exp(-d / (width * 0.012));\r
\r
    if (bead > 0.0) {\r
      vec2 near = vec2((x - head) * aspect, y - lead.x);\r
      g *= 1.0 + bead * 1.6 * exp(-dot(near, near) / 0.0025);\r
    }\r
\r
    float light = 0.0;\r
    for (int k = 0; k < \${MAX_SURGES}; k++) {\r
      vec4 surge = uSurges[k];\r
      if (surge.w <= 0.0) continue;\r
      float progress = clamp((surge.y - i * \${SURGE_STAGGER.toFixed(3)}) / \${SURGE_SECONDS.toFixed(2)}, 0.0, 1.0);\r
      if (progress <= 0.0 || progress >= 1.0) continue;\r
      float lead = mix(surge.x, surge.z > 0.0 ? 1.12 : -0.12, easeInOut(progress));\r
      float along = (x - lead) * surge.z * aspect;\r
      float trail = along < 0.0 ? exp(along / 0.24) : exp(-along * along / 0.0009);\r
      light += trail * sin(PI * progress);\r
    }\r
    g *= 1.0 + light * (0.12 + 2.8 * onLine);\r
\r
    if (uPulses > 0.0) {\r
      float travel = abs(x - hub);\r
      float pulse = pow(0.5 + 0.5 * sin(travel * 16.0 + uClock * 2.2 + i * 1.9), 24.0);\r
      g *= 1.0 + uPulses * 5.0 * pulse * onLine;\r
    }\r
\r
    float sheen = pow(0.5 + 0.5 * sin(abs(x - hub) * 11.0 + uClock * 1.4), 10.0);\r
    float lift = focus * presence;\r
    g *= (1.0 - settle * (1.0 - focus)) * (1.0 + lift * (0.9 + 1.4 * sheen * onLine));\r
\r
    vec3 tint = mix(palette(ci), uCore, 0.3 * lift);\r
    color += g * tint;\r
    energy += g;\r
    float stroke = smoothstep(0.45, 1.3, g);\r
    inkColor += tint * stroke;\r
    ink += stroke;\r
  }\r
\r
  float fade = 1.0;\r
  if (uFade > 0.0) {\r
    float edge = min(x, 1.0 - x);\r
    float f = clamp(edge / max(uFade * 0.5, 0.001), 0.0, 1.0);\r
    fade = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);\r
  }\r
  float core = smoothstep(0.5, 2.2, energy);\r
  color = mix(color, uCore * energy, core * 0.5);\r
  color *= uBrightness * fade;\r
  float alpha = clamp(energy * fade, 0.0, 1.0) * uOpacity;\r
  float grain = (hash(gl_FragCoord.xy + fract(uClock) * 97.0) - 0.5) * uGrain;\r
\r
  if (uLight < 0.5) {\r
    vec3 rgb = max(color * alpha * (1.0 + grain * 2.0), 0.0);\r
    if (uOpaque > 0.5) {\r
      outColor = vec4(min(uBackground * (1.0 - alpha) + rgb, 1.0), 1.0);\r
    } else {\r
      outColor = vec4(rgb, alpha);\r
    }\r
  } else {\r
    ink *= fade;\r
    vec3 hue = ink > 0.0001 ? inkColor / ink : palette(0.5);\r
    float body = clamp(ink, 0.0, 1.0);\r
    float haze = clamp(1.0 - exp(-energy * fade * 0.3), 0.0, 1.0) * 0.12;\r
    float focal = smoothstep(2.0, 9.0, energy * fade) * 0.25;\r
    float cover = clamp((body * 0.9 + (haze + focal) * (1.0 - body)) * (1.0 + grain * 2.0), 0.0, 0.95) * uOpacity;\r
    vec3 stroke = hue;\r
    if (uOpaque > 0.5) {\r
      outColor = vec4(mix(uBackground, stroke, cover), 1.0);\r
    } else {\r
      outColor = vec4(stroke * cover, cover);\r
    }\r
  }\r
}\`;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const mod = (value, base) => ((value % base) + base) % base;\r
\r
let probe = null;\r
\r
const parseColor = (value, fallback) => {\r
  if (value === 'transparent') return null;\r
  if (typeof document === 'undefined') return fallback;\r
  if (!probe) probe = document.createElement('canvas').getContext('2d');\r
  if (!probe) return fallback;\r
  probe.fillStyle = '#000000';\r
  probe.fillStyle = value;\r
  const text = probe.fillStyle;\r
  if (text.startsWith('#')) {\r
    const hex = parseInt(text.slice(1), 16);\r
    return [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255];\r
  }\r
  const match = /rgba?\\(([\\d.]+),\\s*([\\d.]+),\\s*([\\d.]+)(?:,\\s*([\\d.]+))?/.exec(text);\r
  if (!match) return fallback;\r
  if (match[4] !== undefined && Number(match[4]) === 0) return null;\r
  return [Number(match[1]) / 255, Number(match[2]) / 255, Number(match[3]) / 255];\r
};\r
\r
const staggerFor = count => Math.min(0.12, 0.9 / Math.max(count - 1, 1));\r
\r
const toThreadSpace = (point, aspect, angle) => {\r
  const qx = (point[0] - 0.5) * aspect;\r
  const qy = 0.5 - point[1];\r
  const cos = Math.cos(angle);\r
  const sin = Math.sin(angle);\r
  return [(qx * cos + qy * sin) / aspect + 0.5, -qx * sin + qy * cos + 0.5];\r
};\r
\r
const threadY = (s, x, index, phase, clock) => {\r
  const lane = s.nodes <= 1 ? x - s.pinch : (x - s.pinch + 0.5) * s.nodes - 0.5;\r
  const side = s.mirror ? (mod(Math.floor(lane), 2) < 0.5 ? -1 : 1) : 1;\r
  const dx = x - s.pinch;\r
  const env =\r
    s.nodes <= 1 ? s.spread * Math.abs(dx) : s.spread * 0.5 * Math.abs(Math.cos(Math.PI * s.nodes * (dx + 0.5)));\r
  const shimmer = s.shimmer ? Math.sin(clock * 1.7 + index * 1.3) * 0.35 : 0;\r
  const angle = x * s.frequency + (phase + (index * TAU) / Math.max(s.count, 1)) * side + shimmer;\r
  return s.position - env * (1 + index * s.taper) * Math.sin(angle);\r
};\r
\r
const compile = (gl, type, source) => {\r
  const shader = gl.createShader(type);\r
  if (!shader) return null;\r
  gl.shaderSource(shader, source);\r
  gl.compileShader(shader);\r
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {\r
    gl.deleteShader(shader);\r
    return null;\r
  }\r
  return shader;\r
};\r
\r
const prefersReduced = () =>\r
  typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);\r
\r
export default function WebThreads({\r
  colors = ['#5227FF', '#FF9FFC'],\r
  coreColor = '#FFFFFF',\r
  backgroundColor = 'transparent',\r
  lightMode = false,\r
  threadCount = 6,\r
  speed = 0.2,\r
  frequency = 5,\r
  spread = 0.18,\r
  taper = 1,\r
  position = 0.5,\r
  pinch = 0.5,\r
  nodes = 1,\r
  angle = 0,\r
  glow = 0.02,\r
  falloff = 0.6,\r
  thickness = 1.1,\r
  brightness = 0.6,\r
  opacity = 1,\r
  depth = 0,\r
  pulses = 0,\r
  mirror = true,\r
  shimmer = false,\r
  fade = 0,\r
  grain = 0.05,\r
  intro = true,\r
  mouseInteraction = true,\r
  mouseStrength = 0.5,\r
  pulseOnClick = true,\r
  paused = false,\r
  dpr = 2,\r
  className = '',\r
  style\r
}) {\r
  const containerRef = useRef(null);\r
  const colorKey = colors.join('|');\r
  const palette = useMemo(\r
    () =>\r
      colorKey\r
        .split('|')\r
        .slice(0, MAX_COLORS)\r
        .map(value => parseColor(value, [1, 1, 1]) ?? [1, 1, 1]),\r
    [colorKey]\r
  );\r
  const core = useMemo(() => parseColor(coreColor, [1, 1, 1]) ?? [1, 1, 1], [coreColor]);\r
  const paper = useMemo(() => parseColor(backgroundColor, null), [backgroundColor]);\r
\r
  const settings = {\r
    palette: palette.length ? palette : [[1, 1, 1]],\r
    core,\r
    paper,\r
    lightMode,\r
    count: clamp(Math.round(threadCount), 1, MAX_THREADS),\r
    speed,\r
    frequency,\r
    spread,\r
    taper,\r
    position,\r
    pinch,\r
    nodes: clamp(Math.round(nodes), 1, 6),\r
    angle: (angle * Math.PI) / 180,\r
    glow: Math.max(0, glow),\r
    falloff: Math.max(0.05, falloff),\r
    thickness: Math.max(0.05, thickness),\r
    brightness: Math.max(0, brightness),\r
    opacity: clamp(opacity, 0, 1),\r
    depth: clamp(depth, 0, 1),\r
    pulses: Math.max(0, pulses),\r
    mirror,\r
    shimmer,\r
    fade: clamp(fade, 0, 1),\r
    grain: typeof grain === 'number' ? Math.max(0, grain) : grain ? 0.05 : 0,\r
    intro,\r
    mouseInteraction,\r
    mouseStrength: clamp(mouseStrength, 0, 1),\r
    pulseOnClick,\r
    paused,\r
    dpr: Math.max(0.5, dpr)\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    if (!container) return undefined;\r
    const canvas = document.createElement('canvas');\r
    canvas.className = CANVAS;\r
    container.appendChild(canvas);\r
    const gl = canvas.getContext('webgl2', {\r
      alpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false,\r
      premultipliedAlpha: true,\r
      powerPreference: 'high-performance'\r
    });\r
    if (!gl) {\r
      canvas.remove();\r
      return undefined;\r
    }\r
\r
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
    const program = gl.createProgram();\r
    if (!vertex || !fragment || !program) {\r
      canvas.remove();\r
      return undefined;\r
    }\r
    gl.attachShader(program, vertex);\r
    gl.attachShader(program, fragment);\r
    gl.bindAttribLocation(program, 0, 'aPosition');\r
    gl.linkProgram(program);\r
    gl.deleteShader(vertex);\r
    gl.deleteShader(fragment);\r
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {\r
      gl.deleteProgram(program);\r
      canvas.remove();\r
      return undefined;\r
    }\r
    const names = [\r
      'uResolution',\r
      'uPhase',\r
      'uClock',\r
      'uCount',\r
      'uFrequency',\r
      'uSpread',\r
      'uTaper',\r
      'uPosition',\r
      'uPinch',\r
      'uNodes',\r
      'uAngle',\r
      'uGlow',\r
      'uFalloff',\r
      'uThickness',\r
      'uBrightness',\r
      'uOpacity',\r
      'uMirror',\r
      'uShimmer',\r
      'uDepth',\r
      'uPulses',\r
      'uFade',\r
      'uGrain',\r
      'uColors',\r
      'uColorCount',\r
      'uCore',\r
      'uBackground',\r
      'uOpaque',\r
      'uLight',\r
      'uIntro',\r
      'uFocus',\r
      'uFocusState',\r
      'uSurges'\r
    ];\r
    const u = {};\r
    names.forEach(name => {\r
      u[name] = gl.getUniformLocation(program, name);\r
    });\r
\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    const buffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    gl.useProgram(program);\r
\r
    const colorData = new Float32Array(MAX_COLORS * 3);\r
    const surgeData = new Float32Array(MAX_SURGES * 4);\r
    const focus = new Float32Array(MAX_THREADS);\r
    const state = {\r
      width: 1,\r
      height: 1,\r
      phase: 0,\r
      clock: 0,\r
      last: 0,\r
      raf: 0,\r
      visible: false,\r
      introAt: -1,\r
      pointer: [0.5, 0.5],\r
      inside: false,\r
      presence: 0,\r
      settle: 0,\r
      target: -1,\r
      surges: [],\r
      quiet: 0,\r
      seen: null\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const ratio = Math.min(window.devicePixelRatio || 1, s.dpr);\r
      const width = Math.max(1, Math.round(container.clientWidth * ratio));\r
      const height = Math.max(1, Math.round(container.clientHeight * ratio));\r
      if (width === state.width && height === state.height) return;\r
      state.quiet = 0;\r
      state.width = width;\r
      state.height = height;\r
      canvas.width = width;\r
      canvas.height = height;\r
    };\r
\r
    const introLength = s => (s.count - 1) * staggerFor(s.count) + STROKE_SECONDS;\r
\r
    const updateFocus = (s, dt, reduced) => {\r
      const wanted = s.mouseInteraction && state.inside;\r
      if (wanted) {\r
        const aspect = state.width / Math.max(state.height, 1);\r
        const [cx, cy] = toThreadSpace(state.pointer, aspect, s.angle);\r
        let best = -1;\r
        let bestDistance = Infinity;\r
        for (let index = 0; index < s.count; index++) {\r
          const distance = Math.abs(threadY(s, cx, index, state.phase, reduced ? 0 : state.clock) - cy);\r
          const reach = index === state.target ? 0.11 : 0.085;\r
          if (distance < reach && distance < bestDistance) {\r
            best = index;\r
            bestDistance = distance;\r
          }\r
        }\r
        state.target = best;\r
      } else {\r
        state.target = -1;\r
      }\r
      const ease = 1 - Math.exp(-dt / 0.22);\r
      let strongest = 0;\r
      for (let index = 0; index < MAX_THREADS; index++) {\r
        const goal = index === state.target ? 1 : 0;\r
        focus[index] += (goal - focus[index]) * ease;\r
        strongest = Math.max(strongest, focus[index]);\r
      }\r
      state.presence += ((wanted ? 1 : 0) - state.presence) * (1 - Math.exp(-dt / 0.3));\r
      const settleGoal = s.mouseStrength * 0.65 * strongest * state.presence;\r
      state.settle += (settleGoal - state.settle) * (1 - Math.exp(-dt / 0.3));\r
      return strongest > 0.002 || state.presence > 0.002 || state.settle > 0.002;\r
    };\r
\r
    const render = reduced => {\r
      const s = settingsRef.current;\r
      const introClock = state.introAt < 0 ? 0 : state.clock - state.introAt;\r
      const introRunning = s.intro && !reduced && introClock < introLength(s);\r
      gl.viewport(0, 0, state.width, state.height);\r
      gl.uniform2f(u.uResolution, state.width, state.height);\r
      gl.uniform1f(u.uPhase, state.phase);\r
      gl.uniform1f(u.uClock, reduced ? 0 : state.clock);\r
      gl.uniform1i(u.uCount, s.count);\r
      gl.uniform1f(u.uFrequency, s.frequency);\r
      gl.uniform1f(u.uSpread, s.spread);\r
      gl.uniform1f(u.uTaper, s.taper);\r
      gl.uniform1f(u.uPosition, s.position);\r
      gl.uniform1f(u.uPinch, s.pinch);\r
      gl.uniform1f(u.uNodes, s.nodes);\r
      gl.uniform2f(u.uAngle, Math.cos(s.angle), Math.sin(s.angle));\r
      gl.uniform1f(u.uGlow, s.glow * Math.sqrt(6 / Math.max(s.count, 6)));\r
      gl.uniform1f(u.uFalloff, s.falloff);\r
      gl.uniform1f(u.uThickness, s.thickness);\r
      gl.uniform1f(u.uBrightness, s.brightness);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.uniform1f(u.uMirror, s.mirror ? 1 : 0);\r
      gl.uniform1f(u.uShimmer, s.shimmer && !reduced ? 1 : 0);\r
      gl.uniform1f(u.uDepth, s.depth);\r
      gl.uniform1f(u.uPulses, s.pulses);\r
      gl.uniform1f(u.uFade, s.fade);\r
      gl.uniform1f(u.uGrain, s.grain);\r
      colorData.fill(0);\r
      s.palette.slice(0, MAX_COLORS).forEach((rgb, index) => colorData.set(rgb, index * 3));\r
      gl.uniform3fv(u.uColors, colorData);\r
      gl.uniform1i(u.uColorCount, Math.min(s.palette.length, MAX_COLORS));\r
      gl.uniform3f(u.uCore, s.core[0], s.core[1], s.core[2]);\r
      const paperColor = s.paper ?? [0, 0, 0];\r
      gl.uniform3f(u.uBackground, paperColor[0], paperColor[1], paperColor[2]);\r
      gl.uniform1f(u.uOpaque, s.paper ? 1 : 0);\r
      gl.uniform1f(u.uLight, s.lightMode ? 1 : 0);\r
      gl.uniform4f(u.uIntro, introClock, staggerFor(s.count), STROKE_SECONDS, introRunning ? 1 : 0);\r
      gl.uniform1fv(u.uFocus, focus);\r
      gl.uniform2f(u.uFocusState, state.presence * (0.4 + 0.6 * s.mouseStrength), state.settle);\r
      surgeData.fill(0);\r
      state.surges.slice(-MAX_SURGES).forEach((surge, index) => {\r
        surgeData.set([surge.x, state.clock - surge.at, surge.direction, 1], index * 4);\r
      });\r
      gl.uniform4fv(u.uSurges, surgeData);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const tick = now => {\r
      state.raf = requestAnimationFrame(tick);\r
      if (!state.visible || document.hidden) {\r
        state.last = now;\r
        return;\r
      }\r
      const s = settingsRef.current;\r
      const dt = state.last ? Math.min((now - state.last) / 1000, 0.1) : 1 / 60;\r
      state.last = now;\r
      const reduced = prefersReduced();\r
      state.clock += dt;\r
      if (state.introAt < 0) state.introAt = state.clock;\r
      if (!s.paused && !reduced) state.phase += dt * s.speed;\r
      const focusing = updateFocus(s, dt, reduced);\r
      state.surges = state.surges.filter(\r
        surge => state.clock - surge.at < SURGE_SECONDS + (s.count - 1) * SURGE_STAGGER\r
      );\r
\r
      const still = s.paused || reduced;\r
      const transient =\r
        state.surges.length > 0 || (s.intro && !reduced && state.clock - state.introAt < introLength(s)) || focusing;\r
      if (state.seen !== s || transient || !still) state.quiet = 0;\r
      else state.quiet += 1;\r
      state.seen = s;\r
      if (state.quiet > 3) return;\r
\r
      resize();\r
      render(reduced);\r
    };\r
\r
    const local = event => {\r
      const rect = container.getBoundingClientRect();\r
      return {\r
        x: (event.clientX - rect.left) / Math.max(rect.width, 1),\r
        y: (event.clientY - rect.top) / Math.max(rect.height, 1),\r
        inside:\r
          event.clientX >= rect.left &&\r
          event.clientX <= rect.right &&\r
          event.clientY >= rect.top &&\r
          event.clientY <= rect.bottom\r
      };\r
    };\r
\r
    const onMove = event => {\r
      const point = local(event);\r
      state.inside = point.inside;\r
      if (point.inside) state.pointer = [point.x, point.y];\r
    };\r
\r
    const onLeave = () => {\r
      state.inside = false;\r
    };\r
\r
    const onDown = event => {\r
      const s = settingsRef.current;\r
      if (!s.pulseOnClick || event.button !== 0 || prefersReduced()) return;\r
      if (\r
        event.target instanceof Element &&\r
        event.target.closest('a, button, input, textarea, select, label, [role="button"]')\r
      )\r
        return;\r
      const point = local(event);\r
      if (!point.inside) return;\r
      const aspect = state.width / Math.max(state.height, 1);\r
      const [x] = toThreadSpace([point.x, point.y], aspect, s.angle);\r
      const direction = x <= s.pinch ? 1 : -1;\r
      state.surges.push({ x, direction, at: state.clock });\r
      if (state.surges.length > MAX_SURGES) state.surges.shift();\r
    };\r
\r
    const visibility = new IntersectionObserver(entries => {\r
      state.visible = entries.some(entry => entry.isIntersecting);\r
    });\r
    visibility.observe(container);\r
    const sizes = new ResizeObserver(resize);\r
    sizes.observe(container);\r
    resize();\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    window.addEventListener('pointerdown', onDown);\r
    document.documentElement.addEventListener('pointerleave', onLeave);\r
    state.raf = requestAnimationFrame(tick);\r
\r
    return () => {\r
      cancelAnimationFrame(state.raf);\r
      visibility.disconnect();\r
      sizes.disconnect();\r
      window.removeEventListener('pointermove', onMove);\r
      window.removeEventListener('pointerdown', onDown);\r
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
      gl.deleteProgram(program);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
      canvas.remove();\r
    };\r
  }, []);\r
\r
  return <div ref={containerRef} className={[ROOT, className].filter(Boolean).join(' ')} style={style} />;\r
}\r
`,t=`'use client';\r
\r
import { useEffect, useMemo, useRef, type CSSProperties } from 'react';\r
import './WebThreads.css';\r
\r
export interface WebThreadsProps {\r
  colors?: string[];\r
  coreColor?: string;\r
  backgroundColor?: string;\r
  lightMode?: boolean;\r
  threadCount?: number;\r
  speed?: number;\r
  frequency?: number;\r
  spread?: number;\r
  taper?: number;\r
  position?: number;\r
  pinch?: number;\r
  nodes?: number;\r
  angle?: number;\r
  glow?: number;\r
  falloff?: number;\r
  thickness?: number;\r
  brightness?: number;\r
  opacity?: number;\r
  depth?: number;\r
  pulses?: number;\r
  mirror?: boolean;\r
  shimmer?: boolean;\r
  fade?: number;\r
  grain?: number;\r
  intro?: boolean;\r
  mouseInteraction?: boolean;\r
  mouseStrength?: number;\r
  pulseOnClick?: boolean;\r
  paused?: boolean;\r
  dpr?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
type RGB = [number, number, number];\r
\r
interface Surge {\r
  x: number;\r
  direction: number;\r
  at: number;\r
}\r
\r
interface Shape {\r
  nodes: number;\r
  pinch: number;\r
  mirror: boolean;\r
  spread: number;\r
  shimmer: boolean;\r
  frequency: number;\r
  count: number;\r
  taper: number;\r
  position: number;\r
}\r
\r
const ROOT = 'web-threads-container';\r
const CANVAS = 'web-threads-canvas';\r
\r
const MAX_THREADS = 24;\r
const MAX_COLORS = 6;\r
const MAX_SURGES = 3;\r
const SURGE_SECONDS = 1.6;\r
const SURGE_STAGGER = 0.05;\r
const STROKE_SECONDS = 1.25;\r
const TAU = Math.PI * 2;\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform vec2 uResolution;\r
uniform float uPhase;\r
uniform float uClock;\r
uniform int uCount;\r
uniform float uFrequency;\r
uniform float uSpread;\r
uniform float uTaper;\r
uniform float uPosition;\r
uniform float uPinch;\r
uniform float uNodes;\r
uniform vec2 uAngle;\r
uniform float uGlow;\r
uniform float uFalloff;\r
uniform float uThickness;\r
uniform float uBrightness;\r
uniform float uOpacity;\r
uniform float uMirror;\r
uniform float uShimmer;\r
uniform float uDepth;\r
uniform float uPulses;\r
uniform float uFade;\r
uniform float uGrain;\r
uniform vec3 uColors[\${MAX_COLORS}];\r
uniform int uColorCount;\r
uniform vec3 uCore;\r
uniform vec3 uBackground;\r
uniform float uOpaque;\r
uniform float uLight;\r
uniform vec4 uIntro;\r
uniform float uFocus[\${MAX_THREADS}];\r
uniform vec2 uFocusState;\r
uniform vec4 uSurges[\${MAX_SURGES}];\r
out vec4 outColor;\r
\r
const float PI = 3.14159265;\r
const float TAU = 6.28318530;\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
float easeInOut(float t) {\r
  return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) * 0.5;\r
}\r
\r
vec3 palette(float t) {\r
  if (uColorCount <= 1) return uColors[0];\r
  float scaled = clamp(t, 0.0, 1.0) * float(uColorCount - 1);\r
  int index = int(min(floor(scaled), float(uColorCount - 2)));\r
  return mix(uColors[index], uColors[index + 1], scaled - float(index));\r
}\r
\r
vec2 envelope(float x) {\r
  float dx = x - uPinch;\r
  if (uNodes <= 1.0) return vec2(uSpread * abs(dx), uSpread * sign(dx));\r
  float k = PI * uNodes;\r
  float c = cos(k * (dx + 0.5));\r
  return vec2(uSpread * 0.5 * abs(c), -uSpread * 0.5 * k * sin(k * (dx + 0.5)) * sign(c));\r
}\r
\r
vec2 space(vec2 p, float aspect) {\r
  vec2 q = (p - 0.5) * vec2(aspect, 1.0);\r
  q = vec2(q.x * uAngle.x + q.y * uAngle.y, -q.x * uAngle.y + q.y * uAngle.x);\r
  return vec2(q.x / aspect + 0.5, q.y + 0.5);\r
}\r
\r
float hubAt(float x) {\r
  if (uNodes <= 1.0) return uPinch;\r
  float spacing = 1.0 / uNodes;\r
  return uPinch - 0.5 + (floor((x - uPinch + 0.5) / spacing) + 0.5) * spacing;\r
}\r
\r
vec3 thread(float x, float i, float n) {\r
  float lane = uNodes <= 1.0 ? x - uPinch : (x - uPinch + 0.5) * uNodes - 0.5;\r
  float side = uMirror > 0.5 ? (mod(floor(lane), 2.0) < 0.5 ? -1.0 : 1.0) : 1.0;\r
  vec2 env = envelope(x);\r
  float amp = 1.0 + i * uTaper;\r
  float shimmer = uShimmer > 0.5 ? sin(uClock * 1.7 + i * 1.3) * 0.35 : 0.0;\r
  float angle = x * uFrequency + (uPhase + i * TAU / max(n, 1.0)) * side + shimmer;\r
  float wave = sin(angle);\r
  float y = uPosition - env.x * amp * wave;\r
  float slope = -(env.y * amp * wave + env.x * amp * cos(angle) * uFrequency);\r
  return vec3(y, slope, angle);\r
}\r
\r
void main() {\r
  vec2 p = gl_FragCoord.xy / uResolution;\r
  float aspect = uResolution.x / uResolution.y;\r
  vec2 s = space(p, aspect);\r
  float x = s.x;\r
  float y = s.y;\r
  float n = float(uCount);\r
  float pixel = 1.0 / uResolution.y;\r
  float hub = hubAt(x);\r
  float presence = uFocusState.x;\r
  float settle = uFocusState.y;\r
\r
  vec3 color = vec3(0.0);\r
  float energy = 0.0;\r
  float ink = 0.0;\r
  vec3 inkColor = vec3(0.0);\r
\r
  for (int idx = 0; idx < \${MAX_THREADS}; idx++) {\r
    if (idx >= uCount) break;\r
    float i = float(idx);\r
    float ci = n > 1.0 ? i / (n - 1.0) : 0.0;\r
\r
    float head = 2.0;\r
    float bead = 0.0;\r
    float born = 1.0;\r
    if (uIntro.w > 0.5) {\r
      float progress = clamp((uIntro.x - i * uIntro.y) / uIntro.z, 0.0, 1.0);\r
      head = mix(-0.06, 1.06, easeInOut(progress));\r
      bead = sin(PI * progress);\r
      born = progress > 0.0 ? smoothstep(-0.05, 0.03, head) : 0.0;\r
    }\r
    if (born <= 0.0) continue;\r
\r
    bool tip = x > head;\r
    vec3 lead = bead > 0.0 || tip ? thread(head, i, n) : vec3(0.0);\r
    vec3 t = tip ? lead : thread(x, i, n);\r
\r
    float focus = uFocus[idx];\r
    float spot = tip ? head : x;\r
    float twist = uDepth * smoothstep(0.0, 0.07, abs(spot - hubAt(spot)));\r
    float depth = 0.5 + 0.5 * cos(t.z);\r
    float front = mix(1.0, 0.3 + 0.7 * depth, twist);\r
    float width = uThickness * mix(1.0, 0.55 + 0.7 * depth, twist) * (1.0 + 0.3 * focus * presence);\r
\r
    float d;\r
    if (tip) {\r
      float back = head - 0.02;\r
      vec2 a = vec2(back * aspect, thread(back, i, n).x);\r
      vec2 b = vec2(head * aspect, lead.x);\r
      vec2 pa = vec2(x * aspect, y) - a;\r
      vec2 ba = b - a;\r
      d = length(pa - ba * clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0));\r
    } else {\r
      float bend = t.y * smoothstep(0.0, 0.04, abs(x - hub));\r
      d = abs(y - t.x) / sqrt(1.0 + bend * bend / (aspect * aspect));\r
    }\r
    float g = uGlow / pow(max(d / width, pixel * 0.35), uFalloff) * front * born;\r
    float onLine = exp(-d / (width * 0.012));\r
\r
    if (bead > 0.0) {\r
      vec2 near = vec2((x - head) * aspect, y - lead.x);\r
      g *= 1.0 + bead * 1.6 * exp(-dot(near, near) / 0.0025);\r
    }\r
\r
    float light = 0.0;\r
    for (int k = 0; k < \${MAX_SURGES}; k++) {\r
      vec4 surge = uSurges[k];\r
      if (surge.w <= 0.0) continue;\r
      float progress = clamp((surge.y - i * \${SURGE_STAGGER.toFixed(3)}) / \${SURGE_SECONDS.toFixed(2)}, 0.0, 1.0);\r
      if (progress <= 0.0 || progress >= 1.0) continue;\r
      float lead = mix(surge.x, surge.z > 0.0 ? 1.12 : -0.12, easeInOut(progress));\r
      float along = (x - lead) * surge.z * aspect;\r
      float trail = along < 0.0 ? exp(along / 0.24) : exp(-along * along / 0.0009);\r
      light += trail * sin(PI * progress);\r
    }\r
    g *= 1.0 + light * (0.12 + 2.8 * onLine);\r
\r
    if (uPulses > 0.0) {\r
      float travel = abs(x - hub);\r
      float pulse = pow(0.5 + 0.5 * sin(travel * 16.0 + uClock * 2.2 + i * 1.9), 24.0);\r
      g *= 1.0 + uPulses * 5.0 * pulse * onLine;\r
    }\r
\r
    float sheen = pow(0.5 + 0.5 * sin(abs(x - hub) * 11.0 + uClock * 1.4), 10.0);\r
    float lift = focus * presence;\r
    g *= (1.0 - settle * (1.0 - focus)) * (1.0 + lift * (0.9 + 1.4 * sheen * onLine));\r
\r
    vec3 tint = mix(palette(ci), uCore, 0.3 * lift);\r
    color += g * tint;\r
    energy += g;\r
    float stroke = smoothstep(0.45, 1.3, g);\r
    inkColor += tint * stroke;\r
    ink += stroke;\r
  }\r
\r
  float fade = 1.0;\r
  if (uFade > 0.0) {\r
    float edge = min(x, 1.0 - x);\r
    float f = clamp(edge / max(uFade * 0.5, 0.001), 0.0, 1.0);\r
    fade = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);\r
  }\r
  float core = smoothstep(0.5, 2.2, energy);\r
  color = mix(color, uCore * energy, core * 0.5);\r
  color *= uBrightness * fade;\r
  float alpha = clamp(energy * fade, 0.0, 1.0) * uOpacity;\r
  float grain = (hash(gl_FragCoord.xy + fract(uClock) * 97.0) - 0.5) * uGrain;\r
\r
  if (uLight < 0.5) {\r
    vec3 rgb = max(color * alpha * (1.0 + grain * 2.0), 0.0);\r
    if (uOpaque > 0.5) {\r
      outColor = vec4(min(uBackground * (1.0 - alpha) + rgb, 1.0), 1.0);\r
    } else {\r
      outColor = vec4(rgb, alpha);\r
    }\r
  } else {\r
    ink *= fade;\r
    vec3 hue = ink > 0.0001 ? inkColor / ink : palette(0.5);\r
    float body = clamp(ink, 0.0, 1.0);\r
    float haze = clamp(1.0 - exp(-energy * fade * 0.3), 0.0, 1.0) * 0.12;\r
    float focal = smoothstep(2.0, 9.0, energy * fade) * 0.25;\r
    float cover = clamp((body * 0.9 + (haze + focal) * (1.0 - body)) * (1.0 + grain * 2.0), 0.0, 0.95) * uOpacity;\r
    vec3 stroke = hue;\r
    if (uOpaque > 0.5) {\r
      outColor = vec4(mix(uBackground, stroke, cover), 1.0);\r
    } else {\r
      outColor = vec4(stroke * cover, cover);\r
    }\r
  }\r
}\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const mod = (value: number, base: number) => ((value % base) + base) % base;\r
\r
let probe: CanvasRenderingContext2D | null = null;\r
\r
const parseColor = (value: string, fallback: RGB | null): RGB | null => {\r
  if (value === 'transparent') return null;\r
  if (typeof document === 'undefined') return fallback;\r
  if (!probe) probe = document.createElement('canvas').getContext('2d');\r
  if (!probe) return fallback;\r
  probe.fillStyle = '#000000';\r
  probe.fillStyle = value;\r
  const text = probe.fillStyle;\r
  if (text.startsWith('#')) {\r
    const hex = parseInt(text.slice(1), 16);\r
    return [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255];\r
  }\r
  const match = /rgba?\\(([\\d.]+),\\s*([\\d.]+),\\s*([\\d.]+)(?:,\\s*([\\d.]+))?/.exec(text);\r
  if (!match) return fallback;\r
  if (match[4] !== undefined && Number(match[4]) === 0) return null;\r
  return [Number(match[1]) / 255, Number(match[2]) / 255, Number(match[3]) / 255];\r
};\r
\r
const staggerFor = (count: number) => Math.min(0.12, 0.9 / Math.max(count - 1, 1));\r
\r
const toThreadSpace = (point: number[], aspect: number, angle: number) => {\r
  const qx = (point[0] - 0.5) * aspect;\r
  const qy = 0.5 - point[1];\r
  const cos = Math.cos(angle);\r
  const sin = Math.sin(angle);\r
  return [(qx * cos + qy * sin) / aspect + 0.5, -qx * sin + qy * cos + 0.5];\r
};\r
\r
const threadY = (s: Shape, x: number, index: number, phase: number, clock: number) => {\r
  const lane = s.nodes <= 1 ? x - s.pinch : (x - s.pinch + 0.5) * s.nodes - 0.5;\r
  const side = s.mirror ? (mod(Math.floor(lane), 2) < 0.5 ? -1 : 1) : 1;\r
  const dx = x - s.pinch;\r
  const env =\r
    s.nodes <= 1 ? s.spread * Math.abs(dx) : s.spread * 0.5 * Math.abs(Math.cos(Math.PI * s.nodes * (dx + 0.5)));\r
  const shimmer = s.shimmer ? Math.sin(clock * 1.7 + index * 1.3) * 0.35 : 0;\r
  const angle = x * s.frequency + (phase + (index * TAU) / Math.max(s.count, 1)) * side + shimmer;\r
  return s.position - env * (1 + index * s.taper) * Math.sin(angle);\r
};\r
\r
const compile = (gl: WebGL2RenderingContext, type: number, source: string) => {\r
  const shader = gl.createShader(type);\r
  if (!shader) return null;\r
  gl.shaderSource(shader, source);\r
  gl.compileShader(shader);\r
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {\r
    gl.deleteShader(shader);\r
    return null;\r
  }\r
  return shader;\r
};\r
\r
const prefersReduced = () =>\r
  typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);\r
\r
export default function WebThreads({\r
  colors = ['#5227FF', '#FF9FFC'],\r
  coreColor = '#FFFFFF',\r
  backgroundColor = 'transparent',\r
  lightMode = false,\r
  threadCount = 6,\r
  speed = 0.2,\r
  frequency = 5,\r
  spread = 0.18,\r
  taper = 1,\r
  position = 0.5,\r
  pinch = 0.5,\r
  nodes = 1,\r
  angle = 0,\r
  glow = 0.02,\r
  falloff = 0.6,\r
  thickness = 1.1,\r
  brightness = 0.6,\r
  opacity = 1,\r
  depth = 0,\r
  pulses = 0,\r
  mirror = true,\r
  shimmer = false,\r
  fade = 0,\r
  grain = 0.05,\r
  intro = true,\r
  mouseInteraction = true,\r
  mouseStrength = 0.5,\r
  pulseOnClick = true,\r
  paused = false,\r
  dpr = 2,\r
  className = '',\r
  style\r
}: WebThreadsProps) {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const colorKey = colors.join('|');\r
  const palette = useMemo(\r
    () =>\r
      colorKey\r
        .split('|')\r
        .slice(0, MAX_COLORS)\r
        .map((value): RGB => parseColor(value, [1, 1, 1]) ?? [1, 1, 1]),\r
    [colorKey]\r
  );\r
  const core = useMemo((): RGB => parseColor(coreColor, [1, 1, 1]) ?? [1, 1, 1], [coreColor]);\r
  const paper = useMemo(() => parseColor(backgroundColor, null), [backgroundColor]);\r
\r
  const settings = {\r
    palette: palette.length ? palette : [[1, 1, 1]],\r
    core,\r
    paper,\r
    lightMode,\r
    count: clamp(Math.round(threadCount), 1, MAX_THREADS),\r
    speed,\r
    frequency,\r
    spread,\r
    taper,\r
    position,\r
    pinch,\r
    nodes: clamp(Math.round(nodes), 1, 6),\r
    angle: (angle * Math.PI) / 180,\r
    glow: Math.max(0, glow),\r
    falloff: Math.max(0.05, falloff),\r
    thickness: Math.max(0.05, thickness),\r
    brightness: Math.max(0, brightness),\r
    opacity: clamp(opacity, 0, 1),\r
    depth: clamp(depth, 0, 1),\r
    pulses: Math.max(0, pulses),\r
    mirror,\r
    shimmer,\r
    fade: clamp(fade, 0, 1),\r
    grain: typeof grain === 'number' ? Math.max(0, grain) : grain ? 0.05 : 0,\r
    intro,\r
    mouseInteraction,\r
    mouseStrength: clamp(mouseStrength, 0, 1),\r
    pulseOnClick,\r
    paused,\r
    dpr: Math.max(0.5, dpr)\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    if (!container) return undefined;\r
    const canvas = document.createElement('canvas');\r
    canvas.className = CANVAS;\r
    container.appendChild(canvas);\r
    const gl = canvas.getContext('webgl2', {\r
      alpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false,\r
      premultipliedAlpha: true,\r
      powerPreference: 'high-performance'\r
    });\r
    if (!gl) {\r
      canvas.remove();\r
      return undefined;\r
    }\r
\r
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
    const program = gl.createProgram();\r
    if (!vertex || !fragment || !program) {\r
      canvas.remove();\r
      return undefined;\r
    }\r
    gl.attachShader(program, vertex);\r
    gl.attachShader(program, fragment);\r
    gl.bindAttribLocation(program, 0, 'aPosition');\r
    gl.linkProgram(program);\r
    gl.deleteShader(vertex);\r
    gl.deleteShader(fragment);\r
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {\r
      gl.deleteProgram(program);\r
      canvas.remove();\r
      return undefined;\r
    }\r
    const names = [\r
      'uResolution',\r
      'uPhase',\r
      'uClock',\r
      'uCount',\r
      'uFrequency',\r
      'uSpread',\r
      'uTaper',\r
      'uPosition',\r
      'uPinch',\r
      'uNodes',\r
      'uAngle',\r
      'uGlow',\r
      'uFalloff',\r
      'uThickness',\r
      'uBrightness',\r
      'uOpacity',\r
      'uMirror',\r
      'uShimmer',\r
      'uDepth',\r
      'uPulses',\r
      'uFade',\r
      'uGrain',\r
      'uColors',\r
      'uColorCount',\r
      'uCore',\r
      'uBackground',\r
      'uOpaque',\r
      'uLight',\r
      'uIntro',\r
      'uFocus',\r
      'uFocusState',\r
      'uSurges'\r
    ];\r
    const u: Record<string, WebGLUniformLocation | null> = {};\r
    names.forEach(name => {\r
      u[name] = gl.getUniformLocation(program, name);\r
    });\r
\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    const buffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    gl.useProgram(program);\r
\r
    const colorData = new Float32Array(MAX_COLORS * 3);\r
    const surgeData = new Float32Array(MAX_SURGES * 4);\r
    const focus = new Float32Array(MAX_THREADS);\r
    const state = {\r
      width: 1,\r
      height: 1,\r
      phase: 0,\r
      clock: 0,\r
      last: 0,\r
      raf: 0,\r
      visible: false,\r
      introAt: -1,\r
      pointer: [0.5, 0.5],\r
      inside: false,\r
      presence: 0,\r
      settle: 0,\r
      target: -1,\r
      surges: [] as Surge[],\r
      quiet: 0,\r
      seen: null as typeof settings | null\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const ratio = Math.min(window.devicePixelRatio || 1, s.dpr);\r
      const width = Math.max(1, Math.round(container.clientWidth * ratio));\r
      const height = Math.max(1, Math.round(container.clientHeight * ratio));\r
      if (width === state.width && height === state.height) return;\r
      state.quiet = 0;\r
      state.width = width;\r
      state.height = height;\r
      canvas.width = width;\r
      canvas.height = height;\r
    };\r
\r
    const introLength = (s: typeof settings) => (s.count - 1) * staggerFor(s.count) + STROKE_SECONDS;\r
\r
    const updateFocus = (s: typeof settings, dt: number, reduced: boolean) => {\r
      const wanted = s.mouseInteraction && state.inside;\r
      if (wanted) {\r
        const aspect = state.width / Math.max(state.height, 1);\r
        const [cx, cy] = toThreadSpace(state.pointer, aspect, s.angle);\r
        let best = -1;\r
        let bestDistance = Infinity;\r
        for (let index = 0; index < s.count; index++) {\r
          const distance = Math.abs(threadY(s, cx, index, state.phase, reduced ? 0 : state.clock) - cy);\r
          const reach = index === state.target ? 0.11 : 0.085;\r
          if (distance < reach && distance < bestDistance) {\r
            best = index;\r
            bestDistance = distance;\r
          }\r
        }\r
        state.target = best;\r
      } else {\r
        state.target = -1;\r
      }\r
      const ease = 1 - Math.exp(-dt / 0.22);\r
      let strongest = 0;\r
      for (let index = 0; index < MAX_THREADS; index++) {\r
        const goal = index === state.target ? 1 : 0;\r
        focus[index] += (goal - focus[index]) * ease;\r
        strongest = Math.max(strongest, focus[index]);\r
      }\r
      state.presence += ((wanted ? 1 : 0) - state.presence) * (1 - Math.exp(-dt / 0.3));\r
      const settleGoal = s.mouseStrength * 0.65 * strongest * state.presence;\r
      state.settle += (settleGoal - state.settle) * (1 - Math.exp(-dt / 0.3));\r
      return strongest > 0.002 || state.presence > 0.002 || state.settle > 0.002;\r
    };\r
\r
    const render = (reduced: boolean) => {\r
      const s = settingsRef.current;\r
      const introClock = state.introAt < 0 ? 0 : state.clock - state.introAt;\r
      const introRunning = s.intro && !reduced && introClock < introLength(s);\r
      gl.viewport(0, 0, state.width, state.height);\r
      gl.uniform2f(u.uResolution, state.width, state.height);\r
      gl.uniform1f(u.uPhase, state.phase);\r
      gl.uniform1f(u.uClock, reduced ? 0 : state.clock);\r
      gl.uniform1i(u.uCount, s.count);\r
      gl.uniform1f(u.uFrequency, s.frequency);\r
      gl.uniform1f(u.uSpread, s.spread);\r
      gl.uniform1f(u.uTaper, s.taper);\r
      gl.uniform1f(u.uPosition, s.position);\r
      gl.uniform1f(u.uPinch, s.pinch);\r
      gl.uniform1f(u.uNodes, s.nodes);\r
      gl.uniform2f(u.uAngle, Math.cos(s.angle), Math.sin(s.angle));\r
      gl.uniform1f(u.uGlow, s.glow * Math.sqrt(6 / Math.max(s.count, 6)));\r
      gl.uniform1f(u.uFalloff, s.falloff);\r
      gl.uniform1f(u.uThickness, s.thickness);\r
      gl.uniform1f(u.uBrightness, s.brightness);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.uniform1f(u.uMirror, s.mirror ? 1 : 0);\r
      gl.uniform1f(u.uShimmer, s.shimmer && !reduced ? 1 : 0);\r
      gl.uniform1f(u.uDepth, s.depth);\r
      gl.uniform1f(u.uPulses, s.pulses);\r
      gl.uniform1f(u.uFade, s.fade);\r
      gl.uniform1f(u.uGrain, s.grain);\r
      colorData.fill(0);\r
      s.palette.slice(0, MAX_COLORS).forEach((rgb, index) => colorData.set(rgb, index * 3));\r
      gl.uniform3fv(u.uColors, colorData);\r
      gl.uniform1i(u.uColorCount, Math.min(s.palette.length, MAX_COLORS));\r
      gl.uniform3f(u.uCore, s.core[0], s.core[1], s.core[2]);\r
      const paperColor = s.paper ?? [0, 0, 0];\r
      gl.uniform3f(u.uBackground, paperColor[0], paperColor[1], paperColor[2]);\r
      gl.uniform1f(u.uOpaque, s.paper ? 1 : 0);\r
      gl.uniform1f(u.uLight, s.lightMode ? 1 : 0);\r
      gl.uniform4f(u.uIntro, introClock, staggerFor(s.count), STROKE_SECONDS, introRunning ? 1 : 0);\r
      gl.uniform1fv(u.uFocus, focus);\r
      gl.uniform2f(u.uFocusState, state.presence * (0.4 + 0.6 * s.mouseStrength), state.settle);\r
      surgeData.fill(0);\r
      state.surges.slice(-MAX_SURGES).forEach((surge, index) => {\r
        surgeData.set([surge.x, state.clock - surge.at, surge.direction, 1], index * 4);\r
      });\r
      gl.uniform4fv(u.uSurges, surgeData);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const tick = (now: number) => {\r
      state.raf = requestAnimationFrame(tick);\r
      if (!state.visible || document.hidden) {\r
        state.last = now;\r
        return;\r
      }\r
      const s = settingsRef.current;\r
      const dt = state.last ? Math.min((now - state.last) / 1000, 0.1) : 1 / 60;\r
      state.last = now;\r
      const reduced = prefersReduced();\r
      state.clock += dt;\r
      if (state.introAt < 0) state.introAt = state.clock;\r
      if (!s.paused && !reduced) state.phase += dt * s.speed;\r
      const focusing = updateFocus(s, dt, reduced);\r
      state.surges = state.surges.filter(\r
        surge => state.clock - surge.at < SURGE_SECONDS + (s.count - 1) * SURGE_STAGGER\r
      );\r
\r
      const still = s.paused || reduced;\r
      const transient =\r
        state.surges.length > 0 || (s.intro && !reduced && state.clock - state.introAt < introLength(s)) || focusing;\r
      if (state.seen !== s || transient || !still) state.quiet = 0;\r
      else state.quiet += 1;\r
      state.seen = s;\r
      if (state.quiet > 3) return;\r
\r
      resize();\r
      render(reduced);\r
    };\r
\r
    const local = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      return {\r
        x: (event.clientX - rect.left) / Math.max(rect.width, 1),\r
        y: (event.clientY - rect.top) / Math.max(rect.height, 1),\r
        inside:\r
          event.clientX >= rect.left &&\r
          event.clientX <= rect.right &&\r
          event.clientY >= rect.top &&\r
          event.clientY <= rect.bottom\r
      };\r
    };\r
\r
    const onMove = (event: PointerEvent) => {\r
      const point = local(event);\r
      state.inside = point.inside;\r
      if (point.inside) state.pointer = [point.x, point.y];\r
    };\r
\r
    const onLeave = () => {\r
      state.inside = false;\r
    };\r
\r
    const onDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      if (!s.pulseOnClick || event.button !== 0 || prefersReduced()) return;\r
      if (\r
        event.target instanceof Element &&\r
        event.target.closest('a, button, input, textarea, select, label, [role="button"]')\r
      )\r
        return;\r
      const point = local(event);\r
      if (!point.inside) return;\r
      const aspect = state.width / Math.max(state.height, 1);\r
      const [x] = toThreadSpace([point.x, point.y], aspect, s.angle);\r
      const direction = x <= s.pinch ? 1 : -1;\r
      state.surges.push({ x, direction, at: state.clock });\r
      if (state.surges.length > MAX_SURGES) state.surges.shift();\r
    };\r
\r
    const visibility = new IntersectionObserver(entries => {\r
      state.visible = entries.some(entry => entry.isIntersecting);\r
    });\r
    visibility.observe(container);\r
    const sizes = new ResizeObserver(resize);\r
    sizes.observe(container);\r
    resize();\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    window.addEventListener('pointerdown', onDown);\r
    document.documentElement.addEventListener('pointerleave', onLeave);\r
    state.raf = requestAnimationFrame(tick);\r
\r
    return () => {\r
      cancelAnimationFrame(state.raf);\r
      visibility.disconnect();\r
      sizes.disconnect();\r
      window.removeEventListener('pointermove', onMove);\r
      window.removeEventListener('pointerdown', onDown);\r
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
      gl.deleteProgram(program);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
      canvas.remove();\r
    };\r
  }, []);\r
\r
  return <div ref={containerRef} className={[ROOT, className].filter(Boolean).join(' ')} style={style} />;\r
}\r
`,o=`'use client';\r
\r
import { useEffect, useMemo, useRef, type CSSProperties } from 'react';\r
\r
export interface WebThreadsProps {\r
  colors?: string[];\r
  coreColor?: string;\r
  backgroundColor?: string;\r
  lightMode?: boolean;\r
  threadCount?: number;\r
  speed?: number;\r
  frequency?: number;\r
  spread?: number;\r
  taper?: number;\r
  position?: number;\r
  pinch?: number;\r
  nodes?: number;\r
  angle?: number;\r
  glow?: number;\r
  falloff?: number;\r
  thickness?: number;\r
  brightness?: number;\r
  opacity?: number;\r
  depth?: number;\r
  pulses?: number;\r
  mirror?: boolean;\r
  shimmer?: boolean;\r
  fade?: number;\r
  grain?: number;\r
  intro?: boolean;\r
  mouseInteraction?: boolean;\r
  mouseStrength?: number;\r
  pulseOnClick?: boolean;\r
  paused?: boolean;\r
  dpr?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
type RGB = [number, number, number];\r
\r
interface Surge {\r
  x: number;\r
  direction: number;\r
  at: number;\r
}\r
\r
interface Shape {\r
  nodes: number;\r
  pinch: number;\r
  mirror: boolean;\r
  spread: number;\r
  shimmer: boolean;\r
  frequency: number;\r
  count: number;\r
  taper: number;\r
  position: number;\r
}\r
\r
const ROOT = 'relative h-full w-full overflow-hidden';\r
const CANVAS = 'absolute inset-0 block h-full w-full';\r
\r
const MAX_THREADS = 24;\r
const MAX_COLORS = 6;\r
const MAX_SURGES = 3;\r
const SURGE_SECONDS = 1.6;\r
const SURGE_STAGGER = 0.05;\r
const STROKE_SECONDS = 1.25;\r
const TAU = Math.PI * 2;\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform vec2 uResolution;\r
uniform float uPhase;\r
uniform float uClock;\r
uniform int uCount;\r
uniform float uFrequency;\r
uniform float uSpread;\r
uniform float uTaper;\r
uniform float uPosition;\r
uniform float uPinch;\r
uniform float uNodes;\r
uniform vec2 uAngle;\r
uniform float uGlow;\r
uniform float uFalloff;\r
uniform float uThickness;\r
uniform float uBrightness;\r
uniform float uOpacity;\r
uniform float uMirror;\r
uniform float uShimmer;\r
uniform float uDepth;\r
uniform float uPulses;\r
uniform float uFade;\r
uniform float uGrain;\r
uniform vec3 uColors[\${MAX_COLORS}];\r
uniform int uColorCount;\r
uniform vec3 uCore;\r
uniform vec3 uBackground;\r
uniform float uOpaque;\r
uniform float uLight;\r
uniform vec4 uIntro;\r
uniform float uFocus[\${MAX_THREADS}];\r
uniform vec2 uFocusState;\r
uniform vec4 uSurges[\${MAX_SURGES}];\r
out vec4 outColor;\r
\r
const float PI = 3.14159265;\r
const float TAU = 6.28318530;\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
float easeInOut(float t) {\r
  return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) * 0.5;\r
}\r
\r
vec3 palette(float t) {\r
  if (uColorCount <= 1) return uColors[0];\r
  float scaled = clamp(t, 0.0, 1.0) * float(uColorCount - 1);\r
  int index = int(min(floor(scaled), float(uColorCount - 2)));\r
  return mix(uColors[index], uColors[index + 1], scaled - float(index));\r
}\r
\r
vec2 envelope(float x) {\r
  float dx = x - uPinch;\r
  if (uNodes <= 1.0) return vec2(uSpread * abs(dx), uSpread * sign(dx));\r
  float k = PI * uNodes;\r
  float c = cos(k * (dx + 0.5));\r
  return vec2(uSpread * 0.5 * abs(c), -uSpread * 0.5 * k * sin(k * (dx + 0.5)) * sign(c));\r
}\r
\r
vec2 space(vec2 p, float aspect) {\r
  vec2 q = (p - 0.5) * vec2(aspect, 1.0);\r
  q = vec2(q.x * uAngle.x + q.y * uAngle.y, -q.x * uAngle.y + q.y * uAngle.x);\r
  return vec2(q.x / aspect + 0.5, q.y + 0.5);\r
}\r
\r
float hubAt(float x) {\r
  if (uNodes <= 1.0) return uPinch;\r
  float spacing = 1.0 / uNodes;\r
  return uPinch - 0.5 + (floor((x - uPinch + 0.5) / spacing) + 0.5) * spacing;\r
}\r
\r
vec3 thread(float x, float i, float n) {\r
  float lane = uNodes <= 1.0 ? x - uPinch : (x - uPinch + 0.5) * uNodes - 0.5;\r
  float side = uMirror > 0.5 ? (mod(floor(lane), 2.0) < 0.5 ? -1.0 : 1.0) : 1.0;\r
  vec2 env = envelope(x);\r
  float amp = 1.0 + i * uTaper;\r
  float shimmer = uShimmer > 0.5 ? sin(uClock * 1.7 + i * 1.3) * 0.35 : 0.0;\r
  float angle = x * uFrequency + (uPhase + i * TAU / max(n, 1.0)) * side + shimmer;\r
  float wave = sin(angle);\r
  float y = uPosition - env.x * amp * wave;\r
  float slope = -(env.y * amp * wave + env.x * amp * cos(angle) * uFrequency);\r
  return vec3(y, slope, angle);\r
}\r
\r
void main() {\r
  vec2 p = gl_FragCoord.xy / uResolution;\r
  float aspect = uResolution.x / uResolution.y;\r
  vec2 s = space(p, aspect);\r
  float x = s.x;\r
  float y = s.y;\r
  float n = float(uCount);\r
  float pixel = 1.0 / uResolution.y;\r
  float hub = hubAt(x);\r
  float presence = uFocusState.x;\r
  float settle = uFocusState.y;\r
\r
  vec3 color = vec3(0.0);\r
  float energy = 0.0;\r
  float ink = 0.0;\r
  vec3 inkColor = vec3(0.0);\r
\r
  for (int idx = 0; idx < \${MAX_THREADS}; idx++) {\r
    if (idx >= uCount) break;\r
    float i = float(idx);\r
    float ci = n > 1.0 ? i / (n - 1.0) : 0.0;\r
\r
    float head = 2.0;\r
    float bead = 0.0;\r
    float born = 1.0;\r
    if (uIntro.w > 0.5) {\r
      float progress = clamp((uIntro.x - i * uIntro.y) / uIntro.z, 0.0, 1.0);\r
      head = mix(-0.06, 1.06, easeInOut(progress));\r
      bead = sin(PI * progress);\r
      born = progress > 0.0 ? smoothstep(-0.05, 0.03, head) : 0.0;\r
    }\r
    if (born <= 0.0) continue;\r
\r
    bool tip = x > head;\r
    vec3 lead = bead > 0.0 || tip ? thread(head, i, n) : vec3(0.0);\r
    vec3 t = tip ? lead : thread(x, i, n);\r
\r
    float focus = uFocus[idx];\r
    float spot = tip ? head : x;\r
    float twist = uDepth * smoothstep(0.0, 0.07, abs(spot - hubAt(spot)));\r
    float depth = 0.5 + 0.5 * cos(t.z);\r
    float front = mix(1.0, 0.3 + 0.7 * depth, twist);\r
    float width = uThickness * mix(1.0, 0.55 + 0.7 * depth, twist) * (1.0 + 0.3 * focus * presence);\r
\r
    float d;\r
    if (tip) {\r
      float back = head - 0.02;\r
      vec2 a = vec2(back * aspect, thread(back, i, n).x);\r
      vec2 b = vec2(head * aspect, lead.x);\r
      vec2 pa = vec2(x * aspect, y) - a;\r
      vec2 ba = b - a;\r
      d = length(pa - ba * clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0));\r
    } else {\r
      float bend = t.y * smoothstep(0.0, 0.04, abs(x - hub));\r
      d = abs(y - t.x) / sqrt(1.0 + bend * bend / (aspect * aspect));\r
    }\r
    float g = uGlow / pow(max(d / width, pixel * 0.35), uFalloff) * front * born;\r
    float onLine = exp(-d / (width * 0.012));\r
\r
    if (bead > 0.0) {\r
      vec2 near = vec2((x - head) * aspect, y - lead.x);\r
      g *= 1.0 + bead * 1.6 * exp(-dot(near, near) / 0.0025);\r
    }\r
\r
    float light = 0.0;\r
    for (int k = 0; k < \${MAX_SURGES}; k++) {\r
      vec4 surge = uSurges[k];\r
      if (surge.w <= 0.0) continue;\r
      float progress = clamp((surge.y - i * \${SURGE_STAGGER.toFixed(3)}) / \${SURGE_SECONDS.toFixed(2)}, 0.0, 1.0);\r
      if (progress <= 0.0 || progress >= 1.0) continue;\r
      float lead = mix(surge.x, surge.z > 0.0 ? 1.12 : -0.12, easeInOut(progress));\r
      float along = (x - lead) * surge.z * aspect;\r
      float trail = along < 0.0 ? exp(along / 0.24) : exp(-along * along / 0.0009);\r
      light += trail * sin(PI * progress);\r
    }\r
    g *= 1.0 + light * (0.12 + 2.8 * onLine);\r
\r
    if (uPulses > 0.0) {\r
      float travel = abs(x - hub);\r
      float pulse = pow(0.5 + 0.5 * sin(travel * 16.0 + uClock * 2.2 + i * 1.9), 24.0);\r
      g *= 1.0 + uPulses * 5.0 * pulse * onLine;\r
    }\r
\r
    float sheen = pow(0.5 + 0.5 * sin(abs(x - hub) * 11.0 + uClock * 1.4), 10.0);\r
    float lift = focus * presence;\r
    g *= (1.0 - settle * (1.0 - focus)) * (1.0 + lift * (0.9 + 1.4 * sheen * onLine));\r
\r
    vec3 tint = mix(palette(ci), uCore, 0.3 * lift);\r
    color += g * tint;\r
    energy += g;\r
    float stroke = smoothstep(0.45, 1.3, g);\r
    inkColor += tint * stroke;\r
    ink += stroke;\r
  }\r
\r
  float fade = 1.0;\r
  if (uFade > 0.0) {\r
    float edge = min(x, 1.0 - x);\r
    float f = clamp(edge / max(uFade * 0.5, 0.001), 0.0, 1.0);\r
    fade = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);\r
  }\r
  float core = smoothstep(0.5, 2.2, energy);\r
  color = mix(color, uCore * energy, core * 0.5);\r
  color *= uBrightness * fade;\r
  float alpha = clamp(energy * fade, 0.0, 1.0) * uOpacity;\r
  float grain = (hash(gl_FragCoord.xy + fract(uClock) * 97.0) - 0.5) * uGrain;\r
\r
  if (uLight < 0.5) {\r
    vec3 rgb = max(color * alpha * (1.0 + grain * 2.0), 0.0);\r
    if (uOpaque > 0.5) {\r
      outColor = vec4(min(uBackground * (1.0 - alpha) + rgb, 1.0), 1.0);\r
    } else {\r
      outColor = vec4(rgb, alpha);\r
    }\r
  } else {\r
    ink *= fade;\r
    vec3 hue = ink > 0.0001 ? inkColor / ink : palette(0.5);\r
    float body = clamp(ink, 0.0, 1.0);\r
    float haze = clamp(1.0 - exp(-energy * fade * 0.3), 0.0, 1.0) * 0.12;\r
    float focal = smoothstep(2.0, 9.0, energy * fade) * 0.25;\r
    float cover = clamp((body * 0.9 + (haze + focal) * (1.0 - body)) * (1.0 + grain * 2.0), 0.0, 0.95) * uOpacity;\r
    vec3 stroke = hue;\r
    if (uOpaque > 0.5) {\r
      outColor = vec4(mix(uBackground, stroke, cover), 1.0);\r
    } else {\r
      outColor = vec4(stroke * cover, cover);\r
    }\r
  }\r
}\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const mod = (value: number, base: number) => ((value % base) + base) % base;\r
\r
let probe: CanvasRenderingContext2D | null = null;\r
\r
const parseColor = (value: string, fallback: RGB | null): RGB | null => {\r
  if (value === 'transparent') return null;\r
  if (typeof document === 'undefined') return fallback;\r
  if (!probe) probe = document.createElement('canvas').getContext('2d');\r
  if (!probe) return fallback;\r
  probe.fillStyle = '#000000';\r
  probe.fillStyle = value;\r
  const text = probe.fillStyle;\r
  if (text.startsWith('#')) {\r
    const hex = parseInt(text.slice(1), 16);\r
    return [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255];\r
  }\r
  const match = /rgba?\\(([\\d.]+),\\s*([\\d.]+),\\s*([\\d.]+)(?:,\\s*([\\d.]+))?/.exec(text);\r
  if (!match) return fallback;\r
  if (match[4] !== undefined && Number(match[4]) === 0) return null;\r
  return [Number(match[1]) / 255, Number(match[2]) / 255, Number(match[3]) / 255];\r
};\r
\r
const staggerFor = (count: number) => Math.min(0.12, 0.9 / Math.max(count - 1, 1));\r
\r
const toThreadSpace = (point: number[], aspect: number, angle: number) => {\r
  const qx = (point[0] - 0.5) * aspect;\r
  const qy = 0.5 - point[1];\r
  const cos = Math.cos(angle);\r
  const sin = Math.sin(angle);\r
  return [(qx * cos + qy * sin) / aspect + 0.5, -qx * sin + qy * cos + 0.5];\r
};\r
\r
const threadY = (s: Shape, x: number, index: number, phase: number, clock: number) => {\r
  const lane = s.nodes <= 1 ? x - s.pinch : (x - s.pinch + 0.5) * s.nodes - 0.5;\r
  const side = s.mirror ? (mod(Math.floor(lane), 2) < 0.5 ? -1 : 1) : 1;\r
  const dx = x - s.pinch;\r
  const env =\r
    s.nodes <= 1 ? s.spread * Math.abs(dx) : s.spread * 0.5 * Math.abs(Math.cos(Math.PI * s.nodes * (dx + 0.5)));\r
  const shimmer = s.shimmer ? Math.sin(clock * 1.7 + index * 1.3) * 0.35 : 0;\r
  const angle = x * s.frequency + (phase + (index * TAU) / Math.max(s.count, 1)) * side + shimmer;\r
  return s.position - env * (1 + index * s.taper) * Math.sin(angle);\r
};\r
\r
const compile = (gl: WebGL2RenderingContext, type: number, source: string) => {\r
  const shader = gl.createShader(type);\r
  if (!shader) return null;\r
  gl.shaderSource(shader, source);\r
  gl.compileShader(shader);\r
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {\r
    gl.deleteShader(shader);\r
    return null;\r
  }\r
  return shader;\r
};\r
\r
const prefersReduced = () =>\r
  typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);\r
\r
export default function WebThreads({\r
  colors = ['#5227FF', '#FF9FFC'],\r
  coreColor = '#FFFFFF',\r
  backgroundColor = 'transparent',\r
  lightMode = false,\r
  threadCount = 6,\r
  speed = 0.2,\r
  frequency = 5,\r
  spread = 0.18,\r
  taper = 1,\r
  position = 0.5,\r
  pinch = 0.5,\r
  nodes = 1,\r
  angle = 0,\r
  glow = 0.02,\r
  falloff = 0.6,\r
  thickness = 1.1,\r
  brightness = 0.6,\r
  opacity = 1,\r
  depth = 0,\r
  pulses = 0,\r
  mirror = true,\r
  shimmer = false,\r
  fade = 0,\r
  grain = 0.05,\r
  intro = true,\r
  mouseInteraction = true,\r
  mouseStrength = 0.5,\r
  pulseOnClick = true,\r
  paused = false,\r
  dpr = 2,\r
  className = '',\r
  style\r
}: WebThreadsProps) {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const colorKey = colors.join('|');\r
  const palette = useMemo(\r
    () =>\r
      colorKey\r
        .split('|')\r
        .slice(0, MAX_COLORS)\r
        .map((value): RGB => parseColor(value, [1, 1, 1]) ?? [1, 1, 1]),\r
    [colorKey]\r
  );\r
  const core = useMemo((): RGB => parseColor(coreColor, [1, 1, 1]) ?? [1, 1, 1], [coreColor]);\r
  const paper = useMemo(() => parseColor(backgroundColor, null), [backgroundColor]);\r
\r
  const settings = {\r
    palette: palette.length ? palette : [[1, 1, 1]],\r
    core,\r
    paper,\r
    lightMode,\r
    count: clamp(Math.round(threadCount), 1, MAX_THREADS),\r
    speed,\r
    frequency,\r
    spread,\r
    taper,\r
    position,\r
    pinch,\r
    nodes: clamp(Math.round(nodes), 1, 6),\r
    angle: (angle * Math.PI) / 180,\r
    glow: Math.max(0, glow),\r
    falloff: Math.max(0.05, falloff),\r
    thickness: Math.max(0.05, thickness),\r
    brightness: Math.max(0, brightness),\r
    opacity: clamp(opacity, 0, 1),\r
    depth: clamp(depth, 0, 1),\r
    pulses: Math.max(0, pulses),\r
    mirror,\r
    shimmer,\r
    fade: clamp(fade, 0, 1),\r
    grain: typeof grain === 'number' ? Math.max(0, grain) : grain ? 0.05 : 0,\r
    intro,\r
    mouseInteraction,\r
    mouseStrength: clamp(mouseStrength, 0, 1),\r
    pulseOnClick,\r
    paused,\r
    dpr: Math.max(0.5, dpr)\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    if (!container) return undefined;\r
    const canvas = document.createElement('canvas');\r
    canvas.className = CANVAS;\r
    container.appendChild(canvas);\r
    const gl = canvas.getContext('webgl2', {\r
      alpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false,\r
      premultipliedAlpha: true,\r
      powerPreference: 'high-performance'\r
    });\r
    if (!gl) {\r
      canvas.remove();\r
      return undefined;\r
    }\r
\r
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
    const program = gl.createProgram();\r
    if (!vertex || !fragment || !program) {\r
      canvas.remove();\r
      return undefined;\r
    }\r
    gl.attachShader(program, vertex);\r
    gl.attachShader(program, fragment);\r
    gl.bindAttribLocation(program, 0, 'aPosition');\r
    gl.linkProgram(program);\r
    gl.deleteShader(vertex);\r
    gl.deleteShader(fragment);\r
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {\r
      gl.deleteProgram(program);\r
      canvas.remove();\r
      return undefined;\r
    }\r
    const names = [\r
      'uResolution',\r
      'uPhase',\r
      'uClock',\r
      'uCount',\r
      'uFrequency',\r
      'uSpread',\r
      'uTaper',\r
      'uPosition',\r
      'uPinch',\r
      'uNodes',\r
      'uAngle',\r
      'uGlow',\r
      'uFalloff',\r
      'uThickness',\r
      'uBrightness',\r
      'uOpacity',\r
      'uMirror',\r
      'uShimmer',\r
      'uDepth',\r
      'uPulses',\r
      'uFade',\r
      'uGrain',\r
      'uColors',\r
      'uColorCount',\r
      'uCore',\r
      'uBackground',\r
      'uOpaque',\r
      'uLight',\r
      'uIntro',\r
      'uFocus',\r
      'uFocusState',\r
      'uSurges'\r
    ];\r
    const u: Record<string, WebGLUniformLocation | null> = {};\r
    names.forEach(name => {\r
      u[name] = gl.getUniformLocation(program, name);\r
    });\r
\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    const buffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    gl.useProgram(program);\r
\r
    const colorData = new Float32Array(MAX_COLORS * 3);\r
    const surgeData = new Float32Array(MAX_SURGES * 4);\r
    const focus = new Float32Array(MAX_THREADS);\r
    const state = {\r
      width: 1,\r
      height: 1,\r
      phase: 0,\r
      clock: 0,\r
      last: 0,\r
      raf: 0,\r
      visible: false,\r
      introAt: -1,\r
      pointer: [0.5, 0.5],\r
      inside: false,\r
      presence: 0,\r
      settle: 0,\r
      target: -1,\r
      surges: [] as Surge[],\r
      quiet: 0,\r
      seen: null as typeof settings | null\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const ratio = Math.min(window.devicePixelRatio || 1, s.dpr);\r
      const width = Math.max(1, Math.round(container.clientWidth * ratio));\r
      const height = Math.max(1, Math.round(container.clientHeight * ratio));\r
      if (width === state.width && height === state.height) return;\r
      state.quiet = 0;\r
      state.width = width;\r
      state.height = height;\r
      canvas.width = width;\r
      canvas.height = height;\r
    };\r
\r
    const introLength = (s: typeof settings) => (s.count - 1) * staggerFor(s.count) + STROKE_SECONDS;\r
\r
    const updateFocus = (s: typeof settings, dt: number, reduced: boolean) => {\r
      const wanted = s.mouseInteraction && state.inside;\r
      if (wanted) {\r
        const aspect = state.width / Math.max(state.height, 1);\r
        const [cx, cy] = toThreadSpace(state.pointer, aspect, s.angle);\r
        let best = -1;\r
        let bestDistance = Infinity;\r
        for (let index = 0; index < s.count; index++) {\r
          const distance = Math.abs(threadY(s, cx, index, state.phase, reduced ? 0 : state.clock) - cy);\r
          const reach = index === state.target ? 0.11 : 0.085;\r
          if (distance < reach && distance < bestDistance) {\r
            best = index;\r
            bestDistance = distance;\r
          }\r
        }\r
        state.target = best;\r
      } else {\r
        state.target = -1;\r
      }\r
      const ease = 1 - Math.exp(-dt / 0.22);\r
      let strongest = 0;\r
      for (let index = 0; index < MAX_THREADS; index++) {\r
        const goal = index === state.target ? 1 : 0;\r
        focus[index] += (goal - focus[index]) * ease;\r
        strongest = Math.max(strongest, focus[index]);\r
      }\r
      state.presence += ((wanted ? 1 : 0) - state.presence) * (1 - Math.exp(-dt / 0.3));\r
      const settleGoal = s.mouseStrength * 0.65 * strongest * state.presence;\r
      state.settle += (settleGoal - state.settle) * (1 - Math.exp(-dt / 0.3));\r
      return strongest > 0.002 || state.presence > 0.002 || state.settle > 0.002;\r
    };\r
\r
    const render = (reduced: boolean) => {\r
      const s = settingsRef.current;\r
      const introClock = state.introAt < 0 ? 0 : state.clock - state.introAt;\r
      const introRunning = s.intro && !reduced && introClock < introLength(s);\r
      gl.viewport(0, 0, state.width, state.height);\r
      gl.uniform2f(u.uResolution, state.width, state.height);\r
      gl.uniform1f(u.uPhase, state.phase);\r
      gl.uniform1f(u.uClock, reduced ? 0 : state.clock);\r
      gl.uniform1i(u.uCount, s.count);\r
      gl.uniform1f(u.uFrequency, s.frequency);\r
      gl.uniform1f(u.uSpread, s.spread);\r
      gl.uniform1f(u.uTaper, s.taper);\r
      gl.uniform1f(u.uPosition, s.position);\r
      gl.uniform1f(u.uPinch, s.pinch);\r
      gl.uniform1f(u.uNodes, s.nodes);\r
      gl.uniform2f(u.uAngle, Math.cos(s.angle), Math.sin(s.angle));\r
      gl.uniform1f(u.uGlow, s.glow * Math.sqrt(6 / Math.max(s.count, 6)));\r
      gl.uniform1f(u.uFalloff, s.falloff);\r
      gl.uniform1f(u.uThickness, s.thickness);\r
      gl.uniform1f(u.uBrightness, s.brightness);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.uniform1f(u.uMirror, s.mirror ? 1 : 0);\r
      gl.uniform1f(u.uShimmer, s.shimmer && !reduced ? 1 : 0);\r
      gl.uniform1f(u.uDepth, s.depth);\r
      gl.uniform1f(u.uPulses, s.pulses);\r
      gl.uniform1f(u.uFade, s.fade);\r
      gl.uniform1f(u.uGrain, s.grain);\r
      colorData.fill(0);\r
      s.palette.slice(0, MAX_COLORS).forEach((rgb, index) => colorData.set(rgb, index * 3));\r
      gl.uniform3fv(u.uColors, colorData);\r
      gl.uniform1i(u.uColorCount, Math.min(s.palette.length, MAX_COLORS));\r
      gl.uniform3f(u.uCore, s.core[0], s.core[1], s.core[2]);\r
      const paperColor = s.paper ?? [0, 0, 0];\r
      gl.uniform3f(u.uBackground, paperColor[0], paperColor[1], paperColor[2]);\r
      gl.uniform1f(u.uOpaque, s.paper ? 1 : 0);\r
      gl.uniform1f(u.uLight, s.lightMode ? 1 : 0);\r
      gl.uniform4f(u.uIntro, introClock, staggerFor(s.count), STROKE_SECONDS, introRunning ? 1 : 0);\r
      gl.uniform1fv(u.uFocus, focus);\r
      gl.uniform2f(u.uFocusState, state.presence * (0.4 + 0.6 * s.mouseStrength), state.settle);\r
      surgeData.fill(0);\r
      state.surges.slice(-MAX_SURGES).forEach((surge, index) => {\r
        surgeData.set([surge.x, state.clock - surge.at, surge.direction, 1], index * 4);\r
      });\r
      gl.uniform4fv(u.uSurges, surgeData);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const tick = (now: number) => {\r
      state.raf = requestAnimationFrame(tick);\r
      if (!state.visible || document.hidden) {\r
        state.last = now;\r
        return;\r
      }\r
      const s = settingsRef.current;\r
      const dt = state.last ? Math.min((now - state.last) / 1000, 0.1) : 1 / 60;\r
      state.last = now;\r
      const reduced = prefersReduced();\r
      state.clock += dt;\r
      if (state.introAt < 0) state.introAt = state.clock;\r
      if (!s.paused && !reduced) state.phase += dt * s.speed;\r
      const focusing = updateFocus(s, dt, reduced);\r
      state.surges = state.surges.filter(\r
        surge => state.clock - surge.at < SURGE_SECONDS + (s.count - 1) * SURGE_STAGGER\r
      );\r
\r
      const still = s.paused || reduced;\r
      const transient =\r
        state.surges.length > 0 || (s.intro && !reduced && state.clock - state.introAt < introLength(s)) || focusing;\r
      if (state.seen !== s || transient || !still) state.quiet = 0;\r
      else state.quiet += 1;\r
      state.seen = s;\r
      if (state.quiet > 3) return;\r
\r
      resize();\r
      render(reduced);\r
    };\r
\r
    const local = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      return {\r
        x: (event.clientX - rect.left) / Math.max(rect.width, 1),\r
        y: (event.clientY - rect.top) / Math.max(rect.height, 1),\r
        inside:\r
          event.clientX >= rect.left &&\r
          event.clientX <= rect.right &&\r
          event.clientY >= rect.top &&\r
          event.clientY <= rect.bottom\r
      };\r
    };\r
\r
    const onMove = (event: PointerEvent) => {\r
      const point = local(event);\r
      state.inside = point.inside;\r
      if (point.inside) state.pointer = [point.x, point.y];\r
    };\r
\r
    const onLeave = () => {\r
      state.inside = false;\r
    };\r
\r
    const onDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      if (!s.pulseOnClick || event.button !== 0 || prefersReduced()) return;\r
      if (\r
        event.target instanceof Element &&\r
        event.target.closest('a, button, input, textarea, select, label, [role="button"]')\r
      )\r
        return;\r
      const point = local(event);\r
      if (!point.inside) return;\r
      const aspect = state.width / Math.max(state.height, 1);\r
      const [x] = toThreadSpace([point.x, point.y], aspect, s.angle);\r
      const direction = x <= s.pinch ? 1 : -1;\r
      state.surges.push({ x, direction, at: state.clock });\r
      if (state.surges.length > MAX_SURGES) state.surges.shift();\r
    };\r
\r
    const visibility = new IntersectionObserver(entries => {\r
      state.visible = entries.some(entry => entry.isIntersecting);\r
    });\r
    visibility.observe(container);\r
    const sizes = new ResizeObserver(resize);\r
    sizes.observe(container);\r
    resize();\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    window.addEventListener('pointerdown', onDown);\r
    document.documentElement.addEventListener('pointerleave', onLeave);\r
    state.raf = requestAnimationFrame(tick);\r
\r
    return () => {\r
      cancelAnimationFrame(state.raf);\r
      visibility.disconnect();\r
      sizes.disconnect();\r
      window.removeEventListener('pointermove', onMove);\r
      window.removeEventListener('pointerdown', onDown);\r
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
      gl.deleteProgram(program);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
      canvas.remove();\r
    };\r
  }, []);\r
\r
  return <div ref={containerRef} className={[ROOT, className].filter(Boolean).join(' ')} style={style} />;\r
}\r
`,a={dependencies:"",usage:`import WebThreads from './WebThreads';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <WebThreads
    colors={['#5227FF', '#FF9FFC']}
    coreColor="#FFFFFF"
    threadCount={6}
    spread={0.18}
  />
</div>`,code:n,css:r,tailwind:e,tsCode:t,tsTailwind:o};export{a as webThreads};
