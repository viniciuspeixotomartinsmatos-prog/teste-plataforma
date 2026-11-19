const r=`'use client';\r
\r
import { useEffect, useRef, useState } from 'react';\r
\r
import './Lightfall.css';\r
\r
const MAX_COLORS = 8;\r
const BLOOM_LEVELS = 4;\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const STREAKS = \`#version 300 es\r
precision highp float;\r
uniform vec2 uView;\r
uniform float uZoom;\r
uniform float uPhase;\r
uniform float uTwinkleClock;\r
uniform float uRings;\r
uniform vec3 uColors[8];\r
uniform int uColorCount;\r
uniform int uStreakCount;\r
uniform int uColumns;\r
uniform float uWidth;\r
uniform float uTail;\r
uniform float uTwinkle;\r
uniform float uHead;\r
uniform float uDepth;\r
uniform vec4 uMouse;\r
uniform vec3 uLens;\r
uniform float uLightMode;\r
uniform float uEncode;\r
out vec4 outColor;\r
\r
const vec3 CAMERA = vec3(0.0, -0.8888889, -0.2222222);\r
const float TAU = 6.28318530718;\r
const float SPACING = 0.005;\r
const float REACH = 0.32;\r
\r
uint scramble(uint x) {\r
  x ^= x >> 16;\r
  x *= 0x7feb352du;\r
  x ^= x >> 15;\r
  x *= 0x846ca68bu;\r
  x ^= x >> 16;\r
  return x;\r
}\r
\r
float unit(uint x) {\r
  return float(x & 0xffffu) / 65535.0;\r
}\r
\r
float stroke(float d, float w) {\r
  float s = max(0.75 * w, 0.55);\r
  return 0.75 * w / s * exp(-0.5 * d * d / (s * s));\r
}\r
\r
float orb(float d, float r) {\r
  float s = max(0.6 * r, 0.7);\r
  float e = 0.6 * r / s;\r
  return e * e * exp(-0.5 * d * d / (s * s));\r
}\r
\r
void main() {\r
  vec2 frag = gl_FragCoord.xy;\r
  vec2 screen = (2.0 * frag - uView) / uView.x;\r
  vec2 p = screen;\r
  mat2 warp = mat2(1.0);\r
  if (uLens.z > 0.0) {\r
    vec2 o = p - uLens.xy;\r
    float e = uLens.z * exp(-dot(o, o) / (REACH * REACH));\r
    p -= o * e;\r
    warp = mat2(1.0 - e) + outerProduct(o, o) * (2.0 * e / (REACH * REACH));\r
  }\r
\r
  vec3 dir = vec3(p, uZoom);\r
  vec3 exits = (1.0 - CAMERA * sign(dir)) / max(abs(dir), vec3(1e-6));\r
  float u = min(exits.x, min(exits.y, exits.z));\r
  for (int i = 0; i < 5; i++) {\r
    vec3 h = CAMERA + u * dir;\r
    vec3 h2 = h * h;\r
    u -= (dot(h2, h2) - 1.0) / (4.0 * dot(dir, h2 * h));\r
  }\r
  vec3 hit = CAMERA + u * dir;\r
  vec3 normal = hit * hit * hit;\r
  float facing = dot(normal, dir);\r
  vec3 stepX = u * (vec3(1.0, 0.0, 0.0) - dir * (normal.x / facing));\r
  vec3 stepY = u * (vec3(0.0, 1.0, 0.0) - dir * (normal.y / facing));\r
  float ring = hit.y * hit.y + hit.z * hit.z;\r
  float theta = atan(hit.z, hit.y);\r
  mat2 jacobian = mat2(\r
    stepX.x,\r
    (hit.y * stepX.z - hit.z * stepX.y) / ring,\r
    stepY.x,\r
    (hit.y * stepY.z - hit.z * stepY.y) / ring\r
  ) * warp * (2.0 / uView.x);\r
\r
  vec2 gradX = vec2(jacobian[0][0], jacobian[1][0]);\r
  vec2 gradTheta = vec2(jacobian[0][1], jacobian[1][1]);\r
  float scale = max(length(gradX), 1e-8);\r
  float det = max(abs(gradX.x * gradTheta.y - gradX.y * gradTheta.x), 1e-12);\r
  float along = scale / det;\r
  float skew = dot(gradX, gradTheta) / det;\r
  float spacing = SPACING / scale;\r
  float detail = smoothstep(1.6, 3.2, spacing);\r
  if (detail <= 0.0) {\r
    outColor = vec4(0.0, 0.0, 0.0, 1.0);\r
    return;\r
  }\r
  float halfWidth = min(uWidth / scale, 0.2 * spacing);\r
  float headRadius = min(2.0 * uWidth / scale, 0.35 * spacing);\r
  float headReach = 4.0 * max(0.6 * headRadius, 0.7);\r
  float edge = uColumns > 1 ? 1.0 : 0.5;\r
  float period = TAU / uRings;\r
  float fog = exp(-max(u * length(dir) - 0.6, 0.0) * 1.6 * uDepth);\r
\r
  float boost = 1.0;\r
  if (uMouse.z > 0.0) {\r
    vec2 m = screen - uMouse.xy;\r
    boost += 2.0 * uMouse.z * exp(-dot(m, m) / max(uMouse.w * uMouse.w, 1e-4));\r
  }\r
\r
  int count = max(uColorCount, 1);\r
  vec3 total = vec3(0.0);\r
  for (int layer = 0; layer < 16; layer++) {\r
    if (layer >= uStreakCount) break;\r
    float x = hit.x + float(layer) * SPACING / 8.0;\r
    float nearest = floor(x / SPACING + 0.5);\r
    float side = x >= nearest * SPACING ? 1.0 : -1.0;\r
    for (int k = 0; k < 2; k++) {\r
      if (k >= uColumns) break;\r
      float column = nearest + side * float(k);\r
      float across = (x - column * SPACING) / scale;\r
      uint seed = scramble(uint(int(column) + 65536) + uint(layer) * 0x9e3779b9u);\r
      uint next = scramble(seed);\r
      float hue = unit(seed >> 16);\r
      float delta = theta - uPhase * (1.0 + floor(unit(seed) * 16.0) / 16.0) - unit(next) * period;\r
      delta -= period * floor(delta / period + 0.5);\r
      float ahead = delta * along - across * skew;\r
      if (abs(ahead) > headReach && (delta > 0.0 || -delta * uTail > 3.2)) continue;\r
      float behind = max(-delta, 0.0);\r
      float fall = exp(-uTail * behind) * (1.0 - smoothstep(0.5, 0.95, behind / (0.5 * period)));\r
      fall *= 1.0 - smoothstep(1.2, 3.2, uTail * behind);\r
      float reach = length(vec2(across, ahead));\r
      float trail = stroke(ahead > 0.0 ? reach : abs(across), halfWidth * mix(0.4, 1.0, fall)) * fall;\r
      float glint = orb(reach, headRadius) * mix(3.0, 1.8, uLightMode);\r
      float weight = mix(1.5, 1.0 + sin(uTwinkleClock + 7.0 * hue + 4.0), uTwinkle);\r
      weight *= 1.0 - smoothstep(0.72 * edge, edge, abs(across) / spacing);\r
      vec3 color = uColors[min(int(hue * float(count)), count - 1)];\r
      vec3 hot = mix(color, vec3(1.0), uHead * (1.0 - uLightMode));\r
      total += (trail * color + glint * hot) * weight;\r
    }\r
  }\r
\r
  outColor = vec4(total * fog * boost * detail * uEncode, 1.0);\r
}\`;\r
\r
const DOWNSAMPLE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uSource;\r
uniform vec2 uTarget;\r
uniform vec2 uTexel;\r
uniform float uLimit;\r
out vec4 outColor;\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uTarget;\r
  vec3 color = texture(uSource, uv - uTexel).rgb;\r
  color += texture(uSource, uv + uTexel).rgb;\r
  color += texture(uSource, uv + vec2(uTexel.x, -uTexel.y)).rgb;\r
  color += texture(uSource, uv + vec2(-uTexel.x, uTexel.y)).rgb;\r
  outColor = vec4(min(color * 0.25, vec3(uLimit)), 1.0);\r
}\`;\r
\r
const BLUR = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uSource;\r
uniform vec2 uTarget;\r
uniform vec2 uStep;\r
out vec4 outColor;\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uTarget;\r
  vec3 color = texture(uSource, uv).rgb * 0.181862;\r
  color += (texture(uSource, uv + uStep * 1.423135).rgb + texture(uSource, uv - uStep * 1.423135).rgb) * 0.284316;\r
  color += (texture(uSource, uv + uStep * 3.326702).rgb + texture(uSource, uv - uStep * 3.326702).rgb) * 0.106598;\r
  color += (texture(uSource, uv + uStep * 5.242989).rgb + texture(uSource, uv - uStep * 5.242989).rgb) * 0.018156;\r
  outColor = vec4(color, 1.0);\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uScene;\r
uniform sampler2D uBloom0;\r
uniform sampler2D uBloom1;\r
uniform sampler2D uBloom2;\r
uniform sampler2D uBloom3;\r
uniform vec2 uView;\r
uniform float uDecode;\r
uniform float uGlow;\r
uniform float uBloom;\r
uniform float uPresence;\r
uniform float uOpacity;\r
uniform float uFade;\r
uniform float uLightMode;\r
uniform vec3 uTopColor;\r
uniform float uTopGlow;\r
out vec4 outColor;\r
\r
float smootherstep01(float t) {\r
  t = clamp(t, 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uView;\r
  vec3 light = texelFetch(uScene, ivec2(gl_FragCoord.xy), 0).rgb;\r
  if (uBloom > 0.0) {\r
    vec3 halo = texture(uBloom0, uv).rgb * 0.42;\r
    halo += texture(uBloom1, uv).rgb * 0.3;\r
    halo += texture(uBloom2, uv).rgb * 0.18;\r
    halo += texture(uBloom3, uv).rgb * 0.1;\r
    light += halo * uBloom * (uLightMode > 0.5 ? 0.2 : 1.0);\r
  }\r
  light *= uDecode * uGlow * uPresence;\r
\r
  if (uLightMode < 0.5 && uTopGlow > 0.0) {\r
    float aspect = uView.x / uView.y;\r
    vec2 q = vec2((uv.x - 0.5) * aspect, 1.04 - uv.y);\r
    float spread = 0.34 * max(aspect, 0.75);\r
    float core = exp(-q.x * q.x / (spread * spread) - q.y * q.y / 0.06);\r
    float halo = exp(-q.x * q.x / (3.6 * spread * spread) - q.y * q.y / 0.18);\r
    light += uTopColor * uTopGlow * (core * 0.85 + halo * 0.3) * uPresence;\r
  }\r
\r
  vec3 lit = max(light, 0.0);\r
  vec3 mapped = sqrt(1.0 - exp(-1.3 * lit * lit / (lit + 0.025)));\r
  float peak = max(mapped.r, max(mapped.g, mapped.b));\r
\r
  float mask = uOpacity;\r
  float edge = uFade * 0.5;\r
  if (edge > 0.0) {\r
    mask *= smootherstep01(uv.x / edge) * smootherstep01((1.0 - uv.x) / edge);\r
    mask *= smootherstep01(uv.y / edge) * smootherstep01((1.0 - uv.y) / edge);\r
  }\r
  float grain = (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;\r
\r
  if (uLightMode > 0.5) {\r
    float coverage = clamp(smoothstep(0.0, 0.5, peak) * mask * 0.94 + grain, 0.0, 1.0);\r
    vec3 chroma = sqrt(clamp(lit / max(max(lit.r, max(lit.g, lit.b)), 1e-6), 0.0, 1.0));\r
    chroma = pow(chroma, vec3(1.35));\r
    chroma /= max(max(chroma.r, max(chroma.g, chroma.b)), 1e-4);\r
    float saturation = 1.0 - min(chroma.r, min(chroma.g, chroma.b));\r
    chroma = mix(vec3(0.3), chroma, smoothstep(0.08, 0.35, saturation));\r
    outColor = vec4(chroma * coverage, coverage);\r
  } else {\r
    vec3 color = clamp(mapped + grain, 0.0, 1.0) * mask;\r
    outColor = vec4(color, max(color.r, max(color.g, color.b)));\r
  }\r
}\`;\r
\r
const INTRO_SECONDS = 2.6;\r
const WARP_SPEED = 9;\r
const TAU = Math.PI * 2;\r
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
    if (info) uniforms[info.name.replace(/\\[0\\]$/, '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const Lightfall = ({\r
  colors = ['#ffffff'],\r
  backgroundColor = '#94a3b8',\r
  speed = 0.3,\r
  streakCount = 2,\r
  streakWidth = 0.8,\r
  streakLength = 1,\r
  glow = 1,\r
  density = 0.6,\r
  twinkle = 0.3,\r
  zoom = 3,\r
  backgroundGlow = 0.1,\r
  headGlow = 0.6,\r
  depth = 0.5,\r
  bloom = 0.35,\r
  opacity = 1,\r
  mouseInteraction = true,\r
  mouseStrength = 0.4,\r
  mouseRadius = 0.45,\r
  mouseDampening = 0.15,\r
  lens = 0.5,\r
  holdToWarp = true,\r
  intro = true,\r
  fade = 0,\r
  lightMode = false,\r
  mixBlendMode,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settingsRef = useRef(null);\r
  const [generation, setGeneration] = useState(0);\r
  settingsRef.current = {\r
    colors: (Array.isArray(colors) && colors.length ? colors : ['#ffffff']).slice(0, MAX_COLORS).map(String),\r
    backgroundColor: String(backgroundColor),\r
    speed,\r
    streakCount: Math.round(clamp(streakCount, 1, 16)),\r
    streakWidth: Math.max(0.05, streakWidth),\r
    streakLength: Math.max(0.05, streakLength),\r
    glow: Math.max(0, glow),\r
    density,\r
    twinkle: clamp(twinkle, 0, 1),\r
    zoom: Math.max(0.1, zoom),\r
    backgroundGlow: Math.max(0, backgroundGlow),\r
    headGlow: clamp(headGlow, 0, 1),\r
    depth: Math.max(0, depth),\r
    bloom: Math.max(0, bloom),\r
    opacity: clamp(opacity, 0, 1),\r
    mouseInteraction,\r
    mouseStrength: Math.max(0, mouseStrength),\r
    mouseRadius: Math.max(0.01, mouseRadius),\r
    mouseDampening: Math.max(0, mouseDampening),\r
    lens: clamp(lens, 0, 1),\r
    holdToWarp,\r
    intro,\r
    fade: clamp(fade, 0, 1),\r
    lightMode,\r
    paused,\r
    dpr\r
  };\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    const gl = canvas?.getContext('webgl2', {\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false,\r
      powerPreference: 'high-performance'\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const floatTargets = !!gl.getExtension('EXT_color_buffer_float');\r
    const streakProgram = link(gl, STREAKS);\r
    const downProgram = link(gl, DOWNSAMPLE);\r
    const blurProgram = link(gl, BLUR);\r
    const compositeProgram = link(gl, COMPOSITE);\r
    if (!streakProgram || !downProgram || !blurProgram || !compositeProgram) return undefined;\r
\r
    const onContextLost = event => {\r
      event.preventDefault();\r
    };\r
    const onContextRestored = () => setGeneration(value => value + 1);\r
    canvas.addEventListener('webglcontextlost', onContextLost);\r
    canvas.addEventListener('webglcontextrestored', onContextRestored);\r
\r
    const buffer = gl.createBuffer();\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const format = floatTargets ? gl.RGBA16F : gl.RGBA8;\r
    const encode = floatTargets ? 1 : 0.25;\r
    const createTarget = () => ({ texture: null, framebuffer: gl.createFramebuffer(), width: 0, height: 0 });\r
    const scene = createTarget();\r
    const levels = Array.from({ length: BLOOM_LEVELS }, () => [createTarget(), createTarget()]);\r
\r
    const allocate = (target, width, height) => {\r
      if (target.texture && target.width === width && target.height === height) return;\r
      if (target.texture) gl.deleteTexture(target.texture);\r
      target.texture = gl.createTexture();\r
      target.width = width;\r
      target.height = height;\r
      gl.bindTexture(gl.TEXTURE_2D, target.texture);\r
      gl.texStorage2D(gl.TEXTURE_2D, 1, format, width, height);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target.texture, 0);\r
    };\r
\r
    const pass = (target, program) => {\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.framebuffer : null);\r
      gl.viewport(0, 0, target ? target.width : canvas.width, target ? target.height : canvas.height);\r
      gl.useProgram(program.program);\r
      return program.uniforms;\r
    };\r
\r
    const bind = (unit, texture) => {\r
      gl.activeTexture(gl.TEXTURE0 + unit);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
    };\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const colorCache = new Map();\r
    const toRgb = value => {\r
      if (colorCache.has(value)) return colorCache.get(value);\r
      let rgb = [1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#ffffff';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      colorCache.set(value, rgb);\r
      return rgb;\r
    };\r
    const toLinear = value => toRgb(value).map(channel => channel * channel);\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const palette = new Float32Array(MAX_COLORS * 3);\r
    const pointer = { x: 0, y: 0, inside: false, held: false };\r
    const state = {\r
      travel: 0,\r
      intro: settingsRef.current.intro && !reduce ? 0 : 1,\r
      mouseX: 0,\r
      mouseY: 0,\r
      lensX: 0,\r
      lensY: 0,\r
      touch: 0,\r
      warp: 0\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const width = canvas.width;\r
      const height = canvas.height;\r
      const cssWidth = Math.max(1, container.clientWidth);\r
      const cssHeight = Math.max(1, container.clientHeight);\r
      gl.bindVertexArray(vao);\r
      allocate(scene, width, height);\r
      levels.forEach((pair, index) => {\r
        const levelWidth = Math.max(1, Math.round(cssWidth / 2 ** (index + 1)));\r
        const levelHeight = Math.max(1, Math.round(cssHeight / 2 ** (index + 1)));\r
        allocate(pair[0], levelWidth, levelHeight);\r
        allocate(pair[1], levelWidth, levelHeight);\r
      });\r
\r
      const intro = state.intro;\r
      const presence = Math.min(1, intro * 2.2);\r
      const stretch = 1 + 5 * Math.pow(1 - intro, 2) + 2.5 * state.warp;\r
      const rings = Math.max(1, Math.floor(TAU * Math.max(s.density, 0.05) + 0.5));\r
      const period = TAU / rings;\r
      const clock = 9 + state.travel;\r
\r
      const list = s.colors.map(toLinear);\r
      palette.fill(0);\r
      for (let i = 0; i < MAX_COLORS; i++) palette.set(list[Math.min(i, list.length - 1)], i * 3);\r
\r
      const toScreenX = value => (2 * value - width) / width;\r
      const toScreenY = value => (2 * value - height) / width;\r
\r
      const r = pass(scene, streakProgram);\r
      gl.uniform2f(r.uView, width, height);\r
      gl.uniform1f(r.uZoom, s.zoom);\r
      gl.uniform1f(r.uPhase, clock % (16 * period));\r
      gl.uniform1f(r.uTwinkleClock, clock % TAU);\r
      gl.uniform1f(r.uRings, rings);\r
      gl.uniform3fv(r.uColors, palette);\r
      gl.uniform1i(r.uColorCount, list.length);\r
      gl.uniform1i(r.uStreakCount, s.streakCount);\r
      gl.uniform1i(r.uColumns, s.streakWidth > 1 ? 2 : 1);\r
      gl.uniform1f(r.uWidth, 5e-4 * s.streakWidth);\r
      gl.uniform1f(r.uTail, 19 / (s.streakLength * stretch));\r
      gl.uniform1f(r.uTwinkle, s.twinkle);\r
      gl.uniform1f(r.uHead, s.headGlow);\r
      gl.uniform1f(r.uDepth, s.depth);\r
      gl.uniform4f(\r
        r.uMouse,\r
        toScreenX(state.mouseX),\r
        toScreenY(state.mouseY),\r
        s.mouseInteraction ? s.mouseStrength * state.touch : 0,\r
        s.mouseRadius\r
      );\r
      gl.uniform3f(\r
        r.uLens,\r
        toScreenX(state.lensX),\r
        toScreenY(state.lensY),\r
        s.mouseInteraction ? 0.5 * s.lens * state.touch : 0\r
      );\r
      gl.uniform1f(r.uLightMode, s.lightMode ? 1 : 0);\r
      gl.uniform1f(r.uEncode, encode);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      if (s.bloom > 0) {\r
        let source = scene;\r
        levels.forEach(([front, back]) => {\r
          const d = pass(front, downProgram);\r
          bind(0, source.texture);\r
          gl.uniform1i(d.uSource, 0);\r
          gl.uniform2f(d.uTarget, front.width, front.height);\r
          gl.uniform2f(d.uTexel, 1 / source.width, 1 / source.height);\r
          gl.uniform1f(d.uLimit, 4 * encode);\r
          gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
          let b = pass(back, blurProgram);\r
          bind(0, front.texture);\r
          gl.uniform1i(b.uSource, 0);\r
          gl.uniform2f(b.uTarget, back.width, back.height);\r
          gl.uniform2f(b.uStep, 1 / front.width, 0);\r
          gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
          b = pass(front, blurProgram);\r
          bind(0, back.texture);\r
          gl.uniform1i(b.uSource, 0);\r
          gl.uniform2f(b.uTarget, front.width, front.height);\r
          gl.uniform2f(b.uStep, 0, 1 / back.height);\r
          gl.drawArrays(gl.TRIANGLES, 0, 3);\r
          source = front;\r
        });\r
      }\r
\r
      const c = pass(null, compositeProgram);\r
      bind(0, scene.texture);\r
      gl.uniform1i(c.uScene, 0);\r
      levels.forEach(([front], index) => {\r
        bind(index + 1, front.texture);\r
        gl.uniform1i(c[\`uBloom\${index}\`], index + 1);\r
      });\r
      gl.uniform2f(c.uView, width, height);\r
      gl.uniform1f(c.uDecode, 1 / encode);\r
      gl.uniform1f(c.uGlow, s.glow);\r
      gl.uniform1f(c.uBloom, s.bloom);\r
      gl.uniform1f(c.uPresence, presence);\r
      gl.uniform1f(c.uOpacity, s.opacity);\r
      gl.uniform1f(c.uFade, s.fade);\r
      gl.uniform1f(c.uLightMode, s.lightMode ? 1 : 0);\r
      gl.uniform3fv(c.uTopColor, toLinear(s.backgroundColor));\r
      gl.uniform1f(c.uTopGlow, s.backgroundGlow);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      for (let unit = BLOOM_LEVELS; unit >= 0; unit--) bind(unit, null);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      if (!s.intro || reduce) state.intro = 1;\r
      else if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / INTRO_SECONDS);\r
\r
      const holding = s.holdToWarp && pointer.held && pointer.inside && !reduce;\r
      state.warp += ((holding ? 1 : 0) - state.warp) * (1 - Math.exp(-dt * (holding ? 2.2 : 1.6)));\r
      const rush = WARP_SPEED * Math.pow(1 - state.intro, 2) + 6 * state.warp;\r
      const running = !s.paused && !reduce;\r
      if (running) state.travel += dt * 0.1 * s.speed * (1 + rush);\r
\r
      const ratio = canvas.width / Math.max(1, container.clientWidth);\r
      const targetX = pointer.x * ratio;\r
      const targetY = (container.clientHeight - pointer.y) * ratio;\r
      const engaged = s.mouseInteraction && pointer.inside && !reduce;\r
      if (engaged && state.touch < 0.01) {\r
        state.mouseX = targetX;\r
        state.mouseY = targetY;\r
        state.lensX = targetX;\r
        state.lensY = targetY;\r
      }\r
      const follow = s.mouseDampening > 0 ? 1 - Math.exp(-dt / s.mouseDampening) : 1;\r
      state.mouseX += (targetX - state.mouseX) * follow;\r
      state.mouseY += (targetY - state.mouseY) * follow;\r
      const lensFollow = 1 - Math.exp(-dt * 6);\r
      state.lensX += (targetX - state.lensX) * lensFollow;\r
      state.lensY += (targetY - state.lensY) * lensFollow;\r
      state.touch += ((engaged ? 1 : 0) - state.touch) * (1 - Math.exp(-dt * (engaged ? 4 : 2)));\r
\r
      render();\r
\r
      const settling = state.intro < 1 || state.warp > 0.001 || Math.abs((engaged ? 1 : 0) - state.touch) > 0.002;\r
      if ((running && s.speed !== 0) || settling) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
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
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      if (!raf) render();\r
      wake();\r
    };\r
\r
    const locate = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };\r
    };\r
\r
    const onPointerMove = event => {\r
      const point = locate(event);\r
      pointer.x = point.x;\r
      pointer.y = point.y;\r
      pointer.inside = point.inside;\r
      wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      const point = locate(event);\r
      if (!point.inside) return;\r
      pointer.x = point.x;\r
      pointer.y = point.y;\r
      pointer.inside = true;\r
      pointer.held = true;\r
      wake();\r
    };\r
\r
    const onPointerUp = () => {\r
      pointer.held = false;\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      pointer.held = false;\r
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
      canvas.removeEventListener('webglcontextlost', onContextLost);\r
      canvas.removeEventListener('webglcontextrestored', onContextRestored);\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('pointerup', onPointerUp);\r
      window.removeEventListener('pointercancel', onPointerUp);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      [scene, ...levels.flat()].forEach(target => {\r
        if (target.texture) gl.deleteTexture(target.texture);\r
        gl.deleteFramebuffer(target.framebuffer);\r
      });\r
      [streakProgram, downProgram, blurProgram, compositeProgram].forEach(item => gl.deleteProgram(item.program));\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      if (!gl.isContextLost()) gl.getExtension('WEBGL_lose_context')?.loseContext();\r
    };\r
  }, [generation]);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div\r
      ref={containerRef}\r
      className={\`lightfall-container\${className ? \` \${className}\` : ''}\`}\r
      style={{ ...(mixBlendMode ? { mixBlendMode } : null), ...style }}\r
    >\r
      <canvas ref={canvasRef} className="lightfall-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Lightfall;\r
`,n=`.lightfall-container {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.lightfall-canvas {\r
  position: absolute;\r
  inset: 0;\r
  display: block;\r
  width: 100%;\r
  height: 100%;\r
}\r
`,e=`'use client';\r
\r
import { useEffect, useRef, useState } from 'react';\r
\r
const MAX_COLORS = 8;\r
const BLOOM_LEVELS = 4;\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const STREAKS = \`#version 300 es\r
precision highp float;\r
uniform vec2 uView;\r
uniform float uZoom;\r
uniform float uPhase;\r
uniform float uTwinkleClock;\r
uniform float uRings;\r
uniform vec3 uColors[8];\r
uniform int uColorCount;\r
uniform int uStreakCount;\r
uniform int uColumns;\r
uniform float uWidth;\r
uniform float uTail;\r
uniform float uTwinkle;\r
uniform float uHead;\r
uniform float uDepth;\r
uniform vec4 uMouse;\r
uniform vec3 uLens;\r
uniform float uLightMode;\r
uniform float uEncode;\r
out vec4 outColor;\r
\r
const vec3 CAMERA = vec3(0.0, -0.8888889, -0.2222222);\r
const float TAU = 6.28318530718;\r
const float SPACING = 0.005;\r
const float REACH = 0.32;\r
\r
uint scramble(uint x) {\r
  x ^= x >> 16;\r
  x *= 0x7feb352du;\r
  x ^= x >> 15;\r
  x *= 0x846ca68bu;\r
  x ^= x >> 16;\r
  return x;\r
}\r
\r
float unit(uint x) {\r
  return float(x & 0xffffu) / 65535.0;\r
}\r
\r
float stroke(float d, float w) {\r
  float s = max(0.75 * w, 0.55);\r
  return 0.75 * w / s * exp(-0.5 * d * d / (s * s));\r
}\r
\r
float orb(float d, float r) {\r
  float s = max(0.6 * r, 0.7);\r
  float e = 0.6 * r / s;\r
  return e * e * exp(-0.5 * d * d / (s * s));\r
}\r
\r
void main() {\r
  vec2 frag = gl_FragCoord.xy;\r
  vec2 screen = (2.0 * frag - uView) / uView.x;\r
  vec2 p = screen;\r
  mat2 warp = mat2(1.0);\r
  if (uLens.z > 0.0) {\r
    vec2 o = p - uLens.xy;\r
    float e = uLens.z * exp(-dot(o, o) / (REACH * REACH));\r
    p -= o * e;\r
    warp = mat2(1.0 - e) + outerProduct(o, o) * (2.0 * e / (REACH * REACH));\r
  }\r
\r
  vec3 dir = vec3(p, uZoom);\r
  vec3 exits = (1.0 - CAMERA * sign(dir)) / max(abs(dir), vec3(1e-6));\r
  float u = min(exits.x, min(exits.y, exits.z));\r
  for (int i = 0; i < 5; i++) {\r
    vec3 h = CAMERA + u * dir;\r
    vec3 h2 = h * h;\r
    u -= (dot(h2, h2) - 1.0) / (4.0 * dot(dir, h2 * h));\r
  }\r
  vec3 hit = CAMERA + u * dir;\r
  vec3 normal = hit * hit * hit;\r
  float facing = dot(normal, dir);\r
  vec3 stepX = u * (vec3(1.0, 0.0, 0.0) - dir * (normal.x / facing));\r
  vec3 stepY = u * (vec3(0.0, 1.0, 0.0) - dir * (normal.y / facing));\r
  float ring = hit.y * hit.y + hit.z * hit.z;\r
  float theta = atan(hit.z, hit.y);\r
  mat2 jacobian = mat2(\r
    stepX.x,\r
    (hit.y * stepX.z - hit.z * stepX.y) / ring,\r
    stepY.x,\r
    (hit.y * stepY.z - hit.z * stepY.y) / ring\r
  ) * warp * (2.0 / uView.x);\r
\r
  vec2 gradX = vec2(jacobian[0][0], jacobian[1][0]);\r
  vec2 gradTheta = vec2(jacobian[0][1], jacobian[1][1]);\r
  float scale = max(length(gradX), 1e-8);\r
  float det = max(abs(gradX.x * gradTheta.y - gradX.y * gradTheta.x), 1e-12);\r
  float along = scale / det;\r
  float skew = dot(gradX, gradTheta) / det;\r
  float spacing = SPACING / scale;\r
  float detail = smoothstep(1.6, 3.2, spacing);\r
  if (detail <= 0.0) {\r
    outColor = vec4(0.0, 0.0, 0.0, 1.0);\r
    return;\r
  }\r
  float halfWidth = min(uWidth / scale, 0.2 * spacing);\r
  float headRadius = min(2.0 * uWidth / scale, 0.35 * spacing);\r
  float headReach = 4.0 * max(0.6 * headRadius, 0.7);\r
  float edge = uColumns > 1 ? 1.0 : 0.5;\r
  float period = TAU / uRings;\r
  float fog = exp(-max(u * length(dir) - 0.6, 0.0) * 1.6 * uDepth);\r
\r
  float boost = 1.0;\r
  if (uMouse.z > 0.0) {\r
    vec2 m = screen - uMouse.xy;\r
    boost += 2.0 * uMouse.z * exp(-dot(m, m) / max(uMouse.w * uMouse.w, 1e-4));\r
  }\r
\r
  int count = max(uColorCount, 1);\r
  vec3 total = vec3(0.0);\r
  for (int layer = 0; layer < 16; layer++) {\r
    if (layer >= uStreakCount) break;\r
    float x = hit.x + float(layer) * SPACING / 8.0;\r
    float nearest = floor(x / SPACING + 0.5);\r
    float side = x >= nearest * SPACING ? 1.0 : -1.0;\r
    for (int k = 0; k < 2; k++) {\r
      if (k >= uColumns) break;\r
      float column = nearest + side * float(k);\r
      float across = (x - column * SPACING) / scale;\r
      uint seed = scramble(uint(int(column) + 65536) + uint(layer) * 0x9e3779b9u);\r
      uint next = scramble(seed);\r
      float hue = unit(seed >> 16);\r
      float delta = theta - uPhase * (1.0 + floor(unit(seed) * 16.0) / 16.0) - unit(next) * period;\r
      delta -= period * floor(delta / period + 0.5);\r
      float ahead = delta * along - across * skew;\r
      if (abs(ahead) > headReach && (delta > 0.0 || -delta * uTail > 3.2)) continue;\r
      float behind = max(-delta, 0.0);\r
      float fall = exp(-uTail * behind) * (1.0 - smoothstep(0.5, 0.95, behind / (0.5 * period)));\r
      fall *= 1.0 - smoothstep(1.2, 3.2, uTail * behind);\r
      float reach = length(vec2(across, ahead));\r
      float trail = stroke(ahead > 0.0 ? reach : abs(across), halfWidth * mix(0.4, 1.0, fall)) * fall;\r
      float glint = orb(reach, headRadius) * mix(3.0, 1.8, uLightMode);\r
      float weight = mix(1.5, 1.0 + sin(uTwinkleClock + 7.0 * hue + 4.0), uTwinkle);\r
      weight *= 1.0 - smoothstep(0.72 * edge, edge, abs(across) / spacing);\r
      vec3 color = uColors[min(int(hue * float(count)), count - 1)];\r
      vec3 hot = mix(color, vec3(1.0), uHead * (1.0 - uLightMode));\r
      total += (trail * color + glint * hot) * weight;\r
    }\r
  }\r
\r
  outColor = vec4(total * fog * boost * detail * uEncode, 1.0);\r
}\`;\r
\r
const DOWNSAMPLE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uSource;\r
uniform vec2 uTarget;\r
uniform vec2 uTexel;\r
uniform float uLimit;\r
out vec4 outColor;\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uTarget;\r
  vec3 color = texture(uSource, uv - uTexel).rgb;\r
  color += texture(uSource, uv + uTexel).rgb;\r
  color += texture(uSource, uv + vec2(uTexel.x, -uTexel.y)).rgb;\r
  color += texture(uSource, uv + vec2(-uTexel.x, uTexel.y)).rgb;\r
  outColor = vec4(min(color * 0.25, vec3(uLimit)), 1.0);\r
}\`;\r
\r
const BLUR = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uSource;\r
uniform vec2 uTarget;\r
uniform vec2 uStep;\r
out vec4 outColor;\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uTarget;\r
  vec3 color = texture(uSource, uv).rgb * 0.181862;\r
  color += (texture(uSource, uv + uStep * 1.423135).rgb + texture(uSource, uv - uStep * 1.423135).rgb) * 0.284316;\r
  color += (texture(uSource, uv + uStep * 3.326702).rgb + texture(uSource, uv - uStep * 3.326702).rgb) * 0.106598;\r
  color += (texture(uSource, uv + uStep * 5.242989).rgb + texture(uSource, uv - uStep * 5.242989).rgb) * 0.018156;\r
  outColor = vec4(color, 1.0);\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uScene;\r
uniform sampler2D uBloom0;\r
uniform sampler2D uBloom1;\r
uniform sampler2D uBloom2;\r
uniform sampler2D uBloom3;\r
uniform vec2 uView;\r
uniform float uDecode;\r
uniform float uGlow;\r
uniform float uBloom;\r
uniform float uPresence;\r
uniform float uOpacity;\r
uniform float uFade;\r
uniform float uLightMode;\r
uniform vec3 uTopColor;\r
uniform float uTopGlow;\r
out vec4 outColor;\r
\r
float smootherstep01(float t) {\r
  t = clamp(t, 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uView;\r
  vec3 light = texelFetch(uScene, ivec2(gl_FragCoord.xy), 0).rgb;\r
  if (uBloom > 0.0) {\r
    vec3 halo = texture(uBloom0, uv).rgb * 0.42;\r
    halo += texture(uBloom1, uv).rgb * 0.3;\r
    halo += texture(uBloom2, uv).rgb * 0.18;\r
    halo += texture(uBloom3, uv).rgb * 0.1;\r
    light += halo * uBloom * (uLightMode > 0.5 ? 0.2 : 1.0);\r
  }\r
  light *= uDecode * uGlow * uPresence;\r
\r
  if (uLightMode < 0.5 && uTopGlow > 0.0) {\r
    float aspect = uView.x / uView.y;\r
    vec2 q = vec2((uv.x - 0.5) * aspect, 1.04 - uv.y);\r
    float spread = 0.34 * max(aspect, 0.75);\r
    float core = exp(-q.x * q.x / (spread * spread) - q.y * q.y / 0.06);\r
    float halo = exp(-q.x * q.x / (3.6 * spread * spread) - q.y * q.y / 0.18);\r
    light += uTopColor * uTopGlow * (core * 0.85 + halo * 0.3) * uPresence;\r
  }\r
\r
  vec3 lit = max(light, 0.0);\r
  vec3 mapped = sqrt(1.0 - exp(-1.3 * lit * lit / (lit + 0.025)));\r
  float peak = max(mapped.r, max(mapped.g, mapped.b));\r
\r
  float mask = uOpacity;\r
  float edge = uFade * 0.5;\r
  if (edge > 0.0) {\r
    mask *= smootherstep01(uv.x / edge) * smootherstep01((1.0 - uv.x) / edge);\r
    mask *= smootherstep01(uv.y / edge) * smootherstep01((1.0 - uv.y) / edge);\r
  }\r
  float grain = (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;\r
\r
  if (uLightMode > 0.5) {\r
    float coverage = clamp(smoothstep(0.0, 0.5, peak) * mask * 0.94 + grain, 0.0, 1.0);\r
    vec3 chroma = sqrt(clamp(lit / max(max(lit.r, max(lit.g, lit.b)), 1e-6), 0.0, 1.0));\r
    chroma = pow(chroma, vec3(1.35));\r
    chroma /= max(max(chroma.r, max(chroma.g, chroma.b)), 1e-4);\r
    float saturation = 1.0 - min(chroma.r, min(chroma.g, chroma.b));\r
    chroma = mix(vec3(0.3), chroma, smoothstep(0.08, 0.35, saturation));\r
    outColor = vec4(chroma * coverage, coverage);\r
  } else {\r
    vec3 color = clamp(mapped + grain, 0.0, 1.0) * mask;\r
    outColor = vec4(color, max(color.r, max(color.g, color.b)));\r
  }\r
}\`;\r
\r
const INTRO_SECONDS = 2.6;\r
const WARP_SPEED = 9;\r
const TAU = Math.PI * 2;\r
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
    if (info) uniforms[info.name.replace(/\\[0\\]$/, '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const Lightfall = ({\r
  colors = ['#ffffff'],\r
  backgroundColor = '#94a3b8',\r
  speed = 0.3,\r
  streakCount = 2,\r
  streakWidth = 0.8,\r
  streakLength = 1,\r
  glow = 1,\r
  density = 0.6,\r
  twinkle = 0.3,\r
  zoom = 3,\r
  backgroundGlow = 0.1,\r
  headGlow = 0.6,\r
  depth = 0.5,\r
  bloom = 0.35,\r
  opacity = 1,\r
  mouseInteraction = true,\r
  mouseStrength = 0.4,\r
  mouseRadius = 0.45,\r
  mouseDampening = 0.15,\r
  lens = 0.5,\r
  holdToWarp = true,\r
  intro = true,\r
  fade = 0,\r
  lightMode = false,\r
  mixBlendMode,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settingsRef = useRef(null);\r
  const [generation, setGeneration] = useState(0);\r
  settingsRef.current = {\r
    colors: (Array.isArray(colors) && colors.length ? colors : ['#ffffff']).slice(0, MAX_COLORS).map(String),\r
    backgroundColor: String(backgroundColor),\r
    speed,\r
    streakCount: Math.round(clamp(streakCount, 1, 16)),\r
    streakWidth: Math.max(0.05, streakWidth),\r
    streakLength: Math.max(0.05, streakLength),\r
    glow: Math.max(0, glow),\r
    density,\r
    twinkle: clamp(twinkle, 0, 1),\r
    zoom: Math.max(0.1, zoom),\r
    backgroundGlow: Math.max(0, backgroundGlow),\r
    headGlow: clamp(headGlow, 0, 1),\r
    depth: Math.max(0, depth),\r
    bloom: Math.max(0, bloom),\r
    opacity: clamp(opacity, 0, 1),\r
    mouseInteraction,\r
    mouseStrength: Math.max(0, mouseStrength),\r
    mouseRadius: Math.max(0.01, mouseRadius),\r
    mouseDampening: Math.max(0, mouseDampening),\r
    lens: clamp(lens, 0, 1),\r
    holdToWarp,\r
    intro,\r
    fade: clamp(fade, 0, 1),\r
    lightMode,\r
    paused,\r
    dpr\r
  };\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    const gl = canvas?.getContext('webgl2', {\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false,\r
      powerPreference: 'high-performance'\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const floatTargets = !!gl.getExtension('EXT_color_buffer_float');\r
    const streakProgram = link(gl, STREAKS);\r
    const downProgram = link(gl, DOWNSAMPLE);\r
    const blurProgram = link(gl, BLUR);\r
    const compositeProgram = link(gl, COMPOSITE);\r
    if (!streakProgram || !downProgram || !blurProgram || !compositeProgram) return undefined;\r
\r
    const onContextLost = event => {\r
      event.preventDefault();\r
    };\r
    const onContextRestored = () => setGeneration(value => value + 1);\r
    canvas.addEventListener('webglcontextlost', onContextLost);\r
    canvas.addEventListener('webglcontextrestored', onContextRestored);\r
\r
    const buffer = gl.createBuffer();\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const format = floatTargets ? gl.RGBA16F : gl.RGBA8;\r
    const encode = floatTargets ? 1 : 0.25;\r
    const createTarget = () => ({ texture: null, framebuffer: gl.createFramebuffer(), width: 0, height: 0 });\r
    const scene = createTarget();\r
    const levels = Array.from({ length: BLOOM_LEVELS }, () => [createTarget(), createTarget()]);\r
\r
    const allocate = (target, width, height) => {\r
      if (target.texture && target.width === width && target.height === height) return;\r
      if (target.texture) gl.deleteTexture(target.texture);\r
      target.texture = gl.createTexture();\r
      target.width = width;\r
      target.height = height;\r
      gl.bindTexture(gl.TEXTURE_2D, target.texture);\r
      gl.texStorage2D(gl.TEXTURE_2D, 1, format, width, height);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target.texture, 0);\r
    };\r
\r
    const pass = (target, program) => {\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.framebuffer : null);\r
      gl.viewport(0, 0, target ? target.width : canvas.width, target ? target.height : canvas.height);\r
      gl.useProgram(program.program);\r
      return program.uniforms;\r
    };\r
\r
    const bind = (unit, texture) => {\r
      gl.activeTexture(gl.TEXTURE0 + unit);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
    };\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const colorCache = new Map();\r
    const toRgb = value => {\r
      if (colorCache.has(value)) return colorCache.get(value);\r
      let rgb = [1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#ffffff';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      colorCache.set(value, rgb);\r
      return rgb;\r
    };\r
    const toLinear = value => toRgb(value).map(channel => channel * channel);\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const palette = new Float32Array(MAX_COLORS * 3);\r
    const pointer = { x: 0, y: 0, inside: false, held: false };\r
    const state = {\r
      travel: 0,\r
      intro: settingsRef.current.intro && !reduce ? 0 : 1,\r
      mouseX: 0,\r
      mouseY: 0,\r
      lensX: 0,\r
      lensY: 0,\r
      touch: 0,\r
      warp: 0\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const width = canvas.width;\r
      const height = canvas.height;\r
      const cssWidth = Math.max(1, container.clientWidth);\r
      const cssHeight = Math.max(1, container.clientHeight);\r
      gl.bindVertexArray(vao);\r
      allocate(scene, width, height);\r
      levels.forEach((pair, index) => {\r
        const levelWidth = Math.max(1, Math.round(cssWidth / 2 ** (index + 1)));\r
        const levelHeight = Math.max(1, Math.round(cssHeight / 2 ** (index + 1)));\r
        allocate(pair[0], levelWidth, levelHeight);\r
        allocate(pair[1], levelWidth, levelHeight);\r
      });\r
\r
      const intro = state.intro;\r
      const presence = Math.min(1, intro * 2.2);\r
      const stretch = 1 + 5 * Math.pow(1 - intro, 2) + 2.5 * state.warp;\r
      const rings = Math.max(1, Math.floor(TAU * Math.max(s.density, 0.05) + 0.5));\r
      const period = TAU / rings;\r
      const clock = 9 + state.travel;\r
\r
      const list = s.colors.map(toLinear);\r
      palette.fill(0);\r
      for (let i = 0; i < MAX_COLORS; i++) palette.set(list[Math.min(i, list.length - 1)], i * 3);\r
\r
      const toScreenX = value => (2 * value - width) / width;\r
      const toScreenY = value => (2 * value - height) / width;\r
\r
      const r = pass(scene, streakProgram);\r
      gl.uniform2f(r.uView, width, height);\r
      gl.uniform1f(r.uZoom, s.zoom);\r
      gl.uniform1f(r.uPhase, clock % (16 * period));\r
      gl.uniform1f(r.uTwinkleClock, clock % TAU);\r
      gl.uniform1f(r.uRings, rings);\r
      gl.uniform3fv(r.uColors, palette);\r
      gl.uniform1i(r.uColorCount, list.length);\r
      gl.uniform1i(r.uStreakCount, s.streakCount);\r
      gl.uniform1i(r.uColumns, s.streakWidth > 1 ? 2 : 1);\r
      gl.uniform1f(r.uWidth, 5e-4 * s.streakWidth);\r
      gl.uniform1f(r.uTail, 19 / (s.streakLength * stretch));\r
      gl.uniform1f(r.uTwinkle, s.twinkle);\r
      gl.uniform1f(r.uHead, s.headGlow);\r
      gl.uniform1f(r.uDepth, s.depth);\r
      gl.uniform4f(\r
        r.uMouse,\r
        toScreenX(state.mouseX),\r
        toScreenY(state.mouseY),\r
        s.mouseInteraction ? s.mouseStrength * state.touch : 0,\r
        s.mouseRadius\r
      );\r
      gl.uniform3f(\r
        r.uLens,\r
        toScreenX(state.lensX),\r
        toScreenY(state.lensY),\r
        s.mouseInteraction ? 0.5 * s.lens * state.touch : 0\r
      );\r
      gl.uniform1f(r.uLightMode, s.lightMode ? 1 : 0);\r
      gl.uniform1f(r.uEncode, encode);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      if (s.bloom > 0) {\r
        let source = scene;\r
        levels.forEach(([front, back]) => {\r
          const d = pass(front, downProgram);\r
          bind(0, source.texture);\r
          gl.uniform1i(d.uSource, 0);\r
          gl.uniform2f(d.uTarget, front.width, front.height);\r
          gl.uniform2f(d.uTexel, 1 / source.width, 1 / source.height);\r
          gl.uniform1f(d.uLimit, 4 * encode);\r
          gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
          let b = pass(back, blurProgram);\r
          bind(0, front.texture);\r
          gl.uniform1i(b.uSource, 0);\r
          gl.uniform2f(b.uTarget, back.width, back.height);\r
          gl.uniform2f(b.uStep, 1 / front.width, 0);\r
          gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
          b = pass(front, blurProgram);\r
          bind(0, back.texture);\r
          gl.uniform1i(b.uSource, 0);\r
          gl.uniform2f(b.uTarget, front.width, front.height);\r
          gl.uniform2f(b.uStep, 0, 1 / back.height);\r
          gl.drawArrays(gl.TRIANGLES, 0, 3);\r
          source = front;\r
        });\r
      }\r
\r
      const c = pass(null, compositeProgram);\r
      bind(0, scene.texture);\r
      gl.uniform1i(c.uScene, 0);\r
      levels.forEach(([front], index) => {\r
        bind(index + 1, front.texture);\r
        gl.uniform1i(c[\`uBloom\${index}\`], index + 1);\r
      });\r
      gl.uniform2f(c.uView, width, height);\r
      gl.uniform1f(c.uDecode, 1 / encode);\r
      gl.uniform1f(c.uGlow, s.glow);\r
      gl.uniform1f(c.uBloom, s.bloom);\r
      gl.uniform1f(c.uPresence, presence);\r
      gl.uniform1f(c.uOpacity, s.opacity);\r
      gl.uniform1f(c.uFade, s.fade);\r
      gl.uniform1f(c.uLightMode, s.lightMode ? 1 : 0);\r
      gl.uniform3fv(c.uTopColor, toLinear(s.backgroundColor));\r
      gl.uniform1f(c.uTopGlow, s.backgroundGlow);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      for (let unit = BLOOM_LEVELS; unit >= 0; unit--) bind(unit, null);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      if (!s.intro || reduce) state.intro = 1;\r
      else if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / INTRO_SECONDS);\r
\r
      const holding = s.holdToWarp && pointer.held && pointer.inside && !reduce;\r
      state.warp += ((holding ? 1 : 0) - state.warp) * (1 - Math.exp(-dt * (holding ? 2.2 : 1.6)));\r
      const rush = WARP_SPEED * Math.pow(1 - state.intro, 2) + 6 * state.warp;\r
      const running = !s.paused && !reduce;\r
      if (running) state.travel += dt * 0.1 * s.speed * (1 + rush);\r
\r
      const ratio = canvas.width / Math.max(1, container.clientWidth);\r
      const targetX = pointer.x * ratio;\r
      const targetY = (container.clientHeight - pointer.y) * ratio;\r
      const engaged = s.mouseInteraction && pointer.inside && !reduce;\r
      if (engaged && state.touch < 0.01) {\r
        state.mouseX = targetX;\r
        state.mouseY = targetY;\r
        state.lensX = targetX;\r
        state.lensY = targetY;\r
      }\r
      const follow = s.mouseDampening > 0 ? 1 - Math.exp(-dt / s.mouseDampening) : 1;\r
      state.mouseX += (targetX - state.mouseX) * follow;\r
      state.mouseY += (targetY - state.mouseY) * follow;\r
      const lensFollow = 1 - Math.exp(-dt * 6);\r
      state.lensX += (targetX - state.lensX) * lensFollow;\r
      state.lensY += (targetY - state.lensY) * lensFollow;\r
      state.touch += ((engaged ? 1 : 0) - state.touch) * (1 - Math.exp(-dt * (engaged ? 4 : 2)));\r
\r
      render();\r
\r
      const settling = state.intro < 1 || state.warp > 0.001 || Math.abs((engaged ? 1 : 0) - state.touch) > 0.002;\r
      if ((running && s.speed !== 0) || settling) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
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
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      if (!raf) render();\r
      wake();\r
    };\r
\r
    const locate = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };\r
    };\r
\r
    const onPointerMove = event => {\r
      const point = locate(event);\r
      pointer.x = point.x;\r
      pointer.y = point.y;\r
      pointer.inside = point.inside;\r
      wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      const point = locate(event);\r
      if (!point.inside) return;\r
      pointer.x = point.x;\r
      pointer.y = point.y;\r
      pointer.inside = true;\r
      pointer.held = true;\r
      wake();\r
    };\r
\r
    const onPointerUp = () => {\r
      pointer.held = false;\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      pointer.held = false;\r
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
      canvas.removeEventListener('webglcontextlost', onContextLost);\r
      canvas.removeEventListener('webglcontextrestored', onContextRestored);\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('pointerup', onPointerUp);\r
      window.removeEventListener('pointercancel', onPointerUp);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      [scene, ...levels.flat()].forEach(target => {\r
        if (target.texture) gl.deleteTexture(target.texture);\r
        gl.deleteFramebuffer(target.framebuffer);\r
      });\r
      [streakProgram, downProgram, blurProgram, compositeProgram].forEach(item => gl.deleteProgram(item.program));\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      if (!gl.isContextLost()) gl.getExtension('WEBGL_lose_context')?.loseContext();\r
    };\r
  }, [generation]);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div\r
      ref={containerRef}\r
      className={\`relative w-full h-full overflow-hidden \${className}\`}\r
      style={{ ...(mixBlendMode ? { mixBlendMode } : null), ...style }}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Lightfall;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, useState, type CSSProperties } from 'react';\r
\r
import './Lightfall.css';\r
\r
const MAX_COLORS = 8;\r
const BLOOM_LEVELS = 4;\r
\r
export interface LightfallProps {\r
  colors?: string[];\r
  backgroundColor?: string;\r
  speed?: number;\r
  streakCount?: number;\r
  streakWidth?: number;\r
  streakLength?: number;\r
  glow?: number;\r
  density?: number;\r
  twinkle?: number;\r
  zoom?: number;\r
  backgroundGlow?: number;\r
  headGlow?: number;\r
  depth?: number;\r
  bloom?: number;\r
  opacity?: number;\r
  mouseInteraction?: boolean;\r
  mouseStrength?: number;\r
  mouseRadius?: number;\r
  mouseDampening?: number;\r
  lens?: number;\r
  holdToWarp?: boolean;\r
  intro?: boolean;\r
  fade?: number;\r
  lightMode?: boolean;\r
  mixBlendMode?: CSSProperties['mixBlendMode'];\r
  paused?: boolean;\r
  dpr?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Settings {\r
  colors: string[];\r
  backgroundColor: string;\r
  speed: number;\r
  streakCount: number;\r
  streakWidth: number;\r
  streakLength: number;\r
  glow: number;\r
  density: number;\r
  twinkle: number;\r
  zoom: number;\r
  backgroundGlow: number;\r
  headGlow: number;\r
  depth: number;\r
  bloom: number;\r
  opacity: number;\r
  mouseInteraction: boolean;\r
  mouseStrength: number;\r
  mouseRadius: number;\r
  mouseDampening: number;\r
  lens: number;\r
  holdToWarp: boolean;\r
  intro: boolean;\r
  fade: number;\r
  lightMode: boolean;\r
  paused: boolean;\r
  dpr?: number;\r
}\r
\r
type Uniforms = Record<string, WebGLUniformLocation | null>;\r
\r
interface Program {\r
  program: WebGLProgram;\r
  uniforms: Uniforms;\r
}\r
\r
interface Target {\r
  texture: WebGLTexture | null;\r
  framebuffer: WebGLFramebuffer | null;\r
  width: number;\r
  height: number;\r
}\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const STREAKS = \`#version 300 es\r
precision highp float;\r
uniform vec2 uView;\r
uniform float uZoom;\r
uniform float uPhase;\r
uniform float uTwinkleClock;\r
uniform float uRings;\r
uniform vec3 uColors[8];\r
uniform int uColorCount;\r
uniform int uStreakCount;\r
uniform int uColumns;\r
uniform float uWidth;\r
uniform float uTail;\r
uniform float uTwinkle;\r
uniform float uHead;\r
uniform float uDepth;\r
uniform vec4 uMouse;\r
uniform vec3 uLens;\r
uniform float uLightMode;\r
uniform float uEncode;\r
out vec4 outColor;\r
\r
const vec3 CAMERA = vec3(0.0, -0.8888889, -0.2222222);\r
const float TAU = 6.28318530718;\r
const float SPACING = 0.005;\r
const float REACH = 0.32;\r
\r
uint scramble(uint x) {\r
  x ^= x >> 16;\r
  x *= 0x7feb352du;\r
  x ^= x >> 15;\r
  x *= 0x846ca68bu;\r
  x ^= x >> 16;\r
  return x;\r
}\r
\r
float unit(uint x) {\r
  return float(x & 0xffffu) / 65535.0;\r
}\r
\r
float stroke(float d, float w) {\r
  float s = max(0.75 * w, 0.55);\r
  return 0.75 * w / s * exp(-0.5 * d * d / (s * s));\r
}\r
\r
float orb(float d, float r) {\r
  float s = max(0.6 * r, 0.7);\r
  float e = 0.6 * r / s;\r
  return e * e * exp(-0.5 * d * d / (s * s));\r
}\r
\r
void main() {\r
  vec2 frag = gl_FragCoord.xy;\r
  vec2 screen = (2.0 * frag - uView) / uView.x;\r
  vec2 p = screen;\r
  mat2 warp = mat2(1.0);\r
  if (uLens.z > 0.0) {\r
    vec2 o = p - uLens.xy;\r
    float e = uLens.z * exp(-dot(o, o) / (REACH * REACH));\r
    p -= o * e;\r
    warp = mat2(1.0 - e) + outerProduct(o, o) * (2.0 * e / (REACH * REACH));\r
  }\r
\r
  vec3 dir = vec3(p, uZoom);\r
  vec3 exits = (1.0 - CAMERA * sign(dir)) / max(abs(dir), vec3(1e-6));\r
  float u = min(exits.x, min(exits.y, exits.z));\r
  for (int i = 0; i < 5; i++) {\r
    vec3 h = CAMERA + u * dir;\r
    vec3 h2 = h * h;\r
    u -= (dot(h2, h2) - 1.0) / (4.0 * dot(dir, h2 * h));\r
  }\r
  vec3 hit = CAMERA + u * dir;\r
  vec3 normal = hit * hit * hit;\r
  float facing = dot(normal, dir);\r
  vec3 stepX = u * (vec3(1.0, 0.0, 0.0) - dir * (normal.x / facing));\r
  vec3 stepY = u * (vec3(0.0, 1.0, 0.0) - dir * (normal.y / facing));\r
  float ring = hit.y * hit.y + hit.z * hit.z;\r
  float theta = atan(hit.z, hit.y);\r
  mat2 jacobian = mat2(\r
    stepX.x,\r
    (hit.y * stepX.z - hit.z * stepX.y) / ring,\r
    stepY.x,\r
    (hit.y * stepY.z - hit.z * stepY.y) / ring\r
  ) * warp * (2.0 / uView.x);\r
\r
  vec2 gradX = vec2(jacobian[0][0], jacobian[1][0]);\r
  vec2 gradTheta = vec2(jacobian[0][1], jacobian[1][1]);\r
  float scale = max(length(gradX), 1e-8);\r
  float det = max(abs(gradX.x * gradTheta.y - gradX.y * gradTheta.x), 1e-12);\r
  float along = scale / det;\r
  float skew = dot(gradX, gradTheta) / det;\r
  float spacing = SPACING / scale;\r
  float detail = smoothstep(1.6, 3.2, spacing);\r
  if (detail <= 0.0) {\r
    outColor = vec4(0.0, 0.0, 0.0, 1.0);\r
    return;\r
  }\r
  float halfWidth = min(uWidth / scale, 0.2 * spacing);\r
  float headRadius = min(2.0 * uWidth / scale, 0.35 * spacing);\r
  float headReach = 4.0 * max(0.6 * headRadius, 0.7);\r
  float edge = uColumns > 1 ? 1.0 : 0.5;\r
  float period = TAU / uRings;\r
  float fog = exp(-max(u * length(dir) - 0.6, 0.0) * 1.6 * uDepth);\r
\r
  float boost = 1.0;\r
  if (uMouse.z > 0.0) {\r
    vec2 m = screen - uMouse.xy;\r
    boost += 2.0 * uMouse.z * exp(-dot(m, m) / max(uMouse.w * uMouse.w, 1e-4));\r
  }\r
\r
  int count = max(uColorCount, 1);\r
  vec3 total = vec3(0.0);\r
  for (int layer = 0; layer < 16; layer++) {\r
    if (layer >= uStreakCount) break;\r
    float x = hit.x + float(layer) * SPACING / 8.0;\r
    float nearest = floor(x / SPACING + 0.5);\r
    float side = x >= nearest * SPACING ? 1.0 : -1.0;\r
    for (int k = 0; k < 2; k++) {\r
      if (k >= uColumns) break;\r
      float column = nearest + side * float(k);\r
      float across = (x - column * SPACING) / scale;\r
      uint seed = scramble(uint(int(column) + 65536) + uint(layer) * 0x9e3779b9u);\r
      uint next = scramble(seed);\r
      float hue = unit(seed >> 16);\r
      float delta = theta - uPhase * (1.0 + floor(unit(seed) * 16.0) / 16.0) - unit(next) * period;\r
      delta -= period * floor(delta / period + 0.5);\r
      float ahead = delta * along - across * skew;\r
      if (abs(ahead) > headReach && (delta > 0.0 || -delta * uTail > 3.2)) continue;\r
      float behind = max(-delta, 0.0);\r
      float fall = exp(-uTail * behind) * (1.0 - smoothstep(0.5, 0.95, behind / (0.5 * period)));\r
      fall *= 1.0 - smoothstep(1.2, 3.2, uTail * behind);\r
      float reach = length(vec2(across, ahead));\r
      float trail = stroke(ahead > 0.0 ? reach : abs(across), halfWidth * mix(0.4, 1.0, fall)) * fall;\r
      float glint = orb(reach, headRadius) * mix(3.0, 1.8, uLightMode);\r
      float weight = mix(1.5, 1.0 + sin(uTwinkleClock + 7.0 * hue + 4.0), uTwinkle);\r
      weight *= 1.0 - smoothstep(0.72 * edge, edge, abs(across) / spacing);\r
      vec3 color = uColors[min(int(hue * float(count)), count - 1)];\r
      vec3 hot = mix(color, vec3(1.0), uHead * (1.0 - uLightMode));\r
      total += (trail * color + glint * hot) * weight;\r
    }\r
  }\r
\r
  outColor = vec4(total * fog * boost * detail * uEncode, 1.0);\r
}\`;\r
\r
const DOWNSAMPLE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uSource;\r
uniform vec2 uTarget;\r
uniform vec2 uTexel;\r
uniform float uLimit;\r
out vec4 outColor;\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uTarget;\r
  vec3 color = texture(uSource, uv - uTexel).rgb;\r
  color += texture(uSource, uv + uTexel).rgb;\r
  color += texture(uSource, uv + vec2(uTexel.x, -uTexel.y)).rgb;\r
  color += texture(uSource, uv + vec2(-uTexel.x, uTexel.y)).rgb;\r
  outColor = vec4(min(color * 0.25, vec3(uLimit)), 1.0);\r
}\`;\r
\r
const BLUR = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uSource;\r
uniform vec2 uTarget;\r
uniform vec2 uStep;\r
out vec4 outColor;\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uTarget;\r
  vec3 color = texture(uSource, uv).rgb * 0.181862;\r
  color += (texture(uSource, uv + uStep * 1.423135).rgb + texture(uSource, uv - uStep * 1.423135).rgb) * 0.284316;\r
  color += (texture(uSource, uv + uStep * 3.326702).rgb + texture(uSource, uv - uStep * 3.326702).rgb) * 0.106598;\r
  color += (texture(uSource, uv + uStep * 5.242989).rgb + texture(uSource, uv - uStep * 5.242989).rgb) * 0.018156;\r
  outColor = vec4(color, 1.0);\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uScene;\r
uniform sampler2D uBloom0;\r
uniform sampler2D uBloom1;\r
uniform sampler2D uBloom2;\r
uniform sampler2D uBloom3;\r
uniform vec2 uView;\r
uniform float uDecode;\r
uniform float uGlow;\r
uniform float uBloom;\r
uniform float uPresence;\r
uniform float uOpacity;\r
uniform float uFade;\r
uniform float uLightMode;\r
uniform vec3 uTopColor;\r
uniform float uTopGlow;\r
out vec4 outColor;\r
\r
float smootherstep01(float t) {\r
  t = clamp(t, 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uView;\r
  vec3 light = texelFetch(uScene, ivec2(gl_FragCoord.xy), 0).rgb;\r
  if (uBloom > 0.0) {\r
    vec3 halo = texture(uBloom0, uv).rgb * 0.42;\r
    halo += texture(uBloom1, uv).rgb * 0.3;\r
    halo += texture(uBloom2, uv).rgb * 0.18;\r
    halo += texture(uBloom3, uv).rgb * 0.1;\r
    light += halo * uBloom * (uLightMode > 0.5 ? 0.2 : 1.0);\r
  }\r
  light *= uDecode * uGlow * uPresence;\r
\r
  if (uLightMode < 0.5 && uTopGlow > 0.0) {\r
    float aspect = uView.x / uView.y;\r
    vec2 q = vec2((uv.x - 0.5) * aspect, 1.04 - uv.y);\r
    float spread = 0.34 * max(aspect, 0.75);\r
    float core = exp(-q.x * q.x / (spread * spread) - q.y * q.y / 0.06);\r
    float halo = exp(-q.x * q.x / (3.6 * spread * spread) - q.y * q.y / 0.18);\r
    light += uTopColor * uTopGlow * (core * 0.85 + halo * 0.3) * uPresence;\r
  }\r
\r
  vec3 lit = max(light, 0.0);\r
  vec3 mapped = sqrt(1.0 - exp(-1.3 * lit * lit / (lit + 0.025)));\r
  float peak = max(mapped.r, max(mapped.g, mapped.b));\r
\r
  float mask = uOpacity;\r
  float edge = uFade * 0.5;\r
  if (edge > 0.0) {\r
    mask *= smootherstep01(uv.x / edge) * smootherstep01((1.0 - uv.x) / edge);\r
    mask *= smootherstep01(uv.y / edge) * smootherstep01((1.0 - uv.y) / edge);\r
  }\r
  float grain = (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;\r
\r
  if (uLightMode > 0.5) {\r
    float coverage = clamp(smoothstep(0.0, 0.5, peak) * mask * 0.94 + grain, 0.0, 1.0);\r
    vec3 chroma = sqrt(clamp(lit / max(max(lit.r, max(lit.g, lit.b)), 1e-6), 0.0, 1.0));\r
    chroma = pow(chroma, vec3(1.35));\r
    chroma /= max(max(chroma.r, max(chroma.g, chroma.b)), 1e-4);\r
    float saturation = 1.0 - min(chroma.r, min(chroma.g, chroma.b));\r
    chroma = mix(vec3(0.3), chroma, smoothstep(0.08, 0.35, saturation));\r
    outColor = vec4(chroma * coverage, coverage);\r
  } else {\r
    vec3 color = clamp(mapped + grain, 0.0, 1.0) * mask;\r
    outColor = vec4(color, max(color.r, max(color.g, color.b)));\r
  }\r
}\`;\r
\r
const INTRO_SECONDS = 2.6;\r
const WARP_SPEED = 9;\r
const TAU = Math.PI * 2;\r
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
  gl.bindAttribLocation(program, 0, 'aPosition');\r
  gl.linkProgram(program);\r
  gl.deleteShader(vertex);\r
  gl.deleteShader(fragment);\r
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {\r
    gl.deleteProgram(program);\r
    return null;\r
  }\r
  const uniforms: Uniforms = {};\r
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
  for (let i = 0; i < count; i++) {\r
    const info = gl.getActiveUniform(program, i);\r
    if (info) uniforms[info.name.replace(/\\[0\\]$/, '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const Lightfall = ({\r
  colors = ['#ffffff'],\r
  backgroundColor = '#94a3b8',\r
  speed = 0.3,\r
  streakCount = 2,\r
  streakWidth = 0.8,\r
  streakLength = 1,\r
  glow = 1,\r
  density = 0.6,\r
  twinkle = 0.3,\r
  zoom = 3,\r
  backgroundGlow = 0.1,\r
  headGlow = 0.6,\r
  depth = 0.5,\r
  bloom = 0.35,\r
  opacity = 1,\r
  mouseInteraction = true,\r
  mouseStrength = 0.4,\r
  mouseRadius = 0.45,\r
  mouseDampening = 0.15,\r
  lens = 0.5,\r
  holdToWarp = true,\r
  intro = true,\r
  fade = 0,\r
  lightMode = false,\r
  mixBlendMode,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  style\r
}: LightfallProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settingsRef = useRef<Settings>(null as unknown as Settings);\r
  const [generation, setGeneration] = useState(0);\r
  settingsRef.current = {\r
    colors: (Array.isArray(colors) && colors.length ? colors : ['#ffffff']).slice(0, MAX_COLORS).map(String),\r
    backgroundColor: String(backgroundColor),\r
    speed,\r
    streakCount: Math.round(clamp(streakCount, 1, 16)),\r
    streakWidth: Math.max(0.05, streakWidth),\r
    streakLength: Math.max(0.05, streakLength),\r
    glow: Math.max(0, glow),\r
    density,\r
    twinkle: clamp(twinkle, 0, 1),\r
    zoom: Math.max(0.1, zoom),\r
    backgroundGlow: Math.max(0, backgroundGlow),\r
    headGlow: clamp(headGlow, 0, 1),\r
    depth: Math.max(0, depth),\r
    bloom: Math.max(0, bloom),\r
    opacity: clamp(opacity, 0, 1),\r
    mouseInteraction,\r
    mouseStrength: Math.max(0, mouseStrength),\r
    mouseRadius: Math.max(0.01, mouseRadius),\r
    mouseDampening: Math.max(0, mouseDampening),\r
    lens: clamp(lens, 0, 1),\r
    holdToWarp,\r
    intro,\r
    fade: clamp(fade, 0, 1),\r
    lightMode,\r
    paused,\r
    dpr\r
  };\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    const gl = canvas?.getContext('webgl2', {\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false,\r
      powerPreference: 'high-performance'\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const floatTargets = !!gl.getExtension('EXT_color_buffer_float');\r
    const streakProgram = link(gl, STREAKS);\r
    const downProgram = link(gl, DOWNSAMPLE);\r
    const blurProgram = link(gl, BLUR);\r
    const compositeProgram = link(gl, COMPOSITE);\r
    if (!streakProgram || !downProgram || !blurProgram || !compositeProgram) return undefined;\r
\r
    const onContextLost = (event: Event) => {\r
      event.preventDefault();\r
    };\r
    const onContextRestored = () => setGeneration(value => value + 1);\r
    canvas.addEventListener('webglcontextlost', onContextLost);\r
    canvas.addEventListener('webglcontextrestored', onContextRestored);\r
\r
    const buffer = gl.createBuffer();\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const format = floatTargets ? gl.RGBA16F : gl.RGBA8;\r
    const encode = floatTargets ? 1 : 0.25;\r
    const createTarget = (): Target => ({ texture: null, framebuffer: gl.createFramebuffer(), width: 0, height: 0 });\r
    const scene = createTarget();\r
    const levels = Array.from({ length: BLOOM_LEVELS }, () => [createTarget(), createTarget()]);\r
\r
    const allocate = (target: Target, width: number, height: number) => {\r
      if (target.texture && target.width === width && target.height === height) return;\r
      if (target.texture) gl.deleteTexture(target.texture);\r
      target.texture = gl.createTexture();\r
      target.width = width;\r
      target.height = height;\r
      gl.bindTexture(gl.TEXTURE_2D, target.texture);\r
      gl.texStorage2D(gl.TEXTURE_2D, 1, format, width, height);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target.texture, 0);\r
    };\r
\r
    const pass = (target: Target | null, program: Program) => {\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.framebuffer : null);\r
      gl.viewport(0, 0, target ? target.width : canvas.width, target ? target.height : canvas.height);\r
      gl.useProgram(program.program);\r
      return program.uniforms;\r
    };\r
\r
    const bind = (unit: number, texture: WebGLTexture | null) => {\r
      gl.activeTexture(gl.TEXTURE0 + unit);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
    };\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const colorCache = new Map<string, number[]>();\r
    const toRgb = (value: string): number[] => {\r
      if (colorCache.has(value)) return colorCache.get(value) as number[];\r
      let rgb = [1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#ffffff';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      colorCache.set(value, rgb);\r
      return rgb;\r
    };\r
    const toLinear = (value: string) => toRgb(value).map(channel => channel * channel);\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const palette = new Float32Array(MAX_COLORS * 3);\r
    const pointer = { x: 0, y: 0, inside: false, held: false };\r
    const state = {\r
      travel: 0,\r
      intro: settingsRef.current.intro && !reduce ? 0 : 1,\r
      mouseX: 0,\r
      mouseY: 0,\r
      lensX: 0,\r
      lensY: 0,\r
      touch: 0,\r
      warp: 0\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const width = canvas.width;\r
      const height = canvas.height;\r
      const cssWidth = Math.max(1, container.clientWidth);\r
      const cssHeight = Math.max(1, container.clientHeight);\r
      gl.bindVertexArray(vao);\r
      allocate(scene, width, height);\r
      levels.forEach((pair, index) => {\r
        const levelWidth = Math.max(1, Math.round(cssWidth / 2 ** (index + 1)));\r
        const levelHeight = Math.max(1, Math.round(cssHeight / 2 ** (index + 1)));\r
        allocate(pair[0], levelWidth, levelHeight);\r
        allocate(pair[1], levelWidth, levelHeight);\r
      });\r
\r
      const intro = state.intro;\r
      const presence = Math.min(1, intro * 2.2);\r
      const stretch = 1 + 5 * Math.pow(1 - intro, 2) + 2.5 * state.warp;\r
      const rings = Math.max(1, Math.floor(TAU * Math.max(s.density, 0.05) + 0.5));\r
      const period = TAU / rings;\r
      const clock = 9 + state.travel;\r
\r
      const list = s.colors.map(toLinear);\r
      palette.fill(0);\r
      for (let i = 0; i < MAX_COLORS; i++) palette.set(list[Math.min(i, list.length - 1)], i * 3);\r
\r
      const toScreenX = (value: number) => (2 * value - width) / width;\r
      const toScreenY = (value: number) => (2 * value - height) / width;\r
\r
      const r = pass(scene, streakProgram);\r
      gl.uniform2f(r.uView, width, height);\r
      gl.uniform1f(r.uZoom, s.zoom);\r
      gl.uniform1f(r.uPhase, clock % (16 * period));\r
      gl.uniform1f(r.uTwinkleClock, clock % TAU);\r
      gl.uniform1f(r.uRings, rings);\r
      gl.uniform3fv(r.uColors, palette);\r
      gl.uniform1i(r.uColorCount, list.length);\r
      gl.uniform1i(r.uStreakCount, s.streakCount);\r
      gl.uniform1i(r.uColumns, s.streakWidth > 1 ? 2 : 1);\r
      gl.uniform1f(r.uWidth, 5e-4 * s.streakWidth);\r
      gl.uniform1f(r.uTail, 19 / (s.streakLength * stretch));\r
      gl.uniform1f(r.uTwinkle, s.twinkle);\r
      gl.uniform1f(r.uHead, s.headGlow);\r
      gl.uniform1f(r.uDepth, s.depth);\r
      gl.uniform4f(\r
        r.uMouse,\r
        toScreenX(state.mouseX),\r
        toScreenY(state.mouseY),\r
        s.mouseInteraction ? s.mouseStrength * state.touch : 0,\r
        s.mouseRadius\r
      );\r
      gl.uniform3f(\r
        r.uLens,\r
        toScreenX(state.lensX),\r
        toScreenY(state.lensY),\r
        s.mouseInteraction ? 0.5 * s.lens * state.touch : 0\r
      );\r
      gl.uniform1f(r.uLightMode, s.lightMode ? 1 : 0);\r
      gl.uniform1f(r.uEncode, encode);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      if (s.bloom > 0) {\r
        let source = scene;\r
        levels.forEach(([front, back]) => {\r
          const d = pass(front, downProgram);\r
          bind(0, source.texture);\r
          gl.uniform1i(d.uSource, 0);\r
          gl.uniform2f(d.uTarget, front.width, front.height);\r
          gl.uniform2f(d.uTexel, 1 / source.width, 1 / source.height);\r
          gl.uniform1f(d.uLimit, 4 * encode);\r
          gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
          let b = pass(back, blurProgram);\r
          bind(0, front.texture);\r
          gl.uniform1i(b.uSource, 0);\r
          gl.uniform2f(b.uTarget, back.width, back.height);\r
          gl.uniform2f(b.uStep, 1 / front.width, 0);\r
          gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
          b = pass(front, blurProgram);\r
          bind(0, back.texture);\r
          gl.uniform1i(b.uSource, 0);\r
          gl.uniform2f(b.uTarget, front.width, front.height);\r
          gl.uniform2f(b.uStep, 0, 1 / back.height);\r
          gl.drawArrays(gl.TRIANGLES, 0, 3);\r
          source = front;\r
        });\r
      }\r
\r
      const c = pass(null, compositeProgram);\r
      bind(0, scene.texture);\r
      gl.uniform1i(c.uScene, 0);\r
      levels.forEach(([front], index) => {\r
        bind(index + 1, front.texture);\r
        gl.uniform1i(c[\`uBloom\${index}\`], index + 1);\r
      });\r
      gl.uniform2f(c.uView, width, height);\r
      gl.uniform1f(c.uDecode, 1 / encode);\r
      gl.uniform1f(c.uGlow, s.glow);\r
      gl.uniform1f(c.uBloom, s.bloom);\r
      gl.uniform1f(c.uPresence, presence);\r
      gl.uniform1f(c.uOpacity, s.opacity);\r
      gl.uniform1f(c.uFade, s.fade);\r
      gl.uniform1f(c.uLightMode, s.lightMode ? 1 : 0);\r
      gl.uniform3fv(c.uTopColor, toLinear(s.backgroundColor));\r
      gl.uniform1f(c.uTopGlow, s.backgroundGlow);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      for (let unit = BLOOM_LEVELS; unit >= 0; unit--) bind(unit, null);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      if (!s.intro || reduce) state.intro = 1;\r
      else if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / INTRO_SECONDS);\r
\r
      const holding = s.holdToWarp && pointer.held && pointer.inside && !reduce;\r
      state.warp += ((holding ? 1 : 0) - state.warp) * (1 - Math.exp(-dt * (holding ? 2.2 : 1.6)));\r
      const rush = WARP_SPEED * Math.pow(1 - state.intro, 2) + 6 * state.warp;\r
      const running = !s.paused && !reduce;\r
      if (running) state.travel += dt * 0.1 * s.speed * (1 + rush);\r
\r
      const ratio = canvas.width / Math.max(1, container.clientWidth);\r
      const targetX = pointer.x * ratio;\r
      const targetY = (container.clientHeight - pointer.y) * ratio;\r
      const engaged = s.mouseInteraction && pointer.inside && !reduce;\r
      if (engaged && state.touch < 0.01) {\r
        state.mouseX = targetX;\r
        state.mouseY = targetY;\r
        state.lensX = targetX;\r
        state.lensY = targetY;\r
      }\r
      const follow = s.mouseDampening > 0 ? 1 - Math.exp(-dt / s.mouseDampening) : 1;\r
      state.mouseX += (targetX - state.mouseX) * follow;\r
      state.mouseY += (targetY - state.mouseY) * follow;\r
      const lensFollow = 1 - Math.exp(-dt * 6);\r
      state.lensX += (targetX - state.lensX) * lensFollow;\r
      state.lensY += (targetY - state.lensY) * lensFollow;\r
      state.touch += ((engaged ? 1 : 0) - state.touch) * (1 - Math.exp(-dt * (engaged ? 4 : 2)));\r
\r
      render();\r
\r
      const settling = state.intro < 1 || state.warp > 0.001 || Math.abs((engaged ? 1 : 0) - state.touch) > 0.002;\r
      if ((running && s.speed !== 0) || settling) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
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
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      if (!raf) render();\r
      wake();\r
    };\r
\r
    const locate = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const point = locate(event);\r
      pointer.x = point.x;\r
      pointer.y = point.y;\r
      pointer.inside = point.inside;\r
      wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const point = locate(event);\r
      if (!point.inside) return;\r
      pointer.x = point.x;\r
      pointer.y = point.y;\r
      pointer.inside = true;\r
      pointer.held = true;\r
      wake();\r
    };\r
\r
    const onPointerUp = () => {\r
      pointer.held = false;\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      pointer.held = false;\r
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
      canvas.removeEventListener('webglcontextlost', onContextLost);\r
      canvas.removeEventListener('webglcontextrestored', onContextRestored);\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('pointerup', onPointerUp);\r
      window.removeEventListener('pointercancel', onPointerUp);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      [scene, ...levels.flat()].forEach(target => {\r
        if (target.texture) gl.deleteTexture(target.texture);\r
        gl.deleteFramebuffer(target.framebuffer);\r
      });\r
      [streakProgram, downProgram, blurProgram, compositeProgram].forEach(item => gl.deleteProgram(item.program));\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      if (!gl.isContextLost()) gl.getExtension('WEBGL_lose_context')?.loseContext();\r
    };\r
  }, [generation]);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div\r
      ref={containerRef}\r
      className={\`lightfall-container\${className ? \` \${className}\` : ''}\`}\r
      style={{ ...(mixBlendMode ? { mixBlendMode } : null), ...style }}\r
    >\r
      <canvas ref={canvasRef} className="lightfall-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Lightfall;\r
`,o=`'use client';\r
\r
import { useEffect, useRef, useState, type CSSProperties } from 'react';\r
\r
const MAX_COLORS = 8;\r
const BLOOM_LEVELS = 4;\r
\r
export interface LightfallProps {\r
  colors?: string[];\r
  backgroundColor?: string;\r
  speed?: number;\r
  streakCount?: number;\r
  streakWidth?: number;\r
  streakLength?: number;\r
  glow?: number;\r
  density?: number;\r
  twinkle?: number;\r
  zoom?: number;\r
  backgroundGlow?: number;\r
  headGlow?: number;\r
  depth?: number;\r
  bloom?: number;\r
  opacity?: number;\r
  mouseInteraction?: boolean;\r
  mouseStrength?: number;\r
  mouseRadius?: number;\r
  mouseDampening?: number;\r
  lens?: number;\r
  holdToWarp?: boolean;\r
  intro?: boolean;\r
  fade?: number;\r
  lightMode?: boolean;\r
  mixBlendMode?: CSSProperties['mixBlendMode'];\r
  paused?: boolean;\r
  dpr?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Settings {\r
  colors: string[];\r
  backgroundColor: string;\r
  speed: number;\r
  streakCount: number;\r
  streakWidth: number;\r
  streakLength: number;\r
  glow: number;\r
  density: number;\r
  twinkle: number;\r
  zoom: number;\r
  backgroundGlow: number;\r
  headGlow: number;\r
  depth: number;\r
  bloom: number;\r
  opacity: number;\r
  mouseInteraction: boolean;\r
  mouseStrength: number;\r
  mouseRadius: number;\r
  mouseDampening: number;\r
  lens: number;\r
  holdToWarp: boolean;\r
  intro: boolean;\r
  fade: number;\r
  lightMode: boolean;\r
  paused: boolean;\r
  dpr?: number;\r
}\r
\r
type Uniforms = Record<string, WebGLUniformLocation | null>;\r
\r
interface Program {\r
  program: WebGLProgram;\r
  uniforms: Uniforms;\r
}\r
\r
interface Target {\r
  texture: WebGLTexture | null;\r
  framebuffer: WebGLFramebuffer | null;\r
  width: number;\r
  height: number;\r
}\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const STREAKS = \`#version 300 es\r
precision highp float;\r
uniform vec2 uView;\r
uniform float uZoom;\r
uniform float uPhase;\r
uniform float uTwinkleClock;\r
uniform float uRings;\r
uniform vec3 uColors[8];\r
uniform int uColorCount;\r
uniform int uStreakCount;\r
uniform int uColumns;\r
uniform float uWidth;\r
uniform float uTail;\r
uniform float uTwinkle;\r
uniform float uHead;\r
uniform float uDepth;\r
uniform vec4 uMouse;\r
uniform vec3 uLens;\r
uniform float uLightMode;\r
uniform float uEncode;\r
out vec4 outColor;\r
\r
const vec3 CAMERA = vec3(0.0, -0.8888889, -0.2222222);\r
const float TAU = 6.28318530718;\r
const float SPACING = 0.005;\r
const float REACH = 0.32;\r
\r
uint scramble(uint x) {\r
  x ^= x >> 16;\r
  x *= 0x7feb352du;\r
  x ^= x >> 15;\r
  x *= 0x846ca68bu;\r
  x ^= x >> 16;\r
  return x;\r
}\r
\r
float unit(uint x) {\r
  return float(x & 0xffffu) / 65535.0;\r
}\r
\r
float stroke(float d, float w) {\r
  float s = max(0.75 * w, 0.55);\r
  return 0.75 * w / s * exp(-0.5 * d * d / (s * s));\r
}\r
\r
float orb(float d, float r) {\r
  float s = max(0.6 * r, 0.7);\r
  float e = 0.6 * r / s;\r
  return e * e * exp(-0.5 * d * d / (s * s));\r
}\r
\r
void main() {\r
  vec2 frag = gl_FragCoord.xy;\r
  vec2 screen = (2.0 * frag - uView) / uView.x;\r
  vec2 p = screen;\r
  mat2 warp = mat2(1.0);\r
  if (uLens.z > 0.0) {\r
    vec2 o = p - uLens.xy;\r
    float e = uLens.z * exp(-dot(o, o) / (REACH * REACH));\r
    p -= o * e;\r
    warp = mat2(1.0 - e) + outerProduct(o, o) * (2.0 * e / (REACH * REACH));\r
  }\r
\r
  vec3 dir = vec3(p, uZoom);\r
  vec3 exits = (1.0 - CAMERA * sign(dir)) / max(abs(dir), vec3(1e-6));\r
  float u = min(exits.x, min(exits.y, exits.z));\r
  for (int i = 0; i < 5; i++) {\r
    vec3 h = CAMERA + u * dir;\r
    vec3 h2 = h * h;\r
    u -= (dot(h2, h2) - 1.0) / (4.0 * dot(dir, h2 * h));\r
  }\r
  vec3 hit = CAMERA + u * dir;\r
  vec3 normal = hit * hit * hit;\r
  float facing = dot(normal, dir);\r
  vec3 stepX = u * (vec3(1.0, 0.0, 0.0) - dir * (normal.x / facing));\r
  vec3 stepY = u * (vec3(0.0, 1.0, 0.0) - dir * (normal.y / facing));\r
  float ring = hit.y * hit.y + hit.z * hit.z;\r
  float theta = atan(hit.z, hit.y);\r
  mat2 jacobian = mat2(\r
    stepX.x,\r
    (hit.y * stepX.z - hit.z * stepX.y) / ring,\r
    stepY.x,\r
    (hit.y * stepY.z - hit.z * stepY.y) / ring\r
  ) * warp * (2.0 / uView.x);\r
\r
  vec2 gradX = vec2(jacobian[0][0], jacobian[1][0]);\r
  vec2 gradTheta = vec2(jacobian[0][1], jacobian[1][1]);\r
  float scale = max(length(gradX), 1e-8);\r
  float det = max(abs(gradX.x * gradTheta.y - gradX.y * gradTheta.x), 1e-12);\r
  float along = scale / det;\r
  float skew = dot(gradX, gradTheta) / det;\r
  float spacing = SPACING / scale;\r
  float detail = smoothstep(1.6, 3.2, spacing);\r
  if (detail <= 0.0) {\r
    outColor = vec4(0.0, 0.0, 0.0, 1.0);\r
    return;\r
  }\r
  float halfWidth = min(uWidth / scale, 0.2 * spacing);\r
  float headRadius = min(2.0 * uWidth / scale, 0.35 * spacing);\r
  float headReach = 4.0 * max(0.6 * headRadius, 0.7);\r
  float edge = uColumns > 1 ? 1.0 : 0.5;\r
  float period = TAU / uRings;\r
  float fog = exp(-max(u * length(dir) - 0.6, 0.0) * 1.6 * uDepth);\r
\r
  float boost = 1.0;\r
  if (uMouse.z > 0.0) {\r
    vec2 m = screen - uMouse.xy;\r
    boost += 2.0 * uMouse.z * exp(-dot(m, m) / max(uMouse.w * uMouse.w, 1e-4));\r
  }\r
\r
  int count = max(uColorCount, 1);\r
  vec3 total = vec3(0.0);\r
  for (int layer = 0; layer < 16; layer++) {\r
    if (layer >= uStreakCount) break;\r
    float x = hit.x + float(layer) * SPACING / 8.0;\r
    float nearest = floor(x / SPACING + 0.5);\r
    float side = x >= nearest * SPACING ? 1.0 : -1.0;\r
    for (int k = 0; k < 2; k++) {\r
      if (k >= uColumns) break;\r
      float column = nearest + side * float(k);\r
      float across = (x - column * SPACING) / scale;\r
      uint seed = scramble(uint(int(column) + 65536) + uint(layer) * 0x9e3779b9u);\r
      uint next = scramble(seed);\r
      float hue = unit(seed >> 16);\r
      float delta = theta - uPhase * (1.0 + floor(unit(seed) * 16.0) / 16.0) - unit(next) * period;\r
      delta -= period * floor(delta / period + 0.5);\r
      float ahead = delta * along - across * skew;\r
      if (abs(ahead) > headReach && (delta > 0.0 || -delta * uTail > 3.2)) continue;\r
      float behind = max(-delta, 0.0);\r
      float fall = exp(-uTail * behind) * (1.0 - smoothstep(0.5, 0.95, behind / (0.5 * period)));\r
      fall *= 1.0 - smoothstep(1.2, 3.2, uTail * behind);\r
      float reach = length(vec2(across, ahead));\r
      float trail = stroke(ahead > 0.0 ? reach : abs(across), halfWidth * mix(0.4, 1.0, fall)) * fall;\r
      float glint = orb(reach, headRadius) * mix(3.0, 1.8, uLightMode);\r
      float weight = mix(1.5, 1.0 + sin(uTwinkleClock + 7.0 * hue + 4.0), uTwinkle);\r
      weight *= 1.0 - smoothstep(0.72 * edge, edge, abs(across) / spacing);\r
      vec3 color = uColors[min(int(hue * float(count)), count - 1)];\r
      vec3 hot = mix(color, vec3(1.0), uHead * (1.0 - uLightMode));\r
      total += (trail * color + glint * hot) * weight;\r
    }\r
  }\r
\r
  outColor = vec4(total * fog * boost * detail * uEncode, 1.0);\r
}\`;\r
\r
const DOWNSAMPLE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uSource;\r
uniform vec2 uTarget;\r
uniform vec2 uTexel;\r
uniform float uLimit;\r
out vec4 outColor;\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uTarget;\r
  vec3 color = texture(uSource, uv - uTexel).rgb;\r
  color += texture(uSource, uv + uTexel).rgb;\r
  color += texture(uSource, uv + vec2(uTexel.x, -uTexel.y)).rgb;\r
  color += texture(uSource, uv + vec2(-uTexel.x, uTexel.y)).rgb;\r
  outColor = vec4(min(color * 0.25, vec3(uLimit)), 1.0);\r
}\`;\r
\r
const BLUR = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uSource;\r
uniform vec2 uTarget;\r
uniform vec2 uStep;\r
out vec4 outColor;\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uTarget;\r
  vec3 color = texture(uSource, uv).rgb * 0.181862;\r
  color += (texture(uSource, uv + uStep * 1.423135).rgb + texture(uSource, uv - uStep * 1.423135).rgb) * 0.284316;\r
  color += (texture(uSource, uv + uStep * 3.326702).rgb + texture(uSource, uv - uStep * 3.326702).rgb) * 0.106598;\r
  color += (texture(uSource, uv + uStep * 5.242989).rgb + texture(uSource, uv - uStep * 5.242989).rgb) * 0.018156;\r
  outColor = vec4(color, 1.0);\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uScene;\r
uniform sampler2D uBloom0;\r
uniform sampler2D uBloom1;\r
uniform sampler2D uBloom2;\r
uniform sampler2D uBloom3;\r
uniform vec2 uView;\r
uniform float uDecode;\r
uniform float uGlow;\r
uniform float uBloom;\r
uniform float uPresence;\r
uniform float uOpacity;\r
uniform float uFade;\r
uniform float uLightMode;\r
uniform vec3 uTopColor;\r
uniform float uTopGlow;\r
out vec4 outColor;\r
\r
float smootherstep01(float t) {\r
  t = clamp(t, 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uView;\r
  vec3 light = texelFetch(uScene, ivec2(gl_FragCoord.xy), 0).rgb;\r
  if (uBloom > 0.0) {\r
    vec3 halo = texture(uBloom0, uv).rgb * 0.42;\r
    halo += texture(uBloom1, uv).rgb * 0.3;\r
    halo += texture(uBloom2, uv).rgb * 0.18;\r
    halo += texture(uBloom3, uv).rgb * 0.1;\r
    light += halo * uBloom * (uLightMode > 0.5 ? 0.2 : 1.0);\r
  }\r
  light *= uDecode * uGlow * uPresence;\r
\r
  if (uLightMode < 0.5 && uTopGlow > 0.0) {\r
    float aspect = uView.x / uView.y;\r
    vec2 q = vec2((uv.x - 0.5) * aspect, 1.04 - uv.y);\r
    float spread = 0.34 * max(aspect, 0.75);\r
    float core = exp(-q.x * q.x / (spread * spread) - q.y * q.y / 0.06);\r
    float halo = exp(-q.x * q.x / (3.6 * spread * spread) - q.y * q.y / 0.18);\r
    light += uTopColor * uTopGlow * (core * 0.85 + halo * 0.3) * uPresence;\r
  }\r
\r
  vec3 lit = max(light, 0.0);\r
  vec3 mapped = sqrt(1.0 - exp(-1.3 * lit * lit / (lit + 0.025)));\r
  float peak = max(mapped.r, max(mapped.g, mapped.b));\r
\r
  float mask = uOpacity;\r
  float edge = uFade * 0.5;\r
  if (edge > 0.0) {\r
    mask *= smootherstep01(uv.x / edge) * smootherstep01((1.0 - uv.x) / edge);\r
    mask *= smootherstep01(uv.y / edge) * smootherstep01((1.0 - uv.y) / edge);\r
  }\r
  float grain = (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;\r
\r
  if (uLightMode > 0.5) {\r
    float coverage = clamp(smoothstep(0.0, 0.5, peak) * mask * 0.94 + grain, 0.0, 1.0);\r
    vec3 chroma = sqrt(clamp(lit / max(max(lit.r, max(lit.g, lit.b)), 1e-6), 0.0, 1.0));\r
    chroma = pow(chroma, vec3(1.35));\r
    chroma /= max(max(chroma.r, max(chroma.g, chroma.b)), 1e-4);\r
    float saturation = 1.0 - min(chroma.r, min(chroma.g, chroma.b));\r
    chroma = mix(vec3(0.3), chroma, smoothstep(0.08, 0.35, saturation));\r
    outColor = vec4(chroma * coverage, coverage);\r
  } else {\r
    vec3 color = clamp(mapped + grain, 0.0, 1.0) * mask;\r
    outColor = vec4(color, max(color.r, max(color.g, color.b)));\r
  }\r
}\`;\r
\r
const INTRO_SECONDS = 2.6;\r
const WARP_SPEED = 9;\r
const TAU = Math.PI * 2;\r
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
  gl.bindAttribLocation(program, 0, 'aPosition');\r
  gl.linkProgram(program);\r
  gl.deleteShader(vertex);\r
  gl.deleteShader(fragment);\r
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {\r
    gl.deleteProgram(program);\r
    return null;\r
  }\r
  const uniforms: Uniforms = {};\r
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
  for (let i = 0; i < count; i++) {\r
    const info = gl.getActiveUniform(program, i);\r
    if (info) uniforms[info.name.replace(/\\[0\\]$/, '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const Lightfall = ({\r
  colors = ['#ffffff'],\r
  backgroundColor = '#94a3b8',\r
  speed = 0.3,\r
  streakCount = 2,\r
  streakWidth = 0.8,\r
  streakLength = 1,\r
  glow = 1,\r
  density = 0.6,\r
  twinkle = 0.3,\r
  zoom = 3,\r
  backgroundGlow = 0.1,\r
  headGlow = 0.6,\r
  depth = 0.5,\r
  bloom = 0.35,\r
  opacity = 1,\r
  mouseInteraction = true,\r
  mouseStrength = 0.4,\r
  mouseRadius = 0.45,\r
  mouseDampening = 0.15,\r
  lens = 0.5,\r
  holdToWarp = true,\r
  intro = true,\r
  fade = 0,\r
  lightMode = false,\r
  mixBlendMode,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  style\r
}: LightfallProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settingsRef = useRef<Settings>(null as unknown as Settings);\r
  const [generation, setGeneration] = useState(0);\r
  settingsRef.current = {\r
    colors: (Array.isArray(colors) && colors.length ? colors : ['#ffffff']).slice(0, MAX_COLORS).map(String),\r
    backgroundColor: String(backgroundColor),\r
    speed,\r
    streakCount: Math.round(clamp(streakCount, 1, 16)),\r
    streakWidth: Math.max(0.05, streakWidth),\r
    streakLength: Math.max(0.05, streakLength),\r
    glow: Math.max(0, glow),\r
    density,\r
    twinkle: clamp(twinkle, 0, 1),\r
    zoom: Math.max(0.1, zoom),\r
    backgroundGlow: Math.max(0, backgroundGlow),\r
    headGlow: clamp(headGlow, 0, 1),\r
    depth: Math.max(0, depth),\r
    bloom: Math.max(0, bloom),\r
    opacity: clamp(opacity, 0, 1),\r
    mouseInteraction,\r
    mouseStrength: Math.max(0, mouseStrength),\r
    mouseRadius: Math.max(0.01, mouseRadius),\r
    mouseDampening: Math.max(0, mouseDampening),\r
    lens: clamp(lens, 0, 1),\r
    holdToWarp,\r
    intro,\r
    fade: clamp(fade, 0, 1),\r
    lightMode,\r
    paused,\r
    dpr\r
  };\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    const gl = canvas?.getContext('webgl2', {\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false,\r
      powerPreference: 'high-performance'\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const floatTargets = !!gl.getExtension('EXT_color_buffer_float');\r
    const streakProgram = link(gl, STREAKS);\r
    const downProgram = link(gl, DOWNSAMPLE);\r
    const blurProgram = link(gl, BLUR);\r
    const compositeProgram = link(gl, COMPOSITE);\r
    if (!streakProgram || !downProgram || !blurProgram || !compositeProgram) return undefined;\r
\r
    const onContextLost = (event: Event) => {\r
      event.preventDefault();\r
    };\r
    const onContextRestored = () => setGeneration(value => value + 1);\r
    canvas.addEventListener('webglcontextlost', onContextLost);\r
    canvas.addEventListener('webglcontextrestored', onContextRestored);\r
\r
    const buffer = gl.createBuffer();\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const format = floatTargets ? gl.RGBA16F : gl.RGBA8;\r
    const encode = floatTargets ? 1 : 0.25;\r
    const createTarget = (): Target => ({ texture: null, framebuffer: gl.createFramebuffer(), width: 0, height: 0 });\r
    const scene = createTarget();\r
    const levels = Array.from({ length: BLOOM_LEVELS }, () => [createTarget(), createTarget()]);\r
\r
    const allocate = (target: Target, width: number, height: number) => {\r
      if (target.texture && target.width === width && target.height === height) return;\r
      if (target.texture) gl.deleteTexture(target.texture);\r
      target.texture = gl.createTexture();\r
      target.width = width;\r
      target.height = height;\r
      gl.bindTexture(gl.TEXTURE_2D, target.texture);\r
      gl.texStorage2D(gl.TEXTURE_2D, 1, format, width, height);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target.texture, 0);\r
    };\r
\r
    const pass = (target: Target | null, program: Program) => {\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.framebuffer : null);\r
      gl.viewport(0, 0, target ? target.width : canvas.width, target ? target.height : canvas.height);\r
      gl.useProgram(program.program);\r
      return program.uniforms;\r
    };\r
\r
    const bind = (unit: number, texture: WebGLTexture | null) => {\r
      gl.activeTexture(gl.TEXTURE0 + unit);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
    };\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const colorCache = new Map<string, number[]>();\r
    const toRgb = (value: string): number[] => {\r
      if (colorCache.has(value)) return colorCache.get(value) as number[];\r
      let rgb = [1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#ffffff';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      colorCache.set(value, rgb);\r
      return rgb;\r
    };\r
    const toLinear = (value: string) => toRgb(value).map(channel => channel * channel);\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const palette = new Float32Array(MAX_COLORS * 3);\r
    const pointer = { x: 0, y: 0, inside: false, held: false };\r
    const state = {\r
      travel: 0,\r
      intro: settingsRef.current.intro && !reduce ? 0 : 1,\r
      mouseX: 0,\r
      mouseY: 0,\r
      lensX: 0,\r
      lensY: 0,\r
      touch: 0,\r
      warp: 0\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const width = canvas.width;\r
      const height = canvas.height;\r
      const cssWidth = Math.max(1, container.clientWidth);\r
      const cssHeight = Math.max(1, container.clientHeight);\r
      gl.bindVertexArray(vao);\r
      allocate(scene, width, height);\r
      levels.forEach((pair, index) => {\r
        const levelWidth = Math.max(1, Math.round(cssWidth / 2 ** (index + 1)));\r
        const levelHeight = Math.max(1, Math.round(cssHeight / 2 ** (index + 1)));\r
        allocate(pair[0], levelWidth, levelHeight);\r
        allocate(pair[1], levelWidth, levelHeight);\r
      });\r
\r
      const intro = state.intro;\r
      const presence = Math.min(1, intro * 2.2);\r
      const stretch = 1 + 5 * Math.pow(1 - intro, 2) + 2.5 * state.warp;\r
      const rings = Math.max(1, Math.floor(TAU * Math.max(s.density, 0.05) + 0.5));\r
      const period = TAU / rings;\r
      const clock = 9 + state.travel;\r
\r
      const list = s.colors.map(toLinear);\r
      palette.fill(0);\r
      for (let i = 0; i < MAX_COLORS; i++) palette.set(list[Math.min(i, list.length - 1)], i * 3);\r
\r
      const toScreenX = (value: number) => (2 * value - width) / width;\r
      const toScreenY = (value: number) => (2 * value - height) / width;\r
\r
      const r = pass(scene, streakProgram);\r
      gl.uniform2f(r.uView, width, height);\r
      gl.uniform1f(r.uZoom, s.zoom);\r
      gl.uniform1f(r.uPhase, clock % (16 * period));\r
      gl.uniform1f(r.uTwinkleClock, clock % TAU);\r
      gl.uniform1f(r.uRings, rings);\r
      gl.uniform3fv(r.uColors, palette);\r
      gl.uniform1i(r.uColorCount, list.length);\r
      gl.uniform1i(r.uStreakCount, s.streakCount);\r
      gl.uniform1i(r.uColumns, s.streakWidth > 1 ? 2 : 1);\r
      gl.uniform1f(r.uWidth, 5e-4 * s.streakWidth);\r
      gl.uniform1f(r.uTail, 19 / (s.streakLength * stretch));\r
      gl.uniform1f(r.uTwinkle, s.twinkle);\r
      gl.uniform1f(r.uHead, s.headGlow);\r
      gl.uniform1f(r.uDepth, s.depth);\r
      gl.uniform4f(\r
        r.uMouse,\r
        toScreenX(state.mouseX),\r
        toScreenY(state.mouseY),\r
        s.mouseInteraction ? s.mouseStrength * state.touch : 0,\r
        s.mouseRadius\r
      );\r
      gl.uniform3f(\r
        r.uLens,\r
        toScreenX(state.lensX),\r
        toScreenY(state.lensY),\r
        s.mouseInteraction ? 0.5 * s.lens * state.touch : 0\r
      );\r
      gl.uniform1f(r.uLightMode, s.lightMode ? 1 : 0);\r
      gl.uniform1f(r.uEncode, encode);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      if (s.bloom > 0) {\r
        let source = scene;\r
        levels.forEach(([front, back]) => {\r
          const d = pass(front, downProgram);\r
          bind(0, source.texture);\r
          gl.uniform1i(d.uSource, 0);\r
          gl.uniform2f(d.uTarget, front.width, front.height);\r
          gl.uniform2f(d.uTexel, 1 / source.width, 1 / source.height);\r
          gl.uniform1f(d.uLimit, 4 * encode);\r
          gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
          let b = pass(back, blurProgram);\r
          bind(0, front.texture);\r
          gl.uniform1i(b.uSource, 0);\r
          gl.uniform2f(b.uTarget, back.width, back.height);\r
          gl.uniform2f(b.uStep, 1 / front.width, 0);\r
          gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
          b = pass(front, blurProgram);\r
          bind(0, back.texture);\r
          gl.uniform1i(b.uSource, 0);\r
          gl.uniform2f(b.uTarget, front.width, front.height);\r
          gl.uniform2f(b.uStep, 0, 1 / back.height);\r
          gl.drawArrays(gl.TRIANGLES, 0, 3);\r
          source = front;\r
        });\r
      }\r
\r
      const c = pass(null, compositeProgram);\r
      bind(0, scene.texture);\r
      gl.uniform1i(c.uScene, 0);\r
      levels.forEach(([front], index) => {\r
        bind(index + 1, front.texture);\r
        gl.uniform1i(c[\`uBloom\${index}\`], index + 1);\r
      });\r
      gl.uniform2f(c.uView, width, height);\r
      gl.uniform1f(c.uDecode, 1 / encode);\r
      gl.uniform1f(c.uGlow, s.glow);\r
      gl.uniform1f(c.uBloom, s.bloom);\r
      gl.uniform1f(c.uPresence, presence);\r
      gl.uniform1f(c.uOpacity, s.opacity);\r
      gl.uniform1f(c.uFade, s.fade);\r
      gl.uniform1f(c.uLightMode, s.lightMode ? 1 : 0);\r
      gl.uniform3fv(c.uTopColor, toLinear(s.backgroundColor));\r
      gl.uniform1f(c.uTopGlow, s.backgroundGlow);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      for (let unit = BLOOM_LEVELS; unit >= 0; unit--) bind(unit, null);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      if (!s.intro || reduce) state.intro = 1;\r
      else if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / INTRO_SECONDS);\r
\r
      const holding = s.holdToWarp && pointer.held && pointer.inside && !reduce;\r
      state.warp += ((holding ? 1 : 0) - state.warp) * (1 - Math.exp(-dt * (holding ? 2.2 : 1.6)));\r
      const rush = WARP_SPEED * Math.pow(1 - state.intro, 2) + 6 * state.warp;\r
      const running = !s.paused && !reduce;\r
      if (running) state.travel += dt * 0.1 * s.speed * (1 + rush);\r
\r
      const ratio = canvas.width / Math.max(1, container.clientWidth);\r
      const targetX = pointer.x * ratio;\r
      const targetY = (container.clientHeight - pointer.y) * ratio;\r
      const engaged = s.mouseInteraction && pointer.inside && !reduce;\r
      if (engaged && state.touch < 0.01) {\r
        state.mouseX = targetX;\r
        state.mouseY = targetY;\r
        state.lensX = targetX;\r
        state.lensY = targetY;\r
      }\r
      const follow = s.mouseDampening > 0 ? 1 - Math.exp(-dt / s.mouseDampening) : 1;\r
      state.mouseX += (targetX - state.mouseX) * follow;\r
      state.mouseY += (targetY - state.mouseY) * follow;\r
      const lensFollow = 1 - Math.exp(-dt * 6);\r
      state.lensX += (targetX - state.lensX) * lensFollow;\r
      state.lensY += (targetY - state.lensY) * lensFollow;\r
      state.touch += ((engaged ? 1 : 0) - state.touch) * (1 - Math.exp(-dt * (engaged ? 4 : 2)));\r
\r
      render();\r
\r
      const settling = state.intro < 1 || state.warp > 0.001 || Math.abs((engaged ? 1 : 0) - state.touch) > 0.002;\r
      if ((running && s.speed !== 0) || settling) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
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
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      if (!raf) render();\r
      wake();\r
    };\r
\r
    const locate = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const point = locate(event);\r
      pointer.x = point.x;\r
      pointer.y = point.y;\r
      pointer.inside = point.inside;\r
      wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const point = locate(event);\r
      if (!point.inside) return;\r
      pointer.x = point.x;\r
      pointer.y = point.y;\r
      pointer.inside = true;\r
      pointer.held = true;\r
      wake();\r
    };\r
\r
    const onPointerUp = () => {\r
      pointer.held = false;\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      pointer.held = false;\r
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
      canvas.removeEventListener('webglcontextlost', onContextLost);\r
      canvas.removeEventListener('webglcontextrestored', onContextRestored);\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('pointerup', onPointerUp);\r
      window.removeEventListener('pointercancel', onPointerUp);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      [scene, ...levels.flat()].forEach(target => {\r
        if (target.texture) gl.deleteTexture(target.texture);\r
        gl.deleteFramebuffer(target.framebuffer);\r
      });\r
      [streakProgram, downProgram, blurProgram, compositeProgram].forEach(item => gl.deleteProgram(item.program));\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      if (!gl.isContextLost()) gl.getExtension('WEBGL_lose_context')?.loseContext();\r
    };\r
  }, [generation]);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div\r
      ref={containerRef}\r
      className={\`relative w-full h-full overflow-hidden \${className}\`}\r
      style={{ ...(mixBlendMode ? { mixBlendMode } : null), ...style }}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Lightfall;\r
`,a={usage:`import Lightfall from './Lightfall';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <Lightfall
    colors={['#ffffff']}
    backgroundColor="#94a3b8"
    speed={0.3}
    streakCount={2}
    streakWidth={0.8}
    twinkle={0.3}
    backgroundGlow={0.1}
    headGlow={0.6}
    bloom={0.35}
    mouseInteraction
    holdToWarp
    intro
  />
</div>`,code:r,css:n,tailwind:e,tsCode:t,tsTailwind:o};export{a as lightfall};
