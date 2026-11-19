const r=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
import './Silk.css';\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const SILK = \`\r
uniform vec2 uView;\r
uniform float uScale;\r
uniform float uRotation;\r
uniform float uTime;\r
uniform float uWave;\r
uniform float uRipple;\r
uniform float uFold;\r
uniform vec2 uShift;\r
uniform vec4 uPointer;\r
uniform vec2 uDrag;\r
uniform vec4 uWaves[4];\r
\r
const float e = 2.71828182845904523536;\r
\r
float noise(vec2 texCoord) {\r
  float G = e;\r
  vec2 r = (G * sin(G * texCoord));\r
  return fract(r.x * r.y * (1.0 + texCoord.x));\r
}\r
\r
vec2 rotateUvs(vec2 uv, float angle) {\r
  float c = cos(angle);\r
  float s = sin(angle);\r
  mat2 rot = mat2(c, -s, s, c);\r
  return rot * uv;\r
}\r
\r
vec2 bend(vec2 uv) {\r
  vec2 aspect = vec2(uView.x / uView.y, 1.0);\r
  vec2 offset = (uv - uPointer.xy) * aspect;\r
  float touch = uPointer.z * exp(-dot(offset, offset) / (uPointer.w * uPointer.w));\r
  uv -= uDrag * touch;\r
  for (int i = 0; i < 4; i++) {\r
    vec4 wave = uWaves[i];\r
    if (wave.w <= 0.0) continue;\r
    vec2 q = (uv - wave.xy) * aspect;\r
    float dist = length(q);\r
    float front = dist - wave.z;\r
    float ring = exp(-front * front * 60.0) * wave.w;\r
    uv += q / max(dist, 0.0001) / aspect * ring * 0.034 * sin(front * 34.0);\r
  }\r
  return uv;\r
}\r
\r
float silk(vec2 vUv) {\r
  vec2 uv = rotateUvs(vUv * uScale, uRotation);\r
  vec2 tex = uv * uScale + uShift;\r
  float tOffset = uTime;\r
  tex.y += 0.03 * uWave * sin(8.0 * tex.x - tOffset);\r
  return 0.6 + 0.4 * uFold * sin(5.0 * (tex.x + tex.y + cos(3.0 * tex.x + 5.0 * tex.y) + 0.02 * tOffset) + uRipple * sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));\r
}\r
\`;\r
\r
const FIELD = \`#version 300 es\r
precision highp float;\r
\${SILK}\r
out vec4 outColor;\r
\r
void main() {\r
  vec2 vUv = gl_FragCoord.xy / uView;\r
  float pattern = silk(bend(vUv));\r
  float n = clamp((pattern - 0.2) / 0.8, 0.0, 1.0);\r
  outColor = vec4(pow(n, 6.0), 0.0, 0.0, 1.0);\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
\${SILK}\r
uniform sampler2D uBloom;\r
uniform vec3 uColor;\r
uniform vec3 uSheenColor;\r
uniform float uNoiseIntensity;\r
uniform float uDepth;\r
uniform float uSheen;\r
uniform float uGlow;\r
uniform float uLightMode;\r
uniform vec3 uLight;\r
uniform vec2 uStep;\r
uniform float uPresence;\r
uniform float uFade;\r
out vec4 outColor;\r
\r
float smootherstep01(float t) {\r
  t = clamp(t, 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
vec3 softClip(vec3 c) {\r
  vec3 over = max(c - 0.75, 0.0);\r
  return min(c, 0.75) + 0.25 * (1.0 - exp(-over * 4.0));\r
}\r
\r
void main() {\r
  vec2 vUv = gl_FragCoord.xy / uView;\r
  vec2 coord = bend(vUv);\r
  float pattern = silk(coord);\r
  float rnd = noise(gl_FragCoord.xy);\r
  float n = clamp((pattern - 0.2) / 0.8, 0.0, 1.0);\r
\r
  float gx = silk(coord + vec2(uStep.x, 0.0)) - pattern;\r
  float gy = silk(coord + vec2(0.0, uStep.y)) - pattern;\r
  vec3 normal = normalize(vec3(-gx * 26.0, -gy * 26.0, 1.0));\r
  vec3 toLight = normalize(vec3(uLight.xy, 0.85));\r
  float relief = 1.0 + (dot(normal, toLight) - toLight.z) * 1.8 * uDepth;\r
  vec3 halfway = normalize(toLight + vec3(0.0, 0.0, 1.0));\r
  float gloss = pow(max(dot(normal, halfway), 0.0), 48.0) * smoothstep(0.25, 0.85, n);\r
  float crest = pow(n, 5.0);\r
  float shine = (gloss * 0.85 + crest * 0.4) * uSheen * (1.0 + uLight.z * 0.6);\r
\r
  float bloom = 0.0;\r
  if (uGlow > 0.0) {\r
    bloom += textureLod(uBloom, vUv, 1.0).r * 0.35;\r
    bloom += textureLod(uBloom, vUv, 2.0).r * 0.3;\r
    bloom += textureLod(uBloom, vUv, 3.0).r * 0.2;\r
    bloom += textureLod(uBloom, vUv, 4.0).r * 0.15;\r
  }\r
\r
  vec3 result;\r
  if (uLightMode > 0.5) {\r
    float fold = smoothstep(0.28, 0.9, pattern);\r
    float specular = smoothstep(0.72, 0.98, pattern);\r
    vec3 shadowColor = uColor * (0.72 - 0.12 * uDepth);\r
    vec3 bodyColor = min(uColor * 1.18, vec3(1.0));\r
    vec3 lightBase = mix(shadowColor, bodyColor, fold) * mix(1.0, relief, 0.6);\r
    lightBase = mix(lightBase, vec3(1.0), clamp(specular * 0.92 + shine * 0.22 + bloom * uGlow * 0.2, 0.0, 1.0));\r
    float fineNoise = noise(gl_FragCoord.xy * 0.63 + vec2(17.0, 41.0));\r
    float grainSignal = (rnd + fineNoise - 1.0);\r
    float grainStrength = clamp(uNoiseIntensity * 0.038, 0.0, 0.16);\r
    result = clamp(lightBase + grainSignal * grainStrength, 0.0, 1.0);\r
  } else {\r
    float grain = rnd / 15.0 * uNoiseIntensity;\r
    float floorValue = mix(0.2, 0.03, uDepth);\r
    float curve = uDepth > 0.0 ? pow(n, 1.0 + 1.4 * uDepth) : n;\r
    float shade = uDepth > 0.0 ? floorValue + (1.0 - floorValue) * curve : pattern;\r
    vec3 tone = mix(uColor, pow(uColor, vec3(1.45)), (1.0 - n) * uDepth);\r
    vec3 lit = tone * shade * relief - vec3(grain);\r
    vec3 tint = mix(uColor, uSheenColor, 0.8);\r
    vec3 extra = tint * (shine + bloom * uGlow * 0.55);\r
    float blend = clamp((uSheen + uGlow) * 4.0, 0.0, 1.0);\r
    result = mix(clamp(lit, 0.0, 1.0), clamp(softClip(lit + extra), 0.0, 1.0), blend);\r
  }\r
\r
  float edge = uFade * 0.5;\r
  float mask = 1.0;\r
  if (edge > 0.0) {\r
    mask = smootherstep01(vUv.x / edge) * smootherstep01((1.0 - vUv.x) / edge);\r
    mask *= smootherstep01(vUv.y / edge) * smootherstep01((1.0 - vUv.y) / edge);\r
  }\r
  float alpha = uPresence * mask;\r
  outColor = vec4(result * alpha, alpha);\r
}\`;\r
\r
const INTRO_SECONDS = 2.2;\r
const INTRO_RUSH = 1.6;\r
const WAVE_LIFE = 1.6;\r
const DEFAULT_LIGHT = [-0.55, 0.7];\r
const LIGHT_TILT = Math.hypot(DEFAULT_LIGHT[0], DEFAULT_LIGHT[1]);\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const ease = t => t * t * t * (t * (t * 6 - 15) + 10);\r
\r
const variationShift = variation => {\r
  const n = Number(variation) || 0;\r
  if (!n) return [0, 0];\r
  const wave = k => {\r
    const v = Math.sin(n * 12.9898 + k * 78.233) * 43758.5453;\r
    return v - Math.floor(v) - 0.5;\r
  };\r
  return [wave(1) * 6, wave(2) * 6];\r
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
    if (info) uniforms[info.name.replace(/\\[0\\]$/, '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const Silk = ({\r
  speed = 5,\r
  scale = 1,\r
  color = '#7B7481',\r
  sheenColor = '#ffffff',\r
  noiseIntensity = 1.5,\r
  rotation = 0,\r
  sheen = 0.5,\r
  depth = 0.5,\r
  glow = 0.3,\r
  ripple = 1,\r
  wave = 1,\r
  variation = 0,\r
  mouseInteraction = true,\r
  interactionStrength = 1,\r
  clickRipple = true,\r
  intro = true,\r
  fade = 0,\r
  lightMode = false,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settingsRef = useRef(null);\r
  settingsRef.current = {\r
    speed,\r
    scale,\r
    color: String(color),\r
    sheenColor: String(sheenColor),\r
    noiseIntensity: Math.max(0, noiseIntensity),\r
    rotation,\r
    sheen: Math.max(0, sheen),\r
    depth: clamp(depth, 0, 1),\r
    glow: Math.max(0, glow),\r
    ripple: Math.max(0, ripple),\r
    wave: Math.max(0, wave),\r
    variation,\r
    mouseInteraction,\r
    interactionStrength: Math.max(0, interactionStrength),\r
    clickRipple,\r
    intro,\r
    fade: clamp(fade, 0, 1),\r
    lightMode,\r
    paused,\r
    dpr\r
  };\r
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
    const fieldProgram = link(gl, FIELD);\r
    const compositeProgram = link(gl, COMPOSITE);\r
    if (!fieldProgram || !compositeProgram) return undefined;\r
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
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
    };\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const colorCache = new Map();\r
    const toRgb = value => {\r
      if (colorCache.has(value)) return colorCache.get(value);\r
      let rgb = [1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#ffffff';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      colorCache.set(value, rgb);\r
      return rgb;\r
    };\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1, ratio: 1 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const waves = [];\r
    const waveData = new Float32Array(16);\r
    const state = {\r
      flow: 0,\r
      intro: settingsRef.current.intro && !reduce ? 0 : 1,\r
      touch: 0,\r
      x: 0,\r
      y: 0,\r
      dragX: 0,\r
      dragY: 0,\r
      lightX: DEFAULT_LIGHT[0],\r
      lightY: DEFAULT_LIGHT[1]\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const setShared = (uniforms, width, height, s, unfold) => {\r
      const [shiftX, shiftY] = variationShift(s.variation);\r
      gl.uniform2f(uniforms.uView, width, height);\r
      gl.uniform1f(uniforms.uScale, s.scale);\r
      gl.uniform1f(uniforms.uRotation, s.rotation);\r
      gl.uniform1f(uniforms.uTime, state.flow - INTRO_RUSH * (1 - unfold));\r
      gl.uniform1f(uniforms.uWave, s.wave);\r
      gl.uniform1f(uniforms.uRipple, s.ripple);\r
      gl.uniform1f(uniforms.uFold, 0.25 + 0.75 * unfold);\r
      gl.uniform2f(uniforms.uShift, shiftX, shiftY);\r
      gl.uniform4f(\r
        uniforms.uPointer,\r
        state.x / view.width,\r
        1 - state.y / view.height,\r
        state.touch * s.interactionStrength,\r
        0.32\r
      );\r
      gl.uniform2f(uniforms.uDrag, state.dragX, state.dragY);\r
      gl.uniform4fv(uniforms.uWaves, waveData);\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const unfold = ease(state.intro);\r
      const presence = 1 - Math.pow(1 - state.intro, 3);\r
      gl.bindVertexArray(vao);\r
\r
      waveData.fill(0);\r
      waves.slice(-4).forEach((item, index) => {\r
        waveData.set([item.x, item.y, item.age * 0.6, Math.exp(-item.age / (WAVE_LIFE * 0.45))], index * 4);\r
      });\r
\r
      if (s.glow > 0) {\r
        sizeTarget(Math.max(1, Math.round(canvas.width / 4)), Math.max(1, Math.round(canvas.height / 4)));\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
        gl.viewport(0, 0, target.width, target.height);\r
        gl.useProgram(fieldProgram.program);\r
        setShared(fieldProgram.uniforms, target.width, target.height, s, unfold);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
        gl.bindTexture(gl.TEXTURE_2D, texture);\r
        gl.generateMipmap(gl.TEXTURE_2D);\r
      }\r
\r
      const c = compositeProgram.uniforms;\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(compositeProgram.program);\r
      setShared(c, canvas.width, canvas.height, s, unfold);\r
      gl.uniform3fv(c.uColor, toRgb(s.color));\r
      gl.uniform3fv(c.uSheenColor, toRgb(s.sheenColor));\r
      gl.uniform1f(c.uNoiseIntensity, s.noiseIntensity);\r
      gl.uniform1f(c.uDepth, s.depth);\r
      gl.uniform1f(c.uSheen, s.sheen);\r
      gl.uniform1f(c.uGlow, s.glow);\r
      gl.uniform1f(c.uLightMode, s.lightMode ? 1 : 0);\r
      gl.uniform3f(c.uLight, state.lightX, state.lightY, state.touch * s.interactionStrength);\r
      gl.uniform2f(c.uStep, view.ratio / canvas.width, view.ratio / canvas.height);\r
      gl.uniform1f(c.uPresence, presence);\r
      gl.uniform1f(c.uFade, s.fade);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.uniform1i(c.uBloom, 0);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const flowing = !s.paused && !reduce && s.speed !== 0;\r
      if (flowing) state.flow += dt * 0.1 * s.speed;\r
      if (!s.intro || reduce) state.intro = 1;\r
      else if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / INTRO_SECONDS);\r
\r
      const engaged = s.mouseInteraction && pointer.inside && !reduce;\r
      if (engaged && state.touch < 0.01) {\r
        state.x = pointer.x;\r
        state.y = pointer.y;\r
      }\r
      const follow = 1 - Math.exp(-dt * 10);\r
      const prevX = state.x;\r
      const prevY = state.y;\r
      state.x += (pointer.x - state.x) * follow;\r
      state.y += (pointer.y - state.y) * follow;\r
      const velX = (state.x - prevX) / Math.max(dt, 0.001) / view.height;\r
      const velY = (state.y - prevY) / Math.max(dt, 0.001) / view.height;\r
      const dragBlend = 1 - Math.exp(-dt * 4);\r
      state.dragX += (clamp(velX * 0.03, -0.06, 0.06) - state.dragX) * dragBlend;\r
      state.dragY += (clamp(-velY * 0.03, -0.06, 0.06) - state.dragY) * dragBlend;\r
      state.touch += ((engaged ? 1 : 0) - state.touch) * (1 - Math.exp(-dt * (engaged ? 3.5 : 1.4)));\r
\r
      let lightGoalX = DEFAULT_LIGHT[0];\r
      let lightGoalY = DEFAULT_LIGHT[1];\r
      if (engaged) {\r
        const aimX = (pointer.x / view.width - 0.5) * (view.width / view.height);\r
        const aimY = 0.5 - pointer.y / view.height;\r
        const reach = Math.hypot(aimX, aimY);\r
        if (reach > 0.04) {\r
          lightGoalX = (aimX / reach) * LIGHT_TILT;\r
          lightGoalY = (aimY / reach) * LIGHT_TILT;\r
        } else {\r
          lightGoalX = state.lightX;\r
          lightGoalY = state.lightY;\r
        }\r
      }\r
      const lightFollow = 1 - Math.exp(-dt * 3);\r
      state.lightX += (lightGoalX - state.lightX) * lightFollow;\r
      state.lightY += (lightGoalY - state.lightY) * lightFollow;\r
\r
      for (let i = waves.length - 1; i >= 0; i--) {\r
        waves[i].age += dt;\r
        if (waves[i].age > WAVE_LIFE * 2.5) waves.splice(i, 1);\r
      }\r
\r
      render();\r
\r
      const settling =\r
        state.intro < 1 ||\r
        waves.length > 0 ||\r
        Math.abs((engaged ? 1 : 0) - state.touch) > 0.002 ||\r
        Math.abs(state.dragX) + Math.abs(state.dragY) > 0.0002 ||\r
        Math.abs(pointer.x - state.x) + Math.abs(pointer.y - state.y) > 0.3 ||\r
        Math.abs(lightGoalX - state.lightX) + Math.abs(lightGoalY - state.lightY) > 0.001;\r
      if (flowing || settling) raf = requestAnimationFrame(frame);\r
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
      view.ratio = ratio;\r
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      if (!raf) render();\r
      wake();\r
    };\r
\r
    const locate = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };\r
    };\r
\r
    const onPointerMove = event => {\r
      const point = locate(event);\r
      pointer.x = point.x;\r
      pointer.y = point.y;\r
      pointer.inside = point.inside;\r
      wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      if (!s.clickRipple || reduce) return;\r
      const point = locate(event);\r
      if (!point.inside) return;\r
      waves.push({ x: point.x / view.width, y: 1 - point.y / view.height, age: 0 });\r
      if (waves.length > 4) waves.shift();\r
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
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
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
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteTexture(texture);\r
      gl.deleteFramebuffer(framebuffer);\r
      gl.deleteProgram(fieldProgram.program);\r
      gl.deleteProgram(compositeProgram.program);\r
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
    <div ref={containerRef} className={\`silk-container\${className ? \` \${className}\` : ''}\`} style={style}>\r
      <canvas ref={canvasRef} className="silk-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Silk;\r
`,n=`.silk-container {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.silk-canvas {\r
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
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const SILK = \`\r
uniform vec2 uView;\r
uniform float uScale;\r
uniform float uRotation;\r
uniform float uTime;\r
uniform float uWave;\r
uniform float uRipple;\r
uniform float uFold;\r
uniform vec2 uShift;\r
uniform vec4 uPointer;\r
uniform vec2 uDrag;\r
uniform vec4 uWaves[4];\r
\r
const float e = 2.71828182845904523536;\r
\r
float noise(vec2 texCoord) {\r
  float G = e;\r
  vec2 r = (G * sin(G * texCoord));\r
  return fract(r.x * r.y * (1.0 + texCoord.x));\r
}\r
\r
vec2 rotateUvs(vec2 uv, float angle) {\r
  float c = cos(angle);\r
  float s = sin(angle);\r
  mat2 rot = mat2(c, -s, s, c);\r
  return rot * uv;\r
}\r
\r
vec2 bend(vec2 uv) {\r
  vec2 aspect = vec2(uView.x / uView.y, 1.0);\r
  vec2 offset = (uv - uPointer.xy) * aspect;\r
  float touch = uPointer.z * exp(-dot(offset, offset) / (uPointer.w * uPointer.w));\r
  uv -= uDrag * touch;\r
  for (int i = 0; i < 4; i++) {\r
    vec4 wave = uWaves[i];\r
    if (wave.w <= 0.0) continue;\r
    vec2 q = (uv - wave.xy) * aspect;\r
    float dist = length(q);\r
    float front = dist - wave.z;\r
    float ring = exp(-front * front * 60.0) * wave.w;\r
    uv += q / max(dist, 0.0001) / aspect * ring * 0.034 * sin(front * 34.0);\r
  }\r
  return uv;\r
}\r
\r
float silk(vec2 vUv) {\r
  vec2 uv = rotateUvs(vUv * uScale, uRotation);\r
  vec2 tex = uv * uScale + uShift;\r
  float tOffset = uTime;\r
  tex.y += 0.03 * uWave * sin(8.0 * tex.x - tOffset);\r
  return 0.6 + 0.4 * uFold * sin(5.0 * (tex.x + tex.y + cos(3.0 * tex.x + 5.0 * tex.y) + 0.02 * tOffset) + uRipple * sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));\r
}\r
\`;\r
\r
const FIELD = \`#version 300 es\r
precision highp float;\r
\${SILK}\r
out vec4 outColor;\r
\r
void main() {\r
  vec2 vUv = gl_FragCoord.xy / uView;\r
  float pattern = silk(bend(vUv));\r
  float n = clamp((pattern - 0.2) / 0.8, 0.0, 1.0);\r
  outColor = vec4(pow(n, 6.0), 0.0, 0.0, 1.0);\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
\${SILK}\r
uniform sampler2D uBloom;\r
uniform vec3 uColor;\r
uniform vec3 uSheenColor;\r
uniform float uNoiseIntensity;\r
uniform float uDepth;\r
uniform float uSheen;\r
uniform float uGlow;\r
uniform float uLightMode;\r
uniform vec3 uLight;\r
uniform vec2 uStep;\r
uniform float uPresence;\r
uniform float uFade;\r
out vec4 outColor;\r
\r
float smootherstep01(float t) {\r
  t = clamp(t, 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
vec3 softClip(vec3 c) {\r
  vec3 over = max(c - 0.75, 0.0);\r
  return min(c, 0.75) + 0.25 * (1.0 - exp(-over * 4.0));\r
}\r
\r
void main() {\r
  vec2 vUv = gl_FragCoord.xy / uView;\r
  vec2 coord = bend(vUv);\r
  float pattern = silk(coord);\r
  float rnd = noise(gl_FragCoord.xy);\r
  float n = clamp((pattern - 0.2) / 0.8, 0.0, 1.0);\r
\r
  float gx = silk(coord + vec2(uStep.x, 0.0)) - pattern;\r
  float gy = silk(coord + vec2(0.0, uStep.y)) - pattern;\r
  vec3 normal = normalize(vec3(-gx * 26.0, -gy * 26.0, 1.0));\r
  vec3 toLight = normalize(vec3(uLight.xy, 0.85));\r
  float relief = 1.0 + (dot(normal, toLight) - toLight.z) * 1.8 * uDepth;\r
  vec3 halfway = normalize(toLight + vec3(0.0, 0.0, 1.0));\r
  float gloss = pow(max(dot(normal, halfway), 0.0), 48.0) * smoothstep(0.25, 0.85, n);\r
  float crest = pow(n, 5.0);\r
  float shine = (gloss * 0.85 + crest * 0.4) * uSheen * (1.0 + uLight.z * 0.6);\r
\r
  float bloom = 0.0;\r
  if (uGlow > 0.0) {\r
    bloom += textureLod(uBloom, vUv, 1.0).r * 0.35;\r
    bloom += textureLod(uBloom, vUv, 2.0).r * 0.3;\r
    bloom += textureLod(uBloom, vUv, 3.0).r * 0.2;\r
    bloom += textureLod(uBloom, vUv, 4.0).r * 0.15;\r
  }\r
\r
  vec3 result;\r
  if (uLightMode > 0.5) {\r
    float fold = smoothstep(0.28, 0.9, pattern);\r
    float specular = smoothstep(0.72, 0.98, pattern);\r
    vec3 shadowColor = uColor * (0.72 - 0.12 * uDepth);\r
    vec3 bodyColor = min(uColor * 1.18, vec3(1.0));\r
    vec3 lightBase = mix(shadowColor, bodyColor, fold) * mix(1.0, relief, 0.6);\r
    lightBase = mix(lightBase, vec3(1.0), clamp(specular * 0.92 + shine * 0.22 + bloom * uGlow * 0.2, 0.0, 1.0));\r
    float fineNoise = noise(gl_FragCoord.xy * 0.63 + vec2(17.0, 41.0));\r
    float grainSignal = (rnd + fineNoise - 1.0);\r
    float grainStrength = clamp(uNoiseIntensity * 0.038, 0.0, 0.16);\r
    result = clamp(lightBase + grainSignal * grainStrength, 0.0, 1.0);\r
  } else {\r
    float grain = rnd / 15.0 * uNoiseIntensity;\r
    float floorValue = mix(0.2, 0.03, uDepth);\r
    float curve = uDepth > 0.0 ? pow(n, 1.0 + 1.4 * uDepth) : n;\r
    float shade = uDepth > 0.0 ? floorValue + (1.0 - floorValue) * curve : pattern;\r
    vec3 tone = mix(uColor, pow(uColor, vec3(1.45)), (1.0 - n) * uDepth);\r
    vec3 lit = tone * shade * relief - vec3(grain);\r
    vec3 tint = mix(uColor, uSheenColor, 0.8);\r
    vec3 extra = tint * (shine + bloom * uGlow * 0.55);\r
    float blend = clamp((uSheen + uGlow) * 4.0, 0.0, 1.0);\r
    result = mix(clamp(lit, 0.0, 1.0), clamp(softClip(lit + extra), 0.0, 1.0), blend);\r
  }\r
\r
  float edge = uFade * 0.5;\r
  float mask = 1.0;\r
  if (edge > 0.0) {\r
    mask = smootherstep01(vUv.x / edge) * smootherstep01((1.0 - vUv.x) / edge);\r
    mask *= smootherstep01(vUv.y / edge) * smootherstep01((1.0 - vUv.y) / edge);\r
  }\r
  float alpha = uPresence * mask;\r
  outColor = vec4(result * alpha, alpha);\r
}\`;\r
\r
const INTRO_SECONDS = 2.2;\r
const INTRO_RUSH = 1.6;\r
const WAVE_LIFE = 1.6;\r
const DEFAULT_LIGHT = [-0.55, 0.7];\r
const LIGHT_TILT = Math.hypot(DEFAULT_LIGHT[0], DEFAULT_LIGHT[1]);\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const ease = t => t * t * t * (t * (t * 6 - 15) + 10);\r
\r
const variationShift = variation => {\r
  const n = Number(variation) || 0;\r
  if (!n) return [0, 0];\r
  const wave = k => {\r
    const v = Math.sin(n * 12.9898 + k * 78.233) * 43758.5453;\r
    return v - Math.floor(v) - 0.5;\r
  };\r
  return [wave(1) * 6, wave(2) * 6];\r
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
    if (info) uniforms[info.name.replace(/\\[0\\]$/, '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const Silk = ({\r
  speed = 5,\r
  scale = 1,\r
  color = '#7B7481',\r
  sheenColor = '#ffffff',\r
  noiseIntensity = 1.5,\r
  rotation = 0,\r
  sheen = 0.5,\r
  depth = 0.5,\r
  glow = 0.3,\r
  ripple = 1,\r
  wave = 1,\r
  variation = 0,\r
  mouseInteraction = true,\r
  interactionStrength = 1,\r
  clickRipple = true,\r
  intro = true,\r
  fade = 0,\r
  lightMode = false,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settingsRef = useRef(null);\r
  settingsRef.current = {\r
    speed,\r
    scale,\r
    color: String(color),\r
    sheenColor: String(sheenColor),\r
    noiseIntensity: Math.max(0, noiseIntensity),\r
    rotation,\r
    sheen: Math.max(0, sheen),\r
    depth: clamp(depth, 0, 1),\r
    glow: Math.max(0, glow),\r
    ripple: Math.max(0, ripple),\r
    wave: Math.max(0, wave),\r
    variation,\r
    mouseInteraction,\r
    interactionStrength: Math.max(0, interactionStrength),\r
    clickRipple,\r
    intro,\r
    fade: clamp(fade, 0, 1),\r
    lightMode,\r
    paused,\r
    dpr\r
  };\r
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
    const fieldProgram = link(gl, FIELD);\r
    const compositeProgram = link(gl, COMPOSITE);\r
    if (!fieldProgram || !compositeProgram) return undefined;\r
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
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
    };\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const colorCache = new Map();\r
    const toRgb = value => {\r
      if (colorCache.has(value)) return colorCache.get(value);\r
      let rgb = [1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#ffffff';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      colorCache.set(value, rgb);\r
      return rgb;\r
    };\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1, ratio: 1 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const waves = [];\r
    const waveData = new Float32Array(16);\r
    const state = {\r
      flow: 0,\r
      intro: settingsRef.current.intro && !reduce ? 0 : 1,\r
      touch: 0,\r
      x: 0,\r
      y: 0,\r
      dragX: 0,\r
      dragY: 0,\r
      lightX: DEFAULT_LIGHT[0],\r
      lightY: DEFAULT_LIGHT[1]\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const setShared = (uniforms, width, height, s, unfold) => {\r
      const [shiftX, shiftY] = variationShift(s.variation);\r
      gl.uniform2f(uniforms.uView, width, height);\r
      gl.uniform1f(uniforms.uScale, s.scale);\r
      gl.uniform1f(uniforms.uRotation, s.rotation);\r
      gl.uniform1f(uniforms.uTime, state.flow - INTRO_RUSH * (1 - unfold));\r
      gl.uniform1f(uniforms.uWave, s.wave);\r
      gl.uniform1f(uniforms.uRipple, s.ripple);\r
      gl.uniform1f(uniforms.uFold, 0.25 + 0.75 * unfold);\r
      gl.uniform2f(uniforms.uShift, shiftX, shiftY);\r
      gl.uniform4f(\r
        uniforms.uPointer,\r
        state.x / view.width,\r
        1 - state.y / view.height,\r
        state.touch * s.interactionStrength,\r
        0.32\r
      );\r
      gl.uniform2f(uniforms.uDrag, state.dragX, state.dragY);\r
      gl.uniform4fv(uniforms.uWaves, waveData);\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const unfold = ease(state.intro);\r
      const presence = 1 - Math.pow(1 - state.intro, 3);\r
      gl.bindVertexArray(vao);\r
\r
      waveData.fill(0);\r
      waves.slice(-4).forEach((item, index) => {\r
        waveData.set([item.x, item.y, item.age * 0.6, Math.exp(-item.age / (WAVE_LIFE * 0.45))], index * 4);\r
      });\r
\r
      if (s.glow > 0) {\r
        sizeTarget(Math.max(1, Math.round(canvas.width / 4)), Math.max(1, Math.round(canvas.height / 4)));\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
        gl.viewport(0, 0, target.width, target.height);\r
        gl.useProgram(fieldProgram.program);\r
        setShared(fieldProgram.uniforms, target.width, target.height, s, unfold);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
        gl.bindTexture(gl.TEXTURE_2D, texture);\r
        gl.generateMipmap(gl.TEXTURE_2D);\r
      }\r
\r
      const c = compositeProgram.uniforms;\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(compositeProgram.program);\r
      setShared(c, canvas.width, canvas.height, s, unfold);\r
      gl.uniform3fv(c.uColor, toRgb(s.color));\r
      gl.uniform3fv(c.uSheenColor, toRgb(s.sheenColor));\r
      gl.uniform1f(c.uNoiseIntensity, s.noiseIntensity);\r
      gl.uniform1f(c.uDepth, s.depth);\r
      gl.uniform1f(c.uSheen, s.sheen);\r
      gl.uniform1f(c.uGlow, s.glow);\r
      gl.uniform1f(c.uLightMode, s.lightMode ? 1 : 0);\r
      gl.uniform3f(c.uLight, state.lightX, state.lightY, state.touch * s.interactionStrength);\r
      gl.uniform2f(c.uStep, view.ratio / canvas.width, view.ratio / canvas.height);\r
      gl.uniform1f(c.uPresence, presence);\r
      gl.uniform1f(c.uFade, s.fade);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.uniform1i(c.uBloom, 0);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const flowing = !s.paused && !reduce && s.speed !== 0;\r
      if (flowing) state.flow += dt * 0.1 * s.speed;\r
      if (!s.intro || reduce) state.intro = 1;\r
      else if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / INTRO_SECONDS);\r
\r
      const engaged = s.mouseInteraction && pointer.inside && !reduce;\r
      if (engaged && state.touch < 0.01) {\r
        state.x = pointer.x;\r
        state.y = pointer.y;\r
      }\r
      const follow = 1 - Math.exp(-dt * 10);\r
      const prevX = state.x;\r
      const prevY = state.y;\r
      state.x += (pointer.x - state.x) * follow;\r
      state.y += (pointer.y - state.y) * follow;\r
      const velX = (state.x - prevX) / Math.max(dt, 0.001) / view.height;\r
      const velY = (state.y - prevY) / Math.max(dt, 0.001) / view.height;\r
      const dragBlend = 1 - Math.exp(-dt * 4);\r
      state.dragX += (clamp(velX * 0.03, -0.06, 0.06) - state.dragX) * dragBlend;\r
      state.dragY += (clamp(-velY * 0.03, -0.06, 0.06) - state.dragY) * dragBlend;\r
      state.touch += ((engaged ? 1 : 0) - state.touch) * (1 - Math.exp(-dt * (engaged ? 3.5 : 1.4)));\r
\r
      let lightGoalX = DEFAULT_LIGHT[0];\r
      let lightGoalY = DEFAULT_LIGHT[1];\r
      if (engaged) {\r
        const aimX = (pointer.x / view.width - 0.5) * (view.width / view.height);\r
        const aimY = 0.5 - pointer.y / view.height;\r
        const reach = Math.hypot(aimX, aimY);\r
        if (reach > 0.04) {\r
          lightGoalX = (aimX / reach) * LIGHT_TILT;\r
          lightGoalY = (aimY / reach) * LIGHT_TILT;\r
        } else {\r
          lightGoalX = state.lightX;\r
          lightGoalY = state.lightY;\r
        }\r
      }\r
      const lightFollow = 1 - Math.exp(-dt * 3);\r
      state.lightX += (lightGoalX - state.lightX) * lightFollow;\r
      state.lightY += (lightGoalY - state.lightY) * lightFollow;\r
\r
      for (let i = waves.length - 1; i >= 0; i--) {\r
        waves[i].age += dt;\r
        if (waves[i].age > WAVE_LIFE * 2.5) waves.splice(i, 1);\r
      }\r
\r
      render();\r
\r
      const settling =\r
        state.intro < 1 ||\r
        waves.length > 0 ||\r
        Math.abs((engaged ? 1 : 0) - state.touch) > 0.002 ||\r
        Math.abs(state.dragX) + Math.abs(state.dragY) > 0.0002 ||\r
        Math.abs(pointer.x - state.x) + Math.abs(pointer.y - state.y) > 0.3 ||\r
        Math.abs(lightGoalX - state.lightX) + Math.abs(lightGoalY - state.lightY) > 0.001;\r
      if (flowing || settling) raf = requestAnimationFrame(frame);\r
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
      view.ratio = ratio;\r
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      if (!raf) render();\r
      wake();\r
    };\r
\r
    const locate = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };\r
    };\r
\r
    const onPointerMove = event => {\r
      const point = locate(event);\r
      pointer.x = point.x;\r
      pointer.y = point.y;\r
      pointer.inside = point.inside;\r
      wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      if (!s.clickRipple || reduce) return;\r
      const point = locate(event);\r
      if (!point.inside) return;\r
      waves.push({ x: point.x / view.width, y: 1 - point.y / view.height, age: 0 });\r
      if (waves.length > 4) waves.shift();\r
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
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
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
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteTexture(texture);\r
      gl.deleteFramebuffer(framebuffer);\r
      gl.deleteProgram(fieldProgram.program);\r
      gl.deleteProgram(compositeProgram.program);\r
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
    <div ref={containerRef} className={\`relative w-full h-full overflow-hidden \${className}\`} style={style}>\r
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Silk;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties } from 'react';\r
\r
import './Silk.css';\r
\r
export interface SilkProps {\r
  speed?: number;\r
  scale?: number;\r
  color?: string;\r
  sheenColor?: string;\r
  noiseIntensity?: number;\r
  rotation?: number;\r
  sheen?: number;\r
  depth?: number;\r
  glow?: number;\r
  ripple?: number;\r
  wave?: number;\r
  variation?: number;\r
  mouseInteraction?: boolean;\r
  interactionStrength?: number;\r
  clickRipple?: boolean;\r
  intro?: boolean;\r
  fade?: number;\r
  lightMode?: boolean;\r
  paused?: boolean;\r
  dpr?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Settings {\r
  speed: number;\r
  scale: number;\r
  color: string;\r
  sheenColor: string;\r
  noiseIntensity: number;\r
  rotation: number;\r
  sheen: number;\r
  depth: number;\r
  glow: number;\r
  ripple: number;\r
  wave: number;\r
  variation: number;\r
  mouseInteraction: boolean;\r
  interactionStrength: number;\r
  clickRipple: boolean;\r
  intro: boolean;\r
  fade: number;\r
  lightMode: boolean;\r
  paused: boolean;\r
  dpr?: number;\r
}\r
\r
type Uniforms = Record<string, WebGLUniformLocation | null>;\r
\r
interface Program {\r
  program: WebGLProgram;\r
  uniforms: Uniforms;\r
}\r
\r
interface Wave {\r
  x: number;\r
  y: number;\r
  age: number;\r
}\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const SILK = \`\r
uniform vec2 uView;\r
uniform float uScale;\r
uniform float uRotation;\r
uniform float uTime;\r
uniform float uWave;\r
uniform float uRipple;\r
uniform float uFold;\r
uniform vec2 uShift;\r
uniform vec4 uPointer;\r
uniform vec2 uDrag;\r
uniform vec4 uWaves[4];\r
\r
const float e = 2.71828182845904523536;\r
\r
float noise(vec2 texCoord) {\r
  float G = e;\r
  vec2 r = (G * sin(G * texCoord));\r
  return fract(r.x * r.y * (1.0 + texCoord.x));\r
}\r
\r
vec2 rotateUvs(vec2 uv, float angle) {\r
  float c = cos(angle);\r
  float s = sin(angle);\r
  mat2 rot = mat2(c, -s, s, c);\r
  return rot * uv;\r
}\r
\r
vec2 bend(vec2 uv) {\r
  vec2 aspect = vec2(uView.x / uView.y, 1.0);\r
  vec2 offset = (uv - uPointer.xy) * aspect;\r
  float touch = uPointer.z * exp(-dot(offset, offset) / (uPointer.w * uPointer.w));\r
  uv -= uDrag * touch;\r
  for (int i = 0; i < 4; i++) {\r
    vec4 wave = uWaves[i];\r
    if (wave.w <= 0.0) continue;\r
    vec2 q = (uv - wave.xy) * aspect;\r
    float dist = length(q);\r
    float front = dist - wave.z;\r
    float ring = exp(-front * front * 60.0) * wave.w;\r
    uv += q / max(dist, 0.0001) / aspect * ring * 0.034 * sin(front * 34.0);\r
  }\r
  return uv;\r
}\r
\r
float silk(vec2 vUv) {\r
  vec2 uv = rotateUvs(vUv * uScale, uRotation);\r
  vec2 tex = uv * uScale + uShift;\r
  float tOffset = uTime;\r
  tex.y += 0.03 * uWave * sin(8.0 * tex.x - tOffset);\r
  return 0.6 + 0.4 * uFold * sin(5.0 * (tex.x + tex.y + cos(3.0 * tex.x + 5.0 * tex.y) + 0.02 * tOffset) + uRipple * sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));\r
}\r
\`;\r
\r
const FIELD = \`#version 300 es\r
precision highp float;\r
\${SILK}\r
out vec4 outColor;\r
\r
void main() {\r
  vec2 vUv = gl_FragCoord.xy / uView;\r
  float pattern = silk(bend(vUv));\r
  float n = clamp((pattern - 0.2) / 0.8, 0.0, 1.0);\r
  outColor = vec4(pow(n, 6.0), 0.0, 0.0, 1.0);\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
\${SILK}\r
uniform sampler2D uBloom;\r
uniform vec3 uColor;\r
uniform vec3 uSheenColor;\r
uniform float uNoiseIntensity;\r
uniform float uDepth;\r
uniform float uSheen;\r
uniform float uGlow;\r
uniform float uLightMode;\r
uniform vec3 uLight;\r
uniform vec2 uStep;\r
uniform float uPresence;\r
uniform float uFade;\r
out vec4 outColor;\r
\r
float smootherstep01(float t) {\r
  t = clamp(t, 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
vec3 softClip(vec3 c) {\r
  vec3 over = max(c - 0.75, 0.0);\r
  return min(c, 0.75) + 0.25 * (1.0 - exp(-over * 4.0));\r
}\r
\r
void main() {\r
  vec2 vUv = gl_FragCoord.xy / uView;\r
  vec2 coord = bend(vUv);\r
  float pattern = silk(coord);\r
  float rnd = noise(gl_FragCoord.xy);\r
  float n = clamp((pattern - 0.2) / 0.8, 0.0, 1.0);\r
\r
  float gx = silk(coord + vec2(uStep.x, 0.0)) - pattern;\r
  float gy = silk(coord + vec2(0.0, uStep.y)) - pattern;\r
  vec3 normal = normalize(vec3(-gx * 26.0, -gy * 26.0, 1.0));\r
  vec3 toLight = normalize(vec3(uLight.xy, 0.85));\r
  float relief = 1.0 + (dot(normal, toLight) - toLight.z) * 1.8 * uDepth;\r
  vec3 halfway = normalize(toLight + vec3(0.0, 0.0, 1.0));\r
  float gloss = pow(max(dot(normal, halfway), 0.0), 48.0) * smoothstep(0.25, 0.85, n);\r
  float crest = pow(n, 5.0);\r
  float shine = (gloss * 0.85 + crest * 0.4) * uSheen * (1.0 + uLight.z * 0.6);\r
\r
  float bloom = 0.0;\r
  if (uGlow > 0.0) {\r
    bloom += textureLod(uBloom, vUv, 1.0).r * 0.35;\r
    bloom += textureLod(uBloom, vUv, 2.0).r * 0.3;\r
    bloom += textureLod(uBloom, vUv, 3.0).r * 0.2;\r
    bloom += textureLod(uBloom, vUv, 4.0).r * 0.15;\r
  }\r
\r
  vec3 result;\r
  if (uLightMode > 0.5) {\r
    float fold = smoothstep(0.28, 0.9, pattern);\r
    float specular = smoothstep(0.72, 0.98, pattern);\r
    vec3 shadowColor = uColor * (0.72 - 0.12 * uDepth);\r
    vec3 bodyColor = min(uColor * 1.18, vec3(1.0));\r
    vec3 lightBase = mix(shadowColor, bodyColor, fold) * mix(1.0, relief, 0.6);\r
    lightBase = mix(lightBase, vec3(1.0), clamp(specular * 0.92 + shine * 0.22 + bloom * uGlow * 0.2, 0.0, 1.0));\r
    float fineNoise = noise(gl_FragCoord.xy * 0.63 + vec2(17.0, 41.0));\r
    float grainSignal = (rnd + fineNoise - 1.0);\r
    float grainStrength = clamp(uNoiseIntensity * 0.038, 0.0, 0.16);\r
    result = clamp(lightBase + grainSignal * grainStrength, 0.0, 1.0);\r
  } else {\r
    float grain = rnd / 15.0 * uNoiseIntensity;\r
    float floorValue = mix(0.2, 0.03, uDepth);\r
    float curve = uDepth > 0.0 ? pow(n, 1.0 + 1.4 * uDepth) : n;\r
    float shade = uDepth > 0.0 ? floorValue + (1.0 - floorValue) * curve : pattern;\r
    vec3 tone = mix(uColor, pow(uColor, vec3(1.45)), (1.0 - n) * uDepth);\r
    vec3 lit = tone * shade * relief - vec3(grain);\r
    vec3 tint = mix(uColor, uSheenColor, 0.8);\r
    vec3 extra = tint * (shine + bloom * uGlow * 0.55);\r
    float blend = clamp((uSheen + uGlow) * 4.0, 0.0, 1.0);\r
    result = mix(clamp(lit, 0.0, 1.0), clamp(softClip(lit + extra), 0.0, 1.0), blend);\r
  }\r
\r
  float edge = uFade * 0.5;\r
  float mask = 1.0;\r
  if (edge > 0.0) {\r
    mask = smootherstep01(vUv.x / edge) * smootherstep01((1.0 - vUv.x) / edge);\r
    mask *= smootherstep01(vUv.y / edge) * smootherstep01((1.0 - vUv.y) / edge);\r
  }\r
  float alpha = uPresence * mask;\r
  outColor = vec4(result * alpha, alpha);\r
}\`;\r
\r
const INTRO_SECONDS = 2.2;\r
const INTRO_RUSH = 1.6;\r
const WAVE_LIFE = 1.6;\r
const DEFAULT_LIGHT = [-0.55, 0.7];\r
const LIGHT_TILT = Math.hypot(DEFAULT_LIGHT[0], DEFAULT_LIGHT[1]);\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const ease = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);\r
\r
const variationShift = (variation: number): number[] => {\r
  const n = Number(variation) || 0;\r
  if (!n) return [0, 0];\r
  const wave = (k: number) => {\r
    const v = Math.sin(n * 12.9898 + k * 78.233) * 43758.5453;\r
    return v - Math.floor(v) - 0.5;\r
  };\r
  return [wave(1) * 6, wave(2) * 6];\r
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
  const uniforms: Uniforms = {};\r
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
  for (let i = 0; i < count; i++) {\r
    const info = gl.getActiveUniform(program, i);\r
    if (info) uniforms[info.name.replace(/\\[0\\]$/, '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const Silk = ({\r
  speed = 5,\r
  scale = 1,\r
  color = '#7B7481',\r
  sheenColor = '#ffffff',\r
  noiseIntensity = 1.5,\r
  rotation = 0,\r
  sheen = 0.5,\r
  depth = 0.5,\r
  glow = 0.3,\r
  ripple = 1,\r
  wave = 1,\r
  variation = 0,\r
  mouseInteraction = true,\r
  interactionStrength = 1,\r
  clickRipple = true,\r
  intro = true,\r
  fade = 0,\r
  lightMode = false,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  style\r
}: SilkProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settingsRef = useRef<Settings>(null as unknown as Settings);\r
  settingsRef.current = {\r
    speed,\r
    scale,\r
    color: String(color),\r
    sheenColor: String(sheenColor),\r
    noiseIntensity: Math.max(0, noiseIntensity),\r
    rotation,\r
    sheen: Math.max(0, sheen),\r
    depth: clamp(depth, 0, 1),\r
    glow: Math.max(0, glow),\r
    ripple: Math.max(0, ripple),\r
    wave: Math.max(0, wave),\r
    variation,\r
    mouseInteraction,\r
    interactionStrength: Math.max(0, interactionStrength),\r
    clickRipple,\r
    intro,\r
    fade: clamp(fade, 0, 1),\r
    lightMode,\r
    paused,\r
    dpr\r
  };\r
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
    const fieldProgram = link(gl, FIELD);\r
    const compositeProgram = link(gl, COMPOSITE);\r
    if (!fieldProgram || !compositeProgram) return undefined;\r
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
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
    };\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const colorCache = new Map<string, number[]>();\r
    const toRgb = (value: string): number[] => {\r
      if (colorCache.has(value)) return colorCache.get(value) as number[];\r
      let rgb = [1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#ffffff';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      colorCache.set(value, rgb);\r
      return rgb;\r
    };\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1, ratio: 1 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const waves: Wave[] = [];\r
    const waveData = new Float32Array(16);\r
    const state = {\r
      flow: 0,\r
      intro: settingsRef.current.intro && !reduce ? 0 : 1,\r
      touch: 0,\r
      x: 0,\r
      y: 0,\r
      dragX: 0,\r
      dragY: 0,\r
      lightX: DEFAULT_LIGHT[0],\r
      lightY: DEFAULT_LIGHT[1]\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const setShared = (uniforms: Uniforms, width: number, height: number, s: Settings, unfold: number) => {\r
      const [shiftX, shiftY] = variationShift(s.variation);\r
      gl.uniform2f(uniforms.uView, width, height);\r
      gl.uniform1f(uniforms.uScale, s.scale);\r
      gl.uniform1f(uniforms.uRotation, s.rotation);\r
      gl.uniform1f(uniforms.uTime, state.flow - INTRO_RUSH * (1 - unfold));\r
      gl.uniform1f(uniforms.uWave, s.wave);\r
      gl.uniform1f(uniforms.uRipple, s.ripple);\r
      gl.uniform1f(uniforms.uFold, 0.25 + 0.75 * unfold);\r
      gl.uniform2f(uniforms.uShift, shiftX, shiftY);\r
      gl.uniform4f(\r
        uniforms.uPointer,\r
        state.x / view.width,\r
        1 - state.y / view.height,\r
        state.touch * s.interactionStrength,\r
        0.32\r
      );\r
      gl.uniform2f(uniforms.uDrag, state.dragX, state.dragY);\r
      gl.uniform4fv(uniforms.uWaves, waveData);\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const unfold = ease(state.intro);\r
      const presence = 1 - Math.pow(1 - state.intro, 3);\r
      gl.bindVertexArray(vao);\r
\r
      waveData.fill(0);\r
      waves.slice(-4).forEach((item, index) => {\r
        waveData.set([item.x, item.y, item.age * 0.6, Math.exp(-item.age / (WAVE_LIFE * 0.45))], index * 4);\r
      });\r
\r
      if (s.glow > 0) {\r
        sizeTarget(Math.max(1, Math.round(canvas.width / 4)), Math.max(1, Math.round(canvas.height / 4)));\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
        gl.viewport(0, 0, target.width, target.height);\r
        gl.useProgram(fieldProgram.program);\r
        setShared(fieldProgram.uniforms, target.width, target.height, s, unfold);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
        gl.bindTexture(gl.TEXTURE_2D, texture);\r
        gl.generateMipmap(gl.TEXTURE_2D);\r
      }\r
\r
      const c = compositeProgram.uniforms;\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(compositeProgram.program);\r
      setShared(c, canvas.width, canvas.height, s, unfold);\r
      gl.uniform3fv(c.uColor, toRgb(s.color));\r
      gl.uniform3fv(c.uSheenColor, toRgb(s.sheenColor));\r
      gl.uniform1f(c.uNoiseIntensity, s.noiseIntensity);\r
      gl.uniform1f(c.uDepth, s.depth);\r
      gl.uniform1f(c.uSheen, s.sheen);\r
      gl.uniform1f(c.uGlow, s.glow);\r
      gl.uniform1f(c.uLightMode, s.lightMode ? 1 : 0);\r
      gl.uniform3f(c.uLight, state.lightX, state.lightY, state.touch * s.interactionStrength);\r
      gl.uniform2f(c.uStep, view.ratio / canvas.width, view.ratio / canvas.height);\r
      gl.uniform1f(c.uPresence, presence);\r
      gl.uniform1f(c.uFade, s.fade);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.uniform1i(c.uBloom, 0);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const flowing = !s.paused && !reduce && s.speed !== 0;\r
      if (flowing) state.flow += dt * 0.1 * s.speed;\r
      if (!s.intro || reduce) state.intro = 1;\r
      else if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / INTRO_SECONDS);\r
\r
      const engaged = s.mouseInteraction && pointer.inside && !reduce;\r
      if (engaged && state.touch < 0.01) {\r
        state.x = pointer.x;\r
        state.y = pointer.y;\r
      }\r
      const follow = 1 - Math.exp(-dt * 10);\r
      const prevX = state.x;\r
      const prevY = state.y;\r
      state.x += (pointer.x - state.x) * follow;\r
      state.y += (pointer.y - state.y) * follow;\r
      const velX = (state.x - prevX) / Math.max(dt, 0.001) / view.height;\r
      const velY = (state.y - prevY) / Math.max(dt, 0.001) / view.height;\r
      const dragBlend = 1 - Math.exp(-dt * 4);\r
      state.dragX += (clamp(velX * 0.03, -0.06, 0.06) - state.dragX) * dragBlend;\r
      state.dragY += (clamp(-velY * 0.03, -0.06, 0.06) - state.dragY) * dragBlend;\r
      state.touch += ((engaged ? 1 : 0) - state.touch) * (1 - Math.exp(-dt * (engaged ? 3.5 : 1.4)));\r
\r
      let lightGoalX = DEFAULT_LIGHT[0];\r
      let lightGoalY = DEFAULT_LIGHT[1];\r
      if (engaged) {\r
        const aimX = (pointer.x / view.width - 0.5) * (view.width / view.height);\r
        const aimY = 0.5 - pointer.y / view.height;\r
        const reach = Math.hypot(aimX, aimY);\r
        if (reach > 0.04) {\r
          lightGoalX = (aimX / reach) * LIGHT_TILT;\r
          lightGoalY = (aimY / reach) * LIGHT_TILT;\r
        } else {\r
          lightGoalX = state.lightX;\r
          lightGoalY = state.lightY;\r
        }\r
      }\r
      const lightFollow = 1 - Math.exp(-dt * 3);\r
      state.lightX += (lightGoalX - state.lightX) * lightFollow;\r
      state.lightY += (lightGoalY - state.lightY) * lightFollow;\r
\r
      for (let i = waves.length - 1; i >= 0; i--) {\r
        waves[i].age += dt;\r
        if (waves[i].age > WAVE_LIFE * 2.5) waves.splice(i, 1);\r
      }\r
\r
      render();\r
\r
      const settling =\r
        state.intro < 1 ||\r
        waves.length > 0 ||\r
        Math.abs((engaged ? 1 : 0) - state.touch) > 0.002 ||\r
        Math.abs(state.dragX) + Math.abs(state.dragY) > 0.0002 ||\r
        Math.abs(pointer.x - state.x) + Math.abs(pointer.y - state.y) > 0.3 ||\r
        Math.abs(lightGoalX - state.lightX) + Math.abs(lightGoalY - state.lightY) > 0.001;\r
      if (flowing || settling) raf = requestAnimationFrame(frame);\r
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
      view.ratio = ratio;\r
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      if (!raf) render();\r
      wake();\r
    };\r
\r
    const locate = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const point = locate(event);\r
      pointer.x = point.x;\r
      pointer.y = point.y;\r
      pointer.inside = point.inside;\r
      wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      if (!s.clickRipple || reduce) return;\r
      const point = locate(event);\r
      if (!point.inside) return;\r
      waves.push({ x: point.x / view.width, y: 1 - point.y / view.height, age: 0 });\r
      if (waves.length > 4) waves.shift();\r
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
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
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
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteTexture(texture);\r
      gl.deleteFramebuffer(framebuffer);\r
      gl.deleteProgram(fieldProgram.program);\r
      gl.deleteProgram(compositeProgram.program);\r
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
    <div ref={containerRef} className={\`silk-container\${className ? \` \${className}\` : ''}\`} style={style}>\r
      <canvas ref={canvasRef} className="silk-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Silk;\r
`,o=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties } from 'react';\r
\r
export interface SilkProps {\r
  speed?: number;\r
  scale?: number;\r
  color?: string;\r
  sheenColor?: string;\r
  noiseIntensity?: number;\r
  rotation?: number;\r
  sheen?: number;\r
  depth?: number;\r
  glow?: number;\r
  ripple?: number;\r
  wave?: number;\r
  variation?: number;\r
  mouseInteraction?: boolean;\r
  interactionStrength?: number;\r
  clickRipple?: boolean;\r
  intro?: boolean;\r
  fade?: number;\r
  lightMode?: boolean;\r
  paused?: boolean;\r
  dpr?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Settings {\r
  speed: number;\r
  scale: number;\r
  color: string;\r
  sheenColor: string;\r
  noiseIntensity: number;\r
  rotation: number;\r
  sheen: number;\r
  depth: number;\r
  glow: number;\r
  ripple: number;\r
  wave: number;\r
  variation: number;\r
  mouseInteraction: boolean;\r
  interactionStrength: number;\r
  clickRipple: boolean;\r
  intro: boolean;\r
  fade: number;\r
  lightMode: boolean;\r
  paused: boolean;\r
  dpr?: number;\r
}\r
\r
type Uniforms = Record<string, WebGLUniformLocation | null>;\r
\r
interface Program {\r
  program: WebGLProgram;\r
  uniforms: Uniforms;\r
}\r
\r
interface Wave {\r
  x: number;\r
  y: number;\r
  age: number;\r
}\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const SILK = \`\r
uniform vec2 uView;\r
uniform float uScale;\r
uniform float uRotation;\r
uniform float uTime;\r
uniform float uWave;\r
uniform float uRipple;\r
uniform float uFold;\r
uniform vec2 uShift;\r
uniform vec4 uPointer;\r
uniform vec2 uDrag;\r
uniform vec4 uWaves[4];\r
\r
const float e = 2.71828182845904523536;\r
\r
float noise(vec2 texCoord) {\r
  float G = e;\r
  vec2 r = (G * sin(G * texCoord));\r
  return fract(r.x * r.y * (1.0 + texCoord.x));\r
}\r
\r
vec2 rotateUvs(vec2 uv, float angle) {\r
  float c = cos(angle);\r
  float s = sin(angle);\r
  mat2 rot = mat2(c, -s, s, c);\r
  return rot * uv;\r
}\r
\r
vec2 bend(vec2 uv) {\r
  vec2 aspect = vec2(uView.x / uView.y, 1.0);\r
  vec2 offset = (uv - uPointer.xy) * aspect;\r
  float touch = uPointer.z * exp(-dot(offset, offset) / (uPointer.w * uPointer.w));\r
  uv -= uDrag * touch;\r
  for (int i = 0; i < 4; i++) {\r
    vec4 wave = uWaves[i];\r
    if (wave.w <= 0.0) continue;\r
    vec2 q = (uv - wave.xy) * aspect;\r
    float dist = length(q);\r
    float front = dist - wave.z;\r
    float ring = exp(-front * front * 60.0) * wave.w;\r
    uv += q / max(dist, 0.0001) / aspect * ring * 0.034 * sin(front * 34.0);\r
  }\r
  return uv;\r
}\r
\r
float silk(vec2 vUv) {\r
  vec2 uv = rotateUvs(vUv * uScale, uRotation);\r
  vec2 tex = uv * uScale + uShift;\r
  float tOffset = uTime;\r
  tex.y += 0.03 * uWave * sin(8.0 * tex.x - tOffset);\r
  return 0.6 + 0.4 * uFold * sin(5.0 * (tex.x + tex.y + cos(3.0 * tex.x + 5.0 * tex.y) + 0.02 * tOffset) + uRipple * sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));\r
}\r
\`;\r
\r
const FIELD = \`#version 300 es\r
precision highp float;\r
\${SILK}\r
out vec4 outColor;\r
\r
void main() {\r
  vec2 vUv = gl_FragCoord.xy / uView;\r
  float pattern = silk(bend(vUv));\r
  float n = clamp((pattern - 0.2) / 0.8, 0.0, 1.0);\r
  outColor = vec4(pow(n, 6.0), 0.0, 0.0, 1.0);\r
}\`;\r
\r
const COMPOSITE = \`#version 300 es\r
precision highp float;\r
\${SILK}\r
uniform sampler2D uBloom;\r
uniform vec3 uColor;\r
uniform vec3 uSheenColor;\r
uniform float uNoiseIntensity;\r
uniform float uDepth;\r
uniform float uSheen;\r
uniform float uGlow;\r
uniform float uLightMode;\r
uniform vec3 uLight;\r
uniform vec2 uStep;\r
uniform float uPresence;\r
uniform float uFade;\r
out vec4 outColor;\r
\r
float smootherstep01(float t) {\r
  t = clamp(t, 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
vec3 softClip(vec3 c) {\r
  vec3 over = max(c - 0.75, 0.0);\r
  return min(c, 0.75) + 0.25 * (1.0 - exp(-over * 4.0));\r
}\r
\r
void main() {\r
  vec2 vUv = gl_FragCoord.xy / uView;\r
  vec2 coord = bend(vUv);\r
  float pattern = silk(coord);\r
  float rnd = noise(gl_FragCoord.xy);\r
  float n = clamp((pattern - 0.2) / 0.8, 0.0, 1.0);\r
\r
  float gx = silk(coord + vec2(uStep.x, 0.0)) - pattern;\r
  float gy = silk(coord + vec2(0.0, uStep.y)) - pattern;\r
  vec3 normal = normalize(vec3(-gx * 26.0, -gy * 26.0, 1.0));\r
  vec3 toLight = normalize(vec3(uLight.xy, 0.85));\r
  float relief = 1.0 + (dot(normal, toLight) - toLight.z) * 1.8 * uDepth;\r
  vec3 halfway = normalize(toLight + vec3(0.0, 0.0, 1.0));\r
  float gloss = pow(max(dot(normal, halfway), 0.0), 48.0) * smoothstep(0.25, 0.85, n);\r
  float crest = pow(n, 5.0);\r
  float shine = (gloss * 0.85 + crest * 0.4) * uSheen * (1.0 + uLight.z * 0.6);\r
\r
  float bloom = 0.0;\r
  if (uGlow > 0.0) {\r
    bloom += textureLod(uBloom, vUv, 1.0).r * 0.35;\r
    bloom += textureLod(uBloom, vUv, 2.0).r * 0.3;\r
    bloom += textureLod(uBloom, vUv, 3.0).r * 0.2;\r
    bloom += textureLod(uBloom, vUv, 4.0).r * 0.15;\r
  }\r
\r
  vec3 result;\r
  if (uLightMode > 0.5) {\r
    float fold = smoothstep(0.28, 0.9, pattern);\r
    float specular = smoothstep(0.72, 0.98, pattern);\r
    vec3 shadowColor = uColor * (0.72 - 0.12 * uDepth);\r
    vec3 bodyColor = min(uColor * 1.18, vec3(1.0));\r
    vec3 lightBase = mix(shadowColor, bodyColor, fold) * mix(1.0, relief, 0.6);\r
    lightBase = mix(lightBase, vec3(1.0), clamp(specular * 0.92 + shine * 0.22 + bloom * uGlow * 0.2, 0.0, 1.0));\r
    float fineNoise = noise(gl_FragCoord.xy * 0.63 + vec2(17.0, 41.0));\r
    float grainSignal = (rnd + fineNoise - 1.0);\r
    float grainStrength = clamp(uNoiseIntensity * 0.038, 0.0, 0.16);\r
    result = clamp(lightBase + grainSignal * grainStrength, 0.0, 1.0);\r
  } else {\r
    float grain = rnd / 15.0 * uNoiseIntensity;\r
    float floorValue = mix(0.2, 0.03, uDepth);\r
    float curve = uDepth > 0.0 ? pow(n, 1.0 + 1.4 * uDepth) : n;\r
    float shade = uDepth > 0.0 ? floorValue + (1.0 - floorValue) * curve : pattern;\r
    vec3 tone = mix(uColor, pow(uColor, vec3(1.45)), (1.0 - n) * uDepth);\r
    vec3 lit = tone * shade * relief - vec3(grain);\r
    vec3 tint = mix(uColor, uSheenColor, 0.8);\r
    vec3 extra = tint * (shine + bloom * uGlow * 0.55);\r
    float blend = clamp((uSheen + uGlow) * 4.0, 0.0, 1.0);\r
    result = mix(clamp(lit, 0.0, 1.0), clamp(softClip(lit + extra), 0.0, 1.0), blend);\r
  }\r
\r
  float edge = uFade * 0.5;\r
  float mask = 1.0;\r
  if (edge > 0.0) {\r
    mask = smootherstep01(vUv.x / edge) * smootherstep01((1.0 - vUv.x) / edge);\r
    mask *= smootherstep01(vUv.y / edge) * smootherstep01((1.0 - vUv.y) / edge);\r
  }\r
  float alpha = uPresence * mask;\r
  outColor = vec4(result * alpha, alpha);\r
}\`;\r
\r
const INTRO_SECONDS = 2.2;\r
const INTRO_RUSH = 1.6;\r
const WAVE_LIFE = 1.6;\r
const DEFAULT_LIGHT = [-0.55, 0.7];\r
const LIGHT_TILT = Math.hypot(DEFAULT_LIGHT[0], DEFAULT_LIGHT[1]);\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const ease = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);\r
\r
const variationShift = (variation: number): number[] => {\r
  const n = Number(variation) || 0;\r
  if (!n) return [0, 0];\r
  const wave = (k: number) => {\r
    const v = Math.sin(n * 12.9898 + k * 78.233) * 43758.5453;\r
    return v - Math.floor(v) - 0.5;\r
  };\r
  return [wave(1) * 6, wave(2) * 6];\r
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
  const uniforms: Uniforms = {};\r
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
  for (let i = 0; i < count; i++) {\r
    const info = gl.getActiveUniform(program, i);\r
    if (info) uniforms[info.name.replace(/\\[0\\]$/, '')] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const Silk = ({\r
  speed = 5,\r
  scale = 1,\r
  color = '#7B7481',\r
  sheenColor = '#ffffff',\r
  noiseIntensity = 1.5,\r
  rotation = 0,\r
  sheen = 0.5,\r
  depth = 0.5,\r
  glow = 0.3,\r
  ripple = 1,\r
  wave = 1,\r
  variation = 0,\r
  mouseInteraction = true,\r
  interactionStrength = 1,\r
  clickRipple = true,\r
  intro = true,\r
  fade = 0,\r
  lightMode = false,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  style\r
}: SilkProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settingsRef = useRef<Settings>(null as unknown as Settings);\r
  settingsRef.current = {\r
    speed,\r
    scale,\r
    color: String(color),\r
    sheenColor: String(sheenColor),\r
    noiseIntensity: Math.max(0, noiseIntensity),\r
    rotation,\r
    sheen: Math.max(0, sheen),\r
    depth: clamp(depth, 0, 1),\r
    glow: Math.max(0, glow),\r
    ripple: Math.max(0, ripple),\r
    wave: Math.max(0, wave),\r
    variation,\r
    mouseInteraction,\r
    interactionStrength: Math.max(0, interactionStrength),\r
    clickRipple,\r
    intro,\r
    fade: clamp(fade, 0, 1),\r
    lightMode,\r
    paused,\r
    dpr\r
  };\r
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
    const fieldProgram = link(gl, FIELD);\r
    const compositeProgram = link(gl, COMPOSITE);\r
    if (!fieldProgram || !compositeProgram) return undefined;\r
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
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\r
    };\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const colorCache = new Map<string, number[]>();\r
    const toRgb = (value: string): number[] => {\r
      if (colorCache.has(value)) return colorCache.get(value) as number[];\r
      let rgb = [1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#ffffff';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      colorCache.set(value, rgb);\r
      return rgb;\r
    };\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1, ratio: 1 };\r
    const pointer = { x: 0, y: 0, inside: false };\r
    const waves: Wave[] = [];\r
    const waveData = new Float32Array(16);\r
    const state = {\r
      flow: 0,\r
      intro: settingsRef.current.intro && !reduce ? 0 : 1,\r
      touch: 0,\r
      x: 0,\r
      y: 0,\r
      dragX: 0,\r
      dragY: 0,\r
      lightX: DEFAULT_LIGHT[0],\r
      lightY: DEFAULT_LIGHT[1]\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const setShared = (uniforms: Uniforms, width: number, height: number, s: Settings, unfold: number) => {\r
      const [shiftX, shiftY] = variationShift(s.variation);\r
      gl.uniform2f(uniforms.uView, width, height);\r
      gl.uniform1f(uniforms.uScale, s.scale);\r
      gl.uniform1f(uniforms.uRotation, s.rotation);\r
      gl.uniform1f(uniforms.uTime, state.flow - INTRO_RUSH * (1 - unfold));\r
      gl.uniform1f(uniforms.uWave, s.wave);\r
      gl.uniform1f(uniforms.uRipple, s.ripple);\r
      gl.uniform1f(uniforms.uFold, 0.25 + 0.75 * unfold);\r
      gl.uniform2f(uniforms.uShift, shiftX, shiftY);\r
      gl.uniform4f(\r
        uniforms.uPointer,\r
        state.x / view.width,\r
        1 - state.y / view.height,\r
        state.touch * s.interactionStrength,\r
        0.32\r
      );\r
      gl.uniform2f(uniforms.uDrag, state.dragX, state.dragY);\r
      gl.uniform4fv(uniforms.uWaves, waveData);\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const unfold = ease(state.intro);\r
      const presence = 1 - Math.pow(1 - state.intro, 3);\r
      gl.bindVertexArray(vao);\r
\r
      waveData.fill(0);\r
      waves.slice(-4).forEach((item, index) => {\r
        waveData.set([item.x, item.y, item.age * 0.6, Math.exp(-item.age / (WAVE_LIFE * 0.45))], index * 4);\r
      });\r
\r
      if (s.glow > 0) {\r
        sizeTarget(Math.max(1, Math.round(canvas.width / 4)), Math.max(1, Math.round(canvas.height / 4)));\r
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
        gl.viewport(0, 0, target.width, target.height);\r
        gl.useProgram(fieldProgram.program);\r
        setShared(fieldProgram.uniforms, target.width, target.height, s, unfold);\r
        gl.drawArrays(gl.TRIANGLES, 0, 3);\r
        gl.bindTexture(gl.TEXTURE_2D, texture);\r
        gl.generateMipmap(gl.TEXTURE_2D);\r
      }\r
\r
      const c = compositeProgram.uniforms;\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.useProgram(compositeProgram.program);\r
      setShared(c, canvas.width, canvas.height, s, unfold);\r
      gl.uniform3fv(c.uColor, toRgb(s.color));\r
      gl.uniform3fv(c.uSheenColor, toRgb(s.sheenColor));\r
      gl.uniform1f(c.uNoiseIntensity, s.noiseIntensity);\r
      gl.uniform1f(c.uDepth, s.depth);\r
      gl.uniform1f(c.uSheen, s.sheen);\r
      gl.uniform1f(c.uGlow, s.glow);\r
      gl.uniform1f(c.uLightMode, s.lightMode ? 1 : 0);\r
      gl.uniform3f(c.uLight, state.lightX, state.lightY, state.touch * s.interactionStrength);\r
      gl.uniform2f(c.uStep, view.ratio / canvas.width, view.ratio / canvas.height);\r
      gl.uniform1f(c.uPresence, presence);\r
      gl.uniform1f(c.uFade, s.fade);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.uniform1i(c.uBloom, 0);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const flowing = !s.paused && !reduce && s.speed !== 0;\r
      if (flowing) state.flow += dt * 0.1 * s.speed;\r
      if (!s.intro || reduce) state.intro = 1;\r
      else if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / INTRO_SECONDS);\r
\r
      const engaged = s.mouseInteraction && pointer.inside && !reduce;\r
      if (engaged && state.touch < 0.01) {\r
        state.x = pointer.x;\r
        state.y = pointer.y;\r
      }\r
      const follow = 1 - Math.exp(-dt * 10);\r
      const prevX = state.x;\r
      const prevY = state.y;\r
      state.x += (pointer.x - state.x) * follow;\r
      state.y += (pointer.y - state.y) * follow;\r
      const velX = (state.x - prevX) / Math.max(dt, 0.001) / view.height;\r
      const velY = (state.y - prevY) / Math.max(dt, 0.001) / view.height;\r
      const dragBlend = 1 - Math.exp(-dt * 4);\r
      state.dragX += (clamp(velX * 0.03, -0.06, 0.06) - state.dragX) * dragBlend;\r
      state.dragY += (clamp(-velY * 0.03, -0.06, 0.06) - state.dragY) * dragBlend;\r
      state.touch += ((engaged ? 1 : 0) - state.touch) * (1 - Math.exp(-dt * (engaged ? 3.5 : 1.4)));\r
\r
      let lightGoalX = DEFAULT_LIGHT[0];\r
      let lightGoalY = DEFAULT_LIGHT[1];\r
      if (engaged) {\r
        const aimX = (pointer.x / view.width - 0.5) * (view.width / view.height);\r
        const aimY = 0.5 - pointer.y / view.height;\r
        const reach = Math.hypot(aimX, aimY);\r
        if (reach > 0.04) {\r
          lightGoalX = (aimX / reach) * LIGHT_TILT;\r
          lightGoalY = (aimY / reach) * LIGHT_TILT;\r
        } else {\r
          lightGoalX = state.lightX;\r
          lightGoalY = state.lightY;\r
        }\r
      }\r
      const lightFollow = 1 - Math.exp(-dt * 3);\r
      state.lightX += (lightGoalX - state.lightX) * lightFollow;\r
      state.lightY += (lightGoalY - state.lightY) * lightFollow;\r
\r
      for (let i = waves.length - 1; i >= 0; i--) {\r
        waves[i].age += dt;\r
        if (waves[i].age > WAVE_LIFE * 2.5) waves.splice(i, 1);\r
      }\r
\r
      render();\r
\r
      const settling =\r
        state.intro < 1 ||\r
        waves.length > 0 ||\r
        Math.abs((engaged ? 1 : 0) - state.touch) > 0.002 ||\r
        Math.abs(state.dragX) + Math.abs(state.dragY) > 0.0002 ||\r
        Math.abs(pointer.x - state.x) + Math.abs(pointer.y - state.y) > 0.3 ||\r
        Math.abs(lightGoalX - state.lightX) + Math.abs(lightGoalY - state.lightY) > 0.001;\r
      if (flowing || settling) raf = requestAnimationFrame(frame);\r
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
      view.ratio = ratio;\r
      canvas.width = Math.max(1, Math.round(width * ratio));\r
      canvas.height = Math.max(1, Math.round(height * ratio));\r
      if (!raf) render();\r
      wake();\r
    };\r
\r
    const locate = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const point = locate(event);\r
      pointer.x = point.x;\r
      pointer.y = point.y;\r
      pointer.inside = point.inside;\r
      wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      if (!s.clickRipple || reduce) return;\r
      const point = locate(event);\r
      if (!point.inside) return;\r
      waves.push({ x: point.x / view.width, y: 1 - point.y / view.height, age: 0 });\r
      if (waves.length > 4) waves.shift();\r
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
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
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
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteTexture(texture);\r
      gl.deleteFramebuffer(framebuffer);\r
      gl.deleteProgram(fieldProgram.program);\r
      gl.deleteProgram(compositeProgram.program);\r
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
    <div ref={containerRef} className={\`relative w-full h-full overflow-hidden \${className}\`} style={style}>\r
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Silk;\r
`,a={usage:`import Silk from './Silk';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <Silk
    color="#5227FF"
    sheenColor="#ffffff"
    speed={5}
    scale={1}
    rotation={0}
    sheen={0.5}
    depth={0.5}
    glow={0.3}
    noiseIntensity={1.5}
    mouseInteraction
    clickRipple
    intro
  />
</div>`,code:r,css:n,tailwind:e,tsCode:t,tsTailwind:o};export{a as silkCode};
