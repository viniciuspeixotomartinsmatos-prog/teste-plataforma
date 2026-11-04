const r=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
import './Prism.css';\r
\r
const INTRO_SECONDS = 1.4;\r
const PALETTE_SIZE = 64;\r
const HUE_W = [0.299, 0.587, 0.114, 0.299, 0.587, 0.114, 0.299, 0.587, 0.114];\r
const HUE_U = [0.701, -0.587, -0.114, -0.299, 0.413, -0.114, -0.3, -0.588, 0.886];\r
const HUE_V = [0.168, -0.331, 0.5, 0.328, 0.035, -0.5, -0.497, 0.296, 0.201];\r
\r
const VERTEX = \`#version 300 es\r
void main() {\r
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\r
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform vec2 uResolution;\r
uniform mat3 uRay;\r
uniform float uGlow;\r
uniform vec2 uOffset;\r
uniform float uColorFreq;\r
uniform float uCenterShift;\r
uniform float uInvBaseHalf;\r
uniform float uInvHeight;\r
uniform float uMinAxis;\r
uniform float uPxScale;\r
uniform sampler2D uPalette;\r
uniform int uUsePalette;\r
uniform float uTime;\r
uniform float uNoise;\r
uniform float uSaturation;\r
uniform mat3 uHue;\r
uniform int uUseHue;\r
uniform float uLight;\r
uniform float uNeutral;\r
out vec4 outColor;\r
\r
const vec4 PHASE_COS = vec4(1.0, 0.5403023058681398, -0.4161468365471424, -0.9899924966004454);\r
const vec4 PHASE_SIN = vec4(0.0, 0.8414709848078965, 0.9092974268256817, 0.1411200080598672);\r
\r
float rand(vec2 co) {\r
  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453123);\r
}\r
\r
float pyramid(vec3 p) {\r
  vec3 q = vec3(abs(p.x) * uInvBaseHalf, abs(p.y) * uInvHeight, abs(p.z) * uInvBaseHalf);\r
  return max((q.x + q.y + q.z - 1.0) * uMinAxis * 0.5773502691896258, -p.y);\r
}\r
\r
vec3 grade(vec3 col, vec2 seed) {\r
  col += (rand(seed) - 0.5) * uNoise;\r
  col = clamp(col, 0.0, 1.0);\r
  float L = dot(col, vec3(0.2126, 0.7152, 0.0722));\r
  col = clamp(mix(vec3(L), col, uSaturation), 0.0, 1.0);\r
  if (uUseHue == 1) col = clamp(uHue * col, 0.0, 1.0);\r
  return col;\r
}\r
\r
void main() {\r
  vec2 f = (gl_FragCoord.xy - 0.5 * uResolution - uOffset) * uPxScale;\r
  vec3 origin = uRay * vec3(f, 0.0);\r
  vec3 axis = uRay[2];\r
  float z = 5.0;\r
  vec4 o = vec4(0.0);\r
  for (int i = 0; i < 100; i++) {\r
    vec3 p = origin + axis * z;\r
    float d = 0.1 + 0.2 * abs(pyramid(p + vec3(0.0, uCenterShift, 0.0)));\r
    z -= d;\r
    float phase = (p.y + z) * uColorFreq;\r
    vec4 band = sin(phase) * PHASE_COS + cos(phase) * PHASE_SIN + 1.0;\r
    if (uUsePalette == 1) band.rgb = texture(uPalette, vec2(phase * 0.15915494309189535, 0.5)).rgb * 2.0;\r
    o += band / d;\r
  }\r
  vec4 raw = o * o * uGlow / 1e5;\r
  vec4 e = exp(2.0 * raw);\r
  vec4 mapped = (e - 1.0) / (e + 1.0);\r
  vec2 seed = gl_FragCoord.xy + vec2(uTime);\r
  if (uLight > 0.5) {\r
    float peak = max(raw.r, max(raw.g, raw.b));\r
    vec3 hue = grade(raw.rgb / max(peak, 1e-6), seed);\r
    vec3 ink = pow(hue, vec3(1.5)) * mix(0.86, 0.32, uNeutral);\r
    float strength = max(mapped.r, max(mapped.g, mapped.b)) * mapped.a;\r
    float cover = clamp(strength * 0.95 + (rand(seed.yx) - 0.5) * uNoise * 0.5, 0.0, 1.0);\r
    outColor = vec4(ink * cover, cover);\r
  } else {\r
    outColor = vec4(grade(mapped.rgb, seed) * mapped.a, mapped.a);\r
  }\r
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
const rotation = (yaw, pitch, roll) => {\r
  const cy = Math.cos(yaw);\r
  const sy = Math.sin(yaw);\r
  const cx = Math.cos(pitch);\r
  const sx = Math.sin(pitch);\r
  const cz = Math.cos(roll);\r
  const sz = Math.sin(roll);\r
  return [\r
    cy * cz + sy * sx * sz,\r
    cx * sz,\r
    -sy * cz + cy * sx * sz,\r
    -cy * sz + sy * sx * cz,\r
    cx * cz,\r
    sy * sz + cy * sx * cz,\r
    sy * cx,\r
    -sx,\r
    cy * cx\r
  ];\r
};\r
\r
const multiply = (a, b) => {\r
  const out = new Array(9);\r
  for (let c = 0; c < 3; c++) {\r
    for (let r = 0; r < 3; r++) {\r
      out[c * 3 + r] = a[r] * b[c * 3] + a[3 + r] * b[c * 3 + 1] + a[6 + r] * b[c * 3 + 2];\r
    }\r
  }\r
  return out;\r
};\r
\r
const Prism = ({\r
  height = 3.5,\r
  baseWidth = 5.5,\r
  animationType = 'rotate',\r
  glow = 1,\r
  offset,\r
  noise = 0,\r
  scale = 3.6,\r
  hueShift = 0,\r
  colorFrequency = 1,\r
  colors,\r
  saturation = 1.5,\r
  timeScale = 0.5,\r
  interactive = true,\r
  hoverStrength = 2,\r
  inertia = 0.05,\r
  intro = true,\r
  resolution = 0.5,\r
  lightMode = false,\r
  dpr,\r
  className = '',\r
  style,\r
  ...rest\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const palette = Array.isArray(colors) ? colors.filter(Boolean).slice(0, 8) : [];\r
  const settings = {\r
    height: Math.max(0.1, height),\r
    baseWidth: Math.max(0.1, baseWidth),\r
    animationType: animationType === 'rotate3d' ? '3drotate' : animationType,\r
    glow: Math.max(0, glow),\r
    offsetX: offset?.x ?? 0,\r
    offsetY: offset?.y ?? 0,\r
    noise: Math.max(0, noise),\r
    scale: Math.max(0.1, scale),\r
    hueShift: ((hueShift || 0) * Math.PI) / 180,\r
    colorFrequency: Math.max(0, colorFrequency),\r
    colors: palette,\r
    saturation: Math.max(0, saturation),\r
    timeScale: Math.max(0, timeScale),\r
    interactive,\r
    hoverStrength: Math.max(0, hoverStrength),\r
    inertia: clamp(inertia, 0.001, 1),\r
    intro,\r
    resolution: clamp(resolution, 0.25, 1),\r
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
    const shader = link(gl);\r
    if (!shader) return undefined;\r
    const u = shader.uniforms;\r
    const vao = gl.createVertexArray();\r
    const paletteTexture = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, paletteTexture);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, PALETTE_SIZE, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const parse = value => {\r
      if (!probe) return [255, 255, 255];\r
      probe.clearRect(0, 0, 1, 1);\r
      probe.fillStyle = '#000000';\r
      probe.fillStyle = String(value);\r
      probe.fillRect(0, 0, 1, 1);\r
      const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
      return [r, g, b];\r
    };\r
    let paletteKey = '';\r
    let neutral = 0;\r
    const syncPalette = colorsList => {\r
      const key = colorsList.join(',');\r
      if (key === paletteKey) return;\r
      paletteKey = key;\r
      neutral = 0;\r
      if (!colorsList.length) return;\r
      const stops = colorsList.map(parse);\r
      neutral =\r
        1 -\r
        stops.reduce((sum, [r, g, b]) => {\r
          const top = Math.max(r, g, b);\r
          return sum + (top > 0 ? (top - Math.min(r, g, b)) / top : 0);\r
        }, 0) /\r
          stops.length;\r
      const data = new Uint8Array(PALETTE_SIZE * 4);\r
      for (let i = 0; i < PALETTE_SIZE; i++) {\r
        const position = (i / PALETTE_SIZE) * stops.length;\r
        const index = Math.floor(position);\r
        const a = stops[index % stops.length];\r
        const b = stops[(index + 1) % stops.length];\r
        const t = position - index;\r
        const k = t * t * (3 - 2 * t);\r
        for (let c = 0; c < 3; c++) data[i * 4 + c] = Math.round(a[c] + (b[c] - a[c]) * k);\r
        data[i * 4 + 3] = 255;\r
      }\r
      gl.bindTexture(gl.TEXTURE_2D, paletteTexture);\r
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, PALETTE_SIZE, 1, gl.RGBA, gl.UNSIGNED_BYTE, data);\r
    };\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1, scale: 1 };\r
    const pose = { yaw: 0, pitch: 0, roll: 0 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    let time = 0;\r
    let introClock = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const orientation = s => {\r
      const tilt = rotation(pose.yaw, pose.pitch, pose.roll);\r
      if (s.animationType === 'rotate') {\r
        const t = time * s.timeScale;\r
        const c0 = Math.cos(t);\r
        const c1 = Math.cos(t + 33);\r
        const c2 = Math.cos(t + 11);\r
        return multiply(tilt, [c0, 0, c2, 0, 1, 0, c1, 0, c0]);\r
      }\r
      if (s.animationType === '3drotate') {\r
        const t = time * s.timeScale;\r
        return multiply(tilt, rotation(t * 0.55, Math.sin(t * 0.6 + 0.6) * 0.6, Math.sin(t * 0.35 + 1.9) * 0.5));\r
      }\r
      return tilt;\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      syncPalette(s.colors);\r
      const half = s.baseWidth * 0.5;\r
      const ignite = introClock * introClock * (3 - 2 * introClock);\r
      const c = Math.cos(s.hueShift);\r
      const sn = Math.sin(s.hueShift);\r
      gl.bindVertexArray(vao);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(shader.program);\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniformMatrix3fv(u.uRay, false, orientation(s));\r
      gl.uniform1f(u.uGlow, s.glow * ignite * ignite);\r
      gl.uniform2f(u.uOffset, s.offsetX * view.scale, -s.offsetY * view.scale);\r
      gl.uniform1f(u.uColorFreq, s.colorFrequency);\r
      gl.uniform1f(u.uCenterShift, s.height * 0.25);\r
      gl.uniform1f(u.uInvBaseHalf, 1 / half);\r
      gl.uniform1f(u.uInvHeight, 1 / s.height);\r
      gl.uniform1f(u.uMinAxis, Math.min(half, s.height));\r
      gl.uniform1f(u.uPxScale, 1 / (canvas.height * 0.1 * s.scale));\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, paletteTexture);\r
      gl.uniform1i(u.uPalette, 0);\r
      gl.uniform1i(u.uUsePalette, s.colors.length ? 1 : 0);\r
      gl.uniform1f(u.uTime, time);\r
      gl.uniform1f(u.uNoise, s.noise);\r
      gl.uniform1f(u.uSaturation, s.saturation);\r
      gl.uniformMatrix3fv(\r
        u.uHue,\r
        false,\r
        HUE_W.map((w, i) => w + HUE_U[i] * c + HUE_V[i] * sn)\r
      );\r
      gl.uniform1i(u.uUseHue, Math.abs(s.hueShift) > 0.0001 ? 1 : 0);\r
      gl.uniform1f(u.uLight, s.lightMode ? 1 : 0);\r
      gl.uniform1f(u.uNeutral, neutral);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      view.width = Math.max(1, container.clientWidth);\r
      view.height = Math.max(1, container.clientHeight);\r
      view.scale = Math.min(s.dpr || window.devicePixelRatio || 1, 2) * s.resolution;\r
      canvas.width = Math.max(1, Math.round(view.width * view.scale));\r
      canvas.height = Math.max(1, Math.round(view.height * view.scale));\r
      draw();\r
      wake();\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      if (Math.round(view.width * Math.min(s.dpr || window.devicePixelRatio || 1, 2) * s.resolution) !== canvas.width) {\r
        resize();\r
        return;\r
      }\r
      const dt = last ? clamp((now - last) / 1000, 0.001, 0.05) : 1 / 60;\r
      last = now;\r
      if (!reduce) time += dt;\r
      if (introClock < 1) introClock = Math.min(1, introClock + dt / INTRO_SECONDS);\r
      const hover = s.animationType === 'hover';\r
      const aim = pointer.inside && !reduce && (hover || s.interactive);\r
      const reach = (hover ? 0.6 : 0.09) * s.hoverStrength;\r
      const yaw = aim ? -pointer.x * reach : 0;\r
      const pitch = aim ? pointer.y * reach : 0;\r
      const follow = 1 - Math.pow(1 - s.inertia, dt * 60);\r
      pose.yaw += (yaw - pose.yaw) * follow;\r
      pose.pitch += (pitch - pose.pitch) * follow;\r
      pose.roll += (0 - pose.roll) * (1 - Math.pow(0.9, dt * 60));\r
      draw();\r
      const settling = Math.abs(yaw - pose.yaw) + Math.abs(pitch - pose.pitch) + Math.abs(pose.roll) > 1e-4;\r
      const spinning = !reduce && !hover && s.animationType !== 'static' && s.timeScale > 0;\r
      const busy = spinning || settling || introClock < 1 || (!reduce && s.noise > 0);\r
      if (busy) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    function wake() {\r
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    }\r
\r
    const onPointerMove = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = ((event.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;\r
      const y = ((event.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1;\r
      pointer.inside = Math.abs(x) <= 1 && Math.abs(y) <= 1;\r
      pointer.x = clamp(x, -1, 1);\r
      pointer.y = clamp(y, -1, 1);\r
      const s = settingsRef.current;\r
      if (s.interactive || s.animationType === 'hover') wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
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
    window.addEventListener('blur', onPointerLeave);\r
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
      window.removeEventListener('blur', onPointerLeave);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteTexture(paletteTexture);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(shader.program);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div ref={containerRef} className={\`prism\${className ? \` \${className}\` : ''}\`} style={style} {...rest}>\r
      <canvas ref={canvasRef} className="prism-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Prism;\r
`,n=`.prism {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.prism-canvas {\r
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
const INTRO_SECONDS = 1.4;\r
const PALETTE_SIZE = 64;\r
const HUE_W = [0.299, 0.587, 0.114, 0.299, 0.587, 0.114, 0.299, 0.587, 0.114];\r
const HUE_U = [0.701, -0.587, -0.114, -0.299, 0.413, -0.114, -0.3, -0.588, 0.886];\r
const HUE_V = [0.168, -0.331, 0.5, 0.328, 0.035, -0.5, -0.497, 0.296, 0.201];\r
\r
const VERTEX = \`#version 300 es\r
void main() {\r
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\r
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform vec2 uResolution;\r
uniform mat3 uRay;\r
uniform float uGlow;\r
uniform vec2 uOffset;\r
uniform float uColorFreq;\r
uniform float uCenterShift;\r
uniform float uInvBaseHalf;\r
uniform float uInvHeight;\r
uniform float uMinAxis;\r
uniform float uPxScale;\r
uniform sampler2D uPalette;\r
uniform int uUsePalette;\r
uniform float uTime;\r
uniform float uNoise;\r
uniform float uSaturation;\r
uniform mat3 uHue;\r
uniform int uUseHue;\r
uniform float uLight;\r
uniform float uNeutral;\r
out vec4 outColor;\r
\r
const vec4 PHASE_COS = vec4(1.0, 0.5403023058681398, -0.4161468365471424, -0.9899924966004454);\r
const vec4 PHASE_SIN = vec4(0.0, 0.8414709848078965, 0.9092974268256817, 0.1411200080598672);\r
\r
float rand(vec2 co) {\r
  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453123);\r
}\r
\r
float pyramid(vec3 p) {\r
  vec3 q = vec3(abs(p.x) * uInvBaseHalf, abs(p.y) * uInvHeight, abs(p.z) * uInvBaseHalf);\r
  return max((q.x + q.y + q.z - 1.0) * uMinAxis * 0.5773502691896258, -p.y);\r
}\r
\r
vec3 grade(vec3 col, vec2 seed) {\r
  col += (rand(seed) - 0.5) * uNoise;\r
  col = clamp(col, 0.0, 1.0);\r
  float L = dot(col, vec3(0.2126, 0.7152, 0.0722));\r
  col = clamp(mix(vec3(L), col, uSaturation), 0.0, 1.0);\r
  if (uUseHue == 1) col = clamp(uHue * col, 0.0, 1.0);\r
  return col;\r
}\r
\r
void main() {\r
  vec2 f = (gl_FragCoord.xy - 0.5 * uResolution - uOffset) * uPxScale;\r
  vec3 origin = uRay * vec3(f, 0.0);\r
  vec3 axis = uRay[2];\r
  float z = 5.0;\r
  vec4 o = vec4(0.0);\r
  for (int i = 0; i < 100; i++) {\r
    vec3 p = origin + axis * z;\r
    float d = 0.1 + 0.2 * abs(pyramid(p + vec3(0.0, uCenterShift, 0.0)));\r
    z -= d;\r
    float phase = (p.y + z) * uColorFreq;\r
    vec4 band = sin(phase) * PHASE_COS + cos(phase) * PHASE_SIN + 1.0;\r
    if (uUsePalette == 1) band.rgb = texture(uPalette, vec2(phase * 0.15915494309189535, 0.5)).rgb * 2.0;\r
    o += band / d;\r
  }\r
  vec4 raw = o * o * uGlow / 1e5;\r
  vec4 e = exp(2.0 * raw);\r
  vec4 mapped = (e - 1.0) / (e + 1.0);\r
  vec2 seed = gl_FragCoord.xy + vec2(uTime);\r
  if (uLight > 0.5) {\r
    float peak = max(raw.r, max(raw.g, raw.b));\r
    vec3 hue = grade(raw.rgb / max(peak, 1e-6), seed);\r
    vec3 ink = pow(hue, vec3(1.5)) * mix(0.86, 0.32, uNeutral);\r
    float strength = max(mapped.r, max(mapped.g, mapped.b)) * mapped.a;\r
    float cover = clamp(strength * 0.95 + (rand(seed.yx) - 0.5) * uNoise * 0.5, 0.0, 1.0);\r
    outColor = vec4(ink * cover, cover);\r
  } else {\r
    outColor = vec4(grade(mapped.rgb, seed) * mapped.a, mapped.a);\r
  }\r
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
const rotation = (yaw, pitch, roll) => {\r
  const cy = Math.cos(yaw);\r
  const sy = Math.sin(yaw);\r
  const cx = Math.cos(pitch);\r
  const sx = Math.sin(pitch);\r
  const cz = Math.cos(roll);\r
  const sz = Math.sin(roll);\r
  return [\r
    cy * cz + sy * sx * sz,\r
    cx * sz,\r
    -sy * cz + cy * sx * sz,\r
    -cy * sz + sy * sx * cz,\r
    cx * cz,\r
    sy * sz + cy * sx * cz,\r
    sy * cx,\r
    -sx,\r
    cy * cx\r
  ];\r
};\r
\r
const multiply = (a, b) => {\r
  const out = new Array(9);\r
  for (let c = 0; c < 3; c++) {\r
    for (let r = 0; r < 3; r++) {\r
      out[c * 3 + r] = a[r] * b[c * 3] + a[3 + r] * b[c * 3 + 1] + a[6 + r] * b[c * 3 + 2];\r
    }\r
  }\r
  return out;\r
};\r
\r
const Prism = ({\r
  height = 3.5,\r
  baseWidth = 5.5,\r
  animationType = 'rotate',\r
  glow = 1,\r
  offset,\r
  noise = 0,\r
  scale = 3.6,\r
  hueShift = 0,\r
  colorFrequency = 1,\r
  colors,\r
  saturation = 1.5,\r
  timeScale = 0.5,\r
  interactive = true,\r
  hoverStrength = 2,\r
  inertia = 0.05,\r
  intro = true,\r
  resolution = 0.5,\r
  lightMode = false,\r
  dpr,\r
  className = '',\r
  style,\r
  ...rest\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const palette = Array.isArray(colors) ? colors.filter(Boolean).slice(0, 8) : [];\r
  const settings = {\r
    height: Math.max(0.1, height),\r
    baseWidth: Math.max(0.1, baseWidth),\r
    animationType: animationType === 'rotate3d' ? '3drotate' : animationType,\r
    glow: Math.max(0, glow),\r
    offsetX: offset?.x ?? 0,\r
    offsetY: offset?.y ?? 0,\r
    noise: Math.max(0, noise),\r
    scale: Math.max(0.1, scale),\r
    hueShift: ((hueShift || 0) * Math.PI) / 180,\r
    colorFrequency: Math.max(0, colorFrequency),\r
    colors: palette,\r
    saturation: Math.max(0, saturation),\r
    timeScale: Math.max(0, timeScale),\r
    interactive,\r
    hoverStrength: Math.max(0, hoverStrength),\r
    inertia: clamp(inertia, 0.001, 1),\r
    intro,\r
    resolution: clamp(resolution, 0.25, 1),\r
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
    const shader = link(gl);\r
    if (!shader) return undefined;\r
    const u = shader.uniforms;\r
    const vao = gl.createVertexArray();\r
    const paletteTexture = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, paletteTexture);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, PALETTE_SIZE, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const parse = value => {\r
      if (!probe) return [255, 255, 255];\r
      probe.clearRect(0, 0, 1, 1);\r
      probe.fillStyle = '#000000';\r
      probe.fillStyle = String(value);\r
      probe.fillRect(0, 0, 1, 1);\r
      const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
      return [r, g, b];\r
    };\r
    let paletteKey = '';\r
    let neutral = 0;\r
    const syncPalette = colorsList => {\r
      const key = colorsList.join(',');\r
      if (key === paletteKey) return;\r
      paletteKey = key;\r
      neutral = 0;\r
      if (!colorsList.length) return;\r
      const stops = colorsList.map(parse);\r
      neutral =\r
        1 -\r
        stops.reduce((sum, [r, g, b]) => {\r
          const top = Math.max(r, g, b);\r
          return sum + (top > 0 ? (top - Math.min(r, g, b)) / top : 0);\r
        }, 0) /\r
          stops.length;\r
      const data = new Uint8Array(PALETTE_SIZE * 4);\r
      for (let i = 0; i < PALETTE_SIZE; i++) {\r
        const position = (i / PALETTE_SIZE) * stops.length;\r
        const index = Math.floor(position);\r
        const a = stops[index % stops.length];\r
        const b = stops[(index + 1) % stops.length];\r
        const t = position - index;\r
        const k = t * t * (3 - 2 * t);\r
        for (let c = 0; c < 3; c++) data[i * 4 + c] = Math.round(a[c] + (b[c] - a[c]) * k);\r
        data[i * 4 + 3] = 255;\r
      }\r
      gl.bindTexture(gl.TEXTURE_2D, paletteTexture);\r
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, PALETTE_SIZE, 1, gl.RGBA, gl.UNSIGNED_BYTE, data);\r
    };\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1, scale: 1 };\r
    const pose = { yaw: 0, pitch: 0, roll: 0 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    let time = 0;\r
    let introClock = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const orientation = s => {\r
      const tilt = rotation(pose.yaw, pose.pitch, pose.roll);\r
      if (s.animationType === 'rotate') {\r
        const t = time * s.timeScale;\r
        const c0 = Math.cos(t);\r
        const c1 = Math.cos(t + 33);\r
        const c2 = Math.cos(t + 11);\r
        return multiply(tilt, [c0, 0, c2, 0, 1, 0, c1, 0, c0]);\r
      }\r
      if (s.animationType === '3drotate') {\r
        const t = time * s.timeScale;\r
        return multiply(tilt, rotation(t * 0.55, Math.sin(t * 0.6 + 0.6) * 0.6, Math.sin(t * 0.35 + 1.9) * 0.5));\r
      }\r
      return tilt;\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      syncPalette(s.colors);\r
      const half = s.baseWidth * 0.5;\r
      const ignite = introClock * introClock * (3 - 2 * introClock);\r
      const c = Math.cos(s.hueShift);\r
      const sn = Math.sin(s.hueShift);\r
      gl.bindVertexArray(vao);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(shader.program);\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniformMatrix3fv(u.uRay, false, orientation(s));\r
      gl.uniform1f(u.uGlow, s.glow * ignite * ignite);\r
      gl.uniform2f(u.uOffset, s.offsetX * view.scale, -s.offsetY * view.scale);\r
      gl.uniform1f(u.uColorFreq, s.colorFrequency);\r
      gl.uniform1f(u.uCenterShift, s.height * 0.25);\r
      gl.uniform1f(u.uInvBaseHalf, 1 / half);\r
      gl.uniform1f(u.uInvHeight, 1 / s.height);\r
      gl.uniform1f(u.uMinAxis, Math.min(half, s.height));\r
      gl.uniform1f(u.uPxScale, 1 / (canvas.height * 0.1 * s.scale));\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, paletteTexture);\r
      gl.uniform1i(u.uPalette, 0);\r
      gl.uniform1i(u.uUsePalette, s.colors.length ? 1 : 0);\r
      gl.uniform1f(u.uTime, time);\r
      gl.uniform1f(u.uNoise, s.noise);\r
      gl.uniform1f(u.uSaturation, s.saturation);\r
      gl.uniformMatrix3fv(\r
        u.uHue,\r
        false,\r
        HUE_W.map((w, i) => w + HUE_U[i] * c + HUE_V[i] * sn)\r
      );\r
      gl.uniform1i(u.uUseHue, Math.abs(s.hueShift) > 0.0001 ? 1 : 0);\r
      gl.uniform1f(u.uLight, s.lightMode ? 1 : 0);\r
      gl.uniform1f(u.uNeutral, neutral);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      view.width = Math.max(1, container.clientWidth);\r
      view.height = Math.max(1, container.clientHeight);\r
      view.scale = Math.min(s.dpr || window.devicePixelRatio || 1, 2) * s.resolution;\r
      canvas.width = Math.max(1, Math.round(view.width * view.scale));\r
      canvas.height = Math.max(1, Math.round(view.height * view.scale));\r
      draw();\r
      wake();\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      if (Math.round(view.width * Math.min(s.dpr || window.devicePixelRatio || 1, 2) * s.resolution) !== canvas.width) {\r
        resize();\r
        return;\r
      }\r
      const dt = last ? clamp((now - last) / 1000, 0.001, 0.05) : 1 / 60;\r
      last = now;\r
      if (!reduce) time += dt;\r
      if (introClock < 1) introClock = Math.min(1, introClock + dt / INTRO_SECONDS);\r
      const hover = s.animationType === 'hover';\r
      const aim = pointer.inside && !reduce && (hover || s.interactive);\r
      const reach = (hover ? 0.6 : 0.09) * s.hoverStrength;\r
      const yaw = aim ? -pointer.x * reach : 0;\r
      const pitch = aim ? pointer.y * reach : 0;\r
      const follow = 1 - Math.pow(1 - s.inertia, dt * 60);\r
      pose.yaw += (yaw - pose.yaw) * follow;\r
      pose.pitch += (pitch - pose.pitch) * follow;\r
      pose.roll += (0 - pose.roll) * (1 - Math.pow(0.9, dt * 60));\r
      draw();\r
      const settling = Math.abs(yaw - pose.yaw) + Math.abs(pitch - pose.pitch) + Math.abs(pose.roll) > 1e-4;\r
      const spinning = !reduce && !hover && s.animationType !== 'static' && s.timeScale > 0;\r
      const busy = spinning || settling || introClock < 1 || (!reduce && s.noise > 0);\r
      if (busy) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    function wake() {\r
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    }\r
\r
    const onPointerMove = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = ((event.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;\r
      const y = ((event.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1;\r
      pointer.inside = Math.abs(x) <= 1 && Math.abs(y) <= 1;\r
      pointer.x = clamp(x, -1, 1);\r
      pointer.y = clamp(y, -1, 1);\r
      const s = settingsRef.current;\r
      if (s.interactive || s.animationType === 'hover') wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
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
    window.addEventListener('blur', onPointerLeave);\r
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
      window.removeEventListener('blur', onPointerLeave);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteTexture(paletteTexture);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(shader.program);\r
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
export default Prism;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties, type HTMLAttributes } from 'react';\r
import './Prism.css';\r
\r
export type PrismAnimation = 'rotate' | '3drotate' | 'rotate3d' | 'hover' | 'static';\r
\r
export interface PrismProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {\r
  height?: number;\r
  baseWidth?: number;\r
  animationType?: PrismAnimation;\r
  glow?: number;\r
  offset?: { x?: number; y?: number };\r
  noise?: number;\r
  scale?: number;\r
  hueShift?: number;\r
  colorFrequency?: number;\r
  colors?: string[];\r
  saturation?: number;\r
  timeScale?: number;\r
  interactive?: boolean;\r
  hoverStrength?: number;\r
  inertia?: number;\r
  intro?: boolean;\r
  resolution?: number;\r
  lightMode?: boolean;\r
  dpr?: number;\r
  style?: CSSProperties;\r
}\r
\r
type Settings = {\r
  height: number;\r
  baseWidth: number;\r
  animationType: string;\r
  glow: number;\r
  offsetX: number;\r
  offsetY: number;\r
  noise: number;\r
  scale: number;\r
  hueShift: number;\r
  colorFrequency: number;\r
  colors: string[];\r
  saturation: number;\r
  timeScale: number;\r
  interactive: boolean;\r
  hoverStrength: number;\r
  inertia: number;\r
  intro: boolean;\r
  resolution: number;\r
  lightMode: boolean;\r
  dpr?: number;\r
};\r
\r
type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };\r
\r
const INTRO_SECONDS = 1.4;\r
const PALETTE_SIZE = 64;\r
const HUE_W = [0.299, 0.587, 0.114, 0.299, 0.587, 0.114, 0.299, 0.587, 0.114];\r
const HUE_U = [0.701, -0.587, -0.114, -0.299, 0.413, -0.114, -0.3, -0.588, 0.886];\r
const HUE_V = [0.168, -0.331, 0.5, 0.328, 0.035, -0.5, -0.497, 0.296, 0.201];\r
\r
const VERTEX = \`#version 300 es\r
void main() {\r
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\r
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform vec2 uResolution;\r
uniform mat3 uRay;\r
uniform float uGlow;\r
uniform vec2 uOffset;\r
uniform float uColorFreq;\r
uniform float uCenterShift;\r
uniform float uInvBaseHalf;\r
uniform float uInvHeight;\r
uniform float uMinAxis;\r
uniform float uPxScale;\r
uniform sampler2D uPalette;\r
uniform int uUsePalette;\r
uniform float uTime;\r
uniform float uNoise;\r
uniform float uSaturation;\r
uniform mat3 uHue;\r
uniform int uUseHue;\r
uniform float uLight;\r
uniform float uNeutral;\r
out vec4 outColor;\r
\r
const vec4 PHASE_COS = vec4(1.0, 0.5403023058681398, -0.4161468365471424, -0.9899924966004454);\r
const vec4 PHASE_SIN = vec4(0.0, 0.8414709848078965, 0.9092974268256817, 0.1411200080598672);\r
\r
float rand(vec2 co) {\r
  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453123);\r
}\r
\r
float pyramid(vec3 p) {\r
  vec3 q = vec3(abs(p.x) * uInvBaseHalf, abs(p.y) * uInvHeight, abs(p.z) * uInvBaseHalf);\r
  return max((q.x + q.y + q.z - 1.0) * uMinAxis * 0.5773502691896258, -p.y);\r
}\r
\r
vec3 grade(vec3 col, vec2 seed) {\r
  col += (rand(seed) - 0.5) * uNoise;\r
  col = clamp(col, 0.0, 1.0);\r
  float L = dot(col, vec3(0.2126, 0.7152, 0.0722));\r
  col = clamp(mix(vec3(L), col, uSaturation), 0.0, 1.0);\r
  if (uUseHue == 1) col = clamp(uHue * col, 0.0, 1.0);\r
  return col;\r
}\r
\r
void main() {\r
  vec2 f = (gl_FragCoord.xy - 0.5 * uResolution - uOffset) * uPxScale;\r
  vec3 origin = uRay * vec3(f, 0.0);\r
  vec3 axis = uRay[2];\r
  float z = 5.0;\r
  vec4 o = vec4(0.0);\r
  for (int i = 0; i < 100; i++) {\r
    vec3 p = origin + axis * z;\r
    float d = 0.1 + 0.2 * abs(pyramid(p + vec3(0.0, uCenterShift, 0.0)));\r
    z -= d;\r
    float phase = (p.y + z) * uColorFreq;\r
    vec4 band = sin(phase) * PHASE_COS + cos(phase) * PHASE_SIN + 1.0;\r
    if (uUsePalette == 1) band.rgb = texture(uPalette, vec2(phase * 0.15915494309189535, 0.5)).rgb * 2.0;\r
    o += band / d;\r
  }\r
  vec4 raw = o * o * uGlow / 1e5;\r
  vec4 e = exp(2.0 * raw);\r
  vec4 mapped = (e - 1.0) / (e + 1.0);\r
  vec2 seed = gl_FragCoord.xy + vec2(uTime);\r
  if (uLight > 0.5) {\r
    float peak = max(raw.r, max(raw.g, raw.b));\r
    vec3 hue = grade(raw.rgb / max(peak, 1e-6), seed);\r
    vec3 ink = pow(hue, vec3(1.5)) * mix(0.86, 0.32, uNeutral);\r
    float strength = max(mapped.r, max(mapped.g, mapped.b)) * mapped.a;\r
    float cover = clamp(strength * 0.95 + (rand(seed.yx) - 0.5) * uNoise * 0.5, 0.0, 1.0);\r
    outColor = vec4(ink * cover, cover);\r
  } else {\r
    outColor = vec4(grade(mapped.rgb, seed) * mapped.a, mapped.a);\r
  }\r
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
const rotation = (yaw: number, pitch: number, roll: number): number[] => {\r
  const cy = Math.cos(yaw);\r
  const sy = Math.sin(yaw);\r
  const cx = Math.cos(pitch);\r
  const sx = Math.sin(pitch);\r
  const cz = Math.cos(roll);\r
  const sz = Math.sin(roll);\r
  return [\r
    cy * cz + sy * sx * sz,\r
    cx * sz,\r
    -sy * cz + cy * sx * sz,\r
    -cy * sz + sy * sx * cz,\r
    cx * cz,\r
    sy * sz + cy * sx * cz,\r
    sy * cx,\r
    -sx,\r
    cy * cx\r
  ];\r
};\r
\r
const multiply = (a: number[], b: number[]) => {\r
  const out: number[] = new Array(9);\r
  for (let c = 0; c < 3; c++) {\r
    for (let r = 0; r < 3; r++) {\r
      out[c * 3 + r] = a[r] * b[c * 3] + a[3 + r] * b[c * 3 + 1] + a[6 + r] * b[c * 3 + 2];\r
    }\r
  }\r
  return out;\r
};\r
\r
const Prism = ({\r
  height = 3.5,\r
  baseWidth = 5.5,\r
  animationType = 'rotate',\r
  glow = 1,\r
  offset,\r
  noise = 0,\r
  scale = 3.6,\r
  hueShift = 0,\r
  colorFrequency = 1,\r
  colors,\r
  saturation = 1.5,\r
  timeScale = 0.5,\r
  interactive = true,\r
  hoverStrength = 2,\r
  inertia = 0.05,\r
  intro = true,\r
  resolution = 0.5,\r
  lightMode = false,\r
  dpr,\r
  className = '',\r
  style,\r
  ...rest\r
}: PrismProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const palette = Array.isArray(colors) ? colors.filter(Boolean).slice(0, 8) : [];\r
  const settings: Settings = {\r
    height: Math.max(0.1, height),\r
    baseWidth: Math.max(0.1, baseWidth),\r
    animationType: animationType === 'rotate3d' ? '3drotate' : animationType,\r
    glow: Math.max(0, glow),\r
    offsetX: offset?.x ?? 0,\r
    offsetY: offset?.y ?? 0,\r
    noise: Math.max(0, noise),\r
    scale: Math.max(0.1, scale),\r
    hueShift: ((hueShift || 0) * Math.PI) / 180,\r
    colorFrequency: Math.max(0, colorFrequency),\r
    colors: palette,\r
    saturation: Math.max(0, saturation),\r
    timeScale: Math.max(0, timeScale),\r
    interactive,\r
    hoverStrength: Math.max(0, hoverStrength),\r
    inertia: clamp(inertia, 0.001, 1),\r
    intro,\r
    resolution: clamp(resolution, 0.25, 1),\r
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
    const shader = link(gl);\r
    if (!shader) return undefined;\r
    const u = shader.uniforms;\r
    const vao = gl.createVertexArray();\r
    const paletteTexture = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, paletteTexture);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, PALETTE_SIZE, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const parse = (value: string): number[] => {\r
      if (!probe) return [255, 255, 255];\r
      probe.clearRect(0, 0, 1, 1);\r
      probe.fillStyle = '#000000';\r
      probe.fillStyle = String(value);\r
      probe.fillRect(0, 0, 1, 1);\r
      const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
      return [r, g, b];\r
    };\r
    let paletteKey = '';\r
    let neutral = 0;\r
    const syncPalette = (colorsList: string[]) => {\r
      const key = colorsList.join(',');\r
      if (key === paletteKey) return;\r
      paletteKey = key;\r
      neutral = 0;\r
      if (!colorsList.length) return;\r
      const stops = colorsList.map(parse);\r
      neutral =\r
        1 -\r
        stops.reduce((sum, [r, g, b]) => {\r
          const top = Math.max(r, g, b);\r
          return sum + (top > 0 ? (top - Math.min(r, g, b)) / top : 0);\r
        }, 0) /\r
          stops.length;\r
      const data = new Uint8Array(PALETTE_SIZE * 4);\r
      for (let i = 0; i < PALETTE_SIZE; i++) {\r
        const position = (i / PALETTE_SIZE) * stops.length;\r
        const index = Math.floor(position);\r
        const a = stops[index % stops.length];\r
        const b = stops[(index + 1) % stops.length];\r
        const t = position - index;\r
        const k = t * t * (3 - 2 * t);\r
        for (let c = 0; c < 3; c++) data[i * 4 + c] = Math.round(a[c] + (b[c] - a[c]) * k);\r
        data[i * 4 + 3] = 255;\r
      }\r
      gl.bindTexture(gl.TEXTURE_2D, paletteTexture);\r
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, PALETTE_SIZE, 1, gl.RGBA, gl.UNSIGNED_BYTE, data);\r
    };\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1, scale: 1 };\r
    const pose = { yaw: 0, pitch: 0, roll: 0 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    let time = 0;\r
    let introClock = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const orientation = (s: Settings) => {\r
      const tilt = rotation(pose.yaw, pose.pitch, pose.roll);\r
      if (s.animationType === 'rotate') {\r
        const t = time * s.timeScale;\r
        const c0 = Math.cos(t);\r
        const c1 = Math.cos(t + 33);\r
        const c2 = Math.cos(t + 11);\r
        return multiply(tilt, [c0, 0, c2, 0, 1, 0, c1, 0, c0]);\r
      }\r
      if (s.animationType === '3drotate') {\r
        const t = time * s.timeScale;\r
        return multiply(tilt, rotation(t * 0.55, Math.sin(t * 0.6 + 0.6) * 0.6, Math.sin(t * 0.35 + 1.9) * 0.5));\r
      }\r
      return tilt;\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      syncPalette(s.colors);\r
      const half = s.baseWidth * 0.5;\r
      const ignite = introClock * introClock * (3 - 2 * introClock);\r
      const c = Math.cos(s.hueShift);\r
      const sn = Math.sin(s.hueShift);\r
      gl.bindVertexArray(vao);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(shader.program);\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniformMatrix3fv(u.uRay, false, orientation(s));\r
      gl.uniform1f(u.uGlow, s.glow * ignite * ignite);\r
      gl.uniform2f(u.uOffset, s.offsetX * view.scale, -s.offsetY * view.scale);\r
      gl.uniform1f(u.uColorFreq, s.colorFrequency);\r
      gl.uniform1f(u.uCenterShift, s.height * 0.25);\r
      gl.uniform1f(u.uInvBaseHalf, 1 / half);\r
      gl.uniform1f(u.uInvHeight, 1 / s.height);\r
      gl.uniform1f(u.uMinAxis, Math.min(half, s.height));\r
      gl.uniform1f(u.uPxScale, 1 / (canvas.height * 0.1 * s.scale));\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, paletteTexture);\r
      gl.uniform1i(u.uPalette, 0);\r
      gl.uniform1i(u.uUsePalette, s.colors.length ? 1 : 0);\r
      gl.uniform1f(u.uTime, time);\r
      gl.uniform1f(u.uNoise, s.noise);\r
      gl.uniform1f(u.uSaturation, s.saturation);\r
      gl.uniformMatrix3fv(\r
        u.uHue,\r
        false,\r
        HUE_W.map((w, i) => w + HUE_U[i] * c + HUE_V[i] * sn)\r
      );\r
      gl.uniform1i(u.uUseHue, Math.abs(s.hueShift) > 0.0001 ? 1 : 0);\r
      gl.uniform1f(u.uLight, s.lightMode ? 1 : 0);\r
      gl.uniform1f(u.uNeutral, neutral);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      view.width = Math.max(1, container.clientWidth);\r
      view.height = Math.max(1, container.clientHeight);\r
      view.scale = Math.min(s.dpr || window.devicePixelRatio || 1, 2) * s.resolution;\r
      canvas.width = Math.max(1, Math.round(view.width * view.scale));\r
      canvas.height = Math.max(1, Math.round(view.height * view.scale));\r
      draw();\r
      wake();\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      if (Math.round(view.width * Math.min(s.dpr || window.devicePixelRatio || 1, 2) * s.resolution) !== canvas.width) {\r
        resize();\r
        return;\r
      }\r
      const dt = last ? clamp((now - last) / 1000, 0.001, 0.05) : 1 / 60;\r
      last = now;\r
      if (!reduce) time += dt;\r
      if (introClock < 1) introClock = Math.min(1, introClock + dt / INTRO_SECONDS);\r
      const hover = s.animationType === 'hover';\r
      const aim = pointer.inside && !reduce && (hover || s.interactive);\r
      const reach = (hover ? 0.6 : 0.09) * s.hoverStrength;\r
      const yaw = aim ? -pointer.x * reach : 0;\r
      const pitch = aim ? pointer.y * reach : 0;\r
      const follow = 1 - Math.pow(1 - s.inertia, dt * 60);\r
      pose.yaw += (yaw - pose.yaw) * follow;\r
      pose.pitch += (pitch - pose.pitch) * follow;\r
      pose.roll += (0 - pose.roll) * (1 - Math.pow(0.9, dt * 60));\r
      draw();\r
      const settling = Math.abs(yaw - pose.yaw) + Math.abs(pitch - pose.pitch) + Math.abs(pose.roll) > 1e-4;\r
      const spinning = !reduce && !hover && s.animationType !== 'static' && s.timeScale > 0;\r
      const busy = spinning || settling || introClock < 1 || (!reduce && s.noise > 0);\r
      if (busy) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    function wake() {\r
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    }\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = ((event.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;\r
      const y = ((event.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1;\r
      pointer.inside = Math.abs(x) <= 1 && Math.abs(y) <= 1;\r
      pointer.x = clamp(x, -1, 1);\r
      pointer.y = clamp(y, -1, 1);\r
      const s = settingsRef.current;\r
      if (s.interactive || s.animationType === 'hover') wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
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
    window.addEventListener('blur', onPointerLeave);\r
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
      window.removeEventListener('blur', onPointerLeave);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteTexture(paletteTexture);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(shader.program);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div ref={containerRef} className={\`prism\${className ? \` \${className}\` : ''}\`} style={style} {...rest}>\r
      <canvas ref={canvasRef} className="prism-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Prism;\r
`,o=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties, type HTMLAttributes } from 'react';\r
\r
export type PrismAnimation = 'rotate' | '3drotate' | 'rotate3d' | 'hover' | 'static';\r
\r
export interface PrismProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {\r
  height?: number;\r
  baseWidth?: number;\r
  animationType?: PrismAnimation;\r
  glow?: number;\r
  offset?: { x?: number; y?: number };\r
  noise?: number;\r
  scale?: number;\r
  hueShift?: number;\r
  colorFrequency?: number;\r
  colors?: string[];\r
  saturation?: number;\r
  timeScale?: number;\r
  interactive?: boolean;\r
  hoverStrength?: number;\r
  inertia?: number;\r
  intro?: boolean;\r
  resolution?: number;\r
  lightMode?: boolean;\r
  dpr?: number;\r
  style?: CSSProperties;\r
}\r
\r
type Settings = {\r
  height: number;\r
  baseWidth: number;\r
  animationType: string;\r
  glow: number;\r
  offsetX: number;\r
  offsetY: number;\r
  noise: number;\r
  scale: number;\r
  hueShift: number;\r
  colorFrequency: number;\r
  colors: string[];\r
  saturation: number;\r
  timeScale: number;\r
  interactive: boolean;\r
  hoverStrength: number;\r
  inertia: number;\r
  intro: boolean;\r
  resolution: number;\r
  lightMode: boolean;\r
  dpr?: number;\r
};\r
\r
type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };\r
\r
const INTRO_SECONDS = 1.4;\r
const PALETTE_SIZE = 64;\r
const HUE_W = [0.299, 0.587, 0.114, 0.299, 0.587, 0.114, 0.299, 0.587, 0.114];\r
const HUE_U = [0.701, -0.587, -0.114, -0.299, 0.413, -0.114, -0.3, -0.588, 0.886];\r
const HUE_V = [0.168, -0.331, 0.5, 0.328, 0.035, -0.5, -0.497, 0.296, 0.201];\r
\r
const VERTEX = \`#version 300 es\r
void main() {\r
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\r
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform vec2 uResolution;\r
uniform mat3 uRay;\r
uniform float uGlow;\r
uniform vec2 uOffset;\r
uniform float uColorFreq;\r
uniform float uCenterShift;\r
uniform float uInvBaseHalf;\r
uniform float uInvHeight;\r
uniform float uMinAxis;\r
uniform float uPxScale;\r
uniform sampler2D uPalette;\r
uniform int uUsePalette;\r
uniform float uTime;\r
uniform float uNoise;\r
uniform float uSaturation;\r
uniform mat3 uHue;\r
uniform int uUseHue;\r
uniform float uLight;\r
uniform float uNeutral;\r
out vec4 outColor;\r
\r
const vec4 PHASE_COS = vec4(1.0, 0.5403023058681398, -0.4161468365471424, -0.9899924966004454);\r
const vec4 PHASE_SIN = vec4(0.0, 0.8414709848078965, 0.9092974268256817, 0.1411200080598672);\r
\r
float rand(vec2 co) {\r
  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453123);\r
}\r
\r
float pyramid(vec3 p) {\r
  vec3 q = vec3(abs(p.x) * uInvBaseHalf, abs(p.y) * uInvHeight, abs(p.z) * uInvBaseHalf);\r
  return max((q.x + q.y + q.z - 1.0) * uMinAxis * 0.5773502691896258, -p.y);\r
}\r
\r
vec3 grade(vec3 col, vec2 seed) {\r
  col += (rand(seed) - 0.5) * uNoise;\r
  col = clamp(col, 0.0, 1.0);\r
  float L = dot(col, vec3(0.2126, 0.7152, 0.0722));\r
  col = clamp(mix(vec3(L), col, uSaturation), 0.0, 1.0);\r
  if (uUseHue == 1) col = clamp(uHue * col, 0.0, 1.0);\r
  return col;\r
}\r
\r
void main() {\r
  vec2 f = (gl_FragCoord.xy - 0.5 * uResolution - uOffset) * uPxScale;\r
  vec3 origin = uRay * vec3(f, 0.0);\r
  vec3 axis = uRay[2];\r
  float z = 5.0;\r
  vec4 o = vec4(0.0);\r
  for (int i = 0; i < 100; i++) {\r
    vec3 p = origin + axis * z;\r
    float d = 0.1 + 0.2 * abs(pyramid(p + vec3(0.0, uCenterShift, 0.0)));\r
    z -= d;\r
    float phase = (p.y + z) * uColorFreq;\r
    vec4 band = sin(phase) * PHASE_COS + cos(phase) * PHASE_SIN + 1.0;\r
    if (uUsePalette == 1) band.rgb = texture(uPalette, vec2(phase * 0.15915494309189535, 0.5)).rgb * 2.0;\r
    o += band / d;\r
  }\r
  vec4 raw = o * o * uGlow / 1e5;\r
  vec4 e = exp(2.0 * raw);\r
  vec4 mapped = (e - 1.0) / (e + 1.0);\r
  vec2 seed = gl_FragCoord.xy + vec2(uTime);\r
  if (uLight > 0.5) {\r
    float peak = max(raw.r, max(raw.g, raw.b));\r
    vec3 hue = grade(raw.rgb / max(peak, 1e-6), seed);\r
    vec3 ink = pow(hue, vec3(1.5)) * mix(0.86, 0.32, uNeutral);\r
    float strength = max(mapped.r, max(mapped.g, mapped.b)) * mapped.a;\r
    float cover = clamp(strength * 0.95 + (rand(seed.yx) - 0.5) * uNoise * 0.5, 0.0, 1.0);\r
    outColor = vec4(ink * cover, cover);\r
  } else {\r
    outColor = vec4(grade(mapped.rgb, seed) * mapped.a, mapped.a);\r
  }\r
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
const rotation = (yaw: number, pitch: number, roll: number): number[] => {\r
  const cy = Math.cos(yaw);\r
  const sy = Math.sin(yaw);\r
  const cx = Math.cos(pitch);\r
  const sx = Math.sin(pitch);\r
  const cz = Math.cos(roll);\r
  const sz = Math.sin(roll);\r
  return [\r
    cy * cz + sy * sx * sz,\r
    cx * sz,\r
    -sy * cz + cy * sx * sz,\r
    -cy * sz + sy * sx * cz,\r
    cx * cz,\r
    sy * sz + cy * sx * cz,\r
    sy * cx,\r
    -sx,\r
    cy * cx\r
  ];\r
};\r
\r
const multiply = (a: number[], b: number[]) => {\r
  const out: number[] = new Array(9);\r
  for (let c = 0; c < 3; c++) {\r
    for (let r = 0; r < 3; r++) {\r
      out[c * 3 + r] = a[r] * b[c * 3] + a[3 + r] * b[c * 3 + 1] + a[6 + r] * b[c * 3 + 2];\r
    }\r
  }\r
  return out;\r
};\r
\r
const Prism = ({\r
  height = 3.5,\r
  baseWidth = 5.5,\r
  animationType = 'rotate',\r
  glow = 1,\r
  offset,\r
  noise = 0,\r
  scale = 3.6,\r
  hueShift = 0,\r
  colorFrequency = 1,\r
  colors,\r
  saturation = 1.5,\r
  timeScale = 0.5,\r
  interactive = true,\r
  hoverStrength = 2,\r
  inertia = 0.05,\r
  intro = true,\r
  resolution = 0.5,\r
  lightMode = false,\r
  dpr,\r
  className = '',\r
  style,\r
  ...rest\r
}: PrismProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const palette = Array.isArray(colors) ? colors.filter(Boolean).slice(0, 8) : [];\r
  const settings: Settings = {\r
    height: Math.max(0.1, height),\r
    baseWidth: Math.max(0.1, baseWidth),\r
    animationType: animationType === 'rotate3d' ? '3drotate' : animationType,\r
    glow: Math.max(0, glow),\r
    offsetX: offset?.x ?? 0,\r
    offsetY: offset?.y ?? 0,\r
    noise: Math.max(0, noise),\r
    scale: Math.max(0.1, scale),\r
    hueShift: ((hueShift || 0) * Math.PI) / 180,\r
    colorFrequency: Math.max(0, colorFrequency),\r
    colors: palette,\r
    saturation: Math.max(0, saturation),\r
    timeScale: Math.max(0, timeScale),\r
    interactive,\r
    hoverStrength: Math.max(0, hoverStrength),\r
    inertia: clamp(inertia, 0.001, 1),\r
    intro,\r
    resolution: clamp(resolution, 0.25, 1),\r
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
    const shader = link(gl);\r
    if (!shader) return undefined;\r
    const u = shader.uniforms;\r
    const vao = gl.createVertexArray();\r
    const paletteTexture = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, paletteTexture);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, PALETTE_SIZE, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const parse = (value: string): number[] => {\r
      if (!probe) return [255, 255, 255];\r
      probe.clearRect(0, 0, 1, 1);\r
      probe.fillStyle = '#000000';\r
      probe.fillStyle = String(value);\r
      probe.fillRect(0, 0, 1, 1);\r
      const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
      return [r, g, b];\r
    };\r
    let paletteKey = '';\r
    let neutral = 0;\r
    const syncPalette = (colorsList: string[]) => {\r
      const key = colorsList.join(',');\r
      if (key === paletteKey) return;\r
      paletteKey = key;\r
      neutral = 0;\r
      if (!colorsList.length) return;\r
      const stops = colorsList.map(parse);\r
      neutral =\r
        1 -\r
        stops.reduce((sum, [r, g, b]) => {\r
          const top = Math.max(r, g, b);\r
          return sum + (top > 0 ? (top - Math.min(r, g, b)) / top : 0);\r
        }, 0) /\r
          stops.length;\r
      const data = new Uint8Array(PALETTE_SIZE * 4);\r
      for (let i = 0; i < PALETTE_SIZE; i++) {\r
        const position = (i / PALETTE_SIZE) * stops.length;\r
        const index = Math.floor(position);\r
        const a = stops[index % stops.length];\r
        const b = stops[(index + 1) % stops.length];\r
        const t = position - index;\r
        const k = t * t * (3 - 2 * t);\r
        for (let c = 0; c < 3; c++) data[i * 4 + c] = Math.round(a[c] + (b[c] - a[c]) * k);\r
        data[i * 4 + 3] = 255;\r
      }\r
      gl.bindTexture(gl.TEXTURE_2D, paletteTexture);\r
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, PALETTE_SIZE, 1, gl.RGBA, gl.UNSIGNED_BYTE, data);\r
    };\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1, scale: 1 };\r
    const pose = { yaw: 0, pitch: 0, roll: 0 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    let time = 0;\r
    let introClock = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const orientation = (s: Settings) => {\r
      const tilt = rotation(pose.yaw, pose.pitch, pose.roll);\r
      if (s.animationType === 'rotate') {\r
        const t = time * s.timeScale;\r
        const c0 = Math.cos(t);\r
        const c1 = Math.cos(t + 33);\r
        const c2 = Math.cos(t + 11);\r
        return multiply(tilt, [c0, 0, c2, 0, 1, 0, c1, 0, c0]);\r
      }\r
      if (s.animationType === '3drotate') {\r
        const t = time * s.timeScale;\r
        return multiply(tilt, rotation(t * 0.55, Math.sin(t * 0.6 + 0.6) * 0.6, Math.sin(t * 0.35 + 1.9) * 0.5));\r
      }\r
      return tilt;\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      syncPalette(s.colors);\r
      const half = s.baseWidth * 0.5;\r
      const ignite = introClock * introClock * (3 - 2 * introClock);\r
      const c = Math.cos(s.hueShift);\r
      const sn = Math.sin(s.hueShift);\r
      gl.bindVertexArray(vao);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(shader.program);\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniformMatrix3fv(u.uRay, false, orientation(s));\r
      gl.uniform1f(u.uGlow, s.glow * ignite * ignite);\r
      gl.uniform2f(u.uOffset, s.offsetX * view.scale, -s.offsetY * view.scale);\r
      gl.uniform1f(u.uColorFreq, s.colorFrequency);\r
      gl.uniform1f(u.uCenterShift, s.height * 0.25);\r
      gl.uniform1f(u.uInvBaseHalf, 1 / half);\r
      gl.uniform1f(u.uInvHeight, 1 / s.height);\r
      gl.uniform1f(u.uMinAxis, Math.min(half, s.height));\r
      gl.uniform1f(u.uPxScale, 1 / (canvas.height * 0.1 * s.scale));\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, paletteTexture);\r
      gl.uniform1i(u.uPalette, 0);\r
      gl.uniform1i(u.uUsePalette, s.colors.length ? 1 : 0);\r
      gl.uniform1f(u.uTime, time);\r
      gl.uniform1f(u.uNoise, s.noise);\r
      gl.uniform1f(u.uSaturation, s.saturation);\r
      gl.uniformMatrix3fv(\r
        u.uHue,\r
        false,\r
        HUE_W.map((w, i) => w + HUE_U[i] * c + HUE_V[i] * sn)\r
      );\r
      gl.uniform1i(u.uUseHue, Math.abs(s.hueShift) > 0.0001 ? 1 : 0);\r
      gl.uniform1f(u.uLight, s.lightMode ? 1 : 0);\r
      gl.uniform1f(u.uNeutral, neutral);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      view.width = Math.max(1, container.clientWidth);\r
      view.height = Math.max(1, container.clientHeight);\r
      view.scale = Math.min(s.dpr || window.devicePixelRatio || 1, 2) * s.resolution;\r
      canvas.width = Math.max(1, Math.round(view.width * view.scale));\r
      canvas.height = Math.max(1, Math.round(view.height * view.scale));\r
      draw();\r
      wake();\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      if (Math.round(view.width * Math.min(s.dpr || window.devicePixelRatio || 1, 2) * s.resolution) !== canvas.width) {\r
        resize();\r
        return;\r
      }\r
      const dt = last ? clamp((now - last) / 1000, 0.001, 0.05) : 1 / 60;\r
      last = now;\r
      if (!reduce) time += dt;\r
      if (introClock < 1) introClock = Math.min(1, introClock + dt / INTRO_SECONDS);\r
      const hover = s.animationType === 'hover';\r
      const aim = pointer.inside && !reduce && (hover || s.interactive);\r
      const reach = (hover ? 0.6 : 0.09) * s.hoverStrength;\r
      const yaw = aim ? -pointer.x * reach : 0;\r
      const pitch = aim ? pointer.y * reach : 0;\r
      const follow = 1 - Math.pow(1 - s.inertia, dt * 60);\r
      pose.yaw += (yaw - pose.yaw) * follow;\r
      pose.pitch += (pitch - pose.pitch) * follow;\r
      pose.roll += (0 - pose.roll) * (1 - Math.pow(0.9, dt * 60));\r
      draw();\r
      const settling = Math.abs(yaw - pose.yaw) + Math.abs(pitch - pose.pitch) + Math.abs(pose.roll) > 1e-4;\r
      const spinning = !reduce && !hover && s.animationType !== 'static' && s.timeScale > 0;\r
      const busy = spinning || settling || introClock < 1 || (!reduce && s.noise > 0);\r
      if (busy) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    function wake() {\r
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    }\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = ((event.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;\r
      const y = ((event.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1;\r
      pointer.inside = Math.abs(x) <= 1 && Math.abs(y) <= 1;\r
      pointer.x = clamp(x, -1, 1);\r
      pointer.y = clamp(y, -1, 1);\r
      const s = settingsRef.current;\r
      if (s.interactive || s.animationType === 'hover') wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
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
    window.addEventListener('blur', onPointerLeave);\r
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
      window.removeEventListener('blur', onPointerLeave);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteTexture(paletteTexture);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(shader.program);\r
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
export default Prism;\r
`,i={usage:`import Prism from './Prism';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <Prism
    animationType="rotate"
    timeScale={0.5}
    height={3.5}
    baseWidth={5.5}
    scale={3.6}
    hueShift={0}
    colorFrequency={1}
    glow={1}
  />
</div>`,code:r,css:n,tailwind:e,tsCode:t,tsTailwind:o};export{i as prism};
