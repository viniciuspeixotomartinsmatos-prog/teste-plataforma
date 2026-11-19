const n=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
import './Lightning.css';\r
\r
const MAX_BOLTS = 4;\r
const MAX_STRIKES = 4;\r
const LEADER = 0.11;\r
const LIFE = 1.3;\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\r
\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
\r
uniform vec2 uResolution;\r
uniform float uPhase;\r
uniform vec3 uColor;\r
uniform float uIntensity;\r
uniform float uSize;\r
uniform float uThickness;\r
uniform float uGlow;\r
uniform float uFlicker;\r
uniform float uBranches;\r
uniform float uXOffset;\r
uniform float uAngle;\r
uniform float uSpread;\r
uniform int uBolts;\r
uniform vec4 uPointer;\r
uniform vec4 uStrikes[\${MAX_STRIKES}];\r
uniform vec4 uStrikeInfo[\${MAX_STRIKES}];\r
uniform float uFlash;\r
uniform float uIntro;\r
uniform float uLight;\r
uniform float uFade;\r
uniform float uOpacity;\r
\r
out vec4 outColor;\r
\r
const float TAU = 6.28318530718;\r
const float PERIOD = 8.0;\r
const float WARP = 2.1;\r
\r
vec2 hash22(vec2 p) {\r
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));\r
  p3 += dot(p3, p3.yzx + 33.33);\r
  return fract((p3.xx + p3.yz) * p3.zy) * 2.0 - 1.0;\r
}\r
\r
float hash11(float p) {\r
  p = fract(p * 0.1031);\r
  p *= p + 33.33;\r
  p *= p + p;\r
  return fract(p);\r
}\r
\r
float gnoise(vec2 p, float period) {\r
  vec2 i = floor(p);\r
  vec2 f = fract(p);\r
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);\r
  float a = dot(hash22(mod(i, period)), f);\r
  float b = dot(hash22(mod(i + vec2(1.0, 0.0), period)), f - vec2(1.0, 0.0));\r
  float c = dot(hash22(mod(i + vec2(0.0, 1.0), period)), f - vec2(0.0, 1.0));\r
  float d = dot(hash22(mod(i + vec2(1.0, 1.0), period)), f - vec2(1.0, 1.0));\r
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);\r
}\r
\r
float fbm(vec2 p, int octaves) {\r
  float value = 0.0;\r
  float amplitude = 0.5;\r
  float period = PERIOD;\r
  for (int i = 0; i < 8; i++) {\r
    if (i >= octaves) break;\r
    value += amplitude * gnoise(p, period);\r
    p = p * 2.0 + vec2(17.0, 31.0);\r
    period *= 2.0;\r
    amplitude *= 0.5;\r
  }\r
  return value;\r
}\r
\r
float warpField(vec2 q, float base, float reach, int octaves) {\r
  float value = 0.0;\r
  float amplitude = 0.5;\r
  float period = PERIOD;\r
  for (int i = 0; i < 8; i++) {\r
    if (i >= octaves) break;\r
    float weight = 1.0;\r
    if (i >= 3) {\r
      float estimate = abs(base + value * WARP);\r
      weight = 1.0 - smoothstep(reach * 0.6, reach, estimate);\r
      if (weight <= 0.0) break;\r
      reach *= 0.62;\r
    }\r
    value += amplitude * gnoise(q, period) * weight;\r
    q = q * 2.0 + vec2(17.0, 31.0);\r
    period *= 2.0;\r
    amplitude *= 0.5;\r
  }\r
  return value * WARP;\r
}\r
\r
float flicker(float seed) {\r
  float steady = 0.82 + 0.18 * sin(TAU * (uPhase * 13.0 + seed)) * sin(TAU * (uPhase * 7.0 + seed * 1.7));\r
  float burst = 0.0;\r
  for (int j = 0; j < 3; j++) {\r
    float at = hash11(seed * 17.0 + float(j) * 5.3);\r
    float since = fract(uPhase - at) * 10.0;\r
    burst += exp(-since * 7.0) * (0.75 + 0.45 * sin(since * 70.0));\r
  }\r
  return mix(1.0, steady + burst * 0.9, uFlicker);\r
}\r
\r
float glow(float d, float width) {\r
  float reach = d / (width * 3.5);\r
  return width / (d + width * 0.08) / (1.0 + reach * reach);\r
}\r
\r
vec2 gDrift;\r
float gWidth;\r
float gCore;\r
float gPixel;\r
\r
vec3 bolt(\r
  vec2 p,\r
  vec2 offset,\r
  float seed,\r
  float pinned,\r
  float front,\r
  float strength,\r
  float branches,\r
  float blink,\r
  float branchGain,\r
  vec2 range,\r
  float heat,\r
  int octaves\r
) {\r
  vec2 q = p * uSize + gDrift + offset;\r
  float pin = pinned > 0.5 ? fbm(gDrift + offset, octaves) * WARP : 0.0;\r
  float warp = warpField(q, p.x - pin, 1.3 * max(1.0, uGlow), octaves) - pin;\r
  float crackle = heat > 0.001 ? heat * 0.012 * gnoise(q * 9.0 + vec2(41.0, 7.0), PERIOD * 9.0) : 0.0;\r
  float x = p.x + warp + crackle;\r
  float d = length(vec2(x, max(front - p.y, 0.0)));\r
  float energy = glow(d, gWidth * (1.0 + heat * 0.6)) * strength;\r
  float core = (1.0 - smoothstep(gCore - gPixel, gCore + gPixel, d)) * min(strength, 1.6);\r
  float line = glow(d, gWidth * 0.55) * strength;\r
\r
  for (int k = 0; k < 6; k++) {\r
    float order = float(k) + 0.5;\r
    if (order > branches + heat * 2.0) break;\r
    float h = seed * 31.0 + float(k) * 13.7;\r
    float start = mix(range.x, range.y, hash11(h));\r
    float span = mix(0.22, 0.7, hash11(h + 3.0));\r
    if (pinned > 0.5) span = min(span, max(start - 0.04, 0.06));\r
    float along = (start - p.y) / span;\r
    if (along <= 0.0 || along >= 1.0) continue;\r
    float side = hash11(h + 1.0) > 0.5 ? 1.0 : -1.0;\r
    float slope = mix(0.35, 1.15, hash11(h + 2.0));\r
    float offset = x - side * slope * (start - p.y);\r
    if (abs(offset) - 0.12 * along > gWidth * 13.0) continue;\r
    float gain = branchGain;\r
    if (blink > 0.5) {\r
      float window = fract(uPhase * 3.0 + hash11(h + 4.0));\r
      float shown = smoothstep(0.0, 0.03, window) * (1.0 - smoothstep(0.3, 0.42, window));\r
      gain *= max(shown, heat * 0.8);\r
      if (gain <= 0.001) continue;\r
      gain *= flicker(seed + order);\r
    }\r
    if (gain <= 0.001) continue;\r
    vec2 jq = q * 3.0 + vec2(order * 11.0, order * 5.0);\r
    float jag = (gnoise(jq, PERIOD * 3.0) * 0.12 + gnoise(jq * 3.0 + vec2(5.0, 9.0), PERIOD * 9.0) * 0.035) * along;\r
    float bd = abs(offset - jag);\r
    float taper = pow(1.0 - along, 1.6) * smoothstep(0.0, 0.2, along) * smoothstep(front, front + 0.08, p.y);\r
    energy += glow(bd, gWidth * 0.4) * taper * gain;\r
    line += glow(bd, gWidth * 0.2) * taper * gain;\r
    core += (1.0 - smoothstep(gCore * 0.6 - gPixel, gCore * 0.6 + gPixel, bd)) * taper * min(gain, 1.0) * 0.8;\r
  }\r
  return vec3(energy, core, line);\r
}\r
\r
void main() {\r
  vec2 uv = (2.0 * gl_FragCoord.xy - uResolution) / uResolution.y;\r
  gPixel = 2.0 / uResolution.y;\r
  gDrift = vec2(PERIOD) * uPhase;\r
  gWidth = 0.07 * uGlow;\r
  gCore = 0.0032 * uThickness;\r
  float ca = cos(uAngle);\r
  float sa = sin(uAngle);\r
  mat2 turn = mat2(ca, -sa, sa, ca);\r
  vec2 local = turn * uv;\r
  vec2 pointer = turn * uPointer.xy;\r
  vec2 toPointer = uv - uPointer.xy;\r
  float heat = uPointer.z * exp(-dot(toPointer, toPointer) / 0.09);\r
  int octaves = uResolution.y > 1400.0 ? 8 : 7;\r
\r
  float energy = 0.0;\r
  float core = 0.0;\r
  float line = 0.0;\r
\r
  for (int b = 0; b < \${MAX_BOLTS}; b++) {\r
    if (b >= uBolts) break;\r
    float seed = float(b) * 7.13 + 0.37;\r
    float lane = uXOffset + (float(b) - 0.5 * float(uBolts - 1)) * uSpread;\r
    vec2 p = local - vec2(lane, 0.0);\r
    float near = exp(-pow(pointer.x - lane, 2.0) / 0.5);\r
    float lean = uPointer.z * uPointer.w * near * exp(-pow(p.y - pointer.y, 2.0) / 0.14);\r
    p.x -= lean * clamp(pointer.x - lane, -0.45, 0.45) * 0.55;\r
    float reveal = uIntro >= 1.0 ? 1.0 : smoothstep(0.0, 0.08, uv.y - (1.1 - 2.4 * uIntro));\r
    float strength = flicker(seed) * reveal * (1.0 + heat * 1.4) * (1.0 + uFlash);\r
    vec3 hit = bolt(\r
      p,\r
      vec2(float(b) * 3.0, float(b) * 5.0),\r
      seed,\r
      0.0,\r
      -1000.0,\r
      strength,\r
      uBranches * 6.0,\r
      1.0,\r
      reveal,\r
      vec2(-0.75, 0.9),\r
      heat,\r
      octaves\r
    );\r
    energy += hit.x;\r
    core += hit.y;\r
    line += hit.z;\r
  }\r
\r
  for (int j = 0; j < \${MAX_STRIKES}; j++) {\r
    vec4 strike = uStrikes[j];\r
    if (strike.w <= 0.001) continue;\r
    vec4 info = uStrikeInfo[j];\r
    vec2 p = local - turn * strike.xy;\r
    if (p.y < strike.z - 1.6) continue;\r
    vec3 hit = bolt(\r
      p,\r
      vec2(info.x * 0.731, info.x * 1.377),\r
      info.x,\r
      1.0,\r
      strike.z,\r
      strike.w,\r
      uBranches * 6.0,\r
      0.0,\r
      strike.w,\r
      vec2(0.12, info.y),\r
      heat,\r
      octaves\r
    );\r
    energy += hit.x + info.z * strike.w * glow(length(p), gWidth * 0.5) * 0.12;\r
    core += hit.y;\r
    line += hit.z;\r
  }\r
\r
  float e = energy * uIntensity * 0.6;\r
  float hot = clamp(core + smoothstep(6.0, 20.0, e) * 0.55, 0.0, 1.0);\r
  vec2 edge = min(gl_FragCoord.xy, uResolution - gl_FragCoord.xy) / (uResolution.y * max(uFade, 0.0001) * 0.5);\r
  float fade = uFade > 0.0 ? smoothstep(0.0, 1.0, edge.x) * smoothstep(0.0, 1.0, edge.y) : 1.0;\r
\r
  vec3 rgb;\r
  float alpha;\r
  if (uLight > 0.5) {\r
    float stroke = smoothstep(1.0, 3.6, line * uIntensity);\r
    float halo = 1.0 - exp(-e * 0.35);\r
    vec3 ink = uColor * 0.82;\r
    alpha = clamp(stroke + halo * 0.15, 0.0, 1.0);\r
    rgb = mix(ink, vec3(1.0), hot * 0.85) * alpha;\r
  } else {\r
    vec3 lit = 1.0 - exp(-uColor * e * 0.9);\r
    rgb = mix(lit, vec3(1.0), hot);\r
    alpha = clamp(max(rgb.r, max(rgb.g, rgb.b)), 0.0, 1.0);\r
  }\r
  float keep = fade * uOpacity;\r
  outColor = vec4(rgb * keep, alpha * keep);\r
}\r
\`;\r
\r
const toRgb = color => {\r
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(color).trim());\r
  if (!match) return [0.5, 0.6, 1];\r
  const hex = match[1].length === 3 ? match[1].replace(/./g, digit => digit + digit) : match[1];\r
  return [0, 2, 4].map(index => parseInt(hex.slice(index, index + 2), 16) / 255);\r
};\r
\r
const smootherstep = t => {\r
  const x = Math.min(1, Math.max(0, t));\r
  return x * x * x * (x * (x * 6 - 15) + 10);\r
};\r
\r
const compile = (gl, type, source) => {\r
  const shader = gl.createShader(type);\r
  gl.shaderSource(shader, source);\r
  gl.compileShader(shader);\r
  return shader;\r
};\r
\r
const UNIFORMS = [\r
  'uResolution',\r
  'uPhase',\r
  'uColor',\r
  'uIntensity',\r
  'uSize',\r
  'uThickness',\r
  'uGlow',\r
  'uFlicker',\r
  'uBranches',\r
  'uXOffset',\r
  'uAngle',\r
  'uSpread',\r
  'uBolts',\r
  'uPointer',\r
  'uStrikes',\r
  'uStrikeInfo',\r
  'uFlash',\r
  'uIntro',\r
  'uLight',\r
  'uFade',\r
  'uOpacity'\r
];\r
\r
const Lightning = ({\r
  color = '#4d6bff',\r
  bolts = 1,\r
  spread = 0.6,\r
  branches = 0.5,\r
  xOffset = 0,\r
  angle = 0,\r
  size = 1,\r
  thickness = 1,\r
  glow = 1,\r
  intensity = 1,\r
  speed = 1,\r
  flicker = 0.6,\r
  mouseInteraction = true,\r
  mouseStrength = 1,\r
  clickStrike = true,\r
  intro = true,\r
  fade = 0,\r
  opacity = 1,\r
  lightMode = false,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  style\r
}) => {\r
  const canvasRef = useRef(null);\r
  const engineRef = useRef(null);\r
  const settings = {\r
    color,\r
    bolts,\r
    spread,\r
    branches,\r
    xOffset,\r
    angle,\r
    size,\r
    thickness,\r
    glow,\r
    intensity,\r
    speed,\r
    flicker,\r
    mouseInteraction,\r
    mouseStrength,\r
    clickStrike,\r
    intro,\r
    fade,\r
    opacity,\r
    lightMode,\r
    paused,\r
    dpr\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const canvas = canvasRef.current;\r
    if (!canvas) return;\r
    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });\r
    if (!gl) return;\r
\r
    const program = gl.createProgram();\r
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));\r
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));\r
    gl.linkProgram(program);\r
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;\r
    const uniforms = Object.fromEntries(UNIFORMS.map(name => [name, gl.getUniformLocation(program, name)]));\r
    const buffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
    const position = gl.getAttribLocation(program, 'aPosition');\r
\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
    const view = { width: 1, height: 1, left: 0, top: 0 };\r
    const pointer = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, presence: 0, inside: false };\r
    const strikes = Array.from({ length: MAX_STRIKES }, () => ({ x: 0, y: 0, born: -1, seed: 0, reach: 2 }));\r
    const strikeData = new Float32Array(MAX_STRIKES * 4);\r
    const infoData = new Float32Array(MAX_STRIKES * 4);\r
    let next = 0;\r
    let phase = 0.21;\r
    let introStart = settingsRef.current.intro && !reduced ? -1 : null;\r
    let visible = true;\r
    let raf = 0;\r
    let last = 0;\r
    let disposed = false;\r
\r
    const resize = () => {\r
      const rect = canvas.getBoundingClientRect();\r
      const ratio = Math.min(settingsRef.current.dpr ?? window.devicePixelRatio ?? 1, 2);\r
      view.width = Math.max(1, rect.width);\r
      view.height = Math.max(1, rect.height);\r
      view.left = rect.left;\r
      view.top = rect.top;\r
      const width = Math.max(1, Math.round(view.width * ratio));\r
      const height = Math.max(1, Math.round(view.height * ratio));\r
      if (canvas.width !== width || canvas.height !== height) {\r
        canvas.width = width;\r
        canvas.height = height;\r
      }\r
    };\r
\r
    const toUv = (x, y) => [(2 * x - view.width) / view.height, (view.height - 2 * y) / view.height];\r
\r
    const draw = now => {\r
      const s = settingsRef.current;\r
      const rgb = toRgb(s.color);\r
      let flash = 0;\r
      for (let j = 0; j < MAX_STRIKES; j++) {\r
        const strike = strikes[j];\r
        const age = strike.born < 0 ? -1 : (now - strike.born) / 1000;\r
        const base = j * 4;\r
        if (age < 0 || age > LIFE) {\r
          strikeData.fill(0, base, base + 4);\r
          infoData.fill(0, base, base + 4);\r
          continue;\r
        }\r
        const progress = Math.min(1, age / LEADER);\r
        const since = age - LEADER;\r
        let env = 0.45 + 0.35 * progress;\r
        if (since >= 0) {\r
          env = 1.8 * Math.exp(-since * 5.5) * (0.85 + 0.2 * Math.sin(since * 70));\r
          if (since > 0.17) env += Math.exp(-(since - 0.17) * 9);\r
          if (since > 0.33) env += 0.7 * Math.exp(-(since - 0.33) * 10);\r
          flash += 0.5 * Math.exp(-since * 9);\r
          if (since > 0.17) flash += 0.25 * Math.exp(-(since - 0.17) * 12);\r
        }\r
        env *= 1 - smootherstep((age - (LIFE - 0.4)) / 0.4);\r
        strikeData[base] = strike.x;\r
        strikeData[base + 1] = strike.y;\r
        strikeData[base + 2] = strike.reach * (1 - progress ** 1.6);\r
        strikeData[base + 3] = env;\r
        infoData[base] = strike.seed;\r
        infoData[base + 1] = strike.reach;\r
        infoData[base + 2] = since >= 0 ? 1 : 0;\r
        infoData[base + 3] = 0;\r
      }\r
      const introAmount = introStart === null ? 1 : introStart < 0 ? 0 : Math.min(1, (now - introStart) / 420);\r
      const [px, py] = toUv(pointer.x, pointer.y);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.useProgram(program);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
      gl.enableVertexAttribArray(position);\r
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);\r
      gl.uniform2f(uniforms.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(uniforms.uPhase, phase);\r
      gl.uniform3f(uniforms.uColor, rgb[0], rgb[1], rgb[2]);\r
      gl.uniform1f(uniforms.uIntensity, Math.max(0, s.intensity));\r
      gl.uniform1f(uniforms.uSize, Math.max(0.05, s.size));\r
      gl.uniform1f(uniforms.uThickness, Math.max(0, s.thickness));\r
      gl.uniform1f(uniforms.uGlow, Math.max(0.01, s.glow));\r
      gl.uniform1f(uniforms.uFlicker, reduced ? 0 : Math.min(1, Math.max(0, s.flicker)));\r
      gl.uniform1f(uniforms.uBranches, Math.min(1, Math.max(0, s.branches)));\r
      gl.uniform1f(uniforms.uXOffset, s.xOffset);\r
      gl.uniform1f(uniforms.uAngle, (s.angle * Math.PI) / 180);\r
      gl.uniform1f(uniforms.uSpread, s.spread);\r
      gl.uniform1i(uniforms.uBolts, Math.min(MAX_BOLTS, Math.max(1, Math.round(s.bolts))));\r
      gl.uniform4f(uniforms.uPointer, px, py, pointer.presence, Math.max(0, s.mouseStrength));\r
      gl.uniform4fv(uniforms.uStrikes, strikeData);\r
      gl.uniform4fv(uniforms.uStrikeInfo, infoData);\r
      gl.uniform1f(uniforms.uFlash, Math.min(1, flash));\r
      gl.uniform1f(uniforms.uIntro, introAmount);\r
      gl.uniform1f(uniforms.uLight, s.lightMode ? 1 : 0);\r
      gl.uniform1f(uniforms.uFade, Math.min(1, Math.max(0, s.fade)));\r
      gl.uniform1f(uniforms.uOpacity, Math.min(1, Math.max(0, s.opacity)));\r
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (disposed || !visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = Math.min(0.05, (now - last) / 1000 || 0);\r
      last = now;\r
      if (introStart !== null && introStart < 0) introStart = now;\r
      if (!s.paused && !reduced) phase = (phase + (dt * Math.max(0, s.speed)) / 10) % 1;\r
      const steps = Math.max(1, Math.ceil(dt / (1 / 120)));\r
      const h = dt / steps;\r
      for (let n = 0; n < steps; n++) {\r
        pointer.vx += (120 * (pointer.tx - pointer.x) - 19 * pointer.vx) * h;\r
        pointer.vy += (120 * (pointer.ty - pointer.y) - 19 * pointer.vy) * h;\r
        pointer.x += pointer.vx * h;\r
        pointer.y += pointer.vy * h;\r
      }\r
      const goal = s.mouseInteraction && pointer.inside && !reduced ? 1 : 0;\r
      pointer.presence += (goal - pointer.presence) * (1 - Math.exp(-dt / (goal > pointer.presence ? 0.3 : 0.55)));\r
      draw(now);\r
      const striking = strikes.some(strike => strike.born >= 0 && now - strike.born < LIFE * 1000 + 50);\r
      const introducing = introStart !== null && now - introStart < 450;\r
      const moving = !s.paused && !reduced && s.speed > 0;\r
      const settling = Math.abs(goal - pointer.presence) > 0.002 || Math.abs(pointer.vx) + Math.abs(pointer.vy) > 0.5;\r
      if (moving || striking || introducing || settling) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (raf || disposed || !visible || document.hidden) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const locate = event => {\r
      const rect = canvas.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      return [x, y, x >= 0 && y >= 0 && x <= rect.width && y <= rect.height];\r
    };\r
\r
    const onMove = event => {\r
      const [x, y, inside] = locate(event);\r
      if (inside && !pointer.inside && pointer.presence < 0.02) {\r
        pointer.x = x;\r
        pointer.y = y;\r
        pointer.vx = pointer.vy = 0;\r
      }\r
      pointer.tx = x;\r
      pointer.ty = y;\r
      pointer.inside = inside;\r
      if (settingsRef.current.mouseInteraction) wake();\r
    };\r
\r
    const onLeave = event => {\r
      if (event.relatedTarget) return;\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
    const onDown = event => {\r
      if (!settingsRef.current.clickStrike || reduced) return;\r
      const [x, y, inside] = locate(event);\r
      if (!inside) return;\r
      const [ux, uy] = toUv(x, y);\r
      const radians = (settingsRef.current.angle * Math.PI) / 180;\r
      const sa = Math.sin(radians);\r
      const ca = Math.cos(radians);\r
      const top = (view.width / view.height) * Math.abs(sa) + Math.abs(ca);\r
      const strike = strikes[next];\r
      next = (next + 1) % MAX_STRIKES;\r
      strike.x = ux;\r
      strike.y = uy;\r
      strike.reach = top - (-sa * ux + ca * uy) + 0.2;\r
      strike.born = performance.now();\r
      strike.seed = Math.random() * 100;\r
      wake();\r
    };\r
\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    window.addEventListener('pointerdown', onDown, { passive: true });\r
    window.addEventListener('pointerout', onLeave);\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      resize();\r
      draw(performance.now());\r
      wake();\r
    });\r
    resizeObserver.observe(canvas);\r
\r
    const visibilityObserver = new IntersectionObserver(([entry]) => {\r
      visible = entry.isIntersecting;\r
      if (visible) wake();\r
    });\r
    visibilityObserver.observe(canvas);\r
\r
    const onVisibility = () => {\r
      if (!document.hidden) wake();\r
    };\r
    document.addEventListener('visibilitychange', onVisibility);\r
\r
    resize();\r
    draw(performance.now());\r
    wake();\r
\r
    engineRef.current = {\r
      refresh: () => {\r
        resize();\r
        draw(performance.now());\r
        wake();\r
      }\r
    };\r
\r
    return () => {\r
      disposed = true;\r
      cancelAnimationFrame(raf);\r
      resizeObserver.disconnect();\r
      visibilityObserver.disconnect();\r
      window.removeEventListener('pointermove', onMove);\r
      window.removeEventListener('pointerdown', onDown);\r
      window.removeEventListener('pointerout', onLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteProgram(program);\r
      engineRef.current = null;\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    engineRef.current?.refresh();\r
  }, [\r
    color,\r
    bolts,\r
    spread,\r
    branches,\r
    xOffset,\r
    angle,\r
    size,\r
    thickness,\r
    glow,\r
    intensity,\r
    speed,\r
    flicker,\r
    fade,\r
    opacity,\r
    lightMode,\r
    paused,\r
    dpr\r
  ]);\r
\r
  return <canvas ref={canvasRef} className={\`lightning-container \${className}\`.trim()} style={style} />;\r
};\r
\r
export default Lightning;\r
`,r=`.lightning-container {\r
  position: relative;\r
  display: block;\r
  width: 100%;\r
  height: 100%;\r
}\r
`,e=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
const MAX_BOLTS = 4;\r
const MAX_STRIKES = 4;\r
const LEADER = 0.11;\r
const LIFE = 1.3;\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\r
\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
\r
uniform vec2 uResolution;\r
uniform float uPhase;\r
uniform vec3 uColor;\r
uniform float uIntensity;\r
uniform float uSize;\r
uniform float uThickness;\r
uniform float uGlow;\r
uniform float uFlicker;\r
uniform float uBranches;\r
uniform float uXOffset;\r
uniform float uAngle;\r
uniform float uSpread;\r
uniform int uBolts;\r
uniform vec4 uPointer;\r
uniform vec4 uStrikes[\${MAX_STRIKES}];\r
uniform vec4 uStrikeInfo[\${MAX_STRIKES}];\r
uniform float uFlash;\r
uniform float uIntro;\r
uniform float uLight;\r
uniform float uFade;\r
uniform float uOpacity;\r
\r
out vec4 outColor;\r
\r
const float TAU = 6.28318530718;\r
const float PERIOD = 8.0;\r
const float WARP = 2.1;\r
\r
vec2 hash22(vec2 p) {\r
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));\r
  p3 += dot(p3, p3.yzx + 33.33);\r
  return fract((p3.xx + p3.yz) * p3.zy) * 2.0 - 1.0;\r
}\r
\r
float hash11(float p) {\r
  p = fract(p * 0.1031);\r
  p *= p + 33.33;\r
  p *= p + p;\r
  return fract(p);\r
}\r
\r
float gnoise(vec2 p, float period) {\r
  vec2 i = floor(p);\r
  vec2 f = fract(p);\r
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);\r
  float a = dot(hash22(mod(i, period)), f);\r
  float b = dot(hash22(mod(i + vec2(1.0, 0.0), period)), f - vec2(1.0, 0.0));\r
  float c = dot(hash22(mod(i + vec2(0.0, 1.0), period)), f - vec2(0.0, 1.0));\r
  float d = dot(hash22(mod(i + vec2(1.0, 1.0), period)), f - vec2(1.0, 1.0));\r
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);\r
}\r
\r
float fbm(vec2 p, int octaves) {\r
  float value = 0.0;\r
  float amplitude = 0.5;\r
  float period = PERIOD;\r
  for (int i = 0; i < 8; i++) {\r
    if (i >= octaves) break;\r
    value += amplitude * gnoise(p, period);\r
    p = p * 2.0 + vec2(17.0, 31.0);\r
    period *= 2.0;\r
    amplitude *= 0.5;\r
  }\r
  return value;\r
}\r
\r
float warpField(vec2 q, float base, float reach, int octaves) {\r
  float value = 0.0;\r
  float amplitude = 0.5;\r
  float period = PERIOD;\r
  for (int i = 0; i < 8; i++) {\r
    if (i >= octaves) break;\r
    float weight = 1.0;\r
    if (i >= 3) {\r
      float estimate = abs(base + value * WARP);\r
      weight = 1.0 - smoothstep(reach * 0.6, reach, estimate);\r
      if (weight <= 0.0) break;\r
      reach *= 0.62;\r
    }\r
    value += amplitude * gnoise(q, period) * weight;\r
    q = q * 2.0 + vec2(17.0, 31.0);\r
    period *= 2.0;\r
    amplitude *= 0.5;\r
  }\r
  return value * WARP;\r
}\r
\r
float flicker(float seed) {\r
  float steady = 0.82 + 0.18 * sin(TAU * (uPhase * 13.0 + seed)) * sin(TAU * (uPhase * 7.0 + seed * 1.7));\r
  float burst = 0.0;\r
  for (int j = 0; j < 3; j++) {\r
    float at = hash11(seed * 17.0 + float(j) * 5.3);\r
    float since = fract(uPhase - at) * 10.0;\r
    burst += exp(-since * 7.0) * (0.75 + 0.45 * sin(since * 70.0));\r
  }\r
  return mix(1.0, steady + burst * 0.9, uFlicker);\r
}\r
\r
float glow(float d, float width) {\r
  float reach = d / (width * 3.5);\r
  return width / (d + width * 0.08) / (1.0 + reach * reach);\r
}\r
\r
vec2 gDrift;\r
float gWidth;\r
float gCore;\r
float gPixel;\r
\r
vec3 bolt(\r
  vec2 p,\r
  vec2 offset,\r
  float seed,\r
  float pinned,\r
  float front,\r
  float strength,\r
  float branches,\r
  float blink,\r
  float branchGain,\r
  vec2 range,\r
  float heat,\r
  int octaves\r
) {\r
  vec2 q = p * uSize + gDrift + offset;\r
  float pin = pinned > 0.5 ? fbm(gDrift + offset, octaves) * WARP : 0.0;\r
  float warp = warpField(q, p.x - pin, 1.3 * max(1.0, uGlow), octaves) - pin;\r
  float crackle = heat > 0.001 ? heat * 0.012 * gnoise(q * 9.0 + vec2(41.0, 7.0), PERIOD * 9.0) : 0.0;\r
  float x = p.x + warp + crackle;\r
  float d = length(vec2(x, max(front - p.y, 0.0)));\r
  float energy = glow(d, gWidth * (1.0 + heat * 0.6)) * strength;\r
  float core = (1.0 - smoothstep(gCore - gPixel, gCore + gPixel, d)) * min(strength, 1.6);\r
  float line = glow(d, gWidth * 0.55) * strength;\r
\r
  for (int k = 0; k < 6; k++) {\r
    float order = float(k) + 0.5;\r
    if (order > branches + heat * 2.0) break;\r
    float h = seed * 31.0 + float(k) * 13.7;\r
    float start = mix(range.x, range.y, hash11(h));\r
    float span = mix(0.22, 0.7, hash11(h + 3.0));\r
    if (pinned > 0.5) span = min(span, max(start - 0.04, 0.06));\r
    float along = (start - p.y) / span;\r
    if (along <= 0.0 || along >= 1.0) continue;\r
    float side = hash11(h + 1.0) > 0.5 ? 1.0 : -1.0;\r
    float slope = mix(0.35, 1.15, hash11(h + 2.0));\r
    float offset = x - side * slope * (start - p.y);\r
    if (abs(offset) - 0.12 * along > gWidth * 13.0) continue;\r
    float gain = branchGain;\r
    if (blink > 0.5) {\r
      float window = fract(uPhase * 3.0 + hash11(h + 4.0));\r
      float shown = smoothstep(0.0, 0.03, window) * (1.0 - smoothstep(0.3, 0.42, window));\r
      gain *= max(shown, heat * 0.8);\r
      if (gain <= 0.001) continue;\r
      gain *= flicker(seed + order);\r
    }\r
    if (gain <= 0.001) continue;\r
    vec2 jq = q * 3.0 + vec2(order * 11.0, order * 5.0);\r
    float jag = (gnoise(jq, PERIOD * 3.0) * 0.12 + gnoise(jq * 3.0 + vec2(5.0, 9.0), PERIOD * 9.0) * 0.035) * along;\r
    float bd = abs(offset - jag);\r
    float taper = pow(1.0 - along, 1.6) * smoothstep(0.0, 0.2, along) * smoothstep(front, front + 0.08, p.y);\r
    energy += glow(bd, gWidth * 0.4) * taper * gain;\r
    line += glow(bd, gWidth * 0.2) * taper * gain;\r
    core += (1.0 - smoothstep(gCore * 0.6 - gPixel, gCore * 0.6 + gPixel, bd)) * taper * min(gain, 1.0) * 0.8;\r
  }\r
  return vec3(energy, core, line);\r
}\r
\r
void main() {\r
  vec2 uv = (2.0 * gl_FragCoord.xy - uResolution) / uResolution.y;\r
  gPixel = 2.0 / uResolution.y;\r
  gDrift = vec2(PERIOD) * uPhase;\r
  gWidth = 0.07 * uGlow;\r
  gCore = 0.0032 * uThickness;\r
  float ca = cos(uAngle);\r
  float sa = sin(uAngle);\r
  mat2 turn = mat2(ca, -sa, sa, ca);\r
  vec2 local = turn * uv;\r
  vec2 pointer = turn * uPointer.xy;\r
  vec2 toPointer = uv - uPointer.xy;\r
  float heat = uPointer.z * exp(-dot(toPointer, toPointer) / 0.09);\r
  int octaves = uResolution.y > 1400.0 ? 8 : 7;\r
\r
  float energy = 0.0;\r
  float core = 0.0;\r
  float line = 0.0;\r
\r
  for (int b = 0; b < \${MAX_BOLTS}; b++) {\r
    if (b >= uBolts) break;\r
    float seed = float(b) * 7.13 + 0.37;\r
    float lane = uXOffset + (float(b) - 0.5 * float(uBolts - 1)) * uSpread;\r
    vec2 p = local - vec2(lane, 0.0);\r
    float near = exp(-pow(pointer.x - lane, 2.0) / 0.5);\r
    float lean = uPointer.z * uPointer.w * near * exp(-pow(p.y - pointer.y, 2.0) / 0.14);\r
    p.x -= lean * clamp(pointer.x - lane, -0.45, 0.45) * 0.55;\r
    float reveal = uIntro >= 1.0 ? 1.0 : smoothstep(0.0, 0.08, uv.y - (1.1 - 2.4 * uIntro));\r
    float strength = flicker(seed) * reveal * (1.0 + heat * 1.4) * (1.0 + uFlash);\r
    vec3 hit = bolt(\r
      p,\r
      vec2(float(b) * 3.0, float(b) * 5.0),\r
      seed,\r
      0.0,\r
      -1000.0,\r
      strength,\r
      uBranches * 6.0,\r
      1.0,\r
      reveal,\r
      vec2(-0.75, 0.9),\r
      heat,\r
      octaves\r
    );\r
    energy += hit.x;\r
    core += hit.y;\r
    line += hit.z;\r
  }\r
\r
  for (int j = 0; j < \${MAX_STRIKES}; j++) {\r
    vec4 strike = uStrikes[j];\r
    if (strike.w <= 0.001) continue;\r
    vec4 info = uStrikeInfo[j];\r
    vec2 p = local - turn * strike.xy;\r
    if (p.y < strike.z - 1.6) continue;\r
    vec3 hit = bolt(\r
      p,\r
      vec2(info.x * 0.731, info.x * 1.377),\r
      info.x,\r
      1.0,\r
      strike.z,\r
      strike.w,\r
      uBranches * 6.0,\r
      0.0,\r
      strike.w,\r
      vec2(0.12, info.y),\r
      heat,\r
      octaves\r
    );\r
    energy += hit.x + info.z * strike.w * glow(length(p), gWidth * 0.5) * 0.12;\r
    core += hit.y;\r
    line += hit.z;\r
  }\r
\r
  float e = energy * uIntensity * 0.6;\r
  float hot = clamp(core + smoothstep(6.0, 20.0, e) * 0.55, 0.0, 1.0);\r
  vec2 edge = min(gl_FragCoord.xy, uResolution - gl_FragCoord.xy) / (uResolution.y * max(uFade, 0.0001) * 0.5);\r
  float fade = uFade > 0.0 ? smoothstep(0.0, 1.0, edge.x) * smoothstep(0.0, 1.0, edge.y) : 1.0;\r
\r
  vec3 rgb;\r
  float alpha;\r
  if (uLight > 0.5) {\r
    float stroke = smoothstep(1.0, 3.6, line * uIntensity);\r
    float halo = 1.0 - exp(-e * 0.35);\r
    vec3 ink = uColor * 0.82;\r
    alpha = clamp(stroke + halo * 0.15, 0.0, 1.0);\r
    rgb = mix(ink, vec3(1.0), hot * 0.85) * alpha;\r
  } else {\r
    vec3 lit = 1.0 - exp(-uColor * e * 0.9);\r
    rgb = mix(lit, vec3(1.0), hot);\r
    alpha = clamp(max(rgb.r, max(rgb.g, rgb.b)), 0.0, 1.0);\r
  }\r
  float keep = fade * uOpacity;\r
  outColor = vec4(rgb * keep, alpha * keep);\r
}\r
\`;\r
\r
const toRgb = color => {\r
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(color).trim());\r
  if (!match) return [0.5, 0.6, 1];\r
  const hex = match[1].length === 3 ? match[1].replace(/./g, digit => digit + digit) : match[1];\r
  return [0, 2, 4].map(index => parseInt(hex.slice(index, index + 2), 16) / 255);\r
};\r
\r
const smootherstep = t => {\r
  const x = Math.min(1, Math.max(0, t));\r
  return x * x * x * (x * (x * 6 - 15) + 10);\r
};\r
\r
const compile = (gl, type, source) => {\r
  const shader = gl.createShader(type);\r
  gl.shaderSource(shader, source);\r
  gl.compileShader(shader);\r
  return shader;\r
};\r
\r
const UNIFORMS = [\r
  'uResolution',\r
  'uPhase',\r
  'uColor',\r
  'uIntensity',\r
  'uSize',\r
  'uThickness',\r
  'uGlow',\r
  'uFlicker',\r
  'uBranches',\r
  'uXOffset',\r
  'uAngle',\r
  'uSpread',\r
  'uBolts',\r
  'uPointer',\r
  'uStrikes',\r
  'uStrikeInfo',\r
  'uFlash',\r
  'uIntro',\r
  'uLight',\r
  'uFade',\r
  'uOpacity'\r
];\r
\r
const Lightning = ({\r
  color = '#4d6bff',\r
  bolts = 1,\r
  spread = 0.6,\r
  branches = 0.5,\r
  xOffset = 0,\r
  angle = 0,\r
  size = 1,\r
  thickness = 1,\r
  glow = 1,\r
  intensity = 1,\r
  speed = 1,\r
  flicker = 0.6,\r
  mouseInteraction = true,\r
  mouseStrength = 1,\r
  clickStrike = true,\r
  intro = true,\r
  fade = 0,\r
  opacity = 1,\r
  lightMode = false,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  style\r
}) => {\r
  const canvasRef = useRef(null);\r
  const engineRef = useRef(null);\r
  const settings = {\r
    color,\r
    bolts,\r
    spread,\r
    branches,\r
    xOffset,\r
    angle,\r
    size,\r
    thickness,\r
    glow,\r
    intensity,\r
    speed,\r
    flicker,\r
    mouseInteraction,\r
    mouseStrength,\r
    clickStrike,\r
    intro,\r
    fade,\r
    opacity,\r
    lightMode,\r
    paused,\r
    dpr\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const canvas = canvasRef.current;\r
    if (!canvas) return;\r
    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });\r
    if (!gl) return;\r
\r
    const program = gl.createProgram();\r
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));\r
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));\r
    gl.linkProgram(program);\r
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;\r
    const uniforms = Object.fromEntries(UNIFORMS.map(name => [name, gl.getUniformLocation(program, name)]));\r
    const buffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
    const position = gl.getAttribLocation(program, 'aPosition');\r
\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
    const view = { width: 1, height: 1, left: 0, top: 0 };\r
    const pointer = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, presence: 0, inside: false };\r
    const strikes = Array.from({ length: MAX_STRIKES }, () => ({ x: 0, y: 0, born: -1, seed: 0, reach: 2 }));\r
    const strikeData = new Float32Array(MAX_STRIKES * 4);\r
    const infoData = new Float32Array(MAX_STRIKES * 4);\r
    let next = 0;\r
    let phase = 0.21;\r
    let introStart = settingsRef.current.intro && !reduced ? -1 : null;\r
    let visible = true;\r
    let raf = 0;\r
    let last = 0;\r
    let disposed = false;\r
\r
    const resize = () => {\r
      const rect = canvas.getBoundingClientRect();\r
      const ratio = Math.min(settingsRef.current.dpr ?? window.devicePixelRatio ?? 1, 2);\r
      view.width = Math.max(1, rect.width);\r
      view.height = Math.max(1, rect.height);\r
      view.left = rect.left;\r
      view.top = rect.top;\r
      const width = Math.max(1, Math.round(view.width * ratio));\r
      const height = Math.max(1, Math.round(view.height * ratio));\r
      if (canvas.width !== width || canvas.height !== height) {\r
        canvas.width = width;\r
        canvas.height = height;\r
      }\r
    };\r
\r
    const toUv = (x, y) => [(2 * x - view.width) / view.height, (view.height - 2 * y) / view.height];\r
\r
    const draw = now => {\r
      const s = settingsRef.current;\r
      const rgb = toRgb(s.color);\r
      let flash = 0;\r
      for (let j = 0; j < MAX_STRIKES; j++) {\r
        const strike = strikes[j];\r
        const age = strike.born < 0 ? -1 : (now - strike.born) / 1000;\r
        const base = j * 4;\r
        if (age < 0 || age > LIFE) {\r
          strikeData.fill(0, base, base + 4);\r
          infoData.fill(0, base, base + 4);\r
          continue;\r
        }\r
        const progress = Math.min(1, age / LEADER);\r
        const since = age - LEADER;\r
        let env = 0.45 + 0.35 * progress;\r
        if (since >= 0) {\r
          env = 1.8 * Math.exp(-since * 5.5) * (0.85 + 0.2 * Math.sin(since * 70));\r
          if (since > 0.17) env += Math.exp(-(since - 0.17) * 9);\r
          if (since > 0.33) env += 0.7 * Math.exp(-(since - 0.33) * 10);\r
          flash += 0.5 * Math.exp(-since * 9);\r
          if (since > 0.17) flash += 0.25 * Math.exp(-(since - 0.17) * 12);\r
        }\r
        env *= 1 - smootherstep((age - (LIFE - 0.4)) / 0.4);\r
        strikeData[base] = strike.x;\r
        strikeData[base + 1] = strike.y;\r
        strikeData[base + 2] = strike.reach * (1 - progress ** 1.6);\r
        strikeData[base + 3] = env;\r
        infoData[base] = strike.seed;\r
        infoData[base + 1] = strike.reach;\r
        infoData[base + 2] = since >= 0 ? 1 : 0;\r
        infoData[base + 3] = 0;\r
      }\r
      const introAmount = introStart === null ? 1 : introStart < 0 ? 0 : Math.min(1, (now - introStart) / 420);\r
      const [px, py] = toUv(pointer.x, pointer.y);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.useProgram(program);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
      gl.enableVertexAttribArray(position);\r
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);\r
      gl.uniform2f(uniforms.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(uniforms.uPhase, phase);\r
      gl.uniform3f(uniforms.uColor, rgb[0], rgb[1], rgb[2]);\r
      gl.uniform1f(uniforms.uIntensity, Math.max(0, s.intensity));\r
      gl.uniform1f(uniforms.uSize, Math.max(0.05, s.size));\r
      gl.uniform1f(uniforms.uThickness, Math.max(0, s.thickness));\r
      gl.uniform1f(uniforms.uGlow, Math.max(0.01, s.glow));\r
      gl.uniform1f(uniforms.uFlicker, reduced ? 0 : Math.min(1, Math.max(0, s.flicker)));\r
      gl.uniform1f(uniforms.uBranches, Math.min(1, Math.max(0, s.branches)));\r
      gl.uniform1f(uniforms.uXOffset, s.xOffset);\r
      gl.uniform1f(uniforms.uAngle, (s.angle * Math.PI) / 180);\r
      gl.uniform1f(uniforms.uSpread, s.spread);\r
      gl.uniform1i(uniforms.uBolts, Math.min(MAX_BOLTS, Math.max(1, Math.round(s.bolts))));\r
      gl.uniform4f(uniforms.uPointer, px, py, pointer.presence, Math.max(0, s.mouseStrength));\r
      gl.uniform4fv(uniforms.uStrikes, strikeData);\r
      gl.uniform4fv(uniforms.uStrikeInfo, infoData);\r
      gl.uniform1f(uniforms.uFlash, Math.min(1, flash));\r
      gl.uniform1f(uniforms.uIntro, introAmount);\r
      gl.uniform1f(uniforms.uLight, s.lightMode ? 1 : 0);\r
      gl.uniform1f(uniforms.uFade, Math.min(1, Math.max(0, s.fade)));\r
      gl.uniform1f(uniforms.uOpacity, Math.min(1, Math.max(0, s.opacity)));\r
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (disposed || !visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = Math.min(0.05, (now - last) / 1000 || 0);\r
      last = now;\r
      if (introStart !== null && introStart < 0) introStart = now;\r
      if (!s.paused && !reduced) phase = (phase + (dt * Math.max(0, s.speed)) / 10) % 1;\r
      const steps = Math.max(1, Math.ceil(dt / (1 / 120)));\r
      const h = dt / steps;\r
      for (let n = 0; n < steps; n++) {\r
        pointer.vx += (120 * (pointer.tx - pointer.x) - 19 * pointer.vx) * h;\r
        pointer.vy += (120 * (pointer.ty - pointer.y) - 19 * pointer.vy) * h;\r
        pointer.x += pointer.vx * h;\r
        pointer.y += pointer.vy * h;\r
      }\r
      const goal = s.mouseInteraction && pointer.inside && !reduced ? 1 : 0;\r
      pointer.presence += (goal - pointer.presence) * (1 - Math.exp(-dt / (goal > pointer.presence ? 0.3 : 0.55)));\r
      draw(now);\r
      const striking = strikes.some(strike => strike.born >= 0 && now - strike.born < LIFE * 1000 + 50);\r
      const introducing = introStart !== null && now - introStart < 450;\r
      const moving = !s.paused && !reduced && s.speed > 0;\r
      const settling = Math.abs(goal - pointer.presence) > 0.002 || Math.abs(pointer.vx) + Math.abs(pointer.vy) > 0.5;\r
      if (moving || striking || introducing || settling) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (raf || disposed || !visible || document.hidden) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const locate = event => {\r
      const rect = canvas.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      return [x, y, x >= 0 && y >= 0 && x <= rect.width && y <= rect.height];\r
    };\r
\r
    const onMove = event => {\r
      const [x, y, inside] = locate(event);\r
      if (inside && !pointer.inside && pointer.presence < 0.02) {\r
        pointer.x = x;\r
        pointer.y = y;\r
        pointer.vx = pointer.vy = 0;\r
      }\r
      pointer.tx = x;\r
      pointer.ty = y;\r
      pointer.inside = inside;\r
      if (settingsRef.current.mouseInteraction) wake();\r
    };\r
\r
    const onLeave = event => {\r
      if (event.relatedTarget) return;\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
    const onDown = event => {\r
      if (!settingsRef.current.clickStrike || reduced) return;\r
      const [x, y, inside] = locate(event);\r
      if (!inside) return;\r
      const [ux, uy] = toUv(x, y);\r
      const radians = (settingsRef.current.angle * Math.PI) / 180;\r
      const sa = Math.sin(radians);\r
      const ca = Math.cos(radians);\r
      const top = (view.width / view.height) * Math.abs(sa) + Math.abs(ca);\r
      const strike = strikes[next];\r
      next = (next + 1) % MAX_STRIKES;\r
      strike.x = ux;\r
      strike.y = uy;\r
      strike.reach = top - (-sa * ux + ca * uy) + 0.2;\r
      strike.born = performance.now();\r
      strike.seed = Math.random() * 100;\r
      wake();\r
    };\r
\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    window.addEventListener('pointerdown', onDown, { passive: true });\r
    window.addEventListener('pointerout', onLeave);\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      resize();\r
      draw(performance.now());\r
      wake();\r
    });\r
    resizeObserver.observe(canvas);\r
\r
    const visibilityObserver = new IntersectionObserver(([entry]) => {\r
      visible = entry.isIntersecting;\r
      if (visible) wake();\r
    });\r
    visibilityObserver.observe(canvas);\r
\r
    const onVisibility = () => {\r
      if (!document.hidden) wake();\r
    };\r
    document.addEventListener('visibilitychange', onVisibility);\r
\r
    resize();\r
    draw(performance.now());\r
    wake();\r
\r
    engineRef.current = {\r
      refresh: () => {\r
        resize();\r
        draw(performance.now());\r
        wake();\r
      }\r
    };\r
\r
    return () => {\r
      disposed = true;\r
      cancelAnimationFrame(raf);\r
      resizeObserver.disconnect();\r
      visibilityObserver.disconnect();\r
      window.removeEventListener('pointermove', onMove);\r
      window.removeEventListener('pointerdown', onDown);\r
      window.removeEventListener('pointerout', onLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteProgram(program);\r
      engineRef.current = null;\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    engineRef.current?.refresh();\r
  }, [\r
    color,\r
    bolts,\r
    spread,\r
    branches,\r
    xOffset,\r
    angle,\r
    size,\r
    thickness,\r
    glow,\r
    intensity,\r
    speed,\r
    flicker,\r
    fade,\r
    opacity,\r
    lightMode,\r
    paused,\r
    dpr\r
  ]);\r
\r
  return <canvas ref={canvasRef} className={\`relative block h-full w-full \${className}\`.trim()} style={style} />;\r
};\r
\r
export default Lightning;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties } from 'react';\r
\r
import './Lightning.css';\r
\r
const MAX_BOLTS = 4;\r
const MAX_STRIKES = 4;\r
const LEADER = 0.11;\r
const LIFE = 1.3;\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\r
\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
\r
uniform vec2 uResolution;\r
uniform float uPhase;\r
uniform vec3 uColor;\r
uniform float uIntensity;\r
uniform float uSize;\r
uniform float uThickness;\r
uniform float uGlow;\r
uniform float uFlicker;\r
uniform float uBranches;\r
uniform float uXOffset;\r
uniform float uAngle;\r
uniform float uSpread;\r
uniform int uBolts;\r
uniform vec4 uPointer;\r
uniform vec4 uStrikes[\${MAX_STRIKES}];\r
uniform vec4 uStrikeInfo[\${MAX_STRIKES}];\r
uniform float uFlash;\r
uniform float uIntro;\r
uniform float uLight;\r
uniform float uFade;\r
uniform float uOpacity;\r
\r
out vec4 outColor;\r
\r
const float TAU = 6.28318530718;\r
const float PERIOD = 8.0;\r
const float WARP = 2.1;\r
\r
vec2 hash22(vec2 p) {\r
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));\r
  p3 += dot(p3, p3.yzx + 33.33);\r
  return fract((p3.xx + p3.yz) * p3.zy) * 2.0 - 1.0;\r
}\r
\r
float hash11(float p) {\r
  p = fract(p * 0.1031);\r
  p *= p + 33.33;\r
  p *= p + p;\r
  return fract(p);\r
}\r
\r
float gnoise(vec2 p, float period) {\r
  vec2 i = floor(p);\r
  vec2 f = fract(p);\r
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);\r
  float a = dot(hash22(mod(i, period)), f);\r
  float b = dot(hash22(mod(i + vec2(1.0, 0.0), period)), f - vec2(1.0, 0.0));\r
  float c = dot(hash22(mod(i + vec2(0.0, 1.0), period)), f - vec2(0.0, 1.0));\r
  float d = dot(hash22(mod(i + vec2(1.0, 1.0), period)), f - vec2(1.0, 1.0));\r
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);\r
}\r
\r
float fbm(vec2 p, int octaves) {\r
  float value = 0.0;\r
  float amplitude = 0.5;\r
  float period = PERIOD;\r
  for (int i = 0; i < 8; i++) {\r
    if (i >= octaves) break;\r
    value += amplitude * gnoise(p, period);\r
    p = p * 2.0 + vec2(17.0, 31.0);\r
    period *= 2.0;\r
    amplitude *= 0.5;\r
  }\r
  return value;\r
}\r
\r
float warpField(vec2 q, float base, float reach, int octaves) {\r
  float value = 0.0;\r
  float amplitude = 0.5;\r
  float period = PERIOD;\r
  for (int i = 0; i < 8; i++) {\r
    if (i >= octaves) break;\r
    float weight = 1.0;\r
    if (i >= 3) {\r
      float estimate = abs(base + value * WARP);\r
      weight = 1.0 - smoothstep(reach * 0.6, reach, estimate);\r
      if (weight <= 0.0) break;\r
      reach *= 0.62;\r
    }\r
    value += amplitude * gnoise(q, period) * weight;\r
    q = q * 2.0 + vec2(17.0, 31.0);\r
    period *= 2.0;\r
    amplitude *= 0.5;\r
  }\r
  return value * WARP;\r
}\r
\r
float flicker(float seed) {\r
  float steady = 0.82 + 0.18 * sin(TAU * (uPhase * 13.0 + seed)) * sin(TAU * (uPhase * 7.0 + seed * 1.7));\r
  float burst = 0.0;\r
  for (int j = 0; j < 3; j++) {\r
    float at = hash11(seed * 17.0 + float(j) * 5.3);\r
    float since = fract(uPhase - at) * 10.0;\r
    burst += exp(-since * 7.0) * (0.75 + 0.45 * sin(since * 70.0));\r
  }\r
  return mix(1.0, steady + burst * 0.9, uFlicker);\r
}\r
\r
float glow(float d, float width) {\r
  float reach = d / (width * 3.5);\r
  return width / (d + width * 0.08) / (1.0 + reach * reach);\r
}\r
\r
vec2 gDrift;\r
float gWidth;\r
float gCore;\r
float gPixel;\r
\r
vec3 bolt(\r
  vec2 p,\r
  vec2 offset,\r
  float seed,\r
  float pinned,\r
  float front,\r
  float strength,\r
  float branches,\r
  float blink,\r
  float branchGain,\r
  vec2 range,\r
  float heat,\r
  int octaves\r
) {\r
  vec2 q = p * uSize + gDrift + offset;\r
  float pin = pinned > 0.5 ? fbm(gDrift + offset, octaves) * WARP : 0.0;\r
  float warp = warpField(q, p.x - pin, 1.3 * max(1.0, uGlow), octaves) - pin;\r
  float crackle = heat > 0.001 ? heat * 0.012 * gnoise(q * 9.0 + vec2(41.0, 7.0), PERIOD * 9.0) : 0.0;\r
  float x = p.x + warp + crackle;\r
  float d = length(vec2(x, max(front - p.y, 0.0)));\r
  float energy = glow(d, gWidth * (1.0 + heat * 0.6)) * strength;\r
  float core = (1.0 - smoothstep(gCore - gPixel, gCore + gPixel, d)) * min(strength, 1.6);\r
  float line = glow(d, gWidth * 0.55) * strength;\r
\r
  for (int k = 0; k < 6; k++) {\r
    float order = float(k) + 0.5;\r
    if (order > branches + heat * 2.0) break;\r
    float h = seed * 31.0 + float(k) * 13.7;\r
    float start = mix(range.x, range.y, hash11(h));\r
    float span = mix(0.22, 0.7, hash11(h + 3.0));\r
    if (pinned > 0.5) span = min(span, max(start - 0.04, 0.06));\r
    float along = (start - p.y) / span;\r
    if (along <= 0.0 || along >= 1.0) continue;\r
    float side = hash11(h + 1.0) > 0.5 ? 1.0 : -1.0;\r
    float slope = mix(0.35, 1.15, hash11(h + 2.0));\r
    float offset = x - side * slope * (start - p.y);\r
    if (abs(offset) - 0.12 * along > gWidth * 13.0) continue;\r
    float gain = branchGain;\r
    if (blink > 0.5) {\r
      float window = fract(uPhase * 3.0 + hash11(h + 4.0));\r
      float shown = smoothstep(0.0, 0.03, window) * (1.0 - smoothstep(0.3, 0.42, window));\r
      gain *= max(shown, heat * 0.8);\r
      if (gain <= 0.001) continue;\r
      gain *= flicker(seed + order);\r
    }\r
    if (gain <= 0.001) continue;\r
    vec2 jq = q * 3.0 + vec2(order * 11.0, order * 5.0);\r
    float jag = (gnoise(jq, PERIOD * 3.0) * 0.12 + gnoise(jq * 3.0 + vec2(5.0, 9.0), PERIOD * 9.0) * 0.035) * along;\r
    float bd = abs(offset - jag);\r
    float taper = pow(1.0 - along, 1.6) * smoothstep(0.0, 0.2, along) * smoothstep(front, front + 0.08, p.y);\r
    energy += glow(bd, gWidth * 0.4) * taper * gain;\r
    line += glow(bd, gWidth * 0.2) * taper * gain;\r
    core += (1.0 - smoothstep(gCore * 0.6 - gPixel, gCore * 0.6 + gPixel, bd)) * taper * min(gain, 1.0) * 0.8;\r
  }\r
  return vec3(energy, core, line);\r
}\r
\r
void main() {\r
  vec2 uv = (2.0 * gl_FragCoord.xy - uResolution) / uResolution.y;\r
  gPixel = 2.0 / uResolution.y;\r
  gDrift = vec2(PERIOD) * uPhase;\r
  gWidth = 0.07 * uGlow;\r
  gCore = 0.0032 * uThickness;\r
  float ca = cos(uAngle);\r
  float sa = sin(uAngle);\r
  mat2 turn = mat2(ca, -sa, sa, ca);\r
  vec2 local = turn * uv;\r
  vec2 pointer = turn * uPointer.xy;\r
  vec2 toPointer = uv - uPointer.xy;\r
  float heat = uPointer.z * exp(-dot(toPointer, toPointer) / 0.09);\r
  int octaves = uResolution.y > 1400.0 ? 8 : 7;\r
\r
  float energy = 0.0;\r
  float core = 0.0;\r
  float line = 0.0;\r
\r
  for (int b = 0; b < \${MAX_BOLTS}; b++) {\r
    if (b >= uBolts) break;\r
    float seed = float(b) * 7.13 + 0.37;\r
    float lane = uXOffset + (float(b) - 0.5 * float(uBolts - 1)) * uSpread;\r
    vec2 p = local - vec2(lane, 0.0);\r
    float near = exp(-pow(pointer.x - lane, 2.0) / 0.5);\r
    float lean = uPointer.z * uPointer.w * near * exp(-pow(p.y - pointer.y, 2.0) / 0.14);\r
    p.x -= lean * clamp(pointer.x - lane, -0.45, 0.45) * 0.55;\r
    float reveal = uIntro >= 1.0 ? 1.0 : smoothstep(0.0, 0.08, uv.y - (1.1 - 2.4 * uIntro));\r
    float strength = flicker(seed) * reveal * (1.0 + heat * 1.4) * (1.0 + uFlash);\r
    vec3 hit = bolt(\r
      p,\r
      vec2(float(b) * 3.0, float(b) * 5.0),\r
      seed,\r
      0.0,\r
      -1000.0,\r
      strength,\r
      uBranches * 6.0,\r
      1.0,\r
      reveal,\r
      vec2(-0.75, 0.9),\r
      heat,\r
      octaves\r
    );\r
    energy += hit.x;\r
    core += hit.y;\r
    line += hit.z;\r
  }\r
\r
  for (int j = 0; j < \${MAX_STRIKES}; j++) {\r
    vec4 strike = uStrikes[j];\r
    if (strike.w <= 0.001) continue;\r
    vec4 info = uStrikeInfo[j];\r
    vec2 p = local - turn * strike.xy;\r
    if (p.y < strike.z - 1.6) continue;\r
    vec3 hit = bolt(\r
      p,\r
      vec2(info.x * 0.731, info.x * 1.377),\r
      info.x,\r
      1.0,\r
      strike.z,\r
      strike.w,\r
      uBranches * 6.0,\r
      0.0,\r
      strike.w,\r
      vec2(0.12, info.y),\r
      heat,\r
      octaves\r
    );\r
    energy += hit.x + info.z * strike.w * glow(length(p), gWidth * 0.5) * 0.12;\r
    core += hit.y;\r
    line += hit.z;\r
  }\r
\r
  float e = energy * uIntensity * 0.6;\r
  float hot = clamp(core + smoothstep(6.0, 20.0, e) * 0.55, 0.0, 1.0);\r
  vec2 edge = min(gl_FragCoord.xy, uResolution - gl_FragCoord.xy) / (uResolution.y * max(uFade, 0.0001) * 0.5);\r
  float fade = uFade > 0.0 ? smoothstep(0.0, 1.0, edge.x) * smoothstep(0.0, 1.0, edge.y) : 1.0;\r
\r
  vec3 rgb;\r
  float alpha;\r
  if (uLight > 0.5) {\r
    float stroke = smoothstep(1.0, 3.6, line * uIntensity);\r
    float halo = 1.0 - exp(-e * 0.35);\r
    vec3 ink = uColor * 0.82;\r
    alpha = clamp(stroke + halo * 0.15, 0.0, 1.0);\r
    rgb = mix(ink, vec3(1.0), hot * 0.85) * alpha;\r
  } else {\r
    vec3 lit = 1.0 - exp(-uColor * e * 0.9);\r
    rgb = mix(lit, vec3(1.0), hot);\r
    alpha = clamp(max(rgb.r, max(rgb.g, rgb.b)), 0.0, 1.0);\r
  }\r
  float keep = fade * uOpacity;\r
  outColor = vec4(rgb * keep, alpha * keep);\r
}\r
\`;\r
\r
interface LightningProps {\r
  color?: string;\r
  bolts?: number;\r
  spread?: number;\r
  branches?: number;\r
  xOffset?: number;\r
  angle?: number;\r
  size?: number;\r
  thickness?: number;\r
  glow?: number;\r
  intensity?: number;\r
  speed?: number;\r
  flicker?: number;\r
  mouseInteraction?: boolean;\r
  mouseStrength?: number;\r
  clickStrike?: boolean;\r
  intro?: boolean;\r
  fade?: number;\r
  opacity?: number;\r
  lightMode?: boolean;\r
  paused?: boolean;\r
  dpr?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Strike {\r
  x: number;\r
  y: number;\r
  born: number;\r
  seed: number;\r
  reach: number;\r
}\r
\r
const toRgb = (color: string): [number, number, number] => {\r
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(color).trim());\r
  if (!match) return [0.5, 0.6, 1];\r
  const hex = match[1].length === 3 ? match[1].replace(/./g, digit => digit + digit) : match[1];\r
  return [0, 2, 4].map(index => parseInt(hex.slice(index, index + 2), 16) / 255) as [number, number, number];\r
};\r
\r
const smootherstep = (t: number) => {\r
  const x = Math.min(1, Math.max(0, t));\r
  return x * x * x * (x * (x * 6 - 15) + 10);\r
};\r
\r
const compile = (gl: WebGL2RenderingContext, type: number, source: string) => {\r
  const shader = gl.createShader(type) as WebGLShader;\r
  gl.shaderSource(shader, source);\r
  gl.compileShader(shader);\r
  return shader;\r
};\r
\r
const UNIFORMS = [\r
  'uResolution',\r
  'uPhase',\r
  'uColor',\r
  'uIntensity',\r
  'uSize',\r
  'uThickness',\r
  'uGlow',\r
  'uFlicker',\r
  'uBranches',\r
  'uXOffset',\r
  'uAngle',\r
  'uSpread',\r
  'uBolts',\r
  'uPointer',\r
  'uStrikes',\r
  'uStrikeInfo',\r
  'uFlash',\r
  'uIntro',\r
  'uLight',\r
  'uFade',\r
  'uOpacity'\r
];\r
\r
const Lightning = ({\r
  color = '#4d6bff',\r
  bolts = 1,\r
  spread = 0.6,\r
  branches = 0.5,\r
  xOffset = 0,\r
  angle = 0,\r
  size = 1,\r
  thickness = 1,\r
  glow = 1,\r
  intensity = 1,\r
  speed = 1,\r
  flicker = 0.6,\r
  mouseInteraction = true,\r
  mouseStrength = 1,\r
  clickStrike = true,\r
  intro = true,\r
  fade = 0,\r
  opacity = 1,\r
  lightMode = false,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  style\r
}: LightningProps) => {\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const engineRef = useRef<{ refresh: () => void } | null>(null);\r
  const settings = {\r
    color,\r
    bolts,\r
    spread,\r
    branches,\r
    xOffset,\r
    angle,\r
    size,\r
    thickness,\r
    glow,\r
    intensity,\r
    speed,\r
    flicker,\r
    mouseInteraction,\r
    mouseStrength,\r
    clickStrike,\r
    intro,\r
    fade,\r
    opacity,\r
    lightMode,\r
    paused,\r
    dpr\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const canvas = canvasRef.current;\r
    if (!canvas) return;\r
    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });\r
    if (!gl) return;\r
\r
    const program = gl.createProgram() as WebGLProgram;\r
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));\r
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));\r
    gl.linkProgram(program);\r
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;\r
    const uniforms = Object.fromEntries(UNIFORMS.map(name => [name, gl.getUniformLocation(program, name)]));\r
    const buffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
    const position = gl.getAttribLocation(program, 'aPosition');\r
\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
    const view = { width: 1, height: 1, left: 0, top: 0 };\r
    const pointer = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, presence: 0, inside: false };\r
    const strikes: Strike[] = Array.from({ length: MAX_STRIKES }, () => ({ x: 0, y: 0, born: -1, seed: 0, reach: 2 }));\r
    const strikeData = new Float32Array(MAX_STRIKES * 4);\r
    const infoData = new Float32Array(MAX_STRIKES * 4);\r
    let next = 0;\r
    let phase = 0.21;\r
    let introStart: number | null = settingsRef.current.intro && !reduced ? -1 : null;\r
    let visible = true;\r
    let raf = 0;\r
    let last = 0;\r
    let disposed = false;\r
\r
    const resize = () => {\r
      const rect = canvas.getBoundingClientRect();\r
      const ratio = Math.min(settingsRef.current.dpr ?? window.devicePixelRatio ?? 1, 2);\r
      view.width = Math.max(1, rect.width);\r
      view.height = Math.max(1, rect.height);\r
      view.left = rect.left;\r
      view.top = rect.top;\r
      const width = Math.max(1, Math.round(view.width * ratio));\r
      const height = Math.max(1, Math.round(view.height * ratio));\r
      if (canvas.width !== width || canvas.height !== height) {\r
        canvas.width = width;\r
        canvas.height = height;\r
      }\r
    };\r
\r
    const toUv = (x: number, y: number): [number, number] => [\r
      (2 * x - view.width) / view.height,\r
      (view.height - 2 * y) / view.height\r
    ];\r
\r
    const draw = (now: number) => {\r
      const s = settingsRef.current;\r
      const rgb = toRgb(s.color);\r
      let flash = 0;\r
      for (let j = 0; j < MAX_STRIKES; j++) {\r
        const strike = strikes[j];\r
        const age = strike.born < 0 ? -1 : (now - strike.born) / 1000;\r
        const base = j * 4;\r
        if (age < 0 || age > LIFE) {\r
          strikeData.fill(0, base, base + 4);\r
          infoData.fill(0, base, base + 4);\r
          continue;\r
        }\r
        const progress = Math.min(1, age / LEADER);\r
        const since = age - LEADER;\r
        let env = 0.45 + 0.35 * progress;\r
        if (since >= 0) {\r
          env = 1.8 * Math.exp(-since * 5.5) * (0.85 + 0.2 * Math.sin(since * 70));\r
          if (since > 0.17) env += Math.exp(-(since - 0.17) * 9);\r
          if (since > 0.33) env += 0.7 * Math.exp(-(since - 0.33) * 10);\r
          flash += 0.5 * Math.exp(-since * 9);\r
          if (since > 0.17) flash += 0.25 * Math.exp(-(since - 0.17) * 12);\r
        }\r
        env *= 1 - smootherstep((age - (LIFE - 0.4)) / 0.4);\r
        strikeData[base] = strike.x;\r
        strikeData[base + 1] = strike.y;\r
        strikeData[base + 2] = strike.reach * (1 - progress ** 1.6);\r
        strikeData[base + 3] = env;\r
        infoData[base] = strike.seed;\r
        infoData[base + 1] = strike.reach;\r
        infoData[base + 2] = since >= 0 ? 1 : 0;\r
        infoData[base + 3] = 0;\r
      }\r
      const introAmount = introStart === null ? 1 : introStart < 0 ? 0 : Math.min(1, (now - introStart) / 420);\r
      const [px, py] = toUv(pointer.x, pointer.y);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.useProgram(program);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
      gl.enableVertexAttribArray(position);\r
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);\r
      gl.uniform2f(uniforms.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(uniforms.uPhase, phase);\r
      gl.uniform3f(uniforms.uColor, rgb[0], rgb[1], rgb[2]);\r
      gl.uniform1f(uniforms.uIntensity, Math.max(0, s.intensity));\r
      gl.uniform1f(uniforms.uSize, Math.max(0.05, s.size));\r
      gl.uniform1f(uniforms.uThickness, Math.max(0, s.thickness));\r
      gl.uniform1f(uniforms.uGlow, Math.max(0.01, s.glow));\r
      gl.uniform1f(uniforms.uFlicker, reduced ? 0 : Math.min(1, Math.max(0, s.flicker)));\r
      gl.uniform1f(uniforms.uBranches, Math.min(1, Math.max(0, s.branches)));\r
      gl.uniform1f(uniforms.uXOffset, s.xOffset);\r
      gl.uniform1f(uniforms.uAngle, (s.angle * Math.PI) / 180);\r
      gl.uniform1f(uniforms.uSpread, s.spread);\r
      gl.uniform1i(uniforms.uBolts, Math.min(MAX_BOLTS, Math.max(1, Math.round(s.bolts))));\r
      gl.uniform4f(uniforms.uPointer, px, py, pointer.presence, Math.max(0, s.mouseStrength));\r
      gl.uniform4fv(uniforms.uStrikes, strikeData);\r
      gl.uniform4fv(uniforms.uStrikeInfo, infoData);\r
      gl.uniform1f(uniforms.uFlash, Math.min(1, flash));\r
      gl.uniform1f(uniforms.uIntro, introAmount);\r
      gl.uniform1f(uniforms.uLight, s.lightMode ? 1 : 0);\r
      gl.uniform1f(uniforms.uFade, Math.min(1, Math.max(0, s.fade)));\r
      gl.uniform1f(uniforms.uOpacity, Math.min(1, Math.max(0, s.opacity)));\r
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (disposed || !visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = Math.min(0.05, (now - last) / 1000 || 0);\r
      last = now;\r
      if (introStart !== null && introStart < 0) introStart = now;\r
      if (!s.paused && !reduced) phase = (phase + (dt * Math.max(0, s.speed)) / 10) % 1;\r
      const steps = Math.max(1, Math.ceil(dt / (1 / 120)));\r
      const h = dt / steps;\r
      for (let n = 0; n < steps; n++) {\r
        pointer.vx += (120 * (pointer.tx - pointer.x) - 19 * pointer.vx) * h;\r
        pointer.vy += (120 * (pointer.ty - pointer.y) - 19 * pointer.vy) * h;\r
        pointer.x += pointer.vx * h;\r
        pointer.y += pointer.vy * h;\r
      }\r
      const goal = s.mouseInteraction && pointer.inside && !reduced ? 1 : 0;\r
      pointer.presence += (goal - pointer.presence) * (1 - Math.exp(-dt / (goal > pointer.presence ? 0.3 : 0.55)));\r
      draw(now);\r
      const striking = strikes.some(strike => strike.born >= 0 && now - strike.born < LIFE * 1000 + 50);\r
      const introducing = introStart !== null && now - introStart < 450;\r
      const moving = !s.paused && !reduced && s.speed > 0;\r
      const settling = Math.abs(goal - pointer.presence) > 0.002 || Math.abs(pointer.vx) + Math.abs(pointer.vy) > 0.5;\r
      if (moving || striking || introducing || settling) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (raf || disposed || !visible || document.hidden) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const locate = (event: PointerEvent): [number, number, boolean] => {\r
      const rect = canvas.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      return [x, y, x >= 0 && y >= 0 && x <= rect.width && y <= rect.height];\r
    };\r
\r
    const onMove = (event: PointerEvent) => {\r
      const [x, y, inside] = locate(event);\r
      if (inside && !pointer.inside && pointer.presence < 0.02) {\r
        pointer.x = x;\r
        pointer.y = y;\r
        pointer.vx = pointer.vy = 0;\r
      }\r
      pointer.tx = x;\r
      pointer.ty = y;\r
      pointer.inside = inside;\r
      if (settingsRef.current.mouseInteraction) wake();\r
    };\r
\r
    const onLeave = (event: PointerEvent) => {\r
      if (event.relatedTarget) return;\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
    const onDown = (event: PointerEvent) => {\r
      if (!settingsRef.current.clickStrike || reduced) return;\r
      const [x, y, inside] = locate(event);\r
      if (!inside) return;\r
      const [ux, uy] = toUv(x, y);\r
      const radians = (settingsRef.current.angle * Math.PI) / 180;\r
      const sa = Math.sin(radians);\r
      const ca = Math.cos(radians);\r
      const top = (view.width / view.height) * Math.abs(sa) + Math.abs(ca);\r
      const strike = strikes[next];\r
      next = (next + 1) % MAX_STRIKES;\r
      strike.x = ux;\r
      strike.y = uy;\r
      strike.reach = top - (-sa * ux + ca * uy) + 0.2;\r
      strike.born = performance.now();\r
      strike.seed = Math.random() * 100;\r
      wake();\r
    };\r
\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    window.addEventListener('pointerdown', onDown, { passive: true });\r
    window.addEventListener('pointerout', onLeave);\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      resize();\r
      draw(performance.now());\r
      wake();\r
    });\r
    resizeObserver.observe(canvas);\r
\r
    const visibilityObserver = new IntersectionObserver(([entry]) => {\r
      visible = entry.isIntersecting;\r
      if (visible) wake();\r
    });\r
    visibilityObserver.observe(canvas);\r
\r
    const onVisibility = () => {\r
      if (!document.hidden) wake();\r
    };\r
    document.addEventListener('visibilitychange', onVisibility);\r
\r
    resize();\r
    draw(performance.now());\r
    wake();\r
\r
    engineRef.current = {\r
      refresh: () => {\r
        resize();\r
        draw(performance.now());\r
        wake();\r
      }\r
    };\r
\r
    return () => {\r
      disposed = true;\r
      cancelAnimationFrame(raf);\r
      resizeObserver.disconnect();\r
      visibilityObserver.disconnect();\r
      window.removeEventListener('pointermove', onMove);\r
      window.removeEventListener('pointerdown', onDown);\r
      window.removeEventListener('pointerout', onLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteProgram(program);\r
      engineRef.current = null;\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    engineRef.current?.refresh();\r
  }, [\r
    color,\r
    bolts,\r
    spread,\r
    branches,\r
    xOffset,\r
    angle,\r
    size,\r
    thickness,\r
    glow,\r
    intensity,\r
    speed,\r
    flicker,\r
    fade,\r
    opacity,\r
    lightMode,\r
    paused,\r
    dpr\r
  ]);\r
\r
  return <canvas ref={canvasRef} className={\`lightning-container \${className}\`.trim()} style={style} />;\r
};\r
\r
export default Lightning;\r
`,o=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties } from 'react';\r
\r
const MAX_BOLTS = 4;\r
const MAX_STRIKES = 4;\r
const LEADER = 0.11;\r
const LIFE = 1.3;\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\r
\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
\r
uniform vec2 uResolution;\r
uniform float uPhase;\r
uniform vec3 uColor;\r
uniform float uIntensity;\r
uniform float uSize;\r
uniform float uThickness;\r
uniform float uGlow;\r
uniform float uFlicker;\r
uniform float uBranches;\r
uniform float uXOffset;\r
uniform float uAngle;\r
uniform float uSpread;\r
uniform int uBolts;\r
uniform vec4 uPointer;\r
uniform vec4 uStrikes[\${MAX_STRIKES}];\r
uniform vec4 uStrikeInfo[\${MAX_STRIKES}];\r
uniform float uFlash;\r
uniform float uIntro;\r
uniform float uLight;\r
uniform float uFade;\r
uniform float uOpacity;\r
\r
out vec4 outColor;\r
\r
const float TAU = 6.28318530718;\r
const float PERIOD = 8.0;\r
const float WARP = 2.1;\r
\r
vec2 hash22(vec2 p) {\r
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));\r
  p3 += dot(p3, p3.yzx + 33.33);\r
  return fract((p3.xx + p3.yz) * p3.zy) * 2.0 - 1.0;\r
}\r
\r
float hash11(float p) {\r
  p = fract(p * 0.1031);\r
  p *= p + 33.33;\r
  p *= p + p;\r
  return fract(p);\r
}\r
\r
float gnoise(vec2 p, float period) {\r
  vec2 i = floor(p);\r
  vec2 f = fract(p);\r
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);\r
  float a = dot(hash22(mod(i, period)), f);\r
  float b = dot(hash22(mod(i + vec2(1.0, 0.0), period)), f - vec2(1.0, 0.0));\r
  float c = dot(hash22(mod(i + vec2(0.0, 1.0), period)), f - vec2(0.0, 1.0));\r
  float d = dot(hash22(mod(i + vec2(1.0, 1.0), period)), f - vec2(1.0, 1.0));\r
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);\r
}\r
\r
float fbm(vec2 p, int octaves) {\r
  float value = 0.0;\r
  float amplitude = 0.5;\r
  float period = PERIOD;\r
  for (int i = 0; i < 8; i++) {\r
    if (i >= octaves) break;\r
    value += amplitude * gnoise(p, period);\r
    p = p * 2.0 + vec2(17.0, 31.0);\r
    period *= 2.0;\r
    amplitude *= 0.5;\r
  }\r
  return value;\r
}\r
\r
float warpField(vec2 q, float base, float reach, int octaves) {\r
  float value = 0.0;\r
  float amplitude = 0.5;\r
  float period = PERIOD;\r
  for (int i = 0; i < 8; i++) {\r
    if (i >= octaves) break;\r
    float weight = 1.0;\r
    if (i >= 3) {\r
      float estimate = abs(base + value * WARP);\r
      weight = 1.0 - smoothstep(reach * 0.6, reach, estimate);\r
      if (weight <= 0.0) break;\r
      reach *= 0.62;\r
    }\r
    value += amplitude * gnoise(q, period) * weight;\r
    q = q * 2.0 + vec2(17.0, 31.0);\r
    period *= 2.0;\r
    amplitude *= 0.5;\r
  }\r
  return value * WARP;\r
}\r
\r
float flicker(float seed) {\r
  float steady = 0.82 + 0.18 * sin(TAU * (uPhase * 13.0 + seed)) * sin(TAU * (uPhase * 7.0 + seed * 1.7));\r
  float burst = 0.0;\r
  for (int j = 0; j < 3; j++) {\r
    float at = hash11(seed * 17.0 + float(j) * 5.3);\r
    float since = fract(uPhase - at) * 10.0;\r
    burst += exp(-since * 7.0) * (0.75 + 0.45 * sin(since * 70.0));\r
  }\r
  return mix(1.0, steady + burst * 0.9, uFlicker);\r
}\r
\r
float glow(float d, float width) {\r
  float reach = d / (width * 3.5);\r
  return width / (d + width * 0.08) / (1.0 + reach * reach);\r
}\r
\r
vec2 gDrift;\r
float gWidth;\r
float gCore;\r
float gPixel;\r
\r
vec3 bolt(\r
  vec2 p,\r
  vec2 offset,\r
  float seed,\r
  float pinned,\r
  float front,\r
  float strength,\r
  float branches,\r
  float blink,\r
  float branchGain,\r
  vec2 range,\r
  float heat,\r
  int octaves\r
) {\r
  vec2 q = p * uSize + gDrift + offset;\r
  float pin = pinned > 0.5 ? fbm(gDrift + offset, octaves) * WARP : 0.0;\r
  float warp = warpField(q, p.x - pin, 1.3 * max(1.0, uGlow), octaves) - pin;\r
  float crackle = heat > 0.001 ? heat * 0.012 * gnoise(q * 9.0 + vec2(41.0, 7.0), PERIOD * 9.0) : 0.0;\r
  float x = p.x + warp + crackle;\r
  float d = length(vec2(x, max(front - p.y, 0.0)));\r
  float energy = glow(d, gWidth * (1.0 + heat * 0.6)) * strength;\r
  float core = (1.0 - smoothstep(gCore - gPixel, gCore + gPixel, d)) * min(strength, 1.6);\r
  float line = glow(d, gWidth * 0.55) * strength;\r
\r
  for (int k = 0; k < 6; k++) {\r
    float order = float(k) + 0.5;\r
    if (order > branches + heat * 2.0) break;\r
    float h = seed * 31.0 + float(k) * 13.7;\r
    float start = mix(range.x, range.y, hash11(h));\r
    float span = mix(0.22, 0.7, hash11(h + 3.0));\r
    if (pinned > 0.5) span = min(span, max(start - 0.04, 0.06));\r
    float along = (start - p.y) / span;\r
    if (along <= 0.0 || along >= 1.0) continue;\r
    float side = hash11(h + 1.0) > 0.5 ? 1.0 : -1.0;\r
    float slope = mix(0.35, 1.15, hash11(h + 2.0));\r
    float offset = x - side * slope * (start - p.y);\r
    if (abs(offset) - 0.12 * along > gWidth * 13.0) continue;\r
    float gain = branchGain;\r
    if (blink > 0.5) {\r
      float window = fract(uPhase * 3.0 + hash11(h + 4.0));\r
      float shown = smoothstep(0.0, 0.03, window) * (1.0 - smoothstep(0.3, 0.42, window));\r
      gain *= max(shown, heat * 0.8);\r
      if (gain <= 0.001) continue;\r
      gain *= flicker(seed + order);\r
    }\r
    if (gain <= 0.001) continue;\r
    vec2 jq = q * 3.0 + vec2(order * 11.0, order * 5.0);\r
    float jag = (gnoise(jq, PERIOD * 3.0) * 0.12 + gnoise(jq * 3.0 + vec2(5.0, 9.0), PERIOD * 9.0) * 0.035) * along;\r
    float bd = abs(offset - jag);\r
    float taper = pow(1.0 - along, 1.6) * smoothstep(0.0, 0.2, along) * smoothstep(front, front + 0.08, p.y);\r
    energy += glow(bd, gWidth * 0.4) * taper * gain;\r
    line += glow(bd, gWidth * 0.2) * taper * gain;\r
    core += (1.0 - smoothstep(gCore * 0.6 - gPixel, gCore * 0.6 + gPixel, bd)) * taper * min(gain, 1.0) * 0.8;\r
  }\r
  return vec3(energy, core, line);\r
}\r
\r
void main() {\r
  vec2 uv = (2.0 * gl_FragCoord.xy - uResolution) / uResolution.y;\r
  gPixel = 2.0 / uResolution.y;\r
  gDrift = vec2(PERIOD) * uPhase;\r
  gWidth = 0.07 * uGlow;\r
  gCore = 0.0032 * uThickness;\r
  float ca = cos(uAngle);\r
  float sa = sin(uAngle);\r
  mat2 turn = mat2(ca, -sa, sa, ca);\r
  vec2 local = turn * uv;\r
  vec2 pointer = turn * uPointer.xy;\r
  vec2 toPointer = uv - uPointer.xy;\r
  float heat = uPointer.z * exp(-dot(toPointer, toPointer) / 0.09);\r
  int octaves = uResolution.y > 1400.0 ? 8 : 7;\r
\r
  float energy = 0.0;\r
  float core = 0.0;\r
  float line = 0.0;\r
\r
  for (int b = 0; b < \${MAX_BOLTS}; b++) {\r
    if (b >= uBolts) break;\r
    float seed = float(b) * 7.13 + 0.37;\r
    float lane = uXOffset + (float(b) - 0.5 * float(uBolts - 1)) * uSpread;\r
    vec2 p = local - vec2(lane, 0.0);\r
    float near = exp(-pow(pointer.x - lane, 2.0) / 0.5);\r
    float lean = uPointer.z * uPointer.w * near * exp(-pow(p.y - pointer.y, 2.0) / 0.14);\r
    p.x -= lean * clamp(pointer.x - lane, -0.45, 0.45) * 0.55;\r
    float reveal = uIntro >= 1.0 ? 1.0 : smoothstep(0.0, 0.08, uv.y - (1.1 - 2.4 * uIntro));\r
    float strength = flicker(seed) * reveal * (1.0 + heat * 1.4) * (1.0 + uFlash);\r
    vec3 hit = bolt(\r
      p,\r
      vec2(float(b) * 3.0, float(b) * 5.0),\r
      seed,\r
      0.0,\r
      -1000.0,\r
      strength,\r
      uBranches * 6.0,\r
      1.0,\r
      reveal,\r
      vec2(-0.75, 0.9),\r
      heat,\r
      octaves\r
    );\r
    energy += hit.x;\r
    core += hit.y;\r
    line += hit.z;\r
  }\r
\r
  for (int j = 0; j < \${MAX_STRIKES}; j++) {\r
    vec4 strike = uStrikes[j];\r
    if (strike.w <= 0.001) continue;\r
    vec4 info = uStrikeInfo[j];\r
    vec2 p = local - turn * strike.xy;\r
    if (p.y < strike.z - 1.6) continue;\r
    vec3 hit = bolt(\r
      p,\r
      vec2(info.x * 0.731, info.x * 1.377),\r
      info.x,\r
      1.0,\r
      strike.z,\r
      strike.w,\r
      uBranches * 6.0,\r
      0.0,\r
      strike.w,\r
      vec2(0.12, info.y),\r
      heat,\r
      octaves\r
    );\r
    energy += hit.x + info.z * strike.w * glow(length(p), gWidth * 0.5) * 0.12;\r
    core += hit.y;\r
    line += hit.z;\r
  }\r
\r
  float e = energy * uIntensity * 0.6;\r
  float hot = clamp(core + smoothstep(6.0, 20.0, e) * 0.55, 0.0, 1.0);\r
  vec2 edge = min(gl_FragCoord.xy, uResolution - gl_FragCoord.xy) / (uResolution.y * max(uFade, 0.0001) * 0.5);\r
  float fade = uFade > 0.0 ? smoothstep(0.0, 1.0, edge.x) * smoothstep(0.0, 1.0, edge.y) : 1.0;\r
\r
  vec3 rgb;\r
  float alpha;\r
  if (uLight > 0.5) {\r
    float stroke = smoothstep(1.0, 3.6, line * uIntensity);\r
    float halo = 1.0 - exp(-e * 0.35);\r
    vec3 ink = uColor * 0.82;\r
    alpha = clamp(stroke + halo * 0.15, 0.0, 1.0);\r
    rgb = mix(ink, vec3(1.0), hot * 0.85) * alpha;\r
  } else {\r
    vec3 lit = 1.0 - exp(-uColor * e * 0.9);\r
    rgb = mix(lit, vec3(1.0), hot);\r
    alpha = clamp(max(rgb.r, max(rgb.g, rgb.b)), 0.0, 1.0);\r
  }\r
  float keep = fade * uOpacity;\r
  outColor = vec4(rgb * keep, alpha * keep);\r
}\r
\`;\r
\r
interface LightningProps {\r
  color?: string;\r
  bolts?: number;\r
  spread?: number;\r
  branches?: number;\r
  xOffset?: number;\r
  angle?: number;\r
  size?: number;\r
  thickness?: number;\r
  glow?: number;\r
  intensity?: number;\r
  speed?: number;\r
  flicker?: number;\r
  mouseInteraction?: boolean;\r
  mouseStrength?: number;\r
  clickStrike?: boolean;\r
  intro?: boolean;\r
  fade?: number;\r
  opacity?: number;\r
  lightMode?: boolean;\r
  paused?: boolean;\r
  dpr?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Strike {\r
  x: number;\r
  y: number;\r
  born: number;\r
  seed: number;\r
  reach: number;\r
}\r
\r
const toRgb = (color: string): [number, number, number] => {\r
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(color).trim());\r
  if (!match) return [0.5, 0.6, 1];\r
  const hex = match[1].length === 3 ? match[1].replace(/./g, digit => digit + digit) : match[1];\r
  return [0, 2, 4].map(index => parseInt(hex.slice(index, index + 2), 16) / 255) as [number, number, number];\r
};\r
\r
const smootherstep = (t: number) => {\r
  const x = Math.min(1, Math.max(0, t));\r
  return x * x * x * (x * (x * 6 - 15) + 10);\r
};\r
\r
const compile = (gl: WebGL2RenderingContext, type: number, source: string) => {\r
  const shader = gl.createShader(type) as WebGLShader;\r
  gl.shaderSource(shader, source);\r
  gl.compileShader(shader);\r
  return shader;\r
};\r
\r
const UNIFORMS = [\r
  'uResolution',\r
  'uPhase',\r
  'uColor',\r
  'uIntensity',\r
  'uSize',\r
  'uThickness',\r
  'uGlow',\r
  'uFlicker',\r
  'uBranches',\r
  'uXOffset',\r
  'uAngle',\r
  'uSpread',\r
  'uBolts',\r
  'uPointer',\r
  'uStrikes',\r
  'uStrikeInfo',\r
  'uFlash',\r
  'uIntro',\r
  'uLight',\r
  'uFade',\r
  'uOpacity'\r
];\r
\r
const Lightning = ({\r
  color = '#4d6bff',\r
  bolts = 1,\r
  spread = 0.6,\r
  branches = 0.5,\r
  xOffset = 0,\r
  angle = 0,\r
  size = 1,\r
  thickness = 1,\r
  glow = 1,\r
  intensity = 1,\r
  speed = 1,\r
  flicker = 0.6,\r
  mouseInteraction = true,\r
  mouseStrength = 1,\r
  clickStrike = true,\r
  intro = true,\r
  fade = 0,\r
  opacity = 1,\r
  lightMode = false,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  style\r
}: LightningProps) => {\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const engineRef = useRef<{ refresh: () => void } | null>(null);\r
  const settings = {\r
    color,\r
    bolts,\r
    spread,\r
    branches,\r
    xOffset,\r
    angle,\r
    size,\r
    thickness,\r
    glow,\r
    intensity,\r
    speed,\r
    flicker,\r
    mouseInteraction,\r
    mouseStrength,\r
    clickStrike,\r
    intro,\r
    fade,\r
    opacity,\r
    lightMode,\r
    paused,\r
    dpr\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const canvas = canvasRef.current;\r
    if (!canvas) return;\r
    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });\r
    if (!gl) return;\r
\r
    const program = gl.createProgram() as WebGLProgram;\r
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));\r
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));\r
    gl.linkProgram(program);\r
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;\r
    const uniforms = Object.fromEntries(UNIFORMS.map(name => [name, gl.getUniformLocation(program, name)]));\r
    const buffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
    const position = gl.getAttribLocation(program, 'aPosition');\r
\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
    const view = { width: 1, height: 1, left: 0, top: 0 };\r
    const pointer = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, presence: 0, inside: false };\r
    const strikes: Strike[] = Array.from({ length: MAX_STRIKES }, () => ({ x: 0, y: 0, born: -1, seed: 0, reach: 2 }));\r
    const strikeData = new Float32Array(MAX_STRIKES * 4);\r
    const infoData = new Float32Array(MAX_STRIKES * 4);\r
    let next = 0;\r
    let phase = 0.21;\r
    let introStart: number | null = settingsRef.current.intro && !reduced ? -1 : null;\r
    let visible = true;\r
    let raf = 0;\r
    let last = 0;\r
    let disposed = false;\r
\r
    const resize = () => {\r
      const rect = canvas.getBoundingClientRect();\r
      const ratio = Math.min(settingsRef.current.dpr ?? window.devicePixelRatio ?? 1, 2);\r
      view.width = Math.max(1, rect.width);\r
      view.height = Math.max(1, rect.height);\r
      view.left = rect.left;\r
      view.top = rect.top;\r
      const width = Math.max(1, Math.round(view.width * ratio));\r
      const height = Math.max(1, Math.round(view.height * ratio));\r
      if (canvas.width !== width || canvas.height !== height) {\r
        canvas.width = width;\r
        canvas.height = height;\r
      }\r
    };\r
\r
    const toUv = (x: number, y: number): [number, number] => [\r
      (2 * x - view.width) / view.height,\r
      (view.height - 2 * y) / view.height\r
    ];\r
\r
    const draw = (now: number) => {\r
      const s = settingsRef.current;\r
      const rgb = toRgb(s.color);\r
      let flash = 0;\r
      for (let j = 0; j < MAX_STRIKES; j++) {\r
        const strike = strikes[j];\r
        const age = strike.born < 0 ? -1 : (now - strike.born) / 1000;\r
        const base = j * 4;\r
        if (age < 0 || age > LIFE) {\r
          strikeData.fill(0, base, base + 4);\r
          infoData.fill(0, base, base + 4);\r
          continue;\r
        }\r
        const progress = Math.min(1, age / LEADER);\r
        const since = age - LEADER;\r
        let env = 0.45 + 0.35 * progress;\r
        if (since >= 0) {\r
          env = 1.8 * Math.exp(-since * 5.5) * (0.85 + 0.2 * Math.sin(since * 70));\r
          if (since > 0.17) env += Math.exp(-(since - 0.17) * 9);\r
          if (since > 0.33) env += 0.7 * Math.exp(-(since - 0.33) * 10);\r
          flash += 0.5 * Math.exp(-since * 9);\r
          if (since > 0.17) flash += 0.25 * Math.exp(-(since - 0.17) * 12);\r
        }\r
        env *= 1 - smootherstep((age - (LIFE - 0.4)) / 0.4);\r
        strikeData[base] = strike.x;\r
        strikeData[base + 1] = strike.y;\r
        strikeData[base + 2] = strike.reach * (1 - progress ** 1.6);\r
        strikeData[base + 3] = env;\r
        infoData[base] = strike.seed;\r
        infoData[base + 1] = strike.reach;\r
        infoData[base + 2] = since >= 0 ? 1 : 0;\r
        infoData[base + 3] = 0;\r
      }\r
      const introAmount = introStart === null ? 1 : introStart < 0 ? 0 : Math.min(1, (now - introStart) / 420);\r
      const [px, py] = toUv(pointer.x, pointer.y);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.useProgram(program);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
      gl.enableVertexAttribArray(position);\r
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);\r
      gl.uniform2f(uniforms.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(uniforms.uPhase, phase);\r
      gl.uniform3f(uniforms.uColor, rgb[0], rgb[1], rgb[2]);\r
      gl.uniform1f(uniforms.uIntensity, Math.max(0, s.intensity));\r
      gl.uniform1f(uniforms.uSize, Math.max(0.05, s.size));\r
      gl.uniform1f(uniforms.uThickness, Math.max(0, s.thickness));\r
      gl.uniform1f(uniforms.uGlow, Math.max(0.01, s.glow));\r
      gl.uniform1f(uniforms.uFlicker, reduced ? 0 : Math.min(1, Math.max(0, s.flicker)));\r
      gl.uniform1f(uniforms.uBranches, Math.min(1, Math.max(0, s.branches)));\r
      gl.uniform1f(uniforms.uXOffset, s.xOffset);\r
      gl.uniform1f(uniforms.uAngle, (s.angle * Math.PI) / 180);\r
      gl.uniform1f(uniforms.uSpread, s.spread);\r
      gl.uniform1i(uniforms.uBolts, Math.min(MAX_BOLTS, Math.max(1, Math.round(s.bolts))));\r
      gl.uniform4f(uniforms.uPointer, px, py, pointer.presence, Math.max(0, s.mouseStrength));\r
      gl.uniform4fv(uniforms.uStrikes, strikeData);\r
      gl.uniform4fv(uniforms.uStrikeInfo, infoData);\r
      gl.uniform1f(uniforms.uFlash, Math.min(1, flash));\r
      gl.uniform1f(uniforms.uIntro, introAmount);\r
      gl.uniform1f(uniforms.uLight, s.lightMode ? 1 : 0);\r
      gl.uniform1f(uniforms.uFade, Math.min(1, Math.max(0, s.fade)));\r
      gl.uniform1f(uniforms.uOpacity, Math.min(1, Math.max(0, s.opacity)));\r
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (disposed || !visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = Math.min(0.05, (now - last) / 1000 || 0);\r
      last = now;\r
      if (introStart !== null && introStart < 0) introStart = now;\r
      if (!s.paused && !reduced) phase = (phase + (dt * Math.max(0, s.speed)) / 10) % 1;\r
      const steps = Math.max(1, Math.ceil(dt / (1 / 120)));\r
      const h = dt / steps;\r
      for (let n = 0; n < steps; n++) {\r
        pointer.vx += (120 * (pointer.tx - pointer.x) - 19 * pointer.vx) * h;\r
        pointer.vy += (120 * (pointer.ty - pointer.y) - 19 * pointer.vy) * h;\r
        pointer.x += pointer.vx * h;\r
        pointer.y += pointer.vy * h;\r
      }\r
      const goal = s.mouseInteraction && pointer.inside && !reduced ? 1 : 0;\r
      pointer.presence += (goal - pointer.presence) * (1 - Math.exp(-dt / (goal > pointer.presence ? 0.3 : 0.55)));\r
      draw(now);\r
      const striking = strikes.some(strike => strike.born >= 0 && now - strike.born < LIFE * 1000 + 50);\r
      const introducing = introStart !== null && now - introStart < 450;\r
      const moving = !s.paused && !reduced && s.speed > 0;\r
      const settling = Math.abs(goal - pointer.presence) > 0.002 || Math.abs(pointer.vx) + Math.abs(pointer.vy) > 0.5;\r
      if (moving || striking || introducing || settling) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (raf || disposed || !visible || document.hidden) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const locate = (event: PointerEvent): [number, number, boolean] => {\r
      const rect = canvas.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      return [x, y, x >= 0 && y >= 0 && x <= rect.width && y <= rect.height];\r
    };\r
\r
    const onMove = (event: PointerEvent) => {\r
      const [x, y, inside] = locate(event);\r
      if (inside && !pointer.inside && pointer.presence < 0.02) {\r
        pointer.x = x;\r
        pointer.y = y;\r
        pointer.vx = pointer.vy = 0;\r
      }\r
      pointer.tx = x;\r
      pointer.ty = y;\r
      pointer.inside = inside;\r
      if (settingsRef.current.mouseInteraction) wake();\r
    };\r
\r
    const onLeave = (event: PointerEvent) => {\r
      if (event.relatedTarget) return;\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
    const onDown = (event: PointerEvent) => {\r
      if (!settingsRef.current.clickStrike || reduced) return;\r
      const [x, y, inside] = locate(event);\r
      if (!inside) return;\r
      const [ux, uy] = toUv(x, y);\r
      const radians = (settingsRef.current.angle * Math.PI) / 180;\r
      const sa = Math.sin(radians);\r
      const ca = Math.cos(radians);\r
      const top = (view.width / view.height) * Math.abs(sa) + Math.abs(ca);\r
      const strike = strikes[next];\r
      next = (next + 1) % MAX_STRIKES;\r
      strike.x = ux;\r
      strike.y = uy;\r
      strike.reach = top - (-sa * ux + ca * uy) + 0.2;\r
      strike.born = performance.now();\r
      strike.seed = Math.random() * 100;\r
      wake();\r
    };\r
\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    window.addEventListener('pointerdown', onDown, { passive: true });\r
    window.addEventListener('pointerout', onLeave);\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      resize();\r
      draw(performance.now());\r
      wake();\r
    });\r
    resizeObserver.observe(canvas);\r
\r
    const visibilityObserver = new IntersectionObserver(([entry]) => {\r
      visible = entry.isIntersecting;\r
      if (visible) wake();\r
    });\r
    visibilityObserver.observe(canvas);\r
\r
    const onVisibility = () => {\r
      if (!document.hidden) wake();\r
    };\r
    document.addEventListener('visibilitychange', onVisibility);\r
\r
    resize();\r
    draw(performance.now());\r
    wake();\r
\r
    engineRef.current = {\r
      refresh: () => {\r
        resize();\r
        draw(performance.now());\r
        wake();\r
      }\r
    };\r
\r
    return () => {\r
      disposed = true;\r
      cancelAnimationFrame(raf);\r
      resizeObserver.disconnect();\r
      visibilityObserver.disconnect();\r
      window.removeEventListener('pointermove', onMove);\r
      window.removeEventListener('pointerdown', onDown);\r
      window.removeEventListener('pointerout', onLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteProgram(program);\r
      engineRef.current = null;\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    engineRef.current?.refresh();\r
  }, [\r
    color,\r
    bolts,\r
    spread,\r
    branches,\r
    xOffset,\r
    angle,\r
    size,\r
    thickness,\r
    glow,\r
    intensity,\r
    speed,\r
    flicker,\r
    fade,\r
    opacity,\r
    lightMode,\r
    paused,\r
    dpr\r
  ]);\r
\r
  return <canvas ref={canvasRef} className={\`relative block h-full w-full \${className}\`.trim()} style={style} />;\r
};\r
\r
export default Lightning;\r
`,i={usage:`import Lightning from './Lightning';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <Lightning
    color="#4d6bff"
    bolts={1}
    spread={0.6}
    branches={0.5}
    xOffset={0}
    angle={0}
    size={1}
    thickness={1}
    glow={1}
    intensity={1}
    speed={1}
    flicker={0.6}
    mouseInteraction={true}
    mouseStrength={1}
    clickStrike={true}
    intro={true}
    fade={0}
    opacity={1}
    lightMode={false}
  />
</div>`,code:n,css:r,tailwind:e,tsCode:t,tsTailwind:o};export{i as lightning};
