const r=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
import './Iridescence.css';\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
out vec2 vUv;\r
void main() {\r
  vUv = aPosition * 0.5 + 0.5;\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform vec2 uResolution;\r
uniform float uTime;\r
uniform vec3 uColor;\r
uniform vec2 uMouse;\r
uniform float uAmplitude;\r
uniform float uScale;\r
uniform float uRotation;\r
uniform int uDetail;\r
uniform float uWarp;\r
uniform float uHue;\r
uniform float uSaturation;\r
uniform float uBrightness;\r
uniform float uContrast;\r
uniform float uGrain;\r
uniform float uSeed;\r
uniform float uFade;\r
uniform float uOpacity;\r
uniform sampler2D uField;\r
uniform float uStir;\r
uniform vec3 uPointer;\r
uniform float uSheen;\r
uniform vec4 uSwirls[6];\r
in vec2 vUv;\r
out vec4 outColor;\r
\r
vec3 hueRotate(vec3 c, float angle) {\r
  const vec3 k = vec3(0.57735027);\r
  float ca = cos(angle);\r
  return c * ca + cross(k, c) * sin(angle) + k * dot(k, c) * (1.0 - ca);\r
}\r
\r
float smootherstep(float edge, float x) {\r
  float t = clamp(x / edge, 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(443.897, 441.423));\r
  p += dot(p, p.yx + 19.19);\r
  return fract((p.x + p.y) * p.x);\r
}\r
\r
void main() {\r
  float mr = min(uResolution.x, uResolution.y);\r
  vec2 aspect = uResolution / mr;\r
  vec2 st = vUv - texture(uField, vUv).rg * uStir;\r
\r
  for (int k = 0; k < 6; k++) {\r
    vec4 swirl = uSwirls[k];\r
    if (swirl.w == 0.0) continue;\r
    vec2 delta = (st - swirl.xy) * aspect;\r
    float angle = swirl.w * exp(-dot(delta, delta) / (swirl.z * swirl.z));\r
    float ca = cos(angle);\r
    float sa = sin(angle);\r
    st = swirl.xy + vec2(ca * delta.x - sa * delta.y, sa * delta.x + ca * delta.y) / aspect;\r
  }\r
\r
  vec2 uv = (st * 2.0 - 1.0) * aspect;\r
  float c = cos(uRotation);\r
  float s = sin(uRotation);\r
  uv = mat2(c, -s, s, c) * uv / uScale;\r
  uv += (uMouse - vec2(0.5)) * uAmplitude;\r
\r
  float d = -uTime * 0.5;\r
  float a = 0.0;\r
  for (int i = 0; i < 24; i++) {\r
    if (i >= uDetail) break;\r
    float fi = float(i);\r
    a += cos(fi - d - a * uv.x * uWarp);\r
    d += sin(uv.y * fi + a);\r
  }\r
  d += uTime * 0.5;\r
  vec3 col = vec3(cos(uv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);\r
  col = cos(col * cos(vec3(d, a, 2.5)) * 0.5 + 0.5) * uColor;\r
\r
  vec2 toPointer = (vUv - uPointer.xy) * aspect;\r
  col += col * uPointer.z * uSheen * 0.8 * exp(-dot(toPointer, toPointer) / 0.09);\r
\r
  col = hueRotate(col, uHue);\r
  float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));\r
  col = mix(vec3(luma), col, uSaturation);\r
  col = (col - 0.5) * uContrast + 0.5;\r
  col *= uBrightness;\r
  col += (hash(gl_FragCoord.xy + uSeed) - 0.5) * uGrain * 0.12;\r
  col = clamp(col, 0.0, 1.0);\r
\r
  float alpha = uOpacity;\r
  if (uFade > 0.0) {\r
    vec2 px = vUv * uResolution;\r
    float edge = uFade * mr * 0.5;\r
    alpha *= smootherstep(edge, px.x) * smootherstep(edge, uResolution.x - px.x);\r
    alpha *= smootherstep(edge, px.y) * smootherstep(edge, uResolution.y - px.y);\r
  }\r
  outColor = vec4(col * alpha, alpha);\r
}\`;\r
\r
const FIELD_COLUMNS = 48;\r
const MAX_SWIRLS = 6;\r
const SWIRL_LIFE = 3.2;\r
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
const Iridescence = ({\r
  color = [1, 1, 1],\r
  speed = 1,\r
  amplitude = 0.1,\r
  mouseReact = true,\r
  scale = 1,\r
  detail = 8,\r
  rotation = 0,\r
  warp = 1,\r
  hueShift = 0,\r
  saturation = 1,\r
  brightness = 1.5,\r
  contrast = 1,\r
  stir = 0.5,\r
  sheen = 0.3,\r
  clickSwirl = true,\r
  grain = 0,\r
  fade = 0,\r
  opacity = 1,\r
  resolution = 1,\r
  paused = false,\r
  className = '',\r
  style\r
}) => {\r
  const rootRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const colorKey = Array.isArray(color) ? color.join(',') : String(color);\r
  const settings = {\r
    colorKey,\r
    color,\r
    speed,\r
    amplitude,\r
    mouseReact,\r
    scale: Math.max(0.05, scale),\r
    detail: clamp(Math.round(detail), 1, 24),\r
    rotation,\r
    warp,\r
    hueShift,\r
    saturation: Math.max(0, saturation),\r
    brightness: Math.max(0, brightness),\r
    contrast: Math.max(0, contrast),\r
    stir: Math.max(0, stir),\r
    sheen: Math.max(0, sheen),\r
    clickSwirl,\r
    grain: clamp(grain, 0, 1),\r
    fade: clamp(fade, 0, 1),\r
    opacity: clamp(opacity, 0, 1),\r
    resolution: clamp(resolution, 0.1, 2),\r
    paused\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    const canvas = canvasRef.current;\r
    const gl = canvas?.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });\r
    if (!root || !canvas || !gl) return undefined;\r
\r
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
    const program = gl.createProgram();\r
    if (!vertex || !fragment || !program) return undefined;\r
    gl.attachShader(program, vertex);\r
    gl.attachShader(program, fragment);\r
    gl.linkProgram(program);\r
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return undefined;\r
    gl.useProgram(program);\r
\r
    const buffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    const position = gl.getAttribLocation(program, 'aPosition');\r
    gl.enableVertexAttribArray(position);\r
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);\r
\r
    const uniforms = {};\r
    for (const name of [\r
      'uResolution',\r
      'uTime',\r
      'uColor',\r
      'uMouse',\r
      'uAmplitude',\r
      'uScale',\r
      'uRotation',\r
      'uDetail',\r
      'uWarp',\r
      'uHue',\r
      'uSaturation',\r
      'uBrightness',\r
      'uContrast',\r
      'uGrain',\r
      'uSeed',\r
      'uFade',\r
      'uOpacity',\r
      'uField',\r
      'uStir',\r
      'uPointer',\r
      'uSheen',\r
      'uSwirls'\r
    ]) {\r
      uniforms[name] = gl.getUniformLocation(program, name);\r
    }\r
\r
    const fieldTexture = gl.createTexture();\r
    gl.activeTexture(gl.TEXTURE0);\r
    gl.bindTexture(gl.TEXTURE_2D, fieldTexture);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    gl.uniform1i(uniforms.uField, 0);\r
\r
    const probe = document.createElement('canvas');\r
    probe.width = 1;\r
    probe.height = 1;\r
    const probeCtx = probe.getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const pointer = { x: 0.5, y: 0.5, px: 0, py: 0, inside: false, tracked: false };\r
    const state = {\r
      width: 1,\r
      height: 1,\r
      phase: 0,\r
      mouse: [0.5, 0.5],\r
      presence: 0,\r
      color: [1, 1, 1],\r
      colorKey: '',\r
      cols: 0,\r
      rows: 0,\r
      field: new Float32Array(0),\r
      scratch: new Float32Array(0),\r
      fieldActive: false,\r
      swirls: [],\r
      seed: 0\r
    };\r
    const swirlData = new Float32Array(MAX_SWIRLS * 4);\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let alive = true;\r
\r
    const resolveColor = s => {\r
      if (s.colorKey === state.colorKey) return;\r
      state.colorKey = s.colorKey;\r
      if (Array.isArray(s.color)) {\r
        state.color = [0, 1, 2].map(i => clamp(Number(s.color[i] ?? 1), 0, 1));\r
        return;\r
      }\r
      if (!probeCtx) return;\r
      probeCtx.clearRect(0, 0, 1, 1);\r
      probeCtx.fillStyle = '#ffffff';\r
      probeCtx.fillStyle = String(s.color);\r
      probeCtx.fillRect(0, 0, 1, 1);\r
      const [r, g, b] = probeCtx.getImageData(0, 0, 1, 1).data;\r
      state.color = [r / 255, g / 255, b / 255];\r
    };\r
\r
    const layoutField = () => {\r
      const cols = FIELD_COLUMNS;\r
      const rows = clamp(Math.round((cols * state.height) / state.width), 6, 96);\r
      if (cols === state.cols && rows === state.rows) return;\r
      state.cols = cols;\r
      state.rows = rows;\r
      state.field = new Float32Array(cols * rows * 2);\r
      state.scratch = new Float32Array(cols * rows * 2);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, fieldTexture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG16F, cols, rows, 0, gl.RG, gl.FLOAT, state.field);\r
    };\r
\r
    const brush = (x, y, dx, dy) => {\r
      const { cols, rows, field } = state;\r
      const radius = 0.22;\r
      const aspect = state.width / state.height;\r
      const fromCol = Math.max(0, Math.floor((x - radius / aspect) * cols));\r
      const toCol = Math.min(cols - 1, Math.ceil((x + radius / aspect) * cols));\r
      const fromRow = Math.max(0, Math.floor((y - radius) * rows));\r
      const toRow = Math.min(rows - 1, Math.ceil((y + radius) * rows));\r
      for (let row = fromRow; row <= toRow; row++) {\r
        for (let col = fromCol; col <= toCol; col++) {\r
          const ox = ((col + 0.5) / cols - x) * aspect;\r
          const oy = (row + 0.5) / rows - y;\r
          const t = 1 - (ox * ox + oy * oy) / (radius * radius);\r
          if (t <= 0) continue;\r
          const i = (row * cols + col) * 2;\r
          const px = field[i] + dx * t * t * 3.2;\r
          const py = field[i + 1] + dy * t * t * 3.2;\r
          const length = Math.hypot(px, py);\r
          const limit = 0.4;\r
          const k = length > 0 ? (limit * Math.tanh(length / limit)) / length : 0;\r
          field[i] = px * k;\r
          field[i + 1] = py * k;\r
        }\r
      }\r
      state.fieldActive = true;\r
    };\r
\r
    const relaxField = dt => {\r
      const { cols, rows, field, scratch } = state;\r
      const decay = Math.exp(-dt * 1.4);\r
      let peak = 0;\r
      for (let row = 0; row < rows; row++) {\r
        for (let col = 0; col < cols; col++) {\r
          const i = (row * cols + col) * 2;\r
          const l = (row * cols + Math.max(0, col - 1)) * 2;\r
          const r = (row * cols + Math.min(cols - 1, col + 1)) * 2;\r
          const u = (Math.max(0, row - 1) * cols + col) * 2;\r
          const b = (Math.min(rows - 1, row + 1) * cols + col) * 2;\r
          for (let c = 0; c < 2; c++) {\r
            const value = (field[i + c] * 12 + field[l + c] + field[r + c] + field[u + c] + field[b + c]) / 16;\r
            scratch[i + c] = value * decay;\r
            peak = Math.max(peak, Math.abs(scratch[i + c]));\r
          }\r
        }\r
      }\r
      field.set(scratch);\r
      if (peak < 0.0004) {\r
        field.fill(0);\r
        state.fieldActive = false;\r
      }\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      resolveColor(s);\r
      layoutField();\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, fieldTexture);\r
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, state.cols, state.rows, gl.RG, gl.FLOAT, state.field);\r
      swirlData.fill(0);\r
      state.swirls.forEach((swirl, k) => {\r
        const radius = 0.21 * (1 + 0.4 * swirl.age);\r
        const ease = Math.exp(-swirl.age * 1.35) - Math.exp(-swirl.age * 10);\r
        const fade = Math.min(1, (SWIRL_LIFE - swirl.age) / 0.8);\r
        swirlData.set([swirl.x, swirl.y, radius, 3 * ease * fade * (0.21 / radius) ** 2], k * 4);\r
      });\r
      gl.uniform2f(uniforms.uResolution, state.width, state.height);\r
      gl.uniform1f(uniforms.uTime, state.phase);\r
      gl.uniform3f(uniforms.uColor, state.color[0], state.color[1], state.color[2]);\r
      gl.uniform2f(uniforms.uMouse, state.mouse[0], state.mouse[1]);\r
      gl.uniform1f(uniforms.uAmplitude, s.amplitude);\r
      gl.uniform1f(uniforms.uScale, s.scale);\r
      gl.uniform1f(uniforms.uRotation, (s.rotation * Math.PI) / 180);\r
      gl.uniform1i(uniforms.uDetail, s.detail);\r
      gl.uniform1f(uniforms.uWarp, s.warp);\r
      gl.uniform1f(uniforms.uHue, (s.hueShift * Math.PI) / 180);\r
      gl.uniform1f(uniforms.uSaturation, s.saturation);\r
      gl.uniform1f(uniforms.uBrightness, s.brightness);\r
      gl.uniform1f(uniforms.uContrast, s.contrast);\r
      gl.uniform1f(uniforms.uGrain, s.grain);\r
      gl.uniform1f(uniforms.uSeed, state.seed);\r
      gl.uniform1f(uniforms.uFade, s.fade);\r
      gl.uniform1f(uniforms.uOpacity, s.opacity);\r
      gl.uniform1f(uniforms.uStir, s.mouseReact ? s.stir : 0);\r
      gl.uniform3f(uniforms.uPointer, pointer.x, pointer.y, s.mouseReact ? state.presence : 0);\r
      gl.uniform1f(uniforms.uSheen, s.sheen);\r
      gl.uniform4fv(uniforms.uSwirls, swirlData);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!alive || !visible) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const moving = !s.paused && !reduce;\r
      if (moving) state.phase += dt * s.speed;\r
      const target = s.mouseReact && pointer.tracked ? [pointer.x, pointer.y] : [0.5, 0.5];\r
      const follow = 1 - Math.exp(-dt * 5);\r
      state.mouse[0] += (target[0] - state.mouse[0]) * follow;\r
      state.mouse[1] += (target[1] - state.mouse[1]) * follow;\r
      state.presence += ((pointer.inside ? 1 : 0) - state.presence) * (1 - Math.exp(-dt * 4));\r
      if (state.fieldActive) relaxField(dt);\r
      state.swirls = state.swirls.filter(swirl => (swirl.age += dt) < SWIRL_LIFE);\r
      if (s.grain > 0 && moving) state.seed = Math.floor(now / 42) % 997;\r
      render();\r
      const settling =\r
        Math.abs(target[0] - state.mouse[0]) > 0.0005 ||\r
        Math.abs(target[1] - state.mouse[1]) > 0.0005 ||\r
        Math.abs((pointer.inside ? 1 : 0) - state.presence) > 0.002;\r
      if (moving || settling || state.fieldActive || state.swirls.length) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (raf || !alive || !visible) return;\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const locate = event => {\r
      const rect = root.getBoundingClientRect();\r
      return {\r
        x: (event.clientX - rect.left) / Math.max(1, rect.width),\r
        y: 1 - (event.clientY - rect.top) / Math.max(1, rect.height)\r
      };\r
    };\r
\r
    const onPointerMove = event => {\r
      const s = settingsRef.current;\r
      const { x, y } = locate(event);\r
      const inside = x >= 0 && x <= 1 && y >= 0 && y <= 1;\r
      if (inside && s.mouseReact && !reduce && pointer.inside && s.stir > 0) {\r
        brush(x, y, x - pointer.x, y - pointer.y);\r
      }\r
      pointer.x = x;\r
      pointer.y = y;\r
      pointer.inside = inside;\r
      if (inside) pointer.tracked = true;\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      if (!s.clickSwirl || reduce) return;\r
      const { x, y } = locate(event);\r
      if (x < 0 || x > 1 || y < 0 || y > 1) return;\r
      if (state.swirls.length >= MAX_SWIRLS) {\r
        if (state.swirls[0].age < SWIRL_LIFE - 0.4) return;\r
        state.swirls.shift();\r
      }\r
      state.swirls.push({ x, y, age: 0 });\r
      wake();\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const dpr = Math.min(window.devicePixelRatio || 1, 2) * s.resolution;\r
      state.width = Math.max(1, root.clientWidth);\r
      state.height = Math.max(1, root.clientHeight);\r
      canvas.width = Math.max(1, Math.round(state.width * dpr));\r
      canvas.height = Math.max(1, Math.round(state.height * dpr));\r
      render();\r
      wake();\r
    };\r
\r
    wakeRef.current = () => {\r
      const dpr = Math.min(window.devicePixelRatio || 1, 2) * settingsRef.current.resolution;\r
      if (canvas.width !== Math.max(1, Math.round(state.width * dpr))) resize();\r
      else if (!raf) render();\r
      wake();\r
    };\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(root);\r
    const visibility = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible) {\r
        last = 0;\r
        wake();\r
      }\r
    });\r
    visibility.observe(root);\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    resize();\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      visibility.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      gl.deleteTexture(fieldTexture);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteProgram(program);\r
      gl.deleteShader(vertex);\r
      gl.deleteShader(fragment);\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div ref={rootRef} className={\`iridescence-container\${className ? \` \${className}\` : ''}\`} style={style}>\r
      <canvas ref={canvasRef} className="iridescence-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Iridescence;\r
`,n=`.iridescence-container {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.iridescence-canvas {\r
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
const ROOT = 'relative h-full w-full overflow-hidden';\r
const CANVAS = 'absolute inset-0 block h-full w-full';\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
out vec2 vUv;\r
void main() {\r
  vUv = aPosition * 0.5 + 0.5;\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform vec2 uResolution;\r
uniform float uTime;\r
uniform vec3 uColor;\r
uniform vec2 uMouse;\r
uniform float uAmplitude;\r
uniform float uScale;\r
uniform float uRotation;\r
uniform int uDetail;\r
uniform float uWarp;\r
uniform float uHue;\r
uniform float uSaturation;\r
uniform float uBrightness;\r
uniform float uContrast;\r
uniform float uGrain;\r
uniform float uSeed;\r
uniform float uFade;\r
uniform float uOpacity;\r
uniform sampler2D uField;\r
uniform float uStir;\r
uniform vec3 uPointer;\r
uniform float uSheen;\r
uniform vec4 uSwirls[6];\r
in vec2 vUv;\r
out vec4 outColor;\r
\r
vec3 hueRotate(vec3 c, float angle) {\r
  const vec3 k = vec3(0.57735027);\r
  float ca = cos(angle);\r
  return c * ca + cross(k, c) * sin(angle) + k * dot(k, c) * (1.0 - ca);\r
}\r
\r
float smootherstep(float edge, float x) {\r
  float t = clamp(x / edge, 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(443.897, 441.423));\r
  p += dot(p, p.yx + 19.19);\r
  return fract((p.x + p.y) * p.x);\r
}\r
\r
void main() {\r
  float mr = min(uResolution.x, uResolution.y);\r
  vec2 aspect = uResolution / mr;\r
  vec2 st = vUv - texture(uField, vUv).rg * uStir;\r
\r
  for (int k = 0; k < 6; k++) {\r
    vec4 swirl = uSwirls[k];\r
    if (swirl.w == 0.0) continue;\r
    vec2 delta = (st - swirl.xy) * aspect;\r
    float angle = swirl.w * exp(-dot(delta, delta) / (swirl.z * swirl.z));\r
    float ca = cos(angle);\r
    float sa = sin(angle);\r
    st = swirl.xy + vec2(ca * delta.x - sa * delta.y, sa * delta.x + ca * delta.y) / aspect;\r
  }\r
\r
  vec2 uv = (st * 2.0 - 1.0) * aspect;\r
  float c = cos(uRotation);\r
  float s = sin(uRotation);\r
  uv = mat2(c, -s, s, c) * uv / uScale;\r
  uv += (uMouse - vec2(0.5)) * uAmplitude;\r
\r
  float d = -uTime * 0.5;\r
  float a = 0.0;\r
  for (int i = 0; i < 24; i++) {\r
    if (i >= uDetail) break;\r
    float fi = float(i);\r
    a += cos(fi - d - a * uv.x * uWarp);\r
    d += sin(uv.y * fi + a);\r
  }\r
  d += uTime * 0.5;\r
  vec3 col = vec3(cos(uv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);\r
  col = cos(col * cos(vec3(d, a, 2.5)) * 0.5 + 0.5) * uColor;\r
\r
  vec2 toPointer = (vUv - uPointer.xy) * aspect;\r
  col += col * uPointer.z * uSheen * 0.8 * exp(-dot(toPointer, toPointer) / 0.09);\r
\r
  col = hueRotate(col, uHue);\r
  float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));\r
  col = mix(vec3(luma), col, uSaturation);\r
  col = (col - 0.5) * uContrast + 0.5;\r
  col *= uBrightness;\r
  col += (hash(gl_FragCoord.xy + uSeed) - 0.5) * uGrain * 0.12;\r
  col = clamp(col, 0.0, 1.0);\r
\r
  float alpha = uOpacity;\r
  if (uFade > 0.0) {\r
    vec2 px = vUv * uResolution;\r
    float edge = uFade * mr * 0.5;\r
    alpha *= smootherstep(edge, px.x) * smootherstep(edge, uResolution.x - px.x);\r
    alpha *= smootherstep(edge, px.y) * smootherstep(edge, uResolution.y - px.y);\r
  }\r
  outColor = vec4(col * alpha, alpha);\r
}\`;\r
\r
const FIELD_COLUMNS = 48;\r
const MAX_SWIRLS = 6;\r
const SWIRL_LIFE = 3.2;\r
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
const Iridescence = ({\r
  color = [1, 1, 1],\r
  speed = 1,\r
  amplitude = 0.1,\r
  mouseReact = true,\r
  scale = 1,\r
  detail = 8,\r
  rotation = 0,\r
  warp = 1,\r
  hueShift = 0,\r
  saturation = 1,\r
  brightness = 1.5,\r
  contrast = 1,\r
  stir = 0.5,\r
  sheen = 0.3,\r
  clickSwirl = true,\r
  grain = 0,\r
  fade = 0,\r
  opacity = 1,\r
  resolution = 1,\r
  paused = false,\r
  className = '',\r
  style\r
}) => {\r
  const rootRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const colorKey = Array.isArray(color) ? color.join(',') : String(color);\r
  const settings = {\r
    colorKey,\r
    color,\r
    speed,\r
    amplitude,\r
    mouseReact,\r
    scale: Math.max(0.05, scale),\r
    detail: clamp(Math.round(detail), 1, 24),\r
    rotation,\r
    warp,\r
    hueShift,\r
    saturation: Math.max(0, saturation),\r
    brightness: Math.max(0, brightness),\r
    contrast: Math.max(0, contrast),\r
    stir: Math.max(0, stir),\r
    sheen: Math.max(0, sheen),\r
    clickSwirl,\r
    grain: clamp(grain, 0, 1),\r
    fade: clamp(fade, 0, 1),\r
    opacity: clamp(opacity, 0, 1),\r
    resolution: clamp(resolution, 0.1, 2),\r
    paused\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    const canvas = canvasRef.current;\r
    const gl = canvas?.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });\r
    if (!root || !canvas || !gl) return undefined;\r
\r
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
    const program = gl.createProgram();\r
    if (!vertex || !fragment || !program) return undefined;\r
    gl.attachShader(program, vertex);\r
    gl.attachShader(program, fragment);\r
    gl.linkProgram(program);\r
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return undefined;\r
    gl.useProgram(program);\r
\r
    const buffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    const position = gl.getAttribLocation(program, 'aPosition');\r
    gl.enableVertexAttribArray(position);\r
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);\r
\r
    const uniforms = {};\r
    for (const name of [\r
      'uResolution',\r
      'uTime',\r
      'uColor',\r
      'uMouse',\r
      'uAmplitude',\r
      'uScale',\r
      'uRotation',\r
      'uDetail',\r
      'uWarp',\r
      'uHue',\r
      'uSaturation',\r
      'uBrightness',\r
      'uContrast',\r
      'uGrain',\r
      'uSeed',\r
      'uFade',\r
      'uOpacity',\r
      'uField',\r
      'uStir',\r
      'uPointer',\r
      'uSheen',\r
      'uSwirls'\r
    ]) {\r
      uniforms[name] = gl.getUniformLocation(program, name);\r
    }\r
\r
    const fieldTexture = gl.createTexture();\r
    gl.activeTexture(gl.TEXTURE0);\r
    gl.bindTexture(gl.TEXTURE_2D, fieldTexture);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    gl.uniform1i(uniforms.uField, 0);\r
\r
    const probe = document.createElement('canvas');\r
    probe.width = 1;\r
    probe.height = 1;\r
    const probeCtx = probe.getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const pointer = { x: 0.5, y: 0.5, px: 0, py: 0, inside: false, tracked: false };\r
    const state = {\r
      width: 1,\r
      height: 1,\r
      phase: 0,\r
      mouse: [0.5, 0.5],\r
      presence: 0,\r
      color: [1, 1, 1],\r
      colorKey: '',\r
      cols: 0,\r
      rows: 0,\r
      field: new Float32Array(0),\r
      scratch: new Float32Array(0),\r
      fieldActive: false,\r
      swirls: [],\r
      seed: 0\r
    };\r
    const swirlData = new Float32Array(MAX_SWIRLS * 4);\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let alive = true;\r
\r
    const resolveColor = s => {\r
      if (s.colorKey === state.colorKey) return;\r
      state.colorKey = s.colorKey;\r
      if (Array.isArray(s.color)) {\r
        state.color = [0, 1, 2].map(i => clamp(Number(s.color[i] ?? 1), 0, 1));\r
        return;\r
      }\r
      if (!probeCtx) return;\r
      probeCtx.clearRect(0, 0, 1, 1);\r
      probeCtx.fillStyle = '#ffffff';\r
      probeCtx.fillStyle = String(s.color);\r
      probeCtx.fillRect(0, 0, 1, 1);\r
      const [r, g, b] = probeCtx.getImageData(0, 0, 1, 1).data;\r
      state.color = [r / 255, g / 255, b / 255];\r
    };\r
\r
    const layoutField = () => {\r
      const cols = FIELD_COLUMNS;\r
      const rows = clamp(Math.round((cols * state.height) / state.width), 6, 96);\r
      if (cols === state.cols && rows === state.rows) return;\r
      state.cols = cols;\r
      state.rows = rows;\r
      state.field = new Float32Array(cols * rows * 2);\r
      state.scratch = new Float32Array(cols * rows * 2);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, fieldTexture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG16F, cols, rows, 0, gl.RG, gl.FLOAT, state.field);\r
    };\r
\r
    const brush = (x, y, dx, dy) => {\r
      const { cols, rows, field } = state;\r
      const radius = 0.22;\r
      const aspect = state.width / state.height;\r
      const fromCol = Math.max(0, Math.floor((x - radius / aspect) * cols));\r
      const toCol = Math.min(cols - 1, Math.ceil((x + radius / aspect) * cols));\r
      const fromRow = Math.max(0, Math.floor((y - radius) * rows));\r
      const toRow = Math.min(rows - 1, Math.ceil((y + radius) * rows));\r
      for (let row = fromRow; row <= toRow; row++) {\r
        for (let col = fromCol; col <= toCol; col++) {\r
          const ox = ((col + 0.5) / cols - x) * aspect;\r
          const oy = (row + 0.5) / rows - y;\r
          const t = 1 - (ox * ox + oy * oy) / (radius * radius);\r
          if (t <= 0) continue;\r
          const i = (row * cols + col) * 2;\r
          const px = field[i] + dx * t * t * 3.2;\r
          const py = field[i + 1] + dy * t * t * 3.2;\r
          const length = Math.hypot(px, py);\r
          const limit = 0.4;\r
          const k = length > 0 ? (limit * Math.tanh(length / limit)) / length : 0;\r
          field[i] = px * k;\r
          field[i + 1] = py * k;\r
        }\r
      }\r
      state.fieldActive = true;\r
    };\r
\r
    const relaxField = dt => {\r
      const { cols, rows, field, scratch } = state;\r
      const decay = Math.exp(-dt * 1.4);\r
      let peak = 0;\r
      for (let row = 0; row < rows; row++) {\r
        for (let col = 0; col < cols; col++) {\r
          const i = (row * cols + col) * 2;\r
          const l = (row * cols + Math.max(0, col - 1)) * 2;\r
          const r = (row * cols + Math.min(cols - 1, col + 1)) * 2;\r
          const u = (Math.max(0, row - 1) * cols + col) * 2;\r
          const b = (Math.min(rows - 1, row + 1) * cols + col) * 2;\r
          for (let c = 0; c < 2; c++) {\r
            const value = (field[i + c] * 12 + field[l + c] + field[r + c] + field[u + c] + field[b + c]) / 16;\r
            scratch[i + c] = value * decay;\r
            peak = Math.max(peak, Math.abs(scratch[i + c]));\r
          }\r
        }\r
      }\r
      field.set(scratch);\r
      if (peak < 0.0004) {\r
        field.fill(0);\r
        state.fieldActive = false;\r
      }\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      resolveColor(s);\r
      layoutField();\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, fieldTexture);\r
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, state.cols, state.rows, gl.RG, gl.FLOAT, state.field);\r
      swirlData.fill(0);\r
      state.swirls.forEach((swirl, k) => {\r
        const radius = 0.21 * (1 + 0.4 * swirl.age);\r
        const ease = Math.exp(-swirl.age * 1.35) - Math.exp(-swirl.age * 10);\r
        const fade = Math.min(1, (SWIRL_LIFE - swirl.age) / 0.8);\r
        swirlData.set([swirl.x, swirl.y, radius, 3 * ease * fade * (0.21 / radius) ** 2], k * 4);\r
      });\r
      gl.uniform2f(uniforms.uResolution, state.width, state.height);\r
      gl.uniform1f(uniforms.uTime, state.phase);\r
      gl.uniform3f(uniforms.uColor, state.color[0], state.color[1], state.color[2]);\r
      gl.uniform2f(uniforms.uMouse, state.mouse[0], state.mouse[1]);\r
      gl.uniform1f(uniforms.uAmplitude, s.amplitude);\r
      gl.uniform1f(uniforms.uScale, s.scale);\r
      gl.uniform1f(uniforms.uRotation, (s.rotation * Math.PI) / 180);\r
      gl.uniform1i(uniforms.uDetail, s.detail);\r
      gl.uniform1f(uniforms.uWarp, s.warp);\r
      gl.uniform1f(uniforms.uHue, (s.hueShift * Math.PI) / 180);\r
      gl.uniform1f(uniforms.uSaturation, s.saturation);\r
      gl.uniform1f(uniforms.uBrightness, s.brightness);\r
      gl.uniform1f(uniforms.uContrast, s.contrast);\r
      gl.uniform1f(uniforms.uGrain, s.grain);\r
      gl.uniform1f(uniforms.uSeed, state.seed);\r
      gl.uniform1f(uniforms.uFade, s.fade);\r
      gl.uniform1f(uniforms.uOpacity, s.opacity);\r
      gl.uniform1f(uniforms.uStir, s.mouseReact ? s.stir : 0);\r
      gl.uniform3f(uniforms.uPointer, pointer.x, pointer.y, s.mouseReact ? state.presence : 0);\r
      gl.uniform1f(uniforms.uSheen, s.sheen);\r
      gl.uniform4fv(uniforms.uSwirls, swirlData);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!alive || !visible) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const moving = !s.paused && !reduce;\r
      if (moving) state.phase += dt * s.speed;\r
      const target = s.mouseReact && pointer.tracked ? [pointer.x, pointer.y] : [0.5, 0.5];\r
      const follow = 1 - Math.exp(-dt * 5);\r
      state.mouse[0] += (target[0] - state.mouse[0]) * follow;\r
      state.mouse[1] += (target[1] - state.mouse[1]) * follow;\r
      state.presence += ((pointer.inside ? 1 : 0) - state.presence) * (1 - Math.exp(-dt * 4));\r
      if (state.fieldActive) relaxField(dt);\r
      state.swirls = state.swirls.filter(swirl => (swirl.age += dt) < SWIRL_LIFE);\r
      if (s.grain > 0 && moving) state.seed = Math.floor(now / 42) % 997;\r
      render();\r
      const settling =\r
        Math.abs(target[0] - state.mouse[0]) > 0.0005 ||\r
        Math.abs(target[1] - state.mouse[1]) > 0.0005 ||\r
        Math.abs((pointer.inside ? 1 : 0) - state.presence) > 0.002;\r
      if (moving || settling || state.fieldActive || state.swirls.length) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (raf || !alive || !visible) return;\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const locate = event => {\r
      const rect = root.getBoundingClientRect();\r
      return {\r
        x: (event.clientX - rect.left) / Math.max(1, rect.width),\r
        y: 1 - (event.clientY - rect.top) / Math.max(1, rect.height)\r
      };\r
    };\r
\r
    const onPointerMove = event => {\r
      const s = settingsRef.current;\r
      const { x, y } = locate(event);\r
      const inside = x >= 0 && x <= 1 && y >= 0 && y <= 1;\r
      if (inside && s.mouseReact && !reduce && pointer.inside && s.stir > 0) {\r
        brush(x, y, x - pointer.x, y - pointer.y);\r
      }\r
      pointer.x = x;\r
      pointer.y = y;\r
      pointer.inside = inside;\r
      if (inside) pointer.tracked = true;\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      if (!s.clickSwirl || reduce) return;\r
      const { x, y } = locate(event);\r
      if (x < 0 || x > 1 || y < 0 || y > 1) return;\r
      if (state.swirls.length >= MAX_SWIRLS) {\r
        if (state.swirls[0].age < SWIRL_LIFE - 0.4) return;\r
        state.swirls.shift();\r
      }\r
      state.swirls.push({ x, y, age: 0 });\r
      wake();\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const dpr = Math.min(window.devicePixelRatio || 1, 2) * s.resolution;\r
      state.width = Math.max(1, root.clientWidth);\r
      state.height = Math.max(1, root.clientHeight);\r
      canvas.width = Math.max(1, Math.round(state.width * dpr));\r
      canvas.height = Math.max(1, Math.round(state.height * dpr));\r
      render();\r
      wake();\r
    };\r
\r
    wakeRef.current = () => {\r
      const dpr = Math.min(window.devicePixelRatio || 1, 2) * settingsRef.current.resolution;\r
      if (canvas.width !== Math.max(1, Math.round(state.width * dpr))) resize();\r
      else if (!raf) render();\r
      wake();\r
    };\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(root);\r
    const visibility = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible) {\r
        last = 0;\r
        wake();\r
      }\r
    });\r
    visibility.observe(root);\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    resize();\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      visibility.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      gl.deleteTexture(fieldTexture);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteProgram(program);\r
      gl.deleteShader(vertex);\r
      gl.deleteShader(fragment);\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div ref={rootRef} className={\`\${ROOT}\${className ? \` \${className}\` : ''}\`} style={style}>\r
      <canvas ref={canvasRef} className={CANVAS} aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Iridescence;\r
`,t=`'use client';\r
\r
import React, { useEffect, useRef } from 'react';\r
\r
import './Iridescence.css';\r
\r
export interface IridescenceProps {\r
  color?: string | [number, number, number];\r
  speed?: number;\r
  amplitude?: number;\r
  mouseReact?: boolean;\r
  scale?: number;\r
  detail?: number;\r
  rotation?: number;\r
  warp?: number;\r
  hueShift?: number;\r
  saturation?: number;\r
  brightness?: number;\r
  contrast?: number;\r
  stir?: number;\r
  sheen?: number;\r
  clickSwirl?: boolean;\r
  grain?: number;\r
  fade?: number;\r
  opacity?: number;\r
  resolution?: number;\r
  paused?: boolean;\r
  className?: string;\r
  style?: React.CSSProperties;\r
}\r
\r
type Swirl = { x: number; y: number; age: number };\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
out vec2 vUv;\r
void main() {\r
  vUv = aPosition * 0.5 + 0.5;\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform vec2 uResolution;\r
uniform float uTime;\r
uniform vec3 uColor;\r
uniform vec2 uMouse;\r
uniform float uAmplitude;\r
uniform float uScale;\r
uniform float uRotation;\r
uniform int uDetail;\r
uniform float uWarp;\r
uniform float uHue;\r
uniform float uSaturation;\r
uniform float uBrightness;\r
uniform float uContrast;\r
uniform float uGrain;\r
uniform float uSeed;\r
uniform float uFade;\r
uniform float uOpacity;\r
uniform sampler2D uField;\r
uniform float uStir;\r
uniform vec3 uPointer;\r
uniform float uSheen;\r
uniform vec4 uSwirls[6];\r
in vec2 vUv;\r
out vec4 outColor;\r
\r
vec3 hueRotate(vec3 c, float angle) {\r
  const vec3 k = vec3(0.57735027);\r
  float ca = cos(angle);\r
  return c * ca + cross(k, c) * sin(angle) + k * dot(k, c) * (1.0 - ca);\r
}\r
\r
float smootherstep(float edge, float x) {\r
  float t = clamp(x / edge, 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(443.897, 441.423));\r
  p += dot(p, p.yx + 19.19);\r
  return fract((p.x + p.y) * p.x);\r
}\r
\r
void main() {\r
  float mr = min(uResolution.x, uResolution.y);\r
  vec2 aspect = uResolution / mr;\r
  vec2 st = vUv - texture(uField, vUv).rg * uStir;\r
\r
  for (int k = 0; k < 6; k++) {\r
    vec4 swirl = uSwirls[k];\r
    if (swirl.w == 0.0) continue;\r
    vec2 delta = (st - swirl.xy) * aspect;\r
    float angle = swirl.w * exp(-dot(delta, delta) / (swirl.z * swirl.z));\r
    float ca = cos(angle);\r
    float sa = sin(angle);\r
    st = swirl.xy + vec2(ca * delta.x - sa * delta.y, sa * delta.x + ca * delta.y) / aspect;\r
  }\r
\r
  vec2 uv = (st * 2.0 - 1.0) * aspect;\r
  float c = cos(uRotation);\r
  float s = sin(uRotation);\r
  uv = mat2(c, -s, s, c) * uv / uScale;\r
  uv += (uMouse - vec2(0.5)) * uAmplitude;\r
\r
  float d = -uTime * 0.5;\r
  float a = 0.0;\r
  for (int i = 0; i < 24; i++) {\r
    if (i >= uDetail) break;\r
    float fi = float(i);\r
    a += cos(fi - d - a * uv.x * uWarp);\r
    d += sin(uv.y * fi + a);\r
  }\r
  d += uTime * 0.5;\r
  vec3 col = vec3(cos(uv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);\r
  col = cos(col * cos(vec3(d, a, 2.5)) * 0.5 + 0.5) * uColor;\r
\r
  vec2 toPointer = (vUv - uPointer.xy) * aspect;\r
  col += col * uPointer.z * uSheen * 0.8 * exp(-dot(toPointer, toPointer) / 0.09);\r
\r
  col = hueRotate(col, uHue);\r
  float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));\r
  col = mix(vec3(luma), col, uSaturation);\r
  col = (col - 0.5) * uContrast + 0.5;\r
  col *= uBrightness;\r
  col += (hash(gl_FragCoord.xy + uSeed) - 0.5) * uGrain * 0.12;\r
  col = clamp(col, 0.0, 1.0);\r
\r
  float alpha = uOpacity;\r
  if (uFade > 0.0) {\r
    vec2 px = vUv * uResolution;\r
    float edge = uFade * mr * 0.5;\r
    alpha *= smootherstep(edge, px.x) * smootherstep(edge, uResolution.x - px.x);\r
    alpha *= smootherstep(edge, px.y) * smootherstep(edge, uResolution.y - px.y);\r
  }\r
  outColor = vec4(col * alpha, alpha);\r
}\`;\r
\r
const FIELD_COLUMNS = 48;\r
const MAX_SWIRLS = 6;\r
const SWIRL_LIFE = 3.2;\r
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
const Iridescence = ({\r
  color = [1, 1, 1],\r
  speed = 1,\r
  amplitude = 0.1,\r
  mouseReact = true,\r
  scale = 1,\r
  detail = 8,\r
  rotation = 0,\r
  warp = 1,\r
  hueShift = 0,\r
  saturation = 1,\r
  brightness = 1.5,\r
  contrast = 1,\r
  stir = 0.5,\r
  sheen = 0.3,\r
  clickSwirl = true,\r
  grain = 0,\r
  fade = 0,\r
  opacity = 1,\r
  resolution = 1,\r
  paused = false,\r
  className = '',\r
  style\r
}: IridescenceProps) => {\r
  const rootRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const colorKey = Array.isArray(color) ? color.join(',') : String(color);\r
  const settings = {\r
    colorKey,\r
    color,\r
    speed,\r
    amplitude,\r
    mouseReact,\r
    scale: Math.max(0.05, scale),\r
    detail: clamp(Math.round(detail), 1, 24),\r
    rotation,\r
    warp,\r
    hueShift,\r
    saturation: Math.max(0, saturation),\r
    brightness: Math.max(0, brightness),\r
    contrast: Math.max(0, contrast),\r
    stir: Math.max(0, stir),\r
    sheen: Math.max(0, sheen),\r
    clickSwirl,\r
    grain: clamp(grain, 0, 1),\r
    fade: clamp(fade, 0, 1),\r
    opacity: clamp(opacity, 0, 1),\r
    resolution: clamp(resolution, 0.1, 2),\r
    paused\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    const canvas = canvasRef.current;\r
    const gl = canvas?.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });\r
    if (!root || !canvas || !gl) return undefined;\r
\r
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
    const program = gl.createProgram();\r
    if (!vertex || !fragment || !program) return undefined;\r
    gl.attachShader(program, vertex);\r
    gl.attachShader(program, fragment);\r
    gl.linkProgram(program);\r
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return undefined;\r
    gl.useProgram(program);\r
\r
    const buffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    const position = gl.getAttribLocation(program, 'aPosition');\r
    gl.enableVertexAttribArray(position);\r
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);\r
\r
    const uniforms: Record<string, WebGLUniformLocation | null> = {};\r
    for (const name of [\r
      'uResolution',\r
      'uTime',\r
      'uColor',\r
      'uMouse',\r
      'uAmplitude',\r
      'uScale',\r
      'uRotation',\r
      'uDetail',\r
      'uWarp',\r
      'uHue',\r
      'uSaturation',\r
      'uBrightness',\r
      'uContrast',\r
      'uGrain',\r
      'uSeed',\r
      'uFade',\r
      'uOpacity',\r
      'uField',\r
      'uStir',\r
      'uPointer',\r
      'uSheen',\r
      'uSwirls'\r
    ]) {\r
      uniforms[name] = gl.getUniformLocation(program, name);\r
    }\r
\r
    const fieldTexture = gl.createTexture();\r
    gl.activeTexture(gl.TEXTURE0);\r
    gl.bindTexture(gl.TEXTURE_2D, fieldTexture);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    gl.uniform1i(uniforms.uField, 0);\r
\r
    const probe = document.createElement('canvas');\r
    probe.width = 1;\r
    probe.height = 1;\r
    const probeCtx = probe.getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const pointer = { x: 0.5, y: 0.5, px: 0, py: 0, inside: false, tracked: false };\r
    const state = {\r
      width: 1,\r
      height: 1,\r
      phase: 0,\r
      mouse: [0.5, 0.5] as number[],\r
      presence: 0,\r
      color: [1, 1, 1] as number[],\r
      colorKey: '',\r
      cols: 0,\r
      rows: 0,\r
      field: new Float32Array(0),\r
      scratch: new Float32Array(0),\r
      fieldActive: false,\r
      swirls: [] as Swirl[],\r
      seed: 0\r
    };\r
    const swirlData = new Float32Array(MAX_SWIRLS * 4);\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let alive = true;\r
\r
    const resolveColor = (s: typeof settings) => {\r
      if (s.colorKey === state.colorKey) return;\r
      state.colorKey = s.colorKey;\r
      if (Array.isArray(s.color)) {\r
        const rgb = s.color as number[];\r
        state.color = [0, 1, 2].map(i => clamp(Number(rgb[i] ?? 1), 0, 1));\r
        return;\r
      }\r
      if (!probeCtx) return;\r
      probeCtx.clearRect(0, 0, 1, 1);\r
      probeCtx.fillStyle = '#ffffff';\r
      probeCtx.fillStyle = String(s.color);\r
      probeCtx.fillRect(0, 0, 1, 1);\r
      const [r, g, b] = probeCtx.getImageData(0, 0, 1, 1).data;\r
      state.color = [r / 255, g / 255, b / 255];\r
    };\r
\r
    const layoutField = () => {\r
      const cols = FIELD_COLUMNS;\r
      const rows = clamp(Math.round((cols * state.height) / state.width), 6, 96);\r
      if (cols === state.cols && rows === state.rows) return;\r
      state.cols = cols;\r
      state.rows = rows;\r
      state.field = new Float32Array(cols * rows * 2);\r
      state.scratch = new Float32Array(cols * rows * 2);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, fieldTexture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG16F, cols, rows, 0, gl.RG, gl.FLOAT, state.field);\r
    };\r
\r
    const brush = (x: number, y: number, dx: number, dy: number) => {\r
      const { cols, rows, field } = state;\r
      const radius = 0.22;\r
      const aspect = state.width / state.height;\r
      const fromCol = Math.max(0, Math.floor((x - radius / aspect) * cols));\r
      const toCol = Math.min(cols - 1, Math.ceil((x + radius / aspect) * cols));\r
      const fromRow = Math.max(0, Math.floor((y - radius) * rows));\r
      const toRow = Math.min(rows - 1, Math.ceil((y + radius) * rows));\r
      for (let row = fromRow; row <= toRow; row++) {\r
        for (let col = fromCol; col <= toCol; col++) {\r
          const ox = ((col + 0.5) / cols - x) * aspect;\r
          const oy = (row + 0.5) / rows - y;\r
          const t = 1 - (ox * ox + oy * oy) / (radius * radius);\r
          if (t <= 0) continue;\r
          const i = (row * cols + col) * 2;\r
          const px = field[i] + dx * t * t * 3.2;\r
          const py = field[i + 1] + dy * t * t * 3.2;\r
          const length = Math.hypot(px, py);\r
          const limit = 0.4;\r
          const k = length > 0 ? (limit * Math.tanh(length / limit)) / length : 0;\r
          field[i] = px * k;\r
          field[i + 1] = py * k;\r
        }\r
      }\r
      state.fieldActive = true;\r
    };\r
\r
    const relaxField = (dt: number) => {\r
      const { cols, rows, field, scratch } = state;\r
      const decay = Math.exp(-dt * 1.4);\r
      let peak = 0;\r
      for (let row = 0; row < rows; row++) {\r
        for (let col = 0; col < cols; col++) {\r
          const i = (row * cols + col) * 2;\r
          const l = (row * cols + Math.max(0, col - 1)) * 2;\r
          const r = (row * cols + Math.min(cols - 1, col + 1)) * 2;\r
          const u = (Math.max(0, row - 1) * cols + col) * 2;\r
          const b = (Math.min(rows - 1, row + 1) * cols + col) * 2;\r
          for (let c = 0; c < 2; c++) {\r
            const value = (field[i + c] * 12 + field[l + c] + field[r + c] + field[u + c] + field[b + c]) / 16;\r
            scratch[i + c] = value * decay;\r
            peak = Math.max(peak, Math.abs(scratch[i + c]));\r
          }\r
        }\r
      }\r
      field.set(scratch);\r
      if (peak < 0.0004) {\r
        field.fill(0);\r
        state.fieldActive = false;\r
      }\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      resolveColor(s);\r
      layoutField();\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, fieldTexture);\r
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, state.cols, state.rows, gl.RG, gl.FLOAT, state.field);\r
      swirlData.fill(0);\r
      state.swirls.forEach((swirl, k) => {\r
        const radius = 0.21 * (1 + 0.4 * swirl.age);\r
        const ease = Math.exp(-swirl.age * 1.35) - Math.exp(-swirl.age * 10);\r
        const fade = Math.min(1, (SWIRL_LIFE - swirl.age) / 0.8);\r
        swirlData.set([swirl.x, swirl.y, radius, 3 * ease * fade * (0.21 / radius) ** 2], k * 4);\r
      });\r
      gl.uniform2f(uniforms.uResolution, state.width, state.height);\r
      gl.uniform1f(uniforms.uTime, state.phase);\r
      gl.uniform3f(uniforms.uColor, state.color[0], state.color[1], state.color[2]);\r
      gl.uniform2f(uniforms.uMouse, state.mouse[0], state.mouse[1]);\r
      gl.uniform1f(uniforms.uAmplitude, s.amplitude);\r
      gl.uniform1f(uniforms.uScale, s.scale);\r
      gl.uniform1f(uniforms.uRotation, (s.rotation * Math.PI) / 180);\r
      gl.uniform1i(uniforms.uDetail, s.detail);\r
      gl.uniform1f(uniforms.uWarp, s.warp);\r
      gl.uniform1f(uniforms.uHue, (s.hueShift * Math.PI) / 180);\r
      gl.uniform1f(uniforms.uSaturation, s.saturation);\r
      gl.uniform1f(uniforms.uBrightness, s.brightness);\r
      gl.uniform1f(uniforms.uContrast, s.contrast);\r
      gl.uniform1f(uniforms.uGrain, s.grain);\r
      gl.uniform1f(uniforms.uSeed, state.seed);\r
      gl.uniform1f(uniforms.uFade, s.fade);\r
      gl.uniform1f(uniforms.uOpacity, s.opacity);\r
      gl.uniform1f(uniforms.uStir, s.mouseReact ? s.stir : 0);\r
      gl.uniform3f(uniforms.uPointer, pointer.x, pointer.y, s.mouseReact ? state.presence : 0);\r
      gl.uniform1f(uniforms.uSheen, s.sheen);\r
      gl.uniform4fv(uniforms.uSwirls, swirlData);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!alive || !visible) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const moving = !s.paused && !reduce;\r
      if (moving) state.phase += dt * s.speed;\r
      const target = s.mouseReact && pointer.tracked ? [pointer.x, pointer.y] : [0.5, 0.5];\r
      const follow = 1 - Math.exp(-dt * 5);\r
      state.mouse[0] += (target[0] - state.mouse[0]) * follow;\r
      state.mouse[1] += (target[1] - state.mouse[1]) * follow;\r
      state.presence += ((pointer.inside ? 1 : 0) - state.presence) * (1 - Math.exp(-dt * 4));\r
      if (state.fieldActive) relaxField(dt);\r
      state.swirls = state.swirls.filter(swirl => (swirl.age += dt) < SWIRL_LIFE);\r
      if (s.grain > 0 && moving) state.seed = Math.floor(now / 42) % 997;\r
      render();\r
      const settling =\r
        Math.abs(target[0] - state.mouse[0]) > 0.0005 ||\r
        Math.abs(target[1] - state.mouse[1]) > 0.0005 ||\r
        Math.abs((pointer.inside ? 1 : 0) - state.presence) > 0.002;\r
      if (moving || settling || state.fieldActive || state.swirls.length) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (raf || !alive || !visible) return;\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const locate = (event: PointerEvent) => {\r
      const rect = root.getBoundingClientRect();\r
      return {\r
        x: (event.clientX - rect.left) / Math.max(1, rect.width),\r
        y: 1 - (event.clientY - rect.top) / Math.max(1, rect.height)\r
      };\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      const { x, y } = locate(event);\r
      const inside = x >= 0 && x <= 1 && y >= 0 && y <= 1;\r
      if (inside && s.mouseReact && !reduce && pointer.inside && s.stir > 0) {\r
        brush(x, y, x - pointer.x, y - pointer.y);\r
      }\r
      pointer.x = x;\r
      pointer.y = y;\r
      pointer.inside = inside;\r
      if (inside) pointer.tracked = true;\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      if (!s.clickSwirl || reduce) return;\r
      const { x, y } = locate(event);\r
      if (x < 0 || x > 1 || y < 0 || y > 1) return;\r
      if (state.swirls.length >= MAX_SWIRLS) {\r
        if (state.swirls[0].age < SWIRL_LIFE - 0.4) return;\r
        state.swirls.shift();\r
      }\r
      state.swirls.push({ x, y, age: 0 });\r
      wake();\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const dpr = Math.min(window.devicePixelRatio || 1, 2) * s.resolution;\r
      state.width = Math.max(1, root.clientWidth);\r
      state.height = Math.max(1, root.clientHeight);\r
      canvas.width = Math.max(1, Math.round(state.width * dpr));\r
      canvas.height = Math.max(1, Math.round(state.height * dpr));\r
      render();\r
      wake();\r
    };\r
\r
    wakeRef.current = () => {\r
      const dpr = Math.min(window.devicePixelRatio || 1, 2) * settingsRef.current.resolution;\r
      if (canvas.width !== Math.max(1, Math.round(state.width * dpr))) resize();\r
      else if (!raf) render();\r
      wake();\r
    };\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(root);\r
    const visibility = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible) {\r
        last = 0;\r
        wake();\r
      }\r
    });\r
    visibility.observe(root);\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    resize();\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      visibility.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      gl.deleteTexture(fieldTexture);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteProgram(program);\r
      gl.deleteShader(vertex);\r
      gl.deleteShader(fragment);\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div ref={rootRef} className={\`iridescence-container\${className ? \` \${className}\` : ''}\`} style={style}>\r
      <canvas ref={canvasRef} className="iridescence-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Iridescence;\r
`,o=`'use client';\r
\r
import React, { useEffect, useRef } from 'react';\r
\r
export interface IridescenceProps {\r
  color?: string | [number, number, number];\r
  speed?: number;\r
  amplitude?: number;\r
  mouseReact?: boolean;\r
  scale?: number;\r
  detail?: number;\r
  rotation?: number;\r
  warp?: number;\r
  hueShift?: number;\r
  saturation?: number;\r
  brightness?: number;\r
  contrast?: number;\r
  stir?: number;\r
  sheen?: number;\r
  clickSwirl?: boolean;\r
  grain?: number;\r
  fade?: number;\r
  opacity?: number;\r
  resolution?: number;\r
  paused?: boolean;\r
  className?: string;\r
  style?: React.CSSProperties;\r
}\r
\r
type Swirl = { x: number; y: number; age: number };\r
\r
const ROOT = 'relative h-full w-full overflow-hidden';\r
const CANVAS = 'absolute inset-0 block h-full w-full';\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
out vec2 vUv;\r
void main() {\r
  vUv = aPosition * 0.5 + 0.5;\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform vec2 uResolution;\r
uniform float uTime;\r
uniform vec3 uColor;\r
uniform vec2 uMouse;\r
uniform float uAmplitude;\r
uniform float uScale;\r
uniform float uRotation;\r
uniform int uDetail;\r
uniform float uWarp;\r
uniform float uHue;\r
uniform float uSaturation;\r
uniform float uBrightness;\r
uniform float uContrast;\r
uniform float uGrain;\r
uniform float uSeed;\r
uniform float uFade;\r
uniform float uOpacity;\r
uniform sampler2D uField;\r
uniform float uStir;\r
uniform vec3 uPointer;\r
uniform float uSheen;\r
uniform vec4 uSwirls[6];\r
in vec2 vUv;\r
out vec4 outColor;\r
\r
vec3 hueRotate(vec3 c, float angle) {\r
  const vec3 k = vec3(0.57735027);\r
  float ca = cos(angle);\r
  return c * ca + cross(k, c) * sin(angle) + k * dot(k, c) * (1.0 - ca);\r
}\r
\r
float smootherstep(float edge, float x) {\r
  float t = clamp(x / edge, 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(443.897, 441.423));\r
  p += dot(p, p.yx + 19.19);\r
  return fract((p.x + p.y) * p.x);\r
}\r
\r
void main() {\r
  float mr = min(uResolution.x, uResolution.y);\r
  vec2 aspect = uResolution / mr;\r
  vec2 st = vUv - texture(uField, vUv).rg * uStir;\r
\r
  for (int k = 0; k < 6; k++) {\r
    vec4 swirl = uSwirls[k];\r
    if (swirl.w == 0.0) continue;\r
    vec2 delta = (st - swirl.xy) * aspect;\r
    float angle = swirl.w * exp(-dot(delta, delta) / (swirl.z * swirl.z));\r
    float ca = cos(angle);\r
    float sa = sin(angle);\r
    st = swirl.xy + vec2(ca * delta.x - sa * delta.y, sa * delta.x + ca * delta.y) / aspect;\r
  }\r
\r
  vec2 uv = (st * 2.0 - 1.0) * aspect;\r
  float c = cos(uRotation);\r
  float s = sin(uRotation);\r
  uv = mat2(c, -s, s, c) * uv / uScale;\r
  uv += (uMouse - vec2(0.5)) * uAmplitude;\r
\r
  float d = -uTime * 0.5;\r
  float a = 0.0;\r
  for (int i = 0; i < 24; i++) {\r
    if (i >= uDetail) break;\r
    float fi = float(i);\r
    a += cos(fi - d - a * uv.x * uWarp);\r
    d += sin(uv.y * fi + a);\r
  }\r
  d += uTime * 0.5;\r
  vec3 col = vec3(cos(uv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);\r
  col = cos(col * cos(vec3(d, a, 2.5)) * 0.5 + 0.5) * uColor;\r
\r
  vec2 toPointer = (vUv - uPointer.xy) * aspect;\r
  col += col * uPointer.z * uSheen * 0.8 * exp(-dot(toPointer, toPointer) / 0.09);\r
\r
  col = hueRotate(col, uHue);\r
  float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));\r
  col = mix(vec3(luma), col, uSaturation);\r
  col = (col - 0.5) * uContrast + 0.5;\r
  col *= uBrightness;\r
  col += (hash(gl_FragCoord.xy + uSeed) - 0.5) * uGrain * 0.12;\r
  col = clamp(col, 0.0, 1.0);\r
\r
  float alpha = uOpacity;\r
  if (uFade > 0.0) {\r
    vec2 px = vUv * uResolution;\r
    float edge = uFade * mr * 0.5;\r
    alpha *= smootherstep(edge, px.x) * smootherstep(edge, uResolution.x - px.x);\r
    alpha *= smootherstep(edge, px.y) * smootherstep(edge, uResolution.y - px.y);\r
  }\r
  outColor = vec4(col * alpha, alpha);\r
}\`;\r
\r
const FIELD_COLUMNS = 48;\r
const MAX_SWIRLS = 6;\r
const SWIRL_LIFE = 3.2;\r
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
const Iridescence = ({\r
  color = [1, 1, 1],\r
  speed = 1,\r
  amplitude = 0.1,\r
  mouseReact = true,\r
  scale = 1,\r
  detail = 8,\r
  rotation = 0,\r
  warp = 1,\r
  hueShift = 0,\r
  saturation = 1,\r
  brightness = 1.5,\r
  contrast = 1,\r
  stir = 0.5,\r
  sheen = 0.3,\r
  clickSwirl = true,\r
  grain = 0,\r
  fade = 0,\r
  opacity = 1,\r
  resolution = 1,\r
  paused = false,\r
  className = '',\r
  style\r
}: IridescenceProps) => {\r
  const rootRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const colorKey = Array.isArray(color) ? color.join(',') : String(color);\r
  const settings = {\r
    colorKey,\r
    color,\r
    speed,\r
    amplitude,\r
    mouseReact,\r
    scale: Math.max(0.05, scale),\r
    detail: clamp(Math.round(detail), 1, 24),\r
    rotation,\r
    warp,\r
    hueShift,\r
    saturation: Math.max(0, saturation),\r
    brightness: Math.max(0, brightness),\r
    contrast: Math.max(0, contrast),\r
    stir: Math.max(0, stir),\r
    sheen: Math.max(0, sheen),\r
    clickSwirl,\r
    grain: clamp(grain, 0, 1),\r
    fade: clamp(fade, 0, 1),\r
    opacity: clamp(opacity, 0, 1),\r
    resolution: clamp(resolution, 0.1, 2),\r
    paused\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    const canvas = canvasRef.current;\r
    const gl = canvas?.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });\r
    if (!root || !canvas || !gl) return undefined;\r
\r
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
    const program = gl.createProgram();\r
    if (!vertex || !fragment || !program) return undefined;\r
    gl.attachShader(program, vertex);\r
    gl.attachShader(program, fragment);\r
    gl.linkProgram(program);\r
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return undefined;\r
    gl.useProgram(program);\r
\r
    const buffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    const position = gl.getAttribLocation(program, 'aPosition');\r
    gl.enableVertexAttribArray(position);\r
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);\r
\r
    const uniforms: Record<string, WebGLUniformLocation | null> = {};\r
    for (const name of [\r
      'uResolution',\r
      'uTime',\r
      'uColor',\r
      'uMouse',\r
      'uAmplitude',\r
      'uScale',\r
      'uRotation',\r
      'uDetail',\r
      'uWarp',\r
      'uHue',\r
      'uSaturation',\r
      'uBrightness',\r
      'uContrast',\r
      'uGrain',\r
      'uSeed',\r
      'uFade',\r
      'uOpacity',\r
      'uField',\r
      'uStir',\r
      'uPointer',\r
      'uSheen',\r
      'uSwirls'\r
    ]) {\r
      uniforms[name] = gl.getUniformLocation(program, name);\r
    }\r
\r
    const fieldTexture = gl.createTexture();\r
    gl.activeTexture(gl.TEXTURE0);\r
    gl.bindTexture(gl.TEXTURE_2D, fieldTexture);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    gl.uniform1i(uniforms.uField, 0);\r
\r
    const probe = document.createElement('canvas');\r
    probe.width = 1;\r
    probe.height = 1;\r
    const probeCtx = probe.getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const pointer = { x: 0.5, y: 0.5, px: 0, py: 0, inside: false, tracked: false };\r
    const state = {\r
      width: 1,\r
      height: 1,\r
      phase: 0,\r
      mouse: [0.5, 0.5] as number[],\r
      presence: 0,\r
      color: [1, 1, 1] as number[],\r
      colorKey: '',\r
      cols: 0,\r
      rows: 0,\r
      field: new Float32Array(0),\r
      scratch: new Float32Array(0),\r
      fieldActive: false,\r
      swirls: [] as Swirl[],\r
      seed: 0\r
    };\r
    const swirlData = new Float32Array(MAX_SWIRLS * 4);\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let alive = true;\r
\r
    const resolveColor = (s: typeof settings) => {\r
      if (s.colorKey === state.colorKey) return;\r
      state.colorKey = s.colorKey;\r
      if (Array.isArray(s.color)) {\r
        const rgb = s.color as number[];\r
        state.color = [0, 1, 2].map(i => clamp(Number(rgb[i] ?? 1), 0, 1));\r
        return;\r
      }\r
      if (!probeCtx) return;\r
      probeCtx.clearRect(0, 0, 1, 1);\r
      probeCtx.fillStyle = '#ffffff';\r
      probeCtx.fillStyle = String(s.color);\r
      probeCtx.fillRect(0, 0, 1, 1);\r
      const [r, g, b] = probeCtx.getImageData(0, 0, 1, 1).data;\r
      state.color = [r / 255, g / 255, b / 255];\r
    };\r
\r
    const layoutField = () => {\r
      const cols = FIELD_COLUMNS;\r
      const rows = clamp(Math.round((cols * state.height) / state.width), 6, 96);\r
      if (cols === state.cols && rows === state.rows) return;\r
      state.cols = cols;\r
      state.rows = rows;\r
      state.field = new Float32Array(cols * rows * 2);\r
      state.scratch = new Float32Array(cols * rows * 2);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, fieldTexture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG16F, cols, rows, 0, gl.RG, gl.FLOAT, state.field);\r
    };\r
\r
    const brush = (x: number, y: number, dx: number, dy: number) => {\r
      const { cols, rows, field } = state;\r
      const radius = 0.22;\r
      const aspect = state.width / state.height;\r
      const fromCol = Math.max(0, Math.floor((x - radius / aspect) * cols));\r
      const toCol = Math.min(cols - 1, Math.ceil((x + radius / aspect) * cols));\r
      const fromRow = Math.max(0, Math.floor((y - radius) * rows));\r
      const toRow = Math.min(rows - 1, Math.ceil((y + radius) * rows));\r
      for (let row = fromRow; row <= toRow; row++) {\r
        for (let col = fromCol; col <= toCol; col++) {\r
          const ox = ((col + 0.5) / cols - x) * aspect;\r
          const oy = (row + 0.5) / rows - y;\r
          const t = 1 - (ox * ox + oy * oy) / (radius * radius);\r
          if (t <= 0) continue;\r
          const i = (row * cols + col) * 2;\r
          const px = field[i] + dx * t * t * 3.2;\r
          const py = field[i + 1] + dy * t * t * 3.2;\r
          const length = Math.hypot(px, py);\r
          const limit = 0.4;\r
          const k = length > 0 ? (limit * Math.tanh(length / limit)) / length : 0;\r
          field[i] = px * k;\r
          field[i + 1] = py * k;\r
        }\r
      }\r
      state.fieldActive = true;\r
    };\r
\r
    const relaxField = (dt: number) => {\r
      const { cols, rows, field, scratch } = state;\r
      const decay = Math.exp(-dt * 1.4);\r
      let peak = 0;\r
      for (let row = 0; row < rows; row++) {\r
        for (let col = 0; col < cols; col++) {\r
          const i = (row * cols + col) * 2;\r
          const l = (row * cols + Math.max(0, col - 1)) * 2;\r
          const r = (row * cols + Math.min(cols - 1, col + 1)) * 2;\r
          const u = (Math.max(0, row - 1) * cols + col) * 2;\r
          const b = (Math.min(rows - 1, row + 1) * cols + col) * 2;\r
          for (let c = 0; c < 2; c++) {\r
            const value = (field[i + c] * 12 + field[l + c] + field[r + c] + field[u + c] + field[b + c]) / 16;\r
            scratch[i + c] = value * decay;\r
            peak = Math.max(peak, Math.abs(scratch[i + c]));\r
          }\r
        }\r
      }\r
      field.set(scratch);\r
      if (peak < 0.0004) {\r
        field.fill(0);\r
        state.fieldActive = false;\r
      }\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      resolveColor(s);\r
      layoutField();\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, fieldTexture);\r
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, state.cols, state.rows, gl.RG, gl.FLOAT, state.field);\r
      swirlData.fill(0);\r
      state.swirls.forEach((swirl, k) => {\r
        const radius = 0.21 * (1 + 0.4 * swirl.age);\r
        const ease = Math.exp(-swirl.age * 1.35) - Math.exp(-swirl.age * 10);\r
        const fade = Math.min(1, (SWIRL_LIFE - swirl.age) / 0.8);\r
        swirlData.set([swirl.x, swirl.y, radius, 3 * ease * fade * (0.21 / radius) ** 2], k * 4);\r
      });\r
      gl.uniform2f(uniforms.uResolution, state.width, state.height);\r
      gl.uniform1f(uniforms.uTime, state.phase);\r
      gl.uniform3f(uniforms.uColor, state.color[0], state.color[1], state.color[2]);\r
      gl.uniform2f(uniforms.uMouse, state.mouse[0], state.mouse[1]);\r
      gl.uniform1f(uniforms.uAmplitude, s.amplitude);\r
      gl.uniform1f(uniforms.uScale, s.scale);\r
      gl.uniform1f(uniforms.uRotation, (s.rotation * Math.PI) / 180);\r
      gl.uniform1i(uniforms.uDetail, s.detail);\r
      gl.uniform1f(uniforms.uWarp, s.warp);\r
      gl.uniform1f(uniforms.uHue, (s.hueShift * Math.PI) / 180);\r
      gl.uniform1f(uniforms.uSaturation, s.saturation);\r
      gl.uniform1f(uniforms.uBrightness, s.brightness);\r
      gl.uniform1f(uniforms.uContrast, s.contrast);\r
      gl.uniform1f(uniforms.uGrain, s.grain);\r
      gl.uniform1f(uniforms.uSeed, state.seed);\r
      gl.uniform1f(uniforms.uFade, s.fade);\r
      gl.uniform1f(uniforms.uOpacity, s.opacity);\r
      gl.uniform1f(uniforms.uStir, s.mouseReact ? s.stir : 0);\r
      gl.uniform3f(uniforms.uPointer, pointer.x, pointer.y, s.mouseReact ? state.presence : 0);\r
      gl.uniform1f(uniforms.uSheen, s.sheen);\r
      gl.uniform4fv(uniforms.uSwirls, swirlData);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!alive || !visible) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const moving = !s.paused && !reduce;\r
      if (moving) state.phase += dt * s.speed;\r
      const target = s.mouseReact && pointer.tracked ? [pointer.x, pointer.y] : [0.5, 0.5];\r
      const follow = 1 - Math.exp(-dt * 5);\r
      state.mouse[0] += (target[0] - state.mouse[0]) * follow;\r
      state.mouse[1] += (target[1] - state.mouse[1]) * follow;\r
      state.presence += ((pointer.inside ? 1 : 0) - state.presence) * (1 - Math.exp(-dt * 4));\r
      if (state.fieldActive) relaxField(dt);\r
      state.swirls = state.swirls.filter(swirl => (swirl.age += dt) < SWIRL_LIFE);\r
      if (s.grain > 0 && moving) state.seed = Math.floor(now / 42) % 997;\r
      render();\r
      const settling =\r
        Math.abs(target[0] - state.mouse[0]) > 0.0005 ||\r
        Math.abs(target[1] - state.mouse[1]) > 0.0005 ||\r
        Math.abs((pointer.inside ? 1 : 0) - state.presence) > 0.002;\r
      if (moving || settling || state.fieldActive || state.swirls.length) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (raf || !alive || !visible) return;\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const locate = (event: PointerEvent) => {\r
      const rect = root.getBoundingClientRect();\r
      return {\r
        x: (event.clientX - rect.left) / Math.max(1, rect.width),\r
        y: 1 - (event.clientY - rect.top) / Math.max(1, rect.height)\r
      };\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      const { x, y } = locate(event);\r
      const inside = x >= 0 && x <= 1 && y >= 0 && y <= 1;\r
      if (inside && s.mouseReact && !reduce && pointer.inside && s.stir > 0) {\r
        brush(x, y, x - pointer.x, y - pointer.y);\r
      }\r
      pointer.x = x;\r
      pointer.y = y;\r
      pointer.inside = inside;\r
      if (inside) pointer.tracked = true;\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      if (!s.clickSwirl || reduce) return;\r
      const { x, y } = locate(event);\r
      if (x < 0 || x > 1 || y < 0 || y > 1) return;\r
      if (state.swirls.length >= MAX_SWIRLS) {\r
        if (state.swirls[0].age < SWIRL_LIFE - 0.4) return;\r
        state.swirls.shift();\r
      }\r
      state.swirls.push({ x, y, age: 0 });\r
      wake();\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const dpr = Math.min(window.devicePixelRatio || 1, 2) * s.resolution;\r
      state.width = Math.max(1, root.clientWidth);\r
      state.height = Math.max(1, root.clientHeight);\r
      canvas.width = Math.max(1, Math.round(state.width * dpr));\r
      canvas.height = Math.max(1, Math.round(state.height * dpr));\r
      render();\r
      wake();\r
    };\r
\r
    wakeRef.current = () => {\r
      const dpr = Math.min(window.devicePixelRatio || 1, 2) * settingsRef.current.resolution;\r
      if (canvas.width !== Math.max(1, Math.round(state.width * dpr))) resize();\r
      else if (!raf) render();\r
      wake();\r
    };\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(root);\r
    const visibility = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible) {\r
        last = 0;\r
        wake();\r
      }\r
    });\r
    visibility.observe(root);\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    resize();\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      visibility.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      gl.deleteTexture(fieldTexture);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteProgram(program);\r
      gl.deleteShader(vertex);\r
      gl.deleteShader(fragment);\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div ref={rootRef} className={\`\${ROOT}\${className ? \` \${className}\` : ''}\`} style={style}>\r
      <canvas ref={canvasRef} className={CANVAS} aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Iridescence;\r
`,s={usage:`import Iridescence from './Iridescence';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <Iridescence
    color="#8099cc"
    hueShift={0}
    saturation={1}
    brightness={1.5}
    contrast={1}
    speed={1}
    scale={1}
    detail={8}
    warp={1}
    rotation={0}
    mouseReact={true}
    amplitude={0.1}
    stir={0.5}
    sheen={0.3}
    clickSwirl={true}
    grain={0}
    fade={0}
  />
</div>`,code:r,css:n,tailwind:e,tsCode:t,tsTailwind:o};export{s as iridescence};
