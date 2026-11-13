const n=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
import './GradientBlinds.css';\r
\r
const MAX_COLORS = 8;\r
const MAX_WAVES = 4;\r
const INTRO_SECONDS = 1.8;\r
const RIPPLE_SECONDS = 1.6;\r
\r
const VERTEX = \`#version 300 es\r
void main() {\r
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\r
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
\r
uniform vec2 uResolution;\r
uniform float uTime;\r
uniform vec2 uMouse;\r
uniform float uAngle;\r
uniform float uNoise;\r
uniform float uBlindCount;\r
uniform float uSpotlightRadius;\r
uniform float uSpotlightSoftness;\r
uniform float uSpotlightOpacity;\r
uniform float uMirror;\r
uniform float uDistort;\r
uniform float uShineFlip;\r
uniform vec3 uColors[8];\r
uniform int uColorCount;\r
uniform float uLightMode;\r
uniform float uShine;\r
uniform float uRelief;\r
uniform float uGlow;\r
uniform float uSway;\r
uniform float uSwayTime;\r
uniform float uHover;\r
uniform vec4 uWaves[4];\r
uniform float uIntro;\r
uniform float uGrainTime;\r
uniform vec3 uLightColor;\r
uniform float uPerspective;\r
uniform float uGradientShift;\r
\r
out vec4 outColor;\r
\r
float hash(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * 0.1031);\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.x + q.y) * q.z);\r
}\r
\r
vec2 rotate2D(vec2 p, float a) {\r
  float c = cos(a);\r
  float s = sin(a);\r
  return mat2(c, -s, s, c) * p;\r
}\r
\r
vec2 blindSpace(vec2 uv0) {\r
  float aspect = uResolution.x / uResolution.y;\r
  vec2 p = uv0 * 2.0 - 1.0;\r
  p.x *= aspect;\r
  vec2 pr = rotate2D(p, uAngle);\r
  pr.x /= aspect;\r
  vec2 uv = pr * 0.5 + 0.5;\r
  if (abs(uPerspective) > 0.001) {\r
    float k = uPerspective * 2.2;\r
    uv.x = (exp(k * uv.x) - 1.0) / (exp(k) - 1.0);\r
  }\r
  if (uDistort > 0.0) {\r
    float a = uv.y * 6.0;\r
    float b = uv.x * 6.0;\r
    float w = 0.01 * uDistort;\r
    uv.x += sin(a) * w;\r
    uv.y += cos(b) * w;\r
  }\r
  return uv;\r
}\r
\r
vec3 gradientColor(float t) {\r
  float tt = clamp(t, 0.0, 1.0);\r
  int count = max(uColorCount, 2);\r
  float scaled = tt * float(count - 1);\r
  int seg = min(int(floor(scaled)), count - 2);\r
  float f = scaled - float(seg);\r
  if (tt >= 1.0) return uColors[count - 1];\r
  return mix(uColors[seg], uColors[seg + 1], f);\r
}\r
\r
void main() {\r
  vec2 frag = gl_FragCoord.xy;\r
  vec2 uv0 = frag / uResolution;\r
  vec2 uvMod = blindSpace(uv0);\r
\r
  float count = max(uBlindCount, 1.0);\r
  float stripePhase = uvMod.x * count;\r
  float pixel = max(fwidth(stripePhase), 1e-5);\r
\r
  float t = uvMod.x;\r
  if (uGradientShift != 0.0) {\r
    t = 1.0 - abs(1.0 - fract((t + uGradientShift) * 0.5) * 2.0);\r
  }\r
  if (uMirror > 0.5) {\r
    t = 1.0 - abs(1.0 - 2.0 * fract(t));\r
  }\r
  vec3 base = gradientColor(t);\r
\r
  vec2 offset = uMouse / uResolution;\r
  float d = length(uv0 - offset);\r
  float r = max(uSpotlightRadius, 1e-4);\r
  float spot = (1.0 - 2.0 * pow(d / r, uSpotlightSoftness)) * uSpotlightOpacity;\r
\r
  float slat = floor(stripePhase);\r
  float s = stripePhase - slat;\r
  float stripeAA = clamp(count * 1.25 / min(uResolution.x, uResolution.y), 0.001, 0.12);\r
  float edgeBlend = 1.0 - smoothstep(0.0, stripeAA, min(s, 1.0 - s));\r
  float across = mix(s, 0.5, edgeBlend);\r
  float ramp = uShineFlip > 0.5 ? 1.0 - across : across;\r
\r
  float unit = min(uResolution.x, uResolution.y);\r
  float reach = max(uSpotlightRadius, 0.05) * unit;\r
  vec2 toLight = uMouse - frag;\r
  float nearLight = exp(-dot(toLight, toLight) / (reach * reach));\r
\r
  float tilt = 0.0;\r
  float pulse = 0.0;\r
  if (uSway > 0.0) {\r
    tilt += uSway * 0.5 * sin(uSwayTime * 0.9 + slat * 0.55) * (0.6 + 0.4 * sin(uSwayTime * 0.37 + slat * 0.21));\r
  }\r
  tilt += uHover * nearLight * 0.7;\r
  float aspect = uResolution.x / uResolution.y;\r
  for (int i = 0; i < 4; i++) {\r
    vec4 wave = uWaves[i];\r
    if (wave.w <= 0.0) continue;\r
    float age = uTime - wave.z;\r
    if (age < 0.0 || age > \${RIPPLE_SECONDS.toFixed(2)}) continue;\r
    float life = age / \${RIPPLE_SECONDS.toFixed(2)};\r
    vec2 origin = blindSpace(wave.xy / uResolution);\r
    float slats = abs(slat + 0.5 - origin.x * count);\r
    float front = age * max(count, 4.0) * 0.95;\r
    float k = (slats - front) / (0.8 + life * 1.2);\r
    float along = (uvMod.y - origin.y) / max(0.42 + life * 0.5, 0.01);\r
    float fade = (1.0 - life) * (1.0 - life);\r
    float ring = exp(-k * k) * exp(-along * along) * fade * smoothstep(0.0, 0.2, age);\r
    tilt += ring * 0.9;\r
    pulse += ring;\r
  }\r
  if (uIntro < 1.0) {\r
    float settle = smoothstep(0.0, 1.0, clamp(uIntro * 1.5 - uv0.x * 0.5, 0.0, 1.0));\r
    tilt -= (1.0 - settle) * 1.2;\r
  }\r
\r
  float edge = ramp;\r
  float calm = 1.0 - 0.6 * clamp(spot, 0.0, 1.0);\r
  ramp = pow(clamp(ramp, 0.0, 1.0), exp(tilt * 0.9));\r
  ramp *= 1.0 - 0.3 * min(pulse, 1.0) * calm;\r
  float crease = uRelief * 0.38 * smoothstep(0.62, 1.0, ramp);\r
  float sheen = uShine * exp(-pow((edge - 0.035) / 0.07, 2.0)) * (0.3 + 0.7 * nearLight) * (1.0 - edgeBlend);\r
\r
  vec3 lit = spot > 0.0 ? uLightColor * spot : vec3(spot);\r
  lit += uLightColor * min(pulse, 1.0) * 0.35 * calm;\r
  vec3 revealSignal = lit + base - vec3(ramp + crease);\r
\r
  vec3 col;\r
  if (uLightMode > 0.5) {\r
    vec3 luma = vec3(0.2126, 0.7152, 0.0722);\r
    float peak = max(base.r, max(base.g, base.b));\r
    float low = min(base.r, min(base.g, base.b));\r
    float chroma = (peak - low) / max(peak, 0.0001);\r
    vec3 hue = base / max(peak, 0.0001);\r
    hue = clamp(mix(vec3(dot(hue, luma)), hue, 1.3), 0.0, 1.0);\r
    hue *= mix(1.0, 0.82, smoothstep(0.55, 0.9, dot(hue, luma)));\r
    vec3 tint = mix(base, hue, smoothstep(0.06, 0.28, chroma));\r
    vec3 revealed = clamp(revealSignal, 0.0, 1.0);\r
    float coverage = max(revealed.r, max(revealed.g, revealed.b));\r
    float stroke = 1.0 - smoothstep(pixel, pixel * 2.2, edge);\r
    col = mix(vec3(1.0), tint, 0.72 * smoothstep(0.0, 1.0, coverage));\r
    col = mix(col, tint * 0.85, stroke * clamp(coverage * 1.5, 0.0, 1.0) * 0.7);\r
    col = mix(col, vec3(1.0), clamp(sheen, 0.0, 1.0) * 0.5);\r
    float grain = max(0.5 * (hash(frag + uGrainTime) + hash(frag.yx + uGrainTime * 1.7)) - 0.5, 0.0);\r
    col = clamp(col - vec3(grain * uNoise * 0.12 * coverage), 0.0, 1.0);\r
  } else {\r
    vec3 haze = base * uGlow * 0.4 * smoothstep(0.0, 1.0, spot) * (0.4 + 0.6 * ramp);\r
    col = revealSignal + haze + mix(base, uLightColor, 0.45) * sheen * 0.7;\r
    vec3 over = max(col - 0.8, 0.0);\r
    col = min(col, vec3(0.8)) + 0.2 * (1.0 - exp(-over / 0.2));\r
    float luma = dot(clamp(col, 0.0, 1.0), vec3(0.2126, 0.7152, 0.0722));\r
    float grain = 0.5 * (hash(frag + uGrainTime) + hash(frag.yx + uGrainTime * 1.7)) - 0.5;\r
    col += grain * uNoise * (0.45 + 0.55 * smoothstep(0.0, 0.5, luma));\r
  }\r
\r
  float presence = smoothstep(0.0, 0.65, uIntro);\r
  col = uLightMode > 0.5 ? mix(vec3(1.0), col, presence) : col * presence;\r
  outColor = vec4(clamp(col, 0.0, 1.0), 1.0);\r
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
const link = gl => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
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
    if (!info) continue;\r
    const name = info.name.replace(/\\[0\\]$/, '');\r
    uniforms[name] = gl.getUniformLocation(program, name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const hexToRGB = hex => {\r
  const c = String(hex || '')\r
    .replace('#', '')\r
    .padEnd(6, '0');\r
  const r = parseInt(c.slice(0, 2), 16) / 255;\r
  const g = parseInt(c.slice(2, 4), 16) / 255;\r
  const b = parseInt(c.slice(4, 6), 16) / 255;\r
  return [r || 0, g || 0, b || 0];\r
};\r
\r
const prepStops = stops => {\r
  const base = (stops && stops.length ? stops : ['#FF9FFC', '#5227FF']).slice(0, MAX_COLORS);\r
  if (base.length === 1) base.push(base[0]);\r
  while (base.length < MAX_COLORS) base.push(base[base.length - 1]);\r
  const flat = new Float32Array(MAX_COLORS * 3);\r
  for (let i = 0; i < MAX_COLORS; i++) flat.set(hexToRGB(base[i]), i * 3);\r
  const count = Math.max(2, Math.min(MAX_COLORS, stops?.length ?? 2));\r
  return { flat, count };\r
};\r
\r
const GradientBlinds = ({\r
  className = '',\r
  style,\r
  dpr,\r
  paused = false,\r
  gradientColors,\r
  angle = 0,\r
  noise = 0.3,\r
  blindCount = 16,\r
  blindMinWidth = 60,\r
  mouseDampening = 0.15,\r
  mirrorGradient = false,\r
  spotlightRadius = 0.5,\r
  spotlightSoftness = 1,\r
  spotlightOpacity = 1,\r
  distortAmount = 0,\r
  shineDirection = 'left',\r
  lightColor = '#ffffff',\r
  perspective = 0,\r
  gradientSpeed = 0,\r
  shine = 0.4,\r
  relief = 0.5,\r
  glow = 0.4,\r
  sway = 0.35,\r
  speed = 1,\r
  hoverTilt = 0.6,\r
  clickEffect = 'ripple',\r
  idle = 'drift',\r
  intro = true,\r
  mixBlendMode = 'lighten',\r
  lightMode = false\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const colorKey = (gradientColors && gradientColors.length ? gradientColors : ['#FF9FFC', '#5227FF']).join(',');\r
  const settings = {\r
    paused,\r
    colorKey,\r
    gradientColors,\r
    angle,\r
    noise: clamp(noise, 0, 2),\r
    blindCount: Math.max(1, blindCount || 1),\r
    blindMinWidth,\r
    mouseDampening: Math.max(0, mouseDampening),\r
    mirrorGradient,\r
    spotlightRadius,\r
    spotlightSoftness,\r
    spotlightOpacity,\r
    distortAmount,\r
    shineDirection,\r
    lightColor,\r
    perspective: clamp(perspective, -1, 1),\r
    gradientSpeed,\r
    shine: clamp(shine, 0, 2),\r
    relief: clamp(relief, 0, 1),\r
    glow: clamp(glow, 0, 2),\r
    sway: clamp(sway, 0, 1),\r
    speed: clamp(speed, 0, 4),\r
    hoverTilt: clamp(hoverTilt, 0, 1.5),\r
    clickEffect,\r
    idle,\r
    intro,\r
    lightMode,\r
    dpr\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    const gl = canvas?.getContext('webgl2', {\r
      alpha: false,\r
      antialias: false,\r
      depth: false,\r
      stencil: false,\r
      premultipliedAlpha: false\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
    const shader = link(gl);\r
    if (!shader) return undefined;\r
    const u = shader.uniforms;\r
    const vao = gl.createVertexArray();\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1, ratio: 1, count: 1 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const light = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, ready: false };\r
    const waves = new Float32Array(MAX_WAVES * 4);\r
    let waveIndex = 0;\r
    let hover = 0;\r
    let time = 0;\r
    let swayTime = 0;\r
    let shift = 0;\r
    let grainTime = 0;\r
    let introClock = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let colorKeyCache = '';\r
    let colorStops = prepStops(settingsRef.current.gradientColors);\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const blindTotal = s => {\r
      if (s.blindMinWidth && s.blindMinWidth > 0) {\r
        const byWidth = Math.max(1, Math.floor(view.width / s.blindMinWidth));\r
        return Math.max(1, s.blindCount ? Math.min(s.blindCount, byWidth) : byWidth);\r
      }\r
      return Math.max(1, s.blindCount);\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      if (colorKeyCache !== s.colorKey) {\r
        colorStops = prepStops(s.gradientColors);\r
        colorKeyCache = s.colorKey;\r
      }\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(shader.program);\r
      gl.bindVertexArray(vao);\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(u.uTime, time);\r
      gl.uniform2f(u.uMouse, light.x * view.ratio, (view.height - light.y) * view.ratio);\r
      gl.uniform1f(u.uAngle, (s.angle * Math.PI) / 180);\r
      gl.uniform1f(u.uNoise, s.noise);\r
      gl.uniform1f(u.uBlindCount, blindTotal(s));\r
      gl.uniform1f(u.uSpotlightRadius, s.spotlightRadius);\r
      gl.uniform1f(u.uSpotlightSoftness, s.spotlightSoftness);\r
      gl.uniform1f(u.uSpotlightOpacity, s.spotlightOpacity);\r
      gl.uniform1f(u.uMirror, s.mirrorGradient ? 1 : 0);\r
      gl.uniform1f(u.uDistort, s.distortAmount);\r
      gl.uniform1f(u.uShineFlip, s.shineDirection === 'right' ? 1 : 0);\r
      gl.uniform3fv(u.uColors, colorStops.flat);\r
      gl.uniform1i(u.uColorCount, colorStops.count);\r
      gl.uniform1f(u.uLightMode, s.lightMode ? 1 : 0);\r
      gl.uniform1f(u.uShine, s.shine);\r
      gl.uniform1f(u.uRelief, s.relief);\r
      gl.uniform1f(u.uGlow, s.glow);\r
      gl.uniform1f(u.uSway, reduce ? 0 : s.sway);\r
      gl.uniform1f(u.uSwayTime, swayTime);\r
      gl.uniform1f(u.uHover, hover * s.hoverTilt);\r
      gl.uniform4fv(u.uWaves, waves);\r
      gl.uniform1f(u.uIntro, introClock);\r
      gl.uniform1f(u.uGrainTime, grainTime);\r
      gl.uniform3fv(u.uLightColor, hexToRGB(s.lightColor || '#ffffff'));\r
      gl.uniform1f(u.uPerspective, s.perspective);\r
      gl.uniform1f(u.uGradientShift, shift);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const aim = s => {\r
      if (pointer.inside) {\r
        light.tx = pointer.x;\r
        light.ty = pointer.y;\r
      } else if (s.idle === 'center') {\r
        light.tx = view.width / 2;\r
        light.ty = view.height / 2;\r
      } else if (s.idle === 'drift' && !reduce) {\r
        light.tx = view.width * (0.5 + 0.22 * Math.sin(swayTime * 0.23) + 0.05 * Math.sin(swayTime * 0.61 + 1.3));\r
        light.ty = view.height * (0.5 + 0.16 * Math.sin(swayTime * 0.31 + 0.7) + 0.04 * Math.sin(swayTime * 0.83));\r
      }\r
    };\r
\r
    const follow = (s, dt) => {\r
      const tau = s.mouseDampening;\r
      if (tau <= 0) {\r
        light.x = light.tx;\r
        light.y = light.ty;\r
        light.vx = 0;\r
        light.vy = 0;\r
        return;\r
      }\r
      const omega = 2.4 / tau;\r
      const k = omega * omega;\r
      const c = 2 * omega;\r
      const steps = Math.max(1, Math.ceil(dt / 0.008));\r
      const h = dt / steps;\r
      for (let i = 0; i < steps; i++) {\r
        light.vx += (k * (light.tx - light.x) - c * light.vx) * h;\r
        light.vy += (k * (light.ty - light.y) - c * light.vy) * h;\r
        light.x += light.vx * h;\r
        light.y += light.vy * h;\r
      }\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      view.width = Math.max(1, container.clientWidth);\r
      view.height = Math.max(1, container.clientHeight);\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(view.width * view.ratio));\r
      canvas.height = Math.max(1, Math.round(view.height * view.ratio));\r
      if (!light.ready) {\r
        light.ready = true;\r
        light.x = light.tx = view.width / 2;\r
        light.y = light.ty = view.height / 2;\r
      }\r
      draw();\r
      wake();\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.001, 1 / 20) : 1 / 60;\r
      last = now;\r
      if (s.paused) return;\r
      time += dt;\r
      if (!reduce) {\r
        swayTime += dt * s.speed;\r
        shift = (shift + dt * s.gradientSpeed * 0.06) % 2;\r
      }\r
      grainTime = Math.floor(time * 24) * 17.13;\r
      if (introClock < 1) introClock = Math.min(1, introClock + dt / INTRO_SECONDS);\r
      hover += ((pointer.inside ? 1 : 0) - hover) * (1 - Math.exp(-dt / 0.35));\r
      aim(s);\r
      follow(s, dt);\r
      for (let i = 0; i < MAX_WAVES; i++) {\r
        if (waves[i * 4 + 3] > 0 && time - waves[i * 4 + 2] > RIPPLE_SECONDS) waves[i * 4 + 3] = 0;\r
      }\r
      draw();\r
      const settling =\r
        Math.abs(light.tx - light.x) > 0.05 ||\r
        Math.abs(light.ty - light.y) > 0.05 ||\r
        Math.abs(light.vx) + Math.abs(light.vy) > 0.05 ||\r
        Math.abs((pointer.inside ? 1 : 0) - hover) > 0.002;\r
      const active =\r
        settling ||\r
        introClock < 1 ||\r
        waves.some((value, index) => index % 4 === 3 && value > 0) ||\r
        (!reduce &&\r
          (s.noise > 0 ||\r
            s.gradientSpeed !== 0 ||\r
            (s.sway > 0 && s.speed > 0) ||\r
            (s.idle === 'drift' && !pointer.inside)));\r
      if (active) raf = requestAnimationFrame(frame);\r
    };\r
\r
    function wake() {\r
      if (!raf && visible && !document.hidden) {\r
        last = 0;\r
        raf = requestAnimationFrame(frame);\r
      }\r
    }\r
\r
    const locate = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };\r
    };\r
\r
    const onPointerMove = event => {\r
      const { x, y, inside } = locate(event);\r
      pointer.x = x;\r
      pointer.y = y;\r
      pointer.inside = inside;\r
      if (inside) wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      const { x, y, inside } = locate(event);\r
      if (!inside || reduce || s.clickEffect !== 'ripple') return;\r
      const o = waveIndex * 4;\r
      waves[o] = x * view.ratio;\r
      waves[o + 1] = (view.height - y) * view.ratio;\r
      waves[o + 2] = time;\r
      waves[o + 3] = 1;\r
      waveIndex = (waveIndex + 1) % MAX_WAVES;\r
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
      if (visible) wake();\r
    });\r
    intersection.observe(container);\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
    wakeRef.current = wake;\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(shader.program);\r
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
      className={\`gradient-blinds-container\${className ? \` \${className}\` : ''}\`}\r
      style={{ ...(!lightMode && mixBlendMode ? { mixBlendMode } : null), ...style }}\r
    >\r
      <canvas ref={canvasRef} className="gradient-blinds-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default GradientBlinds;\r
`,r=`.gradient-blinds-container {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.gradient-blinds-canvas {\r
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
const MAX_COLORS = 8;\r
const MAX_WAVES = 4;\r
const INTRO_SECONDS = 1.8;\r
const RIPPLE_SECONDS = 1.6;\r
\r
const VERTEX = \`#version 300 es\r
void main() {\r
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\r
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
\r
uniform vec2 uResolution;\r
uniform float uTime;\r
uniform vec2 uMouse;\r
uniform float uAngle;\r
uniform float uNoise;\r
uniform float uBlindCount;\r
uniform float uSpotlightRadius;\r
uniform float uSpotlightSoftness;\r
uniform float uSpotlightOpacity;\r
uniform float uMirror;\r
uniform float uDistort;\r
uniform float uShineFlip;\r
uniform vec3 uColors[8];\r
uniform int uColorCount;\r
uniform float uLightMode;\r
uniform float uShine;\r
uniform float uRelief;\r
uniform float uGlow;\r
uniform float uSway;\r
uniform float uSwayTime;\r
uniform float uHover;\r
uniform vec4 uWaves[4];\r
uniform float uIntro;\r
uniform float uGrainTime;\r
uniform vec3 uLightColor;\r
uniform float uPerspective;\r
uniform float uGradientShift;\r
\r
out vec4 outColor;\r
\r
float hash(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * 0.1031);\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.x + q.y) * q.z);\r
}\r
\r
vec2 rotate2D(vec2 p, float a) {\r
  float c = cos(a);\r
  float s = sin(a);\r
  return mat2(c, -s, s, c) * p;\r
}\r
\r
vec2 blindSpace(vec2 uv0) {\r
  float aspect = uResolution.x / uResolution.y;\r
  vec2 p = uv0 * 2.0 - 1.0;\r
  p.x *= aspect;\r
  vec2 pr = rotate2D(p, uAngle);\r
  pr.x /= aspect;\r
  vec2 uv = pr * 0.5 + 0.5;\r
  if (abs(uPerspective) > 0.001) {\r
    float k = uPerspective * 2.2;\r
    uv.x = (exp(k * uv.x) - 1.0) / (exp(k) - 1.0);\r
  }\r
  if (uDistort > 0.0) {\r
    float a = uv.y * 6.0;\r
    float b = uv.x * 6.0;\r
    float w = 0.01 * uDistort;\r
    uv.x += sin(a) * w;\r
    uv.y += cos(b) * w;\r
  }\r
  return uv;\r
}\r
\r
vec3 gradientColor(float t) {\r
  float tt = clamp(t, 0.0, 1.0);\r
  int count = max(uColorCount, 2);\r
  float scaled = tt * float(count - 1);\r
  int seg = min(int(floor(scaled)), count - 2);\r
  float f = scaled - float(seg);\r
  if (tt >= 1.0) return uColors[count - 1];\r
  return mix(uColors[seg], uColors[seg + 1], f);\r
}\r
\r
void main() {\r
  vec2 frag = gl_FragCoord.xy;\r
  vec2 uv0 = frag / uResolution;\r
  vec2 uvMod = blindSpace(uv0);\r
\r
  float count = max(uBlindCount, 1.0);\r
  float stripePhase = uvMod.x * count;\r
  float pixel = max(fwidth(stripePhase), 1e-5);\r
\r
  float t = uvMod.x;\r
  if (uGradientShift != 0.0) {\r
    t = 1.0 - abs(1.0 - fract((t + uGradientShift) * 0.5) * 2.0);\r
  }\r
  if (uMirror > 0.5) {\r
    t = 1.0 - abs(1.0 - 2.0 * fract(t));\r
  }\r
  vec3 base = gradientColor(t);\r
\r
  vec2 offset = uMouse / uResolution;\r
  float d = length(uv0 - offset);\r
  float r = max(uSpotlightRadius, 1e-4);\r
  float spot = (1.0 - 2.0 * pow(d / r, uSpotlightSoftness)) * uSpotlightOpacity;\r
\r
  float slat = floor(stripePhase);\r
  float s = stripePhase - slat;\r
  float stripeAA = clamp(count * 1.25 / min(uResolution.x, uResolution.y), 0.001, 0.12);\r
  float edgeBlend = 1.0 - smoothstep(0.0, stripeAA, min(s, 1.0 - s));\r
  float across = mix(s, 0.5, edgeBlend);\r
  float ramp = uShineFlip > 0.5 ? 1.0 - across : across;\r
\r
  float unit = min(uResolution.x, uResolution.y);\r
  float reach = max(uSpotlightRadius, 0.05) * unit;\r
  vec2 toLight = uMouse - frag;\r
  float nearLight = exp(-dot(toLight, toLight) / (reach * reach));\r
\r
  float tilt = 0.0;\r
  float pulse = 0.0;\r
  if (uSway > 0.0) {\r
    tilt += uSway * 0.5 * sin(uSwayTime * 0.9 + slat * 0.55) * (0.6 + 0.4 * sin(uSwayTime * 0.37 + slat * 0.21));\r
  }\r
  tilt += uHover * nearLight * 0.7;\r
  float aspect = uResolution.x / uResolution.y;\r
  for (int i = 0; i < 4; i++) {\r
    vec4 wave = uWaves[i];\r
    if (wave.w <= 0.0) continue;\r
    float age = uTime - wave.z;\r
    if (age < 0.0 || age > \${RIPPLE_SECONDS.toFixed(2)}) continue;\r
    float life = age / \${RIPPLE_SECONDS.toFixed(2)};\r
    vec2 origin = blindSpace(wave.xy / uResolution);\r
    float slats = abs(slat + 0.5 - origin.x * count);\r
    float front = age * max(count, 4.0) * 0.95;\r
    float k = (slats - front) / (0.8 + life * 1.2);\r
    float along = (uvMod.y - origin.y) / max(0.42 + life * 0.5, 0.01);\r
    float fade = (1.0 - life) * (1.0 - life);\r
    float ring = exp(-k * k) * exp(-along * along) * fade * smoothstep(0.0, 0.2, age);\r
    tilt += ring * 0.9;\r
    pulse += ring;\r
  }\r
  if (uIntro < 1.0) {\r
    float settle = smoothstep(0.0, 1.0, clamp(uIntro * 1.5 - uv0.x * 0.5, 0.0, 1.0));\r
    tilt -= (1.0 - settle) * 1.2;\r
  }\r
\r
  float edge = ramp;\r
  float calm = 1.0 - 0.6 * clamp(spot, 0.0, 1.0);\r
  ramp = pow(clamp(ramp, 0.0, 1.0), exp(tilt * 0.9));\r
  ramp *= 1.0 - 0.3 * min(pulse, 1.0) * calm;\r
  float crease = uRelief * 0.38 * smoothstep(0.62, 1.0, ramp);\r
  float sheen = uShine * exp(-pow((edge - 0.035) / 0.07, 2.0)) * (0.3 + 0.7 * nearLight) * (1.0 - edgeBlend);\r
\r
  vec3 lit = spot > 0.0 ? uLightColor * spot : vec3(spot);\r
  lit += uLightColor * min(pulse, 1.0) * 0.35 * calm;\r
  vec3 revealSignal = lit + base - vec3(ramp + crease);\r
\r
  vec3 col;\r
  if (uLightMode > 0.5) {\r
    vec3 luma = vec3(0.2126, 0.7152, 0.0722);\r
    float peak = max(base.r, max(base.g, base.b));\r
    float low = min(base.r, min(base.g, base.b));\r
    float chroma = (peak - low) / max(peak, 0.0001);\r
    vec3 hue = base / max(peak, 0.0001);\r
    hue = clamp(mix(vec3(dot(hue, luma)), hue, 1.3), 0.0, 1.0);\r
    hue *= mix(1.0, 0.82, smoothstep(0.55, 0.9, dot(hue, luma)));\r
    vec3 tint = mix(base, hue, smoothstep(0.06, 0.28, chroma));\r
    vec3 revealed = clamp(revealSignal, 0.0, 1.0);\r
    float coverage = max(revealed.r, max(revealed.g, revealed.b));\r
    float stroke = 1.0 - smoothstep(pixel, pixel * 2.2, edge);\r
    col = mix(vec3(1.0), tint, 0.72 * smoothstep(0.0, 1.0, coverage));\r
    col = mix(col, tint * 0.85, stroke * clamp(coverage * 1.5, 0.0, 1.0) * 0.7);\r
    col = mix(col, vec3(1.0), clamp(sheen, 0.0, 1.0) * 0.5);\r
    float grain = max(0.5 * (hash(frag + uGrainTime) + hash(frag.yx + uGrainTime * 1.7)) - 0.5, 0.0);\r
    col = clamp(col - vec3(grain * uNoise * 0.12 * coverage), 0.0, 1.0);\r
  } else {\r
    vec3 haze = base * uGlow * 0.4 * smoothstep(0.0, 1.0, spot) * (0.4 + 0.6 * ramp);\r
    col = revealSignal + haze + mix(base, uLightColor, 0.45) * sheen * 0.7;\r
    vec3 over = max(col - 0.8, 0.0);\r
    col = min(col, vec3(0.8)) + 0.2 * (1.0 - exp(-over / 0.2));\r
    float luma = dot(clamp(col, 0.0, 1.0), vec3(0.2126, 0.7152, 0.0722));\r
    float grain = 0.5 * (hash(frag + uGrainTime) + hash(frag.yx + uGrainTime * 1.7)) - 0.5;\r
    col += grain * uNoise * (0.45 + 0.55 * smoothstep(0.0, 0.5, luma));\r
  }\r
\r
  float presence = smoothstep(0.0, 0.65, uIntro);\r
  col = uLightMode > 0.5 ? mix(vec3(1.0), col, presence) : col * presence;\r
  outColor = vec4(clamp(col, 0.0, 1.0), 1.0);\r
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
const link = gl => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
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
    if (!info) continue;\r
    const name = info.name.replace(/\\[0\\]$/, '');\r
    uniforms[name] = gl.getUniformLocation(program, name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const hexToRGB = hex => {\r
  const c = String(hex || '')\r
    .replace('#', '')\r
    .padEnd(6, '0');\r
  const r = parseInt(c.slice(0, 2), 16) / 255;\r
  const g = parseInt(c.slice(2, 4), 16) / 255;\r
  const b = parseInt(c.slice(4, 6), 16) / 255;\r
  return [r || 0, g || 0, b || 0];\r
};\r
\r
const prepStops = stops => {\r
  const base = (stops && stops.length ? stops : ['#FF9FFC', '#5227FF']).slice(0, MAX_COLORS);\r
  if (base.length === 1) base.push(base[0]);\r
  while (base.length < MAX_COLORS) base.push(base[base.length - 1]);\r
  const flat = new Float32Array(MAX_COLORS * 3);\r
  for (let i = 0; i < MAX_COLORS; i++) flat.set(hexToRGB(base[i]), i * 3);\r
  const count = Math.max(2, Math.min(MAX_COLORS, stops?.length ?? 2));\r
  return { flat, count };\r
};\r
\r
const GradientBlinds = ({\r
  className = '',\r
  style,\r
  dpr,\r
  paused = false,\r
  gradientColors,\r
  angle = 0,\r
  noise = 0.3,\r
  blindCount = 16,\r
  blindMinWidth = 60,\r
  mouseDampening = 0.15,\r
  mirrorGradient = false,\r
  spotlightRadius = 0.5,\r
  spotlightSoftness = 1,\r
  spotlightOpacity = 1,\r
  distortAmount = 0,\r
  shineDirection = 'left',\r
  lightColor = '#ffffff',\r
  perspective = 0,\r
  gradientSpeed = 0,\r
  shine = 0.4,\r
  relief = 0.5,\r
  glow = 0.4,\r
  sway = 0.35,\r
  speed = 1,\r
  hoverTilt = 0.6,\r
  clickEffect = 'ripple',\r
  idle = 'drift',\r
  intro = true,\r
  mixBlendMode = 'lighten',\r
  lightMode = false\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const colorKey = (gradientColors && gradientColors.length ? gradientColors : ['#FF9FFC', '#5227FF']).join(',');\r
  const settings = {\r
    paused,\r
    colorKey,\r
    gradientColors,\r
    angle,\r
    noise: clamp(noise, 0, 2),\r
    blindCount: Math.max(1, blindCount || 1),\r
    blindMinWidth,\r
    mouseDampening: Math.max(0, mouseDampening),\r
    mirrorGradient,\r
    spotlightRadius,\r
    spotlightSoftness,\r
    spotlightOpacity,\r
    distortAmount,\r
    shineDirection,\r
    lightColor,\r
    perspective: clamp(perspective, -1, 1),\r
    gradientSpeed,\r
    shine: clamp(shine, 0, 2),\r
    relief: clamp(relief, 0, 1),\r
    glow: clamp(glow, 0, 2),\r
    sway: clamp(sway, 0, 1),\r
    speed: clamp(speed, 0, 4),\r
    hoverTilt: clamp(hoverTilt, 0, 1.5),\r
    clickEffect,\r
    idle,\r
    intro,\r
    lightMode,\r
    dpr\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    const gl = canvas?.getContext('webgl2', {\r
      alpha: false,\r
      antialias: false,\r
      depth: false,\r
      stencil: false,\r
      premultipliedAlpha: false\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
    const shader = link(gl);\r
    if (!shader) return undefined;\r
    const u = shader.uniforms;\r
    const vao = gl.createVertexArray();\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1, ratio: 1, count: 1 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const light = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, ready: false };\r
    const waves = new Float32Array(MAX_WAVES * 4);\r
    let waveIndex = 0;\r
    let hover = 0;\r
    let time = 0;\r
    let swayTime = 0;\r
    let shift = 0;\r
    let grainTime = 0;\r
    let introClock = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let colorKeyCache = '';\r
    let colorStops = prepStops(settingsRef.current.gradientColors);\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const blindTotal = s => {\r
      if (s.blindMinWidth && s.blindMinWidth > 0) {\r
        const byWidth = Math.max(1, Math.floor(view.width / s.blindMinWidth));\r
        return Math.max(1, s.blindCount ? Math.min(s.blindCount, byWidth) : byWidth);\r
      }\r
      return Math.max(1, s.blindCount);\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      if (colorKeyCache !== s.colorKey) {\r
        colorStops = prepStops(s.gradientColors);\r
        colorKeyCache = s.colorKey;\r
      }\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(shader.program);\r
      gl.bindVertexArray(vao);\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(u.uTime, time);\r
      gl.uniform2f(u.uMouse, light.x * view.ratio, (view.height - light.y) * view.ratio);\r
      gl.uniform1f(u.uAngle, (s.angle * Math.PI) / 180);\r
      gl.uniform1f(u.uNoise, s.noise);\r
      gl.uniform1f(u.uBlindCount, blindTotal(s));\r
      gl.uniform1f(u.uSpotlightRadius, s.spotlightRadius);\r
      gl.uniform1f(u.uSpotlightSoftness, s.spotlightSoftness);\r
      gl.uniform1f(u.uSpotlightOpacity, s.spotlightOpacity);\r
      gl.uniform1f(u.uMirror, s.mirrorGradient ? 1 : 0);\r
      gl.uniform1f(u.uDistort, s.distortAmount);\r
      gl.uniform1f(u.uShineFlip, s.shineDirection === 'right' ? 1 : 0);\r
      gl.uniform3fv(u.uColors, colorStops.flat);\r
      gl.uniform1i(u.uColorCount, colorStops.count);\r
      gl.uniform1f(u.uLightMode, s.lightMode ? 1 : 0);\r
      gl.uniform1f(u.uShine, s.shine);\r
      gl.uniform1f(u.uRelief, s.relief);\r
      gl.uniform1f(u.uGlow, s.glow);\r
      gl.uniform1f(u.uSway, reduce ? 0 : s.sway);\r
      gl.uniform1f(u.uSwayTime, swayTime);\r
      gl.uniform1f(u.uHover, hover * s.hoverTilt);\r
      gl.uniform4fv(u.uWaves, waves);\r
      gl.uniform1f(u.uIntro, introClock);\r
      gl.uniform1f(u.uGrainTime, grainTime);\r
      gl.uniform3fv(u.uLightColor, hexToRGB(s.lightColor || '#ffffff'));\r
      gl.uniform1f(u.uPerspective, s.perspective);\r
      gl.uniform1f(u.uGradientShift, shift);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const aim = s => {\r
      if (pointer.inside) {\r
        light.tx = pointer.x;\r
        light.ty = pointer.y;\r
      } else if (s.idle === 'center') {\r
        light.tx = view.width / 2;\r
        light.ty = view.height / 2;\r
      } else if (s.idle === 'drift' && !reduce) {\r
        light.tx = view.width * (0.5 + 0.22 * Math.sin(swayTime * 0.23) + 0.05 * Math.sin(swayTime * 0.61 + 1.3));\r
        light.ty = view.height * (0.5 + 0.16 * Math.sin(swayTime * 0.31 + 0.7) + 0.04 * Math.sin(swayTime * 0.83));\r
      }\r
    };\r
\r
    const follow = (s, dt) => {\r
      const tau = s.mouseDampening;\r
      if (tau <= 0) {\r
        light.x = light.tx;\r
        light.y = light.ty;\r
        light.vx = 0;\r
        light.vy = 0;\r
        return;\r
      }\r
      const omega = 2.4 / tau;\r
      const k = omega * omega;\r
      const c = 2 * omega;\r
      const steps = Math.max(1, Math.ceil(dt / 0.008));\r
      const h = dt / steps;\r
      for (let i = 0; i < steps; i++) {\r
        light.vx += (k * (light.tx - light.x) - c * light.vx) * h;\r
        light.vy += (k * (light.ty - light.y) - c * light.vy) * h;\r
        light.x += light.vx * h;\r
        light.y += light.vy * h;\r
      }\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      view.width = Math.max(1, container.clientWidth);\r
      view.height = Math.max(1, container.clientHeight);\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(view.width * view.ratio));\r
      canvas.height = Math.max(1, Math.round(view.height * view.ratio));\r
      if (!light.ready) {\r
        light.ready = true;\r
        light.x = light.tx = view.width / 2;\r
        light.y = light.ty = view.height / 2;\r
      }\r
      draw();\r
      wake();\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.001, 1 / 20) : 1 / 60;\r
      last = now;\r
      if (s.paused) return;\r
      time += dt;\r
      if (!reduce) {\r
        swayTime += dt * s.speed;\r
        shift = (shift + dt * s.gradientSpeed * 0.06) % 2;\r
      }\r
      grainTime = Math.floor(time * 24) * 17.13;\r
      if (introClock < 1) introClock = Math.min(1, introClock + dt / INTRO_SECONDS);\r
      hover += ((pointer.inside ? 1 : 0) - hover) * (1 - Math.exp(-dt / 0.35));\r
      aim(s);\r
      follow(s, dt);\r
      for (let i = 0; i < MAX_WAVES; i++) {\r
        if (waves[i * 4 + 3] > 0 && time - waves[i * 4 + 2] > RIPPLE_SECONDS) waves[i * 4 + 3] = 0;\r
      }\r
      draw();\r
      const settling =\r
        Math.abs(light.tx - light.x) > 0.05 ||\r
        Math.abs(light.ty - light.y) > 0.05 ||\r
        Math.abs(light.vx) + Math.abs(light.vy) > 0.05 ||\r
        Math.abs((pointer.inside ? 1 : 0) - hover) > 0.002;\r
      const active =\r
        settling ||\r
        introClock < 1 ||\r
        waves.some((value, index) => index % 4 === 3 && value > 0) ||\r
        (!reduce &&\r
          (s.noise > 0 ||\r
            s.gradientSpeed !== 0 ||\r
            (s.sway > 0 && s.speed > 0) ||\r
            (s.idle === 'drift' && !pointer.inside)));\r
      if (active) raf = requestAnimationFrame(frame);\r
    };\r
\r
    function wake() {\r
      if (!raf && visible && !document.hidden) {\r
        last = 0;\r
        raf = requestAnimationFrame(frame);\r
      }\r
    }\r
\r
    const locate = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };\r
    };\r
\r
    const onPointerMove = event => {\r
      const { x, y, inside } = locate(event);\r
      pointer.x = x;\r
      pointer.y = y;\r
      pointer.inside = inside;\r
      if (inside) wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      const { x, y, inside } = locate(event);\r
      if (!inside || reduce || s.clickEffect !== 'ripple') return;\r
      const o = waveIndex * 4;\r
      waves[o] = x * view.ratio;\r
      waves[o + 1] = (view.height - y) * view.ratio;\r
      waves[o + 2] = time;\r
      waves[o + 3] = 1;\r
      waveIndex = (waveIndex + 1) % MAX_WAVES;\r
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
      if (visible) wake();\r
    });\r
    intersection.observe(container);\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
    wakeRef.current = wake;\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(shader.program);\r
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
      style={{ ...(!lightMode && mixBlendMode ? { mixBlendMode } : null), ...style }}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default GradientBlinds;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties } from 'react';\r
import './GradientBlinds.css';\r
\r
export type BlindsShineDirection = 'left' | 'right';\r
export type BlindsClickEffect = 'ripple' | 'none';\r
export type BlindsIdle = 'drift' | 'center' | 'stay';\r
\r
export interface GradientBlindsProps {\r
  className?: string;\r
  style?: CSSProperties;\r
  dpr?: number;\r
  paused?: boolean;\r
  gradientColors?: string[];\r
  angle?: number;\r
  noise?: number;\r
  blindCount?: number;\r
  blindMinWidth?: number;\r
  mouseDampening?: number;\r
  mirrorGradient?: boolean;\r
  spotlightRadius?: number;\r
  spotlightSoftness?: number;\r
  spotlightOpacity?: number;\r
  distortAmount?: number;\r
  shineDirection?: BlindsShineDirection;\r
  lightColor?: string;\r
  perspective?: number;\r
  gradientSpeed?: number;\r
  shine?: number;\r
  relief?: number;\r
  glow?: number;\r
  sway?: number;\r
  speed?: number;\r
  hoverTilt?: number;\r
  clickEffect?: BlindsClickEffect;\r
  idle?: BlindsIdle;\r
  intro?: boolean;\r
  mixBlendMode?: CSSProperties['mixBlendMode'];\r
  lightMode?: boolean;\r
}\r
\r
type Settings = {\r
  paused: boolean;\r
  colorKey: string;\r
  gradientColors?: string[];\r
  angle: number;\r
  noise: number;\r
  blindCount: number;\r
  blindMinWidth: number;\r
  mouseDampening: number;\r
  mirrorGradient: boolean;\r
  spotlightRadius: number;\r
  spotlightSoftness: number;\r
  spotlightOpacity: number;\r
  distortAmount: number;\r
  shineDirection: BlindsShineDirection;\r
  lightColor: string;\r
  perspective: number;\r
  gradientSpeed: number;\r
  shine: number;\r
  relief: number;\r
  glow: number;\r
  sway: number;\r
  speed: number;\r
  hoverTilt: number;\r
  clickEffect: BlindsClickEffect;\r
  idle: BlindsIdle;\r
  intro: boolean;\r
  lightMode: boolean;\r
  dpr?: number;\r
};\r
\r
type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };\r
\r
const MAX_COLORS = 8;\r
const MAX_WAVES = 4;\r
const INTRO_SECONDS = 1.8;\r
const RIPPLE_SECONDS = 1.6;\r
\r
const VERTEX = \`#version 300 es\r
void main() {\r
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\r
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
\r
uniform vec2 uResolution;\r
uniform float uTime;\r
uniform vec2 uMouse;\r
uniform float uAngle;\r
uniform float uNoise;\r
uniform float uBlindCount;\r
uniform float uSpotlightRadius;\r
uniform float uSpotlightSoftness;\r
uniform float uSpotlightOpacity;\r
uniform float uMirror;\r
uniform float uDistort;\r
uniform float uShineFlip;\r
uniform vec3 uColors[8];\r
uniform int uColorCount;\r
uniform float uLightMode;\r
uniform float uShine;\r
uniform float uRelief;\r
uniform float uGlow;\r
uniform float uSway;\r
uniform float uSwayTime;\r
uniform float uHover;\r
uniform vec4 uWaves[4];\r
uniform float uIntro;\r
uniform float uGrainTime;\r
uniform vec3 uLightColor;\r
uniform float uPerspective;\r
uniform float uGradientShift;\r
\r
out vec4 outColor;\r
\r
float hash(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * 0.1031);\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.x + q.y) * q.z);\r
}\r
\r
vec2 rotate2D(vec2 p, float a) {\r
  float c = cos(a);\r
  float s = sin(a);\r
  return mat2(c, -s, s, c) * p;\r
}\r
\r
vec2 blindSpace(vec2 uv0) {\r
  float aspect = uResolution.x / uResolution.y;\r
  vec2 p = uv0 * 2.0 - 1.0;\r
  p.x *= aspect;\r
  vec2 pr = rotate2D(p, uAngle);\r
  pr.x /= aspect;\r
  vec2 uv = pr * 0.5 + 0.5;\r
  if (abs(uPerspective) > 0.001) {\r
    float k = uPerspective * 2.2;\r
    uv.x = (exp(k * uv.x) - 1.0) / (exp(k) - 1.0);\r
  }\r
  if (uDistort > 0.0) {\r
    float a = uv.y * 6.0;\r
    float b = uv.x * 6.0;\r
    float w = 0.01 * uDistort;\r
    uv.x += sin(a) * w;\r
    uv.y += cos(b) * w;\r
  }\r
  return uv;\r
}\r
\r
vec3 gradientColor(float t) {\r
  float tt = clamp(t, 0.0, 1.0);\r
  int count = max(uColorCount, 2);\r
  float scaled = tt * float(count - 1);\r
  int seg = min(int(floor(scaled)), count - 2);\r
  float f = scaled - float(seg);\r
  if (tt >= 1.0) return uColors[count - 1];\r
  return mix(uColors[seg], uColors[seg + 1], f);\r
}\r
\r
void main() {\r
  vec2 frag = gl_FragCoord.xy;\r
  vec2 uv0 = frag / uResolution;\r
  vec2 uvMod = blindSpace(uv0);\r
\r
  float count = max(uBlindCount, 1.0);\r
  float stripePhase = uvMod.x * count;\r
  float pixel = max(fwidth(stripePhase), 1e-5);\r
\r
  float t = uvMod.x;\r
  if (uGradientShift != 0.0) {\r
    t = 1.0 - abs(1.0 - fract((t + uGradientShift) * 0.5) * 2.0);\r
  }\r
  if (uMirror > 0.5) {\r
    t = 1.0 - abs(1.0 - 2.0 * fract(t));\r
  }\r
  vec3 base = gradientColor(t);\r
\r
  vec2 offset = uMouse / uResolution;\r
  float d = length(uv0 - offset);\r
  float r = max(uSpotlightRadius, 1e-4);\r
  float spot = (1.0 - 2.0 * pow(d / r, uSpotlightSoftness)) * uSpotlightOpacity;\r
\r
  float slat = floor(stripePhase);\r
  float s = stripePhase - slat;\r
  float stripeAA = clamp(count * 1.25 / min(uResolution.x, uResolution.y), 0.001, 0.12);\r
  float edgeBlend = 1.0 - smoothstep(0.0, stripeAA, min(s, 1.0 - s));\r
  float across = mix(s, 0.5, edgeBlend);\r
  float ramp = uShineFlip > 0.5 ? 1.0 - across : across;\r
\r
  float unit = min(uResolution.x, uResolution.y);\r
  float reach = max(uSpotlightRadius, 0.05) * unit;\r
  vec2 toLight = uMouse - frag;\r
  float nearLight = exp(-dot(toLight, toLight) / (reach * reach));\r
\r
  float tilt = 0.0;\r
  float pulse = 0.0;\r
  if (uSway > 0.0) {\r
    tilt += uSway * 0.5 * sin(uSwayTime * 0.9 + slat * 0.55) * (0.6 + 0.4 * sin(uSwayTime * 0.37 + slat * 0.21));\r
  }\r
  tilt += uHover * nearLight * 0.7;\r
  float aspect = uResolution.x / uResolution.y;\r
  for (int i = 0; i < 4; i++) {\r
    vec4 wave = uWaves[i];\r
    if (wave.w <= 0.0) continue;\r
    float age = uTime - wave.z;\r
    if (age < 0.0 || age > \${RIPPLE_SECONDS.toFixed(2)}) continue;\r
    float life = age / \${RIPPLE_SECONDS.toFixed(2)};\r
    vec2 origin = blindSpace(wave.xy / uResolution);\r
    float slats = abs(slat + 0.5 - origin.x * count);\r
    float front = age * max(count, 4.0) * 0.95;\r
    float k = (slats - front) / (0.8 + life * 1.2);\r
    float along = (uvMod.y - origin.y) / max(0.42 + life * 0.5, 0.01);\r
    float fade = (1.0 - life) * (1.0 - life);\r
    float ring = exp(-k * k) * exp(-along * along) * fade * smoothstep(0.0, 0.2, age);\r
    tilt += ring * 0.9;\r
    pulse += ring;\r
  }\r
  if (uIntro < 1.0) {\r
    float settle = smoothstep(0.0, 1.0, clamp(uIntro * 1.5 - uv0.x * 0.5, 0.0, 1.0));\r
    tilt -= (1.0 - settle) * 1.2;\r
  }\r
\r
  float edge = ramp;\r
  float calm = 1.0 - 0.6 * clamp(spot, 0.0, 1.0);\r
  ramp = pow(clamp(ramp, 0.0, 1.0), exp(tilt * 0.9));\r
  ramp *= 1.0 - 0.3 * min(pulse, 1.0) * calm;\r
  float crease = uRelief * 0.38 * smoothstep(0.62, 1.0, ramp);\r
  float sheen = uShine * exp(-pow((edge - 0.035) / 0.07, 2.0)) * (0.3 + 0.7 * nearLight) * (1.0 - edgeBlend);\r
\r
  vec3 lit = spot > 0.0 ? uLightColor * spot : vec3(spot);\r
  lit += uLightColor * min(pulse, 1.0) * 0.35 * calm;\r
  vec3 revealSignal = lit + base - vec3(ramp + crease);\r
\r
  vec3 col;\r
  if (uLightMode > 0.5) {\r
    vec3 luma = vec3(0.2126, 0.7152, 0.0722);\r
    float peak = max(base.r, max(base.g, base.b));\r
    float low = min(base.r, min(base.g, base.b));\r
    float chroma = (peak - low) / max(peak, 0.0001);\r
    vec3 hue = base / max(peak, 0.0001);\r
    hue = clamp(mix(vec3(dot(hue, luma)), hue, 1.3), 0.0, 1.0);\r
    hue *= mix(1.0, 0.82, smoothstep(0.55, 0.9, dot(hue, luma)));\r
    vec3 tint = mix(base, hue, smoothstep(0.06, 0.28, chroma));\r
    vec3 revealed = clamp(revealSignal, 0.0, 1.0);\r
    float coverage = max(revealed.r, max(revealed.g, revealed.b));\r
    float stroke = 1.0 - smoothstep(pixel, pixel * 2.2, edge);\r
    col = mix(vec3(1.0), tint, 0.72 * smoothstep(0.0, 1.0, coverage));\r
    col = mix(col, tint * 0.85, stroke * clamp(coverage * 1.5, 0.0, 1.0) * 0.7);\r
    col = mix(col, vec3(1.0), clamp(sheen, 0.0, 1.0) * 0.5);\r
    float grain = max(0.5 * (hash(frag + uGrainTime) + hash(frag.yx + uGrainTime * 1.7)) - 0.5, 0.0);\r
    col = clamp(col - vec3(grain * uNoise * 0.12 * coverage), 0.0, 1.0);\r
  } else {\r
    vec3 haze = base * uGlow * 0.4 * smoothstep(0.0, 1.0, spot) * (0.4 + 0.6 * ramp);\r
    col = revealSignal + haze + mix(base, uLightColor, 0.45) * sheen * 0.7;\r
    vec3 over = max(col - 0.8, 0.0);\r
    col = min(col, vec3(0.8)) + 0.2 * (1.0 - exp(-over / 0.2));\r
    float luma = dot(clamp(col, 0.0, 1.0), vec3(0.2126, 0.7152, 0.0722));\r
    float grain = 0.5 * (hash(frag + uGrainTime) + hash(frag.yx + uGrainTime * 1.7)) - 0.5;\r
    col += grain * uNoise * (0.45 + 0.55 * smoothstep(0.0, 0.5, luma));\r
  }\r
\r
  float presence = smoothstep(0.0, 0.65, uIntro);\r
  col = uLightMode > 0.5 ? mix(vec3(1.0), col, presence) : col * presence;\r
  outColor = vec4(clamp(col, 0.0, 1.0), 1.0);\r
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
const link = (gl: WebGL2RenderingContext): Program | null => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
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
    if (!info) continue;\r
    const name = info.name.replace(/\\[0\\]$/, '');\r
    uniforms[name] = gl.getUniformLocation(program, name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const hexToRGB = (hex: string): number[] => {\r
  const c = String(hex || '')\r
    .replace('#', '')\r
    .padEnd(6, '0');\r
  const r = parseInt(c.slice(0, 2), 16) / 255;\r
  const g = parseInt(c.slice(2, 4), 16) / 255;\r
  const b = parseInt(c.slice(4, 6), 16) / 255;\r
  return [r || 0, g || 0, b || 0];\r
};\r
\r
const prepStops = (stops?: string[]) => {\r
  const base = (stops && stops.length ? stops : ['#FF9FFC', '#5227FF']).slice(0, MAX_COLORS);\r
  if (base.length === 1) base.push(base[0]);\r
  while (base.length < MAX_COLORS) base.push(base[base.length - 1]);\r
  const flat = new Float32Array(MAX_COLORS * 3);\r
  for (let i = 0; i < MAX_COLORS; i++) flat.set(hexToRGB(base[i]), i * 3);\r
  const count = Math.max(2, Math.min(MAX_COLORS, stops?.length ?? 2));\r
  return { flat, count };\r
};\r
\r
const GradientBlinds = ({\r
  className = '',\r
  style,\r
  dpr,\r
  paused = false,\r
  gradientColors,\r
  angle = 0,\r
  noise = 0.3,\r
  blindCount = 16,\r
  blindMinWidth = 60,\r
  mouseDampening = 0.15,\r
  mirrorGradient = false,\r
  spotlightRadius = 0.5,\r
  spotlightSoftness = 1,\r
  spotlightOpacity = 1,\r
  distortAmount = 0,\r
  shineDirection = 'left',\r
  lightColor = '#ffffff',\r
  perspective = 0,\r
  gradientSpeed = 0,\r
  shine = 0.4,\r
  relief = 0.5,\r
  glow = 0.4,\r
  sway = 0.35,\r
  speed = 1,\r
  hoverTilt = 0.6,\r
  clickEffect = 'ripple',\r
  idle = 'drift',\r
  intro = true,\r
  mixBlendMode = 'lighten',\r
  lightMode = false\r
}: GradientBlindsProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const colorKey = (gradientColors && gradientColors.length ? gradientColors : ['#FF9FFC', '#5227FF']).join(',');\r
  const settings: Settings = {\r
    paused,\r
    colorKey,\r
    gradientColors,\r
    angle,\r
    noise: clamp(noise, 0, 2),\r
    blindCount: Math.max(1, blindCount || 1),\r
    blindMinWidth,\r
    mouseDampening: Math.max(0, mouseDampening),\r
    mirrorGradient,\r
    spotlightRadius,\r
    spotlightSoftness,\r
    spotlightOpacity,\r
    distortAmount,\r
    shineDirection,\r
    lightColor,\r
    perspective: clamp(perspective, -1, 1),\r
    gradientSpeed,\r
    shine: clamp(shine, 0, 2),\r
    relief: clamp(relief, 0, 1),\r
    glow: clamp(glow, 0, 2),\r
    sway: clamp(sway, 0, 1),\r
    speed: clamp(speed, 0, 4),\r
    hoverTilt: clamp(hoverTilt, 0, 1.5),\r
    clickEffect,\r
    idle,\r
    intro,\r
    lightMode,\r
    dpr\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    const gl = canvas?.getContext('webgl2', {\r
      alpha: false,\r
      antialias: false,\r
      depth: false,\r
      stencil: false,\r
      premultipliedAlpha: false\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
    const shader = link(gl);\r
    if (!shader) return undefined;\r
    const u = shader.uniforms;\r
    const vao = gl.createVertexArray();\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1, ratio: 1, count: 1 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const light = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, ready: false };\r
    const waves = new Float32Array(MAX_WAVES * 4);\r
    let waveIndex = 0;\r
    let hover = 0;\r
    let time = 0;\r
    let swayTime = 0;\r
    let shift = 0;\r
    let grainTime = 0;\r
    let introClock = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let colorKeyCache = '';\r
    let colorStops = prepStops(settingsRef.current.gradientColors);\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const blindTotal = (s: Settings) => {\r
      if (s.blindMinWidth && s.blindMinWidth > 0) {\r
        const byWidth = Math.max(1, Math.floor(view.width / s.blindMinWidth));\r
        return Math.max(1, s.blindCount ? Math.min(s.blindCount, byWidth) : byWidth);\r
      }\r
      return Math.max(1, s.blindCount);\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      if (colorKeyCache !== s.colorKey) {\r
        colorStops = prepStops(s.gradientColors);\r
        colorKeyCache = s.colorKey;\r
      }\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(shader.program);\r
      gl.bindVertexArray(vao);\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(u.uTime, time);\r
      gl.uniform2f(u.uMouse, light.x * view.ratio, (view.height - light.y) * view.ratio);\r
      gl.uniform1f(u.uAngle, (s.angle * Math.PI) / 180);\r
      gl.uniform1f(u.uNoise, s.noise);\r
      gl.uniform1f(u.uBlindCount, blindTotal(s));\r
      gl.uniform1f(u.uSpotlightRadius, s.spotlightRadius);\r
      gl.uniform1f(u.uSpotlightSoftness, s.spotlightSoftness);\r
      gl.uniform1f(u.uSpotlightOpacity, s.spotlightOpacity);\r
      gl.uniform1f(u.uMirror, s.mirrorGradient ? 1 : 0);\r
      gl.uniform1f(u.uDistort, s.distortAmount);\r
      gl.uniform1f(u.uShineFlip, s.shineDirection === 'right' ? 1 : 0);\r
      gl.uniform3fv(u.uColors, colorStops.flat);\r
      gl.uniform1i(u.uColorCount, colorStops.count);\r
      gl.uniform1f(u.uLightMode, s.lightMode ? 1 : 0);\r
      gl.uniform1f(u.uShine, s.shine);\r
      gl.uniform1f(u.uRelief, s.relief);\r
      gl.uniform1f(u.uGlow, s.glow);\r
      gl.uniform1f(u.uSway, reduce ? 0 : s.sway);\r
      gl.uniform1f(u.uSwayTime, swayTime);\r
      gl.uniform1f(u.uHover, hover * s.hoverTilt);\r
      gl.uniform4fv(u.uWaves, waves);\r
      gl.uniform1f(u.uIntro, introClock);\r
      gl.uniform1f(u.uGrainTime, grainTime);\r
      gl.uniform3fv(u.uLightColor, hexToRGB(s.lightColor || '#ffffff'));\r
      gl.uniform1f(u.uPerspective, s.perspective);\r
      gl.uniform1f(u.uGradientShift, shift);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const aim = (s: Settings) => {\r
      if (pointer.inside) {\r
        light.tx = pointer.x;\r
        light.ty = pointer.y;\r
      } else if (s.idle === 'center') {\r
        light.tx = view.width / 2;\r
        light.ty = view.height / 2;\r
      } else if (s.idle === 'drift' && !reduce) {\r
        light.tx = view.width * (0.5 + 0.22 * Math.sin(swayTime * 0.23) + 0.05 * Math.sin(swayTime * 0.61 + 1.3));\r
        light.ty = view.height * (0.5 + 0.16 * Math.sin(swayTime * 0.31 + 0.7) + 0.04 * Math.sin(swayTime * 0.83));\r
      }\r
    };\r
\r
    const follow = (s: Settings, dt: number) => {\r
      const tau = s.mouseDampening;\r
      if (tau <= 0) {\r
        light.x = light.tx;\r
        light.y = light.ty;\r
        light.vx = 0;\r
        light.vy = 0;\r
        return;\r
      }\r
      const omega = 2.4 / tau;\r
      const k = omega * omega;\r
      const c = 2 * omega;\r
      const steps = Math.max(1, Math.ceil(dt / 0.008));\r
      const h = dt / steps;\r
      for (let i = 0; i < steps; i++) {\r
        light.vx += (k * (light.tx - light.x) - c * light.vx) * h;\r
        light.vy += (k * (light.ty - light.y) - c * light.vy) * h;\r
        light.x += light.vx * h;\r
        light.y += light.vy * h;\r
      }\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      view.width = Math.max(1, container.clientWidth);\r
      view.height = Math.max(1, container.clientHeight);\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(view.width * view.ratio));\r
      canvas.height = Math.max(1, Math.round(view.height * view.ratio));\r
      if (!light.ready) {\r
        light.ready = true;\r
        light.x = light.tx = view.width / 2;\r
        light.y = light.ty = view.height / 2;\r
      }\r
      draw();\r
      wake();\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.001, 1 / 20) : 1 / 60;\r
      last = now;\r
      if (s.paused) return;\r
      time += dt;\r
      if (!reduce) {\r
        swayTime += dt * s.speed;\r
        shift = (shift + dt * s.gradientSpeed * 0.06) % 2;\r
      }\r
      grainTime = Math.floor(time * 24) * 17.13;\r
      if (introClock < 1) introClock = Math.min(1, introClock + dt / INTRO_SECONDS);\r
      hover += ((pointer.inside ? 1 : 0) - hover) * (1 - Math.exp(-dt / 0.35));\r
      aim(s);\r
      follow(s, dt);\r
      for (let i = 0; i < MAX_WAVES; i++) {\r
        if (waves[i * 4 + 3] > 0 && time - waves[i * 4 + 2] > RIPPLE_SECONDS) waves[i * 4 + 3] = 0;\r
      }\r
      draw();\r
      const settling =\r
        Math.abs(light.tx - light.x) > 0.05 ||\r
        Math.abs(light.ty - light.y) > 0.05 ||\r
        Math.abs(light.vx) + Math.abs(light.vy) > 0.05 ||\r
        Math.abs((pointer.inside ? 1 : 0) - hover) > 0.002;\r
      const active =\r
        settling ||\r
        introClock < 1 ||\r
        waves.some((value, index) => index % 4 === 3 && value > 0) ||\r
        (!reduce &&\r
          (s.noise > 0 ||\r
            s.gradientSpeed !== 0 ||\r
            (s.sway > 0 && s.speed > 0) ||\r
            (s.idle === 'drift' && !pointer.inside)));\r
      if (active) raf = requestAnimationFrame(frame);\r
    };\r
\r
    function wake() {\r
      if (!raf && visible && !document.hidden) {\r
        last = 0;\r
        raf = requestAnimationFrame(frame);\r
      }\r
    }\r
\r
    const locate = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const { x, y, inside } = locate(event);\r
      pointer.x = x;\r
      pointer.y = y;\r
      pointer.inside = inside;\r
      if (inside) wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      const { x, y, inside } = locate(event);\r
      if (!inside || reduce || s.clickEffect !== 'ripple') return;\r
      const o = waveIndex * 4;\r
      waves[o] = x * view.ratio;\r
      waves[o + 1] = (view.height - y) * view.ratio;\r
      waves[o + 2] = time;\r
      waves[o + 3] = 1;\r
      waveIndex = (waveIndex + 1) % MAX_WAVES;\r
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
      if (visible) wake();\r
    });\r
    intersection.observe(container);\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
    wakeRef.current = wake;\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(shader.program);\r
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
      className={\`gradient-blinds-container\${className ? \` \${className}\` : ''}\`}\r
      style={{ ...(!lightMode && mixBlendMode ? { mixBlendMode } : null), ...style }}\r
    >\r
      <canvas ref={canvasRef} className="gradient-blinds-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default GradientBlinds;\r
`,i=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties } from 'react';\r
\r
export type BlindsShineDirection = 'left' | 'right';\r
export type BlindsClickEffect = 'ripple' | 'none';\r
export type BlindsIdle = 'drift' | 'center' | 'stay';\r
\r
export interface GradientBlindsProps {\r
  className?: string;\r
  style?: CSSProperties;\r
  dpr?: number;\r
  paused?: boolean;\r
  gradientColors?: string[];\r
  angle?: number;\r
  noise?: number;\r
  blindCount?: number;\r
  blindMinWidth?: number;\r
  mouseDampening?: number;\r
  mirrorGradient?: boolean;\r
  spotlightRadius?: number;\r
  spotlightSoftness?: number;\r
  spotlightOpacity?: number;\r
  distortAmount?: number;\r
  shineDirection?: BlindsShineDirection;\r
  lightColor?: string;\r
  perspective?: number;\r
  gradientSpeed?: number;\r
  shine?: number;\r
  relief?: number;\r
  glow?: number;\r
  sway?: number;\r
  speed?: number;\r
  hoverTilt?: number;\r
  clickEffect?: BlindsClickEffect;\r
  idle?: BlindsIdle;\r
  intro?: boolean;\r
  mixBlendMode?: CSSProperties['mixBlendMode'];\r
  lightMode?: boolean;\r
}\r
\r
type Settings = {\r
  paused: boolean;\r
  colorKey: string;\r
  gradientColors?: string[];\r
  angle: number;\r
  noise: number;\r
  blindCount: number;\r
  blindMinWidth: number;\r
  mouseDampening: number;\r
  mirrorGradient: boolean;\r
  spotlightRadius: number;\r
  spotlightSoftness: number;\r
  spotlightOpacity: number;\r
  distortAmount: number;\r
  shineDirection: BlindsShineDirection;\r
  lightColor: string;\r
  perspective: number;\r
  gradientSpeed: number;\r
  shine: number;\r
  relief: number;\r
  glow: number;\r
  sway: number;\r
  speed: number;\r
  hoverTilt: number;\r
  clickEffect: BlindsClickEffect;\r
  idle: BlindsIdle;\r
  intro: boolean;\r
  lightMode: boolean;\r
  dpr?: number;\r
};\r
\r
type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };\r
\r
const MAX_COLORS = 8;\r
const MAX_WAVES = 4;\r
const INTRO_SECONDS = 1.8;\r
const RIPPLE_SECONDS = 1.6;\r
\r
const VERTEX = \`#version 300 es\r
void main() {\r
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\r
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
\r
uniform vec2 uResolution;\r
uniform float uTime;\r
uniform vec2 uMouse;\r
uniform float uAngle;\r
uniform float uNoise;\r
uniform float uBlindCount;\r
uniform float uSpotlightRadius;\r
uniform float uSpotlightSoftness;\r
uniform float uSpotlightOpacity;\r
uniform float uMirror;\r
uniform float uDistort;\r
uniform float uShineFlip;\r
uniform vec3 uColors[8];\r
uniform int uColorCount;\r
uniform float uLightMode;\r
uniform float uShine;\r
uniform float uRelief;\r
uniform float uGlow;\r
uniform float uSway;\r
uniform float uSwayTime;\r
uniform float uHover;\r
uniform vec4 uWaves[4];\r
uniform float uIntro;\r
uniform float uGrainTime;\r
uniform vec3 uLightColor;\r
uniform float uPerspective;\r
uniform float uGradientShift;\r
\r
out vec4 outColor;\r
\r
float hash(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * 0.1031);\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.x + q.y) * q.z);\r
}\r
\r
vec2 rotate2D(vec2 p, float a) {\r
  float c = cos(a);\r
  float s = sin(a);\r
  return mat2(c, -s, s, c) * p;\r
}\r
\r
vec2 blindSpace(vec2 uv0) {\r
  float aspect = uResolution.x / uResolution.y;\r
  vec2 p = uv0 * 2.0 - 1.0;\r
  p.x *= aspect;\r
  vec2 pr = rotate2D(p, uAngle);\r
  pr.x /= aspect;\r
  vec2 uv = pr * 0.5 + 0.5;\r
  if (abs(uPerspective) > 0.001) {\r
    float k = uPerspective * 2.2;\r
    uv.x = (exp(k * uv.x) - 1.0) / (exp(k) - 1.0);\r
  }\r
  if (uDistort > 0.0) {\r
    float a = uv.y * 6.0;\r
    float b = uv.x * 6.0;\r
    float w = 0.01 * uDistort;\r
    uv.x += sin(a) * w;\r
    uv.y += cos(b) * w;\r
  }\r
  return uv;\r
}\r
\r
vec3 gradientColor(float t) {\r
  float tt = clamp(t, 0.0, 1.0);\r
  int count = max(uColorCount, 2);\r
  float scaled = tt * float(count - 1);\r
  int seg = min(int(floor(scaled)), count - 2);\r
  float f = scaled - float(seg);\r
  if (tt >= 1.0) return uColors[count - 1];\r
  return mix(uColors[seg], uColors[seg + 1], f);\r
}\r
\r
void main() {\r
  vec2 frag = gl_FragCoord.xy;\r
  vec2 uv0 = frag / uResolution;\r
  vec2 uvMod = blindSpace(uv0);\r
\r
  float count = max(uBlindCount, 1.0);\r
  float stripePhase = uvMod.x * count;\r
  float pixel = max(fwidth(stripePhase), 1e-5);\r
\r
  float t = uvMod.x;\r
  if (uGradientShift != 0.0) {\r
    t = 1.0 - abs(1.0 - fract((t + uGradientShift) * 0.5) * 2.0);\r
  }\r
  if (uMirror > 0.5) {\r
    t = 1.0 - abs(1.0 - 2.0 * fract(t));\r
  }\r
  vec3 base = gradientColor(t);\r
\r
  vec2 offset = uMouse / uResolution;\r
  float d = length(uv0 - offset);\r
  float r = max(uSpotlightRadius, 1e-4);\r
  float spot = (1.0 - 2.0 * pow(d / r, uSpotlightSoftness)) * uSpotlightOpacity;\r
\r
  float slat = floor(stripePhase);\r
  float s = stripePhase - slat;\r
  float stripeAA = clamp(count * 1.25 / min(uResolution.x, uResolution.y), 0.001, 0.12);\r
  float edgeBlend = 1.0 - smoothstep(0.0, stripeAA, min(s, 1.0 - s));\r
  float across = mix(s, 0.5, edgeBlend);\r
  float ramp = uShineFlip > 0.5 ? 1.0 - across : across;\r
\r
  float unit = min(uResolution.x, uResolution.y);\r
  float reach = max(uSpotlightRadius, 0.05) * unit;\r
  vec2 toLight = uMouse - frag;\r
  float nearLight = exp(-dot(toLight, toLight) / (reach * reach));\r
\r
  float tilt = 0.0;\r
  float pulse = 0.0;\r
  if (uSway > 0.0) {\r
    tilt += uSway * 0.5 * sin(uSwayTime * 0.9 + slat * 0.55) * (0.6 + 0.4 * sin(uSwayTime * 0.37 + slat * 0.21));\r
  }\r
  tilt += uHover * nearLight * 0.7;\r
  float aspect = uResolution.x / uResolution.y;\r
  for (int i = 0; i < 4; i++) {\r
    vec4 wave = uWaves[i];\r
    if (wave.w <= 0.0) continue;\r
    float age = uTime - wave.z;\r
    if (age < 0.0 || age > \${RIPPLE_SECONDS.toFixed(2)}) continue;\r
    float life = age / \${RIPPLE_SECONDS.toFixed(2)};\r
    vec2 origin = blindSpace(wave.xy / uResolution);\r
    float slats = abs(slat + 0.5 - origin.x * count);\r
    float front = age * max(count, 4.0) * 0.95;\r
    float k = (slats - front) / (0.8 + life * 1.2);\r
    float along = (uvMod.y - origin.y) / max(0.42 + life * 0.5, 0.01);\r
    float fade = (1.0 - life) * (1.0 - life);\r
    float ring = exp(-k * k) * exp(-along * along) * fade * smoothstep(0.0, 0.2, age);\r
    tilt += ring * 0.9;\r
    pulse += ring;\r
  }\r
  if (uIntro < 1.0) {\r
    float settle = smoothstep(0.0, 1.0, clamp(uIntro * 1.5 - uv0.x * 0.5, 0.0, 1.0));\r
    tilt -= (1.0 - settle) * 1.2;\r
  }\r
\r
  float edge = ramp;\r
  float calm = 1.0 - 0.6 * clamp(spot, 0.0, 1.0);\r
  ramp = pow(clamp(ramp, 0.0, 1.0), exp(tilt * 0.9));\r
  ramp *= 1.0 - 0.3 * min(pulse, 1.0) * calm;\r
  float crease = uRelief * 0.38 * smoothstep(0.62, 1.0, ramp);\r
  float sheen = uShine * exp(-pow((edge - 0.035) / 0.07, 2.0)) * (0.3 + 0.7 * nearLight) * (1.0 - edgeBlend);\r
\r
  vec3 lit = spot > 0.0 ? uLightColor * spot : vec3(spot);\r
  lit += uLightColor * min(pulse, 1.0) * 0.35 * calm;\r
  vec3 revealSignal = lit + base - vec3(ramp + crease);\r
\r
  vec3 col;\r
  if (uLightMode > 0.5) {\r
    vec3 luma = vec3(0.2126, 0.7152, 0.0722);\r
    float peak = max(base.r, max(base.g, base.b));\r
    float low = min(base.r, min(base.g, base.b));\r
    float chroma = (peak - low) / max(peak, 0.0001);\r
    vec3 hue = base / max(peak, 0.0001);\r
    hue = clamp(mix(vec3(dot(hue, luma)), hue, 1.3), 0.0, 1.0);\r
    hue *= mix(1.0, 0.82, smoothstep(0.55, 0.9, dot(hue, luma)));\r
    vec3 tint = mix(base, hue, smoothstep(0.06, 0.28, chroma));\r
    vec3 revealed = clamp(revealSignal, 0.0, 1.0);\r
    float coverage = max(revealed.r, max(revealed.g, revealed.b));\r
    float stroke = 1.0 - smoothstep(pixel, pixel * 2.2, edge);\r
    col = mix(vec3(1.0), tint, 0.72 * smoothstep(0.0, 1.0, coverage));\r
    col = mix(col, tint * 0.85, stroke * clamp(coverage * 1.5, 0.0, 1.0) * 0.7);\r
    col = mix(col, vec3(1.0), clamp(sheen, 0.0, 1.0) * 0.5);\r
    float grain = max(0.5 * (hash(frag + uGrainTime) + hash(frag.yx + uGrainTime * 1.7)) - 0.5, 0.0);\r
    col = clamp(col - vec3(grain * uNoise * 0.12 * coverage), 0.0, 1.0);\r
  } else {\r
    vec3 haze = base * uGlow * 0.4 * smoothstep(0.0, 1.0, spot) * (0.4 + 0.6 * ramp);\r
    col = revealSignal + haze + mix(base, uLightColor, 0.45) * sheen * 0.7;\r
    vec3 over = max(col - 0.8, 0.0);\r
    col = min(col, vec3(0.8)) + 0.2 * (1.0 - exp(-over / 0.2));\r
    float luma = dot(clamp(col, 0.0, 1.0), vec3(0.2126, 0.7152, 0.0722));\r
    float grain = 0.5 * (hash(frag + uGrainTime) + hash(frag.yx + uGrainTime * 1.7)) - 0.5;\r
    col += grain * uNoise * (0.45 + 0.55 * smoothstep(0.0, 0.5, luma));\r
  }\r
\r
  float presence = smoothstep(0.0, 0.65, uIntro);\r
  col = uLightMode > 0.5 ? mix(vec3(1.0), col, presence) : col * presence;\r
  outColor = vec4(clamp(col, 0.0, 1.0), 1.0);\r
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
const link = (gl: WebGL2RenderingContext): Program | null => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
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
    if (!info) continue;\r
    const name = info.name.replace(/\\[0\\]$/, '');\r
    uniforms[name] = gl.getUniformLocation(program, name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const hexToRGB = (hex: string): number[] => {\r
  const c = String(hex || '')\r
    .replace('#', '')\r
    .padEnd(6, '0');\r
  const r = parseInt(c.slice(0, 2), 16) / 255;\r
  const g = parseInt(c.slice(2, 4), 16) / 255;\r
  const b = parseInt(c.slice(4, 6), 16) / 255;\r
  return [r || 0, g || 0, b || 0];\r
};\r
\r
const prepStops = (stops?: string[]) => {\r
  const base = (stops && stops.length ? stops : ['#FF9FFC', '#5227FF']).slice(0, MAX_COLORS);\r
  if (base.length === 1) base.push(base[0]);\r
  while (base.length < MAX_COLORS) base.push(base[base.length - 1]);\r
  const flat = new Float32Array(MAX_COLORS * 3);\r
  for (let i = 0; i < MAX_COLORS; i++) flat.set(hexToRGB(base[i]), i * 3);\r
  const count = Math.max(2, Math.min(MAX_COLORS, stops?.length ?? 2));\r
  return { flat, count };\r
};\r
\r
const GradientBlinds = ({\r
  className = '',\r
  style,\r
  dpr,\r
  paused = false,\r
  gradientColors,\r
  angle = 0,\r
  noise = 0.3,\r
  blindCount = 16,\r
  blindMinWidth = 60,\r
  mouseDampening = 0.15,\r
  mirrorGradient = false,\r
  spotlightRadius = 0.5,\r
  spotlightSoftness = 1,\r
  spotlightOpacity = 1,\r
  distortAmount = 0,\r
  shineDirection = 'left',\r
  lightColor = '#ffffff',\r
  perspective = 0,\r
  gradientSpeed = 0,\r
  shine = 0.4,\r
  relief = 0.5,\r
  glow = 0.4,\r
  sway = 0.35,\r
  speed = 1,\r
  hoverTilt = 0.6,\r
  clickEffect = 'ripple',\r
  idle = 'drift',\r
  intro = true,\r
  mixBlendMode = 'lighten',\r
  lightMode = false\r
}: GradientBlindsProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const colorKey = (gradientColors && gradientColors.length ? gradientColors : ['#FF9FFC', '#5227FF']).join(',');\r
  const settings: Settings = {\r
    paused,\r
    colorKey,\r
    gradientColors,\r
    angle,\r
    noise: clamp(noise, 0, 2),\r
    blindCount: Math.max(1, blindCount || 1),\r
    blindMinWidth,\r
    mouseDampening: Math.max(0, mouseDampening),\r
    mirrorGradient,\r
    spotlightRadius,\r
    spotlightSoftness,\r
    spotlightOpacity,\r
    distortAmount,\r
    shineDirection,\r
    lightColor,\r
    perspective: clamp(perspective, -1, 1),\r
    gradientSpeed,\r
    shine: clamp(shine, 0, 2),\r
    relief: clamp(relief, 0, 1),\r
    glow: clamp(glow, 0, 2),\r
    sway: clamp(sway, 0, 1),\r
    speed: clamp(speed, 0, 4),\r
    hoverTilt: clamp(hoverTilt, 0, 1.5),\r
    clickEffect,\r
    idle,\r
    intro,\r
    lightMode,\r
    dpr\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    const gl = canvas?.getContext('webgl2', {\r
      alpha: false,\r
      antialias: false,\r
      depth: false,\r
      stencil: false,\r
      premultipliedAlpha: false\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
    const shader = link(gl);\r
    if (!shader) return undefined;\r
    const u = shader.uniforms;\r
    const vao = gl.createVertexArray();\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1, ratio: 1, count: 1 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const light = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, ready: false };\r
    const waves = new Float32Array(MAX_WAVES * 4);\r
    let waveIndex = 0;\r
    let hover = 0;\r
    let time = 0;\r
    let swayTime = 0;\r
    let shift = 0;\r
    let grainTime = 0;\r
    let introClock = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let colorKeyCache = '';\r
    let colorStops = prepStops(settingsRef.current.gradientColors);\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const blindTotal = (s: Settings) => {\r
      if (s.blindMinWidth && s.blindMinWidth > 0) {\r
        const byWidth = Math.max(1, Math.floor(view.width / s.blindMinWidth));\r
        return Math.max(1, s.blindCount ? Math.min(s.blindCount, byWidth) : byWidth);\r
      }\r
      return Math.max(1, s.blindCount);\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      if (colorKeyCache !== s.colorKey) {\r
        colorStops = prepStops(s.gradientColors);\r
        colorKeyCache = s.colorKey;\r
      }\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(shader.program);\r
      gl.bindVertexArray(vao);\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(u.uTime, time);\r
      gl.uniform2f(u.uMouse, light.x * view.ratio, (view.height - light.y) * view.ratio);\r
      gl.uniform1f(u.uAngle, (s.angle * Math.PI) / 180);\r
      gl.uniform1f(u.uNoise, s.noise);\r
      gl.uniform1f(u.uBlindCount, blindTotal(s));\r
      gl.uniform1f(u.uSpotlightRadius, s.spotlightRadius);\r
      gl.uniform1f(u.uSpotlightSoftness, s.spotlightSoftness);\r
      gl.uniform1f(u.uSpotlightOpacity, s.spotlightOpacity);\r
      gl.uniform1f(u.uMirror, s.mirrorGradient ? 1 : 0);\r
      gl.uniform1f(u.uDistort, s.distortAmount);\r
      gl.uniform1f(u.uShineFlip, s.shineDirection === 'right' ? 1 : 0);\r
      gl.uniform3fv(u.uColors, colorStops.flat);\r
      gl.uniform1i(u.uColorCount, colorStops.count);\r
      gl.uniform1f(u.uLightMode, s.lightMode ? 1 : 0);\r
      gl.uniform1f(u.uShine, s.shine);\r
      gl.uniform1f(u.uRelief, s.relief);\r
      gl.uniform1f(u.uGlow, s.glow);\r
      gl.uniform1f(u.uSway, reduce ? 0 : s.sway);\r
      gl.uniform1f(u.uSwayTime, swayTime);\r
      gl.uniform1f(u.uHover, hover * s.hoverTilt);\r
      gl.uniform4fv(u.uWaves, waves);\r
      gl.uniform1f(u.uIntro, introClock);\r
      gl.uniform1f(u.uGrainTime, grainTime);\r
      gl.uniform3fv(u.uLightColor, hexToRGB(s.lightColor || '#ffffff'));\r
      gl.uniform1f(u.uPerspective, s.perspective);\r
      gl.uniform1f(u.uGradientShift, shift);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const aim = (s: Settings) => {\r
      if (pointer.inside) {\r
        light.tx = pointer.x;\r
        light.ty = pointer.y;\r
      } else if (s.idle === 'center') {\r
        light.tx = view.width / 2;\r
        light.ty = view.height / 2;\r
      } else if (s.idle === 'drift' && !reduce) {\r
        light.tx = view.width * (0.5 + 0.22 * Math.sin(swayTime * 0.23) + 0.05 * Math.sin(swayTime * 0.61 + 1.3));\r
        light.ty = view.height * (0.5 + 0.16 * Math.sin(swayTime * 0.31 + 0.7) + 0.04 * Math.sin(swayTime * 0.83));\r
      }\r
    };\r
\r
    const follow = (s: Settings, dt: number) => {\r
      const tau = s.mouseDampening;\r
      if (tau <= 0) {\r
        light.x = light.tx;\r
        light.y = light.ty;\r
        light.vx = 0;\r
        light.vy = 0;\r
        return;\r
      }\r
      const omega = 2.4 / tau;\r
      const k = omega * omega;\r
      const c = 2 * omega;\r
      const steps = Math.max(1, Math.ceil(dt / 0.008));\r
      const h = dt / steps;\r
      for (let i = 0; i < steps; i++) {\r
        light.vx += (k * (light.tx - light.x) - c * light.vx) * h;\r
        light.vy += (k * (light.ty - light.y) - c * light.vy) * h;\r
        light.x += light.vx * h;\r
        light.y += light.vy * h;\r
      }\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      view.width = Math.max(1, container.clientWidth);\r
      view.height = Math.max(1, container.clientHeight);\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(view.width * view.ratio));\r
      canvas.height = Math.max(1, Math.round(view.height * view.ratio));\r
      if (!light.ready) {\r
        light.ready = true;\r
        light.x = light.tx = view.width / 2;\r
        light.y = light.ty = view.height / 2;\r
      }\r
      draw();\r
      wake();\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.001, 1 / 20) : 1 / 60;\r
      last = now;\r
      if (s.paused) return;\r
      time += dt;\r
      if (!reduce) {\r
        swayTime += dt * s.speed;\r
        shift = (shift + dt * s.gradientSpeed * 0.06) % 2;\r
      }\r
      grainTime = Math.floor(time * 24) * 17.13;\r
      if (introClock < 1) introClock = Math.min(1, introClock + dt / INTRO_SECONDS);\r
      hover += ((pointer.inside ? 1 : 0) - hover) * (1 - Math.exp(-dt / 0.35));\r
      aim(s);\r
      follow(s, dt);\r
      for (let i = 0; i < MAX_WAVES; i++) {\r
        if (waves[i * 4 + 3] > 0 && time - waves[i * 4 + 2] > RIPPLE_SECONDS) waves[i * 4 + 3] = 0;\r
      }\r
      draw();\r
      const settling =\r
        Math.abs(light.tx - light.x) > 0.05 ||\r
        Math.abs(light.ty - light.y) > 0.05 ||\r
        Math.abs(light.vx) + Math.abs(light.vy) > 0.05 ||\r
        Math.abs((pointer.inside ? 1 : 0) - hover) > 0.002;\r
      const active =\r
        settling ||\r
        introClock < 1 ||\r
        waves.some((value, index) => index % 4 === 3 && value > 0) ||\r
        (!reduce &&\r
          (s.noise > 0 ||\r
            s.gradientSpeed !== 0 ||\r
            (s.sway > 0 && s.speed > 0) ||\r
            (s.idle === 'drift' && !pointer.inside)));\r
      if (active) raf = requestAnimationFrame(frame);\r
    };\r
\r
    function wake() {\r
      if (!raf && visible && !document.hidden) {\r
        last = 0;\r
        raf = requestAnimationFrame(frame);\r
      }\r
    }\r
\r
    const locate = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const { x, y, inside } = locate(event);\r
      pointer.x = x;\r
      pointer.y = y;\r
      pointer.inside = inside;\r
      if (inside) wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      const { x, y, inside } = locate(event);\r
      if (!inside || reduce || s.clickEffect !== 'ripple') return;\r
      const o = waveIndex * 4;\r
      waves[o] = x * view.ratio;\r
      waves[o + 1] = (view.height - y) * view.ratio;\r
      waves[o + 2] = time;\r
      waves[o + 3] = 1;\r
      waveIndex = (waveIndex + 1) % MAX_WAVES;\r
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
      if (visible) wake();\r
    });\r
    intersection.observe(container);\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
    wakeRef.current = wake;\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(shader.program);\r
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
      style={{ ...(!lightMode && mixBlendMode ? { mixBlendMode } : null), ...style }}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default GradientBlinds;\r
`,o={usage:`import GradientBlinds from './GradientBlinds';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <GradientBlinds
    gradientColors={['#FF9FFC', '#5227FF']}
    angle={20}
    blindCount={16}
    blindMinWidth={60}
    spotlightRadius={0.5}
    shine={0.4}
    relief={0.5}
    glow={0.4}
    sway={0.35}
    hoverTilt={0.6}
    clickEffect="ripple"
    noise={0.3}
  />
</div>`,code:n,css:r,tailwind:e,tsCode:t,tsTailwind:i};export{o as gradientBlinds};
