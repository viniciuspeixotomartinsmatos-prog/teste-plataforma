const n=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
import './Galaxy.css';\r
\r
const MAX_LAYERS = 8;\r
const MAX_COLORS = 4;\r
const INTRO_SECONDS = 2.2;\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform float uTime;\r
uniform vec2 uResolution;\r
uniform vec2 uFocal;\r
uniform vec2 uRotation;\r
uniform float uGloss;\r
uniform float uDepth;\r
uniform float uDensity;\r
uniform float uHueShift;\r
uniform float uSpeed;\r
uniform vec2 uMouse;\r
uniform float uStarGlow;\r
uniform float uFlareGain;\r
uniform float uSquash;\r
uniform float uSaturation;\r
uniform float uMouseRepulsion;\r
uniform float uTwinkleIntensity;\r
uniform float uRotationAngle;\r
uniform float uRepulsionStrength;\r
uniform float uMouseActiveFactor;\r
uniform float uAutoCenterRepulsion;\r
uniform int uLayers;\r
uniform vec3 uColors[\${MAX_COLORS}];\r
uniform int uColorCount;\r
uniform float uWarp;\r
uniform float uReveal;\r
uniform float uMode;\r
uniform vec3 uBackground;\r
uniform float uOpacity;\r
out vec4 outColor;\r
\r
#define STAR_COLOR_CUTOFF 0.2\r
#define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)\r
#define PERIOD 3.0\r
\r
float Hash21(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
float tri(float x) {\r
  return abs(fract(x) * 2.0 - 1.0);\r
}\r
\r
float tris(float x) {\r
  float t = fract(x);\r
  return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0));\r
}\r
\r
float trisn(float x) {\r
  float t = fract(x);\r
  return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0;\r
}\r
\r
vec3 hsv2rgb(vec3 c) {\r
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\r
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\r
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\r
}\r
\r
float Star(vec2 uv, float flare, vec2 radial, float invReach) {\r
#ifdef WARP\r
  float along = dot(uv, radial);\r
  float d = sqrt(max(dot(uv, uv) - uSquash * along * along, 0.0));\r
#else\r
  float d = length(uv);\r
#endif\r
  float m = uStarGlow / d;\r
  float rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));\r
  m += rays * flare * uFlareGain;\r
  uv *= MAT45;\r
  rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));\r
  m += rays * 0.3 * flare * uFlareGain;\r
  m *= smoothstep(1.0, 0.2, d * invReach);\r
#ifdef WARP\r
  m *= mix(1.0, smoothstep(1.0, 0.55, length(uv) * invReach), min(uWarp * 4.0, 1.0));\r
#endif\r
  return m;\r
}\r
\r
vec3 StarLayer(vec2 uv, vec2 radial, vec2 repelAt, float pushCells, float spread) {\r
  vec3 col = vec3(0.0);\r
  vec2 gv = fract(uv) - 0.5;\r
  vec2 id = floor(uv);\r
  for (int y = -1; y <= 1; y++) {\r
    for (int x = -1; x <= 1; x++) {\r
      vec2 offset = vec2(float(x), float(y));\r
      vec2 si = id + offset;\r
      float seed = Hash21(si);\r
      float size = fract(seed * 345.32);\r
      float glossLocal = tri(uGloss / (PERIOD * seed + 1.0));\r
      float flareSize = smoothstep(0.9, 1.0, size) * glossLocal;\r
\r
#ifdef PALETTE\r
      float pick = Hash21(si + 7.0) * float(uColorCount);\r
      vec3 base = uColors[int(min(floor(pick), float(uColorCount - 1)))];\r
#else\r
      float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 1.0)) + STAR_COLOR_CUTOFF;\r
      float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 3.0)) + STAR_COLOR_CUTOFF;\r
      float grn = min(red, blu) * seed;\r
      vec3 base = vec3(red, grn, blu);\r
      float hue = atan(base.g - base.r, base.b - base.r) / (2.0 * 3.14159) + 0.5;\r
      hue = fract(hue + uHueShift / 360.0);\r
      float sat = length(base - vec3(dot(base, vec3(0.299, 0.587, 0.114)))) * uSaturation;\r
      float val = max(max(base.r, base.g), base.b);\r
      base = hsv2rgb(vec3(hue, sat, val));\r
#endif\r
\r
      vec2 pad = vec2(tris(seed * 34.0 + uTime * uSpeed / 10.0), tris(seed * 38.0 + uTime * uSpeed / 30.0)) - 0.5;\r
      vec2 shift = vec2(0.0);\r
      float invReach = 1.0;\r
#ifdef REPEL\r
      vec2 away = si + 0.5 + pad - repelAt;\r
      float dist = length(away);\r
      float q = dist * spread;\r
      float cells = pushCells * exp(-q * q);\r
      float moved = cells * inversesqrt(1.0 + cells * cells * 2.78);\r
      shift = away * (moved / max(dist, 0.0001));\r
      invReach = 1.0 / (1.0 - moved);\r
