const r=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
import './SlicedWaves.css';\r
\r
const BAR_VERTEX = \`#version 300 es\r
in vec2 aCorner;\r
in vec4 aShape;\r
in vec4 aTop;\r
in vec4 aBottom;\r
uniform vec2 uView;\r
uniform float uAngle;\r
out vec2 vLocal;\r
out vec4 vShape;\r
out vec4 vTop;\r
out vec4 vBottom;\r
void main() {\r
  float halo = aShape.z + 5.0;\r
  float reachX = aShape.z + max(aTop.w * 2.5, halo * 2.0);\r
  float reachY = aShape.w + max(aTop.w * 2.5, halo * 2.0);\r
  vec2 local = aCorner * vec2(reachX, reachY);\r
  vLocal = local;\r
  vShape = aShape;\r
  vTop = aTop;\r
  vBottom = aBottom;\r
  float c = cos(uAngle);\r
  float s = sin(uAngle);\r
  vec2 p = aShape.xy + local - uView * 0.5;\r
  p = vec2(c * p.x - s * p.y, s * p.x + c * p.y) + uView * 0.5;\r
  gl_Position = vec4(p.x / uView.x * 2.0 - 1.0, 1.0 - p.y / uView.y * 2.0, 0.0, 1.0);\r
}\`;\r
\r
const BAR_FRAGMENT = \`#version 300 es\r
precision highp float;\r
in vec2 vLocal;\r
in vec4 vShape;\r
in vec4 vTop;\r
in vec4 vBottom;\r
uniform float uGlow;\r
uniform float uSlices;\r
uniform float uBase;\r
uniform float uHalfBar;\r
uniform float uScale;\r
out vec4 outColor;\r
\r
float erfApprox(float x) {\r
  float a = x * x;\r
  float t = 1.0 - exp(-a * (1.2732395 + 0.147 * a) / (1.0 + 0.147 * a));\r
  return sign(x) * sqrt(max(t, 0.0));\r
}\r
\r
float box(float d, float h, float s) {\r
  float k = 0.70710678 / max(s, 0.3);\r
  return 0.5 * (erfApprox((h - d) * k) + erfApprox((h + d) * k));\r
}\r
\r
void main() {\r
  float blur = vTop.w;\r
  float body = box(vLocal.x, vShape.z, blur) * box(vLocal.y, vShape.w, blur * 1.15);\r
  float halo = vShape.z + 5.0;\r
  float glow = box(vLocal.x, vShape.z, halo) * box(vLocal.y, vShape.w, halo);\r
  float t = clamp(vLocal.y / max(vShape.w, 0.001) * 0.5 + 0.5, 0.0, 1.0);\r
  vec3 color = mix(vTop.rgb, vBottom.rgb, t);\r
  float v = clamp(vLocal.y / max(vShape.w, 0.001), -1.0, 1.0);\r
  float core = exp(-pow(vLocal.x / max(vShape.z + blur * 0.5, 0.5), 2.0) * 1.5);\r
  body *= (1.0 + 0.35 * core) * (1.0 - 0.35 * v * v * v * v);\r
  if (uSlices > 0.0) {\r
    float cell = vShape.z / max(uHalfBar, 0.00001) / uSlices;\r
    float y = (uBase - vShape.y - vLocal.y) / max(cell, 0.001);\r
    float f = 1.0 - abs(fract(y) - 0.5) * 2.0;\r
    float soft = clamp(blur / max(cell, 0.001) * 1.6, 0.04, 1.0);\r
    body *= smoothstep(0.28 - soft, 0.28 + soft, f);\r
  }\r
  vec3 tint = color * color / max(max(color.r, max(color.g, color.b)), 0.05);\r
  outColor = vec4((color * body + tint * uGlow * glow * 0.16) * vBottom.w * uScale, 1.0);\r
}\`;\r
\r
const QUAD_VERTEX = \`#version 300 es\r
in vec2 aCorner;\r
void main() {\r
  gl_Position = vec4(aCorner, 0.0, 1.0);\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uLight;\r
uniform vec2 uResolution;\r
uniform float uScale;\r
uniform float uExposure;\r
uniform float uGrain;\r
uniform float uTime;\r
uniform float uFade;\r
uniform float uOpacity;\r
uniform float uLightMode;\r
out vec4 outColor;\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
float smootherstep(float edge, float x) {\r
  float t = clamp(x / max(edge, 0.0001), 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  vec3 hdr = texelFetch(uLight, ivec2(gl_FragCoord.xy), 0).rgb / uScale * uExposure;\r
  vec2 uv = gl_FragCoord.xy / uResolution;\r
  float edge = uFade * 0.5;\r
  float mask = smootherstep(edge, uv.x) * smootherstep(edge, 1.0 - uv.x) * smootherstep(edge, uv.y) * smootherstep(edge, 1.0 - uv.y);\r
  mask *= uOpacity;\r
  float grain = (hash(gl_FragCoord.xy + fract(uTime * 7.31) * 113.0) - 0.5) * uGrain;\r
  float peak = max(hdr.r, max(hdr.g, hdr.b));\r
  if (uLightMode > 0.5) {\r
    vec3 hue = hdr / max(peak, 0.0001);\r
    float tone = dot(hue, vec3(0.2126, 0.7152, 0.0722));\r
    vec3 color = pow(clamp(hue * min(1.0, 0.66 / max(tone, 0.001)), 0.0, 1.0), vec3(1.0 / 2.2));\r
    float alpha = clamp((1.0 - exp(-peak * 1.1)) * 0.85 * (1.0 + grain), 0.0, 1.0) * mask;\r
    outColor = vec4(color * alpha, alpha);\r
  } else {\r
    vec3 mapped = 1.0 - exp(-hdr);\r
    mapped = mix(mapped, vec3(1.0), smoothstep(1.1, 3.2, peak) * 0.75);\r
    float level = max(mapped.r, max(mapped.g, mapped.b));\r
    mapped = clamp(mapped + grain * (0.25 + level), 0.0, 1.0) * mask;\r
    outColor = vec4(mapped, max(mapped.r, max(mapped.g, mapped.b)));\r
  }\r
}\`;\r
\r
const TAU = Math.PI * 2;\r
const MAX_RIBBONS = 6;\r
const FOCAL = 1.1;\r
const DISTANCE = 2.6;\r
const INTRO_SECONDS = 1.5;\r
const MAX_RENDER_DIM = 2560;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const hash = n => {\r
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;\r
  return v - Math.floor(v);\r
};\r
\r
const noise = x => {\r
  const i = Math.floor(x);\r
  const f = x - i;\r
  const u = f * f * (3 - 2 * f);\r
  return hash(i) * (1 - u) + hash(i + 1) * u;\r
};\r
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
const link = (gl, vertexSource, fragmentSource, attributes) => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);\r
  const program = gl.createProgram();\r
  if (!vertex || !fragment || !program) return null;\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
  attributes.forEach((name, index) => gl.bindAttribLocation(program, index, name));\r
  gl.linkProgram(program);\r
  gl.deleteShader(vertex);\r
  gl.deleteShader(fragment);\r
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;\r
  gl.deleteProgram(program);\r
  return null;\r
};\r
\r
const locate = (gl, program, names) => {\r
  const result = {};\r
  for (const name of names) result[name] = gl.getUniformLocation(program, name);\r
  return result;\r
};\r
\r
const SlicedWaves = ({\r
  color1 = '#ffd9a8',\r
  color2 = '#ff5fa2',\r
  color3 = '#5b8cff',\r
  ribbons = 3,\r
  spacing = 28,\r
  barWidth = 0.5,\r
  ribbonHeight = 0.26,\r
  spread = 0.1,\r
  amplitude = 0.1,\r
  frequency = 1,\r
  speed = 1,\r
  perspective = 0.45,\r
  curve = 0.5,\r
  blur = 0.6,\r
  glow = 1,\r
  brightness = 1.25,\r
  position = 0.78,\r
  rotation = 0,\r
  slices = 0,\r
  grain = 0.08,\r
  mouseInteraction = true,\r
  intro = true,\r
  fade = 0,\r
  opacity = 1,\r
  lightMode = false,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  ...rest\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settings = {\r
    color1: String(color1),\r
    color2: String(color2),\r
    color3: String(color3),\r
    ribbons: Math.round(clamp(ribbons, 1, MAX_RIBBONS)),\r
    spacing: clamp(spacing, 4, 200),\r
    barWidth: clamp(barWidth, 0.05, 1),\r
    ribbonHeight: Math.max(0, ribbonHeight),\r
    spread: Math.max(0, spread),\r
    amplitude: Math.max(0, amplitude),\r
    frequency: Math.max(0, frequency),\r
    speed,\r
    perspective: clamp(perspective, 0, 1),\r
    curve: clamp(curve, 0, 1),\r
    blur: clamp(blur, 0, 2),\r
    glow: Math.max(0, glow),\r
    brightness: Math.max(0, brightness),\r
    position: clamp(position, 0, 1),\r
    rotation,\r
    slices: Math.max(0, Math.round(slices)),\r
    grain: Math.max(0, grain),\r
    mouseInteraction,\r
    intro,\r
    fade: clamp(fade, 0, 1),\r
    opacity: clamp(opacity, 0, 1),\r
    lightMode,\r
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
    const floatTarget = !!gl.getExtension('EXT_color_buffer_float');\r
    const lightScale = floatTarget ? 1 : 0.25;\r
    const barProgram = link(gl, BAR_VERTEX, BAR_FRAGMENT, ['aCorner', 'aShape', 'aTop', 'aBottom']);\r
    const compositeProgram = link(gl, QUAD_VERTEX, COMPOSITE, ['aCorner']);\r
    if (!barProgram || !compositeProgram) return undefined;\r
    const bar = locate(gl, barProgram, ['uView', 'uAngle', 'uGlow', 'uSlices', 'uBase', 'uHalfBar', 'uScale']);\r
    const composite = locate(gl, compositeProgram, [\r
      'uLight',\r
      'uResolution',\r
      'uScale',\r
      'uExposure',\r
      'uGrain',\r
      'uTime',\r
      'uFade',\r
      'uOpacity',\r
      'uLightMode'\r
    ]);\r
\r
    const cornerBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
    const instanceBuffer = gl.createBuffer();\r
    const barVao = gl.createVertexArray();\r
    gl.bindVertexArray(barVao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);\r
    for (let attribute = 1; attribute <= 3; attribute++) {\r
      gl.enableVertexAttribArray(attribute);\r
      gl.vertexAttribPointer(attribute, 4, gl.FLOAT, false, 48, (attribute - 1) * 16);\r
      gl.vertexAttribDivisor(attribute, 1);\r
    }\r
    const quadBuffer = gl.createBuffer();\r
    const quadVao = gl.createVertexArray();\r
    gl.bindVertexArray(quadVao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    gl.bindVertexArray(null);\r
\r
    const lightTexture = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, lightTexture);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    const framebuffer = gl.createFramebuffer();\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const colorCache = new Map();\r
    let instances = new Float32Array(0);\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const state = {\r
      width: 1,\r
      height: 1,\r
      targetWidth: 0,\r
      targetHeight: 0,\r
      time: 0,\r
      intro: settingsRef.current.intro && !reduce ? 0 : 1,\r
      focus: DISTANCE,\r
      focusVelocity: 0,\r
      lift: 0,\r
      liftX: 0\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let alive = true;\r
\r
    const toLinear = value => {\r
      if (colorCache.has(value)) return colorCache.get(value);\r
      let rgb = [1, 1, 1];\r
      if (probe && value) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#000000';\r
        probe.fillStyle = /^[0-9a-f]{3,8}$/i.test(value) ? \`#\${value}\` : value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r, g, b].map(v => Math.pow(v / 255, 2.2));\r
      }\r
      colorCache.set(value, rgb);\r
      return rgb;\r
    };\r
\r
    const writePalette = (palette, x, offset) => {\r
      const n = palette.length;\r
      const f = ((x % n) + n) % n;\r
      const i = Math.floor(f);\r
      let m = f - i;\r
      m = m * m * (3 - 2 * m);\r
      const a = palette[i];\r
      const b = palette[(i + 1) % n];\r
      for (let c = 0; c < 3; c++) instances[offset + c] = a[c] + (b[c] - a[c]) * m;\r
    };\r
\r
    const ensureTarget = () => {\r
      if (state.targetWidth === canvas.width && state.targetHeight === canvas.height) return;\r
      state.targetWidth = canvas.width;\r
      state.targetHeight = canvas.height;\r
      gl.bindTexture(gl.TEXTURE_2D, lightTexture);\r
      if (floatTarget) {\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, canvas.width, canvas.height, 0, gl.RGBA, gl.HALF_FLOAT, null);\r
      } else {\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
      }\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, lightTexture, 0);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
    };\r
\r
    const layout = s => {\r
      const { width: w, height: h } = state;\r
      const F = h * FOCAL;\r
      const centerScale = F / DISTANCE;\r
      const pitch = s.spacing / centerScale;\r
      const halfBar = pitch * s.barWidth * 0.5;\r
      const yaw = s.perspective * 0.66;\r
      const cosYaw = Math.cos(yaw);\r
      const sinYaw = Math.sin(yaw);\r
      const bend = s.curve * 0.6;\r
      const angle = (s.rotation * Math.PI) / 180;\r
      const span = Math.abs(Math.cos(angle)) * w * 0.5 + Math.abs(Math.sin(angle)) * h * 0.5;\r
      const reach = Math.ceil(((Math.max(w, h) / F) * DISTANCE * 2.4) / pitch);\r
      const bars = [];\r
      for (let i = -reach; i <= reach; i++) {\r
        const x = i * pitch;\r
        const local = bend * Math.sin(x * 0.9 + 0.8);\r
        const X = x * cosYaw - local * sinYaw;\r
        const Z = x * sinYaw + local * cosYaw + DISTANCE;\r
        if (Z < 0.45) continue;\r
        const scale = F / Z;\r
        const sx = w * 0.5 + X * scale;\r
        if (Math.abs(sx - w * 0.5) > span + halfBar * scale + 80) continue;\r
        bars.push({ i, x, Z, sx, scale });\r
      }\r
      return { bars, halfBar, centerScale };\r
    };\r
\r
    const build = (s, view) => {\r
      const { width: w, height: h } = state;\r
      const { bars, halfBar, centerScale } = view;\r
      const palette = [s.color1, s.color2, s.color3].map(toLinear);\r
      const t = state.time;\r
      const thickness = (s.ribbonHeight * h * 0.5) / centerScale;\r
      const separation = (s.spread * h) / centerScale;\r
      const amplitude = (s.amplitude * h) / centerScale;\r
      const frequency = 0.22 * s.frequency;\r
      const base = h * s.position;\r
      const focus = state.focus;\r
      const blurScale = s.blur * 16;\r
      const sweep = 1.6 + 0.04 * (s.ribbons - 1);\r
      const needed = bars.length * s.ribbons * 12;\r
      if (needed > instances.length) instances = new Float32Array(needed + 1200);\r
      let count = 0;\r
      for (const b of bars) {\r
        const hw = halfBar * b.scale;\r
        const across = b.sx / Math.max(w, 1);\r
        const lift = state.lift * Math.exp(-Math.pow((b.sx - state.liftX) / Math.max(w * 0.12, 60), 2));\r
        const blurPx = (0.5 + s.blur * 0.6 + blurScale * Math.abs(focus / b.Z - 1)) * (s.lightMode ? 0.55 : 1);\r
        for (let r = 0; r < s.ribbons; r++) {\r
          const offset = (r - (s.ribbons - 1) / 2) * separation;\r
          const wave =\r
            0.62 * Math.sin(TAU * frequency * b.x - t * 1.6 + r * 2.1) +\r
            0.38 * Math.sin(TAU * frequency * 1.9 * b.x + t * 2.25 + r * 1.3);\r
          const yc = offset + wave * amplitude;\r
          const swell = 0.5 + 0.5 * Math.sin(TAU * frequency * 0.7 * b.x + t * 1.1 + r * 2.7);\r
          const grow = clamp((state.intro * sweep - across - r * 0.04) / 0.6, 0, 1);\r
          const eased = grow * grow * (3 - 2 * grow);\r
          const th = thickness * (0.6 + 0.4 * swell) * eased;\r
          const hh = th * b.scale;\r
          if (hh < 0.4) continue;\r
          const tone = r * 1.15 + b.x * 0.3 + t * 0.12;\r
          const o = count * 12;\r
          instances[o] = b.sx;\r
          instances[o + 1] = base - yc * b.scale;\r
          instances[o + 2] = hw;\r
          instances[o + 3] = hh;\r
          writePalette(palette, tone - 0.22, o + 4);\r
          instances[o + 7] = blurPx;\r
          writePalette(palette, tone + 0.22, o + 8);\r
          instances[o + 11] =\r
            (0.75 + 0.25 * noise(b.i * 0.9 + r * 7.7 - t * 1.2)) * (1 + lift * 0.6) * (0.4 + 0.6 * eased);\r
          count++;\r
        }\r
      }\r
      return { count, halfBar, base };\r
    };\r
\r
    const render = (s, view = layout(s)) => {\r
      ensureTarget();\r
      const { count, halfBar, base } = build(s, view);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      if (count > 0) {\r
        gl.enable(gl.BLEND);\r
        gl.blendFunc(gl.ONE, gl.ONE);\r
        gl.useProgram(barProgram);\r
        gl.uniform2f(bar.uView, state.width, state.height);\r
        gl.uniform1f(bar.uAngle, (s.rotation * Math.PI) / 180);\r
        gl.uniform1f(bar.uGlow, s.lightMode ? s.glow * 0.4 : s.glow);\r
        gl.uniform1f(bar.uSlices, s.slices);\r
        gl.uniform1f(bar.uBase, base);\r
        gl.uniform1f(bar.uHalfBar, halfBar);\r
        gl.uniform1f(bar.uScale, lightScale);\r
        gl.bindVertexArray(barVao);\r
        gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);\r
        gl.bufferData(gl.ARRAY_BUFFER, instances.subarray(0, count * 12), gl.DYNAMIC_DRAW);\r
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, count);\r
        gl.disable(gl.BLEND);\r
      }\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.useProgram(compositeProgram);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, lightTexture);\r
      gl.uniform1i(composite.uLight, 0);\r
      gl.uniform2f(composite.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(composite.uScale, lightScale);\r
      gl.uniform1f(composite.uExposure, 1.6 * s.brightness);\r
      gl.uniform1f(composite.uGrain, s.grain);\r
      gl.uniform1f(composite.uTime, state.time % 1000);\r
      gl.uniform1f(composite.uFade, s.fade);\r
      gl.uniform1f(composite.uOpacity, s.opacity);\r
      gl.uniform1f(composite.uLightMode, s.lightMode ? 1 : 0);\r
      gl.bindVertexArray(quadVao);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const focusTarget = (view, x) => {\r
      let best = null;\r
      for (const b of view.bars) {\r
        if (!best || Math.abs(b.sx - x) < Math.abs(best.sx - x)) best = b;\r
      }\r
      return best ? best.Z : DISTANCE;\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!alive || !visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const moving = !s.paused && !reduce;\r
      if (moving) state.time += dt * s.speed;\r
      if (!s.intro || reduce) state.intro = 1;\r
      else if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / INTRO_SECONDS);\r
\r
      const engaged = s.mouseInteraction && pointer.inside && !reduce;\r
      const angle = (s.rotation * Math.PI) / 180;\r
      const localX =\r
        Math.cos(angle) * (pointer.x - state.width * 0.5) +\r
        Math.sin(angle) * (pointer.y - state.height * 0.5) +\r
        state.width * 0.5;\r
      const view = layout(s);\r
      const target = engaged ? focusTarget(view, localX) : DISTANCE;\r
      state.focusVelocity += (36 * (target - state.focus) - 11 * state.focusVelocity) * dt;\r
      state.focus += state.focusVelocity * dt;\r
      state.lift += ((engaged ? 1 : 0) - state.lift) * (1 - Math.exp(-dt / (engaged ? 0.25 : 0.6)));\r
      state.liftX += (localX - state.liftX) * (1 - Math.exp(-dt / 0.12));\r
\r
      render(s, view);\r
      const settling =\r
        state.intro < 1 ||\r
        Math.abs(target - state.focus) > 0.001 ||\r
        Math.abs(state.focusVelocity) > 0.001 ||\r
        state.lift > 0.002 ||\r
        engaged;\r
      if (moving || settling) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!raf && alive && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const base = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      const longest = Math.max(width, height) * base;\r
      const ratio = longest > MAX_RENDER_DIM ? (base * MAX_RENDER_DIM) / longest : base;\r
      state.width = width;\r
      state.height = height;\r
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      if (!raf) render(s);\r
      wake();\r
    };\r
\r
    const onPointerMove = event => {\r
      const rect = container.getBoundingClientRect();\r
      pointer.x = event.clientX - rect.left;\r
      pointer.y = event.clientY - rect.top;\r
      pointer.inside = pointer.x >= 0 && pointer.y >= 0 && pointer.x <= rect.width && pointer.y <= rect.height;\r
      wake();\r
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
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
\r
    wakeRef.current = () => {\r
      if (!raf) render(settingsRef.current);\r
      wake();\r
    };\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteFramebuffer(framebuffer);\r
      gl.deleteTexture(lightTexture);\r
      gl.deleteBuffer(cornerBuffer);\r
      gl.deleteBuffer(instanceBuffer);\r
      gl.deleteBuffer(quadBuffer);\r
      gl.deleteVertexArray(barVao);\r
      gl.deleteVertexArray(quadVao);\r
      gl.deleteProgram(barProgram);\r
      gl.deleteProgram(compositeProgram);\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div ref={containerRef} className={\`sliced-waves-container\${className ? \` \${className}\` : ''}\`} {...rest}>\r
      <canvas ref={canvasRef} className="sliced-waves-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default SlicedWaves;\r
`,n=`.sliced-waves-container {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.sliced-waves-canvas {\r
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
const BAR_VERTEX = \`#version 300 es\r
in vec2 aCorner;\r
in vec4 aShape;\r
in vec4 aTop;\r
in vec4 aBottom;\r
uniform vec2 uView;\r
uniform float uAngle;\r
out vec2 vLocal;\r
out vec4 vShape;\r
out vec4 vTop;\r
out vec4 vBottom;\r
void main() {\r
  float halo = aShape.z + 5.0;\r
  float reachX = aShape.z + max(aTop.w * 2.5, halo * 2.0);\r
  float reachY = aShape.w + max(aTop.w * 2.5, halo * 2.0);\r
  vec2 local = aCorner * vec2(reachX, reachY);\r
  vLocal = local;\r
  vShape = aShape;\r
  vTop = aTop;\r
  vBottom = aBottom;\r
  float c = cos(uAngle);\r
  float s = sin(uAngle);\r
  vec2 p = aShape.xy + local - uView * 0.5;\r
  p = vec2(c * p.x - s * p.y, s * p.x + c * p.y) + uView * 0.5;\r
  gl_Position = vec4(p.x / uView.x * 2.0 - 1.0, 1.0 - p.y / uView.y * 2.0, 0.0, 1.0);\r
}\`;\r
\r
const BAR_FRAGMENT = \`#version 300 es\r
precision highp float;\r
in vec2 vLocal;\r
in vec4 vShape;\r
in vec4 vTop;\r
in vec4 vBottom;\r
uniform float uGlow;\r
uniform float uSlices;\r
uniform float uBase;\r
uniform float uHalfBar;\r
uniform float uScale;\r
out vec4 outColor;\r
\r
float erfApprox(float x) {\r
  float a = x * x;\r
  float t = 1.0 - exp(-a * (1.2732395 + 0.147 * a) / (1.0 + 0.147 * a));\r
  return sign(x) * sqrt(max(t, 0.0));\r
}\r
\r
float box(float d, float h, float s) {\r
  float k = 0.70710678 / max(s, 0.3);\r
  return 0.5 * (erfApprox((h - d) * k) + erfApprox((h + d) * k));\r
}\r
\r
void main() {\r
  float blur = vTop.w;\r
  float body = box(vLocal.x, vShape.z, blur) * box(vLocal.y, vShape.w, blur * 1.15);\r
  float halo = vShape.z + 5.0;\r
  float glow = box(vLocal.x, vShape.z, halo) * box(vLocal.y, vShape.w, halo);\r
  float t = clamp(vLocal.y / max(vShape.w, 0.001) * 0.5 + 0.5, 0.0, 1.0);\r
  vec3 color = mix(vTop.rgb, vBottom.rgb, t);\r
  float v = clamp(vLocal.y / max(vShape.w, 0.001), -1.0, 1.0);\r
  float core = exp(-pow(vLocal.x / max(vShape.z + blur * 0.5, 0.5), 2.0) * 1.5);\r
  body *= (1.0 + 0.35 * core) * (1.0 - 0.35 * v * v * v * v);\r
  if (uSlices > 0.0) {\r
    float cell = vShape.z / max(uHalfBar, 0.00001) / uSlices;\r
    float y = (uBase - vShape.y - vLocal.y) / max(cell, 0.001);\r
    float f = 1.0 - abs(fract(y) - 0.5) * 2.0;\r
    float soft = clamp(blur / max(cell, 0.001) * 1.6, 0.04, 1.0);\r
    body *= smoothstep(0.28 - soft, 0.28 + soft, f);\r
  }\r
  vec3 tint = color * color / max(max(color.r, max(color.g, color.b)), 0.05);\r
  outColor = vec4((color * body + tint * uGlow * glow * 0.16) * vBottom.w * uScale, 1.0);\r
}\`;\r
\r
const QUAD_VERTEX = \`#version 300 es\r
in vec2 aCorner;\r
void main() {\r
  gl_Position = vec4(aCorner, 0.0, 1.0);\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uLight;\r
uniform vec2 uResolution;\r
uniform float uScale;\r
uniform float uExposure;\r
uniform float uGrain;\r
uniform float uTime;\r
uniform float uFade;\r
uniform float uOpacity;\r
uniform float uLightMode;\r
out vec4 outColor;\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
float smootherstep(float edge, float x) {\r
  float t = clamp(x / max(edge, 0.0001), 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  vec3 hdr = texelFetch(uLight, ivec2(gl_FragCoord.xy), 0).rgb / uScale * uExposure;\r
  vec2 uv = gl_FragCoord.xy / uResolution;\r
  float edge = uFade * 0.5;\r
  float mask = smootherstep(edge, uv.x) * smootherstep(edge, 1.0 - uv.x) * smootherstep(edge, uv.y) * smootherstep(edge, 1.0 - uv.y);\r
  mask *= uOpacity;\r
  float grain = (hash(gl_FragCoord.xy + fract(uTime * 7.31) * 113.0) - 0.5) * uGrain;\r
  float peak = max(hdr.r, max(hdr.g, hdr.b));\r
  if (uLightMode > 0.5) {\r
    vec3 hue = hdr / max(peak, 0.0001);\r
    float tone = dot(hue, vec3(0.2126, 0.7152, 0.0722));\r
    vec3 color = pow(clamp(hue * min(1.0, 0.66 / max(tone, 0.001)), 0.0, 1.0), vec3(1.0 / 2.2));\r
    float alpha = clamp((1.0 - exp(-peak * 1.1)) * 0.85 * (1.0 + grain), 0.0, 1.0) * mask;\r
    outColor = vec4(color * alpha, alpha);\r
  } else {\r
    vec3 mapped = 1.0 - exp(-hdr);\r
    mapped = mix(mapped, vec3(1.0), smoothstep(1.1, 3.2, peak) * 0.75);\r
    float level = max(mapped.r, max(mapped.g, mapped.b));\r
    mapped = clamp(mapped + grain * (0.25 + level), 0.0, 1.0) * mask;\r
    outColor = vec4(mapped, max(mapped.r, max(mapped.g, mapped.b)));\r
  }\r
}\`;\r
\r
const TAU = Math.PI * 2;\r
const MAX_RIBBONS = 6;\r
const FOCAL = 1.1;\r
const DISTANCE = 2.6;\r
const INTRO_SECONDS = 1.5;\r
const MAX_RENDER_DIM = 2560;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const hash = n => {\r
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;\r
  return v - Math.floor(v);\r
};\r
\r
const noise = x => {\r
  const i = Math.floor(x);\r
  const f = x - i;\r
  const u = f * f * (3 - 2 * f);\r
  return hash(i) * (1 - u) + hash(i + 1) * u;\r
};\r
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
const link = (gl, vertexSource, fragmentSource, attributes) => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);\r
  const program = gl.createProgram();\r
  if (!vertex || !fragment || !program) return null;\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
  attributes.forEach((name, index) => gl.bindAttribLocation(program, index, name));\r
  gl.linkProgram(program);\r
  gl.deleteShader(vertex);\r
  gl.deleteShader(fragment);\r
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;\r
  gl.deleteProgram(program);\r
  return null;\r
};\r
\r
const locate = (gl, program, names) => {\r
  const result = {};\r
  for (const name of names) result[name] = gl.getUniformLocation(program, name);\r
  return result;\r
};\r
\r
const SlicedWaves = ({\r
  color1 = '#ffd9a8',\r
  color2 = '#ff5fa2',\r
  color3 = '#5b8cff',\r
  ribbons = 3,\r
  spacing = 28,\r
  barWidth = 0.5,\r
  ribbonHeight = 0.26,\r
  spread = 0.1,\r
  amplitude = 0.1,\r
  frequency = 1,\r
  speed = 1,\r
  perspective = 0.45,\r
  curve = 0.5,\r
  blur = 0.6,\r
  glow = 1,\r
  brightness = 1.25,\r
  position = 0.78,\r
  rotation = 0,\r
  slices = 0,\r
  grain = 0.08,\r
  mouseInteraction = true,\r
  intro = true,\r
  fade = 0,\r
  opacity = 1,\r
  lightMode = false,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  ...rest\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settings = {\r
    color1: String(color1),\r
    color2: String(color2),\r
    color3: String(color3),\r
    ribbons: Math.round(clamp(ribbons, 1, MAX_RIBBONS)),\r
    spacing: clamp(spacing, 4, 200),\r
    barWidth: clamp(barWidth, 0.05, 1),\r
    ribbonHeight: Math.max(0, ribbonHeight),\r
    spread: Math.max(0, spread),\r
    amplitude: Math.max(0, amplitude),\r
    frequency: Math.max(0, frequency),\r
    speed,\r
    perspective: clamp(perspective, 0, 1),\r
    curve: clamp(curve, 0, 1),\r
    blur: clamp(blur, 0, 2),\r
    glow: Math.max(0, glow),\r
    brightness: Math.max(0, brightness),\r
    position: clamp(position, 0, 1),\r
    rotation,\r
    slices: Math.max(0, Math.round(slices)),\r
    grain: Math.max(0, grain),\r
    mouseInteraction,\r
    intro,\r
    fade: clamp(fade, 0, 1),\r
    opacity: clamp(opacity, 0, 1),\r
    lightMode,\r
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
    const floatTarget = !!gl.getExtension('EXT_color_buffer_float');\r
    const lightScale = floatTarget ? 1 : 0.25;\r
    const barProgram = link(gl, BAR_VERTEX, BAR_FRAGMENT, ['aCorner', 'aShape', 'aTop', 'aBottom']);\r
    const compositeProgram = link(gl, QUAD_VERTEX, COMPOSITE, ['aCorner']);\r
    if (!barProgram || !compositeProgram) return undefined;\r
    const bar = locate(gl, barProgram, ['uView', 'uAngle', 'uGlow', 'uSlices', 'uBase', 'uHalfBar', 'uScale']);\r
    const composite = locate(gl, compositeProgram, [\r
      'uLight',\r
      'uResolution',\r
      'uScale',\r
      'uExposure',\r
      'uGrain',\r
      'uTime',\r
      'uFade',\r
      'uOpacity',\r
      'uLightMode'\r
    ]);\r
\r
    const cornerBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
    const instanceBuffer = gl.createBuffer();\r
    const barVao = gl.createVertexArray();\r
    gl.bindVertexArray(barVao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);\r
    for (let attribute = 1; attribute <= 3; attribute++) {\r
      gl.enableVertexAttribArray(attribute);\r
      gl.vertexAttribPointer(attribute, 4, gl.FLOAT, false, 48, (attribute - 1) * 16);\r
      gl.vertexAttribDivisor(attribute, 1);\r
    }\r
    const quadBuffer = gl.createBuffer();\r
    const quadVao = gl.createVertexArray();\r
    gl.bindVertexArray(quadVao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    gl.bindVertexArray(null);\r
\r
    const lightTexture = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, lightTexture);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    const framebuffer = gl.createFramebuffer();\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const colorCache = new Map();\r
    let instances = new Float32Array(0);\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const state = {\r
      width: 1,\r
      height: 1,\r
      targetWidth: 0,\r
      targetHeight: 0,\r
      time: 0,\r
      intro: settingsRef.current.intro && !reduce ? 0 : 1,\r
      focus: DISTANCE,\r
      focusVelocity: 0,\r
      lift: 0,\r
      liftX: 0\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let alive = true;\r
\r
    const toLinear = value => {\r
      if (colorCache.has(value)) return colorCache.get(value);\r
      let rgb = [1, 1, 1];\r
      if (probe && value) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#000000';\r
        probe.fillStyle = /^[0-9a-f]{3,8}$/i.test(value) ? \`#\${value}\` : value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r, g, b].map(v => Math.pow(v / 255, 2.2));\r
      }\r
      colorCache.set(value, rgb);\r
      return rgb;\r
    };\r
\r
    const writePalette = (palette, x, offset) => {\r
      const n = palette.length;\r
      const f = ((x % n) + n) % n;\r
      const i = Math.floor(f);\r
      let m = f - i;\r
      m = m * m * (3 - 2 * m);\r
      const a = palette[i];\r
      const b = palette[(i + 1) % n];\r
      for (let c = 0; c < 3; c++) instances[offset + c] = a[c] + (b[c] - a[c]) * m;\r
    };\r
\r
    const ensureTarget = () => {\r
      if (state.targetWidth === canvas.width && state.targetHeight === canvas.height) return;\r
      state.targetWidth = canvas.width;\r
      state.targetHeight = canvas.height;\r
      gl.bindTexture(gl.TEXTURE_2D, lightTexture);\r
      if (floatTarget) {\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, canvas.width, canvas.height, 0, gl.RGBA, gl.HALF_FLOAT, null);\r
      } else {\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
      }\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, lightTexture, 0);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
    };\r
\r
    const layout = s => {\r
      const { width: w, height: h } = state;\r
      const F = h * FOCAL;\r
      const centerScale = F / DISTANCE;\r
      const pitch = s.spacing / centerScale;\r
      const halfBar = pitch * s.barWidth * 0.5;\r
      const yaw = s.perspective * 0.66;\r
      const cosYaw = Math.cos(yaw);\r
      const sinYaw = Math.sin(yaw);\r
      const bend = s.curve * 0.6;\r
      const angle = (s.rotation * Math.PI) / 180;\r
      const span = Math.abs(Math.cos(angle)) * w * 0.5 + Math.abs(Math.sin(angle)) * h * 0.5;\r
      const reach = Math.ceil(((Math.max(w, h) / F) * DISTANCE * 2.4) / pitch);\r
      const bars = [];\r
      for (let i = -reach; i <= reach; i++) {\r
        const x = i * pitch;\r
        const local = bend * Math.sin(x * 0.9 + 0.8);\r
        const X = x * cosYaw - local * sinYaw;\r
        const Z = x * sinYaw + local * cosYaw + DISTANCE;\r
        if (Z < 0.45) continue;\r
        const scale = F / Z;\r
        const sx = w * 0.5 + X * scale;\r
        if (Math.abs(sx - w * 0.5) > span + halfBar * scale + 80) continue;\r
        bars.push({ i, x, Z, sx, scale });\r
      }\r
      return { bars, halfBar, centerScale };\r
    };\r
\r
    const build = (s, view) => {\r
      const { width: w, height: h } = state;\r
      const { bars, halfBar, centerScale } = view;\r
      const palette = [s.color1, s.color2, s.color3].map(toLinear);\r
      const t = state.time;\r
      const thickness = (s.ribbonHeight * h * 0.5) / centerScale;\r
      const separation = (s.spread * h) / centerScale;\r
      const amplitude = (s.amplitude * h) / centerScale;\r
      const frequency = 0.22 * s.frequency;\r
      const base = h * s.position;\r
      const focus = state.focus;\r
      const blurScale = s.blur * 16;\r
      const sweep = 1.6 + 0.04 * (s.ribbons - 1);\r
      const needed = bars.length * s.ribbons * 12;\r
      if (needed > instances.length) instances = new Float32Array(needed + 1200);\r
      let count = 0;\r
      for (const b of bars) {\r
        const hw = halfBar * b.scale;\r
        const across = b.sx / Math.max(w, 1);\r
        const lift = state.lift * Math.exp(-Math.pow((b.sx - state.liftX) / Math.max(w * 0.12, 60), 2));\r
        const blurPx = (0.5 + s.blur * 0.6 + blurScale * Math.abs(focus / b.Z - 1)) * (s.lightMode ? 0.55 : 1);\r
        for (let r = 0; r < s.ribbons; r++) {\r
          const offset = (r - (s.ribbons - 1) / 2) * separation;\r
          const wave =\r
            0.62 * Math.sin(TAU * frequency * b.x - t * 1.6 + r * 2.1) +\r
            0.38 * Math.sin(TAU * frequency * 1.9 * b.x + t * 2.25 + r * 1.3);\r
          const yc = offset + wave * amplitude;\r
          const swell = 0.5 + 0.5 * Math.sin(TAU * frequency * 0.7 * b.x + t * 1.1 + r * 2.7);\r
          const grow = clamp((state.intro * sweep - across - r * 0.04) / 0.6, 0, 1);\r
          const eased = grow * grow * (3 - 2 * grow);\r
          const th = thickness * (0.6 + 0.4 * swell) * eased;\r
          const hh = th * b.scale;\r
          if (hh < 0.4) continue;\r
          const tone = r * 1.15 + b.x * 0.3 + t * 0.12;\r
          const o = count * 12;\r
          instances[o] = b.sx;\r
          instances[o + 1] = base - yc * b.scale;\r
          instances[o + 2] = hw;\r
          instances[o + 3] = hh;\r
          writePalette(palette, tone - 0.22, o + 4);\r
          instances[o + 7] = blurPx;\r
          writePalette(palette, tone + 0.22, o + 8);\r
          instances[o + 11] =\r
            (0.75 + 0.25 * noise(b.i * 0.9 + r * 7.7 - t * 1.2)) * (1 + lift * 0.6) * (0.4 + 0.6 * eased);\r
          count++;\r
        }\r
      }\r
      return { count, halfBar, base };\r
    };\r
\r
    const render = (s, view = layout(s)) => {\r
      ensureTarget();\r
      const { count, halfBar, base } = build(s, view);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      if (count > 0) {\r
        gl.enable(gl.BLEND);\r
        gl.blendFunc(gl.ONE, gl.ONE);\r
        gl.useProgram(barProgram);\r
        gl.uniform2f(bar.uView, state.width, state.height);\r
        gl.uniform1f(bar.uAngle, (s.rotation * Math.PI) / 180);\r
        gl.uniform1f(bar.uGlow, s.lightMode ? s.glow * 0.4 : s.glow);\r
        gl.uniform1f(bar.uSlices, s.slices);\r
        gl.uniform1f(bar.uBase, base);\r
        gl.uniform1f(bar.uHalfBar, halfBar);\r
        gl.uniform1f(bar.uScale, lightScale);\r
        gl.bindVertexArray(barVao);\r
        gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);\r
        gl.bufferData(gl.ARRAY_BUFFER, instances.subarray(0, count * 12), gl.DYNAMIC_DRAW);\r
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, count);\r
        gl.disable(gl.BLEND);\r
      }\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.useProgram(compositeProgram);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, lightTexture);\r
      gl.uniform1i(composite.uLight, 0);\r
      gl.uniform2f(composite.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(composite.uScale, lightScale);\r
      gl.uniform1f(composite.uExposure, 1.6 * s.brightness);\r
      gl.uniform1f(composite.uGrain, s.grain);\r
      gl.uniform1f(composite.uTime, state.time % 1000);\r
      gl.uniform1f(composite.uFade, s.fade);\r
      gl.uniform1f(composite.uOpacity, s.opacity);\r
      gl.uniform1f(composite.uLightMode, s.lightMode ? 1 : 0);\r
      gl.bindVertexArray(quadVao);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const focusTarget = (view, x) => {\r
      let best = null;\r
      for (const b of view.bars) {\r
        if (!best || Math.abs(b.sx - x) < Math.abs(best.sx - x)) best = b;\r
      }\r
      return best ? best.Z : DISTANCE;\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!alive || !visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const moving = !s.paused && !reduce;\r
      if (moving) state.time += dt * s.speed;\r
      if (!s.intro || reduce) state.intro = 1;\r
      else if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / INTRO_SECONDS);\r
\r
      const engaged = s.mouseInteraction && pointer.inside && !reduce;\r
      const angle = (s.rotation * Math.PI) / 180;\r
      const localX =\r
        Math.cos(angle) * (pointer.x - state.width * 0.5) +\r
        Math.sin(angle) * (pointer.y - state.height * 0.5) +\r
        state.width * 0.5;\r
      const view = layout(s);\r
      const target = engaged ? focusTarget(view, localX) : DISTANCE;\r
      state.focusVelocity += (36 * (target - state.focus) - 11 * state.focusVelocity) * dt;\r
      state.focus += state.focusVelocity * dt;\r
      state.lift += ((engaged ? 1 : 0) - state.lift) * (1 - Math.exp(-dt / (engaged ? 0.25 : 0.6)));\r
      state.liftX += (localX - state.liftX) * (1 - Math.exp(-dt / 0.12));\r
\r
      render(s, view);\r
      const settling =\r
        state.intro < 1 ||\r
        Math.abs(target - state.focus) > 0.001 ||\r
        Math.abs(state.focusVelocity) > 0.001 ||\r
        state.lift > 0.002 ||\r
        engaged;\r
      if (moving || settling) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!raf && alive && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const base = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      const longest = Math.max(width, height) * base;\r
      const ratio = longest > MAX_RENDER_DIM ? (base * MAX_RENDER_DIM) / longest : base;\r
      state.width = width;\r
      state.height = height;\r
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      if (!raf) render(s);\r
      wake();\r
    };\r
\r
    const onPointerMove = event => {\r
      const rect = container.getBoundingClientRect();\r
      pointer.x = event.clientX - rect.left;\r
      pointer.y = event.clientY - rect.top;\r
      pointer.inside = pointer.x >= 0 && pointer.y >= 0 && pointer.x <= rect.width && pointer.y <= rect.height;\r
      wake();\r
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
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
\r
    wakeRef.current = () => {\r
      if (!raf) render(settingsRef.current);\r
      wake();\r
    };\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteFramebuffer(framebuffer);\r
      gl.deleteTexture(lightTexture);\r
      gl.deleteBuffer(cornerBuffer);\r
      gl.deleteBuffer(instanceBuffer);\r
      gl.deleteBuffer(quadBuffer);\r
      gl.deleteVertexArray(barVao);\r
      gl.deleteVertexArray(quadVao);\r
      gl.deleteProgram(barProgram);\r
      gl.deleteProgram(compositeProgram);\r
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
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default SlicedWaves;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, type HTMLAttributes } from 'react';\r
\r
import './SlicedWaves.css';\r
\r
export interface SlicedWavesProps extends HTMLAttributes<HTMLDivElement> {\r
  color1?: string;\r
  color2?: string;\r
  color3?: string;\r
  ribbons?: number;\r
  spacing?: number;\r
  barWidth?: number;\r
  ribbonHeight?: number;\r
  spread?: number;\r
  amplitude?: number;\r
  frequency?: number;\r
  speed?: number;\r
  perspective?: number;\r
  curve?: number;\r
  blur?: number;\r
  glow?: number;\r
  brightness?: number;\r
  position?: number;\r
  rotation?: number;\r
  slices?: number;\r
  grain?: number;\r
  mouseInteraction?: boolean;\r
  intro?: boolean;\r
  fade?: number;\r
  opacity?: number;\r
  lightMode?: boolean;\r
  paused?: boolean;\r
  dpr?: number;\r
}\r
\r
type Settings = {\r
  color1: string;\r
  color2: string;\r
  color3: string;\r
  ribbons: number;\r
  spacing: number;\r
  barWidth: number;\r
  ribbonHeight: number;\r
  spread: number;\r
  amplitude: number;\r
  frequency: number;\r
  speed: number;\r
  perspective: number;\r
  curve: number;\r
  blur: number;\r
  glow: number;\r
  brightness: number;\r
  position: number;\r
  rotation: number;\r
  slices: number;\r
  grain: number;\r
  mouseInteraction: boolean;\r
  intro: boolean;\r
  fade: number;\r
  opacity: number;\r
  lightMode: boolean;\r
  paused: boolean;\r
  dpr?: number;\r
};\r
\r
type Bar = { i: number; x: number; Z: number; sx: number; scale: number };\r
\r
type View = { bars: Bar[]; halfBar: number; centerScale: number };\r
\r
const BAR_VERTEX = \`#version 300 es\r
in vec2 aCorner;\r
in vec4 aShape;\r
in vec4 aTop;\r
in vec4 aBottom;\r
uniform vec2 uView;\r
uniform float uAngle;\r
out vec2 vLocal;\r
out vec4 vShape;\r
out vec4 vTop;\r
out vec4 vBottom;\r
void main() {\r
  float halo = aShape.z + 5.0;\r
  float reachX = aShape.z + max(aTop.w * 2.5, halo * 2.0);\r
  float reachY = aShape.w + max(aTop.w * 2.5, halo * 2.0);\r
  vec2 local = aCorner * vec2(reachX, reachY);\r
  vLocal = local;\r
  vShape = aShape;\r
  vTop = aTop;\r
  vBottom = aBottom;\r
  float c = cos(uAngle);\r
  float s = sin(uAngle);\r
  vec2 p = aShape.xy + local - uView * 0.5;\r
  p = vec2(c * p.x - s * p.y, s * p.x + c * p.y) + uView * 0.5;\r
  gl_Position = vec4(p.x / uView.x * 2.0 - 1.0, 1.0 - p.y / uView.y * 2.0, 0.0, 1.0);\r
}\`;\r
\r
const BAR_FRAGMENT = \`#version 300 es\r
precision highp float;\r
in vec2 vLocal;\r
in vec4 vShape;\r
in vec4 vTop;\r
in vec4 vBottom;\r
uniform float uGlow;\r
uniform float uSlices;\r
uniform float uBase;\r
uniform float uHalfBar;\r
uniform float uScale;\r
out vec4 outColor;\r
\r
float erfApprox(float x) {\r
  float a = x * x;\r
  float t = 1.0 - exp(-a * (1.2732395 + 0.147 * a) / (1.0 + 0.147 * a));\r
  return sign(x) * sqrt(max(t, 0.0));\r
}\r
\r
float box(float d, float h, float s) {\r
  float k = 0.70710678 / max(s, 0.3);\r
  return 0.5 * (erfApprox((h - d) * k) + erfApprox((h + d) * k));\r
}\r
\r
void main() {\r
  float blur = vTop.w;\r
  float body = box(vLocal.x, vShape.z, blur) * box(vLocal.y, vShape.w, blur * 1.15);\r
  float halo = vShape.z + 5.0;\r
  float glow = box(vLocal.x, vShape.z, halo) * box(vLocal.y, vShape.w, halo);\r
  float t = clamp(vLocal.y / max(vShape.w, 0.001) * 0.5 + 0.5, 0.0, 1.0);\r
  vec3 color = mix(vTop.rgb, vBottom.rgb, t);\r
  float v = clamp(vLocal.y / max(vShape.w, 0.001), -1.0, 1.0);\r
  float core = exp(-pow(vLocal.x / max(vShape.z + blur * 0.5, 0.5), 2.0) * 1.5);\r
  body *= (1.0 + 0.35 * core) * (1.0 - 0.35 * v * v * v * v);\r
  if (uSlices > 0.0) {\r
    float cell = vShape.z / max(uHalfBar, 0.00001) / uSlices;\r
    float y = (uBase - vShape.y - vLocal.y) / max(cell, 0.001);\r
    float f = 1.0 - abs(fract(y) - 0.5) * 2.0;\r
    float soft = clamp(blur / max(cell, 0.001) * 1.6, 0.04, 1.0);\r
    body *= smoothstep(0.28 - soft, 0.28 + soft, f);\r
  }\r
  vec3 tint = color * color / max(max(color.r, max(color.g, color.b)), 0.05);\r
  outColor = vec4((color * body + tint * uGlow * glow * 0.16) * vBottom.w * uScale, 1.0);\r
}\`;\r
\r
const QUAD_VERTEX = \`#version 300 es\r
in vec2 aCorner;\r
void main() {\r
  gl_Position = vec4(aCorner, 0.0, 1.0);\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uLight;\r
uniform vec2 uResolution;\r
uniform float uScale;\r
uniform float uExposure;\r
uniform float uGrain;\r
uniform float uTime;\r
uniform float uFade;\r
uniform float uOpacity;\r
uniform float uLightMode;\r
out vec4 outColor;\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
float smootherstep(float edge, float x) {\r
  float t = clamp(x / max(edge, 0.0001), 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  vec3 hdr = texelFetch(uLight, ivec2(gl_FragCoord.xy), 0).rgb / uScale * uExposure;\r
  vec2 uv = gl_FragCoord.xy / uResolution;\r
  float edge = uFade * 0.5;\r
  float mask = smootherstep(edge, uv.x) * smootherstep(edge, 1.0 - uv.x) * smootherstep(edge, uv.y) * smootherstep(edge, 1.0 - uv.y);\r
  mask *= uOpacity;\r
  float grain = (hash(gl_FragCoord.xy + fract(uTime * 7.31) * 113.0) - 0.5) * uGrain;\r
  float peak = max(hdr.r, max(hdr.g, hdr.b));\r
  if (uLightMode > 0.5) {\r
    vec3 hue = hdr / max(peak, 0.0001);\r
    float tone = dot(hue, vec3(0.2126, 0.7152, 0.0722));\r
    vec3 color = pow(clamp(hue * min(1.0, 0.66 / max(tone, 0.001)), 0.0, 1.0), vec3(1.0 / 2.2));\r
    float alpha = clamp((1.0 - exp(-peak * 1.1)) * 0.85 * (1.0 + grain), 0.0, 1.0) * mask;\r
    outColor = vec4(color * alpha, alpha);\r
  } else {\r
    vec3 mapped = 1.0 - exp(-hdr);\r
    mapped = mix(mapped, vec3(1.0), smoothstep(1.1, 3.2, peak) * 0.75);\r
    float level = max(mapped.r, max(mapped.g, mapped.b));\r
    mapped = clamp(mapped + grain * (0.25 + level), 0.0, 1.0) * mask;\r
    outColor = vec4(mapped, max(mapped.r, max(mapped.g, mapped.b)));\r
  }\r
}\`;\r
\r
const TAU = Math.PI * 2;\r
const MAX_RIBBONS = 6;\r
const FOCAL = 1.1;\r
const DISTANCE = 2.6;\r
const INTRO_SECONDS = 1.5;\r
const MAX_RENDER_DIM = 2560;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const hash = (n: number) => {\r
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;\r
  return v - Math.floor(v);\r
};\r
\r
const noise = (x: number) => {\r
  const i = Math.floor(x);\r
  const f = x - i;\r
  const u = f * f * (3 - 2 * f);\r
  return hash(i) * (1 - u) + hash(i + 1) * u;\r
};\r
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
const link = (gl: WebGL2RenderingContext, vertexSource: string, fragmentSource: string, attributes: string[]) => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);\r
  const program = gl.createProgram();\r
  if (!vertex || !fragment || !program) return null;\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
  attributes.forEach((name, index) => gl.bindAttribLocation(program, index, name));\r
  gl.linkProgram(program);\r
  gl.deleteShader(vertex);\r
  gl.deleteShader(fragment);\r
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;\r
  gl.deleteProgram(program);\r
  return null;\r
};\r
\r
const locate = (gl: WebGL2RenderingContext, program: WebGLProgram, names: string[]) => {\r
  const result: Record<string, WebGLUniformLocation | null> = {};\r
  for (const name of names) result[name] = gl.getUniformLocation(program, name);\r
  return result;\r
};\r
\r
const SlicedWaves = ({\r
  color1 = '#ffd9a8',\r
  color2 = '#ff5fa2',\r
  color3 = '#5b8cff',\r
  ribbons = 3,\r
  spacing = 28,\r
  barWidth = 0.5,\r
  ribbonHeight = 0.26,\r
  spread = 0.1,\r
  amplitude = 0.1,\r
  frequency = 1,\r
  speed = 1,\r
  perspective = 0.45,\r
  curve = 0.5,\r
  blur = 0.6,\r
  glow = 1,\r
  brightness = 1.25,\r
  position = 0.78,\r
  rotation = 0,\r
  slices = 0,\r
  grain = 0.08,\r
  mouseInteraction = true,\r
  intro = true,\r
  fade = 0,\r
  opacity = 1,\r
  lightMode = false,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  ...rest\r
}: SlicedWavesProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings: Settings = {\r
    color1: String(color1),\r
    color2: String(color2),\r
    color3: String(color3),\r
    ribbons: Math.round(clamp(ribbons, 1, MAX_RIBBONS)),\r
    spacing: clamp(spacing, 4, 200),\r
    barWidth: clamp(barWidth, 0.05, 1),\r
    ribbonHeight: Math.max(0, ribbonHeight),\r
    spread: Math.max(0, spread),\r
    amplitude: Math.max(0, amplitude),\r
    frequency: Math.max(0, frequency),\r
    speed,\r
    perspective: clamp(perspective, 0, 1),\r
    curve: clamp(curve, 0, 1),\r
    blur: clamp(blur, 0, 2),\r
    glow: Math.max(0, glow),\r
    brightness: Math.max(0, brightness),\r
    position: clamp(position, 0, 1),\r
    rotation,\r
    slices: Math.max(0, Math.round(slices)),\r
    grain: Math.max(0, grain),\r
    mouseInteraction,\r
    intro,\r
    fade: clamp(fade, 0, 1),\r
    opacity: clamp(opacity, 0, 1),\r
    lightMode,\r
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
    const floatTarget = !!gl.getExtension('EXT_color_buffer_float');\r
    const lightScale = floatTarget ? 1 : 0.25;\r
    const barProgram = link(gl, BAR_VERTEX, BAR_FRAGMENT, ['aCorner', 'aShape', 'aTop', 'aBottom']);\r
    const compositeProgram = link(gl, QUAD_VERTEX, COMPOSITE, ['aCorner']);\r
    if (!barProgram || !compositeProgram) return undefined;\r
    const bar = locate(gl, barProgram, ['uView', 'uAngle', 'uGlow', 'uSlices', 'uBase', 'uHalfBar', 'uScale']);\r
    const composite = locate(gl, compositeProgram, [\r
      'uLight',\r
      'uResolution',\r
      'uScale',\r
      'uExposure',\r
      'uGrain',\r
      'uTime',\r
      'uFade',\r
      'uOpacity',\r
      'uLightMode'\r
    ]);\r
\r
    const cornerBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
    const instanceBuffer = gl.createBuffer();\r
    const barVao = gl.createVertexArray();\r
    gl.bindVertexArray(barVao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);\r
    for (let attribute = 1; attribute <= 3; attribute++) {\r
      gl.enableVertexAttribArray(attribute);\r
      gl.vertexAttribPointer(attribute, 4, gl.FLOAT, false, 48, (attribute - 1) * 16);\r
      gl.vertexAttribDivisor(attribute, 1);\r
    }\r
    const quadBuffer = gl.createBuffer();\r
    const quadVao = gl.createVertexArray();\r
    gl.bindVertexArray(quadVao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    gl.bindVertexArray(null);\r
\r
    const lightTexture = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, lightTexture);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    const framebuffer = gl.createFramebuffer();\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const colorCache = new Map<string, number[]>();\r
    let instances = new Float32Array(0);\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const state = {\r
      width: 1,\r
      height: 1,\r
      targetWidth: 0,\r
      targetHeight: 0,\r
      time: 0,\r
      intro: settingsRef.current.intro && !reduce ? 0 : 1,\r
      focus: DISTANCE,\r
      focusVelocity: 0,\r
      lift: 0,\r
      liftX: 0\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let alive = true;\r
\r
    const toLinear = (value: string): number[] => {\r
      const cached = colorCache.get(value);\r
      if (cached) return cached;\r
      let rgb = [1, 1, 1];\r
      if (probe && value) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#000000';\r
        probe.fillStyle = /^[0-9a-f]{3,8}$/i.test(value) ? \`#\${value}\` : value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r, g, b].map(v => Math.pow(v / 255, 2.2));\r
      }\r
      colorCache.set(value, rgb);\r
      return rgb;\r
    };\r
\r
    const writePalette = (palette: number[][], x: number, offset: number) => {\r
      const n = palette.length;\r
      const f = ((x % n) + n) % n;\r
      const i = Math.floor(f);\r
      let m = f - i;\r
      m = m * m * (3 - 2 * m);\r
      const a = palette[i];\r
      const b = palette[(i + 1) % n];\r
      for (let c = 0; c < 3; c++) instances[offset + c] = a[c] + (b[c] - a[c]) * m;\r
    };\r
\r
    const ensureTarget = () => {\r
      if (state.targetWidth === canvas.width && state.targetHeight === canvas.height) return;\r
      state.targetWidth = canvas.width;\r
      state.targetHeight = canvas.height;\r
      gl.bindTexture(gl.TEXTURE_2D, lightTexture);\r
      if (floatTarget) {\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, canvas.width, canvas.height, 0, gl.RGBA, gl.HALF_FLOAT, null);\r
      } else {\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
      }\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, lightTexture, 0);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
    };\r
\r
    const layout = (s: Settings): View => {\r
      const { width: w, height: h } = state;\r
      const F = h * FOCAL;\r
      const centerScale = F / DISTANCE;\r
      const pitch = s.spacing / centerScale;\r
      const halfBar = pitch * s.barWidth * 0.5;\r
      const yaw = s.perspective * 0.66;\r
      const cosYaw = Math.cos(yaw);\r
      const sinYaw = Math.sin(yaw);\r
      const bend = s.curve * 0.6;\r
      const angle = (s.rotation * Math.PI) / 180;\r
      const span = Math.abs(Math.cos(angle)) * w * 0.5 + Math.abs(Math.sin(angle)) * h * 0.5;\r
      const reach = Math.ceil(((Math.max(w, h) / F) * DISTANCE * 2.4) / pitch);\r
      const bars: Bar[] = [];\r
      for (let i = -reach; i <= reach; i++) {\r
        const x = i * pitch;\r
        const local = bend * Math.sin(x * 0.9 + 0.8);\r
        const X = x * cosYaw - local * sinYaw;\r
        const Z = x * sinYaw + local * cosYaw + DISTANCE;\r
        if (Z < 0.45) continue;\r
        const scale = F / Z;\r
        const sx = w * 0.5 + X * scale;\r
        if (Math.abs(sx - w * 0.5) > span + halfBar * scale + 80) continue;\r
        bars.push({ i, x, Z, sx, scale });\r
      }\r
      return { bars, halfBar, centerScale };\r
    };\r
\r
    const build = (s: Settings, view: View) => {\r
      const { width: w, height: h } = state;\r
      const { bars, halfBar, centerScale } = view;\r
      const palette = [s.color1, s.color2, s.color3].map(toLinear);\r
      const t = state.time;\r
      const thickness = (s.ribbonHeight * h * 0.5) / centerScale;\r
      const separation = (s.spread * h) / centerScale;\r
      const amplitude = (s.amplitude * h) / centerScale;\r
      const frequency = 0.22 * s.frequency;\r
      const base = h * s.position;\r
      const focus = state.focus;\r
      const blurScale = s.blur * 16;\r
      const sweep = 1.6 + 0.04 * (s.ribbons - 1);\r
      const needed = bars.length * s.ribbons * 12;\r
      if (needed > instances.length) instances = new Float32Array(needed + 1200);\r
      let count = 0;\r
      for (const b of bars) {\r
        const hw = halfBar * b.scale;\r
        const across = b.sx / Math.max(w, 1);\r
        const lift = state.lift * Math.exp(-Math.pow((b.sx - state.liftX) / Math.max(w * 0.12, 60), 2));\r
        const blurPx = (0.5 + s.blur * 0.6 + blurScale * Math.abs(focus / b.Z - 1)) * (s.lightMode ? 0.55 : 1);\r
        for (let r = 0; r < s.ribbons; r++) {\r
          const offset = (r - (s.ribbons - 1) / 2) * separation;\r
          const wave =\r
            0.62 * Math.sin(TAU * frequency * b.x - t * 1.6 + r * 2.1) +\r
            0.38 * Math.sin(TAU * frequency * 1.9 * b.x + t * 2.25 + r * 1.3);\r
          const yc = offset + wave * amplitude;\r
          const swell = 0.5 + 0.5 * Math.sin(TAU * frequency * 0.7 * b.x + t * 1.1 + r * 2.7);\r
          const grow = clamp((state.intro * sweep - across - r * 0.04) / 0.6, 0, 1);\r
          const eased = grow * grow * (3 - 2 * grow);\r
          const th = thickness * (0.6 + 0.4 * swell) * eased;\r
          const hh = th * b.scale;\r
          if (hh < 0.4) continue;\r
          const tone = r * 1.15 + b.x * 0.3 + t * 0.12;\r
          const o = count * 12;\r
          instances[o] = b.sx;\r
          instances[o + 1] = base - yc * b.scale;\r
          instances[o + 2] = hw;\r
          instances[o + 3] = hh;\r
          writePalette(palette, tone - 0.22, o + 4);\r
          instances[o + 7] = blurPx;\r
          writePalette(palette, tone + 0.22, o + 8);\r
          instances[o + 11] =\r
            (0.75 + 0.25 * noise(b.i * 0.9 + r * 7.7 - t * 1.2)) * (1 + lift * 0.6) * (0.4 + 0.6 * eased);\r
          count++;\r
        }\r
      }\r
      return { count, halfBar, base };\r
    };\r
\r
    const render = (s: Settings, view: View = layout(s)) => {\r
      ensureTarget();\r
      const { count, halfBar, base } = build(s, view);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      if (count > 0) {\r
        gl.enable(gl.BLEND);\r
        gl.blendFunc(gl.ONE, gl.ONE);\r
        gl.useProgram(barProgram);\r
        gl.uniform2f(bar.uView, state.width, state.height);\r
        gl.uniform1f(bar.uAngle, (s.rotation * Math.PI) / 180);\r
        gl.uniform1f(bar.uGlow, s.lightMode ? s.glow * 0.4 : s.glow);\r
        gl.uniform1f(bar.uSlices, s.slices);\r
        gl.uniform1f(bar.uBase, base);\r
        gl.uniform1f(bar.uHalfBar, halfBar);\r
        gl.uniform1f(bar.uScale, lightScale);\r
        gl.bindVertexArray(barVao);\r
        gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);\r
        gl.bufferData(gl.ARRAY_BUFFER, instances.subarray(0, count * 12), gl.DYNAMIC_DRAW);\r
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, count);\r
        gl.disable(gl.BLEND);\r
      }\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.useProgram(compositeProgram);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, lightTexture);\r
      gl.uniform1i(composite.uLight, 0);\r
      gl.uniform2f(composite.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(composite.uScale, lightScale);\r
      gl.uniform1f(composite.uExposure, 1.6 * s.brightness);\r
      gl.uniform1f(composite.uGrain, s.grain);\r
      gl.uniform1f(composite.uTime, state.time % 1000);\r
      gl.uniform1f(composite.uFade, s.fade);\r
      gl.uniform1f(composite.uOpacity, s.opacity);\r
      gl.uniform1f(composite.uLightMode, s.lightMode ? 1 : 0);\r
      gl.bindVertexArray(quadVao);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const focusTarget = (view: View, x: number) => {\r
      let best: Bar | null = null;\r
      for (const b of view.bars) {\r
        if (!best || Math.abs(b.sx - x) < Math.abs(best.sx - x)) best = b;\r
      }\r
      return best ? best.Z : DISTANCE;\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!alive || !visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const moving = !s.paused && !reduce;\r
      if (moving) state.time += dt * s.speed;\r
      if (!s.intro || reduce) state.intro = 1;\r
      else if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / INTRO_SECONDS);\r
\r
      const engaged = s.mouseInteraction && pointer.inside && !reduce;\r
      const angle = (s.rotation * Math.PI) / 180;\r
      const localX =\r
        Math.cos(angle) * (pointer.x - state.width * 0.5) +\r
        Math.sin(angle) * (pointer.y - state.height * 0.5) +\r
        state.width * 0.5;\r
      const view = layout(s);\r
      const target = engaged ? focusTarget(view, localX) : DISTANCE;\r
      state.focusVelocity += (36 * (target - state.focus) - 11 * state.focusVelocity) * dt;\r
      state.focus += state.focusVelocity * dt;\r
      state.lift += ((engaged ? 1 : 0) - state.lift) * (1 - Math.exp(-dt / (engaged ? 0.25 : 0.6)));\r
      state.liftX += (localX - state.liftX) * (1 - Math.exp(-dt / 0.12));\r
\r
      render(s, view);\r
      const settling =\r
        state.intro < 1 ||\r
        Math.abs(target - state.focus) > 0.001 ||\r
        Math.abs(state.focusVelocity) > 0.001 ||\r
        state.lift > 0.002 ||\r
        engaged;\r
      if (moving || settling) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!raf && alive && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const base = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      const longest = Math.max(width, height) * base;\r
      const ratio = longest > MAX_RENDER_DIM ? (base * MAX_RENDER_DIM) / longest : base;\r
      state.width = width;\r
      state.height = height;\r
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      if (!raf) render(s);\r
      wake();\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      pointer.x = event.clientX - rect.left;\r
      pointer.y = event.clientY - rect.top;\r
      pointer.inside = pointer.x >= 0 && pointer.y >= 0 && pointer.x <= rect.width && pointer.y <= rect.height;\r
      wake();\r
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
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
\r
    wakeRef.current = () => {\r
      if (!raf) render(settingsRef.current);\r
      wake();\r
    };\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteFramebuffer(framebuffer);\r
      gl.deleteTexture(lightTexture);\r
      gl.deleteBuffer(cornerBuffer);\r
      gl.deleteBuffer(instanceBuffer);\r
      gl.deleteBuffer(quadBuffer);\r
      gl.deleteVertexArray(barVao);\r
      gl.deleteVertexArray(quadVao);\r
      gl.deleteProgram(barProgram);\r
      gl.deleteProgram(compositeProgram);\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div ref={containerRef} className={\`sliced-waves-container\${className ? \` \${className}\` : ''}\`} {...rest}>\r
      <canvas ref={canvasRef} className="sliced-waves-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default SlicedWaves;\r
`,a=`'use client';\r
\r
import { useEffect, useRef, type HTMLAttributes } from 'react';\r
\r
export interface SlicedWavesProps extends HTMLAttributes<HTMLDivElement> {\r
  color1?: string;\r
  color2?: string;\r
  color3?: string;\r
  ribbons?: number;\r
  spacing?: number;\r
  barWidth?: number;\r
  ribbonHeight?: number;\r
  spread?: number;\r
  amplitude?: number;\r
  frequency?: number;\r
  speed?: number;\r
  perspective?: number;\r
  curve?: number;\r
  blur?: number;\r
  glow?: number;\r
  brightness?: number;\r
  position?: number;\r
  rotation?: number;\r
  slices?: number;\r
  grain?: number;\r
  mouseInteraction?: boolean;\r
  intro?: boolean;\r
  fade?: number;\r
  opacity?: number;\r
  lightMode?: boolean;\r
  paused?: boolean;\r
  dpr?: number;\r
}\r
\r
type Settings = {\r
  color1: string;\r
  color2: string;\r
  color3: string;\r
  ribbons: number;\r
  spacing: number;\r
  barWidth: number;\r
  ribbonHeight: number;\r
  spread: number;\r
  amplitude: number;\r
  frequency: number;\r
  speed: number;\r
  perspective: number;\r
  curve: number;\r
  blur: number;\r
  glow: number;\r
  brightness: number;\r
  position: number;\r
  rotation: number;\r
  slices: number;\r
  grain: number;\r
  mouseInteraction: boolean;\r
  intro: boolean;\r
  fade: number;\r
  opacity: number;\r
  lightMode: boolean;\r
  paused: boolean;\r
  dpr?: number;\r
};\r
\r
type Bar = { i: number; x: number; Z: number; sx: number; scale: number };\r
\r
type View = { bars: Bar[]; halfBar: number; centerScale: number };\r
\r
const BAR_VERTEX = \`#version 300 es\r
in vec2 aCorner;\r
in vec4 aShape;\r
in vec4 aTop;\r
in vec4 aBottom;\r
uniform vec2 uView;\r
uniform float uAngle;\r
out vec2 vLocal;\r
out vec4 vShape;\r
out vec4 vTop;\r
out vec4 vBottom;\r
void main() {\r
  float halo = aShape.z + 5.0;\r
  float reachX = aShape.z + max(aTop.w * 2.5, halo * 2.0);\r
  float reachY = aShape.w + max(aTop.w * 2.5, halo * 2.0);\r
  vec2 local = aCorner * vec2(reachX, reachY);\r
  vLocal = local;\r
  vShape = aShape;\r
  vTop = aTop;\r
  vBottom = aBottom;\r
  float c = cos(uAngle);\r
  float s = sin(uAngle);\r
  vec2 p = aShape.xy + local - uView * 0.5;\r
  p = vec2(c * p.x - s * p.y, s * p.x + c * p.y) + uView * 0.5;\r
  gl_Position = vec4(p.x / uView.x * 2.0 - 1.0, 1.0 - p.y / uView.y * 2.0, 0.0, 1.0);\r
}\`;\r
\r
const BAR_FRAGMENT = \`#version 300 es\r
precision highp float;\r
in vec2 vLocal;\r
in vec4 vShape;\r
in vec4 vTop;\r
in vec4 vBottom;\r
uniform float uGlow;\r
uniform float uSlices;\r
uniform float uBase;\r
uniform float uHalfBar;\r
uniform float uScale;\r
out vec4 outColor;\r
\r
float erfApprox(float x) {\r
  float a = x * x;\r
  float t = 1.0 - exp(-a * (1.2732395 + 0.147 * a) / (1.0 + 0.147 * a));\r
  return sign(x) * sqrt(max(t, 0.0));\r
}\r
\r
float box(float d, float h, float s) {\r
  float k = 0.70710678 / max(s, 0.3);\r
  return 0.5 * (erfApprox((h - d) * k) + erfApprox((h + d) * k));\r
}\r
\r
void main() {\r
  float blur = vTop.w;\r
  float body = box(vLocal.x, vShape.z, blur) * box(vLocal.y, vShape.w, blur * 1.15);\r
  float halo = vShape.z + 5.0;\r
  float glow = box(vLocal.x, vShape.z, halo) * box(vLocal.y, vShape.w, halo);\r
  float t = clamp(vLocal.y / max(vShape.w, 0.001) * 0.5 + 0.5, 0.0, 1.0);\r
  vec3 color = mix(vTop.rgb, vBottom.rgb, t);\r
  float v = clamp(vLocal.y / max(vShape.w, 0.001), -1.0, 1.0);\r
  float core = exp(-pow(vLocal.x / max(vShape.z + blur * 0.5, 0.5), 2.0) * 1.5);\r
  body *= (1.0 + 0.35 * core) * (1.0 - 0.35 * v * v * v * v);\r
  if (uSlices > 0.0) {\r
    float cell = vShape.z / max(uHalfBar, 0.00001) / uSlices;\r
    float y = (uBase - vShape.y - vLocal.y) / max(cell, 0.001);\r
    float f = 1.0 - abs(fract(y) - 0.5) * 2.0;\r
    float soft = clamp(blur / max(cell, 0.001) * 1.6, 0.04, 1.0);\r
    body *= smoothstep(0.28 - soft, 0.28 + soft, f);\r
  }\r
  vec3 tint = color * color / max(max(color.r, max(color.g, color.b)), 0.05);\r
  outColor = vec4((color * body + tint * uGlow * glow * 0.16) * vBottom.w * uScale, 1.0);\r
}\`;\r
\r
const QUAD_VERTEX = \`#version 300 es\r
in vec2 aCorner;\r
void main() {\r
  gl_Position = vec4(aCorner, 0.0, 1.0);\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uLight;\r
uniform vec2 uResolution;\r
uniform float uScale;\r
uniform float uExposure;\r
uniform float uGrain;\r
uniform float uTime;\r
uniform float uFade;\r
uniform float uOpacity;\r
uniform float uLightMode;\r
out vec4 outColor;\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
float smootherstep(float edge, float x) {\r
  float t = clamp(x / max(edge, 0.0001), 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  vec3 hdr = texelFetch(uLight, ivec2(gl_FragCoord.xy), 0).rgb / uScale * uExposure;\r
  vec2 uv = gl_FragCoord.xy / uResolution;\r
  float edge = uFade * 0.5;\r
  float mask = smootherstep(edge, uv.x) * smootherstep(edge, 1.0 - uv.x) * smootherstep(edge, uv.y) * smootherstep(edge, 1.0 - uv.y);\r
  mask *= uOpacity;\r
  float grain = (hash(gl_FragCoord.xy + fract(uTime * 7.31) * 113.0) - 0.5) * uGrain;\r
  float peak = max(hdr.r, max(hdr.g, hdr.b));\r
  if (uLightMode > 0.5) {\r
    vec3 hue = hdr / max(peak, 0.0001);\r
    float tone = dot(hue, vec3(0.2126, 0.7152, 0.0722));\r
    vec3 color = pow(clamp(hue * min(1.0, 0.66 / max(tone, 0.001)), 0.0, 1.0), vec3(1.0 / 2.2));\r
    float alpha = clamp((1.0 - exp(-peak * 1.1)) * 0.85 * (1.0 + grain), 0.0, 1.0) * mask;\r
    outColor = vec4(color * alpha, alpha);\r
  } else {\r
    vec3 mapped = 1.0 - exp(-hdr);\r
    mapped = mix(mapped, vec3(1.0), smoothstep(1.1, 3.2, peak) * 0.75);\r
    float level = max(mapped.r, max(mapped.g, mapped.b));\r
    mapped = clamp(mapped + grain * (0.25 + level), 0.0, 1.0) * mask;\r
    outColor = vec4(mapped, max(mapped.r, max(mapped.g, mapped.b)));\r
  }\r
}\`;\r
\r
const TAU = Math.PI * 2;\r
const MAX_RIBBONS = 6;\r
const FOCAL = 1.1;\r
const DISTANCE = 2.6;\r
const INTRO_SECONDS = 1.5;\r
const MAX_RENDER_DIM = 2560;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const hash = (n: number) => {\r
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;\r
  return v - Math.floor(v);\r
};\r
\r
const noise = (x: number) => {\r
  const i = Math.floor(x);\r
  const f = x - i;\r
  const u = f * f * (3 - 2 * f);\r
  return hash(i) * (1 - u) + hash(i + 1) * u;\r
};\r
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
const link = (gl: WebGL2RenderingContext, vertexSource: string, fragmentSource: string, attributes: string[]) => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);\r
  const program = gl.createProgram();\r
  if (!vertex || !fragment || !program) return null;\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
  attributes.forEach((name, index) => gl.bindAttribLocation(program, index, name));\r
  gl.linkProgram(program);\r
  gl.deleteShader(vertex);\r
  gl.deleteShader(fragment);\r
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;\r
  gl.deleteProgram(program);\r
  return null;\r
};\r
\r
const locate = (gl: WebGL2RenderingContext, program: WebGLProgram, names: string[]) => {\r
  const result: Record<string, WebGLUniformLocation | null> = {};\r
  for (const name of names) result[name] = gl.getUniformLocation(program, name);\r
  return result;\r
};\r
\r
const SlicedWaves = ({\r
  color1 = '#ffd9a8',\r
  color2 = '#ff5fa2',\r
  color3 = '#5b8cff',\r
  ribbons = 3,\r
  spacing = 28,\r
  barWidth = 0.5,\r
  ribbonHeight = 0.26,\r
  spread = 0.1,\r
  amplitude = 0.1,\r
  frequency = 1,\r
  speed = 1,\r
  perspective = 0.45,\r
  curve = 0.5,\r
  blur = 0.6,\r
  glow = 1,\r
  brightness = 1.25,\r
  position = 0.78,\r
  rotation = 0,\r
  slices = 0,\r
  grain = 0.08,\r
  mouseInteraction = true,\r
  intro = true,\r
  fade = 0,\r
  opacity = 1,\r
  lightMode = false,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  ...rest\r
}: SlicedWavesProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings: Settings = {\r
    color1: String(color1),\r
    color2: String(color2),\r
    color3: String(color3),\r
    ribbons: Math.round(clamp(ribbons, 1, MAX_RIBBONS)),\r
    spacing: clamp(spacing, 4, 200),\r
    barWidth: clamp(barWidth, 0.05, 1),\r
    ribbonHeight: Math.max(0, ribbonHeight),\r
    spread: Math.max(0, spread),\r
    amplitude: Math.max(0, amplitude),\r
    frequency: Math.max(0, frequency),\r
    speed,\r
    perspective: clamp(perspective, 0, 1),\r
    curve: clamp(curve, 0, 1),\r
    blur: clamp(blur, 0, 2),\r
    glow: Math.max(0, glow),\r
    brightness: Math.max(0, brightness),\r
    position: clamp(position, 0, 1),\r
    rotation,\r
    slices: Math.max(0, Math.round(slices)),\r
    grain: Math.max(0, grain),\r
    mouseInteraction,\r
    intro,\r
    fade: clamp(fade, 0, 1),\r
    opacity: clamp(opacity, 0, 1),\r
    lightMode,\r
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
    const floatTarget = !!gl.getExtension('EXT_color_buffer_float');\r
    const lightScale = floatTarget ? 1 : 0.25;\r
    const barProgram = link(gl, BAR_VERTEX, BAR_FRAGMENT, ['aCorner', 'aShape', 'aTop', 'aBottom']);\r
    const compositeProgram = link(gl, QUAD_VERTEX, COMPOSITE, ['aCorner']);\r
    if (!barProgram || !compositeProgram) return undefined;\r
    const bar = locate(gl, barProgram, ['uView', 'uAngle', 'uGlow', 'uSlices', 'uBase', 'uHalfBar', 'uScale']);\r
    const composite = locate(gl, compositeProgram, [\r
      'uLight',\r
      'uResolution',\r
      'uScale',\r
      'uExposure',\r
      'uGrain',\r
      'uTime',\r
      'uFade',\r
      'uOpacity',\r
      'uLightMode'\r
    ]);\r
\r
    const cornerBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
    const instanceBuffer = gl.createBuffer();\r
    const barVao = gl.createVertexArray();\r
    gl.bindVertexArray(barVao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);\r
    for (let attribute = 1; attribute <= 3; attribute++) {\r
      gl.enableVertexAttribArray(attribute);\r
      gl.vertexAttribPointer(attribute, 4, gl.FLOAT, false, 48, (attribute - 1) * 16);\r
      gl.vertexAttribDivisor(attribute, 1);\r
    }\r
    const quadBuffer = gl.createBuffer();\r
    const quadVao = gl.createVertexArray();\r
    gl.bindVertexArray(quadVao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    gl.bindVertexArray(null);\r
\r
    const lightTexture = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, lightTexture);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    const framebuffer = gl.createFramebuffer();\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const colorCache = new Map<string, number[]>();\r
    let instances = new Float32Array(0);\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const state = {\r
      width: 1,\r
      height: 1,\r
      targetWidth: 0,\r
      targetHeight: 0,\r
      time: 0,\r
      intro: settingsRef.current.intro && !reduce ? 0 : 1,\r
      focus: DISTANCE,\r
      focusVelocity: 0,\r
      lift: 0,\r
      liftX: 0\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let alive = true;\r
\r
    const toLinear = (value: string): number[] => {\r
      const cached = colorCache.get(value);\r
      if (cached) return cached;\r
      let rgb = [1, 1, 1];\r
      if (probe && value) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#000000';\r
        probe.fillStyle = /^[0-9a-f]{3,8}$/i.test(value) ? \`#\${value}\` : value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r, g, b].map(v => Math.pow(v / 255, 2.2));\r
      }\r
      colorCache.set(value, rgb);\r
      return rgb;\r
    };\r
\r
    const writePalette = (palette: number[][], x: number, offset: number) => {\r
      const n = palette.length;\r
      const f = ((x % n) + n) % n;\r
      const i = Math.floor(f);\r
      let m = f - i;\r
      m = m * m * (3 - 2 * m);\r
      const a = palette[i];\r
      const b = palette[(i + 1) % n];\r
      for (let c = 0; c < 3; c++) instances[offset + c] = a[c] + (b[c] - a[c]) * m;\r
    };\r
\r
    const ensureTarget = () => {\r
      if (state.targetWidth === canvas.width && state.targetHeight === canvas.height) return;\r
      state.targetWidth = canvas.width;\r
      state.targetHeight = canvas.height;\r
      gl.bindTexture(gl.TEXTURE_2D, lightTexture);\r
      if (floatTarget) {\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, canvas.width, canvas.height, 0, gl.RGBA, gl.HALF_FLOAT, null);\r
      } else {\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
      }\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, lightTexture, 0);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
    };\r
\r
    const layout = (s: Settings): View => {\r
      const { width: w, height: h } = state;\r
      const F = h * FOCAL;\r
      const centerScale = F / DISTANCE;\r
      const pitch = s.spacing / centerScale;\r
      const halfBar = pitch * s.barWidth * 0.5;\r
      const yaw = s.perspective * 0.66;\r
      const cosYaw = Math.cos(yaw);\r
      const sinYaw = Math.sin(yaw);\r
      const bend = s.curve * 0.6;\r
      const angle = (s.rotation * Math.PI) / 180;\r
      const span = Math.abs(Math.cos(angle)) * w * 0.5 + Math.abs(Math.sin(angle)) * h * 0.5;\r
      const reach = Math.ceil(((Math.max(w, h) / F) * DISTANCE * 2.4) / pitch);\r
      const bars: Bar[] = [];\r
      for (let i = -reach; i <= reach; i++) {\r
        const x = i * pitch;\r
        const local = bend * Math.sin(x * 0.9 + 0.8);\r
        const X = x * cosYaw - local * sinYaw;\r
        const Z = x * sinYaw + local * cosYaw + DISTANCE;\r
        if (Z < 0.45) continue;\r
        const scale = F / Z;\r
        const sx = w * 0.5 + X * scale;\r
        if (Math.abs(sx - w * 0.5) > span + halfBar * scale + 80) continue;\r
        bars.push({ i, x, Z, sx, scale });\r
      }\r
      return { bars, halfBar, centerScale };\r
    };\r
\r
    const build = (s: Settings, view: View) => {\r
      const { width: w, height: h } = state;\r
      const { bars, halfBar, centerScale } = view;\r
      const palette = [s.color1, s.color2, s.color3].map(toLinear);\r
      const t = state.time;\r
      const thickness = (s.ribbonHeight * h * 0.5) / centerScale;\r
      const separation = (s.spread * h) / centerScale;\r
      const amplitude = (s.amplitude * h) / centerScale;\r
      const frequency = 0.22 * s.frequency;\r
      const base = h * s.position;\r
      const focus = state.focus;\r
      const blurScale = s.blur * 16;\r
      const sweep = 1.6 + 0.04 * (s.ribbons - 1);\r
      const needed = bars.length * s.ribbons * 12;\r
      if (needed > instances.length) instances = new Float32Array(needed + 1200);\r
      let count = 0;\r
      for (const b of bars) {\r
        const hw = halfBar * b.scale;\r
        const across = b.sx / Math.max(w, 1);\r
        const lift = state.lift * Math.exp(-Math.pow((b.sx - state.liftX) / Math.max(w * 0.12, 60), 2));\r
        const blurPx = (0.5 + s.blur * 0.6 + blurScale * Math.abs(focus / b.Z - 1)) * (s.lightMode ? 0.55 : 1);\r
        for (let r = 0; r < s.ribbons; r++) {\r
          const offset = (r - (s.ribbons - 1) / 2) * separation;\r
          const wave =\r
            0.62 * Math.sin(TAU * frequency * b.x - t * 1.6 + r * 2.1) +\r
            0.38 * Math.sin(TAU * frequency * 1.9 * b.x + t * 2.25 + r * 1.3);\r
          const yc = offset + wave * amplitude;\r
          const swell = 0.5 + 0.5 * Math.sin(TAU * frequency * 0.7 * b.x + t * 1.1 + r * 2.7);\r
          const grow = clamp((state.intro * sweep - across - r * 0.04) / 0.6, 0, 1);\r
          const eased = grow * grow * (3 - 2 * grow);\r
          const th = thickness * (0.6 + 0.4 * swell) * eased;\r
          const hh = th * b.scale;\r
          if (hh < 0.4) continue;\r
          const tone = r * 1.15 + b.x * 0.3 + t * 0.12;\r
          const o = count * 12;\r
          instances[o] = b.sx;\r
          instances[o + 1] = base - yc * b.scale;\r
          instances[o + 2] = hw;\r
          instances[o + 3] = hh;\r
          writePalette(palette, tone - 0.22, o + 4);\r
          instances[o + 7] = blurPx;\r
          writePalette(palette, tone + 0.22, o + 8);\r
          instances[o + 11] =\r
            (0.75 + 0.25 * noise(b.i * 0.9 + r * 7.7 - t * 1.2)) * (1 + lift * 0.6) * (0.4 + 0.6 * eased);\r
          count++;\r
        }\r
      }\r
      return { count, halfBar, base };\r
    };\r
\r
    const render = (s: Settings, view: View = layout(s)) => {\r
      ensureTarget();\r
      const { count, halfBar, base } = build(s, view);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      if (count > 0) {\r
        gl.enable(gl.BLEND);\r
        gl.blendFunc(gl.ONE, gl.ONE);\r
        gl.useProgram(barProgram);\r
        gl.uniform2f(bar.uView, state.width, state.height);\r
        gl.uniform1f(bar.uAngle, (s.rotation * Math.PI) / 180);\r
        gl.uniform1f(bar.uGlow, s.lightMode ? s.glow * 0.4 : s.glow);\r
        gl.uniform1f(bar.uSlices, s.slices);\r
        gl.uniform1f(bar.uBase, base);\r
        gl.uniform1f(bar.uHalfBar, halfBar);\r
        gl.uniform1f(bar.uScale, lightScale);\r
        gl.bindVertexArray(barVao);\r
        gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);\r
        gl.bufferData(gl.ARRAY_BUFFER, instances.subarray(0, count * 12), gl.DYNAMIC_DRAW);\r
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, count);\r
        gl.disable(gl.BLEND);\r
      }\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.useProgram(compositeProgram);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, lightTexture);\r
      gl.uniform1i(composite.uLight, 0);\r
      gl.uniform2f(composite.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(composite.uScale, lightScale);\r
      gl.uniform1f(composite.uExposure, 1.6 * s.brightness);\r
      gl.uniform1f(composite.uGrain, s.grain);\r
      gl.uniform1f(composite.uTime, state.time % 1000);\r
      gl.uniform1f(composite.uFade, s.fade);\r
      gl.uniform1f(composite.uOpacity, s.opacity);\r
      gl.uniform1f(composite.uLightMode, s.lightMode ? 1 : 0);\r
      gl.bindVertexArray(quadVao);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const focusTarget = (view: View, x: number) => {\r
      let best: Bar | null = null;\r
      for (const b of view.bars) {\r
        if (!best || Math.abs(b.sx - x) < Math.abs(best.sx - x)) best = b;\r
      }\r
      return best ? best.Z : DISTANCE;\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!alive || !visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const moving = !s.paused && !reduce;\r
      if (moving) state.time += dt * s.speed;\r
      if (!s.intro || reduce) state.intro = 1;\r
      else if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / INTRO_SECONDS);\r
\r
      const engaged = s.mouseInteraction && pointer.inside && !reduce;\r
      const angle = (s.rotation * Math.PI) / 180;\r
      const localX =\r
        Math.cos(angle) * (pointer.x - state.width * 0.5) +\r
        Math.sin(angle) * (pointer.y - state.height * 0.5) +\r
        state.width * 0.5;\r
      const view = layout(s);\r
      const target = engaged ? focusTarget(view, localX) : DISTANCE;\r
      state.focusVelocity += (36 * (target - state.focus) - 11 * state.focusVelocity) * dt;\r
      state.focus += state.focusVelocity * dt;\r
      state.lift += ((engaged ? 1 : 0) - state.lift) * (1 - Math.exp(-dt / (engaged ? 0.25 : 0.6)));\r
      state.liftX += (localX - state.liftX) * (1 - Math.exp(-dt / 0.12));\r
\r
      render(s, view);\r
      const settling =\r
        state.intro < 1 ||\r
        Math.abs(target - state.focus) > 0.001 ||\r
        Math.abs(state.focusVelocity) > 0.001 ||\r
        state.lift > 0.002 ||\r
        engaged;\r
      if (moving || settling) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!raf && alive && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const base = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      const longest = Math.max(width, height) * base;\r
      const ratio = longest > MAX_RENDER_DIM ? (base * MAX_RENDER_DIM) / longest : base;\r
      state.width = width;\r
      state.height = height;\r
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      if (!raf) render(s);\r
      wake();\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      pointer.x = event.clientX - rect.left;\r
      pointer.y = event.clientY - rect.top;\r
      pointer.inside = pointer.x >= 0 && pointer.y >= 0 && pointer.x <= rect.width && pointer.y <= rect.height;\r
      wake();\r
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
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
\r
    wakeRef.current = () => {\r
      if (!raf) render(settingsRef.current);\r
      wake();\r
    };\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteFramebuffer(framebuffer);\r
      gl.deleteTexture(lightTexture);\r
      gl.deleteBuffer(cornerBuffer);\r
      gl.deleteBuffer(instanceBuffer);\r
      gl.deleteBuffer(quadBuffer);\r
      gl.deleteVertexArray(barVao);\r
      gl.deleteVertexArray(quadVao);\r
      gl.deleteProgram(barProgram);\r
      gl.deleteProgram(compositeProgram);\r
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
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default SlicedWaves;\r
`,o={usage:`import SlicedWaves from './SlicedWaves';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <SlicedWaves
    color1="#ffd9a8"
    color2="#ff5fa2"
    color3="#5b8cff"
    ribbons={3}
    spacing={28}
    perspective={0.45}
    blur={0.6}
    glow={1}
    position={0.78}
    mouseInteraction={true}
  />
</div>`,code:r,css:n,tailwind:e,tsCode:t,tsTailwind:a};export{o as slicedWaves};
