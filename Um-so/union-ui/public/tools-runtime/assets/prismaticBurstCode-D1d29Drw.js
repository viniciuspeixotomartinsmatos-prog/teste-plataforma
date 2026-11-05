const r=`'use client';\r
\r
import { useEffect, useRef, useState } from 'react';\r
\r
import './PrismaticBurst.css';\r
\r
const BLOOM_LEVELS = 4;\r
const MAX_PULSES = 4;\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const BURST = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
\r
uniform vec2 uResolution;\r
uniform float uTime;\r
uniform float uPhase;\r
uniform float uIntensity;\r
uniform mat3 uOrient;\r
uniform int uColorCount;\r
uniform float uDistort;\r
uniform vec2 uOffset;\r
uniform sampler2D uGradient;\r
uniform float uNoiseAmount;\r
uniform int uRayCount;\r
uniform float uZoom;\r
uniform float uRayWidth;\r
uniform float uTwist;\r
uniform float uFlow;\r
uniform float uCenterFade;\r
uniform vec4 uPointer;\r
uniform vec4 uPulses[4];\r
uniform vec3 uIntro;\r
uniform float uEncode;\r
out vec4 outColor;\r
\r
float hash21(vec2 p) {\r
  p = floor(p);\r
  float f = 52.9829189 * fract(dot(p, vec2(0.065, 0.005)));\r
  return fract(f);\r
}\r
\r
mat2 rot30() {\r
  return mat2(0.8, -0.5, 0.5, 0.8);\r
}\r
\r
float layeredNoise(vec2 fragPx) {\r
  vec2 p = mod(fragPx + vec2(uTime * 30.0, -uTime * 21.0), 1024.0);\r
  vec2 q = rot30() * p;\r
  float n = 0.0;\r
  n += 0.40 * hash21(q);\r
  n += 0.25 * hash21(q * 2.0 + 17.0);\r
  n += 0.20 * hash21(q * 4.0 + 47.0);\r
  n += 0.10 * hash21(q * 8.0 + 113.0);\r
  n += 0.05 * hash21(q * 16.0 + 191.0);\r
  return n;\r
}\r
\r
float edgeFade(vec2 frag, vec2 res, vec2 offset) {\r
  vec2 toC = frag - 0.5 * res - offset;\r
  float r = length(toC) / (0.5 * min(res.x, res.y) * uCenterFade);\r
  float x = clamp(r, 0.0, 1.0);\r
  float q = x * x * x * (x * (x * 6.0 - 15.0) + 10.0);\r
  float s = q * 0.5;\r
  s = pow(s, 1.5);\r
  float tail = 1.0 - pow(1.0 - s, 2.0);\r
  s = mix(s, tail, 0.2);\r
  float dn = (layeredNoise(frag * 0.15) - 0.5) * 0.0015 * s;\r
  return clamp(s + dn, 0.0, 1.0);\r
}\r
\r
vec2 rot2(vec2 v, float a) {\r
  float s = sin(a);\r
  float c = cos(a);\r
  return mat2(c, -s, s, c) * v;\r
}\r
\r
float bendAngle(vec3 q, float t) {\r
  return 0.8 * sin(q.x * 0.55 + t * 0.6) + 0.7 * sin(q.y * 0.50 - t * 0.5) + 0.6 * sin(q.z * 0.60 + t * 0.7);\r
}\r
\r
void main() {\r
  vec2 frag = gl_FragCoord.xy;\r
  float t = uPhase;\r
  float jitterAmp = 0.1 * clamp(uNoiseAmount, 0.0, 1.0);\r
  vec2 centered = 2.0 * (frag - uOffset) - uResolution;\r
  vec3 dir = normalize(vec3(centered, uResolution.y * max(uZoom, 1e-3)));\r
  float marchT = 0.0;\r
  vec3 col = vec3(0.0);\r
  float n = layeredNoise(frag);\r
  float amp = clamp(uDistort, 0.0, 50.0) * 0.15;\r
  float edge = 0.5 - 0.35 * (uRayWidth - 1.0);\r
  mat2 twist = mat2(1.0);\r
  if (uTwist != 0.0) {\r
    float a = uTwist * length(centered) / uResolution.y;\r
    float c = cos(a);\r
    float s = sin(a);\r
    twist = mat2(c, s, -s, c);\r
  }\r
\r
  for (int i = 0; i < 44; ++i) {\r
    vec3 P = marchT * dir;\r
    P.z -= 2.0;\r
    float rad = length(P);\r
    vec3 Pl = P * (10.0 / max(rad, 1e-6));\r
    if (uTwist != 0.0) Pl.xy = twist * Pl.xy;\r
    Pl = uOrient * Pl;\r
\r
    float stepLen = min(rad - 0.3, n * jitterAmp) + 0.1;\r
\r
    vec3 Pb = Pl;\r
    if (amp > 0.0) {\r
      float grow = smoothstep(0.35, 3.0, marchT);\r
      float a1 = amp * grow * bendAngle(Pl * 0.6, t);\r
      float a2 = 0.5 * amp * grow * bendAngle(Pl.zyx * 0.5 + 3.1, t * 0.9);\r
      Pb.xz = rot2(Pb.xz, a1);\r
      Pb.xy = rot2(Pb.xy, a2);\r
    }\r
\r
    float rayPattern = smoothstep(\r
      edge,\r
      edge + 0.2,\r
      sin(Pb.x + cos(Pb.y) * cos(Pb.z)) * sin(Pb.z + sin(Pb.y) * cos(Pb.x + t))\r
    );\r
\r
    if (uRayCount > 0) {\r
      float ang = atan(Pb.y, Pb.x);\r
      float comb = 0.5 + 0.5 * cos(float(uRayCount) * ang);\r
      comb = pow(comb, 3.0);\r
      rayPattern *= smoothstep(0.15, 0.95, comb);\r
    }\r
\r
    float depth = marchT - uFlow;\r
    vec3 spectral;\r
    if (uColorCount > 0) {\r
      float saw = fract(depth * 0.25);\r
      float tRay = saw * saw * (3.0 - 2.0 * saw);\r
      spectral = 2.0 * texture(uGradient, vec2(clamp(tRay, 0.0, 1.0), 0.5)).rgb;\r
    } else {\r
      spectral = 1.0 + cos(depth * 3.0 + vec3(0.0, 1.0, 2.0));\r
    }\r
\r
    col += (0.05 / (0.4 + stepLen)) * smoothstep(5.0, 0.0, rad) * spectral * rayPattern;\r
    marchT += stepLen;\r
  }\r
\r
  col *= edgeFade(frag, uResolution, uOffset);\r
  col *= uIntensity;\r
\r
  float unit = 0.5 * min(uResolution.x, uResolution.y);\r
  float radius = length(frag - 0.5 * uResolution - uOffset) / unit;\r
  float lift = 1.0;\r
  for (int k = 0; k < 4; k++) {\r
    vec4 pulse = uPulses[k];\r
    if (pulse.y <= 0.0) continue;\r
    float d = (radius - pulse.x) / pulse.z;\r
    lift += pulse.y * exp(-d * d) + pulse.w;\r
  }\r
  if (uPointer.z > 0.0) {\r
    vec2 m = (frag - uPointer.xy) / unit;\r
    lift += uPointer.z * exp(-dot(m, m) / max(uPointer.w * uPointer.w, 1e-4));\r
  }\r
  if (uIntro.z > 0.0) {\r
    vec2 toC = frag - 0.5 * uResolution - uOffset;\r
    float ang = atan(toC.y, toC.x);\r
    float streak = 0.5 + 0.22 * sin(ang * 5.0 + 1.3) + 0.16 * sin(ang * 13.0 + 4.1) + 0.12 * sin(ang * 29.0 + 2.2);\r
    float front = uIntro.x * (0.7 + 0.3 * streak);\r
    float d = (radius - front) / 0.2;\r
    lift += uIntro.y * exp(-d * d);\r
    lift *= smoothstep(front, front - 0.5, radius);\r
  }\r
\r
  outColor = vec4(col * lift * uEncode, 1.0);\r
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
uniform vec2 uSceneSize;\r
uniform sampler2D uBloom0;\r
uniform sampler2D uBloom1;\r
uniform sampler2D uBloom2;\r
uniform sampler2D uBloom3;\r
uniform vec2 uView;\r
uniform float uExact;\r
uniform float uDecode;\r
uniform float uBloom;\r
uniform float uFade;\r
uniform float uLightMode;\r
out vec4 outColor;\r
\r
vec3 tap(vec2 uv) {\r
  return textureLod(uScene, uv, 0.0).rgb;\r
}\r
\r
vec3 bicubic(vec2 uv) {\r
  vec2 position = uv * uSceneSize;\r
  vec2 center = floor(position - 0.5) + 0.5;\r
  vec2 f = position - center;\r
  vec2 w0 = f * (-0.5 + f * (1.0 - 0.5 * f));\r
  vec2 w1 = 1.0 + f * f * (-2.5 + 1.5 * f);\r
  vec2 w2 = f * (0.5 + f * (2.0 - 1.5 * f));\r
  vec2 w3 = f * f * (-0.5 + 0.5 * f);\r
  vec2 w12 = w1 + w2;\r
  vec2 t0 = (center - 1.0) / uSceneSize;\r
  vec2 t3 = (center + 2.0) / uSceneSize;\r
  vec2 t12 = (center + w2 / w12) / uSceneSize;\r
  vec3 result = tap(vec2(t0.x, t0.y)) * w0.x * w0.y;\r
  result += tap(vec2(t12.x, t0.y)) * w12.x * w0.y;\r
  result += tap(vec2(t3.x, t0.y)) * w3.x * w0.y;\r
  result += tap(vec2(t0.x, t12.y)) * w0.x * w12.y;\r
  result += tap(vec2(t12.x, t12.y)) * w12.x * w12.y;\r
  result += tap(vec2(t3.x, t12.y)) * w3.x * w12.y;\r
  result += tap(vec2(t0.x, t3.y)) * w0.x * w3.y;\r
  result += tap(vec2(t12.x, t3.y)) * w12.x * w3.y;\r
  result += tap(vec2(t3.x, t3.y)) * w3.x * w3.y;\r
  return max(result, 0.0);\r
}\r
\r
float smootherstep01(float t) {\r
  t = clamp(t, 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uView;\r
  vec3 col = uExact > 0.5 ? texelFetch(uScene, ivec2(gl_FragCoord.xy), 0).rgb : bicubic(uv);\r
  if (uBloom > 0.0) {\r
    vec3 halo = texture(uBloom0, uv).rgb * 0.42;\r
    halo += texture(uBloom1, uv).rgb * 0.3;\r
    halo += texture(uBloom2, uv).rgb * 0.18;\r
    halo += texture(uBloom3, uv).rgb * 0.1;\r
    col += halo * uBloom * (uLightMode > 0.5 ? 0.25 : 1.0);\r
  }\r
  col = clamp(col * uDecode, 0.0, 1.0);\r
\r
  float mask = 1.0;\r
  float edge = uFade * 0.5;\r
  if (edge > 0.0) {\r
    mask *= smootherstep01(uv.x / edge) * smootherstep01((1.0 - uv.x) / edge);\r
    mask *= smootherstep01(uv.y / edge) * smootherstep01((1.0 - uv.y) / edge);\r
  }\r
\r
  if (uLightMode > 0.5) {\r
    float energy = max(max(col.r, col.g), col.b);\r
    vec3 hue = col / max(energy, 0.0001);\r
    float neutral = min(hue.r, min(hue.g, hue.b));\r
    hue = max(hue - vec3(neutral * 0.68), vec3(0.0));\r
    hue /= max(max(hue.r, max(hue.g, hue.b)), 0.0001);\r
    vec3 pigment = mix(hue, hue * hue, 0.24) * 0.64;\r
    float coverage = smoothstep(0.001, 0.32, energy);\r
    coverage = pow(coverage, 0.72) * 0.92 * mask;\r
    outColor = vec4(pigment * coverage, coverage);\r
  } else {\r
    col *= mask;\r
    outColor = vec4(col, max(col.r, max(col.g, col.b)));\r
  }\r
}\`;\r
\r
const QUALITY = { low: 0.35, medium: 0.5, high: 0.7 };\r
const MIN_SCALE = 0.2;\r
const INTRO_SECONDS = 2.4;\r
const PULSE_LIFE = 1.5;\r
const ANIMATIONS = { rotate: 0, rotate3d: 1, hover: 2 };\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const toPx = value => {\r
  if (value == null) return 0;\r
  if (typeof value === 'number') return value;\r
  const parsed = parseFloat(String(value).trim().replace('px', ''));\r
  return Number.isNaN(parsed) ? 0 : parsed;\r
};\r
\r
const rotX = a => {\r
  const c = Math.cos(a);\r
  const s = Math.sin(a);\r
  return [1, 0, 0, 0, c, -s, 0, s, c];\r
};\r
\r
const rotY = a => {\r
  const c = Math.cos(a);\r
  const s = Math.sin(a);\r
  return [c, 0, s, 0, 1, 0, -s, 0, c];\r
};\r
\r
const rotZ = a => {\r
  const c = Math.cos(a);\r
  const s = Math.sin(a);\r
  return [c, -s, 0, s, c, 0, 0, 0, 1];\r
};\r
\r
const multiply = (a, b) => {\r
  const out = new Float32Array(9);\r
  for (let col = 0; col < 3; col++) {\r
    for (let row = 0; row < 3; row++) {\r
      out[col * 3 + row] = a[row] * b[col * 3] + a[3 + row] * b[col * 3 + 1] + a[6 + row] * b[col * 3 + 2];\r
    }\r
  }\r
  return out;\r
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
const PrismaticBurst = ({\r
  colors,\r
  intensity = 2,\r
  speed = 0.5,\r
  animationType = 'rotate3d',\r
  distort = 0,\r
  rayCount = 0,\r
  rayWidth = 1,\r
  zoom = 1,\r
  twist = 0,\r
  flow = 0,\r
  centerFade = 1,\r
  grain = 0.8,\r
  glow = 0,\r
  offset,\r
  mouseInteraction = true,\r
  mouseStrength = 0.5,\r
  hoverDampness = 0.25,\r
  clickBurst = true,\r
  intro = true,\r
  fade = 0,\r
  quality = 'high',\r
  resolution,\r
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
    colors: Array.isArray(colors) ? colors.slice(0, 64).map(String) : [],\r
    intensity: Math.max(0, intensity),\r
    speed,\r
    animation: ANIMATIONS[animationType] ?? ANIMATIONS.rotate3d,\r
    distort: Math.max(0, distort),\r
    rayCount: Math.max(0, Math.floor(rayCount ?? 0)),\r
    rayWidth: clamp(rayWidth, 0.2, 2.5),\r
    zoom: Math.max(0.05, zoom),\r
    twist,\r
    flow,\r
    centerFade: clamp(centerFade, 0.5, 3),\r
    grain: clamp(grain, 0.3, 1),\r
    glow: Math.max(0, glow),\r
    offsetX: toPx(offset?.x),\r
    offsetY: toPx(offset?.y),\r
    mouseInteraction,\r
    mouseStrength: Math.max(0, mouseStrength),\r
    hoverDampness: clamp(hoverDampness, 0, 1),\r
    clickBurst,\r
    intro,\r
    fade: clamp(fade, 0, 1),\r
    scale: clamp(resolution ?? QUALITY[quality] ?? QUALITY.high, MIN_SCALE, 1),\r
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
    const burstProgram = link(gl, BURST);\r
    const downProgram = link(gl, DOWNSAMPLE);\r
    const blurProgram = link(gl, BLUR);\r
    const compositeProgram = link(gl, COMPOSITE);\r
    if (!burstProgram || !downProgram || !blurProgram || !compositeProgram) return undefined;\r
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
    const gradient = gl.createTexture();\r
    let gradientKey = null;\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const toRgb = value => {\r
      if (!probe) return [255, 255, 255];\r
      probe.clearRect(0, 0, 1, 1);\r
      probe.fillStyle = '#ffffff';\r
      probe.fillStyle = value;\r
      probe.fillRect(0, 0, 1, 1);\r
      const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
      return [r, g, b];\r
    };\r
    const uploadGradient = list => {\r
      const key = list.join('|');\r
      if (key === gradientKey) return;\r
      gradientKey = key;\r
      const count = Math.max(1, list.length);\r
      const data = new Uint8Array(count * 4).fill(255);\r
      list.forEach((value, index) => data.set(toRgb(value), index * 4));\r
      gl.bindTexture(gl.TEXTURE_2D, gradient);\r
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, count, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    };\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const state = {\r
      time: 0,\r
      phase: 0,\r
      flow: 0,\r
      kick: 0,\r
      intro: settingsRef.current.intro && !reduce ? 0 : 1,\r
      hoverX: 0.5,\r
      hoverY: 0.5,\r
      smoothX: 0,\r
      smoothY: 0,\r
      touch: 0,\r
      governor: 1,\r
      slow: 0,\r
      quick: 0\r
    };\r
    const pulses = [];\r
    const pulseData = new Float32Array(MAX_PULSES * 4);\r
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
      const scale = Math.max(MIN_SCALE, s.scale * state.governor);\r
      const sceneWidth = Math.max(1, Math.round(width * scale));\r
      const sceneHeight = Math.max(1, Math.round(height * scale));\r
      const exact = sceneWidth === width && sceneHeight === height;\r
      gl.bindVertexArray(vao);\r
      allocate(scene, sceneWidth, sceneHeight);\r
      levels.forEach((pair, index) => {\r
        const levelWidth = Math.max(1, Math.round(cssWidth / 2 ** (index + 1)));\r
        const levelHeight = Math.max(1, Math.round(cssHeight / 2 ** (index + 1)));\r
        allocate(pair[0], levelWidth, levelHeight);\r
        allocate(pair[1], levelWidth, levelHeight);\r
      });\r
      uploadGradient(s.colors);\r
\r
      const toScene = sceneWidth / cssWidth;\r
      const engaged = s.mouseInteraction ? state.touch : 0;\r
      const nx = cssWidth > 0 ? (state.smoothX / cssWidth) * 2 - 1 : 0;\r
      const ny = cssHeight > 0 ? (state.smoothY / cssHeight) * 2 - 1 : 0;\r
      const parallax = 0.06 * s.mouseStrength * engaged * Math.min(sceneWidth, sceneHeight) * 0.5;\r
      const offsetX = s.offsetX * toScene + nx * parallax;\r
      const offsetY = s.offsetY * toScene - ny * parallax;\r
\r
      const t = state.phase;\r
      let orient;\r
      if (s.animation === 0) {\r
        const a = t * 0.2;\r
        const c0 = Math.cos(a);\r
        orient = [c0, 0, Math.cos(a + 11), 0, 1, 0, Math.cos(a + 33), 0, c0];\r
      } else if (s.animation === 1) {\r
        orient = multiply(multiply(rotZ(t * 0.17), rotY(t * 0.21)), rotX(t * 0.31));\r
      } else {\r
        const mx = state.hoverX * 2 - 1;\r
        const my = state.hoverY * 2 - 1;\r
        orient = multiply(rotY(mx * 0.6), rotX(my * 0.6));\r
      }\r
      if (s.animation !== 2 && engaged > 0) {\r
        const tilt = 0.3 * s.mouseStrength * engaged;\r
        orient = multiply(orient, multiply(rotY(nx * tilt), rotX(ny * tilt)));\r
      }\r
\r
      pulseData.fill(0);\r
      pulses.forEach((pulse, index) => {\r
        const life = pulse.age / PULSE_LIFE;\r
        pulseData.set(\r
          [pulse.age * 1.7, 1.6 * Math.pow(1 - life, 1.6), 0.2 + pulse.age * 0.16, 0.35 * Math.exp(-pulse.age * 7)],\r
          index * 4\r
        );\r
      });\r
\r
      const unit = 0.5 * Math.min(sceneWidth, sceneHeight);\r
      const reach =\r
        Math.hypot(sceneWidth * 0.5 + Math.abs(offsetX), sceneHeight * 0.5 + Math.abs(offsetY)) / Math.max(unit, 1);\r
      const rise = 1 - Math.pow(1 - state.intro, 3);\r
\r
      const b = pass(scene, burstProgram);\r
      bind(0, gradient);\r
      gl.uniform1i(b.uGradient, 0);\r
      gl.uniform2f(b.uResolution, sceneWidth, sceneHeight);\r
      gl.uniform1f(b.uTime, state.time);\r
      gl.uniform1f(b.uPhase, t);\r
      gl.uniform1f(b.uIntensity, s.intensity);\r
      gl.uniformMatrix3fv(b.uOrient, false, orient);\r
      gl.uniform1i(b.uColorCount, s.colors.length);\r
      gl.uniform1f(b.uDistort, s.distort);\r
      gl.uniform2f(b.uOffset, offsetX, offsetY);\r
      gl.uniform1f(b.uNoiseAmount, s.grain);\r
      gl.uniform1i(b.uRayCount, s.rayCount);\r
      gl.uniform1f(b.uZoom, s.zoom);\r
      gl.uniform1f(b.uRayWidth, s.rayWidth);\r
      gl.uniform1f(b.uTwist, s.twist);\r
      gl.uniform1f(b.uFlow, state.flow);\r
      gl.uniform1f(b.uCenterFade, s.centerFade * Math.max(1, s.zoom));\r
      gl.uniform4f(\r
        b.uPointer,\r
        state.smoothX * toScene,\r
        (cssHeight - state.smoothY) * toScene,\r
        s.mouseInteraction ? 0.7 * s.mouseStrength * engaged : 0,\r
        0.45\r
      );\r
      gl.uniform4fv(b.uPulses, pulseData);\r
      gl.uniform3f(b.uIntro, (rise * (reach + 0.6)) / 0.7, 1.6 * (1 - state.intro), state.intro < 1 ? 1 : 0);\r
      gl.uniform1f(b.uEncode, encode);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      if (s.glow > 0) {\r
        let source = scene;\r
        levels.forEach(([front, back]) => {\r
          const d = pass(front, downProgram);\r
          bind(0, source.texture);\r
          gl.uniform1i(d.uSource, 0);\r
          gl.uniform2f(d.uTarget, front.width, front.height);\r
          gl.uniform2f(d.uTexel, 1 / source.width, 1 / source.height);\r
          gl.uniform1f(d.uLimit, 3 * encode);\r
          gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
          let u = pass(back, blurProgram);\r
          bind(0, front.texture);\r
          gl.uniform1i(u.uSource, 0);\r
          gl.uniform2f(u.uTarget, back.width, back.height);\r
          gl.uniform2f(u.uStep, 1 / front.width, 0);\r
          gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
          u = pass(front, blurProgram);\r
          bind(0, back.texture);\r
          gl.uniform1i(u.uSource, 0);\r
          gl.uniform2f(u.uTarget, front.width, front.height);\r
          gl.uniform2f(u.uStep, 0, 1 / back.height);\r
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
      gl.uniform2f(c.uSceneSize, sceneWidth, sceneHeight);\r
      gl.uniform2f(c.uView, width, height);\r
      gl.uniform1f(c.uExact, exact ? 1 : 0);\r
      gl.uniform1f(c.uDecode, 1 / encode);\r
      gl.uniform1f(c.uBloom, s.glow);\r
      gl.uniform1f(c.uFade, s.fade);\r
      gl.uniform1f(c.uLightMode, s.lightMode ? 1 : 0);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      for (let unit = BLOOM_LEVELS; unit >= 0; unit--) bind(unit, null);\r
    };\r
\r
    const tune = interval => {\r
      if (interval > 1 / 40) {\r
        state.slow += 1;\r
        state.quick = 0;\r
      } else if (interval < 1 / 55) {\r
        state.quick += 1;\r
        state.slow = 0;\r
      }\r
      if (state.slow > 20) {\r
        state.governor = Math.max(0.5, state.governor * 0.85);\r
        state.slow = 0;\r
      } else if (state.quick > 180 && state.governor < 1) {\r
        state.governor = Math.min(1, state.governor * 1.1);\r
        state.quick = 0;\r
      }\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      if (last) tune((now - last) / 1000);\r
      last = now;\r
\r
      if (!s.intro || reduce) state.intro = 1;\r
      else if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / INTRO_SECONDS);\r
      const rush = 3 * Math.pow(1 - state.intro, 2);\r
      const running = !s.paused && !reduce;\r
      if (running) {\r
        state.time += dt;\r
        state.phase += dt * s.speed * (1 + rush) + state.kick * dt;\r
        state.flow += dt * s.flow * 1.2;\r
      }\r
      state.kick *= Math.exp(-dt * 3.5);\r
      if (state.kick < 1e-3) state.kick = 0;\r
\r
      const engaged = s.mouseInteraction && pointer.inside && !reduce;\r
      const tau = 0.02 + s.hoverDampness * 0.5;\r
      const follow = 1 - Math.exp(-dt / tau);\r
      if (engaged && state.touch < 0.01) {\r
        state.smoothX = pointer.x;\r
        state.smoothY = pointer.y;\r
      }\r
      state.smoothX += (pointer.x - state.smoothX) * follow;\r
      state.smoothY += (pointer.y - state.smoothY) * follow;\r
      state.touch += ((engaged ? 1 : 0) - state.touch) * (1 - Math.exp(-dt * (engaged ? 5 : 2.5)));\r
      if (s.animation === 2 && pointer.inside) {\r
        const width = Math.max(1, container.clientWidth);\r
        const height = Math.max(1, container.clientHeight);\r
        state.hoverX += (clamp(pointer.x / width, 0, 1) - state.hoverX) * follow;\r
        state.hoverY += (clamp(pointer.y / height, 0, 1) - state.hoverY) * follow;\r
      }\r
\r
      for (let i = pulses.length - 1; i >= 0; i--) {\r
        pulses[i].age += dt;\r
        if (pulses[i].age > PULSE_LIFE) pulses.splice(i, 1);\r
      }\r
\r
      render();\r
\r
      const settling =\r
        state.intro < 1 ||\r
        pulses.length > 0 ||\r
        state.kick > 0 ||\r
        Math.abs((engaged ? 1 : 0) - state.touch) > 0.002 ||\r
        Math.abs(pointer.x - state.smoothX) + Math.abs(pointer.y - state.smoothY) > 0.2;\r
      if ((running && (s.speed !== 0 || s.grain > 0 || s.flow !== 0)) || settling) raf = requestAnimationFrame(frame);\r
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
      const s = settingsRef.current;\r
      if (s.mouseInteraction && s.clickBurst && !reduce) {\r
        if (pulses.length >= MAX_PULSES) pulses.shift();\r
        pulses.push({ age: 0 });\r
        state.kick = Math.min(5, state.kick + 2.4);\r
      }\r
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
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
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
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      [scene, ...levels.flat()].forEach(target => {\r
        if (target.texture) gl.deleteTexture(target.texture);\r
        gl.deleteFramebuffer(target.framebuffer);\r
      });\r
      gl.deleteTexture(gradient);\r
      [burstProgram, downProgram, blurProgram, compositeProgram].forEach(item => gl.deleteProgram(item.program));\r
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
    <div ref={containerRef} className={\`prismatic-burst-container\${className ? \` \${className}\` : ''}\`} style={style}>\r
      <canvas\r
        ref={canvasRef}\r
        className="prismatic-burst-canvas"\r
        style={mixBlendMode && mixBlendMode !== 'none' ? { mixBlendMode } : undefined}\r
        aria-hidden="true"\r
      />\r
    </div>\r
  );\r
};\r
\r
export default PrismaticBurst;\r
`,n=`.prismatic-burst-container {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.prismatic-burst-canvas {\r
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
const BLOOM_LEVELS = 4;\r
const MAX_PULSES = 4;\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const BURST = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
\r
uniform vec2 uResolution;\r
uniform float uTime;\r
uniform float uPhase;\r
uniform float uIntensity;\r
uniform mat3 uOrient;\r
uniform int uColorCount;\r
uniform float uDistort;\r
uniform vec2 uOffset;\r
uniform sampler2D uGradient;\r
uniform float uNoiseAmount;\r
uniform int uRayCount;\r
uniform float uZoom;\r
uniform float uRayWidth;\r
uniform float uTwist;\r
uniform float uFlow;\r
uniform float uCenterFade;\r
uniform vec4 uPointer;\r
uniform vec4 uPulses[4];\r
uniform vec3 uIntro;\r
uniform float uEncode;\r
out vec4 outColor;\r
\r
float hash21(vec2 p) {\r
  p = floor(p);\r
  float f = 52.9829189 * fract(dot(p, vec2(0.065, 0.005)));\r
  return fract(f);\r
}\r
\r
mat2 rot30() {\r
  return mat2(0.8, -0.5, 0.5, 0.8);\r
}\r
\r
float layeredNoise(vec2 fragPx) {\r
  vec2 p = mod(fragPx + vec2(uTime * 30.0, -uTime * 21.0), 1024.0);\r
  vec2 q = rot30() * p;\r
  float n = 0.0;\r
  n += 0.40 * hash21(q);\r
  n += 0.25 * hash21(q * 2.0 + 17.0);\r
  n += 0.20 * hash21(q * 4.0 + 47.0);\r
  n += 0.10 * hash21(q * 8.0 + 113.0);\r
  n += 0.05 * hash21(q * 16.0 + 191.0);\r
  return n;\r
}\r
\r
float edgeFade(vec2 frag, vec2 res, vec2 offset) {\r
  vec2 toC = frag - 0.5 * res - offset;\r
  float r = length(toC) / (0.5 * min(res.x, res.y) * uCenterFade);\r
  float x = clamp(r, 0.0, 1.0);\r
  float q = x * x * x * (x * (x * 6.0 - 15.0) + 10.0);\r
  float s = q * 0.5;\r
  s = pow(s, 1.5);\r
  float tail = 1.0 - pow(1.0 - s, 2.0);\r
  s = mix(s, tail, 0.2);\r
  float dn = (layeredNoise(frag * 0.15) - 0.5) * 0.0015 * s;\r
  return clamp(s + dn, 0.0, 1.0);\r
}\r
\r
vec2 rot2(vec2 v, float a) {\r
  float s = sin(a);\r
  float c = cos(a);\r
  return mat2(c, -s, s, c) * v;\r
}\r
\r
float bendAngle(vec3 q, float t) {\r
  return 0.8 * sin(q.x * 0.55 + t * 0.6) + 0.7 * sin(q.y * 0.50 - t * 0.5) + 0.6 * sin(q.z * 0.60 + t * 0.7);\r
}\r
\r
void main() {\r
  vec2 frag = gl_FragCoord.xy;\r
  float t = uPhase;\r
  float jitterAmp = 0.1 * clamp(uNoiseAmount, 0.0, 1.0);\r
  vec2 centered = 2.0 * (frag - uOffset) - uResolution;\r
  vec3 dir = normalize(vec3(centered, uResolution.y * max(uZoom, 1e-3)));\r
  float marchT = 0.0;\r
  vec3 col = vec3(0.0);\r
  float n = layeredNoise(frag);\r
  float amp = clamp(uDistort, 0.0, 50.0) * 0.15;\r
  float edge = 0.5 - 0.35 * (uRayWidth - 1.0);\r
  mat2 twist = mat2(1.0);\r
  if (uTwist != 0.0) {\r
    float a = uTwist * length(centered) / uResolution.y;\r
    float c = cos(a);\r
    float s = sin(a);\r
    twist = mat2(c, s, -s, c);\r
  }\r
\r
  for (int i = 0; i < 44; ++i) {\r
    vec3 P = marchT * dir;\r
    P.z -= 2.0;\r
    float rad = length(P);\r
    vec3 Pl = P * (10.0 / max(rad, 1e-6));\r
    if (uTwist != 0.0) Pl.xy = twist * Pl.xy;\r
    Pl = uOrient * Pl;\r
\r
    float stepLen = min(rad - 0.3, n * jitterAmp) + 0.1;\r
\r
    vec3 Pb = Pl;\r
    if (amp > 0.0) {\r
      float grow = smoothstep(0.35, 3.0, marchT);\r
      float a1 = amp * grow * bendAngle(Pl * 0.6, t);\r
      float a2 = 0.5 * amp * grow * bendAngle(Pl.zyx * 0.5 + 3.1, t * 0.9);\r
      Pb.xz = rot2(Pb.xz, a1);\r
      Pb.xy = rot2(Pb.xy, a2);\r
    }\r
\r
    float rayPattern = smoothstep(\r
      edge,\r
      edge + 0.2,\r
      sin(Pb.x + cos(Pb.y) * cos(Pb.z)) * sin(Pb.z + sin(Pb.y) * cos(Pb.x + t))\r
    );\r
\r
    if (uRayCount > 0) {\r
      float ang = atan(Pb.y, Pb.x);\r
      float comb = 0.5 + 0.5 * cos(float(uRayCount) * ang);\r
      comb = pow(comb, 3.0);\r
      rayPattern *= smoothstep(0.15, 0.95, comb);\r
    }\r
\r
    float depth = marchT - uFlow;\r
    vec3 spectral;\r
    if (uColorCount > 0) {\r
      float saw = fract(depth * 0.25);\r
      float tRay = saw * saw * (3.0 - 2.0 * saw);\r
      spectral = 2.0 * texture(uGradient, vec2(clamp(tRay, 0.0, 1.0), 0.5)).rgb;\r
    } else {\r
      spectral = 1.0 + cos(depth * 3.0 + vec3(0.0, 1.0, 2.0));\r
    }\r
\r
    col += (0.05 / (0.4 + stepLen)) * smoothstep(5.0, 0.0, rad) * spectral * rayPattern;\r
    marchT += stepLen;\r
  }\r
\r
  col *= edgeFade(frag, uResolution, uOffset);\r
  col *= uIntensity;\r
\r
  float unit = 0.5 * min(uResolution.x, uResolution.y);\r
  float radius = length(frag - 0.5 * uResolution - uOffset) / unit;\r
  float lift = 1.0;\r
  for (int k = 0; k < 4; k++) {\r
    vec4 pulse = uPulses[k];\r
    if (pulse.y <= 0.0) continue;\r
    float d = (radius - pulse.x) / pulse.z;\r
    lift += pulse.y * exp(-d * d) + pulse.w;\r
  }\r
  if (uPointer.z > 0.0) {\r
    vec2 m = (frag - uPointer.xy) / unit;\r
    lift += uPointer.z * exp(-dot(m, m) / max(uPointer.w * uPointer.w, 1e-4));\r
  }\r
  if (uIntro.z > 0.0) {\r
    vec2 toC = frag - 0.5 * uResolution - uOffset;\r
    float ang = atan(toC.y, toC.x);\r
    float streak = 0.5 + 0.22 * sin(ang * 5.0 + 1.3) + 0.16 * sin(ang * 13.0 + 4.1) + 0.12 * sin(ang * 29.0 + 2.2);\r
    float front = uIntro.x * (0.7 + 0.3 * streak);\r
    float d = (radius - front) / 0.2;\r
    lift += uIntro.y * exp(-d * d);\r
    lift *= smoothstep(front, front - 0.5, radius);\r
  }\r
\r
  outColor = vec4(col * lift * uEncode, 1.0);\r
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
uniform vec2 uSceneSize;\r
uniform sampler2D uBloom0;\r
uniform sampler2D uBloom1;\r
uniform sampler2D uBloom2;\r
uniform sampler2D uBloom3;\r
uniform vec2 uView;\r
uniform float uExact;\r
uniform float uDecode;\r
uniform float uBloom;\r
uniform float uFade;\r
uniform float uLightMode;\r
out vec4 outColor;\r
\r
vec3 tap(vec2 uv) {\r
  return textureLod(uScene, uv, 0.0).rgb;\r
}\r
\r
vec3 bicubic(vec2 uv) {\r
  vec2 position = uv * uSceneSize;\r
  vec2 center = floor(position - 0.5) + 0.5;\r
  vec2 f = position - center;\r
  vec2 w0 = f * (-0.5 + f * (1.0 - 0.5 * f));\r
  vec2 w1 = 1.0 + f * f * (-2.5 + 1.5 * f);\r
  vec2 w2 = f * (0.5 + f * (2.0 - 1.5 * f));\r
  vec2 w3 = f * f * (-0.5 + 0.5 * f);\r
  vec2 w12 = w1 + w2;\r
  vec2 t0 = (center - 1.0) / uSceneSize;\r
  vec2 t3 = (center + 2.0) / uSceneSize;\r
  vec2 t12 = (center + w2 / w12) / uSceneSize;\r
  vec3 result = tap(vec2(t0.x, t0.y)) * w0.x * w0.y;\r
  result += tap(vec2(t12.x, t0.y)) * w12.x * w0.y;\r
  result += tap(vec2(t3.x, t0.y)) * w3.x * w0.y;\r
  result += tap(vec2(t0.x, t12.y)) * w0.x * w12.y;\r
  result += tap(vec2(t12.x, t12.y)) * w12.x * w12.y;\r
  result += tap(vec2(t3.x, t12.y)) * w3.x * w12.y;\r
  result += tap(vec2(t0.x, t3.y)) * w0.x * w3.y;\r
  result += tap(vec2(t12.x, t3.y)) * w12.x * w3.y;\r
  result += tap(vec2(t3.x, t3.y)) * w3.x * w3.y;\r
  return max(result, 0.0);\r
}\r
\r
float smootherstep01(float t) {\r
  t = clamp(t, 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uView;\r
  vec3 col = uExact > 0.5 ? texelFetch(uScene, ivec2(gl_FragCoord.xy), 0).rgb : bicubic(uv);\r
  if (uBloom > 0.0) {\r
    vec3 halo = texture(uBloom0, uv).rgb * 0.42;\r
    halo += texture(uBloom1, uv).rgb * 0.3;\r
    halo += texture(uBloom2, uv).rgb * 0.18;\r
    halo += texture(uBloom3, uv).rgb * 0.1;\r
    col += halo * uBloom * (uLightMode > 0.5 ? 0.25 : 1.0);\r
  }\r
  col = clamp(col * uDecode, 0.0, 1.0);\r
\r
  float mask = 1.0;\r
  float edge = uFade * 0.5;\r
  if (edge > 0.0) {\r
    mask *= smootherstep01(uv.x / edge) * smootherstep01((1.0 - uv.x) / edge);\r
    mask *= smootherstep01(uv.y / edge) * smootherstep01((1.0 - uv.y) / edge);\r
  }\r
\r
  if (uLightMode > 0.5) {\r
    float energy = max(max(col.r, col.g), col.b);\r
    vec3 hue = col / max(energy, 0.0001);\r
    float neutral = min(hue.r, min(hue.g, hue.b));\r
    hue = max(hue - vec3(neutral * 0.68), vec3(0.0));\r
    hue /= max(max(hue.r, max(hue.g, hue.b)), 0.0001);\r
    vec3 pigment = mix(hue, hue * hue, 0.24) * 0.64;\r
    float coverage = smoothstep(0.001, 0.32, energy);\r
    coverage = pow(coverage, 0.72) * 0.92 * mask;\r
    outColor = vec4(pigment * coverage, coverage);\r
  } else {\r
    col *= mask;\r
    outColor = vec4(col, max(col.r, max(col.g, col.b)));\r
  }\r
}\`;\r
\r
const QUALITY = { low: 0.35, medium: 0.5, high: 0.7 };\r
const MIN_SCALE = 0.2;\r
const INTRO_SECONDS = 2.4;\r
const PULSE_LIFE = 1.5;\r
const ANIMATIONS = { rotate: 0, rotate3d: 1, hover: 2 };\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const toPx = value => {\r
  if (value == null) return 0;\r
  if (typeof value === 'number') return value;\r
  const parsed = parseFloat(String(value).trim().replace('px', ''));\r
  return Number.isNaN(parsed) ? 0 : parsed;\r
};\r
\r
const rotX = a => {\r
  const c = Math.cos(a);\r
  const s = Math.sin(a);\r
  return [1, 0, 0, 0, c, -s, 0, s, c];\r
};\r
\r
const rotY = a => {\r
  const c = Math.cos(a);\r
  const s = Math.sin(a);\r
  return [c, 0, s, 0, 1, 0, -s, 0, c];\r
};\r
\r
const rotZ = a => {\r
  const c = Math.cos(a);\r
  const s = Math.sin(a);\r
  return [c, -s, 0, s, c, 0, 0, 0, 1];\r
};\r
\r
const multiply = (a, b) => {\r
  const out = new Float32Array(9);\r
  for (let col = 0; col < 3; col++) {\r
    for (let row = 0; row < 3; row++) {\r
      out[col * 3 + row] = a[row] * b[col * 3] + a[3 + row] * b[col * 3 + 1] + a[6 + row] * b[col * 3 + 2];\r
    }\r
  }\r
  return out;\r
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
const PrismaticBurst = ({\r
  colors,\r
  intensity = 2,\r
  speed = 0.5,\r
  animationType = 'rotate3d',\r
  distort = 0,\r
  rayCount = 0,\r
  rayWidth = 1,\r
  zoom = 1,\r
  twist = 0,\r
  flow = 0,\r
  centerFade = 1,\r
  grain = 0.8,\r
  glow = 0,\r
  offset,\r
  mouseInteraction = true,\r
  mouseStrength = 0.5,\r
  hoverDampness = 0.25,\r
  clickBurst = true,\r
  intro = true,\r
  fade = 0,\r
  quality = 'high',\r
  resolution,\r
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
    colors: Array.isArray(colors) ? colors.slice(0, 64).map(String) : [],\r
    intensity: Math.max(0, intensity),\r
    speed,\r
    animation: ANIMATIONS[animationType] ?? ANIMATIONS.rotate3d,\r
    distort: Math.max(0, distort),\r
    rayCount: Math.max(0, Math.floor(rayCount ?? 0)),\r
    rayWidth: clamp(rayWidth, 0.2, 2.5),\r
    zoom: Math.max(0.05, zoom),\r
    twist,\r
    flow,\r
    centerFade: clamp(centerFade, 0.5, 3),\r
    grain: clamp(grain, 0.3, 1),\r
    glow: Math.max(0, glow),\r
    offsetX: toPx(offset?.x),\r
    offsetY: toPx(offset?.y),\r
    mouseInteraction,\r
    mouseStrength: Math.max(0, mouseStrength),\r
    hoverDampness: clamp(hoverDampness, 0, 1),\r
    clickBurst,\r
    intro,\r
    fade: clamp(fade, 0, 1),\r
    scale: clamp(resolution ?? QUALITY[quality] ?? QUALITY.high, MIN_SCALE, 1),\r
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
    const burstProgram = link(gl, BURST);\r
    const downProgram = link(gl, DOWNSAMPLE);\r
    const blurProgram = link(gl, BLUR);\r
    const compositeProgram = link(gl, COMPOSITE);\r
    if (!burstProgram || !downProgram || !blurProgram || !compositeProgram) return undefined;\r
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
    const gradient = gl.createTexture();\r
    let gradientKey = null;\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const toRgb = value => {\r
      if (!probe) return [255, 255, 255];\r
      probe.clearRect(0, 0, 1, 1);\r
      probe.fillStyle = '#ffffff';\r
      probe.fillStyle = value;\r
      probe.fillRect(0, 0, 1, 1);\r
      const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
      return [r, g, b];\r
    };\r
    const uploadGradient = list => {\r
      const key = list.join('|');\r
      if (key === gradientKey) return;\r
      gradientKey = key;\r
      const count = Math.max(1, list.length);\r
      const data = new Uint8Array(count * 4).fill(255);\r
      list.forEach((value, index) => data.set(toRgb(value), index * 4));\r
      gl.bindTexture(gl.TEXTURE_2D, gradient);\r
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, count, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    };\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const state = {\r
      time: 0,\r
      phase: 0,\r
      flow: 0,\r
      kick: 0,\r
      intro: settingsRef.current.intro && !reduce ? 0 : 1,\r
      hoverX: 0.5,\r
      hoverY: 0.5,\r
      smoothX: 0,\r
      smoothY: 0,\r
      touch: 0,\r
      governor: 1,\r
      slow: 0,\r
      quick: 0\r
    };\r
    const pulses = [];\r
    const pulseData = new Float32Array(MAX_PULSES * 4);\r
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
      const scale = Math.max(MIN_SCALE, s.scale * state.governor);\r
      const sceneWidth = Math.max(1, Math.round(width * scale));\r
      const sceneHeight = Math.max(1, Math.round(height * scale));\r
      const exact = sceneWidth === width && sceneHeight === height;\r
      gl.bindVertexArray(vao);\r
      allocate(scene, sceneWidth, sceneHeight);\r
      levels.forEach((pair, index) => {\r
        const levelWidth = Math.max(1, Math.round(cssWidth / 2 ** (index + 1)));\r
        const levelHeight = Math.max(1, Math.round(cssHeight / 2 ** (index + 1)));\r
        allocate(pair[0], levelWidth, levelHeight);\r
        allocate(pair[1], levelWidth, levelHeight);\r
      });\r
      uploadGradient(s.colors);\r
\r
      const toScene = sceneWidth / cssWidth;\r
      const engaged = s.mouseInteraction ? state.touch : 0;\r
      const nx = cssWidth > 0 ? (state.smoothX / cssWidth) * 2 - 1 : 0;\r
      const ny = cssHeight > 0 ? (state.smoothY / cssHeight) * 2 - 1 : 0;\r
      const parallax = 0.06 * s.mouseStrength * engaged * Math.min(sceneWidth, sceneHeight) * 0.5;\r
      const offsetX = s.offsetX * toScene + nx * parallax;\r
      const offsetY = s.offsetY * toScene - ny * parallax;\r
\r
      const t = state.phase;\r
      let orient;\r
      if (s.animation === 0) {\r
        const a = t * 0.2;\r
        const c0 = Math.cos(a);\r
        orient = [c0, 0, Math.cos(a + 11), 0, 1, 0, Math.cos(a + 33), 0, c0];\r
      } else if (s.animation === 1) {\r
        orient = multiply(multiply(rotZ(t * 0.17), rotY(t * 0.21)), rotX(t * 0.31));\r
      } else {\r
        const mx = state.hoverX * 2 - 1;\r
        const my = state.hoverY * 2 - 1;\r
        orient = multiply(rotY(mx * 0.6), rotX(my * 0.6));\r
      }\r
      if (s.animation !== 2 && engaged > 0) {\r
        const tilt = 0.3 * s.mouseStrength * engaged;\r
        orient = multiply(orient, multiply(rotY(nx * tilt), rotX(ny * tilt)));\r
      }\r
\r
      pulseData.fill(0);\r
      pulses.forEach((pulse, index) => {\r
        const life = pulse.age / PULSE_LIFE;\r
        pulseData.set(\r
          [pulse.age * 1.7, 1.6 * Math.pow(1 - life, 1.6), 0.2 + pulse.age * 0.16, 0.35 * Math.exp(-pulse.age * 7)],\r
          index * 4\r
        );\r
      });\r
\r
      const unit = 0.5 * Math.min(sceneWidth, sceneHeight);\r
      const reach =\r
        Math.hypot(sceneWidth * 0.5 + Math.abs(offsetX), sceneHeight * 0.5 + Math.abs(offsetY)) / Math.max(unit, 1);\r
      const rise = 1 - Math.pow(1 - state.intro, 3);\r
\r
      const b = pass(scene, burstProgram);\r
      bind(0, gradient);\r
      gl.uniform1i(b.uGradient, 0);\r
      gl.uniform2f(b.uResolution, sceneWidth, sceneHeight);\r
      gl.uniform1f(b.uTime, state.time);\r
      gl.uniform1f(b.uPhase, t);\r
      gl.uniform1f(b.uIntensity, s.intensity);\r
      gl.uniformMatrix3fv(b.uOrient, false, orient);\r
      gl.uniform1i(b.uColorCount, s.colors.length);\r
      gl.uniform1f(b.uDistort, s.distort);\r
      gl.uniform2f(b.uOffset, offsetX, offsetY);\r
      gl.uniform1f(b.uNoiseAmount, s.grain);\r
      gl.uniform1i(b.uRayCount, s.rayCount);\r
      gl.uniform1f(b.uZoom, s.zoom);\r
      gl.uniform1f(b.uRayWidth, s.rayWidth);\r
      gl.uniform1f(b.uTwist, s.twist);\r
      gl.uniform1f(b.uFlow, state.flow);\r
      gl.uniform1f(b.uCenterFade, s.centerFade * Math.max(1, s.zoom));\r
      gl.uniform4f(\r
        b.uPointer,\r
        state.smoothX * toScene,\r
        (cssHeight - state.smoothY) * toScene,\r
        s.mouseInteraction ? 0.7 * s.mouseStrength * engaged : 0,\r
        0.45\r
      );\r
      gl.uniform4fv(b.uPulses, pulseData);\r
      gl.uniform3f(b.uIntro, (rise * (reach + 0.6)) / 0.7, 1.6 * (1 - state.intro), state.intro < 1 ? 1 : 0);\r
      gl.uniform1f(b.uEncode, encode);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      if (s.glow > 0) {\r
        let source = scene;\r
        levels.forEach(([front, back]) => {\r
          const d = pass(front, downProgram);\r
          bind(0, source.texture);\r
          gl.uniform1i(d.uSource, 0);\r
          gl.uniform2f(d.uTarget, front.width, front.height);\r
          gl.uniform2f(d.uTexel, 1 / source.width, 1 / source.height);\r
          gl.uniform1f(d.uLimit, 3 * encode);\r
          gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
          let u = pass(back, blurProgram);\r
          bind(0, front.texture);\r
          gl.uniform1i(u.uSource, 0);\r
          gl.uniform2f(u.uTarget, back.width, back.height);\r
          gl.uniform2f(u.uStep, 1 / front.width, 0);\r
          gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
          u = pass(front, blurProgram);\r
          bind(0, back.texture);\r
          gl.uniform1i(u.uSource, 0);\r
          gl.uniform2f(u.uTarget, front.width, front.height);\r
          gl.uniform2f(u.uStep, 0, 1 / back.height);\r
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
      gl.uniform2f(c.uSceneSize, sceneWidth, sceneHeight);\r
      gl.uniform2f(c.uView, width, height);\r
      gl.uniform1f(c.uExact, exact ? 1 : 0);\r
      gl.uniform1f(c.uDecode, 1 / encode);\r
      gl.uniform1f(c.uBloom, s.glow);\r
      gl.uniform1f(c.uFade, s.fade);\r
      gl.uniform1f(c.uLightMode, s.lightMode ? 1 : 0);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      for (let unit = BLOOM_LEVELS; unit >= 0; unit--) bind(unit, null);\r
    };\r
\r
    const tune = interval => {\r
      if (interval > 1 / 40) {\r
        state.slow += 1;\r
        state.quick = 0;\r
      } else if (interval < 1 / 55) {\r
        state.quick += 1;\r
        state.slow = 0;\r
      }\r
      if (state.slow > 20) {\r
        state.governor = Math.max(0.5, state.governor * 0.85);\r
        state.slow = 0;\r
      } else if (state.quick > 180 && state.governor < 1) {\r
        state.governor = Math.min(1, state.governor * 1.1);\r
        state.quick = 0;\r
      }\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      if (last) tune((now - last) / 1000);\r
      last = now;\r
\r
      if (!s.intro || reduce) state.intro = 1;\r
      else if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / INTRO_SECONDS);\r
      const rush = 3 * Math.pow(1 - state.intro, 2);\r
      const running = !s.paused && !reduce;\r
      if (running) {\r
        state.time += dt;\r
        state.phase += dt * s.speed * (1 + rush) + state.kick * dt;\r
        state.flow += dt * s.flow * 1.2;\r
      }\r
      state.kick *= Math.exp(-dt * 3.5);\r
      if (state.kick < 1e-3) state.kick = 0;\r
\r
      const engaged = s.mouseInteraction && pointer.inside && !reduce;\r
      const tau = 0.02 + s.hoverDampness * 0.5;\r
      const follow = 1 - Math.exp(-dt / tau);\r
      if (engaged && state.touch < 0.01) {\r
        state.smoothX = pointer.x;\r
        state.smoothY = pointer.y;\r
      }\r
      state.smoothX += (pointer.x - state.smoothX) * follow;\r
      state.smoothY += (pointer.y - state.smoothY) * follow;\r
      state.touch += ((engaged ? 1 : 0) - state.touch) * (1 - Math.exp(-dt * (engaged ? 5 : 2.5)));\r
      if (s.animation === 2 && pointer.inside) {\r
        const width = Math.max(1, container.clientWidth);\r
        const height = Math.max(1, container.clientHeight);\r
        state.hoverX += (clamp(pointer.x / width, 0, 1) - state.hoverX) * follow;\r
        state.hoverY += (clamp(pointer.y / height, 0, 1) - state.hoverY) * follow;\r
      }\r
\r
      for (let i = pulses.length - 1; i >= 0; i--) {\r
        pulses[i].age += dt;\r
        if (pulses[i].age > PULSE_LIFE) pulses.splice(i, 1);\r
      }\r
\r
      render();\r
\r
      const settling =\r
        state.intro < 1 ||\r
        pulses.length > 0 ||\r
        state.kick > 0 ||\r
        Math.abs((engaged ? 1 : 0) - state.touch) > 0.002 ||\r
        Math.abs(pointer.x - state.smoothX) + Math.abs(pointer.y - state.smoothY) > 0.2;\r
      if ((running && (s.speed !== 0 || s.grain > 0 || s.flow !== 0)) || settling) raf = requestAnimationFrame(frame);\r
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
      const s = settingsRef.current;\r
      if (s.mouseInteraction && s.clickBurst && !reduce) {\r
        if (pulses.length >= MAX_PULSES) pulses.shift();\r
        pulses.push({ age: 0 });\r
        state.kick = Math.min(5, state.kick + 2.4);\r
      }\r
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
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
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
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      [scene, ...levels.flat()].forEach(target => {\r
        if (target.texture) gl.deleteTexture(target.texture);\r
        gl.deleteFramebuffer(target.framebuffer);\r
      });\r
      gl.deleteTexture(gradient);\r
      [burstProgram, downProgram, blurProgram, compositeProgram].forEach(item => gl.deleteProgram(item.program));\r
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
    <div ref={containerRef} className={\`relative w-full h-full overflow-hidden \${className}\`} style={style}>\r
      <canvas\r
        ref={canvasRef}\r
        className="absolute inset-0 block w-full h-full"\r
        style={mixBlendMode && mixBlendMode !== 'none' ? { mixBlendMode } : undefined}\r
        aria-hidden="true"\r
      />\r
    </div>\r
  );\r
};\r
\r
export default PrismaticBurst;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, useState, type CSSProperties } from 'react';\r
\r
import './PrismaticBurst.css';\r
\r
const BLOOM_LEVELS = 4;\r
const MAX_PULSES = 4;\r
\r
export interface PrismaticBurstProps {\r
  colors?: string[];\r
  intensity?: number;\r
  speed?: number;\r
  animationType?: 'rotate' | 'rotate3d' | 'hover';\r
  distort?: number;\r
  rayCount?: number;\r
  rayWidth?: number;\r
  zoom?: number;\r
  twist?: number;\r
  flow?: number;\r
  centerFade?: number;\r
  grain?: number;\r
  glow?: number;\r
  offset?: { x?: number | string; y?: number | string };\r
  mouseInteraction?: boolean;\r
  mouseStrength?: number;\r
  hoverDampness?: number;\r
  clickBurst?: boolean;\r
  intro?: boolean;\r
  fade?: number;\r
  quality?: 'low' | 'medium' | 'high';\r
  resolution?: number;\r
  lightMode?: boolean;\r
  mixBlendMode?: CSSProperties['mixBlendMode'] | 'none';\r
  paused?: boolean;\r
  dpr?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Settings {\r
  colors: string[];\r
  intensity: number;\r
  speed: number;\r
  animation: number;\r
  distort: number;\r
  rayCount: number;\r
  rayWidth: number;\r
  zoom: number;\r
  twist: number;\r
  flow: number;\r
  centerFade: number;\r
  grain: number;\r
  glow: number;\r
  offsetX: number;\r
  offsetY: number;\r
  mouseInteraction: boolean;\r
  mouseStrength: number;\r
  hoverDampness: number;\r
  clickBurst: boolean;\r
  intro: boolean;\r
  fade: number;\r
  scale: number;\r
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
const BURST = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
\r
uniform vec2 uResolution;\r
uniform float uTime;\r
uniform float uPhase;\r
uniform float uIntensity;\r
uniform mat3 uOrient;\r
uniform int uColorCount;\r
uniform float uDistort;\r
uniform vec2 uOffset;\r
uniform sampler2D uGradient;\r
uniform float uNoiseAmount;\r
uniform int uRayCount;\r
uniform float uZoom;\r
uniform float uRayWidth;\r
uniform float uTwist;\r
uniform float uFlow;\r
uniform float uCenterFade;\r
uniform vec4 uPointer;\r
uniform vec4 uPulses[4];\r
uniform vec3 uIntro;\r
uniform float uEncode;\r
out vec4 outColor;\r
\r
float hash21(vec2 p) {\r
  p = floor(p);\r
  float f = 52.9829189 * fract(dot(p, vec2(0.065, 0.005)));\r
  return fract(f);\r
}\r
\r
mat2 rot30() {\r
  return mat2(0.8, -0.5, 0.5, 0.8);\r
}\r
\r
float layeredNoise(vec2 fragPx) {\r
  vec2 p = mod(fragPx + vec2(uTime * 30.0, -uTime * 21.0), 1024.0);\r
  vec2 q = rot30() * p;\r
  float n = 0.0;\r
  n += 0.40 * hash21(q);\r
  n += 0.25 * hash21(q * 2.0 + 17.0);\r
  n += 0.20 * hash21(q * 4.0 + 47.0);\r
  n += 0.10 * hash21(q * 8.0 + 113.0);\r
  n += 0.05 * hash21(q * 16.0 + 191.0);\r
  return n;\r
}\r
\r
float edgeFade(vec2 frag, vec2 res, vec2 offset) {\r
  vec2 toC = frag - 0.5 * res - offset;\r
  float r = length(toC) / (0.5 * min(res.x, res.y) * uCenterFade);\r
  float x = clamp(r, 0.0, 1.0);\r
  float q = x * x * x * (x * (x * 6.0 - 15.0) + 10.0);\r
  float s = q * 0.5;\r
  s = pow(s, 1.5);\r
  float tail = 1.0 - pow(1.0 - s, 2.0);\r
  s = mix(s, tail, 0.2);\r
  float dn = (layeredNoise(frag * 0.15) - 0.5) * 0.0015 * s;\r
  return clamp(s + dn, 0.0, 1.0);\r
}\r
\r
vec2 rot2(vec2 v, float a) {\r
  float s = sin(a);\r
  float c = cos(a);\r
  return mat2(c, -s, s, c) * v;\r
}\r
\r
float bendAngle(vec3 q, float t) {\r
  return 0.8 * sin(q.x * 0.55 + t * 0.6) + 0.7 * sin(q.y * 0.50 - t * 0.5) + 0.6 * sin(q.z * 0.60 + t * 0.7);\r
}\r
\r
void main() {\r
  vec2 frag = gl_FragCoord.xy;\r
  float t = uPhase;\r
  float jitterAmp = 0.1 * clamp(uNoiseAmount, 0.0, 1.0);\r
  vec2 centered = 2.0 * (frag - uOffset) - uResolution;\r
  vec3 dir = normalize(vec3(centered, uResolution.y * max(uZoom, 1e-3)));\r
  float marchT = 0.0;\r
  vec3 col = vec3(0.0);\r
  float n = layeredNoise(frag);\r
  float amp = clamp(uDistort, 0.0, 50.0) * 0.15;\r
  float edge = 0.5 - 0.35 * (uRayWidth - 1.0);\r
  mat2 twist = mat2(1.0);\r
  if (uTwist != 0.0) {\r
    float a = uTwist * length(centered) / uResolution.y;\r
    float c = cos(a);\r
    float s = sin(a);\r
    twist = mat2(c, s, -s, c);\r
  }\r
\r
  for (int i = 0; i < 44; ++i) {\r
    vec3 P = marchT * dir;\r
    P.z -= 2.0;\r
    float rad = length(P);\r
    vec3 Pl = P * (10.0 / max(rad, 1e-6));\r
    if (uTwist != 0.0) Pl.xy = twist * Pl.xy;\r
    Pl = uOrient * Pl;\r
\r
    float stepLen = min(rad - 0.3, n * jitterAmp) + 0.1;\r
\r
    vec3 Pb = Pl;\r
    if (amp > 0.0) {\r
      float grow = smoothstep(0.35, 3.0, marchT);\r
      float a1 = amp * grow * bendAngle(Pl * 0.6, t);\r
      float a2 = 0.5 * amp * grow * bendAngle(Pl.zyx * 0.5 + 3.1, t * 0.9);\r
      Pb.xz = rot2(Pb.xz, a1);\r
      Pb.xy = rot2(Pb.xy, a2);\r
    }\r
\r
    float rayPattern = smoothstep(\r
      edge,\r
      edge + 0.2,\r
      sin(Pb.x + cos(Pb.y) * cos(Pb.z)) * sin(Pb.z + sin(Pb.y) * cos(Pb.x + t))\r
    );\r
\r
    if (uRayCount > 0) {\r
      float ang = atan(Pb.y, Pb.x);\r
      float comb = 0.5 + 0.5 * cos(float(uRayCount) * ang);\r
      comb = pow(comb, 3.0);\r
      rayPattern *= smoothstep(0.15, 0.95, comb);\r
    }\r
\r
    float depth = marchT - uFlow;\r
    vec3 spectral;\r
    if (uColorCount > 0) {\r
      float saw = fract(depth * 0.25);\r
      float tRay = saw * saw * (3.0 - 2.0 * saw);\r
      spectral = 2.0 * texture(uGradient, vec2(clamp(tRay, 0.0, 1.0), 0.5)).rgb;\r
    } else {\r
      spectral = 1.0 + cos(depth * 3.0 + vec3(0.0, 1.0, 2.0));\r
    }\r
\r
    col += (0.05 / (0.4 + stepLen)) * smoothstep(5.0, 0.0, rad) * spectral * rayPattern;\r
    marchT += stepLen;\r
  }\r
\r
  col *= edgeFade(frag, uResolution, uOffset);\r
  col *= uIntensity;\r
\r
  float unit = 0.5 * min(uResolution.x, uResolution.y);\r
  float radius = length(frag - 0.5 * uResolution - uOffset) / unit;\r
  float lift = 1.0;\r
  for (int k = 0; k < 4; k++) {\r
    vec4 pulse = uPulses[k];\r
    if (pulse.y <= 0.0) continue;\r
    float d = (radius - pulse.x) / pulse.z;\r
    lift += pulse.y * exp(-d * d) + pulse.w;\r
  }\r
  if (uPointer.z > 0.0) {\r
    vec2 m = (frag - uPointer.xy) / unit;\r
    lift += uPointer.z * exp(-dot(m, m) / max(uPointer.w * uPointer.w, 1e-4));\r
  }\r
  if (uIntro.z > 0.0) {\r
    vec2 toC = frag - 0.5 * uResolution - uOffset;\r
    float ang = atan(toC.y, toC.x);\r
    float streak = 0.5 + 0.22 * sin(ang * 5.0 + 1.3) + 0.16 * sin(ang * 13.0 + 4.1) + 0.12 * sin(ang * 29.0 + 2.2);\r
    float front = uIntro.x * (0.7 + 0.3 * streak);\r
    float d = (radius - front) / 0.2;\r
    lift += uIntro.y * exp(-d * d);\r
    lift *= smoothstep(front, front - 0.5, radius);\r
  }\r
\r
  outColor = vec4(col * lift * uEncode, 1.0);\r
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
uniform vec2 uSceneSize;\r
uniform sampler2D uBloom0;\r
uniform sampler2D uBloom1;\r
uniform sampler2D uBloom2;\r
uniform sampler2D uBloom3;\r
uniform vec2 uView;\r
uniform float uExact;\r
uniform float uDecode;\r
uniform float uBloom;\r
uniform float uFade;\r
uniform float uLightMode;\r
out vec4 outColor;\r
\r
vec3 tap(vec2 uv) {\r
  return textureLod(uScene, uv, 0.0).rgb;\r
}\r
\r
vec3 bicubic(vec2 uv) {\r
  vec2 position = uv * uSceneSize;\r
  vec2 center = floor(position - 0.5) + 0.5;\r
  vec2 f = position - center;\r
  vec2 w0 = f * (-0.5 + f * (1.0 - 0.5 * f));\r
  vec2 w1 = 1.0 + f * f * (-2.5 + 1.5 * f);\r
  vec2 w2 = f * (0.5 + f * (2.0 - 1.5 * f));\r
  vec2 w3 = f * f * (-0.5 + 0.5 * f);\r
  vec2 w12 = w1 + w2;\r
  vec2 t0 = (center - 1.0) / uSceneSize;\r
  vec2 t3 = (center + 2.0) / uSceneSize;\r
  vec2 t12 = (center + w2 / w12) / uSceneSize;\r
  vec3 result = tap(vec2(t0.x, t0.y)) * w0.x * w0.y;\r
  result += tap(vec2(t12.x, t0.y)) * w12.x * w0.y;\r
  result += tap(vec2(t3.x, t0.y)) * w3.x * w0.y;\r
  result += tap(vec2(t0.x, t12.y)) * w0.x * w12.y;\r
  result += tap(vec2(t12.x, t12.y)) * w12.x * w12.y;\r
  result += tap(vec2(t3.x, t12.y)) * w3.x * w12.y;\r
  result += tap(vec2(t0.x, t3.y)) * w0.x * w3.y;\r
  result += tap(vec2(t12.x, t3.y)) * w12.x * w3.y;\r
  result += tap(vec2(t3.x, t3.y)) * w3.x * w3.y;\r
  return max(result, 0.0);\r
}\r
\r
float smootherstep01(float t) {\r
  t = clamp(t, 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uView;\r
  vec3 col = uExact > 0.5 ? texelFetch(uScene, ivec2(gl_FragCoord.xy), 0).rgb : bicubic(uv);\r
  if (uBloom > 0.0) {\r
    vec3 halo = texture(uBloom0, uv).rgb * 0.42;\r
    halo += texture(uBloom1, uv).rgb * 0.3;\r
    halo += texture(uBloom2, uv).rgb * 0.18;\r
    halo += texture(uBloom3, uv).rgb * 0.1;\r
    col += halo * uBloom * (uLightMode > 0.5 ? 0.25 : 1.0);\r
  }\r
  col = clamp(col * uDecode, 0.0, 1.0);\r
\r
  float mask = 1.0;\r
  float edge = uFade * 0.5;\r
  if (edge > 0.0) {\r
    mask *= smootherstep01(uv.x / edge) * smootherstep01((1.0 - uv.x) / edge);\r
    mask *= smootherstep01(uv.y / edge) * smootherstep01((1.0 - uv.y) / edge);\r
  }\r
\r
  if (uLightMode > 0.5) {\r
    float energy = max(max(col.r, col.g), col.b);\r
    vec3 hue = col / max(energy, 0.0001);\r
    float neutral = min(hue.r, min(hue.g, hue.b));\r
    hue = max(hue - vec3(neutral * 0.68), vec3(0.0));\r
    hue /= max(max(hue.r, max(hue.g, hue.b)), 0.0001);\r
    vec3 pigment = mix(hue, hue * hue, 0.24) * 0.64;\r
    float coverage = smoothstep(0.001, 0.32, energy);\r
    coverage = pow(coverage, 0.72) * 0.92 * mask;\r
    outColor = vec4(pigment * coverage, coverage);\r
  } else {\r
    col *= mask;\r
    outColor = vec4(col, max(col.r, max(col.g, col.b)));\r
  }\r
}\`;\r
\r
const QUALITY: Record<string, number> = { low: 0.35, medium: 0.5, high: 0.7 };\r
const MIN_SCALE = 0.2;\r
const INTRO_SECONDS = 2.4;\r
const PULSE_LIFE = 1.5;\r
const ANIMATIONS: Record<string, number> = { rotate: 0, rotate3d: 1, hover: 2 };\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const toPx = (value?: number | string | null): number => {\r
  if (value == null) return 0;\r
  if (typeof value === 'number') return value;\r
  const parsed = parseFloat(String(value).trim().replace('px', ''));\r
  return Number.isNaN(parsed) ? 0 : parsed;\r
};\r
\r
const rotX = (a: number): number[] => {\r
  const c = Math.cos(a);\r
  const s = Math.sin(a);\r
  return [1, 0, 0, 0, c, -s, 0, s, c];\r
};\r
\r
const rotY = (a: number): number[] => {\r
  const c = Math.cos(a);\r
  const s = Math.sin(a);\r
  return [c, 0, s, 0, 1, 0, -s, 0, c];\r
};\r
\r
const rotZ = (a: number): number[] => {\r
  const c = Math.cos(a);\r
  const s = Math.sin(a);\r
  return [c, -s, 0, s, c, 0, 0, 0, 1];\r
};\r
\r
const multiply = (a: ArrayLike<number>, b: ArrayLike<number>): Float32Array => {\r
  const out = new Float32Array(9);\r
  for (let col = 0; col < 3; col++) {\r
    for (let row = 0; row < 3; row++) {\r
      out[col * 3 + row] = a[row] * b[col * 3] + a[3 + row] * b[col * 3 + 1] + a[6 + row] * b[col * 3 + 2];\r
    }\r
  }\r
  return out;\r
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
const PrismaticBurst = ({\r
  colors,\r
  intensity = 2,\r
  speed = 0.5,\r
  animationType = 'rotate3d',\r
  distort = 0,\r
  rayCount = 0,\r
  rayWidth = 1,\r
  zoom = 1,\r
  twist = 0,\r
  flow = 0,\r
  centerFade = 1,\r
  grain = 0.8,\r
  glow = 0,\r
  offset,\r
  mouseInteraction = true,\r
  mouseStrength = 0.5,\r
  hoverDampness = 0.25,\r
  clickBurst = true,\r
  intro = true,\r
  fade = 0,\r
  quality = 'high',\r
  resolution,\r
  lightMode = false,\r
  mixBlendMode,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  style\r
}: PrismaticBurstProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settingsRef = useRef<Settings>(null as unknown as Settings);\r
  const [generation, setGeneration] = useState(0);\r
  settingsRef.current = {\r
    colors: Array.isArray(colors) ? colors.slice(0, 64).map(String) : [],\r
    intensity: Math.max(0, intensity),\r
    speed,\r
    animation: ANIMATIONS[animationType] ?? ANIMATIONS.rotate3d,\r
    distort: Math.max(0, distort),\r
    rayCount: Math.max(0, Math.floor(rayCount ?? 0)),\r
    rayWidth: clamp(rayWidth, 0.2, 2.5),\r
    zoom: Math.max(0.05, zoom),\r
    twist,\r
    flow,\r
    centerFade: clamp(centerFade, 0.5, 3),\r
    grain: clamp(grain, 0.3, 1),\r
    glow: Math.max(0, glow),\r
    offsetX: toPx(offset?.x),\r
    offsetY: toPx(offset?.y),\r
    mouseInteraction,\r
    mouseStrength: Math.max(0, mouseStrength),\r
    hoverDampness: clamp(hoverDampness, 0, 1),\r
    clickBurst,\r
    intro,\r
    fade: clamp(fade, 0, 1),\r
    scale: clamp(resolution ?? QUALITY[quality] ?? QUALITY.high, MIN_SCALE, 1),\r
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
    const burstProgram = link(gl, BURST);\r
    const downProgram = link(gl, DOWNSAMPLE);\r
    const blurProgram = link(gl, BLUR);\r
    const compositeProgram = link(gl, COMPOSITE);\r
    if (!burstProgram || !downProgram || !blurProgram || !compositeProgram) return undefined;\r
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
    const gradient = gl.createTexture();\r
    let gradientKey: string | null = null;\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const toRgb = (value: string): number[] => {\r
      if (!probe) return [255, 255, 255];\r
      probe.clearRect(0, 0, 1, 1);\r
      probe.fillStyle = '#ffffff';\r
      probe.fillStyle = value;\r
      probe.fillRect(0, 0, 1, 1);\r
      const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
      return [r, g, b];\r
    };\r
    const uploadGradient = (list: string[]) => {\r
      const key = list.join('|');\r
      if (key === gradientKey) return;\r
      gradientKey = key;\r
      const count = Math.max(1, list.length);\r
      const data = new Uint8Array(count * 4).fill(255);\r
      list.forEach((value, index) => data.set(toRgb(value), index * 4));\r
      gl.bindTexture(gl.TEXTURE_2D, gradient);\r
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, count, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    };\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const state = {\r
      time: 0,\r
      phase: 0,\r
      flow: 0,\r
      kick: 0,\r
      intro: settingsRef.current.intro && !reduce ? 0 : 1,\r
      hoverX: 0.5,\r
      hoverY: 0.5,\r
      smoothX: 0,\r
      smoothY: 0,\r
      touch: 0,\r
      governor: 1,\r
      slow: 0,\r
      quick: 0\r
    };\r
    const pulses: { age: number }[] = [];\r
    const pulseData = new Float32Array(MAX_PULSES * 4);\r
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
      const scale = Math.max(MIN_SCALE, s.scale * state.governor);\r
      const sceneWidth = Math.max(1, Math.round(width * scale));\r
      const sceneHeight = Math.max(1, Math.round(height * scale));\r
      const exact = sceneWidth === width && sceneHeight === height;\r
      gl.bindVertexArray(vao);\r
      allocate(scene, sceneWidth, sceneHeight);\r
      levels.forEach((pair, index) => {\r
        const levelWidth = Math.max(1, Math.round(cssWidth / 2 ** (index + 1)));\r
        const levelHeight = Math.max(1, Math.round(cssHeight / 2 ** (index + 1)));\r
        allocate(pair[0], levelWidth, levelHeight);\r
        allocate(pair[1], levelWidth, levelHeight);\r
      });\r
      uploadGradient(s.colors);\r
\r
      const toScene = sceneWidth / cssWidth;\r
      const engaged = s.mouseInteraction ? state.touch : 0;\r
      const nx = cssWidth > 0 ? (state.smoothX / cssWidth) * 2 - 1 : 0;\r
      const ny = cssHeight > 0 ? (state.smoothY / cssHeight) * 2 - 1 : 0;\r
      const parallax = 0.06 * s.mouseStrength * engaged * Math.min(sceneWidth, sceneHeight) * 0.5;\r
      const offsetX = s.offsetX * toScene + nx * parallax;\r
      const offsetY = s.offsetY * toScene - ny * parallax;\r
\r
      const t = state.phase;\r
      let orient: Float32Array | number[];\r
      if (s.animation === 0) {\r
        const a = t * 0.2;\r
        const c0 = Math.cos(a);\r
        orient = [c0, 0, Math.cos(a + 11), 0, 1, 0, Math.cos(a + 33), 0, c0];\r
      } else if (s.animation === 1) {\r
        orient = multiply(multiply(rotZ(t * 0.17), rotY(t * 0.21)), rotX(t * 0.31));\r
      } else {\r
        const mx = state.hoverX * 2 - 1;\r
        const my = state.hoverY * 2 - 1;\r
        orient = multiply(rotY(mx * 0.6), rotX(my * 0.6));\r
      }\r
      if (s.animation !== 2 && engaged > 0) {\r
        const tilt = 0.3 * s.mouseStrength * engaged;\r
        orient = multiply(orient, multiply(rotY(nx * tilt), rotX(ny * tilt)));\r
      }\r
\r
      pulseData.fill(0);\r
      pulses.forEach((pulse, index) => {\r
        const life = pulse.age / PULSE_LIFE;\r
        pulseData.set(\r
          [pulse.age * 1.7, 1.6 * Math.pow(1 - life, 1.6), 0.2 + pulse.age * 0.16, 0.35 * Math.exp(-pulse.age * 7)],\r
          index * 4\r
        );\r
      });\r
\r
      const unit = 0.5 * Math.min(sceneWidth, sceneHeight);\r
      const reach =\r
        Math.hypot(sceneWidth * 0.5 + Math.abs(offsetX), sceneHeight * 0.5 + Math.abs(offsetY)) / Math.max(unit, 1);\r
      const rise = 1 - Math.pow(1 - state.intro, 3);\r
\r
      const b = pass(scene, burstProgram);\r
      bind(0, gradient);\r
      gl.uniform1i(b.uGradient, 0);\r
      gl.uniform2f(b.uResolution, sceneWidth, sceneHeight);\r
      gl.uniform1f(b.uTime, state.time);\r
      gl.uniform1f(b.uPhase, t);\r
      gl.uniform1f(b.uIntensity, s.intensity);\r
      gl.uniformMatrix3fv(b.uOrient, false, orient);\r
      gl.uniform1i(b.uColorCount, s.colors.length);\r
      gl.uniform1f(b.uDistort, s.distort);\r
      gl.uniform2f(b.uOffset, offsetX, offsetY);\r
      gl.uniform1f(b.uNoiseAmount, s.grain);\r
      gl.uniform1i(b.uRayCount, s.rayCount);\r
      gl.uniform1f(b.uZoom, s.zoom);\r
      gl.uniform1f(b.uRayWidth, s.rayWidth);\r
      gl.uniform1f(b.uTwist, s.twist);\r
      gl.uniform1f(b.uFlow, state.flow);\r
      gl.uniform1f(b.uCenterFade, s.centerFade * Math.max(1, s.zoom));\r
      gl.uniform4f(\r
        b.uPointer,\r
        state.smoothX * toScene,\r
        (cssHeight - state.smoothY) * toScene,\r
        s.mouseInteraction ? 0.7 * s.mouseStrength * engaged : 0,\r
        0.45\r
      );\r
      gl.uniform4fv(b.uPulses, pulseData);\r
      gl.uniform3f(b.uIntro, (rise * (reach + 0.6)) / 0.7, 1.6 * (1 - state.intro), state.intro < 1 ? 1 : 0);\r
      gl.uniform1f(b.uEncode, encode);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      if (s.glow > 0) {\r
        let source = scene;\r
        levels.forEach(([front, back]) => {\r
          const d = pass(front, downProgram);\r
          bind(0, source.texture);\r
          gl.uniform1i(d.uSource, 0);\r
          gl.uniform2f(d.uTarget, front.width, front.height);\r
          gl.uniform2f(d.uTexel, 1 / source.width, 1 / source.height);\r
          gl.uniform1f(d.uLimit, 3 * encode);\r
          gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
          let u = pass(back, blurProgram);\r
          bind(0, front.texture);\r
          gl.uniform1i(u.uSource, 0);\r
          gl.uniform2f(u.uTarget, back.width, back.height);\r
          gl.uniform2f(u.uStep, 1 / front.width, 0);\r
          gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
          u = pass(front, blurProgram);\r
          bind(0, back.texture);\r
          gl.uniform1i(u.uSource, 0);\r
          gl.uniform2f(u.uTarget, front.width, front.height);\r
          gl.uniform2f(u.uStep, 0, 1 / back.height);\r
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
      gl.uniform2f(c.uSceneSize, sceneWidth, sceneHeight);\r
      gl.uniform2f(c.uView, width, height);\r
      gl.uniform1f(c.uExact, exact ? 1 : 0);\r
      gl.uniform1f(c.uDecode, 1 / encode);\r
      gl.uniform1f(c.uBloom, s.glow);\r
      gl.uniform1f(c.uFade, s.fade);\r
      gl.uniform1f(c.uLightMode, s.lightMode ? 1 : 0);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      for (let unit = BLOOM_LEVELS; unit >= 0; unit--) bind(unit, null);\r
    };\r
\r
    const tune = (interval: number) => {\r
      if (interval > 1 / 40) {\r
        state.slow += 1;\r
        state.quick = 0;\r
      } else if (interval < 1 / 55) {\r
        state.quick += 1;\r
        state.slow = 0;\r
      }\r
      if (state.slow > 20) {\r
        state.governor = Math.max(0.5, state.governor * 0.85);\r
        state.slow = 0;\r
      } else if (state.quick > 180 && state.governor < 1) {\r
        state.governor = Math.min(1, state.governor * 1.1);\r
        state.quick = 0;\r
      }\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      if (last) tune((now - last) / 1000);\r
      last = now;\r
\r
      if (!s.intro || reduce) state.intro = 1;\r
      else if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / INTRO_SECONDS);\r
      const rush = 3 * Math.pow(1 - state.intro, 2);\r
      const running = !s.paused && !reduce;\r
      if (running) {\r
        state.time += dt;\r
        state.phase += dt * s.speed * (1 + rush) + state.kick * dt;\r
        state.flow += dt * s.flow * 1.2;\r
      }\r
      state.kick *= Math.exp(-dt * 3.5);\r
      if (state.kick < 1e-3) state.kick = 0;\r
\r
      const engaged = s.mouseInteraction && pointer.inside && !reduce;\r
      const tau = 0.02 + s.hoverDampness * 0.5;\r
      const follow = 1 - Math.exp(-dt / tau);\r
      if (engaged && state.touch < 0.01) {\r
        state.smoothX = pointer.x;\r
        state.smoothY = pointer.y;\r
      }\r
      state.smoothX += (pointer.x - state.smoothX) * follow;\r
      state.smoothY += (pointer.y - state.smoothY) * follow;\r
      state.touch += ((engaged ? 1 : 0) - state.touch) * (1 - Math.exp(-dt * (engaged ? 5 : 2.5)));\r
      if (s.animation === 2 && pointer.inside) {\r
        const width = Math.max(1, container.clientWidth);\r
        const height = Math.max(1, container.clientHeight);\r
        state.hoverX += (clamp(pointer.x / width, 0, 1) - state.hoverX) * follow;\r
        state.hoverY += (clamp(pointer.y / height, 0, 1) - state.hoverY) * follow;\r
      }\r
\r
      for (let i = pulses.length - 1; i >= 0; i--) {\r
        pulses[i].age += dt;\r
        if (pulses[i].age > PULSE_LIFE) pulses.splice(i, 1);\r
      }\r
\r
      render();\r
\r
      const settling =\r
        state.intro < 1 ||\r
        pulses.length > 0 ||\r
        state.kick > 0 ||\r
        Math.abs((engaged ? 1 : 0) - state.touch) > 0.002 ||\r
        Math.abs(pointer.x - state.smoothX) + Math.abs(pointer.y - state.smoothY) > 0.2;\r
      if ((running && (s.speed !== 0 || s.grain > 0 || s.flow !== 0)) || settling) raf = requestAnimationFrame(frame);\r
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
      const s = settingsRef.current;\r
      if (s.mouseInteraction && s.clickBurst && !reduce) {\r
        if (pulses.length >= MAX_PULSES) pulses.shift();\r
        pulses.push({ age: 0 });\r
        state.kick = Math.min(5, state.kick + 2.4);\r
      }\r
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
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
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
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      [scene, ...levels.flat()].forEach(target => {\r
        if (target.texture) gl.deleteTexture(target.texture);\r
        gl.deleteFramebuffer(target.framebuffer);\r
      });\r
      gl.deleteTexture(gradient);\r
      [burstProgram, downProgram, blurProgram, compositeProgram].forEach(item => gl.deleteProgram(item.program));\r
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
    <div ref={containerRef} className={\`prismatic-burst-container\${className ? \` \${className}\` : ''}\`} style={style}>\r
      <canvas\r
        ref={canvasRef}\r
        className="prismatic-burst-canvas"\r
        style={mixBlendMode && mixBlendMode !== 'none' ? { mixBlendMode } : undefined}\r
        aria-hidden="true"\r
      />\r
    </div>\r
  );\r
};\r
\r
export default PrismaticBurst;\r
`,o=`'use client';\r
\r
import { useEffect, useRef, useState, type CSSProperties } from 'react';\r
\r
const BLOOM_LEVELS = 4;\r
const MAX_PULSES = 4;\r
\r
export interface PrismaticBurstProps {\r
  colors?: string[];\r
  intensity?: number;\r
  speed?: number;\r
  animationType?: 'rotate' | 'rotate3d' | 'hover';\r
  distort?: number;\r
  rayCount?: number;\r
  rayWidth?: number;\r
  zoom?: number;\r
  twist?: number;\r
  flow?: number;\r
  centerFade?: number;\r
  grain?: number;\r
  glow?: number;\r
  offset?: { x?: number | string; y?: number | string };\r
  mouseInteraction?: boolean;\r
  mouseStrength?: number;\r
  hoverDampness?: number;\r
  clickBurst?: boolean;\r
  intro?: boolean;\r
  fade?: number;\r
  quality?: 'low' | 'medium' | 'high';\r
  resolution?: number;\r
  lightMode?: boolean;\r
  mixBlendMode?: CSSProperties['mixBlendMode'] | 'none';\r
  paused?: boolean;\r
  dpr?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Settings {\r
  colors: string[];\r
  intensity: number;\r
  speed: number;\r
  animation: number;\r
  distort: number;\r
  rayCount: number;\r
  rayWidth: number;\r
  zoom: number;\r
  twist: number;\r
  flow: number;\r
  centerFade: number;\r
  grain: number;\r
  glow: number;\r
  offsetX: number;\r
  offsetY: number;\r
  mouseInteraction: boolean;\r
  mouseStrength: number;\r
  hoverDampness: number;\r
  clickBurst: boolean;\r
  intro: boolean;\r
  fade: number;\r
  scale: number;\r
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
const BURST = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
\r
uniform vec2 uResolution;\r
uniform float uTime;\r
uniform float uPhase;\r
uniform float uIntensity;\r
uniform mat3 uOrient;\r
uniform int uColorCount;\r
uniform float uDistort;\r
uniform vec2 uOffset;\r
uniform sampler2D uGradient;\r
uniform float uNoiseAmount;\r
uniform int uRayCount;\r
uniform float uZoom;\r
uniform float uRayWidth;\r
uniform float uTwist;\r
uniform float uFlow;\r
uniform float uCenterFade;\r
uniform vec4 uPointer;\r
uniform vec4 uPulses[4];\r
uniform vec3 uIntro;\r
uniform float uEncode;\r
out vec4 outColor;\r
\r
float hash21(vec2 p) {\r
  p = floor(p);\r
  float f = 52.9829189 * fract(dot(p, vec2(0.065, 0.005)));\r
  return fract(f);\r
}\r
\r
mat2 rot30() {\r
  return mat2(0.8, -0.5, 0.5, 0.8);\r
}\r
\r
float layeredNoise(vec2 fragPx) {\r
  vec2 p = mod(fragPx + vec2(uTime * 30.0, -uTime * 21.0), 1024.0);\r
  vec2 q = rot30() * p;\r
  float n = 0.0;\r
  n += 0.40 * hash21(q);\r
  n += 0.25 * hash21(q * 2.0 + 17.0);\r
  n += 0.20 * hash21(q * 4.0 + 47.0);\r
  n += 0.10 * hash21(q * 8.0 + 113.0);\r
  n += 0.05 * hash21(q * 16.0 + 191.0);\r
  return n;\r
}\r
\r
float edgeFade(vec2 frag, vec2 res, vec2 offset) {\r
  vec2 toC = frag - 0.5 * res - offset;\r
  float r = length(toC) / (0.5 * min(res.x, res.y) * uCenterFade);\r
  float x = clamp(r, 0.0, 1.0);\r
  float q = x * x * x * (x * (x * 6.0 - 15.0) + 10.0);\r
  float s = q * 0.5;\r
  s = pow(s, 1.5);\r
  float tail = 1.0 - pow(1.0 - s, 2.0);\r
  s = mix(s, tail, 0.2);\r
  float dn = (layeredNoise(frag * 0.15) - 0.5) * 0.0015 * s;\r
  return clamp(s + dn, 0.0, 1.0);\r
}\r
\r
vec2 rot2(vec2 v, float a) {\r
  float s = sin(a);\r
  float c = cos(a);\r
  return mat2(c, -s, s, c) * v;\r
}\r
\r
float bendAngle(vec3 q, float t) {\r
  return 0.8 * sin(q.x * 0.55 + t * 0.6) + 0.7 * sin(q.y * 0.50 - t * 0.5) + 0.6 * sin(q.z * 0.60 + t * 0.7);\r
}\r
\r
void main() {\r
  vec2 frag = gl_FragCoord.xy;\r
  float t = uPhase;\r
  float jitterAmp = 0.1 * clamp(uNoiseAmount, 0.0, 1.0);\r
  vec2 centered = 2.0 * (frag - uOffset) - uResolution;\r
  vec3 dir = normalize(vec3(centered, uResolution.y * max(uZoom, 1e-3)));\r
  float marchT = 0.0;\r
  vec3 col = vec3(0.0);\r
  float n = layeredNoise(frag);\r
  float amp = clamp(uDistort, 0.0, 50.0) * 0.15;\r
  float edge = 0.5 - 0.35 * (uRayWidth - 1.0);\r
  mat2 twist = mat2(1.0);\r
  if (uTwist != 0.0) {\r
    float a = uTwist * length(centered) / uResolution.y;\r
    float c = cos(a);\r
    float s = sin(a);\r
    twist = mat2(c, s, -s, c);\r
  }\r
\r
  for (int i = 0; i < 44; ++i) {\r
    vec3 P = marchT * dir;\r
    P.z -= 2.0;\r
    float rad = length(P);\r
    vec3 Pl = P * (10.0 / max(rad, 1e-6));\r
    if (uTwist != 0.0) Pl.xy = twist * Pl.xy;\r
    Pl = uOrient * Pl;\r
\r
    float stepLen = min(rad - 0.3, n * jitterAmp) + 0.1;\r
\r
    vec3 Pb = Pl;\r
    if (amp > 0.0) {\r
      float grow = smoothstep(0.35, 3.0, marchT);\r
      float a1 = amp * grow * bendAngle(Pl * 0.6, t);\r
      float a2 = 0.5 * amp * grow * bendAngle(Pl.zyx * 0.5 + 3.1, t * 0.9);\r
      Pb.xz = rot2(Pb.xz, a1);\r
      Pb.xy = rot2(Pb.xy, a2);\r
    }\r
\r
    float rayPattern = smoothstep(\r
      edge,\r
      edge + 0.2,\r
      sin(Pb.x + cos(Pb.y) * cos(Pb.z)) * sin(Pb.z + sin(Pb.y) * cos(Pb.x + t))\r
    );\r
\r
    if (uRayCount > 0) {\r
      float ang = atan(Pb.y, Pb.x);\r
      float comb = 0.5 + 0.5 * cos(float(uRayCount) * ang);\r
      comb = pow(comb, 3.0);\r
      rayPattern *= smoothstep(0.15, 0.95, comb);\r
    }\r
\r
    float depth = marchT - uFlow;\r
    vec3 spectral;\r
    if (uColorCount > 0) {\r
      float saw = fract(depth * 0.25);\r
      float tRay = saw * saw * (3.0 - 2.0 * saw);\r
      spectral = 2.0 * texture(uGradient, vec2(clamp(tRay, 0.0, 1.0), 0.5)).rgb;\r
    } else {\r
      spectral = 1.0 + cos(depth * 3.0 + vec3(0.0, 1.0, 2.0));\r
    }\r
\r
    col += (0.05 / (0.4 + stepLen)) * smoothstep(5.0, 0.0, rad) * spectral * rayPattern;\r
    marchT += stepLen;\r
  }\r
\r
  col *= edgeFade(frag, uResolution, uOffset);\r
  col *= uIntensity;\r
\r
  float unit = 0.5 * min(uResolution.x, uResolution.y);\r
  float radius = length(frag - 0.5 * uResolution - uOffset) / unit;\r
  float lift = 1.0;\r
  for (int k = 0; k < 4; k++) {\r
    vec4 pulse = uPulses[k];\r
    if (pulse.y <= 0.0) continue;\r
    float d = (radius - pulse.x) / pulse.z;\r
    lift += pulse.y * exp(-d * d) + pulse.w;\r
  }\r
  if (uPointer.z > 0.0) {\r
    vec2 m = (frag - uPointer.xy) / unit;\r
    lift += uPointer.z * exp(-dot(m, m) / max(uPointer.w * uPointer.w, 1e-4));\r
  }\r
  if (uIntro.z > 0.0) {\r
    vec2 toC = frag - 0.5 * uResolution - uOffset;\r
    float ang = atan(toC.y, toC.x);\r
    float streak = 0.5 + 0.22 * sin(ang * 5.0 + 1.3) + 0.16 * sin(ang * 13.0 + 4.1) + 0.12 * sin(ang * 29.0 + 2.2);\r
    float front = uIntro.x * (0.7 + 0.3 * streak);\r
    float d = (radius - front) / 0.2;\r
    lift += uIntro.y * exp(-d * d);\r
    lift *= smoothstep(front, front - 0.5, radius);\r
  }\r
\r
  outColor = vec4(col * lift * uEncode, 1.0);\r
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
uniform vec2 uSceneSize;\r
uniform sampler2D uBloom0;\r
uniform sampler2D uBloom1;\r
uniform sampler2D uBloom2;\r
uniform sampler2D uBloom3;\r
uniform vec2 uView;\r
uniform float uExact;\r
uniform float uDecode;\r
uniform float uBloom;\r
uniform float uFade;\r
uniform float uLightMode;\r
out vec4 outColor;\r
\r
vec3 tap(vec2 uv) {\r
  return textureLod(uScene, uv, 0.0).rgb;\r
}\r
\r
vec3 bicubic(vec2 uv) {\r
  vec2 position = uv * uSceneSize;\r
  vec2 center = floor(position - 0.5) + 0.5;\r
  vec2 f = position - center;\r
  vec2 w0 = f * (-0.5 + f * (1.0 - 0.5 * f));\r
  vec2 w1 = 1.0 + f * f * (-2.5 + 1.5 * f);\r
  vec2 w2 = f * (0.5 + f * (2.0 - 1.5 * f));\r
  vec2 w3 = f * f * (-0.5 + 0.5 * f);\r
  vec2 w12 = w1 + w2;\r
  vec2 t0 = (center - 1.0) / uSceneSize;\r
  vec2 t3 = (center + 2.0) / uSceneSize;\r
  vec2 t12 = (center + w2 / w12) / uSceneSize;\r
  vec3 result = tap(vec2(t0.x, t0.y)) * w0.x * w0.y;\r
  result += tap(vec2(t12.x, t0.y)) * w12.x * w0.y;\r
  result += tap(vec2(t3.x, t0.y)) * w3.x * w0.y;\r
  result += tap(vec2(t0.x, t12.y)) * w0.x * w12.y;\r
  result += tap(vec2(t12.x, t12.y)) * w12.x * w12.y;\r
  result += tap(vec2(t3.x, t12.y)) * w3.x * w12.y;\r
  result += tap(vec2(t0.x, t3.y)) * w0.x * w3.y;\r
  result += tap(vec2(t12.x, t3.y)) * w12.x * w3.y;\r
  result += tap(vec2(t3.x, t3.y)) * w3.x * w3.y;\r
  return max(result, 0.0);\r
}\r
\r
float smootherstep01(float t) {\r
  t = clamp(t, 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uView;\r
  vec3 col = uExact > 0.5 ? texelFetch(uScene, ivec2(gl_FragCoord.xy), 0).rgb : bicubic(uv);\r
  if (uBloom > 0.0) {\r
    vec3 halo = texture(uBloom0, uv).rgb * 0.42;\r
    halo += texture(uBloom1, uv).rgb * 0.3;\r
    halo += texture(uBloom2, uv).rgb * 0.18;\r
    halo += texture(uBloom3, uv).rgb * 0.1;\r
    col += halo * uBloom * (uLightMode > 0.5 ? 0.25 : 1.0);\r
  }\r
  col = clamp(col * uDecode, 0.0, 1.0);\r
\r
  float mask = 1.0;\r
  float edge = uFade * 0.5;\r
  if (edge > 0.0) {\r
    mask *= smootherstep01(uv.x / edge) * smootherstep01((1.0 - uv.x) / edge);\r
    mask *= smootherstep01(uv.y / edge) * smootherstep01((1.0 - uv.y) / edge);\r
  }\r
\r
  if (uLightMode > 0.5) {\r
    float energy = max(max(col.r, col.g), col.b);\r
    vec3 hue = col / max(energy, 0.0001);\r
    float neutral = min(hue.r, min(hue.g, hue.b));\r
    hue = max(hue - vec3(neutral * 0.68), vec3(0.0));\r
    hue /= max(max(hue.r, max(hue.g, hue.b)), 0.0001);\r
    vec3 pigment = mix(hue, hue * hue, 0.24) * 0.64;\r
    float coverage = smoothstep(0.001, 0.32, energy);\r
    coverage = pow(coverage, 0.72) * 0.92 * mask;\r
    outColor = vec4(pigment * coverage, coverage);\r
  } else {\r
    col *= mask;\r
    outColor = vec4(col, max(col.r, max(col.g, col.b)));\r
  }\r
}\`;\r
\r
const QUALITY: Record<string, number> = { low: 0.35, medium: 0.5, high: 0.7 };\r
const MIN_SCALE = 0.2;\r
const INTRO_SECONDS = 2.4;\r
const PULSE_LIFE = 1.5;\r
const ANIMATIONS: Record<string, number> = { rotate: 0, rotate3d: 1, hover: 2 };\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const toPx = (value?: number | string | null): number => {\r
  if (value == null) return 0;\r
  if (typeof value === 'number') return value;\r
  const parsed = parseFloat(String(value).trim().replace('px', ''));\r
  return Number.isNaN(parsed) ? 0 : parsed;\r
};\r
\r
const rotX = (a: number): number[] => {\r
  const c = Math.cos(a);\r
  const s = Math.sin(a);\r
  return [1, 0, 0, 0, c, -s, 0, s, c];\r
};\r
\r
const rotY = (a: number): number[] => {\r
  const c = Math.cos(a);\r
  const s = Math.sin(a);\r
  return [c, 0, s, 0, 1, 0, -s, 0, c];\r
};\r
\r
const rotZ = (a: number): number[] => {\r
  const c = Math.cos(a);\r
  const s = Math.sin(a);\r
  return [c, -s, 0, s, c, 0, 0, 0, 1];\r
};\r
\r
const multiply = (a: ArrayLike<number>, b: ArrayLike<number>): Float32Array => {\r
  const out = new Float32Array(9);\r
  for (let col = 0; col < 3; col++) {\r
    for (let row = 0; row < 3; row++) {\r
      out[col * 3 + row] = a[row] * b[col * 3] + a[3 + row] * b[col * 3 + 1] + a[6 + row] * b[col * 3 + 2];\r
    }\r
  }\r
  return out;\r
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
const PrismaticBurst = ({\r
  colors,\r
  intensity = 2,\r
  speed = 0.5,\r
  animationType = 'rotate3d',\r
  distort = 0,\r
  rayCount = 0,\r
  rayWidth = 1,\r
  zoom = 1,\r
  twist = 0,\r
  flow = 0,\r
  centerFade = 1,\r
  grain = 0.8,\r
  glow = 0,\r
  offset,\r
  mouseInteraction = true,\r
  mouseStrength = 0.5,\r
  hoverDampness = 0.25,\r
  clickBurst = true,\r
  intro = true,\r
  fade = 0,\r
  quality = 'high',\r
  resolution,\r
  lightMode = false,\r
  mixBlendMode,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  style\r
}: PrismaticBurstProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settingsRef = useRef<Settings>(null as unknown as Settings);\r
  const [generation, setGeneration] = useState(0);\r
  settingsRef.current = {\r
    colors: Array.isArray(colors) ? colors.slice(0, 64).map(String) : [],\r
    intensity: Math.max(0, intensity),\r
    speed,\r
    animation: ANIMATIONS[animationType] ?? ANIMATIONS.rotate3d,\r
    distort: Math.max(0, distort),\r
    rayCount: Math.max(0, Math.floor(rayCount ?? 0)),\r
    rayWidth: clamp(rayWidth, 0.2, 2.5),\r
    zoom: Math.max(0.05, zoom),\r
    twist,\r
    flow,\r
    centerFade: clamp(centerFade, 0.5, 3),\r
    grain: clamp(grain, 0.3, 1),\r
    glow: Math.max(0, glow),\r
    offsetX: toPx(offset?.x),\r
    offsetY: toPx(offset?.y),\r
    mouseInteraction,\r
    mouseStrength: Math.max(0, mouseStrength),\r
    hoverDampness: clamp(hoverDampness, 0, 1),\r
    clickBurst,\r
    intro,\r
    fade: clamp(fade, 0, 1),\r
    scale: clamp(resolution ?? QUALITY[quality] ?? QUALITY.high, MIN_SCALE, 1),\r
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
    const burstProgram = link(gl, BURST);\r
    const downProgram = link(gl, DOWNSAMPLE);\r
    const blurProgram = link(gl, BLUR);\r
    const compositeProgram = link(gl, COMPOSITE);\r
    if (!burstProgram || !downProgram || !blurProgram || !compositeProgram) return undefined;\r
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
    const gradient = gl.createTexture();\r
    let gradientKey: string | null = null;\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const toRgb = (value: string): number[] => {\r
      if (!probe) return [255, 255, 255];\r
      probe.clearRect(0, 0, 1, 1);\r
      probe.fillStyle = '#ffffff';\r
      probe.fillStyle = value;\r
      probe.fillRect(0, 0, 1, 1);\r
      const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
      return [r, g, b];\r
    };\r
    const uploadGradient = (list: string[]) => {\r
      const key = list.join('|');\r
      if (key === gradientKey) return;\r
      gradientKey = key;\r
      const count = Math.max(1, list.length);\r
      const data = new Uint8Array(count * 4).fill(255);\r
      list.forEach((value, index) => data.set(toRgb(value), index * 4));\r
      gl.bindTexture(gl.TEXTURE_2D, gradient);\r
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, count, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    };\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const state = {\r
      time: 0,\r
      phase: 0,\r
      flow: 0,\r
      kick: 0,\r
      intro: settingsRef.current.intro && !reduce ? 0 : 1,\r
      hoverX: 0.5,\r
      hoverY: 0.5,\r
      smoothX: 0,\r
      smoothY: 0,\r
      touch: 0,\r
      governor: 1,\r
      slow: 0,\r
      quick: 0\r
    };\r
    const pulses: { age: number }[] = [];\r
    const pulseData = new Float32Array(MAX_PULSES * 4);\r
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
      const scale = Math.max(MIN_SCALE, s.scale * state.governor);\r
      const sceneWidth = Math.max(1, Math.round(width * scale));\r
      const sceneHeight = Math.max(1, Math.round(height * scale));\r
      const exact = sceneWidth === width && sceneHeight === height;\r
      gl.bindVertexArray(vao);\r
      allocate(scene, sceneWidth, sceneHeight);\r
      levels.forEach((pair, index) => {\r
        const levelWidth = Math.max(1, Math.round(cssWidth / 2 ** (index + 1)));\r
        const levelHeight = Math.max(1, Math.round(cssHeight / 2 ** (index + 1)));\r
        allocate(pair[0], levelWidth, levelHeight);\r
        allocate(pair[1], levelWidth, levelHeight);\r
      });\r
      uploadGradient(s.colors);\r
\r
      const toScene = sceneWidth / cssWidth;\r
      const engaged = s.mouseInteraction ? state.touch : 0;\r
      const nx = cssWidth > 0 ? (state.smoothX / cssWidth) * 2 - 1 : 0;\r
      const ny = cssHeight > 0 ? (state.smoothY / cssHeight) * 2 - 1 : 0;\r
      const parallax = 0.06 * s.mouseStrength * engaged * Math.min(sceneWidth, sceneHeight) * 0.5;\r
      const offsetX = s.offsetX * toScene + nx * parallax;\r
      const offsetY = s.offsetY * toScene - ny * parallax;\r
\r
      const t = state.phase;\r
      let orient: Float32Array | number[];\r
      if (s.animation === 0) {\r
        const a = t * 0.2;\r
        const c0 = Math.cos(a);\r
        orient = [c0, 0, Math.cos(a + 11), 0, 1, 0, Math.cos(a + 33), 0, c0];\r
      } else if (s.animation === 1) {\r
        orient = multiply(multiply(rotZ(t * 0.17), rotY(t * 0.21)), rotX(t * 0.31));\r
      } else {\r
        const mx = state.hoverX * 2 - 1;\r
        const my = state.hoverY * 2 - 1;\r
        orient = multiply(rotY(mx * 0.6), rotX(my * 0.6));\r
      }\r
      if (s.animation !== 2 && engaged > 0) {\r
        const tilt = 0.3 * s.mouseStrength * engaged;\r
        orient = multiply(orient, multiply(rotY(nx * tilt), rotX(ny * tilt)));\r
      }\r
\r
      pulseData.fill(0);\r
      pulses.forEach((pulse, index) => {\r
        const life = pulse.age / PULSE_LIFE;\r
        pulseData.set(\r
          [pulse.age * 1.7, 1.6 * Math.pow(1 - life, 1.6), 0.2 + pulse.age * 0.16, 0.35 * Math.exp(-pulse.age * 7)],\r
          index * 4\r
        );\r
      });\r
\r
      const unit = 0.5 * Math.min(sceneWidth, sceneHeight);\r
      const reach =\r
        Math.hypot(sceneWidth * 0.5 + Math.abs(offsetX), sceneHeight * 0.5 + Math.abs(offsetY)) / Math.max(unit, 1);\r
      const rise = 1 - Math.pow(1 - state.intro, 3);\r
\r
      const b = pass(scene, burstProgram);\r
      bind(0, gradient);\r
      gl.uniform1i(b.uGradient, 0);\r
      gl.uniform2f(b.uResolution, sceneWidth, sceneHeight);\r
      gl.uniform1f(b.uTime, state.time);\r
      gl.uniform1f(b.uPhase, t);\r
      gl.uniform1f(b.uIntensity, s.intensity);\r
      gl.uniformMatrix3fv(b.uOrient, false, orient);\r
      gl.uniform1i(b.uColorCount, s.colors.length);\r
      gl.uniform1f(b.uDistort, s.distort);\r
      gl.uniform2f(b.uOffset, offsetX, offsetY);\r
      gl.uniform1f(b.uNoiseAmount, s.grain);\r
      gl.uniform1i(b.uRayCount, s.rayCount);\r
      gl.uniform1f(b.uZoom, s.zoom);\r
      gl.uniform1f(b.uRayWidth, s.rayWidth);\r
      gl.uniform1f(b.uTwist, s.twist);\r
      gl.uniform1f(b.uFlow, state.flow);\r
      gl.uniform1f(b.uCenterFade, s.centerFade * Math.max(1, s.zoom));\r
      gl.uniform4f(\r
        b.uPointer,\r
        state.smoothX * toScene,\r
        (cssHeight - state.smoothY) * toScene,\r
        s.mouseInteraction ? 0.7 * s.mouseStrength * engaged : 0,\r
        0.45\r
      );\r
      gl.uniform4fv(b.uPulses, pulseData);\r
      gl.uniform3f(b.uIntro, (rise * (reach + 0.6)) / 0.7, 1.6 * (1 - state.intro), state.intro < 1 ? 1 : 0);\r
      gl.uniform1f(b.uEncode, encode);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      if (s.glow > 0) {\r
        let source = scene;\r
        levels.forEach(([front, back]) => {\r
          const d = pass(front, downProgram);\r
          bind(0, source.texture);\r
          gl.uniform1i(d.uSource, 0);\r
          gl.uniform2f(d.uTarget, front.width, front.height);\r
          gl.uniform2f(d.uTexel, 1 / source.width, 1 / source.height);\r
          gl.uniform1f(d.uLimit, 3 * encode);\r
          gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
          let u = pass(back, blurProgram);\r
          bind(0, front.texture);\r
          gl.uniform1i(u.uSource, 0);\r
          gl.uniform2f(u.uTarget, back.width, back.height);\r
          gl.uniform2f(u.uStep, 1 / front.width, 0);\r
          gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
          u = pass(front, blurProgram);\r
          bind(0, back.texture);\r
          gl.uniform1i(u.uSource, 0);\r
          gl.uniform2f(u.uTarget, front.width, front.height);\r
          gl.uniform2f(u.uStep, 0, 1 / back.height);\r
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
      gl.uniform2f(c.uSceneSize, sceneWidth, sceneHeight);\r
      gl.uniform2f(c.uView, width, height);\r
      gl.uniform1f(c.uExact, exact ? 1 : 0);\r
      gl.uniform1f(c.uDecode, 1 / encode);\r
      gl.uniform1f(c.uBloom, s.glow);\r
      gl.uniform1f(c.uFade, s.fade);\r
      gl.uniform1f(c.uLightMode, s.lightMode ? 1 : 0);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      for (let unit = BLOOM_LEVELS; unit >= 0; unit--) bind(unit, null);\r
    };\r
\r
    const tune = (interval: number) => {\r
      if (interval > 1 / 40) {\r
        state.slow += 1;\r
        state.quick = 0;\r
      } else if (interval < 1 / 55) {\r
        state.quick += 1;\r
        state.slow = 0;\r
      }\r
      if (state.slow > 20) {\r
        state.governor = Math.max(0.5, state.governor * 0.85);\r
        state.slow = 0;\r
      } else if (state.quick > 180 && state.governor < 1) {\r
        state.governor = Math.min(1, state.governor * 1.1);\r
        state.quick = 0;\r
      }\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      if (last) tune((now - last) / 1000);\r
      last = now;\r
\r
      if (!s.intro || reduce) state.intro = 1;\r
      else if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / INTRO_SECONDS);\r
      const rush = 3 * Math.pow(1 - state.intro, 2);\r
      const running = !s.paused && !reduce;\r
      if (running) {\r
        state.time += dt;\r
        state.phase += dt * s.speed * (1 + rush) + state.kick * dt;\r
        state.flow += dt * s.flow * 1.2;\r
      }\r
      state.kick *= Math.exp(-dt * 3.5);\r
      if (state.kick < 1e-3) state.kick = 0;\r
\r
      const engaged = s.mouseInteraction && pointer.inside && !reduce;\r
      const tau = 0.02 + s.hoverDampness * 0.5;\r
      const follow = 1 - Math.exp(-dt / tau);\r
      if (engaged && state.touch < 0.01) {\r
        state.smoothX = pointer.x;\r
        state.smoothY = pointer.y;\r
      }\r
      state.smoothX += (pointer.x - state.smoothX) * follow;\r
      state.smoothY += (pointer.y - state.smoothY) * follow;\r
      state.touch += ((engaged ? 1 : 0) - state.touch) * (1 - Math.exp(-dt * (engaged ? 5 : 2.5)));\r
      if (s.animation === 2 && pointer.inside) {\r
        const width = Math.max(1, container.clientWidth);\r
        const height = Math.max(1, container.clientHeight);\r
        state.hoverX += (clamp(pointer.x / width, 0, 1) - state.hoverX) * follow;\r
        state.hoverY += (clamp(pointer.y / height, 0, 1) - state.hoverY) * follow;\r
      }\r
\r
      for (let i = pulses.length - 1; i >= 0; i--) {\r
        pulses[i].age += dt;\r
        if (pulses[i].age > PULSE_LIFE) pulses.splice(i, 1);\r
      }\r
\r
      render();\r
\r
      const settling =\r
        state.intro < 1 ||\r
        pulses.length > 0 ||\r
        state.kick > 0 ||\r
        Math.abs((engaged ? 1 : 0) - state.touch) > 0.002 ||\r
        Math.abs(pointer.x - state.smoothX) + Math.abs(pointer.y - state.smoothY) > 0.2;\r
      if ((running && (s.speed !== 0 || s.grain > 0 || s.flow !== 0)) || settling) raf = requestAnimationFrame(frame);\r
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
      const s = settingsRef.current;\r
      if (s.mouseInteraction && s.clickBurst && !reduce) {\r
        if (pulses.length >= MAX_PULSES) pulses.shift();\r
        pulses.push({ age: 0 });\r
        state.kick = Math.min(5, state.kick + 2.4);\r
      }\r
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
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
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
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      [scene, ...levels.flat()].forEach(target => {\r
        if (target.texture) gl.deleteTexture(target.texture);\r
        gl.deleteFramebuffer(target.framebuffer);\r
      });\r
      gl.deleteTexture(gradient);\r
      [burstProgram, downProgram, blurProgram, compositeProgram].forEach(item => gl.deleteProgram(item.program));\r
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
    <div ref={containerRef} className={\`relative w-full h-full overflow-hidden \${className}\`} style={style}>\r
      <canvas\r
        ref={canvasRef}\r
        className="absolute inset-0 block w-full h-full"\r
        style={mixBlendMode && mixBlendMode !== 'none' ? { mixBlendMode } : undefined}\r
        aria-hidden="true"\r
      />\r
    </div>\r
  );\r
};\r
\r
export default PrismaticBurst;\r
`,a={usage:`import PrismaticBurst from './PrismaticBurst';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <PrismaticBurst
    colors={['#A855F7', '#7C3AED', '#6366F1']}
    animationType="rotate3d"
    intensity={2}
    speed={0.5}
    zoom={1}
    rayWidth={1}
    twist={0}
    mouseInteraction
    clickBurst
    intro
  />
</div>`,code:r,css:n,tailwind:e,tsCode:t,tsTailwind:o};export{a as prismaticBurst};
