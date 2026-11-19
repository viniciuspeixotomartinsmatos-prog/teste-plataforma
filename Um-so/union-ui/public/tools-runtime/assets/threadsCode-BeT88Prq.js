const r=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
import './Threads.css';\r
\r
const LINE_VERTEX = \`#version 300 es\r
precision highp float;\r
in vec2 aPoint;\r
uniform float uTime;\r
uniform vec2 uResolution;\r
uniform vec2 uFrame;\r
uniform float uAmplitude;\r
uniform float uDistance;\r
uniform vec2 uMouse;\r
uniform float uCount;\r
uniform float uThickness;\r
uniform float uSoftness;\r
uniform float uWaves;\r
uniform float uSplit;\r
uniform float uFray;\r
uniform float uSeed;\r
uniform vec2 uTurn;\r
uniform vec4 uPart;\r
uniform float uTaper;\r
out float vEdge;\r
out float vBand;\r
out float vDraw;\r
out float vAlpha;\r
out float vIndex;\r
\r
float Perlin2D(vec2 P) {\r
  vec2 Pi = floor(P);\r
  vec4 Pf_Pfmin1 = P.xyxy - vec4(Pi, Pi + 1.0);\r
  vec4 Pt = vec4(Pi.xy, Pi.xy + 1.0);\r
  Pt = Pt - floor(Pt * (1.0 / 71.0)) * 71.0;\r
  Pt += vec2(26.0, 161.0).xyxy;\r
  Pt *= Pt;\r
  Pt = Pt.xzxz * Pt.yyww;\r
  vec4 hash_x = fract(Pt * (1.0 / 951.135664));\r
  vec4 hash_y = fract(Pt * (1.0 / 642.949883));\r
  vec4 grad_x = hash_x - 0.49999;\r
  vec4 grad_y = hash_y - 0.49999;\r
  vec4 grad_results = inversesqrt(grad_x * grad_x + grad_y * grad_y) * (grad_x * Pf_Pfmin1.xzxz + grad_y * Pf_Pfmin1.yyww);\r
  grad_results *= 1.4142135623730950;\r
  vec2 blend = Pf_Pfmin1.xy * Pf_Pfmin1.xy * Pf_Pfmin1.xy * (Pf_Pfmin1.xy * (Pf_Pfmin1.xy * 6.0 - 15.0) + 10.0);\r
  vec4 blend2 = vec4(blend, vec2(1.0 - blend));\r
  return dot(grad_results, blend2.zxzx * blend2.wwyy);\r
}\r
\r
void main() {\r
  float perc = float(gl_InstanceID) / uCount;\r
  float x = aPoint.x;\r
  float pixel = 1.0 / max(uResolution.x, uResolution.y);\r
  float splitPoint = uSplit + perc * uFray;\r
  float amplitudeNormal = smoothstep(splitPoint, max(0.7, splitPoint + 0.2), x);\r
  float finalAmplitude = amplitudeNormal * 0.5 * uAmplitude * (1.0 + (uMouse.y - 0.5) * 0.2);\r
  float timeScaled = uTime / 10.0 + (uMouse.x - 0.5);\r
  float blur = smoothstep(splitPoint, splitPoint + 0.05, x) * perc;\r
  float xnoise = mix(\r
    Perlin2D(vec2(timeScaled * 2.5 + uSeed, (x * uWaves + perc) * 2.5)),\r
    Perlin2D(vec2(timeScaled * 3.5 + uSeed, (x * uWaves + timeScaled) * 3.5)) / 1.5,\r
    x * 0.3\r
  );\r
  float y = 0.5 + (perc - 0.5) * uDistance + xnoise / 2.0 * finalAmplitude;\r
  vec2 local = vec2((x - 0.5) * uFrame.x, (y - 0.5) * uFrame.y);\r
  if (uPart.z > 0.0) {\r
    vec2 delta = local - uPart.xy;\r
    float reach = uPart.w;\r
    float pull = exp(-dot(delta, delta) / (reach * reach));\r
    local.y += delta.y * pull * uPart.z;\r
  }\r
  float width = 7.0 * uThickness * pixel * (1.0 - perc);\r
  float band = (width / 2.0 + 10.0 * uSoftness * pixel * blur) * uFrame.y;\r
  float draw = max(band, 1.0);\r
  local.y += aPoint.y * draw;\r
  vec2 turned = vec2(local.x * uTurn.x - local.y * uTurn.y, local.x * uTurn.y + local.y * uTurn.x);\r
  gl_Position = vec4(turned / (uResolution * 0.5), 0.0, 1.0);\r
  vEdge = aPoint.y * draw;\r
  vBand = band;\r
  vDraw = draw;\r
  vAlpha = 1.0 - smoothstep(0.0, 1.0, pow(perc, 0.3)) * uTaper;\r
  vIndex = perc;\r
}\`;\r
\r
const LINE_FRAGMENT = \`#version 300 es\r
precision highp float;\r
in float vEdge;\r
in float vBand;\r
in float vDraw;\r
in float vAlpha;\r
in float vIndex;\r
uniform vec3 uColor;\r
uniform vec3 uAccent;\r
out vec4 outColor;\r
void main() {\r
  float coverage = (1.0 - smoothstep(0.0, vDraw, abs(vEdge))) * (vBand / vDraw) * vAlpha;\r
  outColor = vec4(mix(uColor, uAccent, vIndex) * coverage, coverage);\r
}\`;\r
\r
const SCREEN_VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
out vec2 vUv;\r
void main() {\r
  vUv = aPosition * 0.5 + 0.5;\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const SCREEN_FRAGMENT = \`#version 300 es\r
precision highp float;\r
in vec2 vUv;\r
uniform sampler2D uLines;\r
uniform vec2 uResolution;\r
uniform float uFade;\r
uniform float uOpacity;\r
uniform float uCurve;\r
out vec4 outColor;\r
\r
float smootherstep(float edge, float x) {\r
  float t = clamp(x / edge, 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  vec4 lines = texture(uLines, vUv);\r
  float alpha = lines.a;\r
  vec3 color = alpha > 0.0001 ? lines.rgb / alpha : vec3(0.0);\r
  float mask = uOpacity;\r
  if (uFade > 0.0) {\r
    vec2 px = vUv * uResolution;\r
    float edge = uFade * min(uResolution.x, uResolution.y) * 0.5;\r
    mask *= smootherstep(edge, px.x) * smootherstep(edge, uResolution.x - px.x);\r
    mask *= smootherstep(edge, px.y) * smootherstep(edge, uResolution.y - px.y);\r
  }\r
  outColor = vec4(color * pow(alpha, uCurve), alpha) * mask;\r
}\`;\r
\r
const MAX_RENDER_DIM = 1920;\r
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
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;\r
  gl.deleteProgram(program);\r
  return null;\r
};\r
\r
const locate = (gl, program, names) => {\r
  const result = {};\r
  for (const name of names) result[name] = gl.getUniformLocation(program, name);\r
  return result;\r
};\r
\r
const Threads = ({\r
  color = [1, 1, 1],\r
  accentColor,\r
  amplitude = 1.7,\r
  distance = 0.4,\r
  enableMouseInteraction = false,\r
  lineCount = 90,\r
  thickness = 0.6,\r
  softness = 1.3,\r
  speed = 0.6,\r
  waves = 1.05,\r
  split = 0.04,\r
  fray = 0.5,\r
  angle = 25,\r
  seed = 0,\r
  parting = 0,\r
  taper = 0.85,\r
  brightness = 1.4,\r
  fade = 0,\r
  opacity = 1,\r
  paused = false,\r
  ...rest\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const colorKey = \`\${Array.isArray(color) ? color.join(',') : String(color)}|\${\r
    Array.isArray(accentColor) ? accentColor.join(',') : String(accentColor ?? '')\r
  }\`;\r
  const settings = {\r
    color,\r
    accentColor,\r
    colorKey,\r
    amplitude,\r
    distance,\r
    enableMouseInteraction,\r
    lineCount: clamp(Math.round(lineCount), 1, 400),\r
    thickness: Math.max(0, thickness),\r
    softness: Math.max(0, softness),\r
    speed,\r
    waves: Math.max(0, waves),\r
    split: clamp(split, 0, 1),\r
    fray: clamp(fray, 0, 1),\r
    angle,\r
    seed,\r
    parting: clamp(parting, 0, 1),\r
    taper: clamp(taper, 0, 1),\r
    brightness: clamp(brightness, 0.25, 2),\r
    fade: clamp(fade, 0, 1),\r
    opacity: clamp(opacity, 0, 1),\r
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
    const lineProgram = link(gl, LINE_VERTEX, LINE_FRAGMENT);\r
    const screenProgram = link(gl, SCREEN_VERTEX, SCREEN_FRAGMENT);\r
    if (!lineProgram || !screenProgram) return undefined;\r
\r
    const lineUniforms = locate(gl, lineProgram, [\r
      'uTime',\r
      'uResolution',\r
      'uFrame',\r
      'uAmplitude',\r
      'uDistance',\r
      'uMouse',\r
      'uCount',\r
      'uThickness',\r
      'uSoftness',\r
      'uWaves',\r
      'uSplit',\r
      'uFray',\r
      'uSeed',\r
      'uTurn',\r
      'uPart',\r
      'uTaper',\r
      'uColor',\r
      'uAccent'\r
    ]);\r
    const screenUniforms = locate(gl, screenProgram, ['uLines', 'uResolution', 'uFade', 'uOpacity', 'uCurve']);\r
\r
    const lineVao = gl.createVertexArray();\r
    const lineBuffer = gl.createBuffer();\r
    gl.bindVertexArray(lineVao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);\r
    const pointLocation = gl.getAttribLocation(lineProgram, 'aPoint');\r
    gl.enableVertexAttribArray(pointLocation);\r
    gl.vertexAttribPointer(pointLocation, 2, gl.FLOAT, false, 0, 0);\r
\r
    const screenVao = gl.createVertexArray();\r
    const screenBuffer = gl.createBuffer();\r
    gl.bindVertexArray(screenVao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, screenBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    const positionLocation = gl.getAttribLocation(screenProgram, 'aPosition');\r
    gl.enableVertexAttribArray(positionLocation);\r
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);\r
    gl.bindVertexArray(null);\r
\r
    const target = gl.createTexture();\r
    const framebuffer = gl.createFramebuffer();\r
    gl.bindTexture(gl.TEXTURE_2D, target);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
\r
    const probe = document.createElement('canvas');\r
    probe.width = 1;\r
    probe.height = 1;\r
    const probeContext = probe.getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const state = {\r
      time: 0,\r
      width: 1,\r
      height: 1,\r
      segments: 0,\r
      colorKey: '',\r
      color: [1, 1, 1],\r
      accent: [1, 1, 1],\r
      mouse: [0.5, 0.5],\r
      targetMouse: [0.5, 0.5],\r
      pointer: [0, 0],\r
      targetPointer: [0, 0],\r
      presence: 0,\r
      inside: false\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let alive = true;\r
\r
    const toRgb = value => {\r
      if (Array.isArray(value)) return [0, 1, 2].map(i => clamp(Number(value[i] ?? 1), 0, 1));\r
      if (!probeContext) return [1, 1, 1];\r
      probeContext.clearRect(0, 0, 1, 1);\r
      probeContext.fillStyle = '#ffffff';\r
      probeContext.fillStyle = String(value);\r
      probeContext.fillRect(0, 0, 1, 1);\r
      const [r, g, b] = probeContext.getImageData(0, 0, 1, 1).data;\r
      return [r / 255, g / 255, b / 255];\r
    };\r
\r
    const resolveColors = s => {\r
      if (s.colorKey === state.colorKey) return;\r
      state.colorKey = s.colorKey;\r
      state.color = toRgb(s.color);\r
      state.accent = s.accentColor === undefined || s.accentColor === null ? state.color : toRgb(s.accentColor);\r
    };\r
\r
    const buildStrip = segments => {\r
      if (segments === state.segments) return;\r
      state.segments = segments;\r
      const points = new Float32Array((segments + 1) * 4);\r
      for (let i = 0; i <= segments; i++) {\r
        const u = i / segments;\r
        points.set([u, -1, u, 1], i * 4);\r
      }\r
      gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);\r
    };\r
\r
    const resize = () => {\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const baseDpr = Math.min(window.devicePixelRatio || 1, 2);\r
      const longest = Math.max(width, height) * baseDpr;\r
      const dpr = longest > MAX_RENDER_DIM ? (baseDpr * MAX_RENDER_DIM) / longest : baseDpr;\r
      canvas.width = Math.max(1, Math.round(width * dpr));\r
      canvas.height = Math.max(1, Math.round(height * dpr));\r
      state.width = width;\r
      state.height = height;\r
      gl.bindTexture(gl.TEXTURE_2D, target);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target, 0);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      buildStrip(clamp(Math.round(width / 3), 96, 640));\r
      render();\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      resolveColors(s);\r
      const w = canvas.width;\r
      const h = canvas.height;\r
      const radians = (s.angle * Math.PI) / 180;\r
      const cos = Math.cos(radians);\r
      const sin = Math.sin(radians);\r
      const length = Math.abs(w * cos) + Math.abs(h * sin);\r
      const across = Math.abs(w * sin) + Math.abs(h * cos);\r
      const scale = w / state.width;\r
      const mouse = s.enableMouseInteraction ? state.mouse : [0.5, 0.5];\r
      const strength = s.parting * state.presence * 2;\r
      const px = state.pointer[0] * scale;\r
      const py = state.pointer[1] * scale;\r
      const local = [px * cos + py * sin, -px * sin + py * cos];\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.viewport(0, 0, w, h);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      gl.useProgram(lineProgram);\r
      gl.uniform1f(lineUniforms.uTime, state.time);\r
      gl.uniform2f(lineUniforms.uResolution, w, h);\r
      gl.uniform2f(lineUniforms.uFrame, length, across);\r
      gl.uniform1f(lineUniforms.uAmplitude, s.amplitude);\r
      gl.uniform1f(lineUniforms.uDistance, s.distance);\r
      gl.uniform2f(lineUniforms.uMouse, mouse[0], mouse[1]);\r
      gl.uniform1f(lineUniforms.uCount, s.lineCount);\r
      gl.uniform1f(lineUniforms.uThickness, s.thickness);\r
      gl.uniform1f(lineUniforms.uSoftness, s.softness);\r
      gl.uniform1f(lineUniforms.uWaves, s.waves);\r
      gl.uniform1f(lineUniforms.uSplit, s.split);\r
      gl.uniform1f(lineUniforms.uFray, s.fray);\r
      gl.uniform1f(lineUniforms.uSeed, s.seed * 13.37);\r
      gl.uniform2f(lineUniforms.uTurn, cos, sin);\r
      gl.uniform4f(lineUniforms.uPart, local[0], local[1], strength, Math.min(w, h) * 0.16);\r
      gl.uniform1f(lineUniforms.uTaper, s.taper);\r
      gl.uniform3f(lineUniforms.uColor, state.color[0], state.color[1], state.color[2]);\r
      gl.uniform3f(lineUniforms.uAccent, state.accent[0], state.accent[1], state.accent[2]);\r
      gl.bindVertexArray(lineVao);\r
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, (state.segments + 1) * 2, s.lineCount);\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, w, h);\r
      gl.disable(gl.BLEND);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.useProgram(screenProgram);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, target);\r
      gl.uniform1i(screenUniforms.uLines, 0);\r
      gl.uniform2f(screenUniforms.uResolution, w, h);\r
      gl.uniform1f(screenUniforms.uFade, s.fade);\r
      gl.uniform1f(screenUniforms.uOpacity, s.opacity);\r
      gl.uniform1f(screenUniforms.uCurve, 2 / s.brightness);\r
      gl.bindVertexArray(screenVao);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!alive || !visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const moving = !s.paused && !reduce;\r
      if (moving) state.time += dt * s.speed;\r
      const follow = 1 - Math.exp(-dt * 3);\r
      state.mouse[0] += (state.targetMouse[0] - state.mouse[0]) * follow;\r
      state.mouse[1] += (state.targetMouse[1] - state.mouse[1]) * follow;\r
      const glide = 1 - Math.exp(-dt * 10);\r
      state.pointer[0] += (state.targetPointer[0] - state.pointer[0]) * glide;\r
      state.pointer[1] += (state.targetPointer[1] - state.pointer[1]) * glide;\r
      state.presence += ((state.inside && s.parting > 0 ? 1 : 0) - state.presence) * (1 - Math.exp(-dt * 4));\r
      render();\r
      const settling =\r
        Math.abs(state.targetMouse[0] - state.mouse[0]) > 0.0005 ||\r
        Math.abs(state.targetMouse[1] - state.mouse[1]) > 0.0005 ||\r
        Math.abs(state.targetPointer[0] - state.pointer[0]) > 0.05 ||\r
        Math.abs(state.targetPointer[1] - state.pointer[1]) > 0.05 ||\r
        Math.abs((state.inside && s.parting > 0 ? 1 : 0) - state.presence) > 0.002;\r
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
      const x = (event.clientX - rect.left) / Math.max(1, rect.width);\r
      const y = (event.clientY - rect.top) / Math.max(1, rect.height);\r
      const inside = x >= 0 && x <= 1 && y >= 0 && y <= 1;\r
      if (inside) {\r
        state.targetMouse = [x, 1 - y];\r
        state.targetPointer = [\r
          event.clientX - rect.left - rect.width / 2,\r
          rect.height / 2 - (event.clientY - rect.top)\r
        ];\r
        if (!state.inside && state.presence < 0.01) state.pointer = [...state.targetPointer];\r
      } else if (state.inside) {\r
        state.targetMouse = [0.5, 0.5];\r
      }\r
      state.inside = inside;\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      state.inside = false;\r
      state.targetMouse = [0.5, 0.5];\r
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
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteFramebuffer(framebuffer);\r
      gl.deleteTexture(target);\r
      gl.deleteBuffer(lineBuffer);\r
      gl.deleteBuffer(screenBuffer);\r
      gl.deleteVertexArray(lineVao);\r
      gl.deleteVertexArray(screenVao);\r
      gl.deleteProgram(lineProgram);\r
      gl.deleteProgram(screenProgram);\r
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
    <div ref={containerRef} className={\`threads-container\${className ? \` \${className}\` : ''}\`} {...attributes}>\r
      <canvas ref={canvasRef} className="threads-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Threads;\r
`,n=`.threads-container {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
}\r
\r
.threads-canvas {\r
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
const LINE_VERTEX = \`#version 300 es\r
precision highp float;\r
in vec2 aPoint;\r
uniform float uTime;\r
uniform vec2 uResolution;\r
uniform vec2 uFrame;\r
uniform float uAmplitude;\r
uniform float uDistance;\r
uniform vec2 uMouse;\r
uniform float uCount;\r
uniform float uThickness;\r
uniform float uSoftness;\r
uniform float uWaves;\r
uniform float uSplit;\r
uniform float uFray;\r
uniform float uSeed;\r
uniform vec2 uTurn;\r
uniform vec4 uPart;\r
uniform float uTaper;\r
out float vEdge;\r
out float vBand;\r
out float vDraw;\r
out float vAlpha;\r
out float vIndex;\r
\r
float Perlin2D(vec2 P) {\r
  vec2 Pi = floor(P);\r
  vec4 Pf_Pfmin1 = P.xyxy - vec4(Pi, Pi + 1.0);\r
  vec4 Pt = vec4(Pi.xy, Pi.xy + 1.0);\r
  Pt = Pt - floor(Pt * (1.0 / 71.0)) * 71.0;\r
  Pt += vec2(26.0, 161.0).xyxy;\r
  Pt *= Pt;\r
  Pt = Pt.xzxz * Pt.yyww;\r
  vec4 hash_x = fract(Pt * (1.0 / 951.135664));\r
  vec4 hash_y = fract(Pt * (1.0 / 642.949883));\r
  vec4 grad_x = hash_x - 0.49999;\r
  vec4 grad_y = hash_y - 0.49999;\r
  vec4 grad_results = inversesqrt(grad_x * grad_x + grad_y * grad_y) * (grad_x * Pf_Pfmin1.xzxz + grad_y * Pf_Pfmin1.yyww);\r
  grad_results *= 1.4142135623730950;\r
  vec2 blend = Pf_Pfmin1.xy * Pf_Pfmin1.xy * Pf_Pfmin1.xy * (Pf_Pfmin1.xy * (Pf_Pfmin1.xy * 6.0 - 15.0) + 10.0);\r
  vec4 blend2 = vec4(blend, vec2(1.0 - blend));\r
  return dot(grad_results, blend2.zxzx * blend2.wwyy);\r
}\r
\r
void main() {\r
  float perc = float(gl_InstanceID) / uCount;\r
  float x = aPoint.x;\r
  float pixel = 1.0 / max(uResolution.x, uResolution.y);\r
  float splitPoint = uSplit + perc * uFray;\r
  float amplitudeNormal = smoothstep(splitPoint, max(0.7, splitPoint + 0.2), x);\r
  float finalAmplitude = amplitudeNormal * 0.5 * uAmplitude * (1.0 + (uMouse.y - 0.5) * 0.2);\r
  float timeScaled = uTime / 10.0 + (uMouse.x - 0.5);\r
  float blur = smoothstep(splitPoint, splitPoint + 0.05, x) * perc;\r
  float xnoise = mix(\r
    Perlin2D(vec2(timeScaled * 2.5 + uSeed, (x * uWaves + perc) * 2.5)),\r
    Perlin2D(vec2(timeScaled * 3.5 + uSeed, (x * uWaves + timeScaled) * 3.5)) / 1.5,\r
    x * 0.3\r
  );\r
  float y = 0.5 + (perc - 0.5) * uDistance + xnoise / 2.0 * finalAmplitude;\r
  vec2 local = vec2((x - 0.5) * uFrame.x, (y - 0.5) * uFrame.y);\r
  if (uPart.z > 0.0) {\r
    vec2 delta = local - uPart.xy;\r
    float reach = uPart.w;\r
    float pull = exp(-dot(delta, delta) / (reach * reach));\r
    local.y += delta.y * pull * uPart.z;\r
  }\r
  float width = 7.0 * uThickness * pixel * (1.0 - perc);\r
  float band = (width / 2.0 + 10.0 * uSoftness * pixel * blur) * uFrame.y;\r
  float draw = max(band, 1.0);\r
  local.y += aPoint.y * draw;\r
  vec2 turned = vec2(local.x * uTurn.x - local.y * uTurn.y, local.x * uTurn.y + local.y * uTurn.x);\r
  gl_Position = vec4(turned / (uResolution * 0.5), 0.0, 1.0);\r
  vEdge = aPoint.y * draw;\r
  vBand = band;\r
  vDraw = draw;\r
  vAlpha = 1.0 - smoothstep(0.0, 1.0, pow(perc, 0.3)) * uTaper;\r
  vIndex = perc;\r
}\`;\r
\r
const LINE_FRAGMENT = \`#version 300 es\r
precision highp float;\r
in float vEdge;\r
in float vBand;\r
in float vDraw;\r
in float vAlpha;\r
in float vIndex;\r
uniform vec3 uColor;\r
uniform vec3 uAccent;\r
out vec4 outColor;\r
void main() {\r
  float coverage = (1.0 - smoothstep(0.0, vDraw, abs(vEdge))) * (vBand / vDraw) * vAlpha;\r
  outColor = vec4(mix(uColor, uAccent, vIndex) * coverage, coverage);\r
}\`;\r
\r
const SCREEN_VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
out vec2 vUv;\r
void main() {\r
  vUv = aPosition * 0.5 + 0.5;\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const SCREEN_FRAGMENT = \`#version 300 es\r
precision highp float;\r
in vec2 vUv;\r
uniform sampler2D uLines;\r
uniform vec2 uResolution;\r
uniform float uFade;\r
uniform float uOpacity;\r
uniform float uCurve;\r
out vec4 outColor;\r
\r
float smootherstep(float edge, float x) {\r
  float t = clamp(x / edge, 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  vec4 lines = texture(uLines, vUv);\r
  float alpha = lines.a;\r
  vec3 color = alpha > 0.0001 ? lines.rgb / alpha : vec3(0.0);\r
  float mask = uOpacity;\r
  if (uFade > 0.0) {\r
    vec2 px = vUv * uResolution;\r
    float edge = uFade * min(uResolution.x, uResolution.y) * 0.5;\r
    mask *= smootherstep(edge, px.x) * smootherstep(edge, uResolution.x - px.x);\r
    mask *= smootherstep(edge, px.y) * smootherstep(edge, uResolution.y - px.y);\r
  }\r
  outColor = vec4(color * pow(alpha, uCurve), alpha) * mask;\r
}\`;\r
\r
const MAX_RENDER_DIM = 1920;\r
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
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;\r
  gl.deleteProgram(program);\r
  return null;\r
};\r
\r
const locate = (gl, program, names) => {\r
  const result = {};\r
  for (const name of names) result[name] = gl.getUniformLocation(program, name);\r
  return result;\r
};\r
\r
const Threads = ({\r
  color = [1, 1, 1],\r
  accentColor,\r
  amplitude = 1.7,\r
  distance = 0.4,\r
  enableMouseInteraction = false,\r
  lineCount = 90,\r
  thickness = 0.6,\r
  softness = 1.3,\r
  speed = 0.6,\r
  waves = 1.05,\r
  split = 0.04,\r
  fray = 0.5,\r
  angle = 25,\r
  seed = 0,\r
  parting = 0,\r
  taper = 0.85,\r
  brightness = 1.4,\r
  fade = 0,\r
  opacity = 1,\r
  paused = false,\r
  ...rest\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const colorKey = \`\${Array.isArray(color) ? color.join(',') : String(color)}|\${\r
    Array.isArray(accentColor) ? accentColor.join(',') : String(accentColor ?? '')\r
  }\`;\r
  const settings = {\r
    color,\r
    accentColor,\r
    colorKey,\r
    amplitude,\r
    distance,\r
    enableMouseInteraction,\r
    lineCount: clamp(Math.round(lineCount), 1, 400),\r
    thickness: Math.max(0, thickness),\r
    softness: Math.max(0, softness),\r
    speed,\r
    waves: Math.max(0, waves),\r
    split: clamp(split, 0, 1),\r
    fray: clamp(fray, 0, 1),\r
    angle,\r
    seed,\r
    parting: clamp(parting, 0, 1),\r
    taper: clamp(taper, 0, 1),\r
    brightness: clamp(brightness, 0.25, 2),\r
    fade: clamp(fade, 0, 1),\r
    opacity: clamp(opacity, 0, 1),\r
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
    const lineProgram = link(gl, LINE_VERTEX, LINE_FRAGMENT);\r
    const screenProgram = link(gl, SCREEN_VERTEX, SCREEN_FRAGMENT);\r
    if (!lineProgram || !screenProgram) return undefined;\r
\r
    const lineUniforms = locate(gl, lineProgram, [\r
      'uTime',\r
      'uResolution',\r
      'uFrame',\r
      'uAmplitude',\r
      'uDistance',\r
      'uMouse',\r
      'uCount',\r
      'uThickness',\r
      'uSoftness',\r
      'uWaves',\r
      'uSplit',\r
      'uFray',\r
      'uSeed',\r
      'uTurn',\r
      'uPart',\r
      'uTaper',\r
      'uColor',\r
      'uAccent'\r
    ]);\r
    const screenUniforms = locate(gl, screenProgram, ['uLines', 'uResolution', 'uFade', 'uOpacity', 'uCurve']);\r
\r
    const lineVao = gl.createVertexArray();\r
    const lineBuffer = gl.createBuffer();\r
    gl.bindVertexArray(lineVao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);\r
    const pointLocation = gl.getAttribLocation(lineProgram, 'aPoint');\r
    gl.enableVertexAttribArray(pointLocation);\r
    gl.vertexAttribPointer(pointLocation, 2, gl.FLOAT, false, 0, 0);\r
\r
    const screenVao = gl.createVertexArray();\r
    const screenBuffer = gl.createBuffer();\r
    gl.bindVertexArray(screenVao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, screenBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    const positionLocation = gl.getAttribLocation(screenProgram, 'aPosition');\r
    gl.enableVertexAttribArray(positionLocation);\r
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);\r
    gl.bindVertexArray(null);\r
\r
    const target = gl.createTexture();\r
    const framebuffer = gl.createFramebuffer();\r
    gl.bindTexture(gl.TEXTURE_2D, target);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
\r
    const probe = document.createElement('canvas');\r
    probe.width = 1;\r
    probe.height = 1;\r
    const probeContext = probe.getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const state = {\r
      time: 0,\r
      width: 1,\r
      height: 1,\r
      segments: 0,\r
      colorKey: '',\r
      color: [1, 1, 1],\r
      accent: [1, 1, 1],\r
      mouse: [0.5, 0.5],\r
      targetMouse: [0.5, 0.5],\r
      pointer: [0, 0],\r
      targetPointer: [0, 0],\r
      presence: 0,\r
      inside: false\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let alive = true;\r
\r
    const toRgb = value => {\r
      if (Array.isArray(value)) return [0, 1, 2].map(i => clamp(Number(value[i] ?? 1), 0, 1));\r
      if (!probeContext) return [1, 1, 1];\r
      probeContext.clearRect(0, 0, 1, 1);\r
      probeContext.fillStyle = '#ffffff';\r
      probeContext.fillStyle = String(value);\r
      probeContext.fillRect(0, 0, 1, 1);\r
      const [r, g, b] = probeContext.getImageData(0, 0, 1, 1).data;\r
      return [r / 255, g / 255, b / 255];\r
    };\r
\r
    const resolveColors = s => {\r
      if (s.colorKey === state.colorKey) return;\r
      state.colorKey = s.colorKey;\r
      state.color = toRgb(s.color);\r
      state.accent = s.accentColor === undefined || s.accentColor === null ? state.color : toRgb(s.accentColor);\r
    };\r
\r
    const buildStrip = segments => {\r
      if (segments === state.segments) return;\r
      state.segments = segments;\r
      const points = new Float32Array((segments + 1) * 4);\r
      for (let i = 0; i <= segments; i++) {\r
        const u = i / segments;\r
        points.set([u, -1, u, 1], i * 4);\r
      }\r
      gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);\r
    };\r
\r
    const resize = () => {\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const baseDpr = Math.min(window.devicePixelRatio || 1, 2);\r
      const longest = Math.max(width, height) * baseDpr;\r
      const dpr = longest > MAX_RENDER_DIM ? (baseDpr * MAX_RENDER_DIM) / longest : baseDpr;\r
      canvas.width = Math.max(1, Math.round(width * dpr));\r
      canvas.height = Math.max(1, Math.round(height * dpr));\r
      state.width = width;\r
      state.height = height;\r
      gl.bindTexture(gl.TEXTURE_2D, target);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target, 0);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      buildStrip(clamp(Math.round(width / 3), 96, 640));\r
      render();\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      resolveColors(s);\r
      const w = canvas.width;\r
      const h = canvas.height;\r
      const radians = (s.angle * Math.PI) / 180;\r
      const cos = Math.cos(radians);\r
      const sin = Math.sin(radians);\r
      const length = Math.abs(w * cos) + Math.abs(h * sin);\r
      const across = Math.abs(w * sin) + Math.abs(h * cos);\r
      const scale = w / state.width;\r
      const mouse = s.enableMouseInteraction ? state.mouse : [0.5, 0.5];\r
      const strength = s.parting * state.presence * 2;\r
      const px = state.pointer[0] * scale;\r
      const py = state.pointer[1] * scale;\r
      const local = [px * cos + py * sin, -px * sin + py * cos];\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.viewport(0, 0, w, h);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      gl.useProgram(lineProgram);\r
      gl.uniform1f(lineUniforms.uTime, state.time);\r
      gl.uniform2f(lineUniforms.uResolution, w, h);\r
      gl.uniform2f(lineUniforms.uFrame, length, across);\r
      gl.uniform1f(lineUniforms.uAmplitude, s.amplitude);\r
      gl.uniform1f(lineUniforms.uDistance, s.distance);\r
      gl.uniform2f(lineUniforms.uMouse, mouse[0], mouse[1]);\r
      gl.uniform1f(lineUniforms.uCount, s.lineCount);\r
      gl.uniform1f(lineUniforms.uThickness, s.thickness);\r
      gl.uniform1f(lineUniforms.uSoftness, s.softness);\r
      gl.uniform1f(lineUniforms.uWaves, s.waves);\r
      gl.uniform1f(lineUniforms.uSplit, s.split);\r
      gl.uniform1f(lineUniforms.uFray, s.fray);\r
      gl.uniform1f(lineUniforms.uSeed, s.seed * 13.37);\r
      gl.uniform2f(lineUniforms.uTurn, cos, sin);\r
      gl.uniform4f(lineUniforms.uPart, local[0], local[1], strength, Math.min(w, h) * 0.16);\r
      gl.uniform1f(lineUniforms.uTaper, s.taper);\r
      gl.uniform3f(lineUniforms.uColor, state.color[0], state.color[1], state.color[2]);\r
      gl.uniform3f(lineUniforms.uAccent, state.accent[0], state.accent[1], state.accent[2]);\r
      gl.bindVertexArray(lineVao);\r
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, (state.segments + 1) * 2, s.lineCount);\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, w, h);\r
      gl.disable(gl.BLEND);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.useProgram(screenProgram);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, target);\r
      gl.uniform1i(screenUniforms.uLines, 0);\r
      gl.uniform2f(screenUniforms.uResolution, w, h);\r
      gl.uniform1f(screenUniforms.uFade, s.fade);\r
      gl.uniform1f(screenUniforms.uOpacity, s.opacity);\r
      gl.uniform1f(screenUniforms.uCurve, 2 / s.brightness);\r
      gl.bindVertexArray(screenVao);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!alive || !visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const moving = !s.paused && !reduce;\r
      if (moving) state.time += dt * s.speed;\r
      const follow = 1 - Math.exp(-dt * 3);\r
      state.mouse[0] += (state.targetMouse[0] - state.mouse[0]) * follow;\r
      state.mouse[1] += (state.targetMouse[1] - state.mouse[1]) * follow;\r
      const glide = 1 - Math.exp(-dt * 10);\r
      state.pointer[0] += (state.targetPointer[0] - state.pointer[0]) * glide;\r
      state.pointer[1] += (state.targetPointer[1] - state.pointer[1]) * glide;\r
      state.presence += ((state.inside && s.parting > 0 ? 1 : 0) - state.presence) * (1 - Math.exp(-dt * 4));\r
      render();\r
      const settling =\r
        Math.abs(state.targetMouse[0] - state.mouse[0]) > 0.0005 ||\r
        Math.abs(state.targetMouse[1] - state.mouse[1]) > 0.0005 ||\r
        Math.abs(state.targetPointer[0] - state.pointer[0]) > 0.05 ||\r
        Math.abs(state.targetPointer[1] - state.pointer[1]) > 0.05 ||\r
        Math.abs((state.inside && s.parting > 0 ? 1 : 0) - state.presence) > 0.002;\r
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
      const x = (event.clientX - rect.left) / Math.max(1, rect.width);\r
      const y = (event.clientY - rect.top) / Math.max(1, rect.height);\r
      const inside = x >= 0 && x <= 1 && y >= 0 && y <= 1;\r
      if (inside) {\r
        state.targetMouse = [x, 1 - y];\r
        state.targetPointer = [\r
          event.clientX - rect.left - rect.width / 2,\r
          rect.height / 2 - (event.clientY - rect.top)\r
        ];\r
        if (!state.inside && state.presence < 0.01) state.pointer = [...state.targetPointer];\r
      } else if (state.inside) {\r
        state.targetMouse = [0.5, 0.5];\r
      }\r
      state.inside = inside;\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      state.inside = false;\r
      state.targetMouse = [0.5, 0.5];\r
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
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteFramebuffer(framebuffer);\r
      gl.deleteTexture(target);\r
      gl.deleteBuffer(lineBuffer);\r
      gl.deleteBuffer(screenBuffer);\r
      gl.deleteVertexArray(lineVao);\r
      gl.deleteVertexArray(screenVao);\r
      gl.deleteProgram(lineProgram);\r
      gl.deleteProgram(screenProgram);\r
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
    <div ref={containerRef} className={\`relative h-full w-full\${className ? \` \${className}\` : ''}\`} {...attributes}>\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Threads;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, type HTMLAttributes } from 'react';\r
\r
import './Threads.css';\r
\r
export interface ThreadsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {\r
  color?: string | [number, number, number];\r
  accentColor?: string | [number, number, number];\r
  amplitude?: number;\r
  distance?: number;\r
  enableMouseInteraction?: boolean;\r
  lineCount?: number;\r
  thickness?: number;\r
  softness?: number;\r
  speed?: number;\r
  waves?: number;\r
  split?: number;\r
  fray?: number;\r
  angle?: number;\r
  seed?: number;\r
  parting?: number;\r
  taper?: number;\r
  brightness?: number;\r
  fade?: number;\r
  opacity?: number;\r
  paused?: boolean;\r
}\r
\r
type Settings = {\r
  color: string | number[];\r
  accentColor?: string | number[];\r
  colorKey: string;\r
  amplitude: number;\r
  distance: number;\r
  enableMouseInteraction: boolean;\r
  lineCount: number;\r
  thickness: number;\r
  softness: number;\r
  speed: number;\r
  waves: number;\r
  split: number;\r
  fray: number;\r
  angle: number;\r
  seed: number;\r
  parting: number;\r
  taper: number;\r
  brightness: number;\r
  fade: number;\r
  opacity: number;\r
  paused: boolean;\r
};\r
\r
const LINE_VERTEX = \`#version 300 es\r
precision highp float;\r
in vec2 aPoint;\r
uniform float uTime;\r
uniform vec2 uResolution;\r
uniform vec2 uFrame;\r
uniform float uAmplitude;\r
uniform float uDistance;\r
uniform vec2 uMouse;\r
uniform float uCount;\r
uniform float uThickness;\r
uniform float uSoftness;\r
uniform float uWaves;\r
uniform float uSplit;\r
uniform float uFray;\r
uniform float uSeed;\r
uniform vec2 uTurn;\r
uniform vec4 uPart;\r
uniform float uTaper;\r
out float vEdge;\r
out float vBand;\r
out float vDraw;\r
out float vAlpha;\r
out float vIndex;\r
\r
float Perlin2D(vec2 P) {\r
  vec2 Pi = floor(P);\r
  vec4 Pf_Pfmin1 = P.xyxy - vec4(Pi, Pi + 1.0);\r
  vec4 Pt = vec4(Pi.xy, Pi.xy + 1.0);\r
  Pt = Pt - floor(Pt * (1.0 / 71.0)) * 71.0;\r
  Pt += vec2(26.0, 161.0).xyxy;\r
  Pt *= Pt;\r
  Pt = Pt.xzxz * Pt.yyww;\r
  vec4 hash_x = fract(Pt * (1.0 / 951.135664));\r
  vec4 hash_y = fract(Pt * (1.0 / 642.949883));\r
  vec4 grad_x = hash_x - 0.49999;\r
  vec4 grad_y = hash_y - 0.49999;\r
  vec4 grad_results = inversesqrt(grad_x * grad_x + grad_y * grad_y) * (grad_x * Pf_Pfmin1.xzxz + grad_y * Pf_Pfmin1.yyww);\r
  grad_results *= 1.4142135623730950;\r
  vec2 blend = Pf_Pfmin1.xy * Pf_Pfmin1.xy * Pf_Pfmin1.xy * (Pf_Pfmin1.xy * (Pf_Pfmin1.xy * 6.0 - 15.0) + 10.0);\r
  vec4 blend2 = vec4(blend, vec2(1.0 - blend));\r
  return dot(grad_results, blend2.zxzx * blend2.wwyy);\r
}\r
\r
void main() {\r
  float perc = float(gl_InstanceID) / uCount;\r
  float x = aPoint.x;\r
  float pixel = 1.0 / max(uResolution.x, uResolution.y);\r
  float splitPoint = uSplit + perc * uFray;\r
  float amplitudeNormal = smoothstep(splitPoint, max(0.7, splitPoint + 0.2), x);\r
  float finalAmplitude = amplitudeNormal * 0.5 * uAmplitude * (1.0 + (uMouse.y - 0.5) * 0.2);\r
  float timeScaled = uTime / 10.0 + (uMouse.x - 0.5);\r
  float blur = smoothstep(splitPoint, splitPoint + 0.05, x) * perc;\r
  float xnoise = mix(\r
    Perlin2D(vec2(timeScaled * 2.5 + uSeed, (x * uWaves + perc) * 2.5)),\r
    Perlin2D(vec2(timeScaled * 3.5 + uSeed, (x * uWaves + timeScaled) * 3.5)) / 1.5,\r
    x * 0.3\r
  );\r
  float y = 0.5 + (perc - 0.5) * uDistance + xnoise / 2.0 * finalAmplitude;\r
  vec2 local = vec2((x - 0.5) * uFrame.x, (y - 0.5) * uFrame.y);\r
  if (uPart.z > 0.0) {\r
    vec2 delta = local - uPart.xy;\r
    float reach = uPart.w;\r
    float pull = exp(-dot(delta, delta) / (reach * reach));\r
    local.y += delta.y * pull * uPart.z;\r
  }\r
  float width = 7.0 * uThickness * pixel * (1.0 - perc);\r
  float band = (width / 2.0 + 10.0 * uSoftness * pixel * blur) * uFrame.y;\r
  float draw = max(band, 1.0);\r
  local.y += aPoint.y * draw;\r
  vec2 turned = vec2(local.x * uTurn.x - local.y * uTurn.y, local.x * uTurn.y + local.y * uTurn.x);\r
  gl_Position = vec4(turned / (uResolution * 0.5), 0.0, 1.0);\r
  vEdge = aPoint.y * draw;\r
  vBand = band;\r
  vDraw = draw;\r
  vAlpha = 1.0 - smoothstep(0.0, 1.0, pow(perc, 0.3)) * uTaper;\r
  vIndex = perc;\r
}\`;\r
\r
const LINE_FRAGMENT = \`#version 300 es\r
precision highp float;\r
in float vEdge;\r
in float vBand;\r
in float vDraw;\r
in float vAlpha;\r
in float vIndex;\r
uniform vec3 uColor;\r
uniform vec3 uAccent;\r
out vec4 outColor;\r
void main() {\r
  float coverage = (1.0 - smoothstep(0.0, vDraw, abs(vEdge))) * (vBand / vDraw) * vAlpha;\r
  outColor = vec4(mix(uColor, uAccent, vIndex) * coverage, coverage);\r
}\`;\r
\r
const SCREEN_VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
out vec2 vUv;\r
void main() {\r
  vUv = aPosition * 0.5 + 0.5;\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const SCREEN_FRAGMENT = \`#version 300 es\r
precision highp float;\r
in vec2 vUv;\r
uniform sampler2D uLines;\r
uniform vec2 uResolution;\r
uniform float uFade;\r
uniform float uOpacity;\r
uniform float uCurve;\r
out vec4 outColor;\r
\r
float smootherstep(float edge, float x) {\r
  float t = clamp(x / edge, 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  vec4 lines = texture(uLines, vUv);\r
  float alpha = lines.a;\r
  vec3 color = alpha > 0.0001 ? lines.rgb / alpha : vec3(0.0);\r
  float mask = uOpacity;\r
  if (uFade > 0.0) {\r
    vec2 px = vUv * uResolution;\r
    float edge = uFade * min(uResolution.x, uResolution.y) * 0.5;\r
    mask *= smootherstep(edge, px.x) * smootherstep(edge, uResolution.x - px.x);\r
    mask *= smootherstep(edge, px.y) * smootherstep(edge, uResolution.y - px.y);\r
  }\r
  outColor = vec4(color * pow(alpha, uCurve), alpha) * mask;\r
}\`;\r
\r
const MAX_RENDER_DIM = 1920;\r
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
const link = (gl: WebGL2RenderingContext, vertexSource: string, fragmentSource: string) => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);\r
  const program = gl.createProgram();\r
  if (!vertex || !fragment || !program) return null;\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
  gl.linkProgram(program);\r
  gl.deleteShader(vertex);\r
  gl.deleteShader(fragment);\r
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;\r
  gl.deleteProgram(program);\r
  return null;\r
};\r
\r
const locate = (gl: WebGL2RenderingContext, program: WebGLProgram, names: string[]) => {\r
  const result: Record<string, WebGLUniformLocation | null> = {};\r
  for (const name of names) result[name] = gl.getUniformLocation(program, name);\r
  return result;\r
};\r
\r
const Threads = ({\r
  color = [1, 1, 1],\r
  accentColor,\r
  amplitude = 1.7,\r
  distance = 0.4,\r
  enableMouseInteraction = false,\r
  lineCount = 90,\r
  thickness = 0.6,\r
  softness = 1.3,\r
  speed = 0.6,\r
  waves = 1.05,\r
  split = 0.04,\r
  fray = 0.5,\r
  angle = 25,\r
  seed = 0,\r
  parting = 0,\r
  taper = 0.85,\r
  brightness = 1.4,\r
  fade = 0,\r
  opacity = 1,\r
  paused = false,\r
  ...rest\r
}: ThreadsProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const colorKey = \`\${Array.isArray(color) ? color.join(',') : String(color)}|\${\r
    Array.isArray(accentColor) ? accentColor.join(',') : String(accentColor ?? '')\r
  }\`;\r
  const settings: Settings = {\r
    color,\r
    accentColor,\r
    colorKey,\r
    amplitude,\r
    distance,\r
    enableMouseInteraction,\r
    lineCount: clamp(Math.round(lineCount), 1, 400),\r
    thickness: Math.max(0, thickness),\r
    softness: Math.max(0, softness),\r
    speed,\r
    waves: Math.max(0, waves),\r
    split: clamp(split, 0, 1),\r
    fray: clamp(fray, 0, 1),\r
    angle,\r
    seed,\r
    parting: clamp(parting, 0, 1),\r
    taper: clamp(taper, 0, 1),\r
    brightness: clamp(brightness, 0.25, 2),\r
    fade: clamp(fade, 0, 1),\r
    opacity: clamp(opacity, 0, 1),\r
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
    const lineProgram = link(gl, LINE_VERTEX, LINE_FRAGMENT);\r
    const screenProgram = link(gl, SCREEN_VERTEX, SCREEN_FRAGMENT);\r
    if (!lineProgram || !screenProgram) return undefined;\r
\r
    const lineUniforms = locate(gl, lineProgram, [\r
      'uTime',\r
      'uResolution',\r
      'uFrame',\r
      'uAmplitude',\r
      'uDistance',\r
      'uMouse',\r
      'uCount',\r
      'uThickness',\r
      'uSoftness',\r
      'uWaves',\r
      'uSplit',\r
      'uFray',\r
      'uSeed',\r
      'uTurn',\r
      'uPart',\r
      'uTaper',\r
      'uColor',\r
      'uAccent'\r
    ]);\r
    const screenUniforms = locate(gl, screenProgram, ['uLines', 'uResolution', 'uFade', 'uOpacity', 'uCurve']);\r
\r
    const lineVao = gl.createVertexArray();\r
    const lineBuffer = gl.createBuffer();\r
    gl.bindVertexArray(lineVao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);\r
    const pointLocation = gl.getAttribLocation(lineProgram, 'aPoint');\r
    gl.enableVertexAttribArray(pointLocation);\r
    gl.vertexAttribPointer(pointLocation, 2, gl.FLOAT, false, 0, 0);\r
\r
    const screenVao = gl.createVertexArray();\r
    const screenBuffer = gl.createBuffer();\r
    gl.bindVertexArray(screenVao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, screenBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    const positionLocation = gl.getAttribLocation(screenProgram, 'aPosition');\r
    gl.enableVertexAttribArray(positionLocation);\r
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);\r
    gl.bindVertexArray(null);\r
\r
    const target = gl.createTexture();\r
    const framebuffer = gl.createFramebuffer();\r
    gl.bindTexture(gl.TEXTURE_2D, target);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
\r
    const probe = document.createElement('canvas');\r
    probe.width = 1;\r
    probe.height = 1;\r
    const probeContext = probe.getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const state = {\r
      time: 0,\r
      width: 1,\r
      height: 1,\r
      segments: 0,\r
      colorKey: '',\r
      color: [1, 1, 1] as number[],\r
      accent: [1, 1, 1] as number[],\r
      mouse: [0.5, 0.5],\r
      targetMouse: [0.5, 0.5],\r
      pointer: [0, 0],\r
      targetPointer: [0, 0],\r
      presence: 0,\r
      inside: false\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let alive = true;\r
\r
    const toRgb = (value: string | number[]): number[] => {\r
      if (Array.isArray(value)) return [0, 1, 2].map(i => clamp(Number(value[i] ?? 1), 0, 1));\r
      if (!probeContext) return [1, 1, 1];\r
      probeContext.clearRect(0, 0, 1, 1);\r
      probeContext.fillStyle = '#ffffff';\r
      probeContext.fillStyle = String(value);\r
      probeContext.fillRect(0, 0, 1, 1);\r
      const [r, g, b] = probeContext.getImageData(0, 0, 1, 1).data;\r
      return [r / 255, g / 255, b / 255];\r
    };\r
\r
    const resolveColors = (s: Settings) => {\r
      if (s.colorKey === state.colorKey) return;\r
      state.colorKey = s.colorKey;\r
      state.color = toRgb(s.color);\r
      state.accent = s.accentColor === undefined || s.accentColor === null ? state.color : toRgb(s.accentColor);\r
    };\r
\r
    const buildStrip = (segments: number) => {\r
      if (segments === state.segments) return;\r
      state.segments = segments;\r
      const points = new Float32Array((segments + 1) * 4);\r
      for (let i = 0; i <= segments; i++) {\r
        const u = i / segments;\r
        points.set([u, -1, u, 1], i * 4);\r
      }\r
      gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);\r
    };\r
\r
    const resize = () => {\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const baseDpr = Math.min(window.devicePixelRatio || 1, 2);\r
      const longest = Math.max(width, height) * baseDpr;\r
      const dpr = longest > MAX_RENDER_DIM ? (baseDpr * MAX_RENDER_DIM) / longest : baseDpr;\r
      canvas.width = Math.max(1, Math.round(width * dpr));\r
      canvas.height = Math.max(1, Math.round(height * dpr));\r
      state.width = width;\r
      state.height = height;\r
      gl.bindTexture(gl.TEXTURE_2D, target);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target, 0);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      buildStrip(clamp(Math.round(width / 3), 96, 640));\r
      render();\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      resolveColors(s);\r
      const w = canvas.width;\r
      const h = canvas.height;\r
      const radians = (s.angle * Math.PI) / 180;\r
      const cos = Math.cos(radians);\r
      const sin = Math.sin(radians);\r
      const length = Math.abs(w * cos) + Math.abs(h * sin);\r
      const across = Math.abs(w * sin) + Math.abs(h * cos);\r
      const scale = w / state.width;\r
      const mouse = s.enableMouseInteraction ? state.mouse : [0.5, 0.5];\r
      const strength = s.parting * state.presence * 2;\r
      const px = state.pointer[0] * scale;\r
      const py = state.pointer[1] * scale;\r
      const local = [px * cos + py * sin, -px * sin + py * cos];\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.viewport(0, 0, w, h);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      gl.useProgram(lineProgram);\r
      gl.uniform1f(lineUniforms.uTime, state.time);\r
      gl.uniform2f(lineUniforms.uResolution, w, h);\r
      gl.uniform2f(lineUniforms.uFrame, length, across);\r
      gl.uniform1f(lineUniforms.uAmplitude, s.amplitude);\r
      gl.uniform1f(lineUniforms.uDistance, s.distance);\r
      gl.uniform2f(lineUniforms.uMouse, mouse[0], mouse[1]);\r
      gl.uniform1f(lineUniforms.uCount, s.lineCount);\r
      gl.uniform1f(lineUniforms.uThickness, s.thickness);\r
      gl.uniform1f(lineUniforms.uSoftness, s.softness);\r
      gl.uniform1f(lineUniforms.uWaves, s.waves);\r
      gl.uniform1f(lineUniforms.uSplit, s.split);\r
      gl.uniform1f(lineUniforms.uFray, s.fray);\r
      gl.uniform1f(lineUniforms.uSeed, s.seed * 13.37);\r
      gl.uniform2f(lineUniforms.uTurn, cos, sin);\r
      gl.uniform4f(lineUniforms.uPart, local[0], local[1], strength, Math.min(w, h) * 0.16);\r
      gl.uniform1f(lineUniforms.uTaper, s.taper);\r
      gl.uniform3f(lineUniforms.uColor, state.color[0], state.color[1], state.color[2]);\r
      gl.uniform3f(lineUniforms.uAccent, state.accent[0], state.accent[1], state.accent[2]);\r
      gl.bindVertexArray(lineVao);\r
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, (state.segments + 1) * 2, s.lineCount);\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, w, h);\r
      gl.disable(gl.BLEND);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.useProgram(screenProgram);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, target);\r
      gl.uniform1i(screenUniforms.uLines, 0);\r
      gl.uniform2f(screenUniforms.uResolution, w, h);\r
      gl.uniform1f(screenUniforms.uFade, s.fade);\r
      gl.uniform1f(screenUniforms.uOpacity, s.opacity);\r
      gl.uniform1f(screenUniforms.uCurve, 2 / s.brightness);\r
      gl.bindVertexArray(screenVao);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!alive || !visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const moving = !s.paused && !reduce;\r
      if (moving) state.time += dt * s.speed;\r
      const follow = 1 - Math.exp(-dt * 3);\r
      state.mouse[0] += (state.targetMouse[0] - state.mouse[0]) * follow;\r
      state.mouse[1] += (state.targetMouse[1] - state.mouse[1]) * follow;\r
      const glide = 1 - Math.exp(-dt * 10);\r
      state.pointer[0] += (state.targetPointer[0] - state.pointer[0]) * glide;\r
      state.pointer[1] += (state.targetPointer[1] - state.pointer[1]) * glide;\r
      state.presence += ((state.inside && s.parting > 0 ? 1 : 0) - state.presence) * (1 - Math.exp(-dt * 4));\r
      render();\r
      const settling =\r
        Math.abs(state.targetMouse[0] - state.mouse[0]) > 0.0005 ||\r
        Math.abs(state.targetMouse[1] - state.mouse[1]) > 0.0005 ||\r
        Math.abs(state.targetPointer[0] - state.pointer[0]) > 0.05 ||\r
        Math.abs(state.targetPointer[1] - state.pointer[1]) > 0.05 ||\r
        Math.abs((state.inside && s.parting > 0 ? 1 : 0) - state.presence) > 0.002;\r
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
      const x = (event.clientX - rect.left) / Math.max(1, rect.width);\r
      const y = (event.clientY - rect.top) / Math.max(1, rect.height);\r
      const inside = x >= 0 && x <= 1 && y >= 0 && y <= 1;\r
      if (inside) {\r
        state.targetMouse = [x, 1 - y];\r
        state.targetPointer = [\r
          event.clientX - rect.left - rect.width / 2,\r
          rect.height / 2 - (event.clientY - rect.top)\r
        ];\r
        if (!state.inside && state.presence < 0.01) state.pointer = [...state.targetPointer];\r
      } else if (state.inside) {\r
        state.targetMouse = [0.5, 0.5];\r
      }\r
      state.inside = inside;\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      state.inside = false;\r
      state.targetMouse = [0.5, 0.5];\r
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
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteFramebuffer(framebuffer);\r
      gl.deleteTexture(target);\r
      gl.deleteBuffer(lineBuffer);\r
      gl.deleteBuffer(screenBuffer);\r
      gl.deleteVertexArray(lineVao);\r
      gl.deleteVertexArray(screenVao);\r
      gl.deleteProgram(lineProgram);\r
      gl.deleteProgram(screenProgram);\r
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
    <div ref={containerRef} className={\`threads-container\${className ? \` \${className}\` : ''}\`} {...attributes}>\r
      <canvas ref={canvasRef} className="threads-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Threads;\r
`,a=`'use client';\r
\r
import { useEffect, useRef, type HTMLAttributes } from 'react';\r
\r
export interface ThreadsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {\r
  color?: string | [number, number, number];\r
  accentColor?: string | [number, number, number];\r
  amplitude?: number;\r
  distance?: number;\r
  enableMouseInteraction?: boolean;\r
  lineCount?: number;\r
  thickness?: number;\r
  softness?: number;\r
  speed?: number;\r
  waves?: number;\r
  split?: number;\r
  fray?: number;\r
  angle?: number;\r
  seed?: number;\r
  parting?: number;\r
  taper?: number;\r
  brightness?: number;\r
  fade?: number;\r
  opacity?: number;\r
  paused?: boolean;\r
}\r
\r
type Settings = {\r
  color: string | number[];\r
  accentColor?: string | number[];\r
  colorKey: string;\r
  amplitude: number;\r
  distance: number;\r
  enableMouseInteraction: boolean;\r
  lineCount: number;\r
  thickness: number;\r
  softness: number;\r
  speed: number;\r
  waves: number;\r
  split: number;\r
  fray: number;\r
  angle: number;\r
  seed: number;\r
  parting: number;\r
  taper: number;\r
  brightness: number;\r
  fade: number;\r
  opacity: number;\r
  paused: boolean;\r
};\r
\r
const LINE_VERTEX = \`#version 300 es\r
precision highp float;\r
in vec2 aPoint;\r
uniform float uTime;\r
uniform vec2 uResolution;\r
uniform vec2 uFrame;\r
uniform float uAmplitude;\r
uniform float uDistance;\r
uniform vec2 uMouse;\r
uniform float uCount;\r
uniform float uThickness;\r
uniform float uSoftness;\r
uniform float uWaves;\r
uniform float uSplit;\r
uniform float uFray;\r
uniform float uSeed;\r
uniform vec2 uTurn;\r
uniform vec4 uPart;\r
uniform float uTaper;\r
out float vEdge;\r
out float vBand;\r
out float vDraw;\r
out float vAlpha;\r
out float vIndex;\r
\r
float Perlin2D(vec2 P) {\r
  vec2 Pi = floor(P);\r
  vec4 Pf_Pfmin1 = P.xyxy - vec4(Pi, Pi + 1.0);\r
  vec4 Pt = vec4(Pi.xy, Pi.xy + 1.0);\r
  Pt = Pt - floor(Pt * (1.0 / 71.0)) * 71.0;\r
  Pt += vec2(26.0, 161.0).xyxy;\r
  Pt *= Pt;\r
  Pt = Pt.xzxz * Pt.yyww;\r
  vec4 hash_x = fract(Pt * (1.0 / 951.135664));\r
  vec4 hash_y = fract(Pt * (1.0 / 642.949883));\r
  vec4 grad_x = hash_x - 0.49999;\r
  vec4 grad_y = hash_y - 0.49999;\r
  vec4 grad_results = inversesqrt(grad_x * grad_x + grad_y * grad_y) * (grad_x * Pf_Pfmin1.xzxz + grad_y * Pf_Pfmin1.yyww);\r
  grad_results *= 1.4142135623730950;\r
  vec2 blend = Pf_Pfmin1.xy * Pf_Pfmin1.xy * Pf_Pfmin1.xy * (Pf_Pfmin1.xy * (Pf_Pfmin1.xy * 6.0 - 15.0) + 10.0);\r
  vec4 blend2 = vec4(blend, vec2(1.0 - blend));\r
  return dot(grad_results, blend2.zxzx * blend2.wwyy);\r
}\r
\r
void main() {\r
  float perc = float(gl_InstanceID) / uCount;\r
  float x = aPoint.x;\r
  float pixel = 1.0 / max(uResolution.x, uResolution.y);\r
  float splitPoint = uSplit + perc * uFray;\r
  float amplitudeNormal = smoothstep(splitPoint, max(0.7, splitPoint + 0.2), x);\r
  float finalAmplitude = amplitudeNormal * 0.5 * uAmplitude * (1.0 + (uMouse.y - 0.5) * 0.2);\r
  float timeScaled = uTime / 10.0 + (uMouse.x - 0.5);\r
  float blur = smoothstep(splitPoint, splitPoint + 0.05, x) * perc;\r
  float xnoise = mix(\r
    Perlin2D(vec2(timeScaled * 2.5 + uSeed, (x * uWaves + perc) * 2.5)),\r
    Perlin2D(vec2(timeScaled * 3.5 + uSeed, (x * uWaves + timeScaled) * 3.5)) / 1.5,\r
    x * 0.3\r
  );\r
  float y = 0.5 + (perc - 0.5) * uDistance + xnoise / 2.0 * finalAmplitude;\r
  vec2 local = vec2((x - 0.5) * uFrame.x, (y - 0.5) * uFrame.y);\r
  if (uPart.z > 0.0) {\r
    vec2 delta = local - uPart.xy;\r
    float reach = uPart.w;\r
    float pull = exp(-dot(delta, delta) / (reach * reach));\r
    local.y += delta.y * pull * uPart.z;\r
  }\r
  float width = 7.0 * uThickness * pixel * (1.0 - perc);\r
  float band = (width / 2.0 + 10.0 * uSoftness * pixel * blur) * uFrame.y;\r
  float draw = max(band, 1.0);\r
  local.y += aPoint.y * draw;\r
  vec2 turned = vec2(local.x * uTurn.x - local.y * uTurn.y, local.x * uTurn.y + local.y * uTurn.x);\r
  gl_Position = vec4(turned / (uResolution * 0.5), 0.0, 1.0);\r
  vEdge = aPoint.y * draw;\r
  vBand = band;\r
  vDraw = draw;\r
  vAlpha = 1.0 - smoothstep(0.0, 1.0, pow(perc, 0.3)) * uTaper;\r
  vIndex = perc;\r
}\`;\r
\r
const LINE_FRAGMENT = \`#version 300 es\r
precision highp float;\r
in float vEdge;\r
in float vBand;\r
in float vDraw;\r
in float vAlpha;\r
in float vIndex;\r
uniform vec3 uColor;\r
uniform vec3 uAccent;\r
out vec4 outColor;\r
void main() {\r
  float coverage = (1.0 - smoothstep(0.0, vDraw, abs(vEdge))) * (vBand / vDraw) * vAlpha;\r
  outColor = vec4(mix(uColor, uAccent, vIndex) * coverage, coverage);\r
}\`;\r
\r
const SCREEN_VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
out vec2 vUv;\r
void main() {\r
  vUv = aPosition * 0.5 + 0.5;\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const SCREEN_FRAGMENT = \`#version 300 es\r
precision highp float;\r
in vec2 vUv;\r
uniform sampler2D uLines;\r
uniform vec2 uResolution;\r
uniform float uFade;\r
uniform float uOpacity;\r
uniform float uCurve;\r
out vec4 outColor;\r
\r
float smootherstep(float edge, float x) {\r
  float t = clamp(x / edge, 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  vec4 lines = texture(uLines, vUv);\r
  float alpha = lines.a;\r
  vec3 color = alpha > 0.0001 ? lines.rgb / alpha : vec3(0.0);\r
  float mask = uOpacity;\r
  if (uFade > 0.0) {\r
    vec2 px = vUv * uResolution;\r
    float edge = uFade * min(uResolution.x, uResolution.y) * 0.5;\r
    mask *= smootherstep(edge, px.x) * smootherstep(edge, uResolution.x - px.x);\r
    mask *= smootherstep(edge, px.y) * smootherstep(edge, uResolution.y - px.y);\r
  }\r
  outColor = vec4(color * pow(alpha, uCurve), alpha) * mask;\r
}\`;\r
\r
const MAX_RENDER_DIM = 1920;\r
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
const link = (gl: WebGL2RenderingContext, vertexSource: string, fragmentSource: string) => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);\r
  const program = gl.createProgram();\r
  if (!vertex || !fragment || !program) return null;\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
  gl.linkProgram(program);\r
  gl.deleteShader(vertex);\r
  gl.deleteShader(fragment);\r
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;\r
  gl.deleteProgram(program);\r
  return null;\r
};\r
\r
const locate = (gl: WebGL2RenderingContext, program: WebGLProgram, names: string[]) => {\r
  const result: Record<string, WebGLUniformLocation | null> = {};\r
  for (const name of names) result[name] = gl.getUniformLocation(program, name);\r
  return result;\r
};\r
\r
const Threads = ({\r
  color = [1, 1, 1],\r
  accentColor,\r
  amplitude = 1.7,\r
  distance = 0.4,\r
  enableMouseInteraction = false,\r
  lineCount = 90,\r
  thickness = 0.6,\r
  softness = 1.3,\r
  speed = 0.6,\r
  waves = 1.05,\r
  split = 0.04,\r
  fray = 0.5,\r
  angle = 25,\r
  seed = 0,\r
  parting = 0,\r
  taper = 0.85,\r
  brightness = 1.4,\r
  fade = 0,\r
  opacity = 1,\r
  paused = false,\r
  ...rest\r
}: ThreadsProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const colorKey = \`\${Array.isArray(color) ? color.join(',') : String(color)}|\${\r
    Array.isArray(accentColor) ? accentColor.join(',') : String(accentColor ?? '')\r
  }\`;\r
  const settings: Settings = {\r
    color,\r
    accentColor,\r
    colorKey,\r
    amplitude,\r
    distance,\r
    enableMouseInteraction,\r
    lineCount: clamp(Math.round(lineCount), 1, 400),\r
    thickness: Math.max(0, thickness),\r
    softness: Math.max(0, softness),\r
    speed,\r
    waves: Math.max(0, waves),\r
    split: clamp(split, 0, 1),\r
    fray: clamp(fray, 0, 1),\r
    angle,\r
    seed,\r
    parting: clamp(parting, 0, 1),\r
    taper: clamp(taper, 0, 1),\r
    brightness: clamp(brightness, 0.25, 2),\r
    fade: clamp(fade, 0, 1),\r
    opacity: clamp(opacity, 0, 1),\r
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
    const lineProgram = link(gl, LINE_VERTEX, LINE_FRAGMENT);\r
    const screenProgram = link(gl, SCREEN_VERTEX, SCREEN_FRAGMENT);\r
    if (!lineProgram || !screenProgram) return undefined;\r
\r
    const lineUniforms = locate(gl, lineProgram, [\r
      'uTime',\r
      'uResolution',\r
      'uFrame',\r
      'uAmplitude',\r
      'uDistance',\r
      'uMouse',\r
      'uCount',\r
      'uThickness',\r
      'uSoftness',\r
      'uWaves',\r
      'uSplit',\r
      'uFray',\r
      'uSeed',\r
      'uTurn',\r
      'uPart',\r
      'uTaper',\r
      'uColor',\r
      'uAccent'\r
    ]);\r
    const screenUniforms = locate(gl, screenProgram, ['uLines', 'uResolution', 'uFade', 'uOpacity', 'uCurve']);\r
\r
    const lineVao = gl.createVertexArray();\r
    const lineBuffer = gl.createBuffer();\r
    gl.bindVertexArray(lineVao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);\r
    const pointLocation = gl.getAttribLocation(lineProgram, 'aPoint');\r
    gl.enableVertexAttribArray(pointLocation);\r
    gl.vertexAttribPointer(pointLocation, 2, gl.FLOAT, false, 0, 0);\r
\r
    const screenVao = gl.createVertexArray();\r
    const screenBuffer = gl.createBuffer();\r
    gl.bindVertexArray(screenVao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, screenBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    const positionLocation = gl.getAttribLocation(screenProgram, 'aPosition');\r
    gl.enableVertexAttribArray(positionLocation);\r
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);\r
    gl.bindVertexArray(null);\r
\r
    const target = gl.createTexture();\r
    const framebuffer = gl.createFramebuffer();\r
    gl.bindTexture(gl.TEXTURE_2D, target);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
\r
    const probe = document.createElement('canvas');\r
    probe.width = 1;\r
    probe.height = 1;\r
    const probeContext = probe.getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const state = {\r
      time: 0,\r
      width: 1,\r
      height: 1,\r
      segments: 0,\r
      colorKey: '',\r
      color: [1, 1, 1] as number[],\r
      accent: [1, 1, 1] as number[],\r
      mouse: [0.5, 0.5],\r
      targetMouse: [0.5, 0.5],\r
      pointer: [0, 0],\r
      targetPointer: [0, 0],\r
      presence: 0,\r
      inside: false\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let alive = true;\r
\r
    const toRgb = (value: string | number[]): number[] => {\r
      if (Array.isArray(value)) return [0, 1, 2].map(i => clamp(Number(value[i] ?? 1), 0, 1));\r
      if (!probeContext) return [1, 1, 1];\r
      probeContext.clearRect(0, 0, 1, 1);\r
      probeContext.fillStyle = '#ffffff';\r
      probeContext.fillStyle = String(value);\r
      probeContext.fillRect(0, 0, 1, 1);\r
      const [r, g, b] = probeContext.getImageData(0, 0, 1, 1).data;\r
      return [r / 255, g / 255, b / 255];\r
    };\r
\r
    const resolveColors = (s: Settings) => {\r
      if (s.colorKey === state.colorKey) return;\r
      state.colorKey = s.colorKey;\r
      state.color = toRgb(s.color);\r
      state.accent = s.accentColor === undefined || s.accentColor === null ? state.color : toRgb(s.accentColor);\r
    };\r
\r
    const buildStrip = (segments: number) => {\r
      if (segments === state.segments) return;\r
      state.segments = segments;\r
      const points = new Float32Array((segments + 1) * 4);\r
      for (let i = 0; i <= segments; i++) {\r
        const u = i / segments;\r
        points.set([u, -1, u, 1], i * 4);\r
      }\r
      gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);\r
    };\r
\r
    const resize = () => {\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const baseDpr = Math.min(window.devicePixelRatio || 1, 2);\r
      const longest = Math.max(width, height) * baseDpr;\r
      const dpr = longest > MAX_RENDER_DIM ? (baseDpr * MAX_RENDER_DIM) / longest : baseDpr;\r
      canvas.width = Math.max(1, Math.round(width * dpr));\r
      canvas.height = Math.max(1, Math.round(height * dpr));\r
      state.width = width;\r
      state.height = height;\r
      gl.bindTexture(gl.TEXTURE_2D, target);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target, 0);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      buildStrip(clamp(Math.round(width / 3), 96, 640));\r
      render();\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      resolveColors(s);\r
      const w = canvas.width;\r
      const h = canvas.height;\r
      const radians = (s.angle * Math.PI) / 180;\r
      const cos = Math.cos(radians);\r
      const sin = Math.sin(radians);\r
      const length = Math.abs(w * cos) + Math.abs(h * sin);\r
      const across = Math.abs(w * sin) + Math.abs(h * cos);\r
      const scale = w / state.width;\r
      const mouse = s.enableMouseInteraction ? state.mouse : [0.5, 0.5];\r
      const strength = s.parting * state.presence * 2;\r
      const px = state.pointer[0] * scale;\r
      const py = state.pointer[1] * scale;\r
      const local = [px * cos + py * sin, -px * sin + py * cos];\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.viewport(0, 0, w, h);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      gl.useProgram(lineProgram);\r
      gl.uniform1f(lineUniforms.uTime, state.time);\r
      gl.uniform2f(lineUniforms.uResolution, w, h);\r
      gl.uniform2f(lineUniforms.uFrame, length, across);\r
      gl.uniform1f(lineUniforms.uAmplitude, s.amplitude);\r
      gl.uniform1f(lineUniforms.uDistance, s.distance);\r
      gl.uniform2f(lineUniforms.uMouse, mouse[0], mouse[1]);\r
      gl.uniform1f(lineUniforms.uCount, s.lineCount);\r
      gl.uniform1f(lineUniforms.uThickness, s.thickness);\r
      gl.uniform1f(lineUniforms.uSoftness, s.softness);\r
      gl.uniform1f(lineUniforms.uWaves, s.waves);\r
      gl.uniform1f(lineUniforms.uSplit, s.split);\r
      gl.uniform1f(lineUniforms.uFray, s.fray);\r
      gl.uniform1f(lineUniforms.uSeed, s.seed * 13.37);\r
      gl.uniform2f(lineUniforms.uTurn, cos, sin);\r
      gl.uniform4f(lineUniforms.uPart, local[0], local[1], strength, Math.min(w, h) * 0.16);\r
      gl.uniform1f(lineUniforms.uTaper, s.taper);\r
      gl.uniform3f(lineUniforms.uColor, state.color[0], state.color[1], state.color[2]);\r
      gl.uniform3f(lineUniforms.uAccent, state.accent[0], state.accent[1], state.accent[2]);\r
      gl.bindVertexArray(lineVao);\r
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, (state.segments + 1) * 2, s.lineCount);\r
\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, w, h);\r
      gl.disable(gl.BLEND);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.useProgram(screenProgram);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, target);\r
      gl.uniform1i(screenUniforms.uLines, 0);\r
      gl.uniform2f(screenUniforms.uResolution, w, h);\r
      gl.uniform1f(screenUniforms.uFade, s.fade);\r
      gl.uniform1f(screenUniforms.uOpacity, s.opacity);\r
      gl.uniform1f(screenUniforms.uCurve, 2 / s.brightness);\r
      gl.bindVertexArray(screenVao);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!alive || !visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const moving = !s.paused && !reduce;\r
      if (moving) state.time += dt * s.speed;\r
      const follow = 1 - Math.exp(-dt * 3);\r
      state.mouse[0] += (state.targetMouse[0] - state.mouse[0]) * follow;\r
      state.mouse[1] += (state.targetMouse[1] - state.mouse[1]) * follow;\r
      const glide = 1 - Math.exp(-dt * 10);\r
      state.pointer[0] += (state.targetPointer[0] - state.pointer[0]) * glide;\r
      state.pointer[1] += (state.targetPointer[1] - state.pointer[1]) * glide;\r
      state.presence += ((state.inside && s.parting > 0 ? 1 : 0) - state.presence) * (1 - Math.exp(-dt * 4));\r
      render();\r
      const settling =\r
        Math.abs(state.targetMouse[0] - state.mouse[0]) > 0.0005 ||\r
        Math.abs(state.targetMouse[1] - state.mouse[1]) > 0.0005 ||\r
        Math.abs(state.targetPointer[0] - state.pointer[0]) > 0.05 ||\r
        Math.abs(state.targetPointer[1] - state.pointer[1]) > 0.05 ||\r
        Math.abs((state.inside && s.parting > 0 ? 1 : 0) - state.presence) > 0.002;\r
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
      const x = (event.clientX - rect.left) / Math.max(1, rect.width);\r
      const y = (event.clientY - rect.top) / Math.max(1, rect.height);\r
      const inside = x >= 0 && x <= 1 && y >= 0 && y <= 1;\r
      if (inside) {\r
        state.targetMouse = [x, 1 - y];\r
        state.targetPointer = [\r
          event.clientX - rect.left - rect.width / 2,\r
          rect.height / 2 - (event.clientY - rect.top)\r
        ];\r
        if (!state.inside && state.presence < 0.01) state.pointer = [...state.targetPointer];\r
      } else if (state.inside) {\r
        state.targetMouse = [0.5, 0.5];\r
      }\r
      state.inside = inside;\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      state.inside = false;\r
      state.targetMouse = [0.5, 0.5];\r
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
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteFramebuffer(framebuffer);\r
      gl.deleteTexture(target);\r
      gl.deleteBuffer(lineBuffer);\r
      gl.deleteBuffer(screenBuffer);\r
      gl.deleteVertexArray(lineVao);\r
      gl.deleteVertexArray(screenVao);\r
      gl.deleteProgram(lineProgram);\r
      gl.deleteProgram(screenProgram);\r
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
    <div ref={containerRef} className={\`relative h-full w-full\${className ? \` \${className}\` : ''}\`} {...attributes}>\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Threads;\r
`,o={usage:`import Threads from './Threads';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <Threads
    color="#ffffff"
    lineCount={90}
    thickness={0.6}
    softness={1.3}
    amplitude={1.7}
    distance={0.4}
    waves={1.05}
    speed={0.6}
    split={0.04}
    fray={0.5}
    angle={25}
    taper={0.85}
    brightness={1.4}
    parting={0}
    enableMouseInteraction={true}
    fade={0}
    opacity={1}
  />
</div>`,code:r,css:n,tailwind:e,tsCode:t,tsTailwind:a};export{o as threads};
