const r=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
import './PixelSnow.css';\r
\r
const SPRITES = {\r
  square: [\r
    ['@'],\r
    ['oo', 'oo'],\r
    ['xox', 'o@o', 'xox'],\r
    ['xoox', 'o@@o', 'o@@o', 'xoox'],\r
    ['xooox', 'oo@oo', 'o@@@o', 'oo@oo', 'xooox'],\r
    ['xox', 'o@o', 'xox'],\r
    ['xoox', 'o@@o', 'o@@o', 'xoox'],\r
    ['xooox', 'oo@oo', 'o@@@o', 'oo@oo', 'xooox']\r
  ],\r
  round: [\r
    ['@'],\r
    ['.x.', 'x@x', '.x.'],\r
    ['.xx.', 'x@@x', 'x@@x', '.xx.'],\r
    ['.xxx.', 'xo@ox', 'x@@@x', 'xo@ox', '.xxx.'],\r
    ['..xxx..', '.xooox.', 'xoo@oox', 'xo@@@ox', 'xoo@oox', '.xooox.', '..xxx..'],\r
    ['.xx.', 'x@@x', 'x@@x', '.xx.'],\r
    ['.xxx.', 'xo@ox', 'x@@@x', 'xo@ox', '.xxx.'],\r
    ['..xxx..', '.xooox.', 'xoo@oox', 'xo@@@ox', 'xoo@oox', '.xooox.', '..xxx..']\r
  ],\r
  snowflake: [\r
    ['@'],\r
    ['.x.', 'x@x', '.x.'],\r
    ['..x..', 'x.o.x', '.o@o.', 'x.o.x', '..x..'],\r
    ['...x...', '.x.o.x.', '..ooo..', 'xoo@oox', '..ooo..', '.x.o.x.', '...x...'],\r
    [\r
      '....x....',\r
      '.x..o..x.',\r
      '..o.o.o..',\r
      '...ooo...',\r
      'xooo@ooox',\r
      '...ooo...',\r
      '..o.o.o..',\r
      '.x..o..x.',\r
      '....x....'\r
    ],\r
    ['x...x', '.o.o.', '..@..', '.o.o.', 'x...x'],\r
    ['x..x..x', '.o.o.o.', '..ooo..', 'xoo@oox', '..ooo..', '.o.o.o.', 'x..x..x'],\r
    [\r
      'x...x...x',\r
      '.o..o..o.',\r
      '..o.o.o..',\r
      '...ooo...',\r
      'xooo@ooox',\r
      '...ooo...',\r
      '..o.o.o..',\r
      '.o..o..o.',\r
      'x...x...x'\r
    ]\r
  ]\r
};\r
\r
const VARIANTS = ['square', 'round', 'snowflake'];\r
const CELL = 9;\r
const LEVELS = 5;\r
const SLOTS = 8;\r
const MAX_FLAKES = 4000;\r
const LEVEL_WEIGHTS = [0.46, 0.27, 0.15, 0.08, 0.04];\r
const LEVEL_FALL = [16, 24, 34, 48, 66];\r
const LEVEL_LIGHT = [0.42, 0.58, 0.76, 0.92, 1];\r
const INTRO_SECONDS = 1.4;\r
\r
const QUAD_VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const FLAKE_VERTEX = \`#version 300 es\r
in vec2 aCorner;\r
in vec4 aFlake;\r
uniform vec2 uGrid;\r
uniform vec4 uSizes;\r
uniform float uLargest;\r
flat out ivec2 vOrigin;\r
flat out ivec2 vCell;\r
flat out int vSize;\r
flat out float vLight;\r
void main() {\r
  int index = int(aFlake.z + 0.5);\r
  int slot = index % \${SLOTS};\r
  int variant = index / \${SLOTS};\r
  int level = slot < \${LEVELS} ? slot : slot - 3;\r
  float size = level == 0 ? 1.0 : (level == 1 ? uSizes.x : (level == 2 ? uSizes.y : (level == 3 ? uSizes.z : uLargest)));\r
  vec2 origin = floor(aFlake.xy) - floor(size * 0.5);\r
  origin.y = uGrid.y - origin.y - size;\r
  vec2 corner = origin + (aCorner * 0.5 + 0.5) * size;\r
  gl_Position = vec4(corner / uGrid * 2.0 - 1.0, 0.0, 1.0);\r
  vOrigin = ivec2(origin);\r
  vCell = ivec2(slot * \${CELL}, variant * \${CELL});\r
  vSize = int(size);\r
  vLight = aFlake.w;\r
}\`;\r
\r
const FLAKE_FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform sampler2D uAtlas;\r
flat in ivec2 vOrigin;\r
flat in ivec2 vCell;\r
flat in int vSize;\r
flat in float vLight;\r
out vec4 outColor;\r
void main() {\r
  ivec2 local = ivec2(gl_FragCoord.xy) - vOrigin;\r
  if (local.x < 0 || local.y < 0 || local.x >= vSize || local.y >= vSize) discard;\r
  vec4 texel = texelFetch(uAtlas, vCell + local, 0);\r
  if (texel.r < 0.5) discard;\r
  outColor = vec4(vLight, texel.g * vLight, 0.0, 1.0);\r
}\`;\r
\r
const PILE = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform sampler2D uPile;\r
uniform float uTime;\r
uniform float uLight;\r
out vec4 outColor;\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
void main() {\r
  ivec2 cell = ivec2(gl_FragCoord.xy);\r
  float height = texelFetch(uPile, ivec2(cell.x, 0), 0).r;\r
  float row = float(cell.y);\r
  if (row >= floor(height + 0.5)) discard;\r
  float below = floor(height + 0.5) - row;\r
  float crest = below <= 1.0 ? 1.0 : 0.0;\r
  ivec2 bayerCell = cell & 3;\r
  int bayerIndex = bayerCell.x + bayerCell.y * 4;\r
  float bayer[16] = float[16](0.0, 8.0, 2.0, 10.0, 12.0, 4.0, 14.0, 6.0, 3.0, 11.0, 1.0, 9.0, 15.0, 7.0, 13.0, 5.0);\r
  float threshold = (bayer[bayerIndex] + 0.5) / 16.0;\r
  float shade = clamp((below - 1.0) / 9.0, 0.0, 1.0) * 3.0;\r
  float step3 = floor(shade) + step(threshold, fract(shade));\r
  float body = 0.94 - step3 * 0.13;\r
  float glint = below <= 3.0 ? step(0.992, hash(vec2(cell) + floor(uTime * 1.1 + hash(vec2(cell.yx)) * 9.0))) : 0.0;\r
  float core = crest * 0.6 + glint;\r
  outColor = vec4(body, core, 0.0, 1.0) * uLight;\r
}\`;\r
\r
const DOWN = \`#version 300 es\r
precision highp float;\r
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
const UP = \`#version 300 es\r
precision highp float;\r
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
  outColor = (sum / 12.0 + texture(uBase, uv)) * 0.5;\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uSnow;\r
uniform sampler2D uGlowMap;\r
uniform vec2 uResolution;\r
uniform vec2 uGrid;\r
uniform float uPixel;\r
uniform vec3 uColor;\r
uniform float uBrightness;\r
uniform float uGlow;\r
uniform float uFade;\r
uniform float uOpacity;\r
uniform float uLightMode;\r
out vec4 outColor;\r
\r
float smootherstep(float edge, float x) {\r
  float t = clamp(x / max(edge, 0.0001), 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uResolution;\r
  ivec2 cell = ivec2(floor(gl_FragCoord.xy / uPixel));\r
  vec4 snow = texelFetch(uSnow, clamp(cell, ivec2(0), ivec2(uGrid) - 1), 0);\r
  vec2 glow = texture(uGlowMap, gl_FragCoord.xy / (uGrid * uPixel)).rg;\r
  float edge = uFade * 0.5;\r
  float mask = smootherstep(edge, uv.x) * smootherstep(edge, 1.0 - uv.x) * smootherstep(edge, uv.y) * smootherstep(edge, 1.0 - uv.y);\r
  mask *= uOpacity;\r
  float body = clamp(snow.r * uBrightness, 0.0, 1.0);\r
  float core = clamp(snow.g * uBrightness, 0.0, 1.0);\r
  float halo = clamp(glow.r * uGlow * uBrightness, 0.0, 1.0);\r
  if (uLightMode > 0.5) {\r
    vec3 tint = mix(uColor, vec3(1.0), clamp(core / max(body, 0.001), 0.0, 1.0) * 0.45);\r
    float alpha = body * 0.95;\r
    vec4 color = vec4(tint * alpha, alpha);\r
    float soft = halo * 0.22 * (1.0 - alpha);\r
    color += vec4(uColor * soft, soft);\r
    outColor = color * mask;\r
  } else {\r
    vec3 color = uColor * (body * 0.82 + core * 0.18) + uColor * halo * 0.55;\r
    color = 1.0 - exp(-color * 1.6);\r
    color *= mask;\r
    outColor = vec4(color, max(color.r, max(color.g, color.b)));\r
  }\r
}\`;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const seeded = seed => {\r
  let a = seed >>> 0;\r
  return () => {\r
    a = (a + 0x6d2b79f5) >>> 0;\r
    let t = a;\r
    t = Math.imul(t ^ (t >>> 15), t | 1);\r
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\r
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\r
  };\r
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
const buildAtlas = () => {\r
  const width = CELL * SLOTS;\r
  const height = CELL * VARIANTS.length;\r
  const data = new Uint8Array(width * height * 4);\r
  VARIANTS.forEach((variant, row) => {\r
    SPRITES[variant].forEach((rows, level) => {\r
      rows.forEach((line, y) => {\r
        for (let x = 0; x < line.length; x++) {\r
          const mark = line[x];\r
          if (mark === '.') continue;\r
          const offset = ((row * CELL + y) * width + level * CELL + x) * 4;\r
          data[offset] = 255;\r
          data[offset + 1] = mark === '@' ? 255 : mark === 'o' ? 128 : 0;\r
          data[offset + 3] = 255;\r
        }\r
      });\r
    });\r
  });\r
  return { data, width, height };\r
};\r
\r
export default function PixelSnow({\r
  color = '#ffffff',\r
  variant = 'snowflake',\r
  density = 0.5,\r
  speed = 1,\r
  wind = 0.25,\r
  sway = 0.5,\r
  flakeSize = 1,\r
  pixelSize = 3,\r
  depth = 0.6,\r
  brightness = 1,\r
  glow = 0.8,\r
  twinkle = 0.35,\r
  accumulate = false,\r
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
    color: String(color),\r
    variant: Math.max(0, VARIANTS.indexOf(variant)),\r
    density: clamp(density, 0, 1),\r
    speed,\r
    wind: clamp(wind, -2, 2),\r
    sway: Math.max(0, sway),\r
    flakeSize: clamp(flakeSize, 0, 2),\r
    pixelSize: Math.round(clamp(pixelSize, 1, 12)),\r
    depth: clamp(depth, 0, 1),\r
    brightness: Math.max(0, brightness),\r
    glow: Math.max(0, glow),\r
    twinkle: clamp(twinkle, 0, 1),\r
    accumulate,\r
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
    const programs = {\r
      flake: link(gl, FLAKE_VERTEX, FLAKE_FRAGMENT, ['aCorner', 'aFlake']),\r
      pile: link(gl, QUAD_VERTEX, PILE, ['aPosition']),\r
      down: link(gl, QUAD_VERTEX, DOWN, ['aPosition']),\r
      up: link(gl, QUAD_VERTEX, UP, ['aPosition']),\r
      composite: link(gl, QUAD_VERTEX, COMPOSITE, ['aPosition'])\r
    };\r
    if (Object.values(programs).some(entry => !entry)) return undefined;\r
\r
    const atlas = buildAtlas();\r
    const atlasTexture = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, atlasTexture);\r
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, atlas.width, atlas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, atlas.data);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
\r
    const quadBuffer = gl.createBuffer();\r
    const quadVao = gl.createVertexArray();\r
    gl.bindVertexArray(quadVao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const cornerBuffer = gl.createBuffer();\r
    const instanceBuffer = gl.createBuffer();\r
    const flakeVao = gl.createVertexArray();\r
    gl.bindVertexArray(flakeVao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);\r
    gl.enableVertexAttribArray(1);\r
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 0, 0);\r
    gl.vertexAttribDivisor(1, 1);\r
    gl.bindVertexArray(null);\r
\r
    const createTarget = filter => {\r
      const target = { texture: gl.createTexture(), framebuffer: gl.createFramebuffer(), width: 0, height: 0 };\r
      gl.bindTexture(gl.TEXTURE_2D, target.texture);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      return target;\r
    };\r
    const sizeTarget = (target, width, height) => {\r
      if (target.width === width && target.height === height) return;\r
      target.width = width;\r
      target.height = height;\r
      gl.bindTexture(gl.TEXTURE_2D, target.texture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target.texture, 0);\r
    };\r
    const snow = createTarget(gl.NEAREST);\r
    const pileTexture = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, pileTexture);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    let pile = new Float32Array(0);\r
    let pileWidth = 0;\r
    const down = [createTarget(gl.LINEAR), createTarget(gl.LINEAR), createTarget(gl.LINEAR)];\r
    const up = [createTarget(gl.LINEAR), createTarget(gl.LINEAR)];\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const colorCache = new Map();\r
    const toRgb = value => {\r
      if (colorCache.has(value)) return colorCache.get(value);\r
      let rgb = [1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#ffffff';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      colorCache.set(value, rgb);\r
      return rgb;\r
    };\r
\r
    const rng = seeded(4271);\r
    const flakes = [];\r
    const view = { width: 1, height: 1, ratio: 1, pixel: 1, gridWidth: 1, gridHeight: 1 };\r
    const pointer = { x: 0, y: 0, vx: 0, vy: 0, inside: false, time: 0 };\r
    const state = { time: 0, intro: settingsRef.current.intro && !reduce ? 0 : 1, push: 0 };\r
    const instances = new Float32Array(MAX_FLAKES * 4);\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const pickLevel = (r, s) => {\r
      const shift = s.flakeSize - 1;\r
      let total = 0;\r
      const weights = LEVEL_WEIGHTS.map((weight, level) => weight * Math.pow(2.2, shift * (level - 1.5)));\r
      const sum = weights.reduce((a, b) => a + b, 0);\r
      for (let level = 0; level < LEVELS; level++) {\r
        total += weights[level] / sum;\r
        if (r <= total) return level;\r
      }\r
      return LEVELS - 1;\r
    };\r
\r
    const spawn = (flake, s, top) => {\r
      flake.level = pickLevel(rng(), s);\r
      flake.x = rng() * (view.width + 40) - 20;\r
      flake.y = top ? -10 - rng() * 30 : rng() * view.height;\r
      flake.vx = 0;\r
      flake.vy = LEVEL_FALL[flake.level];\r
      flake.phase = rng() * Math.PI * 2;\r
      flake.rate = 0.6 + rng() * 0.9;\r
      flake.sparkle = rng() * 100;\r
      flake.drift = 0.7 + rng() * 0.6;\r
      flake.alt = rng() < 0.5;\r
      flake.reveal = rng();\r
      flake.levelSize = s.flakeSize;\r
    };\r
\r
    const populate = s => {\r
      const target = Math.round(clamp((view.width * view.height * s.density) / 1100, 0, MAX_FLAKES));\r
      while (flakes.length < target) {\r
        const flake = {};\r
        spawn(flake, s, false);\r
        flakes.push(flake);\r
      }\r
      if (flakes.length > target) flakes.length = target;\r
    };\r
\r
    const simulate = (s, dt) => {\r
      const fall = s.speed;\r
      const windSpeed = s.wind * 46;\r
      const radius = 120;\r
      const pushing = state.push > 0.001 && pointer.inside;\r
      const margin = 24;\r
      const settle = s.accumulate && fall > 0 && pile.length > 0;\r
      for (const flake of flakes) {\r
        if (flake.levelSize !== s.flakeSize) {\r
          flake.level = pickLevel(rng(), s);\r
          flake.levelSize = s.flakeSize;\r
        }\r
        const level = flake.level;\r
        const parallax = 1 - s.depth * (1 - (level + 1) / LEVELS) * 0.75;\r
        const swing = Math.sin(state.time * flake.rate + flake.phase) * s.sway * (6 + level * 7);\r
        const targetX = (windSpeed * parallax + swing) * flake.drift;\r
        const targetY = LEVEL_FALL[level] * parallax * fall * flake.drift;\r
        const ease = 1 - Math.exp(-dt * 2.2);\r
        flake.vx += (targetX - flake.vx) * ease;\r
        flake.vy += (targetY - flake.vy) * ease;\r
        if (pushing) {\r
          const dx = flake.x - pointer.x;\r
          const dy = flake.y - pointer.y;\r
          const distance = Math.hypot(dx, dy);\r
          if (distance < radius && distance > 0.001) {\r
            const near = 1 - distance / radius;\r
            const repel = near * near * near * state.push * 1500 * dt;\r
            const carry = near * near * state.push * dt * 5;\r
            flake.vx += (dx / distance) * repel + pointer.vx * carry;\r
            flake.vy += (dy / distance) * repel + pointer.vy * carry;\r
          }\r
        }\r
        flake.x += flake.vx * dt;\r
        flake.y += flake.vy * dt;\r
        if (settle) {\r
          const column = Math.floor(flake.x / view.pixel);\r
          if (column >= 0 && column < pile.length) {\r
            const surface = view.height - pile[column] * view.pixel;\r
            if (flake.y >= surface && pile[column] > 0.5) {\r
              const reach = level;\r
              for (let k = -reach; k <= reach; k++) {\r
                const index = column + k;\r
                if (index >= 0 && index < pile.length)\r
                  pile[index] += (0.35 + level * 0.15) * (1 - Math.abs(k) / (reach + 1));\r
              }\r
              spawn(flake, s, true);\r
              flake.reveal = -1;\r
              continue;\r
            }\r
          }\r
        }\r
        if (fall >= 0 ? flake.y > view.height + margin : flake.y < -margin) {\r
          spawn(flake, s, true);\r
          flake.reveal = -1;\r
          if (fall < 0) flake.y = view.height + 10 + rng() * 30;\r
        }\r
        if (flake.x < -margin) flake.x += view.width + margin * 2;\r
        else if (flake.x > view.width + margin) flake.x -= view.width + margin * 2;\r
      }\r
    };\r
\r
    const settlePile = (s, dt) => {\r
      if (!pile.length) return;\r
      const cap = Math.max(4, view.gridHeight * 0.08);\r
      if (s.accumulate && s.speed > 0) {\r
        const grow = (0.25 + s.density * 0.9) * dt * Math.min(1, s.speed);\r
        for (let i = 0; i < pile.length; i++) {\r
          const dune = 0.55 + 0.45 * Math.sin(i * 0.045 + Math.sin(i * 0.013) * 2.1) * Math.sin(i * 0.021 + 1.3);\r
          if (pile[i] < cap * dune) pile[i] += grow * (0.6 + 0.8 * dune);\r
        }\r
      }\r
      for (let pass = 0; pass < 2; pass++) {\r
        const forward = pass === 0;\r
        for (let k = 0; k < pile.length - 1; k++) {\r
          const i = forward ? k : pile.length - 2 - k;\r
          const difference = pile[i] - pile[i + 1];\r
          if (Math.abs(difference) > 1.2) {\r
            const move = (Math.abs(difference) - 1.2) * 0.5 * Math.sign(difference);\r
            pile[i] -= move;\r
            pile[i + 1] += move;\r
          }\r
        }\r
      }\r
      for (let i = 0; i < pile.length; i++) {\r
        const excess = Math.max(0, pile[i] - cap);\r
        const rate = s.accumulate && s.speed > 0 ? excess * 0.8 : 2 + pile[i] * 0.6;\r
        pile[i] = Math.max(0, pile[i] - rate * dt);\r
      }\r
    };\r
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
    const render = () => {\r
      const s = settingsRef.current;\r
      sizeTarget(snow, view.gridWidth, view.gridHeight);\r
      let count = 0;\r
      const sizes = SPRITES[VARIANTS[s.variant]].map(rows => rows.length);\r
      const sweep = state.intro * 1.75;\r
      for (const flake of flakes) {\r
        const level = flake.level;\r
        const depthLight = 1 - s.depth * (1 - LEVEL_LIGHT[level]);\r
        const spark = Math.pow(Math.max(0, Math.sin(state.time * 0.9 + flake.sparkle)), 60) * s.twinkle;\r
        const reveal =\r
          flake.reveal < 0 || state.intro >= 1\r
            ? 1\r
            : clamp((sweep - flake.y / view.height - flake.reveal * 0.25) / 0.35, 0, 1);\r
        if (reveal <= 0) continue;\r
        const slot = level >= 2 && flake.alt ? level + 3 : level;\r
        const o = count * 4;\r
        instances[o] = flake.x / view.pixel;\r
        instances[o + 1] = flake.y / view.pixel;\r
        instances[o + 2] = s.variant * SLOTS + slot;\r
        instances[o + 3] = Math.min(1, depthLight * (0.85 + spark * 0.6)) * reveal * reveal;\r
        count++;\r
      }\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, snow.framebuffer);\r
      gl.viewport(0, 0, snow.width, snow.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      if (pile.length && pile.some(height => height > 0.4)) {\r
        gl.bindTexture(gl.TEXTURE_2D, pileTexture);\r
        if (pileWidth !== pile.length) {\r
          pileWidth = pile.length;\r
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, pileWidth, 1, 0, gl.RED, gl.FLOAT, pile);\r
        } else {\r
          gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, pileWidth, 1, gl.RED, gl.FLOAT, pile);\r
        }\r
        const pileProgram = programs.pile;\r
        gl.useProgram(pileProgram.program);\r
        gl.activeTexture(gl.TEXTURE0);\r
        gl.bindTexture(gl.TEXTURE_2D, pileTexture);\r
        gl.uniform1i(pileProgram.uniforms.uPile, 0);\r
        gl.uniform1f(pileProgram.uniforms.uTime, state.time);\r
        gl.uniform1f(pileProgram.uniforms.uLight, 1 - s.depth * 0.1);\r
        gl.bindVertexArray(quadVao);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      }\r
      if (count > 0) {\r
        const flake = programs.flake;\r
        gl.useProgram(flake.program);\r
        gl.uniform2f(flake.uniforms.uGrid, snow.width, snow.height);\r
        gl.uniform4f(flake.uniforms.uSizes, sizes[1], sizes[2], sizes[3], 0);\r
        gl.uniform1f(flake.uniforms.uLargest, sizes[4]);\r
        gl.activeTexture(gl.TEXTURE0);\r
        gl.bindTexture(gl.TEXTURE_2D, atlasTexture);\r
        gl.uniform1i(flake.uniforms.uAtlas, 0);\r
        gl.enable(gl.BLEND);\r
        gl.blendEquation(gl.MAX);\r
        gl.bindVertexArray(flakeVao);\r
        gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);\r
        gl.bufferData(gl.ARRAY_BUFFER, instances.subarray(0, count * 4), gl.DYNAMIC_DRAW);\r
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, count);\r
        gl.blendEquation(gl.FUNC_ADD);\r
        gl.disable(gl.BLEND);\r
      }\r
\r
      gl.bindVertexArray(quadVao);\r
      let source = snow;\r
      for (let level = 0; level < down.length; level++) {\r
        const target = down[level];\r
        sizeTarget(target, Math.max(1, Math.ceil(source.width / 2)), Math.max(1, Math.ceil(source.height / 2)));\r
        gl.useProgram(programs.down.program);\r
        gl.uniform2f(programs.down.uniforms.uTexel, 1 / source.width, 1 / source.height);\r
        gl.uniform2f(programs.down.uniforms.uTarget, target.width, target.height);\r
        bindTexture(programs.down, 'uSource', 0, source.texture);\r
        run(programs.down, target, target.width, target.height);\r
        source = target;\r
      }\r
      for (let level = up.length - 1; level >= 0; level--) {\r
        const from = level === up.length - 1 ? down[down.length - 1] : up[level + 1];\r
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
      gl.uniform2f(c.uGrid, snow.width, snow.height);\r
      gl.uniform1f(c.uPixel, view.pixel * view.ratio);\r
      gl.uniform3fv(c.uColor, toRgb(s.color));\r
      gl.uniform1f(c.uBrightness, s.brightness);\r
      gl.uniform1f(c.uGlow, s.glow);\r
      gl.uniform1f(c.uFade, s.fade);\r
      gl.uniform1f(c.uOpacity, s.opacity);\r
      gl.uniform1f(c.uLightMode, s.lightMode ? 1 : 0);\r
      bindTexture(composite, 'uSnow', 0, snow.texture);\r
      bindTexture(composite, 'uGlowMap', 1, up[0].texture);\r
      run(composite, null, canvas.width, canvas.height);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const moving = !s.paused && !reduce;\r
      if (!s.intro || reduce) state.intro = 1;\r
      else if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / INTRO_SECONDS);\r
      const goal = s.mouseInteraction && pointer.inside && !reduce ? 1 : 0;\r
      state.push += (goal - state.push) * (1 - Math.exp(-dt * (goal ? 6 : 3)));\r
      pointer.vx *= Math.exp(-dt * 6);\r
      pointer.vy *= Math.exp(-dt * 6);\r
      populate(s);\r
      if (moving) {\r
        state.time += dt;\r
        simulate(s, dt);\r
        settlePile(s, dt);\r
      }\r
      render();\r
      if (moving || Math.abs(goal - state.push) > 0.001) raf = requestAnimationFrame(frame);\r
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
      view.ratio = ratio;\r
      view.pixel = Math.max(1, Math.round(s.pixelSize * ratio)) / ratio;\r
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      view.gridWidth = Math.max(1, Math.ceil(width / view.pixel));\r
      view.gridHeight = Math.max(1, Math.ceil(height / view.pixel));\r
      if (pile.length !== view.gridWidth) pile = new Float32Array(view.gridWidth);\r
      populate(s);\r
      if (!raf) render();\r
      wake();\r
    };\r
\r
    const onPointerMove = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      const now = performance.now();\r
      if (pointer.inside && pointer.time) {\r
        const elapsed = Math.max(1, now - pointer.time) / 1000;\r
        pointer.vx = clamp((x - pointer.x) / elapsed, -3000, 3000);\r
        pointer.vy = clamp((y - pointer.y) / elapsed, -3000, 3000);\r
      }\r
      pointer.x = x;\r
      pointer.y = y;\r
      pointer.time = now;\r
      pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
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
    let lastPixel = settingsRef.current.pixelSize;\r
    let lastDpr = settingsRef.current.dpr;\r
    wakeRef.current = () => {\r
      const s = settingsRef.current;\r
      if (s.pixelSize !== lastPixel || s.dpr !== lastDpr) {\r
        lastPixel = s.pixelSize;\r
        lastDpr = s.dpr;\r
        resize();\r
        return;\r
      }\r
      populate(s);\r
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
      for (const target of [snow, ...down, ...up]) {\r
        gl.deleteTexture(target.texture);\r
        gl.deleteFramebuffer(target.framebuffer);\r
      }\r
      for (const entry of Object.values(programs)) gl.deleteProgram(entry.program);\r
      gl.deleteTexture(atlasTexture);\r
      gl.deleteTexture(pileTexture);\r
      gl.deleteBuffer(quadBuffer);\r
      gl.deleteBuffer(cornerBuffer);\r
      gl.deleteBuffer(instanceBuffer);\r
      gl.deleteVertexArray(quadVao);\r
      gl.deleteVertexArray(flakeVao);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div ref={containerRef} className={\`pixel-snow-container\${className ? \` \${className}\` : ''}\`} {...rest}>\r
      <canvas ref={canvasRef} className="pixel-snow-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
}\r
`,e=`.pixel-snow-container {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.pixel-snow-canvas {\r
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
const SPRITES = {\r
  square: [\r
    ['@'],\r
    ['oo', 'oo'],\r
    ['xox', 'o@o', 'xox'],\r
    ['xoox', 'o@@o', 'o@@o', 'xoox'],\r
    ['xooox', 'oo@oo', 'o@@@o', 'oo@oo', 'xooox'],\r
    ['xox', 'o@o', 'xox'],\r
    ['xoox', 'o@@o', 'o@@o', 'xoox'],\r
    ['xooox', 'oo@oo', 'o@@@o', 'oo@oo', 'xooox']\r
  ],\r
  round: [\r
    ['@'],\r
    ['.x.', 'x@x', '.x.'],\r
    ['.xx.', 'x@@x', 'x@@x', '.xx.'],\r
    ['.xxx.', 'xo@ox', 'x@@@x', 'xo@ox', '.xxx.'],\r
    ['..xxx..', '.xooox.', 'xoo@oox', 'xo@@@ox', 'xoo@oox', '.xooox.', '..xxx..'],\r
    ['.xx.', 'x@@x', 'x@@x', '.xx.'],\r
    ['.xxx.', 'xo@ox', 'x@@@x', 'xo@ox', '.xxx.'],\r
    ['..xxx..', '.xooox.', 'xoo@oox', 'xo@@@ox', 'xoo@oox', '.xooox.', '..xxx..']\r
  ],\r
  snowflake: [\r
    ['@'],\r
    ['.x.', 'x@x', '.x.'],\r
    ['..x..', 'x.o.x', '.o@o.', 'x.o.x', '..x..'],\r
    ['...x...', '.x.o.x.', '..ooo..', 'xoo@oox', '..ooo..', '.x.o.x.', '...x...'],\r
    [\r
      '....x....',\r
      '.x..o..x.',\r
      '..o.o.o..',\r
      '...ooo...',\r
      'xooo@ooox',\r
      '...ooo...',\r
      '..o.o.o..',\r
      '.x..o..x.',\r
      '....x....'\r
    ],\r
    ['x...x', '.o.o.', '..@..', '.o.o.', 'x...x'],\r
    ['x..x..x', '.o.o.o.', '..ooo..', 'xoo@oox', '..ooo..', '.o.o.o.', 'x..x..x'],\r
    [\r
      'x...x...x',\r
      '.o..o..o.',\r
      '..o.o.o..',\r
      '...ooo...',\r
      'xooo@ooox',\r
      '...ooo...',\r
      '..o.o.o..',\r
      '.o..o..o.',\r
      'x...x...x'\r
    ]\r
  ]\r
};\r
\r
const VARIANTS = ['square', 'round', 'snowflake'];\r
const CELL = 9;\r
const LEVELS = 5;\r
const SLOTS = 8;\r
const MAX_FLAKES = 4000;\r
const LEVEL_WEIGHTS = [0.46, 0.27, 0.15, 0.08, 0.04];\r
const LEVEL_FALL = [16, 24, 34, 48, 66];\r
const LEVEL_LIGHT = [0.42, 0.58, 0.76, 0.92, 1];\r
const INTRO_SECONDS = 1.4;\r
\r
const QUAD_VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const FLAKE_VERTEX = \`#version 300 es\r
in vec2 aCorner;\r
in vec4 aFlake;\r
uniform vec2 uGrid;\r
uniform vec4 uSizes;\r
uniform float uLargest;\r
flat out ivec2 vOrigin;\r
flat out ivec2 vCell;\r
flat out int vSize;\r
flat out float vLight;\r
void main() {\r
  int index = int(aFlake.z + 0.5);\r
  int slot = index % \${SLOTS};\r
  int variant = index / \${SLOTS};\r
  int level = slot < \${LEVELS} ? slot : slot - 3;\r
  float size = level == 0 ? 1.0 : (level == 1 ? uSizes.x : (level == 2 ? uSizes.y : (level == 3 ? uSizes.z : uLargest)));\r
  vec2 origin = floor(aFlake.xy) - floor(size * 0.5);\r
  origin.y = uGrid.y - origin.y - size;\r
  vec2 corner = origin + (aCorner * 0.5 + 0.5) * size;\r
  gl_Position = vec4(corner / uGrid * 2.0 - 1.0, 0.0, 1.0);\r
  vOrigin = ivec2(origin);\r
  vCell = ivec2(slot * \${CELL}, variant * \${CELL});\r
  vSize = int(size);\r
  vLight = aFlake.w;\r
}\`;\r
\r
const FLAKE_FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform sampler2D uAtlas;\r
flat in ivec2 vOrigin;\r
flat in ivec2 vCell;\r
flat in int vSize;\r
flat in float vLight;\r
out vec4 outColor;\r
void main() {\r
  ivec2 local = ivec2(gl_FragCoord.xy) - vOrigin;\r
  if (local.x < 0 || local.y < 0 || local.x >= vSize || local.y >= vSize) discard;\r
  vec4 texel = texelFetch(uAtlas, vCell + local, 0);\r
  if (texel.r < 0.5) discard;\r
  outColor = vec4(vLight, texel.g * vLight, 0.0, 1.0);\r
}\`;\r
\r
const PILE = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform sampler2D uPile;\r
uniform float uTime;\r
uniform float uLight;\r
out vec4 outColor;\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
void main() {\r
  ivec2 cell = ivec2(gl_FragCoord.xy);\r
  float height = texelFetch(uPile, ivec2(cell.x, 0), 0).r;\r
  float row = float(cell.y);\r
  if (row >= floor(height + 0.5)) discard;\r
  float below = floor(height + 0.5) - row;\r
  float crest = below <= 1.0 ? 1.0 : 0.0;\r
  ivec2 bayerCell = cell & 3;\r
  int bayerIndex = bayerCell.x + bayerCell.y * 4;\r
  float bayer[16] = float[16](0.0, 8.0, 2.0, 10.0, 12.0, 4.0, 14.0, 6.0, 3.0, 11.0, 1.0, 9.0, 15.0, 7.0, 13.0, 5.0);\r
  float threshold = (bayer[bayerIndex] + 0.5) / 16.0;\r
  float shade = clamp((below - 1.0) / 9.0, 0.0, 1.0) * 3.0;\r
  float step3 = floor(shade) + step(threshold, fract(shade));\r
  float body = 0.94 - step3 * 0.13;\r
  float glint = below <= 3.0 ? step(0.992, hash(vec2(cell) + floor(uTime * 1.1 + hash(vec2(cell.yx)) * 9.0))) : 0.0;\r
  float core = crest * 0.6 + glint;\r
  outColor = vec4(body, core, 0.0, 1.0) * uLight;\r
}\`;\r
\r
const DOWN = \`#version 300 es\r
precision highp float;\r
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
const UP = \`#version 300 es\r
precision highp float;\r
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
  outColor = (sum / 12.0 + texture(uBase, uv)) * 0.5;\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uSnow;\r
uniform sampler2D uGlowMap;\r
uniform vec2 uResolution;\r
uniform vec2 uGrid;\r
uniform float uPixel;\r
uniform vec3 uColor;\r
uniform float uBrightness;\r
uniform float uGlow;\r
uniform float uFade;\r
uniform float uOpacity;\r
uniform float uLightMode;\r
out vec4 outColor;\r
\r
float smootherstep(float edge, float x) {\r
  float t = clamp(x / max(edge, 0.0001), 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uResolution;\r
  ivec2 cell = ivec2(floor(gl_FragCoord.xy / uPixel));\r
  vec4 snow = texelFetch(uSnow, clamp(cell, ivec2(0), ivec2(uGrid) - 1), 0);\r
  vec2 glow = texture(uGlowMap, gl_FragCoord.xy / (uGrid * uPixel)).rg;\r
  float edge = uFade * 0.5;\r
  float mask = smootherstep(edge, uv.x) * smootherstep(edge, 1.0 - uv.x) * smootherstep(edge, uv.y) * smootherstep(edge, 1.0 - uv.y);\r
  mask *= uOpacity;\r
  float body = clamp(snow.r * uBrightness, 0.0, 1.0);\r
  float core = clamp(snow.g * uBrightness, 0.0, 1.0);\r
  float halo = clamp(glow.r * uGlow * uBrightness, 0.0, 1.0);\r
  if (uLightMode > 0.5) {\r
    vec3 tint = mix(uColor, vec3(1.0), clamp(core / max(body, 0.001), 0.0, 1.0) * 0.45);\r
    float alpha = body * 0.95;\r
    vec4 color = vec4(tint * alpha, alpha);\r
    float soft = halo * 0.22 * (1.0 - alpha);\r
    color += vec4(uColor * soft, soft);\r
    outColor = color * mask;\r
  } else {\r
    vec3 color = uColor * (body * 0.82 + core * 0.18) + uColor * halo * 0.55;\r
    color = 1.0 - exp(-color * 1.6);\r
    color *= mask;\r
    outColor = vec4(color, max(color.r, max(color.g, color.b)));\r
  }\r
}\`;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const seeded = seed => {\r
  let a = seed >>> 0;\r
  return () => {\r
    a = (a + 0x6d2b79f5) >>> 0;\r
    let t = a;\r
    t = Math.imul(t ^ (t >>> 15), t | 1);\r
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\r
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\r
  };\r
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
const buildAtlas = () => {\r
  const width = CELL * SLOTS;\r
  const height = CELL * VARIANTS.length;\r
  const data = new Uint8Array(width * height * 4);\r
  VARIANTS.forEach((variant, row) => {\r
    SPRITES[variant].forEach((rows, level) => {\r
      rows.forEach((line, y) => {\r
        for (let x = 0; x < line.length; x++) {\r
          const mark = line[x];\r
          if (mark === '.') continue;\r
          const offset = ((row * CELL + y) * width + level * CELL + x) * 4;\r
          data[offset] = 255;\r
          data[offset + 1] = mark === '@' ? 255 : mark === 'o' ? 128 : 0;\r
          data[offset + 3] = 255;\r
        }\r
      });\r
    });\r
  });\r
  return { data, width, height };\r
};\r
\r
export default function PixelSnow({\r
  color = '#ffffff',\r
  variant = 'snowflake',\r
  density = 0.5,\r
  speed = 1,\r
  wind = 0.25,\r
  sway = 0.5,\r
  flakeSize = 1,\r
  pixelSize = 3,\r
  depth = 0.6,\r
  brightness = 1,\r
  glow = 0.8,\r
  twinkle = 0.35,\r
  accumulate = false,\r
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
    color: String(color),\r
    variant: Math.max(0, VARIANTS.indexOf(variant)),\r
    density: clamp(density, 0, 1),\r
    speed,\r
    wind: clamp(wind, -2, 2),\r
    sway: Math.max(0, sway),\r
    flakeSize: clamp(flakeSize, 0, 2),\r
    pixelSize: Math.round(clamp(pixelSize, 1, 12)),\r
    depth: clamp(depth, 0, 1),\r
    brightness: Math.max(0, brightness),\r
    glow: Math.max(0, glow),\r
    twinkle: clamp(twinkle, 0, 1),\r
    accumulate,\r
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
    const programs = {\r
      flake: link(gl, FLAKE_VERTEX, FLAKE_FRAGMENT, ['aCorner', 'aFlake']),\r
      pile: link(gl, QUAD_VERTEX, PILE, ['aPosition']),\r
      down: link(gl, QUAD_VERTEX, DOWN, ['aPosition']),\r
      up: link(gl, QUAD_VERTEX, UP, ['aPosition']),\r
      composite: link(gl, QUAD_VERTEX, COMPOSITE, ['aPosition'])\r
    };\r
    if (Object.values(programs).some(entry => !entry)) return undefined;\r
\r
    const atlas = buildAtlas();\r
    const atlasTexture = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, atlasTexture);\r
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, atlas.width, atlas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, atlas.data);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
\r
    const quadBuffer = gl.createBuffer();\r
    const quadVao = gl.createVertexArray();\r
    gl.bindVertexArray(quadVao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const cornerBuffer = gl.createBuffer();\r
    const instanceBuffer = gl.createBuffer();\r
    const flakeVao = gl.createVertexArray();\r
    gl.bindVertexArray(flakeVao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);\r
    gl.enableVertexAttribArray(1);\r
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 0, 0);\r
    gl.vertexAttribDivisor(1, 1);\r
    gl.bindVertexArray(null);\r
\r
    const createTarget = filter => {\r
      const target = { texture: gl.createTexture(), framebuffer: gl.createFramebuffer(), width: 0, height: 0 };\r
      gl.bindTexture(gl.TEXTURE_2D, target.texture);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      return target;\r
    };\r
    const sizeTarget = (target, width, height) => {\r
      if (target.width === width && target.height === height) return;\r
      target.width = width;\r
      target.height = height;\r
      gl.bindTexture(gl.TEXTURE_2D, target.texture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target.texture, 0);\r
    };\r
    const snow = createTarget(gl.NEAREST);\r
    const pileTexture = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, pileTexture);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    let pile = new Float32Array(0);\r
    let pileWidth = 0;\r
    const down = [createTarget(gl.LINEAR), createTarget(gl.LINEAR), createTarget(gl.LINEAR)];\r
    const up = [createTarget(gl.LINEAR), createTarget(gl.LINEAR)];\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const colorCache = new Map();\r
    const toRgb = value => {\r
      if (colorCache.has(value)) return colorCache.get(value);\r
      let rgb = [1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#ffffff';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      colorCache.set(value, rgb);\r
      return rgb;\r
    };\r
\r
    const rng = seeded(4271);\r
    const flakes = [];\r
    const view = { width: 1, height: 1, ratio: 1, pixel: 1, gridWidth: 1, gridHeight: 1 };\r
    const pointer = { x: 0, y: 0, vx: 0, vy: 0, inside: false, time: 0 };\r
    const state = { time: 0, intro: settingsRef.current.intro && !reduce ? 0 : 1, push: 0 };\r
    const instances = new Float32Array(MAX_FLAKES * 4);\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const pickLevel = (r, s) => {\r
      const shift = s.flakeSize - 1;\r
      let total = 0;\r
      const weights = LEVEL_WEIGHTS.map((weight, level) => weight * Math.pow(2.2, shift * (level - 1.5)));\r
      const sum = weights.reduce((a, b) => a + b, 0);\r
      for (let level = 0; level < LEVELS; level++) {\r
        total += weights[level] / sum;\r
        if (r <= total) return level;\r
      }\r
      return LEVELS - 1;\r
    };\r
\r
    const spawn = (flake, s, top) => {\r
      flake.level = pickLevel(rng(), s);\r
      flake.x = rng() * (view.width + 40) - 20;\r
      flake.y = top ? -10 - rng() * 30 : rng() * view.height;\r
      flake.vx = 0;\r
      flake.vy = LEVEL_FALL[flake.level];\r
      flake.phase = rng() * Math.PI * 2;\r
      flake.rate = 0.6 + rng() * 0.9;\r
      flake.sparkle = rng() * 100;\r
      flake.drift = 0.7 + rng() * 0.6;\r
      flake.alt = rng() < 0.5;\r
      flake.reveal = rng();\r
      flake.levelSize = s.flakeSize;\r
    };\r
\r
    const populate = s => {\r
      const target = Math.round(clamp((view.width * view.height * s.density) / 1100, 0, MAX_FLAKES));\r
      while (flakes.length < target) {\r
        const flake = {};\r
        spawn(flake, s, false);\r
        flakes.push(flake);\r
      }\r
      if (flakes.length > target) flakes.length = target;\r
    };\r
\r
    const simulate = (s, dt) => {\r
      const fall = s.speed;\r
      const windSpeed = s.wind * 46;\r
      const radius = 120;\r
      const pushing = state.push > 0.001 && pointer.inside;\r
      const margin = 24;\r
      const settle = s.accumulate && fall > 0 && pile.length > 0;\r
      for (const flake of flakes) {\r
        if (flake.levelSize !== s.flakeSize) {\r
          flake.level = pickLevel(rng(), s);\r
          flake.levelSize = s.flakeSize;\r
        }\r
        const level = flake.level;\r
        const parallax = 1 - s.depth * (1 - (level + 1) / LEVELS) * 0.75;\r
        const swing = Math.sin(state.time * flake.rate + flake.phase) * s.sway * (6 + level * 7);\r
        const targetX = (windSpeed * parallax + swing) * flake.drift;\r
        const targetY = LEVEL_FALL[level] * parallax * fall * flake.drift;\r
        const ease = 1 - Math.exp(-dt * 2.2);\r
        flake.vx += (targetX - flake.vx) * ease;\r
        flake.vy += (targetY - flake.vy) * ease;\r
        if (pushing) {\r
          const dx = flake.x - pointer.x;\r
          const dy = flake.y - pointer.y;\r
          const distance = Math.hypot(dx, dy);\r
          if (distance < radius && distance > 0.001) {\r
            const near = 1 - distance / radius;\r
            const repel = near * near * near * state.push * 1500 * dt;\r
            const carry = near * near * state.push * dt * 5;\r
            flake.vx += (dx / distance) * repel + pointer.vx * carry;\r
            flake.vy += (dy / distance) * repel + pointer.vy * carry;\r
          }\r
        }\r
        flake.x += flake.vx * dt;\r
        flake.y += flake.vy * dt;\r
        if (settle) {\r
          const column = Math.floor(flake.x / view.pixel);\r
          if (column >= 0 && column < pile.length) {\r
            const surface = view.height - pile[column] * view.pixel;\r
            if (flake.y >= surface && pile[column] > 0.5) {\r
              const reach = level;\r
              for (let k = -reach; k <= reach; k++) {\r
                const index = column + k;\r
                if (index >= 0 && index < pile.length)\r
                  pile[index] += (0.35 + level * 0.15) * (1 - Math.abs(k) / (reach + 1));\r
              }\r
              spawn(flake, s, true);\r
              flake.reveal = -1;\r
              continue;\r
            }\r
          }\r
        }\r
        if (fall >= 0 ? flake.y > view.height + margin : flake.y < -margin) {\r
          spawn(flake, s, true);\r
          flake.reveal = -1;\r
          if (fall < 0) flake.y = view.height + 10 + rng() * 30;\r
        }\r
        if (flake.x < -margin) flake.x += view.width + margin * 2;\r
        else if (flake.x > view.width + margin) flake.x -= view.width + margin * 2;\r
      }\r
    };\r
\r
    const settlePile = (s, dt) => {\r
      if (!pile.length) return;\r
      const cap = Math.max(4, view.gridHeight * 0.08);\r
      if (s.accumulate && s.speed > 0) {\r
        const grow = (0.25 + s.density * 0.9) * dt * Math.min(1, s.speed);\r
        for (let i = 0; i < pile.length; i++) {\r
          const dune = 0.55 + 0.45 * Math.sin(i * 0.045 + Math.sin(i * 0.013) * 2.1) * Math.sin(i * 0.021 + 1.3);\r
          if (pile[i] < cap * dune) pile[i] += grow * (0.6 + 0.8 * dune);\r
        }\r
      }\r
      for (let pass = 0; pass < 2; pass++) {\r
        const forward = pass === 0;\r
        for (let k = 0; k < pile.length - 1; k++) {\r
          const i = forward ? k : pile.length - 2 - k;\r
          const difference = pile[i] - pile[i + 1];\r
          if (Math.abs(difference) > 1.2) {\r
            const move = (Math.abs(difference) - 1.2) * 0.5 * Math.sign(difference);\r
            pile[i] -= move;\r
            pile[i + 1] += move;\r
          }\r
        }\r
      }\r
      for (let i = 0; i < pile.length; i++) {\r
        const excess = Math.max(0, pile[i] - cap);\r
        const rate = s.accumulate && s.speed > 0 ? excess * 0.8 : 2 + pile[i] * 0.6;\r
        pile[i] = Math.max(0, pile[i] - rate * dt);\r
      }\r
    };\r
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
    const render = () => {\r
      const s = settingsRef.current;\r
      sizeTarget(snow, view.gridWidth, view.gridHeight);\r
      let count = 0;\r
      const sizes = SPRITES[VARIANTS[s.variant]].map(rows => rows.length);\r
      const sweep = state.intro * 1.75;\r
      for (const flake of flakes) {\r
        const level = flake.level;\r
        const depthLight = 1 - s.depth * (1 - LEVEL_LIGHT[level]);\r
        const spark = Math.pow(Math.max(0, Math.sin(state.time * 0.9 + flake.sparkle)), 60) * s.twinkle;\r
        const reveal =\r
          flake.reveal < 0 || state.intro >= 1\r
            ? 1\r
            : clamp((sweep - flake.y / view.height - flake.reveal * 0.25) / 0.35, 0, 1);\r
        if (reveal <= 0) continue;\r
        const slot = level >= 2 && flake.alt ? level + 3 : level;\r
        const o = count * 4;\r
        instances[o] = flake.x / view.pixel;\r
        instances[o + 1] = flake.y / view.pixel;\r
        instances[o + 2] = s.variant * SLOTS + slot;\r
        instances[o + 3] = Math.min(1, depthLight * (0.85 + spark * 0.6)) * reveal * reveal;\r
        count++;\r
      }\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, snow.framebuffer);\r
      gl.viewport(0, 0, snow.width, snow.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      if (pile.length && pile.some(height => height > 0.4)) {\r
        gl.bindTexture(gl.TEXTURE_2D, pileTexture);\r
        if (pileWidth !== pile.length) {\r
          pileWidth = pile.length;\r
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, pileWidth, 1, 0, gl.RED, gl.FLOAT, pile);\r
        } else {\r
          gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, pileWidth, 1, gl.RED, gl.FLOAT, pile);\r
        }\r
        const pileProgram = programs.pile;\r
        gl.useProgram(pileProgram.program);\r
        gl.activeTexture(gl.TEXTURE0);\r
        gl.bindTexture(gl.TEXTURE_2D, pileTexture);\r
        gl.uniform1i(pileProgram.uniforms.uPile, 0);\r
        gl.uniform1f(pileProgram.uniforms.uTime, state.time);\r
        gl.uniform1f(pileProgram.uniforms.uLight, 1 - s.depth * 0.1);\r
        gl.bindVertexArray(quadVao);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      }\r
      if (count > 0) {\r
        const flake = programs.flake;\r
        gl.useProgram(flake.program);\r
        gl.uniform2f(flake.uniforms.uGrid, snow.width, snow.height);\r
        gl.uniform4f(flake.uniforms.uSizes, sizes[1], sizes[2], sizes[3], 0);\r
        gl.uniform1f(flake.uniforms.uLargest, sizes[4]);\r
        gl.activeTexture(gl.TEXTURE0);\r
        gl.bindTexture(gl.TEXTURE_2D, atlasTexture);\r
        gl.uniform1i(flake.uniforms.uAtlas, 0);\r
        gl.enable(gl.BLEND);\r
        gl.blendEquation(gl.MAX);\r
        gl.bindVertexArray(flakeVao);\r
        gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);\r
        gl.bufferData(gl.ARRAY_BUFFER, instances.subarray(0, count * 4), gl.DYNAMIC_DRAW);\r
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, count);\r
        gl.blendEquation(gl.FUNC_ADD);\r
        gl.disable(gl.BLEND);\r
      }\r
\r
      gl.bindVertexArray(quadVao);\r
      let source = snow;\r
      for (let level = 0; level < down.length; level++) {\r
        const target = down[level];\r
        sizeTarget(target, Math.max(1, Math.ceil(source.width / 2)), Math.max(1, Math.ceil(source.height / 2)));\r
        gl.useProgram(programs.down.program);\r
        gl.uniform2f(programs.down.uniforms.uTexel, 1 / source.width, 1 / source.height);\r
        gl.uniform2f(programs.down.uniforms.uTarget, target.width, target.height);\r
        bindTexture(programs.down, 'uSource', 0, source.texture);\r
        run(programs.down, target, target.width, target.height);\r
        source = target;\r
      }\r
      for (let level = up.length - 1; level >= 0; level--) {\r
        const from = level === up.length - 1 ? down[down.length - 1] : up[level + 1];\r
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
      gl.uniform2f(c.uGrid, snow.width, snow.height);\r
      gl.uniform1f(c.uPixel, view.pixel * view.ratio);\r
      gl.uniform3fv(c.uColor, toRgb(s.color));\r
      gl.uniform1f(c.uBrightness, s.brightness);\r
      gl.uniform1f(c.uGlow, s.glow);\r
      gl.uniform1f(c.uFade, s.fade);\r
      gl.uniform1f(c.uOpacity, s.opacity);\r
      gl.uniform1f(c.uLightMode, s.lightMode ? 1 : 0);\r
      bindTexture(composite, 'uSnow', 0, snow.texture);\r
      bindTexture(composite, 'uGlowMap', 1, up[0].texture);\r
      run(composite, null, canvas.width, canvas.height);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const moving = !s.paused && !reduce;\r
      if (!s.intro || reduce) state.intro = 1;\r
      else if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / INTRO_SECONDS);\r
      const goal = s.mouseInteraction && pointer.inside && !reduce ? 1 : 0;\r
      state.push += (goal - state.push) * (1 - Math.exp(-dt * (goal ? 6 : 3)));\r
      pointer.vx *= Math.exp(-dt * 6);\r
      pointer.vy *= Math.exp(-dt * 6);\r
      populate(s);\r
      if (moving) {\r
        state.time += dt;\r
        simulate(s, dt);\r
        settlePile(s, dt);\r
      }\r
      render();\r
      if (moving || Math.abs(goal - state.push) > 0.001) raf = requestAnimationFrame(frame);\r
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
      view.ratio = ratio;\r
      view.pixel = Math.max(1, Math.round(s.pixelSize * ratio)) / ratio;\r
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      view.gridWidth = Math.max(1, Math.ceil(width / view.pixel));\r
      view.gridHeight = Math.max(1, Math.ceil(height / view.pixel));\r
      if (pile.length !== view.gridWidth) pile = new Float32Array(view.gridWidth);\r
      populate(s);\r
      if (!raf) render();\r
      wake();\r
    };\r
\r
    const onPointerMove = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      const now = performance.now();\r
      if (pointer.inside && pointer.time) {\r
        const elapsed = Math.max(1, now - pointer.time) / 1000;\r
        pointer.vx = clamp((x - pointer.x) / elapsed, -3000, 3000);\r
        pointer.vy = clamp((y - pointer.y) / elapsed, -3000, 3000);\r
      }\r
      pointer.x = x;\r
      pointer.y = y;\r
      pointer.time = now;\r
      pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
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
    let lastPixel = settingsRef.current.pixelSize;\r
    let lastDpr = settingsRef.current.dpr;\r
    wakeRef.current = () => {\r
      const s = settingsRef.current;\r
      if (s.pixelSize !== lastPixel || s.dpr !== lastDpr) {\r
        lastPixel = s.pixelSize;\r
        lastDpr = s.dpr;\r
        resize();\r
        return;\r
      }\r
      populate(s);\r
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
      for (const target of [snow, ...down, ...up]) {\r
        gl.deleteTexture(target.texture);\r
        gl.deleteFramebuffer(target.framebuffer);\r
      }\r
      for (const entry of Object.values(programs)) gl.deleteProgram(entry.program);\r
      gl.deleteTexture(atlasTexture);\r
      gl.deleteTexture(pileTexture);\r
      gl.deleteBuffer(quadBuffer);\r
      gl.deleteBuffer(cornerBuffer);\r
      gl.deleteBuffer(instanceBuffer);\r
      gl.deleteVertexArray(quadVao);\r
      gl.deleteVertexArray(flakeVao);\r
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
import './PixelSnow.css';\r
\r
export type PixelSnowVariant = 'snowflake' | 'square' | 'round';\r
\r
export interface PixelSnowProps extends HTMLAttributes<HTMLDivElement> {\r
  color?: string;\r
  variant?: PixelSnowVariant;\r
  density?: number;\r
  speed?: number;\r
  wind?: number;\r
  sway?: number;\r
  flakeSize?: number;\r
  pixelSize?: number;\r
  depth?: number;\r
  brightness?: number;\r
  glow?: number;\r
  twinkle?: number;\r
  accumulate?: boolean;\r
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
  color: string;\r
  variant: number;\r
  density: number;\r
  speed: number;\r
  wind: number;\r
  sway: number;\r
  flakeSize: number;\r
  pixelSize: number;\r
  depth: number;\r
  brightness: number;\r
  glow: number;\r
  twinkle: number;\r
  accumulate: boolean;\r
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
type Flake = {\r
  level: number;\r
  x: number;\r
  y: number;\r
  vx: number;\r
  vy: number;\r
  phase: number;\r
  rate: number;\r
  sparkle: number;\r
  drift: number;\r
  alt: boolean;\r
  reveal: number;\r
  levelSize: number;\r
};\r
\r
const SPRITES: Record<string, string[][]> = {\r
  square: [\r
    ['@'],\r
    ['oo', 'oo'],\r
    ['xox', 'o@o', 'xox'],\r
    ['xoox', 'o@@o', 'o@@o', 'xoox'],\r
    ['xooox', 'oo@oo', 'o@@@o', 'oo@oo', 'xooox'],\r
    ['xox', 'o@o', 'xox'],\r
    ['xoox', 'o@@o', 'o@@o', 'xoox'],\r
    ['xooox', 'oo@oo', 'o@@@o', 'oo@oo', 'xooox']\r
  ],\r
  round: [\r
    ['@'],\r
    ['.x.', 'x@x', '.x.'],\r
    ['.xx.', 'x@@x', 'x@@x', '.xx.'],\r
    ['.xxx.', 'xo@ox', 'x@@@x', 'xo@ox', '.xxx.'],\r
    ['..xxx..', '.xooox.', 'xoo@oox', 'xo@@@ox', 'xoo@oox', '.xooox.', '..xxx..'],\r
    ['.xx.', 'x@@x', 'x@@x', '.xx.'],\r
    ['.xxx.', 'xo@ox', 'x@@@x', 'xo@ox', '.xxx.'],\r
    ['..xxx..', '.xooox.', 'xoo@oox', 'xo@@@ox', 'xoo@oox', '.xooox.', '..xxx..']\r
  ],\r
  snowflake: [\r
    ['@'],\r
    ['.x.', 'x@x', '.x.'],\r
    ['..x..', 'x.o.x', '.o@o.', 'x.o.x', '..x..'],\r
    ['...x...', '.x.o.x.', '..ooo..', 'xoo@oox', '..ooo..', '.x.o.x.', '...x...'],\r
    [\r
      '....x....',\r
      '.x..o..x.',\r
      '..o.o.o..',\r
      '...ooo...',\r
      'xooo@ooox',\r
      '...ooo...',\r
      '..o.o.o..',\r
      '.x..o..x.',\r
      '....x....'\r
    ],\r
    ['x...x', '.o.o.', '..@..', '.o.o.', 'x...x'],\r
    ['x..x..x', '.o.o.o.', '..ooo..', 'xoo@oox', '..ooo..', '.o.o.o.', 'x..x..x'],\r
    [\r
      'x...x...x',\r
      '.o..o..o.',\r
      '..o.o.o..',\r
      '...ooo...',\r
      'xooo@ooox',\r
      '...ooo...',\r
      '..o.o.o..',\r
      '.o..o..o.',\r
      'x...x...x'\r
    ]\r
  ]\r
};\r
\r
const VARIANTS = ['square', 'round', 'snowflake'];\r
const CELL = 9;\r
const LEVELS = 5;\r
const SLOTS = 8;\r
const MAX_FLAKES = 4000;\r
const LEVEL_WEIGHTS = [0.46, 0.27, 0.15, 0.08, 0.04];\r
const LEVEL_FALL = [16, 24, 34, 48, 66];\r
const LEVEL_LIGHT = [0.42, 0.58, 0.76, 0.92, 1];\r
const INTRO_SECONDS = 1.4;\r
\r
const QUAD_VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const FLAKE_VERTEX = \`#version 300 es\r
in vec2 aCorner;\r
in vec4 aFlake;\r
uniform vec2 uGrid;\r
uniform vec4 uSizes;\r
uniform float uLargest;\r
flat out ivec2 vOrigin;\r
flat out ivec2 vCell;\r
flat out int vSize;\r
flat out float vLight;\r
void main() {\r
  int index = int(aFlake.z + 0.5);\r
  int slot = index % \${SLOTS};\r
  int variant = index / \${SLOTS};\r
  int level = slot < \${LEVELS} ? slot : slot - 3;\r
  float size = level == 0 ? 1.0 : (level == 1 ? uSizes.x : (level == 2 ? uSizes.y : (level == 3 ? uSizes.z : uLargest)));\r
  vec2 origin = floor(aFlake.xy) - floor(size * 0.5);\r
  origin.y = uGrid.y - origin.y - size;\r
  vec2 corner = origin + (aCorner * 0.5 + 0.5) * size;\r
  gl_Position = vec4(corner / uGrid * 2.0 - 1.0, 0.0, 1.0);\r
  vOrigin = ivec2(origin);\r
  vCell = ivec2(slot * \${CELL}, variant * \${CELL});\r
  vSize = int(size);\r
  vLight = aFlake.w;\r
}\`;\r
\r
const FLAKE_FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform sampler2D uAtlas;\r
flat in ivec2 vOrigin;\r
flat in ivec2 vCell;\r
flat in int vSize;\r
flat in float vLight;\r
out vec4 outColor;\r
void main() {\r
  ivec2 local = ivec2(gl_FragCoord.xy) - vOrigin;\r
  if (local.x < 0 || local.y < 0 || local.x >= vSize || local.y >= vSize) discard;\r
  vec4 texel = texelFetch(uAtlas, vCell + local, 0);\r
  if (texel.r < 0.5) discard;\r
  outColor = vec4(vLight, texel.g * vLight, 0.0, 1.0);\r
}\`;\r
\r
const PILE = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform sampler2D uPile;\r
uniform float uTime;\r
uniform float uLight;\r
out vec4 outColor;\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
void main() {\r
  ivec2 cell = ivec2(gl_FragCoord.xy);\r
  float height = texelFetch(uPile, ivec2(cell.x, 0), 0).r;\r
  float row = float(cell.y);\r
  if (row >= floor(height + 0.5)) discard;\r
  float below = floor(height + 0.5) - row;\r
  float crest = below <= 1.0 ? 1.0 : 0.0;\r
  ivec2 bayerCell = cell & 3;\r
  int bayerIndex = bayerCell.x + bayerCell.y * 4;\r
  float bayer[16] = float[16](0.0, 8.0, 2.0, 10.0, 12.0, 4.0, 14.0, 6.0, 3.0, 11.0, 1.0, 9.0, 15.0, 7.0, 13.0, 5.0);\r
  float threshold = (bayer[bayerIndex] + 0.5) / 16.0;\r
  float shade = clamp((below - 1.0) / 9.0, 0.0, 1.0) * 3.0;\r
  float step3 = floor(shade) + step(threshold, fract(shade));\r
  float body = 0.94 - step3 * 0.13;\r
  float glint = below <= 3.0 ? step(0.992, hash(vec2(cell) + floor(uTime * 1.1 + hash(vec2(cell.yx)) * 9.0))) : 0.0;\r
  float core = crest * 0.6 + glint;\r
  outColor = vec4(body, core, 0.0, 1.0) * uLight;\r
}\`;\r
\r
const DOWN = \`#version 300 es\r
precision highp float;\r
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
const UP = \`#version 300 es\r
precision highp float;\r
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
  outColor = (sum / 12.0 + texture(uBase, uv)) * 0.5;\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uSnow;\r
uniform sampler2D uGlowMap;\r
uniform vec2 uResolution;\r
uniform vec2 uGrid;\r
uniform float uPixel;\r
uniform vec3 uColor;\r
uniform float uBrightness;\r
uniform float uGlow;\r
uniform float uFade;\r
uniform float uOpacity;\r
uniform float uLightMode;\r
out vec4 outColor;\r
\r
float smootherstep(float edge, float x) {\r
  float t = clamp(x / max(edge, 0.0001), 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uResolution;\r
  ivec2 cell = ivec2(floor(gl_FragCoord.xy / uPixel));\r
  vec4 snow = texelFetch(uSnow, clamp(cell, ivec2(0), ivec2(uGrid) - 1), 0);\r
  vec2 glow = texture(uGlowMap, gl_FragCoord.xy / (uGrid * uPixel)).rg;\r
  float edge = uFade * 0.5;\r
  float mask = smootherstep(edge, uv.x) * smootherstep(edge, 1.0 - uv.x) * smootherstep(edge, uv.y) * smootherstep(edge, 1.0 - uv.y);\r
  mask *= uOpacity;\r
  float body = clamp(snow.r * uBrightness, 0.0, 1.0);\r
  float core = clamp(snow.g * uBrightness, 0.0, 1.0);\r
  float halo = clamp(glow.r * uGlow * uBrightness, 0.0, 1.0);\r
  if (uLightMode > 0.5) {\r
    vec3 tint = mix(uColor, vec3(1.0), clamp(core / max(body, 0.001), 0.0, 1.0) * 0.45);\r
    float alpha = body * 0.95;\r
    vec4 color = vec4(tint * alpha, alpha);\r
    float soft = halo * 0.22 * (1.0 - alpha);\r
    color += vec4(uColor * soft, soft);\r
    outColor = color * mask;\r
  } else {\r
    vec3 color = uColor * (body * 0.82 + core * 0.18) + uColor * halo * 0.55;\r
    color = 1.0 - exp(-color * 1.6);\r
    color *= mask;\r
    outColor = vec4(color, max(color.r, max(color.g, color.b)));\r
  }\r
}\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const seeded = (seed: number) => {\r
  let a = seed >>> 0;\r
  return () => {\r
    a = (a + 0x6d2b79f5) >>> 0;\r
    let t = a;\r
    t = Math.imul(t ^ (t >>> 15), t | 1);\r
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\r
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\r
  };\r
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
const link = (\r
  gl: WebGL2RenderingContext,\r
  vertexSource: string,\r
  fragmentSource: string,\r
  attributes: string[]\r
): Program | null => {\r
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
const buildAtlas = () => {\r
  const width = CELL * SLOTS;\r
  const height = CELL * VARIANTS.length;\r
  const data = new Uint8Array(width * height * 4);\r
  VARIANTS.forEach((variant, row) => {\r
    SPRITES[variant].forEach((rows, level) => {\r
      rows.forEach((line, y) => {\r
        for (let x = 0; x < line.length; x++) {\r
          const mark = line[x];\r
          if (mark === '.') continue;\r
          const offset = ((row * CELL + y) * width + level * CELL + x) * 4;\r
          data[offset] = 255;\r
          data[offset + 1] = mark === '@' ? 255 : mark === 'o' ? 128 : 0;\r
          data[offset + 3] = 255;\r
        }\r
      });\r
    });\r
  });\r
  return { data, width, height };\r
};\r
\r
export default function PixelSnow({\r
  color = '#ffffff',\r
  variant = 'snowflake',\r
  density = 0.5,\r
  speed = 1,\r
  wind = 0.25,\r
  sway = 0.5,\r
  flakeSize = 1,\r
  pixelSize = 3,\r
  depth = 0.6,\r
  brightness = 1,\r
  glow = 0.8,\r
  twinkle = 0.35,\r
  accumulate = false,\r
  mouseInteraction = true,\r
  intro = true,\r
  fade = 0,\r
  opacity = 1,\r
  lightMode = false,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  ...rest\r
}: PixelSnowProps) {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings: Settings = {\r
    color: String(color),\r
    variant: Math.max(0, VARIANTS.indexOf(variant)),\r
    density: clamp(density, 0, 1),\r
    speed,\r
    wind: clamp(wind, -2, 2),\r
    sway: Math.max(0, sway),\r
    flakeSize: clamp(flakeSize, 0, 2),\r
    pixelSize: Math.round(clamp(pixelSize, 1, 12)),\r
    depth: clamp(depth, 0, 1),\r
    brightness: Math.max(0, brightness),\r
    glow: Math.max(0, glow),\r
    twinkle: clamp(twinkle, 0, 1),\r
    accumulate,\r
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
    const programs = {\r
      flake: link(gl, FLAKE_VERTEX, FLAKE_FRAGMENT, ['aCorner', 'aFlake']),\r
      pile: link(gl, QUAD_VERTEX, PILE, ['aPosition']),\r
      down: link(gl, QUAD_VERTEX, DOWN, ['aPosition']),\r
      up: link(gl, QUAD_VERTEX, UP, ['aPosition']),\r
      composite: link(gl, QUAD_VERTEX, COMPOSITE, ['aPosition'])\r
    } as Record<string, Program>;\r
    if (Object.values(programs).some(entry => !entry)) return undefined;\r
\r
    const atlas = buildAtlas();\r
    const atlasTexture = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, atlasTexture);\r
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, atlas.width, atlas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, atlas.data);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
\r
    const quadBuffer = gl.createBuffer();\r
    const quadVao = gl.createVertexArray();\r
    gl.bindVertexArray(quadVao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const cornerBuffer = gl.createBuffer();\r
    const instanceBuffer = gl.createBuffer();\r
    const flakeVao = gl.createVertexArray();\r
    gl.bindVertexArray(flakeVao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);\r
    gl.enableVertexAttribArray(1);\r
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 0, 0);\r
    gl.vertexAttribDivisor(1, 1);\r
    gl.bindVertexArray(null);\r
\r
    const createTarget = (filter: number): Target => {\r
      const target = { texture: gl.createTexture(), framebuffer: gl.createFramebuffer(), width: 0, height: 0 };\r
      gl.bindTexture(gl.TEXTURE_2D, target.texture);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      return target;\r
    };\r
    const sizeTarget = (target: Target, width: number, height: number) => {\r
      if (target.width === width && target.height === height) return;\r
      target.width = width;\r
      target.height = height;\r
      gl.bindTexture(gl.TEXTURE_2D, target.texture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target.texture, 0);\r
    };\r
    const snow = createTarget(gl.NEAREST);\r
    const pileTexture = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, pileTexture);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    let pile = new Float32Array(0);\r
    let pileWidth = 0;\r
    const down = [createTarget(gl.LINEAR), createTarget(gl.LINEAR), createTarget(gl.LINEAR)];\r
    const up = [createTarget(gl.LINEAR), createTarget(gl.LINEAR)];\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const colorCache = new Map<string, number[]>();\r
    const toRgb = (value: string): number[] => {\r
      const cached = colorCache.get(value);\r
      if (cached) return cached;\r
      let rgb = [1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#ffffff';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      colorCache.set(value, rgb);\r
      return rgb;\r
    };\r
\r
    const rng = seeded(4271);\r
    const flakes: Flake[] = [];\r
    const view = { width: 1, height: 1, ratio: 1, pixel: 1, gridWidth: 1, gridHeight: 1 };\r
    const pointer = { x: 0, y: 0, vx: 0, vy: 0, inside: false, time: 0 };\r
    const state = { time: 0, intro: settingsRef.current.intro && !reduce ? 0 : 1, push: 0 };\r
    const instances = new Float32Array(MAX_FLAKES * 4);\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const pickLevel = (r: number, s: Settings) => {\r
      const shift = s.flakeSize - 1;\r
      let total = 0;\r
      const weights = LEVEL_WEIGHTS.map((weight, level) => weight * Math.pow(2.2, shift * (level - 1.5)));\r
      const sum = weights.reduce((a, b) => a + b, 0);\r
      for (let level = 0; level < LEVELS; level++) {\r
        total += weights[level] / sum;\r
        if (r <= total) return level;\r
      }\r
      return LEVELS - 1;\r
    };\r
\r
    const spawn = (flake: Flake, s: Settings, top: boolean) => {\r
      flake.level = pickLevel(rng(), s);\r
      flake.x = rng() * (view.width + 40) - 20;\r
      flake.y = top ? -10 - rng() * 30 : rng() * view.height;\r
      flake.vx = 0;\r
      flake.vy = LEVEL_FALL[flake.level];\r
      flake.phase = rng() * Math.PI * 2;\r
      flake.rate = 0.6 + rng() * 0.9;\r
      flake.sparkle = rng() * 100;\r
      flake.drift = 0.7 + rng() * 0.6;\r
      flake.alt = rng() < 0.5;\r
      flake.reveal = rng();\r
      flake.levelSize = s.flakeSize;\r
    };\r
\r
    const populate = (s: Settings) => {\r
      const target = Math.round(clamp((view.width * view.height * s.density) / 1100, 0, MAX_FLAKES));\r
      while (flakes.length < target) {\r
        const flake = {} as Flake;\r
        spawn(flake, s, false);\r
        flakes.push(flake);\r
      }\r
      if (flakes.length > target) flakes.length = target;\r
    };\r
\r
    const simulate = (s: Settings, dt: number) => {\r
      const fall = s.speed;\r
      const windSpeed = s.wind * 46;\r
      const radius = 120;\r
      const pushing = state.push > 0.001 && pointer.inside;\r
      const margin = 24;\r
      const settle = s.accumulate && fall > 0 && pile.length > 0;\r
      for (const flake of flakes) {\r
        if (flake.levelSize !== s.flakeSize) {\r
          flake.level = pickLevel(rng(), s);\r
          flake.levelSize = s.flakeSize;\r
        }\r
        const level = flake.level;\r
        const parallax = 1 - s.depth * (1 - (level + 1) / LEVELS) * 0.75;\r
        const swing = Math.sin(state.time * flake.rate + flake.phase) * s.sway * (6 + level * 7);\r
        const targetX = (windSpeed * parallax + swing) * flake.drift;\r
        const targetY = LEVEL_FALL[level] * parallax * fall * flake.drift;\r
        const ease = 1 - Math.exp(-dt * 2.2);\r
        flake.vx += (targetX - flake.vx) * ease;\r
        flake.vy += (targetY - flake.vy) * ease;\r
        if (pushing) {\r
          const dx = flake.x - pointer.x;\r
          const dy = flake.y - pointer.y;\r
          const distance = Math.hypot(dx, dy);\r
          if (distance < radius && distance > 0.001) {\r
            const near = 1 - distance / radius;\r
            const repel = near * near * near * state.push * 1500 * dt;\r
            const carry = near * near * state.push * dt * 5;\r
            flake.vx += (dx / distance) * repel + pointer.vx * carry;\r
            flake.vy += (dy / distance) * repel + pointer.vy * carry;\r
          }\r
        }\r
        flake.x += flake.vx * dt;\r
        flake.y += flake.vy * dt;\r
        if (settle) {\r
          const column = Math.floor(flake.x / view.pixel);\r
          if (column >= 0 && column < pile.length) {\r
            const surface = view.height - pile[column] * view.pixel;\r
            if (flake.y >= surface && pile[column] > 0.5) {\r
              const reach = level;\r
              for (let k = -reach; k <= reach; k++) {\r
                const index = column + k;\r
                if (index >= 0 && index < pile.length)\r
                  pile[index] += (0.35 + level * 0.15) * (1 - Math.abs(k) / (reach + 1));\r
              }\r
              spawn(flake, s, true);\r
              flake.reveal = -1;\r
              continue;\r
            }\r
          }\r
        }\r
        if (fall >= 0 ? flake.y > view.height + margin : flake.y < -margin) {\r
          spawn(flake, s, true);\r
          flake.reveal = -1;\r
          if (fall < 0) flake.y = view.height + 10 + rng() * 30;\r
        }\r
        if (flake.x < -margin) flake.x += view.width + margin * 2;\r
        else if (flake.x > view.width + margin) flake.x -= view.width + margin * 2;\r
      }\r
    };\r
\r
    const settlePile = (s: Settings, dt: number) => {\r
      if (!pile.length) return;\r
      const cap = Math.max(4, view.gridHeight * 0.08);\r
      if (s.accumulate && s.speed > 0) {\r
        const grow = (0.25 + s.density * 0.9) * dt * Math.min(1, s.speed);\r
        for (let i = 0; i < pile.length; i++) {\r
          const dune = 0.55 + 0.45 * Math.sin(i * 0.045 + Math.sin(i * 0.013) * 2.1) * Math.sin(i * 0.021 + 1.3);\r
          if (pile[i] < cap * dune) pile[i] += grow * (0.6 + 0.8 * dune);\r
        }\r
      }\r
      for (let pass = 0; pass < 2; pass++) {\r
        const forward = pass === 0;\r
        for (let k = 0; k < pile.length - 1; k++) {\r
          const i = forward ? k : pile.length - 2 - k;\r
          const difference = pile[i] - pile[i + 1];\r
          if (Math.abs(difference) > 1.2) {\r
            const move = (Math.abs(difference) - 1.2) * 0.5 * Math.sign(difference);\r
            pile[i] -= move;\r
            pile[i + 1] += move;\r
          }\r
        }\r
      }\r
      for (let i = 0; i < pile.length; i++) {\r
        const excess = Math.max(0, pile[i] - cap);\r
        const rate = s.accumulate && s.speed > 0 ? excess * 0.8 : 2 + pile[i] * 0.6;\r
        pile[i] = Math.max(0, pile[i] - rate * dt);\r
      }\r
    };\r
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
    const render = () => {\r
      const s = settingsRef.current;\r
      sizeTarget(snow, view.gridWidth, view.gridHeight);\r
      let count = 0;\r
      const sizes = SPRITES[VARIANTS[s.variant]].map(rows => rows.length);\r
      const sweep = state.intro * 1.75;\r
      for (const flake of flakes) {\r
        const level = flake.level;\r
        const depthLight = 1 - s.depth * (1 - LEVEL_LIGHT[level]);\r
        const spark = Math.pow(Math.max(0, Math.sin(state.time * 0.9 + flake.sparkle)), 60) * s.twinkle;\r
        const reveal =\r
          flake.reveal < 0 || state.intro >= 1\r
            ? 1\r
            : clamp((sweep - flake.y / view.height - flake.reveal * 0.25) / 0.35, 0, 1);\r
        if (reveal <= 0) continue;\r
        const slot = level >= 2 && flake.alt ? level + 3 : level;\r
        const o = count * 4;\r
        instances[o] = flake.x / view.pixel;\r
        instances[o + 1] = flake.y / view.pixel;\r
        instances[o + 2] = s.variant * SLOTS + slot;\r
        instances[o + 3] = Math.min(1, depthLight * (0.85 + spark * 0.6)) * reveal * reveal;\r
        count++;\r
      }\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, snow.framebuffer);\r
      gl.viewport(0, 0, snow.width, snow.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      if (pile.length && pile.some(height => height > 0.4)) {\r
        gl.bindTexture(gl.TEXTURE_2D, pileTexture);\r
        if (pileWidth !== pile.length) {\r
          pileWidth = pile.length;\r
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, pileWidth, 1, 0, gl.RED, gl.FLOAT, pile);\r
        } else {\r
          gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, pileWidth, 1, gl.RED, gl.FLOAT, pile);\r
        }\r
        const pileProgram = programs.pile;\r
        gl.useProgram(pileProgram.program);\r
        gl.activeTexture(gl.TEXTURE0);\r
        gl.bindTexture(gl.TEXTURE_2D, pileTexture);\r
        gl.uniform1i(pileProgram.uniforms.uPile, 0);\r
        gl.uniform1f(pileProgram.uniforms.uTime, state.time);\r
        gl.uniform1f(pileProgram.uniforms.uLight, 1 - s.depth * 0.1);\r
        gl.bindVertexArray(quadVao);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      }\r
      if (count > 0) {\r
        const flake = programs.flake;\r
        gl.useProgram(flake.program);\r
        gl.uniform2f(flake.uniforms.uGrid, snow.width, snow.height);\r
        gl.uniform4f(flake.uniforms.uSizes, sizes[1], sizes[2], sizes[3], 0);\r
        gl.uniform1f(flake.uniforms.uLargest, sizes[4]);\r
        gl.activeTexture(gl.TEXTURE0);\r
        gl.bindTexture(gl.TEXTURE_2D, atlasTexture);\r
        gl.uniform1i(flake.uniforms.uAtlas, 0);\r
        gl.enable(gl.BLEND);\r
        gl.blendEquation(gl.MAX);\r
        gl.bindVertexArray(flakeVao);\r
        gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);\r
        gl.bufferData(gl.ARRAY_BUFFER, instances.subarray(0, count * 4), gl.DYNAMIC_DRAW);\r
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, count);\r
        gl.blendEquation(gl.FUNC_ADD);\r
        gl.disable(gl.BLEND);\r
      }\r
\r
      gl.bindVertexArray(quadVao);\r
      let source = snow;\r
      for (let level = 0; level < down.length; level++) {\r
        const target = down[level];\r
        sizeTarget(target, Math.max(1, Math.ceil(source.width / 2)), Math.max(1, Math.ceil(source.height / 2)));\r
        gl.useProgram(programs.down.program);\r
        gl.uniform2f(programs.down.uniforms.uTexel, 1 / source.width, 1 / source.height);\r
        gl.uniform2f(programs.down.uniforms.uTarget, target.width, target.height);\r
        bindTexture(programs.down, 'uSource', 0, source.texture);\r
        run(programs.down, target, target.width, target.height);\r
        source = target;\r
      }\r
      for (let level = up.length - 1; level >= 0; level--) {\r
        const from = level === up.length - 1 ? down[down.length - 1] : up[level + 1];\r
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
      gl.uniform2f(c.uGrid, snow.width, snow.height);\r
      gl.uniform1f(c.uPixel, view.pixel * view.ratio);\r
      gl.uniform3fv(c.uColor, toRgb(s.color));\r
      gl.uniform1f(c.uBrightness, s.brightness);\r
      gl.uniform1f(c.uGlow, s.glow);\r
      gl.uniform1f(c.uFade, s.fade);\r
      gl.uniform1f(c.uOpacity, s.opacity);\r
      gl.uniform1f(c.uLightMode, s.lightMode ? 1 : 0);\r
      bindTexture(composite, 'uSnow', 0, snow.texture);\r
      bindTexture(composite, 'uGlowMap', 1, up[0].texture);\r
      run(composite, null, canvas.width, canvas.height);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const moving = !s.paused && !reduce;\r
      if (!s.intro || reduce) state.intro = 1;\r
      else if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / INTRO_SECONDS);\r
      const goal = s.mouseInteraction && pointer.inside && !reduce ? 1 : 0;\r
      state.push += (goal - state.push) * (1 - Math.exp(-dt * (goal ? 6 : 3)));\r
      pointer.vx *= Math.exp(-dt * 6);\r
      pointer.vy *= Math.exp(-dt * 6);\r
      populate(s);\r
      if (moving) {\r
        state.time += dt;\r
        simulate(s, dt);\r
        settlePile(s, dt);\r
      }\r
      render();\r
      if (moving || Math.abs(goal - state.push) > 0.001) raf = requestAnimationFrame(frame);\r
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
      view.ratio = ratio;\r
      view.pixel = Math.max(1, Math.round(s.pixelSize * ratio)) / ratio;\r
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      view.gridWidth = Math.max(1, Math.ceil(width / view.pixel));\r
      view.gridHeight = Math.max(1, Math.ceil(height / view.pixel));\r
      if (pile.length !== view.gridWidth) pile = new Float32Array(view.gridWidth);\r
      populate(s);\r
      if (!raf) render();\r
      wake();\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      const now = performance.now();\r
      if (pointer.inside && pointer.time) {\r
        const elapsed = Math.max(1, now - pointer.time) / 1000;\r
        pointer.vx = clamp((x - pointer.x) / elapsed, -3000, 3000);\r
        pointer.vy = clamp((y - pointer.y) / elapsed, -3000, 3000);\r
      }\r
      pointer.x = x;\r
      pointer.y = y;\r
      pointer.time = now;\r
      pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
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
    let lastPixel = settingsRef.current.pixelSize;\r
    let lastDpr = settingsRef.current.dpr;\r
    wakeRef.current = () => {\r
      const s = settingsRef.current;\r
      if (s.pixelSize !== lastPixel || s.dpr !== lastDpr) {\r
        lastPixel = s.pixelSize;\r
        lastDpr = s.dpr;\r
        resize();\r
        return;\r
      }\r
      populate(s);\r
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
      for (const target of [snow, ...down, ...up]) {\r
        gl.deleteTexture(target.texture);\r
        gl.deleteFramebuffer(target.framebuffer);\r
      }\r
      for (const entry of Object.values(programs)) gl.deleteProgram(entry.program);\r
      gl.deleteTexture(atlasTexture);\r
      gl.deleteTexture(pileTexture);\r
      gl.deleteBuffer(quadBuffer);\r
      gl.deleteBuffer(cornerBuffer);\r
      gl.deleteBuffer(instanceBuffer);\r
      gl.deleteVertexArray(quadVao);\r
      gl.deleteVertexArray(flakeVao);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div ref={containerRef} className={\`pixel-snow-container\${className ? \` \${className}\` : ''}\`} {...rest}>\r
      <canvas ref={canvasRef} className="pixel-snow-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
}\r
`,o=`'use client';\r
\r
import { useEffect, useRef, type HTMLAttributes } from 'react';\r
\r
export type PixelSnowVariant = 'snowflake' | 'square' | 'round';\r
\r
export interface PixelSnowProps extends HTMLAttributes<HTMLDivElement> {\r
  color?: string;\r
  variant?: PixelSnowVariant;\r
  density?: number;\r
  speed?: number;\r
  wind?: number;\r
  sway?: number;\r
  flakeSize?: number;\r
  pixelSize?: number;\r
  depth?: number;\r
  brightness?: number;\r
  glow?: number;\r
  twinkle?: number;\r
  accumulate?: boolean;\r
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
  color: string;\r
  variant: number;\r
  density: number;\r
  speed: number;\r
  wind: number;\r
  sway: number;\r
  flakeSize: number;\r
  pixelSize: number;\r
  depth: number;\r
  brightness: number;\r
  glow: number;\r
  twinkle: number;\r
  accumulate: boolean;\r
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
type Flake = {\r
  level: number;\r
  x: number;\r
  y: number;\r
  vx: number;\r
  vy: number;\r
  phase: number;\r
  rate: number;\r
  sparkle: number;\r
  drift: number;\r
  alt: boolean;\r
  reveal: number;\r
  levelSize: number;\r
};\r
\r
const SPRITES: Record<string, string[][]> = {\r
  square: [\r
    ['@'],\r
    ['oo', 'oo'],\r
    ['xox', 'o@o', 'xox'],\r
    ['xoox', 'o@@o', 'o@@o', 'xoox'],\r
    ['xooox', 'oo@oo', 'o@@@o', 'oo@oo', 'xooox'],\r
    ['xox', 'o@o', 'xox'],\r
    ['xoox', 'o@@o', 'o@@o', 'xoox'],\r
    ['xooox', 'oo@oo', 'o@@@o', 'oo@oo', 'xooox']\r
  ],\r
  round: [\r
    ['@'],\r
    ['.x.', 'x@x', '.x.'],\r
    ['.xx.', 'x@@x', 'x@@x', '.xx.'],\r
    ['.xxx.', 'xo@ox', 'x@@@x', 'xo@ox', '.xxx.'],\r
    ['..xxx..', '.xooox.', 'xoo@oox', 'xo@@@ox', 'xoo@oox', '.xooox.', '..xxx..'],\r
    ['.xx.', 'x@@x', 'x@@x', '.xx.'],\r
    ['.xxx.', 'xo@ox', 'x@@@x', 'xo@ox', '.xxx.'],\r
    ['..xxx..', '.xooox.', 'xoo@oox', 'xo@@@ox', 'xoo@oox', '.xooox.', '..xxx..']\r
  ],\r
  snowflake: [\r
    ['@'],\r
    ['.x.', 'x@x', '.x.'],\r
    ['..x..', 'x.o.x', '.o@o.', 'x.o.x', '..x..'],\r
    ['...x...', '.x.o.x.', '..ooo..', 'xoo@oox', '..ooo..', '.x.o.x.', '...x...'],\r
    [\r
      '....x....',\r
      '.x..o..x.',\r
      '..o.o.o..',\r
      '...ooo...',\r
      'xooo@ooox',\r
      '...ooo...',\r
      '..o.o.o..',\r
      '.x..o..x.',\r
      '....x....'\r
    ],\r
    ['x...x', '.o.o.', '..@..', '.o.o.', 'x...x'],\r
    ['x..x..x', '.o.o.o.', '..ooo..', 'xoo@oox', '..ooo..', '.o.o.o.', 'x..x..x'],\r
    [\r
      'x...x...x',\r
      '.o..o..o.',\r
      '..o.o.o..',\r
      '...ooo...',\r
      'xooo@ooox',\r
      '...ooo...',\r
      '..o.o.o..',\r
      '.o..o..o.',\r
      'x...x...x'\r
    ]\r
  ]\r
};\r
\r
const VARIANTS = ['square', 'round', 'snowflake'];\r
const CELL = 9;\r
const LEVELS = 5;\r
const SLOTS = 8;\r
const MAX_FLAKES = 4000;\r
const LEVEL_WEIGHTS = [0.46, 0.27, 0.15, 0.08, 0.04];\r
const LEVEL_FALL = [16, 24, 34, 48, 66];\r
const LEVEL_LIGHT = [0.42, 0.58, 0.76, 0.92, 1];\r
const INTRO_SECONDS = 1.4;\r
\r
const QUAD_VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const FLAKE_VERTEX = \`#version 300 es\r
in vec2 aCorner;\r
in vec4 aFlake;\r
uniform vec2 uGrid;\r
uniform vec4 uSizes;\r
uniform float uLargest;\r
flat out ivec2 vOrigin;\r
flat out ivec2 vCell;\r
flat out int vSize;\r
flat out float vLight;\r
void main() {\r
  int index = int(aFlake.z + 0.5);\r
  int slot = index % \${SLOTS};\r
  int variant = index / \${SLOTS};\r
  int level = slot < \${LEVELS} ? slot : slot - 3;\r
  float size = level == 0 ? 1.0 : (level == 1 ? uSizes.x : (level == 2 ? uSizes.y : (level == 3 ? uSizes.z : uLargest)));\r
  vec2 origin = floor(aFlake.xy) - floor(size * 0.5);\r
  origin.y = uGrid.y - origin.y - size;\r
  vec2 corner = origin + (aCorner * 0.5 + 0.5) * size;\r
  gl_Position = vec4(corner / uGrid * 2.0 - 1.0, 0.0, 1.0);\r
  vOrigin = ivec2(origin);\r
  vCell = ivec2(slot * \${CELL}, variant * \${CELL});\r
  vSize = int(size);\r
  vLight = aFlake.w;\r
}\`;\r
\r
const FLAKE_FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform sampler2D uAtlas;\r
flat in ivec2 vOrigin;\r
flat in ivec2 vCell;\r
flat in int vSize;\r
flat in float vLight;\r
out vec4 outColor;\r
void main() {\r
  ivec2 local = ivec2(gl_FragCoord.xy) - vOrigin;\r
  if (local.x < 0 || local.y < 0 || local.x >= vSize || local.y >= vSize) discard;\r
  vec4 texel = texelFetch(uAtlas, vCell + local, 0);\r
  if (texel.r < 0.5) discard;\r
  outColor = vec4(vLight, texel.g * vLight, 0.0, 1.0);\r
}\`;\r
\r
const PILE = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform sampler2D uPile;\r
uniform float uTime;\r
uniform float uLight;\r
out vec4 outColor;\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
void main() {\r
  ivec2 cell = ivec2(gl_FragCoord.xy);\r
  float height = texelFetch(uPile, ivec2(cell.x, 0), 0).r;\r
  float row = float(cell.y);\r
  if (row >= floor(height + 0.5)) discard;\r
  float below = floor(height + 0.5) - row;\r
  float crest = below <= 1.0 ? 1.0 : 0.0;\r
  ivec2 bayerCell = cell & 3;\r
  int bayerIndex = bayerCell.x + bayerCell.y * 4;\r
  float bayer[16] = float[16](0.0, 8.0, 2.0, 10.0, 12.0, 4.0, 14.0, 6.0, 3.0, 11.0, 1.0, 9.0, 15.0, 7.0, 13.0, 5.0);\r
  float threshold = (bayer[bayerIndex] + 0.5) / 16.0;\r
  float shade = clamp((below - 1.0) / 9.0, 0.0, 1.0) * 3.0;\r
  float step3 = floor(shade) + step(threshold, fract(shade));\r
  float body = 0.94 - step3 * 0.13;\r
  float glint = below <= 3.0 ? step(0.992, hash(vec2(cell) + floor(uTime * 1.1 + hash(vec2(cell.yx)) * 9.0))) : 0.0;\r
  float core = crest * 0.6 + glint;\r
  outColor = vec4(body, core, 0.0, 1.0) * uLight;\r
}\`;\r
\r
const DOWN = \`#version 300 es\r
precision highp float;\r
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
const UP = \`#version 300 es\r
precision highp float;\r
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
  outColor = (sum / 12.0 + texture(uBase, uv)) * 0.5;\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uSnow;\r
uniform sampler2D uGlowMap;\r
uniform vec2 uResolution;\r
uniform vec2 uGrid;\r
uniform float uPixel;\r
uniform vec3 uColor;\r
uniform float uBrightness;\r
uniform float uGlow;\r
uniform float uFade;\r
uniform float uOpacity;\r
uniform float uLightMode;\r
out vec4 outColor;\r
\r
float smootherstep(float edge, float x) {\r
  float t = clamp(x / max(edge, 0.0001), 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy / uResolution;\r
  ivec2 cell = ivec2(floor(gl_FragCoord.xy / uPixel));\r
  vec4 snow = texelFetch(uSnow, clamp(cell, ivec2(0), ivec2(uGrid) - 1), 0);\r
  vec2 glow = texture(uGlowMap, gl_FragCoord.xy / (uGrid * uPixel)).rg;\r
  float edge = uFade * 0.5;\r
  float mask = smootherstep(edge, uv.x) * smootherstep(edge, 1.0 - uv.x) * smootherstep(edge, uv.y) * smootherstep(edge, 1.0 - uv.y);\r
  mask *= uOpacity;\r
  float body = clamp(snow.r * uBrightness, 0.0, 1.0);\r
  float core = clamp(snow.g * uBrightness, 0.0, 1.0);\r
  float halo = clamp(glow.r * uGlow * uBrightness, 0.0, 1.0);\r
  if (uLightMode > 0.5) {\r
    vec3 tint = mix(uColor, vec3(1.0), clamp(core / max(body, 0.001), 0.0, 1.0) * 0.45);\r
    float alpha = body * 0.95;\r
    vec4 color = vec4(tint * alpha, alpha);\r
    float soft = halo * 0.22 * (1.0 - alpha);\r
    color += vec4(uColor * soft, soft);\r
    outColor = color * mask;\r
  } else {\r
    vec3 color = uColor * (body * 0.82 + core * 0.18) + uColor * halo * 0.55;\r
    color = 1.0 - exp(-color * 1.6);\r
    color *= mask;\r
    outColor = vec4(color, max(color.r, max(color.g, color.b)));\r
  }\r
}\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const seeded = (seed: number) => {\r
  let a = seed >>> 0;\r
  return () => {\r
    a = (a + 0x6d2b79f5) >>> 0;\r
    let t = a;\r
    t = Math.imul(t ^ (t >>> 15), t | 1);\r
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\r
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\r
  };\r
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
const link = (\r
  gl: WebGL2RenderingContext,\r
  vertexSource: string,\r
  fragmentSource: string,\r
  attributes: string[]\r
): Program | null => {\r
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
const buildAtlas = () => {\r
  const width = CELL * SLOTS;\r
  const height = CELL * VARIANTS.length;\r
  const data = new Uint8Array(width * height * 4);\r
  VARIANTS.forEach((variant, row) => {\r
    SPRITES[variant].forEach((rows, level) => {\r
      rows.forEach((line, y) => {\r
        for (let x = 0; x < line.length; x++) {\r
          const mark = line[x];\r
          if (mark === '.') continue;\r
          const offset = ((row * CELL + y) * width + level * CELL + x) * 4;\r
          data[offset] = 255;\r
          data[offset + 1] = mark === '@' ? 255 : mark === 'o' ? 128 : 0;\r
          data[offset + 3] = 255;\r
        }\r
      });\r
    });\r
  });\r
  return { data, width, height };\r
};\r
\r
export default function PixelSnow({\r
  color = '#ffffff',\r
  variant = 'snowflake',\r
  density = 0.5,\r
  speed = 1,\r
  wind = 0.25,\r
  sway = 0.5,\r
  flakeSize = 1,\r
  pixelSize = 3,\r
  depth = 0.6,\r
  brightness = 1,\r
  glow = 0.8,\r
  twinkle = 0.35,\r
  accumulate = false,\r
  mouseInteraction = true,\r
  intro = true,\r
  fade = 0,\r
  opacity = 1,\r
  lightMode = false,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  ...rest\r
}: PixelSnowProps) {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings: Settings = {\r
    color: String(color),\r
    variant: Math.max(0, VARIANTS.indexOf(variant)),\r
    density: clamp(density, 0, 1),\r
    speed,\r
    wind: clamp(wind, -2, 2),\r
    sway: Math.max(0, sway),\r
    flakeSize: clamp(flakeSize, 0, 2),\r
    pixelSize: Math.round(clamp(pixelSize, 1, 12)),\r
    depth: clamp(depth, 0, 1),\r
    brightness: Math.max(0, brightness),\r
    glow: Math.max(0, glow),\r
    twinkle: clamp(twinkle, 0, 1),\r
    accumulate,\r
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
    const programs = {\r
      flake: link(gl, FLAKE_VERTEX, FLAKE_FRAGMENT, ['aCorner', 'aFlake']),\r
      pile: link(gl, QUAD_VERTEX, PILE, ['aPosition']),\r
      down: link(gl, QUAD_VERTEX, DOWN, ['aPosition']),\r
      up: link(gl, QUAD_VERTEX, UP, ['aPosition']),\r
      composite: link(gl, QUAD_VERTEX, COMPOSITE, ['aPosition'])\r
    } as Record<string, Program>;\r
    if (Object.values(programs).some(entry => !entry)) return undefined;\r
\r
    const atlas = buildAtlas();\r
    const atlasTexture = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, atlasTexture);\r
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, atlas.width, atlas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, atlas.data);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
\r
    const quadBuffer = gl.createBuffer();\r
    const quadVao = gl.createVertexArray();\r
    gl.bindVertexArray(quadVao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const cornerBuffer = gl.createBuffer();\r
    const instanceBuffer = gl.createBuffer();\r
    const flakeVao = gl.createVertexArray();\r
    gl.bindVertexArray(flakeVao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);\r
    gl.enableVertexAttribArray(1);\r
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 0, 0);\r
    gl.vertexAttribDivisor(1, 1);\r
    gl.bindVertexArray(null);\r
\r
    const createTarget = (filter: number): Target => {\r
      const target = { texture: gl.createTexture(), framebuffer: gl.createFramebuffer(), width: 0, height: 0 };\r
      gl.bindTexture(gl.TEXTURE_2D, target.texture);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      return target;\r
    };\r
    const sizeTarget = (target: Target, width: number, height: number) => {\r
      if (target.width === width && target.height === height) return;\r
      target.width = width;\r
      target.height = height;\r
      gl.bindTexture(gl.TEXTURE_2D, target.texture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target.texture, 0);\r
    };\r
    const snow = createTarget(gl.NEAREST);\r
    const pileTexture = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, pileTexture);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    let pile = new Float32Array(0);\r
    let pileWidth = 0;\r
    const down = [createTarget(gl.LINEAR), createTarget(gl.LINEAR), createTarget(gl.LINEAR)];\r
    const up = [createTarget(gl.LINEAR), createTarget(gl.LINEAR)];\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const colorCache = new Map<string, number[]>();\r
    const toRgb = (value: string): number[] => {\r
      const cached = colorCache.get(value);\r
      if (cached) return cached;\r
      let rgb = [1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#ffffff';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      colorCache.set(value, rgb);\r
      return rgb;\r
    };\r
\r
    const rng = seeded(4271);\r
    const flakes: Flake[] = [];\r
    const view = { width: 1, height: 1, ratio: 1, pixel: 1, gridWidth: 1, gridHeight: 1 };\r
    const pointer = { x: 0, y: 0, vx: 0, vy: 0, inside: false, time: 0 };\r
    const state = { time: 0, intro: settingsRef.current.intro && !reduce ? 0 : 1, push: 0 };\r
    const instances = new Float32Array(MAX_FLAKES * 4);\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const pickLevel = (r: number, s: Settings) => {\r
      const shift = s.flakeSize - 1;\r
      let total = 0;\r
      const weights = LEVEL_WEIGHTS.map((weight, level) => weight * Math.pow(2.2, shift * (level - 1.5)));\r
      const sum = weights.reduce((a, b) => a + b, 0);\r
      for (let level = 0; level < LEVELS; level++) {\r
        total += weights[level] / sum;\r
        if (r <= total) return level;\r
      }\r
      return LEVELS - 1;\r
    };\r
\r
    const spawn = (flake: Flake, s: Settings, top: boolean) => {\r
      flake.level = pickLevel(rng(), s);\r
      flake.x = rng() * (view.width + 40) - 20;\r
      flake.y = top ? -10 - rng() * 30 : rng() * view.height;\r
      flake.vx = 0;\r
      flake.vy = LEVEL_FALL[flake.level];\r
      flake.phase = rng() * Math.PI * 2;\r
      flake.rate = 0.6 + rng() * 0.9;\r
      flake.sparkle = rng() * 100;\r
      flake.drift = 0.7 + rng() * 0.6;\r
      flake.alt = rng() < 0.5;\r
      flake.reveal = rng();\r
      flake.levelSize = s.flakeSize;\r
    };\r
\r
    const populate = (s: Settings) => {\r
      const target = Math.round(clamp((view.width * view.height * s.density) / 1100, 0, MAX_FLAKES));\r
      while (flakes.length < target) {\r
        const flake = {} as Flake;\r
        spawn(flake, s, false);\r
        flakes.push(flake);\r
      }\r
      if (flakes.length > target) flakes.length = target;\r
    };\r
\r
    const simulate = (s: Settings, dt: number) => {\r
      const fall = s.speed;\r
      const windSpeed = s.wind * 46;\r
      const radius = 120;\r
      const pushing = state.push > 0.001 && pointer.inside;\r
      const margin = 24;\r
      const settle = s.accumulate && fall > 0 && pile.length > 0;\r
      for (const flake of flakes) {\r
        if (flake.levelSize !== s.flakeSize) {\r
          flake.level = pickLevel(rng(), s);\r
          flake.levelSize = s.flakeSize;\r
        }\r
        const level = flake.level;\r
        const parallax = 1 - s.depth * (1 - (level + 1) / LEVELS) * 0.75;\r
        const swing = Math.sin(state.time * flake.rate + flake.phase) * s.sway * (6 + level * 7);\r
        const targetX = (windSpeed * parallax + swing) * flake.drift;\r
        const targetY = LEVEL_FALL[level] * parallax * fall * flake.drift;\r
        const ease = 1 - Math.exp(-dt * 2.2);\r
        flake.vx += (targetX - flake.vx) * ease;\r
        flake.vy += (targetY - flake.vy) * ease;\r
        if (pushing) {\r
          const dx = flake.x - pointer.x;\r
          const dy = flake.y - pointer.y;\r
          const distance = Math.hypot(dx, dy);\r
          if (distance < radius && distance > 0.001) {\r
            const near = 1 - distance / radius;\r
            const repel = near * near * near * state.push * 1500 * dt;\r
            const carry = near * near * state.push * dt * 5;\r
            flake.vx += (dx / distance) * repel + pointer.vx * carry;\r
            flake.vy += (dy / distance) * repel + pointer.vy * carry;\r
          }\r
        }\r
        flake.x += flake.vx * dt;\r
        flake.y += flake.vy * dt;\r
        if (settle) {\r
          const column = Math.floor(flake.x / view.pixel);\r
          if (column >= 0 && column < pile.length) {\r
            const surface = view.height - pile[column] * view.pixel;\r
            if (flake.y >= surface && pile[column] > 0.5) {\r
              const reach = level;\r
              for (let k = -reach; k <= reach; k++) {\r
                const index = column + k;\r
                if (index >= 0 && index < pile.length)\r
                  pile[index] += (0.35 + level * 0.15) * (1 - Math.abs(k) / (reach + 1));\r
              }\r
              spawn(flake, s, true);\r
              flake.reveal = -1;\r
              continue;\r
            }\r
          }\r
        }\r
        if (fall >= 0 ? flake.y > view.height + margin : flake.y < -margin) {\r
          spawn(flake, s, true);\r
          flake.reveal = -1;\r
          if (fall < 0) flake.y = view.height + 10 + rng() * 30;\r
        }\r
        if (flake.x < -margin) flake.x += view.width + margin * 2;\r
        else if (flake.x > view.width + margin) flake.x -= view.width + margin * 2;\r
      }\r
    };\r
\r
    const settlePile = (s: Settings, dt: number) => {\r
      if (!pile.length) return;\r
      const cap = Math.max(4, view.gridHeight * 0.08);\r
      if (s.accumulate && s.speed > 0) {\r
        const grow = (0.25 + s.density * 0.9) * dt * Math.min(1, s.speed);\r
        for (let i = 0; i < pile.length; i++) {\r
          const dune = 0.55 + 0.45 * Math.sin(i * 0.045 + Math.sin(i * 0.013) * 2.1) * Math.sin(i * 0.021 + 1.3);\r
          if (pile[i] < cap * dune) pile[i] += grow * (0.6 + 0.8 * dune);\r
        }\r
      }\r
      for (let pass = 0; pass < 2; pass++) {\r
        const forward = pass === 0;\r
        for (let k = 0; k < pile.length - 1; k++) {\r
          const i = forward ? k : pile.length - 2 - k;\r
          const difference = pile[i] - pile[i + 1];\r
          if (Math.abs(difference) > 1.2) {\r
            const move = (Math.abs(difference) - 1.2) * 0.5 * Math.sign(difference);\r
            pile[i] -= move;\r
            pile[i + 1] += move;\r
          }\r
        }\r
      }\r
      for (let i = 0; i < pile.length; i++) {\r
        const excess = Math.max(0, pile[i] - cap);\r
        const rate = s.accumulate && s.speed > 0 ? excess * 0.8 : 2 + pile[i] * 0.6;\r
        pile[i] = Math.max(0, pile[i] - rate * dt);\r
      }\r
    };\r
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
    const render = () => {\r
      const s = settingsRef.current;\r
      sizeTarget(snow, view.gridWidth, view.gridHeight);\r
      let count = 0;\r
      const sizes = SPRITES[VARIANTS[s.variant]].map(rows => rows.length);\r
      const sweep = state.intro * 1.75;\r
      for (const flake of flakes) {\r
        const level = flake.level;\r
        const depthLight = 1 - s.depth * (1 - LEVEL_LIGHT[level]);\r
        const spark = Math.pow(Math.max(0, Math.sin(state.time * 0.9 + flake.sparkle)), 60) * s.twinkle;\r
        const reveal =\r
          flake.reveal < 0 || state.intro >= 1\r
            ? 1\r
            : clamp((sweep - flake.y / view.height - flake.reveal * 0.25) / 0.35, 0, 1);\r
        if (reveal <= 0) continue;\r
        const slot = level >= 2 && flake.alt ? level + 3 : level;\r
        const o = count * 4;\r
        instances[o] = flake.x / view.pixel;\r
        instances[o + 1] = flake.y / view.pixel;\r
        instances[o + 2] = s.variant * SLOTS + slot;\r
        instances[o + 3] = Math.min(1, depthLight * (0.85 + spark * 0.6)) * reveal * reveal;\r
        count++;\r
      }\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, snow.framebuffer);\r
      gl.viewport(0, 0, snow.width, snow.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      if (pile.length && pile.some(height => height > 0.4)) {\r
        gl.bindTexture(gl.TEXTURE_2D, pileTexture);\r
        if (pileWidth !== pile.length) {\r
          pileWidth = pile.length;\r
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, pileWidth, 1, 0, gl.RED, gl.FLOAT, pile);\r
        } else {\r
          gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, pileWidth, 1, gl.RED, gl.FLOAT, pile);\r
        }\r
        const pileProgram = programs.pile;\r
        gl.useProgram(pileProgram.program);\r
        gl.activeTexture(gl.TEXTURE0);\r
        gl.bindTexture(gl.TEXTURE_2D, pileTexture);\r
        gl.uniform1i(pileProgram.uniforms.uPile, 0);\r
        gl.uniform1f(pileProgram.uniforms.uTime, state.time);\r
        gl.uniform1f(pileProgram.uniforms.uLight, 1 - s.depth * 0.1);\r
        gl.bindVertexArray(quadVao);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      }\r
      if (count > 0) {\r
        const flake = programs.flake;\r
        gl.useProgram(flake.program);\r
        gl.uniform2f(flake.uniforms.uGrid, snow.width, snow.height);\r
        gl.uniform4f(flake.uniforms.uSizes, sizes[1], sizes[2], sizes[3], 0);\r
        gl.uniform1f(flake.uniforms.uLargest, sizes[4]);\r
        gl.activeTexture(gl.TEXTURE0);\r
        gl.bindTexture(gl.TEXTURE_2D, atlasTexture);\r
        gl.uniform1i(flake.uniforms.uAtlas, 0);\r
        gl.enable(gl.BLEND);\r
        gl.blendEquation(gl.MAX);\r
        gl.bindVertexArray(flakeVao);\r
        gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);\r
        gl.bufferData(gl.ARRAY_BUFFER, instances.subarray(0, count * 4), gl.DYNAMIC_DRAW);\r
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, count);\r
        gl.blendEquation(gl.FUNC_ADD);\r
        gl.disable(gl.BLEND);\r
      }\r
\r
      gl.bindVertexArray(quadVao);\r
      let source = snow;\r
      for (let level = 0; level < down.length; level++) {\r
        const target = down[level];\r
        sizeTarget(target, Math.max(1, Math.ceil(source.width / 2)), Math.max(1, Math.ceil(source.height / 2)));\r
        gl.useProgram(programs.down.program);\r
        gl.uniform2f(programs.down.uniforms.uTexel, 1 / source.width, 1 / source.height);\r
        gl.uniform2f(programs.down.uniforms.uTarget, target.width, target.height);\r
        bindTexture(programs.down, 'uSource', 0, source.texture);\r
        run(programs.down, target, target.width, target.height);\r
        source = target;\r
      }\r
      for (let level = up.length - 1; level >= 0; level--) {\r
        const from = level === up.length - 1 ? down[down.length - 1] : up[level + 1];\r
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
      gl.uniform2f(c.uGrid, snow.width, snow.height);\r
      gl.uniform1f(c.uPixel, view.pixel * view.ratio);\r
      gl.uniform3fv(c.uColor, toRgb(s.color));\r
      gl.uniform1f(c.uBrightness, s.brightness);\r
      gl.uniform1f(c.uGlow, s.glow);\r
      gl.uniform1f(c.uFade, s.fade);\r
      gl.uniform1f(c.uOpacity, s.opacity);\r
      gl.uniform1f(c.uLightMode, s.lightMode ? 1 : 0);\r
      bindTexture(composite, 'uSnow', 0, snow.texture);\r
      bindTexture(composite, 'uGlowMap', 1, up[0].texture);\r
      run(composite, null, canvas.width, canvas.height);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const moving = !s.paused && !reduce;\r
      if (!s.intro || reduce) state.intro = 1;\r
      else if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / INTRO_SECONDS);\r
      const goal = s.mouseInteraction && pointer.inside && !reduce ? 1 : 0;\r
      state.push += (goal - state.push) * (1 - Math.exp(-dt * (goal ? 6 : 3)));\r
      pointer.vx *= Math.exp(-dt * 6);\r
      pointer.vy *= Math.exp(-dt * 6);\r
      populate(s);\r
      if (moving) {\r
        state.time += dt;\r
        simulate(s, dt);\r
        settlePile(s, dt);\r
      }\r
      render();\r
      if (moving || Math.abs(goal - state.push) > 0.001) raf = requestAnimationFrame(frame);\r
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
      view.ratio = ratio;\r
      view.pixel = Math.max(1, Math.round(s.pixelSize * ratio)) / ratio;\r
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      view.gridWidth = Math.max(1, Math.ceil(width / view.pixel));\r
      view.gridHeight = Math.max(1, Math.ceil(height / view.pixel));\r
      if (pile.length !== view.gridWidth) pile = new Float32Array(view.gridWidth);\r
      populate(s);\r
      if (!raf) render();\r
      wake();\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      const now = performance.now();\r
      if (pointer.inside && pointer.time) {\r
        const elapsed = Math.max(1, now - pointer.time) / 1000;\r
        pointer.vx = clamp((x - pointer.x) / elapsed, -3000, 3000);\r
        pointer.vy = clamp((y - pointer.y) / elapsed, -3000, 3000);\r
      }\r
      pointer.x = x;\r
      pointer.y = y;\r
      pointer.time = now;\r
      pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
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
    let lastPixel = settingsRef.current.pixelSize;\r
    let lastDpr = settingsRef.current.dpr;\r
    wakeRef.current = () => {\r
      const s = settingsRef.current;\r
      if (s.pixelSize !== lastPixel || s.dpr !== lastDpr) {\r
        lastPixel = s.pixelSize;\r
        lastDpr = s.dpr;\r
        resize();\r
        return;\r
      }\r
      populate(s);\r
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
      for (const target of [snow, ...down, ...up]) {\r
        gl.deleteTexture(target.texture);\r
        gl.deleteFramebuffer(target.framebuffer);\r
      }\r
      for (const entry of Object.values(programs)) gl.deleteProgram(entry.program);\r
      gl.deleteTexture(atlasTexture);\r
      gl.deleteTexture(pileTexture);\r
      gl.deleteBuffer(quadBuffer);\r
      gl.deleteBuffer(cornerBuffer);\r
      gl.deleteBuffer(instanceBuffer);\r
      gl.deleteVertexArray(quadVao);\r
      gl.deleteVertexArray(flakeVao);\r
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
`,l={usage:`import PixelSnow from './PixelSnow';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <PixelSnow
    color="#ffffff"
    variant="snowflake"
    density={0.5}
    speed={1}
    wind={0.25}
    flakeSize={1}
    pixelSize={3}
    glow={0.8}
    mouseInteraction={true}
  />
</div>`,code:r,css:e,tailwind:n,tsCode:t,tsTailwind:o};export{l as pixelSnow};
