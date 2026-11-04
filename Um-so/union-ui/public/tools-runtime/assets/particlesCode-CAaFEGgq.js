const r=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
import './Particles.css';\r
\r
const SHAPES = { circle: 0, square: 1, ring: 2, sparkle: 3 };\r
const EFFECTS = { parallax: 0, repel: 1, attract: 2 };\r
const DRIFTS = { none: 0, up: 1, down: 2, forward: 3 };\r
const MAX_COUNT = 20000;\r
const MAX_LINKED = 900;\r
const MAX_LINES = 9000;\r
const MAX_BURSTS = 4;\r
const DEPTH = 10;\r
const FOCAL = 1 / Math.tan((7.5 * Math.PI) / 180);\r
const NEAR = 0.1;\r
const FAR = 100;\r
const INTRO_SECONDS = 1.8;\r
const BURST_SECONDS = 1.5;\r
const BURST_SPEED = 520;\r
const BURST_WIDTH = 46;\r
\r
const PARTICLE_VERTEX = \`#version 300 es\r
precision highp float;\r
layout(location = 0) in vec2 aCorner;\r
layout(location = 1) in vec3 aPosition;\r
layout(location = 2) in vec4 aRandom;\r
layout(location = 3) in vec3 aColor;\r
uniform mat3 uRotation;\r
uniform vec3 uOffset;\r
uniform float uSpread;\r
uniform float uTime;\r
uniform float uCamera;\r
uniform float uAspect;\r
uniform vec2 uView;\r
uniform float uRatio;\r
uniform float uSize;\r
uniform float uRandomness;\r
uniform float uBlur;\r
uniform float uFocus;\r
uniform float uGlow;\r
uniform float uTwinkle;\r
uniform int uShape;\r
uniform int uDrift;\r
uniform float uTravel;\r
uniform vec4 uPointer;\r
uniform int uEffect;\r
uniform float uStrength;\r
uniform vec4 uBursts[\${MAX_BURSTS}];\r
uniform int uBurstCount;\r
uniform float uReveal;\r
out vec2 vLocal;\r
out float vRadius;\r
out float vBlur;\r
out float vAlpha;\r
out float vHalo;\r
out float vSeed;\r
out vec3 vColor;\r
\r
vec3 bob(vec4 r, float t) {\r
  return vec3(\r
    sin(t * r.z + 6.28 * r.w) * mix(0.1, 1.5, r.x),\r
    sin(t * r.y + 6.28 * r.x) * mix(0.1, 1.5, r.w),\r
    sin(t * r.w + 6.28 * r.y) * mix(0.1, 1.5, r.z)\r
  );\r
}\r
\r
void main() {\r
  vec3 pos = aPosition * uSpread;\r
  pos.z *= \${DEPTH.toFixed(1)};\r
  vec3 wobble = bob(aRandom, uTime);\r
  vec3 world = uRotation * pos + uOffset + wobble;\r
  float edge = 1.0;\r
  if (uDrift == 1 || uDrift == 2) {\r
    float span = uSpread * 2.0 + 3.0;\r
    float k = mod(aRandom.w * span + uOffset.y + wobble.y + (uDrift == 1 ? uTravel : -uTravel), span);\r
    world.y = k - span * 0.5;\r
    edge = smoothstep(0.0, span * 0.12, k) * smoothstep(span, span * 0.88, k);\r
  } else if (uDrift == 3) {\r
    float span = uSpread * \${DEPTH.toFixed(1)} * 2.0 + 3.0;\r
    float k = mod(aRandom.y * span + uOffset.z + wobble.z + uTravel, span);\r
    world.z = k - span * 0.5;\r
    edge = smoothstep(0.0, span * 0.1, k);\r
  }\r
  vec3 view = world - vec3(0.0, 0.0, uCamera);\r
  float dist = length(view);\r
  float ahead = -view.z;\r
  if (ahead < \${NEAR.toFixed(2)} || ahead > \${FAR.toFixed(1)}) {\r
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);\r
    return;\r
  }\r
  edge *= smoothstep(1.0, 4.0, ahead);\r
  vec2 ndc = vec2(view.x * \${FOCAL.toFixed(6)} / uAspect, view.y * \${FOCAL.toFixed(6)}) / ahead;\r
  vec2 screen = (ndc * 0.5 + 0.5) * uView;\r
\r
  vec2 shift = vec2(0.0);\r
  float flash = 0.0;\r
  if (uEffect != 0 && uPointer.z > 0.001) {\r
    vec2 delta = screen - uPointer.xy;\r
    float reach = length(delta);\r
    float falloff = exp(-dot(delta, delta) / (uPointer.w * uPointer.w));\r
    vec2 away = reach > 0.001 ? delta / reach : vec2(0.0);\r
    shift += (uEffect == 1 ? away * uPointer.w * 0.5 : -delta * 0.6) * falloff * uStrength * uPointer.z;\r
  }\r
  for (int i = 0; i < \${MAX_BURSTS}; i++) {\r
    if (i >= uBurstCount) break;\r
    vec4 burst = uBursts[i];\r
    vec2 delta = screen - burst.xy;\r
    float reach = length(delta);\r
    float wave = exp(-pow((reach - burst.z * \${BURST_SPEED.toFixed(1)}) / \${BURST_WIDTH.toFixed(1)}, 2.0));\r
    vec2 away = reach > 0.001 ? delta / reach : vec2(0.0);\r
    float fade = (1.0 - burst.z) * (1.0 - burst.z) * burst.w;\r
    shift += away * wave * fade * 56.0 * smoothstep(0.0, 30.0, reach);\r
    flash += wave * fade;\r
  }\r
  screen += shift;\r
\r
  float diameter = (uRandomness <= 0.0 ? uSize : uSize * (1.0 + uRandomness * (aRandom.x - 0.5)) / dist) * (1.0 + min(flash, 1.0) * 0.6);\r
  float device = diameter * uRatio;\r
  float radius = max(diameter, 1.0 / uRatio) * 0.5;\r
  float coverage = min(1.0, device * device);\r
  float blur = uBlur * max(uFocus - dist, 0.0) / max(dist, 1.0);\r
  float halo = uGlow > 0.0 ? radius * 2.5 + 2.0 : 0.0;\r
  float extent = radius * (uShape == 3 ? 1.6 : 1.0) + blur + halo + 1.5;\r
\r
  float twinkle = 1.0 - uTwinkle * 0.6 * (0.5 + 0.5 * sin(uTime * (6.0 + aRandom.y * 14.0) + aRandom.w * 40.0));\r
  float far = smoothstep(\${FAR.toFixed(1)}, \${(FAR * 0.9).toFixed(1)}, ahead);\r
  float focus = radius / (radius + blur);\r
  float reveal = clamp(uReveal * 1.6 - aRandom.z * 0.6, 0.0, 1.0);\r
\r
  vLocal = aCorner * extent;\r
  vRadius = radius;\r
  vBlur = blur;\r
  vHalo = halo;\r
  vSeed = aRandom.y;\r
  vAlpha = min(1.0, coverage * twinkle * (1.0 + flash * 1.4)) * far * edge * max(focus, 0.35) * reveal * reveal;\r
  vColor = aColor;\r
  gl_Position = vec4((screen + aCorner * extent) / uView * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const PARTICLE_FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform int uShape;\r
uniform float uGlow;\r
uniform float uRatio;\r
uniform float uTime;\r
uniform float uSoft;\r
uniform float uShimmer;\r
uniform float uOpacity;\r
in vec2 vLocal;\r
in float vRadius;\r
in float vBlur;\r
in float vAlpha;\r
in float vHalo;\r
in float vSeed;\r
in vec3 vColor;\r
out vec4 outColor;\r
\r
float ray(vec2 q, float aa) {\r
  float width = 0.14 * max(0.0, 1.0 - q.x);\r
  return (1.0 - smoothstep(width - aa, width + aa, q.y)) * step(q.x, 1.0);\r
}\r
\r
void main() {\r
  float soft = vBlur + 0.7 / uRatio + vRadius * uSoft;\r
  float d = length(vLocal);\r
  float shape;\r
  if (uShape == 1) {\r
    float box = max(abs(vLocal.x), abs(vLocal.y));\r
    shape = 1.0 - smoothstep(vRadius * 0.86 - soft, vRadius * 0.86 + soft, box);\r
  } else if (uShape == 2) {\r
    float edge = max(vRadius * 0.22, 0.6 / uRatio);\r
    shape = 1.0 - smoothstep(edge - soft, edge + soft, abs(d - vRadius * 0.8));\r
  } else if (uShape == 3) {\r
    float reach = vRadius * 1.6;\r
    vec2 q = abs(vLocal) / max(reach, 0.0001);\r
    float aa = soft / max(reach, 0.0001);\r
    shape = max(max(ray(q, aa), ray(q.yx, aa)), 1.0 - smoothstep(vRadius * 0.32 - soft, vRadius * 0.32 + soft, d));\r
  } else {\r
    shape = 1.0 - smoothstep(vRadius - soft, vRadius + soft, d);\r
  }\r
  float halo = vHalo > 0.0 ? exp(-d / (vHalo * 0.35)) * uGlow * 0.4 : 0.0;\r
  float alpha = clamp(shape + halo * (1.0 - shape), 0.0, 1.0) * vAlpha * uOpacity * (1.0 - uSoft);\r
  if (alpha < 0.002) discard;\r
  vec2 uv = vLocal / max(vRadius * 2.0, 0.0001) + 0.5;\r
  vec3 color = clamp(vColor + uShimmer * 0.2 * sin(uv.yxx + uTime + vSeed * 6.28), 0.0, 1.0);\r
  outColor = vec4(color * alpha, alpha);\r
}\`;\r
\r
const LINE_VERTEX = \`#version 300 es\r
precision highp float;\r
layout(location = 0) in vec2 aCorner;\r
layout(location = 1) in vec4 aEnds;\r
layout(location = 2) in vec4 aTint;\r
uniform vec2 uView;\r
uniform float uRatio;\r
uniform float uWidth;\r
out float vAcross;\r
out float vHalf;\r
out vec4 vTint;\r
\r
void main() {\r
  vec2 a = aEnds.xy;\r
  vec2 b = aEnds.zw;\r
  vec2 along = b - a;\r
  float span = max(length(along), 0.0001);\r
  vec2 normal = vec2(-along.y, along.x) / span;\r
  float reach = uWidth * 0.5 + 1.0 / uRatio;\r
  vec2 point = mix(a, b, aCorner.x * 0.5 + 0.5) + normal * aCorner.y * reach;\r
  vAcross = aCorner.y * reach;\r
  vHalf = uWidth * 0.5;\r
  vTint = aTint;\r
  gl_Position = vec4(point / uView * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const LINE_FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform float uRatio;\r
uniform float uOpacity;\r
in float vAcross;\r
in float vHalf;\r
in vec4 vTint;\r
out vec4 outColor;\r
\r
void main() {\r
  float edge = 0.6 / uRatio;\r
  float cover = 1.0 - smoothstep(vHalf - edge, vHalf + edge, abs(vAcross));\r
  float alpha = cover * vTint.a * uOpacity;\r
  outColor = vec4(vTint.rgb * alpha, alpha);\r
}\`;\r
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
const link = (gl, vertexSource, fragmentSource) => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);\r
  const program = gl.createProgram();\r
  if (!vertex || !fragment || !program) return null;\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
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
    if (info) uniforms[info.name.replace('[0]', '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const seeded = seed => {\r
  let state = seed >>> 0;\r
  return () => {\r
    state = (state + 0x6d2b79f5) >>> 0;\r
    let t = state;\r
    t = Math.imul(t ^ (t >>> 15), t | 1);\r
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\r
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\r
  };\r
};\r
\r
const easeOut = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);\r
\r
const wrap = (value, span) => ((value % span) + span) % span;\r
\r
const Particles = ({\r
  particleCount = 200,\r
  particleSpread = 10,\r
  speed = 0.1,\r
  particleColors = ['#ffffff'],\r
  moveParticlesOnHover = true,\r
  particleHoverFactor = 1,\r
  alphaParticles = false,\r
  particleBaseSize = 100,\r
  sizeRandomness = 1,\r
  cameraDistance = 20,\r
  disableRotation = false,\r
  pixelRatio,\r
  shape = 'circle',\r
  glow = 0.5,\r
  twinkle = 0.3,\r
  depthOfField = 0,\r
  connections = false,\r
  connectionDistance = 110,\r
  hoverEffect = 'parallax',\r
  hoverRadius = 140,\r
  clickBurst = true,\r
  drift = 'none',\r
  driftSpeed = 1,\r
  variation = 0,\r
  intro = true,\r
  opacity = 1,\r
  lightMode = false,\r
  paused = false,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const palette = (Array.isArray(particleColors) ? particleColors : [particleColors]).filter(Boolean).map(String);\r
  const settings = {\r
    count: clamp(Math.round(particleCount), 1, MAX_COUNT),\r
    spread: Math.max(0.1, particleSpread),\r
    speed,\r
    colors: palette.length ? palette : ['#ffffff'],\r
    mouse: moveParticlesOnHover,\r
    hoverFactor: Math.max(0, particleHoverFactor),\r
    soft: alphaParticles,\r
    size: Math.max(0, particleBaseSize),\r
    randomness: Math.max(0, sizeRandomness),\r
    camera: Math.max(1, cameraDistance),\r
    rotate: !disableRotation,\r
    dpr: pixelRatio,\r
    shape: SHAPES[shape] ?? 0,\r
    glow: Math.max(0, glow),\r
    twinkle: clamp(twinkle, 0, 1),\r
    depthOfField: Math.max(0, depthOfField),\r
    connections,\r
    connectionDistance: Math.max(10, connectionDistance),\r
    hoverEffect: EFFECTS[hoverEffect] ?? 0,\r
    hoverRadius: Math.max(20, hoverRadius),\r
    clickBurst,\r
    drift: DRIFTS[drift] ?? 0,\r
    driftSpeed,\r
    variation: Math.max(0, Math.round(variation)),\r
    intro,\r
    opacity: clamp(opacity, 0, 1),\r
    lightMode,\r
    paused\r
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
    const dots = link(gl, PARTICLE_VERTEX, PARTICLE_FRAGMENT);\r
    const lines = link(gl, LINE_VERTEX, LINE_FRAGMENT);\r
    if (!dots || !lines) return undefined;\r
\r
    const corners = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, corners);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
\r
    const positionBuffer = gl.createBuffer();\r
    const randomBuffer = gl.createBuffer();\r
    const colorBuffer = gl.createBuffer();\r
    const dotVao = gl.createVertexArray();\r
    gl.bindVertexArray(dotVao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, corners);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    const attach = (buffer, location, width) => {\r
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
      gl.enableVertexAttribArray(location);\r
      gl.vertexAttribPointer(location, width, gl.FLOAT, false, 0, 0);\r
      gl.vertexAttribDivisor(location, 1);\r
    };\r
    attach(positionBuffer, 1, 3);\r
    attach(randomBuffer, 2, 4);\r
    attach(colorBuffer, 3, 3);\r
\r
    const lineBuffer = gl.createBuffer();\r
    const lineData = new Float32Array(MAX_LINES * 8);\r
    const lineVao = gl.createVertexArray();\r
    gl.bindVertexArray(lineVao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, corners);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, lineData.byteLength, gl.DYNAMIC_DRAW);\r
    gl.enableVertexAttribArray(1);\r
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 32, 0);\r
    gl.vertexAttribDivisor(1, 1);\r
    gl.enableVertexAttribArray(2);\r
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 32, 16);\r
    gl.vertexAttribDivisor(2, 1);\r
    gl.bindVertexArray(null);\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const cache = new Map();\r
    const parse = value => {\r
      if (cache.has(value)) return cache.get(value);\r
      let rgb = [1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#ffffff';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      cache.set(value, rgb);\r
      return rgb;\r
    };\r
    const ink = rgb => {\r
      const linear = rgb.map(v => Math.pow(v, 2.2));\r
      const tone = 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];\r
      const depth = Math.min(1, 0.06 / Math.max(tone, 0.0001));\r
      return linear.map(v => Math.pow(v * depth, 1 / 2.2));\r
    };\r
\r
    const view = { width: 1, height: 1, ratio: 1 };\r
    const pointer = { x: 0, y: 0, sx: 0, sy: 0, nx: 0, ny: 0, inside: false, active: 0 };\r
    const state = {\r
      clock: 0,\r
      spin: 0,\r
      travel: 0,\r
      offsetX: 0,\r
      offsetY: 0,\r
      reveal: settingsRef.current.intro && !reduce ? 0 : 1\r
    };\r
    const bursts = [];\r
    const packedBursts = new Float32Array(MAX_BURSTS * 4);\r
    const cloud = {\r
      key: '',\r
      count: 0,\r
      positions: new Float32Array(0),\r
      randoms: new Float32Array(0),\r
      colors: new Float32Array(0)\r
    };\r
    const screen = {\r
      x: new Float32Array(0),\r
      y: new Float32Array(0),\r
      ahead: new Float32Array(0),\r
      alpha: new Float32Array(0)\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const rebuild = s => {\r
      const key = \`\${s.count}|\${s.variation}|\${s.colors.join(',')}|\${s.lightMode ? 1 : 0}\`;\r
      if (key === cloud.key) return;\r
      cloud.key = key;\r
      const next = seeded(s.variation * 7919 + 1);\r
      const total = s.count;\r
      const positions = new Float32Array(total * 3);\r
      const randoms = new Float32Array(total * 4);\r
      const tints = new Float32Array(total * 3);\r
      const swatches = s.colors.map(value => (s.lightMode ? ink(parse(value)) : parse(value)));\r
      for (let i = 0; i < total; i++) {\r
        let x;\r
        let y;\r
        let z;\r
        let len;\r
        do {\r
          x = next() * 2 - 1;\r
          y = next() * 2 - 1;\r
          z = next() * 2 - 1;\r
          len = x * x + y * y + z * z;\r
        } while (len > 1 || len === 0);\r
        const r = Math.cbrt(next());\r
        positions.set([x * r, y * r, z * r], i * 3);\r
        randoms.set([next(), next(), next(), next()], i * 4);\r
        tints.set(swatches[Math.floor(next() * swatches.length)], i * 3);\r
      }\r
      cloud.count = total;\r
      cloud.positions = positions;\r
      cloud.randoms = randoms;\r
      cloud.colors = tints;\r
      const linked = Math.min(total, MAX_LINKED);\r
      screen.x = new Float32Array(linked);\r
      screen.y = new Float32Array(linked);\r
      screen.ahead = new Float32Array(linked);\r
      screen.alpha = new Float32Array(linked);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, randomBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, randoms, gl.STATIC_DRAW);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, tints, gl.STATIC_DRAW);\r
    };\r
\r
    const rotationOf = s => {\r
      const elapsed = state.clock * 1000;\r
      const x = s.rotate ? Math.sin(elapsed * 0.0002) * 0.1 : 0;\r
      const y = s.rotate ? Math.cos(elapsed * 0.0005) * 0.15 : 0;\r
      const z = s.rotate ? state.spin : 0;\r
      const [sx, cx, sy, cy, sz, cz] = [Math.sin(x), Math.cos(x), Math.sin(y), Math.cos(y), Math.sin(z), Math.cos(z)];\r
      return [\r
        cy * cz + sy * sx * sz,\r
        cx * sz,\r
        -sy * cz + cy * sx * sz,\r
        -cy * sz + sy * sx * cz,\r
        cx * cz,\r
        sy * sz + cy * sx * cz,\r
        sy * cx,\r
        -sx,\r
        cy * cx\r
      ];\r
    };\r
\r
    const offsetOf = () => [state.offsetX, state.offsetY, -(1 - easeOut(state.reveal)) * 70];\r
\r
    const project = (s, matrix) => {\r
      const total = Math.min(cloud.count, MAX_LINKED);\r
      const [ox, oy, oz] = offsetOf();\r
      const aspect = view.width / view.height;\r
      const time = state.clock;\r
      const radius = s.hoverRadius;\r
      const active = s.hoverEffect !== 0 ? pointer.active : 0;\r
      const spanY = s.spread * 2 + 3;\r
      const spanZ = s.spread * DEPTH * 2 + 3;\r
      for (let i = 0; i < total; i++) {\r
        const px = cloud.positions[i * 3] * s.spread;\r
        const py = cloud.positions[i * 3 + 1] * s.spread;\r
        const pz = cloud.positions[i * 3 + 2] * s.spread * DEPTH;\r
        const r0 = cloud.randoms[i * 4];\r
        const r1 = cloud.randoms[i * 4 + 1];\r
        const r2 = cloud.randoms[i * 4 + 2];\r
        const r3 = cloud.randoms[i * 4 + 3];\r
        const bobX = Math.sin(time * r2 + 6.28 * r3) * (0.1 + 1.4 * r0);\r
        const bobY = Math.sin(time * r1 + 6.28 * r0) * (0.1 + 1.4 * r3);\r
        const bobZ = Math.sin(time * r3 + 6.28 * r1) * (0.1 + 1.4 * r2);\r
        const wx = matrix[0] * px + matrix[3] * py + matrix[6] * pz + ox + bobX;\r
        let wy = matrix[1] * px + matrix[4] * py + matrix[7] * pz + oy + bobY;\r
        let wz = matrix[2] * px + matrix[5] * py + matrix[8] * pz + oz + bobZ;\r
        let edge = 1;\r
        if (s.drift === 1 || s.drift === 2) {\r
          const k = wrap(r3 * spanY + oy + bobY + (s.drift === 1 ? state.travel : -state.travel), spanY);\r
          wy = k - spanY / 2;\r
          const low = clamp(k / (spanY * 0.12), 0, 1);\r
          const high = clamp((spanY - k) / (spanY * 0.12), 0, 1);\r
          edge = low * low * (3 - 2 * low) * high * high * (3 - 2 * high);\r
        } else if (s.drift === 3) {\r
          const k = wrap(r1 * spanZ + oz + bobZ + state.travel, spanZ);\r
          wz = k - spanZ / 2;\r
          const fresh = clamp(k / (spanZ * 0.1), 0, 1);\r
          edge = fresh * fresh * (3 - 2 * fresh);\r
        }\r
        const ahead = s.camera - wz;\r
        if (ahead < NEAR || ahead > FAR) {\r
          screen.alpha[i] = 0;\r
          continue;\r
        }\r
        const close = clamp((ahead - 1) / 3, 0, 1);\r
        edge *= close * close * (3 - 2 * close);\r
        let sx = ((wx * FOCAL) / aspect / ahead) * 0.5 * view.width + view.width / 2;\r
        let sy = ((wy * FOCAL) / ahead) * 0.5 * view.height + view.height / 2;\r
        let dx = 0;\r
        let dy = 0;\r
        if (active > 0.001) {\r
          const ex = sx - pointer.sx;\r
          const ey = sy - pointer.sy;\r
          const reach = Math.hypot(ex, ey);\r
          const falloff = Math.exp(-(ex * ex + ey * ey) / (radius * radius)) * s.hoverFactor * active;\r
          if (s.hoverEffect === 1 && reach > 0.001) {\r
            dx += (ex / reach) * radius * 0.5 * falloff;\r
            dy += (ey / reach) * radius * 0.5 * falloff;\r
          } else if (s.hoverEffect === 2) {\r
            dx -= ex * 0.6 * falloff;\r
            dy -= ey * 0.6 * falloff;\r
          }\r
        }\r
        for (const burst of bursts) {\r
          const progress = burst.age / BURST_SECONDS;\r
          const ex = sx - burst.x;\r
          const ey = sy - burst.y;\r
          const reach = Math.hypot(ex, ey);\r
          if (reach < 0.001) continue;\r
          const wave = Math.exp(-Math.pow((reach - progress * BURST_SPEED) / BURST_WIDTH, 2));\r
          const ramp = clamp(reach / 30, 0, 1);\r
          const push = wave * (1 - progress) * (1 - progress) * 56 * ramp * ramp * (3 - 2 * ramp);\r
          dx += (ex / reach) * push;\r
          dy += (ey / reach) * push;\r
        }\r
        sx += dx;\r
        sy += dy;\r
        const far = clamp((FAR - ahead) / (FAR - FAR * 0.9), 0, 1);\r
        const reveal = clamp(state.reveal * 1.6 - r2 * 0.6, 0, 1);\r
        screen.x[i] = sx;\r
        screen.y[i] = sy;\r
        screen.ahead[i] = ahead;\r
        screen.alpha[i] = far * far * (3 - 2 * far) * edge * reveal * reveal;\r
      }\r
      return total;\r
    };\r
\r
    const buildLines = (s, matrix) => {\r
      const total = project(s, matrix);\r
      const reach = s.connectionDistance;\r
      const columns = Math.max(1, Math.ceil(view.width / reach) + 2);\r
      const buckets = new Map();\r
      for (let i = 0; i < total; i++) {\r
        if (screen.alpha[i] < 0.02) continue;\r
        const key = (Math.floor(screen.y[i] / reach) + 1) * columns + Math.floor(screen.x[i] / reach) + 1;\r
        const bucket = buckets.get(key);\r
        if (bucket) bucket.push(i);\r
        else buckets.set(key, [i]);\r
      }\r
      let lineCount = 0;\r
      const limit = reach * reach;\r
      for (const [key, members] of buckets) {\r
        for (const offset of [0, 1, columns - 1, columns, columns + 1]) {\r
          const others = offset === 0 ? members : buckets.get(key + offset);\r
          if (!others) continue;\r
          for (let a = 0; a < members.length; a++) {\r
            const i = members[a];\r
            for (let b = offset === 0 ? a + 1 : 0; b < others.length; b++) {\r
              const j = others[b];\r
              const dx = screen.x[i] - screen.x[j];\r
              const dy = screen.y[i] - screen.y[j];\r
              const gap = dx * dx + dy * dy;\r
              if (gap > limit) continue;\r
              const layer = clamp(1 - Math.abs(screen.ahead[i] - screen.ahead[j]) / 18, 0, 1);\r
              if (layer <= 0) continue;\r
              if (lineCount >= MAX_LINES) return lineCount;\r
              const fade = 1 - Math.sqrt(gap) / reach;\r
              const base = lineCount * 8;\r
              lineData[base] = screen.x[i];\r
              lineData[base + 1] = screen.y[i];\r
              lineData[base + 2] = screen.x[j];\r
              lineData[base + 3] = screen.y[j];\r
              lineData[base + 4] = (cloud.colors[i * 3] + cloud.colors[j * 3]) / 2;\r
              lineData[base + 5] = (cloud.colors[i * 3 + 1] + cloud.colors[j * 3 + 1]) / 2;\r
              lineData[base + 6] = (cloud.colors[i * 3 + 2] + cloud.colors[j * 3 + 2]) / 2;\r
              lineData[base + 7] = fade * fade * layer * 0.7 * Math.min(screen.alpha[i], screen.alpha[j]);\r
              lineCount++;\r
            }\r
          }\r
        }\r
      }\r
      return lineCount;\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      rebuild(s);\r
      const matrix = rotationOf(s);\r
      const [ox, oy, oz] = offsetOf();\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
\r
      if (s.connections) {\r
        const lineCount = buildLines(s, matrix);\r
        if (lineCount) {\r
          gl.useProgram(lines.program);\r
          gl.bindVertexArray(lineVao);\r
          gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);\r
          gl.bufferSubData(gl.ARRAY_BUFFER, 0, lineData.subarray(0, lineCount * 8));\r
          gl.uniform2f(lines.uniforms.uView, view.width, view.height);\r
          gl.uniform1f(lines.uniforms.uRatio, view.ratio);\r
          gl.uniform1f(lines.uniforms.uWidth, 1);\r
          gl.uniform1f(lines.uniforms.uOpacity, s.opacity);\r
          gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, lineCount);\r
        }\r
      }\r
\r
      const u = dots.uniforms;\r
      let burstCount = 0;\r
      for (let i = bursts.length - 1; i >= 0 && burstCount < MAX_BURSTS; i--) {\r
        packedBursts.set([bursts[i].x, bursts[i].y, bursts[i].age / BURST_SECONDS, 1], burstCount * 4);\r
        burstCount++;\r
      }\r
      gl.useProgram(dots.program);\r
      gl.bindVertexArray(dotVao);\r
      gl.uniformMatrix3fv(u.uRotation, false, matrix);\r
      gl.uniform3f(u.uOffset, ox, oy, oz);\r
      gl.uniform1f(u.uSpread, s.spread);\r
      gl.uniform1f(u.uTime, state.clock);\r
      gl.uniform1f(u.uCamera, s.camera);\r
      gl.uniform1f(u.uAspect, view.width / view.height);\r
      gl.uniform2f(u.uView, view.width, view.height);\r
      gl.uniform1f(u.uRatio, view.ratio);\r
      gl.uniform1f(u.uSize, s.size);\r
      gl.uniform1f(u.uRandomness, s.randomness);\r
      gl.uniform1f(u.uBlur, s.depthOfField * 14);\r
      gl.uniform1f(u.uFocus, s.camera + 14);\r
      gl.uniform1f(u.uGlow, s.lightMode ? s.glow * 0.3 : s.glow);\r
      gl.uniform1f(u.uTwinkle, s.twinkle);\r
      gl.uniform1i(u.uShape, s.shape);\r
      gl.uniform1i(u.uDrift, s.drift);\r
      gl.uniform1f(u.uTravel, state.travel);\r
      gl.uniform4f(u.uPointer, pointer.sx, pointer.sy, pointer.active, s.hoverRadius);\r
      gl.uniform1i(u.uEffect, s.hoverEffect);\r
      gl.uniform1f(u.uStrength, s.hoverFactor);\r
      gl.uniform4fv(u.uBursts, packedBursts);\r
      gl.uniform1i(u.uBurstCount, burstCount);\r
      gl.uniform1f(u.uReveal, state.reveal);\r
      gl.uniform1f(u.uSoft, s.soft ? 0.2 : 0);\r
      gl.uniform1f(u.uShimmer, s.lightMode ? 0 : 1);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, cloud.count);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.0005, 0.05) : 1 / 60;\r
      last = now;\r
      if (s.paused) {\r
        state.reveal = 1;\r
        render();\r
        last = 0;\r
        return;\r
      }\r
      const motion = reduce ? 0 : 1;\r
      const pace = dt * s.speed * motion;\r
      state.clock += pace;\r
      if (s.rotate) state.spin += pace * 0.6;\r
      state.travel += dt * s.driftSpeed * motion * (s.drift === 3 ? 6 : 0.9);\r
\r
      const engaged = s.mouse && pointer.inside && !reduce;\r
      const follow = 1 - Math.exp(-dt / 0.35);\r
      const parallax = engaged && s.hoverEffect === 0 ? s.hoverFactor : 0;\r
      state.offsetX += (-pointer.nx * parallax - state.offsetX) * follow;\r
      state.offsetY += (-pointer.ny * parallax - state.offsetY) * follow;\r
      pointer.sx += (pointer.x - pointer.sx) * (1 - Math.exp(-dt / 0.06));\r
      pointer.sy += (pointer.y - pointer.sy) * (1 - Math.exp(-dt / 0.06));\r
      pointer.active += ((engaged ? 1 : 0) - pointer.active) * (1 - Math.exp(-dt / 0.2));\r
\r
      for (let i = bursts.length - 1; i >= 0; i--) {\r
        bursts[i].age += dt;\r
        if (bursts[i].age >= BURST_SECONDS) bursts.splice(i, 1);\r
      }\r
\r
      if (!s.intro || reduce) state.reveal = 1;\r
      else if (state.reveal < 1) state.reveal = Math.min(1, state.reveal + dt / INTRO_SECONDS);\r
\r
      render();\r
      raf = requestAnimationFrame(frame);\r
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
      view.ratio = canvas.width / width;\r
      render();\r
      wake();\r
    };\r
\r
    const locate = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      const wasInside = pointer.inside;\r
      pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      pointer.x = x;\r
      pointer.y = rect.height - y;\r
      pointer.nx = (x / Math.max(1, rect.width)) * 2 - 1;\r
      pointer.ny = -((y / Math.max(1, rect.height)) * 2 - 1);\r
      if (pointer.inside && !wasInside) {\r
        pointer.sx = pointer.x;\r
        pointer.sy = pointer.y;\r
      }\r
    };\r
\r
    const onPointerMove = event => {\r
      locate(event);\r
      if (!settingsRef.current.paused) wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      locate(event);\r
      if (!pointer.inside || !s.clickBurst || s.paused || reduce) return;\r
      bursts.push({ x: pointer.x, y: pointer.y, age: 0 });\r
      if (bursts.length > MAX_BURSTS) bursts.shift();\r
      wake();\r
    };\r
\r
    const onPointerUp = event => {\r
      if (event.pointerType !== 'mouse') pointer.inside = false;\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
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
    window.addEventListener('pointerup', onPointerUp, { passive: true });\r
    window.addEventListener('pointercancel', onPointerUp, { passive: true });\r
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
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('pointerup', onPointerUp);\r
      window.removeEventListener('pointercancel', onPointerUp);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteProgram(dots.program);\r
      gl.deleteProgram(lines.program);\r
      [corners, positionBuffer, randomBuffer, colorBuffer, lineBuffer].forEach(buffer => gl.deleteBuffer(buffer));\r
      gl.deleteVertexArray(dotVao);\r
      gl.deleteVertexArray(lineVao);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div ref={containerRef} className={\`particles-container\${className ? \` \${className}\` : ''}\`} style={style}>\r
      <canvas ref={canvasRef} className="particles-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Particles;\r
`,n=`.particles-container {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.particles-canvas {\r
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
const SHAPES = { circle: 0, square: 1, ring: 2, sparkle: 3 };\r
const EFFECTS = { parallax: 0, repel: 1, attract: 2 };\r
const DRIFTS = { none: 0, up: 1, down: 2, forward: 3 };\r
const MAX_COUNT = 20000;\r
const MAX_LINKED = 900;\r
const MAX_LINES = 9000;\r
const MAX_BURSTS = 4;\r
const DEPTH = 10;\r
const FOCAL = 1 / Math.tan((7.5 * Math.PI) / 180);\r
const NEAR = 0.1;\r
const FAR = 100;\r
const INTRO_SECONDS = 1.8;\r
const BURST_SECONDS = 1.5;\r
const BURST_SPEED = 520;\r
const BURST_WIDTH = 46;\r
\r
const PARTICLE_VERTEX = \`#version 300 es\r
precision highp float;\r
layout(location = 0) in vec2 aCorner;\r
layout(location = 1) in vec3 aPosition;\r
layout(location = 2) in vec4 aRandom;\r
layout(location = 3) in vec3 aColor;\r
uniform mat3 uRotation;\r
uniform vec3 uOffset;\r
uniform float uSpread;\r
uniform float uTime;\r
uniform float uCamera;\r
uniform float uAspect;\r
uniform vec2 uView;\r
uniform float uRatio;\r
uniform float uSize;\r
uniform float uRandomness;\r
uniform float uBlur;\r
uniform float uFocus;\r
uniform float uGlow;\r
uniform float uTwinkle;\r
uniform int uShape;\r
uniform int uDrift;\r
uniform float uTravel;\r
uniform vec4 uPointer;\r
uniform int uEffect;\r
uniform float uStrength;\r
uniform vec4 uBursts[\${MAX_BURSTS}];\r
uniform int uBurstCount;\r
uniform float uReveal;\r
out vec2 vLocal;\r
out float vRadius;\r
out float vBlur;\r
out float vAlpha;\r
out float vHalo;\r
out float vSeed;\r
out vec3 vColor;\r
\r
vec3 bob(vec4 r, float t) {\r
  return vec3(\r
    sin(t * r.z + 6.28 * r.w) * mix(0.1, 1.5, r.x),\r
    sin(t * r.y + 6.28 * r.x) * mix(0.1, 1.5, r.w),\r
    sin(t * r.w + 6.28 * r.y) * mix(0.1, 1.5, r.z)\r
  );\r
}\r
\r
void main() {\r
  vec3 pos = aPosition * uSpread;\r
  pos.z *= \${DEPTH.toFixed(1)};\r
  vec3 wobble = bob(aRandom, uTime);\r
  vec3 world = uRotation * pos + uOffset + wobble;\r
  float edge = 1.0;\r
  if (uDrift == 1 || uDrift == 2) {\r
    float span = uSpread * 2.0 + 3.0;\r
    float k = mod(aRandom.w * span + uOffset.y + wobble.y + (uDrift == 1 ? uTravel : -uTravel), span);\r
    world.y = k - span * 0.5;\r
    edge = smoothstep(0.0, span * 0.12, k) * smoothstep(span, span * 0.88, k);\r
  } else if (uDrift == 3) {\r
    float span = uSpread * \${DEPTH.toFixed(1)} * 2.0 + 3.0;\r
    float k = mod(aRandom.y * span + uOffset.z + wobble.z + uTravel, span);\r
    world.z = k - span * 0.5;\r
    edge = smoothstep(0.0, span * 0.1, k);\r
  }\r
  vec3 view = world - vec3(0.0, 0.0, uCamera);\r
  float dist = length(view);\r
  float ahead = -view.z;\r
  if (ahead < \${NEAR.toFixed(2)} || ahead > \${FAR.toFixed(1)}) {\r
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);\r
    return;\r
  }\r
  edge *= smoothstep(1.0, 4.0, ahead);\r
  vec2 ndc = vec2(view.x * \${FOCAL.toFixed(6)} / uAspect, view.y * \${FOCAL.toFixed(6)}) / ahead;\r
  vec2 screen = (ndc * 0.5 + 0.5) * uView;\r
\r
  vec2 shift = vec2(0.0);\r
  float flash = 0.0;\r
  if (uEffect != 0 && uPointer.z > 0.001) {\r
    vec2 delta = screen - uPointer.xy;\r
    float reach = length(delta);\r
    float falloff = exp(-dot(delta, delta) / (uPointer.w * uPointer.w));\r
    vec2 away = reach > 0.001 ? delta / reach : vec2(0.0);\r
    shift += (uEffect == 1 ? away * uPointer.w * 0.5 : -delta * 0.6) * falloff * uStrength * uPointer.z;\r
  }\r
  for (int i = 0; i < \${MAX_BURSTS}; i++) {\r
    if (i >= uBurstCount) break;\r
    vec4 burst = uBursts[i];\r
    vec2 delta = screen - burst.xy;\r
    float reach = length(delta);\r
    float wave = exp(-pow((reach - burst.z * \${BURST_SPEED.toFixed(1)}) / \${BURST_WIDTH.toFixed(1)}, 2.0));\r
    vec2 away = reach > 0.001 ? delta / reach : vec2(0.0);\r
    float fade = (1.0 - burst.z) * (1.0 - burst.z) * burst.w;\r
    shift += away * wave * fade * 56.0 * smoothstep(0.0, 30.0, reach);\r
    flash += wave * fade;\r
  }\r
  screen += shift;\r
\r
  float diameter = (uRandomness <= 0.0 ? uSize : uSize * (1.0 + uRandomness * (aRandom.x - 0.5)) / dist) * (1.0 + min(flash, 1.0) * 0.6);\r
  float device = diameter * uRatio;\r
  float radius = max(diameter, 1.0 / uRatio) * 0.5;\r
  float coverage = min(1.0, device * device);\r
  float blur = uBlur * max(uFocus - dist, 0.0) / max(dist, 1.0);\r
  float halo = uGlow > 0.0 ? radius * 2.5 + 2.0 : 0.0;\r
  float extent = radius * (uShape == 3 ? 1.6 : 1.0) + blur + halo + 1.5;\r
\r
  float twinkle = 1.0 - uTwinkle * 0.6 * (0.5 + 0.5 * sin(uTime * (6.0 + aRandom.y * 14.0) + aRandom.w * 40.0));\r
  float far = smoothstep(\${FAR.toFixed(1)}, \${(FAR * 0.9).toFixed(1)}, ahead);\r
  float focus = radius / (radius + blur);\r
  float reveal = clamp(uReveal * 1.6 - aRandom.z * 0.6, 0.0, 1.0);\r
\r
  vLocal = aCorner * extent;\r
  vRadius = radius;\r
  vBlur = blur;\r
  vHalo = halo;\r
  vSeed = aRandom.y;\r
  vAlpha = min(1.0, coverage * twinkle * (1.0 + flash * 1.4)) * far * edge * max(focus, 0.35) * reveal * reveal;\r
  vColor = aColor;\r
  gl_Position = vec4((screen + aCorner * extent) / uView * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const PARTICLE_FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform int uShape;\r
uniform float uGlow;\r
uniform float uRatio;\r
uniform float uTime;\r
uniform float uSoft;\r
uniform float uShimmer;\r
uniform float uOpacity;\r
in vec2 vLocal;\r
in float vRadius;\r
in float vBlur;\r
in float vAlpha;\r
in float vHalo;\r
in float vSeed;\r
in vec3 vColor;\r
out vec4 outColor;\r
\r
float ray(vec2 q, float aa) {\r
  float width = 0.14 * max(0.0, 1.0 - q.x);\r
  return (1.0 - smoothstep(width - aa, width + aa, q.y)) * step(q.x, 1.0);\r
}\r
\r
void main() {\r
  float soft = vBlur + 0.7 / uRatio + vRadius * uSoft;\r
  float d = length(vLocal);\r
  float shape;\r
  if (uShape == 1) {\r
    float box = max(abs(vLocal.x), abs(vLocal.y));\r
    shape = 1.0 - smoothstep(vRadius * 0.86 - soft, vRadius * 0.86 + soft, box);\r
  } else if (uShape == 2) {\r
    float edge = max(vRadius * 0.22, 0.6 / uRatio);\r
    shape = 1.0 - smoothstep(edge - soft, edge + soft, abs(d - vRadius * 0.8));\r
  } else if (uShape == 3) {\r
    float reach = vRadius * 1.6;\r
    vec2 q = abs(vLocal) / max(reach, 0.0001);\r
    float aa = soft / max(reach, 0.0001);\r
    shape = max(max(ray(q, aa), ray(q.yx, aa)), 1.0 - smoothstep(vRadius * 0.32 - soft, vRadius * 0.32 + soft, d));\r
  } else {\r
    shape = 1.0 - smoothstep(vRadius - soft, vRadius + soft, d);\r
  }\r
  float halo = vHalo > 0.0 ? exp(-d / (vHalo * 0.35)) * uGlow * 0.4 : 0.0;\r
  float alpha = clamp(shape + halo * (1.0 - shape), 0.0, 1.0) * vAlpha * uOpacity * (1.0 - uSoft);\r
  if (alpha < 0.002) discard;\r
  vec2 uv = vLocal / max(vRadius * 2.0, 0.0001) + 0.5;\r
  vec3 color = clamp(vColor + uShimmer * 0.2 * sin(uv.yxx + uTime + vSeed * 6.28), 0.0, 1.0);\r
  outColor = vec4(color * alpha, alpha);\r
}\`;\r
\r
const LINE_VERTEX = \`#version 300 es\r
precision highp float;\r
layout(location = 0) in vec2 aCorner;\r
layout(location = 1) in vec4 aEnds;\r
layout(location = 2) in vec4 aTint;\r
uniform vec2 uView;\r
uniform float uRatio;\r
uniform float uWidth;\r
out float vAcross;\r
out float vHalf;\r
out vec4 vTint;\r
\r
void main() {\r
  vec2 a = aEnds.xy;\r
  vec2 b = aEnds.zw;\r
  vec2 along = b - a;\r
  float span = max(length(along), 0.0001);\r
  vec2 normal = vec2(-along.y, along.x) / span;\r
  float reach = uWidth * 0.5 + 1.0 / uRatio;\r
  vec2 point = mix(a, b, aCorner.x * 0.5 + 0.5) + normal * aCorner.y * reach;\r
  vAcross = aCorner.y * reach;\r
  vHalf = uWidth * 0.5;\r
  vTint = aTint;\r
  gl_Position = vec4(point / uView * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const LINE_FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform float uRatio;\r
uniform float uOpacity;\r
in float vAcross;\r
in float vHalf;\r
in vec4 vTint;\r
out vec4 outColor;\r
\r
void main() {\r
  float edge = 0.6 / uRatio;\r
  float cover = 1.0 - smoothstep(vHalf - edge, vHalf + edge, abs(vAcross));\r
  float alpha = cover * vTint.a * uOpacity;\r
  outColor = vec4(vTint.rgb * alpha, alpha);\r
}\`;\r
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
const link = (gl, vertexSource, fragmentSource) => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);\r
  const program = gl.createProgram();\r
  if (!vertex || !fragment || !program) return null;\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
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
    if (info) uniforms[info.name.replace('[0]', '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const seeded = seed => {\r
  let state = seed >>> 0;\r
  return () => {\r
    state = (state + 0x6d2b79f5) >>> 0;\r
    let t = state;\r
    t = Math.imul(t ^ (t >>> 15), t | 1);\r
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\r
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\r
  };\r
};\r
\r
const easeOut = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);\r
\r
const wrap = (value, span) => ((value % span) + span) % span;\r
\r
const Particles = ({\r
  particleCount = 200,\r
  particleSpread = 10,\r
  speed = 0.1,\r
  particleColors = ['#ffffff'],\r
  moveParticlesOnHover = true,\r
  particleHoverFactor = 1,\r
  alphaParticles = false,\r
  particleBaseSize = 100,\r
  sizeRandomness = 1,\r
  cameraDistance = 20,\r
  disableRotation = false,\r
  pixelRatio,\r
  shape = 'circle',\r
  glow = 0.5,\r
  twinkle = 0.3,\r
  depthOfField = 0,\r
  connections = false,\r
  connectionDistance = 110,\r
  hoverEffect = 'parallax',\r
  hoverRadius = 140,\r
  clickBurst = true,\r
  drift = 'none',\r
  driftSpeed = 1,\r
  variation = 0,\r
  intro = true,\r
  opacity = 1,\r
  lightMode = false,\r
  paused = false,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const palette = (Array.isArray(particleColors) ? particleColors : [particleColors]).filter(Boolean).map(String);\r
  const settings = {\r
    count: clamp(Math.round(particleCount), 1, MAX_COUNT),\r
    spread: Math.max(0.1, particleSpread),\r
    speed,\r
    colors: palette.length ? palette : ['#ffffff'],\r
    mouse: moveParticlesOnHover,\r
    hoverFactor: Math.max(0, particleHoverFactor),\r
    soft: alphaParticles,\r
    size: Math.max(0, particleBaseSize),\r
    randomness: Math.max(0, sizeRandomness),\r
    camera: Math.max(1, cameraDistance),\r
    rotate: !disableRotation,\r
    dpr: pixelRatio,\r
    shape: SHAPES[shape] ?? 0,\r
    glow: Math.max(0, glow),\r
    twinkle: clamp(twinkle, 0, 1),\r
    depthOfField: Math.max(0, depthOfField),\r
    connections,\r
    connectionDistance: Math.max(10, connectionDistance),\r
    hoverEffect: EFFECTS[hoverEffect] ?? 0,\r
    hoverRadius: Math.max(20, hoverRadius),\r
    clickBurst,\r
    drift: DRIFTS[drift] ?? 0,\r
    driftSpeed,\r
    variation: Math.max(0, Math.round(variation)),\r
    intro,\r
    opacity: clamp(opacity, 0, 1),\r
    lightMode,\r
    paused\r
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
    const dots = link(gl, PARTICLE_VERTEX, PARTICLE_FRAGMENT);\r
    const lines = link(gl, LINE_VERTEX, LINE_FRAGMENT);\r
    if (!dots || !lines) return undefined;\r
\r
    const corners = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, corners);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
\r
    const positionBuffer = gl.createBuffer();\r
    const randomBuffer = gl.createBuffer();\r
    const colorBuffer = gl.createBuffer();\r
    const dotVao = gl.createVertexArray();\r
    gl.bindVertexArray(dotVao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, corners);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    const attach = (buffer, location, width) => {\r
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
      gl.enableVertexAttribArray(location);\r
      gl.vertexAttribPointer(location, width, gl.FLOAT, false, 0, 0);\r
      gl.vertexAttribDivisor(location, 1);\r
    };\r
    attach(positionBuffer, 1, 3);\r
    attach(randomBuffer, 2, 4);\r
    attach(colorBuffer, 3, 3);\r
\r
    const lineBuffer = gl.createBuffer();\r
    const lineData = new Float32Array(MAX_LINES * 8);\r
    const lineVao = gl.createVertexArray();\r
    gl.bindVertexArray(lineVao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, corners);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, lineData.byteLength, gl.DYNAMIC_DRAW);\r
    gl.enableVertexAttribArray(1);\r
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 32, 0);\r
    gl.vertexAttribDivisor(1, 1);\r
    gl.enableVertexAttribArray(2);\r
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 32, 16);\r
    gl.vertexAttribDivisor(2, 1);\r
    gl.bindVertexArray(null);\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const cache = new Map();\r
    const parse = value => {\r
      if (cache.has(value)) return cache.get(value);\r
      let rgb = [1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#ffffff';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      cache.set(value, rgb);\r
      return rgb;\r
    };\r
    const ink = rgb => {\r
      const linear = rgb.map(v => Math.pow(v, 2.2));\r
      const tone = 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];\r
      const depth = Math.min(1, 0.06 / Math.max(tone, 0.0001));\r
      return linear.map(v => Math.pow(v * depth, 1 / 2.2));\r
    };\r
\r
    const view = { width: 1, height: 1, ratio: 1 };\r
    const pointer = { x: 0, y: 0, sx: 0, sy: 0, nx: 0, ny: 0, inside: false, active: 0 };\r
    const state = {\r
      clock: 0,\r
      spin: 0,\r
      travel: 0,\r
      offsetX: 0,\r
      offsetY: 0,\r
      reveal: settingsRef.current.intro && !reduce ? 0 : 1\r
    };\r
    const bursts = [];\r
    const packedBursts = new Float32Array(MAX_BURSTS * 4);\r
    const cloud = {\r
      key: '',\r
      count: 0,\r
      positions: new Float32Array(0),\r
      randoms: new Float32Array(0),\r
      colors: new Float32Array(0)\r
    };\r
    const screen = {\r
      x: new Float32Array(0),\r
      y: new Float32Array(0),\r
      ahead: new Float32Array(0),\r
      alpha: new Float32Array(0)\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const rebuild = s => {\r
      const key = \`\${s.count}|\${s.variation}|\${s.colors.join(',')}|\${s.lightMode ? 1 : 0}\`;\r
      if (key === cloud.key) return;\r
      cloud.key = key;\r
      const next = seeded(s.variation * 7919 + 1);\r
      const total = s.count;\r
      const positions = new Float32Array(total * 3);\r
      const randoms = new Float32Array(total * 4);\r
      const tints = new Float32Array(total * 3);\r
      const swatches = s.colors.map(value => (s.lightMode ? ink(parse(value)) : parse(value)));\r
      for (let i = 0; i < total; i++) {\r
        let x;\r
        let y;\r
        let z;\r
        let len;\r
        do {\r
          x = next() * 2 - 1;\r
          y = next() * 2 - 1;\r
          z = next() * 2 - 1;\r
          len = x * x + y * y + z * z;\r
        } while (len > 1 || len === 0);\r
        const r = Math.cbrt(next());\r
        positions.set([x * r, y * r, z * r], i * 3);\r
        randoms.set([next(), next(), next(), next()], i * 4);\r
        tints.set(swatches[Math.floor(next() * swatches.length)], i * 3);\r
      }\r
      cloud.count = total;\r
      cloud.positions = positions;\r
      cloud.randoms = randoms;\r
      cloud.colors = tints;\r
      const linked = Math.min(total, MAX_LINKED);\r
      screen.x = new Float32Array(linked);\r
      screen.y = new Float32Array(linked);\r
      screen.ahead = new Float32Array(linked);\r
      screen.alpha = new Float32Array(linked);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, randomBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, randoms, gl.STATIC_DRAW);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, tints, gl.STATIC_DRAW);\r
    };\r
\r
    const rotationOf = s => {\r
      const elapsed = state.clock * 1000;\r
      const x = s.rotate ? Math.sin(elapsed * 0.0002) * 0.1 : 0;\r
      const y = s.rotate ? Math.cos(elapsed * 0.0005) * 0.15 : 0;\r
      const z = s.rotate ? state.spin : 0;\r
      const [sx, cx, sy, cy, sz, cz] = [Math.sin(x), Math.cos(x), Math.sin(y), Math.cos(y), Math.sin(z), Math.cos(z)];\r
      return [\r
        cy * cz + sy * sx * sz,\r
        cx * sz,\r
        -sy * cz + cy * sx * sz,\r
        -cy * sz + sy * sx * cz,\r
        cx * cz,\r
        sy * sz + cy * sx * cz,\r
        sy * cx,\r
        -sx,\r
        cy * cx\r
      ];\r
    };\r
\r
    const offsetOf = () => [state.offsetX, state.offsetY, -(1 - easeOut(state.reveal)) * 70];\r
\r
    const project = (s, matrix) => {\r
      const total = Math.min(cloud.count, MAX_LINKED);\r
      const [ox, oy, oz] = offsetOf();\r
      const aspect = view.width / view.height;\r
      const time = state.clock;\r
      const radius = s.hoverRadius;\r
      const active = s.hoverEffect !== 0 ? pointer.active : 0;\r
      const spanY = s.spread * 2 + 3;\r
      const spanZ = s.spread * DEPTH * 2 + 3;\r
      for (let i = 0; i < total; i++) {\r
        const px = cloud.positions[i * 3] * s.spread;\r
        const py = cloud.positions[i * 3 + 1] * s.spread;\r
        const pz = cloud.positions[i * 3 + 2] * s.spread * DEPTH;\r
        const r0 = cloud.randoms[i * 4];\r
        const r1 = cloud.randoms[i * 4 + 1];\r
        const r2 = cloud.randoms[i * 4 + 2];\r
        const r3 = cloud.randoms[i * 4 + 3];\r
        const bobX = Math.sin(time * r2 + 6.28 * r3) * (0.1 + 1.4 * r0);\r
        const bobY = Math.sin(time * r1 + 6.28 * r0) * (0.1 + 1.4 * r3);\r
        const bobZ = Math.sin(time * r3 + 6.28 * r1) * (0.1 + 1.4 * r2);\r
        const wx = matrix[0] * px + matrix[3] * py + matrix[6] * pz + ox + bobX;\r
        let wy = matrix[1] * px + matrix[4] * py + matrix[7] * pz + oy + bobY;\r
        let wz = matrix[2] * px + matrix[5] * py + matrix[8] * pz + oz + bobZ;\r
        let edge = 1;\r
        if (s.drift === 1 || s.drift === 2) {\r
          const k = wrap(r3 * spanY + oy + bobY + (s.drift === 1 ? state.travel : -state.travel), spanY);\r
          wy = k - spanY / 2;\r
          const low = clamp(k / (spanY * 0.12), 0, 1);\r
          const high = clamp((spanY - k) / (spanY * 0.12), 0, 1);\r
          edge = low * low * (3 - 2 * low) * high * high * (3 - 2 * high);\r
        } else if (s.drift === 3) {\r
          const k = wrap(r1 * spanZ + oz + bobZ + state.travel, spanZ);\r
          wz = k - spanZ / 2;\r
          const fresh = clamp(k / (spanZ * 0.1), 0, 1);\r
          edge = fresh * fresh * (3 - 2 * fresh);\r
        }\r
        const ahead = s.camera - wz;\r
        if (ahead < NEAR || ahead > FAR) {\r
          screen.alpha[i] = 0;\r
          continue;\r
        }\r
        const close = clamp((ahead - 1) / 3, 0, 1);\r
        edge *= close * close * (3 - 2 * close);\r
        let sx = ((wx * FOCAL) / aspect / ahead) * 0.5 * view.width + view.width / 2;\r
        let sy = ((wy * FOCAL) / ahead) * 0.5 * view.height + view.height / 2;\r
        let dx = 0;\r
        let dy = 0;\r
        if (active > 0.001) {\r
          const ex = sx - pointer.sx;\r
          const ey = sy - pointer.sy;\r
          const reach = Math.hypot(ex, ey);\r
          const falloff = Math.exp(-(ex * ex + ey * ey) / (radius * radius)) * s.hoverFactor * active;\r
          if (s.hoverEffect === 1 && reach > 0.001) {\r
            dx += (ex / reach) * radius * 0.5 * falloff;\r
            dy += (ey / reach) * radius * 0.5 * falloff;\r
          } else if (s.hoverEffect === 2) {\r
            dx -= ex * 0.6 * falloff;\r
            dy -= ey * 0.6 * falloff;\r
          }\r
        }\r
        for (const burst of bursts) {\r
          const progress = burst.age / BURST_SECONDS;\r
          const ex = sx - burst.x;\r
          const ey = sy - burst.y;\r
          const reach = Math.hypot(ex, ey);\r
          if (reach < 0.001) continue;\r
          const wave = Math.exp(-Math.pow((reach - progress * BURST_SPEED) / BURST_WIDTH, 2));\r
          const ramp = clamp(reach / 30, 0, 1);\r
          const push = wave * (1 - progress) * (1 - progress) * 56 * ramp * ramp * (3 - 2 * ramp);\r
          dx += (ex / reach) * push;\r
          dy += (ey / reach) * push;\r
        }\r
        sx += dx;\r
        sy += dy;\r
        const far = clamp((FAR - ahead) / (FAR - FAR * 0.9), 0, 1);\r
        const reveal = clamp(state.reveal * 1.6 - r2 * 0.6, 0, 1);\r
        screen.x[i] = sx;\r
        screen.y[i] = sy;\r
        screen.ahead[i] = ahead;\r
        screen.alpha[i] = far * far * (3 - 2 * far) * edge * reveal * reveal;\r
      }\r
      return total;\r
    };\r
\r
    const buildLines = (s, matrix) => {\r
      const total = project(s, matrix);\r
      const reach = s.connectionDistance;\r
      const columns = Math.max(1, Math.ceil(view.width / reach) + 2);\r
      const buckets = new Map();\r
      for (let i = 0; i < total; i++) {\r
        if (screen.alpha[i] < 0.02) continue;\r
        const key = (Math.floor(screen.y[i] / reach) + 1) * columns + Math.floor(screen.x[i] / reach) + 1;\r
        const bucket = buckets.get(key);\r
        if (bucket) bucket.push(i);\r
        else buckets.set(key, [i]);\r
      }\r
      let lineCount = 0;\r
      const limit = reach * reach;\r
      for (const [key, members] of buckets) {\r
        for (const offset of [0, 1, columns - 1, columns, columns + 1]) {\r
          const others = offset === 0 ? members : buckets.get(key + offset);\r
          if (!others) continue;\r
          for (let a = 0; a < members.length; a++) {\r
            const i = members[a];\r
            for (let b = offset === 0 ? a + 1 : 0; b < others.length; b++) {\r
              const j = others[b];\r
              const dx = screen.x[i] - screen.x[j];\r
              const dy = screen.y[i] - screen.y[j];\r
              const gap = dx * dx + dy * dy;\r
              if (gap > limit) continue;\r
              const layer = clamp(1 - Math.abs(screen.ahead[i] - screen.ahead[j]) / 18, 0, 1);\r
              if (layer <= 0) continue;\r
              if (lineCount >= MAX_LINES) return lineCount;\r
              const fade = 1 - Math.sqrt(gap) / reach;\r
              const base = lineCount * 8;\r
              lineData[base] = screen.x[i];\r
              lineData[base + 1] = screen.y[i];\r
              lineData[base + 2] = screen.x[j];\r
              lineData[base + 3] = screen.y[j];\r
              lineData[base + 4] = (cloud.colors[i * 3] + cloud.colors[j * 3]) / 2;\r
              lineData[base + 5] = (cloud.colors[i * 3 + 1] + cloud.colors[j * 3 + 1]) / 2;\r
              lineData[base + 6] = (cloud.colors[i * 3 + 2] + cloud.colors[j * 3 + 2]) / 2;\r
              lineData[base + 7] = fade * fade * layer * 0.7 * Math.min(screen.alpha[i], screen.alpha[j]);\r
              lineCount++;\r
            }\r
          }\r
        }\r
      }\r
      return lineCount;\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      rebuild(s);\r
      const matrix = rotationOf(s);\r
      const [ox, oy, oz] = offsetOf();\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
\r
      if (s.connections) {\r
        const lineCount = buildLines(s, matrix);\r
        if (lineCount) {\r
          gl.useProgram(lines.program);\r
          gl.bindVertexArray(lineVao);\r
          gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);\r
          gl.bufferSubData(gl.ARRAY_BUFFER, 0, lineData.subarray(0, lineCount * 8));\r
          gl.uniform2f(lines.uniforms.uView, view.width, view.height);\r
          gl.uniform1f(lines.uniforms.uRatio, view.ratio);\r
          gl.uniform1f(lines.uniforms.uWidth, 1);\r
          gl.uniform1f(lines.uniforms.uOpacity, s.opacity);\r
          gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, lineCount);\r
        }\r
      }\r
\r
      const u = dots.uniforms;\r
      let burstCount = 0;\r
      for (let i = bursts.length - 1; i >= 0 && burstCount < MAX_BURSTS; i--) {\r
        packedBursts.set([bursts[i].x, bursts[i].y, bursts[i].age / BURST_SECONDS, 1], burstCount * 4);\r
        burstCount++;\r
      }\r
      gl.useProgram(dots.program);\r
      gl.bindVertexArray(dotVao);\r
      gl.uniformMatrix3fv(u.uRotation, false, matrix);\r
      gl.uniform3f(u.uOffset, ox, oy, oz);\r
      gl.uniform1f(u.uSpread, s.spread);\r
      gl.uniform1f(u.uTime, state.clock);\r
      gl.uniform1f(u.uCamera, s.camera);\r
      gl.uniform1f(u.uAspect, view.width / view.height);\r
      gl.uniform2f(u.uView, view.width, view.height);\r
      gl.uniform1f(u.uRatio, view.ratio);\r
      gl.uniform1f(u.uSize, s.size);\r
      gl.uniform1f(u.uRandomness, s.randomness);\r
      gl.uniform1f(u.uBlur, s.depthOfField * 14);\r
      gl.uniform1f(u.uFocus, s.camera + 14);\r
      gl.uniform1f(u.uGlow, s.lightMode ? s.glow * 0.3 : s.glow);\r
      gl.uniform1f(u.uTwinkle, s.twinkle);\r
      gl.uniform1i(u.uShape, s.shape);\r
      gl.uniform1i(u.uDrift, s.drift);\r
      gl.uniform1f(u.uTravel, state.travel);\r
      gl.uniform4f(u.uPointer, pointer.sx, pointer.sy, pointer.active, s.hoverRadius);\r
      gl.uniform1i(u.uEffect, s.hoverEffect);\r
      gl.uniform1f(u.uStrength, s.hoverFactor);\r
      gl.uniform4fv(u.uBursts, packedBursts);\r
      gl.uniform1i(u.uBurstCount, burstCount);\r
      gl.uniform1f(u.uReveal, state.reveal);\r
      gl.uniform1f(u.uSoft, s.soft ? 0.2 : 0);\r
      gl.uniform1f(u.uShimmer, s.lightMode ? 0 : 1);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, cloud.count);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.0005, 0.05) : 1 / 60;\r
      last = now;\r
      if (s.paused) {\r
        state.reveal = 1;\r
        render();\r
        last = 0;\r
        return;\r
      }\r
      const motion = reduce ? 0 : 1;\r
      const pace = dt * s.speed * motion;\r
      state.clock += pace;\r
      if (s.rotate) state.spin += pace * 0.6;\r
      state.travel += dt * s.driftSpeed * motion * (s.drift === 3 ? 6 : 0.9);\r
\r
      const engaged = s.mouse && pointer.inside && !reduce;\r
      const follow = 1 - Math.exp(-dt / 0.35);\r
      const parallax = engaged && s.hoverEffect === 0 ? s.hoverFactor : 0;\r
      state.offsetX += (-pointer.nx * parallax - state.offsetX) * follow;\r
      state.offsetY += (-pointer.ny * parallax - state.offsetY) * follow;\r
      pointer.sx += (pointer.x - pointer.sx) * (1 - Math.exp(-dt / 0.06));\r
      pointer.sy += (pointer.y - pointer.sy) * (1 - Math.exp(-dt / 0.06));\r
      pointer.active += ((engaged ? 1 : 0) - pointer.active) * (1 - Math.exp(-dt / 0.2));\r
\r
      for (let i = bursts.length - 1; i >= 0; i--) {\r
        bursts[i].age += dt;\r
        if (bursts[i].age >= BURST_SECONDS) bursts.splice(i, 1);\r
      }\r
\r
      if (!s.intro || reduce) state.reveal = 1;\r
      else if (state.reveal < 1) state.reveal = Math.min(1, state.reveal + dt / INTRO_SECONDS);\r
\r
      render();\r
      raf = requestAnimationFrame(frame);\r
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
      view.ratio = canvas.width / width;\r
      render();\r
      wake();\r
    };\r
\r
    const locate = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      const wasInside = pointer.inside;\r
      pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      pointer.x = x;\r
      pointer.y = rect.height - y;\r
      pointer.nx = (x / Math.max(1, rect.width)) * 2 - 1;\r
      pointer.ny = -((y / Math.max(1, rect.height)) * 2 - 1);\r
      if (pointer.inside && !wasInside) {\r
        pointer.sx = pointer.x;\r
        pointer.sy = pointer.y;\r
      }\r
    };\r
\r
    const onPointerMove = event => {\r
      locate(event);\r
      if (!settingsRef.current.paused) wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      locate(event);\r
      if (!pointer.inside || !s.clickBurst || s.paused || reduce) return;\r
      bursts.push({ x: pointer.x, y: pointer.y, age: 0 });\r
      if (bursts.length > MAX_BURSTS) bursts.shift();\r
      wake();\r
    };\r
\r
    const onPointerUp = event => {\r
      if (event.pointerType !== 'mouse') pointer.inside = false;\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
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
    window.addEventListener('pointerup', onPointerUp, { passive: true });\r
    window.addEventListener('pointercancel', onPointerUp, { passive: true });\r
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
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('pointerup', onPointerUp);\r
      window.removeEventListener('pointercancel', onPointerUp);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteProgram(dots.program);\r
      gl.deleteProgram(lines.program);\r
      [corners, positionBuffer, randomBuffer, colorBuffer, lineBuffer].forEach(buffer => gl.deleteBuffer(buffer));\r
      gl.deleteVertexArray(dotVao);\r
      gl.deleteVertexArray(lineVao);\r
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
      style={style}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Particles;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties } from 'react';\r
import './Particles.css';\r
\r
export type ParticlesShape = 'circle' | 'square' | 'ring' | 'sparkle';\r
export type ParticlesHoverEffect = 'parallax' | 'repel' | 'attract';\r
export type ParticlesDrift = 'none' | 'up' | 'down' | 'forward';\r
\r
export interface ParticlesProps {\r
  particleCount?: number;\r
  particleSpread?: number;\r
  speed?: number;\r
  particleColors?: string[];\r
  moveParticlesOnHover?: boolean;\r
  particleHoverFactor?: number;\r
  alphaParticles?: boolean;\r
  particleBaseSize?: number;\r
  sizeRandomness?: number;\r
  cameraDistance?: number;\r
  disableRotation?: boolean;\r
  pixelRatio?: number;\r
  shape?: ParticlesShape;\r
  glow?: number;\r
  twinkle?: number;\r
  depthOfField?: number;\r
  connections?: boolean;\r
  connectionDistance?: number;\r
  hoverEffect?: ParticlesHoverEffect;\r
  hoverRadius?: number;\r
  clickBurst?: boolean;\r
  drift?: ParticlesDrift;\r
  driftSpeed?: number;\r
  variation?: number;\r
  intro?: boolean;\r
  opacity?: number;\r
  lightMode?: boolean;\r
  paused?: boolean;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
type Settings = {\r
  count: number;\r
  spread: number;\r
  speed: number;\r
  colors: string[];\r
  mouse: boolean;\r
  hoverFactor: number;\r
  soft: boolean;\r
  size: number;\r
  randomness: number;\r
  camera: number;\r
  rotate: boolean;\r
  dpr?: number;\r
  shape: number;\r
  glow: number;\r
  twinkle: number;\r
  depthOfField: number;\r
  connections: boolean;\r
  connectionDistance: number;\r
  hoverEffect: number;\r
  hoverRadius: number;\r
  clickBurst: boolean;\r
  drift: number;\r
  driftSpeed: number;\r
  variation: number;\r
  intro: boolean;\r
  opacity: number;\r
  lightMode: boolean;\r
  paused: boolean;\r
};\r
\r
type Burst = { x: number; y: number; age: number };\r
\r
type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };\r
\r
const SHAPES: Record<string, number> = { circle: 0, square: 1, ring: 2, sparkle: 3 };\r
const EFFECTS: Record<string, number> = { parallax: 0, repel: 1, attract: 2 };\r
const DRIFTS: Record<string, number> = { none: 0, up: 1, down: 2, forward: 3 };\r
const MAX_COUNT = 20000;\r
const MAX_LINKED = 900;\r
const MAX_LINES = 9000;\r
const MAX_BURSTS = 4;\r
const DEPTH = 10;\r
const FOCAL = 1 / Math.tan((7.5 * Math.PI) / 180);\r
const NEAR = 0.1;\r
const FAR = 100;\r
const INTRO_SECONDS = 1.8;\r
const BURST_SECONDS = 1.5;\r
const BURST_SPEED = 520;\r
const BURST_WIDTH = 46;\r
\r
const PARTICLE_VERTEX = \`#version 300 es\r
precision highp float;\r
layout(location = 0) in vec2 aCorner;\r
layout(location = 1) in vec3 aPosition;\r
layout(location = 2) in vec4 aRandom;\r
layout(location = 3) in vec3 aColor;\r
uniform mat3 uRotation;\r
uniform vec3 uOffset;\r
uniform float uSpread;\r
uniform float uTime;\r
uniform float uCamera;\r
uniform float uAspect;\r
uniform vec2 uView;\r
uniform float uRatio;\r
uniform float uSize;\r
uniform float uRandomness;\r
uniform float uBlur;\r
uniform float uFocus;\r
uniform float uGlow;\r
uniform float uTwinkle;\r
uniform int uShape;\r
uniform int uDrift;\r
uniform float uTravel;\r
uniform vec4 uPointer;\r
uniform int uEffect;\r
uniform float uStrength;\r
uniform vec4 uBursts[\${MAX_BURSTS}];\r
uniform int uBurstCount;\r
uniform float uReveal;\r
out vec2 vLocal;\r
out float vRadius;\r
out float vBlur;\r
out float vAlpha;\r
out float vHalo;\r
out float vSeed;\r
out vec3 vColor;\r
\r
vec3 bob(vec4 r, float t) {\r
  return vec3(\r
    sin(t * r.z + 6.28 * r.w) * mix(0.1, 1.5, r.x),\r
    sin(t * r.y + 6.28 * r.x) * mix(0.1, 1.5, r.w),\r
    sin(t * r.w + 6.28 * r.y) * mix(0.1, 1.5, r.z)\r
  );\r
}\r
\r
void main() {\r
  vec3 pos = aPosition * uSpread;\r
  pos.z *= \${DEPTH.toFixed(1)};\r
  vec3 wobble = bob(aRandom, uTime);\r
  vec3 world = uRotation * pos + uOffset + wobble;\r
  float edge = 1.0;\r
  if (uDrift == 1 || uDrift == 2) {\r
    float span = uSpread * 2.0 + 3.0;\r
    float k = mod(aRandom.w * span + uOffset.y + wobble.y + (uDrift == 1 ? uTravel : -uTravel), span);\r
    world.y = k - span * 0.5;\r
    edge = smoothstep(0.0, span * 0.12, k) * smoothstep(span, span * 0.88, k);\r
  } else if (uDrift == 3) {\r
    float span = uSpread * \${DEPTH.toFixed(1)} * 2.0 + 3.0;\r
    float k = mod(aRandom.y * span + uOffset.z + wobble.z + uTravel, span);\r
    world.z = k - span * 0.5;\r
    edge = smoothstep(0.0, span * 0.1, k);\r
  }\r
  vec3 view = world - vec3(0.0, 0.0, uCamera);\r
  float dist = length(view);\r
  float ahead = -view.z;\r
  if (ahead < \${NEAR.toFixed(2)} || ahead > \${FAR.toFixed(1)}) {\r
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);\r
    return;\r
  }\r
  edge *= smoothstep(1.0, 4.0, ahead);\r
  vec2 ndc = vec2(view.x * \${FOCAL.toFixed(6)} / uAspect, view.y * \${FOCAL.toFixed(6)}) / ahead;\r
  vec2 screen = (ndc * 0.5 + 0.5) * uView;\r
\r
  vec2 shift = vec2(0.0);\r
  float flash = 0.0;\r
  if (uEffect != 0 && uPointer.z > 0.001) {\r
    vec2 delta = screen - uPointer.xy;\r
    float reach = length(delta);\r
    float falloff = exp(-dot(delta, delta) / (uPointer.w * uPointer.w));\r
    vec2 away = reach > 0.001 ? delta / reach : vec2(0.0);\r
    shift += (uEffect == 1 ? away * uPointer.w * 0.5 : -delta * 0.6) * falloff * uStrength * uPointer.z;\r
  }\r
  for (int i = 0; i < \${MAX_BURSTS}; i++) {\r
    if (i >= uBurstCount) break;\r
    vec4 burst = uBursts[i];\r
    vec2 delta = screen - burst.xy;\r
    float reach = length(delta);\r
    float wave = exp(-pow((reach - burst.z * \${BURST_SPEED.toFixed(1)}) / \${BURST_WIDTH.toFixed(1)}, 2.0));\r
    vec2 away = reach > 0.001 ? delta / reach : vec2(0.0);\r
    float fade = (1.0 - burst.z) * (1.0 - burst.z) * burst.w;\r
    shift += away * wave * fade * 56.0 * smoothstep(0.0, 30.0, reach);\r
    flash += wave * fade;\r
  }\r
  screen += shift;\r
\r
  float diameter = (uRandomness <= 0.0 ? uSize : uSize * (1.0 + uRandomness * (aRandom.x - 0.5)) / dist) * (1.0 + min(flash, 1.0) * 0.6);\r
  float device = diameter * uRatio;\r
  float radius = max(diameter, 1.0 / uRatio) * 0.5;\r
  float coverage = min(1.0, device * device);\r
  float blur = uBlur * max(uFocus - dist, 0.0) / max(dist, 1.0);\r
  float halo = uGlow > 0.0 ? radius * 2.5 + 2.0 : 0.0;\r
  float extent = radius * (uShape == 3 ? 1.6 : 1.0) + blur + halo + 1.5;\r
\r
  float twinkle = 1.0 - uTwinkle * 0.6 * (0.5 + 0.5 * sin(uTime * (6.0 + aRandom.y * 14.0) + aRandom.w * 40.0));\r
  float far = smoothstep(\${FAR.toFixed(1)}, \${(FAR * 0.9).toFixed(1)}, ahead);\r
  float focus = radius / (radius + blur);\r
  float reveal = clamp(uReveal * 1.6 - aRandom.z * 0.6, 0.0, 1.0);\r
\r
  vLocal = aCorner * extent;\r
  vRadius = radius;\r
  vBlur = blur;\r
  vHalo = halo;\r
  vSeed = aRandom.y;\r
  vAlpha = min(1.0, coverage * twinkle * (1.0 + flash * 1.4)) * far * edge * max(focus, 0.35) * reveal * reveal;\r
  vColor = aColor;\r
  gl_Position = vec4((screen + aCorner * extent) / uView * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const PARTICLE_FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform int uShape;\r
uniform float uGlow;\r
uniform float uRatio;\r
uniform float uTime;\r
uniform float uSoft;\r
uniform float uShimmer;\r
uniform float uOpacity;\r
in vec2 vLocal;\r
in float vRadius;\r
in float vBlur;\r
in float vAlpha;\r
in float vHalo;\r
in float vSeed;\r
in vec3 vColor;\r
out vec4 outColor;\r
\r
float ray(vec2 q, float aa) {\r
  float width = 0.14 * max(0.0, 1.0 - q.x);\r
  return (1.0 - smoothstep(width - aa, width + aa, q.y)) * step(q.x, 1.0);\r
}\r
\r
void main() {\r
  float soft = vBlur + 0.7 / uRatio + vRadius * uSoft;\r
  float d = length(vLocal);\r
  float shape;\r
  if (uShape == 1) {\r
    float box = max(abs(vLocal.x), abs(vLocal.y));\r
    shape = 1.0 - smoothstep(vRadius * 0.86 - soft, vRadius * 0.86 + soft, box);\r
  } else if (uShape == 2) {\r
    float edge = max(vRadius * 0.22, 0.6 / uRatio);\r
    shape = 1.0 - smoothstep(edge - soft, edge + soft, abs(d - vRadius * 0.8));\r
  } else if (uShape == 3) {\r
    float reach = vRadius * 1.6;\r
    vec2 q = abs(vLocal) / max(reach, 0.0001);\r
    float aa = soft / max(reach, 0.0001);\r
    shape = max(max(ray(q, aa), ray(q.yx, aa)), 1.0 - smoothstep(vRadius * 0.32 - soft, vRadius * 0.32 + soft, d));\r
  } else {\r
    shape = 1.0 - smoothstep(vRadius - soft, vRadius + soft, d);\r
  }\r
  float halo = vHalo > 0.0 ? exp(-d / (vHalo * 0.35)) * uGlow * 0.4 : 0.0;\r
  float alpha = clamp(shape + halo * (1.0 - shape), 0.0, 1.0) * vAlpha * uOpacity * (1.0 - uSoft);\r
  if (alpha < 0.002) discard;\r
  vec2 uv = vLocal / max(vRadius * 2.0, 0.0001) + 0.5;\r
  vec3 color = clamp(vColor + uShimmer * 0.2 * sin(uv.yxx + uTime + vSeed * 6.28), 0.0, 1.0);\r
  outColor = vec4(color * alpha, alpha);\r
}\`;\r
\r
const LINE_VERTEX = \`#version 300 es\r
precision highp float;\r
layout(location = 0) in vec2 aCorner;\r
layout(location = 1) in vec4 aEnds;\r
layout(location = 2) in vec4 aTint;\r
uniform vec2 uView;\r
uniform float uRatio;\r
uniform float uWidth;\r
out float vAcross;\r
out float vHalf;\r
out vec4 vTint;\r
\r
void main() {\r
  vec2 a = aEnds.xy;\r
  vec2 b = aEnds.zw;\r
  vec2 along = b - a;\r
  float span = max(length(along), 0.0001);\r
  vec2 normal = vec2(-along.y, along.x) / span;\r
  float reach = uWidth * 0.5 + 1.0 / uRatio;\r
  vec2 point = mix(a, b, aCorner.x * 0.5 + 0.5) + normal * aCorner.y * reach;\r
  vAcross = aCorner.y * reach;\r
  vHalf = uWidth * 0.5;\r
  vTint = aTint;\r
  gl_Position = vec4(point / uView * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const LINE_FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform float uRatio;\r
uniform float uOpacity;\r
in float vAcross;\r
in float vHalf;\r
in vec4 vTint;\r
out vec4 outColor;\r
\r
void main() {\r
  float edge = 0.6 / uRatio;\r
  float cover = 1.0 - smoothstep(vHalf - edge, vHalf + edge, abs(vAcross));\r
  float alpha = cover * vTint.a * uOpacity;\r
  outColor = vec4(vTint.rgb * alpha, alpha);\r
}\`;\r
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
const link = (gl: WebGL2RenderingContext, vertexSource: string, fragmentSource: string): Program | null => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);\r
  const program = gl.createProgram();\r
  if (!vertex || !fragment || !program) return null;\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
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
    if (info) uniforms[info.name.replace('[0]', '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const seeded = (seed: number) => {\r
  let state = seed >>> 0;\r
  return () => {\r
    state = (state + 0x6d2b79f5) >>> 0;\r
    let t = state;\r
    t = Math.imul(t ^ (t >>> 15), t | 1);\r
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\r
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\r
  };\r
};\r
\r
const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);\r
\r
const wrap = (value: number, span: number) => ((value % span) + span) % span;\r
\r
const Particles = ({\r
  particleCount = 200,\r
  particleSpread = 10,\r
  speed = 0.1,\r
  particleColors = ['#ffffff'],\r
  moveParticlesOnHover = true,\r
  particleHoverFactor = 1,\r
  alphaParticles = false,\r
  particleBaseSize = 100,\r
  sizeRandomness = 1,\r
  cameraDistance = 20,\r
  disableRotation = false,\r
  pixelRatio,\r
  shape = 'circle',\r
  glow = 0.5,\r
  twinkle = 0.3,\r
  depthOfField = 0,\r
  connections = false,\r
  connectionDistance = 110,\r
  hoverEffect = 'parallax',\r
  hoverRadius = 140,\r
  clickBurst = true,\r
  drift = 'none',\r
  driftSpeed = 1,\r
  variation = 0,\r
  intro = true,\r
  opacity = 1,\r
  lightMode = false,\r
  paused = false,\r
  className = '',\r
  style\r
}: ParticlesProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const palette = (Array.isArray(particleColors) ? particleColors : [particleColors as unknown as string])\r
    .filter(Boolean)\r
    .map(String);\r
  const settings: Settings = {\r
    count: clamp(Math.round(particleCount), 1, MAX_COUNT),\r
    spread: Math.max(0.1, particleSpread),\r
    speed,\r
    colors: palette.length ? palette : ['#ffffff'],\r
    mouse: moveParticlesOnHover,\r
    hoverFactor: Math.max(0, particleHoverFactor),\r
    soft: alphaParticles,\r
    size: Math.max(0, particleBaseSize),\r
    randomness: Math.max(0, sizeRandomness),\r
    camera: Math.max(1, cameraDistance),\r
    rotate: !disableRotation,\r
    dpr: pixelRatio,\r
    shape: SHAPES[shape] ?? 0,\r
    glow: Math.max(0, glow),\r
    twinkle: clamp(twinkle, 0, 1),\r
    depthOfField: Math.max(0, depthOfField),\r
    connections,\r
    connectionDistance: Math.max(10, connectionDistance),\r
    hoverEffect: EFFECTS[hoverEffect] ?? 0,\r
    hoverRadius: Math.max(20, hoverRadius),\r
    clickBurst,\r
    drift: DRIFTS[drift] ?? 0,\r
    driftSpeed,\r
    variation: Math.max(0, Math.round(variation)),\r
    intro,\r
    opacity: clamp(opacity, 0, 1),\r
    lightMode,\r
    paused\r
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
    const dots = link(gl, PARTICLE_VERTEX, PARTICLE_FRAGMENT);\r
    const lines = link(gl, LINE_VERTEX, LINE_FRAGMENT);\r
    if (!dots || !lines) return undefined;\r
\r
    const corners = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, corners);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
\r
    const positionBuffer = gl.createBuffer();\r
    const randomBuffer = gl.createBuffer();\r
    const colorBuffer = gl.createBuffer();\r
    const dotVao = gl.createVertexArray();\r
    gl.bindVertexArray(dotVao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, corners);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    const attach = (buffer: WebGLBuffer | null, location: number, width: number) => {\r
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
      gl.enableVertexAttribArray(location);\r
      gl.vertexAttribPointer(location, width, gl.FLOAT, false, 0, 0);\r
      gl.vertexAttribDivisor(location, 1);\r
    };\r
    attach(positionBuffer, 1, 3);\r
    attach(randomBuffer, 2, 4);\r
    attach(colorBuffer, 3, 3);\r
\r
    const lineBuffer = gl.createBuffer();\r
    const lineData = new Float32Array(MAX_LINES * 8);\r
    const lineVao = gl.createVertexArray();\r
    gl.bindVertexArray(lineVao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, corners);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, lineData.byteLength, gl.DYNAMIC_DRAW);\r
    gl.enableVertexAttribArray(1);\r
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 32, 0);\r
    gl.vertexAttribDivisor(1, 1);\r
    gl.enableVertexAttribArray(2);\r
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 32, 16);\r
    gl.vertexAttribDivisor(2, 1);\r
    gl.bindVertexArray(null);\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const cache = new Map<string, number[]>();\r
    const parse = (value: string): number[] => {\r
      const cached = cache.get(value);\r
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
      cache.set(value, rgb);\r
      return rgb;\r
    };\r
    const ink = (rgb: number[]): number[] => {\r
      const linear = rgb.map(v => Math.pow(v, 2.2));\r
      const tone = 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];\r
      const depth = Math.min(1, 0.06 / Math.max(tone, 0.0001));\r
      return linear.map(v => Math.pow(v * depth, 1 / 2.2));\r
    };\r
\r
    const view = { width: 1, height: 1, ratio: 1 };\r
    const pointer = { x: 0, y: 0, sx: 0, sy: 0, nx: 0, ny: 0, inside: false, active: 0 };\r
    const state = {\r
      clock: 0,\r
      spin: 0,\r
      travel: 0,\r
      offsetX: 0,\r
      offsetY: 0,\r
      reveal: settingsRef.current.intro && !reduce ? 0 : 1\r
    };\r
    const bursts: Burst[] = [];\r
    const packedBursts = new Float32Array(MAX_BURSTS * 4);\r
    const cloud = {\r
      key: '',\r
      count: 0,\r
      positions: new Float32Array(0),\r
      randoms: new Float32Array(0),\r
      colors: new Float32Array(0)\r
    };\r
    const screen = {\r
      x: new Float32Array(0),\r
      y: new Float32Array(0),\r
      ahead: new Float32Array(0),\r
      alpha: new Float32Array(0)\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const rebuild = (s: Settings) => {\r
      const key = \`\${s.count}|\${s.variation}|\${s.colors.join(',')}|\${s.lightMode ? 1 : 0}\`;\r
      if (key === cloud.key) return;\r
      cloud.key = key;\r
      const next = seeded(s.variation * 7919 + 1);\r
      const total = s.count;\r
      const positions = new Float32Array(total * 3);\r
      const randoms = new Float32Array(total * 4);\r
      const tints = new Float32Array(total * 3);\r
      const swatches = s.colors.map(value => (s.lightMode ? ink(parse(value)) : parse(value)));\r
      for (let i = 0; i < total; i++) {\r
        let x: number;\r
        let y: number;\r
        let z: number;\r
        let len: number;\r
        do {\r
          x = next() * 2 - 1;\r
          y = next() * 2 - 1;\r
          z = next() * 2 - 1;\r
          len = x * x + y * y + z * z;\r
        } while (len > 1 || len === 0);\r
        const r = Math.cbrt(next());\r
        positions.set([x * r, y * r, z * r], i * 3);\r
        randoms.set([next(), next(), next(), next()], i * 4);\r
        tints.set(swatches[Math.floor(next() * swatches.length)], i * 3);\r
      }\r
      cloud.count = total;\r
      cloud.positions = positions;\r
      cloud.randoms = randoms;\r
      cloud.colors = tints;\r
      const linked = Math.min(total, MAX_LINKED);\r
      screen.x = new Float32Array(linked);\r
      screen.y = new Float32Array(linked);\r
      screen.ahead = new Float32Array(linked);\r
      screen.alpha = new Float32Array(linked);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, randomBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, randoms, gl.STATIC_DRAW);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, tints, gl.STATIC_DRAW);\r
    };\r
\r
    const rotationOf = (s: Settings): number[] => {\r
      const elapsed = state.clock * 1000;\r
      const x = s.rotate ? Math.sin(elapsed * 0.0002) * 0.1 : 0;\r
      const y = s.rotate ? Math.cos(elapsed * 0.0005) * 0.15 : 0;\r
      const z = s.rotate ? state.spin : 0;\r
      const [sx, cx, sy, cy, sz, cz] = [Math.sin(x), Math.cos(x), Math.sin(y), Math.cos(y), Math.sin(z), Math.cos(z)];\r
      return [\r
        cy * cz + sy * sx * sz,\r
        cx * sz,\r
        -sy * cz + cy * sx * sz,\r
        -cy * sz + sy * sx * cz,\r
        cx * cz,\r
        sy * sz + cy * sx * cz,\r
        sy * cx,\r
        -sx,\r
        cy * cx\r
      ];\r
    };\r
\r
    const offsetOf = (): [number, number, number] => [state.offsetX, state.offsetY, -(1 - easeOut(state.reveal)) * 70];\r
\r
    const project = (s: Settings, matrix: number[]) => {\r
      const total = Math.min(cloud.count, MAX_LINKED);\r
      const [ox, oy, oz] = offsetOf();\r
      const aspect = view.width / view.height;\r
      const time = state.clock;\r
      const radius = s.hoverRadius;\r
      const active = s.hoverEffect !== 0 ? pointer.active : 0;\r
      const spanY = s.spread * 2 + 3;\r
      const spanZ = s.spread * DEPTH * 2 + 3;\r
      for (let i = 0; i < total; i++) {\r
        const px = cloud.positions[i * 3] * s.spread;\r
        const py = cloud.positions[i * 3 + 1] * s.spread;\r
        const pz = cloud.positions[i * 3 + 2] * s.spread * DEPTH;\r
        const r0 = cloud.randoms[i * 4];\r
        const r1 = cloud.randoms[i * 4 + 1];\r
        const r2 = cloud.randoms[i * 4 + 2];\r
        const r3 = cloud.randoms[i * 4 + 3];\r
        const bobX = Math.sin(time * r2 + 6.28 * r3) * (0.1 + 1.4 * r0);\r
        const bobY = Math.sin(time * r1 + 6.28 * r0) * (0.1 + 1.4 * r3);\r
        const bobZ = Math.sin(time * r3 + 6.28 * r1) * (0.1 + 1.4 * r2);\r
        const wx = matrix[0] * px + matrix[3] * py + matrix[6] * pz + ox + bobX;\r
        let wy = matrix[1] * px + matrix[4] * py + matrix[7] * pz + oy + bobY;\r
        let wz = matrix[2] * px + matrix[5] * py + matrix[8] * pz + oz + bobZ;\r
        let edge = 1;\r
        if (s.drift === 1 || s.drift === 2) {\r
          const k = wrap(r3 * spanY + oy + bobY + (s.drift === 1 ? state.travel : -state.travel), spanY);\r
          wy = k - spanY / 2;\r
          const low = clamp(k / (spanY * 0.12), 0, 1);\r
          const high = clamp((spanY - k) / (spanY * 0.12), 0, 1);\r
          edge = low * low * (3 - 2 * low) * high * high * (3 - 2 * high);\r
        } else if (s.drift === 3) {\r
          const k = wrap(r1 * spanZ + oz + bobZ + state.travel, spanZ);\r
          wz = k - spanZ / 2;\r
          const fresh = clamp(k / (spanZ * 0.1), 0, 1);\r
          edge = fresh * fresh * (3 - 2 * fresh);\r
        }\r
        const ahead = s.camera - wz;\r
        if (ahead < NEAR || ahead > FAR) {\r
          screen.alpha[i] = 0;\r
          continue;\r
        }\r
        const close = clamp((ahead - 1) / 3, 0, 1);\r
        edge *= close * close * (3 - 2 * close);\r
        let sx = ((wx * FOCAL) / aspect / ahead) * 0.5 * view.width + view.width / 2;\r
        let sy = ((wy * FOCAL) / ahead) * 0.5 * view.height + view.height / 2;\r
        let dx = 0;\r
        let dy = 0;\r
        if (active > 0.001) {\r
          const ex = sx - pointer.sx;\r
          const ey = sy - pointer.sy;\r
          const reach = Math.hypot(ex, ey);\r
          const falloff = Math.exp(-(ex * ex + ey * ey) / (radius * radius)) * s.hoverFactor * active;\r
          if (s.hoverEffect === 1 && reach > 0.001) {\r
            dx += (ex / reach) * radius * 0.5 * falloff;\r
            dy += (ey / reach) * radius * 0.5 * falloff;\r
          } else if (s.hoverEffect === 2) {\r
            dx -= ex * 0.6 * falloff;\r
            dy -= ey * 0.6 * falloff;\r
          }\r
        }\r
        for (const burst of bursts) {\r
          const progress = burst.age / BURST_SECONDS;\r
          const ex = sx - burst.x;\r
          const ey = sy - burst.y;\r
          const reach = Math.hypot(ex, ey);\r
          if (reach < 0.001) continue;\r
          const wave = Math.exp(-Math.pow((reach - progress * BURST_SPEED) / BURST_WIDTH, 2));\r
          const ramp = clamp(reach / 30, 0, 1);\r
          const push = wave * (1 - progress) * (1 - progress) * 56 * ramp * ramp * (3 - 2 * ramp);\r
          dx += (ex / reach) * push;\r
          dy += (ey / reach) * push;\r
        }\r
        sx += dx;\r
        sy += dy;\r
        const far = clamp((FAR - ahead) / (FAR - FAR * 0.9), 0, 1);\r
        const reveal = clamp(state.reveal * 1.6 - r2 * 0.6, 0, 1);\r
        screen.x[i] = sx;\r
        screen.y[i] = sy;\r
        screen.ahead[i] = ahead;\r
        screen.alpha[i] = far * far * (3 - 2 * far) * edge * reveal * reveal;\r
      }\r
      return total;\r
    };\r
\r
    const buildLines = (s: Settings, matrix: number[]) => {\r
      const total = project(s, matrix);\r
      const reach = s.connectionDistance;\r
      const columns = Math.max(1, Math.ceil(view.width / reach) + 2);\r
      const buckets = new Map<number, number[]>();\r
      for (let i = 0; i < total; i++) {\r
        if (screen.alpha[i] < 0.02) continue;\r
        const key = (Math.floor(screen.y[i] / reach) + 1) * columns + Math.floor(screen.x[i] / reach) + 1;\r
        const bucket = buckets.get(key);\r
        if (bucket) bucket.push(i);\r
        else buckets.set(key, [i]);\r
      }\r
      let lineCount = 0;\r
      const limit = reach * reach;\r
      for (const [key, members] of buckets) {\r
        for (const offset of [0, 1, columns - 1, columns, columns + 1]) {\r
          const others = offset === 0 ? members : buckets.get(key + offset);\r
          if (!others) continue;\r
          for (let a = 0; a < members.length; a++) {\r
            const i = members[a];\r
            for (let b = offset === 0 ? a + 1 : 0; b < others.length; b++) {\r
              const j = others[b];\r
              const dx = screen.x[i] - screen.x[j];\r
              const dy = screen.y[i] - screen.y[j];\r
              const gap = dx * dx + dy * dy;\r
              if (gap > limit) continue;\r
              const layer = clamp(1 - Math.abs(screen.ahead[i] - screen.ahead[j]) / 18, 0, 1);\r
              if (layer <= 0) continue;\r
              if (lineCount >= MAX_LINES) return lineCount;\r
              const fade = 1 - Math.sqrt(gap) / reach;\r
              const base = lineCount * 8;\r
              lineData[base] = screen.x[i];\r
              lineData[base + 1] = screen.y[i];\r
              lineData[base + 2] = screen.x[j];\r
              lineData[base + 3] = screen.y[j];\r
              lineData[base + 4] = (cloud.colors[i * 3] + cloud.colors[j * 3]) / 2;\r
              lineData[base + 5] = (cloud.colors[i * 3 + 1] + cloud.colors[j * 3 + 1]) / 2;\r
              lineData[base + 6] = (cloud.colors[i * 3 + 2] + cloud.colors[j * 3 + 2]) / 2;\r
              lineData[base + 7] = fade * fade * layer * 0.7 * Math.min(screen.alpha[i], screen.alpha[j]);\r
              lineCount++;\r
            }\r
          }\r
        }\r
      }\r
      return lineCount;\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      rebuild(s);\r
      const matrix = rotationOf(s);\r
      const [ox, oy, oz] = offsetOf();\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
\r
      if (s.connections) {\r
        const lineCount = buildLines(s, matrix);\r
        if (lineCount) {\r
          gl.useProgram(lines.program);\r
          gl.bindVertexArray(lineVao);\r
          gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);\r
          gl.bufferSubData(gl.ARRAY_BUFFER, 0, lineData.subarray(0, lineCount * 8));\r
          gl.uniform2f(lines.uniforms.uView, view.width, view.height);\r
          gl.uniform1f(lines.uniforms.uRatio, view.ratio);\r
          gl.uniform1f(lines.uniforms.uWidth, 1);\r
          gl.uniform1f(lines.uniforms.uOpacity, s.opacity);\r
          gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, lineCount);\r
        }\r
      }\r
\r
      const u = dots.uniforms;\r
      let burstCount = 0;\r
      for (let i = bursts.length - 1; i >= 0 && burstCount < MAX_BURSTS; i--) {\r
        packedBursts.set([bursts[i].x, bursts[i].y, bursts[i].age / BURST_SECONDS, 1], burstCount * 4);\r
        burstCount++;\r
      }\r
      gl.useProgram(dots.program);\r
      gl.bindVertexArray(dotVao);\r
      gl.uniformMatrix3fv(u.uRotation, false, matrix);\r
      gl.uniform3f(u.uOffset, ox, oy, oz);\r
      gl.uniform1f(u.uSpread, s.spread);\r
      gl.uniform1f(u.uTime, state.clock);\r
      gl.uniform1f(u.uCamera, s.camera);\r
      gl.uniform1f(u.uAspect, view.width / view.height);\r
      gl.uniform2f(u.uView, view.width, view.height);\r
      gl.uniform1f(u.uRatio, view.ratio);\r
      gl.uniform1f(u.uSize, s.size);\r
      gl.uniform1f(u.uRandomness, s.randomness);\r
      gl.uniform1f(u.uBlur, s.depthOfField * 14);\r
      gl.uniform1f(u.uFocus, s.camera + 14);\r
      gl.uniform1f(u.uGlow, s.lightMode ? s.glow * 0.3 : s.glow);\r
      gl.uniform1f(u.uTwinkle, s.twinkle);\r
      gl.uniform1i(u.uShape, s.shape);\r
      gl.uniform1i(u.uDrift, s.drift);\r
      gl.uniform1f(u.uTravel, state.travel);\r
      gl.uniform4f(u.uPointer, pointer.sx, pointer.sy, pointer.active, s.hoverRadius);\r
      gl.uniform1i(u.uEffect, s.hoverEffect);\r
      gl.uniform1f(u.uStrength, s.hoverFactor);\r
      gl.uniform4fv(u.uBursts, packedBursts);\r
      gl.uniform1i(u.uBurstCount, burstCount);\r
      gl.uniform1f(u.uReveal, state.reveal);\r
      gl.uniform1f(u.uSoft, s.soft ? 0.2 : 0);\r
      gl.uniform1f(u.uShimmer, s.lightMode ? 0 : 1);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, cloud.count);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.0005, 0.05) : 1 / 60;\r
      last = now;\r
      if (s.paused) {\r
        state.reveal = 1;\r
        render();\r
        last = 0;\r
        return;\r
      }\r
      const motion = reduce ? 0 : 1;\r
      const pace = dt * s.speed * motion;\r
      state.clock += pace;\r
      if (s.rotate) state.spin += pace * 0.6;\r
      state.travel += dt * s.driftSpeed * motion * (s.drift === 3 ? 6 : 0.9);\r
\r
      const engaged = s.mouse && pointer.inside && !reduce;\r
      const follow = 1 - Math.exp(-dt / 0.35);\r
      const parallax = engaged && s.hoverEffect === 0 ? s.hoverFactor : 0;\r
      state.offsetX += (-pointer.nx * parallax - state.offsetX) * follow;\r
      state.offsetY += (-pointer.ny * parallax - state.offsetY) * follow;\r
      pointer.sx += (pointer.x - pointer.sx) * (1 - Math.exp(-dt / 0.06));\r
      pointer.sy += (pointer.y - pointer.sy) * (1 - Math.exp(-dt / 0.06));\r
      pointer.active += ((engaged ? 1 : 0) - pointer.active) * (1 - Math.exp(-dt / 0.2));\r
\r
      for (let i = bursts.length - 1; i >= 0; i--) {\r
        bursts[i].age += dt;\r
        if (bursts[i].age >= BURST_SECONDS) bursts.splice(i, 1);\r
      }\r
\r
      if (!s.intro || reduce) state.reveal = 1;\r
      else if (state.reveal < 1) state.reveal = Math.min(1, state.reveal + dt / INTRO_SECONDS);\r
\r
      render();\r
      raf = requestAnimationFrame(frame);\r
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
      view.ratio = canvas.width / width;\r
      render();\r
      wake();\r
    };\r
\r
    const locate = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      const wasInside = pointer.inside;\r
      pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      pointer.x = x;\r
      pointer.y = rect.height - y;\r
      pointer.nx = (x / Math.max(1, rect.width)) * 2 - 1;\r
      pointer.ny = -((y / Math.max(1, rect.height)) * 2 - 1);\r
      if (pointer.inside && !wasInside) {\r
        pointer.sx = pointer.x;\r
        pointer.sy = pointer.y;\r
      }\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      locate(event);\r
      if (!settingsRef.current.paused) wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      locate(event);\r
      if (!pointer.inside || !s.clickBurst || s.paused || reduce) return;\r
      bursts.push({ x: pointer.x, y: pointer.y, age: 0 });\r
      if (bursts.length > MAX_BURSTS) bursts.shift();\r
      wake();\r
    };\r
\r
    const onPointerUp = (event: PointerEvent) => {\r
      if (event.pointerType !== 'mouse') pointer.inside = false;\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
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
    window.addEventListener('pointerup', onPointerUp, { passive: true });\r
    window.addEventListener('pointercancel', onPointerUp, { passive: true });\r
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
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('pointerup', onPointerUp);\r
      window.removeEventListener('pointercancel', onPointerUp);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteProgram(dots.program);\r
      gl.deleteProgram(lines.program);\r
      [corners, positionBuffer, randomBuffer, colorBuffer, lineBuffer].forEach(buffer => gl.deleteBuffer(buffer));\r
      gl.deleteVertexArray(dotVao);\r
      gl.deleteVertexArray(lineVao);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div ref={containerRef} className={\`particles-container\${className ? \` \${className}\` : ''}\`} style={style}>\r
      <canvas ref={canvasRef} className="particles-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Particles;\r
`,o=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties } from 'react';\r
\r
export type ParticlesShape = 'circle' | 'square' | 'ring' | 'sparkle';\r
export type ParticlesHoverEffect = 'parallax' | 'repel' | 'attract';\r
export type ParticlesDrift = 'none' | 'up' | 'down' | 'forward';\r
\r
export interface ParticlesProps {\r
  particleCount?: number;\r
  particleSpread?: number;\r
  speed?: number;\r
  particleColors?: string[];\r
  moveParticlesOnHover?: boolean;\r
  particleHoverFactor?: number;\r
  alphaParticles?: boolean;\r
  particleBaseSize?: number;\r
  sizeRandomness?: number;\r
  cameraDistance?: number;\r
  disableRotation?: boolean;\r
  pixelRatio?: number;\r
  shape?: ParticlesShape;\r
  glow?: number;\r
  twinkle?: number;\r
  depthOfField?: number;\r
  connections?: boolean;\r
  connectionDistance?: number;\r
  hoverEffect?: ParticlesHoverEffect;\r
  hoverRadius?: number;\r
  clickBurst?: boolean;\r
  drift?: ParticlesDrift;\r
  driftSpeed?: number;\r
  variation?: number;\r
  intro?: boolean;\r
  opacity?: number;\r
  lightMode?: boolean;\r
  paused?: boolean;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
type Settings = {\r
  count: number;\r
  spread: number;\r
  speed: number;\r
  colors: string[];\r
  mouse: boolean;\r
  hoverFactor: number;\r
  soft: boolean;\r
  size: number;\r
  randomness: number;\r
  camera: number;\r
  rotate: boolean;\r
  dpr?: number;\r
  shape: number;\r
  glow: number;\r
  twinkle: number;\r
  depthOfField: number;\r
  connections: boolean;\r
  connectionDistance: number;\r
  hoverEffect: number;\r
  hoverRadius: number;\r
  clickBurst: boolean;\r
  drift: number;\r
  driftSpeed: number;\r
  variation: number;\r
  intro: boolean;\r
  opacity: number;\r
  lightMode: boolean;\r
  paused: boolean;\r
};\r
\r
type Burst = { x: number; y: number; age: number };\r
\r
type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };\r
\r
const SHAPES: Record<string, number> = { circle: 0, square: 1, ring: 2, sparkle: 3 };\r
const EFFECTS: Record<string, number> = { parallax: 0, repel: 1, attract: 2 };\r
const DRIFTS: Record<string, number> = { none: 0, up: 1, down: 2, forward: 3 };\r
const MAX_COUNT = 20000;\r
const MAX_LINKED = 900;\r
const MAX_LINES = 9000;\r
const MAX_BURSTS = 4;\r
const DEPTH = 10;\r
const FOCAL = 1 / Math.tan((7.5 * Math.PI) / 180);\r
const NEAR = 0.1;\r
const FAR = 100;\r
const INTRO_SECONDS = 1.8;\r
const BURST_SECONDS = 1.5;\r
const BURST_SPEED = 520;\r
const BURST_WIDTH = 46;\r
\r
const PARTICLE_VERTEX = \`#version 300 es\r
precision highp float;\r
layout(location = 0) in vec2 aCorner;\r
layout(location = 1) in vec3 aPosition;\r
layout(location = 2) in vec4 aRandom;\r
layout(location = 3) in vec3 aColor;\r
uniform mat3 uRotation;\r
uniform vec3 uOffset;\r
uniform float uSpread;\r
uniform float uTime;\r
uniform float uCamera;\r
uniform float uAspect;\r
uniform vec2 uView;\r
uniform float uRatio;\r
uniform float uSize;\r
uniform float uRandomness;\r
uniform float uBlur;\r
uniform float uFocus;\r
uniform float uGlow;\r
uniform float uTwinkle;\r
uniform int uShape;\r
uniform int uDrift;\r
uniform float uTravel;\r
uniform vec4 uPointer;\r
uniform int uEffect;\r
uniform float uStrength;\r
uniform vec4 uBursts[\${MAX_BURSTS}];\r
uniform int uBurstCount;\r
uniform float uReveal;\r
out vec2 vLocal;\r
out float vRadius;\r
out float vBlur;\r
out float vAlpha;\r
out float vHalo;\r
out float vSeed;\r
out vec3 vColor;\r
\r
vec3 bob(vec4 r, float t) {\r
  return vec3(\r
    sin(t * r.z + 6.28 * r.w) * mix(0.1, 1.5, r.x),\r
    sin(t * r.y + 6.28 * r.x) * mix(0.1, 1.5, r.w),\r
    sin(t * r.w + 6.28 * r.y) * mix(0.1, 1.5, r.z)\r
  );\r
}\r
\r
void main() {\r
  vec3 pos = aPosition * uSpread;\r
  pos.z *= \${DEPTH.toFixed(1)};\r
  vec3 wobble = bob(aRandom, uTime);\r
  vec3 world = uRotation * pos + uOffset + wobble;\r
  float edge = 1.0;\r
  if (uDrift == 1 || uDrift == 2) {\r
    float span = uSpread * 2.0 + 3.0;\r
    float k = mod(aRandom.w * span + uOffset.y + wobble.y + (uDrift == 1 ? uTravel : -uTravel), span);\r
    world.y = k - span * 0.5;\r
    edge = smoothstep(0.0, span * 0.12, k) * smoothstep(span, span * 0.88, k);\r
  } else if (uDrift == 3) {\r
    float span = uSpread * \${DEPTH.toFixed(1)} * 2.0 + 3.0;\r
    float k = mod(aRandom.y * span + uOffset.z + wobble.z + uTravel, span);\r
    world.z = k - span * 0.5;\r
    edge = smoothstep(0.0, span * 0.1, k);\r
  }\r
  vec3 view = world - vec3(0.0, 0.0, uCamera);\r
  float dist = length(view);\r
  float ahead = -view.z;\r
  if (ahead < \${NEAR.toFixed(2)} || ahead > \${FAR.toFixed(1)}) {\r
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);\r
    return;\r
  }\r
  edge *= smoothstep(1.0, 4.0, ahead);\r
  vec2 ndc = vec2(view.x * \${FOCAL.toFixed(6)} / uAspect, view.y * \${FOCAL.toFixed(6)}) / ahead;\r
  vec2 screen = (ndc * 0.5 + 0.5) * uView;\r
\r
  vec2 shift = vec2(0.0);\r
  float flash = 0.0;\r
  if (uEffect != 0 && uPointer.z > 0.001) {\r
    vec2 delta = screen - uPointer.xy;\r
    float reach = length(delta);\r
    float falloff = exp(-dot(delta, delta) / (uPointer.w * uPointer.w));\r
    vec2 away = reach > 0.001 ? delta / reach : vec2(0.0);\r
    shift += (uEffect == 1 ? away * uPointer.w * 0.5 : -delta * 0.6) * falloff * uStrength * uPointer.z;\r
  }\r
  for (int i = 0; i < \${MAX_BURSTS}; i++) {\r
    if (i >= uBurstCount) break;\r
    vec4 burst = uBursts[i];\r
    vec2 delta = screen - burst.xy;\r
    float reach = length(delta);\r
    float wave = exp(-pow((reach - burst.z * \${BURST_SPEED.toFixed(1)}) / \${BURST_WIDTH.toFixed(1)}, 2.0));\r
    vec2 away = reach > 0.001 ? delta / reach : vec2(0.0);\r
    float fade = (1.0 - burst.z) * (1.0 - burst.z) * burst.w;\r
    shift += away * wave * fade * 56.0 * smoothstep(0.0, 30.0, reach);\r
    flash += wave * fade;\r
  }\r
  screen += shift;\r
\r
  float diameter = (uRandomness <= 0.0 ? uSize : uSize * (1.0 + uRandomness * (aRandom.x - 0.5)) / dist) * (1.0 + min(flash, 1.0) * 0.6);\r
  float device = diameter * uRatio;\r
  float radius = max(diameter, 1.0 / uRatio) * 0.5;\r
  float coverage = min(1.0, device * device);\r
  float blur = uBlur * max(uFocus - dist, 0.0) / max(dist, 1.0);\r
  float halo = uGlow > 0.0 ? radius * 2.5 + 2.0 : 0.0;\r
  float extent = radius * (uShape == 3 ? 1.6 : 1.0) + blur + halo + 1.5;\r
\r
  float twinkle = 1.0 - uTwinkle * 0.6 * (0.5 + 0.5 * sin(uTime * (6.0 + aRandom.y * 14.0) + aRandom.w * 40.0));\r
  float far = smoothstep(\${FAR.toFixed(1)}, \${(FAR * 0.9).toFixed(1)}, ahead);\r
  float focus = radius / (radius + blur);\r
  float reveal = clamp(uReveal * 1.6 - aRandom.z * 0.6, 0.0, 1.0);\r
\r
  vLocal = aCorner * extent;\r
  vRadius = radius;\r
  vBlur = blur;\r
  vHalo = halo;\r
  vSeed = aRandom.y;\r
  vAlpha = min(1.0, coverage * twinkle * (1.0 + flash * 1.4)) * far * edge * max(focus, 0.35) * reveal * reveal;\r
  vColor = aColor;\r
  gl_Position = vec4((screen + aCorner * extent) / uView * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const PARTICLE_FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform int uShape;\r
uniform float uGlow;\r
uniform float uRatio;\r
uniform float uTime;\r
uniform float uSoft;\r
uniform float uShimmer;\r
uniform float uOpacity;\r
in vec2 vLocal;\r
in float vRadius;\r
in float vBlur;\r
in float vAlpha;\r
in float vHalo;\r
in float vSeed;\r
in vec3 vColor;\r
out vec4 outColor;\r
\r
float ray(vec2 q, float aa) {\r
  float width = 0.14 * max(0.0, 1.0 - q.x);\r
  return (1.0 - smoothstep(width - aa, width + aa, q.y)) * step(q.x, 1.0);\r
}\r
\r
void main() {\r
  float soft = vBlur + 0.7 / uRatio + vRadius * uSoft;\r
  float d = length(vLocal);\r
  float shape;\r
  if (uShape == 1) {\r
    float box = max(abs(vLocal.x), abs(vLocal.y));\r
    shape = 1.0 - smoothstep(vRadius * 0.86 - soft, vRadius * 0.86 + soft, box);\r
  } else if (uShape == 2) {\r
    float edge = max(vRadius * 0.22, 0.6 / uRatio);\r
    shape = 1.0 - smoothstep(edge - soft, edge + soft, abs(d - vRadius * 0.8));\r
  } else if (uShape == 3) {\r
    float reach = vRadius * 1.6;\r
    vec2 q = abs(vLocal) / max(reach, 0.0001);\r
    float aa = soft / max(reach, 0.0001);\r
    shape = max(max(ray(q, aa), ray(q.yx, aa)), 1.0 - smoothstep(vRadius * 0.32 - soft, vRadius * 0.32 + soft, d));\r
  } else {\r
    shape = 1.0 - smoothstep(vRadius - soft, vRadius + soft, d);\r
  }\r
  float halo = vHalo > 0.0 ? exp(-d / (vHalo * 0.35)) * uGlow * 0.4 : 0.0;\r
  float alpha = clamp(shape + halo * (1.0 - shape), 0.0, 1.0) * vAlpha * uOpacity * (1.0 - uSoft);\r
  if (alpha < 0.002) discard;\r
  vec2 uv = vLocal / max(vRadius * 2.0, 0.0001) + 0.5;\r
  vec3 color = clamp(vColor + uShimmer * 0.2 * sin(uv.yxx + uTime + vSeed * 6.28), 0.0, 1.0);\r
  outColor = vec4(color * alpha, alpha);\r
}\`;\r
\r
const LINE_VERTEX = \`#version 300 es\r
precision highp float;\r
layout(location = 0) in vec2 aCorner;\r
layout(location = 1) in vec4 aEnds;\r
layout(location = 2) in vec4 aTint;\r
uniform vec2 uView;\r
uniform float uRatio;\r
uniform float uWidth;\r
out float vAcross;\r
out float vHalf;\r
out vec4 vTint;\r
\r
void main() {\r
  vec2 a = aEnds.xy;\r
  vec2 b = aEnds.zw;\r
  vec2 along = b - a;\r
  float span = max(length(along), 0.0001);\r
  vec2 normal = vec2(-along.y, along.x) / span;\r
  float reach = uWidth * 0.5 + 1.0 / uRatio;\r
  vec2 point = mix(a, b, aCorner.x * 0.5 + 0.5) + normal * aCorner.y * reach;\r
  vAcross = aCorner.y * reach;\r
  vHalf = uWidth * 0.5;\r
  vTint = aTint;\r
  gl_Position = vec4(point / uView * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const LINE_FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform float uRatio;\r
uniform float uOpacity;\r
in float vAcross;\r
in float vHalf;\r
in vec4 vTint;\r
out vec4 outColor;\r
\r
void main() {\r
  float edge = 0.6 / uRatio;\r
  float cover = 1.0 - smoothstep(vHalf - edge, vHalf + edge, abs(vAcross));\r
  float alpha = cover * vTint.a * uOpacity;\r
  outColor = vec4(vTint.rgb * alpha, alpha);\r
}\`;\r
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
const link = (gl: WebGL2RenderingContext, vertexSource: string, fragmentSource: string): Program | null => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);\r
  const program = gl.createProgram();\r
  if (!vertex || !fragment || !program) return null;\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
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
    if (info) uniforms[info.name.replace('[0]', '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const seeded = (seed: number) => {\r
  let state = seed >>> 0;\r
  return () => {\r
    state = (state + 0x6d2b79f5) >>> 0;\r
    let t = state;\r
    t = Math.imul(t ^ (t >>> 15), t | 1);\r
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\r
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\r
  };\r
};\r
\r
const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);\r
\r
const wrap = (value: number, span: number) => ((value % span) + span) % span;\r
\r
const Particles = ({\r
  particleCount = 200,\r
  particleSpread = 10,\r
  speed = 0.1,\r
  particleColors = ['#ffffff'],\r
  moveParticlesOnHover = true,\r
  particleHoverFactor = 1,\r
  alphaParticles = false,\r
  particleBaseSize = 100,\r
  sizeRandomness = 1,\r
  cameraDistance = 20,\r
  disableRotation = false,\r
  pixelRatio,\r
  shape = 'circle',\r
  glow = 0.5,\r
  twinkle = 0.3,\r
  depthOfField = 0,\r
  connections = false,\r
  connectionDistance = 110,\r
  hoverEffect = 'parallax',\r
  hoverRadius = 140,\r
  clickBurst = true,\r
  drift = 'none',\r
  driftSpeed = 1,\r
  variation = 0,\r
  intro = true,\r
  opacity = 1,\r
  lightMode = false,\r
  paused = false,\r
  className = '',\r
  style\r
}: ParticlesProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const palette = (Array.isArray(particleColors) ? particleColors : [particleColors as unknown as string])\r
    .filter(Boolean)\r
    .map(String);\r
  const settings: Settings = {\r
    count: clamp(Math.round(particleCount), 1, MAX_COUNT),\r
    spread: Math.max(0.1, particleSpread),\r
    speed,\r
    colors: palette.length ? palette : ['#ffffff'],\r
    mouse: moveParticlesOnHover,\r
    hoverFactor: Math.max(0, particleHoverFactor),\r
    soft: alphaParticles,\r
    size: Math.max(0, particleBaseSize),\r
    randomness: Math.max(0, sizeRandomness),\r
    camera: Math.max(1, cameraDistance),\r
    rotate: !disableRotation,\r
    dpr: pixelRatio,\r
    shape: SHAPES[shape] ?? 0,\r
    glow: Math.max(0, glow),\r
    twinkle: clamp(twinkle, 0, 1),\r
    depthOfField: Math.max(0, depthOfField),\r
    connections,\r
    connectionDistance: Math.max(10, connectionDistance),\r
    hoverEffect: EFFECTS[hoverEffect] ?? 0,\r
    hoverRadius: Math.max(20, hoverRadius),\r
    clickBurst,\r
    drift: DRIFTS[drift] ?? 0,\r
    driftSpeed,\r
    variation: Math.max(0, Math.round(variation)),\r
    intro,\r
    opacity: clamp(opacity, 0, 1),\r
    lightMode,\r
    paused\r
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
    const dots = link(gl, PARTICLE_VERTEX, PARTICLE_FRAGMENT);\r
    const lines = link(gl, LINE_VERTEX, LINE_FRAGMENT);\r
    if (!dots || !lines) return undefined;\r
\r
    const corners = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, corners);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
\r
    const positionBuffer = gl.createBuffer();\r
    const randomBuffer = gl.createBuffer();\r
    const colorBuffer = gl.createBuffer();\r
    const dotVao = gl.createVertexArray();\r
    gl.bindVertexArray(dotVao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, corners);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    const attach = (buffer: WebGLBuffer | null, location: number, width: number) => {\r
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
      gl.enableVertexAttribArray(location);\r
      gl.vertexAttribPointer(location, width, gl.FLOAT, false, 0, 0);\r
      gl.vertexAttribDivisor(location, 1);\r
    };\r
    attach(positionBuffer, 1, 3);\r
    attach(randomBuffer, 2, 4);\r
    attach(colorBuffer, 3, 3);\r
\r
    const lineBuffer = gl.createBuffer();\r
    const lineData = new Float32Array(MAX_LINES * 8);\r
    const lineVao = gl.createVertexArray();\r
    gl.bindVertexArray(lineVao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, corners);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, lineData.byteLength, gl.DYNAMIC_DRAW);\r
    gl.enableVertexAttribArray(1);\r
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 32, 0);\r
    gl.vertexAttribDivisor(1, 1);\r
    gl.enableVertexAttribArray(2);\r
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 32, 16);\r
    gl.vertexAttribDivisor(2, 1);\r
    gl.bindVertexArray(null);\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const cache = new Map<string, number[]>();\r
    const parse = (value: string): number[] => {\r
      const cached = cache.get(value);\r
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
      cache.set(value, rgb);\r
      return rgb;\r
    };\r
    const ink = (rgb: number[]): number[] => {\r
      const linear = rgb.map(v => Math.pow(v, 2.2));\r
      const tone = 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];\r
      const depth = Math.min(1, 0.06 / Math.max(tone, 0.0001));\r
      return linear.map(v => Math.pow(v * depth, 1 / 2.2));\r
    };\r
\r
    const view = { width: 1, height: 1, ratio: 1 };\r
    const pointer = { x: 0, y: 0, sx: 0, sy: 0, nx: 0, ny: 0, inside: false, active: 0 };\r
    const state = {\r
      clock: 0,\r
      spin: 0,\r
      travel: 0,\r
      offsetX: 0,\r
      offsetY: 0,\r
      reveal: settingsRef.current.intro && !reduce ? 0 : 1\r
    };\r
    const bursts: Burst[] = [];\r
    const packedBursts = new Float32Array(MAX_BURSTS * 4);\r
    const cloud = {\r
      key: '',\r
      count: 0,\r
      positions: new Float32Array(0),\r
      randoms: new Float32Array(0),\r
      colors: new Float32Array(0)\r
    };\r
    const screen = {\r
      x: new Float32Array(0),\r
      y: new Float32Array(0),\r
      ahead: new Float32Array(0),\r
      alpha: new Float32Array(0)\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const rebuild = (s: Settings) => {\r
      const key = \`\${s.count}|\${s.variation}|\${s.colors.join(',')}|\${s.lightMode ? 1 : 0}\`;\r
      if (key === cloud.key) return;\r
      cloud.key = key;\r
      const next = seeded(s.variation * 7919 + 1);\r
      const total = s.count;\r
      const positions = new Float32Array(total * 3);\r
      const randoms = new Float32Array(total * 4);\r
      const tints = new Float32Array(total * 3);\r
      const swatches = s.colors.map(value => (s.lightMode ? ink(parse(value)) : parse(value)));\r
      for (let i = 0; i < total; i++) {\r
        let x: number;\r
        let y: number;\r
        let z: number;\r
        let len: number;\r
        do {\r
          x = next() * 2 - 1;\r
          y = next() * 2 - 1;\r
          z = next() * 2 - 1;\r
          len = x * x + y * y + z * z;\r
        } while (len > 1 || len === 0);\r
        const r = Math.cbrt(next());\r
        positions.set([x * r, y * r, z * r], i * 3);\r
        randoms.set([next(), next(), next(), next()], i * 4);\r
        tints.set(swatches[Math.floor(next() * swatches.length)], i * 3);\r
      }\r
      cloud.count = total;\r
      cloud.positions = positions;\r
      cloud.randoms = randoms;\r
      cloud.colors = tints;\r
      const linked = Math.min(total, MAX_LINKED);\r
      screen.x = new Float32Array(linked);\r
      screen.y = new Float32Array(linked);\r
      screen.ahead = new Float32Array(linked);\r
      screen.alpha = new Float32Array(linked);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, randomBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, randoms, gl.STATIC_DRAW);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, tints, gl.STATIC_DRAW);\r
    };\r
\r
    const rotationOf = (s: Settings): number[] => {\r
      const elapsed = state.clock * 1000;\r
      const x = s.rotate ? Math.sin(elapsed * 0.0002) * 0.1 : 0;\r
      const y = s.rotate ? Math.cos(elapsed * 0.0005) * 0.15 : 0;\r
      const z = s.rotate ? state.spin : 0;\r
      const [sx, cx, sy, cy, sz, cz] = [Math.sin(x), Math.cos(x), Math.sin(y), Math.cos(y), Math.sin(z), Math.cos(z)];\r
      return [\r
        cy * cz + sy * sx * sz,\r
        cx * sz,\r
        -sy * cz + cy * sx * sz,\r
        -cy * sz + sy * sx * cz,\r
        cx * cz,\r
        sy * sz + cy * sx * cz,\r
        sy * cx,\r
        -sx,\r
        cy * cx\r
      ];\r
    };\r
\r
    const offsetOf = (): [number, number, number] => [state.offsetX, state.offsetY, -(1 - easeOut(state.reveal)) * 70];\r
\r
    const project = (s: Settings, matrix: number[]) => {\r
      const total = Math.min(cloud.count, MAX_LINKED);\r
      const [ox, oy, oz] = offsetOf();\r
      const aspect = view.width / view.height;\r
      const time = state.clock;\r
      const radius = s.hoverRadius;\r
      const active = s.hoverEffect !== 0 ? pointer.active : 0;\r
      const spanY = s.spread * 2 + 3;\r
      const spanZ = s.spread * DEPTH * 2 + 3;\r
      for (let i = 0; i < total; i++) {\r
        const px = cloud.positions[i * 3] * s.spread;\r
        const py = cloud.positions[i * 3 + 1] * s.spread;\r
        const pz = cloud.positions[i * 3 + 2] * s.spread * DEPTH;\r
        const r0 = cloud.randoms[i * 4];\r
        const r1 = cloud.randoms[i * 4 + 1];\r
        const r2 = cloud.randoms[i * 4 + 2];\r
        const r3 = cloud.randoms[i * 4 + 3];\r
        const bobX = Math.sin(time * r2 + 6.28 * r3) * (0.1 + 1.4 * r0);\r
        const bobY = Math.sin(time * r1 + 6.28 * r0) * (0.1 + 1.4 * r3);\r
        const bobZ = Math.sin(time * r3 + 6.28 * r1) * (0.1 + 1.4 * r2);\r
        const wx = matrix[0] * px + matrix[3] * py + matrix[6] * pz + ox + bobX;\r
        let wy = matrix[1] * px + matrix[4] * py + matrix[7] * pz + oy + bobY;\r
        let wz = matrix[2] * px + matrix[5] * py + matrix[8] * pz + oz + bobZ;\r
        let edge = 1;\r
        if (s.drift === 1 || s.drift === 2) {\r
          const k = wrap(r3 * spanY + oy + bobY + (s.drift === 1 ? state.travel : -state.travel), spanY);\r
          wy = k - spanY / 2;\r
          const low = clamp(k / (spanY * 0.12), 0, 1);\r
          const high = clamp((spanY - k) / (spanY * 0.12), 0, 1);\r
          edge = low * low * (3 - 2 * low) * high * high * (3 - 2 * high);\r
        } else if (s.drift === 3) {\r
          const k = wrap(r1 * spanZ + oz + bobZ + state.travel, spanZ);\r
          wz = k - spanZ / 2;\r
          const fresh = clamp(k / (spanZ * 0.1), 0, 1);\r
          edge = fresh * fresh * (3 - 2 * fresh);\r
        }\r
        const ahead = s.camera - wz;\r
        if (ahead < NEAR || ahead > FAR) {\r
          screen.alpha[i] = 0;\r
          continue;\r
        }\r
        const close = clamp((ahead - 1) / 3, 0, 1);\r
        edge *= close * close * (3 - 2 * close);\r
        let sx = ((wx * FOCAL) / aspect / ahead) * 0.5 * view.width + view.width / 2;\r
        let sy = ((wy * FOCAL) / ahead) * 0.5 * view.height + view.height / 2;\r
        let dx = 0;\r
        let dy = 0;\r
        if (active > 0.001) {\r
          const ex = sx - pointer.sx;\r
          const ey = sy - pointer.sy;\r
          const reach = Math.hypot(ex, ey);\r
          const falloff = Math.exp(-(ex * ex + ey * ey) / (radius * radius)) * s.hoverFactor * active;\r
          if (s.hoverEffect === 1 && reach > 0.001) {\r
            dx += (ex / reach) * radius * 0.5 * falloff;\r
            dy += (ey / reach) * radius * 0.5 * falloff;\r
          } else if (s.hoverEffect === 2) {\r
            dx -= ex * 0.6 * falloff;\r
            dy -= ey * 0.6 * falloff;\r
          }\r
        }\r
        for (const burst of bursts) {\r
          const progress = burst.age / BURST_SECONDS;\r
          const ex = sx - burst.x;\r
          const ey = sy - burst.y;\r
          const reach = Math.hypot(ex, ey);\r
          if (reach < 0.001) continue;\r
          const wave = Math.exp(-Math.pow((reach - progress * BURST_SPEED) / BURST_WIDTH, 2));\r
          const ramp = clamp(reach / 30, 0, 1);\r
          const push = wave * (1 - progress) * (1 - progress) * 56 * ramp * ramp * (3 - 2 * ramp);\r
          dx += (ex / reach) * push;\r
          dy += (ey / reach) * push;\r
        }\r
        sx += dx;\r
        sy += dy;\r
        const far = clamp((FAR - ahead) / (FAR - FAR * 0.9), 0, 1);\r
        const reveal = clamp(state.reveal * 1.6 - r2 * 0.6, 0, 1);\r
        screen.x[i] = sx;\r
        screen.y[i] = sy;\r
        screen.ahead[i] = ahead;\r
        screen.alpha[i] = far * far * (3 - 2 * far) * edge * reveal * reveal;\r
      }\r
      return total;\r
    };\r
\r
    const buildLines = (s: Settings, matrix: number[]) => {\r
      const total = project(s, matrix);\r
      const reach = s.connectionDistance;\r
      const columns = Math.max(1, Math.ceil(view.width / reach) + 2);\r
      const buckets = new Map<number, number[]>();\r
      for (let i = 0; i < total; i++) {\r
        if (screen.alpha[i] < 0.02) continue;\r
        const key = (Math.floor(screen.y[i] / reach) + 1) * columns + Math.floor(screen.x[i] / reach) + 1;\r
        const bucket = buckets.get(key);\r
        if (bucket) bucket.push(i);\r
        else buckets.set(key, [i]);\r
      }\r
      let lineCount = 0;\r
      const limit = reach * reach;\r
      for (const [key, members] of buckets) {\r
        for (const offset of [0, 1, columns - 1, columns, columns + 1]) {\r
          const others = offset === 0 ? members : buckets.get(key + offset);\r
          if (!others) continue;\r
          for (let a = 0; a < members.length; a++) {\r
            const i = members[a];\r
            for (let b = offset === 0 ? a + 1 : 0; b < others.length; b++) {\r
              const j = others[b];\r
              const dx = screen.x[i] - screen.x[j];\r
              const dy = screen.y[i] - screen.y[j];\r
              const gap = dx * dx + dy * dy;\r
              if (gap > limit) continue;\r
              const layer = clamp(1 - Math.abs(screen.ahead[i] - screen.ahead[j]) / 18, 0, 1);\r
              if (layer <= 0) continue;\r
              if (lineCount >= MAX_LINES) return lineCount;\r
              const fade = 1 - Math.sqrt(gap) / reach;\r
              const base = lineCount * 8;\r
              lineData[base] = screen.x[i];\r
              lineData[base + 1] = screen.y[i];\r
              lineData[base + 2] = screen.x[j];\r
              lineData[base + 3] = screen.y[j];\r
              lineData[base + 4] = (cloud.colors[i * 3] + cloud.colors[j * 3]) / 2;\r
              lineData[base + 5] = (cloud.colors[i * 3 + 1] + cloud.colors[j * 3 + 1]) / 2;\r
              lineData[base + 6] = (cloud.colors[i * 3 + 2] + cloud.colors[j * 3 + 2]) / 2;\r
              lineData[base + 7] = fade * fade * layer * 0.7 * Math.min(screen.alpha[i], screen.alpha[j]);\r
              lineCount++;\r
            }\r
          }\r
        }\r
      }\r
      return lineCount;\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      rebuild(s);\r
      const matrix = rotationOf(s);\r
      const [ox, oy, oz] = offsetOf();\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
\r
      if (s.connections) {\r
        const lineCount = buildLines(s, matrix);\r
        if (lineCount) {\r
          gl.useProgram(lines.program);\r
          gl.bindVertexArray(lineVao);\r
          gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);\r
          gl.bufferSubData(gl.ARRAY_BUFFER, 0, lineData.subarray(0, lineCount * 8));\r
          gl.uniform2f(lines.uniforms.uView, view.width, view.height);\r
          gl.uniform1f(lines.uniforms.uRatio, view.ratio);\r
          gl.uniform1f(lines.uniforms.uWidth, 1);\r
          gl.uniform1f(lines.uniforms.uOpacity, s.opacity);\r
          gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, lineCount);\r
        }\r
      }\r
\r
      const u = dots.uniforms;\r
      let burstCount = 0;\r
      for (let i = bursts.length - 1; i >= 0 && burstCount < MAX_BURSTS; i--) {\r
        packedBursts.set([bursts[i].x, bursts[i].y, bursts[i].age / BURST_SECONDS, 1], burstCount * 4);\r
        burstCount++;\r
      }\r
      gl.useProgram(dots.program);\r
      gl.bindVertexArray(dotVao);\r
      gl.uniformMatrix3fv(u.uRotation, false, matrix);\r
      gl.uniform3f(u.uOffset, ox, oy, oz);\r
      gl.uniform1f(u.uSpread, s.spread);\r
      gl.uniform1f(u.uTime, state.clock);\r
      gl.uniform1f(u.uCamera, s.camera);\r
      gl.uniform1f(u.uAspect, view.width / view.height);\r
      gl.uniform2f(u.uView, view.width, view.height);\r
      gl.uniform1f(u.uRatio, view.ratio);\r
      gl.uniform1f(u.uSize, s.size);\r
      gl.uniform1f(u.uRandomness, s.randomness);\r
      gl.uniform1f(u.uBlur, s.depthOfField * 14);\r
      gl.uniform1f(u.uFocus, s.camera + 14);\r
      gl.uniform1f(u.uGlow, s.lightMode ? s.glow * 0.3 : s.glow);\r
      gl.uniform1f(u.uTwinkle, s.twinkle);\r
      gl.uniform1i(u.uShape, s.shape);\r
      gl.uniform1i(u.uDrift, s.drift);\r
      gl.uniform1f(u.uTravel, state.travel);\r
      gl.uniform4f(u.uPointer, pointer.sx, pointer.sy, pointer.active, s.hoverRadius);\r
      gl.uniform1i(u.uEffect, s.hoverEffect);\r
      gl.uniform1f(u.uStrength, s.hoverFactor);\r
      gl.uniform4fv(u.uBursts, packedBursts);\r
      gl.uniform1i(u.uBurstCount, burstCount);\r
      gl.uniform1f(u.uReveal, state.reveal);\r
      gl.uniform1f(u.uSoft, s.soft ? 0.2 : 0);\r
      gl.uniform1f(u.uShimmer, s.lightMode ? 0 : 1);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, cloud.count);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.0005, 0.05) : 1 / 60;\r
      last = now;\r
      if (s.paused) {\r
        state.reveal = 1;\r
        render();\r
        last = 0;\r
        return;\r
      }\r
      const motion = reduce ? 0 : 1;\r
      const pace = dt * s.speed * motion;\r
      state.clock += pace;\r
      if (s.rotate) state.spin += pace * 0.6;\r
      state.travel += dt * s.driftSpeed * motion * (s.drift === 3 ? 6 : 0.9);\r
\r
      const engaged = s.mouse && pointer.inside && !reduce;\r
      const follow = 1 - Math.exp(-dt / 0.35);\r
      const parallax = engaged && s.hoverEffect === 0 ? s.hoverFactor : 0;\r
      state.offsetX += (-pointer.nx * parallax - state.offsetX) * follow;\r
      state.offsetY += (-pointer.ny * parallax - state.offsetY) * follow;\r
      pointer.sx += (pointer.x - pointer.sx) * (1 - Math.exp(-dt / 0.06));\r
      pointer.sy += (pointer.y - pointer.sy) * (1 - Math.exp(-dt / 0.06));\r
      pointer.active += ((engaged ? 1 : 0) - pointer.active) * (1 - Math.exp(-dt / 0.2));\r
\r
      for (let i = bursts.length - 1; i >= 0; i--) {\r
        bursts[i].age += dt;\r
        if (bursts[i].age >= BURST_SECONDS) bursts.splice(i, 1);\r
      }\r
\r
      if (!s.intro || reduce) state.reveal = 1;\r
      else if (state.reveal < 1) state.reveal = Math.min(1, state.reveal + dt / INTRO_SECONDS);\r
\r
      render();\r
      raf = requestAnimationFrame(frame);\r
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
      view.ratio = canvas.width / width;\r
      render();\r
      wake();\r
    };\r
\r
    const locate = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      const wasInside = pointer.inside;\r
      pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      pointer.x = x;\r
      pointer.y = rect.height - y;\r
      pointer.nx = (x / Math.max(1, rect.width)) * 2 - 1;\r
      pointer.ny = -((y / Math.max(1, rect.height)) * 2 - 1);\r
      if (pointer.inside && !wasInside) {\r
        pointer.sx = pointer.x;\r
        pointer.sy = pointer.y;\r
      }\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      locate(event);\r
      if (!settingsRef.current.paused) wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      locate(event);\r
      if (!pointer.inside || !s.clickBurst || s.paused || reduce) return;\r
      bursts.push({ x: pointer.x, y: pointer.y, age: 0 });\r
      if (bursts.length > MAX_BURSTS) bursts.shift();\r
      wake();\r
    };\r
\r
    const onPointerUp = (event: PointerEvent) => {\r
      if (event.pointerType !== 'mouse') pointer.inside = false;\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
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
    window.addEventListener('pointerup', onPointerUp, { passive: true });\r
    window.addEventListener('pointercancel', onPointerUp, { passive: true });\r
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
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('pointerup', onPointerUp);\r
      window.removeEventListener('pointercancel', onPointerUp);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteProgram(dots.program);\r
      gl.deleteProgram(lines.program);\r
      [corners, positionBuffer, randomBuffer, colorBuffer, lineBuffer].forEach(buffer => gl.deleteBuffer(buffer));\r
      gl.deleteVertexArray(dotVao);\r
      gl.deleteVertexArray(lineVao);\r
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
      style={style}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Particles;\r
`,a={usage:`import Particles from './Particles';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <Particles
    particleColors={['#ffffff']}
    particleCount={200}
    particleSpread={10}
    speed={0.1}
    particleBaseSize={100}
    glow={0.5}
    twinkle={0.3}
    moveParticlesOnHover
    hoverEffect="parallax"
  />
</div>`,code:r,css:n,tailwind:e,tsCode:t,tsTailwind:o};export{a as particles};
