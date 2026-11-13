const r=`'use client';\r
\r
import { useEffect, useRef, useState } from 'react';\r
import './SplashCursor.css';\r
\r
const QUALITY = {\r
  low: { sim: 64, dye: 512, iterations: 10 },\r
  medium: { sim: 96, dye: 1024, iterations: 16 },\r
  high: { sim: 128, dye: 1440, iterations: 20 }\r
};\r
const BLOOM_RESOLUTION = 256;\r
const BLOOM_ITERATIONS = 4;\r
const BLOOM_THRESHOLD = 0.3;\r
const BLOOM_KNEE = 0.7;\r
\r
const ROOT = 'splash-cursor';\r
const CANVAS = 'splash-cursor__canvas';\r
\r
const VERTEX = \`#version 300 es\r
precision highp float;\r
in vec2 aPosition;\r
uniform vec2 texelSize;\r
out vec2 vUv;\r
out vec2 vL;\r
out vec2 vR;\r
out vec2 vT;\r
out vec2 vB;\r
void main() {\r
  vUv = aPosition * 0.5 + 0.5;\r
  vL = vUv - vec2(texelSize.x, 0.0);\r
  vR = vUv + vec2(texelSize.x, 0.0);\r
  vT = vUv + vec2(0.0, texelSize.y);\r
  vB = vUv - vec2(0.0, texelSize.y);\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const HEADER = \`#version 300 es\r
precision highp float;\r
precision highp sampler2D;\r
in vec2 vUv;\r
in vec2 vL;\r
in vec2 vR;\r
in vec2 vT;\r
in vec2 vB;\r
out vec4 outColor;\r
\`;\r
\r
const SHADERS = {\r
  copy: \`uniform sampler2D uTexture;\r
void main() {\r
  outColor = texture(uTexture, vUv);\r
}\`,\r
  clear: \`uniform sampler2D uTexture;\r
uniform float value;\r
void main() {\r
  outColor = value * texture(uTexture, vUv);\r
}\`,\r
  splat: \`uniform sampler2D uTarget;\r
uniform float aspectRatio;\r
uniform vec3 color;\r
uniform vec2 pointA;\r
uniform vec2 pointB;\r
uniform float radius;\r
void main() {\r
  vec2 scale = vec2(aspectRatio, 1.0);\r
  vec2 pa = (vUv - pointA) * scale;\r
  vec2 ba = (pointB - pointA) * scale;\r
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-9), 0.0, 1.0);\r
  vec2 d = pa - ba * h;\r
  vec3 base = texture(uTarget, vUv).xyz;\r
  outColor = vec4(base + exp(-dot(d, d) / radius) * color, 1.0);\r
}\`,\r
  burst: \`uniform sampler2D uTarget;\r
uniform float aspectRatio;\r
uniform vec2 point;\r
uniform float radius;\r
uniform float strength;\r
uniform float seed;\r
void main() {\r
  vec2 d = (vUv - point) * vec2(aspectRatio, 1.0);\r
  float distance = length(d);\r
  vec2 direction = d / max(distance, 0.00001);\r
  float angle = atan(d.y, d.x);\r
  float petals = 0.78 + 0.22 * sin(angle * 5.0 + seed) * sin(angle * 3.0 - seed * 1.7);\r
  vec2 twist = vec2(-direction.y, direction.x) * 0.3 * sin(angle * 4.0 + seed * 2.3);\r
  float falloff = exp(-dot(d, d) / radius) * distance / sqrt(radius);\r
  outColor = vec4(texture(uTarget, vUv).xy + (direction * petals + twist) * falloff * strength, 0.0, 1.0);\r
}\`,\r
  crown: \`uniform sampler2D uTarget;\r
uniform float aspectRatio;\r
uniform vec2 point;\r
uniform float radius;\r
uniform vec3 colorA;\r
uniform vec3 colorB;\r
uniform float seed;\r
void main() {\r
  vec2 d = (vUv - point) * vec2(aspectRatio, 1.0);\r
  vec3 ink = exp(-dot(d, d) / (radius * 0.45)) * colorA;\r
  for (int i = 0; i < 7; i++) {\r
    float index = float(i);\r
    float angle = seed + index * 0.8975979 + sin(seed * 3.0 + index * 1.9) * 0.35;\r
    float reach = sqrt(radius) * (0.75 + 0.45 * fract(sin(seed * 7.1 + index * 3.7) * 43.7));\r
    float drop = radius * (0.08 + 0.12 * fract(sin(seed * 2.9 + index * 5.3) * 31.9));\r
    vec2 q = d - vec2(cos(angle), sin(angle)) * reach;\r
    ink += exp(-dot(q, q) / drop) * mix(colorA, colorB, fract(index * 0.37 + 0.2));\r
  }\r
  outColor = vec4(texture(uTarget, vUv).xyz + ink, 1.0);\r
}\`,\r
  advection: \`uniform sampler2D uVelocity;\r
uniform sampler2D uSource;\r
uniform vec2 texelSize;\r
uniform float dt;\r
uniform float dissipation;\r
void main() {\r
  vec2 coord = vUv - dt * texture(uVelocity, vUv).xy * texelSize;\r
  outColor = texture(uSource, coord) / (1.0 + dissipation * dt);\r
}\`,\r
  divergence: \`uniform sampler2D uVelocity;\r
void main() {\r
  float L = texture(uVelocity, vL).x;\r
  float R = texture(uVelocity, vR).x;\r
  float T = texture(uVelocity, vT).y;\r
  float B = texture(uVelocity, vB).y;\r
  vec2 C = texture(uVelocity, vUv).xy;\r
  if (vL.x < 0.0) L = -C.x;\r
  if (vR.x > 1.0) R = -C.x;\r
  if (vT.y > 1.0) T = -C.y;\r
  if (vB.y < 0.0) B = -C.y;\r
  outColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);\r
}\`,\r
  curl: \`uniform sampler2D uVelocity;\r
void main() {\r
  float L = texture(uVelocity, vL).y;\r
  float R = texture(uVelocity, vR).y;\r
  float T = texture(uVelocity, vT).x;\r
  float B = texture(uVelocity, vB).x;\r
  outColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);\r
}\`,\r
  vorticity: \`uniform sampler2D uVelocity;\r
uniform sampler2D uCurl;\r
uniform float curl;\r
uniform float dt;\r
void main() {\r
  float L = texture(uCurl, vL).x;\r
  float R = texture(uCurl, vR).x;\r
  float T = texture(uCurl, vT).x;\r
  float B = texture(uCurl, vB).x;\r
  float C = texture(uCurl, vUv).x;\r
  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));\r
  force /= length(force) + 0.0001;\r
  force *= curl * C;\r
  force.y *= -1.0;\r
  vec2 velocity = texture(uVelocity, vUv).xy + force * dt;\r
  outColor = vec4(clamp(velocity, -1000.0, 1000.0), 0.0, 1.0);\r
}\`,\r
  pressure: \`uniform sampler2D uPressure;\r
uniform sampler2D uDivergence;\r
void main() {\r
  float L = texture(uPressure, vL).x;\r
  float R = texture(uPressure, vR).x;\r
  float T = texture(uPressure, vT).x;\r
  float B = texture(uPressure, vB).x;\r
  float divergence = texture(uDivergence, vUv).x;\r
  outColor = vec4((L + R + B + T - divergence) * 0.25, 0.0, 0.0, 1.0);\r
}\`,\r
  gradient: \`uniform sampler2D uPressure;\r
uniform sampler2D uVelocity;\r
void main() {\r
  float L = texture(uPressure, vL).x;\r
  float R = texture(uPressure, vR).x;\r
  float T = texture(uPressure, vT).x;\r
  float B = texture(uPressure, vB).x;\r
  vec2 velocity = texture(uVelocity, vUv).xy - vec2(R - L, T - B);\r
  outColor = vec4(velocity, 0.0, 1.0);\r
}\`,\r
  prefilter: \`uniform sampler2D uTexture;\r
uniform vec3 curve;\r
uniform float threshold;\r
void main() {\r
  vec3 c = texture(uTexture, vUv).rgb;\r
  float br = max(c.r, max(c.g, c.b));\r
  float rq = clamp(br - curve.x, 0.0, curve.y);\r
  rq = curve.z * rq * rq;\r
  c *= max(rq, br - threshold) / max(br, 0.0001);\r
  outColor = vec4(c, 0.0);\r
}\`,\r
  blur: \`uniform sampler2D uTexture;\r
uniform float intensity;\r
void main() {\r
  vec4 sum = texture(uTexture, vL) + texture(uTexture, vR) + texture(uTexture, vT) + texture(uTexture, vB);\r
  outColor = sum * 0.25 * intensity;\r
}\`,\r
  display: \`uniform sampler2D uTexture;\r
uniform sampler2D uBloom;\r
uniform vec2 texelSize;\r
uniform float shading;\r
uniform float bloom;\r
uniform float light;\r
float hash(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * 0.1031);\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.x + q.y) * q.z);\r
}\r
void main() {\r
  vec3 c = texture(uTexture, vUv).rgb;\r
  if (shading > 0.0) {\r
    float dx = length(texture(uTexture, vR).rgb) - length(texture(uTexture, vL).rgb);\r
    float dy = length(texture(uTexture, vT).rgb) - length(texture(uTexture, vB).rgb);\r
    vec3 n = normalize(vec3(dx, dy, length(texelSize)));\r
    c *= mix(1.0, clamp(n.z + 0.7, 0.7, 1.0), shading);\r
  }\r
  if (bloom > 0.0) {\r
    c += max(texture(uBloom, vUv).rgb, 0.0) * bloom;\r
  }\r
  c = max(c, 0.0);\r
  float peak = max(c.r, max(c.g, c.b));\r
  float grain = (hash(gl_FragCoord.xy) - 0.5) / 255.0 * smoothstep(0.0, 0.03, peak);\r
  if (light > 0.5) {\r
    vec3 transmit = exp(-2.4 * c);\r
    float low = min(transmit.r, min(transmit.g, transmit.b));\r
    float alpha = clamp(1.0 - low + grain, 0.0, 1.0);\r
    outColor = vec4(min(transmit - low, vec3(alpha)), alpha);\r
  } else {\r
    c = max(c + grain, 0.0);\r
    float alpha = clamp(max(c.r, max(c.g, c.b)), 0.0, 1.0);\r
    outColor = vec4(min(c, vec3(alpha)), alpha);\r
  }\r
}\`\r
};\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const parseColor = value => {\r
  let hex = String(value).replace('#', '').trim();\r
  if (hex.length === 3) hex = [...hex].map(char => char + char).join('');\r
  const number = parseInt(hex.slice(0, 6), 16);\r
  if (Number.isNaN(number)) return [1, 1, 1];\r
  return [((number >> 16) & 255) / 255, ((number >> 8) & 255) / 255, (number & 255) / 255];\r
};\r
\r
const hsv = (h, s, v) => {\r
  const i = Math.floor(h * 6);\r
  const f = h * 6 - i;\r
  const p = v * (1 - s);\r
  const q = v * (1 - f * s);\r
  const t = v * (1 - (1 - f) * s);\r
  const sector = ((i % 6) + 6) % 6;\r
  if (sector === 0) return [v, t, p];\r
  if (sector === 1) return [q, v, p];\r
  if (sector === 2) return [p, v, t];\r
  if (sector === 3) return [p, q, v];\r
  if (sector === 4) return [t, p, v];\r
  return [v, p, q];\r
};\r
\r
function SplashCursor({\r
  colors = ['#4f8cff', '#2dd4bf', '#ffd166'],\r
  rainbow = true,\r
  colorSpeed = 1,\r
  intensity = 1,\r
  size = 1,\r
  force = 1,\r
  swirl = 3,\r
  trail = 1,\r
  momentum = 1,\r
  shading = 1,\r
  glow = 0,\r
  quality = 'high',\r
  clickSplash = true,\r
  intro = true,\r
  contained = false,\r
  theme = 'dark',\r
  zIndex = 50,\r
  className = '',\r
  style\r
}) {\r
  const rootRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const [generation, setGeneration] = useState(0);\r
\r
  const settings = {\r
    palette: (Array.isArray(colors) && colors.length ? colors : ['#ffffff']).map(parseColor),\r
    rainbow,\r
    colorSpeed: Math.max(0, colorSpeed),\r
    intensity: Math.max(0, intensity),\r
    size: Math.max(0.05, size),\r
    force: Math.max(0, force),\r
    swirl: Math.max(0, swirl),\r
    trail: Math.max(0.05, trail),\r
    momentum: Math.max(0.05, momentum),\r
    shading: clamp(shading, 0, 1),\r
    glow: clamp(glow, 0, 1),\r
    quality: QUALITY[quality] ? quality : 'high',\r
    clickSplash,\r
    contained,\r
    light: theme === 'light'\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
  const introRef = useRef(intro);\r
\r
  useEffect(() => {\r
    const parent = rootRef.current?.parentElement;\r
    if (!contained || !parent || getComputedStyle(parent).position !== 'static') return undefined;\r
    const previous = parent.style.position;\r
    parent.style.position = 'relative';\r
    return () => {\r
      parent.style.position = previous;\r
    };\r
  }, [contained]);\r
\r
  useEffect(() => {\r
    const canvas = canvasRef.current;\r
    if (!canvas) return undefined;\r
    const gl = canvas.getContext('webgl2', {\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false,\r
      preserveDrawingBuffer: false\r
    });\r
    if (!gl) return undefined;\r
    gl.getExtension('EXT_color_buffer_float');\r
    gl.getExtension('EXT_color_buffer_half_float');\r
\r
    const renderable = (internal, format) => {\r
      const texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, internal, 4, 4, 0, format, gl.HALF_FLOAT, null);\r
      const fbo = gl.createFramebuffer();\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
      const complete = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.deleteFramebuffer(fbo);\r
      gl.deleteTexture(texture);\r
      return complete;\r
    };\r
    const rgba = { internal: gl.RGBA16F, format: gl.RGBA };\r
    if (!renderable(rgba.internal, rgba.format)) return undefined;\r
    const rg = renderable(gl.RG16F, gl.RG) ? { internal: gl.RG16F, format: gl.RG } : rgba;\r
    const r = renderable(gl.R16F, gl.RED) ? { internal: gl.R16F, format: gl.RED } : rg;\r
\r
    const compile = (type, source) => {\r
      const shader = gl.createShader(type);\r
      gl.shaderSource(shader, source);\r
      gl.compileShader(shader);\r
      return shader;\r
    };\r
    const vertex = compile(gl.VERTEX_SHADER, VERTEX);\r
    const programs = {};\r
    let broken = false;\r
    Object.entries(SHADERS).forEach(([name, body]) => {\r
      const fragment = compile(gl.FRAGMENT_SHADER, HEADER + body);\r
      const program = gl.createProgram();\r
      gl.attachShader(program, vertex);\r
      gl.attachShader(program, fragment);\r
      gl.bindAttribLocation(program, 0, 'aPosition');\r
      gl.linkProgram(program);\r
      gl.deleteShader(fragment);\r
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) broken = true;\r
      const uniforms = {};\r
      const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
      for (let i = 0; i < count; i++) {\r
        const info = gl.getActiveUniform(program, i);\r
        if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
      }\r
      programs[name] = { program, uniforms };\r
    });\r
    gl.deleteShader(vertex);\r
\r
    const buffer = gl.createBuffer();\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const targets = new Set();\r
    let disposed = false;\r
    let lost = false;\r
\r
    const release = () => {\r
      if (gl.isContextLost()) return;\r
      targets.forEach(target => {\r
        gl.deleteFramebuffer(target.fbo);\r
        gl.deleteTexture(target.texture);\r
      });\r
      targets.clear();\r
      Object.values(programs).forEach(item => gl.deleteProgram(item.program));\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
    };\r
\r
    if (broken) {\r
      release();\r
      return undefined;\r
    }\r
\r
    const use = name => {\r
      const item = programs[name];\r
      gl.useProgram(item.program);\r
      return item.uniforms;\r
    };\r
\r
    const blit = target => {\r
      if (target) {\r
        gl.viewport(0, 0, target.width, target.height);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);\r
      } else {\r
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      }\r
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);\r
    };\r
\r
    const createTarget = (width, height, format, filter) => {\r
      gl.activeTexture(gl.TEXTURE0);\r
      const texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, format.internal, width, height, 0, format.format, gl.HALF_FLOAT, null);\r
      const fbo = gl.createFramebuffer();\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
      gl.viewport(0, 0, width, height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      const target = {\r
        texture,\r
        fbo,\r
        width,\r
        height,\r
        texelX: 1 / width,\r
        texelY: 1 / height,\r
        attach: unit => {\r
          gl.activeTexture(gl.TEXTURE0 + unit);\r
          gl.bindTexture(gl.TEXTURE_2D, texture);\r
          return unit;\r
        }\r
      };\r
      targets.add(target);\r
      return target;\r
    };\r
\r
    const destroyTarget = target => {\r
      if (!target) return;\r
      gl.deleteFramebuffer(target.fbo);\r
      gl.deleteTexture(target.texture);\r
      targets.delete(target);\r
    };\r
\r
    const reshape = (target, width, height, format) => {\r
      gl.bindTexture(gl.TEXTURE_2D, target.texture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, format.internal, width, height, 0, format.format, gl.HALF_FLOAT, null);\r
      target.width = width;\r
      target.height = height;\r
      target.texelX = 1 / width;\r
      target.texelY = 1 / height;\r
    };\r
\r
    const createDouble = (width, height, format, filter) => {\r
      const pair = {\r
        read: createTarget(width, height, format, filter),\r
        write: createTarget(width, height, format, filter),\r
        width,\r
        height,\r
        texelX: 1 / width,\r
        texelY: 1 / height,\r
        swap: () => {\r
          const current = pair.read;\r
          pair.read = pair.write;\r
          pair.write = current;\r
        }\r
      };\r
      return pair;\r
    };\r
\r
    const resizeDouble = (pair, width, height, format, filter, keep) => {\r
      if (keep) {\r
        const next = createTarget(width, height, format, filter);\r
        const u = use('copy');\r
        gl.uniform1i(u.uTexture, pair.read.attach(0));\r
        blit(next);\r
        destroyTarget(pair.read);\r
        pair.read = next;\r
      } else {\r
        reshape(pair.read, width, height, format);\r
      }\r
      reshape(pair.write, width, height, format);\r
      pair.width = width;\r
      pair.height = height;\r
      pair.texelX = 1 / width;\r
      pair.texelY = 1 / height;\r
    };\r
\r
    const resolution = base => {\r
      const width = gl.drawingBufferWidth;\r
      const height = gl.drawingBufferHeight;\r
      const aspect = Math.max(width, height) / Math.max(1, Math.min(width, height));\r
      const short = Math.round(base);\r
      const long = Math.round(base * aspect);\r
      return width > height ? { width: long, height: short } : { width: short, height: long };\r
    };\r
\r
    const fit = () => {\r
      const ratio = Math.min(window.devicePixelRatio || 1, 2);\r
      const width = Math.max(1, Math.floor(canvas.clientWidth * ratio));\r
      const height = Math.max(1, Math.floor(canvas.clientHeight * ratio));\r
      if (canvas.width === width && canvas.height === height) return;\r
      canvas.width = width;\r
      canvas.height = height;\r
    };\r
\r
    const sizes = () => {\r
      const q = QUALITY[settingsRef.current.quality];\r
      const shortSide = Math.min(gl.drawingBufferWidth, gl.drawingBufferHeight);\r
      return { sim: resolution(q.sim), ink: resolution(Math.max(q.sim, Math.min(q.dye, shortSide))) };\r
    };\r
\r
    fit();\r
    const initial = sizes();\r
    const dye = createDouble(initial.ink.width, initial.ink.height, rgba, gl.LINEAR);\r
    const velocity = createDouble(initial.sim.width, initial.sim.height, rg, gl.LINEAR);\r
    const pressure = createDouble(initial.sim.width, initial.sim.height, r, gl.NEAREST);\r
    const divergence = createTarget(initial.sim.width, initial.sim.height, r, gl.NEAREST);\r
    const curl = createTarget(initial.sim.width, initial.sim.height, r, gl.NEAREST);\r
    let bloom = null;\r
    let bloomChain = [];\r
\r
    const dropBloom = () => {\r
      destroyTarget(bloom);\r
      bloomChain.forEach(destroyTarget);\r
      bloom = null;\r
      bloomChain = [];\r
    };\r
\r
    const ensureBloom = () => {\r
      if (bloom) return bloom;\r
      const size = resolution(BLOOM_RESOLUTION);\r
      const created = createTarget(size.width, size.height, rgba, gl.LINEAR);\r
      for (let i = 0; i < BLOOM_ITERATIONS; i++) {\r
        const width = size.width >> (i + 1);\r
        const height = size.height >> (i + 1);\r
        if (width < 2 || height < 2) break;\r
        bloomChain.push(createTarget(width, height, rgba, gl.LINEAR));\r
      }\r
      bloom = created;\r
      return created;\r
    };\r
\r
    const resize = () => {\r
      fit();\r
      const next = sizes();\r
      if (dye.width !== next.ink.width || dye.height !== next.ink.height) {\r
        resizeDouble(dye, next.ink.width, next.ink.height, rgba, gl.LINEAR, true);\r
      }\r
      if (velocity.width !== next.sim.width || velocity.height !== next.sim.height) {\r
        resizeDouble(velocity, next.sim.width, next.sim.height, rg, gl.LINEAR, true);\r
        resizeDouble(pressure, next.sim.width, next.sim.height, r, gl.NEAREST, false);\r
        reshape(divergence, next.sim.width, next.sim.height, r);\r
        reshape(curl, next.sim.width, next.sim.height, r);\r
      }\r
      const glowSize = resolution(BLOOM_RESOLUTION);\r
      if (bloom && (bloom.width !== glowSize.width || bloom.height !== glowSize.height)) dropBloom();\r
    };\r
\r
    const radiusFor = scale => {\r
      const aspect = canvas.width / canvas.height;\r
      return ((0.2 * settingsRef.current.size * scale) / 100) * (aspect > 1 ? aspect : 1);\r
    };\r
\r
    const splat = (ax, ay, bx, by, vx, vy, color, radius) => {\r
      const u = use('splat');\r
      gl.uniform1i(u.uTarget, velocity.read.attach(0));\r
      gl.uniform1f(u.aspectRatio, canvas.width / canvas.height);\r
      gl.uniform2f(u.pointA, ax, ay);\r
      gl.uniform2f(u.pointB, bx, by);\r
      gl.uniform3f(u.color, vx, vy, 0);\r
      gl.uniform1f(u.radius, radius);\r
      blit(velocity.write);\r
      velocity.swap();\r
      gl.uniform1i(u.uTarget, dye.read.attach(0));\r
      gl.uniform3f(u.color, color[0], color[1], color[2]);\r
      blit(dye.write);\r
      dye.swap();\r
    };\r
\r
    const colorAt = (offset, now) => {\r
      const s = settingsRef.current;\r
      const phase = (((offset + (now / 1000) * s.colorSpeed * 0.6) % 1) + 1) % 1;\r
      if (s.rainbow) return hsv(phase, 1, 1);\r
      const palette = s.palette;\r
      if (palette.length === 1) return palette[0];\r
      const position = phase * palette.length;\r
      const from = palette[Math.floor(position) % palette.length];\r
      const to = palette[(Math.floor(position) + 1) % palette.length];\r
      const t = position - Math.floor(position);\r
      const blend = t * t * (3 - 2 * t);\r
      return [\r
        from[0] + (to[0] - from[0]) * blend,\r
        from[1] + (to[1] - from[1]) * blend,\r
        from[2] + (to[2] - from[2]) * blend\r
      ];\r
    };\r
\r
    const inkFor = (color, amount) =>\r
      color.map(channel => (settingsRef.current.light ? 1 - channel : channel) * amount);\r
\r
    const flush = (pointer, dt, now) => {\r
      const s = settingsRef.current;\r
      const aspect = canvas.width / canvas.height;\r
      const length = Math.hypot((pointer.x - pointer.px) * aspect, pointer.y - pointer.py);\r
      if (length > 0.35) {\r
        pointer.px = pointer.x;\r
        pointer.py = pointer.y;\r
        return;\r
      }\r
      let dx = pointer.x - pointer.px;\r
      let dy = pointer.y - pointer.py;\r
      if (aspect < 1) dx *= aspect;\r
      else dy /= aspect;\r
      const radius = radiusFor(1);\r
      const spread = 1 + length / (1.77 * Math.sqrt(radius));\r
      const push = (6000 * s.force) / Math.sqrt(spread);\r
      const amount = (0.15 * s.intensity * Math.min(dt * 60, 1)) / Math.sqrt(spread);\r
      const color = inkFor(colorAt(pointer.offset, now), amount);\r
      splat(pointer.px, pointer.py, pointer.x, pointer.y, dx * push, dy * push, color, radius);\r
      pointer.px = pointer.x;\r
      pointer.py = pointer.y;\r
    };\r
\r
    const burst = (x, y, now) => {\r
      const s = settingsRef.current;\r
      const seed = Math.random() * Math.PI * 2;\r
      const aspect = canvas.width / canvas.height;\r
      let u = use('burst');\r
      gl.uniform1i(u.uTarget, velocity.read.attach(0));\r
      gl.uniform1f(u.aspectRatio, aspect);\r
      gl.uniform2f(u.point, x, y);\r
      gl.uniform1f(u.radius, radiusFor(3));\r
      gl.uniform1f(u.strength, 1100 * s.force);\r
      gl.uniform1f(u.seed, seed);\r
      blit(velocity.write);\r
      velocity.swap();\r
      const offset = Math.random();\r
      const amount = 1.6 * s.intensity;\r
      const first = inkFor(colorAt(offset, now), amount);\r
      const second = inkFor(colorAt(offset + 0.3, now), amount);\r
      u = use('crown');\r
      gl.uniform1i(u.uTarget, dye.read.attach(0));\r
      gl.uniform1f(u.aspectRatio, aspect);\r
      gl.uniform2f(u.point, x, y);\r
      gl.uniform1f(u.radius, radiusFor(1.6));\r
      gl.uniform3f(u.colorA, first[0], first[1], first[2]);\r
      gl.uniform3f(u.colorB, second[0], second[1], second[2]);\r
      gl.uniform1f(u.seed, seed);\r
      blit(dye.write);\r
      dye.swap();\r
    };\r
\r
    const step = dt => {\r
      const s = settingsRef.current;\r
      const iterations = QUALITY[s.quality].iterations;\r
      gl.disable(gl.BLEND);\r
\r
      let u = use('curl');\r
      gl.uniform2f(u.texelSize, velocity.texelX, velocity.texelY);\r
      gl.uniform1i(u.uVelocity, velocity.read.attach(0));\r
      blit(curl);\r
\r
      u = use('vorticity');\r
      gl.uniform2f(u.texelSize, velocity.texelX, velocity.texelY);\r
      gl.uniform1i(u.uVelocity, velocity.read.attach(0));\r
      gl.uniform1i(u.uCurl, curl.attach(1));\r
      gl.uniform1f(u.curl, s.swirl);\r
      gl.uniform1f(u.dt, dt);\r
      blit(velocity.write);\r
      velocity.swap();\r
\r
      u = use('divergence');\r
      gl.uniform2f(u.texelSize, velocity.texelX, velocity.texelY);\r
      gl.uniform1i(u.uVelocity, velocity.read.attach(0));\r
      blit(divergence);\r
\r
      u = use('clear');\r
      gl.uniform1i(u.uTexture, pressure.read.attach(0));\r
      gl.uniform1f(u.value, 0.1);\r
      blit(pressure.write);\r
      pressure.swap();\r
\r
      u = use('pressure');\r
      gl.uniform2f(u.texelSize, velocity.texelX, velocity.texelY);\r
      gl.uniform1i(u.uDivergence, divergence.attach(0));\r
      for (let i = 0; i < iterations; i++) {\r
        gl.uniform1i(u.uPressure, pressure.read.attach(1));\r
        blit(pressure.write);\r
        pressure.swap();\r
      }\r
\r
      u = use('gradient');\r
      gl.uniform2f(u.texelSize, velocity.texelX, velocity.texelY);\r
      gl.uniform1i(u.uPressure, pressure.read.attach(0));\r
      gl.uniform1i(u.uVelocity, velocity.read.attach(1));\r
      blit(velocity.write);\r
      velocity.swap();\r
\r
      u = use('advection');\r
      gl.uniform2f(u.texelSize, velocity.texelX, velocity.texelY);\r
      gl.uniform1i(u.uVelocity, velocity.read.attach(0));\r
      gl.uniform1i(u.uSource, velocity.read.attach(0));\r
      gl.uniform1f(u.dt, dt);\r
      gl.uniform1f(u.dissipation, 2 / s.momentum);\r
      blit(velocity.write);\r
      velocity.swap();\r
\r
      gl.uniform1i(u.uVelocity, velocity.read.attach(0));\r
      gl.uniform1i(u.uSource, dye.read.attach(1));\r
      gl.uniform1f(u.dissipation, 3.5 / s.trail);\r
      blit(dye.write);\r
      dye.swap();\r
    };\r
\r
    const applyBloom = amount => {\r
      const base = ensureBloom();\r
      if (!bloomChain.length) return;\r
      gl.disable(gl.BLEND);\r
      let u = use('prefilter');\r
      const knee = BLOOM_THRESHOLD * BLOOM_KNEE + 0.0001;\r
      gl.uniform3f(u.curve, BLOOM_THRESHOLD - knee, knee * 2, 0.25 / knee);\r
      gl.uniform1f(u.threshold, BLOOM_THRESHOLD);\r
      gl.uniform1i(u.uTexture, dye.read.attach(0));\r
      blit(base);\r
      u = use('blur');\r
      gl.uniform1f(u.intensity, 1);\r
      let last = base;\r
      bloomChain.forEach(target => {\r
        gl.uniform2f(u.texelSize, last.texelX, last.texelY);\r
        gl.uniform1i(u.uTexture, last.attach(0));\r
        blit(target);\r
        last = target;\r
      });\r
      gl.blendFunc(gl.ONE, gl.ONE);\r
      gl.enable(gl.BLEND);\r
      for (let i = bloomChain.length - 2; i >= 0; i--) {\r
        const target = bloomChain[i];\r
        gl.uniform2f(u.texelSize, last.texelX, last.texelY);\r
        gl.uniform1i(u.uTexture, last.attach(0));\r
        blit(target);\r
        last = target;\r
      }\r
      gl.disable(gl.BLEND);\r
      gl.uniform1f(u.intensity, amount);\r
      gl.uniform2f(u.texelSize, last.texelX, last.texelY);\r
      gl.uniform1i(u.uTexture, last.attach(0));\r
      blit(base);\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      if (s.glow > 0) applyBloom(2 * s.glow);\r
      gl.disable(gl.BLEND);\r
      const u = use('display');\r
      gl.uniform2f(u.texelSize, 1 / gl.drawingBufferWidth, 1 / gl.drawingBufferHeight);\r
      gl.uniform1i(u.uTexture, dye.read.attach(0));\r
      gl.uniform1i(u.uBloom, (bloom ?? dye.read).attach(1));\r
      gl.uniform1f(u.shading, s.shading);\r
      gl.uniform1f(u.bloom, s.glow > 0 ? 1 : 0);\r
      gl.uniform1f(u.light, s.light ? 1 : 0);\r
      blit(null);\r
    };\r
\r
    const clearScreen = () => {\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
    };\r
\r
    const pointers = new Map();\r
    const bursts = [];\r
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const introPointer = { x: 0, y: 0, px: 0, py: 0, ready: false, moved: false, offset: Math.random() };\r
    let introStart = introRef.current && !reduced ? performance.now() + 150 : -1;\r
    let raf = 0;\r
    let last = 0;\r
    let lastActivity = performance.now();\r
\r
    const advanceIntro = now => {\r
      if (introStart < 0) return;\r
      const progress = (now - introStart) / 1100;\r
      if (progress < 0) return;\r
      const t = Math.min(progress, 1);\r
      const eased = t * t * (3 - 2 * t);\r
      const x = 0.2 + 0.6 * eased;\r
      const y = 0.5 + 0.12 * Math.sin(eased * Math.PI * 2);\r
      if (!introPointer.ready) {\r
        introPointer.x = introPointer.px = x;\r
        introPointer.y = introPointer.py = y;\r
        introPointer.ready = true;\r
      } else {\r
        introPointer.x = x;\r
        introPointer.y = y;\r
        introPointer.moved = true;\r
      }\r
      if (t >= 1) introStart = -1;\r
      lastActivity = now;\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (disposed || lost) return;\r
      const s = settingsRef.current;\r
      const dt = clamp((now - last) / 1000, 0, 1 / 60);\r
      last = now;\r
      resize();\r
      advanceIntro(now);\r
      if (introPointer.moved) {\r
        introPointer.moved = false;\r
        flush(introPointer, dt, now);\r
      }\r
      pointers.forEach(pointer => {\r
        if (!pointer.moved) return;\r
        pointer.moved = false;\r
        flush(pointer, dt, now);\r
      });\r
      bursts.splice(0).forEach(point => burst(point.x, point.y, now));\r
      step(dt);\r
      render();\r
      const quiet = (2.2 * s.trail + 0.4) * 1000;\r
      if (introStart >= 0 || now - lastActivity < quiet) raf = requestAnimationFrame(frame);\r
      else clearScreen();\r
    };\r
\r
    const wake = () => {\r
      lastActivity = performance.now();\r
      if (raf || disposed || lost) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const locate = (clientX, clientY) => {\r
      const rect = canvas.getBoundingClientRect();\r
      if (!rect.width || !rect.height) return null;\r
      const x = (clientX - rect.left) / rect.width;\r
      const y = 1 - (clientY - rect.top) / rect.height;\r
      if (settingsRef.current.contained && (x < 0 || x > 1 || y < 0 || y > 1)) return null;\r
      return { x, y };\r
    };\r
\r
    const track = (id, clientX, clientY) => {\r
      const point = locate(clientX, clientY);\r
      let pointer = pointers.get(id);\r
      if (!point) {\r
        if (pointer) pointer.ready = false;\r
        return;\r
      }\r
      if (!pointer) {\r
        pointer = { x: 0, y: 0, px: 0, py: 0, ready: false, moved: false, offset: Math.random() };\r
        pointers.set(id, pointer);\r
      }\r
      if (!pointer.ready) {\r
        pointer.x = pointer.px = point.x;\r
        pointer.y = pointer.py = point.y;\r
        pointer.ready = true;\r
        return;\r
      }\r
      pointer.x = point.x;\r
      pointer.y = point.y;\r
      pointer.moved = true;\r
      wake();\r
    };\r
\r
    const press = (clientX, clientY) => {\r
      if (!settingsRef.current.clickSplash) return;\r
      const point = locate(clientX, clientY);\r
      if (!point) return;\r
      bursts.push(point);\r
      wake();\r
    };\r
\r
    const onPointerMove = event => {\r
      if (event.pointerType !== 'touch') track(\`p\${event.pointerId}\`, event.clientX, event.clientY);\r
    };\r
    const onPointerDown = event => {\r
      if (event.pointerType !== 'touch') press(event.clientX, event.clientY);\r
    };\r
    const onTouchStart = event => {\r
      Array.from(event.changedTouches).forEach(touch => {\r
        pointers.delete(\`t\${touch.identifier}\`);\r
        track(\`t\${touch.identifier}\`, touch.clientX, touch.clientY);\r
        press(touch.clientX, touch.clientY);\r
      });\r
    };\r
    const onTouchMove = event => {\r
      Array.from(event.changedTouches).forEach(touch => track(\`t\${touch.identifier}\`, touch.clientX, touch.clientY));\r
    };\r
    const onTouchEnd = event => {\r
      Array.from(event.changedTouches).forEach(touch => pointers.delete(\`t\${touch.identifier}\`));\r
    };\r
    const onLeave = () => {\r
      pointers.forEach(pointer => {\r
        pointer.ready = false;\r
      });\r
    };\r
    const onLost = event => {\r
      event.preventDefault();\r
      lost = true;\r
      cancelAnimationFrame(raf);\r
      raf = 0;\r
    };\r
    const onRestored = () => setGeneration(value => value + 1);\r
\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    window.addEventListener('touchstart', onTouchStart, { passive: true });\r
    window.addEventListener('touchmove', onTouchMove, { passive: true });\r
    window.addEventListener('touchend', onTouchEnd, { passive: true });\r
    window.addEventListener('touchcancel', onTouchEnd, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onLeave);\r
    canvas.addEventListener('webglcontextlost', onLost);\r
    canvas.addEventListener('webglcontextrestored', onRestored);\r
\r
    resize();\r
    if (introStart >= 0) wake();\r
\r
    return () => {\r
      disposed = true;\r
      cancelAnimationFrame(raf);\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('touchstart', onTouchStart);\r
      window.removeEventListener('touchmove', onTouchMove);\r
      window.removeEventListener('touchend', onTouchEnd);\r
      window.removeEventListener('touchcancel', onTouchEnd);\r
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
      canvas.removeEventListener('webglcontextlost', onLost);\r
      canvas.removeEventListener('webglcontextrestored', onRestored);\r
      release();\r
    };\r
  }, [generation]);\r
\r
  return (\r
    <div\r
      ref={rootRef}\r
      className={[ROOT, className].filter(Boolean).join(' ')}\r
      style={{ zIndex, ...style }}\r
      data-contained={contained ? '' : undefined}\r
      aria-hidden="true"\r
    >\r
      <canvas ref={canvasRef} className={CANVAS} />\r
    </div>\r
  );\r
}\r
\r
export default SplashCursor;\r
`,n=`.splash-cursor {\r
  position: fixed;\r
  inset: 0;\r
  pointer-events: none;\r
}\r
\r
.splash-cursor[data-contained] {\r
  position: absolute;\r
}\r
\r
.splash-cursor__canvas {\r
  display: block;\r
  width: 100%;\r
  height: 100%;\r
}\r
`,e=`'use client';\r
\r
import { useEffect, useRef, useState } from 'react';\r
\r
const QUALITY = {\r
  low: { sim: 64, dye: 512, iterations: 10 },\r
  medium: { sim: 96, dye: 1024, iterations: 16 },\r
  high: { sim: 128, dye: 1440, iterations: 20 }\r
};\r
const BLOOM_RESOLUTION = 256;\r
const BLOOM_ITERATIONS = 4;\r
const BLOOM_THRESHOLD = 0.3;\r
const BLOOM_KNEE = 0.7;\r
\r
const ROOT = 'pointer-events-none fixed inset-0 data-[contained]:absolute';\r
const CANVAS = 'block h-full w-full';\r
\r
const VERTEX = \`#version 300 es\r
precision highp float;\r
in vec2 aPosition;\r
uniform vec2 texelSize;\r
out vec2 vUv;\r
out vec2 vL;\r
out vec2 vR;\r
out vec2 vT;\r
out vec2 vB;\r
void main() {\r
  vUv = aPosition * 0.5 + 0.5;\r
  vL = vUv - vec2(texelSize.x, 0.0);\r
  vR = vUv + vec2(texelSize.x, 0.0);\r
  vT = vUv + vec2(0.0, texelSize.y);\r
  vB = vUv - vec2(0.0, texelSize.y);\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const HEADER = \`#version 300 es\r
precision highp float;\r
precision highp sampler2D;\r
in vec2 vUv;\r
in vec2 vL;\r
in vec2 vR;\r
in vec2 vT;\r
in vec2 vB;\r
out vec4 outColor;\r
\`;\r
\r
const SHADERS = {\r
  copy: \`uniform sampler2D uTexture;\r
void main() {\r
  outColor = texture(uTexture, vUv);\r
}\`,\r
  clear: \`uniform sampler2D uTexture;\r
uniform float value;\r
void main() {\r
  outColor = value * texture(uTexture, vUv);\r
}\`,\r
  splat: \`uniform sampler2D uTarget;\r
uniform float aspectRatio;\r
uniform vec3 color;\r
uniform vec2 pointA;\r
uniform vec2 pointB;\r
uniform float radius;\r
void main() {\r
  vec2 scale = vec2(aspectRatio, 1.0);\r
  vec2 pa = (vUv - pointA) * scale;\r
  vec2 ba = (pointB - pointA) * scale;\r
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-9), 0.0, 1.0);\r
  vec2 d = pa - ba * h;\r
  vec3 base = texture(uTarget, vUv).xyz;\r
  outColor = vec4(base + exp(-dot(d, d) / radius) * color, 1.0);\r
}\`,\r
  burst: \`uniform sampler2D uTarget;\r
uniform float aspectRatio;\r
uniform vec2 point;\r
uniform float radius;\r
uniform float strength;\r
uniform float seed;\r
void main() {\r
  vec2 d = (vUv - point) * vec2(aspectRatio, 1.0);\r
  float distance = length(d);\r
  vec2 direction = d / max(distance, 0.00001);\r
  float angle = atan(d.y, d.x);\r
  float petals = 0.78 + 0.22 * sin(angle * 5.0 + seed) * sin(angle * 3.0 - seed * 1.7);\r
  vec2 twist = vec2(-direction.y, direction.x) * 0.3 * sin(angle * 4.0 + seed * 2.3);\r
  float falloff = exp(-dot(d, d) / radius) * distance / sqrt(radius);\r
  outColor = vec4(texture(uTarget, vUv).xy + (direction * petals + twist) * falloff * strength, 0.0, 1.0);\r
}\`,\r
  crown: \`uniform sampler2D uTarget;\r
uniform float aspectRatio;\r
uniform vec2 point;\r
uniform float radius;\r
uniform vec3 colorA;\r
uniform vec3 colorB;\r
uniform float seed;\r
void main() {\r
  vec2 d = (vUv - point) * vec2(aspectRatio, 1.0);\r
  vec3 ink = exp(-dot(d, d) / (radius * 0.45)) * colorA;\r
  for (int i = 0; i < 7; i++) {\r
    float index = float(i);\r
    float angle = seed + index * 0.8975979 + sin(seed * 3.0 + index * 1.9) * 0.35;\r
    float reach = sqrt(radius) * (0.75 + 0.45 * fract(sin(seed * 7.1 + index * 3.7) * 43.7));\r
    float drop = radius * (0.08 + 0.12 * fract(sin(seed * 2.9 + index * 5.3) * 31.9));\r
    vec2 q = d - vec2(cos(angle), sin(angle)) * reach;\r
    ink += exp(-dot(q, q) / drop) * mix(colorA, colorB, fract(index * 0.37 + 0.2));\r
  }\r
  outColor = vec4(texture(uTarget, vUv).xyz + ink, 1.0);\r
}\`,\r
  advection: \`uniform sampler2D uVelocity;\r
uniform sampler2D uSource;\r
uniform vec2 texelSize;\r
uniform float dt;\r
uniform float dissipation;\r
void main() {\r
  vec2 coord = vUv - dt * texture(uVelocity, vUv).xy * texelSize;\r
  outColor = texture(uSource, coord) / (1.0 + dissipation * dt);\r
}\`,\r
  divergence: \`uniform sampler2D uVelocity;\r
void main() {\r
  float L = texture(uVelocity, vL).x;\r
  float R = texture(uVelocity, vR).x;\r
  float T = texture(uVelocity, vT).y;\r
  float B = texture(uVelocity, vB).y;\r
  vec2 C = texture(uVelocity, vUv).xy;\r
  if (vL.x < 0.0) L = -C.x;\r
  if (vR.x > 1.0) R = -C.x;\r
  if (vT.y > 1.0) T = -C.y;\r
  if (vB.y < 0.0) B = -C.y;\r
  outColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);\r
}\`,\r
  curl: \`uniform sampler2D uVelocity;\r
void main() {\r
  float L = texture(uVelocity, vL).y;\r
  float R = texture(uVelocity, vR).y;\r
  float T = texture(uVelocity, vT).x;\r
  float B = texture(uVelocity, vB).x;\r
  outColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);\r
}\`,\r
  vorticity: \`uniform sampler2D uVelocity;\r
uniform sampler2D uCurl;\r
uniform float curl;\r
uniform float dt;\r
void main() {\r
  float L = texture(uCurl, vL).x;\r
  float R = texture(uCurl, vR).x;\r
  float T = texture(uCurl, vT).x;\r
  float B = texture(uCurl, vB).x;\r
  float C = texture(uCurl, vUv).x;\r
  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));\r
  force /= length(force) + 0.0001;\r
  force *= curl * C;\r
  force.y *= -1.0;\r
  vec2 velocity = texture(uVelocity, vUv).xy + force * dt;\r
  outColor = vec4(clamp(velocity, -1000.0, 1000.0), 0.0, 1.0);\r
}\`,\r
  pressure: \`uniform sampler2D uPressure;\r
uniform sampler2D uDivergence;\r
void main() {\r
  float L = texture(uPressure, vL).x;\r
  float R = texture(uPressure, vR).x;\r
  float T = texture(uPressure, vT).x;\r
  float B = texture(uPressure, vB).x;\r
  float divergence = texture(uDivergence, vUv).x;\r
  outColor = vec4((L + R + B + T - divergence) * 0.25, 0.0, 0.0, 1.0);\r
}\`,\r
  gradient: \`uniform sampler2D uPressure;\r
uniform sampler2D uVelocity;\r
void main() {\r
  float L = texture(uPressure, vL).x;\r
  float R = texture(uPressure, vR).x;\r
  float T = texture(uPressure, vT).x;\r
  float B = texture(uPressure, vB).x;\r
  vec2 velocity = texture(uVelocity, vUv).xy - vec2(R - L, T - B);\r
  outColor = vec4(velocity, 0.0, 1.0);\r
}\`,\r
  prefilter: \`uniform sampler2D uTexture;\r
uniform vec3 curve;\r
uniform float threshold;\r
void main() {\r
  vec3 c = texture(uTexture, vUv).rgb;\r
  float br = max(c.r, max(c.g, c.b));\r
  float rq = clamp(br - curve.x, 0.0, curve.y);\r
  rq = curve.z * rq * rq;\r
  c *= max(rq, br - threshold) / max(br, 0.0001);\r
  outColor = vec4(c, 0.0);\r
}\`,\r
  blur: \`uniform sampler2D uTexture;\r
uniform float intensity;\r
void main() {\r
  vec4 sum = texture(uTexture, vL) + texture(uTexture, vR) + texture(uTexture, vT) + texture(uTexture, vB);\r
  outColor = sum * 0.25 * intensity;\r
}\`,\r
  display: \`uniform sampler2D uTexture;\r
uniform sampler2D uBloom;\r
uniform vec2 texelSize;\r
uniform float shading;\r
uniform float bloom;\r
uniform float light;\r
float hash(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * 0.1031);\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.x + q.y) * q.z);\r
}\r
void main() {\r
  vec3 c = texture(uTexture, vUv).rgb;\r
  if (shading > 0.0) {\r
    float dx = length(texture(uTexture, vR).rgb) - length(texture(uTexture, vL).rgb);\r
    float dy = length(texture(uTexture, vT).rgb) - length(texture(uTexture, vB).rgb);\r
    vec3 n = normalize(vec3(dx, dy, length(texelSize)));\r
    c *= mix(1.0, clamp(n.z + 0.7, 0.7, 1.0), shading);\r
  }\r
  if (bloom > 0.0) {\r
    c += max(texture(uBloom, vUv).rgb, 0.0) * bloom;\r
  }\r
  c = max(c, 0.0);\r
  float peak = max(c.r, max(c.g, c.b));\r
  float grain = (hash(gl_FragCoord.xy) - 0.5) / 255.0 * smoothstep(0.0, 0.03, peak);\r
  if (light > 0.5) {\r
    vec3 transmit = exp(-2.4 * c);\r
    float low = min(transmit.r, min(transmit.g, transmit.b));\r
    float alpha = clamp(1.0 - low + grain, 0.0, 1.0);\r
    outColor = vec4(min(transmit - low, vec3(alpha)), alpha);\r
  } else {\r
    c = max(c + grain, 0.0);\r
    float alpha = clamp(max(c.r, max(c.g, c.b)), 0.0, 1.0);\r
    outColor = vec4(min(c, vec3(alpha)), alpha);\r
  }\r
}\`\r
};\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const parseColor = value => {\r
  let hex = String(value).replace('#', '').trim();\r
  if (hex.length === 3) hex = [...hex].map(char => char + char).join('');\r
  const number = parseInt(hex.slice(0, 6), 16);\r
  if (Number.isNaN(number)) return [1, 1, 1];\r
  return [((number >> 16) & 255) / 255, ((number >> 8) & 255) / 255, (number & 255) / 255];\r
};\r
\r
const hsv = (h, s, v) => {\r
  const i = Math.floor(h * 6);\r
  const f = h * 6 - i;\r
  const p = v * (1 - s);\r
  const q = v * (1 - f * s);\r
  const t = v * (1 - (1 - f) * s);\r
  const sector = ((i % 6) + 6) % 6;\r
  if (sector === 0) return [v, t, p];\r
  if (sector === 1) return [q, v, p];\r
  if (sector === 2) return [p, v, t];\r
  if (sector === 3) return [p, q, v];\r
  if (sector === 4) return [t, p, v];\r
  return [v, p, q];\r
};\r
\r
function SplashCursor({\r
  colors = ['#4f8cff', '#2dd4bf', '#ffd166'],\r
  rainbow = true,\r
  colorSpeed = 1,\r
  intensity = 1,\r
  size = 1,\r
  force = 1,\r
  swirl = 3,\r
  trail = 1,\r
  momentum = 1,\r
  shading = 1,\r
  glow = 0,\r
  quality = 'high',\r
  clickSplash = true,\r
  intro = true,\r
  contained = false,\r
  theme = 'dark',\r
  zIndex = 50,\r
  className = '',\r
  style\r
}) {\r
  const rootRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const [generation, setGeneration] = useState(0);\r
\r
  const settings = {\r
    palette: (Array.isArray(colors) && colors.length ? colors : ['#ffffff']).map(parseColor),\r
    rainbow,\r
    colorSpeed: Math.max(0, colorSpeed),\r
    intensity: Math.max(0, intensity),\r
    size: Math.max(0.05, size),\r
    force: Math.max(0, force),\r
    swirl: Math.max(0, swirl),\r
    trail: Math.max(0.05, trail),\r
    momentum: Math.max(0.05, momentum),\r
    shading: clamp(shading, 0, 1),\r
    glow: clamp(glow, 0, 1),\r
    quality: QUALITY[quality] ? quality : 'high',\r
    clickSplash,\r
    contained,\r
    light: theme === 'light'\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
  const introRef = useRef(intro);\r
\r
  useEffect(() => {\r
    const parent = rootRef.current?.parentElement;\r
    if (!contained || !parent || getComputedStyle(parent).position !== 'static') return undefined;\r
    const previous = parent.style.position;\r
    parent.style.position = 'relative';\r
    return () => {\r
      parent.style.position = previous;\r
    };\r
  }, [contained]);\r
\r
  useEffect(() => {\r
    const canvas = canvasRef.current;\r
    if (!canvas) return undefined;\r
    const gl = canvas.getContext('webgl2', {\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false,\r
      preserveDrawingBuffer: false\r
    });\r
    if (!gl) return undefined;\r
    gl.getExtension('EXT_color_buffer_float');\r
    gl.getExtension('EXT_color_buffer_half_float');\r
\r
    const renderable = (internal, format) => {\r
      const texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, internal, 4, 4, 0, format, gl.HALF_FLOAT, null);\r
      const fbo = gl.createFramebuffer();\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
      const complete = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.deleteFramebuffer(fbo);\r
      gl.deleteTexture(texture);\r
      return complete;\r
    };\r
    const rgba = { internal: gl.RGBA16F, format: gl.RGBA };\r
    if (!renderable(rgba.internal, rgba.format)) return undefined;\r
    const rg = renderable(gl.RG16F, gl.RG) ? { internal: gl.RG16F, format: gl.RG } : rgba;\r
    const r = renderable(gl.R16F, gl.RED) ? { internal: gl.R16F, format: gl.RED } : rg;\r
\r
    const compile = (type, source) => {\r
      const shader = gl.createShader(type);\r
      gl.shaderSource(shader, source);\r
      gl.compileShader(shader);\r
      return shader;\r
    };\r
    const vertex = compile(gl.VERTEX_SHADER, VERTEX);\r
    const programs = {};\r
    let broken = false;\r
    Object.entries(SHADERS).forEach(([name, body]) => {\r
      const fragment = compile(gl.FRAGMENT_SHADER, HEADER + body);\r
      const program = gl.createProgram();\r
      gl.attachShader(program, vertex);\r
      gl.attachShader(program, fragment);\r
      gl.bindAttribLocation(program, 0, 'aPosition');\r
      gl.linkProgram(program);\r
      gl.deleteShader(fragment);\r
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) broken = true;\r
      const uniforms = {};\r
      const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
      for (let i = 0; i < count; i++) {\r
        const info = gl.getActiveUniform(program, i);\r
        if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
      }\r
      programs[name] = { program, uniforms };\r
    });\r
    gl.deleteShader(vertex);\r
\r
    const buffer = gl.createBuffer();\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const targets = new Set();\r
    let disposed = false;\r
    let lost = false;\r
\r
    const release = () => {\r
      if (gl.isContextLost()) return;\r
      targets.forEach(target => {\r
        gl.deleteFramebuffer(target.fbo);\r
        gl.deleteTexture(target.texture);\r
      });\r
      targets.clear();\r
      Object.values(programs).forEach(item => gl.deleteProgram(item.program));\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
    };\r
\r
    if (broken) {\r
      release();\r
      return undefined;\r
    }\r
\r
    const use = name => {\r
      const item = programs[name];\r
      gl.useProgram(item.program);\r
      return item.uniforms;\r
    };\r
\r
    const blit = target => {\r
      if (target) {\r
        gl.viewport(0, 0, target.width, target.height);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);\r
      } else {\r
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      }\r
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);\r
    };\r
\r
    const createTarget = (width, height, format, filter) => {\r
      gl.activeTexture(gl.TEXTURE0);\r
      const texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, format.internal, width, height, 0, format.format, gl.HALF_FLOAT, null);\r
      const fbo = gl.createFramebuffer();\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
      gl.viewport(0, 0, width, height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      const target = {\r
        texture,\r
        fbo,\r
        width,\r
        height,\r
        texelX: 1 / width,\r
        texelY: 1 / height,\r
        attach: unit => {\r
          gl.activeTexture(gl.TEXTURE0 + unit);\r
          gl.bindTexture(gl.TEXTURE_2D, texture);\r
          return unit;\r
        }\r
      };\r
      targets.add(target);\r
      return target;\r
    };\r
\r
    const destroyTarget = target => {\r
      if (!target) return;\r
      gl.deleteFramebuffer(target.fbo);\r
      gl.deleteTexture(target.texture);\r
      targets.delete(target);\r
    };\r
\r
    const reshape = (target, width, height, format) => {\r
      gl.bindTexture(gl.TEXTURE_2D, target.texture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, format.internal, width, height, 0, format.format, gl.HALF_FLOAT, null);\r
      target.width = width;\r
      target.height = height;\r
      target.texelX = 1 / width;\r
      target.texelY = 1 / height;\r
    };\r
\r
    const createDouble = (width, height, format, filter) => {\r
      const pair = {\r
        read: createTarget(width, height, format, filter),\r
        write: createTarget(width, height, format, filter),\r
        width,\r
        height,\r
        texelX: 1 / width,\r
        texelY: 1 / height,\r
        swap: () => {\r
          const current = pair.read;\r
          pair.read = pair.write;\r
          pair.write = current;\r
        }\r
      };\r
      return pair;\r
    };\r
\r
    const resizeDouble = (pair, width, height, format, filter, keep) => {\r
      if (keep) {\r
        const next = createTarget(width, height, format, filter);\r
        const u = use('copy');\r
        gl.uniform1i(u.uTexture, pair.read.attach(0));\r
        blit(next);\r
        destroyTarget(pair.read);\r
        pair.read = next;\r
      } else {\r
        reshape(pair.read, width, height, format);\r
      }\r
      reshape(pair.write, width, height, format);\r
      pair.width = width;\r
      pair.height = height;\r
      pair.texelX = 1 / width;\r
      pair.texelY = 1 / height;\r
    };\r
\r
    const resolution = base => {\r
      const width = gl.drawingBufferWidth;\r
      const height = gl.drawingBufferHeight;\r
      const aspect = Math.max(width, height) / Math.max(1, Math.min(width, height));\r
      const short = Math.round(base);\r
      const long = Math.round(base * aspect);\r
      return width > height ? { width: long, height: short } : { width: short, height: long };\r
    };\r
\r
    const fit = () => {\r
      const ratio = Math.min(window.devicePixelRatio || 1, 2);\r
      const width = Math.max(1, Math.floor(canvas.clientWidth * ratio));\r
      const height = Math.max(1, Math.floor(canvas.clientHeight * ratio));\r
      if (canvas.width === width && canvas.height === height) return;\r
      canvas.width = width;\r
      canvas.height = height;\r
    };\r
\r
    const sizes = () => {\r
      const q = QUALITY[settingsRef.current.quality];\r
      const shortSide = Math.min(gl.drawingBufferWidth, gl.drawingBufferHeight);\r
      return { sim: resolution(q.sim), ink: resolution(Math.max(q.sim, Math.min(q.dye, shortSide))) };\r
    };\r
\r
    fit();\r
    const initial = sizes();\r
    const dye = createDouble(initial.ink.width, initial.ink.height, rgba, gl.LINEAR);\r
    const velocity = createDouble(initial.sim.width, initial.sim.height, rg, gl.LINEAR);\r
    const pressure = createDouble(initial.sim.width, initial.sim.height, r, gl.NEAREST);\r
    const divergence = createTarget(initial.sim.width, initial.sim.height, r, gl.NEAREST);\r
    const curl = createTarget(initial.sim.width, initial.sim.height, r, gl.NEAREST);\r
    let bloom = null;\r
    let bloomChain = [];\r
\r
    const dropBloom = () => {\r
      destroyTarget(bloom);\r
      bloomChain.forEach(destroyTarget);\r
      bloom = null;\r
      bloomChain = [];\r
    };\r
\r
    const ensureBloom = () => {\r
      if (bloom) return bloom;\r
      const size = resolution(BLOOM_RESOLUTION);\r
      const created = createTarget(size.width, size.height, rgba, gl.LINEAR);\r
      for (let i = 0; i < BLOOM_ITERATIONS; i++) {\r
        const width = size.width >> (i + 1);\r
        const height = size.height >> (i + 1);\r
        if (width < 2 || height < 2) break;\r
        bloomChain.push(createTarget(width, height, rgba, gl.LINEAR));\r
      }\r
      bloom = created;\r
      return created;\r
    };\r
\r
    const resize = () => {\r
      fit();\r
      const next = sizes();\r
      if (dye.width !== next.ink.width || dye.height !== next.ink.height) {\r
        resizeDouble(dye, next.ink.width, next.ink.height, rgba, gl.LINEAR, true);\r
      }\r
      if (velocity.width !== next.sim.width || velocity.height !== next.sim.height) {\r
        resizeDouble(velocity, next.sim.width, next.sim.height, rg, gl.LINEAR, true);\r
        resizeDouble(pressure, next.sim.width, next.sim.height, r, gl.NEAREST, false);\r
        reshape(divergence, next.sim.width, next.sim.height, r);\r
        reshape(curl, next.sim.width, next.sim.height, r);\r
      }\r
      const glowSize = resolution(BLOOM_RESOLUTION);\r
      if (bloom && (bloom.width !== glowSize.width || bloom.height !== glowSize.height)) dropBloom();\r
    };\r
\r
    const radiusFor = scale => {\r
      const aspect = canvas.width / canvas.height;\r
      return ((0.2 * settingsRef.current.size * scale) / 100) * (aspect > 1 ? aspect : 1);\r
    };\r
\r
    const splat = (ax, ay, bx, by, vx, vy, color, radius) => {\r
      const u = use('splat');\r
      gl.uniform1i(u.uTarget, velocity.read.attach(0));\r
      gl.uniform1f(u.aspectRatio, canvas.width / canvas.height);\r
      gl.uniform2f(u.pointA, ax, ay);\r
      gl.uniform2f(u.pointB, bx, by);\r
      gl.uniform3f(u.color, vx, vy, 0);\r
      gl.uniform1f(u.radius, radius);\r
      blit(velocity.write);\r
      velocity.swap();\r
      gl.uniform1i(u.uTarget, dye.read.attach(0));\r
      gl.uniform3f(u.color, color[0], color[1], color[2]);\r
      blit(dye.write);\r
      dye.swap();\r
    };\r
\r
    const colorAt = (offset, now) => {\r
      const s = settingsRef.current;\r
      const phase = (((offset + (now / 1000) * s.colorSpeed * 0.6) % 1) + 1) % 1;\r
      if (s.rainbow) return hsv(phase, 1, 1);\r
      const palette = s.palette;\r
      if (palette.length === 1) return palette[0];\r
      const position = phase * palette.length;\r
      const from = palette[Math.floor(position) % palette.length];\r
      const to = palette[(Math.floor(position) + 1) % palette.length];\r
      const t = position - Math.floor(position);\r
      const blend = t * t * (3 - 2 * t);\r
      return [\r
        from[0] + (to[0] - from[0]) * blend,\r
        from[1] + (to[1] - from[1]) * blend,\r
        from[2] + (to[2] - from[2]) * blend\r
      ];\r
    };\r
\r
    const inkFor = (color, amount) =>\r
      color.map(channel => (settingsRef.current.light ? 1 - channel : channel) * amount);\r
\r
    const flush = (pointer, dt, now) => {\r
      const s = settingsRef.current;\r
      const aspect = canvas.width / canvas.height;\r
      const length = Math.hypot((pointer.x - pointer.px) * aspect, pointer.y - pointer.py);\r
      if (length > 0.35) {\r
        pointer.px = pointer.x;\r
        pointer.py = pointer.y;\r
        return;\r
      }\r
      let dx = pointer.x - pointer.px;\r
      let dy = pointer.y - pointer.py;\r
      if (aspect < 1) dx *= aspect;\r
      else dy /= aspect;\r
      const radius = radiusFor(1);\r
      const spread = 1 + length / (1.77 * Math.sqrt(radius));\r
      const push = (6000 * s.force) / Math.sqrt(spread);\r
      const amount = (0.15 * s.intensity * Math.min(dt * 60, 1)) / Math.sqrt(spread);\r
      const color = inkFor(colorAt(pointer.offset, now), amount);\r
      splat(pointer.px, pointer.py, pointer.x, pointer.y, dx * push, dy * push, color, radius);\r
      pointer.px = pointer.x;\r
      pointer.py = pointer.y;\r
    };\r
\r
    const burst = (x, y, now) => {\r
      const s = settingsRef.current;\r
      const seed = Math.random() * Math.PI * 2;\r
      const aspect = canvas.width / canvas.height;\r
      let u = use('burst');\r
      gl.uniform1i(u.uTarget, velocity.read.attach(0));\r
      gl.uniform1f(u.aspectRatio, aspect);\r
      gl.uniform2f(u.point, x, y);\r
      gl.uniform1f(u.radius, radiusFor(3));\r
      gl.uniform1f(u.strength, 1100 * s.force);\r
      gl.uniform1f(u.seed, seed);\r
      blit(velocity.write);\r
      velocity.swap();\r
      const offset = Math.random();\r
      const amount = 1.6 * s.intensity;\r
      const first = inkFor(colorAt(offset, now), amount);\r
      const second = inkFor(colorAt(offset + 0.3, now), amount);\r
      u = use('crown');\r
      gl.uniform1i(u.uTarget, dye.read.attach(0));\r
      gl.uniform1f(u.aspectRatio, aspect);\r
      gl.uniform2f(u.point, x, y);\r
      gl.uniform1f(u.radius, radiusFor(1.6));\r
      gl.uniform3f(u.colorA, first[0], first[1], first[2]);\r
      gl.uniform3f(u.colorB, second[0], second[1], second[2]);\r
      gl.uniform1f(u.seed, seed);\r
      blit(dye.write);\r
      dye.swap();\r
    };\r
\r
    const step = dt => {\r
      const s = settingsRef.current;\r
      const iterations = QUALITY[s.quality].iterations;\r
      gl.disable(gl.BLEND);\r
\r
      let u = use('curl');\r
      gl.uniform2f(u.texelSize, velocity.texelX, velocity.texelY);\r
      gl.uniform1i(u.uVelocity, velocity.read.attach(0));\r
      blit(curl);\r
\r
      u = use('vorticity');\r
      gl.uniform2f(u.texelSize, velocity.texelX, velocity.texelY);\r
      gl.uniform1i(u.uVelocity, velocity.read.attach(0));\r
      gl.uniform1i(u.uCurl, curl.attach(1));\r
      gl.uniform1f(u.curl, s.swirl);\r
      gl.uniform1f(u.dt, dt);\r
      blit(velocity.write);\r
      velocity.swap();\r
\r
      u = use('divergence');\r
      gl.uniform2f(u.texelSize, velocity.texelX, velocity.texelY);\r
      gl.uniform1i(u.uVelocity, velocity.read.attach(0));\r
      blit(divergence);\r
\r
      u = use('clear');\r
      gl.uniform1i(u.uTexture, pressure.read.attach(0));\r
      gl.uniform1f(u.value, 0.1);\r
      blit(pressure.write);\r
      pressure.swap();\r
\r
      u = use('pressure');\r
      gl.uniform2f(u.texelSize, velocity.texelX, velocity.texelY);\r
      gl.uniform1i(u.uDivergence, divergence.attach(0));\r
      for (let i = 0; i < iterations; i++) {\r
        gl.uniform1i(u.uPressure, pressure.read.attach(1));\r
        blit(pressure.write);\r
        pressure.swap();\r
      }\r
\r
      u = use('gradient');\r
      gl.uniform2f(u.texelSize, velocity.texelX, velocity.texelY);\r
      gl.uniform1i(u.uPressure, pressure.read.attach(0));\r
      gl.uniform1i(u.uVelocity, velocity.read.attach(1));\r
      blit(velocity.write);\r
      velocity.swap();\r
\r
      u = use('advection');\r
      gl.uniform2f(u.texelSize, velocity.texelX, velocity.texelY);\r
      gl.uniform1i(u.uVelocity, velocity.read.attach(0));\r
      gl.uniform1i(u.uSource, velocity.read.attach(0));\r
      gl.uniform1f(u.dt, dt);\r
      gl.uniform1f(u.dissipation, 2 / s.momentum);\r
      blit(velocity.write);\r
      velocity.swap();\r
\r
      gl.uniform1i(u.uVelocity, velocity.read.attach(0));\r
      gl.uniform1i(u.uSource, dye.read.attach(1));\r
      gl.uniform1f(u.dissipation, 3.5 / s.trail);\r
      blit(dye.write);\r
      dye.swap();\r
    };\r
\r
    const applyBloom = amount => {\r
      const base = ensureBloom();\r
      if (!bloomChain.length) return;\r
      gl.disable(gl.BLEND);\r
      let u = use('prefilter');\r
      const knee = BLOOM_THRESHOLD * BLOOM_KNEE + 0.0001;\r
      gl.uniform3f(u.curve, BLOOM_THRESHOLD - knee, knee * 2, 0.25 / knee);\r
      gl.uniform1f(u.threshold, BLOOM_THRESHOLD);\r
      gl.uniform1i(u.uTexture, dye.read.attach(0));\r
      blit(base);\r
      u = use('blur');\r
      gl.uniform1f(u.intensity, 1);\r
      let last = base;\r
      bloomChain.forEach(target => {\r
        gl.uniform2f(u.texelSize, last.texelX, last.texelY);\r
        gl.uniform1i(u.uTexture, last.attach(0));\r
        blit(target);\r
        last = target;\r
      });\r
      gl.blendFunc(gl.ONE, gl.ONE);\r
      gl.enable(gl.BLEND);\r
      for (let i = bloomChain.length - 2; i >= 0; i--) {\r
        const target = bloomChain[i];\r
        gl.uniform2f(u.texelSize, last.texelX, last.texelY);\r
        gl.uniform1i(u.uTexture, last.attach(0));\r
        blit(target);\r
        last = target;\r
      }\r
      gl.disable(gl.BLEND);\r
      gl.uniform1f(u.intensity, amount);\r
      gl.uniform2f(u.texelSize, last.texelX, last.texelY);\r
      gl.uniform1i(u.uTexture, last.attach(0));\r
      blit(base);\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      if (s.glow > 0) applyBloom(2 * s.glow);\r
      gl.disable(gl.BLEND);\r
      const u = use('display');\r
      gl.uniform2f(u.texelSize, 1 / gl.drawingBufferWidth, 1 / gl.drawingBufferHeight);\r
      gl.uniform1i(u.uTexture, dye.read.attach(0));\r
      gl.uniform1i(u.uBloom, (bloom ?? dye.read).attach(1));\r
      gl.uniform1f(u.shading, s.shading);\r
      gl.uniform1f(u.bloom, s.glow > 0 ? 1 : 0);\r
      gl.uniform1f(u.light, s.light ? 1 : 0);\r
      blit(null);\r
    };\r
\r
    const clearScreen = () => {\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
    };\r
\r
    const pointers = new Map();\r
    const bursts = [];\r
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const introPointer = { x: 0, y: 0, px: 0, py: 0, ready: false, moved: false, offset: Math.random() };\r
    let introStart = introRef.current && !reduced ? performance.now() + 150 : -1;\r
    let raf = 0;\r
    let last = 0;\r
    let lastActivity = performance.now();\r
\r
    const advanceIntro = now => {\r
      if (introStart < 0) return;\r
      const progress = (now - introStart) / 1100;\r
      if (progress < 0) return;\r
      const t = Math.min(progress, 1);\r
      const eased = t * t * (3 - 2 * t);\r
      const x = 0.2 + 0.6 * eased;\r
      const y = 0.5 + 0.12 * Math.sin(eased * Math.PI * 2);\r
      if (!introPointer.ready) {\r
        introPointer.x = introPointer.px = x;\r
        introPointer.y = introPointer.py = y;\r
        introPointer.ready = true;\r
      } else {\r
        introPointer.x = x;\r
        introPointer.y = y;\r
        introPointer.moved = true;\r
      }\r
      if (t >= 1) introStart = -1;\r
      lastActivity = now;\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (disposed || lost) return;\r
      const s = settingsRef.current;\r
      const dt = clamp((now - last) / 1000, 0, 1 / 60);\r
      last = now;\r
      resize();\r
      advanceIntro(now);\r
      if (introPointer.moved) {\r
        introPointer.moved = false;\r
        flush(introPointer, dt, now);\r
      }\r
      pointers.forEach(pointer => {\r
        if (!pointer.moved) return;\r
        pointer.moved = false;\r
        flush(pointer, dt, now);\r
      });\r
      bursts.splice(0).forEach(point => burst(point.x, point.y, now));\r
      step(dt);\r
      render();\r
      const quiet = (2.2 * s.trail + 0.4) * 1000;\r
      if (introStart >= 0 || now - lastActivity < quiet) raf = requestAnimationFrame(frame);\r
      else clearScreen();\r
    };\r
\r
    const wake = () => {\r
      lastActivity = performance.now();\r
      if (raf || disposed || lost) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const locate = (clientX, clientY) => {\r
      const rect = canvas.getBoundingClientRect();\r
      if (!rect.width || !rect.height) return null;\r
      const x = (clientX - rect.left) / rect.width;\r
      const y = 1 - (clientY - rect.top) / rect.height;\r
      if (settingsRef.current.contained && (x < 0 || x > 1 || y < 0 || y > 1)) return null;\r
      return { x, y };\r
    };\r
\r
    const track = (id, clientX, clientY) => {\r
      const point = locate(clientX, clientY);\r
      let pointer = pointers.get(id);\r
      if (!point) {\r
        if (pointer) pointer.ready = false;\r
        return;\r
      }\r
      if (!pointer) {\r
        pointer = { x: 0, y: 0, px: 0, py: 0, ready: false, moved: false, offset: Math.random() };\r
        pointers.set(id, pointer);\r
      }\r
      if (!pointer.ready) {\r
        pointer.x = pointer.px = point.x;\r
        pointer.y = pointer.py = point.y;\r
        pointer.ready = true;\r
        return;\r
      }\r
      pointer.x = point.x;\r
      pointer.y = point.y;\r
      pointer.moved = true;\r
      wake();\r
    };\r
\r
    const press = (clientX, clientY) => {\r
      if (!settingsRef.current.clickSplash) return;\r
      const point = locate(clientX, clientY);\r
      if (!point) return;\r
      bursts.push(point);\r
      wake();\r
    };\r
\r
    const onPointerMove = event => {\r
      if (event.pointerType !== 'touch') track(\`p\${event.pointerId}\`, event.clientX, event.clientY);\r
    };\r
    const onPointerDown = event => {\r
      if (event.pointerType !== 'touch') press(event.clientX, event.clientY);\r
    };\r
    const onTouchStart = event => {\r
      Array.from(event.changedTouches).forEach(touch => {\r
        pointers.delete(\`t\${touch.identifier}\`);\r
        track(\`t\${touch.identifier}\`, touch.clientX, touch.clientY);\r
        press(touch.clientX, touch.clientY);\r
      });\r
    };\r
    const onTouchMove = event => {\r
      Array.from(event.changedTouches).forEach(touch => track(\`t\${touch.identifier}\`, touch.clientX, touch.clientY));\r
    };\r
    const onTouchEnd = event => {\r
      Array.from(event.changedTouches).forEach(touch => pointers.delete(\`t\${touch.identifier}\`));\r
    };\r
    const onLeave = () => {\r
      pointers.forEach(pointer => {\r
        pointer.ready = false;\r
      });\r
    };\r
    const onLost = event => {\r
      event.preventDefault();\r
      lost = true;\r
      cancelAnimationFrame(raf);\r
      raf = 0;\r
    };\r
    const onRestored = () => setGeneration(value => value + 1);\r
\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    window.addEventListener('touchstart', onTouchStart, { passive: true });\r
    window.addEventListener('touchmove', onTouchMove, { passive: true });\r
    window.addEventListener('touchend', onTouchEnd, { passive: true });\r
    window.addEventListener('touchcancel', onTouchEnd, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onLeave);\r
    canvas.addEventListener('webglcontextlost', onLost);\r
    canvas.addEventListener('webglcontextrestored', onRestored);\r
\r
    resize();\r
    if (introStart >= 0) wake();\r
\r
    return () => {\r
      disposed = true;\r
      cancelAnimationFrame(raf);\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('touchstart', onTouchStart);\r
      window.removeEventListener('touchmove', onTouchMove);\r
      window.removeEventListener('touchend', onTouchEnd);\r
      window.removeEventListener('touchcancel', onTouchEnd);\r
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
      canvas.removeEventListener('webglcontextlost', onLost);\r
      canvas.removeEventListener('webglcontextrestored', onRestored);\r
      release();\r
    };\r
  }, [generation]);\r
\r
  return (\r
    <div\r
      ref={rootRef}\r
      className={[ROOT, className].filter(Boolean).join(' ')}\r
      style={{ zIndex, ...style }}\r
      data-contained={contained ? '' : undefined}\r
      aria-hidden="true"\r
    >\r
      <canvas ref={canvasRef} className={CANVAS} />\r
    </div>\r
  );\r
}\r
\r
export default SplashCursor;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, useState, type CSSProperties } from 'react';\r
import './SplashCursor.css';\r
\r
export interface SplashCursorProps {\r
  colors?: string[];\r
  rainbow?: boolean;\r
  colorSpeed?: number;\r
  intensity?: number;\r
  size?: number;\r
  force?: number;\r
  swirl?: number;\r
  trail?: number;\r
  momentum?: number;\r
  shading?: number;\r
  glow?: number;\r
  quality?: 'low' | 'medium' | 'high';\r
  clickSplash?: boolean;\r
  intro?: boolean;\r
  contained?: boolean;\r
  theme?: 'dark' | 'light';\r
  zIndex?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
type RGB = [number, number, number];\r
\r
type Uniforms = Record<string, WebGLUniformLocation | null>;\r
\r
interface Format {\r
  internal: number;\r
  format: number;\r
}\r
\r
interface Target {\r
  texture: WebGLTexture;\r
  fbo: WebGLFramebuffer;\r
  width: number;\r
  height: number;\r
  texelX: number;\r
  texelY: number;\r
  attach: (unit: number) => number;\r
}\r
\r
interface DoubleTarget {\r
  read: Target;\r
  write: Target;\r
  width: number;\r
  height: number;\r
  texelX: number;\r
  texelY: number;\r
  swap: () => void;\r
}\r
\r
interface Pointer {\r
  x: number;\r
  y: number;\r
  px: number;\r
  py: number;\r
  ready: boolean;\r
  moved: boolean;\r
  offset: number;\r
}\r
\r
const QUALITY: Record<string, { sim: number; dye: number; iterations: number }> = {\r
  low: { sim: 64, dye: 512, iterations: 10 },\r
  medium: { sim: 96, dye: 1024, iterations: 16 },\r
  high: { sim: 128, dye: 1440, iterations: 20 }\r
};\r
const BLOOM_RESOLUTION = 256;\r
const BLOOM_ITERATIONS = 4;\r
const BLOOM_THRESHOLD = 0.3;\r
const BLOOM_KNEE = 0.7;\r
\r
const ROOT = 'splash-cursor';\r
const CANVAS = 'splash-cursor__canvas';\r
\r
const VERTEX = \`#version 300 es\r
precision highp float;\r
in vec2 aPosition;\r
uniform vec2 texelSize;\r
out vec2 vUv;\r
out vec2 vL;\r
out vec2 vR;\r
out vec2 vT;\r
out vec2 vB;\r
void main() {\r
  vUv = aPosition * 0.5 + 0.5;\r
  vL = vUv - vec2(texelSize.x, 0.0);\r
  vR = vUv + vec2(texelSize.x, 0.0);\r
  vT = vUv + vec2(0.0, texelSize.y);\r
  vB = vUv - vec2(0.0, texelSize.y);\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const HEADER = \`#version 300 es\r
precision highp float;\r
precision highp sampler2D;\r
in vec2 vUv;\r
in vec2 vL;\r
in vec2 vR;\r
in vec2 vT;\r
in vec2 vB;\r
out vec4 outColor;\r
\`;\r
\r
const SHADERS: Record<string, string> = {\r
  copy: \`uniform sampler2D uTexture;\r
void main() {\r
  outColor = texture(uTexture, vUv);\r
}\`,\r
  clear: \`uniform sampler2D uTexture;\r
uniform float value;\r
void main() {\r
  outColor = value * texture(uTexture, vUv);\r
}\`,\r
  splat: \`uniform sampler2D uTarget;\r
uniform float aspectRatio;\r
uniform vec3 color;\r
uniform vec2 pointA;\r
uniform vec2 pointB;\r
uniform float radius;\r
void main() {\r
  vec2 scale = vec2(aspectRatio, 1.0);\r
  vec2 pa = (vUv - pointA) * scale;\r
  vec2 ba = (pointB - pointA) * scale;\r
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-9), 0.0, 1.0);\r
  vec2 d = pa - ba * h;\r
  vec3 base = texture(uTarget, vUv).xyz;\r
  outColor = vec4(base + exp(-dot(d, d) / radius) * color, 1.0);\r
}\`,\r
  burst: \`uniform sampler2D uTarget;\r
uniform float aspectRatio;\r
uniform vec2 point;\r
uniform float radius;\r
uniform float strength;\r
uniform float seed;\r
void main() {\r
  vec2 d = (vUv - point) * vec2(aspectRatio, 1.0);\r
  float distance = length(d);\r
  vec2 direction = d / max(distance, 0.00001);\r
  float angle = atan(d.y, d.x);\r
  float petals = 0.78 + 0.22 * sin(angle * 5.0 + seed) * sin(angle * 3.0 - seed * 1.7);\r
  vec2 twist = vec2(-direction.y, direction.x) * 0.3 * sin(angle * 4.0 + seed * 2.3);\r
  float falloff = exp(-dot(d, d) / radius) * distance / sqrt(radius);\r
  outColor = vec4(texture(uTarget, vUv).xy + (direction * petals + twist) * falloff * strength, 0.0, 1.0);\r
}\`,\r
  crown: \`uniform sampler2D uTarget;\r
uniform float aspectRatio;\r
uniform vec2 point;\r
uniform float radius;\r
uniform vec3 colorA;\r
uniform vec3 colorB;\r
uniform float seed;\r
void main() {\r
  vec2 d = (vUv - point) * vec2(aspectRatio, 1.0);\r
  vec3 ink = exp(-dot(d, d) / (radius * 0.45)) * colorA;\r
  for (int i = 0; i < 7; i++) {\r
    float index = float(i);\r
    float angle = seed + index * 0.8975979 + sin(seed * 3.0 + index * 1.9) * 0.35;\r
    float reach = sqrt(radius) * (0.75 + 0.45 * fract(sin(seed * 7.1 + index * 3.7) * 43.7));\r
    float drop = radius * (0.08 + 0.12 * fract(sin(seed * 2.9 + index * 5.3) * 31.9));\r
    vec2 q = d - vec2(cos(angle), sin(angle)) * reach;\r
    ink += exp(-dot(q, q) / drop) * mix(colorA, colorB, fract(index * 0.37 + 0.2));\r
  }\r
  outColor = vec4(texture(uTarget, vUv).xyz + ink, 1.0);\r
}\`,\r
  advection: \`uniform sampler2D uVelocity;\r
uniform sampler2D uSource;\r
uniform vec2 texelSize;\r
uniform float dt;\r
uniform float dissipation;\r
void main() {\r
  vec2 coord = vUv - dt * texture(uVelocity, vUv).xy * texelSize;\r
  outColor = texture(uSource, coord) / (1.0 + dissipation * dt);\r
}\`,\r
  divergence: \`uniform sampler2D uVelocity;\r
void main() {\r
  float L = texture(uVelocity, vL).x;\r
  float R = texture(uVelocity, vR).x;\r
  float T = texture(uVelocity, vT).y;\r
  float B = texture(uVelocity, vB).y;\r
  vec2 C = texture(uVelocity, vUv).xy;\r
  if (vL.x < 0.0) L = -C.x;\r
  if (vR.x > 1.0) R = -C.x;\r
  if (vT.y > 1.0) T = -C.y;\r
  if (vB.y < 0.0) B = -C.y;\r
  outColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);\r
}\`,\r
  curl: \`uniform sampler2D uVelocity;\r
void main() {\r
  float L = texture(uVelocity, vL).y;\r
  float R = texture(uVelocity, vR).y;\r
  float T = texture(uVelocity, vT).x;\r
  float B = texture(uVelocity, vB).x;\r
  outColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);\r
}\`,\r
  vorticity: \`uniform sampler2D uVelocity;\r
uniform sampler2D uCurl;\r
uniform float curl;\r
uniform float dt;\r
void main() {\r
  float L = texture(uCurl, vL).x;\r
  float R = texture(uCurl, vR).x;\r
  float T = texture(uCurl, vT).x;\r
  float B = texture(uCurl, vB).x;\r
  float C = texture(uCurl, vUv).x;\r
  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));\r
  force /= length(force) + 0.0001;\r
  force *= curl * C;\r
  force.y *= -1.0;\r
  vec2 velocity = texture(uVelocity, vUv).xy + force * dt;\r
  outColor = vec4(clamp(velocity, -1000.0, 1000.0), 0.0, 1.0);\r
}\`,\r
  pressure: \`uniform sampler2D uPressure;\r
uniform sampler2D uDivergence;\r
void main() {\r
  float L = texture(uPressure, vL).x;\r
  float R = texture(uPressure, vR).x;\r
  float T = texture(uPressure, vT).x;\r
  float B = texture(uPressure, vB).x;\r
  float divergence = texture(uDivergence, vUv).x;\r
  outColor = vec4((L + R + B + T - divergence) * 0.25, 0.0, 0.0, 1.0);\r
}\`,\r
  gradient: \`uniform sampler2D uPressure;\r
uniform sampler2D uVelocity;\r
void main() {\r
  float L = texture(uPressure, vL).x;\r
  float R = texture(uPressure, vR).x;\r
  float T = texture(uPressure, vT).x;\r
  float B = texture(uPressure, vB).x;\r
  vec2 velocity = texture(uVelocity, vUv).xy - vec2(R - L, T - B);\r
  outColor = vec4(velocity, 0.0, 1.0);\r
}\`,\r
  prefilter: \`uniform sampler2D uTexture;\r
uniform vec3 curve;\r
uniform float threshold;\r
void main() {\r
  vec3 c = texture(uTexture, vUv).rgb;\r
  float br = max(c.r, max(c.g, c.b));\r
  float rq = clamp(br - curve.x, 0.0, curve.y);\r
  rq = curve.z * rq * rq;\r
  c *= max(rq, br - threshold) / max(br, 0.0001);\r
  outColor = vec4(c, 0.0);\r
}\`,\r
  blur: \`uniform sampler2D uTexture;\r
uniform float intensity;\r
void main() {\r
  vec4 sum = texture(uTexture, vL) + texture(uTexture, vR) + texture(uTexture, vT) + texture(uTexture, vB);\r
  outColor = sum * 0.25 * intensity;\r
}\`,\r
  display: \`uniform sampler2D uTexture;\r
uniform sampler2D uBloom;\r
uniform vec2 texelSize;\r
uniform float shading;\r
uniform float bloom;\r
uniform float light;\r
float hash(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * 0.1031);\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.x + q.y) * q.z);\r
}\r
void main() {\r
  vec3 c = texture(uTexture, vUv).rgb;\r
  if (shading > 0.0) {\r
    float dx = length(texture(uTexture, vR).rgb) - length(texture(uTexture, vL).rgb);\r
    float dy = length(texture(uTexture, vT).rgb) - length(texture(uTexture, vB).rgb);\r
    vec3 n = normalize(vec3(dx, dy, length(texelSize)));\r
    c *= mix(1.0, clamp(n.z + 0.7, 0.7, 1.0), shading);\r
  }\r
  if (bloom > 0.0) {\r
    c += max(texture(uBloom, vUv).rgb, 0.0) * bloom;\r
  }\r
  c = max(c, 0.0);\r
  float peak = max(c.r, max(c.g, c.b));\r
  float grain = (hash(gl_FragCoord.xy) - 0.5) / 255.0 * smoothstep(0.0, 0.03, peak);\r
  if (light > 0.5) {\r
    vec3 transmit = exp(-2.4 * c);\r
    float low = min(transmit.r, min(transmit.g, transmit.b));\r
    float alpha = clamp(1.0 - low + grain, 0.0, 1.0);\r
    outColor = vec4(min(transmit - low, vec3(alpha)), alpha);\r
  } else {\r
    c = max(c + grain, 0.0);\r
    float alpha = clamp(max(c.r, max(c.g, c.b)), 0.0, 1.0);\r
    outColor = vec4(min(c, vec3(alpha)), alpha);\r
  }\r
}\`\r
};\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const parseColor = (value: string): RGB => {\r
  let hex = String(value).replace('#', '').trim();\r
  if (hex.length === 3) hex = [...hex].map(char => char + char).join('');\r
  const number = parseInt(hex.slice(0, 6), 16);\r
  if (Number.isNaN(number)) return [1, 1, 1];\r
  return [((number >> 16) & 255) / 255, ((number >> 8) & 255) / 255, (number & 255) / 255];\r
};\r
\r
const hsv = (h: number, s: number, v: number): RGB => {\r
  const i = Math.floor(h * 6);\r
  const f = h * 6 - i;\r
  const p = v * (1 - s);\r
  const q = v * (1 - f * s);\r
  const t = v * (1 - (1 - f) * s);\r
  const sector = ((i % 6) + 6) % 6;\r
  if (sector === 0) return [v, t, p];\r
  if (sector === 1) return [q, v, p];\r
  if (sector === 2) return [p, v, t];\r
  if (sector === 3) return [p, q, v];\r
  if (sector === 4) return [t, p, v];\r
  return [v, p, q];\r
};\r
\r
function SplashCursor({\r
  colors = ['#4f8cff', '#2dd4bf', '#ffd166'],\r
  rainbow = true,\r
  colorSpeed = 1,\r
  intensity = 1,\r
  size = 1,\r
  force = 1,\r
  swirl = 3,\r
  trail = 1,\r
  momentum = 1,\r
  shading = 1,\r
  glow = 0,\r
  quality = 'high',\r
  clickSplash = true,\r
  intro = true,\r
  contained = false,\r
  theme = 'dark',\r
  zIndex = 50,\r
  className = '',\r
  style\r
}: SplashCursorProps) {\r
  const rootRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const [generation, setGeneration] = useState(0);\r
\r
  const settings = {\r
    palette: (Array.isArray(colors) && colors.length ? colors : ['#ffffff']).map(parseColor),\r
    rainbow,\r
    colorSpeed: Math.max(0, colorSpeed),\r
    intensity: Math.max(0, intensity),\r
    size: Math.max(0.05, size),\r
    force: Math.max(0, force),\r
    swirl: Math.max(0, swirl),\r
    trail: Math.max(0.05, trail),\r
    momentum: Math.max(0.05, momentum),\r
    shading: clamp(shading, 0, 1),\r
    glow: clamp(glow, 0, 1),\r
    quality: QUALITY[quality] ? quality : 'high',\r
    clickSplash,\r
    contained,\r
    light: theme === 'light'\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
  const introRef = useRef(intro);\r
\r
  useEffect(() => {\r
    const parent = rootRef.current?.parentElement;\r
    if (!contained || !parent || getComputedStyle(parent).position !== 'static') return undefined;\r
    const previous = parent.style.position;\r
    parent.style.position = 'relative';\r
    return () => {\r
      parent.style.position = previous;\r
    };\r
  }, [contained]);\r
\r
  useEffect(() => {\r
    const canvas = canvasRef.current;\r
    if (!canvas) return undefined;\r
    const gl = canvas.getContext('webgl2', {\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false,\r
      preserveDrawingBuffer: false\r
    });\r
    if (!gl) return undefined;\r
    gl.getExtension('EXT_color_buffer_float');\r
    gl.getExtension('EXT_color_buffer_half_float');\r
\r
    const renderable = (internal: number, format: number) => {\r
      const texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, internal, 4, 4, 0, format, gl.HALF_FLOAT, null);\r
      const fbo = gl.createFramebuffer();\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
      const complete = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.deleteFramebuffer(fbo);\r
      gl.deleteTexture(texture);\r
      return complete;\r
    };\r
    const rgba: Format = { internal: gl.RGBA16F, format: gl.RGBA };\r
    if (!renderable(rgba.internal, rgba.format)) return undefined;\r
    const rg: Format = renderable(gl.RG16F, gl.RG) ? { internal: gl.RG16F, format: gl.RG } : rgba;\r
    const r: Format = renderable(gl.R16F, gl.RED) ? { internal: gl.R16F, format: gl.RED } : rg;\r
\r
    const compile = (type: number, source: string) => {\r
      const shader = gl.createShader(type) as WebGLShader;\r
      gl.shaderSource(shader, source);\r
      gl.compileShader(shader);\r
      return shader;\r
    };\r
    const vertex = compile(gl.VERTEX_SHADER, VERTEX);\r
    const programs: Record<string, { program: WebGLProgram; uniforms: Uniforms }> = {};\r
    let broken = false;\r
    Object.entries(SHADERS).forEach(([name, body]) => {\r
      const fragment = compile(gl.FRAGMENT_SHADER, HEADER + body);\r
      const program = gl.createProgram() as WebGLProgram;\r
      gl.attachShader(program, vertex);\r
      gl.attachShader(program, fragment);\r
      gl.bindAttribLocation(program, 0, 'aPosition');\r
      gl.linkProgram(program);\r
      gl.deleteShader(fragment);\r
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) broken = true;\r
      const uniforms: Uniforms = {};\r
      const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
      for (let i = 0; i < count; i++) {\r
        const info = gl.getActiveUniform(program, i);\r
        if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
      }\r
      programs[name] = { program, uniforms };\r
    });\r
    gl.deleteShader(vertex);\r
\r
    const buffer = gl.createBuffer();\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const targets = new Set<Target>();\r
    let disposed = false;\r
    let lost = false;\r
\r
    const release = () => {\r
      if (gl.isContextLost()) return;\r
      targets.forEach(target => {\r
        gl.deleteFramebuffer(target.fbo);\r
        gl.deleteTexture(target.texture);\r
      });\r
      targets.clear();\r
      Object.values(programs).forEach(item => gl.deleteProgram(item.program));\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
    };\r
\r
    if (broken) {\r
      release();\r
      return undefined;\r
    }\r
\r
    const use = (name: string) => {\r
      const item = programs[name];\r
      gl.useProgram(item.program);\r
      return item.uniforms;\r
    };\r
\r
    const blit = (target: Target | null) => {\r
      if (target) {\r
        gl.viewport(0, 0, target.width, target.height);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);\r
      } else {\r
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      }\r
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);\r
    };\r
\r
    const createTarget = (width: number, height: number, format: Format, filter: number): Target => {\r
      gl.activeTexture(gl.TEXTURE0);\r
      const texture = gl.createTexture() as WebGLTexture;\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, format.internal, width, height, 0, format.format, gl.HALF_FLOAT, null);\r
      const fbo = gl.createFramebuffer() as WebGLFramebuffer;\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
      gl.viewport(0, 0, width, height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      const target = {\r
        texture,\r
        fbo,\r
        width,\r
        height,\r
        texelX: 1 / width,\r
        texelY: 1 / height,\r
        attach: (unit: number) => {\r
          gl.activeTexture(gl.TEXTURE0 + unit);\r
          gl.bindTexture(gl.TEXTURE_2D, texture);\r
          return unit;\r
        }\r
      };\r
      targets.add(target);\r
      return target;\r
    };\r
\r
    const destroyTarget = (target: Target | null) => {\r
      if (!target) return;\r
      gl.deleteFramebuffer(target.fbo);\r
      gl.deleteTexture(target.texture);\r
      targets.delete(target);\r
    };\r
\r
    const reshape = (target: Target, width: number, height: number, format: Format) => {\r
      gl.bindTexture(gl.TEXTURE_2D, target.texture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, format.internal, width, height, 0, format.format, gl.HALF_FLOAT, null);\r
      target.width = width;\r
      target.height = height;\r
      target.texelX = 1 / width;\r
      target.texelY = 1 / height;\r
    };\r
\r
    const createDouble = (width: number, height: number, format: Format, filter: number) => {\r
      const pair: DoubleTarget = {\r
        read: createTarget(width, height, format, filter),\r
        write: createTarget(width, height, format, filter),\r
        width,\r
        height,\r
        texelX: 1 / width,\r
        texelY: 1 / height,\r
        swap: () => {\r
          const current = pair.read;\r
          pair.read = pair.write;\r
          pair.write = current;\r
        }\r
      };\r
      return pair;\r
    };\r
\r
    const resizeDouble = (\r
      pair: DoubleTarget,\r
      width: number,\r
      height: number,\r
      format: Format,\r
      filter: number,\r
      keep: boolean\r
    ) => {\r
      if (keep) {\r
        const next = createTarget(width, height, format, filter);\r
        const u = use('copy');\r
        gl.uniform1i(u.uTexture, pair.read.attach(0));\r
        blit(next);\r
        destroyTarget(pair.read);\r
        pair.read = next;\r
      } else {\r
        reshape(pair.read, width, height, format);\r
      }\r
      reshape(pair.write, width, height, format);\r
      pair.width = width;\r
      pair.height = height;\r
      pair.texelX = 1 / width;\r
      pair.texelY = 1 / height;\r
    };\r
\r
    const resolution = (base: number) => {\r
      const width = gl.drawingBufferWidth;\r
      const height = gl.drawingBufferHeight;\r
      const aspect = Math.max(width, height) / Math.max(1, Math.min(width, height));\r
      const short = Math.round(base);\r
      const long = Math.round(base * aspect);\r
      return width > height ? { width: long, height: short } : { width: short, height: long };\r
    };\r
\r
    const fit = () => {\r
      const ratio = Math.min(window.devicePixelRatio || 1, 2);\r
      const width = Math.max(1, Math.floor(canvas.clientWidth * ratio));\r
      const height = Math.max(1, Math.floor(canvas.clientHeight * ratio));\r
      if (canvas.width === width && canvas.height === height) return;\r
      canvas.width = width;\r
      canvas.height = height;\r
    };\r
\r
    const sizes = () => {\r
      const q = QUALITY[settingsRef.current.quality];\r
      const shortSide = Math.min(gl.drawingBufferWidth, gl.drawingBufferHeight);\r
      return { sim: resolution(q.sim), ink: resolution(Math.max(q.sim, Math.min(q.dye, shortSide))) };\r
    };\r
\r
    fit();\r
    const initial = sizes();\r
    const dye = createDouble(initial.ink.width, initial.ink.height, rgba, gl.LINEAR);\r
    const velocity = createDouble(initial.sim.width, initial.sim.height, rg, gl.LINEAR);\r
    const pressure = createDouble(initial.sim.width, initial.sim.height, r, gl.NEAREST);\r
    const divergence = createTarget(initial.sim.width, initial.sim.height, r, gl.NEAREST);\r
    const curl = createTarget(initial.sim.width, initial.sim.height, r, gl.NEAREST);\r
    let bloom: Target | null = null;\r
    let bloomChain: Target[] = [];\r
\r
    const dropBloom = () => {\r
      destroyTarget(bloom);\r
      bloomChain.forEach(destroyTarget);\r
      bloom = null;\r
      bloomChain = [];\r
    };\r
\r
    const ensureBloom = () => {\r
      if (bloom) return bloom;\r
      const size = resolution(BLOOM_RESOLUTION);\r
      const created = createTarget(size.width, size.height, rgba, gl.LINEAR);\r
      for (let i = 0; i < BLOOM_ITERATIONS; i++) {\r
        const width = size.width >> (i + 1);\r
        const height = size.height >> (i + 1);\r
        if (width < 2 || height < 2) break;\r
        bloomChain.push(createTarget(width, height, rgba, gl.LINEAR));\r
      }\r
      bloom = created;\r
      return created;\r
    };\r
\r
    const resize = () => {\r
      fit();\r
      const next = sizes();\r
      if (dye.width !== next.ink.width || dye.height !== next.ink.height) {\r
        resizeDouble(dye, next.ink.width, next.ink.height, rgba, gl.LINEAR, true);\r
      }\r
      if (velocity.width !== next.sim.width || velocity.height !== next.sim.height) {\r
        resizeDouble(velocity, next.sim.width, next.sim.height, rg, gl.LINEAR, true);\r
        resizeDouble(pressure, next.sim.width, next.sim.height, r, gl.NEAREST, false);\r
        reshape(divergence, next.sim.width, next.sim.height, r);\r
        reshape(curl, next.sim.width, next.sim.height, r);\r
      }\r
      const glowSize = resolution(BLOOM_RESOLUTION);\r
      if (bloom && (bloom.width !== glowSize.width || bloom.height !== glowSize.height)) dropBloom();\r
    };\r
\r
    const radiusFor = (scale: number) => {\r
      const aspect = canvas.width / canvas.height;\r
      return ((0.2 * settingsRef.current.size * scale) / 100) * (aspect > 1 ? aspect : 1);\r
    };\r
\r
    const splat = (\r
      ax: number,\r
      ay: number,\r
      bx: number,\r
      by: number,\r
      vx: number,\r
      vy: number,\r
      color: number[],\r
      radius: number\r
    ) => {\r
      const u = use('splat');\r
      gl.uniform1i(u.uTarget, velocity.read.attach(0));\r
      gl.uniform1f(u.aspectRatio, canvas.width / canvas.height);\r
      gl.uniform2f(u.pointA, ax, ay);\r
      gl.uniform2f(u.pointB, bx, by);\r
      gl.uniform3f(u.color, vx, vy, 0);\r
      gl.uniform1f(u.radius, radius);\r
      blit(velocity.write);\r
      velocity.swap();\r
      gl.uniform1i(u.uTarget, dye.read.attach(0));\r
      gl.uniform3f(u.color, color[0], color[1], color[2]);\r
      blit(dye.write);\r
      dye.swap();\r
    };\r
\r
    const colorAt = (offset: number, now: number): RGB => {\r
      const s = settingsRef.current;\r
      const phase = (((offset + (now / 1000) * s.colorSpeed * 0.6) % 1) + 1) % 1;\r
      if (s.rainbow) return hsv(phase, 1, 1);\r
      const palette = s.palette;\r
      if (palette.length === 1) return palette[0];\r
      const position = phase * palette.length;\r
      const from = palette[Math.floor(position) % palette.length];\r
      const to = palette[(Math.floor(position) + 1) % palette.length];\r
      const t = position - Math.floor(position);\r
      const blend = t * t * (3 - 2 * t);\r
      return [\r
        from[0] + (to[0] - from[0]) * blend,\r
        from[1] + (to[1] - from[1]) * blend,\r
        from[2] + (to[2] - from[2]) * blend\r
      ];\r
    };\r
\r
    const inkFor = (color: RGB, amount: number) =>\r
      color.map(channel => (settingsRef.current.light ? 1 - channel : channel) * amount);\r
\r
    const flush = (pointer: Pointer, dt: number, now: number) => {\r
      const s = settingsRef.current;\r
      const aspect = canvas.width / canvas.height;\r
      const length = Math.hypot((pointer.x - pointer.px) * aspect, pointer.y - pointer.py);\r
      if (length > 0.35) {\r
        pointer.px = pointer.x;\r
        pointer.py = pointer.y;\r
        return;\r
      }\r
      let dx = pointer.x - pointer.px;\r
      let dy = pointer.y - pointer.py;\r
      if (aspect < 1) dx *= aspect;\r
      else dy /= aspect;\r
      const radius = radiusFor(1);\r
      const spread = 1 + length / (1.77 * Math.sqrt(radius));\r
      const push = (6000 * s.force) / Math.sqrt(spread);\r
      const amount = (0.15 * s.intensity * Math.min(dt * 60, 1)) / Math.sqrt(spread);\r
      const color = inkFor(colorAt(pointer.offset, now), amount);\r
      splat(pointer.px, pointer.py, pointer.x, pointer.y, dx * push, dy * push, color, radius);\r
      pointer.px = pointer.x;\r
      pointer.py = pointer.y;\r
    };\r
\r
    const burst = (x: number, y: number, now: number) => {\r
      const s = settingsRef.current;\r
      const seed = Math.random() * Math.PI * 2;\r
      const aspect = canvas.width / canvas.height;\r
      let u = use('burst');\r
      gl.uniform1i(u.uTarget, velocity.read.attach(0));\r
      gl.uniform1f(u.aspectRatio, aspect);\r
      gl.uniform2f(u.point, x, y);\r
      gl.uniform1f(u.radius, radiusFor(3));\r
      gl.uniform1f(u.strength, 1100 * s.force);\r
      gl.uniform1f(u.seed, seed);\r
      blit(velocity.write);\r
      velocity.swap();\r
      const offset = Math.random();\r
      const amount = 1.6 * s.intensity;\r
      const first = inkFor(colorAt(offset, now), amount);\r
      const second = inkFor(colorAt(offset + 0.3, now), amount);\r
      u = use('crown');\r
      gl.uniform1i(u.uTarget, dye.read.attach(0));\r
      gl.uniform1f(u.aspectRatio, aspect);\r
      gl.uniform2f(u.point, x, y);\r
      gl.uniform1f(u.radius, radiusFor(1.6));\r
      gl.uniform3f(u.colorA, first[0], first[1], first[2]);\r
      gl.uniform3f(u.colorB, second[0], second[1], second[2]);\r
      gl.uniform1f(u.seed, seed);\r
      blit(dye.write);\r
      dye.swap();\r
    };\r
\r
    const step = (dt: number) => {\r
      const s = settingsRef.current;\r
      const iterations = QUALITY[s.quality].iterations;\r
      gl.disable(gl.BLEND);\r
\r
      let u = use('curl');\r
      gl.uniform2f(u.texelSize, velocity.texelX, velocity.texelY);\r
      gl.uniform1i(u.uVelocity, velocity.read.attach(0));\r
      blit(curl);\r
\r
      u = use('vorticity');\r
      gl.uniform2f(u.texelSize, velocity.texelX, velocity.texelY);\r
      gl.uniform1i(u.uVelocity, velocity.read.attach(0));\r
      gl.uniform1i(u.uCurl, curl.attach(1));\r
      gl.uniform1f(u.curl, s.swirl);\r
      gl.uniform1f(u.dt, dt);\r
      blit(velocity.write);\r
      velocity.swap();\r
\r
      u = use('divergence');\r
      gl.uniform2f(u.texelSize, velocity.texelX, velocity.texelY);\r
      gl.uniform1i(u.uVelocity, velocity.read.attach(0));\r
      blit(divergence);\r
\r
      u = use('clear');\r
      gl.uniform1i(u.uTexture, pressure.read.attach(0));\r
      gl.uniform1f(u.value, 0.1);\r
      blit(pressure.write);\r
      pressure.swap();\r
\r
      u = use('pressure');\r
      gl.uniform2f(u.texelSize, velocity.texelX, velocity.texelY);\r
      gl.uniform1i(u.uDivergence, divergence.attach(0));\r
      for (let i = 0; i < iterations; i++) {\r
        gl.uniform1i(u.uPressure, pressure.read.attach(1));\r
        blit(pressure.write);\r
        pressure.swap();\r
      }\r
\r
      u = use('gradient');\r
      gl.uniform2f(u.texelSize, velocity.texelX, velocity.texelY);\r
      gl.uniform1i(u.uPressure, pressure.read.attach(0));\r
      gl.uniform1i(u.uVelocity, velocity.read.attach(1));\r
      blit(velocity.write);\r
      velocity.swap();\r
\r
      u = use('advection');\r
      gl.uniform2f(u.texelSize, velocity.texelX, velocity.texelY);\r
      gl.uniform1i(u.uVelocity, velocity.read.attach(0));\r
      gl.uniform1i(u.uSource, velocity.read.attach(0));\r
      gl.uniform1f(u.dt, dt);\r
      gl.uniform1f(u.dissipation, 2 / s.momentum);\r
      blit(velocity.write);\r
      velocity.swap();\r
\r
      gl.uniform1i(u.uVelocity, velocity.read.attach(0));\r
      gl.uniform1i(u.uSource, dye.read.attach(1));\r
      gl.uniform1f(u.dissipation, 3.5 / s.trail);\r
      blit(dye.write);\r
      dye.swap();\r
    };\r
\r
    const applyBloom = (amount: number) => {\r
      const base = ensureBloom();\r
      if (!bloomChain.length) return;\r
      gl.disable(gl.BLEND);\r
      let u = use('prefilter');\r
      const knee = BLOOM_THRESHOLD * BLOOM_KNEE + 0.0001;\r
      gl.uniform3f(u.curve, BLOOM_THRESHOLD - knee, knee * 2, 0.25 / knee);\r
      gl.uniform1f(u.threshold, BLOOM_THRESHOLD);\r
      gl.uniform1i(u.uTexture, dye.read.attach(0));\r
      blit(base);\r
      u = use('blur');\r
      gl.uniform1f(u.intensity, 1);\r
      let last = base;\r
      bloomChain.forEach(target => {\r
        gl.uniform2f(u.texelSize, last.texelX, last.texelY);\r
        gl.uniform1i(u.uTexture, last.attach(0));\r
        blit(target);\r
        last = target;\r
      });\r
      gl.blendFunc(gl.ONE, gl.ONE);\r
      gl.enable(gl.BLEND);\r
      for (let i = bloomChain.length - 2; i >= 0; i--) {\r
        const target = bloomChain[i];\r
        gl.uniform2f(u.texelSize, last.texelX, last.texelY);\r
        gl.uniform1i(u.uTexture, last.attach(0));\r
        blit(target);\r
        last = target;\r
      }\r
      gl.disable(gl.BLEND);\r
      gl.uniform1f(u.intensity, amount);\r
      gl.uniform2f(u.texelSize, last.texelX, last.texelY);\r
      gl.uniform1i(u.uTexture, last.attach(0));\r
      blit(base);\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      if (s.glow > 0) applyBloom(2 * s.glow);\r
      gl.disable(gl.BLEND);\r
      const u = use('display');\r
      gl.uniform2f(u.texelSize, 1 / gl.drawingBufferWidth, 1 / gl.drawingBufferHeight);\r
      gl.uniform1i(u.uTexture, dye.read.attach(0));\r
      gl.uniform1i(u.uBloom, (bloom ?? dye.read).attach(1));\r
      gl.uniform1f(u.shading, s.shading);\r
      gl.uniform1f(u.bloom, s.glow > 0 ? 1 : 0);\r
      gl.uniform1f(u.light, s.light ? 1 : 0);\r
      blit(null);\r
    };\r
\r
    const clearScreen = () => {\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
    };\r
\r
    const pointers = new Map<string, Pointer>();\r
    const bursts: { x: number; y: number }[] = [];\r
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const introPointer: Pointer = { x: 0, y: 0, px: 0, py: 0, ready: false, moved: false, offset: Math.random() };\r
    let introStart = introRef.current && !reduced ? performance.now() + 150 : -1;\r
    let raf = 0;\r
    let last = 0;\r
    let lastActivity = performance.now();\r
\r
    const advanceIntro = (now: number) => {\r
      if (introStart < 0) return;\r
      const progress = (now - introStart) / 1100;\r
      if (progress < 0) return;\r
      const t = Math.min(progress, 1);\r
      const eased = t * t * (3 - 2 * t);\r
      const x = 0.2 + 0.6 * eased;\r
      const y = 0.5 + 0.12 * Math.sin(eased * Math.PI * 2);\r
      if (!introPointer.ready) {\r
        introPointer.x = introPointer.px = x;\r
        introPointer.y = introPointer.py = y;\r
        introPointer.ready = true;\r
      } else {\r
        introPointer.x = x;\r
        introPointer.y = y;\r
        introPointer.moved = true;\r
      }\r
      if (t >= 1) introStart = -1;\r
      lastActivity = now;\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (disposed || lost) return;\r
      const s = settingsRef.current;\r
      const dt = clamp((now - last) / 1000, 0, 1 / 60);\r
      last = now;\r
      resize();\r
      advanceIntro(now);\r
      if (introPointer.moved) {\r
        introPointer.moved = false;\r
        flush(introPointer, dt, now);\r
      }\r
      pointers.forEach(pointer => {\r
        if (!pointer.moved) return;\r
        pointer.moved = false;\r
        flush(pointer, dt, now);\r
      });\r
      bursts.splice(0).forEach(point => burst(point.x, point.y, now));\r
      step(dt);\r
      render();\r
      const quiet = (2.2 * s.trail + 0.4) * 1000;\r
      if (introStart >= 0 || now - lastActivity < quiet) raf = requestAnimationFrame(frame);\r
      else clearScreen();\r
    };\r
\r
    const wake = () => {\r
      lastActivity = performance.now();\r
      if (raf || disposed || lost) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const locate = (clientX: number, clientY: number) => {\r
      const rect = canvas.getBoundingClientRect();\r
      if (!rect.width || !rect.height) return null;\r
      const x = (clientX - rect.left) / rect.width;\r
      const y = 1 - (clientY - rect.top) / rect.height;\r
      if (settingsRef.current.contained && (x < 0 || x > 1 || y < 0 || y > 1)) return null;\r
      return { x, y };\r
    };\r
\r
    const track = (id: string, clientX: number, clientY: number) => {\r
      const point = locate(clientX, clientY);\r
      let pointer = pointers.get(id);\r
      if (!point) {\r
        if (pointer) pointer.ready = false;\r
        return;\r
      }\r
      if (!pointer) {\r
        pointer = { x: 0, y: 0, px: 0, py: 0, ready: false, moved: false, offset: Math.random() };\r
        pointers.set(id, pointer);\r
      }\r
      if (!pointer.ready) {\r
        pointer.x = pointer.px = point.x;\r
        pointer.y = pointer.py = point.y;\r
        pointer.ready = true;\r
        return;\r
      }\r
      pointer.x = point.x;\r
      pointer.y = point.y;\r
      pointer.moved = true;\r
      wake();\r
    };\r
\r
    const press = (clientX: number, clientY: number) => {\r
      if (!settingsRef.current.clickSplash) return;\r
      const point = locate(clientX, clientY);\r
      if (!point) return;\r
      bursts.push(point);\r
      wake();\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      if (event.pointerType !== 'touch') track(\`p\${event.pointerId}\`, event.clientX, event.clientY);\r
    };\r
    const onPointerDown = (event: PointerEvent) => {\r
      if (event.pointerType !== 'touch') press(event.clientX, event.clientY);\r
    };\r
    const onTouchStart = (event: TouchEvent) => {\r
      Array.from(event.changedTouches).forEach(touch => {\r
        pointers.delete(\`t\${touch.identifier}\`);\r
        track(\`t\${touch.identifier}\`, touch.clientX, touch.clientY);\r
        press(touch.clientX, touch.clientY);\r
      });\r
    };\r
    const onTouchMove = (event: TouchEvent) => {\r
      Array.from(event.changedTouches).forEach(touch => track(\`t\${touch.identifier}\`, touch.clientX, touch.clientY));\r
    };\r
    const onTouchEnd = (event: TouchEvent) => {\r
      Array.from(event.changedTouches).forEach(touch => pointers.delete(\`t\${touch.identifier}\`));\r
    };\r
    const onLeave = () => {\r
      pointers.forEach(pointer => {\r
        pointer.ready = false;\r
      });\r
    };\r
    const onLost = (event: Event) => {\r
      event.preventDefault();\r
      lost = true;\r
      cancelAnimationFrame(raf);\r
      raf = 0;\r
    };\r
    const onRestored = () => setGeneration(value => value + 1);\r
\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    window.addEventListener('touchstart', onTouchStart, { passive: true });\r
    window.addEventListener('touchmove', onTouchMove, { passive: true });\r
    window.addEventListener('touchend', onTouchEnd, { passive: true });\r
    window.addEventListener('touchcancel', onTouchEnd, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onLeave);\r
    canvas.addEventListener('webglcontextlost', onLost);\r
    canvas.addEventListener('webglcontextrestored', onRestored);\r
\r
    resize();\r
    if (introStart >= 0) wake();\r
\r
    return () => {\r
      disposed = true;\r
      cancelAnimationFrame(raf);\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('touchstart', onTouchStart);\r
      window.removeEventListener('touchmove', onTouchMove);\r
      window.removeEventListener('touchend', onTouchEnd);\r
      window.removeEventListener('touchcancel', onTouchEnd);\r
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
      canvas.removeEventListener('webglcontextlost', onLost);\r
      canvas.removeEventListener('webglcontextrestored', onRestored);\r
      release();\r
    };\r
  }, [generation]);\r
\r
  return (\r
    <div\r
      ref={rootRef}\r
      className={[ROOT, className].filter(Boolean).join(' ')}\r
      style={{ zIndex, ...style }}\r
      data-contained={contained ? '' : undefined}\r
      aria-hidden="true"\r
    >\r
      <canvas ref={canvasRef} className={CANVAS} />\r
    </div>\r
  );\r
}\r
\r
export default SplashCursor;\r
`,o=`'use client';\r
\r
import { useEffect, useRef, useState, type CSSProperties } from 'react';\r
\r
export interface SplashCursorProps {\r
  colors?: string[];\r
  rainbow?: boolean;\r
  colorSpeed?: number;\r
  intensity?: number;\r
  size?: number;\r
  force?: number;\r
  swirl?: number;\r
  trail?: number;\r
  momentum?: number;\r
  shading?: number;\r
  glow?: number;\r
  quality?: 'low' | 'medium' | 'high';\r
  clickSplash?: boolean;\r
  intro?: boolean;\r
  contained?: boolean;\r
  theme?: 'dark' | 'light';\r
  zIndex?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
type RGB = [number, number, number];\r
\r
type Uniforms = Record<string, WebGLUniformLocation | null>;\r
\r
interface Format {\r
  internal: number;\r
  format: number;\r
}\r
\r
interface Target {\r
  texture: WebGLTexture;\r
  fbo: WebGLFramebuffer;\r
  width: number;\r
  height: number;\r
  texelX: number;\r
  texelY: number;\r
  attach: (unit: number) => number;\r
}\r
\r
interface DoubleTarget {\r
  read: Target;\r
  write: Target;\r
  width: number;\r
  height: number;\r
  texelX: number;\r
  texelY: number;\r
  swap: () => void;\r
}\r
\r
interface Pointer {\r
  x: number;\r
  y: number;\r
  px: number;\r
  py: number;\r
  ready: boolean;\r
  moved: boolean;\r
  offset: number;\r
}\r
\r
const QUALITY: Record<string, { sim: number; dye: number; iterations: number }> = {\r
  low: { sim: 64, dye: 512, iterations: 10 },\r
  medium: { sim: 96, dye: 1024, iterations: 16 },\r
  high: { sim: 128, dye: 1440, iterations: 20 }\r
};\r
const BLOOM_RESOLUTION = 256;\r
const BLOOM_ITERATIONS = 4;\r
const BLOOM_THRESHOLD = 0.3;\r
const BLOOM_KNEE = 0.7;\r
\r
const ROOT = 'pointer-events-none fixed inset-0 data-[contained]:absolute';\r
const CANVAS = 'block h-full w-full';\r
\r
const VERTEX = \`#version 300 es\r
precision highp float;\r
in vec2 aPosition;\r
uniform vec2 texelSize;\r
out vec2 vUv;\r
out vec2 vL;\r
out vec2 vR;\r
out vec2 vT;\r
out vec2 vB;\r
void main() {\r
  vUv = aPosition * 0.5 + 0.5;\r
  vL = vUv - vec2(texelSize.x, 0.0);\r
  vR = vUv + vec2(texelSize.x, 0.0);\r
  vT = vUv + vec2(0.0, texelSize.y);\r
  vB = vUv - vec2(0.0, texelSize.y);\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const HEADER = \`#version 300 es\r
precision highp float;\r
precision highp sampler2D;\r
in vec2 vUv;\r
in vec2 vL;\r
in vec2 vR;\r
in vec2 vT;\r
in vec2 vB;\r
out vec4 outColor;\r
\`;\r
\r
const SHADERS: Record<string, string> = {\r
  copy: \`uniform sampler2D uTexture;\r
void main() {\r
  outColor = texture(uTexture, vUv);\r
}\`,\r
  clear: \`uniform sampler2D uTexture;\r
uniform float value;\r
void main() {\r
  outColor = value * texture(uTexture, vUv);\r
}\`,\r
  splat: \`uniform sampler2D uTarget;\r
uniform float aspectRatio;\r
uniform vec3 color;\r
uniform vec2 pointA;\r
uniform vec2 pointB;\r
uniform float radius;\r
void main() {\r
  vec2 scale = vec2(aspectRatio, 1.0);\r
  vec2 pa = (vUv - pointA) * scale;\r
  vec2 ba = (pointB - pointA) * scale;\r
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-9), 0.0, 1.0);\r
  vec2 d = pa - ba * h;\r
  vec3 base = texture(uTarget, vUv).xyz;\r
  outColor = vec4(base + exp(-dot(d, d) / radius) * color, 1.0);\r
}\`,\r
  burst: \`uniform sampler2D uTarget;\r
uniform float aspectRatio;\r
uniform vec2 point;\r
uniform float radius;\r
uniform float strength;\r
uniform float seed;\r
void main() {\r
  vec2 d = (vUv - point) * vec2(aspectRatio, 1.0);\r
  float distance = length(d);\r
  vec2 direction = d / max(distance, 0.00001);\r
  float angle = atan(d.y, d.x);\r
  float petals = 0.78 + 0.22 * sin(angle * 5.0 + seed) * sin(angle * 3.0 - seed * 1.7);\r
  vec2 twist = vec2(-direction.y, direction.x) * 0.3 * sin(angle * 4.0 + seed * 2.3);\r
  float falloff = exp(-dot(d, d) / radius) * distance / sqrt(radius);\r
  outColor = vec4(texture(uTarget, vUv).xy + (direction * petals + twist) * falloff * strength, 0.0, 1.0);\r
}\`,\r
  crown: \`uniform sampler2D uTarget;\r
uniform float aspectRatio;\r
uniform vec2 point;\r
uniform float radius;\r
uniform vec3 colorA;\r
uniform vec3 colorB;\r
uniform float seed;\r
void main() {\r
  vec2 d = (vUv - point) * vec2(aspectRatio, 1.0);\r
  vec3 ink = exp(-dot(d, d) / (radius * 0.45)) * colorA;\r
  for (int i = 0; i < 7; i++) {\r
    float index = float(i);\r
    float angle = seed + index * 0.8975979 + sin(seed * 3.0 + index * 1.9) * 0.35;\r
    float reach = sqrt(radius) * (0.75 + 0.45 * fract(sin(seed * 7.1 + index * 3.7) * 43.7));\r
    float drop = radius * (0.08 + 0.12 * fract(sin(seed * 2.9 + index * 5.3) * 31.9));\r
    vec2 q = d - vec2(cos(angle), sin(angle)) * reach;\r
    ink += exp(-dot(q, q) / drop) * mix(colorA, colorB, fract(index * 0.37 + 0.2));\r
  }\r
  outColor = vec4(texture(uTarget, vUv).xyz + ink, 1.0);\r
}\`,\r
  advection: \`uniform sampler2D uVelocity;\r
uniform sampler2D uSource;\r
uniform vec2 texelSize;\r
uniform float dt;\r
uniform float dissipation;\r
void main() {\r
  vec2 coord = vUv - dt * texture(uVelocity, vUv).xy * texelSize;\r
  outColor = texture(uSource, coord) / (1.0 + dissipation * dt);\r
}\`,\r
  divergence: \`uniform sampler2D uVelocity;\r
void main() {\r
  float L = texture(uVelocity, vL).x;\r
  float R = texture(uVelocity, vR).x;\r
  float T = texture(uVelocity, vT).y;\r
  float B = texture(uVelocity, vB).y;\r
  vec2 C = texture(uVelocity, vUv).xy;\r
  if (vL.x < 0.0) L = -C.x;\r
  if (vR.x > 1.0) R = -C.x;\r
  if (vT.y > 1.0) T = -C.y;\r
  if (vB.y < 0.0) B = -C.y;\r
  outColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);\r
}\`,\r
  curl: \`uniform sampler2D uVelocity;\r
void main() {\r
  float L = texture(uVelocity, vL).y;\r
  float R = texture(uVelocity, vR).y;\r
  float T = texture(uVelocity, vT).x;\r
  float B = texture(uVelocity, vB).x;\r
  outColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);\r
}\`,\r
  vorticity: \`uniform sampler2D uVelocity;\r
uniform sampler2D uCurl;\r
uniform float curl;\r
uniform float dt;\r
void main() {\r
  float L = texture(uCurl, vL).x;\r
  float R = texture(uCurl, vR).x;\r
  float T = texture(uCurl, vT).x;\r
  float B = texture(uCurl, vB).x;\r
  float C = texture(uCurl, vUv).x;\r
  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));\r
  force /= length(force) + 0.0001;\r
  force *= curl * C;\r
  force.y *= -1.0;\r
  vec2 velocity = texture(uVelocity, vUv).xy + force * dt;\r
  outColor = vec4(clamp(velocity, -1000.0, 1000.0), 0.0, 1.0);\r
}\`,\r
  pressure: \`uniform sampler2D uPressure;\r
uniform sampler2D uDivergence;\r
void main() {\r
  float L = texture(uPressure, vL).x;\r
  float R = texture(uPressure, vR).x;\r
  float T = texture(uPressure, vT).x;\r
  float B = texture(uPressure, vB).x;\r
  float divergence = texture(uDivergence, vUv).x;\r
  outColor = vec4((L + R + B + T - divergence) * 0.25, 0.0, 0.0, 1.0);\r
}\`,\r
  gradient: \`uniform sampler2D uPressure;\r
uniform sampler2D uVelocity;\r
void main() {\r
  float L = texture(uPressure, vL).x;\r
  float R = texture(uPressure, vR).x;\r
  float T = texture(uPressure, vT).x;\r
  float B = texture(uPressure, vB).x;\r
  vec2 velocity = texture(uVelocity, vUv).xy - vec2(R - L, T - B);\r
  outColor = vec4(velocity, 0.0, 1.0);\r
}\`,\r
  prefilter: \`uniform sampler2D uTexture;\r
uniform vec3 curve;\r
uniform float threshold;\r
void main() {\r
  vec3 c = texture(uTexture, vUv).rgb;\r
  float br = max(c.r, max(c.g, c.b));\r
  float rq = clamp(br - curve.x, 0.0, curve.y);\r
  rq = curve.z * rq * rq;\r
  c *= max(rq, br - threshold) / max(br, 0.0001);\r
  outColor = vec4(c, 0.0);\r
}\`,\r
  blur: \`uniform sampler2D uTexture;\r
uniform float intensity;\r
void main() {\r
  vec4 sum = texture(uTexture, vL) + texture(uTexture, vR) + texture(uTexture, vT) + texture(uTexture, vB);\r
  outColor = sum * 0.25 * intensity;\r
}\`,\r
  display: \`uniform sampler2D uTexture;\r
uniform sampler2D uBloom;\r
uniform vec2 texelSize;\r
uniform float shading;\r
uniform float bloom;\r
uniform float light;\r
float hash(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * 0.1031);\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.x + q.y) * q.z);\r
}\r
void main() {\r
  vec3 c = texture(uTexture, vUv).rgb;\r
  if (shading > 0.0) {\r
    float dx = length(texture(uTexture, vR).rgb) - length(texture(uTexture, vL).rgb);\r
    float dy = length(texture(uTexture, vT).rgb) - length(texture(uTexture, vB).rgb);\r
    vec3 n = normalize(vec3(dx, dy, length(texelSize)));\r
    c *= mix(1.0, clamp(n.z + 0.7, 0.7, 1.0), shading);\r
  }\r
  if (bloom > 0.0) {\r
    c += max(texture(uBloom, vUv).rgb, 0.0) * bloom;\r
  }\r
  c = max(c, 0.0);\r
  float peak = max(c.r, max(c.g, c.b));\r
  float grain = (hash(gl_FragCoord.xy) - 0.5) / 255.0 * smoothstep(0.0, 0.03, peak);\r
  if (light > 0.5) {\r
    vec3 transmit = exp(-2.4 * c);\r
    float low = min(transmit.r, min(transmit.g, transmit.b));\r
    float alpha = clamp(1.0 - low + grain, 0.0, 1.0);\r
    outColor = vec4(min(transmit - low, vec3(alpha)), alpha);\r
  } else {\r
    c = max(c + grain, 0.0);\r
    float alpha = clamp(max(c.r, max(c.g, c.b)), 0.0, 1.0);\r
    outColor = vec4(min(c, vec3(alpha)), alpha);\r
  }\r
}\`\r
};\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const parseColor = (value: string): RGB => {\r
  let hex = String(value).replace('#', '').trim();\r
  if (hex.length === 3) hex = [...hex].map(char => char + char).join('');\r
  const number = parseInt(hex.slice(0, 6), 16);\r
  if (Number.isNaN(number)) return [1, 1, 1];\r
  return [((number >> 16) & 255) / 255, ((number >> 8) & 255) / 255, (number & 255) / 255];\r
};\r
\r
const hsv = (h: number, s: number, v: number): RGB => {\r
  const i = Math.floor(h * 6);\r
  const f = h * 6 - i;\r
  const p = v * (1 - s);\r
  const q = v * (1 - f * s);\r
  const t = v * (1 - (1 - f) * s);\r
  const sector = ((i % 6) + 6) % 6;\r
  if (sector === 0) return [v, t, p];\r
  if (sector === 1) return [q, v, p];\r
  if (sector === 2) return [p, v, t];\r
  if (sector === 3) return [p, q, v];\r
  if (sector === 4) return [t, p, v];\r
  return [v, p, q];\r
};\r
\r
function SplashCursor({\r
  colors = ['#4f8cff', '#2dd4bf', '#ffd166'],\r
  rainbow = true,\r
  colorSpeed = 1,\r
  intensity = 1,\r
  size = 1,\r
  force = 1,\r
  swirl = 3,\r
  trail = 1,\r
  momentum = 1,\r
  shading = 1,\r
  glow = 0,\r
  quality = 'high',\r
  clickSplash = true,\r
  intro = true,\r
  contained = false,\r
  theme = 'dark',\r
  zIndex = 50,\r
  className = '',\r
  style\r
}: SplashCursorProps) {\r
  const rootRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const [generation, setGeneration] = useState(0);\r
\r
  const settings = {\r
    palette: (Array.isArray(colors) && colors.length ? colors : ['#ffffff']).map(parseColor),\r
    rainbow,\r
    colorSpeed: Math.max(0, colorSpeed),\r
    intensity: Math.max(0, intensity),\r
    size: Math.max(0.05, size),\r
    force: Math.max(0, force),\r
    swirl: Math.max(0, swirl),\r
    trail: Math.max(0.05, trail),\r
    momentum: Math.max(0.05, momentum),\r
    shading: clamp(shading, 0, 1),\r
    glow: clamp(glow, 0, 1),\r
    quality: QUALITY[quality] ? quality : 'high',\r
    clickSplash,\r
    contained,\r
    light: theme === 'light'\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
  const introRef = useRef(intro);\r
\r
  useEffect(() => {\r
    const parent = rootRef.current?.parentElement;\r
    if (!contained || !parent || getComputedStyle(parent).position !== 'static') return undefined;\r
    const previous = parent.style.position;\r
    parent.style.position = 'relative';\r
    return () => {\r
      parent.style.position = previous;\r
    };\r
  }, [contained]);\r
\r
  useEffect(() => {\r
    const canvas = canvasRef.current;\r
    if (!canvas) return undefined;\r
    const gl = canvas.getContext('webgl2', {\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false,\r
      preserveDrawingBuffer: false\r
    });\r
    if (!gl) return undefined;\r
    gl.getExtension('EXT_color_buffer_float');\r
    gl.getExtension('EXT_color_buffer_half_float');\r
\r
    const renderable = (internal: number, format: number) => {\r
      const texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, internal, 4, 4, 0, format, gl.HALF_FLOAT, null);\r
      const fbo = gl.createFramebuffer();\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
      const complete = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.deleteFramebuffer(fbo);\r
      gl.deleteTexture(texture);\r
      return complete;\r
    };\r
    const rgba: Format = { internal: gl.RGBA16F, format: gl.RGBA };\r
    if (!renderable(rgba.internal, rgba.format)) return undefined;\r
    const rg: Format = renderable(gl.RG16F, gl.RG) ? { internal: gl.RG16F, format: gl.RG } : rgba;\r
    const r: Format = renderable(gl.R16F, gl.RED) ? { internal: gl.R16F, format: gl.RED } : rg;\r
\r
    const compile = (type: number, source: string) => {\r
      const shader = gl.createShader(type) as WebGLShader;\r
      gl.shaderSource(shader, source);\r
      gl.compileShader(shader);\r
      return shader;\r
    };\r
    const vertex = compile(gl.VERTEX_SHADER, VERTEX);\r
    const programs: Record<string, { program: WebGLProgram; uniforms: Uniforms }> = {};\r
    let broken = false;\r
    Object.entries(SHADERS).forEach(([name, body]) => {\r
      const fragment = compile(gl.FRAGMENT_SHADER, HEADER + body);\r
      const program = gl.createProgram() as WebGLProgram;\r
      gl.attachShader(program, vertex);\r
      gl.attachShader(program, fragment);\r
      gl.bindAttribLocation(program, 0, 'aPosition');\r
      gl.linkProgram(program);\r
      gl.deleteShader(fragment);\r
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) broken = true;\r
      const uniforms: Uniforms = {};\r
      const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
      for (let i = 0; i < count; i++) {\r
        const info = gl.getActiveUniform(program, i);\r
        if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
      }\r
      programs[name] = { program, uniforms };\r
    });\r
    gl.deleteShader(vertex);\r
\r
    const buffer = gl.createBuffer();\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const targets = new Set<Target>();\r
    let disposed = false;\r
    let lost = false;\r
\r
    const release = () => {\r
      if (gl.isContextLost()) return;\r
      targets.forEach(target => {\r
        gl.deleteFramebuffer(target.fbo);\r
        gl.deleteTexture(target.texture);\r
      });\r
      targets.clear();\r
      Object.values(programs).forEach(item => gl.deleteProgram(item.program));\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
    };\r
\r
    if (broken) {\r
      release();\r
      return undefined;\r
    }\r
\r
    const use = (name: string) => {\r
      const item = programs[name];\r
      gl.useProgram(item.program);\r
      return item.uniforms;\r
    };\r
\r
    const blit = (target: Target | null) => {\r
      if (target) {\r
        gl.viewport(0, 0, target.width, target.height);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);\r
      } else {\r
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      }\r
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);\r
    };\r
\r
    const createTarget = (width: number, height: number, format: Format, filter: number): Target => {\r
      gl.activeTexture(gl.TEXTURE0);\r
      const texture = gl.createTexture() as WebGLTexture;\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, format.internal, width, height, 0, format.format, gl.HALF_FLOAT, null);\r
      const fbo = gl.createFramebuffer() as WebGLFramebuffer;\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
      gl.viewport(0, 0, width, height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      const target = {\r
        texture,\r
        fbo,\r
        width,\r
        height,\r
        texelX: 1 / width,\r
        texelY: 1 / height,\r
        attach: (unit: number) => {\r
          gl.activeTexture(gl.TEXTURE0 + unit);\r
          gl.bindTexture(gl.TEXTURE_2D, texture);\r
          return unit;\r
        }\r
      };\r
      targets.add(target);\r
      return target;\r
    };\r
\r
    const destroyTarget = (target: Target | null) => {\r
      if (!target) return;\r
      gl.deleteFramebuffer(target.fbo);\r
      gl.deleteTexture(target.texture);\r
      targets.delete(target);\r
    };\r
\r
    const reshape = (target: Target, width: number, height: number, format: Format) => {\r
      gl.bindTexture(gl.TEXTURE_2D, target.texture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, format.internal, width, height, 0, format.format, gl.HALF_FLOAT, null);\r
      target.width = width;\r
      target.height = height;\r
      target.texelX = 1 / width;\r
      target.texelY = 1 / height;\r
    };\r
\r
    const createDouble = (width: number, height: number, format: Format, filter: number) => {\r
      const pair: DoubleTarget = {\r
        read: createTarget(width, height, format, filter),\r
        write: createTarget(width, height, format, filter),\r
        width,\r
        height,\r
        texelX: 1 / width,\r
        texelY: 1 / height,\r
        swap: () => {\r
          const current = pair.read;\r
          pair.read = pair.write;\r
          pair.write = current;\r
        }\r
      };\r
      return pair;\r
    };\r
\r
    const resizeDouble = (\r
      pair: DoubleTarget,\r
      width: number,\r
      height: number,\r
      format: Format,\r
      filter: number,\r
      keep: boolean\r
    ) => {\r
      if (keep) {\r
        const next = createTarget(width, height, format, filter);\r
        const u = use('copy');\r
        gl.uniform1i(u.uTexture, pair.read.attach(0));\r
        blit(next);\r
        destroyTarget(pair.read);\r
        pair.read = next;\r
      } else {\r
        reshape(pair.read, width, height, format);\r
      }\r
      reshape(pair.write, width, height, format);\r
      pair.width = width;\r
      pair.height = height;\r
      pair.texelX = 1 / width;\r
      pair.texelY = 1 / height;\r
    };\r
\r
    const resolution = (base: number) => {\r
      const width = gl.drawingBufferWidth;\r
      const height = gl.drawingBufferHeight;\r
      const aspect = Math.max(width, height) / Math.max(1, Math.min(width, height));\r
      const short = Math.round(base);\r
      const long = Math.round(base * aspect);\r
      return width > height ? { width: long, height: short } : { width: short, height: long };\r
    };\r
\r
    const fit = () => {\r
      const ratio = Math.min(window.devicePixelRatio || 1, 2);\r
      const width = Math.max(1, Math.floor(canvas.clientWidth * ratio));\r
      const height = Math.max(1, Math.floor(canvas.clientHeight * ratio));\r
      if (canvas.width === width && canvas.height === height) return;\r
      canvas.width = width;\r
      canvas.height = height;\r
    };\r
\r
    const sizes = () => {\r
      const q = QUALITY[settingsRef.current.quality];\r
      const shortSide = Math.min(gl.drawingBufferWidth, gl.drawingBufferHeight);\r
      return { sim: resolution(q.sim), ink: resolution(Math.max(q.sim, Math.min(q.dye, shortSide))) };\r
    };\r
\r
    fit();\r
    const initial = sizes();\r
    const dye = createDouble(initial.ink.width, initial.ink.height, rgba, gl.LINEAR);\r
    const velocity = createDouble(initial.sim.width, initial.sim.height, rg, gl.LINEAR);\r
    const pressure = createDouble(initial.sim.width, initial.sim.height, r, gl.NEAREST);\r
    const divergence = createTarget(initial.sim.width, initial.sim.height, r, gl.NEAREST);\r
    const curl = createTarget(initial.sim.width, initial.sim.height, r, gl.NEAREST);\r
    let bloom: Target | null = null;\r
    let bloomChain: Target[] = [];\r
\r
    const dropBloom = () => {\r
      destroyTarget(bloom);\r
      bloomChain.forEach(destroyTarget);\r
      bloom = null;\r
      bloomChain = [];\r
    };\r
\r
    const ensureBloom = () => {\r
      if (bloom) return bloom;\r
      const size = resolution(BLOOM_RESOLUTION);\r
      const created = createTarget(size.width, size.height, rgba, gl.LINEAR);\r
      for (let i = 0; i < BLOOM_ITERATIONS; i++) {\r
        const width = size.width >> (i + 1);\r
        const height = size.height >> (i + 1);\r
        if (width < 2 || height < 2) break;\r
        bloomChain.push(createTarget(width, height, rgba, gl.LINEAR));\r
      }\r
      bloom = created;\r
      return created;\r
    };\r
\r
    const resize = () => {\r
      fit();\r
      const next = sizes();\r
      if (dye.width !== next.ink.width || dye.height !== next.ink.height) {\r
        resizeDouble(dye, next.ink.width, next.ink.height, rgba, gl.LINEAR, true);\r
      }\r
      if (velocity.width !== next.sim.width || velocity.height !== next.sim.height) {\r
        resizeDouble(velocity, next.sim.width, next.sim.height, rg, gl.LINEAR, true);\r
        resizeDouble(pressure, next.sim.width, next.sim.height, r, gl.NEAREST, false);\r
        reshape(divergence, next.sim.width, next.sim.height, r);\r
        reshape(curl, next.sim.width, next.sim.height, r);\r
      }\r
      const glowSize = resolution(BLOOM_RESOLUTION);\r
      if (bloom && (bloom.width !== glowSize.width || bloom.height !== glowSize.height)) dropBloom();\r
    };\r
\r
    const radiusFor = (scale: number) => {\r
      const aspect = canvas.width / canvas.height;\r
      return ((0.2 * settingsRef.current.size * scale) / 100) * (aspect > 1 ? aspect : 1);\r
    };\r
\r
    const splat = (\r
      ax: number,\r
      ay: number,\r
      bx: number,\r
      by: number,\r
      vx: number,\r
      vy: number,\r
      color: number[],\r
      radius: number\r
    ) => {\r
      const u = use('splat');\r
      gl.uniform1i(u.uTarget, velocity.read.attach(0));\r
      gl.uniform1f(u.aspectRatio, canvas.width / canvas.height);\r
      gl.uniform2f(u.pointA, ax, ay);\r
      gl.uniform2f(u.pointB, bx, by);\r
      gl.uniform3f(u.color, vx, vy, 0);\r
      gl.uniform1f(u.radius, radius);\r
      blit(velocity.write);\r
      velocity.swap();\r
      gl.uniform1i(u.uTarget, dye.read.attach(0));\r
      gl.uniform3f(u.color, color[0], color[1], color[2]);\r
      blit(dye.write);\r
      dye.swap();\r
    };\r
\r
    const colorAt = (offset: number, now: number): RGB => {\r
      const s = settingsRef.current;\r
      const phase = (((offset + (now / 1000) * s.colorSpeed * 0.6) % 1) + 1) % 1;\r
      if (s.rainbow) return hsv(phase, 1, 1);\r
      const palette = s.palette;\r
      if (palette.length === 1) return palette[0];\r
      const position = phase * palette.length;\r
      const from = palette[Math.floor(position) % palette.length];\r
      const to = palette[(Math.floor(position) + 1) % palette.length];\r
      const t = position - Math.floor(position);\r
      const blend = t * t * (3 - 2 * t);\r
      return [\r
        from[0] + (to[0] - from[0]) * blend,\r
        from[1] + (to[1] - from[1]) * blend,\r
        from[2] + (to[2] - from[2]) * blend\r
      ];\r
    };\r
\r
    const inkFor = (color: RGB, amount: number) =>\r
      color.map(channel => (settingsRef.current.light ? 1 - channel : channel) * amount);\r
\r
    const flush = (pointer: Pointer, dt: number, now: number) => {\r
      const s = settingsRef.current;\r
      const aspect = canvas.width / canvas.height;\r
      const length = Math.hypot((pointer.x - pointer.px) * aspect, pointer.y - pointer.py);\r
      if (length > 0.35) {\r
        pointer.px = pointer.x;\r
        pointer.py = pointer.y;\r
        return;\r
      }\r
      let dx = pointer.x - pointer.px;\r
      let dy = pointer.y - pointer.py;\r
      if (aspect < 1) dx *= aspect;\r
      else dy /= aspect;\r
      const radius = radiusFor(1);\r
      const spread = 1 + length / (1.77 * Math.sqrt(radius));\r
      const push = (6000 * s.force) / Math.sqrt(spread);\r
      const amount = (0.15 * s.intensity * Math.min(dt * 60, 1)) / Math.sqrt(spread);\r
      const color = inkFor(colorAt(pointer.offset, now), amount);\r
      splat(pointer.px, pointer.py, pointer.x, pointer.y, dx * push, dy * push, color, radius);\r
      pointer.px = pointer.x;\r
      pointer.py = pointer.y;\r
    };\r
\r
    const burst = (x: number, y: number, now: number) => {\r
      const s = settingsRef.current;\r
      const seed = Math.random() * Math.PI * 2;\r
      const aspect = canvas.width / canvas.height;\r
      let u = use('burst');\r
      gl.uniform1i(u.uTarget, velocity.read.attach(0));\r
      gl.uniform1f(u.aspectRatio, aspect);\r
      gl.uniform2f(u.point, x, y);\r
      gl.uniform1f(u.radius, radiusFor(3));\r
      gl.uniform1f(u.strength, 1100 * s.force);\r
      gl.uniform1f(u.seed, seed);\r
      blit(velocity.write);\r
      velocity.swap();\r
      const offset = Math.random();\r
      const amount = 1.6 * s.intensity;\r
      const first = inkFor(colorAt(offset, now), amount);\r
      const second = inkFor(colorAt(offset + 0.3, now), amount);\r
      u = use('crown');\r
      gl.uniform1i(u.uTarget, dye.read.attach(0));\r
      gl.uniform1f(u.aspectRatio, aspect);\r
      gl.uniform2f(u.point, x, y);\r
      gl.uniform1f(u.radius, radiusFor(1.6));\r
      gl.uniform3f(u.colorA, first[0], first[1], first[2]);\r
      gl.uniform3f(u.colorB, second[0], second[1], second[2]);\r
      gl.uniform1f(u.seed, seed);\r
      blit(dye.write);\r
      dye.swap();\r
    };\r
\r
    const step = (dt: number) => {\r
      const s = settingsRef.current;\r
      const iterations = QUALITY[s.quality].iterations;\r
      gl.disable(gl.BLEND);\r
\r
      let u = use('curl');\r
      gl.uniform2f(u.texelSize, velocity.texelX, velocity.texelY);\r
      gl.uniform1i(u.uVelocity, velocity.read.attach(0));\r
      blit(curl);\r
\r
      u = use('vorticity');\r
      gl.uniform2f(u.texelSize, velocity.texelX, velocity.texelY);\r
      gl.uniform1i(u.uVelocity, velocity.read.attach(0));\r
      gl.uniform1i(u.uCurl, curl.attach(1));\r
      gl.uniform1f(u.curl, s.swirl);\r
      gl.uniform1f(u.dt, dt);\r
      blit(velocity.write);\r
      velocity.swap();\r
\r
      u = use('divergence');\r
      gl.uniform2f(u.texelSize, velocity.texelX, velocity.texelY);\r
      gl.uniform1i(u.uVelocity, velocity.read.attach(0));\r
      blit(divergence);\r
\r
      u = use('clear');\r
      gl.uniform1i(u.uTexture, pressure.read.attach(0));\r
      gl.uniform1f(u.value, 0.1);\r
      blit(pressure.write);\r
      pressure.swap();\r
\r
      u = use('pressure');\r
      gl.uniform2f(u.texelSize, velocity.texelX, velocity.texelY);\r
      gl.uniform1i(u.uDivergence, divergence.attach(0));\r
      for (let i = 0; i < iterations; i++) {\r
        gl.uniform1i(u.uPressure, pressure.read.attach(1));\r
        blit(pressure.write);\r
        pressure.swap();\r
      }\r
\r
      u = use('gradient');\r
      gl.uniform2f(u.texelSize, velocity.texelX, velocity.texelY);\r
      gl.uniform1i(u.uPressure, pressure.read.attach(0));\r
      gl.uniform1i(u.uVelocity, velocity.read.attach(1));\r
      blit(velocity.write);\r
      velocity.swap();\r
\r
      u = use('advection');\r
      gl.uniform2f(u.texelSize, velocity.texelX, velocity.texelY);\r
      gl.uniform1i(u.uVelocity, velocity.read.attach(0));\r
      gl.uniform1i(u.uSource, velocity.read.attach(0));\r
      gl.uniform1f(u.dt, dt);\r
      gl.uniform1f(u.dissipation, 2 / s.momentum);\r
      blit(velocity.write);\r
      velocity.swap();\r
\r
      gl.uniform1i(u.uVelocity, velocity.read.attach(0));\r
      gl.uniform1i(u.uSource, dye.read.attach(1));\r
      gl.uniform1f(u.dissipation, 3.5 / s.trail);\r
      blit(dye.write);\r
      dye.swap();\r
    };\r
\r
    const applyBloom = (amount: number) => {\r
      const base = ensureBloom();\r
      if (!bloomChain.length) return;\r
      gl.disable(gl.BLEND);\r
      let u = use('prefilter');\r
      const knee = BLOOM_THRESHOLD * BLOOM_KNEE + 0.0001;\r
      gl.uniform3f(u.curve, BLOOM_THRESHOLD - knee, knee * 2, 0.25 / knee);\r
      gl.uniform1f(u.threshold, BLOOM_THRESHOLD);\r
      gl.uniform1i(u.uTexture, dye.read.attach(0));\r
      blit(base);\r
      u = use('blur');\r
      gl.uniform1f(u.intensity, 1);\r
      let last = base;\r
      bloomChain.forEach(target => {\r
        gl.uniform2f(u.texelSize, last.texelX, last.texelY);\r
        gl.uniform1i(u.uTexture, last.attach(0));\r
        blit(target);\r
        last = target;\r
      });\r
      gl.blendFunc(gl.ONE, gl.ONE);\r
      gl.enable(gl.BLEND);\r
      for (let i = bloomChain.length - 2; i >= 0; i--) {\r
        const target = bloomChain[i];\r
        gl.uniform2f(u.texelSize, last.texelX, last.texelY);\r
        gl.uniform1i(u.uTexture, last.attach(0));\r
        blit(target);\r
        last = target;\r
      }\r
      gl.disable(gl.BLEND);\r
      gl.uniform1f(u.intensity, amount);\r
      gl.uniform2f(u.texelSize, last.texelX, last.texelY);\r
      gl.uniform1i(u.uTexture, last.attach(0));\r
      blit(base);\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      if (s.glow > 0) applyBloom(2 * s.glow);\r
      gl.disable(gl.BLEND);\r
      const u = use('display');\r
      gl.uniform2f(u.texelSize, 1 / gl.drawingBufferWidth, 1 / gl.drawingBufferHeight);\r
      gl.uniform1i(u.uTexture, dye.read.attach(0));\r
      gl.uniform1i(u.uBloom, (bloom ?? dye.read).attach(1));\r
      gl.uniform1f(u.shading, s.shading);\r
      gl.uniform1f(u.bloom, s.glow > 0 ? 1 : 0);\r
      gl.uniform1f(u.light, s.light ? 1 : 0);\r
      blit(null);\r
    };\r
\r
    const clearScreen = () => {\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
    };\r
\r
    const pointers = new Map<string, Pointer>();\r
    const bursts: { x: number; y: number }[] = [];\r
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const introPointer: Pointer = { x: 0, y: 0, px: 0, py: 0, ready: false, moved: false, offset: Math.random() };\r
    let introStart = introRef.current && !reduced ? performance.now() + 150 : -1;\r
    let raf = 0;\r
    let last = 0;\r
    let lastActivity = performance.now();\r
\r
    const advanceIntro = (now: number) => {\r
      if (introStart < 0) return;\r
      const progress = (now - introStart) / 1100;\r
      if (progress < 0) return;\r
      const t = Math.min(progress, 1);\r
      const eased = t * t * (3 - 2 * t);\r
      const x = 0.2 + 0.6 * eased;\r
      const y = 0.5 + 0.12 * Math.sin(eased * Math.PI * 2);\r
      if (!introPointer.ready) {\r
        introPointer.x = introPointer.px = x;\r
        introPointer.y = introPointer.py = y;\r
        introPointer.ready = true;\r
      } else {\r
        introPointer.x = x;\r
        introPointer.y = y;\r
        introPointer.moved = true;\r
      }\r
      if (t >= 1) introStart = -1;\r
      lastActivity = now;\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (disposed || lost) return;\r
      const s = settingsRef.current;\r
      const dt = clamp((now - last) / 1000, 0, 1 / 60);\r
      last = now;\r
      resize();\r
      advanceIntro(now);\r
      if (introPointer.moved) {\r
        introPointer.moved = false;\r
        flush(introPointer, dt, now);\r
      }\r
      pointers.forEach(pointer => {\r
        if (!pointer.moved) return;\r
        pointer.moved = false;\r
        flush(pointer, dt, now);\r
      });\r
      bursts.splice(0).forEach(point => burst(point.x, point.y, now));\r
      step(dt);\r
      render();\r
      const quiet = (2.2 * s.trail + 0.4) * 1000;\r
      if (introStart >= 0 || now - lastActivity < quiet) raf = requestAnimationFrame(frame);\r
      else clearScreen();\r
    };\r
\r
    const wake = () => {\r
      lastActivity = performance.now();\r
      if (raf || disposed || lost) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const locate = (clientX: number, clientY: number) => {\r
      const rect = canvas.getBoundingClientRect();\r
      if (!rect.width || !rect.height) return null;\r
      const x = (clientX - rect.left) / rect.width;\r
      const y = 1 - (clientY - rect.top) / rect.height;\r
      if (settingsRef.current.contained && (x < 0 || x > 1 || y < 0 || y > 1)) return null;\r
      return { x, y };\r
    };\r
\r
    const track = (id: string, clientX: number, clientY: number) => {\r
      const point = locate(clientX, clientY);\r
      let pointer = pointers.get(id);\r
      if (!point) {\r
        if (pointer) pointer.ready = false;\r
        return;\r
      }\r
      if (!pointer) {\r
        pointer = { x: 0, y: 0, px: 0, py: 0, ready: false, moved: false, offset: Math.random() };\r
        pointers.set(id, pointer);\r
      }\r
      if (!pointer.ready) {\r
        pointer.x = pointer.px = point.x;\r
        pointer.y = pointer.py = point.y;\r
        pointer.ready = true;\r
        return;\r
      }\r
      pointer.x = point.x;\r
      pointer.y = point.y;\r
      pointer.moved = true;\r
      wake();\r
    };\r
\r
    const press = (clientX: number, clientY: number) => {\r
      if (!settingsRef.current.clickSplash) return;\r
      const point = locate(clientX, clientY);\r
      if (!point) return;\r
      bursts.push(point);\r
      wake();\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      if (event.pointerType !== 'touch') track(\`p\${event.pointerId}\`, event.clientX, event.clientY);\r
    };\r
    const onPointerDown = (event: PointerEvent) => {\r
      if (event.pointerType !== 'touch') press(event.clientX, event.clientY);\r
    };\r
    const onTouchStart = (event: TouchEvent) => {\r
      Array.from(event.changedTouches).forEach(touch => {\r
        pointers.delete(\`t\${touch.identifier}\`);\r
        track(\`t\${touch.identifier}\`, touch.clientX, touch.clientY);\r
        press(touch.clientX, touch.clientY);\r
      });\r
    };\r
    const onTouchMove = (event: TouchEvent) => {\r
      Array.from(event.changedTouches).forEach(touch => track(\`t\${touch.identifier}\`, touch.clientX, touch.clientY));\r
    };\r
    const onTouchEnd = (event: TouchEvent) => {\r
      Array.from(event.changedTouches).forEach(touch => pointers.delete(\`t\${touch.identifier}\`));\r
    };\r
    const onLeave = () => {\r
      pointers.forEach(pointer => {\r
        pointer.ready = false;\r
      });\r
    };\r
    const onLost = (event: Event) => {\r
      event.preventDefault();\r
      lost = true;\r
      cancelAnimationFrame(raf);\r
      raf = 0;\r
    };\r
    const onRestored = () => setGeneration(value => value + 1);\r
\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    window.addEventListener('touchstart', onTouchStart, { passive: true });\r
    window.addEventListener('touchmove', onTouchMove, { passive: true });\r
    window.addEventListener('touchend', onTouchEnd, { passive: true });\r
    window.addEventListener('touchcancel', onTouchEnd, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onLeave);\r
    canvas.addEventListener('webglcontextlost', onLost);\r
    canvas.addEventListener('webglcontextrestored', onRestored);\r
\r
    resize();\r
    if (introStart >= 0) wake();\r
\r
    return () => {\r
      disposed = true;\r
      cancelAnimationFrame(raf);\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('touchstart', onTouchStart);\r
      window.removeEventListener('touchmove', onTouchMove);\r
      window.removeEventListener('touchend', onTouchEnd);\r
      window.removeEventListener('touchcancel', onTouchEnd);\r
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
      canvas.removeEventListener('webglcontextlost', onLost);\r
      canvas.removeEventListener('webglcontextrestored', onRestored);\r
      release();\r
    };\r
  }, [generation]);\r
\r
  return (\r
    <div\r
      ref={rootRef}\r
      className={[ROOT, className].filter(Boolean).join(' ')}\r
      style={{ zIndex, ...style }}\r
      data-contained={contained ? '' : undefined}\r
      aria-hidden="true"\r
    >\r
      <canvas ref={canvasRef} className={CANVAS} />\r
    </div>\r
  );\r
}\r
\r
export default SplashCursor;\r
`,i={usage:`import SplashCursor from './SplashCursor';

<SplashCursor
  rainbow
  size={1}
  force={1}
  swirl={3}
  trail={1}
  clickSplash
/>`,code:r,css:n,tailwind:e,tsCode:t,tsTailwind:o};export{i as splashCursor};
