const n=`'use client';\r
\r
import { Renderer, Program, Mesh, Triangle, Texture } from 'ogl';\r
import { useEffect, useRef } from 'react';\r
import './EvilEye.css';\r
\r
function hexToVec3(hex) {\r
  const h = hex.replace('#', '');\r
  return [\r
    parseInt(h.slice(0, 2), 16) / 255,\r
    parseInt(h.slice(2, 4), 16) / 255,\r
    parseInt(h.slice(4, 6), 16) / 255\r
  ];\r
}\r
\r
function generateNoiseTexture(size = 256) {\r
  const data = new Uint8Array(size * size * 4);\r
\r
  function hash(x, y, s) {\r
    let n = x * 374761393 + y * 668265263 + s * 1274126177;\r
    n = Math.imul(n ^ (n >>> 13), 1274126177);\r
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;\r
  }\r
\r
  function noise(px, py, freq, seed) {\r
    const fx = (px / size) * freq;\r
    const fy = (py / size) * freq;\r
    const ix = Math.floor(fx);\r
    const iy = Math.floor(fy);\r
    const tx = fx - ix;\r
    const ty = fy - iy;\r
    const w = freq | 0;\r
    const v00 = hash(((ix % w) + w) % w, ((iy % w) + w) % w, seed);\r
    const v10 = hash((((ix + 1) % w) + w) % w, ((iy % w) + w) % w, seed);\r
    const v01 = hash(((ix % w) + w) % w, (((iy + 1) % w) + w) % w, seed);\r
    const v11 = hash((((ix + 1) % w) + w) % w, (((iy + 1) % w) + w) % w, seed);\r
    return v00 * (1 - tx) * (1 - ty) + v10 * tx * (1 - ty) + v01 * (1 - tx) * ty + v11 * tx * ty;\r
  }\r
\r
  for (let y = 0; y < size; y++) {\r
    for (let x = 0; x < size; x++) {\r
      let v = 0;\r
      let amp = 0.4;\r
      let totalAmp = 0;\r
      for (let o = 0; o < 8; o++) {\r
        const f = 32 * (1 << o);\r
        v += amp * noise(x, y, f, o * 31);\r
        totalAmp += amp;\r
        amp *= 0.65;\r
      }\r
      v /= totalAmp;\r
      v = (v - 0.5) * 2.2 + 0.5;\r
      v = Math.max(0, Math.min(1, v));\r
      const val = Math.round(v * 255);\r
      const i = (y * size + x) * 4;\r
      data[i] = val;\r
      data[i + 1] = val;\r
      data[i + 2] = val;\r
      data[i + 3] = 255;\r
    }\r
  }\r
\r
  return data;\r
}\r
\r
const vertexShader = \`\r
attribute vec2 uv;\r
attribute vec2 position;\r
varying vec2 vUv;\r
void main() {\r
  vUv = uv;\r
  gl_Position = vec4(position, 0, 1);\r
}\r
\`;\r
\r
const fragmentShader = \`\r
precision highp float;\r
\r
uniform float uTime;\r
uniform vec3 uResolution;\r
uniform sampler2D uNoiseTexture;\r
uniform float uPupilSize;\r
uniform float uIrisWidth;\r
uniform float uGlowIntensity;\r
uniform float uIntensity;\r
uniform float uScale;\r
uniform float uNoiseScale;\r
uniform vec2 uMouse;\r
uniform float uPupilFollow;\r
uniform float uFlameSpeed;\r
uniform vec3 uEyeColor;\r
uniform vec3 uBgColor;\r
uniform bool uLightMode;\r
\r
void main() {\r
  vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution.xy) / uResolution.y;\r
  uv /= uScale;\r
  float ft = uTime * uFlameSpeed;\r
\r
  float polarRadius = length(uv) * 2.0;\r
  float polarAngle = (2.0 * atan(uv.x, uv.y)) / 6.28 * 0.3;\r
  vec2 polarUv = vec2(polarRadius, polarAngle);\r
\r
  vec4 noiseA = texture2D(uNoiseTexture, polarUv * vec2(0.2, 7.0) * uNoiseScale + vec2(-ft * 0.1, 0.0));\r
  vec4 noiseB = texture2D(uNoiseTexture, polarUv * vec2(0.3, 4.0) * uNoiseScale + vec2(-ft * 0.2, 0.0));\r
  vec4 noiseC = texture2D(uNoiseTexture, polarUv * vec2(0.1, 5.0) * uNoiseScale + vec2(-ft * 0.1, 0.0));\r
\r
  float distanceMask = 1.0 - length(uv);\r
\r
  // Inner ring\r
  float innerRing = clamp(-1.0 * ((distanceMask - 0.7) / uIrisWidth), 0.0, 1.0);\r
  innerRing = (innerRing * distanceMask - 0.2) / 0.28;\r
  innerRing += noiseA.r - 0.5;\r
  innerRing *= 1.3;\r
  innerRing = clamp(innerRing, 0.0, 1.0);\r
\r
  float outerRing = clamp(-1.0 * ((distanceMask - 0.5) / 0.2), 0.0, 1.0);\r
  outerRing = (outerRing * distanceMask - 0.1) / 0.38;\r
  outerRing += noiseC.r - 0.5;\r
  outerRing *= 1.3;\r
  outerRing = clamp(outerRing, 0.0, 1.0);\r
\r
  innerRing += outerRing;\r
\r
  // Inner eye\r
  float innerEye = distanceMask - 0.1 * 2.0;\r
  innerEye *= noiseB.r * 2.0;\r
\r
  // Pupil with cursor tracking\r
  vec2 pupilOffset = uMouse * uPupilFollow * 0.12;\r
  vec2 pupilUv = uv - pupilOffset;\r
  float pupil = 1.0 - length(pupilUv * vec2(9.0, 2.3));\r
  pupil *= uPupilSize;\r
  pupil = clamp(pupil, 0.0, 1.0);\r
  pupil /= 0.35;\r
\r
  // Outer eye\r
  float outerEyeGlow = 1.0 - length(uv * vec2(0.5, 1.5));\r
  outerEyeGlow = clamp(outerEyeGlow + 0.5, 0.0, 1.0);\r
  outerEyeGlow += noiseC.r - 0.5;\r
  float outerBgGlow = outerEyeGlow;\r
  outerEyeGlow = pow(outerEyeGlow, 2.0);\r
  outerEyeGlow += distanceMask;\r
  outerEyeGlow *= uGlowIntensity;\r
  outerEyeGlow = clamp(outerEyeGlow, 0.0, 1.0);\r
  outerEyeGlow *= pow(1.0 - distanceMask, 2.0) * 2.5;\r
\r
  // Outer eye bg glow\r
  outerBgGlow += distanceMask;\r
  outerBgGlow = pow(outerBgGlow, 0.5);\r
  outerBgGlow *= 0.15;\r
\r
  vec3 eyeEnergy = uEyeColor * uIntensity * clamp(max(innerRing + innerEye, outerEyeGlow + outerBgGlow) - pupil, 0.0, 3.0);\r
  vec3 color;\r
  if (uLightMode) {\r
    vec3 mapped = vec3(1.0) - exp(-max(eyeEnergy, vec3(0.0)) * 1.3);\r
    float energy = clamp(max(mapped.r, max(mapped.g, mapped.b)), 0.0, 1.0);\r
    vec3 hue = mapped / max(energy, 0.0001);\r
    hue = pow(clamp(hue, 0.0, 1.0), vec3(1.2));\r
    color = mix(uBgColor, hue, smoothstep(0.02, 0.82, energy) * 0.96);\r
  } else {\r
    color = eyeEnergy + uBgColor;\r
  }\r
\r
  gl_FragColor = vec4(color, 1.0);\r
}\r
\`;\r
\r
export default function EvilEye({\r
  eyeColor = '#FF6F37',\r
  intensity = 1.5,\r
  pupilSize = 0.6,\r
  irisWidth = 0.25,\r
  glowIntensity = 0.35,\r
  scale = 0.8,\r
  noiseScale = 1.0,\r
  pupilFollow = 1.0,\r
  flameSpeed = 1.0,\r
  backgroundColor = '#000000',\r
  lightMode = false\r
}) {\r
  const containerRef = useRef(null);\r
\r
  useEffect(() => {\r
    if (!containerRef.current) return;\r
    const container = containerRef.current;\r
    const renderer = new Renderer({ alpha: true, premultipliedAlpha: false });\r
    const gl = renderer.gl;\r
    gl.clearColor(0, 0, 0, 0);\r
\r
    const noiseData = generateNoiseTexture(256);\r
    const noiseTexture = new Texture(gl, {\r
      image: noiseData,\r
      width: 256,\r
      height: 256,\r
      generateMipmaps: false,\r
      flipY: false,\r
    });\r
    noiseTexture.minFilter = gl.LINEAR;\r
    noiseTexture.magFilter = gl.LINEAR;\r
    noiseTexture.wrapS = gl.REPEAT;\r
    noiseTexture.wrapT = gl.REPEAT;\r
\r
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };\r
\r
    function onMouseMove(e) {\r
      const rect = container.getBoundingClientRect();\r
      mouse.tx = ((e.clientX - rect.left) / rect.width) * 2 - 1;\r
      mouse.ty = -(((e.clientY - rect.top) / rect.height) * 2 - 1);\r
    }\r
\r
    function onMouseLeave() {\r
      mouse.tx = 0;\r
      mouse.ty = 0;\r
    }\r
\r
    container.addEventListener('mousemove', onMouseMove);\r
    container.addEventListener('mouseleave', onMouseLeave);\r
\r
    let program;\r
\r
    function resize() {\r
      renderer.setSize(container.offsetWidth, container.offsetHeight);\r
      if (program) {\r
        program.uniforms.uResolution.value = [gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height];\r
      }\r
    }\r
    window.addEventListener('resize', resize);\r
    resize();\r
\r
    const geometry = new Triangle(gl);\r
    program = new Program(gl, {\r
      vertex: vertexShader,\r
      fragment: fragmentShader,\r
      uniforms: {\r
        uTime: { value: 0 },\r
        uResolution: { value: [gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height] },\r
        uNoiseTexture: { value: noiseTexture },\r
        uPupilSize: { value: pupilSize },\r
        uIrisWidth: { value: irisWidth },\r
        uGlowIntensity: { value: glowIntensity },\r
        uIntensity: { value: intensity },\r
        uScale: { value: scale },\r
        uNoiseScale: { value: noiseScale },\r
        uMouse: { value: [0, 0] },\r
        uPupilFollow: { value: pupilFollow },\r
        uFlameSpeed: { value: flameSpeed },\r
        uEyeColor: { value: hexToVec3(eyeColor) },\r
        uBgColor: { value: hexToVec3(backgroundColor) },\r
        uLightMode: { value: lightMode }\r
      }\r
    });\r
\r
    const mesh = new Mesh(gl, { geometry, program });\r
    container.appendChild(gl.canvas);\r
\r
    let animationFrameId;\r
\r
    function update(time) {\r
      animationFrameId = requestAnimationFrame(update);\r
      mouse.x += (mouse.tx - mouse.x) * 0.05;\r
      mouse.y += (mouse.ty - mouse.y) * 0.05;\r
      program.uniforms.uMouse.value = [mouse.x, mouse.y];\r
      program.uniforms.uTime.value = time * 0.001;\r
      renderer.render({ scene: mesh });\r
    }\r
    animationFrameId = requestAnimationFrame(update);\r
\r
    return () => {\r
      cancelAnimationFrame(animationFrameId);\r
      window.removeEventListener('resize', resize);\r
      container.removeEventListener('mousemove', onMouseMove);\r
      container.removeEventListener('mouseleave', onMouseLeave);\r
      container.removeChild(gl.canvas);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
    };\r
  }, [eyeColor, intensity, pupilSize, irisWidth, glowIntensity, scale, noiseScale, pupilFollow, flameSpeed, backgroundColor, lightMode]);\r
\r
  return <div ref={containerRef} className="evil-eye-container" />;\r
}\r
`,e=`.evil-eye-container {\r
  width: 100%;\r
  height: 100%;\r
}\r
`,r=`'use client';\r
\r
import { Renderer, Program, Mesh, Triangle, Texture } from 'ogl';\r
import { useEffect, useRef } from 'react';\r
\r
function hexToVec3(hex) {\r
  const h = hex.replace('#', '');\r
  return [\r
    parseInt(h.slice(0, 2), 16) / 255,\r
    parseInt(h.slice(2, 4), 16) / 255,\r
    parseInt(h.slice(4, 6), 16) / 255\r
  ];\r
}\r
\r
function generateNoiseTexture(size = 256) {\r
  const data = new Uint8Array(size * size * 4);\r
\r
  function hash(x, y, s) {\r
    let n = x * 374761393 + y * 668265263 + s * 1274126177;\r
    n = Math.imul(n ^ (n >>> 13), 1274126177);\r
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;\r
  }\r
\r
  function noise(px, py, freq, seed) {\r
    const fx = (px / size) * freq;\r
    const fy = (py / size) * freq;\r
    const ix = Math.floor(fx);\r
    const iy = Math.floor(fy);\r
    const tx = fx - ix;\r
    const ty = fy - iy;\r
    const w = freq | 0;\r
    const v00 = hash(((ix % w) + w) % w, ((iy % w) + w) % w, seed);\r
    const v10 = hash((((ix + 1) % w) + w) % w, ((iy % w) + w) % w, seed);\r
    const v01 = hash(((ix % w) + w) % w, (((iy + 1) % w) + w) % w, seed);\r
    const v11 = hash((((ix + 1) % w) + w) % w, (((iy + 1) % w) + w) % w, seed);\r
    return v00 * (1 - tx) * (1 - ty) + v10 * tx * (1 - ty) + v01 * (1 - tx) * ty + v11 * tx * ty;\r
  }\r
\r
  for (let y = 0; y < size; y++) {\r
    for (let x = 0; x < size; x++) {\r
      let v = 0;\r
      let amp = 0.4;\r
      let totalAmp = 0;\r
      for (let o = 0; o < 8; o++) {\r
        const f = 32 * (1 << o);\r
        v += amp * noise(x, y, f, o * 31);\r
        totalAmp += amp;\r
        amp *= 0.65;\r
      }\r
      v /= totalAmp;\r
      v = (v - 0.5) * 2.2 + 0.5;\r
      v = Math.max(0, Math.min(1, v));\r
      const val = Math.round(v * 255);\r
      const i = (y * size + x) * 4;\r
      data[i] = val;\r
      data[i + 1] = val;\r
      data[i + 2] = val;\r
      data[i + 3] = 255;\r
    }\r
  }\r
\r
  return data;\r
}\r
\r
const vertexShader = \`\r
attribute vec2 uv;\r
attribute vec2 position;\r
varying vec2 vUv;\r
void main() {\r
  vUv = uv;\r
  gl_Position = vec4(position, 0, 1);\r
}\r
\`;\r
\r
const fragmentShader = \`\r
precision highp float;\r
\r
uniform float uTime;\r
uniform vec3 uResolution;\r
uniform sampler2D uNoiseTexture;\r
uniform float uPupilSize;\r
uniform float uIrisWidth;\r
uniform float uGlowIntensity;\r
uniform float uIntensity;\r
uniform float uScale;\r
uniform float uNoiseScale;\r
uniform vec2 uMouse;\r
uniform float uPupilFollow;\r
uniform float uFlameSpeed;\r
uniform vec3 uEyeColor;\r
uniform vec3 uBgColor;\r
uniform bool uLightMode;\r
\r
void main() {\r
  vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution.xy) / uResolution.y;\r
  uv /= uScale;\r
  float ft = uTime * uFlameSpeed;\r
\r
  float polarRadius = length(uv) * 2.0;\r
  float polarAngle = (2.0 * atan(uv.x, uv.y)) / 6.28 * 0.3;\r
  vec2 polarUv = vec2(polarRadius, polarAngle);\r
\r
  vec4 noiseA = texture2D(uNoiseTexture, polarUv * vec2(0.2, 7.0) * uNoiseScale + vec2(-ft * 0.1, 0.0));\r
  vec4 noiseB = texture2D(uNoiseTexture, polarUv * vec2(0.3, 4.0) * uNoiseScale + vec2(-ft * 0.2, 0.0));\r
  vec4 noiseC = texture2D(uNoiseTexture, polarUv * vec2(0.1, 5.0) * uNoiseScale + vec2(-ft * 0.1, 0.0));\r
\r
  float distanceMask = 1.0 - length(uv);\r
\r
  // Inner ring\r
  float innerRing = clamp(-1.0 * ((distanceMask - 0.7) / uIrisWidth), 0.0, 1.0);\r
  innerRing = (innerRing * distanceMask - 0.2) / 0.28;\r
  innerRing += noiseA.r - 0.5;\r
  innerRing *= 1.3;\r
  innerRing = clamp(innerRing, 0.0, 1.0);\r
\r
  float outerRing = clamp(-1.0 * ((distanceMask - 0.5) / 0.2), 0.0, 1.0);\r
  outerRing = (outerRing * distanceMask - 0.1) / 0.38;\r
  outerRing += noiseC.r - 0.5;\r
  outerRing *= 1.3;\r
  outerRing = clamp(outerRing, 0.0, 1.0);\r
\r
  innerRing += outerRing;\r
\r
  // Inner eye\r
  float innerEye = distanceMask - 0.1 * 2.0;\r
  innerEye *= noiseB.r * 2.0;\r
\r
  // Pupil with cursor tracking\r
  vec2 pupilOffset = uMouse * uPupilFollow * 0.12;\r
  vec2 pupilUv = uv - pupilOffset;\r
  float pupil = 1.0 - length(pupilUv * vec2(9.0, 2.3));\r
  pupil *= uPupilSize;\r
  pupil = clamp(pupil, 0.0, 1.0);\r
  pupil /= 0.35;\r
\r
  // Outer eye\r
  float outerEyeGlow = 1.0 - length(uv * vec2(0.5, 1.5));\r
  outerEyeGlow = clamp(outerEyeGlow + 0.5, 0.0, 1.0);\r
  outerEyeGlow += noiseC.r - 0.5;\r
  float outerBgGlow = outerEyeGlow;\r
  outerEyeGlow = pow(outerEyeGlow, 2.0);\r
  outerEyeGlow += distanceMask;\r
  outerEyeGlow *= uGlowIntensity;\r
  outerEyeGlow = clamp(outerEyeGlow, 0.0, 1.0);\r
  outerEyeGlow *= pow(1.0 - distanceMask, 2.0) * 2.5;\r
\r
  // Outer eye bg glow\r
  outerBgGlow += distanceMask;\r
  outerBgGlow = pow(outerBgGlow, 0.5);\r
  outerBgGlow *= 0.15;\r
\r
  vec3 eyeEnergy = uEyeColor * uIntensity * clamp(max(innerRing + innerEye, outerEyeGlow + outerBgGlow) - pupil, 0.0, 3.0);\r
  vec3 color;\r
  if (uLightMode) {\r
    vec3 mapped = vec3(1.0) - exp(-max(eyeEnergy, vec3(0.0)) * 1.3);\r
    float energy = clamp(max(mapped.r, max(mapped.g, mapped.b)), 0.0, 1.0);\r
    vec3 hue = mapped / max(energy, 0.0001);\r
    hue = pow(clamp(hue, 0.0, 1.0), vec3(1.2));\r
    color = mix(uBgColor, hue, smoothstep(0.02, 0.82, energy) * 0.96);\r
  } else {\r
    color = eyeEnergy + uBgColor;\r
  }\r
\r
  gl_FragColor = vec4(color, 1.0);\r
}\r
\`;\r
\r
export default function EvilEye({\r
  eyeColor = '#FF6F37',\r
  intensity = 1.5,\r
  pupilSize = 0.6,\r
  irisWidth = 0.25,\r
  glowIntensity = 0.35,\r
  scale = 0.8,\r
  noiseScale = 1.0,\r
  pupilFollow = 1.0,\r
  flameSpeed = 1.0,\r
  backgroundColor = '#000000',\r
  lightMode = false\r
}) {\r
  const containerRef = useRef(null);\r
\r
  useEffect(() => {\r
    if (!containerRef.current) return;\r
    const container = containerRef.current;\r
    const renderer = new Renderer({ alpha: true, premultipliedAlpha: false });\r
    const gl = renderer.gl;\r
    gl.clearColor(0, 0, 0, 0);\r
\r
    const noiseData = generateNoiseTexture(256);\r
    const noiseTexture = new Texture(gl, {\r
      image: noiseData,\r
      width: 256,\r
      height: 256,\r
      generateMipmaps: false,\r
      flipY: false,\r
    });\r
    noiseTexture.minFilter = gl.LINEAR;\r
    noiseTexture.magFilter = gl.LINEAR;\r
    noiseTexture.wrapS = gl.REPEAT;\r
    noiseTexture.wrapT = gl.REPEAT;\r
\r
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };\r
\r
    function onMouseMove(e) {\r
      const rect = container.getBoundingClientRect();\r
      mouse.tx = ((e.clientX - rect.left) / rect.width) * 2 - 1;\r
      mouse.ty = -(((e.clientY - rect.top) / rect.height) * 2 - 1);\r
    }\r
\r
    function onMouseLeave() {\r
      mouse.tx = 0;\r
      mouse.ty = 0;\r
    }\r
\r
    container.addEventListener('mousemove', onMouseMove);\r
    container.addEventListener('mouseleave', onMouseLeave);\r
\r
    let program;\r
\r
    function resize() {\r
      renderer.setSize(container.offsetWidth, container.offsetHeight);\r
      if (program) {\r
        program.uniforms.uResolution.value = [gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height];\r
      }\r
    }\r
    window.addEventListener('resize', resize);\r
    resize();\r
\r
    const geometry = new Triangle(gl);\r
    program = new Program(gl, {\r
      vertex: vertexShader,\r
      fragment: fragmentShader,\r
      uniforms: {\r
        uTime: { value: 0 },\r
        uResolution: { value: [gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height] },\r
        uNoiseTexture: { value: noiseTexture },\r
        uPupilSize: { value: pupilSize },\r
        uIrisWidth: { value: irisWidth },\r
        uGlowIntensity: { value: glowIntensity },\r
        uIntensity: { value: intensity },\r
        uScale: { value: scale },\r
        uNoiseScale: { value: noiseScale },\r
        uMouse: { value: [0, 0] },\r
        uPupilFollow: { value: pupilFollow },\r
        uFlameSpeed: { value: flameSpeed },\r
        uEyeColor: { value: hexToVec3(eyeColor) },\r
        uBgColor: { value: hexToVec3(backgroundColor) },\r
        uLightMode: { value: lightMode }\r
      }\r
    });\r
\r
    const mesh = new Mesh(gl, { geometry, program });\r
    container.appendChild(gl.canvas);\r
\r
    let animationFrameId;\r
\r
    function update(time) {\r
      animationFrameId = requestAnimationFrame(update);\r
      mouse.x += (mouse.tx - mouse.x) * 0.05;\r
      mouse.y += (mouse.ty - mouse.y) * 0.05;\r
      program.uniforms.uMouse.value = [mouse.x, mouse.y];\r
      program.uniforms.uTime.value = time * 0.001;\r
      renderer.render({ scene: mesh });\r
    }\r
    animationFrameId = requestAnimationFrame(update);\r
\r
    return () => {\r
      cancelAnimationFrame(animationFrameId);\r
      window.removeEventListener('resize', resize);\r
      container.removeEventListener('mousemove', onMouseMove);\r
      container.removeEventListener('mouseleave', onMouseLeave);\r
      container.removeChild(gl.canvas);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
    };\r
  }, [eyeColor, intensity, pupilSize, irisWidth, glowIntensity, scale, noiseScale, pupilFollow, flameSpeed, backgroundColor, lightMode]);\r
\r
  return <div ref={containerRef} className="w-full h-full" />;\r
}\r
`,o=`'use client';\r
\r
import { Renderer, Program, Mesh, Triangle, Texture } from 'ogl';\r
import { useEffect, useRef } from 'react';\r
import './EvilEye.css';\r
\r
interface EvilEyeProps {\r
  eyeColor?: string;\r
  intensity?: number;\r
  pupilSize?: number;\r
  irisWidth?: number;\r
  glowIntensity?: number;\r
  scale?: number;\r
  noiseScale?: number;\r
  pupilFollow?: number;\r
  flameSpeed?: number;\r
  backgroundColor?: string;\r
  lightMode?: boolean;\r
}\r
\r
function hexToVec3(hex: string): [number, number, number] {\r
  const h = hex.replace('#', '');\r
  return [\r
    parseInt(h.slice(0, 2), 16) / 255,\r
    parseInt(h.slice(2, 4), 16) / 255,\r
    parseInt(h.slice(4, 6), 16) / 255\r
  ];\r
}\r
\r
function generateNoiseTexture(size = 256): Uint8Array {\r
  const data = new Uint8Array(size * size * 4);\r
\r
  function hash(x: number, y: number, s: number): number {\r
    let n = x * 374761393 + y * 668265263 + s * 1274126177;\r
    n = Math.imul(n ^ (n >>> 13), 1274126177);\r
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;\r
  }\r
\r
  function noise(px: number, py: number, freq: number, seed: number): number {\r
    const fx = (px / size) * freq;\r
    const fy = (py / size) * freq;\r
    const ix = Math.floor(fx);\r
    const iy = Math.floor(fy);\r
    const tx = fx - ix;\r
    const ty = fy - iy;\r
    const w = freq | 0;\r
    const v00 = hash(((ix % w) + w) % w, ((iy % w) + w) % w, seed);\r
    const v10 = hash((((ix + 1) % w) + w) % w, ((iy % w) + w) % w, seed);\r
    const v01 = hash(((ix % w) + w) % w, (((iy + 1) % w) + w) % w, seed);\r
    const v11 = hash((((ix + 1) % w) + w) % w, (((iy + 1) % w) + w) % w, seed);\r
    return v00 * (1 - tx) * (1 - ty) + v10 * tx * (1 - ty) + v01 * (1 - tx) * ty + v11 * tx * ty;\r
  }\r
\r
  for (let y = 0; y < size; y++) {\r
    for (let x = 0; x < size; x++) {\r
      let v = 0;\r
      let amp = 0.4;\r
      let totalAmp = 0;\r
      for (let o = 0; o < 8; o++) {\r
        const f = 32 * (1 << o);\r
        v += amp * noise(x, y, f, o * 31);\r
        totalAmp += amp;\r
        amp *= 0.65;\r
      }\r
      v /= totalAmp;\r
      v = (v - 0.5) * 2.2 + 0.5;\r
      v = Math.max(0, Math.min(1, v));\r
      const val = Math.round(v * 255);\r
      const i = (y * size + x) * 4;\r
      data[i] = val;\r
      data[i + 1] = val;\r
      data[i + 2] = val;\r
      data[i + 3] = 255;\r
    }\r
  }\r
\r
  return data;\r
}\r
\r
const vertexShader = \`\r
attribute vec2 uv;\r
attribute vec2 position;\r
varying vec2 vUv;\r
void main() {\r
  vUv = uv;\r
  gl_Position = vec4(position, 0, 1);\r
}\r
\`;\r
\r
const fragmentShader = \`\r
precision highp float;\r
\r
uniform float uTime;\r
uniform vec3 uResolution;\r
uniform sampler2D uNoiseTexture;\r
uniform float uPupilSize;\r
uniform float uIrisWidth;\r
uniform float uGlowIntensity;\r
uniform float uIntensity;\r
uniform float uScale;\r
uniform float uNoiseScale;\r
uniform vec2 uMouse;\r
uniform float uPupilFollow;\r
uniform float uFlameSpeed;\r
uniform vec3 uEyeColor;\r
uniform vec3 uBgColor;\r
uniform bool uLightMode;\r
\r
void main() {\r
  vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution.xy) / uResolution.y;\r
  uv /= uScale;\r
  float ft = uTime * uFlameSpeed;\r
\r
  float polarRadius = length(uv) * 2.0;\r
  float polarAngle = (2.0 * atan(uv.x, uv.y)) / 6.28 * 0.3;\r
  vec2 polarUv = vec2(polarRadius, polarAngle);\r
\r
  vec4 noiseA = texture2D(uNoiseTexture, polarUv * vec2(0.2, 7.0) * uNoiseScale + vec2(-ft * 0.1, 0.0));\r
  vec4 noiseB = texture2D(uNoiseTexture, polarUv * vec2(0.3, 4.0) * uNoiseScale + vec2(-ft * 0.2, 0.0));\r
  vec4 noiseC = texture2D(uNoiseTexture, polarUv * vec2(0.1, 5.0) * uNoiseScale + vec2(-ft * 0.1, 0.0));\r
\r
  float distanceMask = 1.0 - length(uv);\r
\r
  // Inner ring\r
  float innerRing = clamp(-1.0 * ((distanceMask - 0.7) / uIrisWidth), 0.0, 1.0);\r
  innerRing = (innerRing * distanceMask - 0.2) / 0.28;\r
  innerRing += noiseA.r - 0.5;\r
  innerRing *= 1.3;\r
  innerRing = clamp(innerRing, 0.0, 1.0);\r
\r
  float outerRing = clamp(-1.0 * ((distanceMask - 0.5) / 0.2), 0.0, 1.0);\r
  outerRing = (outerRing * distanceMask - 0.1) / 0.38;\r
  outerRing += noiseC.r - 0.5;\r
  outerRing *= 1.3;\r
  outerRing = clamp(outerRing, 0.0, 1.0);\r
\r
  innerRing += outerRing;\r
\r
  // Inner eye\r
  float innerEye = distanceMask - 0.1 * 2.0;\r
  innerEye *= noiseB.r * 2.0;\r
\r
  // Pupil with cursor tracking\r
  vec2 pupilOffset = uMouse * uPupilFollow * 0.12;\r
  vec2 pupilUv = uv - pupilOffset;\r
  float pupil = 1.0 - length(pupilUv * vec2(9.0, 2.3));\r
  pupil *= uPupilSize;\r
  pupil = clamp(pupil, 0.0, 1.0);\r
  pupil /= 0.35;\r
\r
  // Outer eye\r
  float outerEyeGlow = 1.0 - length(uv * vec2(0.5, 1.5));\r
  outerEyeGlow = clamp(outerEyeGlow + 0.5, 0.0, 1.0);\r
  outerEyeGlow += noiseC.r - 0.5;\r
  float outerBgGlow = outerEyeGlow;\r
  outerEyeGlow = pow(outerEyeGlow, 2.0);\r
  outerEyeGlow += distanceMask;\r
  outerEyeGlow *= uGlowIntensity;\r
  outerEyeGlow = clamp(outerEyeGlow, 0.0, 1.0);\r
  outerEyeGlow *= pow(1.0 - distanceMask, 2.0) * 2.5;\r
\r
  // Outer eye bg glow\r
  outerBgGlow += distanceMask;\r
  outerBgGlow = pow(outerBgGlow, 0.5);\r
  outerBgGlow *= 0.15;\r
\r
  vec3 eyeEnergy = uEyeColor * uIntensity * clamp(max(innerRing + innerEye, outerEyeGlow + outerBgGlow) - pupil, 0.0, 3.0);\r
  vec3 color;\r
  if (uLightMode) {\r
    vec3 mapped = vec3(1.0) - exp(-max(eyeEnergy, vec3(0.0)) * 1.3);\r
    float energy = clamp(max(mapped.r, max(mapped.g, mapped.b)), 0.0, 1.0);\r
    vec3 hue = mapped / max(energy, 0.0001);\r
    hue = pow(clamp(hue, 0.0, 1.0), vec3(1.2));\r
    color = mix(uBgColor, hue, smoothstep(0.02, 0.82, energy) * 0.96);\r
  } else {\r
    color = eyeEnergy + uBgColor;\r
  }\r
\r
  gl_FragColor = vec4(color, 1.0);\r
}\r
\`;\r
\r
export default function EvilEye({\r
  eyeColor = '#FF6F37',\r
  intensity = 1.5,\r
  pupilSize = 0.6,\r
  irisWidth = 0.25,\r
  glowIntensity = 0.35,\r
  scale = 0.8,\r
  noiseScale = 1.0,\r
  pupilFollow = 1.0,\r
  flameSpeed = 1.0,\r
  backgroundColor = '#000000',\r
  lightMode = false\r
}: EvilEyeProps) {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
\r
  useEffect(() => {\r
    if (!containerRef.current) return;\r
    const container = containerRef.current;\r
    const renderer = new Renderer({ alpha: true, premultipliedAlpha: false });\r
    const gl = renderer.gl;\r
    gl.clearColor(0, 0, 0, 0);\r
\r
    const noiseData = generateNoiseTexture(256);\r
    const noiseTexture = new Texture(gl, {\r
      image: noiseData,\r
      width: 256,\r
      height: 256,\r
      generateMipmaps: false,\r
      flipY: false,\r
    });\r
    noiseTexture.minFilter = gl.LINEAR;\r
    noiseTexture.magFilter = gl.LINEAR;\r
    noiseTexture.wrapS = gl.REPEAT;\r
    noiseTexture.wrapT = gl.REPEAT;\r
\r
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };\r
\r
    function onMouseMove(e: MouseEvent) {\r
      const rect = container.getBoundingClientRect();\r
      mouse.tx = ((e.clientX - rect.left) / rect.width) * 2 - 1;\r
      mouse.ty = -(((e.clientY - rect.top) / rect.height) * 2 - 1);\r
    }\r
\r
    function onMouseLeave() {\r
      mouse.tx = 0;\r
      mouse.ty = 0;\r
    }\r
\r
    container.addEventListener('mousemove', onMouseMove);\r
    container.addEventListener('mouseleave', onMouseLeave);\r
\r
    let program: Program;\r
\r
    function resize() {\r
      renderer.setSize(container.offsetWidth, container.offsetHeight);\r
      if (program) {\r
        program.uniforms.uResolution.value = [gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height];\r
      }\r
    }\r
    window.addEventListener('resize', resize);\r
    resize();\r
\r
    const geometry = new Triangle(gl);\r
    program = new Program(gl, {\r
      vertex: vertexShader,\r
      fragment: fragmentShader,\r
      uniforms: {\r
        uTime: { value: 0 },\r
        uResolution: { value: [gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height] },\r
        uNoiseTexture: { value: noiseTexture },\r
        uPupilSize: { value: pupilSize },\r
        uIrisWidth: { value: irisWidth },\r
        uGlowIntensity: { value: glowIntensity },\r
        uIntensity: { value: intensity },\r
        uScale: { value: scale },\r
        uNoiseScale: { value: noiseScale },\r
        uMouse: { value: [0, 0] },\r
        uPupilFollow: { value: pupilFollow },\r
        uFlameSpeed: { value: flameSpeed },\r
        uEyeColor: { value: hexToVec3(eyeColor) },\r
        uBgColor: { value: hexToVec3(backgroundColor) },\r
        uLightMode: { value: lightMode }\r
      }\r
    });\r
\r
    const mesh = new Mesh(gl, { geometry, program });\r
    container.appendChild(gl.canvas);\r
\r
    let animationFrameId: number;\r
\r
    function update(time: number) {\r
      animationFrameId = requestAnimationFrame(update);\r
      mouse.x += (mouse.tx - mouse.x) * 0.05;\r
      mouse.y += (mouse.ty - mouse.y) * 0.05;\r
      program.uniforms.uMouse.value = [mouse.x, mouse.y];\r
      program.uniforms.uTime.value = time * 0.001;\r
      renderer.render({ scene: mesh });\r
    }\r
    animationFrameId = requestAnimationFrame(update);\r
\r
    return () => {\r
      cancelAnimationFrame(animationFrameId);\r
      window.removeEventListener('resize', resize);\r
      container.removeEventListener('mousemove', onMouseMove);\r
      container.removeEventListener('mouseleave', onMouseLeave);\r
      container.removeChild(gl.canvas);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
    };\r
  }, [eyeColor, intensity, pupilSize, irisWidth, glowIntensity, scale, noiseScale, pupilFollow, flameSpeed, backgroundColor, lightMode]);\r
\r
  return <div ref={containerRef} className="evil-eye-container" />;\r
}\r
`,t=`'use client';\r
\r
import { Renderer, Program, Mesh, Triangle, Texture } from 'ogl';\r
import { useEffect, useRef } from 'react';\r
\r
interface EvilEyeProps {\r
  eyeColor?: string;\r
  intensity?: number;\r
  pupilSize?: number;\r
  irisWidth?: number;\r
  glowIntensity?: number;\r
  scale?: number;\r
  noiseScale?: number;\r
  pupilFollow?: number;\r
  flameSpeed?: number;\r
  backgroundColor?: string;\r
  lightMode?: boolean;\r
}\r
\r
function hexToVec3(hex: string): [number, number, number] {\r
  const h = hex.replace('#', '');\r
  return [\r
    parseInt(h.slice(0, 2), 16) / 255,\r
    parseInt(h.slice(2, 4), 16) / 255,\r
    parseInt(h.slice(4, 6), 16) / 255\r
  ];\r
}\r
\r
function generateNoiseTexture(size = 256): Uint8Array {\r
  const data = new Uint8Array(size * size * 4);\r
\r
  function hash(x: number, y: number, s: number): number {\r
    let n = x * 374761393 + y * 668265263 + s * 1274126177;\r
    n = Math.imul(n ^ (n >>> 13), 1274126177);\r
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;\r
  }\r
\r
  function noise(px: number, py: number, freq: number, seed: number): number {\r
    const fx = (px / size) * freq;\r
    const fy = (py / size) * freq;\r
    const ix = Math.floor(fx);\r
    const iy = Math.floor(fy);\r
    const tx = fx - ix;\r
    const ty = fy - iy;\r
    const w = freq | 0;\r
    const v00 = hash(((ix % w) + w) % w, ((iy % w) + w) % w, seed);\r
    const v10 = hash((((ix + 1) % w) + w) % w, ((iy % w) + w) % w, seed);\r
    const v01 = hash(((ix % w) + w) % w, (((iy + 1) % w) + w) % w, seed);\r
    const v11 = hash((((ix + 1) % w) + w) % w, (((iy + 1) % w) + w) % w, seed);\r
    return v00 * (1 - tx) * (1 - ty) + v10 * tx * (1 - ty) + v01 * (1 - tx) * ty + v11 * tx * ty;\r
  }\r
\r
  for (let y = 0; y < size; y++) {\r
    for (let x = 0; x < size; x++) {\r
      let v = 0;\r
      let amp = 0.4;\r
      let totalAmp = 0;\r
      for (let o = 0; o < 8; o++) {\r
        const f = 32 * (1 << o);\r
        v += amp * noise(x, y, f, o * 31);\r
        totalAmp += amp;\r
        amp *= 0.65;\r
      }\r
      v /= totalAmp;\r
      v = (v - 0.5) * 2.2 + 0.5;\r
      v = Math.max(0, Math.min(1, v));\r
      const val = Math.round(v * 255);\r
      const i = (y * size + x) * 4;\r
      data[i] = val;\r
      data[i + 1] = val;\r
      data[i + 2] = val;\r
      data[i + 3] = 255;\r
    }\r
  }\r
\r
  return data;\r
}\r
\r
const vertexShader = \`\r
attribute vec2 uv;\r
attribute vec2 position;\r
varying vec2 vUv;\r
void main() {\r
  vUv = uv;\r
  gl_Position = vec4(position, 0, 1);\r
}\r
\`;\r
\r
const fragmentShader = \`\r
precision highp float;\r
\r
uniform float uTime;\r
uniform vec3 uResolution;\r
uniform sampler2D uNoiseTexture;\r
uniform float uPupilSize;\r
uniform float uIrisWidth;\r
uniform float uGlowIntensity;\r
uniform float uIntensity;\r
uniform float uScale;\r
uniform float uNoiseScale;\r
uniform vec2 uMouse;\r
uniform float uPupilFollow;\r
uniform float uFlameSpeed;\r
uniform vec3 uEyeColor;\r
uniform vec3 uBgColor;\r
uniform bool uLightMode;\r
\r
void main() {\r
  vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution.xy) / uResolution.y;\r
  uv /= uScale;\r
  float ft = uTime * uFlameSpeed;\r
\r
  float polarRadius = length(uv) * 2.0;\r
  float polarAngle = (2.0 * atan(uv.x, uv.y)) / 6.28 * 0.3;\r
  vec2 polarUv = vec2(polarRadius, polarAngle);\r
\r
  vec4 noiseA = texture2D(uNoiseTexture, polarUv * vec2(0.2, 7.0) * uNoiseScale + vec2(-ft * 0.1, 0.0));\r
  vec4 noiseB = texture2D(uNoiseTexture, polarUv * vec2(0.3, 4.0) * uNoiseScale + vec2(-ft * 0.2, 0.0));\r
  vec4 noiseC = texture2D(uNoiseTexture, polarUv * vec2(0.1, 5.0) * uNoiseScale + vec2(-ft * 0.1, 0.0));\r
\r
  float distanceMask = 1.0 - length(uv);\r
\r
  // Inner ring\r
  float innerRing = clamp(-1.0 * ((distanceMask - 0.7) / uIrisWidth), 0.0, 1.0);\r
  innerRing = (innerRing * distanceMask - 0.2) / 0.28;\r
  innerRing += noiseA.r - 0.5;\r
  innerRing *= 1.3;\r
  innerRing = clamp(innerRing, 0.0, 1.0);\r
\r
  float outerRing = clamp(-1.0 * ((distanceMask - 0.5) / 0.2), 0.0, 1.0);\r
  outerRing = (outerRing * distanceMask - 0.1) / 0.38;\r
  outerRing += noiseC.r - 0.5;\r
  outerRing *= 1.3;\r
  outerRing = clamp(outerRing, 0.0, 1.0);\r
\r
  innerRing += outerRing;\r
\r
  // Inner eye\r
  float innerEye = distanceMask - 0.1 * 2.0;\r
  innerEye *= noiseB.r * 2.0;\r
\r
  // Pupil with cursor tracking\r
  vec2 pupilOffset = uMouse * uPupilFollow * 0.12;\r
  vec2 pupilUv = uv - pupilOffset;\r
  float pupil = 1.0 - length(pupilUv * vec2(9.0, 2.3));\r
  pupil *= uPupilSize;\r
  pupil = clamp(pupil, 0.0, 1.0);\r
  pupil /= 0.35;\r
\r
  // Outer eye\r
  float outerEyeGlow = 1.0 - length(uv * vec2(0.5, 1.5));\r
  outerEyeGlow = clamp(outerEyeGlow + 0.5, 0.0, 1.0);\r
  outerEyeGlow += noiseC.r - 0.5;\r
  float outerBgGlow = outerEyeGlow;\r
  outerEyeGlow = pow(outerEyeGlow, 2.0);\r
  outerEyeGlow += distanceMask;\r
  outerEyeGlow *= uGlowIntensity;\r
  outerEyeGlow = clamp(outerEyeGlow, 0.0, 1.0);\r
  outerEyeGlow *= pow(1.0 - distanceMask, 2.0) * 2.5;\r
\r
  // Outer eye bg glow\r
  outerBgGlow += distanceMask;\r
  outerBgGlow = pow(outerBgGlow, 0.5);\r
  outerBgGlow *= 0.15;\r
\r
  vec3 eyeEnergy = uEyeColor * uIntensity * clamp(max(innerRing + innerEye, outerEyeGlow + outerBgGlow) - pupil, 0.0, 3.0);\r
  vec3 color;\r
  if (uLightMode) {\r
    vec3 mapped = vec3(1.0) - exp(-max(eyeEnergy, vec3(0.0)) * 1.3);\r
    float energy = clamp(max(mapped.r, max(mapped.g, mapped.b)), 0.0, 1.0);\r
    vec3 hue = mapped / max(energy, 0.0001);\r
    hue = pow(clamp(hue, 0.0, 1.0), vec3(1.2));\r
    color = mix(uBgColor, hue, smoothstep(0.02, 0.82, energy) * 0.96);\r
  } else {\r
    color = eyeEnergy + uBgColor;\r
  }\r
\r
  gl_FragColor = vec4(color, 1.0);\r
}\r
\`;\r
\r
export default function EvilEye({\r
  eyeColor = '#FF6F37',\r
  intensity = 1.5,\r
  pupilSize = 0.6,\r
  irisWidth = 0.25,\r
  glowIntensity = 0.35,\r
  scale = 0.8,\r
  noiseScale = 1.0,\r
  pupilFollow = 1.0,\r
  flameSpeed = 1.0,\r
  backgroundColor = '#000000',\r
  lightMode = false\r
}: EvilEyeProps) {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
\r
  useEffect(() => {\r
    if (!containerRef.current) return;\r
    const container = containerRef.current;\r
    const renderer = new Renderer({ alpha: true, premultipliedAlpha: false });\r
    const gl = renderer.gl;\r
    gl.clearColor(0, 0, 0, 0);\r
\r
    const noiseData = generateNoiseTexture(256);\r
    const noiseTexture = new Texture(gl, {\r
      image: noiseData,\r
      width: 256,\r
      height: 256,\r
      generateMipmaps: false,\r
      flipY: false,\r
    });\r
    noiseTexture.minFilter = gl.LINEAR;\r
    noiseTexture.magFilter = gl.LINEAR;\r
    noiseTexture.wrapS = gl.REPEAT;\r
    noiseTexture.wrapT = gl.REPEAT;\r
\r
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };\r
\r
    function onMouseMove(e: MouseEvent) {\r
      const rect = container.getBoundingClientRect();\r
      mouse.tx = ((e.clientX - rect.left) / rect.width) * 2 - 1;\r
      mouse.ty = -(((e.clientY - rect.top) / rect.height) * 2 - 1);\r
    }\r
\r
    function onMouseLeave() {\r
      mouse.tx = 0;\r
      mouse.ty = 0;\r
    }\r
\r
    container.addEventListener('mousemove', onMouseMove);\r
    container.addEventListener('mouseleave', onMouseLeave);\r
\r
    let program: Program;\r
\r
    function resize() {\r
      renderer.setSize(container.offsetWidth, container.offsetHeight);\r
      if (program) {\r
        program.uniforms.uResolution.value = [gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height];\r
      }\r
    }\r
    window.addEventListener('resize', resize);\r
    resize();\r
\r
    const geometry = new Triangle(gl);\r
    program = new Program(gl, {\r
      vertex: vertexShader,\r
      fragment: fragmentShader,\r
      uniforms: {\r
        uTime: { value: 0 },\r
        uResolution: { value: [gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height] },\r
        uNoiseTexture: { value: noiseTexture },\r
        uPupilSize: { value: pupilSize },\r
        uIrisWidth: { value: irisWidth },\r
        uGlowIntensity: { value: glowIntensity },\r
        uIntensity: { value: intensity },\r
        uScale: { value: scale },\r
        uNoiseScale: { value: noiseScale },\r
        uMouse: { value: [0, 0] },\r
        uPupilFollow: { value: pupilFollow },\r
        uFlameSpeed: { value: flameSpeed },\r
        uEyeColor: { value: hexToVec3(eyeColor) },\r
        uBgColor: { value: hexToVec3(backgroundColor) },\r
        uLightMode: { value: lightMode }\r
      }\r
    });\r
\r
    const mesh = new Mesh(gl, { geometry, program });\r
    container.appendChild(gl.canvas);\r
\r
    let animationFrameId: number;\r
\r
    function update(time: number) {\r
      animationFrameId = requestAnimationFrame(update);\r
      mouse.x += (mouse.tx - mouse.x) * 0.05;\r
      mouse.y += (mouse.ty - mouse.y) * 0.05;\r
      program.uniforms.uMouse.value = [mouse.x, mouse.y];\r
      program.uniforms.uTime.value = time * 0.001;\r
      renderer.render({ scene: mesh });\r
    }\r
    animationFrameId = requestAnimationFrame(update);\r
\r
    return () => {\r
      cancelAnimationFrame(animationFrameId);\r
      window.removeEventListener('resize', resize);\r
      container.removeEventListener('mousemove', onMouseMove);\r
      container.removeEventListener('mouseleave', onMouseLeave);\r
      container.removeChild(gl.canvas);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
    };\r
  }, [eyeColor, intensity, pupilSize, irisWidth, glowIntensity, scale, noiseScale, pupilFollow, flameSpeed, backgroundColor, lightMode]);\r
\r
  return <div ref={containerRef} className="w-full h-full" />;\r
}\r
`,i={dependencies:"ogl",usage:`import EvilEye from './EvilEye';

<EvilEye
  eyeColor="#FF6F37"
  intensity={1.5}
  pupilSize={0.6}
  irisWidth={0.25}
  glowIntensity={0.35}
  scale={0.8}
  noiseScale={1.0}
  pupilFollow={1.0}
  flameSpeed={1.0}
  backgroundColor="#000000"
/>`,code:n,css:e,tailwind:r,tsCode:o,tsTailwind:t};export{i as evilEye};
