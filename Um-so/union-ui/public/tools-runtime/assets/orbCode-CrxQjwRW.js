const r=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
import './Orb.css';\r
\r
const INTRO_SECONDS = 1.1;\r
const FOCAL = 3.2;\r
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
uniform float uRotation;\r
uniform vec2 uReach;\r
uniform float uNear;\r
uniform float uAwake;\r
uniform vec3 uBackground;\r
uniform vec3 uColor1;\r
uniform vec3 uColor2;\r
uniform vec3 uColor3;\r
uniform float uScale;\r
uniform float uWobble;\r
uniform float uGlow;\r
uniform float uBleed;\r
uniform float uHighlight;\r
uniform float uSwirl;\r
uniform float uOrbit;\r
uniform vec2 uEcho;\r
uniform float uReveal;\r
uniform float uOpacity;\r
uniform float uTrail;\r
uniform vec2 uTilt;\r
out vec4 outColor;\r
\r
vec3 hash33(vec3 p3) {\r
  p3 = fract(p3 * vec3(0.1031, 0.11369, 0.13787));\r
  p3 += dot(p3, p3.yxz + 19.19);\r
  return -1.0 + 2.0 * fract(vec3(p3.x + p3.y, p3.x + p3.z, p3.y + p3.z) * p3.zyx);\r
}\r
\r
float snoise3(vec3 p) {\r
  const float K1 = 0.333333333;\r
  const float K2 = 0.166666667;\r
  vec3 i = floor(p + (p.x + p.y + p.z) * K1);\r
  vec3 d0 = p - (i - (i.x + i.y + i.z) * K2);\r
  vec3 e = step(vec3(0.0), d0 - d0.yzx);\r
  vec3 i1 = e * (1.0 - e.zxy);\r
  vec3 i2 = 1.0 - e.zxy * (1.0 - e);\r
  vec3 d1 = d0 - (i1 - K2);\r
  vec3 d2 = d0 - (i2 - K1);\r
  vec3 d3 = d0 - 0.5;\r
  vec4 h = max(0.6 - vec4(dot(d0, d0), dot(d1, d1), dot(d2, d2), dot(d3, d3)), 0.0);\r
  vec4 n = h * h * h * h * vec4(dot(d0, hash33(i)), dot(d1, hash33(i + i1)), dot(d2, hash33(i + i2)), dot(d3, hash33(i + 1.0)));\r
  return dot(vec4(31.316), n);\r
}\r
\r
float light1(float intensity, float attenuation, float dist) {\r
  return intensity / (1.0 + dist * attenuation);\r
}\r
\r
float light2(float intensity, float attenuation, float dist) {\r
  return intensity / (1.0 + dist * dist * attenuation);\r
}\r
\r
vec4 draw(vec2 uv) {\r
  float rawLen = length(uv);\r
  vec2 dir = rawLen > 0.0001 ? uv / rawLen : vec2(1.0, 0.0);\r
  float reachAmount = length(uReach);\r
  vec2 reachDir = reachAmount > 0.00001 ? uReach / reachAmount : vec2(1.0, 0.0);\r
  float facing = exp((dot(dir, reachDir) - 1.0) * 3.2);\r
  float len = max(rawLen - reachAmount * facing * smoothstep(0.25, 0.65, rawLen), 0.0);\r
  uv = dir * len;\r
  float ang = atan(dir.y, dir.x);\r
  float invLen = len > 0.0 ? 1.0 / len : 0.0;\r
  float near = facing * uNear;\r
  float bgLuminance = dot(uBackground, vec3(0.299, 0.587, 0.114));\r
\r
  float n0 = snoise3(vec3(uv * 0.65, uTime * 0.5)) * 0.5 + 0.5;\r
  float r0 = mix(0.8 - 0.04 * uWobble, 0.8 + 0.04 * uWobble, n0);\r
  float d0 = distance(uv, (r0 * invLen) * uv);\r
  float v0 = light1(1.0, 10.0 / uGlow, d0);\r
  v0 *= smoothstep(r0 * 1.05, r0, len);\r
  float reach = max(uBleed, 0.04);\r
  float innerFade = smoothstep(r0 * (1.0 - 0.2 * reach), r0 * (1.0 - 0.05 * reach), len);\r
  v0 *= mix(innerFade, 1.0, bgLuminance * 0.7 * min(uBleed, 1.0));\r
  float body = smoothstep(0.8 - 0.2 * reach, 0.8, len);\r
  float cl = cos(ang + uSwirl) * 0.5 + 0.5;\r
\r
  vec2 pos = vec2(cos(uOrbit), sin(uOrbit)) * r0;\r
  float d = distance(uv, pos);\r
  vec2 head = vec2(cos(uOrbit), sin(uOrbit));\r
  float lag = atan(head.x * dir.y - head.y * dir.x, dot(dir, head));\r
  float trail = uTrail > 0.0 ? smoothstep(0.0, 0.35, lag) * exp(-max(lag, 0.0) * 2.6 / uTrail) : 0.0;\r
  float v1 = (light2(1.5, 5.0, d) + trail * 0.6) * uHighlight;\r
  v1 *= light1(1.0, 50.0, d0);\r
  float band = v0 * smoothstep(1.0, mix(0.6, 1.0, n0 * 0.5), len) * body;\r
  float heat = pow(clamp(band / 0.82, 0.0, 1.0), 3.0);\r
  float bloom = light2(1.0, 160.0 / uGlow, max(len - r0, 0.0)) * smoothstep(0.4, 0.0, len - r0) * step(r0, len);\r
\r
  float v2 = smoothstep(1.0, mix(0.6, 1.0, n0 * 0.5), len);\r
  float v3 = body;\r
\r
  vec3 colBase = mix(uColor1, uColor2, cl);\r
  float fadeAmount = mix(1.0, 0.1, bgLuminance);\r
\r
  float echoD = abs(len - r0 - uEcho.x);\r
  float echo = light1(1.0, 60.0, echoD) * smoothstep(0.12, 0.0, echoD) * uEcho.y;\r
\r
  vec3 darkCol = mix(uColor3, colBase, v0);\r
  darkCol = (darkCol + v1) * v2 * v3 * (1.0 + uAwake + near * 0.35) + mix(colBase, vec3(1.0), 0.25) * heat * (0.28 + near * 0.3);\r
  darkCol = clamp(darkCol + colBase * (bloom * 0.1 + echo), 0.0, 1.0);\r
\r
  vec3 lightCol = (colBase + v1) * mix(1.0, v2 * v3, fadeAmount);\r
  lightCol = mix(uBackground, lightCol, clamp(v0 + echo, 0.0, 1.0));\r
  lightCol = mix(lightCol, colBase, clamp(v0, 0.0, 1.0) * clamp(near * 0.4 + uAwake, 0.0, 0.6));\r
  lightCol = clamp(mix(lightCol, vec3(1.0), clamp(v1 * 0.35, 0.0, 0.6)), 0.0, 1.0);\r
\r
  vec3 finalCol = mix(darkCol, lightCol, bgLuminance);\r
  float alpha = max(max(finalCol.r, finalCol.g), finalCol.b);\r
  return vec4(finalCol / (alpha + 1e-5), alpha);\r
}\r
\r
vec2 toPlane(vec2 p, out float hit) {\r
  float cx = cos(uTilt.x);\r
  float sx = sin(uTilt.x);\r
  float cy = cos(uTilt.y);\r
  float sy = sin(uTilt.y);\r
  vec3 ex = vec3(cy, 0.0, -sy);\r
  vec3 ey = vec3(sy * sx, cx, cy * sx);\r
  vec3 normal = vec3(sy * cx, -sx, cy * cx);\r
  vec3 origin = vec3(0.0, 0.0, \${FOCAL.toFixed(1)});\r
  vec3 ray = vec3(p, -\${FOCAL.toFixed(1)});\r
  float denom = dot(normal, ray);\r
  float t = -dot(normal, origin) / (abs(denom) > 0.00001 ? denom : -0.00001);\r
  hit = t > 0.0 ? 1.0 : 0.0;\r
  vec3 q = origin + ray * t;\r
  return vec2(dot(q, ex), dot(q, ey));\r
}\r
\r
void main() {\r
  vec2 uv = (gl_FragCoord.xy - uResolution * 0.5) / min(uResolution.x, uResolution.y) * 2.0;\r
  uv *= uScale;\r
  float hit = 1.0;\r
  if (abs(uTilt.x) + abs(uTilt.y) > 0.0001) uv = toPlane(uv, hit);\r
\r
  float s = sin(uRotation);\r
  float c = cos(uRotation);\r
  uv = vec2(c * uv.x - s * uv.y, s * uv.x + c * uv.y);\r
\r
  vec4 col = draw(uv);\r
  float dither = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;\r
  float alpha = clamp(col.a * hit * uReveal * uOpacity + dither, 0.0, 1.0);\r
  outColor = vec4(col.rgb * alpha * alpha, alpha);\r
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
const link = gl => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
  const program = gl.createProgram();\r
  if (!vertex || !fragment || !program) return null;\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
  gl.bindAttribLocation(program, 0, 'aPosition');\r
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
const Orb = ({\r
  colors = ['#9c43fe', '#4cc2e9', '#101499'],\r
  hue = 0,\r
  backgroundColor = '#000000',\r
  size = 1,\r
  glow = 1,\r
  bleed = 1,\r
  wobble = 1,\r
  highlight = 1,\r
  trail = 1,\r
  tiltX = 0,\r
  tiltY = 0,\r
  speed = 1,\r
  hoverIntensity = 1,\r
  rotateOnHover = true,\r
  forceHoverState = false,\r
  followCursor = true,\r
  clickPulse = true,\r
  intro = true,\r
  opacity = 1,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const palette = Array.isArray(colors) ? colors : [];\r
  const settings = {\r
    colors: [palette[0] ?? '#9c43fe', palette[1] ?? palette[0] ?? '#4cc2e9', palette[2] ?? '#101499'].map(String),\r
    hue,\r
    backgroundColor: String(backgroundColor),\r
    size: clamp(size, 0.1, 3),\r
    glow: clamp(glow, 0.1, 5),\r
    bleed: clamp(bleed, 0, 4),\r
    wobble: Math.max(0, wobble),\r
    highlight: Math.max(0, highlight),\r
    trail: Math.max(0, trail),\r
    tiltX: clamp(tiltX, -70, 70),\r
    tiltY: clamp(tiltY, -70, 70),\r
    speed,\r
    hoverIntensity: Math.max(0, hoverIntensity),\r
    rotateOnHover,\r
    forceHoverState,\r
    followCursor,\r
    clickPulse,\r
    intro,\r
    opacity: clamp(opacity, 0, 1),\r
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
      antialias: false,\r
      depth: false,\r
      stencil: false\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const program = link(gl);\r
    if (!program) return undefined;\r
    const u = program.uniforms;\r
\r
    const buffer = gl.createBuffer();\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const cache = new Map();\r
    const parse = value => {\r
      if (cache.has(value)) return cache.get(value);\r
      let rgb = [0, 0, 0];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#000000';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b, a] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = a ? [r / 255, g / 255, b / 255] : [0, 0, 0];\r
      }\r
      cache.set(value, rgb);\r
      return rgb;\r
    };\r
    const shiftHue = (rgb, degrees) => {\r
      if (!degrees) return rgb;\r
      const angle = (degrees * Math.PI) / 180;\r
      const cos = Math.cos(angle);\r
      const sin = Math.sin(angle);\r
      const [r, g, b] = rgb;\r
      const y = 0.299 * r + 0.587 * g + 0.114 * b;\r
      const i = 0.596 * r - 0.274 * g - 0.322 * b;\r
      const q = 0.211 * r - 0.523 * g + 0.312 * b;\r
      const ni = i * cos - q * sin;\r
      const nq = i * sin + q * cos;\r
      return [y + 0.956 * ni + 0.621 * nq, y - 0.272 * ni - 0.647 * nq, y - 1.106 * ni + 1.703 * nq];\r
    };\r
\r
    const view = { width: 1, height: 1 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const state = {\r
      time: 0,\r
      swirl: 0,\r
      orbit: 0,\r
      echo: 1,\r
      rotation: 0,\r
      hover: 0,\r
      near: 0,\r
      reachX: 0,\r
      reachY: 0,\r
      reachSpeedX: 0,\r
      reachSpeedY: 0,\r
      pulse: 0,\r
      pulseSpeed: 0,\r
      kick: settingsRef.current.intro && !reduce ? 2.5 : 0,\r
      reveal: settingsRef.current.intro && !reduce ? 0 : 1\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const toOrb = (x, y) => {\r
      const s = settingsRef.current;\r
      const side = Math.min(view.width, view.height);\r
      const scale = 1 / (s.size * (1 + state.pulse));\r
      let ux = ((x - view.width / 2) / side) * 2 * scale;\r
      let uy = ((view.height / 2 - y) / side) * 2 * scale;\r
      if (s.tiltX || s.tiltY) {\r
        const ax = (-s.tiltX * Math.PI) / 180;\r
        const ay = (s.tiltY * Math.PI) / 180;\r
        const [cx, sx, cy, sy] = [Math.cos(ax), Math.sin(ax), Math.cos(ay), Math.sin(ay)];\r
        const normal = [sy * cx, -sx, cy * cx];\r
        const ray = [ux, uy, -FOCAL];\r
        const denom = normal[0] * ray[0] + normal[1] * ray[1] + normal[2] * ray[2];\r
        const t = -(normal[2] * FOCAL) / (Math.abs(denom) > 0.00001 ? denom : -0.00001);\r
        if (t <= 0) return [99, 99];\r
        const q = [ray[0] * t, ray[1] * t, FOCAL + ray[2] * t];\r
        ux = q[0] * cy - q[2] * sy;\r
        uy = q[0] * sy * sx + q[1] * cx + q[2] * cy * sx;\r
      }\r
      const sin = Math.sin(state.rotation);\r
      const cos = Math.cos(state.rotation);\r
      return [cos * ux - sin * uy, sin * ux + cos * uy];\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const [c1, c2, c3] = s.colors.map(value => shiftHue(parse(value), s.hue));\r
      const reveal = state.reveal;\r
      const back = reveal - 1;\r
      const grow = 1 + 2.2 * back * back * back + 1.2 * back * back;\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(program.program);\r
      gl.bindVertexArray(vao);\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(u.uTime, state.time);\r
      gl.uniform2f(u.uReach, state.reachX, state.reachY);\r
      gl.uniform1f(u.uNear, state.near);\r
      gl.uniform1f(u.uAwake, state.hover * s.hoverIntensity * 0.18);\r
      gl.uniform1f(u.uRotation, state.rotation);\r
      gl.uniform3fv(u.uBackground, parse(s.backgroundColor));\r
      gl.uniform3fv(u.uColor1, c1);\r
      gl.uniform3fv(u.uColor2, c2);\r
      gl.uniform3fv(u.uColor3, c3);\r
      gl.uniform1f(u.uScale, 1 / (s.size * (1 + state.pulse) * (0.62 + 0.38 * grow)));\r
      gl.uniform1f(u.uWobble, s.wobble);\r
      gl.uniform1f(u.uGlow, s.glow);\r
      gl.uniform1f(u.uBleed, s.bleed);\r
      gl.uniform1f(u.uHighlight, s.highlight);\r
      gl.uniform2f(u.uEcho, state.echo * 0.55, state.echo < 1 ? (1 - state.echo) * (1 - state.echo) : 0);\r
      gl.uniform1f(u.uSwirl, state.swirl);\r
      gl.uniform1f(u.uOrbit, state.orbit);\r
      gl.uniform1f(\r
        u.uReveal,\r
        Math.min(1, reveal / 0.55) * Math.min(1, reveal / 0.55) * (3 - 2 * Math.min(1, reveal / 0.55))\r
      );\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.uniform1f(u.uTrail, s.trail);\r
      gl.uniform2f(u.uTilt, (-s.tiltX * Math.PI) / 180, (s.tiltY * Math.PI) / 180);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.0005, 0.05) : 1 / 60;\r
      last = now;\r
      if (s.paused) {\r
        state.reveal = 1;\r
        render();\r
        last = 0;\r
        return;\r
      }\r
      const motion = reduce ? 0 : 1;\r
      const [px, py] = toOrb(pointer.x, pointer.y);\r
      const distance = Math.hypot(px, py);\r
      const region = pointer.inside && motion ? clamp((1.45 - distance) / 0.4, 0, 1) : 0;\r
      const zone = region * region * (3 - 2 * region);\r
      const aimed = zone * clamp((distance - 0.15) / 0.45, 0, 1);\r
      const near = zone > 0.5;\r
      const target = s.forceHoverState ? 1 : zone;\r
      state.hover += (target - state.hover) * (1 - Math.exp(-dt / 0.16));\r
      const reach = 0.075 * s.hoverIntensity * aimed;\r
      const goalX = distance > 0.0001 ? (px / distance) * reach : 0;\r
      const goalY = distance > 0.0001 ? (py / distance) * reach : 0;\r
      state.reachSpeedX += (70 * (goalX - state.reachX) - 7 * state.reachSpeedX) * dt;\r
      state.reachSpeedY += (70 * (goalY - state.reachY) - 7 * state.reachSpeedY) * dt;\r
      state.reachX += state.reachSpeedX * dt;\r
      state.reachY += state.reachSpeedY * dt;\r
      state.near += (aimed * s.hoverIntensity - state.near) * (1 - Math.exp(-dt / 0.12));\r
\r
      const step = dt * s.speed * motion;\r
      state.time += step;\r
      state.swirl += step * 2 * (1 + state.kick);\r
      state.echo = Math.min(1, state.echo + dt / 1.2);\r
      if (s.rotateOnHover) state.rotation += dt * 0.3 * state.hover * motion;\r
\r
      const aim = Math.atan2(py, px);\r
      if (s.followCursor && near && motion) {\r
        const delta = Math.atan2(Math.sin(aim - state.orbit), Math.cos(aim - state.orbit));\r
        state.orbit += delta * (1 - Math.exp(-dt * 6));\r
      } else {\r
        state.orbit -= step;\r
      }\r
      state.orbit = Math.atan2(Math.sin(state.orbit), Math.cos(state.orbit));\r
\r
      state.pulseSpeed += (-170 * state.pulse - 11 * state.pulseSpeed) * dt;\r
      state.pulse += state.pulseSpeed * dt;\r
      state.kick *= Math.exp(-dt * 2.5);\r
\r
      if (!s.intro || reduce) state.reveal = 1;\r
      else if (state.reveal < 1) state.reveal = Math.min(1, state.reveal + dt / INTRO_SECONDS);\r
\r
      render();\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      view.width = width;\r
      view.height = height;\r
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      render();\r
      wake();\r
    };\r
\r
    const locate = event => {\r
      const rect = container.getBoundingClientRect();\r
      pointer.x = event.clientX - rect.left;\r
      pointer.y = event.clientY - rect.top;\r
      pointer.inside = pointer.x >= 0 && pointer.y >= 0 && pointer.x <= rect.width && pointer.y <= rect.height;\r
    };\r
\r
    const onPointerMove = event => {\r
      locate(event);\r
      if (!settingsRef.current.paused) wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      locate(event);\r
      if (!pointer.inside || !s.clickPulse || s.paused || reduce) return;\r
      const [px, py] = toOrb(pointer.x, pointer.y);\r
      if (Math.hypot(px, py) > 1) return;\r
      state.pulseSpeed += 0.9;\r
      state.kick = 2.2;\r
      state.echo = 0;\r
      wake();\r
    };\r
\r
    const onPointerUp = event => {\r
      if (event.pointerType !== 'mouse') pointer.inside = false;\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
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
    window.addEventListener('pointerup', onPointerUp, { passive: true });\r
    window.addEventListener('pointercancel', onPointerUp, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
\r
    let lastDpr = settingsRef.current.dpr;\r
    wakeRef.current = () => {\r
      const s = settingsRef.current;\r
      if (s.dpr !== lastDpr) {\r
        lastDpr = s.dpr;\r
        resize();\r
        return;\r
      }\r
      if (!raf) render();\r
      wake();\r
    };\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('pointerup', onPointerUp);\r
      window.removeEventListener('pointercancel', onPointerUp);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteProgram(program.program);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div ref={containerRef} className={\`orb-container\${className ? \` \${className}\` : ''}\`} style={style}>\r
      <canvas ref={canvasRef} className="orb-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Orb;\r
`,n=`.orb-container {\r
  position: relative;\r
  z-index: 0;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.orb-canvas {\r
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
const INTRO_SECONDS = 1.1;\r
const FOCAL = 3.2;\r
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
uniform float uRotation;\r
uniform vec2 uReach;\r
uniform float uNear;\r
uniform float uAwake;\r
uniform vec3 uBackground;\r
uniform vec3 uColor1;\r
uniform vec3 uColor2;\r
uniform vec3 uColor3;\r
uniform float uScale;\r
uniform float uWobble;\r
uniform float uGlow;\r
uniform float uBleed;\r
uniform float uHighlight;\r
uniform float uSwirl;\r
uniform float uOrbit;\r
uniform vec2 uEcho;\r
uniform float uReveal;\r
uniform float uOpacity;\r
uniform float uTrail;\r
uniform vec2 uTilt;\r
out vec4 outColor;\r
\r
vec3 hash33(vec3 p3) {\r
  p3 = fract(p3 * vec3(0.1031, 0.11369, 0.13787));\r
  p3 += dot(p3, p3.yxz + 19.19);\r
  return -1.0 + 2.0 * fract(vec3(p3.x + p3.y, p3.x + p3.z, p3.y + p3.z) * p3.zyx);\r
}\r
\r
float snoise3(vec3 p) {\r
  const float K1 = 0.333333333;\r
  const float K2 = 0.166666667;\r
  vec3 i = floor(p + (p.x + p.y + p.z) * K1);\r
  vec3 d0 = p - (i - (i.x + i.y + i.z) * K2);\r
  vec3 e = step(vec3(0.0), d0 - d0.yzx);\r
  vec3 i1 = e * (1.0 - e.zxy);\r
  vec3 i2 = 1.0 - e.zxy * (1.0 - e);\r
  vec3 d1 = d0 - (i1 - K2);\r
  vec3 d2 = d0 - (i2 - K1);\r
  vec3 d3 = d0 - 0.5;\r
  vec4 h = max(0.6 - vec4(dot(d0, d0), dot(d1, d1), dot(d2, d2), dot(d3, d3)), 0.0);\r
  vec4 n = h * h * h * h * vec4(dot(d0, hash33(i)), dot(d1, hash33(i + i1)), dot(d2, hash33(i + i2)), dot(d3, hash33(i + 1.0)));\r
  return dot(vec4(31.316), n);\r
}\r
\r
float light1(float intensity, float attenuation, float dist) {\r
  return intensity / (1.0 + dist * attenuation);\r
}\r
\r
float light2(float intensity, float attenuation, float dist) {\r
  return intensity / (1.0 + dist * dist * attenuation);\r
}\r
\r
vec4 draw(vec2 uv) {\r
  float rawLen = length(uv);\r
  vec2 dir = rawLen > 0.0001 ? uv / rawLen : vec2(1.0, 0.0);\r
  float reachAmount = length(uReach);\r
  vec2 reachDir = reachAmount > 0.00001 ? uReach / reachAmount : vec2(1.0, 0.0);\r
  float facing = exp((dot(dir, reachDir) - 1.0) * 3.2);\r
  float len = max(rawLen - reachAmount * facing * smoothstep(0.25, 0.65, rawLen), 0.0);\r
  uv = dir * len;\r
  float ang = atan(dir.y, dir.x);\r
  float invLen = len > 0.0 ? 1.0 / len : 0.0;\r
  float near = facing * uNear;\r
  float bgLuminance = dot(uBackground, vec3(0.299, 0.587, 0.114));\r
\r
  float n0 = snoise3(vec3(uv * 0.65, uTime * 0.5)) * 0.5 + 0.5;\r
  float r0 = mix(0.8 - 0.04 * uWobble, 0.8 + 0.04 * uWobble, n0);\r
  float d0 = distance(uv, (r0 * invLen) * uv);\r
  float v0 = light1(1.0, 10.0 / uGlow, d0);\r
  v0 *= smoothstep(r0 * 1.05, r0, len);\r
  float reach = max(uBleed, 0.04);\r
  float innerFade = smoothstep(r0 * (1.0 - 0.2 * reach), r0 * (1.0 - 0.05 * reach), len);\r
  v0 *= mix(innerFade, 1.0, bgLuminance * 0.7 * min(uBleed, 1.0));\r
  float body = smoothstep(0.8 - 0.2 * reach, 0.8, len);\r
  float cl = cos(ang + uSwirl) * 0.5 + 0.5;\r
\r
  vec2 pos = vec2(cos(uOrbit), sin(uOrbit)) * r0;\r
  float d = distance(uv, pos);\r
  vec2 head = vec2(cos(uOrbit), sin(uOrbit));\r
  float lag = atan(head.x * dir.y - head.y * dir.x, dot(dir, head));\r
  float trail = uTrail > 0.0 ? smoothstep(0.0, 0.35, lag) * exp(-max(lag, 0.0) * 2.6 / uTrail) : 0.0;\r
  float v1 = (light2(1.5, 5.0, d) + trail * 0.6) * uHighlight;\r
  v1 *= light1(1.0, 50.0, d0);\r
  float band = v0 * smoothstep(1.0, mix(0.6, 1.0, n0 * 0.5), len) * body;\r
  float heat = pow(clamp(band / 0.82, 0.0, 1.0), 3.0);\r
  float bloom = light2(1.0, 160.0 / uGlow, max(len - r0, 0.0)) * smoothstep(0.4, 0.0, len - r0) * step(r0, len);\r
\r
  float v2 = smoothstep(1.0, mix(0.6, 1.0, n0 * 0.5), len);\r
  float v3 = body;\r
\r
  vec3 colBase = mix(uColor1, uColor2, cl);\r
  float fadeAmount = mix(1.0, 0.1, bgLuminance);\r
\r
  float echoD = abs(len - r0 - uEcho.x);\r
  float echo = light1(1.0, 60.0, echoD) * smoothstep(0.12, 0.0, echoD) * uEcho.y;\r
\r
  vec3 darkCol = mix(uColor3, colBase, v0);\r
  darkCol = (darkCol + v1) * v2 * v3 * (1.0 + uAwake + near * 0.35) + mix(colBase, vec3(1.0), 0.25) * heat * (0.28 + near * 0.3);\r
  darkCol = clamp(darkCol + colBase * (bloom * 0.1 + echo), 0.0, 1.0);\r
\r
  vec3 lightCol = (colBase + v1) * mix(1.0, v2 * v3, fadeAmount);\r
  lightCol = mix(uBackground, lightCol, clamp(v0 + echo, 0.0, 1.0));\r
  lightCol = mix(lightCol, colBase, clamp(v0, 0.0, 1.0) * clamp(near * 0.4 + uAwake, 0.0, 0.6));\r
  lightCol = clamp(mix(lightCol, vec3(1.0), clamp(v1 * 0.35, 0.0, 0.6)), 0.0, 1.0);\r
\r
  vec3 finalCol = mix(darkCol, lightCol, bgLuminance);\r
  float alpha = max(max(finalCol.r, finalCol.g), finalCol.b);\r
  return vec4(finalCol / (alpha + 1e-5), alpha);\r
}\r
\r
vec2 toPlane(vec2 p, out float hit) {\r
  float cx = cos(uTilt.x);\r
  float sx = sin(uTilt.x);\r
  float cy = cos(uTilt.y);\r
  float sy = sin(uTilt.y);\r
  vec3 ex = vec3(cy, 0.0, -sy);\r
  vec3 ey = vec3(sy * sx, cx, cy * sx);\r
  vec3 normal = vec3(sy * cx, -sx, cy * cx);\r
  vec3 origin = vec3(0.0, 0.0, \${FOCAL.toFixed(1)});\r
  vec3 ray = vec3(p, -\${FOCAL.toFixed(1)});\r
  float denom = dot(normal, ray);\r
  float t = -dot(normal, origin) / (abs(denom) > 0.00001 ? denom : -0.00001);\r
  hit = t > 0.0 ? 1.0 : 0.0;\r
  vec3 q = origin + ray * t;\r
  return vec2(dot(q, ex), dot(q, ey));\r
}\r
\r
void main() {\r
  vec2 uv = (gl_FragCoord.xy - uResolution * 0.5) / min(uResolution.x, uResolution.y) * 2.0;\r
  uv *= uScale;\r
  float hit = 1.0;\r
  if (abs(uTilt.x) + abs(uTilt.y) > 0.0001) uv = toPlane(uv, hit);\r
\r
  float s = sin(uRotation);\r
  float c = cos(uRotation);\r
  uv = vec2(c * uv.x - s * uv.y, s * uv.x + c * uv.y);\r
\r
  vec4 col = draw(uv);\r
  float dither = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;\r
  float alpha = clamp(col.a * hit * uReveal * uOpacity + dither, 0.0, 1.0);\r
  outColor = vec4(col.rgb * alpha * alpha, alpha);\r
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
const link = gl => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
  const program = gl.createProgram();\r
  if (!vertex || !fragment || !program) return null;\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
  gl.bindAttribLocation(program, 0, 'aPosition');\r
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
const Orb = ({\r
  colors = ['#9c43fe', '#4cc2e9', '#101499'],\r
  hue = 0,\r
  backgroundColor = '#000000',\r
  size = 1,\r
  glow = 1,\r
  bleed = 1,\r
  wobble = 1,\r
  highlight = 1,\r
  trail = 1,\r
  tiltX = 0,\r
  tiltY = 0,\r
  speed = 1,\r
  hoverIntensity = 1,\r
  rotateOnHover = true,\r
  forceHoverState = false,\r
  followCursor = true,\r
  clickPulse = true,\r
  intro = true,\r
  opacity = 1,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const palette = Array.isArray(colors) ? colors : [];\r
  const settings = {\r
    colors: [palette[0] ?? '#9c43fe', palette[1] ?? palette[0] ?? '#4cc2e9', palette[2] ?? '#101499'].map(String),\r
    hue,\r
    backgroundColor: String(backgroundColor),\r
    size: clamp(size, 0.1, 3),\r
    glow: clamp(glow, 0.1, 5),\r
    bleed: clamp(bleed, 0, 4),\r
    wobble: Math.max(0, wobble),\r
    highlight: Math.max(0, highlight),\r
    trail: Math.max(0, trail),\r
    tiltX: clamp(tiltX, -70, 70),\r
    tiltY: clamp(tiltY, -70, 70),\r
    speed,\r
    hoverIntensity: Math.max(0, hoverIntensity),\r
    rotateOnHover,\r
    forceHoverState,\r
    followCursor,\r
    clickPulse,\r
    intro,\r
    opacity: clamp(opacity, 0, 1),\r
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
      antialias: false,\r
      depth: false,\r
      stencil: false\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const program = link(gl);\r
    if (!program) return undefined;\r
    const u = program.uniforms;\r
\r
    const buffer = gl.createBuffer();\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const cache = new Map();\r
    const parse = value => {\r
      if (cache.has(value)) return cache.get(value);\r
      let rgb = [0, 0, 0];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#000000';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b, a] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = a ? [r / 255, g / 255, b / 255] : [0, 0, 0];\r
      }\r
      cache.set(value, rgb);\r
      return rgb;\r
    };\r
    const shiftHue = (rgb, degrees) => {\r
      if (!degrees) return rgb;\r
      const angle = (degrees * Math.PI) / 180;\r
      const cos = Math.cos(angle);\r
      const sin = Math.sin(angle);\r
      const [r, g, b] = rgb;\r
      const y = 0.299 * r + 0.587 * g + 0.114 * b;\r
      const i = 0.596 * r - 0.274 * g - 0.322 * b;\r
      const q = 0.211 * r - 0.523 * g + 0.312 * b;\r
      const ni = i * cos - q * sin;\r
      const nq = i * sin + q * cos;\r
      return [y + 0.956 * ni + 0.621 * nq, y - 0.272 * ni - 0.647 * nq, y - 1.106 * ni + 1.703 * nq];\r
    };\r
\r
    const view = { width: 1, height: 1 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const state = {\r
      time: 0,\r
      swirl: 0,\r
      orbit: 0,\r
      echo: 1,\r
      rotation: 0,\r
      hover: 0,\r
      near: 0,\r
      reachX: 0,\r
      reachY: 0,\r
      reachSpeedX: 0,\r
      reachSpeedY: 0,\r
      pulse: 0,\r
      pulseSpeed: 0,\r
      kick: settingsRef.current.intro && !reduce ? 2.5 : 0,\r
      reveal: settingsRef.current.intro && !reduce ? 0 : 1\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const toOrb = (x, y) => {\r
      const s = settingsRef.current;\r
      const side = Math.min(view.width, view.height);\r
      const scale = 1 / (s.size * (1 + state.pulse));\r
      let ux = ((x - view.width / 2) / side) * 2 * scale;\r
      let uy = ((view.height / 2 - y) / side) * 2 * scale;\r
      if (s.tiltX || s.tiltY) {\r
        const ax = (-s.tiltX * Math.PI) / 180;\r
        const ay = (s.tiltY * Math.PI) / 180;\r
        const [cx, sx, cy, sy] = [Math.cos(ax), Math.sin(ax), Math.cos(ay), Math.sin(ay)];\r
        const normal = [sy * cx, -sx, cy * cx];\r
        const ray = [ux, uy, -FOCAL];\r
        const denom = normal[0] * ray[0] + normal[1] * ray[1] + normal[2] * ray[2];\r
        const t = -(normal[2] * FOCAL) / (Math.abs(denom) > 0.00001 ? denom : -0.00001);\r
        if (t <= 0) return [99, 99];\r
        const q = [ray[0] * t, ray[1] * t, FOCAL + ray[2] * t];\r
        ux = q[0] * cy - q[2] * sy;\r
        uy = q[0] * sy * sx + q[1] * cx + q[2] * cy * sx;\r
      }\r
      const sin = Math.sin(state.rotation);\r
      const cos = Math.cos(state.rotation);\r
      return [cos * ux - sin * uy, sin * ux + cos * uy];\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const [c1, c2, c3] = s.colors.map(value => shiftHue(parse(value), s.hue));\r
      const reveal = state.reveal;\r
      const back = reveal - 1;\r
      const grow = 1 + 2.2 * back * back * back + 1.2 * back * back;\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(program.program);\r
      gl.bindVertexArray(vao);\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(u.uTime, state.time);\r
      gl.uniform2f(u.uReach, state.reachX, state.reachY);\r
      gl.uniform1f(u.uNear, state.near);\r
      gl.uniform1f(u.uAwake, state.hover * s.hoverIntensity * 0.18);\r
      gl.uniform1f(u.uRotation, state.rotation);\r
      gl.uniform3fv(u.uBackground, parse(s.backgroundColor));\r
      gl.uniform3fv(u.uColor1, c1);\r
      gl.uniform3fv(u.uColor2, c2);\r
      gl.uniform3fv(u.uColor3, c3);\r
      gl.uniform1f(u.uScale, 1 / (s.size * (1 + state.pulse) * (0.62 + 0.38 * grow)));\r
      gl.uniform1f(u.uWobble, s.wobble);\r
      gl.uniform1f(u.uGlow, s.glow);\r
      gl.uniform1f(u.uBleed, s.bleed);\r
      gl.uniform1f(u.uHighlight, s.highlight);\r
      gl.uniform2f(u.uEcho, state.echo * 0.55, state.echo < 1 ? (1 - state.echo) * (1 - state.echo) : 0);\r
      gl.uniform1f(u.uSwirl, state.swirl);\r
      gl.uniform1f(u.uOrbit, state.orbit);\r
      gl.uniform1f(\r
        u.uReveal,\r
        Math.min(1, reveal / 0.55) * Math.min(1, reveal / 0.55) * (3 - 2 * Math.min(1, reveal / 0.55))\r
      );\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.uniform1f(u.uTrail, s.trail);\r
      gl.uniform2f(u.uTilt, (-s.tiltX * Math.PI) / 180, (s.tiltY * Math.PI) / 180);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.0005, 0.05) : 1 / 60;\r
      last = now;\r
      if (s.paused) {\r
        state.reveal = 1;\r
        render();\r
        last = 0;\r
        return;\r
      }\r
      const motion = reduce ? 0 : 1;\r
      const [px, py] = toOrb(pointer.x, pointer.y);\r
      const distance = Math.hypot(px, py);\r
      const region = pointer.inside && motion ? clamp((1.45 - distance) / 0.4, 0, 1) : 0;\r
      const zone = region * region * (3 - 2 * region);\r
      const aimed = zone * clamp((distance - 0.15) / 0.45, 0, 1);\r
      const near = zone > 0.5;\r
      const target = s.forceHoverState ? 1 : zone;\r
      state.hover += (target - state.hover) * (1 - Math.exp(-dt / 0.16));\r
      const reach = 0.075 * s.hoverIntensity * aimed;\r
      const goalX = distance > 0.0001 ? (px / distance) * reach : 0;\r
      const goalY = distance > 0.0001 ? (py / distance) * reach : 0;\r
      state.reachSpeedX += (70 * (goalX - state.reachX) - 7 * state.reachSpeedX) * dt;\r
      state.reachSpeedY += (70 * (goalY - state.reachY) - 7 * state.reachSpeedY) * dt;\r
      state.reachX += state.reachSpeedX * dt;\r
      state.reachY += state.reachSpeedY * dt;\r
      state.near += (aimed * s.hoverIntensity - state.near) * (1 - Math.exp(-dt / 0.12));\r
\r
      const step = dt * s.speed * motion;\r
      state.time += step;\r
      state.swirl += step * 2 * (1 + state.kick);\r
      state.echo = Math.min(1, state.echo + dt / 1.2);\r
      if (s.rotateOnHover) state.rotation += dt * 0.3 * state.hover * motion;\r
\r
      const aim = Math.atan2(py, px);\r
      if (s.followCursor && near && motion) {\r
        const delta = Math.atan2(Math.sin(aim - state.orbit), Math.cos(aim - state.orbit));\r
        state.orbit += delta * (1 - Math.exp(-dt * 6));\r
      } else {\r
        state.orbit -= step;\r
      }\r
      state.orbit = Math.atan2(Math.sin(state.orbit), Math.cos(state.orbit));\r
\r
      state.pulseSpeed += (-170 * state.pulse - 11 * state.pulseSpeed) * dt;\r
      state.pulse += state.pulseSpeed * dt;\r
      state.kick *= Math.exp(-dt * 2.5);\r
\r
      if (!s.intro || reduce) state.reveal = 1;\r
      else if (state.reveal < 1) state.reveal = Math.min(1, state.reveal + dt / INTRO_SECONDS);\r
\r
      render();\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      view.width = width;\r
      view.height = height;\r
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      render();\r
      wake();\r
    };\r
\r
    const locate = event => {\r
      const rect = container.getBoundingClientRect();\r
      pointer.x = event.clientX - rect.left;\r
      pointer.y = event.clientY - rect.top;\r
      pointer.inside = pointer.x >= 0 && pointer.y >= 0 && pointer.x <= rect.width && pointer.y <= rect.height;\r
    };\r
\r
    const onPointerMove = event => {\r
      locate(event);\r
      if (!settingsRef.current.paused) wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      locate(event);\r
      if (!pointer.inside || !s.clickPulse || s.paused || reduce) return;\r
      const [px, py] = toOrb(pointer.x, pointer.y);\r
      if (Math.hypot(px, py) > 1) return;\r
      state.pulseSpeed += 0.9;\r
      state.kick = 2.2;\r
      state.echo = 0;\r
      wake();\r
    };\r
\r
    const onPointerUp = event => {\r
      if (event.pointerType !== 'mouse') pointer.inside = false;\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
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
    window.addEventListener('pointerup', onPointerUp, { passive: true });\r
    window.addEventListener('pointercancel', onPointerUp, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
\r
    let lastDpr = settingsRef.current.dpr;\r
    wakeRef.current = () => {\r
      const s = settingsRef.current;\r
      if (s.dpr !== lastDpr) {\r
        lastDpr = s.dpr;\r
        resize();\r
        return;\r
      }\r
      if (!raf) render();\r
      wake();\r
    };\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('pointerup', onPointerUp);\r
      window.removeEventListener('pointercancel', onPointerUp);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteProgram(program.program);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
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
      className={['relative z-0 h-full w-full overflow-hidden', className].filter(Boolean).join(' ')}\r
      style={style}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Orb;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties } from 'react';\r
import './Orb.css';\r
\r
export interface OrbProps {\r
  colors?: string[];\r
  hue?: number;\r
  backgroundColor?: string;\r
  size?: number;\r
  glow?: number;\r
  bleed?: number;\r
  wobble?: number;\r
  highlight?: number;\r
  trail?: number;\r
  tiltX?: number;\r
  tiltY?: number;\r
  speed?: number;\r
  hoverIntensity?: number;\r
  rotateOnHover?: boolean;\r
  forceHoverState?: boolean;\r
  followCursor?: boolean;\r
  clickPulse?: boolean;\r
  intro?: boolean;\r
  opacity?: number;\r
  paused?: boolean;\r
  dpr?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
type Settings = {\r
  colors: string[];\r
  hue: number;\r
  backgroundColor: string;\r
  size: number;\r
  glow: number;\r
  bleed: number;\r
  wobble: number;\r
  highlight: number;\r
  trail: number;\r
  tiltX: number;\r
  tiltY: number;\r
  speed: number;\r
  hoverIntensity: number;\r
  rotateOnHover: boolean;\r
  forceHoverState: boolean;\r
  followCursor: boolean;\r
  clickPulse: boolean;\r
  intro: boolean;\r
  opacity: number;\r
  paused: boolean;\r
  dpr?: number;\r
};\r
\r
type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };\r
\r
const INTRO_SECONDS = 1.1;\r
const FOCAL = 3.2;\r
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
uniform float uRotation;\r
uniform vec2 uReach;\r
uniform float uNear;\r
uniform float uAwake;\r
uniform vec3 uBackground;\r
uniform vec3 uColor1;\r
uniform vec3 uColor2;\r
uniform vec3 uColor3;\r
uniform float uScale;\r
uniform float uWobble;\r
uniform float uGlow;\r
uniform float uBleed;\r
uniform float uHighlight;\r
uniform float uSwirl;\r
uniform float uOrbit;\r
uniform vec2 uEcho;\r
uniform float uReveal;\r
uniform float uOpacity;\r
uniform float uTrail;\r
uniform vec2 uTilt;\r
out vec4 outColor;\r
\r
vec3 hash33(vec3 p3) {\r
  p3 = fract(p3 * vec3(0.1031, 0.11369, 0.13787));\r
  p3 += dot(p3, p3.yxz + 19.19);\r
  return -1.0 + 2.0 * fract(vec3(p3.x + p3.y, p3.x + p3.z, p3.y + p3.z) * p3.zyx);\r
}\r
\r
float snoise3(vec3 p) {\r
  const float K1 = 0.333333333;\r
  const float K2 = 0.166666667;\r
  vec3 i = floor(p + (p.x + p.y + p.z) * K1);\r
  vec3 d0 = p - (i - (i.x + i.y + i.z) * K2);\r
  vec3 e = step(vec3(0.0), d0 - d0.yzx);\r
  vec3 i1 = e * (1.0 - e.zxy);\r
  vec3 i2 = 1.0 - e.zxy * (1.0 - e);\r
  vec3 d1 = d0 - (i1 - K2);\r
  vec3 d2 = d0 - (i2 - K1);\r
  vec3 d3 = d0 - 0.5;\r
  vec4 h = max(0.6 - vec4(dot(d0, d0), dot(d1, d1), dot(d2, d2), dot(d3, d3)), 0.0);\r
  vec4 n = h * h * h * h * vec4(dot(d0, hash33(i)), dot(d1, hash33(i + i1)), dot(d2, hash33(i + i2)), dot(d3, hash33(i + 1.0)));\r
  return dot(vec4(31.316), n);\r
}\r
\r
float light1(float intensity, float attenuation, float dist) {\r
  return intensity / (1.0 + dist * attenuation);\r
}\r
\r
float light2(float intensity, float attenuation, float dist) {\r
  return intensity / (1.0 + dist * dist * attenuation);\r
}\r
\r
vec4 draw(vec2 uv) {\r
  float rawLen = length(uv);\r
  vec2 dir = rawLen > 0.0001 ? uv / rawLen : vec2(1.0, 0.0);\r
  float reachAmount = length(uReach);\r
  vec2 reachDir = reachAmount > 0.00001 ? uReach / reachAmount : vec2(1.0, 0.0);\r
  float facing = exp((dot(dir, reachDir) - 1.0) * 3.2);\r
  float len = max(rawLen - reachAmount * facing * smoothstep(0.25, 0.65, rawLen), 0.0);\r
  uv = dir * len;\r
  float ang = atan(dir.y, dir.x);\r
  float invLen = len > 0.0 ? 1.0 / len : 0.0;\r
  float near = facing * uNear;\r
  float bgLuminance = dot(uBackground, vec3(0.299, 0.587, 0.114));\r
\r
  float n0 = snoise3(vec3(uv * 0.65, uTime * 0.5)) * 0.5 + 0.5;\r
  float r0 = mix(0.8 - 0.04 * uWobble, 0.8 + 0.04 * uWobble, n0);\r
  float d0 = distance(uv, (r0 * invLen) * uv);\r
  float v0 = light1(1.0, 10.0 / uGlow, d0);\r
  v0 *= smoothstep(r0 * 1.05, r0, len);\r
  float reach = max(uBleed, 0.04);\r
  float innerFade = smoothstep(r0 * (1.0 - 0.2 * reach), r0 * (1.0 - 0.05 * reach), len);\r
  v0 *= mix(innerFade, 1.0, bgLuminance * 0.7 * min(uBleed, 1.0));\r
  float body = smoothstep(0.8 - 0.2 * reach, 0.8, len);\r
  float cl = cos(ang + uSwirl) * 0.5 + 0.5;\r
\r
  vec2 pos = vec2(cos(uOrbit), sin(uOrbit)) * r0;\r
  float d = distance(uv, pos);\r
  vec2 head = vec2(cos(uOrbit), sin(uOrbit));\r
  float lag = atan(head.x * dir.y - head.y * dir.x, dot(dir, head));\r
  float trail = uTrail > 0.0 ? smoothstep(0.0, 0.35, lag) * exp(-max(lag, 0.0) * 2.6 / uTrail) : 0.0;\r
  float v1 = (light2(1.5, 5.0, d) + trail * 0.6) * uHighlight;\r
  v1 *= light1(1.0, 50.0, d0);\r
  float band = v0 * smoothstep(1.0, mix(0.6, 1.0, n0 * 0.5), len) * body;\r
  float heat = pow(clamp(band / 0.82, 0.0, 1.0), 3.0);\r
  float bloom = light2(1.0, 160.0 / uGlow, max(len - r0, 0.0)) * smoothstep(0.4, 0.0, len - r0) * step(r0, len);\r
\r
  float v2 = smoothstep(1.0, mix(0.6, 1.0, n0 * 0.5), len);\r
  float v3 = body;\r
\r
  vec3 colBase = mix(uColor1, uColor2, cl);\r
  float fadeAmount = mix(1.0, 0.1, bgLuminance);\r
\r
  float echoD = abs(len - r0 - uEcho.x);\r
  float echo = light1(1.0, 60.0, echoD) * smoothstep(0.12, 0.0, echoD) * uEcho.y;\r
\r
  vec3 darkCol = mix(uColor3, colBase, v0);\r
  darkCol = (darkCol + v1) * v2 * v3 * (1.0 + uAwake + near * 0.35) + mix(colBase, vec3(1.0), 0.25) * heat * (0.28 + near * 0.3);\r
  darkCol = clamp(darkCol + colBase * (bloom * 0.1 + echo), 0.0, 1.0);\r
\r
  vec3 lightCol = (colBase + v1) * mix(1.0, v2 * v3, fadeAmount);\r
  lightCol = mix(uBackground, lightCol, clamp(v0 + echo, 0.0, 1.0));\r
  lightCol = mix(lightCol, colBase, clamp(v0, 0.0, 1.0) * clamp(near * 0.4 + uAwake, 0.0, 0.6));\r
  lightCol = clamp(mix(lightCol, vec3(1.0), clamp(v1 * 0.35, 0.0, 0.6)), 0.0, 1.0);\r
\r
  vec3 finalCol = mix(darkCol, lightCol, bgLuminance);\r
  float alpha = max(max(finalCol.r, finalCol.g), finalCol.b);\r
  return vec4(finalCol / (alpha + 1e-5), alpha);\r
}\r
\r
vec2 toPlane(vec2 p, out float hit) {\r
  float cx = cos(uTilt.x);\r
  float sx = sin(uTilt.x);\r
  float cy = cos(uTilt.y);\r
  float sy = sin(uTilt.y);\r
  vec3 ex = vec3(cy, 0.0, -sy);\r
  vec3 ey = vec3(sy * sx, cx, cy * sx);\r
  vec3 normal = vec3(sy * cx, -sx, cy * cx);\r
  vec3 origin = vec3(0.0, 0.0, \${FOCAL.toFixed(1)});\r
  vec3 ray = vec3(p, -\${FOCAL.toFixed(1)});\r
  float denom = dot(normal, ray);\r
  float t = -dot(normal, origin) / (abs(denom) > 0.00001 ? denom : -0.00001);\r
  hit = t > 0.0 ? 1.0 : 0.0;\r
  vec3 q = origin + ray * t;\r
  return vec2(dot(q, ex), dot(q, ey));\r
}\r
\r
void main() {\r
  vec2 uv = (gl_FragCoord.xy - uResolution * 0.5) / min(uResolution.x, uResolution.y) * 2.0;\r
  uv *= uScale;\r
  float hit = 1.0;\r
  if (abs(uTilt.x) + abs(uTilt.y) > 0.0001) uv = toPlane(uv, hit);\r
\r
  float s = sin(uRotation);\r
  float c = cos(uRotation);\r
  uv = vec2(c * uv.x - s * uv.y, s * uv.x + c * uv.y);\r
\r
  vec4 col = draw(uv);\r
  float dither = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;\r
  float alpha = clamp(col.a * hit * uReveal * uOpacity + dither, 0.0, 1.0);\r
  outColor = vec4(col.rgb * alpha * alpha, alpha);\r
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
const link = (gl: WebGL2RenderingContext): Program | null => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
  const program = gl.createProgram();\r
  if (!vertex || !fragment || !program) return null;\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
  gl.bindAttribLocation(program, 0, 'aPosition');\r
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
const Orb = ({\r
  colors = ['#9c43fe', '#4cc2e9', '#101499'],\r
  hue = 0,\r
  backgroundColor = '#000000',\r
  size = 1,\r
  glow = 1,\r
  bleed = 1,\r
  wobble = 1,\r
  highlight = 1,\r
  trail = 1,\r
  tiltX = 0,\r
  tiltY = 0,\r
  speed = 1,\r
  hoverIntensity = 1,\r
  rotateOnHover = true,\r
  forceHoverState = false,\r
  followCursor = true,\r
  clickPulse = true,\r
  intro = true,\r
  opacity = 1,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  style\r
}: OrbProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const palette: string[] = Array.isArray(colors) ? colors : [];\r
  const settings: Settings = {\r
    colors: [palette[0] ?? '#9c43fe', palette[1] ?? palette[0] ?? '#4cc2e9', palette[2] ?? '#101499'].map(String),\r
    hue,\r
    backgroundColor: String(backgroundColor),\r
    size: clamp(size, 0.1, 3),\r
    glow: clamp(glow, 0.1, 5),\r
    bleed: clamp(bleed, 0, 4),\r
    wobble: Math.max(0, wobble),\r
    highlight: Math.max(0, highlight),\r
    trail: Math.max(0, trail),\r
    tiltX: clamp(tiltX, -70, 70),\r
    tiltY: clamp(tiltY, -70, 70),\r
    speed,\r
    hoverIntensity: Math.max(0, hoverIntensity),\r
    rotateOnHover,\r
    forceHoverState,\r
    followCursor,\r
    clickPulse,\r
    intro,\r
    opacity: clamp(opacity, 0, 1),\r
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
      antialias: false,\r
      depth: false,\r
      stencil: false\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const program = link(gl);\r
    if (!program) return undefined;\r
    const u = program.uniforms;\r
\r
    const buffer = gl.createBuffer();\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const cache = new Map<string, number[]>();\r
    const parse = (value: string): number[] => {\r
      const cached = cache.get(value);\r
      if (cached) return cached;\r
      let rgb: number[] = [0, 0, 0];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#000000';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b, a] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = a ? [r / 255, g / 255, b / 255] : [0, 0, 0];\r
      }\r
      cache.set(value, rgb);\r
      return rgb;\r
    };\r
    const shiftHue = (rgb: number[], degrees: number): number[] => {\r
      if (!degrees) return rgb;\r
      const angle = (degrees * Math.PI) / 180;\r
      const cos = Math.cos(angle);\r
      const sin = Math.sin(angle);\r
      const [r, g, b] = rgb;\r
      const y = 0.299 * r + 0.587 * g + 0.114 * b;\r
      const i = 0.596 * r - 0.274 * g - 0.322 * b;\r
      const q = 0.211 * r - 0.523 * g + 0.312 * b;\r
      const ni = i * cos - q * sin;\r
      const nq = i * sin + q * cos;\r
      return [y + 0.956 * ni + 0.621 * nq, y - 0.272 * ni - 0.647 * nq, y - 1.106 * ni + 1.703 * nq];\r
    };\r
\r
    const view = { width: 1, height: 1 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const state = {\r
      time: 0,\r
      swirl: 0,\r
      orbit: 0,\r
      echo: 1,\r
      rotation: 0,\r
      hover: 0,\r
      near: 0,\r
      reachX: 0,\r
      reachY: 0,\r
      reachSpeedX: 0,\r
      reachSpeedY: 0,\r
      pulse: 0,\r
      pulseSpeed: 0,\r
      kick: settingsRef.current.intro && !reduce ? 2.5 : 0,\r
      reveal: settingsRef.current.intro && !reduce ? 0 : 1\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const toOrb = (x: number, y: number): [number, number] => {\r
      const s = settingsRef.current;\r
      const side = Math.min(view.width, view.height);\r
      const scale = 1 / (s.size * (1 + state.pulse));\r
      let ux = ((x - view.width / 2) / side) * 2 * scale;\r
      let uy = ((view.height / 2 - y) / side) * 2 * scale;\r
      if (s.tiltX || s.tiltY) {\r
        const ax = (-s.tiltX * Math.PI) / 180;\r
        const ay = (s.tiltY * Math.PI) / 180;\r
        const [cx, sx, cy, sy] = [Math.cos(ax), Math.sin(ax), Math.cos(ay), Math.sin(ay)];\r
        const normal = [sy * cx, -sx, cy * cx];\r
        const ray = [ux, uy, -FOCAL];\r
        const denom = normal[0] * ray[0] + normal[1] * ray[1] + normal[2] * ray[2];\r
        const t = -(normal[2] * FOCAL) / (Math.abs(denom) > 0.00001 ? denom : -0.00001);\r
        if (t <= 0) return [99, 99];\r
        const q = [ray[0] * t, ray[1] * t, FOCAL + ray[2] * t];\r
        ux = q[0] * cy - q[2] * sy;\r
        uy = q[0] * sy * sx + q[1] * cx + q[2] * cy * sx;\r
      }\r
      const sin = Math.sin(state.rotation);\r
      const cos = Math.cos(state.rotation);\r
      return [cos * ux - sin * uy, sin * ux + cos * uy];\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const [c1, c2, c3] = s.colors.map(value => shiftHue(parse(value), s.hue));\r
      const reveal = state.reveal;\r
      const back = reveal - 1;\r
      const grow = 1 + 2.2 * back * back * back + 1.2 * back * back;\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(program.program);\r
      gl.bindVertexArray(vao);\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(u.uTime, state.time);\r
      gl.uniform2f(u.uReach, state.reachX, state.reachY);\r
      gl.uniform1f(u.uNear, state.near);\r
      gl.uniform1f(u.uAwake, state.hover * s.hoverIntensity * 0.18);\r
      gl.uniform1f(u.uRotation, state.rotation);\r
      gl.uniform3fv(u.uBackground, parse(s.backgroundColor));\r
      gl.uniform3fv(u.uColor1, c1);\r
      gl.uniform3fv(u.uColor2, c2);\r
      gl.uniform3fv(u.uColor3, c3);\r
      gl.uniform1f(u.uScale, 1 / (s.size * (1 + state.pulse) * (0.62 + 0.38 * grow)));\r
      gl.uniform1f(u.uWobble, s.wobble);\r
      gl.uniform1f(u.uGlow, s.glow);\r
      gl.uniform1f(u.uBleed, s.bleed);\r
      gl.uniform1f(u.uHighlight, s.highlight);\r
      gl.uniform2f(u.uEcho, state.echo * 0.55, state.echo < 1 ? (1 - state.echo) * (1 - state.echo) : 0);\r
      gl.uniform1f(u.uSwirl, state.swirl);\r
      gl.uniform1f(u.uOrbit, state.orbit);\r
      gl.uniform1f(\r
        u.uReveal,\r
        Math.min(1, reveal / 0.55) * Math.min(1, reveal / 0.55) * (3 - 2 * Math.min(1, reveal / 0.55))\r
      );\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.uniform1f(u.uTrail, s.trail);\r
      gl.uniform2f(u.uTilt, (-s.tiltX * Math.PI) / 180, (s.tiltY * Math.PI) / 180);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.0005, 0.05) : 1 / 60;\r
      last = now;\r
      if (s.paused) {\r
        state.reveal = 1;\r
        render();\r
        last = 0;\r
        return;\r
      }\r
      const motion = reduce ? 0 : 1;\r
      const [px, py] = toOrb(pointer.x, pointer.y);\r
      const distance = Math.hypot(px, py);\r
      const region = pointer.inside && motion ? clamp((1.45 - distance) / 0.4, 0, 1) : 0;\r
      const zone = region * region * (3 - 2 * region);\r
      const aimed = zone * clamp((distance - 0.15) / 0.45, 0, 1);\r
      const near = zone > 0.5;\r
      const target = s.forceHoverState ? 1 : zone;\r
      state.hover += (target - state.hover) * (1 - Math.exp(-dt / 0.16));\r
      const reach = 0.075 * s.hoverIntensity * aimed;\r
      const goalX = distance > 0.0001 ? (px / distance) * reach : 0;\r
      const goalY = distance > 0.0001 ? (py / distance) * reach : 0;\r
      state.reachSpeedX += (70 * (goalX - state.reachX) - 7 * state.reachSpeedX) * dt;\r
      state.reachSpeedY += (70 * (goalY - state.reachY) - 7 * state.reachSpeedY) * dt;\r
      state.reachX += state.reachSpeedX * dt;\r
      state.reachY += state.reachSpeedY * dt;\r
      state.near += (aimed * s.hoverIntensity - state.near) * (1 - Math.exp(-dt / 0.12));\r
\r
      const step = dt * s.speed * motion;\r
      state.time += step;\r
      state.swirl += step * 2 * (1 + state.kick);\r
      state.echo = Math.min(1, state.echo + dt / 1.2);\r
      if (s.rotateOnHover) state.rotation += dt * 0.3 * state.hover * motion;\r
\r
      const aim = Math.atan2(py, px);\r
      if (s.followCursor && near && motion) {\r
        const delta = Math.atan2(Math.sin(aim - state.orbit), Math.cos(aim - state.orbit));\r
        state.orbit += delta * (1 - Math.exp(-dt * 6));\r
      } else {\r
        state.orbit -= step;\r
      }\r
      state.orbit = Math.atan2(Math.sin(state.orbit), Math.cos(state.orbit));\r
\r
      state.pulseSpeed += (-170 * state.pulse - 11 * state.pulseSpeed) * dt;\r
      state.pulse += state.pulseSpeed * dt;\r
      state.kick *= Math.exp(-dt * 2.5);\r
\r
      if (!s.intro || reduce) state.reveal = 1;\r
      else if (state.reveal < 1) state.reveal = Math.min(1, state.reveal + dt / INTRO_SECONDS);\r
\r
      render();\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      view.width = width;\r
      view.height = height;\r
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      render();\r
      wake();\r
    };\r
\r
    const locate = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      pointer.x = event.clientX - rect.left;\r
      pointer.y = event.clientY - rect.top;\r
      pointer.inside = pointer.x >= 0 && pointer.y >= 0 && pointer.x <= rect.width && pointer.y <= rect.height;\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      locate(event);\r
      if (!settingsRef.current.paused) wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      locate(event);\r
      if (!pointer.inside || !s.clickPulse || s.paused || reduce) return;\r
      const [px, py] = toOrb(pointer.x, pointer.y);\r
      if (Math.hypot(px, py) > 1) return;\r
      state.pulseSpeed += 0.9;\r
      state.kick = 2.2;\r
      state.echo = 0;\r
      wake();\r
    };\r
\r
    const onPointerUp = (event: PointerEvent) => {\r
      if (event.pointerType !== 'mouse') pointer.inside = false;\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
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
    window.addEventListener('pointerup', onPointerUp, { passive: true });\r
    window.addEventListener('pointercancel', onPointerUp, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
\r
    let lastDpr = settingsRef.current.dpr;\r
    wakeRef.current = () => {\r
      const s = settingsRef.current;\r
      if (s.dpr !== lastDpr) {\r
        lastDpr = s.dpr;\r
        resize();\r
        return;\r
      }\r
      if (!raf) render();\r
      wake();\r
    };\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('pointerup', onPointerUp);\r
      window.removeEventListener('pointercancel', onPointerUp);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteProgram(program.program);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div ref={containerRef} className={\`orb-container\${className ? \` \${className}\` : ''}\`} style={style}>\r
      <canvas ref={canvasRef} className="orb-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Orb;\r
`,o=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties } from 'react';\r
\r
export interface OrbProps {\r
  colors?: string[];\r
  hue?: number;\r
  backgroundColor?: string;\r
  size?: number;\r
  glow?: number;\r
  bleed?: number;\r
  wobble?: number;\r
  highlight?: number;\r
  trail?: number;\r
  tiltX?: number;\r
  tiltY?: number;\r
  speed?: number;\r
  hoverIntensity?: number;\r
  rotateOnHover?: boolean;\r
  forceHoverState?: boolean;\r
  followCursor?: boolean;\r
  clickPulse?: boolean;\r
  intro?: boolean;\r
  opacity?: number;\r
  paused?: boolean;\r
  dpr?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
type Settings = {\r
  colors: string[];\r
  hue: number;\r
  backgroundColor: string;\r
  size: number;\r
  glow: number;\r
  bleed: number;\r
  wobble: number;\r
  highlight: number;\r
  trail: number;\r
  tiltX: number;\r
  tiltY: number;\r
  speed: number;\r
  hoverIntensity: number;\r
  rotateOnHover: boolean;\r
  forceHoverState: boolean;\r
  followCursor: boolean;\r
  clickPulse: boolean;\r
  intro: boolean;\r
  opacity: number;\r
  paused: boolean;\r
  dpr?: number;\r
};\r
\r
type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };\r
\r
const INTRO_SECONDS = 1.1;\r
const FOCAL = 3.2;\r
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
uniform float uRotation;\r
uniform vec2 uReach;\r
uniform float uNear;\r
uniform float uAwake;\r
uniform vec3 uBackground;\r
uniform vec3 uColor1;\r
uniform vec3 uColor2;\r
uniform vec3 uColor3;\r
uniform float uScale;\r
uniform float uWobble;\r
uniform float uGlow;\r
uniform float uBleed;\r
uniform float uHighlight;\r
uniform float uSwirl;\r
uniform float uOrbit;\r
uniform vec2 uEcho;\r
uniform float uReveal;\r
uniform float uOpacity;\r
uniform float uTrail;\r
uniform vec2 uTilt;\r
out vec4 outColor;\r
\r
vec3 hash33(vec3 p3) {\r
  p3 = fract(p3 * vec3(0.1031, 0.11369, 0.13787));\r
  p3 += dot(p3, p3.yxz + 19.19);\r
  return -1.0 + 2.0 * fract(vec3(p3.x + p3.y, p3.x + p3.z, p3.y + p3.z) * p3.zyx);\r
}\r
\r
float snoise3(vec3 p) {\r
  const float K1 = 0.333333333;\r
  const float K2 = 0.166666667;\r
  vec3 i = floor(p + (p.x + p.y + p.z) * K1);\r
  vec3 d0 = p - (i - (i.x + i.y + i.z) * K2);\r
  vec3 e = step(vec3(0.0), d0 - d0.yzx);\r
  vec3 i1 = e * (1.0 - e.zxy);\r
  vec3 i2 = 1.0 - e.zxy * (1.0 - e);\r
  vec3 d1 = d0 - (i1 - K2);\r
  vec3 d2 = d0 - (i2 - K1);\r
  vec3 d3 = d0 - 0.5;\r
  vec4 h = max(0.6 - vec4(dot(d0, d0), dot(d1, d1), dot(d2, d2), dot(d3, d3)), 0.0);\r
  vec4 n = h * h * h * h * vec4(dot(d0, hash33(i)), dot(d1, hash33(i + i1)), dot(d2, hash33(i + i2)), dot(d3, hash33(i + 1.0)));\r
  return dot(vec4(31.316), n);\r
}\r
\r
float light1(float intensity, float attenuation, float dist) {\r
  return intensity / (1.0 + dist * attenuation);\r
}\r
\r
float light2(float intensity, float attenuation, float dist) {\r
  return intensity / (1.0 + dist * dist * attenuation);\r
}\r
\r
vec4 draw(vec2 uv) {\r
  float rawLen = length(uv);\r
  vec2 dir = rawLen > 0.0001 ? uv / rawLen : vec2(1.0, 0.0);\r
  float reachAmount = length(uReach);\r
  vec2 reachDir = reachAmount > 0.00001 ? uReach / reachAmount : vec2(1.0, 0.0);\r
  float facing = exp((dot(dir, reachDir) - 1.0) * 3.2);\r
  float len = max(rawLen - reachAmount * facing * smoothstep(0.25, 0.65, rawLen), 0.0);\r
  uv = dir * len;\r
  float ang = atan(dir.y, dir.x);\r
  float invLen = len > 0.0 ? 1.0 / len : 0.0;\r
  float near = facing * uNear;\r
  float bgLuminance = dot(uBackground, vec3(0.299, 0.587, 0.114));\r
\r
  float n0 = snoise3(vec3(uv * 0.65, uTime * 0.5)) * 0.5 + 0.5;\r
  float r0 = mix(0.8 - 0.04 * uWobble, 0.8 + 0.04 * uWobble, n0);\r
  float d0 = distance(uv, (r0 * invLen) * uv);\r
  float v0 = light1(1.0, 10.0 / uGlow, d0);\r
  v0 *= smoothstep(r0 * 1.05, r0, len);\r
  float reach = max(uBleed, 0.04);\r
  float innerFade = smoothstep(r0 * (1.0 - 0.2 * reach), r0 * (1.0 - 0.05 * reach), len);\r
  v0 *= mix(innerFade, 1.0, bgLuminance * 0.7 * min(uBleed, 1.0));\r
  float body = smoothstep(0.8 - 0.2 * reach, 0.8, len);\r
  float cl = cos(ang + uSwirl) * 0.5 + 0.5;\r
\r
  vec2 pos = vec2(cos(uOrbit), sin(uOrbit)) * r0;\r
  float d = distance(uv, pos);\r
  vec2 head = vec2(cos(uOrbit), sin(uOrbit));\r
  float lag = atan(head.x * dir.y - head.y * dir.x, dot(dir, head));\r
  float trail = uTrail > 0.0 ? smoothstep(0.0, 0.35, lag) * exp(-max(lag, 0.0) * 2.6 / uTrail) : 0.0;\r
  float v1 = (light2(1.5, 5.0, d) + trail * 0.6) * uHighlight;\r
  v1 *= light1(1.0, 50.0, d0);\r
  float band = v0 * smoothstep(1.0, mix(0.6, 1.0, n0 * 0.5), len) * body;\r
  float heat = pow(clamp(band / 0.82, 0.0, 1.0), 3.0);\r
  float bloom = light2(1.0, 160.0 / uGlow, max(len - r0, 0.0)) * smoothstep(0.4, 0.0, len - r0) * step(r0, len);\r
\r
  float v2 = smoothstep(1.0, mix(0.6, 1.0, n0 * 0.5), len);\r
  float v3 = body;\r
\r
  vec3 colBase = mix(uColor1, uColor2, cl);\r
  float fadeAmount = mix(1.0, 0.1, bgLuminance);\r
\r
  float echoD = abs(len - r0 - uEcho.x);\r
  float echo = light1(1.0, 60.0, echoD) * smoothstep(0.12, 0.0, echoD) * uEcho.y;\r
\r
  vec3 darkCol = mix(uColor3, colBase, v0);\r
  darkCol = (darkCol + v1) * v2 * v3 * (1.0 + uAwake + near * 0.35) + mix(colBase, vec3(1.0), 0.25) * heat * (0.28 + near * 0.3);\r
  darkCol = clamp(darkCol + colBase * (bloom * 0.1 + echo), 0.0, 1.0);\r
\r
  vec3 lightCol = (colBase + v1) * mix(1.0, v2 * v3, fadeAmount);\r
  lightCol = mix(uBackground, lightCol, clamp(v0 + echo, 0.0, 1.0));\r
  lightCol = mix(lightCol, colBase, clamp(v0, 0.0, 1.0) * clamp(near * 0.4 + uAwake, 0.0, 0.6));\r
  lightCol = clamp(mix(lightCol, vec3(1.0), clamp(v1 * 0.35, 0.0, 0.6)), 0.0, 1.0);\r
\r
  vec3 finalCol = mix(darkCol, lightCol, bgLuminance);\r
  float alpha = max(max(finalCol.r, finalCol.g), finalCol.b);\r
  return vec4(finalCol / (alpha + 1e-5), alpha);\r
}\r
\r
vec2 toPlane(vec2 p, out float hit) {\r
  float cx = cos(uTilt.x);\r
  float sx = sin(uTilt.x);\r
  float cy = cos(uTilt.y);\r
  float sy = sin(uTilt.y);\r
  vec3 ex = vec3(cy, 0.0, -sy);\r
  vec3 ey = vec3(sy * sx, cx, cy * sx);\r
  vec3 normal = vec3(sy * cx, -sx, cy * cx);\r
  vec3 origin = vec3(0.0, 0.0, \${FOCAL.toFixed(1)});\r
  vec3 ray = vec3(p, -\${FOCAL.toFixed(1)});\r
  float denom = dot(normal, ray);\r
  float t = -dot(normal, origin) / (abs(denom) > 0.00001 ? denom : -0.00001);\r
  hit = t > 0.0 ? 1.0 : 0.0;\r
  vec3 q = origin + ray * t;\r
  return vec2(dot(q, ex), dot(q, ey));\r
}\r
\r
void main() {\r
  vec2 uv = (gl_FragCoord.xy - uResolution * 0.5) / min(uResolution.x, uResolution.y) * 2.0;\r
  uv *= uScale;\r
  float hit = 1.0;\r
  if (abs(uTilt.x) + abs(uTilt.y) > 0.0001) uv = toPlane(uv, hit);\r
\r
  float s = sin(uRotation);\r
  float c = cos(uRotation);\r
  uv = vec2(c * uv.x - s * uv.y, s * uv.x + c * uv.y);\r
\r
  vec4 col = draw(uv);\r
  float dither = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;\r
  float alpha = clamp(col.a * hit * uReveal * uOpacity + dither, 0.0, 1.0);\r
  outColor = vec4(col.rgb * alpha * alpha, alpha);\r
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
const link = (gl: WebGL2RenderingContext): Program | null => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
  const program = gl.createProgram();\r
  if (!vertex || !fragment || !program) return null;\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
  gl.bindAttribLocation(program, 0, 'aPosition');\r
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
const Orb = ({\r
  colors = ['#9c43fe', '#4cc2e9', '#101499'],\r
  hue = 0,\r
  backgroundColor = '#000000',\r
  size = 1,\r
  glow = 1,\r
  bleed = 1,\r
  wobble = 1,\r
  highlight = 1,\r
  trail = 1,\r
  tiltX = 0,\r
  tiltY = 0,\r
  speed = 1,\r
  hoverIntensity = 1,\r
  rotateOnHover = true,\r
  forceHoverState = false,\r
  followCursor = true,\r
  clickPulse = true,\r
  intro = true,\r
  opacity = 1,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  style\r
}: OrbProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const palette: string[] = Array.isArray(colors) ? colors : [];\r
  const settings: Settings = {\r
    colors: [palette[0] ?? '#9c43fe', palette[1] ?? palette[0] ?? '#4cc2e9', palette[2] ?? '#101499'].map(String),\r
    hue,\r
    backgroundColor: String(backgroundColor),\r
    size: clamp(size, 0.1, 3),\r
    glow: clamp(glow, 0.1, 5),\r
    bleed: clamp(bleed, 0, 4),\r
    wobble: Math.max(0, wobble),\r
    highlight: Math.max(0, highlight),\r
    trail: Math.max(0, trail),\r
    tiltX: clamp(tiltX, -70, 70),\r
    tiltY: clamp(tiltY, -70, 70),\r
    speed,\r
    hoverIntensity: Math.max(0, hoverIntensity),\r
    rotateOnHover,\r
    forceHoverState,\r
    followCursor,\r
    clickPulse,\r
    intro,\r
    opacity: clamp(opacity, 0, 1),\r
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
      antialias: false,\r
      depth: false,\r
      stencil: false\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const program = link(gl);\r
    if (!program) return undefined;\r
    const u = program.uniforms;\r
\r
    const buffer = gl.createBuffer();\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const cache = new Map<string, number[]>();\r
    const parse = (value: string): number[] => {\r
      const cached = cache.get(value);\r
      if (cached) return cached;\r
      let rgb: number[] = [0, 0, 0];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#000000';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b, a] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = a ? [r / 255, g / 255, b / 255] : [0, 0, 0];\r
      }\r
      cache.set(value, rgb);\r
      return rgb;\r
    };\r
    const shiftHue = (rgb: number[], degrees: number): number[] => {\r
      if (!degrees) return rgb;\r
      const angle = (degrees * Math.PI) / 180;\r
      const cos = Math.cos(angle);\r
      const sin = Math.sin(angle);\r
      const [r, g, b] = rgb;\r
      const y = 0.299 * r + 0.587 * g + 0.114 * b;\r
      const i = 0.596 * r - 0.274 * g - 0.322 * b;\r
      const q = 0.211 * r - 0.523 * g + 0.312 * b;\r
      const ni = i * cos - q * sin;\r
      const nq = i * sin + q * cos;\r
      return [y + 0.956 * ni + 0.621 * nq, y - 0.272 * ni - 0.647 * nq, y - 1.106 * ni + 1.703 * nq];\r
    };\r
\r
    const view = { width: 1, height: 1 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const state = {\r
      time: 0,\r
      swirl: 0,\r
      orbit: 0,\r
      echo: 1,\r
      rotation: 0,\r
      hover: 0,\r
      near: 0,\r
      reachX: 0,\r
      reachY: 0,\r
      reachSpeedX: 0,\r
      reachSpeedY: 0,\r
      pulse: 0,\r
      pulseSpeed: 0,\r
      kick: settingsRef.current.intro && !reduce ? 2.5 : 0,\r
      reveal: settingsRef.current.intro && !reduce ? 0 : 1\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const toOrb = (x: number, y: number): [number, number] => {\r
      const s = settingsRef.current;\r
      const side = Math.min(view.width, view.height);\r
      const scale = 1 / (s.size * (1 + state.pulse));\r
      let ux = ((x - view.width / 2) / side) * 2 * scale;\r
      let uy = ((view.height / 2 - y) / side) * 2 * scale;\r
      if (s.tiltX || s.tiltY) {\r
        const ax = (-s.tiltX * Math.PI) / 180;\r
        const ay = (s.tiltY * Math.PI) / 180;\r
        const [cx, sx, cy, sy] = [Math.cos(ax), Math.sin(ax), Math.cos(ay), Math.sin(ay)];\r
        const normal = [sy * cx, -sx, cy * cx];\r
        const ray = [ux, uy, -FOCAL];\r
        const denom = normal[0] * ray[0] + normal[1] * ray[1] + normal[2] * ray[2];\r
        const t = -(normal[2] * FOCAL) / (Math.abs(denom) > 0.00001 ? denom : -0.00001);\r
        if (t <= 0) return [99, 99];\r
        const q = [ray[0] * t, ray[1] * t, FOCAL + ray[2] * t];\r
        ux = q[0] * cy - q[2] * sy;\r
        uy = q[0] * sy * sx + q[1] * cx + q[2] * cy * sx;\r
      }\r
      const sin = Math.sin(state.rotation);\r
      const cos = Math.cos(state.rotation);\r
      return [cos * ux - sin * uy, sin * ux + cos * uy];\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const [c1, c2, c3] = s.colors.map(value => shiftHue(parse(value), s.hue));\r
      const reveal = state.reveal;\r
      const back = reveal - 1;\r
      const grow = 1 + 2.2 * back * back * back + 1.2 * back * back;\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(program.program);\r
      gl.bindVertexArray(vao);\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(u.uTime, state.time);\r
      gl.uniform2f(u.uReach, state.reachX, state.reachY);\r
      gl.uniform1f(u.uNear, state.near);\r
      gl.uniform1f(u.uAwake, state.hover * s.hoverIntensity * 0.18);\r
      gl.uniform1f(u.uRotation, state.rotation);\r
      gl.uniform3fv(u.uBackground, parse(s.backgroundColor));\r
      gl.uniform3fv(u.uColor1, c1);\r
      gl.uniform3fv(u.uColor2, c2);\r
      gl.uniform3fv(u.uColor3, c3);\r
      gl.uniform1f(u.uScale, 1 / (s.size * (1 + state.pulse) * (0.62 + 0.38 * grow)));\r
      gl.uniform1f(u.uWobble, s.wobble);\r
      gl.uniform1f(u.uGlow, s.glow);\r
      gl.uniform1f(u.uBleed, s.bleed);\r
      gl.uniform1f(u.uHighlight, s.highlight);\r
      gl.uniform2f(u.uEcho, state.echo * 0.55, state.echo < 1 ? (1 - state.echo) * (1 - state.echo) : 0);\r
      gl.uniform1f(u.uSwirl, state.swirl);\r
      gl.uniform1f(u.uOrbit, state.orbit);\r
      gl.uniform1f(\r
        u.uReveal,\r
        Math.min(1, reveal / 0.55) * Math.min(1, reveal / 0.55) * (3 - 2 * Math.min(1, reveal / 0.55))\r
      );\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.uniform1f(u.uTrail, s.trail);\r
      gl.uniform2f(u.uTilt, (-s.tiltX * Math.PI) / 180, (s.tiltY * Math.PI) / 180);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.0005, 0.05) : 1 / 60;\r
      last = now;\r
      if (s.paused) {\r
        state.reveal = 1;\r
        render();\r
        last = 0;\r
        return;\r
      }\r
      const motion = reduce ? 0 : 1;\r
      const [px, py] = toOrb(pointer.x, pointer.y);\r
      const distance = Math.hypot(px, py);\r
      const region = pointer.inside && motion ? clamp((1.45 - distance) / 0.4, 0, 1) : 0;\r
      const zone = region * region * (3 - 2 * region);\r
      const aimed = zone * clamp((distance - 0.15) / 0.45, 0, 1);\r
      const near = zone > 0.5;\r
      const target = s.forceHoverState ? 1 : zone;\r
      state.hover += (target - state.hover) * (1 - Math.exp(-dt / 0.16));\r
      const reach = 0.075 * s.hoverIntensity * aimed;\r
      const goalX = distance > 0.0001 ? (px / distance) * reach : 0;\r
      const goalY = distance > 0.0001 ? (py / distance) * reach : 0;\r
      state.reachSpeedX += (70 * (goalX - state.reachX) - 7 * state.reachSpeedX) * dt;\r
      state.reachSpeedY += (70 * (goalY - state.reachY) - 7 * state.reachSpeedY) * dt;\r
      state.reachX += state.reachSpeedX * dt;\r
      state.reachY += state.reachSpeedY * dt;\r
      state.near += (aimed * s.hoverIntensity - state.near) * (1 - Math.exp(-dt / 0.12));\r
\r
      const step = dt * s.speed * motion;\r
      state.time += step;\r
      state.swirl += step * 2 * (1 + state.kick);\r
      state.echo = Math.min(1, state.echo + dt / 1.2);\r
      if (s.rotateOnHover) state.rotation += dt * 0.3 * state.hover * motion;\r
\r
      const aim = Math.atan2(py, px);\r
      if (s.followCursor && near && motion) {\r
        const delta = Math.atan2(Math.sin(aim - state.orbit), Math.cos(aim - state.orbit));\r
        state.orbit += delta * (1 - Math.exp(-dt * 6));\r
      } else {\r
        state.orbit -= step;\r
      }\r
      state.orbit = Math.atan2(Math.sin(state.orbit), Math.cos(state.orbit));\r
\r
      state.pulseSpeed += (-170 * state.pulse - 11 * state.pulseSpeed) * dt;\r
      state.pulse += state.pulseSpeed * dt;\r
      state.kick *= Math.exp(-dt * 2.5);\r
\r
      if (!s.intro || reduce) state.reveal = 1;\r
      else if (state.reveal < 1) state.reveal = Math.min(1, state.reveal + dt / INTRO_SECONDS);\r
\r
      render();\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      view.width = width;\r
      view.height = height;\r
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      render();\r
      wake();\r
    };\r
\r
    const locate = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      pointer.x = event.clientX - rect.left;\r
      pointer.y = event.clientY - rect.top;\r
      pointer.inside = pointer.x >= 0 && pointer.y >= 0 && pointer.x <= rect.width && pointer.y <= rect.height;\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      locate(event);\r
      if (!settingsRef.current.paused) wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      locate(event);\r
      if (!pointer.inside || !s.clickPulse || s.paused || reduce) return;\r
      const [px, py] = toOrb(pointer.x, pointer.y);\r
      if (Math.hypot(px, py) > 1) return;\r
      state.pulseSpeed += 0.9;\r
      state.kick = 2.2;\r
      state.echo = 0;\r
      wake();\r
    };\r
\r
    const onPointerUp = (event: PointerEvent) => {\r
      if (event.pointerType !== 'mouse') pointer.inside = false;\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
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
    window.addEventListener('pointerup', onPointerUp, { passive: true });\r
    window.addEventListener('pointercancel', onPointerUp, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
\r
    let lastDpr = settingsRef.current.dpr;\r
    wakeRef.current = () => {\r
      const s = settingsRef.current;\r
      if (s.dpr !== lastDpr) {\r
        lastDpr = s.dpr;\r
        resize();\r
        return;\r
      }\r
      if (!raf) render();\r
      wake();\r
    };\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('pointerup', onPointerUp);\r
      window.removeEventListener('pointercancel', onPointerUp);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteProgram(program.program);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
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
      className={['relative z-0 h-full w-full overflow-hidden', className].filter(Boolean).join(' ')}\r
      style={style}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Orb;\r
`,a={usage:`import Orb from './Orb';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <Orb
    colors={['#9c43fe', '#4cc2e9', '#101499']}
    hoverIntensity={1}
    trail={1}
    rotateOnHover
    followCursor
  />
</div>`,code:r,css:n,tailwind:e,tsCode:t,tsTailwind:o};export{a as orb};
