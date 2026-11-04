const r=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
import './Plasma.css';\r
\r
const QUAD_VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const VOLUME = \`#version 300 es\r
precision highp float;\r
uniform vec2 uView;\r
uniform vec2 uScale;\r
uniform float uZoom;\r
uniform float uTime;\r
uniform float uTwist;\r
uniform float uWave;\r
uniform float uSharpness;\r
uniform vec2 uOrbit;\r
uniform float uDither;\r
out vec4 outColor;\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
void main() {\r
  vec2 c = (gl_FragCoord.xy * uScale - 0.5 * uView) / uZoom;\r
  vec3 rd = normalize(vec3(c, uView.y));\r
  vec3 ro = vec3(0.0, 0.0, -4.0);\r
  float cy = cos(uOrbit.x);\r
  float sy = sin(uOrbit.x);\r
  float cx = cos(uOrbit.y);\r
  float sx = sin(uOrbit.y);\r
  mat3 orbit = mat3(cy, 0.0, -sy, 0.0, 1.0, 0.0, sy, 0.0, cy) * mat3(1.0, 0.0, 0.0, 0.0, cx, sx, 0.0, -sx, cx);\r
  ro = orbit * ro;\r
  rd = orbit * rd;\r
  float z = 0.0;\r
  float density = 0.0;\r
  float band = 0.0;\r
  for (int i = 0; i < 60; i++) {\r
    vec3 p = ro + rd * z;\r
    vec3 s = p;\r
    float d = p.y - uTime;\r
    p.x += uWave * (1.0 + p.y) * sin(d + p.x * 0.1) * cos(0.34 * d + p.x * 0.05);\r
    vec2 q = p.xz *= mat2(cos(p.y * uTwist + vec4(0.0, 11.0, 33.0, 0.0) - uTime));\r
    float shell = abs(sqrt(length(q * q)) - 0.25 * (5.0 + s.y)) / 3.0;\r
    float stepLength = shell + 0.0008;\r
    z += stepLength;\r
    float phase = s.y + p.z * 0.5 + s.z - length(s - p);\r
    float weight = (1.0 + sin(phase + 8.0)) * exp(-shell * uSharpness) * stepLength;\r
    density += weight;\r
    band += weight * (0.5 + 0.5 * sin(phase * 0.5 + 1.0));\r
  }\r
  vec2 encoded = sqrt(vec2(density, band) / (1.0 + vec2(density, band)));\r
  encoded += (vec2(hash(gl_FragCoord.xy), hash(gl_FragCoord.yx + 17.0)) - 0.5) * uDither;\r
  outColor = vec4(encoded, 0.0, 1.0);\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uVolume;\r
uniform vec2 uResolution;\r
uniform vec3 uColor;\r
uniform vec3 uHighlight;\r
uniform vec3 uInk;\r
uniform float uGain;\r
uniform float uShine;\r
uniform float uPresence;\r
uniform float uGrain;\r
uniform float uFade;\r
uniform float uOpacity;\r
uniform float uTime;\r
uniform float uLightMode;\r
uniform vec3 uHeat;\r
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
  vec2 encoded = clamp(texture(uVolume, uv).rg, 0.0, 0.9995);\r
  encoded *= encoded;\r
  vec2 volume = encoded / (1.0 - encoded);\r
  vec2 offset = (gl_FragCoord.xy - uHeat.xy) / uResolution.y;\r
  float heat = uHeat.z * exp(-dot(offset, offset) / 0.05);\r
  float density = volume.r * uGain * uPresence * (1.0 + heat * 0.35);\r
  float band = clamp(volume.g / max(volume.r, 0.00001), 0.0, 1.0);\r
  vec3 tint = mix(uColor, uHighlight, band * 0.35);\r
  vec3 hdr = tint * density + uHighlight * density * density * uShine;\r
  float peak = max(hdr.r, max(hdr.g, hdr.b));\r
  float level = 1.0 - exp(-peak);\r
  float hot = smoothstep(1.0, 3.0, peak);\r
  float edge = uFade * 0.5;\r
  float mask = smootherstep(edge, uv.x) * smootherstep(edge, 1.0 - uv.x) * smootherstep(edge, uv.y) * smootherstep(edge, 1.0 - uv.y);\r
  mask *= uOpacity;\r
  float grain = (hash(gl_FragCoord.xy + fract(uTime * 7.31) * 113.0) - 0.5) * uGrain;\r
  if (uLightMode > 0.5) {\r
    vec3 color = mix(uInk, vec3(1.0), hot * 0.75);\r
    float alpha = clamp(pow(level, 0.8) * 0.9 * (1.0 + grain), 0.0, 1.0) * mask;\r
    outColor = vec4(color * alpha, alpha);\r
  } else {\r
    vec3 hue = hdr / max(peak, 0.0001);\r
    vec3 color = mix(hue * level, vec3(level), hot * 0.6);\r
    color = pow(color, vec3(1.0 / 2.2));\r
    color = clamp(color + grain * level, 0.0, 1.0) * mask;\r
    outColor = vec4(color, max(color.r, max(color.g, color.b)));\r
  }\r
}\`;\r
\r
const INTRO_SECONDS = 1.6;\r
const MAX_VOLUME_PIXELS = 1600000;\r
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
const link = (gl, fragmentSource) => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, QUAD_VERTEX);\r
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
    if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
export const Plasma = ({\r
  color = '#a6a3b8',\r
  speed = 1,\r
  direction = 'forward',\r
  scale = 1,\r
  twist = 1,\r
  wave = 1,\r
  softness = 0.5,\r
  shine = 1,\r
  brightness = 1,\r
  grain = 0.04,\r
  quality = 0.75,\r
  mouseInteractive = true,\r
  intro = true,\r
  fade = 0,\r
  opacity = 1,\r
  lightMode = false,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  ...rest\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settings = {\r
    color: String(color),\r
    speed,\r
    direction,\r
    scale: Math.max(0.1, scale),\r
    twist,\r
    wave: Math.max(0, wave),\r
    softness: clamp(softness, 0, 1),\r
    shine: Math.max(0, shine),\r
    brightness: Math.max(0, brightness),\r
    grain: Math.max(0, grain),\r
    quality: clamp(quality, 0.25, 1),\r
    mouseInteractive,\r
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
      stencil: false,\r
      powerPreference: 'high-performance'\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const floatTargets = !!gl.getExtension('EXT_color_buffer_float');\r
    const volumeProgram = link(gl, VOLUME);\r
    const compositeProgram = link(gl, COMPOSITE);\r
    if (!volumeProgram || !compositeProgram) return undefined;\r
    const programs = { volume: volumeProgram, composite: compositeProgram };\r
\r
    const buffer = gl.createBuffer();\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const texture = gl.createTexture();\r
    const framebuffer = gl.createFramebuffer();\r
    const target = { width: 0, height: 0 };\r
    const sizeTarget = (width, height) => {\r
      if (target.width === width && target.height === height) return;\r
      target.width = width;\r
      target.height = height;\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      if (floatTargets) {\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.HALF_FLOAT, null);\r
      } else {\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
      }\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
    };\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const colorCache = new Map();\r
    const toLinear = value => {\r
      if (colorCache.has(value)) return colorCache.get(value);\r
      let rgb = [1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#ffffff';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r, g, b].map(v => Math.pow(v / 255, 2.2));\r
      }\r
      colorCache.set(value, rgb);\r
      return rgb;\r
    };\r
\r
    const view = { width: 1, height: 1, volumeWidth: 1, volumeHeight: 1 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const state = {\r
      clock: 0,\r
      intro: settingsRef.current.intro && !reduce ? 0 : 1,\r
      yaw: 0,\r
      pitch: 0,\r
      yawVelocity: 0,\r
      pitchVelocity: 0,\r
      heat: 0,\r
      heatX: 0,\r
      heatY: 0\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const timeOf = s => {\r
      const t = state.clock * 0.4;\r
      if (s.direction === 'reverse') return -t;\r
      if (s.direction !== 'pingpong') return t;\r
      const span = 10;\r
      const segment = (state.clock % span) / span;\r
      const eased = segment * segment * (3 - 2 * segment);\r
      return (Math.floor(state.clock / span) % 2 === 0 ? eased : 1 - eased) * span * 0.4;\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const presence = state.intro * state.intro * (3 - 2 * state.intro);\r
      gl.bindVertexArray(vao);\r
      sizeTarget(view.volumeWidth, view.volumeHeight);\r
\r
      const volume = programs.volume;\r
      const u = volume.uniforms;\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.viewport(0, 0, target.width, target.height);\r
      gl.useProgram(volume.program);\r
      gl.uniform2f(u.uView, view.width, view.height);\r
      gl.uniform2f(u.uScale, view.width / target.width, view.height / target.height);\r
      gl.uniform1f(u.uZoom, s.scale);\r
      gl.uniform1f(u.uTime, timeOf(s) + (1 - presence) * 1.4);\r
      gl.uniform1f(u.uTwist, s.twist);\r
      gl.uniform1f(u.uWave, 0.4 * s.wave);\r
      gl.uniform1f(u.uSharpness, 100 - s.softness * 90);\r
      gl.uniform2f(u.uOrbit, state.yaw, state.pitch);\r
      gl.uniform1f(u.uDither, floatTargets ? 0 : 1 / 255);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      const composite = programs.composite;\r
      const c = composite.uniforms;\r
      const base = toLinear(s.color);\r
      const highlight = base.map(v => v + (1 - v) * 0.85);\r
      const tone = 0.2126 * base[0] + 0.7152 * base[1] + 0.0722 * base[2];\r
      const depth = Math.min(1, 0.16 / Math.max(tone, 0.001));\r
      const ink = base.map(v => Math.pow(Math.min(1, v * depth), 1 / 2.2));\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(composite.program);\r
      gl.uniform2f(c.uResolution, canvas.width, canvas.height);\r
      gl.uniform3fv(c.uColor, base);\r
      gl.uniform3fv(c.uHighlight, highlight);\r
      gl.uniform3fv(c.uInk, ink);\r
      gl.uniform1f(c.uGain, 4.8 * s.brightness);\r
      gl.uniform1f(c.uShine, 0.025 * s.shine);\r
      gl.uniform1f(c.uPresence, presence);\r
      gl.uniform1f(c.uGrain, s.grain);\r
      gl.uniform1f(c.uFade, s.fade);\r
      gl.uniform1f(c.uOpacity, s.opacity);\r
      gl.uniform1f(c.uTime, state.clock % 1000);\r
      gl.uniform1f(c.uLightMode, s.lightMode ? 1 : 0);\r
      gl.uniform3f(\r
        c.uHeat,\r
        (state.heatX * canvas.width) / view.width,\r
        ((view.height - state.heatY) * canvas.height) / view.height,\r
        state.heat\r
      );\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.uniform1i(c.uVolume, 0);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const moving = !s.paused && !reduce;\r
      if (moving) state.clock += dt * s.speed;\r
      if (!s.intro || reduce) state.intro = 1;\r
      else if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / INTRO_SECONDS);\r
      const engaged = s.mouseInteractive && pointer.inside && !reduce;\r
      const goalYaw = engaged ? (pointer.x / view.width - 0.5) * 0.9 : 0;\r
      const goalPitch = engaged ? (pointer.y / view.height - 0.5) * 0.18 : 0;\r
      state.yawVelocity += (40 * (goalYaw - state.yaw) - 11 * state.yawVelocity) * dt;\r
      state.pitchVelocity += (40 * (goalPitch - state.pitch) - 11 * state.pitchVelocity) * dt;\r
      state.yaw += state.yawVelocity * dt;\r
      state.pitch += state.pitchVelocity * dt;\r
      state.heat += ((engaged ? 1 : 0) - state.heat) * (1 - Math.exp(-dt * (engaged ? 4 : 2)));\r
      state.heatX += (pointer.x - state.heatX) * (1 - Math.exp(-dt * 8));\r
      state.heatY += (pointer.y - state.heatY) * (1 - Math.exp(-dt * 8));\r
      render();\r
      const settling =\r
        state.intro < 1 ||\r
        Math.abs(goalYaw - state.yaw) > 0.0005 ||\r
        Math.abs(state.yawVelocity) > 0.0005 ||\r
        Math.abs(goalPitch - state.pitch) > 0.0005 ||\r
        Math.abs(state.pitchVelocity) > 0.0005 ||\r
        Math.abs((engaged ? 1 : 0) - state.heat) > 0.002;\r
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
      const ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      view.width = width;\r
      view.height = height;\r
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      let scale = s.quality;\r
      if (width * height * scale * scale > MAX_VOLUME_PIXELS) scale = Math.sqrt(MAX_VOLUME_PIXELS / (width * height));\r
      view.volumeWidth = Math.max(1, Math.round(width * scale));\r
      view.volumeHeight = Math.max(1, Math.round(height * scale));\r
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
    let lastQuality = settingsRef.current.quality;\r
    let lastDpr = settingsRef.current.dpr;\r
    wakeRef.current = () => {\r
      const s = settingsRef.current;\r
      if (s.quality !== lastQuality || s.dpr !== lastDpr) {\r
        lastQuality = s.quality;\r
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
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteTexture(texture);\r
      gl.deleteFramebuffer(framebuffer);\r
      gl.deleteProgram(programs.volume.program);\r
      gl.deleteProgram(programs.composite.program);\r
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
    <div ref={containerRef} className={\`plasma-container\${className ? \` \${className}\` : ''}\`} {...rest}>\r
      <canvas ref={canvasRef} className="plasma-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Plasma;\r
`,e=`.plasma-container {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.plasma-canvas {\r
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
const QUAD_VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const VOLUME = \`#version 300 es\r
precision highp float;\r
uniform vec2 uView;\r
uniform vec2 uScale;\r
uniform float uZoom;\r
uniform float uTime;\r
uniform float uTwist;\r
uniform float uWave;\r
uniform float uSharpness;\r
uniform vec2 uOrbit;\r
uniform float uDither;\r
out vec4 outColor;\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
void main() {\r
  vec2 c = (gl_FragCoord.xy * uScale - 0.5 * uView) / uZoom;\r
  vec3 rd = normalize(vec3(c, uView.y));\r
  vec3 ro = vec3(0.0, 0.0, -4.0);\r
  float cy = cos(uOrbit.x);\r
  float sy = sin(uOrbit.x);\r
  float cx = cos(uOrbit.y);\r
  float sx = sin(uOrbit.y);\r
  mat3 orbit = mat3(cy, 0.0, -sy, 0.0, 1.0, 0.0, sy, 0.0, cy) * mat3(1.0, 0.0, 0.0, 0.0, cx, sx, 0.0, -sx, cx);\r
  ro = orbit * ro;\r
  rd = orbit * rd;\r
  float z = 0.0;\r
  float density = 0.0;\r
  float band = 0.0;\r
  for (int i = 0; i < 60; i++) {\r
    vec3 p = ro + rd * z;\r
    vec3 s = p;\r
    float d = p.y - uTime;\r
    p.x += uWave * (1.0 + p.y) * sin(d + p.x * 0.1) * cos(0.34 * d + p.x * 0.05);\r
    vec2 q = p.xz *= mat2(cos(p.y * uTwist + vec4(0.0, 11.0, 33.0, 0.0) - uTime));\r
    float shell = abs(sqrt(length(q * q)) - 0.25 * (5.0 + s.y)) / 3.0;\r
    float stepLength = shell + 0.0008;\r
    z += stepLength;\r
    float phase = s.y + p.z * 0.5 + s.z - length(s - p);\r
    float weight = (1.0 + sin(phase + 8.0)) * exp(-shell * uSharpness) * stepLength;\r
    density += weight;\r
    band += weight * (0.5 + 0.5 * sin(phase * 0.5 + 1.0));\r
  }\r
  vec2 encoded = sqrt(vec2(density, band) / (1.0 + vec2(density, band)));\r
  encoded += (vec2(hash(gl_FragCoord.xy), hash(gl_FragCoord.yx + 17.0)) - 0.5) * uDither;\r
  outColor = vec4(encoded, 0.0, 1.0);\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uVolume;\r
uniform vec2 uResolution;\r
uniform vec3 uColor;\r
uniform vec3 uHighlight;\r
uniform vec3 uInk;\r
uniform float uGain;\r
uniform float uShine;\r
uniform float uPresence;\r
uniform float uGrain;\r
uniform float uFade;\r
uniform float uOpacity;\r
uniform float uTime;\r
uniform float uLightMode;\r
uniform vec3 uHeat;\r
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
  vec2 encoded = clamp(texture(uVolume, uv).rg, 0.0, 0.9995);\r
  encoded *= encoded;\r
  vec2 volume = encoded / (1.0 - encoded);\r
  vec2 offset = (gl_FragCoord.xy - uHeat.xy) / uResolution.y;\r
  float heat = uHeat.z * exp(-dot(offset, offset) / 0.05);\r
  float density = volume.r * uGain * uPresence * (1.0 + heat * 0.35);\r
  float band = clamp(volume.g / max(volume.r, 0.00001), 0.0, 1.0);\r
  vec3 tint = mix(uColor, uHighlight, band * 0.35);\r
  vec3 hdr = tint * density + uHighlight * density * density * uShine;\r
  float peak = max(hdr.r, max(hdr.g, hdr.b));\r
  float level = 1.0 - exp(-peak);\r
  float hot = smoothstep(1.0, 3.0, peak);\r
  float edge = uFade * 0.5;\r
  float mask = smootherstep(edge, uv.x) * smootherstep(edge, 1.0 - uv.x) * smootherstep(edge, uv.y) * smootherstep(edge, 1.0 - uv.y);\r
  mask *= uOpacity;\r
  float grain = (hash(gl_FragCoord.xy + fract(uTime * 7.31) * 113.0) - 0.5) * uGrain;\r
  if (uLightMode > 0.5) {\r
    vec3 color = mix(uInk, vec3(1.0), hot * 0.75);\r
    float alpha = clamp(pow(level, 0.8) * 0.9 * (1.0 + grain), 0.0, 1.0) * mask;\r
    outColor = vec4(color * alpha, alpha);\r
  } else {\r
    vec3 hue = hdr / max(peak, 0.0001);\r
    vec3 color = mix(hue * level, vec3(level), hot * 0.6);\r
    color = pow(color, vec3(1.0 / 2.2));\r
    color = clamp(color + grain * level, 0.0, 1.0) * mask;\r
    outColor = vec4(color, max(color.r, max(color.g, color.b)));\r
  }\r
}\`;\r
\r
const INTRO_SECONDS = 1.6;\r
const MAX_VOLUME_PIXELS = 1600000;\r
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
const link = (gl, fragmentSource) => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, QUAD_VERTEX);\r
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
    if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
export const Plasma = ({\r
  color = '#a6a3b8',\r
  speed = 1,\r
  direction = 'forward',\r
  scale = 1,\r
  twist = 1,\r
  wave = 1,\r
  softness = 0.5,\r
  shine = 1,\r
  brightness = 1,\r
  grain = 0.04,\r
  quality = 0.75,\r
  mouseInteractive = true,\r
  intro = true,\r
  fade = 0,\r
  opacity = 1,\r
  lightMode = false,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  ...rest\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settings = {\r
    color: String(color),\r
    speed,\r
    direction,\r
    scale: Math.max(0.1, scale),\r
    twist,\r
    wave: Math.max(0, wave),\r
    softness: clamp(softness, 0, 1),\r
    shine: Math.max(0, shine),\r
    brightness: Math.max(0, brightness),\r
    grain: Math.max(0, grain),\r
    quality: clamp(quality, 0.25, 1),\r
    mouseInteractive,\r
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
      stencil: false,\r
      powerPreference: 'high-performance'\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const floatTargets = !!gl.getExtension('EXT_color_buffer_float');\r
    const volumeProgram = link(gl, VOLUME);\r
    const compositeProgram = link(gl, COMPOSITE);\r
    if (!volumeProgram || !compositeProgram) return undefined;\r
    const programs = { volume: volumeProgram, composite: compositeProgram };\r
\r
    const buffer = gl.createBuffer();\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const texture = gl.createTexture();\r
    const framebuffer = gl.createFramebuffer();\r
    const target = { width: 0, height: 0 };\r
    const sizeTarget = (width, height) => {\r
      if (target.width === width && target.height === height) return;\r
      target.width = width;\r
      target.height = height;\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      if (floatTargets) {\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.HALF_FLOAT, null);\r
      } else {\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
      }\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
    };\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const colorCache = new Map();\r
    const toLinear = value => {\r
      if (colorCache.has(value)) return colorCache.get(value);\r
      let rgb = [1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#ffffff';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r, g, b].map(v => Math.pow(v / 255, 2.2));\r
      }\r
      colorCache.set(value, rgb);\r
      return rgb;\r
    };\r
\r
    const view = { width: 1, height: 1, volumeWidth: 1, volumeHeight: 1 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const state = {\r
      clock: 0,\r
      intro: settingsRef.current.intro && !reduce ? 0 : 1,\r
      yaw: 0,\r
      pitch: 0,\r
      yawVelocity: 0,\r
      pitchVelocity: 0,\r
      heat: 0,\r
      heatX: 0,\r
      heatY: 0\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const timeOf = s => {\r
      const t = state.clock * 0.4;\r
      if (s.direction === 'reverse') return -t;\r
      if (s.direction !== 'pingpong') return t;\r
      const span = 10;\r
      const segment = (state.clock % span) / span;\r
      const eased = segment * segment * (3 - 2 * segment);\r
      return (Math.floor(state.clock / span) % 2 === 0 ? eased : 1 - eased) * span * 0.4;\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const presence = state.intro * state.intro * (3 - 2 * state.intro);\r
      gl.bindVertexArray(vao);\r
      sizeTarget(view.volumeWidth, view.volumeHeight);\r
\r
      const volume = programs.volume;\r
      const u = volume.uniforms;\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.viewport(0, 0, target.width, target.height);\r
      gl.useProgram(volume.program);\r
      gl.uniform2f(u.uView, view.width, view.height);\r
      gl.uniform2f(u.uScale, view.width / target.width, view.height / target.height);\r
      gl.uniform1f(u.uZoom, s.scale);\r
      gl.uniform1f(u.uTime, timeOf(s) + (1 - presence) * 1.4);\r
      gl.uniform1f(u.uTwist, s.twist);\r
      gl.uniform1f(u.uWave, 0.4 * s.wave);\r
      gl.uniform1f(u.uSharpness, 100 - s.softness * 90);\r
      gl.uniform2f(u.uOrbit, state.yaw, state.pitch);\r
      gl.uniform1f(u.uDither, floatTargets ? 0 : 1 / 255);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      const composite = programs.composite;\r
      const c = composite.uniforms;\r
      const base = toLinear(s.color);\r
      const highlight = base.map(v => v + (1 - v) * 0.85);\r
      const tone = 0.2126 * base[0] + 0.7152 * base[1] + 0.0722 * base[2];\r
      const depth = Math.min(1, 0.16 / Math.max(tone, 0.001));\r
      const ink = base.map(v => Math.pow(Math.min(1, v * depth), 1 / 2.2));\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(composite.program);\r
      gl.uniform2f(c.uResolution, canvas.width, canvas.height);\r
      gl.uniform3fv(c.uColor, base);\r
      gl.uniform3fv(c.uHighlight, highlight);\r
      gl.uniform3fv(c.uInk, ink);\r
      gl.uniform1f(c.uGain, 4.8 * s.brightness);\r
      gl.uniform1f(c.uShine, 0.025 * s.shine);\r
      gl.uniform1f(c.uPresence, presence);\r
      gl.uniform1f(c.uGrain, s.grain);\r
      gl.uniform1f(c.uFade, s.fade);\r
      gl.uniform1f(c.uOpacity, s.opacity);\r
      gl.uniform1f(c.uTime, state.clock % 1000);\r
      gl.uniform1f(c.uLightMode, s.lightMode ? 1 : 0);\r
      gl.uniform3f(\r
        c.uHeat,\r
        (state.heatX * canvas.width) / view.width,\r
        ((view.height - state.heatY) * canvas.height) / view.height,\r
        state.heat\r
      );\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.uniform1i(c.uVolume, 0);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const moving = !s.paused && !reduce;\r
      if (moving) state.clock += dt * s.speed;\r
      if (!s.intro || reduce) state.intro = 1;\r
      else if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / INTRO_SECONDS);\r
      const engaged = s.mouseInteractive && pointer.inside && !reduce;\r
      const goalYaw = engaged ? (pointer.x / view.width - 0.5) * 0.9 : 0;\r
      const goalPitch = engaged ? (pointer.y / view.height - 0.5) * 0.18 : 0;\r
      state.yawVelocity += (40 * (goalYaw - state.yaw) - 11 * state.yawVelocity) * dt;\r
      state.pitchVelocity += (40 * (goalPitch - state.pitch) - 11 * state.pitchVelocity) * dt;\r
      state.yaw += state.yawVelocity * dt;\r
      state.pitch += state.pitchVelocity * dt;\r
      state.heat += ((engaged ? 1 : 0) - state.heat) * (1 - Math.exp(-dt * (engaged ? 4 : 2)));\r
      state.heatX += (pointer.x - state.heatX) * (1 - Math.exp(-dt * 8));\r
      state.heatY += (pointer.y - state.heatY) * (1 - Math.exp(-dt * 8));\r
      render();\r
      const settling =\r
        state.intro < 1 ||\r
        Math.abs(goalYaw - state.yaw) > 0.0005 ||\r
        Math.abs(state.yawVelocity) > 0.0005 ||\r
        Math.abs(goalPitch - state.pitch) > 0.0005 ||\r
        Math.abs(state.pitchVelocity) > 0.0005 ||\r
        Math.abs((engaged ? 1 : 0) - state.heat) > 0.002;\r
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
      const ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      view.width = width;\r
      view.height = height;\r
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      let scale = s.quality;\r
      if (width * height * scale * scale > MAX_VOLUME_PIXELS) scale = Math.sqrt(MAX_VOLUME_PIXELS / (width * height));\r
      view.volumeWidth = Math.max(1, Math.round(width * scale));\r
      view.volumeHeight = Math.max(1, Math.round(height * scale));\r
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
    let lastQuality = settingsRef.current.quality;\r
    let lastDpr = settingsRef.current.dpr;\r
    wakeRef.current = () => {\r
      const s = settingsRef.current;\r
      if (s.quality !== lastQuality || s.dpr !== lastDpr) {\r
        lastQuality = s.quality;\r
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
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteTexture(texture);\r
      gl.deleteFramebuffer(framebuffer);\r
      gl.deleteProgram(programs.volume.program);\r
      gl.deleteProgram(programs.composite.program);\r
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
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Plasma;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, type HTMLAttributes } from 'react';\r
\r
import './Plasma.css';\r
\r
export type PlasmaDirection = 'forward' | 'reverse' | 'pingpong';\r
\r
export interface PlasmaProps extends HTMLAttributes<HTMLDivElement> {\r
  color?: string;\r
  speed?: number;\r
  direction?: PlasmaDirection;\r
  scale?: number;\r
  twist?: number;\r
  wave?: number;\r
  softness?: number;\r
  shine?: number;\r
  brightness?: number;\r
  grain?: number;\r
  quality?: number;\r
  mouseInteractive?: boolean;\r
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
  speed: number;\r
  direction: PlasmaDirection;\r
  scale: number;\r
  twist: number;\r
  wave: number;\r
  softness: number;\r
  shine: number;\r
  brightness: number;\r
  grain: number;\r
  quality: number;\r
  mouseInteractive: boolean;\r
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
const QUAD_VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const VOLUME = \`#version 300 es\r
precision highp float;\r
uniform vec2 uView;\r
uniform vec2 uScale;\r
uniform float uZoom;\r
uniform float uTime;\r
uniform float uTwist;\r
uniform float uWave;\r
uniform float uSharpness;\r
uniform vec2 uOrbit;\r
uniform float uDither;\r
out vec4 outColor;\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
void main() {\r
  vec2 c = (gl_FragCoord.xy * uScale - 0.5 * uView) / uZoom;\r
  vec3 rd = normalize(vec3(c, uView.y));\r
  vec3 ro = vec3(0.0, 0.0, -4.0);\r
  float cy = cos(uOrbit.x);\r
  float sy = sin(uOrbit.x);\r
  float cx = cos(uOrbit.y);\r
  float sx = sin(uOrbit.y);\r
  mat3 orbit = mat3(cy, 0.0, -sy, 0.0, 1.0, 0.0, sy, 0.0, cy) * mat3(1.0, 0.0, 0.0, 0.0, cx, sx, 0.0, -sx, cx);\r
  ro = orbit * ro;\r
  rd = orbit * rd;\r
  float z = 0.0;\r
  float density = 0.0;\r
  float band = 0.0;\r
  for (int i = 0; i < 60; i++) {\r
    vec3 p = ro + rd * z;\r
    vec3 s = p;\r
    float d = p.y - uTime;\r
    p.x += uWave * (1.0 + p.y) * sin(d + p.x * 0.1) * cos(0.34 * d + p.x * 0.05);\r
    vec2 q = p.xz *= mat2(cos(p.y * uTwist + vec4(0.0, 11.0, 33.0, 0.0) - uTime));\r
    float shell = abs(sqrt(length(q * q)) - 0.25 * (5.0 + s.y)) / 3.0;\r
    float stepLength = shell + 0.0008;\r
    z += stepLength;\r
    float phase = s.y + p.z * 0.5 + s.z - length(s - p);\r
    float weight = (1.0 + sin(phase + 8.0)) * exp(-shell * uSharpness) * stepLength;\r
    density += weight;\r
    band += weight * (0.5 + 0.5 * sin(phase * 0.5 + 1.0));\r
  }\r
  vec2 encoded = sqrt(vec2(density, band) / (1.0 + vec2(density, band)));\r
  encoded += (vec2(hash(gl_FragCoord.xy), hash(gl_FragCoord.yx + 17.0)) - 0.5) * uDither;\r
  outColor = vec4(encoded, 0.0, 1.0);\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uVolume;\r
uniform vec2 uResolution;\r
uniform vec3 uColor;\r
uniform vec3 uHighlight;\r
uniform vec3 uInk;\r
uniform float uGain;\r
uniform float uShine;\r
uniform float uPresence;\r
uniform float uGrain;\r
uniform float uFade;\r
uniform float uOpacity;\r
uniform float uTime;\r
uniform float uLightMode;\r
uniform vec3 uHeat;\r
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
  vec2 encoded = clamp(texture(uVolume, uv).rg, 0.0, 0.9995);\r
  encoded *= encoded;\r
  vec2 volume = encoded / (1.0 - encoded);\r
  vec2 offset = (gl_FragCoord.xy - uHeat.xy) / uResolution.y;\r
  float heat = uHeat.z * exp(-dot(offset, offset) / 0.05);\r
  float density = volume.r * uGain * uPresence * (1.0 + heat * 0.35);\r
  float band = clamp(volume.g / max(volume.r, 0.00001), 0.0, 1.0);\r
  vec3 tint = mix(uColor, uHighlight, band * 0.35);\r
  vec3 hdr = tint * density + uHighlight * density * density * uShine;\r
  float peak = max(hdr.r, max(hdr.g, hdr.b));\r
  float level = 1.0 - exp(-peak);\r
  float hot = smoothstep(1.0, 3.0, peak);\r
  float edge = uFade * 0.5;\r
  float mask = smootherstep(edge, uv.x) * smootherstep(edge, 1.0 - uv.x) * smootherstep(edge, uv.y) * smootherstep(edge, 1.0 - uv.y);\r
  mask *= uOpacity;\r
  float grain = (hash(gl_FragCoord.xy + fract(uTime * 7.31) * 113.0) - 0.5) * uGrain;\r
  if (uLightMode > 0.5) {\r
    vec3 color = mix(uInk, vec3(1.0), hot * 0.75);\r
    float alpha = clamp(pow(level, 0.8) * 0.9 * (1.0 + grain), 0.0, 1.0) * mask;\r
    outColor = vec4(color * alpha, alpha);\r
  } else {\r
    vec3 hue = hdr / max(peak, 0.0001);\r
    vec3 color = mix(hue * level, vec3(level), hot * 0.6);\r
    color = pow(color, vec3(1.0 / 2.2));\r
    color = clamp(color + grain * level, 0.0, 1.0) * mask;\r
    outColor = vec4(color, max(color.r, max(color.g, color.b)));\r
  }\r
}\`;\r
\r
const INTRO_SECONDS = 1.6;\r
const MAX_VOLUME_PIXELS = 1600000;\r
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
const link = (gl: WebGL2RenderingContext, fragmentSource: string): Program | null => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, QUAD_VERTEX);\r
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
    if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
export const Plasma = ({\r
  color = '#a6a3b8',\r
  speed = 1,\r
  direction = 'forward',\r
  scale = 1,\r
  twist = 1,\r
  wave = 1,\r
  softness = 0.5,\r
  shine = 1,\r
  brightness = 1,\r
  grain = 0.04,\r
  quality = 0.75,\r
  mouseInteractive = true,\r
  intro = true,\r
  fade = 0,\r
  opacity = 1,\r
  lightMode = false,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  ...rest\r
}: PlasmaProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings: Settings = {\r
    color: String(color),\r
    speed,\r
    direction,\r
    scale: Math.max(0.1, scale),\r
    twist,\r
    wave: Math.max(0, wave),\r
    softness: clamp(softness, 0, 1),\r
    shine: Math.max(0, shine),\r
    brightness: Math.max(0, brightness),\r
    grain: Math.max(0, grain),\r
    quality: clamp(quality, 0.25, 1),\r
    mouseInteractive,\r
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
      stencil: false,\r
      powerPreference: 'high-performance'\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const floatTargets = !!gl.getExtension('EXT_color_buffer_float');\r
    const volumeProgram = link(gl, VOLUME);\r
    const compositeProgram = link(gl, COMPOSITE);\r
    if (!volumeProgram || !compositeProgram) return undefined;\r
    const programs = { volume: volumeProgram, composite: compositeProgram };\r
\r
    const buffer = gl.createBuffer();\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const texture = gl.createTexture();\r
    const framebuffer = gl.createFramebuffer();\r
    const target = { width: 0, height: 0 };\r
    const sizeTarget = (width: number, height: number) => {\r
      if (target.width === width && target.height === height) return;\r
      target.width = width;\r
      target.height = height;\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      if (floatTargets) {\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.HALF_FLOAT, null);\r
      } else {\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
      }\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
    };\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const colorCache = new Map<string, number[]>();\r
    const toLinear = (value: string): number[] => {\r
      const cached = colorCache.get(value);\r
      if (cached) return cached;\r
      let rgb = [1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#ffffff';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r, g, b].map(v => Math.pow(v / 255, 2.2));\r
      }\r
      colorCache.set(value, rgb);\r
      return rgb;\r
    };\r
\r
    const view = { width: 1, height: 1, volumeWidth: 1, volumeHeight: 1 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const state = {\r
      clock: 0,\r
      intro: settingsRef.current.intro && !reduce ? 0 : 1,\r
      yaw: 0,\r
      pitch: 0,\r
      yawVelocity: 0,\r
      pitchVelocity: 0,\r
      heat: 0,\r
      heatX: 0,\r
      heatY: 0\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const timeOf = (s: Settings) => {\r
      const t = state.clock * 0.4;\r
      if (s.direction === 'reverse') return -t;\r
      if (s.direction !== 'pingpong') return t;\r
      const span = 10;\r
      const segment = (state.clock % span) / span;\r
      const eased = segment * segment * (3 - 2 * segment);\r
      return (Math.floor(state.clock / span) % 2 === 0 ? eased : 1 - eased) * span * 0.4;\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const presence = state.intro * state.intro * (3 - 2 * state.intro);\r
      gl.bindVertexArray(vao);\r
      sizeTarget(view.volumeWidth, view.volumeHeight);\r
\r
      const volume = programs.volume;\r
      const u = volume.uniforms;\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.viewport(0, 0, target.width, target.height);\r
      gl.useProgram(volume.program);\r
      gl.uniform2f(u.uView, view.width, view.height);\r
      gl.uniform2f(u.uScale, view.width / target.width, view.height / target.height);\r
      gl.uniform1f(u.uZoom, s.scale);\r
      gl.uniform1f(u.uTime, timeOf(s) + (1 - presence) * 1.4);\r
      gl.uniform1f(u.uTwist, s.twist);\r
      gl.uniform1f(u.uWave, 0.4 * s.wave);\r
      gl.uniform1f(u.uSharpness, 100 - s.softness * 90);\r
      gl.uniform2f(u.uOrbit, state.yaw, state.pitch);\r
      gl.uniform1f(u.uDither, floatTargets ? 0 : 1 / 255);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      const composite = programs.composite;\r
      const c = composite.uniforms;\r
      const base = toLinear(s.color);\r
      const highlight = base.map(v => v + (1 - v) * 0.85);\r
      const tone = 0.2126 * base[0] + 0.7152 * base[1] + 0.0722 * base[2];\r
      const depth = Math.min(1, 0.16 / Math.max(tone, 0.001));\r
      const ink = base.map(v => Math.pow(Math.min(1, v * depth), 1 / 2.2));\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(composite.program);\r
      gl.uniform2f(c.uResolution, canvas.width, canvas.height);\r
      gl.uniform3fv(c.uColor, base);\r
      gl.uniform3fv(c.uHighlight, highlight);\r
      gl.uniform3fv(c.uInk, ink);\r
      gl.uniform1f(c.uGain, 4.8 * s.brightness);\r
      gl.uniform1f(c.uShine, 0.025 * s.shine);\r
      gl.uniform1f(c.uPresence, presence);\r
      gl.uniform1f(c.uGrain, s.grain);\r
      gl.uniform1f(c.uFade, s.fade);\r
      gl.uniform1f(c.uOpacity, s.opacity);\r
      gl.uniform1f(c.uTime, state.clock % 1000);\r
      gl.uniform1f(c.uLightMode, s.lightMode ? 1 : 0);\r
      gl.uniform3f(\r
        c.uHeat,\r
        (state.heatX * canvas.width) / view.width,\r
        ((view.height - state.heatY) * canvas.height) / view.height,\r
        state.heat\r
      );\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.uniform1i(c.uVolume, 0);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const moving = !s.paused && !reduce;\r
      if (moving) state.clock += dt * s.speed;\r
      if (!s.intro || reduce) state.intro = 1;\r
      else if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / INTRO_SECONDS);\r
      const engaged = s.mouseInteractive && pointer.inside && !reduce;\r
      const goalYaw = engaged ? (pointer.x / view.width - 0.5) * 0.9 : 0;\r
      const goalPitch = engaged ? (pointer.y / view.height - 0.5) * 0.18 : 0;\r
      state.yawVelocity += (40 * (goalYaw - state.yaw) - 11 * state.yawVelocity) * dt;\r
      state.pitchVelocity += (40 * (goalPitch - state.pitch) - 11 * state.pitchVelocity) * dt;\r
      state.yaw += state.yawVelocity * dt;\r
      state.pitch += state.pitchVelocity * dt;\r
      state.heat += ((engaged ? 1 : 0) - state.heat) * (1 - Math.exp(-dt * (engaged ? 4 : 2)));\r
      state.heatX += (pointer.x - state.heatX) * (1 - Math.exp(-dt * 8));\r
      state.heatY += (pointer.y - state.heatY) * (1 - Math.exp(-dt * 8));\r
      render();\r
      const settling =\r
        state.intro < 1 ||\r
        Math.abs(goalYaw - state.yaw) > 0.0005 ||\r
        Math.abs(state.yawVelocity) > 0.0005 ||\r
        Math.abs(goalPitch - state.pitch) > 0.0005 ||\r
        Math.abs(state.pitchVelocity) > 0.0005 ||\r
        Math.abs((engaged ? 1 : 0) - state.heat) > 0.002;\r
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
      const ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      view.width = width;\r
      view.height = height;\r
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      let scale = s.quality;\r
      if (width * height * scale * scale > MAX_VOLUME_PIXELS) scale = Math.sqrt(MAX_VOLUME_PIXELS / (width * height));\r
      view.volumeWidth = Math.max(1, Math.round(width * scale));\r
      view.volumeHeight = Math.max(1, Math.round(height * scale));\r
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
    let lastQuality = settingsRef.current.quality;\r
    let lastDpr = settingsRef.current.dpr;\r
    wakeRef.current = () => {\r
      const s = settingsRef.current;\r
      if (s.quality !== lastQuality || s.dpr !== lastDpr) {\r
        lastQuality = s.quality;\r
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
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteTexture(texture);\r
      gl.deleteFramebuffer(framebuffer);\r
      gl.deleteProgram(programs.volume.program);\r
      gl.deleteProgram(programs.composite.program);\r
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
    <div ref={containerRef} className={\`plasma-container\${className ? \` \${className}\` : ''}\`} {...rest}>\r
      <canvas ref={canvasRef} className="plasma-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Plasma;\r
`,a=`'use client';\r
\r
import { useEffect, useRef, type HTMLAttributes } from 'react';\r
\r
export type PlasmaDirection = 'forward' | 'reverse' | 'pingpong';\r
\r
export interface PlasmaProps extends HTMLAttributes<HTMLDivElement> {\r
  color?: string;\r
  speed?: number;\r
  direction?: PlasmaDirection;\r
  scale?: number;\r
  twist?: number;\r
  wave?: number;\r
  softness?: number;\r
  shine?: number;\r
  brightness?: number;\r
  grain?: number;\r
  quality?: number;\r
  mouseInteractive?: boolean;\r
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
  speed: number;\r
  direction: PlasmaDirection;\r
  scale: number;\r
  twist: number;\r
  wave: number;\r
  softness: number;\r
  shine: number;\r
  brightness: number;\r
  grain: number;\r
  quality: number;\r
  mouseInteractive: boolean;\r
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
const QUAD_VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const VOLUME = \`#version 300 es\r
precision highp float;\r
uniform vec2 uView;\r
uniform vec2 uScale;\r
uniform float uZoom;\r
uniform float uTime;\r
uniform float uTwist;\r
uniform float uWave;\r
uniform float uSharpness;\r
uniform vec2 uOrbit;\r
uniform float uDither;\r
out vec4 outColor;\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
void main() {\r
  vec2 c = (gl_FragCoord.xy * uScale - 0.5 * uView) / uZoom;\r
  vec3 rd = normalize(vec3(c, uView.y));\r
  vec3 ro = vec3(0.0, 0.0, -4.0);\r
  float cy = cos(uOrbit.x);\r
  float sy = sin(uOrbit.x);\r
  float cx = cos(uOrbit.y);\r
  float sx = sin(uOrbit.y);\r
  mat3 orbit = mat3(cy, 0.0, -sy, 0.0, 1.0, 0.0, sy, 0.0, cy) * mat3(1.0, 0.0, 0.0, 0.0, cx, sx, 0.0, -sx, cx);\r
  ro = orbit * ro;\r
  rd = orbit * rd;\r
  float z = 0.0;\r
  float density = 0.0;\r
  float band = 0.0;\r
  for (int i = 0; i < 60; i++) {\r
    vec3 p = ro + rd * z;\r
    vec3 s = p;\r
    float d = p.y - uTime;\r
    p.x += uWave * (1.0 + p.y) * sin(d + p.x * 0.1) * cos(0.34 * d + p.x * 0.05);\r
    vec2 q = p.xz *= mat2(cos(p.y * uTwist + vec4(0.0, 11.0, 33.0, 0.0) - uTime));\r
    float shell = abs(sqrt(length(q * q)) - 0.25 * (5.0 + s.y)) / 3.0;\r
    float stepLength = shell + 0.0008;\r
    z += stepLength;\r
    float phase = s.y + p.z * 0.5 + s.z - length(s - p);\r
    float weight = (1.0 + sin(phase + 8.0)) * exp(-shell * uSharpness) * stepLength;\r
    density += weight;\r
    band += weight * (0.5 + 0.5 * sin(phase * 0.5 + 1.0));\r
  }\r
  vec2 encoded = sqrt(vec2(density, band) / (1.0 + vec2(density, band)));\r
  encoded += (vec2(hash(gl_FragCoord.xy), hash(gl_FragCoord.yx + 17.0)) - 0.5) * uDither;\r
  outColor = vec4(encoded, 0.0, 1.0);\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uVolume;\r
uniform vec2 uResolution;\r
uniform vec3 uColor;\r
uniform vec3 uHighlight;\r
uniform vec3 uInk;\r
uniform float uGain;\r
uniform float uShine;\r
uniform float uPresence;\r
uniform float uGrain;\r
uniform float uFade;\r
uniform float uOpacity;\r
uniform float uTime;\r
uniform float uLightMode;\r
uniform vec3 uHeat;\r
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
  vec2 encoded = clamp(texture(uVolume, uv).rg, 0.0, 0.9995);\r
  encoded *= encoded;\r
  vec2 volume = encoded / (1.0 - encoded);\r
  vec2 offset = (gl_FragCoord.xy - uHeat.xy) / uResolution.y;\r
  float heat = uHeat.z * exp(-dot(offset, offset) / 0.05);\r
  float density = volume.r * uGain * uPresence * (1.0 + heat * 0.35);\r
  float band = clamp(volume.g / max(volume.r, 0.00001), 0.0, 1.0);\r
  vec3 tint = mix(uColor, uHighlight, band * 0.35);\r
  vec3 hdr = tint * density + uHighlight * density * density * uShine;\r
  float peak = max(hdr.r, max(hdr.g, hdr.b));\r
  float level = 1.0 - exp(-peak);\r
  float hot = smoothstep(1.0, 3.0, peak);\r
  float edge = uFade * 0.5;\r
  float mask = smootherstep(edge, uv.x) * smootherstep(edge, 1.0 - uv.x) * smootherstep(edge, uv.y) * smootherstep(edge, 1.0 - uv.y);\r
  mask *= uOpacity;\r
  float grain = (hash(gl_FragCoord.xy + fract(uTime * 7.31) * 113.0) - 0.5) * uGrain;\r
  if (uLightMode > 0.5) {\r
    vec3 color = mix(uInk, vec3(1.0), hot * 0.75);\r
    float alpha = clamp(pow(level, 0.8) * 0.9 * (1.0 + grain), 0.0, 1.0) * mask;\r
    outColor = vec4(color * alpha, alpha);\r
  } else {\r
    vec3 hue = hdr / max(peak, 0.0001);\r
    vec3 color = mix(hue * level, vec3(level), hot * 0.6);\r
    color = pow(color, vec3(1.0 / 2.2));\r
    color = clamp(color + grain * level, 0.0, 1.0) * mask;\r
    outColor = vec4(color, max(color.r, max(color.g, color.b)));\r
  }\r
}\`;\r
\r
const INTRO_SECONDS = 1.6;\r
const MAX_VOLUME_PIXELS = 1600000;\r
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
const link = (gl: WebGL2RenderingContext, fragmentSource: string): Program | null => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, QUAD_VERTEX);\r
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
    if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
export const Plasma = ({\r
  color = '#a6a3b8',\r
  speed = 1,\r
  direction = 'forward',\r
  scale = 1,\r
  twist = 1,\r
  wave = 1,\r
  softness = 0.5,\r
  shine = 1,\r
  brightness = 1,\r
  grain = 0.04,\r
  quality = 0.75,\r
  mouseInteractive = true,\r
  intro = true,\r
  fade = 0,\r
  opacity = 1,\r
  lightMode = false,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  ...rest\r
}: PlasmaProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings: Settings = {\r
    color: String(color),\r
    speed,\r
    direction,\r
    scale: Math.max(0.1, scale),\r
    twist,\r
    wave: Math.max(0, wave),\r
    softness: clamp(softness, 0, 1),\r
    shine: Math.max(0, shine),\r
    brightness: Math.max(0, brightness),\r
    grain: Math.max(0, grain),\r
    quality: clamp(quality, 0.25, 1),\r
    mouseInteractive,\r
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
      stencil: false,\r
      powerPreference: 'high-performance'\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const floatTargets = !!gl.getExtension('EXT_color_buffer_float');\r
    const volumeProgram = link(gl, VOLUME);\r
    const compositeProgram = link(gl, COMPOSITE);\r
    if (!volumeProgram || !compositeProgram) return undefined;\r
    const programs = { volume: volumeProgram, composite: compositeProgram };\r
\r
    const buffer = gl.createBuffer();\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const texture = gl.createTexture();\r
    const framebuffer = gl.createFramebuffer();\r
    const target = { width: 0, height: 0 };\r
    const sizeTarget = (width: number, height: number) => {\r
      if (target.width === width && target.height === height) return;\r
      target.width = width;\r
      target.height = height;\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      if (floatTargets) {\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.HALF_FLOAT, null);\r
      } else {\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
      }\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
    };\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const colorCache = new Map<string, number[]>();\r
    const toLinear = (value: string): number[] => {\r
      const cached = colorCache.get(value);\r
      if (cached) return cached;\r
      let rgb = [1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#ffffff';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r, g, b].map(v => Math.pow(v / 255, 2.2));\r
      }\r
      colorCache.set(value, rgb);\r
      return rgb;\r
    };\r
\r
    const view = { width: 1, height: 1, volumeWidth: 1, volumeHeight: 1 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const state = {\r
      clock: 0,\r
      intro: settingsRef.current.intro && !reduce ? 0 : 1,\r
      yaw: 0,\r
      pitch: 0,\r
      yawVelocity: 0,\r
      pitchVelocity: 0,\r
      heat: 0,\r
      heatX: 0,\r
      heatY: 0\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const timeOf = (s: Settings) => {\r
      const t = state.clock * 0.4;\r
      if (s.direction === 'reverse') return -t;\r
      if (s.direction !== 'pingpong') return t;\r
      const span = 10;\r
      const segment = (state.clock % span) / span;\r
      const eased = segment * segment * (3 - 2 * segment);\r
      return (Math.floor(state.clock / span) % 2 === 0 ? eased : 1 - eased) * span * 0.4;\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const presence = state.intro * state.intro * (3 - 2 * state.intro);\r
      gl.bindVertexArray(vao);\r
      sizeTarget(view.volumeWidth, view.volumeHeight);\r
\r
      const volume = programs.volume;\r
      const u = volume.uniforms;\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.viewport(0, 0, target.width, target.height);\r
      gl.useProgram(volume.program);\r
      gl.uniform2f(u.uView, view.width, view.height);\r
      gl.uniform2f(u.uScale, view.width / target.width, view.height / target.height);\r
      gl.uniform1f(u.uZoom, s.scale);\r
      gl.uniform1f(u.uTime, timeOf(s) + (1 - presence) * 1.4);\r
      gl.uniform1f(u.uTwist, s.twist);\r
      gl.uniform1f(u.uWave, 0.4 * s.wave);\r
      gl.uniform1f(u.uSharpness, 100 - s.softness * 90);\r
      gl.uniform2f(u.uOrbit, state.yaw, state.pitch);\r
      gl.uniform1f(u.uDither, floatTargets ? 0 : 1 / 255);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      const composite = programs.composite;\r
      const c = composite.uniforms;\r
      const base = toLinear(s.color);\r
      const highlight = base.map(v => v + (1 - v) * 0.85);\r
      const tone = 0.2126 * base[0] + 0.7152 * base[1] + 0.0722 * base[2];\r
      const depth = Math.min(1, 0.16 / Math.max(tone, 0.001));\r
      const ink = base.map(v => Math.pow(Math.min(1, v * depth), 1 / 2.2));\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(composite.program);\r
      gl.uniform2f(c.uResolution, canvas.width, canvas.height);\r
      gl.uniform3fv(c.uColor, base);\r
      gl.uniform3fv(c.uHighlight, highlight);\r
      gl.uniform3fv(c.uInk, ink);\r
      gl.uniform1f(c.uGain, 4.8 * s.brightness);\r
      gl.uniform1f(c.uShine, 0.025 * s.shine);\r
      gl.uniform1f(c.uPresence, presence);\r
      gl.uniform1f(c.uGrain, s.grain);\r
      gl.uniform1f(c.uFade, s.fade);\r
      gl.uniform1f(c.uOpacity, s.opacity);\r
      gl.uniform1f(c.uTime, state.clock % 1000);\r
      gl.uniform1f(c.uLightMode, s.lightMode ? 1 : 0);\r
      gl.uniform3f(\r
        c.uHeat,\r
        (state.heatX * canvas.width) / view.width,\r
        ((view.height - state.heatY) * canvas.height) / view.height,\r
        state.heat\r
      );\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.uniform1i(c.uVolume, 0);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const moving = !s.paused && !reduce;\r
      if (moving) state.clock += dt * s.speed;\r
      if (!s.intro || reduce) state.intro = 1;\r
      else if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / INTRO_SECONDS);\r
      const engaged = s.mouseInteractive && pointer.inside && !reduce;\r
      const goalYaw = engaged ? (pointer.x / view.width - 0.5) * 0.9 : 0;\r
      const goalPitch = engaged ? (pointer.y / view.height - 0.5) * 0.18 : 0;\r
      state.yawVelocity += (40 * (goalYaw - state.yaw) - 11 * state.yawVelocity) * dt;\r
      state.pitchVelocity += (40 * (goalPitch - state.pitch) - 11 * state.pitchVelocity) * dt;\r
      state.yaw += state.yawVelocity * dt;\r
      state.pitch += state.pitchVelocity * dt;\r
      state.heat += ((engaged ? 1 : 0) - state.heat) * (1 - Math.exp(-dt * (engaged ? 4 : 2)));\r
      state.heatX += (pointer.x - state.heatX) * (1 - Math.exp(-dt * 8));\r
      state.heatY += (pointer.y - state.heatY) * (1 - Math.exp(-dt * 8));\r
      render();\r
      const settling =\r
        state.intro < 1 ||\r
        Math.abs(goalYaw - state.yaw) > 0.0005 ||\r
        Math.abs(state.yawVelocity) > 0.0005 ||\r
        Math.abs(goalPitch - state.pitch) > 0.0005 ||\r
        Math.abs(state.pitchVelocity) > 0.0005 ||\r
        Math.abs((engaged ? 1 : 0) - state.heat) > 0.002;\r
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
      const ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      view.width = width;\r
      view.height = height;\r
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      let scale = s.quality;\r
      if (width * height * scale * scale > MAX_VOLUME_PIXELS) scale = Math.sqrt(MAX_VOLUME_PIXELS / (width * height));\r
      view.volumeWidth = Math.max(1, Math.round(width * scale));\r
      view.volumeHeight = Math.max(1, Math.round(height * scale));\r
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
    let lastQuality = settingsRef.current.quality;\r
    let lastDpr = settingsRef.current.dpr;\r
    wakeRef.current = () => {\r
      const s = settingsRef.current;\r
      if (s.quality !== lastQuality || s.dpr !== lastDpr) {\r
        lastQuality = s.quality;\r
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
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteTexture(texture);\r
      gl.deleteFramebuffer(framebuffer);\r
      gl.deleteProgram(programs.volume.program);\r
      gl.deleteProgram(programs.composite.program);\r
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
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Plasma;\r
`,o={usage:`import Plasma from './Plasma';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <Plasma
    color="#a6a3b8"
    speed={1}
    direction="forward"
    scale={1}
    twist={1}
    softness={0.5}
    shine={1}
    mouseInteractive={true}
  />
</div>`,code:r,css:e,tailwind:n,tsCode:t,tsTailwind:a};export{o as plasma};
