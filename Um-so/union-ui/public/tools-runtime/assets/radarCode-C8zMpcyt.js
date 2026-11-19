const r=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
import './Radar.css';\r
\r
const QUAD_VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const CAMERA = \`\r
uniform vec2 uResolution;\r
uniform vec2 uCenter;\r
uniform float uViewHeight;\r
uniform float uFocal;\r
uniform float uDistance;\r
uniform float uTilt;\r
\`;\r
\r
const SCENE = \`#version 300 es\r
precision highp float;\r
\${CAMERA}\r
uniform float uMode;\r
uniform float uSweep;\r
uniform float uSwept;\r
uniform float uDirection;\r
uniform float uCycle;\r
uniform float uTrail;\r
uniform float uRings;\r
uniform float uSpokes;\r
uniform float uTicks;\r
uniform float uGrid;\r
uniform float uLine;\r
uniform float uClutter;\r
uniform float uTime;\r
uniform vec3 uAccent;\r
uniform vec3 uHeat;\r
uniform float uIntro;\r
uniform float uRange;\r
uniform float uPixel;\r
out vec4 outColor;\r
\r
const float TAU = 6.28318531;\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
float noise(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = fract(p);\r
  vec2 u = f * f * (3.0 - 2.0 * f);\r
  float a = hash(i);\r
  float b = hash(i + vec2(1.0, 0.0));\r
  float c = hash(i + vec2(0.0, 1.0));\r
  float d = hash(i + vec2(1.0, 1.0));\r
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);\r
}\r
\r
float stroke(float distance, float width) {\r
  float w = max(width, 1.0) * 0.5;\r
  return clamp(w + 0.5 - distance, 0.0, 1.0) * min(width, 1.0);\r
}\r
\r
void main() {\r
  vec2 s = (gl_FragCoord.xy - uCenter) / uViewHeight;\r
  float ct = cos(uTilt);\r
  float st = sin(uTilt);\r
  vec3 forward = vec3(0.0, st, -ct);\r
  vec3 up = vec3(0.0, ct, st);\r
  vec3 dir = forward * uFocal + vec3(s.x, 0.0, 0.0) + up * s.y;\r
  vec3 eye = vec3(0.0, -uDistance * st, uDistance * ct);\r
  float hit = -eye.z / min(dir.z, -0.00001);\r
  vec2 p = eye.xy + dir.xy * hit;\r
  float r = length(p);\r
  vec2 dpdx = dFdx(p);\r
  vec2 dpdy = dFdy(p);\r
  if (dir.z > -0.0001 || r > 1.3) {\r
    outColor = vec4(0.0);\r
    return;\r
  }\r
  vec2 radial = p / max(r, 0.00001);\r
  vec2 tangent = vec2(radial.y, -radial.x);\r
  float pxR = max(length(vec2(dot(radial, dpdx), dot(radial, dpdy))), 0.000001);\r
  float pxT = max(length(vec2(dot(tangent, dpdx), dot(tangent, dpdy))), 0.000001);\r
  float bearing = atan(p.x, p.y);\r
  float turn = fract(bearing / TAU + 1.0);\r
  float inside = 1.0 - smoothstep(1.0 - pxR, 1.0 + pxR, r);\r
\r
  float ringCoord = r * uRings;\r
  float ringIndex = clamp(floor(ringCoord + 0.5), 1.0, max(uRings - 1.0, 1.0));\r
  float rings = stroke(abs(ringCoord - ringIndex) / uRings / pxR, uLine) * step(ringIndex, uRings - 0.5);\r
  float arc = clamp(uIntro * (uRings + 3.0) - ringIndex, 0.0, 1.0) * 1.02;\r
  rings *= 1.0 - smoothstep(arc - 0.01, arc, turn);\r
  float outerArc = clamp(uIntro * (uRings + 3.0) - uRings, 0.0, 1.0) * 1.02;\r
  float outer = stroke(abs(r - 1.0) / pxR, uLine * 1.15) * (1.0 - smoothstep(outerArc - 0.01, outerArc, turn));\r
\r
  float tickCoord = turn * 180.0;\r
  float tickIndex = floor(tickCoord + 0.5);\r
  float major = 1.0 - step(0.5, mod(tickIndex, 15.0));\r
  float middle = 1.0 - step(0.5, mod(tickIndex, 5.0));\r
  float tickLength = mix(mix(0.016, 0.03, middle), 0.05, major);\r
  float tickRadial = clamp((r - 1.0) / pxR + 0.5, 0.0, 1.0) * clamp((1.0 + tickLength - r) / pxR + 0.5, 0.0, 1.0);\r
  float spacing = TAU / 180.0 * r / pxT;\r
  float ticks = stroke(abs(tickCoord - tickIndex) / 180.0 * TAU * r / pxT, uLine) * tickRadial;\r
  ticks *= mix(mix(0.42 * smoothstep(2.5, 5.0, spacing), 0.7, middle), 1.0, major) * uTicks;\r
  ticks *= smoothstep(0.55, 0.9, uIntro);\r
\r
  float spokeTotal = max(uSpokes, 1.0);\r
  float spokeCoord = turn * spokeTotal;\r
  float spokeIndex = floor(spokeCoord + 0.5);\r
  float spokes = stroke(abs(spokeCoord - spokeIndex) / spokeTotal * TAU * r / pxT, uLine) * smoothstep(0.05, 0.16, r);\r
  spokes *= inside * step(0.5, uSpokes);\r
  float cardinalCoord = turn * 4.0;\r
  float cardinal = stroke(abs(cardinalCoord - floor(cardinalCoord + 0.5)) / 4.0 * TAU * r / pxT, uLine) * smoothstep(0.02, 0.08, r) * inside;\r
  float hub = stroke(abs(r - 0.022) / pxR, uLine);\r
  float spokesIn = smoothstep(0.35, 0.8, uIntro);\r
  float axisDistance = abs(cardinalCoord - floor(cardinalCoord + 0.5)) / 4.0 * TAU * r / pxT;\r
  float rangeCoord = r * uRings * 5.0;\r
  float rangeMark = stroke(abs(rangeCoord - floor(rangeCoord + 0.5)) / (uRings * 5.0) / pxR, uLine);\r
  rangeMark *= 1.0 - smoothstep(3.0 * uPixel - 0.5, 3.0 * uPixel + 0.5, axisDistance);\r
  rangeMark *= smoothstep(0.06, 0.12, r) * inside;\r
  float bezel = stroke(abs(r - 1.065) / pxR, uLine) * uTicks * smoothstep(0.6, 0.95, uIntro);\r
\r
  float grid = rings * 0.12 + outer * 0.24 + ticks * 0.22 + bezel * 0.08;\r
  grid += (spokes * 0.05 + cardinal * 0.08 + hub * 0.22 + rangeMark * 0.16) * spokesIn;\r
  grid *= uGrid;\r
\r
  float behind;\r
  float edge;\r
  float trail;\r
  float lastPass;\r
  if (uMode < 0.5) {\r
    float ahead = fract((bearing - uSweep) / TAU + 0.5) - 0.5;\r
    behind = fract(uDirection * (uSweep - bearing) / TAU) * TAU;\r
    edge = stroke(abs(ahead) * TAU * r / pxT, uLine * 1.4) * smoothstep(0.0, 0.04, r) * inside;\r
    trail = exp(-behind / uTrail) * (1.0 - smoothstep(uSwept - 0.15, uSwept, behind));\r
    lastPass = floor(uCycle - behind / TAU);\r
  } else {\r
    behind = uSweep - r;\r
    edge = stroke(abs(behind) / pxR, uLine * 1.4) * inside;\r
    trail = behind >= 0.0 ? exp(-behind / uTrail) : 0.0;\r
    lastPass = behind >= 0.0 ? uCycle : uCycle - 1.0;\r
  }\r
  float sweepIn = smoothstep(0.45, 1.0, uIntro);\r
  trail *= inside * sweepIn;\r
  edge *= sweepIn;\r
  float glowTrail = pow(trail, 0.45);\r
\r
  float returns = 0.0;\r
  if (uClutter > 0.0 && trail > 0.004) {\r
    float radialBin = floor(r * 120.0);\r
    float count = max(8.0, floor(radialBin * 5.0));\r
    float angularBin = floor(turn * count);\r
    vec2 drift = vec2(lastPass * 0.173, lastPass * 0.291);\r
    float weather = noise(p * 3.2 + drift) * 0.65 + noise(p * 7.1 - drift) * 0.35;\r
    float cluster = smoothstep(0.5, 0.78, weather);\r
    float density = uClutter * (0.02 + 0.35 * cluster) * (1.0 - smoothstep(0.55, 1.0, r));\r
    vec2 binSeed = vec2(radialBin, angularBin) + lastPass * 17.13;\r
    float speck = step(1.0 - density, hash(binSeed));\r
    vec2 inBin = vec2(fract(r * 120.0), fract(turn * count)) - 0.5;\r
    float shape = 1.0 - smoothstep(0.18, 0.5, length(inBin));\r
    speck *= shape * (0.45 + 0.55 * hash(binSeed + 7.7));\r
    returns = (speck * 1.1 + cluster * 0.16 * uClutter) * trail;\r
  }\r
\r
  float heat = uHeat.z * exp(-dot(p - uHeat.xy, p - uHeat.xy) / 0.035);\r
  float lit = clamp(glowTrail * 0.9 + heat * 0.55, 0.0, 1.0);\r
  vec3 lineColor = mix(vec3(1.0), uAccent, lit);\r
  vec3 light = lineColor * grid * (1.0 + glowTrail * 3.0 + heat * 2.4);\r
  float fill = trail * 0.11 * (0.35 + 0.65 * smoothstep(0.0, 0.6, r));\r
  light += uAccent * (fill + returns * 0.55);\r
  light += mix(uAccent, vec3(1.0), 0.3) * edge * 1.3;\r
  outColor = vec4(light * uRange, 1.0);\r
}\`;\r
\r
const SPRITE_VERTEX = \`#version 300 es\r
in vec2 aCorner;\r
in vec4 aSprite;\r
in vec4 aStyle;\r
\${CAMERA}\r
out vec2 vLocal;\r
out vec4 vStyle;\r
out float vKind;\r
void main() {\r
  float ct = cos(uTilt);\r
  float st = sin(uTilt);\r
  float c = cos(aStyle.w);\r
  float s = sin(aStyle.w);\r
  vec2 local = aCorner * 1.25;\r
  vec2 offset = vec2(c * local.x - s * local.y, s * local.x + c * local.y) * aSprite.z;\r
  vec3 world = vec3(aSprite.xy + offset, 0.0);\r
  vec3 eye = vec3(0.0, -uDistance * st, uDistance * ct);\r
  vec3 rel = world - eye;\r
  float xc = rel.x;\r
  float yc = dot(rel, vec3(0.0, ct, st));\r
  float zc = max(dot(rel, vec3(0.0, st, -ct)), 0.0001);\r
  vec2 center = uCenter / uResolution * 2.0 - 1.0;\r
  gl_Position = vec4(center * zc + 2.0 * uFocal * uViewHeight * vec2(xc, yc) / uResolution, 0.0, zc);\r
  vLocal = local;\r
  vStyle = aStyle;\r
  vKind = aSprite.w;\r
}\`;\r
\r
const SPRITE_FRAGMENT = \`#version 300 es\r
precision highp float;\r
in vec2 vLocal;\r
in vec4 vStyle;\r
in float vKind;\r
uniform vec3 uAccent;\r
uniform float uRange;\r
out vec4 outColor;\r
void main() {\r
  float shape;\r
  vec3 tint;\r
  if (vKind < 0.5) {\r
    float d = length(vLocal * vec2(0.62, 1.0));\r
    float aa = max(fwidth(d), 0.0001);\r
    shape = clamp((1.0 - d) / aa + 0.5, 0.0, 1.0);\r
    shape *= 0.5 + 0.5 * exp(-d * d * 2.5);\r
    tint = mix(uAccent, vec3(1.0), vStyle.y * 0.45 * exp(-d * d * 5.0));\r
  } else {\r
    float d = length(vLocal);\r
    float aa = max(fwidth(d), 0.0001);\r
    shape = clamp(1.0 - abs(d - 1.0) / (aa * 0.75), 0.0, 1.0);\r
    tint = mix(uAccent, vec3(1.0), 0.2);\r
  }\r
  outColor = vec4(tint * shape * vStyle.x * uRange, 1.0);\r
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
  outColor = sum / 12.0 + texture(uBase, uv);\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uScene;\r
uniform sampler2D uBloom;\r
uniform vec2 uResolution;\r
uniform float uExposure;\r
uniform float uGlow;\r
uniform float uGrain;\r
uniform float uFade;\r
uniform float uOpacity;\r
uniform float uTime;\r
uniform float uLightMode;\r
uniform vec4 uBackground;\r
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
  vec3 hdr = texelFetch(uScene, ivec2(gl_FragCoord.xy), 0).rgb * uExposure;\r
  vec3 bloom = texture(uBloom, uv).rgb * uExposure * uGlow * 0.5;\r
  float edge = uFade * 0.5;\r
  float mask = smootherstep(edge, uv.x) * smootherstep(edge, 1.0 - uv.x) * smootherstep(edge, uv.y) * smootherstep(edge, 1.0 - uv.y);\r
  mask *= uOpacity;\r
  float grain = (hash(gl_FragCoord.xy + fract(uTime * 7.31) * 113.0) - 0.5) * uGrain;\r
  vec4 color;\r
  if (uLightMode > 0.5) {\r
    float bloomPeak = max(bloom.r, max(bloom.g, bloom.b));\r
    float bloomLow = min(bloom.r, min(bloom.g, bloom.b));\r
    vec3 total = hdr + bloom * 0.3 * (bloomPeak - bloomLow) / max(bloomPeak, 0.0001);\r
    float peak = max(total.r, max(total.g, total.b));\r
    vec3 hue = total / max(peak, 0.0001);\r
    float tone = dot(hue, vec3(0.2126, 0.7152, 0.0722));\r
    float depth = mix(0.36, 0.09, smoothstep(0.06, 0.7, peak));\r
    vec3 ink = pow(clamp(hue * min(1.0, depth / max(tone, 0.001)), 0.0, 1.0), vec3(1.0 / 2.2));\r
    float alpha = clamp((1.0 - exp(-peak * 2.6)) * (1.0 + grain), 0.0, 1.0) * mask;\r
    color = vec4(ink * alpha, alpha);\r
  } else {\r
    vec3 mapped = 1.0 - exp(-(hdr + bloom));\r
    float level = max(mapped.r, max(mapped.g, mapped.b));\r
    mapped = clamp(mapped + grain * level, 0.0, 1.0) * mask;\r
    color = vec4(mapped, max(mapped.r, max(mapped.g, mapped.b)));\r
  }\r
  vec4 back = vec4(uBackground.rgb * uBackground.a, uBackground.a);\r
  outColor = color + back * (1.0 - color.a);\r
}\`;\r
\r
const TAU = Math.PI * 2;\r
const MAX_TARGETS = 16;\r
const HISTORY = 4;\r
const FOCAL = 2;\r
const INTRO_SECONDS = 2.2;\r
const MAX_RENDER_DIM = 2560;\r
const BLOOM_LEVELS = 5;\r
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
const spawnTarget = (rng, inward) => {\r
  const angle = rng() * TAU;\r
  const radius = inward ? 0.94 : 0.2 + rng() * 0.68;\r
  const heading = inward ? angle + Math.PI + (rng() - 0.5) * 1.6 : rng() * TAU;\r
  return {\r
    x: Math.sin(angle) * radius,\r
    y: Math.cos(angle) * radius,\r
    heading,\r
    velocity: 0.012 + rng() * 0.03,\r
    turn: (rng() - 0.5) * 0.18\r
  };\r
};\r
\r
export default function Radar({\r
  color = '#3ef09a',\r
  backgroundColor = 'transparent',\r
  mode = 'sweep',\r
  speed = 1,\r
  trail = 0.35,\r
  scale = 0.9,\r
  ringCount = 6,\r
  spokeCount = 12,\r
  ticks = true,\r
  targets = 6,\r
  clutter = 0.35,\r
  glow = 1,\r
  brightness = 1,\r
  gridOpacity = 1,\r
  lineWidth = 1,\r
  tilt = 0,\r
  centerX = 0.5,\r
  centerY = 0.5,\r
  mouseInteraction = true,\r
  intro = true,\r
  grain = 0.03,\r
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
    backgroundColor: String(backgroundColor),\r
    mode: mode === 'pulse' ? 'pulse' : 'sweep',\r
    speed,\r
    trail: clamp(trail, 0.02, 1),\r
    scale: Math.max(0.05, scale),\r
    ringCount: Math.round(clamp(ringCount, 1, 24)),\r
    spokeCount: Math.round(clamp(spokeCount, 0, 72)),\r
    ticks,\r
    targets: Math.round(clamp(targets, 0, MAX_TARGETS)),\r
    clutter: clamp(clutter, 0, 1),\r
    glow: Math.max(0, glow),\r
    brightness: Math.max(0, brightness),\r
    gridOpacity: clamp(gridOpacity, 0, 2),\r
    lineWidth: clamp(lineWidth, 0.25, 4),\r
    tilt: (clamp(tilt, 0, 80) * Math.PI) / 180,\r
    centerX,\r
    centerY,\r
    mouseInteraction,\r
    intro,\r
    grain: Math.max(0, grain),\r
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
    const floatTargets = !!gl.getExtension('EXT_color_buffer_float');\r
    const range = floatTargets ? 1 : 0.25;\r
    const programs = {\r
      scene: link(gl, QUAD_VERTEX, SCENE, ['aPosition']),\r
      sprite: link(gl, SPRITE_VERTEX, SPRITE_FRAGMENT, ['aCorner', 'aSprite', 'aStyle']),\r
      down: link(gl, QUAD_VERTEX, DOWN, ['aPosition']),\r
      up: link(gl, QUAD_VERTEX, UP, ['aPosition']),\r
      composite: link(gl, QUAD_VERTEX, COMPOSITE, ['aPosition'])\r
    };\r
    if (Object.values(programs).some(entry => !entry)) return undefined;\r
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
    const spriteVao = gl.createVertexArray();\r
    gl.bindVertexArray(spriteVao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);\r
    for (let attribute = 1; attribute <= 2; attribute++) {\r
      gl.enableVertexAttribArray(attribute);\r
      gl.vertexAttribPointer(attribute, 4, gl.FLOAT, false, 32, (attribute - 1) * 16);\r
      gl.vertexAttribDivisor(attribute, 1);\r
    }\r
    gl.bindVertexArray(null);\r
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
    const scene = createTarget();\r
    const down = Array.from({ length: BLOOM_LEVELS + 1 }, createTarget);\r
    const up = Array.from({ length: BLOOM_LEVELS }, createTarget);\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const colorCache = new Map();\r
    const parseColor = value => {\r
      if (colorCache.has(value)) return colorCache.get(value);\r
      let rgba = [1, 1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = 'rgba(0, 0, 0, 0)';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b, a] = probe.getImageData(0, 0, 1, 1).data;\r
        rgba = a ? [r / a, g / a, b / a, a / 255] : [0, 0, 0, 0];\r
      }\r
      colorCache.set(value, rgba);\r
      return rgba;\r
    };\r
    const toLinear = value =>\r
      parseColor(value)\r
        .slice(0, 3)\r
        .map(v => Math.pow(v, 2.2));\r
\r
    const rng = seeded(7919);\r
    const contacts = Array.from({ length: MAX_TARGETS }, () => ({ ...spawnTarget(rng, false), echoes: [] }));\r
    const cursor = { x: 0, y: 0, inside: false, echoes: [] };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const view = { width: 1, height: 1, ratio: 1 };\r
    const state = {\r
      time: 0,\r
      sweep: 0,\r
      swept: 0,\r
      cycle: 0,\r
      intro: settingsRef.current.intro && !reduce ? 0 : 1,\r
      heat: 0,\r
      heatVelocity: 0,\r
      heatX: 0,\r
      heatY: 0\r
    };\r
    const instances = new Float32Array(8 * 160);\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const fit = s => (s.scale * Math.min(view.width, view.height)) / view.height;\r
\r
    const camera = s => ({ distance: (2 * FOCAL) / fit(s), focal: FOCAL, tilt: s.tilt });\r
\r
    const toPlane = (s, x, y) => {\r
      const { distance, focal, tilt } = camera(s);\r
      const sx = (x - s.centerX * view.width) / view.height;\r
      const sy = (s.centerY * view.height - y) / view.height;\r
      const ct = Math.cos(tilt);\r
      const st = Math.sin(tilt);\r
      const dx = sx;\r
      const dy = focal * st + sy * ct;\r
      const dz = -focal * ct + sy * st;\r
      if (dz > -0.0001) return null;\r
      const ey = -distance * st;\r
      const ez = distance * ct;\r
      const t = -ez / dz;\r
      return [dx * t, ey + dy * t];\r
    };\r
\r
    const period = s => (s.mode === 'pulse' ? 3.2 : 6);\r
\r
    const advance = (s, dt) => {\r
      const step = dt * Math.abs(s.speed);\r
      const pulse = s.mode === 'pulse';\r
      const span = pulse ? 1.15 : TAU;\r
      const delta = (step / period(s)) * span;\r
      const direction = s.speed < 0 && !pulse ? -1 : 1;\r
      const previous = state.sweep;\r
      state.swept += delta;\r
      const record = contact => {\r
        contact.echoes.unshift({ x: contact.x, y: contact.y, time: state.time });\r
        if (contact.echoes.length > HISTORY) contact.echoes.length = HISTORY;\r
      };\r
      const passed = (x, y) => {\r
        if (pulse) {\r
          const radius = Math.hypot(x, y);\r
          const from = previous;\r
          const to = previous + delta;\r
          return (radius > from && radius <= to) || (to > span && radius <= to - span);\r
        }\r
        const bearing = Math.atan2(x, y);\r
        const gap = (((direction * (bearing - previous)) % TAU) + TAU) % TAU;\r
        return gap > 0 && gap <= delta;\r
      };\r
      for (let i = 0; i < s.targets; i++) {\r
        const contact = contacts[i];\r
        contact.heading += contact.turn * step;\r
        contact.x += Math.sin(contact.heading) * contact.velocity * step;\r
        contact.y += Math.cos(contact.heading) * contact.velocity * step;\r
        if (Math.hypot(contact.x, contact.y) > 0.96) Object.assign(contact, spawnTarget(rng, true));\r
        if (passed(contact.x, contact.y)) record(contact);\r
      }\r
      if (cursor.inside && passed(cursor.x, cursor.y)) record(cursor);\r
      state.sweep += direction * delta;\r
      while (state.sweep >= span) {\r
        state.sweep -= span;\r
        state.cycle += 1;\r
      }\r
      while (state.sweep < 0) {\r
        state.sweep += span;\r
        state.cycle += 1;\r
      }\r
    };\r
\r
    const buildSprites = s => {\r
      const unit = 2 / (fit(s) * view.height);\r
      const persist = (period(s) / Math.max(Math.abs(s.speed), 0.05)) * 1.1;\r
      let count = 0;\r
      const push = (x, y, radius, kind, intensity, core, angle) => {\r
        if (count * 8 + 8 > instances.length) return;\r
        instances.set([x, y, radius, kind, intensity, core, 0, angle], count * 8);\r
        count++;\r
      };\r
      const emit = (contact, strength) => {\r
        contact.echoes.forEach((echo, index) => {\r
          const age = state.time - echo.time;\r
          const fade = Math.exp(-age / persist) * (index === 0 ? 1 : 0.8);\r
          if (fade < 0.01) return;\r
          const angle = -Math.atan2(echo.x, echo.y);\r
          push(\r
            echo.x,\r
            echo.y,\r
            unit * (index === 0 ? 3.4 : 2.4),\r
            0,\r
            fade * strength * 2.2,\r
            index === 0 ? 1 : 0.3,\r
            angle\r
          );\r
          if (index === 0 && age < 1.4) {\r
            const progress = age / 1.4;\r
            const eased = 1 - Math.pow(1 - progress, 3);\r
            push(echo.x, echo.y, unit * (4 + 26 * eased), 1, (1 - progress) * (1 - progress) * strength * 1.4, 0, 0);\r
          }\r
        });\r
      };\r
      for (let i = 0; i < s.targets; i++) emit(contacts[i], 1);\r
      emit(cursor, 1.3);\r
      return count;\r
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
    const setCamera = (entry, s) => {\r
      const u = entry.uniforms;\r
      const { distance, focal, tilt } = camera(s);\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform2f(u.uCenter, s.centerX * canvas.width, (1 - s.centerY) * canvas.height);\r
      gl.uniform1f(u.uViewHeight, canvas.height);\r
      gl.uniform1f(u.uFocal, focal);\r
      gl.uniform1f(u.uDistance, distance);\r
      gl.uniform1f(u.uTilt, tilt);\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const accent = toLinear(s.color);\r
      const presence = state.intro;\r
      sizeTarget(scene, canvas.width, canvas.height);\r
\r
      const sceneProgram = programs.scene;\r
      const u = sceneProgram.uniforms;\r
      gl.useProgram(sceneProgram.program);\r
      setCamera(sceneProgram, s);\r
      gl.uniform1f(u.uMode, s.mode === 'pulse' ? 1 : 0);\r
      gl.uniform1f(u.uSweep, state.sweep);\r
      gl.uniform1f(u.uSwept, Math.min(state.swept, TAU + 1));\r
      gl.uniform1f(u.uDirection, s.speed < 0 && s.mode !== 'pulse' ? -1 : 1);\r
      gl.uniform1f(u.uCycle, state.cycle);\r
      gl.uniform1f(u.uTrail, s.mode === 'pulse' ? s.trail * 0.22 : s.trail * TAU * 0.5);\r
      gl.uniform1f(u.uRings, s.ringCount);\r
      gl.uniform1f(u.uSpokes, s.spokeCount);\r
      gl.uniform1f(u.uTicks, s.ticks ? 1 : 0);\r
      gl.uniform1f(u.uGrid, s.gridOpacity);\r
      gl.uniform1f(u.uLine, s.lineWidth * view.ratio);\r
      gl.uniform1f(u.uClutter, s.clutter * (s.lightMode ? 0.6 : 1));\r
      gl.uniform1f(u.uTime, state.time);\r
      gl.uniform3fv(u.uAccent, accent);\r
      gl.uniform3f(u.uHeat, state.heatX, state.heatY, state.heat);\r
      gl.uniform1f(u.uIntro, presence);\r
      gl.uniform1f(u.uRange, range);\r
      gl.uniform1f(u.uPixel, view.ratio);\r
      gl.bindVertexArray(quadVao);\r
      run(sceneProgram, scene, canvas.width, canvas.height);\r
\r
      const count = buildSprites(s);\r
      if (count > 0) {\r
        const sprite = programs.sprite;\r
        gl.useProgram(sprite.program);\r
        setCamera(sprite, s);\r
        gl.uniform3fv(sprite.uniforms.uAccent, accent);\r
        gl.uniform1f(sprite.uniforms.uRange, range * Math.min(1, presence * 2));\r
        gl.enable(gl.BLEND);\r
        gl.blendFunc(gl.ONE, gl.ONE);\r
        gl.bindVertexArray(spriteVao);\r
        gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);\r
        gl.bufferData(gl.ARRAY_BUFFER, instances.subarray(0, count * 8), gl.DYNAMIC_DRAW);\r
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, count);\r
        gl.disable(gl.BLEND);\r
      }\r
\r
      gl.bindVertexArray(quadVao);\r
      let source = scene;\r
      for (let level = 0; floatTargets && level <= BLOOM_LEVELS; level++) {\r
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
      for (let level = BLOOM_LEVELS - 1; floatTargets && level >= 0; level--) {\r
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
      gl.uniform1f(c.uExposure, (1.5 * s.brightness) / range);\r
      gl.uniform1f(c.uGlow, floatTargets ? s.glow : 0);\r
      gl.uniform1f(c.uGrain, s.grain);\r
      gl.uniform1f(c.uFade, s.fade);\r
      gl.uniform1f(c.uOpacity, s.opacity);\r
      gl.uniform1f(c.uTime, state.time % 1000);\r
      gl.uniform1f(c.uLightMode, s.lightMode ? 1 : 0);\r
      const back = parseColor(s.backgroundColor);\r
      gl.uniform4f(c.uBackground, back[0], back[1], back[2], back[3]);\r
      bindTexture(composite, 'uScene', 0, scene.texture);\r
      bindTexture(composite, 'uBloom', 1, up[0].texture);\r
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
      const plane = s.mouseInteraction && pointer.inside && !reduce ? toPlane(s, pointer.x, pointer.y) : null;\r
      cursor.inside = !!plane && Math.hypot(plane[0], plane[1]) < 0.98;\r
      if (plane) {\r
        cursor.x = plane[0];\r
        cursor.y = plane[1];\r
        state.heatX += (plane[0] - state.heatX) * (1 - Math.exp(-dt * 10));\r
        state.heatY += (plane[1] - state.heatY) * (1 - Math.exp(-dt * 10));\r
      }\r
      const goal = cursor.inside ? 1 : 0;\r
      state.heatVelocity += (120 * (goal - state.heat) - 19 * state.heatVelocity) * dt;\r
      state.heat = clamp(state.heat + state.heatVelocity * dt, 0, 1.2);\r
      if (moving) {\r
        state.time += dt;\r
        const ramp = 0.25 + 0.75 * clamp((state.intro - 0.35) / 0.65, 0, 1);\r
        advance(s, dt * ramp);\r
      }\r
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
      const base = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      const longest = Math.max(width, height) * base;\r
      const ratio = longest > MAX_RENDER_DIM ? (base * MAX_RENDER_DIM) / longest : base;\r
      view.width = width;\r
      view.height = height;\r
      view.ratio = ratio;\r
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
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
    let lastDpr = settingsRef.current.dpr;\r
    wakeRef.current = () => {\r
      if (settingsRef.current.dpr !== lastDpr) {\r
        lastDpr = settingsRef.current.dpr;\r
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
      for (const target of [scene, ...down, ...up]) {\r
        gl.deleteTexture(target.texture);\r
        gl.deleteFramebuffer(target.framebuffer);\r
      }\r
      for (const entry of Object.values(programs)) gl.deleteProgram(entry.program);\r
      gl.deleteBuffer(quadBuffer);\r
      gl.deleteBuffer(cornerBuffer);\r
      gl.deleteBuffer(instanceBuffer);\r
      gl.deleteVertexArray(quadVao);\r
      gl.deleteVertexArray(spriteVao);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div ref={containerRef} className={\`radar-container\${className ? \` \${className}\` : ''}\`} {...rest}>\r
      <canvas ref={canvasRef} className="radar-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
}\r
`,n=`.radar-container {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.radar-canvas {\r
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
const CAMERA = \`\r
uniform vec2 uResolution;\r
uniform vec2 uCenter;\r
uniform float uViewHeight;\r
uniform float uFocal;\r
uniform float uDistance;\r
uniform float uTilt;\r
\`;\r
\r
const SCENE = \`#version 300 es\r
precision highp float;\r
\${CAMERA}\r
uniform float uMode;\r
uniform float uSweep;\r
uniform float uSwept;\r
uniform float uDirection;\r
uniform float uCycle;\r
uniform float uTrail;\r
uniform float uRings;\r
uniform float uSpokes;\r
uniform float uTicks;\r
uniform float uGrid;\r
uniform float uLine;\r
uniform float uClutter;\r
uniform float uTime;\r
uniform vec3 uAccent;\r
uniform vec3 uHeat;\r
uniform float uIntro;\r
uniform float uRange;\r
uniform float uPixel;\r
out vec4 outColor;\r
\r
const float TAU = 6.28318531;\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
float noise(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = fract(p);\r
  vec2 u = f * f * (3.0 - 2.0 * f);\r
  float a = hash(i);\r
  float b = hash(i + vec2(1.0, 0.0));\r
  float c = hash(i + vec2(0.0, 1.0));\r
  float d = hash(i + vec2(1.0, 1.0));\r
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);\r
}\r
\r
float stroke(float distance, float width) {\r
  float w = max(width, 1.0) * 0.5;\r
  return clamp(w + 0.5 - distance, 0.0, 1.0) * min(width, 1.0);\r
}\r
\r
void main() {\r
  vec2 s = (gl_FragCoord.xy - uCenter) / uViewHeight;\r
  float ct = cos(uTilt);\r
  float st = sin(uTilt);\r
  vec3 forward = vec3(0.0, st, -ct);\r
  vec3 up = vec3(0.0, ct, st);\r
  vec3 dir = forward * uFocal + vec3(s.x, 0.0, 0.0) + up * s.y;\r
  vec3 eye = vec3(0.0, -uDistance * st, uDistance * ct);\r
  float hit = -eye.z / min(dir.z, -0.00001);\r
  vec2 p = eye.xy + dir.xy * hit;\r
  float r = length(p);\r
  vec2 dpdx = dFdx(p);\r
  vec2 dpdy = dFdy(p);\r
  if (dir.z > -0.0001 || r > 1.3) {\r
    outColor = vec4(0.0);\r
    return;\r
  }\r
  vec2 radial = p / max(r, 0.00001);\r
  vec2 tangent = vec2(radial.y, -radial.x);\r
  float pxR = max(length(vec2(dot(radial, dpdx), dot(radial, dpdy))), 0.000001);\r
  float pxT = max(length(vec2(dot(tangent, dpdx), dot(tangent, dpdy))), 0.000001);\r
  float bearing = atan(p.x, p.y);\r
  float turn = fract(bearing / TAU + 1.0);\r
  float inside = 1.0 - smoothstep(1.0 - pxR, 1.0 + pxR, r);\r
\r
  float ringCoord = r * uRings;\r
  float ringIndex = clamp(floor(ringCoord + 0.5), 1.0, max(uRings - 1.0, 1.0));\r
  float rings = stroke(abs(ringCoord - ringIndex) / uRings / pxR, uLine) * step(ringIndex, uRings - 0.5);\r
  float arc = clamp(uIntro * (uRings + 3.0) - ringIndex, 0.0, 1.0) * 1.02;\r
  rings *= 1.0 - smoothstep(arc - 0.01, arc, turn);\r
  float outerArc = clamp(uIntro * (uRings + 3.0) - uRings, 0.0, 1.0) * 1.02;\r
  float outer = stroke(abs(r - 1.0) / pxR, uLine * 1.15) * (1.0 - smoothstep(outerArc - 0.01, outerArc, turn));\r
\r
  float tickCoord = turn * 180.0;\r
  float tickIndex = floor(tickCoord + 0.5);\r
  float major = 1.0 - step(0.5, mod(tickIndex, 15.0));\r
  float middle = 1.0 - step(0.5, mod(tickIndex, 5.0));\r
  float tickLength = mix(mix(0.016, 0.03, middle), 0.05, major);\r
  float tickRadial = clamp((r - 1.0) / pxR + 0.5, 0.0, 1.0) * clamp((1.0 + tickLength - r) / pxR + 0.5, 0.0, 1.0);\r
  float spacing = TAU / 180.0 * r / pxT;\r
  float ticks = stroke(abs(tickCoord - tickIndex) / 180.0 * TAU * r / pxT, uLine) * tickRadial;\r
  ticks *= mix(mix(0.42 * smoothstep(2.5, 5.0, spacing), 0.7, middle), 1.0, major) * uTicks;\r
  ticks *= smoothstep(0.55, 0.9, uIntro);\r
\r
  float spokeTotal = max(uSpokes, 1.0);\r
  float spokeCoord = turn * spokeTotal;\r
  float spokeIndex = floor(spokeCoord + 0.5);\r
  float spokes = stroke(abs(spokeCoord - spokeIndex) / spokeTotal * TAU * r / pxT, uLine) * smoothstep(0.05, 0.16, r);\r
  spokes *= inside * step(0.5, uSpokes);\r
  float cardinalCoord = turn * 4.0;\r
  float cardinal = stroke(abs(cardinalCoord - floor(cardinalCoord + 0.5)) / 4.0 * TAU * r / pxT, uLine) * smoothstep(0.02, 0.08, r) * inside;\r
  float hub = stroke(abs(r - 0.022) / pxR, uLine);\r
  float spokesIn = smoothstep(0.35, 0.8, uIntro);\r
  float axisDistance = abs(cardinalCoord - floor(cardinalCoord + 0.5)) / 4.0 * TAU * r / pxT;\r
  float rangeCoord = r * uRings * 5.0;\r
  float rangeMark = stroke(abs(rangeCoord - floor(rangeCoord + 0.5)) / (uRings * 5.0) / pxR, uLine);\r
  rangeMark *= 1.0 - smoothstep(3.0 * uPixel - 0.5, 3.0 * uPixel + 0.5, axisDistance);\r
  rangeMark *= smoothstep(0.06, 0.12, r) * inside;\r
  float bezel = stroke(abs(r - 1.065) / pxR, uLine) * uTicks * smoothstep(0.6, 0.95, uIntro);\r
\r
  float grid = rings * 0.12 + outer * 0.24 + ticks * 0.22 + bezel * 0.08;\r
  grid += (spokes * 0.05 + cardinal * 0.08 + hub * 0.22 + rangeMark * 0.16) * spokesIn;\r
  grid *= uGrid;\r
\r
  float behind;\r
  float edge;\r
  float trail;\r
  float lastPass;\r
  if (uMode < 0.5) {\r
    float ahead = fract((bearing - uSweep) / TAU + 0.5) - 0.5;\r
    behind = fract(uDirection * (uSweep - bearing) / TAU) * TAU;\r
    edge = stroke(abs(ahead) * TAU * r / pxT, uLine * 1.4) * smoothstep(0.0, 0.04, r) * inside;\r
    trail = exp(-behind / uTrail) * (1.0 - smoothstep(uSwept - 0.15, uSwept, behind));\r
    lastPass = floor(uCycle - behind / TAU);\r
  } else {\r
    behind = uSweep - r;\r
    edge = stroke(abs(behind) / pxR, uLine * 1.4) * inside;\r
    trail = behind >= 0.0 ? exp(-behind / uTrail) : 0.0;\r
    lastPass = behind >= 0.0 ? uCycle : uCycle - 1.0;\r
  }\r
  float sweepIn = smoothstep(0.45, 1.0, uIntro);\r
  trail *= inside * sweepIn;\r
  edge *= sweepIn;\r
  float glowTrail = pow(trail, 0.45);\r
\r
  float returns = 0.0;\r
  if (uClutter > 0.0 && trail > 0.004) {\r
    float radialBin = floor(r * 120.0);\r
    float count = max(8.0, floor(radialBin * 5.0));\r
    float angularBin = floor(turn * count);\r
    vec2 drift = vec2(lastPass * 0.173, lastPass * 0.291);\r
    float weather = noise(p * 3.2 + drift) * 0.65 + noise(p * 7.1 - drift) * 0.35;\r
    float cluster = smoothstep(0.5, 0.78, weather);\r
    float density = uClutter * (0.02 + 0.35 * cluster) * (1.0 - smoothstep(0.55, 1.0, r));\r
    vec2 binSeed = vec2(radialBin, angularBin) + lastPass * 17.13;\r
    float speck = step(1.0 - density, hash(binSeed));\r
    vec2 inBin = vec2(fract(r * 120.0), fract(turn * count)) - 0.5;\r
    float shape = 1.0 - smoothstep(0.18, 0.5, length(inBin));\r
    speck *= shape * (0.45 + 0.55 * hash(binSeed + 7.7));\r
    returns = (speck * 1.1 + cluster * 0.16 * uClutter) * trail;\r
  }\r
\r
  float heat = uHeat.z * exp(-dot(p - uHeat.xy, p - uHeat.xy) / 0.035);\r
  float lit = clamp(glowTrail * 0.9 + heat * 0.55, 0.0, 1.0);\r
  vec3 lineColor = mix(vec3(1.0), uAccent, lit);\r
  vec3 light = lineColor * grid * (1.0 + glowTrail * 3.0 + heat * 2.4);\r
  float fill = trail * 0.11 * (0.35 + 0.65 * smoothstep(0.0, 0.6, r));\r
  light += uAccent * (fill + returns * 0.55);\r
  light += mix(uAccent, vec3(1.0), 0.3) * edge * 1.3;\r
  outColor = vec4(light * uRange, 1.0);\r
}\`;\r
\r
const SPRITE_VERTEX = \`#version 300 es\r
in vec2 aCorner;\r
in vec4 aSprite;\r
in vec4 aStyle;\r
\${CAMERA}\r
out vec2 vLocal;\r
out vec4 vStyle;\r
out float vKind;\r
void main() {\r
  float ct = cos(uTilt);\r
  float st = sin(uTilt);\r
  float c = cos(aStyle.w);\r
  float s = sin(aStyle.w);\r
  vec2 local = aCorner * 1.25;\r
  vec2 offset = vec2(c * local.x - s * local.y, s * local.x + c * local.y) * aSprite.z;\r
  vec3 world = vec3(aSprite.xy + offset, 0.0);\r
  vec3 eye = vec3(0.0, -uDistance * st, uDistance * ct);\r
  vec3 rel = world - eye;\r
  float xc = rel.x;\r
  float yc = dot(rel, vec3(0.0, ct, st));\r
  float zc = max(dot(rel, vec3(0.0, st, -ct)), 0.0001);\r
  vec2 center = uCenter / uResolution * 2.0 - 1.0;\r
  gl_Position = vec4(center * zc + 2.0 * uFocal * uViewHeight * vec2(xc, yc) / uResolution, 0.0, zc);\r
  vLocal = local;\r
  vStyle = aStyle;\r
  vKind = aSprite.w;\r
}\`;\r
\r
const SPRITE_FRAGMENT = \`#version 300 es\r
precision highp float;\r
in vec2 vLocal;\r
in vec4 vStyle;\r
in float vKind;\r
uniform vec3 uAccent;\r
uniform float uRange;\r
out vec4 outColor;\r
void main() {\r
  float shape;\r
  vec3 tint;\r
  if (vKind < 0.5) {\r
    float d = length(vLocal * vec2(0.62, 1.0));\r
    float aa = max(fwidth(d), 0.0001);\r
    shape = clamp((1.0 - d) / aa + 0.5, 0.0, 1.0);\r
    shape *= 0.5 + 0.5 * exp(-d * d * 2.5);\r
    tint = mix(uAccent, vec3(1.0), vStyle.y * 0.45 * exp(-d * d * 5.0));\r
  } else {\r
    float d = length(vLocal);\r
    float aa = max(fwidth(d), 0.0001);\r
    shape = clamp(1.0 - abs(d - 1.0) / (aa * 0.75), 0.0, 1.0);\r
    tint = mix(uAccent, vec3(1.0), 0.2);\r
  }\r
  outColor = vec4(tint * shape * vStyle.x * uRange, 1.0);\r
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
  outColor = sum / 12.0 + texture(uBase, uv);\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uScene;\r
uniform sampler2D uBloom;\r
uniform vec2 uResolution;\r
uniform float uExposure;\r
uniform float uGlow;\r
uniform float uGrain;\r
uniform float uFade;\r
uniform float uOpacity;\r
uniform float uTime;\r
uniform float uLightMode;\r
uniform vec4 uBackground;\r
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
  vec3 hdr = texelFetch(uScene, ivec2(gl_FragCoord.xy), 0).rgb * uExposure;\r
  vec3 bloom = texture(uBloom, uv).rgb * uExposure * uGlow * 0.5;\r
  float edge = uFade * 0.5;\r
  float mask = smootherstep(edge, uv.x) * smootherstep(edge, 1.0 - uv.x) * smootherstep(edge, uv.y) * smootherstep(edge, 1.0 - uv.y);\r
  mask *= uOpacity;\r
  float grain = (hash(gl_FragCoord.xy + fract(uTime * 7.31) * 113.0) - 0.5) * uGrain;\r
  vec4 color;\r
  if (uLightMode > 0.5) {\r
    float bloomPeak = max(bloom.r, max(bloom.g, bloom.b));\r
    float bloomLow = min(bloom.r, min(bloom.g, bloom.b));\r
    vec3 total = hdr + bloom * 0.3 * (bloomPeak - bloomLow) / max(bloomPeak, 0.0001);\r
    float peak = max(total.r, max(total.g, total.b));\r
    vec3 hue = total / max(peak, 0.0001);\r
    float tone = dot(hue, vec3(0.2126, 0.7152, 0.0722));\r
    float depth = mix(0.36, 0.09, smoothstep(0.06, 0.7, peak));\r
    vec3 ink = pow(clamp(hue * min(1.0, depth / max(tone, 0.001)), 0.0, 1.0), vec3(1.0 / 2.2));\r
    float alpha = clamp((1.0 - exp(-peak * 2.6)) * (1.0 + grain), 0.0, 1.0) * mask;\r
    color = vec4(ink * alpha, alpha);\r
  } else {\r
    vec3 mapped = 1.0 - exp(-(hdr + bloom));\r
    float level = max(mapped.r, max(mapped.g, mapped.b));\r
    mapped = clamp(mapped + grain * level, 0.0, 1.0) * mask;\r
    color = vec4(mapped, max(mapped.r, max(mapped.g, mapped.b)));\r
  }\r
  vec4 back = vec4(uBackground.rgb * uBackground.a, uBackground.a);\r
  outColor = color + back * (1.0 - color.a);\r
}\`;\r
\r
const TAU = Math.PI * 2;\r
const MAX_TARGETS = 16;\r
const HISTORY = 4;\r
const FOCAL = 2;\r
const INTRO_SECONDS = 2.2;\r
const MAX_RENDER_DIM = 2560;\r
const BLOOM_LEVELS = 5;\r
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
const spawnTarget = (rng, inward) => {\r
  const angle = rng() * TAU;\r
  const radius = inward ? 0.94 : 0.2 + rng() * 0.68;\r
  const heading = inward ? angle + Math.PI + (rng() - 0.5) * 1.6 : rng() * TAU;\r
  return {\r
    x: Math.sin(angle) * radius,\r
    y: Math.cos(angle) * radius,\r
    heading,\r
    velocity: 0.012 + rng() * 0.03,\r
    turn: (rng() - 0.5) * 0.18\r
  };\r
};\r
\r
export default function Radar({\r
  color = '#3ef09a',\r
  backgroundColor = 'transparent',\r
  mode = 'sweep',\r
  speed = 1,\r
  trail = 0.35,\r
  scale = 0.9,\r
  ringCount = 6,\r
  spokeCount = 12,\r
  ticks = true,\r
  targets = 6,\r
  clutter = 0.35,\r
  glow = 1,\r
  brightness = 1,\r
  gridOpacity = 1,\r
  lineWidth = 1,\r
  tilt = 0,\r
  centerX = 0.5,\r
  centerY = 0.5,\r
  mouseInteraction = true,\r
  intro = true,\r
  grain = 0.03,\r
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
    backgroundColor: String(backgroundColor),\r
    mode: mode === 'pulse' ? 'pulse' : 'sweep',\r
    speed,\r
    trail: clamp(trail, 0.02, 1),\r
    scale: Math.max(0.05, scale),\r
    ringCount: Math.round(clamp(ringCount, 1, 24)),\r
    spokeCount: Math.round(clamp(spokeCount, 0, 72)),\r
    ticks,\r
    targets: Math.round(clamp(targets, 0, MAX_TARGETS)),\r
    clutter: clamp(clutter, 0, 1),\r
    glow: Math.max(0, glow),\r
    brightness: Math.max(0, brightness),\r
    gridOpacity: clamp(gridOpacity, 0, 2),\r
    lineWidth: clamp(lineWidth, 0.25, 4),\r
    tilt: (clamp(tilt, 0, 80) * Math.PI) / 180,\r
    centerX,\r
    centerY,\r
    mouseInteraction,\r
    intro,\r
    grain: Math.max(0, grain),\r
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
    const floatTargets = !!gl.getExtension('EXT_color_buffer_float');\r
    const range = floatTargets ? 1 : 0.25;\r
    const programs = {\r
      scene: link(gl, QUAD_VERTEX, SCENE, ['aPosition']),\r
      sprite: link(gl, SPRITE_VERTEX, SPRITE_FRAGMENT, ['aCorner', 'aSprite', 'aStyle']),\r
      down: link(gl, QUAD_VERTEX, DOWN, ['aPosition']),\r
      up: link(gl, QUAD_VERTEX, UP, ['aPosition']),\r
      composite: link(gl, QUAD_VERTEX, COMPOSITE, ['aPosition'])\r
    };\r
    if (Object.values(programs).some(entry => !entry)) return undefined;\r
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
    const spriteVao = gl.createVertexArray();\r
    gl.bindVertexArray(spriteVao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);\r
    for (let attribute = 1; attribute <= 2; attribute++) {\r
      gl.enableVertexAttribArray(attribute);\r
      gl.vertexAttribPointer(attribute, 4, gl.FLOAT, false, 32, (attribute - 1) * 16);\r
      gl.vertexAttribDivisor(attribute, 1);\r
    }\r
    gl.bindVertexArray(null);\r
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
    const scene = createTarget();\r
    const down = Array.from({ length: BLOOM_LEVELS + 1 }, createTarget);\r
    const up = Array.from({ length: BLOOM_LEVELS }, createTarget);\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const colorCache = new Map();\r
    const parseColor = value => {\r
      if (colorCache.has(value)) return colorCache.get(value);\r
      let rgba = [1, 1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = 'rgba(0, 0, 0, 0)';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b, a] = probe.getImageData(0, 0, 1, 1).data;\r
        rgba = a ? [r / a, g / a, b / a, a / 255] : [0, 0, 0, 0];\r
      }\r
      colorCache.set(value, rgba);\r
      return rgba;\r
    };\r
    const toLinear = value =>\r
      parseColor(value)\r
        .slice(0, 3)\r
        .map(v => Math.pow(v, 2.2));\r
\r
    const rng = seeded(7919);\r
    const contacts = Array.from({ length: MAX_TARGETS }, () => ({ ...spawnTarget(rng, false), echoes: [] }));\r
    const cursor = { x: 0, y: 0, inside: false, echoes: [] };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const view = { width: 1, height: 1, ratio: 1 };\r
    const state = {\r
      time: 0,\r
      sweep: 0,\r
      swept: 0,\r
      cycle: 0,\r
      intro: settingsRef.current.intro && !reduce ? 0 : 1,\r
      heat: 0,\r
      heatVelocity: 0,\r
      heatX: 0,\r
      heatY: 0\r
    };\r
    const instances = new Float32Array(8 * 160);\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const fit = s => (s.scale * Math.min(view.width, view.height)) / view.height;\r
\r
    const camera = s => ({ distance: (2 * FOCAL) / fit(s), focal: FOCAL, tilt: s.tilt });\r
\r
    const toPlane = (s, x, y) => {\r
      const { distance, focal, tilt } = camera(s);\r
      const sx = (x - s.centerX * view.width) / view.height;\r
      const sy = (s.centerY * view.height - y) / view.height;\r
      const ct = Math.cos(tilt);\r
      const st = Math.sin(tilt);\r
      const dx = sx;\r
      const dy = focal * st + sy * ct;\r
      const dz = -focal * ct + sy * st;\r
      if (dz > -0.0001) return null;\r
      const ey = -distance * st;\r
      const ez = distance * ct;\r
      const t = -ez / dz;\r
      return [dx * t, ey + dy * t];\r
    };\r
\r
    const period = s => (s.mode === 'pulse' ? 3.2 : 6);\r
\r
    const advance = (s, dt) => {\r
      const step = dt * Math.abs(s.speed);\r
      const pulse = s.mode === 'pulse';\r
      const span = pulse ? 1.15 : TAU;\r
      const delta = (step / period(s)) * span;\r
      const direction = s.speed < 0 && !pulse ? -1 : 1;\r
      const previous = state.sweep;\r
      state.swept += delta;\r
      const record = contact => {\r
        contact.echoes.unshift({ x: contact.x, y: contact.y, time: state.time });\r
        if (contact.echoes.length > HISTORY) contact.echoes.length = HISTORY;\r
      };\r
      const passed = (x, y) => {\r
        if (pulse) {\r
          const radius = Math.hypot(x, y);\r
          const from = previous;\r
          const to = previous + delta;\r
          return (radius > from && radius <= to) || (to > span && radius <= to - span);\r
        }\r
        const bearing = Math.atan2(x, y);\r
        const gap = (((direction * (bearing - previous)) % TAU) + TAU) % TAU;\r
        return gap > 0 && gap <= delta;\r
      };\r
      for (let i = 0; i < s.targets; i++) {\r
        const contact = contacts[i];\r
        contact.heading += contact.turn * step;\r
        contact.x += Math.sin(contact.heading) * contact.velocity * step;\r
        contact.y += Math.cos(contact.heading) * contact.velocity * step;\r
        if (Math.hypot(contact.x, contact.y) > 0.96) Object.assign(contact, spawnTarget(rng, true));\r
        if (passed(contact.x, contact.y)) record(contact);\r
      }\r
      if (cursor.inside && passed(cursor.x, cursor.y)) record(cursor);\r
      state.sweep += direction * delta;\r
      while (state.sweep >= span) {\r
        state.sweep -= span;\r
        state.cycle += 1;\r
      }\r
      while (state.sweep < 0) {\r
        state.sweep += span;\r
        state.cycle += 1;\r
      }\r
    };\r
\r
    const buildSprites = s => {\r
      const unit = 2 / (fit(s) * view.height);\r
      const persist = (period(s) / Math.max(Math.abs(s.speed), 0.05)) * 1.1;\r
      let count = 0;\r
      const push = (x, y, radius, kind, intensity, core, angle) => {\r
        if (count * 8 + 8 > instances.length) return;\r
        instances.set([x, y, radius, kind, intensity, core, 0, angle], count * 8);\r
        count++;\r
      };\r
      const emit = (contact, strength) => {\r
        contact.echoes.forEach((echo, index) => {\r
          const age = state.time - echo.time;\r
          const fade = Math.exp(-age / persist) * (index === 0 ? 1 : 0.8);\r
          if (fade < 0.01) return;\r
          const angle = -Math.atan2(echo.x, echo.y);\r
          push(\r
            echo.x,\r
            echo.y,\r
            unit * (index === 0 ? 3.4 : 2.4),\r
            0,\r
            fade * strength * 2.2,\r
            index === 0 ? 1 : 0.3,\r
            angle\r
          );\r
          if (index === 0 && age < 1.4) {\r
            const progress = age / 1.4;\r
            const eased = 1 - Math.pow(1 - progress, 3);\r
            push(echo.x, echo.y, unit * (4 + 26 * eased), 1, (1 - progress) * (1 - progress) * strength * 1.4, 0, 0);\r
          }\r
        });\r
      };\r
      for (let i = 0; i < s.targets; i++) emit(contacts[i], 1);\r
      emit(cursor, 1.3);\r
      return count;\r
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
    const setCamera = (entry, s) => {\r
      const u = entry.uniforms;\r
      const { distance, focal, tilt } = camera(s);\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform2f(u.uCenter, s.centerX * canvas.width, (1 - s.centerY) * canvas.height);\r
      gl.uniform1f(u.uViewHeight, canvas.height);\r
      gl.uniform1f(u.uFocal, focal);\r
      gl.uniform1f(u.uDistance, distance);\r
      gl.uniform1f(u.uTilt, tilt);\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const accent = toLinear(s.color);\r
      const presence = state.intro;\r
      sizeTarget(scene, canvas.width, canvas.height);\r
\r
      const sceneProgram = programs.scene;\r
      const u = sceneProgram.uniforms;\r
      gl.useProgram(sceneProgram.program);\r
      setCamera(sceneProgram, s);\r
      gl.uniform1f(u.uMode, s.mode === 'pulse' ? 1 : 0);\r
      gl.uniform1f(u.uSweep, state.sweep);\r
      gl.uniform1f(u.uSwept, Math.min(state.swept, TAU + 1));\r
      gl.uniform1f(u.uDirection, s.speed < 0 && s.mode !== 'pulse' ? -1 : 1);\r
      gl.uniform1f(u.uCycle, state.cycle);\r
      gl.uniform1f(u.uTrail, s.mode === 'pulse' ? s.trail * 0.22 : s.trail * TAU * 0.5);\r
      gl.uniform1f(u.uRings, s.ringCount);\r
      gl.uniform1f(u.uSpokes, s.spokeCount);\r
      gl.uniform1f(u.uTicks, s.ticks ? 1 : 0);\r
      gl.uniform1f(u.uGrid, s.gridOpacity);\r
      gl.uniform1f(u.uLine, s.lineWidth * view.ratio);\r
      gl.uniform1f(u.uClutter, s.clutter * (s.lightMode ? 0.6 : 1));\r
      gl.uniform1f(u.uTime, state.time);\r
      gl.uniform3fv(u.uAccent, accent);\r
      gl.uniform3f(u.uHeat, state.heatX, state.heatY, state.heat);\r
      gl.uniform1f(u.uIntro, presence);\r
      gl.uniform1f(u.uRange, range);\r
      gl.uniform1f(u.uPixel, view.ratio);\r
      gl.bindVertexArray(quadVao);\r
      run(sceneProgram, scene, canvas.width, canvas.height);\r
\r
      const count = buildSprites(s);\r
      if (count > 0) {\r
        const sprite = programs.sprite;\r
        gl.useProgram(sprite.program);\r
        setCamera(sprite, s);\r
        gl.uniform3fv(sprite.uniforms.uAccent, accent);\r
        gl.uniform1f(sprite.uniforms.uRange, range * Math.min(1, presence * 2));\r
        gl.enable(gl.BLEND);\r
        gl.blendFunc(gl.ONE, gl.ONE);\r
        gl.bindVertexArray(spriteVao);\r
        gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);\r
        gl.bufferData(gl.ARRAY_BUFFER, instances.subarray(0, count * 8), gl.DYNAMIC_DRAW);\r
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, count);\r
        gl.disable(gl.BLEND);\r
      }\r
\r
      gl.bindVertexArray(quadVao);\r
      let source = scene;\r
      for (let level = 0; floatTargets && level <= BLOOM_LEVELS; level++) {\r
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
      for (let level = BLOOM_LEVELS - 1; floatTargets && level >= 0; level--) {\r
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
      gl.uniform1f(c.uExposure, (1.5 * s.brightness) / range);\r
      gl.uniform1f(c.uGlow, floatTargets ? s.glow : 0);\r
      gl.uniform1f(c.uGrain, s.grain);\r
      gl.uniform1f(c.uFade, s.fade);\r
      gl.uniform1f(c.uOpacity, s.opacity);\r
      gl.uniform1f(c.uTime, state.time % 1000);\r
      gl.uniform1f(c.uLightMode, s.lightMode ? 1 : 0);\r
      const back = parseColor(s.backgroundColor);\r
      gl.uniform4f(c.uBackground, back[0], back[1], back[2], back[3]);\r
      bindTexture(composite, 'uScene', 0, scene.texture);\r
      bindTexture(composite, 'uBloom', 1, up[0].texture);\r
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
      const plane = s.mouseInteraction && pointer.inside && !reduce ? toPlane(s, pointer.x, pointer.y) : null;\r
      cursor.inside = !!plane && Math.hypot(plane[0], plane[1]) < 0.98;\r
      if (plane) {\r
        cursor.x = plane[0];\r
        cursor.y = plane[1];\r
        state.heatX += (plane[0] - state.heatX) * (1 - Math.exp(-dt * 10));\r
        state.heatY += (plane[1] - state.heatY) * (1 - Math.exp(-dt * 10));\r
      }\r
      const goal = cursor.inside ? 1 : 0;\r
      state.heatVelocity += (120 * (goal - state.heat) - 19 * state.heatVelocity) * dt;\r
      state.heat = clamp(state.heat + state.heatVelocity * dt, 0, 1.2);\r
      if (moving) {\r
        state.time += dt;\r
        const ramp = 0.25 + 0.75 * clamp((state.intro - 0.35) / 0.65, 0, 1);\r
        advance(s, dt * ramp);\r
      }\r
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
      const base = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      const longest = Math.max(width, height) * base;\r
      const ratio = longest > MAX_RENDER_DIM ? (base * MAX_RENDER_DIM) / longest : base;\r
      view.width = width;\r
      view.height = height;\r
      view.ratio = ratio;\r
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
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
    let lastDpr = settingsRef.current.dpr;\r
    wakeRef.current = () => {\r
      if (settingsRef.current.dpr !== lastDpr) {\r
        lastDpr = settingsRef.current.dpr;\r
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
      for (const target of [scene, ...down, ...up]) {\r
        gl.deleteTexture(target.texture);\r
        gl.deleteFramebuffer(target.framebuffer);\r
      }\r
      for (const entry of Object.values(programs)) gl.deleteProgram(entry.program);\r
      gl.deleteBuffer(quadBuffer);\r
      gl.deleteBuffer(cornerBuffer);\r
      gl.deleteBuffer(instanceBuffer);\r
      gl.deleteVertexArray(quadVao);\r
      gl.deleteVertexArray(spriteVao);\r
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
import './Radar.css';\r
\r
export type RadarMode = 'sweep' | 'pulse';\r
\r
export interface RadarProps extends HTMLAttributes<HTMLDivElement> {\r
  color?: string;\r
  backgroundColor?: string;\r
  mode?: RadarMode;\r
  speed?: number;\r
  trail?: number;\r
  scale?: number;\r
  ringCount?: number;\r
  spokeCount?: number;\r
  ticks?: boolean;\r
  targets?: number;\r
  clutter?: number;\r
  glow?: number;\r
  brightness?: number;\r
  gridOpacity?: number;\r
  lineWidth?: number;\r
  tilt?: number;\r
  centerX?: number;\r
  centerY?: number;\r
  mouseInteraction?: boolean;\r
  intro?: boolean;\r
  grain?: number;\r
  fade?: number;\r
  opacity?: number;\r
  lightMode?: boolean;\r
  paused?: boolean;\r
  dpr?: number;\r
}\r
\r
type Settings = {\r
  color: string;\r
  backgroundColor: string;\r
  mode: RadarMode;\r
  speed: number;\r
  trail: number;\r
  scale: number;\r
  ringCount: number;\r
  spokeCount: number;\r
  ticks: boolean;\r
  targets: number;\r
  clutter: number;\r
  glow: number;\r
  brightness: number;\r
  gridOpacity: number;\r
  lineWidth: number;\r
  tilt: number;\r
  centerX: number;\r
  centerY: number;\r
  mouseInteraction: boolean;\r
  intro: boolean;\r
  grain: number;\r
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
type Echo = { x: number; y: number; time: number };\r
\r
type Contact = { x: number; y: number; heading: number; velocity: number; turn: number; echoes: Echo[] };\r
\r
const QUAD_VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const CAMERA = \`\r
uniform vec2 uResolution;\r
uniform vec2 uCenter;\r
uniform float uViewHeight;\r
uniform float uFocal;\r
uniform float uDistance;\r
uniform float uTilt;\r
\`;\r
\r
const SCENE = \`#version 300 es\r
precision highp float;\r
\${CAMERA}\r
uniform float uMode;\r
uniform float uSweep;\r
uniform float uSwept;\r
uniform float uDirection;\r
uniform float uCycle;\r
uniform float uTrail;\r
uniform float uRings;\r
uniform float uSpokes;\r
uniform float uTicks;\r
uniform float uGrid;\r
uniform float uLine;\r
uniform float uClutter;\r
uniform float uTime;\r
uniform vec3 uAccent;\r
uniform vec3 uHeat;\r
uniform float uIntro;\r
uniform float uRange;\r
uniform float uPixel;\r
out vec4 outColor;\r
\r
const float TAU = 6.28318531;\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
float noise(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = fract(p);\r
  vec2 u = f * f * (3.0 - 2.0 * f);\r
  float a = hash(i);\r
  float b = hash(i + vec2(1.0, 0.0));\r
  float c = hash(i + vec2(0.0, 1.0));\r
  float d = hash(i + vec2(1.0, 1.0));\r
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);\r
}\r
\r
float stroke(float distance, float width) {\r
  float w = max(width, 1.0) * 0.5;\r
  return clamp(w + 0.5 - distance, 0.0, 1.0) * min(width, 1.0);\r
}\r
\r
void main() {\r
  vec2 s = (gl_FragCoord.xy - uCenter) / uViewHeight;\r
  float ct = cos(uTilt);\r
  float st = sin(uTilt);\r
  vec3 forward = vec3(0.0, st, -ct);\r
  vec3 up = vec3(0.0, ct, st);\r
  vec3 dir = forward * uFocal + vec3(s.x, 0.0, 0.0) + up * s.y;\r
  vec3 eye = vec3(0.0, -uDistance * st, uDistance * ct);\r
  float hit = -eye.z / min(dir.z, -0.00001);\r
  vec2 p = eye.xy + dir.xy * hit;\r
  float r = length(p);\r
  vec2 dpdx = dFdx(p);\r
  vec2 dpdy = dFdy(p);\r
  if (dir.z > -0.0001 || r > 1.3) {\r
    outColor = vec4(0.0);\r
    return;\r
  }\r
  vec2 radial = p / max(r, 0.00001);\r
  vec2 tangent = vec2(radial.y, -radial.x);\r
  float pxR = max(length(vec2(dot(radial, dpdx), dot(radial, dpdy))), 0.000001);\r
  float pxT = max(length(vec2(dot(tangent, dpdx), dot(tangent, dpdy))), 0.000001);\r
  float bearing = atan(p.x, p.y);\r
  float turn = fract(bearing / TAU + 1.0);\r
  float inside = 1.0 - smoothstep(1.0 - pxR, 1.0 + pxR, r);\r
\r
  float ringCoord = r * uRings;\r
  float ringIndex = clamp(floor(ringCoord + 0.5), 1.0, max(uRings - 1.0, 1.0));\r
  float rings = stroke(abs(ringCoord - ringIndex) / uRings / pxR, uLine) * step(ringIndex, uRings - 0.5);\r
  float arc = clamp(uIntro * (uRings + 3.0) - ringIndex, 0.0, 1.0) * 1.02;\r
  rings *= 1.0 - smoothstep(arc - 0.01, arc, turn);\r
  float outerArc = clamp(uIntro * (uRings + 3.0) - uRings, 0.0, 1.0) * 1.02;\r
  float outer = stroke(abs(r - 1.0) / pxR, uLine * 1.15) * (1.0 - smoothstep(outerArc - 0.01, outerArc, turn));\r
\r
  float tickCoord = turn * 180.0;\r
  float tickIndex = floor(tickCoord + 0.5);\r
  float major = 1.0 - step(0.5, mod(tickIndex, 15.0));\r
  float middle = 1.0 - step(0.5, mod(tickIndex, 5.0));\r
  float tickLength = mix(mix(0.016, 0.03, middle), 0.05, major);\r
  float tickRadial = clamp((r - 1.0) / pxR + 0.5, 0.0, 1.0) * clamp((1.0 + tickLength - r) / pxR + 0.5, 0.0, 1.0);\r
  float spacing = TAU / 180.0 * r / pxT;\r
  float ticks = stroke(abs(tickCoord - tickIndex) / 180.0 * TAU * r / pxT, uLine) * tickRadial;\r
  ticks *= mix(mix(0.42 * smoothstep(2.5, 5.0, spacing), 0.7, middle), 1.0, major) * uTicks;\r
  ticks *= smoothstep(0.55, 0.9, uIntro);\r
\r
  float spokeTotal = max(uSpokes, 1.0);\r
  float spokeCoord = turn * spokeTotal;\r
  float spokeIndex = floor(spokeCoord + 0.5);\r
  float spokes = stroke(abs(spokeCoord - spokeIndex) / spokeTotal * TAU * r / pxT, uLine) * smoothstep(0.05, 0.16, r);\r
  spokes *= inside * step(0.5, uSpokes);\r
  float cardinalCoord = turn * 4.0;\r
  float cardinal = stroke(abs(cardinalCoord - floor(cardinalCoord + 0.5)) / 4.0 * TAU * r / pxT, uLine) * smoothstep(0.02, 0.08, r) * inside;\r
  float hub = stroke(abs(r - 0.022) / pxR, uLine);\r
  float spokesIn = smoothstep(0.35, 0.8, uIntro);\r
  float axisDistance = abs(cardinalCoord - floor(cardinalCoord + 0.5)) / 4.0 * TAU * r / pxT;\r
  float rangeCoord = r * uRings * 5.0;\r
  float rangeMark = stroke(abs(rangeCoord - floor(rangeCoord + 0.5)) / (uRings * 5.0) / pxR, uLine);\r
  rangeMark *= 1.0 - smoothstep(3.0 * uPixel - 0.5, 3.0 * uPixel + 0.5, axisDistance);\r
  rangeMark *= smoothstep(0.06, 0.12, r) * inside;\r
  float bezel = stroke(abs(r - 1.065) / pxR, uLine) * uTicks * smoothstep(0.6, 0.95, uIntro);\r
\r
  float grid = rings * 0.12 + outer * 0.24 + ticks * 0.22 + bezel * 0.08;\r
  grid += (spokes * 0.05 + cardinal * 0.08 + hub * 0.22 + rangeMark * 0.16) * spokesIn;\r
  grid *= uGrid;\r
\r
  float behind;\r
  float edge;\r
  float trail;\r
  float lastPass;\r
  if (uMode < 0.5) {\r
    float ahead = fract((bearing - uSweep) / TAU + 0.5) - 0.5;\r
    behind = fract(uDirection * (uSweep - bearing) / TAU) * TAU;\r
    edge = stroke(abs(ahead) * TAU * r / pxT, uLine * 1.4) * smoothstep(0.0, 0.04, r) * inside;\r
    trail = exp(-behind / uTrail) * (1.0 - smoothstep(uSwept - 0.15, uSwept, behind));\r
    lastPass = floor(uCycle - behind / TAU);\r
  } else {\r
    behind = uSweep - r;\r
    edge = stroke(abs(behind) / pxR, uLine * 1.4) * inside;\r
    trail = behind >= 0.0 ? exp(-behind / uTrail) : 0.0;\r
    lastPass = behind >= 0.0 ? uCycle : uCycle - 1.0;\r
  }\r
  float sweepIn = smoothstep(0.45, 1.0, uIntro);\r
  trail *= inside * sweepIn;\r
  edge *= sweepIn;\r
  float glowTrail = pow(trail, 0.45);\r
\r
  float returns = 0.0;\r
  if (uClutter > 0.0 && trail > 0.004) {\r
    float radialBin = floor(r * 120.0);\r
    float count = max(8.0, floor(radialBin * 5.0));\r
    float angularBin = floor(turn * count);\r
    vec2 drift = vec2(lastPass * 0.173, lastPass * 0.291);\r
    float weather = noise(p * 3.2 + drift) * 0.65 + noise(p * 7.1 - drift) * 0.35;\r
    float cluster = smoothstep(0.5, 0.78, weather);\r
    float density = uClutter * (0.02 + 0.35 * cluster) * (1.0 - smoothstep(0.55, 1.0, r));\r
    vec2 binSeed = vec2(radialBin, angularBin) + lastPass * 17.13;\r
    float speck = step(1.0 - density, hash(binSeed));\r
    vec2 inBin = vec2(fract(r * 120.0), fract(turn * count)) - 0.5;\r
    float shape = 1.0 - smoothstep(0.18, 0.5, length(inBin));\r
    speck *= shape * (0.45 + 0.55 * hash(binSeed + 7.7));\r
    returns = (speck * 1.1 + cluster * 0.16 * uClutter) * trail;\r
  }\r
\r
  float heat = uHeat.z * exp(-dot(p - uHeat.xy, p - uHeat.xy) / 0.035);\r
  float lit = clamp(glowTrail * 0.9 + heat * 0.55, 0.0, 1.0);\r
  vec3 lineColor = mix(vec3(1.0), uAccent, lit);\r
  vec3 light = lineColor * grid * (1.0 + glowTrail * 3.0 + heat * 2.4);\r
  float fill = trail * 0.11 * (0.35 + 0.65 * smoothstep(0.0, 0.6, r));\r
  light += uAccent * (fill + returns * 0.55);\r
  light += mix(uAccent, vec3(1.0), 0.3) * edge * 1.3;\r
  outColor = vec4(light * uRange, 1.0);\r
}\`;\r
\r
const SPRITE_VERTEX = \`#version 300 es\r
in vec2 aCorner;\r
in vec4 aSprite;\r
in vec4 aStyle;\r
\${CAMERA}\r
out vec2 vLocal;\r
out vec4 vStyle;\r
out float vKind;\r
void main() {\r
  float ct = cos(uTilt);\r
  float st = sin(uTilt);\r
  float c = cos(aStyle.w);\r
  float s = sin(aStyle.w);\r
  vec2 local = aCorner * 1.25;\r
  vec2 offset = vec2(c * local.x - s * local.y, s * local.x + c * local.y) * aSprite.z;\r
  vec3 world = vec3(aSprite.xy + offset, 0.0);\r
  vec3 eye = vec3(0.0, -uDistance * st, uDistance * ct);\r
  vec3 rel = world - eye;\r
  float xc = rel.x;\r
  float yc = dot(rel, vec3(0.0, ct, st));\r
  float zc = max(dot(rel, vec3(0.0, st, -ct)), 0.0001);\r
  vec2 center = uCenter / uResolution * 2.0 - 1.0;\r
  gl_Position = vec4(center * zc + 2.0 * uFocal * uViewHeight * vec2(xc, yc) / uResolution, 0.0, zc);\r
  vLocal = local;\r
  vStyle = aStyle;\r
  vKind = aSprite.w;\r
}\`;\r
\r
const SPRITE_FRAGMENT = \`#version 300 es\r
precision highp float;\r
in vec2 vLocal;\r
in vec4 vStyle;\r
in float vKind;\r
uniform vec3 uAccent;\r
uniform float uRange;\r
out vec4 outColor;\r
void main() {\r
  float shape;\r
  vec3 tint;\r
  if (vKind < 0.5) {\r
    float d = length(vLocal * vec2(0.62, 1.0));\r
    float aa = max(fwidth(d), 0.0001);\r
    shape = clamp((1.0 - d) / aa + 0.5, 0.0, 1.0);\r
    shape *= 0.5 + 0.5 * exp(-d * d * 2.5);\r
    tint = mix(uAccent, vec3(1.0), vStyle.y * 0.45 * exp(-d * d * 5.0));\r
  } else {\r
    float d = length(vLocal);\r
    float aa = max(fwidth(d), 0.0001);\r
    shape = clamp(1.0 - abs(d - 1.0) / (aa * 0.75), 0.0, 1.0);\r
    tint = mix(uAccent, vec3(1.0), 0.2);\r
  }\r
  outColor = vec4(tint * shape * vStyle.x * uRange, 1.0);\r
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
  outColor = sum / 12.0 + texture(uBase, uv);\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uScene;\r
uniform sampler2D uBloom;\r
uniform vec2 uResolution;\r
uniform float uExposure;\r
uniform float uGlow;\r
uniform float uGrain;\r
uniform float uFade;\r
uniform float uOpacity;\r
uniform float uTime;\r
uniform float uLightMode;\r
uniform vec4 uBackground;\r
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
  vec3 hdr = texelFetch(uScene, ivec2(gl_FragCoord.xy), 0).rgb * uExposure;\r
  vec3 bloom = texture(uBloom, uv).rgb * uExposure * uGlow * 0.5;\r
  float edge = uFade * 0.5;\r
  float mask = smootherstep(edge, uv.x) * smootherstep(edge, 1.0 - uv.x) * smootherstep(edge, uv.y) * smootherstep(edge, 1.0 - uv.y);\r
  mask *= uOpacity;\r
  float grain = (hash(gl_FragCoord.xy + fract(uTime * 7.31) * 113.0) - 0.5) * uGrain;\r
  vec4 color;\r
  if (uLightMode > 0.5) {\r
    float bloomPeak = max(bloom.r, max(bloom.g, bloom.b));\r
    float bloomLow = min(bloom.r, min(bloom.g, bloom.b));\r
    vec3 total = hdr + bloom * 0.3 * (bloomPeak - bloomLow) / max(bloomPeak, 0.0001);\r
    float peak = max(total.r, max(total.g, total.b));\r
    vec3 hue = total / max(peak, 0.0001);\r
    float tone = dot(hue, vec3(0.2126, 0.7152, 0.0722));\r
    float depth = mix(0.36, 0.09, smoothstep(0.06, 0.7, peak));\r
    vec3 ink = pow(clamp(hue * min(1.0, depth / max(tone, 0.001)), 0.0, 1.0), vec3(1.0 / 2.2));\r
    float alpha = clamp((1.0 - exp(-peak * 2.6)) * (1.0 + grain), 0.0, 1.0) * mask;\r
    color = vec4(ink * alpha, alpha);\r
  } else {\r
    vec3 mapped = 1.0 - exp(-(hdr + bloom));\r
    float level = max(mapped.r, max(mapped.g, mapped.b));\r
    mapped = clamp(mapped + grain * level, 0.0, 1.0) * mask;\r
    color = vec4(mapped, max(mapped.r, max(mapped.g, mapped.b)));\r
  }\r
  vec4 back = vec4(uBackground.rgb * uBackground.a, uBackground.a);\r
  outColor = color + back * (1.0 - color.a);\r
}\`;\r
\r
const TAU = Math.PI * 2;\r
const MAX_TARGETS = 16;\r
const HISTORY = 4;\r
const FOCAL = 2;\r
const INTRO_SECONDS = 2.2;\r
const MAX_RENDER_DIM = 2560;\r
const BLOOM_LEVELS = 5;\r
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
const spawnTarget = (rng: () => number, inward: boolean) => {\r
  const angle = rng() * TAU;\r
  const radius = inward ? 0.94 : 0.2 + rng() * 0.68;\r
  const heading = inward ? angle + Math.PI + (rng() - 0.5) * 1.6 : rng() * TAU;\r
  return {\r
    x: Math.sin(angle) * radius,\r
    y: Math.cos(angle) * radius,\r
    heading,\r
    velocity: 0.012 + rng() * 0.03,\r
    turn: (rng() - 0.5) * 0.18\r
  };\r
};\r
\r
export default function Radar({\r
  color = '#3ef09a',\r
  backgroundColor = 'transparent',\r
  mode = 'sweep',\r
  speed = 1,\r
  trail = 0.35,\r
  scale = 0.9,\r
  ringCount = 6,\r
  spokeCount = 12,\r
  ticks = true,\r
  targets = 6,\r
  clutter = 0.35,\r
  glow = 1,\r
  brightness = 1,\r
  gridOpacity = 1,\r
  lineWidth = 1,\r
  tilt = 0,\r
  centerX = 0.5,\r
  centerY = 0.5,\r
  mouseInteraction = true,\r
  intro = true,\r
  grain = 0.03,\r
  fade = 0,\r
  opacity = 1,\r
  lightMode = false,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  ...rest\r
}: RadarProps) {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings: Settings = {\r
    color: String(color),\r
    backgroundColor: String(backgroundColor),\r
    mode: mode === 'pulse' ? 'pulse' : 'sweep',\r
    speed,\r
    trail: clamp(trail, 0.02, 1),\r
    scale: Math.max(0.05, scale),\r
    ringCount: Math.round(clamp(ringCount, 1, 24)),\r
    spokeCount: Math.round(clamp(spokeCount, 0, 72)),\r
    ticks,\r
    targets: Math.round(clamp(targets, 0, MAX_TARGETS)),\r
    clutter: clamp(clutter, 0, 1),\r
    glow: Math.max(0, glow),\r
    brightness: Math.max(0, brightness),\r
    gridOpacity: clamp(gridOpacity, 0, 2),\r
    lineWidth: clamp(lineWidth, 0.25, 4),\r
    tilt: (clamp(tilt, 0, 80) * Math.PI) / 180,\r
    centerX,\r
    centerY,\r
    mouseInteraction,\r
    intro,\r
    grain: Math.max(0, grain),\r
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
    const floatTargets = !!gl.getExtension('EXT_color_buffer_float');\r
    const range = floatTargets ? 1 : 0.25;\r
    const programs = {\r
      scene: link(gl, QUAD_VERTEX, SCENE, ['aPosition']),\r
      sprite: link(gl, SPRITE_VERTEX, SPRITE_FRAGMENT, ['aCorner', 'aSprite', 'aStyle']),\r
      down: link(gl, QUAD_VERTEX, DOWN, ['aPosition']),\r
      up: link(gl, QUAD_VERTEX, UP, ['aPosition']),\r
      composite: link(gl, QUAD_VERTEX, COMPOSITE, ['aPosition'])\r
    } as Record<string, Program>;\r
    if (Object.values(programs).some(entry => !entry)) return undefined;\r
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
    const spriteVao = gl.createVertexArray();\r
    gl.bindVertexArray(spriteVao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);\r
    for (let attribute = 1; attribute <= 2; attribute++) {\r
      gl.enableVertexAttribArray(attribute);\r
      gl.vertexAttribPointer(attribute, 4, gl.FLOAT, false, 32, (attribute - 1) * 16);\r
      gl.vertexAttribDivisor(attribute, 1);\r
    }\r
    gl.bindVertexArray(null);\r
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
    const scene = createTarget();\r
    const down = Array.from({ length: BLOOM_LEVELS + 1 }, createTarget);\r
    const up = Array.from({ length: BLOOM_LEVELS }, createTarget);\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const colorCache = new Map<string, number[]>();\r
    const parseColor = (value: string): number[] => {\r
      const cached = colorCache.get(value);\r
      if (cached) return cached;\r
      let rgba = [1, 1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = 'rgba(0, 0, 0, 0)';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b, a] = probe.getImageData(0, 0, 1, 1).data;\r
        rgba = a ? [r / a, g / a, b / a, a / 255] : [0, 0, 0, 0];\r
      }\r
      colorCache.set(value, rgba);\r
      return rgba;\r
    };\r
    const toLinear = (value: string) =>\r
      parseColor(value)\r
        .slice(0, 3)\r
        .map(v => Math.pow(v, 2.2));\r
\r
    const rng = seeded(7919);\r
    const contacts: Contact[] = Array.from({ length: MAX_TARGETS }, () => ({ ...spawnTarget(rng, false), echoes: [] }));\r
    const cursor = { x: 0, y: 0, inside: false, echoes: [] as Echo[] };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const view = { width: 1, height: 1, ratio: 1 };\r
    const state = {\r
      time: 0,\r
      sweep: 0,\r
      swept: 0,\r
      cycle: 0,\r
      intro: settingsRef.current.intro && !reduce ? 0 : 1,\r
      heat: 0,\r
      heatVelocity: 0,\r
      heatX: 0,\r
      heatY: 0\r
    };\r
    const instances = new Float32Array(8 * 160);\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const fit = (s: Settings) => (s.scale * Math.min(view.width, view.height)) / view.height;\r
\r
    const camera = (s: Settings) => ({ distance: (2 * FOCAL) / fit(s), focal: FOCAL, tilt: s.tilt });\r
\r
    const toPlane = (s: Settings, x: number, y: number): [number, number] | null => {\r
      const { distance, focal, tilt } = camera(s);\r
      const sx = (x - s.centerX * view.width) / view.height;\r
      const sy = (s.centerY * view.height - y) / view.height;\r
      const ct = Math.cos(tilt);\r
      const st = Math.sin(tilt);\r
      const dx = sx;\r
      const dy = focal * st + sy * ct;\r
      const dz = -focal * ct + sy * st;\r
      if (dz > -0.0001) return null;\r
      const ey = -distance * st;\r
      const ez = distance * ct;\r
      const t = -ez / dz;\r
      return [dx * t, ey + dy * t];\r
    };\r
\r
    const period = (s: Settings) => (s.mode === 'pulse' ? 3.2 : 6);\r
\r
    const advance = (s: Settings, dt: number) => {\r
      const step = dt * Math.abs(s.speed);\r
      const pulse = s.mode === 'pulse';\r
      const span = pulse ? 1.15 : TAU;\r
      const delta = (step / period(s)) * span;\r
      const direction = s.speed < 0 && !pulse ? -1 : 1;\r
      const previous = state.sweep;\r
      state.swept += delta;\r
      const record = (contact: { x: number; y: number; echoes: Echo[] }) => {\r
        contact.echoes.unshift({ x: contact.x, y: contact.y, time: state.time });\r
        if (contact.echoes.length > HISTORY) contact.echoes.length = HISTORY;\r
      };\r
      const passed = (x: number, y: number) => {\r
        if (pulse) {\r
          const radius = Math.hypot(x, y);\r
          const from = previous;\r
          const to = previous + delta;\r
          return (radius > from && radius <= to) || (to > span && radius <= to - span);\r
        }\r
        const bearing = Math.atan2(x, y);\r
        const gap = (((direction * (bearing - previous)) % TAU) + TAU) % TAU;\r
        return gap > 0 && gap <= delta;\r
      };\r
      for (let i = 0; i < s.targets; i++) {\r
        const contact = contacts[i];\r
        contact.heading += contact.turn * step;\r
        contact.x += Math.sin(contact.heading) * contact.velocity * step;\r
        contact.y += Math.cos(contact.heading) * contact.velocity * step;\r
        if (Math.hypot(contact.x, contact.y) > 0.96) Object.assign(contact, spawnTarget(rng, true));\r
        if (passed(contact.x, contact.y)) record(contact);\r
      }\r
      if (cursor.inside && passed(cursor.x, cursor.y)) record(cursor);\r
      state.sweep += direction * delta;\r
      while (state.sweep >= span) {\r
        state.sweep -= span;\r
        state.cycle += 1;\r
      }\r
      while (state.sweep < 0) {\r
        state.sweep += span;\r
        state.cycle += 1;\r
      }\r
    };\r
\r
    const buildSprites = (s: Settings) => {\r
      const unit = 2 / (fit(s) * view.height);\r
      const persist = (period(s) / Math.max(Math.abs(s.speed), 0.05)) * 1.1;\r
      let count = 0;\r
      const push = (\r
        x: number,\r
        y: number,\r
        radius: number,\r
        kind: number,\r
        intensity: number,\r
        core: number,\r
        angle: number\r
      ) => {\r
        if (count * 8 + 8 > instances.length) return;\r
        instances.set([x, y, radius, kind, intensity, core, 0, angle], count * 8);\r
        count++;\r
      };\r
      const emit = (contact: { echoes: Echo[] }, strength: number) => {\r
        contact.echoes.forEach((echo, index) => {\r
          const age = state.time - echo.time;\r
          const fade = Math.exp(-age / persist) * (index === 0 ? 1 : 0.8);\r
          if (fade < 0.01) return;\r
          const angle = -Math.atan2(echo.x, echo.y);\r
          push(\r
            echo.x,\r
            echo.y,\r
            unit * (index === 0 ? 3.4 : 2.4),\r
            0,\r
            fade * strength * 2.2,\r
            index === 0 ? 1 : 0.3,\r
            angle\r
          );\r
          if (index === 0 && age < 1.4) {\r
            const progress = age / 1.4;\r
            const eased = 1 - Math.pow(1 - progress, 3);\r
            push(echo.x, echo.y, unit * (4 + 26 * eased), 1, (1 - progress) * (1 - progress) * strength * 1.4, 0, 0);\r
          }\r
        });\r
      };\r
      for (let i = 0; i < s.targets; i++) emit(contacts[i], 1);\r
      emit(cursor, 1.3);\r
      return count;\r
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
    const setCamera = (entry: Program, s: Settings) => {\r
      const u = entry.uniforms;\r
      const { distance, focal, tilt } = camera(s);\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform2f(u.uCenter, s.centerX * canvas.width, (1 - s.centerY) * canvas.height);\r
      gl.uniform1f(u.uViewHeight, canvas.height);\r
      gl.uniform1f(u.uFocal, focal);\r
      gl.uniform1f(u.uDistance, distance);\r
      gl.uniform1f(u.uTilt, tilt);\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const accent = toLinear(s.color);\r
      const presence = state.intro;\r
      sizeTarget(scene, canvas.width, canvas.height);\r
\r
      const sceneProgram = programs.scene;\r
      const u = sceneProgram.uniforms;\r
      gl.useProgram(sceneProgram.program);\r
      setCamera(sceneProgram, s);\r
      gl.uniform1f(u.uMode, s.mode === 'pulse' ? 1 : 0);\r
      gl.uniform1f(u.uSweep, state.sweep);\r
      gl.uniform1f(u.uSwept, Math.min(state.swept, TAU + 1));\r
      gl.uniform1f(u.uDirection, s.speed < 0 && s.mode !== 'pulse' ? -1 : 1);\r
      gl.uniform1f(u.uCycle, state.cycle);\r
      gl.uniform1f(u.uTrail, s.mode === 'pulse' ? s.trail * 0.22 : s.trail * TAU * 0.5);\r
      gl.uniform1f(u.uRings, s.ringCount);\r
      gl.uniform1f(u.uSpokes, s.spokeCount);\r
      gl.uniform1f(u.uTicks, s.ticks ? 1 : 0);\r
      gl.uniform1f(u.uGrid, s.gridOpacity);\r
      gl.uniform1f(u.uLine, s.lineWidth * view.ratio);\r
      gl.uniform1f(u.uClutter, s.clutter * (s.lightMode ? 0.6 : 1));\r
      gl.uniform1f(u.uTime, state.time);\r
      gl.uniform3fv(u.uAccent, accent);\r
      gl.uniform3f(u.uHeat, state.heatX, state.heatY, state.heat);\r
      gl.uniform1f(u.uIntro, presence);\r
      gl.uniform1f(u.uRange, range);\r
      gl.uniform1f(u.uPixel, view.ratio);\r
      gl.bindVertexArray(quadVao);\r
      run(sceneProgram, scene, canvas.width, canvas.height);\r
\r
      const count = buildSprites(s);\r
      if (count > 0) {\r
        const sprite = programs.sprite;\r
        gl.useProgram(sprite.program);\r
        setCamera(sprite, s);\r
        gl.uniform3fv(sprite.uniforms.uAccent, accent);\r
        gl.uniform1f(sprite.uniforms.uRange, range * Math.min(1, presence * 2));\r
        gl.enable(gl.BLEND);\r
        gl.blendFunc(gl.ONE, gl.ONE);\r
        gl.bindVertexArray(spriteVao);\r
        gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);\r
        gl.bufferData(gl.ARRAY_BUFFER, instances.subarray(0, count * 8), gl.DYNAMIC_DRAW);\r
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, count);\r
        gl.disable(gl.BLEND);\r
      }\r
\r
      gl.bindVertexArray(quadVao);\r
      let source = scene;\r
      for (let level = 0; floatTargets && level <= BLOOM_LEVELS; level++) {\r
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
      for (let level = BLOOM_LEVELS - 1; floatTargets && level >= 0; level--) {\r
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
      gl.uniform1f(c.uExposure, (1.5 * s.brightness) / range);\r
      gl.uniform1f(c.uGlow, floatTargets ? s.glow : 0);\r
      gl.uniform1f(c.uGrain, s.grain);\r
      gl.uniform1f(c.uFade, s.fade);\r
      gl.uniform1f(c.uOpacity, s.opacity);\r
      gl.uniform1f(c.uTime, state.time % 1000);\r
      gl.uniform1f(c.uLightMode, s.lightMode ? 1 : 0);\r
      const back = parseColor(s.backgroundColor);\r
      gl.uniform4f(c.uBackground, back[0], back[1], back[2], back[3]);\r
      bindTexture(composite, 'uScene', 0, scene.texture);\r
      bindTexture(composite, 'uBloom', 1, up[0].texture);\r
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
      const plane = s.mouseInteraction && pointer.inside && !reduce ? toPlane(s, pointer.x, pointer.y) : null;\r
      cursor.inside = !!plane && Math.hypot(plane[0], plane[1]) < 0.98;\r
      if (plane) {\r
        cursor.x = plane[0];\r
        cursor.y = plane[1];\r
        state.heatX += (plane[0] - state.heatX) * (1 - Math.exp(-dt * 10));\r
        state.heatY += (plane[1] - state.heatY) * (1 - Math.exp(-dt * 10));\r
      }\r
      const goal = cursor.inside ? 1 : 0;\r
      state.heatVelocity += (120 * (goal - state.heat) - 19 * state.heatVelocity) * dt;\r
      state.heat = clamp(state.heat + state.heatVelocity * dt, 0, 1.2);\r
      if (moving) {\r
        state.time += dt;\r
        const ramp = 0.25 + 0.75 * clamp((state.intro - 0.35) / 0.65, 0, 1);\r
        advance(s, dt * ramp);\r
      }\r
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
      const base = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      const longest = Math.max(width, height) * base;\r
      const ratio = longest > MAX_RENDER_DIM ? (base * MAX_RENDER_DIM) / longest : base;\r
      view.width = width;\r
      view.height = height;\r
      view.ratio = ratio;\r
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
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
    let lastDpr = settingsRef.current.dpr;\r
    wakeRef.current = () => {\r
      if (settingsRef.current.dpr !== lastDpr) {\r
        lastDpr = settingsRef.current.dpr;\r
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
      for (const target of [scene, ...down, ...up]) {\r
        gl.deleteTexture(target.texture);\r
        gl.deleteFramebuffer(target.framebuffer);\r
      }\r
      for (const entry of Object.values(programs)) gl.deleteProgram(entry.program);\r
      gl.deleteBuffer(quadBuffer);\r
      gl.deleteBuffer(cornerBuffer);\r
      gl.deleteBuffer(instanceBuffer);\r
      gl.deleteVertexArray(quadVao);\r
      gl.deleteVertexArray(spriteVao);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div ref={containerRef} className={\`radar-container\${className ? \` \${className}\` : ''}\`} {...rest}>\r
      <canvas ref={canvasRef} className="radar-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
}\r
`,o=`'use client';\r
\r
import { useEffect, useRef, type HTMLAttributes } from 'react';\r
\r
export type RadarMode = 'sweep' | 'pulse';\r
\r
export interface RadarProps extends HTMLAttributes<HTMLDivElement> {\r
  color?: string;\r
  backgroundColor?: string;\r
  mode?: RadarMode;\r
  speed?: number;\r
  trail?: number;\r
  scale?: number;\r
  ringCount?: number;\r
  spokeCount?: number;\r
  ticks?: boolean;\r
  targets?: number;\r
  clutter?: number;\r
  glow?: number;\r
  brightness?: number;\r
  gridOpacity?: number;\r
  lineWidth?: number;\r
  tilt?: number;\r
  centerX?: number;\r
  centerY?: number;\r
  mouseInteraction?: boolean;\r
  intro?: boolean;\r
  grain?: number;\r
  fade?: number;\r
  opacity?: number;\r
  lightMode?: boolean;\r
  paused?: boolean;\r
  dpr?: number;\r
}\r
\r
type Settings = {\r
  color: string;\r
  backgroundColor: string;\r
  mode: RadarMode;\r
  speed: number;\r
  trail: number;\r
  scale: number;\r
  ringCount: number;\r
  spokeCount: number;\r
  ticks: boolean;\r
  targets: number;\r
  clutter: number;\r
  glow: number;\r
  brightness: number;\r
  gridOpacity: number;\r
  lineWidth: number;\r
  tilt: number;\r
  centerX: number;\r
  centerY: number;\r
  mouseInteraction: boolean;\r
  intro: boolean;\r
  grain: number;\r
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
type Echo = { x: number; y: number; time: number };\r
\r
type Contact = { x: number; y: number; heading: number; velocity: number; turn: number; echoes: Echo[] };\r
\r
const QUAD_VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const CAMERA = \`\r
uniform vec2 uResolution;\r
uniform vec2 uCenter;\r
uniform float uViewHeight;\r
uniform float uFocal;\r
uniform float uDistance;\r
uniform float uTilt;\r
\`;\r
\r
const SCENE = \`#version 300 es\r
precision highp float;\r
\${CAMERA}\r
uniform float uMode;\r
uniform float uSweep;\r
uniform float uSwept;\r
uniform float uDirection;\r
uniform float uCycle;\r
uniform float uTrail;\r
uniform float uRings;\r
uniform float uSpokes;\r
uniform float uTicks;\r
uniform float uGrid;\r
uniform float uLine;\r
uniform float uClutter;\r
uniform float uTime;\r
uniform vec3 uAccent;\r
uniform vec3 uHeat;\r
uniform float uIntro;\r
uniform float uRange;\r
uniform float uPixel;\r
out vec4 outColor;\r
\r
const float TAU = 6.28318531;\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
float noise(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = fract(p);\r
  vec2 u = f * f * (3.0 - 2.0 * f);\r
  float a = hash(i);\r
  float b = hash(i + vec2(1.0, 0.0));\r
  float c = hash(i + vec2(0.0, 1.0));\r
  float d = hash(i + vec2(1.0, 1.0));\r
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);\r
}\r
\r
float stroke(float distance, float width) {\r
  float w = max(width, 1.0) * 0.5;\r
  return clamp(w + 0.5 - distance, 0.0, 1.0) * min(width, 1.0);\r
}\r
\r
void main() {\r
  vec2 s = (gl_FragCoord.xy - uCenter) / uViewHeight;\r
  float ct = cos(uTilt);\r
  float st = sin(uTilt);\r
  vec3 forward = vec3(0.0, st, -ct);\r
  vec3 up = vec3(0.0, ct, st);\r
  vec3 dir = forward * uFocal + vec3(s.x, 0.0, 0.0) + up * s.y;\r
  vec3 eye = vec3(0.0, -uDistance * st, uDistance * ct);\r
  float hit = -eye.z / min(dir.z, -0.00001);\r
  vec2 p = eye.xy + dir.xy * hit;\r
  float r = length(p);\r
  vec2 dpdx = dFdx(p);\r
  vec2 dpdy = dFdy(p);\r
  if (dir.z > -0.0001 || r > 1.3) {\r
    outColor = vec4(0.0);\r
    return;\r
  }\r
  vec2 radial = p / max(r, 0.00001);\r
  vec2 tangent = vec2(radial.y, -radial.x);\r
  float pxR = max(length(vec2(dot(radial, dpdx), dot(radial, dpdy))), 0.000001);\r
  float pxT = max(length(vec2(dot(tangent, dpdx), dot(tangent, dpdy))), 0.000001);\r
  float bearing = atan(p.x, p.y);\r
  float turn = fract(bearing / TAU + 1.0);\r
  float inside = 1.0 - smoothstep(1.0 - pxR, 1.0 + pxR, r);\r
\r
  float ringCoord = r * uRings;\r
  float ringIndex = clamp(floor(ringCoord + 0.5), 1.0, max(uRings - 1.0, 1.0));\r
  float rings = stroke(abs(ringCoord - ringIndex) / uRings / pxR, uLine) * step(ringIndex, uRings - 0.5);\r
  float arc = clamp(uIntro * (uRings + 3.0) - ringIndex, 0.0, 1.0) * 1.02;\r
  rings *= 1.0 - smoothstep(arc - 0.01, arc, turn);\r
  float outerArc = clamp(uIntro * (uRings + 3.0) - uRings, 0.0, 1.0) * 1.02;\r
  float outer = stroke(abs(r - 1.0) / pxR, uLine * 1.15) * (1.0 - smoothstep(outerArc - 0.01, outerArc, turn));\r
\r
  float tickCoord = turn * 180.0;\r
  float tickIndex = floor(tickCoord + 0.5);\r
  float major = 1.0 - step(0.5, mod(tickIndex, 15.0));\r
  float middle = 1.0 - step(0.5, mod(tickIndex, 5.0));\r
  float tickLength = mix(mix(0.016, 0.03, middle), 0.05, major);\r
  float tickRadial = clamp((r - 1.0) / pxR + 0.5, 0.0, 1.0) * clamp((1.0 + tickLength - r) / pxR + 0.5, 0.0, 1.0);\r
  float spacing = TAU / 180.0 * r / pxT;\r
  float ticks = stroke(abs(tickCoord - tickIndex) / 180.0 * TAU * r / pxT, uLine) * tickRadial;\r
  ticks *= mix(mix(0.42 * smoothstep(2.5, 5.0, spacing), 0.7, middle), 1.0, major) * uTicks;\r
  ticks *= smoothstep(0.55, 0.9, uIntro);\r
\r
  float spokeTotal = max(uSpokes, 1.0);\r
  float spokeCoord = turn * spokeTotal;\r
  float spokeIndex = floor(spokeCoord + 0.5);\r
  float spokes = stroke(abs(spokeCoord - spokeIndex) / spokeTotal * TAU * r / pxT, uLine) * smoothstep(0.05, 0.16, r);\r
  spokes *= inside * step(0.5, uSpokes);\r
  float cardinalCoord = turn * 4.0;\r
  float cardinal = stroke(abs(cardinalCoord - floor(cardinalCoord + 0.5)) / 4.0 * TAU * r / pxT, uLine) * smoothstep(0.02, 0.08, r) * inside;\r
  float hub = stroke(abs(r - 0.022) / pxR, uLine);\r
  float spokesIn = smoothstep(0.35, 0.8, uIntro);\r
  float axisDistance = abs(cardinalCoord - floor(cardinalCoord + 0.5)) / 4.0 * TAU * r / pxT;\r
  float rangeCoord = r * uRings * 5.0;\r
  float rangeMark = stroke(abs(rangeCoord - floor(rangeCoord + 0.5)) / (uRings * 5.0) / pxR, uLine);\r
  rangeMark *= 1.0 - smoothstep(3.0 * uPixel - 0.5, 3.0 * uPixel + 0.5, axisDistance);\r
  rangeMark *= smoothstep(0.06, 0.12, r) * inside;\r
  float bezel = stroke(abs(r - 1.065) / pxR, uLine) * uTicks * smoothstep(0.6, 0.95, uIntro);\r
\r
  float grid = rings * 0.12 + outer * 0.24 + ticks * 0.22 + bezel * 0.08;\r
  grid += (spokes * 0.05 + cardinal * 0.08 + hub * 0.22 + rangeMark * 0.16) * spokesIn;\r
  grid *= uGrid;\r
\r
  float behind;\r
  float edge;\r
  float trail;\r
  float lastPass;\r
  if (uMode < 0.5) {\r
    float ahead = fract((bearing - uSweep) / TAU + 0.5) - 0.5;\r
    behind = fract(uDirection * (uSweep - bearing) / TAU) * TAU;\r
    edge = stroke(abs(ahead) * TAU * r / pxT, uLine * 1.4) * smoothstep(0.0, 0.04, r) * inside;\r
    trail = exp(-behind / uTrail) * (1.0 - smoothstep(uSwept - 0.15, uSwept, behind));\r
    lastPass = floor(uCycle - behind / TAU);\r
  } else {\r
    behind = uSweep - r;\r
    edge = stroke(abs(behind) / pxR, uLine * 1.4) * inside;\r
    trail = behind >= 0.0 ? exp(-behind / uTrail) : 0.0;\r
    lastPass = behind >= 0.0 ? uCycle : uCycle - 1.0;\r
  }\r
  float sweepIn = smoothstep(0.45, 1.0, uIntro);\r
  trail *= inside * sweepIn;\r
  edge *= sweepIn;\r
  float glowTrail = pow(trail, 0.45);\r
\r
  float returns = 0.0;\r
  if (uClutter > 0.0 && trail > 0.004) {\r
    float radialBin = floor(r * 120.0);\r
    float count = max(8.0, floor(radialBin * 5.0));\r
    float angularBin = floor(turn * count);\r
    vec2 drift = vec2(lastPass * 0.173, lastPass * 0.291);\r
    float weather = noise(p * 3.2 + drift) * 0.65 + noise(p * 7.1 - drift) * 0.35;\r
    float cluster = smoothstep(0.5, 0.78, weather);\r
    float density = uClutter * (0.02 + 0.35 * cluster) * (1.0 - smoothstep(0.55, 1.0, r));\r
    vec2 binSeed = vec2(radialBin, angularBin) + lastPass * 17.13;\r
    float speck = step(1.0 - density, hash(binSeed));\r
    vec2 inBin = vec2(fract(r * 120.0), fract(turn * count)) - 0.5;\r
    float shape = 1.0 - smoothstep(0.18, 0.5, length(inBin));\r
    speck *= shape * (0.45 + 0.55 * hash(binSeed + 7.7));\r
    returns = (speck * 1.1 + cluster * 0.16 * uClutter) * trail;\r
  }\r
\r
  float heat = uHeat.z * exp(-dot(p - uHeat.xy, p - uHeat.xy) / 0.035);\r
  float lit = clamp(glowTrail * 0.9 + heat * 0.55, 0.0, 1.0);\r
  vec3 lineColor = mix(vec3(1.0), uAccent, lit);\r
  vec3 light = lineColor * grid * (1.0 + glowTrail * 3.0 + heat * 2.4);\r
  float fill = trail * 0.11 * (0.35 + 0.65 * smoothstep(0.0, 0.6, r));\r
  light += uAccent * (fill + returns * 0.55);\r
  light += mix(uAccent, vec3(1.0), 0.3) * edge * 1.3;\r
  outColor = vec4(light * uRange, 1.0);\r
}\`;\r
\r
const SPRITE_VERTEX = \`#version 300 es\r
in vec2 aCorner;\r
in vec4 aSprite;\r
in vec4 aStyle;\r
\${CAMERA}\r
out vec2 vLocal;\r
out vec4 vStyle;\r
out float vKind;\r
void main() {\r
  float ct = cos(uTilt);\r
  float st = sin(uTilt);\r
  float c = cos(aStyle.w);\r
  float s = sin(aStyle.w);\r
  vec2 local = aCorner * 1.25;\r
  vec2 offset = vec2(c * local.x - s * local.y, s * local.x + c * local.y) * aSprite.z;\r
  vec3 world = vec3(aSprite.xy + offset, 0.0);\r
  vec3 eye = vec3(0.0, -uDistance * st, uDistance * ct);\r
  vec3 rel = world - eye;\r
  float xc = rel.x;\r
  float yc = dot(rel, vec3(0.0, ct, st));\r
  float zc = max(dot(rel, vec3(0.0, st, -ct)), 0.0001);\r
  vec2 center = uCenter / uResolution * 2.0 - 1.0;\r
  gl_Position = vec4(center * zc + 2.0 * uFocal * uViewHeight * vec2(xc, yc) / uResolution, 0.0, zc);\r
  vLocal = local;\r
  vStyle = aStyle;\r
  vKind = aSprite.w;\r
}\`;\r
\r
const SPRITE_FRAGMENT = \`#version 300 es\r
precision highp float;\r
in vec2 vLocal;\r
in vec4 vStyle;\r
in float vKind;\r
uniform vec3 uAccent;\r
uniform float uRange;\r
out vec4 outColor;\r
void main() {\r
  float shape;\r
  vec3 tint;\r
  if (vKind < 0.5) {\r
    float d = length(vLocal * vec2(0.62, 1.0));\r
    float aa = max(fwidth(d), 0.0001);\r
    shape = clamp((1.0 - d) / aa + 0.5, 0.0, 1.0);\r
    shape *= 0.5 + 0.5 * exp(-d * d * 2.5);\r
    tint = mix(uAccent, vec3(1.0), vStyle.y * 0.45 * exp(-d * d * 5.0));\r
  } else {\r
    float d = length(vLocal);\r
    float aa = max(fwidth(d), 0.0001);\r
    shape = clamp(1.0 - abs(d - 1.0) / (aa * 0.75), 0.0, 1.0);\r
    tint = mix(uAccent, vec3(1.0), 0.2);\r
  }\r
  outColor = vec4(tint * shape * vStyle.x * uRange, 1.0);\r
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
  outColor = sum / 12.0 + texture(uBase, uv);\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uScene;\r
uniform sampler2D uBloom;\r
uniform vec2 uResolution;\r
uniform float uExposure;\r
uniform float uGlow;\r
uniform float uGrain;\r
uniform float uFade;\r
uniform float uOpacity;\r
uniform float uTime;\r
uniform float uLightMode;\r
uniform vec4 uBackground;\r
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
  vec3 hdr = texelFetch(uScene, ivec2(gl_FragCoord.xy), 0).rgb * uExposure;\r
  vec3 bloom = texture(uBloom, uv).rgb * uExposure * uGlow * 0.5;\r
  float edge = uFade * 0.5;\r
  float mask = smootherstep(edge, uv.x) * smootherstep(edge, 1.0 - uv.x) * smootherstep(edge, uv.y) * smootherstep(edge, 1.0 - uv.y);\r
  mask *= uOpacity;\r
  float grain = (hash(gl_FragCoord.xy + fract(uTime * 7.31) * 113.0) - 0.5) * uGrain;\r
  vec4 color;\r
  if (uLightMode > 0.5) {\r
    float bloomPeak = max(bloom.r, max(bloom.g, bloom.b));\r
    float bloomLow = min(bloom.r, min(bloom.g, bloom.b));\r
    vec3 total = hdr + bloom * 0.3 * (bloomPeak - bloomLow) / max(bloomPeak, 0.0001);\r
    float peak = max(total.r, max(total.g, total.b));\r
    vec3 hue = total / max(peak, 0.0001);\r
    float tone = dot(hue, vec3(0.2126, 0.7152, 0.0722));\r
    float depth = mix(0.36, 0.09, smoothstep(0.06, 0.7, peak));\r
    vec3 ink = pow(clamp(hue * min(1.0, depth / max(tone, 0.001)), 0.0, 1.0), vec3(1.0 / 2.2));\r
    float alpha = clamp((1.0 - exp(-peak * 2.6)) * (1.0 + grain), 0.0, 1.0) * mask;\r
    color = vec4(ink * alpha, alpha);\r
  } else {\r
    vec3 mapped = 1.0 - exp(-(hdr + bloom));\r
    float level = max(mapped.r, max(mapped.g, mapped.b));\r
    mapped = clamp(mapped + grain * level, 0.0, 1.0) * mask;\r
    color = vec4(mapped, max(mapped.r, max(mapped.g, mapped.b)));\r
  }\r
  vec4 back = vec4(uBackground.rgb * uBackground.a, uBackground.a);\r
  outColor = color + back * (1.0 - color.a);\r
}\`;\r
\r
const TAU = Math.PI * 2;\r
const MAX_TARGETS = 16;\r
const HISTORY = 4;\r
const FOCAL = 2;\r
const INTRO_SECONDS = 2.2;\r
const MAX_RENDER_DIM = 2560;\r
const BLOOM_LEVELS = 5;\r
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
const spawnTarget = (rng: () => number, inward: boolean) => {\r
  const angle = rng() * TAU;\r
  const radius = inward ? 0.94 : 0.2 + rng() * 0.68;\r
  const heading = inward ? angle + Math.PI + (rng() - 0.5) * 1.6 : rng() * TAU;\r
  return {\r
    x: Math.sin(angle) * radius,\r
    y: Math.cos(angle) * radius,\r
    heading,\r
    velocity: 0.012 + rng() * 0.03,\r
    turn: (rng() - 0.5) * 0.18\r
  };\r
};\r
\r
export default function Radar({\r
  color = '#3ef09a',\r
  backgroundColor = 'transparent',\r
  mode = 'sweep',\r
  speed = 1,\r
  trail = 0.35,\r
  scale = 0.9,\r
  ringCount = 6,\r
  spokeCount = 12,\r
  ticks = true,\r
  targets = 6,\r
  clutter = 0.35,\r
  glow = 1,\r
  brightness = 1,\r
  gridOpacity = 1,\r
  lineWidth = 1,\r
  tilt = 0,\r
  centerX = 0.5,\r
  centerY = 0.5,\r
  mouseInteraction = true,\r
  intro = true,\r
  grain = 0.03,\r
  fade = 0,\r
  opacity = 1,\r
  lightMode = false,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  ...rest\r
}: RadarProps) {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings: Settings = {\r
    color: String(color),\r
    backgroundColor: String(backgroundColor),\r
    mode: mode === 'pulse' ? 'pulse' : 'sweep',\r
    speed,\r
    trail: clamp(trail, 0.02, 1),\r
    scale: Math.max(0.05, scale),\r
    ringCount: Math.round(clamp(ringCount, 1, 24)),\r
    spokeCount: Math.round(clamp(spokeCount, 0, 72)),\r
    ticks,\r
    targets: Math.round(clamp(targets, 0, MAX_TARGETS)),\r
    clutter: clamp(clutter, 0, 1),\r
    glow: Math.max(0, glow),\r
    brightness: Math.max(0, brightness),\r
    gridOpacity: clamp(gridOpacity, 0, 2),\r
    lineWidth: clamp(lineWidth, 0.25, 4),\r
    tilt: (clamp(tilt, 0, 80) * Math.PI) / 180,\r
    centerX,\r
    centerY,\r
    mouseInteraction,\r
    intro,\r
    grain: Math.max(0, grain),\r
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
    const floatTargets = !!gl.getExtension('EXT_color_buffer_float');\r
    const range = floatTargets ? 1 : 0.25;\r
    const programs = {\r
      scene: link(gl, QUAD_VERTEX, SCENE, ['aPosition']),\r
      sprite: link(gl, SPRITE_VERTEX, SPRITE_FRAGMENT, ['aCorner', 'aSprite', 'aStyle']),\r
      down: link(gl, QUAD_VERTEX, DOWN, ['aPosition']),\r
      up: link(gl, QUAD_VERTEX, UP, ['aPosition']),\r
      composite: link(gl, QUAD_VERTEX, COMPOSITE, ['aPosition'])\r
    } as Record<string, Program>;\r
    if (Object.values(programs).some(entry => !entry)) return undefined;\r
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
    const spriteVao = gl.createVertexArray();\r
    gl.bindVertexArray(spriteVao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);\r
    for (let attribute = 1; attribute <= 2; attribute++) {\r
      gl.enableVertexAttribArray(attribute);\r
      gl.vertexAttribPointer(attribute, 4, gl.FLOAT, false, 32, (attribute - 1) * 16);\r
      gl.vertexAttribDivisor(attribute, 1);\r
    }\r
    gl.bindVertexArray(null);\r
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
    const scene = createTarget();\r
    const down = Array.from({ length: BLOOM_LEVELS + 1 }, createTarget);\r
    const up = Array.from({ length: BLOOM_LEVELS }, createTarget);\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const colorCache = new Map<string, number[]>();\r
    const parseColor = (value: string): number[] => {\r
      const cached = colorCache.get(value);\r
      if (cached) return cached;\r
      let rgba = [1, 1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = 'rgba(0, 0, 0, 0)';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b, a] = probe.getImageData(0, 0, 1, 1).data;\r
        rgba = a ? [r / a, g / a, b / a, a / 255] : [0, 0, 0, 0];\r
      }\r
      colorCache.set(value, rgba);\r
      return rgba;\r
    };\r
    const toLinear = (value: string) =>\r
      parseColor(value)\r
        .slice(0, 3)\r
        .map(v => Math.pow(v, 2.2));\r
\r
    const rng = seeded(7919);\r
    const contacts: Contact[] = Array.from({ length: MAX_TARGETS }, () => ({ ...spawnTarget(rng, false), echoes: [] }));\r
    const cursor = { x: 0, y: 0, inside: false, echoes: [] as Echo[] };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const view = { width: 1, height: 1, ratio: 1 };\r
    const state = {\r
      time: 0,\r
      sweep: 0,\r
      swept: 0,\r
      cycle: 0,\r
      intro: settingsRef.current.intro && !reduce ? 0 : 1,\r
      heat: 0,\r
      heatVelocity: 0,\r
      heatX: 0,\r
      heatY: 0\r
    };\r
    const instances = new Float32Array(8 * 160);\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const fit = (s: Settings) => (s.scale * Math.min(view.width, view.height)) / view.height;\r
\r
    const camera = (s: Settings) => ({ distance: (2 * FOCAL) / fit(s), focal: FOCAL, tilt: s.tilt });\r
\r
    const toPlane = (s: Settings, x: number, y: number): [number, number] | null => {\r
      const { distance, focal, tilt } = camera(s);\r
      const sx = (x - s.centerX * view.width) / view.height;\r
      const sy = (s.centerY * view.height - y) / view.height;\r
      const ct = Math.cos(tilt);\r
      const st = Math.sin(tilt);\r
      const dx = sx;\r
      const dy = focal * st + sy * ct;\r
      const dz = -focal * ct + sy * st;\r
      if (dz > -0.0001) return null;\r
      const ey = -distance * st;\r
      const ez = distance * ct;\r
      const t = -ez / dz;\r
      return [dx * t, ey + dy * t];\r
    };\r
\r
    const period = (s: Settings) => (s.mode === 'pulse' ? 3.2 : 6);\r
\r
    const advance = (s: Settings, dt: number) => {\r
      const step = dt * Math.abs(s.speed);\r
      const pulse = s.mode === 'pulse';\r
      const span = pulse ? 1.15 : TAU;\r
      const delta = (step / period(s)) * span;\r
      const direction = s.speed < 0 && !pulse ? -1 : 1;\r
      const previous = state.sweep;\r
      state.swept += delta;\r
      const record = (contact: { x: number; y: number; echoes: Echo[] }) => {\r
        contact.echoes.unshift({ x: contact.x, y: contact.y, time: state.time });\r
        if (contact.echoes.length > HISTORY) contact.echoes.length = HISTORY;\r
      };\r
      const passed = (x: number, y: number) => {\r
        if (pulse) {\r
          const radius = Math.hypot(x, y);\r
          const from = previous;\r
          const to = previous + delta;\r
          return (radius > from && radius <= to) || (to > span && radius <= to - span);\r
        }\r
        const bearing = Math.atan2(x, y);\r
        const gap = (((direction * (bearing - previous)) % TAU) + TAU) % TAU;\r
        return gap > 0 && gap <= delta;\r
      };\r
      for (let i = 0; i < s.targets; i++) {\r
        const contact = contacts[i];\r
        contact.heading += contact.turn * step;\r
        contact.x += Math.sin(contact.heading) * contact.velocity * step;\r
        contact.y += Math.cos(contact.heading) * contact.velocity * step;\r
        if (Math.hypot(contact.x, contact.y) > 0.96) Object.assign(contact, spawnTarget(rng, true));\r
        if (passed(contact.x, contact.y)) record(contact);\r
      }\r
      if (cursor.inside && passed(cursor.x, cursor.y)) record(cursor);\r
      state.sweep += direction * delta;\r
      while (state.sweep >= span) {\r
        state.sweep -= span;\r
        state.cycle += 1;\r
      }\r
      while (state.sweep < 0) {\r
        state.sweep += span;\r
        state.cycle += 1;\r
      }\r
    };\r
\r
    const buildSprites = (s: Settings) => {\r
      const unit = 2 / (fit(s) * view.height);\r
      const persist = (period(s) / Math.max(Math.abs(s.speed), 0.05)) * 1.1;\r
      let count = 0;\r
      const push = (\r
        x: number,\r
        y: number,\r
        radius: number,\r
        kind: number,\r
        intensity: number,\r
        core: number,\r
        angle: number\r
      ) => {\r
        if (count * 8 + 8 > instances.length) return;\r
        instances.set([x, y, radius, kind, intensity, core, 0, angle], count * 8);\r
        count++;\r
      };\r
      const emit = (contact: { echoes: Echo[] }, strength: number) => {\r
        contact.echoes.forEach((echo, index) => {\r
          const age = state.time - echo.time;\r
          const fade = Math.exp(-age / persist) * (index === 0 ? 1 : 0.8);\r
          if (fade < 0.01) return;\r
          const angle = -Math.atan2(echo.x, echo.y);\r
          push(\r
            echo.x,\r
            echo.y,\r
            unit * (index === 0 ? 3.4 : 2.4),\r
            0,\r
            fade * strength * 2.2,\r
            index === 0 ? 1 : 0.3,\r
            angle\r
          );\r
          if (index === 0 && age < 1.4) {\r
            const progress = age / 1.4;\r
            const eased = 1 - Math.pow(1 - progress, 3);\r
            push(echo.x, echo.y, unit * (4 + 26 * eased), 1, (1 - progress) * (1 - progress) * strength * 1.4, 0, 0);\r
          }\r
        });\r
      };\r
      for (let i = 0; i < s.targets; i++) emit(contacts[i], 1);\r
      emit(cursor, 1.3);\r
      return count;\r
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
    const setCamera = (entry: Program, s: Settings) => {\r
      const u = entry.uniforms;\r
      const { distance, focal, tilt } = camera(s);\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform2f(u.uCenter, s.centerX * canvas.width, (1 - s.centerY) * canvas.height);\r
      gl.uniform1f(u.uViewHeight, canvas.height);\r
      gl.uniform1f(u.uFocal, focal);\r
      gl.uniform1f(u.uDistance, distance);\r
      gl.uniform1f(u.uTilt, tilt);\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const accent = toLinear(s.color);\r
      const presence = state.intro;\r
      sizeTarget(scene, canvas.width, canvas.height);\r
\r
      const sceneProgram = programs.scene;\r
      const u = sceneProgram.uniforms;\r
      gl.useProgram(sceneProgram.program);\r
      setCamera(sceneProgram, s);\r
      gl.uniform1f(u.uMode, s.mode === 'pulse' ? 1 : 0);\r
      gl.uniform1f(u.uSweep, state.sweep);\r
      gl.uniform1f(u.uSwept, Math.min(state.swept, TAU + 1));\r
      gl.uniform1f(u.uDirection, s.speed < 0 && s.mode !== 'pulse' ? -1 : 1);\r
      gl.uniform1f(u.uCycle, state.cycle);\r
      gl.uniform1f(u.uTrail, s.mode === 'pulse' ? s.trail * 0.22 : s.trail * TAU * 0.5);\r
      gl.uniform1f(u.uRings, s.ringCount);\r
      gl.uniform1f(u.uSpokes, s.spokeCount);\r
      gl.uniform1f(u.uTicks, s.ticks ? 1 : 0);\r
      gl.uniform1f(u.uGrid, s.gridOpacity);\r
      gl.uniform1f(u.uLine, s.lineWidth * view.ratio);\r
      gl.uniform1f(u.uClutter, s.clutter * (s.lightMode ? 0.6 : 1));\r
      gl.uniform1f(u.uTime, state.time);\r
      gl.uniform3fv(u.uAccent, accent);\r
      gl.uniform3f(u.uHeat, state.heatX, state.heatY, state.heat);\r
      gl.uniform1f(u.uIntro, presence);\r
      gl.uniform1f(u.uRange, range);\r
      gl.uniform1f(u.uPixel, view.ratio);\r
      gl.bindVertexArray(quadVao);\r
      run(sceneProgram, scene, canvas.width, canvas.height);\r
\r
      const count = buildSprites(s);\r
      if (count > 0) {\r
        const sprite = programs.sprite;\r
        gl.useProgram(sprite.program);\r
        setCamera(sprite, s);\r
        gl.uniform3fv(sprite.uniforms.uAccent, accent);\r
        gl.uniform1f(sprite.uniforms.uRange, range * Math.min(1, presence * 2));\r
        gl.enable(gl.BLEND);\r
        gl.blendFunc(gl.ONE, gl.ONE);\r
        gl.bindVertexArray(spriteVao);\r
        gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);\r
        gl.bufferData(gl.ARRAY_BUFFER, instances.subarray(0, count * 8), gl.DYNAMIC_DRAW);\r
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, count);\r
        gl.disable(gl.BLEND);\r
      }\r
\r
      gl.bindVertexArray(quadVao);\r
      let source = scene;\r
      for (let level = 0; floatTargets && level <= BLOOM_LEVELS; level++) {\r
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
      for (let level = BLOOM_LEVELS - 1; floatTargets && level >= 0; level--) {\r
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
      gl.uniform1f(c.uExposure, (1.5 * s.brightness) / range);\r
      gl.uniform1f(c.uGlow, floatTargets ? s.glow : 0);\r
      gl.uniform1f(c.uGrain, s.grain);\r
      gl.uniform1f(c.uFade, s.fade);\r
      gl.uniform1f(c.uOpacity, s.opacity);\r
      gl.uniform1f(c.uTime, state.time % 1000);\r
      gl.uniform1f(c.uLightMode, s.lightMode ? 1 : 0);\r
      const back = parseColor(s.backgroundColor);\r
      gl.uniform4f(c.uBackground, back[0], back[1], back[2], back[3]);\r
      bindTexture(composite, 'uScene', 0, scene.texture);\r
      bindTexture(composite, 'uBloom', 1, up[0].texture);\r
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
      const plane = s.mouseInteraction && pointer.inside && !reduce ? toPlane(s, pointer.x, pointer.y) : null;\r
      cursor.inside = !!plane && Math.hypot(plane[0], plane[1]) < 0.98;\r
      if (plane) {\r
        cursor.x = plane[0];\r
        cursor.y = plane[1];\r
        state.heatX += (plane[0] - state.heatX) * (1 - Math.exp(-dt * 10));\r
        state.heatY += (plane[1] - state.heatY) * (1 - Math.exp(-dt * 10));\r
      }\r
      const goal = cursor.inside ? 1 : 0;\r
      state.heatVelocity += (120 * (goal - state.heat) - 19 * state.heatVelocity) * dt;\r
      state.heat = clamp(state.heat + state.heatVelocity * dt, 0, 1.2);\r
      if (moving) {\r
        state.time += dt;\r
        const ramp = 0.25 + 0.75 * clamp((state.intro - 0.35) / 0.65, 0, 1);\r
        advance(s, dt * ramp);\r
      }\r
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
      const base = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      const longest = Math.max(width, height) * base;\r
      const ratio = longest > MAX_RENDER_DIM ? (base * MAX_RENDER_DIM) / longest : base;\r
      view.width = width;\r
      view.height = height;\r
      view.ratio = ratio;\r
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
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
    let lastDpr = settingsRef.current.dpr;\r
    wakeRef.current = () => {\r
      if (settingsRef.current.dpr !== lastDpr) {\r
        lastDpr = settingsRef.current.dpr;\r
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
      for (const target of [scene, ...down, ...up]) {\r
        gl.deleteTexture(target.texture);\r
        gl.deleteFramebuffer(target.framebuffer);\r
      }\r
      for (const entry of Object.values(programs)) gl.deleteProgram(entry.program);\r
      gl.deleteBuffer(quadBuffer);\r
      gl.deleteBuffer(cornerBuffer);\r
      gl.deleteBuffer(instanceBuffer);\r
      gl.deleteVertexArray(quadVao);\r
      gl.deleteVertexArray(spriteVao);\r
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
`,a={usage:`import Radar from './Radar';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <Radar
    color="#3ef09a"
    mode="sweep"
    speed={1}
    trail={0.35}
    scale={0.9}
    ringCount={6}
    spokeCount={12}
    targets={6}
    clutter={0.35}
    mouseInteraction={true}
  />
</div>`,code:r,css:n,tailwind:e,tsCode:t,tsTailwind:o};export{a as radar};
