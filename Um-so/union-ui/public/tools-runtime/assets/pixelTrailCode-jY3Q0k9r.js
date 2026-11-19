const r=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
import './PixelTrail.css';\r
\r
const TRAIL_SIZE = 512;\r
const AGE_SIZE = 256;\r
const SHAPES = { square: 0, circle: 1, diamond: 2 };\r
const DECAYS = { fade: 0, shrink: 1, dither: 2 };\r
\r
const identityEase = x => x;\r
\r
const VERTEX = \`#version 300 es\r
in vec2 a_position;\r
void main() {\r
  gl_Position = vec4(a_position, 0.0, 1.0);\r
}\r
\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform sampler2D u_trail;\r
uniform sampler2D u_image;\r
uniform sampler2D u_age;\r
uniform vec2 u_resolution;\r
uniform float u_gridSize;\r
uniform float u_sigma;\r
uniform vec3 u_color;\r
uniform vec3 u_trailColor;\r
uniform float u_ramp;\r
uniform float u_shine;\r
uniform float u_glow;\r
uniform int u_shape;\r
uniform int u_decay;\r
uniform float u_gap;\r
uniform float u_sparkle;\r
uniform float u_time;\r
uniform float u_hasImage;\r
out vec4 outColor;\r
\r
const float BAYER[16] = float[16](0.0, 8.0, 2.0, 10.0, 12.0, 4.0, 14.0, 6.0, 3.0, 11.0, 1.0, 9.0, 15.0, 7.0, 13.0, 5.0);\r
const vec3 LIGHT = vec3(-0.42, 0.58, 0.7);\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
float erfApprox(float x) {\r
  float s = sign(x);\r
  x = abs(x);\r
  float t = 1.0 / (1.0 + 0.3275911 * x);\r
  float y = 1.0 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * exp(-x * x);\r
  return s * y;\r
}\r
\r
float cellValue(ivec2 c) {\r
  vec2 center = (vec2(c) + 0.5) / u_gridSize;\r
  if (center.x < 0.0 || center.y < 0.0 || center.x > 1.0 || center.y > 1.0) return 0.0;\r
  float t = texelFetch(u_trail, clamp(ivec2(center * 512.0), ivec2(0), ivec2(511)), 0).r;\r
  if (t <= 0.0) return 0.0;\r
  if (u_sparkle > 0.0) {\r
    float n = hash(vec2(c) + floor(u_time * 14.0) * 7.31);\r
    float dim = 1.0 - t;\r
    if (n < u_sparkle * dim * 0.35) t = max(t, 0.85);\r
    else if (n > 1.0 - u_sparkle * dim * 0.5) t = 0.0;\r
  }\r
  if (u_decay == 2 && t * 2.2 <= (BAYER[(c.y & 3) * 4 + (c.x & 3)] + 0.5) / 16.0) return 0.0;\r
  return t;\r
}\r
\r
vec3 baseColor(ivec2 owner, vec2 uv) {\r
  if (u_hasImage > 0.5) return texelFetch(u_image, clamp(owner, ivec2(0), ivec2(textureSize(u_image, 0)) - 1), 0).rgb;\r
  if (u_ramp > 0.5) return mix(u_trailColor, u_color, smoothstep(0.05, 0.95, texture(u_age, uv).r));\r
  return u_color;\r
}\r
\r
vec3 tone(vec3 base, float strength) {\r
  vec3 body = mix(base * 0.55, base, smoothstep(0.3, 0.75, strength));\r
  return mix(body, mix(base, vec3(1.0), 0.22), smoothstep(0.85, 1.0, strength) * u_shine);\r
}\r
\r
float seams(vec2 q, float cs) {\r
  if (u_gap <= 0.0) return 0.0;\r
  vec2 f = fract(q / cs);\r
  float border = min(min(f.x, 1.0 - f.x), min(f.y, 1.0 - f.y)) * cs;\r
  float width = max(1.0, u_gap * cs * 0.5);\r
  return 1.0 - smoothstep(width - 0.75, width + 0.75, border);\r
}\r
\r
vec3 shade(vec3 base, vec3 n) {\r
  vec3 l = normalize(LIGHT);\r
  vec3 h = normalize(l + vec3(0.0, 0.0, 1.0));\r
  float lit = dot(n, l) - l.z;\r
  vec3 color = base * (1.0 + lit * 0.9 * u_shine);\r
  float spec = pow(max(dot(n, h), 0.0), 64.0) * 0.85 + pow(max(dot(n, h), 0.0), 10.0) * 0.08;\r
  color += spec * u_shine * mix(vec3(1.0), base, 0.15) * step(0.001, 1.0 - n.z);\r
  return clamp(color, 0.0, 1.0);\r
}\r
\r
void main() {\r
  float maxRes = max(u_resolution.x, u_resolution.y);\r
  vec2 q = gl_FragCoord.xy - 0.5 * u_resolution + 0.5 * maxRes;\r
  vec2 uv = q / maxRes;\r
  float cs = maxRes / u_gridSize;\r
  ivec2 base = ivec2(floor(q / cs));\r
\r
  float alpha = 0.0;\r
  vec3 color = vec3(0.0);\r
\r
  if (u_sigma > 0.0) {\r
    float inv = 0.70710678 / u_sigma;\r
    float norm = 0.39894228 / u_sigma;\r
    float spread = 0.5 / (u_sigma * u_sigma);\r
    int reach = int(clamp(ceil(3.0 * u_sigma / cs), 1.0, 3.0));\r
    float field = 0.0;\r
    vec2 grad = vec2(0.0);\r
    float best = -1.0;\r
    ivec2 owner = base;\r
    float wx[7];\r
    float gx[7];\r
    float wy[7];\r
    float gy[7];\r
    for (int i = 0; i < 7; i++) {\r
      int offset = i - 3;\r
      if (abs(offset) > reach) continue;\r
      vec2 lo = vec2(base + ivec2(offset)) * cs - q;\r
      vec2 hi = lo + cs;\r
      wx[i] = 0.5 * (erfApprox(hi.x * inv) - erfApprox(lo.x * inv));\r
      wy[i] = 0.5 * (erfApprox(hi.y * inv) - erfApprox(lo.y * inv));\r
      gx[i] = norm * (exp(-lo.x * lo.x * spread) - exp(-hi.x * hi.x * spread));\r
      gy[i] = norm * (exp(-lo.y * lo.y * spread) - exp(-hi.y * hi.y * spread));\r
    }\r
    for (int j = 0; j < 7; j++) {\r
      if (abs(j - 3) > reach) continue;\r
      for (int i = 0; i < 7; i++) {\r
        if (abs(i - 3) > reach) continue;\r
        ivec2 c = base + ivec2(i - 3, j - 3);\r
        float t = cellValue(c);\r
        if (t <= 0.0) continue;\r
        float weight = t * wx[i] * wy[j];\r
        field += weight;\r
        grad += t * vec2(gx[i] * wy[j], wx[i] * gy[j]);\r
        if (weight > best) {\r
          best = weight;\r
          owner = c;\r
        }\r
      }\r
    }\r
    float edge = max(0.0263, length(grad) * 0.6);\r
    alpha = smoothstep(0.5 - edge, 0.5 + edge, field);\r
    if (alpha > 0.0) {\r
      vec3 n = normalize(vec3(-grad * cs * 0.55, 1.0));\r
      float strength = max(cellValue(base), field);\r
      vec3 body = tone(baseColor(owner, uv), strength);\r
      body *= 1.0 - seams(q, cs) * 0.32;\r
      color = shade(body, n);\r
    }\r
  } else {\r
    float t = cellValue(base);\r
    if (t > 0.0) {\r
      float halfSize = 0.5 * (1.0 - u_gap);\r
      float fade = t;\r
      if (u_decay == 1) {\r
        halfSize *= sqrt(clamp(t * 2.5, 0.0, 1.0));\r
        fade = 1.0;\r
      } else if (u_decay == 2) {\r
        fade = 1.0;\r
      }\r
      vec2 local = fract(q / cs) - 0.5;\r
      float d;\r
      vec2 dir;\r
      if (u_shape == 1) {\r
        d = length(local) - halfSize;\r
        dir = normalize(local + 1e-5);\r
      } else if (u_shape == 2) {\r
        d = (abs(local.x) + abs(local.y) - halfSize * 1.2) * 0.7071;\r
        dir = sign(local) * 0.7071;\r
      } else {\r
        vec2 a = abs(local) - halfSize;\r
        d = max(a.x, a.y);\r
        dir = a.x > a.y ? vec2(sign(local.x), 0.0) : vec2(0.0, sign(local.y));\r
      }\r
      float px = 1.0 / cs;\r
      float coverage = clamp(0.5 - d / px, 0.0, 1.0);\r
      alpha = coverage * fade;\r
      if (alpha > 0.0) {\r
        float bevel = smoothstep(-0.16 * (1.0 - u_gap), 0.0, d);\r
        vec3 n = normalize(vec3(dir * bevel * 0.9, 1.0));\r
        color = shade(tone(baseColor(base, uv), t), n);\r
      }\r
    }\r
  }\r
\r
  vec4 pixel = vec4(color * alpha, alpha);\r
  if (u_glow > 0.0) {\r
    float glow = texture(u_trail, uv).r;\r
    float amount = smoothstep(0.0, 0.7, glow) * u_glow * 0.55 * (1.0 - alpha);\r
    vec3 tint = u_hasImage > 0.5 ? texture(u_image, uv).rgb : (u_ramp > 0.5 ? mix(u_trailColor, u_color, 0.5) : u_color);\r
    pixel += vec4(tint * amount, amount);\r
  }\r
  if (pixel.a <= 0.002) discard;\r
  outColor = pixel;\r
}\r
\`;\r
\r
const parseColor = (() => {\r
  let context = null;\r
  return (value, fallback) => {\r
    if (typeof document === 'undefined') return fallback;\r
    if (!context) {\r
      const canvas = document.createElement('canvas');\r
      canvas.width = 1;\r
      canvas.height = 1;\r
      context = canvas.getContext('2d', { willReadFrequently: true });\r
    }\r
    if (!context) return fallback;\r
    context.clearRect(0, 0, 1, 1);\r
    context.fillStyle = '#000';\r
    context.fillStyle = value;\r
    context.fillRect(0, 0, 1, 1);\r
    const [r, g, b] = context.getImageData(0, 0, 1, 1).data;\r
    return [r / 255, g / 255, b / 255];\r
  };\r
})();\r
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
export default function PixelTrail({\r
  gridSize = 40,\r
  trailSize = 0.1,\r
  maxAge = 250,\r
  interpolate = 5,\r
  easingFunction = identityEase,\r
  gooeyFilter = { strength: 2 },\r
  color = '#ffffff',\r
  trailColor,\r
  shape = 'square',\r
  gap = 0.08,\r
  decay = 'fade',\r
  flow = 0,\r
  gravity = 0,\r
  sparkle = 0,\r
  clickBurst = false,\r
  shine = 0.6,\r
  glow = 0.4,\r
  imageSrc,\r
  dpr,\r
  className = '',\r
  style\r
}) {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const engineRef = useRef(null);\r
  const settingsRef = useRef(null);\r
\r
  settingsRef.current = {\r
    gridSize: Math.max(1, gridSize),\r
    trailSize: Math.max(0, trailSize),\r
    maxAge: Math.max(1, maxAge),\r
    interpolate,\r
    ease: easingFunction || identityEase,\r
    goo: gooeyFilter ? Math.max(0, gooeyFilter.strength ?? 2) : 0,\r
    color: parseColor(color, [1, 1, 1]),\r
    trailColor: trailColor ? parseColor(trailColor, [1, 1, 1]) : null,\r
    shape: SHAPES[shape] ?? 0,\r
    gap: Math.min(Math.max(gap, 0), 0.9),\r
    decay: DECAYS[decay] ?? 0,\r
    flow: Math.min(Math.max(flow, 0), 1),\r
    gravity: Math.min(Math.max(gravity, -1), 1),\r
    sparkle: Math.min(Math.max(sparkle, 0), 1),\r
    clickBurst,\r
    shine: Math.min(Math.max(shine, 0), 1),\r
    glow: Math.min(Math.max(glow, 0), 1),\r
    dpr\r
  };\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    if (!container || !canvas) return undefined;\r
    const gl = canvas.getContext('webgl2', {\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      powerPreference: 'high-performance'\r
    });\r
    if (!gl) return undefined;\r
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
    const program = gl.createProgram();\r
    if (!vertex || !fragment || !program) return undefined;\r
    gl.attachShader(program, vertex);\r
    gl.attachShader(program, fragment);\r
    gl.linkProgram(program);\r
    gl.deleteShader(vertex);\r
    gl.deleteShader(fragment);\r
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return undefined;\r
    gl.useProgram(program);\r
\r
    const uniforms = {};\r
    const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
    for (let i = 0; i < uniformCount; i++) {\r
      const info = gl.getActiveUniform(program, i);\r
      if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
    }\r
\r
    const vao = gl.createVertexArray();\r
    const buffer = gl.createBuffer();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const makeTexture = unit => {\r
      const texture = gl.createTexture();\r
      gl.activeTexture(gl.TEXTURE0 + unit);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));\r
      return texture;\r
    };\r
    const trailTexture = makeTexture(0);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
    const imageTexture = makeTexture(1);\r
    const ageTexture = makeTexture(2);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
    gl.uniform1i(uniforms.u_trail, 0);\r
    gl.uniform1i(uniforms.u_image, 1);\r
    gl.uniform1i(uniforms.u_age, 2);\r
\r
    const trailCanvas = document.createElement('canvas');\r
    trailCanvas.width = TRAIL_SIZE;\r
    trailCanvas.height = TRAIL_SIZE;\r
    const ctx = trailCanvas.getContext('2d');\r
    if (!ctx) return undefined;\r
    ctx.fillStyle = 'black';\r
    ctx.fillRect(0, 0, TRAIL_SIZE, TRAIL_SIZE);\r
\r
    const ageCanvas = document.createElement('canvas');\r
    ageCanvas.width = AGE_SIZE;\r
    ageCanvas.height = AGE_SIZE;\r
    const ageCtx = ageCanvas.getContext('2d');\r
    if (!ageCtx) return undefined;\r
\r
    const state = {\r
      alive: true,\r
      raf: 0,\r
      last: 0,\r
      time: 0,\r
      visible: true,\r
      width: 1,\r
      height: 1,\r
      ratio: 1,\r
      points: [],\r
      force: 0,\r
      image: null,\r
      imageReady: false,\r
      imageCells: 0,\r
      imageWidth: 0,\r
      imageHeight: 0,\r
      pointer: { x: 0, y: 0, at: 0, vx: 0, vy: 0, inside: false }\r
    };\r
\r
    const addTouch = (x, y, vx, vy) => {\r
      const s = settingsRef.current;\r
      const { points } = state;\r
      const last = points[points.length - 1];\r
      if (last) {\r
        const dx = last.x - x;\r
        const dy = last.y - y;\r
        const dd = dx * dx + dy * dy;\r
        const force = Math.max(0.3, Math.min(dd * 10000, 1));\r
        state.force = force;\r
        if (s.interpolate) {\r
          const lines = Math.ceil(dd / Math.pow((s.trailSize * 0.5) / s.interpolate, 2));\r
          if (lines > 1) {\r
            for (let i = 1; i < lines; i++) {\r
              points.push({ x: last.x - (dx / lines) * i, y: last.y - (dy / lines) * i, age: 0, force, vx, vy });\r
            }\r
          }\r
        }\r
      }\r
      points.push({ x, y, age: 0, force: state.force, vx, vy });\r
    };\r
\r
    const drawTouch = point => {\r
      const s = settingsRef.current;\r
      const x = point.x * TRAIL_SIZE;\r
      const y = (1 - point.y) * TRAIL_SIZE;\r
      let intensity = 1;\r
      if (point.age < s.maxAge * 0.3) {\r
        intensity = s.ease(point.age / (s.maxAge * 0.3));\r
      } else {\r
        intensity = s.ease(1 - (point.age - s.maxAge * 0.3) / (s.maxAge * 0.7));\r
      }\r
      intensity *= point.force;\r
      ctx.globalCompositeOperation = 'screen';\r
      const radius = TRAIL_SIZE * s.trailSize * intensity;\r
      const gradient = ctx.createRadialGradient(x, y, Math.max(0, radius * 0.25), x, y, Math.max(0, radius));\r
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');\r
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.0)');\r
      ctx.beginPath();\r
      ctx.fillStyle = gradient;\r
      ctx.arc(x, y, Math.max(0, radius), 0, Math.PI * 2);\r
      ctx.fill();\r
      if (!s.trailColor || radius <= 0) return;\r
      const scale = AGE_SIZE / TRAIL_SIZE;\r
      const fresh = Math.round(255 * Math.min(Math.max(1 - point.age / s.maxAge, 0), 1));\r
      const glaze = ageCtx.createRadialGradient(x * scale, y * scale, 0, x * scale, y * scale, radius * scale);\r
      glaze.addColorStop(0, \`rgb(\${fresh}, \${fresh}, \${fresh})\`);\r
      glaze.addColorStop(0.75, \`rgb(\${fresh}, \${fresh}, \${fresh})\`);\r
      glaze.addColorStop(1, 'rgba(0, 0, 0, 0)');\r
      ageCtx.globalCompositeOperation = 'lighten';\r
      ageCtx.beginPath();\r
      ageCtx.fillStyle = glaze;\r
      ageCtx.arc(x * scale, y * scale, radius * scale, 0, Math.PI * 2);\r
      ageCtx.fill();\r
    };\r
\r
    const updateTrail = delta => {\r
      const s = settingsRef.current;\r
      ctx.globalCompositeOperation = 'source-over';\r
      ctx.fillStyle = 'black';\r
      ctx.fillRect(0, 0, TRAIL_SIZE, TRAIL_SIZE);\r
      if (s.trailColor) {\r
        ageCtx.globalCompositeOperation = 'source-over';\r
        ageCtx.fillStyle = 'black';\r
        ageCtx.fillRect(0, 0, AGE_SIZE, AGE_SIZE);\r
      }\r
      state.points.forEach((point, i) => {\r
        point.age += delta * 1000;\r
        if (point.age > s.maxAge) state.points.splice(i, 1);\r
      });\r
      if (!state.points.length) state.force = 0;\r
      if (s.flow > 0 || s.gravity !== 0) {\r
        const drag = Math.exp(-3 * delta);\r
        for (const point of state.points) {\r
          point.vx *= drag;\r
          point.vy = point.vy * drag - s.gravity * 1.6 * delta;\r
          point.x += point.vx * delta;\r
          point.y += point.vy * delta;\r
        }\r
      }\r
      state.points.forEach(drawTouch);\r
    };\r
\r
    const burst = (x, y) => {\r
      const count = 14;\r
      for (let k = 0; k < count; k++) {\r
        const angle = (k / count) * Math.PI * 2 + Math.random() * 0.3;\r
        const speed = 0.35 + Math.random() * 0.25;\r
        state.points.push({\r
          x,\r
          y,\r
          age: 0,\r
          force: 1,\r
          vx: Math.cos(angle) * speed,\r
          vy: Math.sin(angle) * speed\r
        });\r
      }\r
    };\r
\r
    const uploadImage = () => {\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.bindTexture(gl.TEXTURE_2D, imageTexture);\r
      const image = state.image;\r
      if (!image) {\r
        state.imageReady = false;\r
        return;\r
      }\r
      const s = settingsRef.current;\r
      const cells = Math.max(1, Math.round(s.gridSize));\r
      const sample = document.createElement('canvas');\r
      sample.width = cells;\r
      sample.height = cells;\r
      const sampleCtx = sample.getContext('2d');\r
      if (!sampleCtx) return;\r
      const side = Math.max(state.width, state.height);\r
      const scale = Math.max(state.width / image.naturalWidth, state.height / image.naturalHeight);\r
      const sourceSide = side / scale;\r
      sampleCtx.imageSmoothingQuality = 'high';\r
      sampleCtx.drawImage(\r
        image,\r
        (image.naturalWidth - sourceSide) / 2,\r
        (image.naturalHeight - sourceSide) / 2,\r
        sourceSide,\r
        sourceSide,\r
        0,\r
        0,\r
        cells,\r
        cells\r
      );\r
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sample);\r
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);\r
      state.imageReady = true;\r
      state.imageCells = cells;\r
      state.imageWidth = state.width;\r
      state.imageHeight = state.height;\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const ratio = s.dpr ?? Math.min(window.devicePixelRatio || 1, 2);\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      state.width = width;\r
      state.height = height;\r
      state.ratio = ratio;\r
      const pixelWidth = Math.max(1, Math.floor(width * ratio));\r
      const pixelHeight = Math.max(1, Math.floor(height * ratio));\r
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {\r
        canvas.width = pixelWidth;\r
        canvas.height = pixelHeight;\r
      }\r
      if (\r
        state.image &&\r
        (state.imageCells !== Math.max(1, Math.round(s.gridSize)) ||\r
          state.imageWidth !== width ||\r
          state.imageHeight !== height)\r
      ) {\r
        uploadImage();\r
      }\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, trailTexture);\r
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, trailCanvas);\r
      if (s.trailColor) {\r
        gl.activeTexture(gl.TEXTURE2);\r
        gl.bindTexture(gl.TEXTURE_2D, ageTexture);\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, ageCanvas);\r
      }\r
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);\r
      gl.uniform2f(uniforms.u_resolution, state.width * state.ratio, state.height * state.ratio);\r
      gl.uniform1f(uniforms.u_gridSize, s.gridSize);\r
      gl.uniform3fv(uniforms.u_color, s.color);\r
      gl.uniform3fv(uniforms.u_trailColor, s.trailColor ?? s.color);\r
      gl.uniform1f(uniforms.u_ramp, s.trailColor ? 1 : 0);\r
      gl.uniform1f(uniforms.u_sigma, s.goo * state.ratio);\r
      gl.uniform1f(uniforms.u_shine, s.shine);\r
      gl.uniform1f(uniforms.u_glow, s.glow);\r
      gl.uniform1i(uniforms.u_shape, s.shape);\r
      gl.uniform1i(uniforms.u_decay, s.decay);\r
      gl.uniform1f(uniforms.u_gap, s.gap);\r
      gl.uniform1f(uniforms.u_sparkle, s.sparkle);\r
      gl.uniform1f(uniforms.u_time, state.time);\r
      gl.uniform1f(uniforms.u_hasImage, state.imageReady ? 1 : 0);\r
      gl.bindVertexArray(vao);\r
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);\r
    };\r
\r
    const frame = now => {\r
      state.raf = 0;\r
      if (!state.alive) return;\r
      const delta = state.last ? (now - state.last) / 1000 : 1 / 60;\r
      state.last = now;\r
      state.time += delta;\r
      resize();\r
      updateTrail(delta);\r
      draw();\r
      if (state.points.length && state.visible) state.raf = requestAnimationFrame(frame);\r
      else state.last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!state.raf && state.alive && state.visible) state.raf = requestAnimationFrame(frame);\r
    };\r
\r
    const toUv = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      const side = Math.max(rect.width, rect.height);\r
      return {\r
        x: (x - rect.width / 2) / side + 0.5,\r
        y: (rect.height / 2 - y) / side + 0.5,\r
        inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height\r
      };\r
    };\r
\r
    const onMove = event => {\r
      const { x, y, inside } = toUv(event);\r
      const pointer = state.pointer;\r
      const now = performance.now();\r
      if (inside) {\r
        const s = settingsRef.current;\r
        const elapsed = Math.max(0.008, (now - pointer.at) / 1000);\r
        if (pointer.inside) {\r
          pointer.vx += ((x - pointer.x) / elapsed - pointer.vx) * 0.5;\r
          pointer.vy += ((y - pointer.y) / elapsed - pointer.vy) * 0.5;\r
        } else {\r
          pointer.vx = 0;\r
          pointer.vy = 0;\r
        }\r
        addTouch(x, y, pointer.vx * s.flow * 0.3, pointer.vy * s.flow * 0.3);\r
        wake();\r
      }\r
      pointer.x = x;\r
      pointer.y = y;\r
      pointer.at = now;\r
      pointer.inside = inside;\r
    };\r
\r
    const onDown = event => {\r
      const { x, y, inside } = toUv(event);\r
      if (!inside || !settingsRef.current.clickBurst) return;\r
      burst(x, y);\r
      wake();\r
    };\r
\r
    const onLeave = () => {\r
      state.pointer.inside = false;\r
    };\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      resize();\r
      draw();\r
    });\r
    resizeObserver.observe(container);\r
\r
    const visibility = new IntersectionObserver(entries => {\r
      state.visible = entries.some(entry => entry.isIntersecting);\r
      if (state.visible) wake();\r
    });\r
    visibility.observe(container);\r
\r
    const onLost = event => {\r
      event.preventDefault();\r
      state.alive = false;\r
      cancelAnimationFrame(state.raf);\r
    };\r
\r
    canvas.addEventListener('webglcontextlost', onLost);\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    window.addEventListener('pointerdown', onDown, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onLeave);\r
    window.addEventListener('blur', onLeave);\r
\r
    engineRef.current = {\r
      setImage: image => {\r
        state.image = image;\r
        uploadImage();\r
        draw();\r
      },\r
      redraw: () => {\r
        resize();\r
        draw();\r
      }\r
    };\r
\r
    resize();\r
    draw();\r
\r
    return () => {\r
      state.alive = false;\r
      cancelAnimationFrame(state.raf);\r
      resizeObserver.disconnect();\r
      visibility.disconnect();\r
      canvas.removeEventListener('webglcontextlost', onLost);\r
      window.removeEventListener('pointermove', onMove);\r
      window.removeEventListener('pointerdown', onDown);\r
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
      window.removeEventListener('blur', onLeave);\r
      engineRef.current = null;\r
      gl.deleteTexture(trailTexture);\r
      gl.deleteTexture(imageTexture);\r
      gl.deleteTexture(ageTexture);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(program);\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    if (!imageSrc) {\r
      engineRef.current?.setImage(null);\r
      return undefined;\r
    }\r
    let active = true;\r
    const image = new Image();\r
    image.crossOrigin = 'anonymous';\r
    image.decoding = 'async';\r
    image.onload = () => {\r
      if (active) engineRef.current?.setImage(image);\r
    };\r
    image.onerror = () => {\r
      if (active) engineRef.current?.setImage(null);\r
    };\r
    image.src = imageSrc;\r
    return () => {\r
      active = false;\r
    };\r
  }, [imageSrc]);\r
\r
  useEffect(() => {\r
    engineRef.current?.redraw();\r
  });\r
\r
  return (\r
    <div\r
      ref={containerRef}\r
      className={\`pixel-canvas \${className}\`.trim()}\r
      style={{\r
        position: 'relative',\r
        width: '100%',\r
        height: '100%',\r
        overflow: 'hidden',\r
        pointerEvents: 'none',\r
        ...style\r
      }}\r
    >\r
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />\r
    </div>\r
  );\r
}\r
`,n=`.pixel-canvas {\r
  position: absolute;\r
  z-index: 1;\r
}\r
`,e=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
const TRAIL_SIZE = 512;\r
const AGE_SIZE = 256;\r
const SHAPES = { square: 0, circle: 1, diamond: 2 };\r
const DECAYS = { fade: 0, shrink: 1, dither: 2 };\r
\r
const identityEase = x => x;\r
\r
const VERTEX = \`#version 300 es\r
in vec2 a_position;\r
void main() {\r
  gl_Position = vec4(a_position, 0.0, 1.0);\r
}\r
\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform sampler2D u_trail;\r
uniform sampler2D u_image;\r
uniform sampler2D u_age;\r
uniform vec2 u_resolution;\r
uniform float u_gridSize;\r
uniform float u_sigma;\r
uniform vec3 u_color;\r
uniform vec3 u_trailColor;\r
uniform float u_ramp;\r
uniform float u_shine;\r
uniform float u_glow;\r
uniform int u_shape;\r
uniform int u_decay;\r
uniform float u_gap;\r
uniform float u_sparkle;\r
uniform float u_time;\r
uniform float u_hasImage;\r
out vec4 outColor;\r
\r
const float BAYER[16] = float[16](0.0, 8.0, 2.0, 10.0, 12.0, 4.0, 14.0, 6.0, 3.0, 11.0, 1.0, 9.0, 15.0, 7.0, 13.0, 5.0);\r
const vec3 LIGHT = vec3(-0.42, 0.58, 0.7);\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
float erfApprox(float x) {\r
  float s = sign(x);\r
  x = abs(x);\r
  float t = 1.0 / (1.0 + 0.3275911 * x);\r
  float y = 1.0 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * exp(-x * x);\r
  return s * y;\r
}\r
\r
float cellValue(ivec2 c) {\r
  vec2 center = (vec2(c) + 0.5) / u_gridSize;\r
  if (center.x < 0.0 || center.y < 0.0 || center.x > 1.0 || center.y > 1.0) return 0.0;\r
  float t = texelFetch(u_trail, clamp(ivec2(center * 512.0), ivec2(0), ivec2(511)), 0).r;\r
  if (t <= 0.0) return 0.0;\r
  if (u_sparkle > 0.0) {\r
    float n = hash(vec2(c) + floor(u_time * 14.0) * 7.31);\r
    float dim = 1.0 - t;\r
    if (n < u_sparkle * dim * 0.35) t = max(t, 0.85);\r
    else if (n > 1.0 - u_sparkle * dim * 0.5) t = 0.0;\r
  }\r
  if (u_decay == 2 && t * 2.2 <= (BAYER[(c.y & 3) * 4 + (c.x & 3)] + 0.5) / 16.0) return 0.0;\r
  return t;\r
}\r
\r
vec3 baseColor(ivec2 owner, vec2 uv) {\r
  if (u_hasImage > 0.5) return texelFetch(u_image, clamp(owner, ivec2(0), ivec2(textureSize(u_image, 0)) - 1), 0).rgb;\r
  if (u_ramp > 0.5) return mix(u_trailColor, u_color, smoothstep(0.05, 0.95, texture(u_age, uv).r));\r
  return u_color;\r
}\r
\r
vec3 tone(vec3 base, float strength) {\r
  vec3 body = mix(base * 0.55, base, smoothstep(0.3, 0.75, strength));\r
  return mix(body, mix(base, vec3(1.0), 0.22), smoothstep(0.85, 1.0, strength) * u_shine);\r
}\r
\r
float seams(vec2 q, float cs) {\r
  if (u_gap <= 0.0) return 0.0;\r
  vec2 f = fract(q / cs);\r
  float border = min(min(f.x, 1.0 - f.x), min(f.y, 1.0 - f.y)) * cs;\r
  float width = max(1.0, u_gap * cs * 0.5);\r
  return 1.0 - smoothstep(width - 0.75, width + 0.75, border);\r
}\r
\r
vec3 shade(vec3 base, vec3 n) {\r
  vec3 l = normalize(LIGHT);\r
  vec3 h = normalize(l + vec3(0.0, 0.0, 1.0));\r
  float lit = dot(n, l) - l.z;\r
  vec3 color = base * (1.0 + lit * 0.9 * u_shine);\r
  float spec = pow(max(dot(n, h), 0.0), 64.0) * 0.85 + pow(max(dot(n, h), 0.0), 10.0) * 0.08;\r
  color += spec * u_shine * mix(vec3(1.0), base, 0.15) * step(0.001, 1.0 - n.z);\r
  return clamp(color, 0.0, 1.0);\r
}\r
\r
void main() {\r
  float maxRes = max(u_resolution.x, u_resolution.y);\r
  vec2 q = gl_FragCoord.xy - 0.5 * u_resolution + 0.5 * maxRes;\r
  vec2 uv = q / maxRes;\r
  float cs = maxRes / u_gridSize;\r
  ivec2 base = ivec2(floor(q / cs));\r
\r
  float alpha = 0.0;\r
  vec3 color = vec3(0.0);\r
\r
  if (u_sigma > 0.0) {\r
    float inv = 0.70710678 / u_sigma;\r
    float norm = 0.39894228 / u_sigma;\r
    float spread = 0.5 / (u_sigma * u_sigma);\r
    int reach = int(clamp(ceil(3.0 * u_sigma / cs), 1.0, 3.0));\r
    float field = 0.0;\r
    vec2 grad = vec2(0.0);\r
    float best = -1.0;\r
    ivec2 owner = base;\r
    float wx[7];\r
    float gx[7];\r
    float wy[7];\r
    float gy[7];\r
    for (int i = 0; i < 7; i++) {\r
      int offset = i - 3;\r
      if (abs(offset) > reach) continue;\r
      vec2 lo = vec2(base + ivec2(offset)) * cs - q;\r
      vec2 hi = lo + cs;\r
      wx[i] = 0.5 * (erfApprox(hi.x * inv) - erfApprox(lo.x * inv));\r
      wy[i] = 0.5 * (erfApprox(hi.y * inv) - erfApprox(lo.y * inv));\r
      gx[i] = norm * (exp(-lo.x * lo.x * spread) - exp(-hi.x * hi.x * spread));\r
      gy[i] = norm * (exp(-lo.y * lo.y * spread) - exp(-hi.y * hi.y * spread));\r
    }\r
    for (int j = 0; j < 7; j++) {\r
      if (abs(j - 3) > reach) continue;\r
      for (int i = 0; i < 7; i++) {\r
        if (abs(i - 3) > reach) continue;\r
        ivec2 c = base + ivec2(i - 3, j - 3);\r
        float t = cellValue(c);\r
        if (t <= 0.0) continue;\r
        float weight = t * wx[i] * wy[j];\r
        field += weight;\r
        grad += t * vec2(gx[i] * wy[j], wx[i] * gy[j]);\r
        if (weight > best) {\r
          best = weight;\r
          owner = c;\r
        }\r
      }\r
    }\r
    float edge = max(0.0263, length(grad) * 0.6);\r
    alpha = smoothstep(0.5 - edge, 0.5 + edge, field);\r
    if (alpha > 0.0) {\r
      vec3 n = normalize(vec3(-grad * cs * 0.55, 1.0));\r
      float strength = max(cellValue(base), field);\r
      vec3 body = tone(baseColor(owner, uv), strength);\r
      body *= 1.0 - seams(q, cs) * 0.32;\r
      color = shade(body, n);\r
    }\r
  } else {\r
    float t = cellValue(base);\r
    if (t > 0.0) {\r
      float halfSize = 0.5 * (1.0 - u_gap);\r
      float fade = t;\r
      if (u_decay == 1) {\r
        halfSize *= sqrt(clamp(t * 2.5, 0.0, 1.0));\r
        fade = 1.0;\r
      } else if (u_decay == 2) {\r
        fade = 1.0;\r
      }\r
      vec2 local = fract(q / cs) - 0.5;\r
      float d;\r
      vec2 dir;\r
      if (u_shape == 1) {\r
        d = length(local) - halfSize;\r
        dir = normalize(local + 1e-5);\r
      } else if (u_shape == 2) {\r
        d = (abs(local.x) + abs(local.y) - halfSize * 1.2) * 0.7071;\r
        dir = sign(local) * 0.7071;\r
      } else {\r
        vec2 a = abs(local) - halfSize;\r
        d = max(a.x, a.y);\r
        dir = a.x > a.y ? vec2(sign(local.x), 0.0) : vec2(0.0, sign(local.y));\r
      }\r
      float px = 1.0 / cs;\r
      float coverage = clamp(0.5 - d / px, 0.0, 1.0);\r
      alpha = coverage * fade;\r
      if (alpha > 0.0) {\r
        float bevel = smoothstep(-0.16 * (1.0 - u_gap), 0.0, d);\r
        vec3 n = normalize(vec3(dir * bevel * 0.9, 1.0));\r
        color = shade(tone(baseColor(base, uv), t), n);\r
      }\r
    }\r
  }\r
\r
  vec4 pixel = vec4(color * alpha, alpha);\r
  if (u_glow > 0.0) {\r
    float glow = texture(u_trail, uv).r;\r
    float amount = smoothstep(0.0, 0.7, glow) * u_glow * 0.55 * (1.0 - alpha);\r
    vec3 tint = u_hasImage > 0.5 ? texture(u_image, uv).rgb : (u_ramp > 0.5 ? mix(u_trailColor, u_color, 0.5) : u_color);\r
    pixel += vec4(tint * amount, amount);\r
  }\r
  if (pixel.a <= 0.002) discard;\r
  outColor = pixel;\r
}\r
\`;\r
\r
const parseColor = (() => {\r
  let context = null;\r
  return (value, fallback) => {\r
    if (typeof document === 'undefined') return fallback;\r
    if (!context) {\r
      const canvas = document.createElement('canvas');\r
      canvas.width = 1;\r
      canvas.height = 1;\r
      context = canvas.getContext('2d', { willReadFrequently: true });\r
    }\r
    if (!context) return fallback;\r
    context.clearRect(0, 0, 1, 1);\r
    context.fillStyle = '#000';\r
    context.fillStyle = value;\r
    context.fillRect(0, 0, 1, 1);\r
    const [r, g, b] = context.getImageData(0, 0, 1, 1).data;\r
    return [r / 255, g / 255, b / 255];\r
  };\r
})();\r
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
export default function PixelTrail({\r
  gridSize = 40,\r
  trailSize = 0.1,\r
  maxAge = 250,\r
  interpolate = 5,\r
  easingFunction = identityEase,\r
  gooeyFilter = { strength: 2 },\r
  color = '#ffffff',\r
  trailColor,\r
  shape = 'square',\r
  gap = 0.08,\r
  decay = 'fade',\r
  flow = 0,\r
  gravity = 0,\r
  sparkle = 0,\r
  clickBurst = false,\r
  shine = 0.6,\r
  glow = 0.4,\r
  imageSrc,\r
  dpr,\r
  className = '',\r
  style\r
}) {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const engineRef = useRef(null);\r
  const settingsRef = useRef(null);\r
\r
  settingsRef.current = {\r
    gridSize: Math.max(1, gridSize),\r
    trailSize: Math.max(0, trailSize),\r
    maxAge: Math.max(1, maxAge),\r
    interpolate,\r
    ease: easingFunction || identityEase,\r
    goo: gooeyFilter ? Math.max(0, gooeyFilter.strength ?? 2) : 0,\r
    color: parseColor(color, [1, 1, 1]),\r
    trailColor: trailColor ? parseColor(trailColor, [1, 1, 1]) : null,\r
    shape: SHAPES[shape] ?? 0,\r
    gap: Math.min(Math.max(gap, 0), 0.9),\r
    decay: DECAYS[decay] ?? 0,\r
    flow: Math.min(Math.max(flow, 0), 1),\r
    gravity: Math.min(Math.max(gravity, -1), 1),\r
    sparkle: Math.min(Math.max(sparkle, 0), 1),\r
    clickBurst,\r
    shine: Math.min(Math.max(shine, 0), 1),\r
    glow: Math.min(Math.max(glow, 0), 1),\r
    dpr\r
  };\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    if (!container || !canvas) return undefined;\r
    const gl = canvas.getContext('webgl2', {\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      powerPreference: 'high-performance'\r
    });\r
    if (!gl) return undefined;\r
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
    const program = gl.createProgram();\r
    if (!vertex || !fragment || !program) return undefined;\r
    gl.attachShader(program, vertex);\r
    gl.attachShader(program, fragment);\r
    gl.linkProgram(program);\r
    gl.deleteShader(vertex);\r
    gl.deleteShader(fragment);\r
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return undefined;\r
    gl.useProgram(program);\r
\r
    const uniforms = {};\r
    const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
    for (let i = 0; i < uniformCount; i++) {\r
      const info = gl.getActiveUniform(program, i);\r
      if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
    }\r
\r
    const vao = gl.createVertexArray();\r
    const buffer = gl.createBuffer();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const makeTexture = unit => {\r
      const texture = gl.createTexture();\r
      gl.activeTexture(gl.TEXTURE0 + unit);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));\r
      return texture;\r
    };\r
    const trailTexture = makeTexture(0);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
    const imageTexture = makeTexture(1);\r
    const ageTexture = makeTexture(2);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
    gl.uniform1i(uniforms.u_trail, 0);\r
    gl.uniform1i(uniforms.u_image, 1);\r
    gl.uniform1i(uniforms.u_age, 2);\r
\r
    const trailCanvas = document.createElement('canvas');\r
    trailCanvas.width = TRAIL_SIZE;\r
    trailCanvas.height = TRAIL_SIZE;\r
    const ctx = trailCanvas.getContext('2d');\r
    if (!ctx) return undefined;\r
    ctx.fillStyle = 'black';\r
    ctx.fillRect(0, 0, TRAIL_SIZE, TRAIL_SIZE);\r
\r
    const ageCanvas = document.createElement('canvas');\r
    ageCanvas.width = AGE_SIZE;\r
    ageCanvas.height = AGE_SIZE;\r
    const ageCtx = ageCanvas.getContext('2d');\r
    if (!ageCtx) return undefined;\r
\r
    const state = {\r
      alive: true,\r
      raf: 0,\r
      last: 0,\r
      time: 0,\r
      visible: true,\r
      width: 1,\r
      height: 1,\r
      ratio: 1,\r
      points: [],\r
      force: 0,\r
      image: null,\r
      imageReady: false,\r
      imageCells: 0,\r
      imageWidth: 0,\r
      imageHeight: 0,\r
      pointer: { x: 0, y: 0, at: 0, vx: 0, vy: 0, inside: false }\r
    };\r
\r
    const addTouch = (x, y, vx, vy) => {\r
      const s = settingsRef.current;\r
      const { points } = state;\r
      const last = points[points.length - 1];\r
      if (last) {\r
        const dx = last.x - x;\r
        const dy = last.y - y;\r
        const dd = dx * dx + dy * dy;\r
        const force = Math.max(0.3, Math.min(dd * 10000, 1));\r
        state.force = force;\r
        if (s.interpolate) {\r
          const lines = Math.ceil(dd / Math.pow((s.trailSize * 0.5) / s.interpolate, 2));\r
          if (lines > 1) {\r
            for (let i = 1; i < lines; i++) {\r
              points.push({ x: last.x - (dx / lines) * i, y: last.y - (dy / lines) * i, age: 0, force, vx, vy });\r
            }\r
          }\r
        }\r
      }\r
      points.push({ x, y, age: 0, force: state.force, vx, vy });\r
    };\r
\r
    const drawTouch = point => {\r
      const s = settingsRef.current;\r
      const x = point.x * TRAIL_SIZE;\r
      const y = (1 - point.y) * TRAIL_SIZE;\r
      let intensity = 1;\r
      if (point.age < s.maxAge * 0.3) {\r
        intensity = s.ease(point.age / (s.maxAge * 0.3));\r
      } else {\r
        intensity = s.ease(1 - (point.age - s.maxAge * 0.3) / (s.maxAge * 0.7));\r
      }\r
      intensity *= point.force;\r
      ctx.globalCompositeOperation = 'screen';\r
      const radius = TRAIL_SIZE * s.trailSize * intensity;\r
      const gradient = ctx.createRadialGradient(x, y, Math.max(0, radius * 0.25), x, y, Math.max(0, radius));\r
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');\r
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.0)');\r
      ctx.beginPath();\r
      ctx.fillStyle = gradient;\r
      ctx.arc(x, y, Math.max(0, radius), 0, Math.PI * 2);\r
      ctx.fill();\r
      if (!s.trailColor || radius <= 0) return;\r
      const scale = AGE_SIZE / TRAIL_SIZE;\r
      const fresh = Math.round(255 * Math.min(Math.max(1 - point.age / s.maxAge, 0), 1));\r
      const glaze = ageCtx.createRadialGradient(x * scale, y * scale, 0, x * scale, y * scale, radius * scale);\r
      glaze.addColorStop(0, \`rgb(\${fresh}, \${fresh}, \${fresh})\`);\r
      glaze.addColorStop(0.75, \`rgb(\${fresh}, \${fresh}, \${fresh})\`);\r
      glaze.addColorStop(1, 'rgba(0, 0, 0, 0)');\r
      ageCtx.globalCompositeOperation = 'lighten';\r
      ageCtx.beginPath();\r
      ageCtx.fillStyle = glaze;\r
      ageCtx.arc(x * scale, y * scale, radius * scale, 0, Math.PI * 2);\r
      ageCtx.fill();\r
    };\r
\r
    const updateTrail = delta => {\r
      const s = settingsRef.current;\r
      ctx.globalCompositeOperation = 'source-over';\r
      ctx.fillStyle = 'black';\r
      ctx.fillRect(0, 0, TRAIL_SIZE, TRAIL_SIZE);\r
      if (s.trailColor) {\r
        ageCtx.globalCompositeOperation = 'source-over';\r
        ageCtx.fillStyle = 'black';\r
        ageCtx.fillRect(0, 0, AGE_SIZE, AGE_SIZE);\r
      }\r
      state.points.forEach((point, i) => {\r
        point.age += delta * 1000;\r
        if (point.age > s.maxAge) state.points.splice(i, 1);\r
      });\r
      if (!state.points.length) state.force = 0;\r
      if (s.flow > 0 || s.gravity !== 0) {\r
        const drag = Math.exp(-3 * delta);\r
        for (const point of state.points) {\r
          point.vx *= drag;\r
          point.vy = point.vy * drag - s.gravity * 1.6 * delta;\r
          point.x += point.vx * delta;\r
          point.y += point.vy * delta;\r
        }\r
      }\r
      state.points.forEach(drawTouch);\r
    };\r
\r
    const burst = (x, y) => {\r
      const count = 14;\r
      for (let k = 0; k < count; k++) {\r
        const angle = (k / count) * Math.PI * 2 + Math.random() * 0.3;\r
        const speed = 0.35 + Math.random() * 0.25;\r
        state.points.push({\r
          x,\r
          y,\r
          age: 0,\r
          force: 1,\r
          vx: Math.cos(angle) * speed,\r
          vy: Math.sin(angle) * speed\r
        });\r
      }\r
    };\r
\r
    const uploadImage = () => {\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.bindTexture(gl.TEXTURE_2D, imageTexture);\r
      const image = state.image;\r
      if (!image) {\r
        state.imageReady = false;\r
        return;\r
      }\r
      const s = settingsRef.current;\r
      const cells = Math.max(1, Math.round(s.gridSize));\r
      const sample = document.createElement('canvas');\r
      sample.width = cells;\r
      sample.height = cells;\r
      const sampleCtx = sample.getContext('2d');\r
      if (!sampleCtx) return;\r
      const side = Math.max(state.width, state.height);\r
      const scale = Math.max(state.width / image.naturalWidth, state.height / image.naturalHeight);\r
      const sourceSide = side / scale;\r
      sampleCtx.imageSmoothingQuality = 'high';\r
      sampleCtx.drawImage(\r
        image,\r
        (image.naturalWidth - sourceSide) / 2,\r
        (image.naturalHeight - sourceSide) / 2,\r
        sourceSide,\r
        sourceSide,\r
        0,\r
        0,\r
        cells,\r
        cells\r
      );\r
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sample);\r
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);\r
      state.imageReady = true;\r
      state.imageCells = cells;\r
      state.imageWidth = state.width;\r
      state.imageHeight = state.height;\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const ratio = s.dpr ?? Math.min(window.devicePixelRatio || 1, 2);\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      state.width = width;\r
      state.height = height;\r
      state.ratio = ratio;\r
      const pixelWidth = Math.max(1, Math.floor(width * ratio));\r
      const pixelHeight = Math.max(1, Math.floor(height * ratio));\r
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {\r
        canvas.width = pixelWidth;\r
        canvas.height = pixelHeight;\r
      }\r
      if (\r
        state.image &&\r
        (state.imageCells !== Math.max(1, Math.round(s.gridSize)) ||\r
          state.imageWidth !== width ||\r
          state.imageHeight !== height)\r
      ) {\r
        uploadImage();\r
      }\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, trailTexture);\r
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, trailCanvas);\r
      if (s.trailColor) {\r
        gl.activeTexture(gl.TEXTURE2);\r
        gl.bindTexture(gl.TEXTURE_2D, ageTexture);\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, ageCanvas);\r
      }\r
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);\r
      gl.uniform2f(uniforms.u_resolution, state.width * state.ratio, state.height * state.ratio);\r
      gl.uniform1f(uniforms.u_gridSize, s.gridSize);\r
      gl.uniform3fv(uniforms.u_color, s.color);\r
      gl.uniform3fv(uniforms.u_trailColor, s.trailColor ?? s.color);\r
      gl.uniform1f(uniforms.u_ramp, s.trailColor ? 1 : 0);\r
      gl.uniform1f(uniforms.u_sigma, s.goo * state.ratio);\r
      gl.uniform1f(uniforms.u_shine, s.shine);\r
      gl.uniform1f(uniforms.u_glow, s.glow);\r
      gl.uniform1i(uniforms.u_shape, s.shape);\r
      gl.uniform1i(uniforms.u_decay, s.decay);\r
      gl.uniform1f(uniforms.u_gap, s.gap);\r
      gl.uniform1f(uniforms.u_sparkle, s.sparkle);\r
      gl.uniform1f(uniforms.u_time, state.time);\r
      gl.uniform1f(uniforms.u_hasImage, state.imageReady ? 1 : 0);\r
      gl.bindVertexArray(vao);\r
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);\r
    };\r
\r
    const frame = now => {\r
      state.raf = 0;\r
      if (!state.alive) return;\r
      const delta = state.last ? (now - state.last) / 1000 : 1 / 60;\r
      state.last = now;\r
      state.time += delta;\r
      resize();\r
      updateTrail(delta);\r
      draw();\r
      if (state.points.length && state.visible) state.raf = requestAnimationFrame(frame);\r
      else state.last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!state.raf && state.alive && state.visible) state.raf = requestAnimationFrame(frame);\r
    };\r
\r
    const toUv = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      const side = Math.max(rect.width, rect.height);\r
      return {\r
        x: (x - rect.width / 2) / side + 0.5,\r
        y: (rect.height / 2 - y) / side + 0.5,\r
        inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height\r
      };\r
    };\r
\r
    const onMove = event => {\r
      const { x, y, inside } = toUv(event);\r
      const pointer = state.pointer;\r
      const now = performance.now();\r
      if (inside) {\r
        const s = settingsRef.current;\r
        const elapsed = Math.max(0.008, (now - pointer.at) / 1000);\r
        if (pointer.inside) {\r
          pointer.vx += ((x - pointer.x) / elapsed - pointer.vx) * 0.5;\r
          pointer.vy += ((y - pointer.y) / elapsed - pointer.vy) * 0.5;\r
        } else {\r
          pointer.vx = 0;\r
          pointer.vy = 0;\r
        }\r
        addTouch(x, y, pointer.vx * s.flow * 0.3, pointer.vy * s.flow * 0.3);\r
        wake();\r
      }\r
      pointer.x = x;\r
      pointer.y = y;\r
      pointer.at = now;\r
      pointer.inside = inside;\r
    };\r
\r
    const onDown = event => {\r
      const { x, y, inside } = toUv(event);\r
      if (!inside || !settingsRef.current.clickBurst) return;\r
      burst(x, y);\r
      wake();\r
    };\r
\r
    const onLeave = () => {\r
      state.pointer.inside = false;\r
    };\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      resize();\r
      draw();\r
    });\r
    resizeObserver.observe(container);\r
\r
    const visibility = new IntersectionObserver(entries => {\r
      state.visible = entries.some(entry => entry.isIntersecting);\r
      if (state.visible) wake();\r
    });\r
    visibility.observe(container);\r
\r
    const onLost = event => {\r
      event.preventDefault();\r
      state.alive = false;\r
      cancelAnimationFrame(state.raf);\r
    };\r
\r
    canvas.addEventListener('webglcontextlost', onLost);\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    window.addEventListener('pointerdown', onDown, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onLeave);\r
    window.addEventListener('blur', onLeave);\r
\r
    engineRef.current = {\r
      setImage: image => {\r
        state.image = image;\r
        uploadImage();\r
        draw();\r
      },\r
      redraw: () => {\r
        resize();\r
        draw();\r
      }\r
    };\r
\r
    resize();\r
    draw();\r
\r
    return () => {\r
      state.alive = false;\r
      cancelAnimationFrame(state.raf);\r
      resizeObserver.disconnect();\r
      visibility.disconnect();\r
      canvas.removeEventListener('webglcontextlost', onLost);\r
      window.removeEventListener('pointermove', onMove);\r
      window.removeEventListener('pointerdown', onDown);\r
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
      window.removeEventListener('blur', onLeave);\r
      engineRef.current = null;\r
      gl.deleteTexture(trailTexture);\r
      gl.deleteTexture(imageTexture);\r
      gl.deleteTexture(ageTexture);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(program);\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    if (!imageSrc) {\r
      engineRef.current?.setImage(null);\r
      return undefined;\r
    }\r
    let active = true;\r
    const image = new Image();\r
    image.crossOrigin = 'anonymous';\r
    image.decoding = 'async';\r
    image.onload = () => {\r
      if (active) engineRef.current?.setImage(image);\r
    };\r
    image.onerror = () => {\r
      if (active) engineRef.current?.setImage(null);\r
    };\r
    image.src = imageSrc;\r
    return () => {\r
      active = false;\r
    };\r
  }, [imageSrc]);\r
\r
  useEffect(() => {\r
    engineRef.current?.redraw();\r
  });\r
\r
  return (\r
    <div\r
      ref={containerRef}\r
      className={\`absolute z-1 \${className}\`.trim()}\r
      style={{\r
        position: 'relative',\r
        width: '100%',\r
        height: '100%',\r
        overflow: 'hidden',\r
        pointerEvents: 'none',\r
        ...style\r
      }}\r
    >\r
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />\r
    </div>\r
  );\r
}\r
`,t=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties } from 'react';\r
\r
import './PixelTrail.css';\r
\r
const TRAIL_SIZE = 512;\r
const AGE_SIZE = 256;\r
export interface PixelTrailProps {\r
  gridSize?: number;\r
  trailSize?: number;\r
  maxAge?: number;\r
  interpolate?: number;\r
  easingFunction?: (x: number) => number;\r
  gooeyFilter?: { id?: string; strength?: number } | false | null;\r
  color?: string;\r
  trailColor?: string;\r
  shape?: 'square' | 'circle' | 'diamond';\r
  gap?: number;\r
  decay?: 'fade' | 'shrink' | 'dither';\r
  flow?: number;\r
  gravity?: number;\r
  sparkle?: number;\r
  clickBurst?: boolean;\r
  shine?: number;\r
  glow?: number;\r
  imageSrc?: string;\r
  dpr?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Settings {\r
  gridSize: number;\r
  trailSize: number;\r
  maxAge: number;\r
  interpolate: number;\r
  ease: (x: number) => number;\r
  goo: number;\r
  color: number[];\r
  trailColor: number[] | null;\r
  shape: number;\r
  gap: number;\r
  decay: number;\r
  flow: number;\r
  gravity: number;\r
  sparkle: number;\r
  clickBurst: boolean;\r
  shine: number;\r
  glow: number;\r
  dpr?: number;\r
}\r
\r
interface TrailPoint {\r
  x: number;\r
  y: number;\r
  age: number;\r
  force: number;\r
  vx: number;\r
  vy: number;\r
}\r
\r
interface Engine {\r
  setImage: (image: HTMLImageElement | null) => void;\r
  redraw: () => void;\r
}\r
\r
const SHAPES: Record<string, number> = { square: 0, circle: 1, diamond: 2 };\r
const DECAYS: Record<string, number> = { fade: 0, shrink: 1, dither: 2 };\r
\r
const identityEase = (x: number) => x;\r
\r
const VERTEX = \`#version 300 es\r
in vec2 a_position;\r
void main() {\r
  gl_Position = vec4(a_position, 0.0, 1.0);\r
}\r
\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform sampler2D u_trail;\r
uniform sampler2D u_image;\r
uniform sampler2D u_age;\r
uniform vec2 u_resolution;\r
uniform float u_gridSize;\r
uniform float u_sigma;\r
uniform vec3 u_color;\r
uniform vec3 u_trailColor;\r
uniform float u_ramp;\r
uniform float u_shine;\r
uniform float u_glow;\r
uniform int u_shape;\r
uniform int u_decay;\r
uniform float u_gap;\r
uniform float u_sparkle;\r
uniform float u_time;\r
uniform float u_hasImage;\r
out vec4 outColor;\r
\r
const float BAYER[16] = float[16](0.0, 8.0, 2.0, 10.0, 12.0, 4.0, 14.0, 6.0, 3.0, 11.0, 1.0, 9.0, 15.0, 7.0, 13.0, 5.0);\r
const vec3 LIGHT = vec3(-0.42, 0.58, 0.7);\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
float erfApprox(float x) {\r
  float s = sign(x);\r
  x = abs(x);\r
  float t = 1.0 / (1.0 + 0.3275911 * x);\r
  float y = 1.0 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * exp(-x * x);\r
  return s * y;\r
}\r
\r
float cellValue(ivec2 c) {\r
  vec2 center = (vec2(c) + 0.5) / u_gridSize;\r
  if (center.x < 0.0 || center.y < 0.0 || center.x > 1.0 || center.y > 1.0) return 0.0;\r
  float t = texelFetch(u_trail, clamp(ivec2(center * 512.0), ivec2(0), ivec2(511)), 0).r;\r
  if (t <= 0.0) return 0.0;\r
  if (u_sparkle > 0.0) {\r
    float n = hash(vec2(c) + floor(u_time * 14.0) * 7.31);\r
    float dim = 1.0 - t;\r
    if (n < u_sparkle * dim * 0.35) t = max(t, 0.85);\r
    else if (n > 1.0 - u_sparkle * dim * 0.5) t = 0.0;\r
  }\r
  if (u_decay == 2 && t * 2.2 <= (BAYER[(c.y & 3) * 4 + (c.x & 3)] + 0.5) / 16.0) return 0.0;\r
  return t;\r
}\r
\r
vec3 baseColor(ivec2 owner, vec2 uv) {\r
  if (u_hasImage > 0.5) return texelFetch(u_image, clamp(owner, ivec2(0), ivec2(textureSize(u_image, 0)) - 1), 0).rgb;\r
  if (u_ramp > 0.5) return mix(u_trailColor, u_color, smoothstep(0.05, 0.95, texture(u_age, uv).r));\r
  return u_color;\r
}\r
\r
vec3 tone(vec3 base, float strength) {\r
  vec3 body = mix(base * 0.55, base, smoothstep(0.3, 0.75, strength));\r
  return mix(body, mix(base, vec3(1.0), 0.22), smoothstep(0.85, 1.0, strength) * u_shine);\r
}\r
\r
float seams(vec2 q, float cs) {\r
  if (u_gap <= 0.0) return 0.0;\r
  vec2 f = fract(q / cs);\r
  float border = min(min(f.x, 1.0 - f.x), min(f.y, 1.0 - f.y)) * cs;\r
  float width = max(1.0, u_gap * cs * 0.5);\r
  return 1.0 - smoothstep(width - 0.75, width + 0.75, border);\r
}\r
\r
vec3 shade(vec3 base, vec3 n) {\r
  vec3 l = normalize(LIGHT);\r
  vec3 h = normalize(l + vec3(0.0, 0.0, 1.0));\r
  float lit = dot(n, l) - l.z;\r
  vec3 color = base * (1.0 + lit * 0.9 * u_shine);\r
  float spec = pow(max(dot(n, h), 0.0), 64.0) * 0.85 + pow(max(dot(n, h), 0.0), 10.0) * 0.08;\r
  color += spec * u_shine * mix(vec3(1.0), base, 0.15) * step(0.001, 1.0 - n.z);\r
  return clamp(color, 0.0, 1.0);\r
}\r
\r
void main() {\r
  float maxRes = max(u_resolution.x, u_resolution.y);\r
  vec2 q = gl_FragCoord.xy - 0.5 * u_resolution + 0.5 * maxRes;\r
  vec2 uv = q / maxRes;\r
  float cs = maxRes / u_gridSize;\r
  ivec2 base = ivec2(floor(q / cs));\r
\r
  float alpha = 0.0;\r
  vec3 color = vec3(0.0);\r
\r
  if (u_sigma > 0.0) {\r
    float inv = 0.70710678 / u_sigma;\r
    float norm = 0.39894228 / u_sigma;\r
    float spread = 0.5 / (u_sigma * u_sigma);\r
    int reach = int(clamp(ceil(3.0 * u_sigma / cs), 1.0, 3.0));\r
    float field = 0.0;\r
    vec2 grad = vec2(0.0);\r
    float best = -1.0;\r
    ivec2 owner = base;\r
    float wx[7];\r
    float gx[7];\r
    float wy[7];\r
    float gy[7];\r
    for (int i = 0; i < 7; i++) {\r
      int offset = i - 3;\r
      if (abs(offset) > reach) continue;\r
      vec2 lo = vec2(base + ivec2(offset)) * cs - q;\r
      vec2 hi = lo + cs;\r
      wx[i] = 0.5 * (erfApprox(hi.x * inv) - erfApprox(lo.x * inv));\r
      wy[i] = 0.5 * (erfApprox(hi.y * inv) - erfApprox(lo.y * inv));\r
      gx[i] = norm * (exp(-lo.x * lo.x * spread) - exp(-hi.x * hi.x * spread));\r
      gy[i] = norm * (exp(-lo.y * lo.y * spread) - exp(-hi.y * hi.y * spread));\r
    }\r
    for (int j = 0; j < 7; j++) {\r
      if (abs(j - 3) > reach) continue;\r
      for (int i = 0; i < 7; i++) {\r
        if (abs(i - 3) > reach) continue;\r
        ivec2 c = base + ivec2(i - 3, j - 3);\r
        float t = cellValue(c);\r
        if (t <= 0.0) continue;\r
        float weight = t * wx[i] * wy[j];\r
        field += weight;\r
        grad += t * vec2(gx[i] * wy[j], wx[i] * gy[j]);\r
        if (weight > best) {\r
          best = weight;\r
          owner = c;\r
        }\r
      }\r
    }\r
    float edge = max(0.0263, length(grad) * 0.6);\r
    alpha = smoothstep(0.5 - edge, 0.5 + edge, field);\r
    if (alpha > 0.0) {\r
      vec3 n = normalize(vec3(-grad * cs * 0.55, 1.0));\r
      float strength = max(cellValue(base), field);\r
      vec3 body = tone(baseColor(owner, uv), strength);\r
      body *= 1.0 - seams(q, cs) * 0.32;\r
      color = shade(body, n);\r
    }\r
  } else {\r
    float t = cellValue(base);\r
    if (t > 0.0) {\r
      float halfSize = 0.5 * (1.0 - u_gap);\r
      float fade = t;\r
      if (u_decay == 1) {\r
        halfSize *= sqrt(clamp(t * 2.5, 0.0, 1.0));\r
        fade = 1.0;\r
      } else if (u_decay == 2) {\r
        fade = 1.0;\r
      }\r
      vec2 local = fract(q / cs) - 0.5;\r
      float d;\r
      vec2 dir;\r
      if (u_shape == 1) {\r
        d = length(local) - halfSize;\r
        dir = normalize(local + 1e-5);\r
      } else if (u_shape == 2) {\r
        d = (abs(local.x) + abs(local.y) - halfSize * 1.2) * 0.7071;\r
        dir = sign(local) * 0.7071;\r
      } else {\r
        vec2 a = abs(local) - halfSize;\r
        d = max(a.x, a.y);\r
        dir = a.x > a.y ? vec2(sign(local.x), 0.0) : vec2(0.0, sign(local.y));\r
      }\r
      float px = 1.0 / cs;\r
      float coverage = clamp(0.5 - d / px, 0.0, 1.0);\r
      alpha = coverage * fade;\r
      if (alpha > 0.0) {\r
        float bevel = smoothstep(-0.16 * (1.0 - u_gap), 0.0, d);\r
        vec3 n = normalize(vec3(dir * bevel * 0.9, 1.0));\r
        color = shade(tone(baseColor(base, uv), t), n);\r
      }\r
    }\r
  }\r
\r
  vec4 pixel = vec4(color * alpha, alpha);\r
  if (u_glow > 0.0) {\r
    float glow = texture(u_trail, uv).r;\r
    float amount = smoothstep(0.0, 0.7, glow) * u_glow * 0.55 * (1.0 - alpha);\r
    vec3 tint = u_hasImage > 0.5 ? texture(u_image, uv).rgb : (u_ramp > 0.5 ? mix(u_trailColor, u_color, 0.5) : u_color);\r
    pixel += vec4(tint * amount, amount);\r
  }\r
  if (pixel.a <= 0.002) discard;\r
  outColor = pixel;\r
}\r
\`;\r
\r
const parseColor = (() => {\r
  let context: CanvasRenderingContext2D | null = null;\r
  return (value: string, fallback: number[]): number[] => {\r
    if (typeof document === 'undefined') return fallback;\r
    if (!context) {\r
      const canvas = document.createElement('canvas');\r
      canvas.width = 1;\r
      canvas.height = 1;\r
      context = canvas.getContext('2d', { willReadFrequently: true });\r
    }\r
    if (!context) return fallback;\r
    context.clearRect(0, 0, 1, 1);\r
    context.fillStyle = '#000';\r
    context.fillStyle = value;\r
    context.fillRect(0, 0, 1, 1);\r
    const [r, g, b] = context.getImageData(0, 0, 1, 1).data;\r
    return [r / 255, g / 255, b / 255];\r
  };\r
})();\r
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
export default function PixelTrail({\r
  gridSize = 40,\r
  trailSize = 0.1,\r
  maxAge = 250,\r
  interpolate = 5,\r
  easingFunction = identityEase,\r
  gooeyFilter = { strength: 2 },\r
  color = '#ffffff',\r
  trailColor,\r
  shape = 'square',\r
  gap = 0.08,\r
  decay = 'fade',\r
  flow = 0,\r
  gravity = 0,\r
  sparkle = 0,\r
  clickBurst = false,\r
  shine = 0.6,\r
  glow = 0.4,\r
  imageSrc,\r
  dpr,\r
  className = '',\r
  style\r
}: PixelTrailProps) {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const engineRef = useRef<Engine | null>(null);\r
  const settingsRef = useRef<Settings>(null as unknown as Settings);\r
\r
  settingsRef.current = {\r
    gridSize: Math.max(1, gridSize),\r
    trailSize: Math.max(0, trailSize),\r
    maxAge: Math.max(1, maxAge),\r
    interpolate,\r
    ease: easingFunction || identityEase,\r
    goo: gooeyFilter ? Math.max(0, gooeyFilter.strength ?? 2) : 0,\r
    color: parseColor(color, [1, 1, 1]),\r
    trailColor: trailColor ? parseColor(trailColor, [1, 1, 1]) : null,\r
    shape: SHAPES[shape] ?? 0,\r
    gap: Math.min(Math.max(gap, 0), 0.9),\r
    decay: DECAYS[decay] ?? 0,\r
    flow: Math.min(Math.max(flow, 0), 1),\r
    gravity: Math.min(Math.max(gravity, -1), 1),\r
    sparkle: Math.min(Math.max(sparkle, 0), 1),\r
    clickBurst,\r
    shine: Math.min(Math.max(shine, 0), 1),\r
    glow: Math.min(Math.max(glow, 0), 1),\r
    dpr\r
  };\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    if (!container || !canvas) return undefined;\r
    const gl = canvas.getContext('webgl2', {\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      powerPreference: 'high-performance'\r
    });\r
    if (!gl) return undefined;\r
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
    const program = gl.createProgram();\r
    if (!vertex || !fragment || !program) return undefined;\r
    gl.attachShader(program, vertex);\r
    gl.attachShader(program, fragment);\r
    gl.linkProgram(program);\r
    gl.deleteShader(vertex);\r
    gl.deleteShader(fragment);\r
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return undefined;\r
    gl.useProgram(program);\r
\r
    const uniforms: Record<string, WebGLUniformLocation | null> = {};\r
    const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
    for (let i = 0; i < uniformCount; i++) {\r
      const info = gl.getActiveUniform(program, i);\r
      if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
    }\r
\r
    const vao = gl.createVertexArray();\r
    const buffer = gl.createBuffer();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const makeTexture = (unit: number) => {\r
      const texture = gl.createTexture();\r
      gl.activeTexture(gl.TEXTURE0 + unit);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));\r
      return texture;\r
    };\r
    const trailTexture = makeTexture(0);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
    const imageTexture = makeTexture(1);\r
    const ageTexture = makeTexture(2);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
    gl.uniform1i(uniforms.u_trail, 0);\r
    gl.uniform1i(uniforms.u_image, 1);\r
    gl.uniform1i(uniforms.u_age, 2);\r
\r
    const trailCanvas = document.createElement('canvas');\r
    trailCanvas.width = TRAIL_SIZE;\r
    trailCanvas.height = TRAIL_SIZE;\r
    const ctx = trailCanvas.getContext('2d');\r
    if (!ctx) return undefined;\r
    ctx.fillStyle = 'black';\r
    ctx.fillRect(0, 0, TRAIL_SIZE, TRAIL_SIZE);\r
\r
    const ageCanvas = document.createElement('canvas');\r
    ageCanvas.width = AGE_SIZE;\r
    ageCanvas.height = AGE_SIZE;\r
    const ageCtx = ageCanvas.getContext('2d');\r
    if (!ageCtx) return undefined;\r
\r
    const state = {\r
      alive: true,\r
      raf: 0,\r
      last: 0,\r
      time: 0,\r
      visible: true,\r
      width: 1,\r
      height: 1,\r
      ratio: 1,\r
      points: [] as TrailPoint[],\r
      force: 0,\r
      image: null as HTMLImageElement | null,\r
      imageReady: false,\r
      imageCells: 0,\r
      imageWidth: 0,\r
      imageHeight: 0,\r
      pointer: { x: 0, y: 0, at: 0, vx: 0, vy: 0, inside: false }\r
    };\r
\r
    const addTouch = (x: number, y: number, vx: number, vy: number) => {\r
      const s = settingsRef.current;\r
      const { points } = state;\r
      const last = points[points.length - 1];\r
      if (last) {\r
        const dx = last.x - x;\r
        const dy = last.y - y;\r
        const dd = dx * dx + dy * dy;\r
        const force = Math.max(0.3, Math.min(dd * 10000, 1));\r
        state.force = force;\r
        if (s.interpolate) {\r
          const lines = Math.ceil(dd / Math.pow((s.trailSize * 0.5) / s.interpolate, 2));\r
          if (lines > 1) {\r
            for (let i = 1; i < lines; i++) {\r
              points.push({ x: last.x - (dx / lines) * i, y: last.y - (dy / lines) * i, age: 0, force, vx, vy });\r
            }\r
          }\r
        }\r
      }\r
      points.push({ x, y, age: 0, force: state.force, vx, vy });\r
    };\r
\r
    const drawTouch = (point: TrailPoint) => {\r
      const s = settingsRef.current;\r
      const x = point.x * TRAIL_SIZE;\r
      const y = (1 - point.y) * TRAIL_SIZE;\r
      let intensity = 1;\r
      if (point.age < s.maxAge * 0.3) {\r
        intensity = s.ease(point.age / (s.maxAge * 0.3));\r
      } else {\r
        intensity = s.ease(1 - (point.age - s.maxAge * 0.3) / (s.maxAge * 0.7));\r
      }\r
      intensity *= point.force;\r
      ctx.globalCompositeOperation = 'screen';\r
      const radius = TRAIL_SIZE * s.trailSize * intensity;\r
      const gradient = ctx.createRadialGradient(x, y, Math.max(0, radius * 0.25), x, y, Math.max(0, radius));\r
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');\r
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.0)');\r
      ctx.beginPath();\r
      ctx.fillStyle = gradient;\r
      ctx.arc(x, y, Math.max(0, radius), 0, Math.PI * 2);\r
      ctx.fill();\r
      if (!s.trailColor || radius <= 0) return;\r
      const scale = AGE_SIZE / TRAIL_SIZE;\r
      const fresh = Math.round(255 * Math.min(Math.max(1 - point.age / s.maxAge, 0), 1));\r
      const glaze = ageCtx.createRadialGradient(x * scale, y * scale, 0, x * scale, y * scale, radius * scale);\r
      glaze.addColorStop(0, \`rgb(\${fresh}, \${fresh}, \${fresh})\`);\r
      glaze.addColorStop(0.75, \`rgb(\${fresh}, \${fresh}, \${fresh})\`);\r
      glaze.addColorStop(1, 'rgba(0, 0, 0, 0)');\r
      ageCtx.globalCompositeOperation = 'lighten';\r
      ageCtx.beginPath();\r
      ageCtx.fillStyle = glaze;\r
      ageCtx.arc(x * scale, y * scale, radius * scale, 0, Math.PI * 2);\r
      ageCtx.fill();\r
    };\r
\r
    const updateTrail = (delta: number) => {\r
      const s = settingsRef.current;\r
      ctx.globalCompositeOperation = 'source-over';\r
      ctx.fillStyle = 'black';\r
      ctx.fillRect(0, 0, TRAIL_SIZE, TRAIL_SIZE);\r
      if (s.trailColor) {\r
        ageCtx.globalCompositeOperation = 'source-over';\r
        ageCtx.fillStyle = 'black';\r
        ageCtx.fillRect(0, 0, AGE_SIZE, AGE_SIZE);\r
      }\r
      state.points.forEach((point, i) => {\r
        point.age += delta * 1000;\r
        if (point.age > s.maxAge) state.points.splice(i, 1);\r
      });\r
      if (!state.points.length) state.force = 0;\r
      if (s.flow > 0 || s.gravity !== 0) {\r
        const drag = Math.exp(-3 * delta);\r
        for (const point of state.points) {\r
          point.vx *= drag;\r
          point.vy = point.vy * drag - s.gravity * 1.6 * delta;\r
          point.x += point.vx * delta;\r
          point.y += point.vy * delta;\r
        }\r
      }\r
      state.points.forEach(drawTouch);\r
    };\r
\r
    const burst = (x: number, y: number) => {\r
      const count = 14;\r
      for (let k = 0; k < count; k++) {\r
        const angle = (k / count) * Math.PI * 2 + Math.random() * 0.3;\r
        const speed = 0.35 + Math.random() * 0.25;\r
        state.points.push({\r
          x,\r
          y,\r
          age: 0,\r
          force: 1,\r
          vx: Math.cos(angle) * speed,\r
          vy: Math.sin(angle) * speed\r
        });\r
      }\r
    };\r
\r
    const uploadImage = () => {\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.bindTexture(gl.TEXTURE_2D, imageTexture);\r
      const image = state.image;\r
      if (!image) {\r
        state.imageReady = false;\r
        return;\r
      }\r
      const s = settingsRef.current;\r
      const cells = Math.max(1, Math.round(s.gridSize));\r
      const sample = document.createElement('canvas');\r
      sample.width = cells;\r
      sample.height = cells;\r
      const sampleCtx = sample.getContext('2d');\r
      if (!sampleCtx) return;\r
      const side = Math.max(state.width, state.height);\r
      const scale = Math.max(state.width / image.naturalWidth, state.height / image.naturalHeight);\r
      const sourceSide = side / scale;\r
      sampleCtx.imageSmoothingQuality = 'high';\r
      sampleCtx.drawImage(\r
        image,\r
        (image.naturalWidth - sourceSide) / 2,\r
        (image.naturalHeight - sourceSide) / 2,\r
        sourceSide,\r
        sourceSide,\r
        0,\r
        0,\r
        cells,\r
        cells\r
      );\r
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sample);\r
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);\r
      state.imageReady = true;\r
      state.imageCells = cells;\r
      state.imageWidth = state.width;\r
      state.imageHeight = state.height;\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const ratio = s.dpr ?? Math.min(window.devicePixelRatio || 1, 2);\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      state.width = width;\r
      state.height = height;\r
      state.ratio = ratio;\r
      const pixelWidth = Math.max(1, Math.floor(width * ratio));\r
      const pixelHeight = Math.max(1, Math.floor(height * ratio));\r
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {\r
        canvas.width = pixelWidth;\r
        canvas.height = pixelHeight;\r
      }\r
      if (\r
        state.image &&\r
        (state.imageCells !== Math.max(1, Math.round(s.gridSize)) ||\r
          state.imageWidth !== width ||\r
          state.imageHeight !== height)\r
      ) {\r
        uploadImage();\r
      }\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, trailTexture);\r
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, trailCanvas);\r
      if (s.trailColor) {\r
        gl.activeTexture(gl.TEXTURE2);\r
        gl.bindTexture(gl.TEXTURE_2D, ageTexture);\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, ageCanvas);\r
      }\r
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);\r
      gl.uniform2f(uniforms.u_resolution, state.width * state.ratio, state.height * state.ratio);\r
      gl.uniform1f(uniforms.u_gridSize, s.gridSize);\r
      gl.uniform3fv(uniforms.u_color, s.color);\r
      gl.uniform3fv(uniforms.u_trailColor, s.trailColor ?? s.color);\r
      gl.uniform1f(uniforms.u_ramp, s.trailColor ? 1 : 0);\r
      gl.uniform1f(uniforms.u_sigma, s.goo * state.ratio);\r
      gl.uniform1f(uniforms.u_shine, s.shine);\r
      gl.uniform1f(uniforms.u_glow, s.glow);\r
      gl.uniform1i(uniforms.u_shape, s.shape);\r
      gl.uniform1i(uniforms.u_decay, s.decay);\r
      gl.uniform1f(uniforms.u_gap, s.gap);\r
      gl.uniform1f(uniforms.u_sparkle, s.sparkle);\r
      gl.uniform1f(uniforms.u_time, state.time);\r
      gl.uniform1f(uniforms.u_hasImage, state.imageReady ? 1 : 0);\r
      gl.bindVertexArray(vao);\r
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);\r
    };\r
\r
    const frame = (now: number) => {\r
      state.raf = 0;\r
      if (!state.alive) return;\r
      const delta = state.last ? (now - state.last) / 1000 : 1 / 60;\r
      state.last = now;\r
      state.time += delta;\r
      resize();\r
      updateTrail(delta);\r
      draw();\r
      if (state.points.length && state.visible) state.raf = requestAnimationFrame(frame);\r
      else state.last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!state.raf && state.alive && state.visible) state.raf = requestAnimationFrame(frame);\r
    };\r
\r
    const toUv = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      const side = Math.max(rect.width, rect.height);\r
      return {\r
        x: (x - rect.width / 2) / side + 0.5,\r
        y: (rect.height / 2 - y) / side + 0.5,\r
        inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height\r
      };\r
    };\r
\r
    const onMove = (event: PointerEvent) => {\r
      const { x, y, inside } = toUv(event);\r
      const pointer = state.pointer;\r
      const now = performance.now();\r
      if (inside) {\r
        const s = settingsRef.current;\r
        const elapsed = Math.max(0.008, (now - pointer.at) / 1000);\r
        if (pointer.inside) {\r
          pointer.vx += ((x - pointer.x) / elapsed - pointer.vx) * 0.5;\r
          pointer.vy += ((y - pointer.y) / elapsed - pointer.vy) * 0.5;\r
        } else {\r
          pointer.vx = 0;\r
          pointer.vy = 0;\r
        }\r
        addTouch(x, y, pointer.vx * s.flow * 0.3, pointer.vy * s.flow * 0.3);\r
        wake();\r
      }\r
      pointer.x = x;\r
      pointer.y = y;\r
      pointer.at = now;\r
      pointer.inside = inside;\r
    };\r
\r
    const onDown = (event: PointerEvent) => {\r
      const { x, y, inside } = toUv(event);\r
      if (!inside || !settingsRef.current.clickBurst) return;\r
      burst(x, y);\r
      wake();\r
    };\r
\r
    const onLeave = () => {\r
      state.pointer.inside = false;\r
    };\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      resize();\r
      draw();\r
    });\r
    resizeObserver.observe(container);\r
\r
    const visibility = new IntersectionObserver(entries => {\r
      state.visible = entries.some(entry => entry.isIntersecting);\r
      if (state.visible) wake();\r
    });\r
    visibility.observe(container);\r
\r
    const onLost = (event: Event) => {\r
      event.preventDefault();\r
      state.alive = false;\r
      cancelAnimationFrame(state.raf);\r
    };\r
\r
    canvas.addEventListener('webglcontextlost', onLost);\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    window.addEventListener('pointerdown', onDown, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onLeave);\r
    window.addEventListener('blur', onLeave);\r
\r
    engineRef.current = {\r
      setImage: (image: HTMLImageElement | null) => {\r
        state.image = image;\r
        uploadImage();\r
        draw();\r
      },\r
      redraw: () => {\r
        resize();\r
        draw();\r
      }\r
    };\r
\r
    resize();\r
    draw();\r
\r
    return () => {\r
      state.alive = false;\r
      cancelAnimationFrame(state.raf);\r
      resizeObserver.disconnect();\r
      visibility.disconnect();\r
      canvas.removeEventListener('webglcontextlost', onLost);\r
      window.removeEventListener('pointermove', onMove);\r
      window.removeEventListener('pointerdown', onDown);\r
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
      window.removeEventListener('blur', onLeave);\r
      engineRef.current = null;\r
      gl.deleteTexture(trailTexture);\r
      gl.deleteTexture(imageTexture);\r
      gl.deleteTexture(ageTexture);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(program);\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    if (!imageSrc) {\r
      engineRef.current?.setImage(null);\r
      return undefined;\r
    }\r
    let active = true;\r
    const image = new Image();\r
    image.crossOrigin = 'anonymous';\r
    image.decoding = 'async';\r
    image.onload = () => {\r
      if (active) engineRef.current?.setImage(image);\r
    };\r
    image.onerror = () => {\r
      if (active) engineRef.current?.setImage(null);\r
    };\r
    image.src = imageSrc;\r
    return () => {\r
      active = false;\r
    };\r
  }, [imageSrc]);\r
\r
  useEffect(() => {\r
    engineRef.current?.redraw();\r
  });\r
\r
  return (\r
    <div\r
      ref={containerRef}\r
      className={\`pixel-canvas \${className}\`.trim()}\r
      style={{\r
        position: 'relative',\r
        width: '100%',\r
        height: '100%',\r
        overflow: 'hidden',\r
        pointerEvents: 'none',\r
        ...style\r
      }}\r
    >\r
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />\r
    </div>\r
  );\r
}\r
`,a=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties } from 'react';\r
\r
const TRAIL_SIZE = 512;\r
const AGE_SIZE = 256;\r
export interface PixelTrailProps {\r
  gridSize?: number;\r
  trailSize?: number;\r
  maxAge?: number;\r
  interpolate?: number;\r
  easingFunction?: (x: number) => number;\r
  gooeyFilter?: { id?: string; strength?: number } | false | null;\r
  color?: string;\r
  trailColor?: string;\r
  shape?: 'square' | 'circle' | 'diamond';\r
  gap?: number;\r
  decay?: 'fade' | 'shrink' | 'dither';\r
  flow?: number;\r
  gravity?: number;\r
  sparkle?: number;\r
  clickBurst?: boolean;\r
  shine?: number;\r
  glow?: number;\r
  imageSrc?: string;\r
  dpr?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Settings {\r
  gridSize: number;\r
  trailSize: number;\r
  maxAge: number;\r
  interpolate: number;\r
  ease: (x: number) => number;\r
  goo: number;\r
  color: number[];\r
  trailColor: number[] | null;\r
  shape: number;\r
  gap: number;\r
  decay: number;\r
  flow: number;\r
  gravity: number;\r
  sparkle: number;\r
  clickBurst: boolean;\r
  shine: number;\r
  glow: number;\r
  dpr?: number;\r
}\r
\r
interface TrailPoint {\r
  x: number;\r
  y: number;\r
  age: number;\r
  force: number;\r
  vx: number;\r
  vy: number;\r
}\r
\r
interface Engine {\r
  setImage: (image: HTMLImageElement | null) => void;\r
  redraw: () => void;\r
}\r
\r
const SHAPES: Record<string, number> = { square: 0, circle: 1, diamond: 2 };\r
const DECAYS: Record<string, number> = { fade: 0, shrink: 1, dither: 2 };\r
\r
const identityEase = (x: number) => x;\r
\r
const VERTEX = \`#version 300 es\r
in vec2 a_position;\r
void main() {\r
  gl_Position = vec4(a_position, 0.0, 1.0);\r
}\r
\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform sampler2D u_trail;\r
uniform sampler2D u_image;\r
uniform sampler2D u_age;\r
uniform vec2 u_resolution;\r
uniform float u_gridSize;\r
uniform float u_sigma;\r
uniform vec3 u_color;\r
uniform vec3 u_trailColor;\r
uniform float u_ramp;\r
uniform float u_shine;\r
uniform float u_glow;\r
uniform int u_shape;\r
uniform int u_decay;\r
uniform float u_gap;\r
uniform float u_sparkle;\r
uniform float u_time;\r
uniform float u_hasImage;\r
out vec4 outColor;\r
\r
const float BAYER[16] = float[16](0.0, 8.0, 2.0, 10.0, 12.0, 4.0, 14.0, 6.0, 3.0, 11.0, 1.0, 9.0, 15.0, 7.0, 13.0, 5.0);\r
const vec3 LIGHT = vec3(-0.42, 0.58, 0.7);\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
float erfApprox(float x) {\r
  float s = sign(x);\r
  x = abs(x);\r
  float t = 1.0 / (1.0 + 0.3275911 * x);\r
  float y = 1.0 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * exp(-x * x);\r
  return s * y;\r
}\r
\r
float cellValue(ivec2 c) {\r
  vec2 center = (vec2(c) + 0.5) / u_gridSize;\r
  if (center.x < 0.0 || center.y < 0.0 || center.x > 1.0 || center.y > 1.0) return 0.0;\r
  float t = texelFetch(u_trail, clamp(ivec2(center * 512.0), ivec2(0), ivec2(511)), 0).r;\r
  if (t <= 0.0) return 0.0;\r
  if (u_sparkle > 0.0) {\r
    float n = hash(vec2(c) + floor(u_time * 14.0) * 7.31);\r
    float dim = 1.0 - t;\r
    if (n < u_sparkle * dim * 0.35) t = max(t, 0.85);\r
    else if (n > 1.0 - u_sparkle * dim * 0.5) t = 0.0;\r
  }\r
  if (u_decay == 2 && t * 2.2 <= (BAYER[(c.y & 3) * 4 + (c.x & 3)] + 0.5) / 16.0) return 0.0;\r
  return t;\r
}\r
\r
vec3 baseColor(ivec2 owner, vec2 uv) {\r
  if (u_hasImage > 0.5) return texelFetch(u_image, clamp(owner, ivec2(0), ivec2(textureSize(u_image, 0)) - 1), 0).rgb;\r
  if (u_ramp > 0.5) return mix(u_trailColor, u_color, smoothstep(0.05, 0.95, texture(u_age, uv).r));\r
  return u_color;\r
}\r
\r
vec3 tone(vec3 base, float strength) {\r
  vec3 body = mix(base * 0.55, base, smoothstep(0.3, 0.75, strength));\r
  return mix(body, mix(base, vec3(1.0), 0.22), smoothstep(0.85, 1.0, strength) * u_shine);\r
}\r
\r
float seams(vec2 q, float cs) {\r
  if (u_gap <= 0.0) return 0.0;\r
  vec2 f = fract(q / cs);\r
  float border = min(min(f.x, 1.0 - f.x), min(f.y, 1.0 - f.y)) * cs;\r
  float width = max(1.0, u_gap * cs * 0.5);\r
  return 1.0 - smoothstep(width - 0.75, width + 0.75, border);\r
}\r
\r
vec3 shade(vec3 base, vec3 n) {\r
  vec3 l = normalize(LIGHT);\r
  vec3 h = normalize(l + vec3(0.0, 0.0, 1.0));\r
  float lit = dot(n, l) - l.z;\r
  vec3 color = base * (1.0 + lit * 0.9 * u_shine);\r
  float spec = pow(max(dot(n, h), 0.0), 64.0) * 0.85 + pow(max(dot(n, h), 0.0), 10.0) * 0.08;\r
  color += spec * u_shine * mix(vec3(1.0), base, 0.15) * step(0.001, 1.0 - n.z);\r
  return clamp(color, 0.0, 1.0);\r
}\r
\r
void main() {\r
  float maxRes = max(u_resolution.x, u_resolution.y);\r
  vec2 q = gl_FragCoord.xy - 0.5 * u_resolution + 0.5 * maxRes;\r
  vec2 uv = q / maxRes;\r
  float cs = maxRes / u_gridSize;\r
  ivec2 base = ivec2(floor(q / cs));\r
\r
  float alpha = 0.0;\r
  vec3 color = vec3(0.0);\r
\r
  if (u_sigma > 0.0) {\r
    float inv = 0.70710678 / u_sigma;\r
    float norm = 0.39894228 / u_sigma;\r
    float spread = 0.5 / (u_sigma * u_sigma);\r
    int reach = int(clamp(ceil(3.0 * u_sigma / cs), 1.0, 3.0));\r
    float field = 0.0;\r
    vec2 grad = vec2(0.0);\r
    float best = -1.0;\r
    ivec2 owner = base;\r
    float wx[7];\r
    float gx[7];\r
    float wy[7];\r
    float gy[7];\r
    for (int i = 0; i < 7; i++) {\r
      int offset = i - 3;\r
      if (abs(offset) > reach) continue;\r
      vec2 lo = vec2(base + ivec2(offset)) * cs - q;\r
      vec2 hi = lo + cs;\r
      wx[i] = 0.5 * (erfApprox(hi.x * inv) - erfApprox(lo.x * inv));\r
      wy[i] = 0.5 * (erfApprox(hi.y * inv) - erfApprox(lo.y * inv));\r
      gx[i] = norm * (exp(-lo.x * lo.x * spread) - exp(-hi.x * hi.x * spread));\r
      gy[i] = norm * (exp(-lo.y * lo.y * spread) - exp(-hi.y * hi.y * spread));\r
    }\r
    for (int j = 0; j < 7; j++) {\r
      if (abs(j - 3) > reach) continue;\r
      for (int i = 0; i < 7; i++) {\r
        if (abs(i - 3) > reach) continue;\r
        ivec2 c = base + ivec2(i - 3, j - 3);\r
        float t = cellValue(c);\r
        if (t <= 0.0) continue;\r
        float weight = t * wx[i] * wy[j];\r
        field += weight;\r
        grad += t * vec2(gx[i] * wy[j], wx[i] * gy[j]);\r
        if (weight > best) {\r
          best = weight;\r
          owner = c;\r
        }\r
      }\r
    }\r
    float edge = max(0.0263, length(grad) * 0.6);\r
    alpha = smoothstep(0.5 - edge, 0.5 + edge, field);\r
    if (alpha > 0.0) {\r
      vec3 n = normalize(vec3(-grad * cs * 0.55, 1.0));\r
      float strength = max(cellValue(base), field);\r
      vec3 body = tone(baseColor(owner, uv), strength);\r
      body *= 1.0 - seams(q, cs) * 0.32;\r
      color = shade(body, n);\r
    }\r
  } else {\r
    float t = cellValue(base);\r
    if (t > 0.0) {\r
      float halfSize = 0.5 * (1.0 - u_gap);\r
      float fade = t;\r
      if (u_decay == 1) {\r
        halfSize *= sqrt(clamp(t * 2.5, 0.0, 1.0));\r
        fade = 1.0;\r
      } else if (u_decay == 2) {\r
        fade = 1.0;\r
      }\r
      vec2 local = fract(q / cs) - 0.5;\r
      float d;\r
      vec2 dir;\r
      if (u_shape == 1) {\r
        d = length(local) - halfSize;\r
        dir = normalize(local + 1e-5);\r
      } else if (u_shape == 2) {\r
        d = (abs(local.x) + abs(local.y) - halfSize * 1.2) * 0.7071;\r
        dir = sign(local) * 0.7071;\r
      } else {\r
        vec2 a = abs(local) - halfSize;\r
        d = max(a.x, a.y);\r
        dir = a.x > a.y ? vec2(sign(local.x), 0.0) : vec2(0.0, sign(local.y));\r
      }\r
      float px = 1.0 / cs;\r
      float coverage = clamp(0.5 - d / px, 0.0, 1.0);\r
      alpha = coverage * fade;\r
      if (alpha > 0.0) {\r
        float bevel = smoothstep(-0.16 * (1.0 - u_gap), 0.0, d);\r
        vec3 n = normalize(vec3(dir * bevel * 0.9, 1.0));\r
        color = shade(tone(baseColor(base, uv), t), n);\r
      }\r
    }\r
  }\r
\r
  vec4 pixel = vec4(color * alpha, alpha);\r
  if (u_glow > 0.0) {\r
    float glow = texture(u_trail, uv).r;\r
    float amount = smoothstep(0.0, 0.7, glow) * u_glow * 0.55 * (1.0 - alpha);\r
    vec3 tint = u_hasImage > 0.5 ? texture(u_image, uv).rgb : (u_ramp > 0.5 ? mix(u_trailColor, u_color, 0.5) : u_color);\r
    pixel += vec4(tint * amount, amount);\r
  }\r
  if (pixel.a <= 0.002) discard;\r
  outColor = pixel;\r
}\r
\`;\r
\r
const parseColor = (() => {\r
  let context: CanvasRenderingContext2D | null = null;\r
  return (value: string, fallback: number[]): number[] => {\r
    if (typeof document === 'undefined') return fallback;\r
    if (!context) {\r
      const canvas = document.createElement('canvas');\r
      canvas.width = 1;\r
      canvas.height = 1;\r
      context = canvas.getContext('2d', { willReadFrequently: true });\r
    }\r
    if (!context) return fallback;\r
    context.clearRect(0, 0, 1, 1);\r
    context.fillStyle = '#000';\r
    context.fillStyle = value;\r
    context.fillRect(0, 0, 1, 1);\r
    const [r, g, b] = context.getImageData(0, 0, 1, 1).data;\r
    return [r / 255, g / 255, b / 255];\r
  };\r
})();\r
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
export default function PixelTrail({\r
  gridSize = 40,\r
  trailSize = 0.1,\r
  maxAge = 250,\r
  interpolate = 5,\r
  easingFunction = identityEase,\r
  gooeyFilter = { strength: 2 },\r
  color = '#ffffff',\r
  trailColor,\r
  shape = 'square',\r
  gap = 0.08,\r
  decay = 'fade',\r
  flow = 0,\r
  gravity = 0,\r
  sparkle = 0,\r
  clickBurst = false,\r
  shine = 0.6,\r
  glow = 0.4,\r
  imageSrc,\r
  dpr,\r
  className = '',\r
  style\r
}: PixelTrailProps) {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const engineRef = useRef<Engine | null>(null);\r
  const settingsRef = useRef<Settings>(null as unknown as Settings);\r
\r
  settingsRef.current = {\r
    gridSize: Math.max(1, gridSize),\r
    trailSize: Math.max(0, trailSize),\r
    maxAge: Math.max(1, maxAge),\r
    interpolate,\r
    ease: easingFunction || identityEase,\r
    goo: gooeyFilter ? Math.max(0, gooeyFilter.strength ?? 2) : 0,\r
    color: parseColor(color, [1, 1, 1]),\r
    trailColor: trailColor ? parseColor(trailColor, [1, 1, 1]) : null,\r
    shape: SHAPES[shape] ?? 0,\r
    gap: Math.min(Math.max(gap, 0), 0.9),\r
    decay: DECAYS[decay] ?? 0,\r
    flow: Math.min(Math.max(flow, 0), 1),\r
    gravity: Math.min(Math.max(gravity, -1), 1),\r
    sparkle: Math.min(Math.max(sparkle, 0), 1),\r
    clickBurst,\r
    shine: Math.min(Math.max(shine, 0), 1),\r
    glow: Math.min(Math.max(glow, 0), 1),\r
    dpr\r
  };\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    if (!container || !canvas) return undefined;\r
    const gl = canvas.getContext('webgl2', {\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      powerPreference: 'high-performance'\r
    });\r
    if (!gl) return undefined;\r
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
    const program = gl.createProgram();\r
    if (!vertex || !fragment || !program) return undefined;\r
    gl.attachShader(program, vertex);\r
    gl.attachShader(program, fragment);\r
    gl.linkProgram(program);\r
    gl.deleteShader(vertex);\r
    gl.deleteShader(fragment);\r
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return undefined;\r
    gl.useProgram(program);\r
\r
    const uniforms: Record<string, WebGLUniformLocation | null> = {};\r
    const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
    for (let i = 0; i < uniformCount; i++) {\r
      const info = gl.getActiveUniform(program, i);\r
      if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
    }\r
\r
    const vao = gl.createVertexArray();\r
    const buffer = gl.createBuffer();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const makeTexture = (unit: number) => {\r
      const texture = gl.createTexture();\r
      gl.activeTexture(gl.TEXTURE0 + unit);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));\r
      return texture;\r
    };\r
    const trailTexture = makeTexture(0);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
    const imageTexture = makeTexture(1);\r
    const ageTexture = makeTexture(2);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
    gl.uniform1i(uniforms.u_trail, 0);\r
    gl.uniform1i(uniforms.u_image, 1);\r
    gl.uniform1i(uniforms.u_age, 2);\r
\r
    const trailCanvas = document.createElement('canvas');\r
    trailCanvas.width = TRAIL_SIZE;\r
    trailCanvas.height = TRAIL_SIZE;\r
    const ctx = trailCanvas.getContext('2d');\r
    if (!ctx) return undefined;\r
    ctx.fillStyle = 'black';\r
    ctx.fillRect(0, 0, TRAIL_SIZE, TRAIL_SIZE);\r
\r
    const ageCanvas = document.createElement('canvas');\r
    ageCanvas.width = AGE_SIZE;\r
    ageCanvas.height = AGE_SIZE;\r
    const ageCtx = ageCanvas.getContext('2d');\r
    if (!ageCtx) return undefined;\r
\r
    const state = {\r
      alive: true,\r
      raf: 0,\r
      last: 0,\r
      time: 0,\r
      visible: true,\r
      width: 1,\r
      height: 1,\r
      ratio: 1,\r
      points: [] as TrailPoint[],\r
      force: 0,\r
      image: null as HTMLImageElement | null,\r
      imageReady: false,\r
      imageCells: 0,\r
      imageWidth: 0,\r
      imageHeight: 0,\r
      pointer: { x: 0, y: 0, at: 0, vx: 0, vy: 0, inside: false }\r
    };\r
\r
    const addTouch = (x: number, y: number, vx: number, vy: number) => {\r
      const s = settingsRef.current;\r
      const { points } = state;\r
      const last = points[points.length - 1];\r
      if (last) {\r
        const dx = last.x - x;\r
        const dy = last.y - y;\r
        const dd = dx * dx + dy * dy;\r
        const force = Math.max(0.3, Math.min(dd * 10000, 1));\r
        state.force = force;\r
        if (s.interpolate) {\r
          const lines = Math.ceil(dd / Math.pow((s.trailSize * 0.5) / s.interpolate, 2));\r
          if (lines > 1) {\r
            for (let i = 1; i < lines; i++) {\r
              points.push({ x: last.x - (dx / lines) * i, y: last.y - (dy / lines) * i, age: 0, force, vx, vy });\r
            }\r
          }\r
        }\r
      }\r
      points.push({ x, y, age: 0, force: state.force, vx, vy });\r
    };\r
\r
    const drawTouch = (point: TrailPoint) => {\r
      const s = settingsRef.current;\r
      const x = point.x * TRAIL_SIZE;\r
      const y = (1 - point.y) * TRAIL_SIZE;\r
      let intensity = 1;\r
      if (point.age < s.maxAge * 0.3) {\r
        intensity = s.ease(point.age / (s.maxAge * 0.3));\r
      } else {\r
        intensity = s.ease(1 - (point.age - s.maxAge * 0.3) / (s.maxAge * 0.7));\r
      }\r
      intensity *= point.force;\r
      ctx.globalCompositeOperation = 'screen';\r
      const radius = TRAIL_SIZE * s.trailSize * intensity;\r
      const gradient = ctx.createRadialGradient(x, y, Math.max(0, radius * 0.25), x, y, Math.max(0, radius));\r
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');\r
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.0)');\r
      ctx.beginPath();\r
      ctx.fillStyle = gradient;\r
      ctx.arc(x, y, Math.max(0, radius), 0, Math.PI * 2);\r
      ctx.fill();\r
      if (!s.trailColor || radius <= 0) return;\r
      const scale = AGE_SIZE / TRAIL_SIZE;\r
      const fresh = Math.round(255 * Math.min(Math.max(1 - point.age / s.maxAge, 0), 1));\r
      const glaze = ageCtx.createRadialGradient(x * scale, y * scale, 0, x * scale, y * scale, radius * scale);\r
      glaze.addColorStop(0, \`rgb(\${fresh}, \${fresh}, \${fresh})\`);\r
      glaze.addColorStop(0.75, \`rgb(\${fresh}, \${fresh}, \${fresh})\`);\r
      glaze.addColorStop(1, 'rgba(0, 0, 0, 0)');\r
      ageCtx.globalCompositeOperation = 'lighten';\r
      ageCtx.beginPath();\r
      ageCtx.fillStyle = glaze;\r
      ageCtx.arc(x * scale, y * scale, radius * scale, 0, Math.PI * 2);\r
      ageCtx.fill();\r
    };\r
\r
    const updateTrail = (delta: number) => {\r
      const s = settingsRef.current;\r
      ctx.globalCompositeOperation = 'source-over';\r
      ctx.fillStyle = 'black';\r
      ctx.fillRect(0, 0, TRAIL_SIZE, TRAIL_SIZE);\r
      if (s.trailColor) {\r
        ageCtx.globalCompositeOperation = 'source-over';\r
        ageCtx.fillStyle = 'black';\r
        ageCtx.fillRect(0, 0, AGE_SIZE, AGE_SIZE);\r
      }\r
      state.points.forEach((point, i) => {\r
        point.age += delta * 1000;\r
        if (point.age > s.maxAge) state.points.splice(i, 1);\r
      });\r
      if (!state.points.length) state.force = 0;\r
      if (s.flow > 0 || s.gravity !== 0) {\r
        const drag = Math.exp(-3 * delta);\r
        for (const point of state.points) {\r
          point.vx *= drag;\r
          point.vy = point.vy * drag - s.gravity * 1.6 * delta;\r
          point.x += point.vx * delta;\r
          point.y += point.vy * delta;\r
        }\r
      }\r
      state.points.forEach(drawTouch);\r
    };\r
\r
    const burst = (x: number, y: number) => {\r
      const count = 14;\r
      for (let k = 0; k < count; k++) {\r
        const angle = (k / count) * Math.PI * 2 + Math.random() * 0.3;\r
        const speed = 0.35 + Math.random() * 0.25;\r
        state.points.push({\r
          x,\r
          y,\r
          age: 0,\r
          force: 1,\r
          vx: Math.cos(angle) * speed,\r
          vy: Math.sin(angle) * speed\r
        });\r
      }\r
    };\r
\r
    const uploadImage = () => {\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.bindTexture(gl.TEXTURE_2D, imageTexture);\r
      const image = state.image;\r
      if (!image) {\r
        state.imageReady = false;\r
        return;\r
      }\r
      const s = settingsRef.current;\r
      const cells = Math.max(1, Math.round(s.gridSize));\r
      const sample = document.createElement('canvas');\r
      sample.width = cells;\r
      sample.height = cells;\r
      const sampleCtx = sample.getContext('2d');\r
      if (!sampleCtx) return;\r
      const side = Math.max(state.width, state.height);\r
      const scale = Math.max(state.width / image.naturalWidth, state.height / image.naturalHeight);\r
      const sourceSide = side / scale;\r
      sampleCtx.imageSmoothingQuality = 'high';\r
      sampleCtx.drawImage(\r
        image,\r
        (image.naturalWidth - sourceSide) / 2,\r
        (image.naturalHeight - sourceSide) / 2,\r
        sourceSide,\r
        sourceSide,\r
        0,\r
        0,\r
        cells,\r
        cells\r
      );\r
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sample);\r
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);\r
      state.imageReady = true;\r
      state.imageCells = cells;\r
      state.imageWidth = state.width;\r
      state.imageHeight = state.height;\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const ratio = s.dpr ?? Math.min(window.devicePixelRatio || 1, 2);\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      state.width = width;\r
      state.height = height;\r
      state.ratio = ratio;\r
      const pixelWidth = Math.max(1, Math.floor(width * ratio));\r
      const pixelHeight = Math.max(1, Math.floor(height * ratio));\r
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {\r
        canvas.width = pixelWidth;\r
        canvas.height = pixelHeight;\r
      }\r
      if (\r
        state.image &&\r
        (state.imageCells !== Math.max(1, Math.round(s.gridSize)) ||\r
          state.imageWidth !== width ||\r
          state.imageHeight !== height)\r
      ) {\r
        uploadImage();\r
      }\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, trailTexture);\r
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, trailCanvas);\r
      if (s.trailColor) {\r
        gl.activeTexture(gl.TEXTURE2);\r
        gl.bindTexture(gl.TEXTURE_2D, ageTexture);\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, ageCanvas);\r
      }\r
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);\r
      gl.uniform2f(uniforms.u_resolution, state.width * state.ratio, state.height * state.ratio);\r
      gl.uniform1f(uniforms.u_gridSize, s.gridSize);\r
      gl.uniform3fv(uniforms.u_color, s.color);\r
      gl.uniform3fv(uniforms.u_trailColor, s.trailColor ?? s.color);\r
      gl.uniform1f(uniforms.u_ramp, s.trailColor ? 1 : 0);\r
      gl.uniform1f(uniforms.u_sigma, s.goo * state.ratio);\r
      gl.uniform1f(uniforms.u_shine, s.shine);\r
      gl.uniform1f(uniforms.u_glow, s.glow);\r
      gl.uniform1i(uniforms.u_shape, s.shape);\r
      gl.uniform1i(uniforms.u_decay, s.decay);\r
      gl.uniform1f(uniforms.u_gap, s.gap);\r
      gl.uniform1f(uniforms.u_sparkle, s.sparkle);\r
      gl.uniform1f(uniforms.u_time, state.time);\r
      gl.uniform1f(uniforms.u_hasImage, state.imageReady ? 1 : 0);\r
      gl.bindVertexArray(vao);\r
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);\r
    };\r
\r
    const frame = (now: number) => {\r
      state.raf = 0;\r
      if (!state.alive) return;\r
      const delta = state.last ? (now - state.last) / 1000 : 1 / 60;\r
      state.last = now;\r
      state.time += delta;\r
      resize();\r
      updateTrail(delta);\r
      draw();\r
      if (state.points.length && state.visible) state.raf = requestAnimationFrame(frame);\r
      else state.last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!state.raf && state.alive && state.visible) state.raf = requestAnimationFrame(frame);\r
    };\r
\r
    const toUv = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      const side = Math.max(rect.width, rect.height);\r
      return {\r
        x: (x - rect.width / 2) / side + 0.5,\r
        y: (rect.height / 2 - y) / side + 0.5,\r
        inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height\r
      };\r
    };\r
\r
    const onMove = (event: PointerEvent) => {\r
      const { x, y, inside } = toUv(event);\r
      const pointer = state.pointer;\r
      const now = performance.now();\r
      if (inside) {\r
        const s = settingsRef.current;\r
        const elapsed = Math.max(0.008, (now - pointer.at) / 1000);\r
        if (pointer.inside) {\r
          pointer.vx += ((x - pointer.x) / elapsed - pointer.vx) * 0.5;\r
          pointer.vy += ((y - pointer.y) / elapsed - pointer.vy) * 0.5;\r
        } else {\r
          pointer.vx = 0;\r
          pointer.vy = 0;\r
        }\r
        addTouch(x, y, pointer.vx * s.flow * 0.3, pointer.vy * s.flow * 0.3);\r
        wake();\r
      }\r
      pointer.x = x;\r
      pointer.y = y;\r
      pointer.at = now;\r
      pointer.inside = inside;\r
    };\r
\r
    const onDown = (event: PointerEvent) => {\r
      const { x, y, inside } = toUv(event);\r
      if (!inside || !settingsRef.current.clickBurst) return;\r
      burst(x, y);\r
      wake();\r
    };\r
\r
    const onLeave = () => {\r
      state.pointer.inside = false;\r
    };\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      resize();\r
      draw();\r
    });\r
    resizeObserver.observe(container);\r
\r
    const visibility = new IntersectionObserver(entries => {\r
      state.visible = entries.some(entry => entry.isIntersecting);\r
      if (state.visible) wake();\r
    });\r
    visibility.observe(container);\r
\r
    const onLost = (event: Event) => {\r
      event.preventDefault();\r
      state.alive = false;\r
      cancelAnimationFrame(state.raf);\r
    };\r
\r
    canvas.addEventListener('webglcontextlost', onLost);\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    window.addEventListener('pointerdown', onDown, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onLeave);\r
    window.addEventListener('blur', onLeave);\r
\r
    engineRef.current = {\r
      setImage: (image: HTMLImageElement | null) => {\r
        state.image = image;\r
        uploadImage();\r
        draw();\r
      },\r
      redraw: () => {\r
        resize();\r
        draw();\r
      }\r
    };\r
\r
    resize();\r
    draw();\r
\r
    return () => {\r
      state.alive = false;\r
      cancelAnimationFrame(state.raf);\r
      resizeObserver.disconnect();\r
      visibility.disconnect();\r
      canvas.removeEventListener('webglcontextlost', onLost);\r
      window.removeEventListener('pointermove', onMove);\r
      window.removeEventListener('pointerdown', onDown);\r
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
      window.removeEventListener('blur', onLeave);\r
      engineRef.current = null;\r
      gl.deleteTexture(trailTexture);\r
      gl.deleteTexture(imageTexture);\r
      gl.deleteTexture(ageTexture);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(program);\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    if (!imageSrc) {\r
      engineRef.current?.setImage(null);\r
      return undefined;\r
    }\r
    let active = true;\r
    const image = new Image();\r
    image.crossOrigin = 'anonymous';\r
    image.decoding = 'async';\r
    image.onload = () => {\r
      if (active) engineRef.current?.setImage(image);\r
    };\r
    image.onerror = () => {\r
      if (active) engineRef.current?.setImage(null);\r
    };\r
    image.src = imageSrc;\r
    return () => {\r
      active = false;\r
    };\r
  }, [imageSrc]);\r
\r
  useEffect(() => {\r
    engineRef.current?.redraw();\r
  });\r
\r
  return (\r
    <div\r
      ref={containerRef}\r
      className={\`absolute z-1 \${className}\`.trim()}\r
      style={{\r
        position: 'relative',\r
        width: '100%',\r
        height: '100%',\r
        overflow: 'hidden',\r
        pointerEvents: 'none',\r
        ...style\r
      }}\r
    >\r
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />\r
    </div>\r
  );\r
}\r
`,i={usage:`import PixelTrail from './PixelTrail';

<div style={{ height: '500px', position: 'relative', overflow: 'hidden' }}>
  <PixelTrail
    gridSize={50}
    trailSize={0.1}
    maxAge={500}
    interpolate={5}
    color="#A855F7"
  />
</div>`,code:r,css:n,tailwind:e,tsCode:t,tsTailwind:a};export{i as pixelTrail};
