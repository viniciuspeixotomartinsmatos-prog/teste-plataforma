const n=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
import { Renderer, Program, Mesh, Geometry, Triangle, Texture, RenderTarget } from 'ogl';\r
import './RippleDistortion.css';\r
\r
const MAX_WAVES = 100;\r
const QUALITY_SCALE = { low: 0.4, medium: 0.7, high: 1 };\r
const START_SCALE = 1.5;\r
const LIFE_CONSTANT = Math.log(500);\r
\r
const waveVertex = \`\r
precision highp float;\r
\r
attribute vec2 position;\r
attribute vec2 uv;\r
attribute vec2 iOffset;\r
attribute vec2 iScale;\r
attribute float iOpacity;\r
\r
varying vec2 vUv;\r
varying float vOpacity;\r
\r
void main() {\r
  vUv = uv;\r
  vOpacity = iOpacity;\r
  gl_Position = vec4(iOffset + position * iScale, 0.0, 1.0);\r
}\r
\`;\r
\r
const waveFragment = \`\r
precision highp float;\r
\r
varying vec2 vUv;\r
varying float vOpacity;\r
\r
uniform float uRings;\r
\r
const float PI = 3.141592653589793;\r
const float EDGE = 0.006737947;\r
\r
void main() {\r
  vec2 p = vUv * 2.0 - 1.0;\r
  float r = dot(p, p);\r
  if (r > 1.0) discard;\r
\r
  float brush = (exp(-r * 5.0) - EDGE) / (1.0 - EDGE);\r
\r
  brush *= 0.55 + 0.45 * cos(sqrt(r) * PI * 2.0 * uRings);\r
\r
  gl_FragColor = vec4(vec3(brush * vOpacity * vOpacity), 1.0);\r
}\r
\`;\r
\r
const screenVertex = \`\r
precision highp float;\r
attribute vec2 position;\r
attribute vec2 uv;\r
varying vec2 vUv;\r
void main() {\r
  vUv = uv;\r
  gl_Position = vec4(position, 0.0, 1.0);\r
}\r
\`;\r
\r
const compositeFragment = \`\r
precision highp float;\r
\r
varying vec2 vUv;\r
\r
uniform sampler2D uTexture;\r
uniform sampler2D uDisplacement;\r
uniform vec2 uResolution;\r
uniform vec2 uTextureSize;\r
uniform vec2 uTexel;\r
uniform vec3 uTint;\r
uniform vec3 uHighlight;\r
uniform float uStrength;\r
uniform float uSwirl;\r
uniform float uDispersion;\r
uniform float uGlint;\r
uniform float uTintAmount;\r
uniform float uGrayscale;\r
\r
const float TAU = 6.283185307179586;\r
\r
vec2 coverUV(vec2 uv) {\r
  vec2 safe = max(uTextureSize, vec2(1.0));\r
  vec2 s = uResolution / safe;\r
  vec2 scaledSize = safe * max(s.x, s.y);\r
  vec2 offset = (uResolution - scaledSize) * 0.5;\r
  return (uv * uResolution - offset) / scaledSize;\r
}\r
\r
void main() {\r
  float amount = texture2D(uDisplacement, vUv).r;\r
  vec2 base = coverUV(vUv);\r
\r
  float theta = amount * uSwirl * TAU;\r
  vec2 dir = vec2(sin(theta), cos(theta));\r
  vec2 push = dir * amount * uStrength;\r
\r
  vec3 color;\r
  if (uDispersion > 0.001) {\r
    float split = uDispersion * 0.25;\r
    color.r = texture2D(uTexture, base + push * (1.0 + split)).r;\r
    color.g = texture2D(uTexture, base + push).g;\r
    color.b = texture2D(uTexture, base + push * (1.0 - split)).b;\r
  } else {\r
    color = texture2D(uTexture, base + push).rgb;\r
  }\r
\r
  if (uGrayscale > 0.001) {\r
    color = mix(color, vec3(dot(color, vec3(0.2126, 0.7152, 0.0722))), uGrayscale);\r
  }\r
\r
  if (uTintAmount > 0.001) {\r
    color = mix(color, color * uTint * 1.9, clamp(amount * 1.6, 0.0, 1.0) * uTintAmount);\r
  }\r
\r
  if (uGlint > 0.001) {\r
    float ex = texture2D(uDisplacement, vUv + vec2(uTexel.x, 0.0)).r - texture2D(uDisplacement, vUv - vec2(uTexel.x, 0.0)).r;\r
    float ey = texture2D(uDisplacement, vUv + vec2(0.0, uTexel.y)).r - texture2D(uDisplacement, vUv - vec2(0.0, uTexel.y)).r;\r
    vec3 normal = normalize(vec3(-ex * 26.0, -ey * 26.0, 1.0));\r
    vec3 light = normalize(vec3(-0.35, 0.55, 1.0));\r
    float raw = pow(max(dot(normal, light), 0.0), 22.0);\r
    float flatSpec = pow(max(light.z, 0.0), 22.0);\r
    color += uHighlight * clamp((raw - flatSpec) / max(1.0 - flatSpec, 0.0001), 0.0, 1.0) * uGlint;\r
  }\r
\r
  gl_FragColor = vec4(color, 1.0);\r
}\r
\`;\r
\r
const hexToRGB = hex => {\r
  const clean = hex.replace('#', '');\r
  const full =\r
    clean.length === 3\r
      ? clean\r
          .split('')\r
          .map(c => c + c)\r
          .join('')\r
      : clean;\r
  const n = parseInt(full, 16);\r
  if (Number.isNaN(n)) return [1, 1, 1];\r
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];\r
};\r
\r
const RippleDistortion = ({\r
  src = 'https://images.unsplash.com/photo-1782977389500-dd7adad33ebe?q=80&w=3416&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',\r
  brushSize = 150,\r
  strength = 0.2,\r
  swirl = 1,\r
  rings = 4,\r
  spread = 5,\r
  fade = 3,\r
  spacing = 15,\r
  dispersion = 0,\r
  glint = 0,\r
  tint = '#a855f7',\r
  tintAmount = 0.1,\r
  grayscale = true,\r
  highlightColor = '#ffffff',\r
  trigger = 'hover',\r
  clickStrength = 2,\r
  quality = 'low',\r
  enabled = true,\r
  className = '',\r
  style\r
}) => {\r
  const mountRef = useRef(null);\r
  const configRef = useRef({});\r
  const uniformsRef = useRef(null);\r
\r
  configRef.current = { brushSize, spread, fade, spacing, clickStrength, trigger, enabled };\r
\r
  useEffect(() => {\r
    const mount = mountRef.current;\r
    if (!mount) return;\r
\r
    const reduceMotion =\r
      typeof window !== 'undefined' &&\r
      window.matchMedia &&\r
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
\r
    const renderer = new Renderer({\r
      alpha: false,\r
      antialias: false,\r
      dpr: Math.min(window.devicePixelRatio || 1, 2)\r
    });\r
    const gl = renderer.gl;\r
    gl.clearColor(0, 0, 0, 1);\r
    const canvas = gl.canvas;\r
    canvas.style.width = '100%';\r
    canvas.style.height = '100%';\r
    canvas.style.display = 'block';\r
    mount.appendChild(canvas);\r
\r
    const imageTexture = new Texture(gl, {\r
      generateMipmaps: false,\r
      minFilter: gl.LINEAR,\r
      magFilter: gl.LINEAR,\r
      wrapS: gl.CLAMP_TO_EDGE,\r
      wrapT: gl.CLAMP_TO_EDGE\r
    });\r
\r
    let disposed = false;\r
    const image = new window.Image();\r
    image.crossOrigin = 'anonymous';\r
    image.decoding = 'async';\r
    image.onload = () => {\r
      if (disposed) return;\r
      imageTexture.image = image;\r
      compositeUniforms.uTextureSize.value = [image.naturalWidth || 1, image.naturalHeight || 1];\r
    };\r
    image.src = src;\r
\r
    const offsets = new Float32Array(MAX_WAVES * 2);\r
    const scales = new Float32Array(MAX_WAVES * 2);\r
    const opacities = new Float32Array(MAX_WAVES);\r
\r
    const waves = Array.from({ length: MAX_WAVES }, () => ({\r
      x: 0,\r
      y: 0,\r
      scale: START_SCALE,\r
      target: START_SCALE,\r
      size: 1,\r
      opacity: 0\r
    }));\r
    let current = 0;\r
\r
    const geometry = new Geometry(gl, {\r
      position: { size: 2, data: new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]) },\r
      uv: { size: 2, data: new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]) },\r
      iOffset: { instanced: 1, size: 2, data: offsets },\r
      iScale: { instanced: 1, size: 2, data: scales },\r
      iOpacity: { instanced: 1, size: 1, data: opacities }\r
    });\r
\r
    const waveUniforms = { uRings: { value: rings } };\r
    const waveProgram = new Program(gl, {\r
      vertex: waveVertex,\r
      fragment: waveFragment,\r
      uniforms: waveUniforms,\r
      transparent: true,\r
      depthTest: false,\r
      depthWrite: false,\r
      cullFace: false\r
    });\r
    waveProgram.setBlendFunc(gl.ONE, gl.ONE);\r
    const waveMesh = new Mesh(gl, { geometry, program: waveProgram, frustumCulled: false });\r
\r
    const displacementTarget = new RenderTarget(gl, {\r
      width: 2,\r
      height: 2,\r
      depth: false,\r
      minFilter: gl.LINEAR,\r
      magFilter: gl.LINEAR,\r
      wrapS: gl.CLAMP_TO_EDGE,\r
      wrapT: gl.CLAMP_TO_EDGE\r
    });\r
\r
    const compositeUniforms = {\r
      uTexture: { value: imageTexture },\r
      uDisplacement: { value: displacementTarget.texture },\r
      uResolution: { value: [1, 1] },\r
      uTextureSize: { value: [1, 1] },\r
      uTexel: { value: [1, 1] },\r
      uTint: { value: hexToRGB(tint) },\r
      uHighlight: { value: hexToRGB(highlightColor) },\r
      uStrength: { value: strength },\r
      uSwirl: { value: swirl },\r
      uDispersion: { value: dispersion },\r
      uGlint: { value: glint },\r
      uTintAmount: { value: tintAmount },\r
      uGrayscale: { value: grayscale ? 1 : 0 }\r
    };\r
\r
    const compositeMesh = new Mesh(gl, {\r
      geometry: new Triangle(gl),\r
      program: new Program(gl, {\r
        vertex: screenVertex,\r
        fragment: compositeFragment,\r
        uniforms: compositeUniforms,\r
        depthTest: false,\r
        depthWrite: false\r
      })\r
    });\r
\r
    uniformsRef.current = { wave: waveUniforms, composite: compositeUniforms };\r
\r
    let width = 1;\r
    let height = 1;\r
\r
    const resize = () => {\r
      width = Math.max(1, mount.clientWidth);\r
      height = Math.max(1, mount.clientHeight);\r
      renderer.setSize(width, height);\r
      compositeUniforms.uResolution.value = [width, height];\r
\r
      const scale = QUALITY_SCALE[quality] || QUALITY_SCALE.high;\r
      const fieldW = Math.max(2, Math.round(width * scale));\r
      const fieldH = Math.max(2, Math.round(height * scale));\r
      displacementTarget.setSize(fieldW, fieldH);\r
      compositeUniforms.uTexel.value = [1 / fieldW, 1 / fieldH];\r
    };\r
\r
    const ro = new ResizeObserver(resize);\r
    ro.observe(mount);\r
    resize();\r
\r
    const setNewWave = (x, y, power) => {\r
      const cfg = configRef.current;\r
      const wave = waves[current];\r
      current = (current + 1) % MAX_WAVES;\r
      wave.x = x;\r
      wave.y = y;\r
      wave.scale = START_SCALE * power;\r
      wave.target = START_SCALE * Math.max(1, cfg.spread) * power;\r
      wave.size = Math.max(1, cfg.brushSize);\r
      wave.opacity = 1;\r
    };\r
\r
    const localPoint = (clientX, clientY) => {\r
      const rect = mount.getBoundingClientRect();\r
      if (rect.width === 0 || rect.height === 0) return null;\r
      if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {\r
        return null;\r
      }\r
      return [clientX - rect.left, rect.height - (clientY - rect.top)];\r
    };\r
\r
    let previousX = 0;\r
    let previousY = 0;\r
\r
    const onMove = event => {\r
      const cfg = configRef.current;\r
      if (!cfg.enabled || reduceMotion || cfg.trigger === 'click') return;\r
      const point = localPoint(event.clientX, event.clientY);\r
      if (!point) return;\r
      const step = Math.max(1, cfg.spacing);\r
      if (Math.abs(point[0] - previousX) > step || Math.abs(point[1] - previousY) > step) {\r
        setNewWave(point[0], point[1], 1);\r
        previousX = point[0];\r
        previousY = point[1];\r
      }\r
    };\r
\r
    const onDown = event => {\r
      const cfg = configRef.current;\r
      if (!cfg.enabled || reduceMotion || cfg.trigger === 'hover') return;\r
      const point = localPoint(event.clientX, event.clientY);\r
      if (!point) return;\r
      setNewWave(point[0], point[1], Math.max(1, cfg.clickStrength));\r
    };\r
\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    window.addEventListener('pointerdown', onDown, { passive: true });\r
\r
    let raf = 0;\r
    let previousTime = 0;\r
\r
    const loop = now => {\r
      raf = requestAnimationFrame(loop);\r
      const delta = previousTime ? Math.min(0.05, (now - previousTime) / 1000) : 0;\r
      previousTime = now;\r
      const cfg = configRef.current;\r
\r
      const growth = reduceMotion ? 0 : 1 - Math.exp(-delta * 1.09);\r
      const decay = reduceMotion ? 1 : Math.exp((-delta * LIFE_CONSTANT) / Math.max(0.15, cfg.fade));\r
\r
      for (let i = 0; i < MAX_WAVES; i += 1) {\r
        const wave = waves[i];\r
        if (wave.opacity <= 0) {\r
          opacities[i] = 0;\r
          continue;\r
        }\r
\r
        wave.opacity *= decay;\r
        wave.scale += (wave.target - wave.scale) * growth;\r
\r
        if (wave.opacity < 0.002) {\r
          wave.opacity = 0;\r
          opacities[i] = 0;\r
          continue;\r
        }\r
\r
        const half = (wave.scale * wave.size) / 2;\r
        offsets[i * 2] = (wave.x / width) * 2 - 1;\r
        offsets[i * 2 + 1] = (wave.y / height) * 2 - 1;\r
        scales[i * 2] = (half / width) * 2;\r
        scales[i * 2 + 1] = (half / height) * 2;\r
        opacities[i] = wave.opacity;\r
      }\r
\r
      geometry.attributes.iOffset.needsUpdate = true;\r
      geometry.attributes.iScale.needsUpdate = true;\r
      geometry.attributes.iOpacity.needsUpdate = true;\r
\r
      renderer.render({ scene: waveMesh, target: displacementTarget, clear: true });\r
      renderer.render({ scene: compositeMesh });\r
    };\r
    raf = requestAnimationFrame(loop);\r
\r
    return () => {\r
      disposed = true;\r
      cancelAnimationFrame(raf);\r
      ro.disconnect();\r
      window.removeEventListener('pointermove', onMove);\r
      window.removeEventListener('pointerdown', onDown);\r
      uniformsRef.current = null;\r
      if (canvas.parentNode === mount) mount.removeChild(canvas);\r
      const ext = gl.getExtension('WEBGL_lose_context');\r
      if (ext) ext.loseContext();\r
    };\r
    // eslint-disable-next-line react-hooks/exhaustive-deps\r
  }, [src, quality]);\r
\r
  useEffect(() => {\r
    const u = uniformsRef.current;\r
    if (!u) return;\r
    u.wave.uRings.value = rings;\r
    u.composite.uStrength.value = strength;\r
    u.composite.uSwirl.value = swirl;\r
    u.composite.uDispersion.value = dispersion;\r
    u.composite.uGlint.value = glint;\r
    u.composite.uTintAmount.value = tintAmount;\r
    u.composite.uGrayscale.value = grayscale ? 1 : 0;\r
    u.composite.uHighlight.value = hexToRGB(highlightColor);\r
    u.composite.uTint.value = hexToRGB(tint);\r
  }, [rings, strength, swirl, dispersion, glint, tintAmount, grayscale, highlightColor, tint]);\r
\r
  return <div ref={mountRef} className={\`ripple-distortion \${className}\`.trim()} style={style} />;\r
};\r
\r
export default RippleDistortion;\r
`,r=`.ripple-distortion {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
  background: #000;\r
}\r
\r
.ripple-distortion canvas {\r
  display: block;\r
  width: 100%;\r
  height: 100%;\r
}\r
`,e=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
import { Renderer, Program, Mesh, Geometry, Triangle, Texture, RenderTarget } from 'ogl';\r
\r
const MAX_WAVES = 100;\r
const QUALITY_SCALE = { low: 0.4, medium: 0.7, high: 1 };\r
const START_SCALE = 1.5;\r
const LIFE_CONSTANT = Math.log(500);\r
\r
const waveVertex = \`\r
precision highp float;\r
\r
attribute vec2 position;\r
attribute vec2 uv;\r
attribute vec2 iOffset;\r
attribute vec2 iScale;\r
attribute float iOpacity;\r
\r
varying vec2 vUv;\r
varying float vOpacity;\r
\r
void main() {\r
  vUv = uv;\r
  vOpacity = iOpacity;\r
  gl_Position = vec4(iOffset + position * iScale, 0.0, 1.0);\r
}\r
\`;\r
\r
const waveFragment = \`\r
precision highp float;\r
\r
varying vec2 vUv;\r
varying float vOpacity;\r
\r
uniform float uRings;\r
\r
const float PI = 3.141592653589793;\r
const float EDGE = 0.006737947;\r
\r
void main() {\r
  vec2 p = vUv * 2.0 - 1.0;\r
  float r = dot(p, p);\r
  if (r > 1.0) discard;\r
\r
  float brush = (exp(-r * 5.0) - EDGE) / (1.0 - EDGE);\r
\r
  brush *= 0.55 + 0.45 * cos(sqrt(r) * PI * 2.0 * uRings);\r
\r
  gl_FragColor = vec4(vec3(brush * vOpacity * vOpacity), 1.0);\r
}\r
\`;\r
\r
const screenVertex = \`\r
precision highp float;\r
attribute vec2 position;\r
attribute vec2 uv;\r
varying vec2 vUv;\r
void main() {\r
  vUv = uv;\r
  gl_Position = vec4(position, 0.0, 1.0);\r
}\r
\`;\r
\r
const compositeFragment = \`\r
precision highp float;\r
\r
varying vec2 vUv;\r
\r
uniform sampler2D uTexture;\r
uniform sampler2D uDisplacement;\r
uniform vec2 uResolution;\r
uniform vec2 uTextureSize;\r
uniform vec2 uTexel;\r
uniform vec3 uTint;\r
uniform vec3 uHighlight;\r
uniform float uStrength;\r
uniform float uSwirl;\r
uniform float uDispersion;\r
uniform float uGlint;\r
uniform float uTintAmount;\r
uniform float uGrayscale;\r
\r
const float TAU = 6.283185307179586;\r
\r
vec2 coverUV(vec2 uv) {\r
  vec2 safe = max(uTextureSize, vec2(1.0));\r
  vec2 s = uResolution / safe;\r
  vec2 scaledSize = safe * max(s.x, s.y);\r
  vec2 offset = (uResolution - scaledSize) * 0.5;\r
  return (uv * uResolution - offset) / scaledSize;\r
}\r
\r
void main() {\r
  float amount = texture2D(uDisplacement, vUv).r;\r
  vec2 base = coverUV(vUv);\r
\r
  float theta = amount * uSwirl * TAU;\r
  vec2 dir = vec2(sin(theta), cos(theta));\r
  vec2 push = dir * amount * uStrength;\r
\r
  vec3 color;\r
  if (uDispersion > 0.001) {\r
    float split = uDispersion * 0.25;\r
    color.r = texture2D(uTexture, base + push * (1.0 + split)).r;\r
    color.g = texture2D(uTexture, base + push).g;\r
    color.b = texture2D(uTexture, base + push * (1.0 - split)).b;\r
  } else {\r
    color = texture2D(uTexture, base + push).rgb;\r
  }\r
\r
  if (uGrayscale > 0.001) {\r
    color = mix(color, vec3(dot(color, vec3(0.2126, 0.7152, 0.0722))), uGrayscale);\r
  }\r
\r
  if (uTintAmount > 0.001) {\r
    color = mix(color, color * uTint * 1.9, clamp(amount * 1.6, 0.0, 1.0) * uTintAmount);\r
  }\r
\r
  if (uGlint > 0.001) {\r
    float ex = texture2D(uDisplacement, vUv + vec2(uTexel.x, 0.0)).r - texture2D(uDisplacement, vUv - vec2(uTexel.x, 0.0)).r;\r
    float ey = texture2D(uDisplacement, vUv + vec2(0.0, uTexel.y)).r - texture2D(uDisplacement, vUv - vec2(0.0, uTexel.y)).r;\r
    vec3 normal = normalize(vec3(-ex * 26.0, -ey * 26.0, 1.0));\r
    vec3 light = normalize(vec3(-0.35, 0.55, 1.0));\r
    float raw = pow(max(dot(normal, light), 0.0), 22.0);\r
    float flatSpec = pow(max(light.z, 0.0), 22.0);\r
    color += uHighlight * clamp((raw - flatSpec) / max(1.0 - flatSpec, 0.0001), 0.0, 1.0) * uGlint;\r
  }\r
\r
  gl_FragColor = vec4(color, 1.0);\r
}\r
\`;\r
\r
const hexToRGB = hex => {\r
  const clean = hex.replace('#', '');\r
  const full =\r
    clean.length === 3\r
      ? clean\r
          .split('')\r
          .map(c => c + c)\r
          .join('')\r
      : clean;\r
  const n = parseInt(full, 16);\r
  if (Number.isNaN(n)) return [1, 1, 1];\r
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];\r
};\r
\r
const RippleDistortion = ({\r
  src = 'https://images.unsplash.com/photo-1782977389500-dd7adad33ebe?q=80&w=3416&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',\r
  brushSize = 150,\r
  strength = 0.2,\r
  swirl = 1,\r
  rings = 4,\r
  spread = 5,\r
  fade = 3,\r
  spacing = 15,\r
  dispersion = 0,\r
  glint = 0,\r
  tint = '#a855f7',\r
  tintAmount = 0.1,\r
  grayscale = true,\r
  highlightColor = '#ffffff',\r
  trigger = 'hover',\r
  clickStrength = 2,\r
  quality = 'low',\r
  enabled = true,\r
  className = '',\r
  style\r
}) => {\r
  const mountRef = useRef(null);\r
  const configRef = useRef({});\r
  const uniformsRef = useRef(null);\r
\r
  configRef.current = { brushSize, spread, fade, spacing, clickStrength, trigger, enabled };\r
\r
  useEffect(() => {\r
    const mount = mountRef.current;\r
    if (!mount) return;\r
\r
    const reduceMotion =\r
      typeof window !== 'undefined' &&\r
      window.matchMedia &&\r
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
\r
    const renderer = new Renderer({\r
      alpha: false,\r
      antialias: false,\r
      dpr: Math.min(window.devicePixelRatio || 1, 2)\r
    });\r
    const gl = renderer.gl;\r
    gl.clearColor(0, 0, 0, 1);\r
    const canvas = gl.canvas;\r
    canvas.style.width = '100%';\r
    canvas.style.height = '100%';\r
    canvas.style.display = 'block';\r
    mount.appendChild(canvas);\r
\r
    const imageTexture = new Texture(gl, {\r
      generateMipmaps: false,\r
      minFilter: gl.LINEAR,\r
      magFilter: gl.LINEAR,\r
      wrapS: gl.CLAMP_TO_EDGE,\r
      wrapT: gl.CLAMP_TO_EDGE\r
    });\r
\r
    let disposed = false;\r
    const image = new window.Image();\r
    image.crossOrigin = 'anonymous';\r
    image.decoding = 'async';\r
    image.onload = () => {\r
      if (disposed) return;\r
      imageTexture.image = image;\r
      compositeUniforms.uTextureSize.value = [image.naturalWidth || 1, image.naturalHeight || 1];\r
    };\r
    image.src = src;\r
\r
    const offsets = new Float32Array(MAX_WAVES * 2);\r
    const scales = new Float32Array(MAX_WAVES * 2);\r
    const opacities = new Float32Array(MAX_WAVES);\r
\r
    const waves = Array.from({ length: MAX_WAVES }, () => ({\r
      x: 0,\r
      y: 0,\r
      scale: START_SCALE,\r
      target: START_SCALE,\r
      size: 1,\r
      opacity: 0\r
    }));\r
    let current = 0;\r
\r
    const geometry = new Geometry(gl, {\r
      position: { size: 2, data: new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]) },\r
      uv: { size: 2, data: new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]) },\r
      iOffset: { instanced: 1, size: 2, data: offsets },\r
      iScale: { instanced: 1, size: 2, data: scales },\r
      iOpacity: { instanced: 1, size: 1, data: opacities }\r
    });\r
\r
    const waveUniforms = { uRings: { value: rings } };\r
    const waveProgram = new Program(gl, {\r
      vertex: waveVertex,\r
      fragment: waveFragment,\r
      uniforms: waveUniforms,\r
      transparent: true,\r
      depthTest: false,\r
      depthWrite: false,\r
      cullFace: false\r
    });\r
    waveProgram.setBlendFunc(gl.ONE, gl.ONE);\r
    const waveMesh = new Mesh(gl, { geometry, program: waveProgram, frustumCulled: false });\r
\r
    const displacementTarget = new RenderTarget(gl, {\r
      width: 2,\r
      height: 2,\r
      depth: false,\r
      minFilter: gl.LINEAR,\r
      magFilter: gl.LINEAR,\r
      wrapS: gl.CLAMP_TO_EDGE,\r
      wrapT: gl.CLAMP_TO_EDGE\r
    });\r
\r
    const compositeUniforms = {\r
      uTexture: { value: imageTexture },\r
      uDisplacement: { value: displacementTarget.texture },\r
      uResolution: { value: [1, 1] },\r
      uTextureSize: { value: [1, 1] },\r
      uTexel: { value: [1, 1] },\r
      uTint: { value: hexToRGB(tint) },\r
      uHighlight: { value: hexToRGB(highlightColor) },\r
      uStrength: { value: strength },\r
      uSwirl: { value: swirl },\r
      uDispersion: { value: dispersion },\r
      uGlint: { value: glint },\r
      uTintAmount: { value: tintAmount },\r
      uGrayscale: { value: grayscale ? 1 : 0 }\r
    };\r
\r
    const compositeMesh = new Mesh(gl, {\r
      geometry: new Triangle(gl),\r
      program: new Program(gl, {\r
        vertex: screenVertex,\r
        fragment: compositeFragment,\r
        uniforms: compositeUniforms,\r
        depthTest: false,\r
        depthWrite: false\r
      })\r
    });\r
\r
    uniformsRef.current = { wave: waveUniforms, composite: compositeUniforms };\r
\r
    let width = 1;\r
    let height = 1;\r
\r
    const resize = () => {\r
      width = Math.max(1, mount.clientWidth);\r
      height = Math.max(1, mount.clientHeight);\r
      renderer.setSize(width, height);\r
      compositeUniforms.uResolution.value = [width, height];\r
\r
      const scale = QUALITY_SCALE[quality] || QUALITY_SCALE.high;\r
      const fieldW = Math.max(2, Math.round(width * scale));\r
      const fieldH = Math.max(2, Math.round(height * scale));\r
      displacementTarget.setSize(fieldW, fieldH);\r
      compositeUniforms.uTexel.value = [1 / fieldW, 1 / fieldH];\r
    };\r
\r
    const ro = new ResizeObserver(resize);\r
    ro.observe(mount);\r
    resize();\r
\r
    const setNewWave = (x, y, power) => {\r
      const cfg = configRef.current;\r
      const wave = waves[current];\r
      current = (current + 1) % MAX_WAVES;\r
      wave.x = x;\r
      wave.y = y;\r
      wave.scale = START_SCALE * power;\r
      wave.target = START_SCALE * Math.max(1, cfg.spread) * power;\r
      wave.size = Math.max(1, cfg.brushSize);\r
      wave.opacity = 1;\r
    };\r
\r
    const localPoint = (clientX, clientY) => {\r
      const rect = mount.getBoundingClientRect();\r
      if (rect.width === 0 || rect.height === 0) return null;\r
      if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {\r
        return null;\r
      }\r
      return [clientX - rect.left, rect.height - (clientY - rect.top)];\r
    };\r
\r
    let previousX = 0;\r
    let previousY = 0;\r
\r
    const onMove = event => {\r
      const cfg = configRef.current;\r
      if (!cfg.enabled || reduceMotion || cfg.trigger === 'click') return;\r
      const point = localPoint(event.clientX, event.clientY);\r
      if (!point) return;\r
      const step = Math.max(1, cfg.spacing);\r
      if (Math.abs(point[0] - previousX) > step || Math.abs(point[1] - previousY) > step) {\r
        setNewWave(point[0], point[1], 1);\r
        previousX = point[0];\r
        previousY = point[1];\r
      }\r
    };\r
\r
    const onDown = event => {\r
      const cfg = configRef.current;\r
      if (!cfg.enabled || reduceMotion || cfg.trigger === 'hover') return;\r
      const point = localPoint(event.clientX, event.clientY);\r
      if (!point) return;\r
      setNewWave(point[0], point[1], Math.max(1, cfg.clickStrength));\r
    };\r
\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    window.addEventListener('pointerdown', onDown, { passive: true });\r
\r
    let raf = 0;\r
    let previousTime = 0;\r
\r
    const loop = now => {\r
      raf = requestAnimationFrame(loop);\r
      const delta = previousTime ? Math.min(0.05, (now - previousTime) / 1000) : 0;\r
      previousTime = now;\r
      const cfg = configRef.current;\r
\r
      const growth = reduceMotion ? 0 : 1 - Math.exp(-delta * 1.09);\r
      const decay = reduceMotion ? 1 : Math.exp((-delta * LIFE_CONSTANT) / Math.max(0.15, cfg.fade));\r
\r
      for (let i = 0; i < MAX_WAVES; i += 1) {\r
        const wave = waves[i];\r
        if (wave.opacity <= 0) {\r
          opacities[i] = 0;\r
          continue;\r
        }\r
\r
        wave.opacity *= decay;\r
        wave.scale += (wave.target - wave.scale) * growth;\r
\r
        if (wave.opacity < 0.002) {\r
          wave.opacity = 0;\r
          opacities[i] = 0;\r
          continue;\r
        }\r
\r
        const half = (wave.scale * wave.size) / 2;\r
        offsets[i * 2] = (wave.x / width) * 2 - 1;\r
        offsets[i * 2 + 1] = (wave.y / height) * 2 - 1;\r
        scales[i * 2] = (half / width) * 2;\r
        scales[i * 2 + 1] = (half / height) * 2;\r
        opacities[i] = wave.opacity;\r
      }\r
\r
      geometry.attributes.iOffset.needsUpdate = true;\r
      geometry.attributes.iScale.needsUpdate = true;\r
      geometry.attributes.iOpacity.needsUpdate = true;\r
\r
      renderer.render({ scene: waveMesh, target: displacementTarget, clear: true });\r
      renderer.render({ scene: compositeMesh });\r
    };\r
    raf = requestAnimationFrame(loop);\r
\r
    return () => {\r
      disposed = true;\r
      cancelAnimationFrame(raf);\r
      ro.disconnect();\r
      window.removeEventListener('pointermove', onMove);\r
      window.removeEventListener('pointerdown', onDown);\r
      uniformsRef.current = null;\r
      if (canvas.parentNode === mount) mount.removeChild(canvas);\r
      const ext = gl.getExtension('WEBGL_lose_context');\r
      if (ext) ext.loseContext();\r
    };\r
    // eslint-disable-next-line react-hooks/exhaustive-deps\r
  }, [src, quality]);\r
\r
  useEffect(() => {\r
    const u = uniformsRef.current;\r
    if (!u) return;\r
    u.wave.uRings.value = rings;\r
    u.composite.uStrength.value = strength;\r
    u.composite.uSwirl.value = swirl;\r
    u.composite.uDispersion.value = dispersion;\r
    u.composite.uGlint.value = glint;\r
    u.composite.uTintAmount.value = tintAmount;\r
    u.composite.uGrayscale.value = grayscale ? 1 : 0;\r
    u.composite.uHighlight.value = hexToRGB(highlightColor);\r
    u.composite.uTint.value = hexToRGB(tint);\r
  }, [rings, strength, swirl, dispersion, glint, tintAmount, grayscale, highlightColor, tint]);\r
\r
  return (\r
    <div\r
      ref={mountRef}\r
      className={\`relative w-full h-full overflow-hidden bg-black [&>canvas]:block [&>canvas]:w-full [&>canvas]:h-full \${className}\`.trim()}\r
      style={style}\r
    />\r
  );\r
};\r
\r
export default RippleDistortion;\r
`,t=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
import type { CSSProperties } from 'react';\r
import { Renderer, Program, Mesh, Geometry, Triangle, Texture, RenderTarget } from 'ogl';\r
import './RippleDistortion.css';\r
\r
const MAX_WAVES = 100;\r
const QUALITY_SCALE: Record<string, number> = { low: 0.4, medium: 0.7, high: 1 };\r
const START_SCALE = 1.5;\r
const LIFE_CONSTANT = Math.log(500);\r
\r
const waveVertex = \`\r
precision highp float;\r
\r
attribute vec2 position;\r
attribute vec2 uv;\r
attribute vec2 iOffset;\r
attribute vec2 iScale;\r
attribute float iOpacity;\r
\r
varying vec2 vUv;\r
varying float vOpacity;\r
\r
void main() {\r
  vUv = uv;\r
  vOpacity = iOpacity;\r
  gl_Position = vec4(iOffset + position * iScale, 0.0, 1.0);\r
}\r
\`;\r
\r
const waveFragment = \`\r
precision highp float;\r
\r
varying vec2 vUv;\r
varying float vOpacity;\r
\r
uniform float uRings;\r
\r
const float PI = 3.141592653589793;\r
const float EDGE = 0.006737947;\r
\r
void main() {\r
  vec2 p = vUv * 2.0 - 1.0;\r
  float r = dot(p, p);\r
  if (r > 1.0) discard;\r
\r
  float brush = (exp(-r * 5.0) - EDGE) / (1.0 - EDGE);\r
\r
  brush *= 0.55 + 0.45 * cos(sqrt(r) * PI * 2.0 * uRings);\r
\r
  gl_FragColor = vec4(vec3(brush * vOpacity * vOpacity), 1.0);\r
}\r
\`;\r
\r
const screenVertex = \`\r
precision highp float;\r
attribute vec2 position;\r
attribute vec2 uv;\r
varying vec2 vUv;\r
void main() {\r
  vUv = uv;\r
  gl_Position = vec4(position, 0.0, 1.0);\r
}\r
\`;\r
\r
const compositeFragment = \`\r
precision highp float;\r
\r
varying vec2 vUv;\r
\r
uniform sampler2D uTexture;\r
uniform sampler2D uDisplacement;\r
uniform vec2 uResolution;\r
uniform vec2 uTextureSize;\r
uniform vec2 uTexel;\r
uniform vec3 uTint;\r
uniform vec3 uHighlight;\r
uniform float uStrength;\r
uniform float uSwirl;\r
uniform float uDispersion;\r
uniform float uGlint;\r
uniform float uTintAmount;\r
uniform float uGrayscale;\r
\r
const float TAU = 6.283185307179586;\r
\r
vec2 coverUV(vec2 uv) {\r
  vec2 safe = max(uTextureSize, vec2(1.0));\r
  vec2 s = uResolution / safe;\r
  vec2 scaledSize = safe * max(s.x, s.y);\r
  vec2 offset = (uResolution - scaledSize) * 0.5;\r
  return (uv * uResolution - offset) / scaledSize;\r
}\r
\r
void main() {\r
  float amount = texture2D(uDisplacement, vUv).r;\r
  vec2 base = coverUV(vUv);\r
\r
  float theta = amount * uSwirl * TAU;\r
  vec2 dir = vec2(sin(theta), cos(theta));\r
  vec2 push = dir * amount * uStrength;\r
\r
  vec3 color;\r
  if (uDispersion > 0.001) {\r
    float split = uDispersion * 0.25;\r
    color.r = texture2D(uTexture, base + push * (1.0 + split)).r;\r
    color.g = texture2D(uTexture, base + push).g;\r
    color.b = texture2D(uTexture, base + push * (1.0 - split)).b;\r
  } else {\r
    color = texture2D(uTexture, base + push).rgb;\r
  }\r
\r
  if (uGrayscale > 0.001) {\r
    color = mix(color, vec3(dot(color, vec3(0.2126, 0.7152, 0.0722))), uGrayscale);\r
  }\r
\r
  if (uTintAmount > 0.001) {\r
    color = mix(color, color * uTint * 1.9, clamp(amount * 1.6, 0.0, 1.0) * uTintAmount);\r
  }\r
\r
  if (uGlint > 0.001) {\r
    float ex = texture2D(uDisplacement, vUv + vec2(uTexel.x, 0.0)).r - texture2D(uDisplacement, vUv - vec2(uTexel.x, 0.0)).r;\r
    float ey = texture2D(uDisplacement, vUv + vec2(0.0, uTexel.y)).r - texture2D(uDisplacement, vUv - vec2(0.0, uTexel.y)).r;\r
    vec3 normal = normalize(vec3(-ex * 26.0, -ey * 26.0, 1.0));\r
    vec3 light = normalize(vec3(-0.35, 0.55, 1.0));\r
    float raw = pow(max(dot(normal, light), 0.0), 22.0);\r
    float flatSpec = pow(max(light.z, 0.0), 22.0);\r
    color += uHighlight * clamp((raw - flatSpec) / max(1.0 - flatSpec, 0.0001), 0.0, 1.0) * uGlint;\r
  }\r
\r
  gl_FragColor = vec4(color, 1.0);\r
}\r
\`;\r
\r
type RippleTrigger = 'hover' | 'click' | 'both';\r
type RippleQuality = 'low' | 'medium' | 'high';\r
\r
export interface RippleDistortionProps {\r
  src?: string;\r
  brushSize?: number;\r
  strength?: number;\r
  swirl?: number;\r
  rings?: number;\r
  spread?: number;\r
  fade?: number;\r
  spacing?: number;\r
  dispersion?: number;\r
  glint?: number;\r
  tint?: string;\r
  tintAmount?: number;\r
  grayscale?: boolean;\r
  highlightColor?: string;\r
  trigger?: RippleTrigger;\r
  clickStrength?: number;\r
  quality?: RippleQuality;\r
  enabled?: boolean;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface WaveConfig {\r
  brushSize: number;\r
  spread: number;\r
  fade: number;\r
  spacing: number;\r
  clickStrength: number;\r
  trigger: RippleTrigger;\r
  enabled: boolean;\r
}\r
\r
interface Wave {\r
  x: number;\r
  y: number;\r
  scale: number;\r
  target: number;\r
  size: number;\r
  opacity: number;\r
}\r
\r
interface CompositeUniforms {\r
  uTexture: { value: Texture };\r
  uDisplacement: { value: Texture };\r
  uResolution: { value: [number, number] };\r
  uTextureSize: { value: [number, number] };\r
  uTexel: { value: [number, number] };\r
  uTint: { value: [number, number, number] };\r
  uHighlight: { value: [number, number, number] };\r
  uStrength: { value: number };\r
  uSwirl: { value: number };\r
  uDispersion: { value: number };\r
  uGlint: { value: number };\r
  uTintAmount: { value: number };\r
  uGrayscale: { value: number };\r
  [key: string]: { value: unknown };\r
}\r
\r
interface WaveUniforms {\r
  uRings: { value: number };\r
  [key: string]: { value: unknown };\r
}\r
\r
interface RippleUniforms {\r
  wave: WaveUniforms;\r
  composite: CompositeUniforms;\r
}\r
\r
const hexToRGB = (hex: string): [number, number, number] => {\r
  const clean = hex.replace('#', '');\r
  const full =\r
    clean.length === 3\r
      ? clean\r
          .split('')\r
          .map(c => c + c)\r
          .join('')\r
      : clean;\r
  const n = parseInt(full, 16);\r
  if (Number.isNaN(n)) return [1, 1, 1];\r
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];\r
};\r
\r
const RippleDistortion = ({\r
  src = 'https://images.unsplash.com/photo-1782977389500-dd7adad33ebe?q=80&w=3416&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',\r
  brushSize = 150,\r
  strength = 0.2,\r
  swirl = 1,\r
  rings = 4,\r
  spread = 5,\r
  fade = 3,\r
  spacing = 15,\r
  dispersion = 0,\r
  glint = 0,\r
  tint = '#a855f7',\r
  tintAmount = 0.1,\r
  grayscale = true,\r
  highlightColor = '#ffffff',\r
  trigger = 'hover',\r
  clickStrength = 2,\r
  quality = 'low',\r
  enabled = true,\r
  className = '',\r
  style\r
}: RippleDistortionProps) => {\r
  const mountRef = useRef<HTMLDivElement | null>(null);\r
  const configRef = useRef<WaveConfig>({} as WaveConfig);\r
  const uniformsRef = useRef<RippleUniforms | null>(null);\r
\r
  configRef.current = { brushSize, spread, fade, spacing, clickStrength, trigger, enabled };\r
\r
  useEffect(() => {\r
    const mount = mountRef.current;\r
    if (!mount) return;\r
\r
    const reduceMotion =\r
      typeof window !== 'undefined' &&\r
      window.matchMedia &&\r
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
\r
    const renderer = new Renderer({\r
      alpha: false,\r
      antialias: false,\r
      dpr: Math.min(window.devicePixelRatio || 1, 2)\r
    });\r
    const gl = renderer.gl;\r
    gl.clearColor(0, 0, 0, 1);\r
    const canvas = gl.canvas;\r
    canvas.style.width = '100%';\r
    canvas.style.height = '100%';\r
    canvas.style.display = 'block';\r
    mount.appendChild(canvas);\r
\r
    const imageTexture = new Texture(gl, {\r
      generateMipmaps: false,\r
      minFilter: gl.LINEAR,\r
      magFilter: gl.LINEAR,\r
      wrapS: gl.CLAMP_TO_EDGE,\r
      wrapT: gl.CLAMP_TO_EDGE\r
    });\r
\r
    let disposed = false;\r
    const image = new window.Image();\r
    image.crossOrigin = 'anonymous';\r
    image.decoding = 'async';\r
    image.onload = () => {\r
      if (disposed) return;\r
      imageTexture.image = image;\r
      compositeUniforms.uTextureSize.value = [image.naturalWidth || 1, image.naturalHeight || 1];\r
    };\r
    image.src = src;\r
\r
    const offsets = new Float32Array(MAX_WAVES * 2);\r
    const scales = new Float32Array(MAX_WAVES * 2);\r
    const opacities = new Float32Array(MAX_WAVES);\r
\r
    const waves: Wave[] = Array.from({ length: MAX_WAVES }, () => ({\r
      x: 0,\r
      y: 0,\r
      scale: START_SCALE,\r
      target: START_SCALE,\r
      size: 1,\r
      opacity: 0\r
    }));\r
    let current = 0;\r
\r
    const geometry = new Geometry(gl, {\r
      position: { size: 2, data: new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]) },\r
      uv: { size: 2, data: new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]) },\r
      iOffset: { instanced: 1, size: 2, data: offsets },\r
      iScale: { instanced: 1, size: 2, data: scales },\r
      iOpacity: { instanced: 1, size: 1, data: opacities }\r
    });\r
\r
    const waveUniforms: WaveUniforms = { uRings: { value: rings } };\r
    const waveProgram = new Program(gl, {\r
      vertex: waveVertex,\r
      fragment: waveFragment,\r
      uniforms: waveUniforms,\r
      transparent: true,\r
      depthTest: false,\r
      depthWrite: false,\r
      cullFace: false\r
    });\r
    waveProgram.setBlendFunc(gl.ONE, gl.ONE);\r
    const waveMesh = new Mesh(gl, { geometry, program: waveProgram, frustumCulled: false });\r
\r
    const displacementTarget = new RenderTarget(gl, {\r
      width: 2,\r
      height: 2,\r
      depth: false,\r
      minFilter: gl.LINEAR,\r
      magFilter: gl.LINEAR,\r
      wrapS: gl.CLAMP_TO_EDGE,\r
      wrapT: gl.CLAMP_TO_EDGE\r
    });\r
\r
    const compositeUniforms: CompositeUniforms = {\r
      uTexture: { value: imageTexture },\r
      uDisplacement: { value: displacementTarget.texture },\r
      uResolution: { value: [1, 1] },\r
      uTextureSize: { value: [1, 1] },\r
      uTexel: { value: [1, 1] },\r
      uTint: { value: hexToRGB(tint) },\r
      uHighlight: { value: hexToRGB(highlightColor) },\r
      uStrength: { value: strength },\r
      uSwirl: { value: swirl },\r
      uDispersion: { value: dispersion },\r
      uGlint: { value: glint },\r
      uTintAmount: { value: tintAmount },\r
      uGrayscale: { value: grayscale ? 1 : 0 }\r
    };\r
\r
    const compositeMesh = new Mesh(gl, {\r
      geometry: new Triangle(gl),\r
      program: new Program(gl, {\r
        vertex: screenVertex,\r
        fragment: compositeFragment,\r
        uniforms: compositeUniforms,\r
        depthTest: false,\r
        depthWrite: false\r
      })\r
    });\r
\r
    uniformsRef.current = { wave: waveUniforms, composite: compositeUniforms };\r
\r
    let width = 1;\r
    let height = 1;\r
\r
    const resize = () => {\r
      width = Math.max(1, mount.clientWidth);\r
      height = Math.max(1, mount.clientHeight);\r
      renderer.setSize(width, height);\r
      compositeUniforms.uResolution.value = [width, height];\r
\r
      const scale = QUALITY_SCALE[quality] || QUALITY_SCALE.high;\r
      const fieldW = Math.max(2, Math.round(width * scale));\r
      const fieldH = Math.max(2, Math.round(height * scale));\r
      displacementTarget.setSize(fieldW, fieldH);\r
      compositeUniforms.uTexel.value = [1 / fieldW, 1 / fieldH];\r
    };\r
\r
    const ro = new ResizeObserver(resize);\r
    ro.observe(mount);\r
    resize();\r
\r
    const setNewWave = (x: number, y: number, power: number) => {\r
      const cfg = configRef.current;\r
      const wave = waves[current];\r
      current = (current + 1) % MAX_WAVES;\r
      wave.x = x;\r
      wave.y = y;\r
      wave.scale = START_SCALE * power;\r
      wave.target = START_SCALE * Math.max(1, cfg.spread) * power;\r
      wave.size = Math.max(1, cfg.brushSize);\r
      wave.opacity = 1;\r
    };\r
\r
    const localPoint = (clientX: number, clientY: number): [number, number] | null => {\r
      const rect = mount.getBoundingClientRect();\r
      if (rect.width === 0 || rect.height === 0) return null;\r
      if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {\r
        return null;\r
      }\r
      return [clientX - rect.left, rect.height - (clientY - rect.top)];\r
    };\r
\r
    let previousX = 0;\r
    let previousY = 0;\r
\r
    const onMove = (event: PointerEvent) => {\r
      const cfg = configRef.current;\r
      if (!cfg.enabled || reduceMotion || cfg.trigger === 'click') return;\r
      const point = localPoint(event.clientX, event.clientY);\r
      if (!point) return;\r
      const step = Math.max(1, cfg.spacing);\r
      if (Math.abs(point[0] - previousX) > step || Math.abs(point[1] - previousY) > step) {\r
        setNewWave(point[0], point[1], 1);\r
        previousX = point[0];\r
        previousY = point[1];\r
      }\r
    };\r
\r
    const onDown = (event: PointerEvent) => {\r
      const cfg = configRef.current;\r
      if (!cfg.enabled || reduceMotion || cfg.trigger === 'hover') return;\r
      const point = localPoint(event.clientX, event.clientY);\r
      if (!point) return;\r
      setNewWave(point[0], point[1], Math.max(1, cfg.clickStrength));\r
    };\r
\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    window.addEventListener('pointerdown', onDown, { passive: true });\r
\r
    let raf = 0;\r
    let previousTime = 0;\r
\r
    const loop = (now: number) => {\r
      raf = requestAnimationFrame(loop);\r
      const delta = previousTime ? Math.min(0.05, (now - previousTime) / 1000) : 0;\r
      previousTime = now;\r
      const cfg = configRef.current;\r
\r
      const growth = reduceMotion ? 0 : 1 - Math.exp(-delta * 1.09);\r
      const decay = reduceMotion ? 1 : Math.exp((-delta * LIFE_CONSTANT) / Math.max(0.15, cfg.fade));\r
\r
      for (let i = 0; i < MAX_WAVES; i += 1) {\r
        const wave = waves[i];\r
        if (wave.opacity <= 0) {\r
          opacities[i] = 0;\r
          continue;\r
        }\r
\r
        wave.opacity *= decay;\r
        wave.scale += (wave.target - wave.scale) * growth;\r
\r
        if (wave.opacity < 0.002) {\r
          wave.opacity = 0;\r
          opacities[i] = 0;\r
          continue;\r
        }\r
\r
        const half = (wave.scale * wave.size) / 2;\r
        offsets[i * 2] = (wave.x / width) * 2 - 1;\r
        offsets[i * 2 + 1] = (wave.y / height) * 2 - 1;\r
        scales[i * 2] = (half / width) * 2;\r
        scales[i * 2 + 1] = (half / height) * 2;\r
        opacities[i] = wave.opacity;\r
      }\r
\r
      geometry.attributes.iOffset.needsUpdate = true;\r
      geometry.attributes.iScale.needsUpdate = true;\r
      geometry.attributes.iOpacity.needsUpdate = true;\r
\r
      renderer.render({ scene: waveMesh, target: displacementTarget, clear: true });\r
      renderer.render({ scene: compositeMesh });\r
    };\r
    raf = requestAnimationFrame(loop);\r
\r
    return () => {\r
      disposed = true;\r
      cancelAnimationFrame(raf);\r
      ro.disconnect();\r
      window.removeEventListener('pointermove', onMove);\r
      window.removeEventListener('pointerdown', onDown);\r
      uniformsRef.current = null;\r
      if (canvas.parentNode === mount) mount.removeChild(canvas);\r
      const ext = gl.getExtension('WEBGL_lose_context');\r
      if (ext) ext.loseContext();\r
    };\r
    // eslint-disable-next-line react-hooks/exhaustive-deps\r
  }, [src, quality]);\r
\r
  useEffect(() => {\r
    const u = uniformsRef.current;\r
    if (!u) return;\r
    u.wave.uRings.value = rings;\r
    u.composite.uStrength.value = strength;\r
    u.composite.uSwirl.value = swirl;\r
    u.composite.uDispersion.value = dispersion;\r
    u.composite.uGlint.value = glint;\r
    u.composite.uTintAmount.value = tintAmount;\r
    u.composite.uGrayscale.value = grayscale ? 1 : 0;\r
    u.composite.uHighlight.value = hexToRGB(highlightColor);\r
    u.composite.uTint.value = hexToRGB(tint);\r
  }, [rings, strength, swirl, dispersion, glint, tintAmount, grayscale, highlightColor, tint]);\r
\r
  return <div ref={mountRef} className={\`ripple-distortion \${className}\`.trim()} style={style} />;\r
};\r
\r
export default RippleDistortion;\r
`,i=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
import type { CSSProperties } from 'react';\r
import { Renderer, Program, Mesh, Geometry, Triangle, Texture, RenderTarget } from 'ogl';\r
\r
const MAX_WAVES = 100;\r
const QUALITY_SCALE: Record<string, number> = { low: 0.4, medium: 0.7, high: 1 };\r
const START_SCALE = 1.5;\r
const LIFE_CONSTANT = Math.log(500);\r
\r
const waveVertex = \`\r
precision highp float;\r
\r
attribute vec2 position;\r
attribute vec2 uv;\r
attribute vec2 iOffset;\r
attribute vec2 iScale;\r
attribute float iOpacity;\r
\r
varying vec2 vUv;\r
varying float vOpacity;\r
\r
void main() {\r
  vUv = uv;\r
  vOpacity = iOpacity;\r
  gl_Position = vec4(iOffset + position * iScale, 0.0, 1.0);\r
}\r
\`;\r
\r
const waveFragment = \`\r
precision highp float;\r
\r
varying vec2 vUv;\r
varying float vOpacity;\r
\r
uniform float uRings;\r
\r
const float PI = 3.141592653589793;\r
const float EDGE = 0.006737947;\r
\r
void main() {\r
  vec2 p = vUv * 2.0 - 1.0;\r
  float r = dot(p, p);\r
  if (r > 1.0) discard;\r
\r
  float brush = (exp(-r * 5.0) - EDGE) / (1.0 - EDGE);\r
\r
  brush *= 0.55 + 0.45 * cos(sqrt(r) * PI * 2.0 * uRings);\r
\r
  gl_FragColor = vec4(vec3(brush * vOpacity * vOpacity), 1.0);\r
}\r
\`;\r
\r
const screenVertex = \`\r
precision highp float;\r
attribute vec2 position;\r
attribute vec2 uv;\r
varying vec2 vUv;\r
void main() {\r
  vUv = uv;\r
  gl_Position = vec4(position, 0.0, 1.0);\r
}\r
\`;\r
\r
const compositeFragment = \`\r
precision highp float;\r
\r
varying vec2 vUv;\r
\r
uniform sampler2D uTexture;\r
uniform sampler2D uDisplacement;\r
uniform vec2 uResolution;\r
uniform vec2 uTextureSize;\r
uniform vec2 uTexel;\r
uniform vec3 uTint;\r
uniform vec3 uHighlight;\r
uniform float uStrength;\r
uniform float uSwirl;\r
uniform float uDispersion;\r
uniform float uGlint;\r
uniform float uTintAmount;\r
uniform float uGrayscale;\r
\r
const float TAU = 6.283185307179586;\r
\r
vec2 coverUV(vec2 uv) {\r
  vec2 safe = max(uTextureSize, vec2(1.0));\r
  vec2 s = uResolution / safe;\r
  vec2 scaledSize = safe * max(s.x, s.y);\r
  vec2 offset = (uResolution - scaledSize) * 0.5;\r
  return (uv * uResolution - offset) / scaledSize;\r
}\r
\r
void main() {\r
  float amount = texture2D(uDisplacement, vUv).r;\r
  vec2 base = coverUV(vUv);\r
\r
  float theta = amount * uSwirl * TAU;\r
  vec2 dir = vec2(sin(theta), cos(theta));\r
  vec2 push = dir * amount * uStrength;\r
\r
  vec3 color;\r
  if (uDispersion > 0.001) {\r
    float split = uDispersion * 0.25;\r
    color.r = texture2D(uTexture, base + push * (1.0 + split)).r;\r
    color.g = texture2D(uTexture, base + push).g;\r
    color.b = texture2D(uTexture, base + push * (1.0 - split)).b;\r
  } else {\r
    color = texture2D(uTexture, base + push).rgb;\r
  }\r
\r
  if (uGrayscale > 0.001) {\r
    color = mix(color, vec3(dot(color, vec3(0.2126, 0.7152, 0.0722))), uGrayscale);\r
  }\r
\r
  if (uTintAmount > 0.001) {\r
    color = mix(color, color * uTint * 1.9, clamp(amount * 1.6, 0.0, 1.0) * uTintAmount);\r
  }\r
\r
  if (uGlint > 0.001) {\r
    float ex = texture2D(uDisplacement, vUv + vec2(uTexel.x, 0.0)).r - texture2D(uDisplacement, vUv - vec2(uTexel.x, 0.0)).r;\r
    float ey = texture2D(uDisplacement, vUv + vec2(0.0, uTexel.y)).r - texture2D(uDisplacement, vUv - vec2(0.0, uTexel.y)).r;\r
    vec3 normal = normalize(vec3(-ex * 26.0, -ey * 26.0, 1.0));\r
    vec3 light = normalize(vec3(-0.35, 0.55, 1.0));\r
    float raw = pow(max(dot(normal, light), 0.0), 22.0);\r
    float flatSpec = pow(max(light.z, 0.0), 22.0);\r
    color += uHighlight * clamp((raw - flatSpec) / max(1.0 - flatSpec, 0.0001), 0.0, 1.0) * uGlint;\r
  }\r
\r
  gl_FragColor = vec4(color, 1.0);\r
}\r
\`;\r
\r
type RippleTrigger = 'hover' | 'click' | 'both';\r
type RippleQuality = 'low' | 'medium' | 'high';\r
\r
export interface RippleDistortionProps {\r
  src?: string;\r
  brushSize?: number;\r
  strength?: number;\r
  swirl?: number;\r
  rings?: number;\r
  spread?: number;\r
  fade?: number;\r
  spacing?: number;\r
  dispersion?: number;\r
  glint?: number;\r
  tint?: string;\r
  tintAmount?: number;\r
  grayscale?: boolean;\r
  highlightColor?: string;\r
  trigger?: RippleTrigger;\r
  clickStrength?: number;\r
  quality?: RippleQuality;\r
  enabled?: boolean;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface WaveConfig {\r
  brushSize: number;\r
  spread: number;\r
  fade: number;\r
  spacing: number;\r
  clickStrength: number;\r
  trigger: RippleTrigger;\r
  enabled: boolean;\r
}\r
\r
interface Wave {\r
  x: number;\r
  y: number;\r
  scale: number;\r
  target: number;\r
  size: number;\r
  opacity: number;\r
}\r
\r
interface CompositeUniforms {\r
  uTexture: { value: Texture };\r
  uDisplacement: { value: Texture };\r
  uResolution: { value: [number, number] };\r
  uTextureSize: { value: [number, number] };\r
  uTexel: { value: [number, number] };\r
  uTint: { value: [number, number, number] };\r
  uHighlight: { value: [number, number, number] };\r
  uStrength: { value: number };\r
  uSwirl: { value: number };\r
  uDispersion: { value: number };\r
  uGlint: { value: number };\r
  uTintAmount: { value: number };\r
  uGrayscale: { value: number };\r
  [key: string]: { value: unknown };\r
}\r
\r
interface WaveUniforms {\r
  uRings: { value: number };\r
  [key: string]: { value: unknown };\r
}\r
\r
interface RippleUniforms {\r
  wave: WaveUniforms;\r
  composite: CompositeUniforms;\r
}\r
\r
const hexToRGB = (hex: string): [number, number, number] => {\r
  const clean = hex.replace('#', '');\r
  const full =\r
    clean.length === 3\r
      ? clean\r
          .split('')\r
          .map(c => c + c)\r
          .join('')\r
      : clean;\r
  const n = parseInt(full, 16);\r
  if (Number.isNaN(n)) return [1, 1, 1];\r
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];\r
};\r
\r
const RippleDistortion = ({\r
  src = 'https://images.unsplash.com/photo-1782977389500-dd7adad33ebe?q=80&w=3416&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',\r
  brushSize = 150,\r
  strength = 0.2,\r
  swirl = 1,\r
  rings = 4,\r
  spread = 5,\r
  fade = 3,\r
  spacing = 15,\r
  dispersion = 0,\r
  glint = 0,\r
  tint = '#a855f7',\r
  tintAmount = 0.1,\r
  grayscale = true,\r
  highlightColor = '#ffffff',\r
  trigger = 'hover',\r
  clickStrength = 2,\r
  quality = 'low',\r
  enabled = true,\r
  className = '',\r
  style\r
}: RippleDistortionProps) => {\r
  const mountRef = useRef<HTMLDivElement | null>(null);\r
  const configRef = useRef<WaveConfig>({} as WaveConfig);\r
  const uniformsRef = useRef<RippleUniforms | null>(null);\r
\r
  configRef.current = { brushSize, spread, fade, spacing, clickStrength, trigger, enabled };\r
\r
  useEffect(() => {\r
    const mount = mountRef.current;\r
    if (!mount) return;\r
\r
    const reduceMotion =\r
      typeof window !== 'undefined' &&\r
      window.matchMedia &&\r
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
\r
    const renderer = new Renderer({\r
      alpha: false,\r
      antialias: false,\r
      dpr: Math.min(window.devicePixelRatio || 1, 2)\r
    });\r
    const gl = renderer.gl;\r
    gl.clearColor(0, 0, 0, 1);\r
    const canvas = gl.canvas;\r
    canvas.style.width = '100%';\r
    canvas.style.height = '100%';\r
    canvas.style.display = 'block';\r
    mount.appendChild(canvas);\r
\r
    const imageTexture = new Texture(gl, {\r
      generateMipmaps: false,\r
      minFilter: gl.LINEAR,\r
      magFilter: gl.LINEAR,\r
      wrapS: gl.CLAMP_TO_EDGE,\r
      wrapT: gl.CLAMP_TO_EDGE\r
    });\r
\r
    let disposed = false;\r
    const image = new window.Image();\r
    image.crossOrigin = 'anonymous';\r
    image.decoding = 'async';\r
    image.onload = () => {\r
      if (disposed) return;\r
      imageTexture.image = image;\r
      compositeUniforms.uTextureSize.value = [image.naturalWidth || 1, image.naturalHeight || 1];\r
    };\r
    image.src = src;\r
\r
    const offsets = new Float32Array(MAX_WAVES * 2);\r
    const scales = new Float32Array(MAX_WAVES * 2);\r
    const opacities = new Float32Array(MAX_WAVES);\r
\r
    const waves: Wave[] = Array.from({ length: MAX_WAVES }, () => ({\r
      x: 0,\r
      y: 0,\r
      scale: START_SCALE,\r
      target: START_SCALE,\r
      size: 1,\r
      opacity: 0\r
    }));\r
    let current = 0;\r
\r
    const geometry = new Geometry(gl, {\r
      position: { size: 2, data: new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]) },\r
      uv: { size: 2, data: new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]) },\r
      iOffset: { instanced: 1, size: 2, data: offsets },\r
      iScale: { instanced: 1, size: 2, data: scales },\r
      iOpacity: { instanced: 1, size: 1, data: opacities }\r
    });\r
\r
    const waveUniforms: WaveUniforms = { uRings: { value: rings } };\r
    const waveProgram = new Program(gl, {\r
      vertex: waveVertex,\r
      fragment: waveFragment,\r
      uniforms: waveUniforms,\r
      transparent: true,\r
      depthTest: false,\r
      depthWrite: false,\r
      cullFace: false\r
    });\r
    waveProgram.setBlendFunc(gl.ONE, gl.ONE);\r
    const waveMesh = new Mesh(gl, { geometry, program: waveProgram, frustumCulled: false });\r
\r
    const displacementTarget = new RenderTarget(gl, {\r
      width: 2,\r
      height: 2,\r
      depth: false,\r
      minFilter: gl.LINEAR,\r
      magFilter: gl.LINEAR,\r
      wrapS: gl.CLAMP_TO_EDGE,\r
      wrapT: gl.CLAMP_TO_EDGE\r
    });\r
\r
    const compositeUniforms: CompositeUniforms = {\r
      uTexture: { value: imageTexture },\r
      uDisplacement: { value: displacementTarget.texture },\r
      uResolution: { value: [1, 1] },\r
      uTextureSize: { value: [1, 1] },\r
      uTexel: { value: [1, 1] },\r
      uTint: { value: hexToRGB(tint) },\r
      uHighlight: { value: hexToRGB(highlightColor) },\r
      uStrength: { value: strength },\r
      uSwirl: { value: swirl },\r
      uDispersion: { value: dispersion },\r
      uGlint: { value: glint },\r
      uTintAmount: { value: tintAmount },\r
      uGrayscale: { value: grayscale ? 1 : 0 }\r
    };\r
\r
    const compositeMesh = new Mesh(gl, {\r
      geometry: new Triangle(gl),\r
      program: new Program(gl, {\r
        vertex: screenVertex,\r
        fragment: compositeFragment,\r
        uniforms: compositeUniforms,\r
        depthTest: false,\r
        depthWrite: false\r
      })\r
    });\r
\r
    uniformsRef.current = { wave: waveUniforms, composite: compositeUniforms };\r
\r
    let width = 1;\r
    let height = 1;\r
\r
    const resize = () => {\r
      width = Math.max(1, mount.clientWidth);\r
      height = Math.max(1, mount.clientHeight);\r
      renderer.setSize(width, height);\r
      compositeUniforms.uResolution.value = [width, height];\r
\r
      const scale = QUALITY_SCALE[quality] || QUALITY_SCALE.high;\r
      const fieldW = Math.max(2, Math.round(width * scale));\r
      const fieldH = Math.max(2, Math.round(height * scale));\r
      displacementTarget.setSize(fieldW, fieldH);\r
      compositeUniforms.uTexel.value = [1 / fieldW, 1 / fieldH];\r
    };\r
\r
    const ro = new ResizeObserver(resize);\r
    ro.observe(mount);\r
    resize();\r
\r
    const setNewWave = (x: number, y: number, power: number) => {\r
      const cfg = configRef.current;\r
      const wave = waves[current];\r
      current = (current + 1) % MAX_WAVES;\r
      wave.x = x;\r
      wave.y = y;\r
      wave.scale = START_SCALE * power;\r
      wave.target = START_SCALE * Math.max(1, cfg.spread) * power;\r
      wave.size = Math.max(1, cfg.brushSize);\r
      wave.opacity = 1;\r
    };\r
\r
    const localPoint = (clientX: number, clientY: number): [number, number] | null => {\r
      const rect = mount.getBoundingClientRect();\r
      if (rect.width === 0 || rect.height === 0) return null;\r
      if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {\r
        return null;\r
      }\r
      return [clientX - rect.left, rect.height - (clientY - rect.top)];\r
    };\r
\r
    let previousX = 0;\r
    let previousY = 0;\r
\r
    const onMove = (event: PointerEvent) => {\r
      const cfg = configRef.current;\r
      if (!cfg.enabled || reduceMotion || cfg.trigger === 'click') return;\r
      const point = localPoint(event.clientX, event.clientY);\r
      if (!point) return;\r
      const step = Math.max(1, cfg.spacing);\r
      if (Math.abs(point[0] - previousX) > step || Math.abs(point[1] - previousY) > step) {\r
        setNewWave(point[0], point[1], 1);\r
        previousX = point[0];\r
        previousY = point[1];\r
      }\r
    };\r
\r
    const onDown = (event: PointerEvent) => {\r
      const cfg = configRef.current;\r
      if (!cfg.enabled || reduceMotion || cfg.trigger === 'hover') return;\r
      const point = localPoint(event.clientX, event.clientY);\r
      if (!point) return;\r
      setNewWave(point[0], point[1], Math.max(1, cfg.clickStrength));\r
    };\r
\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    window.addEventListener('pointerdown', onDown, { passive: true });\r
\r
    let raf = 0;\r
    let previousTime = 0;\r
\r
    const loop = (now: number) => {\r
      raf = requestAnimationFrame(loop);\r
      const delta = previousTime ? Math.min(0.05, (now - previousTime) / 1000) : 0;\r
      previousTime = now;\r
      const cfg = configRef.current;\r
\r
      const growth = reduceMotion ? 0 : 1 - Math.exp(-delta * 1.09);\r
      const decay = reduceMotion ? 1 : Math.exp((-delta * LIFE_CONSTANT) / Math.max(0.15, cfg.fade));\r
\r
      for (let i = 0; i < MAX_WAVES; i += 1) {\r
        const wave = waves[i];\r
        if (wave.opacity <= 0) {\r
          opacities[i] = 0;\r
          continue;\r
        }\r
\r
        wave.opacity *= decay;\r
        wave.scale += (wave.target - wave.scale) * growth;\r
\r
        if (wave.opacity < 0.002) {\r
          wave.opacity = 0;\r
          opacities[i] = 0;\r
          continue;\r
        }\r
\r
        const half = (wave.scale * wave.size) / 2;\r
        offsets[i * 2] = (wave.x / width) * 2 - 1;\r
        offsets[i * 2 + 1] = (wave.y / height) * 2 - 1;\r
        scales[i * 2] = (half / width) * 2;\r
        scales[i * 2 + 1] = (half / height) * 2;\r
        opacities[i] = wave.opacity;\r
      }\r
\r
      geometry.attributes.iOffset.needsUpdate = true;\r
      geometry.attributes.iScale.needsUpdate = true;\r
      geometry.attributes.iOpacity.needsUpdate = true;\r
\r
      renderer.render({ scene: waveMesh, target: displacementTarget, clear: true });\r
      renderer.render({ scene: compositeMesh });\r
    };\r
    raf = requestAnimationFrame(loop);\r
\r
    return () => {\r
      disposed = true;\r
      cancelAnimationFrame(raf);\r
      ro.disconnect();\r
      window.removeEventListener('pointermove', onMove);\r
      window.removeEventListener('pointerdown', onDown);\r
      uniformsRef.current = null;\r
      if (canvas.parentNode === mount) mount.removeChild(canvas);\r
      const ext = gl.getExtension('WEBGL_lose_context');\r
      if (ext) ext.loseContext();\r
    };\r
    // eslint-disable-next-line react-hooks/exhaustive-deps\r
  }, [src, quality]);\r
\r
  useEffect(() => {\r
    const u = uniformsRef.current;\r
    if (!u) return;\r
    u.wave.uRings.value = rings;\r
    u.composite.uStrength.value = strength;\r
    u.composite.uSwirl.value = swirl;\r
    u.composite.uDispersion.value = dispersion;\r
    u.composite.uGlint.value = glint;\r
    u.composite.uTintAmount.value = tintAmount;\r
    u.composite.uGrayscale.value = grayscale ? 1 : 0;\r
    u.composite.uHighlight.value = hexToRGB(highlightColor);\r
    u.composite.uTint.value = hexToRGB(tint);\r
  }, [rings, strength, swirl, dispersion, glint, tintAmount, grayscale, highlightColor, tint]);\r
\r
  return (\r
    <div\r
      ref={mountRef}\r
      className={\`relative w-full h-full overflow-hidden bg-black [&>canvas]:block [&>canvas]:w-full [&>canvas]:h-full \${className}\`.trim()}\r
      style={style}\r
    />\r
  );\r
};\r
\r
export default RippleDistortion;\r
`,o={dependencies:"ogl",usage:`import RippleDistortion from './RippleDistortion';

<div style={{ width: '600px', height: '400px' }}>
  <RippleDistortion
    src="/hero.jpg"
    brushSize={150}
    strength={0.2}
    swirl={1}
    rings={4}
    grayscale
  />
</div>`,code:n,css:r,tailwind:e,tsCode:t,tsTailwind:i};export{o as rippleDistortion};
