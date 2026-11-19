const r=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
import './GhostFibers.css';\r
\r
const MAX_RENDER_DIM = 2400;\r
const BLOOM_LEVELS = 5;\r
const INTRO_SECONDS = 2.6;\r
const CAMERA = 7.5;\r
const FOV = 0.56;\r
const RIBBON_LENGTH = 24;\r
const HOVER_EFFECTS = { focus: 0, part: 1, none: 2 };\r
const FIBER_STYLES = { dots: 0, dashes: 0.45, lines: 1 };\r
const GRADIENTS = { depth: 0, along: 1, across: 2 };\r
const RIBBON_TINT = [0, 0.75, 0.35];\r
const PLACEMENTS = [\r
  [0, 0, 0, 0],\r
  [1.9, -4.6, -0.08, 2.4],\r
  [-1.05, 2.0, 0.12, 4.1]\r
];\r
const RIBBON_GAIN = [1, 0.5, 0.55];\r
const DEG = Math.PI / 180;\r
const FOCAL = 1 / (2 * Math.tan(FOV / 2));\r
\r
const HEADER = \`#version 300 es\r
precision highp float;\r
\`;\r
\r
const SHAPE = \`\r
uniform float uTime;\r
uniform float uTwist;\r
uniform float uRoll;\r
uniform float uWaves;\r
uniform float uWidth;\r
uniform float uRibbon;\r
uniform mat3 uOrient;\r
uniform float uScale;\r
uniform vec4 uPlace;\r
uniform float uVolume;\r
\r
float hash11(float n) {\r
  return fract(sin(n * 91.3458) * 47453.5453);\r
}\r
\r
vec3 centerLocal(float s) {\r
  float t = uTime;\r
  float ph = uPlace.w;\r
  float x = s * \${RIBBON_LENGTH.toFixed(1)};\r
  float y = uWaves * (0.52 * sin(x * 0.43 + t * 0.31 + ph) + 0.26 * sin(x * 0.79 - t * 0.23 + 1.3 + ph * 0.7)) + uPlace.x + x * uPlace.z;\r
  float z = uWaves * 0.65 * sin(x * 0.33 + t * 0.19 + 0.7 + ph * 1.3) + uPlace.y;\r
  return vec3(x, y, z);\r
}\r
\r
float twistAt(float s, float layer) {\r
  float x = s * \${RIBBON_LENGTH.toFixed(1)};\r
  return uTwist * 0.483 * x + uRoll + uPlace.w * 0.6 + layer * uVolume * 0.42 + 0.5 * sin(x * 0.26 + uTime * 0.27 + uPlace.w);\r
}\r
\r
vec3 ribbonPoint(float s, float v, float n, float layer, out vec3 normal) {\r
  vec3 c0 = centerLocal(s);\r
  vec3 c1 = centerLocal(s + 0.004);\r
  vec3 tangent = normalize(c1 - c0);\r
  vec3 up = vec3(0.0, 1.0, 0.0);\r
  vec3 n0 = normalize(up - tangent * dot(up, tangent));\r
  vec3 b0 = cross(tangent, n0);\r
  float th = twistAt(s, layer);\r
  vec3 across = cos(th) * n0 + sin(th) * b0;\r
  vec3 sheet = -sin(th) * n0 + cos(th) * b0;\r
  float halfWidth = uWidth * (0.78 + 0.22 * cos(s * 3.14159));\r
  vec3 local = c0 + across * v * halfWidth + sheet * (n + layer * uVolume * 0.16) * halfWidth;\r
  normal = uOrient * sheet;\r
  return uOrient * (local * uScale);\r
}\r
\`;\r
\r
const DOT_VERTEX = \`\${HEADER}\r
\${SHAPE}\r
uniform mat4 uViewProj;\r
uniform vec3 uEye;\r
uniform vec2 uViewport;\r
uniform float uDpr;\r
uniform float uFibers;\r
uniform float uDots;\r
uniform float uFlow;\r
uniform float uSize;\r
uniform float uFocus;\r
uniform float uDof;\r
uniform float uMaxCoc;\r
uniform float uFocal;\r
uniform float uIntro;\r
uniform vec4 uPulse;\r
uniform vec4 uHover;\r
uniform float uPart;\r
uniform float uDotLength;\r
uniform float uSparkle;\r
uniform float uDepthSpread;\r
uniform float uGain;\r
uniform float uTips;\r
uniform float uTint;\r
uniform float uGradient;\r
uniform float uFold;\r
\r
out vec2 vLocal;\r
out float vRadius;\r
out float vSegment;\r
out vec3 vLight;\r
out float vTint;\r
\r
vec3 project(vec3 world, out float depth) {\r
  vec4 clip = uViewProj * vec4(world, 1.0);\r
  depth = clip.w;\r
  vec2 ndc = clip.xy / clip.w;\r
  return vec3((ndc * 0.5 + 0.5) * uViewport, clip.w);\r
}\r
\r
vec2 part(vec2 px) {\r
  if (uPart <= 0.0 || uHover.w <= 0.0) return px;\r
  vec2 away = px - uHover.xy;\r
  float dist = length(away);\r
  float radius = uHover.z;\r
  float push = uPart * uHover.w * radius * 0.55 * exp(-dist * dist / (radius * radius));\r
  return px + away / max(dist, 1e-3) * push * smoothstep(0.0, radius * 0.25, dist);\r
}\r
\r
void main() {\r
  int perFiber = int(uDots);\r
  int fiber = gl_InstanceID / perFiber;\r
  int bead = gl_InstanceID - fiber * perFiber;\r
  float fi = float(fiber);\r
  float fk = float(bead);\r
\r
  float seed = hash11(fi * 1.731 + uRibbon * 17.0);\r
  float s = fract((fk + uFlow + seed * uDots) / uDots) - 0.5;\r
  float sNext = s + 1.0 / uDots;\r
  float layer = mod(fi, 3.0) - 1.0;\r
  float slot = floor(fi / 3.0);\r
  float perLayer = max(floor(uFibers / 3.0), 1.0);\r
  float v = ((slot + 0.5) / perLayer) * 2.0 - 1.0 + (hash11(fi * 3.113 + 4.0) - 0.5) * (1.6 / perLayer) + layer * 0.12 / perLayer;\r
  float depthOffset = (hash11(fi * 7.919 + 2.0) - 0.5) * uDepthSpread * (0.35 + 6.0 * s * s);\r
\r
  vec3 normal;\r
  vec3 world = ribbonPoint(s, v, depthOffset, layer, normal);\r
  vec3 nextNormal;\r
  vec3 nextWorld = ribbonPoint(sNext, v, depthOffset, layer, nextNormal);\r
\r
  float depth;\r
  vec3 p0 = project(world, depth);\r
  float nextDepth;\r
  vec3 p1 = project(nextWorld, nextDepth);\r
  vec2 px = part(p0.xy);\r
  vec2 pxNext = part(p1.xy);\r
\r
  float baseRadius = max(0.5 * uSize * uDpr * uFocal / max(depth, 0.1), 0.45);\r
  float coc = min(uDof * abs(1.0 - uFocus / max(depth, 0.1)) * uViewport.y * 0.035, uMaxCoc * uDpr);\r
  float radius = baseRadius + coc;\r
  float spill = max(10.0 * uDpr, baseRadius);\r
  float energy = pow(baseRadius / min(radius, spill), 1.25) * pow(min(1.0, spill / radius), 2.0);\r
\r
  vec3 toEye = normalize(uEye - world);\r
  float facing = abs(dot(normalize(normal), toEye));\r
  float focalPx = uViewport.y * \${FOCAL.toFixed(5)} / max(depth, 0.1);\r
  float widthPx = 2.0 * uWidth * uScale * focalPx;\r
  float stack = (widthPx * facing + 2.0 * baseRadius) / (widthPx + 2.0 * baseRadius);\r
  float spacingFace = length(nextWorld - world) * focalPx;\r
  float trail = (length(p1.xy - p0.xy) + 2.0 * baseRadius) / (spacingFace + 2.0 * baseRadius);\r
  float crowd = sqrt(clamp(stack * trail, 0.002, 1.0));\r
  float fold = pow(1.0 - facing, 6.0) * uFold;\r
  float endFade = smoothstep(0.5, 0.4, abs(s)) * smoothstep(1.6, 4.2, depth);\r
  float tipEnd = mix(0.6, 0.06 + 0.26 * hash11(fi * 9.137 + uPlace.w * 3.0), uTips);\r
  float tip = exp(-pow((s - tipEnd) / 0.0065, 2.0)) * uTips;\r
  endFade *= smoothstep(tipEnd + 0.003, tipEnd - 0.001, s);\r
  float appear = smoothstep(0.0, 0.12, uIntro * 1.3 - (s + 0.5) - seed * 0.12);\r
  float twinklePhase = hash11(fi * 13.7 + fk * 0.917 + uRibbon * 3.0);\r
  float twinkle = pow(max(sin(uTime * (1.2 + 2.6 * twinklePhase) * 3.0 + twinklePhase * 61.0), 0.0), 36.0) * uSparkle * (1.0 - 0.85 * uDotLength);\r
  float pulseGap = abs(s - uPulse.x) - uPulse.y * 0.42;\r
  float pulse = uPulse.z * exp(-pulseGap * pulseGap / 0.0018) * (abs(uPulse.w - uRibbon) < 0.5 ? 1.0 : 0.35);\r
  float strength = mix(0.45, 1.0, hash11(fi * 5.37 + 1.0)) * mix(1.0, 0.72, abs(layer) * uVolume);\r
  float intensity = energy * crowd * strength * endFade * appear * 0.8 * uGain * (1.0 + fold * 7.0 + twinkle * 5.0 + pulse * 4.0 + tip * 7.0);\r
  float highlight = clamp(fold * 0.55 + twinkle + pulse + tip, 0.0, 1.0);\r
\r
  vec2 segment = (pxNext - px) * uDotLength;\r
  float segmentLength = length(segment);\r
  intensity *= mix(1.0, (2.0 * radius) / (segmentLength + 2.0 * radius) * 1.6, uDotLength);\r
  vec2 axis = segmentLength > 1e-3 ? segment / segmentLength : vec2(1.0, 0.0);\r
  vec2 perp = vec2(-axis.y, axis.x);\r
  vec2 corner = vec2(gl_VertexID == 1 || gl_VertexID == 3 ? 1.0 : 0.0, gl_VertexID >= 2 ? 1.0 : 0.0);\r
  float along = mix(-radius, segmentLength + radius, corner.x);\r
  float across = mix(-radius, radius, corner.y);\r
  vec2 position = px + axis * along + perp * across;\r
\r
  vLocal = vec2(along, across);\r
  vRadius = radius;\r
  vSegment = segmentLength;\r
  vLight = vec3(intensity, highlight, coc / max(radius, 1e-3));\r
  float depthTint = clamp(uTint + smoothstep(uFocus, uFocus + 5.0, depth) * 0.5, 0.0, 1.0);\r
  vTint = uGradient < 0.5 ? depthTint : uGradient < 1.5 ? smoothstep(-0.42, 0.42, s) : clamp(v * 0.5 + 0.5, 0.0, 1.0);\r
  if (intensity < 0.0005) position = vec2(-1e4);\r
  gl_Position = vec4(position / uViewport * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const DUST_VERTEX = \`\${HEADER}\r
uniform mat4 uViewProj;\r
uniform vec2 uViewport;\r
uniform float uDpr;\r
uniform float uTime;\r
uniform float uSize;\r
uniform float uFocus;\r
uniform float uDof;\r
uniform float uMaxCoc;\r
uniform float uFocal;\r
uniform float uIntro;\r
uniform float uSparkle;\r
uniform float uScale;\r
uniform float uGradient;\r
uniform float uGain;\r
\r
out vec2 vLocal;\r
out float vRadius;\r
out float vSegment;\r
out vec3 vLight;\r
out float vTint;\r
\r
float hash11(float n) {\r
  return fract(sin(n * 91.3458) * 47453.5453);\r
}\r
\r
void main() {\r
  float id = float(gl_InstanceID);\r
  vec3 seed = vec3(hash11(id * 1.37 + 0.3), hash11(id * 2.91 + 1.7), hash11(id * 4.17 + 2.9));\r
  vec3 box = vec3(9.0, 5.4, 6.0);\r
  vec3 p = (seed - 0.5) * box;\r
  p.z -= 0.6;\r
  p += 0.18 * vec3(sin(uTime * 0.21 + seed.x * 40.0), sin(uTime * 0.17 + seed.y * 40.0), sin(uTime * 0.13 + seed.z * 40.0));\r
  p *= mix(1.0, uScale, 0.5);\r
  vec4 clip = uViewProj * vec4(p, 1.0);\r
  float depth = clip.w;\r
  vec2 px = (clip.xy / clip.w * 0.5 + 0.5) * uViewport;\r
  float size = uSize * mix(0.5, 1.4, hash11(id * 7.7));\r
  float baseRadius = max(0.5 * size * uDpr * uFocal / max(depth, 0.1), 0.45);\r
  float coc = min(uDof * abs(1.0 - uFocus / max(depth, 0.1)) * uViewport.y * 0.035, uMaxCoc * uDpr * 1.6);\r
  float radius = baseRadius + coc;\r
  float spill = max(10.0 * uDpr, baseRadius);\r
  float energy = pow(baseRadius / min(radius, spill), 0.9) * pow(min(1.0, spill / radius), 2.0);\r
  float twinkle = pow(max(sin(uTime * (0.8 + 1.6 * seed.y) * 2.0 + seed.z * 50.0), 0.0), 8.0);\r
  float intensity = energy * (0.35 + 0.65 * twinkle) * mix(0.4, 1.0, seed.x) * smoothstep(0.3, 1.0, uIntro) * (depth > 0.2 ? 1.0 : 0.0);\r
  vec2 corner = vec2(gl_VertexID == 1 || gl_VertexID == 3 ? 1.0 : 0.0, gl_VertexID >= 2 ? 1.0 : 0.0) * 2.0 - 1.0;\r
  vec2 position = px + corner * radius;\r
  vLocal = corner * radius;\r
  vRadius = radius;\r
  vSegment = 0.0;\r
  vLight = vec3(intensity * 0.8 * uGain, 0.3 + 0.6 * twinkle * uSparkle, coc / max(radius, 1e-3));\r
  vTint = uGradient < 0.5 ? 0.45 + 0.55 * seed.y : seed.y;\r
  gl_Position = vec4(position / uViewport * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const DOT_FRAGMENT = \`\${HEADER}\r
uniform vec3 uGlowColor;\r
uniform vec3 uLineColor;\r
uniform vec3 uSecondaryColor;\r
in vec2 vLocal;\r
in float vRadius;\r
in float vSegment;\r
in vec3 vLight;\r
in float vTint;\r
out vec4 outColor;\r
void main() {\r
  float along = clamp(vLocal.x, 0.0, vSegment);\r
  float d = length(vec2(vLocal.x - along, vLocal.y));\r
  float rho = d / max(vRadius, 1e-3);\r
  if (rho > 1.0) discard;\r
  float soft = clamp(2.6 / max(vRadius, 1e-3), 0.14, 1.0);\r
  float disk = 1.0 - smoothstep(1.0 - soft, 1.0, rho);\r
  float bokeh = disk * (0.94 + 0.08 * smoothstep(0.55, 0.95, rho));\r
  float core = exp(-rho * rho * 3.2);\r
  float shape = mix(core, bokeh, smoothstep(0.25, 0.7, vLight.z));\r
  vec3 color = mix(mix(uGlowColor, uSecondaryColor, vTint), uLineColor, vLight.y);\r
  outColor = vec4(color * shape * vLight.x, shape * vLight.x);\r
}\`;\r
\r
const FULLSCREEN = \`\${HEADER}\r
out vec2 vUv;\r
void main() {\r
  vec2 p = vec2(gl_VertexID == 1 ? 3.0 : -1.0, gl_VertexID == 2 ? 3.0 : -1.0);\r
  vUv = p * 0.5 + 0.5;\r
  gl_Position = vec4(p, 0.0, 1.0);\r
}\`;\r
\r
const BRIGHT_FRAGMENT = \`\${HEADER}\r
uniform sampler2D uSource;\r
uniform vec2 uTexel;\r
in vec2 vUv;\r
out vec4 outColor;\r
vec3 pick(vec2 uv) {\r
  vec3 c = texture(uSource, uv).rgb;\r
  float peak = max(max(c.r, c.g), c.b);\r
  return c * smoothstep(0.35, 1.2, peak);\r
}\r
void main() {\r
  vec2 o = uTexel;\r
  vec3 c = pick(vUv + vec2(-o.x, -o.y)) + pick(vUv + vec2(o.x, -o.y)) + pick(vUv + vec2(-o.x, o.y)) + pick(vUv + vec2(o.x, o.y));\r
  outColor = vec4(c * 0.25, 1.0);\r
}\`;\r
\r
const DOWN_FRAGMENT = \`\${HEADER}\r
uniform sampler2D uSource;\r
uniform vec2 uTexel;\r
in vec2 vUv;\r
out vec4 outColor;\r
void main() {\r
  vec2 o = uTexel;\r
  vec3 c = texture(uSource, vUv).rgb * 4.0;\r
  c += texture(uSource, vUv + vec2(-o.x, -o.y)).rgb;\r
  c += texture(uSource, vUv + vec2(o.x, -o.y)).rgb;\r
  c += texture(uSource, vUv + vec2(-o.x, o.y)).rgb;\r
  c += texture(uSource, vUv + vec2(o.x, o.y)).rgb;\r
  outColor = vec4(c / 8.0, 1.0);\r
}\`;\r
\r
const UP_FRAGMENT = \`\${HEADER}\r
uniform sampler2D uSource;\r
uniform vec2 uTexel;\r
in vec2 vUv;\r
out vec4 outColor;\r
void main() {\r
  vec2 o = uTexel;\r
  vec3 c = texture(uSource, vUv + vec2(-o.x * 2.0, 0.0)).rgb;\r
  c += texture(uSource, vUv + vec2(-o.x, o.y)).rgb * 2.0;\r
  c += texture(uSource, vUv + vec2(0.0, o.y * 2.0)).rgb;\r
  c += texture(uSource, vUv + vec2(o.x, o.y)).rgb * 2.0;\r
  c += texture(uSource, vUv + vec2(o.x * 2.0, 0.0)).rgb;\r
  c += texture(uSource, vUv + vec2(o.x, -o.y)).rgb * 2.0;\r
  c += texture(uSource, vUv + vec2(0.0, -o.y * 2.0)).rgb;\r
  c += texture(uSource, vUv + vec2(-o.x, -o.y)).rgb * 2.0;\r
  outColor = vec4(c / 12.0, 1.0);\r
}\`;\r
\r
const COMPOSITE_FRAGMENT = \`\${HEADER}\r
uniform sampler2D uScene;\r
uniform sampler2D uBloom;\r
uniform float uGlow;\r
uniform float uBrightness;\r
uniform float uLightMode;\r
uniform float uGrain;\r
uniform float uVignette;\r
uniform float uFrame;\r
uniform vec2 uView;\r
uniform float uDpr;\r
in vec2 vUv;\r
out vec4 outColor;\r
\r
float hash(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * 0.1031);\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.x + q.y) * q.z);\r
}\r
\r
float smoother(float x) {\r
  x = clamp(x, 0.0, 1.0);\r
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  vec4 scene = texture(uScene, vUv);\r
  vec3 bloom = texture(uBloom, vUv).rgb;\r
  vec3 light = (scene.rgb + bloom * uGlow) * uBrightness;\r
  float reach = max(uVignette * 0.3, 1e-4);\r
  float mask = uVignette > 0.0 ? smoother(vUv.x / reach) * smoother((1.0 - vUv.x) / reach) * smoother(vUv.y / reach) * smoother((1.0 - vUv.y) / reach) : 1.0;\r
  vec2 cell = floor(vUv * uView / max(uDpr, 1.0));\r
  float grain = hash(cell + uFrame * 17.31) + hash(cell * 1.31 + uFrame * 3.7 + 9.1) - 1.0;\r
  if (uLightMode > 0.5) {\r
    float amount = scene.a * uBrightness;\r
    float ink = (1.0 - exp(-amount * 1.5)) * mask;\r
    ink = clamp(ink * (1.0 + grain * uGrain * 2.0), 0.0, 1.0);\r
    vec3 hue = clamp(scene.rgb / max(scene.a, 1e-4), 0.0, 1.0);\r
    vec3 tone = hue * mix(1.0, 0.72, clamp(amount * 0.35, 0.0, 1.0));\r
    outColor = vec4(tone * ink, ink);\r
    return;\r
  }\r
  vec3 color = (1.0 - exp(-light * 1.25)) * mask;\r
  float peak = max(color.r, max(color.g, color.b));\r
  color = max(color + grain * uGrain * (0.25 + 0.75 * sqrt(peak)), 0.0);\r
  outColor = vec4(color, max(color.r, max(color.g, color.b)));\r
}\`;\r
\r
const SHAPE_UNIFORMS = [\r
  'uTime',\r
  'uTwist',\r
  'uRoll',\r
  'uWaves',\r
  'uWidth',\r
  'uRibbon',\r
  'uOrient',\r
  'uScale',\r
  'uPlace',\r
  'uVolume'\r
];\r
const DOT_UNIFORMS = [\r
  ...SHAPE_UNIFORMS,\r
  'uViewProj',\r
  'uEye',\r
  'uViewport',\r
  'uDpr',\r
  'uFibers',\r
  'uDots',\r
  'uFlow',\r
  'uSize',\r
  'uFocus',\r
  'uDof',\r
  'uMaxCoc',\r
  'uFocal',\r
  'uIntro',\r
  'uPulse',\r
  'uHover',\r
  'uPart',\r
  'uDotLength',\r
  'uSparkle',\r
  'uDepthSpread',\r
  'uGain',\r
  'uTips',\r
  'uTint',\r
  'uGradient',\r
  'uFold',\r
  'uGlowColor',\r
  'uLineColor',\r
  'uSecondaryColor'\r
];\r
const DUST_UNIFORMS = [\r
  'uViewProj',\r
  'uViewport',\r
  'uDpr',\r
  'uTime',\r
  'uSize',\r
  'uFocus',\r
  'uDof',\r
  'uMaxCoc',\r
  'uFocal',\r
  'uIntro',\r
  'uSparkle',\r
  'uScale',\r
  'uGradient',\r
  'uGain',\r
  'uGlowColor',\r
  'uLineColor',\r
  'uSecondaryColor'\r
];\r
const PASS_UNIFORMS = ['uSource', 'uTexel'];\r
const COMPOSITE_UNIFORMS = [\r
  'uScene',\r
  'uBloom',\r
  'uGlow',\r
  'uBrightness',\r
  'uLightMode',\r
  'uGrain',\r
  'uVignette',\r
  'uFrame',\r
  'uView',\r
  'uDpr'\r
];\r
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
const link = (gl, vertexSource, fragmentSource, names) => {\r
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
  for (const name of names) uniforms[name] = gl.getUniformLocation(program, name);\r
  return { program, uniforms };\r
};\r
\r
const frustum = (fov, aspect, near, far) => {\r
  const f = 1 / Math.tan(fov / 2);\r
  const nf = 1 / (near - far);\r
  return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];\r
};\r
\r
const multiply = (a, b) => {\r
  const out = new Array(16);\r
  for (let col = 0; col < 4; col += 1) {\r
    for (let row = 0; row < 4; row += 1) {\r
      out[col * 4 + row] =\r
        a[row] * b[col * 4] + a[4 + row] * b[col * 4 + 1] + a[8 + row] * b[col * 4 + 2] + a[12 + row] * b[col * 4 + 3];\r
    }\r
  }\r
  return out;\r
};\r
\r
const orientation = (yaw, pitch, roll) => {\r
  const cy = Math.cos(yaw);\r
  const sy = Math.sin(yaw);\r
  const cp = Math.cos(pitch);\r
  const sp = Math.sin(pitch);\r
  const cr = Math.cos(roll);\r
  const sr = Math.sin(roll);\r
  const ry = [cy, 0, -sy, 0, 1, 0, sy, 0, cy];\r
  const rx = [1, 0, 0, 0, cp, sp, 0, -sp, cp];\r
  const rz = [cr, sr, 0, -sr, cr, 0, 0, 0, 1];\r
  const mul = (a, b) => {\r
    const out = new Array(9);\r
    for (let col = 0; col < 3; col += 1) {\r
      for (let row = 0; row < 3; row += 1) {\r
        out[col * 3 + row] = a[row] * b[col * 3] + a[3 + row] * b[col * 3 + 1] + a[6 + row] * b[col * 3 + 2];\r
      }\r
    }\r
    return out;\r
  };\r
  return mul(rz, mul(rx, ry));\r
};\r
\r
const applyMat3 = (m, v) => [\r
  m[0] * v[0] + m[3] * v[1] + m[6] * v[2],\r
  m[1] * v[0] + m[4] * v[1] + m[7] * v[2],\r
  m[2] * v[0] + m[5] * v[1] + m[8] * v[2]\r
];\r
\r
const GhostFibers = ({\r
  glowColor = '#8b5cf6',\r
  lineColor,\r
  secondaryColor,\r
  gradient = 'depth',\r
  speed = 0.5,\r
  scale = 1,\r
  rotation = 18,\r
  rollSpeed = 0.15,\r
  layers = 3,\r
  waves = 1,\r
  twist = 1.2,\r
  threads = 72,\r
  volume = 0.7,\r
  spread = 1,\r
  density = 1,\r
  thickness = 1,\r
  flow = 0.4,\r
  fiberStyle = 'dots',\r
  tips = 0,\r
  foldGlow = 1,\r
  perspective = 0.65,\r
  depthOfField = 0.85,\r
  focusDepth = 0,\r
  particles = 0.5,\r
  sparkle = 0.5,\r
  glow = 0.8,\r
  brightness = 1,\r
  vignette = 0.3,\r
  grain = 0.06,\r
  mouseInteraction = true,\r
  hoverEffect = 'focus',\r
  mouseStrength = 1,\r
  pulseOnClick = true,\r
  intro = true,\r
  lightMode = false,\r
  paused = false,\r
  dpr,\r
  ...rest\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settings = {\r
    glowColor: String(glowColor),\r
    lineColor: lineColor ? String(lineColor) : '',\r
    secondaryColor: secondaryColor ? String(secondaryColor) : '',\r
    gradient: GRADIENTS[gradient] ?? 0,\r
    speed: Math.max(0, speed),\r
    scale: clamp(scale, 0.3, 3),\r
    rotation: rotation * DEG,\r
    rollSpeed,\r
    layers: clamp(Math.round(layers), 1, 3),\r
    waves: Math.max(0, waves),\r
    twist: Math.max(0, twist),\r
    threads: clamp(Math.round(threads), 6, 180),\r
    volume: clamp(volume, 0, 2),\r
    spread: clamp(spread, 0.2, 3),\r
    density: clamp(density, 0.2, 3),\r
    thickness: clamp(thickness, 0.2, 4),\r
    flow,\r
    dotLength: FIBER_STYLES[fiberStyle] ?? 0,\r
    tips: clamp(tips, 0, 1),\r
    foldGlow: clamp(foldGlow, 0, 3),\r
    perspective: clamp(perspective, 0, 1),\r
    depthOfField: clamp(depthOfField, 0, 2),\r
    focusDepth: clamp(focusDepth, -1, 1),\r
    particles: clamp(particles, 0, 2),\r
    sparkle: clamp(sparkle, 0, 2),\r
    glow: Math.max(0, glow),\r
    brightness: Math.max(0, brightness),\r
    vignette: clamp(vignette, 0, 1),\r
    grain: Math.max(0, grain),\r
    mouseInteraction,\r
    hover: HOVER_EFFECTS[hoverEffect] ?? 0,\r
    mouseStrength: Math.max(0, mouseStrength),\r
    pulseOnClick,\r
    intro,\r
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
    const dots = link(gl, DOT_VERTEX, DOT_FRAGMENT, DOT_UNIFORMS);\r
    const dust = link(gl, DUST_VERTEX, DOT_FRAGMENT, DUST_UNIFORMS);\r
    const bright = link(gl, FULLSCREEN, BRIGHT_FRAGMENT, PASS_UNIFORMS);\r
    const down = link(gl, FULLSCREEN, DOWN_FRAGMENT, PASS_UNIFORMS);\r
    const up = link(gl, FULLSCREEN, UP_FRAGMENT, PASS_UNIFORMS);\r
    const composite = link(gl, FULLSCREEN, COMPOSITE_FRAGMENT, COMPOSITE_UNIFORMS);\r
    if (!dots || !dust || !bright || !down || !up || !composite) return undefined;\r
\r
    const format = floatTargets ? gl.RGBA16F : gl.RGBA8;\r
    const makeTarget = () => ({ texture: null, framebuffer: gl.createFramebuffer(), width: 0, height: 0 });\r
    const allocate = (target, width, height) => {\r
      if (target.texture && target.width === width && target.height === height) return;\r
      if (target.texture) gl.deleteTexture(target.texture);\r
      const texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texStorage2D(gl.TEXTURE_2D, 1, format, width, height);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
      target.texture = texture;\r
      target.width = width;\r
      target.height = height;\r
    };\r
    const scene = makeTarget();\r
    const chain = Array.from({ length: BLOOM_LEVELS }, makeTarget);\r
    const vao = gl.createVertexArray();\r
\r
    const probe = document.createElement('canvas');\r
    probe.width = 1;\r
    probe.height = 1;\r
    const probeContext = probe.getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const state = {\r
      time: 0,\r
      roll: 0,\r
      flow: 0,\r
      frame: 0,\r
      intro: settingsRef.current.intro && !reduce ? 0 : INTRO_SECONDS,\r
      width: 1,\r
      height: 1,\r
      fit: 1,\r
      colorKey: '',\r
      glow: [0.55, 0.36, 0.96],\r
      line: [1, 0.85, 0.98],\r
      secondary: [0.44, 0.29, 0.77],\r
      pointer: { x: 0, y: 0, inside: false },\r
      hover: { x: 0, y: 0, presence: 0, placed: false },\r
      look: { x: 0, y: 0, vx: 0, vy: 0 },\r
      focus: CAMERA + settingsRef.current.focusDepth * 3,\r
      pulse: { s: 0, age: 9, strength: 0, ribbon: 0 },\r
      camera: null\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let alive = true;\r
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
      const key = \`\${s.glowColor}|\${s.lineColor}|\${s.secondaryColor}|\${s.lightMode}\`;\r
      if (key === state.colorKey) return;\r
      state.colorKey = key;\r
      state.glow = toRgb(s.glowColor, [0.55, 0.36, 0.96]);\r
      state.secondary = s.secondaryColor ? toRgb(s.secondaryColor, state.glow) : state.glow.map(c => c * 0.8);\r
      if (s.lineColor) state.line = toRgb(s.lineColor, state.glow);\r
      else state.line = s.lightMode ? state.glow : state.glow.map(c => c + (1 - c) * 0.72);\r
    };\r
\r
    const centerLocal = (s, t, ribbon, waves) => {\r
      const place = PLACEMENTS[ribbon];\r
      const ph = place[3];\r
      const x = s * RIBBON_LENGTH;\r
      const y =\r
        waves * (0.52 * Math.sin(x * 0.43 + t * 0.31 + ph) + 0.26 * Math.sin(x * 0.79 - t * 0.23 + 1.3 + ph * 0.7)) +\r
        place[0] +\r
        x * place[2];\r
      const z = waves * 0.65 * Math.sin(x * 0.33 + t * 0.19 + 0.7 + ph * 1.3) + place[1];\r
      return [x, y, z];\r
    };\r
\r
    const cameraFor = s => {\r
      const aspect = state.width / Math.max(state.height, 1);\r
      const eye = [0, 0, CAMERA];\r
      const projection = frustum(FOV, aspect, 0.1, 60);\r
      const view = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -eye[0], -eye[1], -eye[2], 1];\r
      const orient = orientation(s.perspective * 0.85 + state.look.x * 0.22, 0.12 - state.look.y * 0.14, s.rotation);\r
      return { eye, viewProj: multiply(projection, view), orient };\r
    };\r
\r
    const screenOf = (camera, world) => {\r
      const m = camera.viewProj;\r
      const x = m[0] * world[0] + m[4] * world[1] + m[8] * world[2] + m[12];\r
      const y = m[1] * world[0] + m[5] * world[1] + m[9] * world[2] + m[13];\r
      const w = m[3] * world[0] + m[7] * world[1] + m[11] * world[2] + m[15];\r
      return { x: ((x / w) * 0.5 + 0.5) * state.width, y: (0.5 - (y / w) * 0.5) * state.height, depth: w };\r
    };\r
\r
    const nearestOnRibbon = (s, px, py) => {\r
      const camera = state.camera;\r
      if (!camera) return null;\r
      let best = null;\r
      for (let ribbon = 0; ribbon < s.layers; ribbon += 1) {\r
        for (let i = 0; i <= 96; i += 1) {\r
          const u = i / 96 - 0.5;\r
          const local = centerLocal(u, state.time, ribbon, s.waves).map(c => c * s.scale * state.fit);\r
          const world = applyMat3(camera.orient, local);\r
          const screen = screenOf(camera, world);\r
          const gap = Math.hypot(screen.x - px, screen.y - py);\r
          if (!best || gap < best.gap) best = { gap, s: u, ribbon, depth: screen.depth };\r
        }\r
      }\r
      return best;\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const baseDpr = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      const longest = Math.max(width, height) * baseDpr;\r
      const ratio = longest > MAX_RENDER_DIM ? (baseDpr * MAX_RENDER_DIM) / longest : baseDpr;\r
      const pixelWidth = Math.max(1, Math.round(width * ratio));\r
      const pixelHeight = Math.max(1, Math.round(height * ratio));\r
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {\r
        canvas.width = pixelWidth;\r
        canvas.height = pixelHeight;\r
      }\r
      state.width = width;\r
      state.height = height;\r
      state.fit = clamp(width / height / 1.5, 0.6, 1);\r
      render();\r
    };\r
\r
    const drawPass = (program, target, source, texel) => {\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);\r
      gl.viewport(0, 0, target.width, target.height);\r
      gl.useProgram(program.program);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, source.texture);\r
      gl.uniform1i(program.uniforms.uSource, 0);\r
      gl.uniform2f(program.uniforms.uTexel, texel[0], texel[1]);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      resolveColors(s);\r
      const camera = cameraFor(s);\r
      state.camera = camera;\r
      const ratio = canvas.height / Math.max(state.height, 1);\r
      const intro = s.paused || reduce ? 1 : clamp(state.intro / INTRO_SECONDS, 0, 1);\r
      const introEase = 1 - (1 - intro) * (1 - intro) * (1 - intro);\r
\r
      allocate(scene, canvas.width, canvas.height);\r
      gl.bindVertexArray(vao);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, scene.framebuffer);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE);\r
\r
      const dotsPerFiber = Math.round(260 * s.density);\r
      const blurCap = 22 * clamp(Math.sqrt(56000 / (s.threads * dotsPerFiber * s.layers)), 0.45, 1);\r
      const area = Math.max(0.8 * s.thickness, 0.45) ** 2 / 0.64;\r
      const load = Math.pow((s.threads / 72) * s.density * area, -0.75);\r
      gl.useProgram(dots.program);\r
      const u = dots.uniforms;\r
      gl.uniform1f(u.uTime, state.time);\r
      gl.uniform1f(u.uTwist, s.twist);\r
      gl.uniform1f(u.uRoll, state.roll);\r
      gl.uniform1f(u.uWaves, s.waves);\r
      gl.uniform1f(u.uWidth, 0.62 * s.spread);\r
      gl.uniformMatrix3fv(u.uOrient, false, camera.orient);\r
      gl.uniform1f(u.uScale, s.scale * state.fit);\r
      gl.uniformMatrix4fv(u.uViewProj, false, camera.viewProj);\r
      gl.uniform3f(u.uEye, camera.eye[0], camera.eye[1], camera.eye[2]);\r
      gl.uniform2f(u.uViewport, canvas.width, canvas.height);\r
      gl.uniform1f(u.uDpr, ratio);\r
      gl.uniform1f(u.uFibers, s.threads);\r
      gl.uniform1f(u.uDots, dotsPerFiber);\r
      gl.uniform1f(u.uFlow, state.flow);\r
      gl.uniform1f(u.uSize, 1.6 * s.thickness);\r
      gl.uniform1f(u.uFocus, state.focus);\r
      gl.uniform1f(u.uDof, s.depthOfField);\r
      gl.uniform1f(u.uMaxCoc, blurCap);\r
      gl.uniform1f(u.uFocal, CAMERA);\r
      gl.uniform1f(u.uIntro, introEase);\r
      gl.uniform4f(u.uPulse, state.pulse.s, state.pulse.age, state.pulse.strength, state.pulse.ribbon);\r
      gl.uniform4f(\r
        u.uHover,\r
        state.hover.x * ratio,\r
        (state.height - state.hover.y) * ratio,\r
        140 * ratio,\r
        state.hover.presence * s.mouseStrength\r
      );\r
      gl.uniform1f(u.uPart, s.hover === 1 ? 1 : 0);\r
      gl.uniform1f(u.uDotLength, s.dotLength);\r
      gl.uniform1f(u.uSparkle, s.sparkle);\r
      gl.uniform1f(u.uDepthSpread, 0.12);\r
      gl.uniform1f(u.uVolume, s.volume);\r
      gl.uniform3f(u.uGlowColor, state.glow[0], state.glow[1], state.glow[2]);\r
      gl.uniform3f(u.uLineColor, state.line[0], state.line[1], state.line[2]);\r
      gl.uniform3f(u.uSecondaryColor, state.secondary[0], state.secondary[1], state.secondary[2]);\r
      gl.uniform1f(u.uTips, s.tips);\r
      gl.uniform1f(u.uGradient, s.gradient);\r
      gl.uniform1f(u.uFold, s.foldGlow);\r
      for (let ribbon = 0; ribbon < s.layers; ribbon += 1) {\r
        const place = PLACEMENTS[ribbon];\r
        gl.uniform1f(u.uRibbon, ribbon);\r
        gl.uniform4f(u.uPlace, place[0], place[1], place[2], place[3]);\r
        gl.uniform1f(u.uGain, RIBBON_GAIN[ribbon] * load);\r
        gl.uniform1f(u.uTint, RIBBON_TINT[ribbon]);\r
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, s.threads * dotsPerFiber);\r
      }\r
\r
      const dustCount = Math.round(420 * s.particles);\r
      if (dustCount > 0) {\r
        gl.useProgram(dust.program);\r
        const d = dust.uniforms;\r
        gl.uniformMatrix4fv(d.uViewProj, false, camera.viewProj);\r
        gl.uniform2f(d.uViewport, canvas.width, canvas.height);\r
        gl.uniform1f(d.uDpr, ratio);\r
        gl.uniform1f(d.uTime, state.time);\r
        gl.uniform1f(d.uSize, 2.2 * s.thickness);\r
        gl.uniform1f(d.uFocus, state.focus);\r
        gl.uniform1f(d.uDof, s.depthOfField);\r
        gl.uniform1f(d.uMaxCoc, 22);\r
        gl.uniform1f(d.uFocal, CAMERA);\r
        gl.uniform1f(d.uIntro, introEase);\r
        gl.uniform1f(d.uSparkle, s.sparkle);\r
        gl.uniform1f(d.uScale, s.scale * state.fit);\r
        gl.uniform1f(d.uGradient, s.gradient);\r
        gl.uniform1f(d.uGain, 1 / s.thickness);\r
        gl.uniform3f(d.uGlowColor, state.glow[0], state.glow[1], state.glow[2]);\r
        gl.uniform3f(d.uLineColor, state.line[0], state.line[1], state.line[2]);\r
        gl.uniform3f(d.uSecondaryColor, state.secondary[0], state.secondary[1], state.secondary[2]);\r
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, dustCount);\r
      }\r
      gl.disable(gl.BLEND);\r
\r
      const blooming = s.glow > 0.001 && !s.lightMode;\r
      gl.bindVertexArray(vao);\r
      if (blooming) {\r
        chain.forEach((target, index) => {\r
          allocate(\r
            target,\r
            Math.max(1, Math.round(canvas.width / 2 ** (index + 1))),\r
            Math.max(1, Math.round(canvas.height / 2 ** (index + 1)))\r
          );\r
        });\r
        drawPass(bright, chain[0], scene, [0.5 / scene.width, 0.5 / scene.height]);\r
        for (let index = 1; index < BLOOM_LEVELS; index += 1) {\r
          drawPass(down, chain[index], chain[index - 1], [1 / chain[index - 1].width, 1 / chain[index - 1].height]);\r
        }\r
        gl.enable(gl.BLEND);\r
        gl.blendFunc(gl.ONE, gl.ONE);\r
        for (let index = BLOOM_LEVELS - 1; index > 0; index -= 1) {\r
          drawPass(up, chain[index - 1], chain[index], [0.5 / chain[index].width, 0.5 / chain[index].height]);\r
        }\r
        gl.disable(gl.BLEND);\r
      }\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.useProgram(composite.program);\r
      const c = composite.uniforms;\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, scene.texture);\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.bindTexture(gl.TEXTURE_2D, blooming ? chain[0].texture : scene.texture);\r
      gl.uniform1i(c.uScene, 0);\r
      gl.uniform1i(c.uBloom, 1);\r
      gl.uniform1f(c.uGlow, blooming ? s.glow : 0);\r
      gl.uniform1f(c.uBrightness, s.brightness);\r
      gl.uniform1f(c.uLightMode, s.lightMode ? 1 : 0);\r
      gl.uniform1f(c.uGrain, s.grain);\r
      gl.uniform1f(c.uVignette, s.vignette);\r
      gl.uniform1f(c.uFrame, state.frame % 977);\r
      gl.uniform2f(c.uView, canvas.width, canvas.height);\r
      gl.uniform1f(c.uDpr, ratio);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.bindTexture(gl.TEXTURE_2D, null);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, null);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!alive || !visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const elapsed = last ? (now - last) / 1000 : 1 / 60;\r
      const dt = Math.min(0.05, elapsed);\r
      last = now;\r
      const moving = !s.paused && !reduce;\r
      if (moving) {\r
        state.frame += 1;\r
        state.time += dt * s.speed;\r
        state.roll += dt * s.speed * s.rollSpeed;\r
        state.flow += dt * s.flow * 12;\r
        state.intro += Math.min(elapsed, 1);\r
      } else if (state.intro < INTRO_SECONDS) {\r
        state.intro = INTRO_SECONDS;\r
      }\r
      state.pulse.age += dt;\r
      state.pulse.strength = Math.max(0, 1 - state.pulse.age / 1.8) ** 2;\r
\r
      const { pointer, hover, look } = state;\r
      const active = s.mouseInteraction && pointer.inside && !reduce;\r
      if (active && !hover.placed) {\r
        hover.x = pointer.x;\r
        hover.y = pointer.y;\r
        hover.placed = true;\r
      }\r
      hover.x += (pointer.x - hover.x) * (1 - Math.exp(-dt / 0.08));\r
      hover.y += (pointer.y - hover.y) * (1 - Math.exp(-dt / 0.08));\r
      const goal = active ? 1 : 0;\r
      hover.presence += (goal - hover.presence) * (1 - Math.exp(-dt / (goal > hover.presence ? 0.3 : 0.6)));\r
      if (!active && hover.presence < 0.001) hover.placed = false;\r
      const lookX = active ? (pointer.x / state.width - 0.5) * 0.5 : 0;\r
      const lookY = active ? (0.5 - pointer.y / state.height) * 0.5 : 0;\r
      look.vx += (30 * (lookX - look.x) - 11 * look.vx) * dt;\r
      look.vy += (30 * (lookY - look.y) - 11 * look.vy) * dt;\r
      look.x += look.vx * dt;\r
      look.y += look.vy * dt;\r
\r
      const resting = CAMERA + s.focusDepth * 3;\r
      let focusGoal = resting;\r
      if (active && s.hover === 0) {\r
        const near = nearestOnRibbon(s, hover.x, hover.y);\r
        if (near) focusGoal = resting + (near.depth - resting) * hover.presence * Math.min(1, s.mouseStrength);\r
      }\r
      state.focus += (focusGoal - state.focus) * (1 - Math.exp(-dt / 0.35));\r
\r
      render();\r
      const settling =\r
        Math.abs(goal - hover.presence) > 0.002 ||\r
        Math.abs(lookX - look.x) > 0.0002 ||\r
        Math.abs(lookY - look.y) > 0.0002 ||\r
        Math.abs(focusGoal - state.focus) > 0.001 ||\r
        state.pulse.strength > 0.001;\r
      if (moving || settling) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
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
      state.pointer.x = x;\r
      state.pointer.y = y;\r
      state.pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      if (!s.mouseInteraction || !s.pulseOnClick || event.button !== 0 || reduce) return;\r
      if (\r
        event.target instanceof Element &&\r
        event.target.closest('a, button, input, textarea, select, label, [role="button"]')\r
      )\r
        return;\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;\r
      const near = nearestOnRibbon(s, x, y);\r
      if (near) state.pulse = { s: near.s, age: 0, strength: 1, ribbon: near.ribbon };\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      state.pointer.inside = false;\r
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
    window.addEventListener('pointerdown', onPointerDown);\r
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
    wake();\r
\r
    wakeRef.current = () => {\r
      if (!raf) render();\r
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
      window.removeEventListener('pointerdown', onPointerDown);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteVertexArray(vao);\r
      [scene, ...chain].forEach(target => {\r
        if (target.texture) gl.deleteTexture(target.texture);\r
        gl.deleteFramebuffer(target.framebuffer);\r
      });\r
      [dots, dust, bright, down, up, composite].forEach(entry => gl.deleteProgram(entry.program));\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  const { className = '', ...attributes } = rest;\r
\r
  return (\r
    <div ref={containerRef} className={\`ghost-fibers-container\${className ? \` \${className}\` : ''}\`} {...attributes}>\r
      <canvas ref={canvasRef} className="ghost-fibers-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default GhostFibers;\r
`,n=`.ghost-fibers-container {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.ghost-fibers-canvas {\r
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
const MAX_RENDER_DIM = 2400;\r
const BLOOM_LEVELS = 5;\r
const INTRO_SECONDS = 2.6;\r
const CAMERA = 7.5;\r
const FOV = 0.56;\r
const RIBBON_LENGTH = 24;\r
const HOVER_EFFECTS = { focus: 0, part: 1, none: 2 };\r
const FIBER_STYLES = { dots: 0, dashes: 0.45, lines: 1 };\r
const GRADIENTS = { depth: 0, along: 1, across: 2 };\r
const RIBBON_TINT = [0, 0.75, 0.35];\r
const PLACEMENTS = [\r
  [0, 0, 0, 0],\r
  [1.9, -4.6, -0.08, 2.4],\r
  [-1.05, 2.0, 0.12, 4.1]\r
];\r
const RIBBON_GAIN = [1, 0.5, 0.55];\r
const DEG = Math.PI / 180;\r
const FOCAL = 1 / (2 * Math.tan(FOV / 2));\r
\r
const HEADER = \`#version 300 es\r
precision highp float;\r
\`;\r
\r
const SHAPE = \`\r
uniform float uTime;\r
uniform float uTwist;\r
uniform float uRoll;\r
uniform float uWaves;\r
uniform float uWidth;\r
uniform float uRibbon;\r
uniform mat3 uOrient;\r
uniform float uScale;\r
uniform vec4 uPlace;\r
uniform float uVolume;\r
\r
float hash11(float n) {\r
  return fract(sin(n * 91.3458) * 47453.5453);\r
}\r
\r
vec3 centerLocal(float s) {\r
  float t = uTime;\r
  float ph = uPlace.w;\r
  float x = s * \${RIBBON_LENGTH.toFixed(1)};\r
  float y = uWaves * (0.52 * sin(x * 0.43 + t * 0.31 + ph) + 0.26 * sin(x * 0.79 - t * 0.23 + 1.3 + ph * 0.7)) + uPlace.x + x * uPlace.z;\r
  float z = uWaves * 0.65 * sin(x * 0.33 + t * 0.19 + 0.7 + ph * 1.3) + uPlace.y;\r
  return vec3(x, y, z);\r
}\r
\r
float twistAt(float s, float layer) {\r
  float x = s * \${RIBBON_LENGTH.toFixed(1)};\r
  return uTwist * 0.483 * x + uRoll + uPlace.w * 0.6 + layer * uVolume * 0.42 + 0.5 * sin(x * 0.26 + uTime * 0.27 + uPlace.w);\r
}\r
\r
vec3 ribbonPoint(float s, float v, float n, float layer, out vec3 normal) {\r
  vec3 c0 = centerLocal(s);\r
  vec3 c1 = centerLocal(s + 0.004);\r
  vec3 tangent = normalize(c1 - c0);\r
  vec3 up = vec3(0.0, 1.0, 0.0);\r
  vec3 n0 = normalize(up - tangent * dot(up, tangent));\r
  vec3 b0 = cross(tangent, n0);\r
  float th = twistAt(s, layer);\r
  vec3 across = cos(th) * n0 + sin(th) * b0;\r
  vec3 sheet = -sin(th) * n0 + cos(th) * b0;\r
  float halfWidth = uWidth * (0.78 + 0.22 * cos(s * 3.14159));\r
  vec3 local = c0 + across * v * halfWidth + sheet * (n + layer * uVolume * 0.16) * halfWidth;\r
  normal = uOrient * sheet;\r
  return uOrient * (local * uScale);\r
}\r
\`;\r
\r
const DOT_VERTEX = \`\${HEADER}\r
\${SHAPE}\r
uniform mat4 uViewProj;\r
uniform vec3 uEye;\r
uniform vec2 uViewport;\r
uniform float uDpr;\r
uniform float uFibers;\r
uniform float uDots;\r
uniform float uFlow;\r
uniform float uSize;\r
uniform float uFocus;\r
uniform float uDof;\r
uniform float uMaxCoc;\r
uniform float uFocal;\r
uniform float uIntro;\r
uniform vec4 uPulse;\r
uniform vec4 uHover;\r
uniform float uPart;\r
uniform float uDotLength;\r
uniform float uSparkle;\r
uniform float uDepthSpread;\r
uniform float uGain;\r
uniform float uTips;\r
uniform float uTint;\r
uniform float uGradient;\r
uniform float uFold;\r
\r
out vec2 vLocal;\r
out float vRadius;\r
out float vSegment;\r
out vec3 vLight;\r
out float vTint;\r
\r
vec3 project(vec3 world, out float depth) {\r
  vec4 clip = uViewProj * vec4(world, 1.0);\r
  depth = clip.w;\r
  vec2 ndc = clip.xy / clip.w;\r
  return vec3((ndc * 0.5 + 0.5) * uViewport, clip.w);\r
}\r
\r
vec2 part(vec2 px) {\r
  if (uPart <= 0.0 || uHover.w <= 0.0) return px;\r
  vec2 away = px - uHover.xy;\r
  float dist = length(away);\r
  float radius = uHover.z;\r
  float push = uPart * uHover.w * radius * 0.55 * exp(-dist * dist / (radius * radius));\r
  return px + away / max(dist, 1e-3) * push * smoothstep(0.0, radius * 0.25, dist);\r
}\r
\r
void main() {\r
  int perFiber = int(uDots);\r
  int fiber = gl_InstanceID / perFiber;\r
  int bead = gl_InstanceID - fiber * perFiber;\r
  float fi = float(fiber);\r
  float fk = float(bead);\r
\r
  float seed = hash11(fi * 1.731 + uRibbon * 17.0);\r
  float s = fract((fk + uFlow + seed * uDots) / uDots) - 0.5;\r
  float sNext = s + 1.0 / uDots;\r
  float layer = mod(fi, 3.0) - 1.0;\r
  float slot = floor(fi / 3.0);\r
  float perLayer = max(floor(uFibers / 3.0), 1.0);\r
  float v = ((slot + 0.5) / perLayer) * 2.0 - 1.0 + (hash11(fi * 3.113 + 4.0) - 0.5) * (1.6 / perLayer) + layer * 0.12 / perLayer;\r
  float depthOffset = (hash11(fi * 7.919 + 2.0) - 0.5) * uDepthSpread * (0.35 + 6.0 * s * s);\r
\r
  vec3 normal;\r
  vec3 world = ribbonPoint(s, v, depthOffset, layer, normal);\r
  vec3 nextNormal;\r
  vec3 nextWorld = ribbonPoint(sNext, v, depthOffset, layer, nextNormal);\r
\r
  float depth;\r
  vec3 p0 = project(world, depth);\r
  float nextDepth;\r
  vec3 p1 = project(nextWorld, nextDepth);\r
  vec2 px = part(p0.xy);\r
  vec2 pxNext = part(p1.xy);\r
\r
  float baseRadius = max(0.5 * uSize * uDpr * uFocal / max(depth, 0.1), 0.45);\r
  float coc = min(uDof * abs(1.0 - uFocus / max(depth, 0.1)) * uViewport.y * 0.035, uMaxCoc * uDpr);\r
  float radius = baseRadius + coc;\r
  float spill = max(10.0 * uDpr, baseRadius);\r
  float energy = pow(baseRadius / min(radius, spill), 1.25) * pow(min(1.0, spill / radius), 2.0);\r
\r
  vec3 toEye = normalize(uEye - world);\r
  float facing = abs(dot(normalize(normal), toEye));\r
  float focalPx = uViewport.y * \${FOCAL.toFixed(5)} / max(depth, 0.1);\r
  float widthPx = 2.0 * uWidth * uScale * focalPx;\r
  float stack = (widthPx * facing + 2.0 * baseRadius) / (widthPx + 2.0 * baseRadius);\r
  float spacingFace = length(nextWorld - world) * focalPx;\r
  float trail = (length(p1.xy - p0.xy) + 2.0 * baseRadius) / (spacingFace + 2.0 * baseRadius);\r
  float crowd = sqrt(clamp(stack * trail, 0.002, 1.0));\r
  float fold = pow(1.0 - facing, 6.0) * uFold;\r
  float endFade = smoothstep(0.5, 0.4, abs(s)) * smoothstep(1.6, 4.2, depth);\r
  float tipEnd = mix(0.6, 0.06 + 0.26 * hash11(fi * 9.137 + uPlace.w * 3.0), uTips);\r
  float tip = exp(-pow((s - tipEnd) / 0.0065, 2.0)) * uTips;\r
  endFade *= smoothstep(tipEnd + 0.003, tipEnd - 0.001, s);\r
  float appear = smoothstep(0.0, 0.12, uIntro * 1.3 - (s + 0.5) - seed * 0.12);\r
  float twinklePhase = hash11(fi * 13.7 + fk * 0.917 + uRibbon * 3.0);\r
  float twinkle = pow(max(sin(uTime * (1.2 + 2.6 * twinklePhase) * 3.0 + twinklePhase * 61.0), 0.0), 36.0) * uSparkle * (1.0 - 0.85 * uDotLength);\r
  float pulseGap = abs(s - uPulse.x) - uPulse.y * 0.42;\r
  float pulse = uPulse.z * exp(-pulseGap * pulseGap / 0.0018) * (abs(uPulse.w - uRibbon) < 0.5 ? 1.0 : 0.35);\r
  float strength = mix(0.45, 1.0, hash11(fi * 5.37 + 1.0)) * mix(1.0, 0.72, abs(layer) * uVolume);\r
  float intensity = energy * crowd * strength * endFade * appear * 0.8 * uGain * (1.0 + fold * 7.0 + twinkle * 5.0 + pulse * 4.0 + tip * 7.0);\r
  float highlight = clamp(fold * 0.55 + twinkle + pulse + tip, 0.0, 1.0);\r
\r
  vec2 segment = (pxNext - px) * uDotLength;\r
  float segmentLength = length(segment);\r
  intensity *= mix(1.0, (2.0 * radius) / (segmentLength + 2.0 * radius) * 1.6, uDotLength);\r
  vec2 axis = segmentLength > 1e-3 ? segment / segmentLength : vec2(1.0, 0.0);\r
  vec2 perp = vec2(-axis.y, axis.x);\r
  vec2 corner = vec2(gl_VertexID == 1 || gl_VertexID == 3 ? 1.0 : 0.0, gl_VertexID >= 2 ? 1.0 : 0.0);\r
  float along = mix(-radius, segmentLength + radius, corner.x);\r
  float across = mix(-radius, radius, corner.y);\r
  vec2 position = px + axis * along + perp * across;\r
\r
  vLocal = vec2(along, across);\r
  vRadius = radius;\r
  vSegment = segmentLength;\r
  vLight = vec3(intensity, highlight, coc / max(radius, 1e-3));\r
  float depthTint = clamp(uTint + smoothstep(uFocus, uFocus + 5.0, depth) * 0.5, 0.0, 1.0);\r
  vTint = uGradient < 0.5 ? depthTint : uGradient < 1.5 ? smoothstep(-0.42, 0.42, s) : clamp(v * 0.5 + 0.5, 0.0, 1.0);\r
  if (intensity < 0.0005) position = vec2(-1e4);\r
  gl_Position = vec4(position / uViewport * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const DUST_VERTEX = \`\${HEADER}\r
uniform mat4 uViewProj;\r
uniform vec2 uViewport;\r
uniform float uDpr;\r
uniform float uTime;\r
uniform float uSize;\r
uniform float uFocus;\r
uniform float uDof;\r
uniform float uMaxCoc;\r
uniform float uFocal;\r
uniform float uIntro;\r
uniform float uSparkle;\r
uniform float uScale;\r
uniform float uGradient;\r
uniform float uGain;\r
\r
out vec2 vLocal;\r
out float vRadius;\r
out float vSegment;\r
out vec3 vLight;\r
out float vTint;\r
\r
float hash11(float n) {\r
  return fract(sin(n * 91.3458) * 47453.5453);\r
}\r
\r
void main() {\r
  float id = float(gl_InstanceID);\r
  vec3 seed = vec3(hash11(id * 1.37 + 0.3), hash11(id * 2.91 + 1.7), hash11(id * 4.17 + 2.9));\r
  vec3 box = vec3(9.0, 5.4, 6.0);\r
  vec3 p = (seed - 0.5) * box;\r
  p.z -= 0.6;\r
  p += 0.18 * vec3(sin(uTime * 0.21 + seed.x * 40.0), sin(uTime * 0.17 + seed.y * 40.0), sin(uTime * 0.13 + seed.z * 40.0));\r
  p *= mix(1.0, uScale, 0.5);\r
  vec4 clip = uViewProj * vec4(p, 1.0);\r
  float depth = clip.w;\r
  vec2 px = (clip.xy / clip.w * 0.5 + 0.5) * uViewport;\r
  float size = uSize * mix(0.5, 1.4, hash11(id * 7.7));\r
  float baseRadius = max(0.5 * size * uDpr * uFocal / max(depth, 0.1), 0.45);\r
  float coc = min(uDof * abs(1.0 - uFocus / max(depth, 0.1)) * uViewport.y * 0.035, uMaxCoc * uDpr * 1.6);\r
  float radius = baseRadius + coc;\r
  float spill = max(10.0 * uDpr, baseRadius);\r
  float energy = pow(baseRadius / min(radius, spill), 0.9) * pow(min(1.0, spill / radius), 2.0);\r
  float twinkle = pow(max(sin(uTime * (0.8 + 1.6 * seed.y) * 2.0 + seed.z * 50.0), 0.0), 8.0);\r
  float intensity = energy * (0.35 + 0.65 * twinkle) * mix(0.4, 1.0, seed.x) * smoothstep(0.3, 1.0, uIntro) * (depth > 0.2 ? 1.0 : 0.0);\r
  vec2 corner = vec2(gl_VertexID == 1 || gl_VertexID == 3 ? 1.0 : 0.0, gl_VertexID >= 2 ? 1.0 : 0.0) * 2.0 - 1.0;\r
  vec2 position = px + corner * radius;\r
  vLocal = corner * radius;\r
  vRadius = radius;\r
  vSegment = 0.0;\r
  vLight = vec3(intensity * 0.8 * uGain, 0.3 + 0.6 * twinkle * uSparkle, coc / max(radius, 1e-3));\r
  vTint = uGradient < 0.5 ? 0.45 + 0.55 * seed.y : seed.y;\r
  gl_Position = vec4(position / uViewport * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const DOT_FRAGMENT = \`\${HEADER}\r
uniform vec3 uGlowColor;\r
uniform vec3 uLineColor;\r
uniform vec3 uSecondaryColor;\r
in vec2 vLocal;\r
in float vRadius;\r
in float vSegment;\r
in vec3 vLight;\r
in float vTint;\r
out vec4 outColor;\r
void main() {\r
  float along = clamp(vLocal.x, 0.0, vSegment);\r
  float d = length(vec2(vLocal.x - along, vLocal.y));\r
  float rho = d / max(vRadius, 1e-3);\r
  if (rho > 1.0) discard;\r
  float soft = clamp(2.6 / max(vRadius, 1e-3), 0.14, 1.0);\r
  float disk = 1.0 - smoothstep(1.0 - soft, 1.0, rho);\r
  float bokeh = disk * (0.94 + 0.08 * smoothstep(0.55, 0.95, rho));\r
  float core = exp(-rho * rho * 3.2);\r
  float shape = mix(core, bokeh, smoothstep(0.25, 0.7, vLight.z));\r
  vec3 color = mix(mix(uGlowColor, uSecondaryColor, vTint), uLineColor, vLight.y);\r
  outColor = vec4(color * shape * vLight.x, shape * vLight.x);\r
}\`;\r
\r
const FULLSCREEN = \`\${HEADER}\r
out vec2 vUv;\r
void main() {\r
  vec2 p = vec2(gl_VertexID == 1 ? 3.0 : -1.0, gl_VertexID == 2 ? 3.0 : -1.0);\r
  vUv = p * 0.5 + 0.5;\r
  gl_Position = vec4(p, 0.0, 1.0);\r
}\`;\r
\r
const BRIGHT_FRAGMENT = \`\${HEADER}\r
uniform sampler2D uSource;\r
uniform vec2 uTexel;\r
in vec2 vUv;\r
out vec4 outColor;\r
vec3 pick(vec2 uv) {\r
  vec3 c = texture(uSource, uv).rgb;\r
  float peak = max(max(c.r, c.g), c.b);\r
  return c * smoothstep(0.35, 1.2, peak);\r
}\r
void main() {\r
  vec2 o = uTexel;\r
  vec3 c = pick(vUv + vec2(-o.x, -o.y)) + pick(vUv + vec2(o.x, -o.y)) + pick(vUv + vec2(-o.x, o.y)) + pick(vUv + vec2(o.x, o.y));\r
  outColor = vec4(c * 0.25, 1.0);\r
}\`;\r
\r
const DOWN_FRAGMENT = \`\${HEADER}\r
uniform sampler2D uSource;\r
uniform vec2 uTexel;\r
in vec2 vUv;\r
out vec4 outColor;\r
void main() {\r
  vec2 o = uTexel;\r
  vec3 c = texture(uSource, vUv).rgb * 4.0;\r
  c += texture(uSource, vUv + vec2(-o.x, -o.y)).rgb;\r
  c += texture(uSource, vUv + vec2(o.x, -o.y)).rgb;\r
  c += texture(uSource, vUv + vec2(-o.x, o.y)).rgb;\r
  c += texture(uSource, vUv + vec2(o.x, o.y)).rgb;\r
  outColor = vec4(c / 8.0, 1.0);\r
}\`;\r
\r
const UP_FRAGMENT = \`\${HEADER}\r
uniform sampler2D uSource;\r
uniform vec2 uTexel;\r
in vec2 vUv;\r
out vec4 outColor;\r
void main() {\r
  vec2 o = uTexel;\r
  vec3 c = texture(uSource, vUv + vec2(-o.x * 2.0, 0.0)).rgb;\r
  c += texture(uSource, vUv + vec2(-o.x, o.y)).rgb * 2.0;\r
  c += texture(uSource, vUv + vec2(0.0, o.y * 2.0)).rgb;\r
  c += texture(uSource, vUv + vec2(o.x, o.y)).rgb * 2.0;\r
  c += texture(uSource, vUv + vec2(o.x * 2.0, 0.0)).rgb;\r
  c += texture(uSource, vUv + vec2(o.x, -o.y)).rgb * 2.0;\r
  c += texture(uSource, vUv + vec2(0.0, -o.y * 2.0)).rgb;\r
  c += texture(uSource, vUv + vec2(-o.x, -o.y)).rgb * 2.0;\r
  outColor = vec4(c / 12.0, 1.0);\r
}\`;\r
\r
const COMPOSITE_FRAGMENT = \`\${HEADER}\r
uniform sampler2D uScene;\r
uniform sampler2D uBloom;\r
uniform float uGlow;\r
uniform float uBrightness;\r
uniform float uLightMode;\r
uniform float uGrain;\r
uniform float uVignette;\r
uniform float uFrame;\r
uniform vec2 uView;\r
uniform float uDpr;\r
in vec2 vUv;\r
out vec4 outColor;\r
\r
float hash(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * 0.1031);\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.x + q.y) * q.z);\r
}\r
\r
float smoother(float x) {\r
  x = clamp(x, 0.0, 1.0);\r
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  vec4 scene = texture(uScene, vUv);\r
  vec3 bloom = texture(uBloom, vUv).rgb;\r
  vec3 light = (scene.rgb + bloom * uGlow) * uBrightness;\r
  float reach = max(uVignette * 0.3, 1e-4);\r
  float mask = uVignette > 0.0 ? smoother(vUv.x / reach) * smoother((1.0 - vUv.x) / reach) * smoother(vUv.y / reach) * smoother((1.0 - vUv.y) / reach) : 1.0;\r
  vec2 cell = floor(vUv * uView / max(uDpr, 1.0));\r
  float grain = hash(cell + uFrame * 17.31) + hash(cell * 1.31 + uFrame * 3.7 + 9.1) - 1.0;\r
  if (uLightMode > 0.5) {\r
    float amount = scene.a * uBrightness;\r
    float ink = (1.0 - exp(-amount * 1.5)) * mask;\r
    ink = clamp(ink * (1.0 + grain * uGrain * 2.0), 0.0, 1.0);\r
    vec3 hue = clamp(scene.rgb / max(scene.a, 1e-4), 0.0, 1.0);\r
    vec3 tone = hue * mix(1.0, 0.72, clamp(amount * 0.35, 0.0, 1.0));\r
    outColor = vec4(tone * ink, ink);\r
    return;\r
  }\r
  vec3 color = (1.0 - exp(-light * 1.25)) * mask;\r
  float peak = max(color.r, max(color.g, color.b));\r
  color = max(color + grain * uGrain * (0.25 + 0.75 * sqrt(peak)), 0.0);\r
  outColor = vec4(color, max(color.r, max(color.g, color.b)));\r
}\`;\r
\r
const SHAPE_UNIFORMS = [\r
  'uTime',\r
  'uTwist',\r
  'uRoll',\r
  'uWaves',\r
  'uWidth',\r
  'uRibbon',\r
  'uOrient',\r
  'uScale',\r
  'uPlace',\r
  'uVolume'\r
];\r
const DOT_UNIFORMS = [\r
  ...SHAPE_UNIFORMS,\r
  'uViewProj',\r
  'uEye',\r
  'uViewport',\r
  'uDpr',\r
  'uFibers',\r
  'uDots',\r
  'uFlow',\r
  'uSize',\r
  'uFocus',\r
  'uDof',\r
  'uMaxCoc',\r
  'uFocal',\r
  'uIntro',\r
  'uPulse',\r
  'uHover',\r
  'uPart',\r
  'uDotLength',\r
  'uSparkle',\r
  'uDepthSpread',\r
  'uGain',\r
  'uTips',\r
  'uTint',\r
  'uGradient',\r
  'uFold',\r
  'uGlowColor',\r
  'uLineColor',\r
  'uSecondaryColor'\r
];\r
const DUST_UNIFORMS = [\r
  'uViewProj',\r
  'uViewport',\r
  'uDpr',\r
  'uTime',\r
  'uSize',\r
  'uFocus',\r
  'uDof',\r
  'uMaxCoc',\r
  'uFocal',\r
  'uIntro',\r
  'uSparkle',\r
  'uScale',\r
  'uGradient',\r
  'uGain',\r
  'uGlowColor',\r
  'uLineColor',\r
  'uSecondaryColor'\r
];\r
const PASS_UNIFORMS = ['uSource', 'uTexel'];\r
const COMPOSITE_UNIFORMS = [\r
  'uScene',\r
  'uBloom',\r
  'uGlow',\r
  'uBrightness',\r
  'uLightMode',\r
  'uGrain',\r
  'uVignette',\r
  'uFrame',\r
  'uView',\r
  'uDpr'\r
];\r
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
const link = (gl, vertexSource, fragmentSource, names) => {\r
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
  for (const name of names) uniforms[name] = gl.getUniformLocation(program, name);\r
  return { program, uniforms };\r
};\r
\r
const frustum = (fov, aspect, near, far) => {\r
  const f = 1 / Math.tan(fov / 2);\r
  const nf = 1 / (near - far);\r
  return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];\r
};\r
\r
const multiply = (a, b) => {\r
  const out = new Array(16);\r
  for (let col = 0; col < 4; col += 1) {\r
    for (let row = 0; row < 4; row += 1) {\r
      out[col * 4 + row] =\r
        a[row] * b[col * 4] + a[4 + row] * b[col * 4 + 1] + a[8 + row] * b[col * 4 + 2] + a[12 + row] * b[col * 4 + 3];\r
    }\r
  }\r
  return out;\r
};\r
\r
const orientation = (yaw, pitch, roll) => {\r
  const cy = Math.cos(yaw);\r
  const sy = Math.sin(yaw);\r
  const cp = Math.cos(pitch);\r
  const sp = Math.sin(pitch);\r
  const cr = Math.cos(roll);\r
  const sr = Math.sin(roll);\r
  const ry = [cy, 0, -sy, 0, 1, 0, sy, 0, cy];\r
  const rx = [1, 0, 0, 0, cp, sp, 0, -sp, cp];\r
  const rz = [cr, sr, 0, -sr, cr, 0, 0, 0, 1];\r
  const mul = (a, b) => {\r
    const out = new Array(9);\r
    for (let col = 0; col < 3; col += 1) {\r
      for (let row = 0; row < 3; row += 1) {\r
        out[col * 3 + row] = a[row] * b[col * 3] + a[3 + row] * b[col * 3 + 1] + a[6 + row] * b[col * 3 + 2];\r
      }\r
    }\r
    return out;\r
  };\r
  return mul(rz, mul(rx, ry));\r
};\r
\r
const applyMat3 = (m, v) => [\r
  m[0] * v[0] + m[3] * v[1] + m[6] * v[2],\r
  m[1] * v[0] + m[4] * v[1] + m[7] * v[2],\r
  m[2] * v[0] + m[5] * v[1] + m[8] * v[2]\r
];\r
\r
const GhostFibers = ({\r
  glowColor = '#8b5cf6',\r
  lineColor,\r
  secondaryColor,\r
  gradient = 'depth',\r
  speed = 0.5,\r
  scale = 1,\r
  rotation = 18,\r
  rollSpeed = 0.15,\r
  layers = 3,\r
  waves = 1,\r
  twist = 1.2,\r
  threads = 72,\r
  volume = 0.7,\r
  spread = 1,\r
  density = 1,\r
  thickness = 1,\r
  flow = 0.4,\r
  fiberStyle = 'dots',\r
  tips = 0,\r
  foldGlow = 1,\r
  perspective = 0.65,\r
  depthOfField = 0.85,\r
  focusDepth = 0,\r
  particles = 0.5,\r
  sparkle = 0.5,\r
  glow = 0.8,\r
  brightness = 1,\r
  vignette = 0.3,\r
  grain = 0.06,\r
  mouseInteraction = true,\r
  hoverEffect = 'focus',\r
  mouseStrength = 1,\r
  pulseOnClick = true,\r
  intro = true,\r
  lightMode = false,\r
  paused = false,\r
  dpr,\r
  ...rest\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settings = {\r
    glowColor: String(glowColor),\r
    lineColor: lineColor ? String(lineColor) : '',\r
    secondaryColor: secondaryColor ? String(secondaryColor) : '',\r
    gradient: GRADIENTS[gradient] ?? 0,\r
    speed: Math.max(0, speed),\r
    scale: clamp(scale, 0.3, 3),\r
    rotation: rotation * DEG,\r
    rollSpeed,\r
    layers: clamp(Math.round(layers), 1, 3),\r
    waves: Math.max(0, waves),\r
    twist: Math.max(0, twist),\r
    threads: clamp(Math.round(threads), 6, 180),\r
    volume: clamp(volume, 0, 2),\r
    spread: clamp(spread, 0.2, 3),\r
    density: clamp(density, 0.2, 3),\r
    thickness: clamp(thickness, 0.2, 4),\r
    flow,\r
    dotLength: FIBER_STYLES[fiberStyle] ?? 0,\r
    tips: clamp(tips, 0, 1),\r
    foldGlow: clamp(foldGlow, 0, 3),\r
    perspective: clamp(perspective, 0, 1),\r
    depthOfField: clamp(depthOfField, 0, 2),\r
    focusDepth: clamp(focusDepth, -1, 1),\r
    particles: clamp(particles, 0, 2),\r
    sparkle: clamp(sparkle, 0, 2),\r
    glow: Math.max(0, glow),\r
    brightness: Math.max(0, brightness),\r
    vignette: clamp(vignette, 0, 1),\r
    grain: Math.max(0, grain),\r
    mouseInteraction,\r
    hover: HOVER_EFFECTS[hoverEffect] ?? 0,\r
    mouseStrength: Math.max(0, mouseStrength),\r
    pulseOnClick,\r
    intro,\r
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
    const dots = link(gl, DOT_VERTEX, DOT_FRAGMENT, DOT_UNIFORMS);\r
    const dust = link(gl, DUST_VERTEX, DOT_FRAGMENT, DUST_UNIFORMS);\r
    const bright = link(gl, FULLSCREEN, BRIGHT_FRAGMENT, PASS_UNIFORMS);\r
    const down = link(gl, FULLSCREEN, DOWN_FRAGMENT, PASS_UNIFORMS);\r
    const up = link(gl, FULLSCREEN, UP_FRAGMENT, PASS_UNIFORMS);\r
    const composite = link(gl, FULLSCREEN, COMPOSITE_FRAGMENT, COMPOSITE_UNIFORMS);\r
    if (!dots || !dust || !bright || !down || !up || !composite) return undefined;\r
\r
    const format = floatTargets ? gl.RGBA16F : gl.RGBA8;\r
    const makeTarget = () => ({ texture: null, framebuffer: gl.createFramebuffer(), width: 0, height: 0 });\r
    const allocate = (target, width, height) => {\r
      if (target.texture && target.width === width && target.height === height) return;\r
      if (target.texture) gl.deleteTexture(target.texture);\r
      const texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texStorage2D(gl.TEXTURE_2D, 1, format, width, height);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
      target.texture = texture;\r
      target.width = width;\r
      target.height = height;\r
    };\r
    const scene = makeTarget();\r
    const chain = Array.from({ length: BLOOM_LEVELS }, makeTarget);\r
    const vao = gl.createVertexArray();\r
\r
    const probe = document.createElement('canvas');\r
    probe.width = 1;\r
    probe.height = 1;\r
    const probeContext = probe.getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const state = {\r
      time: 0,\r
      roll: 0,\r
      flow: 0,\r
      frame: 0,\r
      intro: settingsRef.current.intro && !reduce ? 0 : INTRO_SECONDS,\r
      width: 1,\r
      height: 1,\r
      fit: 1,\r
      colorKey: '',\r
      glow: [0.55, 0.36, 0.96],\r
      line: [1, 0.85, 0.98],\r
      secondary: [0.44, 0.29, 0.77],\r
      pointer: { x: 0, y: 0, inside: false },\r
      hover: { x: 0, y: 0, presence: 0, placed: false },\r
      look: { x: 0, y: 0, vx: 0, vy: 0 },\r
      focus: CAMERA + settingsRef.current.focusDepth * 3,\r
      pulse: { s: 0, age: 9, strength: 0, ribbon: 0 },\r
      camera: null\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let alive = true;\r
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
      const key = \`\${s.glowColor}|\${s.lineColor}|\${s.secondaryColor}|\${s.lightMode}\`;\r
      if (key === state.colorKey) return;\r
      state.colorKey = key;\r
      state.glow = toRgb(s.glowColor, [0.55, 0.36, 0.96]);\r
      state.secondary = s.secondaryColor ? toRgb(s.secondaryColor, state.glow) : state.glow.map(c => c * 0.8);\r
      if (s.lineColor) state.line = toRgb(s.lineColor, state.glow);\r
      else state.line = s.lightMode ? state.glow : state.glow.map(c => c + (1 - c) * 0.72);\r
    };\r
\r
    const centerLocal = (s, t, ribbon, waves) => {\r
      const place = PLACEMENTS[ribbon];\r
      const ph = place[3];\r
      const x = s * RIBBON_LENGTH;\r
      const y =\r
        waves * (0.52 * Math.sin(x * 0.43 + t * 0.31 + ph) + 0.26 * Math.sin(x * 0.79 - t * 0.23 + 1.3 + ph * 0.7)) +\r
        place[0] +\r
        x * place[2];\r
      const z = waves * 0.65 * Math.sin(x * 0.33 + t * 0.19 + 0.7 + ph * 1.3) + place[1];\r
      return [x, y, z];\r
    };\r
\r
    const cameraFor = s => {\r
      const aspect = state.width / Math.max(state.height, 1);\r
      const eye = [0, 0, CAMERA];\r
      const projection = frustum(FOV, aspect, 0.1, 60);\r
      const view = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -eye[0], -eye[1], -eye[2], 1];\r
      const orient = orientation(s.perspective * 0.85 + state.look.x * 0.22, 0.12 - state.look.y * 0.14, s.rotation);\r
      return { eye, viewProj: multiply(projection, view), orient };\r
    };\r
\r
    const screenOf = (camera, world) => {\r
      const m = camera.viewProj;\r
      const x = m[0] * world[0] + m[4] * world[1] + m[8] * world[2] + m[12];\r
      const y = m[1] * world[0] + m[5] * world[1] + m[9] * world[2] + m[13];\r
      const w = m[3] * world[0] + m[7] * world[1] + m[11] * world[2] + m[15];\r
      return { x: ((x / w) * 0.5 + 0.5) * state.width, y: (0.5 - (y / w) * 0.5) * state.height, depth: w };\r
    };\r
\r
    const nearestOnRibbon = (s, px, py) => {\r
      const camera = state.camera;\r
      if (!camera) return null;\r
      let best = null;\r
      for (let ribbon = 0; ribbon < s.layers; ribbon += 1) {\r
        for (let i = 0; i <= 96; i += 1) {\r
          const u = i / 96 - 0.5;\r
          const local = centerLocal(u, state.time, ribbon, s.waves).map(c => c * s.scale * state.fit);\r
          const world = applyMat3(camera.orient, local);\r
          const screen = screenOf(camera, world);\r
          const gap = Math.hypot(screen.x - px, screen.y - py);\r
          if (!best || gap < best.gap) best = { gap, s: u, ribbon, depth: screen.depth };\r
        }\r
      }\r
      return best;\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const baseDpr = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      const longest = Math.max(width, height) * baseDpr;\r
      const ratio = longest > MAX_RENDER_DIM ? (baseDpr * MAX_RENDER_DIM) / longest : baseDpr;\r
      const pixelWidth = Math.max(1, Math.round(width * ratio));\r
      const pixelHeight = Math.max(1, Math.round(height * ratio));\r
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {\r
        canvas.width = pixelWidth;\r
        canvas.height = pixelHeight;\r
      }\r
      state.width = width;\r
      state.height = height;\r
      state.fit = clamp(width / height / 1.5, 0.6, 1);\r
      render();\r
    };\r
\r
    const drawPass = (program, target, source, texel) => {\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);\r
      gl.viewport(0, 0, target.width, target.height);\r
      gl.useProgram(program.program);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, source.texture);\r
      gl.uniform1i(program.uniforms.uSource, 0);\r
      gl.uniform2f(program.uniforms.uTexel, texel[0], texel[1]);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      resolveColors(s);\r
      const camera = cameraFor(s);\r
      state.camera = camera;\r
      const ratio = canvas.height / Math.max(state.height, 1);\r
      const intro = s.paused || reduce ? 1 : clamp(state.intro / INTRO_SECONDS, 0, 1);\r
      const introEase = 1 - (1 - intro) * (1 - intro) * (1 - intro);\r
\r
      allocate(scene, canvas.width, canvas.height);\r
      gl.bindVertexArray(vao);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, scene.framebuffer);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE);\r
\r
      const dotsPerFiber = Math.round(260 * s.density);\r
      const blurCap = 22 * clamp(Math.sqrt(56000 / (s.threads * dotsPerFiber * s.layers)), 0.45, 1);\r
      const area = Math.max(0.8 * s.thickness, 0.45) ** 2 / 0.64;\r
      const load = Math.pow((s.threads / 72) * s.density * area, -0.75);\r
      gl.useProgram(dots.program);\r
      const u = dots.uniforms;\r
      gl.uniform1f(u.uTime, state.time);\r
      gl.uniform1f(u.uTwist, s.twist);\r
      gl.uniform1f(u.uRoll, state.roll);\r
      gl.uniform1f(u.uWaves, s.waves);\r
      gl.uniform1f(u.uWidth, 0.62 * s.spread);\r
      gl.uniformMatrix3fv(u.uOrient, false, camera.orient);\r
      gl.uniform1f(u.uScale, s.scale * state.fit);\r
      gl.uniformMatrix4fv(u.uViewProj, false, camera.viewProj);\r
      gl.uniform3f(u.uEye, camera.eye[0], camera.eye[1], camera.eye[2]);\r
      gl.uniform2f(u.uViewport, canvas.width, canvas.height);\r
      gl.uniform1f(u.uDpr, ratio);\r
      gl.uniform1f(u.uFibers, s.threads);\r
      gl.uniform1f(u.uDots, dotsPerFiber);\r
      gl.uniform1f(u.uFlow, state.flow);\r
      gl.uniform1f(u.uSize, 1.6 * s.thickness);\r
      gl.uniform1f(u.uFocus, state.focus);\r
      gl.uniform1f(u.uDof, s.depthOfField);\r
      gl.uniform1f(u.uMaxCoc, blurCap);\r
      gl.uniform1f(u.uFocal, CAMERA);\r
      gl.uniform1f(u.uIntro, introEase);\r
      gl.uniform4f(u.uPulse, state.pulse.s, state.pulse.age, state.pulse.strength, state.pulse.ribbon);\r
      gl.uniform4f(\r
        u.uHover,\r
        state.hover.x * ratio,\r
        (state.height - state.hover.y) * ratio,\r
        140 * ratio,\r
        state.hover.presence * s.mouseStrength\r
      );\r
      gl.uniform1f(u.uPart, s.hover === 1 ? 1 : 0);\r
      gl.uniform1f(u.uDotLength, s.dotLength);\r
      gl.uniform1f(u.uSparkle, s.sparkle);\r
      gl.uniform1f(u.uDepthSpread, 0.12);\r
      gl.uniform1f(u.uVolume, s.volume);\r
      gl.uniform3f(u.uGlowColor, state.glow[0], state.glow[1], state.glow[2]);\r
      gl.uniform3f(u.uLineColor, state.line[0], state.line[1], state.line[2]);\r
      gl.uniform3f(u.uSecondaryColor, state.secondary[0], state.secondary[1], state.secondary[2]);\r
      gl.uniform1f(u.uTips, s.tips);\r
      gl.uniform1f(u.uGradient, s.gradient);\r
      gl.uniform1f(u.uFold, s.foldGlow);\r
      for (let ribbon = 0; ribbon < s.layers; ribbon += 1) {\r
        const place = PLACEMENTS[ribbon];\r
        gl.uniform1f(u.uRibbon, ribbon);\r
        gl.uniform4f(u.uPlace, place[0], place[1], place[2], place[3]);\r
        gl.uniform1f(u.uGain, RIBBON_GAIN[ribbon] * load);\r
        gl.uniform1f(u.uTint, RIBBON_TINT[ribbon]);\r
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, s.threads * dotsPerFiber);\r
      }\r
\r
      const dustCount = Math.round(420 * s.particles);\r
      if (dustCount > 0) {\r
        gl.useProgram(dust.program);\r
        const d = dust.uniforms;\r
        gl.uniformMatrix4fv(d.uViewProj, false, camera.viewProj);\r
        gl.uniform2f(d.uViewport, canvas.width, canvas.height);\r
        gl.uniform1f(d.uDpr, ratio);\r
        gl.uniform1f(d.uTime, state.time);\r
        gl.uniform1f(d.uSize, 2.2 * s.thickness);\r
        gl.uniform1f(d.uFocus, state.focus);\r
        gl.uniform1f(d.uDof, s.depthOfField);\r
        gl.uniform1f(d.uMaxCoc, 22);\r
        gl.uniform1f(d.uFocal, CAMERA);\r
        gl.uniform1f(d.uIntro, introEase);\r
        gl.uniform1f(d.uSparkle, s.sparkle);\r
        gl.uniform1f(d.uScale, s.scale * state.fit);\r
        gl.uniform1f(d.uGradient, s.gradient);\r
        gl.uniform1f(d.uGain, 1 / s.thickness);\r
        gl.uniform3f(d.uGlowColor, state.glow[0], state.glow[1], state.glow[2]);\r
        gl.uniform3f(d.uLineColor, state.line[0], state.line[1], state.line[2]);\r
        gl.uniform3f(d.uSecondaryColor, state.secondary[0], state.secondary[1], state.secondary[2]);\r
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, dustCount);\r
      }\r
      gl.disable(gl.BLEND);\r
\r
      const blooming = s.glow > 0.001 && !s.lightMode;\r
      gl.bindVertexArray(vao);\r
      if (blooming) {\r
        chain.forEach((target, index) => {\r
          allocate(\r
            target,\r
            Math.max(1, Math.round(canvas.width / 2 ** (index + 1))),\r
            Math.max(1, Math.round(canvas.height / 2 ** (index + 1)))\r
          );\r
        });\r
        drawPass(bright, chain[0], scene, [0.5 / scene.width, 0.5 / scene.height]);\r
        for (let index = 1; index < BLOOM_LEVELS; index += 1) {\r
          drawPass(down, chain[index], chain[index - 1], [1 / chain[index - 1].width, 1 / chain[index - 1].height]);\r
        }\r
        gl.enable(gl.BLEND);\r
        gl.blendFunc(gl.ONE, gl.ONE);\r
        for (let index = BLOOM_LEVELS - 1; index > 0; index -= 1) {\r
          drawPass(up, chain[index - 1], chain[index], [0.5 / chain[index].width, 0.5 / chain[index].height]);\r
        }\r
        gl.disable(gl.BLEND);\r
      }\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.useProgram(composite.program);\r
      const c = composite.uniforms;\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, scene.texture);\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.bindTexture(gl.TEXTURE_2D, blooming ? chain[0].texture : scene.texture);\r
      gl.uniform1i(c.uScene, 0);\r
      gl.uniform1i(c.uBloom, 1);\r
      gl.uniform1f(c.uGlow, blooming ? s.glow : 0);\r
      gl.uniform1f(c.uBrightness, s.brightness);\r
      gl.uniform1f(c.uLightMode, s.lightMode ? 1 : 0);\r
      gl.uniform1f(c.uGrain, s.grain);\r
      gl.uniform1f(c.uVignette, s.vignette);\r
      gl.uniform1f(c.uFrame, state.frame % 977);\r
      gl.uniform2f(c.uView, canvas.width, canvas.height);\r
      gl.uniform1f(c.uDpr, ratio);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.bindTexture(gl.TEXTURE_2D, null);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, null);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!alive || !visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const elapsed = last ? (now - last) / 1000 : 1 / 60;\r
      const dt = Math.min(0.05, elapsed);\r
      last = now;\r
      const moving = !s.paused && !reduce;\r
      if (moving) {\r
        state.frame += 1;\r
        state.time += dt * s.speed;\r
        state.roll += dt * s.speed * s.rollSpeed;\r
        state.flow += dt * s.flow * 12;\r
        state.intro += Math.min(elapsed, 1);\r
      } else if (state.intro < INTRO_SECONDS) {\r
        state.intro = INTRO_SECONDS;\r
      }\r
      state.pulse.age += dt;\r
      state.pulse.strength = Math.max(0, 1 - state.pulse.age / 1.8) ** 2;\r
\r
      const { pointer, hover, look } = state;\r
      const active = s.mouseInteraction && pointer.inside && !reduce;\r
      if (active && !hover.placed) {\r
        hover.x = pointer.x;\r
        hover.y = pointer.y;\r
        hover.placed = true;\r
      }\r
      hover.x += (pointer.x - hover.x) * (1 - Math.exp(-dt / 0.08));\r
      hover.y += (pointer.y - hover.y) * (1 - Math.exp(-dt / 0.08));\r
      const goal = active ? 1 : 0;\r
      hover.presence += (goal - hover.presence) * (1 - Math.exp(-dt / (goal > hover.presence ? 0.3 : 0.6)));\r
      if (!active && hover.presence < 0.001) hover.placed = false;\r
      const lookX = active ? (pointer.x / state.width - 0.5) * 0.5 : 0;\r
      const lookY = active ? (0.5 - pointer.y / state.height) * 0.5 : 0;\r
      look.vx += (30 * (lookX - look.x) - 11 * look.vx) * dt;\r
      look.vy += (30 * (lookY - look.y) - 11 * look.vy) * dt;\r
      look.x += look.vx * dt;\r
      look.y += look.vy * dt;\r
\r
      const resting = CAMERA + s.focusDepth * 3;\r
      let focusGoal = resting;\r
      if (active && s.hover === 0) {\r
        const near = nearestOnRibbon(s, hover.x, hover.y);\r
        if (near) focusGoal = resting + (near.depth - resting) * hover.presence * Math.min(1, s.mouseStrength);\r
      }\r
      state.focus += (focusGoal - state.focus) * (1 - Math.exp(-dt / 0.35));\r
\r
      render();\r
      const settling =\r
        Math.abs(goal - hover.presence) > 0.002 ||\r
        Math.abs(lookX - look.x) > 0.0002 ||\r
        Math.abs(lookY - look.y) > 0.0002 ||\r
        Math.abs(focusGoal - state.focus) > 0.001 ||\r
        state.pulse.strength > 0.001;\r
      if (moving || settling) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
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
      state.pointer.x = x;\r
      state.pointer.y = y;\r
      state.pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      if (!s.mouseInteraction || !s.pulseOnClick || event.button !== 0 || reduce) return;\r
      if (\r
        event.target instanceof Element &&\r
        event.target.closest('a, button, input, textarea, select, label, [role="button"]')\r
      )\r
        return;\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;\r
      const near = nearestOnRibbon(s, x, y);\r
      if (near) state.pulse = { s: near.s, age: 0, strength: 1, ribbon: near.ribbon };\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      state.pointer.inside = false;\r
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
    window.addEventListener('pointerdown', onPointerDown);\r
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
    wake();\r
\r
    wakeRef.current = () => {\r
      if (!raf) render();\r
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
      window.removeEventListener('pointerdown', onPointerDown);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteVertexArray(vao);\r
      [scene, ...chain].forEach(target => {\r
        if (target.texture) gl.deleteTexture(target.texture);\r
        gl.deleteFramebuffer(target.framebuffer);\r
      });\r
      [dots, dust, bright, down, up, composite].forEach(entry => gl.deleteProgram(entry.program));\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  const { className = '', ...attributes } = rest;\r
\r
  return (\r
    <div\r
      ref={containerRef}\r
      className={['relative h-full w-full overflow-hidden', className].filter(Boolean).join(' ')}\r
      {...attributes}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default GhostFibers;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, type HTMLAttributes } from 'react';\r
\r
import './GhostFibers.css';\r
\r
export type GhostFibersFiberStyle = 'dots' | 'dashes' | 'lines';\r
\r
export type GhostFibersGradient = 'depth' | 'along' | 'across';\r
\r
export type GhostFibersHoverEffect = 'focus' | 'part' | 'none';\r
\r
export interface GhostFibersProps extends HTMLAttributes<HTMLDivElement> {\r
  glowColor?: string;\r
  lineColor?: string;\r
  secondaryColor?: string;\r
  gradient?: GhostFibersGradient;\r
  speed?: number;\r
  scale?: number;\r
  rotation?: number;\r
  rollSpeed?: number;\r
  layers?: number;\r
  waves?: number;\r
  twist?: number;\r
  threads?: number;\r
  volume?: number;\r
  spread?: number;\r
  density?: number;\r
  thickness?: number;\r
  flow?: number;\r
  fiberStyle?: GhostFibersFiberStyle;\r
  tips?: number;\r
  foldGlow?: number;\r
  perspective?: number;\r
  depthOfField?: number;\r
  focusDepth?: number;\r
  particles?: number;\r
  sparkle?: number;\r
  glow?: number;\r
  brightness?: number;\r
  vignette?: number;\r
  grain?: number;\r
  mouseInteraction?: boolean;\r
  hoverEffect?: GhostFibersHoverEffect;\r
  mouseStrength?: number;\r
  pulseOnClick?: boolean;\r
  intro?: boolean;\r
  lightMode?: boolean;\r
  paused?: boolean;\r
  dpr?: number;\r
}\r
\r
type Settings = {\r
  glowColor: string;\r
  lineColor: string;\r
  secondaryColor: string;\r
  gradient: number;\r
  speed: number;\r
  scale: number;\r
  rotation: number;\r
  rollSpeed: number;\r
  layers: number;\r
  waves: number;\r
  twist: number;\r
  threads: number;\r
  volume: number;\r
  spread: number;\r
  density: number;\r
  thickness: number;\r
  flow: number;\r
  dotLength: number;\r
  tips: number;\r
  foldGlow: number;\r
  perspective: number;\r
  depthOfField: number;\r
  focusDepth: number;\r
  particles: number;\r
  sparkle: number;\r
  glow: number;\r
  brightness: number;\r
  vignette: number;\r
  grain: number;\r
  mouseInteraction: boolean;\r
  hover: number;\r
  mouseStrength: number;\r
  pulseOnClick: boolean;\r
  intro: boolean;\r
  lightMode: boolean;\r
  paused: boolean;\r
  dpr?: number;\r
};\r
\r
type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };\r
\r
type Target = { texture: WebGLTexture | null; framebuffer: WebGLFramebuffer | null; width: number; height: number };\r
\r
type Camera = { eye: number[]; viewProj: number[]; orient: number[] };\r
\r
type Nearest = { gap: number; s: number; ribbon: number; depth: number };\r
\r
const MAX_RENDER_DIM = 2400;\r
const BLOOM_LEVELS = 5;\r
const INTRO_SECONDS = 2.6;\r
const CAMERA = 7.5;\r
const FOV = 0.56;\r
const RIBBON_LENGTH = 24;\r
const HOVER_EFFECTS: Record<GhostFibersHoverEffect, number> = { focus: 0, part: 1, none: 2 };\r
const FIBER_STYLES: Record<GhostFibersFiberStyle, number> = { dots: 0, dashes: 0.45, lines: 1 };\r
const GRADIENTS: Record<GhostFibersGradient, number> = { depth: 0, along: 1, across: 2 };\r
const RIBBON_TINT = [0, 0.75, 0.35];\r
const PLACEMENTS = [\r
  [0, 0, 0, 0],\r
  [1.9, -4.6, -0.08, 2.4],\r
  [-1.05, 2.0, 0.12, 4.1]\r
];\r
const RIBBON_GAIN = [1, 0.5, 0.55];\r
const DEG = Math.PI / 180;\r
const FOCAL = 1 / (2 * Math.tan(FOV / 2));\r
\r
const HEADER = \`#version 300 es\r
precision highp float;\r
\`;\r
\r
const SHAPE = \`\r
uniform float uTime;\r
uniform float uTwist;\r
uniform float uRoll;\r
uniform float uWaves;\r
uniform float uWidth;\r
uniform float uRibbon;\r
uniform mat3 uOrient;\r
uniform float uScale;\r
uniform vec4 uPlace;\r
uniform float uVolume;\r
\r
float hash11(float n) {\r
  return fract(sin(n * 91.3458) * 47453.5453);\r
}\r
\r
vec3 centerLocal(float s) {\r
  float t = uTime;\r
  float ph = uPlace.w;\r
  float x = s * \${RIBBON_LENGTH.toFixed(1)};\r
  float y = uWaves * (0.52 * sin(x * 0.43 + t * 0.31 + ph) + 0.26 * sin(x * 0.79 - t * 0.23 + 1.3 + ph * 0.7)) + uPlace.x + x * uPlace.z;\r
  float z = uWaves * 0.65 * sin(x * 0.33 + t * 0.19 + 0.7 + ph * 1.3) + uPlace.y;\r
  return vec3(x, y, z);\r
}\r
\r
float twistAt(float s, float layer) {\r
  float x = s * \${RIBBON_LENGTH.toFixed(1)};\r
  return uTwist * 0.483 * x + uRoll + uPlace.w * 0.6 + layer * uVolume * 0.42 + 0.5 * sin(x * 0.26 + uTime * 0.27 + uPlace.w);\r
}\r
\r
vec3 ribbonPoint(float s, float v, float n, float layer, out vec3 normal) {\r
  vec3 c0 = centerLocal(s);\r
  vec3 c1 = centerLocal(s + 0.004);\r
  vec3 tangent = normalize(c1 - c0);\r
  vec3 up = vec3(0.0, 1.0, 0.0);\r
  vec3 n0 = normalize(up - tangent * dot(up, tangent));\r
  vec3 b0 = cross(tangent, n0);\r
  float th = twistAt(s, layer);\r
  vec3 across = cos(th) * n0 + sin(th) * b0;\r
  vec3 sheet = -sin(th) * n0 + cos(th) * b0;\r
  float halfWidth = uWidth * (0.78 + 0.22 * cos(s * 3.14159));\r
  vec3 local = c0 + across * v * halfWidth + sheet * (n + layer * uVolume * 0.16) * halfWidth;\r
  normal = uOrient * sheet;\r
  return uOrient * (local * uScale);\r
}\r
\`;\r
\r
const DOT_VERTEX = \`\${HEADER}\r
\${SHAPE}\r
uniform mat4 uViewProj;\r
uniform vec3 uEye;\r
uniform vec2 uViewport;\r
uniform float uDpr;\r
uniform float uFibers;\r
uniform float uDots;\r
uniform float uFlow;\r
uniform float uSize;\r
uniform float uFocus;\r
uniform float uDof;\r
uniform float uMaxCoc;\r
uniform float uFocal;\r
uniform float uIntro;\r
uniform vec4 uPulse;\r
uniform vec4 uHover;\r
uniform float uPart;\r
uniform float uDotLength;\r
uniform float uSparkle;\r
uniform float uDepthSpread;\r
uniform float uGain;\r
uniform float uTips;\r
uniform float uTint;\r
uniform float uGradient;\r
uniform float uFold;\r
\r
out vec2 vLocal;\r
out float vRadius;\r
out float vSegment;\r
out vec3 vLight;\r
out float vTint;\r
\r
vec3 project(vec3 world, out float depth) {\r
  vec4 clip = uViewProj * vec4(world, 1.0);\r
  depth = clip.w;\r
  vec2 ndc = clip.xy / clip.w;\r
  return vec3((ndc * 0.5 + 0.5) * uViewport, clip.w);\r
}\r
\r
vec2 part(vec2 px) {\r
  if (uPart <= 0.0 || uHover.w <= 0.0) return px;\r
  vec2 away = px - uHover.xy;\r
  float dist = length(away);\r
  float radius = uHover.z;\r
  float push = uPart * uHover.w * radius * 0.55 * exp(-dist * dist / (radius * radius));\r
  return px + away / max(dist, 1e-3) * push * smoothstep(0.0, radius * 0.25, dist);\r
}\r
\r
void main() {\r
  int perFiber = int(uDots);\r
  int fiber = gl_InstanceID / perFiber;\r
  int bead = gl_InstanceID - fiber * perFiber;\r
  float fi = float(fiber);\r
  float fk = float(bead);\r
\r
  float seed = hash11(fi * 1.731 + uRibbon * 17.0);\r
  float s = fract((fk + uFlow + seed * uDots) / uDots) - 0.5;\r
  float sNext = s + 1.0 / uDots;\r
  float layer = mod(fi, 3.0) - 1.0;\r
  float slot = floor(fi / 3.0);\r
  float perLayer = max(floor(uFibers / 3.0), 1.0);\r
  float v = ((slot + 0.5) / perLayer) * 2.0 - 1.0 + (hash11(fi * 3.113 + 4.0) - 0.5) * (1.6 / perLayer) + layer * 0.12 / perLayer;\r
  float depthOffset = (hash11(fi * 7.919 + 2.0) - 0.5) * uDepthSpread * (0.35 + 6.0 * s * s);\r
\r
  vec3 normal;\r
  vec3 world = ribbonPoint(s, v, depthOffset, layer, normal);\r
  vec3 nextNormal;\r
  vec3 nextWorld = ribbonPoint(sNext, v, depthOffset, layer, nextNormal);\r
\r
  float depth;\r
  vec3 p0 = project(world, depth);\r
  float nextDepth;\r
  vec3 p1 = project(nextWorld, nextDepth);\r
  vec2 px = part(p0.xy);\r
  vec2 pxNext = part(p1.xy);\r
\r
  float baseRadius = max(0.5 * uSize * uDpr * uFocal / max(depth, 0.1), 0.45);\r
  float coc = min(uDof * abs(1.0 - uFocus / max(depth, 0.1)) * uViewport.y * 0.035, uMaxCoc * uDpr);\r
  float radius = baseRadius + coc;\r
  float spill = max(10.0 * uDpr, baseRadius);\r
  float energy = pow(baseRadius / min(radius, spill), 1.25) * pow(min(1.0, spill / radius), 2.0);\r
\r
  vec3 toEye = normalize(uEye - world);\r
  float facing = abs(dot(normalize(normal), toEye));\r
  float focalPx = uViewport.y * \${FOCAL.toFixed(5)} / max(depth, 0.1);\r
  float widthPx = 2.0 * uWidth * uScale * focalPx;\r
  float stack = (widthPx * facing + 2.0 * baseRadius) / (widthPx + 2.0 * baseRadius);\r
  float spacingFace = length(nextWorld - world) * focalPx;\r
  float trail = (length(p1.xy - p0.xy) + 2.0 * baseRadius) / (spacingFace + 2.0 * baseRadius);\r
  float crowd = sqrt(clamp(stack * trail, 0.002, 1.0));\r
  float fold = pow(1.0 - facing, 6.0) * uFold;\r
  float endFade = smoothstep(0.5, 0.4, abs(s)) * smoothstep(1.6, 4.2, depth);\r
  float tipEnd = mix(0.6, 0.06 + 0.26 * hash11(fi * 9.137 + uPlace.w * 3.0), uTips);\r
  float tip = exp(-pow((s - tipEnd) / 0.0065, 2.0)) * uTips;\r
  endFade *= smoothstep(tipEnd + 0.003, tipEnd - 0.001, s);\r
  float appear = smoothstep(0.0, 0.12, uIntro * 1.3 - (s + 0.5) - seed * 0.12);\r
  float twinklePhase = hash11(fi * 13.7 + fk * 0.917 + uRibbon * 3.0);\r
  float twinkle = pow(max(sin(uTime * (1.2 + 2.6 * twinklePhase) * 3.0 + twinklePhase * 61.0), 0.0), 36.0) * uSparkle * (1.0 - 0.85 * uDotLength);\r
  float pulseGap = abs(s - uPulse.x) - uPulse.y * 0.42;\r
  float pulse = uPulse.z * exp(-pulseGap * pulseGap / 0.0018) * (abs(uPulse.w - uRibbon) < 0.5 ? 1.0 : 0.35);\r
  float strength = mix(0.45, 1.0, hash11(fi * 5.37 + 1.0)) * mix(1.0, 0.72, abs(layer) * uVolume);\r
  float intensity = energy * crowd * strength * endFade * appear * 0.8 * uGain * (1.0 + fold * 7.0 + twinkle * 5.0 + pulse * 4.0 + tip * 7.0);\r
  float highlight = clamp(fold * 0.55 + twinkle + pulse + tip, 0.0, 1.0);\r
\r
  vec2 segment = (pxNext - px) * uDotLength;\r
  float segmentLength = length(segment);\r
  intensity *= mix(1.0, (2.0 * radius) / (segmentLength + 2.0 * radius) * 1.6, uDotLength);\r
  vec2 axis = segmentLength > 1e-3 ? segment / segmentLength : vec2(1.0, 0.0);\r
  vec2 perp = vec2(-axis.y, axis.x);\r
  vec2 corner = vec2(gl_VertexID == 1 || gl_VertexID == 3 ? 1.0 : 0.0, gl_VertexID >= 2 ? 1.0 : 0.0);\r
  float along = mix(-radius, segmentLength + radius, corner.x);\r
  float across = mix(-radius, radius, corner.y);\r
  vec2 position = px + axis * along + perp * across;\r
\r
  vLocal = vec2(along, across);\r
  vRadius = radius;\r
  vSegment = segmentLength;\r
  vLight = vec3(intensity, highlight, coc / max(radius, 1e-3));\r
  float depthTint = clamp(uTint + smoothstep(uFocus, uFocus + 5.0, depth) * 0.5, 0.0, 1.0);\r
  vTint = uGradient < 0.5 ? depthTint : uGradient < 1.5 ? smoothstep(-0.42, 0.42, s) : clamp(v * 0.5 + 0.5, 0.0, 1.0);\r
  if (intensity < 0.0005) position = vec2(-1e4);\r
  gl_Position = vec4(position / uViewport * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const DUST_VERTEX = \`\${HEADER}\r
uniform mat4 uViewProj;\r
uniform vec2 uViewport;\r
uniform float uDpr;\r
uniform float uTime;\r
uniform float uSize;\r
uniform float uFocus;\r
uniform float uDof;\r
uniform float uMaxCoc;\r
uniform float uFocal;\r
uniform float uIntro;\r
uniform float uSparkle;\r
uniform float uScale;\r
uniform float uGradient;\r
uniform float uGain;\r
\r
out vec2 vLocal;\r
out float vRadius;\r
out float vSegment;\r
out vec3 vLight;\r
out float vTint;\r
\r
float hash11(float n) {\r
  return fract(sin(n * 91.3458) * 47453.5453);\r
}\r
\r
void main() {\r
  float id = float(gl_InstanceID);\r
  vec3 seed = vec3(hash11(id * 1.37 + 0.3), hash11(id * 2.91 + 1.7), hash11(id * 4.17 + 2.9));\r
  vec3 box = vec3(9.0, 5.4, 6.0);\r
  vec3 p = (seed - 0.5) * box;\r
  p.z -= 0.6;\r
  p += 0.18 * vec3(sin(uTime * 0.21 + seed.x * 40.0), sin(uTime * 0.17 + seed.y * 40.0), sin(uTime * 0.13 + seed.z * 40.0));\r
  p *= mix(1.0, uScale, 0.5);\r
  vec4 clip = uViewProj * vec4(p, 1.0);\r
  float depth = clip.w;\r
  vec2 px = (clip.xy / clip.w * 0.5 + 0.5) * uViewport;\r
  float size = uSize * mix(0.5, 1.4, hash11(id * 7.7));\r
  float baseRadius = max(0.5 * size * uDpr * uFocal / max(depth, 0.1), 0.45);\r
  float coc = min(uDof * abs(1.0 - uFocus / max(depth, 0.1)) * uViewport.y * 0.035, uMaxCoc * uDpr * 1.6);\r
  float radius = baseRadius + coc;\r
  float spill = max(10.0 * uDpr, baseRadius);\r
  float energy = pow(baseRadius / min(radius, spill), 0.9) * pow(min(1.0, spill / radius), 2.0);\r
  float twinkle = pow(max(sin(uTime * (0.8 + 1.6 * seed.y) * 2.0 + seed.z * 50.0), 0.0), 8.0);\r
  float intensity = energy * (0.35 + 0.65 * twinkle) * mix(0.4, 1.0, seed.x) * smoothstep(0.3, 1.0, uIntro) * (depth > 0.2 ? 1.0 : 0.0);\r
  vec2 corner = vec2(gl_VertexID == 1 || gl_VertexID == 3 ? 1.0 : 0.0, gl_VertexID >= 2 ? 1.0 : 0.0) * 2.0 - 1.0;\r
  vec2 position = px + corner * radius;\r
  vLocal = corner * radius;\r
  vRadius = radius;\r
  vSegment = 0.0;\r
  vLight = vec3(intensity * 0.8 * uGain, 0.3 + 0.6 * twinkle * uSparkle, coc / max(radius, 1e-3));\r
  vTint = uGradient < 0.5 ? 0.45 + 0.55 * seed.y : seed.y;\r
  gl_Position = vec4(position / uViewport * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const DOT_FRAGMENT = \`\${HEADER}\r
uniform vec3 uGlowColor;\r
uniform vec3 uLineColor;\r
uniform vec3 uSecondaryColor;\r
in vec2 vLocal;\r
in float vRadius;\r
in float vSegment;\r
in vec3 vLight;\r
in float vTint;\r
out vec4 outColor;\r
void main() {\r
  float along = clamp(vLocal.x, 0.0, vSegment);\r
  float d = length(vec2(vLocal.x - along, vLocal.y));\r
  float rho = d / max(vRadius, 1e-3);\r
  if (rho > 1.0) discard;\r
  float soft = clamp(2.6 / max(vRadius, 1e-3), 0.14, 1.0);\r
  float disk = 1.0 - smoothstep(1.0 - soft, 1.0, rho);\r
  float bokeh = disk * (0.94 + 0.08 * smoothstep(0.55, 0.95, rho));\r
  float core = exp(-rho * rho * 3.2);\r
  float shape = mix(core, bokeh, smoothstep(0.25, 0.7, vLight.z));\r
  vec3 color = mix(mix(uGlowColor, uSecondaryColor, vTint), uLineColor, vLight.y);\r
  outColor = vec4(color * shape * vLight.x, shape * vLight.x);\r
}\`;\r
\r
const FULLSCREEN = \`\${HEADER}\r
out vec2 vUv;\r
void main() {\r
  vec2 p = vec2(gl_VertexID == 1 ? 3.0 : -1.0, gl_VertexID == 2 ? 3.0 : -1.0);\r
  vUv = p * 0.5 + 0.5;\r
  gl_Position = vec4(p, 0.0, 1.0);\r
}\`;\r
\r
const BRIGHT_FRAGMENT = \`\${HEADER}\r
uniform sampler2D uSource;\r
uniform vec2 uTexel;\r
in vec2 vUv;\r
out vec4 outColor;\r
vec3 pick(vec2 uv) {\r
  vec3 c = texture(uSource, uv).rgb;\r
  float peak = max(max(c.r, c.g), c.b);\r
  return c * smoothstep(0.35, 1.2, peak);\r
}\r
void main() {\r
  vec2 o = uTexel;\r
  vec3 c = pick(vUv + vec2(-o.x, -o.y)) + pick(vUv + vec2(o.x, -o.y)) + pick(vUv + vec2(-o.x, o.y)) + pick(vUv + vec2(o.x, o.y));\r
  outColor = vec4(c * 0.25, 1.0);\r
}\`;\r
\r
const DOWN_FRAGMENT = \`\${HEADER}\r
uniform sampler2D uSource;\r
uniform vec2 uTexel;\r
in vec2 vUv;\r
out vec4 outColor;\r
void main() {\r
  vec2 o = uTexel;\r
  vec3 c = texture(uSource, vUv).rgb * 4.0;\r
  c += texture(uSource, vUv + vec2(-o.x, -o.y)).rgb;\r
  c += texture(uSource, vUv + vec2(o.x, -o.y)).rgb;\r
  c += texture(uSource, vUv + vec2(-o.x, o.y)).rgb;\r
  c += texture(uSource, vUv + vec2(o.x, o.y)).rgb;\r
  outColor = vec4(c / 8.0, 1.0);\r
}\`;\r
\r
const UP_FRAGMENT = \`\${HEADER}\r
uniform sampler2D uSource;\r
uniform vec2 uTexel;\r
in vec2 vUv;\r
out vec4 outColor;\r
void main() {\r
  vec2 o = uTexel;\r
  vec3 c = texture(uSource, vUv + vec2(-o.x * 2.0, 0.0)).rgb;\r
  c += texture(uSource, vUv + vec2(-o.x, o.y)).rgb * 2.0;\r
  c += texture(uSource, vUv + vec2(0.0, o.y * 2.0)).rgb;\r
  c += texture(uSource, vUv + vec2(o.x, o.y)).rgb * 2.0;\r
  c += texture(uSource, vUv + vec2(o.x * 2.0, 0.0)).rgb;\r
  c += texture(uSource, vUv + vec2(o.x, -o.y)).rgb * 2.0;\r
  c += texture(uSource, vUv + vec2(0.0, -o.y * 2.0)).rgb;\r
  c += texture(uSource, vUv + vec2(-o.x, -o.y)).rgb * 2.0;\r
  outColor = vec4(c / 12.0, 1.0);\r
}\`;\r
\r
const COMPOSITE_FRAGMENT = \`\${HEADER}\r
uniform sampler2D uScene;\r
uniform sampler2D uBloom;\r
uniform float uGlow;\r
uniform float uBrightness;\r
uniform float uLightMode;\r
uniform float uGrain;\r
uniform float uVignette;\r
uniform float uFrame;\r
uniform vec2 uView;\r
uniform float uDpr;\r
in vec2 vUv;\r
out vec4 outColor;\r
\r
float hash(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * 0.1031);\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.x + q.y) * q.z);\r
}\r
\r
float smoother(float x) {\r
  x = clamp(x, 0.0, 1.0);\r
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  vec4 scene = texture(uScene, vUv);\r
  vec3 bloom = texture(uBloom, vUv).rgb;\r
  vec3 light = (scene.rgb + bloom * uGlow) * uBrightness;\r
  float reach = max(uVignette * 0.3, 1e-4);\r
  float mask = uVignette > 0.0 ? smoother(vUv.x / reach) * smoother((1.0 - vUv.x) / reach) * smoother(vUv.y / reach) * smoother((1.0 - vUv.y) / reach) : 1.0;\r
  vec2 cell = floor(vUv * uView / max(uDpr, 1.0));\r
  float grain = hash(cell + uFrame * 17.31) + hash(cell * 1.31 + uFrame * 3.7 + 9.1) - 1.0;\r
  if (uLightMode > 0.5) {\r
    float amount = scene.a * uBrightness;\r
    float ink = (1.0 - exp(-amount * 1.5)) * mask;\r
    ink = clamp(ink * (1.0 + grain * uGrain * 2.0), 0.0, 1.0);\r
    vec3 hue = clamp(scene.rgb / max(scene.a, 1e-4), 0.0, 1.0);\r
    vec3 tone = hue * mix(1.0, 0.72, clamp(amount * 0.35, 0.0, 1.0));\r
    outColor = vec4(tone * ink, ink);\r
    return;\r
  }\r
  vec3 color = (1.0 - exp(-light * 1.25)) * mask;\r
  float peak = max(color.r, max(color.g, color.b));\r
  color = max(color + grain * uGrain * (0.25 + 0.75 * sqrt(peak)), 0.0);\r
  outColor = vec4(color, max(color.r, max(color.g, color.b)));\r
}\`;\r
\r
const SHAPE_UNIFORMS = [\r
  'uTime',\r
  'uTwist',\r
  'uRoll',\r
  'uWaves',\r
  'uWidth',\r
  'uRibbon',\r
  'uOrient',\r
  'uScale',\r
  'uPlace',\r
  'uVolume'\r
];\r
const DOT_UNIFORMS = [\r
  ...SHAPE_UNIFORMS,\r
  'uViewProj',\r
  'uEye',\r
  'uViewport',\r
  'uDpr',\r
  'uFibers',\r
  'uDots',\r
  'uFlow',\r
  'uSize',\r
  'uFocus',\r
  'uDof',\r
  'uMaxCoc',\r
  'uFocal',\r
  'uIntro',\r
  'uPulse',\r
  'uHover',\r
  'uPart',\r
  'uDotLength',\r
  'uSparkle',\r
  'uDepthSpread',\r
  'uGain',\r
  'uTips',\r
  'uTint',\r
  'uGradient',\r
  'uFold',\r
  'uGlowColor',\r
  'uLineColor',\r
  'uSecondaryColor'\r
];\r
const DUST_UNIFORMS = [\r
  'uViewProj',\r
  'uViewport',\r
  'uDpr',\r
  'uTime',\r
  'uSize',\r
  'uFocus',\r
  'uDof',\r
  'uMaxCoc',\r
  'uFocal',\r
  'uIntro',\r
  'uSparkle',\r
  'uScale',\r
  'uGradient',\r
  'uGain',\r
  'uGlowColor',\r
  'uLineColor',\r
  'uSecondaryColor'\r
];\r
const PASS_UNIFORMS = ['uSource', 'uTexel'];\r
const COMPOSITE_UNIFORMS = [\r
  'uScene',\r
  'uBloom',\r
  'uGlow',\r
  'uBrightness',\r
  'uLightMode',\r
  'uGrain',\r
  'uVignette',\r
  'uFrame',\r
  'uView',\r
  'uDpr'\r
];\r
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
const link = (\r
  gl: WebGL2RenderingContext,\r
  vertexSource: string,\r
  fragmentSource: string,\r
  names: string[]\r
): Program | null => {\r
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
  for (const name of names) uniforms[name] = gl.getUniformLocation(program, name);\r
  return { program, uniforms };\r
};\r
\r
const frustum = (fov: number, aspect: number, near: number, far: number) => {\r
  const f = 1 / Math.tan(fov / 2);\r
  const nf = 1 / (near - far);\r
  return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];\r
};\r
\r
const multiply = (a: number[], b: number[]) => {\r
  const out: number[] = new Array(16);\r
  for (let col = 0; col < 4; col += 1) {\r
    for (let row = 0; row < 4; row += 1) {\r
      out[col * 4 + row] =\r
        a[row] * b[col * 4] + a[4 + row] * b[col * 4 + 1] + a[8 + row] * b[col * 4 + 2] + a[12 + row] * b[col * 4 + 3];\r
    }\r
  }\r
  return out;\r
};\r
\r
const orientation = (yaw: number, pitch: number, roll: number) => {\r
  const cy = Math.cos(yaw);\r
  const sy = Math.sin(yaw);\r
  const cp = Math.cos(pitch);\r
  const sp = Math.sin(pitch);\r
  const cr = Math.cos(roll);\r
  const sr = Math.sin(roll);\r
  const ry = [cy, 0, -sy, 0, 1, 0, sy, 0, cy];\r
  const rx = [1, 0, 0, 0, cp, sp, 0, -sp, cp];\r
  const rz = [cr, sr, 0, -sr, cr, 0, 0, 0, 1];\r
  const mul = (a: number[], b: number[]) => {\r
    const out: number[] = new Array(9);\r
    for (let col = 0; col < 3; col += 1) {\r
      for (let row = 0; row < 3; row += 1) {\r
        out[col * 3 + row] = a[row] * b[col * 3] + a[3 + row] * b[col * 3 + 1] + a[6 + row] * b[col * 3 + 2];\r
      }\r
    }\r
    return out;\r
  };\r
  return mul(rz, mul(rx, ry));\r
};\r
\r
const applyMat3 = (m: number[], v: number[]) => [\r
  m[0] * v[0] + m[3] * v[1] + m[6] * v[2],\r
  m[1] * v[0] + m[4] * v[1] + m[7] * v[2],\r
  m[2] * v[0] + m[5] * v[1] + m[8] * v[2]\r
];\r
\r
const GhostFibers = ({\r
  glowColor = '#8b5cf6',\r
  lineColor,\r
  secondaryColor,\r
  gradient = 'depth',\r
  speed = 0.5,\r
  scale = 1,\r
  rotation = 18,\r
  rollSpeed = 0.15,\r
  layers = 3,\r
  waves = 1,\r
  twist = 1.2,\r
  threads = 72,\r
  volume = 0.7,\r
  spread = 1,\r
  density = 1,\r
  thickness = 1,\r
  flow = 0.4,\r
  fiberStyle = 'dots',\r
  tips = 0,\r
  foldGlow = 1,\r
  perspective = 0.65,\r
  depthOfField = 0.85,\r
  focusDepth = 0,\r
  particles = 0.5,\r
  sparkle = 0.5,\r
  glow = 0.8,\r
  brightness = 1,\r
  vignette = 0.3,\r
  grain = 0.06,\r
  mouseInteraction = true,\r
  hoverEffect = 'focus',\r
  mouseStrength = 1,\r
  pulseOnClick = true,\r
  intro = true,\r
  lightMode = false,\r
  paused = false,\r
  dpr,\r
  ...rest\r
}: GhostFibersProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings: Settings = {\r
    glowColor: String(glowColor),\r
    lineColor: lineColor ? String(lineColor) : '',\r
    secondaryColor: secondaryColor ? String(secondaryColor) : '',\r
    gradient: GRADIENTS[gradient] ?? 0,\r
    speed: Math.max(0, speed),\r
    scale: clamp(scale, 0.3, 3),\r
    rotation: rotation * DEG,\r
    rollSpeed,\r
    layers: clamp(Math.round(layers), 1, 3),\r
    waves: Math.max(0, waves),\r
    twist: Math.max(0, twist),\r
    threads: clamp(Math.round(threads), 6, 180),\r
    volume: clamp(volume, 0, 2),\r
    spread: clamp(spread, 0.2, 3),\r
    density: clamp(density, 0.2, 3),\r
    thickness: clamp(thickness, 0.2, 4),\r
    flow,\r
    dotLength: FIBER_STYLES[fiberStyle] ?? 0,\r
    tips: clamp(tips, 0, 1),\r
    foldGlow: clamp(foldGlow, 0, 3),\r
    perspective: clamp(perspective, 0, 1),\r
    depthOfField: clamp(depthOfField, 0, 2),\r
    focusDepth: clamp(focusDepth, -1, 1),\r
    particles: clamp(particles, 0, 2),\r
    sparkle: clamp(sparkle, 0, 2),\r
    glow: Math.max(0, glow),\r
    brightness: Math.max(0, brightness),\r
    vignette: clamp(vignette, 0, 1),\r
    grain: Math.max(0, grain),\r
    mouseInteraction,\r
    hover: HOVER_EFFECTS[hoverEffect] ?? 0,\r
    mouseStrength: Math.max(0, mouseStrength),\r
    pulseOnClick,\r
    intro,\r
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
    const dots = link(gl, DOT_VERTEX, DOT_FRAGMENT, DOT_UNIFORMS);\r
    const dust = link(gl, DUST_VERTEX, DOT_FRAGMENT, DUST_UNIFORMS);\r
    const bright = link(gl, FULLSCREEN, BRIGHT_FRAGMENT, PASS_UNIFORMS);\r
    const down = link(gl, FULLSCREEN, DOWN_FRAGMENT, PASS_UNIFORMS);\r
    const up = link(gl, FULLSCREEN, UP_FRAGMENT, PASS_UNIFORMS);\r
    const composite = link(gl, FULLSCREEN, COMPOSITE_FRAGMENT, COMPOSITE_UNIFORMS);\r
    if (!dots || !dust || !bright || !down || !up || !composite) return undefined;\r
\r
    const format = floatTargets ? gl.RGBA16F : gl.RGBA8;\r
    const makeTarget = (): Target => ({ texture: null, framebuffer: gl.createFramebuffer(), width: 0, height: 0 });\r
    const allocate = (target: Target, width: number, height: number) => {\r
      if (target.texture && target.width === width && target.height === height) return;\r
      if (target.texture) gl.deleteTexture(target.texture);\r
      const texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texStorage2D(gl.TEXTURE_2D, 1, format, width, height);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
      target.texture = texture;\r
      target.width = width;\r
      target.height = height;\r
    };\r
    const scene = makeTarget();\r
    const chain = Array.from({ length: BLOOM_LEVELS }, makeTarget);\r
    const vao = gl.createVertexArray();\r
\r
    const probe = document.createElement('canvas');\r
    probe.width = 1;\r
    probe.height = 1;\r
    const probeContext = probe.getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const state = {\r
      time: 0,\r
      roll: 0,\r
      flow: 0,\r
      frame: 0,\r
      intro: settingsRef.current.intro && !reduce ? 0 : INTRO_SECONDS,\r
      width: 1,\r
      height: 1,\r
      fit: 1,\r
      colorKey: '',\r
      glow: [0.55, 0.36, 0.96],\r
      line: [1, 0.85, 0.98],\r
      secondary: [0.44, 0.29, 0.77],\r
      pointer: { x: 0, y: 0, inside: false },\r
      hover: { x: 0, y: 0, presence: 0, placed: false },\r
      look: { x: 0, y: 0, vx: 0, vy: 0 },\r
      focus: CAMERA + settingsRef.current.focusDepth * 3,\r
      pulse: { s: 0, age: 9, strength: 0, ribbon: 0 },\r
      camera: null as Camera | null\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let alive = true;\r
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
      const key = \`\${s.glowColor}|\${s.lineColor}|\${s.secondaryColor}|\${s.lightMode}\`;\r
      if (key === state.colorKey) return;\r
      state.colorKey = key;\r
      state.glow = toRgb(s.glowColor, [0.55, 0.36, 0.96]);\r
      state.secondary = s.secondaryColor ? toRgb(s.secondaryColor, state.glow) : state.glow.map(c => c * 0.8);\r
      if (s.lineColor) state.line = toRgb(s.lineColor, state.glow);\r
      else state.line = s.lightMode ? state.glow : state.glow.map(c => c + (1 - c) * 0.72);\r
    };\r
\r
    const centerLocal = (s: number, t: number, ribbon: number, waves: number) => {\r
      const place = PLACEMENTS[ribbon];\r
      const ph = place[3];\r
      const x = s * RIBBON_LENGTH;\r
      const y =\r
        waves * (0.52 * Math.sin(x * 0.43 + t * 0.31 + ph) + 0.26 * Math.sin(x * 0.79 - t * 0.23 + 1.3 + ph * 0.7)) +\r
        place[0] +\r
        x * place[2];\r
      const z = waves * 0.65 * Math.sin(x * 0.33 + t * 0.19 + 0.7 + ph * 1.3) + place[1];\r
      return [x, y, z];\r
    };\r
\r
    const cameraFor = (s: Settings): Camera => {\r
      const aspect = state.width / Math.max(state.height, 1);\r
      const eye = [0, 0, CAMERA];\r
      const projection = frustum(FOV, aspect, 0.1, 60);\r
      const view = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -eye[0], -eye[1], -eye[2], 1];\r
      const orient = orientation(s.perspective * 0.85 + state.look.x * 0.22, 0.12 - state.look.y * 0.14, s.rotation);\r
      return { eye, viewProj: multiply(projection, view), orient };\r
    };\r
\r
    const screenOf = (camera: Camera, world: number[]) => {\r
      const m = camera.viewProj;\r
      const x = m[0] * world[0] + m[4] * world[1] + m[8] * world[2] + m[12];\r
      const y = m[1] * world[0] + m[5] * world[1] + m[9] * world[2] + m[13];\r
      const w = m[3] * world[0] + m[7] * world[1] + m[11] * world[2] + m[15];\r
      return { x: ((x / w) * 0.5 + 0.5) * state.width, y: (0.5 - (y / w) * 0.5) * state.height, depth: w };\r
    };\r
\r
    const nearestOnRibbon = (s: Settings, px: number, py: number): Nearest | null => {\r
      const camera = state.camera;\r
      if (!camera) return null;\r
      let best: Nearest | null = null;\r
      for (let ribbon = 0; ribbon < s.layers; ribbon += 1) {\r
        for (let i = 0; i <= 96; i += 1) {\r
          const u = i / 96 - 0.5;\r
          const local = centerLocal(u, state.time, ribbon, s.waves).map(c => c * s.scale * state.fit);\r
          const world = applyMat3(camera.orient, local);\r
          const screen = screenOf(camera, world);\r
          const gap = Math.hypot(screen.x - px, screen.y - py);\r
          if (!best || gap < best.gap) best = { gap, s: u, ribbon, depth: screen.depth };\r
        }\r
      }\r
      return best;\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const baseDpr = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      const longest = Math.max(width, height) * baseDpr;\r
      const ratio = longest > MAX_RENDER_DIM ? (baseDpr * MAX_RENDER_DIM) / longest : baseDpr;\r
      const pixelWidth = Math.max(1, Math.round(width * ratio));\r
      const pixelHeight = Math.max(1, Math.round(height * ratio));\r
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {\r
        canvas.width = pixelWidth;\r
        canvas.height = pixelHeight;\r
      }\r
      state.width = width;\r
      state.height = height;\r
      state.fit = clamp(width / height / 1.5, 0.6, 1);\r
      render();\r
    };\r
\r
    const drawPass = (program: Program, target: Target, source: Target, texel: number[]) => {\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);\r
      gl.viewport(0, 0, target.width, target.height);\r
      gl.useProgram(program.program);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, source.texture);\r
      gl.uniform1i(program.uniforms.uSource, 0);\r
      gl.uniform2f(program.uniforms.uTexel, texel[0], texel[1]);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      resolveColors(s);\r
      const camera = cameraFor(s);\r
      state.camera = camera;\r
      const ratio = canvas.height / Math.max(state.height, 1);\r
      const intro = s.paused || reduce ? 1 : clamp(state.intro / INTRO_SECONDS, 0, 1);\r
      const introEase = 1 - (1 - intro) * (1 - intro) * (1 - intro);\r
\r
      allocate(scene, canvas.width, canvas.height);\r
      gl.bindVertexArray(vao);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, scene.framebuffer);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE);\r
\r
      const dotsPerFiber = Math.round(260 * s.density);\r
      const blurCap = 22 * clamp(Math.sqrt(56000 / (s.threads * dotsPerFiber * s.layers)), 0.45, 1);\r
      const area = Math.max(0.8 * s.thickness, 0.45) ** 2 / 0.64;\r
      const load = Math.pow((s.threads / 72) * s.density * area, -0.75);\r
      gl.useProgram(dots.program);\r
      const u = dots.uniforms;\r
      gl.uniform1f(u.uTime, state.time);\r
      gl.uniform1f(u.uTwist, s.twist);\r
      gl.uniform1f(u.uRoll, state.roll);\r
      gl.uniform1f(u.uWaves, s.waves);\r
      gl.uniform1f(u.uWidth, 0.62 * s.spread);\r
      gl.uniformMatrix3fv(u.uOrient, false, camera.orient);\r
      gl.uniform1f(u.uScale, s.scale * state.fit);\r
      gl.uniformMatrix4fv(u.uViewProj, false, camera.viewProj);\r
      gl.uniform3f(u.uEye, camera.eye[0], camera.eye[1], camera.eye[2]);\r
      gl.uniform2f(u.uViewport, canvas.width, canvas.height);\r
      gl.uniform1f(u.uDpr, ratio);\r
      gl.uniform1f(u.uFibers, s.threads);\r
      gl.uniform1f(u.uDots, dotsPerFiber);\r
      gl.uniform1f(u.uFlow, state.flow);\r
      gl.uniform1f(u.uSize, 1.6 * s.thickness);\r
      gl.uniform1f(u.uFocus, state.focus);\r
      gl.uniform1f(u.uDof, s.depthOfField);\r
      gl.uniform1f(u.uMaxCoc, blurCap);\r
      gl.uniform1f(u.uFocal, CAMERA);\r
      gl.uniform1f(u.uIntro, introEase);\r
      gl.uniform4f(u.uPulse, state.pulse.s, state.pulse.age, state.pulse.strength, state.pulse.ribbon);\r
      gl.uniform4f(\r
        u.uHover,\r
        state.hover.x * ratio,\r
        (state.height - state.hover.y) * ratio,\r
        140 * ratio,\r
        state.hover.presence * s.mouseStrength\r
      );\r
      gl.uniform1f(u.uPart, s.hover === 1 ? 1 : 0);\r
      gl.uniform1f(u.uDotLength, s.dotLength);\r
      gl.uniform1f(u.uSparkle, s.sparkle);\r
      gl.uniform1f(u.uDepthSpread, 0.12);\r
      gl.uniform1f(u.uVolume, s.volume);\r
      gl.uniform3f(u.uGlowColor, state.glow[0], state.glow[1], state.glow[2]);\r
      gl.uniform3f(u.uLineColor, state.line[0], state.line[1], state.line[2]);\r
      gl.uniform3f(u.uSecondaryColor, state.secondary[0], state.secondary[1], state.secondary[2]);\r
      gl.uniform1f(u.uTips, s.tips);\r
      gl.uniform1f(u.uGradient, s.gradient);\r
      gl.uniform1f(u.uFold, s.foldGlow);\r
      for (let ribbon = 0; ribbon < s.layers; ribbon += 1) {\r
        const place = PLACEMENTS[ribbon];\r
        gl.uniform1f(u.uRibbon, ribbon);\r
        gl.uniform4f(u.uPlace, place[0], place[1], place[2], place[3]);\r
        gl.uniform1f(u.uGain, RIBBON_GAIN[ribbon] * load);\r
        gl.uniform1f(u.uTint, RIBBON_TINT[ribbon]);\r
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, s.threads * dotsPerFiber);\r
      }\r
\r
      const dustCount = Math.round(420 * s.particles);\r
      if (dustCount > 0) {\r
        gl.useProgram(dust.program);\r
        const d = dust.uniforms;\r
        gl.uniformMatrix4fv(d.uViewProj, false, camera.viewProj);\r
        gl.uniform2f(d.uViewport, canvas.width, canvas.height);\r
        gl.uniform1f(d.uDpr, ratio);\r
        gl.uniform1f(d.uTime, state.time);\r
        gl.uniform1f(d.uSize, 2.2 * s.thickness);\r
        gl.uniform1f(d.uFocus, state.focus);\r
        gl.uniform1f(d.uDof, s.depthOfField);\r
        gl.uniform1f(d.uMaxCoc, 22);\r
        gl.uniform1f(d.uFocal, CAMERA);\r
        gl.uniform1f(d.uIntro, introEase);\r
        gl.uniform1f(d.uSparkle, s.sparkle);\r
        gl.uniform1f(d.uScale, s.scale * state.fit);\r
        gl.uniform1f(d.uGradient, s.gradient);\r
        gl.uniform1f(d.uGain, 1 / s.thickness);\r
        gl.uniform3f(d.uGlowColor, state.glow[0], state.glow[1], state.glow[2]);\r
        gl.uniform3f(d.uLineColor, state.line[0], state.line[1], state.line[2]);\r
        gl.uniform3f(d.uSecondaryColor, state.secondary[0], state.secondary[1], state.secondary[2]);\r
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, dustCount);\r
      }\r
      gl.disable(gl.BLEND);\r
\r
      const blooming = s.glow > 0.001 && !s.lightMode;\r
      gl.bindVertexArray(vao);\r
      if (blooming) {\r
        chain.forEach((target, index) => {\r
          allocate(\r
            target,\r
            Math.max(1, Math.round(canvas.width / 2 ** (index + 1))),\r
            Math.max(1, Math.round(canvas.height / 2 ** (index + 1)))\r
          );\r
        });\r
        drawPass(bright, chain[0], scene, [0.5 / scene.width, 0.5 / scene.height]);\r
        for (let index = 1; index < BLOOM_LEVELS; index += 1) {\r
          drawPass(down, chain[index], chain[index - 1], [1 / chain[index - 1].width, 1 / chain[index - 1].height]);\r
        }\r
        gl.enable(gl.BLEND);\r
        gl.blendFunc(gl.ONE, gl.ONE);\r
        for (let index = BLOOM_LEVELS - 1; index > 0; index -= 1) {\r
          drawPass(up, chain[index - 1], chain[index], [0.5 / chain[index].width, 0.5 / chain[index].height]);\r
        }\r
        gl.disable(gl.BLEND);\r
      }\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.useProgram(composite.program);\r
      const c = composite.uniforms;\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, scene.texture);\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.bindTexture(gl.TEXTURE_2D, blooming ? chain[0].texture : scene.texture);\r
      gl.uniform1i(c.uScene, 0);\r
      gl.uniform1i(c.uBloom, 1);\r
      gl.uniform1f(c.uGlow, blooming ? s.glow : 0);\r
      gl.uniform1f(c.uBrightness, s.brightness);\r
      gl.uniform1f(c.uLightMode, s.lightMode ? 1 : 0);\r
      gl.uniform1f(c.uGrain, s.grain);\r
      gl.uniform1f(c.uVignette, s.vignette);\r
      gl.uniform1f(c.uFrame, state.frame % 977);\r
      gl.uniform2f(c.uView, canvas.width, canvas.height);\r
      gl.uniform1f(c.uDpr, ratio);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.bindTexture(gl.TEXTURE_2D, null);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, null);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!alive || !visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const elapsed = last ? (now - last) / 1000 : 1 / 60;\r
      const dt = Math.min(0.05, elapsed);\r
      last = now;\r
      const moving = !s.paused && !reduce;\r
      if (moving) {\r
        state.frame += 1;\r
        state.time += dt * s.speed;\r
        state.roll += dt * s.speed * s.rollSpeed;\r
        state.flow += dt * s.flow * 12;\r
        state.intro += Math.min(elapsed, 1);\r
      } else if (state.intro < INTRO_SECONDS) {\r
        state.intro = INTRO_SECONDS;\r
      }\r
      state.pulse.age += dt;\r
      state.pulse.strength = Math.max(0, 1 - state.pulse.age / 1.8) ** 2;\r
\r
      const { pointer, hover, look } = state;\r
      const active = s.mouseInteraction && pointer.inside && !reduce;\r
      if (active && !hover.placed) {\r
        hover.x = pointer.x;\r
        hover.y = pointer.y;\r
        hover.placed = true;\r
      }\r
      hover.x += (pointer.x - hover.x) * (1 - Math.exp(-dt / 0.08));\r
      hover.y += (pointer.y - hover.y) * (1 - Math.exp(-dt / 0.08));\r
      const goal = active ? 1 : 0;\r
      hover.presence += (goal - hover.presence) * (1 - Math.exp(-dt / (goal > hover.presence ? 0.3 : 0.6)));\r
      if (!active && hover.presence < 0.001) hover.placed = false;\r
      const lookX = active ? (pointer.x / state.width - 0.5) * 0.5 : 0;\r
      const lookY = active ? (0.5 - pointer.y / state.height) * 0.5 : 0;\r
      look.vx += (30 * (lookX - look.x) - 11 * look.vx) * dt;\r
      look.vy += (30 * (lookY - look.y) - 11 * look.vy) * dt;\r
      look.x += look.vx * dt;\r
      look.y += look.vy * dt;\r
\r
      const resting = CAMERA + s.focusDepth * 3;\r
      let focusGoal = resting;\r
      if (active && s.hover === 0) {\r
        const near = nearestOnRibbon(s, hover.x, hover.y);\r
        if (near) focusGoal = resting + (near.depth - resting) * hover.presence * Math.min(1, s.mouseStrength);\r
      }\r
      state.focus += (focusGoal - state.focus) * (1 - Math.exp(-dt / 0.35));\r
\r
      render();\r
      const settling =\r
        Math.abs(goal - hover.presence) > 0.002 ||\r
        Math.abs(lookX - look.x) > 0.0002 ||\r
        Math.abs(lookY - look.y) > 0.0002 ||\r
        Math.abs(focusGoal - state.focus) > 0.001 ||\r
        state.pulse.strength > 0.001;\r
      if (moving || settling) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
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
      state.pointer.x = x;\r
      state.pointer.y = y;\r
      state.pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      if (!s.mouseInteraction || !s.pulseOnClick || event.button !== 0 || reduce) return;\r
      if (\r
        event.target instanceof Element &&\r
        event.target.closest('a, button, input, textarea, select, label, [role="button"]')\r
      )\r
        return;\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;\r
      const near = nearestOnRibbon(s, x, y);\r
      if (near) state.pulse = { s: near.s, age: 0, strength: 1, ribbon: near.ribbon };\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      state.pointer.inside = false;\r
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
    window.addEventListener('pointerdown', onPointerDown);\r
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
    wake();\r
\r
    wakeRef.current = () => {\r
      if (!raf) render();\r
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
      window.removeEventListener('pointerdown', onPointerDown);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteVertexArray(vao);\r
      [scene, ...chain].forEach(target => {\r
        if (target.texture) gl.deleteTexture(target.texture);\r
        gl.deleteFramebuffer(target.framebuffer);\r
      });\r
      [dots, dust, bright, down, up, composite].forEach(entry => gl.deleteProgram(entry.program));\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  const { className = '', ...attributes } = rest;\r
\r
  return (\r
    <div ref={containerRef} className={\`ghost-fibers-container\${className ? \` \${className}\` : ''}\`} {...attributes}>\r
      <canvas ref={canvasRef} className="ghost-fibers-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default GhostFibers;\r
`,o=`'use client';\r
\r
import { useEffect, useRef, type HTMLAttributes } from 'react';\r
\r
export type GhostFibersFiberStyle = 'dots' | 'dashes' | 'lines';\r
\r
export type GhostFibersGradient = 'depth' | 'along' | 'across';\r
\r
export type GhostFibersHoverEffect = 'focus' | 'part' | 'none';\r
\r
export interface GhostFibersProps extends HTMLAttributes<HTMLDivElement> {\r
  glowColor?: string;\r
  lineColor?: string;\r
  secondaryColor?: string;\r
  gradient?: GhostFibersGradient;\r
  speed?: number;\r
  scale?: number;\r
  rotation?: number;\r
  rollSpeed?: number;\r
  layers?: number;\r
  waves?: number;\r
  twist?: number;\r
  threads?: number;\r
  volume?: number;\r
  spread?: number;\r
  density?: number;\r
  thickness?: number;\r
  flow?: number;\r
  fiberStyle?: GhostFibersFiberStyle;\r
  tips?: number;\r
  foldGlow?: number;\r
  perspective?: number;\r
  depthOfField?: number;\r
  focusDepth?: number;\r
  particles?: number;\r
  sparkle?: number;\r
  glow?: number;\r
  brightness?: number;\r
  vignette?: number;\r
  grain?: number;\r
  mouseInteraction?: boolean;\r
  hoverEffect?: GhostFibersHoverEffect;\r
  mouseStrength?: number;\r
  pulseOnClick?: boolean;\r
  intro?: boolean;\r
  lightMode?: boolean;\r
  paused?: boolean;\r
  dpr?: number;\r
}\r
\r
type Settings = {\r
  glowColor: string;\r
  lineColor: string;\r
  secondaryColor: string;\r
  gradient: number;\r
  speed: number;\r
  scale: number;\r
  rotation: number;\r
  rollSpeed: number;\r
  layers: number;\r
  waves: number;\r
  twist: number;\r
  threads: number;\r
  volume: number;\r
  spread: number;\r
  density: number;\r
  thickness: number;\r
  flow: number;\r
  dotLength: number;\r
  tips: number;\r
  foldGlow: number;\r
  perspective: number;\r
  depthOfField: number;\r
  focusDepth: number;\r
  particles: number;\r
  sparkle: number;\r
  glow: number;\r
  brightness: number;\r
  vignette: number;\r
  grain: number;\r
  mouseInteraction: boolean;\r
  hover: number;\r
  mouseStrength: number;\r
  pulseOnClick: boolean;\r
  intro: boolean;\r
  lightMode: boolean;\r
  paused: boolean;\r
  dpr?: number;\r
};\r
\r
type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };\r
\r
type Target = { texture: WebGLTexture | null; framebuffer: WebGLFramebuffer | null; width: number; height: number };\r
\r
type Camera = { eye: number[]; viewProj: number[]; orient: number[] };\r
\r
type Nearest = { gap: number; s: number; ribbon: number; depth: number };\r
\r
const MAX_RENDER_DIM = 2400;\r
const BLOOM_LEVELS = 5;\r
const INTRO_SECONDS = 2.6;\r
const CAMERA = 7.5;\r
const FOV = 0.56;\r
const RIBBON_LENGTH = 24;\r
const HOVER_EFFECTS: Record<GhostFibersHoverEffect, number> = { focus: 0, part: 1, none: 2 };\r
const FIBER_STYLES: Record<GhostFibersFiberStyle, number> = { dots: 0, dashes: 0.45, lines: 1 };\r
const GRADIENTS: Record<GhostFibersGradient, number> = { depth: 0, along: 1, across: 2 };\r
const RIBBON_TINT = [0, 0.75, 0.35];\r
const PLACEMENTS = [\r
  [0, 0, 0, 0],\r
  [1.9, -4.6, -0.08, 2.4],\r
  [-1.05, 2.0, 0.12, 4.1]\r
];\r
const RIBBON_GAIN = [1, 0.5, 0.55];\r
const DEG = Math.PI / 180;\r
const FOCAL = 1 / (2 * Math.tan(FOV / 2));\r
\r
const HEADER = \`#version 300 es\r
precision highp float;\r
\`;\r
\r
const SHAPE = \`\r
uniform float uTime;\r
uniform float uTwist;\r
uniform float uRoll;\r
uniform float uWaves;\r
uniform float uWidth;\r
uniform float uRibbon;\r
uniform mat3 uOrient;\r
uniform float uScale;\r
uniform vec4 uPlace;\r
uniform float uVolume;\r
\r
float hash11(float n) {\r
  return fract(sin(n * 91.3458) * 47453.5453);\r
}\r
\r
vec3 centerLocal(float s) {\r
  float t = uTime;\r
  float ph = uPlace.w;\r
  float x = s * \${RIBBON_LENGTH.toFixed(1)};\r
  float y = uWaves * (0.52 * sin(x * 0.43 + t * 0.31 + ph) + 0.26 * sin(x * 0.79 - t * 0.23 + 1.3 + ph * 0.7)) + uPlace.x + x * uPlace.z;\r
  float z = uWaves * 0.65 * sin(x * 0.33 + t * 0.19 + 0.7 + ph * 1.3) + uPlace.y;\r
  return vec3(x, y, z);\r
}\r
\r
float twistAt(float s, float layer) {\r
  float x = s * \${RIBBON_LENGTH.toFixed(1)};\r
  return uTwist * 0.483 * x + uRoll + uPlace.w * 0.6 + layer * uVolume * 0.42 + 0.5 * sin(x * 0.26 + uTime * 0.27 + uPlace.w);\r
}\r
\r
vec3 ribbonPoint(float s, float v, float n, float layer, out vec3 normal) {\r
  vec3 c0 = centerLocal(s);\r
  vec3 c1 = centerLocal(s + 0.004);\r
  vec3 tangent = normalize(c1 - c0);\r
  vec3 up = vec3(0.0, 1.0, 0.0);\r
  vec3 n0 = normalize(up - tangent * dot(up, tangent));\r
  vec3 b0 = cross(tangent, n0);\r
  float th = twistAt(s, layer);\r
  vec3 across = cos(th) * n0 + sin(th) * b0;\r
  vec3 sheet = -sin(th) * n0 + cos(th) * b0;\r
  float halfWidth = uWidth * (0.78 + 0.22 * cos(s * 3.14159));\r
  vec3 local = c0 + across * v * halfWidth + sheet * (n + layer * uVolume * 0.16) * halfWidth;\r
  normal = uOrient * sheet;\r
  return uOrient * (local * uScale);\r
}\r
\`;\r
\r
const DOT_VERTEX = \`\${HEADER}\r
\${SHAPE}\r
uniform mat4 uViewProj;\r
uniform vec3 uEye;\r
uniform vec2 uViewport;\r
uniform float uDpr;\r
uniform float uFibers;\r
uniform float uDots;\r
uniform float uFlow;\r
uniform float uSize;\r
uniform float uFocus;\r
uniform float uDof;\r
uniform float uMaxCoc;\r
uniform float uFocal;\r
uniform float uIntro;\r
uniform vec4 uPulse;\r
uniform vec4 uHover;\r
uniform float uPart;\r
uniform float uDotLength;\r
uniform float uSparkle;\r
uniform float uDepthSpread;\r
uniform float uGain;\r
uniform float uTips;\r
uniform float uTint;\r
uniform float uGradient;\r
uniform float uFold;\r
\r
out vec2 vLocal;\r
out float vRadius;\r
out float vSegment;\r
out vec3 vLight;\r
out float vTint;\r
\r
vec3 project(vec3 world, out float depth) {\r
  vec4 clip = uViewProj * vec4(world, 1.0);\r
  depth = clip.w;\r
  vec2 ndc = clip.xy / clip.w;\r
  return vec3((ndc * 0.5 + 0.5) * uViewport, clip.w);\r
}\r
\r
vec2 part(vec2 px) {\r
  if (uPart <= 0.0 || uHover.w <= 0.0) return px;\r
  vec2 away = px - uHover.xy;\r
  float dist = length(away);\r
  float radius = uHover.z;\r
  float push = uPart * uHover.w * radius * 0.55 * exp(-dist * dist / (radius * radius));\r
  return px + away / max(dist, 1e-3) * push * smoothstep(0.0, radius * 0.25, dist);\r
}\r
\r
void main() {\r
  int perFiber = int(uDots);\r
  int fiber = gl_InstanceID / perFiber;\r
  int bead = gl_InstanceID - fiber * perFiber;\r
  float fi = float(fiber);\r
  float fk = float(bead);\r
\r
  float seed = hash11(fi * 1.731 + uRibbon * 17.0);\r
  float s = fract((fk + uFlow + seed * uDots) / uDots) - 0.5;\r
  float sNext = s + 1.0 / uDots;\r
  float layer = mod(fi, 3.0) - 1.0;\r
  float slot = floor(fi / 3.0);\r
  float perLayer = max(floor(uFibers / 3.0), 1.0);\r
  float v = ((slot + 0.5) / perLayer) * 2.0 - 1.0 + (hash11(fi * 3.113 + 4.0) - 0.5) * (1.6 / perLayer) + layer * 0.12 / perLayer;\r
  float depthOffset = (hash11(fi * 7.919 + 2.0) - 0.5) * uDepthSpread * (0.35 + 6.0 * s * s);\r
\r
  vec3 normal;\r
  vec3 world = ribbonPoint(s, v, depthOffset, layer, normal);\r
  vec3 nextNormal;\r
  vec3 nextWorld = ribbonPoint(sNext, v, depthOffset, layer, nextNormal);\r
\r
  float depth;\r
  vec3 p0 = project(world, depth);\r
  float nextDepth;\r
  vec3 p1 = project(nextWorld, nextDepth);\r
  vec2 px = part(p0.xy);\r
  vec2 pxNext = part(p1.xy);\r
\r
  float baseRadius = max(0.5 * uSize * uDpr * uFocal / max(depth, 0.1), 0.45);\r
  float coc = min(uDof * abs(1.0 - uFocus / max(depth, 0.1)) * uViewport.y * 0.035, uMaxCoc * uDpr);\r
  float radius = baseRadius + coc;\r
  float spill = max(10.0 * uDpr, baseRadius);\r
  float energy = pow(baseRadius / min(radius, spill), 1.25) * pow(min(1.0, spill / radius), 2.0);\r
\r
  vec3 toEye = normalize(uEye - world);\r
  float facing = abs(dot(normalize(normal), toEye));\r
  float focalPx = uViewport.y * \${FOCAL.toFixed(5)} / max(depth, 0.1);\r
  float widthPx = 2.0 * uWidth * uScale * focalPx;\r
  float stack = (widthPx * facing + 2.0 * baseRadius) / (widthPx + 2.0 * baseRadius);\r
  float spacingFace = length(nextWorld - world) * focalPx;\r
  float trail = (length(p1.xy - p0.xy) + 2.0 * baseRadius) / (spacingFace + 2.0 * baseRadius);\r
  float crowd = sqrt(clamp(stack * trail, 0.002, 1.0));\r
  float fold = pow(1.0 - facing, 6.0) * uFold;\r
  float endFade = smoothstep(0.5, 0.4, abs(s)) * smoothstep(1.6, 4.2, depth);\r
  float tipEnd = mix(0.6, 0.06 + 0.26 * hash11(fi * 9.137 + uPlace.w * 3.0), uTips);\r
  float tip = exp(-pow((s - tipEnd) / 0.0065, 2.0)) * uTips;\r
  endFade *= smoothstep(tipEnd + 0.003, tipEnd - 0.001, s);\r
  float appear = smoothstep(0.0, 0.12, uIntro * 1.3 - (s + 0.5) - seed * 0.12);\r
  float twinklePhase = hash11(fi * 13.7 + fk * 0.917 + uRibbon * 3.0);\r
  float twinkle = pow(max(sin(uTime * (1.2 + 2.6 * twinklePhase) * 3.0 + twinklePhase * 61.0), 0.0), 36.0) * uSparkle * (1.0 - 0.85 * uDotLength);\r
  float pulseGap = abs(s - uPulse.x) - uPulse.y * 0.42;\r
  float pulse = uPulse.z * exp(-pulseGap * pulseGap / 0.0018) * (abs(uPulse.w - uRibbon) < 0.5 ? 1.0 : 0.35);\r
  float strength = mix(0.45, 1.0, hash11(fi * 5.37 + 1.0)) * mix(1.0, 0.72, abs(layer) * uVolume);\r
  float intensity = energy * crowd * strength * endFade * appear * 0.8 * uGain * (1.0 + fold * 7.0 + twinkle * 5.0 + pulse * 4.0 + tip * 7.0);\r
  float highlight = clamp(fold * 0.55 + twinkle + pulse + tip, 0.0, 1.0);\r
\r
  vec2 segment = (pxNext - px) * uDotLength;\r
  float segmentLength = length(segment);\r
  intensity *= mix(1.0, (2.0 * radius) / (segmentLength + 2.0 * radius) * 1.6, uDotLength);\r
  vec2 axis = segmentLength > 1e-3 ? segment / segmentLength : vec2(1.0, 0.0);\r
  vec2 perp = vec2(-axis.y, axis.x);\r
  vec2 corner = vec2(gl_VertexID == 1 || gl_VertexID == 3 ? 1.0 : 0.0, gl_VertexID >= 2 ? 1.0 : 0.0);\r
  float along = mix(-radius, segmentLength + radius, corner.x);\r
  float across = mix(-radius, radius, corner.y);\r
  vec2 position = px + axis * along + perp * across;\r
\r
  vLocal = vec2(along, across);\r
  vRadius = radius;\r
  vSegment = segmentLength;\r
  vLight = vec3(intensity, highlight, coc / max(radius, 1e-3));\r
  float depthTint = clamp(uTint + smoothstep(uFocus, uFocus + 5.0, depth) * 0.5, 0.0, 1.0);\r
  vTint = uGradient < 0.5 ? depthTint : uGradient < 1.5 ? smoothstep(-0.42, 0.42, s) : clamp(v * 0.5 + 0.5, 0.0, 1.0);\r
  if (intensity < 0.0005) position = vec2(-1e4);\r
  gl_Position = vec4(position / uViewport * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const DUST_VERTEX = \`\${HEADER}\r
uniform mat4 uViewProj;\r
uniform vec2 uViewport;\r
uniform float uDpr;\r
uniform float uTime;\r
uniform float uSize;\r
uniform float uFocus;\r
uniform float uDof;\r
uniform float uMaxCoc;\r
uniform float uFocal;\r
uniform float uIntro;\r
uniform float uSparkle;\r
uniform float uScale;\r
uniform float uGradient;\r
uniform float uGain;\r
\r
out vec2 vLocal;\r
out float vRadius;\r
out float vSegment;\r
out vec3 vLight;\r
out float vTint;\r
\r
float hash11(float n) {\r
  return fract(sin(n * 91.3458) * 47453.5453);\r
}\r
\r
void main() {\r
  float id = float(gl_InstanceID);\r
  vec3 seed = vec3(hash11(id * 1.37 + 0.3), hash11(id * 2.91 + 1.7), hash11(id * 4.17 + 2.9));\r
  vec3 box = vec3(9.0, 5.4, 6.0);\r
  vec3 p = (seed - 0.5) * box;\r
  p.z -= 0.6;\r
  p += 0.18 * vec3(sin(uTime * 0.21 + seed.x * 40.0), sin(uTime * 0.17 + seed.y * 40.0), sin(uTime * 0.13 + seed.z * 40.0));\r
  p *= mix(1.0, uScale, 0.5);\r
  vec4 clip = uViewProj * vec4(p, 1.0);\r
  float depth = clip.w;\r
  vec2 px = (clip.xy / clip.w * 0.5 + 0.5) * uViewport;\r
  float size = uSize * mix(0.5, 1.4, hash11(id * 7.7));\r
  float baseRadius = max(0.5 * size * uDpr * uFocal / max(depth, 0.1), 0.45);\r
  float coc = min(uDof * abs(1.0 - uFocus / max(depth, 0.1)) * uViewport.y * 0.035, uMaxCoc * uDpr * 1.6);\r
  float radius = baseRadius + coc;\r
  float spill = max(10.0 * uDpr, baseRadius);\r
  float energy = pow(baseRadius / min(radius, spill), 0.9) * pow(min(1.0, spill / radius), 2.0);\r
  float twinkle = pow(max(sin(uTime * (0.8 + 1.6 * seed.y) * 2.0 + seed.z * 50.0), 0.0), 8.0);\r
  float intensity = energy * (0.35 + 0.65 * twinkle) * mix(0.4, 1.0, seed.x) * smoothstep(0.3, 1.0, uIntro) * (depth > 0.2 ? 1.0 : 0.0);\r
  vec2 corner = vec2(gl_VertexID == 1 || gl_VertexID == 3 ? 1.0 : 0.0, gl_VertexID >= 2 ? 1.0 : 0.0) * 2.0 - 1.0;\r
  vec2 position = px + corner * radius;\r
  vLocal = corner * radius;\r
  vRadius = radius;\r
  vSegment = 0.0;\r
  vLight = vec3(intensity * 0.8 * uGain, 0.3 + 0.6 * twinkle * uSparkle, coc / max(radius, 1e-3));\r
  vTint = uGradient < 0.5 ? 0.45 + 0.55 * seed.y : seed.y;\r
  gl_Position = vec4(position / uViewport * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const DOT_FRAGMENT = \`\${HEADER}\r
uniform vec3 uGlowColor;\r
uniform vec3 uLineColor;\r
uniform vec3 uSecondaryColor;\r
in vec2 vLocal;\r
in float vRadius;\r
in float vSegment;\r
in vec3 vLight;\r
in float vTint;\r
out vec4 outColor;\r
void main() {\r
  float along = clamp(vLocal.x, 0.0, vSegment);\r
  float d = length(vec2(vLocal.x - along, vLocal.y));\r
  float rho = d / max(vRadius, 1e-3);\r
  if (rho > 1.0) discard;\r
  float soft = clamp(2.6 / max(vRadius, 1e-3), 0.14, 1.0);\r
  float disk = 1.0 - smoothstep(1.0 - soft, 1.0, rho);\r
  float bokeh = disk * (0.94 + 0.08 * smoothstep(0.55, 0.95, rho));\r
  float core = exp(-rho * rho * 3.2);\r
  float shape = mix(core, bokeh, smoothstep(0.25, 0.7, vLight.z));\r
  vec3 color = mix(mix(uGlowColor, uSecondaryColor, vTint), uLineColor, vLight.y);\r
  outColor = vec4(color * shape * vLight.x, shape * vLight.x);\r
}\`;\r
\r
const FULLSCREEN = \`\${HEADER}\r
out vec2 vUv;\r
void main() {\r
  vec2 p = vec2(gl_VertexID == 1 ? 3.0 : -1.0, gl_VertexID == 2 ? 3.0 : -1.0);\r
  vUv = p * 0.5 + 0.5;\r
  gl_Position = vec4(p, 0.0, 1.0);\r
}\`;\r
\r
const BRIGHT_FRAGMENT = \`\${HEADER}\r
uniform sampler2D uSource;\r
uniform vec2 uTexel;\r
in vec2 vUv;\r
out vec4 outColor;\r
vec3 pick(vec2 uv) {\r
  vec3 c = texture(uSource, uv).rgb;\r
  float peak = max(max(c.r, c.g), c.b);\r
  return c * smoothstep(0.35, 1.2, peak);\r
}\r
void main() {\r
  vec2 o = uTexel;\r
  vec3 c = pick(vUv + vec2(-o.x, -o.y)) + pick(vUv + vec2(o.x, -o.y)) + pick(vUv + vec2(-o.x, o.y)) + pick(vUv + vec2(o.x, o.y));\r
  outColor = vec4(c * 0.25, 1.0);\r
}\`;\r
\r
const DOWN_FRAGMENT = \`\${HEADER}\r
uniform sampler2D uSource;\r
uniform vec2 uTexel;\r
in vec2 vUv;\r
out vec4 outColor;\r
void main() {\r
  vec2 o = uTexel;\r
  vec3 c = texture(uSource, vUv).rgb * 4.0;\r
  c += texture(uSource, vUv + vec2(-o.x, -o.y)).rgb;\r
  c += texture(uSource, vUv + vec2(o.x, -o.y)).rgb;\r
  c += texture(uSource, vUv + vec2(-o.x, o.y)).rgb;\r
  c += texture(uSource, vUv + vec2(o.x, o.y)).rgb;\r
  outColor = vec4(c / 8.0, 1.0);\r
}\`;\r
\r
const UP_FRAGMENT = \`\${HEADER}\r
uniform sampler2D uSource;\r
uniform vec2 uTexel;\r
in vec2 vUv;\r
out vec4 outColor;\r
void main() {\r
  vec2 o = uTexel;\r
  vec3 c = texture(uSource, vUv + vec2(-o.x * 2.0, 0.0)).rgb;\r
  c += texture(uSource, vUv + vec2(-o.x, o.y)).rgb * 2.0;\r
  c += texture(uSource, vUv + vec2(0.0, o.y * 2.0)).rgb;\r
  c += texture(uSource, vUv + vec2(o.x, o.y)).rgb * 2.0;\r
  c += texture(uSource, vUv + vec2(o.x * 2.0, 0.0)).rgb;\r
  c += texture(uSource, vUv + vec2(o.x, -o.y)).rgb * 2.0;\r
  c += texture(uSource, vUv + vec2(0.0, -o.y * 2.0)).rgb;\r
  c += texture(uSource, vUv + vec2(-o.x, -o.y)).rgb * 2.0;\r
  outColor = vec4(c / 12.0, 1.0);\r
}\`;\r
\r
const COMPOSITE_FRAGMENT = \`\${HEADER}\r
uniform sampler2D uScene;\r
uniform sampler2D uBloom;\r
uniform float uGlow;\r
uniform float uBrightness;\r
uniform float uLightMode;\r
uniform float uGrain;\r
uniform float uVignette;\r
uniform float uFrame;\r
uniform vec2 uView;\r
uniform float uDpr;\r
in vec2 vUv;\r
out vec4 outColor;\r
\r
float hash(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * 0.1031);\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.x + q.y) * q.z);\r
}\r
\r
float smoother(float x) {\r
  x = clamp(x, 0.0, 1.0);\r
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  vec4 scene = texture(uScene, vUv);\r
  vec3 bloom = texture(uBloom, vUv).rgb;\r
  vec3 light = (scene.rgb + bloom * uGlow) * uBrightness;\r
  float reach = max(uVignette * 0.3, 1e-4);\r
  float mask = uVignette > 0.0 ? smoother(vUv.x / reach) * smoother((1.0 - vUv.x) / reach) * smoother(vUv.y / reach) * smoother((1.0 - vUv.y) / reach) : 1.0;\r
  vec2 cell = floor(vUv * uView / max(uDpr, 1.0));\r
  float grain = hash(cell + uFrame * 17.31) + hash(cell * 1.31 + uFrame * 3.7 + 9.1) - 1.0;\r
  if (uLightMode > 0.5) {\r
    float amount = scene.a * uBrightness;\r
    float ink = (1.0 - exp(-amount * 1.5)) * mask;\r
    ink = clamp(ink * (1.0 + grain * uGrain * 2.0), 0.0, 1.0);\r
    vec3 hue = clamp(scene.rgb / max(scene.a, 1e-4), 0.0, 1.0);\r
    vec3 tone = hue * mix(1.0, 0.72, clamp(amount * 0.35, 0.0, 1.0));\r
    outColor = vec4(tone * ink, ink);\r
    return;\r
  }\r
  vec3 color = (1.0 - exp(-light * 1.25)) * mask;\r
  float peak = max(color.r, max(color.g, color.b));\r
  color = max(color + grain * uGrain * (0.25 + 0.75 * sqrt(peak)), 0.0);\r
  outColor = vec4(color, max(color.r, max(color.g, color.b)));\r
}\`;\r
\r
const SHAPE_UNIFORMS = [\r
  'uTime',\r
  'uTwist',\r
  'uRoll',\r
  'uWaves',\r
  'uWidth',\r
  'uRibbon',\r
  'uOrient',\r
  'uScale',\r
  'uPlace',\r
  'uVolume'\r
];\r
const DOT_UNIFORMS = [\r
  ...SHAPE_UNIFORMS,\r
  'uViewProj',\r
  'uEye',\r
  'uViewport',\r
  'uDpr',\r
  'uFibers',\r
  'uDots',\r
  'uFlow',\r
  'uSize',\r
  'uFocus',\r
  'uDof',\r
  'uMaxCoc',\r
  'uFocal',\r
  'uIntro',\r
  'uPulse',\r
  'uHover',\r
  'uPart',\r
  'uDotLength',\r
  'uSparkle',\r
  'uDepthSpread',\r
  'uGain',\r
  'uTips',\r
  'uTint',\r
  'uGradient',\r
  'uFold',\r
  'uGlowColor',\r
  'uLineColor',\r
  'uSecondaryColor'\r
];\r
const DUST_UNIFORMS = [\r
  'uViewProj',\r
  'uViewport',\r
  'uDpr',\r
  'uTime',\r
  'uSize',\r
  'uFocus',\r
  'uDof',\r
  'uMaxCoc',\r
  'uFocal',\r
  'uIntro',\r
  'uSparkle',\r
  'uScale',\r
  'uGradient',\r
  'uGain',\r
  'uGlowColor',\r
  'uLineColor',\r
  'uSecondaryColor'\r
];\r
const PASS_UNIFORMS = ['uSource', 'uTexel'];\r
const COMPOSITE_UNIFORMS = [\r
  'uScene',\r
  'uBloom',\r
  'uGlow',\r
  'uBrightness',\r
  'uLightMode',\r
  'uGrain',\r
  'uVignette',\r
  'uFrame',\r
  'uView',\r
  'uDpr'\r
];\r
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
const link = (\r
  gl: WebGL2RenderingContext,\r
  vertexSource: string,\r
  fragmentSource: string,\r
  names: string[]\r
): Program | null => {\r
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
  for (const name of names) uniforms[name] = gl.getUniformLocation(program, name);\r
  return { program, uniforms };\r
};\r
\r
const frustum = (fov: number, aspect: number, near: number, far: number) => {\r
  const f = 1 / Math.tan(fov / 2);\r
  const nf = 1 / (near - far);\r
  return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];\r
};\r
\r
const multiply = (a: number[], b: number[]) => {\r
  const out: number[] = new Array(16);\r
  for (let col = 0; col < 4; col += 1) {\r
    for (let row = 0; row < 4; row += 1) {\r
      out[col * 4 + row] =\r
        a[row] * b[col * 4] + a[4 + row] * b[col * 4 + 1] + a[8 + row] * b[col * 4 + 2] + a[12 + row] * b[col * 4 + 3];\r
    }\r
  }\r
  return out;\r
};\r
\r
const orientation = (yaw: number, pitch: number, roll: number) => {\r
  const cy = Math.cos(yaw);\r
  const sy = Math.sin(yaw);\r
  const cp = Math.cos(pitch);\r
  const sp = Math.sin(pitch);\r
  const cr = Math.cos(roll);\r
  const sr = Math.sin(roll);\r
  const ry = [cy, 0, -sy, 0, 1, 0, sy, 0, cy];\r
  const rx = [1, 0, 0, 0, cp, sp, 0, -sp, cp];\r
  const rz = [cr, sr, 0, -sr, cr, 0, 0, 0, 1];\r
  const mul = (a: number[], b: number[]) => {\r
    const out: number[] = new Array(9);\r
    for (let col = 0; col < 3; col += 1) {\r
      for (let row = 0; row < 3; row += 1) {\r
        out[col * 3 + row] = a[row] * b[col * 3] + a[3 + row] * b[col * 3 + 1] + a[6 + row] * b[col * 3 + 2];\r
      }\r
    }\r
    return out;\r
  };\r
  return mul(rz, mul(rx, ry));\r
};\r
\r
const applyMat3 = (m: number[], v: number[]) => [\r
  m[0] * v[0] + m[3] * v[1] + m[6] * v[2],\r
  m[1] * v[0] + m[4] * v[1] + m[7] * v[2],\r
  m[2] * v[0] + m[5] * v[1] + m[8] * v[2]\r
];\r
\r
const GhostFibers = ({\r
  glowColor = '#8b5cf6',\r
  lineColor,\r
  secondaryColor,\r
  gradient = 'depth',\r
  speed = 0.5,\r
  scale = 1,\r
  rotation = 18,\r
  rollSpeed = 0.15,\r
  layers = 3,\r
  waves = 1,\r
  twist = 1.2,\r
  threads = 72,\r
  volume = 0.7,\r
  spread = 1,\r
  density = 1,\r
  thickness = 1,\r
  flow = 0.4,\r
  fiberStyle = 'dots',\r
  tips = 0,\r
  foldGlow = 1,\r
  perspective = 0.65,\r
  depthOfField = 0.85,\r
  focusDepth = 0,\r
  particles = 0.5,\r
  sparkle = 0.5,\r
  glow = 0.8,\r
  brightness = 1,\r
  vignette = 0.3,\r
  grain = 0.06,\r
  mouseInteraction = true,\r
  hoverEffect = 'focus',\r
  mouseStrength = 1,\r
  pulseOnClick = true,\r
  intro = true,\r
  lightMode = false,\r
  paused = false,\r
  dpr,\r
  ...rest\r
}: GhostFibersProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings: Settings = {\r
    glowColor: String(glowColor),\r
    lineColor: lineColor ? String(lineColor) : '',\r
    secondaryColor: secondaryColor ? String(secondaryColor) : '',\r
    gradient: GRADIENTS[gradient] ?? 0,\r
    speed: Math.max(0, speed),\r
    scale: clamp(scale, 0.3, 3),\r
    rotation: rotation * DEG,\r
    rollSpeed,\r
    layers: clamp(Math.round(layers), 1, 3),\r
    waves: Math.max(0, waves),\r
    twist: Math.max(0, twist),\r
    threads: clamp(Math.round(threads), 6, 180),\r
    volume: clamp(volume, 0, 2),\r
    spread: clamp(spread, 0.2, 3),\r
    density: clamp(density, 0.2, 3),\r
    thickness: clamp(thickness, 0.2, 4),\r
    flow,\r
    dotLength: FIBER_STYLES[fiberStyle] ?? 0,\r
    tips: clamp(tips, 0, 1),\r
    foldGlow: clamp(foldGlow, 0, 3),\r
    perspective: clamp(perspective, 0, 1),\r
    depthOfField: clamp(depthOfField, 0, 2),\r
    focusDepth: clamp(focusDepth, -1, 1),\r
    particles: clamp(particles, 0, 2),\r
    sparkle: clamp(sparkle, 0, 2),\r
    glow: Math.max(0, glow),\r
    brightness: Math.max(0, brightness),\r
    vignette: clamp(vignette, 0, 1),\r
    grain: Math.max(0, grain),\r
    mouseInteraction,\r
    hover: HOVER_EFFECTS[hoverEffect] ?? 0,\r
    mouseStrength: Math.max(0, mouseStrength),\r
    pulseOnClick,\r
    intro,\r
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
    const dots = link(gl, DOT_VERTEX, DOT_FRAGMENT, DOT_UNIFORMS);\r
    const dust = link(gl, DUST_VERTEX, DOT_FRAGMENT, DUST_UNIFORMS);\r
    const bright = link(gl, FULLSCREEN, BRIGHT_FRAGMENT, PASS_UNIFORMS);\r
    const down = link(gl, FULLSCREEN, DOWN_FRAGMENT, PASS_UNIFORMS);\r
    const up = link(gl, FULLSCREEN, UP_FRAGMENT, PASS_UNIFORMS);\r
    const composite = link(gl, FULLSCREEN, COMPOSITE_FRAGMENT, COMPOSITE_UNIFORMS);\r
    if (!dots || !dust || !bright || !down || !up || !composite) return undefined;\r
\r
    const format = floatTargets ? gl.RGBA16F : gl.RGBA8;\r
    const makeTarget = (): Target => ({ texture: null, framebuffer: gl.createFramebuffer(), width: 0, height: 0 });\r
    const allocate = (target: Target, width: number, height: number) => {\r
      if (target.texture && target.width === width && target.height === height) return;\r
      if (target.texture) gl.deleteTexture(target.texture);\r
      const texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texStorage2D(gl.TEXTURE_2D, 1, format, width, height);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
      target.texture = texture;\r
      target.width = width;\r
      target.height = height;\r
    };\r
    const scene = makeTarget();\r
    const chain = Array.from({ length: BLOOM_LEVELS }, makeTarget);\r
    const vao = gl.createVertexArray();\r
\r
    const probe = document.createElement('canvas');\r
    probe.width = 1;\r
    probe.height = 1;\r
    const probeContext = probe.getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const state = {\r
      time: 0,\r
      roll: 0,\r
      flow: 0,\r
      frame: 0,\r
      intro: settingsRef.current.intro && !reduce ? 0 : INTRO_SECONDS,\r
      width: 1,\r
      height: 1,\r
      fit: 1,\r
      colorKey: '',\r
      glow: [0.55, 0.36, 0.96],\r
      line: [1, 0.85, 0.98],\r
      secondary: [0.44, 0.29, 0.77],\r
      pointer: { x: 0, y: 0, inside: false },\r
      hover: { x: 0, y: 0, presence: 0, placed: false },\r
      look: { x: 0, y: 0, vx: 0, vy: 0 },\r
      focus: CAMERA + settingsRef.current.focusDepth * 3,\r
      pulse: { s: 0, age: 9, strength: 0, ribbon: 0 },\r
      camera: null as Camera | null\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let alive = true;\r
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
      const key = \`\${s.glowColor}|\${s.lineColor}|\${s.secondaryColor}|\${s.lightMode}\`;\r
      if (key === state.colorKey) return;\r
      state.colorKey = key;\r
      state.glow = toRgb(s.glowColor, [0.55, 0.36, 0.96]);\r
      state.secondary = s.secondaryColor ? toRgb(s.secondaryColor, state.glow) : state.glow.map(c => c * 0.8);\r
      if (s.lineColor) state.line = toRgb(s.lineColor, state.glow);\r
      else state.line = s.lightMode ? state.glow : state.glow.map(c => c + (1 - c) * 0.72);\r
    };\r
\r
    const centerLocal = (s: number, t: number, ribbon: number, waves: number) => {\r
      const place = PLACEMENTS[ribbon];\r
      const ph = place[3];\r
      const x = s * RIBBON_LENGTH;\r
      const y =\r
        waves * (0.52 * Math.sin(x * 0.43 + t * 0.31 + ph) + 0.26 * Math.sin(x * 0.79 - t * 0.23 + 1.3 + ph * 0.7)) +\r
        place[0] +\r
        x * place[2];\r
      const z = waves * 0.65 * Math.sin(x * 0.33 + t * 0.19 + 0.7 + ph * 1.3) + place[1];\r
      return [x, y, z];\r
    };\r
\r
    const cameraFor = (s: Settings): Camera => {\r
      const aspect = state.width / Math.max(state.height, 1);\r
      const eye = [0, 0, CAMERA];\r
      const projection = frustum(FOV, aspect, 0.1, 60);\r
      const view = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -eye[0], -eye[1], -eye[2], 1];\r
      const orient = orientation(s.perspective * 0.85 + state.look.x * 0.22, 0.12 - state.look.y * 0.14, s.rotation);\r
      return { eye, viewProj: multiply(projection, view), orient };\r
    };\r
\r
    const screenOf = (camera: Camera, world: number[]) => {\r
      const m = camera.viewProj;\r
      const x = m[0] * world[0] + m[4] * world[1] + m[8] * world[2] + m[12];\r
      const y = m[1] * world[0] + m[5] * world[1] + m[9] * world[2] + m[13];\r
      const w = m[3] * world[0] + m[7] * world[1] + m[11] * world[2] + m[15];\r
      return { x: ((x / w) * 0.5 + 0.5) * state.width, y: (0.5 - (y / w) * 0.5) * state.height, depth: w };\r
    };\r
\r
    const nearestOnRibbon = (s: Settings, px: number, py: number): Nearest | null => {\r
      const camera = state.camera;\r
      if (!camera) return null;\r
      let best: Nearest | null = null;\r
      for (let ribbon = 0; ribbon < s.layers; ribbon += 1) {\r
        for (let i = 0; i <= 96; i += 1) {\r
          const u = i / 96 - 0.5;\r
          const local = centerLocal(u, state.time, ribbon, s.waves).map(c => c * s.scale * state.fit);\r
          const world = applyMat3(camera.orient, local);\r
          const screen = screenOf(camera, world);\r
          const gap = Math.hypot(screen.x - px, screen.y - py);\r
          if (!best || gap < best.gap) best = { gap, s: u, ribbon, depth: screen.depth };\r
        }\r
      }\r
      return best;\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const baseDpr = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      const longest = Math.max(width, height) * baseDpr;\r
      const ratio = longest > MAX_RENDER_DIM ? (baseDpr * MAX_RENDER_DIM) / longest : baseDpr;\r
      const pixelWidth = Math.max(1, Math.round(width * ratio));\r
      const pixelHeight = Math.max(1, Math.round(height * ratio));\r
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {\r
        canvas.width = pixelWidth;\r
        canvas.height = pixelHeight;\r
      }\r
      state.width = width;\r
      state.height = height;\r
      state.fit = clamp(width / height / 1.5, 0.6, 1);\r
      render();\r
    };\r
\r
    const drawPass = (program: Program, target: Target, source: Target, texel: number[]) => {\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);\r
      gl.viewport(0, 0, target.width, target.height);\r
      gl.useProgram(program.program);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, source.texture);\r
      gl.uniform1i(program.uniforms.uSource, 0);\r
      gl.uniform2f(program.uniforms.uTexel, texel[0], texel[1]);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      resolveColors(s);\r
      const camera = cameraFor(s);\r
      state.camera = camera;\r
      const ratio = canvas.height / Math.max(state.height, 1);\r
      const intro = s.paused || reduce ? 1 : clamp(state.intro / INTRO_SECONDS, 0, 1);\r
      const introEase = 1 - (1 - intro) * (1 - intro) * (1 - intro);\r
\r
      allocate(scene, canvas.width, canvas.height);\r
      gl.bindVertexArray(vao);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, scene.framebuffer);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE);\r
\r
      const dotsPerFiber = Math.round(260 * s.density);\r
      const blurCap = 22 * clamp(Math.sqrt(56000 / (s.threads * dotsPerFiber * s.layers)), 0.45, 1);\r
      const area = Math.max(0.8 * s.thickness, 0.45) ** 2 / 0.64;\r
      const load = Math.pow((s.threads / 72) * s.density * area, -0.75);\r
      gl.useProgram(dots.program);\r
      const u = dots.uniforms;\r
      gl.uniform1f(u.uTime, state.time);\r
      gl.uniform1f(u.uTwist, s.twist);\r
      gl.uniform1f(u.uRoll, state.roll);\r
      gl.uniform1f(u.uWaves, s.waves);\r
      gl.uniform1f(u.uWidth, 0.62 * s.spread);\r
      gl.uniformMatrix3fv(u.uOrient, false, camera.orient);\r
      gl.uniform1f(u.uScale, s.scale * state.fit);\r
      gl.uniformMatrix4fv(u.uViewProj, false, camera.viewProj);\r
      gl.uniform3f(u.uEye, camera.eye[0], camera.eye[1], camera.eye[2]);\r
      gl.uniform2f(u.uViewport, canvas.width, canvas.height);\r
      gl.uniform1f(u.uDpr, ratio);\r
      gl.uniform1f(u.uFibers, s.threads);\r
      gl.uniform1f(u.uDots, dotsPerFiber);\r
      gl.uniform1f(u.uFlow, state.flow);\r
      gl.uniform1f(u.uSize, 1.6 * s.thickness);\r
      gl.uniform1f(u.uFocus, state.focus);\r
      gl.uniform1f(u.uDof, s.depthOfField);\r
      gl.uniform1f(u.uMaxCoc, blurCap);\r
      gl.uniform1f(u.uFocal, CAMERA);\r
      gl.uniform1f(u.uIntro, introEase);\r
      gl.uniform4f(u.uPulse, state.pulse.s, state.pulse.age, state.pulse.strength, state.pulse.ribbon);\r
      gl.uniform4f(\r
        u.uHover,\r
        state.hover.x * ratio,\r
        (state.height - state.hover.y) * ratio,\r
        140 * ratio,\r
        state.hover.presence * s.mouseStrength\r
      );\r
      gl.uniform1f(u.uPart, s.hover === 1 ? 1 : 0);\r
      gl.uniform1f(u.uDotLength, s.dotLength);\r
      gl.uniform1f(u.uSparkle, s.sparkle);\r
      gl.uniform1f(u.uDepthSpread, 0.12);\r
      gl.uniform1f(u.uVolume, s.volume);\r
      gl.uniform3f(u.uGlowColor, state.glow[0], state.glow[1], state.glow[2]);\r
      gl.uniform3f(u.uLineColor, state.line[0], state.line[1], state.line[2]);\r
      gl.uniform3f(u.uSecondaryColor, state.secondary[0], state.secondary[1], state.secondary[2]);\r
      gl.uniform1f(u.uTips, s.tips);\r
      gl.uniform1f(u.uGradient, s.gradient);\r
      gl.uniform1f(u.uFold, s.foldGlow);\r
      for (let ribbon = 0; ribbon < s.layers; ribbon += 1) {\r
        const place = PLACEMENTS[ribbon];\r
        gl.uniform1f(u.uRibbon, ribbon);\r
        gl.uniform4f(u.uPlace, place[0], place[1], place[2], place[3]);\r
        gl.uniform1f(u.uGain, RIBBON_GAIN[ribbon] * load);\r
        gl.uniform1f(u.uTint, RIBBON_TINT[ribbon]);\r
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, s.threads * dotsPerFiber);\r
      }\r
\r
      const dustCount = Math.round(420 * s.particles);\r
      if (dustCount > 0) {\r
        gl.useProgram(dust.program);\r
        const d = dust.uniforms;\r
        gl.uniformMatrix4fv(d.uViewProj, false, camera.viewProj);\r
        gl.uniform2f(d.uViewport, canvas.width, canvas.height);\r
        gl.uniform1f(d.uDpr, ratio);\r
        gl.uniform1f(d.uTime, state.time);\r
        gl.uniform1f(d.uSize, 2.2 * s.thickness);\r
        gl.uniform1f(d.uFocus, state.focus);\r
        gl.uniform1f(d.uDof, s.depthOfField);\r
        gl.uniform1f(d.uMaxCoc, 22);\r
        gl.uniform1f(d.uFocal, CAMERA);\r
        gl.uniform1f(d.uIntro, introEase);\r
        gl.uniform1f(d.uSparkle, s.sparkle);\r
        gl.uniform1f(d.uScale, s.scale * state.fit);\r
        gl.uniform1f(d.uGradient, s.gradient);\r
        gl.uniform1f(d.uGain, 1 / s.thickness);\r
        gl.uniform3f(d.uGlowColor, state.glow[0], state.glow[1], state.glow[2]);\r
        gl.uniform3f(d.uLineColor, state.line[0], state.line[1], state.line[2]);\r
        gl.uniform3f(d.uSecondaryColor, state.secondary[0], state.secondary[1], state.secondary[2]);\r
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, dustCount);\r
      }\r
      gl.disable(gl.BLEND);\r
\r
      const blooming = s.glow > 0.001 && !s.lightMode;\r
      gl.bindVertexArray(vao);\r
      if (blooming) {\r
        chain.forEach((target, index) => {\r
          allocate(\r
            target,\r
            Math.max(1, Math.round(canvas.width / 2 ** (index + 1))),\r
            Math.max(1, Math.round(canvas.height / 2 ** (index + 1)))\r
          );\r
        });\r
        drawPass(bright, chain[0], scene, [0.5 / scene.width, 0.5 / scene.height]);\r
        for (let index = 1; index < BLOOM_LEVELS; index += 1) {\r
          drawPass(down, chain[index], chain[index - 1], [1 / chain[index - 1].width, 1 / chain[index - 1].height]);\r
        }\r
        gl.enable(gl.BLEND);\r
        gl.blendFunc(gl.ONE, gl.ONE);\r
        for (let index = BLOOM_LEVELS - 1; index > 0; index -= 1) {\r
          drawPass(up, chain[index - 1], chain[index], [0.5 / chain[index].width, 0.5 / chain[index].height]);\r
        }\r
        gl.disable(gl.BLEND);\r
      }\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.useProgram(composite.program);\r
      const c = composite.uniforms;\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, scene.texture);\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.bindTexture(gl.TEXTURE_2D, blooming ? chain[0].texture : scene.texture);\r
      gl.uniform1i(c.uScene, 0);\r
      gl.uniform1i(c.uBloom, 1);\r
      gl.uniform1f(c.uGlow, blooming ? s.glow : 0);\r
      gl.uniform1f(c.uBrightness, s.brightness);\r
      gl.uniform1f(c.uLightMode, s.lightMode ? 1 : 0);\r
      gl.uniform1f(c.uGrain, s.grain);\r
      gl.uniform1f(c.uVignette, s.vignette);\r
      gl.uniform1f(c.uFrame, state.frame % 977);\r
      gl.uniform2f(c.uView, canvas.width, canvas.height);\r
      gl.uniform1f(c.uDpr, ratio);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.bindTexture(gl.TEXTURE_2D, null);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, null);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!alive || !visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const elapsed = last ? (now - last) / 1000 : 1 / 60;\r
      const dt = Math.min(0.05, elapsed);\r
      last = now;\r
      const moving = !s.paused && !reduce;\r
      if (moving) {\r
        state.frame += 1;\r
        state.time += dt * s.speed;\r
        state.roll += dt * s.speed * s.rollSpeed;\r
        state.flow += dt * s.flow * 12;\r
        state.intro += Math.min(elapsed, 1);\r
      } else if (state.intro < INTRO_SECONDS) {\r
        state.intro = INTRO_SECONDS;\r
      }\r
      state.pulse.age += dt;\r
      state.pulse.strength = Math.max(0, 1 - state.pulse.age / 1.8) ** 2;\r
\r
      const { pointer, hover, look } = state;\r
      const active = s.mouseInteraction && pointer.inside && !reduce;\r
      if (active && !hover.placed) {\r
        hover.x = pointer.x;\r
        hover.y = pointer.y;\r
        hover.placed = true;\r
      }\r
      hover.x += (pointer.x - hover.x) * (1 - Math.exp(-dt / 0.08));\r
      hover.y += (pointer.y - hover.y) * (1 - Math.exp(-dt / 0.08));\r
      const goal = active ? 1 : 0;\r
      hover.presence += (goal - hover.presence) * (1 - Math.exp(-dt / (goal > hover.presence ? 0.3 : 0.6)));\r
      if (!active && hover.presence < 0.001) hover.placed = false;\r
      const lookX = active ? (pointer.x / state.width - 0.5) * 0.5 : 0;\r
      const lookY = active ? (0.5 - pointer.y / state.height) * 0.5 : 0;\r
      look.vx += (30 * (lookX - look.x) - 11 * look.vx) * dt;\r
      look.vy += (30 * (lookY - look.y) - 11 * look.vy) * dt;\r
      look.x += look.vx * dt;\r
      look.y += look.vy * dt;\r
\r
      const resting = CAMERA + s.focusDepth * 3;\r
      let focusGoal = resting;\r
      if (active && s.hover === 0) {\r
        const near = nearestOnRibbon(s, hover.x, hover.y);\r
        if (near) focusGoal = resting + (near.depth - resting) * hover.presence * Math.min(1, s.mouseStrength);\r
      }\r
      state.focus += (focusGoal - state.focus) * (1 - Math.exp(-dt / 0.35));\r
\r
      render();\r
      const settling =\r
        Math.abs(goal - hover.presence) > 0.002 ||\r
        Math.abs(lookX - look.x) > 0.0002 ||\r
        Math.abs(lookY - look.y) > 0.0002 ||\r
        Math.abs(focusGoal - state.focus) > 0.001 ||\r
        state.pulse.strength > 0.001;\r
      if (moving || settling) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
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
      state.pointer.x = x;\r
      state.pointer.y = y;\r
      state.pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      if (!s.mouseInteraction || !s.pulseOnClick || event.button !== 0 || reduce) return;\r
      if (\r
        event.target instanceof Element &&\r
        event.target.closest('a, button, input, textarea, select, label, [role="button"]')\r
      )\r
        return;\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;\r
      const near = nearestOnRibbon(s, x, y);\r
      if (near) state.pulse = { s: near.s, age: 0, strength: 1, ribbon: near.ribbon };\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      state.pointer.inside = false;\r
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
    window.addEventListener('pointerdown', onPointerDown);\r
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
    wake();\r
\r
    wakeRef.current = () => {\r
      if (!raf) render();\r
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
      window.removeEventListener('pointerdown', onPointerDown);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteVertexArray(vao);\r
      [scene, ...chain].forEach(target => {\r
        if (target.texture) gl.deleteTexture(target.texture);\r
        gl.deleteFramebuffer(target.framebuffer);\r
      });\r
      [dots, dust, bright, down, up, composite].forEach(entry => gl.deleteProgram(entry.program));\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  const { className = '', ...attributes } = rest;\r
\r
  return (\r
    <div\r
      ref={containerRef}\r
      className={['relative h-full w-full overflow-hidden', className].filter(Boolean).join(' ')}\r
      {...attributes}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default GhostFibers;\r
`,a={usage:`import GhostFibers from './GhostFibers';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <GhostFibers
    glowColor="#8b5cf6"
    layers={3}
    twist={1.2}
    threads={72}
    fiberStyle="dots"
    depthOfField={0.85}
    hoverEffect="focus"
    intro={true}
    mouseInteraction={true}
  />
</div>`,code:r,css:n,tailwind:e,tsCode:t,tsTailwind:o};export{a as ghostFibers};
