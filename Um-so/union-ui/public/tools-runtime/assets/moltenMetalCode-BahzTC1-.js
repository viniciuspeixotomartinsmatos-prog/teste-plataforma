const r=`'use client';\r
\r
import { useEffect, useMemo, useRef } from 'react';\r
import './MoltenMetal.css';\r
\r
const ROOT = 'molten-metal-container';\r
const CANVAS = 'molten-metal-canvas';\r
\r
const MAX_COLORS = 6;\r
const TRAIL = 16;\r
const MAX_FLARES = 8;\r
const SAMPLE_SECONDS = 0.06;\r
const TRAIL_SECONDS = 0.9;\r
const FLARE_SECONDS = 1.8;\r
const INTRO_SECONDS = 2.4;\r
const FLOW_START = 0.4;\r
const BALANCE = { molten: 0.5, ember: 0.3, frost: 0.7 };\r
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
uniform float uTime;\r
uniform float uClock;\r
uniform float uScale;\r
uniform float uDetail;\r
uniform float uGlow;\r
uniform float uThickness;\r
uniform float uSwirl;\r
uniform float uFold;\r
uniform float uBlackPoint;\r
uniform float uBrightness;\r
uniform float uBalance;\r
uniform float uGrain;\r
uniform float uOpacity;\r
uniform vec2 uOffset;\r
uniform vec2 uRotation;\r
uniform vec2 uDrift;\r
uniform vec3 uColors[\${MAX_COLORS}];\r
uniform int uColorCount;\r
uniform vec3 uBackground;\r
uniform float uOpaque;\r
uniform float uLight;\r
uniform vec3 uReveal;\r
uniform vec4 uTrail[\${TRAIL}];\r
uniform float uTrailWeight[\${TRAIL}];\r
uniform int uTrailCount;\r
uniform vec4 uFlares[\${MAX_FLARES}];\r
uniform int uFlareCount;\r
uniform vec4 uHeat;\r
out vec4 outColor;\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
vec3 palette(float g) {\r
  if (uColorCount <= 1) return uColors[0];\r
  float t = g < uBalance ? 0.5 * g / uBalance : 0.5 + 0.5 * (g - uBalance) / (1.0 - uBalance);\r
  float scaled = t * float(uColorCount - 1);\r
  int index = int(min(floor(scaled), float(uColorCount - 2)));\r
  return mix(uColors[index], uColors[index + 1], smoothstep(0.0, 1.0, scaled - float(index)));\r
}\r
\r
float warmth(float age, float weight, vec2 offset) {\r
  float life = clamp(age / \${TRAIL_SECONDS.toFixed(2)}, 0.0, 1.0);\r
  vec2 spread = offset / (uHeat.z * (1.0 + 0.8 * life));\r
  return weight * (1.0 - life) * (1.0 - life) * exp(-dot(spread, spread));\r
}\r
\r
float trailHeat(vec2 q) {\r
  float heat = 0.0;\r
  for (int k = 0; k < \${TRAIL}; k++) {\r
    if (k >= uTrailCount) break;\r
    vec4 a = uTrail[k];\r
    float weight = uTrailWeight[k];\r
    heat = max(heat, warmth(a.z, weight, q - a.xy));\r
    int next = min(k + 1, \${TRAIL - 1});\r
    if (next == k || next >= uTrailCount) continue;\r
    vec4 b = uTrail[next];\r
    float older = uTrailWeight[next];\r
    vec2 ab = b.xy - a.xy;\r
    float span = dot(ab, ab);\r
    float t = span > 1e-10 ? clamp(dot(q - a.xy, ab) / span, 0.0, 1.0) : 0.0;\r
    float even = smoothstep(0.0, uHeat.z, sqrt(span));\r
    float age = mix(min(a.w, b.z), mix(a.w, b.z, t), even);\r
    float strength = mix(max(weight, older), mix(weight, older, t), even);\r
    heat = max(heat, warmth(age, strength, q - a.xy - ab * t));\r
  }\r
  return heat;\r
}\r
\r
float flareHeat(vec2 q) {\r
  float heat = 0.0;\r
  for (int k = 0; k < \${MAX_FLARES}; k++) {\r
    if (k >= uFlareCount) break;\r
    vec4 f = uFlares[k];\r
    float life = clamp(f.z / \${FLARE_SECONDS.toFixed(2)}, 0.0, 1.0);\r
    float rise = 1.0 - exp(-f.z / 0.07);\r
    float fall = exp(-3.0 * life) * (1.0 - life) * (1.0 - life);\r
    vec2 offset = (q - f.xy) / (uHeat.z * (0.9 + 1.6 * sqrt(life)));\r
    heat += rise * fall * exp(-dot(offset, offset));\r
  }\r
  return heat;\r
}\r
\r
void main() {\r
  float time = uTime;\r
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;\r
  vec2 q = uv - uOffset;\r
  vec2 view = vec2(q.x * uRotation.x - q.y * uRotation.y, q.x * uRotation.y + q.y * uRotation.x);\r
  vec2 p = uScale * view - 0.5;\r
  p += uDrift;\r
\r
  float heat = 0.0;\r
  float flare = 0.0;\r
  if (uHeat.w > 0.5) {\r
    heat = trailHeat(uv) * uHeat.x;\r
    flare = flareHeat(uv) * uHeat.y;\r
  }\r
  float power = uThickness * (1.0 + (heat + flare) * 0.45);\r
\r
  vec2 i = p;\r
  float c = 0.0;\r
  float blurred = 0.0;\r
  float r = length(p + vec2(sin(time), sin(time * 0.3 + 5.0)) * 0.5);\r
  float d = length(p);\r
  float rot = d + time + p.x * uSwirl;\r
  float cosRot = cos(rot);\r
  mat2 warp = mat2(cos(rot - sin(time / 5.0)), sin(rot), -sin(cosRot - time), cosRot) * uFold;\r
  float layers = ceil(uDetail);\r
\r
  for (float n = 0.0; n < 8.0; n++) {\r
    if (n >= layers) break;\r
    p *= warp;\r
    float t = r - time / (n + 3.0);\r
    i -= p + vec2(cos(t - i.x - r) + sin(t + i.y), sin(t - i.y) + cos(t + i.x) + r);\r
    float l = length(vec2(sin(i.x + t), cos(i.y + t)));\r
    float footprint = 0.5 * length(vec2(dFdx(l), dFdy(l)));\r
    l = sqrt(l * l + footprint * footprint);\r
    float weight = clamp(uDetail - n, 0.0, 1.0);\r
    c += weight * uGlow / (power == 1.0 ? l : pow(max(l, 1e-6), power));\r
    if (uReveal.y > 0.5) blurred += weight * uGlow / sqrt(l * l + 0.0025);\r
  }\r
\r
  c /= 6.0;\r
  c *= 1.0 + heat * 0.25 + flare * 0.6;\r
\r
  float reveal = 1.0;\r
  float front = 0.0;\r
  if (uReveal.y > 0.5) {\r
    float level = log(max(blurred / 6.0, 1e-5)) - uReveal.x;\r
    reveal = smoothstep(-1.0, 1.0, level) * smoothstep(0.0, 0.08, uReveal.z);\r
    front = 0.2 * exp(-level * level * 1.5) * smoothstep(-2.6, -0.6, uReveal.x);\r
  }\r
\r
  float g = clamp(max(c - uBlackPoint, 0.0) * uBrightness + front, 0.0, 1.0);\r
  vec3 col = palette(g);\r
  float noise = hash(gl_FragCoord.xy + fract(uClock) * 97.0) - 0.5;\r
  float a;\r
  if (uLight < 0.5) {\r
    a = g + noise * uGrain;\r
  } else {\r
    float lift = max(g - 0.03, 0.0) / 0.97;\r
    a = (1.0 - exp(-6.0 * lift)) / (1.0 - exp(-6.0)) + noise * uGrain * g;\r
  }\r
  a = clamp(a + noise / 255.0, 0.0, 1.0) * reveal * uOpacity;\r
\r
  if (uOpaque > 0.5) {\r
    outColor = vec4(mix(uBackground, col, a), 1.0);\r
  } else {\r
    outColor = vec4(col * a, a);\r
  }\r
}\`;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
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
export default function MoltenMetal({\r
  colors = ['#5227FF', '#FF9FFC'],\r
  coreColor = '#FFFFFF',\r
  backgroundColor = 'transparent',\r
  lightMode = false,\r
  speed = 0.35,\r
  scale = 4,\r
  detail = 3,\r
  glow = 1.6,\r
  thickness = 1,\r
  swirl = 1,\r
  turbulence = 0.2,\r
  haze = 0.75,\r
  brightness = 1.3,\r
  colorMode = 'molten',\r
  rotation = 0,\r
  offsetX = 0,\r
  offsetY = 0,\r
  drift = 0.3,\r
  grain = 0.05,\r
  opacity = 1,\r
  intro = true,\r
  mouseInteraction = true,\r
  mouseStrength = 0.5,\r
  flareOnClick = true,\r
  paused = false,\r
  dpr = 2,\r
  className = '',\r
  style\r
}) {\r
  const containerRef = useRef(null);\r
  const colorKey = [...colors.slice(0, MAX_COLORS - 1), coreColor].join('|');\r
  const palette = useMemo(\r
    () => colorKey.split('|').map(value => parseColor(value, [1, 1, 1]) ?? [1, 1, 1]),\r
    [colorKey]\r
  );\r
  const paper = useMemo(() => parseColor(backgroundColor, null), [backgroundColor]);\r
\r
  const settings = {\r
    palette,\r
    paper,\r
    lightMode,\r
    speed,\r
    scale: Math.max(0.1, scale),\r
    detail: clamp(detail, 1, 8),\r
    glow: Math.max(0, glow),\r
    thickness: clamp(thickness, 0.2, 3),\r
    swirl,\r
    fold: -turbulence,\r
    blackPoint: 0.2 * (1 - clamp(haze, 0, 1)),\r
    brightness: Math.max(0, brightness),\r
    balance: BALANCE[colorMode] ?? 0.5,\r
    rotation: (rotation * Math.PI) / 180,\r
    offset: [offsetX, offsetY],\r
    drift: Math.max(0, drift),\r
    grain: typeof grain === 'number' ? Math.max(0, grain) : grain ? 0.05 : 0,\r
    opacity: clamp(opacity, 0, 1),\r
    intro,\r
    mouseInteraction,\r
    mouseStrength: clamp(mouseStrength, 0, 1),\r
    flareOnClick,\r
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
      'uTime',\r
      'uClock',\r
      'uScale',\r
      'uDetail',\r
      'uGlow',\r
      'uThickness',\r
      'uSwirl',\r
      'uFold',\r
      'uBlackPoint',\r
      'uBrightness',\r
      'uBalance',\r
      'uGrain',\r
      'uOpacity',\r
      'uOffset',\r
      'uRotation',\r
      'uDrift',\r
      'uColors',\r
      'uColorCount',\r
      'uBackground',\r
      'uOpaque',\r
      'uLight',\r
      'uReveal',\r
      'uTrail',\r
      'uTrailWeight',\r
      'uTrailCount',\r
      'uFlares',\r
      'uFlareCount',\r
      'uHeat'\r
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
    const trailData = new Float32Array(TRAIL * 4);\r
    const weightData = new Float32Array(TRAIL);\r
    const flareData = new Float32Array(MAX_FLARES * 4);\r
    const state = {\r
      width: 1,\r
      height: 1,\r
      time: FLOW_START,\r
      clock: 0,\r
      last: 0,\r
      raf: 0,\r
      visible: false,\r
      introAt: -1,\r
      pointer: [0.5, 0.5],\r
      inside: false,\r
      presence: 0,\r
      drift: [0, 0],\r
      trail: [],\r
      flares: [],\r
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
    const toView = point => [(point[0] - 0.5) * (state.width / Math.max(state.height, 1)), 0.5 - point[1]];\r
\r
    const introProgress = (s, reduced) => {\r
      if (!s.intro || reduced || state.introAt < 0) return 1;\r
      return clamp((state.clock - state.introAt) / INTRO_SECONDS, 0, 1);\r
    };\r
\r
    const render = reduced => {\r
      const s = settingsRef.current;\r
      const progress = introProgress(s, reduced);\r
      const aspect = state.width / Math.max(state.height, 1);\r
      gl.viewport(0, 0, state.width, state.height);\r
      gl.uniform2f(u.uResolution, state.width, state.height);\r
      gl.uniform1f(u.uTime, state.time);\r
      gl.uniform1f(u.uClock, state.clock);\r
      gl.uniform1f(u.uScale, s.scale);\r
      gl.uniform1f(u.uDetail, s.detail);\r
      gl.uniform1f(u.uGlow, s.glow * 0.1);\r
      gl.uniform1f(u.uThickness, s.thickness);\r
      gl.uniform1f(u.uSwirl, s.swirl);\r
      gl.uniform1f(u.uFold, s.fold);\r
      gl.uniform1f(u.uBlackPoint, s.blackPoint);\r
      gl.uniform1f(u.uBrightness, s.brightness);\r
      gl.uniform1f(u.uBalance, s.balance);\r
      gl.uniform1f(u.uGrain, s.grain);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.uniform2f(u.uOffset, s.offset[0] * aspect, -s.offset[1]);\r
      gl.uniform2f(u.uRotation, Math.cos(s.rotation), Math.sin(s.rotation));\r
      gl.uniform2f(u.uDrift, state.drift[0], state.drift[1]);\r
      colorData.fill(0);\r
      s.palette.forEach((rgb, index) => colorData.set(rgb, index * 3));\r
      gl.uniform3fv(u.uColors, colorData);\r
      gl.uniform1i(u.uColorCount, s.palette.length);\r
      const paperColor = s.paper ?? [0, 0, 0];\r
      gl.uniform3f(u.uBackground, paperColor[0], paperColor[1], paperColor[2]);\r
      gl.uniform1f(u.uOpaque, s.paper ? 1 : 0);\r
      gl.uniform1f(u.uLight, s.lightMode ? 1 : 0);\r
      gl.uniform3f(u.uReveal, Math.log(1.6) + Math.log(0.01 / 1.6) * progress, progress < 1 ? 1 : 0, progress);\r
      trailData.fill(0);\r
      weightData.fill(0);\r
      state.trail.forEach((point, index) => {\r
        const [x, y] = toView(point.at);\r
        trailData.set([x, y, state.clock - point.time, state.clock - point.arrive], index * 4);\r
        weightData[index] = point.weight;\r
      });\r
      gl.uniform4fv(u.uTrail, trailData);\r
      gl.uniform1fv(u.uTrailWeight, weightData);\r
      gl.uniform1i(u.uTrailCount, state.trail.length);\r
      flareData.fill(0);\r
      state.flares.forEach((flare, index) => {\r
        const [x, y] = toView(flare.at);\r
        flareData.set([x, y, state.clock - flare.time, 1], index * 4);\r
      });\r
      gl.uniform4fv(u.uFlares, flareData);\r
      gl.uniform1i(u.uFlareCount, state.flares.length);\r
      const heating = state.trail.length > 0 || state.flares.length > 0;\r
      gl.uniform4f(u.uHeat, s.mouseStrength * 2, 3.2, 0.2, heating ? 1 : 0);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const updateTrail = (s, dt) => {\r
      const wanted = s.mouseInteraction && state.inside && s.mouseStrength > 0;\r
      state.presence += ((wanted ? 1 : 0) - state.presence) * (1 - Math.exp(-dt / 0.25));\r
      state.trail = state.trail.filter(point => point.live || state.clock - point.time < TRAIL_SECONDS);\r
      const head = state.trail[0];\r
      if (!wanted) {\r
        if (head?.live) head.live = false;\r
        return state.trail.length > 0;\r
      }\r
      if (!head?.live) {\r
        state.trail.unshift({\r
          at: [...state.pointer],\r
          time: state.clock,\r
          arrive: state.clock,\r
          weight: state.presence,\r
          live: true\r
        });\r
      } else {\r
        if (head.at[0] !== state.pointer[0] || head.at[1] !== state.pointer[1]) {\r
          const last = state.trail[1];\r
          const gap = last ? Math.hypot(last.at[0] - head.at[0], last.at[1] - head.at[1]) : Infinity;\r
          const settled = state.clock - head.arrive > SAMPLE_SECONDS;\r
          if (gap > 0.004 && (!last || settled || state.clock - last.time >= SAMPLE_SECONDS)) {\r
            state.trail.splice(1, 0, { ...head, at: [...head.at], time: state.clock, live: false });\r
          }\r
          head.at = [...state.pointer];\r
          head.arrive = state.clock;\r
        }\r
        head.time = state.clock;\r
        head.weight = state.presence;\r
      }\r
      if (state.trail.length > TRAIL) state.trail.length = TRAIL;\r
      return state.trail.length > 0;\r
    };\r
\r
    const tick = now => {\r
      state.raf = requestAnimationFrame(tick);\r
      if (!state.visible || document.hidden) {\r
        state.last = now;\r
        return;\r
      }\r
      const s = settingsRef.current;\r
      const dt = state.last ? Math.min((now - state.last) / 1000, 0.1) : 0;\r
      state.last = now;\r
      const reduced = prefersReduced();\r
      state.clock += dt;\r
      if (state.introAt < 0) state.introAt = state.clock;\r
      if (!s.paused && !reduced) state.time += dt * s.speed;\r
\r
      const leaning = s.mouseInteraction && state.inside && !reduced;\r
      const goalX = leaning ? (state.pointer[0] - 0.5) * s.drift * 2 : 0;\r
      const goalY = leaning ? (0.5 - state.pointer[1]) * s.drift * 2 : 0;\r
      const ease = 1 - Math.exp(-dt / 0.33);\r
      state.drift[0] += (goalX - state.drift[0]) * ease;\r
      state.drift[1] += (goalY - state.drift[1]) * ease;\r
      const drifting = Math.abs(goalX - state.drift[0]) + Math.abs(goalY - state.drift[1]) > 0.0005;\r
\r
      const heating = updateTrail(s, dt);\r
      state.flares = state.flares.filter(flare => state.clock - flare.time < FLARE_SECONDS);\r
\r
      const still = s.paused || reduced;\r
      const transient = heating || drifting || state.flares.length > 0 || introProgress(s, reduced) < 1;\r
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
      if (!s.flareOnClick || event.button !== 0 || prefersReduced()) return;\r
      if (\r
        event.target instanceof Element &&\r
        event.target.closest('a, button, input, textarea, select, label, [role="button"]')\r
      )\r
        return;\r
      const point = local(event);\r
      if (!point.inside) return;\r
      state.flares.push({ at: [point.x, point.y], time: state.clock });\r
      if (state.flares.length > MAX_FLARES) state.flares.shift();\r
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
`,n=`.molten-metal-container {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.molten-metal-canvas {\r
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
const MAX_COLORS = 6;\r
const TRAIL = 16;\r
const MAX_FLARES = 8;\r
const SAMPLE_SECONDS = 0.06;\r
const TRAIL_SECONDS = 0.9;\r
const FLARE_SECONDS = 1.8;\r
const INTRO_SECONDS = 2.4;\r
const FLOW_START = 0.4;\r
const BALANCE = { molten: 0.5, ember: 0.3, frost: 0.7 };\r
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
uniform float uTime;\r
uniform float uClock;\r
uniform float uScale;\r
uniform float uDetail;\r
uniform float uGlow;\r
uniform float uThickness;\r
uniform float uSwirl;\r
uniform float uFold;\r
uniform float uBlackPoint;\r
uniform float uBrightness;\r
uniform float uBalance;\r
uniform float uGrain;\r
uniform float uOpacity;\r
uniform vec2 uOffset;\r
uniform vec2 uRotation;\r
uniform vec2 uDrift;\r
uniform vec3 uColors[\${MAX_COLORS}];\r
uniform int uColorCount;\r
uniform vec3 uBackground;\r
uniform float uOpaque;\r
uniform float uLight;\r
uniform vec3 uReveal;\r
uniform vec4 uTrail[\${TRAIL}];\r
uniform float uTrailWeight[\${TRAIL}];\r
uniform int uTrailCount;\r
uniform vec4 uFlares[\${MAX_FLARES}];\r
uniform int uFlareCount;\r
uniform vec4 uHeat;\r
out vec4 outColor;\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
vec3 palette(float g) {\r
  if (uColorCount <= 1) return uColors[0];\r
  float t = g < uBalance ? 0.5 * g / uBalance : 0.5 + 0.5 * (g - uBalance) / (1.0 - uBalance);\r
  float scaled = t * float(uColorCount - 1);\r
  int index = int(min(floor(scaled), float(uColorCount - 2)));\r
  return mix(uColors[index], uColors[index + 1], smoothstep(0.0, 1.0, scaled - float(index)));\r
}\r
\r
float warmth(float age, float weight, vec2 offset) {\r
  float life = clamp(age / \${TRAIL_SECONDS.toFixed(2)}, 0.0, 1.0);\r
  vec2 spread = offset / (uHeat.z * (1.0 + 0.8 * life));\r
  return weight * (1.0 - life) * (1.0 - life) * exp(-dot(spread, spread));\r
}\r
\r
float trailHeat(vec2 q) {\r
  float heat = 0.0;\r
  for (int k = 0; k < \${TRAIL}; k++) {\r
    if (k >= uTrailCount) break;\r
    vec4 a = uTrail[k];\r
    float weight = uTrailWeight[k];\r
    heat = max(heat, warmth(a.z, weight, q - a.xy));\r
    int next = min(k + 1, \${TRAIL - 1});\r
    if (next == k || next >= uTrailCount) continue;\r
    vec4 b = uTrail[next];\r
    float older = uTrailWeight[next];\r
    vec2 ab = b.xy - a.xy;\r
    float span = dot(ab, ab);\r
    float t = span > 1e-10 ? clamp(dot(q - a.xy, ab) / span, 0.0, 1.0) : 0.0;\r
    float even = smoothstep(0.0, uHeat.z, sqrt(span));\r
    float age = mix(min(a.w, b.z), mix(a.w, b.z, t), even);\r
    float strength = mix(max(weight, older), mix(weight, older, t), even);\r
    heat = max(heat, warmth(age, strength, q - a.xy - ab * t));\r
  }\r
  return heat;\r
}\r
\r
float flareHeat(vec2 q) {\r
  float heat = 0.0;\r
  for (int k = 0; k < \${MAX_FLARES}; k++) {\r
    if (k >= uFlareCount) break;\r
    vec4 f = uFlares[k];\r
    float life = clamp(f.z / \${FLARE_SECONDS.toFixed(2)}, 0.0, 1.0);\r
    float rise = 1.0 - exp(-f.z / 0.07);\r
    float fall = exp(-3.0 * life) * (1.0 - life) * (1.0 - life);\r
    vec2 offset = (q - f.xy) / (uHeat.z * (0.9 + 1.6 * sqrt(life)));\r
    heat += rise * fall * exp(-dot(offset, offset));\r
  }\r
  return heat;\r
}\r
\r
void main() {\r
  float time = uTime;\r
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;\r
  vec2 q = uv - uOffset;\r
  vec2 view = vec2(q.x * uRotation.x - q.y * uRotation.y, q.x * uRotation.y + q.y * uRotation.x);\r
  vec2 p = uScale * view - 0.5;\r
  p += uDrift;\r
\r
  float heat = 0.0;\r
  float flare = 0.0;\r
  if (uHeat.w > 0.5) {\r
    heat = trailHeat(uv) * uHeat.x;\r
    flare = flareHeat(uv) * uHeat.y;\r
  }\r
  float power = uThickness * (1.0 + (heat + flare) * 0.45);\r
\r
  vec2 i = p;\r
  float c = 0.0;\r
  float blurred = 0.0;\r
  float r = length(p + vec2(sin(time), sin(time * 0.3 + 5.0)) * 0.5);\r
  float d = length(p);\r
  float rot = d + time + p.x * uSwirl;\r
  float cosRot = cos(rot);\r
  mat2 warp = mat2(cos(rot - sin(time / 5.0)), sin(rot), -sin(cosRot - time), cosRot) * uFold;\r
  float layers = ceil(uDetail);\r
\r
  for (float n = 0.0; n < 8.0; n++) {\r
    if (n >= layers) break;\r
    p *= warp;\r
    float t = r - time / (n + 3.0);\r
    i -= p + vec2(cos(t - i.x - r) + sin(t + i.y), sin(t - i.y) + cos(t + i.x) + r);\r
    float l = length(vec2(sin(i.x + t), cos(i.y + t)));\r
    float footprint = 0.5 * length(vec2(dFdx(l), dFdy(l)));\r
    l = sqrt(l * l + footprint * footprint);\r
    float weight = clamp(uDetail - n, 0.0, 1.0);\r
    c += weight * uGlow / (power == 1.0 ? l : pow(max(l, 1e-6), power));\r
    if (uReveal.y > 0.5) blurred += weight * uGlow / sqrt(l * l + 0.0025);\r
  }\r
\r
  c /= 6.0;\r
  c *= 1.0 + heat * 0.25 + flare * 0.6;\r
\r
  float reveal = 1.0;\r
  float front = 0.0;\r
  if (uReveal.y > 0.5) {\r
    float level = log(max(blurred / 6.0, 1e-5)) - uReveal.x;\r
    reveal = smoothstep(-1.0, 1.0, level) * smoothstep(0.0, 0.08, uReveal.z);\r
    front = 0.2 * exp(-level * level * 1.5) * smoothstep(-2.6, -0.6, uReveal.x);\r
  }\r
\r
  float g = clamp(max(c - uBlackPoint, 0.0) * uBrightness + front, 0.0, 1.0);\r
  vec3 col = palette(g);\r
  float noise = hash(gl_FragCoord.xy + fract(uClock) * 97.0) - 0.5;\r
  float a;\r
  if (uLight < 0.5) {\r
    a = g + noise * uGrain;\r
  } else {\r
    float lift = max(g - 0.03, 0.0) / 0.97;\r
    a = (1.0 - exp(-6.0 * lift)) / (1.0 - exp(-6.0)) + noise * uGrain * g;\r
  }\r
  a = clamp(a + noise / 255.0, 0.0, 1.0) * reveal * uOpacity;\r
\r
  if (uOpaque > 0.5) {\r
    outColor = vec4(mix(uBackground, col, a), 1.0);\r
  } else {\r
    outColor = vec4(col * a, a);\r
  }\r
}\`;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
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
export default function MoltenMetal({\r
  colors = ['#5227FF', '#FF9FFC'],\r
  coreColor = '#FFFFFF',\r
  backgroundColor = 'transparent',\r
  lightMode = false,\r
  speed = 0.35,\r
  scale = 4,\r
  detail = 3,\r
  glow = 1.6,\r
  thickness = 1,\r
  swirl = 1,\r
  turbulence = 0.2,\r
  haze = 0.75,\r
  brightness = 1.3,\r
  colorMode = 'molten',\r
  rotation = 0,\r
  offsetX = 0,\r
  offsetY = 0,\r
  drift = 0.3,\r
  grain = 0.05,\r
  opacity = 1,\r
  intro = true,\r
  mouseInteraction = true,\r
  mouseStrength = 0.5,\r
  flareOnClick = true,\r
  paused = false,\r
  dpr = 2,\r
  className = '',\r
  style\r
}) {\r
  const containerRef = useRef(null);\r
  const colorKey = [...colors.slice(0, MAX_COLORS - 1), coreColor].join('|');\r
  const palette = useMemo(\r
    () => colorKey.split('|').map(value => parseColor(value, [1, 1, 1]) ?? [1, 1, 1]),\r
    [colorKey]\r
  );\r
  const paper = useMemo(() => parseColor(backgroundColor, null), [backgroundColor]);\r
\r
  const settings = {\r
    palette,\r
    paper,\r
    lightMode,\r
    speed,\r
    scale: Math.max(0.1, scale),\r
    detail: clamp(detail, 1, 8),\r
    glow: Math.max(0, glow),\r
    thickness: clamp(thickness, 0.2, 3),\r
    swirl,\r
    fold: -turbulence,\r
    blackPoint: 0.2 * (1 - clamp(haze, 0, 1)),\r
    brightness: Math.max(0, brightness),\r
    balance: BALANCE[colorMode] ?? 0.5,\r
    rotation: (rotation * Math.PI) / 180,\r
    offset: [offsetX, offsetY],\r
    drift: Math.max(0, drift),\r
    grain: typeof grain === 'number' ? Math.max(0, grain) : grain ? 0.05 : 0,\r
    opacity: clamp(opacity, 0, 1),\r
    intro,\r
    mouseInteraction,\r
    mouseStrength: clamp(mouseStrength, 0, 1),\r
    flareOnClick,\r
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
      'uTime',\r
      'uClock',\r
      'uScale',\r
      'uDetail',\r
      'uGlow',\r
      'uThickness',\r
      'uSwirl',\r
      'uFold',\r
      'uBlackPoint',\r
      'uBrightness',\r
      'uBalance',\r
      'uGrain',\r
      'uOpacity',\r
      'uOffset',\r
      'uRotation',\r
      'uDrift',\r
      'uColors',\r
      'uColorCount',\r
      'uBackground',\r
      'uOpaque',\r
      'uLight',\r
      'uReveal',\r
      'uTrail',\r
      'uTrailWeight',\r
      'uTrailCount',\r
      'uFlares',\r
      'uFlareCount',\r
      'uHeat'\r
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
    const trailData = new Float32Array(TRAIL * 4);\r
    const weightData = new Float32Array(TRAIL);\r
    const flareData = new Float32Array(MAX_FLARES * 4);\r
    const state = {\r
      width: 1,\r
      height: 1,\r
      time: FLOW_START,\r
      clock: 0,\r
      last: 0,\r
      raf: 0,\r
      visible: false,\r
      introAt: -1,\r
      pointer: [0.5, 0.5],\r
      inside: false,\r
      presence: 0,\r
      drift: [0, 0],\r
      trail: [],\r
      flares: [],\r
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
    const toView = point => [(point[0] - 0.5) * (state.width / Math.max(state.height, 1)), 0.5 - point[1]];\r
\r
    const introProgress = (s, reduced) => {\r
      if (!s.intro || reduced || state.introAt < 0) return 1;\r
      return clamp((state.clock - state.introAt) / INTRO_SECONDS, 0, 1);\r
    };\r
\r
    const render = reduced => {\r
      const s = settingsRef.current;\r
      const progress = introProgress(s, reduced);\r
      const aspect = state.width / Math.max(state.height, 1);\r
      gl.viewport(0, 0, state.width, state.height);\r
      gl.uniform2f(u.uResolution, state.width, state.height);\r
      gl.uniform1f(u.uTime, state.time);\r
      gl.uniform1f(u.uClock, state.clock);\r
      gl.uniform1f(u.uScale, s.scale);\r
      gl.uniform1f(u.uDetail, s.detail);\r
      gl.uniform1f(u.uGlow, s.glow * 0.1);\r
      gl.uniform1f(u.uThickness, s.thickness);\r
      gl.uniform1f(u.uSwirl, s.swirl);\r
      gl.uniform1f(u.uFold, s.fold);\r
      gl.uniform1f(u.uBlackPoint, s.blackPoint);\r
      gl.uniform1f(u.uBrightness, s.brightness);\r
      gl.uniform1f(u.uBalance, s.balance);\r
      gl.uniform1f(u.uGrain, s.grain);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.uniform2f(u.uOffset, s.offset[0] * aspect, -s.offset[1]);\r
      gl.uniform2f(u.uRotation, Math.cos(s.rotation), Math.sin(s.rotation));\r
      gl.uniform2f(u.uDrift, state.drift[0], state.drift[1]);\r
      colorData.fill(0);\r
      s.palette.forEach((rgb, index) => colorData.set(rgb, index * 3));\r
      gl.uniform3fv(u.uColors, colorData);\r
      gl.uniform1i(u.uColorCount, s.palette.length);\r
      const paperColor = s.paper ?? [0, 0, 0];\r
      gl.uniform3f(u.uBackground, paperColor[0], paperColor[1], paperColor[2]);\r
      gl.uniform1f(u.uOpaque, s.paper ? 1 : 0);\r
      gl.uniform1f(u.uLight, s.lightMode ? 1 : 0);\r
      gl.uniform3f(u.uReveal, Math.log(1.6) + Math.log(0.01 / 1.6) * progress, progress < 1 ? 1 : 0, progress);\r
      trailData.fill(0);\r
      weightData.fill(0);\r
      state.trail.forEach((point, index) => {\r
        const [x, y] = toView(point.at);\r
        trailData.set([x, y, state.clock - point.time, state.clock - point.arrive], index * 4);\r
        weightData[index] = point.weight;\r
      });\r
      gl.uniform4fv(u.uTrail, trailData);\r
      gl.uniform1fv(u.uTrailWeight, weightData);\r
      gl.uniform1i(u.uTrailCount, state.trail.length);\r
      flareData.fill(0);\r
      state.flares.forEach((flare, index) => {\r
        const [x, y] = toView(flare.at);\r
        flareData.set([x, y, state.clock - flare.time, 1], index * 4);\r
      });\r
      gl.uniform4fv(u.uFlares, flareData);\r
      gl.uniform1i(u.uFlareCount, state.flares.length);\r
      const heating = state.trail.length > 0 || state.flares.length > 0;\r
      gl.uniform4f(u.uHeat, s.mouseStrength * 2, 3.2, 0.2, heating ? 1 : 0);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const updateTrail = (s, dt) => {\r
      const wanted = s.mouseInteraction && state.inside && s.mouseStrength > 0;\r
      state.presence += ((wanted ? 1 : 0) - state.presence) * (1 - Math.exp(-dt / 0.25));\r
      state.trail = state.trail.filter(point => point.live || state.clock - point.time < TRAIL_SECONDS);\r
      const head = state.trail[0];\r
      if (!wanted) {\r
        if (head?.live) head.live = false;\r
        return state.trail.length > 0;\r
      }\r
      if (!head?.live) {\r
        state.trail.unshift({\r
          at: [...state.pointer],\r
          time: state.clock,\r
          arrive: state.clock,\r
          weight: state.presence,\r
          live: true\r
        });\r
      } else {\r
        if (head.at[0] !== state.pointer[0] || head.at[1] !== state.pointer[1]) {\r
          const last = state.trail[1];\r
          const gap = last ? Math.hypot(last.at[0] - head.at[0], last.at[1] - head.at[1]) : Infinity;\r
          const settled = state.clock - head.arrive > SAMPLE_SECONDS;\r
          if (gap > 0.004 && (!last || settled || state.clock - last.time >= SAMPLE_SECONDS)) {\r
            state.trail.splice(1, 0, { ...head, at: [...head.at], time: state.clock, live: false });\r
          }\r
          head.at = [...state.pointer];\r
          head.arrive = state.clock;\r
        }\r
        head.time = state.clock;\r
        head.weight = state.presence;\r
      }\r
      if (state.trail.length > TRAIL) state.trail.length = TRAIL;\r
      return state.trail.length > 0;\r
    };\r
\r
    const tick = now => {\r
      state.raf = requestAnimationFrame(tick);\r
      if (!state.visible || document.hidden) {\r
        state.last = now;\r
        return;\r
      }\r
      const s = settingsRef.current;\r
      const dt = state.last ? Math.min((now - state.last) / 1000, 0.1) : 0;\r
      state.last = now;\r
      const reduced = prefersReduced();\r
      state.clock += dt;\r
      if (state.introAt < 0) state.introAt = state.clock;\r
      if (!s.paused && !reduced) state.time += dt * s.speed;\r
\r
      const leaning = s.mouseInteraction && state.inside && !reduced;\r
      const goalX = leaning ? (state.pointer[0] - 0.5) * s.drift * 2 : 0;\r
      const goalY = leaning ? (0.5 - state.pointer[1]) * s.drift * 2 : 0;\r
      const ease = 1 - Math.exp(-dt / 0.33);\r
      state.drift[0] += (goalX - state.drift[0]) * ease;\r
      state.drift[1] += (goalY - state.drift[1]) * ease;\r
      const drifting = Math.abs(goalX - state.drift[0]) + Math.abs(goalY - state.drift[1]) > 0.0005;\r
\r
      const heating = updateTrail(s, dt);\r
      state.flares = state.flares.filter(flare => state.clock - flare.time < FLARE_SECONDS);\r
\r
      const still = s.paused || reduced;\r
      const transient = heating || drifting || state.flares.length > 0 || introProgress(s, reduced) < 1;\r
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
      if (!s.flareOnClick || event.button !== 0 || prefersReduced()) return;\r
      if (\r
        event.target instanceof Element &&\r
        event.target.closest('a, button, input, textarea, select, label, [role="button"]')\r
      )\r
        return;\r
      const point = local(event);\r
      if (!point.inside) return;\r
      state.flares.push({ at: [point.x, point.y], time: state.clock });\r
      if (state.flares.length > MAX_FLARES) state.flares.shift();\r
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
import './MoltenMetal.css';\r
\r
export interface MoltenMetalProps {\r
  colors?: string[];\r
  coreColor?: string;\r
  backgroundColor?: string;\r
  lightMode?: boolean;\r
  speed?: number;\r
  scale?: number;\r
  detail?: number;\r
  glow?: number;\r
  thickness?: number;\r
  swirl?: number;\r
  turbulence?: number;\r
  haze?: number;\r
  brightness?: number;\r
  colorMode?: 'molten' | 'ember' | 'frost';\r
  rotation?: number;\r
  offsetX?: number;\r
  offsetY?: number;\r
  drift?: number;\r
  grain?: number;\r
  opacity?: number;\r
  intro?: boolean;\r
  mouseInteraction?: boolean;\r
  mouseStrength?: number;\r
  flareOnClick?: boolean;\r
  paused?: boolean;\r
  dpr?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
type RGB = [number, number, number];\r
\r
interface TrailPoint {\r
  at: number[];\r
  time: number;\r
  arrive: number;\r
  weight: number;\r
  live: boolean;\r
}\r
\r
interface Flare {\r
  at: number[];\r
  time: number;\r
}\r
\r
const ROOT = 'molten-metal-container';\r
const CANVAS = 'molten-metal-canvas';\r
\r
const MAX_COLORS = 6;\r
const TRAIL = 16;\r
const MAX_FLARES = 8;\r
const SAMPLE_SECONDS = 0.06;\r
const TRAIL_SECONDS = 0.9;\r
const FLARE_SECONDS = 1.8;\r
const INTRO_SECONDS = 2.4;\r
const FLOW_START = 0.4;\r
const BALANCE: Record<string, number> = { molten: 0.5, ember: 0.3, frost: 0.7 };\r
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
uniform float uTime;\r
uniform float uClock;\r
uniform float uScale;\r
uniform float uDetail;\r
uniform float uGlow;\r
uniform float uThickness;\r
uniform float uSwirl;\r
uniform float uFold;\r
uniform float uBlackPoint;\r
uniform float uBrightness;\r
uniform float uBalance;\r
uniform float uGrain;\r
uniform float uOpacity;\r
uniform vec2 uOffset;\r
uniform vec2 uRotation;\r
uniform vec2 uDrift;\r
uniform vec3 uColors[\${MAX_COLORS}];\r
uniform int uColorCount;\r
uniform vec3 uBackground;\r
uniform float uOpaque;\r
uniform float uLight;\r
uniform vec3 uReveal;\r
uniform vec4 uTrail[\${TRAIL}];\r
uniform float uTrailWeight[\${TRAIL}];\r
uniform int uTrailCount;\r
uniform vec4 uFlares[\${MAX_FLARES}];\r
uniform int uFlareCount;\r
uniform vec4 uHeat;\r
out vec4 outColor;\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
vec3 palette(float g) {\r
  if (uColorCount <= 1) return uColors[0];\r
  float t = g < uBalance ? 0.5 * g / uBalance : 0.5 + 0.5 * (g - uBalance) / (1.0 - uBalance);\r
  float scaled = t * float(uColorCount - 1);\r
  int index = int(min(floor(scaled), float(uColorCount - 2)));\r
  return mix(uColors[index], uColors[index + 1], smoothstep(0.0, 1.0, scaled - float(index)));\r
}\r
\r
float warmth(float age, float weight, vec2 offset) {\r
  float life = clamp(age / \${TRAIL_SECONDS.toFixed(2)}, 0.0, 1.0);\r
  vec2 spread = offset / (uHeat.z * (1.0 + 0.8 * life));\r
  return weight * (1.0 - life) * (1.0 - life) * exp(-dot(spread, spread));\r
}\r
\r
float trailHeat(vec2 q) {\r
  float heat = 0.0;\r
  for (int k = 0; k < \${TRAIL}; k++) {\r
    if (k >= uTrailCount) break;\r
    vec4 a = uTrail[k];\r
    float weight = uTrailWeight[k];\r
    heat = max(heat, warmth(a.z, weight, q - a.xy));\r
    int next = min(k + 1, \${TRAIL - 1});\r
    if (next == k || next >= uTrailCount) continue;\r
    vec4 b = uTrail[next];\r
    float older = uTrailWeight[next];\r
    vec2 ab = b.xy - a.xy;\r
    float span = dot(ab, ab);\r
    float t = span > 1e-10 ? clamp(dot(q - a.xy, ab) / span, 0.0, 1.0) : 0.0;\r
    float even = smoothstep(0.0, uHeat.z, sqrt(span));\r
    float age = mix(min(a.w, b.z), mix(a.w, b.z, t), even);\r
    float strength = mix(max(weight, older), mix(weight, older, t), even);\r
    heat = max(heat, warmth(age, strength, q - a.xy - ab * t));\r
  }\r
  return heat;\r
}\r
\r
float flareHeat(vec2 q) {\r
  float heat = 0.0;\r
  for (int k = 0; k < \${MAX_FLARES}; k++) {\r
    if (k >= uFlareCount) break;\r
    vec4 f = uFlares[k];\r
    float life = clamp(f.z / \${FLARE_SECONDS.toFixed(2)}, 0.0, 1.0);\r
    float rise = 1.0 - exp(-f.z / 0.07);\r
    float fall = exp(-3.0 * life) * (1.0 - life) * (1.0 - life);\r
    vec2 offset = (q - f.xy) / (uHeat.z * (0.9 + 1.6 * sqrt(life)));\r
    heat += rise * fall * exp(-dot(offset, offset));\r
  }\r
  return heat;\r
}\r
\r
void main() {\r
  float time = uTime;\r
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;\r
  vec2 q = uv - uOffset;\r
  vec2 view = vec2(q.x * uRotation.x - q.y * uRotation.y, q.x * uRotation.y + q.y * uRotation.x);\r
  vec2 p = uScale * view - 0.5;\r
  p += uDrift;\r
\r
  float heat = 0.0;\r
  float flare = 0.0;\r
  if (uHeat.w > 0.5) {\r
    heat = trailHeat(uv) * uHeat.x;\r
    flare = flareHeat(uv) * uHeat.y;\r
  }\r
  float power = uThickness * (1.0 + (heat + flare) * 0.45);\r
\r
  vec2 i = p;\r
  float c = 0.0;\r
  float blurred = 0.0;\r
  float r = length(p + vec2(sin(time), sin(time * 0.3 + 5.0)) * 0.5);\r
  float d = length(p);\r
  float rot = d + time + p.x * uSwirl;\r
  float cosRot = cos(rot);\r
  mat2 warp = mat2(cos(rot - sin(time / 5.0)), sin(rot), -sin(cosRot - time), cosRot) * uFold;\r
  float layers = ceil(uDetail);\r
\r
  for (float n = 0.0; n < 8.0; n++) {\r
    if (n >= layers) break;\r
    p *= warp;\r
    float t = r - time / (n + 3.0);\r
    i -= p + vec2(cos(t - i.x - r) + sin(t + i.y), sin(t - i.y) + cos(t + i.x) + r);\r
    float l = length(vec2(sin(i.x + t), cos(i.y + t)));\r
    float footprint = 0.5 * length(vec2(dFdx(l), dFdy(l)));\r
    l = sqrt(l * l + footprint * footprint);\r
    float weight = clamp(uDetail - n, 0.0, 1.0);\r
    c += weight * uGlow / (power == 1.0 ? l : pow(max(l, 1e-6), power));\r
    if (uReveal.y > 0.5) blurred += weight * uGlow / sqrt(l * l + 0.0025);\r
  }\r
\r
  c /= 6.0;\r
  c *= 1.0 + heat * 0.25 + flare * 0.6;\r
\r
  float reveal = 1.0;\r
  float front = 0.0;\r
  if (uReveal.y > 0.5) {\r
    float level = log(max(blurred / 6.0, 1e-5)) - uReveal.x;\r
    reveal = smoothstep(-1.0, 1.0, level) * smoothstep(0.0, 0.08, uReveal.z);\r
    front = 0.2 * exp(-level * level * 1.5) * smoothstep(-2.6, -0.6, uReveal.x);\r
  }\r
\r
  float g = clamp(max(c - uBlackPoint, 0.0) * uBrightness + front, 0.0, 1.0);\r
  vec3 col = palette(g);\r
  float noise = hash(gl_FragCoord.xy + fract(uClock) * 97.0) - 0.5;\r
  float a;\r
  if (uLight < 0.5) {\r
    a = g + noise * uGrain;\r
  } else {\r
    float lift = max(g - 0.03, 0.0) / 0.97;\r
    a = (1.0 - exp(-6.0 * lift)) / (1.0 - exp(-6.0)) + noise * uGrain * g;\r
  }\r
  a = clamp(a + noise / 255.0, 0.0, 1.0) * reveal * uOpacity;\r
\r
  if (uOpaque > 0.5) {\r
    outColor = vec4(mix(uBackground, col, a), 1.0);\r
  } else {\r
    outColor = vec4(col * a, a);\r
  }\r
}\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
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
export default function MoltenMetal({\r
  colors = ['#5227FF', '#FF9FFC'],\r
  coreColor = '#FFFFFF',\r
  backgroundColor = 'transparent',\r
  lightMode = false,\r
  speed = 0.35,\r
  scale = 4,\r
  detail = 3,\r
  glow = 1.6,\r
  thickness = 1,\r
  swirl = 1,\r
  turbulence = 0.2,\r
  haze = 0.75,\r
  brightness = 1.3,\r
  colorMode = 'molten',\r
  rotation = 0,\r
  offsetX = 0,\r
  offsetY = 0,\r
  drift = 0.3,\r
  grain = 0.05,\r
  opacity = 1,\r
  intro = true,\r
  mouseInteraction = true,\r
  mouseStrength = 0.5,\r
  flareOnClick = true,\r
  paused = false,\r
  dpr = 2,\r
  className = '',\r
  style\r
}: MoltenMetalProps) {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const colorKey = [...colors.slice(0, MAX_COLORS - 1), coreColor].join('|');\r
  const palette = useMemo(\r
    () => colorKey.split('|').map((value): RGB => parseColor(value, [1, 1, 1]) ?? [1, 1, 1]),\r
    [colorKey]\r
  );\r
  const paper = useMemo(() => parseColor(backgroundColor, null), [backgroundColor]);\r
\r
  const settings = {\r
    palette,\r
    paper,\r
    lightMode,\r
    speed,\r
    scale: Math.max(0.1, scale),\r
    detail: clamp(detail, 1, 8),\r
    glow: Math.max(0, glow),\r
    thickness: clamp(thickness, 0.2, 3),\r
    swirl,\r
    fold: -turbulence,\r
    blackPoint: 0.2 * (1 - clamp(haze, 0, 1)),\r
    brightness: Math.max(0, brightness),\r
    balance: BALANCE[colorMode] ?? 0.5,\r
    rotation: (rotation * Math.PI) / 180,\r
    offset: [offsetX, offsetY],\r
    drift: Math.max(0, drift),\r
    grain: typeof grain === 'number' ? Math.max(0, grain) : grain ? 0.05 : 0,\r
    opacity: clamp(opacity, 0, 1),\r
    intro,\r
    mouseInteraction,\r
    mouseStrength: clamp(mouseStrength, 0, 1),\r
    flareOnClick,\r
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
      'uTime',\r
      'uClock',\r
      'uScale',\r
      'uDetail',\r
      'uGlow',\r
      'uThickness',\r
      'uSwirl',\r
      'uFold',\r
      'uBlackPoint',\r
      'uBrightness',\r
      'uBalance',\r
      'uGrain',\r
      'uOpacity',\r
      'uOffset',\r
      'uRotation',\r
      'uDrift',\r
      'uColors',\r
      'uColorCount',\r
      'uBackground',\r
      'uOpaque',\r
      'uLight',\r
      'uReveal',\r
      'uTrail',\r
      'uTrailWeight',\r
      'uTrailCount',\r
      'uFlares',\r
      'uFlareCount',\r
      'uHeat'\r
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
    const trailData = new Float32Array(TRAIL * 4);\r
    const weightData = new Float32Array(TRAIL);\r
    const flareData = new Float32Array(MAX_FLARES * 4);\r
    const state = {\r
      width: 1,\r
      height: 1,\r
      time: FLOW_START,\r
      clock: 0,\r
      last: 0,\r
      raf: 0,\r
      visible: false,\r
      introAt: -1,\r
      pointer: [0.5, 0.5],\r
      inside: false,\r
      presence: 0,\r
      drift: [0, 0],\r
      trail: [] as TrailPoint[],\r
      flares: [] as Flare[],\r
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
    const toView = (point: number[]) => [(point[0] - 0.5) * (state.width / Math.max(state.height, 1)), 0.5 - point[1]];\r
\r
    const introProgress = (s: typeof settings, reduced: boolean) => {\r
      if (!s.intro || reduced || state.introAt < 0) return 1;\r
      return clamp((state.clock - state.introAt) / INTRO_SECONDS, 0, 1);\r
    };\r
\r
    const render = (reduced: boolean) => {\r
      const s = settingsRef.current;\r
      const progress = introProgress(s, reduced);\r
      const aspect = state.width / Math.max(state.height, 1);\r
      gl.viewport(0, 0, state.width, state.height);\r
      gl.uniform2f(u.uResolution, state.width, state.height);\r
      gl.uniform1f(u.uTime, state.time);\r
      gl.uniform1f(u.uClock, state.clock);\r
      gl.uniform1f(u.uScale, s.scale);\r
      gl.uniform1f(u.uDetail, s.detail);\r
      gl.uniform1f(u.uGlow, s.glow * 0.1);\r
      gl.uniform1f(u.uThickness, s.thickness);\r
      gl.uniform1f(u.uSwirl, s.swirl);\r
      gl.uniform1f(u.uFold, s.fold);\r
      gl.uniform1f(u.uBlackPoint, s.blackPoint);\r
      gl.uniform1f(u.uBrightness, s.brightness);\r
      gl.uniform1f(u.uBalance, s.balance);\r
      gl.uniform1f(u.uGrain, s.grain);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.uniform2f(u.uOffset, s.offset[0] * aspect, -s.offset[1]);\r
      gl.uniform2f(u.uRotation, Math.cos(s.rotation), Math.sin(s.rotation));\r
      gl.uniform2f(u.uDrift, state.drift[0], state.drift[1]);\r
      colorData.fill(0);\r
      s.palette.forEach((rgb, index) => colorData.set(rgb, index * 3));\r
      gl.uniform3fv(u.uColors, colorData);\r
      gl.uniform1i(u.uColorCount, s.palette.length);\r
      const paperColor = s.paper ?? [0, 0, 0];\r
      gl.uniform3f(u.uBackground, paperColor[0], paperColor[1], paperColor[2]);\r
      gl.uniform1f(u.uOpaque, s.paper ? 1 : 0);\r
      gl.uniform1f(u.uLight, s.lightMode ? 1 : 0);\r
      gl.uniform3f(u.uReveal, Math.log(1.6) + Math.log(0.01 / 1.6) * progress, progress < 1 ? 1 : 0, progress);\r
      trailData.fill(0);\r
      weightData.fill(0);\r
      state.trail.forEach((point, index) => {\r
        const [x, y] = toView(point.at);\r
        trailData.set([x, y, state.clock - point.time, state.clock - point.arrive], index * 4);\r
        weightData[index] = point.weight;\r
      });\r
      gl.uniform4fv(u.uTrail, trailData);\r
      gl.uniform1fv(u.uTrailWeight, weightData);\r
      gl.uniform1i(u.uTrailCount, state.trail.length);\r
      flareData.fill(0);\r
      state.flares.forEach((flare, index) => {\r
        const [x, y] = toView(flare.at);\r
        flareData.set([x, y, state.clock - flare.time, 1], index * 4);\r
      });\r
      gl.uniform4fv(u.uFlares, flareData);\r
      gl.uniform1i(u.uFlareCount, state.flares.length);\r
      const heating = state.trail.length > 0 || state.flares.length > 0;\r
      gl.uniform4f(u.uHeat, s.mouseStrength * 2, 3.2, 0.2, heating ? 1 : 0);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const updateTrail = (s: typeof settings, dt: number) => {\r
      const wanted = s.mouseInteraction && state.inside && s.mouseStrength > 0;\r
      state.presence += ((wanted ? 1 : 0) - state.presence) * (1 - Math.exp(-dt / 0.25));\r
      state.trail = state.trail.filter(point => point.live || state.clock - point.time < TRAIL_SECONDS);\r
      const head = state.trail[0];\r
      if (!wanted) {\r
        if (head?.live) head.live = false;\r
        return state.trail.length > 0;\r
      }\r
      if (!head?.live) {\r
        state.trail.unshift({\r
          at: [...state.pointer],\r
          time: state.clock,\r
          arrive: state.clock,\r
          weight: state.presence,\r
          live: true\r
        });\r
      } else {\r
        if (head.at[0] !== state.pointer[0] || head.at[1] !== state.pointer[1]) {\r
          const last = state.trail[1];\r
          const gap = last ? Math.hypot(last.at[0] - head.at[0], last.at[1] - head.at[1]) : Infinity;\r
          const settled = state.clock - head.arrive > SAMPLE_SECONDS;\r
          if (gap > 0.004 && (!last || settled || state.clock - last.time >= SAMPLE_SECONDS)) {\r
            state.trail.splice(1, 0, { ...head, at: [...head.at], time: state.clock, live: false });\r
          }\r
          head.at = [...state.pointer];\r
          head.arrive = state.clock;\r
        }\r
        head.time = state.clock;\r
        head.weight = state.presence;\r
      }\r
      if (state.trail.length > TRAIL) state.trail.length = TRAIL;\r
      return state.trail.length > 0;\r
    };\r
\r
    const tick = (now: number) => {\r
      state.raf = requestAnimationFrame(tick);\r
      if (!state.visible || document.hidden) {\r
        state.last = now;\r
        return;\r
      }\r
      const s = settingsRef.current;\r
      const dt = state.last ? Math.min((now - state.last) / 1000, 0.1) : 0;\r
      state.last = now;\r
      const reduced = prefersReduced();\r
      state.clock += dt;\r
      if (state.introAt < 0) state.introAt = state.clock;\r
      if (!s.paused && !reduced) state.time += dt * s.speed;\r
\r
      const leaning = s.mouseInteraction && state.inside && !reduced;\r
      const goalX = leaning ? (state.pointer[0] - 0.5) * s.drift * 2 : 0;\r
      const goalY = leaning ? (0.5 - state.pointer[1]) * s.drift * 2 : 0;\r
      const ease = 1 - Math.exp(-dt / 0.33);\r
      state.drift[0] += (goalX - state.drift[0]) * ease;\r
      state.drift[1] += (goalY - state.drift[1]) * ease;\r
      const drifting = Math.abs(goalX - state.drift[0]) + Math.abs(goalY - state.drift[1]) > 0.0005;\r
\r
      const heating = updateTrail(s, dt);\r
      state.flares = state.flares.filter(flare => state.clock - flare.time < FLARE_SECONDS);\r
\r
      const still = s.paused || reduced;\r
      const transient = heating || drifting || state.flares.length > 0 || introProgress(s, reduced) < 1;\r
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
      if (!s.flareOnClick || event.button !== 0 || prefersReduced()) return;\r
      if (\r
        event.target instanceof Element &&\r
        event.target.closest('a, button, input, textarea, select, label, [role="button"]')\r
      )\r
        return;\r
      const point = local(event);\r
      if (!point.inside) return;\r
      state.flares.push({ at: [point.x, point.y], time: state.clock });\r
      if (state.flares.length > MAX_FLARES) state.flares.shift();\r
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
`,a=`'use client';\r
\r
import { useEffect, useMemo, useRef, type CSSProperties } from 'react';\r
\r
export interface MoltenMetalProps {\r
  colors?: string[];\r
  coreColor?: string;\r
  backgroundColor?: string;\r
  lightMode?: boolean;\r
  speed?: number;\r
  scale?: number;\r
  detail?: number;\r
  glow?: number;\r
  thickness?: number;\r
  swirl?: number;\r
  turbulence?: number;\r
  haze?: number;\r
  brightness?: number;\r
  colorMode?: 'molten' | 'ember' | 'frost';\r
  rotation?: number;\r
  offsetX?: number;\r
  offsetY?: number;\r
  drift?: number;\r
  grain?: number;\r
  opacity?: number;\r
  intro?: boolean;\r
  mouseInteraction?: boolean;\r
  mouseStrength?: number;\r
  flareOnClick?: boolean;\r
  paused?: boolean;\r
  dpr?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
type RGB = [number, number, number];\r
\r
interface TrailPoint {\r
  at: number[];\r
  time: number;\r
  arrive: number;\r
  weight: number;\r
  live: boolean;\r
}\r
\r
interface Flare {\r
  at: number[];\r
  time: number;\r
}\r
\r
const ROOT = 'relative h-full w-full overflow-hidden';\r
const CANVAS = 'absolute inset-0 block h-full w-full';\r
\r
const MAX_COLORS = 6;\r
const TRAIL = 16;\r
const MAX_FLARES = 8;\r
const SAMPLE_SECONDS = 0.06;\r
const TRAIL_SECONDS = 0.9;\r
const FLARE_SECONDS = 1.8;\r
const INTRO_SECONDS = 2.4;\r
const FLOW_START = 0.4;\r
const BALANCE: Record<string, number> = { molten: 0.5, ember: 0.3, frost: 0.7 };\r
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
uniform float uTime;\r
uniform float uClock;\r
uniform float uScale;\r
uniform float uDetail;\r
uniform float uGlow;\r
uniform float uThickness;\r
uniform float uSwirl;\r
uniform float uFold;\r
uniform float uBlackPoint;\r
uniform float uBrightness;\r
uniform float uBalance;\r
uniform float uGrain;\r
uniform float uOpacity;\r
uniform vec2 uOffset;\r
uniform vec2 uRotation;\r
uniform vec2 uDrift;\r
uniform vec3 uColors[\${MAX_COLORS}];\r
uniform int uColorCount;\r
uniform vec3 uBackground;\r
uniform float uOpaque;\r
uniform float uLight;\r
uniform vec3 uReveal;\r
uniform vec4 uTrail[\${TRAIL}];\r
uniform float uTrailWeight[\${TRAIL}];\r
uniform int uTrailCount;\r
uniform vec4 uFlares[\${MAX_FLARES}];\r
uniform int uFlareCount;\r
uniform vec4 uHeat;\r
out vec4 outColor;\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
vec3 palette(float g) {\r
  if (uColorCount <= 1) return uColors[0];\r
  float t = g < uBalance ? 0.5 * g / uBalance : 0.5 + 0.5 * (g - uBalance) / (1.0 - uBalance);\r
  float scaled = t * float(uColorCount - 1);\r
  int index = int(min(floor(scaled), float(uColorCount - 2)));\r
  return mix(uColors[index], uColors[index + 1], smoothstep(0.0, 1.0, scaled - float(index)));\r
}\r
\r
float warmth(float age, float weight, vec2 offset) {\r
  float life = clamp(age / \${TRAIL_SECONDS.toFixed(2)}, 0.0, 1.0);\r
  vec2 spread = offset / (uHeat.z * (1.0 + 0.8 * life));\r
  return weight * (1.0 - life) * (1.0 - life) * exp(-dot(spread, spread));\r
}\r
\r
float trailHeat(vec2 q) {\r
  float heat = 0.0;\r
  for (int k = 0; k < \${TRAIL}; k++) {\r
    if (k >= uTrailCount) break;\r
    vec4 a = uTrail[k];\r
    float weight = uTrailWeight[k];\r
    heat = max(heat, warmth(a.z, weight, q - a.xy));\r
    int next = min(k + 1, \${TRAIL - 1});\r
    if (next == k || next >= uTrailCount) continue;\r
    vec4 b = uTrail[next];\r
    float older = uTrailWeight[next];\r
    vec2 ab = b.xy - a.xy;\r
    float span = dot(ab, ab);\r
    float t = span > 1e-10 ? clamp(dot(q - a.xy, ab) / span, 0.0, 1.0) : 0.0;\r
    float even = smoothstep(0.0, uHeat.z, sqrt(span));\r
    float age = mix(min(a.w, b.z), mix(a.w, b.z, t), even);\r
    float strength = mix(max(weight, older), mix(weight, older, t), even);\r
    heat = max(heat, warmth(age, strength, q - a.xy - ab * t));\r
  }\r
  return heat;\r
}\r
\r
float flareHeat(vec2 q) {\r
  float heat = 0.0;\r
  for (int k = 0; k < \${MAX_FLARES}; k++) {\r
    if (k >= uFlareCount) break;\r
    vec4 f = uFlares[k];\r
    float life = clamp(f.z / \${FLARE_SECONDS.toFixed(2)}, 0.0, 1.0);\r
    float rise = 1.0 - exp(-f.z / 0.07);\r
    float fall = exp(-3.0 * life) * (1.0 - life) * (1.0 - life);\r
    vec2 offset = (q - f.xy) / (uHeat.z * (0.9 + 1.6 * sqrt(life)));\r
    heat += rise * fall * exp(-dot(offset, offset));\r
  }\r
  return heat;\r
}\r
\r
void main() {\r
  float time = uTime;\r
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;\r
  vec2 q = uv - uOffset;\r
  vec2 view = vec2(q.x * uRotation.x - q.y * uRotation.y, q.x * uRotation.y + q.y * uRotation.x);\r
  vec2 p = uScale * view - 0.5;\r
  p += uDrift;\r
\r
  float heat = 0.0;\r
  float flare = 0.0;\r
  if (uHeat.w > 0.5) {\r
    heat = trailHeat(uv) * uHeat.x;\r
    flare = flareHeat(uv) * uHeat.y;\r
  }\r
  float power = uThickness * (1.0 + (heat + flare) * 0.45);\r
\r
  vec2 i = p;\r
  float c = 0.0;\r
  float blurred = 0.0;\r
  float r = length(p + vec2(sin(time), sin(time * 0.3 + 5.0)) * 0.5);\r
  float d = length(p);\r
  float rot = d + time + p.x * uSwirl;\r
  float cosRot = cos(rot);\r
  mat2 warp = mat2(cos(rot - sin(time / 5.0)), sin(rot), -sin(cosRot - time), cosRot) * uFold;\r
  float layers = ceil(uDetail);\r
\r
  for (float n = 0.0; n < 8.0; n++) {\r
    if (n >= layers) break;\r
    p *= warp;\r
    float t = r - time / (n + 3.0);\r
    i -= p + vec2(cos(t - i.x - r) + sin(t + i.y), sin(t - i.y) + cos(t + i.x) + r);\r
    float l = length(vec2(sin(i.x + t), cos(i.y + t)));\r
    float footprint = 0.5 * length(vec2(dFdx(l), dFdy(l)));\r
    l = sqrt(l * l + footprint * footprint);\r
    float weight = clamp(uDetail - n, 0.0, 1.0);\r
    c += weight * uGlow / (power == 1.0 ? l : pow(max(l, 1e-6), power));\r
    if (uReveal.y > 0.5) blurred += weight * uGlow / sqrt(l * l + 0.0025);\r
  }\r
\r
  c /= 6.0;\r
  c *= 1.0 + heat * 0.25 + flare * 0.6;\r
\r
  float reveal = 1.0;\r
  float front = 0.0;\r
  if (uReveal.y > 0.5) {\r
    float level = log(max(blurred / 6.0, 1e-5)) - uReveal.x;\r
    reveal = smoothstep(-1.0, 1.0, level) * smoothstep(0.0, 0.08, uReveal.z);\r
    front = 0.2 * exp(-level * level * 1.5) * smoothstep(-2.6, -0.6, uReveal.x);\r
  }\r
\r
  float g = clamp(max(c - uBlackPoint, 0.0) * uBrightness + front, 0.0, 1.0);\r
  vec3 col = palette(g);\r
  float noise = hash(gl_FragCoord.xy + fract(uClock) * 97.0) - 0.5;\r
  float a;\r
  if (uLight < 0.5) {\r
    a = g + noise * uGrain;\r
  } else {\r
    float lift = max(g - 0.03, 0.0) / 0.97;\r
    a = (1.0 - exp(-6.0 * lift)) / (1.0 - exp(-6.0)) + noise * uGrain * g;\r
  }\r
  a = clamp(a + noise / 255.0, 0.0, 1.0) * reveal * uOpacity;\r
\r
  if (uOpaque > 0.5) {\r
    outColor = vec4(mix(uBackground, col, a), 1.0);\r
  } else {\r
    outColor = vec4(col * a, a);\r
  }\r
}\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
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
export default function MoltenMetal({\r
  colors = ['#5227FF', '#FF9FFC'],\r
  coreColor = '#FFFFFF',\r
  backgroundColor = 'transparent',\r
  lightMode = false,\r
  speed = 0.35,\r
  scale = 4,\r
  detail = 3,\r
  glow = 1.6,\r
  thickness = 1,\r
  swirl = 1,\r
  turbulence = 0.2,\r
  haze = 0.75,\r
  brightness = 1.3,\r
  colorMode = 'molten',\r
  rotation = 0,\r
  offsetX = 0,\r
  offsetY = 0,\r
  drift = 0.3,\r
  grain = 0.05,\r
  opacity = 1,\r
  intro = true,\r
  mouseInteraction = true,\r
  mouseStrength = 0.5,\r
  flareOnClick = true,\r
  paused = false,\r
  dpr = 2,\r
  className = '',\r
  style\r
}: MoltenMetalProps) {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const colorKey = [...colors.slice(0, MAX_COLORS - 1), coreColor].join('|');\r
  const palette = useMemo(\r
    () => colorKey.split('|').map((value): RGB => parseColor(value, [1, 1, 1]) ?? [1, 1, 1]),\r
    [colorKey]\r
  );\r
  const paper = useMemo(() => parseColor(backgroundColor, null), [backgroundColor]);\r
\r
  const settings = {\r
    palette,\r
    paper,\r
    lightMode,\r
    speed,\r
    scale: Math.max(0.1, scale),\r
    detail: clamp(detail, 1, 8),\r
    glow: Math.max(0, glow),\r
    thickness: clamp(thickness, 0.2, 3),\r
    swirl,\r
    fold: -turbulence,\r
    blackPoint: 0.2 * (1 - clamp(haze, 0, 1)),\r
    brightness: Math.max(0, brightness),\r
    balance: BALANCE[colorMode] ?? 0.5,\r
    rotation: (rotation * Math.PI) / 180,\r
    offset: [offsetX, offsetY],\r
    drift: Math.max(0, drift),\r
    grain: typeof grain === 'number' ? Math.max(0, grain) : grain ? 0.05 : 0,\r
    opacity: clamp(opacity, 0, 1),\r
    intro,\r
    mouseInteraction,\r
    mouseStrength: clamp(mouseStrength, 0, 1),\r
    flareOnClick,\r
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
      'uTime',\r
      'uClock',\r
      'uScale',\r
      'uDetail',\r
      'uGlow',\r
      'uThickness',\r
      'uSwirl',\r
      'uFold',\r
      'uBlackPoint',\r
      'uBrightness',\r
      'uBalance',\r
      'uGrain',\r
      'uOpacity',\r
      'uOffset',\r
      'uRotation',\r
      'uDrift',\r
      'uColors',\r
      'uColorCount',\r
      'uBackground',\r
      'uOpaque',\r
      'uLight',\r
      'uReveal',\r
      'uTrail',\r
      'uTrailWeight',\r
      'uTrailCount',\r
      'uFlares',\r
      'uFlareCount',\r
      'uHeat'\r
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
    const trailData = new Float32Array(TRAIL * 4);\r
    const weightData = new Float32Array(TRAIL);\r
    const flareData = new Float32Array(MAX_FLARES * 4);\r
    const state = {\r
      width: 1,\r
      height: 1,\r
      time: FLOW_START,\r
      clock: 0,\r
      last: 0,\r
      raf: 0,\r
      visible: false,\r
      introAt: -1,\r
      pointer: [0.5, 0.5],\r
      inside: false,\r
      presence: 0,\r
      drift: [0, 0],\r
      trail: [] as TrailPoint[],\r
      flares: [] as Flare[],\r
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
    const toView = (point: number[]) => [(point[0] - 0.5) * (state.width / Math.max(state.height, 1)), 0.5 - point[1]];\r
\r
    const introProgress = (s: typeof settings, reduced: boolean) => {\r
      if (!s.intro || reduced || state.introAt < 0) return 1;\r
      return clamp((state.clock - state.introAt) / INTRO_SECONDS, 0, 1);\r
    };\r
\r
    const render = (reduced: boolean) => {\r
      const s = settingsRef.current;\r
      const progress = introProgress(s, reduced);\r
      const aspect = state.width / Math.max(state.height, 1);\r
      gl.viewport(0, 0, state.width, state.height);\r
      gl.uniform2f(u.uResolution, state.width, state.height);\r
      gl.uniform1f(u.uTime, state.time);\r
      gl.uniform1f(u.uClock, state.clock);\r
      gl.uniform1f(u.uScale, s.scale);\r
      gl.uniform1f(u.uDetail, s.detail);\r
      gl.uniform1f(u.uGlow, s.glow * 0.1);\r
      gl.uniform1f(u.uThickness, s.thickness);\r
      gl.uniform1f(u.uSwirl, s.swirl);\r
      gl.uniform1f(u.uFold, s.fold);\r
      gl.uniform1f(u.uBlackPoint, s.blackPoint);\r
      gl.uniform1f(u.uBrightness, s.brightness);\r
      gl.uniform1f(u.uBalance, s.balance);\r
      gl.uniform1f(u.uGrain, s.grain);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.uniform2f(u.uOffset, s.offset[0] * aspect, -s.offset[1]);\r
      gl.uniform2f(u.uRotation, Math.cos(s.rotation), Math.sin(s.rotation));\r
      gl.uniform2f(u.uDrift, state.drift[0], state.drift[1]);\r
      colorData.fill(0);\r
      s.palette.forEach((rgb, index) => colorData.set(rgb, index * 3));\r
      gl.uniform3fv(u.uColors, colorData);\r
      gl.uniform1i(u.uColorCount, s.palette.length);\r
      const paperColor = s.paper ?? [0, 0, 0];\r
      gl.uniform3f(u.uBackground, paperColor[0], paperColor[1], paperColor[2]);\r
      gl.uniform1f(u.uOpaque, s.paper ? 1 : 0);\r
      gl.uniform1f(u.uLight, s.lightMode ? 1 : 0);\r
      gl.uniform3f(u.uReveal, Math.log(1.6) + Math.log(0.01 / 1.6) * progress, progress < 1 ? 1 : 0, progress);\r
      trailData.fill(0);\r
      weightData.fill(0);\r
      state.trail.forEach((point, index) => {\r
        const [x, y] = toView(point.at);\r
        trailData.set([x, y, state.clock - point.time, state.clock - point.arrive], index * 4);\r
        weightData[index] = point.weight;\r
      });\r
      gl.uniform4fv(u.uTrail, trailData);\r
      gl.uniform1fv(u.uTrailWeight, weightData);\r
      gl.uniform1i(u.uTrailCount, state.trail.length);\r
      flareData.fill(0);\r
      state.flares.forEach((flare, index) => {\r
        const [x, y] = toView(flare.at);\r
        flareData.set([x, y, state.clock - flare.time, 1], index * 4);\r
      });\r
      gl.uniform4fv(u.uFlares, flareData);\r
      gl.uniform1i(u.uFlareCount, state.flares.length);\r
      const heating = state.trail.length > 0 || state.flares.length > 0;\r
      gl.uniform4f(u.uHeat, s.mouseStrength * 2, 3.2, 0.2, heating ? 1 : 0);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const updateTrail = (s: typeof settings, dt: number) => {\r
      const wanted = s.mouseInteraction && state.inside && s.mouseStrength > 0;\r
      state.presence += ((wanted ? 1 : 0) - state.presence) * (1 - Math.exp(-dt / 0.25));\r
      state.trail = state.trail.filter(point => point.live || state.clock - point.time < TRAIL_SECONDS);\r
      const head = state.trail[0];\r
      if (!wanted) {\r
        if (head?.live) head.live = false;\r
        return state.trail.length > 0;\r
      }\r
      if (!head?.live) {\r
        state.trail.unshift({\r
          at: [...state.pointer],\r
          time: state.clock,\r
          arrive: state.clock,\r
          weight: state.presence,\r
          live: true\r
        });\r
      } else {\r
        if (head.at[0] !== state.pointer[0] || head.at[1] !== state.pointer[1]) {\r
          const last = state.trail[1];\r
          const gap = last ? Math.hypot(last.at[0] - head.at[0], last.at[1] - head.at[1]) : Infinity;\r
          const settled = state.clock - head.arrive > SAMPLE_SECONDS;\r
          if (gap > 0.004 && (!last || settled || state.clock - last.time >= SAMPLE_SECONDS)) {\r
            state.trail.splice(1, 0, { ...head, at: [...head.at], time: state.clock, live: false });\r
          }\r
          head.at = [...state.pointer];\r
          head.arrive = state.clock;\r
        }\r
        head.time = state.clock;\r
        head.weight = state.presence;\r
      }\r
      if (state.trail.length > TRAIL) state.trail.length = TRAIL;\r
      return state.trail.length > 0;\r
    };\r
\r
    const tick = (now: number) => {\r
      state.raf = requestAnimationFrame(tick);\r
      if (!state.visible || document.hidden) {\r
        state.last = now;\r
        return;\r
      }\r
      const s = settingsRef.current;\r
      const dt = state.last ? Math.min((now - state.last) / 1000, 0.1) : 0;\r
      state.last = now;\r
      const reduced = prefersReduced();\r
      state.clock += dt;\r
      if (state.introAt < 0) state.introAt = state.clock;\r
      if (!s.paused && !reduced) state.time += dt * s.speed;\r
\r
      const leaning = s.mouseInteraction && state.inside && !reduced;\r
      const goalX = leaning ? (state.pointer[0] - 0.5) * s.drift * 2 : 0;\r
      const goalY = leaning ? (0.5 - state.pointer[1]) * s.drift * 2 : 0;\r
      const ease = 1 - Math.exp(-dt / 0.33);\r
      state.drift[0] += (goalX - state.drift[0]) * ease;\r
      state.drift[1] += (goalY - state.drift[1]) * ease;\r
      const drifting = Math.abs(goalX - state.drift[0]) + Math.abs(goalY - state.drift[1]) > 0.0005;\r
\r
      const heating = updateTrail(s, dt);\r
      state.flares = state.flares.filter(flare => state.clock - flare.time < FLARE_SECONDS);\r
\r
      const still = s.paused || reduced;\r
      const transient = heating || drifting || state.flares.length > 0 || introProgress(s, reduced) < 1;\r
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
      if (!s.flareOnClick || event.button !== 0 || prefersReduced()) return;\r
      if (\r
        event.target instanceof Element &&\r
        event.target.closest('a, button, input, textarea, select, label, [role="button"]')\r
      )\r
        return;\r
      const point = local(event);\r
      if (!point.inside) return;\r
      state.flares.push({ at: [point.x, point.y], time: state.clock });\r
      if (state.flares.length > MAX_FLARES) state.flares.shift();\r
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
`,o={dependencies:"",usage:`import MoltenMetal from './MoltenMetal';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <MoltenMetal
    colors={['#5227FF', '#FF9FFC']}
    coreColor="#FFFFFF"
    speed={0.35}
    scale={4}
    detail={3}
    glow={1.6}
    thickness={1}
    haze={0.75}
    mouseInteraction
    flareOnClick
  />
</div>`,code:r,css:n,tailwind:e,tsCode:t,tsTailwind:a};export{o as moltenMetal};
