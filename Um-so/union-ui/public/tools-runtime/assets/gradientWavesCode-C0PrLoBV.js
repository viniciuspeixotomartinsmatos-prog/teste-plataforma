const n=`'use client';\r
\r
import { useEffect, useMemo, useRef } from 'react';\r
import './GradientWaves.css';\r
\r
const ROOT = 'gradient-waves-container';\r
const CANVAS = 'gradient-waves-canvas';\r
\r
const MAX_SWELLS = 4;\r
const SWELL_SECONDS = 3.2;\r
const SWELL_GAIN = 2.8;\r
const SWELL_WIDTH = 8;\r
const INTRO_SECONDS = 2.6;\r
const CAMERA_HEIGHT = 30;\r
const QUALITY = { low: 56, medium: 84, high: 120 };\r
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
uniform float uAmplitude;\r
uniform float uWaveScale;\r
uniform float uWaveRatio;\r
uniform float uSwell;\r
uniform float uTurbulence;\r
uniform float uHeight;\r
uniform float uTilt;\r
uniform float uZoom;\r
uniform vec2 uLook;\r
uniform float uFogDepth;\r
uniform float uBrightness;\r
uniform float uOpacity;\r
uniform float uGrain;\r
uniform vec3 uHorizon;\r
uniform vec3 uWave;\r
uniform vec3 uCrest;\r
uniform vec3 uBackground;\r
uniform float uOpaque;\r
uniform float uLight;\r
uniform vec3 uSun;\r
uniform float uRelief;\r
uniform float uSheen;\r
uniform float uSteps;\r
uniform float uStride;\r
uniform vec3 uIntro;\r
uniform vec3 uSwells[\${MAX_SWELLS}];\r
uniform float uSwellWidth;\r
out vec4 outColor;\r
\r
const float FAR = 4000.0;\r
\r
float hash(vec2 p) {\r
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);\r
  p3 += dot(p3, p3.yzx + 33.33);\r
  return fract((p3.x + p3.y) * p3.z);\r
}\r
\r
vec3 surface(vec2 xy) {\r
  vec2 freq = vec2(uWaveScale / 7.0, (uWaveScale * uWaveRatio) / 3.0);\r
  vec4 tc = vec4(uTime / 0.130, uTime / 0.810, uTime / 0.200, uTime / 0.710);\r
  float a = xy.x + tc.x;\r
  float swellPhase = (xy.y + a) / 20.0 + tc.y;\r
  float bend = uSwell * cos(swellPhase) / 20.0;\r
  float mx = a + uSwell * sin(swellPhase);\r
  float crossPhase = xy.x / 23.0 + tc.w;\r
  float my = xy.y - tc.z + uTurbulence * cos(crossPhase);\r
  float twist = -uTurbulence * sin(crossPhase) / 23.0;\r
  float cx = cos(mx * freq.x);\r
  float cy = cos(my * freq.y);\r
  float rise = 1.0;\r
  if (uIntro.z > 0.0) rise = mix(1.0, smoothstep(uIntro.y * 0.45, uIntro.y * 1.6, xy.x), uIntro.z);\r
  float amp = uAmplitude * rise;\r
  float h = (sin(mx * freq.x) + sin(my * freq.y)) * amp + uHeight;\r
  float dx = amp * (freq.x * cx * (1.0 + bend) + freq.y * cy * twist);\r
  float dy = amp * (freq.x * cx * bend + freq.y * cy);\r
  for (int k = 0; k < \${MAX_SWELLS}; k++) {\r
    vec3 sw = uSwells[k];\r
    if (sw.z <= 0.0) continue;\r
    float u = (xy.x - sw.x) / uSwellWidth;\r
    float v = (xy.y - sw.y) / (uSwellWidth * 3.5);\r
    float bump = sw.z * exp(-u * u - v * v);\r
    h += bump;\r
    dx += bump * (-2.0 * u / uSwellWidth);\r
    dy += bump * (-2.0 * v / (uSwellWidth * 3.5));\r
  }\r
  return vec3(h, dx, dy);\r
}\r
\r
float march(vec3 origin, vec3 dir) {\r
  float dist = 0.0;\r
  for (int i = 0; i < 128; i++) {\r
    if (float(i) >= uSteps) break;\r
    float gap = origin.z + dist * dir.z - surface(origin.xy + dist * dir.xy).x;\r
    if (abs(gap) < 0.002 * dist + 0.01) break;\r
    dist += uStride * gap;\r
    if (!(abs(dist) < FAR)) return FAR;\r
  }\r
  return dist;\r
}\r
\r
void main() {\r
  float c;\r
  float s;\r
  float vfov = (3.14159 / 2.3) / max(uZoom, 0.05);\r
  vec3 cam = vec3(0.0, 0.0, \${CAMERA_HEIGHT.toFixed(1)});\r
  vec2 uv = gl_FragCoord.xy / uResolution - 0.5;\r
  uv.x *= uResolution.x / uResolution.y;\r
  uv.y *= -1.0;\r
\r
  vec3 dir = vec3(0.0, 0.0, -1.0);\r
  float ulen = length(uv);\r
  float xrot = vfov * ulen;\r
  c = cos(xrot);\r
  s = sin(xrot);\r
  dir = mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c) * dir;\r
  vec2 nuv = ulen > 1e-5 ? uv / ulen : vec2(1.0, 0.0);\r
  dir = mat3(nuv.x, -nuv.y, 0.0, nuv.y, nuv.x, 0.0, 0.0, 0.0, 1.0) * dir;\r
  c = cos(uTilt + uLook.y);\r
  s = sin(uTilt + uLook.y);\r
  dir = mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c) * dir;\r
  c = cos(uLook.x);\r
  s = sin(uLook.x);\r
  dir = mat3(c, s, 0.0, -s, c, 0.0, 0.0, 0.0, 1.0) * dir;\r
\r
  float dist = march(cam, dir);\r
  vec3 pos = cam + dist * dir;\r
  vec3 field = surface(pos.xy);\r
  vec3 view = -dir;\r
\r
  float crest = clamp((field.x - uHeight) / max(2.0 * uAmplitude, 0.001) * 0.5 + 0.5, 0.0, 1.0);\r
  vec3 body = mix(uWave, uCrest, smoothstep(0.45, 1.0, crest) * 0.5);\r
  vec3 normal = normalize(vec3(-field.yz * (1.0 + 1.5 * uRelief), 1.0));\r
  float diffuse = clamp(dot(normal, uSun) * 0.5 + 0.5, 0.0, 1.0);\r
  float lightness = mix(1.0, diffuse * diffuse * (3.0 - 2.0 * diffuse), uRelief);\r
  float sheen = pow(clamp(dot(normal, normalize(uSun + view)), 0.0, 1.0), 14.0) * uSheen * (0.4 + 0.6 * uRelief);\r
  float rim = pow(1.0 - clamp(dot(normal, view), 0.0, 1.0), 3.0);\r
\r
  vec3 col;\r
  float alpha;\r
  float haze = 1.0 - exp(-dist / (uFogDepth * 5.0));\r
  float fade = 1.0 - smoothstep(0.35, 1.0, haze);\r
  if (uLight < 0.5) {\r
    vec3 lit = mix(uHorizon * 0.18, body, lightness) + uCrest * sheen;\r
    lit = mix(lit, uHorizon, rim * 0.15 * uRelief);\r
    col = mix(lit, uHorizon, smoothstep(0.0, 1.0, haze)) * 0.85 * uBrightness;\r
    alpha = fade;\r
  } else {\r
    vec3 hue = mix(uHorizon, body, 0.35 + 0.65 * lightness);\r
    float density = mix(0.16, 0.9, 1.0 - lightness);\r
    density *= 1.0 - clamp(sheen, 0.0, 1.0) * 0.85;\r
    density *= 1.0 - 0.5 * smoothstep(0.0, 1.0, haze);\r
    col = hue;\r
    alpha = fade * clamp(density * uBrightness, 0.0, 1.0);\r
  }\r
\r
  float reveal = uIntro.x;\r
  col = clamp(col, 0.0, 1.0);\r
  float grain = (hash(gl_FragCoord.xy + fract(uClock) * 64.0) - 0.5) * uGrain;\r
  alpha = clamp(alpha * (1.0 + grain), 0.0, 1.0) * reveal * uOpacity;\r
  if (uOpaque > 0.5) {\r
    outColor = vec4(mix(uBackground, col, alpha), 1.0);\r
  } else {\r
    outColor = vec4(col * alpha, alpha);\r
  }\r
}\`;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const easeInOut = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);\r
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
    console.error(gl.getShaderInfoLog(shader));\r
    gl.deleteShader(shader);\r
    return null;\r
  }\r
  return shader;\r
};\r
\r
const rayAt = (point, aspect, s, look) => {\r
  const uvx = (point[0] - 0.5) * aspect;\r
  const uvy = point[1] - 0.5;\r
  const vfov = Math.PI / 2.3 / Math.max(s.zoom, 0.05);\r
  const length = Math.hypot(uvx, uvy);\r
  const turn = vfov * length;\r
  let dir = [0, -Math.sin(turn), -Math.cos(turn)];\r
  const nx = length > 1e-5 ? uvx / length : 1;\r
  const ny = length > 1e-5 ? uvy / length : 0;\r
  dir = [nx * dir[0] + ny * dir[1], -ny * dir[0] + nx * dir[1], dir[2]];\r
  const pitch = s.tilt + look[1];\r
  const cp = Math.cos(pitch);\r
  const sp = Math.sin(pitch);\r
  dir = [cp * dir[0] - sp * dir[2], dir[1], sp * dir[0] + cp * dir[2]];\r
  const cy = Math.cos(look[0]);\r
  const sy = Math.sin(look[0]);\r
  dir = [cy * dir[0] - sy * dir[1], sy * dir[0] + cy * dir[1], dir[2]];\r
  return dir;\r
};\r
\r
const groundAt = (point, aspect, s, look) => {\r
  const dir = rayAt(point, aspect, s, look);\r
  if (dir[2] > -0.02) return null;\r
  const travel = (CAMERA_HEIGHT - s.height) / -dir[2];\r
  return [dir[0] * travel, dir[1] * travel];\r
};\r
\r
const prefersReduced = () =>\r
  typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);\r
\r
export default function GradientWaves({\r
  horizonColor = '#5227FF',\r
  waveColor = '#FF9FFC',\r
  crestColor = '#FFFFFF',\r
  backgroundColor = 'transparent',\r
  lightMode = false,\r
  speed = 0.4,\r
  amplitude = 2.5,\r
  waveScale = 0.6,\r
  waveRatio = 0.9,\r
  swell = 35,\r
  turbulence = 20,\r
  tilt = 64,\r
  zoom = 1,\r
  height = 5.5,\r
  fogDepth = 15,\r
  relief = 1,\r
  lightAngle = 120,\r
  sheen = 0,\r
  brightness = 1,\r
  opacity = 1,\r
  grain = 0.2,\r
  quality = 'medium',\r
  intro = true,\r
  mouseInteraction = true,\r
  parallaxStrength = 0.5,\r
  mouseStrength = 0.6,\r
  swellOnClick = true,\r
  paused = false,\r
  dpr = 2,\r
  className = '',\r
  style\r
}) {\r
  const containerRef = useRef(null);\r
  const horizon = useMemo(() => parseColor(horizonColor, [0.32, 0.15, 1]) ?? [0.32, 0.15, 1], [horizonColor]);\r
  const wave = useMemo(() => parseColor(waveColor, [1, 0.62, 0.99]) ?? [1, 0.62, 0.99], [waveColor]);\r
  const crest = useMemo(() => parseColor(crestColor, [1, 1, 1]) ?? [1, 1, 1], [crestColor]);\r
  const paper = useMemo(() => parseColor(backgroundColor, null), [backgroundColor]);\r
\r
  const settings = {\r
    horizon,\r
    wave,\r
    crest,\r
    paper,\r
    lightMode,\r
    speed,\r
    amplitude: Math.max(0, amplitude),\r
    waveScale: Math.max(0.01, waveScale),\r
    waveRatio: Math.max(0.01, waveRatio),\r
    swell,\r
    turbulence,\r
    tilt: (clamp(tilt, 10, 85) * Math.PI) / 180,\r
    zoom: Math.max(0.05, zoom),\r
    height,\r
    fogDepth: Math.max(0.5, fogDepth),\r
    relief: clamp(relief, 0, 1),\r
    lightAngle: (lightAngle * Math.PI) / 180,\r
    sheen: Math.max(0, sheen),\r
    brightness: Math.max(0, brightness),\r
    opacity: clamp(opacity, 0, 1),\r
    grain: typeof grain === 'number' ? Math.max(0, grain) : grain ? 0.05 : 0,\r
    steps: QUALITY[quality] ?? QUALITY.medium,\r
    intro,\r
    mouseInteraction,\r
    parallaxStrength: Math.max(0, parallaxStrength),\r
    mouseStrength: clamp(mouseStrength, 0, 1),\r
    swellOnClick,\r
    paused,\r
    dpr: Math.max(0.5, dpr)\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
  const wakeRef = useRef(null);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
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
      'uAmplitude',\r
      'uWaveScale',\r
      'uWaveRatio',\r
      'uSwell',\r
      'uTurbulence',\r
      'uHeight',\r
      'uTilt',\r
      'uZoom',\r
      'uLook',\r
      'uFogDepth',\r
      'uBrightness',\r
      'uOpacity',\r
      'uGrain',\r
      'uHorizon',\r
      'uWave',\r
      'uCrest',\r
      'uBackground',\r
      'uOpaque',\r
      'uLight',\r
      'uSun',\r
      'uRelief',\r
      'uSheen',\r
      'uSteps',\r
      'uStride',\r
      'uIntro',\r
      'uSwells',\r
      'uSwellWidth'\r
    ];\r
    const u = {};\r
    names.forEach(name => {\r
      u[name] = gl.getUniformLocation(program, name);\r
    });\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    const buffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    gl.useProgram(program);\r
\r
    const swellData = new Float32Array(MAX_SWELLS * 3);\r
    const state = {\r
      width: 1,\r
      height: 1,\r
      cssWidth: 0,\r
      cssHeight: 0,\r
      time: 0,\r
      clock: 0,\r
      last: 0,\r
      raf: 0,\r
      visible: false,\r
      introAt: -1,\r
      pointer: [0.5, 0.5],\r
      inside: false,\r
      look: [0, 0],\r
      steer: [0, 0],\r
      swells: [],\r
      quiet: 0,\r
      seen: null\r
    };\r
\r
    const fit = () => {\r
      const s = settingsRef.current;\r
      const ratio = Math.min(window.devicePixelRatio || 1, s.dpr);\r
      const width = Math.max(1, Math.round(state.cssWidth * ratio));\r
      const height = Math.max(1, Math.round(state.cssHeight * ratio));\r
      if (width === state.width && height === state.height) return;\r
      state.quiet = 0;\r
      state.width = width;\r
      state.height = height;\r
      canvas.width = width;\r
      canvas.height = height;\r
    };\r
\r
    const measure = () => {\r
      state.cssWidth = container.clientWidth;\r
      state.cssHeight = container.clientHeight;\r
      fit();\r
      wake();\r
    };\r
\r
    const introProgress = (s, reduced) => {\r
      if (!s.intro || reduced || state.introAt < 0) return 1;\r
      return clamp((state.clock - state.introAt) / INTRO_SECONDS, 0, 1);\r
    };\r
\r
    const render = reduced => {\r
      const s = settingsRef.current;\r
      gl.viewport(0, 0, state.width, state.height);\r
      gl.uniform2f(u.uResolution, state.width, state.height);\r
      gl.uniform1f(u.uTime, state.time);\r
      gl.uniform1f(u.uClock, state.clock);\r
      gl.uniform1f(u.uAmplitude, s.amplitude);\r
      gl.uniform1f(u.uWaveScale, s.waveScale);\r
      gl.uniform1f(u.uWaveRatio, s.waveRatio);\r
      gl.uniform1f(u.uSwell, s.swell);\r
      gl.uniform1f(u.uTurbulence, s.turbulence);\r
      gl.uniform1f(u.uHeight, s.height);\r
      gl.uniform1f(u.uTilt, s.tilt);\r
      gl.uniform1f(u.uZoom, s.zoom);\r
      gl.uniform2f(u.uLook, state.look[0], state.look[1]);\r
      gl.uniform1f(u.uFogDepth, s.fogDepth);\r
      gl.uniform1f(u.uBrightness, s.brightness);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.uniform1f(u.uGrain, s.grain);\r
      gl.uniform3fv(u.uHorizon, s.horizon);\r
      gl.uniform3fv(u.uWave, s.wave);\r
      gl.uniform3fv(u.uCrest, s.crest);\r
      const paperColor = s.paper ?? [0, 0, 0];\r
      gl.uniform3f(u.uBackground, paperColor[0], paperColor[1], paperColor[2]);\r
      gl.uniform1f(u.uOpaque, s.paper ? 1 : 0);\r
      gl.uniform1f(u.uLight, s.lightMode ? 1 : 0);\r
      const elevation = 0.52;\r
      const angle = s.lightAngle + state.steer[0] * s.mouseStrength * 2;\r
      const altitude = elevation - state.steer[1] * s.mouseStrength * 0.7;\r
      gl.uniform3f(\r
        u.uSun,\r
        Math.cos(altitude) * Math.cos(angle),\r
        Math.cos(altitude) * Math.sin(angle),\r
        Math.sin(altitude)\r
      );\r
      gl.uniform1f(u.uRelief, s.relief);\r
      gl.uniform1f(u.uSheen, s.sheen);\r
      gl.uniform1f(u.uSteps, s.steps);\r
      const slope =\r
        s.amplitude *\r
        ((s.waveScale / 7) * (1 + Math.abs(s.swell) / 20) +\r
          ((s.waveScale * s.waveRatio) / 3) * (1 + Math.abs(s.turbulence) / 23));\r
      const progress = introProgress(s, reduced);\r
      const shown = Math.min(1, progress / 0.22);\r
      const crest = 160 * Math.pow(3 / 160, easeInOut(Math.max(0, (progress - 0.1) / 0.9)));\r
      const settle = clamp((progress - 0.75) / 0.25, 0, 1);\r
      gl.uniform3f(u.uIntro, shown * shown * (3 - 2 * shown), crest, 1 - settle * settle * (3 - 2 * settle));\r
      swellData.fill(0);\r
      let swellPeak = 0;\r
      state.swells.forEach((swell, index) => {\r
        const age = state.clock - swell.at;\r
        const life = age / SWELL_SECONDS;\r
        const envelope = (1 - Math.exp(-age / 0.25)) * Math.pow(1 - life, 1.6);\r
        const lift = s.amplitude * SWELL_GAIN * envelope;\r
        swellData.set([swell.x - age * 12, swell.y, lift], index * 3);\r
        swellPeak = Math.max(swellPeak, lift);\r
      });\r
      gl.uniform3fv(u.uSwells, swellData);\r
      gl.uniform1f(u.uSwellWidth, SWELL_WIDTH);\r
      gl.uniform1f(u.uStride, 0.9 / Math.max(1, (slope + (swellPeak * 0.86) / SWELL_WIDTH) / 1.5));\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const tick = now => {\r
      state.raf = 0;\r
      if (!state.visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = state.last ? Math.min((now - state.last) / 1000, 0.1) : 0;\r
      state.last = now;\r
      const reduced = prefersReduced();\r
      state.clock += dt;\r
      if (state.introAt < 0) state.introAt = state.clock;\r
      if (!s.paused && !reduced) state.time += dt * s.speed;\r
\r
      const steering = s.mouseInteraction && state.inside && !reduced;\r
      const target = steering ? state.pointer : [0.5, 0.5];\r
      const ease = 1 - Math.exp(-dt / 0.45);\r
      const goalX = (target[0] - 0.5) * s.parallaxStrength * 0.35;\r
      const goalY = (target[1] - 0.5) * s.parallaxStrength * 0.18;\r
      state.look[0] += (goalX - state.look[0]) * ease;\r
      state.look[1] += (goalY - state.look[1]) * ease;\r
      const moving = Math.abs(goalX - state.look[0]) + Math.abs(goalY - state.look[1]) > 0.0002;\r
\r
      const steerEase = 1 - Math.exp(-dt / 0.6);\r
      const steerX = steering ? state.pointer[0] - 0.5 : 0;\r
      const steerY = steering ? 0.5 - state.pointer[1] : 0;\r
      state.steer[0] += (steerX - state.steer[0]) * steerEase;\r
      state.steer[1] += (steerY - state.steer[1]) * steerEase;\r
      const turning = Math.abs(steerX - state.steer[0]) + Math.abs(steerY - state.steer[1]) > 0.0005;\r
      state.swells = state.swells.filter(swell => state.clock - swell.at < SWELL_SECONDS);\r
\r
      const still = s.paused || reduced;\r
      const transient = moving || turning || state.swells.length > 0 || introProgress(s, reduced) < 1;\r
      if (state.seen !== s || transient || !still) state.quiet = 0;\r
      else state.quiet += 1;\r
      state.seen = s;\r
      if (state.quiet > 3) return;\r
\r
      state.raf = requestAnimationFrame(tick);\r
      fit();\r
      render(reduced);\r
    };\r
\r
    const wake = () => {\r
      if (state.raf || !state.visible || document.hidden) return;\r
      state.last = 0;\r
      state.raf = requestAnimationFrame(tick);\r
    };\r
    wakeRef.current = wake;\r
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
      const was = state.inside;\r
      state.inside = point.inside;\r
      if (point.inside) state.pointer = [point.x, point.y];\r
      if ((point.inside || was) && settingsRef.current.mouseInteraction) wake();\r
    };\r
\r
    const onLeave = () => {\r
      state.inside = false;\r
      wake();\r
    };\r
\r
    const onDown = event => {\r
      const s = settingsRef.current;\r
      if (!s.swellOnClick || event.button !== 0 || prefersReduced()) return;\r
      if (\r
        event.target instanceof Element &&\r
        event.target.closest('a, button, input, textarea, select, label, [role="button"]')\r
      )\r
        return;\r
      const point = local(event);\r
      if (!point.inside) return;\r
      const ground = groundAt([point.x, point.y], state.width / Math.max(state.height, 1), s, state.look);\r
      if (!ground) return;\r
      state.swells.push({ x: ground[0], y: ground[1], at: state.clock });\r
      if (state.swells.length > MAX_SWELLS) state.swells.shift();\r
      wake();\r
    };\r
\r
    const visibility = new IntersectionObserver(entries => {\r
      state.visible = entries.some(entry => entry.isIntersecting);\r
      wake();\r
    });\r
    visibility.observe(container);\r
    const sizes = new ResizeObserver(measure);\r
    sizes.observe(container);\r
    measure();\r
    document.addEventListener('visibilitychange', wake);\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    window.addEventListener('pointerdown', onDown);\r
    document.documentElement.addEventListener('pointerleave', onLeave);\r
    state.raf = requestAnimationFrame(tick);\r
\r
    return () => {\r
      cancelAnimationFrame(state.raf);\r
      wakeRef.current = null;\r
      document.removeEventListener('visibilitychange', wake);\r
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
`,r=`.gradient-waves-container {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.gradient-waves-canvas {\r
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
const MAX_SWELLS = 4;\r
const SWELL_SECONDS = 3.2;\r
const SWELL_GAIN = 2.8;\r
const SWELL_WIDTH = 8;\r
const INTRO_SECONDS = 2.6;\r
const CAMERA_HEIGHT = 30;\r
const QUALITY = { low: 56, medium: 84, high: 120 };\r
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
uniform float uAmplitude;\r
uniform float uWaveScale;\r
uniform float uWaveRatio;\r
uniform float uSwell;\r
uniform float uTurbulence;\r
uniform float uHeight;\r
uniform float uTilt;\r
uniform float uZoom;\r
uniform vec2 uLook;\r
uniform float uFogDepth;\r
uniform float uBrightness;\r
uniform float uOpacity;\r
uniform float uGrain;\r
uniform vec3 uHorizon;\r
uniform vec3 uWave;\r
uniform vec3 uCrest;\r
uniform vec3 uBackground;\r
uniform float uOpaque;\r
uniform float uLight;\r
uniform vec3 uSun;\r
uniform float uRelief;\r
uniform float uSheen;\r
uniform float uSteps;\r
uniform float uStride;\r
uniform vec3 uIntro;\r
uniform vec3 uSwells[\${MAX_SWELLS}];\r
uniform float uSwellWidth;\r
out vec4 outColor;\r
\r
const float FAR = 4000.0;\r
\r
float hash(vec2 p) {\r
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);\r
  p3 += dot(p3, p3.yzx + 33.33);\r
  return fract((p3.x + p3.y) * p3.z);\r
}\r
\r
vec3 surface(vec2 xy) {\r
  vec2 freq = vec2(uWaveScale / 7.0, (uWaveScale * uWaveRatio) / 3.0);\r
  vec4 tc = vec4(uTime / 0.130, uTime / 0.810, uTime / 0.200, uTime / 0.710);\r
  float a = xy.x + tc.x;\r
  float swellPhase = (xy.y + a) / 20.0 + tc.y;\r
  float bend = uSwell * cos(swellPhase) / 20.0;\r
  float mx = a + uSwell * sin(swellPhase);\r
  float crossPhase = xy.x / 23.0 + tc.w;\r
  float my = xy.y - tc.z + uTurbulence * cos(crossPhase);\r
  float twist = -uTurbulence * sin(crossPhase) / 23.0;\r
  float cx = cos(mx * freq.x);\r
  float cy = cos(my * freq.y);\r
  float rise = 1.0;\r
  if (uIntro.z > 0.0) rise = mix(1.0, smoothstep(uIntro.y * 0.45, uIntro.y * 1.6, xy.x), uIntro.z);\r
  float amp = uAmplitude * rise;\r
  float h = (sin(mx * freq.x) + sin(my * freq.y)) * amp + uHeight;\r
  float dx = amp * (freq.x * cx * (1.0 + bend) + freq.y * cy * twist);\r
  float dy = amp * (freq.x * cx * bend + freq.y * cy);\r
  for (int k = 0; k < \${MAX_SWELLS}; k++) {\r
    vec3 sw = uSwells[k];\r
    if (sw.z <= 0.0) continue;\r
    float u = (xy.x - sw.x) / uSwellWidth;\r
    float v = (xy.y - sw.y) / (uSwellWidth * 3.5);\r
    float bump = sw.z * exp(-u * u - v * v);\r
    h += bump;\r
    dx += bump * (-2.0 * u / uSwellWidth);\r
    dy += bump * (-2.0 * v / (uSwellWidth * 3.5));\r
  }\r
  return vec3(h, dx, dy);\r
}\r
\r
float march(vec3 origin, vec3 dir) {\r
  float dist = 0.0;\r
  for (int i = 0; i < 128; i++) {\r
    if (float(i) >= uSteps) break;\r
    float gap = origin.z + dist * dir.z - surface(origin.xy + dist * dir.xy).x;\r
    if (abs(gap) < 0.002 * dist + 0.01) break;\r
    dist += uStride * gap;\r
    if (!(abs(dist) < FAR)) return FAR;\r
  }\r
  return dist;\r
}\r
\r
void main() {\r
  float c;\r
  float s;\r
  float vfov = (3.14159 / 2.3) / max(uZoom, 0.05);\r
  vec3 cam = vec3(0.0, 0.0, \${CAMERA_HEIGHT.toFixed(1)});\r
  vec2 uv = gl_FragCoord.xy / uResolution - 0.5;\r
  uv.x *= uResolution.x / uResolution.y;\r
  uv.y *= -1.0;\r
\r
  vec3 dir = vec3(0.0, 0.0, -1.0);\r
  float ulen = length(uv);\r
  float xrot = vfov * ulen;\r
  c = cos(xrot);\r
  s = sin(xrot);\r
  dir = mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c) * dir;\r
  vec2 nuv = ulen > 1e-5 ? uv / ulen : vec2(1.0, 0.0);\r
  dir = mat3(nuv.x, -nuv.y, 0.0, nuv.y, nuv.x, 0.0, 0.0, 0.0, 1.0) * dir;\r
  c = cos(uTilt + uLook.y);\r
  s = sin(uTilt + uLook.y);\r
  dir = mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c) * dir;\r
  c = cos(uLook.x);\r
  s = sin(uLook.x);\r
  dir = mat3(c, s, 0.0, -s, c, 0.0, 0.0, 0.0, 1.0) * dir;\r
\r
  float dist = march(cam, dir);\r
  vec3 pos = cam + dist * dir;\r
  vec3 field = surface(pos.xy);\r
  vec3 view = -dir;\r
\r
  float crest = clamp((field.x - uHeight) / max(2.0 * uAmplitude, 0.001) * 0.5 + 0.5, 0.0, 1.0);\r
  vec3 body = mix(uWave, uCrest, smoothstep(0.45, 1.0, crest) * 0.5);\r
  vec3 normal = normalize(vec3(-field.yz * (1.0 + 1.5 * uRelief), 1.0));\r
  float diffuse = clamp(dot(normal, uSun) * 0.5 + 0.5, 0.0, 1.0);\r
  float lightness = mix(1.0, diffuse * diffuse * (3.0 - 2.0 * diffuse), uRelief);\r
  float sheen = pow(clamp(dot(normal, normalize(uSun + view)), 0.0, 1.0), 14.0) * uSheen * (0.4 + 0.6 * uRelief);\r
  float rim = pow(1.0 - clamp(dot(normal, view), 0.0, 1.0), 3.0);\r
\r
  vec3 col;\r
  float alpha;\r
  float haze = 1.0 - exp(-dist / (uFogDepth * 5.0));\r
  float fade = 1.0 - smoothstep(0.35, 1.0, haze);\r
  if (uLight < 0.5) {\r
    vec3 lit = mix(uHorizon * 0.18, body, lightness) + uCrest * sheen;\r
    lit = mix(lit, uHorizon, rim * 0.15 * uRelief);\r
    col = mix(lit, uHorizon, smoothstep(0.0, 1.0, haze)) * 0.85 * uBrightness;\r
    alpha = fade;\r
  } else {\r
    vec3 hue = mix(uHorizon, body, 0.35 + 0.65 * lightness);\r
    float density = mix(0.16, 0.9, 1.0 - lightness);\r
    density *= 1.0 - clamp(sheen, 0.0, 1.0) * 0.85;\r
    density *= 1.0 - 0.5 * smoothstep(0.0, 1.0, haze);\r
    col = hue;\r
    alpha = fade * clamp(density * uBrightness, 0.0, 1.0);\r
  }\r
\r
  float reveal = uIntro.x;\r
  col = clamp(col, 0.0, 1.0);\r
  float grain = (hash(gl_FragCoord.xy + fract(uClock) * 64.0) - 0.5) * uGrain;\r
  alpha = clamp(alpha * (1.0 + grain), 0.0, 1.0) * reveal * uOpacity;\r
  if (uOpaque > 0.5) {\r
    outColor = vec4(mix(uBackground, col, alpha), 1.0);\r
  } else {\r
    outColor = vec4(col * alpha, alpha);\r
  }\r
}\`;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const easeInOut = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);\r
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
    console.error(gl.getShaderInfoLog(shader));\r
    gl.deleteShader(shader);\r
    return null;\r
  }\r
  return shader;\r
};\r
\r
const rayAt = (point, aspect, s, look) => {\r
  const uvx = (point[0] - 0.5) * aspect;\r
  const uvy = point[1] - 0.5;\r
  const vfov = Math.PI / 2.3 / Math.max(s.zoom, 0.05);\r
  const length = Math.hypot(uvx, uvy);\r
  const turn = vfov * length;\r
  let dir = [0, -Math.sin(turn), -Math.cos(turn)];\r
  const nx = length > 1e-5 ? uvx / length : 1;\r
  const ny = length > 1e-5 ? uvy / length : 0;\r
  dir = [nx * dir[0] + ny * dir[1], -ny * dir[0] + nx * dir[1], dir[2]];\r
  const pitch = s.tilt + look[1];\r
  const cp = Math.cos(pitch);\r
  const sp = Math.sin(pitch);\r
  dir = [cp * dir[0] - sp * dir[2], dir[1], sp * dir[0] + cp * dir[2]];\r
  const cy = Math.cos(look[0]);\r
  const sy = Math.sin(look[0]);\r
  dir = [cy * dir[0] - sy * dir[1], sy * dir[0] + cy * dir[1], dir[2]];\r
  return dir;\r
};\r
\r
const groundAt = (point, aspect, s, look) => {\r
  const dir = rayAt(point, aspect, s, look);\r
  if (dir[2] > -0.02) return null;\r
  const travel = (CAMERA_HEIGHT - s.height) / -dir[2];\r
  return [dir[0] * travel, dir[1] * travel];\r
};\r
\r
const prefersReduced = () =>\r
  typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);\r
\r
export default function GradientWaves({\r
  horizonColor = '#5227FF',\r
  waveColor = '#FF9FFC',\r
  crestColor = '#FFFFFF',\r
  backgroundColor = 'transparent',\r
  lightMode = false,\r
  speed = 0.4,\r
  amplitude = 2.5,\r
  waveScale = 0.6,\r
  waveRatio = 0.9,\r
  swell = 35,\r
  turbulence = 20,\r
  tilt = 64,\r
  zoom = 1,\r
  height = 5.5,\r
  fogDepth = 15,\r
  relief = 1,\r
  lightAngle = 120,\r
  sheen = 0,\r
  brightness = 1,\r
  opacity = 1,\r
  grain = 0.2,\r
  quality = 'medium',\r
  intro = true,\r
  mouseInteraction = true,\r
  parallaxStrength = 0.5,\r
  mouseStrength = 0.6,\r
  swellOnClick = true,\r
  paused = false,\r
  dpr = 2,\r
  className = '',\r
  style\r
}) {\r
  const containerRef = useRef(null);\r
  const horizon = useMemo(() => parseColor(horizonColor, [0.32, 0.15, 1]) ?? [0.32, 0.15, 1], [horizonColor]);\r
  const wave = useMemo(() => parseColor(waveColor, [1, 0.62, 0.99]) ?? [1, 0.62, 0.99], [waveColor]);\r
  const crest = useMemo(() => parseColor(crestColor, [1, 1, 1]) ?? [1, 1, 1], [crestColor]);\r
  const paper = useMemo(() => parseColor(backgroundColor, null), [backgroundColor]);\r
\r
  const settings = {\r
    horizon,\r
    wave,\r
    crest,\r
    paper,\r
    lightMode,\r
    speed,\r
    amplitude: Math.max(0, amplitude),\r
    waveScale: Math.max(0.01, waveScale),\r
    waveRatio: Math.max(0.01, waveRatio),\r
    swell,\r
    turbulence,\r
    tilt: (clamp(tilt, 10, 85) * Math.PI) / 180,\r
    zoom: Math.max(0.05, zoom),\r
    height,\r
    fogDepth: Math.max(0.5, fogDepth),\r
    relief: clamp(relief, 0, 1),\r
    lightAngle: (lightAngle * Math.PI) / 180,\r
    sheen: Math.max(0, sheen),\r
    brightness: Math.max(0, brightness),\r
    opacity: clamp(opacity, 0, 1),\r
    grain: typeof grain === 'number' ? Math.max(0, grain) : grain ? 0.05 : 0,\r
    steps: QUALITY[quality] ?? QUALITY.medium,\r
    intro,\r
    mouseInteraction,\r
    parallaxStrength: Math.max(0, parallaxStrength),\r
    mouseStrength: clamp(mouseStrength, 0, 1),\r
    swellOnClick,\r
    paused,\r
    dpr: Math.max(0.5, dpr)\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
  const wakeRef = useRef(null);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
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
      'uAmplitude',\r
      'uWaveScale',\r
      'uWaveRatio',\r
      'uSwell',\r
      'uTurbulence',\r
      'uHeight',\r
      'uTilt',\r
      'uZoom',\r
      'uLook',\r
      'uFogDepth',\r
      'uBrightness',\r
      'uOpacity',\r
      'uGrain',\r
      'uHorizon',\r
      'uWave',\r
      'uCrest',\r
      'uBackground',\r
      'uOpaque',\r
      'uLight',\r
      'uSun',\r
      'uRelief',\r
      'uSheen',\r
      'uSteps',\r
      'uStride',\r
      'uIntro',\r
      'uSwells',\r
      'uSwellWidth'\r
    ];\r
    const u = {};\r
    names.forEach(name => {\r
      u[name] = gl.getUniformLocation(program, name);\r
    });\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    const buffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    gl.useProgram(program);\r
\r
    const swellData = new Float32Array(MAX_SWELLS * 3);\r
    const state = {\r
      width: 1,\r
      height: 1,\r
      cssWidth: 0,\r
      cssHeight: 0,\r
      time: 0,\r
      clock: 0,\r
      last: 0,\r
      raf: 0,\r
      visible: false,\r
      introAt: -1,\r
      pointer: [0.5, 0.5],\r
      inside: false,\r
      look: [0, 0],\r
      steer: [0, 0],\r
      swells: [],\r
      quiet: 0,\r
      seen: null\r
    };\r
\r
    const fit = () => {\r
      const s = settingsRef.current;\r
      const ratio = Math.min(window.devicePixelRatio || 1, s.dpr);\r
      const width = Math.max(1, Math.round(state.cssWidth * ratio));\r
      const height = Math.max(1, Math.round(state.cssHeight * ratio));\r
      if (width === state.width && height === state.height) return;\r
      state.quiet = 0;\r
      state.width = width;\r
      state.height = height;\r
      canvas.width = width;\r
      canvas.height = height;\r
    };\r
\r
    const measure = () => {\r
      state.cssWidth = container.clientWidth;\r
      state.cssHeight = container.clientHeight;\r
      fit();\r
      wake();\r
    };\r
\r
    const introProgress = (s, reduced) => {\r
      if (!s.intro || reduced || state.introAt < 0) return 1;\r
      return clamp((state.clock - state.introAt) / INTRO_SECONDS, 0, 1);\r
    };\r
\r
    const render = reduced => {\r
      const s = settingsRef.current;\r
      gl.viewport(0, 0, state.width, state.height);\r
      gl.uniform2f(u.uResolution, state.width, state.height);\r
      gl.uniform1f(u.uTime, state.time);\r
      gl.uniform1f(u.uClock, state.clock);\r
      gl.uniform1f(u.uAmplitude, s.amplitude);\r
      gl.uniform1f(u.uWaveScale, s.waveScale);\r
      gl.uniform1f(u.uWaveRatio, s.waveRatio);\r
      gl.uniform1f(u.uSwell, s.swell);\r
      gl.uniform1f(u.uTurbulence, s.turbulence);\r
      gl.uniform1f(u.uHeight, s.height);\r
      gl.uniform1f(u.uTilt, s.tilt);\r
      gl.uniform1f(u.uZoom, s.zoom);\r
      gl.uniform2f(u.uLook, state.look[0], state.look[1]);\r
      gl.uniform1f(u.uFogDepth, s.fogDepth);\r
      gl.uniform1f(u.uBrightness, s.brightness);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.uniform1f(u.uGrain, s.grain);\r
      gl.uniform3fv(u.uHorizon, s.horizon);\r
      gl.uniform3fv(u.uWave, s.wave);\r
      gl.uniform3fv(u.uCrest, s.crest);\r
      const paperColor = s.paper ?? [0, 0, 0];\r
      gl.uniform3f(u.uBackground, paperColor[0], paperColor[1], paperColor[2]);\r
      gl.uniform1f(u.uOpaque, s.paper ? 1 : 0);\r
      gl.uniform1f(u.uLight, s.lightMode ? 1 : 0);\r
      const elevation = 0.52;\r
      const angle = s.lightAngle + state.steer[0] * s.mouseStrength * 2;\r
      const altitude = elevation - state.steer[1] * s.mouseStrength * 0.7;\r
      gl.uniform3f(\r
        u.uSun,\r
        Math.cos(altitude) * Math.cos(angle),\r
        Math.cos(altitude) * Math.sin(angle),\r
        Math.sin(altitude)\r
      );\r
      gl.uniform1f(u.uRelief, s.relief);\r
      gl.uniform1f(u.uSheen, s.sheen);\r
      gl.uniform1f(u.uSteps, s.steps);\r
      const slope =\r
        s.amplitude *\r
        ((s.waveScale / 7) * (1 + Math.abs(s.swell) / 20) +\r
          ((s.waveScale * s.waveRatio) / 3) * (1 + Math.abs(s.turbulence) / 23));\r
      const progress = introProgress(s, reduced);\r
      const shown = Math.min(1, progress / 0.22);\r
      const crest = 160 * Math.pow(3 / 160, easeInOut(Math.max(0, (progress - 0.1) / 0.9)));\r
      const settle = clamp((progress - 0.75) / 0.25, 0, 1);\r
      gl.uniform3f(u.uIntro, shown * shown * (3 - 2 * shown), crest, 1 - settle * settle * (3 - 2 * settle));\r
      swellData.fill(0);\r
      let swellPeak = 0;\r
      state.swells.forEach((swell, index) => {\r
        const age = state.clock - swell.at;\r
        const life = age / SWELL_SECONDS;\r
        const envelope = (1 - Math.exp(-age / 0.25)) * Math.pow(1 - life, 1.6);\r
        const lift = s.amplitude * SWELL_GAIN * envelope;\r
        swellData.set([swell.x - age * 12, swell.y, lift], index * 3);\r
        swellPeak = Math.max(swellPeak, lift);\r
      });\r
      gl.uniform3fv(u.uSwells, swellData);\r
      gl.uniform1f(u.uSwellWidth, SWELL_WIDTH);\r
      gl.uniform1f(u.uStride, 0.9 / Math.max(1, (slope + (swellPeak * 0.86) / SWELL_WIDTH) / 1.5));\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const tick = now => {\r
      state.raf = 0;\r
      if (!state.visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = state.last ? Math.min((now - state.last) / 1000, 0.1) : 0;\r
      state.last = now;\r
      const reduced = prefersReduced();\r
      state.clock += dt;\r
      if (state.introAt < 0) state.introAt = state.clock;\r
      if (!s.paused && !reduced) state.time += dt * s.speed;\r
\r
      const steering = s.mouseInteraction && state.inside && !reduced;\r
      const target = steering ? state.pointer : [0.5, 0.5];\r
      const ease = 1 - Math.exp(-dt / 0.45);\r
      const goalX = (target[0] - 0.5) * s.parallaxStrength * 0.35;\r
      const goalY = (target[1] - 0.5) * s.parallaxStrength * 0.18;\r
      state.look[0] += (goalX - state.look[0]) * ease;\r
      state.look[1] += (goalY - state.look[1]) * ease;\r
      const moving = Math.abs(goalX - state.look[0]) + Math.abs(goalY - state.look[1]) > 0.0002;\r
\r
      const steerEase = 1 - Math.exp(-dt / 0.6);\r
      const steerX = steering ? state.pointer[0] - 0.5 : 0;\r
      const steerY = steering ? 0.5 - state.pointer[1] : 0;\r
      state.steer[0] += (steerX - state.steer[0]) * steerEase;\r
      state.steer[1] += (steerY - state.steer[1]) * steerEase;\r
      const turning = Math.abs(steerX - state.steer[0]) + Math.abs(steerY - state.steer[1]) > 0.0005;\r
      state.swells = state.swells.filter(swell => state.clock - swell.at < SWELL_SECONDS);\r
\r
      const still = s.paused || reduced;\r
      const transient = moving || turning || state.swells.length > 0 || introProgress(s, reduced) < 1;\r
      if (state.seen !== s || transient || !still) state.quiet = 0;\r
      else state.quiet += 1;\r
      state.seen = s;\r
      if (state.quiet > 3) return;\r
\r
      state.raf = requestAnimationFrame(tick);\r
      fit();\r
      render(reduced);\r
    };\r
\r
    const wake = () => {\r
      if (state.raf || !state.visible || document.hidden) return;\r
      state.last = 0;\r
      state.raf = requestAnimationFrame(tick);\r
    };\r
    wakeRef.current = wake;\r
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
      const was = state.inside;\r
      state.inside = point.inside;\r
      if (point.inside) state.pointer = [point.x, point.y];\r
      if ((point.inside || was) && settingsRef.current.mouseInteraction) wake();\r
    };\r
\r
    const onLeave = () => {\r
      state.inside = false;\r
      wake();\r
    };\r
\r
    const onDown = event => {\r
      const s = settingsRef.current;\r
      if (!s.swellOnClick || event.button !== 0 || prefersReduced()) return;\r
      if (\r
        event.target instanceof Element &&\r
        event.target.closest('a, button, input, textarea, select, label, [role="button"]')\r
      )\r
        return;\r
      const point = local(event);\r
      if (!point.inside) return;\r
      const ground = groundAt([point.x, point.y], state.width / Math.max(state.height, 1), s, state.look);\r
      if (!ground) return;\r
      state.swells.push({ x: ground[0], y: ground[1], at: state.clock });\r
      if (state.swells.length > MAX_SWELLS) state.swells.shift();\r
      wake();\r
    };\r
\r
    const visibility = new IntersectionObserver(entries => {\r
      state.visible = entries.some(entry => entry.isIntersecting);\r
      wake();\r
    });\r
    visibility.observe(container);\r
    const sizes = new ResizeObserver(measure);\r
    sizes.observe(container);\r
    measure();\r
    document.addEventListener('visibilitychange', wake);\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    window.addEventListener('pointerdown', onDown);\r
    document.documentElement.addEventListener('pointerleave', onLeave);\r
    state.raf = requestAnimationFrame(tick);\r
\r
    return () => {\r
      cancelAnimationFrame(state.raf);\r
      wakeRef.current = null;\r
      document.removeEventListener('visibilitychange', wake);\r
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
import './GradientWaves.css';\r
\r
export interface GradientWavesProps {\r
  horizonColor?: string;\r
  waveColor?: string;\r
  crestColor?: string;\r
  backgroundColor?: string;\r
  lightMode?: boolean;\r
  speed?: number;\r
  amplitude?: number;\r
  waveScale?: number;\r
  waveRatio?: number;\r
  swell?: number;\r
  turbulence?: number;\r
  tilt?: number;\r
  zoom?: number;\r
  height?: number;\r
  fogDepth?: number;\r
  relief?: number;\r
  lightAngle?: number;\r
  sheen?: number;\r
  brightness?: number;\r
  opacity?: number;\r
  grain?: number;\r
  quality?: 'low' | 'medium' | 'high';\r
  intro?: boolean;\r
  mouseInteraction?: boolean;\r
  parallaxStrength?: number;\r
  mouseStrength?: number;\r
  swellOnClick?: boolean;\r
  paused?: boolean;\r
  dpr?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
type RGB = [number, number, number];\r
\r
interface Swell {\r
  x: number;\r
  y: number;\r
  at: number;\r
}\r
\r
interface View {\r
  zoom: number;\r
  tilt: number;\r
  height: number;\r
}\r
\r
const ROOT = 'gradient-waves-container';\r
const CANVAS = 'gradient-waves-canvas';\r
\r
const MAX_SWELLS = 4;\r
const SWELL_SECONDS = 3.2;\r
const SWELL_GAIN = 2.8;\r
const SWELL_WIDTH = 8;\r
const INTRO_SECONDS = 2.6;\r
const CAMERA_HEIGHT = 30;\r
const QUALITY: Record<string, number> = { low: 56, medium: 84, high: 120 };\r
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
uniform float uAmplitude;\r
uniform float uWaveScale;\r
uniform float uWaveRatio;\r
uniform float uSwell;\r
uniform float uTurbulence;\r
uniform float uHeight;\r
uniform float uTilt;\r
uniform float uZoom;\r
uniform vec2 uLook;\r
uniform float uFogDepth;\r
uniform float uBrightness;\r
uniform float uOpacity;\r
uniform float uGrain;\r
uniform vec3 uHorizon;\r
uniform vec3 uWave;\r
uniform vec3 uCrest;\r
uniform vec3 uBackground;\r
uniform float uOpaque;\r
uniform float uLight;\r
uniform vec3 uSun;\r
uniform float uRelief;\r
uniform float uSheen;\r
uniform float uSteps;\r
uniform float uStride;\r
uniform vec3 uIntro;\r
uniform vec3 uSwells[\${MAX_SWELLS}];\r
uniform float uSwellWidth;\r
out vec4 outColor;\r
\r
const float FAR = 4000.0;\r
\r
float hash(vec2 p) {\r
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);\r
  p3 += dot(p3, p3.yzx + 33.33);\r
  return fract((p3.x + p3.y) * p3.z);\r
}\r
\r
vec3 surface(vec2 xy) {\r
  vec2 freq = vec2(uWaveScale / 7.0, (uWaveScale * uWaveRatio) / 3.0);\r
  vec4 tc = vec4(uTime / 0.130, uTime / 0.810, uTime / 0.200, uTime / 0.710);\r
  float a = xy.x + tc.x;\r
  float swellPhase = (xy.y + a) / 20.0 + tc.y;\r
  float bend = uSwell * cos(swellPhase) / 20.0;\r
  float mx = a + uSwell * sin(swellPhase);\r
  float crossPhase = xy.x / 23.0 + tc.w;\r
  float my = xy.y - tc.z + uTurbulence * cos(crossPhase);\r
  float twist = -uTurbulence * sin(crossPhase) / 23.0;\r
  float cx = cos(mx * freq.x);\r
  float cy = cos(my * freq.y);\r
  float rise = 1.0;\r
  if (uIntro.z > 0.0) rise = mix(1.0, smoothstep(uIntro.y * 0.45, uIntro.y * 1.6, xy.x), uIntro.z);\r
  float amp = uAmplitude * rise;\r
  float h = (sin(mx * freq.x) + sin(my * freq.y)) * amp + uHeight;\r
  float dx = amp * (freq.x * cx * (1.0 + bend) + freq.y * cy * twist);\r
  float dy = amp * (freq.x * cx * bend + freq.y * cy);\r
  for (int k = 0; k < \${MAX_SWELLS}; k++) {\r
    vec3 sw = uSwells[k];\r
    if (sw.z <= 0.0) continue;\r
    float u = (xy.x - sw.x) / uSwellWidth;\r
    float v = (xy.y - sw.y) / (uSwellWidth * 3.5);\r
    float bump = sw.z * exp(-u * u - v * v);\r
    h += bump;\r
    dx += bump * (-2.0 * u / uSwellWidth);\r
    dy += bump * (-2.0 * v / (uSwellWidth * 3.5));\r
  }\r
  return vec3(h, dx, dy);\r
}\r
\r
float march(vec3 origin, vec3 dir) {\r
  float dist = 0.0;\r
  for (int i = 0; i < 128; i++) {\r
    if (float(i) >= uSteps) break;\r
    float gap = origin.z + dist * dir.z - surface(origin.xy + dist * dir.xy).x;\r
    if (abs(gap) < 0.002 * dist + 0.01) break;\r
    dist += uStride * gap;\r
    if (!(abs(dist) < FAR)) return FAR;\r
  }\r
  return dist;\r
}\r
\r
void main() {\r
  float c;\r
  float s;\r
  float vfov = (3.14159 / 2.3) / max(uZoom, 0.05);\r
  vec3 cam = vec3(0.0, 0.0, \${CAMERA_HEIGHT.toFixed(1)});\r
  vec2 uv = gl_FragCoord.xy / uResolution - 0.5;\r
  uv.x *= uResolution.x / uResolution.y;\r
  uv.y *= -1.0;\r
\r
  vec3 dir = vec3(0.0, 0.0, -1.0);\r
  float ulen = length(uv);\r
  float xrot = vfov * ulen;\r
  c = cos(xrot);\r
  s = sin(xrot);\r
  dir = mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c) * dir;\r
  vec2 nuv = ulen > 1e-5 ? uv / ulen : vec2(1.0, 0.0);\r
  dir = mat3(nuv.x, -nuv.y, 0.0, nuv.y, nuv.x, 0.0, 0.0, 0.0, 1.0) * dir;\r
  c = cos(uTilt + uLook.y);\r
  s = sin(uTilt + uLook.y);\r
  dir = mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c) * dir;\r
  c = cos(uLook.x);\r
  s = sin(uLook.x);\r
  dir = mat3(c, s, 0.0, -s, c, 0.0, 0.0, 0.0, 1.0) * dir;\r
\r
  float dist = march(cam, dir);\r
  vec3 pos = cam + dist * dir;\r
  vec3 field = surface(pos.xy);\r
  vec3 view = -dir;\r
\r
  float crest = clamp((field.x - uHeight) / max(2.0 * uAmplitude, 0.001) * 0.5 + 0.5, 0.0, 1.0);\r
  vec3 body = mix(uWave, uCrest, smoothstep(0.45, 1.0, crest) * 0.5);\r
  vec3 normal = normalize(vec3(-field.yz * (1.0 + 1.5 * uRelief), 1.0));\r
  float diffuse = clamp(dot(normal, uSun) * 0.5 + 0.5, 0.0, 1.0);\r
  float lightness = mix(1.0, diffuse * diffuse * (3.0 - 2.0 * diffuse), uRelief);\r
  float sheen = pow(clamp(dot(normal, normalize(uSun + view)), 0.0, 1.0), 14.0) * uSheen * (0.4 + 0.6 * uRelief);\r
  float rim = pow(1.0 - clamp(dot(normal, view), 0.0, 1.0), 3.0);\r
\r
  vec3 col;\r
  float alpha;\r
  float haze = 1.0 - exp(-dist / (uFogDepth * 5.0));\r
  float fade = 1.0 - smoothstep(0.35, 1.0, haze);\r
  if (uLight < 0.5) {\r
    vec3 lit = mix(uHorizon * 0.18, body, lightness) + uCrest * sheen;\r
    lit = mix(lit, uHorizon, rim * 0.15 * uRelief);\r
    col = mix(lit, uHorizon, smoothstep(0.0, 1.0, haze)) * 0.85 * uBrightness;\r
    alpha = fade;\r
  } else {\r
    vec3 hue = mix(uHorizon, body, 0.35 + 0.65 * lightness);\r
    float density = mix(0.16, 0.9, 1.0 - lightness);\r
    density *= 1.0 - clamp(sheen, 0.0, 1.0) * 0.85;\r
    density *= 1.0 - 0.5 * smoothstep(0.0, 1.0, haze);\r
    col = hue;\r
    alpha = fade * clamp(density * uBrightness, 0.0, 1.0);\r
  }\r
\r
  float reveal = uIntro.x;\r
  col = clamp(col, 0.0, 1.0);\r
  float grain = (hash(gl_FragCoord.xy + fract(uClock) * 64.0) - 0.5) * uGrain;\r
  alpha = clamp(alpha * (1.0 + grain), 0.0, 1.0) * reveal * uOpacity;\r
  if (uOpaque > 0.5) {\r
    outColor = vec4(mix(uBackground, col, alpha), 1.0);\r
  } else {\r
    outColor = vec4(col * alpha, alpha);\r
  }\r
}\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);\r
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
    console.error(gl.getShaderInfoLog(shader));\r
    gl.deleteShader(shader);\r
    return null;\r
  }\r
  return shader;\r
};\r
\r
const rayAt = (point: number[], aspect: number, s: View, look: number[]) => {\r
  const uvx = (point[0] - 0.5) * aspect;\r
  const uvy = point[1] - 0.5;\r
  const vfov = Math.PI / 2.3 / Math.max(s.zoom, 0.05);\r
  const length = Math.hypot(uvx, uvy);\r
  const turn = vfov * length;\r
  let dir = [0, -Math.sin(turn), -Math.cos(turn)];\r
  const nx = length > 1e-5 ? uvx / length : 1;\r
  const ny = length > 1e-5 ? uvy / length : 0;\r
  dir = [nx * dir[0] + ny * dir[1], -ny * dir[0] + nx * dir[1], dir[2]];\r
  const pitch = s.tilt + look[1];\r
  const cp = Math.cos(pitch);\r
  const sp = Math.sin(pitch);\r
  dir = [cp * dir[0] - sp * dir[2], dir[1], sp * dir[0] + cp * dir[2]];\r
  const cy = Math.cos(look[0]);\r
  const sy = Math.sin(look[0]);\r
  dir = [cy * dir[0] - sy * dir[1], sy * dir[0] + cy * dir[1], dir[2]];\r
  return dir;\r
};\r
\r
const groundAt = (point: number[], aspect: number, s: View, look: number[]) => {\r
  const dir = rayAt(point, aspect, s, look);\r
  if (dir[2] > -0.02) return null;\r
  const travel = (CAMERA_HEIGHT - s.height) / -dir[2];\r
  return [dir[0] * travel, dir[1] * travel];\r
};\r
\r
const prefersReduced = () =>\r
  typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);\r
\r
export default function GradientWaves({\r
  horizonColor = '#5227FF',\r
  waveColor = '#FF9FFC',\r
  crestColor = '#FFFFFF',\r
  backgroundColor = 'transparent',\r
  lightMode = false,\r
  speed = 0.4,\r
  amplitude = 2.5,\r
  waveScale = 0.6,\r
  waveRatio = 0.9,\r
  swell = 35,\r
  turbulence = 20,\r
  tilt = 64,\r
  zoom = 1,\r
  height = 5.5,\r
  fogDepth = 15,\r
  relief = 1,\r
  lightAngle = 120,\r
  sheen = 0,\r
  brightness = 1,\r
  opacity = 1,\r
  grain = 0.2,\r
  quality = 'medium',\r
  intro = true,\r
  mouseInteraction = true,\r
  parallaxStrength = 0.5,\r
  mouseStrength = 0.6,\r
  swellOnClick = true,\r
  paused = false,\r
  dpr = 2,\r
  className = '',\r
  style\r
}: GradientWavesProps) {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const horizon = useMemo((): RGB => parseColor(horizonColor, [0.32, 0.15, 1]) ?? [0.32, 0.15, 1], [horizonColor]);\r
  const wave = useMemo((): RGB => parseColor(waveColor, [1, 0.62, 0.99]) ?? [1, 0.62, 0.99], [waveColor]);\r
  const crest = useMemo((): RGB => parseColor(crestColor, [1, 1, 1]) ?? [1, 1, 1], [crestColor]);\r
  const paper = useMemo(() => parseColor(backgroundColor, null), [backgroundColor]);\r
\r
  const settings = {\r
    horizon,\r
    wave,\r
    crest,\r
    paper,\r
    lightMode,\r
    speed,\r
    amplitude: Math.max(0, amplitude),\r
    waveScale: Math.max(0.01, waveScale),\r
    waveRatio: Math.max(0.01, waveRatio),\r
    swell,\r
    turbulence,\r
    tilt: (clamp(tilt, 10, 85) * Math.PI) / 180,\r
    zoom: Math.max(0.05, zoom),\r
    height,\r
    fogDepth: Math.max(0.5, fogDepth),\r
    relief: clamp(relief, 0, 1),\r
    lightAngle: (lightAngle * Math.PI) / 180,\r
    sheen: Math.max(0, sheen),\r
    brightness: Math.max(0, brightness),\r
    opacity: clamp(opacity, 0, 1),\r
    grain: typeof grain === 'number' ? Math.max(0, grain) : grain ? 0.05 : 0,\r
    steps: QUALITY[quality] ?? QUALITY.medium,\r
    intro,\r
    mouseInteraction,\r
    parallaxStrength: Math.max(0, parallaxStrength),\r
    mouseStrength: clamp(mouseStrength, 0, 1),\r
    swellOnClick,\r
    paused,\r
    dpr: Math.max(0.5, dpr)\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
  const wakeRef = useRef<(() => void) | null>(null);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
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
      'uAmplitude',\r
      'uWaveScale',\r
      'uWaveRatio',\r
      'uSwell',\r
      'uTurbulence',\r
      'uHeight',\r
      'uTilt',\r
      'uZoom',\r
      'uLook',\r
      'uFogDepth',\r
      'uBrightness',\r
      'uOpacity',\r
      'uGrain',\r
      'uHorizon',\r
      'uWave',\r
      'uCrest',\r
      'uBackground',\r
      'uOpaque',\r
      'uLight',\r
      'uSun',\r
      'uRelief',\r
      'uSheen',\r
      'uSteps',\r
      'uStride',\r
      'uIntro',\r
      'uSwells',\r
      'uSwellWidth'\r
    ];\r
    const u: Record<string, WebGLUniformLocation | null> = {};\r
    names.forEach(name => {\r
      u[name] = gl.getUniformLocation(program, name);\r
    });\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    const buffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    gl.useProgram(program);\r
\r
    const swellData = new Float32Array(MAX_SWELLS * 3);\r
    const state = {\r
      width: 1,\r
      height: 1,\r
      cssWidth: 0,\r
      cssHeight: 0,\r
      time: 0,\r
      clock: 0,\r
      last: 0,\r
      raf: 0,\r
      visible: false,\r
      introAt: -1,\r
      pointer: [0.5, 0.5],\r
      inside: false,\r
      look: [0, 0],\r
      steer: [0, 0],\r
      swells: [] as Swell[],\r
      quiet: 0,\r
      seen: null as typeof settings | null\r
    };\r
\r
    const fit = () => {\r
      const s = settingsRef.current;\r
      const ratio = Math.min(window.devicePixelRatio || 1, s.dpr);\r
      const width = Math.max(1, Math.round(state.cssWidth * ratio));\r
      const height = Math.max(1, Math.round(state.cssHeight * ratio));\r
      if (width === state.width && height === state.height) return;\r
      state.quiet = 0;\r
      state.width = width;\r
      state.height = height;\r
      canvas.width = width;\r
      canvas.height = height;\r
    };\r
\r
    const measure = () => {\r
      state.cssWidth = container.clientWidth;\r
      state.cssHeight = container.clientHeight;\r
      fit();\r
      wake();\r
    };\r
\r
    const introProgress = (s: typeof settings, reduced: boolean) => {\r
      if (!s.intro || reduced || state.introAt < 0) return 1;\r
      return clamp((state.clock - state.introAt) / INTRO_SECONDS, 0, 1);\r
    };\r
\r
    const render = (reduced: boolean) => {\r
      const s = settingsRef.current;\r
      gl.viewport(0, 0, state.width, state.height);\r
      gl.uniform2f(u.uResolution, state.width, state.height);\r
      gl.uniform1f(u.uTime, state.time);\r
      gl.uniform1f(u.uClock, state.clock);\r
      gl.uniform1f(u.uAmplitude, s.amplitude);\r
      gl.uniform1f(u.uWaveScale, s.waveScale);\r
      gl.uniform1f(u.uWaveRatio, s.waveRatio);\r
      gl.uniform1f(u.uSwell, s.swell);\r
      gl.uniform1f(u.uTurbulence, s.turbulence);\r
      gl.uniform1f(u.uHeight, s.height);\r
      gl.uniform1f(u.uTilt, s.tilt);\r
      gl.uniform1f(u.uZoom, s.zoom);\r
      gl.uniform2f(u.uLook, state.look[0], state.look[1]);\r
      gl.uniform1f(u.uFogDepth, s.fogDepth);\r
      gl.uniform1f(u.uBrightness, s.brightness);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.uniform1f(u.uGrain, s.grain);\r
      gl.uniform3fv(u.uHorizon, s.horizon);\r
      gl.uniform3fv(u.uWave, s.wave);\r
      gl.uniform3fv(u.uCrest, s.crest);\r
      const paperColor = s.paper ?? [0, 0, 0];\r
      gl.uniform3f(u.uBackground, paperColor[0], paperColor[1], paperColor[2]);\r
      gl.uniform1f(u.uOpaque, s.paper ? 1 : 0);\r
      gl.uniform1f(u.uLight, s.lightMode ? 1 : 0);\r
      const elevation = 0.52;\r
      const angle = s.lightAngle + state.steer[0] * s.mouseStrength * 2;\r
      const altitude = elevation - state.steer[1] * s.mouseStrength * 0.7;\r
      gl.uniform3f(\r
        u.uSun,\r
        Math.cos(altitude) * Math.cos(angle),\r
        Math.cos(altitude) * Math.sin(angle),\r
        Math.sin(altitude)\r
      );\r
      gl.uniform1f(u.uRelief, s.relief);\r
      gl.uniform1f(u.uSheen, s.sheen);\r
      gl.uniform1f(u.uSteps, s.steps);\r
      const slope =\r
        s.amplitude *\r
        ((s.waveScale / 7) * (1 + Math.abs(s.swell) / 20) +\r
          ((s.waveScale * s.waveRatio) / 3) * (1 + Math.abs(s.turbulence) / 23));\r
      const progress = introProgress(s, reduced);\r
      const shown = Math.min(1, progress / 0.22);\r
      const crest = 160 * Math.pow(3 / 160, easeInOut(Math.max(0, (progress - 0.1) / 0.9)));\r
      const settle = clamp((progress - 0.75) / 0.25, 0, 1);\r
      gl.uniform3f(u.uIntro, shown * shown * (3 - 2 * shown), crest, 1 - settle * settle * (3 - 2 * settle));\r
      swellData.fill(0);\r
      let swellPeak = 0;\r
      state.swells.forEach((swell, index) => {\r
        const age = state.clock - swell.at;\r
        const life = age / SWELL_SECONDS;\r
        const envelope = (1 - Math.exp(-age / 0.25)) * Math.pow(1 - life, 1.6);\r
        const lift = s.amplitude * SWELL_GAIN * envelope;\r
        swellData.set([swell.x - age * 12, swell.y, lift], index * 3);\r
        swellPeak = Math.max(swellPeak, lift);\r
      });\r
      gl.uniform3fv(u.uSwells, swellData);\r
      gl.uniform1f(u.uSwellWidth, SWELL_WIDTH);\r
      gl.uniform1f(u.uStride, 0.9 / Math.max(1, (slope + (swellPeak * 0.86) / SWELL_WIDTH) / 1.5));\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const tick = (now: number) => {\r
      state.raf = 0;\r
      if (!state.visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = state.last ? Math.min((now - state.last) / 1000, 0.1) : 0;\r
      state.last = now;\r
      const reduced = prefersReduced();\r
      state.clock += dt;\r
      if (state.introAt < 0) state.introAt = state.clock;\r
      if (!s.paused && !reduced) state.time += dt * s.speed;\r
\r
      const steering = s.mouseInteraction && state.inside && !reduced;\r
      const target = steering ? state.pointer : [0.5, 0.5];\r
      const ease = 1 - Math.exp(-dt / 0.45);\r
      const goalX = (target[0] - 0.5) * s.parallaxStrength * 0.35;\r
      const goalY = (target[1] - 0.5) * s.parallaxStrength * 0.18;\r
      state.look[0] += (goalX - state.look[0]) * ease;\r
      state.look[1] += (goalY - state.look[1]) * ease;\r
      const moving = Math.abs(goalX - state.look[0]) + Math.abs(goalY - state.look[1]) > 0.0002;\r
\r
      const steerEase = 1 - Math.exp(-dt / 0.6);\r
      const steerX = steering ? state.pointer[0] - 0.5 : 0;\r
      const steerY = steering ? 0.5 - state.pointer[1] : 0;\r
      state.steer[0] += (steerX - state.steer[0]) * steerEase;\r
      state.steer[1] += (steerY - state.steer[1]) * steerEase;\r
      const turning = Math.abs(steerX - state.steer[0]) + Math.abs(steerY - state.steer[1]) > 0.0005;\r
      state.swells = state.swells.filter(swell => state.clock - swell.at < SWELL_SECONDS);\r
\r
      const still = s.paused || reduced;\r
      const transient = moving || turning || state.swells.length > 0 || introProgress(s, reduced) < 1;\r
      if (state.seen !== s || transient || !still) state.quiet = 0;\r
      else state.quiet += 1;\r
      state.seen = s;\r
      if (state.quiet > 3) return;\r
\r
      state.raf = requestAnimationFrame(tick);\r
      fit();\r
      render(reduced);\r
    };\r
\r
    const wake = () => {\r
      if (state.raf || !state.visible || document.hidden) return;\r
      state.last = 0;\r
      state.raf = requestAnimationFrame(tick);\r
    };\r
    wakeRef.current = wake;\r
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
      const was = state.inside;\r
      state.inside = point.inside;\r
      if (point.inside) state.pointer = [point.x, point.y];\r
      if ((point.inside || was) && settingsRef.current.mouseInteraction) wake();\r
    };\r
\r
    const onLeave = () => {\r
      state.inside = false;\r
      wake();\r
    };\r
\r
    const onDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      if (!s.swellOnClick || event.button !== 0 || prefersReduced()) return;\r
      if (\r
        event.target instanceof Element &&\r
        event.target.closest('a, button, input, textarea, select, label, [role="button"]')\r
      )\r
        return;\r
      const point = local(event);\r
      if (!point.inside) return;\r
      const ground = groundAt([point.x, point.y], state.width / Math.max(state.height, 1), s, state.look);\r
      if (!ground) return;\r
      state.swells.push({ x: ground[0], y: ground[1], at: state.clock });\r
      if (state.swells.length > MAX_SWELLS) state.swells.shift();\r
      wake();\r
    };\r
\r
    const visibility = new IntersectionObserver(entries => {\r
      state.visible = entries.some(entry => entry.isIntersecting);\r
      wake();\r
    });\r
    visibility.observe(container);\r
    const sizes = new ResizeObserver(measure);\r
    sizes.observe(container);\r
    measure();\r
    document.addEventListener('visibilitychange', wake);\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    window.addEventListener('pointerdown', onDown);\r
    document.documentElement.addEventListener('pointerleave', onLeave);\r
    state.raf = requestAnimationFrame(tick);\r
\r
    return () => {\r
      cancelAnimationFrame(state.raf);\r
      wakeRef.current = null;\r
      document.removeEventListener('visibilitychange', wake);\r
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
export interface GradientWavesProps {\r
  horizonColor?: string;\r
  waveColor?: string;\r
  crestColor?: string;\r
  backgroundColor?: string;\r
  lightMode?: boolean;\r
  speed?: number;\r
  amplitude?: number;\r
  waveScale?: number;\r
  waveRatio?: number;\r
  swell?: number;\r
  turbulence?: number;\r
  tilt?: number;\r
  zoom?: number;\r
  height?: number;\r
  fogDepth?: number;\r
  relief?: number;\r
  lightAngle?: number;\r
  sheen?: number;\r
  brightness?: number;\r
  opacity?: number;\r
  grain?: number;\r
  quality?: 'low' | 'medium' | 'high';\r
  intro?: boolean;\r
  mouseInteraction?: boolean;\r
  parallaxStrength?: number;\r
  mouseStrength?: number;\r
  swellOnClick?: boolean;\r
  paused?: boolean;\r
  dpr?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
type RGB = [number, number, number];\r
\r
interface Swell {\r
  x: number;\r
  y: number;\r
  at: number;\r
}\r
\r
interface View {\r
  zoom: number;\r
  tilt: number;\r
  height: number;\r
}\r
\r
const ROOT = 'relative h-full w-full overflow-hidden';\r
const CANVAS = 'absolute inset-0 block h-full w-full';\r
\r
const MAX_SWELLS = 4;\r
const SWELL_SECONDS = 3.2;\r
const SWELL_GAIN = 2.8;\r
const SWELL_WIDTH = 8;\r
const INTRO_SECONDS = 2.6;\r
const CAMERA_HEIGHT = 30;\r
const QUALITY: Record<string, number> = { low: 56, medium: 84, high: 120 };\r
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
uniform float uAmplitude;\r
uniform float uWaveScale;\r
uniform float uWaveRatio;\r
uniform float uSwell;\r
uniform float uTurbulence;\r
uniform float uHeight;\r
uniform float uTilt;\r
uniform float uZoom;\r
uniform vec2 uLook;\r
uniform float uFogDepth;\r
uniform float uBrightness;\r
uniform float uOpacity;\r
uniform float uGrain;\r
uniform vec3 uHorizon;\r
uniform vec3 uWave;\r
uniform vec3 uCrest;\r
uniform vec3 uBackground;\r
uniform float uOpaque;\r
uniform float uLight;\r
uniform vec3 uSun;\r
uniform float uRelief;\r
uniform float uSheen;\r
uniform float uSteps;\r
uniform float uStride;\r
uniform vec3 uIntro;\r
uniform vec3 uSwells[\${MAX_SWELLS}];\r
uniform float uSwellWidth;\r
out vec4 outColor;\r
\r
const float FAR = 4000.0;\r
\r
float hash(vec2 p) {\r
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);\r
  p3 += dot(p3, p3.yzx + 33.33);\r
  return fract((p3.x + p3.y) * p3.z);\r
}\r
\r
vec3 surface(vec2 xy) {\r
  vec2 freq = vec2(uWaveScale / 7.0, (uWaveScale * uWaveRatio) / 3.0);\r
  vec4 tc = vec4(uTime / 0.130, uTime / 0.810, uTime / 0.200, uTime / 0.710);\r
  float a = xy.x + tc.x;\r
  float swellPhase = (xy.y + a) / 20.0 + tc.y;\r
  float bend = uSwell * cos(swellPhase) / 20.0;\r
  float mx = a + uSwell * sin(swellPhase);\r
  float crossPhase = xy.x / 23.0 + tc.w;\r
  float my = xy.y - tc.z + uTurbulence * cos(crossPhase);\r
  float twist = -uTurbulence * sin(crossPhase) / 23.0;\r
  float cx = cos(mx * freq.x);\r
  float cy = cos(my * freq.y);\r
  float rise = 1.0;\r
  if (uIntro.z > 0.0) rise = mix(1.0, smoothstep(uIntro.y * 0.45, uIntro.y * 1.6, xy.x), uIntro.z);\r
  float amp = uAmplitude * rise;\r
  float h = (sin(mx * freq.x) + sin(my * freq.y)) * amp + uHeight;\r
  float dx = amp * (freq.x * cx * (1.0 + bend) + freq.y * cy * twist);\r
  float dy = amp * (freq.x * cx * bend + freq.y * cy);\r
  for (int k = 0; k < \${MAX_SWELLS}; k++) {\r
    vec3 sw = uSwells[k];\r
    if (sw.z <= 0.0) continue;\r
    float u = (xy.x - sw.x) / uSwellWidth;\r
    float v = (xy.y - sw.y) / (uSwellWidth * 3.5);\r
    float bump = sw.z * exp(-u * u - v * v);\r
    h += bump;\r
    dx += bump * (-2.0 * u / uSwellWidth);\r
    dy += bump * (-2.0 * v / (uSwellWidth * 3.5));\r
  }\r
  return vec3(h, dx, dy);\r
}\r
\r
float march(vec3 origin, vec3 dir) {\r
  float dist = 0.0;\r
  for (int i = 0; i < 128; i++) {\r
    if (float(i) >= uSteps) break;\r
    float gap = origin.z + dist * dir.z - surface(origin.xy + dist * dir.xy).x;\r
    if (abs(gap) < 0.002 * dist + 0.01) break;\r
    dist += uStride * gap;\r
    if (!(abs(dist) < FAR)) return FAR;\r
  }\r
  return dist;\r
}\r
\r
void main() {\r
  float c;\r
  float s;\r
  float vfov = (3.14159 / 2.3) / max(uZoom, 0.05);\r
  vec3 cam = vec3(0.0, 0.0, \${CAMERA_HEIGHT.toFixed(1)});\r
  vec2 uv = gl_FragCoord.xy / uResolution - 0.5;\r
  uv.x *= uResolution.x / uResolution.y;\r
  uv.y *= -1.0;\r
\r
  vec3 dir = vec3(0.0, 0.0, -1.0);\r
  float ulen = length(uv);\r
  float xrot = vfov * ulen;\r
  c = cos(xrot);\r
  s = sin(xrot);\r
  dir = mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c) * dir;\r
  vec2 nuv = ulen > 1e-5 ? uv / ulen : vec2(1.0, 0.0);\r
  dir = mat3(nuv.x, -nuv.y, 0.0, nuv.y, nuv.x, 0.0, 0.0, 0.0, 1.0) * dir;\r
  c = cos(uTilt + uLook.y);\r
  s = sin(uTilt + uLook.y);\r
  dir = mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c) * dir;\r
  c = cos(uLook.x);\r
  s = sin(uLook.x);\r
  dir = mat3(c, s, 0.0, -s, c, 0.0, 0.0, 0.0, 1.0) * dir;\r
\r
  float dist = march(cam, dir);\r
  vec3 pos = cam + dist * dir;\r
  vec3 field = surface(pos.xy);\r
  vec3 view = -dir;\r
\r
  float crest = clamp((field.x - uHeight) / max(2.0 * uAmplitude, 0.001) * 0.5 + 0.5, 0.0, 1.0);\r
  vec3 body = mix(uWave, uCrest, smoothstep(0.45, 1.0, crest) * 0.5);\r
  vec3 normal = normalize(vec3(-field.yz * (1.0 + 1.5 * uRelief), 1.0));\r
  float diffuse = clamp(dot(normal, uSun) * 0.5 + 0.5, 0.0, 1.0);\r
  float lightness = mix(1.0, diffuse * diffuse * (3.0 - 2.0 * diffuse), uRelief);\r
  float sheen = pow(clamp(dot(normal, normalize(uSun + view)), 0.0, 1.0), 14.0) * uSheen * (0.4 + 0.6 * uRelief);\r
  float rim = pow(1.0 - clamp(dot(normal, view), 0.0, 1.0), 3.0);\r
\r
  vec3 col;\r
  float alpha;\r
  float haze = 1.0 - exp(-dist / (uFogDepth * 5.0));\r
  float fade = 1.0 - smoothstep(0.35, 1.0, haze);\r
  if (uLight < 0.5) {\r
    vec3 lit = mix(uHorizon * 0.18, body, lightness) + uCrest * sheen;\r
    lit = mix(lit, uHorizon, rim * 0.15 * uRelief);\r
    col = mix(lit, uHorizon, smoothstep(0.0, 1.0, haze)) * 0.85 * uBrightness;\r
    alpha = fade;\r
  } else {\r
    vec3 hue = mix(uHorizon, body, 0.35 + 0.65 * lightness);\r
    float density = mix(0.16, 0.9, 1.0 - lightness);\r
    density *= 1.0 - clamp(sheen, 0.0, 1.0) * 0.85;\r
    density *= 1.0 - 0.5 * smoothstep(0.0, 1.0, haze);\r
    col = hue;\r
    alpha = fade * clamp(density * uBrightness, 0.0, 1.0);\r
  }\r
\r
  float reveal = uIntro.x;\r
  col = clamp(col, 0.0, 1.0);\r
  float grain = (hash(gl_FragCoord.xy + fract(uClock) * 64.0) - 0.5) * uGrain;\r
  alpha = clamp(alpha * (1.0 + grain), 0.0, 1.0) * reveal * uOpacity;\r
  if (uOpaque > 0.5) {\r
    outColor = vec4(mix(uBackground, col, alpha), 1.0);\r
  } else {\r
    outColor = vec4(col * alpha, alpha);\r
  }\r
}\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);\r
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
    console.error(gl.getShaderInfoLog(shader));\r
    gl.deleteShader(shader);\r
    return null;\r
  }\r
  return shader;\r
};\r
\r
const rayAt = (point: number[], aspect: number, s: View, look: number[]) => {\r
  const uvx = (point[0] - 0.5) * aspect;\r
  const uvy = point[1] - 0.5;\r
  const vfov = Math.PI / 2.3 / Math.max(s.zoom, 0.05);\r
  const length = Math.hypot(uvx, uvy);\r
  const turn = vfov * length;\r
  let dir = [0, -Math.sin(turn), -Math.cos(turn)];\r
  const nx = length > 1e-5 ? uvx / length : 1;\r
  const ny = length > 1e-5 ? uvy / length : 0;\r
  dir = [nx * dir[0] + ny * dir[1], -ny * dir[0] + nx * dir[1], dir[2]];\r
  const pitch = s.tilt + look[1];\r
  const cp = Math.cos(pitch);\r
  const sp = Math.sin(pitch);\r
  dir = [cp * dir[0] - sp * dir[2], dir[1], sp * dir[0] + cp * dir[2]];\r
  const cy = Math.cos(look[0]);\r
  const sy = Math.sin(look[0]);\r
  dir = [cy * dir[0] - sy * dir[1], sy * dir[0] + cy * dir[1], dir[2]];\r
  return dir;\r
};\r
\r
const groundAt = (point: number[], aspect: number, s: View, look: number[]) => {\r
  const dir = rayAt(point, aspect, s, look);\r
  if (dir[2] > -0.02) return null;\r
  const travel = (CAMERA_HEIGHT - s.height) / -dir[2];\r
  return [dir[0] * travel, dir[1] * travel];\r
};\r
\r
const prefersReduced = () =>\r
  typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);\r
\r
export default function GradientWaves({\r
  horizonColor = '#5227FF',\r
  waveColor = '#FF9FFC',\r
  crestColor = '#FFFFFF',\r
  backgroundColor = 'transparent',\r
  lightMode = false,\r
  speed = 0.4,\r
  amplitude = 2.5,\r
  waveScale = 0.6,\r
  waveRatio = 0.9,\r
  swell = 35,\r
  turbulence = 20,\r
  tilt = 64,\r
  zoom = 1,\r
  height = 5.5,\r
  fogDepth = 15,\r
  relief = 1,\r
  lightAngle = 120,\r
  sheen = 0,\r
  brightness = 1,\r
  opacity = 1,\r
  grain = 0.2,\r
  quality = 'medium',\r
  intro = true,\r
  mouseInteraction = true,\r
  parallaxStrength = 0.5,\r
  mouseStrength = 0.6,\r
  swellOnClick = true,\r
  paused = false,\r
  dpr = 2,\r
  className = '',\r
  style\r
}: GradientWavesProps) {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const horizon = useMemo((): RGB => parseColor(horizonColor, [0.32, 0.15, 1]) ?? [0.32, 0.15, 1], [horizonColor]);\r
  const wave = useMemo((): RGB => parseColor(waveColor, [1, 0.62, 0.99]) ?? [1, 0.62, 0.99], [waveColor]);\r
  const crest = useMemo((): RGB => parseColor(crestColor, [1, 1, 1]) ?? [1, 1, 1], [crestColor]);\r
  const paper = useMemo(() => parseColor(backgroundColor, null), [backgroundColor]);\r
\r
  const settings = {\r
    horizon,\r
    wave,\r
    crest,\r
    paper,\r
    lightMode,\r
    speed,\r
    amplitude: Math.max(0, amplitude),\r
    waveScale: Math.max(0.01, waveScale),\r
    waveRatio: Math.max(0.01, waveRatio),\r
    swell,\r
    turbulence,\r
    tilt: (clamp(tilt, 10, 85) * Math.PI) / 180,\r
    zoom: Math.max(0.05, zoom),\r
    height,\r
    fogDepth: Math.max(0.5, fogDepth),\r
    relief: clamp(relief, 0, 1),\r
    lightAngle: (lightAngle * Math.PI) / 180,\r
    sheen: Math.max(0, sheen),\r
    brightness: Math.max(0, brightness),\r
    opacity: clamp(opacity, 0, 1),\r
    grain: typeof grain === 'number' ? Math.max(0, grain) : grain ? 0.05 : 0,\r
    steps: QUALITY[quality] ?? QUALITY.medium,\r
    intro,\r
    mouseInteraction,\r
    parallaxStrength: Math.max(0, parallaxStrength),\r
    mouseStrength: clamp(mouseStrength, 0, 1),\r
    swellOnClick,\r
    paused,\r
    dpr: Math.max(0.5, dpr)\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
  const wakeRef = useRef<(() => void) | null>(null);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
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
      'uAmplitude',\r
      'uWaveScale',\r
      'uWaveRatio',\r
      'uSwell',\r
      'uTurbulence',\r
      'uHeight',\r
      'uTilt',\r
      'uZoom',\r
      'uLook',\r
      'uFogDepth',\r
      'uBrightness',\r
      'uOpacity',\r
      'uGrain',\r
      'uHorizon',\r
      'uWave',\r
      'uCrest',\r
      'uBackground',\r
      'uOpaque',\r
      'uLight',\r
      'uSun',\r
      'uRelief',\r
      'uSheen',\r
      'uSteps',\r
      'uStride',\r
      'uIntro',\r
      'uSwells',\r
      'uSwellWidth'\r
    ];\r
    const u: Record<string, WebGLUniformLocation | null> = {};\r
    names.forEach(name => {\r
      u[name] = gl.getUniformLocation(program, name);\r
    });\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    const buffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    gl.useProgram(program);\r
\r
    const swellData = new Float32Array(MAX_SWELLS * 3);\r
    const state = {\r
      width: 1,\r
      height: 1,\r
      cssWidth: 0,\r
      cssHeight: 0,\r
      time: 0,\r
      clock: 0,\r
      last: 0,\r
      raf: 0,\r
      visible: false,\r
      introAt: -1,\r
      pointer: [0.5, 0.5],\r
      inside: false,\r
      look: [0, 0],\r
      steer: [0, 0],\r
      swells: [] as Swell[],\r
      quiet: 0,\r
      seen: null as typeof settings | null\r
    };\r
\r
    const fit = () => {\r
      const s = settingsRef.current;\r
      const ratio = Math.min(window.devicePixelRatio || 1, s.dpr);\r
      const width = Math.max(1, Math.round(state.cssWidth * ratio));\r
      const height = Math.max(1, Math.round(state.cssHeight * ratio));\r
      if (width === state.width && height === state.height) return;\r
      state.quiet = 0;\r
      state.width = width;\r
      state.height = height;\r
      canvas.width = width;\r
      canvas.height = height;\r
    };\r
\r
    const measure = () => {\r
      state.cssWidth = container.clientWidth;\r
      state.cssHeight = container.clientHeight;\r
      fit();\r
      wake();\r
    };\r
\r
    const introProgress = (s: typeof settings, reduced: boolean) => {\r
      if (!s.intro || reduced || state.introAt < 0) return 1;\r
      return clamp((state.clock - state.introAt) / INTRO_SECONDS, 0, 1);\r
    };\r
\r
    const render = (reduced: boolean) => {\r
      const s = settingsRef.current;\r
      gl.viewport(0, 0, state.width, state.height);\r
      gl.uniform2f(u.uResolution, state.width, state.height);\r
      gl.uniform1f(u.uTime, state.time);\r
      gl.uniform1f(u.uClock, state.clock);\r
      gl.uniform1f(u.uAmplitude, s.amplitude);\r
      gl.uniform1f(u.uWaveScale, s.waveScale);\r
      gl.uniform1f(u.uWaveRatio, s.waveRatio);\r
      gl.uniform1f(u.uSwell, s.swell);\r
      gl.uniform1f(u.uTurbulence, s.turbulence);\r
      gl.uniform1f(u.uHeight, s.height);\r
      gl.uniform1f(u.uTilt, s.tilt);\r
      gl.uniform1f(u.uZoom, s.zoom);\r
      gl.uniform2f(u.uLook, state.look[0], state.look[1]);\r
      gl.uniform1f(u.uFogDepth, s.fogDepth);\r
      gl.uniform1f(u.uBrightness, s.brightness);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.uniform1f(u.uGrain, s.grain);\r
      gl.uniform3fv(u.uHorizon, s.horizon);\r
      gl.uniform3fv(u.uWave, s.wave);\r
      gl.uniform3fv(u.uCrest, s.crest);\r
      const paperColor = s.paper ?? [0, 0, 0];\r
      gl.uniform3f(u.uBackground, paperColor[0], paperColor[1], paperColor[2]);\r
      gl.uniform1f(u.uOpaque, s.paper ? 1 : 0);\r
      gl.uniform1f(u.uLight, s.lightMode ? 1 : 0);\r
      const elevation = 0.52;\r
      const angle = s.lightAngle + state.steer[0] * s.mouseStrength * 2;\r
      const altitude = elevation - state.steer[1] * s.mouseStrength * 0.7;\r
      gl.uniform3f(\r
        u.uSun,\r
        Math.cos(altitude) * Math.cos(angle),\r
        Math.cos(altitude) * Math.sin(angle),\r
        Math.sin(altitude)\r
      );\r
      gl.uniform1f(u.uRelief, s.relief);\r
      gl.uniform1f(u.uSheen, s.sheen);\r
      gl.uniform1f(u.uSteps, s.steps);\r
      const slope =\r
        s.amplitude *\r
        ((s.waveScale / 7) * (1 + Math.abs(s.swell) / 20) +\r
          ((s.waveScale * s.waveRatio) / 3) * (1 + Math.abs(s.turbulence) / 23));\r
      const progress = introProgress(s, reduced);\r
      const shown = Math.min(1, progress / 0.22);\r
      const crest = 160 * Math.pow(3 / 160, easeInOut(Math.max(0, (progress - 0.1) / 0.9)));\r
      const settle = clamp((progress - 0.75) / 0.25, 0, 1);\r
      gl.uniform3f(u.uIntro, shown * shown * (3 - 2 * shown), crest, 1 - settle * settle * (3 - 2 * settle));\r
      swellData.fill(0);\r
      let swellPeak = 0;\r
      state.swells.forEach((swell, index) => {\r
        const age = state.clock - swell.at;\r
        const life = age / SWELL_SECONDS;\r
        const envelope = (1 - Math.exp(-age / 0.25)) * Math.pow(1 - life, 1.6);\r
        const lift = s.amplitude * SWELL_GAIN * envelope;\r
        swellData.set([swell.x - age * 12, swell.y, lift], index * 3);\r
        swellPeak = Math.max(swellPeak, lift);\r
      });\r
      gl.uniform3fv(u.uSwells, swellData);\r
      gl.uniform1f(u.uSwellWidth, SWELL_WIDTH);\r
      gl.uniform1f(u.uStride, 0.9 / Math.max(1, (slope + (swellPeak * 0.86) / SWELL_WIDTH) / 1.5));\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const tick = (now: number) => {\r
      state.raf = 0;\r
      if (!state.visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = state.last ? Math.min((now - state.last) / 1000, 0.1) : 0;\r
      state.last = now;\r
      const reduced = prefersReduced();\r
      state.clock += dt;\r
      if (state.introAt < 0) state.introAt = state.clock;\r
      if (!s.paused && !reduced) state.time += dt * s.speed;\r
\r
      const steering = s.mouseInteraction && state.inside && !reduced;\r
      const target = steering ? state.pointer : [0.5, 0.5];\r
      const ease = 1 - Math.exp(-dt / 0.45);\r
      const goalX = (target[0] - 0.5) * s.parallaxStrength * 0.35;\r
      const goalY = (target[1] - 0.5) * s.parallaxStrength * 0.18;\r
      state.look[0] += (goalX - state.look[0]) * ease;\r
      state.look[1] += (goalY - state.look[1]) * ease;\r
      const moving = Math.abs(goalX - state.look[0]) + Math.abs(goalY - state.look[1]) > 0.0002;\r
\r
      const steerEase = 1 - Math.exp(-dt / 0.6);\r
      const steerX = steering ? state.pointer[0] - 0.5 : 0;\r
      const steerY = steering ? 0.5 - state.pointer[1] : 0;\r
      state.steer[0] += (steerX - state.steer[0]) * steerEase;\r
      state.steer[1] += (steerY - state.steer[1]) * steerEase;\r
      const turning = Math.abs(steerX - state.steer[0]) + Math.abs(steerY - state.steer[1]) > 0.0005;\r
      state.swells = state.swells.filter(swell => state.clock - swell.at < SWELL_SECONDS);\r
\r
      const still = s.paused || reduced;\r
      const transient = moving || turning || state.swells.length > 0 || introProgress(s, reduced) < 1;\r
      if (state.seen !== s || transient || !still) state.quiet = 0;\r
      else state.quiet += 1;\r
      state.seen = s;\r
      if (state.quiet > 3) return;\r
\r
      state.raf = requestAnimationFrame(tick);\r
      fit();\r
      render(reduced);\r
    };\r
\r
    const wake = () => {\r
      if (state.raf || !state.visible || document.hidden) return;\r
      state.last = 0;\r
      state.raf = requestAnimationFrame(tick);\r
    };\r
    wakeRef.current = wake;\r
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
      const was = state.inside;\r
      state.inside = point.inside;\r
      if (point.inside) state.pointer = [point.x, point.y];\r
      if ((point.inside || was) && settingsRef.current.mouseInteraction) wake();\r
    };\r
\r
    const onLeave = () => {\r
      state.inside = false;\r
      wake();\r
    };\r
\r
    const onDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      if (!s.swellOnClick || event.button !== 0 || prefersReduced()) return;\r
      if (\r
        event.target instanceof Element &&\r
        event.target.closest('a, button, input, textarea, select, label, [role="button"]')\r
      )\r
        return;\r
      const point = local(event);\r
      if (!point.inside) return;\r
      const ground = groundAt([point.x, point.y], state.width / Math.max(state.height, 1), s, state.look);\r
      if (!ground) return;\r
      state.swells.push({ x: ground[0], y: ground[1], at: state.clock });\r
      if (state.swells.length > MAX_SWELLS) state.swells.shift();\r
      wake();\r
    };\r
\r
    const visibility = new IntersectionObserver(entries => {\r
      state.visible = entries.some(entry => entry.isIntersecting);\r
      wake();\r
    });\r
    visibility.observe(container);\r
    const sizes = new ResizeObserver(measure);\r
    sizes.observe(container);\r
    measure();\r
    document.addEventListener('visibilitychange', wake);\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    window.addEventListener('pointerdown', onDown);\r
    document.documentElement.addEventListener('pointerleave', onLeave);\r
    state.raf = requestAnimationFrame(tick);\r
\r
    return () => {\r
      cancelAnimationFrame(state.raf);\r
      wakeRef.current = null;\r
      document.removeEventListener('visibilitychange', wake);\r
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
`,a={dependencies:"",usage:`import GradientWaves from './GradientWaves';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <GradientWaves
    horizonColor="#5227FF"
    waveColor="#FF9FFC"
    crestColor="#FFFFFF"
    speed={0.4}
    amplitude={2.5}
    relief={1}
    lightAngle={120}
    mouseInteraction
    swellOnClick
  />
</div>`,code:n,css:r,tailwind:e,tsCode:t,tsTailwind:o};export{a as gradientWaves};
