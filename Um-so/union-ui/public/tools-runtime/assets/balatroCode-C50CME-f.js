const r=`'use client';\r
\r
import { useEffect, useRef, useState } from 'react';\r
import './Balatro.css';\r
\r
const PIXEL_BUDGET = 2.4e6;\r
const MAX_TWIRLS = 4;\r
const FIELD_SCALE = 8;\r
const STIR_RADIUS = 90;\r
\r
const VERTEX = \`#version 300 es\r
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));\r
void main() {\r
  gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);\r
}\`;\r
\r
const FIELD = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uPrev;\r
uniform vec2 uSize;\r
uniform vec2 uCss;\r
uniform vec2 uFrom;\r
uniform vec2 uTo;\r
uniform vec2 uPush;\r
uniform float uRadius;\r
uniform float uDecay;\r
out vec4 fragColor;\r
\r
void main() {\r
  vec2 cell = gl_FragCoord.xy / uSize;\r
  vec2 p = vec2(cell.x, 1.0 - cell.y) * uCss;\r
  vec2 seg = uTo - uFrom;\r
  float len2 = max(dot(seg, seg), 1e-6);\r
  float h = clamp(dot(p - uFrom, seg) / len2, 0.0, 1.0);\r
  vec2 gap = p - uFrom - seg * h;\r
  vec2 delta = uPush * exp(-dot(gap, gap) / (uRadius * uRadius));\r
  vec2 src = p - delta;\r
  vec2 prev = texture(uPrev, vec2(src.x / uCss.x, 1.0 - src.y / uCss.y)).xy;\r
  fragColor = vec4((prev + delta) * uDecay, 0.0, 1.0);\r
}\`;\r
\r
const PAINT = \`#version 300 es\r
precision highp float;\r
uniform vec2 uCss;\r
uniform vec2 uCanvas;\r
uniform float uBlock;\r
uniform float uFlow;\r
uniform float uSpin;\r
uniform vec2 uOffset;\r
uniform vec3 uColor1;\r
uniform vec3 uColor2;\r
uniform vec3 uColor3;\r
uniform float uContrast;\r
uniform float uLighting;\r
uniform float uSwirl;\r
uniform float uScale;\r
uniform int uDetail;\r
uniform sampler2D uField;\r
uniform float uFieldOn;\r
uniform vec4 uTwirls[\${MAX_TWIRLS}];\r
uniform float uReveal;\r
uniform float uLight;\r
uniform float uOpacity;\r
out vec4 fragColor;\r
\r
vec3 paint(vec2 screenSize, vec2 coords) {\r
  vec2 uv = (coords - 0.5 * screenSize) / length(screenSize) - uOffset;\r
  float radius = length(uv);\r
  float speed = uSpin + 302.2;\r
  float angle = atan(uv.y, uv.x) + speed - 20.0 * (uSwirl * radius + (1.0 - uSwirl));\r
  vec2 mid = (screenSize / length(screenSize)) / 2.0;\r
  uv = vec2(radius * cos(angle) + mid.x, radius * sin(angle) + mid.y) - mid;\r
\r
  uv *= 30.0 / uScale;\r
  speed = uFlow;\r
  vec2 uv2 = vec2(uv.x + uv.y);\r
  for (int i = 0; i < 8; i++) {\r
    if (i >= uDetail) break;\r
    uv2 += sin(max(uv.x, uv.y)) + uv;\r
    uv += 0.5 * vec2(cos(5.1123314 + 0.353 * uv2.y + speed * 0.131121), sin(uv2.x - 0.113 * speed));\r
    uv -= cos(uv.x + uv.y) - sin(uv.x * 0.711 - uv.y);\r
  }\r
\r
  float contrastMod = 0.25 * uContrast + 0.5 * uSwirl + 1.2;\r
  float amount = min(2.0, max(0.0, length(uv) * 0.035 * contrastMod));\r
  float c1 = max(0.0, 1.0 - contrastMod * abs(1.0 - amount));\r
  float c2 = max(0.0, 1.0 - contrastMod * abs(amount));\r
  float c3 = 1.0 - min(1.0, c1 + c2);\r
  float light = (uLighting - 0.2) * max(c1 * 5.0 - 4.0, 0.0) + uLighting * max(c2 * 5.0 - 4.0, 0.0);\r
  vec3 gap = uLight > 0.5 ? mix(uColor3, vec3(1.0), 0.9) : uColor3;\r
  float base = 0.3 / uContrast;\r
  vec3 color = base * uColor1 + (1.0 - base) * (uColor1 * c1 + uColor2 * c2 + gap * c3) + light;\r
  return mix(gap, color, uReveal);\r
}\r
\r
void main() {\r
  vec2 cell = floor(gl_FragCoord.xy) + 0.5;\r
  vec2 p = vec2(cell.x, uCanvas.y - cell.y) * uBlock;\r
  if (uFieldOn > 0.5) {\r
    p -= texture(uField, vec2(p.x / uCss.x, 1.0 - p.y / uCss.y)).xy;\r
  }\r
  for (int i = 0; i < \${MAX_TWIRLS}; i++) {\r
    vec4 twirl = uTwirls[i];\r
    if (twirl.w <= 0.0) continue;\r
    vec2 rel = p - twirl.xy;\r
    float turn = twirl.z * exp(-dot(rel, rel) / (twirl.w * twirl.w));\r
    float c = cos(turn);\r
    float s = sin(turn);\r
    p = twirl.xy + vec2(c * rel.x - s * rel.y, s * rel.x + c * rel.y);\r
  }\r
  vec3 color = paint(uCss, vec2(p.x, uCss.y - p.y));\r
  float grain = (fract(52.9829189 * fract(dot(cell, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;\r
  color = clamp(color + grain, 0.0, 1.0);\r
  fragColor = vec4(color * uOpacity, uOpacity);\r
}\`;\r
\r
const SCREEN = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uPaint;\r
uniform vec2 uCanvas;\r
uniform vec2 uSource;\r
uniform float uDevice;\r
uniform float uCrt;\r
out vec4 fragColor;\r
\r
float smoother(float edge0, float edge1, float x) {\r
  float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  vec2 device = vec2(gl_FragCoord.x, uCanvas.y - gl_FragCoord.y);\r
  vec2 cell = floor(device / uDevice);\r
  vec4 texel = texture(uPaint, vec2((cell.x + 0.5) / uSource.x, 1.0 - (cell.y + 0.5) / uSource.y));\r
  vec3 color = texel.rgb;\r
  float glow = dot(color, vec3(0.2126, 0.7152, 0.0722));\r
  float period = max(uDevice, 3.0);\r
  float row = fract(device.y / period);\r
  float line = smoother(0.5, 0.92, row) * (1.0 - smoother(0.92, 1.0, row));\r
  color *= 1.0 - uCrt * 0.34 * line * (1.0 - 0.7 * glow);\r
  vec2 screen = gl_FragCoord.xy / uCanvas;\r
  float edge = smoother(0.0, 0.18, screen.x) * smoother(0.0, 0.18, 1.0 - screen.x);\r
  edge *= smoother(0.0, 0.24, screen.y) * smoother(0.0, 0.24, 1.0 - screen.y);\r
  color *= mix(1.0, 0.78 + 0.22 * edge, uCrt);\r
  color *= 1.0 + uCrt * 0.1;\r
  fragColor = vec4(min(color, vec3(texel.a)), texel.a);\r
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
  return null;\r
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
const link = (gl, source) => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, source);\r
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
const smoother = t => {\r
  const x = clamp(t, 0, 1);\r
  return x * x * x * (x * (x * 6 - 15) + 10);\r
};\r
\r
const Balatro = ({\r
  color1 = '#DE443B',\r
  color2 = '#006BB4',\r
  color3 = '#162325',\r
  contrast = 3.5,\r
  lighting = 0.4,\r
  swirl = 0.25,\r
  speed = 1,\r
  rotationSpeed = 0,\r
  scale = 1,\r
  detail = 5,\r
  offset = [0, 0],\r
  pixelSize = 1.5,\r
  crt = 0,\r
  mouseInteraction = true,\r
  mouseStrength = 1,\r
  clickSwirl = true,\r
  intro = true,\r
  lightMode = false,\r
  opacity = 1,\r
  maxDevicePixelRatio = 2,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const [generation, setGeneration] = useState(0);\r
\r
  const settings = {\r
    color1: parseColor(color1) || [0.871, 0.267, 0.231],\r
    color2: parseColor(color2) || [0, 0.42, 0.706],\r
    color3: parseColor(color3) || [0.086, 0.137, 0.145],\r
    contrast: clamp(contrast, 0.5, 10),\r
    lighting: clamp(lighting, 0, 1.5),\r
    swirl: clamp(swirl, 0, 1),\r
    speed: Math.max(0, speed),\r
    rotation: clamp(rotationSpeed, -10, 10),\r
    scale: clamp(scale, 0.2, 5),\r
    detail: clamp(Math.round(detail), 1, 8),\r
    offset: Array.isArray(offset) ? [Number(offset[0]) || 0, Number(offset[1]) || 0] : [0, 0],\r
    pixelSize: clamp(pixelSize, 0, 24),\r
    crt: clamp(crt, 0, 1),\r
    mouse: mouseInteraction,\r
    strength: clamp(mouseStrength, 0, 3),\r
    clickSwirl,\r
    intro,\r
    light: lightMode,\r
    opacity: clamp(opacity, 0, 1),\r
    maxRatio: clamp(maxDevicePixelRatio, 0.5, 3)\r
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
      powerPreference: 'high-performance'\r
    });\r
    const paintProgram = gl ? link(gl, PAINT) : null;\r
    const screenProgram = gl ? link(gl, SCREEN) : null;\r
    if (!gl || !paintProgram || !screenProgram) return;\r
    const floatTargets = !!(\r
      gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float')\r
    );\r
    const fieldProgram = floatTargets ? link(gl, FIELD) : null;\r
\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
    const vao = gl.createVertexArray();\r
    const view = { cssWidth: 1, cssHeight: 1, block: 1, device: 1, width: 1, height: 1, crt: false };\r
    const paintTarget = { texture: gl.createTexture(), framebuffer: gl.createFramebuffer(), width: 0, height: 0 };\r
    const field = { width: 0, height: 0, targets: [], energy: 0 };\r
    const pointer = { x: 0, y: 0, lastX: 0, lastY: 0, vx: 0, inside: false, ready: false };\r
    const steer = { value: 0 };\r
    const twirls = [];\r
    const twirlData = new Float32Array(MAX_TWIRLS * 4);\r
    let flow = 14;\r
    let spin = 0;\r
    let opening = settingsRef.current.intro && !reduced && generation === 0 ? 0 : 1;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let pageVisible = document.visibilityState !== 'hidden';\r
    let lost = false;\r
\r
    const makeTarget = (width, height) => {\r
      const texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG16F, width, height, 0, gl.RG, gl.HALF_FLOAT, null);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      const framebuffer = gl.createFramebuffer();\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      return { texture, framebuffer };\r
    };\r
\r
    const dropField = () => {\r
      field.targets.forEach(target => {\r
        gl.deleteTexture(target.texture);\r
        gl.deleteFramebuffer(target.framebuffer);\r
      });\r
      field.targets = [];\r
      field.width = 0;\r
      field.height = 0;\r
      field.energy = 0;\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const rect = container.getBoundingClientRect();\r
      const cssWidth = Math.max(1, rect.width);\r
      const cssHeight = Math.max(1, rect.height);\r
      const dpr = Math.min(window.devicePixelRatio || 1, s.maxRatio);\r
      const budget = Math.ceil(Math.sqrt((cssWidth * cssHeight * dpr * dpr) / PIXEL_BUDGET) - 0.05);\r
      const device = Math.max(s.pixelSize > 0 ? Math.round(s.pixelSize * dpr) : 1, budget, 1);\r
      const width = Math.max(1, Math.ceil((cssWidth * dpr) / device));\r
      const height = Math.max(1, Math.ceil((cssHeight * dpr) / device));\r
      const crt = s.crt > 0;\r
      const canvasWidth = crt ? width * device : width;\r
      const canvasHeight = crt ? height * device : height;\r
      if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {\r
        canvas.width = canvasWidth;\r
        canvas.height = canvasHeight;\r
      }\r
      canvas.style.width = \`\${(width * device) / dpr}px\`;\r
      canvas.style.height = \`\${(height * device) / dpr}px\`;\r
      canvas.style.imageRendering = !crt && s.pixelSize > 0 && device >= 2 ? 'pixelated' : 'auto';\r
      if (crt && (paintTarget.width !== width || paintTarget.height !== height)) {\r
        gl.bindTexture(gl.TEXTURE_2D, paintTarget.texture);\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, paintTarget.framebuffer);\r
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, paintTarget.texture, 0);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
        paintTarget.width = width;\r
        paintTarget.height = height;\r
      }\r
      view.cssWidth = cssWidth;\r
      view.cssHeight = cssHeight;\r
      view.block = device / dpr;\r
      view.device = device;\r
      view.width = width;\r
      view.height = height;\r
      view.crt = crt;\r
      if (!fieldProgram) return;\r
      const fieldWidth = clamp(Math.ceil(cssWidth / FIELD_SCALE), 8, 320);\r
      const fieldHeight = clamp(Math.ceil(cssHeight / FIELD_SCALE), 8, 320);\r
      if (fieldWidth === field.width && fieldHeight === field.height) return;\r
      dropField();\r
      field.width = fieldWidth;\r
      field.height = fieldHeight;\r
      field.targets = [makeTarget(fieldWidth, fieldHeight), makeTarget(fieldWidth, fieldHeight)];\r
    };\r
\r
    const stir = (fromX, fromY, toX, toY, pushX, pushY, decay) => {\r
      if (!fieldProgram) return;\r
      const [read, write] = field.targets;\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, write.framebuffer);\r
      gl.viewport(0, 0, field.width, field.height);\r
      gl.useProgram(fieldProgram.program);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, read.texture);\r
      const u = fieldProgram.uniforms;\r
      gl.uniform1i(u.uPrev, 0);\r
      gl.uniform2f(u.uSize, field.width, field.height);\r
      gl.uniform2f(u.uCss, view.cssWidth, view.cssHeight);\r
      gl.uniform2f(u.uFrom, fromX, fromY);\r
      gl.uniform2f(u.uTo, toX, toY);\r
      gl.uniform2f(u.uPush, pushX, pushY);\r
      gl.uniform1f(u.uRadius, STIR_RADIUS);\r
      gl.uniform1f(u.uDecay, decay);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      field.targets = [write, read];\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (lost) return;\r
      const s = settingsRef.current;\r
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05);\r
      last = Math.max(last, now);\r
      const pace = reduced ? 0.2 : 1;\r
      flow += dt * s.speed * 7 * pace;\r
      spin += dt * s.rotation * 0.2 * pace;\r
      if (opening < 1) opening = Math.min(1, opening + dt / 2.2);\r
\r
      const tracking = s.mouse && pointer.inside;\r
      const steerTarget = tracking ? (pointer.x / view.cssWidth - 0.5) * 0.35 * s.strength : 0;\r
      steer.value += (steerTarget - steer.value) * (1 - Math.exp(-dt / 0.8));\r
\r
      gl.bindVertexArray(vao);\r
      if (fieldProgram && field.targets.length) {\r
        const dx = pointer.x - pointer.lastX;\r
        const dy = pointer.y - pointer.lastY;\r
        const moved = tracking && pointer.ready && (dx !== 0 || dy !== 0);\r
        const decay = Math.exp(-dt / 1.6);\r
        if (moved || field.energy > 0.05) {\r
          const amount = 0.85 * s.strength * (reduced ? 0.4 : 1);\r
          const travel = moved ? Math.hypot(dx, dy) * amount : 0;\r
          const steps = Math.max(1, Math.ceil(travel / (STIR_RADIUS * 0.3)));\r
          for (let step = 0; step < steps; step++) {\r
            const a = step / steps;\r
            const b = (step + 1) / steps;\r
            stir(\r
              pointer.lastX + dx * a,\r
              pointer.lastY + dy * a,\r
              pointer.lastX + dx * b,\r
              pointer.lastY + dy * b,\r
              moved ? dx * (b - a) * amount : 0,\r
              moved ? dy * (b - a) * amount : 0,\r
              step === steps - 1 ? decay : 1\r
            );\r
          }\r
          field.energy = field.energy * decay + travel;\r
          if (field.energy <= 0.05) {\r
            field.targets.forEach(target => {\r
              gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);\r
              gl.clearColor(0, 0, 0, 0);\r
              gl.clear(gl.COLOR_BUFFER_BIT);\r
            });\r
          }\r
        }\r
      }\r
      pointer.lastX = pointer.x;\r
      pointer.lastY = pointer.y;\r
\r
      for (let index = twirls.length - 1; index >= 0; index--) {\r
        twirls[index].age += dt;\r
        if (twirls[index].age >= 3.2) twirls.splice(index, 1);\r
      }\r
      twirlData.fill(0);\r
      twirls.forEach((twirl, index) => {\r
        const t = twirl.age;\r
        const rise = smoother(t / 0.25);\r
        const fall = 1 - smoother((t - 0.25) / 2.95);\r
        twirlData[index * 4] = twirl.x;\r
        twirlData[index * 4 + 1] = twirl.y;\r
        twirlData[index * 4 + 2] = twirl.direction * 1.9 * rise * fall;\r
        twirlData[index * 4 + 3] = 150 * (1 + 0.6 * smoother(t / 3.2));\r
      });\r
\r
      const eased = 1 - Math.pow(1 - opening, 3);\r
      const unwind = 1 - eased;\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, view.crt ? paintTarget.framebuffer : null);\r
      gl.viewport(0, 0, view.width, view.height);\r
      gl.useProgram(paintProgram.program);\r
      const u = paintProgram.uniforms;\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, field.targets.length ? field.targets[0].texture : null);\r
      gl.uniform1i(u.uField, 0);\r
      gl.uniform1f(u.uFieldOn, field.targets.length && field.energy > 0.05 ? 1 : 0);\r
      gl.uniform2f(u.uCss, view.cssWidth, view.cssHeight);\r
      gl.uniform2f(u.uCanvas, view.width, view.height);\r
      gl.uniform1f(u.uBlock, view.block);\r
      gl.uniform1f(u.uFlow, flow);\r
      gl.uniform1f(u.uSpin, -0.4 + spin + steer.value + 2.6 * unwind * unwind);\r
      gl.uniform2f(u.uOffset, s.offset[0], s.offset[1]);\r
      gl.uniform3f(u.uColor1, s.color1[0], s.color1[1], s.color1[2]);\r
      gl.uniform3f(u.uColor2, s.color2[0], s.color2[1], s.color2[2]);\r
      gl.uniform3f(u.uColor3, s.color3[0], s.color3[1], s.color3[2]);\r
      gl.uniform1f(u.uContrast, s.contrast);\r
      gl.uniform1f(u.uLighting, s.lighting);\r
      gl.uniform1f(u.uSwirl, Math.min(1, s.swirl + 0.55 * unwind));\r
      gl.uniform1f(u.uScale, s.scale);\r
      gl.uniform1i(u.uDetail, s.detail);\r
      gl.uniform4fv(u.uTwirls, twirlData);\r
      gl.uniform1f(u.uReveal, smoother(opening / 0.45));\r
      gl.uniform1f(u.uLight, s.light ? 1 : 0);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      if (view.crt) {\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
        gl.viewport(0, 0, canvas.width, canvas.height);\r
        gl.useProgram(screenProgram.program);\r
        const v = screenProgram.uniforms;\r
        gl.activeTexture(gl.TEXTURE0);\r
        gl.bindTexture(gl.TEXTURE_2D, paintTarget.texture);\r
        gl.uniform1i(v.uPaint, 0);\r
        gl.uniform2f(v.uCanvas, canvas.width, canvas.height);\r
        gl.uniform2f(v.uSource, view.width, view.height);\r
        gl.uniform1f(v.uDevice, view.device);\r
        gl.uniform1f(v.uCrt, s.crt);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      }\r
\r
      const settling = Math.abs(steerTarget - steer.value) > 0.0005 || field.energy > 0.05 || twirls.length > 0;\r
      const busy = s.speed > 0 || s.rotation !== 0 || opening < 1 || settling;\r
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
      return {\r
        x: event.clientX - rect.left,\r
        y: event.clientY - rect.top,\r
        inside:\r
          event.clientX >= rect.left &&\r
          event.clientX <= rect.right &&\r
          event.clientY >= rect.top &&\r
          event.clientY <= rect.bottom\r
      };\r
    };\r
\r
    const onPointerMove = event => {\r
      const spot = locate(event);\r
      if (!pointer.ready || !pointer.inside) {\r
        pointer.lastX = spot.x;\r
        pointer.lastY = spot.y;\r
      }\r
      pointer.vx = spot.x - pointer.x;\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = spot.inside;\r
      pointer.ready = true;\r
      wake();\r
    };\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      const spot = locate(event);\r
      if (!spot.inside || !s.clickSwirl || reduced) return;\r
      twirls.push({ x: spot.x, y: spot.y, age: 0, direction: pointer.vx < 0 ? 1 : -1 });\r
      if (twirls.length > MAX_TWIRLS) twirls.shift();\r
      wake();\r
    };\r
    const onLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
    const onPointerUp = event => {\r
      if (event.pointerType !== 'mouse') onLeave();\r
    };\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    window.addEventListener('pointerup', onPointerUp, { passive: true });\r
    window.addEventListener('pointercancel', onPointerUp, { passive: true });\r
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
      window.removeEventListener('pointerup', onPointerUp);\r
      window.removeEventListener('pointercancel', onPointerUp);\r
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      canvas.removeEventListener('webglcontextlost', onLost);\r
      canvas.removeEventListener('webglcontextrestored', onRestored);\r
      if (!gl.isContextLost()) {\r
        dropField();\r
        gl.deleteTexture(paintTarget.texture);\r
        gl.deleteFramebuffer(paintTarget.framebuffer);\r
        gl.deleteVertexArray(vao);\r
        gl.deleteProgram(paintProgram.program);\r
        gl.deleteProgram(screenProgram.program);\r
        if (fieldProgram) gl.deleteProgram(fieldProgram.program);\r
      }\r
    };\r
  }, [generation]);\r
\r
  return (\r
    <div ref={containerRef} className={\`balatro\${className ? \` \${className}\` : ''}\`} style={style}>\r
      <canvas ref={canvasRef} className="balatro__canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Balatro;\r
`,e=`.balatro {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.balatro__canvas {\r
  position: absolute;\r
  inset: 0;\r
  display: block;\r
  width: 100%;\r
  height: 100%;\r
}\r
`,n=`'use client';\r
\r
import { useEffect, useRef, useState } from 'react';\r
\r
const PIXEL_BUDGET = 2.4e6;\r
const MAX_TWIRLS = 4;\r
const FIELD_SCALE = 8;\r
const STIR_RADIUS = 90;\r
\r
const VERTEX = \`#version 300 es\r
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));\r
void main() {\r
  gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);\r
}\`;\r
\r
const FIELD = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uPrev;\r
uniform vec2 uSize;\r
uniform vec2 uCss;\r
uniform vec2 uFrom;\r
uniform vec2 uTo;\r
uniform vec2 uPush;\r
uniform float uRadius;\r
uniform float uDecay;\r
out vec4 fragColor;\r
\r
void main() {\r
  vec2 cell = gl_FragCoord.xy / uSize;\r
  vec2 p = vec2(cell.x, 1.0 - cell.y) * uCss;\r
  vec2 seg = uTo - uFrom;\r
  float len2 = max(dot(seg, seg), 1e-6);\r
  float h = clamp(dot(p - uFrom, seg) / len2, 0.0, 1.0);\r
  vec2 gap = p - uFrom - seg * h;\r
  vec2 delta = uPush * exp(-dot(gap, gap) / (uRadius * uRadius));\r
  vec2 src = p - delta;\r
  vec2 prev = texture(uPrev, vec2(src.x / uCss.x, 1.0 - src.y / uCss.y)).xy;\r
  fragColor = vec4((prev + delta) * uDecay, 0.0, 1.0);\r
}\`;\r
\r
const PAINT = \`#version 300 es\r
precision highp float;\r
uniform vec2 uCss;\r
uniform vec2 uCanvas;\r
uniform float uBlock;\r
uniform float uFlow;\r
uniform float uSpin;\r
uniform vec2 uOffset;\r
uniform vec3 uColor1;\r
uniform vec3 uColor2;\r
uniform vec3 uColor3;\r
uniform float uContrast;\r
uniform float uLighting;\r
uniform float uSwirl;\r
uniform float uScale;\r
uniform int uDetail;\r
uniform sampler2D uField;\r
uniform float uFieldOn;\r
uniform vec4 uTwirls[\${MAX_TWIRLS}];\r
uniform float uReveal;\r
uniform float uLight;\r
uniform float uOpacity;\r
out vec4 fragColor;\r
\r
vec3 paint(vec2 screenSize, vec2 coords) {\r
  vec2 uv = (coords - 0.5 * screenSize) / length(screenSize) - uOffset;\r
  float radius = length(uv);\r
  float speed = uSpin + 302.2;\r
  float angle = atan(uv.y, uv.x) + speed - 20.0 * (uSwirl * radius + (1.0 - uSwirl));\r
  vec2 mid = (screenSize / length(screenSize)) / 2.0;\r
  uv = vec2(radius * cos(angle) + mid.x, radius * sin(angle) + mid.y) - mid;\r
\r
  uv *= 30.0 / uScale;\r
  speed = uFlow;\r
  vec2 uv2 = vec2(uv.x + uv.y);\r
  for (int i = 0; i < 8; i++) {\r
    if (i >= uDetail) break;\r
    uv2 += sin(max(uv.x, uv.y)) + uv;\r
    uv += 0.5 * vec2(cos(5.1123314 + 0.353 * uv2.y + speed * 0.131121), sin(uv2.x - 0.113 * speed));\r
    uv -= cos(uv.x + uv.y) - sin(uv.x * 0.711 - uv.y);\r
  }\r
\r
  float contrastMod = 0.25 * uContrast + 0.5 * uSwirl + 1.2;\r
  float amount = min(2.0, max(0.0, length(uv) * 0.035 * contrastMod));\r
  float c1 = max(0.0, 1.0 - contrastMod * abs(1.0 - amount));\r
  float c2 = max(0.0, 1.0 - contrastMod * abs(amount));\r
  float c3 = 1.0 - min(1.0, c1 + c2);\r
  float light = (uLighting - 0.2) * max(c1 * 5.0 - 4.0, 0.0) + uLighting * max(c2 * 5.0 - 4.0, 0.0);\r
  vec3 gap = uLight > 0.5 ? mix(uColor3, vec3(1.0), 0.9) : uColor3;\r
  float base = 0.3 / uContrast;\r
  vec3 color = base * uColor1 + (1.0 - base) * (uColor1 * c1 + uColor2 * c2 + gap * c3) + light;\r
  return mix(gap, color, uReveal);\r
}\r
\r
void main() {\r
  vec2 cell = floor(gl_FragCoord.xy) + 0.5;\r
  vec2 p = vec2(cell.x, uCanvas.y - cell.y) * uBlock;\r
  if (uFieldOn > 0.5) {\r
    p -= texture(uField, vec2(p.x / uCss.x, 1.0 - p.y / uCss.y)).xy;\r
  }\r
  for (int i = 0; i < \${MAX_TWIRLS}; i++) {\r
    vec4 twirl = uTwirls[i];\r
    if (twirl.w <= 0.0) continue;\r
    vec2 rel = p - twirl.xy;\r
    float turn = twirl.z * exp(-dot(rel, rel) / (twirl.w * twirl.w));\r
    float c = cos(turn);\r
    float s = sin(turn);\r
    p = twirl.xy + vec2(c * rel.x - s * rel.y, s * rel.x + c * rel.y);\r
  }\r
  vec3 color = paint(uCss, vec2(p.x, uCss.y - p.y));\r
  float grain = (fract(52.9829189 * fract(dot(cell, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;\r
  color = clamp(color + grain, 0.0, 1.0);\r
  fragColor = vec4(color * uOpacity, uOpacity);\r
}\`;\r
\r
const SCREEN = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uPaint;\r
uniform vec2 uCanvas;\r
uniform vec2 uSource;\r
uniform float uDevice;\r
uniform float uCrt;\r
out vec4 fragColor;\r
\r
float smoother(float edge0, float edge1, float x) {\r
  float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  vec2 device = vec2(gl_FragCoord.x, uCanvas.y - gl_FragCoord.y);\r
  vec2 cell = floor(device / uDevice);\r
  vec4 texel = texture(uPaint, vec2((cell.x + 0.5) / uSource.x, 1.0 - (cell.y + 0.5) / uSource.y));\r
  vec3 color = texel.rgb;\r
  float glow = dot(color, vec3(0.2126, 0.7152, 0.0722));\r
  float period = max(uDevice, 3.0);\r
  float row = fract(device.y / period);\r
  float line = smoother(0.5, 0.92, row) * (1.0 - smoother(0.92, 1.0, row));\r
  color *= 1.0 - uCrt * 0.34 * line * (1.0 - 0.7 * glow);\r
  vec2 screen = gl_FragCoord.xy / uCanvas;\r
  float edge = smoother(0.0, 0.18, screen.x) * smoother(0.0, 0.18, 1.0 - screen.x);\r
  edge *= smoother(0.0, 0.24, screen.y) * smoother(0.0, 0.24, 1.0 - screen.y);\r
  color *= mix(1.0, 0.78 + 0.22 * edge, uCrt);\r
  color *= 1.0 + uCrt * 0.1;\r
  fragColor = vec4(min(color, vec3(texel.a)), texel.a);\r
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
  return null;\r
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
const link = (gl, source) => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, source);\r
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
const smoother = t => {\r
  const x = clamp(t, 0, 1);\r
  return x * x * x * (x * (x * 6 - 15) + 10);\r
};\r
\r
const Balatro = ({\r
  color1 = '#DE443B',\r
  color2 = '#006BB4',\r
  color3 = '#162325',\r
  contrast = 3.5,\r
  lighting = 0.4,\r
  swirl = 0.25,\r
  speed = 1,\r
  rotationSpeed = 0,\r
  scale = 1,\r
  detail = 5,\r
  offset = [0, 0],\r
  pixelSize = 1.5,\r
  crt = 0,\r
  mouseInteraction = true,\r
  mouseStrength = 1,\r
  clickSwirl = true,\r
  intro = true,\r
  lightMode = false,\r
  opacity = 1,\r
  maxDevicePixelRatio = 2,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const [generation, setGeneration] = useState(0);\r
\r
  const settings = {\r
    color1: parseColor(color1) || [0.871, 0.267, 0.231],\r
    color2: parseColor(color2) || [0, 0.42, 0.706],\r
    color3: parseColor(color3) || [0.086, 0.137, 0.145],\r
    contrast: clamp(contrast, 0.5, 10),\r
    lighting: clamp(lighting, 0, 1.5),\r
    swirl: clamp(swirl, 0, 1),\r
    speed: Math.max(0, speed),\r
    rotation: clamp(rotationSpeed, -10, 10),\r
    scale: clamp(scale, 0.2, 5),\r
    detail: clamp(Math.round(detail), 1, 8),\r
    offset: Array.isArray(offset) ? [Number(offset[0]) || 0, Number(offset[1]) || 0] : [0, 0],\r
    pixelSize: clamp(pixelSize, 0, 24),\r
    crt: clamp(crt, 0, 1),\r
    mouse: mouseInteraction,\r
    strength: clamp(mouseStrength, 0, 3),\r
    clickSwirl,\r
    intro,\r
    light: lightMode,\r
    opacity: clamp(opacity, 0, 1),\r
    maxRatio: clamp(maxDevicePixelRatio, 0.5, 3)\r
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
      powerPreference: 'high-performance'\r
    });\r
    const paintProgram = gl ? link(gl, PAINT) : null;\r
    const screenProgram = gl ? link(gl, SCREEN) : null;\r
    if (!gl || !paintProgram || !screenProgram) return;\r
    const floatTargets = !!(\r
      gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float')\r
    );\r
    const fieldProgram = floatTargets ? link(gl, FIELD) : null;\r
\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
    const vao = gl.createVertexArray();\r
    const view = { cssWidth: 1, cssHeight: 1, block: 1, device: 1, width: 1, height: 1, crt: false };\r
    const paintTarget = { texture: gl.createTexture(), framebuffer: gl.createFramebuffer(), width: 0, height: 0 };\r
    const field = { width: 0, height: 0, targets: [], energy: 0 };\r
    const pointer = { x: 0, y: 0, lastX: 0, lastY: 0, vx: 0, inside: false, ready: false };\r
    const steer = { value: 0 };\r
    const twirls = [];\r
    const twirlData = new Float32Array(MAX_TWIRLS * 4);\r
    let flow = 14;\r
    let spin = 0;\r
    let opening = settingsRef.current.intro && !reduced && generation === 0 ? 0 : 1;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let pageVisible = document.visibilityState !== 'hidden';\r
    let lost = false;\r
\r
    const makeTarget = (width, height) => {\r
      const texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG16F, width, height, 0, gl.RG, gl.HALF_FLOAT, null);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      const framebuffer = gl.createFramebuffer();\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      return { texture, framebuffer };\r
    };\r
\r
    const dropField = () => {\r
      field.targets.forEach(target => {\r
        gl.deleteTexture(target.texture);\r
        gl.deleteFramebuffer(target.framebuffer);\r
      });\r
      field.targets = [];\r
      field.width = 0;\r
      field.height = 0;\r
      field.energy = 0;\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const rect = container.getBoundingClientRect();\r
      const cssWidth = Math.max(1, rect.width);\r
      const cssHeight = Math.max(1, rect.height);\r
      const dpr = Math.min(window.devicePixelRatio || 1, s.maxRatio);\r
      const budget = Math.ceil(Math.sqrt((cssWidth * cssHeight * dpr * dpr) / PIXEL_BUDGET) - 0.05);\r
      const device = Math.max(s.pixelSize > 0 ? Math.round(s.pixelSize * dpr) : 1, budget, 1);\r
      const width = Math.max(1, Math.ceil((cssWidth * dpr) / device));\r
      const height = Math.max(1, Math.ceil((cssHeight * dpr) / device));\r
      const crt = s.crt > 0;\r
      const canvasWidth = crt ? width * device : width;\r
      const canvasHeight = crt ? height * device : height;\r
      if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {\r
        canvas.width = canvasWidth;\r
        canvas.height = canvasHeight;\r
      }\r
      canvas.style.width = \`\${(width * device) / dpr}px\`;\r
      canvas.style.height = \`\${(height * device) / dpr}px\`;\r
      canvas.style.imageRendering = !crt && s.pixelSize > 0 && device >= 2 ? 'pixelated' : 'auto';\r
      if (crt && (paintTarget.width !== width || paintTarget.height !== height)) {\r
        gl.bindTexture(gl.TEXTURE_2D, paintTarget.texture);\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, paintTarget.framebuffer);\r
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, paintTarget.texture, 0);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
        paintTarget.width = width;\r
        paintTarget.height = height;\r
      }\r
      view.cssWidth = cssWidth;\r
      view.cssHeight = cssHeight;\r
      view.block = device / dpr;\r
      view.device = device;\r
      view.width = width;\r
      view.height = height;\r
      view.crt = crt;\r
      if (!fieldProgram) return;\r
      const fieldWidth = clamp(Math.ceil(cssWidth / FIELD_SCALE), 8, 320);\r
      const fieldHeight = clamp(Math.ceil(cssHeight / FIELD_SCALE), 8, 320);\r
      if (fieldWidth === field.width && fieldHeight === field.height) return;\r
      dropField();\r
      field.width = fieldWidth;\r
      field.height = fieldHeight;\r
      field.targets = [makeTarget(fieldWidth, fieldHeight), makeTarget(fieldWidth, fieldHeight)];\r
    };\r
\r
    const stir = (fromX, fromY, toX, toY, pushX, pushY, decay) => {\r
      if (!fieldProgram) return;\r
      const [read, write] = field.targets;\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, write.framebuffer);\r
      gl.viewport(0, 0, field.width, field.height);\r
      gl.useProgram(fieldProgram.program);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, read.texture);\r
      const u = fieldProgram.uniforms;\r
      gl.uniform1i(u.uPrev, 0);\r
      gl.uniform2f(u.uSize, field.width, field.height);\r
      gl.uniform2f(u.uCss, view.cssWidth, view.cssHeight);\r
      gl.uniform2f(u.uFrom, fromX, fromY);\r
      gl.uniform2f(u.uTo, toX, toY);\r
      gl.uniform2f(u.uPush, pushX, pushY);\r
      gl.uniform1f(u.uRadius, STIR_RADIUS);\r
      gl.uniform1f(u.uDecay, decay);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      field.targets = [write, read];\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (lost) return;\r
      const s = settingsRef.current;\r
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05);\r
      last = Math.max(last, now);\r
      const pace = reduced ? 0.2 : 1;\r
      flow += dt * s.speed * 7 * pace;\r
      spin += dt * s.rotation * 0.2 * pace;\r
      if (opening < 1) opening = Math.min(1, opening + dt / 2.2);\r
\r
      const tracking = s.mouse && pointer.inside;\r
      const steerTarget = tracking ? (pointer.x / view.cssWidth - 0.5) * 0.35 * s.strength : 0;\r
      steer.value += (steerTarget - steer.value) * (1 - Math.exp(-dt / 0.8));\r
\r
      gl.bindVertexArray(vao);\r
      if (fieldProgram && field.targets.length) {\r
        const dx = pointer.x - pointer.lastX;\r
        const dy = pointer.y - pointer.lastY;\r
        const moved = tracking && pointer.ready && (dx !== 0 || dy !== 0);\r
        const decay = Math.exp(-dt / 1.6);\r
        if (moved || field.energy > 0.05) {\r
          const amount = 0.85 * s.strength * (reduced ? 0.4 : 1);\r
          const travel = moved ? Math.hypot(dx, dy) * amount : 0;\r
          const steps = Math.max(1, Math.ceil(travel / (STIR_RADIUS * 0.3)));\r
          for (let step = 0; step < steps; step++) {\r
            const a = step / steps;\r
            const b = (step + 1) / steps;\r
            stir(\r
              pointer.lastX + dx * a,\r
              pointer.lastY + dy * a,\r
              pointer.lastX + dx * b,\r
              pointer.lastY + dy * b,\r
              moved ? dx * (b - a) * amount : 0,\r
              moved ? dy * (b - a) * amount : 0,\r
              step === steps - 1 ? decay : 1\r
            );\r
          }\r
          field.energy = field.energy * decay + travel;\r
          if (field.energy <= 0.05) {\r
            field.targets.forEach(target => {\r
              gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);\r
              gl.clearColor(0, 0, 0, 0);\r
              gl.clear(gl.COLOR_BUFFER_BIT);\r
            });\r
          }\r
        }\r
      }\r
      pointer.lastX = pointer.x;\r
      pointer.lastY = pointer.y;\r
\r
      for (let index = twirls.length - 1; index >= 0; index--) {\r
        twirls[index].age += dt;\r
        if (twirls[index].age >= 3.2) twirls.splice(index, 1);\r
      }\r
      twirlData.fill(0);\r
      twirls.forEach((twirl, index) => {\r
        const t = twirl.age;\r
        const rise = smoother(t / 0.25);\r
        const fall = 1 - smoother((t - 0.25) / 2.95);\r
        twirlData[index * 4] = twirl.x;\r
        twirlData[index * 4 + 1] = twirl.y;\r
        twirlData[index * 4 + 2] = twirl.direction * 1.9 * rise * fall;\r
        twirlData[index * 4 + 3] = 150 * (1 + 0.6 * smoother(t / 3.2));\r
      });\r
\r
      const eased = 1 - Math.pow(1 - opening, 3);\r
      const unwind = 1 - eased;\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, view.crt ? paintTarget.framebuffer : null);\r
      gl.viewport(0, 0, view.width, view.height);\r
      gl.useProgram(paintProgram.program);\r
      const u = paintProgram.uniforms;\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, field.targets.length ? field.targets[0].texture : null);\r
      gl.uniform1i(u.uField, 0);\r
      gl.uniform1f(u.uFieldOn, field.targets.length && field.energy > 0.05 ? 1 : 0);\r
      gl.uniform2f(u.uCss, view.cssWidth, view.cssHeight);\r
      gl.uniform2f(u.uCanvas, view.width, view.height);\r
      gl.uniform1f(u.uBlock, view.block);\r
      gl.uniform1f(u.uFlow, flow);\r
      gl.uniform1f(u.uSpin, -0.4 + spin + steer.value + 2.6 * unwind * unwind);\r
      gl.uniform2f(u.uOffset, s.offset[0], s.offset[1]);\r
      gl.uniform3f(u.uColor1, s.color1[0], s.color1[1], s.color1[2]);\r
      gl.uniform3f(u.uColor2, s.color2[0], s.color2[1], s.color2[2]);\r
      gl.uniform3f(u.uColor3, s.color3[0], s.color3[1], s.color3[2]);\r
      gl.uniform1f(u.uContrast, s.contrast);\r
      gl.uniform1f(u.uLighting, s.lighting);\r
      gl.uniform1f(u.uSwirl, Math.min(1, s.swirl + 0.55 * unwind));\r
      gl.uniform1f(u.uScale, s.scale);\r
      gl.uniform1i(u.uDetail, s.detail);\r
      gl.uniform4fv(u.uTwirls, twirlData);\r
      gl.uniform1f(u.uReveal, smoother(opening / 0.45));\r
      gl.uniform1f(u.uLight, s.light ? 1 : 0);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      if (view.crt) {\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
        gl.viewport(0, 0, canvas.width, canvas.height);\r
        gl.useProgram(screenProgram.program);\r
        const v = screenProgram.uniforms;\r
        gl.activeTexture(gl.TEXTURE0);\r
        gl.bindTexture(gl.TEXTURE_2D, paintTarget.texture);\r
        gl.uniform1i(v.uPaint, 0);\r
        gl.uniform2f(v.uCanvas, canvas.width, canvas.height);\r
        gl.uniform2f(v.uSource, view.width, view.height);\r
        gl.uniform1f(v.uDevice, view.device);\r
        gl.uniform1f(v.uCrt, s.crt);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      }\r
\r
      const settling = Math.abs(steerTarget - steer.value) > 0.0005 || field.energy > 0.05 || twirls.length > 0;\r
      const busy = s.speed > 0 || s.rotation !== 0 || opening < 1 || settling;\r
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
      return {\r
        x: event.clientX - rect.left,\r
        y: event.clientY - rect.top,\r
        inside:\r
          event.clientX >= rect.left &&\r
          event.clientX <= rect.right &&\r
          event.clientY >= rect.top &&\r
          event.clientY <= rect.bottom\r
      };\r
    };\r
\r
    const onPointerMove = event => {\r
      const spot = locate(event);\r
      if (!pointer.ready || !pointer.inside) {\r
        pointer.lastX = spot.x;\r
        pointer.lastY = spot.y;\r
      }\r
      pointer.vx = spot.x - pointer.x;\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = spot.inside;\r
      pointer.ready = true;\r
      wake();\r
    };\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      const spot = locate(event);\r
      if (!spot.inside || !s.clickSwirl || reduced) return;\r
      twirls.push({ x: spot.x, y: spot.y, age: 0, direction: pointer.vx < 0 ? 1 : -1 });\r
      if (twirls.length > MAX_TWIRLS) twirls.shift();\r
      wake();\r
    };\r
    const onLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
    const onPointerUp = event => {\r
      if (event.pointerType !== 'mouse') onLeave();\r
    };\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    window.addEventListener('pointerup', onPointerUp, { passive: true });\r
    window.addEventListener('pointercancel', onPointerUp, { passive: true });\r
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
      window.removeEventListener('pointerup', onPointerUp);\r
      window.removeEventListener('pointercancel', onPointerUp);\r
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      canvas.removeEventListener('webglcontextlost', onLost);\r
      canvas.removeEventListener('webglcontextrestored', onRestored);\r
      if (!gl.isContextLost()) {\r
        dropField();\r
        gl.deleteTexture(paintTarget.texture);\r
        gl.deleteFramebuffer(paintTarget.framebuffer);\r
        gl.deleteVertexArray(vao);\r
        gl.deleteProgram(paintProgram.program);\r
        gl.deleteProgram(screenProgram.program);\r
        if (fieldProgram) gl.deleteProgram(fieldProgram.program);\r
      }\r
    };\r
  }, [generation]);\r
\r
  return (\r
    <div ref={containerRef} className={\`relative h-full w-full overflow-hidden \${className}\`.trim()} style={style}>\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Balatro;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, useState, type CSSProperties } from 'react';\r
import './Balatro.css';\r
\r
export interface BalatroProps {\r
  color1?: string;\r
  color2?: string;\r
  color3?: string;\r
  contrast?: number;\r
  lighting?: number;\r
  swirl?: number;\r
  speed?: number;\r
  rotationSpeed?: number;\r
  scale?: number;\r
  detail?: number;\r
  offset?: [number, number];\r
  pixelSize?: number;\r
  crt?: number;\r
  mouseInteraction?: boolean;\r
  mouseStrength?: number;\r
  clickSwirl?: boolean;\r
  intro?: boolean;\r
  lightMode?: boolean;\r
  opacity?: number;\r
  maxDevicePixelRatio?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Settings {\r
  color1: number[];\r
  color2: number[];\r
  color3: number[];\r
  contrast: number;\r
  lighting: number;\r
  swirl: number;\r
  speed: number;\r
  rotation: number;\r
  scale: number;\r
  detail: number;\r
  offset: number[];\r
  pixelSize: number;\r
  crt: number;\r
  mouse: boolean;\r
  strength: number;\r
  clickSwirl: boolean;\r
  intro: boolean;\r
  light: boolean;\r
  opacity: number;\r
  maxRatio: number;\r
}\r
\r
interface Program {\r
  program: WebGLProgram;\r
  uniforms: Record<string, WebGLUniformLocation | null>;\r
}\r
\r
interface Target {\r
  texture: WebGLTexture;\r
  framebuffer: WebGLFramebuffer;\r
}\r
\r
interface Twirl {\r
  x: number;\r
  y: number;\r
  age: number;\r
  direction: number;\r
}\r
\r
const PIXEL_BUDGET = 2.4e6;\r
const MAX_TWIRLS = 4;\r
const FIELD_SCALE = 8;\r
const STIR_RADIUS = 90;\r
\r
const VERTEX = \`#version 300 es\r
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));\r
void main() {\r
  gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);\r
}\`;\r
\r
const FIELD = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uPrev;\r
uniform vec2 uSize;\r
uniform vec2 uCss;\r
uniform vec2 uFrom;\r
uniform vec2 uTo;\r
uniform vec2 uPush;\r
uniform float uRadius;\r
uniform float uDecay;\r
out vec4 fragColor;\r
\r
void main() {\r
  vec2 cell = gl_FragCoord.xy / uSize;\r
  vec2 p = vec2(cell.x, 1.0 - cell.y) * uCss;\r
  vec2 seg = uTo - uFrom;\r
  float len2 = max(dot(seg, seg), 1e-6);\r
  float h = clamp(dot(p - uFrom, seg) / len2, 0.0, 1.0);\r
  vec2 gap = p - uFrom - seg * h;\r
  vec2 delta = uPush * exp(-dot(gap, gap) / (uRadius * uRadius));\r
  vec2 src = p - delta;\r
  vec2 prev = texture(uPrev, vec2(src.x / uCss.x, 1.0 - src.y / uCss.y)).xy;\r
  fragColor = vec4((prev + delta) * uDecay, 0.0, 1.0);\r
}\`;\r
\r
const PAINT = \`#version 300 es\r
precision highp float;\r
uniform vec2 uCss;\r
uniform vec2 uCanvas;\r
uniform float uBlock;\r
uniform float uFlow;\r
uniform float uSpin;\r
uniform vec2 uOffset;\r
uniform vec3 uColor1;\r
uniform vec3 uColor2;\r
uniform vec3 uColor3;\r
uniform float uContrast;\r
uniform float uLighting;\r
uniform float uSwirl;\r
uniform float uScale;\r
uniform int uDetail;\r
uniform sampler2D uField;\r
uniform float uFieldOn;\r
uniform vec4 uTwirls[\${MAX_TWIRLS}];\r
uniform float uReveal;\r
uniform float uLight;\r
uniform float uOpacity;\r
out vec4 fragColor;\r
\r
vec3 paint(vec2 screenSize, vec2 coords) {\r
  vec2 uv = (coords - 0.5 * screenSize) / length(screenSize) - uOffset;\r
  float radius = length(uv);\r
  float speed = uSpin + 302.2;\r
  float angle = atan(uv.y, uv.x) + speed - 20.0 * (uSwirl * radius + (1.0 - uSwirl));\r
  vec2 mid = (screenSize / length(screenSize)) / 2.0;\r
  uv = vec2(radius * cos(angle) + mid.x, radius * sin(angle) + mid.y) - mid;\r
\r
  uv *= 30.0 / uScale;\r
  speed = uFlow;\r
  vec2 uv2 = vec2(uv.x + uv.y);\r
  for (int i = 0; i < 8; i++) {\r
    if (i >= uDetail) break;\r
    uv2 += sin(max(uv.x, uv.y)) + uv;\r
    uv += 0.5 * vec2(cos(5.1123314 + 0.353 * uv2.y + speed * 0.131121), sin(uv2.x - 0.113 * speed));\r
    uv -= cos(uv.x + uv.y) - sin(uv.x * 0.711 - uv.y);\r
  }\r
\r
  float contrastMod = 0.25 * uContrast + 0.5 * uSwirl + 1.2;\r
  float amount = min(2.0, max(0.0, length(uv) * 0.035 * contrastMod));\r
  float c1 = max(0.0, 1.0 - contrastMod * abs(1.0 - amount));\r
  float c2 = max(0.0, 1.0 - contrastMod * abs(amount));\r
  float c3 = 1.0 - min(1.0, c1 + c2);\r
  float light = (uLighting - 0.2) * max(c1 * 5.0 - 4.0, 0.0) + uLighting * max(c2 * 5.0 - 4.0, 0.0);\r
  vec3 gap = uLight > 0.5 ? mix(uColor3, vec3(1.0), 0.9) : uColor3;\r
  float base = 0.3 / uContrast;\r
  vec3 color = base * uColor1 + (1.0 - base) * (uColor1 * c1 + uColor2 * c2 + gap * c3) + light;\r
  return mix(gap, color, uReveal);\r
}\r
\r
void main() {\r
  vec2 cell = floor(gl_FragCoord.xy) + 0.5;\r
  vec2 p = vec2(cell.x, uCanvas.y - cell.y) * uBlock;\r
  if (uFieldOn > 0.5) {\r
    p -= texture(uField, vec2(p.x / uCss.x, 1.0 - p.y / uCss.y)).xy;\r
  }\r
  for (int i = 0; i < \${MAX_TWIRLS}; i++) {\r
    vec4 twirl = uTwirls[i];\r
    if (twirl.w <= 0.0) continue;\r
    vec2 rel = p - twirl.xy;\r
    float turn = twirl.z * exp(-dot(rel, rel) / (twirl.w * twirl.w));\r
    float c = cos(turn);\r
    float s = sin(turn);\r
    p = twirl.xy + vec2(c * rel.x - s * rel.y, s * rel.x + c * rel.y);\r
  }\r
  vec3 color = paint(uCss, vec2(p.x, uCss.y - p.y));\r
  float grain = (fract(52.9829189 * fract(dot(cell, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;\r
  color = clamp(color + grain, 0.0, 1.0);\r
  fragColor = vec4(color * uOpacity, uOpacity);\r
}\`;\r
\r
const SCREEN = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uPaint;\r
uniform vec2 uCanvas;\r
uniform vec2 uSource;\r
uniform float uDevice;\r
uniform float uCrt;\r
out vec4 fragColor;\r
\r
float smoother(float edge0, float edge1, float x) {\r
  float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  vec2 device = vec2(gl_FragCoord.x, uCanvas.y - gl_FragCoord.y);\r
  vec2 cell = floor(device / uDevice);\r
  vec4 texel = texture(uPaint, vec2((cell.x + 0.5) / uSource.x, 1.0 - (cell.y + 0.5) / uSource.y));\r
  vec3 color = texel.rgb;\r
  float glow = dot(color, vec3(0.2126, 0.7152, 0.0722));\r
  float period = max(uDevice, 3.0);\r
  float row = fract(device.y / period);\r
  float line = smoother(0.5, 0.92, row) * (1.0 - smoother(0.92, 1.0, row));\r
  color *= 1.0 - uCrt * 0.34 * line * (1.0 - 0.7 * glow);\r
  vec2 screen = gl_FragCoord.xy / uCanvas;\r
  float edge = smoother(0.0, 0.18, screen.x) * smoother(0.0, 0.18, 1.0 - screen.x);\r
  edge *= smoother(0.0, 0.24, screen.y) * smoother(0.0, 0.24, 1.0 - screen.y);\r
  color *= mix(1.0, 0.78 + 0.22 * edge, uCrt);\r
  color *= 1.0 + uCrt * 0.1;\r
  fragColor = vec4(min(color, vec3(texel.a)), texel.a);\r
}\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const parseColor = (value: string): number[] | null => {\r
  const text = String(value || '').trim();\r
  const hex = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text);\r
  if (hex) {\r
    const full = hex[1].length === 3 ? hex[1].replace(/./g, digit => digit + digit) : hex[1];\r
    return [0, 2, 4].map(index => parseInt(full.slice(index, index + 2), 16) / 255);\r
  }\r
  const rgb = /^rgba?\\(\\s*([\\d.]+)[\\s,]+([\\d.]+)[\\s,]+([\\d.]+)/i.exec(text);\r
  if (rgb) return [rgb[1], rgb[2], rgb[3]].map(channel => clamp(parseFloat(channel) / 255, 0, 1));\r
  return null;\r
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
const link = (gl: WebGL2RenderingContext, source: string): Program | null => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, source);\r
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
const smoother = (t: number) => {\r
  const x = clamp(t, 0, 1);\r
  return x * x * x * (x * (x * 6 - 15) + 10);\r
};\r
\r
const Balatro = ({\r
  color1 = '#DE443B',\r
  color2 = '#006BB4',\r
  color3 = '#162325',\r
  contrast = 3.5,\r
  lighting = 0.4,\r
  swirl = 0.25,\r
  speed = 1,\r
  rotationSpeed = 0,\r
  scale = 1,\r
  detail = 5,\r
  offset = [0, 0],\r
  pixelSize = 1.5,\r
  crt = 0,\r
  mouseInteraction = true,\r
  mouseStrength = 1,\r
  clickSwirl = true,\r
  intro = true,\r
  lightMode = false,\r
  opacity = 1,\r
  maxDevicePixelRatio = 2,\r
  className = '',\r
  style\r
}: BalatroProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const [generation, setGeneration] = useState(0);\r
\r
  const settings: Settings = {\r
    color1: parseColor(color1) || [0.871, 0.267, 0.231],\r
    color2: parseColor(color2) || [0, 0.42, 0.706],\r
    color3: parseColor(color3) || [0.086, 0.137, 0.145],\r
    contrast: clamp(contrast, 0.5, 10),\r
    lighting: clamp(lighting, 0, 1.5),\r
    swirl: clamp(swirl, 0, 1),\r
    speed: Math.max(0, speed),\r
    rotation: clamp(rotationSpeed, -10, 10),\r
    scale: clamp(scale, 0.2, 5),\r
    detail: clamp(Math.round(detail), 1, 8),\r
    offset: Array.isArray(offset) ? [Number(offset[0]) || 0, Number(offset[1]) || 0] : [0, 0],\r
    pixelSize: clamp(pixelSize, 0, 24),\r
    crt: clamp(crt, 0, 1),\r
    mouse: mouseInteraction,\r
    strength: clamp(mouseStrength, 0, 3),\r
    clickSwirl,\r
    intro,\r
    light: lightMode,\r
    opacity: clamp(opacity, 0, 1),\r
    maxRatio: clamp(maxDevicePixelRatio, 0.5, 3)\r
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
      powerPreference: 'high-performance'\r
    });\r
    const paintProgram = gl ? link(gl, PAINT) : null;\r
    const screenProgram = gl ? link(gl, SCREEN) : null;\r
    if (!gl || !paintProgram || !screenProgram) return;\r
    const floatTargets = !!(\r
      gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float')\r
    );\r
    const fieldProgram = floatTargets ? link(gl, FIELD) : null;\r
\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
    const vao = gl.createVertexArray();\r
    const view = { cssWidth: 1, cssHeight: 1, block: 1, device: 1, width: 1, height: 1, crt: false };\r
    const paintTarget = {\r
      texture: gl.createTexture() as WebGLTexture,\r
      framebuffer: gl.createFramebuffer() as WebGLFramebuffer,\r
      width: 0,\r
      height: 0\r
    };\r
    const field: { width: number; height: number; targets: Target[]; energy: number } = {\r
      width: 0,\r
      height: 0,\r
      targets: [],\r
      energy: 0\r
    };\r
    const pointer = { x: 0, y: 0, lastX: 0, lastY: 0, vx: 0, inside: false, ready: false };\r
    const steer = { value: 0 };\r
    const twirls: Twirl[] = [];\r
    const twirlData = new Float32Array(MAX_TWIRLS * 4);\r
    let flow = 14;\r
    let spin = 0;\r
    let opening = settingsRef.current.intro && !reduced && generation === 0 ? 0 : 1;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let pageVisible = document.visibilityState !== 'hidden';\r
    let lost = false;\r
\r
    const makeTarget = (width: number, height: number): Target => {\r
      const texture = gl.createTexture() as WebGLTexture;\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG16F, width, height, 0, gl.RG, gl.HALF_FLOAT, null);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      const framebuffer = gl.createFramebuffer() as WebGLFramebuffer;\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      return { texture, framebuffer };\r
    };\r
\r
    const dropField = () => {\r
      field.targets.forEach(target => {\r
        gl.deleteTexture(target.texture);\r
        gl.deleteFramebuffer(target.framebuffer);\r
      });\r
      field.targets = [];\r
      field.width = 0;\r
      field.height = 0;\r
      field.energy = 0;\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const rect = container.getBoundingClientRect();\r
      const cssWidth = Math.max(1, rect.width);\r
      const cssHeight = Math.max(1, rect.height);\r
      const dpr = Math.min(window.devicePixelRatio || 1, s.maxRatio);\r
      const budget = Math.ceil(Math.sqrt((cssWidth * cssHeight * dpr * dpr) / PIXEL_BUDGET) - 0.05);\r
      const device = Math.max(s.pixelSize > 0 ? Math.round(s.pixelSize * dpr) : 1, budget, 1);\r
      const width = Math.max(1, Math.ceil((cssWidth * dpr) / device));\r
      const height = Math.max(1, Math.ceil((cssHeight * dpr) / device));\r
      const crt = s.crt > 0;\r
      const canvasWidth = crt ? width * device : width;\r
      const canvasHeight = crt ? height * device : height;\r
      if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {\r
        canvas.width = canvasWidth;\r
        canvas.height = canvasHeight;\r
      }\r
      canvas.style.width = \`\${(width * device) / dpr}px\`;\r
      canvas.style.height = \`\${(height * device) / dpr}px\`;\r
      canvas.style.imageRendering = !crt && s.pixelSize > 0 && device >= 2 ? 'pixelated' : 'auto';\r
      if (crt && (paintTarget.width !== width || paintTarget.height !== height)) {\r
        gl.bindTexture(gl.TEXTURE_2D, paintTarget.texture);\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, paintTarget.framebuffer);\r
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, paintTarget.texture, 0);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
        paintTarget.width = width;\r
        paintTarget.height = height;\r
      }\r
      view.cssWidth = cssWidth;\r
      view.cssHeight = cssHeight;\r
      view.block = device / dpr;\r
      view.device = device;\r
      view.width = width;\r
      view.height = height;\r
      view.crt = crt;\r
      if (!fieldProgram) return;\r
      const fieldWidth = clamp(Math.ceil(cssWidth / FIELD_SCALE), 8, 320);\r
      const fieldHeight = clamp(Math.ceil(cssHeight / FIELD_SCALE), 8, 320);\r
      if (fieldWidth === field.width && fieldHeight === field.height) return;\r
      dropField();\r
      field.width = fieldWidth;\r
      field.height = fieldHeight;\r
      field.targets = [makeTarget(fieldWidth, fieldHeight), makeTarget(fieldWidth, fieldHeight)];\r
    };\r
\r
    const stir = (\r
      fromX: number,\r
      fromY: number,\r
      toX: number,\r
      toY: number,\r
      pushX: number,\r
      pushY: number,\r
      decay: number\r
    ) => {\r
      if (!fieldProgram) return;\r
      const [read, write] = field.targets;\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, write.framebuffer);\r
      gl.viewport(0, 0, field.width, field.height);\r
      gl.useProgram(fieldProgram.program);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, read.texture);\r
      const u = fieldProgram.uniforms;\r
      gl.uniform1i(u.uPrev, 0);\r
      gl.uniform2f(u.uSize, field.width, field.height);\r
      gl.uniform2f(u.uCss, view.cssWidth, view.cssHeight);\r
      gl.uniform2f(u.uFrom, fromX, fromY);\r
      gl.uniform2f(u.uTo, toX, toY);\r
      gl.uniform2f(u.uPush, pushX, pushY);\r
      gl.uniform1f(u.uRadius, STIR_RADIUS);\r
      gl.uniform1f(u.uDecay, decay);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      field.targets = [write, read];\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (lost) return;\r
      const s = settingsRef.current;\r
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05);\r
      last = Math.max(last, now);\r
      const pace = reduced ? 0.2 : 1;\r
      flow += dt * s.speed * 7 * pace;\r
      spin += dt * s.rotation * 0.2 * pace;\r
      if (opening < 1) opening = Math.min(1, opening + dt / 2.2);\r
\r
      const tracking = s.mouse && pointer.inside;\r
      const steerTarget = tracking ? (pointer.x / view.cssWidth - 0.5) * 0.35 * s.strength : 0;\r
      steer.value += (steerTarget - steer.value) * (1 - Math.exp(-dt / 0.8));\r
\r
      gl.bindVertexArray(vao);\r
      if (fieldProgram && field.targets.length) {\r
        const dx = pointer.x - pointer.lastX;\r
        const dy = pointer.y - pointer.lastY;\r
        const moved = tracking && pointer.ready && (dx !== 0 || dy !== 0);\r
        const decay = Math.exp(-dt / 1.6);\r
        if (moved || field.energy > 0.05) {\r
          const amount = 0.85 * s.strength * (reduced ? 0.4 : 1);\r
          const travel = moved ? Math.hypot(dx, dy) * amount : 0;\r
          const steps = Math.max(1, Math.ceil(travel / (STIR_RADIUS * 0.3)));\r
          for (let step = 0; step < steps; step++) {\r
            const a = step / steps;\r
            const b = (step + 1) / steps;\r
            stir(\r
              pointer.lastX + dx * a,\r
              pointer.lastY + dy * a,\r
              pointer.lastX + dx * b,\r
              pointer.lastY + dy * b,\r
              moved ? dx * (b - a) * amount : 0,\r
              moved ? dy * (b - a) * amount : 0,\r
              step === steps - 1 ? decay : 1\r
            );\r
          }\r
          field.energy = field.energy * decay + travel;\r
          if (field.energy <= 0.05) {\r
            field.targets.forEach(target => {\r
              gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);\r
              gl.clearColor(0, 0, 0, 0);\r
              gl.clear(gl.COLOR_BUFFER_BIT);\r
            });\r
          }\r
        }\r
      }\r
      pointer.lastX = pointer.x;\r
      pointer.lastY = pointer.y;\r
\r
      for (let index = twirls.length - 1; index >= 0; index--) {\r
        twirls[index].age += dt;\r
        if (twirls[index].age >= 3.2) twirls.splice(index, 1);\r
      }\r
      twirlData.fill(0);\r
      twirls.forEach((twirl, index) => {\r
        const t = twirl.age;\r
        const rise = smoother(t / 0.25);\r
        const fall = 1 - smoother((t - 0.25) / 2.95);\r
        twirlData[index * 4] = twirl.x;\r
        twirlData[index * 4 + 1] = twirl.y;\r
        twirlData[index * 4 + 2] = twirl.direction * 1.9 * rise * fall;\r
        twirlData[index * 4 + 3] = 150 * (1 + 0.6 * smoother(t / 3.2));\r
      });\r
\r
      const eased = 1 - Math.pow(1 - opening, 3);\r
      const unwind = 1 - eased;\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, view.crt ? paintTarget.framebuffer : null);\r
      gl.viewport(0, 0, view.width, view.height);\r
      gl.useProgram(paintProgram.program);\r
      const u = paintProgram.uniforms;\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, field.targets.length ? field.targets[0].texture : null);\r
      gl.uniform1i(u.uField, 0);\r
      gl.uniform1f(u.uFieldOn, field.targets.length && field.energy > 0.05 ? 1 : 0);\r
      gl.uniform2f(u.uCss, view.cssWidth, view.cssHeight);\r
      gl.uniform2f(u.uCanvas, view.width, view.height);\r
      gl.uniform1f(u.uBlock, view.block);\r
      gl.uniform1f(u.uFlow, flow);\r
      gl.uniform1f(u.uSpin, -0.4 + spin + steer.value + 2.6 * unwind * unwind);\r
      gl.uniform2f(u.uOffset, s.offset[0], s.offset[1]);\r
      gl.uniform3f(u.uColor1, s.color1[0], s.color1[1], s.color1[2]);\r
      gl.uniform3f(u.uColor2, s.color2[0], s.color2[1], s.color2[2]);\r
      gl.uniform3f(u.uColor3, s.color3[0], s.color3[1], s.color3[2]);\r
      gl.uniform1f(u.uContrast, s.contrast);\r
      gl.uniform1f(u.uLighting, s.lighting);\r
      gl.uniform1f(u.uSwirl, Math.min(1, s.swirl + 0.55 * unwind));\r
      gl.uniform1f(u.uScale, s.scale);\r
      gl.uniform1i(u.uDetail, s.detail);\r
      gl.uniform4fv(u.uTwirls, twirlData);\r
      gl.uniform1f(u.uReveal, smoother(opening / 0.45));\r
      gl.uniform1f(u.uLight, s.light ? 1 : 0);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      if (view.crt) {\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
        gl.viewport(0, 0, canvas.width, canvas.height);\r
        gl.useProgram(screenProgram.program);\r
        const v = screenProgram.uniforms;\r
        gl.activeTexture(gl.TEXTURE0);\r
        gl.bindTexture(gl.TEXTURE_2D, paintTarget.texture);\r
        gl.uniform1i(v.uPaint, 0);\r
        gl.uniform2f(v.uCanvas, canvas.width, canvas.height);\r
        gl.uniform2f(v.uSource, view.width, view.height);\r
        gl.uniform1f(v.uDevice, view.device);\r
        gl.uniform1f(v.uCrt, s.crt);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      }\r
\r
      const settling = Math.abs(steerTarget - steer.value) > 0.0005 || field.energy > 0.05 || twirls.length > 0;\r
      const busy = s.speed > 0 || s.rotation !== 0 || opening < 1 || settling;\r
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
      return {\r
        x: event.clientX - rect.left,\r
        y: event.clientY - rect.top,\r
        inside:\r
          event.clientX >= rect.left &&\r
          event.clientX <= rect.right &&\r
          event.clientY >= rect.top &&\r
          event.clientY <= rect.bottom\r
      };\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const spot = locate(event);\r
      if (!pointer.ready || !pointer.inside) {\r
        pointer.lastX = spot.x;\r
        pointer.lastY = spot.y;\r
      }\r
      pointer.vx = spot.x - pointer.x;\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = spot.inside;\r
      pointer.ready = true;\r
      wake();\r
    };\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      const spot = locate(event);\r
      if (!spot.inside || !s.clickSwirl || reduced) return;\r
      twirls.push({ x: spot.x, y: spot.y, age: 0, direction: pointer.vx < 0 ? 1 : -1 });\r
      if (twirls.length > MAX_TWIRLS) twirls.shift();\r
      wake();\r
    };\r
    const onLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
    const onPointerUp = (event: PointerEvent) => {\r
      if (event.pointerType !== 'mouse') onLeave();\r
    };\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    window.addEventListener('pointerup', onPointerUp, { passive: true });\r
    window.addEventListener('pointercancel', onPointerUp, { passive: true });\r
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
      window.removeEventListener('pointerup', onPointerUp);\r
      window.removeEventListener('pointercancel', onPointerUp);\r
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      canvas.removeEventListener('webglcontextlost', onLost);\r
      canvas.removeEventListener('webglcontextrestored', onRestored);\r
      if (!gl.isContextLost()) {\r
        dropField();\r
        gl.deleteTexture(paintTarget.texture);\r
        gl.deleteFramebuffer(paintTarget.framebuffer);\r
        gl.deleteVertexArray(vao);\r
        gl.deleteProgram(paintProgram.program);\r
        gl.deleteProgram(screenProgram.program);\r
        if (fieldProgram) gl.deleteProgram(fieldProgram.program);\r
      }\r
    };\r
  }, [generation]);\r
\r
  return (\r
    <div ref={containerRef} className={\`balatro\${className ? \` \${className}\` : ''}\`} style={style}>\r
      <canvas ref={canvasRef} className="balatro__canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Balatro;\r
`,i=`'use client';\r
\r
import { useEffect, useRef, useState, type CSSProperties } from 'react';\r
\r
export interface BalatroProps {\r
  color1?: string;\r
  color2?: string;\r
  color3?: string;\r
  contrast?: number;\r
  lighting?: number;\r
  swirl?: number;\r
  speed?: number;\r
  rotationSpeed?: number;\r
  scale?: number;\r
  detail?: number;\r
  offset?: [number, number];\r
  pixelSize?: number;\r
  crt?: number;\r
  mouseInteraction?: boolean;\r
  mouseStrength?: number;\r
  clickSwirl?: boolean;\r
  intro?: boolean;\r
  lightMode?: boolean;\r
  opacity?: number;\r
  maxDevicePixelRatio?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Settings {\r
  color1: number[];\r
  color2: number[];\r
  color3: number[];\r
  contrast: number;\r
  lighting: number;\r
  swirl: number;\r
  speed: number;\r
  rotation: number;\r
  scale: number;\r
  detail: number;\r
  offset: number[];\r
  pixelSize: number;\r
  crt: number;\r
  mouse: boolean;\r
  strength: number;\r
  clickSwirl: boolean;\r
  intro: boolean;\r
  light: boolean;\r
  opacity: number;\r
  maxRatio: number;\r
}\r
\r
interface Program {\r
  program: WebGLProgram;\r
  uniforms: Record<string, WebGLUniformLocation | null>;\r
}\r
\r
interface Target {\r
  texture: WebGLTexture;\r
  framebuffer: WebGLFramebuffer;\r
}\r
\r
interface Twirl {\r
  x: number;\r
  y: number;\r
  age: number;\r
  direction: number;\r
}\r
\r
const PIXEL_BUDGET = 2.4e6;\r
const MAX_TWIRLS = 4;\r
const FIELD_SCALE = 8;\r
const STIR_RADIUS = 90;\r
\r
const VERTEX = \`#version 300 es\r
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));\r
void main() {\r
  gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);\r
}\`;\r
\r
const FIELD = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uPrev;\r
uniform vec2 uSize;\r
uniform vec2 uCss;\r
uniform vec2 uFrom;\r
uniform vec2 uTo;\r
uniform vec2 uPush;\r
uniform float uRadius;\r
uniform float uDecay;\r
out vec4 fragColor;\r
\r
void main() {\r
  vec2 cell = gl_FragCoord.xy / uSize;\r
  vec2 p = vec2(cell.x, 1.0 - cell.y) * uCss;\r
  vec2 seg = uTo - uFrom;\r
  float len2 = max(dot(seg, seg), 1e-6);\r
  float h = clamp(dot(p - uFrom, seg) / len2, 0.0, 1.0);\r
  vec2 gap = p - uFrom - seg * h;\r
  vec2 delta = uPush * exp(-dot(gap, gap) / (uRadius * uRadius));\r
  vec2 src = p - delta;\r
  vec2 prev = texture(uPrev, vec2(src.x / uCss.x, 1.0 - src.y / uCss.y)).xy;\r
  fragColor = vec4((prev + delta) * uDecay, 0.0, 1.0);\r
}\`;\r
\r
const PAINT = \`#version 300 es\r
precision highp float;\r
uniform vec2 uCss;\r
uniform vec2 uCanvas;\r
uniform float uBlock;\r
uniform float uFlow;\r
uniform float uSpin;\r
uniform vec2 uOffset;\r
uniform vec3 uColor1;\r
uniform vec3 uColor2;\r
uniform vec3 uColor3;\r
uniform float uContrast;\r
uniform float uLighting;\r
uniform float uSwirl;\r
uniform float uScale;\r
uniform int uDetail;\r
uniform sampler2D uField;\r
uniform float uFieldOn;\r
uniform vec4 uTwirls[\${MAX_TWIRLS}];\r
uniform float uReveal;\r
uniform float uLight;\r
uniform float uOpacity;\r
out vec4 fragColor;\r
\r
vec3 paint(vec2 screenSize, vec2 coords) {\r
  vec2 uv = (coords - 0.5 * screenSize) / length(screenSize) - uOffset;\r
  float radius = length(uv);\r
  float speed = uSpin + 302.2;\r
  float angle = atan(uv.y, uv.x) + speed - 20.0 * (uSwirl * radius + (1.0 - uSwirl));\r
  vec2 mid = (screenSize / length(screenSize)) / 2.0;\r
  uv = vec2(radius * cos(angle) + mid.x, radius * sin(angle) + mid.y) - mid;\r
\r
  uv *= 30.0 / uScale;\r
  speed = uFlow;\r
  vec2 uv2 = vec2(uv.x + uv.y);\r
  for (int i = 0; i < 8; i++) {\r
    if (i >= uDetail) break;\r
    uv2 += sin(max(uv.x, uv.y)) + uv;\r
    uv += 0.5 * vec2(cos(5.1123314 + 0.353 * uv2.y + speed * 0.131121), sin(uv2.x - 0.113 * speed));\r
    uv -= cos(uv.x + uv.y) - sin(uv.x * 0.711 - uv.y);\r
  }\r
\r
  float contrastMod = 0.25 * uContrast + 0.5 * uSwirl + 1.2;\r
  float amount = min(2.0, max(0.0, length(uv) * 0.035 * contrastMod));\r
  float c1 = max(0.0, 1.0 - contrastMod * abs(1.0 - amount));\r
  float c2 = max(0.0, 1.0 - contrastMod * abs(amount));\r
  float c3 = 1.0 - min(1.0, c1 + c2);\r
  float light = (uLighting - 0.2) * max(c1 * 5.0 - 4.0, 0.0) + uLighting * max(c2 * 5.0 - 4.0, 0.0);\r
  vec3 gap = uLight > 0.5 ? mix(uColor3, vec3(1.0), 0.9) : uColor3;\r
  float base = 0.3 / uContrast;\r
  vec3 color = base * uColor1 + (1.0 - base) * (uColor1 * c1 + uColor2 * c2 + gap * c3) + light;\r
  return mix(gap, color, uReveal);\r
}\r
\r
void main() {\r
  vec2 cell = floor(gl_FragCoord.xy) + 0.5;\r
  vec2 p = vec2(cell.x, uCanvas.y - cell.y) * uBlock;\r
  if (uFieldOn > 0.5) {\r
    p -= texture(uField, vec2(p.x / uCss.x, 1.0 - p.y / uCss.y)).xy;\r
  }\r
  for (int i = 0; i < \${MAX_TWIRLS}; i++) {\r
    vec4 twirl = uTwirls[i];\r
    if (twirl.w <= 0.0) continue;\r
    vec2 rel = p - twirl.xy;\r
    float turn = twirl.z * exp(-dot(rel, rel) / (twirl.w * twirl.w));\r
    float c = cos(turn);\r
    float s = sin(turn);\r
    p = twirl.xy + vec2(c * rel.x - s * rel.y, s * rel.x + c * rel.y);\r
  }\r
  vec3 color = paint(uCss, vec2(p.x, uCss.y - p.y));\r
  float grain = (fract(52.9829189 * fract(dot(cell, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;\r
  color = clamp(color + grain, 0.0, 1.0);\r
  fragColor = vec4(color * uOpacity, uOpacity);\r
}\`;\r
\r
const SCREEN = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uPaint;\r
uniform vec2 uCanvas;\r
uniform vec2 uSource;\r
uniform float uDevice;\r
uniform float uCrt;\r
out vec4 fragColor;\r
\r
float smoother(float edge0, float edge1, float x) {\r
  float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  vec2 device = vec2(gl_FragCoord.x, uCanvas.y - gl_FragCoord.y);\r
  vec2 cell = floor(device / uDevice);\r
  vec4 texel = texture(uPaint, vec2((cell.x + 0.5) / uSource.x, 1.0 - (cell.y + 0.5) / uSource.y));\r
  vec3 color = texel.rgb;\r
  float glow = dot(color, vec3(0.2126, 0.7152, 0.0722));\r
  float period = max(uDevice, 3.0);\r
  float row = fract(device.y / period);\r
  float line = smoother(0.5, 0.92, row) * (1.0 - smoother(0.92, 1.0, row));\r
  color *= 1.0 - uCrt * 0.34 * line * (1.0 - 0.7 * glow);\r
  vec2 screen = gl_FragCoord.xy / uCanvas;\r
  float edge = smoother(0.0, 0.18, screen.x) * smoother(0.0, 0.18, 1.0 - screen.x);\r
  edge *= smoother(0.0, 0.24, screen.y) * smoother(0.0, 0.24, 1.0 - screen.y);\r
  color *= mix(1.0, 0.78 + 0.22 * edge, uCrt);\r
  color *= 1.0 + uCrt * 0.1;\r
  fragColor = vec4(min(color, vec3(texel.a)), texel.a);\r
}\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const parseColor = (value: string): number[] | null => {\r
  const text = String(value || '').trim();\r
  const hex = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text);\r
  if (hex) {\r
    const full = hex[1].length === 3 ? hex[1].replace(/./g, digit => digit + digit) : hex[1];\r
    return [0, 2, 4].map(index => parseInt(full.slice(index, index + 2), 16) / 255);\r
  }\r
  const rgb = /^rgba?\\(\\s*([\\d.]+)[\\s,]+([\\d.]+)[\\s,]+([\\d.]+)/i.exec(text);\r
  if (rgb) return [rgb[1], rgb[2], rgb[3]].map(channel => clamp(parseFloat(channel) / 255, 0, 1));\r
  return null;\r
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
const link = (gl: WebGL2RenderingContext, source: string): Program | null => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, source);\r
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
const smoother = (t: number) => {\r
  const x = clamp(t, 0, 1);\r
  return x * x * x * (x * (x * 6 - 15) + 10);\r
};\r
\r
const Balatro = ({\r
  color1 = '#DE443B',\r
  color2 = '#006BB4',\r
  color3 = '#162325',\r
  contrast = 3.5,\r
  lighting = 0.4,\r
  swirl = 0.25,\r
  speed = 1,\r
  rotationSpeed = 0,\r
  scale = 1,\r
  detail = 5,\r
  offset = [0, 0],\r
  pixelSize = 1.5,\r
  crt = 0,\r
  mouseInteraction = true,\r
  mouseStrength = 1,\r
  clickSwirl = true,\r
  intro = true,\r
  lightMode = false,\r
  opacity = 1,\r
  maxDevicePixelRatio = 2,\r
  className = '',\r
  style\r
}: BalatroProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const [generation, setGeneration] = useState(0);\r
\r
  const settings: Settings = {\r
    color1: parseColor(color1) || [0.871, 0.267, 0.231],\r
    color2: parseColor(color2) || [0, 0.42, 0.706],\r
    color3: parseColor(color3) || [0.086, 0.137, 0.145],\r
    contrast: clamp(contrast, 0.5, 10),\r
    lighting: clamp(lighting, 0, 1.5),\r
    swirl: clamp(swirl, 0, 1),\r
    speed: Math.max(0, speed),\r
    rotation: clamp(rotationSpeed, -10, 10),\r
    scale: clamp(scale, 0.2, 5),\r
    detail: clamp(Math.round(detail), 1, 8),\r
    offset: Array.isArray(offset) ? [Number(offset[0]) || 0, Number(offset[1]) || 0] : [0, 0],\r
    pixelSize: clamp(pixelSize, 0, 24),\r
    crt: clamp(crt, 0, 1),\r
    mouse: mouseInteraction,\r
    strength: clamp(mouseStrength, 0, 3),\r
    clickSwirl,\r
    intro,\r
    light: lightMode,\r
    opacity: clamp(opacity, 0, 1),\r
    maxRatio: clamp(maxDevicePixelRatio, 0.5, 3)\r
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
      powerPreference: 'high-performance'\r
    });\r
    const paintProgram = gl ? link(gl, PAINT) : null;\r
    const screenProgram = gl ? link(gl, SCREEN) : null;\r
    if (!gl || !paintProgram || !screenProgram) return;\r
    const floatTargets = !!(\r
      gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float')\r
    );\r
    const fieldProgram = floatTargets ? link(gl, FIELD) : null;\r
\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
    const vao = gl.createVertexArray();\r
    const view = { cssWidth: 1, cssHeight: 1, block: 1, device: 1, width: 1, height: 1, crt: false };\r
    const paintTarget = {\r
      texture: gl.createTexture() as WebGLTexture,\r
      framebuffer: gl.createFramebuffer() as WebGLFramebuffer,\r
      width: 0,\r
      height: 0\r
    };\r
    const field: { width: number; height: number; targets: Target[]; energy: number } = {\r
      width: 0,\r
      height: 0,\r
      targets: [],\r
      energy: 0\r
    };\r
    const pointer = { x: 0, y: 0, lastX: 0, lastY: 0, vx: 0, inside: false, ready: false };\r
    const steer = { value: 0 };\r
    const twirls: Twirl[] = [];\r
    const twirlData = new Float32Array(MAX_TWIRLS * 4);\r
    let flow = 14;\r
    let spin = 0;\r
    let opening = settingsRef.current.intro && !reduced && generation === 0 ? 0 : 1;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let pageVisible = document.visibilityState !== 'hidden';\r
    let lost = false;\r
\r
    const makeTarget = (width: number, height: number): Target => {\r
      const texture = gl.createTexture() as WebGLTexture;\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG16F, width, height, 0, gl.RG, gl.HALF_FLOAT, null);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      const framebuffer = gl.createFramebuffer() as WebGLFramebuffer;\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      return { texture, framebuffer };\r
    };\r
\r
    const dropField = () => {\r
      field.targets.forEach(target => {\r
        gl.deleteTexture(target.texture);\r
        gl.deleteFramebuffer(target.framebuffer);\r
      });\r
      field.targets = [];\r
      field.width = 0;\r
      field.height = 0;\r
      field.energy = 0;\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const rect = container.getBoundingClientRect();\r
      const cssWidth = Math.max(1, rect.width);\r
      const cssHeight = Math.max(1, rect.height);\r
      const dpr = Math.min(window.devicePixelRatio || 1, s.maxRatio);\r
      const budget = Math.ceil(Math.sqrt((cssWidth * cssHeight * dpr * dpr) / PIXEL_BUDGET) - 0.05);\r
      const device = Math.max(s.pixelSize > 0 ? Math.round(s.pixelSize * dpr) : 1, budget, 1);\r
      const width = Math.max(1, Math.ceil((cssWidth * dpr) / device));\r
      const height = Math.max(1, Math.ceil((cssHeight * dpr) / device));\r
      const crt = s.crt > 0;\r
      const canvasWidth = crt ? width * device : width;\r
      const canvasHeight = crt ? height * device : height;\r
      if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {\r
        canvas.width = canvasWidth;\r
        canvas.height = canvasHeight;\r
      }\r
      canvas.style.width = \`\${(width * device) / dpr}px\`;\r
      canvas.style.height = \`\${(height * device) / dpr}px\`;\r
      canvas.style.imageRendering = !crt && s.pixelSize > 0 && device >= 2 ? 'pixelated' : 'auto';\r
      if (crt && (paintTarget.width !== width || paintTarget.height !== height)) {\r
        gl.bindTexture(gl.TEXTURE_2D, paintTarget.texture);\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, paintTarget.framebuffer);\r
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, paintTarget.texture, 0);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
        paintTarget.width = width;\r
        paintTarget.height = height;\r
      }\r
      view.cssWidth = cssWidth;\r
      view.cssHeight = cssHeight;\r
      view.block = device / dpr;\r
      view.device = device;\r
      view.width = width;\r
      view.height = height;\r
      view.crt = crt;\r
      if (!fieldProgram) return;\r
      const fieldWidth = clamp(Math.ceil(cssWidth / FIELD_SCALE), 8, 320);\r
      const fieldHeight = clamp(Math.ceil(cssHeight / FIELD_SCALE), 8, 320);\r
      if (fieldWidth === field.width && fieldHeight === field.height) return;\r
      dropField();\r
      field.width = fieldWidth;\r
      field.height = fieldHeight;\r
      field.targets = [makeTarget(fieldWidth, fieldHeight), makeTarget(fieldWidth, fieldHeight)];\r
    };\r
\r
    const stir = (\r
      fromX: number,\r
      fromY: number,\r
      toX: number,\r
      toY: number,\r
      pushX: number,\r
      pushY: number,\r
      decay: number\r
    ) => {\r
      if (!fieldProgram) return;\r
      const [read, write] = field.targets;\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, write.framebuffer);\r
      gl.viewport(0, 0, field.width, field.height);\r
      gl.useProgram(fieldProgram.program);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, read.texture);\r
      const u = fieldProgram.uniforms;\r
      gl.uniform1i(u.uPrev, 0);\r
      gl.uniform2f(u.uSize, field.width, field.height);\r
      gl.uniform2f(u.uCss, view.cssWidth, view.cssHeight);\r
      gl.uniform2f(u.uFrom, fromX, fromY);\r
      gl.uniform2f(u.uTo, toX, toY);\r
      gl.uniform2f(u.uPush, pushX, pushY);\r
      gl.uniform1f(u.uRadius, STIR_RADIUS);\r
      gl.uniform1f(u.uDecay, decay);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      field.targets = [write, read];\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (lost) return;\r
      const s = settingsRef.current;\r
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05);\r
      last = Math.max(last, now);\r
      const pace = reduced ? 0.2 : 1;\r
      flow += dt * s.speed * 7 * pace;\r
      spin += dt * s.rotation * 0.2 * pace;\r
      if (opening < 1) opening = Math.min(1, opening + dt / 2.2);\r
\r
      const tracking = s.mouse && pointer.inside;\r
      const steerTarget = tracking ? (pointer.x / view.cssWidth - 0.5) * 0.35 * s.strength : 0;\r
      steer.value += (steerTarget - steer.value) * (1 - Math.exp(-dt / 0.8));\r
\r
      gl.bindVertexArray(vao);\r
      if (fieldProgram && field.targets.length) {\r
        const dx = pointer.x - pointer.lastX;\r
        const dy = pointer.y - pointer.lastY;\r
        const moved = tracking && pointer.ready && (dx !== 0 || dy !== 0);\r
        const decay = Math.exp(-dt / 1.6);\r
        if (moved || field.energy > 0.05) {\r
          const amount = 0.85 * s.strength * (reduced ? 0.4 : 1);\r
          const travel = moved ? Math.hypot(dx, dy) * amount : 0;\r
          const steps = Math.max(1, Math.ceil(travel / (STIR_RADIUS * 0.3)));\r
          for (let step = 0; step < steps; step++) {\r
            const a = step / steps;\r
            const b = (step + 1) / steps;\r
            stir(\r
              pointer.lastX + dx * a,\r
              pointer.lastY + dy * a,\r
              pointer.lastX + dx * b,\r
              pointer.lastY + dy * b,\r
              moved ? dx * (b - a) * amount : 0,\r
              moved ? dy * (b - a) * amount : 0,\r
              step === steps - 1 ? decay : 1\r
            );\r
          }\r
          field.energy = field.energy * decay + travel;\r
          if (field.energy <= 0.05) {\r
            field.targets.forEach(target => {\r
              gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);\r
              gl.clearColor(0, 0, 0, 0);\r
              gl.clear(gl.COLOR_BUFFER_BIT);\r
            });\r
          }\r
        }\r
      }\r
      pointer.lastX = pointer.x;\r
      pointer.lastY = pointer.y;\r
\r
      for (let index = twirls.length - 1; index >= 0; index--) {\r
        twirls[index].age += dt;\r
        if (twirls[index].age >= 3.2) twirls.splice(index, 1);\r
      }\r
      twirlData.fill(0);\r
      twirls.forEach((twirl, index) => {\r
        const t = twirl.age;\r
        const rise = smoother(t / 0.25);\r
        const fall = 1 - smoother((t - 0.25) / 2.95);\r
        twirlData[index * 4] = twirl.x;\r
        twirlData[index * 4 + 1] = twirl.y;\r
        twirlData[index * 4 + 2] = twirl.direction * 1.9 * rise * fall;\r
        twirlData[index * 4 + 3] = 150 * (1 + 0.6 * smoother(t / 3.2));\r
      });\r
\r
      const eased = 1 - Math.pow(1 - opening, 3);\r
      const unwind = 1 - eased;\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, view.crt ? paintTarget.framebuffer : null);\r
      gl.viewport(0, 0, view.width, view.height);\r
      gl.useProgram(paintProgram.program);\r
      const u = paintProgram.uniforms;\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, field.targets.length ? field.targets[0].texture : null);\r
      gl.uniform1i(u.uField, 0);\r
      gl.uniform1f(u.uFieldOn, field.targets.length && field.energy > 0.05 ? 1 : 0);\r
      gl.uniform2f(u.uCss, view.cssWidth, view.cssHeight);\r
      gl.uniform2f(u.uCanvas, view.width, view.height);\r
      gl.uniform1f(u.uBlock, view.block);\r
      gl.uniform1f(u.uFlow, flow);\r
      gl.uniform1f(u.uSpin, -0.4 + spin + steer.value + 2.6 * unwind * unwind);\r
      gl.uniform2f(u.uOffset, s.offset[0], s.offset[1]);\r
      gl.uniform3f(u.uColor1, s.color1[0], s.color1[1], s.color1[2]);\r
      gl.uniform3f(u.uColor2, s.color2[0], s.color2[1], s.color2[2]);\r
      gl.uniform3f(u.uColor3, s.color3[0], s.color3[1], s.color3[2]);\r
      gl.uniform1f(u.uContrast, s.contrast);\r
      gl.uniform1f(u.uLighting, s.lighting);\r
      gl.uniform1f(u.uSwirl, Math.min(1, s.swirl + 0.55 * unwind));\r
      gl.uniform1f(u.uScale, s.scale);\r
      gl.uniform1i(u.uDetail, s.detail);\r
      gl.uniform4fv(u.uTwirls, twirlData);\r
      gl.uniform1f(u.uReveal, smoother(opening / 0.45));\r
      gl.uniform1f(u.uLight, s.light ? 1 : 0);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      if (view.crt) {\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
        gl.viewport(0, 0, canvas.width, canvas.height);\r
        gl.useProgram(screenProgram.program);\r
        const v = screenProgram.uniforms;\r
        gl.activeTexture(gl.TEXTURE0);\r
        gl.bindTexture(gl.TEXTURE_2D, paintTarget.texture);\r
        gl.uniform1i(v.uPaint, 0);\r
        gl.uniform2f(v.uCanvas, canvas.width, canvas.height);\r
        gl.uniform2f(v.uSource, view.width, view.height);\r
        gl.uniform1f(v.uDevice, view.device);\r
        gl.uniform1f(v.uCrt, s.crt);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      }\r
\r
      const settling = Math.abs(steerTarget - steer.value) > 0.0005 || field.energy > 0.05 || twirls.length > 0;\r
      const busy = s.speed > 0 || s.rotation !== 0 || opening < 1 || settling;\r
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
      return {\r
        x: event.clientX - rect.left,\r
        y: event.clientY - rect.top,\r
        inside:\r
          event.clientX >= rect.left &&\r
          event.clientX <= rect.right &&\r
          event.clientY >= rect.top &&\r
          event.clientY <= rect.bottom\r
      };\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const spot = locate(event);\r
      if (!pointer.ready || !pointer.inside) {\r
        pointer.lastX = spot.x;\r
        pointer.lastY = spot.y;\r
      }\r
      pointer.vx = spot.x - pointer.x;\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = spot.inside;\r
      pointer.ready = true;\r
      wake();\r
    };\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      const spot = locate(event);\r
      if (!spot.inside || !s.clickSwirl || reduced) return;\r
      twirls.push({ x: spot.x, y: spot.y, age: 0, direction: pointer.vx < 0 ? 1 : -1 });\r
      if (twirls.length > MAX_TWIRLS) twirls.shift();\r
      wake();\r
    };\r
    const onLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
    const onPointerUp = (event: PointerEvent) => {\r
      if (event.pointerType !== 'mouse') onLeave();\r
    };\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    window.addEventListener('pointerup', onPointerUp, { passive: true });\r
    window.addEventListener('pointercancel', onPointerUp, { passive: true });\r
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
      window.removeEventListener('pointerup', onPointerUp);\r
      window.removeEventListener('pointercancel', onPointerUp);\r
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      canvas.removeEventListener('webglcontextlost', onLost);\r
      canvas.removeEventListener('webglcontextrestored', onRestored);\r
      if (!gl.isContextLost()) {\r
        dropField();\r
        gl.deleteTexture(paintTarget.texture);\r
        gl.deleteFramebuffer(paintTarget.framebuffer);\r
        gl.deleteVertexArray(vao);\r
        gl.deleteProgram(paintProgram.program);\r
        gl.deleteProgram(screenProgram.program);\r
        if (fieldProgram) gl.deleteProgram(fieldProgram.program);\r
      }\r
    };\r
  }, [generation]);\r
\r
  return (\r
    <div ref={containerRef} className={\`relative h-full w-full overflow-hidden \${className}\`.trim()} style={style}>\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Balatro;\r
`,o={dependencies:"",usage:`import Balatro from './Balatro';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <Balatro
    color1="#DE443B"
    color2="#006BB4"
    color3="#162325"
    swirl={0.25}
    pixelSize={1.5}
    mouseInteraction
  />
</div>`,code:r,css:e,tailwind:n,tsCode:t,tsTailwind:i};export{o as balatro};
