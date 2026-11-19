const n=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
import './FloatingLines.css';\r
\r
const MAX_LINES = 24;\r
const MAX_STOPS = 8;\r
const MAX_CLICKS = 3;\r
const INTRO_SECONDS = 1.8;\r
const WAVES = ['top', 'middle', 'bottom'];\r
const WAVE_DEFAULTS = {\r
  top: { x: 10, y: 0.5, rotate: -0.4 },\r
  middle: { x: 5, y: 0, rotate: 0.2 },\r
  bottom: { x: 2, y: -0.7, rotate: -1 }\r
};\r
const WAVE_SHAPE = {\r
  top: { offset: 1, step: 0.2, light: 0.2, flip: 1, depth: 1, drift: 0.6 },\r
  middle: { offset: 2, step: 0.15, light: 1, flip: 0, depth: 0, drift: 1 },\r
  bottom: { offset: 1.5, step: 0.2, light: 0.32, flip: 0, depth: 0.6, drift: 1.4 }\r
};\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform vec2 uResolution;\r
uniform float uRatio;\r
uniform vec4 uWave[3];\r
uniform vec4 uShape[3];\r
uniform vec4 uParallax[3];\r
uniform int uCount[3];\r
uniform vec4 uLine[\${MAX_LINES * 3}];\r
uniform vec3 uLineColor[\${MAX_LINES * 3}];\r
uniform vec2 uMouseWarp[3];\r
uniform float uHaloReach;\r
uniform float uWidth;\r
uniform float uGlow;\r
uniform float uBrightness;\r
uniform float uFocus;\r
uniform float uEdgeFade;\r
uniform vec4 uMouse;\r
uniform float uBendRadius;\r
uniform float uBendStrength;\r
uniform vec4 uClicks[\${MAX_CLICKS}];\r
uniform float uLight;\r
uniform float uOpaque;\r
uniform vec3 uBackground;\r
uniform float uOpacity;\r
uniform float uStyle;\r
uniform float uSpacing;\r
out vec4 outColor;\r
\r
vec3 toSrgb(vec3 c) {\r
  return pow(max(c, 0.0), vec3(1.0 / 2.2));\r
}\r
\r
vec3 inkOf(vec3 color) {\r
  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));\r
  return color * min(1.0, 0.16 / max(luma, 0.001));\r
}\r
\r
vec2 warp(vec2 p, float rotate, float flip) {\r
  float angle = rotate * log(length(p) + 1.0);\r
  vec2 r = p * mat2(cos(angle), sin(angle), -sin(angle), cos(angle));\r
  if (flip > 0.5) r.x = -r.x;\r
  return r;\r
}\r
\r
void main() {\r
  vec2 screen = (2.0 * gl_FragCoord.xy - uResolution) / uResolution.y;\r
  screen.y = -screen.y;\r
  for (int k = 0; k < \${MAX_CLICKS}; k++) {\r
    vec4 click = uClicks[k];\r
    if (click.w == 0.0) continue;\r
    float age = click.z;\r
    float turn = 1.9 * smoothstep(0.0, 0.23, age) * exp(-max(age - 0.23, 0.0) * 1.1) * click.w;\r
    float spread = 0.3 * (1.0 + age * 0.55);\r
    vec2 offset = screen - click.xy;\r
    float angle = turn * exp(-dot(offset, offset) / (spread * spread));\r
    screen = click.xy + mat2(cos(angle), sin(angle), -sin(angle), cos(angle)) * offset;\r
  }\r
  vec3 light = vec3(0.0);\r
  vec3 bloom = vec3(0.0);\r
  vec3 inkColor = vec3(0.0);\r
  float inkAlpha = 0.0;\r
  float aa = 0.75 * uRatio;\r
  float invSigma = 1.0 / max(uBendRadius * uBendRadius, 1e-4);\r
  float tight = 1.0 / (2.6 * uRatio);\r
  float wide = 1.0 / (11.0 * uRatio);\r
\r
  for (int w = 0; w < 3; w++) {\r
    int count = uCount[w];\r
    if (count <= 0) continue;\r
    vec4 wave = uWave[w];\r
    vec4 shape = uShape[w];\r
    vec2 r = warp(screen + uParallax[w].xy, wave.z, shape.w);\r
    vec2 rm = uMouseWarp[w];\r
    float blur = uFocus * uParallax[w].z;\r
    float width = uWidth * (1.0 + blur * 2.5);\r
    float soft = aa * (1.0 + blur * 7.0);\r
    float energy = (uWidth + aa) / (width + soft) * shape.z;\r
    float cut = uHaloReach + width * 2.0 + soft;\r
    float sx = sin(r.x);\r
    float cx = cos(r.x);\r
    float along = r.x - rm.x;\r
    float pull = uMouse.z * exp(-along * along * invSigma);\r
    float level = r.y + wave.y;\r
    int first = w * \${MAX_LINES};\r
\r
    for (int i = 0; i < \${MAX_LINES}; i++) {\r
      if (i >= count) break;\r
      vec4 line = uLine[first + i];\r
      float y = (sx * line.x + cx * line.y) * line.z;\r
      float near = 0.0;\r
      if (pull > 0.002) {\r
        float across = (y - wave.y) - rm.y;\r
        near = exp(-across * across * invSigma) * pull;\r
        float push = uBendStrength * near;\r
        y += across * (uBendStrength < 0.0 ? min(-push, 2.5) : -min(push, 0.9));\r
      }\r
      float m = level - y;\r
      float slope = length(vec2(dFdx(m), dFdy(m)));\r
      float d = abs(m) / max(slope, 1e-5);\r
      if (d < cut) {\r
        float gap = d;\r
        float size = width;\r
        if (uStyle > 0.5) {\r
          float period = uSpacing / (uResolution.y * 0.5);\r
          float cell = (fract((r.x + line.w) / period + float(i) * 0.37) - 0.5) * uSpacing;\r
          float span = uStyle > 1.5 ? max(uSpacing * 0.32 - width, 0.0) : 0.0;\r
          gap = length(vec2(max(abs(cell) - span, 0.0), d));\r
          size = uStyle > 1.5 ? width : width * 1.6;\r
        }\r
        float core = smoothstep(size + soft, size - soft, gap);\r
        float fall = 1.0 - d / cut;\r
        float halo = (exp(-gap * tight) * 0.3 + exp(-d * wide) * 0.02 * fall * fall) * uGlow;\r
        vec3 color = uLineColor[first + i];\r
        float lift = 1.0 + near * 0.8;\r
        light += color * core * energy * lift;\r
        bloom += color * halo * shape.z * lift;\r
        float a = clamp(clamp(core * energy * 1.15 + halo * shape.z * 0.12, 0.0, 1.0) * lift, 0.0, 1.0);\r
        inkColor = inkOf(color) * a + inkColor * (1.0 - a);\r
        inkAlpha = a + inkAlpha * (1.0 - a);\r
      }\r
    }\r
  }\r
\r
  float edge = 1.0;\r
  if (uEdgeFade > 0.0) {\r
    float u = gl_FragCoord.x / uResolution.x;\r
    float fade = uEdgeFade * 0.45;\r
    float left = smoothstep(0.0, fade, u);\r
    float right = smoothstep(0.0, fade, 1.0 - u);\r
    edge = left * left * (3.0 - 2.0 * left) * right * right * (3.0 - 2.0 * right);\r
  }\r
\r
  if (uLight > 0.5) {\r
    float alpha = inkAlpha * edge * uOpacity;\r
    vec3 ink = toSrgb(inkColor / max(inkAlpha, 1e-4));\r
    if (uOpaque > 0.5) {\r
      outColor = vec4(mix(uBackground, ink, alpha), 1.0);\r
    } else {\r
      outColor = vec4(ink * alpha, alpha);\r
    }\r
    return;\r
  }\r
\r
  vec3 capped = 0.28 * (1.0 - exp(-bloom / 0.28));\r
  vec3 glow = toSrgb(1.0 - exp(-(light + capped) * uBrightness * 1.2)) * edge * uOpacity;\r
  if (uOpaque > 0.5) {\r
    outColor = vec4(uBackground + glow * (1.0 - uBackground), 1.0);\r
  } else {\r
    outColor = vec4(glow, max(glow.r, max(glow.g, glow.b)));\r
  }\r
}\`;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const warp = (x, y, rotate, flip) => {\r
  const angle = rotate * Math.log(Math.hypot(x, y) + 1);\r
  const cos = Math.cos(angle);\r
  const sin = Math.sin(angle);\r
  const rx = x * cos + y * sin;\r
  return [flip > 0.5 ? -rx : rx, y * cos - x * sin];\r
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
const link = gl => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
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
const perWave = (value, waves, wave, fallback) => {\r
  if (typeof value === 'number') return value;\r
  if (!Array.isArray(value) || value.length === 0) return fallback;\r
  const index = waves.indexOf(wave);\r
  return value[index] ?? value[value.length - 1] ?? fallback;\r
};\r
\r
const FloatingLines = ({\r
  linesGradient = ['#e945f5', '#ffffff'],\r
  enabledWaves = ['top', 'middle', 'bottom'],\r
  lineCount = 10,\r
  lineDistance = 6,\r
  topWavePosition,\r
  middleWavePosition,\r
  bottomWavePosition,\r
  animationSpeed = 1,\r
  amplitude = 1,\r
  lineWidth = 1,\r
  lineStyle = 'solid',\r
  glow = 1,\r
  brightness = 1,\r
  depthOfField = 0.5,\r
  edgeFade = 0,\r
  interactive = true,\r
  bendRadius = 5,\r
  bendStrength = -0.5,\r
  mouseDamping = 0.05,\r
  parallax = true,\r
  parallaxStrength = 0.2,\r
  clickSwirl = true,\r
  intro = true,\r
  mixBlendMode = 'screen',\r
  backgroundColor,\r
  lightMode = false,\r
  opacity = 1,\r
  dpr,\r
  className = '',\r
  style,\r
  ...rest\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const waves = Array.isArray(enabledWaves) ? enabledWaves.filter(wave => WAVES.includes(wave)) : WAVES;\r
  const settings = {\r
    stops: Array.isArray(linesGradient) && linesGradient.length ? linesGradient.slice(0, MAX_STOPS) : ['#ffffff'],\r
    waves: WAVES.map(wave => {\r
      const on = waves.includes(wave);\r
      const position = {\r
        ...WAVE_DEFAULTS[wave],\r
        ...(wave === 'top' ? topWavePosition : wave === 'middle' ? middleWavePosition : bottomWavePosition)\r
      };\r
      return {\r
        count: on ? clamp(Math.round(perWave(lineCount, waves, wave, 10)), 0, MAX_LINES) : 0,\r
        distance: perWave(lineDistance, waves, wave, 6) * 0.01,\r
        position\r
      };\r
    }),\r
    animationSpeed: Math.max(0, animationSpeed),\r
    amplitude: Math.max(0, amplitude),\r
    lineWidth: Math.max(0.1, lineWidth),\r
    style: lineStyle === 'dashed' ? 2 : lineStyle === 'dotted' ? 1 : 0,\r
    glow: Math.max(0, glow),\r
    brightness: Math.max(0, brightness),\r
    depthOfField: clamp(depthOfField, 0, 1),\r
    edgeFade: clamp(edgeFade, 0, 1),\r
    interactive,\r
    bendRadius: Math.max(0.1, bendRadius),\r
    bendStrength,\r
    mouseDamping: clamp(mouseDamping, 0, 1),\r
    parallax,\r
    parallaxStrength: Math.max(0, parallaxStrength),\r
    clickSwirl,\r
    intro,\r
    backgroundColor,\r
    lightMode,\r
    opacity: clamp(opacity, 0, 1),\r
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
    const program = link(gl);\r
    if (!program) return undefined;\r
    const u = program.uniforms;\r
\r
    const buffer = gl.createBuffer();\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
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
    const pointer = { x: 0, y: 0, nx: 0, ny: 0, vx: 0, inside: false };\r
    const mouse = { x: 0, y: 0, influence: 0, px: 0, py: 0 };\r
    const clicks = [];\r
    const waveData = new Float32Array(12);\r
    const shapeData = new Float32Array(12);\r
    const parallaxData = new Float32Array(12);\r
    const countData = new Int32Array(3);\r
    const lineData = new Float32Array(MAX_LINES * 3 * 4);\r
    const colorData = new Float32Array(MAX_LINES * 3 * 3);\r
    const mouseData = new Float32Array(6);\r
    const clickData = new Float32Array(MAX_CLICKS * 4);\r
    let time = 0;\r
    let reveal = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const width = canvas.width;\r
      const height = canvas.height;\r
      const eased = reveal * reveal * (3 - 2 * reveal);\r
      const ratio = width / Math.max(1, container.clientWidth);\r
      const stops = s.stops.map(value => parse(value, [1, 1, 1]).map(channel => Math.pow(channel, 2.2)));\r
      const mouseX = (2 * mouse.x - width) / height;\r
      const mouseY = -(2 * mouse.y - height) / height;\r
      s.waves.forEach((wave, index) => {\r
        const shape = WAVE_SHAPE[WAVES[index]];\r
        const { x: shift, y: lift, rotate } = wave.position;\r
        const px = mouse.px * shape.drift;\r
        const py = -mouse.py * shape.drift;\r
        waveData.set([shift, lift, rotate, 0], index * 4);\r
        shapeData.set([shape.offset, shape.step, shape.light, shape.flip], index * 4);\r
        parallaxData.set([px, py, shape.depth, 0], index * 4);\r
        mouseData.set(warp(mouseX + px, mouseY + py, rotate, shape.flip), index * 2);\r
        countData[index] = wave.count;\r
        for (let line = 0; line < wave.count; line++) {\r
          const offset = shape.offset + shape.step * line;\r
          const along = wave.distance * line + shift;\r
          const phase = along + offset + time * 0.1;\r
          const amp = Math.sin(offset + time * 0.2) * 0.3 * s.amplitude * eased;\r
          const slot = index * MAX_LINES + line;\r
          lineData.set([Math.cos(phase), Math.sin(phase), amp, along], slot * 4);\r
          const t = wave.count > 1 ? line / (wave.count - 1) : 0;\r
          const scaled = t * Math.max(stops.length - 1, 0);\r
          const from = Math.min(Math.floor(scaled), Math.max(stops.length - 2, 0));\r
          const to = Math.min(from + 1, stops.length - 1);\r
          const f = clamp(scaled - from, 0, 1);\r
          const e = f * f * (3 - 2 * f);\r
          for (let c = 0; c < 3; c++) colorData[slot * 3 + c] = stops[from][c] + (stops[to][c] - stops[from][c]) * e;\r
        }\r
      });\r
      clickData.fill(0);\r
      clicks.forEach((click, index) => clickData.set([click.x, click.y, click.age, click.spin], index * 4));\r
\r
      gl.viewport(0, 0, width, height);\r
      gl.useProgram(program.program);\r
      gl.bindVertexArray(vao);\r
      gl.uniform2f(u.uResolution, width, height);\r
      gl.uniform1f(u.uRatio, ratio);\r
      gl.uniform4fv(u.uWave, waveData);\r
      gl.uniform4fv(u.uShape, shapeData);\r
      gl.uniform4fv(u.uParallax, parallaxData);\r
      gl.uniform1iv(u.uCount, countData);\r
      gl.uniform4fv(u.uLine, lineData);\r
      gl.uniform3fv(u.uLineColor, colorData);\r
      gl.uniform2fv(u.uMouseWarp, mouseData);\r
      gl.uniform1f(u.uHaloReach, 11 * ratio * Math.log(160 * s.glow + 1));\r
      gl.uniform1f(u.uWidth, s.lineWidth * 0.5 * ratio);\r
      gl.uniform1f(u.uGlow, s.glow);\r
      gl.uniform1f(u.uBrightness, s.brightness * eased);\r
      gl.uniform1f(u.uFocus, s.depthOfField);\r
      gl.uniform1f(u.uEdgeFade, s.edgeFade);\r
      gl.uniform4f(u.uMouse, mouse.x, mouse.y, mouse.influence, 0);\r
      gl.uniform1f(u.uBendRadius, s.bendRadius * 0.09);\r
      gl.uniform1f(u.uBendStrength, s.bendStrength * 2.5);\r
      gl.uniform4fv(u.uClicks, clickData);\r
      gl.uniform1f(u.uLight, s.lightMode ? 1 : 0);\r
      gl.uniform1f(u.uOpaque, s.backgroundColor ? 1 : 0);\r
      gl.uniform3fv(u.uBackground, parse(s.backgroundColor, s.lightMode ? [1, 1, 1] : [0, 0, 0]));\r
      gl.uniform1f(u.uOpacity, s.opacity * eased);\r
      gl.uniform1f(u.uStyle, s.style);\r
      gl.uniform1f(u.uSpacing, (s.style === 2 ? 22 : 9) * ratio);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.0005, 0.05) : 1 / 60;\r
      last = now;\r
      const motion = reduce ? 0 : 1;\r
      time += dt * s.animationSpeed * motion;\r
      if (s.intro && !reduce && reveal < 1) reveal = Math.min(1, reveal + dt / INTRO_SECONDS);\r
      else if (!s.intro || reduce) reveal = 1;\r
\r
      const follow = 1 - Math.pow(1 - s.mouseDamping, dt * 60);\r
      const engaged = s.interactive && pointer.inside && !reduce;\r
      if (engaged) {\r
        mouse.x += (pointer.x - mouse.x) * follow;\r
        mouse.y += (pointer.y - mouse.y) * follow;\r
      }\r
      mouse.influence += ((engaged ? 1 : 0) - mouse.influence) * follow;\r
      const tx = s.parallax && engaged ? pointer.nx * s.parallaxStrength : 0;\r
      const ty = s.parallax && engaged ? pointer.ny * s.parallaxStrength : 0;\r
      mouse.px += (tx - mouse.px) * follow;\r
      mouse.py += (ty - mouse.py) * follow;\r
      for (let i = clicks.length - 1; i >= 0; i--) {\r
        clicks[i].age += dt;\r
        if (clicks[i].age > 4) clicks.splice(i, 1);\r
      }\r
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
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      render();\r
      wake();\r
    };\r
\r
    const locate = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      const ratio = canvas.width / Math.max(1, rect.width);\r
      pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      const nextX = x * ratio;\r
      if (Math.abs(nextX - pointer.x) > 0.5) pointer.vx = nextX - pointer.x;\r
      pointer.x = nextX;\r
      pointer.y = (rect.height - y) * ratio;\r
      pointer.nx = x / Math.max(1, rect.width) - 0.5;\r
      pointer.ny = 0.5 - y / Math.max(1, rect.height);\r
    };\r
\r
    const onPointerMove = event => {\r
      const wasInside = pointer.inside;\r
      locate(event);\r
      if (pointer.inside && !wasInside && mouse.influence < 0.05) {\r
        mouse.x = pointer.x;\r
        mouse.y = pointer.y;\r
      }\r
      wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      locate(event);\r
      if (!pointer.inside || !settingsRef.current.clickSwirl || reduce) return;\r
      const x = (2 * pointer.x - canvas.width) / canvas.height;\r
      const y = -(2 * pointer.y - canvas.height) / canvas.height;\r
      clicks.unshift({ x, y, age: 0, spin: pointer.vx < 0 ? -1 : 1 });\r
      if (clicks.length > MAX_CLICKS) clicks.pop();\r
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
      gl.deleteProgram(program.program);\r
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
      className={\`floating-lines-container\${className ? \` \${className}\` : ''}\`}\r
      style={{ ...style, mixBlendMode: lightMode || backgroundColor ? 'normal' : mixBlendMode }}\r
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className="floating-lines-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default FloatingLines;\r
`,r=`.floating-lines-container {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.floating-lines-canvas {\r
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
const MAX_LINES = 24;\r
const MAX_STOPS = 8;\r
const MAX_CLICKS = 3;\r
const INTRO_SECONDS = 1.8;\r
const WAVES = ['top', 'middle', 'bottom'];\r
const WAVE_DEFAULTS = {\r
  top: { x: 10, y: 0.5, rotate: -0.4 },\r
  middle: { x: 5, y: 0, rotate: 0.2 },\r
  bottom: { x: 2, y: -0.7, rotate: -1 }\r
};\r
const WAVE_SHAPE = {\r
  top: { offset: 1, step: 0.2, light: 0.2, flip: 1, depth: 1, drift: 0.6 },\r
  middle: { offset: 2, step: 0.15, light: 1, flip: 0, depth: 0, drift: 1 },\r
  bottom: { offset: 1.5, step: 0.2, light: 0.32, flip: 0, depth: 0.6, drift: 1.4 }\r
};\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform vec2 uResolution;\r
uniform float uRatio;\r
uniform vec4 uWave[3];\r
uniform vec4 uShape[3];\r
uniform vec4 uParallax[3];\r
uniform int uCount[3];\r
uniform vec4 uLine[\${MAX_LINES * 3}];\r
uniform vec3 uLineColor[\${MAX_LINES * 3}];\r
uniform vec2 uMouseWarp[3];\r
uniform float uHaloReach;\r
uniform float uWidth;\r
uniform float uGlow;\r
uniform float uBrightness;\r
uniform float uFocus;\r
uniform float uEdgeFade;\r
uniform vec4 uMouse;\r
uniform float uBendRadius;\r
uniform float uBendStrength;\r
uniform vec4 uClicks[\${MAX_CLICKS}];\r
uniform float uLight;\r
uniform float uOpaque;\r
uniform vec3 uBackground;\r
uniform float uOpacity;\r
uniform float uStyle;\r
uniform float uSpacing;\r
out vec4 outColor;\r
\r
vec3 toSrgb(vec3 c) {\r
  return pow(max(c, 0.0), vec3(1.0 / 2.2));\r
}\r
\r
vec3 inkOf(vec3 color) {\r
  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));\r
  return color * min(1.0, 0.16 / max(luma, 0.001));\r
}\r
\r
vec2 warp(vec2 p, float rotate, float flip) {\r
  float angle = rotate * log(length(p) + 1.0);\r
  vec2 r = p * mat2(cos(angle), sin(angle), -sin(angle), cos(angle));\r
  if (flip > 0.5) r.x = -r.x;\r
  return r;\r
}\r
\r
void main() {\r
  vec2 screen = (2.0 * gl_FragCoord.xy - uResolution) / uResolution.y;\r
  screen.y = -screen.y;\r
  for (int k = 0; k < \${MAX_CLICKS}; k++) {\r
    vec4 click = uClicks[k];\r
    if (click.w == 0.0) continue;\r
    float age = click.z;\r
    float turn = 1.9 * smoothstep(0.0, 0.23, age) * exp(-max(age - 0.23, 0.0) * 1.1) * click.w;\r
    float spread = 0.3 * (1.0 + age * 0.55);\r
    vec2 offset = screen - click.xy;\r
    float angle = turn * exp(-dot(offset, offset) / (spread * spread));\r
    screen = click.xy + mat2(cos(angle), sin(angle), -sin(angle), cos(angle)) * offset;\r
  }\r
  vec3 light = vec3(0.0);\r
  vec3 bloom = vec3(0.0);\r
  vec3 inkColor = vec3(0.0);\r
  float inkAlpha = 0.0;\r
  float aa = 0.75 * uRatio;\r
  float invSigma = 1.0 / max(uBendRadius * uBendRadius, 1e-4);\r
  float tight = 1.0 / (2.6 * uRatio);\r
  float wide = 1.0 / (11.0 * uRatio);\r
\r
  for (int w = 0; w < 3; w++) {\r
    int count = uCount[w];\r
    if (count <= 0) continue;\r
    vec4 wave = uWave[w];\r
    vec4 shape = uShape[w];\r
    vec2 r = warp(screen + uParallax[w].xy, wave.z, shape.w);\r
    vec2 rm = uMouseWarp[w];\r
    float blur = uFocus * uParallax[w].z;\r
    float width = uWidth * (1.0 + blur * 2.5);\r
    float soft = aa * (1.0 + blur * 7.0);\r
    float energy = (uWidth + aa) / (width + soft) * shape.z;\r
    float cut = uHaloReach + width * 2.0 + soft;\r
    float sx = sin(r.x);\r
    float cx = cos(r.x);\r
    float along = r.x - rm.x;\r
    float pull = uMouse.z * exp(-along * along * invSigma);\r
    float level = r.y + wave.y;\r
    int first = w * \${MAX_LINES};\r
\r
    for (int i = 0; i < \${MAX_LINES}; i++) {\r
      if (i >= count) break;\r
      vec4 line = uLine[first + i];\r
      float y = (sx * line.x + cx * line.y) * line.z;\r
      float near = 0.0;\r
      if (pull > 0.002) {\r
        float across = (y - wave.y) - rm.y;\r
        near = exp(-across * across * invSigma) * pull;\r
        float push = uBendStrength * near;\r
        y += across * (uBendStrength < 0.0 ? min(-push, 2.5) : -min(push, 0.9));\r
      }\r
      float m = level - y;\r
      float slope = length(vec2(dFdx(m), dFdy(m)));\r
      float d = abs(m) / max(slope, 1e-5);\r
      if (d < cut) {\r
        float gap = d;\r
        float size = width;\r
        if (uStyle > 0.5) {\r
          float period = uSpacing / (uResolution.y * 0.5);\r
          float cell = (fract((r.x + line.w) / period + float(i) * 0.37) - 0.5) * uSpacing;\r
          float span = uStyle > 1.5 ? max(uSpacing * 0.32 - width, 0.0) : 0.0;\r
          gap = length(vec2(max(abs(cell) - span, 0.0), d));\r
          size = uStyle > 1.5 ? width : width * 1.6;\r
        }\r
        float core = smoothstep(size + soft, size - soft, gap);\r
        float fall = 1.0 - d / cut;\r
        float halo = (exp(-gap * tight) * 0.3 + exp(-d * wide) * 0.02 * fall * fall) * uGlow;\r
        vec3 color = uLineColor[first + i];\r
        float lift = 1.0 + near * 0.8;\r
        light += color * core * energy * lift;\r
        bloom += color * halo * shape.z * lift;\r
        float a = clamp(clamp(core * energy * 1.15 + halo * shape.z * 0.12, 0.0, 1.0) * lift, 0.0, 1.0);\r
        inkColor = inkOf(color) * a + inkColor * (1.0 - a);\r
        inkAlpha = a + inkAlpha * (1.0 - a);\r
      }\r
    }\r
  }\r
\r
  float edge = 1.0;\r
  if (uEdgeFade > 0.0) {\r
    float u = gl_FragCoord.x / uResolution.x;\r
    float fade = uEdgeFade * 0.45;\r
    float left = smoothstep(0.0, fade, u);\r
    float right = smoothstep(0.0, fade, 1.0 - u);\r
    edge = left * left * (3.0 - 2.0 * left) * right * right * (3.0 - 2.0 * right);\r
  }\r
\r
  if (uLight > 0.5) {\r
    float alpha = inkAlpha * edge * uOpacity;\r
    vec3 ink = toSrgb(inkColor / max(inkAlpha, 1e-4));\r
    if (uOpaque > 0.5) {\r
      outColor = vec4(mix(uBackground, ink, alpha), 1.0);\r
    } else {\r
      outColor = vec4(ink * alpha, alpha);\r
    }\r
    return;\r
  }\r
\r
  vec3 capped = 0.28 * (1.0 - exp(-bloom / 0.28));\r
  vec3 glow = toSrgb(1.0 - exp(-(light + capped) * uBrightness * 1.2)) * edge * uOpacity;\r
  if (uOpaque > 0.5) {\r
    outColor = vec4(uBackground + glow * (1.0 - uBackground), 1.0);\r
  } else {\r
    outColor = vec4(glow, max(glow.r, max(glow.g, glow.b)));\r
  }\r
}\`;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const warp = (x, y, rotate, flip) => {\r
  const angle = rotate * Math.log(Math.hypot(x, y) + 1);\r
  const cos = Math.cos(angle);\r
  const sin = Math.sin(angle);\r
  const rx = x * cos + y * sin;\r
  return [flip > 0.5 ? -rx : rx, y * cos - x * sin];\r
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
const link = gl => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
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
const perWave = (value, waves, wave, fallback) => {\r
  if (typeof value === 'number') return value;\r
  if (!Array.isArray(value) || value.length === 0) return fallback;\r
  const index = waves.indexOf(wave);\r
  return value[index] ?? value[value.length - 1] ?? fallback;\r
};\r
\r
const FloatingLines = ({\r
  linesGradient = ['#e945f5', '#ffffff'],\r
  enabledWaves = ['top', 'middle', 'bottom'],\r
  lineCount = 10,\r
  lineDistance = 6,\r
  topWavePosition,\r
  middleWavePosition,\r
  bottomWavePosition,\r
  animationSpeed = 1,\r
  amplitude = 1,\r
  lineWidth = 1,\r
  lineStyle = 'solid',\r
  glow = 1,\r
  brightness = 1,\r
  depthOfField = 0.5,\r
  edgeFade = 0,\r
  interactive = true,\r
  bendRadius = 5,\r
  bendStrength = -0.5,\r
  mouseDamping = 0.05,\r
  parallax = true,\r
  parallaxStrength = 0.2,\r
  clickSwirl = true,\r
  intro = true,\r
  mixBlendMode = 'screen',\r
  backgroundColor,\r
  lightMode = false,\r
  opacity = 1,\r
  dpr,\r
  className = '',\r
  style,\r
  ...rest\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const waves = Array.isArray(enabledWaves) ? enabledWaves.filter(wave => WAVES.includes(wave)) : WAVES;\r
  const settings = {\r
    stops: Array.isArray(linesGradient) && linesGradient.length ? linesGradient.slice(0, MAX_STOPS) : ['#ffffff'],\r
    waves: WAVES.map(wave => {\r
      const on = waves.includes(wave);\r
      const position = {\r
        ...WAVE_DEFAULTS[wave],\r
        ...(wave === 'top' ? topWavePosition : wave === 'middle' ? middleWavePosition : bottomWavePosition)\r
      };\r
      return {\r
        count: on ? clamp(Math.round(perWave(lineCount, waves, wave, 10)), 0, MAX_LINES) : 0,\r
        distance: perWave(lineDistance, waves, wave, 6) * 0.01,\r
        position\r
      };\r
    }),\r
    animationSpeed: Math.max(0, animationSpeed),\r
    amplitude: Math.max(0, amplitude),\r
    lineWidth: Math.max(0.1, lineWidth),\r
    style: lineStyle === 'dashed' ? 2 : lineStyle === 'dotted' ? 1 : 0,\r
    glow: Math.max(0, glow),\r
    brightness: Math.max(0, brightness),\r
    depthOfField: clamp(depthOfField, 0, 1),\r
    edgeFade: clamp(edgeFade, 0, 1),\r
    interactive,\r
    bendRadius: Math.max(0.1, bendRadius),\r
    bendStrength,\r
    mouseDamping: clamp(mouseDamping, 0, 1),\r
    parallax,\r
    parallaxStrength: Math.max(0, parallaxStrength),\r
    clickSwirl,\r
    intro,\r
    backgroundColor,\r
    lightMode,\r
    opacity: clamp(opacity, 0, 1),\r
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
    const program = link(gl);\r
    if (!program) return undefined;\r
    const u = program.uniforms;\r
\r
    const buffer = gl.createBuffer();\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
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
    const pointer = { x: 0, y: 0, nx: 0, ny: 0, vx: 0, inside: false };\r
    const mouse = { x: 0, y: 0, influence: 0, px: 0, py: 0 };\r
    const clicks = [];\r
    const waveData = new Float32Array(12);\r
    const shapeData = new Float32Array(12);\r
    const parallaxData = new Float32Array(12);\r
    const countData = new Int32Array(3);\r
    const lineData = new Float32Array(MAX_LINES * 3 * 4);\r
    const colorData = new Float32Array(MAX_LINES * 3 * 3);\r
    const mouseData = new Float32Array(6);\r
    const clickData = new Float32Array(MAX_CLICKS * 4);\r
    let time = 0;\r
    let reveal = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const width = canvas.width;\r
      const height = canvas.height;\r
      const eased = reveal * reveal * (3 - 2 * reveal);\r
      const ratio = width / Math.max(1, container.clientWidth);\r
      const stops = s.stops.map(value => parse(value, [1, 1, 1]).map(channel => Math.pow(channel, 2.2)));\r
      const mouseX = (2 * mouse.x - width) / height;\r
      const mouseY = -(2 * mouse.y - height) / height;\r
      s.waves.forEach((wave, index) => {\r
        const shape = WAVE_SHAPE[WAVES[index]];\r
        const { x: shift, y: lift, rotate } = wave.position;\r
        const px = mouse.px * shape.drift;\r
        const py = -mouse.py * shape.drift;\r
        waveData.set([shift, lift, rotate, 0], index * 4);\r
        shapeData.set([shape.offset, shape.step, shape.light, shape.flip], index * 4);\r
        parallaxData.set([px, py, shape.depth, 0], index * 4);\r
        mouseData.set(warp(mouseX + px, mouseY + py, rotate, shape.flip), index * 2);\r
        countData[index] = wave.count;\r
        for (let line = 0; line < wave.count; line++) {\r
          const offset = shape.offset + shape.step * line;\r
          const along = wave.distance * line + shift;\r
          const phase = along + offset + time * 0.1;\r
          const amp = Math.sin(offset + time * 0.2) * 0.3 * s.amplitude * eased;\r
          const slot = index * MAX_LINES + line;\r
          lineData.set([Math.cos(phase), Math.sin(phase), amp, along], slot * 4);\r
          const t = wave.count > 1 ? line / (wave.count - 1) : 0;\r
          const scaled = t * Math.max(stops.length - 1, 0);\r
          const from = Math.min(Math.floor(scaled), Math.max(stops.length - 2, 0));\r
          const to = Math.min(from + 1, stops.length - 1);\r
          const f = clamp(scaled - from, 0, 1);\r
          const e = f * f * (3 - 2 * f);\r
          for (let c = 0; c < 3; c++) colorData[slot * 3 + c] = stops[from][c] + (stops[to][c] - stops[from][c]) * e;\r
        }\r
      });\r
      clickData.fill(0);\r
      clicks.forEach((click, index) => clickData.set([click.x, click.y, click.age, click.spin], index * 4));\r
\r
      gl.viewport(0, 0, width, height);\r
      gl.useProgram(program.program);\r
      gl.bindVertexArray(vao);\r
      gl.uniform2f(u.uResolution, width, height);\r
      gl.uniform1f(u.uRatio, ratio);\r
      gl.uniform4fv(u.uWave, waveData);\r
      gl.uniform4fv(u.uShape, shapeData);\r
      gl.uniform4fv(u.uParallax, parallaxData);\r
      gl.uniform1iv(u.uCount, countData);\r
      gl.uniform4fv(u.uLine, lineData);\r
      gl.uniform3fv(u.uLineColor, colorData);\r
      gl.uniform2fv(u.uMouseWarp, mouseData);\r
      gl.uniform1f(u.uHaloReach, 11 * ratio * Math.log(160 * s.glow + 1));\r
      gl.uniform1f(u.uWidth, s.lineWidth * 0.5 * ratio);\r
      gl.uniform1f(u.uGlow, s.glow);\r
      gl.uniform1f(u.uBrightness, s.brightness * eased);\r
      gl.uniform1f(u.uFocus, s.depthOfField);\r
      gl.uniform1f(u.uEdgeFade, s.edgeFade);\r
      gl.uniform4f(u.uMouse, mouse.x, mouse.y, mouse.influence, 0);\r
      gl.uniform1f(u.uBendRadius, s.bendRadius * 0.09);\r
      gl.uniform1f(u.uBendStrength, s.bendStrength * 2.5);\r
      gl.uniform4fv(u.uClicks, clickData);\r
      gl.uniform1f(u.uLight, s.lightMode ? 1 : 0);\r
      gl.uniform1f(u.uOpaque, s.backgroundColor ? 1 : 0);\r
      gl.uniform3fv(u.uBackground, parse(s.backgroundColor, s.lightMode ? [1, 1, 1] : [0, 0, 0]));\r
      gl.uniform1f(u.uOpacity, s.opacity * eased);\r
      gl.uniform1f(u.uStyle, s.style);\r
      gl.uniform1f(u.uSpacing, (s.style === 2 ? 22 : 9) * ratio);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.0005, 0.05) : 1 / 60;\r
      last = now;\r
      const motion = reduce ? 0 : 1;\r
      time += dt * s.animationSpeed * motion;\r
      if (s.intro && !reduce && reveal < 1) reveal = Math.min(1, reveal + dt / INTRO_SECONDS);\r
      else if (!s.intro || reduce) reveal = 1;\r
\r
      const follow = 1 - Math.pow(1 - s.mouseDamping, dt * 60);\r
      const engaged = s.interactive && pointer.inside && !reduce;\r
      if (engaged) {\r
        mouse.x += (pointer.x - mouse.x) * follow;\r
        mouse.y += (pointer.y - mouse.y) * follow;\r
      }\r
      mouse.influence += ((engaged ? 1 : 0) - mouse.influence) * follow;\r
      const tx = s.parallax && engaged ? pointer.nx * s.parallaxStrength : 0;\r
      const ty = s.parallax && engaged ? pointer.ny * s.parallaxStrength : 0;\r
      mouse.px += (tx - mouse.px) * follow;\r
      mouse.py += (ty - mouse.py) * follow;\r
      for (let i = clicks.length - 1; i >= 0; i--) {\r
        clicks[i].age += dt;\r
        if (clicks[i].age > 4) clicks.splice(i, 1);\r
      }\r
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
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      render();\r
      wake();\r
    };\r
\r
    const locate = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      const ratio = canvas.width / Math.max(1, rect.width);\r
      pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      const nextX = x * ratio;\r
      if (Math.abs(nextX - pointer.x) > 0.5) pointer.vx = nextX - pointer.x;\r
      pointer.x = nextX;\r
      pointer.y = (rect.height - y) * ratio;\r
      pointer.nx = x / Math.max(1, rect.width) - 0.5;\r
      pointer.ny = 0.5 - y / Math.max(1, rect.height);\r
    };\r
\r
    const onPointerMove = event => {\r
      const wasInside = pointer.inside;\r
      locate(event);\r
      if (pointer.inside && !wasInside && mouse.influence < 0.05) {\r
        mouse.x = pointer.x;\r
        mouse.y = pointer.y;\r
      }\r
      wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      locate(event);\r
      if (!pointer.inside || !settingsRef.current.clickSwirl || reduce) return;\r
      const x = (2 * pointer.x - canvas.width) / canvas.height;\r
      const y = -(2 * pointer.y - canvas.height) / canvas.height;\r
      clicks.unshift({ x, y, age: 0, spin: pointer.vx < 0 ? -1 : 1 });\r
      if (clicks.length > MAX_CLICKS) clicks.pop();\r
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
      gl.deleteProgram(program.program);\r
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
      style={{ ...style, mixBlendMode: lightMode || backgroundColor ? 'normal' : mixBlendMode }}\r
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default FloatingLines;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties, type HTMLAttributes } from 'react';\r
import './FloatingLines.css';\r
\r
export type WaveName = 'top' | 'middle' | 'bottom';\r
\r
export type WavePosition = {\r
  x?: number;\r
  y?: number;\r
  rotate?: number;\r
};\r
\r
export type LineStyle = 'solid' | 'dotted' | 'dashed';\r
\r
export interface FloatingLinesProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {\r
  linesGradient?: string[];\r
  enabledWaves?: WaveName[];\r
  lineCount?: number | number[];\r
  lineDistance?: number | number[];\r
  topWavePosition?: WavePosition;\r
  middleWavePosition?: WavePosition;\r
  bottomWavePosition?: WavePosition;\r
  animationSpeed?: number;\r
  amplitude?: number;\r
  lineWidth?: number;\r
  lineStyle?: LineStyle;\r
  glow?: number;\r
  brightness?: number;\r
  depthOfField?: number;\r
  edgeFade?: number;\r
  interactive?: boolean;\r
  bendRadius?: number;\r
  bendStrength?: number;\r
  mouseDamping?: number;\r
  parallax?: boolean;\r
  parallaxStrength?: number;\r
  clickSwirl?: boolean;\r
  intro?: boolean;\r
  mixBlendMode?: CSSProperties['mixBlendMode'];\r
  backgroundColor?: string;\r
  lightMode?: boolean;\r
  opacity?: number;\r
  dpr?: number;\r
  style?: CSSProperties;\r
}\r
\r
type WaveSettings = {\r
  count: number;\r
  distance: number;\r
  position: { x: number; y: number; rotate: number };\r
};\r
\r
type Settings = {\r
  stops: string[];\r
  waves: WaveSettings[];\r
  animationSpeed: number;\r
  amplitude: number;\r
  lineWidth: number;\r
  style: number;\r
  glow: number;\r
  brightness: number;\r
  depthOfField: number;\r
  edgeFade: number;\r
  interactive: boolean;\r
  bendRadius: number;\r
  bendStrength: number;\r
  mouseDamping: number;\r
  parallax: boolean;\r
  parallaxStrength: number;\r
  clickSwirl: boolean;\r
  intro: boolean;\r
  backgroundColor?: string;\r
  lightMode: boolean;\r
  opacity: number;\r
  dpr?: number;\r
};\r
\r
type Click = { x: number; y: number; age: number; spin: number };\r
\r
type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };\r
\r
const MAX_LINES = 24;\r
const MAX_STOPS = 8;\r
const MAX_CLICKS = 3;\r
const INTRO_SECONDS = 1.8;\r
const WAVES: WaveName[] = ['top', 'middle', 'bottom'];\r
const WAVE_DEFAULTS: Record<WaveName, { x: number; y: number; rotate: number }> = {\r
  top: { x: 10, y: 0.5, rotate: -0.4 },\r
  middle: { x: 5, y: 0, rotate: 0.2 },\r
  bottom: { x: 2, y: -0.7, rotate: -1 }\r
};\r
const WAVE_SHAPE: Record<\r
  WaveName,\r
  { offset: number; step: number; light: number; flip: number; depth: number; drift: number }\r
> = {\r
  top: { offset: 1, step: 0.2, light: 0.2, flip: 1, depth: 1, drift: 0.6 },\r
  middle: { offset: 2, step: 0.15, light: 1, flip: 0, depth: 0, drift: 1 },\r
  bottom: { offset: 1.5, step: 0.2, light: 0.32, flip: 0, depth: 0.6, drift: 1.4 }\r
};\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform vec2 uResolution;\r
uniform float uRatio;\r
uniform vec4 uWave[3];\r
uniform vec4 uShape[3];\r
uniform vec4 uParallax[3];\r
uniform int uCount[3];\r
uniform vec4 uLine[\${MAX_LINES * 3}];\r
uniform vec3 uLineColor[\${MAX_LINES * 3}];\r
uniform vec2 uMouseWarp[3];\r
uniform float uHaloReach;\r
uniform float uWidth;\r
uniform float uGlow;\r
uniform float uBrightness;\r
uniform float uFocus;\r
uniform float uEdgeFade;\r
uniform vec4 uMouse;\r
uniform float uBendRadius;\r
uniform float uBendStrength;\r
uniform vec4 uClicks[\${MAX_CLICKS}];\r
uniform float uLight;\r
uniform float uOpaque;\r
uniform vec3 uBackground;\r
uniform float uOpacity;\r
uniform float uStyle;\r
uniform float uSpacing;\r
out vec4 outColor;\r
\r
vec3 toSrgb(vec3 c) {\r
  return pow(max(c, 0.0), vec3(1.0 / 2.2));\r
}\r
\r
vec3 inkOf(vec3 color) {\r
  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));\r
  return color * min(1.0, 0.16 / max(luma, 0.001));\r
}\r
\r
vec2 warp(vec2 p, float rotate, float flip) {\r
  float angle = rotate * log(length(p) + 1.0);\r
  vec2 r = p * mat2(cos(angle), sin(angle), -sin(angle), cos(angle));\r
  if (flip > 0.5) r.x = -r.x;\r
  return r;\r
}\r
\r
void main() {\r
  vec2 screen = (2.0 * gl_FragCoord.xy - uResolution) / uResolution.y;\r
  screen.y = -screen.y;\r
  for (int k = 0; k < \${MAX_CLICKS}; k++) {\r
    vec4 click = uClicks[k];\r
    if (click.w == 0.0) continue;\r
    float age = click.z;\r
    float turn = 1.9 * smoothstep(0.0, 0.23, age) * exp(-max(age - 0.23, 0.0) * 1.1) * click.w;\r
    float spread = 0.3 * (1.0 + age * 0.55);\r
    vec2 offset = screen - click.xy;\r
    float angle = turn * exp(-dot(offset, offset) / (spread * spread));\r
    screen = click.xy + mat2(cos(angle), sin(angle), -sin(angle), cos(angle)) * offset;\r
  }\r
  vec3 light = vec3(0.0);\r
  vec3 bloom = vec3(0.0);\r
  vec3 inkColor = vec3(0.0);\r
  float inkAlpha = 0.0;\r
  float aa = 0.75 * uRatio;\r
  float invSigma = 1.0 / max(uBendRadius * uBendRadius, 1e-4);\r
  float tight = 1.0 / (2.6 * uRatio);\r
  float wide = 1.0 / (11.0 * uRatio);\r
\r
  for (int w = 0; w < 3; w++) {\r
    int count = uCount[w];\r
    if (count <= 0) continue;\r
    vec4 wave = uWave[w];\r
    vec4 shape = uShape[w];\r
    vec2 r = warp(screen + uParallax[w].xy, wave.z, shape.w);\r
    vec2 rm = uMouseWarp[w];\r
    float blur = uFocus * uParallax[w].z;\r
    float width = uWidth * (1.0 + blur * 2.5);\r
    float soft = aa * (1.0 + blur * 7.0);\r
    float energy = (uWidth + aa) / (width + soft) * shape.z;\r
    float cut = uHaloReach + width * 2.0 + soft;\r
    float sx = sin(r.x);\r
    float cx = cos(r.x);\r
    float along = r.x - rm.x;\r
    float pull = uMouse.z * exp(-along * along * invSigma);\r
    float level = r.y + wave.y;\r
    int first = w * \${MAX_LINES};\r
\r
    for (int i = 0; i < \${MAX_LINES}; i++) {\r
      if (i >= count) break;\r
      vec4 line = uLine[first + i];\r
      float y = (sx * line.x + cx * line.y) * line.z;\r
      float near = 0.0;\r
      if (pull > 0.002) {\r
        float across = (y - wave.y) - rm.y;\r
        near = exp(-across * across * invSigma) * pull;\r
        float push = uBendStrength * near;\r
        y += across * (uBendStrength < 0.0 ? min(-push, 2.5) : -min(push, 0.9));\r
      }\r
      float m = level - y;\r
      float slope = length(vec2(dFdx(m), dFdy(m)));\r
      float d = abs(m) / max(slope, 1e-5);\r
      if (d < cut) {\r
        float gap = d;\r
        float size = width;\r
        if (uStyle > 0.5) {\r
          float period = uSpacing / (uResolution.y * 0.5);\r
          float cell = (fract((r.x + line.w) / period + float(i) * 0.37) - 0.5) * uSpacing;\r
          float span = uStyle > 1.5 ? max(uSpacing * 0.32 - width, 0.0) : 0.0;\r
          gap = length(vec2(max(abs(cell) - span, 0.0), d));\r
          size = uStyle > 1.5 ? width : width * 1.6;\r
        }\r
        float core = smoothstep(size + soft, size - soft, gap);\r
        float fall = 1.0 - d / cut;\r
        float halo = (exp(-gap * tight) * 0.3 + exp(-d * wide) * 0.02 * fall * fall) * uGlow;\r
        vec3 color = uLineColor[first + i];\r
        float lift = 1.0 + near * 0.8;\r
        light += color * core * energy * lift;\r
        bloom += color * halo * shape.z * lift;\r
        float a = clamp(clamp(core * energy * 1.15 + halo * shape.z * 0.12, 0.0, 1.0) * lift, 0.0, 1.0);\r
        inkColor = inkOf(color) * a + inkColor * (1.0 - a);\r
        inkAlpha = a + inkAlpha * (1.0 - a);\r
      }\r
    }\r
  }\r
\r
  float edge = 1.0;\r
  if (uEdgeFade > 0.0) {\r
    float u = gl_FragCoord.x / uResolution.x;\r
    float fade = uEdgeFade * 0.45;\r
    float left = smoothstep(0.0, fade, u);\r
    float right = smoothstep(0.0, fade, 1.0 - u);\r
    edge = left * left * (3.0 - 2.0 * left) * right * right * (3.0 - 2.0 * right);\r
  }\r
\r
  if (uLight > 0.5) {\r
    float alpha = inkAlpha * edge * uOpacity;\r
    vec3 ink = toSrgb(inkColor / max(inkAlpha, 1e-4));\r
    if (uOpaque > 0.5) {\r
      outColor = vec4(mix(uBackground, ink, alpha), 1.0);\r
    } else {\r
      outColor = vec4(ink * alpha, alpha);\r
    }\r
    return;\r
  }\r
\r
  vec3 capped = 0.28 * (1.0 - exp(-bloom / 0.28));\r
  vec3 glow = toSrgb(1.0 - exp(-(light + capped) * uBrightness * 1.2)) * edge * uOpacity;\r
  if (uOpaque > 0.5) {\r
    outColor = vec4(uBackground + glow * (1.0 - uBackground), 1.0);\r
  } else {\r
    outColor = vec4(glow, max(glow.r, max(glow.g, glow.b)));\r
  }\r
}\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const warp = (x: number, y: number, rotate: number, flip: number): [number, number] => {\r
  const angle = rotate * Math.log(Math.hypot(x, y) + 1);\r
  const cos = Math.cos(angle);\r
  const sin = Math.sin(angle);\r
  const rx = x * cos + y * sin;\r
  return [flip > 0.5 ? -rx : rx, y * cos - x * sin];\r
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
const link = (gl: WebGL2RenderingContext): Program | null => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
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
const perWave = (value: number | number[] | undefined, waves: WaveName[], wave: WaveName, fallback: number) => {\r
  if (typeof value === 'number') return value;\r
  if (!Array.isArray(value) || value.length === 0) return fallback;\r
  const index = waves.indexOf(wave);\r
  return value[index] ?? value[value.length - 1] ?? fallback;\r
};\r
\r
const FloatingLines = ({\r
  linesGradient = ['#e945f5', '#ffffff'],\r
  enabledWaves = ['top', 'middle', 'bottom'],\r
  lineCount = 10,\r
  lineDistance = 6,\r
  topWavePosition,\r
  middleWavePosition,\r
  bottomWavePosition,\r
  animationSpeed = 1,\r
  amplitude = 1,\r
  lineWidth = 1,\r
  lineStyle = 'solid',\r
  glow = 1,\r
  brightness = 1,\r
  depthOfField = 0.5,\r
  edgeFade = 0,\r
  interactive = true,\r
  bendRadius = 5,\r
  bendStrength = -0.5,\r
  mouseDamping = 0.05,\r
  parallax = true,\r
  parallaxStrength = 0.2,\r
  clickSwirl = true,\r
  intro = true,\r
  mixBlendMode = 'screen',\r
  backgroundColor,\r
  lightMode = false,\r
  opacity = 1,\r
  dpr,\r
  className = '',\r
  style,\r
  ...rest\r
}: FloatingLinesProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const waves = Array.isArray(enabledWaves) ? enabledWaves.filter(wave => WAVES.includes(wave)) : WAVES;\r
  const settings: Settings = {\r
    stops: Array.isArray(linesGradient) && linesGradient.length ? linesGradient.slice(0, MAX_STOPS) : ['#ffffff'],\r
    waves: WAVES.map(wave => {\r
      const on = waves.includes(wave);\r
      const position = {\r
        ...WAVE_DEFAULTS[wave],\r
        ...(wave === 'top' ? topWavePosition : wave === 'middle' ? middleWavePosition : bottomWavePosition)\r
      };\r
      return {\r
        count: on ? clamp(Math.round(perWave(lineCount, waves, wave, 10)), 0, MAX_LINES) : 0,\r
        distance: perWave(lineDistance, waves, wave, 6) * 0.01,\r
        position\r
      };\r
    }),\r
    animationSpeed: Math.max(0, animationSpeed),\r
    amplitude: Math.max(0, amplitude),\r
    lineWidth: Math.max(0.1, lineWidth),\r
    style: lineStyle === 'dashed' ? 2 : lineStyle === 'dotted' ? 1 : 0,\r
    glow: Math.max(0, glow),\r
    brightness: Math.max(0, brightness),\r
    depthOfField: clamp(depthOfField, 0, 1),\r
    edgeFade: clamp(edgeFade, 0, 1),\r
    interactive,\r
    bendRadius: Math.max(0.1, bendRadius),\r
    bendStrength,\r
    mouseDamping: clamp(mouseDamping, 0, 1),\r
    parallax,\r
    parallaxStrength: Math.max(0, parallaxStrength),\r
    clickSwirl,\r
    intro,\r
    backgroundColor,\r
    lightMode,\r
    opacity: clamp(opacity, 0, 1),\r
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
    const program = link(gl);\r
    if (!program) return undefined;\r
    const u = program.uniforms;\r
\r
    const buffer = gl.createBuffer();\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
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
    const pointer = { x: 0, y: 0, nx: 0, ny: 0, vx: 0, inside: false };\r
    const mouse = { x: 0, y: 0, influence: 0, px: 0, py: 0 };\r
    const clicks: Click[] = [];\r
    const waveData = new Float32Array(12);\r
    const shapeData = new Float32Array(12);\r
    const parallaxData = new Float32Array(12);\r
    const countData = new Int32Array(3);\r
    const lineData = new Float32Array(MAX_LINES * 3 * 4);\r
    const colorData = new Float32Array(MAX_LINES * 3 * 3);\r
    const mouseData = new Float32Array(6);\r
    const clickData = new Float32Array(MAX_CLICKS * 4);\r
    let time = 0;\r
    let reveal = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const width = canvas.width;\r
      const height = canvas.height;\r
      const eased = reveal * reveal * (3 - 2 * reveal);\r
      const ratio = width / Math.max(1, container.clientWidth);\r
      const stops = s.stops.map(value => parse(value, [1, 1, 1]).map(channel => Math.pow(channel, 2.2)));\r
      const mouseX = (2 * mouse.x - width) / height;\r
      const mouseY = -(2 * mouse.y - height) / height;\r
      s.waves.forEach((wave, index) => {\r
        const shape = WAVE_SHAPE[WAVES[index]];\r
        const { x: shift, y: lift, rotate } = wave.position;\r
        const px = mouse.px * shape.drift;\r
        const py = -mouse.py * shape.drift;\r
        waveData.set([shift, lift, rotate, 0], index * 4);\r
        shapeData.set([shape.offset, shape.step, shape.light, shape.flip], index * 4);\r
        parallaxData.set([px, py, shape.depth, 0], index * 4);\r
        mouseData.set(warp(mouseX + px, mouseY + py, rotate, shape.flip), index * 2);\r
        countData[index] = wave.count;\r
        for (let line = 0; line < wave.count; line++) {\r
          const offset = shape.offset + shape.step * line;\r
          const along = wave.distance * line + shift;\r
          const phase = along + offset + time * 0.1;\r
          const amp = Math.sin(offset + time * 0.2) * 0.3 * s.amplitude * eased;\r
          const slot = index * MAX_LINES + line;\r
          lineData.set([Math.cos(phase), Math.sin(phase), amp, along], slot * 4);\r
          const t = wave.count > 1 ? line / (wave.count - 1) : 0;\r
          const scaled = t * Math.max(stops.length - 1, 0);\r
          const from = Math.min(Math.floor(scaled), Math.max(stops.length - 2, 0));\r
          const to = Math.min(from + 1, stops.length - 1);\r
          const f = clamp(scaled - from, 0, 1);\r
          const e = f * f * (3 - 2 * f);\r
          for (let c = 0; c < 3; c++) colorData[slot * 3 + c] = stops[from][c] + (stops[to][c] - stops[from][c]) * e;\r
        }\r
      });\r
      clickData.fill(0);\r
      clicks.forEach((click, index) => clickData.set([click.x, click.y, click.age, click.spin], index * 4));\r
\r
      gl.viewport(0, 0, width, height);\r
      gl.useProgram(program.program);\r
      gl.bindVertexArray(vao);\r
      gl.uniform2f(u.uResolution, width, height);\r
      gl.uniform1f(u.uRatio, ratio);\r
      gl.uniform4fv(u.uWave, waveData);\r
      gl.uniform4fv(u.uShape, shapeData);\r
      gl.uniform4fv(u.uParallax, parallaxData);\r
      gl.uniform1iv(u.uCount, countData);\r
      gl.uniform4fv(u.uLine, lineData);\r
      gl.uniform3fv(u.uLineColor, colorData);\r
      gl.uniform2fv(u.uMouseWarp, mouseData);\r
      gl.uniform1f(u.uHaloReach, 11 * ratio * Math.log(160 * s.glow + 1));\r
      gl.uniform1f(u.uWidth, s.lineWidth * 0.5 * ratio);\r
      gl.uniform1f(u.uGlow, s.glow);\r
      gl.uniform1f(u.uBrightness, s.brightness * eased);\r
      gl.uniform1f(u.uFocus, s.depthOfField);\r
      gl.uniform1f(u.uEdgeFade, s.edgeFade);\r
      gl.uniform4f(u.uMouse, mouse.x, mouse.y, mouse.influence, 0);\r
      gl.uniform1f(u.uBendRadius, s.bendRadius * 0.09);\r
      gl.uniform1f(u.uBendStrength, s.bendStrength * 2.5);\r
      gl.uniform4fv(u.uClicks, clickData);\r
      gl.uniform1f(u.uLight, s.lightMode ? 1 : 0);\r
      gl.uniform1f(u.uOpaque, s.backgroundColor ? 1 : 0);\r
      gl.uniform3fv(u.uBackground, parse(s.backgroundColor, s.lightMode ? [1, 1, 1] : [0, 0, 0]));\r
      gl.uniform1f(u.uOpacity, s.opacity * eased);\r
      gl.uniform1f(u.uStyle, s.style);\r
      gl.uniform1f(u.uSpacing, (s.style === 2 ? 22 : 9) * ratio);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.0005, 0.05) : 1 / 60;\r
      last = now;\r
      const motion = reduce ? 0 : 1;\r
      time += dt * s.animationSpeed * motion;\r
      if (s.intro && !reduce && reveal < 1) reveal = Math.min(1, reveal + dt / INTRO_SECONDS);\r
      else if (!s.intro || reduce) reveal = 1;\r
\r
      const follow = 1 - Math.pow(1 - s.mouseDamping, dt * 60);\r
      const engaged = s.interactive && pointer.inside && !reduce;\r
      if (engaged) {\r
        mouse.x += (pointer.x - mouse.x) * follow;\r
        mouse.y += (pointer.y - mouse.y) * follow;\r
      }\r
      mouse.influence += ((engaged ? 1 : 0) - mouse.influence) * follow;\r
      const tx = s.parallax && engaged ? pointer.nx * s.parallaxStrength : 0;\r
      const ty = s.parallax && engaged ? pointer.ny * s.parallaxStrength : 0;\r
      mouse.px += (tx - mouse.px) * follow;\r
      mouse.py += (ty - mouse.py) * follow;\r
      for (let i = clicks.length - 1; i >= 0; i--) {\r
        clicks[i].age += dt;\r
        if (clicks[i].age > 4) clicks.splice(i, 1);\r
      }\r
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
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      render();\r
      wake();\r
    };\r
\r
    const locate = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      const ratio = canvas.width / Math.max(1, rect.width);\r
      pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      const nextX = x * ratio;\r
      if (Math.abs(nextX - pointer.x) > 0.5) pointer.vx = nextX - pointer.x;\r
      pointer.x = nextX;\r
      pointer.y = (rect.height - y) * ratio;\r
      pointer.nx = x / Math.max(1, rect.width) - 0.5;\r
      pointer.ny = 0.5 - y / Math.max(1, rect.height);\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const wasInside = pointer.inside;\r
      locate(event);\r
      if (pointer.inside && !wasInside && mouse.influence < 0.05) {\r
        mouse.x = pointer.x;\r
        mouse.y = pointer.y;\r
      }\r
      wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      locate(event);\r
      if (!pointer.inside || !settingsRef.current.clickSwirl || reduce) return;\r
      const x = (2 * pointer.x - canvas.width) / canvas.height;\r
      const y = -(2 * pointer.y - canvas.height) / canvas.height;\r
      clicks.unshift({ x, y, age: 0, spin: pointer.vx < 0 ? -1 : 1 });\r
      if (clicks.length > MAX_CLICKS) clicks.pop();\r
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
      gl.deleteProgram(program.program);\r
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
      className={\`floating-lines-container\${className ? \` \${className}\` : ''}\`}\r
      style={{ ...style, mixBlendMode: lightMode || backgroundColor ? 'normal' : mixBlendMode }}\r
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className="floating-lines-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default FloatingLines;\r
`,o=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties, type HTMLAttributes } from 'react';\r
\r
export type WaveName = 'top' | 'middle' | 'bottom';\r
\r
export type WavePosition = {\r
  x?: number;\r
  y?: number;\r
  rotate?: number;\r
};\r
\r
export type LineStyle = 'solid' | 'dotted' | 'dashed';\r
\r
export interface FloatingLinesProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {\r
  linesGradient?: string[];\r
  enabledWaves?: WaveName[];\r
  lineCount?: number | number[];\r
  lineDistance?: number | number[];\r
  topWavePosition?: WavePosition;\r
  middleWavePosition?: WavePosition;\r
  bottomWavePosition?: WavePosition;\r
  animationSpeed?: number;\r
  amplitude?: number;\r
  lineWidth?: number;\r
  lineStyle?: LineStyle;\r
  glow?: number;\r
  brightness?: number;\r
  depthOfField?: number;\r
  edgeFade?: number;\r
  interactive?: boolean;\r
  bendRadius?: number;\r
  bendStrength?: number;\r
  mouseDamping?: number;\r
  parallax?: boolean;\r
  parallaxStrength?: number;\r
  clickSwirl?: boolean;\r
  intro?: boolean;\r
  mixBlendMode?: CSSProperties['mixBlendMode'];\r
  backgroundColor?: string;\r
  lightMode?: boolean;\r
  opacity?: number;\r
  dpr?: number;\r
  style?: CSSProperties;\r
}\r
\r
type WaveSettings = {\r
  count: number;\r
  distance: number;\r
  position: { x: number; y: number; rotate: number };\r
};\r
\r
type Settings = {\r
  stops: string[];\r
  waves: WaveSettings[];\r
  animationSpeed: number;\r
  amplitude: number;\r
  lineWidth: number;\r
  style: number;\r
  glow: number;\r
  brightness: number;\r
  depthOfField: number;\r
  edgeFade: number;\r
  interactive: boolean;\r
  bendRadius: number;\r
  bendStrength: number;\r
  mouseDamping: number;\r
  parallax: boolean;\r
  parallaxStrength: number;\r
  clickSwirl: boolean;\r
  intro: boolean;\r
  backgroundColor?: string;\r
  lightMode: boolean;\r
  opacity: number;\r
  dpr?: number;\r
};\r
\r
type Click = { x: number; y: number; age: number; spin: number };\r
\r
type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };\r
\r
const MAX_LINES = 24;\r
const MAX_STOPS = 8;\r
const MAX_CLICKS = 3;\r
const INTRO_SECONDS = 1.8;\r
const WAVES: WaveName[] = ['top', 'middle', 'bottom'];\r
const WAVE_DEFAULTS: Record<WaveName, { x: number; y: number; rotate: number }> = {\r
  top: { x: 10, y: 0.5, rotate: -0.4 },\r
  middle: { x: 5, y: 0, rotate: 0.2 },\r
  bottom: { x: 2, y: -0.7, rotate: -1 }\r
};\r
const WAVE_SHAPE: Record<\r
  WaveName,\r
  { offset: number; step: number; light: number; flip: number; depth: number; drift: number }\r
