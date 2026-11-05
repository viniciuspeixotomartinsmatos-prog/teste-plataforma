const r=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
import './Beams.css';\r
\r
const QUAD_VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const FIELD = \`#version 300 es\r
precision highp float;\r
uniform vec2 uView;\r
uniform vec2 uScale;\r
uniform vec2 uTurn;\r
uniform float uTime;\r
uniform float uWidth;\r
uniform float uWave;\r
uniform float uDepth;\r
uniform float uRough;\r
uniform float uSeed;\r
uniform float uTwist;\r
uniform vec3 uLight;\r
uniform float uFill;\r
uniform float uCamera;\r
uniform vec4 uPointer;\r
out vec4 outColor;\r
\r
const float PI = 3.141592653589793;\r
\r
vec4 permute(vec4 x) {\r
  return mod(((x * 34.0) + 1.0) * x, 289.0);\r
}\r
\r
vec4 taylorInvSqrt(vec4 r) {\r
  return 1.79284291400159 - 0.85373472095314 * r;\r
}\r
\r
vec3 fade(vec3 t) {\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
float cnoise(vec3 P) {\r
  vec3 Pi0 = floor(P);\r
  vec3 Pi1 = Pi0 + vec3(1.0);\r
  Pi0 = mod(Pi0, 289.0);\r
  Pi1 = mod(Pi1, 289.0);\r
  vec3 Pf0 = fract(P);\r
  vec3 Pf1 = Pf0 - vec3(1.0);\r
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);\r
  vec4 iy = vec4(Pi0.yy, Pi1.yy);\r
  vec4 iz0 = Pi0.zzzz;\r
  vec4 iz1 = Pi1.zzzz;\r
  vec4 ixy = permute(permute(ix) + iy);\r
  vec4 ixy0 = permute(ixy + iz0);\r
  vec4 ixy1 = permute(ixy + iz1);\r
  vec4 gx0 = ixy0 / 7.0;\r
  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;\r
  gx0 = fract(gx0);\r
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);\r
  vec4 sz0 = step(gz0, vec4(0.0));\r
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);\r
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);\r
  vec4 gx1 = ixy1 / 7.0;\r
  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;\r
  gx1 = fract(gx1);\r
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);\r
  vec4 sz1 = step(gz1, vec4(0.0));\r
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);\r
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);\r
  vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);\r
  vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);\r
  vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);\r
  vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);\r
  vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);\r
  vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);\r
  vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);\r
  vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);\r
  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));\r
  g000 *= norm0.x;\r
  g010 *= norm0.y;\r
  g100 *= norm0.z;\r
  g110 *= norm0.w;\r
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));\r
  g001 *= norm1.x;\r
  g011 *= norm1.y;\r
  g101 *= norm1.z;\r
  g111 *= norm1.w;\r
  float n000 = dot(g000, Pf0);\r
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));\r
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));\r
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));\r
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));\r
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));\r
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));\r
  float n111 = dot(g111, Pf1);\r
  vec3 fade_xyz = fade(Pf0);\r
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);\r
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);\r
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);\r
  return 2.2 * n_xyz;\r
}\r
\r
float laneHash(float lane) {\r
  return fract(sin(lane * 91.3458 + uSeed * 17.17) * 47453.5453);\r
}\r
\r
float lobe(float nh, float nl, float nv, float vh, float roughness) {\r
  float a = roughness * roughness;\r
  float a2 = a * a;\r
  float d = nh * nh * (a2 - 1.0) + 1.0;\r
  float distribution = a2 / (PI * d * d);\r
  float gv = nl * sqrt(nv * nv * (1.0 - a2) + a2);\r
  float gl = nv * sqrt(nl * nl * (1.0 - a2) + a2);\r
  float visibility = 0.5 / max(gv + gl, 0.0001);\r
  float fresnel = 0.028 + 0.972 * pow(1.0 - vh, 5.0);\r
  return distribution * visibility * fresnel * nl;\r
}\r
\r
vec2 glint(float lane, vec2 local) {\r
  float along = local.y / uWave - laneHash(lane) * 60.0;\r
  float step = 0.01;\r
  float slope = (cnoise(vec3(0.0, along + step, uTime)) - cnoise(vec3(0.0, along - step, uTime))) / (2.0 * step);\r
  slope *= 0.2 * uDepth;\r
  float spin = laneHash(lane + 0.37);\r
  float tilt = ((spin - 0.5) * 0.5 + sin(uTime * 2.1 + spin * 6.2831) * 0.06) * uTwist;\r
  vec3 normal = normalize(vec3(tilt, -slope, 1.0));\r
  vec3 view = normalize(vec3(-local, uCamera));\r
  float nv = max(dot(normal, view), 0.0001);\r
  vec3 light = normalize(uLight);\r
  vec3 halfway = normalize(light + view);\r
  float core = lobe(max(dot(normal, halfway), 0.0), max(dot(normal, light), 0.0), nv, max(dot(view, halfway), 0.0), uRough);\r
  vec3 fill = normalize(vec3(0.0, -uLight.y * 1.25, uLight.z));\r
  vec3 fillHalf = normalize(fill + view);\r
  core += uFill * lobe(max(dot(normal, fillHalf), 0.0), max(dot(normal, fill), 0.0), nv, max(dot(view, fillHalf), 0.0), uRough);\r
  return vec2(core, core);\r
}\r
\r
void main() {\r
  vec2 css = gl_FragCoord.xy * uScale;\r
  vec2 centered = css - uView * 0.5;\r
  vec2 local = mat2(uTurn.x, -uTurn.y, uTurn.y, uTurn.x) * centered;\r
\r
  float across = local.x / uWidth + 0.5;\r
  float lane = floor(across);\r
  float u = across - lane;\r
  vec2 value = glint(lane, local);\r
\r
  float pixel = max(uScale.x, uScale.y);\r
  float seam = min(u, 1.0 - u) * uWidth;\r
  if (seam < pixel * 1.5) {\r
    float other = u < 0.5 ? lane - 1.0 : lane + 1.0;\r
    float blend = 0.5 * (1.0 - smoothstep(0.0, pixel * 1.5, seam));\r
    value = mix(value, glint(other, local), blend);\r
  }\r
\r
  vec2 toPointer = css - uPointer.xy;\r
  float near = exp(-dot(toPointer, toPointer) / (2.0 * uPointer.w * uPointer.w)) * uPointer.z;\r
  value *= 1.0 + near * 0.8;\r
  float hot = max(value.y - 0.18, 0.0);\r
  outColor = vec4(value.x, value.y, min(hot, 6.0), 1.0);\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uField;\r
uniform vec2 uResolution;\r
uniform vec3 uColor;\r
uniform vec3 uInk;\r
uniform float uGain;\r
uniform float uGlow;\r
uniform float uPresence;\r
uniform float uGrain;\r
uniform float uFade;\r
uniform float uOpacity;\r
uniform float uLightMode;\r
out vec4 outColor;\r
\r
float random(vec2 st) {\r
  return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453123);\r
}\r
\r
float grainNoise(vec2 st) {\r
  vec2 i = floor(st);\r
  vec2 f = fract(st);\r
  float a = random(i);\r
  float b = random(i + vec2(1.0, 0.0));\r
  float c = random(i + vec2(0.0, 1.0));\r
  float d = random(i + vec2(1.0, 1.0));\r
  vec2 u = f * f * (3.0 - 2.0 * f);\r
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;\r
}\r
\r
vec3 acesFilmic(vec3 color) {\r
  const mat3 inputMatrix = mat3(\r
    vec3(0.59719, 0.07600, 0.02840),\r
    vec3(0.35458, 0.90834, 0.13383),\r
    vec3(0.04823, 0.01566, 0.83777)\r
  );\r
  const mat3 outputMatrix = mat3(\r
    vec3(1.60475, -0.10208, -0.00327),\r
    vec3(-0.53108, 1.10813, -0.07276),\r
    vec3(-0.07367, -0.00605, 1.07602)\r
  );\r
  color = inputMatrix * (color / 0.6);\r
  vec3 a = color * (color + 0.0245786) - 0.000090537;\r
  vec3 b = color * (0.983729 * color + 0.4329510) + 0.238081;\r
  color = outputMatrix * (a / b);\r
  return clamp(color, 0.0, 1.0);\r
}\r
\r
vec3 toSrgb(vec3 color) {\r
  return mix(color * 12.92, 1.055 * pow(color, vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), color));\r
}\r
\r
float feather(float x, float edge) {\r
  float t = clamp(x / max(edge, 0.0001), 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uResolution;\r
  float radiance = textureLod(uField, uv, 0.0).r;\r
  float bloom = 0.0;\r
  bloom += textureLod(uField, uv, 2.0).b * 0.3;\r
  bloom += textureLod(uField, uv, 3.0).b * 0.3;\r
  bloom += textureLod(uField, uv, 4.0).b * 0.22;\r
  bloom += textureLod(uField, uv, 5.0).b * 0.18;\r
\r
  float hot = textureLod(uField, uv, 0.0).g;\r
  vec3 light = uColor * (radiance + bloom * uGlow) * uGain;\r
  light += mix(uColor, vec3(1.0), 0.7) * hot * hot * 0.12 * uGain;\r
  light *= uPresence;\r
  vec3 color = toSrgb(acesFilmic(light));\r
  color -= grainNoise(gl_FragCoord.xy) / 15.0 * uGrain;\r
  color = max(color, 0.0);\r
\r
  float edge = uFade * 0.5;\r
  float mask = feather(uv.x, edge) * feather(1.0 - uv.x, edge) * feather(uv.y, edge) * feather(1.0 - uv.y, edge);\r
  mask *= uOpacity;\r
  float dither = (random(gl_FragCoord.yx + 31.7) - 0.5) / 255.0;\r
\r
  float peak = max(color.r, max(color.g, color.b));\r
  if (uLightMode > 0.5) {\r
    float alpha = clamp(peak * 0.9 + dither, 0.0, 1.0) * mask;\r
    outColor = vec4(uInk * alpha, alpha);\r
  } else {\r
    color = clamp(color + dither, 0.0, 1.0) * mask;\r
    outColor = vec4(color, max(color.r, max(color.g, color.b)));\r
  }\r
}\`;\r
\r
const INTRO_SECONDS = 1.6;\r
const MAX_FIELD_PIXELS = 1600000;\r
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
  const vertex = compile(gl, gl.VERTEX_SHADER, QUAD_VERTEX);\r
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
    if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
export const Beams = ({\r
  color = '#ffffff',\r
  beamWidth = 140,\r
  rotation = 30,\r
  speed = 1,\r
  waveLength = 233,\r
  depth = 1,\r
  sharpness = 0.6,\r
  twist = 0,\r
  fillLight = 0.3,\r
  glow = 0.6,\r
  brightness = 1.6,\r
  variation = 0,\r
  grain = 0.35,\r
  quality = 0.75,\r
  mouseInteraction = true,\r
  mouseStrength = 1,\r
  intro = true,\r
  fade = 0,\r
  opacity = 1,\r
  lightMode = false,\r
  backgroundColor,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  style,\r
  ...rest\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settings = {\r
    color: String(color),\r
    beamWidth: Math.max(8, beamWidth),\r
    rotation,\r
    speed,\r
    waveLength: Math.max(20, waveLength),\r
    depth: Math.max(0, depth),\r
    sharpness: clamp(sharpness, 0, 1),\r
    twist: clamp(twist, 0, 2),\r
    fillLight: clamp(fillLight, 0, 1.5),\r
    glow: Math.max(0, glow),\r
    brightness: Math.max(0, brightness),\r
    variation: Number(variation) || 0,\r
    grain: Math.max(0, grain),\r
    quality: clamp(quality, 0.25, 1),\r
    mouseInteraction,\r
    mouseStrength: Math.max(0, mouseStrength),\r
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
      stencil: false,\r
      powerPreference: 'high-performance'\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const floatTargets = !!gl.getExtension('EXT_color_buffer_float');\r
    const fieldProgram = link(gl, FIELD);\r
    const compositeProgram = link(gl, COMPOSITE);\r
    if (!fieldProgram || !compositeProgram) return undefined;\r
\r
    const buffer = gl.createBuffer();\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    let texture = null;\r
    const framebuffer = gl.createFramebuffer();\r
    const target = { width: 0, height: 0 };\r
    const sizeTarget = (width, height) => {\r
      if (target.width === width && target.height === height) return;\r
      target.width = width;\r
      target.height = height;\r
      if (texture) gl.deleteTexture(texture);\r
      texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      const levels = Math.floor(Math.log2(Math.max(width, height))) + 1;\r
      gl.texStorage2D(gl.TEXTURE_2D, levels, floatTargets ? gl.RGBA16F : gl.RGBA8, width, height);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
    };\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const colorCache = new Map();\r
    const toLinear = value => {\r
      const cached = colorCache.get(value);\r
      if (cached) return cached;\r
      let rgb = [1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#ffffff';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r, g, b].map(v => Math.pow(v / 255, 2.2));\r
      }\r
      colorCache.set(value, rgb);\r
      return rgb;\r
    };\r
\r
    const view = { width: 1, height: 1, fieldWidth: 1, fieldHeight: 1 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const state = {\r
      clock: 0,\r
      intro: settingsRef.current.intro && !reduce ? 0 : 1,\r
      reach: 0,\r
      x: 0,\r
      y: 0,\r
      lightY: 0\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const presence = state.intro * state.intro * state.intro * (state.intro * (state.intro * 6 - 15) + 10);\r
      gl.bindVertexArray(vao);\r
      sizeTarget(view.fieldWidth, view.fieldHeight);\r
\r
      const angle = (s.rotation * Math.PI) / 180;\r
      const sweep = (1 - presence) * -9;\r
      const reach = state.reach * s.mouseStrength;\r
      const f = fieldProgram.uniforms;\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.viewport(0, 0, target.width, target.height);\r
      gl.useProgram(fieldProgram.program);\r
      gl.uniform2f(f.uView, view.width, view.height);\r
      gl.uniform2f(f.uScale, view.width / target.width, view.height / target.height);\r
      gl.uniform2f(f.uTurn, Math.cos(angle), Math.sin(angle));\r
      gl.uniform1f(f.uTime, (state.clock * 0.12) % 289);\r
      gl.uniform1f(f.uWidth, s.beamWidth);\r
      gl.uniform1f(f.uWave, s.waveLength);\r
      gl.uniform1f(f.uDepth, s.depth);\r
      gl.uniform1f(f.uRough, 0.55 - s.sharpness * 0.5);\r
      gl.uniform1f(f.uSeed, s.variation);\r
      gl.uniform1f(f.uTwist, s.twist);\r
      gl.uniform1f(f.uFill, s.fillLight);\r
      gl.uniform3f(f.uLight, 0, 3 + sweep + state.lightY * reach, 10);\r
      gl.uniform1f(f.uCamera, view.height * 1.866);\r
      gl.uniform4f(f.uPointer, state.x, view.height - state.y, reach, Math.max(view.height, view.width) * 0.28);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.generateMipmap(gl.TEXTURE_2D);\r
\r
      const c = compositeProgram.uniforms;\r
      const tint = toLinear(s.color);\r
      const tone = 0.2126 * tint[0] + 0.7152 * tint[1] + 0.0722 * tint[2];\r
      const shadeDepth = Math.min(1, 0.18 / Math.max(tone, 0.001));\r
      const ink = tint.map(v => Math.pow(Math.min(1, v * shadeDepth), 1 / 2.2));\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(compositeProgram.program);\r
      gl.uniform2f(c.uResolution, canvas.width, canvas.height);\r
      gl.uniform3fv(c.uColor, tint);\r
      gl.uniform3fv(c.uInk, ink);\r
      gl.uniform1f(c.uGain, s.brightness);\r
      gl.uniform1f(c.uGlow, s.glow);\r
      gl.uniform1f(c.uPresence, presence);\r
      gl.uniform1f(c.uGrain, s.grain * 1.75);\r
      gl.uniform1f(c.uFade, s.fade);\r
      gl.uniform1f(c.uOpacity, s.opacity);\r
      gl.uniform1f(c.uLightMode, s.lightMode ? 1 : 0);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.uniform1i(c.uField, 0);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const moving = !s.paused && !reduce;\r
      if (moving) state.clock += dt * s.speed;\r
      if (!s.intro || reduce) state.intro = 1;\r
      else if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / INTRO_SECONDS);\r
\r
      const engaged = s.mouseInteraction && pointer.inside && !reduce;\r
      if (engaged && state.reach < 0.01) {\r
        state.x = pointer.x;\r
        state.y = pointer.y;\r
      }\r
      const follow = 1 - Math.exp(-dt * 7);\r
      state.x += (pointer.x - state.x) * follow;\r
      state.y += (pointer.y - state.y) * follow;\r
      state.reach += ((engaged ? 1 : 0) - state.reach) * (1 - Math.exp(-dt * (engaged ? 3.2 : 1.8)));\r
      const turn = (s.rotation * Math.PI) / 180;\r
      const offsetX = state.x - view.width / 2;\r
      const offsetY = view.height / 2 - state.y;\r
      const along = -Math.sin(turn) * offsetX + Math.cos(turn) * offsetY;\r
      state.lightY = clamp((along / (view.height * 0.5)) * 3, -4, 4);\r
      render();\r
\r
      const settling =\r
        state.intro < 1 ||\r
        Math.abs((engaged ? 1 : 0) - state.reach) > 0.002 ||\r
        Math.abs(pointer.x - state.x) + Math.abs(pointer.y - state.y) > 0.3;\r
      if (moving || settling) raf = requestAnimationFrame(frame);\r
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
      view.width = width;\r
      view.height = height;\r
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      let fieldScale = s.quality * ratio;\r
      if (width * height * fieldScale * fieldScale > MAX_FIELD_PIXELS) {\r
        fieldScale = Math.sqrt(MAX_FIELD_PIXELS / (width * height));\r
      }\r
      view.fieldWidth = Math.max(1, Math.round(width * fieldScale));\r
      view.fieldHeight = Math.max(1, Math.round(height * fieldScale));\r
      if (!raf) render();\r
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
    let lastQuality = settingsRef.current.quality;\r
    let lastDpr = settingsRef.current.dpr;\r
    wakeRef.current = () => {\r
      const s = settingsRef.current;\r
      if (s.quality !== lastQuality || s.dpr !== lastDpr) {\r
        lastQuality = s.quality;\r
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
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      if (texture) gl.deleteTexture(texture);\r
      gl.deleteFramebuffer(framebuffer);\r
      gl.deleteProgram(fieldProgram.program);\r
      gl.deleteProgram(compositeProgram.program);\r
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
      className={\`beams-container\${className ? \` \${className}\` : ''}\`}\r
      style={backgroundColor ? { background: backgroundColor, ...style } : style}\r
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className="beams-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Beams;\r
`,n=`.beams-container {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.beams-canvas {\r
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
const QUAD_VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const FIELD = \`#version 300 es\r
precision highp float;\r
uniform vec2 uView;\r
uniform vec2 uScale;\r
uniform vec2 uTurn;\r
uniform float uTime;\r
uniform float uWidth;\r
uniform float uWave;\r
uniform float uDepth;\r
uniform float uRough;\r
uniform float uSeed;\r
uniform float uTwist;\r
uniform vec3 uLight;\r
uniform float uFill;\r
uniform float uCamera;\r
uniform vec4 uPointer;\r
out vec4 outColor;\r
\r
const float PI = 3.141592653589793;\r
\r
vec4 permute(vec4 x) {\r
  return mod(((x * 34.0) + 1.0) * x, 289.0);\r
}\r
\r
vec4 taylorInvSqrt(vec4 r) {\r
  return 1.79284291400159 - 0.85373472095314 * r;\r
}\r
\r
vec3 fade(vec3 t) {\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
float cnoise(vec3 P) {\r
  vec3 Pi0 = floor(P);\r
  vec3 Pi1 = Pi0 + vec3(1.0);\r
  Pi0 = mod(Pi0, 289.0);\r
  Pi1 = mod(Pi1, 289.0);\r
  vec3 Pf0 = fract(P);\r
  vec3 Pf1 = Pf0 - vec3(1.0);\r
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);\r
  vec4 iy = vec4(Pi0.yy, Pi1.yy);\r
  vec4 iz0 = Pi0.zzzz;\r
  vec4 iz1 = Pi1.zzzz;\r
  vec4 ixy = permute(permute(ix) + iy);\r
  vec4 ixy0 = permute(ixy + iz0);\r
  vec4 ixy1 = permute(ixy + iz1);\r
  vec4 gx0 = ixy0 / 7.0;\r
  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;\r
  gx0 = fract(gx0);\r
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);\r
  vec4 sz0 = step(gz0, vec4(0.0));\r
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);\r
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);\r
  vec4 gx1 = ixy1 / 7.0;\r
  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;\r
  gx1 = fract(gx1);\r
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);\r
  vec4 sz1 = step(gz1, vec4(0.0));\r
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);\r
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);\r
  vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);\r
  vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);\r
  vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);\r
  vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);\r
  vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);\r
  vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);\r
  vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);\r
  vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);\r
  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));\r
  g000 *= norm0.x;\r
  g010 *= norm0.y;\r
  g100 *= norm0.z;\r
  g110 *= norm0.w;\r
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));\r
  g001 *= norm1.x;\r
  g011 *= norm1.y;\r
  g101 *= norm1.z;\r
  g111 *= norm1.w;\r
  float n000 = dot(g000, Pf0);\r
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));\r
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));\r
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));\r
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));\r
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));\r
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));\r
  float n111 = dot(g111, Pf1);\r
  vec3 fade_xyz = fade(Pf0);\r
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);\r
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);\r
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);\r
  return 2.2 * n_xyz;\r
}\r
\r
float laneHash(float lane) {\r
  return fract(sin(lane * 91.3458 + uSeed * 17.17) * 47453.5453);\r
}\r
\r
float lobe(float nh, float nl, float nv, float vh, float roughness) {\r
  float a = roughness * roughness;\r
  float a2 = a * a;\r
  float d = nh * nh * (a2 - 1.0) + 1.0;\r
  float distribution = a2 / (PI * d * d);\r
  float gv = nl * sqrt(nv * nv * (1.0 - a2) + a2);\r
  float gl = nv * sqrt(nl * nl * (1.0 - a2) + a2);\r
  float visibility = 0.5 / max(gv + gl, 0.0001);\r
  float fresnel = 0.028 + 0.972 * pow(1.0 - vh, 5.0);\r
  return distribution * visibility * fresnel * nl;\r
}\r
\r
vec2 glint(float lane, vec2 local) {\r
  float along = local.y / uWave - laneHash(lane) * 60.0;\r
  float step = 0.01;\r
  float slope = (cnoise(vec3(0.0, along + step, uTime)) - cnoise(vec3(0.0, along - step, uTime))) / (2.0 * step);\r
  slope *= 0.2 * uDepth;\r
  float spin = laneHash(lane + 0.37);\r
  float tilt = ((spin - 0.5) * 0.5 + sin(uTime * 2.1 + spin * 6.2831) * 0.06) * uTwist;\r
  vec3 normal = normalize(vec3(tilt, -slope, 1.0));\r
  vec3 view = normalize(vec3(-local, uCamera));\r
  float nv = max(dot(normal, view), 0.0001);\r
  vec3 light = normalize(uLight);\r
  vec3 halfway = normalize(light + view);\r
  float core = lobe(max(dot(normal, halfway), 0.0), max(dot(normal, light), 0.0), nv, max(dot(view, halfway), 0.0), uRough);\r
  vec3 fill = normalize(vec3(0.0, -uLight.y * 1.25, uLight.z));\r
  vec3 fillHalf = normalize(fill + view);\r
  core += uFill * lobe(max(dot(normal, fillHalf), 0.0), max(dot(normal, fill), 0.0), nv, max(dot(view, fillHalf), 0.0), uRough);\r
  return vec2(core, core);\r
}\r
\r
void main() {\r
  vec2 css = gl_FragCoord.xy * uScale;\r
  vec2 centered = css - uView * 0.5;\r
  vec2 local = mat2(uTurn.x, -uTurn.y, uTurn.y, uTurn.x) * centered;\r
\r
  float across = local.x / uWidth + 0.5;\r
  float lane = floor(across);\r
  float u = across - lane;\r
  vec2 value = glint(lane, local);\r
\r
  float pixel = max(uScale.x, uScale.y);\r
  float seam = min(u, 1.0 - u) * uWidth;\r
  if (seam < pixel * 1.5) {\r
    float other = u < 0.5 ? lane - 1.0 : lane + 1.0;\r
    float blend = 0.5 * (1.0 - smoothstep(0.0, pixel * 1.5, seam));\r
    value = mix(value, glint(other, local), blend);\r
  }\r
\r
  vec2 toPointer = css - uPointer.xy;\r
  float near = exp(-dot(toPointer, toPointer) / (2.0 * uPointer.w * uPointer.w)) * uPointer.z;\r
  value *= 1.0 + near * 0.8;\r
  float hot = max(value.y - 0.18, 0.0);\r
  outColor = vec4(value.x, value.y, min(hot, 6.0), 1.0);\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uField;\r
uniform vec2 uResolution;\r
uniform vec3 uColor;\r
uniform vec3 uInk;\r
uniform float uGain;\r
uniform float uGlow;\r
uniform float uPresence;\r
uniform float uGrain;\r
uniform float uFade;\r
uniform float uOpacity;\r
uniform float uLightMode;\r
out vec4 outColor;\r
\r
float random(vec2 st) {\r
  return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453123);\r
}\r
\r
float grainNoise(vec2 st) {\r
  vec2 i = floor(st);\r
  vec2 f = fract(st);\r
  float a = random(i);\r
  float b = random(i + vec2(1.0, 0.0));\r
  float c = random(i + vec2(0.0, 1.0));\r
  float d = random(i + vec2(1.0, 1.0));\r
  vec2 u = f * f * (3.0 - 2.0 * f);\r
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;\r
}\r
\r
vec3 acesFilmic(vec3 color) {\r
  const mat3 inputMatrix = mat3(\r
    vec3(0.59719, 0.07600, 0.02840),\r
    vec3(0.35458, 0.90834, 0.13383),\r
    vec3(0.04823, 0.01566, 0.83777)\r
  );\r
  const mat3 outputMatrix = mat3(\r
    vec3(1.60475, -0.10208, -0.00327),\r
    vec3(-0.53108, 1.10813, -0.07276),\r
    vec3(-0.07367, -0.00605, 1.07602)\r
  );\r
  color = inputMatrix * (color / 0.6);\r
  vec3 a = color * (color + 0.0245786) - 0.000090537;\r
  vec3 b = color * (0.983729 * color + 0.4329510) + 0.238081;\r
  color = outputMatrix * (a / b);\r
  return clamp(color, 0.0, 1.0);\r
}\r
\r
vec3 toSrgb(vec3 color) {\r
  return mix(color * 12.92, 1.055 * pow(color, vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), color));\r
}\r
\r
float feather(float x, float edge) {\r
  float t = clamp(x / max(edge, 0.0001), 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uResolution;\r
  float radiance = textureLod(uField, uv, 0.0).r;\r
  float bloom = 0.0;\r
  bloom += textureLod(uField, uv, 2.0).b * 0.3;\r
  bloom += textureLod(uField, uv, 3.0).b * 0.3;\r
  bloom += textureLod(uField, uv, 4.0).b * 0.22;\r
  bloom += textureLod(uField, uv, 5.0).b * 0.18;\r
\r
  float hot = textureLod(uField, uv, 0.0).g;\r
  vec3 light = uColor * (radiance + bloom * uGlow) * uGain;\r
  light += mix(uColor, vec3(1.0), 0.7) * hot * hot * 0.12 * uGain;\r
  light *= uPresence;\r
  vec3 color = toSrgb(acesFilmic(light));\r
  color -= grainNoise(gl_FragCoord.xy) / 15.0 * uGrain;\r
  color = max(color, 0.0);\r
\r
  float edge = uFade * 0.5;\r
  float mask = feather(uv.x, edge) * feather(1.0 - uv.x, edge) * feather(uv.y, edge) * feather(1.0 - uv.y, edge);\r
  mask *= uOpacity;\r
  float dither = (random(gl_FragCoord.yx + 31.7) - 0.5) / 255.0;\r
\r
  float peak = max(color.r, max(color.g, color.b));\r
  if (uLightMode > 0.5) {\r
    float alpha = clamp(peak * 0.9 + dither, 0.0, 1.0) * mask;\r
    outColor = vec4(uInk * alpha, alpha);\r
  } else {\r
    color = clamp(color + dither, 0.0, 1.0) * mask;\r
    outColor = vec4(color, max(color.r, max(color.g, color.b)));\r
  }\r
}\`;\r
\r
const INTRO_SECONDS = 1.6;\r
const MAX_FIELD_PIXELS = 1600000;\r
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
  const vertex = compile(gl, gl.VERTEX_SHADER, QUAD_VERTEX);\r
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
    if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
export const Beams = ({\r
  color = '#ffffff',\r
  beamWidth = 140,\r
  rotation = 30,\r
  speed = 1,\r
  waveLength = 233,\r
  depth = 1,\r
  sharpness = 0.6,\r
  twist = 0,\r
  fillLight = 0.3,\r
  glow = 0.6,\r
  brightness = 1.6,\r
  variation = 0,\r
  grain = 0.35,\r
  quality = 0.75,\r
  mouseInteraction = true,\r
  mouseStrength = 1,\r
  intro = true,\r
  fade = 0,\r
  opacity = 1,\r
  lightMode = false,\r
  backgroundColor,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  style,\r
  ...rest\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settings = {\r
    color: String(color),\r
    beamWidth: Math.max(8, beamWidth),\r
    rotation,\r
    speed,\r
    waveLength: Math.max(20, waveLength),\r
    depth: Math.max(0, depth),\r
    sharpness: clamp(sharpness, 0, 1),\r
    twist: clamp(twist, 0, 2),\r
    fillLight: clamp(fillLight, 0, 1.5),\r
    glow: Math.max(0, glow),\r
    brightness: Math.max(0, brightness),\r
    variation: Number(variation) || 0,\r
    grain: Math.max(0, grain),\r
    quality: clamp(quality, 0.25, 1),\r
    mouseInteraction,\r
    mouseStrength: Math.max(0, mouseStrength),\r
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
      stencil: false,\r
      powerPreference: 'high-performance'\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const floatTargets = !!gl.getExtension('EXT_color_buffer_float');\r
    const fieldProgram = link(gl, FIELD);\r
    const compositeProgram = link(gl, COMPOSITE);\r
    if (!fieldProgram || !compositeProgram) return undefined;\r
\r
    const buffer = gl.createBuffer();\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    let texture = null;\r
    const framebuffer = gl.createFramebuffer();\r
    const target = { width: 0, height: 0 };\r
    const sizeTarget = (width, height) => {\r
      if (target.width === width && target.height === height) return;\r
      target.width = width;\r
      target.height = height;\r
      if (texture) gl.deleteTexture(texture);\r
      texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      const levels = Math.floor(Math.log2(Math.max(width, height))) + 1;\r
      gl.texStorage2D(gl.TEXTURE_2D, levels, floatTargets ? gl.RGBA16F : gl.RGBA8, width, height);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
    };\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const colorCache = new Map();\r
    const toLinear = value => {\r
      const cached = colorCache.get(value);\r
      if (cached) return cached;\r
      let rgb = [1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#ffffff';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r, g, b].map(v => Math.pow(v / 255, 2.2));\r
      }\r
      colorCache.set(value, rgb);\r
      return rgb;\r
    };\r
\r
    const view = { width: 1, height: 1, fieldWidth: 1, fieldHeight: 1 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const state = {\r
      clock: 0,\r
      intro: settingsRef.current.intro && !reduce ? 0 : 1,\r
      reach: 0,\r
      x: 0,\r
      y: 0,\r
      lightY: 0\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const presence = state.intro * state.intro * state.intro * (state.intro * (state.intro * 6 - 15) + 10);\r
      gl.bindVertexArray(vao);\r
      sizeTarget(view.fieldWidth, view.fieldHeight);\r
\r
      const angle = (s.rotation * Math.PI) / 180;\r
      const sweep = (1 - presence) * -9;\r
      const reach = state.reach * s.mouseStrength;\r
      const f = fieldProgram.uniforms;\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.viewport(0, 0, target.width, target.height);\r
      gl.useProgram(fieldProgram.program);\r
      gl.uniform2f(f.uView, view.width, view.height);\r
      gl.uniform2f(f.uScale, view.width / target.width, view.height / target.height);\r
      gl.uniform2f(f.uTurn, Math.cos(angle), Math.sin(angle));\r
      gl.uniform1f(f.uTime, (state.clock * 0.12) % 289);\r
      gl.uniform1f(f.uWidth, s.beamWidth);\r
      gl.uniform1f(f.uWave, s.waveLength);\r
      gl.uniform1f(f.uDepth, s.depth);\r
      gl.uniform1f(f.uRough, 0.55 - s.sharpness * 0.5);\r
      gl.uniform1f(f.uSeed, s.variation);\r
      gl.uniform1f(f.uTwist, s.twist);\r
      gl.uniform1f(f.uFill, s.fillLight);\r
      gl.uniform3f(f.uLight, 0, 3 + sweep + state.lightY * reach, 10);\r
      gl.uniform1f(f.uCamera, view.height * 1.866);\r
      gl.uniform4f(f.uPointer, state.x, view.height - state.y, reach, Math.max(view.height, view.width) * 0.28);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.generateMipmap(gl.TEXTURE_2D);\r
\r
      const c = compositeProgram.uniforms;\r
      const tint = toLinear(s.color);\r
      const tone = 0.2126 * tint[0] + 0.7152 * tint[1] + 0.0722 * tint[2];\r
      const shadeDepth = Math.min(1, 0.18 / Math.max(tone, 0.001));\r
      const ink = tint.map(v => Math.pow(Math.min(1, v * shadeDepth), 1 / 2.2));\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(compositeProgram.program);\r
      gl.uniform2f(c.uResolution, canvas.width, canvas.height);\r
      gl.uniform3fv(c.uColor, tint);\r
      gl.uniform3fv(c.uInk, ink);\r
      gl.uniform1f(c.uGain, s.brightness);\r
      gl.uniform1f(c.uGlow, s.glow);\r
      gl.uniform1f(c.uPresence, presence);\r
      gl.uniform1f(c.uGrain, s.grain * 1.75);\r
      gl.uniform1f(c.uFade, s.fade);\r
      gl.uniform1f(c.uOpacity, s.opacity);\r
      gl.uniform1f(c.uLightMode, s.lightMode ? 1 : 0);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.uniform1i(c.uField, 0);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const moving = !s.paused && !reduce;\r
      if (moving) state.clock += dt * s.speed;\r
      if (!s.intro || reduce) state.intro = 1;\r
      else if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / INTRO_SECONDS);\r
\r
      const engaged = s.mouseInteraction && pointer.inside && !reduce;\r
      if (engaged && state.reach < 0.01) {\r
        state.x = pointer.x;\r
        state.y = pointer.y;\r
      }\r
      const follow = 1 - Math.exp(-dt * 7);\r
      state.x += (pointer.x - state.x) * follow;\r
      state.y += (pointer.y - state.y) * follow;\r
      state.reach += ((engaged ? 1 : 0) - state.reach) * (1 - Math.exp(-dt * (engaged ? 3.2 : 1.8)));\r
      const turn = (s.rotation * Math.PI) / 180;\r
      const offsetX = state.x - view.width / 2;\r
      const offsetY = view.height / 2 - state.y;\r
      const along = -Math.sin(turn) * offsetX + Math.cos(turn) * offsetY;\r
      state.lightY = clamp((along / (view.height * 0.5)) * 3, -4, 4);\r
      render();\r
\r
      const settling =\r
        state.intro < 1 ||\r
        Math.abs((engaged ? 1 : 0) - state.reach) > 0.002 ||\r
        Math.abs(pointer.x - state.x) + Math.abs(pointer.y - state.y) > 0.3;\r
      if (moving || settling) raf = requestAnimationFrame(frame);\r
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
      view.width = width;\r
      view.height = height;\r
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      let fieldScale = s.quality * ratio;\r
      if (width * height * fieldScale * fieldScale > MAX_FIELD_PIXELS) {\r
        fieldScale = Math.sqrt(MAX_FIELD_PIXELS / (width * height));\r
      }\r
      view.fieldWidth = Math.max(1, Math.round(width * fieldScale));\r
      view.fieldHeight = Math.max(1, Math.round(height * fieldScale));\r
      if (!raf) render();\r
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
    let lastQuality = settingsRef.current.quality;\r
    let lastDpr = settingsRef.current.dpr;\r
    wakeRef.current = () => {\r
      const s = settingsRef.current;\r
      if (s.quality !== lastQuality || s.dpr !== lastDpr) {\r
        lastQuality = s.quality;\r
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
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      if (texture) gl.deleteTexture(texture);\r
      gl.deleteFramebuffer(framebuffer);\r
      gl.deleteProgram(fieldProgram.program);\r
      gl.deleteProgram(compositeProgram.program);\r
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
      style={backgroundColor ? { background: backgroundColor, ...style } : style}\r
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Beams;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, type HTMLAttributes } from 'react';\r
\r
import './Beams.css';\r
\r
export interface BeamsProps extends HTMLAttributes<HTMLDivElement> {\r
  color?: string;\r
  beamWidth?: number;\r
  rotation?: number;\r
  speed?: number;\r
  waveLength?: number;\r
  depth?: number;\r
  sharpness?: number;\r
  twist?: number;\r
  fillLight?: number;\r
  glow?: number;\r
  brightness?: number;\r
  variation?: number;\r
  grain?: number;\r
  quality?: number;\r
  mouseInteraction?: boolean;\r
  mouseStrength?: number;\r
  intro?: boolean;\r
  fade?: number;\r
  opacity?: number;\r
  lightMode?: boolean;\r
  backgroundColor?: string;\r
  paused?: boolean;\r
  dpr?: number;\r
  className?: string;\r
}\r
\r
type Settings = {\r
  color: string;\r
  beamWidth: number;\r
  rotation: number;\r
  speed: number;\r
  waveLength: number;\r
  depth: number;\r
  sharpness: number;\r
  twist: number;\r
  fillLight: number;\r
  glow: number;\r
  brightness: number;\r
  variation: number;\r
  grain: number;\r
  quality: number;\r
  mouseInteraction: boolean;\r
  mouseStrength: number;\r
  intro: boolean;\r
  fade: number;\r
  opacity: number;\r
  lightMode: boolean;\r
  paused: boolean;\r
  dpr?: number;\r
};\r
\r
type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };\r
\r
const QUAD_VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const FIELD = \`#version 300 es\r
precision highp float;\r
uniform vec2 uView;\r
uniform vec2 uScale;\r
uniform vec2 uTurn;\r
uniform float uTime;\r
uniform float uWidth;\r
uniform float uWave;\r
uniform float uDepth;\r
uniform float uRough;\r
uniform float uSeed;\r
uniform float uTwist;\r
uniform vec3 uLight;\r
uniform float uFill;\r
uniform float uCamera;\r
uniform vec4 uPointer;\r
out vec4 outColor;\r
\r
const float PI = 3.141592653589793;\r
\r
vec4 permute(vec4 x) {\r
  return mod(((x * 34.0) + 1.0) * x, 289.0);\r
}\r
\r
vec4 taylorInvSqrt(vec4 r) {\r
  return 1.79284291400159 - 0.85373472095314 * r;\r
}\r
\r
vec3 fade(vec3 t) {\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
float cnoise(vec3 P) {\r
  vec3 Pi0 = floor(P);\r
  vec3 Pi1 = Pi0 + vec3(1.0);\r
  Pi0 = mod(Pi0, 289.0);\r
  Pi1 = mod(Pi1, 289.0);\r
  vec3 Pf0 = fract(P);\r
  vec3 Pf1 = Pf0 - vec3(1.0);\r
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);\r
  vec4 iy = vec4(Pi0.yy, Pi1.yy);\r
  vec4 iz0 = Pi0.zzzz;\r
  vec4 iz1 = Pi1.zzzz;\r
  vec4 ixy = permute(permute(ix) + iy);\r
  vec4 ixy0 = permute(ixy + iz0);\r
  vec4 ixy1 = permute(ixy + iz1);\r
  vec4 gx0 = ixy0 / 7.0;\r
  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;\r
  gx0 = fract(gx0);\r
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);\r
  vec4 sz0 = step(gz0, vec4(0.0));\r
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);\r
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);\r
  vec4 gx1 = ixy1 / 7.0;\r
  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;\r
  gx1 = fract(gx1);\r
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);\r
  vec4 sz1 = step(gz1, vec4(0.0));\r
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);\r
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);\r
  vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);\r
  vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);\r
  vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);\r
  vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);\r
  vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);\r
  vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);\r
  vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);\r
  vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);\r
  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));\r
  g000 *= norm0.x;\r
  g010 *= norm0.y;\r
  g100 *= norm0.z;\r
  g110 *= norm0.w;\r
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));\r
  g001 *= norm1.x;\r
  g011 *= norm1.y;\r
  g101 *= norm1.z;\r
  g111 *= norm1.w;\r
  float n000 = dot(g000, Pf0);\r
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));\r
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));\r
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));\r
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));\r
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));\r
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));\r
  float n111 = dot(g111, Pf1);\r
  vec3 fade_xyz = fade(Pf0);\r
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);\r
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);\r
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);\r
  return 2.2 * n_xyz;\r
}\r
\r
float laneHash(float lane) {\r
  return fract(sin(lane * 91.3458 + uSeed * 17.17) * 47453.5453);\r
}\r
\r
float lobe(float nh, float nl, float nv, float vh, float roughness) {\r
  float a = roughness * roughness;\r
  float a2 = a * a;\r
  float d = nh * nh * (a2 - 1.0) + 1.0;\r
  float distribution = a2 / (PI * d * d);\r
  float gv = nl * sqrt(nv * nv * (1.0 - a2) + a2);\r
  float gl = nv * sqrt(nl * nl * (1.0 - a2) + a2);\r
  float visibility = 0.5 / max(gv + gl, 0.0001);\r
  float fresnel = 0.028 + 0.972 * pow(1.0 - vh, 5.0);\r
  return distribution * visibility * fresnel * nl;\r
}\r
\r
vec2 glint(float lane, vec2 local) {\r
  float along = local.y / uWave - laneHash(lane) * 60.0;\r
  float step = 0.01;\r
  float slope = (cnoise(vec3(0.0, along + step, uTime)) - cnoise(vec3(0.0, along - step, uTime))) / (2.0 * step);\r
  slope *= 0.2 * uDepth;\r
  float spin = laneHash(lane + 0.37);\r
  float tilt = ((spin - 0.5) * 0.5 + sin(uTime * 2.1 + spin * 6.2831) * 0.06) * uTwist;\r
  vec3 normal = normalize(vec3(tilt, -slope, 1.0));\r
  vec3 view = normalize(vec3(-local, uCamera));\r
  float nv = max(dot(normal, view), 0.0001);\r
  vec3 light = normalize(uLight);\r
  vec3 halfway = normalize(light + view);\r
  float core = lobe(max(dot(normal, halfway), 0.0), max(dot(normal, light), 0.0), nv, max(dot(view, halfway), 0.0), uRough);\r
  vec3 fill = normalize(vec3(0.0, -uLight.y * 1.25, uLight.z));\r
  vec3 fillHalf = normalize(fill + view);\r
  core += uFill * lobe(max(dot(normal, fillHalf), 0.0), max(dot(normal, fill), 0.0), nv, max(dot(view, fillHalf), 0.0), uRough);\r
  return vec2(core, core);\r
}\r
\r
void main() {\r
  vec2 css = gl_FragCoord.xy * uScale;\r
  vec2 centered = css - uView * 0.5;\r
  vec2 local = mat2(uTurn.x, -uTurn.y, uTurn.y, uTurn.x) * centered;\r
\r
  float across = local.x / uWidth + 0.5;\r
  float lane = floor(across);\r
  float u = across - lane;\r
  vec2 value = glint(lane, local);\r
\r
  float pixel = max(uScale.x, uScale.y);\r
  float seam = min(u, 1.0 - u) * uWidth;\r
  if (seam < pixel * 1.5) {\r
    float other = u < 0.5 ? lane - 1.0 : lane + 1.0;\r
    float blend = 0.5 * (1.0 - smoothstep(0.0, pixel * 1.5, seam));\r
    value = mix(value, glint(other, local), blend);\r
  }\r
\r
  vec2 toPointer = css - uPointer.xy;\r
  float near = exp(-dot(toPointer, toPointer) / (2.0 * uPointer.w * uPointer.w)) * uPointer.z;\r
  value *= 1.0 + near * 0.8;\r
  float hot = max(value.y - 0.18, 0.0);\r
  outColor = vec4(value.x, value.y, min(hot, 6.0), 1.0);\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uField;\r
uniform vec2 uResolution;\r
uniform vec3 uColor;\r
uniform vec3 uInk;\r
uniform float uGain;\r
uniform float uGlow;\r
uniform float uPresence;\r
uniform float uGrain;\r
uniform float uFade;\r
uniform float uOpacity;\r
uniform float uLightMode;\r
out vec4 outColor;\r
\r
float random(vec2 st) {\r
  return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453123);\r
}\r
\r
float grainNoise(vec2 st) {\r
  vec2 i = floor(st);\r
  vec2 f = fract(st);\r
  float a = random(i);\r
  float b = random(i + vec2(1.0, 0.0));\r
  float c = random(i + vec2(0.0, 1.0));\r
  float d = random(i + vec2(1.0, 1.0));\r
  vec2 u = f * f * (3.0 - 2.0 * f);\r
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;\r
}\r
\r
vec3 acesFilmic(vec3 color) {\r
  const mat3 inputMatrix = mat3(\r
    vec3(0.59719, 0.07600, 0.02840),\r
    vec3(0.35458, 0.90834, 0.13383),\r
    vec3(0.04823, 0.01566, 0.83777)\r
  );\r
  const mat3 outputMatrix = mat3(\r
    vec3(1.60475, -0.10208, -0.00327),\r
    vec3(-0.53108, 1.10813, -0.07276),\r
    vec3(-0.07367, -0.00605, 1.07602)\r
  );\r
  color = inputMatrix * (color / 0.6);\r
  vec3 a = color * (color + 0.0245786) - 0.000090537;\r
  vec3 b = color * (0.983729 * color + 0.4329510) + 0.238081;\r
  color = outputMatrix * (a / b);\r
  return clamp(color, 0.0, 1.0);\r
}\r
\r
vec3 toSrgb(vec3 color) {\r
  return mix(color * 12.92, 1.055 * pow(color, vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), color));\r
}\r
\r
float feather(float x, float edge) {\r
  float t = clamp(x / max(edge, 0.0001), 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uResolution;\r
  float radiance = textureLod(uField, uv, 0.0).r;\r
  float bloom = 0.0;\r
  bloom += textureLod(uField, uv, 2.0).b * 0.3;\r
  bloom += textureLod(uField, uv, 3.0).b * 0.3;\r
  bloom += textureLod(uField, uv, 4.0).b * 0.22;\r
  bloom += textureLod(uField, uv, 5.0).b * 0.18;\r
\r
  float hot = textureLod(uField, uv, 0.0).g;\r
  vec3 light = uColor * (radiance + bloom * uGlow) * uGain;\r
  light += mix(uColor, vec3(1.0), 0.7) * hot * hot * 0.12 * uGain;\r
  light *= uPresence;\r
  vec3 color = toSrgb(acesFilmic(light));\r
  color -= grainNoise(gl_FragCoord.xy) / 15.0 * uGrain;\r
  color = max(color, 0.0);\r
\r
  float edge = uFade * 0.5;\r
  float mask = feather(uv.x, edge) * feather(1.0 - uv.x, edge) * feather(uv.y, edge) * feather(1.0 - uv.y, edge);\r
  mask *= uOpacity;\r
  float dither = (random(gl_FragCoord.yx + 31.7) - 0.5) / 255.0;\r
\r
  float peak = max(color.r, max(color.g, color.b));\r
  if (uLightMode > 0.5) {\r
    float alpha = clamp(peak * 0.9 + dither, 0.0, 1.0) * mask;\r
    outColor = vec4(uInk * alpha, alpha);\r
  } else {\r
    color = clamp(color + dither, 0.0, 1.0) * mask;\r
    outColor = vec4(color, max(color.r, max(color.g, color.b)));\r
  }\r
}\`;\r
\r
const INTRO_SECONDS = 1.6;\r
const MAX_FIELD_PIXELS = 1600000;\r
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
  const vertex = compile(gl, gl.VERTEX_SHADER, QUAD_VERTEX);\r
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
  const uniforms: Record<string, WebGLUniformLocation | null> = {};\r
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
  for (let i = 0; i < count; i++) {\r
    const info = gl.getActiveUniform(program, i);\r
    if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
export const Beams = ({\r
  color = '#ffffff',\r
  beamWidth = 140,\r
  rotation = 30,\r
  speed = 1,\r
  waveLength = 233,\r
  depth = 1,\r
  sharpness = 0.6,\r
  twist = 0,\r
  fillLight = 0.3,\r
  glow = 0.6,\r
  brightness = 1.6,\r
  variation = 0,\r
  grain = 0.35,\r
  quality = 0.75,\r
  mouseInteraction = true,\r
  mouseStrength = 1,\r
  intro = true,\r
  fade = 0,\r
  opacity = 1,\r
  lightMode = false,\r
  backgroundColor,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  style,\r
  ...rest\r
}: BeamsProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings: Settings = {\r
    color: String(color),\r
    beamWidth: Math.max(8, beamWidth),\r
    rotation,\r
    speed,\r
    waveLength: Math.max(20, waveLength),\r
    depth: Math.max(0, depth),\r
    sharpness: clamp(sharpness, 0, 1),\r
    twist: clamp(twist, 0, 2),\r
    fillLight: clamp(fillLight, 0, 1.5),\r
    glow: Math.max(0, glow),\r
    brightness: Math.max(0, brightness),\r
    variation: Number(variation) || 0,\r
    grain: Math.max(0, grain),\r
    quality: clamp(quality, 0.25, 1),\r
    mouseInteraction,\r
    mouseStrength: Math.max(0, mouseStrength),\r
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
      stencil: false,\r
      powerPreference: 'high-performance'\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const floatTargets = !!gl.getExtension('EXT_color_buffer_float');\r
    const fieldProgram = link(gl, FIELD);\r
    const compositeProgram = link(gl, COMPOSITE);\r
    if (!fieldProgram || !compositeProgram) return undefined;\r
\r
    const buffer = gl.createBuffer();\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    let texture: WebGLTexture | null = null;\r
    const framebuffer = gl.createFramebuffer();\r
    const target = { width: 0, height: 0 };\r
    const sizeTarget = (width: number, height: number) => {\r
      if (target.width === width && target.height === height) return;\r
      target.width = width;\r
      target.height = height;\r
      if (texture) gl.deleteTexture(texture);\r
      texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      const levels = Math.floor(Math.log2(Math.max(width, height))) + 1;\r
      gl.texStorage2D(gl.TEXTURE_2D, levels, floatTargets ? gl.RGBA16F : gl.RGBA8, width, height);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
    };\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const colorCache = new Map<string, number[]>();\r
    const toLinear = (value: string): number[] => {\r
      const cached = colorCache.get(value);\r
      if (cached) return cached;\r
      let rgb = [1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#ffffff';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r, g, b].map(v => Math.pow(v / 255, 2.2));\r
      }\r
      colorCache.set(value, rgb);\r
      return rgb;\r
    };\r
\r
    const view = { width: 1, height: 1, fieldWidth: 1, fieldHeight: 1 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const state = {\r
      clock: 0,\r
      intro: settingsRef.current.intro && !reduce ? 0 : 1,\r
      reach: 0,\r
      x: 0,\r
      y: 0,\r
      lightY: 0\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const presence = state.intro * state.intro * state.intro * (state.intro * (state.intro * 6 - 15) + 10);\r
      gl.bindVertexArray(vao);\r
      sizeTarget(view.fieldWidth, view.fieldHeight);\r
\r
      const angle = (s.rotation * Math.PI) / 180;\r
      const sweep = (1 - presence) * -9;\r
      const reach = state.reach * s.mouseStrength;\r
      const f = fieldProgram.uniforms;\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.viewport(0, 0, target.width, target.height);\r
      gl.useProgram(fieldProgram.program);\r
      gl.uniform2f(f.uView, view.width, view.height);\r
      gl.uniform2f(f.uScale, view.width / target.width, view.height / target.height);\r
      gl.uniform2f(f.uTurn, Math.cos(angle), Math.sin(angle));\r
      gl.uniform1f(f.uTime, (state.clock * 0.12) % 289);\r
      gl.uniform1f(f.uWidth, s.beamWidth);\r
      gl.uniform1f(f.uWave, s.waveLength);\r
      gl.uniform1f(f.uDepth, s.depth);\r
      gl.uniform1f(f.uRough, 0.55 - s.sharpness * 0.5);\r
      gl.uniform1f(f.uSeed, s.variation);\r
      gl.uniform1f(f.uTwist, s.twist);\r
      gl.uniform1f(f.uFill, s.fillLight);\r
      gl.uniform3f(f.uLight, 0, 3 + sweep + state.lightY * reach, 10);\r
      gl.uniform1f(f.uCamera, view.height * 1.866);\r
      gl.uniform4f(f.uPointer, state.x, view.height - state.y, reach, Math.max(view.height, view.width) * 0.28);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.generateMipmap(gl.TEXTURE_2D);\r
\r
      const c = compositeProgram.uniforms;\r
      const tint = toLinear(s.color);\r
      const tone = 0.2126 * tint[0] + 0.7152 * tint[1] + 0.0722 * tint[2];\r
      const shadeDepth = Math.min(1, 0.18 / Math.max(tone, 0.001));\r
      const ink = tint.map(v => Math.pow(Math.min(1, v * shadeDepth), 1 / 2.2));\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(compositeProgram.program);\r
      gl.uniform2f(c.uResolution, canvas.width, canvas.height);\r
      gl.uniform3fv(c.uColor, tint);\r
      gl.uniform3fv(c.uInk, ink);\r
      gl.uniform1f(c.uGain, s.brightness);\r
      gl.uniform1f(c.uGlow, s.glow);\r
      gl.uniform1f(c.uPresence, presence);\r
      gl.uniform1f(c.uGrain, s.grain * 1.75);\r
      gl.uniform1f(c.uFade, s.fade);\r
      gl.uniform1f(c.uOpacity, s.opacity);\r
      gl.uniform1f(c.uLightMode, s.lightMode ? 1 : 0);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.uniform1i(c.uField, 0);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const moving = !s.paused && !reduce;\r
      if (moving) state.clock += dt * s.speed;\r
      if (!s.intro || reduce) state.intro = 1;\r
      else if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / INTRO_SECONDS);\r
\r
      const engaged = s.mouseInteraction && pointer.inside && !reduce;\r
      if (engaged && state.reach < 0.01) {\r
        state.x = pointer.x;\r
        state.y = pointer.y;\r
      }\r
      const follow = 1 - Math.exp(-dt * 7);\r
      state.x += (pointer.x - state.x) * follow;\r
      state.y += (pointer.y - state.y) * follow;\r
      state.reach += ((engaged ? 1 : 0) - state.reach) * (1 - Math.exp(-dt * (engaged ? 3.2 : 1.8)));\r
      const turn = (s.rotation * Math.PI) / 180;\r
      const offsetX = state.x - view.width / 2;\r
      const offsetY = view.height / 2 - state.y;\r
      const along = -Math.sin(turn) * offsetX + Math.cos(turn) * offsetY;\r
      state.lightY = clamp((along / (view.height * 0.5)) * 3, -4, 4);\r
      render();\r
\r
      const settling =\r
        state.intro < 1 ||\r
        Math.abs((engaged ? 1 : 0) - state.reach) > 0.002 ||\r
        Math.abs(pointer.x - state.x) + Math.abs(pointer.y - state.y) > 0.3;\r
      if (moving || settling) raf = requestAnimationFrame(frame);\r
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
      view.width = width;\r
      view.height = height;\r
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      let fieldScale = s.quality * ratio;\r
      if (width * height * fieldScale * fieldScale > MAX_FIELD_PIXELS) {\r
        fieldScale = Math.sqrt(MAX_FIELD_PIXELS / (width * height));\r
      }\r
      view.fieldWidth = Math.max(1, Math.round(width * fieldScale));\r
      view.fieldHeight = Math.max(1, Math.round(height * fieldScale));\r
      if (!raf) render();\r
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
    let lastQuality = settingsRef.current.quality;\r
    let lastDpr = settingsRef.current.dpr;\r
    wakeRef.current = () => {\r
      const s = settingsRef.current;\r
      if (s.quality !== lastQuality || s.dpr !== lastDpr) {\r
        lastQuality = s.quality;\r
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
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      if (texture) gl.deleteTexture(texture);\r
      gl.deleteFramebuffer(framebuffer);\r
      gl.deleteProgram(fieldProgram.program);\r
      gl.deleteProgram(compositeProgram.program);\r
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
      className={\`beams-container\${className ? \` \${className}\` : ''}\`}\r
      style={backgroundColor ? { background: backgroundColor, ...style } : style}\r
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className="beams-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Beams;\r
`,o=`'use client';\r
\r
import { useEffect, useRef, type HTMLAttributes } from 'react';\r
\r
export interface BeamsProps extends HTMLAttributes<HTMLDivElement> {\r
  color?: string;\r
  beamWidth?: number;\r
  rotation?: number;\r
  speed?: number;\r
  waveLength?: number;\r
  depth?: number;\r
  sharpness?: number;\r
  twist?: number;\r
  fillLight?: number;\r
  glow?: number;\r
  brightness?: number;\r
  variation?: number;\r
  grain?: number;\r
  quality?: number;\r
  mouseInteraction?: boolean;\r
  mouseStrength?: number;\r
  intro?: boolean;\r
  fade?: number;\r
  opacity?: number;\r
  lightMode?: boolean;\r
  backgroundColor?: string;\r
  paused?: boolean;\r
  dpr?: number;\r
  className?: string;\r
}\r
\r
type Settings = {\r
  color: string;\r
  beamWidth: number;\r
  rotation: number;\r
  speed: number;\r
  waveLength: number;\r
  depth: number;\r
  sharpness: number;\r
  twist: number;\r
  fillLight: number;\r
  glow: number;\r
  brightness: number;\r
  variation: number;\r
  grain: number;\r
  quality: number;\r
  mouseInteraction: boolean;\r
  mouseStrength: number;\r
  intro: boolean;\r
  fade: number;\r
  opacity: number;\r
  lightMode: boolean;\r
  paused: boolean;\r
  dpr?: number;\r
};\r
\r
type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };\r
\r
const QUAD_VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const FIELD = \`#version 300 es\r
precision highp float;\r
uniform vec2 uView;\r
uniform vec2 uScale;\r
uniform vec2 uTurn;\r
uniform float uTime;\r
uniform float uWidth;\r
uniform float uWave;\r
uniform float uDepth;\r
uniform float uRough;\r
uniform float uSeed;\r
uniform float uTwist;\r
uniform vec3 uLight;\r
uniform float uFill;\r
uniform float uCamera;\r
uniform vec4 uPointer;\r
out vec4 outColor;\r
\r
const float PI = 3.141592653589793;\r
\r
vec4 permute(vec4 x) {\r
  return mod(((x * 34.0) + 1.0) * x, 289.0);\r
}\r
\r
vec4 taylorInvSqrt(vec4 r) {\r
  return 1.79284291400159 - 0.85373472095314 * r;\r
}\r
\r
vec3 fade(vec3 t) {\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
float cnoise(vec3 P) {\r
  vec3 Pi0 = floor(P);\r
  vec3 Pi1 = Pi0 + vec3(1.0);\r
  Pi0 = mod(Pi0, 289.0);\r
  Pi1 = mod(Pi1, 289.0);\r
  vec3 Pf0 = fract(P);\r
  vec3 Pf1 = Pf0 - vec3(1.0);\r
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);\r
  vec4 iy = vec4(Pi0.yy, Pi1.yy);\r
  vec4 iz0 = Pi0.zzzz;\r
  vec4 iz1 = Pi1.zzzz;\r
  vec4 ixy = permute(permute(ix) + iy);\r
  vec4 ixy0 = permute(ixy + iz0);\r
  vec4 ixy1 = permute(ixy + iz1);\r
  vec4 gx0 = ixy0 / 7.0;\r
  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;\r
  gx0 = fract(gx0);\r
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);\r
  vec4 sz0 = step(gz0, vec4(0.0));\r
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);\r
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);\r
  vec4 gx1 = ixy1 / 7.0;\r
  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;\r
  gx1 = fract(gx1);\r
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);\r
  vec4 sz1 = step(gz1, vec4(0.0));\r
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);\r
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);\r
  vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);\r
  vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);\r
  vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);\r
  vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);\r
  vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);\r
  vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);\r
  vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);\r
  vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);\r
  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));\r
  g000 *= norm0.x;\r
  g010 *= norm0.y;\r
  g100 *= norm0.z;\r
  g110 *= norm0.w;\r
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));\r
  g001 *= norm1.x;\r
  g011 *= norm1.y;\r
  g101 *= norm1.z;\r
  g111 *= norm1.w;\r
  float n000 = dot(g000, Pf0);\r
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));\r
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));\r
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));\r
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));\r
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));\r
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));\r
  float n111 = dot(g111, Pf1);\r
  vec3 fade_xyz = fade(Pf0);\r
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);\r
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);\r
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);\r
  return 2.2 * n_xyz;\r
}\r
\r
float laneHash(float lane) {\r
  return fract(sin(lane * 91.3458 + uSeed * 17.17) * 47453.5453);\r
}\r
\r
float lobe(float nh, float nl, float nv, float vh, float roughness) {\r
  float a = roughness * roughness;\r
  float a2 = a * a;\r
  float d = nh * nh * (a2 - 1.0) + 1.0;\r
  float distribution = a2 / (PI * d * d);\r
  float gv = nl * sqrt(nv * nv * (1.0 - a2) + a2);\r
  float gl = nv * sqrt(nl * nl * (1.0 - a2) + a2);\r
  float visibility = 0.5 / max(gv + gl, 0.0001);\r
  float fresnel = 0.028 + 0.972 * pow(1.0 - vh, 5.0);\r
  return distribution * visibility * fresnel * nl;\r
}\r
\r
vec2 glint(float lane, vec2 local) {\r
  float along = local.y / uWave - laneHash(lane) * 60.0;\r
  float step = 0.01;\r
  float slope = (cnoise(vec3(0.0, along + step, uTime)) - cnoise(vec3(0.0, along - step, uTime))) / (2.0 * step);\r
  slope *= 0.2 * uDepth;\r
  float spin = laneHash(lane + 0.37);\r
  float tilt = ((spin - 0.5) * 0.5 + sin(uTime * 2.1 + spin * 6.2831) * 0.06) * uTwist;\r
  vec3 normal = normalize(vec3(tilt, -slope, 1.0));\r
  vec3 view = normalize(vec3(-local, uCamera));\r
  float nv = max(dot(normal, view), 0.0001);\r
  vec3 light = normalize(uLight);\r
  vec3 halfway = normalize(light + view);\r
  float core = lobe(max(dot(normal, halfway), 0.0), max(dot(normal, light), 0.0), nv, max(dot(view, halfway), 0.0), uRough);\r
  vec3 fill = normalize(vec3(0.0, -uLight.y * 1.25, uLight.z));\r
  vec3 fillHalf = normalize(fill + view);\r
  core += uFill * lobe(max(dot(normal, fillHalf), 0.0), max(dot(normal, fill), 0.0), nv, max(dot(view, fillHalf), 0.0), uRough);\r
  return vec2(core, core);\r
}\r
\r
void main() {\r
  vec2 css = gl_FragCoord.xy * uScale;\r
  vec2 centered = css - uView * 0.5;\r
  vec2 local = mat2(uTurn.x, -uTurn.y, uTurn.y, uTurn.x) * centered;\r
\r
  float across = local.x / uWidth + 0.5;\r
  float lane = floor(across);\r
  float u = across - lane;\r
  vec2 value = glint(lane, local);\r
\r
  float pixel = max(uScale.x, uScale.y);\r
  float seam = min(u, 1.0 - u) * uWidth;\r
  if (seam < pixel * 1.5) {\r
    float other = u < 0.5 ? lane - 1.0 : lane + 1.0;\r
    float blend = 0.5 * (1.0 - smoothstep(0.0, pixel * 1.5, seam));\r
    value = mix(value, glint(other, local), blend);\r
  }\r
\r
  vec2 toPointer = css - uPointer.xy;\r
  float near = exp(-dot(toPointer, toPointer) / (2.0 * uPointer.w * uPointer.w)) * uPointer.z;\r
  value *= 1.0 + near * 0.8;\r
  float hot = max(value.y - 0.18, 0.0);\r
  outColor = vec4(value.x, value.y, min(hot, 6.0), 1.0);\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uField;\r
uniform vec2 uResolution;\r
uniform vec3 uColor;\r
uniform vec3 uInk;\r
uniform float uGain;\r
uniform float uGlow;\r
uniform float uPresence;\r
uniform float uGrain;\r
uniform float uFade;\r
uniform float uOpacity;\r
uniform float uLightMode;\r
out vec4 outColor;\r
\r
float random(vec2 st) {\r
  return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453123);\r
}\r
\r
float grainNoise(vec2 st) {\r
  vec2 i = floor(st);\r
  vec2 f = fract(st);\r
  float a = random(i);\r
  float b = random(i + vec2(1.0, 0.0));\r
  float c = random(i + vec2(0.0, 1.0));\r
  float d = random(i + vec2(1.0, 1.0));\r
  vec2 u = f * f * (3.0 - 2.0 * f);\r
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;\r
}\r
\r
vec3 acesFilmic(vec3 color) {\r
  const mat3 inputMatrix = mat3(\r
    vec3(0.59719, 0.07600, 0.02840),\r
    vec3(0.35458, 0.90834, 0.13383),\r
    vec3(0.04823, 0.01566, 0.83777)\r
  );\r
  const mat3 outputMatrix = mat3(\r
    vec3(1.60475, -0.10208, -0.00327),\r
    vec3(-0.53108, 1.10813, -0.07276),\r
    vec3(-0.07367, -0.00605, 1.07602)\r
  );\r
  color = inputMatrix * (color / 0.6);\r
  vec3 a = color * (color + 0.0245786) - 0.000090537;\r
  vec3 b = color * (0.983729 * color + 0.4329510) + 0.238081;\r
  color = outputMatrix * (a / b);\r
  return clamp(color, 0.0, 1.0);\r
}\r
\r
vec3 toSrgb(vec3 color) {\r
  return mix(color * 12.92, 1.055 * pow(color, vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), color));\r
}\r
\r
float feather(float x, float edge) {\r
  float t = clamp(x / max(edge, 0.0001), 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uResolution;\r
  float radiance = textureLod(uField, uv, 0.0).r;\r
  float bloom = 0.0;\r
  bloom += textureLod(uField, uv, 2.0).b * 0.3;\r
  bloom += textureLod(uField, uv, 3.0).b * 0.3;\r
  bloom += textureLod(uField, uv, 4.0).b * 0.22;\r
  bloom += textureLod(uField, uv, 5.0).b * 0.18;\r
\r
  float hot = textureLod(uField, uv, 0.0).g;\r
  vec3 light = uColor * (radiance + bloom * uGlow) * uGain;\r
  light += mix(uColor, vec3(1.0), 0.7) * hot * hot * 0.12 * uGain;\r
  light *= uPresence;\r
  vec3 color = toSrgb(acesFilmic(light));\r
  color -= grainNoise(gl_FragCoord.xy) / 15.0 * uGrain;\r
  color = max(color, 0.0);\r
\r
  float edge = uFade * 0.5;\r
  float mask = feather(uv.x, edge) * feather(1.0 - uv.x, edge) * feather(uv.y, edge) * feather(1.0 - uv.y, edge);\r
  mask *= uOpacity;\r
  float dither = (random(gl_FragCoord.yx + 31.7) - 0.5) / 255.0;\r
\r
  float peak = max(color.r, max(color.g, color.b));\r
  if (uLightMode > 0.5) {\r
    float alpha = clamp(peak * 0.9 + dither, 0.0, 1.0) * mask;\r
    outColor = vec4(uInk * alpha, alpha);\r
  } else {\r
    color = clamp(color + dither, 0.0, 1.0) * mask;\r
    outColor = vec4(color, max(color.r, max(color.g, color.b)));\r
  }\r
}\`;\r
\r
const INTRO_SECONDS = 1.6;\r
const MAX_FIELD_PIXELS = 1600000;\r
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
  const vertex = compile(gl, gl.VERTEX_SHADER, QUAD_VERTEX);\r
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
  const uniforms: Record<string, WebGLUniformLocation | null> = {};\r
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
  for (let i = 0; i < count; i++) {\r
    const info = gl.getActiveUniform(program, i);\r
    if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
export const Beams = ({\r
  color = '#ffffff',\r
  beamWidth = 140,\r
  rotation = 30,\r
  speed = 1,\r
  waveLength = 233,\r
  depth = 1,\r
  sharpness = 0.6,\r
  twist = 0,\r
  fillLight = 0.3,\r
  glow = 0.6,\r
  brightness = 1.6,\r
  variation = 0,\r
  grain = 0.35,\r
  quality = 0.75,\r
  mouseInteraction = true,\r
  mouseStrength = 1,\r
  intro = true,\r
  fade = 0,\r
  opacity = 1,\r
  lightMode = false,\r
  backgroundColor,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  style,\r
  ...rest\r
}: BeamsProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings: Settings = {\r
    color: String(color),\r
    beamWidth: Math.max(8, beamWidth),\r
    rotation,\r
    speed,\r
    waveLength: Math.max(20, waveLength),\r
    depth: Math.max(0, depth),\r
    sharpness: clamp(sharpness, 0, 1),\r
    twist: clamp(twist, 0, 2),\r
    fillLight: clamp(fillLight, 0, 1.5),\r
    glow: Math.max(0, glow),\r
    brightness: Math.max(0, brightness),\r
    variation: Number(variation) || 0,\r
    grain: Math.max(0, grain),\r
    quality: clamp(quality, 0.25, 1),\r
    mouseInteraction,\r
    mouseStrength: Math.max(0, mouseStrength),\r
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
      stencil: false,\r
      powerPreference: 'high-performance'\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const floatTargets = !!gl.getExtension('EXT_color_buffer_float');\r
    const fieldProgram = link(gl, FIELD);\r
    const compositeProgram = link(gl, COMPOSITE);\r
    if (!fieldProgram || !compositeProgram) return undefined;\r
\r
    const buffer = gl.createBuffer();\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    let texture: WebGLTexture | null = null;\r
    const framebuffer = gl.createFramebuffer();\r
    const target = { width: 0, height: 0 };\r
    const sizeTarget = (width: number, height: number) => {\r
      if (target.width === width && target.height === height) return;\r
      target.width = width;\r
      target.height = height;\r
      if (texture) gl.deleteTexture(texture);\r
      texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      const levels = Math.floor(Math.log2(Math.max(width, height))) + 1;\r
      gl.texStorage2D(gl.TEXTURE_2D, levels, floatTargets ? gl.RGBA16F : gl.RGBA8, width, height);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
    };\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const colorCache = new Map<string, number[]>();\r
    const toLinear = (value: string): number[] => {\r
      const cached = colorCache.get(value);\r
      if (cached) return cached;\r
      let rgb = [1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#ffffff';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r, g, b].map(v => Math.pow(v / 255, 2.2));\r
      }\r
      colorCache.set(value, rgb);\r
      return rgb;\r
    };\r
\r
    const view = { width: 1, height: 1, fieldWidth: 1, fieldHeight: 1 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const state = {\r
      clock: 0,\r
      intro: settingsRef.current.intro && !reduce ? 0 : 1,\r
      reach: 0,\r
      x: 0,\r
      y: 0,\r
      lightY: 0\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const presence = state.intro * state.intro * state.intro * (state.intro * (state.intro * 6 - 15) + 10);\r
      gl.bindVertexArray(vao);\r
      sizeTarget(view.fieldWidth, view.fieldHeight);\r
\r
      const angle = (s.rotation * Math.PI) / 180;\r
      const sweep = (1 - presence) * -9;\r
      const reach = state.reach * s.mouseStrength;\r
      const f = fieldProgram.uniforms;\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.viewport(0, 0, target.width, target.height);\r
      gl.useProgram(fieldProgram.program);\r
      gl.uniform2f(f.uView, view.width, view.height);\r
      gl.uniform2f(f.uScale, view.width / target.width, view.height / target.height);\r
      gl.uniform2f(f.uTurn, Math.cos(angle), Math.sin(angle));\r
      gl.uniform1f(f.uTime, (state.clock * 0.12) % 289);\r
      gl.uniform1f(f.uWidth, s.beamWidth);\r
      gl.uniform1f(f.uWave, s.waveLength);\r
      gl.uniform1f(f.uDepth, s.depth);\r
      gl.uniform1f(f.uRough, 0.55 - s.sharpness * 0.5);\r
      gl.uniform1f(f.uSeed, s.variation);\r
      gl.uniform1f(f.uTwist, s.twist);\r
      gl.uniform1f(f.uFill, s.fillLight);\r
      gl.uniform3f(f.uLight, 0, 3 + sweep + state.lightY * reach, 10);\r
      gl.uniform1f(f.uCamera, view.height * 1.866);\r
      gl.uniform4f(f.uPointer, state.x, view.height - state.y, reach, Math.max(view.height, view.width) * 0.28);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.generateMipmap(gl.TEXTURE_2D);\r
\r
      const c = compositeProgram.uniforms;\r
      const tint = toLinear(s.color);\r
      const tone = 0.2126 * tint[0] + 0.7152 * tint[1] + 0.0722 * tint[2];\r
      const shadeDepth = Math.min(1, 0.18 / Math.max(tone, 0.001));\r
      const ink = tint.map(v => Math.pow(Math.min(1, v * shadeDepth), 1 / 2.2));\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(compositeProgram.program);\r
      gl.uniform2f(c.uResolution, canvas.width, canvas.height);\r
      gl.uniform3fv(c.uColor, tint);\r
      gl.uniform3fv(c.uInk, ink);\r
      gl.uniform1f(c.uGain, s.brightness);\r
      gl.uniform1f(c.uGlow, s.glow);\r
      gl.uniform1f(c.uPresence, presence);\r
      gl.uniform1f(c.uGrain, s.grain * 1.75);\r
      gl.uniform1f(c.uFade, s.fade);\r
      gl.uniform1f(c.uOpacity, s.opacity);\r
      gl.uniform1f(c.uLightMode, s.lightMode ? 1 : 0);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.uniform1i(c.uField, 0);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const moving = !s.paused && !reduce;\r
      if (moving) state.clock += dt * s.speed;\r
      if (!s.intro || reduce) state.intro = 1;\r
      else if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / INTRO_SECONDS);\r
\r
      const engaged = s.mouseInteraction && pointer.inside && !reduce;\r
      if (engaged && state.reach < 0.01) {\r
        state.x = pointer.x;\r
        state.y = pointer.y;\r
      }\r
      const follow = 1 - Math.exp(-dt * 7);\r
      state.x += (pointer.x - state.x) * follow;\r
      state.y += (pointer.y - state.y) * follow;\r
      state.reach += ((engaged ? 1 : 0) - state.reach) * (1 - Math.exp(-dt * (engaged ? 3.2 : 1.8)));\r
      const turn = (s.rotation * Math.PI) / 180;\r
      const offsetX = state.x - view.width / 2;\r
      const offsetY = view.height / 2 - state.y;\r
      const along = -Math.sin(turn) * offsetX + Math.cos(turn) * offsetY;\r
      state.lightY = clamp((along / (view.height * 0.5)) * 3, -4, 4);\r
      render();\r
\r
      const settling =\r
        state.intro < 1 ||\r
        Math.abs((engaged ? 1 : 0) - state.reach) > 0.002 ||\r
        Math.abs(pointer.x - state.x) + Math.abs(pointer.y - state.y) > 0.3;\r
      if (moving || settling) raf = requestAnimationFrame(frame);\r
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
      view.width = width;\r
      view.height = height;\r
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      let fieldScale = s.quality * ratio;\r
      if (width * height * fieldScale * fieldScale > MAX_FIELD_PIXELS) {\r
        fieldScale = Math.sqrt(MAX_FIELD_PIXELS / (width * height));\r
      }\r
      view.fieldWidth = Math.max(1, Math.round(width * fieldScale));\r
      view.fieldHeight = Math.max(1, Math.round(height * fieldScale));\r
      if (!raf) render();\r
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
    let lastQuality = settingsRef.current.quality;\r
    let lastDpr = settingsRef.current.dpr;\r
    wakeRef.current = () => {\r
      const s = settingsRef.current;\r
      if (s.quality !== lastQuality || s.dpr !== lastDpr) {\r
        lastQuality = s.quality;\r
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
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      if (texture) gl.deleteTexture(texture);\r
      gl.deleteFramebuffer(framebuffer);\r
      gl.deleteProgram(fieldProgram.program);\r
      gl.deleteProgram(compositeProgram.program);\r
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
      style={backgroundColor ? { background: backgroundColor, ...style } : style}\r
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Beams;\r
`,a={usage:`import Beams from './Beams';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <Beams
    color="#ffffff"
    beamWidth={140}
    rotation={30}
    speed={1}
    glow={0.6}
  />
</div>`,code:r,css:n,tailwind:e,tsCode:t,tsTailwind:o};export{a as beams};
