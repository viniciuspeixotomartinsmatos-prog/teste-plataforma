const r=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
import './PlasmaWave.css';\r
\r
const QUAD_VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const COMMON = \`#version 300 es\r
precision highp float;\r
const float PI = 3.14159265;\r
const float TAU = 6.28318531;\r
const float HALF_PI = 1.5707963;\r
\`;\r
\r
const TRACE = \`\r
uniform vec2 uView;\r
uniform vec2 uOffset;\r
uniform float uRotation;\r
uniform float uFocalLength;\r
uniform float uTime;\r
uniform float uSpeed1;\r
uniform float uSpeed2;\r
uniform float uDir2;\r
uniform float uBend1;\r
uniform float uBend2;\r
uniform float uThickness;\r
uniform vec3 uHeat;\r
uniform vec3 uColor1;\r
uniform vec3 uColor2;\r
uniform float uCore;\r
uniform float uRange;\r
\r
vec4 traceLight(vec2 pixel) {\r
  vec2 coord = pixel + uOffset - 0.5 * uView;\r
  float c = cos(uRotation);\r
  float sn = sin(uRotation);\r
  coord = mat2(c, -sn, sn, c) * coord;\r
  vec3 u = normalize(vec3(coord / uView.y, uFocalLength));\r
  vec3 o = vec3(0.0, 0.0, -7.0);\r
  float t = uTime * PI;\r
  float t1 = t * 0.7;\r
  float t2 = t * 0.9;\r
  float tSpeed1 = t * uSpeed1;\r
  float tSpeed2 = t * uSpeed2 * uDir2;\r
  float s = 1.0;\r
  float d = 0.0;\r
  vec2 k = vec2(0.0);\r
  for (int i = 0; i < 14; ++i) {\r
    vec3 p = o + u * d;\r
    p.x -= 15.0;\r
    float px = p.x;\r
    float swell = uHeat.y * exp(-pow((px - uHeat.x) / uHeat.z, 2.0));\r
    float wob1 = uBend1 + swell * (0.16 + 0.2 * uBend1) + sin(t1 + px * 0.8) * 0.1;\r
    float wob2 = uBend2 + swell * (0.16 + 0.2 * uBend2) + cos(t2 + px * 1.1) * 0.1;\r
    vec2 a = sin(vec2(px, px + HALF_PI) + tSpeed1) * wob1;\r
    vec2 b = cos(vec2(px, px + HALF_PI) + tSpeed2) * wob2;\r
    float cut = px + uThickness;\r
    k.x = max(cut, length(p.yz - a) - uThickness);\r
    k.y = max(cut, length(p.yz - b) - uThickness);\r
    s = min(s, min(k.x, k.y));\r
    if (s < 0.001 || d > 300.0) break;\r
    d += s * 0.7;\r
  }\r
  vec3 raw = max(cos(d * TAU) - s * sqrt(d) - vec3(k, 0.0), 0.0);\r
  float field = max(raw.r, max(raw.g, raw.b));\r
  raw.gb += 0.1;\r
  raw = raw * 0.4 + raw.brg * 0.6 + raw * raw;\r
  float lum = dot(raw, vec3(0.299, 0.587, 0.114));\r
  float w1 = max(0.0, 1.0 - k.x * 2.0) + 0.0001;\r
  float w2 = max(0.0, 1.0 - k.y * 2.0) + 0.0001;\r
  vec3 base = (uColor1 * w1 + uColor2 * w2) / (w1 + w2);\r
  float soft = smoothstep(0.03, 0.36, field);\r
  float hot = smoothstep(0.32, 0.8, field);\r
  vec3 light = base * lum * 2.6 * soft + mix(base, vec3(1.0), 0.55) * hot * uCore * 2.0;\r
  return vec4(light * uRange, field);\r
}\r
\`;\r
\r
const COARSE = \`\${COMMON}\r
\${TRACE}\r
uniform vec2 uScale;\r
out vec4 outColor;\r
void main() {\r
  outColor = traceLight(gl_FragCoord.xy * uScale);\r
}\`;\r
\r
const FINE = \`\${COMMON}\r
\${TRACE}\r
uniform vec2 uScale;\r
uniform sampler2D uCoarse;\r
uniform vec2 uCoarseSize;\r
uniform vec2 uFineSize;\r
out vec4 outColor;\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uFineSize;\r
  vec2 pos = uv * uCoarseSize - 0.5;\r
  ivec2 cell = ivec2(floor(pos));\r
  ivec2 last = ivec2(uCoarseSize) - 1;\r
  float a = texelFetch(uCoarse, clamp(cell, ivec2(0), last), 0).a;\r
  float b = texelFetch(uCoarse, clamp(cell + ivec2(1, 0), ivec2(0), last), 0).a;\r
  float c = texelFetch(uCoarse, clamp(cell + ivec2(0, 1), ivec2(0), last), 0).a;\r
  float d = texelFetch(uCoarse, clamp(cell + ivec2(1, 1), ivec2(0), last), 0).a;\r
  float high = max(max(a, b), max(c, d));\r
  float low = min(min(a, b), min(c, d));\r
  if (high > 0.02 && low < 0.4) outColor = traceLight(gl_FragCoord.xy * uScale);\r
  else outColor = texture(uCoarse, uv);\r
}\`;\r
\r
const DOWN = \`\${COMMON}\r
uniform sampler2D uSource;\r
uniform vec2 uTexel;\r
uniform vec2 uTarget;\r
out vec4 outColor;\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uTarget;\r
  vec4 sum = texture(uSource, uv) * 4.0;\r
  sum += texture(uSource, uv - uTexel);\r
  sum += texture(uSource, uv + uTexel);\r
  sum += texture(uSource, uv + vec2(uTexel.x, -uTexel.y));\r
  sum += texture(uSource, uv - vec2(uTexel.x, -uTexel.y));\r
  outColor = sum / 8.0;\r
}\`;\r
\r
const UP = \`\${COMMON}\r
uniform sampler2D uSource;\r
uniform sampler2D uBase;\r
uniform vec2 uTexel;\r
uniform vec2 uTarget;\r
out vec4 outColor;\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uTarget;\r
  vec2 h = uTexel * 0.5;\r
  vec4 sum = texture(uSource, uv + vec2(-h.x * 2.0, 0.0));\r
  sum += texture(uSource, uv + vec2(h.x * 2.0, 0.0));\r
  sum += texture(uSource, uv + vec2(0.0, -h.y * 2.0));\r
  sum += texture(uSource, uv + vec2(0.0, h.y * 2.0));\r
  sum += texture(uSource, uv + vec2(-h.x, h.y)) * 2.0;\r
  sum += texture(uSource, uv + h) * 2.0;\r
  sum += texture(uSource, uv + vec2(h.x, -h.y)) * 2.0;\r
  sum += texture(uSource, uv - h) * 2.0;\r
  outColor = sum / 12.0 + texture(uBase, uv);\r
}\`;\r
\r
const COMPOSITE = \`\${COMMON}\r
uniform sampler2D uLight;\r
uniform sampler2D uBloom;\r
uniform vec2 uResolution;\r
uniform float uExposure;\r
uniform float uGlow;\r
uniform float uCore;\r
uniform float uPresence;\r
uniform float uGrain;\r
uniform float uFade;\r
uniform float uOpacity;\r
uniform float uTime;\r
uniform float uLightMode;\r
uniform vec3 uLens;\r
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
  vec2 uv = gl_FragCoord.xy / uResolution;\r
  vec2 offset = gl_FragCoord.xy - uLens.xy;\r
  float lens = uLens.z * exp(-dot(offset, offset) / (uResolution.y * uResolution.y * 0.045));\r
  vec4 source = texture(uLight, uv);\r
  vec3 hdr = source.rgb * uExposure * uPresence * (1.0 + lens * 0.35);\r
  hdr += texture(uBloom, uv).rgb * uExposure * uPresence * uGlow * (0.18 + lens * 0.08);\r
  float edge = uFade * 0.5;\r
  float mask = smootherstep(edge, uv.x) * smootherstep(edge, 1.0 - uv.x) * smootherstep(edge, uv.y) * smootherstep(edge, 1.0 - uv.y);\r
  float grain = (hash(gl_FragCoord.xy + fract(uTime * 7.31) * 113.0) - 0.5) * uGrain;\r
  float peak = max(hdr.r, max(hdr.g, hdr.b));\r
  if (uLightMode > 0.5) {\r
    vec3 hue = hdr / max(peak, 0.0001);\r
    float tone = dot(hue, vec3(0.2126, 0.7152, 0.0722));\r
    vec3 ink = pow(clamp(hue * min(1.0, 0.6 / max(tone, 0.001)), 0.0, 1.0), vec3(1.0 / 2.2));\r
    float feather = max(fwidth(source.a) * 1.25, 0.02);\r
    float body = smoothstep(0.15 - feather, 0.15 + feather, source.a) * uPresence;\r
    vec3 color = mix(ink, vec3(1.0), smoothstep(12.0, 26.0, peak) * uCore);\r
    float halo = (1.0 - exp(-peak * 0.5)) * 0.3 * min(uGlow, 1.5);\r
    float alpha = clamp(body * 0.92 + (1.0 - body) * halo, 0.0, 1.0) * mask * uOpacity;\r
    color = mix(ink, color, body);\r
    outColor = vec4(clamp(color + grain, 0.0, 1.0) * alpha, alpha);\r
  } else {\r
    vec3 mapped = 1.0 - exp(-hdr);\r
    float level = max(mapped.r, max(mapped.g, mapped.b));\r
    mapped = clamp(mapped + grain * level, 0.0, 1.0) * mask * uOpacity;\r
    outColor = vec4(mapped, max(mapped.r, max(mapped.g, mapped.b)));\r
  }\r
}\`;\r
\r
const BLOOM_LEVELS = 4;\r
const COARSE_RATIO = 3;\r
const INTRO_SECONDS = 1.8;\r
const MAX_LIGHT_PIXELS = 2400000;\r
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
export default function PlasmaWave({\r
  colors = ['#A855F7', '#06B6D4'],\r
  speed = 1,\r
  speed1 = 0.05,\r
  speed2 = 0.05,\r
  dir2 = 1,\r
  bend1 = 1,\r
  bend2 = 0.5,\r
  thickness = 0.3,\r
  focalLength = 1.25,\r
  rotationDeg = 0,\r
  xOffset = 0,\r
  yOffset = 0,\r
  brightness = 1,\r
  glow = 1,\r
  core = 0.6,\r
  grain = 0.03,\r
  quality = 1,\r
  mouseInteraction = true,\r
  intro = true,\r
  fade = 0,\r
  opacity = 1,\r
  lightMode = false,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  ...rest\r
}) {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settings = {\r
    color1: String(colors?.[0] ?? '#A855F7'),\r
    color2: String(colors?.[1] ?? colors?.[0] ?? '#06B6D4'),\r
    speed,\r
    speed1,\r
    speed2,\r
    dir2,\r
    bend1,\r
    bend2,\r
    thickness: Math.max(0.02, thickness),\r
    focalLength: Math.max(0.05, focalLength),\r
    rotation: (rotationDeg * Math.PI) / 180,\r
    xOffset,\r
    yOffset,\r
    brightness: Math.max(0, brightness),\r
    glow: Math.max(0, glow),\r
    core: clamp(core, 0, 1),\r
    grain: Math.max(0, grain),\r
    quality: clamp(quality, 0.25, 1),\r
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
      stencil: false,\r
      powerPreference: 'high-performance'\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const floatTargets = !!gl.getExtension('EXT_color_buffer_float');\r
    const range = floatTargets ? 1 : 0.25;\r
    const programs = {\r
      coarse: link(gl, COARSE),\r
      fine: link(gl, FINE),\r
      down: link(gl, DOWN),\r
      up: link(gl, UP),\r
      composite: link(gl, COMPOSITE)\r
    };\r
    if (Object.values(programs).some(entry => !entry)) return undefined;\r
\r
    const buffer = gl.createBuffer();\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const createTarget = () => ({\r
      texture: gl.createTexture(),\r
      framebuffer: gl.createFramebuffer(),\r
      width: 0,\r
      height: 0\r
    });\r
    const sizeTarget = (target, width, height) => {\r
      if (target.width === width && target.height === height) return;\r
      target.width = width;\r
      target.height = height;\r
      gl.bindTexture(gl.TEXTURE_2D, target.texture);\r
      if (floatTargets) {\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.HALF_FLOAT, null);\r
      } else {\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
      }\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target.texture, 0);\r
    };\r
    const coarse = createTarget();\r
    const fine = createTarget();\r
    const down = Array.from({ length: BLOOM_LEVELS + 1 }, createTarget);\r
    const up = Array.from({ length: BLOOM_LEVELS }, createTarget);\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const colorCache = new Map();\r
    const toLinear = value => {\r
      if (colorCache.has(value)) return colorCache.get(value);\r
      let rgb = [1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#000000';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r, g, b].map(v => Math.pow(v / 255, 2.2));\r
      }\r
      colorCache.set(value, rgb);\r
      return rgb;\r
    };\r
\r
    const view = { width: 1, height: 1, fineWidth: 1, fineHeight: 1, coarseWidth: 1, coarseHeight: 1 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const state = {\r
      time: 0,\r
      intro: settingsRef.current.intro && !reduce ? 0 : 1,\r
      heat: 0,\r
      heatVelocity: 0,\r
      heatX: 0,\r
      lensX: 0,\r
      lensY: 0\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const run = (entry, target, width, height) => {\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.framebuffer : null);\r
      gl.viewport(0, 0, width, height);\r
      gl.useProgram(entry.program);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const bindTexture = (entry, name, unit, texture) => {\r
      gl.activeTexture(gl.TEXTURE0 + unit);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.uniform1i(entry.uniforms[name], unit);\r
    };\r
\r
    const setScene = (entry, s, presence) => {\r
      const u = entry.uniforms;\r
      gl.useProgram(entry.program);\r
      gl.uniform2f(u.uView, view.width, view.height);\r
      gl.uniform2f(u.uOffset, s.xOffset, s.yOffset);\r
      gl.uniform1f(u.uRotation, s.rotation);\r
      gl.uniform1f(u.uFocalLength, s.focalLength);\r
      gl.uniform1f(u.uTime, state.time);\r
      gl.uniform1f(u.uSpeed1, s.speed1);\r
      gl.uniform1f(u.uSpeed2, s.speed2);\r
      gl.uniform1f(u.uDir2, s.dir2);\r
      gl.uniform1f(u.uBend1, s.bend1 * (0.3 + 0.7 * presence));\r
      gl.uniform1f(u.uBend2, s.bend2 * (0.3 + 0.7 * presence));\r
      gl.uniform1f(u.uThickness, s.thickness);\r
      gl.uniform3f(u.uHeat, state.heatX, state.heat, 1.4);\r
      gl.uniform3fv(u.uColor1, toLinear(s.color1));\r
      gl.uniform3fv(u.uColor2, toLinear(s.color2));\r
      gl.uniform1f(u.uCore, s.core);\r
      gl.uniform1f(u.uRange, range);\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const presence = state.intro * state.intro * (3 - 2 * state.intro);\r
      gl.bindVertexArray(vao);\r
      sizeTarget(coarse, view.coarseWidth, view.coarseHeight);\r
      sizeTarget(fine, view.fineWidth, view.fineHeight);\r
\r
      setScene(programs.coarse, s, presence);\r
      gl.uniform2f(programs.coarse.uniforms.uScale, view.width / view.coarseWidth, view.height / view.coarseHeight);\r
      run(programs.coarse, coarse, view.coarseWidth, view.coarseHeight);\r
\r
      const refine = programs.fine;\r
      setScene(refine, s, presence);\r
      gl.uniform2f(refine.uniforms.uScale, view.width / view.fineWidth, view.height / view.fineHeight);\r
      gl.uniform2f(refine.uniforms.uCoarseSize, view.coarseWidth, view.coarseHeight);\r
      gl.uniform2f(refine.uniforms.uFineSize, view.fineWidth, view.fineHeight);\r
      bindTexture(refine, 'uCoarse', 0, coarse.texture);\r
      run(refine, fine, view.fineWidth, view.fineHeight);\r
\r
      let source = fine;\r
      for (let level = 0; level <= BLOOM_LEVELS; level++) {\r
        const target = down[level];\r
        const width = level === 0 ? Math.round(view.width / 2) : source.width >> 1;\r
        const height = level === 0 ? Math.round(view.height / 2) : source.height >> 1;\r
        sizeTarget(target, Math.max(1, width), Math.max(1, height));\r
        gl.useProgram(programs.down.program);\r
        gl.uniform2f(programs.down.uniforms.uTexel, 1 / source.width, 1 / source.height);\r
        gl.uniform2f(programs.down.uniforms.uTarget, target.width, target.height);\r
        bindTexture(programs.down, 'uSource', 0, source.texture);\r
        run(programs.down, target, target.width, target.height);\r
        source = target;\r
      }\r
      for (let level = BLOOM_LEVELS - 1; level >= 1; level--) {\r
        const from = level === BLOOM_LEVELS - 1 ? down[BLOOM_LEVELS] : up[level + 1];\r
        const target = up[level];\r
        sizeTarget(target, down[level].width, down[level].height);\r
        gl.useProgram(programs.up.program);\r
        gl.uniform2f(programs.up.uniforms.uTexel, 1 / from.width, 1 / from.height);\r
        gl.uniform2f(programs.up.uniforms.uTarget, target.width, target.height);\r
        bindTexture(programs.up, 'uSource', 0, from.texture);\r
        bindTexture(programs.up, 'uBase', 1, down[level].texture);\r
        run(programs.up, target, target.width, target.height);\r
      }\r
\r
      const composite = programs.composite;\r
      const c = composite.uniforms;\r
      gl.useProgram(composite.program);\r
      gl.uniform2f(c.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(c.uExposure, (2.4 * s.brightness) / range);\r
      gl.uniform1f(c.uGlow, s.glow);\r
      gl.uniform1f(c.uCore, s.core);\r
      gl.uniform1f(c.uPresence, presence * presence);\r
      gl.uniform1f(c.uGrain, s.grain);\r
      gl.uniform1f(c.uFade, s.fade);\r
      gl.uniform1f(c.uOpacity, s.opacity);\r
      gl.uniform1f(c.uTime, state.time);\r
      gl.uniform1f(c.uLightMode, s.lightMode ? 1 : 0);\r
      gl.uniform3f(\r
        c.uLens,\r
        (state.lensX * canvas.width) / view.width,\r
        ((view.height - state.lensY) * canvas.height) / view.height,\r
        state.heat\r
      );\r
      bindTexture(composite, 'uLight', 0, fine.texture);\r
      bindTexture(composite, 'uBloom', 1, up[1].texture);\r
      run(composite, null, canvas.width, canvas.height);\r
    };\r
\r
    const heatTarget = s => {\r
      if (!(s.mouseInteraction && pointer.inside) || reduce) return null;\r
      const x = pointer.x + s.xOffset - view.width / 2;\r
      const y = view.height - pointer.y + s.yOffset - view.height / 2;\r
      const c = Math.cos(s.rotation);\r
      const sn = Math.sin(s.rotation);\r
      return (7 * (c * x + sn * y)) / view.height / s.focalLength - 15;\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const moving = !s.paused && !reduce;\r
      if (moving) state.time += dt * s.speed;\r
      if (!s.intro || reduce) state.intro = 1;\r
      else if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / INTRO_SECONDS);\r
      const target = heatTarget(s);\r
      if (target !== null) state.heatX += (target - state.heatX) * (1 - Math.exp(-dt * 6));\r
      state.heatVelocity += (120 * ((target === null ? 0 : 1) - state.heat) - 19 * state.heatVelocity) * dt;\r
      state.heat = clamp(state.heat + state.heatVelocity * dt, 0, 1.15);\r
      state.lensX += (pointer.x - state.lensX) * (1 - Math.exp(-dt * 8));\r
      state.lensY += (pointer.y - state.lensY) * (1 - Math.exp(-dt * 8));\r
      render();\r
      const settling = state.intro < 1 || state.heat > 0.001 || Math.abs(state.heatVelocity) > 0.001;\r
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
      let scale = s.quality;\r
      if (width * height * scale * scale > MAX_LIGHT_PIXELS) scale = Math.sqrt(MAX_LIGHT_PIXELS / (width * height));\r
      view.fineWidth = Math.max(1, Math.round(width * scale));\r
      view.fineHeight = Math.max(1, Math.round(height * scale));\r
      view.coarseWidth = Math.max(1, Math.round(view.fineWidth / COARSE_RATIO));\r
      view.coarseHeight = Math.max(1, Math.round(view.fineHeight / COARSE_RATIO));\r
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
      for (const target of [coarse, fine, ...down, ...up]) {\r
        gl.deleteTexture(target.texture);\r
        gl.deleteFramebuffer(target.framebuffer);\r
      }\r
      for (const entry of Object.values(programs)) gl.deleteProgram(entry.program);\r
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
    <div ref={containerRef} className={\`plasma-wave-container\${className ? \` \${className}\` : ''}\`} {...rest}>\r
      <canvas ref={canvasRef} className="plasma-wave-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
}\r
`,e=`.plasma-wave-container {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.plasma-wave-canvas {\r
  position: absolute;\r
  inset: 0;\r
  display: block;\r
  width: 100%;\r
  height: 100%;\r
}\r
`,n=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
const QUAD_VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const COMMON = \`#version 300 es\r
precision highp float;\r
const float PI = 3.14159265;\r
const float TAU = 6.28318531;\r
const float HALF_PI = 1.5707963;\r
\`;\r
\r
const TRACE = \`\r
uniform vec2 uView;\r
uniform vec2 uOffset;\r
uniform float uRotation;\r
uniform float uFocalLength;\r
uniform float uTime;\r
uniform float uSpeed1;\r
uniform float uSpeed2;\r
uniform float uDir2;\r
uniform float uBend1;\r
uniform float uBend2;\r
uniform float uThickness;\r
uniform vec3 uHeat;\r
uniform vec3 uColor1;\r
uniform vec3 uColor2;\r
uniform float uCore;\r
uniform float uRange;\r
\r
vec4 traceLight(vec2 pixel) {\r
  vec2 coord = pixel + uOffset - 0.5 * uView;\r
  float c = cos(uRotation);\r
  float sn = sin(uRotation);\r
  coord = mat2(c, -sn, sn, c) * coord;\r
  vec3 u = normalize(vec3(coord / uView.y, uFocalLength));\r
  vec3 o = vec3(0.0, 0.0, -7.0);\r
  float t = uTime * PI;\r
  float t1 = t * 0.7;\r
  float t2 = t * 0.9;\r
  float tSpeed1 = t * uSpeed1;\r
  float tSpeed2 = t * uSpeed2 * uDir2;\r
  float s = 1.0;\r
  float d = 0.0;\r
  vec2 k = vec2(0.0);\r
  for (int i = 0; i < 14; ++i) {\r
    vec3 p = o + u * d;\r
    p.x -= 15.0;\r
    float px = p.x;\r
    float swell = uHeat.y * exp(-pow((px - uHeat.x) / uHeat.z, 2.0));\r
    float wob1 = uBend1 + swell * (0.16 + 0.2 * uBend1) + sin(t1 + px * 0.8) * 0.1;\r
    float wob2 = uBend2 + swell * (0.16 + 0.2 * uBend2) + cos(t2 + px * 1.1) * 0.1;\r
    vec2 a = sin(vec2(px, px + HALF_PI) + tSpeed1) * wob1;\r
    vec2 b = cos(vec2(px, px + HALF_PI) + tSpeed2) * wob2;\r
    float cut = px + uThickness;\r
    k.x = max(cut, length(p.yz - a) - uThickness);\r
    k.y = max(cut, length(p.yz - b) - uThickness);\r
    s = min(s, min(k.x, k.y));\r
    if (s < 0.001 || d > 300.0) break;\r
    d += s * 0.7;\r
  }\r
  vec3 raw = max(cos(d * TAU) - s * sqrt(d) - vec3(k, 0.0), 0.0);\r
  float field = max(raw.r, max(raw.g, raw.b));\r
  raw.gb += 0.1;\r
  raw = raw * 0.4 + raw.brg * 0.6 + raw * raw;\r
  float lum = dot(raw, vec3(0.299, 0.587, 0.114));\r
  float w1 = max(0.0, 1.0 - k.x * 2.0) + 0.0001;\r
  float w2 = max(0.0, 1.0 - k.y * 2.0) + 0.0001;\r
  vec3 base = (uColor1 * w1 + uColor2 * w2) / (w1 + w2);\r
  float soft = smoothstep(0.03, 0.36, field);\r
  float hot = smoothstep(0.32, 0.8, field);\r
  vec3 light = base * lum * 2.6 * soft + mix(base, vec3(1.0), 0.55) * hot * uCore * 2.0;\r
  return vec4(light * uRange, field);\r
}\r
\`;\r
\r
const COARSE = \`\${COMMON}\r
\${TRACE}\r
uniform vec2 uScale;\r
out vec4 outColor;\r
void main() {\r
  outColor = traceLight(gl_FragCoord.xy * uScale);\r
}\`;\r
\r
const FINE = \`\${COMMON}\r
\${TRACE}\r
uniform vec2 uScale;\r
uniform sampler2D uCoarse;\r
uniform vec2 uCoarseSize;\r
uniform vec2 uFineSize;\r
out vec4 outColor;\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uFineSize;\r
  vec2 pos = uv * uCoarseSize - 0.5;\r
  ivec2 cell = ivec2(floor(pos));\r
  ivec2 last = ivec2(uCoarseSize) - 1;\r
  float a = texelFetch(uCoarse, clamp(cell, ivec2(0), last), 0).a;\r
  float b = texelFetch(uCoarse, clamp(cell + ivec2(1, 0), ivec2(0), last), 0).a;\r
  float c = texelFetch(uCoarse, clamp(cell + ivec2(0, 1), ivec2(0), last), 0).a;\r
  float d = texelFetch(uCoarse, clamp(cell + ivec2(1, 1), ivec2(0), last), 0).a;\r
  float high = max(max(a, b), max(c, d));\r
  float low = min(min(a, b), min(c, d));\r
  if (high > 0.02 && low < 0.4) outColor = traceLight(gl_FragCoord.xy * uScale);\r
  else outColor = texture(uCoarse, uv);\r
}\`;\r
\r
const DOWN = \`\${COMMON}\r
uniform sampler2D uSource;\r
uniform vec2 uTexel;\r
uniform vec2 uTarget;\r
out vec4 outColor;\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uTarget;\r
  vec4 sum = texture(uSource, uv) * 4.0;\r
  sum += texture(uSource, uv - uTexel);\r
  sum += texture(uSource, uv + uTexel);\r
  sum += texture(uSource, uv + vec2(uTexel.x, -uTexel.y));\r
  sum += texture(uSource, uv - vec2(uTexel.x, -uTexel.y));\r
  outColor = sum / 8.0;\r
}\`;\r
\r
const UP = \`\${COMMON}\r
uniform sampler2D uSource;\r
uniform sampler2D uBase;\r
uniform vec2 uTexel;\r
uniform vec2 uTarget;\r
out vec4 outColor;\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uTarget;\r
  vec2 h = uTexel * 0.5;\r
  vec4 sum = texture(uSource, uv + vec2(-h.x * 2.0, 0.0));\r
  sum += texture(uSource, uv + vec2(h.x * 2.0, 0.0));\r
  sum += texture(uSource, uv + vec2(0.0, -h.y * 2.0));\r
  sum += texture(uSource, uv + vec2(0.0, h.y * 2.0));\r
  sum += texture(uSource, uv + vec2(-h.x, h.y)) * 2.0;\r
  sum += texture(uSource, uv + h) * 2.0;\r
  sum += texture(uSource, uv + vec2(h.x, -h.y)) * 2.0;\r
  sum += texture(uSource, uv - h) * 2.0;\r
  outColor = sum / 12.0 + texture(uBase, uv);\r
}\`;\r
\r
const COMPOSITE = \`\${COMMON}\r
uniform sampler2D uLight;\r
uniform sampler2D uBloom;\r
uniform vec2 uResolution;\r
uniform float uExposure;\r
uniform float uGlow;\r
uniform float uCore;\r
uniform float uPresence;\r
uniform float uGrain;\r
uniform float uFade;\r
uniform float uOpacity;\r
uniform float uTime;\r
uniform float uLightMode;\r
uniform vec3 uLens;\r
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
  vec2 uv = gl_FragCoord.xy / uResolution;\r
  vec2 offset = gl_FragCoord.xy - uLens.xy;\r
  float lens = uLens.z * exp(-dot(offset, offset) / (uResolution.y * uResolution.y * 0.045));\r
  vec4 source = texture(uLight, uv);\r
  vec3 hdr = source.rgb * uExposure * uPresence * (1.0 + lens * 0.35);\r
  hdr += texture(uBloom, uv).rgb * uExposure * uPresence * uGlow * (0.18 + lens * 0.08);\r
  float edge = uFade * 0.5;\r
  float mask = smootherstep(edge, uv.x) * smootherstep(edge, 1.0 - uv.x) * smootherstep(edge, uv.y) * smootherstep(edge, 1.0 - uv.y);\r
  float grain = (hash(gl_FragCoord.xy + fract(uTime * 7.31) * 113.0) - 0.5) * uGrain;\r
  float peak = max(hdr.r, max(hdr.g, hdr.b));\r
  if (uLightMode > 0.5) {\r
    vec3 hue = hdr / max(peak, 0.0001);\r
    float tone = dot(hue, vec3(0.2126, 0.7152, 0.0722));\r
    vec3 ink = pow(clamp(hue * min(1.0, 0.6 / max(tone, 0.001)), 0.0, 1.0), vec3(1.0 / 2.2));\r
    float feather = max(fwidth(source.a) * 1.25, 0.02);\r
    float body = smoothstep(0.15 - feather, 0.15 + feather, source.a) * uPresence;\r
    vec3 color = mix(ink, vec3(1.0), smoothstep(12.0, 26.0, peak) * uCore);\r
    float halo = (1.0 - exp(-peak * 0.5)) * 0.3 * min(uGlow, 1.5);\r
    float alpha = clamp(body * 0.92 + (1.0 - body) * halo, 0.0, 1.0) * mask * uOpacity;\r
    color = mix(ink, color, body);\r
    outColor = vec4(clamp(color + grain, 0.0, 1.0) * alpha, alpha);\r
  } else {\r
    vec3 mapped = 1.0 - exp(-hdr);\r
    float level = max(mapped.r, max(mapped.g, mapped.b));\r
    mapped = clamp(mapped + grain * level, 0.0, 1.0) * mask * uOpacity;\r
    outColor = vec4(mapped, max(mapped.r, max(mapped.g, mapped.b)));\r
  }\r
}\`;\r
\r
const BLOOM_LEVELS = 4;\r
const COARSE_RATIO = 3;\r
const INTRO_SECONDS = 1.8;\r
const MAX_LIGHT_PIXELS = 2400000;\r
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
export default function PlasmaWave({\r
  colors = ['#A855F7', '#06B6D4'],\r
  speed = 1,\r
  speed1 = 0.05,\r
  speed2 = 0.05,\r
  dir2 = 1,\r
  bend1 = 1,\r
  bend2 = 0.5,\r
  thickness = 0.3,\r
  focalLength = 1.25,\r
  rotationDeg = 0,\r
  xOffset = 0,\r
  yOffset = 0,\r
  brightness = 1,\r
  glow = 1,\r
  core = 0.6,\r
  grain = 0.03,\r
  quality = 1,\r
  mouseInteraction = true,\r
  intro = true,\r
  fade = 0,\r
  opacity = 1,\r
  lightMode = false,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  ...rest\r
}) {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settings = {\r
    color1: String(colors?.[0] ?? '#A855F7'),\r
    color2: String(colors?.[1] ?? colors?.[0] ?? '#06B6D4'),\r
    speed,\r
    speed1,\r
    speed2,\r
    dir2,\r
    bend1,\r
    bend2,\r
    thickness: Math.max(0.02, thickness),\r
    focalLength: Math.max(0.05, focalLength),\r
    rotation: (rotationDeg * Math.PI) / 180,\r
    xOffset,\r
    yOffset,\r
    brightness: Math.max(0, brightness),\r
    glow: Math.max(0, glow),\r
    core: clamp(core, 0, 1),\r
    grain: Math.max(0, grain),\r
    quality: clamp(quality, 0.25, 1),\r
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
      stencil: false,\r
      powerPreference: 'high-performance'\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const floatTargets = !!gl.getExtension('EXT_color_buffer_float');\r
    const range = floatTargets ? 1 : 0.25;\r
    const programs = {\r
      coarse: link(gl, COARSE),\r
      fine: link(gl, FINE),\r
      down: link(gl, DOWN),\r
      up: link(gl, UP),\r
      composite: link(gl, COMPOSITE)\r
    };\r
    if (Object.values(programs).some(entry => !entry)) return undefined;\r
\r
    const buffer = gl.createBuffer();\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const createTarget = () => ({\r
      texture: gl.createTexture(),\r
      framebuffer: gl.createFramebuffer(),\r
      width: 0,\r
      height: 0\r
    });\r
    const sizeTarget = (target, width, height) => {\r
      if (target.width === width && target.height === height) return;\r
      target.width = width;\r
      target.height = height;\r
      gl.bindTexture(gl.TEXTURE_2D, target.texture);\r
      if (floatTargets) {\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.HALF_FLOAT, null);\r
      } else {\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
      }\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target.texture, 0);\r
    };\r
    const coarse = createTarget();\r
    const fine = createTarget();\r
    const down = Array.from({ length: BLOOM_LEVELS + 1 }, createTarget);\r
    const up = Array.from({ length: BLOOM_LEVELS }, createTarget);\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const colorCache = new Map();\r
    const toLinear = value => {\r
      if (colorCache.has(value)) return colorCache.get(value);\r
      let rgb = [1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#000000';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r, g, b].map(v => Math.pow(v / 255, 2.2));\r
      }\r
      colorCache.set(value, rgb);\r
      return rgb;\r
    };\r
\r
    const view = { width: 1, height: 1, fineWidth: 1, fineHeight: 1, coarseWidth: 1, coarseHeight: 1 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const state = {\r
      time: 0,\r
      intro: settingsRef.current.intro && !reduce ? 0 : 1,\r
      heat: 0,\r
      heatVelocity: 0,\r
      heatX: 0,\r
      lensX: 0,\r
      lensY: 0\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const run = (entry, target, width, height) => {\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.framebuffer : null);\r
      gl.viewport(0, 0, width, height);\r
      gl.useProgram(entry.program);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const bindTexture = (entry, name, unit, texture) => {\r
      gl.activeTexture(gl.TEXTURE0 + unit);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.uniform1i(entry.uniforms[name], unit);\r
    };\r
\r
    const setScene = (entry, s, presence) => {\r
      const u = entry.uniforms;\r
      gl.useProgram(entry.program);\r
      gl.uniform2f(u.uView, view.width, view.height);\r
      gl.uniform2f(u.uOffset, s.xOffset, s.yOffset);\r
      gl.uniform1f(u.uRotation, s.rotation);\r
      gl.uniform1f(u.uFocalLength, s.focalLength);\r
      gl.uniform1f(u.uTime, state.time);\r
      gl.uniform1f(u.uSpeed1, s.speed1);\r
      gl.uniform1f(u.uSpeed2, s.speed2);\r
      gl.uniform1f(u.uDir2, s.dir2);\r
      gl.uniform1f(u.uBend1, s.bend1 * (0.3 + 0.7 * presence));\r
      gl.uniform1f(u.uBend2, s.bend2 * (0.3 + 0.7 * presence));\r
      gl.uniform1f(u.uThickness, s.thickness);\r
      gl.uniform3f(u.uHeat, state.heatX, state.heat, 1.4);\r
      gl.uniform3fv(u.uColor1, toLinear(s.color1));\r
      gl.uniform3fv(u.uColor2, toLinear(s.color2));\r
      gl.uniform1f(u.uCore, s.core);\r
      gl.uniform1f(u.uRange, range);\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const presence = state.intro * state.intro * (3 - 2 * state.intro);\r
      gl.bindVertexArray(vao);\r
      sizeTarget(coarse, view.coarseWidth, view.coarseHeight);\r
      sizeTarget(fine, view.fineWidth, view.fineHeight);\r
\r
      setScene(programs.coarse, s, presence);\r
      gl.uniform2f(programs.coarse.uniforms.uScale, view.width / view.coarseWidth, view.height / view.coarseHeight);\r
      run(programs.coarse, coarse, view.coarseWidth, view.coarseHeight);\r
\r
      const refine = programs.fine;\r
      setScene(refine, s, presence);\r
      gl.uniform2f(refine.uniforms.uScale, view.width / view.fineWidth, view.height / view.fineHeight);\r
      gl.uniform2f(refine.uniforms.uCoarseSize, view.coarseWidth, view.coarseHeight);\r
      gl.uniform2f(refine.uniforms.uFineSize, view.fineWidth, view.fineHeight);\r
      bindTexture(refine, 'uCoarse', 0, coarse.texture);\r
      run(refine, fine, view.fineWidth, view.fineHeight);\r
\r
      let source = fine;\r
      for (let level = 0; level <= BLOOM_LEVELS; level++) {\r
        const target = down[level];\r
        const width = level === 0 ? Math.round(view.width / 2) : source.width >> 1;\r
        const height = level === 0 ? Math.round(view.height / 2) : source.height >> 1;\r
        sizeTarget(target, Math.max(1, width), Math.max(1, height));\r
        gl.useProgram(programs.down.program);\r
        gl.uniform2f(programs.down.uniforms.uTexel, 1 / source.width, 1 / source.height);\r
        gl.uniform2f(programs.down.uniforms.uTarget, target.width, target.height);\r
        bindTexture(programs.down, 'uSource', 0, source.texture);\r
        run(programs.down, target, target.width, target.height);\r
        source = target;\r
      }\r
      for (let level = BLOOM_LEVELS - 1; level >= 1; level--) {\r
        const from = level === BLOOM_LEVELS - 1 ? down[BLOOM_LEVELS] : up[level + 1];\r
        const target = up[level];\r
        sizeTarget(target, down[level].width, down[level].height);\r
        gl.useProgram(programs.up.program);\r
        gl.uniform2f(programs.up.uniforms.uTexel, 1 / from.width, 1 / from.height);\r
        gl.uniform2f(programs.up.uniforms.uTarget, target.width, target.height);\r
        bindTexture(programs.up, 'uSource', 0, from.texture);\r
        bindTexture(programs.up, 'uBase', 1, down[level].texture);\r
        run(programs.up, target, target.width, target.height);\r
      }\r
\r
      const composite = programs.composite;\r
      const c = composite.uniforms;\r
      gl.useProgram(composite.program);\r
      gl.uniform2f(c.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(c.uExposure, (2.4 * s.brightness) / range);\r
      gl.uniform1f(c.uGlow, s.glow);\r
      gl.uniform1f(c.uCore, s.core);\r
      gl.uniform1f(c.uPresence, presence * presence);\r
      gl.uniform1f(c.uGrain, s.grain);\r
      gl.uniform1f(c.uFade, s.fade);\r
      gl.uniform1f(c.uOpacity, s.opacity);\r
      gl.uniform1f(c.uTime, state.time);\r
      gl.uniform1f(c.uLightMode, s.lightMode ? 1 : 0);\r
      gl.uniform3f(\r
        c.uLens,\r
        (state.lensX * canvas.width) / view.width,\r
        ((view.height - state.lensY) * canvas.height) / view.height,\r
        state.heat\r
      );\r
      bindTexture(composite, 'uLight', 0, fine.texture);\r
      bindTexture(composite, 'uBloom', 1, up[1].texture);\r
      run(composite, null, canvas.width, canvas.height);\r
    };\r
\r
    const heatTarget = s => {\r
      if (!(s.mouseInteraction && pointer.inside) || reduce) return null;\r
      const x = pointer.x + s.xOffset - view.width / 2;\r
      const y = view.height - pointer.y + s.yOffset - view.height / 2;\r
      const c = Math.cos(s.rotation);\r
      const sn = Math.sin(s.rotation);\r
      return (7 * (c * x + sn * y)) / view.height / s.focalLength - 15;\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const moving = !s.paused && !reduce;\r
      if (moving) state.time += dt * s.speed;\r
      if (!s.intro || reduce) state.intro = 1;\r
      else if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / INTRO_SECONDS);\r
      const target = heatTarget(s);\r
      if (target !== null) state.heatX += (target - state.heatX) * (1 - Math.exp(-dt * 6));\r
      state.heatVelocity += (120 * ((target === null ? 0 : 1) - state.heat) - 19 * state.heatVelocity) * dt;\r
      state.heat = clamp(state.heat + state.heatVelocity * dt, 0, 1.15);\r
      state.lensX += (pointer.x - state.lensX) * (1 - Math.exp(-dt * 8));\r
      state.lensY += (pointer.y - state.lensY) * (1 - Math.exp(-dt * 8));\r
      render();\r
      const settling = state.intro < 1 || state.heat > 0.001 || Math.abs(state.heatVelocity) > 0.001;\r
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
      let scale = s.quality;\r
      if (width * height * scale * scale > MAX_LIGHT_PIXELS) scale = Math.sqrt(MAX_LIGHT_PIXELS / (width * height));\r
      view.fineWidth = Math.max(1, Math.round(width * scale));\r
      view.fineHeight = Math.max(1, Math.round(height * scale));\r
      view.coarseWidth = Math.max(1, Math.round(view.fineWidth / COARSE_RATIO));\r
      view.coarseHeight = Math.max(1, Math.round(view.fineHeight / COARSE_RATIO));\r
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
      for (const target of [coarse, fine, ...down, ...up]) {\r
        gl.deleteTexture(target.texture);\r
        gl.deleteFramebuffer(target.framebuffer);\r
      }\r
      for (const entry of Object.values(programs)) gl.deleteProgram(entry.program);\r
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
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
}\r
`,t=`'use client';\r
\r
import { useEffect, useRef, type HTMLAttributes } from 'react';\r
\r
import './PlasmaWave.css';\r
\r
export interface PlasmaWaveProps extends HTMLAttributes<HTMLDivElement> {\r
  colors?: string[];\r
  speed?: number;\r
  speed1?: number;\r
  speed2?: number;\r
  dir2?: number;\r
  bend1?: number;\r
  bend2?: number;\r
  thickness?: number;\r
  focalLength?: number;\r
  rotationDeg?: number;\r
  xOffset?: number;\r
  yOffset?: number;\r
  brightness?: number;\r
  glow?: number;\r
  core?: number;\r
  grain?: number;\r
  quality?: number;\r
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
  speed: number;\r
  speed1: number;\r
  speed2: number;\r
  dir2: number;\r
  bend1: number;\r
  bend2: number;\r
  thickness: number;\r
  focalLength: number;\r
  rotation: number;\r
  xOffset: number;\r
  yOffset: number;\r
  brightness: number;\r
  glow: number;\r
  core: number;\r
  grain: number;\r
  quality: number;\r
  mouseInteraction: boolean;\r
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
type Target = { texture: WebGLTexture | null; framebuffer: WebGLFramebuffer | null; width: number; height: number };\r
\r
const QUAD_VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const COMMON = \`#version 300 es\r
precision highp float;\r
const float PI = 3.14159265;\r
const float TAU = 6.28318531;\r
const float HALF_PI = 1.5707963;\r
\`;\r
\r
const TRACE = \`\r
uniform vec2 uView;\r
uniform vec2 uOffset;\r
uniform float uRotation;\r
uniform float uFocalLength;\r
uniform float uTime;\r
uniform float uSpeed1;\r
uniform float uSpeed2;\r
uniform float uDir2;\r
uniform float uBend1;\r
uniform float uBend2;\r
uniform float uThickness;\r
uniform vec3 uHeat;\r
uniform vec3 uColor1;\r
uniform vec3 uColor2;\r
uniform float uCore;\r
uniform float uRange;\r
\r
vec4 traceLight(vec2 pixel) {\r
  vec2 coord = pixel + uOffset - 0.5 * uView;\r
  float c = cos(uRotation);\r
  float sn = sin(uRotation);\r
  coord = mat2(c, -sn, sn, c) * coord;\r
  vec3 u = normalize(vec3(coord / uView.y, uFocalLength));\r
  vec3 o = vec3(0.0, 0.0, -7.0);\r
  float t = uTime * PI;\r
  float t1 = t * 0.7;\r
  float t2 = t * 0.9;\r
  float tSpeed1 = t * uSpeed1;\r
  float tSpeed2 = t * uSpeed2 * uDir2;\r
  float s = 1.0;\r
  float d = 0.0;\r
  vec2 k = vec2(0.0);\r
  for (int i = 0; i < 14; ++i) {\r
    vec3 p = o + u * d;\r
    p.x -= 15.0;\r
    float px = p.x;\r
    float swell = uHeat.y * exp(-pow((px - uHeat.x) / uHeat.z, 2.0));\r
    float wob1 = uBend1 + swell * (0.16 + 0.2 * uBend1) + sin(t1 + px * 0.8) * 0.1;\r
    float wob2 = uBend2 + swell * (0.16 + 0.2 * uBend2) + cos(t2 + px * 1.1) * 0.1;\r
    vec2 a = sin(vec2(px, px + HALF_PI) + tSpeed1) * wob1;\r
    vec2 b = cos(vec2(px, px + HALF_PI) + tSpeed2) * wob2;\r
    float cut = px + uThickness;\r
    k.x = max(cut, length(p.yz - a) - uThickness);\r
    k.y = max(cut, length(p.yz - b) - uThickness);\r
    s = min(s, min(k.x, k.y));\r
    if (s < 0.001 || d > 300.0) break;\r
    d += s * 0.7;\r
  }\r
  vec3 raw = max(cos(d * TAU) - s * sqrt(d) - vec3(k, 0.0), 0.0);\r
  float field = max(raw.r, max(raw.g, raw.b));\r
  raw.gb += 0.1;\r
  raw = raw * 0.4 + raw.brg * 0.6 + raw * raw;\r
  float lum = dot(raw, vec3(0.299, 0.587, 0.114));\r
  float w1 = max(0.0, 1.0 - k.x * 2.0) + 0.0001;\r
  float w2 = max(0.0, 1.0 - k.y * 2.0) + 0.0001;\r
  vec3 base = (uColor1 * w1 + uColor2 * w2) / (w1 + w2);\r
  float soft = smoothstep(0.03, 0.36, field);\r
  float hot = smoothstep(0.32, 0.8, field);\r
  vec3 light = base * lum * 2.6 * soft + mix(base, vec3(1.0), 0.55) * hot * uCore * 2.0;\r
  return vec4(light * uRange, field);\r
}\r
\`;\r
\r
const COARSE = \`\${COMMON}\r
\${TRACE}\r
uniform vec2 uScale;\r
out vec4 outColor;\r
void main() {\r
  outColor = traceLight(gl_FragCoord.xy * uScale);\r
}\`;\r
\r
const FINE = \`\${COMMON}\r
\${TRACE}\r
uniform vec2 uScale;\r
uniform sampler2D uCoarse;\r
uniform vec2 uCoarseSize;\r
uniform vec2 uFineSize;\r
out vec4 outColor;\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uFineSize;\r
  vec2 pos = uv * uCoarseSize - 0.5;\r
  ivec2 cell = ivec2(floor(pos));\r
  ivec2 last = ivec2(uCoarseSize) - 1;\r
  float a = texelFetch(uCoarse, clamp(cell, ivec2(0), last), 0).a;\r
  float b = texelFetch(uCoarse, clamp(cell + ivec2(1, 0), ivec2(0), last), 0).a;\r
  float c = texelFetch(uCoarse, clamp(cell + ivec2(0, 1), ivec2(0), last), 0).a;\r
  float d = texelFetch(uCoarse, clamp(cell + ivec2(1, 1), ivec2(0), last), 0).a;\r
  float high = max(max(a, b), max(c, d));\r
  float low = min(min(a, b), min(c, d));\r
  if (high > 0.02 && low < 0.4) outColor = traceLight(gl_FragCoord.xy * uScale);\r
  else outColor = texture(uCoarse, uv);\r
}\`;\r
\r
const DOWN = \`\${COMMON}\r
uniform sampler2D uSource;\r
uniform vec2 uTexel;\r
uniform vec2 uTarget;\r
out vec4 outColor;\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uTarget;\r
  vec4 sum = texture(uSource, uv) * 4.0;\r
  sum += texture(uSource, uv - uTexel);\r
  sum += texture(uSource, uv + uTexel);\r
  sum += texture(uSource, uv + vec2(uTexel.x, -uTexel.y));\r
  sum += texture(uSource, uv - vec2(uTexel.x, -uTexel.y));\r
  outColor = sum / 8.0;\r
}\`;\r
\r
const UP = \`\${COMMON}\r
uniform sampler2D uSource;\r
uniform sampler2D uBase;\r
uniform vec2 uTexel;\r
uniform vec2 uTarget;\r
out vec4 outColor;\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uTarget;\r
  vec2 h = uTexel * 0.5;\r
  vec4 sum = texture(uSource, uv + vec2(-h.x * 2.0, 0.0));\r
  sum += texture(uSource, uv + vec2(h.x * 2.0, 0.0));\r
  sum += texture(uSource, uv + vec2(0.0, -h.y * 2.0));\r
  sum += texture(uSource, uv + vec2(0.0, h.y * 2.0));\r
  sum += texture(uSource, uv + vec2(-h.x, h.y)) * 2.0;\r
  sum += texture(uSource, uv + h) * 2.0;\r
  sum += texture(uSource, uv + vec2(h.x, -h.y)) * 2.0;\r
  sum += texture(uSource, uv - h) * 2.0;\r
  outColor = sum / 12.0 + texture(uBase, uv);\r
}\`;\r
\r
const COMPOSITE = \`\${COMMON}\r
uniform sampler2D uLight;\r
uniform sampler2D uBloom;\r
uniform vec2 uResolution;\r
uniform float uExposure;\r
uniform float uGlow;\r
uniform float uCore;\r
uniform float uPresence;\r
uniform float uGrain;\r
uniform float uFade;\r
uniform float uOpacity;\r
uniform float uTime;\r
uniform float uLightMode;\r
uniform vec3 uLens;\r
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
  vec2 uv = gl_FragCoord.xy / uResolution;\r
  vec2 offset = gl_FragCoord.xy - uLens.xy;\r
  float lens = uLens.z * exp(-dot(offset, offset) / (uResolution.y * uResolution.y * 0.045));\r
  vec4 source = texture(uLight, uv);\r
  vec3 hdr = source.rgb * uExposure * uPresence * (1.0 + lens * 0.35);\r
  hdr += texture(uBloom, uv).rgb * uExposure * uPresence * uGlow * (0.18 + lens * 0.08);\r
  float edge = uFade * 0.5;\r
  float mask = smootherstep(edge, uv.x) * smootherstep(edge, 1.0 - uv.x) * smootherstep(edge, uv.y) * smootherstep(edge, 1.0 - uv.y);\r
  float grain = (hash(gl_FragCoord.xy + fract(uTime * 7.31) * 113.0) - 0.5) * uGrain;\r
  float peak = max(hdr.r, max(hdr.g, hdr.b));\r
  if (uLightMode > 0.5) {\r
    vec3 hue = hdr / max(peak, 0.0001);\r
    float tone = dot(hue, vec3(0.2126, 0.7152, 0.0722));\r
    vec3 ink = pow(clamp(hue * min(1.0, 0.6 / max(tone, 0.001)), 0.0, 1.0), vec3(1.0 / 2.2));\r
    float feather = max(fwidth(source.a) * 1.25, 0.02);\r
    float body = smoothstep(0.15 - feather, 0.15 + feather, source.a) * uPresence;\r
    vec3 color = mix(ink, vec3(1.0), smoothstep(12.0, 26.0, peak) * uCore);\r
    float halo = (1.0 - exp(-peak * 0.5)) * 0.3 * min(uGlow, 1.5);\r
    float alpha = clamp(body * 0.92 + (1.0 - body) * halo, 0.0, 1.0) * mask * uOpacity;\r
    color = mix(ink, color, body);\r
    outColor = vec4(clamp(color + grain, 0.0, 1.0) * alpha, alpha);\r
  } else {\r
    vec3 mapped = 1.0 - exp(-hdr);\r
    float level = max(mapped.r, max(mapped.g, mapped.b));\r
    mapped = clamp(mapped + grain * level, 0.0, 1.0) * mask * uOpacity;\r
    outColor = vec4(mapped, max(mapped.r, max(mapped.g, mapped.b)));\r
  }\r
}\`;\r
\r
const BLOOM_LEVELS = 4;\r
const COARSE_RATIO = 3;\r
const INTRO_SECONDS = 1.8;\r
const MAX_LIGHT_PIXELS = 2400000;\r
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
export default function PlasmaWave({\r
  colors = ['#A855F7', '#06B6D4'],\r
  speed = 1,\r
  speed1 = 0.05,\r
  speed2 = 0.05,\r
  dir2 = 1,\r
  bend1 = 1,\r
  bend2 = 0.5,\r
  thickness = 0.3,\r
  focalLength = 1.25,\r
  rotationDeg = 0,\r
  xOffset = 0,\r
  yOffset = 0,\r
  brightness = 1,\r
  glow = 1,\r
  core = 0.6,\r
  grain = 0.03,\r
  quality = 1,\r
  mouseInteraction = true,\r
  intro = true,\r
  fade = 0,\r
  opacity = 1,\r
  lightMode = false,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  ...rest\r
}: PlasmaWaveProps) {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings: Settings = {\r
    color1: String(colors?.[0] ?? '#A855F7'),\r
    color2: String(colors?.[1] ?? colors?.[0] ?? '#06B6D4'),\r
    speed,\r
    speed1,\r
    speed2,\r
    dir2,\r
    bend1,\r
    bend2,\r
    thickness: Math.max(0.02, thickness),\r
    focalLength: Math.max(0.05, focalLength),\r
    rotation: (rotationDeg * Math.PI) / 180,\r
    xOffset,\r
    yOffset,\r
    brightness: Math.max(0, brightness),\r
    glow: Math.max(0, glow),\r
    core: clamp(core, 0, 1),\r
    grain: Math.max(0, grain),\r
    quality: clamp(quality, 0.25, 1),\r
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
      stencil: false,\r
      powerPreference: 'high-performance'\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const floatTargets = !!gl.getExtension('EXT_color_buffer_float');\r
    const range = floatTargets ? 1 : 0.25;\r
    const programs = {\r
      coarse: link(gl, COARSE),\r
      fine: link(gl, FINE),\r
      down: link(gl, DOWN),\r
      up: link(gl, UP),\r
      composite: link(gl, COMPOSITE)\r
    } as Record<string, Program>;\r
    if (Object.values(programs).some(entry => !entry)) return undefined;\r
\r
    const buffer = gl.createBuffer();\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const createTarget = (): Target => ({\r
      texture: gl.createTexture(),\r
      framebuffer: gl.createFramebuffer(),\r
      width: 0,\r
      height: 0\r
    });\r
    const sizeTarget = (target: Target, width: number, height: number) => {\r
      if (target.width === width && target.height === height) return;\r
      target.width = width;\r
      target.height = height;\r
      gl.bindTexture(gl.TEXTURE_2D, target.texture);\r
      if (floatTargets) {\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.HALF_FLOAT, null);\r
      } else {\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
      }\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target.texture, 0);\r
    };\r
    const coarse = createTarget();\r
    const fine = createTarget();\r
    const down = Array.from({ length: BLOOM_LEVELS + 1 }, createTarget);\r
    const up = Array.from({ length: BLOOM_LEVELS }, createTarget);\r
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
        probe.fillStyle = '#000000';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r, g, b].map(v => Math.pow(v / 255, 2.2));\r
      }\r
      colorCache.set(value, rgb);\r
      return rgb;\r
    };\r
\r
    const view = { width: 1, height: 1, fineWidth: 1, fineHeight: 1, coarseWidth: 1, coarseHeight: 1 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const state = {\r
      time: 0,\r
      intro: settingsRef.current.intro && !reduce ? 0 : 1,\r
      heat: 0,\r
      heatVelocity: 0,\r
      heatX: 0,\r
      lensX: 0,\r
      lensY: 0\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const run = (entry: Program, target: Target | null, width: number, height: number) => {\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.framebuffer : null);\r
      gl.viewport(0, 0, width, height);\r
      gl.useProgram(entry.program);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const bindTexture = (entry: Program, name: string, unit: number, texture: WebGLTexture | null) => {\r
      gl.activeTexture(gl.TEXTURE0 + unit);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.uniform1i(entry.uniforms[name], unit);\r
    };\r
\r
    const setScene = (entry: Program, s: Settings, presence: number) => {\r
      const u = entry.uniforms;\r
      gl.useProgram(entry.program);\r
      gl.uniform2f(u.uView, view.width, view.height);\r
      gl.uniform2f(u.uOffset, s.xOffset, s.yOffset);\r
      gl.uniform1f(u.uRotation, s.rotation);\r
      gl.uniform1f(u.uFocalLength, s.focalLength);\r
      gl.uniform1f(u.uTime, state.time);\r
      gl.uniform1f(u.uSpeed1, s.speed1);\r
      gl.uniform1f(u.uSpeed2, s.speed2);\r
      gl.uniform1f(u.uDir2, s.dir2);\r
      gl.uniform1f(u.uBend1, s.bend1 * (0.3 + 0.7 * presence));\r
      gl.uniform1f(u.uBend2, s.bend2 * (0.3 + 0.7 * presence));\r
      gl.uniform1f(u.uThickness, s.thickness);\r
      gl.uniform3f(u.uHeat, state.heatX, state.heat, 1.4);\r
      gl.uniform3fv(u.uColor1, toLinear(s.color1));\r
      gl.uniform3fv(u.uColor2, toLinear(s.color2));\r
      gl.uniform1f(u.uCore, s.core);\r
      gl.uniform1f(u.uRange, range);\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const presence = state.intro * state.intro * (3 - 2 * state.intro);\r
      gl.bindVertexArray(vao);\r
      sizeTarget(coarse, view.coarseWidth, view.coarseHeight);\r
      sizeTarget(fine, view.fineWidth, view.fineHeight);\r
\r
      setScene(programs.coarse, s, presence);\r
      gl.uniform2f(programs.coarse.uniforms.uScale, view.width / view.coarseWidth, view.height / view.coarseHeight);\r
      run(programs.coarse, coarse, view.coarseWidth, view.coarseHeight);\r
\r
      const refine = programs.fine;\r
      setScene(refine, s, presence);\r
      gl.uniform2f(refine.uniforms.uScale, view.width / view.fineWidth, view.height / view.fineHeight);\r
      gl.uniform2f(refine.uniforms.uCoarseSize, view.coarseWidth, view.coarseHeight);\r
      gl.uniform2f(refine.uniforms.uFineSize, view.fineWidth, view.fineHeight);\r
      bindTexture(refine, 'uCoarse', 0, coarse.texture);\r
      run(refine, fine, view.fineWidth, view.fineHeight);\r
\r
      let source = fine;\r
      for (let level = 0; level <= BLOOM_LEVELS; level++) {\r
        const target = down[level];\r
        const width = level === 0 ? Math.round(view.width / 2) : source.width >> 1;\r
        const height = level === 0 ? Math.round(view.height / 2) : source.height >> 1;\r
        sizeTarget(target, Math.max(1, width), Math.max(1, height));\r
        gl.useProgram(programs.down.program);\r
        gl.uniform2f(programs.down.uniforms.uTexel, 1 / source.width, 1 / source.height);\r
        gl.uniform2f(programs.down.uniforms.uTarget, target.width, target.height);\r
        bindTexture(programs.down, 'uSource', 0, source.texture);\r
        run(programs.down, target, target.width, target.height);\r
        source = target;\r
      }\r
      for (let level = BLOOM_LEVELS - 1; level >= 1; level--) {\r
        const from = level === BLOOM_LEVELS - 1 ? down[BLOOM_LEVELS] : up[level + 1];\r
        const target = up[level];\r
        sizeTarget(target, down[level].width, down[level].height);\r
        gl.useProgram(programs.up.program);\r
        gl.uniform2f(programs.up.uniforms.uTexel, 1 / from.width, 1 / from.height);\r
        gl.uniform2f(programs.up.uniforms.uTarget, target.width, target.height);\r
        bindTexture(programs.up, 'uSource', 0, from.texture);\r
        bindTexture(programs.up, 'uBase', 1, down[level].texture);\r
        run(programs.up, target, target.width, target.height);\r
      }\r
\r
      const composite = programs.composite;\r
      const c = composite.uniforms;\r
      gl.useProgram(composite.program);\r
      gl.uniform2f(c.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(c.uExposure, (2.4 * s.brightness) / range);\r
      gl.uniform1f(c.uGlow, s.glow);\r
      gl.uniform1f(c.uCore, s.core);\r
      gl.uniform1f(c.uPresence, presence * presence);\r
      gl.uniform1f(c.uGrain, s.grain);\r
      gl.uniform1f(c.uFade, s.fade);\r
      gl.uniform1f(c.uOpacity, s.opacity);\r
      gl.uniform1f(c.uTime, state.time);\r
      gl.uniform1f(c.uLightMode, s.lightMode ? 1 : 0);\r
      gl.uniform3f(\r
        c.uLens,\r
        (state.lensX * canvas.width) / view.width,\r
        ((view.height - state.lensY) * canvas.height) / view.height,\r
        state.heat\r
      );\r
      bindTexture(composite, 'uLight', 0, fine.texture);\r
      bindTexture(composite, 'uBloom', 1, up[1].texture);\r
      run(composite, null, canvas.width, canvas.height);\r
    };\r
\r
    const heatTarget = (s: Settings): number | null => {\r
      if (!(s.mouseInteraction && pointer.inside) || reduce) return null;\r
      const x = pointer.x + s.xOffset - view.width / 2;\r
      const y = view.height - pointer.y + s.yOffset - view.height / 2;\r
      const c = Math.cos(s.rotation);\r
      const sn = Math.sin(s.rotation);\r
      return (7 * (c * x + sn * y)) / view.height / s.focalLength - 15;\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const moving = !s.paused && !reduce;\r
      if (moving) state.time += dt * s.speed;\r
      if (!s.intro || reduce) state.intro = 1;\r
      else if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / INTRO_SECONDS);\r
      const target = heatTarget(s);\r
      if (target !== null) state.heatX += (target - state.heatX) * (1 - Math.exp(-dt * 6));\r
      state.heatVelocity += (120 * ((target === null ? 0 : 1) - state.heat) - 19 * state.heatVelocity) * dt;\r
      state.heat = clamp(state.heat + state.heatVelocity * dt, 0, 1.15);\r
      state.lensX += (pointer.x - state.lensX) * (1 - Math.exp(-dt * 8));\r
      state.lensY += (pointer.y - state.lensY) * (1 - Math.exp(-dt * 8));\r
      render();\r
      const settling = state.intro < 1 || state.heat > 0.001 || Math.abs(state.heatVelocity) > 0.001;\r
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
      let scale = s.quality;\r
      if (width * height * scale * scale > MAX_LIGHT_PIXELS) scale = Math.sqrt(MAX_LIGHT_PIXELS / (width * height));\r
      view.fineWidth = Math.max(1, Math.round(width * scale));\r
      view.fineHeight = Math.max(1, Math.round(height * scale));\r
      view.coarseWidth = Math.max(1, Math.round(view.fineWidth / COARSE_RATIO));\r
      view.coarseHeight = Math.max(1, Math.round(view.fineHeight / COARSE_RATIO));\r
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
      for (const target of [coarse, fine, ...down, ...up]) {\r
        gl.deleteTexture(target.texture);\r
        gl.deleteFramebuffer(target.framebuffer);\r
      }\r
      for (const entry of Object.values(programs)) gl.deleteProgram(entry.program);\r
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
    <div ref={containerRef} className={\`plasma-wave-container\${className ? \` \${className}\` : ''}\`} {...rest}>\r
      <canvas ref={canvasRef} className="plasma-wave-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
}\r
`,o=`'use client';\r
\r
import { useEffect, useRef, type HTMLAttributes } from 'react';\r
\r
export interface PlasmaWaveProps extends HTMLAttributes<HTMLDivElement> {\r
  colors?: string[];\r
  speed?: number;\r
  speed1?: number;\r
  speed2?: number;\r
  dir2?: number;\r
  bend1?: number;\r
  bend2?: number;\r
  thickness?: number;\r
  focalLength?: number;\r
  rotationDeg?: number;\r
  xOffset?: number;\r
  yOffset?: number;\r
  brightness?: number;\r
  glow?: number;\r
  core?: number;\r
  grain?: number;\r
  quality?: number;\r
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
  speed: number;\r
  speed1: number;\r
  speed2: number;\r
  dir2: number;\r
  bend1: number;\r
  bend2: number;\r
  thickness: number;\r
  focalLength: number;\r
  rotation: number;\r
  xOffset: number;\r
  yOffset: number;\r
  brightness: number;\r
  glow: number;\r
  core: number;\r
  grain: number;\r
  quality: number;\r
  mouseInteraction: boolean;\r
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
type Target = { texture: WebGLTexture | null; framebuffer: WebGLFramebuffer | null; width: number; height: number };\r
\r
const QUAD_VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const COMMON = \`#version 300 es\r
precision highp float;\r
const float PI = 3.14159265;\r
const float TAU = 6.28318531;\r
const float HALF_PI = 1.5707963;\r
\`;\r
\r
const TRACE = \`\r
uniform vec2 uView;\r
uniform vec2 uOffset;\r
uniform float uRotation;\r
uniform float uFocalLength;\r
uniform float uTime;\r
uniform float uSpeed1;\r
uniform float uSpeed2;\r
uniform float uDir2;\r
uniform float uBend1;\r
uniform float uBend2;\r
uniform float uThickness;\r
uniform vec3 uHeat;\r
uniform vec3 uColor1;\r
uniform vec3 uColor2;\r
uniform float uCore;\r
uniform float uRange;\r
\r
vec4 traceLight(vec2 pixel) {\r
  vec2 coord = pixel + uOffset - 0.5 * uView;\r
  float c = cos(uRotation);\r
  float sn = sin(uRotation);\r
  coord = mat2(c, -sn, sn, c) * coord;\r
  vec3 u = normalize(vec3(coord / uView.y, uFocalLength));\r
  vec3 o = vec3(0.0, 0.0, -7.0);\r
  float t = uTime * PI;\r
  float t1 = t * 0.7;\r
  float t2 = t * 0.9;\r
  float tSpeed1 = t * uSpeed1;\r
  float tSpeed2 = t * uSpeed2 * uDir2;\r
  float s = 1.0;\r
  float d = 0.0;\r
  vec2 k = vec2(0.0);\r
  for (int i = 0; i < 14; ++i) {\r
    vec3 p = o + u * d;\r
    p.x -= 15.0;\r
    float px = p.x;\r
    float swell = uHeat.y * exp(-pow((px - uHeat.x) / uHeat.z, 2.0));\r
    float wob1 = uBend1 + swell * (0.16 + 0.2 * uBend1) + sin(t1 + px * 0.8) * 0.1;\r
    float wob2 = uBend2 + swell * (0.16 + 0.2 * uBend2) + cos(t2 + px * 1.1) * 0.1;\r
    vec2 a = sin(vec2(px, px + HALF_PI) + tSpeed1) * wob1;\r
    vec2 b = cos(vec2(px, px + HALF_PI) + tSpeed2) * wob2;\r
    float cut = px + uThickness;\r
    k.x = max(cut, length(p.yz - a) - uThickness);\r
    k.y = max(cut, length(p.yz - b) - uThickness);\r
    s = min(s, min(k.x, k.y));\r
    if (s < 0.001 || d > 300.0) break;\r
    d += s * 0.7;\r
  }\r
  vec3 raw = max(cos(d * TAU) - s * sqrt(d) - vec3(k, 0.0), 0.0);\r
  float field = max(raw.r, max(raw.g, raw.b));\r
  raw.gb += 0.1;\r
  raw = raw * 0.4 + raw.brg * 0.6 + raw * raw;\r
  float lum = dot(raw, vec3(0.299, 0.587, 0.114));\r
  float w1 = max(0.0, 1.0 - k.x * 2.0) + 0.0001;\r
  float w2 = max(0.0, 1.0 - k.y * 2.0) + 0.0001;\r
  vec3 base = (uColor1 * w1 + uColor2 * w2) / (w1 + w2);\r
  float soft = smoothstep(0.03, 0.36, field);\r
  float hot = smoothstep(0.32, 0.8, field);\r
  vec3 light = base * lum * 2.6 * soft + mix(base, vec3(1.0), 0.55) * hot * uCore * 2.0;\r
  return vec4(light * uRange, field);\r
}\r
\`;\r
\r
const COARSE = \`\${COMMON}\r
\${TRACE}\r
uniform vec2 uScale;\r
out vec4 outColor;\r
void main() {\r
  outColor = traceLight(gl_FragCoord.xy * uScale);\r
}\`;\r
\r
const FINE = \`\${COMMON}\r
\${TRACE}\r
uniform vec2 uScale;\r
uniform sampler2D uCoarse;\r
uniform vec2 uCoarseSize;\r
uniform vec2 uFineSize;\r
out vec4 outColor;\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uFineSize;\r
  vec2 pos = uv * uCoarseSize - 0.5;\r
  ivec2 cell = ivec2(floor(pos));\r
  ivec2 last = ivec2(uCoarseSize) - 1;\r
  float a = texelFetch(uCoarse, clamp(cell, ivec2(0), last), 0).a;\r
  float b = texelFetch(uCoarse, clamp(cell + ivec2(1, 0), ivec2(0), last), 0).a;\r
  float c = texelFetch(uCoarse, clamp(cell + ivec2(0, 1), ivec2(0), last), 0).a;\r
  float d = texelFetch(uCoarse, clamp(cell + ivec2(1, 1), ivec2(0), last), 0).a;\r
  float high = max(max(a, b), max(c, d));\r
  float low = min(min(a, b), min(c, d));\r
  if (high > 0.02 && low < 0.4) outColor = traceLight(gl_FragCoord.xy * uScale);\r
  else outColor = texture(uCoarse, uv);\r
}\`;\r
\r
const DOWN = \`\${COMMON}\r
uniform sampler2D uSource;\r
uniform vec2 uTexel;\r
uniform vec2 uTarget;\r
out vec4 outColor;\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uTarget;\r
  vec4 sum = texture(uSource, uv) * 4.0;\r
  sum += texture(uSource, uv - uTexel);\r
  sum += texture(uSource, uv + uTexel);\r
  sum += texture(uSource, uv + vec2(uTexel.x, -uTexel.y));\r
  sum += texture(uSource, uv - vec2(uTexel.x, -uTexel.y));\r
  outColor = sum / 8.0;\r
}\`;\r
\r
const UP = \`\${COMMON}\r
uniform sampler2D uSource;\r
uniform sampler2D uBase;\r
uniform vec2 uTexel;\r
uniform vec2 uTarget;\r
out vec4 outColor;\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uTarget;\r
  vec2 h = uTexel * 0.5;\r
  vec4 sum = texture(uSource, uv + vec2(-h.x * 2.0, 0.0));\r
  sum += texture(uSource, uv + vec2(h.x * 2.0, 0.0));\r
  sum += texture(uSource, uv + vec2(0.0, -h.y * 2.0));\r
  sum += texture(uSource, uv + vec2(0.0, h.y * 2.0));\r
  sum += texture(uSource, uv + vec2(-h.x, h.y)) * 2.0;\r
  sum += texture(uSource, uv + h) * 2.0;\r
  sum += texture(uSource, uv + vec2(h.x, -h.y)) * 2.0;\r
  sum += texture(uSource, uv - h) * 2.0;\r
  outColor = sum / 12.0 + texture(uBase, uv);\r
}\`;\r
\r
const COMPOSITE = \`\${COMMON}\r
uniform sampler2D uLight;\r
uniform sampler2D uBloom;\r
uniform vec2 uResolution;\r
uniform float uExposure;\r
uniform float uGlow;\r
uniform float uCore;\r
uniform float uPresence;\r
uniform float uGrain;\r
uniform float uFade;\r
uniform float uOpacity;\r
uniform float uTime;\r
uniform float uLightMode;\r
uniform vec3 uLens;\r
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
  vec2 uv = gl_FragCoord.xy / uResolution;\r
  vec2 offset = gl_FragCoord.xy - uLens.xy;\r
  float lens = uLens.z * exp(-dot(offset, offset) / (uResolution.y * uResolution.y * 0.045));\r
  vec4 source = texture(uLight, uv);\r
  vec3 hdr = source.rgb * uExposure * uPresence * (1.0 + lens * 0.35);\r
  hdr += texture(uBloom, uv).rgb * uExposure * uPresence * uGlow * (0.18 + lens * 0.08);\r
  float edge = uFade * 0.5;\r
  float mask = smootherstep(edge, uv.x) * smootherstep(edge, 1.0 - uv.x) * smootherstep(edge, uv.y) * smootherstep(edge, 1.0 - uv.y);\r
  float grain = (hash(gl_FragCoord.xy + fract(uTime * 7.31) * 113.0) - 0.5) * uGrain;\r
  float peak = max(hdr.r, max(hdr.g, hdr.b));\r
  if (uLightMode > 0.5) {\r
    vec3 hue = hdr / max(peak, 0.0001);\r
    float tone = dot(hue, vec3(0.2126, 0.7152, 0.0722));\r
    vec3 ink = pow(clamp(hue * min(1.0, 0.6 / max(tone, 0.001)), 0.0, 1.0), vec3(1.0 / 2.2));\r
    float feather = max(fwidth(source.a) * 1.25, 0.02);\r
    float body = smoothstep(0.15 - feather, 0.15 + feather, source.a) * uPresence;\r
    vec3 color = mix(ink, vec3(1.0), smoothstep(12.0, 26.0, peak) * uCore);\r
    float halo = (1.0 - exp(-peak * 0.5)) * 0.3 * min(uGlow, 1.5);\r
    float alpha = clamp(body * 0.92 + (1.0 - body) * halo, 0.0, 1.0) * mask * uOpacity;\r
    color = mix(ink, color, body);\r
    outColor = vec4(clamp(color + grain, 0.0, 1.0) * alpha, alpha);\r
  } else {\r
    vec3 mapped = 1.0 - exp(-hdr);\r
    float level = max(mapped.r, max(mapped.g, mapped.b));\r
    mapped = clamp(mapped + grain * level, 0.0, 1.0) * mask * uOpacity;\r
    outColor = vec4(mapped, max(mapped.r, max(mapped.g, mapped.b)));\r
  }\r
}\`;\r
\r
const BLOOM_LEVELS = 4;\r
const COARSE_RATIO = 3;\r
const INTRO_SECONDS = 1.8;\r
const MAX_LIGHT_PIXELS = 2400000;\r
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
export default function PlasmaWave({\r
  colors = ['#A855F7', '#06B6D4'],\r
  speed = 1,\r
  speed1 = 0.05,\r
  speed2 = 0.05,\r
  dir2 = 1,\r
  bend1 = 1,\r
  bend2 = 0.5,\r
  thickness = 0.3,\r
  focalLength = 1.25,\r
  rotationDeg = 0,\r
  xOffset = 0,\r
  yOffset = 0,\r
  brightness = 1,\r
  glow = 1,\r
  core = 0.6,\r
  grain = 0.03,\r
  quality = 1,\r
  mouseInteraction = true,\r
  intro = true,\r
  fade = 0,\r
  opacity = 1,\r
  lightMode = false,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  ...rest\r
}: PlasmaWaveProps) {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings: Settings = {\r
    color1: String(colors?.[0] ?? '#A855F7'),\r
    color2: String(colors?.[1] ?? colors?.[0] ?? '#06B6D4'),\r
    speed,\r
    speed1,\r
    speed2,\r
    dir2,\r
    bend1,\r
    bend2,\r
    thickness: Math.max(0.02, thickness),\r
    focalLength: Math.max(0.05, focalLength),\r
    rotation: (rotationDeg * Math.PI) / 180,\r
    xOffset,\r
    yOffset,\r
    brightness: Math.max(0, brightness),\r
    glow: Math.max(0, glow),\r
    core: clamp(core, 0, 1),\r
    grain: Math.max(0, grain),\r
    quality: clamp(quality, 0.25, 1),\r
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
      stencil: false,\r
      powerPreference: 'high-performance'\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const floatTargets = !!gl.getExtension('EXT_color_buffer_float');\r
    const range = floatTargets ? 1 : 0.25;\r
    const programs = {\r
      coarse: link(gl, COARSE),\r
      fine: link(gl, FINE),\r
      down: link(gl, DOWN),\r
      up: link(gl, UP),\r
      composite: link(gl, COMPOSITE)\r
    } as Record<string, Program>;\r
    if (Object.values(programs).some(entry => !entry)) return undefined;\r
\r
    const buffer = gl.createBuffer();\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const createTarget = (): Target => ({\r
      texture: gl.createTexture(),\r
      framebuffer: gl.createFramebuffer(),\r
      width: 0,\r
      height: 0\r
    });\r
    const sizeTarget = (target: Target, width: number, height: number) => {\r
      if (target.width === width && target.height === height) return;\r
      target.width = width;\r
      target.height = height;\r
      gl.bindTexture(gl.TEXTURE_2D, target.texture);\r
      if (floatTargets) {\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.HALF_FLOAT, null);\r
      } else {\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
      }\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target.texture, 0);\r
    };\r
    const coarse = createTarget();\r
    const fine = createTarget();\r
    const down = Array.from({ length: BLOOM_LEVELS + 1 }, createTarget);\r
    const up = Array.from({ length: BLOOM_LEVELS }, createTarget);\r
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
        probe.fillStyle = '#000000';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r, g, b].map(v => Math.pow(v / 255, 2.2));\r
      }\r
      colorCache.set(value, rgb);\r
      return rgb;\r
    };\r
\r
    const view = { width: 1, height: 1, fineWidth: 1, fineHeight: 1, coarseWidth: 1, coarseHeight: 1 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const state = {\r
      time: 0,\r
      intro: settingsRef.current.intro && !reduce ? 0 : 1,\r
      heat: 0,\r
      heatVelocity: 0,\r
      heatX: 0,\r
      lensX: 0,\r
      lensY: 0\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const run = (entry: Program, target: Target | null, width: number, height: number) => {\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.framebuffer : null);\r
      gl.viewport(0, 0, width, height);\r
      gl.useProgram(entry.program);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const bindTexture = (entry: Program, name: string, unit: number, texture: WebGLTexture | null) => {\r
      gl.activeTexture(gl.TEXTURE0 + unit);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.uniform1i(entry.uniforms[name], unit);\r
    };\r
\r
    const setScene = (entry: Program, s: Settings, presence: number) => {\r
      const u = entry.uniforms;\r
      gl.useProgram(entry.program);\r
      gl.uniform2f(u.uView, view.width, view.height);\r
      gl.uniform2f(u.uOffset, s.xOffset, s.yOffset);\r
      gl.uniform1f(u.uRotation, s.rotation);\r
      gl.uniform1f(u.uFocalLength, s.focalLength);\r
      gl.uniform1f(u.uTime, state.time);\r
      gl.uniform1f(u.uSpeed1, s.speed1);\r
      gl.uniform1f(u.uSpeed2, s.speed2);\r
      gl.uniform1f(u.uDir2, s.dir2);\r
      gl.uniform1f(u.uBend1, s.bend1 * (0.3 + 0.7 * presence));\r
      gl.uniform1f(u.uBend2, s.bend2 * (0.3 + 0.7 * presence));\r
      gl.uniform1f(u.uThickness, s.thickness);\r
      gl.uniform3f(u.uHeat, state.heatX, state.heat, 1.4);\r
      gl.uniform3fv(u.uColor1, toLinear(s.color1));\r
      gl.uniform3fv(u.uColor2, toLinear(s.color2));\r
      gl.uniform1f(u.uCore, s.core);\r
      gl.uniform1f(u.uRange, range);\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const presence = state.intro * state.intro * (3 - 2 * state.intro);\r
      gl.bindVertexArray(vao);\r
      sizeTarget(coarse, view.coarseWidth, view.coarseHeight);\r
      sizeTarget(fine, view.fineWidth, view.fineHeight);\r
\r
      setScene(programs.coarse, s, presence);\r
      gl.uniform2f(programs.coarse.uniforms.uScale, view.width / view.coarseWidth, view.height / view.coarseHeight);\r
      run(programs.coarse, coarse, view.coarseWidth, view.coarseHeight);\r
\r
      const refine = programs.fine;\r
      setScene(refine, s, presence);\r
      gl.uniform2f(refine.uniforms.uScale, view.width / view.fineWidth, view.height / view.fineHeight);\r
      gl.uniform2f(refine.uniforms.uCoarseSize, view.coarseWidth, view.coarseHeight);\r
      gl.uniform2f(refine.uniforms.uFineSize, view.fineWidth, view.fineHeight);\r
      bindTexture(refine, 'uCoarse', 0, coarse.texture);\r
      run(refine, fine, view.fineWidth, view.fineHeight);\r
\r
      let source = fine;\r
      for (let level = 0; level <= BLOOM_LEVELS; level++) {\r
        const target = down[level];\r
        const width = level === 0 ? Math.round(view.width / 2) : source.width >> 1;\r
        const height = level === 0 ? Math.round(view.height / 2) : source.height >> 1;\r
        sizeTarget(target, Math.max(1, width), Math.max(1, height));\r
        gl.useProgram(programs.down.program);\r
        gl.uniform2f(programs.down.uniforms.uTexel, 1 / source.width, 1 / source.height);\r
        gl.uniform2f(programs.down.uniforms.uTarget, target.width, target.height);\r
        bindTexture(programs.down, 'uSource', 0, source.texture);\r
        run(programs.down, target, target.width, target.height);\r
        source = target;\r
      }\r
      for (let level = BLOOM_LEVELS - 1; level >= 1; level--) {\r
        const from = level === BLOOM_LEVELS - 1 ? down[BLOOM_LEVELS] : up[level + 1];\r
        const target = up[level];\r
        sizeTarget(target, down[level].width, down[level].height);\r
        gl.useProgram(programs.up.program);\r
        gl.uniform2f(programs.up.uniforms.uTexel, 1 / from.width, 1 / from.height);\r
        gl.uniform2f(programs.up.uniforms.uTarget, target.width, target.height);\r
        bindTexture(programs.up, 'uSource', 0, from.texture);\r
        bindTexture(programs.up, 'uBase', 1, down[level].texture);\r
        run(programs.up, target, target.width, target.height);\r
      }\r
\r
      const composite = programs.composite;\r
      const c = composite.uniforms;\r
      gl.useProgram(composite.program);\r
      gl.uniform2f(c.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(c.uExposure, (2.4 * s.brightness) / range);\r
      gl.uniform1f(c.uGlow, s.glow);\r
      gl.uniform1f(c.uCore, s.core);\r
      gl.uniform1f(c.uPresence, presence * presence);\r
      gl.uniform1f(c.uGrain, s.grain);\r
      gl.uniform1f(c.uFade, s.fade);\r
      gl.uniform1f(c.uOpacity, s.opacity);\r
      gl.uniform1f(c.uTime, state.time);\r
      gl.uniform1f(c.uLightMode, s.lightMode ? 1 : 0);\r
      gl.uniform3f(\r
        c.uLens,\r
        (state.lensX * canvas.width) / view.width,\r
        ((view.height - state.lensY) * canvas.height) / view.height,\r
        state.heat\r
      );\r
      bindTexture(composite, 'uLight', 0, fine.texture);\r
      bindTexture(composite, 'uBloom', 1, up[1].texture);\r
      run(composite, null, canvas.width, canvas.height);\r
    };\r
\r
    const heatTarget = (s: Settings): number | null => {\r
      if (!(s.mouseInteraction && pointer.inside) || reduce) return null;\r
      const x = pointer.x + s.xOffset - view.width / 2;\r
      const y = view.height - pointer.y + s.yOffset - view.height / 2;\r
      const c = Math.cos(s.rotation);\r
      const sn = Math.sin(s.rotation);\r
      return (7 * (c * x + sn * y)) / view.height / s.focalLength - 15;\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const moving = !s.paused && !reduce;\r
      if (moving) state.time += dt * s.speed;\r
      if (!s.intro || reduce) state.intro = 1;\r
      else if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / INTRO_SECONDS);\r
      const target = heatTarget(s);\r
      if (target !== null) state.heatX += (target - state.heatX) * (1 - Math.exp(-dt * 6));\r
      state.heatVelocity += (120 * ((target === null ? 0 : 1) - state.heat) - 19 * state.heatVelocity) * dt;\r
      state.heat = clamp(state.heat + state.heatVelocity * dt, 0, 1.15);\r
      state.lensX += (pointer.x - state.lensX) * (1 - Math.exp(-dt * 8));\r
      state.lensY += (pointer.y - state.lensY) * (1 - Math.exp(-dt * 8));\r
      render();\r
      const settling = state.intro < 1 || state.heat > 0.001 || Math.abs(state.heatVelocity) > 0.001;\r
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
      let scale = s.quality;\r
      if (width * height * scale * scale > MAX_LIGHT_PIXELS) scale = Math.sqrt(MAX_LIGHT_PIXELS / (width * height));\r
      view.fineWidth = Math.max(1, Math.round(width * scale));\r
      view.fineHeight = Math.max(1, Math.round(height * scale));\r
      view.coarseWidth = Math.max(1, Math.round(view.fineWidth / COARSE_RATIO));\r
      view.coarseHeight = Math.max(1, Math.round(view.fineHeight / COARSE_RATIO));\r
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
      for (const target of [coarse, fine, ...down, ...up]) {\r
        gl.deleteTexture(target.texture);\r
        gl.deleteFramebuffer(target.framebuffer);\r
      }\r
      for (const entry of Object.values(programs)) gl.deleteProgram(entry.program);\r
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
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
}\r
`,a={usage:`import PlasmaWave from './PlasmaWave';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <PlasmaWave
    colors={['#A855F7', '#06B6D4']}
    speed={1}
    bend1={1}
    bend2={0.5}
    thickness={0.3}
    glow={1}
    core={0.6}
    mouseInteraction={true}
  />
</div>`,code:r,css:e,tailwind:n,tsCode:t,tsTailwind:o};export{a as plasmaWave};
