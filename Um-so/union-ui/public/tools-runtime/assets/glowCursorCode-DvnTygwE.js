const r=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
import './GlowCursor.css';\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
uniform vec2 uTexel;\r
out vec2 vUv;\r
out vec2 vL;\r
out vec2 vR;\r
out vec2 vT;\r
out vec2 vB;\r
void main() {\r
  vUv = aPosition * 0.5 + 0.5;\r
  vL = vUv - vec2(uTexel.x, 0.0);\r
  vR = vUv + vec2(uTexel.x, 0.0);\r
  vT = vUv + vec2(0.0, uTexel.y);\r
  vB = vUv - vec2(0.0, uTexel.y);\r
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
const SPLAT = \`\${HEADER}\r
uniform sampler2D uTarget;\r
uniform float uAspect;\r
uniform vec2 uA;\r
uniform vec2 uB;\r
uniform float uRadius;\r
uniform float uWide;\r
uniform vec3 uValue;\r
uniform float uMode;\r
uniform float uStrength;\r
float erf(float x) {\r
  float x2 = x * x;\r
  float a = 0.147;\r
  return sign(x) * sqrt(1.0 - exp(-x2 * (1.2732395 + a * x2) / (1.0 + a * x2)));\r
}\r
float sweep(float along, float length, float across, float radius) {\r
  return exp(-across * across / (radius * radius)) * 0.5 * (erf(along / radius) - erf((along - length) / radius));\r
}\r
void main() {\r
  vec2 p = vec2(vUv.x * uAspect, vUv.y);\r
  vec2 a = vec2(uA.x * uAspect, uA.y);\r
  vec2 ab = vec2(uB.x * uAspect, uB.y) - a;\r
  float len = length(ab);\r
  vec2 dir = len > 1e-6 ? ab / len : vec2(1.0, 0.0);\r
  vec2 ap = p - a;\r
  vec3 base = texture(uTarget, vUv).xyz;\r
  if (uMode > 1.5) {\r
    float along = dot(ap, dir);\r
    float across = dot(ap, vec2(-dir.y, dir.x));\r
    if (uMode > 2.5) {\r
      outColor = vec4(mix(base, uValue, sweep(along, len, across, uRadius) * uStrength), 1.0);\r
      return;\r
    }\r
    vec3 add = vec3(uValue.xy * sweep(along, len, across, uRadius), uValue.z * sweep(along, len, across, uWide));\r
    outColor = vec4(base + add, 1.0);\r
    return;\r
  }\r
  float h = clamp(dot(ap, ab) / max(dot(ab, ab), 1e-9), 0.0, 1.0);\r
  vec2 d = ap - ab * h;\r
  float r2 = dot(d, d);\r
  float falloff = exp(-r2 / (uRadius * uRadius));\r
  float wide = exp(-r2 / (uWide * uWide));\r
  vec3 result = uMode > 0.5 ? mix(base, uValue, falloff * uStrength) : base + vec3(uValue.xy * falloff, uValue.z * wide);\r
  outColor = vec4(result, 1.0);\r
}\`;\r
\r
const ADVECT = \`\${HEADER}\r
uniform sampler2D uVelocity;\r
uniform sampler2D uSource;\r
uniform vec2 uVelocityTexel;\r
uniform float uDt;\r
uniform vec4 uDecay;\r
void main() {\r
  vec2 coord = vUv - uDt * texture(uVelocity, vUv).xy * uVelocityTexel;\r
  outColor = texture(uSource, coord) * uDecay;\r
}\`;\r
\r
const MACCORMACK = \`\${HEADER}\r
uniform sampler2D uVelocity;\r
uniform sampler2D uSource;\r
uniform sampler2D uForward;\r
uniform sampler2D uBack;\r
uniform vec2 uVelocityTexel;\r
uniform vec2 uSourceTexel;\r
uniform float uDt;\r
uniform vec4 uDecay;\r
void main() {\r
  vec2 coord = vUv - uDt * texture(uVelocity, vUv).xy * uVelocityTexel;\r
  vec4 forward = texture(uForward, vUv);\r
  vec4 corrected = forward + 0.5 * (texture(uSource, vUv) - texture(uBack, vUv));\r
  vec2 base = (floor(coord / uSourceTexel - 0.5) + 0.5) * uSourceTexel;\r
  vec4 a = texture(uSource, base);\r
  vec4 b = texture(uSource, base + vec2(uSourceTexel.x, 0.0));\r
  vec4 c = texture(uSource, base + vec2(0.0, uSourceTexel.y));\r
  vec4 d = texture(uSource, base + uSourceTexel);\r
  vec4 low = min(min(a, b), min(c, d));\r
  vec4 high = max(max(a, b), max(c, d));\r
  outColor = clamp(corrected, low, high) * uDecay;\r
}\`;\r
\r
const DIVERGENCE = \`\${HEADER}\r
uniform sampler2D uVelocity;\r
void main() {\r
  float left = texture(uVelocity, vL).x;\r
  float right = texture(uVelocity, vR).x;\r
  float top = texture(uVelocity, vT).y;\r
  float bottom = texture(uVelocity, vB).y;\r
  vec2 center = texture(uVelocity, vUv).xy;\r
  if (vL.x < 0.0) left = -center.x;\r
  if (vR.x > 1.0) right = -center.x;\r
  if (vT.y > 1.0) top = -center.y;\r
  if (vB.y < 0.0) bottom = -center.y;\r
  outColor = vec4(0.5 * (right - left + top - bottom), 0.0, 0.0, 1.0);\r
}\`;\r
\r
const SCALE = \`\${HEADER}\r
uniform sampler2D uSource;\r
uniform float uValue;\r
void main() {\r
  outColor = texture(uSource, vUv) * uValue;\r
}\`;\r
\r
const PRESSURE = \`\${HEADER}\r
uniform sampler2D uPressure;\r
uniform sampler2D uDivergence;\r
void main() {\r
  float left = texture(uPressure, vL).x;\r
  float right = texture(uPressure, vR).x;\r
  float top = texture(uPressure, vT).x;\r
  float bottom = texture(uPressure, vB).x;\r
  float divergence = texture(uDivergence, vUv).x;\r
  outColor = vec4((left + right + bottom + top - divergence) * 0.25, 0.0, 0.0, 1.0);\r
}\`;\r
\r
const GRADIENT = \`\${HEADER}\r
uniform sampler2D uPressure;\r
uniform sampler2D uVelocity;\r
void main() {\r
  float left = texture(uPressure, vL).x;\r
  float right = texture(uPressure, vR).x;\r
  float top = texture(uPressure, vT).x;\r
  float bottom = texture(uPressure, vB).x;\r
  vec2 velocity = texture(uVelocity, vUv).xy - vec2(right - left, top - bottom);\r
  outColor = vec4(velocity, 0.0, 1.0);\r
}\`;\r
\r
const SHADE = \`\r
uniform vec3 uColor;\r
uniform vec3 uSecondary;\r
uniform float uIntensity;\r
uniform float uHotspot;\r
vec3 shade(vec3 dye) {\r
  float energy = max(dye.x, 0.0);\r
  float heat = clamp(dye.y, 0.0, energy);\r
  float gas = max(dye.z, 0.0);\r
  float fresh = heat / max(energy, 0.0001);\r
  vec3 tint = mix(uSecondary, uColor, fresh);\r
  return (tint * energy + uSecondary * gas + vec3(heat * heat * 0.3 * uHotspot)) * uIntensity;\r
}\r
\`;\r
\r
const PREFILTER = \`\${HEADER}\${SHADE}\r
uniform sampler2D uDye;\r
uniform vec2 uDyeTexel;\r
void main() {\r
  vec2 o = uDyeTexel * 0.5;\r
  vec3 light = shade(texture(uDye, vUv + vec2(-o.x, -o.y)).xyz);\r
  light += shade(texture(uDye, vUv + vec2(o.x, -o.y)).xyz);\r
  light += shade(texture(uDye, vUv + vec2(-o.x, o.y)).xyz);\r
  light += shade(texture(uDye, vUv + vec2(o.x, o.y)).xyz);\r
  outColor = vec4(light * 0.25, 1.0);\r
}\`;\r
\r
const DOWN = \`\${HEADER}\r
uniform sampler2D uSource;\r
uniform vec2 uSourceTexel;\r
void main() {\r
  vec2 o = uSourceTexel;\r
  vec3 color = texture(uSource, vUv).rgb * 4.0;\r
  color += texture(uSource, vUv + vec2(-o.x, -o.y)).rgb;\r
  color += texture(uSource, vUv + vec2(o.x, -o.y)).rgb;\r
  color += texture(uSource, vUv + vec2(-o.x, o.y)).rgb;\r
  color += texture(uSource, vUv + vec2(o.x, o.y)).rgb;\r
  outColor = vec4(color / 8.0, 1.0);\r
}\`;\r
\r
const UP = \`\${HEADER}\r
uniform sampler2D uSource;\r
uniform vec2 uSourceTexel;\r
void main() {\r
  vec2 o = uSourceTexel;\r
  vec3 color = texture(uSource, vUv + vec2(-o.x * 2.0, 0.0)).rgb;\r
  color += texture(uSource, vUv + vec2(o.x * 2.0, 0.0)).rgb;\r
  color += texture(uSource, vUv + vec2(0.0, -o.y * 2.0)).rgb;\r
  color += texture(uSource, vUv + vec2(0.0, o.y * 2.0)).rgb;\r
  color += texture(uSource, vUv + vec2(-o.x, -o.y)).rgb * 2.0;\r
  color += texture(uSource, vUv + vec2(o.x, -o.y)).rgb * 2.0;\r
  color += texture(uSource, vUv + vec2(-o.x, o.y)).rgb * 2.0;\r
  color += texture(uSource, vUv + vec2(o.x, o.y)).rgb * 2.0;\r
  outColor = vec4(color / 12.0, 1.0);\r
}\`;\r
\r
const DISPLAY = \`\${HEADER}\${SHADE}\r
uniform sampler2D uDye;\r
uniform sampler2D uBloom;\r
uniform float uGlow;\r
uniform float uGrain;\r
uniform float uTime;\r
uniform float uLight;\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
void main() {\r
  vec3 dye = texture(uDye, vUv).xyz;\r
  vec3 light = shade(dye);\r
  vec3 bloom = texture(uBloom, vUv).rgb * uGlow;\r
  float edge = smoothstep(0.0, 0.02, min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y)));\r
  float grain = 1.0 + (hash(gl_FragCoord.xy + fract(uTime * 13.7) * 97.0) - 0.5) * uGrain * 2.0;\r
  if (uLight > 0.5) {\r
    float energy = max(dye.x, 0.0);\r
    float heat = clamp(dye.y, 0.0, energy);\r
    float gas = max(dye.z, 0.0);\r
    float fresh = heat / max(energy, 0.0001);\r
    vec3 tint = mix(uSecondary, uColor, fresh);\r
    float halo = dot(bloom, vec3(0.2126, 0.7152, 0.0722));\r
    float density = 1.0 - exp(-((energy * 1.1 + gas * 0.8) * uIntensity + halo * 0.25));\r
    float tone = dot(tint, vec3(0.2126, 0.7152, 0.0722));\r
    vec3 ink = tint * min(1.0, 0.5 / max(tone, 0.001)) * mix(0.95, 0.72, smoothstep(0.5, 3.0, energy));\r
    ink = mix(ink, vec3(1.0), clamp(heat * heat * 0.05 * uHotspot, 0.0, 0.45));\r
    density = clamp(density * grain, 0.0, 1.0) * edge;\r
    outColor = vec4(ink * density, density);\r
  } else {\r
    vec3 color = 1.0 - exp(-(light + bloom) * grain);\r
    color *= edge;\r
    outColor = vec4(color, max(color.r, max(color.g, color.b)));\r
  }\r
}\`;\r
\r
const QUALITY = {\r
  low: { sim: 96, dye: 384 },\r
  medium: { sim: 128, dye: 576 },\r
  high: { sim: 160, dye: 768 }\r
};\r
\r
const PRESSURE_STEPS = 20;\r
const FLOW = 0.75;\r
const BLOOM_LEVELS = 5;\r
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
const toHsv = ([r, g, b]) => {\r
  const max = Math.max(r, g, b);\r
  const min = Math.min(r, g, b);\r
  const delta = max - min;\r
  let hue = 0;\r
  if (delta > 0) {\r
    if (max === r) hue = ((g - b) / delta) % 6;\r
    else if (max === g) hue = (b - r) / delta + 2;\r
    else hue = (r - g) / delta + 4;\r
  }\r
  return [(hue * 60 + 360) % 360, max > 0 ? delta / max : 0, max];\r
};\r
\r
const fromHsv = (hue, saturation, value) => {\r
  const h = (((hue % 360) + 360) % 360) / 60;\r
  const c = value * saturation;\r
  const x = c * (1 - Math.abs((h % 2) - 1));\r
  const m = value - c;\r
  const [r, g, b] =\r
    h < 1 ? [c, x, 0] : h < 2 ? [x, c, 0] : h < 3 ? [0, c, x] : h < 4 ? [0, x, c] : h < 5 ? [x, 0, c] : [c, 0, x];\r
  return [r + m, g + m, b + m];\r
};\r
\r
const GlowCursor = ({\r
  color = '#5f8bff',\r
  secondaryColor,\r
  intensity = 1.3,\r
  trailWidth = 3,\r
  linger = 1.4,\r
  glow = 1.2,\r
  hotspot = 0.8,\r
  followSpeed = 0.6,\r
  grain = 0,\r
  clickBurst = true,\r
  quality = 'high',\r
  theme = 'dark',\r
  blendMode,\r
  maxDevicePixelRatio = 2,\r
  enabled = true,\r
  children,\r
  className = '',\r
  style,\r
  ...rest\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const settingsRef = useRef(null);\r
  settingsRef.current = {\r
    color: String(color),\r
    secondaryColor: secondaryColor ? String(secondaryColor) : '',\r
    intensity: Math.max(0, intensity),\r
    trailWidth: clamp(trailWidth, 0.5, 40),\r
    linger: clamp(linger, 0.1, 10),\r
    glow: Math.max(0, glow),\r
    hotspot: Math.max(0, hotspot),\r
    followSpeed: clamp(followSpeed, 0, 1),\r
    grain: Math.max(0, grain),\r
    clickBurst,\r
    quality: QUALITY[quality] ? quality : 'high',\r
    theme,\r
    maxDevicePixelRatio,\r
    enabled\r
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
      stencil: false\r
    });\r
    if (!container || !canvas || !gl || !gl.getExtension('EXT_color_buffer_float')) return undefined;\r
\r
    const vertexShader = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
    if (!vertexShader) return undefined;\r
\r
    const build = source => {\r
      const fragment = compile(gl, gl.FRAGMENT_SHADER, source);\r
      const program = gl.createProgram();\r
      if (!fragment || !program) return null;\r
      gl.attachShader(program, vertexShader);\r
      gl.attachShader(program, fragment);\r
      gl.bindAttribLocation(program, 0, 'aPosition');\r
      gl.linkProgram(program);\r
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
    const passes = {\r
      splat: build(SPLAT),\r
      advect: build(ADVECT),\r
      maccormack: build(MACCORMACK),\r
      divergence: build(DIVERGENCE),\r
      scale: build(SCALE),\r
      pressure: build(PRESSURE),\r
      gradient: build(GRADIENT),\r
      prefilter: build(PREFILTER),\r
      down: build(DOWN),\r
      up: build(UP),\r
      display: build(DISPLAY)\r
    };\r
    if (Object.values(passes).some(pass => !pass)) return undefined;\r
\r
    const vao = gl.createVertexArray();\r
    const buffer = gl.createBuffer();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const probe = document.createElement('canvas');\r
    probe.width = 1;\r
    probe.height = 1;\r
    const probeContext = probe.getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
\r
    const state = {\r
      width: 1,\r
      height: 1,\r
      ratio: 1,\r
      colorKey: '',\r
      color: [0.37, 0.55, 1],\r
      secondary: [0.25, 0.3, 1],\r
      pointer: { x: 0, y: 0, inside: false },\r
      emitter: { x: 0, y: 0, vx: 0, vy: 0, px: 0, py: 0, travelled: 0 },\r
      ready: false,\r
      bursts: [],\r
      active: -Infinity,\r
      time: 0,\r
      allocated: '',\r
      targets: null\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let alive = true;\r
    let visible = true;\r
\r
    const toRgb = (value, fallback) => {\r
      if (!probeContext || !value) return fallback;\r
      const css = /^[0-9a-f]{3,8}$/i.test(value) ? \`#\${value}\` : value;\r
      probeContext.clearRect(0, 0, 1, 1);\r
      probeContext.fillStyle = '#000000';\r
      probeContext.fillStyle = css;\r
      probeContext.fillRect(0, 0, 1, 1);\r
      const [r, g, b] = probeContext.getImageData(0, 0, 1, 1).data;\r
      return [r / 255, g / 255, b / 255];\r
    };\r
\r
    const resolveColors = s => {\r
      const key = \`\${s.color}|\${s.secondaryColor}\`;\r
      if (key === state.colorKey) return;\r
      state.colorKey = key;\r
      state.color = toRgb(s.color, [0.37, 0.55, 1]);\r
      if (s.secondaryColor) {\r
        state.secondary = toRgb(s.secondaryColor, state.color);\r
      } else {\r
        const [hue, saturation, value] = toHsv(state.color);\r
        state.secondary = fromHsv(hue + 8, Math.min(1, saturation * 1.1 + 0.05), value);\r
      }\r
    };\r
\r
    const createTarget = (width, height, internalFormat, format, filter) => {\r
      const texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, format, gl.HALF_FLOAT, null);\r
      const fbo = gl.createFramebuffer();\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
      gl.viewport(0, 0, width, height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      return { texture, fbo, width, height, texel: [1 / width, 1 / height] };\r
    };\r
\r
    const createPair = (width, height, internalFormat, format, filter) => {\r
      let read = createTarget(width, height, internalFormat, format, filter);\r
      let write = createTarget(width, height, internalFormat, format, filter);\r
      return {\r
        get read() {\r
          return read;\r
        },\r
        get write() {\r
          return write;\r
        },\r
        swap() {\r
          const next = read;\r
          read = write;\r
          write = next;\r
        },\r
        targets() {\r
          return [read, write];\r
        }\r
      };\r
    };\r
\r
    const destroyTarget = target => {\r
      gl.deleteTexture(target.texture);\r
      gl.deleteFramebuffer(target.fbo);\r
    };\r
\r
    const release = () => {\r
      const t = state.targets;\r
      if (!t) return;\r
      [\r
        ...t.velocity.targets(),\r
        ...t.dye.targets(),\r
        ...t.pressure.targets(),\r
        t.divergence,\r
        t.forward,\r
        t.back,\r
        ...t.bloom\r
      ].forEach(destroyTarget);\r
      state.targets = null;\r
    };\r
\r
    const clearTargets = () => {\r
      const t = state.targets;\r
      if (!t) return;\r
      gl.clearColor(0, 0, 0, 0);\r
      [...t.velocity.targets(), ...t.dye.targets(), ...t.pressure.targets()].forEach(target => {\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);\r
        gl.clear(gl.COLOR_BUFFER_BIT);\r
      });\r
    };\r
\r
    const allocate = () => {\r
      const s = settingsRef.current;\r
      const key = \`\${s.quality}|\${state.width}|\${state.height}|\${canvas.width}|\${canvas.height}\`;\r
      if (key === state.allocated && state.targets) return;\r
      release();\r
      state.allocated = key;\r
      const preset = QUALITY[s.quality];\r
      const aspect = state.width / state.height;\r
      const dims = base => (aspect >= 1 ? [Math.round(base * aspect), base] : [base, Math.round(base / aspect)]);\r
      const [simW, simH] = dims(preset.sim);\r
      let [dyeW, dyeH] = dims(preset.dye);\r
      const shrink = Math.min(1, canvas.width / dyeW, canvas.height / dyeH);\r
      dyeW = Math.max(2, Math.round(dyeW * shrink));\r
      dyeH = Math.max(2, Math.round(dyeH * shrink));\r
      const bloom = [];\r
      let bloomW = dyeW >> 1;\r
      let bloomH = dyeH >> 1;\r
      for (let i = 0; i < BLOOM_LEVELS; i++) {\r
        bloom.push(createTarget(Math.max(1, bloomW), Math.max(1, bloomH), gl.RGBA16F, gl.RGBA, gl.LINEAR));\r
        bloomW >>= 1;\r
        bloomH >>= 1;\r
      }\r
      state.targets = {\r
        velocity: createPair(simW, simH, gl.RG16F, gl.RG, gl.LINEAR),\r
        dye: createPair(dyeW, dyeH, gl.RGBA16F, gl.RGBA, gl.LINEAR),\r
        forward: createTarget(dyeW, dyeH, gl.RGBA16F, gl.RGBA, gl.LINEAR),\r
        back: createTarget(dyeW, dyeH, gl.RGBA16F, gl.RGBA, gl.LINEAR),\r
        pressure: createPair(simW, simH, gl.R16F, gl.RED, gl.NEAREST),\r
        divergence: createTarget(simW, simH, gl.R16F, gl.RED, gl.NEAREST),\r
        bloom\r
      };\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const ratio = Math.min(window.devicePixelRatio || 1, Math.max(0.5, s.maxDevicePixelRatio || 2));\r
      const pixelWidth = Math.max(1, Math.round(width * ratio));\r
      const pixelHeight = Math.max(1, Math.round(height * ratio));\r
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {\r
        canvas.width = pixelWidth;\r
        canvas.height = pixelHeight;\r
      }\r
      state.width = width;\r
      state.height = height;\r
      state.ratio = ratio;\r
      allocate();\r
    };\r
\r
    const draw = target => {\r
      if (target) {\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);\r
        gl.viewport(0, 0, target.width, target.height);\r
      } else {\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
        gl.viewport(0, 0, canvas.width, canvas.height);\r
      }\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const use = (pass, texel) => {\r
      gl.useProgram(pass.program);\r
      if (pass.uniforms.uTexel) gl.uniform2f(pass.uniforms.uTexel, texel[0], texel[1]);\r
      return pass.uniforms;\r
    };\r
\r
    const bind = (unit, target) => {\r
      gl.activeTexture(gl.TEXTURE0 + unit);\r
      gl.bindTexture(gl.TEXTURE_2D, target.texture);\r
      return unit;\r
    };\r
\r
    const splat = (pair, ax, ay, bx, by, radius, value, mode, strength, wide = radius) => {\r
      const u = use(passes.splat, pair.read.texel);\r
      gl.uniform1i(u.uTarget, bind(0, pair.read));\r
      gl.uniform1f(u.uAspect, state.width / state.height);\r
      gl.uniform2f(u.uA, ax / state.width, 1 - ay / state.height);\r
      gl.uniform2f(u.uB, bx / state.width, 1 - by / state.height);\r
      gl.uniform1f(u.uRadius, radius / state.height);\r
      gl.uniform1f(u.uWide, wide / state.height);\r
      gl.uniform3f(u.uValue, value[0], value[1], value[2]);\r
      gl.uniform1f(u.uMode, mode);\r
      gl.uniform1f(u.uStrength, strength);\r
      draw(pair.write);\r
      pair.swap();\r
    };\r
\r
    const toGrid = (vx, vy) => {\r
      const { velocity } = state.targets;\r
      return [(vx * velocity.read.width) / state.width, (-vy * velocity.read.height) / state.height];\r
    };\r
\r
    const lightRadius = s => Math.max(s.trailWidth * 0.5, (state.height / state.targets.dye.read.height) * 0.9);\r
\r
    const emit = (s, dt, now) => {\r
      const { emitter, pointer } = state;\r
      const { velocity, dye } = state.targets;\r
      emitter.px = emitter.x;\r
      emitter.py = emitter.y;\r
      if (reduce || s.followSpeed >= 1) {\r
        emitter.x = pointer.x;\r
        emitter.y = pointer.y;\r
      } else {\r
        const omega = 10 + s.followSpeed * 50;\r
        const steps = Math.max(1, Math.ceil(dt / 0.004));\r
        const h = dt / steps;\r
        for (let k = 0; k < steps; k++) {\r
          emitter.vx += (omega * omega * (pointer.x - emitter.x) - 2 * omega * emitter.vx) * h;\r
          emitter.vy += (omega * omega * (pointer.y - emitter.y) - 2 * omega * emitter.vy) * h;\r
          emitter.x += emitter.vx * h;\r
          emitter.y += emitter.vy * h;\r
        }\r
      }\r
      const dx = emitter.x - emitter.px;\r
      const dy = emitter.y - emitter.py;\r
      const length = Math.hypot(dx, dy);\r
      if (length < 0.05 || !s.enabled) return;\r
      const radius = lightRadius(s);\r
      if (!reduce) {\r
        const target = toGrid(dx / Math.max(dt, 1e-3), dy / Math.max(dt, 1e-3));\r
        splat(\r
          velocity,\r
          emitter.px,\r
          emitter.py,\r
          emitter.x,\r
          emitter.y,\r
          radius * 4 + 18,\r
          [target[0], target[1], 0],\r
          3,\r
          FLOW * 0.6\r
        );\r
      }\r
      splat(dye, emitter.px, emitter.py, emitter.x, emitter.y, radius, [5.6, 5.6, 0.7], 2, 1, radius * 5 + 6);\r
      state.active = now;\r
    };\r
\r
    const burst = (s, x, y, now) => {\r
      const { velocity, dye } = state.targets;\r
      const radius = lightRadius(s);\r
      const jets = 6;\r
      const base = Math.random() * Math.PI * 2;\r
      for (let k = 0; k < jets; k++) {\r
        const angle = base + (k / jets) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;\r
        const cx = Math.cos(angle);\r
        const cy = Math.sin(angle);\r
        const reach = 20 + Math.random() * 14;\r
        const ax = x + cx * 3;\r
        const ay = y + cy * 3;\r
        const bx = x + cx * reach;\r
        const by = y + cy * reach;\r
        if (!reduce) {\r
          const target = toGrid(Math.cos(angle + 0.6) * 760, Math.sin(angle + 0.6) * 760);\r
          splat(velocity, ax, ay, bx, by, 18, [target[0], target[1], 0], 1, 0.9);\r
        }\r
        splat(dye, ax, ay, bx, by, radius * 1.1, [2.4, 2.4, 0.3], 0, 1, radius * 5 + 6);\r
      }\r
      splat(dye, x, y, x + 0.01, y, radius * 2.2, [1.8, 1.8, 0.4], 0, 1, radius * 7 + 10);\r
      state.active = now;\r
    };\r
\r
    const step = (s, dt) => {\r
      const { velocity, dye, pressure, divergence } = state.targets;\r
      if (!reduce) {\r
        let u = use(passes.divergence, velocity.read.texel);\r
        gl.uniform1i(u.uVelocity, bind(0, velocity.read));\r
        draw(divergence);\r
\r
        u = use(passes.scale, pressure.read.texel);\r
        gl.uniform1i(u.uSource, bind(0, pressure.read));\r
        gl.uniform1f(u.uValue, 0.8);\r
        draw(pressure.write);\r
        pressure.swap();\r
\r
        u = use(passes.pressure, pressure.read.texel);\r
        gl.uniform1i(u.uDivergence, bind(1, divergence));\r
        for (let i = 0; i < PRESSURE_STEPS; i++) {\r
          gl.uniform1i(u.uPressure, bind(0, pressure.read));\r
          draw(pressure.write);\r
          pressure.swap();\r
        }\r
\r
        u = use(passes.gradient, velocity.read.texel);\r
        gl.uniform1i(u.uPressure, bind(0, pressure.read));\r
        gl.uniform1i(u.uVelocity, bind(1, velocity.read));\r
        draw(velocity.write);\r
        velocity.swap();\r
\r
        u = use(passes.advect, velocity.read.texel);\r
        gl.uniform2f(u.uVelocityTexel, velocity.read.texel[0], velocity.read.texel[1]);\r
        gl.uniform1i(u.uVelocity, bind(0, velocity.read));\r
        gl.uniform1i(u.uSource, bind(0, velocity.read));\r
        gl.uniform1f(u.uDt, dt);\r
        const calm = Math.exp(-dt * 1.2);\r
        gl.uniform4f(u.uDecay, calm, calm, 1, 1);\r
        draw(velocity.write);\r
        velocity.swap();\r
      }\r
\r
      const decay = [\r
        Math.exp((-dt * 4.6) / (s.linger * 0.8)),\r
        Math.exp((-dt * 4.6) / (s.linger * 0.2)),\r
        Math.exp((-dt * 4.6) / (s.linger * 1.2)),\r
        1\r
      ];\r
      const { forward, back } = state.targets;\r
      if (reduce) {\r
        const u = use(passes.advect, dye.read.texel);\r
        gl.uniform2f(u.uVelocityTexel, velocity.read.texel[0], velocity.read.texel[1]);\r
        gl.uniform1i(u.uVelocity, bind(0, velocity.read));\r
        gl.uniform1i(u.uSource, bind(1, dye.read));\r
        gl.uniform1f(u.uDt, 0);\r
        gl.uniform4f(u.uDecay, decay[0], decay[1], decay[2], decay[3]);\r
        draw(dye.write);\r
        dye.swap();\r
        return;\r
      }\r
      let u = use(passes.advect, dye.read.texel);\r
      gl.uniform2f(u.uVelocityTexel, velocity.read.texel[0], velocity.read.texel[1]);\r
      gl.uniform1i(u.uVelocity, bind(0, velocity.read));\r
      gl.uniform1i(u.uSource, bind(1, dye.read));\r
      gl.uniform1f(u.uDt, dt);\r
      gl.uniform4f(u.uDecay, 1, 1, 1, 1);\r
      draw(forward);\r
      gl.uniform1i(u.uSource, bind(1, forward));\r
      gl.uniform1f(u.uDt, -dt);\r
      draw(back);\r
      u = use(passes.maccormack, dye.read.texel);\r
      gl.uniform2f(u.uVelocityTexel, velocity.read.texel[0], velocity.read.texel[1]);\r
      gl.uniform2f(u.uSourceTexel, dye.read.texel[0], dye.read.texel[1]);\r
      gl.uniform1i(u.uVelocity, bind(0, velocity.read));\r
      gl.uniform1i(u.uSource, bind(1, dye.read));\r
      gl.uniform1i(u.uForward, bind(2, forward));\r
      gl.uniform1i(u.uBack, bind(3, back));\r
      gl.uniform1f(u.uDt, dt);\r
      gl.uniform4f(u.uDecay, decay[0], decay[1], decay[2], decay[3]);\r
      draw(dye.write);\r
      dye.swap();\r
    };\r
\r
    const setShade = (u, s) => {\r
      gl.uniform3f(u.uColor, state.color[0], state.color[1], state.color[2]);\r
      gl.uniform3f(u.uSecondary, state.secondary[0], state.secondary[1], state.secondary[2]);\r
      gl.uniform1f(u.uIntensity, s.intensity);\r
      gl.uniform1f(u.uHotspot, s.hotspot);\r
    };\r
\r
    const render = s => {\r
      const { dye, bloom } = state.targets;\r
      if (s.glow > 0) {\r
        let u = use(passes.prefilter, bloom[0].texel);\r
        gl.uniform1i(u.uDye, bind(0, dye.read));\r
        gl.uniform2f(u.uDyeTexel, dye.read.texel[0], dye.read.texel[1]);\r
        setShade(u, s);\r
        draw(bloom[0]);\r
        u = use(passes.down, bloom[0].texel);\r
        for (let i = 1; i < bloom.length; i++) {\r
          gl.uniform1i(u.uSource, bind(0, bloom[i - 1]));\r
          gl.uniform2f(u.uSourceTexel, bloom[i - 1].texel[0], bloom[i - 1].texel[1]);\r
          draw(bloom[i]);\r
        }\r
        gl.enable(gl.BLEND);\r
        gl.blendFunc(gl.ONE, gl.ONE);\r
        u = use(passes.up, bloom[0].texel);\r
        for (let i = bloom.length - 1; i > 0; i--) {\r
          gl.uniform1i(u.uSource, bind(0, bloom[i]));\r
          gl.uniform2f(u.uSourceTexel, bloom[i].texel[0], bloom[i].texel[1]);\r
          draw(bloom[i - 1]);\r
        }\r
        gl.disable(gl.BLEND);\r
      }\r
      const u = use(passes.display, [1 / canvas.width, 1 / canvas.height]);\r
      gl.uniform1i(u.uDye, bind(0, dye.read));\r
      gl.uniform1i(u.uBloom, bind(1, bloom[0]));\r
      setShade(u, s);\r
      gl.uniform1f(u.uGlow, s.glow > 0 ? (s.glow * 1.4) / BLOOM_LEVELS : 0);\r
      gl.uniform1f(u.uGrain, s.grain);\r
      gl.uniform1f(u.uTime, state.time);\r
      gl.uniform1f(u.uLight, s.theme === 'light' ? 1 : 0);\r
      draw(null);\r
    };\r
\r
    const blank = () => {\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!alive || !visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(1 / 30, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      state.time += dt;\r
      const wanted = Math.min(window.devicePixelRatio || 1, Math.max(0.5, s.maxDevicePixelRatio || 2));\r
      if (Math.abs(wanted - state.ratio) > 0.01) resize();\r
      allocate();\r
      resolveColors(s);\r
      gl.bindVertexArray(vao);\r
      gl.disable(gl.BLEND);\r
\r
      if (state.ready) emit(s, dt, now);\r
      while (state.bursts.length) {\r
        const [x, y] = state.bursts.shift();\r
        burst(s, x, y, now);\r
      }\r
      step(s, dt);\r
      render(s);\r
\r
      const quiet = now - state.active > s.linger * 1200 + 900;\r
      const resting = Math.hypot(state.emitter.vx, state.emitter.vy) < 1;\r
      if (quiet && resting) {\r
        clearTargets();\r
        blank();\r
        last = 0;\r
        return;\r
      }\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (!raf && alive && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const onPointerMove = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      const inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      if (!inside) {\r
        if (state.pointer.inside) {\r
          state.pointer.inside = false;\r
          state.ready = false;\r
          wake();\r
        }\r
        return;\r
      }\r
      if (!state.ready) {\r
        state.emitter.x = x;\r
        state.emitter.y = y;\r
        state.emitter.px = x;\r
        state.emitter.py = y;\r
        state.emitter.vx = 0;\r
        state.emitter.vy = 0;\r
        state.ready = true;\r
      }\r
      state.pointer.x = x;\r
      state.pointer.y = y;\r
      state.pointer.inside = true;\r
      wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      if (!s.clickBurst || !s.enabled) return;\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;\r
      state.bursts.push([x, y]);\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      state.pointer.inside = false;\r
      state.ready = false;\r
      wake();\r
    };\r
\r
    const onVisibility = () => {\r
      last = 0;\r
      wake();\r
    };\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      resize();\r
      wake();\r
    });\r
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
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
    blank();\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      release();\r
      Object.values(passes).forEach(pass => gl.deleteProgram(pass.program));\r
      gl.deleteShader(vertexShader);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
    };\r
  }, []);\r
\r
  const mode = blendMode ?? (theme === 'light' ? 'normal' : 'screen');\r
\r
  return (\r
    <div ref={containerRef} className={\`glow-cursor\${className ? \` \${className}\` : ''}\`} style={style} {...rest}>\r
      <canvas ref={canvasRef} className="glow-cursor__canvas" style={{ mixBlendMode: mode }} aria-hidden="true" />\r
      {children && <div className="glow-cursor__content">{children}</div>}\r
    </div>\r
  );\r
};\r
\r
export default GlowCursor;\r
`,e=`.glow-cursor {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.glow-cursor__canvas {\r
  position: absolute;\r
  inset: 0;\r
  display: block;\r
  width: 100%;\r
  height: 100%;\r
  pointer-events: none;\r
  user-select: none;\r
}\r
\r
.glow-cursor__content {\r
  position: relative;\r
  z-index: 1;\r
  width: 100%;\r
  height: 100%;\r
}\r
`,n=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
uniform vec2 uTexel;\r
out vec2 vUv;\r
out vec2 vL;\r
out vec2 vR;\r
out vec2 vT;\r
out vec2 vB;\r
void main() {\r
  vUv = aPosition * 0.5 + 0.5;\r
  vL = vUv - vec2(uTexel.x, 0.0);\r
  vR = vUv + vec2(uTexel.x, 0.0);\r
  vT = vUv + vec2(0.0, uTexel.y);\r
  vB = vUv - vec2(0.0, uTexel.y);\r
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
const SPLAT = \`\${HEADER}\r
uniform sampler2D uTarget;\r
uniform float uAspect;\r
uniform vec2 uA;\r
uniform vec2 uB;\r
uniform float uRadius;\r
uniform float uWide;\r
uniform vec3 uValue;\r
uniform float uMode;\r
uniform float uStrength;\r
float erf(float x) {\r
  float x2 = x * x;\r
  float a = 0.147;\r
  return sign(x) * sqrt(1.0 - exp(-x2 * (1.2732395 + a * x2) / (1.0 + a * x2)));\r
}\r
float sweep(float along, float length, float across, float radius) {\r
  return exp(-across * across / (radius * radius)) * 0.5 * (erf(along / radius) - erf((along - length) / radius));\r
}\r
void main() {\r
  vec2 p = vec2(vUv.x * uAspect, vUv.y);\r
  vec2 a = vec2(uA.x * uAspect, uA.y);\r
  vec2 ab = vec2(uB.x * uAspect, uB.y) - a;\r
  float len = length(ab);\r
  vec2 dir = len > 1e-6 ? ab / len : vec2(1.0, 0.0);\r
  vec2 ap = p - a;\r
  vec3 base = texture(uTarget, vUv).xyz;\r
  if (uMode > 1.5) {\r
    float along = dot(ap, dir);\r
    float across = dot(ap, vec2(-dir.y, dir.x));\r
    if (uMode > 2.5) {\r
      outColor = vec4(mix(base, uValue, sweep(along, len, across, uRadius) * uStrength), 1.0);\r
      return;\r
    }\r
    vec3 add = vec3(uValue.xy * sweep(along, len, across, uRadius), uValue.z * sweep(along, len, across, uWide));\r
    outColor = vec4(base + add, 1.0);\r
    return;\r
  }\r
  float h = clamp(dot(ap, ab) / max(dot(ab, ab), 1e-9), 0.0, 1.0);\r
  vec2 d = ap - ab * h;\r
  float r2 = dot(d, d);\r
  float falloff = exp(-r2 / (uRadius * uRadius));\r
  float wide = exp(-r2 / (uWide * uWide));\r
  vec3 result = uMode > 0.5 ? mix(base, uValue, falloff * uStrength) : base + vec3(uValue.xy * falloff, uValue.z * wide);\r
  outColor = vec4(result, 1.0);\r
}\`;\r
\r
const ADVECT = \`\${HEADER}\r
uniform sampler2D uVelocity;\r
uniform sampler2D uSource;\r
uniform vec2 uVelocityTexel;\r
uniform float uDt;\r
uniform vec4 uDecay;\r
void main() {\r
  vec2 coord = vUv - uDt * texture(uVelocity, vUv).xy * uVelocityTexel;\r
  outColor = texture(uSource, coord) * uDecay;\r
}\`;\r
\r
const MACCORMACK = \`\${HEADER}\r
uniform sampler2D uVelocity;\r
uniform sampler2D uSource;\r
uniform sampler2D uForward;\r
uniform sampler2D uBack;\r
uniform vec2 uVelocityTexel;\r
uniform vec2 uSourceTexel;\r
uniform float uDt;\r
uniform vec4 uDecay;\r
void main() {\r
  vec2 coord = vUv - uDt * texture(uVelocity, vUv).xy * uVelocityTexel;\r
  vec4 forward = texture(uForward, vUv);\r
  vec4 corrected = forward + 0.5 * (texture(uSource, vUv) - texture(uBack, vUv));\r
  vec2 base = (floor(coord / uSourceTexel - 0.5) + 0.5) * uSourceTexel;\r
  vec4 a = texture(uSource, base);\r
  vec4 b = texture(uSource, base + vec2(uSourceTexel.x, 0.0));\r
  vec4 c = texture(uSource, base + vec2(0.0, uSourceTexel.y));\r
  vec4 d = texture(uSource, base + uSourceTexel);\r
  vec4 low = min(min(a, b), min(c, d));\r
  vec4 high = max(max(a, b), max(c, d));\r
  outColor = clamp(corrected, low, high) * uDecay;\r
}\`;\r
\r
const DIVERGENCE = \`\${HEADER}\r
uniform sampler2D uVelocity;\r
void main() {\r
  float left = texture(uVelocity, vL).x;\r
  float right = texture(uVelocity, vR).x;\r
  float top = texture(uVelocity, vT).y;\r
  float bottom = texture(uVelocity, vB).y;\r
  vec2 center = texture(uVelocity, vUv).xy;\r
  if (vL.x < 0.0) left = -center.x;\r
  if (vR.x > 1.0) right = -center.x;\r
  if (vT.y > 1.0) top = -center.y;\r
  if (vB.y < 0.0) bottom = -center.y;\r
  outColor = vec4(0.5 * (right - left + top - bottom), 0.0, 0.0, 1.0);\r
}\`;\r
\r
const SCALE = \`\${HEADER}\r
uniform sampler2D uSource;\r
uniform float uValue;\r
void main() {\r
  outColor = texture(uSource, vUv) * uValue;\r
}\`;\r
\r
const PRESSURE = \`\${HEADER}\r
uniform sampler2D uPressure;\r
uniform sampler2D uDivergence;\r
void main() {\r
  float left = texture(uPressure, vL).x;\r
  float right = texture(uPressure, vR).x;\r
  float top = texture(uPressure, vT).x;\r
  float bottom = texture(uPressure, vB).x;\r
  float divergence = texture(uDivergence, vUv).x;\r
  outColor = vec4((left + right + bottom + top - divergence) * 0.25, 0.0, 0.0, 1.0);\r
}\`;\r
\r
const GRADIENT = \`\${HEADER}\r
uniform sampler2D uPressure;\r
uniform sampler2D uVelocity;\r
void main() {\r
  float left = texture(uPressure, vL).x;\r
  float right = texture(uPressure, vR).x;\r
  float top = texture(uPressure, vT).x;\r
  float bottom = texture(uPressure, vB).x;\r
  vec2 velocity = texture(uVelocity, vUv).xy - vec2(right - left, top - bottom);\r
  outColor = vec4(velocity, 0.0, 1.0);\r
}\`;\r
\r
const SHADE = \`\r
uniform vec3 uColor;\r
uniform vec3 uSecondary;\r
uniform float uIntensity;\r
uniform float uHotspot;\r
vec3 shade(vec3 dye) {\r
  float energy = max(dye.x, 0.0);\r
  float heat = clamp(dye.y, 0.0, energy);\r
  float gas = max(dye.z, 0.0);\r
  float fresh = heat / max(energy, 0.0001);\r
  vec3 tint = mix(uSecondary, uColor, fresh);\r
  return (tint * energy + uSecondary * gas + vec3(heat * heat * 0.3 * uHotspot)) * uIntensity;\r
}\r
\`;\r
\r
const PREFILTER = \`\${HEADER}\${SHADE}\r
uniform sampler2D uDye;\r
uniform vec2 uDyeTexel;\r
void main() {\r
  vec2 o = uDyeTexel * 0.5;\r
  vec3 light = shade(texture(uDye, vUv + vec2(-o.x, -o.y)).xyz);\r
  light += shade(texture(uDye, vUv + vec2(o.x, -o.y)).xyz);\r
  light += shade(texture(uDye, vUv + vec2(-o.x, o.y)).xyz);\r
  light += shade(texture(uDye, vUv + vec2(o.x, o.y)).xyz);\r
  outColor = vec4(light * 0.25, 1.0);\r
}\`;\r
\r
const DOWN = \`\${HEADER}\r
uniform sampler2D uSource;\r
uniform vec2 uSourceTexel;\r
void main() {\r
  vec2 o = uSourceTexel;\r
  vec3 color = texture(uSource, vUv).rgb * 4.0;\r
  color += texture(uSource, vUv + vec2(-o.x, -o.y)).rgb;\r
  color += texture(uSource, vUv + vec2(o.x, -o.y)).rgb;\r
  color += texture(uSource, vUv + vec2(-o.x, o.y)).rgb;\r
  color += texture(uSource, vUv + vec2(o.x, o.y)).rgb;\r
  outColor = vec4(color / 8.0, 1.0);\r
}\`;\r
\r
const UP = \`\${HEADER}\r
uniform sampler2D uSource;\r
uniform vec2 uSourceTexel;\r
void main() {\r
  vec2 o = uSourceTexel;\r
  vec3 color = texture(uSource, vUv + vec2(-o.x * 2.0, 0.0)).rgb;\r
  color += texture(uSource, vUv + vec2(o.x * 2.0, 0.0)).rgb;\r
  color += texture(uSource, vUv + vec2(0.0, -o.y * 2.0)).rgb;\r
  color += texture(uSource, vUv + vec2(0.0, o.y * 2.0)).rgb;\r
  color += texture(uSource, vUv + vec2(-o.x, -o.y)).rgb * 2.0;\r
  color += texture(uSource, vUv + vec2(o.x, -o.y)).rgb * 2.0;\r
  color += texture(uSource, vUv + vec2(-o.x, o.y)).rgb * 2.0;\r
  color += texture(uSource, vUv + vec2(o.x, o.y)).rgb * 2.0;\r
  outColor = vec4(color / 12.0, 1.0);\r
}\`;\r
\r
const DISPLAY = \`\${HEADER}\${SHADE}\r
uniform sampler2D uDye;\r
uniform sampler2D uBloom;\r
uniform float uGlow;\r
uniform float uGrain;\r
uniform float uTime;\r
uniform float uLight;\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
void main() {\r
  vec3 dye = texture(uDye, vUv).xyz;\r
  vec3 light = shade(dye);\r
  vec3 bloom = texture(uBloom, vUv).rgb * uGlow;\r
  float edge = smoothstep(0.0, 0.02, min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y)));\r
  float grain = 1.0 + (hash(gl_FragCoord.xy + fract(uTime * 13.7) * 97.0) - 0.5) * uGrain * 2.0;\r
  if (uLight > 0.5) {\r
    float energy = max(dye.x, 0.0);\r
    float heat = clamp(dye.y, 0.0, energy);\r
    float gas = max(dye.z, 0.0);\r
    float fresh = heat / max(energy, 0.0001);\r
    vec3 tint = mix(uSecondary, uColor, fresh);\r
    float halo = dot(bloom, vec3(0.2126, 0.7152, 0.0722));\r
    float density = 1.0 - exp(-((energy * 1.1 + gas * 0.8) * uIntensity + halo * 0.25));\r
    float tone = dot(tint, vec3(0.2126, 0.7152, 0.0722));\r
    vec3 ink = tint * min(1.0, 0.5 / max(tone, 0.001)) * mix(0.95, 0.72, smoothstep(0.5, 3.0, energy));\r
    ink = mix(ink, vec3(1.0), clamp(heat * heat * 0.05 * uHotspot, 0.0, 0.45));\r
    density = clamp(density * grain, 0.0, 1.0) * edge;\r
    outColor = vec4(ink * density, density);\r
  } else {\r
    vec3 color = 1.0 - exp(-(light + bloom) * grain);\r
    color *= edge;\r
    outColor = vec4(color, max(color.r, max(color.g, color.b)));\r
  }\r
}\`;\r
\r
const QUALITY = {\r
  low: { sim: 96, dye: 384 },\r
  medium: { sim: 128, dye: 576 },\r
  high: { sim: 160, dye: 768 }\r
};\r
\r
const PRESSURE_STEPS = 20;\r
const FLOW = 0.75;\r
const BLOOM_LEVELS = 5;\r
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
const toHsv = ([r, g, b]) => {\r
  const max = Math.max(r, g, b);\r
  const min = Math.min(r, g, b);\r
  const delta = max - min;\r
  let hue = 0;\r
  if (delta > 0) {\r
    if (max === r) hue = ((g - b) / delta) % 6;\r
    else if (max === g) hue = (b - r) / delta + 2;\r
    else hue = (r - g) / delta + 4;\r
  }\r
  return [(hue * 60 + 360) % 360, max > 0 ? delta / max : 0, max];\r
};\r
\r
const fromHsv = (hue, saturation, value) => {\r
  const h = (((hue % 360) + 360) % 360) / 60;\r
  const c = value * saturation;\r
  const x = c * (1 - Math.abs((h % 2) - 1));\r
  const m = value - c;\r
  const [r, g, b] =\r
    h < 1 ? [c, x, 0] : h < 2 ? [x, c, 0] : h < 3 ? [0, c, x] : h < 4 ? [0, x, c] : h < 5 ? [x, 0, c] : [c, 0, x];\r
  return [r + m, g + m, b + m];\r
};\r
\r
const GlowCursor = ({\r
  color = '#5f8bff',\r
  secondaryColor,\r
  intensity = 1.3,\r
  trailWidth = 3,\r
  linger = 1.4,\r
  glow = 1.2,\r
  hotspot = 0.8,\r
  followSpeed = 0.6,\r
  grain = 0,\r
  clickBurst = true,\r
  quality = 'high',\r
  theme = 'dark',\r
  blendMode,\r
  maxDevicePixelRatio = 2,\r
  enabled = true,\r
  children,\r
  className = '',\r
  style,\r
  ...rest\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const settingsRef = useRef(null);\r
  settingsRef.current = {\r
    color: String(color),\r
    secondaryColor: secondaryColor ? String(secondaryColor) : '',\r
    intensity: Math.max(0, intensity),\r
    trailWidth: clamp(trailWidth, 0.5, 40),\r
    linger: clamp(linger, 0.1, 10),\r
    glow: Math.max(0, glow),\r
    hotspot: Math.max(0, hotspot),\r
    followSpeed: clamp(followSpeed, 0, 1),\r
    grain: Math.max(0, grain),\r
    clickBurst,\r
    quality: QUALITY[quality] ? quality : 'high',\r
    theme,\r
    maxDevicePixelRatio,\r
    enabled\r
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
      stencil: false\r
    });\r
    if (!container || !canvas || !gl || !gl.getExtension('EXT_color_buffer_float')) return undefined;\r
\r
    const vertexShader = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
    if (!vertexShader) return undefined;\r
\r
    const build = source => {\r
      const fragment = compile(gl, gl.FRAGMENT_SHADER, source);\r
      const program = gl.createProgram();\r
      if (!fragment || !program) return null;\r
      gl.attachShader(program, vertexShader);\r
      gl.attachShader(program, fragment);\r
      gl.bindAttribLocation(program, 0, 'aPosition');\r
      gl.linkProgram(program);\r
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
    const passes = {\r
      splat: build(SPLAT),\r
      advect: build(ADVECT),\r
      maccormack: build(MACCORMACK),\r
      divergence: build(DIVERGENCE),\r
      scale: build(SCALE),\r
      pressure: build(PRESSURE),\r
      gradient: build(GRADIENT),\r
      prefilter: build(PREFILTER),\r
      down: build(DOWN),\r
      up: build(UP),\r
      display: build(DISPLAY)\r
    };\r
    if (Object.values(passes).some(pass => !pass)) return undefined;\r
\r
    const vao = gl.createVertexArray();\r
    const buffer = gl.createBuffer();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const probe = document.createElement('canvas');\r
    probe.width = 1;\r
    probe.height = 1;\r
    const probeContext = probe.getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
\r
    const state = {\r
      width: 1,\r
      height: 1,\r
      ratio: 1,\r
      colorKey: '',\r
      color: [0.37, 0.55, 1],\r
      secondary: [0.25, 0.3, 1],\r
      pointer: { x: 0, y: 0, inside: false },\r
      emitter: { x: 0, y: 0, vx: 0, vy: 0, px: 0, py: 0, travelled: 0 },\r
      ready: false,\r
      bursts: [],\r
      active: -Infinity,\r
      time: 0,\r
      allocated: '',\r
      targets: null\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let alive = true;\r
    let visible = true;\r
\r
    const toRgb = (value, fallback) => {\r
      if (!probeContext || !value) return fallback;\r
      const css = /^[0-9a-f]{3,8}$/i.test(value) ? \`#\${value}\` : value;\r
      probeContext.clearRect(0, 0, 1, 1);\r
      probeContext.fillStyle = '#000000';\r
      probeContext.fillStyle = css;\r
      probeContext.fillRect(0, 0, 1, 1);\r
      const [r, g, b] = probeContext.getImageData(0, 0, 1, 1).data;\r
      return [r / 255, g / 255, b / 255];\r
    };\r
\r
    const resolveColors = s => {\r
      const key = \`\${s.color}|\${s.secondaryColor}\`;\r
      if (key === state.colorKey) return;\r
      state.colorKey = key;\r
      state.color = toRgb(s.color, [0.37, 0.55, 1]);\r
      if (s.secondaryColor) {\r
        state.secondary = toRgb(s.secondaryColor, state.color);\r
      } else {\r
        const [hue, saturation, value] = toHsv(state.color);\r
        state.secondary = fromHsv(hue + 8, Math.min(1, saturation * 1.1 + 0.05), value);\r
      }\r
    };\r
\r
    const createTarget = (width, height, internalFormat, format, filter) => {\r
      const texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, format, gl.HALF_FLOAT, null);\r
      const fbo = gl.createFramebuffer();\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
      gl.viewport(0, 0, width, height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      return { texture, fbo, width, height, texel: [1 / width, 1 / height] };\r
    };\r
\r
    const createPair = (width, height, internalFormat, format, filter) => {\r
      let read = createTarget(width, height, internalFormat, format, filter);\r
      let write = createTarget(width, height, internalFormat, format, filter);\r
      return {\r
        get read() {\r
          return read;\r
        },\r
        get write() {\r
          return write;\r
        },\r
        swap() {\r
          const next = read;\r
          read = write;\r
          write = next;\r
        },\r
        targets() {\r
          return [read, write];\r
        }\r
      };\r
    };\r
\r
    const destroyTarget = target => {\r
      gl.deleteTexture(target.texture);\r
      gl.deleteFramebuffer(target.fbo);\r
    };\r
\r
    const release = () => {\r
      const t = state.targets;\r
      if (!t) return;\r
      [\r
        ...t.velocity.targets(),\r
        ...t.dye.targets(),\r
        ...t.pressure.targets(),\r
        t.divergence,\r
        t.forward,\r
        t.back,\r
        ...t.bloom\r
      ].forEach(destroyTarget);\r
      state.targets = null;\r
    };\r
\r
    const clearTargets = () => {\r
      const t = state.targets;\r
      if (!t) return;\r
      gl.clearColor(0, 0, 0, 0);\r
      [...t.velocity.targets(), ...t.dye.targets(), ...t.pressure.targets()].forEach(target => {\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);\r
        gl.clear(gl.COLOR_BUFFER_BIT);\r
      });\r
    };\r
\r
    const allocate = () => {\r
      const s = settingsRef.current;\r
      const key = \`\${s.quality}|\${state.width}|\${state.height}|\${canvas.width}|\${canvas.height}\`;\r
      if (key === state.allocated && state.targets) return;\r
      release();\r
      state.allocated = key;\r
      const preset = QUALITY[s.quality];\r
      const aspect = state.width / state.height;\r
      const dims = base => (aspect >= 1 ? [Math.round(base * aspect), base] : [base, Math.round(base / aspect)]);\r
      const [simW, simH] = dims(preset.sim);\r
      let [dyeW, dyeH] = dims(preset.dye);\r
      const shrink = Math.min(1, canvas.width / dyeW, canvas.height / dyeH);\r
      dyeW = Math.max(2, Math.round(dyeW * shrink));\r
      dyeH = Math.max(2, Math.round(dyeH * shrink));\r
      const bloom = [];\r
      let bloomW = dyeW >> 1;\r
      let bloomH = dyeH >> 1;\r
      for (let i = 0; i < BLOOM_LEVELS; i++) {\r
        bloom.push(createTarget(Math.max(1, bloomW), Math.max(1, bloomH), gl.RGBA16F, gl.RGBA, gl.LINEAR));\r
        bloomW >>= 1;\r
        bloomH >>= 1;\r
      }\r
      state.targets = {\r
        velocity: createPair(simW, simH, gl.RG16F, gl.RG, gl.LINEAR),\r
        dye: createPair(dyeW, dyeH, gl.RGBA16F, gl.RGBA, gl.LINEAR),\r
        forward: createTarget(dyeW, dyeH, gl.RGBA16F, gl.RGBA, gl.LINEAR),\r
        back: createTarget(dyeW, dyeH, gl.RGBA16F, gl.RGBA, gl.LINEAR),\r
        pressure: createPair(simW, simH, gl.R16F, gl.RED, gl.NEAREST),\r
        divergence: createTarget(simW, simH, gl.R16F, gl.RED, gl.NEAREST),\r
        bloom\r
      };\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const ratio = Math.min(window.devicePixelRatio || 1, Math.max(0.5, s.maxDevicePixelRatio || 2));\r
      const pixelWidth = Math.max(1, Math.round(width * ratio));\r
      const pixelHeight = Math.max(1, Math.round(height * ratio));\r
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {\r
        canvas.width = pixelWidth;\r
        canvas.height = pixelHeight;\r
      }\r
      state.width = width;\r
      state.height = height;\r
      state.ratio = ratio;\r
      allocate();\r
    };\r
\r
    const draw = target => {\r
      if (target) {\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);\r
        gl.viewport(0, 0, target.width, target.height);\r
      } else {\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
        gl.viewport(0, 0, canvas.width, canvas.height);\r
      }\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const use = (pass, texel) => {\r
      gl.useProgram(pass.program);\r
      if (pass.uniforms.uTexel) gl.uniform2f(pass.uniforms.uTexel, texel[0], texel[1]);\r
      return pass.uniforms;\r
    };\r
\r
    const bind = (unit, target) => {\r
      gl.activeTexture(gl.TEXTURE0 + unit);\r
      gl.bindTexture(gl.TEXTURE_2D, target.texture);\r
      return unit;\r
    };\r
\r
    const splat = (pair, ax, ay, bx, by, radius, value, mode, strength, wide = radius) => {\r
      const u = use(passes.splat, pair.read.texel);\r
      gl.uniform1i(u.uTarget, bind(0, pair.read));\r
      gl.uniform1f(u.uAspect, state.width / state.height);\r
      gl.uniform2f(u.uA, ax / state.width, 1 - ay / state.height);\r
      gl.uniform2f(u.uB, bx / state.width, 1 - by / state.height);\r
      gl.uniform1f(u.uRadius, radius / state.height);\r
      gl.uniform1f(u.uWide, wide / state.height);\r
      gl.uniform3f(u.uValue, value[0], value[1], value[2]);\r
      gl.uniform1f(u.uMode, mode);\r
      gl.uniform1f(u.uStrength, strength);\r
      draw(pair.write);\r
      pair.swap();\r
    };\r
\r
    const toGrid = (vx, vy) => {\r
      const { velocity } = state.targets;\r
      return [(vx * velocity.read.width) / state.width, (-vy * velocity.read.height) / state.height];\r
    };\r
\r
    const lightRadius = s => Math.max(s.trailWidth * 0.5, (state.height / state.targets.dye.read.height) * 0.9);\r
\r
    const emit = (s, dt, now) => {\r
      const { emitter, pointer } = state;\r
      const { velocity, dye } = state.targets;\r
      emitter.px = emitter.x;\r
      emitter.py = emitter.y;\r
      if (reduce || s.followSpeed >= 1) {\r
        emitter.x = pointer.x;\r
        emitter.y = pointer.y;\r
      } else {\r
        const omega = 10 + s.followSpeed * 50;\r
        const steps = Math.max(1, Math.ceil(dt / 0.004));\r
        const h = dt / steps;\r
        for (let k = 0; k < steps; k++) {\r
          emitter.vx += (omega * omega * (pointer.x - emitter.x) - 2 * omega * emitter.vx) * h;\r
          emitter.vy += (omega * omega * (pointer.y - emitter.y) - 2 * omega * emitter.vy) * h;\r
          emitter.x += emitter.vx * h;\r
          emitter.y += emitter.vy * h;\r
        }\r
      }\r
      const dx = emitter.x - emitter.px;\r
      const dy = emitter.y - emitter.py;\r
      const length = Math.hypot(dx, dy);\r
      if (length < 0.05 || !s.enabled) return;\r
      const radius = lightRadius(s);\r
      if (!reduce) {\r
        const target = toGrid(dx / Math.max(dt, 1e-3), dy / Math.max(dt, 1e-3));\r
        splat(\r
          velocity,\r
          emitter.px,\r
          emitter.py,\r
          emitter.x,\r
          emitter.y,\r
          radius * 4 + 18,\r
          [target[0], target[1], 0],\r
          3,\r
          FLOW * 0.6\r
        );\r
      }\r
      splat(dye, emitter.px, emitter.py, emitter.x, emitter.y, radius, [5.6, 5.6, 0.7], 2, 1, radius * 5 + 6);\r
      state.active = now;\r
    };\r
\r
    const burst = (s, x, y, now) => {\r
      const { velocity, dye } = state.targets;\r
      const radius = lightRadius(s);\r
      const jets = 6;\r
      const base = Math.random() * Math.PI * 2;\r
      for (let k = 0; k < jets; k++) {\r
        const angle = base + (k / jets) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;\r
        const cx = Math.cos(angle);\r
        const cy = Math.sin(angle);\r
        const reach = 20 + Math.random() * 14;\r
        const ax = x + cx * 3;\r
        const ay = y + cy * 3;\r
        const bx = x + cx * reach;\r
        const by = y + cy * reach;\r
        if (!reduce) {\r
          const target = toGrid(Math.cos(angle + 0.6) * 760, Math.sin(angle + 0.6) * 760);\r
          splat(velocity, ax, ay, bx, by, 18, [target[0], target[1], 0], 1, 0.9);\r
        }\r
        splat(dye, ax, ay, bx, by, radius * 1.1, [2.4, 2.4, 0.3], 0, 1, radius * 5 + 6);\r
      }\r
      splat(dye, x, y, x + 0.01, y, radius * 2.2, [1.8, 1.8, 0.4], 0, 1, radius * 7 + 10);\r
      state.active = now;\r
    };\r
\r
    const step = (s, dt) => {\r
      const { velocity, dye, pressure, divergence } = state.targets;\r
      if (!reduce) {\r
        let u = use(passes.divergence, velocity.read.texel);\r
        gl.uniform1i(u.uVelocity, bind(0, velocity.read));\r
        draw(divergence);\r
\r
        u = use(passes.scale, pressure.read.texel);\r
        gl.uniform1i(u.uSource, bind(0, pressure.read));\r
        gl.uniform1f(u.uValue, 0.8);\r
        draw(pressure.write);\r
        pressure.swap();\r
\r
        u = use(passes.pressure, pressure.read.texel);\r
        gl.uniform1i(u.uDivergence, bind(1, divergence));\r
        for (let i = 0; i < PRESSURE_STEPS; i++) {\r
          gl.uniform1i(u.uPressure, bind(0, pressure.read));\r
          draw(pressure.write);\r
          pressure.swap();\r
        }\r
\r
        u = use(passes.gradient, velocity.read.texel);\r
        gl.uniform1i(u.uPressure, bind(0, pressure.read));\r
        gl.uniform1i(u.uVelocity, bind(1, velocity.read));\r
        draw(velocity.write);\r
        velocity.swap();\r
\r
        u = use(passes.advect, velocity.read.texel);\r
        gl.uniform2f(u.uVelocityTexel, velocity.read.texel[0], velocity.read.texel[1]);\r
        gl.uniform1i(u.uVelocity, bind(0, velocity.read));\r
        gl.uniform1i(u.uSource, bind(0, velocity.read));\r
        gl.uniform1f(u.uDt, dt);\r
        const calm = Math.exp(-dt * 1.2);\r
        gl.uniform4f(u.uDecay, calm, calm, 1, 1);\r
        draw(velocity.write);\r
        velocity.swap();\r
      }\r
\r
      const decay = [\r
        Math.exp((-dt * 4.6) / (s.linger * 0.8)),\r
        Math.exp((-dt * 4.6) / (s.linger * 0.2)),\r
        Math.exp((-dt * 4.6) / (s.linger * 1.2)),\r
        1\r
      ];\r
      const { forward, back } = state.targets;\r
      if (reduce) {\r
        const u = use(passes.advect, dye.read.texel);\r
        gl.uniform2f(u.uVelocityTexel, velocity.read.texel[0], velocity.read.texel[1]);\r
        gl.uniform1i(u.uVelocity, bind(0, velocity.read));\r
        gl.uniform1i(u.uSource, bind(1, dye.read));\r
        gl.uniform1f(u.uDt, 0);\r
        gl.uniform4f(u.uDecay, decay[0], decay[1], decay[2], decay[3]);\r
        draw(dye.write);\r
        dye.swap();\r
        return;\r
      }\r
      let u = use(passes.advect, dye.read.texel);\r
      gl.uniform2f(u.uVelocityTexel, velocity.read.texel[0], velocity.read.texel[1]);\r
      gl.uniform1i(u.uVelocity, bind(0, velocity.read));\r
      gl.uniform1i(u.uSource, bind(1, dye.read));\r
      gl.uniform1f(u.uDt, dt);\r
      gl.uniform4f(u.uDecay, 1, 1, 1, 1);\r
      draw(forward);\r
      gl.uniform1i(u.uSource, bind(1, forward));\r
      gl.uniform1f(u.uDt, -dt);\r
      draw(back);\r
      u = use(passes.maccormack, dye.read.texel);\r
      gl.uniform2f(u.uVelocityTexel, velocity.read.texel[0], velocity.read.texel[1]);\r
      gl.uniform2f(u.uSourceTexel, dye.read.texel[0], dye.read.texel[1]);\r
      gl.uniform1i(u.uVelocity, bind(0, velocity.read));\r
      gl.uniform1i(u.uSource, bind(1, dye.read));\r
      gl.uniform1i(u.uForward, bind(2, forward));\r
      gl.uniform1i(u.uBack, bind(3, back));\r
      gl.uniform1f(u.uDt, dt);\r
      gl.uniform4f(u.uDecay, decay[0], decay[1], decay[2], decay[3]);\r
      draw(dye.write);\r
      dye.swap();\r
    };\r
\r
    const setShade = (u, s) => {\r
      gl.uniform3f(u.uColor, state.color[0], state.color[1], state.color[2]);\r
      gl.uniform3f(u.uSecondary, state.secondary[0], state.secondary[1], state.secondary[2]);\r
      gl.uniform1f(u.uIntensity, s.intensity);\r
      gl.uniform1f(u.uHotspot, s.hotspot);\r
    };\r
\r
    const render = s => {\r
      const { dye, bloom } = state.targets;\r
      if (s.glow > 0) {\r
        let u = use(passes.prefilter, bloom[0].texel);\r
        gl.uniform1i(u.uDye, bind(0, dye.read));\r
        gl.uniform2f(u.uDyeTexel, dye.read.texel[0], dye.read.texel[1]);\r
        setShade(u, s);\r
        draw(bloom[0]);\r
        u = use(passes.down, bloom[0].texel);\r
        for (let i = 1; i < bloom.length; i++) {\r
          gl.uniform1i(u.uSource, bind(0, bloom[i - 1]));\r
          gl.uniform2f(u.uSourceTexel, bloom[i - 1].texel[0], bloom[i - 1].texel[1]);\r
          draw(bloom[i]);\r
        }\r
        gl.enable(gl.BLEND);\r
        gl.blendFunc(gl.ONE, gl.ONE);\r
        u = use(passes.up, bloom[0].texel);\r
        for (let i = bloom.length - 1; i > 0; i--) {\r
          gl.uniform1i(u.uSource, bind(0, bloom[i]));\r
          gl.uniform2f(u.uSourceTexel, bloom[i].texel[0], bloom[i].texel[1]);\r
          draw(bloom[i - 1]);\r
        }\r
        gl.disable(gl.BLEND);\r
      }\r
      const u = use(passes.display, [1 / canvas.width, 1 / canvas.height]);\r
      gl.uniform1i(u.uDye, bind(0, dye.read));\r
      gl.uniform1i(u.uBloom, bind(1, bloom[0]));\r
      setShade(u, s);\r
      gl.uniform1f(u.uGlow, s.glow > 0 ? (s.glow * 1.4) / BLOOM_LEVELS : 0);\r
      gl.uniform1f(u.uGrain, s.grain);\r
      gl.uniform1f(u.uTime, state.time);\r
      gl.uniform1f(u.uLight, s.theme === 'light' ? 1 : 0);\r
      draw(null);\r
    };\r
\r
    const blank = () => {\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!alive || !visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(1 / 30, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      state.time += dt;\r
      const wanted = Math.min(window.devicePixelRatio || 1, Math.max(0.5, s.maxDevicePixelRatio || 2));\r
      if (Math.abs(wanted - state.ratio) > 0.01) resize();\r
      allocate();\r
      resolveColors(s);\r
      gl.bindVertexArray(vao);\r
      gl.disable(gl.BLEND);\r
\r
      if (state.ready) emit(s, dt, now);\r
      while (state.bursts.length) {\r
        const [x, y] = state.bursts.shift();\r
        burst(s, x, y, now);\r
      }\r
      step(s, dt);\r
      render(s);\r
\r
      const quiet = now - state.active > s.linger * 1200 + 900;\r
      const resting = Math.hypot(state.emitter.vx, state.emitter.vy) < 1;\r
      if (quiet && resting) {\r
        clearTargets();\r
        blank();\r
        last = 0;\r
        return;\r
      }\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (!raf && alive && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const onPointerMove = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      const inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      if (!inside) {\r
        if (state.pointer.inside) {\r
          state.pointer.inside = false;\r
          state.ready = false;\r
          wake();\r
        }\r
        return;\r
      }\r
      if (!state.ready) {\r
        state.emitter.x = x;\r
        state.emitter.y = y;\r
        state.emitter.px = x;\r
        state.emitter.py = y;\r
        state.emitter.vx = 0;\r
        state.emitter.vy = 0;\r
        state.ready = true;\r
      }\r
      state.pointer.x = x;\r
      state.pointer.y = y;\r
      state.pointer.inside = true;\r
      wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      if (!s.clickBurst || !s.enabled) return;\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;\r
      state.bursts.push([x, y]);\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      state.pointer.inside = false;\r
      state.ready = false;\r
      wake();\r
    };\r
\r
    const onVisibility = () => {\r
      last = 0;\r
      wake();\r
    };\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      resize();\r
      wake();\r
    });\r
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
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
    blank();\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      release();\r
      Object.values(passes).forEach(pass => gl.deleteProgram(pass.program));\r
      gl.deleteShader(vertexShader);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
    };\r
  }, []);\r
\r
  const mode = blendMode ?? (theme === 'light' ? 'normal' : 'screen');\r
\r
  return (\r
    <div\r
      ref={containerRef}\r
      className={['relative h-full w-full overflow-hidden', className].filter(Boolean).join(' ')}\r
      style={style}\r
      {...rest}\r
    >\r
      <canvas\r
        ref={canvasRef}\r
        className="pointer-events-none absolute inset-0 block h-full w-full select-none"\r
        style={{ mixBlendMode: mode }}\r
        aria-hidden="true"\r
      />\r
      {children && <div className="relative z-[1] h-full w-full">{children}</div>}\r
    </div>\r
  );\r
};\r
\r
export default GlowCursor;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';\r
\r
import './GlowCursor.css';\r
\r
export interface GlowCursorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {\r
  color?: string;\r
  secondaryColor?: string;\r
  intensity?: number;\r
  trailWidth?: number;\r
  linger?: number;\r
  glow?: number;\r
  hotspot?: number;\r
  followSpeed?: number;\r
  grain?: number;\r
  clickBurst?: boolean;\r
  quality?: 'low' | 'medium' | 'high';\r
  theme?: 'dark' | 'light';\r
  blendMode?: CSSProperties['mixBlendMode'];\r
  maxDevicePixelRatio?: number;\r
  enabled?: boolean;\r
  children?: ReactNode;\r
}\r
\r
type Quality = 'low' | 'medium' | 'high';\r
\r
type Settings = {\r
  color: string;\r
  secondaryColor: string;\r
  intensity: number;\r
  trailWidth: number;\r
  linger: number;\r
  glow: number;\r
  hotspot: number;\r
  followSpeed: number;\r
  grain: number;\r
  clickBurst: boolean;\r
  quality: Quality;\r
  theme: 'dark' | 'light';\r
  maxDevicePixelRatio: number;\r
  enabled: boolean;\r
};\r
\r
type Target = {\r
  texture: WebGLTexture;\r
  fbo: WebGLFramebuffer;\r
  width: number;\r
  height: number;\r
  texel: [number, number];\r
};\r
\r
type Pair = {\r
  readonly read: Target;\r
  readonly write: Target;\r
  swap: () => void;\r
  targets: () => Target[];\r
};\r
\r
type Targets = {\r
  velocity: Pair;\r
  dye: Pair;\r
  forward: Target;\r
  back: Target;\r
  pressure: Pair;\r
  divergence: Target;\r
  bloom: Target[];\r
};\r
\r
type Pass = {\r
  program: WebGLProgram;\r
  uniforms: Record<string, WebGLUniformLocation | null>;\r
};\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
uniform vec2 uTexel;\r
out vec2 vUv;\r
out vec2 vL;\r
out vec2 vR;\r
out vec2 vT;\r
out vec2 vB;\r
void main() {\r
  vUv = aPosition * 0.5 + 0.5;\r
  vL = vUv - vec2(uTexel.x, 0.0);\r
  vR = vUv + vec2(uTexel.x, 0.0);\r
  vT = vUv + vec2(0.0, uTexel.y);\r
  vB = vUv - vec2(0.0, uTexel.y);\r
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
const SPLAT = \`\${HEADER}\r
uniform sampler2D uTarget;\r
uniform float uAspect;\r
uniform vec2 uA;\r
uniform vec2 uB;\r
uniform float uRadius;\r
uniform float uWide;\r
uniform vec3 uValue;\r
uniform float uMode;\r
uniform float uStrength;\r
float erf(float x) {\r
  float x2 = x * x;\r
  float a = 0.147;\r
  return sign(x) * sqrt(1.0 - exp(-x2 * (1.2732395 + a * x2) / (1.0 + a * x2)));\r
}\r
float sweep(float along, float length, float across, float radius) {\r
  return exp(-across * across / (radius * radius)) * 0.5 * (erf(along / radius) - erf((along - length) / radius));\r
}\r
void main() {\r
  vec2 p = vec2(vUv.x * uAspect, vUv.y);\r
  vec2 a = vec2(uA.x * uAspect, uA.y);\r
  vec2 ab = vec2(uB.x * uAspect, uB.y) - a;\r
  float len = length(ab);\r
  vec2 dir = len > 1e-6 ? ab / len : vec2(1.0, 0.0);\r
  vec2 ap = p - a;\r
  vec3 base = texture(uTarget, vUv).xyz;\r
  if (uMode > 1.5) {\r
    float along = dot(ap, dir);\r
    float across = dot(ap, vec2(-dir.y, dir.x));\r
    if (uMode > 2.5) {\r
      outColor = vec4(mix(base, uValue, sweep(along, len, across, uRadius) * uStrength), 1.0);\r
      return;\r
    }\r
    vec3 add = vec3(uValue.xy * sweep(along, len, across, uRadius), uValue.z * sweep(along, len, across, uWide));\r
    outColor = vec4(base + add, 1.0);\r
    return;\r
  }\r
  float h = clamp(dot(ap, ab) / max(dot(ab, ab), 1e-9), 0.0, 1.0);\r
  vec2 d = ap - ab * h;\r
  float r2 = dot(d, d);\r
  float falloff = exp(-r2 / (uRadius * uRadius));\r
  float wide = exp(-r2 / (uWide * uWide));\r
  vec3 result = uMode > 0.5 ? mix(base, uValue, falloff * uStrength) : base + vec3(uValue.xy * falloff, uValue.z * wide);\r
  outColor = vec4(result, 1.0);\r
}\`;\r
\r
const ADVECT = \`\${HEADER}\r
uniform sampler2D uVelocity;\r
uniform sampler2D uSource;\r
uniform vec2 uVelocityTexel;\r
uniform float uDt;\r
uniform vec4 uDecay;\r
void main() {\r
  vec2 coord = vUv - uDt * texture(uVelocity, vUv).xy * uVelocityTexel;\r
  outColor = texture(uSource, coord) * uDecay;\r
}\`;\r
\r
const MACCORMACK = \`\${HEADER}\r
uniform sampler2D uVelocity;\r
uniform sampler2D uSource;\r
uniform sampler2D uForward;\r
uniform sampler2D uBack;\r
uniform vec2 uVelocityTexel;\r
uniform vec2 uSourceTexel;\r
uniform float uDt;\r
uniform vec4 uDecay;\r
void main() {\r
  vec2 coord = vUv - uDt * texture(uVelocity, vUv).xy * uVelocityTexel;\r
  vec4 forward = texture(uForward, vUv);\r
  vec4 corrected = forward + 0.5 * (texture(uSource, vUv) - texture(uBack, vUv));\r
  vec2 base = (floor(coord / uSourceTexel - 0.5) + 0.5) * uSourceTexel;\r
  vec4 a = texture(uSource, base);\r
  vec4 b = texture(uSource, base + vec2(uSourceTexel.x, 0.0));\r
  vec4 c = texture(uSource, base + vec2(0.0, uSourceTexel.y));\r
  vec4 d = texture(uSource, base + uSourceTexel);\r
  vec4 low = min(min(a, b), min(c, d));\r
  vec4 high = max(max(a, b), max(c, d));\r
  outColor = clamp(corrected, low, high) * uDecay;\r
}\`;\r
\r
const DIVERGENCE = \`\${HEADER}\r
uniform sampler2D uVelocity;\r
void main() {\r
  float left = texture(uVelocity, vL).x;\r
  float right = texture(uVelocity, vR).x;\r
  float top = texture(uVelocity, vT).y;\r
  float bottom = texture(uVelocity, vB).y;\r
  vec2 center = texture(uVelocity, vUv).xy;\r
  if (vL.x < 0.0) left = -center.x;\r
  if (vR.x > 1.0) right = -center.x;\r
  if (vT.y > 1.0) top = -center.y;\r
  if (vB.y < 0.0) bottom = -center.y;\r
  outColor = vec4(0.5 * (right - left + top - bottom), 0.0, 0.0, 1.0);\r
}\`;\r
\r
const SCALE = \`\${HEADER}\r
uniform sampler2D uSource;\r
uniform float uValue;\r
void main() {\r
  outColor = texture(uSource, vUv) * uValue;\r
}\`;\r
\r
const PRESSURE = \`\${HEADER}\r
uniform sampler2D uPressure;\r
uniform sampler2D uDivergence;\r
void main() {\r
  float left = texture(uPressure, vL).x;\r
  float right = texture(uPressure, vR).x;\r
  float top = texture(uPressure, vT).x;\r
  float bottom = texture(uPressure, vB).x;\r
  float divergence = texture(uDivergence, vUv).x;\r
  outColor = vec4((left + right + bottom + top - divergence) * 0.25, 0.0, 0.0, 1.0);\r
}\`;\r
\r
const GRADIENT = \`\${HEADER}\r
uniform sampler2D uPressure;\r
uniform sampler2D uVelocity;\r
void main() {\r
  float left = texture(uPressure, vL).x;\r
  float right = texture(uPressure, vR).x;\r
  float top = texture(uPressure, vT).x;\r
  float bottom = texture(uPressure, vB).x;\r
  vec2 velocity = texture(uVelocity, vUv).xy - vec2(right - left, top - bottom);\r
  outColor = vec4(velocity, 0.0, 1.0);\r
}\`;\r
\r
const SHADE = \`\r
uniform vec3 uColor;\r
uniform vec3 uSecondary;\r
uniform float uIntensity;\r
uniform float uHotspot;\r
vec3 shade(vec3 dye) {\r
  float energy = max(dye.x, 0.0);\r
  float heat = clamp(dye.y, 0.0, energy);\r
  float gas = max(dye.z, 0.0);\r
  float fresh = heat / max(energy, 0.0001);\r
  vec3 tint = mix(uSecondary, uColor, fresh);\r
  return (tint * energy + uSecondary * gas + vec3(heat * heat * 0.3 * uHotspot)) * uIntensity;\r
}\r
\`;\r
\r
const PREFILTER = \`\${HEADER}\${SHADE}\r
uniform sampler2D uDye;\r
uniform vec2 uDyeTexel;\r
void main() {\r
  vec2 o = uDyeTexel * 0.5;\r
  vec3 light = shade(texture(uDye, vUv + vec2(-o.x, -o.y)).xyz);\r
  light += shade(texture(uDye, vUv + vec2(o.x, -o.y)).xyz);\r
  light += shade(texture(uDye, vUv + vec2(-o.x, o.y)).xyz);\r
  light += shade(texture(uDye, vUv + vec2(o.x, o.y)).xyz);\r
  outColor = vec4(light * 0.25, 1.0);\r
}\`;\r
\r
const DOWN = \`\${HEADER}\r
uniform sampler2D uSource;\r
uniform vec2 uSourceTexel;\r
void main() {\r
  vec2 o = uSourceTexel;\r
  vec3 color = texture(uSource, vUv).rgb * 4.0;\r
  color += texture(uSource, vUv + vec2(-o.x, -o.y)).rgb;\r
  color += texture(uSource, vUv + vec2(o.x, -o.y)).rgb;\r
  color += texture(uSource, vUv + vec2(-o.x, o.y)).rgb;\r
  color += texture(uSource, vUv + vec2(o.x, o.y)).rgb;\r
  outColor = vec4(color / 8.0, 1.0);\r
}\`;\r
\r
const UP = \`\${HEADER}\r
uniform sampler2D uSource;\r
uniform vec2 uSourceTexel;\r
void main() {\r
  vec2 o = uSourceTexel;\r
  vec3 color = texture(uSource, vUv + vec2(-o.x * 2.0, 0.0)).rgb;\r
  color += texture(uSource, vUv + vec2(o.x * 2.0, 0.0)).rgb;\r
  color += texture(uSource, vUv + vec2(0.0, -o.y * 2.0)).rgb;\r
  color += texture(uSource, vUv + vec2(0.0, o.y * 2.0)).rgb;\r
  color += texture(uSource, vUv + vec2(-o.x, -o.y)).rgb * 2.0;\r
  color += texture(uSource, vUv + vec2(o.x, -o.y)).rgb * 2.0;\r
  color += texture(uSource, vUv + vec2(-o.x, o.y)).rgb * 2.0;\r
  color += texture(uSource, vUv + vec2(o.x, o.y)).rgb * 2.0;\r
  outColor = vec4(color / 12.0, 1.0);\r
}\`;\r
\r
const DISPLAY = \`\${HEADER}\${SHADE}\r
uniform sampler2D uDye;\r
uniform sampler2D uBloom;\r
uniform float uGlow;\r
uniform float uGrain;\r
uniform float uTime;\r
uniform float uLight;\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
void main() {\r
  vec3 dye = texture(uDye, vUv).xyz;\r
  vec3 light = shade(dye);\r
  vec3 bloom = texture(uBloom, vUv).rgb * uGlow;\r
  float edge = smoothstep(0.0, 0.02, min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y)));\r
  float grain = 1.0 + (hash(gl_FragCoord.xy + fract(uTime * 13.7) * 97.0) - 0.5) * uGrain * 2.0;\r
  if (uLight > 0.5) {\r
    float energy = max(dye.x, 0.0);\r
    float heat = clamp(dye.y, 0.0, energy);\r
    float gas = max(dye.z, 0.0);\r
    float fresh = heat / max(energy, 0.0001);\r
    vec3 tint = mix(uSecondary, uColor, fresh);\r
    float halo = dot(bloom, vec3(0.2126, 0.7152, 0.0722));\r
    float density = 1.0 - exp(-((energy * 1.1 + gas * 0.8) * uIntensity + halo * 0.25));\r
    float tone = dot(tint, vec3(0.2126, 0.7152, 0.0722));\r
    vec3 ink = tint * min(1.0, 0.5 / max(tone, 0.001)) * mix(0.95, 0.72, smoothstep(0.5, 3.0, energy));\r
    ink = mix(ink, vec3(1.0), clamp(heat * heat * 0.05 * uHotspot, 0.0, 0.45));\r
    density = clamp(density * grain, 0.0, 1.0) * edge;\r
    outColor = vec4(ink * density, density);\r
  } else {\r
    vec3 color = 1.0 - exp(-(light + bloom) * grain);\r
    color *= edge;\r
    outColor = vec4(color, max(color.r, max(color.g, color.b)));\r
  }\r
}\`;\r
\r
const QUALITY: Record<Quality, { sim: number; dye: number }> = {\r
  low: { sim: 96, dye: 384 },\r
  medium: { sim: 128, dye: 576 },\r
  high: { sim: 160, dye: 768 }\r
};\r
\r
const PRESSURE_STEPS = 20;\r
const FLOW = 0.75;\r
const BLOOM_LEVELS = 5;\r
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
const toHsv = ([r, g, b]: number[]): [number, number, number] => {\r
  const max = Math.max(r, g, b);\r
  const min = Math.min(r, g, b);\r
  const delta = max - min;\r
  let hue = 0;\r
  if (delta > 0) {\r
    if (max === r) hue = ((g - b) / delta) % 6;\r
    else if (max === g) hue = (b - r) / delta + 2;\r
    else hue = (r - g) / delta + 4;\r
  }\r
  return [(hue * 60 + 360) % 360, max > 0 ? delta / max : 0, max];\r
};\r
\r
const fromHsv = (hue: number, saturation: number, value: number): number[] => {\r
  const h = (((hue % 360) + 360) % 360) / 60;\r
  const c = value * saturation;\r
  const x = c * (1 - Math.abs((h % 2) - 1));\r
  const m = value - c;\r
  const [r, g, b] =\r
    h < 1 ? [c, x, 0] : h < 2 ? [x, c, 0] : h < 3 ? [0, c, x] : h < 4 ? [0, x, c] : h < 5 ? [x, 0, c] : [c, 0, x];\r
  return [r + m, g + m, b + m];\r
};\r
\r
const GlowCursor = ({\r
  color = '#5f8bff',\r
  secondaryColor,\r
  intensity = 1.3,\r
  trailWidth = 3,\r
  linger = 1.4,\r
  glow = 1.2,\r
  hotspot = 0.8,\r
  followSpeed = 0.6,\r
  grain = 0,\r
  clickBurst = true,\r
  quality = 'high',\r
  theme = 'dark',\r
  blendMode,\r
  maxDevicePixelRatio = 2,\r
  enabled = true,\r
  children,\r
  className = '',\r
  style,\r
  ...rest\r
}: GlowCursorProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const settingsRef = useRef<Settings>(null as unknown as Settings);\r
  settingsRef.current = {\r
    color: String(color),\r
    secondaryColor: secondaryColor ? String(secondaryColor) : '',\r
    intensity: Math.max(0, intensity),\r
    trailWidth: clamp(trailWidth, 0.5, 40),\r
    linger: clamp(linger, 0.1, 10),\r
    glow: Math.max(0, glow),\r
    hotspot: Math.max(0, hotspot),\r
    followSpeed: clamp(followSpeed, 0, 1),\r
    grain: Math.max(0, grain),\r
    clickBurst,\r
    quality: (QUALITY as Record<string, unknown>)[quality] ? quality : 'high',\r
    theme,\r
    maxDevicePixelRatio,\r
    enabled\r
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
      stencil: false\r
    });\r
    if (!container || !canvas || !gl || !gl.getExtension('EXT_color_buffer_float')) return undefined;\r
\r
    const vertexShader = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
    if (!vertexShader) return undefined;\r
\r
    const build = (source: string): Pass | null => {\r
      const fragment = compile(gl, gl.FRAGMENT_SHADER, source);\r
      const program = gl.createProgram();\r
      if (!fragment || !program) return null;\r
      gl.attachShader(program, vertexShader);\r
      gl.attachShader(program, fragment);\r
      gl.bindAttribLocation(program, 0, 'aPosition');\r
      gl.linkProgram(program);\r
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
    const passes = {\r
      splat: build(SPLAT),\r
      advect: build(ADVECT),\r
      maccormack: build(MACCORMACK),\r
      divergence: build(DIVERGENCE),\r
      scale: build(SCALE),\r
      pressure: build(PRESSURE),\r
      gradient: build(GRADIENT),\r
      prefilter: build(PREFILTER),\r
      down: build(DOWN),\r
      up: build(UP),\r
      display: build(DISPLAY)\r
    };\r
    if (Object.values(passes).some(pass => !pass)) return undefined;\r
    const pass = passes as Record<keyof typeof passes, Pass>;\r
\r
    const vao = gl.createVertexArray();\r
    const buffer = gl.createBuffer();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const probe = document.createElement('canvas');\r
    probe.width = 1;\r
    probe.height = 1;\r
    const probeContext = probe.getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
\r
    const state = {\r
      width: 1,\r
      height: 1,\r
      ratio: 1,\r
      colorKey: '',\r
      color: [0.37, 0.55, 1] as number[],\r
      secondary: [0.25, 0.3, 1] as number[],\r
      pointer: { x: 0, y: 0, inside: false },\r
      emitter: { x: 0, y: 0, vx: 0, vy: 0, px: 0, py: 0, travelled: 0 },\r
      ready: false,\r
      bursts: [] as [number, number][],\r
      active: -Infinity,\r
      time: 0,\r
      allocated: '',\r
      targets: null as Targets | null\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let alive = true;\r
    let visible = true;\r
\r
    const toRgb = (value: string, fallback: number[]): number[] => {\r
      if (!probeContext || !value) return fallback;\r
      const css = /^[0-9a-f]{3,8}$/i.test(value) ? \`#\${value}\` : value;\r
      probeContext.clearRect(0, 0, 1, 1);\r
      probeContext.fillStyle = '#000000';\r
      probeContext.fillStyle = css;\r
      probeContext.fillRect(0, 0, 1, 1);\r
      const [r, g, b] = probeContext.getImageData(0, 0, 1, 1).data;\r
      return [r / 255, g / 255, b / 255];\r
    };\r
\r
    const resolveColors = (s: Settings) => {\r
      const key = \`\${s.color}|\${s.secondaryColor}\`;\r
      if (key === state.colorKey) return;\r
      state.colorKey = key;\r
      state.color = toRgb(s.color, [0.37, 0.55, 1]);\r
      if (s.secondaryColor) {\r
        state.secondary = toRgb(s.secondaryColor, state.color);\r
      } else {\r
        const [hue, saturation, value] = toHsv(state.color);\r
        state.secondary = fromHsv(hue + 8, Math.min(1, saturation * 1.1 + 0.05), value);\r
      }\r
    };\r
\r
    const createTarget = (\r
      width: number,\r
      height: number,\r
      internalFormat: number,\r
      format: number,\r
      filter: number\r
    ): Target => {\r
      const texture = gl.createTexture() as WebGLTexture;\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, format, gl.HALF_FLOAT, null);\r
      const fbo = gl.createFramebuffer() as WebGLFramebuffer;\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
      gl.viewport(0, 0, width, height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      return { texture, fbo, width, height, texel: [1 / width, 1 / height] };\r
    };\r
\r
    const createPair = (\r
      width: number,\r
      height: number,\r
      internalFormat: number,\r
      format: number,\r
      filter: number\r
    ): Pair => {\r
      let read = createTarget(width, height, internalFormat, format, filter);\r
      let write = createTarget(width, height, internalFormat, format, filter);\r
      return {\r
        get read() {\r
          return read;\r
        },\r
        get write() {\r
          return write;\r
        },\r
        swap() {\r
          const next = read;\r
          read = write;\r
          write = next;\r
        },\r
        targets() {\r
          return [read, write];\r
        }\r
      };\r
    };\r
\r
    const destroyTarget = (target: Target) => {\r
      gl.deleteTexture(target.texture);\r
      gl.deleteFramebuffer(target.fbo);\r
    };\r
\r
    const release = () => {\r
      const t = state.targets;\r
      if (!t) return;\r
      [\r
        ...t.velocity.targets(),\r
        ...t.dye.targets(),\r
        ...t.pressure.targets(),\r
        t.divergence,\r
        t.forward,\r
        t.back,\r
        ...t.bloom\r
      ].forEach(destroyTarget);\r
      state.targets = null;\r
    };\r
\r
    const clearTargets = () => {\r
      const t = state.targets;\r
      if (!t) return;\r
      gl.clearColor(0, 0, 0, 0);\r
      [...t.velocity.targets(), ...t.dye.targets(), ...t.pressure.targets()].forEach(target => {\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);\r
        gl.clear(gl.COLOR_BUFFER_BIT);\r
      });\r
    };\r
\r
    const allocate = () => {\r
      const s = settingsRef.current;\r
      const key = \`\${s.quality}|\${state.width}|\${state.height}|\${canvas.width}|\${canvas.height}\`;\r
      if (key === state.allocated && state.targets) return;\r
      release();\r
      state.allocated = key;\r
      const preset = QUALITY[s.quality];\r
      const aspect = state.width / state.height;\r
      const dims = (base: number) =>\r
        aspect >= 1 ? [Math.round(base * aspect), base] : [base, Math.round(base / aspect)];\r
      const [simW, simH] = dims(preset.sim);\r
      let [dyeW, dyeH] = dims(preset.dye);\r
      const shrink = Math.min(1, canvas.width / dyeW, canvas.height / dyeH);\r
      dyeW = Math.max(2, Math.round(dyeW * shrink));\r
      dyeH = Math.max(2, Math.round(dyeH * shrink));\r
      const bloom = [];\r
      let bloomW = dyeW >> 1;\r
      let bloomH = dyeH >> 1;\r
      for (let i = 0; i < BLOOM_LEVELS; i++) {\r
        bloom.push(createTarget(Math.max(1, bloomW), Math.max(1, bloomH), gl.RGBA16F, gl.RGBA, gl.LINEAR));\r
        bloomW >>= 1;\r
        bloomH >>= 1;\r
      }\r
      state.targets = {\r
        velocity: createPair(simW, simH, gl.RG16F, gl.RG, gl.LINEAR),\r
        dye: createPair(dyeW, dyeH, gl.RGBA16F, gl.RGBA, gl.LINEAR),\r
        forward: createTarget(dyeW, dyeH, gl.RGBA16F, gl.RGBA, gl.LINEAR),\r
        back: createTarget(dyeW, dyeH, gl.RGBA16F, gl.RGBA, gl.LINEAR),\r
        pressure: createPair(simW, simH, gl.R16F, gl.RED, gl.NEAREST),\r
        divergence: createTarget(simW, simH, gl.R16F, gl.RED, gl.NEAREST),\r
        bloom\r
      };\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const ratio = Math.min(window.devicePixelRatio || 1, Math.max(0.5, s.maxDevicePixelRatio || 2));\r
      const pixelWidth = Math.max(1, Math.round(width * ratio));\r
      const pixelHeight = Math.max(1, Math.round(height * ratio));\r
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {\r
        canvas.width = pixelWidth;\r
        canvas.height = pixelHeight;\r
      }\r
      state.width = width;\r
      state.height = height;\r
      state.ratio = ratio;\r
      allocate();\r
    };\r
\r
    const draw = (target: Target | null) => {\r
      if (target) {\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);\r
        gl.viewport(0, 0, target.width, target.height);\r
      } else {\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
        gl.viewport(0, 0, canvas.width, canvas.height);\r
      }\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const use = (pass: Pass, texel: number[]) => {\r
      gl.useProgram(pass.program);\r
      if (pass.uniforms.uTexel) gl.uniform2f(pass.uniforms.uTexel, texel[0], texel[1]);\r
      return pass.uniforms;\r
    };\r
\r
    const bind = (unit: number, target: Target) => {\r
      gl.activeTexture(gl.TEXTURE0 + unit);\r
      gl.bindTexture(gl.TEXTURE_2D, target.texture);\r
      return unit;\r
    };\r
\r
    const splat = (\r
      pair: Pair,\r
      ax: number,\r
      ay: number,\r
      bx: number,\r
      by: number,\r
      radius: number,\r
      value: number[],\r
      mode: number,\r
      strength: number,\r
      wide = radius\r
    ) => {\r
      const u = use(pass.splat, pair.read.texel);\r
      gl.uniform1i(u.uTarget, bind(0, pair.read));\r
      gl.uniform1f(u.uAspect, state.width / state.height);\r
      gl.uniform2f(u.uA, ax / state.width, 1 - ay / state.height);\r
      gl.uniform2f(u.uB, bx / state.width, 1 - by / state.height);\r
      gl.uniform1f(u.uRadius, radius / state.height);\r
      gl.uniform1f(u.uWide, wide / state.height);\r
      gl.uniform3f(u.uValue, value[0], value[1], value[2]);\r
      gl.uniform1f(u.uMode, mode);\r
      gl.uniform1f(u.uStrength, strength);\r
      draw(pair.write);\r
      pair.swap();\r
    };\r
\r
    const toGrid = (vx: number, vy: number) => {\r
      const { velocity } = state.targets as Targets;\r
      return [(vx * velocity.read.width) / state.width, (-vy * velocity.read.height) / state.height];\r
    };\r
\r
    const lightRadius = (s: Settings) =>\r
      Math.max(s.trailWidth * 0.5, (state.height / (state.targets as Targets).dye.read.height) * 0.9);\r
\r
    const emit = (s: Settings, dt: number, now: number) => {\r
      const { emitter, pointer } = state;\r
      const { velocity, dye } = state.targets as Targets;\r
      emitter.px = emitter.x;\r
      emitter.py = emitter.y;\r
      if (reduce || s.followSpeed >= 1) {\r
        emitter.x = pointer.x;\r
        emitter.y = pointer.y;\r
      } else {\r
        const omega = 10 + s.followSpeed * 50;\r
        const steps = Math.max(1, Math.ceil(dt / 0.004));\r
        const h = dt / steps;\r
        for (let k = 0; k < steps; k++) {\r
          emitter.vx += (omega * omega * (pointer.x - emitter.x) - 2 * omega * emitter.vx) * h;\r
          emitter.vy += (omega * omega * (pointer.y - emitter.y) - 2 * omega * emitter.vy) * h;\r
          emitter.x += emitter.vx * h;\r
          emitter.y += emitter.vy * h;\r
        }\r
      }\r
      const dx = emitter.x - emitter.px;\r
      const dy = emitter.y - emitter.py;\r
      const length = Math.hypot(dx, dy);\r
      if (length < 0.05 || !s.enabled) return;\r
      const radius = lightRadius(s);\r
      if (!reduce) {\r
        const target = toGrid(dx / Math.max(dt, 1e-3), dy / Math.max(dt, 1e-3));\r
        splat(\r
          velocity,\r
          emitter.px,\r
          emitter.py,\r
          emitter.x,\r
          emitter.y,\r
          radius * 4 + 18,\r
          [target[0], target[1], 0],\r
          3,\r
          FLOW * 0.6\r
        );\r
      }\r
      splat(dye, emitter.px, emitter.py, emitter.x, emitter.y, radius, [5.6, 5.6, 0.7], 2, 1, radius * 5 + 6);\r
      state.active = now;\r
    };\r
\r
    const burst = (s: Settings, x: number, y: number, now: number) => {\r
      const { velocity, dye } = state.targets as Targets;\r
      const radius = lightRadius(s);\r
      const jets = 6;\r
      const base = Math.random() * Math.PI * 2;\r
      for (let k = 0; k < jets; k++) {\r
        const angle = base + (k / jets) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;\r
        const cx = Math.cos(angle);\r
        const cy = Math.sin(angle);\r
        const reach = 20 + Math.random() * 14;\r
        const ax = x + cx * 3;\r
        const ay = y + cy * 3;\r
        const bx = x + cx * reach;\r
        const by = y + cy * reach;\r
        if (!reduce) {\r
          const target = toGrid(Math.cos(angle + 0.6) * 760, Math.sin(angle + 0.6) * 760);\r
          splat(velocity, ax, ay, bx, by, 18, [target[0], target[1], 0], 1, 0.9);\r
        }\r
        splat(dye, ax, ay, bx, by, radius * 1.1, [2.4, 2.4, 0.3], 0, 1, radius * 5 + 6);\r
      }\r
      splat(dye, x, y, x + 0.01, y, radius * 2.2, [1.8, 1.8, 0.4], 0, 1, radius * 7 + 10);\r
      state.active = now;\r
    };\r
\r
    const step = (s: Settings, dt: number) => {\r
      const { velocity, dye, pressure, divergence } = state.targets as Targets;\r
      if (!reduce) {\r
        let u = use(pass.divergence, velocity.read.texel);\r
        gl.uniform1i(u.uVelocity, bind(0, velocity.read));\r
        draw(divergence);\r
\r
        u = use(pass.scale, pressure.read.texel);\r
        gl.uniform1i(u.uSource, bind(0, pressure.read));\r
        gl.uniform1f(u.uValue, 0.8);\r
        draw(pressure.write);\r
        pressure.swap();\r
\r
        u = use(pass.pressure, pressure.read.texel);\r
        gl.uniform1i(u.uDivergence, bind(1, divergence));\r
        for (let i = 0; i < PRESSURE_STEPS; i++) {\r
          gl.uniform1i(u.uPressure, bind(0, pressure.read));\r
          draw(pressure.write);\r
          pressure.swap();\r
        }\r
\r
        u = use(pass.gradient, velocity.read.texel);\r
        gl.uniform1i(u.uPressure, bind(0, pressure.read));\r
        gl.uniform1i(u.uVelocity, bind(1, velocity.read));\r
        draw(velocity.write);\r
        velocity.swap();\r
\r
        u = use(pass.advect, velocity.read.texel);\r
        gl.uniform2f(u.uVelocityTexel, velocity.read.texel[0], velocity.read.texel[1]);\r
        gl.uniform1i(u.uVelocity, bind(0, velocity.read));\r
        gl.uniform1i(u.uSource, bind(0, velocity.read));\r
        gl.uniform1f(u.uDt, dt);\r
        const calm = Math.exp(-dt * 1.2);\r
        gl.uniform4f(u.uDecay, calm, calm, 1, 1);\r
        draw(velocity.write);\r
        velocity.swap();\r
      }\r
\r
      const decay = [\r
        Math.exp((-dt * 4.6) / (s.linger * 0.8)),\r
        Math.exp((-dt * 4.6) / (s.linger * 0.2)),\r
        Math.exp((-dt * 4.6) / (s.linger * 1.2)),\r
        1\r
      ];\r
      const { forward, back } = state.targets as Targets;\r
      if (reduce) {\r
        const u = use(pass.advect, dye.read.texel);\r
        gl.uniform2f(u.uVelocityTexel, velocity.read.texel[0], velocity.read.texel[1]);\r
        gl.uniform1i(u.uVelocity, bind(0, velocity.read));\r
        gl.uniform1i(u.uSource, bind(1, dye.read));\r
        gl.uniform1f(u.uDt, 0);\r
        gl.uniform4f(u.uDecay, decay[0], decay[1], decay[2], decay[3]);\r
        draw(dye.write);\r
        dye.swap();\r
        return;\r
      }\r
      let u = use(pass.advect, dye.read.texel);\r
      gl.uniform2f(u.uVelocityTexel, velocity.read.texel[0], velocity.read.texel[1]);\r
      gl.uniform1i(u.uVelocity, bind(0, velocity.read));\r
      gl.uniform1i(u.uSource, bind(1, dye.read));\r
      gl.uniform1f(u.uDt, dt);\r
      gl.uniform4f(u.uDecay, 1, 1, 1, 1);\r
      draw(forward);\r
      gl.uniform1i(u.uSource, bind(1, forward));\r
      gl.uniform1f(u.uDt, -dt);\r
      draw(back);\r
      u = use(pass.maccormack, dye.read.texel);\r
      gl.uniform2f(u.uVelocityTexel, velocity.read.texel[0], velocity.read.texel[1]);\r
      gl.uniform2f(u.uSourceTexel, dye.read.texel[0], dye.read.texel[1]);\r
      gl.uniform1i(u.uVelocity, bind(0, velocity.read));\r
      gl.uniform1i(u.uSource, bind(1, dye.read));\r
      gl.uniform1i(u.uForward, bind(2, forward));\r
      gl.uniform1i(u.uBack, bind(3, back));\r
      gl.uniform1f(u.uDt, dt);\r
      gl.uniform4f(u.uDecay, decay[0], decay[1], decay[2], decay[3]);\r
      draw(dye.write);\r
      dye.swap();\r
    };\r
\r
    const setShade = (u: Record<string, WebGLUniformLocation | null>, s: Settings) => {\r
      gl.uniform3f(u.uColor, state.color[0], state.color[1], state.color[2]);\r
      gl.uniform3f(u.uSecondary, state.secondary[0], state.secondary[1], state.secondary[2]);\r
      gl.uniform1f(u.uIntensity, s.intensity);\r
      gl.uniform1f(u.uHotspot, s.hotspot);\r
    };\r
\r
    const render = (s: Settings) => {\r
      const { dye, bloom } = state.targets as Targets;\r
      if (s.glow > 0) {\r
        let u = use(pass.prefilter, bloom[0].texel);\r
        gl.uniform1i(u.uDye, bind(0, dye.read));\r
        gl.uniform2f(u.uDyeTexel, dye.read.texel[0], dye.read.texel[1]);\r
        setShade(u, s);\r
        draw(bloom[0]);\r
        u = use(pass.down, bloom[0].texel);\r
        for (let i = 1; i < bloom.length; i++) {\r
          gl.uniform1i(u.uSource, bind(0, bloom[i - 1]));\r
          gl.uniform2f(u.uSourceTexel, bloom[i - 1].texel[0], bloom[i - 1].texel[1]);\r
          draw(bloom[i]);\r
        }\r
        gl.enable(gl.BLEND);\r
        gl.blendFunc(gl.ONE, gl.ONE);\r
        u = use(pass.up, bloom[0].texel);\r
        for (let i = bloom.length - 1; i > 0; i--) {\r
          gl.uniform1i(u.uSource, bind(0, bloom[i]));\r
          gl.uniform2f(u.uSourceTexel, bloom[i].texel[0], bloom[i].texel[1]);\r
          draw(bloom[i - 1]);\r
        }\r
        gl.disable(gl.BLEND);\r
      }\r
      const u = use(pass.display, [1 / canvas.width, 1 / canvas.height]);\r
      gl.uniform1i(u.uDye, bind(0, dye.read));\r
      gl.uniform1i(u.uBloom, bind(1, bloom[0]));\r
      setShade(u, s);\r
      gl.uniform1f(u.uGlow, s.glow > 0 ? (s.glow * 1.4) / BLOOM_LEVELS : 0);\r
      gl.uniform1f(u.uGrain, s.grain);\r
      gl.uniform1f(u.uTime, state.time);\r
      gl.uniform1f(u.uLight, s.theme === 'light' ? 1 : 0);\r
      draw(null);\r
    };\r
\r
    const blank = () => {\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!alive || !visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(1 / 30, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      state.time += dt;\r
      const wanted = Math.min(window.devicePixelRatio || 1, Math.max(0.5, s.maxDevicePixelRatio || 2));\r
      if (Math.abs(wanted - state.ratio) > 0.01) resize();\r
      allocate();\r
      resolveColors(s);\r
      gl.bindVertexArray(vao);\r
      gl.disable(gl.BLEND);\r
\r
      if (state.ready) emit(s, dt, now);\r
      while (state.bursts.length) {\r
        const [x, y] = state.bursts.shift() as [number, number];\r
        burst(s, x, y, now);\r
      }\r
      step(s, dt);\r
      render(s);\r
\r
      const quiet = now - state.active > s.linger * 1200 + 900;\r
      const resting = Math.hypot(state.emitter.vx, state.emitter.vy) < 1;\r
      if (quiet && resting) {\r
        clearTargets();\r
        blank();\r
        last = 0;\r
        return;\r
      }\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (!raf && alive && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      const inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      if (!inside) {\r
        if (state.pointer.inside) {\r
          state.pointer.inside = false;\r
          state.ready = false;\r
          wake();\r
        }\r
        return;\r
      }\r
      if (!state.ready) {\r
        state.emitter.x = x;\r
        state.emitter.y = y;\r
        state.emitter.px = x;\r
        state.emitter.py = y;\r
        state.emitter.vx = 0;\r
        state.emitter.vy = 0;\r
        state.ready = true;\r
      }\r
      state.pointer.x = x;\r
      state.pointer.y = y;\r
      state.pointer.inside = true;\r
      wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      if (!s.clickBurst || !s.enabled) return;\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;\r
      state.bursts.push([x, y]);\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      state.pointer.inside = false;\r
      state.ready = false;\r
      wake();\r
    };\r
\r
    const onVisibility = () => {\r
      last = 0;\r
      wake();\r
    };\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      resize();\r
      wake();\r
    });\r
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
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
    blank();\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      release();\r
      Object.values(pass).forEach(item => gl.deleteProgram(item.program));\r
      gl.deleteShader(vertexShader);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
    };\r
  }, []);\r
\r
  const mode = blendMode ?? (theme === 'light' ? 'normal' : 'screen');\r
\r
  return (\r
    <div ref={containerRef} className={\`glow-cursor\${className ? \` \${className}\` : ''}\`} style={style} {...rest}>\r
      <canvas ref={canvasRef} className="glow-cursor__canvas" style={{ mixBlendMode: mode }} aria-hidden="true" />\r
      {children && <div className="glow-cursor__content">{children}</div>}\r
    </div>\r
  );\r
};\r
\r
export default GlowCursor;\r
`,o=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';\r
\r
export interface GlowCursorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {\r
  color?: string;\r
  secondaryColor?: string;\r
  intensity?: number;\r
  trailWidth?: number;\r
  linger?: number;\r
  glow?: number;\r
  hotspot?: number;\r
  followSpeed?: number;\r
  grain?: number;\r
  clickBurst?: boolean;\r
  quality?: 'low' | 'medium' | 'high';\r
  theme?: 'dark' | 'light';\r
  blendMode?: CSSProperties['mixBlendMode'];\r
  maxDevicePixelRatio?: number;\r
  enabled?: boolean;\r
  children?: ReactNode;\r
}\r
\r
type Quality = 'low' | 'medium' | 'high';\r
\r
type Settings = {\r
  color: string;\r
  secondaryColor: string;\r
  intensity: number;\r
  trailWidth: number;\r
  linger: number;\r
  glow: number;\r
  hotspot: number;\r
  followSpeed: number;\r
  grain: number;\r
  clickBurst: boolean;\r
  quality: Quality;\r
  theme: 'dark' | 'light';\r
  maxDevicePixelRatio: number;\r
  enabled: boolean;\r
};\r
\r
type Target = {\r
  texture: WebGLTexture;\r
  fbo: WebGLFramebuffer;\r
  width: number;\r
  height: number;\r
  texel: [number, number];\r
};\r
\r
type Pair = {\r
  readonly read: Target;\r
  readonly write: Target;\r
  swap: () => void;\r
  targets: () => Target[];\r
};\r
\r
type Targets = {\r
  velocity: Pair;\r
  dye: Pair;\r
  forward: Target;\r
  back: Target;\r
  pressure: Pair;\r
  divergence: Target;\r
  bloom: Target[];\r
};\r
\r
type Pass = {\r
  program: WebGLProgram;\r
  uniforms: Record<string, WebGLUniformLocation | null>;\r
};\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
uniform vec2 uTexel;\r
out vec2 vUv;\r
out vec2 vL;\r
out vec2 vR;\r
out vec2 vT;\r
out vec2 vB;\r
void main() {\r
  vUv = aPosition * 0.5 + 0.5;\r
  vL = vUv - vec2(uTexel.x, 0.0);\r
  vR = vUv + vec2(uTexel.x, 0.0);\r
  vT = vUv + vec2(0.0, uTexel.y);\r
  vB = vUv - vec2(0.0, uTexel.y);\r
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
const SPLAT = \`\${HEADER}\r
uniform sampler2D uTarget;\r
uniform float uAspect;\r
uniform vec2 uA;\r
uniform vec2 uB;\r
uniform float uRadius;\r
uniform float uWide;\r
uniform vec3 uValue;\r
uniform float uMode;\r
uniform float uStrength;\r
float erf(float x) {\r
  float x2 = x * x;\r
  float a = 0.147;\r
  return sign(x) * sqrt(1.0 - exp(-x2 * (1.2732395 + a * x2) / (1.0 + a * x2)));\r
}\r
float sweep(float along, float length, float across, float radius) {\r
  return exp(-across * across / (radius * radius)) * 0.5 * (erf(along / radius) - erf((along - length) / radius));\r
}\r
void main() {\r
  vec2 p = vec2(vUv.x * uAspect, vUv.y);\r
  vec2 a = vec2(uA.x * uAspect, uA.y);\r
  vec2 ab = vec2(uB.x * uAspect, uB.y) - a;\r
  float len = length(ab);\r
  vec2 dir = len > 1e-6 ? ab / len : vec2(1.0, 0.0);\r
  vec2 ap = p - a;\r
  vec3 base = texture(uTarget, vUv).xyz;\r
  if (uMode > 1.5) {\r
    float along = dot(ap, dir);\r
    float across = dot(ap, vec2(-dir.y, dir.x));\r
    if (uMode > 2.5) {\r
      outColor = vec4(mix(base, uValue, sweep(along, len, across, uRadius) * uStrength), 1.0);\r
      return;\r
    }\r
    vec3 add = vec3(uValue.xy * sweep(along, len, across, uRadius), uValue.z * sweep(along, len, across, uWide));\r
    outColor = vec4(base + add, 1.0);\r
    return;\r
  }\r
  float h = clamp(dot(ap, ab) / max(dot(ab, ab), 1e-9), 0.0, 1.0);\r
  vec2 d = ap - ab * h;\r
  float r2 = dot(d, d);\r
  float falloff = exp(-r2 / (uRadius * uRadius));\r
  float wide = exp(-r2 / (uWide * uWide));\r
  vec3 result = uMode > 0.5 ? mix(base, uValue, falloff * uStrength) : base + vec3(uValue.xy * falloff, uValue.z * wide);\r
  outColor = vec4(result, 1.0);\r
}\`;\r
\r
const ADVECT = \`\${HEADER}\r
uniform sampler2D uVelocity;\r
uniform sampler2D uSource;\r
uniform vec2 uVelocityTexel;\r
uniform float uDt;\r
uniform vec4 uDecay;\r
void main() {\r
  vec2 coord = vUv - uDt * texture(uVelocity, vUv).xy * uVelocityTexel;\r
  outColor = texture(uSource, coord) * uDecay;\r
}\`;\r
\r
const MACCORMACK = \`\${HEADER}\r
uniform sampler2D uVelocity;\r
uniform sampler2D uSource;\r
uniform sampler2D uForward;\r
uniform sampler2D uBack;\r
uniform vec2 uVelocityTexel;\r
uniform vec2 uSourceTexel;\r
uniform float uDt;\r
uniform vec4 uDecay;\r
void main() {\r
  vec2 coord = vUv - uDt * texture(uVelocity, vUv).xy * uVelocityTexel;\r
  vec4 forward = texture(uForward, vUv);\r
  vec4 corrected = forward + 0.5 * (texture(uSource, vUv) - texture(uBack, vUv));\r
  vec2 base = (floor(coord / uSourceTexel - 0.5) + 0.5) * uSourceTexel;\r
  vec4 a = texture(uSource, base);\r
  vec4 b = texture(uSource, base + vec2(uSourceTexel.x, 0.0));\r
  vec4 c = texture(uSource, base + vec2(0.0, uSourceTexel.y));\r
  vec4 d = texture(uSource, base + uSourceTexel);\r
  vec4 low = min(min(a, b), min(c, d));\r
  vec4 high = max(max(a, b), max(c, d));\r
  outColor = clamp(corrected, low, high) * uDecay;\r
}\`;\r
\r
const DIVERGENCE = \`\${HEADER}\r
uniform sampler2D uVelocity;\r
void main() {\r
  float left = texture(uVelocity, vL).x;\r
  float right = texture(uVelocity, vR).x;\r
  float top = texture(uVelocity, vT).y;\r
  float bottom = texture(uVelocity, vB).y;\r
  vec2 center = texture(uVelocity, vUv).xy;\r
  if (vL.x < 0.0) left = -center.x;\r
  if (vR.x > 1.0) right = -center.x;\r
  if (vT.y > 1.0) top = -center.y;\r
  if (vB.y < 0.0) bottom = -center.y;\r
  outColor = vec4(0.5 * (right - left + top - bottom), 0.0, 0.0, 1.0);\r
}\`;\r
\r
const SCALE = \`\${HEADER}\r
uniform sampler2D uSource;\r
uniform float uValue;\r
void main() {\r
  outColor = texture(uSource, vUv) * uValue;\r
}\`;\r
\r
const PRESSURE = \`\${HEADER}\r
uniform sampler2D uPressure;\r
uniform sampler2D uDivergence;\r
void main() {\r
  float left = texture(uPressure, vL).x;\r
  float right = texture(uPressure, vR).x;\r
  float top = texture(uPressure, vT).x;\r
  float bottom = texture(uPressure, vB).x;\r
  float divergence = texture(uDivergence, vUv).x;\r
  outColor = vec4((left + right + bottom + top - divergence) * 0.25, 0.0, 0.0, 1.0);\r
}\`;\r
\r
const GRADIENT = \`\${HEADER}\r
uniform sampler2D uPressure;\r
uniform sampler2D uVelocity;\r
void main() {\r
  float left = texture(uPressure, vL).x;\r
  float right = texture(uPressure, vR).x;\r
  float top = texture(uPressure, vT).x;\r
  float bottom = texture(uPressure, vB).x;\r
  vec2 velocity = texture(uVelocity, vUv).xy - vec2(right - left, top - bottom);\r
  outColor = vec4(velocity, 0.0, 1.0);\r
}\`;\r
\r
const SHADE = \`\r
uniform vec3 uColor;\r
uniform vec3 uSecondary;\r
uniform float uIntensity;\r
uniform float uHotspot;\r
vec3 shade(vec3 dye) {\r
  float energy = max(dye.x, 0.0);\r
  float heat = clamp(dye.y, 0.0, energy);\r
  float gas = max(dye.z, 0.0);\r
  float fresh = heat / max(energy, 0.0001);\r
  vec3 tint = mix(uSecondary, uColor, fresh);\r
  return (tint * energy + uSecondary * gas + vec3(heat * heat * 0.3 * uHotspot)) * uIntensity;\r
}\r
\`;\r
\r
const PREFILTER = \`\${HEADER}\${SHADE}\r
uniform sampler2D uDye;\r
uniform vec2 uDyeTexel;\r
void main() {\r
  vec2 o = uDyeTexel * 0.5;\r
  vec3 light = shade(texture(uDye, vUv + vec2(-o.x, -o.y)).xyz);\r
  light += shade(texture(uDye, vUv + vec2(o.x, -o.y)).xyz);\r
  light += shade(texture(uDye, vUv + vec2(-o.x, o.y)).xyz);\r
  light += shade(texture(uDye, vUv + vec2(o.x, o.y)).xyz);\r
  outColor = vec4(light * 0.25, 1.0);\r
}\`;\r
\r
const DOWN = \`\${HEADER}\r
uniform sampler2D uSource;\r
uniform vec2 uSourceTexel;\r
void main() {\r
  vec2 o = uSourceTexel;\r
  vec3 color = texture(uSource, vUv).rgb * 4.0;\r
  color += texture(uSource, vUv + vec2(-o.x, -o.y)).rgb;\r
  color += texture(uSource, vUv + vec2(o.x, -o.y)).rgb;\r
  color += texture(uSource, vUv + vec2(-o.x, o.y)).rgb;\r
  color += texture(uSource, vUv + vec2(o.x, o.y)).rgb;\r
  outColor = vec4(color / 8.0, 1.0);\r
}\`;\r
\r
const UP = \`\${HEADER}\r
uniform sampler2D uSource;\r
uniform vec2 uSourceTexel;\r
void main() {\r
  vec2 o = uSourceTexel;\r
  vec3 color = texture(uSource, vUv + vec2(-o.x * 2.0, 0.0)).rgb;\r
  color += texture(uSource, vUv + vec2(o.x * 2.0, 0.0)).rgb;\r
  color += texture(uSource, vUv + vec2(0.0, -o.y * 2.0)).rgb;\r
  color += texture(uSource, vUv + vec2(0.0, o.y * 2.0)).rgb;\r
  color += texture(uSource, vUv + vec2(-o.x, -o.y)).rgb * 2.0;\r
  color += texture(uSource, vUv + vec2(o.x, -o.y)).rgb * 2.0;\r
  color += texture(uSource, vUv + vec2(-o.x, o.y)).rgb * 2.0;\r
  color += texture(uSource, vUv + vec2(o.x, o.y)).rgb * 2.0;\r
  outColor = vec4(color / 12.0, 1.0);\r
}\`;\r
\r
const DISPLAY = \`\${HEADER}\${SHADE}\r
uniform sampler2D uDye;\r
uniform sampler2D uBloom;\r
uniform float uGlow;\r
uniform float uGrain;\r
uniform float uTime;\r
uniform float uLight;\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
void main() {\r
  vec3 dye = texture(uDye, vUv).xyz;\r
  vec3 light = shade(dye);\r
  vec3 bloom = texture(uBloom, vUv).rgb * uGlow;\r
  float edge = smoothstep(0.0, 0.02, min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y)));\r
  float grain = 1.0 + (hash(gl_FragCoord.xy + fract(uTime * 13.7) * 97.0) - 0.5) * uGrain * 2.0;\r
  if (uLight > 0.5) {\r
    float energy = max(dye.x, 0.0);\r
    float heat = clamp(dye.y, 0.0, energy);\r
    float gas = max(dye.z, 0.0);\r
    float fresh = heat / max(energy, 0.0001);\r
    vec3 tint = mix(uSecondary, uColor, fresh);\r
    float halo = dot(bloom, vec3(0.2126, 0.7152, 0.0722));\r
    float density = 1.0 - exp(-((energy * 1.1 + gas * 0.8) * uIntensity + halo * 0.25));\r
    float tone = dot(tint, vec3(0.2126, 0.7152, 0.0722));\r
    vec3 ink = tint * min(1.0, 0.5 / max(tone, 0.001)) * mix(0.95, 0.72, smoothstep(0.5, 3.0, energy));\r
    ink = mix(ink, vec3(1.0), clamp(heat * heat * 0.05 * uHotspot, 0.0, 0.45));\r
    density = clamp(density * grain, 0.0, 1.0) * edge;\r
    outColor = vec4(ink * density, density);\r
  } else {\r
    vec3 color = 1.0 - exp(-(light + bloom) * grain);\r
    color *= edge;\r
    outColor = vec4(color, max(color.r, max(color.g, color.b)));\r
  }\r
}\`;\r
\r
const QUALITY: Record<Quality, { sim: number; dye: number }> = {\r
  low: { sim: 96, dye: 384 },\r
  medium: { sim: 128, dye: 576 },\r
  high: { sim: 160, dye: 768 }\r
};\r
\r
const PRESSURE_STEPS = 20;\r
const FLOW = 0.75;\r
const BLOOM_LEVELS = 5;\r
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
const toHsv = ([r, g, b]: number[]): [number, number, number] => {\r
  const max = Math.max(r, g, b);\r
  const min = Math.min(r, g, b);\r
  const delta = max - min;\r
  let hue = 0;\r
  if (delta > 0) {\r
    if (max === r) hue = ((g - b) / delta) % 6;\r
    else if (max === g) hue = (b - r) / delta + 2;\r
    else hue = (r - g) / delta + 4;\r
  }\r
  return [(hue * 60 + 360) % 360, max > 0 ? delta / max : 0, max];\r
};\r
\r
const fromHsv = (hue: number, saturation: number, value: number): number[] => {\r
  const h = (((hue % 360) + 360) % 360) / 60;\r
  const c = value * saturation;\r
  const x = c * (1 - Math.abs((h % 2) - 1));\r
  const m = value - c;\r
  const [r, g, b] =\r
    h < 1 ? [c, x, 0] : h < 2 ? [x, c, 0] : h < 3 ? [0, c, x] : h < 4 ? [0, x, c] : h < 5 ? [x, 0, c] : [c, 0, x];\r
  return [r + m, g + m, b + m];\r
};\r
\r
const GlowCursor = ({\r
  color = '#5f8bff',\r
  secondaryColor,\r
  intensity = 1.3,\r
  trailWidth = 3,\r
  linger = 1.4,\r
  glow = 1.2,\r
  hotspot = 0.8,\r
  followSpeed = 0.6,\r
  grain = 0,\r
  clickBurst = true,\r
  quality = 'high',\r
  theme = 'dark',\r
  blendMode,\r
  maxDevicePixelRatio = 2,\r
  enabled = true,\r
  children,\r
  className = '',\r
  style,\r
  ...rest\r
}: GlowCursorProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const settingsRef = useRef<Settings>(null as unknown as Settings);\r
  settingsRef.current = {\r
    color: String(color),\r
    secondaryColor: secondaryColor ? String(secondaryColor) : '',\r
    intensity: Math.max(0, intensity),\r
    trailWidth: clamp(trailWidth, 0.5, 40),\r
    linger: clamp(linger, 0.1, 10),\r
    glow: Math.max(0, glow),\r
    hotspot: Math.max(0, hotspot),\r
    followSpeed: clamp(followSpeed, 0, 1),\r
    grain: Math.max(0, grain),\r
    clickBurst,\r
    quality: (QUALITY as Record<string, unknown>)[quality] ? quality : 'high',\r
    theme,\r
    maxDevicePixelRatio,\r
    enabled\r
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
      stencil: false\r
    });\r
    if (!container || !canvas || !gl || !gl.getExtension('EXT_color_buffer_float')) return undefined;\r
\r
    const vertexShader = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
    if (!vertexShader) return undefined;\r
\r
    const build = (source: string): Pass | null => {\r
      const fragment = compile(gl, gl.FRAGMENT_SHADER, source);\r
      const program = gl.createProgram();\r
      if (!fragment || !program) return null;\r
      gl.attachShader(program, vertexShader);\r
      gl.attachShader(program, fragment);\r
      gl.bindAttribLocation(program, 0, 'aPosition');\r
      gl.linkProgram(program);\r
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
    const passes = {\r
      splat: build(SPLAT),\r
      advect: build(ADVECT),\r
      maccormack: build(MACCORMACK),\r
      divergence: build(DIVERGENCE),\r
      scale: build(SCALE),\r
      pressure: build(PRESSURE),\r
      gradient: build(GRADIENT),\r
      prefilter: build(PREFILTER),\r
      down: build(DOWN),\r
      up: build(UP),\r
      display: build(DISPLAY)\r
    };\r
    if (Object.values(passes).some(pass => !pass)) return undefined;\r
    const pass = passes as Record<keyof typeof passes, Pass>;\r
\r
    const vao = gl.createVertexArray();\r
    const buffer = gl.createBuffer();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const probe = document.createElement('canvas');\r
    probe.width = 1;\r
    probe.height = 1;\r
    const probeContext = probe.getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
\r
    const state = {\r
      width: 1,\r
      height: 1,\r
      ratio: 1,\r
      colorKey: '',\r
      color: [0.37, 0.55, 1] as number[],\r
      secondary: [0.25, 0.3, 1] as number[],\r
      pointer: { x: 0, y: 0, inside: false },\r
      emitter: { x: 0, y: 0, vx: 0, vy: 0, px: 0, py: 0, travelled: 0 },\r
      ready: false,\r
      bursts: [] as [number, number][],\r
      active: -Infinity,\r
      time: 0,\r
      allocated: '',\r
      targets: null as Targets | null\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let alive = true;\r
    let visible = true;\r
\r
    const toRgb = (value: string, fallback: number[]): number[] => {\r
      if (!probeContext || !value) return fallback;\r
      const css = /^[0-9a-f]{3,8}$/i.test(value) ? \`#\${value}\` : value;\r
      probeContext.clearRect(0, 0, 1, 1);\r
      probeContext.fillStyle = '#000000';\r
      probeContext.fillStyle = css;\r
      probeContext.fillRect(0, 0, 1, 1);\r
      const [r, g, b] = probeContext.getImageData(0, 0, 1, 1).data;\r
      return [r / 255, g / 255, b / 255];\r
    };\r
\r
    const resolveColors = (s: Settings) => {\r
      const key = \`\${s.color}|\${s.secondaryColor}\`;\r
      if (key === state.colorKey) return;\r
      state.colorKey = key;\r
      state.color = toRgb(s.color, [0.37, 0.55, 1]);\r
      if (s.secondaryColor) {\r
        state.secondary = toRgb(s.secondaryColor, state.color);\r
      } else {\r
        const [hue, saturation, value] = toHsv(state.color);\r
        state.secondary = fromHsv(hue + 8, Math.min(1, saturation * 1.1 + 0.05), value);\r
      }\r
    };\r
\r
    const createTarget = (\r
      width: number,\r
      height: number,\r
      internalFormat: number,\r
      format: number,\r
      filter: number\r
    ): Target => {\r
      const texture = gl.createTexture() as WebGLTexture;\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, format, gl.HALF_FLOAT, null);\r
      const fbo = gl.createFramebuffer() as WebGLFramebuffer;\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
      gl.viewport(0, 0, width, height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      return { texture, fbo, width, height, texel: [1 / width, 1 / height] };\r
    };\r
\r
    const createPair = (\r
      width: number,\r
      height: number,\r
      internalFormat: number,\r
      format: number,\r
      filter: number\r
    ): Pair => {\r
      let read = createTarget(width, height, internalFormat, format, filter);\r
      let write = createTarget(width, height, internalFormat, format, filter);\r
      return {\r
        get read() {\r
          return read;\r
        },\r
        get write() {\r
          return write;\r
        },\r
        swap() {\r
          const next = read;\r
          read = write;\r
          write = next;\r
        },\r
        targets() {\r
          return [read, write];\r
        }\r
      };\r
    };\r
\r
    const destroyTarget = (target: Target) => {\r
      gl.deleteTexture(target.texture);\r
      gl.deleteFramebuffer(target.fbo);\r
    };\r
\r
    const release = () => {\r
      const t = state.targets;\r
      if (!t) return;\r
      [\r
        ...t.velocity.targets(),\r
        ...t.dye.targets(),\r
        ...t.pressure.targets(),\r
        t.divergence,\r
        t.forward,\r
        t.back,\r
        ...t.bloom\r
      ].forEach(destroyTarget);\r
      state.targets = null;\r
    };\r
\r
    const clearTargets = () => {\r
      const t = state.targets;\r
      if (!t) return;\r
      gl.clearColor(0, 0, 0, 0);\r
      [...t.velocity.targets(), ...t.dye.targets(), ...t.pressure.targets()].forEach(target => {\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);\r
        gl.clear(gl.COLOR_BUFFER_BIT);\r
      });\r
    };\r
\r
    const allocate = () => {\r
      const s = settingsRef.current;\r
      const key = \`\${s.quality}|\${state.width}|\${state.height}|\${canvas.width}|\${canvas.height}\`;\r
      if (key === state.allocated && state.targets) return;\r
      release();\r
      state.allocated = key;\r
      const preset = QUALITY[s.quality];\r
      const aspect = state.width / state.height;\r
      const dims = (base: number) =>\r
        aspect >= 1 ? [Math.round(base * aspect), base] : [base, Math.round(base / aspect)];\r
      const [simW, simH] = dims(preset.sim);\r
      let [dyeW, dyeH] = dims(preset.dye);\r
      const shrink = Math.min(1, canvas.width / dyeW, canvas.height / dyeH);\r
      dyeW = Math.max(2, Math.round(dyeW * shrink));\r
      dyeH = Math.max(2, Math.round(dyeH * shrink));\r
      const bloom = [];\r
      let bloomW = dyeW >> 1;\r
      let bloomH = dyeH >> 1;\r
      for (let i = 0; i < BLOOM_LEVELS; i++) {\r
        bloom.push(createTarget(Math.max(1, bloomW), Math.max(1, bloomH), gl.RGBA16F, gl.RGBA, gl.LINEAR));\r
        bloomW >>= 1;\r
        bloomH >>= 1;\r
      }\r
      state.targets = {\r
        velocity: createPair(simW, simH, gl.RG16F, gl.RG, gl.LINEAR),\r
        dye: createPair(dyeW, dyeH, gl.RGBA16F, gl.RGBA, gl.LINEAR),\r
        forward: createTarget(dyeW, dyeH, gl.RGBA16F, gl.RGBA, gl.LINEAR),\r
        back: createTarget(dyeW, dyeH, gl.RGBA16F, gl.RGBA, gl.LINEAR),\r
        pressure: createPair(simW, simH, gl.R16F, gl.RED, gl.NEAREST),\r
        divergence: createTarget(simW, simH, gl.R16F, gl.RED, gl.NEAREST),\r
        bloom\r
      };\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const ratio = Math.min(window.devicePixelRatio || 1, Math.max(0.5, s.maxDevicePixelRatio || 2));\r
      const pixelWidth = Math.max(1, Math.round(width * ratio));\r
      const pixelHeight = Math.max(1, Math.round(height * ratio));\r
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {\r
        canvas.width = pixelWidth;\r
        canvas.height = pixelHeight;\r
      }\r
      state.width = width;\r
      state.height = height;\r
      state.ratio = ratio;\r
      allocate();\r
    };\r
\r
    const draw = (target: Target | null) => {\r
      if (target) {\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);\r
        gl.viewport(0, 0, target.width, target.height);\r
      } else {\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
        gl.viewport(0, 0, canvas.width, canvas.height);\r
      }\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const use = (pass: Pass, texel: number[]) => {\r
      gl.useProgram(pass.program);\r
      if (pass.uniforms.uTexel) gl.uniform2f(pass.uniforms.uTexel, texel[0], texel[1]);\r
      return pass.uniforms;\r
    };\r
\r
    const bind = (unit: number, target: Target) => {\r
      gl.activeTexture(gl.TEXTURE0 + unit);\r
      gl.bindTexture(gl.TEXTURE_2D, target.texture);\r
      return unit;\r
    };\r
\r
    const splat = (\r
      pair: Pair,\r
      ax: number,\r
      ay: number,\r
      bx: number,\r
      by: number,\r
      radius: number,\r
      value: number[],\r
      mode: number,\r
      strength: number,\r
      wide = radius\r
    ) => {\r
      const u = use(pass.splat, pair.read.texel);\r
      gl.uniform1i(u.uTarget, bind(0, pair.read));\r
      gl.uniform1f(u.uAspect, state.width / state.height);\r
      gl.uniform2f(u.uA, ax / state.width, 1 - ay / state.height);\r
      gl.uniform2f(u.uB, bx / state.width, 1 - by / state.height);\r
      gl.uniform1f(u.uRadius, radius / state.height);\r
      gl.uniform1f(u.uWide, wide / state.height);\r
      gl.uniform3f(u.uValue, value[0], value[1], value[2]);\r
      gl.uniform1f(u.uMode, mode);\r
      gl.uniform1f(u.uStrength, strength);\r
      draw(pair.write);\r
      pair.swap();\r
    };\r
\r
    const toGrid = (vx: number, vy: number) => {\r
      const { velocity } = state.targets as Targets;\r
      return [(vx * velocity.read.width) / state.width, (-vy * velocity.read.height) / state.height];\r
    };\r
\r
    const lightRadius = (s: Settings) =>\r
      Math.max(s.trailWidth * 0.5, (state.height / (state.targets as Targets).dye.read.height) * 0.9);\r
\r
    const emit = (s: Settings, dt: number, now: number) => {\r
      const { emitter, pointer } = state;\r
      const { velocity, dye } = state.targets as Targets;\r
      emitter.px = emitter.x;\r
      emitter.py = emitter.y;\r
      if (reduce || s.followSpeed >= 1) {\r
        emitter.x = pointer.x;\r
        emitter.y = pointer.y;\r
      } else {\r
        const omega = 10 + s.followSpeed * 50;\r
        const steps = Math.max(1, Math.ceil(dt / 0.004));\r
        const h = dt / steps;\r
        for (let k = 0; k < steps; k++) {\r
          emitter.vx += (omega * omega * (pointer.x - emitter.x) - 2 * omega * emitter.vx) * h;\r
          emitter.vy += (omega * omega * (pointer.y - emitter.y) - 2 * omega * emitter.vy) * h;\r
          emitter.x += emitter.vx * h;\r
          emitter.y += emitter.vy * h;\r
        }\r
      }\r
      const dx = emitter.x - emitter.px;\r
      const dy = emitter.y - emitter.py;\r
      const length = Math.hypot(dx, dy);\r
      if (length < 0.05 || !s.enabled) return;\r
      const radius = lightRadius(s);\r
      if (!reduce) {\r
        const target = toGrid(dx / Math.max(dt, 1e-3), dy / Math.max(dt, 1e-3));\r
        splat(\r
          velocity,\r
          emitter.px,\r
          emitter.py,\r
          emitter.x,\r
          emitter.y,\r
          radius * 4 + 18,\r
          [target[0], target[1], 0],\r
          3,\r
          FLOW * 0.6\r
        );\r
      }\r
      splat(dye, emitter.px, emitter.py, emitter.x, emitter.y, radius, [5.6, 5.6, 0.7], 2, 1, radius * 5 + 6);\r
      state.active = now;\r
    };\r
\r
    const burst = (s: Settings, x: number, y: number, now: number) => {\r
      const { velocity, dye } = state.targets as Targets;\r
      const radius = lightRadius(s);\r
      const jets = 6;\r
      const base = Math.random() * Math.PI * 2;\r
      for (let k = 0; k < jets; k++) {\r
        const angle = base + (k / jets) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;\r
        const cx = Math.cos(angle);\r
        const cy = Math.sin(angle);\r
        const reach = 20 + Math.random() * 14;\r
        const ax = x + cx * 3;\r
        const ay = y + cy * 3;\r
        const bx = x + cx * reach;\r
        const by = y + cy * reach;\r
        if (!reduce) {\r
          const target = toGrid(Math.cos(angle + 0.6) * 760, Math.sin(angle + 0.6) * 760);\r
          splat(velocity, ax, ay, bx, by, 18, [target[0], target[1], 0], 1, 0.9);\r
        }\r
        splat(dye, ax, ay, bx, by, radius * 1.1, [2.4, 2.4, 0.3], 0, 1, radius * 5 + 6);\r
      }\r
      splat(dye, x, y, x + 0.01, y, radius * 2.2, [1.8, 1.8, 0.4], 0, 1, radius * 7 + 10);\r
      state.active = now;\r
    };\r
\r
    const step = (s: Settings, dt: number) => {\r
      const { velocity, dye, pressure, divergence } = state.targets as Targets;\r
      if (!reduce) {\r
        let u = use(pass.divergence, velocity.read.texel);\r
        gl.uniform1i(u.uVelocity, bind(0, velocity.read));\r
        draw(divergence);\r
\r
        u = use(pass.scale, pressure.read.texel);\r
        gl.uniform1i(u.uSource, bind(0, pressure.read));\r
        gl.uniform1f(u.uValue, 0.8);\r
        draw(pressure.write);\r
        pressure.swap();\r
\r
        u = use(pass.pressure, pressure.read.texel);\r
        gl.uniform1i(u.uDivergence, bind(1, divergence));\r
        for (let i = 0; i < PRESSURE_STEPS; i++) {\r
          gl.uniform1i(u.uPressure, bind(0, pressure.read));\r
          draw(pressure.write);\r
          pressure.swap();\r
        }\r
\r
        u = use(pass.gradient, velocity.read.texel);\r
        gl.uniform1i(u.uPressure, bind(0, pressure.read));\r
        gl.uniform1i(u.uVelocity, bind(1, velocity.read));\r
        draw(velocity.write);\r
        velocity.swap();\r
\r
        u = use(pass.advect, velocity.read.texel);\r
        gl.uniform2f(u.uVelocityTexel, velocity.read.texel[0], velocity.read.texel[1]);\r
        gl.uniform1i(u.uVelocity, bind(0, velocity.read));\r
        gl.uniform1i(u.uSource, bind(0, velocity.read));\r
        gl.uniform1f(u.uDt, dt);\r
        const calm = Math.exp(-dt * 1.2);\r
        gl.uniform4f(u.uDecay, calm, calm, 1, 1);\r
        draw(velocity.write);\r
        velocity.swap();\r
      }\r
\r
      const decay = [\r
        Math.exp((-dt * 4.6) / (s.linger * 0.8)),\r
        Math.exp((-dt * 4.6) / (s.linger * 0.2)),\r
        Math.exp((-dt * 4.6) / (s.linger * 1.2)),\r
        1\r
      ];\r
      const { forward, back } = state.targets as Targets;\r
      if (reduce) {\r
        const u = use(pass.advect, dye.read.texel);\r
        gl.uniform2f(u.uVelocityTexel, velocity.read.texel[0], velocity.read.texel[1]);\r
        gl.uniform1i(u.uVelocity, bind(0, velocity.read));\r
        gl.uniform1i(u.uSource, bind(1, dye.read));\r
        gl.uniform1f(u.uDt, 0);\r
        gl.uniform4f(u.uDecay, decay[0], decay[1], decay[2], decay[3]);\r
        draw(dye.write);\r
        dye.swap();\r
        return;\r
      }\r
      let u = use(pass.advect, dye.read.texel);\r
      gl.uniform2f(u.uVelocityTexel, velocity.read.texel[0], velocity.read.texel[1]);\r
      gl.uniform1i(u.uVelocity, bind(0, velocity.read));\r
      gl.uniform1i(u.uSource, bind(1, dye.read));\r
      gl.uniform1f(u.uDt, dt);\r
      gl.uniform4f(u.uDecay, 1, 1, 1, 1);\r
      draw(forward);\r
      gl.uniform1i(u.uSource, bind(1, forward));\r
      gl.uniform1f(u.uDt, -dt);\r
      draw(back);\r
      u = use(pass.maccormack, dye.read.texel);\r
      gl.uniform2f(u.uVelocityTexel, velocity.read.texel[0], velocity.read.texel[1]);\r
      gl.uniform2f(u.uSourceTexel, dye.read.texel[0], dye.read.texel[1]);\r
      gl.uniform1i(u.uVelocity, bind(0, velocity.read));\r
      gl.uniform1i(u.uSource, bind(1, dye.read));\r
      gl.uniform1i(u.uForward, bind(2, forward));\r
      gl.uniform1i(u.uBack, bind(3, back));\r
      gl.uniform1f(u.uDt, dt);\r
      gl.uniform4f(u.uDecay, decay[0], decay[1], decay[2], decay[3]);\r
      draw(dye.write);\r
      dye.swap();\r
    };\r
\r
    const setShade = (u: Record<string, WebGLUniformLocation | null>, s: Settings) => {\r
      gl.uniform3f(u.uColor, state.color[0], state.color[1], state.color[2]);\r
      gl.uniform3f(u.uSecondary, state.secondary[0], state.secondary[1], state.secondary[2]);\r
      gl.uniform1f(u.uIntensity, s.intensity);\r
      gl.uniform1f(u.uHotspot, s.hotspot);\r
    };\r
\r
    const render = (s: Settings) => {\r
      const { dye, bloom } = state.targets as Targets;\r
      if (s.glow > 0) {\r
        let u = use(pass.prefilter, bloom[0].texel);\r
        gl.uniform1i(u.uDye, bind(0, dye.read));\r
        gl.uniform2f(u.uDyeTexel, dye.read.texel[0], dye.read.texel[1]);\r
        setShade(u, s);\r
        draw(bloom[0]);\r
        u = use(pass.down, bloom[0].texel);\r
        for (let i = 1; i < bloom.length; i++) {\r
          gl.uniform1i(u.uSource, bind(0, bloom[i - 1]));\r
          gl.uniform2f(u.uSourceTexel, bloom[i - 1].texel[0], bloom[i - 1].texel[1]);\r
          draw(bloom[i]);\r
        }\r
        gl.enable(gl.BLEND);\r
        gl.blendFunc(gl.ONE, gl.ONE);\r
        u = use(pass.up, bloom[0].texel);\r
        for (let i = bloom.length - 1; i > 0; i--) {\r
          gl.uniform1i(u.uSource, bind(0, bloom[i]));\r
          gl.uniform2f(u.uSourceTexel, bloom[i].texel[0], bloom[i].texel[1]);\r
          draw(bloom[i - 1]);\r
        }\r
        gl.disable(gl.BLEND);\r
      }\r
      const u = use(pass.display, [1 / canvas.width, 1 / canvas.height]);\r
      gl.uniform1i(u.uDye, bind(0, dye.read));\r
      gl.uniform1i(u.uBloom, bind(1, bloom[0]));\r
      setShade(u, s);\r
      gl.uniform1f(u.uGlow, s.glow > 0 ? (s.glow * 1.4) / BLOOM_LEVELS : 0);\r
      gl.uniform1f(u.uGrain, s.grain);\r
      gl.uniform1f(u.uTime, state.time);\r
      gl.uniform1f(u.uLight, s.theme === 'light' ? 1 : 0);\r
      draw(null);\r
    };\r
\r
    const blank = () => {\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!alive || !visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(1 / 30, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      state.time += dt;\r
      const wanted = Math.min(window.devicePixelRatio || 1, Math.max(0.5, s.maxDevicePixelRatio || 2));\r
      if (Math.abs(wanted - state.ratio) > 0.01) resize();\r
      allocate();\r
      resolveColors(s);\r
      gl.bindVertexArray(vao);\r
      gl.disable(gl.BLEND);\r
\r
      if (state.ready) emit(s, dt, now);\r
      while (state.bursts.length) {\r
        const [x, y] = state.bursts.shift() as [number, number];\r
        burst(s, x, y, now);\r
      }\r
      step(s, dt);\r
      render(s);\r
\r
      const quiet = now - state.active > s.linger * 1200 + 900;\r
      const resting = Math.hypot(state.emitter.vx, state.emitter.vy) < 1;\r
      if (quiet && resting) {\r
        clearTargets();\r
        blank();\r
        last = 0;\r
        return;\r
      }\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (!raf && alive && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      const inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      if (!inside) {\r
        if (state.pointer.inside) {\r
          state.pointer.inside = false;\r
          state.ready = false;\r
          wake();\r
        }\r
        return;\r
      }\r
      if (!state.ready) {\r
        state.emitter.x = x;\r
        state.emitter.y = y;\r
        state.emitter.px = x;\r
        state.emitter.py = y;\r
        state.emitter.vx = 0;\r
        state.emitter.vy = 0;\r
        state.ready = true;\r
      }\r
      state.pointer.x = x;\r
      state.pointer.y = y;\r
      state.pointer.inside = true;\r
      wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      if (!s.clickBurst || !s.enabled) return;\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;\r
      state.bursts.push([x, y]);\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      state.pointer.inside = false;\r
      state.ready = false;\r
      wake();\r
    };\r
\r
    const onVisibility = () => {\r
      last = 0;\r
      wake();\r
    };\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      resize();\r
      wake();\r
    });\r
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
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
    blank();\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      release();\r
      Object.values(pass).forEach(item => gl.deleteProgram(item.program));\r
      gl.deleteShader(vertexShader);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
    };\r
  }, []);\r
\r
  const mode = blendMode ?? (theme === 'light' ? 'normal' : 'screen');\r
\r
  return (\r
    <div\r
      ref={containerRef}\r
      className={['relative h-full w-full overflow-hidden', className].filter(Boolean).join(' ')}\r
      style={style}\r
      {...rest}\r
    >\r
      <canvas\r
        ref={canvasRef}\r
        className="pointer-events-none absolute inset-0 block h-full w-full select-none"\r
        style={{ mixBlendMode: mode }}\r
        aria-hidden="true"\r
      />\r
      {children && <div className="relative z-[1] h-full w-full">{children}</div>}\r
    </div>\r
  );\r
};\r
\r
export default GlowCursor;\r
`,a={usage:`import GlowCursor from './GlowCursor';

<div style={{ position: 'relative', width: '100%', height: '500px' }}>
  <GlowCursor
    color="#5f8bff"
    intensity={1.3}
    trailWidth={3}
    linger={1.4}
    glow={1.2}
    clickBurst
    theme="dark"
  >
    {/* Your content here */}
  </GlowCursor>
</div>`,code:r,css:e,tailwind:n,tsCode:t,tsTailwind:o};export{a as glowCursor};