#endif\r
      float star = Star(gv - offset - pad - shift, flareSize, radial, invReach);\r
      float twinkle = trisn(uTime * uSpeed + seed * 6.2831) * 0.5 + 1.0;\r
      twinkle = mix(1.0, twinkle, uTwinkleIntensity);\r
      col += star * twinkle * size * base;\r
    }\r
  }\r
  return col;\r
}\r
\r
void main() {\r
  vec2 focalPx = uFocal * uResolution;\r
  vec2 uv = (gl_FragCoord.xy - focalPx) / uResolution.y;\r
  vec2 mouseNorm = uMouse - vec2(0.5);\r
\r
  vec2 repelAt = vec2(0.0);\r
  float strength = 0.0;\r
  float push = 0.0;\r
  if (uAutoCenterRepulsion > 0.0) {\r
    strength = uAutoCenterRepulsion;\r
    push = strength * 0.05;\r
  } else if (uMouseRepulsion > 0.5) {\r
    repelAt = (uMouse * uResolution - focalPx) / uResolution.y;\r
    strength = max(uRepulsionStrength, 0.0);\r
    push = strength * 0.05 * uMouseActiveFactor;\r
  } else {\r
    uv += mouseNorm * 0.1 * uMouseActiveFactor;\r
  }\r
  float radius = 0.16 + 0.04 * strength;\r
\r
  vec2 radial = length(uv) > 0.0001 ? normalize(uv) : vec2(1.0, 0.0);\r
  float angle = uRotationAngle;\r
  uv = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * uv;\r
  uv = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * uv;\r
  radial = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * radial;\r
  radial = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * radial;\r
  repelAt = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * repelAt;\r
  repelAt = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * repelAt;\r
\r
  vec3 col = vec3(0.0);\r
  float layers = float(uLayers);\r
  for (int k = 0; k < \${MAX_LAYERS}; k++) {\r
    if (k >= uLayers) break;\r
    float i = float(k) / layers;\r
    float depth = fract(i + uDepth);\r
    float scale = mix(20.0 * uDensity, 0.5 * uDensity, depth);\r
    float fade = depth * smoothstep(1.0, 0.9, depth);\r
    vec2 offset = vec2(i * 453.32);\r
    col += StarLayer(uv * scale + offset, radial, repelAt * scale + offset, push * scale, 1.0 / (scale * radius)) * fade;\r
  }\r
  col *= uReveal;\r
\r
  if (uMode > 1.5) {\r
    vec3 lit = col * smoothstep(0.0, 0.3, length(col));\r
    float energy = max(max(lit.r, lit.g), lit.b);\r
    vec3 tint = lit / max(energy, 0.0001);\r
    vec3 ink = tint * (0.16 / max(dot(tint, vec3(0.2126, 0.7152, 0.0722)), 0.16));\r
    float coverage = pow(min(energy * 1.3, 1.0), 1.3) * 0.92 * uOpacity;\r
    outColor = uMode > 2.5 ? vec4(ink * coverage, coverage) : vec4(mix(uBackground, ink, coverage), 1.0);\r
  } else if (uMode > 0.5) {\r
    float alpha = min(smoothstep(0.0, 0.3, length(col)), 1.0) * uOpacity;\r
    outColor = vec4(col * alpha, alpha);\r
  } else {\r
    outColor = vec4(mix(uBackground, col, uOpacity), 1.0);\r
  }\r
}\`;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const keyOf = (palette, repel, warp) => (palette ? 4 : 0) + (repel ? 2 : 0) + (warp ? 1 : 0);\r
\r
const start = (gl, palette, repel, warp) => {\r
  const defines = \`\${palette ? '#define PALETTE\\n' : ''}\${repel ? '#define REPEL\\n' : ''}\${warp ? '#define WARP\\n' : ''}\`;\r
  const program = gl.createProgram();\r
  const vertex = gl.createShader(gl.VERTEX_SHADER);\r
  const fragment = gl.createShader(gl.FRAGMENT_SHADER);\r
  if (!program || !vertex || !fragment) return null;\r
  gl.shaderSource(vertex, VERTEX);\r
  gl.shaderSource(fragment, FRAGMENT.replace('\\n', \`\\n\${defines}\`));\r
  gl.compileShader(vertex);\r
  gl.compileShader(fragment);\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
  gl.bindAttribLocation(program, 0, 'aPosition');\r
  gl.linkProgram(program);\r
  gl.deleteShader(vertex);\r
  gl.deleteShader(fragment);\r
  return program;\r
};\r
\r
const finish = (gl, program) => {\r
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;\r
  const uniforms = {};\r
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
  for (let i = 0; i < count; i++) {\r
    const info = gl.getActiveUniform(program, i);\r
    if (info) uniforms[info.name.replace('[0]', '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const Galaxy = ({\r
  focal = [0.5, 0.5],\r
  rotation = [1.0, 0.0],\r
  starSpeed = 0.5,\r
  density = 1,\r
  hueShift = 140,\r
  disableAnimation = false,\r
  speed = 1.0,\r
  mouseInteraction = true,\r
  glowIntensity = 0.3,\r
  saturation = 0.0,\r
  mouseRepulsion = true,\r
  repulsionStrength = 2,\r
  twinkleIntensity = 0.3,\r
  rotationSpeed = 0.1,\r
  autoCenterRepulsion = 0,\r
  transparent = true,\r
  lightMode = false,\r
  starColors,\r
  starSize = 1,\r
  flareIntensity = 1,\r
  layers = 4,\r
  direction = 'forward',\r
  clickWarp = true,\r
  intro = true,\r
  backgroundColor,\r
  opacity = 1,\r
  dpr,\r
  className = '',\r
  style,\r
  ...rest\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const palette = Array.isArray(starColors) ? starColors.filter(Boolean).slice(0, MAX_COLORS) : [];\r
  const settings = {\r
    focal: Array.isArray(focal) ? focal : [0.5, 0.5],\r
    rotation: Array.isArray(rotation) ? rotation : [1, 0],\r
    starSpeed,\r
    density: Math.max(0.01, density),\r
    hueShift,\r
    disableAnimation,\r
    speed,\r
    mouseInteraction,\r
    glowIntensity: Math.max(0, glowIntensity),\r
    saturation: Math.max(0, saturation),\r
    mouseRepulsion,\r
    repulsionStrength,\r
    twinkleIntensity: clamp(twinkleIntensity, 0, 1),\r
    rotationSpeed,\r
    autoCenterRepulsion: Math.max(0, autoCenterRepulsion),\r
    transparent,\r
    lightMode,\r
    palette,\r
    starSize: Math.max(0, starSize),\r
    flareIntensity: Math.max(0, flareIntensity),\r
    layers: clamp(Math.round(layers), 2, MAX_LAYERS),\r
    reverse: direction === 'backward',\r
    clickWarp,\r
    intro,\r
    backgroundColor,\r
    opacity: clamp(opacity, 0, 1),\r
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
    const parallel = gl.getExtension('KHR_parallel_shader_compile');\r
    const programs = new Map();\r
    const entry = (palette, repel, warp) => {\r
      const key = keyOf(palette, repel, warp);\r
      let found = programs.get(key);\r
      if (!found) {\r
        found = { program: start(gl, palette, repel, warp), linked: null, done: false };\r
        programs.set(key, found);\r
      }\r
      return found;\r
    };\r
    const variant = (palette, repel, warp, wait) => {\r
      const found = entry(palette, repel, warp);\r
      if (!found.done && found.program) {\r
        if (!wait && parallel && !gl.getProgramParameter(found.program, parallel.COMPLETION_STATUS_KHR)) return null;\r
        found.linked = finish(gl, found.program);\r
        found.done = true;\r
      }\r
      return found.linked;\r
    };\r
    const initial = settingsRef.current;\r
    if (!variant(initial.palette.length > 0, false, false, true)) {\r
      programs.forEach(found => found.program && gl.deleteProgram(found.program));\r
      return undefined;\r
    }\r
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
    const parse = (value, fallback) => {\r
      if (!value) return fallback;\r
      const key = String(value);\r
      if (cache.has(key)) return cache.get(key);\r
      let rgb = fallback;\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#000000';\r
        probe.fillStyle = key;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      cache.set(key, rgb);\r
      return rgb;\r
    };\r
    const colors = new Float32Array(MAX_COLORS * 3);\r
\r
    const pointer = { x: 0.5, y: 0.5, inside: false };\r
    const state = {\r
      time: 0,\r
      gloss: 0,\r
      depth: 0,\r
      angle: 0,\r
      mx: 0.5,\r
      my: 0.5,\r
      active: 0,\r
      boost: 0,\r
      reveal: settingsRef.current.intro && !reduce ? 0 : 1\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      s.palette.forEach((value, index) => colors.set(parse(value, [1, 1, 1]), index * 3));\r
      const mode = s.lightMode ? (s.transparent ? 3 : 2) : s.transparent ? 1 : 0;\r
      const background = parse(s.backgroundColor, s.lightMode ? [1, 1, 1] : [0, 0, 0]);\r
      const reveal = state.reveal;\r
      const palette = s.palette.length > 0;\r
      const repel = s.autoCenterRepulsion > 0 || (s.mouseRepulsion && s.repulsionStrength > 0 && state.active > 0);\r
      const warp = state.boost > 0;\r
      const base = variant(palette, false, false, true);\r
      if (!base) return;\r
      const program = (repel || warp ? variant(palette, repel, warp, false) : null) ?? base;\r
      const u = program.uniforms;\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(program.program);\r
      gl.bindVertexArray(vao);\r
      gl.uniform1f(u.uTime, state.time);\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform2f(u.uFocal, s.focal[0], s.focal[1]);\r
      gl.uniform2f(u.uRotation, s.rotation[0], s.rotation[1]);\r
      gl.uniform1f(u.uGloss, state.gloss);\r
      gl.uniform1f(u.uDepth, state.depth);\r
      gl.uniform1f(u.uDensity, s.density);\r
      gl.uniform1f(u.uHueShift, s.hueShift);\r
      gl.uniform1f(u.uSpeed, s.speed);\r
      gl.uniform2f(u.uMouse, state.mx, state.my);\r
      const stretch = 1 + state.boost * 5;\r
      gl.uniform1f(u.uStarGlow, (0.05 * s.glowIntensity * s.starSize) / Math.pow(stretch, 0.6));\r
      gl.uniform1f(u.uFlareGain, s.glowIntensity * s.flareIntensity);\r
      gl.uniform1f(u.uSquash, 1 - 1 / (stretch * stretch));\r
      gl.uniform1f(u.uSaturation, s.saturation);\r
      gl.uniform1f(u.uMouseRepulsion, s.mouseRepulsion ? 1 : 0);\r
      gl.uniform1f(u.uTwinkleIntensity, s.twinkleIntensity);\r
      gl.uniform1f(u.uRotationAngle, state.angle);\r
      gl.uniform1f(u.uRepulsionStrength, s.repulsionStrength);\r
      gl.uniform1f(u.uMouseActiveFactor, state.active);\r
      gl.uniform1f(u.uAutoCenterRepulsion, s.autoCenterRepulsion);\r
      gl.uniform1i(u.uLayers, s.layers);\r
      gl.uniform3fv(u.uColors, colors);\r
      gl.uniform1i(u.uColorCount, s.palette.length);\r
      gl.uniform1f(u.uWarp, state.boost);\r
      const fade = Math.min(1, reveal / 0.35);\r
      gl.uniform1f(u.uReveal, fade * fade * (3 - 2 * fade));\r
      gl.uniform1f(u.uMode, mode);\r
      gl.uniform3fv(u.uBackground, background);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.0005, 0.05) : 1 / 60;\r
      last = now;\r
      const motion = s.disableAnimation || reduce ? 0 : 1;\r
      if (s.intro && !reduce && state.reveal < 1) {\r
        state.reveal = Math.min(1, state.reveal + dt / INTRO_SECONDS);\r
        state.boost = Math.max(state.boost, Math.pow(1 - state.reveal, 2) * 1.4);\r
      } else if (!s.intro || reduce) {\r
        state.reveal = 1;\r
      }\r
      const flight = (s.starSpeed / 10) * (s.reverse ? -1 : 1);\r
      state.time += dt * motion;\r
      state.gloss += dt * flight * motion;\r
      state.depth += dt * flight * s.speed * motion * (1 + state.boost * 14);\r
      state.angle += dt * s.rotationSpeed * motion;\r
      state.boost *= Math.exp(-dt * 1.3);\r
      if (state.boost < 0.001) state.boost = 0;\r
\r
      const follow = 1 - Math.exp(-dt / 0.325);\r
      const engaged = s.mouseInteraction && pointer.inside && !reduce;\r
      if (engaged) {\r
        state.mx += (pointer.x - state.mx) * follow;\r
        state.my += (pointer.y - state.my) * follow;\r
      }\r
      const target = engaged ? 1 : 0;\r
      state.active += (target - state.active) * follow;\r
      if (Math.abs(target - state.active) < 0.001) state.active = target;\r
\r
      render();\r
      const busy = motion > 0 || state.boost > 0 || state.active !== target || state.reveal < 1;\r
      if (busy) raf = requestAnimationFrame(frame);\r
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
      render();\r
      wake();\r
    };\r
\r
    const locate = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      pointer.x = x / Math.max(1, rect.width);\r
      pointer.y = 1 - y / Math.max(1, rect.height);\r
    };\r
\r
    const onPointerMove = event => {\r
      locate(event);\r
      wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      locate(event);\r
      if (!pointer.inside || !s.clickWarp || reduce) return;\r
      state.boost = Math.min(1.6, state.boost + 1);\r
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
    const repelling = initial.autoCenterRepulsion > 0 || (initial.mouseInteraction && initial.mouseRepulsion);\r
    const tinted = initial.palette.length > 0;\r
    if (initial.clickWarp || initial.intro) entry(tinted, false, true);\r
    if (repelling) entry(tinted, true, false);\r
    if (repelling && initial.clickWarp) entry(tinted, true, true);\r
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
      programs.forEach(found => found.program && gl.deleteProgram(found.program));\r
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
    <div ref={containerRef} className={\`galaxy-container\${className ? \` \${className}\` : ''}\`} style={style} {...rest}>\r
      <canvas ref={canvasRef} className="galaxy-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Galaxy;\r
`,r=`.galaxy-container {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.galaxy-canvas {\r
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
const MAX_LAYERS = 8;\r
const MAX_COLORS = 4;\r
const INTRO_SECONDS = 2.2;\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform float uTime;\r
uniform vec2 uResolution;\r
uniform vec2 uFocal;\r
uniform vec2 uRotation;\r
uniform float uGloss;\r
uniform float uDepth;\r
uniform float uDensity;\r
uniform float uHueShift;\r
uniform float uSpeed;\r
uniform vec2 uMouse;\r
uniform float uStarGlow;\r
uniform float uFlareGain;\r
uniform float uSquash;\r
uniform float uSaturation;\r
uniform float uMouseRepulsion;\r
uniform float uTwinkleIntensity;\r
uniform float uRotationAngle;\r
uniform float uRepulsionStrength;\r
uniform float uMouseActiveFactor;\r
uniform float uAutoCenterRepulsion;\r
uniform int uLayers;\r
uniform vec3 uColors[\${MAX_COLORS}];\r
uniform int uColorCount;\r
uniform float uWarp;\r
uniform float uReveal;\r
uniform float uMode;\r
uniform vec3 uBackground;\r
uniform float uOpacity;\r
out vec4 outColor;\r
\r
#define STAR_COLOR_CUTOFF 0.2\r
#define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)\r
#define PERIOD 3.0\r
\r
float Hash21(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
float tri(float x) {\r
  return abs(fract(x) * 2.0 - 1.0);\r
}\r
\r
float tris(float x) {\r
  float t = fract(x);\r
  return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0));\r
}\r
\r
float trisn(float x) {\r
  float t = fract(x);\r
  return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0;\r
}\r
\r
vec3 hsv2rgb(vec3 c) {\r
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\r
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\r
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\r
}\r
\r
float Star(vec2 uv, float flare, vec2 radial, float invReach) {\r
#ifdef WARP\r
  float along = dot(uv, radial);\r
  float d = sqrt(max(dot(uv, uv) - uSquash * along * along, 0.0));\r
#else\r
  float d = length(uv);\r
#endif\r
  float m = uStarGlow / d;\r
  float rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));\r
  m += rays * flare * uFlareGain;\r
  uv *= MAT45;\r
  rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));\r
  m += rays * 0.3 * flare * uFlareGain;\r
  m *= smoothstep(1.0, 0.2, d * invReach);\r
#ifdef WARP\r
  m *= mix(1.0, smoothstep(1.0, 0.55, length(uv) * invReach), min(uWarp * 4.0, 1.0));\r
#endif\r
  return m;\r
}\r
\r
vec3 StarLayer(vec2 uv, vec2 radial, vec2 repelAt, float pushCells, float spread) {\r
  vec3 col = vec3(0.0);\r
  vec2 gv = fract(uv) - 0.5;\r
  vec2 id = floor(uv);\r
  for (int y = -1; y <= 1; y++) {\r
    for (int x = -1; x <= 1; x++) {\r
      vec2 offset = vec2(float(x), float(y));\r
      vec2 si = id + offset;\r
      float seed = Hash21(si);\r
      float size = fract(seed * 345.32);\r
      float glossLocal = tri(uGloss / (PERIOD * seed + 1.0));\r
      float flareSize = smoothstep(0.9, 1.0, size) * glossLocal;\r
\r
#ifdef PALETTE\r
      float pick = Hash21(si + 7.0) * float(uColorCount);\r
      vec3 base = uColors[int(min(floor(pick), float(uColorCount - 1)))];\r
#else\r
      float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 1.0)) + STAR_COLOR_CUTOFF;\r
      float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 3.0)) + STAR_COLOR_CUTOFF;\r
      float grn = min(red, blu) * seed;\r
      vec3 base = vec3(red, grn, blu);\r
      float hue = atan(base.g - base.r, base.b - base.r) / (2.0 * 3.14159) + 0.5;\r
      hue = fract(hue + uHueShift / 360.0);\r
      float sat = length(base - vec3(dot(base, vec3(0.299, 0.587, 0.114)))) * uSaturation;\r
      float val = max(max(base.r, base.g), base.b);\r
      base = hsv2rgb(vec3(hue, sat, val));\r
#endif\r
\r
      vec2 pad = vec2(tris(seed * 34.0 + uTime * uSpeed / 10.0), tris(seed * 38.0 + uTime * uSpeed / 30.0)) - 0.5;\r
      vec2 shift = vec2(0.0);\r
      float invReach = 1.0;\r
#ifdef REPEL\r
      vec2 away = si + 0.5 + pad - repelAt;\r
      float dist = length(away);\r
      float q = dist * spread;\r
      float cells = pushCells * exp(-q * q);\r
      float moved = cells * inversesqrt(1.0 + cells * cells * 2.78);\r
      shift = away * (moved / max(dist, 0.0001));\r
      invReach = 1.0 / (1.0 - moved);\r
#endif\r
      float star = Star(gv - offset - pad - shift, flareSize, radial, invReach);\r
      float twinkle = trisn(uTime * uSpeed + seed * 6.2831) * 0.5 + 1.0;\r
      twinkle = mix(1.0, twinkle, uTwinkleIntensity);\r
      col += star * twinkle * size * base;\r
    }\r
  }\r
  return col;\r
}\r
\r
void main() {\r
  vec2 focalPx = uFocal * uResolution;\r
  vec2 uv = (gl_FragCoord.xy - focalPx) / uResolution.y;\r
  vec2 mouseNorm = uMouse - vec2(0.5);\r
\r
  vec2 repelAt = vec2(0.0);\r
  float strength = 0.0;\r
  float push = 0.0;\r
  if (uAutoCenterRepulsion > 0.0) {\r
    strength = uAutoCenterRepulsion;\r
    push = strength * 0.05;\r
  } else if (uMouseRepulsion > 0.5) {\r
    repelAt = (uMouse * uResolution - focalPx) / uResolution.y;\r
    strength = max(uRepulsionStrength, 0.0);\r
    push = strength * 0.05 * uMouseActiveFactor;\r
  } else {\r
    uv += mouseNorm * 0.1 * uMouseActiveFactor;\r
  }\r
  float radius = 0.16 + 0.04 * strength;\r
\r
  vec2 radial = length(uv) > 0.0001 ? normalize(uv) : vec2(1.0, 0.0);\r
  float angle = uRotationAngle;\r
  uv = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * uv;\r
  uv = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * uv;\r
  radial = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * radial;\r
  radial = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * radial;\r
  repelAt = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * repelAt;\r
  repelAt = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * repelAt;\r
\r
  vec3 col = vec3(0.0);\r
  float layers = float(uLayers);\r
  for (int k = 0; k < \${MAX_LAYERS}; k++) {\r
    if (k >= uLayers) break;\r
    float i = float(k) / layers;\r
    float depth = fract(i + uDepth);\r
    float scale = mix(20.0 * uDensity, 0.5 * uDensity, depth);\r
    float fade = depth * smoothstep(1.0, 0.9, depth);\r
    vec2 offset = vec2(i * 453.32);\r
    col += StarLayer(uv * scale + offset, radial, repelAt * scale + offset, push * scale, 1.0 / (scale * radius)) * fade;\r
  }\r
  col *= uReveal;\r
\r
  if (uMode > 1.5) {\r
    vec3 lit = col * smoothstep(0.0, 0.3, length(col));\r
    float energy = max(max(lit.r, lit.g), lit.b);\r
    vec3 tint = lit / max(energy, 0.0001);\r
    vec3 ink = tint * (0.16 / max(dot(tint, vec3(0.2126, 0.7152, 0.0722)), 0.16));\r
    float coverage = pow(min(energy * 1.3, 1.0), 1.3) * 0.92 * uOpacity;\r
    outColor = uMode > 2.5 ? vec4(ink * coverage, coverage) : vec4(mix(uBackground, ink, coverage), 1.0);\r
  } else if (uMode > 0.5) {\r
    float alpha = min(smoothstep(0.0, 0.3, length(col)), 1.0) * uOpacity;\r
    outColor = vec4(col * alpha, alpha);\r
  } else {\r
    outColor = vec4(mix(uBackground, col, uOpacity), 1.0);\r
  }\r
}\`;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const keyOf = (palette, repel, warp) => (palette ? 4 : 0) + (repel ? 2 : 0) + (warp ? 1 : 0);\r
\r
const start = (gl, palette, repel, warp) => {\r
  const defines = \`\${palette ? '#define PALETTE\\n' : ''}\${repel ? '#define REPEL\\n' : ''}\${warp ? '#define WARP\\n' : ''}\`;\r
  const program = gl.createProgram();\r
  const vertex = gl.createShader(gl.VERTEX_SHADER);\r
  const fragment = gl.createShader(gl.FRAGMENT_SHADER);\r
  if (!program || !vertex || !fragment) return null;\r
  gl.shaderSource(vertex, VERTEX);\r
  gl.shaderSource(fragment, FRAGMENT.replace('\\n', \`\\n\${defines}\`));\r
  gl.compileShader(vertex);\r
  gl.compileShader(fragment);\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
  gl.bindAttribLocation(program, 0, 'aPosition');\r
  gl.linkProgram(program);\r
  gl.deleteShader(vertex);\r
  gl.deleteShader(fragment);\r
  return program;\r
};\r
\r
const finish = (gl, program) => {\r
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;\r
  const uniforms = {};\r
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
  for (let i = 0; i < count; i++) {\r
    const info = gl.getActiveUniform(program, i);\r
    if (info) uniforms[info.name.replace('[0]', '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const Galaxy = ({\r
  focal = [0.5, 0.5],\r
  rotation = [1.0, 0.0],\r
  starSpeed = 0.5,\r
  density = 1,\r
  hueShift = 140,\r
  disableAnimation = false,\r
  speed = 1.0,\r
  mouseInteraction = true,\r
  glowIntensity = 0.3,\r
  saturation = 0.0,\r
  mouseRepulsion = true,\r
  repulsionStrength = 2,\r
  twinkleIntensity = 0.3,\r
  rotationSpeed = 0.1,\r
  autoCenterRepulsion = 0,\r
  transparent = true,\r
  lightMode = false,\r
  starColors,\r
  starSize = 1,\r
  flareIntensity = 1,\r
  layers = 4,\r
  direction = 'forward',\r
  clickWarp = true,\r
  intro = true,\r
  backgroundColor,\r
  opacity = 1,\r
  dpr,\r
  className = '',\r
  style,\r
  ...rest\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const palette = Array.isArray(starColors) ? starColors.filter(Boolean).slice(0, MAX_COLORS) : [];\r
  const settings = {\r
    focal: Array.isArray(focal) ? focal : [0.5, 0.5],\r
    rotation: Array.isArray(rotation) ? rotation : [1, 0],\r
    starSpeed,\r
    density: Math.max(0.01, density),\r
    hueShift,\r
    disableAnimation,\r
    speed,\r
    mouseInteraction,\r
    glowIntensity: Math.max(0, glowIntensity),\r
    saturation: Math.max(0, saturation),\r
    mouseRepulsion,\r
    repulsionStrength,\r
    twinkleIntensity: clamp(twinkleIntensity, 0, 1),\r
    rotationSpeed,\r
    autoCenterRepulsion: Math.max(0, autoCenterRepulsion),\r
    transparent,\r
    lightMode,\r
    palette,\r
    starSize: Math.max(0, starSize),\r
    flareIntensity: Math.max(0, flareIntensity),\r
    layers: clamp(Math.round(layers), 2, MAX_LAYERS),\r
    reverse: direction === 'backward',\r
    clickWarp,\r
    intro,\r
    backgroundColor,\r
    opacity: clamp(opacity, 0, 1),\r
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
    const parallel = gl.getExtension('KHR_parallel_shader_compile');\r
    const programs = new Map();\r
    const entry = (palette, repel, warp) => {\r
      const key = keyOf(palette, repel, warp);\r
      let found = programs.get(key);\r
      if (!found) {\r
        found = { program: start(gl, palette, repel, warp), linked: null, done: false };\r
        programs.set(key, found);\r
      }\r
      return found;\r
    };\r
    const variant = (palette, repel, warp, wait) => {\r
      const found = entry(palette, repel, warp);\r
      if (!found.done && found.program) {\r
        if (!wait && parallel && !gl.getProgramParameter(found.program, parallel.COMPLETION_STATUS_KHR)) return null;\r
        found.linked = finish(gl, found.program);\r
        found.done = true;\r
      }\r
      return found.linked;\r
    };\r
    const initial = settingsRef.current;\r
    if (!variant(initial.palette.length > 0, false, false, true)) {\r
      programs.forEach(found => found.program && gl.deleteProgram(found.program));\r
      return undefined;\r
    }\r
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
    const parse = (value, fallback) => {\r
      if (!value) return fallback;\r
      const key = String(value);\r
      if (cache.has(key)) return cache.get(key);\r
      let rgb = fallback;\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#000000';\r
        probe.fillStyle = key;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      cache.set(key, rgb);\r
      return rgb;\r
    };\r
    const colors = new Float32Array(MAX_COLORS * 3);\r
\r
    const pointer = { x: 0.5, y: 0.5, inside: false };\r
    const state = {\r
      time: 0,\r
      gloss: 0,\r
      depth: 0,\r
      angle: 0,\r
      mx: 0.5,\r
      my: 0.5,\r
      active: 0,\r
      boost: 0,\r
      reveal: settingsRef.current.intro && !reduce ? 0 : 1\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      s.palette.forEach((value, index) => colors.set(parse(value, [1, 1, 1]), index * 3));\r
      const mode = s.lightMode ? (s.transparent ? 3 : 2) : s.transparent ? 1 : 0;\r
      const background = parse(s.backgroundColor, s.lightMode ? [1, 1, 1] : [0, 0, 0]);\r
      const reveal = state.reveal;\r
      const palette = s.palette.length > 0;\r
      const repel = s.autoCenterRepulsion > 0 || (s.mouseRepulsion && s.repulsionStrength > 0 && state.active > 0);\r
      const warp = state.boost > 0;\r
      const base = variant(palette, false, false, true);\r
      if (!base) return;\r
      const program = (repel || warp ? variant(palette, repel, warp, false) : null) ?? base;\r
      const u = program.uniforms;\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(program.program);\r
      gl.bindVertexArray(vao);\r
      gl.uniform1f(u.uTime, state.time);\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform2f(u.uFocal, s.focal[0], s.focal[1]);\r
      gl.uniform2f(u.uRotation, s.rotation[0], s.rotation[1]);\r
      gl.uniform1f(u.uGloss, state.gloss);\r
      gl.uniform1f(u.uDepth, state.depth);\r
      gl.uniform1f(u.uDensity, s.density);\r
      gl.uniform1f(u.uHueShift, s.hueShift);\r
      gl.uniform1f(u.uSpeed, s.speed);\r
      gl.uniform2f(u.uMouse, state.mx, state.my);\r
      const stretch = 1 + state.boost * 5;\r
      gl.uniform1f(u.uStarGlow, (0.05 * s.glowIntensity * s.starSize) / Math.pow(stretch, 0.6));\r
      gl.uniform1f(u.uFlareGain, s.glowIntensity * s.flareIntensity);\r
      gl.uniform1f(u.uSquash, 1 - 1 / (stretch * stretch));\r
      gl.uniform1f(u.uSaturation, s.saturation);\r
      gl.uniform1f(u.uMouseRepulsion, s.mouseRepulsion ? 1 : 0);\r
      gl.uniform1f(u.uTwinkleIntensity, s.twinkleIntensity);\r
      gl.uniform1f(u.uRotationAngle, state.angle);\r
      gl.uniform1f(u.uRepulsionStrength, s.repulsionStrength);\r
      gl.uniform1f(u.uMouseActiveFactor, state.active);\r
      gl.uniform1f(u.uAutoCenterRepulsion, s.autoCenterRepulsion);\r
      gl.uniform1i(u.uLayers, s.layers);\r
      gl.uniform3fv(u.uColors, colors);\r
      gl.uniform1i(u.uColorCount, s.palette.length);\r
      gl.uniform1f(u.uWarp, state.boost);\r
      const fade = Math.min(1, reveal / 0.35);\r
      gl.uniform1f(u.uReveal, fade * fade * (3 - 2 * fade));\r
      gl.uniform1f(u.uMode, mode);\r
      gl.uniform3fv(u.uBackground, background);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.0005, 0.05) : 1 / 60;\r
      last = now;\r
      const motion = s.disableAnimation || reduce ? 0 : 1;\r
      if (s.intro && !reduce && state.reveal < 1) {\r
        state.reveal = Math.min(1, state.reveal + dt / INTRO_SECONDS);\r
        state.boost = Math.max(state.boost, Math.pow(1 - state.reveal, 2) * 1.4);\r
      } else if (!s.intro || reduce) {\r
        state.reveal = 1;\r
      }\r
      const flight = (s.starSpeed / 10) * (s.reverse ? -1 : 1);\r
      state.time += dt * motion;\r
      state.gloss += dt * flight * motion;\r
      state.depth += dt * flight * s.speed * motion * (1 + state.boost * 14);\r
      state.angle += dt * s.rotationSpeed * motion;\r
      state.boost *= Math.exp(-dt * 1.3);\r
      if (state.boost < 0.001) state.boost = 0;\r
\r
      const follow = 1 - Math.exp(-dt / 0.325);\r
      const engaged = s.mouseInteraction && pointer.inside && !reduce;\r
      if (engaged) {\r
        state.mx += (pointer.x - state.mx) * follow;\r
        state.my += (pointer.y - state.my) * follow;\r
      }\r
      const target = engaged ? 1 : 0;\r
      state.active += (target - state.active) * follow;\r
      if (Math.abs(target - state.active) < 0.001) state.active = target;\r
\r
      render();\r
      const busy = motion > 0 || state.boost > 0 || state.active !== target || state.reveal < 1;\r
      if (busy) raf = requestAnimationFrame(frame);\r
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
      render();\r
      wake();\r
    };\r
\r
    const locate = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      pointer.x = x / Math.max(1, rect.width);\r
      pointer.y = 1 - y / Math.max(1, rect.height);\r
    };\r
\r
    const onPointerMove = event => {\r
      locate(event);\r
      wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      locate(event);\r
      if (!pointer.inside || !s.clickWarp || reduce) return;\r
      state.boost = Math.min(1.6, state.boost + 1);\r
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
    const repelling = initial.autoCenterRepulsion > 0 || (initial.mouseInteraction && initial.mouseRepulsion);\r
    const tinted = initial.palette.length > 0;\r
    if (initial.clickWarp || initial.intro) entry(tinted, false, true);\r
    if (repelling) entry(tinted, true, false);\r
    if (repelling && initial.clickWarp) entry(tinted, true, true);\r
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
      programs.forEach(found => found.program && gl.deleteProgram(found.program));\r
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
      className={['relative h-full w-full overflow-hidden', className].filter(Boolean).join(' ')}\r
      style={style}\r
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Galaxy;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, type HTMLAttributes } from 'react';\r
import './Galaxy.css';\r
\r
export type GalaxyDirection = 'forward' | 'backward';\r
\r
export interface GalaxyProps extends HTMLAttributes<HTMLDivElement> {\r
  focal?: [number, number];\r
  rotation?: [number, number];\r
  starSpeed?: number;\r
  density?: number;\r
  hueShift?: number;\r
  disableAnimation?: boolean;\r
  speed?: number;\r
  mouseInteraction?: boolean;\r
  glowIntensity?: number;\r
  saturation?: number;\r
  mouseRepulsion?: boolean;\r
  repulsionStrength?: number;\r
  twinkleIntensity?: number;\r
  rotationSpeed?: number;\r
  autoCenterRepulsion?: number;\r
  transparent?: boolean;\r
  lightMode?: boolean;\r
  starColors?: string[];\r
  starSize?: number;\r
  flareIntensity?: number;\r
  layers?: number;\r
  direction?: GalaxyDirection;\r
  clickWarp?: boolean;\r
  intro?: boolean;\r
  backgroundColor?: string;\r
  opacity?: number;\r
  dpr?: number;\r
}\r
\r
type Settings = {\r
  focal: number[];\r
  rotation: number[];\r
  starSpeed: number;\r
  density: number;\r
  hueShift: number;\r
  disableAnimation: boolean;\r
  speed: number;\r
  mouseInteraction: boolean;\r
  glowIntensity: number;\r
  saturation: number;\r
  mouseRepulsion: boolean;\r
  repulsionStrength: number;\r
  twinkleIntensity: number;\r
  rotationSpeed: number;\r
  autoCenterRepulsion: number;\r
  transparent: boolean;\r
  lightMode: boolean;\r
  palette: string[];\r
  starSize: number;\r
  flareIntensity: number;\r
  layers: number;\r
  reverse: boolean;\r
  clickWarp: boolean;\r
  intro: boolean;\r
  backgroundColor?: string;\r
  opacity: number;\r
  dpr?: number;\r
};\r
\r
type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };\r
\r
type Variant = { program: WebGLProgram | null; linked: Program | null; done: boolean };\r
\r
const MAX_LAYERS = 8;\r
const MAX_COLORS = 4;\r
const INTRO_SECONDS = 2.2;\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform float uTime;\r
uniform vec2 uResolution;\r
uniform vec2 uFocal;\r
uniform vec2 uRotation;\r
uniform float uGloss;\r
uniform float uDepth;\r
uniform float uDensity;\r
uniform float uHueShift;\r
uniform float uSpeed;\r
uniform vec2 uMouse;\r
uniform float uStarGlow;\r
uniform float uFlareGain;\r
uniform float uSquash;\r
uniform float uSaturation;\r
uniform float uMouseRepulsion;\r
uniform float uTwinkleIntensity;\r
uniform float uRotationAngle;\r
uniform float uRepulsionStrength;\r
uniform float uMouseActiveFactor;\r
uniform float uAutoCenterRepulsion;\r
uniform int uLayers;\r
uniform vec3 uColors[\${MAX_COLORS}];\r
uniform int uColorCount;\r
uniform float uWarp;\r
uniform float uReveal;\r
uniform float uMode;\r
uniform vec3 uBackground;\r
uniform float uOpacity;\r
out vec4 outColor;\r
\r
#define STAR_COLOR_CUTOFF 0.2\r
#define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)\r
#define PERIOD 3.0\r
\r
float Hash21(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
float tri(float x) {\r
  return abs(fract(x) * 2.0 - 1.0);\r
}\r
\r
float tris(float x) {\r
  float t = fract(x);\r
  return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0));\r
}\r
\r
float trisn(float x) {\r
  float t = fract(x);\r
  return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0;\r
}\r
\r
vec3 hsv2rgb(vec3 c) {\r
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\r
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\r
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\r
}\r
\r
float Star(vec2 uv, float flare, vec2 radial, float invReach) {\r
#ifdef WARP\r
  float along = dot(uv, radial);\r
  float d = sqrt(max(dot(uv, uv) - uSquash * along * along, 0.0));\r
#else\r
  float d = length(uv);\r
#endif\r
  float m = uStarGlow / d;\r
  float rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));\r
  m += rays * flare * uFlareGain;\r
  uv *= MAT45;\r
  rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));\r
  m += rays * 0.3 * flare * uFlareGain;\r
  m *= smoothstep(1.0, 0.2, d * invReach);\r
#ifdef WARP\r
  m *= mix(1.0, smoothstep(1.0, 0.55, length(uv) * invReach), min(uWarp * 4.0, 1.0));\r
#endif\r
  return m;\r
}\r
\r
vec3 StarLayer(vec2 uv, vec2 radial, vec2 repelAt, float pushCells, float spread) {\r
  vec3 col = vec3(0.0);\r
  vec2 gv = fract(uv) - 0.5;\r
  vec2 id = floor(uv);\r
  for (int y = -1; y <= 1; y++) {\r
    for (int x = -1; x <= 1; x++) {\r
      vec2 offset = vec2(float(x), float(y));\r
      vec2 si = id + offset;\r
      float seed = Hash21(si);\r
      float size = fract(seed * 345.32);\r
      float glossLocal = tri(uGloss / (PERIOD * seed + 1.0));\r
      float flareSize = smoothstep(0.9, 1.0, size) * glossLocal;\r
\r
#ifdef PALETTE\r
      float pick = Hash21(si + 7.0) * float(uColorCount);\r
      vec3 base = uColors[int(min(floor(pick), float(uColorCount - 1)))];\r
#else\r
      float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 1.0)) + STAR_COLOR_CUTOFF;\r
      float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 3.0)) + STAR_COLOR_CUTOFF;\r
      float grn = min(red, blu) * seed;\r
      vec3 base = vec3(red, grn, blu);\r
      float hue = atan(base.g - base.r, base.b - base.r) / (2.0 * 3.14159) + 0.5;\r
      hue = fract(hue + uHueShift / 360.0);\r
      float sat = length(base - vec3(dot(base, vec3(0.299, 0.587, 0.114)))) * uSaturation;\r
      float val = max(max(base.r, base.g), base.b);\r
      base = hsv2rgb(vec3(hue, sat, val));\r
#endif\r
\r
      vec2 pad = vec2(tris(seed * 34.0 + uTime * uSpeed / 10.0), tris(seed * 38.0 + uTime * uSpeed / 30.0)) - 0.5;\r
      vec2 shift = vec2(0.0);\r
      float invReach = 1.0;\r
#ifdef REPEL\r
      vec2 away = si + 0.5 + pad - repelAt;\r
      float dist = length(away);\r
      float q = dist * spread;\r
      float cells = pushCells * exp(-q * q);\r
      float moved = cells * inversesqrt(1.0 + cells * cells * 2.78);\r
      shift = away * (moved / max(dist, 0.0001));\r
      invReach = 1.0 / (1.0 - moved);\r
#endif\r
      float star = Star(gv - offset - pad - shift, flareSize, radial, invReach);\r
      float twinkle = trisn(uTime * uSpeed + seed * 6.2831) * 0.5 + 1.0;\r
      twinkle = mix(1.0, twinkle, uTwinkleIntensity);\r
      col += star * twinkle * size * base;\r
    }\r
  }\r
  return col;\r
}\r
\r
void main() {\r
  vec2 focalPx = uFocal * uResolution;\r
  vec2 uv = (gl_FragCoord.xy - focalPx) / uResolution.y;\r
  vec2 mouseNorm = uMouse - vec2(0.5);\r
\r
  vec2 repelAt = vec2(0.0);\r
  float strength = 0.0;\r
  float push = 0.0;\r
  if (uAutoCenterRepulsion > 0.0) {\r
    strength = uAutoCenterRepulsion;\r
    push = strength * 0.05;\r
  } else if (uMouseRepulsion > 0.5) {\r
    repelAt = (uMouse * uResolution - focalPx) / uResolution.y;\r
    strength = max(uRepulsionStrength, 0.0);\r
    push = strength * 0.05 * uMouseActiveFactor;\r
  } else {\r
    uv += mouseNorm * 0.1 * uMouseActiveFactor;\r
  }\r
  float radius = 0.16 + 0.04 * strength;\r
\r
  vec2 radial = length(uv) > 0.0001 ? normalize(uv) : vec2(1.0, 0.0);\r
  float angle = uRotationAngle;\r
  uv = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * uv;\r
  uv = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * uv;\r
  radial = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * radial;\r
  radial = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * radial;\r
  repelAt = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * repelAt;\r
  repelAt = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * repelAt;\r
\r
  vec3 col = vec3(0.0);\r
  float layers = float(uLayers);\r
  for (int k = 0; k < \${MAX_LAYERS}; k++) {\r
    if (k >= uLayers) break;\r
    float i = float(k) / layers;\r
    float depth = fract(i + uDepth);\r
    float scale = mix(20.0 * uDensity, 0.5 * uDensity, depth);\r
    float fade = depth * smoothstep(1.0, 0.9, depth);\r
    vec2 offset = vec2(i * 453.32);\r
    col += StarLayer(uv * scale + offset, radial, repelAt * scale + offset, push * scale, 1.0 / (scale * radius)) * fade;\r
  }\r
  col *= uReveal;\r
\r
  if (uMode > 1.5) {\r
    vec3 lit = col * smoothstep(0.0, 0.3, length(col));\r
    float energy = max(max(lit.r, lit.g), lit.b);\r
    vec3 tint = lit / max(energy, 0.0001);\r
    vec3 ink = tint * (0.16 / max(dot(tint, vec3(0.2126, 0.7152, 0.0722)), 0.16));\r
    float coverage = pow(min(energy * 1.3, 1.0), 1.3) * 0.92 * uOpacity;\r
    outColor = uMode > 2.5 ? vec4(ink * coverage, coverage) : vec4(mix(uBackground, ink, coverage), 1.0);\r
  } else if (uMode > 0.5) {\r
    float alpha = min(smoothstep(0.0, 0.3, length(col)), 1.0) * uOpacity;\r
    outColor = vec4(col * alpha, alpha);\r
  } else {\r
    outColor = vec4(mix(uBackground, col, uOpacity), 1.0);\r
  }\r
}\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const keyOf = (palette: boolean, repel: boolean, warp: boolean) => (palette ? 4 : 0) + (repel ? 2 : 0) + (warp ? 1 : 0);\r
\r
const start = (gl: WebGL2RenderingContext, palette: boolean, repel: boolean, warp: boolean) => {\r
  const defines = \`\${palette ? '#define PALETTE\\n' : ''}\${repel ? '#define REPEL\\n' : ''}\${warp ? '#define WARP\\n' : ''}\`;\r
  const program = gl.createProgram();\r
  const vertex = gl.createShader(gl.VERTEX_SHADER);\r
  const fragment = gl.createShader(gl.FRAGMENT_SHADER);\r
  if (!program || !vertex || !fragment) return null;\r
  gl.shaderSource(vertex, VERTEX);\r
  gl.shaderSource(fragment, FRAGMENT.replace('\\n', \`\\n\${defines}\`));\r
  gl.compileShader(vertex);\r
  gl.compileShader(fragment);\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
  gl.bindAttribLocation(program, 0, 'aPosition');\r
  gl.linkProgram(program);\r
  gl.deleteShader(vertex);\r
  gl.deleteShader(fragment);\r
  return program;\r
};\r
\r
const finish = (gl: WebGL2RenderingContext, program: WebGLProgram): Program | null => {\r
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;\r
  const uniforms: Record<string, WebGLUniformLocation | null> = {};\r
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
  for (let i = 0; i < count; i++) {\r
    const info = gl.getActiveUniform(program, i);\r
    if (info) uniforms[info.name.replace('[0]', '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const Galaxy = ({\r
  focal = [0.5, 0.5],\r
  rotation = [1.0, 0.0],\r
  starSpeed = 0.5,\r
  density = 1,\r
  hueShift = 140,\r
  disableAnimation = false,\r
  speed = 1.0,\r
  mouseInteraction = true,\r
  glowIntensity = 0.3,\r
  saturation = 0.0,\r
  mouseRepulsion = true,\r
  repulsionStrength = 2,\r
  twinkleIntensity = 0.3,\r
  rotationSpeed = 0.1,\r
  autoCenterRepulsion = 0,\r
  transparent = true,\r
  lightMode = false,\r
  starColors,\r
  starSize = 1,\r
  flareIntensity = 1,\r
  layers = 4,\r
  direction = 'forward',\r
  clickWarp = true,\r
  intro = true,\r
  backgroundColor,\r
  opacity = 1,\r
  dpr,\r
  className = '',\r
  style,\r
  ...rest\r
}: GalaxyProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const palette = Array.isArray(starColors) ? starColors.filter(Boolean).slice(0, MAX_COLORS) : [];\r
  const settings: Settings = {\r
    focal: Array.isArray(focal) ? focal : [0.5, 0.5],\r
    rotation: Array.isArray(rotation) ? rotation : [1, 0],\r
    starSpeed,\r
    density: Math.max(0.01, density),\r
    hueShift,\r
    disableAnimation,\r
    speed,\r
    mouseInteraction,\r
    glowIntensity: Math.max(0, glowIntensity),\r
    saturation: Math.max(0, saturation),\r
    mouseRepulsion,\r
    repulsionStrength,\r
    twinkleIntensity: clamp(twinkleIntensity, 0, 1),\r
    rotationSpeed,\r
    autoCenterRepulsion: Math.max(0, autoCenterRepulsion),\r
    transparent,\r
    lightMode,\r
    palette,\r
    starSize: Math.max(0, starSize),\r
    flareIntensity: Math.max(0, flareIntensity),\r
    layers: clamp(Math.round(layers), 2, MAX_LAYERS),\r
    reverse: direction === 'backward',\r
    clickWarp,\r
    intro,\r
    backgroundColor,\r
    opacity: clamp(opacity, 0, 1),\r
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
    const parallel = gl.getExtension('KHR_parallel_shader_compile');\r
    const programs = new Map<number, Variant>();\r
    const entry = (palette: boolean, repel: boolean, warp: boolean) => {\r
      const key = keyOf(palette, repel, warp);\r
      let found = programs.get(key);\r
      if (!found) {\r
        found = { program: start(gl, palette, repel, warp), linked: null, done: false };\r
        programs.set(key, found);\r
      }\r
      return found;\r
    };\r
    const variant = (palette: boolean, repel: boolean, warp: boolean, wait: boolean) => {\r
      const found = entry(palette, repel, warp);\r
      if (!found.done && found.program) {\r
        if (!wait && parallel && !gl.getProgramParameter(found.program, parallel.COMPLETION_STATUS_KHR)) return null;\r
        found.linked = finish(gl, found.program);\r
        found.done = true;\r
      }\r
      return found.linked;\r
    };\r
    const initial = settingsRef.current;\r
    if (!variant(initial.palette.length > 0, false, false, true)) {\r
      programs.forEach(found => found.program && gl.deleteProgram(found.program));\r
      return undefined;\r
    }\r
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
    const parse = (value: string | undefined, fallback: number[]): number[] => {\r
      if (!value) return fallback;\r
      const key = String(value);\r
      const cached = cache.get(key);\r
      if (cached) return cached;\r
      let rgb = fallback;\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#000000';\r
        probe.fillStyle = key;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      cache.set(key, rgb);\r
      return rgb;\r
    };\r
    const colors = new Float32Array(MAX_COLORS * 3);\r
\r
    const pointer = { x: 0.5, y: 0.5, inside: false };\r
    const state = {\r
      time: 0,\r
      gloss: 0,\r
      depth: 0,\r
      angle: 0,\r
      mx: 0.5,\r
      my: 0.5,\r
      active: 0,\r
      boost: 0,\r
      reveal: settingsRef.current.intro && !reduce ? 0 : 1\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      s.palette.forEach((value, index) => colors.set(parse(value, [1, 1, 1]), index * 3));\r
      const mode = s.lightMode ? (s.transparent ? 3 : 2) : s.transparent ? 1 : 0;\r
      const background = parse(s.backgroundColor, s.lightMode ? [1, 1, 1] : [0, 0, 0]);\r
      const reveal = state.reveal;\r
      const palette = s.palette.length > 0;\r
      const repel = s.autoCenterRepulsion > 0 || (s.mouseRepulsion && s.repulsionStrength > 0 && state.active > 0);\r
      const warp = state.boost > 0;\r
      const base = variant(palette, false, false, true);\r
      if (!base) return;\r
      const program = (repel || warp ? variant(palette, repel, warp, false) : null) ?? base;\r
      const u = program.uniforms;\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(program.program);\r
      gl.bindVertexArray(vao);\r
      gl.uniform1f(u.uTime, state.time);\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform2f(u.uFocal, s.focal[0], s.focal[1]);\r
      gl.uniform2f(u.uRotation, s.rotation[0], s.rotation[1]);\r
      gl.uniform1f(u.uGloss, state.gloss);\r
      gl.uniform1f(u.uDepth, state.depth);\r
      gl.uniform1f(u.uDensity, s.density);\r
      gl.uniform1f(u.uHueShift, s.hueShift);\r
      gl.uniform1f(u.uSpeed, s.speed);\r
      gl.uniform2f(u.uMouse, state.mx, state.my);\r
      const stretch = 1 + state.boost * 5;\r
      gl.uniform1f(u.uStarGlow, (0.05 * s.glowIntensity * s.starSize) / Math.pow(stretch, 0.6));\r
      gl.uniform1f(u.uFlareGain, s.glowIntensity * s.flareIntensity);\r
      gl.uniform1f(u.uSquash, 1 - 1 / (stretch * stretch));\r
      gl.uniform1f(u.uSaturation, s.saturation);\r
      gl.uniform1f(u.uMouseRepulsion, s.mouseRepulsion ? 1 : 0);\r
      gl.uniform1f(u.uTwinkleIntensity, s.twinkleIntensity);\r
      gl.uniform1f(u.uRotationAngle, state.angle);\r
      gl.uniform1f(u.uRepulsionStrength, s.repulsionStrength);\r
      gl.uniform1f(u.uMouseActiveFactor, state.active);\r
      gl.uniform1f(u.uAutoCenterRepulsion, s.autoCenterRepulsion);\r
      gl.uniform1i(u.uLayers, s.layers);\r
      gl.uniform3fv(u.uColors, colors);\r
      gl.uniform1i(u.uColorCount, s.palette.length);\r
      gl.uniform1f(u.uWarp, state.boost);\r
      const fade = Math.min(1, reveal / 0.35);\r
      gl.uniform1f(u.uReveal, fade * fade * (3 - 2 * fade));\r
      gl.uniform1f(u.uMode, mode);\r
      gl.uniform3fv(u.uBackground, background);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.0005, 0.05) : 1 / 60;\r
      last = now;\r
      const motion = s.disableAnimation || reduce ? 0 : 1;\r
      if (s.intro && !reduce && state.reveal < 1) {\r
        state.reveal = Math.min(1, state.reveal + dt / INTRO_SECONDS);\r
        state.boost = Math.max(state.boost, Math.pow(1 - state.reveal, 2) * 1.4);\r
      } else if (!s.intro || reduce) {\r
        state.reveal = 1;\r
      }\r
      const flight = (s.starSpeed / 10) * (s.reverse ? -1 : 1);\r
      state.time += dt * motion;\r
      state.gloss += dt * flight * motion;\r
      state.depth += dt * flight * s.speed * motion * (1 + state.boost * 14);\r
      state.angle += dt * s.rotationSpeed * motion;\r
      state.boost *= Math.exp(-dt * 1.3);\r
      if (state.boost < 0.001) state.boost = 0;\r
\r
      const follow = 1 - Math.exp(-dt / 0.325);\r
      const engaged = s.mouseInteraction && pointer.inside && !reduce;\r
      if (engaged) {\r
        state.mx += (pointer.x - state.mx) * follow;\r
        state.my += (pointer.y - state.my) * follow;\r
      }\r
      const target = engaged ? 1 : 0;\r
      state.active += (target - state.active) * follow;\r
      if (Math.abs(target - state.active) < 0.001) state.active = target;\r
\r
      render();\r
      const busy = motion > 0 || state.boost > 0 || state.active !== target || state.reveal < 1;\r
      if (busy) raf = requestAnimationFrame(frame);\r
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
      render();\r
      wake();\r
    };\r
\r
    const locate = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      pointer.x = x / Math.max(1, rect.width);\r
      pointer.y = 1 - y / Math.max(1, rect.height);\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      locate(event);\r
      wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      locate(event);\r
      if (!pointer.inside || !s.clickWarp || reduce) return;\r
      state.boost = Math.min(1.6, state.boost + 1);\r
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
    const repelling = initial.autoCenterRepulsion > 0 || (initial.mouseInteraction && initial.mouseRepulsion);\r
    const tinted = initial.palette.length > 0;\r
    if (initial.clickWarp || initial.intro) entry(tinted, false, true);\r
    if (repelling) entry(tinted, true, false);\r
    if (repelling && initial.clickWarp) entry(tinted, true, true);\r
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
      programs.forEach(found => found.program && gl.deleteProgram(found.program));\r
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
    <div ref={containerRef} className={\`galaxy-container\${className ? \` \${className}\` : ''}\`} style={style} {...rest}>\r
      <canvas ref={canvasRef} className="galaxy-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Galaxy;\r
`,o=`'use client';\r
\r
import { useEffect, useRef, type HTMLAttributes } from 'react';\r
\r
export type GalaxyDirection = 'forward' | 'backward';\r
\r
export interface GalaxyProps extends HTMLAttributes<HTMLDivElement> {\r
  focal?: [number, number];\r
  rotation?: [number, number];\r
  starSpeed?: number;\r
  density?: number;\r
  hueShift?: number;\r
  disableAnimation?: boolean;\r
  speed?: number;\r
  mouseInteraction?: boolean;\r
  glowIntensity?: number;\r
  saturation?: number;\r
  mouseRepulsion?: boolean;\r
  repulsionStrength?: number;\r
  twinkleIntensity?: number;\r
  rotationSpeed?: number;\r
  autoCenterRepulsion?: number;\r
  transparent?: boolean;\r
  lightMode?: boolean;\r
  starColors?: string[];\r
  starSize?: number;\r
  flareIntensity?: number;\r
  layers?: number;\r
  direction?: GalaxyDirection;\r
  clickWarp?: boolean;\r
  intro?: boolean;\r
  backgroundColor?: string;\r
  opacity?: number;\r
  dpr?: number;\r
}\r
\r
type Settings = {\r
  focal: number[];\r
  rotation: number[];\r
  starSpeed: number;\r
  density: number;\r
  hueShift: number;\r
  disableAnimation: boolean;\r
  speed: number;\r
  mouseInteraction: boolean;\r
  glowIntensity: number;\r
  saturation: number;\r
  mouseRepulsion: boolean;\r
  repulsionStrength: number;\r
  twinkleIntensity: number;\r
  rotationSpeed: number;\r
  autoCenterRepulsion: number;\r
  transparent: boolean;\r
  lightMode: boolean;\r
  palette: string[];\r
  starSize: number;\r
  flareIntensity: number;\r
  layers: number;\r
  reverse: boolean;\r
  clickWarp: boolean;\r
  intro: boolean;\r
  backgroundColor?: string;\r
  opacity: number;\r
  dpr?: number;\r
};\r
\r
type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };\r
\r
type Variant = { program: WebGLProgram | null; linked: Program | null; done: boolean };\r
\r
const MAX_LAYERS = 8;\r
const MAX_COLORS = 4;\r
const INTRO_SECONDS = 2.2;\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform float uTime;\r
uniform vec2 uResolution;\r
uniform vec2 uFocal;\r
uniform vec2 uRotation;\r
uniform float uGloss;\r
uniform float uDepth;\r
uniform float uDensity;\r
uniform float uHueShift;\r
uniform float uSpeed;\r
uniform vec2 uMouse;\r
uniform float uStarGlow;\r
uniform float uFlareGain;\r
uniform float uSquash;\r
uniform float uSaturation;\r
uniform float uMouseRepulsion;\r
uniform float uTwinkleIntensity;\r
uniform float uRotationAngle;\r
uniform float uRepulsionStrength;\r
uniform float uMouseActiveFactor;\r
uniform float uAutoCenterRepulsion;\r
uniform int uLayers;\r
uniform vec3 uColors[\${MAX_COLORS}];\r
uniform int uColorCount;\r
uniform float uWarp;\r
uniform float uReveal;\r
uniform float uMode;\r
uniform vec3 uBackground;\r
uniform float uOpacity;\r
out vec4 outColor;\r
\r
#define STAR_COLOR_CUTOFF 0.2\r
#define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)\r
#define PERIOD 3.0\r
\r
float Hash21(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
float tri(float x) {\r
  return abs(fract(x) * 2.0 - 1.0);\r
}\r
\r
float tris(float x) {\r
  float t = fract(x);\r
  return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0));\r
}\r
\r
float trisn(float x) {\r
  float t = fract(x);\r
  return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0;\r
}\r
\r
vec3 hsv2rgb(vec3 c) {\r
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\r
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\r
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\r
}\r
\r
float Star(vec2 uv, float flare, vec2 radial, float invReach) {\r
#ifdef WARP\r
  float along = dot(uv, radial);\r
  float d = sqrt(max(dot(uv, uv) - uSquash * along * along, 0.0));\r
#else\r
  float d = length(uv);\r
#endif\r
  float m = uStarGlow / d;\r
  float rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));\r
  m += rays * flare * uFlareGain;\r
  uv *= MAT45;\r
  rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));\r
  m += rays * 0.3 * flare * uFlareGain;\r
  m *= smoothstep(1.0, 0.2, d * invReach);\r
#ifdef WARP\r
  m *= mix(1.0, smoothstep(1.0, 0.55, length(uv) * invReach), min(uWarp * 4.0, 1.0));\r
#endif\r
  return m;\r
}\r
\r
vec3 StarLayer(vec2 uv, vec2 radial, vec2 repelAt, float pushCells, float spread) {\r
  vec3 col = vec3(0.0);\r
  vec2 gv = fract(uv) - 0.5;\r
  vec2 id = floor(uv);\r
  for (int y = -1; y <= 1; y++) {\r
    for (int x = -1; x <= 1; x++) {\r
      vec2 offset = vec2(float(x), float(y));\r
      vec2 si = id + offset;\r
      float seed = Hash21(si);\r
      float size = fract(seed * 345.32);\r
      float glossLocal = tri(uGloss / (PERIOD * seed + 1.0));\r
      float flareSize = smoothstep(0.9, 1.0, size) * glossLocal;\r
\r
#ifdef PALETTE\r
      float pick = Hash21(si + 7.0) * float(uColorCount);\r
      vec3 base = uColors[int(min(floor(pick), float(uColorCount - 1)))];\r
#else\r
      float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 1.0)) + STAR_COLOR_CUTOFF;\r
      float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 3.0)) + STAR_COLOR_CUTOFF;\r
      float grn = min(red, blu) * seed;\r
      vec3 base = vec3(red, grn, blu);\r
      float hue = atan(base.g - base.r, base.b - base.r) / (2.0 * 3.14159) + 0.5;\r
      hue = fract(hue + uHueShift / 360.0);\r
      float sat = length(base - vec3(dot(base, vec3(0.299, 0.587, 0.114)))) * uSaturation;\r
      float val = max(max(base.r, base.g), base.b);\r
      base = hsv2rgb(vec3(hue, sat, val));\r
#endif\r
\r
      vec2 pad = vec2(tris(seed * 34.0 + uTime * uSpeed / 10.0), tris(seed * 38.0 + uTime * uSpeed / 30.0)) - 0.5;\r
      vec2 shift = vec2(0.0);\r
      float invReach = 1.0;\r
#ifdef REPEL\r
      vec2 away = si + 0.5 + pad - repelAt;\r
      float dist = length(away);\r
      float q = dist * spread;\r
      float cells = pushCells * exp(-q * q);\r
      float moved = cells * inversesqrt(1.0 + cells * cells * 2.78);\r
      shift = away * (moved / max(dist, 0.0001));\r
      invReach = 1.0 / (1.0 - moved);\r
#endif\r
      float star = Star(gv - offset - pad - shift, flareSize, radial, invReach);\r
      float twinkle = trisn(uTime * uSpeed + seed * 6.2831) * 0.5 + 1.0;\r
      twinkle = mix(1.0, twinkle, uTwinkleIntensity);\r
      col += star * twinkle * size * base;\r
    }\r
  }\r
  return col;\r
}\r
\r
void main() {\r
  vec2 focalPx = uFocal * uResolution;\r
  vec2 uv = (gl_FragCoord.xy - focalPx) / uResolution.y;\r
  vec2 mouseNorm = uMouse - vec2(0.5);\r
\r
  vec2 repelAt = vec2(0.0);\r
  float strength = 0.0;\r
  float push = 0.0;\r
  if (uAutoCenterRepulsion > 0.0) {\r
    strength = uAutoCenterRepulsion;\r
    push = strength * 0.05;\r
  } else if (uMouseRepulsion > 0.5) {\r
    repelAt = (uMouse * uResolution - focalPx) / uResolution.y;\r
    strength = max(uRepulsionStrength, 0.0);\r
    push = strength * 0.05 * uMouseActiveFactor;\r
  } else {\r
    uv += mouseNorm * 0.1 * uMouseActiveFactor;\r
  }\r
  float radius = 0.16 + 0.04 * strength;\r
\r
  vec2 radial = length(uv) > 0.0001 ? normalize(uv) : vec2(1.0, 0.0);\r
  float angle = uRotationAngle;\r
  uv = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * uv;\r
  uv = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * uv;\r
  radial = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * radial;\r
  radial = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * radial;\r
  repelAt = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * repelAt;\r
  repelAt = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * repelAt;\r
\r
  vec3 col = vec3(0.0);\r
  float layers = float(uLayers);\r
  for (int k = 0; k < \${MAX_LAYERS}; k++) {\r
    if (k >= uLayers) break;\r
    float i = float(k) / layers;\r
    float depth = fract(i + uDepth);\r
    float scale = mix(20.0 * uDensity, 0.5 * uDensity, depth);\r
    float fade = depth * smoothstep(1.0, 0.9, depth);\r
    vec2 offset = vec2(i * 453.32);\r
    col += StarLayer(uv * scale + offset, radial, repelAt * scale + offset, push * scale, 1.0 / (scale * radius)) * fade;\r
  }\r
  col *= uReveal;\r
\r
  if (uMode > 1.5) {\r
    vec3 lit = col * smoothstep(0.0, 0.3, length(col));\r
    float energy = max(max(lit.r, lit.g), lit.b);\r
    vec3 tint = lit / max(energy, 0.0001);\r
    vec3 ink = tint * (0.16 / max(dot(tint, vec3(0.2126, 0.7152, 0.0722)), 0.16));\r
    float coverage = pow(min(energy * 1.3, 1.0), 1.3) * 0.92 * uOpacity;\r
    outColor = uMode > 2.5 ? vec4(ink * coverage, coverage) : vec4(mix(uBackground, ink, coverage), 1.0);\r
  } else if (uMode > 0.5) {\r
    float alpha = min(smoothstep(0.0, 0.3, length(col)), 1.0) * uOpacity;\r
    outColor = vec4(col * alpha, alpha);\r
  } else {\r
    outColor = vec4(mix(uBackground, col, uOpacity), 1.0);\r
  }\r
}\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const keyOf = (palette: boolean, repel: boolean, warp: boolean) => (palette ? 4 : 0) + (repel ? 2 : 0) + (warp ? 1 : 0);\r
\r
const start = (gl: WebGL2RenderingContext, palette: boolean, repel: boolean, warp: boolean) => {\r
  const defines = \`\${palette ? '#define PALETTE\\n' : ''}\${repel ? '#define REPEL\\n' : ''}\${warp ? '#define WARP\\n' : ''}\`;\r
  const program = gl.createProgram();\r
  const vertex = gl.createShader(gl.VERTEX_SHADER);\r
  const fragment = gl.createShader(gl.FRAGMENT_SHADER);\r
  if (!program || !vertex || !fragment) return null;\r
  gl.shaderSource(vertex, VERTEX);\r
  gl.shaderSource(fragment, FRAGMENT.replace('\\n', \`\\n\${defines}\`));\r
  gl.compileShader(vertex);\r
  gl.compileShader(fragment);\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
  gl.bindAttribLocation(program, 0, 'aPosition');\r
  gl.linkProgram(program);\r
  gl.deleteShader(vertex);\r
  gl.deleteShader(fragment);\r
  return program;\r
};\r
\r
const finish = (gl: WebGL2RenderingContext, program: WebGLProgram): Program | null => {\r
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;\r
  const uniforms: Record<string, WebGLUniformLocation | null> = {};\r
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
  for (let i = 0; i < count; i++) {\r
    const info = gl.getActiveUniform(program, i);\r
    if (info) uniforms[info.name.replace('[0]', '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const Galaxy = ({\r
  focal = [0.5, 0.5],\r
  rotation = [1.0, 0.0],\r
  starSpeed = 0.5,\r
  density = 1,\r
  hueShift = 140,\r
  disableAnimation = false,\r
  speed = 1.0,\r
  mouseInteraction = true,\r
  glowIntensity = 0.3,\r
  saturation = 0.0,\r
  mouseRepulsion = true,\r
  repulsionStrength = 2,\r
  twinkleIntensity = 0.3,\r
  rotationSpeed = 0.1,\r
  autoCenterRepulsion = 0,\r
  transparent = true,\r
  lightMode = false,\r
  starColors,\r
  starSize = 1,\r
  flareIntensity = 1,\r
  layers = 4,\r
  direction = 'forward',\r
  clickWarp = true,\r
  intro = true,\r
  backgroundColor,\r
  opacity = 1,\r
  dpr,\r
  className = '',\r
  style,\r
  ...rest\r
}: GalaxyProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const palette = Array.isArray(starColors) ? starColors.filter(Boolean).slice(0, MAX_COLORS) : [];\r
  const settings: Settings = {\r
    focal: Array.isArray(focal) ? focal : [0.5, 0.5],\r
    rotation: Array.isArray(rotation) ? rotation : [1, 0],\r
    starSpeed,\r
    density: Math.max(0.01, density),\r
    hueShift,\r
    disableAnimation,\r
    speed,\r
    mouseInteraction,\r
    glowIntensity: Math.max(0, glowIntensity),\r
    saturation: Math.max(0, saturation),\r
    mouseRepulsion,\r
    repulsionStrength,\r
    twinkleIntensity: clamp(twinkleIntensity, 0, 1),\r
    rotationSpeed,\r
    autoCenterRepulsion: Math.max(0, autoCenterRepulsion),\r
    transparent,\r
    lightMode,\r
    palette,\r
    starSize: Math.max(0, starSize),\r
    flareIntensity: Math.max(0, flareIntensity),\r
    layers: clamp(Math.round(layers), 2, MAX_LAYERS),\r
    reverse: direction === 'backward',\r
    clickWarp,\r
    intro,\r
    backgroundColor,\r
    opacity: clamp(opacity, 0, 1),\r
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
    const parallel = gl.getExtension('KHR_parallel_shader_compile');\r
    const programs = new Map<number, Variant>();\r
    const entry = (palette: boolean, repel: boolean, warp: boolean) => {\r
      const key = keyOf(palette, repel, warp);\r
      let found = programs.get(key);\r
      if (!found) {\r
        found = { program: start(gl, palette, repel, warp), linked: null, done: false };\r
        programs.set(key, found);\r
      }\r
      return found;\r
    };\r
    const variant = (palette: boolean, repel: boolean, warp: boolean, wait: boolean) => {\r
      const found = entry(palette, repel, warp);\r
      if (!found.done && found.program) {\r
        if (!wait && parallel && !gl.getProgramParameter(found.program, parallel.COMPLETION_STATUS_KHR)) return null;\r
        found.linked = finish(gl, found.program);\r
        found.done = true;\r
      }\r
      return found.linked;\r
    };\r
    const initial = settingsRef.current;\r
    if (!variant(initial.palette.length > 0, false, false, true)) {\r
      programs.forEach(found => found.program && gl.deleteProgram(found.program));\r
      return undefined;\r
    }\r
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
    const parse = (value: string | undefined, fallback: number[]): number[] => {\r
      if (!value) return fallback;\r
      const key = String(value);\r
      const cached = cache.get(key);\r
      if (cached) return cached;\r
      let rgb = fallback;\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#000000';\r
        probe.fillStyle = key;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      cache.set(key, rgb);\r
      return rgb;\r
    };\r
    const colors = new Float32Array(MAX_COLORS * 3);\r
\r
    const pointer = { x: 0.5, y: 0.5, inside: false };\r
    const state = {\r
      time: 0,\r
      gloss: 0,\r
      depth: 0,\r
      angle: 0,\r
      mx: 0.5,\r
      my: 0.5,\r
      active: 0,\r
      boost: 0,\r
      reveal: settingsRef.current.intro && !reduce ? 0 : 1\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      s.palette.forEach((value, index) => colors.set(parse(value, [1, 1, 1]), index * 3));\r
      const mode = s.lightMode ? (s.transparent ? 3 : 2) : s.transparent ? 1 : 0;\r
      const background = parse(s.backgroundColor, s.lightMode ? [1, 1, 1] : [0, 0, 0]);\r
      const reveal = state.reveal;\r
      const palette = s.palette.length > 0;\r
      const repel = s.autoCenterRepulsion > 0 || (s.mouseRepulsion && s.repulsionStrength > 0 && state.active > 0);\r
      const warp = state.boost > 0;\r
      const base = variant(palette, false, false, true);\r
      if (!base) return;\r
      const program = (repel || warp ? variant(palette, repel, warp, false) : null) ?? base;\r
      const u = program.uniforms;\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(program.program);\r
      gl.bindVertexArray(vao);\r
      gl.uniform1f(u.uTime, state.time);\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform2f(u.uFocal, s.focal[0], s.focal[1]);\r
      gl.uniform2f(u.uRotation, s.rotation[0], s.rotation[1]);\r
      gl.uniform1f(u.uGloss, state.gloss);\r
      gl.uniform1f(u.uDepth, state.depth);\r
      gl.uniform1f(u.uDensity, s.density);\r
      gl.uniform1f(u.uHueShift, s.hueShift);\r
      gl.uniform1f(u.uSpeed, s.speed);\r
      gl.uniform2f(u.uMouse, state.mx, state.my);\r
      const stretch = 1 + state.boost * 5;\r
      gl.uniform1f(u.uStarGlow, (0.05 * s.glowIntensity * s.starSize) / Math.pow(stretch, 0.6));\r
      gl.uniform1f(u.uFlareGain, s.glowIntensity * s.flareIntensity);\r
      gl.uniform1f(u.uSquash, 1 - 1 / (stretch * stretch));\r
      gl.uniform1f(u.uSaturation, s.saturation);\r
      gl.uniform1f(u.uMouseRepulsion, s.mouseRepulsion ? 1 : 0);\r
      gl.uniform1f(u.uTwinkleIntensity, s.twinkleIntensity);\r
      gl.uniform1f(u.uRotationAngle, state.angle);\r
      gl.uniform1f(u.uRepulsionStrength, s.repulsionStrength);\r
      gl.uniform1f(u.uMouseActiveFactor, state.active);\r
      gl.uniform1f(u.uAutoCenterRepulsion, s.autoCenterRepulsion);\r
      gl.uniform1i(u.uLayers, s.layers);\r
      gl.uniform3fv(u.uColors, colors);\r
      gl.uniform1i(u.uColorCount, s.palette.length);\r
      gl.uniform1f(u.uWarp, state.boost);\r
      const fade = Math.min(1, reveal / 0.35);\r
      gl.uniform1f(u.uReveal, fade * fade * (3 - 2 * fade));\r
      gl.uniform1f(u.uMode, mode);\r
      gl.uniform3fv(u.uBackground, background);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.0005, 0.05) : 1 / 60;\r
      last = now;\r
      const motion = s.disableAnimation || reduce ? 0 : 1;\r
      if (s.intro && !reduce && state.reveal < 1) {\r
        state.reveal = Math.min(1, state.reveal + dt / INTRO_SECONDS);\r
        state.boost = Math.max(state.boost, Math.pow(1 - state.reveal, 2) * 1.4);\r
      } else if (!s.intro || reduce) {\r
        state.reveal = 1;\r
      }\r
      const flight = (s.starSpeed / 10) * (s.reverse ? -1 : 1);\r
      state.time += dt * motion;\r
      state.gloss += dt * flight * motion;\r
      state.depth += dt * flight * s.speed * motion * (1 + state.boost * 14);\r
      state.angle += dt * s.rotationSpeed * motion;\r
      state.boost *= Math.exp(-dt * 1.3);\r
      if (state.boost < 0.001) state.boost = 0;\r
\r
      const follow = 1 - Math.exp(-dt / 0.325);\r
      const engaged = s.mouseInteraction && pointer.inside && !reduce;\r
      if (engaged) {\r
        state.mx += (pointer.x - state.mx) * follow;\r
        state.my += (pointer.y - state.my) * follow;\r
      }\r
      const target = engaged ? 1 : 0;\r
      state.active += (target - state.active) * follow;\r
      if (Math.abs(target - state.active) < 0.001) state.active = target;\r
\r
      render();\r
      const busy = motion > 0 || state.boost > 0 || state.active !== target || state.reveal < 1;\r
      if (busy) raf = requestAnimationFrame(frame);\r
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
      render();\r
      wake();\r
    };\r
\r
    const locate = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      pointer.x = x / Math.max(1, rect.width);\r
      pointer.y = 1 - y / Math.max(1, rect.height);\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      locate(event);\r
      wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      locate(event);\r
      if (!pointer.inside || !s.clickWarp || reduce) return;\r
      state.boost = Math.min(1.6, state.boost + 1);\r
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
    const repelling = initial.autoCenterRepulsion > 0 || (initial.mouseInteraction && initial.mouseRepulsion);\r
    const tinted = initial.palette.length > 0;\r
    if (initial.clickWarp || initial.intro) entry(tinted, false, true);\r
    if (repelling) entry(tinted, true, false);\r
    if (repelling && initial.clickWarp) entry(tinted, true, true);\r
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
      programs.forEach(found => found.program && gl.deleteProgram(found.program));\r
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
      className={['relative h-full w-full overflow-hidden', className].filter(Boolean).join(' ')}\r
      style={style}\r
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Galaxy;\r
`,a={usage:`import Galaxy from './Galaxy';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <Galaxy
    density={1}
    glowIntensity={0.3}
    flareIntensity={1}
    starSpeed={0.5}
    mouseRepulsion
    clickWarp
  />
</div>`,code:n,css:r,tailwind:e,tsCode:t,tsTailwind:o};export{a as galaxy};