> = {\r
  top: { offset: 1, step: 0.2, light: 0.2, flip: 1, depth: 1, drift: 0.6 },\r
  middle: { offset: 2, step: 0.15, light: 1, flip: 0, depth: 0, drift: 1 },\r
  bottom: { offset: 1.5, step: 0.2, light: 0.32, flip: 0, depth: 0.6, drift: 1.4 }\r
};\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform vec2 uResolution;\r
uniform float uRatio;\r
uniform vec4 uWave[3];\r
uniform vec4 uShape[3];\r
uniform vec4 uParallax[3];\r
uniform int uCount[3];\r
uniform vec4 uLine[\${MAX_LINES * 3}];\r
uniform vec3 uLineColor[\${MAX_LINES * 3}];\r
uniform vec2 uMouseWarp[3];\r
uniform float uHaloReach;\r
uniform float uWidth;\r
uniform float uGlow;\r
uniform float uBrightness;\r
uniform float uFocus;\r
uniform float uEdgeFade;\r
uniform vec4 uMouse;\r
uniform float uBendRadius;\r
uniform float uBendStrength;\r
uniform vec4 uClicks[\${MAX_CLICKS}];\r
uniform float uLight;\r
uniform float uOpaque;\r
uniform vec3 uBackground;\r
uniform float uOpacity;\r
uniform float uStyle;\r
uniform float uSpacing;\r
out vec4 outColor;\r
\r
vec3 toSrgb(vec3 c) {\r
  return pow(max(c, 0.0), vec3(1.0 / 2.2));\r
}\r
\r
vec3 inkOf(vec3 color) {\r
  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));\r
  return color * min(1.0, 0.16 / max(luma, 0.001));\r
}\r
\r
vec2 warp(vec2 p, float rotate, float flip) {\r
  float angle = rotate * log(length(p) + 1.0);\r
  vec2 r = p * mat2(cos(angle), sin(angle), -sin(angle), cos(angle));\r
  if (flip > 0.5) r.x = -r.x;\r
  return r;\r
}\r
\r
void main() {\r
  vec2 screen = (2.0 * gl_FragCoord.xy - uResolution) / uResolution.y;\r
  screen.y = -screen.y;\r
  for (int k = 0; k < \${MAX_CLICKS}; k++) {\r
    vec4 click = uClicks[k];\r
    if (click.w == 0.0) continue;\r
    float age = click.z;\r
    float turn = 1.9 * smoothstep(0.0, 0.23, age) * exp(-max(age - 0.23, 0.0) * 1.1) * click.w;\r
    float spread = 0.3 * (1.0 + age * 0.55);\r
    vec2 offset = screen - click.xy;\r
    float angle = turn * exp(-dot(offset, offset) / (spread * spread));\r
    screen = click.xy + mat2(cos(angle), sin(angle), -sin(angle), cos(angle)) * offset;\r
  }\r
  vec3 light = vec3(0.0);\r
  vec3 bloom = vec3(0.0);\r
  vec3 inkColor = vec3(0.0);\r
  float inkAlpha = 0.0;\r
  float aa = 0.75 * uRatio;\r
  float invSigma = 1.0 / max(uBendRadius * uBendRadius, 1e-4);\r
  float tight = 1.0 / (2.6 * uRatio);\r
  float wide = 1.0 / (11.0 * uRatio);\r
\r
  for (int w = 0; w < 3; w++) {\r
    int count = uCount[w];\r
    if (count <= 0) continue;\r
    vec4 wave = uWave[w];\r
    vec4 shape = uShape[w];\r
    vec2 r = warp(screen + uParallax[w].xy, wave.z, shape.w);\r
    vec2 rm = uMouseWarp[w];\r
    float blur = uFocus * uParallax[w].z;\r
    float width = uWidth * (1.0 + blur * 2.5);\r
    float soft = aa * (1.0 + blur * 7.0);\r
    float energy = (uWidth + aa) / (width + soft) * shape.z;\r
    float cut = uHaloReach + width * 2.0 + soft;\r
    float sx = sin(r.x);\r
    float cx = cos(r.x);\r
    float along = r.x - rm.x;\r
    float pull = uMouse.z * exp(-along * along * invSigma);\r
    float level = r.y + wave.y;\r
    int first = w * \${MAX_LINES};\r
\r
    for (int i = 0; i < \${MAX_LINES}; i++) {\r
      if (i >= count) break;\r
      vec4 line = uLine[first + i];\r
      float y = (sx * line.x + cx * line.y) * line.z;\r
      float near = 0.0;\r
      if (pull > 0.002) {\r
        float across = (y - wave.y) - rm.y;\r
        near = exp(-across * across * invSigma) * pull;\r
        float push = uBendStrength * near;\r
        y += across * (uBendStrength < 0.0 ? min(-push, 2.5) : -min(push, 0.9));\r
      }\r
      float m = level - y;\r
      float slope = length(vec2(dFdx(m), dFdy(m)));\r
      float d = abs(m) / max(slope, 1e-5);\r
      if (d < cut) {\r
        float gap = d;\r
        float size = width;\r
        if (uStyle > 0.5) {\r
          float period = uSpacing / (uResolution.y * 0.5);\r
          float cell = (fract((r.x + line.w) / period + float(i) * 0.37) - 0.5) * uSpacing;\r
          float span = uStyle > 1.5 ? max(uSpacing * 0.32 - width, 0.0) : 0.0;\r
          gap = length(vec2(max(abs(cell) - span, 0.0), d));\r
          size = uStyle > 1.5 ? width : width * 1.6;\r
        }\r
        float core = smoothstep(size + soft, size - soft, gap);\r
        float fall = 1.0 - d / cut;\r
        float halo = (exp(-gap * tight) * 0.3 + exp(-d * wide) * 0.02 * fall * fall) * uGlow;\r
        vec3 color = uLineColor[first + i];\r
        float lift = 1.0 + near * 0.8;\r
        light += color * core * energy * lift;\r
        bloom += color * halo * shape.z * lift;\r
        float a = clamp(clamp(core * energy * 1.15 + halo * shape.z * 0.12, 0.0, 1.0) * lift, 0.0, 1.0);\r
        inkColor = inkOf(color) * a + inkColor * (1.0 - a);\r
        inkAlpha = a + inkAlpha * (1.0 - a);\r
      }\r
    }\r
  }\r
\r
  float edge = 1.0;\r
  if (uEdgeFade > 0.0) {\r
    float u = gl_FragCoord.x / uResolution.x;\r
    float fade = uEdgeFade * 0.45;\r
    float left = smoothstep(0.0, fade, u);\r
    float right = smoothstep(0.0, fade, 1.0 - u);\r
    edge = left * left * (3.0 - 2.0 * left) * right * right * (3.0 - 2.0 * right);\r
  }\r
\r
  if (uLight > 0.5) {\r
    float alpha = inkAlpha * edge * uOpacity;\r
    vec3 ink = toSrgb(inkColor / max(inkAlpha, 1e-4));\r
    if (uOpaque > 0.5) {\r
      outColor = vec4(mix(uBackground, ink, alpha), 1.0);\r
    } else {\r
      outColor = vec4(ink * alpha, alpha);\r
    }\r
    return;\r
  }\r
\r
  vec3 capped = 0.28 * (1.0 - exp(-bloom / 0.28));\r
  vec3 glow = toSrgb(1.0 - exp(-(light + capped) * uBrightness * 1.2)) * edge * uOpacity;\r
  if (uOpaque > 0.5) {\r
    outColor = vec4(uBackground + glow * (1.0 - uBackground), 1.0);\r
  } else {\r
    outColor = vec4(glow, max(glow.r, max(glow.g, glow.b)));\r
  }\r
}\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const warp = (x: number, y: number, rotate: number, flip: number): [number, number] => {\r
  const angle = rotate * Math.log(Math.hypot(x, y) + 1);\r
  const cos = Math.cos(angle);\r
  const sin = Math.sin(angle);\r
  const rx = x * cos + y * sin;\r
  return [flip > 0.5 ? -rx : rx, y * cos - x * sin];\r
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
const link = (gl: WebGL2RenderingContext): Program | null => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
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
const perWave = (value: number | number[] | undefined, waves: WaveName[], wave: WaveName, fallback: number) => {\r
  if (typeof value === 'number') return value;\r
  if (!Array.isArray(value) || value.length === 0) return fallback;\r
  const index = waves.indexOf(wave);\r
  return value[index] ?? value[value.length - 1] ?? fallback;\r
};\r
\r
const FloatingLines = ({\r
  linesGradient = ['#e945f5', '#ffffff'],\r
  enabledWaves = ['top', 'middle', 'bottom'],\r
  lineCount = 10,\r
  lineDistance = 6,\r
  topWavePosition,\r
  middleWavePosition,\r
  bottomWavePosition,\r
  animationSpeed = 1,\r
  amplitude = 1,\r
  lineWidth = 1,\r
  lineStyle = 'solid',\r
  glow = 1,\r
  brightness = 1,\r
  depthOfField = 0.5,\r
  edgeFade = 0,\r
  interactive = true,\r
  bendRadius = 5,\r
  bendStrength = -0.5,\r
  mouseDamping = 0.05,\r
  parallax = true,\r
  parallaxStrength = 0.2,\r
  clickSwirl = true,\r
  intro = true,\r
  mixBlendMode = 'screen',\r
  backgroundColor,\r
  lightMode = false,\r
  opacity = 1,\r
  dpr,\r
  className = '',\r
  style,\r
  ...rest\r
}: FloatingLinesProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const waves = Array.isArray(enabledWaves) ? enabledWaves.filter(wave => WAVES.includes(wave)) : WAVES;\r
  const settings: Settings = {\r
    stops: Array.isArray(linesGradient) && linesGradient.length ? linesGradient.slice(0, MAX_STOPS) : ['#ffffff'],\r
    waves: WAVES.map(wave => {\r
      const on = waves.includes(wave);\r
      const position = {\r
        ...WAVE_DEFAULTS[wave],\r
        ...(wave === 'top' ? topWavePosition : wave === 'middle' ? middleWavePosition : bottomWavePosition)\r
      };\r
      return {\r
        count: on ? clamp(Math.round(perWave(lineCount, waves, wave, 10)), 0, MAX_LINES) : 0,\r
        distance: perWave(lineDistance, waves, wave, 6) * 0.01,\r
        position\r
      };\r
    }),\r
    animationSpeed: Math.max(0, animationSpeed),\r
    amplitude: Math.max(0, amplitude),\r
    lineWidth: Math.max(0.1, lineWidth),\r
    style: lineStyle === 'dashed' ? 2 : lineStyle === 'dotted' ? 1 : 0,\r
    glow: Math.max(0, glow),\r
    brightness: Math.max(0, brightness),\r
    depthOfField: clamp(depthOfField, 0, 1),\r
    edgeFade: clamp(edgeFade, 0, 1),\r
    interactive,\r
    bendRadius: Math.max(0.1, bendRadius),\r
    bendStrength,\r
    mouseDamping: clamp(mouseDamping, 0, 1),\r
    parallax,\r
    parallaxStrength: Math.max(0, parallaxStrength),\r
    clickSwirl,\r
    intro,\r
    backgroundColor,\r
    lightMode,\r
    opacity: clamp(opacity, 0, 1),\r
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
    const program = link(gl);\r
    if (!program) return undefined;\r
    const u = program.uniforms;\r
\r
    const buffer = gl.createBuffer();\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
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
    const pointer = { x: 0, y: 0, nx: 0, ny: 0, vx: 0, inside: false };\r
    const mouse = { x: 0, y: 0, influence: 0, px: 0, py: 0 };\r
    const clicks: Click[] = [];\r
    const waveData = new Float32Array(12);\r
    const shapeData = new Float32Array(12);\r
    const parallaxData = new Float32Array(12);\r
    const countData = new Int32Array(3);\r
    const lineData = new Float32Array(MAX_LINES * 3 * 4);\r
    const colorData = new Float32Array(MAX_LINES * 3 * 3);\r
    const mouseData = new Float32Array(6);\r
    const clickData = new Float32Array(MAX_CLICKS * 4);\r
    let time = 0;\r
    let reveal = settingsRef.current.intro && !reduce ? 0 : 1;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const width = canvas.width;\r
      const height = canvas.height;\r
      const eased = reveal * reveal * (3 - 2 * reveal);\r
      const ratio = width / Math.max(1, container.clientWidth);\r
      const stops = s.stops.map(value => parse(value, [1, 1, 1]).map(channel => Math.pow(channel, 2.2)));\r
      const mouseX = (2 * mouse.x - width) / height;\r
      const mouseY = -(2 * mouse.y - height) / height;\r
      s.waves.forEach((wave, index) => {\r
        const shape = WAVE_SHAPE[WAVES[index]];\r
        const { x: shift, y: lift, rotate } = wave.position;\r
        const px = mouse.px * shape.drift;\r
        const py = -mouse.py * shape.drift;\r
        waveData.set([shift, lift, rotate, 0], index * 4);\r
        shapeData.set([shape.offset, shape.step, shape.light, shape.flip], index * 4);\r
        parallaxData.set([px, py, shape.depth, 0], index * 4);\r
        mouseData.set(warp(mouseX + px, mouseY + py, rotate, shape.flip), index * 2);\r
        countData[index] = wave.count;\r
        for (let line = 0; line < wave.count; line++) {\r
          const offset = shape.offset + shape.step * line;\r
          const along = wave.distance * line + shift;\r
          const phase = along + offset + time * 0.1;\r
          const amp = Math.sin(offset + time * 0.2) * 0.3 * s.amplitude * eased;\r
          const slot = index * MAX_LINES + line;\r
          lineData.set([Math.cos(phase), Math.sin(phase), amp, along], slot * 4);\r
          const t = wave.count > 1 ? line / (wave.count - 1) : 0;\r
          const scaled = t * Math.max(stops.length - 1, 0);\r
          const from = Math.min(Math.floor(scaled), Math.max(stops.length - 2, 0));\r
          const to = Math.min(from + 1, stops.length - 1);\r
          const f = clamp(scaled - from, 0, 1);\r
          const e = f * f * (3 - 2 * f);\r
          for (let c = 0; c < 3; c++) colorData[slot * 3 + c] = stops[from][c] + (stops[to][c] - stops[from][c]) * e;\r
        }\r
      });\r
      clickData.fill(0);\r
      clicks.forEach((click, index) => clickData.set([click.x, click.y, click.age, click.spin], index * 4));\r
\r
      gl.viewport(0, 0, width, height);\r
      gl.useProgram(program.program);\r
      gl.bindVertexArray(vao);\r
      gl.uniform2f(u.uResolution, width, height);\r
      gl.uniform1f(u.uRatio, ratio);\r
      gl.uniform4fv(u.uWave, waveData);\r
      gl.uniform4fv(u.uShape, shapeData);\r
      gl.uniform4fv(u.uParallax, parallaxData);\r
      gl.uniform1iv(u.uCount, countData);\r
      gl.uniform4fv(u.uLine, lineData);\r
      gl.uniform3fv(u.uLineColor, colorData);\r
      gl.uniform2fv(u.uMouseWarp, mouseData);\r
      gl.uniform1f(u.uHaloReach, 11 * ratio * Math.log(160 * s.glow + 1));\r
      gl.uniform1f(u.uWidth, s.lineWidth * 0.5 * ratio);\r
      gl.uniform1f(u.uGlow, s.glow);\r
      gl.uniform1f(u.uBrightness, s.brightness * eased);\r
      gl.uniform1f(u.uFocus, s.depthOfField);\r
      gl.uniform1f(u.uEdgeFade, s.edgeFade);\r
      gl.uniform4f(u.uMouse, mouse.x, mouse.y, mouse.influence, 0);\r
      gl.uniform1f(u.uBendRadius, s.bendRadius * 0.09);\r
      gl.uniform1f(u.uBendStrength, s.bendStrength * 2.5);\r
      gl.uniform4fv(u.uClicks, clickData);\r
      gl.uniform1f(u.uLight, s.lightMode ? 1 : 0);\r
      gl.uniform1f(u.uOpaque, s.backgroundColor ? 1 : 0);\r
      gl.uniform3fv(u.uBackground, parse(s.backgroundColor, s.lightMode ? [1, 1, 1] : [0, 0, 0]));\r
      gl.uniform1f(u.uOpacity, s.opacity * eased);\r
      gl.uniform1f(u.uStyle, s.style);\r
      gl.uniform1f(u.uSpacing, (s.style === 2 ? 22 : 9) * ratio);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.0005, 0.05) : 1 / 60;\r
      last = now;\r
      const motion = reduce ? 0 : 1;\r
      time += dt * s.animationSpeed * motion;\r
      if (s.intro && !reduce && reveal < 1) reveal = Math.min(1, reveal + dt / INTRO_SECONDS);\r
      else if (!s.intro || reduce) reveal = 1;\r
\r
      const follow = 1 - Math.pow(1 - s.mouseDamping, dt * 60);\r
      const engaged = s.interactive && pointer.inside && !reduce;\r
      if (engaged) {\r
        mouse.x += (pointer.x - mouse.x) * follow;\r
        mouse.y += (pointer.y - mouse.y) * follow;\r
      }\r
      mouse.influence += ((engaged ? 1 : 0) - mouse.influence) * follow;\r
      const tx = s.parallax && engaged ? pointer.nx * s.parallaxStrength : 0;\r
      const ty = s.parallax && engaged ? pointer.ny * s.parallaxStrength : 0;\r
      mouse.px += (tx - mouse.px) * follow;\r
      mouse.py += (ty - mouse.py) * follow;\r
      for (let i = clicks.length - 1; i >= 0; i--) {\r
        clicks[i].age += dt;\r
        if (clicks[i].age > 4) clicks.splice(i, 1);\r
      }\r
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
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      render();\r
      wake();\r
    };\r
\r
    const locate = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      const ratio = canvas.width / Math.max(1, rect.width);\r
      pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      const nextX = x * ratio;\r
      if (Math.abs(nextX - pointer.x) > 0.5) pointer.vx = nextX - pointer.x;\r
      pointer.x = nextX;\r
      pointer.y = (rect.height - y) * ratio;\r
      pointer.nx = x / Math.max(1, rect.width) - 0.5;\r
      pointer.ny = 0.5 - y / Math.max(1, rect.height);\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const wasInside = pointer.inside;\r
      locate(event);\r
      if (pointer.inside && !wasInside && mouse.influence < 0.05) {\r
        mouse.x = pointer.x;\r
        mouse.y = pointer.y;\r
      }\r
      wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      locate(event);\r
      if (!pointer.inside || !settingsRef.current.clickSwirl || reduce) return;\r
      const x = (2 * pointer.x - canvas.width) / canvas.height;\r
      const y = -(2 * pointer.y - canvas.height) / canvas.height;\r
      clicks.unshift({ x, y, age: 0, spin: pointer.vx < 0 ? -1 : 1 });\r
      if (clicks.length > MAX_CLICKS) clicks.pop();\r
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
      gl.deleteProgram(program.program);\r
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
      style={{ ...style, mixBlendMode: lightMode || backgroundColor ? 'normal' : mixBlendMode }}\r
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default FloatingLines;\r
`,a={usage:`import FloatingLines from './FloatingLines';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <FloatingLines
    linesGradient={['#e945f5', '#ffffff']}
    enabledWaves={['top', 'middle', 'bottom']}
    lineCount={10}
    lineDistance={6}
    bendStrength={-0.5}
    interactive
    clickSwirl
  />
</div>`,code:n,css:r,tailwind:e,tsCode:t,tsTailwind:o};export{a as floatingLines};
