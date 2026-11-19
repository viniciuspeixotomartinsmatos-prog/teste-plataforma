const r=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
import './Ferrofluid.css';\r
\r
const CELL = 1 / 3;\r
const BOUND_CELL = 1;\r
const INTRO_SECONDS = 2.4;\r
const FOV = (38 * Math.PI) / 180;\r
const FLOW = { up: [0, 1], down: [0, -1], left: [-1, 0], right: [1, 0], none: [0, 0] };\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const SIM_FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uState;\r
uniform vec2 uGridOrigin;\r
uniform float uCell;\r
uniform float uDt;\r
uniform float uTime;\r
uniform vec2 uFlow;\r
uniform float uTurbulence;\r
uniform float uMagnetism;\r
uniform float uFieldScale;\r
uniform vec2 uSeed;\r
uniform vec4 uCursor;\r
uniform vec4 uPulse;\r
uniform float uPulseSpeed;\r
uniform float uPulseWidth;\r
uniform vec3 uIntro;\r
uniform float uSpikeHeight;\r
uniform float uMound;\r
uniform float uStiffness;\r
uniform float uDamping;\r
uniform float uSettle;\r
out vec4 outState;\r
\r
float hash(vec2 p) {\r
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);\r
  p3 += dot(p3, p3.yzx + 33.33);\r
  return fract((p3.x + p3.y) * p3.z);\r
}\r
\r
float noise(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = fract(p);\r
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);\r
  float a = hash(i);\r
  float b = hash(i + vec2(1.0, 0.0));\r
  float c = hash(i + vec2(0.0, 1.0));\r
  float d = hash(i + vec2(1.0, 1.0));\r
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);\r
}\r
\r
float flowField(vec2 p) {\r
  vec2 q = p / uFieldScale + uSeed;\r
  vec2 drift = uFlow * uTime * 0.55;\r
  vec2 warp = vec2(noise(q * 0.6 + vec2(uTime * 0.07, 3.1)), noise(q * 0.6 - vec2(7.3, uTime * 0.06))) - 0.5;\r
  vec2 r = q + warp * 1.8 * uTurbulence - drift;\r
  float n = noise(r) * 0.65 + noise(r * 2.03 + 11.7 - drift * 0.5) * 0.35;\r
  return smoothstep(0.44, 0.86, n);\r
}\r
\r
void main() {\r
  vec2 texel = floor(gl_FragCoord.xy);\r
  vec2 p = uGridOrigin + (texel + 0.5) * uCell;\r
  vec4 prev = texelFetch(uState, ivec2(texel), 0);\r
  float swell = flowField(p);\r
  float field = uMagnetism * (0.03 + 1.0 * swell * swell);\r
  vec2 dc = p - uCursor.xy;\r
  float falloff = dot(dc, dc) / (uCursor.w * uCursor.w);\r
  field += uCursor.z * exp(-falloff);\r
  float mound = uCursor.z * exp(-falloff / 2.2);\r
  if (uPulse.w > 0.0) {\r
    float ring = length(p - uPulse.xy) - uPulse.z * uPulseSpeed;\r
    float envelope = smoothstep(0.0, 0.08, uPulse.z) * exp(-uPulse.z * 1.1);\r
    field += uPulse.w * envelope * exp(-ring * ring / (uPulseWidth * uPulseWidth));\r
  }\r
  float front = clamp((uIntro.z - length(p - uIntro.xy)) / 3.0, 0.0, 1.0);\r
  front = front * front * (3.0 - 2.0 * front);\r
  float target = uSpikeHeight * min(pow(max(field * front - 0.04, 0.0), 1.6), 1.0);\r
  float height = prev.x;\r
  float velocity = prev.y;\r
  if (uSettle > 0.5) {\r
    height = target;\r
    velocity = 0.0;\r
  } else {\r
    float steps = ceil(uDt / 0.008);\r
    float h = uDt / steps;\r
    for (int k = 0; k < 8; k++) {\r
      if (float(k) >= steps) break;\r
      velocity += (uStiffness * (target - height) - uDamping * velocity) * h;\r
      height += velocity * h;\r
    }\r
    if (height < 0.0) {\r
      height = 0.0;\r
      velocity = max(velocity, 0.0);\r
    }\r
  }\r
  outState = vec4(height, velocity, mound * front * uMound, 1.0);\r
}\`;\r
\r
const BOUND_FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uState;\r
uniform vec2 uGridOrigin;\r
uniform float uCell;\r
uniform vec2 uStateSize;\r
uniform float uBoundCell;\r
out vec4 outBound;\r
\r
void main() {\r
  vec2 center = uGridOrigin + (floor(gl_FragCoord.xy) + 0.5) * uBoundCell;\r
  vec2 base = floor((center - uGridOrigin) / uCell);\r
  float top = 0.0;\r
  float peak = 0.0;\r
  for (int y = -4; y <= 4; y++) {\r
    for (int x = -4; x <= 4; x++) {\r
      vec2 texel = clamp(base + vec2(float(x), float(y)), vec2(0.0), uStateSize - 1.0);\r
      vec4 s = texelFetch(uState, ivec2(texel), 0);\r
      top = max(top, max(s.x, 0.0) * 1.05 + s.z);\r
      peak = max(peak, s.x);\r
    }\r
  }\r
  outBound = vec4(top, peak, 0.0, 1.0);\r
}\`;\r
\r
const RENDER_FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uField;\r
uniform sampler2D uBound;\r
uniform vec2 uGridOrigin;\r
uniform vec2 uGridSpan;\r
uniform vec2 uBoundSpan;\r
uniform float uCellSize;\r
uniform vec2 uResolution;\r
uniform vec3 uCamera;\r
uniform vec3 uForward;\r
uniform vec3 uUpward;\r
uniform float uTanHalf;\r
uniform float uPixelAngle;\r
uniform float uFar;\r
uniform float uFogStart;\r
uniform float uTop;\r
uniform float uBottom;\r
uniform float uTime;\r
uniform vec4 uCursor;\r
uniform float uMound;\r
uniform float uRound;\r
uniform float uSpan;\r
uniform float uExponent;\r
uniform float uWarp;\r
uniform vec3 uKey;\r
uniform vec3 uStrip;\r
uniform vec3 uFill;\r
uniform float uExposure;\r
uniform float uLight;\r
uniform float uOpaque;\r
uniform vec3 uBase;\r
uniform float uOpacity;\r
out vec4 outColor;\r
\r
const float G = 7.2551975;\r
const vec2 E1 = vec2(0.8660254, 0.5);\r
const vec2 E2 = vec2(-0.8660254, 0.5);\r
const vec2 E3 = vec2(0.0, -1.0);\r
const mat2 TURN = mat2(0.9902681, 0.1391731, -0.1391731, 0.9902681);\r
const float F0 = 0.06;\r
\r
vec3 mound(vec2 p) {\r
  vec2 d = p - uCursor.xy;\r
  float inv = 1.0 / (uCursor.w * uCursor.w * 2.2);\r
  float e = uCursor.z * exp(-dot(d, d) * inv);\r
  return vec3(e, -2.0 * inv * e * d) * uMound;\r
}\r
\r
vec2 lattice(vec2 p) {\r
  vec2 q = TURN * p;\r
  float t = uTime * 0.35;\r
  return q + uWarp * vec2(sin(q.y * 0.9 + t), cos(q.x * 0.8 - t * 0.8));\r
}\r
\r
float detail(float t) {\r
  return smoothstep(3.0, 8.0, 1.0 / max(t * uPixelAngle, 1e-5)) * (1.0 - smoothstep(uFogStart, mix(uFogStart, uFar, 0.7), t));\r
}\r
\r
float profile(float u, out float rate) {\r
  float root = sqrt(max(1.0 - u, 0.0) + uRound * uRound);\r
  rate = 0.5 / (uSpan * root);\r
  return clamp(1.0 - (root - uRound) / uSpan, 0.0, 1.0);\r
}\r
\r
float spikes(vec2 p, float a, float rise, out float clearance) {\r
  clearance = 10.0;\r
  if (a < 0.002) return 0.0;\r
  vec2 q = lattice(p);\r
  float u = (cos(G * dot(E1, q)) + cos(G * dot(E2, q)) + cos(G * dot(E3, q)) + 1.5) / 4.5;\r
  if (a > 0.05) {\r
    float root = uRound + (1.0 - pow(clamp(rise / a, 0.0, 1.0), 1.0 / uExponent)) * uSpan;\r
    clearance = sqrt(max(1.0 - u, 0.0) / 8.77) - sqrt(max(root * root - uRound * uRound, 0.0) / 8.77);\r
  }\r
  float rate;\r
  return a * pow(profile(u, rate), uExponent);\r
}\r
\r
vec2 spikesSlope(vec2 p, float a, vec2 aSlope) {\r
  if (a < 0.002) return vec2(0.0);\r
  vec2 q = lattice(p);\r
  float c1 = G * dot(E1, q);\r
  float c2 = G * dot(E2, q);\r
  float c3 = G * dot(E3, q);\r
  float u = (cos(c1) + cos(c2) + cos(c3) + 1.5) / 4.5;\r
  vec2 du = -(G / 4.5) * (sin(c1) * E1 + sin(c2) * E2 + sin(c3) * E3) * TURN;\r
  float rate;\r
  float s = max(profile(u, rate), 1e-4);\r
  float shape = pow(s, uExponent);\r
  return a * uExponent * shape / s * rate * du + aSlope * shape;\r
}\r
\r
float surface(vec2 p, float z, float t, out float clearance) {\r
  vec4 f = texture(uField, (p - uGridOrigin) / uGridSpan);\r
  return f.z + spikes(p, f.x * detail(t), z - f.z, clearance);\r
}\r
\r
vec2 bound(vec2 p) {\r
  return texture(uBound, (p - uGridOrigin) / uBoundSpan).rg;\r
}\r
\r
float panel(vec3 r, vec3 dir, vec3 up, vec2 extent, float soft) {\r
  vec3 side = normalize(cross(dir, up));\r
  vec3 top = cross(side, dir);\r
  float facing = dot(r, dir);\r
  if (facing <= 0.0) return 0.0;\r
  vec2 q = vec2(dot(r, side), dot(r, top)) / facing;\r
  vec2 e = smoothstep(extent + soft, extent - soft, abs(q));\r
  return e.x * e.y;\r
}\r
\r
vec3 studio(vec3 r, vec3 rd, float soft) {\r
  vec3 z = vec3(0.0, 0.0, 1.0);\r
  vec3 col = uKey * 4.2 * panel(r, normalize(vec3(-0.3, -0.5, 0.81)), z, vec2(0.36, 0.22), 0.08 + soft);\r
  col += uStrip * 1.5 * panel(r, normalize(vec3(-0.9, -0.2, 0.38)), z, vec2(0.12, 0.7), 0.07 + soft);\r
  col += uStrip * 1.5 * panel(r, normalize(vec3(0.9, -0.1, 0.42)), z, vec2(0.12, 0.7), 0.07 + soft);\r
  float lift = asin(clamp(r.z, -1.0, 1.0)) - asin(clamp(-rd.z, -1.0, 1.0));\r
  col += uFill * 0.45 * smoothstep(0.08 - soft, 0.7 + soft, lift) * smoothstep(1.6, 1.0, lift);\r
  return col;\r
}\r
\r
vec4 finish(vec3 light, vec3 paper, float alpha) {\r
  if (uLight > 0.5) {\r
    if (uOpaque > 0.5) return vec4(mix(uBase, paper, alpha) * uOpacity, uOpacity);\r
    vec3 shade = mix(vec3(1.0), paper, alpha * uOpacity);\r
    float cover = 1.0 - min(shade.r, min(shade.g, shade.b));\r
    return vec4(shade - (1.0 - cover), cover);\r
  }\r
  vec3 glow = light * alpha * uOpacity;\r
  if (uOpaque > 0.5) return vec4(uBase + glow, 1.0);\r
  return vec4(glow, max(glow.r, max(glow.g, glow.b)));\r
}\r
\r
void main() {\r
  vec2 ndc = (gl_FragCoord.xy - 0.5 * uResolution) / (0.5 * uResolution.y);\r
  vec3 side = normalize(cross(uForward, uUpward));\r
  vec3 rd = normalize(uForward + (ndc.x * side + ndc.y * uUpward) * uTanHalf);\r
  if (rd.z > -0.004) {\r
    outColor = finish(vec3(0.0), vec3(1.0), 0.0);\r
    return;\r
  }\r
  float tTop = max((uTop - uCamera.z) / rd.z, 0.0);\r
  float tEnd = min((uBottom - uCamera.z) / rd.z, uFar);\r
  if (tTop >= tEnd) {\r
    outColor = finish(vec3(0.0), vec3(1.0), 0.0);\r
    return;\r
  }\r
  float sink = max(-rd.z, 0.2);\r
  float glide = max(length(rd.xy), 0.05);\r
  float chunk = 0.9 / glide;\r
  float t = tEnd;\r
  float tPrev = tEnd;\r
  bool found = false;\r
  bool smoothHit = false;\r
  float t0 = tTop;\r
  vec2 b0 = bound(uCamera.xy + rd.xy * t0);\r
  for (int c = 0; c < 64; c++) {\r
    if (t0 >= tEnd) break;\r
    float t1 = min(t0 + chunk, tEnd);\r
    vec2 b1 = bound(uCamera.xy + rd.xy * t1);\r
    float b = max(b0.x, b1.x) + 0.03;\r
    float z1 = uCamera.z + rd.z * t1;\r
    if (z1 > b) {\r
      t0 = t1;\r
      b0 = b1;\r
      continue;\r
    }\r
    float tt = max(t0, (b - uCamera.z) / rd.z);\r
    if (max(b0.y, b1.y) < 0.002) {\r
      for (int k = 0; k < 3; k++) {\r
        vec3 probe = uCamera + rd * tt;\r
        tt += (probe.z - mound(probe.xy).x) / sink * 0.95;\r
      }\r
      if (tt <= t1 + 0.02 || t1 >= tEnd) {\r
        t = tt;\r
        smoothHit = true;\r
        break;\r
      }\r
      t0 = t1;\r
      b0 = b1;\r
      continue;\r
    }\r
    float tp = tt;\r
    for (int k = 0; k < 48; k++) {\r
      vec3 pos = uCamera + rd * tt;\r
      float clearance;\r
      float gap = pos.z - surface(pos.xy, pos.z, tt, clearance);\r
      if (gap < 0.0) {\r
        found = true;\r
        break;\r
      }\r
      tp = tt;\r
      float pixel = tt * uPixelAngle;\r
      float limit = pos.z > bound(pos.xy).x + 0.02 ? 0.6 / glide : max(clearance * 0.9, pixel) / glide;\r
      tt += max(min(gap * 0.75 / sink, limit), pixel);\r
      if (tt > t1) break;\r
    }\r
    if (found) {\r
      t = tt;\r
      tPrev = tp;\r
      break;\r
    }\r
    t0 = t1;\r
    b0 = b1;\r
  }\r
\r
  vec3 pos;\r
  vec2 slope;\r
  if (smoothHit || !found) {\r
    pos = uCamera + rd * t;\r
    slope = mound(pos.xy).yz;\r
  } else {\r
    float lo = tPrev;\r
    float hi = t;\r
    for (int k = 0; k < 4; k++) {\r
      float mid = 0.5 * (lo + hi);\r
      vec3 probe = uCamera + rd * mid;\r
      float clearance;\r
      if (probe.z - surface(probe.xy, probe.z, mid, clearance) < 0.0) hi = mid;\r
      else lo = mid;\r
    }\r
    t = hi;\r
    pos = uCamera + rd * t;\r
    vec2 uv = (pos.xy - uGridOrigin) / uGridSpan;\r
    vec2 step = uCellSize / uGridSpan;\r
    float fade = detail(t);\r
    float a = texture(uField, uv).x * fade;\r
    vec2 aSlope = vec2(\r
      texture(uField, uv + vec2(step.x, 0.0)).x - texture(uField, uv - vec2(step.x, 0.0)).x,\r
      texture(uField, uv + vec2(0.0, step.y)).x - texture(uField, uv - vec2(0.0, step.y)).x\r
    ) * fade / (2.0 * uCellSize);\r
    slope = mound(pos.xy).yz + spikesSlope(pos.xy, a, aSlope);\r
  }\r
\r
  vec3 n = normalize(vec3(-slope, 1.0));\r
  vec3 r = reflect(rd, n);\r
  float soft = length(fwidth(r)) * 0.6;\r
  float facing = max(dot(n, -rd), 0.0);\r
  float fresnel = F0 + (1.0 - F0) * pow(1.0 - facing, 5.0);\r
  float rim = pow(1.0 - clamp(abs(dot(rd, n)), 0.0, 1.0), 3.0) * smoothstep(0.85, 0.4, n.z);\r
  float distance = 1.0 - smoothstep(uFogStart, uFar, t);\r
\r
  if (uLight > 0.5) {\r
    vec3 key = normalize(vec3(-0.45, -0.55, 0.7));\r
    float lambert = clamp(dot(n, key) / key.z, 0.0, 1.0);\r
    float diffuse = mix(0.62, 1.0, lambert);\r
    float room = mix(0.3, 1.0, smoothstep(-0.25, 0.3, r.z));\r
    room -= 0.3 * rim;\r
    float lum = mix(diffuse, room, fresnel);\r
    lum = 1.0 - (1.0 - lum) * clamp(uExposure / 3.0, 0.0, 1.5);\r
    vec3 shadow = mix(vec3(0.0), uStrip, 0.45);\r
    vec3 paper = mix(shadow, vec3(1.0), clamp(lum, 0.0, 1.0));\r
    outColor = finish(vec3(0.0), paper, distance);\r
    return;\r
  }\r
\r
  vec3 shine = 1.0 - exp(-(studio(r, rd, soft) * fresnel + uFill * rim * 0.35) * uExposure);\r
  outColor = finish(shine, vec3(1.0), distance);\r
}\`;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const shapeOf = sharpness => {\r
  const edge = clamp((sharpness - 1) / 4, 0, 1);\r
  const round = 1 - edge * 0.7;\r
  const exponent = 1.05 + edge * 1.2;\r
  const span = Math.sqrt(1 + round * round) - round;\r
  return { round, exponent, span };\r
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
    if (info) uniforms[info.name.replace('[0]', '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const Ferrofluid = ({\r
  colors = ['#ffffff', '#ffffff', '#ffffff'],\r
  speed = 0.5,\r
  scale = 1.6,\r
  spikeHeight = 1,\r
  sharpness = 2.5,\r
  turbulence = 1,\r
  fluidity = 0.5,\r
  tilt = 48,\r
  magnetism = 1,\r
  variation = 0,\r
  flowDirection = 'down',\r
  brightness = 1,\r
  mouseInteraction = true,\r
  mouseStrength = 1,\r
  mouseRadius = 0.22,\r
  mouseDampening = 0.15,\r
  clickPulse = true,\r
  intro = true,\r
  lightMode = false,\r
  transparent = true,\r
  color,\r
  opacity = 1,\r
  paused = false,\r
  dpr,\r
  mixBlendMode,\r
  className = '',\r
  style,\r
  ...rest\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settings = {\r
    colors: Array.isArray(colors) && colors.length ? colors.slice(0, 3) : ['#ffffff'],\r
    speed: Math.max(0, speed),\r
    scale: clamp(scale, 0.2, 6),\r
    spikeHeight: Math.max(0, spikeHeight),\r
    sharpness: clamp(sharpness, 0.6, 6),\r
    turbulence: Math.max(0, turbulence),\r
    fluidity: clamp(fluidity, 0, 1),\r
    tilt: clamp(tilt, 10, 70),\r
    magnetism: Math.max(0, magnetism),\r
    variation,\r
    flow: FLOW[flowDirection] ?? FLOW.down,\r
    brightness: Math.max(0, brightness),\r
    mouseInteraction,\r
    mouseStrength: Math.max(0, mouseStrength),\r
    mouseRadius: clamp(mouseRadius, 0.02, 2),\r
    mouseDampening: Math.max(0, mouseDampening),\r
    clickPulse,\r
    intro,\r
    lightMode,\r
    transparent,\r
    color,\r
    opacity: clamp(opacity, 0, 1),\r
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
    const floatTargets = Boolean(gl.getExtension('EXT_color_buffer_float'));\r
    const sim = link(gl, SIM_FRAGMENT);\r
    const bounds = link(gl, BOUND_FRAGMENT);\r
    const render = link(gl, RENDER_FRAGMENT);\r
    if (!sim || !bounds || !render) return undefined;\r
\r
    const buffer = gl.createBuffer();\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const makeTarget = (width, height, filter) => {\r
      const texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      if (floatTargets) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.HALF_FLOAT, null);\r
      else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      const framebuffer = gl.createFramebuffer();\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      return { texture, framebuffer };\r
    };\r
    const dropTarget = target => {\r
      if (!target) return;\r
      gl.deleteTexture(target.texture);\r
      gl.deleteFramebuffer(target.framebuffer);\r
    };\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const cache = new Map();\r
    const parse = (value, fallback) => {\r
      if (!value) return fallback;\r
      const key = String(value);\r
      if (cache.has(key)) return cache.get(key);\r
      let rgb = fallback;\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#000000';\r
        probe.fillStyle = key;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      cache.set(key, rgb);\r
      return rgb;\r
    };\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const tanHalf = Math.tan(FOV / 2);\r
    const view = { width: 1, height: 1, worldHeight: 10, scale: 0, tilt: -1, reach: 1 };\r
    const camera = { x: 0, y: 0, z: 1, forward: [0, 1, 0], upward: [0, 0, 1], far: 10, distance: 4 };\r
    const grid = { width: 0, height: 0, originX: 0, originY: 0, boundWidth: 0, boundHeight: 0 };\r
    let states = [];\r
    let boundTarget = null;\r
    let current = 0;\r
    let settle = true;\r
\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const cursor = { x: 0, y: 0, strength: 0 };\r
    const pulse = { x: 0, y: 0, age: 10 };\r
    let wander = 0;\r
    let presence = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let shape = shapeOf(settingsRef.current.sharpness);\r
    let shapeKey = settingsRef.current.sharpness;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const castRay = (x, y) => {\r
      const aspect = view.width / view.height;\r
      const sx = x * aspect * tanHalf;\r
      const sy = y * tanHalf;\r
      const [fx, fy, fz] = camera.forward;\r
      const [, uy, uz] = camera.upward;\r
      const dx = fx + sx;\r
      const dy = fy + sy * uy;\r
      const dz = fz + sy * uz;\r
      const length = Math.hypot(dx, dy, dz) || 1;\r
      return [dx / length, dy / length, dz / length];\r
    };\r
\r
    const groundAt = (x, y) => {\r
      const [dx, dy, dz] = castRay(x, y);\r
      const t = dz < -0.004 ? Math.min(-camera.z / dz, camera.far) : camera.far;\r
      return [camera.x + dx * t, camera.y + dy * t];\r
    };\r
\r
    const layout = () => {\r
      const s = settingsRef.current;\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      view.width = canvas.width;\r
      view.height = canvas.height;\r
      view.worldHeight = 22 / s.scale;\r
      view.scale = s.scale;\r
      view.tilt = s.tilt;\r
      const pitch = ((90 - s.tilt) * Math.PI) / 180;\r
      const distance = view.worldHeight / (2 * tanHalf);\r
      camera.forward = [0, Math.cos(pitch), -Math.sin(pitch)];\r
      camera.upward = [0, Math.sin(pitch), Math.cos(pitch)];\r
      camera.x = 0;\r
      camera.y = -distance * Math.cos(pitch);\r
      camera.z = distance * Math.sin(pitch);\r
      camera.far = distance * 2.5;\r
      camera.distance = distance;\r
      const corners = [groundAt(-1, -1), groundAt(1, -1), groundAt(-1, 1), groundAt(1, 1), groundAt(0, 1)];\r
      const xs = corners.map(c => c[0]);\r
      const ys = corners.map(c => c[1]);\r
      const minX = Math.min(...xs) - 3;\r
      const maxX = Math.max(...xs) + 3;\r
      const minY = Math.min(...ys) - 3;\r
      const maxY = Math.max(...ys) + 3;\r
      view.reach = Math.max(...corners.map(c => Math.hypot(c[0], c[1]))) + 4;\r
      const gridWidth = Math.ceil((maxX - minX) / CELL) + 2;\r
      const gridHeight = Math.ceil((maxY - minY) / CELL) + 2;\r
      grid.originX = minX;\r
      grid.originY = minY;\r
      if (gridWidth !== grid.width || gridHeight !== grid.height) {\r
        states.forEach(dropTarget);\r
        dropTarget(boundTarget);\r
        states = [makeTarget(gridWidth, gridHeight, gl.LINEAR), makeTarget(gridWidth, gridHeight, gl.LINEAR)];\r
        grid.width = gridWidth;\r
        grid.height = gridHeight;\r
        grid.boundWidth = Math.ceil((gridWidth * CELL) / BOUND_CELL);\r
        grid.boundHeight = Math.ceil((gridHeight * CELL) / BOUND_CELL);\r
        boundTarget = makeTarget(grid.boundWidth, grid.boundHeight, gl.NEAREST);\r
        current = 0;\r
      }\r
      settle = true;\r
    };\r
\r
    const toWorld = (clientX, clientY) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = ((clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;\r
      const y = 1 - ((clientY - rect.top) / Math.max(1, rect.height)) * 2;\r
      return groundAt(x, y);\r
    };\r
\r
    const step = dt => {\r
      const s = settingsRef.current;\r
      if (s.scale !== view.scale || s.tilt !== view.tilt) layout();\r
      const motion = s.paused ? 0 : 1;\r
      wander += dt * motion * (reduce ? 0 : s.speed);\r
      presence = s.intro && !reduce ? Math.min(1, presence + (dt * motion) / INTRO_SECONDS) : 1;\r
      pulse.age += dt * motion;\r
\r
      const engaged = s.mouseInteraction && pointer.inside;\r
      const follow = s.mouseDampening > 0 ? 1 - Math.exp(-dt / s.mouseDampening) : 1;\r
      if (engaged) {\r
        cursor.x += (pointer.x - cursor.x) * follow;\r
        cursor.y += (pointer.y - cursor.y) * follow;\r
      }\r
      const targetStrength = engaged ? s.mouseStrength * 1.4 : 0;\r
      cursor.strength += (targetStrength - cursor.strength) * (1 - Math.exp(-dt / 0.35));\r
      if (Math.abs(targetStrength - cursor.strength) < 0.001) cursor.strength = targetStrength;\r
    };\r
\r
    const draw = dt => {\r
      if (!boundTarget || states.length < 2) return;\r
      const s = settingsRef.current;\r
      const worldUnit = view.worldHeight;\r
      const radius = s.mouseRadius * worldUnit;\r
      const fullHeight = 1.2 * s.spikeHeight;\r
      if (s.sharpness !== shapeKey) {\r
        shapeKey = s.sharpness;\r
        shape = shapeOf(s.sharpness);\r
      }\r
      const reveal = presence * presence * (3 - 2 * presence);\r
      gl.bindVertexArray(vao);\r
      gl.activeTexture(gl.TEXTURE0);\r
\r
      const read = states[current];\r
      const write = states[1 - current];\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, write.framebuffer);\r
      gl.viewport(0, 0, grid.width, grid.height);\r
      gl.useProgram(sim.program);\r
      const su = sim.uniforms;\r
      gl.bindTexture(gl.TEXTURE_2D, read.texture);\r
      gl.uniform1i(su.uState, 0);\r
      gl.uniform2f(su.uGridOrigin, grid.originX, grid.originY);\r
      gl.uniform1f(su.uCell, CELL);\r
      gl.uniform1f(su.uDt, Math.max(dt, 0.001));\r
      gl.uniform1f(su.uTime, wander);\r
      gl.uniform2f(su.uFlow, s.flow[0], s.flow[1]);\r
      gl.uniform1f(su.uTurbulence, s.turbulence);\r
      gl.uniform1f(su.uMagnetism, s.magnetism);\r
      gl.uniform1f(su.uFieldScale, 5.5);\r
      gl.uniform2f(su.uSeed, s.variation * 17.31, s.variation * 9.73);\r
      gl.uniform4f(su.uCursor, cursor.x, cursor.y, cursor.strength, radius);\r
      gl.uniform4f(su.uPulse, pulse.x, pulse.y, pulse.age, pulse.age < 4 ? 1.1 : 0);\r
      gl.uniform1f(su.uPulseSpeed, worldUnit * 0.45);\r
      gl.uniform1f(su.uPulseWidth, 1.4);\r
      gl.uniform3f(su.uIntro, 0, 0, reveal * (view.reach + 3));\r
      gl.uniform1f(su.uSpikeHeight, fullHeight);\r
      gl.uniform1f(su.uMound, 0.6);\r
      gl.uniform1f(su.uStiffness, 150);\r
      gl.uniform1f(su.uDamping, 22 - s.fluidity * 15);\r
      gl.uniform1f(su.uSettle, settle || !floatTargets || reduce ? 1 : 0);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      settle = false;\r
      current = 1 - current;\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, boundTarget.framebuffer);\r
      gl.viewport(0, 0, grid.boundWidth, grid.boundHeight);\r
      gl.useProgram(bounds.program);\r
      const bu = bounds.uniforms;\r
      gl.bindTexture(gl.TEXTURE_2D, write.texture);\r
      gl.uniform1i(bu.uState, 0);\r
      gl.uniform2f(bu.uGridOrigin, grid.originX, grid.originY);\r
      gl.uniform1f(bu.uCell, CELL);\r
      gl.uniform2f(bu.uStateSize, grid.width, grid.height);\r
      gl.uniform1f(bu.uBoundCell, BOUND_CELL);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, view.width, view.height);\r
      gl.useProgram(render.program);\r
      const ru = render.uniforms;\r
      gl.bindTexture(gl.TEXTURE_2D, write.texture);\r
      gl.uniform1i(ru.uField, 0);\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.bindTexture(gl.TEXTURE_2D, boundTarget.texture);\r
      gl.uniform1i(ru.uBound, 1);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.uniform2f(ru.uGridOrigin, grid.originX, grid.originY);\r
      gl.uniform2f(ru.uGridSpan, grid.width * CELL, grid.height * CELL);\r
      gl.uniform2f(ru.uBoundSpan, grid.boundWidth * BOUND_CELL, grid.boundHeight * BOUND_CELL);\r
      gl.uniform1f(ru.uCellSize, CELL);\r
      gl.uniform2f(ru.uResolution, view.width, view.height);\r
      gl.uniform3f(ru.uCamera, camera.x, camera.y, camera.z);\r
      gl.uniform3fv(ru.uForward, camera.forward);\r
      gl.uniform3fv(ru.uUpward, camera.upward);\r
      gl.uniform1f(ru.uTanHalf, tanHalf);\r
      gl.uniform1f(ru.uPixelAngle, (2 * tanHalf) / view.height);\r
      gl.uniform1f(ru.uFar, camera.far);\r
      gl.uniform1f(ru.uFogStart, camera.distance * 0.95);\r
      gl.uniform1f(ru.uTop, fullHeight * 1.6 + 0.6 * 3 + 0.1);\r
      gl.uniform1f(ru.uBottom, -0.05);\r
      gl.uniform1f(ru.uTime, wander * 2);\r
      gl.uniform4f(ru.uCursor, cursor.x, cursor.y, cursor.strength, radius);\r
      gl.uniform1f(ru.uMound, 0.6);\r
      gl.uniform1f(ru.uRound, shape.round);\r
      gl.uniform1f(ru.uSpan, shape.span);\r
      gl.uniform1f(ru.uExponent, shape.exponent);\r
      gl.uniform1f(ru.uWarp, 0.06 * s.turbulence);\r
      const lights = s.colors.map(value => parse(value, [1, 1, 1]));\r
      const key = lights[0];\r
      const strip = lights[1] ?? key;\r
      const fill = lights[2] ?? strip;\r
      gl.uniform3fv(ru.uKey, key);\r
      gl.uniform3fv(ru.uStrip, strip);\r
      gl.uniform3fv(ru.uFill, fill);\r
      gl.uniform1f(ru.uExposure, 3 * s.brightness);\r
      gl.uniform1f(ru.uLight, s.lightMode ? 1 : 0);\r
      gl.uniform1f(ru.uOpaque, s.transparent ? 0 : 1);\r
      gl.uniform3fv(ru.uBase, parse(s.color, s.lightMode ? [1, 1, 1] : [0.0706, 0.0588, 0.0902]));\r
      gl.uniform1f(ru.uOpacity, s.opacity);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const dt = last ? clamp((now - last) / 1000, 0.0005, 0.05) : 1 / 60;\r
      last = now;\r
      step(dt);\r
      draw(dt);\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const resize = () => {\r
      layout();\r
      draw(0);\r
      wake();\r
    };\r
\r
    const locate = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      [pointer.x, pointer.y] = toWorld(event.clientX, event.clientY);\r
    };\r
\r
    const onPointerMove = event => {\r
      const wasInside = pointer.inside;\r
      locate(event);\r
      if (pointer.inside && !wasInside && cursor.strength < 0.05) {\r
        cursor.x = pointer.x;\r
        cursor.y = pointer.y;\r
      }\r
      wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      onPointerMove(event);\r
      if (!pointer.inside || !settingsRef.current.clickPulse || reduce) return;\r
      pulse.x = pointer.x;\r
      pulse.y = pointer.y;\r
      pulse.age = 0;\r
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
      states.forEach(dropTarget);\r
      dropTarget(boundTarget);\r
      gl.deleteProgram(sim.program);\r
      gl.deleteProgram(bounds.program);\r
      gl.deleteProgram(render.program);\r
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
      className={\`ferrofluid-container\${className ? \` \${className}\` : ''}\`}\r
      style={mixBlendMode ? { ...style, mixBlendMode } : style}\r
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className="ferrofluid-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Ferrofluid;\r
`,n=`.ferrofluid-container {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.ferrofluid-canvas {\r
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
const CELL = 1 / 3;\r
const BOUND_CELL = 1;\r
const INTRO_SECONDS = 2.4;\r
const FOV = (38 * Math.PI) / 180;\r
const FLOW = { up: [0, 1], down: [0, -1], left: [-1, 0], right: [1, 0], none: [0, 0] };\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const SIM_FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uState;\r
uniform vec2 uGridOrigin;\r
uniform float uCell;\r
uniform float uDt;\r
uniform float uTime;\r
uniform vec2 uFlow;\r
uniform float uTurbulence;\r
uniform float uMagnetism;\r
uniform float uFieldScale;\r
uniform vec2 uSeed;\r
uniform vec4 uCursor;\r
uniform vec4 uPulse;\r
uniform float uPulseSpeed;\r
uniform float uPulseWidth;\r
uniform vec3 uIntro;\r
uniform float uSpikeHeight;\r
uniform float uMound;\r
uniform float uStiffness;\r
uniform float uDamping;\r
uniform float uSettle;\r
out vec4 outState;\r
\r
float hash(vec2 p) {\r
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);\r
  p3 += dot(p3, p3.yzx + 33.33);\r
  return fract((p3.x + p3.y) * p3.z);\r
}\r
\r
float noise(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = fract(p);\r
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);\r
  float a = hash(i);\r
  float b = hash(i + vec2(1.0, 0.0));\r
  float c = hash(i + vec2(0.0, 1.0));\r
  float d = hash(i + vec2(1.0, 1.0));\r
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);\r
}\r
\r
float flowField(vec2 p) {\r
  vec2 q = p / uFieldScale + uSeed;\r
  vec2 drift = uFlow * uTime * 0.55;\r
  vec2 warp = vec2(noise(q * 0.6 + vec2(uTime * 0.07, 3.1)), noise(q * 0.6 - vec2(7.3, uTime * 0.06))) - 0.5;\r
  vec2 r = q + warp * 1.8 * uTurbulence - drift;\r
  float n = noise(r) * 0.65 + noise(r * 2.03 + 11.7 - drift * 0.5) * 0.35;\r
  return smoothstep(0.44, 0.86, n);\r
}\r
\r
void main() {\r
  vec2 texel = floor(gl_FragCoord.xy);\r
  vec2 p = uGridOrigin + (texel + 0.5) * uCell;\r
  vec4 prev = texelFetch(uState, ivec2(texel), 0);\r
  float swell = flowField(p);\r
  float field = uMagnetism * (0.03 + 1.0 * swell * swell);\r
  vec2 dc = p - uCursor.xy;\r
  float falloff = dot(dc, dc) / (uCursor.w * uCursor.w);\r
  field += uCursor.z * exp(-falloff);\r
  float mound = uCursor.z * exp(-falloff / 2.2);\r
  if (uPulse.w > 0.0) {\r
    float ring = length(p - uPulse.xy) - uPulse.z * uPulseSpeed;\r
    float envelope = smoothstep(0.0, 0.08, uPulse.z) * exp(-uPulse.z * 1.1);\r
    field += uPulse.w * envelope * exp(-ring * ring / (uPulseWidth * uPulseWidth));\r
  }\r
  float front = clamp((uIntro.z - length(p - uIntro.xy)) / 3.0, 0.0, 1.0);\r
  front = front * front * (3.0 - 2.0 * front);\r
  float target = uSpikeHeight * min(pow(max(field * front - 0.04, 0.0), 1.6), 1.0);\r
  float height = prev.x;\r
  float velocity = prev.y;\r
  if (uSettle > 0.5) {\r
    height = target;\r
    velocity = 0.0;\r
  } else {\r
    float steps = ceil(uDt / 0.008);\r
    float h = uDt / steps;\r
    for (int k = 0; k < 8; k++) {\r
      if (float(k) >= steps) break;\r
      velocity += (uStiffness * (target - height) - uDamping * velocity) * h;\r
      height += velocity * h;\r
    }\r
    if (height < 0.0) {\r
      height = 0.0;\r
      velocity = max(velocity, 0.0);\r
    }\r
  }\r
  outState = vec4(height, velocity, mound * front * uMound, 1.0);\r
}\`;\r
\r
const BOUND_FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uState;\r
uniform vec2 uGridOrigin;\r
uniform float uCell;\r
uniform vec2 uStateSize;\r
uniform float uBoundCell;\r
out vec4 outBound;\r
\r
void main() {\r
  vec2 center = uGridOrigin + (floor(gl_FragCoord.xy) + 0.5) * uBoundCell;\r
  vec2 base = floor((center - uGridOrigin) / uCell);\r
  float top = 0.0;\r
  float peak = 0.0;\r
  for (int y = -4; y <= 4; y++) {\r
    for (int x = -4; x <= 4; x++) {\r
      vec2 texel = clamp(base + vec2(float(x), float(y)), vec2(0.0), uStateSize - 1.0);\r
      vec4 s = texelFetch(uState, ivec2(texel), 0);\r
      top = max(top, max(s.x, 0.0) * 1.05 + s.z);\r
      peak = max(peak, s.x);\r
    }\r
  }\r
  outBound = vec4(top, peak, 0.0, 1.0);\r
}\`;\r
\r
const RENDER_FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uField;\r
uniform sampler2D uBound;\r
uniform vec2 uGridOrigin;\r
uniform vec2 uGridSpan;\r
uniform vec2 uBoundSpan;\r
uniform float uCellSize;\r
uniform vec2 uResolution;\r
uniform vec3 uCamera;\r
uniform vec3 uForward;\r
uniform vec3 uUpward;\r
uniform float uTanHalf;\r
uniform float uPixelAngle;\r
uniform float uFar;\r
uniform float uFogStart;\r
uniform float uTop;\r
uniform float uBottom;\r
uniform float uTime;\r
uniform vec4 uCursor;\r
uniform float uMound;\r
uniform float uRound;\r
uniform float uSpan;\r
uniform float uExponent;\r
uniform float uWarp;\r
uniform vec3 uKey;\r
uniform vec3 uStrip;\r
uniform vec3 uFill;\r
uniform float uExposure;\r
uniform float uLight;\r
uniform float uOpaque;\r
uniform vec3 uBase;\r
uniform float uOpacity;\r
out vec4 outColor;\r
\r
const float G = 7.2551975;\r
const vec2 E1 = vec2(0.8660254, 0.5);\r
const vec2 E2 = vec2(-0.8660254, 0.5);\r
const vec2 E3 = vec2(0.0, -1.0);\r
const mat2 TURN = mat2(0.9902681, 0.1391731, -0.1391731, 0.9902681);\r
const float F0 = 0.06;\r
\r
vec3 mound(vec2 p) {\r
  vec2 d = p - uCursor.xy;\r
  float inv = 1.0 / (uCursor.w * uCursor.w * 2.2);\r
  float e = uCursor.z * exp(-dot(d, d) * inv);\r
  return vec3(e, -2.0 * inv * e * d) * uMound;\r
}\r
\r
vec2 lattice(vec2 p) {\r
  vec2 q = TURN * p;\r
  float t = uTime * 0.35;\r
  return q + uWarp * vec2(sin(q.y * 0.9 + t), cos(q.x * 0.8 - t * 0.8));\r
}\r
\r
float detail(float t) {\r
  return smoothstep(3.0, 8.0, 1.0 / max(t * uPixelAngle, 1e-5)) * (1.0 - smoothstep(uFogStart, mix(uFogStart, uFar, 0.7), t));\r
}\r
\r
float profile(float u, out float rate) {\r
  float root = sqrt(max(1.0 - u, 0.0) + uRound * uRound);\r
  rate = 0.5 / (uSpan * root);\r
  return clamp(1.0 - (root - uRound) / uSpan, 0.0, 1.0);\r
}\r
\r
float spikes(vec2 p, float a, float rise, out float clearance) {\r
  clearance = 10.0;\r
  if (a < 0.002) return 0.0;\r
  vec2 q = lattice(p);\r
  float u = (cos(G * dot(E1, q)) + cos(G * dot(E2, q)) + cos(G * dot(E3, q)) + 1.5) / 4.5;\r
  if (a > 0.05) {\r
    float root = uRound + (1.0 - pow(clamp(rise / a, 0.0, 1.0), 1.0 / uExponent)) * uSpan;\r
    clearance = sqrt(max(1.0 - u, 0.0) / 8.77) - sqrt(max(root * root - uRound * uRound, 0.0) / 8.77);\r
  }\r
  float rate;\r
  return a * pow(profile(u, rate), uExponent);\r
}\r
\r
vec2 spikesSlope(vec2 p, float a, vec2 aSlope) {\r
  if (a < 0.002) return vec2(0.0);\r
  vec2 q = lattice(p);\r
  float c1 = G * dot(E1, q);\r
  float c2 = G * dot(E2, q);\r
  float c3 = G * dot(E3, q);\r
  float u = (cos(c1) + cos(c2) + cos(c3) + 1.5) / 4.5;\r
  vec2 du = -(G / 4.5) * (sin(c1) * E1 + sin(c2) * E2 + sin(c3) * E3) * TURN;\r
  float rate;\r
  float s = max(profile(u, rate), 1e-4);\r
  float shape = pow(s, uExponent);\r
  return a * uExponent * shape / s * rate * du + aSlope * shape;\r
}\r
\r
float surface(vec2 p, float z, float t, out float clearance) {\r
  vec4 f = texture(uField, (p - uGridOrigin) / uGridSpan);\r
  return f.z + spikes(p, f.x * detail(t), z - f.z, clearance);\r
}\r
\r
vec2 bound(vec2 p) {\r
  return texture(uBound, (p - uGridOrigin) / uBoundSpan).rg;\r
}\r
\r
float panel(vec3 r, vec3 dir, vec3 up, vec2 extent, float soft) {\r
  vec3 side = normalize(cross(dir, up));\r
  vec3 top = cross(side, dir);\r
  float facing = dot(r, dir);\r
  if (facing <= 0.0) return 0.0;\r
  vec2 q = vec2(dot(r, side), dot(r, top)) / facing;\r
  vec2 e = smoothstep(extent + soft, extent - soft, abs(q));\r
  return e.x * e.y;\r
}\r
\r
vec3 studio(vec3 r, vec3 rd, float soft) {\r
  vec3 z = vec3(0.0, 0.0, 1.0);\r
  vec3 col = uKey * 4.2 * panel(r, normalize(vec3(-0.3, -0.5, 0.81)), z, vec2(0.36, 0.22), 0.08 + soft);\r
  col += uStrip * 1.5 * panel(r, normalize(vec3(-0.9, -0.2, 0.38)), z, vec2(0.12, 0.7), 0.07 + soft);\r
  col += uStrip * 1.5 * panel(r, normalize(vec3(0.9, -0.1, 0.42)), z, vec2(0.12, 0.7), 0.07 + soft);\r
  float lift = asin(clamp(r.z, -1.0, 1.0)) - asin(clamp(-rd.z, -1.0, 1.0));\r
  col += uFill * 0.45 * smoothstep(0.08 - soft, 0.7 + soft, lift) * smoothstep(1.6, 1.0, lift);\r
  return col;\r
}\r
\r
vec4 finish(vec3 light, vec3 paper, float alpha) {\r
  if (uLight > 0.5) {\r
    if (uOpaque > 0.5) return vec4(mix(uBase, paper, alpha) * uOpacity, uOpacity);\r
    vec3 shade = mix(vec3(1.0), paper, alpha * uOpacity);\r
    float cover = 1.0 - min(shade.r, min(shade.g, shade.b));\r
    return vec4(shade - (1.0 - cover), cover);\r
  }\r
  vec3 glow = light * alpha * uOpacity;\r
  if (uOpaque > 0.5) return vec4(uBase + glow, 1.0);\r
  return vec4(glow, max(glow.r, max(glow.g, glow.b)));\r
}\r
\r
void main() {\r
  vec2 ndc = (gl_FragCoord.xy - 0.5 * uResolution) / (0.5 * uResolution.y);\r
  vec3 side = normalize(cross(uForward, uUpward));\r
  vec3 rd = normalize(uForward + (ndc.x * side + ndc.y * uUpward) * uTanHalf);\r
  if (rd.z > -0.004) {\r
    outColor = finish(vec3(0.0), vec3(1.0), 0.0);\r
    return;\r
  }\r
  float tTop = max((uTop - uCamera.z) / rd.z, 0.0);\r
  float tEnd = min((uBottom - uCamera.z) / rd.z, uFar);\r
  if (tTop >= tEnd) {\r
    outColor = finish(vec3(0.0), vec3(1.0), 0.0);\r
    return;\r
  }\r
  float sink = max(-rd.z, 0.2);\r
  float glide = max(length(rd.xy), 0.05);\r
  float chunk = 0.9 / glide;\r
  float t = tEnd;\r
  float tPrev = tEnd;\r
  bool found = false;\r
  bool smoothHit = false;\r
  float t0 = tTop;\r
  vec2 b0 = bound(uCamera.xy + rd.xy * t0);\r
  for (int c = 0; c < 64; c++) {\r
    if (t0 >= tEnd) break;\r
    float t1 = min(t0 + chunk, tEnd);\r
    vec2 b1 = bound(uCamera.xy + rd.xy * t1);\r
    float b = max(b0.x, b1.x) + 0.03;\r
    float z1 = uCamera.z + rd.z * t1;\r
    if (z1 > b) {\r
      t0 = t1;\r
      b0 = b1;\r
      continue;\r
    }\r
    float tt = max(t0, (b - uCamera.z) / rd.z);\r
    if (max(b0.y, b1.y) < 0.002) {\r
      for (int k = 0; k < 3; k++) {\r
        vec3 probe = uCamera + rd * tt;\r
        tt += (probe.z - mound(probe.xy).x) / sink * 0.95;\r
      }\r
      if (tt <= t1 + 0.02 || t1 >= tEnd) {\r
        t = tt;\r
        smoothHit = true;\r
        break;\r
      }\r
      t0 = t1;\r
      b0 = b1;\r
      continue;\r
    }\r
    float tp = tt;\r
    for (int k = 0; k < 48; k++) {\r
      vec3 pos = uCamera + rd * tt;\r
      float clearance;\r
      float gap = pos.z - surface(pos.xy, pos.z, tt, clearance);\r
      if (gap < 0.0) {\r
        found = true;\r
        break;\r
      }\r
      tp = tt;\r
      float pixel = tt * uPixelAngle;\r
      float limit = pos.z > bound(pos.xy).x + 0.02 ? 0.6 / glide : max(clearance * 0.9, pixel) / glide;\r
      tt += max(min(gap * 0.75 / sink, limit), pixel);\r
      if (tt > t1) break;\r
    }\r
    if (found) {\r
      t = tt;\r
      tPrev = tp;\r
      break;\r
    }\r
    t0 = t1;\r
    b0 = b1;\r
  }\r
\r
  vec3 pos;\r
  vec2 slope;\r
  if (smoothHit || !found) {\r
    pos = uCamera + rd * t;\r
    slope = mound(pos.xy).yz;\r
  } else {\r
    float lo = tPrev;\r
    float hi = t;\r
    for (int k = 0; k < 4; k++) {\r
      float mid = 0.5 * (lo + hi);\r
      vec3 probe = uCamera + rd * mid;\r
      float clearance;\r
      if (probe.z - surface(probe.xy, probe.z, mid, clearance) < 0.0) hi = mid;\r
      else lo = mid;\r
    }\r
    t = hi;\r
    pos = uCamera + rd * t;\r
    vec2 uv = (pos.xy - uGridOrigin) / uGridSpan;\r
    vec2 step = uCellSize / uGridSpan;\r
    float fade = detail(t);\r
    float a = texture(uField, uv).x * fade;\r
    vec2 aSlope = vec2(\r
      texture(uField, uv + vec2(step.x, 0.0)).x - texture(uField, uv - vec2(step.x, 0.0)).x,\r
      texture(uField, uv + vec2(0.0, step.y)).x - texture(uField, uv - vec2(0.0, step.y)).x\r
    ) * fade / (2.0 * uCellSize);\r
    slope = mound(pos.xy).yz + spikesSlope(pos.xy, a, aSlope);\r
  }\r
\r
  vec3 n = normalize(vec3(-slope, 1.0));\r
  vec3 r = reflect(rd, n);\r
  float soft = length(fwidth(r)) * 0.6;\r
  float facing = max(dot(n, -rd), 0.0);\r
  float fresnel = F0 + (1.0 - F0) * pow(1.0 - facing, 5.0);\r
  float rim = pow(1.0 - clamp(abs(dot(rd, n)), 0.0, 1.0), 3.0) * smoothstep(0.85, 0.4, n.z);\r
  float distance = 1.0 - smoothstep(uFogStart, uFar, t);\r
\r
  if (uLight > 0.5) {\r
    vec3 key = normalize(vec3(-0.45, -0.55, 0.7));\r
    float lambert = clamp(dot(n, key) / key.z, 0.0, 1.0);\r
    float diffuse = mix(0.62, 1.0, lambert);\r
    float room = mix(0.3, 1.0, smoothstep(-0.25, 0.3, r.z));\r
    room -= 0.3 * rim;\r
    float lum = mix(diffuse, room, fresnel);\r
    lum = 1.0 - (1.0 - lum) * clamp(uExposure / 3.0, 0.0, 1.5);\r
    vec3 shadow = mix(vec3(0.0), uStrip, 0.45);\r
    vec3 paper = mix(shadow, vec3(1.0), clamp(lum, 0.0, 1.0));\r
    outColor = finish(vec3(0.0), paper, distance);\r
    return;\r
  }\r
\r
  vec3 shine = 1.0 - exp(-(studio(r, rd, soft) * fresnel + uFill * rim * 0.35) * uExposure);\r
  outColor = finish(shine, vec3(1.0), distance);\r
}\`;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const shapeOf = sharpness => {\r
  const edge = clamp((sharpness - 1) / 4, 0, 1);\r
  const round = 1 - edge * 0.7;\r
  const exponent = 1.05 + edge * 1.2;\r
  const span = Math.sqrt(1 + round * round) - round;\r
  return { round, exponent, span };\r
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
    if (info) uniforms[info.name.replace('[0]', '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const Ferrofluid = ({\r
  colors = ['#ffffff', '#ffffff', '#ffffff'],\r
  speed = 0.5,\r
  scale = 1.6,\r
  spikeHeight = 1,\r
  sharpness = 2.5,\r
  turbulence = 1,\r
  fluidity = 0.5,\r
  tilt = 48,\r
  magnetism = 1,\r
  variation = 0,\r
  flowDirection = 'down',\r
  brightness = 1,\r
  mouseInteraction = true,\r
  mouseStrength = 1,\r
  mouseRadius = 0.22,\r
  mouseDampening = 0.15,\r
  clickPulse = true,\r
  intro = true,\r
  lightMode = false,\r
  transparent = true,\r
  color,\r
  opacity = 1,\r
  paused = false,\r
  dpr,\r
  mixBlendMode,\r
  className = '',\r
  style,\r
  ...rest\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settings = {\r
    colors: Array.isArray(colors) && colors.length ? colors.slice(0, 3) : ['#ffffff'],\r
    speed: Math.max(0, speed),\r
    scale: clamp(scale, 0.2, 6),\r
    spikeHeight: Math.max(0, spikeHeight),\r
    sharpness: clamp(sharpness, 0.6, 6),\r
    turbulence: Math.max(0, turbulence),\r
    fluidity: clamp(fluidity, 0, 1),\r
    tilt: clamp(tilt, 10, 70),\r
    magnetism: Math.max(0, magnetism),\r
    variation,\r
    flow: FLOW[flowDirection] ?? FLOW.down,\r
    brightness: Math.max(0, brightness),\r
    mouseInteraction,\r
    mouseStrength: Math.max(0, mouseStrength),\r
    mouseRadius: clamp(mouseRadius, 0.02, 2),\r
    mouseDampening: Math.max(0, mouseDampening),\r
    clickPulse,\r
    intro,\r
    lightMode,\r
    transparent,\r
    color,\r
    opacity: clamp(opacity, 0, 1),\r
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
    const floatTargets = Boolean(gl.getExtension('EXT_color_buffer_float'));\r
    const sim = link(gl, SIM_FRAGMENT);\r
    const bounds = link(gl, BOUND_FRAGMENT);\r
    const render = link(gl, RENDER_FRAGMENT);\r
    if (!sim || !bounds || !render) return undefined;\r
\r
    const buffer = gl.createBuffer();\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const makeTarget = (width, height, filter) => {\r
      const texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      if (floatTargets) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.HALF_FLOAT, null);\r
      else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      const framebuffer = gl.createFramebuffer();\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      return { texture, framebuffer };\r
    };\r
    const dropTarget = target => {\r
      if (!target) return;\r
      gl.deleteTexture(target.texture);\r
      gl.deleteFramebuffer(target.framebuffer);\r
    };\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const cache = new Map();\r
    const parse = (value, fallback) => {\r
      if (!value) return fallback;\r
      const key = String(value);\r
      if (cache.has(key)) return cache.get(key);\r
      let rgb = fallback;\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#000000';\r
        probe.fillStyle = key;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      cache.set(key, rgb);\r
      return rgb;\r
    };\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const tanHalf = Math.tan(FOV / 2);\r
    const view = { width: 1, height: 1, worldHeight: 10, scale: 0, tilt: -1, reach: 1 };\r
    const camera = { x: 0, y: 0, z: 1, forward: [0, 1, 0], upward: [0, 0, 1], far: 10, distance: 4 };\r
    const grid = { width: 0, height: 0, originX: 0, originY: 0, boundWidth: 0, boundHeight: 0 };\r
    let states = [];\r
    let boundTarget = null;\r
    let current = 0;\r
    let settle = true;\r
\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const cursor = { x: 0, y: 0, strength: 0 };\r
    const pulse = { x: 0, y: 0, age: 10 };\r
    let wander = 0;\r
    let presence = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let shape = shapeOf(settingsRef.current.sharpness);\r
    let shapeKey = settingsRef.current.sharpness;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const castRay = (x, y) => {\r
      const aspect = view.width / view.height;\r
      const sx = x * aspect * tanHalf;\r
      const sy = y * tanHalf;\r
      const [fx, fy, fz] = camera.forward;\r
      const [, uy, uz] = camera.upward;\r
      const dx = fx + sx;\r
      const dy = fy + sy * uy;\r
      const dz = fz + sy * uz;\r
      const length = Math.hypot(dx, dy, dz) || 1;\r
      return [dx / length, dy / length, dz / length];\r
    };\r
\r
    const groundAt = (x, y) => {\r
      const [dx, dy, dz] = castRay(x, y);\r
      const t = dz < -0.004 ? Math.min(-camera.z / dz, camera.far) : camera.far;\r
      return [camera.x + dx * t, camera.y + dy * t];\r
    };\r
\r
    const layout = () => {\r
      const s = settingsRef.current;\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      view.width = canvas.width;\r
      view.height = canvas.height;\r
      view.worldHeight = 22 / s.scale;\r
      view.scale = s.scale;\r
      view.tilt = s.tilt;\r
      const pitch = ((90 - s.tilt) * Math.PI) / 180;\r
      const distance = view.worldHeight / (2 * tanHalf);\r
      camera.forward = [0, Math.cos(pitch), -Math.sin(pitch)];\r
      camera.upward = [0, Math.sin(pitch), Math.cos(pitch)];\r
      camera.x = 0;\r
      camera.y = -distance * Math.cos(pitch);\r
      camera.z = distance * Math.sin(pitch);\r
      camera.far = distance * 2.5;\r
      camera.distance = distance;\r
      const corners = [groundAt(-1, -1), groundAt(1, -1), groundAt(-1, 1), groundAt(1, 1), groundAt(0, 1)];\r
      const xs = corners.map(c => c[0]);\r
      const ys = corners.map(c => c[1]);\r
      const minX = Math.min(...xs) - 3;\r
      const maxX = Math.max(...xs) + 3;\r
      const minY = Math.min(...ys) - 3;\r
      const maxY = Math.max(...ys) + 3;\r
      view.reach = Math.max(...corners.map(c => Math.hypot(c[0], c[1]))) + 4;\r
      const gridWidth = Math.ceil((maxX - minX) / CELL) + 2;\r
      const gridHeight = Math.ceil((maxY - minY) / CELL) + 2;\r
      grid.originX = minX;\r
      grid.originY = minY;\r
      if (gridWidth !== grid.width || gridHeight !== grid.height) {\r
        states.forEach(dropTarget);\r
        dropTarget(boundTarget);\r
        states = [makeTarget(gridWidth, gridHeight, gl.LINEAR), makeTarget(gridWidth, gridHeight, gl.LINEAR)];\r
        grid.width = gridWidth;\r
        grid.height = gridHeight;\r
        grid.boundWidth = Math.ceil((gridWidth * CELL) / BOUND_CELL);\r
        grid.boundHeight = Math.ceil((gridHeight * CELL) / BOUND_CELL);\r
        boundTarget = makeTarget(grid.boundWidth, grid.boundHeight, gl.NEAREST);\r
        current = 0;\r
      }\r
      settle = true;\r
    };\r
\r
    const toWorld = (clientX, clientY) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = ((clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;\r
      const y = 1 - ((clientY - rect.top) / Math.max(1, rect.height)) * 2;\r
      return groundAt(x, y);\r
    };\r
\r
    const step = dt => {\r
      const s = settingsRef.current;\r
      if (s.scale !== view.scale || s.tilt !== view.tilt) layout();\r
      const motion = s.paused ? 0 : 1;\r
      wander += dt * motion * (reduce ? 0 : s.speed);\r
      presence = s.intro && !reduce ? Math.min(1, presence + (dt * motion) / INTRO_SECONDS) : 1;\r
      pulse.age += dt * motion;\r
\r
      const engaged = s.mouseInteraction && pointer.inside;\r
      const follow = s.mouseDampening > 0 ? 1 - Math.exp(-dt / s.mouseDampening) : 1;\r
      if (engaged) {\r
        cursor.x += (pointer.x - cursor.x) * follow;\r
        cursor.y += (pointer.y - cursor.y) * follow;\r
      }\r
      const targetStrength = engaged ? s.mouseStrength * 1.4 : 0;\r
      cursor.strength += (targetStrength - cursor.strength) * (1 - Math.exp(-dt / 0.35));\r
      if (Math.abs(targetStrength - cursor.strength) < 0.001) cursor.strength = targetStrength;\r
    };\r
\r
    const draw = dt => {\r
      if (!boundTarget || states.length < 2) return;\r
      const s = settingsRef.current;\r
      const worldUnit = view.worldHeight;\r
      const radius = s.mouseRadius * worldUnit;\r
      const fullHeight = 1.2 * s.spikeHeight;\r
      if (s.sharpness !== shapeKey) {\r
        shapeKey = s.sharpness;\r
        shape = shapeOf(s.sharpness);\r
      }\r
      const reveal = presence * presence * (3 - 2 * presence);\r
      gl.bindVertexArray(vao);\r
      gl.activeTexture(gl.TEXTURE0);\r
\r
      const read = states[current];\r
      const write = states[1 - current];\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, write.framebuffer);\r
      gl.viewport(0, 0, grid.width, grid.height);\r
      gl.useProgram(sim.program);\r
      const su = sim.uniforms;\r
      gl.bindTexture(gl.TEXTURE_2D, read.texture);\r
      gl.uniform1i(su.uState, 0);\r
      gl.uniform2f(su.uGridOrigin, grid.originX, grid.originY);\r
      gl.uniform1f(su.uCell, CELL);\r
      gl.uniform1f(su.uDt, Math.max(dt, 0.001));\r
      gl.uniform1f(su.uTime, wander);\r
      gl.uniform2f(su.uFlow, s.flow[0], s.flow[1]);\r
      gl.uniform1f(su.uTurbulence, s.turbulence);\r
      gl.uniform1f(su.uMagnetism, s.magnetism);\r
      gl.uniform1f(su.uFieldScale, 5.5);\r
      gl.uniform2f(su.uSeed, s.variation * 17.31, s.variation * 9.73);\r
      gl.uniform4f(su.uCursor, cursor.x, cursor.y, cursor.strength, radius);\r
      gl.uniform4f(su.uPulse, pulse.x, pulse.y, pulse.age, pulse.age < 4 ? 1.1 : 0);\r
      gl.uniform1f(su.uPulseSpeed, worldUnit * 0.45);\r
      gl.uniform1f(su.uPulseWidth, 1.4);\r
      gl.uniform3f(su.uIntro, 0, 0, reveal * (view.reach + 3));\r
      gl.uniform1f(su.uSpikeHeight, fullHeight);\r
      gl.uniform1f(su.uMound, 0.6);\r
      gl.uniform1f(su.uStiffness, 150);\r
      gl.uniform1f(su.uDamping, 22 - s.fluidity * 15);\r
      gl.uniform1f(su.uSettle, settle || !floatTargets || reduce ? 1 : 0);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      settle = false;\r
      current = 1 - current;\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, boundTarget.framebuffer);\r
      gl.viewport(0, 0, grid.boundWidth, grid.boundHeight);\r
      gl.useProgram(bounds.program);\r
      const bu = bounds.uniforms;\r
      gl.bindTexture(gl.TEXTURE_2D, write.texture);\r
      gl.uniform1i(bu.uState, 0);\r
      gl.uniform2f(bu.uGridOrigin, grid.originX, grid.originY);\r
      gl.uniform1f(bu.uCell, CELL);\r
      gl.uniform2f(bu.uStateSize, grid.width, grid.height);\r
      gl.uniform1f(bu.uBoundCell, BOUND_CELL);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, view.width, view.height);\r
      gl.useProgram(render.program);\r
      const ru = render.uniforms;\r
      gl.bindTexture(gl.TEXTURE_2D, write.texture);\r
      gl.uniform1i(ru.uField, 0);\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.bindTexture(gl.TEXTURE_2D, boundTarget.texture);\r
      gl.uniform1i(ru.uBound, 1);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.uniform2f(ru.uGridOrigin, grid.originX, grid.originY);\r
      gl.uniform2f(ru.uGridSpan, grid.width * CELL, grid.height * CELL);\r
      gl.uniform2f(ru.uBoundSpan, grid.boundWidth * BOUND_CELL, grid.boundHeight * BOUND_CELL);\r
      gl.uniform1f(ru.uCellSize, CELL);\r
      gl.uniform2f(ru.uResolution, view.width, view.height);\r
      gl.uniform3f(ru.uCamera, camera.x, camera.y, camera.z);\r
      gl.uniform3fv(ru.uForward, camera.forward);\r
      gl.uniform3fv(ru.uUpward, camera.upward);\r
      gl.uniform1f(ru.uTanHalf, tanHalf);\r
      gl.uniform1f(ru.uPixelAngle, (2 * tanHalf) / view.height);\r
      gl.uniform1f(ru.uFar, camera.far);\r
      gl.uniform1f(ru.uFogStart, camera.distance * 0.95);\r
      gl.uniform1f(ru.uTop, fullHeight * 1.6 + 0.6 * 3 + 0.1);\r
      gl.uniform1f(ru.uBottom, -0.05);\r
      gl.uniform1f(ru.uTime, wander * 2);\r
      gl.uniform4f(ru.uCursor, cursor.x, cursor.y, cursor.strength, radius);\r
      gl.uniform1f(ru.uMound, 0.6);\r
      gl.uniform1f(ru.uRound, shape.round);\r
      gl.uniform1f(ru.uSpan, shape.span);\r
      gl.uniform1f(ru.uExponent, shape.exponent);\r
      gl.uniform1f(ru.uWarp, 0.06 * s.turbulence);\r
      const lights = s.colors.map(value => parse(value, [1, 1, 1]));\r
      const key = lights[0];\r
      const strip = lights[1] ?? key;\r
      const fill = lights[2] ?? strip;\r
      gl.uniform3fv(ru.uKey, key);\r
      gl.uniform3fv(ru.uStrip, strip);\r
      gl.uniform3fv(ru.uFill, fill);\r
      gl.uniform1f(ru.uExposure, 3 * s.brightness);\r
      gl.uniform1f(ru.uLight, s.lightMode ? 1 : 0);\r
      gl.uniform1f(ru.uOpaque, s.transparent ? 0 : 1);\r
      gl.uniform3fv(ru.uBase, parse(s.color, s.lightMode ? [1, 1, 1] : [0.0706, 0.0588, 0.0902]));\r
      gl.uniform1f(ru.uOpacity, s.opacity);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const dt = last ? clamp((now - last) / 1000, 0.0005, 0.05) : 1 / 60;\r
      last = now;\r
      step(dt);\r
      draw(dt);\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const resize = () => {\r
      layout();\r
      draw(0);\r
      wake();\r
    };\r
\r
    const locate = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      [pointer.x, pointer.y] = toWorld(event.clientX, event.clientY);\r
    };\r
\r
    const onPointerMove = event => {\r
      const wasInside = pointer.inside;\r
      locate(event);\r
      if (pointer.inside && !wasInside && cursor.strength < 0.05) {\r
        cursor.x = pointer.x;\r
        cursor.y = pointer.y;\r
      }\r
      wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      onPointerMove(event);\r
      if (!pointer.inside || !settingsRef.current.clickPulse || reduce) return;\r
      pulse.x = pointer.x;\r
      pulse.y = pointer.y;\r
      pulse.age = 0;\r
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
      states.forEach(dropTarget);\r
      dropTarget(boundTarget);\r
      gl.deleteProgram(sim.program);\r
      gl.deleteProgram(bounds.program);\r
      gl.deleteProgram(render.program);\r
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
      style={mixBlendMode ? { ...style, mixBlendMode } : style}\r
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Ferrofluid;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties, type HTMLAttributes } from 'react';\r
import './Ferrofluid.css';\r
\r
export type FerrofluidFlow = 'up' | 'down' | 'left' | 'right' | 'none';\r
\r
export interface FerrofluidProps extends HTMLAttributes<HTMLDivElement> {\r
  colors?: string[];\r
  speed?: number;\r
  scale?: number;\r
  spikeHeight?: number;\r
  sharpness?: number;\r
  turbulence?: number;\r
  fluidity?: number;\r
  tilt?: number;\r
  magnetism?: number;\r
  variation?: number;\r
  flowDirection?: FerrofluidFlow;\r
  brightness?: number;\r
  mouseInteraction?: boolean;\r
  mouseStrength?: number;\r
  mouseRadius?: number;\r
  mouseDampening?: number;\r
  clickPulse?: boolean;\r
  intro?: boolean;\r
  lightMode?: boolean;\r
  transparent?: boolean;\r
  color?: string;\r
  opacity?: number;\r
  paused?: boolean;\r
  dpr?: number;\r
  mixBlendMode?: CSSProperties['mixBlendMode'];\r
}\r
\r
type Settings = {\r
  colors: string[];\r
  speed: number;\r
  scale: number;\r
  spikeHeight: number;\r
  sharpness: number;\r
  turbulence: number;\r
  fluidity: number;\r
  tilt: number;\r
  magnetism: number;\r
  variation: number;\r
  flow: number[];\r
  brightness: number;\r
  mouseInteraction: boolean;\r
  mouseStrength: number;\r
  mouseRadius: number;\r
  mouseDampening: number;\r
  clickPulse: boolean;\r
  intro: boolean;\r
  lightMode: boolean;\r
  transparent: boolean;\r
  color?: string;\r
  opacity: number;\r
  paused: boolean;\r
  dpr?: number;\r
};\r
\r
type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };\r
\r
type Target = { texture: WebGLTexture | null; framebuffer: WebGLFramebuffer | null };\r
\r
const CELL = 1 / 3;\r
const BOUND_CELL = 1;\r
const INTRO_SECONDS = 2.4;\r
const FOV = (38 * Math.PI) / 180;\r
const FLOW: Record<string, number[]> = { up: [0, 1], down: [0, -1], left: [-1, 0], right: [1, 0], none: [0, 0] };\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const SIM_FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uState;\r
uniform vec2 uGridOrigin;\r
uniform float uCell;\r
uniform float uDt;\r
uniform float uTime;\r
uniform vec2 uFlow;\r
uniform float uTurbulence;\r
uniform float uMagnetism;\r
uniform float uFieldScale;\r
uniform vec2 uSeed;\r
uniform vec4 uCursor;\r
uniform vec4 uPulse;\r
uniform float uPulseSpeed;\r
uniform float uPulseWidth;\r
uniform vec3 uIntro;\r
uniform float uSpikeHeight;\r
uniform float uMound;\r
uniform float uStiffness;\r
uniform float uDamping;\r
uniform float uSettle;\r
out vec4 outState;\r
\r
float hash(vec2 p) {\r
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);\r
  p3 += dot(p3, p3.yzx + 33.33);\r
  return fract((p3.x + p3.y) * p3.z);\r
}\r
\r
float noise(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = fract(p);\r
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);\r
  float a = hash(i);\r
  float b = hash(i + vec2(1.0, 0.0));\r
  float c = hash(i + vec2(0.0, 1.0));\r
  float d = hash(i + vec2(1.0, 1.0));\r
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);\r
}\r
\r
float flowField(vec2 p) {\r
  vec2 q = p / uFieldScale + uSeed;\r
  vec2 drift = uFlow * uTime * 0.55;\r
  vec2 warp = vec2(noise(q * 0.6 + vec2(uTime * 0.07, 3.1)), noise(q * 0.6 - vec2(7.3, uTime * 0.06))) - 0.5;\r
  vec2 r = q + warp * 1.8 * uTurbulence - drift;\r
  float n = noise(r) * 0.65 + noise(r * 2.03 + 11.7 - drift * 0.5) * 0.35;\r
  return smoothstep(0.44, 0.86, n);\r
}\r
\r
void main() {\r
  vec2 texel = floor(gl_FragCoord.xy);\r
  vec2 p = uGridOrigin + (texel + 0.5) * uCell;\r
  vec4 prev = texelFetch(uState, ivec2(texel), 0);\r
  float swell = flowField(p);\r
  float field = uMagnetism * (0.03 + 1.0 * swell * swell);\r
  vec2 dc = p - uCursor.xy;\r
  float falloff = dot(dc, dc) / (uCursor.w * uCursor.w);\r
  field += uCursor.z * exp(-falloff);\r
  float mound = uCursor.z * exp(-falloff / 2.2);\r
  if (uPulse.w > 0.0) {\r
    float ring = length(p - uPulse.xy) - uPulse.z * uPulseSpeed;\r
    float envelope = smoothstep(0.0, 0.08, uPulse.z) * exp(-uPulse.z * 1.1);\r
    field += uPulse.w * envelope * exp(-ring * ring / (uPulseWidth * uPulseWidth));\r
  }\r
  float front = clamp((uIntro.z - length(p - uIntro.xy)) / 3.0, 0.0, 1.0);\r
  front = front * front * (3.0 - 2.0 * front);\r
  float target = uSpikeHeight * min(pow(max(field * front - 0.04, 0.0), 1.6), 1.0);\r
  float height = prev.x;\r
  float velocity = prev.y;\r
  if (uSettle > 0.5) {\r
    height = target;\r
    velocity = 0.0;\r
  } else {\r
    float steps = ceil(uDt / 0.008);\r
    float h = uDt / steps;\r
    for (int k = 0; k < 8; k++) {\r
      if (float(k) >= steps) break;\r
      velocity += (uStiffness * (target - height) - uDamping * velocity) * h;\r
      height += velocity * h;\r
    }\r
    if (height < 0.0) {\r
      height = 0.0;\r
      velocity = max(velocity, 0.0);\r
    }\r
  }\r
  outState = vec4(height, velocity, mound * front * uMound, 1.0);\r
}\`;\r
\r
const BOUND_FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uState;\r
uniform vec2 uGridOrigin;\r
uniform float uCell;\r
uniform vec2 uStateSize;\r
uniform float uBoundCell;\r
out vec4 outBound;\r
\r
void main() {\r
  vec2 center = uGridOrigin + (floor(gl_FragCoord.xy) + 0.5) * uBoundCell;\r
  vec2 base = floor((center - uGridOrigin) / uCell);\r
  float top = 0.0;\r
  float peak = 0.0;\r
  for (int y = -4; y <= 4; y++) {\r
    for (int x = -4; x <= 4; x++) {\r
      vec2 texel = clamp(base + vec2(float(x), float(y)), vec2(0.0), uStateSize - 1.0);\r
      vec4 s = texelFetch(uState, ivec2(texel), 0);\r
      top = max(top, max(s.x, 0.0) * 1.05 + s.z);\r
      peak = max(peak, s.x);\r
    }\r
  }\r
  outBound = vec4(top, peak, 0.0, 1.0);\r
}\`;\r
\r
const RENDER_FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uField;\r
uniform sampler2D uBound;\r
uniform vec2 uGridOrigin;\r
uniform vec2 uGridSpan;\r
uniform vec2 uBoundSpan;\r
uniform float uCellSize;\r
uniform vec2 uResolution;\r
uniform vec3 uCamera;\r
uniform vec3 uForward;\r
uniform vec3 uUpward;\r
uniform float uTanHalf;\r
uniform float uPixelAngle;\r
uniform float uFar;\r
uniform float uFogStart;\r
uniform float uTop;\r
uniform float uBottom;\r
uniform float uTime;\r
uniform vec4 uCursor;\r
uniform float uMound;\r
uniform float uRound;\r
uniform float uSpan;\r
uniform float uExponent;\r
uniform float uWarp;\r
uniform vec3 uKey;\r
uniform vec3 uStrip;\r
uniform vec3 uFill;\r
uniform float uExposure;\r
uniform float uLight;\r
uniform float uOpaque;\r
uniform vec3 uBase;\r
uniform float uOpacity;\r
out vec4 outColor;\r
\r
const float G = 7.2551975;\r
const vec2 E1 = vec2(0.8660254, 0.5);\r
const vec2 E2 = vec2(-0.8660254, 0.5);\r
const vec2 E3 = vec2(0.0, -1.0);\r
const mat2 TURN = mat2(0.9902681, 0.1391731, -0.1391731, 0.9902681);\r
const float F0 = 0.06;\r
\r
vec3 mound(vec2 p) {\r
  vec2 d = p - uCursor.xy;\r
  float inv = 1.0 / (uCursor.w * uCursor.w * 2.2);\r
  float e = uCursor.z * exp(-dot(d, d) * inv);\r
  return vec3(e, -2.0 * inv * e * d) * uMound;\r
}\r
\r
vec2 lattice(vec2 p) {\r
  vec2 q = TURN * p;\r
  float t = uTime * 0.35;\r
  return q + uWarp * vec2(sin(q.y * 0.9 + t), cos(q.x * 0.8 - t * 0.8));\r
}\r
\r
float detail(float t) {\r
  return smoothstep(3.0, 8.0, 1.0 / max(t * uPixelAngle, 1e-5)) * (1.0 - smoothstep(uFogStart, mix(uFogStart, uFar, 0.7), t));\r
}\r
\r
float profile(float u, out float rate) {\r
  float root = sqrt(max(1.0 - u, 0.0) + uRound * uRound);\r
  rate = 0.5 / (uSpan * root);\r
  return clamp(1.0 - (root - uRound) / uSpan, 0.0, 1.0);\r
}\r
\r
float spikes(vec2 p, float a, float rise, out float clearance) {\r
  clearance = 10.0;\r
  if (a < 0.002) return 0.0;\r
  vec2 q = lattice(p);\r
  float u = (cos(G * dot(E1, q)) + cos(G * dot(E2, q)) + cos(G * dot(E3, q)) + 1.5) / 4.5;\r
  if (a > 0.05) {\r
    float root = uRound + (1.0 - pow(clamp(rise / a, 0.0, 1.0), 1.0 / uExponent)) * uSpan;\r
    clearance = sqrt(max(1.0 - u, 0.0) / 8.77) - sqrt(max(root * root - uRound * uRound, 0.0) / 8.77);\r
  }\r
  float rate;\r
  return a * pow(profile(u, rate), uExponent);\r
}\r
\r
vec2 spikesSlope(vec2 p, float a, vec2 aSlope) {\r
  if (a < 0.002) return vec2(0.0);\r
  vec2 q = lattice(p);\r
  float c1 = G * dot(E1, q);\r
  float c2 = G * dot(E2, q);\r
  float c3 = G * dot(E3, q);\r
  float u = (cos(c1) + cos(c2) + cos(c3) + 1.5) / 4.5;\r
  vec2 du = -(G / 4.5) * (sin(c1) * E1 + sin(c2) * E2 + sin(c3) * E3) * TURN;\r
  float rate;\r
  float s = max(profile(u, rate), 1e-4);\r
  float shape = pow(s, uExponent);\r
  return a * uExponent * shape / s * rate * du + aSlope * shape;\r
}\r
\r
float surface(vec2 p, float z, float t, out float clearance) {\r
  vec4 f = texture(uField, (p - uGridOrigin) / uGridSpan);\r
  return f.z + spikes(p, f.x * detail(t), z - f.z, clearance);\r
}\r
\r
vec2 bound(vec2 p) {\r
  return texture(uBound, (p - uGridOrigin) / uBoundSpan).rg;\r
}\r
\r
float panel(vec3 r, vec3 dir, vec3 up, vec2 extent, float soft) {\r
  vec3 side = normalize(cross(dir, up));\r
  vec3 top = cross(side, dir);\r
  float facing = dot(r, dir);\r
  if (facing <= 0.0) return 0.0;\r
  vec2 q = vec2(dot(r, side), dot(r, top)) / facing;\r
  vec2 e = smoothstep(extent + soft, extent - soft, abs(q));\r
  return e.x * e.y;\r
}\r
\r
vec3 studio(vec3 r, vec3 rd, float soft) {\r
  vec3 z = vec3(0.0, 0.0, 1.0);\r
  vec3 col = uKey * 4.2 * panel(r, normalize(vec3(-0.3, -0.5, 0.81)), z, vec2(0.36, 0.22), 0.08 + soft);\r
  col += uStrip * 1.5 * panel(r, normalize(vec3(-0.9, -0.2, 0.38)), z, vec2(0.12, 0.7), 0.07 + soft);\r
  col += uStrip * 1.5 * panel(r, normalize(vec3(0.9, -0.1, 0.42)), z, vec2(0.12, 0.7), 0.07 + soft);\r
  float lift = asin(clamp(r.z, -1.0, 1.0)) - asin(clamp(-rd.z, -1.0, 1.0));\r
  col += uFill * 0.45 * smoothstep(0.08 - soft, 0.7 + soft, lift) * smoothstep(1.6, 1.0, lift);\r
  return col;\r
}\r
\r
vec4 finish(vec3 light, vec3 paper, float alpha) {\r
  if (uLight > 0.5) {\r
    if (uOpaque > 0.5) return vec4(mix(uBase, paper, alpha) * uOpacity, uOpacity);\r
    vec3 shade = mix(vec3(1.0), paper, alpha * uOpacity);\r
    float cover = 1.0 - min(shade.r, min(shade.g, shade.b));\r
    return vec4(shade - (1.0 - cover), cover);\r
  }\r
  vec3 glow = light * alpha * uOpacity;\r
  if (uOpaque > 0.5) return vec4(uBase + glow, 1.0);\r
  return vec4(glow, max(glow.r, max(glow.g, glow.b)));\r
}\r
\r
void main() {\r
  vec2 ndc = (gl_FragCoord.xy - 0.5 * uResolution) / (0.5 * uResolution.y);\r
  vec3 side = normalize(cross(uForward, uUpward));\r
  vec3 rd = normalize(uForward + (ndc.x * side + ndc.y * uUpward) * uTanHalf);\r
  if (rd.z > -0.004) {\r
    outColor = finish(vec3(0.0), vec3(1.0), 0.0);\r
    return;\r
  }\r
  float tTop = max((uTop - uCamera.z) / rd.z, 0.0);\r
  float tEnd = min((uBottom - uCamera.z) / rd.z, uFar);\r
  if (tTop >= tEnd) {\r
    outColor = finish(vec3(0.0), vec3(1.0), 0.0);\r
    return;\r
  }\r
  float sink = max(-rd.z, 0.2);\r
  float glide = max(length(rd.xy), 0.05);\r
  float chunk = 0.9 / glide;\r
  float t = tEnd;\r
  float tPrev = tEnd;\r
  bool found = false;\r
  bool smoothHit = false;\r
  float t0 = tTop;\r
  vec2 b0 = bound(uCamera.xy + rd.xy * t0);\r
  for (int c = 0; c < 64; c++) {\r
    if (t0 >= tEnd) break;\r
    float t1 = min(t0 + chunk, tEnd);\r
    vec2 b1 = bound(uCamera.xy + rd.xy * t1);\r
    float b = max(b0.x, b1.x) + 0.03;\r
    float z1 = uCamera.z + rd.z * t1;\r
    if (z1 > b) {\r
      t0 = t1;\r
      b0 = b1;\r
      continue;\r
    }\r
    float tt = max(t0, (b - uCamera.z) / rd.z);\r
    if (max(b0.y, b1.y) < 0.002) {\r
      for (int k = 0; k < 3; k++) {\r
        vec3 probe = uCamera + rd * tt;\r
        tt += (probe.z - mound(probe.xy).x) / sink * 0.95;\r
      }\r
      if (tt <= t1 + 0.02 || t1 >= tEnd) {\r
        t = tt;\r
        smoothHit = true;\r
        break;\r
      }\r
      t0 = t1;\r
      b0 = b1;\r
      continue;\r
    }\r
    float tp = tt;\r
    for (int k = 0; k < 48; k++) {\r
      vec3 pos = uCamera + rd * tt;\r
      float clearance;\r
      float gap = pos.z - surface(pos.xy, pos.z, tt, clearance);\r
      if (gap < 0.0) {\r
        found = true;\r
        break;\r
      }\r
      tp = tt;\r
      float pixel = tt * uPixelAngle;\r
      float limit = pos.z > bound(pos.xy).x + 0.02 ? 0.6 / glide : max(clearance * 0.9, pixel) / glide;\r
      tt += max(min(gap * 0.75 / sink, limit), pixel);\r
      if (tt > t1) break;\r
    }\r
    if (found) {\r
      t = tt;\r
      tPrev = tp;\r
      break;\r
    }\r
    t0 = t1;\r
    b0 = b1;\r
  }\r
\r
  vec3 pos;\r
  vec2 slope;\r
  if (smoothHit || !found) {\r
    pos = uCamera + rd * t;\r
    slope = mound(pos.xy).yz;\r
  } else {\r
    float lo = tPrev;\r
    float hi = t;\r
    for (int k = 0; k < 4; k++) {\r
      float mid = 0.5 * (lo + hi);\r
      vec3 probe = uCamera + rd * mid;\r
      float clearance;\r
      if (probe.z - surface(probe.xy, probe.z, mid, clearance) < 0.0) hi = mid;\r
      else lo = mid;\r
    }\r
    t = hi;\r
    pos = uCamera + rd * t;\r
    vec2 uv = (pos.xy - uGridOrigin) / uGridSpan;\r
    vec2 step = uCellSize / uGridSpan;\r
    float fade = detail(t);\r
    float a = texture(uField, uv).x * fade;\r
    vec2 aSlope = vec2(\r
      texture(uField, uv + vec2(step.x, 0.0)).x - texture(uField, uv - vec2(step.x, 0.0)).x,\r
      texture(uField, uv + vec2(0.0, step.y)).x - texture(uField, uv - vec2(0.0, step.y)).x\r
    ) * fade / (2.0 * uCellSize);\r
    slope = mound(pos.xy).yz + spikesSlope(pos.xy, a, aSlope);\r
  }\r
\r
  vec3 n = normalize(vec3(-slope, 1.0));\r
  vec3 r = reflect(rd, n);\r
  float soft = length(fwidth(r)) * 0.6;\r
  float facing = max(dot(n, -rd), 0.0);\r
  float fresnel = F0 + (1.0 - F0) * pow(1.0 - facing, 5.0);\r
  float rim = pow(1.0 - clamp(abs(dot(rd, n)), 0.0, 1.0), 3.0) * smoothstep(0.85, 0.4, n.z);\r
  float distance = 1.0 - smoothstep(uFogStart, uFar, t);\r
\r
  if (uLight > 0.5) {\r
    vec3 key = normalize(vec3(-0.45, -0.55, 0.7));\r
    float lambert = clamp(dot(n, key) / key.z, 0.0, 1.0);\r
    float diffuse = mix(0.62, 1.0, lambert);\r
    float room = mix(0.3, 1.0, smoothstep(-0.25, 0.3, r.z));\r
    room -= 0.3 * rim;\r
    float lum = mix(diffuse, room, fresnel);\r
    lum = 1.0 - (1.0 - lum) * clamp(uExposure / 3.0, 0.0, 1.5);\r
    vec3 shadow = mix(vec3(0.0), uStrip, 0.45);\r
    vec3 paper = mix(shadow, vec3(1.0), clamp(lum, 0.0, 1.0));\r
    outColor = finish(vec3(0.0), paper, distance);\r
    return;\r
  }\r
\r
  vec3 shine = 1.0 - exp(-(studio(r, rd, soft) * fresnel + uFill * rim * 0.35) * uExposure);\r
  outColor = finish(shine, vec3(1.0), distance);\r
}\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const shapeOf = (sharpness: number) => {\r
  const edge = clamp((sharpness - 1) / 4, 0, 1);\r
  const round = 1 - edge * 0.7;\r
  const exponent = 1.05 + edge * 1.2;\r
  const span = Math.sqrt(1 + round * round) - round;\r
  return { round, exponent, span };\r
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
  const uniforms: Record<string, WebGLUniformLocation | null> = {};\r
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
  for (let i = 0; i < count; i++) {\r
    const info = gl.getActiveUniform(program, i);\r
    if (info) uniforms[info.name.replace('[0]', '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const Ferrofluid = ({\r
  colors = ['#ffffff', '#ffffff', '#ffffff'],\r
  speed = 0.5,\r
  scale = 1.6,\r
  spikeHeight = 1,\r
  sharpness = 2.5,\r
  turbulence = 1,\r
  fluidity = 0.5,\r
  tilt = 48,\r
  magnetism = 1,\r
  variation = 0,\r
  flowDirection = 'down',\r
  brightness = 1,\r
  mouseInteraction = true,\r
  mouseStrength = 1,\r
  mouseRadius = 0.22,\r
  mouseDampening = 0.15,\r
  clickPulse = true,\r
  intro = true,\r
  lightMode = false,\r
  transparent = true,\r
  color,\r
  opacity = 1,\r
  paused = false,\r
  dpr,\r
  mixBlendMode,\r
  className = '',\r
  style,\r
  ...rest\r
}: FerrofluidProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings: Settings = {\r
    colors: Array.isArray(colors) && colors.length ? colors.slice(0, 3) : ['#ffffff'],\r
    speed: Math.max(0, speed),\r
    scale: clamp(scale, 0.2, 6),\r
    spikeHeight: Math.max(0, spikeHeight),\r
    sharpness: clamp(sharpness, 0.6, 6),\r
    turbulence: Math.max(0, turbulence),\r
    fluidity: clamp(fluidity, 0, 1),\r
    tilt: clamp(tilt, 10, 70),\r
    magnetism: Math.max(0, magnetism),\r
    variation,\r
    flow: FLOW[flowDirection] ?? FLOW.down,\r
    brightness: Math.max(0, brightness),\r
    mouseInteraction,\r
    mouseStrength: Math.max(0, mouseStrength),\r
    mouseRadius: clamp(mouseRadius, 0.02, 2),\r
    mouseDampening: Math.max(0, mouseDampening),\r
    clickPulse,\r
    intro,\r
    lightMode,\r
    transparent,\r
    color,\r
    opacity: clamp(opacity, 0, 1),\r
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
    const floatTargets = Boolean(gl.getExtension('EXT_color_buffer_float'));\r
    const sim = link(gl, SIM_FRAGMENT);\r
    const bounds = link(gl, BOUND_FRAGMENT);\r
    const render = link(gl, RENDER_FRAGMENT);\r
    if (!sim || !bounds || !render) return undefined;\r
\r
    const buffer = gl.createBuffer();\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const makeTarget = (width: number, height: number, filter: number): Target => {\r
      const texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      if (floatTargets) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.HALF_FLOAT, null);\r
      else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      const framebuffer = gl.createFramebuffer();\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      return { texture, framebuffer };\r
    };\r
    const dropTarget = (target: Target | null) => {\r
      if (!target) return;\r
      gl.deleteTexture(target.texture);\r
      gl.deleteFramebuffer(target.framebuffer);\r
    };\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const cache = new Map<string, number[]>();\r
    const parse = (value: string | undefined, fallback: number[]): number[] => {\r
      if (!value) return fallback;\r
      const key = String(value);\r
      const cached = cache.get(key);\r
      if (cached) return cached;\r
      let rgb = fallback;\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#000000';\r
        probe.fillStyle = key;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      cache.set(key, rgb);\r
      return rgb;\r
    };\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const tanHalf = Math.tan(FOV / 2);\r
    const view = { width: 1, height: 1, worldHeight: 10, scale: 0, tilt: -1, reach: 1 };\r
    const camera = { x: 0, y: 0, z: 1, forward: [0, 1, 0], upward: [0, 0, 1], far: 10, distance: 4 };\r
    const grid = { width: 0, height: 0, originX: 0, originY: 0, boundWidth: 0, boundHeight: 0 };\r
    let states: Target[] = [];\r
    let boundTarget: Target | null = null;\r
    let current = 0;\r
    let settle = true;\r
\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const cursor = { x: 0, y: 0, strength: 0 };\r
    const pulse = { x: 0, y: 0, age: 10 };\r
    let wander = 0;\r
    let presence = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let shape = shapeOf(settingsRef.current.sharpness);\r
    let shapeKey = settingsRef.current.sharpness;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const castRay = (x: number, y: number): [number, number, number] => {\r
      const aspect = view.width / view.height;\r
      const sx = x * aspect * tanHalf;\r
      const sy = y * tanHalf;\r
      const [fx, fy, fz] = camera.forward;\r
      const [, uy, uz] = camera.upward;\r
      const dx = fx + sx;\r
      const dy = fy + sy * uy;\r
      const dz = fz + sy * uz;\r
      const length = Math.hypot(dx, dy, dz) || 1;\r
      return [dx / length, dy / length, dz / length];\r
    };\r
\r
    const groundAt = (x: number, y: number): [number, number] => {\r
      const [dx, dy, dz] = castRay(x, y);\r
      const t = dz < -0.004 ? Math.min(-camera.z / dz, camera.far) : camera.far;\r
      return [camera.x + dx * t, camera.y + dy * t];\r
    };\r
\r
    const layout = () => {\r
      const s = settingsRef.current;\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      view.width = canvas.width;\r
      view.height = canvas.height;\r
      view.worldHeight = 22 / s.scale;\r
      view.scale = s.scale;\r
      view.tilt = s.tilt;\r
      const pitch = ((90 - s.tilt) * Math.PI) / 180;\r
      const distance = view.worldHeight / (2 * tanHalf);\r
      camera.forward = [0, Math.cos(pitch), -Math.sin(pitch)];\r
      camera.upward = [0, Math.sin(pitch), Math.cos(pitch)];\r
      camera.x = 0;\r
      camera.y = -distance * Math.cos(pitch);\r
      camera.z = distance * Math.sin(pitch);\r
      camera.far = distance * 2.5;\r
      camera.distance = distance;\r
      const corners = [groundAt(-1, -1), groundAt(1, -1), groundAt(-1, 1), groundAt(1, 1), groundAt(0, 1)];\r
      const xs = corners.map(c => c[0]);\r
      const ys = corners.map(c => c[1]);\r
      const minX = Math.min(...xs) - 3;\r
      const maxX = Math.max(...xs) + 3;\r
      const minY = Math.min(...ys) - 3;\r
      const maxY = Math.max(...ys) + 3;\r
      view.reach = Math.max(...corners.map(c => Math.hypot(c[0], c[1]))) + 4;\r
      const gridWidth = Math.ceil((maxX - minX) / CELL) + 2;\r
      const gridHeight = Math.ceil((maxY - minY) / CELL) + 2;\r
      grid.originX = minX;\r
      grid.originY = minY;\r
      if (gridWidth !== grid.width || gridHeight !== grid.height) {\r
        states.forEach(dropTarget);\r
        dropTarget(boundTarget);\r
        states = [makeTarget(gridWidth, gridHeight, gl.LINEAR), makeTarget(gridWidth, gridHeight, gl.LINEAR)];\r
        grid.width = gridWidth;\r
        grid.height = gridHeight;\r
        grid.boundWidth = Math.ceil((gridWidth * CELL) / BOUND_CELL);\r
        grid.boundHeight = Math.ceil((gridHeight * CELL) / BOUND_CELL);\r
        boundTarget = makeTarget(grid.boundWidth, grid.boundHeight, gl.NEAREST);\r
        current = 0;\r
      }\r
      settle = true;\r
    };\r
\r
    const toWorld = (clientX: number, clientY: number): [number, number] => {\r
      const rect = container.getBoundingClientRect();\r
      const x = ((clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;\r
      const y = 1 - ((clientY - rect.top) / Math.max(1, rect.height)) * 2;\r
      return groundAt(x, y);\r
    };\r
\r
    const step = (dt: number) => {\r
      const s = settingsRef.current;\r
      if (s.scale !== view.scale || s.tilt !== view.tilt) layout();\r
      const motion = s.paused ? 0 : 1;\r
      wander += dt * motion * (reduce ? 0 : s.speed);\r
      presence = s.intro && !reduce ? Math.min(1, presence + (dt * motion) / INTRO_SECONDS) : 1;\r
      pulse.age += dt * motion;\r
\r
      const engaged = s.mouseInteraction && pointer.inside;\r
      const follow = s.mouseDampening > 0 ? 1 - Math.exp(-dt / s.mouseDampening) : 1;\r
      if (engaged) {\r
        cursor.x += (pointer.x - cursor.x) * follow;\r
        cursor.y += (pointer.y - cursor.y) * follow;\r
      }\r
      const targetStrength = engaged ? s.mouseStrength * 1.4 : 0;\r
      cursor.strength += (targetStrength - cursor.strength) * (1 - Math.exp(-dt / 0.35));\r
      if (Math.abs(targetStrength - cursor.strength) < 0.001) cursor.strength = targetStrength;\r
    };\r
\r
    const draw = (dt: number) => {\r
      if (!boundTarget || states.length < 2) return;\r
      const s = settingsRef.current;\r
      const worldUnit = view.worldHeight;\r
      const radius = s.mouseRadius * worldUnit;\r
      const fullHeight = 1.2 * s.spikeHeight;\r
      if (s.sharpness !== shapeKey) {\r
        shapeKey = s.sharpness;\r
        shape = shapeOf(s.sharpness);\r
      }\r
      const reveal = presence * presence * (3 - 2 * presence);\r
      gl.bindVertexArray(vao);\r
      gl.activeTexture(gl.TEXTURE0);\r
\r
      const read = states[current];\r
      const write = states[1 - current];\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, write.framebuffer);\r
      gl.viewport(0, 0, grid.width, grid.height);\r
      gl.useProgram(sim.program);\r
      const su = sim.uniforms;\r
      gl.bindTexture(gl.TEXTURE_2D, read.texture);\r
      gl.uniform1i(su.uState, 0);\r
      gl.uniform2f(su.uGridOrigin, grid.originX, grid.originY);\r
      gl.uniform1f(su.uCell, CELL);\r
      gl.uniform1f(su.uDt, Math.max(dt, 0.001));\r
      gl.uniform1f(su.uTime, wander);\r
      gl.uniform2f(su.uFlow, s.flow[0], s.flow[1]);\r
      gl.uniform1f(su.uTurbulence, s.turbulence);\r
      gl.uniform1f(su.uMagnetism, s.magnetism);\r
      gl.uniform1f(su.uFieldScale, 5.5);\r
      gl.uniform2f(su.uSeed, s.variation * 17.31, s.variation * 9.73);\r
      gl.uniform4f(su.uCursor, cursor.x, cursor.y, cursor.strength, radius);\r
      gl.uniform4f(su.uPulse, pulse.x, pulse.y, pulse.age, pulse.age < 4 ? 1.1 : 0);\r
      gl.uniform1f(su.uPulseSpeed, worldUnit * 0.45);\r
      gl.uniform1f(su.uPulseWidth, 1.4);\r
      gl.uniform3f(su.uIntro, 0, 0, reveal * (view.reach + 3));\r
      gl.uniform1f(su.uSpikeHeight, fullHeight);\r
      gl.uniform1f(su.uMound, 0.6);\r
      gl.uniform1f(su.uStiffness, 150);\r
      gl.uniform1f(su.uDamping, 22 - s.fluidity * 15);\r
      gl.uniform1f(su.uSettle, settle || !floatTargets || reduce ? 1 : 0);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      settle = false;\r
      current = 1 - current;\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, boundTarget.framebuffer);\r
      gl.viewport(0, 0, grid.boundWidth, grid.boundHeight);\r
      gl.useProgram(bounds.program);\r
      const bu = bounds.uniforms;\r
      gl.bindTexture(gl.TEXTURE_2D, write.texture);\r
      gl.uniform1i(bu.uState, 0);\r
      gl.uniform2f(bu.uGridOrigin, grid.originX, grid.originY);\r
      gl.uniform1f(bu.uCell, CELL);\r
      gl.uniform2f(bu.uStateSize, grid.width, grid.height);\r
      gl.uniform1f(bu.uBoundCell, BOUND_CELL);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, view.width, view.height);\r
      gl.useProgram(render.program);\r
      const ru = render.uniforms;\r
      gl.bindTexture(gl.TEXTURE_2D, write.texture);\r
      gl.uniform1i(ru.uField, 0);\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.bindTexture(gl.TEXTURE_2D, boundTarget.texture);\r
      gl.uniform1i(ru.uBound, 1);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.uniform2f(ru.uGridOrigin, grid.originX, grid.originY);\r
      gl.uniform2f(ru.uGridSpan, grid.width * CELL, grid.height * CELL);\r
      gl.uniform2f(ru.uBoundSpan, grid.boundWidth * BOUND_CELL, grid.boundHeight * BOUND_CELL);\r
      gl.uniform1f(ru.uCellSize, CELL);\r
      gl.uniform2f(ru.uResolution, view.width, view.height);\r
      gl.uniform3f(ru.uCamera, camera.x, camera.y, camera.z);\r
      gl.uniform3fv(ru.uForward, camera.forward);\r
      gl.uniform3fv(ru.uUpward, camera.upward);\r
      gl.uniform1f(ru.uTanHalf, tanHalf);\r
      gl.uniform1f(ru.uPixelAngle, (2 * tanHalf) / view.height);\r
      gl.uniform1f(ru.uFar, camera.far);\r
      gl.uniform1f(ru.uFogStart, camera.distance * 0.95);\r
      gl.uniform1f(ru.uTop, fullHeight * 1.6 + 0.6 * 3 + 0.1);\r
      gl.uniform1f(ru.uBottom, -0.05);\r
      gl.uniform1f(ru.uTime, wander * 2);\r
      gl.uniform4f(ru.uCursor, cursor.x, cursor.y, cursor.strength, radius);\r
      gl.uniform1f(ru.uMound, 0.6);\r
      gl.uniform1f(ru.uRound, shape.round);\r
      gl.uniform1f(ru.uSpan, shape.span);\r
      gl.uniform1f(ru.uExponent, shape.exponent);\r
      gl.uniform1f(ru.uWarp, 0.06 * s.turbulence);\r
      const lights = s.colors.map(value => parse(value, [1, 1, 1]));\r
      const key = lights[0];\r
      const strip = lights[1] ?? key;\r
      const fill = lights[2] ?? strip;\r
      gl.uniform3fv(ru.uKey, key);\r
      gl.uniform3fv(ru.uStrip, strip);\r
      gl.uniform3fv(ru.uFill, fill);\r
      gl.uniform1f(ru.uExposure, 3 * s.brightness);\r
      gl.uniform1f(ru.uLight, s.lightMode ? 1 : 0);\r
      gl.uniform1f(ru.uOpaque, s.transparent ? 0 : 1);\r
      gl.uniform3fv(ru.uBase, parse(s.color, s.lightMode ? [1, 1, 1] : [0.0706, 0.0588, 0.0902]));\r
      gl.uniform1f(ru.uOpacity, s.opacity);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const dt = last ? clamp((now - last) / 1000, 0.0005, 0.05) : 1 / 60;\r
      last = now;\r
      step(dt);\r
      draw(dt);\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const resize = () => {\r
      layout();\r
      draw(0);\r
      wake();\r
    };\r
\r
    const locate = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      [pointer.x, pointer.y] = toWorld(event.clientX, event.clientY);\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const wasInside = pointer.inside;\r
      locate(event);\r
      if (pointer.inside && !wasInside && cursor.strength < 0.05) {\r
        cursor.x = pointer.x;\r
        cursor.y = pointer.y;\r
      }\r
      wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      onPointerMove(event);\r
      if (!pointer.inside || !settingsRef.current.clickPulse || reduce) return;\r
      pulse.x = pointer.x;\r
      pulse.y = pointer.y;\r
      pulse.age = 0;\r
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
      states.forEach(dropTarget);\r
      dropTarget(boundTarget);\r
      gl.deleteProgram(sim.program);\r
      gl.deleteProgram(bounds.program);\r
      gl.deleteProgram(render.program);\r
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
      className={\`ferrofluid-container\${className ? \` \${className}\` : ''}\`}\r
      style={mixBlendMode ? { ...style, mixBlendMode } : style}\r
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className="ferrofluid-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Ferrofluid;\r
`,o=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties, type HTMLAttributes } from 'react';\r
\r
export type FerrofluidFlow = 'up' | 'down' | 'left' | 'right' | 'none';\r
\r
export interface FerrofluidProps extends HTMLAttributes<HTMLDivElement> {\r
  colors?: string[];\r
  speed?: number;\r
  scale?: number;\r
  spikeHeight?: number;\r
  sharpness?: number;\r
  turbulence?: number;\r
  fluidity?: number;\r
  tilt?: number;\r
  magnetism?: number;\r
  variation?: number;\r
  flowDirection?: FerrofluidFlow;\r
  brightness?: number;\r
  mouseInteraction?: boolean;\r
  mouseStrength?: number;\r
  mouseRadius?: number;\r
  mouseDampening?: number;\r
  clickPulse?: boolean;\r
  intro?: boolean;\r
  lightMode?: boolean;\r
  transparent?: boolean;\r
  color?: string;\r
  opacity?: number;\r
  paused?: boolean;\r
  dpr?: number;\r
  mixBlendMode?: CSSProperties['mixBlendMode'];\r
}\r
\r
type Settings = {\r
  colors: string[];\r
  speed: number;\r
  scale: number;\r
  spikeHeight: number;\r
  sharpness: number;\r
  turbulence: number;\r
  fluidity: number;\r
  tilt: number;\r
  magnetism: number;\r
  variation: number;\r
  flow: number[];\r
  brightness: number;\r
  mouseInteraction: boolean;\r
  mouseStrength: number;\r
  mouseRadius: number;\r
  mouseDampening: number;\r
  clickPulse: boolean;\r
  intro: boolean;\r
  lightMode: boolean;\r
  transparent: boolean;\r
  color?: string;\r
  opacity: number;\r
  paused: boolean;\r
  dpr?: number;\r
};\r
\r
type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };\r
\r
type Target = { texture: WebGLTexture | null; framebuffer: WebGLFramebuffer | null };\r
\r
const CELL = 1 / 3;\r
const BOUND_CELL = 1;\r
const INTRO_SECONDS = 2.4;\r
const FOV = (38 * Math.PI) / 180;\r
const FLOW: Record<string, number[]> = { up: [0, 1], down: [0, -1], left: [-1, 0], right: [1, 0], none: [0, 0] };\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const SIM_FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uState;\r
uniform vec2 uGridOrigin;\r
uniform float uCell;\r
uniform float uDt;\r
uniform float uTime;\r
uniform vec2 uFlow;\r
uniform float uTurbulence;\r
uniform float uMagnetism;\r
uniform float uFieldScale;\r
uniform vec2 uSeed;\r
uniform vec4 uCursor;\r
uniform vec4 uPulse;\r
uniform float uPulseSpeed;\r
uniform float uPulseWidth;\r
uniform vec3 uIntro;\r
uniform float uSpikeHeight;\r
uniform float uMound;\r
uniform float uStiffness;\r
uniform float uDamping;\r
uniform float uSettle;\r
out vec4 outState;\r
\r
float hash(vec2 p) {\r
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);\r
  p3 += dot(p3, p3.yzx + 33.33);\r
  return fract((p3.x + p3.y) * p3.z);\r
}\r
\r
float noise(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = fract(p);\r
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);\r
  float a = hash(i);\r
  float b = hash(i + vec2(1.0, 0.0));\r
  float c = hash(i + vec2(0.0, 1.0));\r
  float d = hash(i + vec2(1.0, 1.0));\r
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);\r
}\r
\r
float flowField(vec2 p) {\r
  vec2 q = p / uFieldScale + uSeed;\r
  vec2 drift = uFlow * uTime * 0.55;\r
  vec2 warp = vec2(noise(q * 0.6 + vec2(uTime * 0.07, 3.1)), noise(q * 0.6 - vec2(7.3, uTime * 0.06))) - 0.5;\r
  vec2 r = q + warp * 1.8 * uTurbulence - drift;\r
  float n = noise(r) * 0.65 + noise(r * 2.03 + 11.7 - drift * 0.5) * 0.35;\r
  return smoothstep(0.44, 0.86, n);\r
}\r
\r
void main() {\r
  vec2 texel = floor(gl_FragCoord.xy);\r
  vec2 p = uGridOrigin + (texel + 0.5) * uCell;\r
  vec4 prev = texelFetch(uState, ivec2(texel), 0);\r
  float swell = flowField(p);\r
  float field = uMagnetism * (0.03 + 1.0 * swell * swell);\r
  vec2 dc = p - uCursor.xy;\r
  float falloff = dot(dc, dc) / (uCursor.w * uCursor.w);\r
  field += uCursor.z * exp(-falloff);\r
  float mound = uCursor.z * exp(-falloff / 2.2);\r
  if (uPulse.w > 0.0) {\r
    float ring = length(p - uPulse.xy) - uPulse.z * uPulseSpeed;\r
    float envelope = smoothstep(0.0, 0.08, uPulse.z) * exp(-uPulse.z * 1.1);\r
    field += uPulse.w * envelope * exp(-ring * ring / (uPulseWidth * uPulseWidth));\r
  }\r
  float front = clamp((uIntro.z - length(p - uIntro.xy)) / 3.0, 0.0, 1.0);\r
  front = front * front * (3.0 - 2.0 * front);\r
  float target = uSpikeHeight * min(pow(max(field * front - 0.04, 0.0), 1.6), 1.0);\r
  float height = prev.x;\r
  float velocity = prev.y;\r
  if (uSettle > 0.5) {\r
    height = target;\r
    velocity = 0.0;\r
  } else {\r
    float steps = ceil(uDt / 0.008);\r
    float h = uDt / steps;\r
    for (int k = 0; k < 8; k++) {\r
      if (float(k) >= steps) break;\r
      velocity += (uStiffness * (target - height) - uDamping * velocity) * h;\r
      height += velocity * h;\r
    }\r
    if (height < 0.0) {\r
      height = 0.0;\r
      velocity = max(velocity, 0.0);\r
    }\r
  }\r
  outState = vec4(height, velocity, mound * front * uMound, 1.0);\r
}\`;\r
\r
const BOUND_FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uState;\r
uniform vec2 uGridOrigin;\r
uniform float uCell;\r
uniform vec2 uStateSize;\r
uniform float uBoundCell;\r
out vec4 outBound;\r
\r
void main() {\r
  vec2 center = uGridOrigin + (floor(gl_FragCoord.xy) + 0.5) * uBoundCell;\r
  vec2 base = floor((center - uGridOrigin) / uCell);\r
  float top = 0.0;\r
  float peak = 0.0;\r
  for (int y = -4; y <= 4; y++) {\r
    for (int x = -4; x <= 4; x++) {\r
      vec2 texel = clamp(base + vec2(float(x), float(y)), vec2(0.0), uStateSize - 1.0);\r
      vec4 s = texelFetch(uState, ivec2(texel), 0);\r
      top = max(top, max(s.x, 0.0) * 1.05 + s.z);\r
      peak = max(peak, s.x);\r
    }\r
  }\r
  outBound = vec4(top, peak, 0.0, 1.0);\r
}\`;\r
\r
const RENDER_FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uField;\r
uniform sampler2D uBound;\r
uniform vec2 uGridOrigin;\r
uniform vec2 uGridSpan;\r
uniform vec2 uBoundSpan;\r
uniform float uCellSize;\r
uniform vec2 uResolution;\r
uniform vec3 uCamera;\r
uniform vec3 uForward;\r
uniform vec3 uUpward;\r
uniform float uTanHalf;\r
uniform float uPixelAngle;\r
uniform float uFar;\r
uniform float uFogStart;\r
uniform float uTop;\r
uniform float uBottom;\r
uniform float uTime;\r
uniform vec4 uCursor;\r
uniform float uMound;\r
uniform float uRound;\r
uniform float uSpan;\r
uniform float uExponent;\r
uniform float uWarp;\r
uniform vec3 uKey;\r
uniform vec3 uStrip;\r
uniform vec3 uFill;\r
uniform float uExposure;\r
uniform float uLight;\r
uniform float uOpaque;\r
uniform vec3 uBase;\r
uniform float uOpacity;\r
out vec4 outColor;\r
\r
const float G = 7.2551975;\r
const vec2 E1 = vec2(0.8660254, 0.5);\r
const vec2 E2 = vec2(-0.8660254, 0.5);\r
const vec2 E3 = vec2(0.0, -1.0);\r
const mat2 TURN = mat2(0.9902681, 0.1391731, -0.1391731, 0.9902681);\r
const float F0 = 0.06;\r
\r
vec3 mound(vec2 p) {\r
  vec2 d = p - uCursor.xy;\r
  float inv = 1.0 / (uCursor.w * uCursor.w * 2.2);\r
  float e = uCursor.z * exp(-dot(d, d) * inv);\r
  return vec3(e, -2.0 * inv * e * d) * uMound;\r
}\r
\r
vec2 lattice(vec2 p) {\r
  vec2 q = TURN * p;\r
  float t = uTime * 0.35;\r
  return q + uWarp * vec2(sin(q.y * 0.9 + t), cos(q.x * 0.8 - t * 0.8));\r
}\r
\r
float detail(float t) {\r
  return smoothstep(3.0, 8.0, 1.0 / max(t * uPixelAngle, 1e-5)) * (1.0 - smoothstep(uFogStart, mix(uFogStart, uFar, 0.7), t));\r
}\r
\r
float profile(float u, out float rate) {\r
  float root = sqrt(max(1.0 - u, 0.0) + uRound * uRound);\r
  rate = 0.5 / (uSpan * root);\r
  return clamp(1.0 - (root - uRound) / uSpan, 0.0, 1.0);\r
}\r
\r
float spikes(vec2 p, float a, float rise, out float clearance) {\r
  clearance = 10.0;\r
  if (a < 0.002) return 0.0;\r
  vec2 q = lattice(p);\r
  float u = (cos(G * dot(E1, q)) + cos(G * dot(E2, q)) + cos(G * dot(E3, q)) + 1.5) / 4.5;\r
  if (a > 0.05) {\r
    float root = uRound + (1.0 - pow(clamp(rise / a, 0.0, 1.0), 1.0 / uExponent)) * uSpan;\r
    clearance = sqrt(max(1.0 - u, 0.0) / 8.77) - sqrt(max(root * root - uRound * uRound, 0.0) / 8.77);\r
  }\r
  float rate;\r
  return a * pow(profile(u, rate), uExponent);\r
}\r
\r
vec2 spikesSlope(vec2 p, float a, vec2 aSlope) {\r
  if (a < 0.002) return vec2(0.0);\r
  vec2 q = lattice(p);\r
  float c1 = G * dot(E1, q);\r
  float c2 = G * dot(E2, q);\r
  float c3 = G * dot(E3, q);\r
  float u = (cos(c1) + cos(c2) + cos(c3) + 1.5) / 4.5;\r
  vec2 du = -(G / 4.5) * (sin(c1) * E1 + sin(c2) * E2 + sin(c3) * E3) * TURN;\r
  float rate;\r
  float s = max(profile(u, rate), 1e-4);\r
  float shape = pow(s, uExponent);\r
  return a * uExponent * shape / s * rate * du + aSlope * shape;\r
}\r
\r
float surface(vec2 p, float z, float t, out float clearance) {\r
  vec4 f = texture(uField, (p - uGridOrigin) / uGridSpan);\r
  return f.z + spikes(p, f.x * detail(t), z - f.z, clearance);\r
}\r
\r
vec2 bound(vec2 p) {\r
  return texture(uBound, (p - uGridOrigin) / uBoundSpan).rg;\r
}\r
\r
float panel(vec3 r, vec3 dir, vec3 up, vec2 extent, float soft) {\r
  vec3 side = normalize(cross(dir, up));\r
  vec3 top = cross(side, dir);\r
  float facing = dot(r, dir);\r
  if (facing <= 0.0) return 0.0;\r
  vec2 q = vec2(dot(r, side), dot(r, top)) / facing;\r
  vec2 e = smoothstep(extent + soft, extent - soft, abs(q));\r
  return e.x * e.y;\r
}\r
\r
vec3 studio(vec3 r, vec3 rd, float soft) {\r
  vec3 z = vec3(0.0, 0.0, 1.0);\r
  vec3 col = uKey * 4.2 * panel(r, normalize(vec3(-0.3, -0.5, 0.81)), z, vec2(0.36, 0.22), 0.08 + soft);\r
  col += uStrip * 1.5 * panel(r, normalize(vec3(-0.9, -0.2, 0.38)), z, vec2(0.12, 0.7), 0.07 + soft);\r
  col += uStrip * 1.5 * panel(r, normalize(vec3(0.9, -0.1, 0.42)), z, vec2(0.12, 0.7), 0.07 + soft);\r
  float lift = asin(clamp(r.z, -1.0, 1.0)) - asin(clamp(-rd.z, -1.0, 1.0));\r
  col += uFill * 0.45 * smoothstep(0.08 - soft, 0.7 + soft, lift) * smoothstep(1.6, 1.0, lift);\r
  return col;\r
}\r
\r
vec4 finish(vec3 light, vec3 paper, float alpha) {\r
  if (uLight > 0.5) {\r
    if (uOpaque > 0.5) return vec4(mix(uBase, paper, alpha) * uOpacity, uOpacity);\r
    vec3 shade = mix(vec3(1.0), paper, alpha * uOpacity);\r
    float cover = 1.0 - min(shade.r, min(shade.g, shade.b));\r
    return vec4(shade - (1.0 - cover), cover);\r
  }\r
  vec3 glow = light * alpha * uOpacity;\r
  if (uOpaque > 0.5) return vec4(uBase + glow, 1.0);\r
  return vec4(glow, max(glow.r, max(glow.g, glow.b)));\r
}\r
\r
void main() {\r
  vec2 ndc = (gl_FragCoord.xy - 0.5 * uResolution) / (0.5 * uResolution.y);\r
  vec3 side = normalize(cross(uForward, uUpward));\r
  vec3 rd = normalize(uForward + (ndc.x * side + ndc.y * uUpward) * uTanHalf);\r
  if (rd.z > -0.004) {\r
    outColor = finish(vec3(0.0), vec3(1.0), 0.0);\r
    return;\r
  }\r
  float tTop = max((uTop - uCamera.z) / rd.z, 0.0);\r
  float tEnd = min((uBottom - uCamera.z) / rd.z, uFar);\r
  if (tTop >= tEnd) {\r
    outColor = finish(vec3(0.0), vec3(1.0), 0.0);\r
    return;\r
  }\r
  float sink = max(-rd.z, 0.2);\r
  float glide = max(length(rd.xy), 0.05);\r
  float chunk = 0.9 / glide;\r
  float t = tEnd;\r
  float tPrev = tEnd;\r
  bool found = false;\r
  bool smoothHit = false;\r
  float t0 = tTop;\r
  vec2 b0 = bound(uCamera.xy + rd.xy * t0);\r
  for (int c = 0; c < 64; c++) {\r
    if (t0 >= tEnd) break;\r
    float t1 = min(t0 + chunk, tEnd);\r
    vec2 b1 = bound(uCamera.xy + rd.xy * t1);\r
    float b = max(b0.x, b1.x) + 0.03;\r
    float z1 = uCamera.z + rd.z * t1;\r
    if (z1 > b) {\r
      t0 = t1;\r
      b0 = b1;\r
      continue;\r
    }\r
    float tt = max(t0, (b - uCamera.z) / rd.z);\r
    if (max(b0.y, b1.y) < 0.002) {\r
      for (int k = 0; k < 3; k++) {\r
        vec3 probe = uCamera + rd * tt;\r
        tt += (probe.z - mound(probe.xy).x) / sink * 0.95;\r
      }\r
      if (tt <= t1 + 0.02 || t1 >= tEnd) {\r
        t = tt;\r
        smoothHit = true;\r
        break;\r
      }\r
      t0 = t1;\r
      b0 = b1;\r
      continue;\r
    }\r
    float tp = tt;\r
    for (int k = 0; k < 48; k++) {\r
      vec3 pos = uCamera + rd * tt;\r
      float clearance;\r
      float gap = pos.z - surface(pos.xy, pos.z, tt, clearance);\r
      if (gap < 0.0) {\r
        found = true;\r
        break;\r
      }\r
      tp = tt;\r
      float pixel = tt * uPixelAngle;\r
      float limit = pos.z > bound(pos.xy).x + 0.02 ? 0.6 / glide : max(clearance * 0.9, pixel) / glide;\r
      tt += max(min(gap * 0.75 / sink, limit), pixel);\r
      if (tt > t1) break;\r
    }\r
    if (found) {\r
      t = tt;\r
      tPrev = tp;\r
      break;\r
    }\r
    t0 = t1;\r
    b0 = b1;\r
  }\r
\r
  vec3 pos;\r
  vec2 slope;\r
  if (smoothHit || !found) {\r
    pos = uCamera + rd * t;\r
    slope = mound(pos.xy).yz;\r
  } else {\r
    float lo = tPrev;\r
    float hi = t;\r
    for (int k = 0; k < 4; k++) {\r
      float mid = 0.5 * (lo + hi);\r
      vec3 probe = uCamera + rd * mid;\r
      float clearance;\r
      if (probe.z - surface(probe.xy, probe.z, mid, clearance) < 0.0) hi = mid;\r
      else lo = mid;\r
    }\r
    t = hi;\r
    pos = uCamera + rd * t;\r
    vec2 uv = (pos.xy - uGridOrigin) / uGridSpan;\r
    vec2 step = uCellSize / uGridSpan;\r
    float fade = detail(t);\r
    float a = texture(uField, uv).x * fade;\r
    vec2 aSlope = vec2(\r
      texture(uField, uv + vec2(step.x, 0.0)).x - texture(uField, uv - vec2(step.x, 0.0)).x,\r
      texture(uField, uv + vec2(0.0, step.y)).x - texture(uField, uv - vec2(0.0, step.y)).x\r
    ) * fade / (2.0 * uCellSize);\r
    slope = mound(pos.xy).yz + spikesSlope(pos.xy, a, aSlope);\r
  }\r
\r
  vec3 n = normalize(vec3(-slope, 1.0));\r
  vec3 r = reflect(rd, n);\r
  float soft = length(fwidth(r)) * 0.6;\r
  float facing = max(dot(n, -rd), 0.0);\r
  float fresnel = F0 + (1.0 - F0) * pow(1.0 - facing, 5.0);\r
  float rim = pow(1.0 - clamp(abs(dot(rd, n)), 0.0, 1.0), 3.0) * smoothstep(0.85, 0.4, n.z);\r
  float distance = 1.0 - smoothstep(uFogStart, uFar, t);\r
\r
  if (uLight > 0.5) {\r
    vec3 key = normalize(vec3(-0.45, -0.55, 0.7));\r
    float lambert = clamp(dot(n, key) / key.z, 0.0, 1.0);\r
    float diffuse = mix(0.62, 1.0, lambert);\r
    float room = mix(0.3, 1.0, smoothstep(-0.25, 0.3, r.z));\r
    room -= 0.3 * rim;\r
    float lum = mix(diffuse, room, fresnel);\r
    lum = 1.0 - (1.0 - lum) * clamp(uExposure / 3.0, 0.0, 1.5);\r
    vec3 shadow = mix(vec3(0.0), uStrip, 0.45);\r
    vec3 paper = mix(shadow, vec3(1.0), clamp(lum, 0.0, 1.0));\r
    outColor = finish(vec3(0.0), paper, distance);\r
    return;\r
  }\r
\r
  vec3 shine = 1.0 - exp(-(studio(r, rd, soft) * fresnel + uFill * rim * 0.35) * uExposure);\r
  outColor = finish(shine, vec3(1.0), distance);\r
}\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const shapeOf = (sharpness: number) => {\r
  const edge = clamp((sharpness - 1) / 4, 0, 1);\r
  const round = 1 - edge * 0.7;\r
  const exponent = 1.05 + edge * 1.2;\r
  const span = Math.sqrt(1 + round * round) - round;\r
  return { round, exponent, span };\r
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
  const uniforms: Record<string, WebGLUniformLocation | null> = {};\r
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
  for (let i = 0; i < count; i++) {\r
    const info = gl.getActiveUniform(program, i);\r
    if (info) uniforms[info.name.replace('[0]', '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const Ferrofluid = ({\r
  colors = ['#ffffff', '#ffffff', '#ffffff'],\r
  speed = 0.5,\r
  scale = 1.6,\r
  spikeHeight = 1,\r
  sharpness = 2.5,\r
  turbulence = 1,\r
  fluidity = 0.5,\r
  tilt = 48,\r
  magnetism = 1,\r
  variation = 0,\r
  flowDirection = 'down',\r
  brightness = 1,\r
  mouseInteraction = true,\r
  mouseStrength = 1,\r
  mouseRadius = 0.22,\r
  mouseDampening = 0.15,\r
  clickPulse = true,\r
  intro = true,\r
  lightMode = false,\r
  transparent = true,\r
  color,\r
  opacity = 1,\r
  paused = false,\r
  dpr,\r
  mixBlendMode,\r
  className = '',\r
  style,\r
  ...rest\r
}: FerrofluidProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings: Settings = {\r
    colors: Array.isArray(colors) && colors.length ? colors.slice(0, 3) : ['#ffffff'],\r
    speed: Math.max(0, speed),\r
    scale: clamp(scale, 0.2, 6),\r
    spikeHeight: Math.max(0, spikeHeight),\r
    sharpness: clamp(sharpness, 0.6, 6),\r
    turbulence: Math.max(0, turbulence),\r
    fluidity: clamp(fluidity, 0, 1),\r
    tilt: clamp(tilt, 10, 70),\r
    magnetism: Math.max(0, magnetism),\r
    variation,\r
    flow: FLOW[flowDirection] ?? FLOW.down,\r
    brightness: Math.max(0, brightness),\r
    mouseInteraction,\r
    mouseStrength: Math.max(0, mouseStrength),\r
    mouseRadius: clamp(mouseRadius, 0.02, 2),\r
    mouseDampening: Math.max(0, mouseDampening),\r
    clickPulse,\r
    intro,\r
    lightMode,\r
    transparent,\r
    color,\r
    opacity: clamp(opacity, 0, 1),\r
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
    const floatTargets = Boolean(gl.getExtension('EXT_color_buffer_float'));\r
    const sim = link(gl, SIM_FRAGMENT);\r
    const bounds = link(gl, BOUND_FRAGMENT);\r
    const render = link(gl, RENDER_FRAGMENT);\r
    if (!sim || !bounds || !render) return undefined;\r
\r
    const buffer = gl.createBuffer();\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const makeTarget = (width: number, height: number, filter: number): Target => {\r
      const texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      if (floatTargets) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.HALF_FLOAT, null);\r
      else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      const framebuffer = gl.createFramebuffer();\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      return { texture, framebuffer };\r
    };\r
    const dropTarget = (target: Target | null) => {\r
      if (!target) return;\r
      gl.deleteTexture(target.texture);\r
      gl.deleteFramebuffer(target.framebuffer);\r
    };\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const cache = new Map<string, number[]>();\r
    const parse = (value: string | undefined, fallback: number[]): number[] => {\r
      if (!value) return fallback;\r
      const key = String(value);\r
      const cached = cache.get(key);\r
      if (cached) return cached;\r
      let rgb = fallback;\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#000000';\r
        probe.fillStyle = key;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      cache.set(key, rgb);\r
      return rgb;\r
    };\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const tanHalf = Math.tan(FOV / 2);\r
    const view = { width: 1, height: 1, worldHeight: 10, scale: 0, tilt: -1, reach: 1 };\r
    const camera = { x: 0, y: 0, z: 1, forward: [0, 1, 0], upward: [0, 0, 1], far: 10, distance: 4 };\r
    const grid = { width: 0, height: 0, originX: 0, originY: 0, boundWidth: 0, boundHeight: 0 };\r
    let states: Target[] = [];\r
    let boundTarget: Target | null = null;\r
    let current = 0;\r
    let settle = true;\r
\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const cursor = { x: 0, y: 0, strength: 0 };\r
    const pulse = { x: 0, y: 0, age: 10 };\r
    let wander = 0;\r
    let presence = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let shape = shapeOf(settingsRef.current.sharpness);\r
    let shapeKey = settingsRef.current.sharpness;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const castRay = (x: number, y: number): [number, number, number] => {\r
      const aspect = view.width / view.height;\r
      const sx = x * aspect * tanHalf;\r
      const sy = y * tanHalf;\r
      const [fx, fy, fz] = camera.forward;\r
      const [, uy, uz] = camera.upward;\r
      const dx = fx + sx;\r
      const dy = fy + sy * uy;\r
      const dz = fz + sy * uz;\r
      const length = Math.hypot(dx, dy, dz) || 1;\r
      return [dx / length, dy / length, dz / length];\r
    };\r
\r
    const groundAt = (x: number, y: number): [number, number] => {\r
      const [dx, dy, dz] = castRay(x, y);\r
      const t = dz < -0.004 ? Math.min(-camera.z / dz, camera.far) : camera.far;\r
      return [camera.x + dx * t, camera.y + dy * t];\r
    };\r
\r
    const layout = () => {\r
      const s = settingsRef.current;\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      view.width = canvas.width;\r
      view.height = canvas.height;\r
      view.worldHeight = 22 / s.scale;\r
      view.scale = s.scale;\r
      view.tilt = s.tilt;\r
      const pitch = ((90 - s.tilt) * Math.PI) / 180;\r
      const distance = view.worldHeight / (2 * tanHalf);\r
      camera.forward = [0, Math.cos(pitch), -Math.sin(pitch)];\r
      camera.upward = [0, Math.sin(pitch), Math.cos(pitch)];\r
      camera.x = 0;\r
      camera.y = -distance * Math.cos(pitch);\r
      camera.z = distance * Math.sin(pitch);\r
      camera.far = distance * 2.5;\r
      camera.distance = distance;\r
      const corners = [groundAt(-1, -1), groundAt(1, -1), groundAt(-1, 1), groundAt(1, 1), groundAt(0, 1)];\r
      const xs = corners.map(c => c[0]);\r
      const ys = corners.map(c => c[1]);\r
      const minX = Math.min(...xs) - 3;\r
      const maxX = Math.max(...xs) + 3;\r
      const minY = Math.min(...ys) - 3;\r
      const maxY = Math.max(...ys) + 3;\r
      view.reach = Math.max(...corners.map(c => Math.hypot(c[0], c[1]))) + 4;\r
      const gridWidth = Math.ceil((maxX - minX) / CELL) + 2;\r
      const gridHeight = Math.ceil((maxY - minY) / CELL) + 2;\r
      grid.originX = minX;\r
      grid.originY = minY;\r
      if (gridWidth !== grid.width || gridHeight !== grid.height) {\r
        states.forEach(dropTarget);\r
        dropTarget(boundTarget);\r
        states = [makeTarget(gridWidth, gridHeight, gl.LINEAR), makeTarget(gridWidth, gridHeight, gl.LINEAR)];\r
        grid.width = gridWidth;\r
        grid.height = gridHeight;\r
        grid.boundWidth = Math.ceil((gridWidth * CELL) / BOUND_CELL);\r
        grid.boundHeight = Math.ceil((gridHeight * CELL) / BOUND_CELL);\r
        boundTarget = makeTarget(grid.boundWidth, grid.boundHeight, gl.NEAREST);\r
        current = 0;\r
      }\r
      settle = true;\r
    };\r
\r
    const toWorld = (clientX: number, clientY: number): [number, number] => {\r
      const rect = container.getBoundingClientRect();\r
      const x = ((clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;\r
      const y = 1 - ((clientY - rect.top) / Math.max(1, rect.height)) * 2;\r
      return groundAt(x, y);\r
    };\r
\r
    const step = (dt: number) => {\r
      const s = settingsRef.current;\r
      if (s.scale !== view.scale || s.tilt !== view.tilt) layout();\r
      const motion = s.paused ? 0 : 1;\r
      wander += dt * motion * (reduce ? 0 : s.speed);\r
      presence = s.intro && !reduce ? Math.min(1, presence + (dt * motion) / INTRO_SECONDS) : 1;\r
      pulse.age += dt * motion;\r
\r
      const engaged = s.mouseInteraction && pointer.inside;\r
      const follow = s.mouseDampening > 0 ? 1 - Math.exp(-dt / s.mouseDampening) : 1;\r
      if (engaged) {\r
        cursor.x += (pointer.x - cursor.x) * follow;\r
        cursor.y += (pointer.y - cursor.y) * follow;\r
      }\r
      const targetStrength = engaged ? s.mouseStrength * 1.4 : 0;\r
      cursor.strength += (targetStrength - cursor.strength) * (1 - Math.exp(-dt / 0.35));\r
      if (Math.abs(targetStrength - cursor.strength) < 0.001) cursor.strength = targetStrength;\r
    };\r
\r
    const draw = (dt: number) => {\r
      if (!boundTarget || states.length < 2) return;\r
      const s = settingsRef.current;\r
      const worldUnit = view.worldHeight;\r
      const radius = s.mouseRadius * worldUnit;\r
      const fullHeight = 1.2 * s.spikeHeight;\r
      if (s.sharpness !== shapeKey) {\r
        shapeKey = s.sharpness;\r
        shape = shapeOf(s.sharpness);\r
      }\r
      const reveal = presence * presence * (3 - 2 * presence);\r
      gl.bindVertexArray(vao);\r
      gl.activeTexture(gl.TEXTURE0);\r
\r
      const read = states[current];\r
      const write = states[1 - current];\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, write.framebuffer);\r
      gl.viewport(0, 0, grid.width, grid.height);\r
      gl.useProgram(sim.program);\r
      const su = sim.uniforms;\r
      gl.bindTexture(gl.TEXTURE_2D, read.texture);\r
      gl.uniform1i(su.uState, 0);\r
      gl.uniform2f(su.uGridOrigin, grid.originX, grid.originY);\r
      gl.uniform1f(su.uCell, CELL);\r
      gl.uniform1f(su.uDt, Math.max(dt, 0.001));\r
      gl.uniform1f(su.uTime, wander);\r
      gl.uniform2f(su.uFlow, s.flow[0], s.flow[1]);\r
      gl.uniform1f(su.uTurbulence, s.turbulence);\r
      gl.uniform1f(su.uMagnetism, s.magnetism);\r
      gl.uniform1f(su.uFieldScale, 5.5);\r
      gl.uniform2f(su.uSeed, s.variation * 17.31, s.variation * 9.73);\r
      gl.uniform4f(su.uCursor, cursor.x, cursor.y, cursor.strength, radius);\r
      gl.uniform4f(su.uPulse, pulse.x, pulse.y, pulse.age, pulse.age < 4 ? 1.1 : 0);\r
      gl.uniform1f(su.uPulseSpeed, worldUnit * 0.45);\r
      gl.uniform1f(su.uPulseWidth, 1.4);\r
      gl.uniform3f(su.uIntro, 0, 0, reveal * (view.reach + 3));\r
      gl.uniform1f(su.uSpikeHeight, fullHeight);\r
      gl.uniform1f(su.uMound, 0.6);\r
      gl.uniform1f(su.uStiffness, 150);\r
      gl.uniform1f(su.uDamping, 22 - s.fluidity * 15);\r
      gl.uniform1f(su.uSettle, settle || !floatTargets || reduce ? 1 : 0);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      settle = false;\r
      current = 1 - current;\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, boundTarget.framebuffer);\r
      gl.viewport(0, 0, grid.boundWidth, grid.boundHeight);\r
      gl.useProgram(bounds.program);\r
      const bu = bounds.uniforms;\r
      gl.bindTexture(gl.TEXTURE_2D, write.texture);\r
      gl.uniform1i(bu.uState, 0);\r
      gl.uniform2f(bu.uGridOrigin, grid.originX, grid.originY);\r
      gl.uniform1f(bu.uCell, CELL);\r
      gl.uniform2f(bu.uStateSize, grid.width, grid.height);\r
      gl.uniform1f(bu.uBoundCell, BOUND_CELL);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, view.width, view.height);\r
      gl.useProgram(render.program);\r
      const ru = render.uniforms;\r
      gl.bindTexture(gl.TEXTURE_2D, write.texture);\r
      gl.uniform1i(ru.uField, 0);\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.bindTexture(gl.TEXTURE_2D, boundTarget.texture);\r
      gl.uniform1i(ru.uBound, 1);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.uniform2f(ru.uGridOrigin, grid.originX, grid.originY);\r
      gl.uniform2f(ru.uGridSpan, grid.width * CELL, grid.height * CELL);\r
      gl.uniform2f(ru.uBoundSpan, grid.boundWidth * BOUND_CELL, grid.boundHeight * BOUND_CELL);\r
      gl.uniform1f(ru.uCellSize, CELL);\r
      gl.uniform2f(ru.uResolution, view.width, view.height);\r
      gl.uniform3f(ru.uCamera, camera.x, camera.y, camera.z);\r
      gl.uniform3fv(ru.uForward, camera.forward);\r
      gl.uniform3fv(ru.uUpward, camera.upward);\r
      gl.uniform1f(ru.uTanHalf, tanHalf);\r
      gl.uniform1f(ru.uPixelAngle, (2 * tanHalf) / view.height);\r
      gl.uniform1f(ru.uFar, camera.far);\r
      gl.uniform1f(ru.uFogStart, camera.distance * 0.95);\r
      gl.uniform1f(ru.uTop, fullHeight * 1.6 + 0.6 * 3 + 0.1);\r
      gl.uniform1f(ru.uBottom, -0.05);\r
      gl.uniform1f(ru.uTime, wander * 2);\r
      gl.uniform4f(ru.uCursor, cursor.x, cursor.y, cursor.strength, radius);\r
      gl.uniform1f(ru.uMound, 0.6);\r
      gl.uniform1f(ru.uRound, shape.round);\r
      gl.uniform1f(ru.uSpan, shape.span);\r
      gl.uniform1f(ru.uExponent, shape.exponent);\r
      gl.uniform1f(ru.uWarp, 0.06 * s.turbulence);\r
      const lights = s.colors.map(value => parse(value, [1, 1, 1]));\r
      const key = lights[0];\r
      const strip = lights[1] ?? key;\r
      const fill = lights[2] ?? strip;\r
      gl.uniform3fv(ru.uKey, key);\r
      gl.uniform3fv(ru.uStrip, strip);\r
      gl.uniform3fv(ru.uFill, fill);\r
      gl.uniform1f(ru.uExposure, 3 * s.brightness);\r
      gl.uniform1f(ru.uLight, s.lightMode ? 1 : 0);\r
      gl.uniform1f(ru.uOpaque, s.transparent ? 0 : 1);\r
      gl.uniform3fv(ru.uBase, parse(s.color, s.lightMode ? [1, 1, 1] : [0.0706, 0.0588, 0.0902]));\r
      gl.uniform1f(ru.uOpacity, s.opacity);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const dt = last ? clamp((now - last) / 1000, 0.0005, 0.05) : 1 / 60;\r
      last = now;\r
      step(dt);\r
      draw(dt);\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const resize = () => {\r
      layout();\r
      draw(0);\r
      wake();\r
    };\r
\r
    const locate = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      [pointer.x, pointer.y] = toWorld(event.clientX, event.clientY);\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const wasInside = pointer.inside;\r
      locate(event);\r
      if (pointer.inside && !wasInside && cursor.strength < 0.05) {\r
        cursor.x = pointer.x;\r
        cursor.y = pointer.y;\r
      }\r
      wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      onPointerMove(event);\r
      if (!pointer.inside || !settingsRef.current.clickPulse || reduce) return;\r
      pulse.x = pointer.x;\r
      pulse.y = pointer.y;\r
      pulse.age = 0;\r
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
      states.forEach(dropTarget);\r
      dropTarget(boundTarget);\r
      gl.deleteProgram(sim.program);\r
      gl.deleteProgram(bounds.program);\r
      gl.deleteProgram(render.program);\r
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
      style={mixBlendMode ? { ...style, mixBlendMode } : style}\r
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Ferrofluid;\r
`,i={usage:`import Ferrofluid from './Ferrofluid';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <Ferrofluid
    colors={['#ffffff', '#ffffff', '#ffffff']}
    spikeHeight={1}
    sharpness={2.5}
    tilt={48}
    magnets={2}
    mouseInteraction
    clickPulse
  />
</div>`,code:r,css:n,tailwind:e,tsCode:t,tsTailwind:o};export{i as ferrofluid};
