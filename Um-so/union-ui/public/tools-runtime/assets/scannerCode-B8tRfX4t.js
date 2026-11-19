const n=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
import './Scanner.css';\r
\r
const MAX_PINGS = 6;\r
const INTRO_SECONDS = 2;\r
const DIRECTIONS = { vertical: 0, horizontal: 1, diagonal: 2 };\r
\r
const VERTEX = \`#version 300 es\r
void main() {\r
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\r
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
\r
uniform vec2 uResolution;\r
uniform float uWave;\r
uniform float uSweep;\r
uniform float uSweepWidth;\r
uniform float uTrail;\r
uniform float uScale;\r
uniform float uFrequency;\r
uniform float uRipple;\r
uniform float uDensity;\r
uniform float uLineWidth;\r
uniform float uGlow;\r
uniform float uDirection;\r
uniform float uSpread;\r
uniform float uBrightness;\r
uniform float uVignette;\r
uniform float uOpacity;\r
uniform float uScanline;\r
uniform float uRatio;\r
uniform float uGrain;\r
uniform float uTime;\r
uniform vec2 uMouse;\r
uniform float uPresence;\r
uniform float uMouseRadius;\r
uniform float uMouseStrength;\r
uniform float uAttract;\r
uniform vec3 uPings[\${MAX_PINGS}];\r
uniform float uIntro;\r
uniform float uLightMode;\r
uniform vec3 uColor1;\r
uniform vec3 uColor2;\r
uniform vec3 uColor3;\r
\r
out vec4 fragColor;\r
\r
float hash(vec2 p) {\r
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);\r
}\r
\r
float signal(vec2 p, float t) {\r
  float w = sin(p.x * 1.3 + t * 0.7);\r
  w += sin(p.y * 1.7 - t * 0.52) * 0.8;\r
  w += sin((p.x + p.y) * 0.9 + t * 0.91) * 0.6;\r
  w += sin((p.x - p.y) * 1.53 - t * 0.63) * 0.42;\r
  return w * 0.35;\r
}\r
\r
float smoother(float x) {\r
  x = clamp(x, 0.0, 1.0);\r
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);\r
}\r
\r
vec2 axes(vec2 p) {\r
  if (uDirection < 0.5) return vec2(p.y, p.x);\r
  if (uDirection < 1.5) return vec2(p.x, -p.y);\r
  return vec2((p.x + p.y) * 0.70710678, (p.x - p.y) * 0.70710678);\r
}\r
\r
float coverage(float lc, float width) {\r
  float fw = max(fwidth(lc), 1e-5);\r
  float dist = abs(fract(lc + 0.5) - 0.5) / fw;\r
  float crowd = smoothstep(0.2, 0.55, fw);\r
  float cover = clamp(width * 0.5 + 0.5 - dist, 0.0, 1.0) * min(width, 1.0);\r
  return mix(cover, min(width * fw, 1.0), crowd);\r
}\r
\r
void main() {\r
  vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution) / uResolution.y;\r
  vec2 p = uv / max(uScale, 0.001);\r
  vec2 ax = axes(p);\r
\r
  float sig = signal(p * uFrequency, uWave);\r
  float coord = ax.x + sig * uRipple;\r
\r
  vec2 mp = uMouse / max(uScale, 0.001);\r
  vec2 md = p - mp;\r
  float radius = max(uMouseRadius / max(uScale, 0.001), 0.01);\r
  float lens = exp(-dot(md, md) / (radius * radius)) * uPresence;\r
  float mouseAxis = axes(mp).x + signal(mp * uFrequency, uWave) * uRipple;\r
  coord -= (coord - mouseAxis) * lens * uMouseStrength * mix(0.55, -0.9, uAttract);\r
\r
  float pingLight = 0.0;\r
  for (int i = 0; i < \${MAX_PINGS}; i++) {\r
    vec3 ping = uPings[i];\r
    if (ping.z < 0.0) continue;\r
    float d = length(uv - ping.xy);\r
    float age = ping.z;\r
    float r = age * 1.1;\r
    float w = 0.12 + age * 0.1;\r
    float band = exp(-((d - r) * (d - r)) / (w * w));\r
    float fade = exp(-age * 0.9) * smoothstep(0.0, 0.12, age);\r
    coord += band * fade * 0.018 / max(uScale, 0.001);\r
    pingLight += band * fade;\r
  }\r
\r
  float u = fract(uSweep - coord / max(uSweepWidth, 0.05));\r
  float tail = mix(11.0, 1.8, clamp(uTrail, 0.0, 1.0));\r
  float lead = smoothstep(0.84, 1.0, u);\r
  lead *= lead;\r
  float sweep = max(exp(-u * tail), lead);\r
  float head = max(exp(-u * 26.0), lead * lead * lead);\r
\r
  float introFront = mix(-1.6, 1.6, smoother(uIntro)) / max(uScale, 0.001);\r
  float reveal = 1.0 - smoothstep(introFront - 0.05, introFront + 0.3, coord);\r
  float introHead = exp(-abs(coord - introFront) * 14.0) * (1.0 - uIntro) * step(0.0001, 1.0 - uIntro);\r
  reveal = mix(reveal, 1.0, step(0.9999, uIntro));\r
\r
  float lit = clamp(sweep * 0.86 + lens * uMouseStrength * 0.7 + pingLight * 0.9 + introHead, 0.0, 1.6);\r
  float hot = clamp(head + introHead + pingLight * 0.35, 0.0, 1.0);\r
\r
  float lc = coord * uDensity;\r
  float width = uLineWidth * (1.0 + lit * 1.4 + hot * 0.9);\r
  float thread = 0.62 + 0.38 * hash(vec2(floor(lc + 0.5), 3.7));\r
  float split = uSpread * (0.5 + lit * 1.3) * max(fwidth(lc), 1e-5);\r
  float cg = coverage(lc, width);\r
  float cr = coverage(lc + split, width);\r
  float cb = coverage(lc - split, width);\r
\r
  float fw = max(fwidth(lc), 1e-5);\r
  float dist = abs(fract(lc + 0.5) - 0.5) / fw;\r
  float crowd = smoothstep(0.2, 0.55, fw);\r
  float halo = exp(-dist / (3.0 + uGlow * 9.0)) * (1.0 - crowd) * uGlow * lit * 1.15;\r
\r
  float base = 0.11 * reveal;\r
  float level = (base + lit * (1.0 - base)) * thread * uBrightness;\r
\r
  vec3 tone = mix(uColor1, uColor2, smoothstep(0.05, 0.75, lit));\r
  tone = mix(tone, uColor3, hot);\r
  vec3 haloTone = mix(uColor1, uColor2, 0.65);\r
\r
  float vx = smoother((1.0 - abs(uv.x / (uResolution.x / uResolution.y))) / 0.6);\r
  float vy = smoother((1.0 - abs(uv.y)) / 0.6);\r
  float vignette = mix(1.0, vx * vy, uVignette);\r
\r
  vec3 cover3 = vec3(cr, cg, cb);\r
  float alphaLine = max(max(cr, cg), cb) * level;\r
  vec3 colLine = tone * cover3 * level;\r
\r
  float grain = (hash(gl_FragCoord.xy + fract(uTime) * 91.7) - 0.5) * uGrain;\r
  float scan = 1.0 - uScanline * 0.55 * (0.5 + 0.5 * cos(gl_FragCoord.y * 6.2831853 / (3.0 * uRatio)));\r
\r
  if (uLightMode > 0.5) {\r
    float ink = clamp(alphaLine * vignette * scan, 0.0, 1.0);\r
    float wash = clamp(halo * 0.28 * vignette, 0.0, 1.0);\r
    float alpha = clamp(ink + wash * (1.0 - ink) + grain * 0.5 * ink, 0.0, 1.0) * uOpacity;\r
    vec3 col = (tone * ink + haloTone * wash * (1.0 - ink)) / max(ink + wash * (1.0 - ink), 1e-4);\r
    fragColor = vec4(col * alpha, alpha);\r
    return;\r
  }\r
\r
  vec3 col = (colLine + haloTone * halo) * vignette * scan;\r
  float alpha = clamp(max(alphaLine, halo) * vignette * scan + grain * max(alphaLine, 0.04), 0.0, 1.0);\r
  col = clamp(col + grain * 0.6 * alpha, 0.0, 1.0);\r
  col = min(col, vec3(alpha));\r
  fragColor = vec4(col * uOpacity, alpha * uOpacity);\r
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
  const total = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
  for (let i = 0; i < total; i++) {\r
    const info = gl.getActiveUniform(program, i);\r
    if (info) uniforms[info.name.replace(/\\[0\\]$/, '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const toRgb = hex => {\r
  let h = String(hex || '#ffffff')\r
    .replace('#', '')\r
    .trim();\r
  if (h.length === 3 || h.length === 4)\r
    h = h\r
      .slice(0, 3)\r
      .split('')\r
      .map(c => c + c)\r
      .join('');\r
  const num = parseInt(h.slice(0, 6), 16);\r
  if (Number.isNaN(num)) return [1, 1, 1];\r
  return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];\r
};\r
\r
const Scanner = ({\r
  color1 = '#5227FF',\r
  color2 = '#FF9FFC',\r
  color3 = '#FFFFFF',\r
  speed = 0.5,\r
  sweepSpeed = 0.25,\r
  sweepWidth = 1.6,\r
  trail = 0.5,\r
  reverse = false,\r
  scale = 1.5,\r
  frequency = 2,\r
  ripple = 0.22,\r
  bandDensity = 11,\r
  lineWidth = 1.2,\r
  glow = 0.6,\r
  scanDirection = 'vertical',\r
  colorSpread = 0.7,\r
  brightness = 1,\r
  vignette = 0.3,\r
  scanline = true,\r
  scanlineIntensity = 0.5,\r
  grain = true,\r
  grainIntensity = 0.04,\r
  opacity = 1,\r
  mouseInteraction = true,\r
  mouseRadius = 0.5,\r
  mouseStrength = 0.7,\r
  mouseMode = 'repel',\r
  clickEffect = 'ping',\r
  intro = true,\r
  lightMode = false,\r
  dpr,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settings = {\r
    color1,\r
    color2,\r
    color3,\r
    speed,\r
    sweepSpeed: reverse ? -sweepSpeed : sweepSpeed,\r
    sweepWidth: Math.max(0.05, sweepWidth),\r
    trail: clamp(trail, 0, 1),\r
    scale: Math.max(0.05, scale),\r
    frequency,\r
    ripple,\r
    bandDensity: Math.max(0.5, bandDensity),\r
    lineWidth: Math.max(0.2, lineWidth),\r
    glow: Math.max(0, glow),\r
    direction: DIRECTIONS[scanDirection] ?? 0,\r
    colorSpread: clamp(colorSpread, 0, 1),\r
    brightness: Math.max(0, brightness),\r
    vignette: clamp(vignette, 0, 1),\r
    scanline: scanline ? clamp(scanlineIntensity, 0, 1) : 0,\r
    grain: grain ? Math.max(0, grainIntensity) : 0,\r
    opacity: clamp(opacity, 0, 1),\r
    mouseInteraction,\r
    mouseRadius: Math.max(0.05, mouseRadius),\r
    mouseStrength: Math.max(0, mouseStrength),\r
    attract: mouseMode === 'attract',\r
    clickEffect,\r
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
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
    const shader = link(gl);\r
    if (!shader) return undefined;\r
    const u = shader.uniforms;\r
    const vao = gl.createVertexArray();\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1, ratio: 1 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const mouse = { x: 0, y: 0, ready: false };\r
    const pings = new Float32Array(MAX_PINGS * 3);\r
    for (let k = 0; k < MAX_PINGS; k++) pings[k * 3 + 2] = -1;\r
    let pingIndex = 0;\r
    let presence = 0;\r
    let wave = 0;\r
    let sweep = -0.39;\r
    let clock = 0;\r
    let introClock = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let quiet = 0;\r
\r
    const toUv = (x, y) => [(x * 2 - view.width) / view.height, (view.height - y * 2) / view.height];\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.useProgram(shader.program);\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(u.uWave, wave);\r
      gl.uniform1f(u.uSweep, sweep);\r
      gl.uniform1f(u.uSweepWidth, s.sweepWidth);\r
      gl.uniform1f(u.uTrail, s.trail);\r
      gl.uniform1f(u.uScale, s.scale);\r
      gl.uniform1f(u.uFrequency, s.frequency);\r
      gl.uniform1f(u.uRipple, s.ripple);\r
      gl.uniform1f(u.uDensity, s.bandDensity);\r
      gl.uniform1f(u.uLineWidth, s.lineWidth * view.ratio);\r
      gl.uniform1f(u.uGlow, s.glow);\r
      gl.uniform1f(u.uDirection, s.direction);\r
      gl.uniform1f(u.uSpread, s.colorSpread);\r
      gl.uniform1f(u.uBrightness, s.brightness);\r
      gl.uniform1f(u.uVignette, s.vignette);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.uniform1f(u.uScanline, s.scanline);\r
      gl.uniform1f(u.uRatio, view.ratio);\r
      gl.uniform1f(u.uGrain, s.grain);\r
      gl.uniform1f(u.uTime, clock);\r
      gl.uniform2f(u.uMouse, mouse.x, mouse.y);\r
      gl.uniform1f(u.uPresence, s.mouseInteraction ? presence : 0);\r
      gl.uniform1f(u.uMouseRadius, s.mouseRadius);\r
      gl.uniform1f(u.uMouseStrength, s.mouseStrength);\r
      gl.uniform1f(u.uAttract, s.attract ? 1 : 0);\r
      gl.uniform3fv(u.uPings, pings);\r
      gl.uniform1f(u.uIntro, introClock);\r
      gl.uniform1f(u.uLightMode, s.lightMode ? 1 : 0);\r
      gl.uniform3fv(u.uColor1, toRgb(s.color1));\r
      gl.uniform3fv(u.uColor2, toRgb(s.color2));\r
      gl.uniform3fv(u.uColor3, toRgb(s.color3));\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      gl.bindVertexArray(vao);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    let sizedDpr = settingsRef.current.dpr;\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      sizedDpr = s.dpr;\r
      view.width = Math.max(1, container.clientWidth);\r
      view.height = Math.max(1, container.clientHeight);\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(view.width * view.ratio));\r
      canvas.height = Math.max(1, Math.round(view.height * view.ratio));\r
      draw();\r
      wake();\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      if (s.dpr !== sizedDpr) resize();\r
      const dt = last ? clamp((now - last) / 1000, 0, 1 / 20) : 1 / 60;\r
      last = now;\r
      clock += dt;\r
      if (!reduce) {\r
        wave += dt * s.speed;\r
        sweep += dt * s.sweepSpeed;\r
      }\r
      if (introClock < 1) introClock = Math.min(1, introClock + dt / INTRO_SECONDS);\r
      const target = toUv(pointer.x, pointer.y);\r
      const follow = 1 - Math.exp(-dt / 0.09);\r
      mouse.x += (target[0] - mouse.x) * follow;\r
      mouse.y += (target[1] - mouse.y) * follow;\r
      presence += ((pointer.inside && s.mouseInteraction ? 1 : 0) - presence) * (1 - Math.exp(-dt / 0.3));\r
      let busy = (!reduce && (s.speed !== 0 || s.sweepSpeed !== 0)) || introClock < 1 || presence > 0.001;\r
      for (let k = 0; k < MAX_PINGS; k++) {\r
        if (pings[k * 3 + 2] < 0) continue;\r
        pings[k * 3 + 2] += dt;\r
        if (pings[k * 3 + 2] > 4) pings[k * 3 + 2] = -1;\r
        else busy = true;\r
      }\r
      draw();\r
      quiet = busy ? 0 : quiet + dt;\r
      if (quiet < 0.5) raf = requestAnimationFrame(frame);\r
    };\r
\r
    function wake() {\r
      quiet = 0;\r
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
      const was = pointer.inside;\r
      pointer.inside = inside;\r
      if (inside) {\r
        pointer.x = x;\r
        pointer.y = y;\r
        if (!was || !mouse.ready) {\r
          const [ux, uy] = toUv(x, y);\r
          mouse.x = ux;\r
          mouse.y = uy;\r
          mouse.ready = true;\r
        }\r
      }\r
      if (inside || was) wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      if (s.clickEffect !== 'ping' || reduce) return;\r
      const { x, y, inside } = locate(event);\r
      if (!inside) return;\r
      const [ux, uy] = toUv(x, y);\r
      pings[pingIndex * 3] = ux;\r
      pings[pingIndex * 3 + 1] = uy;\r
      pings[pingIndex * 3 + 2] = 0;\r
      pingIndex = (pingIndex + 1) % MAX_PINGS;\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
    const onVisibility = () => wake();\r
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
    <div ref={containerRef} className={\`scanner-container \${className}\`.trim()} style={style}>\r
      <canvas ref={canvasRef} className="scanner-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Scanner;\r
`,r=`.scanner-container {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.scanner-canvas {\r
  display: block;\r
  width: 100%;\r
  height: 100%;\r
}\r
`,e=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
const MAX_PINGS = 6;\r
const INTRO_SECONDS = 2;\r
const DIRECTIONS = { vertical: 0, horizontal: 1, diagonal: 2 };\r
\r
const VERTEX = \`#version 300 es\r
void main() {\r
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\r
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
\r
uniform vec2 uResolution;\r
uniform float uWave;\r
uniform float uSweep;\r
uniform float uSweepWidth;\r
uniform float uTrail;\r
uniform float uScale;\r
uniform float uFrequency;\r
uniform float uRipple;\r
uniform float uDensity;\r
uniform float uLineWidth;\r
uniform float uGlow;\r
uniform float uDirection;\r
uniform float uSpread;\r
uniform float uBrightness;\r
uniform float uVignette;\r
uniform float uOpacity;\r
uniform float uScanline;\r
uniform float uRatio;\r
uniform float uGrain;\r
uniform float uTime;\r
uniform vec2 uMouse;\r
uniform float uPresence;\r
uniform float uMouseRadius;\r
uniform float uMouseStrength;\r
uniform float uAttract;\r
uniform vec3 uPings[\${MAX_PINGS}];\r
uniform float uIntro;\r
uniform float uLightMode;\r
uniform vec3 uColor1;\r
uniform vec3 uColor2;\r
uniform vec3 uColor3;\r
\r
out vec4 fragColor;\r
\r
float hash(vec2 p) {\r
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);\r
}\r
\r
float signal(vec2 p, float t) {\r
  float w = sin(p.x * 1.3 + t * 0.7);\r
  w += sin(p.y * 1.7 - t * 0.52) * 0.8;\r
  w += sin((p.x + p.y) * 0.9 + t * 0.91) * 0.6;\r
  w += sin((p.x - p.y) * 1.53 - t * 0.63) * 0.42;\r
  return w * 0.35;\r
}\r
\r
float smoother(float x) {\r
  x = clamp(x, 0.0, 1.0);\r
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);\r
}\r
\r
vec2 axes(vec2 p) {\r
  if (uDirection < 0.5) return vec2(p.y, p.x);\r
  if (uDirection < 1.5) return vec2(p.x, -p.y);\r
  return vec2((p.x + p.y) * 0.70710678, (p.x - p.y) * 0.70710678);\r
}\r
\r
float coverage(float lc, float width) {\r
  float fw = max(fwidth(lc), 1e-5);\r
  float dist = abs(fract(lc + 0.5) - 0.5) / fw;\r
  float crowd = smoothstep(0.2, 0.55, fw);\r
  float cover = clamp(width * 0.5 + 0.5 - dist, 0.0, 1.0) * min(width, 1.0);\r
  return mix(cover, min(width * fw, 1.0), crowd);\r
}\r
\r
void main() {\r
  vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution) / uResolution.y;\r
  vec2 p = uv / max(uScale, 0.001);\r
  vec2 ax = axes(p);\r
\r
  float sig = signal(p * uFrequency, uWave);\r
  float coord = ax.x + sig * uRipple;\r
\r
  vec2 mp = uMouse / max(uScale, 0.001);\r
  vec2 md = p - mp;\r
  float radius = max(uMouseRadius / max(uScale, 0.001), 0.01);\r
  float lens = exp(-dot(md, md) / (radius * radius)) * uPresence;\r
  float mouseAxis = axes(mp).x + signal(mp * uFrequency, uWave) * uRipple;\r
  coord -= (coord - mouseAxis) * lens * uMouseStrength * mix(0.55, -0.9, uAttract);\r
\r
  float pingLight = 0.0;\r
  for (int i = 0; i < \${MAX_PINGS}; i++) {\r
    vec3 ping = uPings[i];\r
    if (ping.z < 0.0) continue;\r
    float d = length(uv - ping.xy);\r
    float age = ping.z;\r
    float r = age * 1.1;\r
    float w = 0.12 + age * 0.1;\r
    float band = exp(-((d - r) * (d - r)) / (w * w));\r
    float fade = exp(-age * 0.9) * smoothstep(0.0, 0.12, age);\r
    coord += band * fade * 0.018 / max(uScale, 0.001);\r
    pingLight += band * fade;\r
  }\r
\r
  float u = fract(uSweep - coord / max(uSweepWidth, 0.05));\r
  float tail = mix(11.0, 1.8, clamp(uTrail, 0.0, 1.0));\r
  float lead = smoothstep(0.84, 1.0, u);\r
  lead *= lead;\r
  float sweep = max(exp(-u * tail), lead);\r
  float head = max(exp(-u * 26.0), lead * lead * lead);\r
\r
  float introFront = mix(-1.6, 1.6, smoother(uIntro)) / max(uScale, 0.001);\r
  float reveal = 1.0 - smoothstep(introFront - 0.05, introFront + 0.3, coord);\r
  float introHead = exp(-abs(coord - introFront) * 14.0) * (1.0 - uIntro) * step(0.0001, 1.0 - uIntro);\r
  reveal = mix(reveal, 1.0, step(0.9999, uIntro));\r
\r
  float lit = clamp(sweep * 0.86 + lens * uMouseStrength * 0.7 + pingLight * 0.9 + introHead, 0.0, 1.6);\r
  float hot = clamp(head + introHead + pingLight * 0.35, 0.0, 1.0);\r
\r
  float lc = coord * uDensity;\r
  float width = uLineWidth * (1.0 + lit * 1.4 + hot * 0.9);\r
  float thread = 0.62 + 0.38 * hash(vec2(floor(lc + 0.5), 3.7));\r
  float split = uSpread * (0.5 + lit * 1.3) * max(fwidth(lc), 1e-5);\r
  float cg = coverage(lc, width);\r
  float cr = coverage(lc + split, width);\r
  float cb = coverage(lc - split, width);\r
\r
  float fw = max(fwidth(lc), 1e-5);\r
  float dist = abs(fract(lc + 0.5) - 0.5) / fw;\r
  float crowd = smoothstep(0.2, 0.55, fw);\r
  float halo = exp(-dist / (3.0 + uGlow * 9.0)) * (1.0 - crowd) * uGlow * lit * 1.15;\r
\r
  float base = 0.11 * reveal;\r
  float level = (base + lit * (1.0 - base)) * thread * uBrightness;\r
\r
  vec3 tone = mix(uColor1, uColor2, smoothstep(0.05, 0.75, lit));\r
  tone = mix(tone, uColor3, hot);\r
  vec3 haloTone = mix(uColor1, uColor2, 0.65);\r
\r
  float vx = smoother((1.0 - abs(uv.x / (uResolution.x / uResolution.y))) / 0.6);\r
  float vy = smoother((1.0 - abs(uv.y)) / 0.6);\r
  float vignette = mix(1.0, vx * vy, uVignette);\r
\r
  vec3 cover3 = vec3(cr, cg, cb);\r
  float alphaLine = max(max(cr, cg), cb) * level;\r
  vec3 colLine = tone * cover3 * level;\r
\r
  float grain = (hash(gl_FragCoord.xy + fract(uTime) * 91.7) - 0.5) * uGrain;\r
  float scan = 1.0 - uScanline * 0.55 * (0.5 + 0.5 * cos(gl_FragCoord.y * 6.2831853 / (3.0 * uRatio)));\r
\r
  if (uLightMode > 0.5) {\r
    float ink = clamp(alphaLine * vignette * scan, 0.0, 1.0);\r
    float wash = clamp(halo * 0.28 * vignette, 0.0, 1.0);\r
    float alpha = clamp(ink + wash * (1.0 - ink) + grain * 0.5 * ink, 0.0, 1.0) * uOpacity;\r
    vec3 col = (tone * ink + haloTone * wash * (1.0 - ink)) / max(ink + wash * (1.0 - ink), 1e-4);\r
    fragColor = vec4(col * alpha, alpha);\r
    return;\r
  }\r
\r
  vec3 col = (colLine + haloTone * halo) * vignette * scan;\r
  float alpha = clamp(max(alphaLine, halo) * vignette * scan + grain * max(alphaLine, 0.04), 0.0, 1.0);\r
  col = clamp(col + grain * 0.6 * alpha, 0.0, 1.0);\r
  col = min(col, vec3(alpha));\r
  fragColor = vec4(col * uOpacity, alpha * uOpacity);\r
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
  const total = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
  for (let i = 0; i < total; i++) {\r
    const info = gl.getActiveUniform(program, i);\r
    if (info) uniforms[info.name.replace(/\\[0\\]$/, '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const toRgb = hex => {\r
  let h = String(hex || '#ffffff')\r
    .replace('#', '')\r
    .trim();\r
  if (h.length === 3 || h.length === 4)\r
    h = h\r
      .slice(0, 3)\r
      .split('')\r
      .map(c => c + c)\r
      .join('');\r
  const num = parseInt(h.slice(0, 6), 16);\r
  if (Number.isNaN(num)) return [1, 1, 1];\r
  return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];\r
};\r
\r
const Scanner = ({\r
  color1 = '#5227FF',\r
  color2 = '#FF9FFC',\r
  color3 = '#FFFFFF',\r
  speed = 0.5,\r
  sweepSpeed = 0.25,\r
  sweepWidth = 1.6,\r
  trail = 0.5,\r
  reverse = false,\r
  scale = 1.5,\r
  frequency = 2,\r
  ripple = 0.22,\r
  bandDensity = 11,\r
  lineWidth = 1.2,\r
  glow = 0.6,\r
  scanDirection = 'vertical',\r
  colorSpread = 0.7,\r
  brightness = 1,\r
  vignette = 0.3,\r
  scanline = true,\r
  scanlineIntensity = 0.5,\r
  grain = true,\r
  grainIntensity = 0.04,\r
  opacity = 1,\r
  mouseInteraction = true,\r
  mouseRadius = 0.5,\r
  mouseStrength = 0.7,\r
  mouseMode = 'repel',\r
  clickEffect = 'ping',\r
  intro = true,\r
  lightMode = false,\r
  dpr,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settings = {\r
    color1,\r
    color2,\r
    color3,\r
    speed,\r
    sweepSpeed: reverse ? -sweepSpeed : sweepSpeed,\r
    sweepWidth: Math.max(0.05, sweepWidth),\r
    trail: clamp(trail, 0, 1),\r
    scale: Math.max(0.05, scale),\r
    frequency,\r
    ripple,\r
    bandDensity: Math.max(0.5, bandDensity),\r
    lineWidth: Math.max(0.2, lineWidth),\r
    glow: Math.max(0, glow),\r
    direction: DIRECTIONS[scanDirection] ?? 0,\r
    colorSpread: clamp(colorSpread, 0, 1),\r
    brightness: Math.max(0, brightness),\r
    vignette: clamp(vignette, 0, 1),\r
    scanline: scanline ? clamp(scanlineIntensity, 0, 1) : 0,\r
    grain: grain ? Math.max(0, grainIntensity) : 0,\r
    opacity: clamp(opacity, 0, 1),\r
    mouseInteraction,\r
    mouseRadius: Math.max(0.05, mouseRadius),\r
    mouseStrength: Math.max(0, mouseStrength),\r
    attract: mouseMode === 'attract',\r
    clickEffect,\r
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
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
    const shader = link(gl);\r
    if (!shader) return undefined;\r
    const u = shader.uniforms;\r
    const vao = gl.createVertexArray();\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1, ratio: 1 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const mouse = { x: 0, y: 0, ready: false };\r
    const pings = new Float32Array(MAX_PINGS * 3);\r
    for (let k = 0; k < MAX_PINGS; k++) pings[k * 3 + 2] = -1;\r
    let pingIndex = 0;\r
    let presence = 0;\r
    let wave = 0;\r
    let sweep = -0.39;\r
    let clock = 0;\r
    let introClock = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let quiet = 0;\r
\r
    const toUv = (x, y) => [(x * 2 - view.width) / view.height, (view.height - y * 2) / view.height];\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.useProgram(shader.program);\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(u.uWave, wave);\r
      gl.uniform1f(u.uSweep, sweep);\r
      gl.uniform1f(u.uSweepWidth, s.sweepWidth);\r
      gl.uniform1f(u.uTrail, s.trail);\r
      gl.uniform1f(u.uScale, s.scale);\r
      gl.uniform1f(u.uFrequency, s.frequency);\r
      gl.uniform1f(u.uRipple, s.ripple);\r
      gl.uniform1f(u.uDensity, s.bandDensity);\r
      gl.uniform1f(u.uLineWidth, s.lineWidth * view.ratio);\r
      gl.uniform1f(u.uGlow, s.glow);\r
      gl.uniform1f(u.uDirection, s.direction);\r
      gl.uniform1f(u.uSpread, s.colorSpread);\r
      gl.uniform1f(u.uBrightness, s.brightness);\r
      gl.uniform1f(u.uVignette, s.vignette);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.uniform1f(u.uScanline, s.scanline);\r
      gl.uniform1f(u.uRatio, view.ratio);\r
      gl.uniform1f(u.uGrain, s.grain);\r
      gl.uniform1f(u.uTime, clock);\r
      gl.uniform2f(u.uMouse, mouse.x, mouse.y);\r
      gl.uniform1f(u.uPresence, s.mouseInteraction ? presence : 0);\r
      gl.uniform1f(u.uMouseRadius, s.mouseRadius);\r
      gl.uniform1f(u.uMouseStrength, s.mouseStrength);\r
      gl.uniform1f(u.uAttract, s.attract ? 1 : 0);\r
      gl.uniform3fv(u.uPings, pings);\r
      gl.uniform1f(u.uIntro, introClock);\r
      gl.uniform1f(u.uLightMode, s.lightMode ? 1 : 0);\r
      gl.uniform3fv(u.uColor1, toRgb(s.color1));\r
      gl.uniform3fv(u.uColor2, toRgb(s.color2));\r
      gl.uniform3fv(u.uColor3, toRgb(s.color3));\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      gl.bindVertexArray(vao);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    let sizedDpr = settingsRef.current.dpr;\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      sizedDpr = s.dpr;\r
      view.width = Math.max(1, container.clientWidth);\r
      view.height = Math.max(1, container.clientHeight);\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(view.width * view.ratio));\r
      canvas.height = Math.max(1, Math.round(view.height * view.ratio));\r
      draw();\r
      wake();\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      if (s.dpr !== sizedDpr) resize();\r
      const dt = last ? clamp((now - last) / 1000, 0, 1 / 20) : 1 / 60;\r
      last = now;\r
      clock += dt;\r
      if (!reduce) {\r
        wave += dt * s.speed;\r
        sweep += dt * s.sweepSpeed;\r
      }\r
      if (introClock < 1) introClock = Math.min(1, introClock + dt / INTRO_SECONDS);\r
      const target = toUv(pointer.x, pointer.y);\r
      const follow = 1 - Math.exp(-dt / 0.09);\r
      mouse.x += (target[0] - mouse.x) * follow;\r
      mouse.y += (target[1] - mouse.y) * follow;\r
      presence += ((pointer.inside && s.mouseInteraction ? 1 : 0) - presence) * (1 - Math.exp(-dt / 0.3));\r
      let busy = (!reduce && (s.speed !== 0 || s.sweepSpeed !== 0)) || introClock < 1 || presence > 0.001;\r
      for (let k = 0; k < MAX_PINGS; k++) {\r
        if (pings[k * 3 + 2] < 0) continue;\r
        pings[k * 3 + 2] += dt;\r
        if (pings[k * 3 + 2] > 4) pings[k * 3 + 2] = -1;\r
        else busy = true;\r
      }\r
      draw();\r
      quiet = busy ? 0 : quiet + dt;\r
      if (quiet < 0.5) raf = requestAnimationFrame(frame);\r
    };\r
\r
    function wake() {\r
      quiet = 0;\r
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
      const was = pointer.inside;\r
      pointer.inside = inside;\r
      if (inside) {\r
        pointer.x = x;\r
        pointer.y = y;\r
        if (!was || !mouse.ready) {\r
          const [ux, uy] = toUv(x, y);\r
          mouse.x = ux;\r
          mouse.y = uy;\r
          mouse.ready = true;\r
        }\r
      }\r
      if (inside || was) wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      if (s.clickEffect !== 'ping' || reduce) return;\r
      const { x, y, inside } = locate(event);\r
      if (!inside) return;\r
      const [ux, uy] = toUv(x, y);\r
      pings[pingIndex * 3] = ux;\r
      pings[pingIndex * 3 + 1] = uy;\r
      pings[pingIndex * 3 + 2] = 0;\r
      pingIndex = (pingIndex + 1) % MAX_PINGS;\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
    const onVisibility = () => wake();\r
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
      className={['relative w-full h-full overflow-hidden', className].filter(Boolean).join(' ')}\r
      style={style}\r
    >\r
      <canvas ref={canvasRef} className="block w-full h-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Scanner;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties } from 'react';\r
import './Scanner.css';\r
\r
const MAX_PINGS = 6;\r
const INTRO_SECONDS = 2;\r
export type ScannerDirection = 'vertical' | 'horizontal' | 'diagonal';\r
\r
export interface ScannerProps {\r
  color1?: string;\r
  color2?: string;\r
  color3?: string;\r
  speed?: number;\r
  sweepSpeed?: number;\r
  sweepWidth?: number;\r
  trail?: number;\r
  reverse?: boolean;\r
  scale?: number;\r
  frequency?: number;\r
  ripple?: number;\r
  bandDensity?: number;\r
  lineWidth?: number;\r
  glow?: number;\r
  scanDirection?: ScannerDirection;\r
  colorSpread?: number;\r
  brightness?: number;\r
  vignette?: number;\r
  scanline?: boolean;\r
  scanlineIntensity?: number;\r
  grain?: boolean;\r
  grainIntensity?: number;\r
  opacity?: number;\r
  mouseInteraction?: boolean;\r
  mouseRadius?: number;\r
  mouseStrength?: number;\r
  mouseMode?: 'repel' | 'attract';\r
  clickEffect?: 'ping' | 'none';\r
  intro?: boolean;\r
  lightMode?: boolean;\r
  dpr?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
const DIRECTIONS: Record<string, number> = { vertical: 0, horizontal: 1, diagonal: 2 };\r
\r
const VERTEX = \`#version 300 es\r
void main() {\r
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\r
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
\r
uniform vec2 uResolution;\r
uniform float uWave;\r
uniform float uSweep;\r
uniform float uSweepWidth;\r
uniform float uTrail;\r
uniform float uScale;\r
uniform float uFrequency;\r
uniform float uRipple;\r
uniform float uDensity;\r
uniform float uLineWidth;\r
uniform float uGlow;\r
uniform float uDirection;\r
uniform float uSpread;\r
uniform float uBrightness;\r
uniform float uVignette;\r
uniform float uOpacity;\r
uniform float uScanline;\r
uniform float uRatio;\r
uniform float uGrain;\r
uniform float uTime;\r
uniform vec2 uMouse;\r
uniform float uPresence;\r
uniform float uMouseRadius;\r
uniform float uMouseStrength;\r
uniform float uAttract;\r
uniform vec3 uPings[\${MAX_PINGS}];\r
uniform float uIntro;\r
uniform float uLightMode;\r
uniform vec3 uColor1;\r
uniform vec3 uColor2;\r
uniform vec3 uColor3;\r
\r
out vec4 fragColor;\r
\r
float hash(vec2 p) {\r
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);\r
}\r
\r
float signal(vec2 p, float t) {\r
  float w = sin(p.x * 1.3 + t * 0.7);\r
  w += sin(p.y * 1.7 - t * 0.52) * 0.8;\r
  w += sin((p.x + p.y) * 0.9 + t * 0.91) * 0.6;\r
  w += sin((p.x - p.y) * 1.53 - t * 0.63) * 0.42;\r
  return w * 0.35;\r
}\r
\r
float smoother(float x) {\r
  x = clamp(x, 0.0, 1.0);\r
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);\r
}\r
\r
vec2 axes(vec2 p) {\r
  if (uDirection < 0.5) return vec2(p.y, p.x);\r
  if (uDirection < 1.5) return vec2(p.x, -p.y);\r
  return vec2((p.x + p.y) * 0.70710678, (p.x - p.y) * 0.70710678);\r
}\r
\r
float coverage(float lc, float width) {\r
  float fw = max(fwidth(lc), 1e-5);\r
  float dist = abs(fract(lc + 0.5) - 0.5) / fw;\r
  float crowd = smoothstep(0.2, 0.55, fw);\r
  float cover = clamp(width * 0.5 + 0.5 - dist, 0.0, 1.0) * min(width, 1.0);\r
  return mix(cover, min(width * fw, 1.0), crowd);\r
}\r
\r
void main() {\r
  vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution) / uResolution.y;\r
  vec2 p = uv / max(uScale, 0.001);\r
  vec2 ax = axes(p);\r
\r
  float sig = signal(p * uFrequency, uWave);\r
  float coord = ax.x + sig * uRipple;\r
\r
  vec2 mp = uMouse / max(uScale, 0.001);\r
  vec2 md = p - mp;\r
  float radius = max(uMouseRadius / max(uScale, 0.001), 0.01);\r
  float lens = exp(-dot(md, md) / (radius * radius)) * uPresence;\r
  float mouseAxis = axes(mp).x + signal(mp * uFrequency, uWave) * uRipple;\r
  coord -= (coord - mouseAxis) * lens * uMouseStrength * mix(0.55, -0.9, uAttract);\r
\r
  float pingLight = 0.0;\r
  for (int i = 0; i < \${MAX_PINGS}; i++) {\r
    vec3 ping = uPings[i];\r
    if (ping.z < 0.0) continue;\r
    float d = length(uv - ping.xy);\r
    float age = ping.z;\r
    float r = age * 1.1;\r
    float w = 0.12 + age * 0.1;\r
    float band = exp(-((d - r) * (d - r)) / (w * w));\r
    float fade = exp(-age * 0.9) * smoothstep(0.0, 0.12, age);\r
    coord += band * fade * 0.018 / max(uScale, 0.001);\r
    pingLight += band * fade;\r
  }\r
\r
  float u = fract(uSweep - coord / max(uSweepWidth, 0.05));\r
  float tail = mix(11.0, 1.8, clamp(uTrail, 0.0, 1.0));\r
  float lead = smoothstep(0.84, 1.0, u);\r
  lead *= lead;\r
  float sweep = max(exp(-u * tail), lead);\r
  float head = max(exp(-u * 26.0), lead * lead * lead);\r
\r
  float introFront = mix(-1.6, 1.6, smoother(uIntro)) / max(uScale, 0.001);\r
  float reveal = 1.0 - smoothstep(introFront - 0.05, introFront + 0.3, coord);\r
  float introHead = exp(-abs(coord - introFront) * 14.0) * (1.0 - uIntro) * step(0.0001, 1.0 - uIntro);\r
  reveal = mix(reveal, 1.0, step(0.9999, uIntro));\r
\r
  float lit = clamp(sweep * 0.86 + lens * uMouseStrength * 0.7 + pingLight * 0.9 + introHead, 0.0, 1.6);\r
  float hot = clamp(head + introHead + pingLight * 0.35, 0.0, 1.0);\r
\r
  float lc = coord * uDensity;\r
  float width = uLineWidth * (1.0 + lit * 1.4 + hot * 0.9);\r
  float thread = 0.62 + 0.38 * hash(vec2(floor(lc + 0.5), 3.7));\r
  float split = uSpread * (0.5 + lit * 1.3) * max(fwidth(lc), 1e-5);\r
  float cg = coverage(lc, width);\r
  float cr = coverage(lc + split, width);\r
  float cb = coverage(lc - split, width);\r
\r
  float fw = max(fwidth(lc), 1e-5);\r
  float dist = abs(fract(lc + 0.5) - 0.5) / fw;\r
  float crowd = smoothstep(0.2, 0.55, fw);\r
  float halo = exp(-dist / (3.0 + uGlow * 9.0)) * (1.0 - crowd) * uGlow * lit * 1.15;\r
\r
  float base = 0.11 * reveal;\r
  float level = (base + lit * (1.0 - base)) * thread * uBrightness;\r
\r
  vec3 tone = mix(uColor1, uColor2, smoothstep(0.05, 0.75, lit));\r
  tone = mix(tone, uColor3, hot);\r
  vec3 haloTone = mix(uColor1, uColor2, 0.65);\r
\r
  float vx = smoother((1.0 - abs(uv.x / (uResolution.x / uResolution.y))) / 0.6);\r
  float vy = smoother((1.0 - abs(uv.y)) / 0.6);\r
  float vignette = mix(1.0, vx * vy, uVignette);\r
\r
  vec3 cover3 = vec3(cr, cg, cb);\r
  float alphaLine = max(max(cr, cg), cb) * level;\r
  vec3 colLine = tone * cover3 * level;\r
\r
  float grain = (hash(gl_FragCoord.xy + fract(uTime) * 91.7) - 0.5) * uGrain;\r
  float scan = 1.0 - uScanline * 0.55 * (0.5 + 0.5 * cos(gl_FragCoord.y * 6.2831853 / (3.0 * uRatio)));\r
\r
  if (uLightMode > 0.5) {\r
    float ink = clamp(alphaLine * vignette * scan, 0.0, 1.0);\r
    float wash = clamp(halo * 0.28 * vignette, 0.0, 1.0);\r
    float alpha = clamp(ink + wash * (1.0 - ink) + grain * 0.5 * ink, 0.0, 1.0) * uOpacity;\r
    vec3 col = (tone * ink + haloTone * wash * (1.0 - ink)) / max(ink + wash * (1.0 - ink), 1e-4);\r
    fragColor = vec4(col * alpha, alpha);\r
    return;\r
  }\r
\r
  vec3 col = (colLine + haloTone * halo) * vignette * scan;\r
  float alpha = clamp(max(alphaLine, halo) * vignette * scan + grain * max(alphaLine, 0.04), 0.0, 1.0);\r
  col = clamp(col + grain * 0.6 * alpha, 0.0, 1.0);\r
  col = min(col, vec3(alpha));\r
  fragColor = vec4(col * uOpacity, alpha * uOpacity);\r
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
const link = (gl: WebGL2RenderingContext) => {\r
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
  const total = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
  for (let i = 0; i < total; i++) {\r
    const info = gl.getActiveUniform(program, i);\r
    if (info) uniforms[info.name.replace(/\\[0\\]$/, '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const toRgb = (hex: string): number[] => {\r
  let h = String(hex || '#ffffff')\r
    .replace('#', '')\r
    .trim();\r
  if (h.length === 3 || h.length === 4)\r
    h = h\r
      .slice(0, 3)\r
      .split('')\r
      .map(c => c + c)\r
      .join('');\r
  const num = parseInt(h.slice(0, 6), 16);\r
  if (Number.isNaN(num)) return [1, 1, 1];\r
  return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];\r
};\r
\r
const Scanner = ({\r
  color1 = '#5227FF',\r
  color2 = '#FF9FFC',\r
  color3 = '#FFFFFF',\r
  speed = 0.5,\r
  sweepSpeed = 0.25,\r
  sweepWidth = 1.6,\r
  trail = 0.5,\r
  reverse = false,\r
  scale = 1.5,\r
  frequency = 2,\r
  ripple = 0.22,\r
  bandDensity = 11,\r
  lineWidth = 1.2,\r
  glow = 0.6,\r
  scanDirection = 'vertical',\r
  colorSpread = 0.7,\r
  brightness = 1,\r
  vignette = 0.3,\r
  scanline = true,\r
  scanlineIntensity = 0.5,\r
  grain = true,\r
  grainIntensity = 0.04,\r
  opacity = 1,\r
  mouseInteraction = true,\r
  mouseRadius = 0.5,\r
  mouseStrength = 0.7,\r
  mouseMode = 'repel',\r
  clickEffect = 'ping',\r
  intro = true,\r
  lightMode = false,\r
  dpr,\r
  className = '',\r
  style\r
}: ScannerProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings = {\r
    color1,\r
    color2,\r
    color3,\r
    speed,\r
    sweepSpeed: reverse ? -sweepSpeed : sweepSpeed,\r
    sweepWidth: Math.max(0.05, sweepWidth),\r
    trail: clamp(trail, 0, 1),\r
    scale: Math.max(0.05, scale),\r
    frequency,\r
    ripple,\r
    bandDensity: Math.max(0.5, bandDensity),\r
    lineWidth: Math.max(0.2, lineWidth),\r
    glow: Math.max(0, glow),\r
    direction: DIRECTIONS[scanDirection] ?? 0,\r
    colorSpread: clamp(colorSpread, 0, 1),\r
    brightness: Math.max(0, brightness),\r
    vignette: clamp(vignette, 0, 1),\r
    scanline: scanline ? clamp(scanlineIntensity, 0, 1) : 0,\r
    grain: grain ? Math.max(0, grainIntensity) : 0,\r
    opacity: clamp(opacity, 0, 1),\r
    mouseInteraction,\r
    mouseRadius: Math.max(0.05, mouseRadius),\r
    mouseStrength: Math.max(0, mouseStrength),\r
    attract: mouseMode === 'attract',\r
    clickEffect,\r
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
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
    const shader = link(gl);\r
    if (!shader) return undefined;\r
    const u = shader.uniforms;\r
    const vao = gl.createVertexArray();\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1, ratio: 1 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const mouse = { x: 0, y: 0, ready: false };\r
    const pings = new Float32Array(MAX_PINGS * 3);\r
    for (let k = 0; k < MAX_PINGS; k++) pings[k * 3 + 2] = -1;\r
    let pingIndex = 0;\r
    let presence = 0;\r
    let wave = 0;\r
    let sweep = -0.39;\r
    let clock = 0;\r
    let introClock = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let quiet = 0;\r
\r
    const toUv = (x: number, y: number) => [(x * 2 - view.width) / view.height, (view.height - y * 2) / view.height];\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.useProgram(shader.program);\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(u.uWave, wave);\r
      gl.uniform1f(u.uSweep, sweep);\r
      gl.uniform1f(u.uSweepWidth, s.sweepWidth);\r
      gl.uniform1f(u.uTrail, s.trail);\r
      gl.uniform1f(u.uScale, s.scale);\r
      gl.uniform1f(u.uFrequency, s.frequency);\r
      gl.uniform1f(u.uRipple, s.ripple);\r
      gl.uniform1f(u.uDensity, s.bandDensity);\r
      gl.uniform1f(u.uLineWidth, s.lineWidth * view.ratio);\r
      gl.uniform1f(u.uGlow, s.glow);\r
      gl.uniform1f(u.uDirection, s.direction);\r
      gl.uniform1f(u.uSpread, s.colorSpread);\r
      gl.uniform1f(u.uBrightness, s.brightness);\r
      gl.uniform1f(u.uVignette, s.vignette);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.uniform1f(u.uScanline, s.scanline);\r
      gl.uniform1f(u.uRatio, view.ratio);\r
      gl.uniform1f(u.uGrain, s.grain);\r
      gl.uniform1f(u.uTime, clock);\r
      gl.uniform2f(u.uMouse, mouse.x, mouse.y);\r
      gl.uniform1f(u.uPresence, s.mouseInteraction ? presence : 0);\r
      gl.uniform1f(u.uMouseRadius, s.mouseRadius);\r
      gl.uniform1f(u.uMouseStrength, s.mouseStrength);\r
      gl.uniform1f(u.uAttract, s.attract ? 1 : 0);\r
      gl.uniform3fv(u.uPings, pings);\r
      gl.uniform1f(u.uIntro, introClock);\r
      gl.uniform1f(u.uLightMode, s.lightMode ? 1 : 0);\r
      gl.uniform3fv(u.uColor1, toRgb(s.color1));\r
      gl.uniform3fv(u.uColor2, toRgb(s.color2));\r
      gl.uniform3fv(u.uColor3, toRgb(s.color3));\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      gl.bindVertexArray(vao);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    let sizedDpr = settingsRef.current.dpr;\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      sizedDpr = s.dpr;\r
      view.width = Math.max(1, container.clientWidth);\r
      view.height = Math.max(1, container.clientHeight);\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(view.width * view.ratio));\r
      canvas.height = Math.max(1, Math.round(view.height * view.ratio));\r
      draw();\r
      wake();\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      if (s.dpr !== sizedDpr) resize();\r
      const dt = last ? clamp((now - last) / 1000, 0, 1 / 20) : 1 / 60;\r
      last = now;\r
      clock += dt;\r
      if (!reduce) {\r
        wave += dt * s.speed;\r
        sweep += dt * s.sweepSpeed;\r
      }\r
      if (introClock < 1) introClock = Math.min(1, introClock + dt / INTRO_SECONDS);\r
      const target = toUv(pointer.x, pointer.y);\r
      const follow = 1 - Math.exp(-dt / 0.09);\r
      mouse.x += (target[0] - mouse.x) * follow;\r
      mouse.y += (target[1] - mouse.y) * follow;\r
      presence += ((pointer.inside && s.mouseInteraction ? 1 : 0) - presence) * (1 - Math.exp(-dt / 0.3));\r
      let busy = (!reduce && (s.speed !== 0 || s.sweepSpeed !== 0)) || introClock < 1 || presence > 0.001;\r
      for (let k = 0; k < MAX_PINGS; k++) {\r
        if (pings[k * 3 + 2] < 0) continue;\r
        pings[k * 3 + 2] += dt;\r
        if (pings[k * 3 + 2] > 4) pings[k * 3 + 2] = -1;\r
        else busy = true;\r
      }\r
      draw();\r
      quiet = busy ? 0 : quiet + dt;\r
      if (quiet < 0.5) raf = requestAnimationFrame(frame);\r
    };\r
\r
    function wake() {\r
      quiet = 0;\r
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
      const was = pointer.inside;\r
      pointer.inside = inside;\r
      if (inside) {\r
        pointer.x = x;\r
        pointer.y = y;\r
        if (!was || !mouse.ready) {\r
          const [ux, uy] = toUv(x, y);\r
          mouse.x = ux;\r
          mouse.y = uy;\r
          mouse.ready = true;\r
        }\r
      }\r
      if (inside || was) wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      if (s.clickEffect !== 'ping' || reduce) return;\r
      const { x, y, inside } = locate(event);\r
      if (!inside) return;\r
      const [ux, uy] = toUv(x, y);\r
      pings[pingIndex * 3] = ux;\r
      pings[pingIndex * 3 + 1] = uy;\r
      pings[pingIndex * 3 + 2] = 0;\r
      pingIndex = (pingIndex + 1) % MAX_PINGS;\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
    const onVisibility = () => wake();\r
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
    <div ref={containerRef} className={\`scanner-container \${className}\`.trim()} style={style}>\r
      <canvas ref={canvasRef} className="scanner-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Scanner;\r
`,o=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties } from 'react';\r
\r
const MAX_PINGS = 6;\r
const INTRO_SECONDS = 2;\r
export type ScannerDirection = 'vertical' | 'horizontal' | 'diagonal';\r
\r
export interface ScannerProps {\r
  color1?: string;\r
  color2?: string;\r
  color3?: string;\r
  speed?: number;\r
  sweepSpeed?: number;\r
  sweepWidth?: number;\r
  trail?: number;\r
  reverse?: boolean;\r
  scale?: number;\r
  frequency?: number;\r
  ripple?: number;\r
  bandDensity?: number;\r
  lineWidth?: number;\r
  glow?: number;\r
  scanDirection?: ScannerDirection;\r
  colorSpread?: number;\r
  brightness?: number;\r
  vignette?: number;\r
  scanline?: boolean;\r
  scanlineIntensity?: number;\r
  grain?: boolean;\r
  grainIntensity?: number;\r
  opacity?: number;\r
  mouseInteraction?: boolean;\r
  mouseRadius?: number;\r
  mouseStrength?: number;\r
  mouseMode?: 'repel' | 'attract';\r
  clickEffect?: 'ping' | 'none';\r
  intro?: boolean;\r
  lightMode?: boolean;\r
  dpr?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
const DIRECTIONS: Record<string, number> = { vertical: 0, horizontal: 1, diagonal: 2 };\r
\r
const VERTEX = \`#version 300 es\r
void main() {\r
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\r
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
\r
uniform vec2 uResolution;\r
uniform float uWave;\r
uniform float uSweep;\r
uniform float uSweepWidth;\r
uniform float uTrail;\r
uniform float uScale;\r
uniform float uFrequency;\r
uniform float uRipple;\r
uniform float uDensity;\r
uniform float uLineWidth;\r
uniform float uGlow;\r
uniform float uDirection;\r
uniform float uSpread;\r
uniform float uBrightness;\r
uniform float uVignette;\r
uniform float uOpacity;\r
uniform float uScanline;\r
uniform float uRatio;\r
uniform float uGrain;\r
uniform float uTime;\r
uniform vec2 uMouse;\r
uniform float uPresence;\r
uniform float uMouseRadius;\r
uniform float uMouseStrength;\r
uniform float uAttract;\r
uniform vec3 uPings[\${MAX_PINGS}];\r
uniform float uIntro;\r
uniform float uLightMode;\r
uniform vec3 uColor1;\r
uniform vec3 uColor2;\r
uniform vec3 uColor3;\r
\r
out vec4 fragColor;\r
\r
float hash(vec2 p) {\r
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);\r
}\r
\r
float signal(vec2 p, float t) {\r
  float w = sin(p.x * 1.3 + t * 0.7);\r
  w += sin(p.y * 1.7 - t * 0.52) * 0.8;\r
  w += sin((p.x + p.y) * 0.9 + t * 0.91) * 0.6;\r
  w += sin((p.x - p.y) * 1.53 - t * 0.63) * 0.42;\r
  return w * 0.35;\r
}\r
\r
float smoother(float x) {\r
  x = clamp(x, 0.0, 1.0);\r
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);\r
}\r
\r
vec2 axes(vec2 p) {\r
  if (uDirection < 0.5) return vec2(p.y, p.x);\r
  if (uDirection < 1.5) return vec2(p.x, -p.y);\r
  return vec2((p.x + p.y) * 0.70710678, (p.x - p.y) * 0.70710678);\r
}\r
\r
float coverage(float lc, float width) {\r
  float fw = max(fwidth(lc), 1e-5);\r
  float dist = abs(fract(lc + 0.5) - 0.5) / fw;\r
  float crowd = smoothstep(0.2, 0.55, fw);\r
  float cover = clamp(width * 0.5 + 0.5 - dist, 0.0, 1.0) * min(width, 1.0);\r
  return mix(cover, min(width * fw, 1.0), crowd);\r
}\r
\r
void main() {\r
  vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution) / uResolution.y;\r
  vec2 p = uv / max(uScale, 0.001);\r
  vec2 ax = axes(p);\r
\r
  float sig = signal(p * uFrequency, uWave);\r
  float coord = ax.x + sig * uRipple;\r
\r
  vec2 mp = uMouse / max(uScale, 0.001);\r
  vec2 md = p - mp;\r
  float radius = max(uMouseRadius / max(uScale, 0.001), 0.01);\r
  float lens = exp(-dot(md, md) / (radius * radius)) * uPresence;\r
  float mouseAxis = axes(mp).x + signal(mp * uFrequency, uWave) * uRipple;\r
  coord -= (coord - mouseAxis) * lens * uMouseStrength * mix(0.55, -0.9, uAttract);\r
\r
  float pingLight = 0.0;\r
  for (int i = 0; i < \${MAX_PINGS}; i++) {\r
    vec3 ping = uPings[i];\r
    if (ping.z < 0.0) continue;\r
    float d = length(uv - ping.xy);\r
    float age = ping.z;\r
    float r = age * 1.1;\r
    float w = 0.12 + age * 0.1;\r
    float band = exp(-((d - r) * (d - r)) / (w * w));\r
    float fade = exp(-age * 0.9) * smoothstep(0.0, 0.12, age);\r
    coord += band * fade * 0.018 / max(uScale, 0.001);\r
    pingLight += band * fade;\r
  }\r
\r
  float u = fract(uSweep - coord / max(uSweepWidth, 0.05));\r
  float tail = mix(11.0, 1.8, clamp(uTrail, 0.0, 1.0));\r
  float lead = smoothstep(0.84, 1.0, u);\r
  lead *= lead;\r
  float sweep = max(exp(-u * tail), lead);\r
  float head = max(exp(-u * 26.0), lead * lead * lead);\r
\r
  float introFront = mix(-1.6, 1.6, smoother(uIntro)) / max(uScale, 0.001);\r
  float reveal = 1.0 - smoothstep(introFront - 0.05, introFront + 0.3, coord);\r
  float introHead = exp(-abs(coord - introFront) * 14.0) * (1.0 - uIntro) * step(0.0001, 1.0 - uIntro);\r
  reveal = mix(reveal, 1.0, step(0.9999, uIntro));\r
\r
  float lit = clamp(sweep * 0.86 + lens * uMouseStrength * 0.7 + pingLight * 0.9 + introHead, 0.0, 1.6);\r
  float hot = clamp(head + introHead + pingLight * 0.35, 0.0, 1.0);\r
\r
  float lc = coord * uDensity;\r
  float width = uLineWidth * (1.0 + lit * 1.4 + hot * 0.9);\r
  float thread = 0.62 + 0.38 * hash(vec2(floor(lc + 0.5), 3.7));\r
  float split = uSpread * (0.5 + lit * 1.3) * max(fwidth(lc), 1e-5);\r
  float cg = coverage(lc, width);\r
  float cr = coverage(lc + split, width);\r
  float cb = coverage(lc - split, width);\r
\r
  float fw = max(fwidth(lc), 1e-5);\r
  float dist = abs(fract(lc + 0.5) - 0.5) / fw;\r
  float crowd = smoothstep(0.2, 0.55, fw);\r
  float halo = exp(-dist / (3.0 + uGlow * 9.0)) * (1.0 - crowd) * uGlow * lit * 1.15;\r
\r
  float base = 0.11 * reveal;\r
  float level = (base + lit * (1.0 - base)) * thread * uBrightness;\r
\r
  vec3 tone = mix(uColor1, uColor2, smoothstep(0.05, 0.75, lit));\r
  tone = mix(tone, uColor3, hot);\r
  vec3 haloTone = mix(uColor1, uColor2, 0.65);\r
\r
  float vx = smoother((1.0 - abs(uv.x / (uResolution.x / uResolution.y))) / 0.6);\r
  float vy = smoother((1.0 - abs(uv.y)) / 0.6);\r
  float vignette = mix(1.0, vx * vy, uVignette);\r
\r
  vec3 cover3 = vec3(cr, cg, cb);\r
  float alphaLine = max(max(cr, cg), cb) * level;\r
  vec3 colLine = tone * cover3 * level;\r
\r
  float grain = (hash(gl_FragCoord.xy + fract(uTime) * 91.7) - 0.5) * uGrain;\r
  float scan = 1.0 - uScanline * 0.55 * (0.5 + 0.5 * cos(gl_FragCoord.y * 6.2831853 / (3.0 * uRatio)));\r
\r
  if (uLightMode > 0.5) {\r
    float ink = clamp(alphaLine * vignette * scan, 0.0, 1.0);\r
    float wash = clamp(halo * 0.28 * vignette, 0.0, 1.0);\r
    float alpha = clamp(ink + wash * (1.0 - ink) + grain * 0.5 * ink, 0.0, 1.0) * uOpacity;\r
    vec3 col = (tone * ink + haloTone * wash * (1.0 - ink)) / max(ink + wash * (1.0 - ink), 1e-4);\r
    fragColor = vec4(col * alpha, alpha);\r
    return;\r
  }\r
\r
  vec3 col = (colLine + haloTone * halo) * vignette * scan;\r
  float alpha = clamp(max(alphaLine, halo) * vignette * scan + grain * max(alphaLine, 0.04), 0.0, 1.0);\r
  col = clamp(col + grain * 0.6 * alpha, 0.0, 1.0);\r
  col = min(col, vec3(alpha));\r
  fragColor = vec4(col * uOpacity, alpha * uOpacity);\r
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
const link = (gl: WebGL2RenderingContext) => {\r
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
  const total = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
  for (let i = 0; i < total; i++) {\r
    const info = gl.getActiveUniform(program, i);\r
    if (info) uniforms[info.name.replace(/\\[0\\]$/, '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const toRgb = (hex: string): number[] => {\r
  let h = String(hex || '#ffffff')\r
    .replace('#', '')\r
    .trim();\r
  if (h.length === 3 || h.length === 4)\r
    h = h\r
      .slice(0, 3)\r
      .split('')\r
      .map(c => c + c)\r
      .join('');\r
  const num = parseInt(h.slice(0, 6), 16);\r
  if (Number.isNaN(num)) return [1, 1, 1];\r
  return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];\r
};\r
\r
const Scanner = ({\r
  color1 = '#5227FF',\r
  color2 = '#FF9FFC',\r
  color3 = '#FFFFFF',\r
  speed = 0.5,\r
  sweepSpeed = 0.25,\r
  sweepWidth = 1.6,\r
  trail = 0.5,\r
  reverse = false,\r
  scale = 1.5,\r
  frequency = 2,\r
  ripple = 0.22,\r
  bandDensity = 11,\r
  lineWidth = 1.2,\r
  glow = 0.6,\r
  scanDirection = 'vertical',\r
  colorSpread = 0.7,\r
  brightness = 1,\r
  vignette = 0.3,\r
  scanline = true,\r
  scanlineIntensity = 0.5,\r
  grain = true,\r
  grainIntensity = 0.04,\r
  opacity = 1,\r
  mouseInteraction = true,\r
  mouseRadius = 0.5,\r
  mouseStrength = 0.7,\r
  mouseMode = 'repel',\r
  clickEffect = 'ping',\r
  intro = true,\r
  lightMode = false,\r
  dpr,\r
  className = '',\r
  style\r
}: ScannerProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings = {\r
    color1,\r
    color2,\r
    color3,\r
    speed,\r
    sweepSpeed: reverse ? -sweepSpeed : sweepSpeed,\r
    sweepWidth: Math.max(0.05, sweepWidth),\r
    trail: clamp(trail, 0, 1),\r
    scale: Math.max(0.05, scale),\r
    frequency,\r
    ripple,\r
    bandDensity: Math.max(0.5, bandDensity),\r
    lineWidth: Math.max(0.2, lineWidth),\r
    glow: Math.max(0, glow),\r
    direction: DIRECTIONS[scanDirection] ?? 0,\r
    colorSpread: clamp(colorSpread, 0, 1),\r
    brightness: Math.max(0, brightness),\r
    vignette: clamp(vignette, 0, 1),\r
    scanline: scanline ? clamp(scanlineIntensity, 0, 1) : 0,\r
    grain: grain ? Math.max(0, grainIntensity) : 0,\r
    opacity: clamp(opacity, 0, 1),\r
    mouseInteraction,\r
    mouseRadius: Math.max(0.05, mouseRadius),\r
    mouseStrength: Math.max(0, mouseStrength),\r
    attract: mouseMode === 'attract',\r
    clickEffect,\r
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
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
    const shader = link(gl);\r
    if (!shader) return undefined;\r
    const u = shader.uniforms;\r
    const vao = gl.createVertexArray();\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1, ratio: 1 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const mouse = { x: 0, y: 0, ready: false };\r
    const pings = new Float32Array(MAX_PINGS * 3);\r
    for (let k = 0; k < MAX_PINGS; k++) pings[k * 3 + 2] = -1;\r
    let pingIndex = 0;\r
    let presence = 0;\r
    let wave = 0;\r
    let sweep = -0.39;\r
    let clock = 0;\r
    let introClock = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let quiet = 0;\r
\r
    const toUv = (x: number, y: number) => [(x * 2 - view.width) / view.height, (view.height - y * 2) / view.height];\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.useProgram(shader.program);\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform1f(u.uWave, wave);\r
      gl.uniform1f(u.uSweep, sweep);\r
      gl.uniform1f(u.uSweepWidth, s.sweepWidth);\r
      gl.uniform1f(u.uTrail, s.trail);\r
      gl.uniform1f(u.uScale, s.scale);\r
      gl.uniform1f(u.uFrequency, s.frequency);\r
      gl.uniform1f(u.uRipple, s.ripple);\r
      gl.uniform1f(u.uDensity, s.bandDensity);\r
      gl.uniform1f(u.uLineWidth, s.lineWidth * view.ratio);\r
      gl.uniform1f(u.uGlow, s.glow);\r
      gl.uniform1f(u.uDirection, s.direction);\r
      gl.uniform1f(u.uSpread, s.colorSpread);\r
      gl.uniform1f(u.uBrightness, s.brightness);\r
      gl.uniform1f(u.uVignette, s.vignette);\r
      gl.uniform1f(u.uOpacity, s.opacity);\r
      gl.uniform1f(u.uScanline, s.scanline);\r
      gl.uniform1f(u.uRatio, view.ratio);\r
      gl.uniform1f(u.uGrain, s.grain);\r
      gl.uniform1f(u.uTime, clock);\r
      gl.uniform2f(u.uMouse, mouse.x, mouse.y);\r
      gl.uniform1f(u.uPresence, s.mouseInteraction ? presence : 0);\r
      gl.uniform1f(u.uMouseRadius, s.mouseRadius);\r
      gl.uniform1f(u.uMouseStrength, s.mouseStrength);\r
      gl.uniform1f(u.uAttract, s.attract ? 1 : 0);\r
      gl.uniform3fv(u.uPings, pings);\r
      gl.uniform1f(u.uIntro, introClock);\r
      gl.uniform1f(u.uLightMode, s.lightMode ? 1 : 0);\r
      gl.uniform3fv(u.uColor1, toRgb(s.color1));\r
      gl.uniform3fv(u.uColor2, toRgb(s.color2));\r
      gl.uniform3fv(u.uColor3, toRgb(s.color3));\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      gl.bindVertexArray(vao);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    let sizedDpr = settingsRef.current.dpr;\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      sizedDpr = s.dpr;\r
      view.width = Math.max(1, container.clientWidth);\r
      view.height = Math.max(1, container.clientHeight);\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(view.width * view.ratio));\r
      canvas.height = Math.max(1, Math.round(view.height * view.ratio));\r
      draw();\r
      wake();\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      if (s.dpr !== sizedDpr) resize();\r
      const dt = last ? clamp((now - last) / 1000, 0, 1 / 20) : 1 / 60;\r
      last = now;\r
      clock += dt;\r
      if (!reduce) {\r
        wave += dt * s.speed;\r
        sweep += dt * s.sweepSpeed;\r
      }\r
      if (introClock < 1) introClock = Math.min(1, introClock + dt / INTRO_SECONDS);\r
      const target = toUv(pointer.x, pointer.y);\r
      const follow = 1 - Math.exp(-dt / 0.09);\r
      mouse.x += (target[0] - mouse.x) * follow;\r
      mouse.y += (target[1] - mouse.y) * follow;\r
      presence += ((pointer.inside && s.mouseInteraction ? 1 : 0) - presence) * (1 - Math.exp(-dt / 0.3));\r
      let busy = (!reduce && (s.speed !== 0 || s.sweepSpeed !== 0)) || introClock < 1 || presence > 0.001;\r
      for (let k = 0; k < MAX_PINGS; k++) {\r
        if (pings[k * 3 + 2] < 0) continue;\r
        pings[k * 3 + 2] += dt;\r
        if (pings[k * 3 + 2] > 4) pings[k * 3 + 2] = -1;\r
        else busy = true;\r
      }\r
      draw();\r
      quiet = busy ? 0 : quiet + dt;\r
      if (quiet < 0.5) raf = requestAnimationFrame(frame);\r
    };\r
\r
    function wake() {\r
      quiet = 0;\r
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
      const was = pointer.inside;\r
      pointer.inside = inside;\r
      if (inside) {\r
        pointer.x = x;\r
        pointer.y = y;\r
        if (!was || !mouse.ready) {\r
          const [ux, uy] = toUv(x, y);\r
          mouse.x = ux;\r
          mouse.y = uy;\r
          mouse.ready = true;\r
        }\r
      }\r
      if (inside || was) wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      if (s.clickEffect !== 'ping' || reduce) return;\r
      const { x, y, inside } = locate(event);\r
      if (!inside) return;\r
      const [ux, uy] = toUv(x, y);\r
      pings[pingIndex * 3] = ux;\r
      pings[pingIndex * 3 + 1] = uy;\r
      pings[pingIndex * 3 + 2] = 0;\r
      pingIndex = (pingIndex + 1) % MAX_PINGS;\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
    const onVisibility = () => wake();\r
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
      className={['relative w-full h-full overflow-hidden', className].filter(Boolean).join(' ')}\r
      style={style}\r
    >\r
      <canvas ref={canvasRef} className="block w-full h-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Scanner;\r
`,i={usage:`import Scanner from './Scanner';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <Scanner
    color1="#5227FF"
    color2="#FF9FFC"
    color3="#FFFFFF"
    speed={0.5}
    sweepSpeed={0.25}
    sweepWidth={1.6}
    trail={0.5}
    ripple={0.22}
    bandDensity={11}
    glow={0.6}
    scanDirection="vertical"
    colorSpread={0.7}
    scanline
    scanlineIntensity={0.5}
    mouseInteraction
    clickEffect="ping"
  />
</div>`,code:n,css:r,tailwind:e,tsCode:t,tsTailwind:o};export{i as scanner};
