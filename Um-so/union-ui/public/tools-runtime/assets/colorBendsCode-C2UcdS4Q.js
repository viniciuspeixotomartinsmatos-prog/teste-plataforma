const r=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
import * as THREE from 'three';\r
import './ColorBends.css';\r
\r
const MAX_COLORS = 8;\r
\r
const frag = \`\r
#define MAX_COLORS \${MAX_COLORS}\r
uniform vec2 uCanvas;\r
uniform float uTime;\r
uniform float uSpeed;\r
uniform vec2 uRot;\r
uniform int uColorCount;\r
uniform vec3 uColors[MAX_COLORS];\r
uniform int uTransparent;\r
uniform float uScale;\r
uniform float uFrequency;\r
uniform float uWarpStrength;\r
uniform vec2 uPointer; // in NDC [-1,1]\r
uniform float uMouseInfluence;\r
uniform float uParallax;\r
uniform float uNoise;\r
uniform int uIterations;\r
uniform float uIntensity;\r
uniform float uBandWidth;\r
varying vec2 vUv;\r
\r
void main() {\r
  float t = uTime * uSpeed;\r
  vec2 p = vUv * 2.0 - 1.0;\r
  p += uPointer * uParallax * 0.1;\r
  vec2 rp = vec2(p.x * uRot.x - p.y * uRot.y, p.x * uRot.y + p.y * uRot.x);\r
  vec2 q = vec2(rp.x * (uCanvas.x / uCanvas.y), rp.y);\r
  q /= max(uScale, 0.0001);\r
  q /= 0.5 + 0.2 * dot(q, q);\r
  q += 0.2 * cos(t) - 7.56;\r
  vec2 toward = (uPointer - rp);\r
  q += toward * uMouseInfluence * 0.2;\r
\r
    for (int j = 0; j < 5; j++) {\r
      if (j >= uIterations - 1) break;\r
      vec2 rr = sin(1.5 * (q.yx * uFrequency) + 2.0 * cos(q * uFrequency));\r
      q += (rr - q) * 0.15;\r
    }\r
\r
    vec3 col = vec3(0.0);\r
    float a = 1.0;\r
\r
    if (uColorCount > 0) {\r
      vec2 s = q;\r
      vec3 sumCol = vec3(0.0);\r
      float cover = 0.0;\r
      for (int i = 0; i < MAX_COLORS; ++i) {\r
            if (i >= uColorCount) break;\r
            s -= 0.01;\r
            vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));\r
            float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(i)) / 4.0);\r
            float kBelow = clamp(uWarpStrength, 0.0, 1.0);\r
            float kMix = pow(kBelow, 0.3); // strong response across 0..1\r
            float gain = 1.0 + max(uWarpStrength - 1.0, 0.0); // allow >1 to amplify displacement\r
            vec2 disp = (r - s) * kBelow;\r
            vec2 warped = s + disp * gain;\r
            float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(i)) / 4.0);\r
            float m = mix(m0, m1, kMix);\r
            float w = 1.0 - exp(-uBandWidth / exp(uBandWidth * m));\r
            sumCol += uColors[i] * w;\r
            cover = max(cover, w);\r
      }\r
      col = clamp(sumCol, 0.0, 1.0);\r
      a = uTransparent > 0 ? cover : 1.0;\r
    } else {\r
        vec2 s = q;\r
        for (int k = 0; k < 3; ++k) {\r
            s -= 0.01;\r
            vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));\r
            float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(k)) / 4.0);\r
            float kBelow = clamp(uWarpStrength, 0.0, 1.0);\r
            float kMix = pow(kBelow, 0.3);\r
            float gain = 1.0 + max(uWarpStrength - 1.0, 0.0);\r
            vec2 disp = (r - s) * kBelow;\r
            vec2 warped = s + disp * gain;\r
            float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(k)) / 4.0);\r
            float m = mix(m0, m1, kMix);\r
            col[k] = 1.0 - exp(-uBandWidth / exp(uBandWidth * m));\r
        }\r
        a = uTransparent > 0 ? max(max(col.r, col.g), col.b) : 1.0;\r
    }\r
\r
    col *= uIntensity;\r
\r
    if (uNoise > 0.0001) {\r
      float n = fract(sin(dot(gl_FragCoord.xy + vec2(uTime), vec2(12.9898, 78.233))) * 43758.5453123);\r
      col += (n - 0.5) * uNoise;\r
      col = clamp(col, 0.0, 1.0);\r
    }\r
\r
    vec3 rgb = (uTransparent > 0) ? col * a : col;\r
    gl_FragColor = vec4(rgb, a);\r
}\r
\`;\r
\r
const vert = \`\r
varying vec2 vUv;\r
void main() {\r
  vUv = uv;\r
  gl_Position = vec4(position, 1.0);\r
}\r
\`;\r
\r
export default function ColorBends({\r
  className,\r
  style,\r
  rotation = 90,\r
  speed = 0.2,\r
  colors = [],\r
  transparent = true,\r
  autoRotate = 0,\r
  scale = 1,\r
  frequency = 1,\r
  warpStrength = 1,\r
  mouseInfluence = 1,\r
  parallax = 0.5,\r
  noise = 0.15,\r
  iterations = 1,\r
  intensity = 1.5,\r
  bandWidth = 6\r
}) {\r
  const containerRef = useRef(null);\r
  const rendererRef = useRef(null);\r
  const rafRef = useRef(null);\r
  const materialRef = useRef(null);\r
  const resizeObserverRef = useRef(null);\r
  const rotationRef = useRef(rotation);\r
  const autoRotateRef = useRef(autoRotate);\r
  const pointerTargetRef = useRef(new THREE.Vector2(0, 0));\r
  const pointerCurrentRef = useRef(new THREE.Vector2(0, 0));\r
  const pointerSmoothRef = useRef(8);\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const scene = new THREE.Scene();\r
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);\r
\r
    const geometry = new THREE.PlaneGeometry(2, 2);\r
    const uColorsArray = Array.from({ length: MAX_COLORS }, () => new THREE.Vector3(0, 0, 0));\r
    const material = new THREE.ShaderMaterial({\r
      vertexShader: vert,\r
      fragmentShader: frag,\r
      uniforms: {\r
        uCanvas: { value: new THREE.Vector2(1, 1) },\r
        uTime: { value: 0 },\r
        uSpeed: { value: speed },\r
        uRot: { value: new THREE.Vector2(1, 0) },\r
        uColorCount: { value: 0 },\r
        uColors: { value: uColorsArray },\r
        uTransparent: { value: transparent ? 1 : 0 },\r
        uScale: { value: scale },\r
        uFrequency: { value: frequency },\r
        uWarpStrength: { value: warpStrength },\r
        uPointer: { value: new THREE.Vector2(0, 0) },\r
        uMouseInfluence: { value: mouseInfluence },\r
        uParallax: { value: parallax },\r
        uNoise: { value: noise },\r
        uIterations: { value: iterations },\r
        uIntensity: { value: intensity },\r
        uBandWidth: { value: bandWidth }\r
      },\r
      premultipliedAlpha: true,\r
      transparent: true\r
    });\r
    materialRef.current = material;\r
\r
    const mesh = new THREE.Mesh(geometry, material);\r
    scene.add(mesh);\r
\r
    const renderer = new THREE.WebGLRenderer({\r
      antialias: false,\r
      powerPreference: 'high-performance',\r
      alpha: true\r
    });\r
    rendererRef.current = renderer;\r
    renderer.outputColorSpace = THREE.SRGBColorSpace;\r
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));\r
    renderer.setClearColor(0x000000, transparent ? 0 : 1);\r
    renderer.domElement.style.width = '100%';\r
    renderer.domElement.style.height = '100%';\r
    renderer.domElement.style.display = 'block';\r
    container.appendChild(renderer.domElement);\r
\r
    const clock = new THREE.Clock();\r
\r
    const handleResize = () => {\r
      const w = container.clientWidth || 1;\r
      const h = container.clientHeight || 1;\r
      renderer.setSize(w, h, false);\r
      material.uniforms.uCanvas.value.set(w, h);\r
    };\r
\r
    handleResize();\r
\r
    if ('ResizeObserver' in window) {\r
      const ro = new ResizeObserver(handleResize);\r
      ro.observe(container);\r
      resizeObserverRef.current = ro;\r
    } else {\r
      window.addEventListener('resize', handleResize);\r
    }\r
\r
    const loop = () => {\r
      const dt = clock.getDelta();\r
      const elapsed = clock.elapsedTime;\r
      material.uniforms.uTime.value = elapsed;\r
\r
      const deg = (rotationRef.current % 360) + autoRotateRef.current * elapsed;\r
      const rad = (deg * Math.PI) / 180;\r
      const c = Math.cos(rad);\r
      const s = Math.sin(rad);\r
      material.uniforms.uRot.value.set(c, s);\r
\r
      const cur = pointerCurrentRef.current;\r
      const tgt = pointerTargetRef.current;\r
      const amt = Math.min(1, dt * pointerSmoothRef.current);\r
      cur.lerp(tgt, amt);\r
      material.uniforms.uPointer.value.copy(cur);\r
      renderer.render(scene, camera);\r
      rafRef.current = requestAnimationFrame(loop);\r
    };\r
    rafRef.current = requestAnimationFrame(loop);\r
\r
    return () => {\r
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);\r
      if (resizeObserverRef.current) resizeObserverRef.current.disconnect();\r
      else window.removeEventListener('resize', handleResize);\r
      geometry.dispose();\r
      material.dispose();\r
      renderer.dispose();\r
      renderer.forceContextLoss();\r
      if (renderer.domElement && renderer.domElement.parentElement === container) {\r
        container.removeChild(renderer.domElement);\r
      }\r
    };\r
  }, [bandWidth, frequency, intensity, iterations, mouseInfluence, noise, parallax, scale, speed, transparent, warpStrength]);\r
\r
  useEffect(() => {\r
    const material = materialRef.current;\r
    const renderer = rendererRef.current;\r
    if (!material) return;\r
\r
    rotationRef.current = rotation;\r
    autoRotateRef.current = autoRotate;\r
    material.uniforms.uSpeed.value = speed;\r
    material.uniforms.uScale.value = scale;\r
    material.uniforms.uFrequency.value = frequency;\r
    material.uniforms.uWarpStrength.value = warpStrength;\r
    material.uniforms.uMouseInfluence.value = mouseInfluence;\r
    material.uniforms.uParallax.value = parallax;\r
    material.uniforms.uNoise.value = noise;\r
    material.uniforms.uIterations.value = iterations;\r
    material.uniforms.uIntensity.value = intensity;\r
    material.uniforms.uBandWidth.value = bandWidth;\r
\r
    const toVec3 = hex => {\r
      const h = hex.replace('#', '').trim();\r
      const v =\r
        h.length === 3\r
          ? [parseInt(h[0] + h[0], 16), parseInt(h[1] + h[1], 16), parseInt(h[2] + h[2], 16)]\r
          : [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];\r
      return new THREE.Vector3(v[0] / 255, v[1] / 255, v[2] / 255);\r
    };\r
\r
    const arr = (colors || []).filter(Boolean).slice(0, MAX_COLORS).map(toVec3);\r
    for (let i = 0; i < MAX_COLORS; i++) {\r
      const vec = material.uniforms.uColors.value[i];\r
      if (i < arr.length) vec.copy(arr[i]);\r
      else vec.set(0, 0, 0);\r
    }\r
    material.uniforms.uColorCount.value = arr.length;\r
\r
    material.uniforms.uTransparent.value = transparent ? 1 : 0;\r
    if (renderer) renderer.setClearColor(0x000000, transparent ? 0 : 1);\r
  }, [\r
    rotation,\r
    autoRotate,\r
    speed,\r
    scale,\r
    frequency,\r
    warpStrength,\r
    mouseInfluence,\r
    parallax,\r
    noise,\r
    iterations,\r
    intensity,\r
    bandWidth,\r
    colors,\r
    transparent\r
  ]);\r
\r
  useEffect(() => {\r
    const material = materialRef.current;\r
    const container = containerRef.current;\r
    if (!material || !container) return;\r
\r
    const handlePointerMove = e => {\r
      const rect = container.getBoundingClientRect();\r
      const x = ((e.clientX - rect.left) / (rect.width || 1)) * 2 - 1;\r
      const y = -(((e.clientY - rect.top) / (rect.height || 1)) * 2 - 1);\r
      pointerTargetRef.current.set(x, y);\r
    };\r
\r
    container.addEventListener('pointermove', handlePointerMove);\r
    return () => {\r
      container.removeEventListener('pointermove', handlePointerMove);\r
    };\r
  }, []);\r
\r
  return <div ref={containerRef} className={\`color-bends-container \${className}\`} style={style} />;\r
}\r
`,n=`.color-bends-container {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
`,e=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
import * as THREE from 'three';\r
\r
const MAX_COLORS = 8;\r
\r
const frag = \`\r
#define MAX_COLORS \${MAX_COLORS}\r
uniform vec2 uCanvas;\r
uniform float uTime;\r
uniform float uSpeed;\r
uniform vec2 uRot;\r
uniform int uColorCount;\r
uniform vec3 uColors[MAX_COLORS];\r
uniform int uTransparent;\r
uniform float uScale;\r
uniform float uFrequency;\r
uniform float uWarpStrength;\r
uniform vec2 uPointer; // in NDC [-1,1]\r
uniform float uMouseInfluence;\r
uniform float uParallax;\r
uniform float uNoise;\r
uniform int uIterations;\r
uniform float uIntensity;\r
uniform float uBandWidth;\r
varying vec2 vUv;\r
\r
void main() {\r
  float t = uTime * uSpeed;\r
  vec2 p = vUv * 2.0 - 1.0;\r
  p += uPointer * uParallax * 0.1;\r
  vec2 rp = vec2(p.x * uRot.x - p.y * uRot.y, p.x * uRot.y + p.y * uRot.x);\r
  vec2 q = vec2(rp.x * (uCanvas.x / uCanvas.y), rp.y);\r
  q /= max(uScale, 0.0001);\r
  q /= 0.5 + 0.2 * dot(q, q);\r
  q += 0.2 * cos(t) - 7.56;\r
  vec2 toward = (uPointer - rp);\r
  q += toward * uMouseInfluence * 0.2;\r
\r
    for (int j = 0; j < 5; j++) {\r
      if (j >= uIterations - 1) break;\r
      vec2 rr = sin(1.5 * (q.yx * uFrequency) + 2.0 * cos(q * uFrequency));\r
      q += (rr - q) * 0.15;\r
    }\r
\r
    vec3 col = vec3(0.0);\r
    float a = 1.0;\r
\r
    if (uColorCount > 0) {\r
      vec2 s = q;\r
      vec3 sumCol = vec3(0.0);\r
      float cover = 0.0;\r
      for (int i = 0; i < MAX_COLORS; ++i) {\r
            if (i >= uColorCount) break;\r
            s -= 0.01;\r
            vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));\r
            float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(i)) / 4.0);\r
            float kBelow = clamp(uWarpStrength, 0.0, 1.0);\r
            float kMix = pow(kBelow, 0.3); // strong response across 0..1\r
            float gain = 1.0 + max(uWarpStrength - 1.0, 0.0); // allow >1 to amplify displacement\r
            vec2 disp = (r - s) * kBelow;\r
            vec2 warped = s + disp * gain;\r
            float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(i)) / 4.0);\r
            float m = mix(m0, m1, kMix);\r
            float w = 1.0 - exp(-uBandWidth / exp(uBandWidth * m));\r
            sumCol += uColors[i] * w;\r
            cover = max(cover, w);\r
      }\r
      col = clamp(sumCol, 0.0, 1.0);\r
      a = uTransparent > 0 ? cover : 1.0;\r
    } else {\r
        vec2 s = q;\r
        for (int k = 0; k < 3; ++k) {\r
            s -= 0.01;\r
            vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));\r
            float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(k)) / 4.0);\r
            float kBelow = clamp(uWarpStrength, 0.0, 1.0);\r
            float kMix = pow(kBelow, 0.3);\r
            float gain = 1.0 + max(uWarpStrength - 1.0, 0.0);\r
            vec2 disp = (r - s) * kBelow;\r
            vec2 warped = s + disp * gain;\r
            float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(k)) / 4.0);\r
            float m = mix(m0, m1, kMix);\r
            col[k] = 1.0 - exp(-uBandWidth / exp(uBandWidth * m));\r
        }\r
        a = uTransparent > 0 ? max(max(col.r, col.g), col.b) : 1.0;\r
    }\r
\r
    col *= uIntensity;\r
\r
    if (uNoise > 0.0001) {\r
      float n = fract(sin(dot(gl_FragCoord.xy + vec2(uTime), vec2(12.9898, 78.233))) * 43758.5453123);\r
      col += (n - 0.5) * uNoise;\r
      col = clamp(col, 0.0, 1.0);\r
    }\r
\r
    vec3 rgb = (uTransparent > 0) ? col * a : col;\r
    gl_FragColor = vec4(rgb, a);\r
}\r
\`;\r
\r
const vert = \`\r
varying vec2 vUv;\r
void main() {\r
  vUv = uv;\r
  gl_Position = vec4(position, 1.0);\r
}\r
\`;\r
\r
export default function ColorBends({\r
  className,\r
  style,\r
  rotation = 90,\r
  speed = 0.2,\r
  colors = [],\r
  transparent = true,\r
  autoRotate = 0,\r
  scale = 1,\r
  frequency = 1,\r
  warpStrength = 1,\r
  mouseInfluence = 1,\r
  parallax = 0.5,\r
  noise = 0.15,\r
  iterations = 1,\r
  intensity = 1.5,\r
  bandWidth = 6\r
}) {\r
  const containerRef = useRef(null);\r
  const rendererRef = useRef(null);\r
  const rafRef = useRef(null);\r
  const materialRef = useRef(null);\r
  const resizeObserverRef = useRef(null);\r
  const rotationRef = useRef(rotation);\r
  const autoRotateRef = useRef(autoRotate);\r
  const pointerTargetRef = useRef(new THREE.Vector2(0, 0));\r
  const pointerCurrentRef = useRef(new THREE.Vector2(0, 0));\r
  const pointerSmoothRef = useRef(8);\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const scene = new THREE.Scene();\r
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);\r
\r
    const geometry = new THREE.PlaneGeometry(2, 2);\r
    const uColorsArray = Array.from({ length: MAX_COLORS }, () => new THREE.Vector3(0, 0, 0));\r
    const material = new THREE.ShaderMaterial({\r
      vertexShader: vert,\r
      fragmentShader: frag,\r
      uniforms: {\r
        uCanvas: { value: new THREE.Vector2(1, 1) },\r
        uTime: { value: 0 },\r
        uSpeed: { value: speed },\r
        uRot: { value: new THREE.Vector2(1, 0) },\r
        uColorCount: { value: 0 },\r
        uColors: { value: uColorsArray },\r
        uTransparent: { value: transparent ? 1 : 0 },\r
        uScale: { value: scale },\r
        uFrequency: { value: frequency },\r
        uWarpStrength: { value: warpStrength },\r
        uPointer: { value: new THREE.Vector2(0, 0) },\r
        uMouseInfluence: { value: mouseInfluence },\r
        uParallax: { value: parallax },\r
        uNoise: { value: noise },\r
        uIterations: { value: iterations },\r
        uIntensity: { value: intensity },\r
        uBandWidth: { value: bandWidth }\r
      },\r
      premultipliedAlpha: true,\r
      transparent: true\r
    });\r
    materialRef.current = material;\r
\r
    const mesh = new THREE.Mesh(geometry, material);\r
    scene.add(mesh);\r
\r
    const renderer = new THREE.WebGLRenderer({\r
      antialias: false,\r
      powerPreference: 'high-performance',\r
      alpha: true\r
    });\r
    rendererRef.current = renderer;\r
    // Three r152+ uses outputColorSpace and SRGBColorSpace\r
    renderer.outputColorSpace = THREE.SRGBColorSpace;\r
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));\r
    renderer.setClearColor(0x000000, transparent ? 0 : 1);\r
    renderer.domElement.style.width = '100%';\r
    renderer.domElement.style.height = '100%';\r
    renderer.domElement.style.display = 'block';\r
    container.appendChild(renderer.domElement);\r
\r
    const clock = new THREE.Clock();\r
\r
    const handleResize = () => {\r
      const w = container.clientWidth || 1;\r
      const h = container.clientHeight || 1;\r
      renderer.setSize(w, h, false);\r
      material.uniforms.uCanvas.value.set(w, h);\r
    };\r
\r
    handleResize();\r
\r
    if ('ResizeObserver' in window) {\r
      const ro = new ResizeObserver(handleResize);\r
      ro.observe(container);\r
      resizeObserverRef.current = ro;\r
    } else {\r
      window.addEventListener('resize', handleResize);\r
    }\r
\r
    const loop = () => {\r
      const dt = clock.getDelta();\r
      const elapsed = clock.elapsedTime;\r
      material.uniforms.uTime.value = elapsed;\r
\r
      const deg = (rotationRef.current % 360) + autoRotateRef.current * elapsed;\r
      const rad = (deg * Math.PI) / 180;\r
      const c = Math.cos(rad);\r
      const s = Math.sin(rad);\r
      material.uniforms.uRot.value.set(c, s);\r
\r
      const cur = pointerCurrentRef.current;\r
      const tgt = pointerTargetRef.current;\r
      const amt = Math.min(1, dt * pointerSmoothRef.current);\r
      cur.lerp(tgt, amt);\r
      material.uniforms.uPointer.value.copy(cur);\r
      renderer.render(scene, camera);\r
      rafRef.current = requestAnimationFrame(loop);\r
    };\r
    rafRef.current = requestAnimationFrame(loop);\r
\r
    return () => {\r
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);\r
      if (resizeObserverRef.current) resizeObserverRef.current.disconnect();\r
      else window.removeEventListener('resize', handleResize);\r
      geometry.dispose();\r
      material.dispose();\r
      renderer.dispose();\r
      renderer.forceContextLoss();\r
      if (renderer.domElement && renderer.domElement.parentElement === container) {\r
        container.removeChild(renderer.domElement);\r
      }\r
    };\r
  }, [bandWidth, frequency, intensity, iterations, mouseInfluence, noise, parallax, scale, speed, transparent, warpStrength]);\r
\r
  useEffect(() => {\r
    const material = materialRef.current;\r
    const renderer = rendererRef.current;\r
    if (!material) return;\r
\r
    rotationRef.current = rotation;\r
    autoRotateRef.current = autoRotate;\r
    material.uniforms.uSpeed.value = speed;\r
    material.uniforms.uScale.value = scale;\r
    material.uniforms.uFrequency.value = frequency;\r
    material.uniforms.uWarpStrength.value = warpStrength;\r
    material.uniforms.uMouseInfluence.value = mouseInfluence;\r
    material.uniforms.uParallax.value = parallax;\r
    material.uniforms.uNoise.value = noise;\r
    material.uniforms.uIterations.value = iterations;\r
    material.uniforms.uIntensity.value = intensity;\r
    material.uniforms.uBandWidth.value = bandWidth;\r
\r
    const toVec3 = hex => {\r
      const h = hex.replace('#', '').trim();\r
      const v =\r
        h.length === 3\r
          ? [parseInt(h[0] + h[0], 16), parseInt(h[1] + h[1], 16), parseInt(h[2] + h[2], 16)]\r
          : [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];\r
      return new THREE.Vector3(v[0] / 255, v[1] / 255, v[2] / 255);\r
    };\r
\r
    const arr = (colors || []).filter(Boolean).slice(0, MAX_COLORS).map(toVec3);\r
    for (let i = 0; i < MAX_COLORS; i++) {\r
      const vec = material.uniforms.uColors.value[i];\r
      if (i < arr.length) vec.copy(arr[i]);\r
      else vec.set(0, 0, 0);\r
    }\r
    material.uniforms.uColorCount.value = arr.length;\r
\r
    material.uniforms.uTransparent.value = transparent ? 1 : 0;\r
    if (renderer) renderer.setClearColor(0x000000, transparent ? 0 : 1);\r
  }, [\r
    rotation,\r
    autoRotate,\r
    speed,\r
    scale,\r
    frequency,\r
    warpStrength,\r
    mouseInfluence,\r
    parallax,\r
    noise,\r
    iterations,\r
    intensity,\r
    bandWidth,\r
    colors,\r
    transparent\r
  ]);\r
\r
  useEffect(() => {\r
    const material = materialRef.current;\r
    const container = containerRef.current;\r
    if (!material || !container) return;\r
\r
    const handlePointerMove = e => {\r
      const rect = container.getBoundingClientRect();\r
      const x = ((e.clientX - rect.left) / (rect.width || 1)) * 2 - 1;\r
      const y = -(((e.clientY - rect.top) / (rect.height || 1)) * 2 - 1);\r
      pointerTargetRef.current.set(x, y);\r
    };\r
\r
    container.addEventListener('pointermove', handlePointerMove);\r
    return () => {\r
      container.removeEventListener('pointermove', handlePointerMove);\r
    };\r
  }, []);\r
\r
  return <div ref={containerRef} className={\`w-full h-full relative overflow-hidden \${className}\`} style={style} />;\r
}\r
`,t=`'use client';\r
\r
import React, { useEffect, useRef } from 'react';\r
import * as THREE from 'three';\r
import './ColorBends.css';\r
\r
type ColorBendsProps = {\r
  className?: string;\r
  style?: React.CSSProperties;\r
  rotation?: number;\r
  speed?: number;\r
  colors?: string[];\r
  transparent?: boolean;\r
  autoRotate?: number;\r
  scale?: number;\r
  frequency?: number;\r
  warpStrength?: number;\r
  mouseInfluence?: number;\r
  parallax?: number;\r
  noise?: number;\r
  iterations?: number;\r
  intensity?: number;\r
  bandWidth?: number;\r
};\r
\r
const MAX_COLORS = 8 as const;\r
\r
const frag = \`\r
#define MAX_COLORS \${MAX_COLORS}\r
uniform vec2 uCanvas;\r
uniform float uTime;\r
uniform float uSpeed;\r
uniform vec2 uRot;\r
uniform int uColorCount;\r
uniform vec3 uColors[MAX_COLORS];\r
uniform int uTransparent;\r
uniform float uScale;\r
uniform float uFrequency;\r
uniform float uWarpStrength;\r
uniform vec2 uPointer; // in NDC [-1,1]\r
uniform float uMouseInfluence;\r
uniform float uParallax;\r
uniform float uNoise;\r
uniform int uIterations;\r
uniform float uIntensity;\r
uniform float uBandWidth;\r
varying vec2 vUv;\r
\r
void main() {\r
  float t = uTime * uSpeed;\r
  vec2 p = vUv * 2.0 - 1.0;\r
  p += uPointer * uParallax * 0.1;\r
  vec2 rp = vec2(p.x * uRot.x - p.y * uRot.y, p.x * uRot.y + p.y * uRot.x);\r
  vec2 q = vec2(rp.x * (uCanvas.x / uCanvas.y), rp.y);\r
  q /= max(uScale, 0.0001);\r
  q /= 0.5 + 0.2 * dot(q, q);\r
  q += 0.2 * cos(t) - 7.56;\r
  vec2 toward = (uPointer - rp);\r
  q += toward * uMouseInfluence * 0.2;\r
\r
    for (int j = 0; j < 5; j++) {\r
      if (j >= uIterations - 1) break;\r
      vec2 rr = sin(1.5 * (q.yx * uFrequency) + 2.0 * cos(q * uFrequency));\r
      q += (rr - q) * 0.15;\r
    }\r
\r
    vec3 col = vec3(0.0);\r
    float a = 1.0;\r
\r
    if (uColorCount > 0) {\r
      vec2 s = q;\r
      vec3 sumCol = vec3(0.0);\r
      float cover = 0.0;\r
      for (int i = 0; i < MAX_COLORS; ++i) {\r
            if (i >= uColorCount) break;\r
            s -= 0.01;\r
            vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));\r
            float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(i)) / 4.0);\r
            float kBelow = clamp(uWarpStrength, 0.0, 1.0);\r
            float kMix = pow(kBelow, 0.3); // strong response across 0..1\r
            float gain = 1.0 + max(uWarpStrength - 1.0, 0.0); // allow >1 to amplify displacement\r
            vec2 disp = (r - s) * kBelow;\r
            vec2 warped = s + disp * gain;\r
            float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(i)) / 4.0);\r
            float m = mix(m0, m1, kMix);\r
            float w = 1.0 - exp(-uBandWidth / exp(uBandWidth * m));\r
            sumCol += uColors[i] * w;\r
            cover = max(cover, w);\r
      }\r
      col = clamp(sumCol, 0.0, 1.0);\r
      a = uTransparent > 0 ? cover : 1.0;\r
    } else {\r
        vec2 s = q;\r
        for (int k = 0; k < 3; ++k) {\r
            s -= 0.01;\r
            vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));\r
            float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(k)) / 4.0);\r
            float kBelow = clamp(uWarpStrength, 0.0, 1.0);\r
            float kMix = pow(kBelow, 0.3);\r
            float gain = 1.0 + max(uWarpStrength - 1.0, 0.0);\r
            vec2 disp = (r - s) * kBelow;\r
            vec2 warped = s + disp * gain;\r
            float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(k)) / 4.0);\r
            float m = mix(m0, m1, kMix);\r
            col[k] = 1.0 - exp(-uBandWidth / exp(uBandWidth * m));\r
        }\r
        a = uTransparent > 0 ? max(max(col.r, col.g), col.b) : 1.0;\r
    }\r
\r
    col *= uIntensity;\r
\r
    if (uNoise > 0.0001) {\r
      float n = fract(sin(dot(gl_FragCoord.xy + vec2(uTime), vec2(12.9898, 78.233))) * 43758.5453123);\r
      col += (n - 0.5) * uNoise;\r
      col = clamp(col, 0.0, 1.0);\r
    }\r
\r
    vec3 rgb = (uTransparent > 0) ? col * a : col;\r
    gl_FragColor = vec4(rgb, a);\r
}\r
\`;\r
\r
const vert = \`\r
varying vec2 vUv;\r
void main() {\r
  vUv = uv;\r
  gl_Position = vec4(position, 1.0);\r
}\r
\`;\r
\r
export default function ColorBends({\r
  className,\r
  style,\r
  rotation = 90,\r
  speed = 0.2,\r
  colors = [],\r
  transparent = true,\r
  autoRotate = 0,\r
  scale = 1,\r
  frequency = 1,\r
  warpStrength = 1,\r
  mouseInfluence = 1,\r
  parallax = 0.5,\r
  noise = 0.15,\r
  iterations = 1,\r
  intensity = 1.5,\r
  bandWidth = 6\r
}: ColorBendsProps) {\r
  const containerRef = useRef<HTMLDivElement | null>(null);\r
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);\r
  const rafRef = useRef<number | null>(null);\r
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);\r
  const resizeObserverRef = useRef<ResizeObserver | null>(null);\r
  const rotationRef = useRef<number>(rotation);\r
  const autoRotateRef = useRef<number>(autoRotate);\r
  const pointerTargetRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));\r
  const pointerCurrentRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));\r
  const pointerSmoothRef = useRef<number>(8);\r
\r
  useEffect(() => {\r
    const container = containerRef.current!;\r
    const scene = new THREE.Scene();\r
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);\r
\r
    const geometry = new THREE.PlaneGeometry(2, 2);\r
    const uColorsArray = Array.from({ length: MAX_COLORS }, () => new THREE.Vector3(0, 0, 0));\r
    const material = new THREE.ShaderMaterial({\r
      vertexShader: vert,\r
      fragmentShader: frag,\r
      uniforms: {\r
        uCanvas: { value: new THREE.Vector2(1, 1) },\r
        uTime: { value: 0 },\r
        uSpeed: { value: speed },\r
        uRot: { value: new THREE.Vector2(1, 0) },\r
        uColorCount: { value: 0 },\r
        uColors: { value: uColorsArray },\r
        uTransparent: { value: transparent ? 1 : 0 },\r
        uScale: { value: scale },\r
        uFrequency: { value: frequency },\r
        uWarpStrength: { value: warpStrength },\r
        uPointer: { value: new THREE.Vector2(0, 0) },\r
        uMouseInfluence: { value: mouseInfluence },\r
        uParallax: { value: parallax },\r
        uNoise: { value: noise },\r
        uIterations: { value: iterations },\r
        uIntensity: { value: intensity },\r
        uBandWidth: { value: bandWidth }\r
      },\r
      premultipliedAlpha: true,\r
      transparent: true\r
    });\r
    materialRef.current = material;\r
\r
    const mesh = new THREE.Mesh(geometry, material);\r
    scene.add(mesh);\r
\r
    const renderer = new THREE.WebGLRenderer({\r
      antialias: false,\r
      powerPreference: 'high-performance',\r
      alpha: true\r
    });\r
    rendererRef.current = renderer;\r
    (renderer as any).outputColorSpace = (THREE as any).SRGBColorSpace;\r
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));\r
    renderer.setClearColor(0x000000, transparent ? 0 : 1);\r
    renderer.domElement.style.width = '100%';\r
    renderer.domElement.style.height = '100%';\r
    renderer.domElement.style.display = 'block';\r
    container.appendChild(renderer.domElement);\r
\r
    const clock = new THREE.Clock();\r
\r
    const handleResize = () => {\r
      const w = container.clientWidth || 1;\r
      const h = container.clientHeight || 1;\r
      renderer.setSize(w, h, false);\r
      (material.uniforms.uCanvas.value as THREE.Vector2).set(w, h);\r
    };\r
\r
    handleResize();\r
\r
    if ('ResizeObserver' in window) {\r
      const ro = new ResizeObserver(handleResize);\r
      ro.observe(container);\r
      resizeObserverRef.current = ro;\r
    } else {\r
      (window as Window).addEventListener('resize', handleResize);\r
    }\r
\r
    const loop = () => {\r
      const dt = clock.getDelta();\r
      const elapsed = clock.elapsedTime;\r
      material.uniforms.uTime.value = elapsed;\r
\r
      const deg = (rotationRef.current % 360) + autoRotateRef.current * elapsed;\r
      const rad = (deg * Math.PI) / 180;\r
      const c = Math.cos(rad);\r
      const s = Math.sin(rad);\r
      (material.uniforms.uRot.value as THREE.Vector2).set(c, s);\r
\r
      const cur = pointerCurrentRef.current;\r
      const tgt = pointerTargetRef.current;\r
      const amt = Math.min(1, dt * pointerSmoothRef.current);\r
      cur.lerp(tgt, amt);\r
      (material.uniforms.uPointer.value as THREE.Vector2).copy(cur);\r
      renderer.render(scene, camera);\r
      rafRef.current = requestAnimationFrame(loop);\r
    };\r
    rafRef.current = requestAnimationFrame(loop);\r
\r
    return () => {\r
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);\r
      if (resizeObserverRef.current) resizeObserverRef.current.disconnect();\r
      else (window as Window).removeEventListener('resize', handleResize);\r
      geometry.dispose();\r
      material.dispose();\r
      renderer.dispose();\r
      renderer.forceContextLoss();\r
      if (renderer.domElement && renderer.domElement.parentElement === container) {\r
        container.removeChild(renderer.domElement);\r
      }\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    const material = materialRef.current;\r
    const renderer = rendererRef.current;\r
    if (!material) return;\r
\r
    rotationRef.current = rotation;\r
    autoRotateRef.current = autoRotate;\r
    material.uniforms.uSpeed.value = speed;\r
    material.uniforms.uScale.value = scale;\r
    material.uniforms.uFrequency.value = frequency;\r
    material.uniforms.uWarpStrength.value = warpStrength;\r
    material.uniforms.uMouseInfluence.value = mouseInfluence;\r
    material.uniforms.uParallax.value = parallax;\r
    material.uniforms.uNoise.value = noise;\r
    material.uniforms.uIterations.value = iterations;\r
    material.uniforms.uIntensity.value = intensity;\r
    material.uniforms.uBandWidth.value = bandWidth;\r
\r
    const toVec3 = (hex: string) => {\r
      const h = hex.replace('#', '').trim();\r
      const v =\r
        h.length === 3\r
          ? [parseInt(h[0] + h[0], 16), parseInt(h[1] + h[1], 16), parseInt(h[2] + h[2], 16)]\r
          : [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];\r
      return new THREE.Vector3(v[0] / 255, v[1] / 255, v[2] / 255);\r
    };\r
\r
    const arr = (colors || []).filter(Boolean).slice(0, MAX_COLORS).map(toVec3);\r
    for (let i = 0; i < MAX_COLORS; i++) {\r
      const vec = (material.uniforms.uColors.value as THREE.Vector3[])[i];\r
      if (i < arr.length) vec.copy(arr[i]);\r
      else vec.set(0, 0, 0);\r
    }\r
    material.uniforms.uColorCount.value = arr.length;\r
\r
    material.uniforms.uTransparent.value = transparent ? 1 : 0;\r
    if (renderer) renderer.setClearColor(0x000000, transparent ? 0 : 1);\r
  }, [\r
    rotation,\r
    autoRotate,\r
    speed,\r
    scale,\r
    frequency,\r
    warpStrength,\r
    mouseInfluence,\r
    parallax,\r
    noise,\r
    iterations,\r
    intensity,\r
    bandWidth,\r
    colors,\r
    transparent\r
  ]);\r
\r
  useEffect(() => {\r
    const material = materialRef.current;\r
    const container = containerRef.current;\r
    if (!material || !container) return;\r
\r
    const handlePointerMove = (e: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = ((e.clientX - rect.left) / (rect.width || 1)) * 2 - 1;\r
      const y = -(((e.clientY - rect.top) / (rect.height || 1)) * 2 - 1);\r
      pointerTargetRef.current.set(x, y);\r
    };\r
\r
    container.addEventListener('pointermove', handlePointerMove);\r
    return () => {\r
      container.removeEventListener('pointermove', handlePointerMove);\r
    };\r
  }, []);\r
\r
  return <div ref={containerRef} className={\`color-bends-container \${className}\`} style={style} />;\r
}\r
`,a=`'use client';\r
\r
import React, { useEffect, useRef } from 'react';\r
import * as THREE from 'three';\r
\r
type ColorBendsProps = {\r
  className?: string;\r
  style?: React.CSSProperties;\r
  rotation?: number;\r
  speed?: number;\r
  colors?: string[];\r
  transparent?: boolean;\r
  autoRotate?: number;\r
  scale?: number;\r
  frequency?: number;\r
  warpStrength?: number;\r
  mouseInfluence?: number;\r
  parallax?: number;\r
  noise?: number;\r
  iterations?: number;\r
  intensity?: number;\r
  bandWidth?: number;\r
};\r
\r
const MAX_COLORS = 8 as const;\r
\r
const frag = \`\r
#define MAX_COLORS \${MAX_COLORS}\r
uniform vec2 uCanvas;\r
uniform float uTime;\r
uniform float uSpeed;\r
uniform vec2 uRot;\r
uniform int uColorCount;\r
uniform vec3 uColors[MAX_COLORS];\r
uniform int uTransparent;\r
uniform float uScale;\r
uniform float uFrequency;\r
uniform float uWarpStrength;\r
uniform vec2 uPointer; // in NDC [-1,1]\r
uniform float uMouseInfluence;\r
uniform float uParallax;\r
uniform float uNoise;\r
uniform int uIterations;\r
uniform float uIntensity;\r
uniform float uBandWidth;\r
varying vec2 vUv;\r
\r
void main() {\r
  float t = uTime * uSpeed;\r
  vec2 p = vUv * 2.0 - 1.0;\r
  p += uPointer * uParallax * 0.1;\r
  vec2 rp = vec2(p.x * uRot.x - p.y * uRot.y, p.x * uRot.y + p.y * uRot.x);\r
  vec2 q = vec2(rp.x * (uCanvas.x / uCanvas.y), rp.y);\r
  q /= max(uScale, 0.0001);\r
  q /= 0.5 + 0.2 * dot(q, q);\r
  q += 0.2 * cos(t) - 7.56;\r
  vec2 toward = (uPointer - rp);\r
  q += toward * uMouseInfluence * 0.2;\r
\r
    for (int j = 0; j < 5; j++) {\r
      if (j >= uIterations - 1) break;\r
      vec2 rr = sin(1.5 * (q.yx * uFrequency) + 2.0 * cos(q * uFrequency));\r
      q += (rr - q) * 0.15;\r
    }\r
\r
    vec3 col = vec3(0.0);\r
    float a = 1.0;\r
\r
    if (uColorCount > 0) {\r
      vec2 s = q;\r
      vec3 sumCol = vec3(0.0);\r
      float cover = 0.0;\r
      for (int i = 0; i < MAX_COLORS; ++i) {\r
            if (i >= uColorCount) break;\r
            s -= 0.01;\r
            vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));\r
            float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(i)) / 4.0);\r
            float kBelow = clamp(uWarpStrength, 0.0, 1.0);\r
            float kMix = pow(kBelow, 0.3); // strong response across 0..1\r
            float gain = 1.0 + max(uWarpStrength - 1.0, 0.0); // allow >1 to amplify displacement\r
            vec2 disp = (r - s) * kBelow;\r
            vec2 warped = s + disp * gain;\r
            float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(i)) / 4.0);\r
            float m = mix(m0, m1, kMix);\r
            float w = 1.0 - exp(-uBandWidth / exp(uBandWidth * m));\r
            sumCol += uColors[i] * w;\r
            cover = max(cover, w);\r
      }\r
      col = clamp(sumCol, 0.0, 1.0);\r
      a = uTransparent > 0 ? cover : 1.0;\r
    } else {\r
        vec2 s = q;\r
        for (int k = 0; k < 3; ++k) {\r
            s -= 0.01;\r
            vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));\r
            float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(k)) / 4.0);\r
            float kBelow = clamp(uWarpStrength, 0.0, 1.0);\r
            float kMix = pow(kBelow, 0.3);\r
            float gain = 1.0 + max(uWarpStrength - 1.0, 0.0);\r
            vec2 disp = (r - s) * kBelow;\r
            vec2 warped = s + disp * gain;\r
            float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(k)) / 4.0);\r
            float m = mix(m0, m1, kMix);\r
            col[k] = 1.0 - exp(-uBandWidth / exp(uBandWidth * m));\r
        }\r
        a = uTransparent > 0 ? max(max(col.r, col.g), col.b) : 1.0;\r
    }\r
\r
    col *= uIntensity;\r
\r
    if (uNoise > 0.0001) {\r
      float n = fract(sin(dot(gl_FragCoord.xy + vec2(uTime), vec2(12.9898, 78.233))) * 43758.5453123);\r
      col += (n - 0.5) * uNoise;\r
      col = clamp(col, 0.0, 1.0);\r
    }\r
\r
    vec3 rgb = (uTransparent > 0) ? col * a : col;\r
    gl_FragColor = vec4(rgb, a);\r
}\r
\`;\r
\r
const vert = \`\r
varying vec2 vUv;\r
void main() {\r
  vUv = uv;\r
  gl_Position = vec4(position, 1.0);\r
}\r
\`;\r
\r
export default function ColorBends({\r
  className,\r
  style,\r
  rotation = 90,\r
  speed = 0.2,\r
  colors = [],\r
  transparent = true,\r
  autoRotate = 0,\r
  scale = 1,\r
  frequency = 1,\r
  warpStrength = 1,\r
  mouseInfluence = 1,\r
  parallax = 0.5,\r
  noise = 0.15,\r
  iterations = 1,\r
  intensity = 1.5,\r
  bandWidth = 6\r
}: ColorBendsProps) {\r
  const containerRef = useRef<HTMLDivElement | null>(null);\r
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);\r
  const rafRef = useRef<number | null>(null);\r
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);\r
  const resizeObserverRef = useRef<ResizeObserver | null>(null);\r
  const rotationRef = useRef<number>(rotation);\r
  const autoRotateRef = useRef<number>(autoRotate);\r
  const pointerTargetRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));\r
  const pointerCurrentRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));\r
  const pointerSmoothRef = useRef<number>(8);\r
\r
  useEffect(() => {\r
    const container = containerRef.current!;\r
    const scene = new THREE.Scene();\r
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);\r
\r
    const geometry = new THREE.PlaneGeometry(2, 2);\r
    const uColorsArray = Array.from({ length: MAX_COLORS }, () => new THREE.Vector3(0, 0, 0));\r
    const material = new THREE.ShaderMaterial({\r
      vertexShader: vert,\r
      fragmentShader: frag,\r
      uniforms: {\r
        uCanvas: { value: new THREE.Vector2(1, 1) },\r
        uTime: { value: 0 },\r
        uSpeed: { value: speed },\r
        uRot: { value: new THREE.Vector2(1, 0) },\r
        uColorCount: { value: 0 },\r
        uColors: { value: uColorsArray },\r
        uTransparent: { value: transparent ? 1 : 0 },\r
        uScale: { value: scale },\r
        uFrequency: { value: frequency },\r
        uWarpStrength: { value: warpStrength },\r
        uPointer: { value: new THREE.Vector2(0, 0) },\r
        uMouseInfluence: { value: mouseInfluence },\r
        uParallax: { value: parallax },\r
        uNoise: { value: noise },\r
        uIterations: { value: iterations },\r
        uIntensity: { value: intensity },\r
        uBandWidth: { value: bandWidth }\r
      },\r
      premultipliedAlpha: true,\r
      transparent: true\r
    });\r
    materialRef.current = material;\r
\r
    const mesh = new THREE.Mesh(geometry, material);\r
    scene.add(mesh);\r
\r
    const renderer = new THREE.WebGLRenderer({\r
      antialias: false,\r
      powerPreference: 'high-performance',\r
      alpha: true\r
    });\r
    rendererRef.current = renderer;\r
    (renderer as any).outputColorSpace = (THREE as any).SRGBColorSpace;\r
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));\r
    renderer.setClearColor(0x000000, transparent ? 0 : 1);\r
    renderer.domElement.style.width = '100%';\r
    renderer.domElement.style.height = '100%';\r
    renderer.domElement.style.display = 'block';\r
    container.appendChild(renderer.domElement);\r
\r
    const clock = new THREE.Clock();\r
\r
    const handleResize = () => {\r
      const w = container.clientWidth || 1;\r
      const h = container.clientHeight || 1;\r
      renderer.setSize(w, h, false);\r
      (material.uniforms.uCanvas.value as THREE.Vector2).set(w, h);\r
    };\r
\r
    handleResize();\r
\r
    if ('ResizeObserver' in window) {\r
      const ro = new ResizeObserver(handleResize);\r
      ro.observe(container);\r
      resizeObserverRef.current = ro;\r
    } else {\r
      (window as Window).addEventListener('resize', handleResize);\r
    }\r
\r
    const loop = () => {\r
      const dt = clock.getDelta();\r
      const elapsed = clock.elapsedTime;\r
      material.uniforms.uTime.value = elapsed;\r
\r
      const deg = (rotationRef.current % 360) + autoRotateRef.current * elapsed;\r
      const rad = (deg * Math.PI) / 180;\r
      const c = Math.cos(rad);\r
      const s = Math.sin(rad);\r
      (material.uniforms.uRot.value as THREE.Vector2).set(c, s);\r
\r
      const cur = pointerCurrentRef.current;\r
      const tgt = pointerTargetRef.current;\r
      const amt = Math.min(1, dt * pointerSmoothRef.current);\r
      cur.lerp(tgt, amt);\r
      (material.uniforms.uPointer.value as THREE.Vector2).copy(cur);\r
      renderer.render(scene, camera);\r
      rafRef.current = requestAnimationFrame(loop);\r
    };\r
    rafRef.current = requestAnimationFrame(loop);\r
\r
    return () => {\r
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);\r
      if (resizeObserverRef.current) resizeObserverRef.current.disconnect();\r
      else (window as Window).removeEventListener('resize', handleResize);\r
      geometry.dispose();\r
      material.dispose();\r
      renderer.dispose();\r
      renderer.forceContextLoss();\r
      if (renderer.domElement && renderer.domElement.parentElement === container) {\r
        container.removeChild(renderer.domElement);\r
      }\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    const material = materialRef.current;\r
    const renderer = rendererRef.current;\r
    if (!material) return;\r
\r
    rotationRef.current = rotation;\r
    autoRotateRef.current = autoRotate;\r
    material.uniforms.uSpeed.value = speed;\r
    material.uniforms.uScale.value = scale;\r
    material.uniforms.uFrequency.value = frequency;\r
    material.uniforms.uWarpStrength.value = warpStrength;\r
    material.uniforms.uMouseInfluence.value = mouseInfluence;\r
    material.uniforms.uParallax.value = parallax;\r
    material.uniforms.uNoise.value = noise;\r
    material.uniforms.uIterations.value = iterations;\r
    material.uniforms.uIntensity.value = intensity;\r
    material.uniforms.uBandWidth.value = bandWidth;\r
\r
    const toVec3 = (hex: string) => {\r
      const h = hex.replace('#', '').trim();\r
      const v =\r
        h.length === 3\r
          ? [parseInt(h[0] + h[0], 16), parseInt(h[1] + h[1], 16), parseInt(h[2] + h[2], 16)]\r
          : [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];\r
      return new THREE.Vector3(v[0] / 255, v[1] / 255, v[2] / 255);\r
    };\r
\r
    const arr = (colors || []).filter(Boolean).slice(0, MAX_COLORS).map(toVec3);\r
    for (let i = 0; i < MAX_COLORS; i++) {\r
      const vec = (material.uniforms.uColors.value as THREE.Vector3[])[i];\r
      if (i < arr.length) vec.copy(arr[i]);\r
      else vec.set(0, 0, 0);\r
    }\r
    material.uniforms.uColorCount.value = arr.length;\r
\r
    material.uniforms.uTransparent.value = transparent ? 1 : 0;\r
    if (renderer) renderer.setClearColor(0x000000, transparent ? 0 : 1);\r
  }, [\r
    rotation,\r
    autoRotate,\r
    speed,\r
    scale,\r
    frequency,\r
    warpStrength,\r
    mouseInfluence,\r
    parallax,\r
    noise,\r
    iterations,\r
    intensity,\r
    bandWidth,\r
    colors,\r
    transparent\r
  ]);\r
\r
  useEffect(() => {\r
    const material = materialRef.current;\r
    const container = containerRef.current;\r
    if (!material || !container) return;\r
\r
    const handlePointerMove = (e: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = ((e.clientX - rect.left) / (rect.width || 1)) * 2 - 1;\r
      const y = -(((e.clientY - rect.top) / (rect.height || 1)) * 2 - 1);\r
      pointerTargetRef.current.set(x, y);\r
    };\r
\r
    container.addEventListener('pointermove', handlePointerMove);\r
    return () => {\r
      container.removeEventListener('pointermove', handlePointerMove);\r
    };\r
  }, []);\r
\r
  return <div ref={containerRef} className={\`w-full h-full relative overflow-hidden \${className}\`} style={style} />;\r
}\r
`,o={dependencies:"three",usage:`import ColorBends from './ColorBends';
  
<ColorBends
  colors={["#ff5c7a", "#8a5cff", "#00ffd1"]}
  rotation={90}
  speed={0.2}
  scale={1}
  frequency={1}
  warpStrength={1}
  mouseInfluence={1}
  noise={0.15}
  parallax={0.5}
  iterations={1}
  intensity={1.5}
  bandWidth={6}
  transparent
/>`,code:r,css:n,tailwind:e,tsCode:t,tsTailwind:a};export{o as colorBends};
